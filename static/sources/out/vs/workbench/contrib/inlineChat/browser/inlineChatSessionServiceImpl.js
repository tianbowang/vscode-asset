var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/editor/common/core/range", "vs/platform/telemetry/common/telemetry", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/base/common/lifecycle", "vs/editor/common/model/textModel", "vs/platform/log/common/log", "vs/base/common/iterator", "vs/base/common/async", "./inlineChatSession", "vs/editor/common/services/editorWorker", "vs/base/common/network", "vs/platform/instantiation/common/instantiation", "vs/base/common/uuid", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, event_1, inlineChat_1, range_1, telemetry_1, model_1, resolverService_1, lifecycle_1, textModel_1, log_1, iterator_1, async_1, inlineChatSession_1, editorWorker_1, network_1, instantiation_1, uuid_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatSessionServiceImpl = void 0;
    let InlineChatSessionServiceImpl = class InlineChatSessionServiceImpl {
        constructor(_inlineChatService, _telemetryService, _modelService, _textModelService, _editorWorkerService, _logService, _instaService, _textFileService) {
            this._inlineChatService = _inlineChatService;
            this._telemetryService = _telemetryService;
            this._modelService = _modelService;
            this._textModelService = _textModelService;
            this._editorWorkerService = _editorWorkerService;
            this._logService = _logService;
            this._instaService = _instaService;
            this._textFileService = _textFileService;
            this._onWillStartSession = new event_1.Emitter();
            this.onWillStartSession = this._onWillStartSession.event;
            this._onDidMoveSession = new event_1.Emitter();
            this.onDidMoveSession = this._onDidMoveSession.event;
            this._onDidEndSession = new event_1.Emitter();
            this.onDidEndSession = this._onDidEndSession.event;
            this._onDidStashSession = new event_1.Emitter();
            this.onDidStashSession = this._onDidStashSession.event;
            this._sessions = new Map();
            this._keyComputers = new Map();
            this._recordings = [];
        }
        dispose() {
            this._onWillStartSession.dispose();
            this._onDidEndSession.dispose();
            this._sessions.forEach(x => x.store.dispose());
            this._sessions.clear();
        }
        async createSession(editor, options, token) {
            const provider = iterator_1.Iterable.first(this._inlineChatService.getAllProvider());
            if (!provider) {
                this._logService.trace('[IE] NO provider found');
                return undefined;
            }
            this._onWillStartSession.fire(editor);
            const textModel = editor.getModel();
            const selection = editor.getSelection();
            let rawSession;
            try {
                rawSession = await (0, async_1.raceCancellation)(Promise.resolve(provider.prepareInlineChatSession(textModel, selection, token)), token);
            }
            catch (error) {
                this._logService.error('[IE] FAILED to prepare session', provider.debugName);
                this._logService.error(error);
                return undefined;
            }
            if (!rawSession) {
                this._logService.trace('[IE] NO session', provider.debugName);
                return undefined;
            }
            this._logService.trace('[IE] NEW session', provider.debugName);
            this._logService.trace(`[IE] creating NEW session for ${editor.getId()},  ${provider.debugName}`);
            const store = new lifecycle_1.DisposableStore();
            const id = (0, uuid_1.generateUuid)();
            const targetUri = textModel.uri;
            let textModelN;
            if (options.editMode === "preview" /* EditMode.Preview */) {
                // AI edits happen in a copy
                textModelN = store.add(this._modelService.createModel((0, textModel_1.createTextBufferFactoryFromSnapshot)(textModel.createSnapshot()), { languageId: textModel.getLanguageId(), onDidChange: event_1.Event.None }, targetUri.with({ scheme: network_1.Schemas.inMemory, query: new URLSearchParams({ id, 'inline-chat-textModelN': '' }).toString() }), true));
            }
            else {
                // AI edits happen in the actual model, keep a reference but make no copy
                store.add((await this._textModelService.createModelReference(textModel.uri)));
                textModelN = textModel;
            }
            // create: keep a snapshot of the "actual" model
            const textModel0 = store.add(this._modelService.createModel((0, textModel_1.createTextBufferFactoryFromSnapshot)(textModel.createSnapshot()), { languageId: textModel.getLanguageId(), onDidChange: event_1.Event.None }, targetUri.with({ scheme: network_1.Schemas.inMemory, query: new URLSearchParams({ id, 'inline-chat-textModel0': '' }).toString() }), true));
            // untitled documents are special
            if (targetUri.scheme === network_1.Schemas.untitled) {
                const untitledTextModel = this._textFileService.untitled.get(targetUri);
                if (untitledTextModel) {
                    store.add(untitledTextModel.onDidChangeDirty(() => {
                        if (!untitledTextModel.isDirty()) {
                            this.releaseSession(session);
                        }
                    }));
                }
            }
            let wholeRange = options.wholeRange;
            if (!wholeRange) {
                wholeRange = rawSession.wholeRange ? range_1.Range.lift(rawSession.wholeRange) : editor.getSelection();
            }
            const session = new inlineChatSession_1.Session(options.editMode, targetUri, textModel0, textModelN, provider, rawSession, store.add(new inlineChatSession_1.SessionWholeRange(textModelN, wholeRange)), store.add(new inlineChatSession_1.HunkData(this._editorWorkerService, textModel0, textModelN)));
            // store: key -> session
            const key = this._key(editor, session.targetUri);
            if (this._sessions.has(key)) {
                store.dispose();
                throw new Error(`Session already stored for ${key}`);
            }
            this._sessions.set(key, { session, editor, store });
            return session;
        }
        moveSession(session, target) {
            const newKey = this._key(target, session.targetUri);
            const existing = this._sessions.get(newKey);
            if (existing) {
                if (existing.session !== session) {
                    throw new Error(`Cannot move session because the target editor already/still has one`);
                }
                else {
                    // noop
                    return;
                }
            }
            let found = false;
            for (const [oldKey, data] of this._sessions) {
                if (data.session === session) {
                    found = true;
                    this._sessions.delete(oldKey);
                    this._sessions.set(newKey, { ...data, editor: target });
                    this._logService.trace(`[IE] did MOVE session for ${data.editor.getId()} to NEW EDITOR ${target.getId()}, ${session.provider.debugName}`);
                    this._onDidMoveSession.fire({ session, editor: target });
                    break;
                }
            }
            if (!found) {
                throw new Error(`Cannot move session because it is not stored`);
            }
        }
        releaseSession(session) {
            let data;
            // cleanup
            for (const [key, value] of this._sessions) {
                if (value.session === session) {
                    data = value;
                    value.store.dispose();
                    this._sessions.delete(key);
                    this._logService.trace(`[IE] did RELEASED session for ${value.editor.getId()}, ${session.provider.debugName}`);
                    break;
                }
            }
            if (!data) {
                // double remove
                return;
            }
            this._keepRecording(session);
            this._telemetryService.publicLog2('interactiveEditor/session', session.asTelemetryData());
            this._onDidEndSession.fire({ editor: data.editor, session });
        }
        stashSession(session, editor, undoCancelEdits) {
            this._keepRecording(session);
            const result = this._instaService.createInstance(inlineChatSession_1.StashedSession, editor, session, undoCancelEdits);
            this._onDidStashSession.fire({ editor, session });
            this._logService.trace(`[IE] did STASH session for ${editor.getId()}, ${session.provider.debugName}`);
            return result;
        }
        getCodeEditor(session) {
            for (const [, data] of this._sessions) {
                if (data.session === session) {
                    return data.editor;
                }
            }
            throw new Error('session not found');
        }
        getSession(editor, uri) {
            const key = this._key(editor, uri);
            return this._sessions.get(key)?.session;
        }
        _key(editor, uri) {
            const item = this._keyComputers.get(uri.scheme);
            return item
                ? item.getComparisonKey(editor, uri)
                : `${editor.getId()}@${uri.toString()}`;
        }
        registerSessionKeyComputer(scheme, value) {
            this._keyComputers.set(scheme, value);
            return (0, lifecycle_1.toDisposable)(() => this._keyComputers.delete(scheme));
        }
        // --- debug
        _keepRecording(session) {
            const newLen = this._recordings.unshift(session.asRecording());
            if (newLen > 5) {
                this._recordings.pop();
            }
        }
        recordings() {
            return this._recordings;
        }
    };
    exports.InlineChatSessionServiceImpl = InlineChatSessionServiceImpl;
    exports.InlineChatSessionServiceImpl = InlineChatSessionServiceImpl = __decorate([
        __param(0, inlineChat_1.IInlineChatService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, model_1.IModelService),
        __param(3, resolverService_1.ITextModelService),
        __param(4, editorWorker_1.IEditorWorkerService),
        __param(5, log_1.ILogService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, textfiles_1.ITextFileService)
    ], InlineChatSessionServiceImpl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFNlc3Npb25TZXJ2aWNlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvaW5saW5lQ2hhdC9icm93c2VyL2lubGluZUNoYXRTZXNzaW9uU2VydmljZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQWlDTyxJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE0QjtRQW9CeEMsWUFDcUIsa0JBQXVELEVBQ3hELGlCQUFxRCxFQUN6RCxhQUE2QyxFQUN6QyxpQkFBcUQsRUFDbEQsb0JBQTJELEVBQ3BFLFdBQXlDLEVBQy9CLGFBQXFELEVBQzFELGdCQUFtRDtZQVBoQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3ZDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDeEMsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDeEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNqQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ25ELGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ2Qsa0JBQWEsR0FBYixhQUFhLENBQXVCO1lBQ3pDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUF4QnJELHdCQUFtQixHQUFHLElBQUksZUFBTyxFQUFxQixDQUFDO1lBQy9ELHVCQUFrQixHQUE2QixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBRXRFLHNCQUFpQixHQUFHLElBQUksZUFBTyxFQUEyQixDQUFDO1lBQ25FLHFCQUFnQixHQUFtQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBRXhFLHFCQUFnQixHQUFHLElBQUksZUFBTyxFQUEyQixDQUFDO1lBQ2xFLG9CQUFlLEdBQW1DLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7WUFFdEUsdUJBQWtC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
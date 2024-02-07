/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/nls", "vs/platform/configuration/common/configuration", "./inlineChatSessionService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/iterator", "vs/base/common/network", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/base/common/strings", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/log/common/log", "vs/base/common/event", "vs/workbench/contrib/inlineChat/browser/inlineChatController"], function (require, exports, async_1, lifecycle_1, editorBrowser_1, nls_1, configuration_1, inlineChatSessionService_1, editorGroupsService_1, editorService_1, filesConfigurationService_1, textfiles_1, iterator_1, network_1, notebookCommon_1, notebookBrowser_1, strings_1, workingCopyFileService_1, log_1, event_1, inlineChatController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatSavingServiceImpl = void 0;
    let InlineChatSavingServiceImpl = class InlineChatSavingServiceImpl {
        constructor(_fileConfigService, _editorGroupService, _textFileService, _editorService, _inlineChatSessionService, _configService, _workingCopyFileService, _logService) {
            this._fileConfigService = _fileConfigService;
            this._editorGroupService = _editorGroupService;
            this._textFileService = _textFileService;
            this._editorService = _editorService;
            this._inlineChatSessionService = _inlineChatSessionService;
            this._configService = _configService;
            this._workingCopyFileService = _workingCopyFileService;
            this._logService = _logService;
            this._store = new lifecycle_1.DisposableStore();
            this._saveParticipant = this._store.add(new lifecycle_1.MutableDisposable());
            this._sessionData = new Map();
            this._store.add(event_1.Event.any(_inlineChatSessionService.onDidEndSession, _inlineChatSessionService.onDidStashSession)(e => {
                this._sessionData.get(e.session)?.dispose();
            }));
        }
        dispose() {
            this._store.dispose();
            (0, lifecycle_1.dispose)(this._sessionData.values());
        }
        markChanged(session) {
            if (!this._sessionData.has(session)) {
                let uri = session.targetUri;
                // notebooks: use the notebook-uri because saving happens on the notebook-level
                if (uri.scheme === network_1.Schemas.vscodeNotebookCell) {
                    const data = notebookCommon_1.CellUri.parse(uri);
                    if (!data) {
                        return;
                    }
                    uri = data?.notebook;
                }
                if (this._sessionData.size === 0) {
                    this._installSaveParticpant();
                }
                const saveConfigOverride = this._fileConfigService.disableAutoSave(uri);
                this._sessionData.set(session, {
                    resourceUri: uri,
                    groupCandidate: this._editorGroupService.activeGroup,
                    session,
                    dispose: () => {
                        saveConfigOverride.dispose();
                        this._sessionData.delete(session);
                        if (this._sessionData.size === 0) {
                            this._saveParticipant.clear();
                        }
                    }
                });
            }
        }
        _installSaveParticpant() {
            const queue = new async_1.Queue();
            const d1 = this._textFileService.files.addSaveParticipant({
                participate: (model, context, progress, token) => {
                    return queue.queue(() => this._participate(model.textEditorModel?.uri, context.reason, progress, token));
                }
            });
            const d2 = this._workingCopyFileService.addSaveParticipant({
                participate: (workingCopy, env, progress, token) => {
                    return queue.queue(() => this._participate(workingCopy.resource, env.reason, progress, token));
                }
            });
            this._saveParticipant.value = (0, lifecycle_1.combinedDisposable)(d1, d2, queue);
        }
        async _participate(uri, reason, progress, token) {
            if (reason !== 1 /* SaveReason.EXPLICIT */) {
                // all saves that we are concerned about are explicit
                // because we have disabled auto-save for them
                return;
            }
            if (!this._configService.getValue("inlineChat.acceptedOrDiscardBeforeSave" /* InlineChatConfigKeys.AcceptedOrDiscardBeforeSave */)) {
                // disabled
                return;
            }
            const sessions = new Map();
            for (const [session, data] of this._sessionData) {
                if (uri?.toString() === data.resourceUri.toString()) {
                    sessions.set(session, data);
                }
            }
            if (sessions.size === 0) {
                return;
            }
            progress.report({
                message: sessions.size === 1
                    ? (0, nls_1.localize)('inlineChat', "Waiting for Inline Chat changes to be Accepted or Discarded...")
                    : (0, nls_1.localize)('inlineChat.N', "Waiting for Inline Chat changes in {0} editors to be Accepted or Discarded...", sessions.size)
            });
            // reveal all sessions in order and also show dangling sessions
            const { groups, orphans } = this._getGroupsAndOrphans(sessions.values());
            const editorsOpenedAndSessionsEnded = this._openAndWait(groups, token).then(() => {
                if (token.isCancellationRequested) {
                    return;
                }
                return this._openAndWait(iterator_1.Iterable.map(orphans, s => [this._editorGroupService.activeGroup, s]), token);
            });
            // fallback: resolve when all sessions for this model have been resolved. this is independent of the editor opening
            const allSessionsEnded = this._whenSessionsEnded(iterator_1.Iterable.concat(groups.map(tuple => tuple[1]), orphans), token);
            await Promise.race([allSessionsEnded, editorsOpenedAndSessionsEnded]);
        }
        _getGroupsAndOrphans(sessions) {
            const groupByEditor = new Map();
            for (const group of this._editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                const candidate = group.activeEditorPane?.getControl();
                if ((0, editorBrowser_1.isCodeEditor)(candidate)) {
                    groupByEditor.set(candidate, group);
                }
            }
            const groups = [];
            const orphans = new Set();
            for (const data of sessions) {
                const editor = this._inlineChatSessionService.getCodeEditor(data.session);
                const group = groupByEditor.get(editor);
                if (group) {
                    // there is only one session per group because all sessions have the same model
                    // because we save one file.
                    groups.push([group, data]);
                }
                else if (this._editorGroupService.groups.includes(data.groupCandidate)) {
                    // the group candidate is still there. use it
                    groups.push([data.groupCandidate, data]);
                }
                else {
                    orphans.add(data);
                }
            }
            return { groups, orphans };
        }
        async _openAndWait(groups, token) {
            const dataByGroup = new Map();
            for (const [group, data] of groups) {
                let array = dataByGroup.get(group);
                if (!array) {
                    array = [];
                    dataByGroup.set(group, array);
                }
                array.push(data);
            }
            for (const [group, array] of dataByGroup) {
                if (token.isCancellationRequested) {
                    break;
                }
                array.sort((a, b) => (0, strings_1.compare)(a.session.targetUri.toString(), b.session.targetUri.toString()));
                for (const data of array) {
                    const input = { resource: data.resourceUri };
                    const pane = await this._editorService.openEditor(input, group);
                    let editor;
                    if (data.session.targetUri.scheme === network_1.Schemas.vscodeNotebookCell) {
                        const notebookEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(pane);
                        const uriData = notebookCommon_1.CellUri.parse(data.session.targetUri);
                        if (notebookEditor && notebookEditor.hasModel() && uriData) {
                            const cell = notebookEditor.getCellByHandle(uriData.handle);
                            if (cell) {
                                await notebookEditor.revealRangeInCenterIfOutsideViewportAsync(cell, data.session.wholeRange.value);
                            }
                            const tuple = notebookEditor.codeEditors.find(tuple => tuple[1].getModel()?.uri.toString() === data.session.targetUri.toString());
                            editor = tuple?.[1];
                        }
                    }
                    else {
                        if ((0, editorBrowser_1.isCodeEditor)(pane?.getControl())) {
                            editor = pane.getControl();
                        }
                    }
                    if (!editor) {
                        // PANIC
                        break;
                    }
                    this._inlineChatSessionService.moveSession(data.session, editor);
                    inlineChatController_1.InlineChatController.get(editor)?.showSaveHint();
                    this._logService.info('WAIT for session to end', editor.getId(), data.session.targetUri.toString());
                    await this._whenSessionsEnded(iterator_1.Iterable.single(data), token);
                }
            }
        }
        async _whenSessionsEnded(iterable, token) {
            const sessions = new Map();
            for (const item of iterable) {
                sessions.set(item.session, item);
            }
            if (sessions.size === 0) {
                // nothing to do
                return;
            }
            let listener;
            const whenEnded = new Promise(resolve => {
                listener = event_1.Event.any(this._inlineChatSessionService.onDidEndSession, this._inlineChatSessionService.onDidStashSession)(e => {
                    const data = sessions.get(e.session);
                    if (data) {
                        data.dispose();
                        sessions.delete(e.session);
                        if (sessions.size === 0) {
                            resolve(); // DONE, release waiting
                        }
                    }
                });
            });
            try {
                await (0, async_1.raceCancellation)(whenEnded, token);
            }
            finally {
                listener?.dispose();
            }
        }
    };
    exports.InlineChatSavingServiceImpl = InlineChatSavingServiceImpl;
    exports.InlineChatSavingServiceImpl = InlineChatSavingServiceImpl = __decorate([
        __param(0, filesConfigurationService_1.IFilesConfigurationService),
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, textfiles_1.ITextFileService),
        __param(3, editorService_1.IEditorService),
        __param(4, inlineChatSessionService_1.IInlineChatSessionService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, workingCopyFileService_1.IWorkingCopyFileService),
        __param(7, log_1.ILogService)
    ], InlineChatSavingServiceImpl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFNhdmluZ1NlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pbmxpbmVDaGF0L2Jyb3dzZXIvaW5saW5lQ2hhdFNhdmluZ1NlcnZpY2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFDekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBMkI7UUFRdkMsWUFDNkIsa0JBQStELEVBQ3JFLG1CQUEwRCxFQUM5RCxnQkFBbUQsRUFDckQsY0FBK0MsRUFDcEMseUJBQXFFLEVBQ3pFLGNBQXNELEVBQ3BELHVCQUFpRSxFQUM3RSxXQUF5QztZQVBULHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBNEI7WUFDcEQsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUM3QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ3BDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUNuQiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1lBQ3hELG1CQUFjLEdBQWQsY0FBYyxDQUF1QjtZQUNuQyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1lBQzVELGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBWnRDLFdBQU0sR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUMvQixxQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztZQUM1RCxpQkFBWSxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1lBWS9ELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsZUFBZSxFQUFFLHlCQUF5QixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVB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
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
define(["require", "exports", "vs/base/common/event", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/editor/common/core/editOperation", "vs/editor/common/diff/rangeMapping", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/language", "vs/base/common/map", "vs/base/common/network", "vs/base/common/resources", "./inlineChatSessionService", "vs/editor/common/services/editorWorker", "vs/workbench/contrib/inlineChat/browser/utils", "vs/base/common/arrays", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/log/common/log"], function (require, exports, event_1, bulkEditService_1, inlineChat_1, range_1, textModel_1, errorMessage_1, errors_1, editOperation_1, rangeMapping_1, textfiles_1, language_1, map_1, network_1, resources_1, inlineChatSessionService_1, editorWorker_1, utils_1, arrays_1, iterator_1, lifecycle_1, contextkey_1, log_1) {
    "use strict";
    var HunkData_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HunkState = exports.HunkData = exports.StashedSession = exports.ReplyResponse = exports.ErrorResponse = exports.EmptyResponse = exports.SessionExchange = exports.SessionPrompt = exports.Session = exports.SessionWholeRange = exports.ExpansionState = void 0;
    var ExpansionState;
    (function (ExpansionState) {
        ExpansionState["EXPANDED"] = "expanded";
        ExpansionState["CROPPED"] = "cropped";
        ExpansionState["NOT_CROPPED"] = "not_cropped";
    })(ExpansionState || (exports.ExpansionState = ExpansionState = {}));
    class SessionWholeRange {
        static { this._options = textModel_1.ModelDecorationOptions.register({ description: 'inlineChat/session/wholeRange' }); }
        constructor(_textModel, wholeRange) {
            this._textModel = _textModel;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._decorationIds = [];
            this._decorationIds = _textModel.deltaDecorations([], [{ range: wholeRange, options: SessionWholeRange._options }]);
        }
        dispose() {
            this._onDidChange.dispose();
            if (!this._textModel.isDisposed()) {
                this._textModel.deltaDecorations(this._decorationIds, []);
            }
        }
        trackEdits(edits) {
            const newDeco = [];
            for (const edit of edits) {
                newDeco.push({ range: edit.range, options: SessionWholeRange._options });
            }
            this._decorationIds.push(...this._textModel.deltaDecorations([], newDeco));
            this._onDidChange.fire(this);
        }
        fixup(changes) {
            const newDeco = [];
            for (const { modified } of changes) {
                const modifiedRange = modified.isEmpty
                    ? new range_1.Range(modified.startLineNumber, 1, modified.startLineNumber, this._textModel.getLineLength(modified.startLineNumber))
                    : new range_1.Range(modified.startLineNumber, 1, modified.endLineNumberExclusive - 1, this._textModel.getLineLength(modified.endLineNumberExclusive - 1));
                newDeco.push({ range: modifiedRange, options: SessionWholeRange._options });
            }
            const [first, ...rest] = this._decorationIds; // first is the original whole range
            const newIds = this._textModel.deltaDecorations(rest, newDeco);
            this._decorationIds = [first].concat(newIds);
            this._onDidChange.fire(this);
        }
        get trackedInitialRange() {
            const [first] = this._decorationIds;
            return this._textModel.getDecorationRange(first) ?? new range_1.Range(1, 1, 1, 1);
        }
        get value() {
            let result;
            for (const id of this._decorationIds) {
                const range = this._textModel.getDecorationRange(id);
                if (range) {
                    if (!result) {
                        result = range;
                    }
                    else {
                        result = range_1.Range.plusRange(result, range);
                    }
                }
            }
            return result;
        }
    }
    exports.SessionWholeRange = SessionWholeRange;
    class Session {
        constructor(editMode, 
        /**
         * The URI of the document which is being EditorEdit
         */
        targetUri, 
        /**
         * A copy of the document at the time the session was started
         */
        textModel0, 
        /**
         * The document into which AI edits went, when live this is `targetUri` otherwise it is a temporary document
         */
        textModelN, provider, session, wholeRange, hunkData) {
            this.editMode = editMode;
            this.targetUri = targetUri;
            this.textModel0 = textModel0;
            this.textModelN = textModelN;
            this.provider = provider;
            this.session = session;
            this.wholeRange = wholeRange;
            this.hunkData = hunkData;
            this._isUnstashed = false;
            this._exchange = [];
            this._startTime = new Date();
            this.textModelNAltVersion = textModelN.getAlternativeVersionId();
            this._teldata = {
                extension: provider.debugName,
                startTime: this._startTime.toISOString(),
                edits: false,
                finishedByEdit: false,
                rounds: '',
                undos: '',
                editMode,
                unstashed: 0
            };
        }
        addInput(input) {
            this._lastInput = input;
        }
        get lastInput() {
            return this._lastInput;
        }
        get isUnstashed() {
            return this._isUnstashed;
        }
        markUnstashed() {
            this._teldata.unstashed += 1;
            this._isUnstashed = true;
        }
        get lastExpansionState() {
            return this._lastExpansionState;
        }
        set lastExpansionState(state) {
            this._lastExpansionState = state;
        }
        get textModelNSnapshotAltVersion() {
            return this._textModelNSnapshotAltVersion;
        }
        createSnapshot() {
            this._textModelNSnapshotAltVersion = this.textModelN.getAlternativeVersionId();
        }
        addExchange(exchange) {
            this._isUnstashed = false;
            const newLen = this._exchange.push(exchange);
            this._teldata.rounds += `${newLen}|`;
        }
        get exchanges() {
            return this._exchange;
        }
        get lastExchange() {
            return this._exchange[this._exchange.length - 1];
        }
        get hasChangedText() {
            return !this.textModel0.equalsTextBuffer(this.textModelN.getTextBuffer());
        }
        asChangedText(changes) {
            if (changes.length === 0) {
                return undefined;
            }
            let startLine = Number.MAX_VALUE;
            let endLine = Number.MIN_VALUE;
            for (const change of changes) {
                startLine = Math.min(startLine, change.modified.startLineNumber);
                endLine = Math.max(endLine, change.modified.endLineNumberExclusive);
            }
            return this.textModelN.getValueInRange(new range_1.Range(startLine, 1, endLine, Number.MAX_VALUE));
        }
        recordExternalEditOccurred(didFinish) {
            this._teldata.edits = true;
            this._teldata.finishedByEdit = didFinish;
        }
        asTelemetryData() {
            return {
                ...this._teldata,
                endTime: new Date().toISOString(),
            };
        }
        asRecording() {
            const result = {
                session: this.session,
                when: this._startTime,
                exchanges: []
            };
            for (const exchange of this._exchange) {
                const response = exchange.response;
                if (response instanceof ReplyResponse) {
                    result.exchanges.push({ prompt: exchange.prompt.value, res: response.raw });
                }
            }
            return result;
        }
    }
    exports.Session = Session;
    class SessionPrompt {
        constructor(value) {
            this.value = value;
            this._attempt = 0;
        }
        get attempt() {
            return this._attempt;
        }
        retry() {
            const result = new SessionPrompt(this.value);
            result._attempt = this._attempt + 1;
            return result;
        }
    }
    exports.SessionPrompt = SessionPrompt;
    class SessionExchange {
        constructor(prompt, response) {
            this.prompt = prompt;
            this.response = response;
        }
    }
    exports.SessionExchange = SessionExchange;
    class EmptyResponse {
    }
    exports.EmptyResponse = EmptyResponse;
    class ErrorResponse {
        constructor(error) {
            this.error = error;
            this.message = (0, errorMessage_1.toErrorMessage)(error, false);
            this.isCancellation = (0, errors_1.isCancellationError)(error);
        }
    }
    exports.ErrorResponse = ErrorResponse;
    let ReplyResponse = class ReplyResponse {
        constructor(raw, mdContent, localUri, modelAltVersionId, progressEdits, requestId, _textFileService, _languageService) {
            this.raw = raw;
            this.mdContent = mdContent;
            this.modelAltVersionId = modelAltVersionId;
            this.requestId = requestId;
            this._textFileService = _textFileService;
            this._languageService = _languageService;
            this.allLocalEdits = [];
            const editsMap = new map_1.ResourceMap();
            editsMap.set(localUri, [...progressEdits]);
            if (raw.type === "editorEdit" /* InlineChatResponseType.EditorEdit */) {
                //
                editsMap.get(localUri).push(raw.edits);
            }
            else if (raw.type === "bulkEdit" /* InlineChatResponseType.BulkEdit */) {
                //
                const edits = bulkEditService_1.ResourceEdit.convert(raw.edits);
                for (const edit of edits) {
                    if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                        if (edit.newResource && !edit.oldResource) {
                            editsMap.set(edit.newResource, []);
                            if (edit.options.contents) {
                                console.warn('CONTENT not supported');
                            }
                        }
                    }
                    else if (edit instanceof bulkEditService_1.ResourceTextEdit) {
                        //
                        const array = editsMap.get(edit.resource);
                        if (array) {
                            array.push([edit.textEdit]);
                        }
                        else {
                            editsMap.set(edit.resource, [[edit.textEdit]]);
                        }
                    }
                }
            }
            let needsWorkspaceEdit = false;
            for (const [uri, edits] of editsMap) {
                const flatEdits = edits.flat();
                if (flatEdits.length === 0) {
                    editsMap.delete(uri);
                    continue;
                }
                const isLocalUri = (0, resources_1.isEqual)(uri, localUri);
                needsWorkspaceEdit = needsWorkspaceEdit || (uri.scheme !== network_1.Schemas.untitled && !isLocalUri);
                if (uri.scheme === network_1.Schemas.untitled && !isLocalUri && !this.untitledTextModel) { //TODO@jrieken the first untitled model WINS
                    const langSelection = this._languageService.createByFilepathOrFirstLine(uri, undefined);
                    const untitledTextModel = this._textFileService.untitled.create({
                        associatedResource: uri,
                        languageId: langSelection.languageId
                    });
                    this.untitledTextModel = untitledTextModel;
                    untitledTextModel.resolve().then(async () => {
                        const model = untitledTextModel.textEditorModel;
                        model.applyEdits(flatEdits.map(edit => editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text)));
                    });
                }
            }
            this.allLocalEdits = editsMap.get(localUri) ?? [];
            if (needsWorkspaceEdit) {
                const workspaceEdits = [];
                for (const [uri, edits] of editsMap) {
                    for (const edit of edits.flat()) {
                        workspaceEdits.push({ resource: uri, textEdit: edit, versionId: undefined });
                    }
                }
                this.workspaceEdit = { edits: workspaceEdits };
            }
            const hasEdits = editsMap.size > 0;
            const hasMessage = mdContent.value.length > 0;
            if (hasEdits && hasMessage) {
                this.responseType = "mixed" /* InlineChatResponseTypes.Mixed */;
            }
            else if (hasEdits) {
                this.responseType = "onlyEdits" /* InlineChatResponseTypes.OnlyEdits */;
            }
            else if (hasMessage) {
                this.responseType = "onlyMessages" /* InlineChatResponseTypes.OnlyMessages */;
            }
            else {
                this.responseType = "empty" /* InlineChatResponseTypes.Empty */;
            }
        }
    };
    exports.ReplyResponse = ReplyResponse;
    exports.ReplyResponse = ReplyResponse = __decorate([
        __param(6, textfiles_1.ITextFileService),
        __param(7, language_1.ILanguageService)
    ], ReplyResponse);
    let StashedSession = class StashedSession {
        constructor(editor, session, _undoCancelEdits, contextKeyService, _sessionService, _logService) {
            this._undoCancelEdits = _undoCancelEdits;
            this._sessionService = _sessionService;
            this._logService = _logService;
            this._ctxHasStashedSession = inlineChat_1.CTX_INLINE_CHAT_HAS_STASHED_SESSION.bindTo(contextKeyService);
            // keep session for a little bit, only release when user continues to work (type, move cursor, etc.)
            this._session = session;
            this._ctxHasStashedSession.set(true);
            this._listener = event_1.Event.once(event_1.Event.any(editor.onDidChangeCursorSelection, editor.onDidChangeModelContent, editor.onDidChangeModel))(() => {
                this._session = undefined;
                this._sessionService.releaseSession(session);
                this._ctxHasStashedSession.reset();
            });
        }
        dispose() {
            this._listener.dispose();
            this._ctxHasStashedSession.reset();
            if (this._session) {
                this._sessionService.releaseSession(this._session);
            }
        }
        unstash() {
            if (!this._session) {
                return undefined;
            }
            this._listener.dispose();
            const result = this._session;
            result.markUnstashed();
            result.hunkData.ignoreTextModelNChanges = true;
            result.textModelN.pushEditOperations(null, this._undoCancelEdits, () => null);
            result.hunkData.ignoreTextModelNChanges = false;
            this._session = undefined;
            this._logService.debug('[IE] Unstashed session');
            return result;
        }
    };
    exports.StashedSession = StashedSession;
    exports.StashedSession = StashedSession = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, inlineChatSessionService_1.IInlineChatSessionService),
        __param(5, log_1.ILogService)
    ], StashedSession);
    // ---
    let HunkData = class HunkData {
        static { HunkData_1 = this; }
        static { this._HUNK_TRACKED_RANGE = textModel_1.ModelDecorationOptions.register({
            description: 'inline-chat-hunk-tracked-range',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */
        }); }
        static { this._HUNK_THRESHOLD = 8; }
        constructor(_editorWorkerService, _textModel0, _textModelN) {
            this._editorWorkerService = _editorWorkerService;
            this._textModel0 = _textModel0;
            this._textModelN = _textModelN;
            this._store = new lifecycle_1.DisposableStore();
            this._data = new Map();
            this._ignoreChanges = false;
            this._store.add(_textModelN.onDidChangeContent(e => {
                if (!this._ignoreChanges) {
                    this._mirrorChanges(e);
                }
            }));
        }
        dispose() {
            if (!this._textModelN.isDisposed()) {
                this._textModelN.changeDecorations(accessor => {
                    for (const { textModelNDecorations } of this._data.values()) {
                        textModelNDecorations.forEach(accessor.removeDecoration, accessor);
                    }
                });
            }
            if (!this._textModel0.isDisposed()) {
                this._textModel0.changeDecorations(accessor => {
                    for (const { textModel0Decorations } of this._data.values()) {
                        textModel0Decorations.forEach(accessor.removeDecoration, accessor);
                    }
                });
            }
            this._data.clear();
            this._store.dispose();
        }
        set ignoreTextModelNChanges(value) {
            this._ignoreChanges = value;
        }
        get ignoreTextModelNChanges() {
            return this._ignoreChanges;
        }
        _mirrorChanges(event) {
            // mirror textModelN changes to textModel0 execept for those that
            // overlap with a hunk
            const hunkRanges = [];
            const ranges0 = [];
            for (const { textModelNDecorations, textModel0Decorations, state } of this._data.values()) {
                if (state === 0 /* HunkState.Pending */) {
                    // pending means the hunk's changes aren't "sync'd" yet
                    for (let i = 1; i < textModelNDecorations.length; i++) {
                        const rangeN = this._textModelN.getDecorationRange(textModelNDecorations[i]);
                        const range0 = this._textModel0.getDecorationRange(textModel0Decorations[i]);
                        if (rangeN && range0) {
                            hunkRanges.push({ rangeN, range0 });
                        }
                    }
                }
                else if (state === 1 /* HunkState.Accepted */) {
                    // accepted means the hunk's changes are also in textModel0
                    for (let i = 1; i < textModel0Decorations.length; i++) {
                        const range = this._textModel0.getDecorationRange(textModel0Decorations[i]);
                        if (range) {
                            ranges0.push(range);
                        }
                    }
                }
            }
            hunkRanges.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.rangeN, b.rangeN));
            ranges0.sort(range_1.Range.compareRangesUsingStarts);
            const edits = [];
            for (const change of event.changes) {
                let isOverlapping = false;
                let pendingChangesLen = 0;
                for (const { rangeN, range0 } of hunkRanges) {
                    if (rangeN.getEndPosition().isBefore(range_1.Range.getStartPosition(change.range))) {
                        // pending hunk _before_ this change. When projecting into textModel0 we need to
                        // subtract that. Because diffing is relaxed it might include changes that are not
                        // actual insertions/deletions. Therefore we need to take the length of the original
                        // range into account.
                        pendingChangesLen += this._textModelN.getValueLengthInRange(rangeN);
                        pendingChangesLen -= this._textModel0.getValueLengthInRange(range0);
                    }
                    else if (range_1.Range.areIntersectingOrTouching(rangeN, change.range)) {
                        isOverlapping = true;
                        break;
                    }
                    else {
                        // hunks past this change aren't relevant
                        break;
                    }
                }
                if (isOverlapping) {
                    // hunk overlaps, it grew
                    continue;
                }
                const offset0 = change.rangeOffset - pendingChangesLen;
                const start0 = this._textModel0.getPositionAt(offset0);
                let acceptedChangesLen = 0;
                for (const range of ranges0) {
                    if (range.getEndPosition().isBefore(start0)) {
                        // accepted hunk _before_ this projected change. When projecting into textModel0
                        // we need to add that
                        acceptedChangesLen += this._textModel0.getValueLengthInRange(range);
                    }
                }
                const start = this._textModel0.getPositionAt(offset0 + acceptedChangesLen);
                const end = this._textModel0.getPositionAt(offset0 + acceptedChangesLen + change.rangeLength);
                edits.push(editOperation_1.EditOperation.replace(range_1.Range.fromPositions(start, end), change.text));
            }
            this._textModel0.pushEditOperations(null, edits, () => null);
        }
        async recompute() {
            const diff = await this._editorWorkerService.computeDiff(this._textModel0.uri, this._textModelN.uri, { ignoreTrimWhitespace: false, maxComputationTimeMs: Number.MAX_SAFE_INTEGER, computeMoves: false }, 'advanced');
            if (!diff || diff.changes.length === 0) {
                // return new HunkData([], session);
                return;
            }
            // merge changes neighboring changes
            const mergedChanges = [diff.changes[0]];
            for (let i = 1; i < diff.changes.length; i++) {
                const lastChange = mergedChanges[mergedChanges.length - 1];
                const thisChange = diff.changes[i];
                if (thisChange.modified.startLineNumber - lastChange.modified.endLineNumberExclusive <= HunkData_1._HUNK_THRESHOLD) {
                    mergedChanges[mergedChanges.length - 1] = new rangeMapping_1.DetailedLineRangeMapping(lastChange.original.join(thisChange.original), lastChange.modified.join(thisChange.modified), (lastChange.innerChanges ?? []).concat(thisChange.innerChanges ?? []));
                }
                else {
                    mergedChanges.push(thisChange);
                }
            }
            const hunks = mergedChanges.map(change => new RawHunk(change.original, change.modified, change.innerChanges ?? []));
            this._textModelN.changeDecorations(accessorN => {
                this._textModel0.changeDecorations(accessor0 => {
                    // clean up old decorations
                    for (const { textModelNDecorations, textModel0Decorations } of this._data.values()) {
                        textModelNDecorations.forEach(accessorN.removeDecoration, accessorN);
                        textModel0Decorations.forEach(accessor0.removeDecoration, accessor0);
                    }
                    this._data.clear();
                    // add new decorations
                    for (const hunk of hunks) {
                        const textModelNDecorations = [];
                        const textModel0Decorations = [];
                        textModelNDecorations.push(accessorN.addDecoration((0, utils_1.asRange)(hunk.modified, this._textModelN), HunkData_1._HUNK_TRACKED_RANGE));
                        textModel0Decorations.push(accessor0.addDecoration((0, utils_1.asRange)(hunk.original, this._textModel0), HunkData_1._HUNK_TRACKED_RANGE));
                        for (const change of hunk.changes) {
                            textModelNDecorations.push(accessorN.addDecoration(change.modifiedRange, HunkData_1._HUNK_TRACKED_RANGE));
                            textModel0Decorations.push(accessor0.addDecoration(change.originalRange, HunkData_1._HUNK_TRACKED_RANGE));
                        }
                        this._data.set(hunk, {
                            textModelNDecorations,
                            textModel0Decorations,
                            state: 0 /* HunkState.Pending */
                        });
                    }
                });
            });
        }
        get size() {
            return this._data.size;
        }
        get pending() {
            return iterator_1.Iterable.reduce(this._data.values(), (r, { state }) => r + (state === 0 /* HunkState.Pending */ ? 1 : 0), 0);
        }
        _discardEdits(item) {
            const edits = [];
            const rangesN = item.getRangesN();
            const ranges0 = item.getRanges0();
            for (let i = 1; i < rangesN.length; i++) {
                const modifiedRange = rangesN[i];
                const originalValue = this._textModel0.getValueInRange(ranges0[i]);
                edits.push(editOperation_1.EditOperation.replace(modifiedRange, originalValue));
            }
            return edits;
        }
        discardAll() {
            const edits = [];
            for (const item of this.getInfo()) {
                edits.push(this._discardEdits(item));
            }
            const undoEdits = [];
            this._textModelN.pushEditOperations(null, edits.flat(), (_undoEdits) => {
                undoEdits.push(_undoEdits);
                return null;
            });
            return undoEdits.flat();
        }
        getInfo() {
            const result = [];
            for (const [hunk, data] of this._data.entries()) {
                const item = {
                    getState: () => {
                        return data.state;
                    },
                    isInsertion: () => {
                        return hunk.original.isEmpty;
                    },
                    getRangesN: () => {
                        const ranges = data.textModelNDecorations.map(id => this._textModelN.getDecorationRange(id));
                        (0, arrays_1.coalesceInPlace)(ranges);
                        return ranges;
                    },
                    getRanges0: () => {
                        const ranges = data.textModel0Decorations.map(id => this._textModel0.getDecorationRange(id));
                        (0, arrays_1.coalesceInPlace)(ranges);
                        return ranges;
                    },
                    discardChanges: () => {
                        // DISCARD: replace modified range with original value. The modified range is retrieved from a decoration
                        // which was created above so that typing in the editor keeps discard working.
                        if (data.state === 0 /* HunkState.Pending */) {
                            const edits = this._discardEdits(item);
                            this._textModelN.pushEditOperations(null, edits, () => null);
                            data.state = 2 /* HunkState.Rejected */;
                        }
                    },
                    acceptChanges: () => {
                        // ACCEPT: replace original range with modified value. The modified value is retrieved from the model via
                        // its decoration and the original range is retrieved from the hunk.
                        if (data.state === 0 /* HunkState.Pending */) {
                            const edits = [];
                            const rangesN = item.getRangesN();
                            const ranges0 = item.getRanges0();
                            for (let i = 1; i < ranges0.length; i++) {
                                const originalRange = ranges0[i];
                                const modifiedValue = this._textModelN.getValueInRange(rangesN[i]);
                                edits.push(editOperation_1.EditOperation.replace(originalRange, modifiedValue));
                            }
                            this._textModel0.pushEditOperations(null, edits, () => null);
                            data.state = 1 /* HunkState.Accepted */;
                        }
                    }
                };
                result.push(item);
            }
            return result;
        }
    };
    exports.HunkData = HunkData;
    exports.HunkData = HunkData = HunkData_1 = __decorate([
        __param(0, editorWorker_1.IEditorWorkerService)
    ], HunkData);
    class RawHunk {
        constructor(original, modified, changes) {
            this.original = original;
            this.modified = modified;
            this.changes = changes;
        }
    }
    var HunkState;
    (function (HunkState) {
        HunkState[HunkState["Pending"] = 0] = "Pending";
        HunkState[HunkState["Accepted"] = 1] = "Accepted";
        HunkState[HunkState["Rejected"] = 2] = "Rejected";
    })(HunkState || (exports.HunkState = HunkState = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFNlc3Npb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGluZUNoYXQvYnJvd3Nlci9pbmxpbmVDaGF0U2Vzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNERoRyxJQUFZLGNBSVg7SUFKRCxXQUFZLGNBQWM7UUFDekIsdUNBQXFCLENBQUE7UUFDckIscUNBQW1CLENBQUE7UUFDbkIsNkNBQTJCLENBQUE7SUFDNUIsQ0FBQyxFQUpXLGNBQWMsOEJBQWQsY0FBYyxRQUl6QjtJQUVELE1BQWEsaUJBQWlCO2lCQUVMLGFBQVEsR0FBNEIsa0NBQXNCLENBQUMsUUFBUSxDQUFDLEVBQUUsV0FBVyxFQUFFLCtCQUErQixFQUFFLENBQUMsQUFBN0csQ0FBOEc7UUFPOUksWUFBNkIsVUFBc0IsRUFBRSxVQUFrQjtZQUExQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1lBTGxDLGlCQUFZLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUMzQyxnQkFBVyxHQUFnQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUVwRCxtQkFBYyxHQUFhLEVBQUUsQ0FBQztZQUdyQyxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNySCxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFB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
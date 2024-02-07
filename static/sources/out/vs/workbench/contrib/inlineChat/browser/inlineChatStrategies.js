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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/browser/stableEditorScroll", "vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines", "vs/editor/common/core/editOperation", "vs/editor/common/core/lineRange", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/services/editorWorker", "vs/editor/common/viewModel", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/workbench/contrib/chat/common/chatWordCounter", "vs/workbench/contrib/inlineChat/browser/inlineChatLivePreviewWidget", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/base/common/types", "vs/editor/common/services/model", "./utils"], function (require, exports, dom_1, arrays_1, event_1, lazy_1, lifecycle_1, themables_1, stableEditorScroll_1, renderLines_1, editOperation_1, lineRange_1, range_1, model_1, textModel_1, editorWorker_1, viewModel_1, nls_1, contextkey_1, instantiation_1, progress_1, chatWordCounter_1, inlineChatLivePreviewWidget_1, inlineChatSession_1, inlineChat_1, types_1, model_2, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LiveStrategy = exports.LivePreviewStrategy = exports.PreviewStrategy = exports.EditModeStrategy = void 0;
    class EditModeStrategy {
        static { this._decoBlock = textModel_1.ModelDecorationOptions.register({
            description: 'inline-chat',
            showIfCollapsed: false,
            isWholeLine: true,
            className: 'inline-chat-block-selection',
        }); }
        constructor(_session, _editor, _zone) {
            this._session = _session;
            this._editor = _editor;
            this._zone = _zone;
            this._store = new lifecycle_1.DisposableStore();
            this._onDidAccept = this._store.add(new event_1.Emitter());
            this._onDidDiscard = this._store.add(new event_1.Emitter());
            this._editCount = 0;
            this.onDidAccept = this._onDidAccept.event;
            this.onDidDiscard = this._onDidDiscard.event;
        }
        dispose() {
            this._store.dispose();
        }
        cancel() {
            return this._session.hunkData.discardAll();
        }
        async acceptHunk() {
            this._onDidAccept.fire();
        }
        async discardHunk() {
            this._onDidDiscard.fire();
        }
        async _makeChanges(edits, obs, opts, progress) {
            // push undo stop before first edit
            if (++this._editCount === 1) {
                this._editor.pushUndoStop();
            }
            if (opts) {
                // ASYNC
                const durationInSec = opts.duration / 1000;
                for (const edit of edits) {
                    const wordCount = (0, chatWordCounter_1.countWords)(edit.text ?? '');
                    const speed = wordCount / durationInSec;
                    // console.log({ durationInSec, wordCount, speed: wordCount / durationInSec });
                    const asyncEdit = (0, utils_1.asProgressiveEdit)(new dom_1.WindowIntervalTimer(this._zone.domNode), edit, speed, opts.token);
                    await (0, utils_1.performAsyncTextEdit)(this._session.textModelN, asyncEdit, progress, obs);
                }
            }
            else {
                // SYNC
                obs.start();
                this._session.textModelN.pushEditOperations(null, edits, (undoEdits) => {
                    progress?.report(undoEdits);
                    return null;
                });
                obs.stop();
            }
        }
        getWholeRangeDecoration() {
            const ranges = [this._session.wholeRange.value];
            const newDecorations = ranges.map(range => range.isEmpty() ? undefined : ({ range, options: EditModeStrategy._decoBlock }));
            (0, arrays_1.coalesceInPlace)(newDecorations);
            return newDecorations;
        }
    }
    exports.EditModeStrategy = EditModeStrategy;
    let PreviewStrategy = class PreviewStrategy extends EditModeStrategy {
        constructor(session, editor, zone, modelService, contextKeyService) {
            super(session, editor, zone);
            this._ctxDocumentChanged = inlineChat_1.CTX_INLINE_CHAT_DOCUMENT_CHANGED.bindTo(contextKeyService);
            const baseModel = modelService.getModel(session.targetUri);
            event_1.Event.debounce(baseModel.onDidChangeContent.bind(baseModel), () => { }, 350)(_ => {
                if (!baseModel.isDisposed() && !session.textModel0.isDisposed()) {
                    this._ctxDocumentChanged.set(session.hasChangedText);
                }
            }, undefined, this._store);
        }
        dispose() {
            this._ctxDocumentChanged.reset();
            super.dispose();
        }
        async apply() {
            // (1) ensure the editor still shows the original text
            // (2) accept all pending hunks (moves changes from N to 0)
            // (3) replace editor model with textModel0
            const textModel = this._editor.getModel();
            if (textModel?.equalsTextBuffer(this._session.textModel0.getTextBuffer())) {
                this._session.hunkData.getInfo().forEach(item => item.acceptChanges());
                const newText = this._session.textModel0.getValue();
                const range = textModel.getFullModelRange();
                textModel.pushStackElement();
                textModel.pushEditOperations(null, [editOperation_1.EditOperation.replace(range, newText)], () => null);
                textModel.pushStackElement();
            }
            if (this._session.lastExchange?.response instanceof inlineChatSession_1.ReplyResponse) {
                const { untitledTextModel } = this._session.lastExchange.response;
                if (untitledTextModel && !untitledTextModel.isDisposed() && untitledTextModel.isDirty()) {
                    await untitledTextModel.save({ reason: 1 /* SaveReason.EXPLICIT */ });
                }
            }
        }
        async makeChanges(edits, obs) {
            return this._makeChanges(edits, obs, undefined, undefined);
        }
        async makeProgressiveChanges(edits, obs, opts) {
            return this._makeChanges(edits, obs, opts, undefined);
        }
        async undoChanges(altVersionId) {
            const { textModelN } = this._session;
            await undoModelUntil(textModelN, altVersionId);
        }
        async renderChanges(response) {
            if (response.allLocalEdits.length > 0) {
                await this._zone.widget.showEditsPreview(this._session.textModel0, this._session.textModelN);
            }
            else {
                this._zone.widget.hideEditsPreview();
            }
            if (response.untitledTextModel) {
                this._zone.widget.showCreatePreview(response.untitledTextModel);
            }
            else {
                this._zone.widget.hideCreatePreview();
            }
        }
        hasFocus() {
            return this._zone.widget.hasFocus();
        }
    };
    exports.PreviewStrategy = PreviewStrategy;
    exports.PreviewStrategy = PreviewStrategy = __decorate([
        __param(3, model_2.IModelService),
        __param(4, contextkey_1.IContextKeyService)
    ], PreviewStrategy);
    let LivePreviewStrategy = class LivePreviewStrategy extends EditModeStrategy {
        constructor(session, editor, zone, _instaService) {
            super(session, editor, zone);
            this._instaService = _instaService;
            this._diffZonePool = [];
            this._previewZone = new lazy_1.Lazy(() => _instaService.createInstance(inlineChatLivePreviewWidget_1.InlineChatFileCreatePreviewWidget, editor));
        }
        dispose() {
            for (const zone of this._diffZonePool) {
                zone.hide();
                zone.dispose();
            }
            this._previewZone.rawValue?.hide();
            this._previewZone.rawValue?.dispose();
            super.dispose();
        }
        async apply() {
            if (this._editCount > 0) {
                this._editor.pushUndoStop();
            }
            if (!(this._session.lastExchange?.response instanceof inlineChatSession_1.ReplyResponse)) {
                return;
            }
            const { untitledTextModel } = this._session.lastExchange.response;
            if (untitledTextModel && !untitledTextModel.isDisposed() && untitledTextModel.isDirty()) {
                await untitledTextModel.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
        async undoChanges(altVersionId) {
            const { textModelN } = this._session;
            await undoModelUntil(textModelN, altVersionId);
            this._updateDiffZones();
        }
        async makeChanges(edits, obs) {
            return this._makeChanges(edits, obs, undefined, undefined);
        }
        async makeProgressiveChanges(edits, obs, opts) {
            await this._makeChanges(edits, obs, opts, new progress_1.Progress(() => {
                this._updateDiffZones();
            }));
        }
        async renderChanges(response) {
            if (response.untitledTextModel && !response.untitledTextModel.isDisposed()) {
                this._previewZone.value.showCreation(this._session.wholeRange.value.getStartPosition().delta(-1), response.untitledTextModel);
            }
            else {
                this._previewZone.value.hide();
            }
            return this._updateDiffZones();
        }
        _updateSummaryMessage(hunkCount) {
            let message;
            if (hunkCount === 0) {
                message = (0, nls_1.localize)('change.0', "Nothing changed");
            }
            else if (hunkCount === 1) {
                message = (0, nls_1.localize)('change.1', "1 change");
            }
            else {
                message = (0, nls_1.localize)('lines.NM', "{0} changes", hunkCount);
            }
            this._zone.widget.updateStatus(message);
        }
        _updateDiffZones() {
            const { hunkData } = this._session;
            const hunks = hunkData.getInfo().filter(hunk => hunk.getState() === 0 /* HunkState.Pending */);
            if (hunks.length === 0) {
                for (const zone of this._diffZonePool) {
                    zone.hide();
                }
                if (hunkData.getInfo().find(hunk => hunk.getState() === 1 /* HunkState.Accepted */)) {
                    this._onDidAccept.fire();
                }
                else {
                    this._onDidDiscard.fire();
                }
                return;
            }
            this._updateSummaryMessage(hunks.length);
            // create enough zones
            const handleDiff = () => this._updateDiffZones();
            let nearest;
            // create enough zones
            while (hunks.length > this._diffZonePool.length) {
                this._diffZonePool.push(this._instaService.createInstance(inlineChatLivePreviewWidget_1.InlineChatLivePreviewWidget, this._editor, this._session, {}, this._diffZonePool.length === 0 ? handleDiff : undefined));
            }
            for (let i = 0; i < hunks.length; i++) {
                const hunk = hunks[i];
                this._diffZonePool[i].showForChanges(hunk);
                const modifiedRange = hunk.getRangesN()[0];
                const zoneLineNumber = this._zone.position.lineNumber;
                const distance = zoneLineNumber <= modifiedRange.startLineNumber
                    ? modifiedRange.startLineNumber - zoneLineNumber
                    : zoneLineNumber - modifiedRange.endLineNumber;
                if (!nearest || nearest.distance > distance) {
                    nearest = {
                        position: modifiedRange.getStartPosition().delta(-1),
                        distance,
                        accept: () => {
                            hunk.acceptChanges();
                            handleDiff();
                        },
                        discard: () => {
                            hunk.discardChanges();
                            handleDiff();
                        }
                    };
                }
            }
            // hide unused zones
            for (let i = hunks.length; i < this._diffZonePool.length; i++) {
                this._diffZonePool[i].hide();
            }
            this.acceptHunk = async () => nearest?.accept();
            this.discardHunk = async () => nearest?.discard();
            if (nearest) {
                this._zone.updatePositionAndHeight(nearest.position);
                this._editor.revealPositionInCenterIfOutsideViewport(nearest.position);
            }
            return nearest?.position;
        }
        hasFocus() {
            return this._zone.widget.hasFocus()
                || Boolean(this._previewZone.rawValue?.hasFocus())
                || this._diffZonePool.some(zone => zone.isVisible && zone.hasFocus());
        }
    };
    exports.LivePreviewStrategy = LivePreviewStrategy;
    exports.LivePreviewStrategy = LivePreviewStrategy = __decorate([
        __param(3, instantiation_1.IInstantiationService)
    ], LivePreviewStrategy);
    let LiveStrategy = class LiveStrategy extends EditModeStrategy {
        constructor(session, editor, zone, contextKeyService, _editorWorkerService, _instaService) {
            super(session, editor, zone);
            this._editorWorkerService = _editorWorkerService;
            this._instaService = _instaService;
            this._decoInsertedText = textModel_1.ModelDecorationOptions.register({
                description: 'inline-modified-line',
                className: 'inline-chat-inserted-range-linehighlight',
                isWholeLine: true,
                overviewRuler: {
                    position: model_1.OverviewRulerLane.Full,
                    color: (0, themables_1.themeColorFromId)(inlineChat_1.overviewRulerInlineChatDiffInserted),
                }
            });
            this._decoInsertedTextRange = textModel_1.ModelDecorationOptions.register({
                description: 'inline-chat-inserted-range-linehighlight',
                className: 'inline-chat-inserted-range',
            });
            this.acceptHunk = () => super.acceptHunk();
            this.discardHunk = () => super.discardHunk();
            this._hunkDisplayData = new Map();
            this._ctxCurrentChangeHasDiff = inlineChat_1.CTX_INLINE_CHAT_CHANGE_HAS_DIFF.bindTo(contextKeyService);
            this._ctxCurrentChangeShowsDiff = inlineChat_1.CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF.bindTo(contextKeyService);
            this._progressiveEditingDecorations = this._editor.createDecorationsCollection();
            this._previewZone = new lazy_1.Lazy(() => _instaService.createInstance(inlineChatLivePreviewWidget_1.InlineChatFileCreatePreviewWidget, editor));
        }
        dispose() {
            this._resetDiff();
            this._previewZone.rawValue?.dispose();
            super.dispose();
        }
        _resetDiff() {
            this._ctxCurrentChangeHasDiff.reset();
            this._ctxCurrentChangeShowsDiff.reset();
            this._zone.widget.updateStatus('');
            this._progressiveEditingDecorations.clear();
            for (const data of this._hunkDisplayData.values()) {
                data.remove();
            }
        }
        async apply() {
            this._resetDiff();
            if (this._editCount > 0) {
                this._editor.pushUndoStop();
            }
            if (!(this._session.lastExchange?.response instanceof inlineChatSession_1.ReplyResponse)) {
                return;
            }
            const { untitledTextModel } = this._session.lastExchange.response;
            if (untitledTextModel && !untitledTextModel.isDisposed() && untitledTextModel.isDirty()) {
                await untitledTextModel.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
        cancel() {
            this._resetDiff();
            return super.cancel();
        }
        async undoChanges(altVersionId) {
            const { textModelN } = this._session;
            await undoModelUntil(textModelN, altVersionId);
        }
        async makeChanges(edits, obs) {
            return this._makeChanges(edits, obs, undefined, undefined);
        }
        async makeProgressiveChanges(edits, obs, opts) {
            // add decorations once per line that got edited
            const progress = new progress_1.Progress(edits => {
                const newLines = new Set();
                for (const edit of edits) {
                    lineRange_1.LineRange.fromRange(edit.range).forEach(line => newLines.add(line));
                }
                const existingRanges = this._progressiveEditingDecorations.getRanges().map(lineRange_1.LineRange.fromRange);
                for (const existingRange of existingRanges) {
                    existingRange.forEach(line => newLines.delete(line));
                }
                const newDecorations = [];
                for (const line of newLines) {
                    newDecorations.push({ range: new range_1.Range(line, 1, line, Number.MAX_VALUE), options: this._decoInsertedText });
                }
                this._progressiveEditingDecorations.append(newDecorations);
            });
            return this._makeChanges(edits, obs, opts, progress);
        }
        async renderChanges(response) {
            if (response.untitledTextModel && !response.untitledTextModel.isDisposed()) {
                this._previewZone.value.showCreation(this._session.wholeRange.value.getStartPosition().delta(-1), response.untitledTextModel);
            }
            else {
                this._previewZone.value.hide();
            }
            this._progressiveEditingDecorations.clear();
            const renderHunks = () => {
                let widgetData;
                changeDecorationsAndViewZones(this._editor, (decorationsAccessor, viewZoneAccessor) => {
                    const keysNow = new Set(this._hunkDisplayData.keys());
                    widgetData = undefined;
                    for (const hunkData of this._session.hunkData.getInfo()) {
                        keysNow.delete(hunkData);
                        const hunkRanges = hunkData.getRangesN();
                        let data = this._hunkDisplayData.get(hunkData);
                        if (!data) {
                            // first time -> create decoration
                            const decorationIds = [];
                            for (let i = 0; i < hunkRanges.length; i++) {
                                decorationIds.push(decorationsAccessor.addDecoration(hunkRanges[i], i === 0
                                    ? this._decoInsertedText
                                    : this._decoInsertedTextRange));
                            }
                            const acceptHunk = () => {
                                hunkData.acceptChanges();
                                renderHunks();
                            };
                            const discardHunk = () => {
                                hunkData.discardChanges();
                                renderHunks();
                            };
                            // original view zone
                            const mightContainNonBasicASCII = this._session.textModel0.mightContainNonBasicASCII();
                            const mightContainRTL = this._session.textModel0.mightContainRTL();
                            const renderOptions = renderLines_1.RenderOptions.fromEditor(this._editor);
                            const originalRange = hunkData.getRanges0()[0];
                            const source = new renderLines_1.LineSource(lineRange_1.LineRange.fromRangeInclusive(originalRange).mapToLineArray(l => this._session.textModel0.tokenization.getLineTokens(l)), [], mightContainNonBasicASCII, mightContainRTL);
                            const domNode = document.createElement('div');
                            domNode.className = 'inline-chat-original-zone2';
                            const result = (0, renderLines_1.renderLines)(source, renderOptions, [new viewModel_1.InlineDecoration(new range_1.Range(originalRange.startLineNumber, 1, originalRange.startLineNumber, 1), '', 0 /* InlineDecorationType.Regular */)], domNode);
                            const viewZoneData = {
                                afterLineNumber: -1,
                                heightInLines: result.heightInLines,
                                domNode,
                            };
                            const toggleDiff = () => {
                                const scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this._editor);
                                changeDecorationsAndViewZones(this._editor, (_decorationsAccessor, viewZoneAccessor) => {
                                    (0, types_1.assertType)(data);
                                    if (!data.viewZoneId) {
                                        const [hunkRange] = hunkData.getRangesN();
                                        viewZoneData.afterLineNumber = hunkRange.startLineNumber - 1;
                                        data.viewZoneId = viewZoneAccessor.addZone(viewZoneData);
                                    }
                                    else {
                                        viewZoneAccessor.removeZone(data.viewZoneId);
                                        data.viewZoneId = undefined;
                                    }
                                });
                                this._ctxCurrentChangeShowsDiff.set(typeof data?.viewZoneId === 'number');
                                scrollState.restore(this._editor);
                            };
                            const remove = () => {
                                changeDecorationsAndViewZones(this._editor, (decorationsAccessor, viewZoneAccessor) => {
                                    (0, types_1.assertType)(data);
                                    for (const decorationId of data.decorationIds) {
                                        decorationsAccessor.removeDecoration(decorationId);
                                    }
                                    if (data.viewZoneId) {
                                        viewZoneAccessor.removeZone(data.viewZoneId);
                                    }
                                    data.decorationIds = [];
                                    data.viewZoneId = undefined;
                                });
                            };
                            const zoneLineNumber = this._zone.position.lineNumber;
                            const myDistance = zoneLineNumber <= hunkRanges[0].startLineNumber
                                ? hunkRanges[0].startLineNumber - zoneLineNumber
                                : zoneLineNumber - hunkRanges[0].endLineNumber;
                            data = {
                                decorationIds,
                                viewZoneId: '',
                                viewZone: viewZoneData,
                                distance: myDistance,
                                position: hunkRanges[0].getStartPosition().delta(-1),
                                acceptHunk,
                                discardHunk,
                                toggleDiff: !hunkData.isInsertion() ? toggleDiff : undefined,
                                remove,
                            };
                            this._hunkDisplayData.set(hunkData, data);
                        }
                        else if (hunkData.getState() !== 0 /* HunkState.Pending */) {
                            data.remove();
                        }
                        else {
                            // update distance and position based on modifiedRange-decoration
                            const zoneLineNumber = this._zone.position.lineNumber;
                            const modifiedRangeNow = hunkRanges[0];
                            data.position = modifiedRangeNow.getStartPosition().delta(-1);
                            data.distance = zoneLineNumber <= modifiedRangeNow.startLineNumber
                                ? modifiedRangeNow.startLineNumber - zoneLineNumber
                                : zoneLineNumber - modifiedRangeNow.endLineNumber;
                        }
                        if (hunkData.getState() === 0 /* HunkState.Pending */ && (!widgetData || data.distance < widgetData.distance)) {
                            widgetData = data;
                        }
                    }
                    for (const key of keysNow) {
                        const data = this._hunkDisplayData.get(key);
                        if (data) {
                            this._hunkDisplayData.delete(key);
                            data.remove();
                        }
                    }
                });
                if (widgetData) {
                    this._zone.updatePositionAndHeight(widgetData.position);
                    this._editor.revealPositionInCenterIfOutsideViewport(widgetData.position);
                    const remainingHunks = this._session.hunkData.pending;
                    this._updateSummaryMessage(remainingHunks);
                    this._ctxCurrentChangeHasDiff.set(Boolean(widgetData.toggleDiff));
                    this.toggleDiff = widgetData.toggleDiff;
                    this.acceptHunk = async () => widgetData.acceptHunk();
                    this.discardHunk = async () => widgetData.discardHunk();
                }
                else if (this._hunkDisplayData.size > 0) {
                    // everything accepted or rejected
                    let oneAccepted = false;
                    for (const hunkData of this._session.hunkData.getInfo()) {
                        if (hunkData.getState() === 1 /* HunkState.Accepted */) {
                            oneAccepted = true;
                            break;
                        }
                    }
                    if (oneAccepted) {
                        this._onDidAccept.fire();
                    }
                    else {
                        this._onDidDiscard.fire();
                    }
                }
                return widgetData;
            };
            return renderHunks()?.position;
        }
        _updateSummaryMessage(hunkCount) {
            let message;
            if (hunkCount === 0) {
                message = (0, nls_1.localize)('change.0', "Nothing changed");
            }
            else if (hunkCount === 1) {
                message = (0, nls_1.localize)('change.1', "1 change");
            }
            else {
                message = (0, nls_1.localize)('lines.NM', "{0} changes", hunkCount);
            }
            this._zone.widget.updateStatus(message);
        }
        hasFocus() {
            return this._zone.widget.hasFocus();
        }
        getWholeRangeDecoration() {
            // don't render the blue in live mode
            return [];
        }
    };
    exports.LiveStrategy = LiveStrategy;
    exports.LiveStrategy = LiveStrategy = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, editorWorker_1.IEditorWorkerService),
        __param(5, instantiation_1.IInstantiationService)
    ], LiveStrategy);
    async function undoModelUntil(model, targetAltVersion) {
        while (targetAltVersion < model.getAlternativeVersionId() && model.canUndo()) {
            await model.undo();
        }
    }
    function changeDecorationsAndViewZones(editor, callback) {
        editor.changeDecorations(decorationsAccessor => {
            editor.changeViewZones(viewZoneAccessor => {
                callback(decorationsAccessor, viewZoneAccessor);
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFN0cmF0ZWdpZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGluZUNoYXQvYnJvd3Nlci9pbmxpbmVDaGF0U3RyYXRlZ2llcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5Q2hHLE1BQXNCLGdCQUFnQjtpQkFFcEIsZUFBVSxHQUFHLGtDQUFzQixDQUFDLFFBQVEsQ0FBQztZQUM3RCxXQUFXLEVBQUUsYUFBYTtZQUMxQixlQUFlLEVBQUUsS0FBSztZQUN0QixXQUFXLEVBQUUsSUFBSTtZQUNqQixTQUFTLEVBQUUsNkJBQTZCO1NBQ3hDLENBQUMsQUFMeUIsQ0FLeEI7UUFhSCxZQUNvQixRQUFpQixFQUNqQixPQUFvQixFQUNwQixLQUEyQjtZQUYzQixhQUFRLEdBQVIsUUFBUSxDQUFTO1lBQ2pCLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDcEIsVUFBSyxHQUFMLEtBQUssQ0FBc0I7WUFkNUIsV0FBTSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQy9CLGlCQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3BELGtCQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBRTlELGVBQVUsR0FBVyxDQUFDLENBQUM7WUFFeEIsZ0JBQVcsR0FBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDbkQsaUJBQVksR0FBZ0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFRMUQsQ0FBQztRQUVMLE9BQU87WUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFJRCxN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
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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/stopwatch", "vs/base/common/types", "vs/base/common/uuid", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/services/editorWorker", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/workbench/contrib/chat/common/chatWordCounter", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/browser/inlineChatSessionService", "vs/workbench/contrib/inlineChat/browser/utils", "vs/workbench/contrib/inlineChat/browser/inlineChatWidget", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/inlineChat/browser/inlineChatSavingService"], function (require, exports, dom_1, async_1, cancellation_1, event_1, htmlContent_1, lifecycle_1, numbers_1, stopwatch_1, types_1, uuid_1, selection_1, languages_1, editorWorker_1, nls_1, actions_1, commands_1, contextkey_1, instantiation_1, progress_1, chatWordCounter_1, inlineChatController_1, inlineChatSession_1, inlineChatSessionService_1, utils_1, inlineChatWidget_1, inlineChat_1, notebookExecutionStateService_1, inlineChatSavingService_1) {
    "use strict";
    var NotebookCellChatController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellChatController = exports.MENU_CELL_CHAT_WIDGET_TOOLBAR = exports.MENU_CELL_CHAT_WIDGET_FEEDBACK = exports.MENU_CELL_CHAT_WIDGET_STATUS = exports.MENU_CELL_CHAT_WIDGET = exports.MENU_CELL_CHAT_INPUT = exports.CTX_NOTEBOOK_CHAT_HAS_ACTIVE_REQUEST = exports.CTX_NOTEBOOK_CELL_CHAT_FOCUSED = void 0;
    exports.CTX_NOTEBOOK_CELL_CHAT_FOCUSED = new contextkey_1.RawContextKey('notebookCellChatFocused', false, (0, nls_1.localize)('notebookCellChatFocused', "Whether the cell chat editor is focused"));
    exports.CTX_NOTEBOOK_CHAT_HAS_ACTIVE_REQUEST = new contextkey_1.RawContextKey('notebookChatHasActiveRequest', false, (0, nls_1.localize)('notebookChatHasActiveRequest', "Whether the cell chat editor has an active request"));
    exports.MENU_CELL_CHAT_INPUT = actions_1.MenuId.for('cellChatInput');
    exports.MENU_CELL_CHAT_WIDGET = actions_1.MenuId.for('cellChatWidget');
    exports.MENU_CELL_CHAT_WIDGET_STATUS = actions_1.MenuId.for('cellChatWidget.status');
    exports.MENU_CELL_CHAT_WIDGET_FEEDBACK = actions_1.MenuId.for('cellChatWidget.feedback');
    exports.MENU_CELL_CHAT_WIDGET_TOOLBAR = actions_1.MenuId.for('cellChatWidget.toolbar');
    let NotebookCellChatController = class NotebookCellChatController extends lifecycle_1.Disposable {
        static { NotebookCellChatController_1 = this; }
        static { this._cellChatControllers = new WeakMap(); }
        static get(cell) {
            return NotebookCellChatController_1._cellChatControllers.get(cell);
        }
        constructor(_notebookEditor, _chatPart, _cell, _partContainer, _contextKeyService, _inlineChatSessionService, _editorWorkerService, _instantiationService, _notebookExecutionStateService, _commandService, _inlineChatSavingService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._chatPart = _chatPart;
            this._cell = _cell;
            this._partContainer = _partContainer;
            this._contextKeyService = _contextKeyService;
            this._inlineChatSessionService = _inlineChatSessionService;
            this._editorWorkerService = _editorWorkerService;
            this._instantiationService = _instantiationService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this._commandService = _commandService;
            this._inlineChatSavingService = _inlineChatSavingService;
            this._isVisible = false;
            this._widgetDisposableStore = this._register(new lifecycle_1.DisposableStore());
            NotebookCellChatController_1._cellChatControllers.set(this._cell, this);
            this._ctxHasActiveRequest = exports.CTX_NOTEBOOK_CHAT_HAS_ACTIVE_REQUEST.bindTo(this._contextKeyService);
            this._ctxVisible = inlineChat_1.CTX_INLINE_CHAT_VISIBLE.bindTo(_contextKeyService);
            this._ctxCellWidgetFocused = exports.CTX_NOTEBOOK_CELL_CHAT_FOCUSED.bindTo(this._contextKeyService);
            this._ctxLastResponseType = inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.bindTo(this._contextKeyService);
            this._register(this._cell.onDidChangeEditorAttachState(() => {
                const editor = this._getCellEditor();
                this._inlineChatListener?.dispose();
                if (!editor) {
                    return;
                }
                if (!this._widget && this._isVisible) {
                    this._initialize(editor);
                }
                const inlineChatController = inlineChatController_1.InlineChatController.get(editor);
                if (inlineChatController) {
                    this._inlineChatListener = inlineChatController.onWillStartSession(() => {
                        this.dismiss(false);
                    });
                }
            }));
        }
        _initialize(editor) {
            this._widget = this._instantiationService.createInstance(inlineChatWidget_1.InlineChatWidget, editor, {
                menuId: exports.MENU_CELL_CHAT_INPUT,
                widgetMenuId: exports.MENU_CELL_CHAT_WIDGET,
                statusMenuId: exports.MENU_CELL_CHAT_WIDGET_STATUS,
                feedbackMenuId: exports.MENU_CELL_CHAT_WIDGET_FEEDBACK
            });
            this._widgetDisposableStore.add(this._widget.onDidChangeHeight(() => {
                this._updateHeight();
            }));
            this._widgetDisposableStore.add(this._notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.notebook.toString() !== this._notebookEditor.textModel?.uri.toString()) {
                    return;
                }
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && e.affectsCell(this._cell.uri) && e.changed === undefined /** complete */) {
                    // check if execution is successfull
                    const { lastRunSuccess } = this._cell.internalMetadata;
                    if (lastRunSuccess) {
                        this._strategy?.createSnapshot();
                    }
                }
            }));
            this._partContainer.appendChild(this._widget.domNode);
        }
        dispose() {
            if (this._isVisible) {
                // detach the chat widget
                this._widget?.reset();
                this._sessionCtor?.cancel();
                this._sessionCtor = undefined;
            }
            try {
                if (this._widget) {
                    this._partContainer.removeChild(this._widget.domNode);
                }
            }
            catch (_ex) {
                // might not be attached
            }
            // dismiss since we can't restore  the widget properly now
            this.dismiss(false);
            this._widget?.dispose();
            this._inlineChatListener?.dispose();
            this._toolbar?.dispose();
            this._inlineChatListener = undefined;
            this._ctxHasActiveRequest.reset();
            this._ctxVisible.reset();
            NotebookCellChatController_1._cellChatControllers.delete(this._cell);
            super.dispose();
        }
        isWidgetVisible() {
            return this._isVisible;
        }
        layout() {
            if (this._isVisible && this._widget) {
                const width = this._notebookEditor.getLayoutInfo().width - ( /** margin */16 + 6) - ( /** padding */6 * 2);
                const height = this._widget.getHeight();
                this._widget.layout(new dom_1.Dimension(width, height));
            }
        }
        _updateHeight() {
            const surrounding = 6 * 2 /** padding */ + 6 /** cell chat widget margin bottom */ + 2 /** border */;
            const heightWithPadding = this._isVisible && this._widget
                ? (this._widget.getHeight() - 8 /** shadow */ - 18 /** padding */ - 6 /** widget's internal margin top */ + surrounding)
                : 0;
            if (this._cell.chatHeight === heightWithPadding) {
                return;
            }
            this._cell.chatHeight = heightWithPadding;
            this._partContainer.style.height = `${heightWithPadding - surrounding}px`;
        }
        async show(input, autoSend) {
            this._isVisible = true;
            if (!this._widget) {
                const editor = this._getCellEditor();
                if (editor) {
                    this._initialize(editor);
                }
            }
            this._partContainer.style.display = 'flex';
            this._widget?.focus();
            this._widget?.updateInfo((0, nls_1.localize)('welcome.1', "AI-generated code may be incorrect"));
            this._ctxVisible.set(true);
            this._ctxCellWidgetFocused.set(true);
            this._updateHeight();
            this._sessionCtor = (0, async_1.createCancelablePromise)(async (token) => {
                if (this._cell.editorAttached) {
                    const editor = this._getCellEditor();
                    if (editor) {
                        await this._startSession(editor, token);
                    }
                }
                else {
                    await event_1.Event.toPromise(event_1.Event.once(this._cell.onDidChangeEditorAttachState));
                    if (token.isCancellationRequested) {
                        return;
                    }
                    const editor = this._getCellEditor();
                    if (editor) {
                        await this._startSession(editor, token);
                    }
                }
                if (this._widget) {
                    this._widget.placeholder = this._activeSession?.session.placeholder ?? (0, nls_1.localize)('default.placeholder', "Ask a question");
                    this._widget.updateInfo(this._activeSession?.session.message ?? (0, nls_1.localize)('welcome.1', "AI-generated code may be incorrect"));
                    this._widget.focus();
                }
                if (this._widget && input) {
                    this._widget.value = input;
                    if (autoSend) {
                        this.acceptInput();
                    }
                }
            });
        }
        async focusWidget() {
            this._widget?.focus();
        }
        _getCellEditor() {
            const editors = this._notebookEditor.codeEditors.find(editor => editor[0] === this._chatPart.activeCell);
            if (!editors || !editors[1].hasModel()) {
                return;
            }
            const editor = editors[1];
            return editor;
        }
        async _startSession(editor, token) {
            if (this._activeSession) {
                this._inlineChatSessionService.releaseSession(this._activeSession);
            }
            const session = await this._inlineChatSessionService.createSession(editor, { editMode: "livePreview" /* EditMode.LivePreview */ }, token);
            if (!session) {
                return;
            }
            this._activeSession = session;
            this._strategy = new EditStrategy(session);
        }
        async acceptInput() {
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._widget);
            this._activeSession.addInput(new inlineChatSession_1.SessionPrompt(this._widget.value));
            (0, types_1.assertType)(this._activeSession.lastInput);
            const value = this._activeSession.lastInput.value;
            const editors = this._notebookEditor.codeEditors.find(editor => editor[0] === this._chatPart.activeCell);
            if (!editors || !editors[1].hasModel()) {
                return;
            }
            const editor = editors[1];
            this._ctxHasActiveRequest.set(true);
            this._widget?.updateProgress(true);
            const request = {
                requestId: (0, uuid_1.generateUuid)(),
                prompt: value,
                attempt: 0,
                selection: { selectionStartLineNumber: 1, selectionStartColumn: 1, positionLineNumber: 1, positionColumn: 1 },
                wholeRange: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
                live: true,
                withIntentDetection: true, // TODO: don't hard code but allow in corresponding UI to run without intent detection?
            };
            const requestCts = new cancellation_1.CancellationTokenSource();
            const progressEdits = [];
            const progressiveEditsQueue = new async_1.Queue();
            const progressiveEditsClock = stopwatch_1.StopWatch.create();
            const progressiveEditsAvgDuration = new numbers_1.MovingAverage();
            const progressiveEditsCts = new cancellation_1.CancellationTokenSource(requestCts.token);
            const progress = new progress_1.AsyncProgress(async (data) => {
                // console.log('received chunk', data, request);
                if (requestCts.token.isCancellationRequested) {
                    return;
                }
                if (data.message) {
                    this._widget?.updateToolbar(false);
                    this._widget?.updateInfo(data.message);
                }
                if (data.edits?.length) {
                    if (!request.live) {
                        throw new Error('Progress in NOT supported in non-live mode');
                    }
                    progressEdits.push(data.edits);
                    progressiveEditsAvgDuration.update(progressiveEditsClock.elapsed());
                    progressiveEditsClock.reset();
                    progressiveEditsQueue.queue(async () => {
                        // making changes goes into a queue because otherwise the async-progress time will
                        // influence the time it takes to receive the changes and progressive typing will
                        // become infinitely fast
                        await this._makeChanges(editor, data.edits, data.editsShouldBeInstant
                            ? undefined
                            : { duration: progressiveEditsAvgDuration.value, token: progressiveEditsCts.token });
                    });
                }
            });
            const task = this._activeSession.provider.provideResponse(this._activeSession.session, request, progress, requestCts.token);
            let response;
            try {
                this._widget?.updateChatMessage(undefined);
                this._widget?.updateFollowUps(undefined);
                this._widget?.updateProgress(true);
                this._widget?.updateInfo(!this._activeSession.lastExchange ? (0, nls_1.localize)('thinking', "Thinking\u2026") : '');
                this._ctxHasActiveRequest.set(true);
                const reply = await (0, async_1.raceCancellationError)(Promise.resolve(task), requestCts.token);
                if (progressiveEditsQueue.size > 0) {
                    // we must wait for all edits that came in via progress to complete
                    await event_1.Event.toPromise(progressiveEditsQueue.onDrained);
                }
                await progress.drain();
                if (!reply) {
                    response = new inlineChatSession_1.EmptyResponse();
                }
                else {
                    const markdownContents = new htmlContent_1.MarkdownString('', { supportThemeIcons: true, supportHtml: true, isTrusted: false });
                    const replyResponse = response = this._instantiationService.createInstance(inlineChatSession_1.ReplyResponse, reply, markdownContents, this._activeSession.textModelN.uri, this._activeSession.textModelN.getAlternativeVersionId(), progressEdits, request.requestId);
                    for (let i = progressEdits.length; i < replyResponse.allLocalEdits.length; i++) {
                        await this._makeChanges(editor, replyResponse.allLocalEdits[i], undefined);
                    }
                    if (this._activeSession?.provider.provideFollowups) {
                        const followupCts = new cancellation_1.CancellationTokenSource();
                        const followups = await this._activeSession.provider.provideFollowups(this._activeSession.session, replyResponse.raw, followupCts.token);
                        if (followups && this._widget) {
                            const widget = this._widget;
                            widget.updateFollowUps(followups, async (followup) => {
                                if (followup.kind === 'reply') {
                                    widget.value = followup.message;
                                    this.acceptInput();
                                }
                                else {
                                    await this.acceptSession();
                                    this._commandService.executeCommand(followup.commandId, ...(followup.args ?? []));
                                }
                            });
                        }
                    }
                }
            }
            catch (e) {
                response = new inlineChatSession_1.ErrorResponse(e);
            }
            finally {
                this._ctxHasActiveRequest.set(false);
                this._widget?.updateProgress(false);
                this._widget?.updateInfo('');
                this._widget?.updateToolbar(true);
            }
            this._ctxHasActiveRequest.set(false);
            this._widget?.updateProgress(false);
            this._widget?.updateInfo('');
            this._widget?.updateToolbar(true);
            this._activeSession.addExchange(new inlineChatSession_1.SessionExchange(this._activeSession.lastInput, response));
            this._ctxLastResponseType.set(response instanceof inlineChatSession_1.ReplyResponse ? response.raw.type : undefined);
        }
        async cancelCurrentRequest(discard) {
            if (discard) {
                this._strategy?.cancel();
            }
            if (this._activeSession) {
                this._inlineChatSessionService.releaseSession(this._activeSession);
            }
            this._activeSession = undefined;
        }
        async acceptSession() {
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._strategy);
            const editor = this._getCellEditor();
            (0, types_1.assertType)(editor);
            try {
                await this._strategy.apply(editor);
            }
            catch (_err) { }
            this._inlineChatSessionService.releaseSession(this._activeSession);
            this.dismiss(false);
        }
        async dismiss(discard) {
            this._isVisible = false;
            this._partContainer.style.display = 'none';
            this.cancelCurrentRequest(discard);
            this._ctxCellWidgetFocused.set(false);
            this._ctxVisible.set(false);
            this._ctxLastResponseType.reset();
            this._widget?.reset();
            this._updateHeight();
        }
        async feedbackLast(kind) {
            if (this._activeSession?.lastExchange && this._activeSession.lastExchange.response instanceof inlineChatSession_1.ReplyResponse) {
                this._activeSession.provider.handleInlineChatResponseFeedback?.(this._activeSession.session, this._activeSession.lastExchange.response.raw, kind);
                this._widget?.updateStatus('Thank you for your feedback!', { resetAfter: 1250 });
            }
        }
        async _makeChanges(editor, edits, opts) {
            (0, types_1.assertType)(this._activeSession);
            (0, types_1.assertType)(this._strategy);
            const moreMinimalEdits = await this._editorWorkerService.computeMoreMinimalEdits(this._activeSession.textModelN.uri, edits);
            // this._log('edits from PROVIDER and after making them MORE MINIMAL', this._activeSession.provider.debugName, edits, moreMinimalEdits);
            if (moreMinimalEdits?.length === 0) {
                // nothing left to do
                return;
            }
            const actualEdits = !opts && moreMinimalEdits ? moreMinimalEdits : edits;
            const editOperations = actualEdits.map(languages_1.TextEdit.asEditOperation);
            this._inlineChatSavingService.markChanged(this._activeSession);
            try {
                // this._ignoreModelContentChanged = true;
                this._activeSession.wholeRange.trackEdits(editOperations);
                if (opts) {
                    await this._strategy.makeProgressiveChanges(editor, editOperations, opts);
                }
                else {
                    await this._strategy.makeChanges(editor, editOperations);
                }
                // this._ctxDidEdit.set(this._activeSession.hasChangedText);
            }
            finally {
                // this._ignoreModelContentChanged = false;
            }
        }
    };
    exports.NotebookCellChatController = NotebookCellChatController;
    exports.NotebookCellChatController = NotebookCellChatController = NotebookCellChatController_1 = __decorate([
        __param(4, contextkey_1.IContextKeyService),
        __param(5, inlineChatSessionService_1.IInlineChatSessionService),
        __param(6, editorWorker_1.IEditorWorkerService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(9, commands_1.ICommandService),
        __param(10, inlineChatSavingService_1.IInlineChatSavingService)
    ], NotebookCellChatController);
    class EditStrategy {
        constructor(_session) {
            this._session = _session;
            this._editCount = 0;
        }
        async makeProgressiveChanges(editor, edits, opts) {
            // push undo stop before first edit
            if (++this._editCount === 1) {
                editor.pushUndoStop();
            }
            const durationInSec = opts.duration / 1000;
            for (const edit of edits) {
                const wordCount = (0, chatWordCounter_1.countWords)(edit.text ?? '');
                const speed = wordCount / durationInSec;
                // console.log({ durationInSec, wordCount, speed: wordCount / durationInSec });
                await (0, utils_1.performAsyncTextEdit)(editor.getModel(), (0, utils_1.asProgressiveEdit)(new dom_1.WindowIntervalTimer(), edit, speed, opts.token));
            }
        }
        async makeChanges(editor, edits) {
            const cursorStateComputerAndInlineDiffCollection = (undoEdits) => {
                let last = null;
                for (const edit of undoEdits) {
                    last = !last || last.isBefore(edit.range.getEndPosition()) ? edit.range.getEndPosition() : last;
                    // this._inlineDiffDecorations.collectEditOperation(edit);
                }
                return last && [selection_1.Selection.fromPositions(last)];
            };
            // push undo stop before first edit
            if (++this._editCount === 1) {
                editor.pushUndoStop();
            }
            editor.executeEdits('inline-chat-live', edits, cursorStateComputerAndInlineDiffCollection);
        }
        async apply(editor) {
            if (this._editCount > 0) {
                editor.pushUndoStop();
            }
            if (!(this._session.lastExchange?.response instanceof inlineChatSession_1.ReplyResponse)) {
                return;
            }
            const { untitledTextModel } = this._session.lastExchange.response;
            if (untitledTextModel && !untitledTextModel.isDisposed() && untitledTextModel.isDirty()) {
                await untitledTextModel.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
        async cancel() {
            const { textModelN: modelN, textModelNAltVersion, textModelNSnapshotAltVersion } = this._session;
            if (modelN.isDisposed()) {
                return;
            }
            const targetAltVersion = textModelNSnapshotAltVersion ?? textModelNAltVersion;
            while (targetAltVersion < modelN.getAlternativeVersionId() && modelN.canUndo()) {
                modelN.undo();
            }
        }
        createSnapshot() {
            if (this._session && !this._session.textModel0.equalsTextBuffer(this._session.textModelN.getTextBuffer())) {
                this._session.createSnapshot();
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbENoYXRDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NoYXQvY2VsbENoYXRDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF1Q25GLFFBQUEsOEJBQThCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHlCQUF5QixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDLENBQUM7SUFDOUssUUFBQSxvQ0FBb0MsR0FBRyxJQUFJLDBCQUFhLENBQVUsOEJBQThCLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDhCQUE4QixFQUFFLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztJQUN6TSxRQUFBLG9CQUFvQixHQUFHLGdCQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ25ELFFBQUEscUJBQXFCLEdBQUcsZ0JBQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNyRCxRQUFBLDRCQUE0QixHQUFHLGdCQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDbkUsUUFBQSw4QkFBOEIsR0FBRyxnQkFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3ZFLFFBQUEsNkJBQTZCLEdBQUcsZ0JBQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQU0zRSxJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEyQixTQUFRLHNCQUFVOztpQkFDMUMseUJBQW9CLEdBQUcsSUFBSSxPQUFPLEVBQThDLEFBQTVELENBQTZEO1FBRWhHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBb0I7WUFD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
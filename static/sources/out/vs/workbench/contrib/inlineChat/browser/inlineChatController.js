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
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/stopwatch", "vs/base/common/types", "vs/base/common/uuid", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/services/editorWorker", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/workbench/contrib/chat/common/chatService", "./inlineChatSavingService", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "./inlineChatSessionService", "vs/workbench/contrib/inlineChat/browser/inlineChatStrategies", "vs/workbench/contrib/inlineChat/browser/inlineChatWidget", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/commands/common/commands"], function (require, exports, markdownRenderer_1, aria, async_1, cancellation_1, errorMessage_1, errors_1, event_1, htmlContent_1, lazy_1, lifecycle_1, numbers_1, stopwatch_1, types_1, uuid_1, bulkEditService_1, position_1, range_1, selection_1, languages_1, editorWorker_1, inlineCompletionsController_1, nls_1, accessibility_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, log_1, progress_1, storage_1, chat_1, chatAgents_1, chatParserTypes_1, chatService_1, inlineChatSavingService_1, inlineChatSession_1, inlineChatSessionService_1, inlineChatStrategies_1, inlineChatWidget_1, inlineChat_1, commands_1) {
    "use strict";
    var InlineChatController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatController = exports.InlineChatRunOptions = exports.State = void 0;
    var State;
    (function (State) {
        State["CREATE_SESSION"] = "CREATE_SESSION";
        State["INIT_UI"] = "INIT_UI";
        State["WAIT_FOR_INPUT"] = "WAIT_FOR_INPUT";
        State["MAKE_REQUEST"] = "MAKE_REQUEST";
        State["APPLY_RESPONSE"] = "APPLY_RESPONSE";
        State["SHOW_RESPONSE"] = "SHOW_RESPONSE";
        State["PAUSE"] = "PAUSE";
        State["CANCEL"] = "CANCEL";
        State["ACCEPT"] = "DONE";
    })(State || (exports.State = State = {}));
    var Message;
    (function (Message) {
        Message[Message["NONE"] = 0] = "NONE";
        Message[Message["ACCEPT_SESSION"] = 1] = "ACCEPT_SESSION";
        Message[Message["CANCEL_SESSION"] = 2] = "CANCEL_SESSION";
        Message[Message["PAUSE_SESSION"] = 4] = "PAUSE_SESSION";
        Message[Message["CANCEL_REQUEST"] = 8] = "CANCEL_REQUEST";
        Message[Message["CANCEL_INPUT"] = 16] = "CANCEL_INPUT";
        Message[Message["ACCEPT_INPUT"] = 32] = "ACCEPT_INPUT";
        Message[Message["RERUN_INPUT"] = 64] = "RERUN_INPUT";
    })(Message || (Message = {}));
    class InlineChatRunOptions {
        static isInteractiveEditorOptions(options) {
            const { initialSelection, initialRange, message, autoSend, position } = options;
            if (typeof message !== 'undefined' && typeof message !== 'string'
                || typeof autoSend !== 'undefined' && typeof autoSend !== 'boolean'
                || typeof initialRange !== 'undefined' && !range_1.Range.isIRange(initialRange)
                || typeof initialSelection !== 'undefined' && !selection_1.Selection.isISelection(initialSelection)
                || typeof position !== 'undefined' && !position_1.Position.isIPosition(position)) {
                return false;
            }
            return true;
        }
    }
    exports.InlineChatRunOptions = InlineChatRunOptions;
    let InlineChatController = class InlineChatController {
        static { InlineChatController_1 = this; }
        static get(editor) {
            return editor.getContribution(inlineChat_1.INLINE_CHAT_ID);
        }
        static { this._storageKey = 'inline-chat-history'; }
        static { this._promptHistory = []; }
        constructor(_editor, _instaService, _inlineChatSessionService, _inlineChatSavingService, _editorWorkerService, _logService, _configurationService, _dialogService, contextKeyService, _accessibilityService, _chatAccessibilityService, _chatAgentService, _bulkEditService, _storageService, _commandService) {
            this._editor = _editor;
            this._instaService = _instaService;
            this._inlineChatSessionService = _inlineChatSessionService;
            this._inlineChatSavingService = _inlineChatSavingService;
            this._editorWorkerService = _editorWorkerService;
            this._logService = _logService;
            this._configurationService = _configurationService;
            this._dialogService = _dialogService;
            this._accessibilityService = _accessibilityService;
            this._chatAccessibilityService = _chatAccessibilityService;
            this._chatAgentService = _chatAgentService;
            this._bulkEditService = _bulkEditService;
            this._storageService = _storageService;
            this._commandService = _commandService;
            this._historyOffset = -1;
            this._historyCandidate = '';
            this._isDisposed = false;
            this._store = new lifecycle_1.DisposableStore();
            this._messages = this._store.add(new event_1.Emitter());
            this._onWillStartSession = this._store.add(new event_1.Emitter());
            this.onWillStartSession = this._onWillStartSession.event;
            this.onDidAcceptInput = event_1.Event.filter(this._messages.event, m => m === 32 /* Message.ACCEPT_INPUT */, this._store);
            this.onDidCancelInput = event_1.Event.filter(this._messages.event, m => m === 16 /* Message.CANCEL_INPUT */ || m === 2 /* Message.CANCEL_SESSION */, this._store);
            this._sessionStore = this._store.add(new lifecycle_1.DisposableStore());
            this._stashedSession = this._store.add(new lifecycle_1.MutableDisposable());
            this._forcedPlaceholder = undefined;
            this._ctxHasActiveRequest = inlineChat_1.CTX_INLINE_CHAT_HAS_ACTIVE_REQUEST.bindTo(contextKeyService);
            this._ctxDidEdit = inlineChat_1.CTX_INLINE_CHAT_DID_EDIT.bindTo(contextKeyService);
            this._ctxUserDidEdit = inlineChat_1.CTX_INLINE_CHAT_USER_DID_EDIT.bindTo(contextKeyService);
            this._ctxResponseTypes = inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.bindTo(contextKeyService);
            this._ctxLastFeedbackKind = inlineChat_1.CTX_INLINE_CHAT_LAST_FEEDBACK.bindTo(contextKeyService);
            this._ctxSupportIssueReporting = inlineChat_1.CTX_INLINE_CHAT_SUPPORT_ISSUE_REPORTING.bindTo(contextKeyService);
            this._zone = new lazy_1.Lazy(() => this._store.add(_instaService.createInstance(inlineChatWidget_1.InlineChatZoneWidget, this._editor)));
            this._store.add(this._editor.onDidChangeModel(async (e) => {
                if (this._session || !e.newModelUrl) {
                    return;
                }
                const existingSession = this._inlineChatSessionService.getSession(this._editor, e.newModelUrl);
                if (!existingSession) {
                    return;
                }
                this._log('session RESUMING after model change', e);
                await this.run({ existingSession });
            }));
            this._store.add(this._inlineChatSessionService.onDidMoveSession(async (e) => {
                if (e.editor === this._editor) {
                    this._log('session RESUMING after move', e);
                    await this.run({ existingSession: e.session });
                }
            }));
            this._log('NEW controller');
            InlineChatController_1._promptHistory = JSON.parse(_storageService.get(InlineChatController_1._storageKey, 0 /* StorageScope.PROFILE */, '[]'));
            this._historyUpdate = (prompt) => {
                const idx = InlineChatController_1._promptHistory.indexOf(prompt);
                if (idx >= 0) {
                    InlineChatController_1._promptHistory.splice(idx, 1);
                }
                InlineChatController_1._promptHistory.unshift(prompt);
                this._historyOffset = -1;
                this._historyCandidate = '';
                this._storageService.store(InlineChatController_1._storageKey, JSON.stringify(InlineChatController_1._promptHistory), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            };
        }
        dispose() {
            if (this._currentRun) {
                this._messages.fire((this._session?.lastExchange
                    ? 4 /* Message.PAUSE_SESSION */
                    : 2 /* Message.CANCEL_SESSION */));
            }
            this._store.dispose();
            this._isDisposed = true;
            this._log('DISPOSED controller');
        }
        _log(message, ...more) {
            if (message instanceof Error) {
                this._logService.error(message, ...more);
            }
            else {
                this._logService.trace(`[IE] (editor:${this._editor.getId()})${message}`, ...more);
            }
        }
        getMessage() {
            return this._zone.value.widget.responseContent;
        }
        getId() {
            return inlineChat_1.INLINE_CHAT_ID;
        }
        _getMode() {
            const editMode = this._configurationService.inspect("inlineChat.mode" /* InlineChatConfigKeys.Mode */);
            let editModeValue = editMode.value;
            if (this._accessibilityService.isScreenReaderOptimized() && editModeValue === editMode.defaultValue) {
                // By default, use preview mode for screen reader users
                editModeValue = "preview" /* EditMode.Preview */;
            }
            return editModeValue;
        }
        getWidgetPosition() {
            return this._zone.value.position;
        }
        async run(options = {}) {
            try {
                this.finishExistingSession();
                if (this._currentRun) {
                    await this._currentRun;
                }
                if (options.initialSelection) {
                    this._editor.setSelection(options.initialSelection);
                }
                this._historyOffset = -1;
                this._historyCandidate = '';
                this._stashedSession.clear();
                this._onWillStartSession.fire();
                this._currentRun = this._nextState("CREATE_SESSION" /* State.CREATE_SESSION */, options);
                await this._currentRun;
            }
            catch (error) {
                // this should not happen but when it does make sure to tear down the UI and everything
                (0, errors_1.onUnexpectedError)(error);
                if (this._session) {
                    this._inlineChatSessionService.releaseSession(this._session);
                }
                this["PAUSE" /* State.PAUSE */]();
            }
            finally {
                this._currentRun = undefined;
            }
        }
        // ---- state machine
        async _nextState(state, options) {
            let nextState = state;
            while (nextState && !this._isDisposed) {
                this._log('setState to ', nextState);
                nextState = await this[nextState](options);
            }
        }
        async ["CREATE_SESSION" /* State.CREATE_SESSION */](options) {
            (0, types_1.assertType)(this._session === undefined);
            (0, types_1.assertType)(this._editor.hasModel());
            let session = options.existingSession;
            let initPosition;
            if (options.position) {
                initPosition = position_1.Position.lift(options.position).delta(-1);
                delete options.position;
            }
            this._showWidget(true, initPosition);
            this._updatePlaceholder();
            if (!session) {
                const createSessionCts = new cancellation_1.CancellationTokenSource();
                const msgListener = event_1.Event.once(this._messages.event)(m => {
                    this._log('state=_createSession) message received', m);
                    if (m === 32 /* Message.ACCEPT_INPUT */) {
                        // user accepted the input before having a session
                        options.autoSend = true;
                        this._zone.value.widget.updateProgress(true);
                        this._zone.value.widget.updateInfo((0, nls_1.localize)('welcome.2', "Getting ready..."));
                    }
                    else {
                        createSessionCts.cancel();
                    }
                });
                session = await this._inlineChatSessionService.createSession(this._editor, { editMode: this._getMode(), wholeRange: options.initialRange }, createSessionCts.token);
                createSessionCts.dispose();
                msgListener.dispose();
                if (createSessionCts.token.isCancellationRequested) {
                    if (session) {
                        this._inlineChatSessionService.releaseSession(session);
                    }
                    return "CANCEL" /* State.CANCEL */;
                }
            }
            delete options.initialRange;
            delete options.existingSession;
            if (!session) {
                this._dialogService.info((0, nls_1.localize)('create.fail', "Failed to start editor chat"), (0, nls_1.localize)('create.fail.detail', "Please consult the error log and try again later."));
                return "CANCEL" /* State.CANCEL */;
            }
            // create a new strategy
            switch (session.editMode) {
                case "live" /* EditMode.Live */:
                    this._strategy = this._instaService.createInstance(inlineChatStrategies_1.LiveStrategy, session, this._editor, this._zone.value);
                    break;
                case "preview" /* EditMode.Preview */:
                    this._strategy = this._instaService.createInstance(inlineChatStrategies_1.PreviewStrategy, session, this._editor, this._zone.value);
                    break;
                case "livePreview" /* EditMode.LivePreview */:
                default:
                    this._strategy = this._instaService.createInstance(inlineChatStrategies_1.LivePreviewStrategy, session, this._editor, this._zone.value);
                    break;
            }
            this._session = session;
            return "INIT_UI" /* State.INIT_UI */;
        }
        async ["INIT_UI" /* State.INIT_UI */](options) {
            (0, types_1.assertType)(this._session);
            (0, types_1.assertType)(this._strategy);
            // hide/cancel inline completions when invoking IE
            inlineCompletionsController_1.InlineCompletionsController.get(this._editor)?.hide();
            this._sessionStore.clear();
            this._sessionStore.add(this._zone.value.widget.onRequestWithoutIntentDetection(async () => {
                options.withIntentDetection = false;
                this.regenerate();
            }));
            const wholeRangeDecoration = this._editor.createDecorationsCollection();
            const updateWholeRangeDecoration = () => {
                const newDecorations = this._strategy?.getWholeRangeDecoration() ?? [];
                wholeRangeDecoration.set(newDecorations);
            };
            this._sessionStore.add((0, lifecycle_1.toDisposable)(() => wholeRangeDecoration.clear()));
            this._sessionStore.add(this._session.wholeRange.onDidChange(updateWholeRangeDecoration));
            updateWholeRangeDecoration();
            this._zone.value.widget.updateSlashCommands(this._session.session.slashCommands ?? []);
            this._updatePlaceholder();
            this._zone.value.widget.updateInfo(this._session.session.message ?? (0, nls_1.localize)('welcome.1', "AI-generated code may be incorrect"));
            this._zone.value.widget.preferredExpansionState = this._session.lastExpansionState;
            this._zone.value.widget.value = this._session.session.input ?? this._session.lastInput?.value ?? this._zone.value.widget.value;
            if (this._session.session.input) {
                this._zone.value.widget.selectAll();
            }
            this._showWidget(true);
            this._sessionStore.add(this._editor.onDidChangeModel((e) => {
                const msg = this._session?.lastExchange
                    ? 4 /* Message.PAUSE_SESSION */
                    : 2 /* Message.CANCEL_SESSION */;
                this._log('model changed, pause or cancel session', msg, e);
                this._messages.fire(msg);
            }));
            const altVersionNow = this._editor.getModel()?.getAlternativeVersionId();
            this._sessionStore.add(this._editor.onDidChangeModelContent(e => {
                if (!this._session?.hunkData.ignoreTextModelNChanges) {
                    this._ctxUserDidEdit.set(altVersionNow !== this._editor.getModel()?.getAlternativeVersionId());
                }
                if (this._session?.hunkData.ignoreTextModelNChanges || this._strategy?.hasFocus()) {
                    return;
                }
                const wholeRange = this._session.wholeRange;
                let shouldFinishSession = false;
                if (this._configurationService.getValue("inlineChat.finishOnType" /* InlineChatConfigKeys.FinishOnType */)) {
                    for (const { range } of e.changes) {
                        shouldFinishSession = !range_1.Range.areIntersectingOrTouching(range, wholeRange.value);
                    }
                }
                this._session.recordExternalEditOccurred(shouldFinishSession);
                if (shouldFinishSession) {
                    this._log('text changed outside of whole range, FINISH session');
                    this.finishExistingSession();
                }
            }));
            // Update context key
            this._ctxSupportIssueReporting.set(this._session.provider.supportIssueReporting ?? false);
            if (!this._session.lastExchange) {
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            else if (options.isUnstashed) {
                delete options.isUnstashed;
                return "APPLY_RESPONSE" /* State.APPLY_RESPONSE */;
            }
            else {
                return "SHOW_RESPONSE" /* State.SHOW_RESPONSE */;
            }
        }
        async ["WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */](options) {
            (0, types_1.assertType)(this._session);
            (0, types_1.assertType)(this._strategy);
            this._updatePlaceholder();
            if (options.message) {
                this.updateInput(options.message);
                aria.alert(options.message);
                delete options.message;
            }
            let message = 0 /* Message.NONE */;
            if (options.autoSend) {
                message = 32 /* Message.ACCEPT_INPUT */;
                delete options.autoSend;
            }
            else {
                const barrier = new async_1.Barrier();
                const store = new lifecycle_1.DisposableStore();
                store.add(this._strategy.onDidAccept(() => this.acceptSession()));
                store.add(this._strategy.onDidDiscard(() => this.cancelSession()));
                store.add(event_1.Event.once(this._messages.event)(m => {
                    this._log('state=_waitForInput) message received', m);
                    message = m;
                    barrier.open();
                }));
                await barrier.wait();
                store.dispose();
            }
            if (message & (16 /* Message.CANCEL_INPUT */ | 2 /* Message.CANCEL_SESSION */)) {
                return "CANCEL" /* State.CANCEL */;
            }
            if (message & 4 /* Message.PAUSE_SESSION */) {
                return "PAUSE" /* State.PAUSE */;
            }
            if (message & 1 /* Message.ACCEPT_SESSION */) {
                this._zone.value.widget.selectAll(false);
                return "DONE" /* State.ACCEPT */;
            }
            if (message & 64 /* Message.RERUN_INPUT */ && this._session.lastExchange) {
                const { lastExchange } = this._session;
                if (options.withIntentDetection === undefined) { // @ulugbekna: if we're re-running with intent detection turned off, no need to update `attempt` #
                    this._session.addInput(lastExchange.prompt.retry());
                }
                if (lastExchange.response instanceof inlineChatSession_1.ReplyResponse) {
                    try {
                        this._session.hunkData.ignoreTextModelNChanges = true;
                        await this._strategy.undoChanges(lastExchange.response.modelAltVersionId);
                    }
                    finally {
                        this._session.hunkData.ignoreTextModelNChanges = false;
                    }
                }
                return "MAKE_REQUEST" /* State.MAKE_REQUEST */;
            }
            if (!this.getInput()) {
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            const input = this.getInput();
            this._historyUpdate(input);
            const refer = this._session.session.slashCommands?.some(value => value.refer && input.startsWith(`/${value.command}`));
            if (refer) {
                this._log('[IE] seeing refer command, continuing outside editor', this._session.provider.debugName);
                this._editor.setSelection(this._session.wholeRange.value);
                let massagedInput = input;
                if (input.startsWith(chatParserTypes_1.chatSubcommandLeader)) {
                    const withoutSubCommandLeader = input.slice(1);
                    const cts = new cancellation_1.CancellationTokenSource();
                    this._sessionStore.add(cts);
                    for (const agent of this._chatAgentService.getAgents()) {
                        const commands = await agent.provideSlashCommands(cts.token);
                        if (commands.find((command) => withoutSubCommandLeader.startsWith(command.name))) {
                            massagedInput = `${chatParserTypes_1.chatAgentLeader}${agent.id} ${input}`;
                            break;
                        }
                    }
                }
                // if agent has a refer command, massage the input to include the agent name
                this._instaService.invokeFunction(sendRequest, massagedInput);
                if (!this._session.lastExchange) {
                    // DONE when there wasn't any exchange yet. We used the inline chat only as trampoline
                    return "DONE" /* State.ACCEPT */;
                }
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            this._session.addInput(new inlineChatSession_1.SessionPrompt(input));
            return "MAKE_REQUEST" /* State.MAKE_REQUEST */;
        }
        async ["MAKE_REQUEST" /* State.MAKE_REQUEST */](options) {
            (0, types_1.assertType)(this._editor.hasModel());
            (0, types_1.assertType)(this._session);
            (0, types_1.assertType)(this._strategy);
            (0, types_1.assertType)(this._session.lastInput);
            const requestCts = new cancellation_1.CancellationTokenSource();
            let message = 0 /* Message.NONE */;
            const msgListener = event_1.Event.once(this._messages.event)(m => {
                this._log('state=_makeRequest) message received', m);
                message = m;
                requestCts.cancel();
            });
            const typeListener = this._zone.value.widget.onDidChangeInput(() => requestCts.cancel());
            const requestClock = stopwatch_1.StopWatch.create();
            const request = {
                requestId: (0, uuid_1.generateUuid)(),
                prompt: this._session.lastInput.value,
                attempt: this._session.lastInput.attempt,
                selection: this._editor.getSelection(),
                wholeRange: this._session.wholeRange.trackedInitialRange,
                live: this._session.editMode !== "preview" /* EditMode.Preview */, // TODO@jrieken let extension know what document is used for previewing
                withIntentDetection: options.withIntentDetection ?? true /* use intent detection by default */,
            };
            // re-enable intent detection
            delete options.withIntentDetection;
            const modelAltVersionIdNow = this._session.textModelN.getAlternativeVersionId();
            const progressEdits = [];
            const progressiveEditsAvgDuration = new numbers_1.MovingAverage();
            const progressiveEditsCts = new cancellation_1.CancellationTokenSource(requestCts.token);
            const progressiveEditsClock = stopwatch_1.StopWatch.create();
            const progressiveEditsQueue = new async_1.Queue();
            let progressiveChatResponse;
            const progress = new progress_1.Progress(data => {
                this._log('received chunk', data, request);
                if (requestCts.token.isCancellationRequested) {
                    return;
                }
                if (data.message) {
                    this._zone.value.widget.updateToolbar(false);
                    this._zone.value.widget.updateInfo(data.message);
                }
                if (data.slashCommand) {
                    const valueNow = this.getInput();
                    if (!valueNow.startsWith('/')) {
                        this._zone.value.widget.updateSlashCommandUsed(data.slashCommand);
                    }
                }
                if (data.edits?.length) {
                    if (!request.live) {
                        throw new Error('Progress in NOT supported in non-live mode');
                    }
                    progressEdits.push(data.edits);
                    progressiveEditsAvgDuration.update(progressiveEditsClock.elapsed());
                    progressiveEditsClock.reset();
                    progressiveEditsQueue.queue(async () => {
                        const startThen = this._session.wholeRange.value.getStartPosition();
                        // making changes goes into a queue because otherwise the async-progress time will
                        // influence the time it takes to receive the changes and progressive typing will
                        // become infinitely fast
                        await this._makeChanges(data.edits, data.editsShouldBeInstant
                            ? undefined
                            : { duration: progressiveEditsAvgDuration.value, token: progressiveEditsCts.token });
                        // reshow the widget if the start position changed or shows at the wrong position
                        const startNow = this._session.wholeRange.value.getStartPosition();
                        if (!startNow.equals(startThen) || !this._zone.value.position?.equals(startNow)) {
                            this._showWidget(false, startNow.delta(-1));
                        }
                    });
                }
                if (data.markdownFragment) {
                    if (!progressiveChatResponse) {
                        const message = {
                            message: new htmlContent_1.MarkdownString(data.markdownFragment, { supportThemeIcons: true, supportHtml: true, isTrusted: false }),
                            providerId: this._session.provider.debugName,
                            requestId: request.requestId,
                        };
                        progressiveChatResponse = this._zone.value.widget.updateChatMessage(message, true);
                    }
                    else {
                        progressiveChatResponse.appendContent(data.markdownFragment);
                    }
                }
            });
            let a11yResponse;
            const a11yVerboseInlineChat = this._configurationService.getValue('accessibility.verbosity.inlineChat') === true;
            const requestId = this._chatAccessibilityService.acceptRequest();
            const task = this._session.provider.provideResponse(this._session.session, request, progress, requestCts.token);
            this._log('request started', this._session.provider.debugName, this._session.session, request);
            let response;
            let reply;
            try {
                this._zone.value.widget.updateChatMessage(undefined);
                this._zone.value.widget.updateFollowUps(undefined);
                this._zone.value.widget.updateProgress(true);
                this._zone.value.widget.updateInfo(!this._session.lastExchange ? (0, nls_1.localize)('thinking', "Thinking\u2026") : '');
                this._ctxHasActiveRequest.set(true);
                reply = await (0, async_1.raceCancellationError)(Promise.resolve(task), requestCts.token);
                // we must wait for all edits that came in via progress to complete
                await progressiveEditsQueue.whenIdle();
                if (progressiveChatResponse) {
                    progressiveChatResponse.cancel();
                }
                if (!reply) {
                    response = new inlineChatSession_1.EmptyResponse();
                    a11yResponse = (0, nls_1.localize)('empty', "No results, please refine your input and try again");
                }
                else {
                    const markdownContents = reply.message ?? new htmlContent_1.MarkdownString('', { supportThemeIcons: true, supportHtml: true, isTrusted: false });
                    const replyResponse = response = this._instaService.createInstance(inlineChatSession_1.ReplyResponse, reply, markdownContents, this._session.textModelN.uri, modelAltVersionIdNow, progressEdits, request.requestId);
                    for (let i = progressEdits.length; i < replyResponse.allLocalEdits.length; i++) {
                        await this._makeChanges(replyResponse.allLocalEdits[i], undefined);
                    }
                    const a11yMessageResponse = (0, markdownRenderer_1.renderMarkdownAsPlaintext)(replyResponse.mdContent);
                    a11yResponse = a11yVerboseInlineChat
                        ? a11yMessageResponse ? (0, nls_1.localize)('editResponseMessage2', "{0}, also review proposed changes in the diff editor.", a11yMessageResponse) : (0, nls_1.localize)('editResponseMessage', "Review proposed changes in the diff editor.")
                        : a11yMessageResponse;
                }
            }
            catch (e) {
                progressiveEditsQueue.clear();
                response = new inlineChatSession_1.ErrorResponse(e);
                a11yResponse = response.message;
            }
            finally {
                this._ctxHasActiveRequest.set(false);
                this._zone.value.widget.updateProgress(false);
                this._zone.value.widget.updateInfo('');
                this._zone.value.widget.updateToolbar(true);
                this._log('request took', requestClock.elapsed(), this._session.provider.debugName);
                this._chatAccessibilityService.acceptResponse(a11yResponse, requestId);
            }
            // todo@jrieken we can likely remove 'trackEdit'
            const diff = await this._editorWorkerService.computeDiff(this._session.textModel0.uri, this._session.textModelN.uri, { computeMoves: false, maxComputationTimeMs: Number.MAX_SAFE_INTEGER, ignoreTrimWhitespace: false }, 'advanced');
            this._session.wholeRange.fixup(diff?.changes ?? []);
            progressiveEditsCts.dispose(true);
            requestCts.dispose();
            msgListener.dispose();
            typeListener.dispose();
            if (response instanceof inlineChatSession_1.ReplyResponse) {
                // update hunks after a reply response
                await this._session.hunkData.recompute();
            }
            else if (request.live) {
                // undo changes that might have been made when not
                // having a reply response
                this._strategy?.undoChanges(modelAltVersionIdNow);
            }
            this._session.addExchange(new inlineChatSession_1.SessionExchange(this._session.lastInput, response));
            if (message & 2 /* Message.CANCEL_SESSION */) {
                return "CANCEL" /* State.CANCEL */;
            }
            else if (message & 4 /* Message.PAUSE_SESSION */) {
                return "PAUSE" /* State.PAUSE */;
            }
            else if (message & 1 /* Message.ACCEPT_SESSION */) {
                return "DONE" /* State.ACCEPT */;
            }
            else if (message & (32 /* Message.ACCEPT_INPUT */ | 64 /* Message.RERUN_INPUT */)) {
                return "MAKE_REQUEST" /* State.MAKE_REQUEST */;
            }
            else {
                return "APPLY_RESPONSE" /* State.APPLY_RESPONSE */;
            }
        }
        async ["APPLY_RESPONSE" /* State.APPLY_RESPONSE */]() {
            (0, types_1.assertType)(this._session);
            (0, types_1.assertType)(this._strategy);
            const { response } = this._session.lastExchange;
            if (response instanceof inlineChatSession_1.ReplyResponse && response.workspaceEdit) {
                // this reply cannot be applied in the normal inline chat UI and needs to be handled off to workspace edit
                this._bulkEditService.apply(response.workspaceEdit, { showPreview: true });
                return "CANCEL" /* State.CANCEL */;
            }
            return "SHOW_RESPONSE" /* State.SHOW_RESPONSE */;
        }
        async ["SHOW_RESPONSE" /* State.SHOW_RESPONSE */]() {
            (0, types_1.assertType)(this._session);
            (0, types_1.assertType)(this._strategy);
            const { response } = this._session.lastExchange;
            let responseTypes;
            for (const { response } of this._session.exchanges) {
                const thisType = response instanceof inlineChatSession_1.ReplyResponse
                    ? response.responseType
                    : undefined;
                if (responseTypes === undefined) {
                    responseTypes = thisType;
                }
                else if (responseTypes !== thisType) {
                    responseTypes = "mixed" /* InlineChatResponseTypes.Mixed */;
                    break;
                }
            }
            this._ctxResponseTypes.set(responseTypes);
            this._ctxDidEdit.set(this._session.hasChangedText);
            let newPosition;
            if (response instanceof inlineChatSession_1.EmptyResponse) {
                // show status message
                const status = (0, nls_1.localize)('empty', "No results, please refine your input and try again");
                this._zone.value.widget.updateStatus(status, { classes: ['warn'] });
                return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
            }
            else if (response instanceof inlineChatSession_1.ErrorResponse) {
                // show error
                if (!response.isCancellation) {
                    this._zone.value.widget.updateStatus(response.message, { classes: ['error'] });
                }
            }
            else if (response instanceof inlineChatSession_1.ReplyResponse) {
                // real response -> complex...
                this._zone.value.widget.updateStatus('');
                const message = { message: response.mdContent, providerId: this._session.provider.debugName, requestId: response.requestId };
                this._zone.value.widget.updateChatMessage(message);
                //this._zone.value.widget.updateMarkdownMessage(response.mdContent);
                this._session.lastExpansionState = this._zone.value.widget.expansionState;
                this._zone.value.widget.updateToolbar(true);
                newPosition = await this._strategy.renderChanges(response);
                if (this._session.provider.provideFollowups) {
                    const followupCts = new cancellation_1.CancellationTokenSource();
                    const msgListener = event_1.Event.once(this._messages.event)(() => {
                        followupCts.cancel();
                    });
                    const followupTask = this._session.provider.provideFollowups(this._session.session, response.raw, followupCts.token);
                    this._log('followup request started', this._session.provider.debugName, this._session.session, response.raw);
                    (0, async_1.raceCancellation)(Promise.resolve(followupTask), followupCts.token).then(followupReply => {
                        if (followupReply && this._session) {
                            this._log('followup request received', this._session.provider.debugName, this._session.session, followupReply);
                            this._zone.value.widget.updateFollowUps(followupReply, followup => {
                                if (followup.kind === 'reply') {
                                    this.updateInput(followup.message);
                                    this.acceptInput();
                                }
                                else {
                                    this._commandService.executeCommand(followup.commandId, ...(followup.args ?? []));
                                }
                            });
                        }
                    }).finally(() => {
                        msgListener.dispose();
                        followupCts.dispose();
                    });
                }
            }
            this._showWidget(false, newPosition);
            return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
        }
        async ["PAUSE" /* State.PAUSE */]() {
            this._resetWidget();
            this._strategy?.dispose?.();
            this._session = undefined;
        }
        async ["DONE" /* State.ACCEPT */]() {
            (0, types_1.assertType)(this._session);
            (0, types_1.assertType)(this._strategy);
            this._sessionStore.clear();
            try {
                await this._strategy.apply();
            }
            catch (err) {
                this._dialogService.error((0, nls_1.localize)('err.apply', "Failed to apply changes.", (0, errorMessage_1.toErrorMessage)(err)));
                this._log('FAILED to apply changes');
                this._log(err);
            }
            this._inlineChatSessionService.releaseSession(this._session);
            this._resetWidget();
            this._strategy?.dispose();
            this._strategy = undefined;
            this._session = undefined;
        }
        async ["CANCEL" /* State.CANCEL */]() {
            if (this._session) {
                // assertType(this._session);
                (0, types_1.assertType)(this._strategy);
                this._sessionStore.clear();
                // only stash sessions that were not unstashed, not "empty", and not interacted with
                const shouldStash = !this._session.isUnstashed && !!this._session.lastExchange && this._session.hunkData.size === this._session.hunkData.pending;
                let undoCancelEdits = [];
                try {
                    undoCancelEdits = this._strategy.cancel();
                }
                catch (err) {
                    this._dialogService.error((0, nls_1.localize)('err.discard', "Failed to discard changes.", (0, errorMessage_1.toErrorMessage)(err)));
                    this._log('FAILED to discard changes');
                    this._log(err);
                }
                this._stashedSession.clear();
                if (shouldStash) {
                    this._stashedSession.value = this._inlineChatSessionService.stashSession(this._session, this._editor, undoCancelEdits);
                }
                else {
                    this._inlineChatSessionService.releaseSession(this._session);
                }
            }
            this._resetWidget();
            this._strategy?.dispose();
            this._strategy = undefined;
            this._session = undefined;
        }
        // ----
        _showWidget(initialRender = false, position) {
            (0, types_1.assertType)(this._editor.hasModel());
            let widgetPosition;
            if (position) {
                // explicit position wins
                widgetPosition = position;
            }
            else if (this._zone.value.position) {
                // already showing - special case of line 1
                if (this._zone.value.position.lineNumber === 1) {
                    widgetPosition = this._zone.value.position.delta(-1);
                }
                else {
                    widgetPosition = this._zone.value.position;
                }
            }
            else {
                // default to ABOVE the selection
                widgetPosition = this._editor.getSelection().getStartPosition().delta(-1);
            }
            if (initialRender) {
                this._zone.value.setContainerMargins();
            }
            if (this._session && !position && (this._session.hasChangedText || this._session.lastExchange)) {
                widgetPosition = this._session.wholeRange.value.getStartPosition().delta(-1);
            }
            if (this._session) {
                this._zone.value.updateBackgroundColor(widgetPosition, this._session.wholeRange.value);
            }
            if (!this._zone.value.position) {
                this._zone.value.setWidgetMargins(widgetPosition);
                this._zone.value.show(widgetPosition);
            }
            else {
                this._zone.value.updatePositionAndHeight(widgetPosition);
            }
        }
        _resetWidget() {
            this._sessionStore.clear();
            this._ctxDidEdit.reset();
            this._ctxUserDidEdit.reset();
            this._ctxLastFeedbackKind.reset();
            this._ctxSupportIssueReporting.reset();
            this._zone.value.hide();
            // Return focus to the editor only if the current focus is within the editor widget
            if (this._editor.hasWidgetFocus()) {
                this._editor.focus();
            }
        }
        async _makeChanges(edits, opts) {
            (0, types_1.assertType)(this._session);
            (0, types_1.assertType)(this._strategy);
            const moreMinimalEdits = await this._editorWorkerService.computeMoreMinimalEdits(this._session.textModelN.uri, edits);
            this._log('edits from PROVIDER and after making them MORE MINIMAL', this._session.provider.debugName, edits, moreMinimalEdits);
            if (moreMinimalEdits?.length === 0) {
                // nothing left to do
                return;
            }
            const actualEdits = !opts && moreMinimalEdits ? moreMinimalEdits : edits;
            const editOperations = actualEdits.map(languages_1.TextEdit.asEditOperation);
            const editsObserver = {
                start: () => this._session.hunkData.ignoreTextModelNChanges = true,
                stop: () => this._session.hunkData.ignoreTextModelNChanges = false,
            };
            this._inlineChatSavingService.markChanged(this._session);
            this._session.wholeRange.trackEdits(editOperations);
            if (opts) {
                await this._strategy.makeProgressiveChanges(editOperations, editsObserver, opts);
            }
            else {
                await this._strategy.makeChanges(editOperations, editsObserver);
            }
            this._ctxDidEdit.set(this._session.hasChangedText);
        }
        _updatePlaceholder() {
            this._zone.value.widget.placeholder = this._getPlaceholderText();
        }
        _getPlaceholderText() {
            return this._forcedPlaceholder ?? this._session?.session.placeholder ?? '';
        }
        // ---- controller API
        showSaveHint() {
            const status = (0, nls_1.localize)('savehint', "Accept or discard changes to continue saving");
            this._zone.value.widget.updateStatus(status, { classes: ['warn'] });
        }
        setPlaceholder(text) {
            this._forcedPlaceholder = text;
            this._updatePlaceholder();
        }
        resetPlaceholder() {
            this._forcedPlaceholder = undefined;
            this._updatePlaceholder();
        }
        acceptInput() {
            this._messages.fire(32 /* Message.ACCEPT_INPUT */);
        }
        updateInput(text, selectAll = true) {
            this._zone.value.widget.value = text;
            if (selectAll) {
                this._zone.value.widget.selectAll();
            }
        }
        getInput() {
            return this._zone.value.widget.value;
        }
        regenerate() {
            this._messages.fire(64 /* Message.RERUN_INPUT */);
        }
        cancelCurrentRequest() {
            this._messages.fire(16 /* Message.CANCEL_INPUT */ | 8 /* Message.CANCEL_REQUEST */);
        }
        arrowOut(up) {
            if (this._zone.value.position && this._editor.hasModel()) {
                const { column } = this._editor.getPosition();
                const { lineNumber } = this._zone.value.position;
                const newLine = up ? lineNumber : lineNumber + 1;
                this._editor.setPosition({ lineNumber: newLine, column });
                this._editor.focus();
            }
        }
        focus() {
            this._zone.value.widget.focus();
        }
        hasFocus() {
            return this._zone.value.widget.hasFocus();
        }
        populateHistory(up) {
            const len = InlineChatController_1._promptHistory.length;
            if (len === 0) {
                return;
            }
            if (this._historyOffset === -1) {
                // remember the current value
                this._historyCandidate = this._zone.value.widget.value;
            }
            const newIdx = this._historyOffset + (up ? 1 : -1);
            if (newIdx >= len) {
                // reached the end
                return;
            }
            let entry;
            if (newIdx < 0) {
                entry = this._historyCandidate;
                this._historyOffset = -1;
            }
            else {
                entry = InlineChatController_1._promptHistory[newIdx];
                this._historyOffset = newIdx;
            }
            this._zone.value.widget.value = entry;
            this._zone.value.widget.selectAll();
        }
        viewInChat() {
            if (this._session?.lastExchange?.response instanceof inlineChatSession_1.ReplyResponse) {
                this._instaService.invokeFunction(showMessageResponse, this._session.lastExchange.prompt.value, this._session.lastExchange.response.mdContent.value);
            }
        }
        updateExpansionState(expand) {
            if (this._session) {
                const expansionState = expand ? inlineChatSession_1.ExpansionState.EXPANDED : inlineChatSession_1.ExpansionState.CROPPED;
                this._zone.value.widget.updateChatMessageExpansionState(expansionState);
                this._session.lastExpansionState = expansionState;
            }
        }
        toggleDiff() {
            this._strategy?.toggleDiff?.();
        }
        feedbackLast(kind) {
            if (this._session?.lastExchange && this._session.lastExchange.response instanceof inlineChatSession_1.ReplyResponse) {
                this._session.provider.handleInlineChatResponseFeedback?.(this._session.session, this._session.lastExchange.response.raw, kind);
                switch (kind) {
                    case 1 /* InlineChatResponseFeedbackKind.Helpful */:
                        this._ctxLastFeedbackKind.set('helpful');
                        break;
                    case 0 /* InlineChatResponseFeedbackKind.Unhelpful */:
                        this._ctxLastFeedbackKind.set('unhelpful');
                        break;
                    default:
                        break;
                }
                this._zone.value.widget.updateStatus('Thank you for your feedback!', { resetAfter: 1250 });
            }
        }
        createSnapshot() {
            if (this._session && !this._session.textModel0.equalsTextBuffer(this._session.textModelN.getTextBuffer())) {
                this._session.createSnapshot();
            }
        }
        acceptSession() {
            if (this._session?.lastExchange && this._session.lastExchange.response instanceof inlineChatSession_1.ReplyResponse) {
                this._session.provider.handleInlineChatResponseFeedback?.(this._session.session, this._session.lastExchange.response.raw, 3 /* InlineChatResponseFeedbackKind.Accepted */);
            }
            this._messages.fire(1 /* Message.ACCEPT_SESSION */);
        }
        acceptHunk() {
            return this._strategy?.acceptHunk();
        }
        discardHunk() {
            return this._strategy?.discardHunk();
        }
        async cancelSession() {
            let result;
            if (this._session) {
                const diff = await this._editorWorkerService.computeDiff(this._session.textModel0.uri, this._session.textModelN.uri, { ignoreTrimWhitespace: false, maxComputationTimeMs: 5000, computeMoves: false }, 'advanced');
                result = this._session.asChangedText(diff?.changes ?? []);
                if (this._session.lastExchange && this._session.lastExchange.response instanceof inlineChatSession_1.ReplyResponse) {
                    this._session.provider.handleInlineChatResponseFeedback?.(this._session.session, this._session.lastExchange.response.raw, 2 /* InlineChatResponseFeedbackKind.Undone */);
                }
            }
            this._messages.fire(2 /* Message.CANCEL_SESSION */);
            return result;
        }
        finishExistingSession() {
            if (this._session) {
                if (this._session.editMode === "preview" /* EditMode.Preview */) {
                    this._log('finishing existing session, using CANCEL', this._session.editMode);
                    this.cancelSession();
                }
                else {
                    this._log('finishing existing session, using APPLY', this._session.editMode);
                    this.acceptSession();
                }
            }
        }
        unstashLastSession() {
            const result = this._stashedSession.value?.unstash();
            if (result) {
                this._inlineChatSavingService.markChanged(result);
            }
            return result;
        }
        joinCurrentRun() {
            return this._currentRun;
        }
    };
    exports.InlineChatController = InlineChatController;
    exports.InlineChatController = InlineChatController = InlineChatController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, inlineChatSessionService_1.IInlineChatSessionService),
        __param(3, inlineChatSavingService_1.IInlineChatSavingService),
        __param(4, editorWorker_1.IEditorWorkerService),
        __param(5, log_1.ILogService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, dialogs_1.IDialogService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, accessibility_1.IAccessibilityService),
        __param(10, chat_1.IChatAccessibilityService),
        __param(11, chatAgents_1.IChatAgentService),
        __param(12, bulkEditService_1.IBulkEditService),
        __param(13, storage_1.IStorageService),
        __param(14, commands_1.ICommandService)
    ], InlineChatController);
    async function showMessageResponse(accessor, query, response) {
        const chatService = accessor.get(chatService_1.IChatService);
        const providerId = chatService.getProviderInfos()[0]?.id;
        const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
        const widget = await chatWidgetService.revealViewForProvider(providerId);
        if (widget && widget.viewModel) {
            chatService.addCompleteRequest(widget.viewModel.sessionId, query, undefined, { message: response });
            widget.focusLastMessage();
        }
    }
    async function sendRequest(accessor, query) {
        const chatService = accessor.get(chatService_1.IChatService);
        const widgetService = accessor.get(chat_1.IChatWidgetService);
        const providerId = chatService.getProviderInfos()[0]?.id;
        const widget = await widgetService.revealViewForProvider(providerId);
        if (!widget) {
            return;
        }
        widget.acceptInput(query);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGluZUNoYXQvYnJvd3Nlci9pbmxpbmVDaGF0Q29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0RoRyxJQUFrQixLQVVqQjtJQVZELFdBQWtCLEtBQUs7UUFDdEIsMENBQWlDLENBQUE7UUFDakMsNEJBQW1CLENBQUE7UUFDbkIsMENBQWlDLENBQUE7UUFDakMsc0NBQTZCLENBQUE7UUFDN0IsMENBQWlDLENBQUE7UUFDakMsd0NBQStCLENBQUE7UUFDL0Isd0JBQWUsQ0FBQTtRQUNmLDBCQUFpQixDQUFBO1FBQ2pCLHdCQUFlLENBQUE7SUFDaEIsQ0FBQyxFQVZpQixLQUFLLHFCQUFMLEtBQUssUUFVdEI7SUFFRCxJQUFXLE9BU1Y7SUFURCxXQUFXLE9BQU87UUFDakIscUNBQVEsQ0FBQTtRQUNSLHlEQUF1QixDQUFBO1FBQ3ZCLHlEQUF1QixDQUFBO1FBQ3ZCLHVEQUFzQixDQUFBO1FBQ3RCLHlEQUF1QixDQUFBO1FBQ3ZCLHNEQUFxQixDQUFBO1FBQ3JCLHNEQUFxQixDQUFBO1FBQ3JCLG9EQUFvQixDQUFBO0lBQ3JCLENBQUMsRUFUVSxPQUFPLEtBQVAsT0FBTyxRQVNqQjtJQUVELE1BQXNCLG9CQUFvQjtRQVV6QyxNQUFNLENBQUMsMEJBQTBCLENBQUMsT0FBWTtZQUM3QyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDO1lBQ2hGLElBQ0MsT0FBTyxPQUFPLEtBQUssV0FBVyxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVE7bUJBQzFELE9BQU8sUUFBUSxLQUFLLFdBQVcsSUFBSSxPQUFP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
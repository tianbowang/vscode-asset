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
define(["require", "exports", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/platform/commands/common/commands", "vs/workbench/common/contextkeys", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/contrib/speech/common/speechService", "vs/base/common/async", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/theme", "vs/platform/theme/common/colorRegistry", "vs/platform/configuration/common/configuration", "vs/base/common/types", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/editor/common/editorGroupsService", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/host/browser/host", "vs/editor/browser/editorBrowser", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/css!./media/voiceChatActions"], function (require, exports, event_1, arrays_1, cancellation_1, codicons_1, lifecycle_1, nls_1, actions_1, contextkey_1, instantiation_1, iconRegistry_1, chatActions_1, chat_1, chatService_1, inlineChat_1, chatContextKeys_1, inlineChatController_1, commands_1, contextkeys_1, viewsService_1, chatContributionService_1, layoutService_1, speechService_1, async_1, themeService_1, theme_1, theme_2, colorRegistry_1, configuration_1, types_1, accessibilityConfiguration_1, platform_1, configurationRegistry_1, statusbar_1, editorGroupsService_1, codeEditorService_1, host_1, editorBrowser_1, editorService_1, embeddedCodeEditorWidget_1) {
    "use strict";
    var VoiceChatSessions_1, KeywordActivationContribution_1, KeywordActivationStatusEntry_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeywordActivationContribution = exports.StopListeningAndSubmitAction = exports.StopListeningInInlineChatAction = exports.StopListeningInQuickChatAction = exports.StopListeningInChatEditorAction = exports.StopListeningInChatViewAction = exports.StopListeningAction = exports.StartVoiceChatAction = exports.QuickVoiceChatAction = exports.InlineVoiceChatAction = exports.VoiceChatInChatViewAction = void 0;
    const CONTEXT_VOICE_CHAT_GETTING_READY = new contextkey_1.RawContextKey('voiceChatGettingReady', false, { type: 'boolean', description: (0, nls_1.localize)('voiceChatGettingReady', "True when getting ready for receiving voice input from the microphone for voice chat.") });
    const CONTEXT_VOICE_CHAT_IN_PROGRESS = new contextkey_1.RawContextKey('voiceChatInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('voiceChatInProgress', "True when voice recording from microphone is in progress for voice chat.") });
    const CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS = new contextkey_1.RawContextKey('quickVoiceChatInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('quickVoiceChatInProgress', "True when voice recording from microphone is in progress for quick chat.") });
    const CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS = new contextkey_1.RawContextKey('inlineVoiceChatInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('inlineVoiceChatInProgress', "True when voice recording from microphone is in progress for inline chat.") });
    const CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS = new contextkey_1.RawContextKey('voiceChatInViewInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('voiceChatInViewInProgress', "True when voice recording from microphone is in progress in the chat view.") });
    const CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS = new contextkey_1.RawContextKey('voiceChatInEditorInProgress', false, { type: 'boolean', description: (0, nls_1.localize)('voiceChatInEditorInProgress', "True when voice recording from microphone is in progress in the chat editor.") });
    function getFocusedCodeEditor(editorService, codeEditorService) {
        const codeEditor = (0, editorBrowser_1.getCodeEditor)(codeEditorService.getFocusedCodeEditor());
        if (codeEditor && !(codeEditor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget)) {
            return codeEditor;
        }
        return (0, editorBrowser_1.getCodeEditor)(editorService.activeTextEditorControl);
    }
    class VoiceChatSessionControllerFactory {
        static async create(accessor, context) {
            const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
            const chatService = accessor.get(chatService_1.IChatService);
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const chatContributionService = accessor.get(chatContributionService_1.IChatContributionService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const quickChatService = accessor.get(chat_1.IQuickChatService);
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const editorService = accessor.get(editorService_1.IEditorService);
            // Currently Focused Context
            if (context === 'focused') {
                // Try with the chat widget service, which currently
                // only supports the chat view and quick chat
                // https://github.com/microsoft/vscode/issues/191191
                const chatInput = chatWidgetService.lastFocusedWidget;
                if (chatInput?.hasInputFocus()) {
                    // Unfortunately there does not seem to be a better way
                    // to figure out if the chat widget is in a part or picker
                    if (layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ||
                        layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */) ||
                        layoutService.hasFocus("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                        return VoiceChatSessionControllerFactory.doCreateForChatView(chatInput, viewsService, chatContributionService);
                    }
                    if (layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                        return VoiceChatSessionControllerFactory.doCreateForChatEditor(chatInput, viewsService, chatContributionService);
                    }
                    return VoiceChatSessionControllerFactory.doCreateForQuickChat(chatInput, quickChatService);
                }
                // Try with the inline chat
                const activeCodeEditor = getFocusedCodeEditor(editorService, codeEditorService);
                if (activeCodeEditor) {
                    const inlineChat = inlineChatController_1.InlineChatController.get(activeCodeEditor);
                    if (inlineChat?.hasFocus()) {
                        return VoiceChatSessionControllerFactory.doCreateForInlineChat(inlineChat);
                    }
                }
            }
            // View Chat
            if (context === 'view') {
                const provider = (0, arrays_1.firstOrDefault)(chatService.getProviderInfos());
                if (provider) {
                    const chatView = await chatWidgetService.revealViewForProvider(provider.id);
                    if (chatView) {
                        return VoiceChatSessionControllerFactory.doCreateForChatView(chatView, viewsService, chatContributionService);
                    }
                }
            }
            // Inline Chat
            if (context === 'inline') {
                const activeCodeEditor = getFocusedCodeEditor(editorService, codeEditorService);
                if (activeCodeEditor) {
                    const inlineChat = inlineChatController_1.InlineChatController.get(activeCodeEditor);
                    if (inlineChat) {
                        return VoiceChatSessionControllerFactory.doCreateForInlineChat(inlineChat);
                    }
                }
            }
            // Quick Chat
            if (context === 'quick') {
                quickChatService.open();
                const quickChat = chatWidgetService.lastFocusedWidget;
                if (quickChat) {
                    return VoiceChatSessionControllerFactory.doCreateForQuickChat(quickChat, quickChatService);
                }
            }
            return undefined;
        }
        static doCreateForChatView(chatView, viewsService, chatContributionService) {
            return VoiceChatSessionControllerFactory.doCreateForChatViewOrEditor('view', chatView, viewsService, chatContributionService);
        }
        static doCreateForChatEditor(chatView, viewsService, chatContributionService) {
            return VoiceChatSessionControllerFactory.doCreateForChatViewOrEditor('editor', chatView, viewsService, chatContributionService);
        }
        static doCreateForChatViewOrEditor(context, chatView, viewsService, chatContributionService) {
            return {
                context,
                onDidAcceptInput: chatView.onDidAcceptInput,
                // TODO@bpasero cancellation needs to work better for chat editors that are not view bound
                onDidCancelInput: event_1.Event.filter(viewsService.onDidChangeViewVisibility, e => e.id === chatContributionService.getViewIdForProvider(chatView.providerId)),
                focusInput: () => chatView.focusInput(),
                acceptInput: () => chatView.acceptInput(),
                updateInput: text => chatView.setInput(text),
                getInput: () => chatView.getInput(),
                setInputPlaceholder: text => chatView.setInputPlaceholder(text),
                clearInputPlaceholder: () => chatView.resetInputPlaceholder()
            };
        }
        static doCreateForQuickChat(quickChat, quickChatService) {
            return {
                context: 'quick',
                onDidAcceptInput: quickChat.onDidAcceptInput,
                onDidCancelInput: quickChatService.onDidClose,
                focusInput: () => quickChat.focusInput(),
                acceptInput: () => quickChat.acceptInput(),
                updateInput: text => quickChat.setInput(text),
                getInput: () => quickChat.getInput(),
                setInputPlaceholder: text => quickChat.setInputPlaceholder(text),
                clearInputPlaceholder: () => quickChat.resetInputPlaceholder()
            };
        }
        static doCreateForInlineChat(inlineChat) {
            const inlineChatSession = inlineChat.joinCurrentRun() ?? inlineChat.run();
            return {
                context: 'inline',
                onDidAcceptInput: inlineChat.onDidAcceptInput,
                onDidCancelInput: event_1.Event.any(inlineChat.onDidCancelInput, event_1.Event.fromPromise(inlineChatSession)),
                focusInput: () => inlineChat.focus(),
                acceptInput: () => inlineChat.acceptInput(),
                updateInput: text => inlineChat.updateInput(text, false),
                getInput: () => inlineChat.getInput(),
                setInputPlaceholder: text => inlineChat.setPlaceholder(text),
                clearInputPlaceholder: () => inlineChat.resetPlaceholder()
            };
        }
    }
    let VoiceChatSessions = class VoiceChatSessions {
        static { VoiceChatSessions_1 = this; }
        static { this.instance = undefined; }
        static getInstance(instantiationService) {
            if (!VoiceChatSessions_1.instance) {
                VoiceChatSessions_1.instance = instantiationService.createInstance(VoiceChatSessions_1);
            }
            return VoiceChatSessions_1.instance;
        }
        constructor(contextKeyService, speechService, configurationService) {
            this.contextKeyService = contextKeyService;
            this.speechService = speechService;
            this.configurationService = configurationService;
            this.voiceChatInProgressKey = CONTEXT_VOICE_CHAT_IN_PROGRESS.bindTo(this.contextKeyService);
            this.voiceChatGettingReadyKey = CONTEXT_VOICE_CHAT_GETTING_READY.bindTo(this.contextKeyService);
            this.quickVoiceChatInProgressKey = CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS.bindTo(this.contextKeyService);
            this.inlineVoiceChatInProgressKey = CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS.bindTo(this.contextKeyService);
            this.voiceChatInViewInProgressKey = CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS.bindTo(this.contextKeyService);
            this.voiceChatInEditorInProgressKey = CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS.bindTo(this.contextKeyService);
            this.currentVoiceChatSession = undefined;
            this.voiceChatSessionIds = 0;
        }
        async start(controller, context) {
            this.stop();
            const sessionId = ++this.voiceChatSessionIds;
            const session = this.currentVoiceChatSession = {
                id: sessionId,
                controller,
                disposables: new lifecycle_1.DisposableStore()
            };
            const cts = new cancellation_1.CancellationTokenSource();
            session.disposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            session.disposables.add(controller.onDidAcceptInput(() => this.stop(sessionId, controller.context)));
            session.disposables.add(controller.onDidCancelInput(() => this.stop(sessionId, controller.context)));
            controller.focusInput();
            this.voiceChatGettingReadyKey.set(true);
            const speechToTextSession = session.disposables.add(this.speechService.createSpeechToTextSession(cts.token));
            let inputValue = controller.getInput();
            let voiceChatTimeout = this.configurationService.getValue("accessibility.voice.speechTimeout" /* AccessibilityVoiceSettingId.SpeechTimeout */);
            if (!(0, types_1.isNumber)(voiceChatTimeout) || voiceChatTimeout < 0) {
                voiceChatTimeout = accessibilityConfiguration_1.SpeechTimeoutDefault;
            }
            const acceptTranscriptionScheduler = session.disposables.add(new async_1.RunOnceScheduler(() => session.controller.acceptInput(), voiceChatTimeout));
            session.disposables.add(speechToTextSession.onDidChange(({ status, text }) => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                switch (status) {
                    case speechService_1.SpeechToTextStatus.Started:
                        this.onDidSpeechToTextSessionStart(controller, session.disposables);
                        break;
                    case speechService_1.SpeechToTextStatus.Recognizing:
                        if (text) {
                            session.controller.updateInput([inputValue, text].join(' '));
                            if (voiceChatTimeout > 0 && context?.voice?.disableTimeout !== true) {
                                acceptTranscriptionScheduler.cancel();
                            }
                        }
                        break;
                    case speechService_1.SpeechToTextStatus.Recognized:
                        if (text) {
                            inputValue = [inputValue, text].join(' ');
                            session.controller.updateInput(inputValue);
                            if (voiceChatTimeout > 0 && context?.voice?.disableTimeout !== true) {
                                acceptTranscriptionScheduler.schedule();
                            }
                        }
                        break;
                    case speechService_1.SpeechToTextStatus.Stopped:
                        this.stop(session.id, controller.context);
                        break;
                }
            }));
        }
        onDidSpeechToTextSessionStart(controller, disposables) {
            this.voiceChatGettingReadyKey.set(false);
            this.voiceChatInProgressKey.set(true);
            switch (controller.context) {
                case 'inline':
                    this.inlineVoiceChatInProgressKey.set(true);
                    break;
                case 'quick':
                    this.quickVoiceChatInProgressKey.set(true);
                    break;
                case 'view':
                    this.voiceChatInViewInProgressKey.set(true);
                    break;
                case 'editor':
                    this.voiceChatInEditorInProgressKey.set(true);
                    break;
            }
            let dotCount = 0;
            const updatePlaceholder = () => {
                dotCount = (dotCount + 1) % 4;
                controller.setInputPlaceholder(`${(0, nls_1.localize)('listening', "I'm listening")}${'.'.repeat(dotCount)}`);
                placeholderScheduler.schedule();
            };
            const placeholderScheduler = disposables.add(new async_1.RunOnceScheduler(updatePlaceholder, 500));
            updatePlaceholder();
        }
        stop(voiceChatSessionId = this.voiceChatSessionIds, context) {
            if (!this.currentVoiceChatSession ||
                this.voiceChatSessionIds !== voiceChatSessionId ||
                (context && this.currentVoiceChatSession.controller.context !== context)) {
                return;
            }
            this.currentVoiceChatSession.controller.clearInputPlaceholder();
            this.currentVoiceChatSession.disposables.dispose();
            this.currentVoiceChatSession = undefined;
            this.voiceChatGettingReadyKey.set(false);
            this.voiceChatInProgressKey.set(false);
            this.quickVoiceChatInProgressKey.set(false);
            this.inlineVoiceChatInProgressKey.set(false);
            this.voiceChatInViewInProgressKey.set(false);
            this.voiceChatInEditorInProgressKey.set(false);
        }
        accept(voiceChatSessionId = this.voiceChatSessionIds) {
            if (!this.currentVoiceChatSession ||
                this.voiceChatSessionIds !== voiceChatSessionId) {
                return;
            }
            this.currentVoiceChatSession.controller.acceptInput();
        }
    };
    VoiceChatSessions = VoiceChatSessions_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, speechService_1.ISpeechService),
        __param(2, configuration_1.IConfigurationService)
    ], VoiceChatSessions);
    class VoiceChatInChatViewAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.voiceChatInChatView'; }
        constructor() {
            super({
                id: VoiceChatInChatViewAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.voiceChatInView.label', "Voice Chat in Chat View"),
                    original: 'Voice Chat in Chat View'
                },
                category: chatActions_1.CHAT_CATEGORY,
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, chatContextKeys_1.CONTEXT_PROVIDER_EXISTS, chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
                f1: true
            });
        }
        async run(accessor, context) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'view');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller, context);
            }
        }
    }
    exports.VoiceChatInChatViewAction = VoiceChatInChatViewAction;
    class InlineVoiceChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.inlineVoiceChat'; }
        constructor() {
            super({
                id: InlineVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.inlineVoiceChat', "Inline Voice Chat"),
                    original: 'Inline Voice Chat'
                },
                category: chatActions_1.CHAT_CATEGORY,
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, chatContextKeys_1.CONTEXT_PROVIDER_EXISTS, contextkeys_1.ActiveEditorContext, chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
                f1: true
            });
        }
        async run(accessor, context) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'inline');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller, context);
            }
        }
    }
    exports.InlineVoiceChatAction = InlineVoiceChatAction;
    class QuickVoiceChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.quickVoiceChat'; }
        constructor() {
            super({
                id: QuickVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.quickVoiceChat.label', "Quick Voice Chat"),
                    original: 'Quick Voice Chat'
                },
                category: chatActions_1.CHAT_CATEGORY,
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, chatContextKeys_1.CONTEXT_PROVIDER_EXISTS, chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
                f1: true
            });
        }
        async run(accessor, context) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'quick');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller, context);
            }
        }
    }
    exports.QuickVoiceChatAction = QuickVoiceChatAction;
    class StartVoiceChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.startVoiceChat'; }
        constructor() {
            super({
                id: StartVoiceChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.startVoiceChat.label', "Use Microphone"),
                    original: 'Use Microphone'
                },
                category: chatActions_1.CHAT_CATEGORY,
                icon: codicons_1.Codicon.mic,
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_GETTING_READY.negate(), chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate(), inlineChat_1.CTX_INLINE_CHAT_HAS_ACTIVE_REQUEST.negate()),
                menu: [{
                        id: actions_1.MenuId.ChatExecute,
                        when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS.negate(), CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS.negate(), CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS.negate()),
                        group: 'navigation',
                        order: -1
                    }, {
                        id: inlineChat_1.MENU_INLINE_CHAT_INPUT,
                        when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS.negate()),
                        group: 'main',
                        order: -1
                    }]
            });
        }
        async run(accessor, context) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const commandService = accessor.get(commands_1.ICommandService);
            const widget = context?.widget;
            if (widget) {
                // if we already get a context when the action is executed
                // from a toolbar within the chat widget, then make sure
                // to move focus into the input field so that the controller
                // is properly retrieved
                // TODO@bpasero this will actually not work if the button
                // is clicked from the inline editor while focus is in a
                // chat input field in a view or picker
                widget.focusInput();
            }
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'focused');
            if (controller) {
                VoiceChatSessions.getInstance(instantiationService).start(controller, context);
            }
            else {
                // fallback to Quick Voice Chat command
                commandService.executeCommand(QuickVoiceChatAction.ID, context);
            }
        }
    }
    exports.StartVoiceChatAction = StartVoiceChatAction;
    class StopListeningAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopListening'; }
        constructor() {
            super({
                id: StopListeningAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopListening.label', "Stop Listening"),
                    original: 'Stop Listening'
                },
                category: chatActions_1.CHAT_CATEGORY,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_PROGRESS),
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_PROGRESS)
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop();
        }
    }
    exports.StopListeningAction = StopListeningAction;
    class StopListeningInChatViewAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopListeningInChatView'; }
        constructor() {
            super({
                id: StopListeningInChatViewAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopListeningInChatView.label', "Stop Listening"),
                    original: 'Stop Listening'
                },
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS),
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS),
                icon: iconRegistry_1.spinningLoading,
                menu: [{
                        id: actions_1.MenuId.ChatExecute,
                        when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_VIEW_IN_PROGRESS),
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop(undefined, 'view');
        }
    }
    exports.StopListeningInChatViewAction = StopListeningInChatViewAction;
    class StopListeningInChatEditorAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopListeningInChatEditor'; }
        constructor() {
            super({
                id: StopListeningInChatEditorAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopListeningInChatEditor.label', "Stop Listening"),
                    original: 'Stop Listening'
                },
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS),
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS),
                icon: iconRegistry_1.spinningLoading,
                menu: [{
                        id: actions_1.MenuId.ChatExecute,
                        when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_EDITOR_IN_PROGRESS),
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop(undefined, 'editor');
        }
    }
    exports.StopListeningInChatEditorAction = StopListeningInChatEditorAction;
    class StopListeningInQuickChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopListeningInQuickChat'; }
        constructor() {
            super({
                id: StopListeningInQuickChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopListeningInQuickChat.label', "Stop Listening"),
                    original: 'Stop Listening'
                },
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS),
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS),
                icon: iconRegistry_1.spinningLoading,
                menu: [{
                        id: actions_1.MenuId.ChatExecute,
                        when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_QUICK_VOICE_CHAT_IN_PROGRESS),
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop(undefined, 'quick');
        }
    }
    exports.StopListeningInQuickChatAction = StopListeningInQuickChatAction;
    class StopListeningInInlineChatAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopListeningInInlineChat'; }
        constructor() {
            super({
                id: StopListeningInInlineChatAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopListeningInInlineChat.label', "Stop Listening"),
                    original: 'Stop Listening'
                },
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
                    when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS),
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS),
                icon: iconRegistry_1.spinningLoading,
                menu: [{
                        id: inlineChat_1.MENU_INLINE_CHAT_INPUT,
                        when: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_INLINE_VOICE_CHAT_IN_PROGRESS),
                        group: 'main',
                        order: -1
                    }]
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).stop(undefined, 'inline');
        }
    }
    exports.StopListeningInInlineChatAction = StopListeningInInlineChatAction;
    class StopListeningAndSubmitAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.stopListeningAndSubmit'; }
        constructor() {
            super({
                id: StopListeningAndSubmitAction.ID,
                title: {
                    value: (0, nls_1.localize)('workbench.action.chat.stopListeningAndSubmit.label', "Stop Listening and Submit"),
                    original: 'Stop Listening and Submit'
                },
                category: chatActions_1.CHAT_CATEGORY,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(speechService_1.HasSpeechProvider, CONTEXT_VOICE_CHAT_IN_PROGRESS)
            });
        }
        run(accessor) {
            VoiceChatSessions.getInstance(accessor.get(instantiation_1.IInstantiationService)).accept();
        }
    }
    exports.StopListeningAndSubmitAction = StopListeningAndSubmitAction;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        let activeRecordingColor;
        let activeRecordingDimmedColor;
        if (theme.type === theme_2.ColorScheme.LIGHT || theme.type === theme_2.ColorScheme.DARK) {
            activeRecordingColor = theme.getColor(theme_1.ACTIVITY_BAR_BADGE_BACKGROUND) ?? theme.getColor(colorRegistry_1.focusBorder);
            activeRecordingDimmedColor = activeRecordingColor?.transparent(0.2);
        }
        else {
            activeRecordingColor = theme.getColor(colorRegistry_1.contrastBorder);
            activeRecordingDimmedColor = theme.getColor(colorRegistry_1.contrastBorder);
        }
        // Show a "microphone" icon when recording is in progress that glows via outline.
        collector.addRule(`
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled),
		.monaco-workbench:not(.reduce-motion) .inline-chat .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled) {
			color: ${activeRecordingColor};
			outline: 1px solid ${activeRecordingColor};
			outline-offset: -1px;
			animation: pulseAnimation 1s infinite;
			border-radius: 50%;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::before,
		.monaco-workbench:not(.reduce-motion) .inline-chat .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::before {
			position: absolute;
			outline: 1px solid ${activeRecordingColor};
			outline-offset: 2px;
			border-radius: 50%;
			width: 16px;
			height: 16px;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::after,
		.monaco-workbench:not(.reduce-motion) .inline-chat .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::after {
			content: '';
			position: absolute;
			outline: 1px solid ${activeRecordingDimmedColor};
			outline-offset: 3px;
			animation: pulseAnimation 1s infinite;
			border-radius: 50%;
			width: 16px;
			height: 16px;
		}

		@keyframes pulseAnimation {
			0% {
				outline-width: 1px;
			}
			50% {
				outline-width: 3px;
				outline-color: ${activeRecordingDimmedColor};
			}
			100% {
				outline-width: 1px;
			}
		}
	`);
    });
    function supportsKeywordActivation(configurationService, speechService) {
        if (!speechService.hasSpeechProvider) {
            return false;
        }
        const value = configurationService.getValue(chatService_1.KEYWORD_ACTIVIATION_SETTING_ID);
        return typeof value === 'string' && value !== KeywordActivationContribution.SETTINGS_VALUE.OFF;
    }
    let KeywordActivationContribution = class KeywordActivationContribution extends lifecycle_1.Disposable {
        static { KeywordActivationContribution_1 = this; }
        static { this.SETTINGS_VALUE = {
            OFF: 'off',
            INLINE_CHAT: 'inlineChat',
            QUICK_CHAT: 'quickChat',
            VIEW_CHAT: 'chatInView',
            CHAT_IN_CONTEXT: 'chatInContext'
        }; }
        constructor(speechService, configurationService, commandService, editorGroupService, instantiationService, codeEditorService, editorService, hostService, chatService) {
            super();
            this.speechService = speechService;
            this.configurationService = configurationService;
            this.commandService = commandService;
            this.editorGroupService = editorGroupService;
            this.codeEditorService = codeEditorService;
            this.editorService = editorService;
            this.hostService = hostService;
            this.chatService = chatService;
            this.activeSession = undefined;
            this._register(instantiationService.createInstance(KeywordActivationStatusEntry));
            this.registerListeners();
        }
        registerListeners() {
            this._register(event_1.Event.runAndSubscribe(this.speechService.onDidRegisterSpeechProvider, () => {
                this.updateConfiguration();
                this.handleKeywordActivation();
            }));
            this._register(this.chatService.onDidRegisterProvider(() => this.updateConfiguration()));
            this._register(this.speechService.onDidStartSpeechToTextSession(() => this.handleKeywordActivation()));
            this._register(this.speechService.onDidEndSpeechToTextSession(() => this.handleKeywordActivation()));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(chatService_1.KEYWORD_ACTIVIATION_SETTING_ID)) {
                    this.handleKeywordActivation();
                }
            }));
            this._register(this.editorGroupService.onDidCreateAuxiliaryEditorPart(({ instantiationService, disposables }) => {
                disposables.add(instantiationService.createInstance(KeywordActivationStatusEntry));
            }));
        }
        updateConfiguration() {
            if (!this.speechService.hasSpeechProvider || this.chatService.getProviderInfos().length === 0) {
                return; // these settings require a speech and chat provider
            }
            const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            registry.registerConfiguration({
                ...accessibilityConfiguration_1.accessibilityConfigurationNodeBase,
                properties: {
                    [chatService_1.KEYWORD_ACTIVIATION_SETTING_ID]: {
                        'type': 'string',
                        'enum': [
                            KeywordActivationContribution_1.SETTINGS_VALUE.OFF,
                            KeywordActivationContribution_1.SETTINGS_VALUE.VIEW_CHAT,
                            KeywordActivationContribution_1.SETTINGS_VALUE.QUICK_CHAT,
                            KeywordActivationContribution_1.SETTINGS_VALUE.INLINE_CHAT,
                            KeywordActivationContribution_1.SETTINGS_VALUE.CHAT_IN_CONTEXT
                        ],
                        'enumDescriptions': [
                            (0, nls_1.localize)('voice.keywordActivation.off', "Keyword activation is disabled."),
                            (0, nls_1.localize)('voice.keywordActivation.chatInView', "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the chat view."),
                            (0, nls_1.localize)('voice.keywordActivation.quickChat', "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the quick chat."),
                            (0, nls_1.localize)('voice.keywordActivation.inlineChat', "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the active editor."),
                            (0, nls_1.localize)('voice.keywordActivation.chatInContext', "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the active editor or view depending on keyboard focus.")
                        ],
                        'description': (0, nls_1.localize)('voice.keywordActivation', "Controls whether the keyword phrase 'Hey Code' is recognized to start a voice chat session. Enabling this will start recording from the microphone but the audio is processed locally and never sent to a server."),
                        'default': 'off',
                        'tags': ['accessibility']
                    }
                }
            });
        }
        handleKeywordActivation() {
            const enabled = supportsKeywordActivation(this.configurationService, this.speechService) &&
                !this.speechService.hasActiveSpeechToTextSession;
            if ((enabled && this.activeSession) ||
                (!enabled && !this.activeSession)) {
                return; // already running or stopped
            }
            // Start keyword activation
            if (enabled) {
                this.enableKeywordActivation();
            }
            // Stop keyword activation
            else {
                this.disableKeywordActivation();
            }
        }
        async enableKeywordActivation() {
            const session = this.activeSession = new cancellation_1.CancellationTokenSource();
            const result = await this.speechService.recognizeKeyword(session.token);
            if (session.token.isCancellationRequested || session !== this.activeSession) {
                return; // cancelled
            }
            this.activeSession = undefined;
            if (result === speechService_1.KeywordRecognitionStatus.Recognized) {
                if (this.hostService.hasFocus) {
                    this.commandService.executeCommand(this.getKeywordCommand());
                }
                // Immediately start another keyboard activation session
                // because we cannot assume that the command we execute
                // will trigger a speech recognition session.
                this.handleKeywordActivation();
            }
        }
        getKeywordCommand() {
            const setting = this.configurationService.getValue(chatService_1.KEYWORD_ACTIVIATION_SETTING_ID);
            switch (setting) {
                case KeywordActivationContribution_1.SETTINGS_VALUE.INLINE_CHAT:
                    return InlineVoiceChatAction.ID;
                case KeywordActivationContribution_1.SETTINGS_VALUE.QUICK_CHAT:
                    return QuickVoiceChatAction.ID;
                case KeywordActivationContribution_1.SETTINGS_VALUE.CHAT_IN_CONTEXT:
                    if (getFocusedCodeEditor(this.editorService, this.codeEditorService)) {
                        return InlineVoiceChatAction.ID;
                    }
                default:
                    return VoiceChatInChatViewAction.ID;
            }
        }
        disableKeywordActivation() {
            this.activeSession?.dispose(true);
            this.activeSession = undefined;
        }
        dispose() {
            this.activeSession?.dispose();
            super.dispose();
        }
    };
    exports.KeywordActivationContribution = KeywordActivationContribution;
    exports.KeywordActivationContribution = KeywordActivationContribution = KeywordActivationContribution_1 = __decorate([
        __param(0, speechService_1.ISpeechService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, commands_1.ICommandService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, codeEditorService_1.ICodeEditorService),
        __param(6, editorService_1.IEditorService),
        __param(7, host_1.IHostService),
        __param(8, chatService_1.IChatService)
    ], KeywordActivationContribution);
    let KeywordActivationStatusEntry = class KeywordActivationStatusEntry extends lifecycle_1.Disposable {
        static { KeywordActivationStatusEntry_1 = this; }
        static { this.STATUS_NAME = (0, nls_1.localize)('keywordActivation.status.name', "Voice Keyword Activation"); }
        static { this.STATUS_COMMAND = 'keywordActivation.status.command'; }
        static { this.STATUS_ACTIVE = (0, nls_1.localize)('keywordActivation.status.active', "Listening to 'Hey Code'..."); }
        static { this.STATUS_INACTIVE = (0, nls_1.localize)('keywordActivation.status.inactive', "Waiting for voice chat to end..."); }
        constructor(speechService, statusbarService, commandService, configurationService) {
            super();
            this.speechService = speechService;
            this.statusbarService = statusbarService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.entry = this._register(new lifecycle_1.MutableDisposable());
            commands_1.CommandsRegistry.registerCommand(KeywordActivationStatusEntry_1.STATUS_COMMAND, () => this.commandService.executeCommand('workbench.action.openSettings', chatService_1.KEYWORD_ACTIVIATION_SETTING_ID));
            this.registerListeners();
            this.updateStatusEntry();
        }
        registerListeners() {
            this._register(this.speechService.onDidStartKeywordRecognition(() => this.updateStatusEntry()));
            this._register(this.speechService.onDidEndKeywordRecognition(() => this.updateStatusEntry()));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(chatService_1.KEYWORD_ACTIVIATION_SETTING_ID)) {
                    this.updateStatusEntry();
                }
            }));
        }
        updateStatusEntry() {
            const visible = supportsKeywordActivation(this.configurationService, this.speechService);
            if (visible) {
                if (!this.entry.value) {
                    this.createStatusEntry();
                }
                this.updateStatusLabel();
            }
            else {
                this.entry.clear();
            }
        }
        createStatusEntry() {
            this.entry.value = this.statusbarService.addEntry(this.getStatusEntryProperties(), 'status.voiceKeywordActivation', 1 /* StatusbarAlignment.RIGHT */, 103);
        }
        getStatusEntryProperties() {
            return {
                name: KeywordActivationStatusEntry_1.STATUS_NAME,
                text: this.speechService.hasActiveKeywordRecognition ? '$(mic-filled)' : '$(mic)',
                tooltip: this.speechService.hasActiveKeywordRecognition ? KeywordActivationStatusEntry_1.STATUS_ACTIVE : KeywordActivationStatusEntry_1.STATUS_INACTIVE,
                ariaLabel: this.speechService.hasActiveKeywordRecognition ? KeywordActivationStatusEntry_1.STATUS_ACTIVE : KeywordActivationStatusEntry_1.STATUS_INACTIVE,
                command: KeywordActivationStatusEntry_1.STATUS_COMMAND,
                kind: 'prominent'
            };
        }
        updateStatusLabel() {
            this.entry.value?.update(this.getStatusEntryProperties());
        }
    };
    KeywordActivationStatusEntry = KeywordActivationStatusEntry_1 = __decorate([
        __param(0, speechService_1.ISpeechService),
        __param(1, statusbar_1.IStatusbarService),
        __param(2, commands_1.ICommandService),
        __param(3, configuration_1.IConfigurationService)
    ], KeywordActivationStatusEntry);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2VDaGF0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9lbGVjdHJvbi1zYW5kYm94L2FjdGlvbnMvdm9pY2VDaGF0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBaURoRyxNQUFNLGdDQUFnQyxHQUFHLElBQUksMEJBQWEsQ0FBVSx1QkFBdUIsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyx1QkFBdUIsRUFBRSx1RkFBdUYsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsUSxNQUFNLDhCQUE4QixHQUFHLElBQUksMEJBQWEsQ0FBVSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSwwRUFBMEUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUUvTyxNQUFNLG9DQUFvQyxHQUFHLElBQUksMEJBQWEsQ0FBVSwwQkFBMEIsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSwwRUFBMEUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvUCxNQUFNLHFDQUFxQyxHQUFHLElBQUksMEJBQWEsQ0FBVSwyQkFBMkIsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSwyRUFBMkUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuUSxNQUFNLHNDQUFzQyxHQUFHLElBQUksMEJBQWEsQ0FBVSwyQkFBMkIsRUFBRSxLQUFLLEVBQUUsRUFB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
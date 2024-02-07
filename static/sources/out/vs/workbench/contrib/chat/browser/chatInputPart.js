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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/aria/aria", "vs/base/common/event", "vs/base/common/history", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/services/model", "vs/editor/contrib/hover/browser/hover", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/workbench/browser/style", "vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/workbench/contrib/chat/browser/chatFollowups", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/workbench/contrib/chat/common/chatWidgetHistoryService", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/chat/browser/actions/chatActions"], function (require, exports, dom, actionViewItems_1, aria, event_1, history_1, lifecycle_1, platform_1, uri_1, editorExtensions_1, codeEditorWidget_1, model_1, hover_1, nls_1, accessibility_1, toolbar_1, actions_1, configuration_1, contextkey_1, contextScopedHistoryWidget_1, instantiation_1, serviceCollection_1, keybinding_1, style_1, chatExecuteActions_1, chatFollowups_1, chatAgents_1, chatContextKeys_1, chatParserTypes_1, chatWidgetHistoryService_1, simpleEditorOptions_1, chatActions_1) {
    "use strict";
    var ChatInputPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatInputPart = void 0;
    const $ = dom.$;
    const INPUT_EDITOR_MAX_HEIGHT = 250;
    let ChatInputPart = class ChatInputPart extends lifecycle_1.Disposable {
        static { ChatInputPart_1 = this; }
        static { this.INPUT_SCHEME = 'chatSessionInput'; }
        static { this._counter = 0; }
        get inputEditor() {
            return this._inputEditor;
        }
        constructor(
        // private readonly editorOptions: ChatEditorOptions, // TODO this should be used
        options, historyService, modelService, instantiationService, contextKeyService, configurationService, keybindingService, accessibilityService) {
            super();
            this.options = options;
            this.historyService = historyService;
            this.modelService = modelService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.accessibilityService = accessibilityService;
            this._onDidLoadInputState = this._register(new event_1.Emitter());
            this.onDidLoadInputState = this._onDidLoadInputState.event;
            this._onDidChangeHeight = this._register(new event_1.Emitter());
            this.onDidChangeHeight = this._onDidChangeHeight.event;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onDidAcceptFollowup = this._register(new event_1.Emitter());
            this.onDidAcceptFollowup = this._onDidAcceptFollowup.event;
            this.inputEditorHeight = 0;
            this.followupsDisposables = this._register(new lifecycle_1.DisposableStore());
            this.onHistoryEntry = false;
            this.inputUri = uri_1.URI.parse(`${ChatInputPart_1.INPUT_SCHEME}:input-${ChatInputPart_1._counter++}`);
            this.inputEditorHasText = chatContextKeys_1.CONTEXT_CHAT_INPUT_HAS_TEXT.bindTo(contextKeyService);
            this.chatCursorAtTop = chatContextKeys_1.CONTEXT_CHAT_INPUT_CURSOR_AT_TOP.bindTo(contextKeyService);
            this.history = new history_1.HistoryNavigator([], 5);
            this._register(this.historyService.onDidClearHistory(() => this.history.clear()));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */)) {
                    this.inputEditor.updateOptions({ ariaLabel: this._getAriaLabel() });
                }
            }));
        }
        _getAriaLabel() {
            const verbose = this.configurationService.getValue("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */);
            if (verbose) {
                const kbLabel = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                return kbLabel ? (0, nls_1.localize)('actions.chat.accessibiltyHelp', "Chat Input,  Type to ask questions or type / for topics, press enter to send out the request. Use {0} for Chat Accessibility Help.", kbLabel) : (0, nls_1.localize)('chatInput.accessibilityHelpNoKb', "Chat Input,  Type code here and press Enter to run. Use the Chat Accessibility Help command for more information.");
            }
            return (0, nls_1.localize)('chatInput', "Chat Input");
        }
        setState(providerId, inputValue) {
            this.providerId = providerId;
            const history = this.historyService.getHistory(providerId);
            this.history = new history_1.HistoryNavigator(history, 50);
            if (typeof inputValue === 'string') {
                this.setValue(inputValue);
            }
        }
        get element() {
            return this.container;
        }
        showPreviousValue() {
            this.navigateHistory(true);
        }
        showNextValue() {
            this.navigateHistory(false);
        }
        navigateHistory(previous) {
            const historyEntry = (previous ?
                (this.history.previous() ?? this.history.first()) : this.history.next())
                ?? { text: '' };
            this.onHistoryEntry = previous || this.history.current() !== null;
            aria.status(historyEntry.text);
            this.setValue(historyEntry.text);
            this._onDidLoadInputState.fire(historyEntry.state);
            if (previous) {
                this._inputEditor.setPosition({ lineNumber: 1, column: 1 });
            }
            else {
                const model = this._inputEditor.getModel();
                if (!model) {
                    return;
                }
                this._inputEditor.setPosition(getLastPosition(model));
            }
        }
        setValue(value) {
            this.inputEditor.setValue(value);
            // always leave cursor at the end
            this.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
        }
        focus() {
            this._inputEditor.focus();
        }
        hasFocus() {
            return this._inputEditor.hasWidgetFocus();
        }
        /**
         * Reset the input and update history.
         * @param userQuery If provided, this will be added to the history. Followups and programmatic queries should not be passed.
         */
        async acceptInput(userQuery, inputState) {
            if (userQuery) {
                this.history.add({ text: userQuery, state: inputState });
            }
            if (this.accessibilityService.isScreenReaderOptimized() && platform_1.isMacintosh) {
                this._acceptInputForVoiceover();
            }
            else {
                this._inputEditor.focus();
                this._inputEditor.setValue('');
            }
        }
        _acceptInputForVoiceover() {
            const domNode = this._inputEditor.getDomNode();
            if (!domNode) {
                return;
            }
            // Remove the input editor from the DOM temporarily to prevent VoiceOver
            // from reading the cleared text (the request) to the user.
            this._inputEditorElement.removeChild(domNode);
            this._inputEditor.setValue('');
            this._inputEditorElement.appendChild(domNode);
            this._inputEditor.focus();
        }
        render(container, initialValue, widget) {
            this.container = dom.append(container, $('.interactive-input-part'));
            this.followupsContainer = dom.append(this.container, $('.interactive-input-followups'));
            const inputAndSideToolbar = dom.append(this.container, $('.interactive-input-and-side-toolbar'));
            const inputContainer = dom.append(inputAndSideToolbar, $('.interactive-input-and-execute-toolbar'));
            const inputScopedContextKeyService = this._register(this.contextKeyService.createScoped(inputContainer));
            chatContextKeys_1.CONTEXT_IN_CHAT_INPUT.bindTo(inputScopedContextKeyService).set(true);
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, inputScopedContextKeyService]));
            const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register((0, contextScopedHistoryWidget_1.registerAndCreateHistoryNavigationContext)(inputScopedContextKeyService, this));
            this.historyNavigationBackwardsEnablement = historyNavigationBackwardsEnablement;
            this.historyNavigationForewardsEnablement = historyNavigationForwardsEnablement;
            const options = (0, simpleEditorOptions_1.getSimpleEditorOptions)(this.configurationService);
            options.readOnly = false;
            options.ariaLabel = this._getAriaLabel();
            options.fontFamily = style_1.DEFAULT_FONT_FAMILY;
            options.fontSize = 13;
            options.lineHeight = 20;
            options.padding = this.options.renderStyle === 'compact' ? { top: 2, bottom: 2 } : { top: 8, bottom: 8 };
            options.cursorWidth = 1;
            options.wrappingStrategy = 'advanced';
            options.bracketPairColorization = { enabled: false };
            options.suggest = {
                showIcons: false,
                showSnippets: false,
                showWords: true,
                showStatusBar: false,
                insertMode: 'replace',
            };
            options.scrollbar = { ...(options.scrollbar ?? {}), vertical: 'hidden' };
            this._inputEditorElement = dom.append(inputContainer, $('.interactive-input-editor'));
            const editorOptions = (0, simpleEditorOptions_1.getSimpleCodeEditorWidgetOptions)();
            editorOptions.contributions?.push(...editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([hover_1.HoverController.ID]));
            this._inputEditor = this._register(scopedInstantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this._inputEditorElement, options, editorOptions));
            this._register(this._inputEditor.onDidChangeModelContent(() => {
                const currentHeight = Math.min(this._inputEditor.getContentHeight(), INPUT_EDITOR_MAX_HEIGHT);
                if (currentHeight !== this.inputEditorHeight) {
                    this.inputEditorHeight = currentHeight;
                    this._onDidChangeHeight.fire();
                }
                // Only allow history navigation when the input is empty.
                // (If this model change happened as a result of a history navigation, this is canceled out by a call in this.navigateHistory)
                const model = this._inputEditor.getModel();
                const inputHasText = !!model && model.getValueLength() > 0;
                this.inputEditorHasText.set(inputHasText);
                if (!this.onHistoryEntry) {
                    this.historyNavigationForewardsEnablement.set(!inputHasText);
                    this.historyNavigationBackwardsEnablement.set(!inputHasText);
                }
            }));
            this._register(this._inputEditor.onDidFocusEditorText(() => {
                this._onDidFocus.fire();
                inputContainer.classList.toggle('focused', true);
            }));
            this._register(this._inputEditor.onDidBlurEditorText(() => {
                inputContainer.classList.toggle('focused', false);
                this._onDidBlur.fire();
            }));
            this._register(this._inputEditor.onDidChangeCursorPosition(e => {
                const model = this._inputEditor.getModel();
                if (!model) {
                    return;
                }
                const atTop = e.position.column === 1 && e.position.lineNumber === 1;
                this.chatCursorAtTop.set(atTop);
                if (this.onHistoryEntry) {
                    this.historyNavigationBackwardsEnablement.set(atTop);
                    this.historyNavigationForewardsEnablement.set(e.position.equals(getLastPosition(model)));
                }
            }));
            this.toolbar = this._register(this.instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, inputContainer, actions_1.MenuId.ChatExecute, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                actionViewItemProvider: (action, options) => {
                    if (action.id === chatExecuteActions_1.SubmitAction.ID) {
                        return this.instantiationService.createInstance(SubmitButtonActionViewItem, { widget }, action, options);
                    }
                    return undefined;
                }
            }));
            this.toolbar.getElement().classList.add('interactive-execute-toolbar');
            this.toolbar.context = { widget };
            this._register(this.toolbar.onDidChangeMenuItems(() => {
                if (this.cachedDimensions && typeof this.cachedToolbarWidth === 'number' && this.cachedToolbarWidth !== this.toolbar.getItemsWidth()) {
                    this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
                }
            }));
            if (this.options.renderStyle === 'compact') {
                const toolbarSide = this._register(this.instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, inputAndSideToolbar, actions_1.MenuId.ChatInputSide, {
                    menuOptions: {
                        shouldForwardArgs: true
                    }
                }));
                toolbarSide.getElement().classList.add('chat-side-toolbar');
                toolbarSide.context = { widget };
            }
            this.inputModel = this.modelService.getModel(this.inputUri) || this.modelService.createModel('', null, this.inputUri, true);
            this.inputModel.updateOptions({ bracketColorizationOptions: { enabled: false, independentColorPoolPerBracketType: false } });
            this._inputEditor.setModel(this.inputModel);
            if (initialValue) {
                this.inputModel.setValue(initialValue);
                const lineNumber = this.inputModel.getLineCount();
                this._inputEditor.setPosition({ lineNumber, column: this.inputModel.getLineMaxColumn(lineNumber) });
            }
        }
        async renderFollowups(items, response) {
            if (!this.options.renderFollowups) {
                return;
            }
            this.followupsDisposables.clear();
            dom.clearNode(this.followupsContainer);
            if (items && items.length > 0) {
                this.followupsDisposables.add(new chatFollowups_1.ChatFollowups(this.followupsContainer, items, undefined, followup => this._onDidAcceptFollowup.fire({ followup, response }), this.contextKeyService));
            }
        }
        layout(height, width) {
            this.cachedDimensions = new dom.Dimension(width, height);
            return this._layout(height, width);
        }
        _layout(height, width, allowRecurse = true) {
            const followupsHeight = this.followupsContainer.offsetHeight;
            const inputPartBorder = 1;
            const inputPartHorizontalPadding = 40;
            const inputPartVerticalPadding = 24;
            const inputEditorHeight = Math.min(this._inputEditor.getContentHeight(), height - followupsHeight - inputPartHorizontalPadding - inputPartBorder, INPUT_EDITOR_MAX_HEIGHT);
            const inputEditorBorder = 2;
            const inputPartHeight = followupsHeight + inputEditorHeight + inputPartVerticalPadding + inputPartBorder + inputEditorBorder;
            const editorBorder = 2;
            const editorPadding = 8;
            const executeToolbarWidth = this.cachedToolbarWidth = this.toolbar.getItemsWidth();
            const sideToolbarWidth = this.options.renderStyle === 'compact' ? 20 : 0;
            const initialEditorScrollWidth = this._inputEditor.getScrollWidth();
            this._inputEditor.layout({ width: width - inputPartHorizontalPadding - editorBorder - editorPadding - executeToolbarWidth - sideToolbarWidth, height: inputEditorHeight });
            if (allowRecurse && initialEditorScrollWidth < 10) {
                // This is probably the initial layout. Now that the editor is layed out with its correct width, it should report the correct contentHeight
                return this._layout(height, width, false);
            }
            return inputPartHeight;
        }
        saveState() {
            const inputHistory = this.history.getHistory();
            this.historyService.saveHistory(this.providerId, inputHistory);
        }
    };
    exports.ChatInputPart = ChatInputPart;
    exports.ChatInputPart = ChatInputPart = ChatInputPart_1 = __decorate([
        __param(1, chatWidgetHistoryService_1.IChatWidgetHistoryService),
        __param(2, model_1.IModelService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, accessibility_1.IAccessibilityService)
    ], ChatInputPart);
    let SubmitButtonActionViewItem = class SubmitButtonActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(context, action, options, keybindingService, chatAgentService) {
            super(context, action, options);
            const primaryKeybinding = keybindingService.lookupKeybinding(chatActions_1.ChatSubmitEditorAction.ID)?.getLabel();
            let tooltip = action.label;
            if (primaryKeybinding) {
                tooltip += ` (${primaryKeybinding})`;
            }
            const secondaryAgent = chatAgentService.getSecondaryAgent();
            if (secondaryAgent) {
                const secondaryKeybinding = keybindingService.lookupKeybinding(chatActions_1.ChatSubmitSecondaryAgentEditorAction.ID)?.getLabel();
                if (secondaryKeybinding) {
                    tooltip += `\n${chatParserTypes_1.chatAgentLeader}${secondaryAgent.id} (${secondaryKeybinding})`;
                }
            }
            this._tooltip = tooltip;
        }
        getTooltip() {
            return this._tooltip;
        }
    };
    SubmitButtonActionViewItem = __decorate([
        __param(3, keybinding_1.IKeybindingService),
        __param(4, chatAgents_1.IChatAgentService)
    ], SubmitButtonActionViewItem);
    function getLastPosition(model) {
        return { lineNumber: model.getLineCount(), column: model.getLineLength(model.getLineCount()) + 1 };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdElucHV0UGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRJbnB1dFBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTJDaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVoQixNQUFNLHVCQUF1QixHQUFHLEdBQUcsQ0FBQztJQUU3QixJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsc0JBQVU7O2lCQUM1QixpQkFBWSxHQUFHLGtCQUFrQixBQUFyQixDQUFzQjtpQkFDbkMsYUFBUSxHQUFHLENBQUMsQUFBSixDQUFLO1FBNEI1QixJQUFJLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDMUIsQ0FBQztRQWdCRDtRQUNDLGlGQUFpRjtRQUNoRSxPQUEwRSxFQUNoRSxjQUEwRCxFQUN0RSxZQUE0QyxFQUNwQyxvQkFBNEQsRUFDL0QsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUMvRCxpQkFBc0QsRUFDbkQsb0JBQTREO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBVFMsWUFBTyxHQUFQLE9BQU8sQ0FBbUU7WUFDL0MsbUJBQWMsR0FBZCxjQUFjLENBQTJCO1lBQ3JELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ25CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNsQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQXJENUUseUJBQW9CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBTyxDQUFDLENB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
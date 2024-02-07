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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/types", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatInputPart", "vs/workbench/contrib/chat/browser/chatListRenderer", "vs/workbench/contrib/chat/browser/chatOptions", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/platform/theme/common/themeService", "vs/css!./media/chat"], function (require, exports, dom, async_1, errorMessage_1, event_1, lifecycle_1, resources_1, types_1, actions_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, listService_1, log_1, viewsService_1, chat_1, chatInputPart_1, chatListRenderer_1, chatOptions_1, chatContextKeys_1, chatContributionService_1, chatModel_1, chatService_1, chatViewModel_1, themeService_1) {
    "use strict";
    var ChatWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatWidgetService = exports.ChatWidget = void 0;
    const $ = dom.$;
    function revealLastElement(list) {
        list.scrollTop = list.scrollHeight - list.renderHeight;
    }
    let ChatWidget = class ChatWidget extends lifecycle_1.Disposable {
        static { ChatWidget_1 = this; }
        static { this.CONTRIBS = []; }
        get visible() {
            return this._visible;
        }
        set viewModel(viewModel) {
            if (this._viewModel === viewModel) {
                return;
            }
            this.viewModelDisposables.clear();
            this._viewModel = viewModel;
            if (viewModel) {
                this.viewModelDisposables.add(viewModel);
            }
            this._onDidChangeViewModel.fire();
        }
        get viewModel() {
            return this._viewModel;
        }
        constructor(viewContext, viewOptions, styles, contextKeyService, instantiationService, chatService, chatWidgetService, contextMenuService, _chatAccessibilityService, _instantiationService, _logService, _themeService) {
            super();
            this.viewContext = viewContext;
            this.viewOptions = viewOptions;
            this.styles = styles;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this.chatService = chatService;
            this.contextMenuService = contextMenuService;
            this._chatAccessibilityService = _chatAccessibilityService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._themeService = _themeService;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidChangeViewModel = this._register(new event_1.Emitter());
            this.onDidChangeViewModel = this._onDidChangeViewModel.event;
            this._onDidClear = this._register(new event_1.Emitter());
            this.onDidClear = this._onDidClear.event;
            this._onDidAcceptInput = this._register(new event_1.Emitter());
            this.onDidAcceptInput = this._onDidAcceptInput.event;
            this._onDidChangeHeight = this._register(new event_1.Emitter());
            this.onDidChangeHeight = this._onDidChangeHeight.event;
            this.contribs = [];
            this.visibleChangeCount = 0;
            this._visible = false;
            this.previousTreeScrollHeight = 0;
            this.viewModelDisposables = this._register(new lifecycle_1.DisposableStore());
            chatContextKeys_1.CONTEXT_IN_CHAT_SESSION.bindTo(contextKeyService).set(true);
            this.requestInProgress = chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS.bindTo(contextKeyService);
            this._register(chatWidgetService.register(this));
        }
        get supportsFileReferences() {
            return !!this.viewOptions.supportsFileReferences;
        }
        get providerId() {
            return this.viewModel?.providerId || '';
        }
        get inputEditor() {
            return this.inputPart.inputEditor;
        }
        get inputUri() {
            return this.inputPart.inputUri;
        }
        render(parent) {
            const viewId = 'viewId' in this.viewContext ? this.viewContext.viewId : undefined;
            this.editorOptions = this._register(this.instantiationService.createInstance(chatOptions_1.ChatEditorOptions, viewId, this.styles.listForeground, this.styles.inputEditorBackground, this.styles.resultEditorBackground));
            const renderInputOnTop = this.viewOptions.renderInputOnTop ?? false;
            const renderStyle = this.viewOptions.renderStyle;
            this.container = dom.append(parent, $('.interactive-session'));
            if (renderInputOnTop) {
                this.createInput(this.container, { renderFollowups: false, renderStyle });
                this.listContainer = dom.append(this.container, $(`.interactive-list`));
            }
            else {
                this.listContainer = dom.append(this.container, $(`.interactive-list`));
                this.createInput(this.container);
            }
            this.createList(this.listContainer, { renderStyle });
            this._register(this.editorOptions.onDidChange(() => this.onDidStyleChange()));
            this.onDidStyleChange();
            // Do initial render
            if (this.viewModel) {
                this.onDidChangeItems();
                revealLastElement(this.tree);
            }
            this.contribs = ChatWidget_1.CONTRIBS.map(contrib => {
                try {
                    return this._register(this.instantiationService.createInstance(contrib, this));
                }
                catch (err) {
                    this._logService.error('Failed to instantiate chat widget contrib', (0, errorMessage_1.toErrorMessage)(err));
                    return undefined;
                }
            }).filter(types_1.isDefined);
        }
        getContrib(id) {
            return this.contribs.find(c => c.id === id);
        }
        focusInput() {
            this.inputPart.focus();
        }
        hasInputFocus() {
            return this.inputPart.hasFocus();
        }
        moveFocus(item, type) {
            const items = this.viewModel?.getItems();
            if (!items) {
                return;
            }
            const responseItems = items.filter(i => (0, chatViewModel_1.isResponseVM)(i));
            const targetIndex = responseItems.indexOf(item);
            if (targetIndex === undefined) {
                return;
            }
            const indexToFocus = type === 'next' ? targetIndex + 1 : targetIndex - 1;
            if (indexToFocus < 0 || indexToFocus > responseItems.length - 1) {
                return;
            }
            this.focus(responseItems[indexToFocus]);
        }
        clear() {
            if (this._dynamicMessageLayoutData) {
                this._dynamicMessageLayoutData.enabled = true;
            }
            this._onDidClear.fire();
        }
        onDidChangeItems(skipDynamicLayout) {
            if (this.tree && this._visible) {
                const treeItems = (this.viewModel?.getItems() ?? [])
                    .map(item => {
                    return {
                        element: item,
                        collapsed: false,
                        collapsible: false
                    };
                });
                this.tree.setChildren(null, treeItems, {
                    diffIdentityProvider: {
                        getId: (element) => {
                            return (((0, chatViewModel_1.isResponseVM)(element) || (0, chatViewModel_1.isRequestVM)(element)) ? element.dataId : element.id) +
                                // TODO? We can give the welcome message a proper VM or get rid of the rest of the VMs
                                (((0, chatViewModel_1.isWelcomeVM)(element) && this.viewModel) ? `_${chatModel_1.ChatModelInitState[this.viewModel.initState]}` : '') +
                                // Ensure re-rendering an element once slash commands are loaded, so the colorization can be applied.
                                `${((0, chatViewModel_1.isRequestVM)(element) || (0, chatViewModel_1.isWelcomeVM)(element)) /* && !!this.lastSlashCommands ? '_scLoaded' : '' */}` +
                                // If a response is in the process of progressive rendering, we need to ensure that it will
                                // be re-rendered so progressive rendering is restarted, even if the model wasn't updated.
                                `${(0, chatViewModel_1.isResponseVM)(element) && element.renderData ? `_${this.visibleChangeCount}` : ''}` +
                                // Re-render once content references are loaded
                                ((0, chatViewModel_1.isResponseVM)(element) ? `_${element.contentReferences.length}` : '');
                        },
                    }
                });
                if (!skipDynamicLayout && this._dynamicMessageLayoutData) {
                    this.layoutDynamicChatTreeItemMode();
                }
                const lastItem = treeItems[treeItems.length - 1]?.element;
                if (lastItem && (0, chatViewModel_1.isResponseVM)(lastItem) && lastItem.isComplete) {
                    this.renderFollowups(lastItem.replyFollowups, lastItem);
                }
                else if (lastItem && (0, chatViewModel_1.isWelcomeVM)(lastItem)) {
                    this.renderFollowups(lastItem.sampleQuestions);
                }
                else {
                    this.renderFollowups(undefined);
                }
            }
        }
        async renderFollowups(items, response) {
            this.inputPart.renderFollowups(items, response);
            if (this.bodyDimension) {
                this.layout(this.bodyDimension.height, this.bodyDimension.width);
            }
        }
        setVisible(visible) {
            this._visible = visible;
            this.visibleChangeCount++;
            this.renderer.setVisible(visible);
            if (visible) {
                this._register((0, async_1.disposableTimeout)(() => {
                    // Progressive rendering paused while hidden, so start it up again.
                    // Do it after a timeout because the container is not visible yet (it should be but offsetHeight returns 0 here)
                    if (this._visible) {
                        this.onDidChangeItems(true);
                    }
                }, 0));
            }
        }
        createList(listContainer, options) {
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.contextKeyService]));
            const delegate = scopedInstantiationService.createInstance(chatListRenderer_1.ChatListDelegate);
            const rendererDelegate = {
                getListLength: () => this.tree.getNode(null).visibleChildrenCount,
            };
            this.renderer = this._register(scopedInstantiationService.createInstance(chatListRenderer_1.ChatListItemRenderer, this.editorOptions, options, rendererDelegate));
            this._register(this.renderer.onDidClickFollowup(item => {
                // is this used anymore?
                this.acceptInput(item.message);
            }));
            this.tree = scopedInstantiationService.createInstance(listService_1.WorkbenchObjectTree, 'Chat', listContainer, delegate, [this.renderer], {
                identityProvider: { getId: (e) => e.id },
                horizontalScrolling: false,
                supportDynamicHeights: true,
                hideTwistiesOfChildlessElements: true,
                accessibilityProvider: this._instantiationService.createInstance(chatListRenderer_1.ChatAccessibilityProvider),
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => (0, chatViewModel_1.isRequestVM)(e) ? e.message : (0, chatViewModel_1.isResponseVM)(e) ? e.response.value : '' }, // TODO
                setRowLineHeight: false,
                overrideStyles: {
                    listFocusBackground: this.styles.listBackground,
                    listInactiveFocusBackground: this.styles.listBackground,
                    listActiveSelectionBackground: this.styles.listBackground,
                    listFocusAndSelectionBackground: this.styles.listBackground,
                    listInactiveSelectionBackground: this.styles.listBackground,
                    listHoverBackground: this.styles.listBackground,
                    listBackground: this.styles.listBackground,
                    listFocusForeground: this.styles.listForeground,
                    listHoverForeground: this.styles.listForeground,
                    listInactiveFocusForeground: this.styles.listForeground,
                    listInactiveSelectionForeground: this.styles.listForeground,
                    listActiveSelectionForeground: this.styles.listForeground,
                    listFocusAndSelectionForeground: this.styles.listForeground,
                }
            });
            this.tree.onContextMenu(e => this.onContextMenu(e));
            this._register(this.tree.onDidChangeContentHeight(() => {
                this.onDidChangeTreeContentHeight();
            }));
            this._register(this.renderer.onDidChangeItemHeight(e => {
                this.tree.updateElementHeight(e.element, e.height);
            }));
            this._register(this.tree.onDidFocus(() => {
                this._onDidFocus.fire();
            }));
        }
        onContextMenu(e) {
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            const selected = e.element;
            const scopedContextKeyService = this.contextKeyService.createOverlay([
                [chatContextKeys_1.CONTEXT_RESPONSE_FILTERED.key, (0, chatViewModel_1.isResponseVM)(selected) && !!selected.errorDetails?.responseIsFiltered]
            ]);
            this.contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.ChatContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: scopedContextKeyService,
                getAnchor: () => e.anchor,
                getActionsContext: () => selected,
            });
        }
        onDidChangeTreeContentHeight() {
            if (this.tree.scrollHeight !== this.previousTreeScrollHeight) {
                // Due to rounding, the scrollTop + renderHeight will not exactly match the scrollHeight.
                // Consider the tree to be scrolled all the way down if it is within 2px of the bottom.
                const lastElementWasVisible = this.tree.scrollTop + this.tree.renderHeight >= this.previousTreeScrollHeight - 2;
                if (lastElementWasVisible) {
                    dom.scheduleAtNextAnimationFrame(dom.getWindow(this.listContainer), () => {
                        // Can't set scrollTop during this event listener, the list might overwrite the change
                        revealLastElement(this.tree);
                    }, 0);
                }
            }
            this.previousTreeScrollHeight = this.tree.scrollHeight;
        }
        createInput(container, options) {
            this.inputPart = this._register(this.instantiationService.createInstance(chatInputPart_1.ChatInputPart, {
                renderFollowups: options?.renderFollowups ?? true,
                renderStyle: options?.renderStyle,
            }));
            this.inputPart.render(container, '', this);
            this._register(this.inputPart.onDidLoadInputState(state => {
                this.contribs.forEach(c => {
                    if (c.setInputState && typeof state === 'object' && state?.[c.id]) {
                        c.setInputState(state[c.id]);
                    }
                });
            }));
            this._register(this.inputPart.onDidFocus(() => this._onDidFocus.fire()));
            this._register(this.inputPart.onDidAcceptFollowup(e => {
                if (!this.viewModel) {
                    return;
                }
                this.acceptInput(e.followup.message);
                if (!e.response) {
                    // Followups can be shown by the welcome message, then there is no response associated.
                    // At some point we probably want telemetry for these too.
                    return;
                }
                this.chatService.notifyUserAction({
                    providerId: this.viewModel.providerId,
                    sessionId: this.viewModel.sessionId,
                    requestId: e.response.requestId,
                    agentId: e.response?.agent?.id,
                    action: {
                        kind: 'followUp',
                        followup: e.followup
                    },
                });
            }));
            this._register(this.inputPart.onDidChangeHeight(() => this.bodyDimension && this.layout(this.bodyDimension.height, this.bodyDimension.width)));
        }
        onDidStyleChange() {
            this.container.style.setProperty('--vscode-interactive-result-editor-background-color', this.editorOptions.configuration.resultEditor.backgroundColor?.toString() ?? '');
            this.container.style.setProperty('--vscode-interactive-session-foreground', this.editorOptions.configuration.foreground?.toString() ?? '');
            this.container.style.setProperty('--vscode-chat-list-background', this._themeService.getColorTheme().getColor(this.styles.listBackground)?.toString() ?? '');
        }
        setModel(model, viewState) {
            if (!this.container) {
                throw new Error('Call render() before setModel()');
            }
            this.container.setAttribute('data-session-id', model.sessionId);
            this.viewModel = this.instantiationService.createInstance(chatViewModel_1.ChatViewModel, model);
            this.viewModelDisposables.add(this.viewModel.onDidChange(e => {
                this.requestInProgress.set(this.viewModel.requestInProgress);
                this.onDidChangeItems();
                if (e?.kind === 'addRequest') {
                    revealLastElement(this.tree);
                    this.focusInput();
                }
            }));
            this.viewModelDisposables.add(this.viewModel.onDidDisposeModel(() => {
                // Ensure that view state is saved here, because we will load it again when a new model is assigned
                this.inputPart.saveState();
                // Disposes the viewmodel and listeners
                this.viewModel = undefined;
                this.onDidChangeItems();
            }));
            this.inputPart.setState(model.providerId, viewState.inputValue);
            this.contribs.forEach(c => {
                if (c.setInputState && viewState.inputState?.[c.id]) {
                    c.setInputState(viewState.inputState?.[c.id]);
                }
            });
            if (this.tree) {
                this.onDidChangeItems();
                revealLastElement(this.tree);
            }
        }
        getFocus() {
            return this.tree.getFocus()[0] ?? undefined;
        }
        reveal(item) {
            this.tree.reveal(item);
        }
        focus(item) {
            const items = this.tree.getNode(null).children;
            const node = items.find(i => i.element?.id === item.id);
            if (!node) {
                return;
            }
            this.tree.setFocus([node.element]);
            this.tree.domFocus();
        }
        setInputPlaceholder(placeholder) {
            this.viewModel?.setInputPlaceholder(placeholder);
        }
        resetInputPlaceholder() {
            this.viewModel?.resetInputPlaceholder();
        }
        setInput(value = '') {
            this.inputPart.setValue(value);
        }
        getInput() {
            return this.inputPart.inputEditor.getValue();
        }
        async acceptInput(query) {
            this._acceptInput(query ? { query } : undefined);
        }
        async acceptInputWithPrefix(prefix) {
            this._acceptInput({ prefix });
        }
        collectInputState() {
            const inputState = {};
            this.contribs.forEach(c => {
                if (c.getInputState) {
                    inputState[c.id] = c.getInputState();
                }
            });
            return inputState;
        }
        async _acceptInput(opts) {
            if (this.viewModel) {
                this._onDidAcceptInput.fire();
                const editorValue = this.getInput();
                const requestId = this._chatAccessibilityService.acceptRequest();
                const input = !opts ? editorValue :
                    'query' in opts ? opts.query :
                        `${opts.prefix} ${editorValue}`;
                const isUserQuery = !opts || 'prefix' in opts;
                const result = await this.chatService.sendRequest(this.viewModel.sessionId, input);
                if (result) {
                    const inputState = this.collectInputState();
                    this.inputPart.acceptInput(isUserQuery ? input : undefined, isUserQuery ? inputState : undefined);
                    result.responseCompletePromise.then(async () => {
                        const responses = this.viewModel?.getItems().filter(chatViewModel_1.isResponseVM);
                        const lastResponse = responses?.[responses.length - 1];
                        this._chatAccessibilityService.acceptResponse(lastResponse, requestId);
                    });
                }
                else {
                    this._chatAccessibilityService.acceptResponse(undefined, requestId);
                }
            }
        }
        getCodeBlockInfosForResponse(response) {
            return this.renderer.getCodeBlockInfosForResponse(response);
        }
        getCodeBlockInfoForEditor(uri) {
            return this.renderer.getCodeBlockInfoForEditor(uri);
        }
        getFileTreeInfosForResponse(response) {
            return this.renderer.getFileTreeInfosForResponse(response);
        }
        getLastFocusedFileTreeForResponse(response) {
            return this.renderer.getLastFocusedFileTreeForResponse(response);
        }
        focusLastMessage() {
            if (!this.viewModel) {
                return;
            }
            const items = this.tree.getNode(null).children;
            const lastItem = items[items.length - 1];
            if (!lastItem) {
                return;
            }
            this.tree.setFocus([lastItem.element]);
            this.tree.domFocus();
        }
        layout(height, width) {
            width = Math.min(width, 850);
            this.bodyDimension = new dom.Dimension(width, height);
            const inputPartHeight = this.inputPart.layout(height, width);
            const lastElementVisible = this.tree.scrollTop + this.tree.renderHeight >= this.tree.scrollHeight;
            const listHeight = height - inputPartHeight;
            this.tree.layout(listHeight, width);
            this.tree.getHTMLElement().style.height = `${listHeight}px`;
            this.renderer.layout(width);
            if (lastElementVisible) {
                revealLastElement(this.tree);
            }
            this.listContainer.style.height = `${height - inputPartHeight}px`;
            this._onDidChangeHeight.fire(height);
        }
        // An alternative to layout, this allows you to specify the number of ChatTreeItems
        // you want to show, and the max height of the container. It will then layout the
        // tree to show that many items.
        // TODO@TylerLeonhardt: This could use some refactoring to make it clear which layout strategy is being used
        setDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
            this._dynamicMessageLayoutData = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
            this._register(this.renderer.onDidChangeItemHeight(() => this.layoutDynamicChatTreeItemMode()));
            const mutableDisposable = this._register(new lifecycle_1.MutableDisposable());
            this._register(this.tree.onDidScroll((e) => {
                // TODO@TylerLeonhardt this should probably just be disposed when this is disabled
                // and then set up again when it is enabled again
                if (!this._dynamicMessageLayoutData?.enabled) {
                    return;
                }
                mutableDisposable.value = dom.scheduleAtNextAnimationFrame(dom.getWindow(this.listContainer), () => {
                    if (!e.scrollTopChanged || e.heightChanged || e.scrollHeightChanged) {
                        return;
                    }
                    const renderHeight = e.height;
                    const diff = e.scrollHeight - renderHeight - e.scrollTop;
                    if (diff === 0) {
                        return;
                    }
                    const possibleMaxHeight = (this._dynamicMessageLayoutData?.maxHeight ?? maxHeight);
                    const width = this.bodyDimension?.width ?? this.container.offsetWidth;
                    const inputPartHeight = this.inputPart.layout(possibleMaxHeight, width);
                    const newHeight = Math.min(renderHeight + diff, possibleMaxHeight - inputPartHeight);
                    this.layout(newHeight + inputPartHeight, width);
                });
            }));
        }
        updateDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
            this._dynamicMessageLayoutData = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
            let hasChanged = false;
            let height = this.bodyDimension.height;
            let width = this.bodyDimension.width;
            if (maxHeight < this.bodyDimension.height) {
                height = maxHeight;
                hasChanged = true;
            }
            const containerWidth = this.container.offsetWidth;
            if (this.bodyDimension?.width !== containerWidth) {
                width = containerWidth;
                hasChanged = true;
            }
            if (hasChanged) {
                this.layout(height, width);
            }
        }
        get isDynamicChatTreeItemLayoutEnabled() {
            return this._dynamicMessageLayoutData?.enabled ?? false;
        }
        set isDynamicChatTreeItemLayoutEnabled(value) {
            if (!this._dynamicMessageLayoutData) {
                return;
            }
            this._dynamicMessageLayoutData.enabled = value;
        }
        layoutDynamicChatTreeItemMode() {
            if (!this.viewModel || !this._dynamicMessageLayoutData?.enabled) {
                return;
            }
            const width = this.bodyDimension?.width ?? this.container.offsetWidth;
            const inputHeight = this.inputPart.layout(this._dynamicMessageLayoutData.maxHeight, width);
            const totalMessages = this.viewModel.getItems();
            // grab the last N messages
            const messages = totalMessages.slice(-this._dynamicMessageLayoutData.numOfMessages);
            const needsRerender = messages.some(m => m.currentRenderedHeight === undefined);
            const listHeight = needsRerender
                ? this._dynamicMessageLayoutData.maxHeight
                : messages.reduce((acc, message) => acc + message.currentRenderedHeight, 0);
            this.layout(Math.min(
            // we add an additional 18px in order to show that there is scrollable content
            inputHeight + listHeight + (totalMessages.length > 2 ? 18 : 0), this._dynamicMessageLayoutData.maxHeight), width);
            if (needsRerender || !listHeight) {
                // TODO: figure out a better place to reveal the last element
                revealLastElement(this.tree);
            }
        }
        saveState() {
            this.inputPart.saveState();
        }
        getViewState() {
            this.inputPart.saveState();
            return { inputValue: this.getInput(), inputState: this.collectInputState() };
        }
    };
    exports.ChatWidget = ChatWidget;
    exports.ChatWidget = ChatWidget = ChatWidget_1 = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, chatService_1.IChatService),
        __param(6, chat_1.IChatWidgetService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, chat_1.IChatAccessibilityService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, log_1.ILogService),
        __param(11, themeService_1.IThemeService)
    ], ChatWidget);
    let ChatWidgetService = class ChatWidgetService {
        get lastFocusedWidget() {
            return this._lastFocusedWidget;
        }
        constructor(viewsService, chatContributionService) {
            this.viewsService = viewsService;
            this.chatContributionService = chatContributionService;
            this._widgets = [];
            this._lastFocusedWidget = undefined;
        }
        getWidgetByInputUri(uri) {
            return this._widgets.find(w => (0, resources_1.isEqual)(w.inputUri, uri));
        }
        getWidgetBySessionId(sessionId) {
            return this._widgets.find(w => w.viewModel?.sessionId === sessionId);
        }
        async revealViewForProvider(providerId) {
            const viewId = this.chatContributionService.getViewIdForProvider(providerId);
            const view = await this.viewsService.openView(viewId);
            return view?.widget;
        }
        setLastFocusedWidget(widget) {
            if (widget === this._lastFocusedWidget) {
                return;
            }
            this._lastFocusedWidget = widget;
        }
        register(newWidget) {
            if (this._widgets.some(widget => widget === newWidget)) {
                throw new Error('Cannot register the same widget multiple times');
            }
            this._widgets.push(newWidget);
            return (0, lifecycle_1.combinedDisposable)(newWidget.onDidFocus(() => this.setLastFocusedWidget(newWidget)), (0, lifecycle_1.toDisposable)(() => this._widgets.splice(this._widgets.indexOf(newWidget), 1)));
        }
    };
    exports.ChatWidgetService = ChatWidgetService;
    exports.ChatWidgetService = ChatWidgetService = __decorate([
        __param(0, viewsService_1.IViewsService),
        __param(1, chatContributionService_1.IChatContributionService)
    ], ChatWidgetService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWlDaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVoQixTQUFTLGlCQUFpQixDQUFDLElBQThCO1FBQ3hELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ3hELENBQUM7SUE2Qk0sSUFBTSxVQUFVLEdBQWhCLE1BQU0sVUFBVyxTQUFRLHNCQUFVOztpQkFDbEIsYUFBUSxHQUFrRSxFQUFFLEFBQXBFLENBQXFFO1FBZ0NwRyxJQUFXLE9BQU87WUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFNRCxJQUFZLFNBQVMsQ0FBQyxTQUFvQztZQUN6RCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ25DLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBRWxDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBRUQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFRCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUVELFlBQ1UsV0FBbUMsRUFDM0IsV0FBbUMsRUFDbkMsTUFB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
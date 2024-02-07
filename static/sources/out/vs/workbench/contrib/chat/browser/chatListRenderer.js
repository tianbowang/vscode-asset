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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/marked/marked", "vs/base/common/network", "vs/base/common/numbers", "vs/base/common/path", "vs/base/common/themables", "vs/base/common/uri", "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "vs/workbench/browser/labels", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/chat/browser/chatFollowups", "vs/workbench/contrib/chat/browser/chatMarkdownDecorationsRenderer", "vs/workbench/contrib/chat/browser/codeBlockPart", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/chat/common/chatWordCounter", "vs/workbench/contrib/files/browser/views/explorerView", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom, aria_1, button_1, iconLabels_1, arrays_1, async_1, codicons_1, event_1, htmlContent_1, lifecycle_1, map_1, marked_1, network_1, numbers_1, path_1, themables_1, uri_1, markdownRenderer_1, nls_1, menuEntryActionViewItem_1, toolbar_1, actions_1, commands_1, configuration_1, contextkey_1, files_1, instantiation_1, serviceCollection_1, listService_1, log_1, opener_1, defaultStyles_1, theme_1, themeService_1, labels_1, accessibleView_1, chatFollowups_1, chatMarkdownDecorationsRenderer_1, codeBlockPart_1, chatContextKeys_1, chatParserTypes_1, chatService_1, chatViewModel_1, chatWordCounter_1, explorerView_1, editorService_1) {
    "use strict";
    var ChatListItemRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatAccessibilityProvider = exports.ChatListDelegate = exports.ChatListItemRenderer = void 0;
    const $ = dom.$;
    const forceVerboseLayoutTracing = false;
    let ChatListItemRenderer = class ChatListItemRenderer extends lifecycle_1.Disposable {
        static { ChatListItemRenderer_1 = this; }
        static { this.ID = 'item'; }
        constructor(editorOptions, rendererOptions, delegate, instantiationService, configService, logService, commandService, openerService, contextKeyService, chatService, editorService, themeService) {
            super();
            this.editorOptions = editorOptions;
            this.rendererOptions = rendererOptions;
            this.delegate = delegate;
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.commandService = commandService;
            this.openerService = openerService;
            this.contextKeyService = contextKeyService;
            this.chatService = chatService;
            this.editorService = editorService;
            this.themeService = themeService;
            this.codeBlocksByResponseId = new Map();
            this.codeBlocksByEditorUri = new map_1.ResourceMap();
            this.fileTreesByResponseId = new Map();
            this.focusedFileTreesByResponseId = new Map();
            this._onDidClickFollowup = this._register(new event_1.Emitter());
            this.onDidClickFollowup = this._onDidClickFollowup.event;
            this._onDidChangeItemHeight = this._register(new event_1.Emitter());
            this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
            this._currentLayoutWidth = 0;
            this._isVisible = true;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this._usedReferencesEnabled = false;
            this.renderer = this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
            this._editorPool = this._register(this.instantiationService.createInstance(EditorPool, this.editorOptions));
            this._treePool = this._register(this.instantiationService.createInstance(TreePool, this._onDidChangeVisibility.event));
            this._contentReferencesListPool = this._register(this.instantiationService.createInstance(ContentReferencesListPool, this._onDidChangeVisibility.event));
            this._usedReferencesEnabled = configService.getValue('chat.experimental.usedReferences') ?? true;
            this._register(configService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('chat.experimental.usedReferences')) {
                    this._usedReferencesEnabled = configService.getValue('chat.experimental.usedReferences') ?? true;
                }
            }));
        }
        get templateId() {
            return ChatListItemRenderer_1.ID;
        }
        traceLayout(method, message) {
            if (forceVerboseLayoutTracing) {
                this.logService.info(`ChatListItemRenderer#${method}: ${message}`);
            }
            else {
                this.logService.trace(`ChatListItemRenderer#${method}: ${message}`);
            }
        }
        getProgressiveRenderRate(element) {
            if (element.isComplete) {
                return 80;
            }
            if (element.contentUpdateTimings && element.contentUpdateTimings.impliedWordLoadRate) {
                // words/s
                const minRate = 12;
                const maxRate = 80;
                // This doesn't account for dead time after the last update. When the previous update is the final one and the model is only waiting for followupQuestions, that's good.
                // When there was one quick update and then you are waiting longer for the next one, that's not good since the rate should be decreasing.
                // If it's an issue, we can change this to be based on the total time from now to the beginning.
                const rateBoost = 1.5;
                const rate = element.contentUpdateTimings.impliedWordLoadRate * rateBoost;
                return (0, numbers_1.clamp)(rate, minRate, maxRate);
            }
            return 8;
        }
        getCodeBlockInfosForResponse(response) {
            const codeBlocks = this.codeBlocksByResponseId.get(response.id);
            return codeBlocks ?? [];
        }
        getCodeBlockInfoForEditor(uri) {
            return this.codeBlocksByEditorUri.get(uri);
        }
        getFileTreeInfosForResponse(response) {
            const fileTrees = this.fileTreesByResponseId.get(response.id);
            return fileTrees ?? [];
        }
        getLastFocusedFileTreeForResponse(response) {
            const fileTrees = this.fileTreesByResponseId.get(response.id);
            const lastFocusedFileTreeIndex = this.focusedFileTreesByResponseId.get(response.id);
            if (fileTrees?.length && lastFocusedFileTreeIndex !== undefined && lastFocusedFileTreeIndex < fileTrees.length) {
                return fileTrees[lastFocusedFileTreeIndex];
            }
            return undefined;
        }
        setVisible(visible) {
            this._isVisible = visible;
            this._onDidChangeVisibility.fire(visible);
        }
        layout(width) {
            this._currentLayoutWidth = width - (this.rendererOptions.noPadding ? 0 : 40); // padding
            this._editorPool.inUse.forEach(editor => {
                editor.layout(this._currentLayoutWidth);
            });
        }
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.DisposableStore();
            const rowContainer = dom.append(container, $('.interactive-item-container'));
            if (this.rendererOptions.renderStyle === 'compact') {
                rowContainer.classList.add('interactive-item-compact');
            }
            if (this.rendererOptions.noPadding) {
                rowContainer.classList.add('no-padding');
            }
            const header = dom.append(rowContainer, $('.header'));
            const user = dom.append(header, $('.user'));
            const avatarContainer = dom.append(user, $('.avatar-container'));
            const agentAvatarContainer = dom.append(user, $('.agent-avatar-container'));
            const username = dom.append(user, $('h3.username'));
            const detailContainer = dom.append(user, $('span.detail-container'));
            const detail = dom.append(detailContainer, $('span.detail'));
            dom.append(detailContainer, $('span.chat-animated-ellipsis'));
            const progressSteps = dom.append(rowContainer, $('.progress-steps'));
            const referencesListContainer = dom.append(rowContainer, $('.referencesListContainer'));
            const value = dom.append(rowContainer, $('.value'));
            const elementDisposables = new lifecycle_1.DisposableStore();
            const contextKeyService = templateDisposables.add(this.contextKeyService.createScoped(rowContainer));
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyService]));
            let titleToolbar;
            if (this.rendererOptions.noHeader) {
                header.classList.add('hidden');
            }
            else {
                titleToolbar = templateDisposables.add(scopedInstantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, header, actions_1.MenuId.ChatMessageTitle, {
                    menuOptions: {
                        shouldForwardArgs: true
                    },
                    actionViewItemProvider: (action, options) => {
                        if (action instanceof actions_1.MenuItemAction && (action.item.id === 'workbench.action.chat.voteDown' || action.item.id === 'workbench.action.chat.voteUp')) {
                            return scopedInstantiationService.createInstance(ChatVoteButton, action, options);
                        }
                        return undefined;
                    }
                }));
            }
            const template = { avatarContainer, agentAvatarContainer, username, detail, progressSteps, referencesListContainer, value, rowContainer, elementDisposables, titleToolbar, templateDisposables, contextKeyService };
            return template;
        }
        renderElement(node, index, templateData) {
            this.renderChatTreeItem(node.element, index, templateData);
        }
        renderChatTreeItem(element, index, templateData) {
            const kind = (0, chatViewModel_1.isRequestVM)(element) ? 'request' :
                (0, chatViewModel_1.isResponseVM)(element) ? 'response' :
                    'welcome';
            this.traceLayout('renderElement', `${kind}, index=${index}`);
            chatContextKeys_1.CONTEXT_RESPONSE.bindTo(templateData.contextKeyService).set((0, chatViewModel_1.isResponseVM)(element));
            chatContextKeys_1.CONTEXT_REQUEST.bindTo(templateData.contextKeyService).set((0, chatViewModel_1.isRequestVM)(element));
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                chatContextKeys_1.CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING.bindTo(templateData.contextKeyService).set(!!element.agent?.metadata.supportIssueReporting);
                chatContextKeys_1.CONTEXT_RESPONSE_VOTE.bindTo(templateData.contextKeyService).set(element.vote === chatService_1.InteractiveSessionVoteDirection.Up ? 'up' : element.vote === chatService_1.InteractiveSessionVoteDirection.Down ? 'down' : '');
            }
            else {
                chatContextKeys_1.CONTEXT_RESPONSE_VOTE.bindTo(templateData.contextKeyService).set('');
            }
            if (templateData.titleToolbar) {
                templateData.titleToolbar.context = element;
            }
            const isFiltered = !!((0, chatViewModel_1.isResponseVM)(element) && element.errorDetails?.responseIsFiltered);
            chatContextKeys_1.CONTEXT_RESPONSE_FILTERED.bindTo(templateData.contextKeyService).set(isFiltered);
            templateData.rowContainer.classList.toggle('interactive-request', (0, chatViewModel_1.isRequestVM)(element));
            templateData.rowContainer.classList.toggle('interactive-response', (0, chatViewModel_1.isResponseVM)(element));
            templateData.rowContainer.classList.toggle('interactive-welcome', (0, chatViewModel_1.isWelcomeVM)(element));
            templateData.rowContainer.classList.toggle('filtered-response', isFiltered);
            templateData.rowContainer.classList.toggle('show-detail-progress', (0, chatViewModel_1.isResponseVM)(element) && !element.isComplete && !element.progressMessages.length);
            templateData.username.textContent = element.username;
            if (!this.rendererOptions.noHeader) {
                this.renderAvatar(element, templateData);
            }
            dom.clearNode(templateData.detail);
            dom.clearNode(templateData.progressSteps);
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                this.renderDetail(element, templateData);
            }
            // Do a progressive render if
            // - This the last response in the list
            // - And it has some content
            // - And the response is not complete
            //   - Or, we previously started a progressive rendering of this element (if the element is complete, we will finish progressive rendering with a very fast rate)
            // - And, the feature is not disabled in configuration
            if ((0, chatViewModel_1.isResponseVM)(element) && index === this.delegate.getListLength() - 1 && (!element.isComplete || element.renderData) && element.response.value.length) {
                this.traceLayout('renderElement', `start progressive render ${kind}, index=${index}`);
                const progressiveRenderingDisposables = templateData.elementDisposables.add(new lifecycle_1.DisposableStore());
                const timer = templateData.elementDisposables.add(new dom.WindowIntervalTimer());
                const runProgressiveRender = (initial) => {
                    try {
                        if (this.doNextProgressiveRender(element, index, templateData, !!initial, progressiveRenderingDisposables)) {
                            timer.cancel();
                        }
                    }
                    catch (err) {
                        // Kill the timer if anything went wrong, avoid getting stuck in a nasty rendering loop.
                        timer.cancel();
                        throw err;
                    }
                };
                timer.cancelAndSet(runProgressiveRender, 50, dom.getWindow(templateData.rowContainer));
                runProgressiveRender(true);
            }
            else if ((0, chatViewModel_1.isResponseVM)(element)) {
                const renderableResponse = (0, chatMarkdownDecorationsRenderer_1.annotateSpecialMarkdownContent)(element.response.value);
                this.basicRenderElement(renderableResponse, element, index, templateData);
            }
            else if ((0, chatViewModel_1.isRequestVM)(element)) {
                const markdown = 'kind' in element.message ?
                    element.message.message :
                    this.instantiationService.invokeFunction(chatMarkdownDecorationsRenderer_1.convertParsedRequestToMarkdown, element.message);
                this.basicRenderElement([{ content: new htmlContent_1.MarkdownString(markdown), kind: 'markdownContent' }], element, index, templateData);
            }
            else {
                this.renderWelcomeMessage(element, templateData);
            }
        }
        renderDetail(element, templateData) {
            let progressMsg = '';
            if (element.agent && !element.agent.metadata.isDefault) {
                let usingMsg = chatParserTypes_1.chatAgentLeader + element.agent.id;
                if (element.slashCommand) {
                    usingMsg += ` ${chatParserTypes_1.chatSubcommandLeader}${element.slashCommand.name}`;
                }
                if (element.isComplete) {
                    progressMsg = (0, nls_1.localize)('usedAgent', "used {0}", usingMsg);
                }
                else {
                    progressMsg = (0, nls_1.localize)('usingAgent', "using {0}", usingMsg);
                }
            }
            else if (!element.isComplete) {
                progressMsg = (0, nls_1.localize)('thinking', "Thinking");
            }
            templateData.detail.textContent = progressMsg;
            if (element.agent) {
                templateData.detail.title = progressMsg + (element.slashCommand?.description ? `\n${element.slashCommand.description}` : '');
            }
            else {
                templateData.detail.title = '';
            }
        }
        renderAvatar(element, templateData) {
            if (element.avatarIconUri) {
                const avatarImgIcon = dom.$('img.icon');
                avatarImgIcon.src = network_1.FileAccess.uriToBrowserUri(element.avatarIconUri).toString(true);
                templateData.avatarContainer.replaceChildren(dom.$('.avatar', undefined, avatarImgIcon));
            }
            else {
                const defaultIcon = (0, chatViewModel_1.isRequestVM)(element) ? codicons_1.Codicon.account : codicons_1.Codicon.copilot;
                const avatarIcon = dom.$(themables_1.ThemeIcon.asCSSSelector(defaultIcon));
                templateData.avatarContainer.replaceChildren(dom.$('.avatar.codicon-avatar', undefined, avatarIcon));
            }
            if ((0, chatViewModel_1.isResponseVM)(element) && element.agent && !element.agent.metadata.isDefault) {
                dom.show(templateData.agentAvatarContainer);
                const icon = this.getAgentIcon(element.agent.metadata);
                if (icon instanceof uri_1.URI) {
                    const avatarIcon = dom.$('img.icon');
                    avatarIcon.src = network_1.FileAccess.uriToBrowserUri(icon).toString(true);
                    templateData.agentAvatarContainer.replaceChildren(dom.$('.avatar', undefined, avatarIcon));
                }
                else if (icon) {
                    const avatarIcon = dom.$(themables_1.ThemeIcon.asCSSSelector(icon));
                    templateData.agentAvatarContainer.replaceChildren(dom.$('.avatar.codicon-avatar', undefined, avatarIcon));
                }
                else {
                    dom.hide(templateData.agentAvatarContainer);
                    return;
                }
                templateData.agentAvatarContainer.classList.toggle('complete', element.isComplete);
                if (!element.agentAvatarHasBeenRendered && !element.isComplete) {
                    element.agentAvatarHasBeenRendered = true;
                    templateData.agentAvatarContainer.classList.remove('loading');
                    templateData.elementDisposables.add((0, async_1.disposableTimeout)(() => {
                        templateData.agentAvatarContainer.classList.toggle('loading', !element.isComplete);
                    }, 100));
                }
                else {
                    templateData.agentAvatarContainer.classList.toggle('loading', !element.isComplete);
                }
            }
            else {
                dom.hide(templateData.agentAvatarContainer);
            }
        }
        getAgentIcon(agent) {
            if (agent.themeIcon) {
                return agent.themeIcon;
            }
            else {
                return this.themeService.getColorTheme().type === theme_1.ColorScheme.DARK && agent.iconDark ? agent.iconDark :
                    agent.icon;
            }
        }
        basicRenderElement(value, element, index, templateData) {
            const fillInIncompleteTokens = (0, chatViewModel_1.isResponseVM)(element) && (!element.isComplete || element.isCanceled || element.errorDetails?.responseIsFiltered || element.errorDetails?.responseIsIncomplete);
            dom.clearNode(templateData.value);
            dom.clearNode(templateData.referencesListContainer);
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                this.renderDetail(element, templateData);
            }
            this.renderContentReferencesIfNeeded(element, templateData, templateData.elementDisposables);
            let fileTreeIndex = 0;
            value.forEach((data, index) => {
                const result = data.kind === 'treeData'
                    ? this.renderTreeData(data.treeData, element, templateData, fileTreeIndex++)
                    : data.kind === 'markdownContent'
                        ? this.renderMarkdown(data.content, element, templateData, fillInIncompleteTokens)
                        : onlyProgressMessagesAfterI(value, index) ? this.renderProgressMessage(data, false)
                            : undefined;
                if (result) {
                    templateData.value.appendChild(result.element);
                    templateData.elementDisposables.add(result);
                }
            });
            if ((0, chatViewModel_1.isResponseVM)(element) && element.errorDetails?.message) {
                const icon = element.errorDetails.responseIsFiltered ? codicons_1.Codicon.info : codicons_1.Codicon.error;
                const errorDetails = dom.append(templateData.value, $('.interactive-response-error-details', undefined, (0, iconLabels_1.renderIcon)(icon)));
                const renderedError = templateData.elementDisposables.add(this.renderer.render(new htmlContent_1.MarkdownString(element.errorDetails.message)));
                errorDetails.appendChild($('span', undefined, renderedError.element));
            }
            if ((0, chatViewModel_1.isResponseVM)(element) && element.commandFollowups?.length) {
                const followupsContainer = dom.append(templateData.value, $('.interactive-response-followups'));
                templateData.elementDisposables.add(new chatFollowups_1.ChatFollowups(followupsContainer, element.commandFollowups, defaultStyles_1.defaultButtonStyles, followup => {
                    this.chatService.notifyUserAction({
                        providerId: element.providerId,
                        agentId: element.agent?.id,
                        sessionId: element.sessionId,
                        requestId: element.requestId,
                        action: {
                            kind: 'command',
                            command: followup,
                        }
                    });
                    return this.commandService.executeCommand(followup.commandId, ...(followup.args ?? []));
                }, templateData.contextKeyService));
            }
            const newHeight = templateData.rowContainer.offsetHeight;
            const fireEvent = !element.currentRenderedHeight || element.currentRenderedHeight !== newHeight;
            element.currentRenderedHeight = newHeight;
            if (fireEvent) {
                const disposable = templateData.elementDisposables.add(dom.scheduleAtNextAnimationFrame(dom.getWindow(templateData.value), () => {
                    disposable.dispose();
                    this._onDidChangeItemHeight.fire({ element, height: newHeight });
                }));
            }
        }
        renderWelcomeMessage(element, templateData) {
            dom.clearNode(templateData.value);
            dom.clearNode(templateData.referencesListContainer);
            for (const item of element.content) {
                if (Array.isArray(item)) {
                    templateData.elementDisposables.add(new chatFollowups_1.ChatFollowups(templateData.value, item, undefined, followup => this._onDidClickFollowup.fire(followup), templateData.contextKeyService));
                }
                else {
                    const result = this.renderMarkdown(item, element, templateData);
                    templateData.value.appendChild(result.element);
                    templateData.elementDisposables.add(result);
                }
            }
            const newHeight = templateData.rowContainer.offsetHeight;
            const fireEvent = !element.currentRenderedHeight || element.currentRenderedHeight !== newHeight;
            element.currentRenderedHeight = newHeight;
            if (fireEvent) {
                const disposable = templateData.elementDisposables.add(dom.scheduleAtNextAnimationFrame(dom.getWindow(templateData.value), () => {
                    disposable.dispose();
                    this._onDidChangeItemHeight.fire({ element, height: newHeight });
                }));
            }
        }
        /**
         *	@returns true if progressive rendering should be considered complete- the element's data is fully rendered or the view is not visible
         */
        doNextProgressiveRender(element, index, templateData, isInRenderElement, disposables) {
            if (!this._isVisible) {
                return true;
            }
            disposables.clear();
            const renderableResponse = (0, chatMarkdownDecorationsRenderer_1.annotateSpecialMarkdownContent)(element.response.value);
            let isFullyRendered = false;
            if (element.isCanceled) {
                this.traceLayout('runProgressiveRender', `canceled, index=${index}`);
                element.renderData = undefined;
                this.basicRenderElement(renderableResponse, element, index, templateData);
                isFullyRendered = true;
            }
            else {
                // Figure out what we need to render in addition to what has already been rendered
                element.renderData ??= { renderedParts: [] };
                const renderedParts = element.renderData.renderedParts;
                const wordCountResults = [];
                const partsToRender = [];
                let somePartIsNotFullyRendered = false;
                renderableResponse.forEach((part, index) => {
                    const renderedPart = renderedParts[index];
                    // Is this part completely new?
                    if (!renderedPart) {
                        if (part.kind === 'treeData') {
                            partsToRender[index] = part.treeData;
                        }
                        else if (part.kind === 'progressMessage') {
                            partsToRender[index] = {
                                progressMessage: part,
                                isAtEndOfResponse: onlyProgressMessagesAfterI(renderableResponse, index),
                                isLast: index === renderableResponse.length - 1,
                            };
                        }
                        else {
                            const wordCountResult = this.getDataForProgressiveRender(element, contentToMarkdown(part.content), { renderedWordCount: 0, lastRenderTime: 0 });
                            if (wordCountResult !== undefined) {
                                this.traceLayout('doNextProgressiveRender', `Rendering new part ${index}, wordCountResult=${wordCountResult.actualWordCount}, rate=${wordCountResult.rate}`);
                                partsToRender[index] = {
                                    renderedWordCount: wordCountResult.actualWordCount,
                                    lastRenderTime: Date.now(),
                                    isFullyRendered: wordCountResult.isFullString,
                                };
                                wordCountResults[index] = wordCountResult;
                            }
                        }
                    }
                    // Did this part's content change?
                    else if (part.kind !== 'treeData' && !isInteractiveProgressTreeData(renderedPart) && !isProgressMessageRenderData(renderedPart)) {
                        const wordCountResult = this.getDataForProgressiveRender(element, contentToMarkdown(part.content), renderedPart);
                        // Check if there are any new words to render
                        if (wordCountResult !== undefined && renderedPart.renderedWordCount !== wordCountResult?.actualWordCount) {
                            this.traceLayout('doNextProgressiveRender', `Rendering changed part ${index}, wordCountResult=${wordCountResult.actualWordCount}, rate=${wordCountResult.rate}`);
                            partsToRender[index] = {
                                renderedWordCount: wordCountResult.actualWordCount,
                                lastRenderTime: Date.now(),
                                isFullyRendered: wordCountResult.isFullString,
                            };
                            wordCountResults[index] = wordCountResult;
                        }
                        else if (!renderedPart.isFullyRendered && !wordCountResult) {
                            // This part is not fully rendered, but not enough time has passed to render more content
                            somePartIsNotFullyRendered = true;
                        }
                    }
                    // Is it a progress message that needs to be rerendered?
                    else if (part.kind === 'progressMessage' && isProgressMessageRenderData(renderedPart) && ((renderedPart.isAtEndOfResponse !== onlyProgressMessagesAfterI(renderableResponse, index)) ||
                        renderedPart.isLast !== (index === renderableResponse.length - 1))) {
                        partsToRender[index] = {
                            progressMessage: part,
                            isAtEndOfResponse: onlyProgressMessagesAfterI(renderableResponse, index),
                            isLast: index === renderableResponse.length - 1,
                        };
                    }
                });
                isFullyRendered = partsToRender.length === 0 && !somePartIsNotFullyRendered;
                if (isFullyRendered && element.isComplete) {
                    // Response is done and content is rendered, so do a normal render
                    this.traceLayout('runProgressiveRender', `end progressive render, index=${index} and clearing renderData, response is complete, index=${index}`);
                    element.renderData = undefined;
                    disposables.clear();
                    this.basicRenderElement(renderableResponse, element, index, templateData);
                }
                else if (!isFullyRendered) {
                    this.renderContentReferencesIfNeeded(element, templateData, disposables);
                    let hasRenderedOneMarkdownBlock = false;
                    partsToRender.forEach((partToRender, index) => {
                        if (!partToRender) {
                            return;
                        }
                        // Undefined => don't do anything. null => remove the rendered element
                        let result;
                        if (isInteractiveProgressTreeData(partToRender)) {
                            result = this.renderTreeData(partToRender, element, templateData, index);
                        }
                        else if (isProgressMessageRenderData(partToRender)) {
                            if (onlyProgressMessageRenderDatasAfterI(partsToRender, index)) {
                                result = this.renderProgressMessage(partToRender.progressMessage, index === partsToRender.length - 1);
                            }
                            else {
                                result = null;
                            }
                        }
                        // Avoid doing progressive rendering for multiple markdown parts simultaneously
                        else if (!hasRenderedOneMarkdownBlock && wordCountResults[index]) {
                            const { value } = wordCountResults[index];
                            result = this.renderMarkdown(new htmlContent_1.MarkdownString(value), element, templateData, true);
                            hasRenderedOneMarkdownBlock = true;
                        }
                        if (result === undefined) {
                            return;
                        }
                        // Doing the progressive render
                        renderedParts[index] = partToRender;
                        const existingElement = templateData.value.children[index];
                        if (existingElement) {
                            if (result === null) {
                                templateData.value.replaceChild($('span.placeholder-for-deleted-thing'), existingElement);
                            }
                            else {
                                templateData.value.replaceChild(result.element, existingElement);
                            }
                        }
                        else if (result) {
                            templateData.value.appendChild(result.element);
                        }
                        if (result) {
                            disposables.add(result);
                        }
                    });
                }
                else {
                    // Nothing new to render, not done, keep waiting
                    return false;
                }
            }
            // Some render happened - update the height
            const height = templateData.rowContainer.offsetHeight;
            element.currentRenderedHeight = height;
            if (!isInRenderElement) {
                this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
            }
            return isFullyRendered;
        }
        renderTreeData(data, element, templateData, treeDataIndex) {
            const treeDisposables = new lifecycle_1.DisposableStore();
            const ref = treeDisposables.add(this._treePool.get());
            const tree = ref.object;
            treeDisposables.add(tree.onDidOpen((e) => {
                if (e.element && !('children' in e.element)) {
                    this.openerService.open(e.element.uri);
                }
            }));
            treeDisposables.add(tree.onDidChangeCollapseState(() => {
                this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
            }));
            treeDisposables.add(tree.onContextMenu((e) => {
                e.browserEvent.preventDefault();
                e.browserEvent.stopPropagation();
            }));
            tree.setInput(data).then(() => {
                if (!ref.isStale()) {
                    tree.layout();
                    this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
                }
            });
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                const fileTreeFocusInfo = {
                    treeDataId: data.uri.toString(),
                    treeIndex: treeDataIndex,
                    focus() {
                        tree.domFocus();
                    }
                };
                treeDisposables.add(tree.onDidFocus(() => {
                    this.focusedFileTreesByResponseId.set(element.id, fileTreeFocusInfo.treeIndex);
                }));
                const fileTrees = this.fileTreesByResponseId.get(element.id) ?? [];
                fileTrees.push(fileTreeFocusInfo);
                this.fileTreesByResponseId.set(element.id, (0, arrays_1.distinct)(fileTrees, (v) => v.treeDataId));
                treeDisposables.add((0, lifecycle_1.toDisposable)(() => this.fileTreesByResponseId.set(element.id, fileTrees.filter(v => v.treeDataId !== data.uri.toString()))));
            }
            return {
                element: tree.getHTMLElement().parentElement,
                dispose: () => {
                    treeDisposables.dispose();
                }
            };
        }
        renderContentReferencesIfNeeded(element, templateData, disposables) {
            dom.clearNode(templateData.referencesListContainer);
            if ((0, chatViewModel_1.isResponseVM)(element) && this._usedReferencesEnabled && element.contentReferences.length) {
                dom.show(templateData.referencesListContainer);
                const contentReferencesListResult = this.renderContentReferencesListData(element.contentReferences, element, templateData);
                templateData.referencesListContainer.appendChild(contentReferencesListResult.element);
                disposables.add(contentReferencesListResult);
            }
            else {
                dom.hide(templateData.referencesListContainer);
            }
        }
        renderContentReferencesListData(data, element, templateData) {
            const listDisposables = new lifecycle_1.DisposableStore();
            const referencesLabel = data.length > 1 ?
                (0, nls_1.localize)('usedReferencesPlural', "Used {0} references", data.length) :
                (0, nls_1.localize)('usedReferencesSingular', "Used {0} reference", 1);
            const iconElement = $('.chat-used-context-icon');
            const icon = (element) => element.usedReferencesExpanded ? codicons_1.Codicon.chevronDown : codicons_1.Codicon.chevronRight;
            iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon(element)));
            const buttonElement = $('.chat-used-context-label', undefined);
            const collapseButton = new button_1.Button(buttonElement, {
                buttonBackground: undefined,
                buttonBorder: undefined,
                buttonForeground: undefined,
                buttonHoverBackground: undefined,
                buttonSecondaryBackground: undefined,
                buttonSecondaryForeground: undefined,
                buttonSecondaryHoverBackground: undefined,
                buttonSeparator: undefined
            });
            const container = $('.chat-used-context', undefined, buttonElement);
            collapseButton.label = referencesLabel;
            collapseButton.element.append(iconElement);
            this.updateAriaLabel(collapseButton.element, referencesLabel, element.usedReferencesExpanded);
            container.classList.toggle('chat-used-context-collapsed', !element.usedReferencesExpanded);
            listDisposables.add(collapseButton.onDidClick(() => {
                iconElement.classList.remove(...themables_1.ThemeIcon.asClassNameArray(icon(element)));
                element.usedReferencesExpanded = !element.usedReferencesExpanded;
                iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon(element)));
                container.classList.toggle('chat-used-context-collapsed', !element.usedReferencesExpanded);
                this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
                this.updateAriaLabel(collapseButton.element, referencesLabel, element.usedReferencesExpanded);
            }));
            const ref = listDisposables.add(this._contentReferencesListPool.get());
            const list = ref.object;
            container.appendChild(list.getHTMLElement().parentElement);
            listDisposables.add(list.onDidOpen((e) => {
                if (e.element) {
                    this.editorService.openEditor({
                        resource: 'uri' in e.element.reference ? e.element.reference.uri : e.element.reference,
                        options: {
                            ...e.editorOptions,
                            ...{
                                selection: 'range' in e.element.reference ? e.element.reference.range : undefined
                            }
                        }
                    });
                }
            }));
            listDisposables.add(list.onContextMenu((e) => {
                e.browserEvent.preventDefault();
                e.browserEvent.stopPropagation();
            }));
            const maxItemsShown = 6;
            const itemsShown = Math.min(data.length, maxItemsShown);
            const height = itemsShown * 22;
            list.layout(height);
            list.getHTMLElement().style.height = `${height}px`;
            list.splice(0, list.length, data);
            return {
                element: container,
                dispose: () => {
                    listDisposables.dispose();
                }
            };
        }
        updateAriaLabel(element, label, expanded) {
            element.ariaLabel = expanded ? (0, nls_1.localize)('usedReferencesExpanded', "{0}, expanded", label) : (0, nls_1.localize)('usedReferencesCollapsed', "{0}, collapsed", label);
        }
        renderProgressMessage(progress, showSpinner) {
            if (showSpinner) {
                // this step is in progress, communicate it to SR users
                (0, aria_1.alert)(progress.content.value);
            }
            const codicon = showSpinner ? themables_1.ThemeIcon.modify(codicons_1.Codicon.sync, 'spin').id : codicons_1.Codicon.check.id;
            const markdown = new htmlContent_1.MarkdownString(`$(${codicon}) ${progress.content.value}`, {
                supportThemeIcons: true
            });
            const result = this.renderer.render(markdown);
            result.element.classList.add('progress-step');
            return result;
        }
        renderMarkdown(markdown, element, templateData, fillInIncompleteTokens = false) {
            const disposables = new lifecycle_1.DisposableStore();
            let codeBlockIndex = 0;
            markdown = new htmlContent_1.MarkdownString(markdown.value, {
                isTrusted: {
                    // Disable all other config options except isTrusted
                    enabledCommands: typeof markdown.isTrusted === 'object' ? markdown.isTrusted?.enabledCommands : [] ?? []
                }
            });
            // We release editors in order so that it's more likely that the same editor will be assigned if this element is re-rendered right away, like it often is during progressive rendering
            const orderedDisposablesList = [];
            const codeblocks = [];
            const result = this.renderer.render(markdown, {
                fillInIncompleteTokens,
                codeBlockRendererSync: (languageId, text) => {
                    const vulns = (0, chatMarkdownDecorationsRenderer_1.extractVulnerabilitiesFromText)(text);
                    const hideToolbar = (0, chatViewModel_1.isResponseVM)(element) && element.errorDetails?.responseIsFiltered;
                    const data = { languageId, text: vulns.newText, codeBlockIndex: codeBlockIndex++, element, hideToolbar, parentContextKeyService: templateData.contextKeyService, vulns: vulns.vulnerabilities };
                    const ref = this.renderCodeBlock(data, disposables);
                    // Attach this after updating text/layout of the editor, so it should only be fired when the size updates later (horizontal scrollbar, wrapping)
                    // not during a renderElement OR a progressive render (when we will be firing this event anyway at the end of the render)
                    disposables.add(ref.object.onDidChangeContentHeight(() => {
                        ref.object.layout(this._currentLayoutWidth);
                        this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight });
                    }));
                    if ((0, chatViewModel_1.isResponseVM)(element)) {
                        const info = {
                            codeBlockIndex: data.codeBlockIndex,
                            element,
                            focus() {
                                ref.object.focus();
                            }
                        };
                        codeblocks.push(info);
                        this.codeBlocksByEditorUri.set(ref.object.textModel.uri, info);
                        disposables.add((0, lifecycle_1.toDisposable)(() => this.codeBlocksByEditorUri.delete(ref.object.textModel.uri)));
                    }
                    orderedDisposablesList.push(ref);
                    return ref.object.element;
                },
                asyncRenderCallback: () => this._onDidChangeItemHeight.fire({ element, height: templateData.rowContainer.offsetHeight }),
            });
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                this.codeBlocksByResponseId.set(element.id, codeblocks);
                disposables.add((0, lifecycle_1.toDisposable)(() => this.codeBlocksByResponseId.delete(element.id)));
            }
            this.instantiationService.invokeFunction(acc => (0, chatMarkdownDecorationsRenderer_1.walkTreeAndAnnotateReferenceLinks)(acc, result.element));
            orderedDisposablesList.reverse().forEach(d => disposables.add(d));
            return {
                element: result.element,
                dispose() {
                    result.dispose();
                    disposables.dispose();
                }
            };
        }
        renderCodeBlock(data, disposables) {
            const ref = this._editorPool.get();
            const editorInfo = ref.object;
            editorInfo.render(data, this._currentLayoutWidth);
            return ref;
        }
        getDataForProgressiveRender(element, data, renderData) {
            const rate = this.getProgressiveRenderRate(element);
            const numWordsToRender = renderData.lastRenderTime === 0 ?
                1 :
                renderData.renderedWordCount +
                    // Additional words to render beyond what's already rendered
                    Math.floor((Date.now() - renderData.lastRenderTime) / 1000 * rate);
            if (numWordsToRender === renderData.renderedWordCount) {
                return undefined;
            }
            return {
                ...(0, chatWordCounter_1.getNWords)(data.value, numWordsToRender),
                rate
            };
        }
        disposeElement(node, index, templateData) {
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.dispose();
        }
    };
    exports.ChatListItemRenderer = ChatListItemRenderer;
    exports.ChatListItemRenderer = ChatListItemRenderer = ChatListItemRenderer_1 = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, log_1.ILogService),
        __param(6, commands_1.ICommandService),
        __param(7, opener_1.IOpenerService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, chatService_1.IChatService),
        __param(10, editorService_1.IEditorService),
        __param(11, themeService_1.IThemeService)
    ], ChatListItemRenderer);
    let ChatListDelegate = class ChatListDelegate {
        constructor(logService) {
            this.logService = logService;
        }
        _traceLayout(method, message) {
            if (forceVerboseLayoutTracing) {
                this.logService.info(`ChatListDelegate#${method}: ${message}`);
            }
            else {
                this.logService.trace(`ChatListDelegate#${method}: ${message}`);
            }
        }
        getHeight(element) {
            const kind = (0, chatViewModel_1.isRequestVM)(element) ? 'request' : 'response';
            const height = ('currentRenderedHeight' in element ? element.currentRenderedHeight : undefined) ?? 200;
            this._traceLayout('getHeight', `${kind}, height=${height}`);
            return height;
        }
        getTemplateId(element) {
            return ChatListItemRenderer.ID;
        }
        hasDynamicHeight(element) {
            return true;
        }
    };
    exports.ChatListDelegate = ChatListDelegate;
    exports.ChatListDelegate = ChatListDelegate = __decorate([
        __param(0, log_1.ILogService)
    ], ChatListDelegate);
    let ChatAccessibilityProvider = class ChatAccessibilityProvider {
        constructor(_accessibleViewService) {
            this._accessibleViewService = _accessibleViewService;
        }
        getWidgetRole() {
            return 'list';
        }
        getRole(element) {
            return 'listitem';
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('chat', "Chat");
        }
        getAriaLabel(element) {
            if ((0, chatViewModel_1.isRequestVM)(element)) {
                return element.messageText;
            }
            if ((0, chatViewModel_1.isResponseVM)(element)) {
                return this._getLabelWithCodeBlockCount(element);
            }
            if ((0, chatViewModel_1.isWelcomeVM)(element)) {
                return element.content.map(c => 'value' in c ? c.value : c.map(followup => followup.message).join('\n')).join('\n');
            }
            return '';
        }
        _getLabelWithCodeBlockCount(element) {
            const accessibleViewHint = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */);
            let label = '';
            let commandFollowUpInfo;
            const commandFollowupLength = element.commandFollowups?.length ?? 0;
            switch (commandFollowupLength) {
                case 0:
                    break;
                case 1:
                    commandFollowUpInfo = (0, nls_1.localize)('commandFollowUpInfo', "Command: {0}", element.commandFollowups[0].title);
                    break;
                default:
                    commandFollowUpInfo = (0, nls_1.localize)('commandFollowUpInfoMany', "Commands: {0}", element.commandFollowups.map(followup => followup.title).join(', '));
            }
            const fileTreeCount = element.response.value.filter((v) => !('value' in v))?.length ?? 0;
            let fileTreeCountHint = '';
            switch (fileTreeCount) {
                case 0:
                    break;
                case 1:
                    fileTreeCountHint = (0, nls_1.localize)('singleFileTreeHint', "1 file tree");
                    break;
                default:
                    fileTreeCountHint = (0, nls_1.localize)('multiFileTreeHint', "{0} file trees", fileTreeCount);
                    break;
            }
            const codeBlockCount = marked_1.marked.lexer(element.response.asString()).filter(token => token.type === 'code')?.length ?? 0;
            switch (codeBlockCount) {
                case 0:
                    label = accessibleViewHint ? (0, nls_1.localize)('noCodeBlocksHint', "{0} {1} {2}", fileTreeCountHint, element.response.asString(), accessibleViewHint) : (0, nls_1.localize)('noCodeBlocks', "{0} {1}", fileTreeCountHint, element.response.asString());
                    break;
                case 1:
                    label = accessibleViewHint ? (0, nls_1.localize)('singleCodeBlockHint', "{0} 1 code block: {1} {2}", fileTreeCountHint, element.response.asString(), accessibleViewHint) : (0, nls_1.localize)('singleCodeBlock', "{0} 1 code block: {1}", fileTreeCountHint, element.response.asString());
                    break;
                default:
                    label = accessibleViewHint ? (0, nls_1.localize)('multiCodeBlockHint', "{0} {1} code blocks: {2}", fileTreeCountHint, codeBlockCount, element.response.asString(), accessibleViewHint) : (0, nls_1.localize)('multiCodeBlock', "{0} {1} code blocks", fileTreeCountHint, codeBlockCount, element.response.asString());
                    break;
            }
            return commandFollowUpInfo ? commandFollowUpInfo + ', ' + label : label;
        }
    };
    exports.ChatAccessibilityProvider = ChatAccessibilityProvider;
    exports.ChatAccessibilityProvider = ChatAccessibilityProvider = __decorate([
        __param(0, accessibleView_1.IAccessibleViewService)
    ], ChatAccessibilityProvider);
    let EditorPool = class EditorPool extends lifecycle_1.Disposable {
        get inUse() {
            return this._pool.inUse;
        }
        constructor(options, instantiationService) {
            super();
            this.options = options;
            this.instantiationService = instantiationService;
            this._pool = this._register(new ResourcePool(() => this.editorFactory()));
            // TODO listen to changes on options
        }
        editorFactory() {
            return this.instantiationService.createInstance(codeBlockPart_1.CodeBlockPart, this.options, actions_1.MenuId.ChatCodeBlock);
        }
        get() {
            const object = this._pool.get();
            let stale = false;
            return {
                object,
                isStale: () => stale,
                dispose: () => {
                    stale = true;
                    this._pool.release(object);
                }
            };
        }
    };
    EditorPool = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], EditorPool);
    let TreePool = class TreePool extends lifecycle_1.Disposable {
        get inUse() {
            return this._pool.inUse;
        }
        constructor(_onDidChangeVisibility, instantiationService, configService, themeService) {
            super();
            this._onDidChangeVisibility = _onDidChangeVisibility;
            this.instantiationService = instantiationService;
            this.configService = configService;
            this.themeService = themeService;
            this._pool = this._register(new ResourcePool(() => this.treeFactory()));
        }
        treeFactory() {
            const resourceLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility });
            const container = $('.interactive-response-progress-tree');
            (0, explorerView_1.createFileIconThemableTreeContainerScope)(container, this.themeService);
            const tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleAsyncDataTree, 'ChatListRenderer', container, new ChatListTreeDelegate(), new ChatListTreeCompressionDelegate(), [new ChatListTreeRenderer(resourceLabels, this.configService.getValue('explorer.decorations'))], new ChatListTreeDataSource(), {
                collapseByDefault: () => false,
                expandOnlyOnTwistieClick: () => false,
                identityProvider: {
                    getId: (e) => e.uri.toString()
                },
                accessibilityProvider: {
                    getAriaLabel: (element) => element.label,
                    getWidgetAriaLabel: () => (0, nls_1.localize)('treeAriaLabel', "File Tree")
                },
                alwaysConsumeMouseWheel: false
            });
            return tree;
        }
        get() {
            const object = this._pool.get();
            let stale = false;
            return {
                object,
                isStale: () => stale,
                dispose: () => {
                    stale = true;
                    this._pool.release(object);
                }
            };
        }
    };
    TreePool = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, themeService_1.IThemeService)
    ], TreePool);
    let ContentReferencesListPool = class ContentReferencesListPool extends lifecycle_1.Disposable {
        get inUse() {
            return this._pool.inUse;
        }
        constructor(_onDidChangeVisibility, instantiationService, themeService) {
            super();
            this._onDidChangeVisibility = _onDidChangeVisibility;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
            this._pool = this._register(new ResourcePool(() => this.listFactory()));
        }
        listFactory() {
            const resourceLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility });
            const container = $('.chat-used-context-list');
            (0, explorerView_1.createFileIconThemableTreeContainerScope)(container, this.themeService);
            const list = this.instantiationService.createInstance(listService_1.WorkbenchList, 'ChatListRenderer', container, new ContentReferencesListDelegate(), [new ContentReferencesListRenderer(resourceLabels)], {
                alwaysConsumeMouseWheel: false,
                accessibilityProvider: {
                    getAriaLabel: (element) => {
                        if (uri_1.URI.isUri(element.reference)) {
                            return (0, path_1.basename)(element.reference.path);
                        }
                        else {
                            return (0, path_1.basename)(element.reference.uri.path);
                        }
                    },
                    getWidgetAriaLabel: () => (0, nls_1.localize)('usedReferences', "Used References")
                },
            });
            return list;
        }
        get() {
            const object = this._pool.get();
            let stale = false;
            return {
                object,
                isStale: () => stale,
                dispose: () => {
                    stale = true;
                    this._pool.release(object);
                }
            };
        }
    };
    ContentReferencesListPool = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, themeService_1.IThemeService)
    ], ContentReferencesListPool);
    class ContentReferencesListDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            return ContentReferencesListRenderer.TEMPLATE_ID;
        }
    }
    class ContentReferencesListRenderer {
        static { this.TEMPLATE_ID = 'contentReferencesListRenderer'; }
        constructor(labels) {
            this.labels = labels;
            this.templateId = ContentReferencesListRenderer.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.DisposableStore();
            const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true }));
            return { templateDisposables, label };
        }
        renderElement(element, index, templateData, height) {
            templateData.label.element.style.display = 'flex';
            templateData.label.setFile('uri' in element.reference ? element.reference.uri : element.reference, {
                fileKind: files_1.FileKind.FILE,
                // Should not have this live-updating data on a historical reference
                fileDecorations: { badges: false, colors: false },
                range: 'range' in element.reference ? element.reference.range : undefined
            });
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.dispose();
        }
    }
    class ResourcePool extends lifecycle_1.Disposable {
        get inUse() {
            return this._inUse;
        }
        constructor(_itemFactory) {
            super();
            this._itemFactory = _itemFactory;
            this.pool = [];
            this._inUse = new Set;
        }
        get() {
            if (this.pool.length > 0) {
                const item = this.pool.pop();
                this._inUse.add(item);
                return item;
            }
            const item = this._register(this._itemFactory());
            this._inUse.add(item);
            return item;
        }
        release(item) {
            this._inUse.delete(item);
            this.pool.push(item);
        }
    }
    class ChatVoteButton extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        render(container) {
            super.render(container);
            container.classList.toggle('checked', this.action.checked);
        }
    }
    class ChatListTreeDelegate {
        static { this.ITEM_HEIGHT = 22; }
        getHeight(element) {
            return ChatListTreeDelegate.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            return 'chatListTreeTemplate';
        }
    }
    class ChatListTreeCompressionDelegate {
        isIncompressible(element) {
            return !element.children;
        }
    }
    class ChatListTreeRenderer {
        constructor(labels, decorations) {
            this.labels = labels;
            this.decorations = decorations;
            this.templateId = 'chatListTreeTemplate';
        }
        renderCompressedElements(element, index, templateData, height) {
            templateData.label.element.style.display = 'flex';
            const label = element.element.elements.map((e) => e.label);
            templateData.label.setResource({ resource: element.element.elements[0].uri, name: label }, {
                title: element.element.elements[0].label,
                fileKind: element.children ? files_1.FileKind.FOLDER : files_1.FileKind.FILE,
                extraClasses: ['explorer-item'],
                fileDecorations: this.decorations
            });
        }
        renderTemplate(container) {
            const templateDisposables = new lifecycle_1.DisposableStore();
            const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true }));
            return { templateDisposables, label };
        }
        renderElement(element, index, templateData, height) {
            templateData.label.element.style.display = 'flex';
            if (!element.children.length && element.element.type !== files_1.FileType.Directory) {
                templateData.label.setFile(element.element.uri, {
                    fileKind: files_1.FileKind.FILE,
                    hidePath: true,
                    fileDecorations: this.decorations,
                });
            }
            else {
                templateData.label.setResource({ resource: element.element.uri, name: element.element.label }, {
                    title: element.element.label,
                    fileKind: files_1.FileKind.FOLDER,
                    fileDecorations: this.decorations
                });
            }
        }
        disposeTemplate(templateData) {
            templateData.templateDisposables.dispose();
        }
    }
    class ChatListTreeDataSource {
        hasChildren(element) {
            return !!element.children;
        }
        async getChildren(element) {
            return element.children ?? [];
        }
    }
    function isInteractiveProgressTreeData(item) {
        return 'label' in item;
    }
    function contentToMarkdown(str) {
        return typeof str === 'string' ? { value: str } : str;
    }
    function isProgressMessage(item) {
        return item && 'kind' in item && item.kind === 'progressMessage';
    }
    function isProgressMessageRenderData(item) {
        return item && 'isAtEndOfResponse' in item;
    }
    function onlyProgressMessagesAfterI(items, i) {
        return items.slice(i).every(isProgressMessage);
    }
    function onlyProgressMessageRenderDatasAfterI(items, i) {
        return items.slice(i).every(isProgressMessageRenderData);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdExpc3RSZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRMaXN0UmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdFaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQXNCaEIsTUFBTSx5QkFBeUIsR0FBRyxLQUFLLENBQUM7SUFZakMsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBVTs7aUJBQ25DLE9BQUUsR0FBRyxNQUFNLEFBQVQsQ0FBVTtRQTBCNUIsWUFDa0IsYUFBZ0MsRUFDaEMsZUFBNkMsRUFDN0MsUUFBK0IsRUFDekIsb0JBQTRELEVBQzVELGFBQW9DLEVBQzlDLFVBQXdDLEVBQ3BDLGNBQWdELEVBQ2pELGFBQThDLEVBQzFDLGlCQUFzRCxFQUM1RCxXQUEwQyxFQUN4QyxhQUE4QyxFQUMvQyxZQUE0QztZQUUzRCxLQUFLLEVBQUUsQ0FBQztZQWJTLGtCQUFhLEdBQWIsYUFBYSxDQUFtQjtZQUNoQyxvQkFBZSxHQUFmLGVBQWUsQ0FBOEI7WUFDN0MsYUFBUSxHQUFSLFFBQVEsQ0FBdUI7WUFDUix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBRXJELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDbkIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2hDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN6QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQzNDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3ZCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUM5QixpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQXBDM0MsMkJBQXNCLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7WUFD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
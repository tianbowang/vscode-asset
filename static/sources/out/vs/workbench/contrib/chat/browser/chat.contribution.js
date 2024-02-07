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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/actions/chatCodeblockActions", "vs/workbench/contrib/chat/browser/actions/chatCopyActions", "vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/contrib/chat/browser/actions/chatTitleActions", "vs/workbench/contrib/chat/browser/actions/chatImportExport", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatContributionServiceImpl", "vs/workbench/contrib/chat/browser/chatEditor", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatServiceImpl", "vs/workbench/contrib/chat/common/chatWidgetHistoryService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/contrib/chat/browser/actions/chatMoveActions", "vs/workbench/contrib/chat/browser/actions/chatClearActions", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/browser/chatAccessibilityService", "vs/editor/browser/services/codeEditorService", "vs/workbench/contrib/chat/common/chatModel", "vs/base/common/htmlContent", "vs/workbench/contrib/chat/common/chatProvider", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/accessibility/browser/accessibilityContributions", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/platform/commands/common/commands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/contrib/chat/browser/actions/chatFileTreeActions", "vs/workbench/contrib/chat/browser/chatQuick", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/browser/chatVariables", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/base/common/cancellation", "vs/workbench/contrib/chat/browser/contrib/chatInputEditorContrib", "vs/workbench/contrib/chat/browser/contrib/chatHistoryVariables", "../common/chatColors"], function (require, exports, lifecycle_1, network_1, platform_1, nls, configurationRegistry_1, descriptors_1, extensions_1, instantiation_1, platform_2, editor_1, contributions_1, editor_2, chatActions_1, chatCodeblockActions_1, chatCopyActions_1, chatExecuteActions_1, chatQuickInputActions_1, chatTitleActions_1, chatImportExport_1, chat_1, chatContributionServiceImpl_1, chatEditor_1, chatEditorInput_1, chatWidget_1, chatContributionService_1, chatService_1, chatServiceImpl_1, chatWidgetHistoryService_1, editorResolverService_1, chatMoveActions_1, chatClearActions_1, accessibleView_1, chatViewModel_1, chatContextKeys_1, chatAccessibilityService_1, codeEditorService_1, chatModel_1, htmlContent_1, chatProvider_1, chatSlashCommands_1, accessibilityContributions_1, accessibleViewActions_1, commands_1, chatVariables_1, chatFileTreeActions_1, chatQuick_1, chatAgents_1, chatVariables_2, chatParserTypes_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register configuration
    const configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'chatSidebar',
        title: nls.localize('interactiveSessionConfigurationTitle', "Chat"),
        type: 'object',
        properties: {
            'chat.editor.fontSize': {
                type: 'number',
                description: nls.localize('interactiveSession.editor.fontSize', "Controls the font size in pixels in chat codeblocks."),
                default: platform_1.isMacintosh ? 12 : 14,
            },
            'chat.editor.fontFamily': {
                type: 'string',
                description: nls.localize('interactiveSession.editor.fontFamily', "Controls the font family in chat codeblocks."),
                default: 'default'
            },
            'chat.editor.fontWeight': {
                type: 'string',
                description: nls.localize('interactiveSession.editor.fontWeight', "Controls the font weight in chat codeblocks."),
                default: 'default'
            },
            'chat.editor.wordWrap': {
                type: 'string',
                description: nls.localize('interactiveSession.editor.wordWrap', "Controls whether lines should wrap in chat codeblocks."),
                default: 'off',
                enum: ['on', 'off']
            },
            'chat.editor.lineHeight': {
                type: 'number',
                description: nls.localize('interactiveSession.editor.lineHeight', "Controls the line height in pixels in chat codeblocks. Use 0 to compute the line height from the font size."),
                default: 0
            }
        }
    });
    platform_2.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(chatEditor_1.ChatEditor, chatEditorInput_1.ChatEditorInput.EditorID, nls.localize('chat', "Chat")), [
        new descriptors_1.SyncDescriptor(chatEditorInput_1.ChatEditorInput)
    ]);
    let ChatResolverContribution = class ChatResolverContribution extends lifecycle_1.Disposable {
        constructor(editorResolverService, instantiationService) {
            super();
            this._register(editorResolverService.registerEditor(`${network_1.Schemas.vscodeChatSesssion}:**/**`, {
                id: chatEditorInput_1.ChatEditorInput.EditorID,
                label: nls.localize('chat', "Chat"),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }, {
                singlePerResource: true,
                canSupportResource: resource => resource.scheme === network_1.Schemas.vscodeChatSesssion
            }, {
                createEditorInput: ({ resource, options }) => {
                    return { editor: instantiationService.createInstance(chatEditorInput_1.ChatEditorInput, resource, options), options };
                }
            }));
        }
    };
    ChatResolverContribution = __decorate([
        __param(0, editorResolverService_1.IEditorResolverService),
        __param(1, instantiation_1.IInstantiationService)
    ], ChatResolverContribution);
    class ChatAccessibleViewContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(100, 'panelChat', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                return renderAccessibleView(accessibleViewService, widgetService, codeEditorService, true);
                function renderAccessibleView(accessibleViewService, widgetService, codeEditorService, initialRender) {
                    const widget = widgetService.lastFocusedWidget;
                    if (!widget) {
                        return false;
                    }
                    const chatInputFocused = initialRender && !!codeEditorService.getFocusedCodeEditor();
                    if (initialRender && chatInputFocused) {
                        widget.focusLastMessage();
                    }
                    if (!widget) {
                        return false;
                    }
                    const verifiedWidget = widget;
                    const focusedItem = verifiedWidget.getFocus();
                    if (!focusedItem) {
                        return false;
                    }
                    widget.focus(focusedItem);
                    const isWelcome = focusedItem instanceof chatModel_1.ChatWelcomeMessageModel;
                    let responseContent = (0, chatViewModel_1.isResponseVM)(focusedItem) ? focusedItem.response.asString() : undefined;
                    if (isWelcome) {
                        const welcomeReplyContents = [];
                        for (const content of focusedItem.content) {
                            if (Array.isArray(content)) {
                                welcomeReplyContents.push(...content.map(m => m.message));
                            }
                            else {
                                welcomeReplyContents.push(content.value);
                            }
                        }
                        responseContent = welcomeReplyContents.join('\n');
                    }
                    if (!responseContent && 'errorDetails' in focusedItem && focusedItem.errorDetails) {
                        responseContent = focusedItem.errorDetails.message;
                    }
                    if (!responseContent) {
                        return false;
                    }
                    const responses = verifiedWidget.viewModel?.getItems().filter(i => (0, chatViewModel_1.isResponseVM)(i));
                    const length = responses?.length;
                    const responseIndex = responses?.findIndex(i => i === focusedItem);
                    accessibleViewService.show({
                        id: "panelChat" /* AccessibleViewProviderId.Chat */,
                        verbositySettingKey: "accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */,
                        provideContent() { return responseContent; },
                        onClose() {
                            verifiedWidget.reveal(focusedItem);
                            if (chatInputFocused) {
                                verifiedWidget.focusInput();
                            }
                            else {
                                verifiedWidget.focus(focusedItem);
                            }
                        },
                        next() {
                            verifiedWidget.moveFocus(focusedItem, 'next');
                            (0, accessibilityContributions_1.alertFocusChange)(responseIndex, length, 'next');
                            renderAccessibleView(accessibleViewService, widgetService, codeEditorService);
                        },
                        previous() {
                            verifiedWidget.moveFocus(focusedItem, 'previous');
                            (0, accessibilityContributions_1.alertFocusChange)(responseIndex, length, 'previous');
                            renderAccessibleView(accessibleViewService, widgetService, codeEditorService);
                        },
                        options: { type: "view" /* AccessibleViewType.View */ }
                    });
                    return true;
                }
            }, chatContextKeys_1.CONTEXT_IN_CHAT_SESSION));
        }
    }
    let ChatSlashStaticSlashCommandsContribution = class ChatSlashStaticSlashCommandsContribution extends lifecycle_1.Disposable {
        constructor(slashCommandService, commandService, chatAgentService) {
            super();
            this._store.add(slashCommandService.registerSlashCommand({
                command: 'newChat',
                detail: nls.localize('newChat', "Start a new chat"),
                sortText: 'z2_newChat',
                executeImmediately: true
            }, async () => {
                commandService.executeCommand(chatClearActions_1.ACTION_ID_NEW_CHAT);
            }));
            this._store.add(slashCommandService.registerSlashCommand({
                command: 'help',
                detail: '',
                sortText: 'z1_help',
                executeImmediately: true
            }, async (prompt, progress) => {
                const defaultAgent = chatAgentService.getDefaultAgent();
                const agents = chatAgentService.getAgents();
                if (defaultAgent?.metadata.helpTextPrefix) {
                    if ((0, htmlContent_1.isMarkdownString)(defaultAgent.metadata.helpTextPrefix)) {
                        progress.report({ content: defaultAgent.metadata.helpTextPrefix, kind: 'markdownContent' });
                    }
                    else {
                        progress.report({ content: defaultAgent.metadata.helpTextPrefix, kind: 'content' });
                    }
                    progress.report({ content: '\n\n', kind: 'content' });
                }
                const agentText = (await Promise.all(agents
                    .filter(a => a.id !== defaultAgent?.id)
                    .map(async (a) => {
                    const agentWithLeader = `${chatParserTypes_1.chatAgentLeader}${a.id}`;
                    const actionArg = { inputValue: `${agentWithLeader} ${a.metadata.sampleRequest}` };
                    const urlSafeArg = encodeURIComponent(JSON.stringify(actionArg));
                    const agentLine = `* [\`${agentWithLeader}\`](command:${chatExecuteActions_1.SubmitAction.ID}?${urlSafeArg}) - ${a.metadata.description}`;
                    const commands = await a.provideSlashCommands(cancellation_1.CancellationToken.None);
                    const commandText = commands.map(c => {
                        const actionArg = { inputValue: `${agentWithLeader} ${chatParserTypes_1.chatSubcommandLeader}${c.name} ${c.sampleRequest ?? ''}` };
                        const urlSafeArg = encodeURIComponent(JSON.stringify(actionArg));
                        return `\t* [\`${chatParserTypes_1.chatSubcommandLeader}${c.name}\`](command:${chatExecuteActions_1.SubmitAction.ID}?${urlSafeArg}) - ${c.description}`;
                    }).join('\n');
                    return (agentLine + '\n' + commandText).trim();
                }))).join('\n');
                progress.report({ content: new htmlContent_1.MarkdownString(agentText, { isTrusted: { enabledCommands: [chatExecuteActions_1.SubmitAction.ID] } }), kind: 'markdownContent' });
                if (defaultAgent?.metadata.helpTextPostfix) {
                    progress.report({ content: '\n\n', kind: 'content' });
                    if ((0, htmlContent_1.isMarkdownString)(defaultAgent.metadata.helpTextPostfix)) {
                        progress.report({ content: defaultAgent.metadata.helpTextPostfix, kind: 'markdownContent' });
                    }
                    else {
                        progress.report({ content: defaultAgent.metadata.helpTextPostfix, kind: 'content' });
                    }
                }
            }));
        }
    };
    ChatSlashStaticSlashCommandsContribution = __decorate([
        __param(0, chatSlashCommands_1.IChatSlashCommandService),
        __param(1, commands_1.ICommandService),
        __param(2, chatAgents_1.IChatAgentService)
    ], ChatSlashStaticSlashCommandsContribution);
    const workbenchContributionsRegistry = platform_2.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(ChatResolverContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(ChatAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(ChatSlashStaticSlashCommandsContribution, 4 /* LifecyclePhase.Eventually */);
    platform_2.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(chatEditorInput_1.ChatEditorInput.TypeID, chatEditorInput_1.ChatEditorInputSerializer);
    (0, chatActions_1.registerChatActions)();
    (0, chatCopyActions_1.registerChatCopyActions)();
    (0, chatCodeblockActions_1.registerChatCodeBlockActions)();
    (0, chatFileTreeActions_1.registerChatFileTreeActions)();
    (0, chatTitleActions_1.registerChatTitleActions)();
    (0, chatExecuteActions_1.registerChatExecuteActions)();
    (0, chatQuickInputActions_1.registerQuickChatActions)();
    (0, chatImportExport_1.registerChatExportActions)();
    (0, chatMoveActions_1.registerMoveActions)();
    (0, chatClearActions_1.registerNewChatActions)();
    (0, extensions_1.registerSingleton)(chatService_1.IChatService, chatServiceImpl_1.ChatService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatContributionService_1.IChatContributionService, chatContributionServiceImpl_1.ChatContributionService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chat_1.IChatWidgetService, chatWidget_1.ChatWidgetService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chat_1.IQuickChatService, chatQuick_1.QuickChatService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chat_1.IChatAccessibilityService, chatAccessibilityService_1.ChatAccessibilityService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatWidgetHistoryService_1.IChatWidgetHistoryService, chatWidgetHistoryService_1.ChatWidgetHistoryService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatProvider_1.IChatProviderService, chatProvider_1.ChatProviderService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatSlashCommands_1.IChatSlashCommandService, chatSlashCommands_1.ChatSlashCommandService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatAgents_1.IChatAgentService, chatAgents_1.ChatAgentService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(chatVariables_1.IChatVariablesService, chatVariables_2.ChatVariablesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9jaGF0LmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQTBEaEcseUJBQXlCO0lBQ3pCLE1BQU0scUJBQXFCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3pHLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDO1FBQzNDLEVBQUUsRUFBRSxhQUFhO1FBQ2pCLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLE1BQU0sQ0FBQztRQUNuRSxJQUFJLEVBQUUsUUFBUTtRQUNkLFVBQVUsRUFBRTtZQUNYLHNCQUFzQixFQUFFO2dCQUN2QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSxzREFBc0QsQ0FBQztnQkFDdkgsT0FBTyxFQUFFLHNCQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTthQUM5QjtZQUNELHdCQUF3QixFQUFFO2dCQUN6QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsRUFBRSw4Q0FBOEMsQ0FBQztnQkFDakgsT0FBTyxFQUFFLFNBQVM7YUFDbEI7WUFDRCx3QkFBd0IsRUFBRTtnQkFDekIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0NBQXNDLEVBQUUsOENBQThDLENBQUM7Z0JBQ2pILE9BQU8sRUFBRSxTQUFTO2FBQ2xCO1lBQ0Qsc0JBQXNCLEVBQUU7Z0JBQ3ZCLElBQUks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
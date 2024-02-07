/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/contributions", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/contrib/chat/browser/actions/chatAccessibilityHelp", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatWidgetHistoryService", "vs/workbench/services/editor/common/editorService"], function (require, exports, codicons_1, lifecycle_1, themables_1, editorExtensions_1, codeEditorService_1, editorContextKeys_1, nls_1, actions_1, contextkey_1, quickInput_1, platform_1, viewPane_1, contributions_1, viewsService_1, accessibleViewActions_1, chatAccessibilityHelp_1, chat_1, chatEditorInput_1, chatAgents_1, chatContextKeys_1, chatContributionService_1, chatParserTypes_1, chatService_1, chatWidgetHistoryService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getHistoryAction = exports.getOpenChatEditorAction = exports.registerChatActions = exports.ChatSubmitEditorAction = exports.ChatSubmitSecondaryAgentEditorAction = exports.CHAT_OPEN_ACTION_ID = exports.CHAT_CATEGORY = void 0;
    exports.CHAT_CATEGORY = (0, nls_1.localize2)('chat.category', 'Chat');
    exports.CHAT_OPEN_ACTION_ID = 'workbench.action.chat.open';
    class OpenChatGlobalAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.CHAT_OPEN_ACTION_ID,
                title: (0, nls_1.localize2)('openChat', "Open Chat"),
                precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                icon: codicons_1.Codicon.commentDiscussion,
                f1: false,
                category: exports.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 39 /* KeyCode.KeyI */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 39 /* KeyCode.KeyI */
                    }
                }
            });
        }
        async run(accessor, opts) {
            opts = typeof opts === 'string' ? { query: opts } : opts;
            const chatService = accessor.get(chatService_1.IChatService);
            const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
            const providers = chatService.getProviderInfos();
            if (!providers.length) {
                return;
            }
            const chatWidget = await chatWidgetService.revealViewForProvider(providers[0].id);
            if (!chatWidget) {
                return;
            }
            if (opts?.query) {
                if (opts.isPartialQuery) {
                    chatWidget.setInput(opts.query);
                }
                else {
                    chatWidget.acceptInput(opts.query);
                }
            }
            chatWidget.focusInput();
        }
    }
    class ChatSubmitSecondaryAgentEditorAction extends editorExtensions_1.EditorAction2 {
        static { this.ID = 'workbench.action.chat.submitSecondaryAgent'; }
        constructor() {
            super({
                id: ChatSubmitSecondaryAgentEditorAction.ID,
                title: (0, nls_1.localize2)({ key: 'actions.chat.submitSecondaryAgent', comment: ['Send input from the chat input box to the secondary agent'] }, "Submit to Secondary Agent"),
                precondition: chatContextKeys_1.CONTEXT_IN_CHAT_INPUT,
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runEditorCommand(accessor, editor) {
            const editorUri = editor.getModel()?.uri;
            if (editorUri) {
                const agentService = accessor.get(chatAgents_1.IChatAgentService);
                const secondaryAgent = agentService.getSecondaryAgent();
                if (!secondaryAgent) {
                    return;
                }
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                widgetService.getWidgetByInputUri(editorUri)?.acceptInputWithPrefix(`${chatParserTypes_1.chatAgentLeader}${secondaryAgent.id}`);
            }
        }
    }
    exports.ChatSubmitSecondaryAgentEditorAction = ChatSubmitSecondaryAgentEditorAction;
    class ChatSubmitEditorAction extends editorExtensions_1.EditorAction2 {
        static { this.ID = 'workbench.action.chat.acceptInput'; }
        constructor() {
            super({
                id: ChatSubmitEditorAction.ID,
                title: (0, nls_1.localize2)({ key: 'actions.chat.submit', comment: ['Apply input from the chat input box'] }, "Submit"),
                precondition: chatContextKeys_1.CONTEXT_IN_CHAT_INPUT,
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        runEditorCommand(accessor, editor) {
            const editorUri = editor.getModel()?.uri;
            if (editorUri) {
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                widgetService.getWidgetByInputUri(editorUri)?.acceptInput();
            }
        }
    }
    exports.ChatSubmitEditorAction = ChatSubmitEditorAction;
    function registerChatActions() {
        (0, actions_1.registerAction2)(OpenChatGlobalAction);
        (0, actions_1.registerAction2)(ChatSubmitEditorAction);
        (0, actions_1.registerAction2)(ChatSubmitSecondaryAgentEditorAction);
        (0, actions_1.registerAction2)(class ClearChatInputHistoryAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.clearInputHistory',
                    title: (0, nls_1.localize2)('interactiveSession.clearHistory.label', "Clear Input History"),
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    category: exports.CHAT_CATEGORY,
                    f1: true,
                });
            }
            async run(accessor, ...args) {
                const historyService = accessor.get(chatWidgetHistoryService_1.IChatWidgetHistoryService);
                historyService.clearHistory();
            }
        });
        (0, actions_1.registerAction2)(class ClearChatHistoryAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.clearHistory',
                    title: (0, nls_1.localize2)('chat.clear.label', "Clear All Workspace Chats"),
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    category: exports.CHAT_CATEGORY,
                    f1: true,
                });
            }
            async run(accessor, ...args) {
                const chatService = accessor.get(chatService_1.IChatService);
                chatService.clearAllHistoryEntries();
            }
        });
        (0, actions_1.registerAction2)(class FocusChatAction extends editorExtensions_1.EditorAction2 {
            constructor() {
                super({
                    id: 'chat.action.focus',
                    title: (0, nls_1.localize2)('actions.interactiveSession.focus', 'Focus Chat List'),
                    precondition: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_IN_CHAT_INPUT, chatContextKeys_1.CONTEXT_CHAT_INPUT_CURSOR_AT_TOP),
                    category: exports.CHAT_CATEGORY,
                    keybinding: {
                        when: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }
                });
            }
            runEditorCommand(accessor, editor) {
                const editorUri = editor.getModel()?.uri;
                if (editorUri) {
                    const widgetService = accessor.get(chat_1.IChatWidgetService);
                    widgetService.getWidgetByInputUri(editorUri)?.focusLastMessage();
                }
            }
        });
        class ChatAccessibilityHelpContribution extends lifecycle_1.Disposable {
            constructor() {
                super();
                this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(105, 'panelChat', async (accessor) => {
                    const codeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getActiveCodeEditor() || accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
                    (0, chatAccessibilityHelp_1.runAccessibilityHelpAction)(accessor, codeEditor ?? undefined, 'panelChat');
                }, contextkey_1.ContextKeyExpr.or(chatContextKeys_1.CONTEXT_IN_CHAT_SESSION, chatContextKeys_1.CONTEXT_RESPONSE, chatContextKeys_1.CONTEXT_REQUEST)));
            }
        }
        const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(ChatAccessibilityHelpContribution, 4 /* LifecyclePhase.Eventually */);
        (0, actions_1.registerAction2)(class FocusChatInputAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.focusInput',
                    title: {
                        value: (0, nls_1.localize)('interactiveSession.focusInput.label', "Focus Chat Input"),
                        original: 'Focus Chat Input'
                    },
                    f1: false,
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: contextkey_1.ContextKeyExpr.and(chatContextKeys_1.CONTEXT_IN_CHAT_SESSION, chatContextKeys_1.CONTEXT_IN_CHAT_INPUT.negate())
                    }
                });
            }
            run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                widgetService.lastFocusedWidget?.focusInput();
            }
        });
    }
    exports.registerChatActions = registerChatActions;
    function getOpenChatEditorAction(id, label, when) {
        return class OpenChatEditor extends actions_1.Action2 {
            constructor() {
                super({
                    id: `workbench.action.openChat.${id}`,
                    title: { value: (0, nls_1.localize)('interactiveSession.open', "Open Editor ({0})", label), original: `Open Editor (${label})` },
                    f1: true,
                    category: exports.CHAT_CATEGORY,
                    precondition: contextkey_1.ContextKeyExpr.deserialize(when)
                });
            }
            async run(accessor) {
                const editorService = accessor.get(editorService_1.IEditorService);
                await editorService.openEditor({ resource: chatEditorInput_1.ChatEditorInput.getNewEditorUri(), options: { target: { providerId: id }, pinned: true } });
            }
        };
    }
    exports.getOpenChatEditorAction = getOpenChatEditorAction;
    const getHistoryChatActionDescriptorForViewTitle = (viewId, providerId) => ({
        viewId,
        id: `workbench.action.chat.${providerId}.history`,
        title: (0, nls_1.localize2)('chat.history.label', "Show Chats"),
        menu: {
            id: actions_1.MenuId.ViewTitle,
            when: contextkey_1.ContextKeyExpr.equals('view', viewId),
            group: 'navigation',
            order: -1
        },
        category: exports.CHAT_CATEGORY,
        icon: codicons_1.Codicon.history,
        f1: false,
        precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS
    });
    function getHistoryAction(viewId, providerId) {
        return class HistoryAction extends viewPane_1.ViewAction {
            constructor() {
                super(getHistoryChatActionDescriptorForViewTitle(viewId, providerId));
            }
            async runInView(accessor, view) {
                const chatService = accessor.get(chatService_1.IChatService);
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const chatContribService = accessor.get(chatContributionService_1.IChatContributionService);
                const viewsService = accessor.get(viewsService_1.IViewsService);
                const items = chatService.getHistory();
                const picks = items.map(i => ({
                    label: i.title,
                    chat: i,
                    buttons: [{
                            iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.x),
                            tooltip: (0, nls_1.localize)('interactiveSession.history.delete', "Delete"),
                        }]
                }));
                const selection = await quickInputService.pick(picks, {
                    placeHolder: (0, nls_1.localize)('interactiveSession.history.pick', "Switch to chat"),
                    onDidTriggerItemButton: context => {
                        chatService.removeHistoryEntry(context.item.chat.sessionId);
                        context.removeItem();
                    }
                });
                if (selection) {
                    const sessionId = selection.chat.sessionId;
                    const provider = chatContribService.registeredProviders[0]?.id;
                    if (provider) {
                        const viewId = chatContribService.getViewIdForProvider(provider);
                        const view = await viewsService.openView(viewId);
                        view.loadSession(sessionId);
                    }
                }
            }
        };
    }
    exports.getHistoryAction = getHistoryAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9hY3Rpb25zL2NoYXRBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtDbkYsUUFBQSxhQUFhLEdBQUcsSUFBQSxlQUFTLEVBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELFFBQUEsbUJBQW1CLEdBQUcsNEJBQTRCLENBQUM7SUFhaEUsTUFBTSxvQkFBcUIsU0FBUSxpQkFBTztRQUN6QztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsMkJBQW1CO2dCQUN2QixLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztnQkFDekMsWUFBWSxFQUFFLHlDQUF1QjtnQkFDckMsSUFBSSxFQUFFLGtCQUFPLENBQUMsaUJBQWlCO2dCQUMvQixFQUFFLEVBQUUsS0FBSztnQkFDVCxRQUFRLEVBQUUscUJBQWE7Z0JBQ3ZCLFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsT0FBTyxFQUFFLGdEQUEyQix3QkFBZTtvQkFDbkQsR0FBRyxFQUFFO3dCQUNKLE9BQU8sRUFBRSxvREFBK0Isd0JBQWU7cUJBQ3ZEO2lCQUNEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxJQUFvQztZQUNsRixJQUFJLEdBQUcsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBRXpELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO1lBQy9DLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2pELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3ZCLE9BQU87WUFDUixDQUFDO1lBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNqQixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUNqQixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDekIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztZQUNGLENBQUM7WUFFRCxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDekIsQ0FBQztLQUNEO0lBRUQsTUFBYSxvQ0FBcUMsU0FBUSxnQ0FBYTtpQkFDdEQsT0FBRSxHQUFHLDRDQUE0QyxDQUFDO1FBRWxFO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxvQ0FBb0MsQ0FBQyxFQUFFO2dCQUMzQyxLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsRUFBRSxHQUFHLEVBQUUsbUNBQW1DLEVBQUUsT0FBTyxFQUFFLENBQUMsMkRBQTJELENBQUMsRUFBRSxFQUFFLDJCQUEyQixDQUFDO2dCQUNuSyxZQUFZLEVBQUUsdUNBQXFCO2dCQUNuQyxVQUFVLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLHFDQUFpQixDQUFDLGNBQWM7b0JBQ3RDLE9BQU8sRUFBRSxpREFBOEI7b0JBQ3ZDLE1BQU0sMENBQWdDO2lCQUN0QzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxRQUEwQixFQUFFLE1BQW1CO1lBQy9ELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUM7WUFDekMsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDZixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFpQixDQUFDLENBQUM7Z0JBQ3JELE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN4RCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3JCLE9BQU87Z0JBQ1IsQ0FBQztnQkFFRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHlCQUFrQixDQUFDLENBQUM7Z0JBQ3ZELGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxxQkFBcUIsQ0FBQyxHQUFHLGlDQUFlLEdBQUcsY0FBYyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDL0csQ0FBQztRQUNGLENBQUM7O0lBNUJGLG9GQTZCQztJQUVELE1BQWEsc0JBQXVCLFNBQVEsZ0NBQWE7aUJBQ3hDLE9BQUUsR0FBRyxtQ0FBbUMsQ0FBQztRQUV6RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsc0JBQXNCLENBQUMsRUFBRTtnQkFDN0IsS0FBSyxFQUFFLElBQUEsZUFBUyxFQUFDLEVBQUUsR0FBRyxFQUFFLHFCQUFxQixFQUFFLE9BQU8sRUFBRSxDQUFDLHFDQUFxQyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUM7Z0JBQzVHLFlBQVksRUFBRSx1Q0FBcUI7Z0JBQ25DLFVBQVUsRUFBRTtvQkFDWCxJQUFJLEVBQUUscUNBQWlCLENBQUMsY0FBYztvQkFDdEMsT0FBTyx1QkFBZTtvQkFDdEIsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELGdCQUFnQixDQUFDLFFBQTBCLEVBQUUsTUFBbUI7WUFDL0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUN6QyxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUNmLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQWtCLENBQUMsQ0FBQztnQkFDdkQsYUFBYSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQzdELENBQUM7UUFDRixDQUFDOztJQXRCRix3REF1QkM7SUFFRCxTQUFnQixtQkFBbUI7UUFDbEMsSUFBQSx5QkFBZSxFQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDdEMsSUFBQSx5QkFBZSxFQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFeEMsSUFBQSx5QkFBZSxFQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFFdEQsSUFBQSx5QkFBZSxFQUFDLE1BQU0sMkJBQTRCLFNBQVEsaUJBQU87WUFDaEU7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSx5Q0FBeUM7b0JBQzdDLEtBQUssRUFBRSxJQUFBLGVBQVMsRUFBQyx1Q0FBdUMsRUFBRSxxQkFBcUIsQ0FBQztvQkFDaEYsWUFBWSxFQUFFLHlDQUF1QjtvQkFDckMsUUFBUSxFQUFFLHFCQUFhO29CQUN2QixFQUFFLEVBQUUsSUFBSTtpQkFDUixDQUFDLENBQUM7WUFDSixDQUFDO1lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDbkQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvREFBeUIsQ0FBQyxDQUFDO2dCQUMvRCxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDL0IsQ0FBQztTQUNELENBQUMsQ0FBQztRQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLHNCQUF1QixTQUFRLGlCQUFPO1lBQzNEO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUsb0NBQW9DO29CQUN4QyxLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsa0JBQWtCLEVBQUUsMkJBQTJCLENBQUM7b0JBQ2pFLFlBQVksRUFBRSx5Q0FBdUI7b0JBQ3JDLFFBQVEsRUFBRSxxQkFBYTtvQkFDdkIsRUFBRSxFQUFFLElBQUk7aUJBQ1IsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7Z0JBQ25ELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO2dCQUMvQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUN0QyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO1FBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0sZUFBZ0IsU0FBUSxnQ0FBYTtZQUMxRDtnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLG1CQUFtQjtvQkFDdkIsS0FBSyxFQUFFLElBQUEsZUFBUyxFQUFDLGtDQUFrQyxFQUFFLGlCQUFpQixDQUFDO29CQUN2RSxZQUFZLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsdUNBQXFCLEVBQUUsa0RBQWdDLENBQUM7b0JBQ3pGLFFBQVEsRUFBRSxxQkFBYTtvQkFDdkIsVUFBVSxFQUFFO3dCQUNYLElBQUksRUFBRSxxQ0FBaUIsQ0FBQyxjQUFjO3dCQUN0QyxPQUFPLEVBQUUsb0RBQWdDO3dCQUN6QyxNQUFNLDBDQUFnQztxQkFDdEM7aUJBQ0QsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELGdCQUFnQixDQUFDLFFBQTBCLEVBQUUsTUFBbUI7Z0JBQy9ELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUM7Z0JBQ3pDLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQ2YsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FBQyxDQUFDO29CQUN2RCxhQUFhLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDbEUsQ0FBQztZQUNGLENBQUM7U0FDRCxDQUFDLENBQUM7UUFFSCxNQUFNLGlDQUFrQyxTQUFRLHNCQUFVO1lBRXpEO2dCQUNDLEtBQUssRUFBRSxDQUFDO2dCQUNSLElBQUksQ0FBQyxTQUFTLENBQUMsK0NBQXVCLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUMsUUFBUSxFQUFDLEVBQUU7b0JBQzNGLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0NBQWtCLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0NBQWtCLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO29CQUNySSxJQUFBLGtEQUEwQixFQUFDLFFBQVEsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUM1RSxDQUFDLEVBQUUsMkJBQWMsQ0FBQyxFQUFFLENBQUMseUNBQXVCLEVBQUUsa0NBQWdCLEVBQUUsaUNBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRixDQUFDO1NBQ0Q7UUFFRCxNQUFNLGlCQUFpQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RyxpQkFBaUIsQ0FBQyw2QkFBNkIsQ0FBQyxpQ0FBaUMsb0NBQTRCLENBQUM7UUFFOUcsSUFBQSx5QkFBZSxFQUFDLE1BQU0sb0JBQXFCLFNBQVEsaUJBQU87WUFDekQ7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSxrQ0FBa0M7b0JBQ3RDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMscUNBQXFDLEVBQUUsa0JBQWtCLENBQUM7d0JBQzFFLFFBQVEsRUFBRSxrQkFBa0I7cUJBQzVCO29CQUNELEVBQUUsRUFBRSxLQUFLO29CQUNULFVBQVUsRUFBRTt3QkFDWCxPQUFPLEVBQUUsc0RBQWtDO3dCQUMzQyxNQUFNLDZDQUFtQzt3QkFDekMsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLHlDQUF1QixFQUFFLHVDQUFxQixDQUFDLE1BQU0sRUFBRSxDQUFDO3FCQUNqRjtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBQ0QsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO2dCQUM3QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHlCQUFrQixDQUFDLENBQUM7Z0JBQ3ZELGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsQ0FBQztZQUMvQyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQWpHRCxrREFpR0M7SUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxFQUFVLEVBQUUsS0FBYSxFQUFFLElBQWE7UUFDL0UsT0FBTyxNQUFNLGNBQWUsU0FBUSxpQkFBTztZQUMxQztnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLDZCQUE2QixFQUFFLEVBQUU7b0JBQ3JDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSxtQkFBbUIsRUFBRSxLQUFLLENBQUMsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEtBQUssR0FBRyxFQUFFO29CQUNySCxFQUFFLEVBQUUsSUFBSTtvQkFDUixRQUFRLEVBQUUscUJBQWE7b0JBQ3ZCLFlBQVksRUFBRSwyQkFBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7aUJBQzlDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO2dCQUNuQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLGlDQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsT0FBTyxFQUFzQixFQUFFLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVKLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQWpCRCwwREFpQkM7SUFFRCxNQUFNLDBDQUEwQyxHQUFHLENBQUMsTUFBYyxFQUFFLFVBQWtCLEVBQWtELEVBQUUsQ0FBQyxDQUFDO1FBQzNJLE1BQU07UUFDTixFQUFFLEVBQUUseUJBQXlCLFVBQVUsVUFBVTtRQUNqRCxLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsb0JBQW9CLEVBQUUsWUFBWSxDQUFDO1FBQ3BELElBQUksRUFBRTtZQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7WUFDcEIsSUFBSSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDM0MsS0FBSyxFQUFFLFlBQVk7WUFDbkIsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNUO1FBQ0QsUUFBUSxFQUFFLHFCQUFhO1FBQ3ZCLElBQUksRUFBRSxrQkFBTyxDQUFDLE9BQU87UUFDckIsRUFBRSxFQUFFLEtBQUs7UUFDVCxZQUFZLEVBQUUseUNBQXVCO0tBQ3JDLENBQUMsQ0FBQztJQUVILFNBQWdCLGdCQUFnQixDQUFDLE1BQWMsRUFBRSxVQUFrQjtRQUNsRSxPQUFPLE1BQU0sYUFBYyxTQUFRLHFCQUF3QjtZQUMxRDtnQkFDQyxLQUFLLENBQUMsMENBQTBDLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDdkUsQ0FBQztZQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBMEIsRUFBRSxJQUFrQjtnQkFDN0QsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBWSxDQUFDLENBQUM7Z0JBQy9DLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0RBQXdCLENBQUMsQ0FBQztnQkFDbEUsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw0QkFBYSxDQUFDLENBQUM7Z0JBQ2pELE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdkMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQXlDO29CQUNyRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0JBQ2QsSUFBSSxFQUFFLENBQUM7b0JBQ1AsT0FBTyxFQUFFLENBQUM7NEJBQ1QsU0FBUyxFQUFFLHFCQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFPLENBQUMsQ0FBQyxDQUFDOzRCQUMzQyxPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUNBQW1DLEVBQUUsUUFBUSxDQUFDO3lCQUNoRSxDQUFDO2lCQUNELENBQUEsQ0FBQyxDQUFDO2dCQUNKLE1BQU0sU0FBUyxHQUFHLE1BQU0saUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFDbkQ7b0JBQ0MsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLGlDQUFpQyxFQUFFLGdCQUFnQixDQUFDO29CQUMxRSxzQkFBc0IsRUFBRSxPQUFPLENBQUMsRUFBRTt3QkFDakMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUM1RCxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ3RCLENBQUM7aUJBQ0QsQ0FBQyxDQUFDO2dCQUNKLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQ2YsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQzNDLE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDL0QsSUFBSSxRQUFRLEVBQUUsQ0FBQzt3QkFDZCxNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDakUsTUFBTSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBaUIsQ0FBQzt3QkFDakUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDN0IsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztTQUNELENBQUM7SUFDSCxDQUFDO0lBdkNELDRDQXVDQyJ9
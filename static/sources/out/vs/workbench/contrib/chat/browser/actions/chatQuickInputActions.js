/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/selection", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/inlineChat/browser/inlineChatController"], function (require, exports, codicons_1, codeEditorService_1, selection_1, nls_1, actions_1, chatActions_1, chat_1, chatContextKeys_1, inlineChatController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getQuickChatActionForProvider = exports.registerQuickChatActions = exports.ASK_QUICK_QUESTION_ACTION_ID = void 0;
    exports.ASK_QUICK_QUESTION_ACTION_ID = 'workbench.action.quickchat.toggle';
    function registerQuickChatActions() {
        (0, actions_1.registerAction2)(QuickChatGlobalAction);
        (0, actions_1.registerAction2)(class OpenInChatViewAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.quickchat.openInChatView',
                    title: {
                        value: (0, nls_1.localize)('chat.openInChatView.label', "Open in Chat View"),
                        original: 'Open in Chat View'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.commentDiscussion,
                    menu: {
                        id: actions_1.MenuId.ChatInputSide,
                        group: 'navigation',
                        order: 10
                    }
                });
            }
            run(accessor) {
                const quickChatService = accessor.get(chat_1.IQuickChatService);
                quickChatService.openInChatView();
            }
        });
        (0, actions_1.registerAction2)(class CloseQuickChatAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.quickchat.close',
                    title: {
                        value: (0, nls_1.localize)('chat.closeQuickChat.label', "Close Quick Chat"),
                        original: 'Close Quick Chat'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.close,
                    menu: {
                        id: actions_1.MenuId.ChatInputSide,
                        group: 'navigation',
                        order: 20
                    }
                });
            }
            run(accessor) {
                const quickChatService = accessor.get(chat_1.IQuickChatService);
                quickChatService.close();
            }
        });
        (0, actions_1.registerAction2)(class LaunchInlineChatFromQuickChatAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.quickchat.launchInlineChat',
                    title: {
                        value: (0, nls_1.localize)('chat.launchInlineChat.label', "Launch Inline Chat"),
                        original: 'Launch Inline Chat'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY
                });
            }
            async run(accessor) {
                const quickChatService = accessor.get(chat_1.IQuickChatService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                if (quickChatService.focused) {
                    quickChatService.close();
                }
                const codeEditor = codeEditorService.getActiveCodeEditor();
                if (!codeEditor) {
                    return;
                }
                const controller = inlineChatController_1.InlineChatController.get(codeEditor);
                if (!controller) {
                    return;
                }
                await controller.run();
                controller.focus();
            }
        });
    }
    exports.registerQuickChatActions = registerQuickChatActions;
    class QuickChatGlobalAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.ASK_QUICK_QUESTION_ACTION_ID,
                title: (0, nls_1.localize2)('quickChat', 'Quick Chat'),
                precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                icon: codicons_1.Codicon.commentDiscussion,
                f1: false,
                category: chatActions_1.CHAT_CATEGORY,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */,
                    linux: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 39 /* KeyCode.KeyI */
                    }
                },
                metadata: {
                    description: (0, nls_1.localize)('toggle.desc', 'Toggle the quick chat'),
                    args: [{
                            name: 'args',
                            schema: {
                                anyOf: [
                                    {
                                        type: 'object',
                                        required: ['query'],
                                        properties: {
                                            query: {
                                                description: (0, nls_1.localize)('toggle.query', "The query to open the quick chat with"),
                                                type: 'string'
                                            },
                                            isPartialQuery: {
                                                description: (0, nls_1.localize)('toggle.isPartialQuery', "Whether the query is partial; it will wait for more user input"),
                                                type: 'boolean'
                                            }
                                        },
                                    },
                                    {
                                        type: 'string',
                                        description: (0, nls_1.localize)('toggle.query', "The query to open the quick chat with")
                                    }
                                ]
                            }
                        }]
                },
            });
        }
        run(accessor, query) {
            const quickChatService = accessor.get(chat_1.IQuickChatService);
            let options;
            switch (typeof query) {
                case 'string':
                    options = { query };
                    break;
                case 'object':
                    options = query;
                    break;
            }
            if (options?.query) {
                options.selection = new selection_1.Selection(1, options.query.length + 1, 1, options.query.length + 1);
            }
            quickChatService.toggle(undefined, options);
        }
    }
    /**
     * Returns a provider specific action that will open the quick chat for that provider.
     * This is used to include the provider label in the action title so it shows up in
     * the command palette.
     * @param id The id of the provider
     * @param label The label of the provider
     * @returns An action that will open the quick chat for this provider
     */
    function getQuickChatActionForProvider(id, label) {
        return class AskQuickChatAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: `workbench.action.openQuickChat.${id}`,
                    category: chatActions_1.CHAT_CATEGORY,
                    title: { value: (0, nls_1.localize)('interactiveSession.open', "Open Quick Chat ({0})", label), original: `Open Quick Chat (${label})` },
                    f1: true
                });
            }
            run(accessor, query) {
                const quickChatService = accessor.get(chat_1.IQuickChatService);
                quickChatService.toggle(id, query ? { query } : undefined);
            }
        };
    }
    exports.getQuickChatActionForProvider = getQuickChatActionForProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFF1aWNrSW5wdXRBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvYWN0aW9ucy9jaGF0UXVpY2tJbnB1dEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZW5GLFFBQUEsNEJBQTRCLEdBQUcsbUNBQW1DLENBQUM7SUFDaEYsU0FBZ0Isd0JBQXdCO1FBQ3ZDLElBQUEseUJBQWUsRUFBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBRXZDLElBQUEseUJBQWUsRUFBQyxNQUFNLG9CQUFxQixTQUFRLGlCQUFPO1lBQ3pEO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUsMkNBQTJDO29CQUMvQyxLQUFLLEVBQUU7d0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLG1CQUFtQixDQUFDO3dCQUNqRSxRQUFRLEVBQUUsbUJBQW1CO3FCQUM3QjtvQkFDRCxFQUFFLEVBQUUsS0FBSztvQkFDVCxRQUFRLEVBQUUsMkJBQWE7b0JBQ3ZCLElBQUksRUFBRSxrQkFBTyxDQUFDLGlCQUFpQjtvQkFDL0IsSUFBSSxFQUFFO3dCQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGFBQWE7d0JBQ3hCLEtBQUssRUFBRSxZQUFZO3dCQUNuQixLQUFLLEVBQUUsRUFBRTtxQkFDVDtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsR0FBRyxDQUFDLFFBQTBCO2dCQUM3QixNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWlCLENBQUMsQ0FBQztnQkFDekQsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbkMsQ0FBQztTQUNELENBQUMsQ0FBQztRQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLG9CQUFxQixTQUFRLGlCQUFP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
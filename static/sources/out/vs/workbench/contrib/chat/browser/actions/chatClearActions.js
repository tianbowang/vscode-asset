/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/audioCues/browser/audioCueService", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/contextkeys", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/actions/chatClear", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/common/chatContextKeys"], function (require, exports, codicons_1, nls_1, actions_1, audioCueService_1, contextkey_1, viewPane_1, contextkeys_1, chatActions_1, chatClear_1, chat_1, chatEditorInput_1, chatContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNewChatAction = exports.registerNewChatActions = exports.ACTION_ID_NEW_CHAT = void 0;
    exports.ACTION_ID_NEW_CHAT = `workbench.action.chat.newChat`;
    function registerNewChatActions() {
        (0, actions_1.registerAction2)(class NewChatEditorAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chatEditor.newChat',
                    title: (0, nls_1.localize2)('chat.newChat.label', "New Chat"),
                    icon: codicons_1.Codicon.plus,
                    f1: false,
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    menu: [{
                            id: actions_1.MenuId.EditorTitle,
                            group: 'navigation',
                            order: 0,
                            when: contextkeys_1.ActiveEditorContext.isEqualTo(chatEditorInput_1.ChatEditorInput.EditorID),
                        }]
                });
            }
            async run(accessor, ...args) {
                announceChatCleared(accessor);
                await (0, chatClear_1.clearChatEditor)(accessor);
            }
        });
        (0, actions_1.registerAction2)(class GlobalClearChatAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: exports.ACTION_ID_NEW_CHAT,
                    title: (0, nls_1.localize2)('chat.newChat.label', "New Chat"),
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.plus,
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 42 /* KeyCode.KeyL */,
                        mac: {
                            primary: 256 /* KeyMod.WinCtrl */ | 42 /* KeyCode.KeyL */
                        },
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION
                    },
                    menu: {
                        id: actions_1.MenuId.ChatContext,
                        group: 'z_clear'
                    }
                });
            }
            run(accessor, ...args) {
                const widgetService = accessor.get(chat_1.IChatWidgetService);
                const widget = widgetService.lastFocusedWidget;
                if (!widget) {
                    return;
                }
                announceChatCleared(accessor);
                widget.clear();
                widget.focusInput();
            }
        });
    }
    exports.registerNewChatActions = registerNewChatActions;
    const getNewChatActionDescriptorForViewTitle = (viewId, providerId) => ({
        viewId,
        id: `workbench.action.chat.${providerId}.newChat`,
        title: (0, nls_1.localize2)('chat.newChat.label', "New Chat"),
        menu: {
            id: actions_1.MenuId.ViewTitle,
            when: contextkey_1.ContextKeyExpr.equals('view', viewId),
            group: 'navigation',
            order: -1
        },
        precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
        category: chatActions_1.CHAT_CATEGORY,
        icon: codicons_1.Codicon.plus,
        f1: false
    });
    function getNewChatAction(viewId, providerId) {
        return class NewChatAction extends viewPane_1.ViewAction {
            constructor() {
                super(getNewChatActionDescriptorForViewTitle(viewId, providerId));
            }
            async runInView(accessor, view) {
                announceChatCleared(accessor);
                await view.clear();
                view.widget.focusInput();
            }
        };
    }
    exports.getNewChatAction = getNewChatAction;
    function announceChatCleared(accessor) {
        accessor.get(audioCueService_1.IAudioCueService).playAudioCue(audioCueService_1.AudioCue.clear);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENsZWFyQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2FjdGlvbnMvY2hhdENsZWFyQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQm5GLFFBQUEsa0JBQWtCLEdBQUcsK0JBQStCLENBQUM7SUFFbEUsU0FBZ0Isc0JBQXNCO1FBRXJDLElBQUEseUJBQWUsRUFBQyxNQUFNLG1CQUFvQixTQUFRLGlCQUFPO1lBQ3hEO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUscUNBQXFDO29CQUN6QyxLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDO29CQUNsRCxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxJQUFJO29CQUNsQixFQUFFLEVBQUUsS0FBSztvQkFDVCxZQUFZLEVBQUUseUNBQXVCO29CQUNyQyxJQUFJLEVBQUUsQ0FBQzs0QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXOzRCQUN0QixLQUFLLEVBQUUsWUFBWTs0QkFDbkIsS0FBSyxFQUFFLENBQUM7NEJBQ1IsSUFBSSxFQUFFLGlDQUFtQixDQUFDLFNBQVMsQ0FBQyxpQ0FBZSxDQUFDLFFBQVEsQ0FBQzt5QkFDN0QsQ0FBQztpQkFDRixDQUFDLENBQUM7WUFDSixDQUFDO1lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDbkQsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlCLE1BQU0sSUFBQSwyQkFBZSxFQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLENBQUM7U0FDRCxDQUFDLENBQUM7UUFHSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxxQkFBc0IsU0FBUSxpQkFBTztZQUMxRDtnQkFDQyxLQUFLLENB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
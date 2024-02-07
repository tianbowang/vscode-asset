/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatViewModel"], function (require, exports, nls_1, actions_1, clipboardService_1, chatActions_1, chat_1, chatContextKeys_1, chatViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatCopyActions = void 0;
    function registerChatCopyActions() {
        (0, actions_1.registerAction2)(class CopyAllAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.copyAll',
                    title: {
                        value: (0, nls_1.localize)('interactive.copyAll.label', "Copy All"),
                        original: 'Copy All'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    menu: {
                        id: actions_1.MenuId.ChatContext,
                        when: chatContextKeys_1.CONTEXT_RESPONSE_FILTERED.toNegated(),
                        group: 'copy',
                    }
                });
            }
            run(accessor, ...args) {
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
                const widget = chatWidgetService.lastFocusedWidget;
                if (widget) {
                    const viewModel = widget.viewModel;
                    const sessionAsText = viewModel?.getItems()
                        .filter((item) => (0, chatViewModel_1.isRequestVM)(item) || ((0, chatViewModel_1.isResponseVM)(item) && !item.errorDetails?.responseIsFiltered))
                        .map(item => stringifyItem(item))
                        .join('\n\n');
                    if (sessionAsText) {
                        clipboardService.writeText(sessionAsText);
                    }
                }
            }
        });
        (0, actions_1.registerAction2)(class CopyItemAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.copyItem',
                    title: {
                        value: (0, nls_1.localize)('interactive.copyItem.label', "Copy"),
                        original: 'Copy'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    menu: {
                        id: actions_1.MenuId.ChatContext,
                        when: chatContextKeys_1.CONTEXT_RESPONSE_FILTERED.toNegated(),
                        group: 'copy',
                    }
                });
            }
            run(accessor, ...args) {
                const item = args[0];
                if (!(0, chatViewModel_1.isRequestVM)(item) && !(0, chatViewModel_1.isResponseVM)(item)) {
                    return;
                }
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const text = stringifyItem(item, false);
                clipboardService.writeText(text);
            }
        });
    }
    exports.registerChatCopyActions = registerChatCopyActions;
    function stringifyItem(item, includeName = true) {
        if ((0, chatViewModel_1.isRequestVM)(item)) {
            return (includeName ? `${item.username}: ` : '') + item.messageText;
        }
        else {
            return (includeName ? `${item.username}: ` : '') + item.response.asString();
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdENvcHlBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvYWN0aW9ucy9jaGF0Q29weUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLFNBQWdCLHVCQUF1QjtRQUN0QyxJQUFBLHlCQUFlLEVBQUMsTUFBTSxhQUFjLFNBQVEsaUJBQU87WUFDbEQ7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSwrQkFBK0I7b0JBQ25DLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsVUFBVSxDQUFDO3dCQUN4RCxRQUFRLEVBQUUsVUFBVTtxQkFDcEI7b0JBQ0QsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsUUFBUSxFQUFFLDJCQUFhO29CQUN2QixJQUFJLEVBQUU7d0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsV0FBVzt3QkFDdEIsSUFBSSxFQUFFLDJDQUF5QixDQUFDLFNBQVMsRUFBRTt3QkFDM0MsS0FBSyxFQUFFLE1BQU07cUJBQ2I7aUJBQ0QsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDN0MsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7Z0JBQ3pELE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDbkQsSUFBSSxNQUFNLEVBQUUsQ0FBQztvQkFDWixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO29CQUNuQyxNQUFNLGFBQWEsR0FBRyxTQUFTLEVBQUUsUUFBUSxFQUFFO3lCQUN6QyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQTRELEVBQUUsQ0FBQyxJQUFBLDJCQUFXLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFBLDRCQUFZLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGtCQUFrQixDQUFDLENBQUM7eUJBQy9KLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNmLElBQUksYUFBYSxFQUFFLENBQUM7d0JBQ25CLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDM0MsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztTQUNELENBQUMsQ0FBQztRQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLGNBQWUsU0FBUSxpQkFBTztZQUNuRDtnQkFDQyxLQUFLLENBQUM7b0JBQ0wsRUFBRSxFQUFFLGdDQUFnQztvQkFDcEMsS0FBSyxFQUFFO3dCQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSxNQUFNLENBQUM7d0JBQ3JELFFBQVEsRUFBRSxNQUFNO3FCQUNoQjtvQkFDRCxFQUFFLEVBQUUsS0FBSztvQkFDVCxRQUFRLEVBQUUsMkJBQWE7b0JBQ3ZCLElBQUksRUFBRTt3QkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXO3dCQUN0QixJQUFJLEVBQUUsMkNBQXlCLENBQUMsU0FBUyxFQUFFO3dCQUMzQyxLQUFLLEVBQUUsTUFBTTtxQkFDYjtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO2dCQUM3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxJQUFBLDJCQUFXLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFBLDRCQUFZLEVBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDL0MsT0FBTztnQkFDUixDQUFDO2dCQUVELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBaUIsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN4QyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFqRUQsMERBaUVDO0lBRUQsU0FBUyxhQUFhLENBQUMsSUFBb0QsRUFBRSxXQUFXLEdBQUcsSUFBSTtRQUM5RixJQUFJLElBQUEsMkJBQVcsRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3JFLENBQUM7YUFBTSxDQUFDO1lBQ1AsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0UsQ0FBQztJQUNGLENBQUMifQ==
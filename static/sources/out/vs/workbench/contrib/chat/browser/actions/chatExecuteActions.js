/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, codicons_1, nls_1, actions_1, chatActions_1, chat_1, chatContextKeys_1, chatService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatExecuteActions = exports.SubmitAction = void 0;
    class SubmitAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.chat.submit'; }
        constructor() {
            super({
                id: SubmitAction.ID,
                title: {
                    value: (0, nls_1.localize)('interactive.submit.label', "Submit"),
                    original: 'Submit'
                },
                f1: false,
                category: chatActions_1.CHAT_CATEGORY,
                icon: codicons_1.Codicon.send,
                precondition: chatContextKeys_1.CONTEXT_CHAT_INPUT_HAS_TEXT,
                menu: {
                    id: actions_1.MenuId.ChatExecute,
                    when: chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate(),
                    group: 'navigation',
                },
            });
        }
        run(accessor, ...args) {
            const context = args[0];
            const widgetService = accessor.get(chat_1.IChatWidgetService);
            const widget = context?.widget ?? widgetService.lastFocusedWidget;
            widget?.acceptInput(context?.inputValue);
        }
    }
    exports.SubmitAction = SubmitAction;
    function registerChatExecuteActions() {
        (0, actions_1.registerAction2)(SubmitAction);
        (0, actions_1.registerAction2)(class CancelAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.cancel',
                    title: {
                        value: (0, nls_1.localize)('interactive.cancel.label', "Cancel"),
                        original: 'Cancel'
                    },
                    f1: false,
                    category: chatActions_1.CHAT_CATEGORY,
                    icon: codicons_1.Codicon.debugStop,
                    menu: {
                        id: actions_1.MenuId.ChatExecute,
                        when: chatContextKeys_1.CONTEXT_CHAT_REQUEST_IN_PROGRESS,
                        group: 'navigation',
                    }
                });
            }
            run(accessor, ...args) {
                const context = args[0];
                if (!context.widget) {
                    return;
                }
                const chatService = accessor.get(chatService_1.IChatService);
                if (context.widget.viewModel) {
                    chatService.cancelCurrentRequestForSession(context.widget.viewModel.sessionId);
                }
            }
        });
    }
    exports.registerChatExecuteActions = registerChatExecuteActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEV4ZWN1dGVBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvYWN0aW9ucy9jaGF0RXhlY3V0ZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFhLFlBQWEsU0FBUSxpQkFBTztpQkFDeEIsT0FBRSxHQUFHLDhCQUE4QixDQUFDO1FBRXBEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxZQUFZLENBQUMsRUFBRTtnQkFDbkIsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSxRQUFRLENBQUM7b0JBQ3JELFFBQVEsRUFBRSxRQUFRO2lCQUNsQjtnQkFDRCxFQUFFLEVBQUUsS0FBSztnQkFDVCxRQUFRLEVBQUUsMkJBQWE7Z0JBQ3ZCLElBQUksRUFBRSxrQkFBTyxDQUFDLElBQUk7Z0JBQ2xCLFlBQVksRUFBRSw2Q0FBMkI7Z0JBQ3pDLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXO29CQUN0QixJQUFJLEVBQUUsa0RBQWdDLENBQUMsTUFBTSxFQUFFO29CQUMvQyxLQUFLLEVBQUUsWUFBWTtpQkFDbkI7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO1lBQzdDLE1BQU0sT0FBTyxHQUEwQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0QsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBa0IsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sTUFBTSxHQUFHLE9BQU8sRUFBRSxNQUFNLElBQUksYUFBYSxDQUFDLGlCQUFpQixDQUFDO1lBQ2xFLE1BQU0sRUFBRSxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLENBQUM7O0lBNUJGLG9DQTZCQztJQUVELFNBQWdCLDBCQUEwQjtRQUN6QyxJQUFBLHlCQUFlLEVBQUMsWUFBWSxDQUFDLENBQUM7UUFDOUIsSUFBQSx5QkFBZSxFQUFDLE1BQU0sWUFBYSxTQUFRLGlCQUFPO1lBQ2pEO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUsOEJBQThCO29CQUNsQyxLQUFLLEVBQUU7d0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQzt3QkFDckQsUUFBUSxFQUFFLFFBQVE7cUJBQ2xCO29CQUNELEVBQUUsRUFBRSxLQUFLO29CQUNULFFBQVEsRUFBRSwyQkFBYTtvQkFDdkIsSUFBSSxFQUFFLGtCQUFPLENBQUMsU0FBUztvQkFDdkIsSUFBSSxFQUFFO3dCQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFdBQVc7d0JBQ3RCLElBQUksRUFBRSxrREFBZ0M7d0JBQ3RDLEtBQUssRUFBRSxZQUFZO3FCQUNuQjtpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO2dCQUM3QyxNQUFNLE9BQU8sR0FBOEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNyQixPQUFPO2dCQUNSLENBQUM7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBWSxDQUFDLENBQUM7Z0JBQy9DLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDOUIsV0FBVyxDQUFDLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNoRixDQUFDO1lBQ0YsQ0FBQztTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFqQ0QsZ0VBaUNDIn0=
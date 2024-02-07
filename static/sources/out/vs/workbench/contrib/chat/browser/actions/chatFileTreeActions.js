/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/contrib/chat/browser/actions/chatActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatViewModel"], function (require, exports, nls_1, actions_1, chatActions_1, chat_1, chatContextKeys_1, chatViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerChatFileTreeActions = void 0;
    function registerChatFileTreeActions() {
        (0, actions_1.registerAction2)(class NextFileTreeAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.nextFileTree',
                    title: {
                        value: (0, nls_1.localize)('interactive.nextFileTree.label', "Next File Tree"),
                        original: 'Next File Tree'
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                });
            }
            run(accessor, ...args) {
                navigateTrees(accessor, false);
            }
        });
        (0, actions_1.registerAction2)(class PreviousFileTreeAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.chat.previousFileTree',
                    title: {
                        value: (0, nls_1.localize)('interactive.previousFileTree.label', "Previous File Tree"),
                        original: 'Previous File Tree'
                    },
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: chatContextKeys_1.CONTEXT_IN_CHAT_SESSION,
                    },
                    precondition: chatContextKeys_1.CONTEXT_PROVIDER_EXISTS,
                    f1: true,
                    category: chatActions_1.CHAT_CATEGORY,
                });
            }
            run(accessor, ...args) {
                navigateTrees(accessor, true);
            }
        });
    }
    exports.registerChatFileTreeActions = registerChatFileTreeActions;
    function navigateTrees(accessor, reverse) {
        const chatWidgetService = accessor.get(chat_1.IChatWidgetService);
        const widget = chatWidgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
        const focusedResponse = (0, chatViewModel_1.isResponseVM)(focused) ? focused : undefined;
        const currentResponse = focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => (0, chatViewModel_1.isResponseVM)(item));
        if (!currentResponse) {
            return;
        }
        widget.reveal(currentResponse);
        const responseFileTrees = widget.getFileTreeInfosForResponse(currentResponse);
        const lastFocusedFileTree = widget.getLastFocusedFileTreeForResponse(currentResponse);
        const focusIdx = lastFocusedFileTree ?
            (lastFocusedFileTree.treeIndex + (reverse ? -1 : 1) + responseFileTrees.length) % responseFileTrees.length :
            reverse ? responseFileTrees.length - 1 : 0;
        responseFileTrees[focusIdx]?.focus();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEZpbGVUcmVlQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2FjdGlvbnMvY2hhdEZpbGVUcmVlQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsU0FBZ0IsMkJBQTJCO1FBQzFDLElBQUEseUJBQWUsRUFBQyxNQUFNLGtCQUFtQixTQUFRLGlCQUFPO1lBQ3ZEO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUsb0NBQW9DO29CQUN4QyxLQUFLLEVBQUU7d0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGdDQUFnQyxFQUFFLGdCQUFnQixDQUFDO3dCQUNuRSxRQUFRLEVBQUUsZ0JBQWdCO3FCQUMxQjtvQkFDRCxVQUFVLEVBQUU7d0JBQ1gsT0FBTyxFQUFFLCtDQUEyQjt3QkFDcEMsTUFBTSw2Q0FBbUM7d0JBQ3pDLElBQUksRUFBRSx5Q0FBdUI7cUJBQzdCO29CQUNELFlBQVksRUFBRSx5Q0FBdUI7b0JBQ3JDLEVBQUUsRUFBRSxJQUFJO29CQUNSLFFBQVEsRUFBRSwyQkFBYTtpQkFDdkIsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztnQkFDN0MsYUFBYSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoQyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO1FBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0sc0JBQXVCLFNBQVEsaUJBQU87WUFDM0Q7Z0JBQ0MsS0FBSyxDQUFDO29CQUNMLEVBQUUsRUFBRSx3Q0FBd0M7b0JBQzVDLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0NBQW9DLEVBQUUsb0JBQW9CLENBQUM7d0JBQzNFLFFBQVEsRUFBRSxvQkFBb0I7cUJBQzlCO29CQUNELFVBQVUsRUFBRTt3QkFDWCxPQUFPLEVBQUUsbURBQTZCLHNCQUFhO3dCQUNuRCxNQUFNLDZDQUFtQzt3QkFDekMsSUFBSSxFQUFFLHlDQUF1QjtxQkFDN0I7b0JBQ0QsWUFBWSxFQUFFLHlDQUF1QjtvQkFDckMsRUFBRSxFQUFFLElBQUk7b0JBQ1IsUUFBUSxFQUFFLDJCQUFhO2lCQUN2QixDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO2dCQUM3QyxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9CLENBQUM7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBaERELGtFQWdEQztJQUVELFNBQVMsYUFBYSxDQUFDLFFBQTBCLEVBQUUsT0FBZ0I7UUFDbEUsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHlCQUFrQixDQUFDLENBQUM7UUFDM0QsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsaUJBQWlCLENBQUM7UUFDbkQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2IsT0FBTztRQUNSLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFFLE1BQU0sZUFBZSxHQUFHLElBQUEsNEJBQVksRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFcEUsTUFBTSxlQUFlLEdBQUcsZUFBZSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFrQyxFQUFFLENBQUMsSUFBQSw0QkFBWSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckosSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3RCLE9BQU87UUFDUixDQUFDO1FBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMvQixNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5RSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxpQ0FBaUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN0RixNQUFNLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsbUJBQW1CLENBQUMsU0FBUyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDdEMsQ0FBQyJ9
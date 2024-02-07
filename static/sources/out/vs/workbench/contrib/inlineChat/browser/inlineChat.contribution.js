/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/platform/actions/common/actions", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/browser/inlineChatActions", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/inlineChat/common/inlineChatServiceImpl", "vs/platform/registry/common/platform", "vs/workbench/contrib/inlineChat/browser/inlineChatNotebook", "vs/workbench/common/contributions", "vs/workbench/contrib/inlineChat/browser/inlineChatSavingServiceImpl", "vs/workbench/contrib/inlineChat/browser/inlineChatAccessibleView", "vs/workbench/contrib/inlineChat/browser/inlineChatSavingService", "vs/workbench/contrib/inlineChat/browser/inlineChatSessionService", "vs/workbench/contrib/inlineChat/browser/inlineChatSessionServiceImpl"], function (require, exports, editorExtensions_1, actions_1, inlineChatController_1, InlineChatActions, inlineChat_1, extensions_1, inlineChatServiceImpl_1, platform_1, inlineChatNotebook_1, contributions_1, inlineChatSavingServiceImpl_1, inlineChatAccessibleView_1, inlineChatSavingService_1, inlineChatSessionService_1, inlineChatSessionServiceImpl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- browser
    (0, extensions_1.registerSingleton)(inlineChat_1.IInlineChatService, inlineChatServiceImpl_1.InlineChatServiceImpl, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(inlineChatSessionService_1.IInlineChatSessionService, inlineChatSessionServiceImpl_1.InlineChatSessionServiceImpl, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(inlineChatSavingService_1.IInlineChatSavingService, inlineChatSavingServiceImpl_1.InlineChatSavingServiceImpl, 1 /* InstantiationType.Delayed */);
    (0, editorExtensions_1.registerEditorContribution)(inlineChat_1.INLINE_CHAT_ID, inlineChatController_1.InlineChatController, 0 /* EditorContributionInstantiation.Eager */); // EAGER because of notebook dispose/create of editors
    (0, editorExtensions_1.registerEditorContribution)(inlineChat_1.INTERACTIVE_EDITOR_ACCESSIBILITY_HELP_ID, InlineChatActions.InlineAccessibilityHelpContribution, 3 /* EditorContributionInstantiation.Eventually */);
    (0, actions_1.registerAction2)(InlineChatActions.CloseAction);
    (0, actions_1.registerAction2)(InlineChatActions.ConfigureInlineChatAction);
    (0, actions_1.registerAction2)(InlineChatActions.UnstashSessionAction);
    (0, actions_1.registerAction2)(InlineChatActions.MakeRequestAction);
    (0, actions_1.registerAction2)(InlineChatActions.StopRequestAction);
    (0, actions_1.registerAction2)(InlineChatActions.ReRunRequestAction);
    (0, actions_1.registerAction2)(InlineChatActions.DiscardHunkAction);
    (0, actions_1.registerAction2)(InlineChatActions.DiscardAction);
    (0, actions_1.registerAction2)(InlineChatActions.DiscardToClipboardAction);
    (0, actions_1.registerAction2)(InlineChatActions.DiscardUndoToNewFileAction);
    (0, actions_1.registerAction2)(InlineChatActions.CancelSessionAction);
    (0, actions_1.registerAction2)(InlineChatActions.ArrowOutUpAction);
    (0, actions_1.registerAction2)(InlineChatActions.ArrowOutDownAction);
    (0, actions_1.registerAction2)(InlineChatActions.FocusInlineChat);
    (0, actions_1.registerAction2)(InlineChatActions.PreviousFromHistory);
    (0, actions_1.registerAction2)(InlineChatActions.NextFromHistory);
    (0, actions_1.registerAction2)(InlineChatActions.ViewInChatAction);
    (0, actions_1.registerAction2)(InlineChatActions.ExpandMessageAction);
    (0, actions_1.registerAction2)(InlineChatActions.ContractMessageAction);
    (0, actions_1.registerAction2)(InlineChatActions.ToggleDiffForChange);
    (0, actions_1.registerAction2)(InlineChatActions.FeebackHelpfulCommand);
    (0, actions_1.registerAction2)(InlineChatActions.FeebackUnhelpfulCommand);
    (0, actions_1.registerAction2)(InlineChatActions.ReportIssueForBugCommand);
    (0, actions_1.registerAction2)(InlineChatActions.AcceptChanges);
    (0, actions_1.registerAction2)(InlineChatActions.CopyRecordings);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(inlineChatNotebook_1.InlineChatNotebookContribution, 3 /* LifecyclePhase.Restored */);
    workbenchContributionsRegistry.registerWorkbenchContribution(inlineChatAccessibleView_1.InlineChatAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGluZUNoYXQvYnJvd3Nlci9pbmxpbmVDaGF0LmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQW9CaEcsY0FBYztJQUVkLElBQUEsOEJBQWlCLEVBQUMsK0JBQWtCLEVBQUUsNkNBQXFCLG9DQUE0QixDQUFDO0lBQ3hGLElBQUEsOEJBQWlCLEVBQUMsb0RBQXlCLEVBQUUsMkRBQTRCLG9DQUE0QixDQUFDO0lBQ3RHLElBQUEsOEJBQWlCLEVBQUMsa0RBQXdCLEVBQUUseURBQTJCLG9DQUE0QixDQUFDO0lBRXBHLElBQUEsNkNBQTBCLEVBQUMsMkJBQWMsRUFBRSwyQ0FBb0IsZ0RBQXdDLENBQUMsQ0FBQyxzREFBc0Q7SUFDL0osSUFBQSw2Q0FBMEIsRUFBQyxxREFBd0MsRUFBRSxpQkFBaUIsQ0FBQyxtQ0FBbUMscURBQTZDLENBQUM7SUFFeEssSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9DLElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQzdELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3hELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3RELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNqRCxJQUFBLHlCQUFlLEVBQUMsaUJBQWlCLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUM1RCxJQUFBLHlCQUFlLEVBQUMsaUJBQWlCLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUM5RCxJQUFBLHlCQUFlLEVBQUMsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUV2RCxJQUFBLHlCQUFlLEVBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNwRCxJQUFBLHlCQUFlLEVBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN0RCxJQUFBLHlCQUFlLEVBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDbkQsSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDdkQsSUFBQSx5QkFBZSxFQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ25ELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3ZELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBRXpELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3ZELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3pELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzNELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQzVELElBQUEseUJBQWUsRUFBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVqRCxJQUFBLHlCQUFlLEVBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFbEQsTUFBTSw4QkFBOEIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkgsOEJBQThCLENBQUMsNkJBQTZCLENBQUMsbURBQThCLGtDQUEwQixDQUFDO0lBQ3RILDhCQUE4QixDQUFDLDZCQUE2QixDQUFDLCtEQUFvQyxvQ0FBNEIsQ0FBQyJ9
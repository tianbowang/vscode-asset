/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughActions", "vs/workbench/contrib/welcomeWalkthrough/common/walkThroughContentProvider", "vs/workbench/contrib/welcomeWalkthrough/browser/editor/editorWalkThrough", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/platform/instantiation/common/descriptors", "vs/platform/actions/common/actions", "vs/workbench/common/contributions", "vs/workbench/browser/editor", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, nls_1, walkThroughInput_1, walkThroughPart_1, walkThroughActions_1, walkThroughContentProvider_1, editorWalkThrough_1, platform_1, editor_1, descriptors_1, actions_1, contributions_1, editor_2, keybindingsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(editor_1.EditorExtensions.EditorPane)
        .registerEditorPane(editor_2.EditorPaneDescriptor.create(walkThroughPart_1.WalkThroughPart, walkThroughPart_1.WalkThroughPart.ID, (0, nls_1.localize)('walkThrough.editor.label', "Playground")), [new descriptors_1.SyncDescriptor(walkThroughInput_1.WalkThroughInput)]);
    (0, actions_1.registerAction2)(editorWalkThrough_1.EditorWalkThroughAction);
    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer(editorWalkThrough_1.EditorWalkThroughInputSerializer.ID, editorWalkThrough_1.EditorWalkThroughInputSerializer);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(walkThroughContentProvider_1.WalkThroughSnippetContentProvider, 2 /* LifecyclePhase.Ready */);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(walkThroughActions_1.WalkThroughArrowUp);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(walkThroughActions_1.WalkThroughArrowDown);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(walkThroughActions_1.WalkThroughPageUp);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(walkThroughActions_1.WalkThroughPageDown);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
        group: '1_welcome',
        command: {
            id: 'workbench.action.showInteractivePlayground',
            title: (0, nls_1.localize)({ key: 'miPlayground', comment: ['&& denotes a mnemonic'] }, "Editor Playgrou&&nd")
        },
        order: 3
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Fsa1Rocm91Z2guY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lV2Fsa3Rocm91Z2gvYnJvd3Nlci93YWxrVGhyb3VnaC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFpQmhHLG1CQUFRLENBQUMsRUFBRSxDQUFzQix5QkFBZ0IsQ0FBQyxVQUFVLENBQUM7U0FDM0Qsa0JBQWtCLENBQUMsNkJBQW9CLENBQUMsTUFBTSxDQUM5QyxpQ0FBZSxFQUNmLGlDQUFlLENBQUMsRUFBRSxFQUNsQixJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSxZQUFZLENBQUMsQ0FDbEQsRUFDQSxDQUFDLElBQUksNEJBQWMsQ0FBQyxtQ0FBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUxQyxJQUFBLHlCQUFlLEVBQUMsMkNBQXVCLENBQUMsQ0FBQztJQUV6QyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIseUJBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsd0JBQXdCLENBQUMsb0RBQWdDLENBQUMsRUFBRSxFQUFFLG9EQUFnQyxDQUFDLENBQUM7SUFFcEssbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQztTQUN6RSw2QkFBNkIsQ0FBQyw4REFBaUMsK0JBQXFHLENBQUM7SUFFdksseUNBQW1CLENBQUMsZ0NBQWdDLENBQUMsdUNBQWtCLENBQUMsQ0FBQztJQUV6RSx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQyx5Q0FBb0IsQ0FBQyxDQUFDO0lBRTNFLHlDQUFtQixDQUFDLGdDQUFnQyxDQUFDLHNDQUFpQixDQUFDLENBQUM7SUFFeEUseUNBQW1CLENBQUMsZ0NBQWdDLENBQUMsd0NBQW1CLENBQUMsQ0FBQztJQUUxRSxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGVBQWUsRUFBRTtRQUNuRCxLQUFLLEVBQUUsV0FBVztRQUNsQixPQUFPLEVBQUU7WUFDUixFQUFFLEVBQUUsNENBQTRDO1lBQ2hELEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDO1NBQ25HO1FBQ0QsS0FBSyxFQUFFLENBQUM7S0FDUixDQUFDLENBQUMifQ==
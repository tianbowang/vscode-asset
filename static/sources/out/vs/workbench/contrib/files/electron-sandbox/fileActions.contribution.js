/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/base/common/network", "vs/platform/native/common/native", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/common/editorContextKeys", "vs/base/common/keyCodes", "vs/workbench/contrib/files/browser/files", "vs/platform/list/browser/listService", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/files/electron-sandbox/fileCommands", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/workbench/contrib/files/browser/fileActions.contribution", "vs/workbench/common/editor", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, workspace_1, platform_1, network_1, native_1, keybindingsRegistry_1, editorContextKeys_1, keyCodes_1, files_1, listService_1, editorService_1, fileCommands_1, actions_1, contextkeys_1, fileActions_contribution_1, editor_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const REVEAL_IN_OS_COMMAND_ID = 'revealFileInOS';
    const REVEAL_IN_OS_LABEL = platform_1.isWindows ? nls.localize('revealInWindows', "Reveal in File Explorer") : platform_1.isMacintosh ? nls.localize('revealInMac', "Reveal in Finder") : nls.localize('openContainer', "Open Containing Folder");
    const REVEAL_IN_OS_WHEN_CONTEXT = contextkey_1.ContextKeyExpr.or(contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file), contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeUserData));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: REVEAL_IN_OS_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus.toNegated(),
        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
        win: {
            primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */
        },
        handler: (accessor, resource) => {
            const resources = (0, files_1.getMultiSelectedResources)(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IEditorService), accessor.get(files_1.IExplorerService));
            (0, fileCommands_1.revealResourcesInOS)(resources, accessor.get(native_1.INativeHostService), accessor.get(workspace_1.IWorkspaceContextService));
        }
    });
    const REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID = 'workbench.action.files.revealActiveFileInWindows';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 48 /* KeyCode.KeyR */),
        id: REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID,
        handler: (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeInput = editorService.activeEditor;
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(activeInput, { filterByScheme: network_1.Schemas.file, supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const resources = resource ? [resource] : [];
            (0, fileCommands_1.revealResourcesInOS)(resources, accessor.get(native_1.INativeHostService), accessor.get(workspace_1.IWorkspaceContextService));
        }
    });
    (0, fileActions_contribution_1.appendEditorTitleContextMenuItem)(REVEAL_IN_OS_COMMAND_ID, REVEAL_IN_OS_LABEL, REVEAL_IN_OS_WHEN_CONTEXT, '2_files', 0);
    // Menu registration - open editors
    const revealInOsCommand = {
        id: REVEAL_IN_OS_COMMAND_ID,
        title: REVEAL_IN_OS_LABEL
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: REVEAL_IN_OS_WHEN_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContextShare, {
        title: nls.localize('miShare', "Share"),
        submenu: actions_1.MenuId.MenubarShare,
        group: 'share',
        order: 3,
    });
    // Menu registration - explorer
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: REVEAL_IN_OS_WHEN_CONTEXT
    });
    // Command Palette
    const category = { value: nls.localize('filesCategory', "File"), original: 'File' };
    (0, fileActions_contribution_1.appendToCommandPalette)({
        id: REVEAL_IN_OS_COMMAND_ID,
        title: { value: REVEAL_IN_OS_LABEL, original: platform_1.isWindows ? 'Reveal in File Explorer' : platform_1.isMacintosh ? 'Reveal in Finder' : 'Open Containing Folder' },
        category: category
    }, REVEAL_IN_OS_WHEN_CONTEXT);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUFjdGlvbnMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9lbGVjdHJvbi1zYW5kYm94L2ZpbGVBY3Rpb25zLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXNCaEcsTUFBTSx1QkFBdUIsR0FBRyxnQkFBZ0IsQ0FBQztJQUNqRCxNQUFNLGtCQUFrQixHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztJQUM1TixNQUFNLHlCQUF5QixHQUFHLDJCQUFjLENBQUMsRUFBRSxDQUFDLGdDQUFrQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUJBQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxnQ0FBa0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUVwSyx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNwRCxFQUFFLEVBQUUsdUJBQXVCO1FBQzNCLE1BQU0sNkNBQW1DO1FBQ3pDLElBQUksRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO1FBQ3pDLE9BQU8sRUFBRSxnREFBMkIsd0JBQWU7UUFDbkQsR0FBRyxFQUFFO1lBQ0osT0FBTyxFQUFFLDhDQUF5Qix3QkFBZTtTQUNqRDtRQUNELE9BQU8sRUFBRSxDQUFDLFFBQTBCLEVBQUUsUUFBc0IsRUFB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
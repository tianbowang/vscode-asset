/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls", "vs/workbench/browser/editor", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/workbench/browser/parts/editor/binaryDiffEditor", "vs/workbench/browser/parts/editor/editorStatus", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/editor/editorActions", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/quickaccess", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/workbench/browser/codeeditor", "vs/workbench/common/contributions", "vs/workbench/browser/parts/editor/editorAutoSave", "vs/platform/quickinput/common/quickAccess", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/base/common/network", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/services/untitled/common/untitledTextEditorHandler", "vs/workbench/browser/parts/editor/editorConfiguration", "vs/workbench/browser/actions/layoutActions", "vs/editor/common/editorContextKeys"], function (require, exports, platform_1, nls_1, editor_1, editor_2, contextkeys_1, sideBySideEditorInput_1, textResourceEditor_1, sideBySideEditor_1, diffEditorInput_1, untitledTextEditorInput_1, textResourceEditorInput_1, textDiffEditor_1, binaryDiffEditor_1, editorStatus_1, actionCommonCategories_1, actions_1, descriptors_1, editorActions_1, editorCommands_1, quickaccess_1, keybindingsRegistry_1, contextkey_1, platform_2, editorExtensions_1, codeeditor_1, contributions_1, editorAutoSave_1, quickAccess_1, editorQuickAccess_1, network_1, codicons_1, iconRegistry_1, untitledTextEditorHandler_1, editorConfiguration_1, layoutActions_1, editorContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Editor Registrations
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(textResourceEditor_1.TextResourceEditor, textResourceEditor_1.TextResourceEditor.ID, (0, nls_1.localize)('textEditor', "Text Editor")), [
        new descriptors_1.SyncDescriptor(untitledTextEditorInput_1.UntitledTextEditorInput),
        new descriptors_1.SyncDescriptor(textResourceEditorInput_1.TextResourceEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(textDiffEditor_1.TextDiffEditor, textDiffEditor_1.TextDiffEditor.ID, (0, nls_1.localize)('textDiffEditor', "Text Diff Editor")), [
        new descriptors_1.SyncDescriptor(diffEditorInput_1.DiffEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(binaryDiffEditor_1.BinaryResourceDiffEditor, binaryDiffEditor_1.BinaryResourceDiffEditor.ID, (0, nls_1.localize)('binaryDiffEditor', "Binary Diff Editor")), [
        new descriptors_1.SyncDescriptor(diffEditorInput_1.DiffEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(sideBySideEditor_1.SideBySideEditor, sideBySideEditor_1.SideBySideEditor.ID, (0, nls_1.localize)('sideBySideEditor', "Side by Side Editor")), [
        new descriptors_1.SyncDescriptor(sideBySideEditorInput_1.SideBySideEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(untitledTextEditorInput_1.UntitledTextEditorInput.ID, untitledTextEditorHandler_1.UntitledTextEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(sideBySideEditorInput_1.SideBySideEditorInput.ID, sideBySideEditorInput_1.SideBySideEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(diffEditorInput_1.DiffEditorInput.ID, diffEditorInput_1.DiffEditorInputSerializer);
    //#endregion
    //#region Workbench Contributions
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorAutoSave_1.EditorAutoSave, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorStatus_1.EditorStatusContribution, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(untitledTextEditorHandler_1.UntitledTextEditorWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorConfiguration_1.DynamicEditorConfigurations, 2 /* LifecyclePhase.Ready */);
    (0, editorExtensions_1.registerEditorContribution)(codeeditor_1.FloatingEditorClickMenu.ID, codeeditor_1.FloatingEditorClickMenu, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    //#endregion
    //#region Quick Access
    const quickAccessRegistry = platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess);
    const editorPickerContextKey = 'inEditorsPicker';
    const editorPickerContext = contextkey_1.ContextKeyExpr.and(quickaccess_1.inQuickPickContext, contextkey_1.ContextKeyExpr.has(editorPickerContextKey));
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess,
        prefix: editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)('editorQuickAccessPlaceholder', "Type the name of an editor to open it."),
        helpEntries: [{ description: (0, nls_1.localize)('activeGroupEditorsByMostRecentlyUsedQuickAccess', "Show Editors in Active Group by Most Recently Used"), commandId: editorActions_1.ShowEditorsInActiveGroupByMostRecentlyUsedAction.ID }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.AllEditorsByAppearanceQuickAccess,
        prefix: editorQuickAccess_1.AllEditorsByAppearanceQuickAccess.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)('editorQuickAccessPlaceholder', "Type the name of an editor to open it."),
        helpEntries: [{ description: (0, nls_1.localize)('allEditorsByAppearanceQuickAccess', "Show All Opened Editors By Appearance"), commandId: editorActions_1.ShowAllEditorsByAppearanceAction.ID }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess,
        prefix: editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)('editorQuickAccessPlaceholder', "Type the name of an editor to open it."),
        helpEntries: [{ description: (0, nls_1.localize)('allEditorsByMostRecentlyUsedQuickAccess', "Show All Opened Editors By Most Recently Used"), commandId: editorActions_1.ShowAllEditorsByMostRecentlyUsedAction.ID }]
    });
    //#endregion
    //#region Actions & Commands
    (0, actions_1.registerAction2)(editorStatus_1.ChangeLanguageAction);
    (0, actions_1.registerAction2)(editorStatus_1.ChangeEOLAction);
    (0, actions_1.registerAction2)(editorStatus_1.ChangeEncodingAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateForwardAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateBackwardsAction);
    (0, actions_1.registerAction2)(editorActions_1.OpenNextEditor);
    (0, actions_1.registerAction2)(editorActions_1.OpenPreviousEditor);
    (0, actions_1.registerAction2)(editorActions_1.OpenNextEditorInGroup);
    (0, actions_1.registerAction2)(editorActions_1.OpenPreviousEditorInGroup);
    (0, actions_1.registerAction2)(editorActions_1.OpenFirstEditorInGroup);
    (0, actions_1.registerAction2)(editorActions_1.OpenLastEditorInGroup);
    (0, actions_1.registerAction2)(editorActions_1.OpenNextRecentlyUsedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.OpenPreviousRecentlyUsedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.OpenNextRecentlyUsedEditorInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.OpenPreviousRecentlyUsedEditorInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.ReopenClosedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.ClearRecentFilesAction);
    (0, actions_1.registerAction2)(editorActions_1.ShowAllEditorsByAppearanceAction);
    (0, actions_1.registerAction2)(editorActions_1.ShowAllEditorsByMostRecentlyUsedAction);
    (0, actions_1.registerAction2)(editorActions_1.ShowEditorsInActiveGroupByMostRecentlyUsedAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseAllEditorsAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseAllEditorGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseLeftEditorsInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseEditorsInOtherGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.CloseEditorInAllGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.RevertAndCloseEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorOrthogonalAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorLeftAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorRightAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorUpAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorDownAction);
    (0, actions_1.registerAction2)(editorActions_1.JoinTwoGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.JoinAllGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateBetweenGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.ResetGroupSizesAction);
    (0, actions_1.registerAction2)(editorActions_1.ToggleGroupSizesAction);
    (0, actions_1.registerAction2)(editorActions_1.MaximizeGroupHideSidebarAction);
    (0, actions_1.registerAction2)(editorActions_1.ToggleMaximizeEditorGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MinimizeOtherGroupsAction);
    (0, actions_1.registerAction2)(editorActions_1.MinimizeOtherGroupsHideSidebarAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorLeftInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorRightInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveGroupLeftAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveGroupRightAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveGroupUpAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveGroupDownAction);
    (0, actions_1.registerAction2)(editorActions_1.DuplicateGroupLeftAction);
    (0, actions_1.registerAction2)(editorActions_1.DuplicateGroupRightAction);
    (0, actions_1.registerAction2)(editorActions_1.DuplicateGroupUpAction);
    (0, actions_1.registerAction2)(editorActions_1.DuplicateGroupDownAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToPreviousGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToNextGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToFirstGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToLastGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToLeftGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToRightGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToAboveGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToBelowGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToPreviousGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToNextGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToFirstGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToLastGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToLeftGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToRightGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToAboveGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.SplitEditorToBelowGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.FocusActiveGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.FocusFirstGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.FocusLastGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.FocusPreviousGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusNextGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusLeftGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusRightGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusAboveGroup);
    (0, actions_1.registerAction2)(editorActions_1.FocusBelowGroup);
    (0, actions_1.registerAction2)(editorActions_1.NewEditorGroupLeftAction);
    (0, actions_1.registerAction2)(editorActions_1.NewEditorGroupRightAction);
    (0, actions_1.registerAction2)(editorActions_1.NewEditorGroupAboveAction);
    (0, actions_1.registerAction2)(editorActions_1.NewEditorGroupBelowAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigatePreviousAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateForwardInEditsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateBackwardsInEditsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigatePreviousInEditsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateToLastEditLocationAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateForwardInNavigationsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateBackwardsInNavigationsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigatePreviousInNavigationsAction);
    (0, actions_1.registerAction2)(editorActions_1.NavigateToLastNavigationLocationAction);
    (0, actions_1.registerAction2)(editorActions_1.ClearEditorHistoryAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutSingleAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoColumnsAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutThreeColumnsAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoRowsAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutThreeRowsAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoByTwoGridAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoRowsRightAction);
    (0, actions_1.registerAction2)(editorActions_1.EditorLayoutTwoColumnsBottomAction);
    (0, actions_1.registerAction2)(editorActions_1.ToggleEditorTypeAction);
    (0, actions_1.registerAction2)(editorActions_1.ReOpenInTextEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessPreviousRecentlyUsedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessLeastRecentlyUsedEditorAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessPreviousRecentlyUsedEditorInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessLeastRecentlyUsedEditorInGroupAction);
    (0, actions_1.registerAction2)(editorActions_1.QuickAccessPreviousEditorFromHistoryAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorToNewWindowAction);
    (0, actions_1.registerAction2)(editorActions_1.CopyEditorToNewindowAction);
    (0, actions_1.registerAction2)(editorActions_1.MoveEditorGroupToNewWindowAction);
    (0, actions_1.registerAction2)(editorActions_1.CopyEditorGroupToNewWindowAction);
    (0, actions_1.registerAction2)(editorActions_1.RestoreEditorsToMainWindowAction);
    (0, actions_1.registerAction2)(editorActions_1.NewEmptyEditorWindowAction);
    const quickAccessNavigateNextInEditorPickerId = 'workbench.action.quickOpenNavigateNextInEditorPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigateNextInEditorPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigateNextInEditorPickerId, true),
        when: editorPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 2 /* KeyCode.Tab */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 2 /* KeyCode.Tab */ }
    });
    const quickAccessNavigatePreviousInEditorPickerId = 'workbench.action.quickOpenNavigatePreviousInEditorPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigatePreviousInEditorPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigatePreviousInEditorPickerId, false),
        when: editorPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */ }
    });
    (0, editorCommands_1.setup)();
    //#endregion
    //#region Menus
    // macOS: Touchbar
    if (platform_2.isMacintosh) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TouchBarContext, {
            command: { id: editorActions_1.NavigateBackwardsAction.ID, title: editorActions_1.NavigateBackwardsAction.LABEL, icon: { dark: network_1.FileAccess.asFileUri('vs/workbench/browser/parts/editor/media/back-tb.png') } },
            group: 'navigation',
            order: 0
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TouchBarContext, {
            command: { id: editorActions_1.NavigateForwardAction.ID, title: editorActions_1.NavigateForwardAction.LABEL, icon: { dark: network_1.FileAccess.asFileUri('vs/workbench/browser/parts/editor/media/forward-tb.png') } },
            group: 'navigation',
            order: 1
        });
    }
    // Empty Editor Group Toolbar
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroup, { command: { id: editorCommands_1.LOCK_GROUP_COMMAND_ID, title: (0, nls_1.localize)('lockGroupAction', "Lock Group"), icon: codicons_1.Codicon.unlock }, group: 'navigation', order: 10, when: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsAuxiliaryEditorPartContext, contextkeys_1.ActiveEditorGroupLockedContext.toNegated()) });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroup, { command: { id: editorCommands_1.UNLOCK_GROUP_COMMAND_ID, title: (0, nls_1.localize)('unlockGroupAction', "Unlock Group"), icon: codicons_1.Codicon.lock, toggled: contextkey_1.ContextKeyExpr.true() }, group: 'navigation', order: 10, when: contextkeys_1.ActiveEditorGroupLockedContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroup, { command: { id: editorCommands_1.CLOSE_EDITOR_GROUP_COMMAND_ID, title: (0, nls_1.localize)('closeGroupAction', "Close Group"), icon: codicons_1.Codicon.close }, group: 'navigation', order: 20, when: contextkey_1.ContextKeyExpr.or(contextkeys_1.IsAuxiliaryEditorPartContext, contextkeys_1.EditorPartMultipleEditorGroupsContext) });
    // Empty Editor Group Context Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_UP, title: (0, nls_1.localize)('splitUp', "Split Up") }, group: '2_split', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_DOWN, title: (0, nls_1.localize)('splitDown', "Split Down") }, group: '2_split', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_LEFT, title: (0, nls_1.localize)('splitLeft', "Split Left") }, group: '2_split', order: 30 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_RIGHT, title: (0, nls_1.localize)('splitRight', "Split Right") }, group: '2_split', order: 40 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID, title: (0, nls_1.localize)('newWindow', "New Window") }, group: '3_window', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.TOGGLE_LOCK_GROUP_COMMAND_ID, title: (0, nls_1.localize)('toggleLockGroup', "Lock Group"), toggled: contextkeys_1.ActiveEditorGroupLockedContext }, group: '4_lock', order: 10, when: contextkeys_1.IsAuxiliaryEditorPartContext.toNegated() /* already a primary action for aux windows */ });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.CLOSE_EDITOR_GROUP_COMMAND_ID, title: (0, nls_1.localize)('close', "Close") }, group: '5_close', order: 10, when: contextkeys_1.MultipleEditorGroupsContext });
    // Editor Tab Container Context Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.SPLIT_EDITOR_UP, title: (0, nls_1.localize)('splitUp', "Split Up") }, group: '2_split', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.SPLIT_EDITOR_DOWN, title: (0, nls_1.localize)('splitDown', "Split Down") }, group: '2_split', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.SPLIT_EDITOR_LEFT, title: (0, nls_1.localize)('splitLeft', "Split Left") }, group: '2_split', order: 30 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.SPLIT_EDITOR_RIGHT, title: (0, nls_1.localize)('splitRight', "Split Right") }, group: '2_split', order: 40 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, title: (0, nls_1.localize)('moveEditorGroupToNewWindow', "Move into New Window") }, group: '3_window', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { command: { id: editorCommands_1.COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID, title: (0, nls_1.localize)('copyEditorGroupToNewWindow', "Copy into New Window") }, group: '3_window', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { submenu: actions_1.MenuId.EditorTabsBarShowTabsSubmenu, title: (0, nls_1.localize)('tabBar', "Tab Bar"), group: '4_config', order: 10, when: contextkeys_1.InEditorZenModeContext.negate() });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarShowTabsSubmenu, { command: { id: layoutActions_1.ShowMultipleEditorTabsAction.ID, title: (0, nls_1.localize)('multipleTabs', "Multiple Tabs"), toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.editor.showTabs', 'multiple') }, group: '1_config', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarShowTabsSubmenu, { command: { id: layoutActions_1.ShowSingleEditorTabAction.ID, title: (0, nls_1.localize)('singleTab', "Single Tab"), toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.editor.showTabs', 'single') }, group: '1_config', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarShowTabsSubmenu, { command: { id: layoutActions_1.HideEditorTabsAction.ID, title: (0, nls_1.localize)('hideTabs', "Hidden"), toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.editor.showTabs', 'none') }, group: '1_config', order: 30 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { submenu: actions_1.MenuId.EditorTabsBarShowTabsZenModeSubmenu, title: (0, nls_1.localize)('tabBar', "Tab Bar"), group: '4_config', order: 10, when: contextkeys_1.InEditorZenModeContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarShowTabsZenModeSubmenu, { command: { id: layoutActions_1.ZenShowMultipleEditorTabsAction.ID, title: (0, nls_1.localize)('multipleTabs', "Multiple Tabs"), toggled: contextkey_1.ContextKeyExpr.equals('config.zenMode.showTabs', 'multiple') }, group: '1_config', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarShowTabsZenModeSubmenu, { command: { id: layoutActions_1.ZenShowSingleEditorTabAction.ID, title: (0, nls_1.localize)('singleTab', "Single Tab"), toggled: contextkey_1.ContextKeyExpr.equals('config.zenMode.showTabs', 'single') }, group: '1_config', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarShowTabsZenModeSubmenu, { command: { id: layoutActions_1.ZenHideEditorTabsAction.ID, title: (0, nls_1.localize)('hideTabs', "Hidden"), toggled: contextkey_1.ContextKeyExpr.equals('config.zenMode.showTabs', 'none') }, group: '1_config', order: 30 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTabsBarContext, { submenu: actions_1.MenuId.EditorActionsPositionSubmenu, title: (0, nls_1.localize)('editorActionsPosition', "Editor Actions Position"), group: '4_config', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorActionsPositionSubmenu, { command: { id: layoutActions_1.EditorActionsDefaultAction.ID, title: (0, nls_1.localize)('tabBar', "Tab Bar"), toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.editor.editorActionsLocation', 'default') }, group: '1_config', order: 10, when: contextkey_1.ContextKeyExpr.equals('config.workbench.editor.showTabs', 'none').negate() });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorActionsPositionSubmenu, { command: { id: layoutActions_1.EditorActionsTitleBarAction.ID, title: (0, nls_1.localize)('titleBar', "Title Bar"), toggled: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.workbench.editor.editorActionsLocation', 'titleBar'), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.editor.showTabs', 'none'), contextkey_1.ContextKeyExpr.equals('config.workbench.editor.editorActionsLocation', 'default'))) }, group: '1_config', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorActionsPositionSubmenu, { command: { id: layoutActions_1.HideEditorActionsAction.ID, title: (0, nls_1.localize)('hidden', "Hidden"), toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.editor.editorActionsLocation', 'hidden') }, group: '1_config', order: 30 });
    // Editor Title Context Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID, title: (0, nls_1.localize)('close', "Close") }, group: '1_close', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize)('closeOthers', "Close Others"), precondition: contextkeys_1.EditorGroupEditorsCountContext.notEqualsTo('1') }, group: '1_close', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: (0, nls_1.localize)('closeRight', "Close to the Right"), precondition: contextkeys_1.ActiveEditorLastInGroupContext.toNegated() }, group: '1_close', order: 30, when: contextkeys_1.EditorTabsVisibleContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID, title: (0, nls_1.localize)('closeAllSaved', "Close Saved") }, group: '1_close', order: 40 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize)('closeAll', "Close All") }, group: '1_close', order: 50 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.REOPEN_WITH_COMMAND_ID, title: (0, nls_1.localize)('reopenWith', "Reopen Editor With...") }, group: '1_open', order: 10, when: contextkeys_1.ActiveEditorAvailableEditorIdsContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.KEEP_EDITOR_COMMAND_ID, title: (0, nls_1.localize)('keepOpen', "Keep Open"), precondition: contextkeys_1.ActiveEditorPinnedContext.toNegated() }, group: '3_preview', order: 10, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.PIN_EDITOR_COMMAND_ID, title: (0, nls_1.localize)('pin', "Pin") }, group: '3_preview', order: 20, when: contextkeys_1.ActiveEditorStickyContext.toNegated() });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID, title: (0, nls_1.localize)('unpin', "Unpin") }, group: '3_preview', order: 20, when: contextkeys_1.ActiveEditorStickyContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_UP, title: (0, nls_1.localize)('splitUp', "Split Up") }, group: '5_split', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_DOWN, title: (0, nls_1.localize)('splitDown', "Split Down") }, group: '5_split', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_LEFT, title: (0, nls_1.localize)('splitLeft', "Split Left") }, group: '5_split', order: 30 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_RIGHT, title: (0, nls_1.localize)('splitRight', "Split Right") }, group: '5_split', order: 40 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_IN_GROUP, title: (0, nls_1.localize)('splitInGroup', "Split in Group") }, group: '6_split_in_group', order: 10, when: contextkeys_1.ActiveEditorCanSplitInGroupContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.JOIN_EDITOR_IN_GROUP, title: (0, nls_1.localize)('joinInGroup', "Join in Group") }, group: '6_split_in_group', order: 10, when: contextkeys_1.SideBySideEditorActiveContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, title: (0, nls_1.localize)('moveToNewWindow', "Move into New Window") }, group: '7_new_window', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, { command: { id: editorCommands_1.COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID, title: (0, nls_1.localize)('copyToNewWindow', "Copy into New Window") }, group: '7_new_window', order: 20 });
    // Editor Title Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_DIFF_SIDE_BY_SIDE, title: (0, nls_1.localize)('inlineView', "Inline View"), toggled: contextkey_1.ContextKeyExpr.equals('config.diffEditor.renderSideBySide', false) }, group: '1_diff', order: 10, when: contextkey_1.ContextKeyExpr.has('isInDiffEditor') });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.SHOW_EDITORS_IN_GROUP, title: (0, nls_1.localize)('showOpenedEditors', "Show Opened Editors") }, group: '3_open', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize)('closeAll', "Close All") }, group: '5_close', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID, title: (0, nls_1.localize)('closeAllSaved', "Close Saved") }, group: '5_close', order: 20 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_KEEP_EDITORS_COMMAND_ID, title: (0, nls_1.localize)('togglePreviewMode', "Enable Preview Editors"), toggled: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') }, group: '7_settings', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_MAXIMIZE_EDITOR_GROUP, title: (0, nls_1.localize)('maximizeGroup', "Maximize Group") }, group: '8_group_operations', order: 5, when: contextkey_1.ContextKeyExpr.and(contextkeys_1.EditorPartMaximizedEditorGroupContext.negate(), contextkeys_1.EditorPartMultipleEditorGroupsContext) });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_MAXIMIZE_EDITOR_GROUP, title: (0, nls_1.localize)('unmaximizeGroup', "Unmaximize Group") }, group: '8_group_operations', order: 5, when: contextkeys_1.EditorPartMaximizedEditorGroupContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_LOCK_GROUP_COMMAND_ID, title: (0, nls_1.localize)('lockGroup', "Lock Group"), toggled: contextkeys_1.ActiveEditorGroupLockedContext }, group: '8_group_operations', order: 10, when: contextkeys_1.IsAuxiliaryEditorPartContext.toNegated() /* already a primary action for aux windows */ });
    function appendEditorToolItem(primary, when, order, alternative, precondition) {
        const item = {
            command: {
                id: primary.id,
                title: primary.title,
                icon: primary.icon,
                toggled: primary.toggled,
                precondition
            },
            group: 'navigation',
            when,
            order
        };
        if (alternative) {
            item.alt = {
                id: alternative.id,
                title: alternative.title,
                icon: alternative.icon
            };
        }
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, item);
    }
    const SPLIT_ORDER = 100000; // towards the end
    const CLOSE_ORDER = 1000000; // towards the far end
    // Editor Title Menu: Split Editor
    appendEditorToolItem({
        id: editorCommands_1.SPLIT_EDITOR,
        title: (0, nls_1.localize)('splitEditorRight', "Split Editor Right"),
        icon: codicons_1.Codicon.splitHorizontal
    }, contextkey_1.ContextKeyExpr.not('splitEditorsVertically'), SPLIT_ORDER, {
        id: editorCommands_1.SPLIT_EDITOR_DOWN,
        title: (0, nls_1.localize)('splitEditorDown', "Split Editor Down"),
        icon: codicons_1.Codicon.splitVertical
    });
    appendEditorToolItem({
        id: editorCommands_1.SPLIT_EDITOR,
        title: (0, nls_1.localize)('splitEditorDown', "Split Editor Down"),
        icon: codicons_1.Codicon.splitVertical
    }, contextkey_1.ContextKeyExpr.has('splitEditorsVertically'), SPLIT_ORDER, {
        id: editorCommands_1.SPLIT_EDITOR_RIGHT,
        title: (0, nls_1.localize)('splitEditorRight', "Split Editor Right"),
        icon: codicons_1.Codicon.splitHorizontal
    });
    // Side by side: layout
    appendEditorToolItem({
        id: editorCommands_1.TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,
        title: (0, nls_1.localize)('toggleSplitEditorInGroupLayout', "Toggle Layout"),
        icon: codicons_1.Codicon.editorLayout
    }, contextkeys_1.SideBySideEditorActiveContext, SPLIT_ORDER - 1);
    // Editor Title Menu: Close (tabs disabled, normal editor)
    appendEditorToolItem({
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('close', "Close"),
        icon: codicons_1.Codicon.close
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.EditorTabsVisibleContext.toNegated(), contextkeys_1.ActiveEditorDirtyContext.toNegated(), contextkeys_1.ActiveEditorStickyContext.toNegated()), CLOSE_ORDER, {
        id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
        title: (0, nls_1.localize)('closeAll', "Close All"),
        icon: codicons_1.Codicon.closeAll
    });
    // Editor Title Menu: Close (tabs disabled, dirty editor)
    appendEditorToolItem({
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('close', "Close"),
        icon: codicons_1.Codicon.closeDirty
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.EditorTabsVisibleContext.toNegated(), contextkeys_1.ActiveEditorDirtyContext, contextkeys_1.ActiveEditorStickyContext.toNegated()), CLOSE_ORDER, {
        id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
        title: (0, nls_1.localize)('closeAll', "Close All"),
        icon: codicons_1.Codicon.closeAll
    });
    // Editor Title Menu: Close (tabs disabled, sticky editor)
    appendEditorToolItem({
        id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('unpin', "Unpin"),
        icon: codicons_1.Codicon.pinned
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.EditorTabsVisibleContext.toNegated(), contextkeys_1.ActiveEditorDirtyContext.toNegated(), contextkeys_1.ActiveEditorStickyContext), CLOSE_ORDER, {
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('close', "Close"),
        icon: codicons_1.Codicon.close
    });
    // Editor Title Menu: Close (tabs disabled, dirty & sticky editor)
    appendEditorToolItem({
        id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('unpin', "Unpin"),
        icon: codicons_1.Codicon.pinnedDirty
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.EditorTabsVisibleContext.toNegated(), contextkeys_1.ActiveEditorDirtyContext, contextkeys_1.ActiveEditorStickyContext), CLOSE_ORDER, {
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)('close', "Close"),
        icon: codicons_1.Codicon.close
    });
    // Lock Group: only on auxiliary window and when group is unlocked
    appendEditorToolItem({
        id: editorCommands_1.LOCK_GROUP_COMMAND_ID,
        title: (0, nls_1.localize)('lockEditorGroup', "Lock Group"),
        icon: codicons_1.Codicon.unlock
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.IsAuxiliaryEditorPartContext, contextkeys_1.ActiveEditorGroupLockedContext.toNegated()), CLOSE_ORDER - 1);
    // Unlock Group: only when group is locked
    appendEditorToolItem({
        id: editorCommands_1.UNLOCK_GROUP_COMMAND_ID,
        title: (0, nls_1.localize)('unlockEditorGroup', "Unlock Group"),
        icon: codicons_1.Codicon.lock,
        toggled: contextkey_1.ContextKeyExpr.true()
    }, contextkeys_1.ActiveEditorGroupLockedContext, CLOSE_ORDER - 1);
    const previousChangeIcon = (0, iconRegistry_1.registerIcon)('diff-editor-previous-change', codicons_1.Codicon.arrowUp, (0, nls_1.localize)('previousChangeIcon', 'Icon for the previous change action in the diff editor.'));
    const nextChangeIcon = (0, iconRegistry_1.registerIcon)('diff-editor-next-change', codicons_1.Codicon.arrowDown, (0, nls_1.localize)('nextChangeIcon', 'Icon for the next change action in the diff editor.'));
    const toggleWhitespace = (0, iconRegistry_1.registerIcon)('diff-editor-toggle-whitespace', codicons_1.Codicon.whitespace, (0, nls_1.localize)('toggleWhitespace', 'Icon for the toggle whitespace action in the diff editor.'));
    // Diff Editor Title Menu: Previous Change
    appendEditorToolItem({
        id: editorCommands_1.GOTO_PREVIOUS_CHANGE,
        title: (0, nls_1.localize)('navigate.prev.label', "Previous Change"),
        icon: previousChangeIcon
    }, contextkeys_1.TextCompareEditorActiveContext, 10, undefined, editorContextKeys_1.EditorContextKeys.hasChanges);
    // Diff Editor Title Menu: Next Change
    appendEditorToolItem({
        id: editorCommands_1.GOTO_NEXT_CHANGE,
        title: (0, nls_1.localize)('navigate.next.label', "Next Change"),
        icon: nextChangeIcon
    }, contextkeys_1.TextCompareEditorActiveContext, 11, undefined, editorContextKeys_1.EditorContextKeys.hasChanges);
    // Diff Editor Title Menu: Swap Sides
    appendEditorToolItem({
        id: editorCommands_1.DIFF_SWAP_SIDES,
        title: (0, nls_1.localize)('swapDiffSides', "Swap Left and Right Side"),
        icon: codicons_1.Codicon.arrowSwap
    }, contextkey_1.ContextKeyExpr.and(contextkeys_1.TextCompareEditorActiveContext, contextkeys_1.ActiveCompareEditorOriginalWriteableContext), 15, undefined, undefined);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: editorCommands_1.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
            title: (0, nls_1.localize)('ignoreTrimWhitespace.label', "Show Leading/Trailing Whitespace Differences"),
            icon: toggleWhitespace,
            precondition: contextkeys_1.TextCompareEditorActiveContext,
            toggled: contextkey_1.ContextKeyExpr.equals('config.diffEditor.ignoreTrimWhitespace', false),
        },
        group: 'navigation',
        when: contextkeys_1.TextCompareEditorActiveContext,
        order: 20,
    });
    // Editor Commands for Command Palette
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.KEEP_EDITOR_COMMAND_ID, title: (0, nls_1.localize2)('keepEditor', 'Keep Editor'), category: actionCommonCategories_1.Categories.View }, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.PIN_EDITOR_COMMAND_ID, title: (0, nls_1.localize2)('pinEditor', 'Pin Editor'), category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID, title: (0, nls_1.localize2)('unpinEditor', 'Unpin Editor'), category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID, title: (0, nls_1.localize2)('closeEditor', 'Close Editor'), category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_PINNED_EDITOR_COMMAND_ID, title: (0, nls_1.localize2)('closePinnedEditor', 'Close Pinned Editor'), category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize2)('closeEditorsInGroup', 'Close All Editors in Group'), category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID, title: (0, nls_1.localize2)('closeSavedEditors', 'Close Saved Editors in Group'), category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize2)('closeOtherEditors', 'Close Other Editors in Group'), category: actionCommonCategories_1.Categories.View } });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: (0, nls_1.localize2)('closeRightEditors', 'Close Editors to the Right in Group'), category: actionCommonCategories_1.Categories.View }, when: contextkeys_1.ActiveEditorLastInGroupContext.toNegated() });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITORS_AND_GROUP_COMMAND_ID, title: (0, nls_1.localize2)('closeEditorGroup', 'Close Editor Group'), category: actionCommonCategories_1.Categories.View }, when: contextkeys_1.MultipleEditorGroupsContext });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: editorCommands_1.REOPEN_WITH_COMMAND_ID, title: (0, nls_1.localize2)('reopenWith', "Reopen Editor With..."), category: actionCommonCategories_1.Categories.View }, when: contextkeys_1.ActiveEditorAvailableEditorIdsContext });
    // File menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarRecentMenu, {
        group: '1_editor',
        command: {
            id: editorActions_1.ReopenClosedEditorAction.ID,
            title: (0, nls_1.localize)({ key: 'miReopenClosedEditor', comment: ['&& denotes a mnemonic'] }, "&&Reopen Closed Editor"),
            precondition: contextkey_1.ContextKeyExpr.has('canReopenClosedEditor')
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarRecentMenu, {
        group: 'z_clear',
        command: {
            id: editorActions_1.ClearRecentFilesAction.ID,
            title: (0, nls_1.localize)({ key: 'miClearRecentOpen', comment: ['&& denotes a mnemonic'] }, "&&Clear Recently Opened...")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        title: (0, nls_1.localize)('miShare', "Share"),
        submenu: actions_1.MenuId.MenubarShare,
        group: '45_share',
        order: 1,
    });
    // Layout menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
        group: '2_appearance',
        title: (0, nls_1.localize)({ key: 'miEditorLayout', comment: ['&& denotes a mnemonic'] }, "Editor &&Layout"),
        submenu: actions_1.MenuId.MenubarLayoutMenu,
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_UP,
            title: {
                original: 'Split Up',
                value: (0, nls_1.localize)('miSplitEditorUpWithoutMnemonic', "Split Up"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorUp', comment: ['&& denotes a mnemonic'] }, "Split &&Up"),
            }
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_DOWN,
            title: {
                original: 'Split Down',
                value: (0, nls_1.localize)('miSplitEditorDownWithoutMnemonic', "Split Down"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorDown', comment: ['&& denotes a mnemonic'] }, "Split &&Down")
            }
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_LEFT,
            title: {
                original: 'Split Left',
                value: (0, nls_1.localize)('miSplitEditorLeftWithoutMnemonic', "Split Left"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorLeft', comment: ['&& denotes a mnemonic'] }, "Split &&Left")
            }
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_RIGHT,
            title: {
                original: 'Split Right',
                value: (0, nls_1.localize)('miSplitEditorRightWithoutMnemonic', "Split Right"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorRight', comment: ['&& denotes a mnemonic'] }, "Split &&Right")
            }
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '2_split_in_group',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_IN_GROUP,
            title: {
                original: 'Split in Group',
                value: (0, nls_1.localize)('miSplitEditorInGroupWithoutMnemonic', "Split in Group"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSplitEditorInGroup', comment: ['&& denotes a mnemonic'] }, "Split in &&Group")
            }
        },
        when: contextkeys_1.ActiveEditorCanSplitInGroupContext,
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '2_split_in_group',
        command: {
            id: editorCommands_1.JOIN_EDITOR_IN_GROUP,
            title: {
                original: 'Join in Group',
                value: (0, nls_1.localize)('miJoinEditorInGroupWithoutMnemonic', "Join in Group"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miJoinEditorInGroup', comment: ['&& denotes a mnemonic'] }, "Join in &&Group")
            }
        },
        when: contextkeys_1.SideBySideEditorActiveContext,
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_new_window',
        command: {
            id: editorCommands_1.MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,
            title: {
                original: 'Move Editor into New Window',
                value: (0, nls_1.localize)('moveEditorToNewWindow', "Move Editor into New Window"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miMoveEditorToNewWindow', comment: ['&& denotes a mnemonic'] }, "&&Move Editor into New Window")
            }
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '3_new_window',
        command: {
            id: editorCommands_1.COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,
            title: {
                original: 'Copy Editor into New Window',
                value: (0, nls_1.localize)('copyEditorToNewWindow', "Copy Editor into New Window"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miCopyEditorToNewWindow', comment: ['&& denotes a mnemonic'] }, "&&Copy Editor into New Window")
            }
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '4_layouts',
        command: {
            id: editorActions_1.EditorLayoutSingleAction.ID,
            title: {
                original: 'Single',
                value: (0, nls_1.localize)('miSingleColumnEditorLayoutWithoutMnemonic', "Single"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miSingleColumnEditorLayout', comment: ['&& denotes a mnemonic'] }, "&&Single")
            }
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '4_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoColumnsAction.ID,
            title: {
                original: 'Two Columns',
                value: (0, nls_1.localize)('miTwoColumnsEditorLayoutWithoutMnemonic', "Two Columns"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoColumnsEditorLayout', comment: ['&& denotes a mnemonic'] }, "&&Two Columns")
            }
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '4_layouts',
        command: {
            id: editorActions_1.EditorLayoutThreeColumnsAction.ID,
            title: {
                original: 'Three Columns',
                value: (0, nls_1.localize)('miThreeColumnsEditorLayoutWithoutMnemonic', "Three Columns"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miThreeColumnsEditorLayout', comment: ['&& denotes a mnemonic'] }, "T&&hree Columns")
            }
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '4_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoRowsAction.ID,
            title: {
                original: 'Two Rows',
                value: (0, nls_1.localize)('miTwoRowsEditorLayoutWithoutMnemonic', "Two Rows"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoRowsEditorLayout', comment: ['&& denotes a mnemonic'] }, "T&&wo Rows")
            }
        },
        order: 5
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '4_layouts',
        command: {
            id: editorActions_1.EditorLayoutThreeRowsAction.ID,
            title: {
                original: 'Three Rows',
                value: (0, nls_1.localize)('miThreeRowsEditorLayoutWithoutMnemonic', "Three Rows"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miThreeRowsEditorLayout', comment: ['&& denotes a mnemonic'] }, "Three &&Rows")
            }
        },
        order: 6
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '4_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoByTwoGridAction.ID,
            title: {
                original: 'Grid (2x2)',
                value: (0, nls_1.localize)('miTwoByTwoGridEditorLayoutWithoutMnemonic', "Grid (2x2)"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoByTwoGridEditorLayout', comment: ['&& denotes a mnemonic'] }, "&&Grid (2x2)")
            }
        },
        order: 7
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '4_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoRowsRightAction.ID,
            title: {
                original: 'Two Rows Right',
                value: (0, nls_1.localize)('miTwoRowsRightEditorLayoutWithoutMnemonic', "Two Rows Right"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoRowsRightEditorLayout', comment: ['&& denotes a mnemonic'] }, "Two R&&ows Right")
            }
        },
        order: 8
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarLayoutMenu, {
        group: '4_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoColumnsBottomAction.ID,
            title: {
                original: 'Two Columns Bottom',
                value: (0, nls_1.localize)('miTwoColumnsBottomEditorLayoutWithoutMnemonic', "Two Columns Bottom"),
                mnemonicTitle: (0, nls_1.localize)({ key: 'miTwoColumnsBottomEditorLayout', comment: ['&& denotes a mnemonic'] }, "Two &&Columns Bottom")
            }
        },
        order: 9
    });
    // Main Menu Bar Contributions:
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '1_history_nav',
        command: {
            id: 'workbench.action.navigateToLastEditLocation',
            title: (0, nls_1.localize)({ key: 'miLastEditLocation', comment: ['&& denotes a mnemonic'] }, "&&Last Edit Location"),
            precondition: contextkey_1.ContextKeyExpr.has('canNavigateToLastEditLocation')
        },
        order: 3
    });
    // Switch Editor
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '1_sideBySide',
        command: {
            id: editorCommands_1.FOCUS_FIRST_SIDE_EDITOR,
            title: (0, nls_1.localize)({ key: 'miFirstSideEditor', comment: ['&& denotes a mnemonic'] }, "&&First Side in Editor")
        },
        when: contextkey_1.ContextKeyExpr.or(contextkeys_1.SideBySideEditorActiveContext, contextkeys_1.TextCompareEditorActiveContext),
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '1_sideBySide',
        command: {
            id: editorCommands_1.FOCUS_SECOND_SIDE_EDITOR,
            title: (0, nls_1.localize)({ key: 'miSecondSideEditor', comment: ['&& denotes a mnemonic'] }, "&&Second Side in Editor")
        },
        when: contextkey_1.ContextKeyExpr.or(contextkeys_1.SideBySideEditorActiveContext, contextkeys_1.TextCompareEditorActiveContext),
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '2_any',
        command: {
            id: 'workbench.action.nextEditor',
            title: (0, nls_1.localize)({ key: 'miNextEditor', comment: ['&& denotes a mnemonic'] }, "&&Next Editor")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '2_any',
        command: {
            id: 'workbench.action.previousEditor',
            title: (0, nls_1.localize)({ key: 'miPreviousEditor', comment: ['&& denotes a mnemonic'] }, "&&Previous Editor")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '3_any_used',
        command: {
            id: 'workbench.action.openNextRecentlyUsedEditor',
            title: (0, nls_1.localize)({ key: 'miNextRecentlyUsedEditor', comment: ['&& denotes a mnemonic'] }, "&&Next Used Editor")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '3_any_used',
        command: {
            id: 'workbench.action.openPreviousRecentlyUsedEditor',
            title: (0, nls_1.localize)({ key: 'miPreviousRecentlyUsedEditor', comment: ['&& denotes a mnemonic'] }, "&&Previous Used Editor")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '4_group',
        command: {
            id: 'workbench.action.nextEditorInGroup',
            title: (0, nls_1.localize)({ key: 'miNextEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Next Editor in Group")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '4_group',
        command: {
            id: 'workbench.action.previousEditorInGroup',
            title: (0, nls_1.localize)({ key: 'miPreviousEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Previous Editor in Group")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '5_group_used',
        command: {
            id: 'workbench.action.openNextRecentlyUsedEditorInGroup',
            title: (0, nls_1.localize)({ key: 'miNextUsedEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Next Used Editor in Group")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchEditorMenu, {
        group: '5_group_used',
        command: {
            id: 'workbench.action.openPreviousRecentlyUsedEditorInGroup',
            title: (0, nls_1.localize)({ key: 'miPreviousUsedEditorInGroup', comment: ['&& denotes a mnemonic'] }, "&&Previous Used Editor in Group")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '2_editor_nav',
        title: (0, nls_1.localize)({ key: 'miSwitchEditor', comment: ['&& denotes a mnemonic'] }, "Switch &&Editor"),
        submenu: actions_1.MenuId.MenubarSwitchEditorMenu,
        order: 1
    });
    // Switch Group
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFirstEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusFirstGroup', comment: ['&& denotes a mnemonic'] }, "Group &&1")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusSecondEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusSecondGroup', comment: ['&& denotes a mnemonic'] }, "Group &&2")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusThirdEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusThirdGroup', comment: ['&& denotes a mnemonic'] }, "Group &&3"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFourthEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusFourthGroup', comment: ['&& denotes a mnemonic'] }, "Group &&4"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFifthEditorGroup',
            title: (0, nls_1.localize)({ key: 'miFocusFifthGroup', comment: ['&& denotes a mnemonic'] }, "Group &&5"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 5
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '2_next_prev',
        command: {
            id: 'workbench.action.focusNextGroup',
            title: (0, nls_1.localize)({ key: 'miNextGroup', comment: ['&& denotes a mnemonic'] }, "&&Next Group"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '2_next_prev',
        command: {
            id: 'workbench.action.focusPreviousGroup',
            title: (0, nls_1.localize)({ key: 'miPreviousGroup', comment: ['&& denotes a mnemonic'] }, "&&Previous Group"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusLeftGroup',
            title: (0, nls_1.localize)({ key: 'miFocusLeftGroup', comment: ['&& denotes a mnemonic'] }, "Group &&Left"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusRightGroup',
            title: (0, nls_1.localize)({ key: 'miFocusRightGroup', comment: ['&& denotes a mnemonic'] }, "Group &&Right"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusAboveGroup',
            title: (0, nls_1.localize)({ key: 'miFocusAboveGroup', comment: ['&& denotes a mnemonic'] }, "Group &&Above"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusBelowGroup',
            title: (0, nls_1.localize)({ key: 'miFocusBelowGroup', comment: ['&& denotes a mnemonic'] }, "Group &&Below"),
            precondition: contextkeys_1.MultipleEditorGroupsContext
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '2_editor_nav',
        title: (0, nls_1.localize)({ key: 'miSwitchGroup', comment: ['&& denotes a mnemonic'] }, "Switch &&Group"),
        submenu: actions_1.MenuId.MenubarSwitchGroupMenu,
        order: 2
    });
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2VkaXRvci5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUF3RWhHLDhCQUE4QjtJQUU5QixtQkFBUSxDQUFDLEVBQUUsQ0FBc0IseUJBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsa0JBQWtCLENBQy9FLDZCQUFvQixDQUFDLE1BQU0sQ0FDMUIsdUNBQWtCLEVBQ2xCLHVDQUFrQixDQUFDLEVBQUUsRUFDckIsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUNyQyxFQUNEO1FBQ0MsSUFBSSw0QkFBYyxDQUFDLGlEQUF1QixDQUFDO1FBQzNDLElBQUksNEJBQWMsQ0FBQyxpREFBdUIsQ0FBQztLQUMzQyxDQUNELENBQUM7SUFFRixtQkFBUSxDQUFDLEVBQUUsQ0FBc0IseUJBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsa0JBQWtCLENBQy9FLDZCQUFvQixDQUFDLE1BQU0sQ0FDMUIsK0JBQWMsRUFDZCwrQkFBYyxDQUFDLEVBQUUsRUFDakIsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FDOUMsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyxpQ0FBZSxDQUFDO0tBQ25DLENBQ0QsQ0FBQztJQUVGLG1CQUFRLENBQUMsRUFBRSxDQUFzQix5QkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxrQkFBa0IsQ0FDL0UsNkJBQW9CLENBQUMsTUFBTSxDQUMxQiwyQ0FBd0IsRUFDeEIsMkNBQXdCLENBQUMsRUFBRSxFQUMzQixJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUNsRCxFQUNEO1FBQ0MsSUFBSSw0QkFBYyxDQUFD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
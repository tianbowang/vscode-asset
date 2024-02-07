/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/activity", "vs/workbench/common/contextkeys"], function (require, exports, nls_1, configuration_1, storage_1, actions_1, contextkey_1, activity_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GLOBAL_ACTIVITY_TITLE_ACTION = exports.ACCOUNTS_ACTIVITY_TILE_ACTION = void 0;
    // --- Context Menu Actions --- //
    class ToggleConfigAction extends actions_1.Action2 {
        constructor(section, title, order, mainWindowOnly) {
            const when = mainWindowOnly ? contextkeys_1.IsAuxiliaryWindowFocusedContext.toNegated() : contextkey_1.ContextKeyExpr.true();
            super({
                id: `toggle.${section}`,
                title,
                toggled: contextkey_1.ContextKeyExpr.equals(`config.${section}`, true),
                menu: [
                    {
                        id: actions_1.MenuId.TitleBarContext,
                        when,
                        order,
                        group: '2_config'
                    },
                    {
                        id: actions_1.MenuId.TitleBarTitleContext,
                        when,
                        order,
                        group: '2_config'
                    }
                ]
            });
            this.section = section;
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            const value = configService.getValue(this.section);
            configService.updateValue(this.section, !value);
        }
    }
    (0, actions_1.registerAction2)(class ToggleCommandCenter extends ToggleConfigAction {
        constructor() {
            super("window.commandCenter" /* LayoutSettings.COMMAND_CENTER */, (0, nls_1.localize)('toggle.commandCenter', 'Command Center'), 1, false);
        }
    });
    (0, actions_1.registerAction2)(class ToggleLayoutControl extends ToggleConfigAction {
        constructor() {
            super('workbench.layoutControl.enabled', (0, nls_1.localize)('toggle.layout', 'Layout Controls'), 2, true);
        }
    });
    (0, actions_1.registerAction2)(class ToggleCustomTitleBar extends actions_1.Action2 {
        constructor() {
            super({
                id: `toggle.${"window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */}`,
                title: (0, nls_1.localize)('toggle.hideCustomTitleBar', 'Hide Custom Title Bar'),
                menu: [
                    { id: actions_1.MenuId.TitleBarContext, order: 0, when: contextkey_1.ContextKeyExpr.equals(contextkeys_1.TitleBarStyleContext.key, "native" /* TitlebarStyle.NATIVE */), group: '3_toggle' },
                    { id: actions_1.MenuId.TitleBarTitleContext, order: 0, when: contextkey_1.ContextKeyExpr.equals(contextkeys_1.TitleBarStyleContext.key, "native" /* TitlebarStyle.NATIVE */), group: '3_toggle' },
                ]
            });
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            configService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "never" /* CustomTitleBarVisibility.NEVER */);
        }
    });
    (0, actions_1.registerAction2)(class ToggleCustomTitleBarWindowed extends actions_1.Action2 {
        constructor() {
            super({
                id: `toggle.${"window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */}.windowed`,
                title: (0, nls_1.localize)('toggle.hideCustomTitleBarInFullScreen', 'Hide Custom Title Bar In Full Screen'),
                menu: [
                    { id: actions_1.MenuId.TitleBarContext, order: 1, when: contextkeys_1.IsMainWindowFullscreenContext, group: '3_toggle' },
                    { id: actions_1.MenuId.TitleBarTitleContext, order: 1, when: contextkeys_1.IsMainWindowFullscreenContext, group: '3_toggle' },
                ]
            });
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            configService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "windowed" /* CustomTitleBarVisibility.WINDOWED */);
        }
    });
    class ToggleCustomTitleBar extends actions_1.Action2 {
        constructor() {
            super({
                id: `toggle.toggleCustomTitleBar`,
                title: (0, nls_1.localize)('toggle.customTitleBar', 'Custom Title Bar'),
                toggled: contextkeys_1.TitleBarVisibleContext,
                menu: [
                    {
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        order: 6,
                        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(contextkeys_1.TitleBarStyleContext.key, "native" /* TitlebarStyle.NATIVE */), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.enabled', false), contextkey_1.ContextKeyExpr.equals('config.window.commandCenter', false), contextkey_1.ContextKeyExpr.notEquals('config.workbench.editor.editorActionsLocation', 'titleBar'), contextkey_1.ContextKeyExpr.notEquals('config.workbench.activityBar.location', 'top'))?.negate()), contextkeys_1.IsMainWindowFullscreenContext),
                        group: '2_workbench_layout'
                    },
                ],
            });
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const titleBarVisibility = configService.getValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */);
            switch (titleBarVisibility) {
                case "never" /* CustomTitleBarVisibility.NEVER */:
                    configService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "auto" /* CustomTitleBarVisibility.AUTO */);
                    break;
                case "windowed" /* CustomTitleBarVisibility.WINDOWED */: {
                    const isFullScreen = contextkeys_1.IsMainWindowFullscreenContext.evaluate(contextKeyService.getContext(null));
                    if (isFullScreen) {
                        configService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "auto" /* CustomTitleBarVisibility.AUTO */);
                    }
                    else {
                        configService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "never" /* CustomTitleBarVisibility.NEVER */);
                    }
                    break;
                }
                case "auto" /* CustomTitleBarVisibility.AUTO */:
                default:
                    configService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "never" /* CustomTitleBarVisibility.NEVER */);
                    break;
            }
        }
    }
    (0, actions_1.registerAction2)(ToggleCustomTitleBar);
    (0, actions_1.registerAction2)(class ShowCustomTitleBar extends actions_1.Action2 {
        constructor() {
            super({
                id: `showCustomTitleBar`,
                title: { value: (0, nls_1.localize)('showCustomTitleBar', 'Show Custom Title Bar'), original: 'Show Custom Title Bar' },
                precondition: contextkeys_1.TitleBarVisibleContext.negate(),
                f1: true
            });
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            configService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "auto" /* CustomTitleBarVisibility.AUTO */);
        }
    });
    (0, actions_1.registerAction2)(class HideCustomTitleBar extends actions_1.Action2 {
        constructor() {
            super({
                id: `hideCustomTitleBar`,
                title: { value: (0, nls_1.localize)('hideCustomTitleBar', 'Hide Custom Title Bar'), original: 'Hide Custom Title Bar' },
                precondition: contextkeys_1.TitleBarVisibleContext,
                f1: true
            });
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            configService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "never" /* CustomTitleBarVisibility.NEVER */);
        }
    });
    (0, actions_1.registerAction2)(class HideCustomTitleBar extends actions_1.Action2 {
        constructor() {
            super({
                id: `hideCustomTitleBarInFullScreen`,
                title: { value: (0, nls_1.localize)('hideCustomTitleBarInFullScreen', 'Hide Custom Title Bar In Full Screen'), original: 'Hide Custom Title Bar In Full Screen' },
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.TitleBarVisibleContext, contextkeys_1.IsMainWindowFullscreenContext),
                f1: true
            });
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            configService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "windowed" /* CustomTitleBarVisibility.WINDOWED */);
        }
    });
    (0, actions_1.registerAction2)(class ToggleEditorActions extends actions_1.Action2 {
        static { this.settingsID = `workbench.editor.editorActionsLocation`; }
        constructor() {
            const titleBarContextCondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.workbench.editor.showTabs`, 'none').negate(), contextkey_1.ContextKeyExpr.equals(`config.${ToggleEditorActions.settingsID}`, 'default'))?.negate();
            super({
                id: `toggle.${ToggleEditorActions.settingsID}`,
                title: (0, nls_1.localize)('toggle.editorActions', 'Editor Actions'),
                toggled: contextkey_1.ContextKeyExpr.equals(`config.${ToggleEditorActions.settingsID}`, 'hidden').negate(),
                menu: [
                    { id: actions_1.MenuId.TitleBarContext, order: 3, when: titleBarContextCondition, group: '2_config' },
                    { id: actions_1.MenuId.TitleBarTitleContext, order: 3, when: titleBarContextCondition, group: '2_config' }
                ]
            });
        }
        run(accessor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            const storageService = accessor.get(storage_1.IStorageService);
            const location = configService.getValue(ToggleEditorActions.settingsID);
            if (location === 'hidden') {
                const showTabs = configService.getValue("workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */);
                // If tabs are visible, then set the editor actions to be in the title bar
                if (showTabs !== 'none') {
                    configService.updateValue(ToggleEditorActions.settingsID, 'titleBar');
                }
                // If tabs are not visible, then set the editor actions to the last location the were before being hidden
                else {
                    const storedValue = storageService.get(ToggleEditorActions.settingsID, 0 /* StorageScope.PROFILE */);
                    configService.updateValue(ToggleEditorActions.settingsID, storedValue ?? 'default');
                }
                storageService.remove(ToggleEditorActions.settingsID, 0 /* StorageScope.PROFILE */);
            }
            // Store the current value (titleBar or default) in the storage service for later to restore
            else {
                configService.updateValue(ToggleEditorActions.settingsID, 'hidden');
                storageService.store(ToggleEditorActions.settingsID, location, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
    });
    // --- Toolbar actions --- //
    exports.ACCOUNTS_ACTIVITY_TILE_ACTION = {
        id: activity_1.ACCOUNTS_ACTIVITY_ID,
        label: (0, nls_1.localize)('accounts', "Accounts"),
        tooltip: (0, nls_1.localize)('accounts', "Accounts"),
        class: undefined,
        enabled: true,
        run: function () { }
    };
    exports.GLOBAL_ACTIVITY_TITLE_ACTION = {
        id: activity_1.GLOBAL_ACTIVITY_ID,
        label: (0, nls_1.localize)('manage', "Manage"),
        tooltip: (0, nls_1.localize)('manage', "Manage"),
        class: undefined,
        enabled: true,
        run: function () { }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGViYXJBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy90aXRsZWJhci90aXRsZWJhckFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLGtDQUFrQztJQUVsQyxNQUFNLGtCQUFtQixTQUFRLGlCQUFPO1FBRXZDLFlBQTZCLE9BQWUsRUFBRSxLQUFhLEVBQUUsS0FBYSxFQUFFLGNBQXVCO1lBQ2xHLE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsNkNBQStCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLDJCQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbEcsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxVQUFVLE9BQU8sRUFBRTtnQkFDdkIsS0FBSztnQkFDTCxPQUFPLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUM7Z0JBQ3pELElBQUksRUFBRTtvQkFDTDt3QkFDQyxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO3dCQUMxQixJQUFJO3dCQUNKLEtBQUs7d0JBQ0wsS0FBSyxFQUFFLFVBQVU7cUJBQ2pCO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxnQkFBTSxDQUFDLG9CQUFvQjt3QkFDL0IsSUFBSTt3QkFDSixLQUFLO3dCQUNMLEtBQUssRUFBRSxVQUFVO3FCQUNqQjtpQkFDRDthQUNELENBQUMsQ0FBQztZQXBCeUIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQXFCNUMsQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQixFQUFFLEdBQUcsSUFBVztZQUM3QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7WUFDMUQsTUFBTSxLQUFLLEdBQUcs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
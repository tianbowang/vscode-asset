/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/platform/contextkey/common/contextkeys", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/platform/quickinput/common/quickInput", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions", "vs/workbench/browser/parts/panel/panelActions", "vs/platform/commands/common/commands", "vs/workbench/common/contextkeys", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/lifecycle", "vs/platform/theme/common/iconRegistry", "vs/base/browser/window", "vs/platform/keybinding/common/keybinding"], function (require, exports, nls_1, actions_1, actionCommonCategories_1, configuration_1, layoutService_1, instantiation_1, keyCodes_1, platform_1, contextkeys_1, keybindingsRegistry_1, contextkey_1, views_1, viewsService_1, quickInput_1, dialogs_1, panecomposite_1, auxiliaryBarActions_1, panelActions_1, commands_1, contextkeys_2, codicons_1, themables_1, lifecycle_1, iconRegistry_1, window_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowEditorActionsAction = exports.HideEditorActionsAction = exports.EditorActionsDefaultAction = exports.EditorActionsTitleBarAction = exports.ZenShowSingleEditorTabAction = exports.ShowSingleEditorTabAction = exports.ZenShowMultipleEditorTabsAction = exports.ShowMultipleEditorTabsAction = exports.ZenHideEditorTabsAction = exports.HideEditorTabsAction = exports.ToggleStatusbarVisibilityAction = exports.ToggleSidebarPositionAction = exports.ToggleActivityBarVisibilityActionId = void 0;
    // Register Icons
    const menubarIcon = (0, iconRegistry_1.registerIcon)('menuBar', codicons_1.Codicon.layoutMenubar, (0, nls_1.localize)('menuBarIcon', "Represents the menu bar"));
    const activityBarLeftIcon = (0, iconRegistry_1.registerIcon)('activity-bar-left', codicons_1.Codicon.layoutActivitybarLeft, (0, nls_1.localize)('activityBarLeft', "Represents the activity bar in the left position"));
    const activityBarRightIcon = (0, iconRegistry_1.registerIcon)('activity-bar-right', codicons_1.Codicon.layoutActivitybarRight, (0, nls_1.localize)('activityBarRight', "Represents the activity bar in the right position"));
    const panelLeftIcon = (0, iconRegistry_1.registerIcon)('panel-left', codicons_1.Codicon.layoutSidebarLeft, (0, nls_1.localize)('panelLeft', "Represents a side bar in the left position"));
    const panelLeftOffIcon = (0, iconRegistry_1.registerIcon)('panel-left-off', codicons_1.Codicon.layoutSidebarLeftOff, (0, nls_1.localize)('panelLeftOff', "Represents a side bar in the left position toggled off"));
    const panelRightIcon = (0, iconRegistry_1.registerIcon)('panel-right', codicons_1.Codicon.layoutSidebarRight, (0, nls_1.localize)('panelRight', "Represents side bar in the right position"));
    const panelRightOffIcon = (0, iconRegistry_1.registerIcon)('panel-right-off', codicons_1.Codicon.layoutSidebarRightOff, (0, nls_1.localize)('panelRightOff', "Represents side bar in the right position toggled off"));
    const panelIcon = (0, iconRegistry_1.registerIcon)('panel-bottom', codicons_1.Codicon.layoutPanel, (0, nls_1.localize)('panelBottom', "Represents the bottom panel"));
    const statusBarIcon = (0, iconRegistry_1.registerIcon)('statusBar', codicons_1.Codicon.layoutStatusbar, (0, nls_1.localize)('statusBarIcon', "Represents the status bar"));
    const panelAlignmentLeftIcon = (0, iconRegistry_1.registerIcon)('panel-align-left', codicons_1.Codicon.layoutPanelLeft, (0, nls_1.localize)('panelBottomLeft', "Represents the bottom panel alignment set to the left"));
    const panelAlignmentRightIcon = (0, iconRegistry_1.registerIcon)('panel-align-right', codicons_1.Codicon.layoutPanelRight, (0, nls_1.localize)('panelBottomRight', "Represents the bottom panel alignment set to the right"));
    const panelAlignmentCenterIcon = (0, iconRegistry_1.registerIcon)('panel-align-center', codicons_1.Codicon.layoutPanelCenter, (0, nls_1.localize)('panelBottomCenter', "Represents the bottom panel alignment set to the center"));
    const panelAlignmentJustifyIcon = (0, iconRegistry_1.registerIcon)('panel-align-justify', codicons_1.Codicon.layoutPanelJustify, (0, nls_1.localize)('panelBottomJustify', "Represents the bottom panel alignment set to justified"));
    const fullscreenIcon = (0, iconRegistry_1.registerIcon)('fullscreen', codicons_1.Codicon.screenFull, (0, nls_1.localize)('fullScreenIcon', "Represents full screen"));
    const centerLayoutIcon = (0, iconRegistry_1.registerIcon)('centerLayoutIcon', codicons_1.Codicon.layoutCentered, (0, nls_1.localize)('centerLayoutIcon', "Represents centered layout mode"));
    const zenModeIcon = (0, iconRegistry_1.registerIcon)('zenMode', codicons_1.Codicon.target, (0, nls_1.localize)('zenModeIcon', "Represents zen mode"));
    // --- Close Side Bar
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.closeSidebar',
                title: (0, nls_1.localize2)('closeSidebar', 'Close Primary Side Bar'),
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        }
    });
    exports.ToggleActivityBarVisibilityActionId = 'workbench.action.toggleActivityBarVisibility';
    // --- Toggle Centered Layout
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleCenteredLayout',
                title: {
                    value: (0, nls_1.localize)('toggleCenteredLayout', "Toggle Centered Layout"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miToggleCenteredLayout', comment: ['&& denotes a mnemonic'] }, "&&Centered Layout"),
                    original: 'Toggle Centered Layout'
                },
                precondition: contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated(),
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkeys_2.IsCenteredLayoutContext,
                menu: [{
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '1_toggle_view',
                        order: 3
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.centerMainEditorLayout(!layoutService.isMainEditorLayoutCentered());
        }
    });
    // --- Set Sidebar Position
    const sidebarPositionConfigurationKey = 'workbench.sideBar.location';
    class MoveSidebarPositionAction extends actions_1.Action2 {
        constructor(id, title, position) {
            super({
                id,
                title,
                f1: false
            });
            this.position = position;
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const position = layoutService.getSideBarPosition();
            if (position !== this.position) {
                return configurationService.updateValue(sidebarPositionConfigurationKey, (0, layoutService_1.positionToString)(this.position));
            }
        }
    }
    class MoveSidebarRightAction extends MoveSidebarPositionAction {
        static { this.ID = 'workbench.action.moveSideBarRight'; }
        constructor() {
            super(MoveSidebarRightAction.ID, {
                value: (0, nls_1.localize)('moveSidebarRight', "Move Primary Side Bar Right"),
                original: 'Move Primary Side Bar Right'
            }, 1 /* Position.RIGHT */);
        }
    }
    class MoveSidebarLeftAction extends MoveSidebarPositionAction {
        static { this.ID = 'workbench.action.moveSideBarLeft'; }
        constructor() {
            super(MoveSidebarLeftAction.ID, {
                value: (0, nls_1.localize)('moveSidebarLeft', "Move Primary Side Bar Left"),
                original: 'Move Primary Side Bar Left'
            }, 0 /* Position.LEFT */);
        }
    }
    (0, actions_1.registerAction2)(MoveSidebarRightAction);
    (0, actions_1.registerAction2)(MoveSidebarLeftAction);
    // --- Toggle Sidebar Position
    class ToggleSidebarPositionAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleSidebarPosition'; }
        static { this.LABEL = (0, nls_1.localize)('toggleSidebarPosition', "Toggle Primary Side Bar Position"); }
        static getLabel(layoutService) {
            return layoutService.getSideBarPosition() === 0 /* Position.LEFT */ ? (0, nls_1.localize)('moveSidebarRight', "Move Primary Side Bar Right") : (0, nls_1.localize)('moveSidebarLeft', "Move Primary Side Bar Left");
        }
        constructor() {
            super({
                id: ToggleSidebarPositionAction.ID,
                title: (0, nls_1.localize2)('toggleSidebarPosition', "Toggle Primary Side Bar Position"),
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const position = layoutService.getSideBarPosition();
            const newPositionValue = (position === 0 /* Position.LEFT */) ? 'right' : 'left';
            return configurationService.updateValue(sidebarPositionConfigurationKey, newPositionValue);
        }
    }
    exports.ToggleSidebarPositionAction = ToggleSidebarPositionAction;
    (0, actions_1.registerAction2)(ToggleSidebarPositionAction);
    const configureLayoutIcon = (0, iconRegistry_1.registerIcon)('configure-layout-icon', codicons_1.Codicon.layout, (0, nls_1.localize)('cofigureLayoutIcon', 'Icon represents workbench layout configuration.'));
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.LayoutControlMenu, {
        submenu: actions_1.MenuId.LayoutControlMenuSubmenu,
        title: (0, nls_1.localize)('configureLayout', "Configure Layout"),
        icon: configureLayoutIcon,
        group: '1_workbench_layout',
        when: contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'menu')
    });
    actions_1.MenuRegistry.appendMenuItems([{
            id: actions_1.MenuId.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move side bar right', "Move Primary Side Bar Right")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move sidebar right', "Move Primary Side Bar Right")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move sidebar left', "Move Primary Side Bar Left")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move sidebar left', "Move Primary Side Bar Left")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move second sidebar left', "Move Secondary Side Bar Left")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(2 /* ViewContainerLocation.AuxiliaryBar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move second sidebar right', "Move Secondary Side Bar Right")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(2 /* ViewContainerLocation.AuxiliaryBar */))),
                order: 1
            }
        }]);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
        group: '3_workbench_layout_move',
        command: {
            id: ToggleSidebarPositionAction.ID,
            title: (0, nls_1.localize)({ key: 'miMoveSidebarRight', comment: ['&& denotes a mnemonic'] }, "&&Move Primary Side Bar Right")
        },
        when: contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'),
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
        group: '3_workbench_layout_move',
        command: {
            id: ToggleSidebarPositionAction.ID,
            title: (0, nls_1.localize)({ key: 'miMoveSidebarLeft', comment: ['&& denotes a mnemonic'] }, "&&Move Primary Side Bar Left")
        },
        when: contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'),
        order: 2
    });
    // --- Toggle Editor Visibility
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleEditorVisibility',
                title: {
                    value: (0, nls_1.localize)('toggleEditor', "Toggle Editor Area Visibility"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miShowEditorArea', comment: ['&& denotes a mnemonic'] }, "Show &&Editor Area"),
                    original: 'Toggle Editor Area Visibility'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkeys_2.MainEditorAreaVisibleContext,
                // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated(), contextkey_1.ContextKeyExpr.or(contextkeys_2.PanelAlignmentContext.isEqualTo('center'), contextkeys_2.PanelPositionContext.notEqualsTo('bottom')))
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.IWorkbenchLayoutService).toggleMaximizedPanel();
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
        group: '2_appearance',
        title: (0, nls_1.localize)({ key: 'miAppearance', comment: ['&& denotes a mnemonic'] }, "&&Appearance"),
        submenu: actions_1.MenuId.MenubarAppearanceMenu,
        order: 1
    });
    // Toggle Sidebar Visibility
    class ToggleSidebarVisibilityAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleSidebarVisibility'; }
        constructor() {
            super({
                id: ToggleSidebarVisibilityAction.ID,
                title: (0, nls_1.localize2)('toggleSidebar', 'Toggle Primary Side Bar Visibility'),
                toggled: {
                    condition: contextkeys_2.SideBarVisibleContext,
                    title: (0, nls_1.localize)('primary sidebar', "Primary Side Bar"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'primary sidebar mnemonic', comment: ['&& denotes a mnemonic'] }, "&&Primary Side Bar"),
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */
                },
                menu: [
                    {
                        id: actions_1.MenuId.LayoutControlMenuSubmenu,
                        group: '0_workbench_layout',
                        order: 0
                    },
                    {
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 1
                    }
                ]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.setPartHidden(layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */), "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        }
    }
    (0, actions_1.registerAction2)(ToggleSidebarVisibilityAction);
    actions_1.MenuRegistry.appendMenuItems([
        {
            id: actions_1.MenuId.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)('compositePart.hideSideBarLabel', "Hide Primary Side Bar"),
                },
                when: contextkey_1.ContextKeyExpr.and(contextkeys_2.SideBarVisibleContext, contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 2
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)('compositePart.hideSideBarLabel', "Hide Primary Side Bar"),
                },
                when: contextkey_1.ContextKeyExpr.and(contextkeys_2.SideBarVisibleContext, contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 2
            }
        }, {
            id: actions_1.MenuId.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)('toggleSideBar', "Toggle Primary Side Bar"),
                    icon: panelLeftOffIcon,
                    toggled: { condition: contextkeys_2.SideBarVisibleContext, icon: panelLeftIcon }
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left')),
                order: 0
            }
        }, {
            id: actions_1.MenuId.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)('toggleSideBar', "Toggle Primary Side Bar"),
                    icon: panelRightOffIcon,
                    toggled: { condition: contextkeys_2.SideBarVisibleContext, icon: panelRightIcon }
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right')),
                order: 2
            }
        }
    ]);
    // --- Toggle Statusbar Visibility
    class ToggleStatusbarVisibilityAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleStatusbarVisibility'; }
        static { this.statusbarVisibleKey = 'workbench.statusBar.visible'; }
        constructor() {
            super({
                id: ToggleStatusbarVisibilityAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleStatusbar', "Toggle Status Bar Visibility"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miStatusbar', comment: ['&& denotes a mnemonic'] }, "S&&tatus Bar"),
                    original: 'Toggle Status Bar Visibility'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.statusBar.visible', true),
                menu: [{
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 3
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const visibility = layoutService.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, window_1.mainWindow);
            const newVisibilityValue = !visibility;
            return configurationService.updateValue(ToggleStatusbarVisibilityAction.statusbarVisibleKey, newVisibilityValue);
        }
    }
    exports.ToggleStatusbarVisibilityAction = ToggleStatusbarVisibilityAction;
    (0, actions_1.registerAction2)(ToggleStatusbarVisibilityAction);
    // ------------------- Editor Tabs Layout --------------------------------
    class AbstractSetShowTabsAction extends actions_1.Action2 {
        constructor(settingName, value, title, id, precondition) {
            super({
                id,
                title,
                category: actionCommonCategories_1.Categories.View,
                precondition,
                f1: true
            });
            this.settingName = settingName;
            this.value = value;
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            return configurationService.updateValue(this.settingName, this.value);
        }
    }
    // --- Hide Editor Tabs
    class HideEditorTabsAction extends AbstractSetShowTabsAction {
        static { this.ID = 'workbench.action.hideEditorTabs'; }
        constructor() {
            const precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */}`, "none" /* EditorTabsMode.NONE */).negate(), contextkeys_2.InEditorZenModeContext.negate());
            const title = (0, nls_1.localize2)('hideEditorTabs', 'Hide Editor Tabs');
            super("workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */, "none" /* EditorTabsMode.NONE */, title, HideEditorTabsAction.ID, precondition);
        }
    }
    exports.HideEditorTabsAction = HideEditorTabsAction;
    class ZenHideEditorTabsAction extends AbstractSetShowTabsAction {
        static { this.ID = 'workbench.action.zenHideEditorTabs'; }
        constructor() {
            const precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */}`, "none" /* EditorTabsMode.NONE */).negate(), contextkeys_2.InEditorZenModeContext);
            const title = (0, nls_1.localize2)('hideEditorTabsZenMode', 'Hide Editor Tabs in Zen Mode');
            super("zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */, "none" /* EditorTabsMode.NONE */, title, ZenHideEditorTabsAction.ID, precondition);
        }
    }
    exports.ZenHideEditorTabsAction = ZenHideEditorTabsAction;
    // --- Show Multiple Editor Tabs
    class ShowMultipleEditorTabsAction extends AbstractSetShowTabsAction {
        static { this.ID = 'workbench.action.showMultipleEditorTabs'; }
        constructor() {
            const precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */}`, "multiple" /* EditorTabsMode.MULTIPLE */).negate(), contextkeys_2.InEditorZenModeContext.negate());
            const title = (0, nls_1.localize2)('showMultipleEditorTabs', 'Show Multiple Editor Tabs');
            super("workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */, "multiple" /* EditorTabsMode.MULTIPLE */, title, ShowMultipleEditorTabsAction.ID, precondition);
        }
    }
    exports.ShowMultipleEditorTabsAction = ShowMultipleEditorTabsAction;
    class ZenShowMultipleEditorTabsAction extends AbstractSetShowTabsAction {
        static { this.ID = 'workbench.action.zenShowMultipleEditorTabs'; }
        constructor() {
            const precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */}`, "multiple" /* EditorTabsMode.MULTIPLE */).negate(), contextkeys_2.InEditorZenModeContext);
            const title = (0, nls_1.localize2)('showMultipleEditorTabsZenMode', 'Show Multiple Editor Tabs in Zen Mode');
            super("zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */, "multiple" /* EditorTabsMode.MULTIPLE */, title, ZenShowMultipleEditorTabsAction.ID, precondition);
        }
    }
    exports.ZenShowMultipleEditorTabsAction = ZenShowMultipleEditorTabsAction;
    // --- Show Single Editor Tab
    class ShowSingleEditorTabAction extends AbstractSetShowTabsAction {
        static { this.ID = 'workbench.action.showEditorTab'; }
        constructor() {
            const precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */}`, "single" /* EditorTabsMode.SINGLE */).negate(), contextkeys_2.InEditorZenModeContext.negate());
            const title = (0, nls_1.localize2)('showSingleEditorTab', 'Show Single Editor Tab');
            super("workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */, "single" /* EditorTabsMode.SINGLE */, title, ShowSingleEditorTabAction.ID, precondition);
        }
    }
    exports.ShowSingleEditorTabAction = ShowSingleEditorTabAction;
    class ZenShowSingleEditorTabAction extends AbstractSetShowTabsAction {
        static { this.ID = 'workbench.action.zenShowEditorTab'; }
        constructor() {
            const precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */}`, "single" /* EditorTabsMode.SINGLE */).negate(), contextkeys_2.InEditorZenModeContext);
            const title = (0, nls_1.localize2)('showSingleEditorTabZenMode', 'Show Single Editor Tab in Zen Mode');
            super("zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */, "single" /* EditorTabsMode.SINGLE */, title, ZenShowSingleEditorTabAction.ID, precondition);
        }
    }
    exports.ZenShowSingleEditorTabAction = ZenShowSingleEditorTabAction;
    (0, actions_1.registerAction2)(HideEditorTabsAction);
    (0, actions_1.registerAction2)(ZenHideEditorTabsAction);
    (0, actions_1.registerAction2)(ShowMultipleEditorTabsAction);
    (0, actions_1.registerAction2)(ZenShowMultipleEditorTabsAction);
    (0, actions_1.registerAction2)(ShowSingleEditorTabAction);
    (0, actions_1.registerAction2)(ZenShowSingleEditorTabAction);
    // --- Tab Bar Submenu in View Appearance Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
        submenu: actions_1.MenuId.EditorTabsBarShowTabsSubmenu,
        title: (0, nls_1.localize)('tabBar', "Tab Bar"),
        group: '3_workbench_layout_move',
        order: 10,
        when: contextkeys_2.InEditorZenModeContext.negate()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
        submenu: actions_1.MenuId.EditorTabsBarShowTabsZenModeSubmenu,
        title: (0, nls_1.localize)('tabBar', "Tab Bar"),
        group: '3_workbench_layout_move',
        order: 10,
        when: contextkeys_2.InEditorZenModeContext
    });
    // --- Show Editor Actions in Title Bar
    class EditorActionsTitleBarAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.editorActionsTitleBar'; }
        constructor() {
            super({
                id: EditorActionsTitleBarAction.ID,
                title: {
                    value: (0, nls_1.localize)('moveEditorActionsToTitleBar', "Move Editor Actions to Title Bar"),
                    original: 'Move Editor Actions to Title Bar'
                },
                category: actionCommonCategories_1.Categories.View,
                precondition: contextkey_1.ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */}`, "titleBar" /* EditorActionsLocation.TITLEBAR */).negate(),
                f1: true
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            return configurationService.updateValue("workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */, "titleBar" /* EditorActionsLocation.TITLEBAR */);
        }
    }
    exports.EditorActionsTitleBarAction = EditorActionsTitleBarAction;
    (0, actions_1.registerAction2)(EditorActionsTitleBarAction);
    // --- Editor Actions Default Position
    class EditorActionsDefaultAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.editorActionsDefault'; }
        constructor() {
            super({
                id: EditorActionsDefaultAction.ID,
                title: {
                    value: (0, nls_1.localize)('moveEditorActionsToTabBar', "Move Editor Actions to Tab Bar"),
                    original: 'Move Editor Actions to Tab Bar'
                },
                category: actionCommonCategories_1.Categories.View,
                precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */}`, "default" /* EditorActionsLocation.DEFAULT */).negate(), contextkey_1.ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */}`, "none" /* EditorTabsMode.NONE */).negate()),
                f1: true
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            return configurationService.updateValue("workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */, "default" /* EditorActionsLocation.DEFAULT */);
        }
    }
    exports.EditorActionsDefaultAction = EditorActionsDefaultAction;
    (0, actions_1.registerAction2)(EditorActionsDefaultAction);
    // --- Hide Editor Actions
    class HideEditorActionsAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.hideEditorActions'; }
        constructor() {
            super({
                id: HideEditorActionsAction.ID,
                title: {
                    value: (0, nls_1.localize)('hideEditorActons', "Hide Editor Actions"),
                    original: 'Hide Editor Actions'
                },
                category: actionCommonCategories_1.Categories.View,
                precondition: contextkey_1.ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */}`, "hidden" /* EditorActionsLocation.HIDDEN */).negate(),
                f1: true
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            return configurationService.updateValue("workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */, "hidden" /* EditorActionsLocation.HIDDEN */);
        }
    }
    exports.HideEditorActionsAction = HideEditorActionsAction;
    (0, actions_1.registerAction2)(HideEditorActionsAction);
    // --- Hide Editor Actions
    class ShowEditorActionsAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.showEditorActions'; }
        constructor() {
            super({
                id: ShowEditorActionsAction.ID,
                title: {
                    value: (0, nls_1.localize)('showEditorActons', "Show Editor Actions"),
                    original: 'Show Editor Actions'
                },
                category: actionCommonCategories_1.Categories.View,
                precondition: contextkey_1.ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */}`, "hidden" /* EditorActionsLocation.HIDDEN */),
                f1: true
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            return configurationService.updateValue("workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */, "default" /* EditorActionsLocation.DEFAULT */);
        }
    }
    exports.ShowEditorActionsAction = ShowEditorActionsAction;
    (0, actions_1.registerAction2)(ShowEditorActionsAction);
    // --- Editor Actions Position Submenu in View Appearance Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
        submenu: actions_1.MenuId.EditorActionsPositionSubmenu,
        title: (0, nls_1.localize)('editorActionsPosition', "Editor Actions Position"),
        group: '3_workbench_layout_move',
        order: 11
    });
    // --- Toggle Pinned Tabs On Separate Row
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleSeparatePinnedEditorTabs',
                title: {
                    value: (0, nls_1.localize)('toggleSeparatePinnedEditorTabs', "Separate Pinned Editor Tabs"),
                    original: 'Separate Pinned Editor Tabs'
                },
                category: actionCommonCategories_1.Categories.View,
                precondition: contextkey_1.ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */}`, "multiple" /* EditorTabsMode.MULTIPLE */),
                f1: true
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const oldettingValue = configurationService.getValue('workbench.editor.pinnedTabsOnSeparateRow');
            const newSettingValue = !oldettingValue;
            return configurationService.updateValue('workbench.editor.pinnedTabsOnSeparateRow', newSettingValue);
        }
    });
    // --- Toggle Zen Mode
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleZenMode',
                title: {
                    value: (0, nls_1.localize)('toggleZenMode', "Toggle Zen Mode"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miToggleZenMode', comment: ['&& denotes a mnemonic'] }, "Zen Mode"),
                    original: 'Toggle Zen Mode'
                },
                precondition: contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated(),
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 56 /* KeyCode.KeyZ */)
                },
                toggled: contextkeys_2.InEditorZenModeContext,
                menu: [{
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '1_toggle_view',
                        order: 2
                    }]
            });
        }
        run(accessor) {
            return accessor.get(layoutService_1.IWorkbenchLayoutService).toggleZenMode();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.exitZenMode',
        weight: 100 /* KeybindingWeight.EditorContrib */ - 1000,
        handler(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (contextkeys_2.InEditorZenModeContext.getValue(contextKeyService)) {
                layoutService.toggleZenMode();
            }
        },
        when: contextkeys_2.InEditorZenModeContext,
        primary: (0, keyCodes_1.KeyChord)(9 /* KeyCode.Escape */, 9 /* KeyCode.Escape */)
    });
    // --- Toggle Menu Bar
    if (platform_1.isWindows || platform_1.isLinux || platform_1.isWeb) {
        (0, actions_1.registerAction2)(class ToggleMenubarAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.toggleMenuBar',
                    title: {
                        value: (0, nls_1.localize)('toggleMenuBar', "Toggle Menu Bar"),
                        mnemonicTitle: (0, nls_1.localize)({ key: 'miMenuBar', comment: ['&& denotes a mnemonic'] }, "Menu &&Bar"),
                        original: 'Toggle Menu Bar'
                    },
                    category: actionCommonCategories_1.Categories.View,
                    f1: true,
                    toggled: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsMacNativeContext.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'compact')),
                    menu: [{
                            id: actions_1.MenuId.MenubarAppearanceMenu,
                            group: '2_workbench_layout',
                            order: 0
                        }]
                });
            }
            run(accessor) {
                return accessor.get(layoutService_1.IWorkbenchLayoutService).toggleMenuBar();
            }
        });
        // Add separately to title bar context menu so we can use a different title
        for (const menuId of [actions_1.MenuId.TitleBarContext, actions_1.MenuId.TitleBarTitleContext]) {
            actions_1.MenuRegistry.appendMenuItem(menuId, {
                command: {
                    id: 'workbench.action.toggleMenuBar',
                    title: (0, nls_1.localize)('miMenuBarNoMnemonic', "Menu Bar"),
                    toggled: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsMacNativeContext.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'compact'))
                },
                when: contextkey_1.ContextKeyExpr.and(contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated(), contextkey_1.ContextKeyExpr.notEquals(contextkeys_2.TitleBarStyleContext.key, "native" /* TitlebarStyle.NATIVE */), contextkeys_2.IsMainWindowFullscreenContext.negate()),
                group: '2_config',
                order: 0
            });
        }
    }
    // --- Reset View Locations
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.resetViewLocations',
                title: {
                    value: (0, nls_1.localize)('resetViewLocations', "Reset View Locations"),
                    original: 'Reset View Locations'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            return accessor.get(views_1.IViewDescriptorService).reset();
        }
    });
    // --- Move View
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.moveView',
                title: {
                    value: (0, nls_1.localize)('moveView', "Move View"),
                    original: 'Move View'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        async run(accessor) {
            const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const paneCompositePartService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const focusedViewId = contextkeys_2.FocusedViewContext.getValue(contextKeyService);
            let viewId;
            if (focusedViewId && viewDescriptorService.getViewDescriptorById(focusedViewId)?.canMoveView) {
                viewId = focusedViewId;
            }
            try {
                viewId = await this.getView(quickInputService, viewDescriptorService, paneCompositePartService, viewId);
                if (!viewId) {
                    return;
                }
                const moveFocusedViewAction = new MoveFocusedViewAction();
                instantiationService.invokeFunction(accessor => moveFocusedViewAction.run(accessor, viewId));
            }
            catch { }
        }
        getViewItems(viewDescriptorService, paneCompositePartService) {
            const results = [];
            const viewlets = paneCompositePartService.getVisiblePaneCompositeIds(0 /* ViewContainerLocation.Sidebar */);
            viewlets.forEach(viewletId => {
                const container = viewDescriptorService.getViewContainerById(viewletId);
                const containerModel = viewDescriptorService.getViewContainerModel(container);
                let hasAddedView = false;
                containerModel.visibleViewDescriptors.forEach(viewDescriptor => {
                    if (viewDescriptor.canMoveView) {
                        if (!hasAddedView) {
                            results.push({
                                type: 'separator',
                                label: (0, nls_1.localize)('sidebarContainer', "Side Bar / {0}", containerModel.title)
                            });
                            hasAddedView = true;
                        }
                        results.push({
                            id: viewDescriptor.id,
                            label: viewDescriptor.name.value
                        });
                    }
                });
            });
            const panels = paneCompositePartService.getPinnedPaneCompositeIds(1 /* ViewContainerLocation.Panel */);
            panels.forEach(panel => {
                const container = viewDescriptorService.getViewContainerById(panel);
                const containerModel = viewDescriptorService.getViewContainerModel(container);
                let hasAddedView = false;
                containerModel.visibleViewDescriptors.forEach(viewDescriptor => {
                    if (viewDescriptor.canMoveView) {
                        if (!hasAddedView) {
                            results.push({
                                type: 'separator',
                                label: (0, nls_1.localize)('panelContainer', "Panel / {0}", containerModel.title)
                            });
                            hasAddedView = true;
                        }
                        results.push({
                            id: viewDescriptor.id,
                            label: viewDescriptor.name.value
                        });
                    }
                });
            });
            const sidePanels = paneCompositePartService.getPinnedPaneCompositeIds(2 /* ViewContainerLocation.AuxiliaryBar */);
            sidePanels.forEach(panel => {
                const container = viewDescriptorService.getViewContainerById(panel);
                const containerModel = viewDescriptorService.getViewContainerModel(container);
                let hasAddedView = false;
                containerModel.visibleViewDescriptors.forEach(viewDescriptor => {
                    if (viewDescriptor.canMoveView) {
                        if (!hasAddedView) {
                            results.push({
                                type: 'separator',
                                label: (0, nls_1.localize)('secondarySideBarContainer', "Secondary Side Bar / {0}", containerModel.title)
                            });
                            hasAddedView = true;
                        }
                        results.push({
                            id: viewDescriptor.id,
                            label: viewDescriptor.name.value
                        });
                    }
                });
            });
            return results;
        }
        async getView(quickInputService, viewDescriptorService, paneCompositePartService, viewId) {
            const quickPick = quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)('moveFocusedView.selectView', "Select a View to Move");
            quickPick.items = this.getViewItems(viewDescriptorService, paneCompositePartService);
            quickPick.selectedItems = quickPick.items.filter(item => item.id === viewId);
            return new Promise((resolve, reject) => {
                quickPick.onDidAccept(() => {
                    const viewId = quickPick.selectedItems[0];
                    if (viewId.id) {
                        resolve(viewId.id);
                    }
                    else {
                        reject();
                    }
                    quickPick.hide();
                });
                quickPick.onDidHide(() => reject());
                quickPick.show();
            });
        }
    });
    // --- Move Focused View
    class MoveFocusedViewAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.moveFocusedView',
                title: {
                    value: (0, nls_1.localize)('moveFocusedView', "Move Focused View"),
                    original: 'Move Focused View'
                },
                category: actionCommonCategories_1.Categories.View,
                precondition: contextkeys_2.FocusedViewContext.notEqualsTo(''),
                f1: true
            });
        }
        run(accessor, viewId) {
            const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const paneCompositePartService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const focusedViewId = viewId || contextkeys_2.FocusedViewContext.getValue(contextKeyService);
            if (focusedViewId === undefined || focusedViewId.trim() === '') {
                dialogService.error((0, nls_1.localize)('moveFocusedView.error.noFocusedView', "There is no view currently focused."));
                return;
            }
            const viewDescriptor = viewDescriptorService.getViewDescriptorById(focusedViewId);
            if (!viewDescriptor || !viewDescriptor.canMoveView) {
                dialogService.error((0, nls_1.localize)('moveFocusedView.error.nonMovableView', "The currently focused view is not movable."));
                return;
            }
            const quickPick = quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)('moveFocusedView.selectDestination', "Select a Destination for the View");
            quickPick.title = (0, nls_1.localize)({ key: 'moveFocusedView.title', comment: ['{0} indicates the title of the view the user has selected to move.'] }, "View: Move {0}", viewDescriptor.name.value);
            const items = [];
            const currentContainer = viewDescriptorService.getViewContainerByViewId(focusedViewId);
            const currentLocation = viewDescriptorService.getViewLocationById(focusedViewId);
            const isViewSolo = viewDescriptorService.getViewContainerModel(currentContainer).allViewDescriptors.length === 1;
            if (!(isViewSolo && currentLocation === 1 /* ViewContainerLocation.Panel */)) {
                items.push({
                    id: '_.panel.newcontainer',
                    label: (0, nls_1.localize)({ key: 'moveFocusedView.newContainerInPanel', comment: ['Creates a new top-level tab in the panel.'] }, "New Panel Entry"),
                });
            }
            if (!(isViewSolo && currentLocation === 0 /* ViewContainerLocation.Sidebar */)) {
                items.push({
                    id: '_.sidebar.newcontainer',
                    label: (0, nls_1.localize)('moveFocusedView.newContainerInSidebar', "New Side Bar Entry")
                });
            }
            if (!(isViewSolo && currentLocation === 2 /* ViewContainerLocation.AuxiliaryBar */)) {
                items.push({
                    id: '_.auxiliarybar.newcontainer',
                    label: (0, nls_1.localize)('moveFocusedView.newContainerInSidePanel', "New Secondary Side Bar Entry")
                });
            }
            items.push({
                type: 'separator',
                label: (0, nls_1.localize)('sidebar', "Side Bar")
            });
            const pinnedViewlets = paneCompositePartService.getVisiblePaneCompositeIds(0 /* ViewContainerLocation.Sidebar */);
            items.push(...pinnedViewlets
                .filter(viewletId => {
                if (viewletId === viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
                    return false;
                }
                return !viewDescriptorService.getViewContainerById(viewletId).rejectAddedViews;
            })
                .map(viewletId => {
                return {
                    id: viewletId,
                    label: viewDescriptorService.getViewContainerModel(viewDescriptorService.getViewContainerById(viewletId)).title
                };
            }));
            items.push({
                type: 'separator',
                label: (0, nls_1.localize)('panel', "Panel")
            });
            const pinnedPanels = paneCompositePartService.getPinnedPaneCompositeIds(1 /* ViewContainerLocation.Panel */);
            items.push(...pinnedPanels
                .filter(panel => {
                if (panel === viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
                    return false;
                }
                return !viewDescriptorService.getViewContainerById(panel).rejectAddedViews;
            })
                .map(panel => {
                return {
                    id: panel,
                    label: viewDescriptorService.getViewContainerModel(viewDescriptorService.getViewContainerById(panel)).title
                };
            }));
            items.push({
                type: 'separator',
                label: (0, nls_1.localize)('secondarySideBar', "Secondary Side Bar")
            });
            const pinnedAuxPanels = paneCompositePartService.getPinnedPaneCompositeIds(2 /* ViewContainerLocation.AuxiliaryBar */);
            items.push(...pinnedAuxPanels
                .filter(panel => {
                if (panel === viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
                    return false;
                }
                return !viewDescriptorService.getViewContainerById(panel).rejectAddedViews;
            })
                .map(panel => {
                return {
                    id: panel,
                    label: viewDescriptorService.getViewContainerModel(viewDescriptorService.getViewContainerById(panel)).title
                };
            }));
            quickPick.items = items;
            quickPick.onDidAccept(() => {
                const destination = quickPick.selectedItems[0];
                if (destination.id === '_.panel.newcontainer') {
                    viewDescriptorService.moveViewToLocation(viewDescriptor, 1 /* ViewContainerLocation.Panel */, this.desc.id);
                    viewsService.openView(focusedViewId, true);
                }
                else if (destination.id === '_.sidebar.newcontainer') {
                    viewDescriptorService.moveViewToLocation(viewDescriptor, 0 /* ViewContainerLocation.Sidebar */, this.desc.id);
                    viewsService.openView(focusedViewId, true);
                }
                else if (destination.id === '_.auxiliarybar.newcontainer') {
                    viewDescriptorService.moveViewToLocation(viewDescriptor, 2 /* ViewContainerLocation.AuxiliaryBar */, this.desc.id);
                    viewsService.openView(focusedViewId, true);
                }
                else if (destination.id) {
                    viewDescriptorService.moveViewsToContainer([viewDescriptor], viewDescriptorService.getViewContainerById(destination.id), undefined, this.desc.id);
                    viewsService.openView(focusedViewId, true);
                }
                quickPick.hide();
            });
            quickPick.show();
        }
    }
    (0, actions_1.registerAction2)(MoveFocusedViewAction);
    // --- Reset Focused View Location
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.resetFocusedViewLocation',
                title: {
                    value: (0, nls_1.localize)('resetFocusedViewLocation', "Reset Focused View Location"),
                    original: 'Reset Focused View Location'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                precondition: contextkeys_2.FocusedViewContext.notEqualsTo('')
            });
        }
        run(accessor) {
            const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const focusedViewId = contextkeys_2.FocusedViewContext.getValue(contextKeyService);
            let viewDescriptor = null;
            if (focusedViewId !== undefined && focusedViewId.trim() !== '') {
                viewDescriptor = viewDescriptorService.getViewDescriptorById(focusedViewId);
            }
            if (!viewDescriptor) {
                dialogService.error((0, nls_1.localize)('resetFocusedView.error.noFocusedView', "There is no view currently focused."));
                return;
            }
            const defaultContainer = viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
            if (!defaultContainer || defaultContainer === viewDescriptorService.getViewContainerByViewId(viewDescriptor.id)) {
                return;
            }
            viewDescriptorService.moveViewsToContainer([viewDescriptor], defaultContainer, undefined, this.desc.id);
            viewsService.openView(viewDescriptor.id, true);
        }
    });
    // --- Resize View
    class BaseResizeViewAction extends actions_1.Action2 {
        static { this.RESIZE_INCREMENT = 60; } // This is a css pixel size
        resizePart(widthChange, heightChange, layoutService, partToResize) {
            let part;
            if (partToResize === undefined) {
                const isEditorFocus = layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */);
                const isSidebarFocus = layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                const isPanelFocus = layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */);
                const isAuxiliaryBarFocus = layoutService.hasFocus("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
                if (isSidebarFocus) {
                    part = "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */;
                }
                else if (isPanelFocus) {
                    part = "workbench.parts.panel" /* Parts.PANEL_PART */;
                }
                else if (isEditorFocus) {
                    part = "workbench.parts.editor" /* Parts.EDITOR_PART */;
                }
                else if (isAuxiliaryBarFocus) {
                    part = "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */;
                }
            }
            else {
                part = partToResize;
            }
            if (part) {
                layoutService.resizePart(part, widthChange, heightChange);
            }
        }
    }
    class IncreaseViewSizeAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewSize',
                title: (0, nls_1.localize2)('increaseViewSize', 'Increase Current View Size'),
                f1: true,
                precondition: contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated()
            });
        }
        run(accessor) {
            this.resizePart(BaseResizeViewAction.RESIZE_INCREMENT, BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService));
        }
    }
    class IncreaseViewWidthAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewWidth',
                title: (0, nls_1.localize2)('increaseEditorWidth', 'Increase Editor Width'),
                f1: true,
                precondition: contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated()
            });
        }
        run(accessor) {
            this.resizePart(BaseResizeViewAction.RESIZE_INCREMENT, 0, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    class IncreaseViewHeightAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewHeight',
                title: (0, nls_1.localize2)('increaseEditorHeight', 'Increase Editor Height'),
                f1: true,
                precondition: contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated()
            });
        }
        run(accessor) {
            this.resizePart(0, BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    class DecreaseViewSizeAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewSize',
                title: (0, nls_1.localize2)('decreaseViewSize', 'Decrease Current View Size'),
                f1: true,
                precondition: contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated()
            });
        }
        run(accessor) {
            this.resizePart(-BaseResizeViewAction.RESIZE_INCREMENT, -BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService));
        }
    }
    class DecreaseViewWidthAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewWidth',
                title: (0, nls_1.localize2)('decreaseEditorWidth', 'Decrease Editor Width'),
                f1: true,
                precondition: contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated()
            });
        }
        run(accessor) {
            this.resizePart(-BaseResizeViewAction.RESIZE_INCREMENT, 0, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    class DecreaseViewHeightAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewHeight',
                title: (0, nls_1.localize2)('decreaseEditorHeight', 'Decrease Editor Height'),
                f1: true,
                precondition: contextkeys_2.IsAuxiliaryWindowFocusedContext.toNegated()
            });
        }
        run(accessor) {
            this.resizePart(0, -BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    (0, actions_1.registerAction2)(IncreaseViewSizeAction);
    (0, actions_1.registerAction2)(IncreaseViewWidthAction);
    (0, actions_1.registerAction2)(IncreaseViewHeightAction);
    (0, actions_1.registerAction2)(DecreaseViewSizeAction);
    (0, actions_1.registerAction2)(DecreaseViewWidthAction);
    (0, actions_1.registerAction2)(DecreaseViewHeightAction);
    function isContextualLayoutVisualIcon(icon) {
        return icon.iconA !== undefined;
    }
    const CreateToggleLayoutItem = (id, active, label, visualIcon) => {
        return {
            id,
            active,
            label,
            visualIcon,
            activeIcon: codicons_1.Codicon.eye,
            inactiveIcon: codicons_1.Codicon.eyeClosed,
            activeAriaLabel: (0, nls_1.localize)('selectToHide', "Select to Hide"),
            inactiveAriaLabel: (0, nls_1.localize)('selectToShow', "Select to Show"),
            useButtons: true,
        };
    };
    const CreateOptionLayoutItem = (id, active, label, visualIcon) => {
        return {
            id,
            active,
            label,
            visualIcon,
            activeIcon: codicons_1.Codicon.check,
            activeAriaLabel: (0, nls_1.localize)('active', "Active"),
            useButtons: false
        };
    };
    const MenuBarToggledContext = contextkey_1.ContextKeyExpr.and(contextkeys_1.IsMacNativeContext.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'compact'));
    const ToggleVisibilityActions = [];
    if (!platform_1.isMacintosh || !platform_1.isNative) {
        ToggleVisibilityActions.push(CreateToggleLayoutItem('workbench.action.toggleMenuBar', MenuBarToggledContext, (0, nls_1.localize)('menuBar', "Menu Bar"), menubarIcon));
    }
    ToggleVisibilityActions.push(...[
        CreateToggleLayoutItem(exports.ToggleActivityBarVisibilityActionId, contextkey_1.ContextKeyExpr.notEquals('config.workbench.activityBar.location', 'hidden'), (0, nls_1.localize)('activityBar', "Activity Bar"), { whenA: contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left'), iconA: activityBarLeftIcon, iconB: activityBarRightIcon }),
        CreateToggleLayoutItem(ToggleSidebarVisibilityAction.ID, contextkeys_2.SideBarVisibleContext, (0, nls_1.localize)('sideBar', "Primary Side Bar"), { whenA: contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left'), iconA: panelLeftIcon, iconB: panelRightIcon }),
        CreateToggleLayoutItem(auxiliaryBarActions_1.ToggleAuxiliaryBarAction.ID, contextkeys_2.AuxiliaryBarVisibleContext, (0, nls_1.localize)('secondarySideBar', "Secondary Side Bar"), { whenA: contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left'), iconA: panelRightIcon, iconB: panelLeftIcon }),
        CreateToggleLayoutItem(panelActions_1.TogglePanelAction.ID, contextkeys_2.PanelVisibleContext, (0, nls_1.localize)('panel', "Panel"), panelIcon),
        CreateToggleLayoutItem(ToggleStatusbarVisibilityAction.ID, contextkey_1.ContextKeyExpr.equals('config.workbench.statusBar.visible', true), (0, nls_1.localize)('statusBar', "Status Bar"), statusBarIcon),
    ]);
    const MoveSideBarActions = [
        CreateOptionLayoutItem(MoveSidebarLeftAction.ID, contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left'), (0, nls_1.localize)('leftSideBar', "Left"), panelLeftIcon),
        CreateOptionLayoutItem(MoveSidebarRightAction.ID, contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), (0, nls_1.localize)('rightSideBar', "Right"), panelRightIcon),
    ];
    const AlignPanelActions = [
        CreateOptionLayoutItem('workbench.action.alignPanelLeft', contextkeys_2.PanelAlignmentContext.isEqualTo('left'), (0, nls_1.localize)('leftPanel', "Left"), panelAlignmentLeftIcon),
        CreateOptionLayoutItem('workbench.action.alignPanelRight', contextkeys_2.PanelAlignmentContext.isEqualTo('right'), (0, nls_1.localize)('rightPanel', "Right"), panelAlignmentRightIcon),
        CreateOptionLayoutItem('workbench.action.alignPanelCenter', contextkeys_2.PanelAlignmentContext.isEqualTo('center'), (0, nls_1.localize)('centerPanel', "Center"), panelAlignmentCenterIcon),
        CreateOptionLayoutItem('workbench.action.alignPanelJustify', contextkeys_2.PanelAlignmentContext.isEqualTo('justify'), (0, nls_1.localize)('justifyPanel', "Justify"), panelAlignmentJustifyIcon),
    ];
    const MiscLayoutOptions = [
        CreateOptionLayoutItem('workbench.action.toggleFullScreen', contextkeys_2.IsMainWindowFullscreenContext, (0, nls_1.localize)('fullscreen', "Full Screen"), fullscreenIcon),
        CreateOptionLayoutItem('workbench.action.toggleZenMode', contextkeys_2.InEditorZenModeContext, (0, nls_1.localize)('zenMode', "Zen Mode"), zenModeIcon),
        CreateOptionLayoutItem('workbench.action.toggleCenteredLayout', contextkeys_2.IsCenteredLayoutContext, (0, nls_1.localize)('centeredLayout', "Centered Layout"), centerLayoutIcon),
    ];
    const LayoutContextKeySet = new Set();
    for (const { active } of [...ToggleVisibilityActions, ...MoveSideBarActions, ...AlignPanelActions, ...MiscLayoutOptions]) {
        for (const key of active.keys()) {
            LayoutContextKeySet.add(key);
        }
    }
    (0, actions_1.registerAction2)(class CustomizeLayoutAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.customizeLayout',
                title: { original: 'Customize Layout...', value: (0, nls_1.localize)('customizeLayout', "Customize Layout...") },
                f1: true,
                icon: configureLayoutIcon,
                menu: [
                    {
                        id: actions_1.MenuId.LayoutControlMenuSubmenu,
                        group: 'z_end',
                    },
                    {
                        id: actions_1.MenuId.LayoutControlMenu,
                        when: contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both'),
                        group: 'z_end'
                    }
                ]
            });
        }
        getItems(contextKeyService, keybindingService) {
            const toQuickPickItem = (item) => {
                const toggled = item.active.evaluate(contextKeyService.getContext(null));
                let label = item.useButtons ?
                    item.label :
                    item.label + (toggled && item.activeIcon ? ` $(${item.activeIcon.id})` : (!toggled && item.inactiveIcon ? ` $(${item.inactiveIcon.id})` : ''));
                const ariaLabel = item.label + (toggled && item.activeAriaLabel ? ` (${item.activeAriaLabel})` : (!toggled && item.inactiveAriaLabel ? ` (${item.inactiveAriaLabel})` : ''));
                if (item.visualIcon) {
                    let icon = item.visualIcon;
                    if (isContextualLayoutVisualIcon(icon)) {
                        const useIconA = icon.whenA.evaluate(contextKeyService.getContext(null));
                        icon = useIconA ? icon.iconA : icon.iconB;
                    }
                    label = `$(${icon.id}) ${label}`;
                }
                const icon = toggled ? item.activeIcon : item.inactiveIcon;
                return {
                    type: 'item',
                    id: item.id,
                    label,
                    ariaLabel,
                    keybinding: keybindingService.lookupKeybinding(item.id, contextKeyService),
                    buttons: !item.useButtons ? undefined : [
                        {
                            alwaysVisible: false,
                            tooltip: ariaLabel,
                            iconClass: icon ? themables_1.ThemeIcon.asClassName(icon) : undefined
                        }
                    ]
                };
            };
            return [
                {
                    type: 'separator',
                    label: (0, nls_1.localize)('toggleVisibility', "Visibility")
                },
                ...ToggleVisibilityActions.map(toQuickPickItem),
                {
                    type: 'separator',
                    label: (0, nls_1.localize)('sideBarPosition', "Primary Side Bar Position")
                },
                ...MoveSideBarActions.map(toQuickPickItem),
                {
                    type: 'separator',
                    label: (0, nls_1.localize)('panelAlignment', "Panel Alignment")
                },
                ...AlignPanelActions.map(toQuickPickItem),
                {
                    type: 'separator',
                    label: (0, nls_1.localize)('layoutModes', "Modes"),
                },
                ...MiscLayoutOptions.map(toQuickPickItem),
            ];
        }
        run(accessor) {
            if (this._currentQuickPick) {
                this._currentQuickPick.hide();
                return;
            }
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const commandService = accessor.get(commands_1.ICommandService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const quickPick = quickInputService.createQuickPick();
            this._currentQuickPick = quickPick;
            quickPick.items = this.getItems(contextKeyService, keybindingService);
            quickPick.ignoreFocusOut = true;
            quickPick.hideInput = true;
            quickPick.title = (0, nls_1.localize)('customizeLayoutQuickPickTitle', "Customize Layout");
            const closeButton = {
                alwaysVisible: true,
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close),
                tooltip: (0, nls_1.localize)('close', "Close")
            };
            const resetButton = {
                alwaysVisible: true,
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.discard),
                tooltip: (0, nls_1.localize)('restore defaults', "Restore Defaults")
            };
            quickPick.buttons = [
                resetButton,
                closeButton
            ];
            const disposables = new lifecycle_1.DisposableStore();
            let selectedItem = undefined;
            disposables.add(contextKeyService.onDidChangeContext(changeEvent => {
                if (changeEvent.affectsSome(LayoutContextKeySet)) {
                    quickPick.items = this.getItems(contextKeyService, keybindingService);
                    if (selectedItem) {
                        quickPick.activeItems = quickPick.items.filter(item => item.id === selectedItem?.id);
                    }
                    setTimeout(() => quickInputService.focus(), 0);
                }
            }));
            quickPick.onDidAccept(event => {
                if (quickPick.selectedItems.length) {
                    selectedItem = quickPick.selectedItems[0];
                    commandService.executeCommand(selectedItem.id);
                }
            });
            quickPick.onDidTriggerItemButton(event => {
                if (event.item) {
                    selectedItem = event.item;
                    commandService.executeCommand(selectedItem.id);
                }
            });
            quickPick.onDidTriggerButton((button) => {
                if (button === closeButton) {
                    quickPick.hide();
                }
                else if (button === resetButton) {
                    const resetSetting = (id) => {
                        const config = configurationService.inspect(id);
                        configurationService.updateValue(id, config.defaultValue);
                    };
                    // Reset all layout options
                    resetSetting('workbench.activityBar.location');
                    resetSetting('workbench.sideBar.location');
                    resetSetting('workbench.statusBar.visible');
                    resetSetting('workbench.panel.defaultLocation');
                    if (!platform_1.isMacintosh || !platform_1.isNative) {
                        resetSetting('window.menuBarVisibility');
                    }
                    commandService.executeCommand('workbench.action.alignPanelCenter');
                }
            });
            quickPick.onDidHide(() => {
                quickPick.dispose();
            });
            quickPick.onDispose(() => {
                this._currentQuickPick = undefined;
                disposables.dispose();
            });
            quickPick.show();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvYWN0aW9ucy9sYXlvdXRBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQStCaEcsaUJBQWlCO0lBQ2pCLE1BQU0sV0FBVyxHQUFHLElBQUEsMkJBQVksRUFBQyxTQUFTLEVBQUUsa0JBQU8sQ0FBQyxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQztJQUN2SCxNQUFNLG1CQUFtQixHQUFHLElBQUEsMkJBQVksRUFBQyxtQkFBbUIsRUFBRSxrQkFBTyxDQUFDLHFCQUFxQixFQUFFLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLGtEQUFrRCxDQUFDLENBQUMsQ0FBQztJQUM5SyxNQUFNLG9CQUFvQixHQUFHLElBQUEsMkJBQVksRUFBQyxvQkFBb0IsRUFBRSxrQkFBTyxDQUFDLHNCQUFzQixFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLG1EQUFtRCxDQUFDLENBQUMsQ0FBQztJQUNuTCxNQUFNLGFBQWEsR0FBRyxJQUFBLDJCQUFZLEVBQUMsWUFBWSxFQUFFLGtCQUFPLENBQUMsaUJBQWlCLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLDRDQUE0QyxDQUFDLENBQUMsQ0FBQztJQUNqSixNQUFNLGdCQUFnQixHQUFHLElBQUEsMkJBQVksRUFBQyxnQkFBZ0IsRUFBRSxrQkFBTyxDQUFDLG9CQUFvQixFQUFFLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSx3REFBd0QsQ0FBQyxDQUFDLENBQUM7SUFDMUssTUFBTSxjQUFjLEdBQUcsSUFBQSwyQkFBWSxFQUFDLGFBQWEsRUFBRSxrQkFBTyxDQUFDLGtCQUFrQixFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVks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
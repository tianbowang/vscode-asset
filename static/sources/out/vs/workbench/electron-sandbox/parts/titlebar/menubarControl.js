/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/workspaces/common/workspaces", "vs/base/common/platform", "vs/platform/notification/common/notification", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/label/common/label", "vs/platform/update/common/update", "vs/workbench/browser/parts/titlebar/menubarControl", "vs/platform/storage/common/storage", "vs/platform/menubar/electron-sandbox/menubar", "vs/platform/native/common/native", "vs/workbench/services/host/browser/host", "vs/workbench/services/preferences/common/preferences", "vs/platform/commands/common/commands", "vs/workbench/browser/actions/windowActions", "vs/platform/action/common/action", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, actions_1, actions_2, contextkey_1, workspaces_1, platform_1, notification_1, keybinding_1, environmentService_1, accessibility_1, configuration_1, label_1, update_1, menubarControl_1, storage_1, menubar_1, native_1, host_1, preferences_1, commands_1, windowActions_1, action_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeMenubarControl = void 0;
    let NativeMenubarControl = class NativeMenubarControl extends menubarControl_1.MenubarControl {
        constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, menubarService, hostService, nativeHostService, commandService) {
            super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
            this.menubarService = menubarService;
            this.nativeHostService = nativeHostService;
            (async () => {
                this.recentlyOpened = await this.workspacesService.getRecentlyOpened();
                this.doUpdateMenubar();
            })();
            this.registerListeners();
        }
        setupMainMenu() {
            super.setupMainMenu();
            for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
                const menu = this.menus[topLevelMenuName];
                if (menu) {
                    this.mainMenuDisposables.add(menu.onDidChange(() => this.updateMenubar()));
                }
            }
        }
        doUpdateMenubar() {
            // Since the native menubar is shared between windows (main process)
            // only allow the focused window to update the menubar
            if (!this.hostService.hasFocus) {
                return;
            }
            // Send menus to main process to be rendered by Electron
            const menubarData = { menus: {}, keybindings: {} };
            if (this.getMenubarMenus(menubarData)) {
                this.menubarService.updateMenubar(this.nativeHostService.windowId, menubarData);
            }
        }
        getMenubarMenus(menubarData) {
            if (!menubarData) {
                return false;
            }
            menubarData.keybindings = this.getAdditionalKeybindings();
            for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
                const menu = this.menus[topLevelMenuName];
                if (menu) {
                    const menubarMenu = { items: [] };
                    const menuActions = [];
                    (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, menuActions);
                    this.populateMenuItems(menuActions, menubarMenu, menubarData.keybindings);
                    if (menubarMenu.items.length === 0) {
                        return false; // Menus are incomplete
                    }
                    menubarData.menus[topLevelMenuName] = menubarMenu;
                }
            }
            return true;
        }
        populateMenuItems(menuActions, menuToPopulate, keybindings) {
            for (const menuItem of menuActions) {
                if (menuItem instanceof actions_1.Separator) {
                    menuToPopulate.items.push({ id: 'vscode.menubar.separator' });
                }
                else if (menuItem instanceof actions_2.MenuItemAction || menuItem instanceof actions_2.SubmenuItemAction) {
                    // use mnemonicTitle whenever possible
                    const title = typeof menuItem.item.title === 'string'
                        ? menuItem.item.title
                        : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
                    if (menuItem instanceof actions_2.SubmenuItemAction) {
                        const submenu = { items: [] };
                        this.populateMenuItems(menuItem.actions, submenu, keybindings);
                        if (submenu.items.length > 0) {
                            const menubarSubmenuItem = {
                                id: menuItem.id,
                                label: title,
                                submenu: submenu
                            };
                            menuToPopulate.items.push(menubarSubmenuItem);
                        }
                    }
                    else {
                        if (menuItem.id === windowActions_1.OpenRecentAction.ID) {
                            const actions = this.getOpenRecentActions().map(this.transformOpenRecentAction);
                            menuToPopulate.items.push(...actions);
                        }
                        const menubarMenuItem = {
                            id: menuItem.id,
                            label: title
                        };
                        if ((0, action_1.isICommandActionToggleInfo)(menuItem.item.toggled)) {
                            menubarMenuItem.label = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
                        }
                        if (menuItem.checked) {
                            menubarMenuItem.checked = true;
                        }
                        if (!menuItem.enabled) {
                            menubarMenuItem.enabled = false;
                        }
                        keybindings[menuItem.id] = this.getMenubarKeybinding(menuItem.id);
                        menuToPopulate.items.push(menubarMenuItem);
                    }
                }
            }
        }
        transformOpenRecentAction(action) {
            if (action instanceof actions_1.Separator) {
                return { id: 'vscode.menubar.separator' };
            }
            return {
                id: action.id,
                uri: action.uri,
                remoteAuthority: action.remoteAuthority,
                enabled: action.enabled,
                label: action.label
            };
        }
        getAdditionalKeybindings() {
            const keybindings = {};
            if (platform_1.isMacintosh) {
                const keybinding = this.getMenubarKeybinding('workbench.action.quit');
                if (keybinding) {
                    keybindings['workbench.action.quit'] = keybinding;
                }
            }
            return keybindings;
        }
        getMenubarKeybinding(id) {
            const binding = this.keybindingService.lookupKeybinding(id);
            if (!binding) {
                return undefined;
            }
            // first try to resolve a native accelerator
            const electronAccelerator = binding.getElectronAccelerator();
            if (electronAccelerator) {
                return { label: electronAccelerator, userSettingsLabel: binding.getUserSettingsLabel() ?? undefined };
            }
            // we need this fallback to support keybindings that cannot show in electron menus (e.g. chords)
            const acceleratorLabel = binding.getLabel();
            if (acceleratorLabel) {
                return { label: acceleratorLabel, isNative: false, userSettingsLabel: binding.getUserSettingsLabel() ?? undefined };
            }
            return undefined;
        }
    };
    exports.NativeMenubarControl = NativeMenubarControl;
    exports.NativeMenubarControl = NativeMenubarControl = __decorate([
        __param(0, actions_2.IMenuService),
        __param(1, workspaces_1.IWorkspacesService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, label_1.ILabelService),
        __param(6, update_1.IUpdateService),
        __param(7, storage_1.IStorageService),
        __param(8, notification_1.INotificationService),
        __param(9, preferences_1.IPreferencesService),
        __param(10, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(11, accessibility_1.IAccessibilityService),
        __param(12, menubar_1.IMenubarService),
        __param(13, host_1.IHostService),
        __param(14, native_1.INativeHostService),
        __param(15, commands_1.ICommandService)
    ], NativeMenubarControl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhckNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9lbGVjdHJvbi1zYW5kYm94L3BhcnRzL3RpdGxlYmFyL21lbnViYXJDb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBCekYsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSwrQkFBYztRQUV2RCxZQUNlLFdBQXlCLEVBQ25CLGlCQUFxQyxFQUNyQyxpQkFBcUMsRUFDckMsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUNuRCxZQUEyQixFQUMxQixhQUE2QixFQUM1QixjQUErQixFQUMxQixtQkFBeUMsRUFDMUMsa0JBQXVDLEVBQ3hCLGtCQUFzRCxFQUNuRSxvQkFBMkMsRUFDaEMsY0FBK0IsRUFDbkQsV0FBeUIsRUFDRixpQkFBcUMsRUFDekQsY0FBK0I7WUFFaEQsS0FBSyxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFMN04sbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBRTVCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFLMUUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDWCxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBRXZFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDO1lBRUwsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7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
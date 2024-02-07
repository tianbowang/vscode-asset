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
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/window/common/window", "vs/platform/contextkey/common/contextkey", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/workspaces/common/workspaces", "vs/base/common/async", "vs/platform/label/common/label", "vs/platform/update/common/update", "vs/platform/storage/common/storage", "vs/platform/notification/common/notification", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/environment/common/environmentService", "vs/base/browser/ui/menu/menubar", "vs/base/browser/ui/menu/menu", "vs/base/common/labels", "vs/platform/accessibility/common/accessibility", "vs/base/browser/browser", "vs/workbench/services/host/browser/host", "vs/base/browser/canIUse", "vs/platform/contextkey/common/contextkeys", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/workbench/browser/actions/windowActions", "vs/platform/action/common/action", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/window", "vs/css!./media/menubarControl"], function (require, exports, nls_1, actions_1, window_1, contextkey_1, actions_2, dom_1, keybinding_1, platform_1, configuration_1, event_1, lifecycle_1, workspaces_1, async_1, label_1, update_1, storage_1, notification_1, preferences_1, environmentService_1, menubar_1, menu_1, labels_1, accessibility_1, browser_1, host_1, canIUse_1, contextkeys_1, commands_1, telemetry_1, windowActions_1, action_1, menuEntryActionViewItem_1, defaultStyles_1, window_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomMenubarControl = exports.MenubarControl = void 0;
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarFileMenu,
        title: {
            value: 'File',
            original: 'File',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mFile', comment: ['&& denotes a mnemonic'] }, "&&File"),
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarEditMenu,
        title: {
            value: 'Edit',
            original: 'Edit',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mEdit', comment: ['&& denotes a mnemonic'] }, "&&Edit")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarSelectionMenu,
        title: {
            value: 'Selection',
            original: 'Selection',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mSelection', comment: ['&& denotes a mnemonic'] }, "&&Selection")
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarViewMenu,
        title: {
            value: 'View',
            original: 'View',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mView', comment: ['&& denotes a mnemonic'] }, "&&View")
        },
        order: 4
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarGoMenu,
        title: {
            value: 'Go',
            original: 'Go',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mGoto', comment: ['&& denotes a mnemonic'] }, "&&Go")
        },
        order: 5
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarTerminalMenu,
        title: {
            value: 'Terminal',
            original: 'Terminal',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mTerminal', comment: ['&& denotes a mnemonic'] }, "&&Terminal")
        },
        order: 7
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarHelpMenu,
        title: {
            value: 'Help',
            original: 'Help',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mHelp', comment: ['&& denotes a mnemonic'] }, "&&Help")
        },
        order: 8
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarMainMenu, {
        submenu: actions_1.MenuId.MenubarPreferencesMenu,
        title: {
            value: 'Preferences',
            original: 'Preferences',
            mnemonicTitle: (0, nls_1.localize)({ key: 'mPreferences', comment: ['&& denotes a mnemonic'] }, "Preferences")
        },
        when: contextkeys_1.IsMacNativeContext,
        order: 9
    });
    class MenubarControl extends lifecycle_1.Disposable {
        static { this.MAX_MENU_RECENT_ENTRIES = 10; }
        constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService) {
            super();
            this.menuService = menuService;
            this.workspacesService = workspacesService;
            this.contextKeyService = contextKeyService;
            this.keybindingService = keybindingService;
            this.configurationService = configurationService;
            this.labelService = labelService;
            this.updateService = updateService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.preferencesService = preferencesService;
            this.environmentService = environmentService;
            this.accessibilityService = accessibilityService;
            this.hostService = hostService;
            this.commandService = commandService;
            this.keys = [
                'window.menuBarVisibility',
                'window.enableMenuBarMnemonics',
                'window.customMenuBarAltFocus',
                'workbench.sideBar.location',
                'window.nativeTabs'
            ];
            this.menus = {};
            this.topLevelTitles = {};
            this.recentlyOpened = { files: [], workspaces: [] };
            this.mainMenu = this._register(this.menuService.createMenu(actions_1.MenuId.MenubarMainMenu, this.contextKeyService));
            this.mainMenuDisposables = this._register(new lifecycle_1.DisposableStore());
            this.setupMainMenu();
            this.menuUpdater = this._register(new async_1.RunOnceScheduler(() => this.doUpdateMenubar(false), 200));
            this.notifyUserOfCustomMenubarAccessibility();
        }
        registerListeners() {
            // Listen for window focus changes
            this._register(this.hostService.onDidChangeFocus(e => this.onDidChangeWindowFocus(e)));
            // Update when config changes
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            // Listen to update service
            this.updateService.onStateChange(() => this.onUpdateStateChange());
            // Listen for changes in recently opened menu
            this._register(this.workspacesService.onDidChangeRecentlyOpened(() => { this.onDidChangeRecentlyOpened(); }));
            // Listen to keybindings change
            this._register(this.keybindingService.onDidUpdateKeybindings(() => this.updateMenubar()));
            // Update recent menu items on formatter registration
            this._register(this.labelService.onDidChangeFormatters(() => { this.onDidChangeRecentlyOpened(); }));
            // Listen for changes on the main menu
            this._register(this.mainMenu.onDidChange(() => { this.setupMainMenu(); this.doUpdateMenubar(true); }));
        }
        setupMainMenu() {
            this.mainMenuDisposables.clear();
            this.menus = {};
            this.topLevelTitles = {};
            const [, mainMenuActions] = this.mainMenu.getActions()[0];
            for (const mainMenuAction of mainMenuActions) {
                if (mainMenuAction instanceof actions_1.SubmenuItemAction && typeof mainMenuAction.item.title !== 'string') {
                    this.menus[mainMenuAction.item.title.original] = this.mainMenuDisposables.add(this.menuService.createMenu(mainMenuAction.item.submenu, this.contextKeyService, { emitEventsForSubmenuChanges: true }));
                    this.topLevelTitles[mainMenuAction.item.title.original] = mainMenuAction.item.title.mnemonicTitle ?? mainMenuAction.item.title.value;
                }
            }
        }
        updateMenubar() {
            this.menuUpdater.schedule();
        }
        calculateActionLabel(action) {
            const label = action.label;
            switch (action.id) {
                default:
                    break;
            }
            return label;
        }
        onUpdateStateChange() {
            this.updateMenubar();
        }
        onUpdateKeybindings() {
            this.updateMenubar();
        }
        getOpenRecentActions() {
            if (!this.recentlyOpened) {
                return [];
            }
            const { workspaces, files } = this.recentlyOpened;
            const result = [];
            if (workspaces.length > 0) {
                for (let i = 0; i < MenubarControl.MAX_MENU_RECENT_ENTRIES && i < workspaces.length; i++) {
                    result.push(this.createOpenRecentMenuAction(workspaces[i]));
                }
                result.push(new actions_2.Separator());
            }
            if (files.length > 0) {
                for (let i = 0; i < MenubarControl.MAX_MENU_RECENT_ENTRIES && i < files.length; i++) {
                    result.push(this.createOpenRecentMenuAction(files[i]));
                }
                result.push(new actions_2.Separator());
            }
            return result;
        }
        onDidChangeWindowFocus(hasFocus) {
            // When we regain focus, update the recent menu items
            if (hasFocus) {
                this.onDidChangeRecentlyOpened();
            }
        }
        onConfigurationUpdated(event) {
            if (this.keys.some(key => event.affectsConfiguration(key))) {
                this.updateMenubar();
            }
            if (event.affectsConfiguration('editor.accessibilitySupport')) {
                this.notifyUserOfCustomMenubarAccessibility();
            }
            // Since we try not update when hidden, we should
            // try to update the recently opened list on visibility changes
            if (event.affectsConfiguration('window.menuBarVisibility')) {
                this.onDidChangeRecentlyOpened();
            }
        }
        get menubarHidden() {
            return platform_1.isMacintosh && platform_1.isNative ? false : (0, window_1.getMenuBarVisibility)(this.configurationService) === 'hidden';
        }
        onDidChangeRecentlyOpened() {
            // Do not update recently opened when the menubar is hidden #108712
            if (!this.menubarHidden) {
                this.workspacesService.getRecentlyOpened().then(recentlyOpened => {
                    this.recentlyOpened = recentlyOpened;
                    this.updateMenubar();
                });
            }
        }
        createOpenRecentMenuAction(recent) {
            let label;
            let uri;
            let commandId;
            let openable;
            const remoteAuthority = recent.remoteAuthority;
            if ((0, workspaces_1.isRecentFolder)(recent)) {
                uri = recent.folderUri;
                label = recent.label || this.labelService.getWorkspaceLabel(uri, { verbose: 2 /* Verbosity.LONG */ });
                commandId = 'openRecentFolder';
                openable = { folderUri: uri };
            }
            else if ((0, workspaces_1.isRecentWorkspace)(recent)) {
                uri = recent.workspace.configPath;
                label = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 /* Verbosity.LONG */ });
                commandId = 'openRecentWorkspace';
                openable = { workspaceUri: uri };
            }
            else {
                uri = recent.fileUri;
                label = recent.label || this.labelService.getUriLabel(uri);
                commandId = 'openRecentFile';
                openable = { fileUri: uri };
            }
            const ret = (0, actions_2.toAction)({
                id: commandId, label: (0, labels_1.unmnemonicLabel)(label), run: (browserEvent) => {
                    const openInNewWindow = browserEvent && ((!platform_1.isMacintosh && (browserEvent.ctrlKey || browserEvent.shiftKey)) || (platform_1.isMacintosh && (browserEvent.metaKey || browserEvent.altKey)));
                    return this.hostService.openWindow([openable], {
                        forceNewWindow: !!openInNewWindow,
                        remoteAuthority: remoteAuthority || null // local window if remoteAuthority is not set or can not be deducted from the openable
                    });
                }
            });
            return Object.assign(ret, { uri, remoteAuthority });
        }
        notifyUserOfCustomMenubarAccessibility() {
            if (platform_1.isWeb || platform_1.isMacintosh) {
                return;
            }
            const hasBeenNotified = this.storageService.getBoolean('menubar/accessibleMenubarNotified', -1 /* StorageScope.APPLICATION */, false);
            const usingCustomMenubar = !(0, window_1.hasNativeTitlebar)(this.configurationService);
            if (hasBeenNotified || usingCustomMenubar || !this.accessibilityService.isScreenReaderOptimized()) {
                return;
            }
            const message = (0, nls_1.localize)('menubar.customTitlebarAccessibilityNotification', "Accessibility support is enabled for you. For the most accessible experience, we recommend the custom title bar style.");
            this.notificationService.prompt(notification_1.Severity.Info, message, [
                {
                    label: (0, nls_1.localize)('goToSetting', "Open Settings"),
                    run: () => {
                        return this.preferencesService.openUserSettings({ query: "window.titleBarStyle" /* TitleBarSetting.TITLE_BAR_STYLE */ });
                    }
                }
            ]);
            this.storageService.store('menubar/accessibleMenubarNotified', true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
    }
    exports.MenubarControl = MenubarControl;
    let CustomMenubarControl = class CustomMenubarControl extends MenubarControl {
        constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, telemetryService, hostService, commandService) {
            super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
            this.telemetryService = telemetryService;
            this.alwaysOnMnemonics = false;
            this.focusInsideMenubar = false;
            this.pendingFirstTimeUpdate = false;
            this.visible = true;
            this.webNavigationMenu = this._register(this.menuService.createMenu(actions_1.MenuId.MenubarHomeMenu, this.contextKeyService));
            this.reinstallDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onVisibilityChange = this._register(new event_1.Emitter());
            this._onFocusStateChange = this._register(new event_1.Emitter());
            this.actionRunner = this._register(new actions_2.ActionRunner());
            this.actionRunner.onDidRun(e => {
                this.telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'menu' });
            });
            this.workspacesService.getRecentlyOpened().then((recentlyOpened) => {
                this.recentlyOpened = recentlyOpened;
            });
            this.registerListeners();
            this.registerActions();
        }
        doUpdateMenubar(firstTime) {
            if (!this.focusInsideMenubar) {
                this.setupCustomMenubar(firstTime);
            }
            if (firstTime) {
                this.pendingFirstTimeUpdate = true;
            }
        }
        registerActions() {
            const that = this;
            if (platform_1.isWeb) {
                this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: `workbench.actions.menubar.focus`,
                            title: (0, nls_1.localize2)('focusMenu', 'Focus Application Menu'),
                            keybinding: {
                                primary: 512 /* KeyMod.Alt */ | 68 /* KeyCode.F10 */,
                                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                                when: contextkeys_1.IsWebContext
                            },
                            f1: true
                        });
                    }
                    async run() {
                        that.menubar?.toggleFocus();
                    }
                }));
            }
        }
        getUpdateAction() {
            const state = this.updateService.state;
            switch (state.type) {
                case "idle" /* StateType.Idle */:
                    return new actions_2.Action('update.check', (0, nls_1.localize)({ key: 'checkForUpdates', comment: ['&& denotes a mnemonic'] }, "Check for &&Updates..."), undefined, true, () => this.updateService.checkForUpdates(true));
                case "checking for updates" /* StateType.CheckingForUpdates */:
                    return new actions_2.Action('update.checking', (0, nls_1.localize)('checkingForUpdates', "Checking for Updates..."), undefined, false);
                case "available for download" /* StateType.AvailableForDownload */:
                    return new actions_2.Action('update.downloadNow', (0, nls_1.localize)({ key: 'download now', comment: ['&& denotes a mnemonic'] }, "D&&ownload Update"), undefined, true, () => this.updateService.downloadUpdate());
                case "downloading" /* StateType.Downloading */:
                    return new actions_2.Action('update.downloading', (0, nls_1.localize)('DownloadingUpdate', "Downloading Update..."), undefined, false);
                case "downloaded" /* StateType.Downloaded */:
                    return new actions_2.Action('update.install', (0, nls_1.localize)({ key: 'installUpdate...', comment: ['&& denotes a mnemonic'] }, "Install &&Update..."), undefined, true, () => this.updateService.applyUpdate());
                case "updating" /* StateType.Updating */:
                    return new actions_2.Action('update.updating', (0, nls_1.localize)('installingUpdate', "Installing Update..."), undefined, false);
                case "ready" /* StateType.Ready */:
                    return new actions_2.Action('update.restart', (0, nls_1.localize)({ key: 'restartToUpdate', comment: ['&& denotes a mnemonic'] }, "Restart to &&Update"), undefined, true, () => this.updateService.quitAndInstall());
                default:
                    return null;
            }
        }
        get currentMenubarVisibility() {
            return (0, window_1.getMenuBarVisibility)(this.configurationService);
        }
        get currentDisableMenuBarAltFocus() {
            const settingValue = this.configurationService.getValue('window.customMenuBarAltFocus');
            let disableMenuBarAltBehavior = false;
            if (typeof settingValue === 'boolean') {
                disableMenuBarAltBehavior = !settingValue;
            }
            return disableMenuBarAltBehavior;
        }
        insertActionsBefore(nextAction, target) {
            switch (nextAction.id) {
                case windowActions_1.OpenRecentAction.ID:
                    target.push(...this.getOpenRecentActions());
                    break;
                case 'workbench.action.showAboutDialog':
                    if (!platform_1.isMacintosh && !platform_1.isWeb) {
                        const updateAction = this.getUpdateAction();
                        if (updateAction) {
                            updateAction.label = (0, labels_1.mnemonicMenuLabel)(updateAction.label);
                            target.push(updateAction);
                            target.push(new actions_2.Separator());
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        get currentEnableMenuBarMnemonics() {
            let enableMenuBarMnemonics = this.configurationService.getValue('window.enableMenuBarMnemonics');
            if (typeof enableMenuBarMnemonics !== 'boolean') {
                enableMenuBarMnemonics = true;
            }
            return enableMenuBarMnemonics && (!platform_1.isWeb || (0, browser_1.isFullscreen)(window_2.mainWindow));
        }
        get currentCompactMenuMode() {
            if (this.currentMenubarVisibility !== 'compact') {
                return undefined;
            }
            // Menu bar lives in activity bar and should flow based on its location
            const currentSidebarLocation = this.configurationService.getValue('workbench.sideBar.location');
            return currentSidebarLocation === 'right' ? menu_1.Direction.Left : menu_1.Direction.Right;
        }
        onDidVisibilityChange(visible) {
            this.visible = visible;
            this.onDidChangeRecentlyOpened();
            this._onVisibilityChange.fire(visible);
        }
        toActionsArray(menu) {
            const result = [];
            (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, result);
            return result;
        }
        setupCustomMenubar(firstTime) {
            // If there is no container, we cannot setup the menubar
            if (!this.container) {
                return;
            }
            if (firstTime) {
                // Reset and create new menubar
                if (this.menubar) {
                    this.reinstallDisposables.clear();
                }
                this.menubar = this.reinstallDisposables.add(new menubar_1.MenuBar(this.container, this.getMenuBarOptions(), defaultStyles_1.defaultMenuStyles));
                this.accessibilityService.alwaysUnderlineAccessKeys().then(val => {
                    this.alwaysOnMnemonics = val;
                    this.menubar?.update(this.getMenuBarOptions());
                });
                this.reinstallDisposables.add(this.menubar.onFocusStateChange(focused => {
                    this._onFocusStateChange.fire(focused);
                    // When the menubar loses focus, update it to clear any pending updates
                    if (!focused) {
                        if (this.pendingFirstTimeUpdate) {
                            this.setupCustomMenubar(true);
                            this.pendingFirstTimeUpdate = false;
                        }
                        else {
                            this.updateMenubar();
                        }
                        this.focusInsideMenubar = false;
                    }
                }));
                this.reinstallDisposables.add(this.menubar.onVisibilityChange(e => this.onDidVisibilityChange(e)));
                // Before we focus the menubar, stop updates to it so that focus-related context keys will work
                this.reinstallDisposables.add((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.FOCUS_IN, () => {
                    this.focusInsideMenubar = true;
                }));
                this.reinstallDisposables.add((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.FOCUS_OUT, () => {
                    this.focusInsideMenubar = false;
                }));
                // Fire visibility change for the first install if menu is shown
                if (this.menubar.isVisible) {
                    this.onDidVisibilityChange(true);
                }
            }
            else {
                this.menubar?.update(this.getMenuBarOptions());
            }
            // Update the menu actions
            const updateActions = (menuActions, target, topLevelTitle) => {
                target.splice(0);
                for (const menuItem of menuActions) {
                    this.insertActionsBefore(menuItem, target);
                    if (menuItem instanceof actions_2.Separator) {
                        target.push(menuItem);
                    }
                    else if (menuItem instanceof actions_1.SubmenuItemAction || menuItem instanceof actions_1.MenuItemAction) {
                        // use mnemonicTitle whenever possible
                        let title = typeof menuItem.item.title === 'string'
                            ? menuItem.item.title
                            : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
                        if (menuItem instanceof actions_1.SubmenuItemAction) {
                            const submenuActions = [];
                            updateActions(menuItem.actions, submenuActions, topLevelTitle);
                            if (submenuActions.length > 0) {
                                target.push(new actions_2.SubmenuAction(menuItem.id, (0, labels_1.mnemonicMenuLabel)(title), submenuActions));
                            }
                        }
                        else {
                            if ((0, action_1.isICommandActionToggleInfo)(menuItem.item.toggled)) {
                                title = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
                            }
                            const newAction = new actions_2.Action(menuItem.id, (0, labels_1.mnemonicMenuLabel)(title), menuItem.class, menuItem.enabled, () => this.commandService.executeCommand(menuItem.id));
                            newAction.tooltip = menuItem.tooltip;
                            newAction.checked = menuItem.checked;
                            target.push(newAction);
                        }
                    }
                }
                // Append web navigation menu items to the file menu when not compact
                if (topLevelTitle === 'File' && this.currentCompactMenuMode === undefined) {
                    const webActions = this.getWebNavigationActions();
                    if (webActions.length) {
                        target.push(...webActions);
                    }
                }
            };
            for (const title of Object.keys(this.topLevelTitles)) {
                const menu = this.menus[title];
                if (firstTime && menu) {
                    this.reinstallDisposables.add(menu.onDidChange(() => {
                        if (!this.focusInsideMenubar) {
                            const actions = [];
                            updateActions(this.toActionsArray(menu), actions, title);
                            this.menubar?.updateMenu({ actions: actions, label: (0, labels_1.mnemonicMenuLabel)(this.topLevelTitles[title]) });
                        }
                    }));
                    // For the file menu, we need to update if the web nav menu updates as well
                    if (menu === this.menus.File) {
                        this.reinstallDisposables.add(this.webNavigationMenu.onDidChange(() => {
                            if (!this.focusInsideMenubar) {
                                const actions = [];
                                updateActions(this.toActionsArray(menu), actions, title);
                                this.menubar?.updateMenu({ actions: actions, label: (0, labels_1.mnemonicMenuLabel)(this.topLevelTitles[title]) });
                            }
                        }));
                    }
                }
                const actions = [];
                if (menu) {
                    updateActions(this.toActionsArray(menu), actions, title);
                }
                if (this.menubar) {
                    if (!firstTime) {
                        this.menubar.updateMenu({ actions: actions, label: (0, labels_1.mnemonicMenuLabel)(this.topLevelTitles[title]) });
                    }
                    else {
                        this.menubar.push({ actions: actions, label: (0, labels_1.mnemonicMenuLabel)(this.topLevelTitles[title]) });
                    }
                }
            }
        }
        getWebNavigationActions() {
            if (!platform_1.isWeb) {
                return []; // only for web
            }
            const webNavigationActions = [];
            for (const groups of this.webNavigationMenu.getActions()) {
                const [, actions] = groups;
                for (const action of actions) {
                    if (action instanceof actions_1.MenuItemAction) {
                        const title = typeof action.item.title === 'string'
                            ? action.item.title
                            : action.item.title.mnemonicTitle ?? action.item.title.value;
                        webNavigationActions.push(new actions_2.Action(action.id, (0, labels_1.mnemonicMenuLabel)(title), action.class, action.enabled, async (event) => {
                            this.commandService.executeCommand(action.id, event);
                        }));
                    }
                }
                webNavigationActions.push(new actions_2.Separator());
            }
            if (webNavigationActions.length) {
                webNavigationActions.pop();
            }
            return webNavigationActions;
        }
        getMenuBarOptions() {
            return {
                enableMnemonics: this.currentEnableMenuBarMnemonics,
                disableAltFocus: this.currentDisableMenuBarAltFocus,
                visibility: this.currentMenubarVisibility,
                actionRunner: this.actionRunner,
                getKeybinding: (action) => this.keybindingService.lookupKeybinding(action.id),
                alwaysOnMnemonics: this.alwaysOnMnemonics,
                compactMode: this.currentCompactMenuMode,
                getCompactMenuActions: () => {
                    if (!platform_1.isWeb) {
                        return []; // only for web
                    }
                    return this.getWebNavigationActions();
                }
            };
        }
        onDidChangeWindowFocus(hasFocus) {
            if (!this.visible) {
                return;
            }
            super.onDidChangeWindowFocus(hasFocus);
            if (this.container) {
                if (hasFocus) {
                    this.container.classList.remove('inactive');
                }
                else {
                    this.container.classList.add('inactive');
                    this.menubar?.blur();
                }
            }
        }
        onUpdateStateChange() {
            if (!this.visible) {
                return;
            }
            super.onUpdateStateChange();
        }
        onDidChangeRecentlyOpened() {
            if (!this.visible) {
                return;
            }
            super.onDidChangeRecentlyOpened();
        }
        onUpdateKeybindings() {
            if (!this.visible) {
                return;
            }
            super.onUpdateKeybindings();
        }
        registerListeners() {
            super.registerListeners();
            this._register((0, dom_1.addDisposableListener)(window_2.mainWindow, dom_1.EventType.RESIZE, () => {
                if (this.menubar && !(platform_1.isIOS && canIUse_1.BrowserFeatures.pointerEvents)) {
                    this.menubar.blur();
                }
            }));
            // Mnemonics require fullscreen in web
            if (platform_1.isWeb) {
                this._register((0, browser_1.onDidChangeFullscreen)(windowId => {
                    if (windowId === window_2.mainWindow.vscodeWindowId) {
                        this.updateMenubar();
                    }
                }));
                this._register(this.webNavigationMenu.onDidChange(() => this.updateMenubar()));
            }
        }
        get onVisibilityChange() {
            return this._onVisibilityChange.event;
        }
        get onFocusStateChange() {
            return this._onFocusStateChange.event;
        }
        getMenubarItemsDimensions() {
            if (this.menubar) {
                return new dom_1.Dimension(this.menubar.getWidth(), this.menubar.getHeight());
            }
            return new dom_1.Dimension(0, 0);
        }
        create(parent) {
            this.container = parent;
            // Build the menubar
            if (this.container) {
                this.doUpdateMenubar(true);
            }
            return this.container;
        }
        layout(dimension) {
            this.menubar?.update(this.getMenuBarOptions());
        }
        toggleFocus() {
            this.menubar?.toggleFocus();
        }
    };
    exports.CustomMenubarControl = CustomMenubarControl;
    exports.CustomMenubarControl = CustomMenubarControl = __decorate([
        __param(0, actions_1.IMenuService),
        __param(1, workspaces_1.IWorkspacesService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, label_1.ILabelService),
        __param(6, update_1.IUpdateService),
        __param(7, storage_1.IStorageService),
        __param(8, notification_1.INotificationService),
        __param(9, preferences_1.IPreferencesService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, accessibility_1.IAccessibilityService),
        __param(12, telemetry_1.ITelemetryService),
        __param(13, host_1.IHostService),
        __param(14, commands_1.ICommandService)
    ], CustomMenubarControl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhckNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3RpdGxlYmFyL21lbnViYXJDb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTJDaEcsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxlQUFlLEVBQUU7UUFDbkQsT0FBTyxFQUFFLGdCQUFNLENBQUMsZUFBZTtRQUMvQixLQUFLLEVBQUU7WUFDTixLQUFLLEVBQUUsTUFBTTtZQUNiLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQztTQUN2RjtRQUNELEtBQUssRUFBRSxDQUFDO0tBQ1IsQ0FBQyxDQUFDO0lBRUgsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxlQUFlLEVBQUU7UUFDbkQsT0FBTyxFQUFFLGdCQUFNLENBQUMsZUFBZTtRQUMvQixLQUFLLEVBQUU7WUFDTixLQUFLLEVBQUUsTUFBTTtZQUNiLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQztTQUN2RjtRQUNELEtBQUssRUFBRSxDQUFDO0tBQ1IsQ0FBQyxDQUFDO0lBRUgsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxlQUFlLEVBQUU7UUFDbkQsT0FBTyxFQUFFLGdCQUFNLENBQUMsb0JBQW9CO1FBQ3BDLEtBQUssRUFBRTtZQUNOLEtBQUssRUFBRSxXQUFXO1lBQ2xCLFFB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
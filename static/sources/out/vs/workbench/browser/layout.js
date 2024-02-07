/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/dom", "vs/base/browser/browser", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/platform", "vs/workbench/common/editor", "vs/workbench/browser/parts/sidebar/sidebarPart", "vs/workbench/browser/parts/panel/panelPart", "vs/workbench/services/layout/browser/layoutService", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/workbench/services/title/browser/titleService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/window/common/window", "vs/workbench/services/host/browser/host", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/ui/grid/grid", "vs/workbench/browser/part", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/files/common/files", "vs/editor/browser/editorBrowser", "vs/base/common/arrays", "vs/base/common/types", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/base/common/uri", "vs/workbench/common/views", "vs/workbench/common/editor/diffEditorInput", "vs/base/common/performance", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/base/common/async", "vs/workbench/services/banner/browser/bannerService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService", "vs/base/browser/window"], function (require, exports, lifecycle_1, event_1, dom_1, browser_1, workingCopyBackup_1, platform_1, editor_1, sidebarPart_1, panelPart_1, layoutService_1, workspace_1, storage_1, configuration_1, titleService_1, lifecycle_2, window_1, host_1, environmentService_1, editorService_1, editorGroupsService_1, grid_1, part_1, statusbar_1, files_1, editorBrowser_1, arrays_1, types_1, notification_1, themeService_1, theme_1, uri_1, views_1, diffEditorInput_1, performance_1, extensions_1, log_1, async_1, bannerService_1, panecomposite_1, auxiliaryBarPart_1, telemetry_1, auxiliaryWindowService_1, window_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Layout = void 0;
    var LayoutClasses;
    (function (LayoutClasses) {
        LayoutClasses["SIDEBAR_HIDDEN"] = "nosidebar";
        LayoutClasses["MAIN_EDITOR_AREA_HIDDEN"] = "nomaineditorarea";
        LayoutClasses["PANEL_HIDDEN"] = "nopanel";
        LayoutClasses["AUXILIARYBAR_HIDDEN"] = "noauxiliarybar";
        LayoutClasses["STATUSBAR_HIDDEN"] = "nostatusbar";
        LayoutClasses["FULLSCREEN"] = "fullscreen";
        LayoutClasses["MAXIMIZED"] = "maximized";
        LayoutClasses["WINDOW_BORDER"] = "border";
    })(LayoutClasses || (LayoutClasses = {}));
    class Layout extends lifecycle_1.Disposable {
        get activeContainer() { return this.getContainerFromDocument((0, dom_1.getActiveDocument)()); }
        get containers() {
            const containers = [];
            for (const { window } of (0, dom_1.getWindows)()) {
                containers.push(this.getContainerFromDocument(window.document));
            }
            return containers;
        }
        getContainerFromDocument(targetDocument) {
            if (targetDocument === this.mainContainer.ownerDocument) {
                // main window
                return this.mainContainer;
            }
            else {
                // auxiliary window
                return targetDocument.body.getElementsByClassName('monaco-workbench')[0];
            }
        }
        get mainContainerDimension() { return this._mainContainerDimension; }
        get activeContainerDimension() {
            return this.getContainerDimension(this.activeContainer);
        }
        getContainerDimension(container) {
            if (container === this.mainContainer) {
                // main window
                return this.mainContainerDimension;
            }
            else {
                // auxiliary window
                return (0, dom_1.getClientArea)(container);
            }
        }
        get mainContainerOffset() {
            return this.computeContainerOffset(window_2.mainWindow);
        }
        get activeContainerOffset() {
            return this.computeContainerOffset((0, dom_1.getWindow)(this.activeContainer));
        }
        get whenActiveContainerStylesLoaded() {
            const active = this.activeContainer;
            return this.auxWindowStylesLoaded.get(active) || Promise.resolve();
        }
        computeContainerOffset(targetWindow) {
            let top = 0;
            let quickPickTop = 0;
            if (this.isVisible("workbench.parts.banner" /* Parts.BANNER_PART */)) {
                top = this.getPart("workbench.parts.banner" /* Parts.BANNER_PART */).maximumHeight;
                quickPickTop = top;
            }
            const titlebarVisible = this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, targetWindow);
            if (titlebarVisible) {
                top += this.getPart("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */).maximumHeight;
                quickPickTop = top;
            }
            const isCommandCenterVisible = titlebarVisible && this.configurationService.getValue("window.commandCenter" /* LayoutSettings.COMMAND_CENTER */) !== false;
            if (isCommandCenterVisible) {
                // If the command center is visible then the quickinput
                // should go over the title bar and the banner
                quickPickTop = 6;
            }
            return { top, quickPickTop };
        }
        constructor(parent) {
            super();
            this.parent = parent;
            //#region Events
            this._onDidChangeZenMode = this._register(new event_1.Emitter());
            this.onDidChangeZenMode = this._onDidChangeZenMode.event;
            this._onDidChangeCenteredLayout = this._register(new event_1.Emitter());
            this.onDidChangeCenteredLayout = this._onDidChangeCenteredLayout.event;
            this._onDidChangePanelAlignment = this._register(new event_1.Emitter());
            this.onDidChangePanelAlignment = this._onDidChangePanelAlignment.event;
            this._onDidChangeWindowMaximized = this._register(new event_1.Emitter());
            this.onDidChangeWindowMaximized = this._onDidChangeWindowMaximized.event;
            this._onDidChangePanelPosition = this._register(new event_1.Emitter());
            this.onDidChangePanelPosition = this._onDidChangePanelPosition.event;
            this._onDidChangePartVisibility = this._register(new event_1.Emitter());
            this.onDidChangePartVisibility = this._onDidChangePartVisibility.event;
            this._onDidChangeNotificationsVisibility = this._register(new event_1.Emitter());
            this.onDidChangeNotificationsVisibility = this._onDidChangeNotificationsVisibility.event;
            this._onDidLayoutMainContainer = this._register(new event_1.Emitter());
            this.onDidLayoutMainContainer = this._onDidLayoutMainContainer.event;
            this._onDidLayoutActiveContainer = this._register(new event_1.Emitter());
            this.onDidLayoutActiveContainer = this._onDidLayoutActiveContainer.event;
            this._onDidLayoutContainer = this._register(new event_1.Emitter());
            this.onDidLayoutContainer = this._onDidLayoutContainer.event;
            this._onDidAddContainer = this._register(new event_1.Emitter());
            this.onDidAddContainer = this._onDidAddContainer.event;
            this._onDidChangeActiveContainer = this._register(new event_1.Emitter());
            this.onDidChangeActiveContainer = this._onDidChangeActiveContainer.event;
            //#endregion
            //#region Properties
            this.mainContainer = document.createElement('div');
            //#endregion
            this.parts = new Map();
            this.auxWindowStylesLoaded = new Map();
            this.initialized = false;
            this.disposed = false;
            this._openedDefaultEditors = false;
            this.whenReadyPromise = new async_1.DeferredPromise();
            this.whenReady = this.whenReadyPromise.p;
            this.whenRestoredPromise = new async_1.DeferredPromise();
            this.whenRestored = this.whenRestoredPromise.p;
            this.restored = false;
        }
        initLayout(accessor) {
            // Services
            this.environmentService = accessor.get(environmentService_1.IBrowserWorkbenchEnvironmentService);
            this.configurationService = accessor.get(configuration_1.IConfigurationService);
            this.hostService = accessor.get(host_1.IHostService);
            this.contextService = accessor.get(workspace_1.IWorkspaceContextService);
            this.storageService = accessor.get(storage_1.IStorageService);
            this.workingCopyBackupService = accessor.get(workingCopyBackup_1.IWorkingCopyBackupService);
            this.themeService = accessor.get(themeService_1.IThemeService);
            this.extensionService = accessor.get(extensions_1.IExtensionService);
            this.logService = accessor.get(log_1.ILogService);
            this.telemetryService = accessor.get(telemetry_1.ITelemetryService);
            this.auxiliaryWindowService = accessor.get(auxiliaryWindowService_1.IAuxiliaryWindowService);
            // Parts
            this.editorService = accessor.get(editorService_1.IEditorService);
            this.mainPartEditorService = this.editorService.createScoped('main', this._store);
            this.editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            this.paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            this.viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            this.titleService = accessor.get(titleService_1.ITitleService);
            this.notificationService = accessor.get(notification_1.INotificationService);
            this.statusBarService = accessor.get(statusbar_1.IStatusbarService);
            accessor.get(bannerService_1.IBannerService);
            // Listeners
            this.registerLayoutListeners();
            // State
            this.initLayoutState(accessor.get(lifecycle_2.ILifecycleService), accessor.get(files_1.IFileService));
        }
        registerLayoutListeners() {
            // Restore editor if hidden
            const showEditorIfHidden = () => {
                if (!this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */, window_2.mainWindow)) {
                    this.toggleMaximizedPanel();
                }
            };
            // Wait to register these listeners after the editor group service
            // is ready to avoid conflicts on startup
            this.editorGroupService.whenRestored.then(() => {
                // Restore main editor part on any editor change in main part
                this._register(this.mainPartEditorService.onDidVisibleEditorsChange(showEditorIfHidden));
                this._register(this.editorGroupService.mainPart.onDidActivateGroup(showEditorIfHidden));
                // Revalidate center layout when active editor changes: diff editor quits centered mode.
                this._register(this.mainPartEditorService.onDidActiveEditorChange(() => this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            });
            // Configuration changes
            this._register(this.configurationService.onDidChangeConfiguration((e) => {
                if ([
                    "workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */,
                    "window.commandCenter" /* LayoutSettings.COMMAND_CENTER */,
                    "workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */,
                    "workbench.layoutControl.enabled" /* LayoutSettings.LAYOUT_ACTIONS */,
                    LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION,
                    LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE,
                    'window.menuBarVisibility',
                    "window.titleBarStyle" /* TitleBarSetting.TITLE_BAR_STYLE */,
                    "window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */,
                ].some(setting => e.affectsConfiguration(setting))) {
                    // Show Custom TitleBar if actions moved to the titlebar
                    const activityBarMovedToTop = e.affectsConfiguration("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) && this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) === "top" /* ActivityBarPosition.TOP */;
                    const editorActionsMovedToTitlebar = e.affectsConfiguration("workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */) && this.configurationService.getValue("workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */) === "titleBar" /* EditorActionsLocation.TITLEBAR */;
                    if (activityBarMovedToTop || editorActionsMovedToTitlebar) {
                        if (this.configurationService.getValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */) === "never" /* CustomTitleBarVisibility.NEVER */) {
                            this.configurationService.updateValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */, "auto" /* CustomTitleBarVisibility.AUTO */);
                        }
                    }
                    this.doUpdateLayoutConfiguration();
                }
            }));
            // Fullscreen changes
            this._register((0, browser_1.onDidChangeFullscreen)(windowId => this.onFullscreenChanged(windowId)));
            // Group changes
            this._register(this.editorGroupService.mainPart.onDidAddGroup(() => this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            this._register(this.editorGroupService.mainPart.onDidRemoveGroup(() => this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            this._register(this.editorGroupService.mainPart.onDidChangeGroupMaximized(() => this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED))));
            // Prevent workbench from scrolling #55456
            this._register((0, dom_1.addDisposableListener)(this.mainContainer, dom_1.EventType.SCROLL, () => this.mainContainer.scrollTop = 0));
            // Menubar visibility changes
            const showingCustomMenu = (platform_1.isWindows || platform_1.isLinux || platform_1.isWeb) && !(0, window_1.hasNativeTitlebar)(this.configurationService);
            if (showingCustomMenu) {
                this._register(this.titleService.onMenubarVisibilityChange(visible => this.onMenubarToggled(visible)));
            }
            // Theme changes
            this._register(this.themeService.onDidColorThemeChange(() => this.updateWindowsBorder()));
            // Window active / focus changes
            this._register(this.hostService.onDidChangeFocus(focused => this.onWindowFocusChanged(focused)));
            this._register(this.hostService.onDidChangeActiveWindow(() => this.onActiveWindowChanged()));
            // WCO changes
            if (platform_1.isWeb && typeof navigator.windowControlsOverlay === 'object') {
                this._register((0, dom_1.addDisposableListener)(navigator.windowControlsOverlay, 'geometrychange', () => this.onDidChangeWCO()));
            }
            // Auxiliary windows
            this._register(this.auxiliaryWindowService.onDidOpenAuxiliaryWindow(({ window, disposables }) => {
                const eventDisposables = disposables.add(new lifecycle_1.DisposableStore());
                this.auxWindowStylesLoaded.set(window.container, window.whenStylesHaveLoaded);
                this._onDidAddContainer.fire({ container: window.container, disposables: eventDisposables });
                disposables.add(window.onDidLayout(dimension => this.handleContainerDidLayout(window.container, dimension)));
                disposables.add((0, lifecycle_1.toDisposable)(() => this.auxWindowStylesLoaded.delete(window.container)));
            }));
        }
        onMenubarToggled(visible) {
            if (visible !== this.state.runtime.menuBar.toggled) {
                this.state.runtime.menuBar.toggled = visible;
                const menuBarVisibility = (0, window_1.getMenuBarVisibility)(this.configurationService);
                // The menu bar toggles the title bar in web because it does not need to be shown for window controls only
                if (platform_1.isWeb && menuBarVisibility === 'toggle') {
                    this.workbenchGrid.setViewVisible(this.titleBarPartView, this.shouldShowTitleBar());
                }
                // The menu bar toggles the title bar in full screen for toggle and classic settings
                else if (this.state.runtime.mainWindowFullscreen && (menuBarVisibility === 'toggle' || menuBarVisibility === 'classic')) {
                    this.workbenchGrid.setViewVisible(this.titleBarPartView, this.shouldShowTitleBar());
                }
                // Move layout call to any time the menubar
                // is toggled to update consumers of offset
                // see issue #115267
                this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
            }
        }
        handleContainerDidLayout(container, dimension) {
            if (container === this.mainContainer) {
                this._onDidLayoutMainContainer.fire(dimension);
            }
            if ((0, dom_1.isActiveDocument)(container)) {
                this._onDidLayoutActiveContainer.fire(dimension);
            }
            this._onDidLayoutContainer.fire({ container, dimension });
        }
        onFullscreenChanged(windowId) {
            if (windowId !== window_2.mainWindow.vscodeWindowId) {
                return; // ignore all but main window
            }
            this.state.runtime.mainWindowFullscreen = (0, browser_1.isFullscreen)(window_2.mainWindow);
            // Apply as CSS class
            if (this.state.runtime.mainWindowFullscreen) {
                this.mainContainer.classList.add(LayoutClasses.FULLSCREEN);
            }
            else {
                this.mainContainer.classList.remove(LayoutClasses.FULLSCREEN);
                const zenModeExitInfo = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO);
                const zenModeActive = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
                if (zenModeExitInfo.transitionedToFullScreen && zenModeActive) {
                    this.toggleZenMode();
                }
            }
            // Change edge snapping accordingly
            this.workbenchGrid.edgeSnapping = this.state.runtime.mainWindowFullscreen;
            // Changing fullscreen state of the main window has an impact
            // on custom title bar visibility, so we need to update
            if ((0, window_1.hasCustomTitlebar)(this.configurationService)) {
                // Propagate to grid
                this.workbenchGrid.setViewVisible(this.titleBarPartView, this.shouldShowTitleBar());
                this.updateWindowsBorder(true);
            }
        }
        onActiveWindowChanged() {
            const activeContainerId = this.getActiveContainerId();
            if (this.state.runtime.activeContainerId !== activeContainerId) {
                this.state.runtime.activeContainerId = activeContainerId;
                // Indicate active window border
                this.updateWindowsBorder();
                this._onDidChangeActiveContainer.fire();
            }
        }
        onWindowFocusChanged(hasFocus) {
            if (this.state.runtime.hasFocus !== hasFocus) {
                this.state.runtime.hasFocus = hasFocus;
                this.updateWindowsBorder();
            }
        }
        getActiveContainerId() {
            const activeContainer = this.activeContainer;
            return (0, dom_1.getWindow)(activeContainer).vscodeWindowId;
        }
        doUpdateLayoutConfiguration(skipLayout) {
            // Custom Titlebar visibility with native titlebar
            this.updateCustomTitleBarVisibility();
            // Menubar visibility
            this.updateMenubarVisibility(!!skipLayout);
            // Centered Layout
            this.editorGroupService.whenRestored.then(() => {
                this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED), skipLayout);
            });
        }
        setSideBarPosition(position) {
            const activityBar = this.getPart("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            const sideBar = this.getPart("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const auxiliaryBar = this.getPart("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            const newPositionValue = (position === 0 /* Position.LEFT */) ? 'left' : 'right';
            const oldPositionValue = (position === 1 /* Position.RIGHT */) ? 'left' : 'right';
            const panelAlignment = this.getPanelAlignment();
            const panelPosition = this.getPanelPosition();
            this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON, position);
            // Adjust CSS
            const activityBarContainer = (0, types_1.assertIsDefined)(activityBar.getContainer());
            const sideBarContainer = (0, types_1.assertIsDefined)(sideBar.getContainer());
            const auxiliaryBarContainer = (0, types_1.assertIsDefined)(auxiliaryBar.getContainer());
            activityBarContainer.classList.remove(oldPositionValue);
            sideBarContainer.classList.remove(oldPositionValue);
            activityBarContainer.classList.add(newPositionValue);
            sideBarContainer.classList.add(newPositionValue);
            // Auxiliary Bar has opposite values
            auxiliaryBarContainer.classList.remove(newPositionValue);
            auxiliaryBarContainer.classList.add(oldPositionValue);
            // Update Styles
            activityBar.updateStyles();
            sideBar.updateStyles();
            auxiliaryBar.updateStyles();
            // Move activity bar and side bars
            this.adjustPartPositions(position, panelAlignment, panelPosition);
        }
        updateWindowsBorder(skipLayout = false) {
            if (platform_1.isWeb ||
                platform_1.isWindows || // not working well with zooming and window control overlays
                (0, window_1.hasNativeTitlebar)(this.configurationService)) {
                return;
            }
            const theme = this.themeService.getColorTheme();
            const activeBorder = theme.getColor(theme_1.WINDOW_ACTIVE_BORDER);
            const inactiveBorder = theme.getColor(theme_1.WINDOW_INACTIVE_BORDER);
            const didHaveMainWindowBorder = this.hasMainWindowBorder();
            for (const container of this.containers) {
                const isMainContainer = container === this.mainContainer;
                const isActiveContainer = this.activeContainer === container;
                const containerWindowId = (0, dom_1.getWindowId)((0, dom_1.getWindow)(container));
                let windowBorder = false;
                if (!this.state.runtime.mainWindowFullscreen && !this.state.runtime.maximized.has(containerWindowId) && (activeBorder || inactiveBorder)) {
                    windowBorder = true;
                    // If the inactive color is missing, fallback to the active one
                    const borderColor = isActiveContainer && this.state.runtime.hasFocus ? activeBorder : inactiveBorder ?? activeBorder;
                    container.style.setProperty('--window-border-color', borderColor?.toString() ?? 'transparent');
                }
                if (isMainContainer) {
                    this.state.runtime.mainWindowBorder = windowBorder;
                }
                container.classList.toggle(LayoutClasses.WINDOW_BORDER, windowBorder);
            }
            if (!skipLayout && didHaveMainWindowBorder !== this.hasMainWindowBorder()) {
                this.layout();
            }
        }
        initLayoutState(lifecycleService, fileService) {
            this.stateModel = new LayoutStateModel(this.storageService, this.configurationService, this.contextService, this.parent);
            this.stateModel.load();
            // Both editor and panel should not be hidden on startup
            if (this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN) && this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN)) {
                this.stateModel.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, false);
            }
            this.stateModel.onDidChangeState(change => {
                if (change.key === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
                    this.setActivityBarHidden(change.value);
                }
                if (change.key === LayoutStateKeys.STATUSBAR_HIDDEN) {
                    this.setStatusBarHidden(change.value);
                }
                if (change.key === LayoutStateKeys.SIDEBAR_POSITON) {
                    this.setSideBarPosition(change.value);
                }
                if (change.key === LayoutStateKeys.PANEL_POSITION) {
                    this.setPanelPosition(change.value);
                }
                if (change.key === LayoutStateKeys.PANEL_ALIGNMENT) {
                    this.setPanelAlignment(change.value);
                }
                this.doUpdateLayoutConfiguration();
            });
            // Layout Initialization State
            const initialEditorsState = this.getInitialEditorsState();
            if (initialEditorsState) {
                this.logService.info('Initial editor state', initialEditorsState);
            }
            const initialLayoutState = {
                layout: {
                    editors: initialEditorsState?.layout
                },
                editor: {
                    restoreEditors: this.shouldRestoreEditors(this.contextService, initialEditorsState),
                    editorsToOpen: this.resolveEditorsToOpen(fileService, initialEditorsState),
                },
                views: {
                    defaults: this.getDefaultLayoutViews(this.environmentService, this.storageService),
                    containerToRestore: {}
                }
            };
            // Layout Runtime State
            const layoutRuntimeState = {
                activeContainerId: this.getActiveContainerId(),
                mainWindowFullscreen: (0, browser_1.isFullscreen)(window_2.mainWindow),
                hasFocus: this.hostService.hasFocus,
                maximized: new Set(),
                mainWindowBorder: false,
                menuBar: {
                    toggled: false,
                },
                zenMode: {
                    transitionDisposables: new lifecycle_1.DisposableMap(),
                }
            };
            this.state = {
                initialization: initialLayoutState,
                runtime: layoutRuntimeState,
            };
            // Sidebar View Container To Restore
            if (this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                // Only restore last viewlet if window was reloaded or we are in development mode
                let viewContainerToRestore;
                if (!this.environmentService.isBuilt || lifecycleService.startupKind === 3 /* StartupKind.ReloadedWindow */ || platform_1.isWeb) {
                    viewContainerToRestore = this.storageService.get(sidebarPart_1.SidebarPart.activeViewletSettingsKey, 1 /* StorageScope.WORKSPACE */, this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id);
                }
                else {
                    viewContainerToRestore = this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id;
                }
                if (viewContainerToRestore) {
                    this.state.initialization.views.containerToRestore.sideBar = viewContainerToRestore;
                }
                else {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, true);
                }
            }
            // Panel View Container To Restore
            if (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                const viewContainerToRestore = this.storageService.get(panelPart_1.PanelPart.activePanelSettingsKey, 1 /* StorageScope.WORKSPACE */, this.viewDescriptorService.getDefaultViewContainer(1 /* ViewContainerLocation.Panel */)?.id);
                if (viewContainerToRestore) {
                    this.state.initialization.views.containerToRestore.panel = viewContainerToRestore;
                }
                else {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, true);
                }
            }
            // Auxiliary Panel to restore
            if (this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                const viewContainerToRestore = this.storageService.get(auxiliaryBarPart_1.AuxiliaryBarPart.activePanelSettingsKey, 1 /* StorageScope.WORKSPACE */, this.viewDescriptorService.getDefaultViewContainer(2 /* ViewContainerLocation.AuxiliaryBar */)?.id);
                if (viewContainerToRestore) {
                    this.state.initialization.views.containerToRestore.auxiliaryBar = viewContainerToRestore;
                }
                else {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, true);
                }
            }
            // Window border
            this.updateWindowsBorder(true);
        }
        getDefaultLayoutViews(environmentService, storageService) {
            const defaultLayout = environmentService.options?.defaultLayout;
            if (!defaultLayout) {
                return undefined;
            }
            if (!defaultLayout.force && !storageService.isNew(1 /* StorageScope.WORKSPACE */)) {
                return undefined;
            }
            const { views } = defaultLayout;
            if (views?.length) {
                return views.map(view => view.id);
            }
            return undefined;
        }
        shouldRestoreEditors(contextService, initialEditorsState) {
            // Restore editors based on a set of rules:
            // - never when running on temporary workspace
            // - not when we have files to open, unless:
            // - always when `window.restoreWindows: preserve`
            if ((0, workspace_1.isTemporaryWorkspace)(contextService.getWorkspace())) {
                return false;
            }
            const forceRestoreEditors = this.configurationService.getValue('window.restoreWindows') === 'preserve';
            return !!forceRestoreEditors || initialEditorsState === undefined;
        }
        willRestoreEditors() {
            return this.state.initialization.editor.restoreEditors;
        }
        async resolveEditorsToOpen(fileService, initialEditorsState) {
            if (initialEditorsState) {
                // Merge editor (single)
                const filesToMerge = (0, arrays_1.coalesce)(await (0, editor_1.pathsToEditors)(initialEditorsState.filesToMerge, fileService, this.logService));
                if (filesToMerge.length === 4 && (0, editor_1.isResourceEditorInput)(filesToMerge[0]) && (0, editor_1.isResourceEditorInput)(filesToMerge[1]) && (0, editor_1.isResourceEditorInput)(filesToMerge[2]) && (0, editor_1.isResourceEditorInput)(filesToMerge[3])) {
                    return [{
                            editor: {
                                input1: { resource: filesToMerge[0].resource },
                                input2: { resource: filesToMerge[1].resource },
                                base: { resource: filesToMerge[2].resource },
                                result: { resource: filesToMerge[3].resource },
                                options: { pinned: true }
                            }
                        }];
                }
                // Diff editor (single)
                const filesToDiff = (0, arrays_1.coalesce)(await (0, editor_1.pathsToEditors)(initialEditorsState.filesToDiff, fileService, this.logService));
                if (filesToDiff.length === 2) {
                    return [{
                            editor: {
                                original: { resource: filesToDiff[0].resource },
                                modified: { resource: filesToDiff[1].resource },
                                options: { pinned: true }
                            }
                        }];
                }
                // Normal editor (multiple)
                const filesToOpenOrCreate = [];
                const resolvedFilesToOpenOrCreate = await (0, editor_1.pathsToEditors)(initialEditorsState.filesToOpenOrCreate, fileService, this.logService);
                for (let i = 0; i < resolvedFilesToOpenOrCreate.length; i++) {
                    const resolvedFileToOpenOrCreate = resolvedFilesToOpenOrCreate[i];
                    if (resolvedFileToOpenOrCreate) {
                        filesToOpenOrCreate.push({
                            editor: resolvedFileToOpenOrCreate,
                            viewColumn: initialEditorsState.filesToOpenOrCreate?.[i].viewColumn // take over `viewColumn` from initial state
                        });
                    }
                }
                return filesToOpenOrCreate;
            }
            // Empty workbench configured to open untitled file if empty
            else if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && this.configurationService.getValue('workbench.startupEditor') === 'newUntitledFile') {
                if (this.editorGroupService.hasRestorableState) {
                    return []; // do not open any empty untitled file if we restored groups/editors from previous session
                }
                const hasBackups = await this.workingCopyBackupService.hasBackups();
                if (hasBackups) {
                    return []; // do not open any empty untitled file if we have backups to restore
                }
                return [{
                        editor: { resource: undefined } // open empty untitled file
                    }];
            }
            return [];
        }
        get openedDefaultEditors() { return this._openedDefaultEditors; }
        getInitialEditorsState() {
            // Check for editors / editor layout from `defaultLayout` options first
            const defaultLayout = this.environmentService.options?.defaultLayout;
            if ((defaultLayout?.editors?.length || defaultLayout?.layout?.editors) && (defaultLayout.force || this.storageService.isNew(1 /* StorageScope.WORKSPACE */))) {
                this._openedDefaultEditors = true;
                return {
                    layout: defaultLayout.layout?.editors,
                    filesToOpenOrCreate: defaultLayout?.editors?.map(editor => {
                        return {
                            viewColumn: editor.viewColumn,
                            fileUri: uri_1.URI.revive(editor.uri),
                            openOnlyIfExists: editor.openOnlyIfExists,
                            options: editor.options
                        };
                    })
                };
            }
            // Then check for files to open, create or diff/merge from main side
            const { filesToOpenOrCreate, filesToDiff, filesToMerge } = this.environmentService;
            if (filesToOpenOrCreate || filesToDiff || filesToMerge) {
                return { filesToOpenOrCreate, filesToDiff, filesToMerge };
            }
            return undefined;
        }
        isRestored() {
            return this.restored;
        }
        restoreParts() {
            // distinguish long running restore operations that
            // are required for the layout to be ready from those
            // that are needed to signal restoring is done
            const layoutReadyPromises = [];
            const layoutRestoredPromises = [];
            // Restore editors
            layoutReadyPromises.push((async () => {
                (0, performance_1.mark)('code/willRestoreEditors');
                // first ensure the editor part is ready
                await this.editorGroupService.whenReady;
                (0, performance_1.mark)('code/restoreEditors/editorGroupsReady');
                // apply editor layout if any
                if (this.state.initialization.layout?.editors) {
                    this.editorGroupService.mainPart.applyLayout(this.state.initialization.layout.editors);
                }
                // then see for editors to open as instructed
                // it is important that we trigger this from
                // the overall restore flow to reduce possible
                // flicker on startup: we want any editor to
                // open to get a chance to open first before
                // signaling that layout is restored, but we do
                // not need to await the editors from having
                // fully loaded.
                const editors = await this.state.initialization.editor.editorsToOpen;
                (0, performance_1.mark)('code/restoreEditors/editorsToOpenResolved');
                let openEditorsPromise = undefined;
                if (editors.length) {
                    // we have to map editors to their groups as instructed
                    // by the input. this is important to ensure that we open
                    // the editors in the groups they belong to.
                    const editorGroupsInVisualOrder = this.editorGroupService.mainPart.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
                    const mapEditorsToGroup = new Map();
                    for (const editor of editors) {
                        const group = editorGroupsInVisualOrder[(editor.viewColumn ?? 1) - 1]; // viewColumn is index+1 based
                        let editorsByGroup = mapEditorsToGroup.get(group.id);
                        if (!editorsByGroup) {
                            editorsByGroup = new Set();
                            mapEditorsToGroup.set(group.id, editorsByGroup);
                        }
                        editorsByGroup.add(editor.editor);
                    }
                    openEditorsPromise = Promise.all(Array.from(mapEditorsToGroup).map(async ([groupId, editors]) => {
                        try {
                            await this.editorService.openEditors(Array.from(editors), groupId, { validateTrust: true });
                        }
                        catch (error) {
                            this.logService.error(error);
                        }
                    }));
                }
                // do not block the overall layout ready flow from potentially
                // slow editors to resolve on startup
                layoutRestoredPromises.push(Promise.all([
                    openEditorsPromise?.finally(() => (0, performance_1.mark)('code/restoreEditors/editorsOpened')),
                    this.editorGroupService.whenRestored.finally(() => (0, performance_1.mark)('code/restoreEditors/editorGroupsRestored'))
                ]).finally(() => {
                    // the `code/didRestoreEditors` perf mark is specifically
                    // for when visible editors have resolved, so we only mark
                    // if when editor group service has restored.
                    (0, performance_1.mark)('code/didRestoreEditors');
                }));
            })());
            // Restore default views (only when `IDefaultLayout` is provided)
            const restoreDefaultViewsPromise = (async () => {
                if (this.state.initialization.views.defaults?.length) {
                    (0, performance_1.mark)('code/willOpenDefaultViews');
                    const locationsRestored = [];
                    const tryOpenView = (view) => {
                        const location = this.viewDescriptorService.getViewLocationById(view.id);
                        if (location !== null) {
                            const container = this.viewDescriptorService.getViewContainerByViewId(view.id);
                            if (container) {
                                if (view.order >= (locationsRestored?.[location]?.order ?? 0)) {
                                    locationsRestored[location] = { id: container.id, order: view.order };
                                }
                                const containerModel = this.viewDescriptorService.getViewContainerModel(container);
                                containerModel.setCollapsed(view.id, false);
                                containerModel.setVisible(view.id, true);
                                return true;
                            }
                        }
                        return false;
                    };
                    const defaultViews = [...this.state.initialization.views.defaults].reverse().map((v, index) => ({ id: v, order: index }));
                    let i = defaultViews.length;
                    while (i) {
                        i--;
                        if (tryOpenView(defaultViews[i])) {
                            defaultViews.splice(i, 1);
                        }
                    }
                    // If we still have views left over, wait until all extensions have been registered and try again
                    if (defaultViews.length) {
                        await this.extensionService.whenInstalledExtensionsRegistered();
                        let i = defaultViews.length;
                        while (i) {
                            i--;
                            if (tryOpenView(defaultViews[i])) {
                                defaultViews.splice(i, 1);
                            }
                        }
                    }
                    // If we opened a view in the sidebar, stop any restore there
                    if (locationsRestored[0 /* ViewContainerLocation.Sidebar */]) {
                        this.state.initialization.views.containerToRestore.sideBar = locationsRestored[0 /* ViewContainerLocation.Sidebar */].id;
                    }
                    // If we opened a view in the panel, stop any restore there
                    if (locationsRestored[1 /* ViewContainerLocation.Panel */]) {
                        this.state.initialization.views.containerToRestore.panel = locationsRestored[1 /* ViewContainerLocation.Panel */].id;
                    }
                    // If we opened a view in the auxiliary bar, stop any restore there
                    if (locationsRestored[2 /* ViewContainerLocation.AuxiliaryBar */]) {
                        this.state.initialization.views.containerToRestore.auxiliaryBar = locationsRestored[2 /* ViewContainerLocation.AuxiliaryBar */].id;
                    }
                    (0, performance_1.mark)('code/didOpenDefaultViews');
                }
            })();
            layoutReadyPromises.push(restoreDefaultViewsPromise);
            // Restore Sidebar
            layoutReadyPromises.push((async () => {
                // Restoring views could mean that sidebar already
                // restored, as such we need to test again
                await restoreDefaultViewsPromise;
                if (!this.state.initialization.views.containerToRestore.sideBar) {
                    return;
                }
                (0, performance_1.mark)('code/willRestoreViewlet');
                const viewlet = await this.paneCompositeService.openPaneComposite(this.state.initialization.views.containerToRestore.sideBar, 0 /* ViewContainerLocation.Sidebar */);
                if (!viewlet) {
                    await this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id, 0 /* ViewContainerLocation.Sidebar */); // fallback to default viewlet as needed
                }
                (0, performance_1.mark)('code/didRestoreViewlet');
            })());
            // Restore Panel
            layoutReadyPromises.push((async () => {
                // Restoring views could mean that panel already
                // restored, as such we need to test again
                await restoreDefaultViewsPromise;
                if (!this.state.initialization.views.containerToRestore.panel) {
                    return;
                }
                (0, performance_1.mark)('code/willRestorePanel');
                const panel = await this.paneCompositeService.openPaneComposite(this.state.initialization.views.containerToRestore.panel, 1 /* ViewContainerLocation.Panel */);
                if (!panel) {
                    await this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(1 /* ViewContainerLocation.Panel */)?.id, 1 /* ViewContainerLocation.Panel */); // fallback to default panel as needed
                }
                (0, performance_1.mark)('code/didRestorePanel');
            })());
            // Restore Auxiliary Bar
            layoutReadyPromises.push((async () => {
                // Restoring views could mean that panel already
                // restored, as such we need to test again
                await restoreDefaultViewsPromise;
                if (!this.state.initialization.views.containerToRestore.auxiliaryBar) {
                    return;
                }
                (0, performance_1.mark)('code/willRestoreAuxiliaryBar');
                const panel = await this.paneCompositeService.openPaneComposite(this.state.initialization.views.containerToRestore.auxiliaryBar, 2 /* ViewContainerLocation.AuxiliaryBar */);
                if (!panel) {
                    await this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(2 /* ViewContainerLocation.AuxiliaryBar */)?.id, 2 /* ViewContainerLocation.AuxiliaryBar */); // fallback to default panel as needed
                }
                (0, performance_1.mark)('code/didRestoreAuxiliaryBar');
            })());
            // Restore Zen Mode
            const zenModeWasActive = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            const restoreZenMode = getZenModeConfiguration(this.configurationService).restore;
            if (zenModeWasActive) {
                this.stateModel.setRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE, !restoreZenMode);
                this.toggleZenMode(false, true);
            }
            // Restore Main Editor Center Mode
            if (this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED)) {
                this.centerMainEditorLayout(true, true);
            }
            // Await for promises that we recorded to update
            // our ready and restored states properly.
            async_1.Promises.settled(layoutReadyPromises).finally(() => {
                this.whenReadyPromise.complete();
                async_1.Promises.settled(layoutRestoredPromises).finally(() => {
                    this.restored = true;
                    this.whenRestoredPromise.complete();
                });
            });
        }
        registerPart(part) {
            this.parts.set(part.getId(), part);
        }
        getPart(key) {
            const part = this.parts.get(key);
            if (!part) {
                throw new Error(`Unknown part ${key}`);
            }
            return part;
        }
        registerNotifications(delegate) {
            this._register(delegate.onDidChangeNotificationsVisibility(visible => this._onDidChangeNotificationsVisibility.fire(visible)));
        }
        hasFocus(part) {
            const container = this.getContainer((0, dom_1.getActiveWindow)(), part);
            if (!container) {
                return false;
            }
            const activeElement = (0, dom_1.getActiveElement)();
            if (!activeElement) {
                return false;
            }
            return (0, dom_1.isAncestorUsingFlowTo)(activeElement, container);
        }
        focusPart(part, targetWindow = window_2.mainWindow) {
            const container = this.getContainer(targetWindow, part) ?? this.mainContainer;
            if (container) {
                (0, dom_1.focusWindow)(container);
            }
            switch (part) {
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    this.editorGroupService.getPart(container).activeGroup.focus();
                    break;
                case "workbench.parts.panel" /* Parts.PANEL_PART */: {
                    this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)?.focus();
                    break;
                }
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */: {
                    this.paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */)?.focus();
                    break;
                }
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    this.getPart("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */).focusActivityBar();
                    break;
                case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                    this.statusBarService.getPart(container).focus();
                    break;
                default: {
                    container?.focus();
                }
            }
        }
        getContainer(targetWindow, part) {
            if (typeof part === 'undefined') {
                return this.getContainerFromDocument(targetWindow.document);
            }
            if (targetWindow === window_2.mainWindow) {
                return this.getPart(part).getContainer();
            }
            // Only some parts are supported for auxiliary windows
            let partCandidate;
            if (part === "workbench.parts.editor" /* Parts.EDITOR_PART */) {
                partCandidate = this.editorGroupService.getPart(this.getContainerFromDocument(targetWindow.document));
            }
            else if (part === "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) {
                partCandidate = this.statusBarService.getPart(this.getContainerFromDocument(targetWindow.document));
            }
            else if (part === "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */) {
                partCandidate = this.titleService.getPart(this.getContainerFromDocument(targetWindow.document));
            }
            if (partCandidate instanceof part_1.Part) {
                return partCandidate.getContainer();
            }
            return undefined;
        }
        isVisible(part, targetWindow = window_2.mainWindow) {
            if (targetWindow !== window_2.mainWindow && part === "workbench.parts.editor" /* Parts.EDITOR_PART */) {
                return true; // cannot hide editor part in auxiliary windows
            }
            if (this.initialized) {
                switch (part) {
                    case "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */:
                        return this.workbenchGrid.isViewVisible(this.titleBarPartView);
                    case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN);
                    case "workbench.parts.panel" /* Parts.PANEL_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN);
                    case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN);
                    case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN);
                    case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN);
                    case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                        return !this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN);
                    case "workbench.parts.banner" /* Parts.BANNER_PART */:
                        return this.workbenchGrid.isViewVisible(this.bannerPartView);
                    default:
                        return false; // any other part cannot be hidden
                }
            }
            switch (part) {
                case "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */:
                    return this.shouldShowTitleBar();
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN);
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN);
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN);
                case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN);
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN);
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    return !this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN);
                default:
                    return false; // any other part cannot be hidden
            }
        }
        shouldShowTitleBar() {
            if (!(0, window_1.hasCustomTitlebar)(this.configurationService)) {
                return false;
            }
            const nativeTitleBarEnabled = (0, window_1.hasNativeTitlebar)(this.configurationService);
            const showCustomTitleBar = this.configurationService.getValue("window.customTitleBarVisibility" /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */);
            if (showCustomTitleBar === "never" /* CustomTitleBarVisibility.NEVER */ && nativeTitleBarEnabled || showCustomTitleBar === "windowed" /* CustomTitleBarVisibility.WINDOWED */ && this.state.runtime.mainWindowFullscreen) {
                return false;
            }
            if (!this.isTitleBarEmpty()) {
                return true;
            }
            // Hide custom title bar when native title bar enabled and custom title bar is empty
            if (nativeTitleBarEnabled) {
                return false;
            }
            // macOS desktop does not need a title bar when full screen
            if (platform_1.isMacintosh && platform_1.isNative) {
                return !this.state.runtime.mainWindowFullscreen;
            }
            // non-fullscreen native must show the title bar
            if (platform_1.isNative && !this.state.runtime.mainWindowFullscreen) {
                return true;
            }
            // if WCO is visible, we have to show the title bar
            if ((0, browser_1.isWCOEnabled)() && !this.state.runtime.mainWindowFullscreen) {
                return true;
            }
            // remaining behavior is based on menubar visibility
            switch ((0, window_1.getMenuBarVisibility)(this.configurationService)) {
                case 'classic':
                    return !this.state.runtime.mainWindowFullscreen || this.state.runtime.menuBar.toggled;
                case 'compact':
                case 'hidden':
                    return false;
                case 'toggle':
                    return this.state.runtime.menuBar.toggled;
                case 'visible':
                    return true;
                default:
                    return platform_1.isWeb ? false : !this.state.runtime.mainWindowFullscreen || this.state.runtime.menuBar.toggled;
            }
        }
        isTitleBarEmpty() {
            // with the command center enabled, we should always show
            if (this.configurationService.getValue("window.commandCenter" /* LayoutSettings.COMMAND_CENTER */)) {
                return false;
            }
            // with the activity bar on top, we should always show
            if (this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) === "top" /* ActivityBarPosition.TOP */) {
                return false;
            }
            // with the editor actions on top, we should always show
            const editorActionsLocation = this.configurationService.getValue("workbench.editor.editorActionsLocation" /* LayoutSettings.EDITOR_ACTIONS_LOCATION */);
            const editorTabsMode = this.configurationService.getValue("workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */);
            if (editorActionsLocation === "titleBar" /* EditorActionsLocation.TITLEBAR */ || editorActionsLocation === "default" /* EditorActionsLocation.DEFAULT */ && editorTabsMode === "none" /* EditorTabsMode.NONE */) {
                return false;
            }
            // with the layout actions on top, we should always show
            if (this.configurationService.getValue("workbench.layoutControl.enabled" /* LayoutSettings.LAYOUT_ACTIONS */)) {
                return false;
            }
            return true;
        }
        shouldShowBannerFirst() {
            return platform_1.isWeb && !(0, browser_1.isWCOEnabled)();
        }
        focus() {
            this.focusPart("workbench.parts.editor" /* Parts.EDITOR_PART */, (0, dom_1.getWindow)(this.activeContainer));
        }
        focusPanelOrEditor() {
            const activePanel = this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            if ((this.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */) || !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */)) && activePanel) {
                activePanel.focus(); // prefer panel if it has focus or editor is hidden
            }
            else {
                this.focus(); // otherwise focus editor
            }
        }
        getMaximumEditorDimensions(container) {
            const targetWindow = (0, dom_1.getWindow)(container);
            const containerDimension = this.getContainerDimension(container);
            if (container === this.mainContainer) {
                const panelPosition = this.getPanelPosition();
                const isColumn = panelPosition === 1 /* Position.RIGHT */ || panelPosition === 0 /* Position.LEFT */;
                const takenWidth = (this.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */) ? this.activityBarPartView.minimumWidth : 0) +
                    (this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? this.sideBarPartView.minimumWidth : 0) +
                    (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) && isColumn ? this.panelPartView.minimumWidth : 0) +
                    (this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) ? this.auxiliaryBarPartView.minimumWidth : 0);
                const takenHeight = (this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, targetWindow) ? this.titleBarPartView.minimumHeight : 0) +
                    (this.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, targetWindow) ? this.statusBarPartView.minimumHeight : 0) +
                    (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) && !isColumn ? this.panelPartView.minimumHeight : 0);
                const availableWidth = containerDimension.width - takenWidth;
                const availableHeight = containerDimension.height - takenHeight;
                return { width: availableWidth, height: availableHeight };
            }
            else {
                const takenHeight = (this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, targetWindow) ? this.titleBarPartView.minimumHeight : 0) +
                    (this.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, targetWindow) ? this.statusBarPartView.minimumHeight : 0);
                return { width: containerDimension.width, height: containerDimension.height - takenHeight };
            }
        }
        toggleZenMode(skipLayout, restoring = false) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE, !this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE));
            this.state.runtime.zenMode.transitionDisposables.clearAndDisposeAll();
            const setLineNumbers = (lineNumbers) => {
                for (const editor of this.mainPartEditorService.visibleTextEditorControls) {
                    // To properly reset line numbers we need to read the configuration for each editor respecting it's uri.
                    if (!lineNumbers && (0, editorBrowser_1.isCodeEditor)(editor) && editor.hasModel()) {
                        const model = editor.getModel();
                        lineNumbers = this.configurationService.getValue('editor.lineNumbers', { resource: model.uri, overrideIdentifier: model.getLanguageId() });
                    }
                    if (!lineNumbers) {
                        lineNumbers = this.configurationService.getValue('editor.lineNumbers');
                    }
                    editor.updateOptions({ lineNumbers });
                }
            };
            // Check if zen mode transitioned to full screen and if now we are out of zen mode
            // -> we need to go out of full screen (same goes for the centered editor layout)
            let toggleMainWindowFullScreen = false;
            const config = getZenModeConfiguration(this.configurationService);
            const zenModeExitInfo = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO);
            // Zen Mode Active
            if (this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE)) {
                toggleMainWindowFullScreen = !this.state.runtime.mainWindowFullscreen && config.fullScreen && !platform_1.isIOS;
                if (!restoring) {
                    zenModeExitInfo.transitionedToFullScreen = toggleMainWindowFullScreen;
                    zenModeExitInfo.transitionedToCenteredEditorLayout = !this.isMainEditorLayoutCentered() && config.centerLayout;
                    zenModeExitInfo.handleNotificationsDoNotDisturbMode = this.notificationService.getFilter() === notification_1.NotificationsFilter.OFF;
                    zenModeExitInfo.wasVisible.sideBar = this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                    zenModeExitInfo.wasVisible.panel = this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */);
                    zenModeExitInfo.wasVisible.auxiliaryBar = this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
                    this.stateModel.setRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO, zenModeExitInfo);
                }
                this.setPanelHidden(true, true);
                this.setAuxiliaryBarHidden(true, true);
                this.setSideBarHidden(true, true);
                if (config.hideActivityBar) {
                    this.setActivityBarHidden(true, true);
                }
                if (config.hideStatusBar) {
                    this.setStatusBarHidden(true, true);
                }
                if (config.hideLineNumbers) {
                    setLineNumbers('off');
                    this.state.runtime.zenMode.transitionDisposables.set("zenMode.hideLineNumbers" /* ZenModeSettings.HIDE_LINENUMBERS */, this.mainPartEditorService.onDidVisibleEditorsChange(() => setLineNumbers('off')));
                }
                if (config.showTabs !== this.editorGroupService.partOptions.showTabs) {
                    this.state.runtime.zenMode.transitionDisposables.set("zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */, this.editorGroupService.mainPart.enforcePartOptions({ showTabs: config.showTabs }));
                }
                if (config.silentNotifications && zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
                    this.notificationService.setFilter(notification_1.NotificationsFilter.ERROR);
                }
                if (config.centerLayout) {
                    this.centerMainEditorLayout(true, true);
                }
                // Zen Mode Configuration Changes
                this.state.runtime.zenMode.transitionDisposables.set('configurationChange', this.configurationService.onDidChangeConfiguration(e => {
                    // Activity Bar
                    if (e.affectsConfiguration("zenMode.hideActivityBar" /* ZenModeSettings.HIDE_ACTIVITYBAR */)) {
                        const zenModeHideActivityBar = this.configurationService.getValue("zenMode.hideActivityBar" /* ZenModeSettings.HIDE_ACTIVITYBAR */);
                        this.setActivityBarHidden(zenModeHideActivityBar, true);
                    }
                    // Status Bar
                    if (e.affectsConfiguration("zenMode.hideStatusBar" /* ZenModeSettings.HIDE_STATUSBAR */)) {
                        const zenModeHideStatusBar = this.configurationService.getValue("zenMode.hideStatusBar" /* ZenModeSettings.HIDE_STATUSBAR */);
                        this.setStatusBarHidden(zenModeHideStatusBar, true);
                    }
                    // Center Layout
                    if (e.affectsConfiguration("zenMode.centerLayout" /* ZenModeSettings.CENTER_LAYOUT */)) {
                        const zenModeCenterLayout = this.configurationService.getValue("zenMode.centerLayout" /* ZenModeSettings.CENTER_LAYOUT */);
                        this.centerMainEditorLayout(zenModeCenterLayout, true);
                    }
                    // Show Tabs
                    if (e.affectsConfiguration("zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */)) {
                        const zenModeShowTabs = this.configurationService.getValue("zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */) ?? 'multiple';
                        this.state.runtime.zenMode.transitionDisposables.set("zenMode.showTabs" /* ZenModeSettings.SHOW_TABS */, this.editorGroupService.mainPart.enforcePartOptions({ showTabs: zenModeShowTabs }));
                    }
                    // Notifications
                    if (e.affectsConfiguration("zenMode.silentNotifications" /* ZenModeSettings.SILENT_NOTIFICATIONS */)) {
                        const zenModeSilentNotifications = !!this.configurationService.getValue("zenMode.silentNotifications" /* ZenModeSettings.SILENT_NOTIFICATIONS */);
                        if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
                            this.notificationService.setFilter(zenModeSilentNotifications ? notification_1.NotificationsFilter.ERROR : notification_1.NotificationsFilter.OFF);
                        }
                    }
                    // Center Layout
                    if (e.affectsConfiguration("zenMode.hideLineNumbers" /* ZenModeSettings.HIDE_LINENUMBERS */)) {
                        const lineNumbersType = this.configurationService.getValue("zenMode.hideLineNumbers" /* ZenModeSettings.HIDE_LINENUMBERS */) ? 'off' : undefined;
                        setLineNumbers(lineNumbersType);
                        this.state.runtime.zenMode.transitionDisposables.set("zenMode.hideLineNumbers" /* ZenModeSettings.HIDE_LINENUMBERS */, this.mainPartEditorService.onDidVisibleEditorsChange(() => setLineNumbers(lineNumbersType)));
                    }
                }));
            }
            // Zen Mode Inactive
            else {
                if (zenModeExitInfo.wasVisible.panel) {
                    this.setPanelHidden(false, true);
                }
                if (zenModeExitInfo.wasVisible.auxiliaryBar) {
                    this.setAuxiliaryBarHidden(false, true);
                }
                if (zenModeExitInfo.wasVisible.sideBar) {
                    this.setSideBarHidden(false, true);
                }
                if (!this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN, true)) {
                    this.setActivityBarHidden(false, true);
                }
                if (!this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN, true)) {
                    this.setStatusBarHidden(false, true);
                }
                if (zenModeExitInfo.transitionedToCenteredEditorLayout) {
                    this.centerMainEditorLayout(false, true);
                }
                if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
                    this.notificationService.setFilter(notification_1.NotificationsFilter.OFF);
                }
                setLineNumbers();
                this.focus();
                toggleMainWindowFullScreen = zenModeExitInfo.transitionedToFullScreen && this.state.runtime.mainWindowFullscreen;
            }
            if (!skipLayout) {
                this.layout();
            }
            if (toggleMainWindowFullScreen) {
                this.hostService.toggleFullScreen(window_2.mainWindow);
            }
            // Event
            this._onDidChangeZenMode.fire(this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE));
        }
        setStatusBarHidden(hidden, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.mainContainer.classList.add(LayoutClasses.STATUSBAR_HIDDEN);
            }
            else {
                this.mainContainer.classList.remove(LayoutClasses.STATUSBAR_HIDDEN);
            }
            // Propagate to grid
            this.workbenchGrid.setViewVisible(this.statusBarPartView, !hidden);
        }
        createWorkbenchLayout() {
            const titleBar = this.getPart("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */);
            const bannerPart = this.getPart("workbench.parts.banner" /* Parts.BANNER_PART */);
            const editorPart = this.getPart("workbench.parts.editor" /* Parts.EDITOR_PART */);
            const activityBar = this.getPart("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            const panelPart = this.getPart("workbench.parts.panel" /* Parts.PANEL_PART */);
            const auxiliaryBarPart = this.getPart("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            const sideBar = this.getPart("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const statusBar = this.getPart("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */);
            // View references for all parts
            this.titleBarPartView = titleBar;
            this.bannerPartView = bannerPart;
            this.sideBarPartView = sideBar;
            this.activityBarPartView = activityBar;
            this.editorPartView = editorPart;
            this.panelPartView = panelPart;
            this.auxiliaryBarPartView = auxiliaryBarPart;
            this.statusBarPartView = statusBar;
            const viewMap = {
                ["workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */]: this.activityBarPartView,
                ["workbench.parts.banner" /* Parts.BANNER_PART */]: this.bannerPartView,
                ["workbench.parts.titlebar" /* Parts.TITLEBAR_PART */]: this.titleBarPartView,
                ["workbench.parts.editor" /* Parts.EDITOR_PART */]: this.editorPartView,
                ["workbench.parts.panel" /* Parts.PANEL_PART */]: this.panelPartView,
                ["workbench.parts.sidebar" /* Parts.SIDEBAR_PART */]: this.sideBarPartView,
                ["workbench.parts.statusbar" /* Parts.STATUSBAR_PART */]: this.statusBarPartView,
                ["workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */]: this.auxiliaryBarPartView
            };
            const fromJSON = ({ type }) => viewMap[type];
            const workbenchGrid = grid_1.SerializableGrid.deserialize(this.createGridDescriptor(), { fromJSON }, { proportionalLayout: false });
            this.mainContainer.prepend(workbenchGrid.element);
            this.mainContainer.setAttribute('role', 'application');
            this.workbenchGrid = workbenchGrid;
            this.workbenchGrid.edgeSnapping = this.state.runtime.mainWindowFullscreen;
            for (const part of [titleBar, editorPart, activityBar, panelPart, sideBar, statusBar, auxiliaryBarPart, bannerPart]) {
                this._register(part.onDidVisibilityChange((visible) => {
                    if (part === sideBar) {
                        this.setSideBarHidden(!visible, true);
                    }
                    else if (part === panelPart) {
                        this.setPanelHidden(!visible, true);
                    }
                    else if (part === auxiliaryBarPart) {
                        this.setAuxiliaryBarHidden(!visible, true);
                    }
                    else if (part === editorPart) {
                        this.setEditorHidden(!visible, true);
                    }
                    this._onDidChangePartVisibility.fire();
                    this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
                }));
            }
            this._register(this.storageService.onWillSaveState(willSaveState => {
                if (willSaveState.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    // Side Bar Size
                    const sideBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN)
                        ? this.workbenchGrid.getViewCachedVisibleSize(this.sideBarPartView)
                        : this.workbenchGrid.getViewSize(this.sideBarPartView).width;
                    this.stateModel.setInitializationValue(LayoutStateKeys.SIDEBAR_SIZE, sideBarSize);
                    // Panel Size
                    const panelSize = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN)
                        ? this.workbenchGrid.getViewCachedVisibleSize(this.panelPartView)
                        : (this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION) === 2 /* Position.BOTTOM */ ? this.workbenchGrid.getViewSize(this.panelPartView).height : this.workbenchGrid.getViewSize(this.panelPartView).width);
                    this.stateModel.setInitializationValue(LayoutStateKeys.PANEL_SIZE, panelSize);
                    // Auxiliary Bar Size
                    const auxiliaryBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN)
                        ? this.workbenchGrid.getViewCachedVisibleSize(this.auxiliaryBarPartView)
                        : this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width;
                    this.stateModel.setInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE, auxiliaryBarSize);
                    this.stateModel.save(true, true);
                }
            }));
        }
        layout() {
            if (!this.disposed) {
                this._mainContainerDimension = (0, dom_1.getClientArea)(this.parent);
                this.logService.trace(`Layout#layout, height: ${this._mainContainerDimension.height}, width: ${this._mainContainerDimension.width}`);
                (0, dom_1.position)(this.mainContainer, 0, 0, 0, 0, 'relative');
                (0, dom_1.size)(this.mainContainer, this._mainContainerDimension.width, this._mainContainerDimension.height);
                // Layout the grid widget
                this.workbenchGrid.layout(this._mainContainerDimension.width, this._mainContainerDimension.height);
                this.initialized = true;
                // Emit as event
                this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
            }
        }
        isMainEditorLayoutCentered() {
            return this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED);
        }
        centerMainEditorLayout(active, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.EDITOR_CENTERED, active);
            const activeMainEditor = this.mainPartEditorService.activeEditor;
            let isEditorComplex = false;
            if (activeMainEditor instanceof diffEditorInput_1.DiffEditorInput) {
                isEditorComplex = this.configurationService.getValue('diffEditor.renderSideBySide');
            }
            else if (activeMainEditor?.hasCapability(256 /* EditorInputCapabilities.MultipleEditors */)) {
                isEditorComplex = true;
            }
            const isCenteredLayoutAutoResizing = this.configurationService.getValue('workbench.editor.centeredLayoutAutoResize');
            if (isCenteredLayoutAutoResizing &&
                ((this.editorGroupService.mainPart.groups.length > 1 && !this.editorGroupService.mainPart.hasMaximizedGroup()) || isEditorComplex)) {
                active = false; // disable centered layout for complex editors or when there is more than one group
            }
            if (this.editorGroupService.mainPart.isLayoutCentered() !== active) {
                this.editorGroupService.mainPart.centerLayout(active);
                if (!skipLayout) {
                    this.layout();
                }
            }
            this._onDidChangeCenteredLayout.fire(this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_CENTERED));
        }
        resizePart(part, sizeChangeWidth, sizeChangeHeight) {
            const sizeChangePxWidth = Math.sign(sizeChangeWidth) * (0, dom_1.computeScreenAwareSize)((0, dom_1.getActiveWindow)(), Math.abs(sizeChangeWidth));
            const sizeChangePxHeight = Math.sign(sizeChangeHeight) * (0, dom_1.computeScreenAwareSize)((0, dom_1.getActiveWindow)(), Math.abs(sizeChangeHeight));
            let viewSize;
            switch (part) {
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    viewSize = this.workbenchGrid.getViewSize(this.sideBarPartView);
                    this.workbenchGrid.resizeView(this.sideBarPartView, {
                        width: viewSize.width + sizeChangePxWidth,
                        height: viewSize.height
                    });
                    break;
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    viewSize = this.workbenchGrid.getViewSize(this.panelPartView);
                    this.workbenchGrid.resizeView(this.panelPartView, {
                        width: viewSize.width + (this.getPanelPosition() !== 2 /* Position.BOTTOM */ ? sizeChangePxWidth : 0),
                        height: viewSize.height + (this.getPanelPosition() !== 2 /* Position.BOTTOM */ ? 0 : sizeChangePxHeight)
                    });
                    break;
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    viewSize = this.workbenchGrid.getViewSize(this.auxiliaryBarPartView);
                    this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
                        width: viewSize.width + sizeChangePxWidth,
                        height: viewSize.height
                    });
                    break;
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    viewSize = this.workbenchGrid.getViewSize(this.editorPartView);
                    // Single Editor Group
                    if (this.editorGroupService.mainPart.count === 1) {
                        this.workbenchGrid.resizeView(this.editorPartView, {
                            width: viewSize.width + sizeChangePxWidth,
                            height: viewSize.height + sizeChangePxHeight
                        });
                    }
                    else {
                        const activeGroup = this.editorGroupService.mainPart.activeGroup;
                        const { width, height } = this.editorGroupService.mainPart.getSize(activeGroup);
                        this.editorGroupService.mainPart.setSize(activeGroup, { width: width + sizeChangePxWidth, height: height + sizeChangePxHeight });
                        // After resizing the editor group
                        // if it does not change in either direction
                        // try resizing the full editor part
                        const { width: newWidth, height: newHeight } = this.editorGroupService.mainPart.getSize(activeGroup);
                        if ((sizeChangePxHeight && height === newHeight) || (sizeChangePxWidth && width === newWidth)) {
                            this.workbenchGrid.resizeView(this.editorPartView, {
                                width: viewSize.width + (sizeChangePxWidth && width === newWidth ? sizeChangePxWidth : 0),
                                height: viewSize.height + (sizeChangePxHeight && height === newHeight ? sizeChangePxHeight : 0)
                            });
                        }
                    }
                    break;
                default:
                    return; // Cannot resize other parts
            }
        }
        setActivityBarHidden(hidden, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN, hidden);
            // Propagate to grid
            this.workbenchGrid.setViewVisible(this.activityBarPartView, !hidden);
        }
        setBannerHidden(hidden) {
            this.workbenchGrid.setViewVisible(this.bannerPartView, !hidden);
        }
        setEditorHidden(hidden, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.mainContainer.classList.add(LayoutClasses.MAIN_EDITOR_AREA_HIDDEN);
            }
            else {
                this.mainContainer.classList.remove(LayoutClasses.MAIN_EDITOR_AREA_HIDDEN);
            }
            // Propagate to grid
            this.workbenchGrid.setViewVisible(this.editorPartView, !hidden);
            // The editor and panel cannot be hidden at the same time
            if (hidden && !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                this.setPanelHidden(false, true);
            }
        }
        getLayoutClasses() {
            return (0, arrays_1.coalesce)([
                !this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? LayoutClasses.SIDEBAR_HIDDEN : undefined,
                !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */, window_2.mainWindow) ? LayoutClasses.MAIN_EDITOR_AREA_HIDDEN : undefined,
                !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) ? LayoutClasses.PANEL_HIDDEN : undefined,
                !this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) ? LayoutClasses.AUXILIARYBAR_HIDDEN : undefined,
                !this.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */) ? LayoutClasses.STATUSBAR_HIDDEN : undefined,
                this.state.runtime.mainWindowFullscreen ? LayoutClasses.FULLSCREEN : undefined
            ]);
        }
        setSideBarHidden(hidden, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.mainContainer.classList.add(LayoutClasses.SIDEBAR_HIDDEN);
            }
            else {
                this.mainContainer.classList.remove(LayoutClasses.SIDEBAR_HIDDEN);
            }
            // If sidebar becomes hidden, also hide the current active Viewlet if any
            if (hidden && this.paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */)) {
                this.paneCompositeService.hideActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
                this.focusPanelOrEditor();
            }
            // If sidebar becomes visible, show last active Viewlet or default viewlet
            else if (!hidden && !this.paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */)) {
                const viewletToOpen = this.paneCompositeService.getLastActivePaneCompositeId(0 /* ViewContainerLocation.Sidebar */);
                if (viewletToOpen) {
                    const viewlet = this.paneCompositeService.openPaneComposite(viewletToOpen, 0 /* ViewContainerLocation.Sidebar */, true);
                    if (!viewlet) {
                        this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(0 /* ViewContainerLocation.Sidebar */)?.id, 0 /* ViewContainerLocation.Sidebar */, true);
                    }
                }
            }
            // Propagate to grid
            this.workbenchGrid.setViewVisible(this.sideBarPartView, !hidden);
        }
        hasViews(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (!viewContainer) {
                return false;
            }
            const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
            if (!viewContainerModel) {
                return false;
            }
            return viewContainerModel.activeViewDescriptors.length >= 1;
        }
        adjustPartPositions(sideBarPosition, panelAlignment, panelPosition) {
            // Move activity bar and side bars
            const sideBarSiblingToEditor = panelPosition !== 2 /* Position.BOTTOM */ || !(panelAlignment === 'center' || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'right') || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'left'));
            const auxiliaryBarSiblingToEditor = panelPosition !== 2 /* Position.BOTTOM */ || !(panelAlignment === 'center' || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'right') || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'left'));
            const preMovePanelWidth = !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) ? grid_1.Sizing.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.panelPartView) ?? this.panelPartView.minimumWidth) : this.workbenchGrid.getViewSize(this.panelPartView).width;
            const preMovePanelHeight = !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */) ? grid_1.Sizing.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.panelPartView) ?? this.panelPartView.minimumHeight) : this.workbenchGrid.getViewSize(this.panelPartView).height;
            const preMoveSideBarSize = !this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) ? grid_1.Sizing.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.sideBarPartView) ?? this.sideBarPartView.minimumWidth) : this.workbenchGrid.getViewSize(this.sideBarPartView).width;
            const preMoveAuxiliaryBarSize = !this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) ? grid_1.Sizing.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.auxiliaryBarPartView) ?? this.auxiliaryBarPartView.minimumWidth) : this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width;
            if (sideBarPosition === 0 /* Position.LEFT */) {
                this.workbenchGrid.moveViewTo(this.activityBarPartView, [2, 0]);
                this.workbenchGrid.moveView(this.sideBarPartView, preMoveSideBarSize, sideBarSiblingToEditor ? this.editorPartView : this.activityBarPartView, sideBarSiblingToEditor ? 2 /* Direction.Left */ : 3 /* Direction.Right */);
                if (auxiliaryBarSiblingToEditor) {
                    this.workbenchGrid.moveView(this.auxiliaryBarPartView, preMoveAuxiliaryBarSize, this.editorPartView, 3 /* Direction.Right */);
                }
                else {
                    this.workbenchGrid.moveViewTo(this.auxiliaryBarPartView, [2, -1]);
                }
            }
            else {
                this.workbenchGrid.moveViewTo(this.activityBarPartView, [2, -1]);
                this.workbenchGrid.moveView(this.sideBarPartView, preMoveSideBarSize, sideBarSiblingToEditor ? this.editorPartView : this.activityBarPartView, sideBarSiblingToEditor ? 3 /* Direction.Right */ : 2 /* Direction.Left */);
                if (auxiliaryBarSiblingToEditor) {
                    this.workbenchGrid.moveView(this.auxiliaryBarPartView, preMoveAuxiliaryBarSize, this.editorPartView, 2 /* Direction.Left */);
                }
                else {
                    this.workbenchGrid.moveViewTo(this.auxiliaryBarPartView, [2, 0]);
                }
            }
            // We moved all the side parts based on the editor and ignored the panel
            // Now, we need to put the panel back in the right position when it is next to the editor
            if (panelPosition !== 2 /* Position.BOTTOM */) {
                this.workbenchGrid.moveView(this.panelPartView, preMovePanelWidth, this.editorPartView, panelPosition === 0 /* Position.LEFT */ ? 2 /* Direction.Left */ : 3 /* Direction.Right */);
                this.workbenchGrid.resizeView(this.panelPartView, {
                    height: preMovePanelHeight,
                    width: preMovePanelWidth
                });
            }
            // Moving views in the grid can cause them to re-distribute sizing unnecessarily
            // Resize visible parts to the width they were before the operation
            if (this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                this.workbenchGrid.resizeView(this.sideBarPartView, {
                    height: this.workbenchGrid.getViewSize(this.sideBarPartView).height,
                    width: preMoveSideBarSize
                });
            }
            if (this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
                    height: this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).height,
                    width: preMoveAuxiliaryBarSize
                });
            }
        }
        setPanelAlignment(alignment, skipLayout) {
            // Panel alignment only applies to a panel in the bottom position
            if (this.getPanelPosition() !== 2 /* Position.BOTTOM */) {
                this.setPanelPosition(2 /* Position.BOTTOM */);
            }
            // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            if (alignment !== 'center' && this.isPanelMaximized()) {
                this.toggleMaximizedPanel();
            }
            this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT, alignment);
            this.adjustPartPositions(this.getSideBarPosition(), alignment, this.getPanelPosition());
            this._onDidChangePanelAlignment.fire(alignment);
        }
        setPanelHidden(hidden, skipLayout) {
            // Return if not initialized fully #105480
            if (!this.workbenchGrid) {
                return;
            }
            const wasHidden = !this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */);
            this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, hidden);
            const isPanelMaximized = this.isPanelMaximized();
            const panelOpensMaximized = this.panelOpensMaximized();
            // Adjust CSS
            if (hidden) {
                this.mainContainer.classList.add(LayoutClasses.PANEL_HIDDEN);
            }
            else {
                this.mainContainer.classList.remove(LayoutClasses.PANEL_HIDDEN);
            }
            // If panel part becomes hidden, also hide the current active panel if any
            let focusEditor = false;
            if (hidden && this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)) {
                this.paneCompositeService.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                focusEditor = platform_1.isIOS ? false : true; // Do not auto focus on ios #127832
            }
            // If panel part becomes visible, show last active panel or default panel
            else if (!hidden && !this.paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)) {
                let panelToOpen = this.paneCompositeService.getLastActivePaneCompositeId(1 /* ViewContainerLocation.Panel */);
                // verify that the panel we try to open has views before we default to it
                // otherwise fall back to any view that has views still refs #111463
                if (!panelToOpen || !this.hasViews(panelToOpen)) {
                    panelToOpen = this.viewDescriptorService
                        .getViewContainersByLocation(1 /* ViewContainerLocation.Panel */)
                        .find(viewContainer => this.hasViews(viewContainer.id))?.id;
                }
                if (panelToOpen) {
                    const focus = !skipLayout;
                    this.paneCompositeService.openPaneComposite(panelToOpen, 1 /* ViewContainerLocation.Panel */, focus);
                }
            }
            // If maximized and in process of hiding, unmaximize before hiding to allow caching of non-maximized size
            if (hidden && isPanelMaximized) {
                this.toggleMaximizedPanel();
            }
            // Don't proceed if we have already done this before
            if (wasHidden === hidden) {
                return;
            }
            // Propagate layout changes to grid
            this.workbenchGrid.setViewVisible(this.panelPartView, !hidden);
            // If in process of showing, toggle whether or not panel is maximized
            if (!hidden) {
                if (!skipLayout && isPanelMaximized !== panelOpensMaximized) {
                    this.toggleMaximizedPanel();
                }
            }
            else {
                // If in process of hiding, remember whether the panel is maximized or not
                this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED, isPanelMaximized);
            }
            if (focusEditor) {
                this.editorGroupService.mainPart.activeGroup.focus(); // Pass focus to editor group if panel part is now hidden
            }
        }
        toggleMaximizedPanel() {
            const size = this.workbenchGrid.getViewSize(this.panelPartView);
            const panelPosition = this.getPanelPosition();
            const isMaximized = this.isPanelMaximized();
            if (!isMaximized) {
                if (this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                    if (panelPosition === 2 /* Position.BOTTOM */) {
                        this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT, size.height);
                    }
                    else {
                        this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH, size.width);
                    }
                }
                this.setEditorHidden(true);
            }
            else {
                this.setEditorHidden(false);
                this.workbenchGrid.resizeView(this.panelPartView, {
                    width: panelPosition === 2 /* Position.BOTTOM */ ? size.width : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH),
                    height: panelPosition === 2 /* Position.BOTTOM */ ? this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT) : size.height
                });
            }
            this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED, !isMaximized);
        }
        /**
         * Returns whether or not the panel opens maximized
         */
        panelOpensMaximized() {
            // The workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            if (this.getPanelAlignment() !== 'center' && this.getPanelPosition() === 2 /* Position.BOTTOM */) {
                return false;
            }
            const panelOpensMaximized = (0, layoutService_1.panelOpensMaximizedFromString)(this.configurationService.getValue(WorkbenchLayoutSettings.PANEL_OPENS_MAXIMIZED));
            const panelLastIsMaximized = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED);
            return panelOpensMaximized === 0 /* PanelOpensMaximizedOptions.ALWAYS */ || (panelOpensMaximized === 2 /* PanelOpensMaximizedOptions.REMEMBER_LAST */ && panelLastIsMaximized);
        }
        setAuxiliaryBarHidden(hidden, skipLayout) {
            this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, hidden);
            // Adjust CSS
            if (hidden) {
                this.mainContainer.classList.add(LayoutClasses.AUXILIARYBAR_HIDDEN);
            }
            else {
                this.mainContainer.classList.remove(LayoutClasses.AUXILIARYBAR_HIDDEN);
            }
            // If auxiliary bar becomes hidden, also hide the current active pane composite if any
            if (hidden && this.paneCompositeService.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */)) {
                this.paneCompositeService.hideActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */);
                this.focusPanelOrEditor();
            }
            // If auxiliary bar becomes visible, show last active pane composite or default pane composite
            else if (!hidden && !this.paneCompositeService.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */)) {
                let panelToOpen = this.paneCompositeService.getLastActivePaneCompositeId(2 /* ViewContainerLocation.AuxiliaryBar */);
                // verify that the panel we try to open has views before we default to it
                // otherwise fall back to any view that has views still refs #111463
                if (!panelToOpen || !this.hasViews(panelToOpen)) {
                    panelToOpen = this.viewDescriptorService
                        .getViewContainersByLocation(2 /* ViewContainerLocation.AuxiliaryBar */)
                        .find(viewContainer => this.hasViews(viewContainer.id))?.id;
                }
                if (panelToOpen) {
                    const focus = !skipLayout;
                    this.paneCompositeService.openPaneComposite(panelToOpen, 2 /* ViewContainerLocation.AuxiliaryBar */, focus);
                }
            }
            // Propagate to grid
            this.workbenchGrid.setViewVisible(this.auxiliaryBarPartView, !hidden);
        }
        setPartHidden(hidden, part, targetWindow = window_2.mainWindow) {
            switch (part) {
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    return this.setActivityBarHidden(hidden);
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    return this.setSideBarHidden(hidden);
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    return this.setEditorHidden(hidden);
                case "workbench.parts.banner" /* Parts.BANNER_PART */:
                    return this.setBannerHidden(hidden);
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    return this.setAuxiliaryBarHidden(hidden);
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    return this.setPanelHidden(hidden);
            }
        }
        hasMainWindowBorder() {
            return this.state.runtime.mainWindowBorder;
        }
        getMainWindowBorderRadius() {
            return this.state.runtime.mainWindowBorder && platform_1.isMacintosh ? '5px' : undefined;
        }
        isPanelMaximized() {
            // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            return (this.getPanelAlignment() === 'center' || this.getPanelPosition() !== 2 /* Position.BOTTOM */) && !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */, window_2.mainWindow);
        }
        getSideBarPosition() {
            return this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON);
        }
        getPanelAlignment() {
            return this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT);
        }
        updateMenubarVisibility(skipLayout) {
            const shouldShowTitleBar = this.shouldShowTitleBar();
            if (!skipLayout && this.workbenchGrid && shouldShowTitleBar !== this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, window_2.mainWindow)) {
                this.workbenchGrid.setViewVisible(this.titleBarPartView, shouldShowTitleBar);
            }
        }
        updateCustomTitleBarVisibility() {
            const shouldShowTitleBar = this.shouldShowTitleBar();
            const titlebarVisible = this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */);
            if (shouldShowTitleBar !== titlebarVisible) {
                this.workbenchGrid.setViewVisible(this.titleBarPartView, shouldShowTitleBar);
            }
        }
        toggleMenuBar() {
            let currentVisibilityValue = (0, window_1.getMenuBarVisibility)(this.configurationService);
            if (typeof currentVisibilityValue !== 'string') {
                currentVisibilityValue = 'classic';
            }
            let newVisibilityValue;
            if (currentVisibilityValue === 'visible' || currentVisibilityValue === 'classic') {
                newVisibilityValue = (0, window_1.hasNativeTitlebar)(this.configurationService) ? 'toggle' : 'compact';
            }
            else {
                newVisibilityValue = 'classic';
            }
            this.configurationService.updateValue('window.menuBarVisibility', newVisibilityValue);
        }
        getPanelPosition() {
            return this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION);
        }
        setPanelPosition(position) {
            if (!this.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                this.setPanelHidden(false);
            }
            const panelPart = this.getPart("workbench.parts.panel" /* Parts.PANEL_PART */);
            const oldPositionValue = (0, layoutService_1.positionToString)(this.getPanelPosition());
            const newPositionValue = (0, layoutService_1.positionToString)(position);
            // Adjust CSS
            const panelContainer = (0, types_1.assertIsDefined)(panelPart.getContainer());
            panelContainer.classList.remove(oldPositionValue);
            panelContainer.classList.add(newPositionValue);
            // Update Styles
            panelPart.updateStyles();
            // Layout
            const size = this.workbenchGrid.getViewSize(this.panelPartView);
            const sideBarSize = this.workbenchGrid.getViewSize(this.sideBarPartView);
            const auxiliaryBarSize = this.workbenchGrid.getViewSize(this.auxiliaryBarPartView);
            let editorHidden = !this.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */, window_2.mainWindow);
            // Save last non-maximized size for panel before move
            if (newPositionValue !== oldPositionValue && !editorHidden) {
                // Save the current size of the panel for the new orthogonal direction
                // If moving down, save the width of the panel
                // Otherwise, save the height of the panel
                if (position === 2 /* Position.BOTTOM */) {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH, size.width);
                }
                else if ((0, layoutService_1.positionFromString)(oldPositionValue) === 2 /* Position.BOTTOM */) {
                    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT, size.height);
                }
            }
            if (position === 2 /* Position.BOTTOM */ && this.getPanelAlignment() !== 'center' && editorHidden) {
                this.toggleMaximizedPanel();
                editorHidden = false;
            }
            this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_POSITION, position);
            const sideBarVisible = this.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const auxiliaryBarVisible = this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            if (position === 2 /* Position.BOTTOM */) {
                this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size.height : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT), this.editorPartView, 1 /* Direction.Down */);
            }
            else if (position === 1 /* Position.RIGHT */) {
                this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size.width : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH), this.editorPartView, 3 /* Direction.Right */);
            }
            else {
                this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size.width : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH), this.editorPartView, 2 /* Direction.Left */);
            }
            // Reset sidebar to original size before shifting the panel
            this.workbenchGrid.resizeView(this.sideBarPartView, sideBarSize);
            if (!sideBarVisible) {
                this.setSideBarHidden(true);
            }
            this.workbenchGrid.resizeView(this.auxiliaryBarPartView, auxiliaryBarSize);
            if (!auxiliaryBarVisible) {
                this.setAuxiliaryBarHidden(true);
            }
            if (position === 2 /* Position.BOTTOM */) {
                this.adjustPartPositions(this.getSideBarPosition(), this.getPanelAlignment(), position);
            }
            this._onDidChangePanelPosition.fire(newPositionValue);
        }
        isWindowMaximized(targetWindow) {
            return this.state.runtime.maximized.has((0, dom_1.getWindowId)(targetWindow));
        }
        updateWindowMaximizedState(targetWindow, maximized) {
            this.mainContainer.classList.toggle(LayoutClasses.MAXIMIZED, maximized);
            const targetWindowId = (0, dom_1.getWindowId)(targetWindow);
            if (maximized === this.state.runtime.maximized.has(targetWindowId)) {
                return;
            }
            if (maximized) {
                this.state.runtime.maximized.add(targetWindowId);
            }
            else {
                this.state.runtime.maximized.delete(targetWindowId);
            }
            this.updateWindowsBorder();
            this._onDidChangeWindowMaximized.fire({ windowId: targetWindowId, maximized });
        }
        getVisibleNeighborPart(part, direction) {
            if (!this.workbenchGrid) {
                return undefined;
            }
            if (!this.isVisible(part, window_2.mainWindow)) {
                return undefined;
            }
            const neighborViews = this.workbenchGrid.getNeighborViews(this.getPart(part), direction, false);
            if (!neighborViews) {
                return undefined;
            }
            for (const neighborView of neighborViews) {
                const neighborPart = ["workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */, "workbench.parts.editor" /* Parts.EDITOR_PART */, "workbench.parts.panel" /* Parts.PANEL_PART */, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */]
                    .find(partId => this.getPart(partId) === neighborView && this.isVisible(partId, window_2.mainWindow));
                if (neighborPart !== undefined) {
                    return neighborPart;
                }
            }
            return undefined;
        }
        onDidChangeWCO() {
            const bannerFirst = this.workbenchGrid.getNeighborViews(this.titleBarPartView, 0 /* Direction.Up */, false).length > 0;
            const shouldBannerBeFirst = this.shouldShowBannerFirst();
            if (bannerFirst !== shouldBannerBeFirst) {
                this.workbenchGrid.moveView(this.bannerPartView, grid_1.Sizing.Distribute, this.titleBarPartView, shouldBannerBeFirst ? 0 /* Direction.Up */ : 1 /* Direction.Down */);
            }
            this.workbenchGrid.setViewVisible(this.titleBarPartView, this.shouldShowTitleBar());
        }
        arrangeEditorNodes(nodes, availableHeight, availableWidth) {
            if (!nodes.sideBar && !nodes.auxiliaryBar) {
                nodes.editor.size = availableHeight;
                return nodes.editor;
            }
            const result = [nodes.editor];
            nodes.editor.size = availableWidth;
            if (nodes.sideBar) {
                if (this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 0 /* Position.LEFT */) {
                    result.splice(0, 0, nodes.sideBar);
                }
                else {
                    result.push(nodes.sideBar);
                }
                nodes.editor.size -= this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN) ? 0 : nodes.sideBar.size;
            }
            if (nodes.auxiliaryBar) {
                if (this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 1 /* Position.RIGHT */) {
                    result.splice(0, 0, nodes.auxiliaryBar);
                }
                else {
                    result.push(nodes.auxiliaryBar);
                }
                nodes.editor.size -= this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN) ? 0 : nodes.auxiliaryBar.size;
            }
            return {
                type: 'branch',
                data: result,
                size: availableHeight
            };
        }
        arrangeMiddleSectionNodes(nodes, availableWidth, availableHeight) {
            const activityBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN) ? 0 : nodes.activityBar.size;
            const sideBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN) ? 0 : nodes.sideBar.size;
            const auxiliaryBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN) ? 0 : nodes.auxiliaryBar.size;
            const panelSize = this.stateModel.getInitializationValue(LayoutStateKeys.PANEL_SIZE) ? 0 : nodes.panel.size;
            const result = [];
            if (this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION) !== 2 /* Position.BOTTOM */) {
                result.push(nodes.editor);
                nodes.editor.size = availableWidth - activityBarSize - sideBarSize - panelSize - auxiliaryBarSize;
                if (this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION) === 1 /* Position.RIGHT */) {
                    result.push(nodes.panel);
                }
                else {
                    result.splice(0, 0, nodes.panel);
                }
                if (this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 0 /* Position.LEFT */) {
                    result.push(nodes.auxiliaryBar);
                    result.splice(0, 0, nodes.sideBar);
                    result.splice(0, 0, nodes.activityBar);
                }
                else {
                    result.splice(0, 0, nodes.auxiliaryBar);
                    result.push(nodes.sideBar);
                    result.push(nodes.activityBar);
                }
            }
            else {
                const panelAlignment = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT);
                const sideBarPosition = this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON);
                const sideBarNextToEditor = !(panelAlignment === 'center' || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'right') || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'left'));
                const auxiliaryBarNextToEditor = !(panelAlignment === 'center' || (sideBarPosition === 1 /* Position.RIGHT */ && panelAlignment === 'right') || (sideBarPosition === 0 /* Position.LEFT */ && panelAlignment === 'left'));
                const editorSectionWidth = availableWidth - activityBarSize - (sideBarNextToEditor ? 0 : sideBarSize) - (auxiliaryBarNextToEditor ? 0 : auxiliaryBarSize);
                result.push({
                    type: 'branch',
                    data: [this.arrangeEditorNodes({
                            editor: nodes.editor,
                            sideBar: sideBarNextToEditor ? nodes.sideBar : undefined,
                            auxiliaryBar: auxiliaryBarNextToEditor ? nodes.auxiliaryBar : undefined
                        }, availableHeight - panelSize, editorSectionWidth), nodes.panel],
                    size: editorSectionWidth
                });
                if (!sideBarNextToEditor) {
                    if (sideBarPosition === 0 /* Position.LEFT */) {
                        result.splice(0, 0, nodes.sideBar);
                    }
                    else {
                        result.push(nodes.sideBar);
                    }
                }
                if (!auxiliaryBarNextToEditor) {
                    if (sideBarPosition === 1 /* Position.RIGHT */) {
                        result.splice(0, 0, nodes.auxiliaryBar);
                    }
                    else {
                        result.push(nodes.auxiliaryBar);
                    }
                }
                if (sideBarPosition === 0 /* Position.LEFT */) {
                    result.splice(0, 0, nodes.activityBar);
                }
                else {
                    result.push(nodes.activityBar);
                }
            }
            return result;
        }
        createGridDescriptor() {
            const { width, height } = this.stateModel.getInitializationValue(LayoutStateKeys.GRID_SIZE);
            const sideBarSize = this.stateModel.getInitializationValue(LayoutStateKeys.SIDEBAR_SIZE);
            const auxiliaryBarPartSize = this.stateModel.getInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE);
            const panelSize = this.stateModel.getInitializationValue(LayoutStateKeys.PANEL_SIZE);
            const titleBarHeight = this.titleBarPartView.minimumHeight;
            const bannerHeight = this.bannerPartView.minimumHeight;
            const statusBarHeight = this.statusBarPartView.minimumHeight;
            const activityBarWidth = this.activityBarPartView.minimumWidth;
            const middleSectionHeight = height - titleBarHeight - statusBarHeight;
            const titleAndBanner = [
                {
                    type: 'leaf',
                    data: { type: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */ },
                    size: titleBarHeight,
                    visible: this.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, window_2.mainWindow)
                },
                {
                    type: 'leaf',
                    data: { type: "workbench.parts.banner" /* Parts.BANNER_PART */ },
                    size: bannerHeight,
                    visible: false
                }
            ];
            const activityBarNode = {
                type: 'leaf',
                data: { type: "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */ },
                size: activityBarWidth,
                visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN)
            };
            const sideBarNode = {
                type: 'leaf',
                data: { type: "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ },
                size: sideBarSize,
                visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN)
            };
            const auxiliaryBarNode = {
                type: 'leaf',
                data: { type: "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */ },
                size: auxiliaryBarPartSize,
                visible: this.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)
            };
            const editorNode = {
                type: 'leaf',
                data: { type: "workbench.parts.editor" /* Parts.EDITOR_PART */ },
                size: 0, // Update based on sibling sizes
                visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN)
            };
            const panelNode = {
                type: 'leaf',
                data: { type: "workbench.parts.panel" /* Parts.PANEL_PART */ },
                size: panelSize,
                visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN)
            };
            const middleSection = this.arrangeMiddleSectionNodes({
                activityBar: activityBarNode,
                auxiliaryBar: auxiliaryBarNode,
                editor: editorNode,
                panel: panelNode,
                sideBar: sideBarNode
            }, width, middleSectionHeight);
            const result = {
                root: {
                    type: 'branch',
                    size: width,
                    data: [
                        ...(this.shouldShowBannerFirst() ? titleAndBanner.reverse() : titleAndBanner),
                        {
                            type: 'branch',
                            data: middleSection,
                            size: middleSectionHeight
                        },
                        {
                            type: 'leaf',
                            data: { type: "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */ },
                            size: statusBarHeight,
                            visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN)
                        }
                    ]
                },
                orientation: 0 /* Orientation.VERTICAL */,
                width,
                height
            };
            const layoutDescriptor = {
                activityBarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN),
                sideBarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN),
                auxiliaryBarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN),
                panelVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN),
                statusbarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN),
                sideBarPosition: (0, layoutService_1.positionToString)(this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON)),
                panelPosition: (0, layoutService_1.positionToString)(this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION)),
            };
            this.telemetryService.publicLog2('startupLayout', layoutDescriptor);
            return result;
        }
        dispose() {
            super.dispose();
            this.disposed = true;
        }
    }
    exports.Layout = Layout;
    function getZenModeConfiguration(configurationService) {
        return configurationService.getValue(WorkbenchLayoutSettings.ZEN_MODE_CONFIG);
    }
    class WorkbenchLayoutStateKey {
        constructor(name, scope, target, defaultValue) {
            this.name = name;
            this.scope = scope;
            this.target = target;
            this.defaultValue = defaultValue;
        }
    }
    class RuntimeStateKey extends WorkbenchLayoutStateKey {
        constructor(name, scope, target, defaultValue, zenModeIgnore) {
            super(name, scope, target, defaultValue);
            this.zenModeIgnore = zenModeIgnore;
            this.runtime = true;
        }
    }
    class InitializationStateKey extends WorkbenchLayoutStateKey {
        constructor() {
            super(...arguments);
            this.runtime = false;
        }
    }
    const LayoutStateKeys = {
        // Editor
        EDITOR_CENTERED: new RuntimeStateKey('editor.centered', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        // Zen Mode
        ZEN_MODE_ACTIVE: new RuntimeStateKey('zenMode.active', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        ZEN_MODE_EXIT_INFO: new RuntimeStateKey('zenMode.exitInfo', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, {
            transitionedToCenteredEditorLayout: false,
            transitionedToFullScreen: false,
            handleNotificationsDoNotDisturbMode: false,
            wasVisible: {
                auxiliaryBar: false,
                panel: false,
                sideBar: false,
            },
        }),
        // Part Sizing
        GRID_SIZE: new InitializationStateKey('grid.size', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, { width: 800, height: 600 }),
        SIDEBAR_SIZE: new InitializationStateKey('sideBar.size', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 200),
        AUXILIARYBAR_SIZE: new InitializationStateKey('auxiliaryBar.size', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 200),
        PANEL_SIZE: new InitializationStateKey('panel.size', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 300),
        PANEL_LAST_NON_MAXIMIZED_HEIGHT: new RuntimeStateKey('panel.lastNonMaximizedHeight', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 300),
        PANEL_LAST_NON_MAXIMIZED_WIDTH: new RuntimeStateKey('panel.lastNonMaximizedWidth', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */, 300),
        PANEL_WAS_LAST_MAXIMIZED: new RuntimeStateKey('panel.wasLastMaximized', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        // Part Positions
        SIDEBAR_POSITON: new RuntimeStateKey('sideBar.position', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, 0 /* Position.LEFT */),
        PANEL_POSITION: new RuntimeStateKey('panel.position', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, 2 /* Position.BOTTOM */),
        PANEL_ALIGNMENT: new RuntimeStateKey('panel.alignment', 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */, 'center'),
        // Part Visibility
        ACTIVITYBAR_HIDDEN: new RuntimeStateKey('activityBar.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false, true),
        SIDEBAR_HIDDEN: new RuntimeStateKey('sideBar.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        EDITOR_HIDDEN: new RuntimeStateKey('editor.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false),
        PANEL_HIDDEN: new RuntimeStateKey('panel.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, true),
        AUXILIARYBAR_HIDDEN: new RuntimeStateKey('auxiliaryBar.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, true),
        STATUSBAR_HIDDEN: new RuntimeStateKey('statusBar.hidden', 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */, false, true)
    };
    var WorkbenchLayoutSettings;
    (function (WorkbenchLayoutSettings) {
        WorkbenchLayoutSettings["PANEL_POSITION"] = "workbench.panel.defaultLocation";
        WorkbenchLayoutSettings["PANEL_OPENS_MAXIMIZED"] = "workbench.panel.opensMaximized";
        WorkbenchLayoutSettings["ZEN_MODE_CONFIG"] = "zenMode";
        WorkbenchLayoutSettings["EDITOR_CENTERED_LAYOUT_AUTO_RESIZE"] = "workbench.editor.centeredLayoutAutoResize";
    })(WorkbenchLayoutSettings || (WorkbenchLayoutSettings = {}));
    var LegacyWorkbenchLayoutSettings;
    (function (LegacyWorkbenchLayoutSettings) {
        LegacyWorkbenchLayoutSettings["STATUSBAR_VISIBLE"] = "workbench.statusBar.visible";
        LegacyWorkbenchLayoutSettings["SIDEBAR_POSITION"] = "workbench.sideBar.location";
    })(LegacyWorkbenchLayoutSettings || (LegacyWorkbenchLayoutSettings = {}));
    class LayoutStateModel extends lifecycle_1.Disposable {
        static { this.STORAGE_PREFIX = 'workbench.'; }
        constructor(storageService, configurationService, contextService, container) {
            super();
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.container = container;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
            this.stateCache = new Map();
            this._register(this.configurationService.onDidChangeConfiguration(configurationChange => this.updateStateFromLegacySettings(configurationChange)));
        }
        updateStateFromLegacySettings(configurationChangeEvent) {
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            if (configurationChangeEvent.affectsConfiguration("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) && !isZenMode) {
                this.setRuntimeValueAndFire(LayoutStateKeys.ACTIVITYBAR_HIDDEN, this.isActivityBarHidden());
            }
            if (configurationChangeEvent.affectsConfiguration(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE) && !isZenMode) {
                this.setRuntimeValueAndFire(LayoutStateKeys.STATUSBAR_HIDDEN, !this.configurationService.getValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE));
            }
            if (configurationChangeEvent.affectsConfiguration(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION)) {
                this.setRuntimeValueAndFire(LayoutStateKeys.SIDEBAR_POSITON, (0, layoutService_1.positionFromString)(this.configurationService.getValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION) ?? 'left'));
            }
        }
        updateLegacySettingsFromState(key, value) {
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            if (key.zenModeIgnore && isZenMode) {
                return;
            }
            if (key === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
                this.configurationService.updateValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */, value ? "hidden" /* ActivityBarPosition.HIDDEN */ : undefined);
            }
            else if (key === LayoutStateKeys.STATUSBAR_HIDDEN) {
                this.configurationService.updateValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE, !value);
            }
            else if (key === LayoutStateKeys.SIDEBAR_POSITON) {
                this.configurationService.updateValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION, (0, layoutService_1.positionToString)(value));
            }
        }
        load() {
            let key;
            // Load stored values for all keys
            for (key in LayoutStateKeys) {
                const stateKey = LayoutStateKeys[key];
                const value = this.loadKeyFromStorage(stateKey);
                if (value !== undefined) {
                    this.stateCache.set(stateKey.name, value);
                }
            }
            // Apply legacy settings
            this.stateCache.set(LayoutStateKeys.ACTIVITYBAR_HIDDEN.name, this.isActivityBarHidden());
            this.stateCache.set(LayoutStateKeys.STATUSBAR_HIDDEN.name, !this.configurationService.getValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE));
            this.stateCache.set(LayoutStateKeys.SIDEBAR_POSITON.name, (0, layoutService_1.positionFromString)(this.configurationService.getValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION) ?? 'left'));
            // Set dynamic defaults: part sizing and side bar visibility
            const workbenchDimensions = (0, dom_1.getClientArea)(this.container);
            LayoutStateKeys.PANEL_POSITION.defaultValue = (0, layoutService_1.positionFromString)(this.configurationService.getValue(WorkbenchLayoutSettings.PANEL_POSITION) ?? 'bottom');
            LayoutStateKeys.GRID_SIZE.defaultValue = { height: workbenchDimensions.height, width: workbenchDimensions.width };
            LayoutStateKeys.SIDEBAR_SIZE.defaultValue = Math.min(300, workbenchDimensions.width / 4);
            LayoutStateKeys.AUXILIARYBAR_SIZE.defaultValue = Math.min(300, workbenchDimensions.width / 4);
            LayoutStateKeys.PANEL_SIZE.defaultValue = (this.stateCache.get(LayoutStateKeys.PANEL_POSITION.name) ?? LayoutStateKeys.PANEL_POSITION.defaultValue) === 'bottom' ? workbenchDimensions.height / 3 : workbenchDimensions.width / 4;
            LayoutStateKeys.SIDEBAR_HIDDEN.defaultValue = this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */;
            // Apply all defaults
            for (key in LayoutStateKeys) {
                const stateKey = LayoutStateKeys[key];
                if (this.stateCache.get(stateKey.name) === undefined) {
                    this.stateCache.set(stateKey.name, stateKey.defaultValue);
                }
            }
            // Register for runtime key changes
            this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this._register(new lifecycle_1.DisposableStore()))(storageChangeEvent => {
                let key;
                for (key in LayoutStateKeys) {
                    const stateKey = LayoutStateKeys[key];
                    if (stateKey instanceof RuntimeStateKey && stateKey.scope === 0 /* StorageScope.PROFILE */ && stateKey.target === 0 /* StorageTarget.USER */) {
                        if (`${LayoutStateModel.STORAGE_PREFIX}${stateKey.name}` === storageChangeEvent.key) {
                            const value = this.loadKeyFromStorage(stateKey) ?? stateKey.defaultValue;
                            if (this.stateCache.get(stateKey.name) !== value) {
                                this.stateCache.set(stateKey.name, value);
                                this._onDidChangeState.fire({ key: stateKey, value });
                            }
                        }
                    }
                }
            }));
        }
        save(workspace, global) {
            let key;
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            for (key in LayoutStateKeys) {
                const stateKey = LayoutStateKeys[key];
                if ((workspace && stateKey.scope === 1 /* StorageScope.WORKSPACE */) ||
                    (global && stateKey.scope === 0 /* StorageScope.PROFILE */)) {
                    if (isZenMode && stateKey instanceof RuntimeStateKey && stateKey.zenModeIgnore) {
                        continue; // Don't write out specific keys while in zen mode
                    }
                    this.saveKeyToStorage(stateKey);
                }
            }
        }
        getInitializationValue(key) {
            return this.stateCache.get(key.name);
        }
        setInitializationValue(key, value) {
            this.stateCache.set(key.name, value);
        }
        getRuntimeValue(key, fallbackToSetting) {
            if (fallbackToSetting) {
                switch (key) {
                    case LayoutStateKeys.ACTIVITYBAR_HIDDEN:
                        this.stateCache.set(key.name, this.isActivityBarHidden());
                        break;
                    case LayoutStateKeys.STATUSBAR_HIDDEN:
                        this.stateCache.set(key.name, !this.configurationService.getValue(LegacyWorkbenchLayoutSettings.STATUSBAR_VISIBLE));
                        break;
                    case LayoutStateKeys.SIDEBAR_POSITON:
                        this.stateCache.set(key.name, this.configurationService.getValue(LegacyWorkbenchLayoutSettings.SIDEBAR_POSITION) ?? 'left');
                        break;
                }
            }
            return this.stateCache.get(key.name);
        }
        setRuntimeValue(key, value) {
            this.stateCache.set(key.name, value);
            const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
            if (key.scope === 0 /* StorageScope.PROFILE */) {
                if (!isZenMode || !key.zenModeIgnore) {
                    this.saveKeyToStorage(key);
                    this.updateLegacySettingsFromState(key, value);
                }
            }
        }
        isActivityBarHidden() {
            const oldValue = this.configurationService.getValue('workbench.activityBar.visible');
            if (oldValue !== undefined) {
                return !oldValue;
            }
            return this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) !== "side" /* ActivityBarPosition.SIDE */;
        }
        setRuntimeValueAndFire(key, value) {
            const previousValue = this.stateCache.get(key.name);
            if (previousValue === value) {
                return;
            }
            this.setRuntimeValue(key, value);
            this._onDidChangeState.fire({ key, value });
        }
        saveKeyToStorage(key) {
            const value = this.stateCache.get(key.name);
            this.storageService.store(`${LayoutStateModel.STORAGE_PREFIX}${key.name}`, typeof value === 'object' ? JSON.stringify(value) : value, key.scope, key.target);
        }
        loadKeyFromStorage(key) {
            let value = this.storageService.get(`${LayoutStateModel.STORAGE_PREFIX}${key.name}`, key.scope);
            if (value !== undefined) {
                switch (typeof key.defaultValue) {
                    case 'boolean':
                        value = value === 'true';
                        break;
                    case 'number':
                        value = parseInt(value);
                        break;
                    case 'object':
                        value = JSON.parse(value);
                        break;
                }
            }
            return value;
        }
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9sYXlvdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNkZoRyxJQUFLLGFBU0o7SUFURCxXQUFLLGFBQWE7UUFDakIsNkNBQTRCLENBQUE7UUFDNUIsNkRBQTRDLENBQUE7UUFDNUMseUNBQXdCLENBQUE7UUFDeEIsdURBQXNDLENBQUE7UUFDdEMsaURBQWdDLENBQUE7UUFDaEMsMENBQXlCLENBQUE7UUFDekIsd0NBQXVCLENBQUE7UUFDdkIseUNBQXdCLENBQUE7SUFDekIsQ0FBQyxFQVRJLGFBQWEsS0FBYixhQUFhLFFBU2pCO0lBY0QsTUFBc0IsTUFBTyxTQUFRLHNCQUFVO1FBK0M5QyxJQUFJLGVBQWUsS0FBSyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFBLHVCQUFpQixHQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEYsSUFBSSxVQUFVO1lBQ2IsTUFBTSxVQUFVLEdBQWtCLEVBQUUsQ0FBQztZQUNyQyxLQUFLLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxJQUFBLGdCQUFVLEdBQUUsRUFBRSxDQUFDO2dCQUN2QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNqRSxDQUFDO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztRQUVPLHdCQUF3QixDQUFDLGNBQXdCO1lBQ3hELElBQUksY0FBYyxLQUFLLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3pELGNBQWM7Z0JBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQzNCLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxtQkFBbUI7Z0JBQ25CLE9BQU8s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
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
define(["require", "exports", "vs/nls", "vs/workbench/browser/part", "vs/base/browser/browser", "vs/platform/window/common/window", "vs/platform/contextview/browser/contextView", "vs/base/browser/mouseEvent", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/base/common/platform", "vs/base/common/color", "vs/base/browser/dom", "vs/workbench/browser/parts/titlebar/menubarControl", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/workbench/services/layout/browser/layoutService", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/host/browser/host", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/browser/parts/titlebar/windowTitle", "vs/workbench/browser/parts/titlebar/commandCenterControl", "vs/platform/hover/browser/hover", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/browser/toolbar", "vs/workbench/common/activity", "vs/workbench/browser/parts/globalCompositeBar", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/actions", "vs/workbench/services/editor/common/editorService", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/keybinding/common/keybinding", "vs/workbench/browser/parts/editor/editorTabsControl", "vs/base/browser/window", "vs/workbench/browser/parts/titlebar/titlebarActions", "vs/css!./media/titlebarpart"], function (require, exports, nls_1, part_1, browser_1, window_1, contextView_1, mouseEvent_1, configuration_1, lifecycle_1, environmentService_1, themeService_1, themables_1, theme_1, platform_1, color_1, dom_1, menubarControl_1, instantiation_1, event_1, storage_1, layoutService_1, menuEntryActionViewItem_1, actions_1, contextkey_1, host_1, codicons_1, iconRegistry_1, windowTitle_1, commandCenterControl_1, hover_1, actionCommonCategories_1, toolbar_1, activity_1, globalCompositeBar_1, editorGroupsService_1, actions_2, editorService_1, actionbar_1, editorCommands_1, editorPane_1, keybinding_1, editorTabsControl_1, window_2, titlebarActions_1) {
    "use strict";
    var AuxiliaryBrowserTitlebarPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuxiliaryBrowserTitlebarPart = exports.MainBrowserTitlebarPart = exports.BrowserTitlebarPart = exports.BrowserTitleService = void 0;
    let BrowserTitleService = class BrowserTitleService extends part_1.MultiWindowParts {
        constructor(instantiationService, storageService, themeService) {
            super('workbench.titleService', themeService, storageService);
            this.instantiationService = instantiationService;
            this.mainPart = this._register(this.createMainTitlebarPart());
            //#endregion
            //#region Service Implementation
            this.onMenubarVisibilityChange = this.mainPart.onMenubarVisibilityChange;
            this._register(this.registerPart(this.mainPart));
            this.registerActions();
        }
        createMainTitlebarPart() {
            return this.instantiationService.createInstance(MainBrowserTitlebarPart);
        }
        registerActions() {
            // Focus action
            const that = this;
            (0, actions_1.registerAction2)(class FocusTitleBar extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.action.focusTitleBar`,
                        title: (0, nls_1.localize2)('focusTitleBar', 'Focus Title Bar'),
                        category: actionCommonCategories_1.Categories.View,
                        f1: true,
                    });
                }
                run() {
                    that.getPartByDocument((0, dom_1.getActiveDocument)()).focus();
                }
            });
        }
        //#region Auxiliary Titlebar Parts
        createAuxiliaryTitlebarPart(container, editorGroupsContainer) {
            const titlebarPartContainer = document.createElement('div');
            titlebarPartContainer.classList.add('part', 'titlebar');
            titlebarPartContainer.setAttribute('role', 'none');
            titlebarPartContainer.style.position = 'relative';
            container.insertBefore(titlebarPartContainer, container.firstChild); // ensure we are first element
            const disposables = new lifecycle_1.DisposableStore();
            const titlebarPart = this.doCreateAuxiliaryTitlebarPart(titlebarPartContainer, editorGroupsContainer);
            disposables.add(this.registerPart(titlebarPart));
            disposables.add(event_1.Event.runAndSubscribe(titlebarPart.onDidChange, () => titlebarPartContainer.style.height = `${titlebarPart.height}px`));
            titlebarPart.create(titlebarPartContainer);
            event_1.Event.once(titlebarPart.onWillDispose)(() => disposables.dispose());
            return titlebarPart;
        }
        doCreateAuxiliaryTitlebarPart(container, editorGroupsContainer) {
            return this.instantiationService.createInstance(AuxiliaryBrowserTitlebarPart, container, editorGroupsContainer, this.mainPart);
        }
        updateProperties(properties) {
            for (const part of this.parts) {
                part.updateProperties(properties);
            }
        }
    };
    exports.BrowserTitleService = BrowserTitleService;
    exports.BrowserTitleService = BrowserTitleService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, storage_1.IStorageService),
        __param(2, themeService_1.IThemeService)
    ], BrowserTitleService);
    let TitlebarPartHoverDelegate = class TitlebarPartHoverDelegate {
        get delay() {
            return Date.now() - this.lastHoverHideTime < 200
                ? 0 // show instantly when a hover was recently shown
                : this.configurationService.getValue('workbench.hover.delay');
        }
        constructor(hoverService, configurationService) {
            this.hoverService = hoverService;
            this.configurationService = configurationService;
            this.showHover = this.hoverService.showHover.bind(this.hoverService);
            this.placement = 'element';
            this.lastHoverHideTime = 0;
        }
        onDidHideHover() {
            this.lastHoverHideTime = Date.now();
        }
    };
    TitlebarPartHoverDelegate = __decorate([
        __param(0, hover_1.IHoverService),
        __param(1, configuration_1.IConfigurationService)
    ], TitlebarPartHoverDelegate);
    let BrowserTitlebarPart = class BrowserTitlebarPart extends part_1.Part {
        get minimumHeight() {
            const value = this.isCommandCenterVisible || (platform_1.isWeb && (0, browser_1.isWCOEnabled)()) ? 35 : 30;
            return value / (this.preventZoom ? (0, browser_1.getZoomFactor)((0, dom_1.getWindow)(this.element)) : 1);
        }
        get maximumHeight() { return this.minimumHeight; }
        constructor(id, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, hoverService, editorGroupService, editorService, menuService, keybindingService) {
            super(id, { hasTitle: false }, themeService, storageService, layoutService);
            this.contextMenuService = contextMenuService;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.hostService = hostService;
            this.hoverService = hoverService;
            this.editorGroupService = editorGroupService;
            this.menuService = menuService;
            this.keybindingService = keybindingService;
            //#region IView
            this.minimumWidth = 0;
            this.maximumWidth = Number.POSITIVE_INFINITY;
            //#endregion
            //#region Events
            this._onMenubarVisibilityChange = this._register(new event_1.Emitter());
            this.onMenubarVisibilityChange = this._onMenubarVisibilityChange.event;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.actionToolBarDisposable = this._register(new lifecycle_1.DisposableStore());
            this.editorActionsChangeDisposable = this._register(new lifecycle_1.DisposableStore());
            this.editorToolbarMenuDisposables = this._register(new lifecycle_1.DisposableStore());
            this.layoutToolbarMenuDisposables = this._register(new lifecycle_1.DisposableStore());
            this.hoverDelegate = new TitlebarPartHoverDelegate(this.hoverService, this.configurationService);
            this.titleDisposables = this._register(new lifecycle_1.DisposableStore());
            this.titleBarStyle = (0, window_1.getTitleBarStyle)(this.configurationService);
            this.isInactive = false;
            this.isAuxiliary = editorGroupsContainer !== 'main';
            this.editorService = editorService.createScoped(editorGroupsContainer, this._store);
            this.editorGroupsContainer = editorGroupsContainer === 'main' ? editorGroupService.mainPart : editorGroupsContainer;
            this.windowTitle = this._register(instantiationService.createInstance(windowTitle_1.WindowTitle, targetWindow, editorGroupsContainer));
            this.registerListeners((0, dom_1.getWindowId)(targetWindow));
        }
        registerListeners(targetWindowId) {
            this._register(this.hostService.onDidChangeFocus(focused => focused ? this.onFocus() : this.onBlur()));
            this._register(this.hostService.onDidChangeActiveWindow(windowId => windowId === targetWindowId ? this.onFocus() : this.onBlur()));
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
            this._register(this.editorGroupService.onDidChangeEditorPartOptions(e => this.onEditorPartConfigurationChange(e)));
        }
        onBlur() {
            this.isInactive = true;
            this.updateStyles();
        }
        onFocus() {
            this.isInactive = false;
            this.updateStyles();
        }
        onEditorPartConfigurationChange({ oldPartOptions, newPartOptions }) {
            if (oldPartOptions.editorActionsLocation !== newPartOptions.editorActionsLocation ||
                oldPartOptions.showTabs !== newPartOptions.showTabs) {
                if ((0, window_1.hasCustomTitlebar)(this.configurationService, this.titleBarStyle) && this.actionToolBar) {
                    this.createActionToolBar();
                    this.createActionToolBarMenus({ editorActions: true });
                    this._onDidChange.fire(undefined);
                }
            }
        }
        onConfigurationChanged(event) {
            // Custom menu bar (disabled if auxiliary)
            if (!this.isAuxiliary && !(0, window_1.hasNativeTitlebar)(this.configurationService, this.titleBarStyle) && (!platform_1.isMacintosh || platform_1.isWeb)) {
                if (event.affectsConfiguration('window.menuBarVisibility')) {
                    if (this.currentMenubarVisibility === 'compact') {
                        this.uninstallMenubar();
                    }
                    else {
                        this.installMenubar();
                    }
                }
            }
            // Actions
            if ((0, window_1.hasCustomTitlebar)(this.configurationService, this.titleBarStyle) && this.actionToolBar) {
                const affectsLayoutControl = event.affectsConfiguration("workbench.layoutControl.enabled" /* LayoutSettings.LAYOUT_ACTIONS */);
                const affectsActivityControl = event.affectsConfiguration("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */);
                if (affectsLayoutControl || affectsActivityControl) {
                    this.createActionToolBarMenus({ layoutActions: affectsLayoutControl, activityActions: affectsActivityControl });
                    this._onDidChange.fire(undefined);
                }
            }
            // Command Center
            if (event.affectsConfiguration("window.commandCenter" /* LayoutSettings.COMMAND_CENTER */)) {
                this.createTitle();
                this._onDidChange.fire(undefined);
            }
        }
        installMenubar() {
            if (this.menubar) {
                return; // If the menubar is already installed, skip
            }
            this.customMenubar = this._register(this.instantiationService.createInstance(menubarControl_1.CustomMenubarControl));
            this.menubar = (0, dom_1.append)(this.leftContent, (0, dom_1.$)('div.menubar'));
            this.menubar.setAttribute('role', 'menubar');
            this._register(this.customMenubar.onVisibilityChange(e => this.onMenubarVisibilityChanged(e)));
            this.customMenubar.create(this.menubar);
        }
        uninstallMenubar() {
            this.customMenubar?.dispose();
            this.customMenubar = undefined;
            this.menubar?.remove();
            this.menubar = undefined;
            this.onMenubarVisibilityChanged(false);
        }
        onMenubarVisibilityChanged(visible) {
            if (platform_1.isWeb || platform_1.isWindows || platform_1.isLinux) {
                if (this.lastLayoutDimensions) {
                    this.layout(this.lastLayoutDimensions.width, this.lastLayoutDimensions.height);
                }
                this._onMenubarVisibilityChange.fire(visible);
            }
        }
        updateProperties(properties) {
            this.windowTitle.updateProperties(properties);
        }
        createContentArea(parent) {
            this.element = parent;
            this.rootContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.titlebar-container'));
            this.leftContent = (0, dom_1.append)(this.rootContainer, (0, dom_1.$)('.titlebar-left'));
            this.centerContent = (0, dom_1.append)(this.rootContainer, (0, dom_1.$)('.titlebar-center'));
            this.rightContent = (0, dom_1.append)(this.rootContainer, (0, dom_1.$)('.titlebar-right'));
            // App Icon (Native Windows/Linux and Web)
            if (!platform_1.isMacintosh && !platform_1.isWeb && !(0, window_1.hasNativeTitlebar)(this.configurationService, this.titleBarStyle)) {
                this.appIcon = (0, dom_1.prepend)(this.leftContent, (0, dom_1.$)('a.window-appicon'));
                // Web-only home indicator and menu (not for auxiliary windows)
                if (!this.isAuxiliary && platform_1.isWeb) {
                    const homeIndicator = this.environmentService.options?.homeIndicator;
                    if (homeIndicator) {
                        const icon = (0, iconRegistry_1.getIconRegistry)().getIcon(homeIndicator.icon) ? { id: homeIndicator.icon } : codicons_1.Codicon.code;
                        this.appIcon.setAttribute('href', homeIndicator.href);
                        this.appIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon));
                        this.appIconBadge = document.createElement('div');
                        this.appIconBadge.classList.add('home-bar-icon-badge');
                        this.appIcon.appendChild(this.appIconBadge);
                    }
                }
            }
            // Draggable region that we can manipulate for #52522
            this.dragRegion = (0, dom_1.prepend)(this.rootContainer, (0, dom_1.$)('div.titlebar-drag-region'));
            // Menubar: install a custom menu bar depending on configuration
            if (!this.isAuxiliary &&
                !(0, window_1.hasNativeTitlebar)(this.configurationService, this.titleBarStyle) &&
                (!platform_1.isMacintosh || platform_1.isWeb) &&
                this.currentMenubarVisibility !== 'compact') {
                this.installMenubar();
            }
            // Title
            this.title = (0, dom_1.append)(this.centerContent, (0, dom_1.$)('div.window-title'));
            this.createTitle();
            // Create Toolbar Actions
            if ((0, window_1.hasCustomTitlebar)(this.configurationService, this.titleBarStyle)) {
                this.actionToolBarElement = (0, dom_1.append)(this.rightContent, (0, dom_1.$)('div.action-toolbar-container'));
                this.createActionToolBar();
                this.createActionToolBarMenus();
            }
            let primaryControlLocation = platform_1.isMacintosh ? 'left' : 'right';
            if (platform_1.isMacintosh && platform_1.isNative) {
                // Check if the locale is RTL, macOS will move traffic lights in RTL locales
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/textInfo
                const localeInfo = new Intl.Locale(platform_1.platformLocale);
                if (localeInfo?.textInfo?.direction === 'rtl') {
                    primaryControlLocation = 'right';
                }
            }
            if (!(0, window_1.hasNativeTitlebar)(this.configurationService, this.titleBarStyle)) {
                this.primaryWindowControls = (0, dom_1.append)(primaryControlLocation === 'left' ? this.leftContent : this.rightContent, (0, dom_1.$)('div.window-controls-container.primary'));
                (0, dom_1.append)(primaryControlLocation === 'left' ? this.rightContent : this.leftContent, (0, dom_1.$)('div.window-controls-container.secondary'));
            }
            // Context menu over title bar: depending on the OS and the location of the click this will either be
            // the overall context menu for the entire title bar or a specific title context menu.
            // Windows / Linux: we only support the overall context menu on the title bar
            // macOS: we support both the overall context menu and the title context menu.
            //        in addition, we allow Cmd+click to bring up the title context menu.
            {
                this._register((0, dom_1.addDisposableListener)(this.rootContainer, dom_1.EventType.CONTEXT_MENU, e => {
                    dom_1.EventHelper.stop(e);
                    let targetMenu;
                    if (platform_1.isMacintosh && e.target instanceof HTMLElement && (0, dom_1.isAncestor)(e.target, this.title)) {
                        targetMenu = actions_1.MenuId.TitleBarTitleContext;
                    }
                    else {
                        targetMenu = actions_1.MenuId.TitleBarContext;
                    }
                    this.onContextMenu(e, targetMenu);
                }));
                if (platform_1.isMacintosh) {
                    this._register((0, dom_1.addDisposableListener)(this.title, dom_1.EventType.MOUSE_DOWN, e => {
                        if (e.metaKey) {
                            dom_1.EventHelper.stop(e, true /* stop bubbling to prevent command center from opening */);
                            this.onContextMenu(e, actions_1.MenuId.TitleBarTitleContext);
                        }
                    }, true /* capture phase to prevent command center from opening */));
                }
            }
            this.updateStyles();
            return this.element;
        }
        createTitle() {
            this.titleDisposables.clear();
            // Text Title
            if (!this.isCommandCenterVisible) {
                this.title.innerText = this.windowTitle.value;
                this.titleDisposables.add(this.windowTitle.onDidChange(() => {
                    this.title.innerText = this.windowTitle.value;
                }));
            }
            // Menu Title
            else {
                const commandCenter = this.instantiationService.createInstance(commandCenterControl_1.CommandCenterControl, this.windowTitle, this.hoverDelegate);
                (0, dom_1.reset)(this.title, commandCenter.element);
                this.titleDisposables.add(commandCenter);
            }
        }
        actionViewItemProvider(action) {
            // --- Activity Actions
            if (!this.isAuxiliary) {
                if (action.id === activity_1.GLOBAL_ACTIVITY_ID) {
                    return this.instantiationService.createInstance(globalCompositeBar_1.SimpleGlobalActivityActionViewItem, { position: () => 2 /* HoverPosition.BELOW */ });
                }
                if (action.id === activity_1.ACCOUNTS_ACTIVITY_ID) {
                    return this.instantiationService.createInstance(globalCompositeBar_1.SimpleAccountActivityActionViewItem, { position: () => 2 /* HoverPosition.BELOW */ });
                }
            }
            // --- Editor Actions
            const activeEditorPane = this.editorGroupsContainer.activeGroup?.activeEditorPane;
            if (activeEditorPane && activeEditorPane instanceof editorPane_1.EditorPane) {
                const result = activeEditorPane.getActionViewItem(action);
                if (result) {
                    return result;
                }
            }
            // Check extensions
            return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action, { hoverDelegate: this.hoverDelegate, menuAsChild: false });
        }
        getKeybinding(action) {
            const editorPaneAwareContextKeyService = this.editorGroupsContainer.activeGroup?.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
            return this.keybindingService.lookupKeybinding(action.id, editorPaneAwareContextKeyService);
        }
        createActionToolBar() {
            // Creates the action tool bar. Depends on the configuration of the title bar menus
            // Requires to be recreated whenever editor actions enablement changes
            this.actionToolBarDisposable.clear();
            this.actionToolBar = this.actionToolBarDisposable.add(this.instantiationService.createInstance(toolbar_1.WorkbenchToolBar, this.actionToolBarElement, {
                contextMenu: actions_1.MenuId.TitleBarContext,
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                ariaLabel: (0, nls_1.localize)('ariaLabelTitleActions', "Title actions"),
                getKeyBinding: action => this.getKeybinding(action),
                overflowBehavior: { maxItems: 9, exempted: [activity_1.ACCOUNTS_ACTIVITY_ID, activity_1.GLOBAL_ACTIVITY_ID, ...editorCommands_1.EDITOR_CORE_NAVIGATION_COMMANDS] },
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
                telemetrySource: 'titlePart',
                highlightToggledItems: this.editorActionsEnabled, // Only show toggled state for editor actions (Layout actions are not shown as toggled)
                actionViewItemProvider: action => this.actionViewItemProvider(action)
            }));
            if (this.editorActionsEnabled) {
                this.actionToolBarDisposable.add(this.editorGroupsContainer.onDidChangeActiveGroup(() => this.createActionToolBarMenus({ editorActions: true })));
            }
        }
        createActionToolBarMenus(update = true) {
            if (update === true) {
                update = { editorActions: true, layoutActions: true, activityActions: true };
            }
            const updateToolBarActions = () => {
                const actions = { primary: [], secondary: [] };
                // --- Editor Actions
                if (this.editorActionsEnabled) {
                    this.editorActionsChangeDisposable.clear();
                    const activeGroup = this.editorGroupsContainer.activeGroup;
                    if (activeGroup) {
                        const editorActions = activeGroup.createEditorActions(this.editorActionsChangeDisposable);
                        actions.primary.push(...editorActions.actions.primary);
                        actions.secondary.push(...editorActions.actions.secondary);
                        this.editorActionsChangeDisposable.add(editorActions.onDidChange(() => updateToolBarActions()));
                    }
                }
                // --- Layout Actions
                if (this.layoutToolbarMenu) {
                    (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.layoutToolbarMenu, {}, actions, () => !this.editorActionsEnabled // Layout Actions in overflow menu when editor actions enabled in title bar
                    );
                }
                // --- Activity Actions
                if (this.activityActionsEnabled) {
                    actions.primary.push(titlebarActions_1.ACCOUNTS_ACTIVITY_TILE_ACTION);
                    actions.primary.push(titlebarActions_1.GLOBAL_ACTIVITY_TITLE_ACTION);
                }
                this.actionToolBar.setActions((0, actionbar_1.prepareActions)(actions.primary), (0, actionbar_1.prepareActions)(actions.secondary));
            };
            // Create/Update the menus which should be in the title tool bar
            if (update.editorActions) {
                this.editorToolbarMenuDisposables.clear();
                // The editor toolbar menu is handled by the editor group so we do not need to manage it here.
                // However, depending on the active editor, we need to update the context and action runner of the toolbar menu.
                if (this.editorActionsEnabled && this.editorService.activeEditor !== undefined) {
                    const context = { groupId: this.editorGroupsContainer.activeGroup.id };
                    this.actionToolBar.actionRunner = new editorTabsControl_1.EditorCommandsContextActionRunner(context);
                    this.actionToolBar.context = context;
                    this.editorToolbarMenuDisposables.add(this.actionToolBar.actionRunner);
                }
                else {
                    this.actionToolBar.actionRunner = new actions_2.ActionRunner();
                    this.actionToolBar.context = {};
                    this.editorToolbarMenuDisposables.add(this.actionToolBar.actionRunner);
                }
            }
            if (update.layoutActions) {
                this.layoutToolbarMenuDisposables.clear();
                if (this.layoutControlEnabled) {
                    this.layoutToolbarMenu = this.menuService.createMenu(actions_1.MenuId.LayoutControlMenu, this.contextKeyService);
                    this.layoutToolbarMenuDisposables.add(this.layoutToolbarMenu);
                    this.layoutToolbarMenuDisposables.add(this.layoutToolbarMenu.onDidChange(() => updateToolBarActions()));
                }
                else {
                    this.layoutToolbarMenu = undefined;
                }
            }
            updateToolBarActions();
        }
        updateStyles() {
            super.updateStyles();
            // Part container
            if (this.element) {
                if (this.isInactive) {
                    this.element.classList.add('inactive');
                }
                else {
                    this.element.classList.remove('inactive');
                }
                const titleBackground = this.getColor(this.isInactive ? theme_1.TITLE_BAR_INACTIVE_BACKGROUND : theme_1.TITLE_BAR_ACTIVE_BACKGROUND, (color, theme) => {
                    // LCD Rendering Support: the title bar part is a defining its own GPU layer.
                    // To benefit from LCD font rendering, we must ensure that we always set an
                    // opaque background color. As such, we compute an opaque color given we know
                    // the background color is the workbench background.
                    return color.isOpaque() ? color : color.makeOpaque((0, theme_1.WORKBENCH_BACKGROUND)(theme));
                }) || '';
                this.element.style.backgroundColor = titleBackground;
                if (this.appIconBadge) {
                    this.appIconBadge.style.backgroundColor = titleBackground;
                }
                if (titleBackground && color_1.Color.fromHex(titleBackground).isLighter()) {
                    this.element.classList.add('light');
                }
                else {
                    this.element.classList.remove('light');
                }
                const titleForeground = this.getColor(this.isInactive ? theme_1.TITLE_BAR_INACTIVE_FOREGROUND : theme_1.TITLE_BAR_ACTIVE_FOREGROUND);
                this.element.style.color = titleForeground || '';
                const titleBorder = this.getColor(theme_1.TITLE_BAR_BORDER);
                this.element.style.borderBottom = titleBorder ? `1px solid ${titleBorder}` : '';
            }
        }
        onContextMenu(e, menuId) {
            const event = new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(this.element), e);
            // Show it
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                menuId,
                contextKeyService: this.contextKeyService,
                domForShadowRoot: platform_1.isMacintosh && platform_1.isNative ? event.target : undefined
            });
        }
        get currentMenubarVisibility() {
            if (this.isAuxiliary) {
                return 'hidden';
            }
            return (0, window_1.getMenuBarVisibility)(this.configurationService);
        }
        get layoutControlEnabled() {
            return !this.isAuxiliary && this.configurationService.getValue("workbench.layoutControl.enabled" /* LayoutSettings.LAYOUT_ACTIONS */) !== false;
        }
        get isCommandCenterVisible() {
            return this.configurationService.getValue("window.commandCenter" /* LayoutSettings.COMMAND_CENTER */) !== false;
        }
        get editorActionsEnabled() {
            return this.editorGroupService.partOptions.editorActionsLocation === "titleBar" /* EditorActionsLocation.TITLEBAR */ ||
                (this.editorGroupService.partOptions.editorActionsLocation === "default" /* EditorActionsLocation.DEFAULT */ &&
                    this.editorGroupService.partOptions.showTabs === "none" /* EditorTabsMode.NONE */);
        }
        get activityActionsEnabled() {
            return !this.isAuxiliary && this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) === "top" /* ActivityBarPosition.TOP */;
        }
        get hasZoomableElements() {
            const hasMenubar = !(this.currentMenubarVisibility === 'hidden' || this.currentMenubarVisibility === 'compact' || (!platform_1.isWeb && platform_1.isMacintosh));
            const hasCommandCenter = this.isCommandCenterVisible;
            const hasToolBarActions = this.layoutControlEnabled || this.editorActionsEnabled || this.activityActionsEnabled;
            return hasMenubar || hasCommandCenter || hasToolBarActions;
        }
        get preventZoom() {
            // Prevent zooming behavior if any of the following conditions are met:
            // 1. Shrinking below the window control size (zoom < 1)
            // 2. No custom items are present in the title bar
            return (0, browser_1.getZoomFactor)((0, dom_1.getWindow)(this.element)) < 1 || !this.hasZoomableElements;
        }
        layout(width, height) {
            this.updateLayout(new dom_1.Dimension(width, height));
            super.layoutContents(width, height);
        }
        updateLayout(dimension) {
            this.lastLayoutDimensions = dimension;
            if ((0, window_1.hasCustomTitlebar)(this.configurationService, this.titleBarStyle)) {
                const zoomFactor = (0, browser_1.getZoomFactor)((0, dom_1.getWindow)(this.element));
                this.element.style.setProperty('--zoom-factor', zoomFactor.toString());
                this.rootContainer.classList.toggle('counter-zoom', this.preventZoom);
                if (this.customMenubar) {
                    const menubarDimension = new dom_1.Dimension(0, dimension.height);
                    this.customMenubar.layout(menubarDimension);
                }
            }
        }
        focus() {
            if (this.customMenubar) {
                this.customMenubar.toggleFocus();
            }
            else {
                this.element.querySelector('[tabindex]:not([tabindex="-1"])').focus();
            }
        }
        toJSON() {
            return {
                type: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */
            };
        }
        dispose() {
            this._onWillDispose.fire();
            super.dispose();
        }
    };
    exports.BrowserTitlebarPart = BrowserTitlebarPart;
    exports.BrowserTitlebarPart = BrowserTitlebarPart = __decorate([
        __param(3, contextView_1.IContextMenuService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, themeService_1.IThemeService),
        __param(8, storage_1.IStorageService),
        __param(9, layoutService_1.IWorkbenchLayoutService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, host_1.IHostService),
        __param(12, hover_1.IHoverService),
        __param(13, editorGroupsService_1.IEditorGroupsService),
        __param(14, editorService_1.IEditorService),
        __param(15, actions_1.IMenuService),
        __param(16, keybinding_1.IKeybindingService)
    ], BrowserTitlebarPart);
    let MainBrowserTitlebarPart = class MainBrowserTitlebarPart extends BrowserTitlebarPart {
        constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, hoverService, editorGroupService, editorService, menuService, keybindingService) {
            super("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, window_2.mainWindow, 'main', contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, hoverService, editorGroupService, editorService, menuService, keybindingService);
        }
    };
    exports.MainBrowserTitlebarPart = MainBrowserTitlebarPart;
    exports.MainBrowserTitlebarPart = MainBrowserTitlebarPart = __decorate([
        __param(0, contextView_1.IContextMenuService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, storage_1.IStorageService),
        __param(6, layoutService_1.IWorkbenchLayoutService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, host_1.IHostService),
        __param(9, hover_1.IHoverService),
        __param(10, editorGroupsService_1.IEditorGroupsService),
        __param(11, editorService_1.IEditorService),
        __param(12, actions_1.IMenuService),
        __param(13, keybinding_1.IKeybindingService)
    ], MainBrowserTitlebarPart);
    let AuxiliaryBrowserTitlebarPart = class AuxiliaryBrowserTitlebarPart extends BrowserTitlebarPart {
        static { AuxiliaryBrowserTitlebarPart_1 = this; }
        static { this.COUNTER = 1; }
        get height() { return this.minimumHeight; }
        constructor(container, editorGroupsContainer, mainTitlebar, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, hoverService, editorGroupService, editorService, menuService, keybindingService) {
            const id = AuxiliaryBrowserTitlebarPart_1.COUNTER++;
            super(`workbench.parts.auxiliaryTitle.${id}`, (0, dom_1.getWindow)(container), editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, hoverService, editorGroupService, editorService, menuService, keybindingService);
            this.container = container;
            this.mainTitlebar = mainTitlebar;
        }
        get preventZoom() {
            // Prevent zooming behavior if any of the following conditions are met:
            // 1. Shrinking below the window control size (zoom < 1)
            // 2. No custom items are present in the main title bar
            // The auxiliary title bar never contains any zoomable items itself,
            // but we want to match the behavior of the main title bar.
            return (0, browser_1.getZoomFactor)((0, dom_1.getWindow)(this.element)) < 1 || !this.mainTitlebar.hasZoomableElements;
        }
    };
    exports.AuxiliaryBrowserTitlebarPart = AuxiliaryBrowserTitlebarPart;
    exports.AuxiliaryBrowserTitlebarPart = AuxiliaryBrowserTitlebarPart = AuxiliaryBrowserTitlebarPart_1 = __decorate([
        __param(3, contextView_1.IContextMenuService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, themeService_1.IThemeService),
        __param(8, storage_1.IStorageService),
        __param(9, layoutService_1.IWorkbenchLayoutService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, host_1.IHostService),
        __param(12, hover_1.IHoverService),
        __param(13, editorGroupsService_1.IEditorGroupsService),
        __param(14, editorService_1.IEditorService),
        __param(15, actions_1.IMenuService),
        __param(16, keybinding_1.IKeybindingService)
    ], AuxiliaryBrowserTitlebarPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGViYXJQYXJ0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy90aXRsZWJhci90aXRsZWJhclBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXlFekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSx1QkFBcUM7UUFNN0UsWUFDd0Isb0JBQThELEVBQ3BFLGNBQStCLEVBQ2pDLFlBQTJCO1lBRTFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFKcEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUg3RSxhQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1lBaUVsRSxZQUFZO1lBR1osZ0NBQWdDO1lBRXZCLDhCQUF5QixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUM7WUE3RDVFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUVqRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVTLHNCQUFzQjtZQUMvQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRU8sZUFBZTtZQUV0QixlQUFlO1lBQ2YsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUEseUJBQWUsRUFBQyxNQUFNLGFBQWMsU0FBUSxpQkFBTztnQkFFbEQ7b0JBQ0MsS0FBSyxDQUFDO3dCQUNMLEVBQUUsRUFBRSxnQ0FBZ0M7d0JBQ3BDLEtBQUssRUFBRSxJQUFBLGVBQVMs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
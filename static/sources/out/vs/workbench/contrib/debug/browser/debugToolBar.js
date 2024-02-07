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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/debug/browser/debugActionViewItems", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/codicons", "vs/base/browser/window", "vs/base/common/numbers", "vs/css!./media/debugToolBar"], function (require, exports, browser, dom, mouseEvent_1, actionbar_1, actions_1, arrays, async_1, errors, lifecycle_1, nls_1, dropdownWithPrimaryActionViewItem_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, instantiation_1, notification_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, debugActionViewItems_1, debugColors_1, debugCommands_1, icons, debug_1, layoutService_1, codicons_1, window_1, numbers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDisconnectMenuItemAction = exports.DebugToolBar = void 0;
    const DEBUG_TOOLBAR_POSITION_KEY = 'debug.actionswidgetposition';
    const DEBUG_TOOLBAR_Y_KEY = 'debug.actionswidgety';
    let DebugToolBar = class DebugToolBar extends themeService_1.Themable {
        constructor(notificationService, telemetryService, debugService, layoutService, storageService, configurationService, themeService, instantiationService, menuService, contextKeyService) {
            super(themeService);
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.debugService = debugService;
            this.layoutService = layoutService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.yCoordinate = 0;
            this.isVisible = false;
            this.isBuilt = false;
            this.stopActionViewItemDisposables = this._register(new lifecycle_1.DisposableStore());
            /** coordinate of the debug toolbar per aux window */
            this.auxWindowCoordinates = new WeakMap();
            this.$el = dom.$('div.debug-toolbar');
            this.$el.style.top = `${layoutService.mainContainerOffset.top}px`;
            this.dragArea = dom.append(this.$el, dom.$('div.drag-area' + themables_1.ThemeIcon.asCSSSelector(icons.debugGripper)));
            const actionBarContainer = dom.append(this.$el, dom.$('div.action-bar-container'));
            this.debugToolBarMenu = menuService.createMenu(actions_2.MenuId.DebugToolBar, contextKeyService);
            this._register(this.debugToolBarMenu);
            this.activeActions = [];
            this.actionBar = this._register(new actionbar_1.ActionBar(actionBarContainer, {
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                actionViewItemProvider: (action) => {
                    if (action.id === debugCommands_1.FOCUS_SESSION_ID) {
                        return this.instantiationService.createInstance(debugActionViewItems_1.FocusSessionActionViewItem, action, undefined);
                    }
                    else if (action.id === debugCommands_1.STOP_ID || action.id === debugCommands_1.DISCONNECT_ID) {
                        this.stopActionViewItemDisposables.clear();
                        const item = this.instantiationService.invokeFunction(accessor => createDisconnectMenuItemAction(action, this.stopActionViewItemDisposables, accessor));
                        if (item) {
                            return item;
                        }
                    }
                    return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action);
                }
            }));
            this.updateScheduler = this._register(new async_1.RunOnceScheduler(() => {
                const state = this.debugService.state;
                const toolBarLocation = this.configurationService.getValue('debug').toolBarLocation;
                if (state === 0 /* State.Inactive */ ||
                    toolBarLocation !== 'floating' ||
                    this.debugService.getModel().getSessions().every(s => s.suppressDebugToolbar) ||
                    (state === 1 /* State.Initializing */ && this.debugService.initializingOptions?.suppressDebugToolbar)) {
                    return this.hide();
                }
                const actions = [];
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.debugToolBarMenu, { shouldForwardArgs: true }, actions);
                if (!arrays.equals(actions, this.activeActions, (first, second) => first.id === second.id && first.enabled === second.enabled)) {
                    this.actionBar.clear();
                    this.actionBar.push(actions, { icon: true, label: false });
                    this.activeActions = actions;
                }
                this.show();
            }, 20));
            this.updateStyles();
            this.registerListeners();
            this.hide();
        }
        registerListeners() {
            this._register(this.debugService.onDidChangeState(() => this.updateScheduler.schedule()));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.toolBarLocation')) {
                    this.updateScheduler.schedule();
                }
                if (e.affectsConfiguration("workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */) || e.affectsConfiguration("window.commandCenter" /* LayoutSettings.COMMAND_CENTER */)) {
                    this._yRange = undefined;
                    this.setYCoordinate();
                }
            }));
            this._register(this.debugToolBarMenu.onDidChange(() => this.updateScheduler.schedule()));
            this._register(this.actionBar.actionRunner.onDidRun((e) => {
                // check for error
                if (e.error && !errors.isCancellationError(e.error)) {
                    this.notificationService.warn(e.error);
                }
                // log in telemetry
                this.telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'debugActionsWidget' });
            }));
            this._register(dom.addDisposableGenericMouseUpListener(this.dragArea, (event) => {
                const mouseClickEvent = new mouseEvent_1.StandardMouseEvent(dom.getWindow(this.dragArea), event);
                const activeWindow = dom.getWindow(this.layoutService.activeContainer);
                if (mouseClickEvent.detail === 2) {
                    // double click on debug bar centers it again #8250
                    const widgetWidth = this.$el.clientWidth;
                    this.setCoordinates(0.5 * activeWindow.innerWidth - 0.5 * widgetWidth, this.yDefault);
                    this.storePosition();
                }
            }));
            this._register(dom.addDisposableGenericMouseDownListener(this.dragArea, (event) => {
                this.dragArea.classList.add('dragged');
                const activeWindow = dom.getWindow(this.layoutService.activeContainer);
                const mouseMoveListener = dom.addDisposableGenericMouseMoveListener(activeWindow, (e) => {
                    const mouseMoveEvent = new mouseEvent_1.StandardMouseEvent(activeWindow, e);
                    // Prevent default to stop editor selecting text #8524
                    mouseMoveEvent.preventDefault();
                    // Reduce x by width of drag handle to reduce jarring #16604
                    this.setCoordinates(mouseMoveEvent.posx - 14, mouseMoveEvent.posy - 14);
                });
                const mouseUpListener = dom.addDisposableGenericMouseUpListener(activeWindow, (e) => {
                    this.storePosition();
                    this.dragArea.classList.remove('dragged');
                    mouseMoveListener.dispose();
                    mouseUpListener.dispose();
                });
            }));
            this._register(this.layoutService.onDidChangePartVisibility(() => this.setYCoordinate()));
            this._register(browser.PixelRatio.onDidChange(() => this.setYCoordinate()));
            const resizeListener = this._register(new lifecycle_1.MutableDisposable());
            this._register(this.layoutService.onDidChangeActiveContainer(() => {
                this._yRange = undefined;
                // note: we intentionally don't read the activeContainer before the
                // `then` clause to avoid any races due to quickly switching windows.
                this.layoutService.whenActiveContainerStylesLoaded.then(() => {
                    if (this.isBuilt) {
                        this.layoutService.activeContainer.appendChild(this.$el);
                        this.setCoordinates();
                    }
                    resizeListener.value = this._register(dom.addDisposableListener(dom.getWindow(this.layoutService.activeContainer), dom.EventType.RESIZE, () => this.setYCoordinate()));
                });
            }));
        }
        storePosition() {
            const activeWindow = dom.getWindow(this.layoutService.activeContainer);
            const isMainWindow = this.layoutService.activeContainer === this.layoutService.mainContainer;
            const left = this.$el.getBoundingClientRect().left / activeWindow.innerWidth;
            if (isMainWindow) {
                this.storageService.store(DEBUG_TOOLBAR_POSITION_KEY, left, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                this.storageService.store(DEBUG_TOOLBAR_Y_KEY, this.yCoordinate, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.auxWindowCoordinates.set(activeWindow, { x: left, y: this.yCoordinate });
            }
        }
        updateStyles() {
            super.updateStyles();
            if (this.$el) {
                this.$el.style.backgroundColor = this.getColor(debugColors_1.debugToolBarBackground) || '';
                const widgetShadowColor = this.getColor(colorRegistry_1.widgetShadow);
                this.$el.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
                const contrastBorderColor = this.getColor(colorRegistry_1.widgetBorder);
                const borderColor = this.getColor(debugColors_1.debugToolBarBorder);
                if (contrastBorderColor) {
                    this.$el.style.border = `1px solid ${contrastBorderColor}`;
                }
                else {
                    this.$el.style.border = borderColor ? `solid ${borderColor}` : 'none';
                    this.$el.style.border = '1px 0';
                }
            }
        }
        setCoordinates(x, y) {
            if (!this.isVisible) {
                return;
            }
            const widgetWidth = this.$el.clientWidth;
            const currentWindow = dom.getWindow(this.layoutService.activeContainer);
            const isMainWindow = currentWindow === window_1.mainWindow;
            if (x === undefined) {
                const positionPercentage = isMainWindow
                    ? Number(this.storageService.get(DEBUG_TOOLBAR_POSITION_KEY, 0 /* StorageScope.PROFILE */))
                    : this.auxWindowCoordinates.get(currentWindow)?.x;
                x = positionPercentage !== undefined
                    ? positionPercentage * currentWindow.innerWidth
                    : (0.5 * currentWindow.innerWidth - 0.5 * widgetWidth);
            }
            x = (0, numbers_1.clamp)(x, 0, currentWindow.innerWidth - widgetWidth); // do not allow the widget to overflow on the right
            this.$el.style.left = `${x}px`;
            if (y === undefined) {
                y = isMainWindow
                    ? this.storageService.getNumber(DEBUG_TOOLBAR_Y_KEY, 0 /* StorageScope.PROFILE */)
                    : this.auxWindowCoordinates.get(currentWindow)?.y;
            }
            this.setYCoordinate(y ?? this.yDefault);
        }
        setYCoordinate(y = this.yCoordinate) {
            const [yMin, yMax] = this.yRange;
            y = Math.max(yMin, Math.min(y, yMax));
            this.$el.style.top = `${y}px`;
            this.yCoordinate = y;
        }
        get yDefault() {
            return this.layoutService.mainContainerOffset.top;
        }
        get yRange() {
            if (!this._yRange) {
                const isTitleBarVisible = this.layoutService.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, dom.getWindow(this.layoutService.activeContainer));
                const yMin = isTitleBarVisible ? 0 : this.layoutService.mainContainerOffset.top;
                let yMax = 0;
                if (isTitleBarVisible) {
                    if (this.configurationService.getValue("window.commandCenter" /* LayoutSettings.COMMAND_CENTER */) === true) {
                        yMax += 35;
                    }
                    else {
                        yMax += 28;
                    }
                }
                if (this.configurationService.getValue("workbench.editor.showTabs" /* LayoutSettings.EDITOR_TABS_MODE */) !== "none" /* EditorTabsMode.NONE */) {
                    yMax += 35;
                }
                this._yRange = [yMin, yMax];
            }
            return this._yRange;
        }
        show() {
            if (this.isVisible) {
                this.setCoordinates();
                return;
            }
            if (!this.isBuilt) {
                this.isBuilt = true;
                this.layoutService.activeContainer.appendChild(this.$el);
            }
            this.isVisible = true;
            dom.show(this.$el);
            this.setCoordinates();
        }
        hide() {
            this.isVisible = false;
            dom.hide(this.$el);
        }
        dispose() {
            super.dispose();
            this.$el?.remove();
        }
    };
    exports.DebugToolBar = DebugToolBar;
    exports.DebugToolBar = DebugToolBar = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, debug_1.IDebugService),
        __param(3, layoutService_1.IWorkbenchLayoutService),
        __param(4, storage_1.IStorageService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, themeService_1.IThemeService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, actions_2.IMenuService),
        __param(9, contextkey_1.IContextKeyService)
    ], DebugToolBar);
    function createDisconnectMenuItemAction(action, disposables, accessor) {
        const menuService = accessor.get(actions_2.IMenuService);
        const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const contextMenuService = accessor.get(contextView_1.IContextMenuService);
        const menu = menuService.createMenu(actions_2.MenuId.DebugToolBarStop, contextKeyService);
        const secondary = [];
        (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, secondary);
        if (!secondary.length) {
            return undefined;
        }
        const dropdownAction = disposables.add(new actions_1.Action('notebook.moreRunActions', (0, nls_1.localize)('notebook.moreRunActionsLabel', "More..."), 'codicon-chevron-down', true));
        const item = instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem, action, dropdownAction, secondary, 'debug-stop-actions', contextMenuService, {});
        return item;
    }
    exports.createDisconnectMenuItemAction = createDisconnectMenuItemAction;
    // Debug toolbar
    const debugViewTitleItems = [];
    const registerDebugToolBarItem = (id, title, order, icon, when, precondition, alt) => {
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugToolBar, {
            group: 'navigation',
            when,
            order,
            command: {
                id,
                title,
                icon,
                precondition
            },
            alt
        });
        // Register actions in debug viewlet when toolbar is docked
        debugViewTitleItems.push(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ViewContainerTitle, {
            group: 'navigation',
            when: contextkey_1.ContextKeyExpr.and(when, contextkey_1.ContextKeyExpr.equals('viewContainer', debug_1.VIEWLET_ID), debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), contextkey_1.ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked')),
            order,
            command: {
                id,
                title,
                icon,
                precondition
            }
        }));
    };
    actions_2.MenuRegistry.onDidChangeMenu(e => {
        // In case the debug toolbar is docked we need to make sure that the docked toolbar has the up to date commands registered #115945
        if (e.has(actions_2.MenuId.DebugToolBar)) {
            (0, lifecycle_1.dispose)(debugViewTitleItems);
            const items = actions_2.MenuRegistry.getMenuItems(actions_2.MenuId.DebugToolBar);
            for (const i of items) {
                debugViewTitleItems.push(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ViewContainerTitle, {
                    ...i,
                    when: contextkey_1.ContextKeyExpr.and(i.when, contextkey_1.ContextKeyExpr.equals('viewContainer', debug_1.VIEWLET_ID), debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), contextkey_1.ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked'))
                }));
            }
        }
    });
    const CONTEXT_TOOLBAR_COMMAND_CENTER = contextkey_1.ContextKeyExpr.equals('config.debug.toolBarLocation', 'commandCenter');
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandCenterCenter, {
        submenu: actions_2.MenuId.DebugToolBar,
        title: 'Debug',
        icon: codicons_1.Codicon.debug,
        order: 1,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, CONTEXT_TOOLBAR_COMMAND_CENTER)
    });
    registerDebugToolBarItem(debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, 10, icons.debugContinue, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, 10, icons.debugPause, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('stopped'), contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUG_STATE.isEqualTo('running'), debug_1.CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.toNegated()));
    registerDebugToolBarItem(debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, 70, icons.debugStop, debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), undefined, { id: debugCommands_1.DISCONNECT_ID, title: debugCommands_1.DISCONNECT_LABEL, icon: icons.debugDisconnect, precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), });
    registerDebugToolBarItem(debugCommands_1.DISCONNECT_ID, debugCommands_1.DISCONNECT_LABEL, 70, icons.debugDisconnect, debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, undefined, { id: debugCommands_1.STOP_ID, title: debugCommands_1.STOP_LABEL, icon: icons.debugStop, precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), });
    registerDebugToolBarItem(debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, 20, icons.debugStepOver, undefined, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, 30, icons.debugStepInto, undefined, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, 40, icons.debugStepOut, undefined, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL, 60, icons.debugRestart);
    registerDebugToolBarItem(debugCommands_1.STEP_BACK_ID, (0, nls_1.localize)('stepBackDebug', "Step Back"), 50, icons.debugStepBack, debug_1.CONTEXT_STEP_BACK_SUPPORTED, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.REVERSE_CONTINUE_ID, (0, nls_1.localize)('reverseContinue', "Reverse"), 55, icons.debugReverseContinue, debug_1.CONTEXT_STEP_BACK_SUPPORTED, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.FOCUS_SESSION_ID, debugCommands_1.FOCUS_SESSION_LABEL, 100, codicons_1.Codicon.listTree, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_MULTI_SESSION_DEBUG, CONTEXT_TOOLBAR_COMMAND_CENTER.negate()));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugToolBarStop, {
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
        order: 0,
        command: {
            id: debugCommands_1.DISCONNECT_ID,
            title: debugCommands_1.DISCONNECT_LABEL,
            icon: icons.debugDisconnect
        }
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugToolBarStop, {
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
        order: 0,
        command: {
            id: debugCommands_1.STOP_ID,
            title: debugCommands_1.STOP_LABEL,
            icon: icons.debugStop
        }
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugToolBarStop, {
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED)),
        order: 0,
        command: {
            id: debugCommands_1.DISCONNECT_AND_SUSPEND_ID,
            title: debugCommands_1.DISCONNECT_AND_SUSPEND_LABEL,
            icon: icons.debugDisconnect
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdUb29sQmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnVG9vbEJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3Q2hHLE1BQU0sMEJBQTBCLEdBQUcsNkJBQTZCLENBQUM7SUFDakUsTUFBTSxtQkFBbUIsR0FBRyxzQkFBc0IsQ0FBQztJQUU1QyxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsdUJBQVE7UUFpQnpDLFlBQ3VCLG1CQUEwRCxFQUM3RCxnQkFBb0QsRUFDeEQsWUFBNEMsRUFDbEMsYUFBdUQsRUFDL0QsY0FBZ0QsRUFDMUMsb0JBQTRELEVBQ3BFLFlBQTJCLEVBQ25CLG9CQUE0RCxFQUNyRSxXQUF5QixFQUNuQixpQkFBcUM7WUFFekQsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBWG1CLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN2QyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNqQixrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFDOUMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ3pCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQWpCNUUsZ0JBQVcsR0FBRyxDQUFDLENBQUM7WUFFaEIsY0FBUyxHQUFHLEtBQUssQ0FBQztZQUNsQixZQUFPLEdBQUcsS0FBSyxDQUFDO1lBRVAsa0NBQTZCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZGLHFEQUFxRDtZQUNwQyx5QkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBb0QsQ0FBQztZQWdCdkcs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
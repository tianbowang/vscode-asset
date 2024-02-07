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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/debug/browser/debugActionViewItems", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/debugToolBar", "vs/workbench/contrib/debug/browser/welcomeView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/css!./media/debugViewlet"], function (require, exports, lifecycle_1, nls, menuEntryActionViewItem_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, progress_1, quickInput_1, storage_1, telemetry_1, themeService_1, workspace_1, viewPaneContainer_1, contextkeys_1, views_1, viewsService_1, debugActionViewItems_1, debugCommands_1, debugIcons_1, debugToolBar_1, welcomeView_1, debug_1, extensions_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugViewPaneContainer = void 0;
    let DebugViewPaneContainer = class DebugViewPaneContainer extends viewPaneContainer_1.ViewPaneContainer {
        constructor(layoutService, telemetryService, progressService, debugService, instantiationService, contextService, storageService, themeService, contextMenuService, extensionService, configurationService, contextViewService, contextKeyService, viewDescriptorService) {
            super(debug_1.VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
            this.progressService = progressService;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.contextKeyService = contextKeyService;
            this.paneListeners = new Map();
            this.stopActionViewItemDisposables = this._register(new lifecycle_1.DisposableStore());
            // When there are potential updates to the docked debug toolbar we need to update it
            this._register(this.debugService.onDidChangeState(state => this.onDebugServiceStateChange(state)));
            this._register(this.contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(new Set([debug_1.CONTEXT_DEBUG_UX_KEY, 'inDebugMode']))) {
                    this.updateTitleArea();
                }
            }));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateTitleArea()));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.toolBarLocation') || e.affectsConfiguration('debug.hideLauncherWhileDebugging')) {
                    this.updateTitleArea();
                }
            }));
        }
        create(parent) {
            super.create(parent);
            parent.classList.add('debug-viewlet');
        }
        focus() {
            super.focus();
            if (this.startDebugActionViewItem) {
                this.startDebugActionViewItem.focus();
            }
            else {
                this.focusView(welcomeView_1.WelcomeView.ID);
            }
        }
        getActionViewItem(action) {
            if (action.id === debugCommands_1.DEBUG_START_COMMAND_ID) {
                this.startDebugActionViewItem = this.instantiationService.createInstance(debugActionViewItems_1.StartDebugActionViewItem, null, action);
                return this.startDebugActionViewItem;
            }
            if (action.id === debugCommands_1.FOCUS_SESSION_ID) {
                return new debugActionViewItems_1.FocusSessionActionViewItem(action, undefined, this.debugService, this.contextViewService, this.configurationService);
            }
            if (action.id === debugCommands_1.STOP_ID || action.id === debugCommands_1.DISCONNECT_ID) {
                this.stopActionViewItemDisposables.clear();
                const item = this.instantiationService.invokeFunction(accessor => (0, debugToolBar_1.createDisconnectMenuItemAction)(action, this.stopActionViewItemDisposables, accessor));
                if (item) {
                    return item;
                }
            }
            return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action);
        }
        focusView(id) {
            const view = this.getView(id);
            if (view) {
                view.focus();
            }
        }
        onDebugServiceStateChange(state) {
            if (this.progressResolve) {
                this.progressResolve();
                this.progressResolve = undefined;
            }
            if (state === 1 /* State.Initializing */) {
                this.progressService.withProgress({ location: debug_1.VIEWLET_ID, }, _progress => {
                    return new Promise(resolve => this.progressResolve = resolve);
                });
            }
        }
        addPanes(panes) {
            super.addPanes(panes);
            for (const { pane: pane } of panes) {
                // attach event listener to
                if (pane.id === debug_1.BREAKPOINTS_VIEW_ID) {
                    this.breakpointView = pane;
                    this.updateBreakpointsMaxSize();
                }
                else {
                    this.paneListeners.set(pane.id, pane.onDidChange(() => this.updateBreakpointsMaxSize()));
                }
            }
        }
        removePanes(panes) {
            super.removePanes(panes);
            for (const pane of panes) {
                (0, lifecycle_1.dispose)(this.paneListeners.get(pane.id));
                this.paneListeners.delete(pane.id);
            }
        }
        updateBreakpointsMaxSize() {
            if (this.breakpointView) {
                // We need to update the breakpoints view since all other views are collapsed #25384
                const allOtherCollapsed = this.panes.every(view => !view.isExpanded() || view === this.breakpointView);
                this.breakpointView.maximumBodySize = allOtherCollapsed ? Number.POSITIVE_INFINITY : this.breakpointView.minimumBodySize;
            }
        }
    };
    exports.DebugViewPaneContainer = DebugViewPaneContainer;
    exports.DebugViewPaneContainer = DebugViewPaneContainer = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, progress_1.IProgressService),
        __param(3, debug_1.IDebugService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, storage_1.IStorageService),
        __param(7, themeService_1.IThemeService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, extensions_1.IExtensionService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, contextView_1.IContextViewService),
        __param(12, contextkey_1.IContextKeyService),
        __param(13, views_1.IViewDescriptorService)
    ], DebugViewPaneContainer);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewContainerTitle, {
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', debug_1.VIEWLET_ID), debug_1.CONTEXT_DEBUG_UX.notEqualsTo('simple'), contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_DEBUG_STATE.isEqualTo('inactive'), contextkey_1.ContextKeyExpr.notEquals('config.debug.toolBarLocation', 'docked')), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.not('config.debug.hideLauncherWhileDebugging'), contextkey_1.ContextKeyExpr.not('inDebugMode'))),
        order: 10,
        group: 'navigation',
        command: {
            precondition: debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(1 /* State.Initializing */)),
            id: debugCommands_1.DEBUG_START_COMMAND_ID,
            title: debugCommands_1.DEBUG_START_LABEL
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: debugCommands_1.DEBUG_CONFIGURE_COMMAND_ID,
                title: {
                    value: debugCommands_1.DEBUG_CONFIGURE_LABEL,
                    original: 'Open \'launch.json\'',
                    mnemonicTitle: nls.localize({ key: 'miOpenConfigurations', comment: ['&& denotes a mnemonic'] }, "Open &&Configurations")
                },
                f1: true,
                icon: debugIcons_1.debugConfigure,
                precondition: debug_1.CONTEXT_DEBUG_UX.notEqualsTo('simple'),
                menu: [{
                        id: actions_1.MenuId.ViewContainerTitle,
                        group: 'navigation',
                        order: 20,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', debug_1.VIEWLET_ID), debug_1.CONTEXT_DEBUG_UX.notEqualsTo('simple'), contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_DEBUG_STATE.isEqualTo('inactive'), contextkey_1.ContextKeyExpr.notEquals('config.debug.toolBarLocation', 'docked')))
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        order: 20,
                        // Show in debug viewlet secondary actions when debugging and debug toolbar is docked
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', debug_1.VIEWLET_ID), debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), contextkey_1.ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked'))
                    }, {
                        id: actions_1.MenuId.MenubarDebugMenu,
                        group: '2_configuration',
                        order: 1,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const configurationManager = debugService.getConfigurationManager();
            let launch;
            if (configurationManager.selectedConfiguration.name) {
                launch = configurationManager.selectedConfiguration.launch;
            }
            else {
                const launches = configurationManager.getLaunches().filter(l => !l.hidden);
                if (launches.length === 1) {
                    launch = launches[0];
                }
                else {
                    const picks = launches.map(l => ({ label: l.name, launch: l }));
                    const picked = await quickInputService.pick(picks, {
                        activeItem: picks[0],
                        placeHolder: nls.localize({ key: 'selectWorkspaceFolder', comment: ['User picks a workspace folder or a workspace configuration file here. Workspace configuration files can contain settings and thus a launch.json configuration can be written into one.'] }, "Select a workspace folder to create a launch.json file in or add it to the workspace config file")
                    });
                    if (picked) {
                        launch = picked.launch;
                    }
                }
            }
            if (launch) {
                await launch.openConfigFile({ preserveFocus: false });
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'debug.toggleReplIgnoreFocus',
                title: nls.localize('debugPanel', "Debug Console"),
                toggled: contextkey_1.ContextKeyExpr.has(`view.${debug_1.REPL_VIEW_ID}.visible`),
                menu: [{
                        id: viewPaneContainer_1.ViewsSubMenu,
                        group: '3_toggleRepl',
                        order: 30,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', debug_1.VIEWLET_ID))
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            if (viewsService.isViewVisible(debug_1.REPL_VIEW_ID)) {
                viewsService.closeView(debug_1.REPL_VIEW_ID);
            }
            else {
                await viewsService.openView(debug_1.REPL_VIEW_ID);
            }
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewContainerTitle, {
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', debug_1.VIEWLET_ID), debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked'), contextkey_1.ContextKeyExpr.has('config.debug.hideLauncherWhileDebugging'))),
        order: 10,
        command: {
            id: debugCommands_1.SELECT_AND_START_ID,
            title: nls.localize('startAdditionalSession', "Start Additional Session"),
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdWaWV3bGV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnVmlld2xldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQ3pGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEscUNBQWlCO1FBUzVELFlBQzBCLGFBQXNDLEVBQzVDLGdCQUFtQyxFQUNwQyxlQUFrRCxFQUNyRCxZQUE0QyxFQUNwQyxvQkFBMkMsRUFDeEMsY0FBd0MsRUFDakQsY0FBK0IsRUFDakMsWUFBMkIsRUFDckIsa0JBQXVDLEVBQ3pDLGdCQUFtQyxFQUMvQixvQkFBMkMsRUFDN0Msa0JBQXdELEVBQ3pELGlCQUFzRCxFQUNsRCxxQkFBNkM7WUFFckUsS0FBSyxDQUFDLGtCQUFVLEVBQUUsRUFBRSxvQ0FBb0MsRUFBRSxJQUFJLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQWJ2TixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDcEMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFRckIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN4QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBakJuRSxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1lBRXRDLGtDQUE2QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQW9CdEYsb0ZBQW9GO1lBQ3BGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxn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
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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/contextkey/common/contextkey", "vs/base/common/event", "vs/base/common/types", "vs/platform/actions/common/actions", "vs/nls", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/contextview/browser/contextView", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/workbench/browser/panecomposite", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/uri", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/browser/parts/views/viewsViewlet", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/views/common/viewsService"], function (require, exports, lifecycle_1, views_1, contextkeys_1, platform_1, storage_1, contextkey_1, event_1, types_1, actions_1, nls_1, extensions_1, instantiation_1, telemetry_1, themeService_1, contextView_1, extensions_2, workspace_1, panecomposite_1, layoutService_1, uri_1, actionCommonCategories_1, editorGroupsService_1, viewsViewlet_1, panecomposite_2, editorService_1, viewsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPartByLocation = exports.ViewsService = void 0;
    let ViewsService = class ViewsService extends lifecycle_1.Disposable {
        constructor(viewDescriptorService, paneCompositeService, contextKeyService, layoutService, editorService) {
            super();
            this.viewDescriptorService = viewDescriptorService;
            this.paneCompositeService = paneCompositeService;
            this.contextKeyService = contextKeyService;
            this.layoutService = layoutService;
            this.editorService = editorService;
            this._onDidChangeViewVisibility = this._register(new event_1.Emitter());
            this.onDidChangeViewVisibility = this._onDidChangeViewVisibility.event;
            this._onDidChangeViewContainerVisibility = this._register(new event_1.Emitter());
            this.onDidChangeViewContainerVisibility = this._onDidChangeViewContainerVisibility.event;
            this._onDidChangeFocusedView = this._register(new event_1.Emitter());
            this.onDidChangeFocusedView = this._onDidChangeFocusedView.event;
            this.viewDisposable = new Map();
            this.enabledViewContainersContextKeys = new Map();
            this.visibleViewContextKeys = new Map();
            this.viewPaneContainers = new Map();
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.viewDisposable.forEach(disposable => disposable.dispose());
                this.viewDisposable.clear();
            }));
            this.viewDescriptorService.viewContainers.forEach(viewContainer => this.onDidRegisterViewContainer(viewContainer, this.viewDescriptorService.getViewContainerLocation(viewContainer)));
            this._register(this.viewDescriptorService.onDidChangeViewContainers(({ added, removed }) => this.onDidChangeContainers(added, removed)));
            this._register(this.viewDescriptorService.onDidChangeContainerLocation(({ viewContainer, from, to }) => this.onDidChangeContainerLocation(viewContainer, from, to)));
            // View Container Visibility
            this._register(this.paneCompositeService.onDidPaneCompositeOpen(e => this._onDidChangeViewContainerVisibility.fire({ id: e.composite.getId(), visible: true, location: e.viewContainerLocation })));
            this._register(this.paneCompositeService.onDidPaneCompositeClose(e => this._onDidChangeViewContainerVisibility.fire({ id: e.composite.getId(), visible: false, location: e.viewContainerLocation })));
            this.focusedViewContextKey = contextkeys_1.FocusedViewContext.bindTo(contextKeyService);
        }
        onViewsAdded(added) {
            for (const view of added) {
                this.onViewsVisibilityChanged(view, view.isBodyVisible());
            }
        }
        onViewsVisibilityChanged(view, visible) {
            this.getOrCreateActiveViewContextKey(view).set(visible);
            this._onDidChangeViewVisibility.fire({ id: view.id, visible: visible });
        }
        onViewsRemoved(removed) {
            for (const view of removed) {
                this.onViewsVisibilityChanged(view, false);
            }
        }
        getOrCreateActiveViewContextKey(view) {
            const visibleContextKeyId = (0, contextkeys_1.getVisbileViewContextKey)(view.id);
            let contextKey = this.visibleViewContextKeys.get(visibleContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.RawContextKey(visibleContextKeyId, false).bindTo(this.contextKeyService);
                this.visibleViewContextKeys.set(visibleContextKeyId, contextKey);
            }
            return contextKey;
        }
        onDidChangeContainers(added, removed) {
            for (const { container, location } of removed) {
                this.deregisterPaneComposite(container, location);
            }
            for (const { container, location } of added) {
                this.onDidRegisterViewContainer(container, location);
            }
        }
        onDidRegisterViewContainer(viewContainer, viewContainerLocation) {
            this.registerPaneComposite(viewContainer, viewContainerLocation);
            const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
            this.onViewDescriptorsAdded(viewContainerModel.allViewDescriptors, viewContainer);
            this._register(viewContainerModel.onDidChangeAllViewDescriptors(({ added, removed }) => {
                this.onViewDescriptorsAdded(added, viewContainer);
                this.onViewDescriptorsRemoved(removed);
            }));
            this.updateViewContainerEnablementContextKey(viewContainer);
            this._register(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.updateViewContainerEnablementContextKey(viewContainer)));
            this._register(this.registerOpenViewContainerAction(viewContainer));
        }
        onDidChangeContainerLocation(viewContainer, from, to) {
            this.deregisterPaneComposite(viewContainer, from);
            this.registerPaneComposite(viewContainer, to);
        }
        onViewDescriptorsAdded(views, container) {
            const location = this.viewDescriptorService.getViewContainerLocation(container);
            if (location === null) {
                return;
            }
            for (const viewDescriptor of views) {
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add(this.registerOpenViewAction(viewDescriptor));
                disposables.add(this.registerFocusViewAction(viewDescriptor, container.title));
                disposables.add(this.registerResetViewLocationAction(viewDescriptor));
                this.viewDisposable.set(viewDescriptor, disposables);
            }
        }
        onViewDescriptorsRemoved(views) {
            for (const view of views) {
                const disposable = this.viewDisposable.get(view);
                if (disposable) {
                    disposable.dispose();
                    this.viewDisposable.delete(view);
                }
            }
        }
        updateViewContainerEnablementContextKey(viewContainer) {
            let contextKey = this.enabledViewContainersContextKeys.get(viewContainer.id);
            if (!contextKey) {
                contextKey = this.contextKeyService.createKey(getEnabledViewContainerContextKey(viewContainer.id), false);
                this.enabledViewContainersContextKeys.set(viewContainer.id, contextKey);
            }
            contextKey.set(!(viewContainer.hideIfEmpty && this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length === 0));
        }
        async openComposite(compositeId, location, focus) {
            return this.paneCompositeService.openPaneComposite(compositeId, location, focus);
        }
        getComposite(compositeId, location) {
            return this.paneCompositeService.getPaneComposite(compositeId, location);
        }
        isViewContainerVisible(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                if (viewContainerLocation !== null) {
                    return this.paneCompositeService.getActivePaneComposite(viewContainerLocation)?.getId() === id;
                }
            }
            return false;
        }
        getVisibleViewContainer(location) {
            const viewContainerId = this.paneCompositeService.getActivePaneComposite(location)?.getId();
            return viewContainerId ? this.viewDescriptorService.getViewContainerById(viewContainerId) : null;
        }
        getActiveViewPaneContainerWithId(viewContainerId) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(viewContainerId);
            return viewContainer ? this.getActiveViewPaneContainer(viewContainer) : null;
        }
        async openViewContainer(id, focus) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                if (viewContainerLocation !== null) {
                    const paneComposite = await this.paneCompositeService.openPaneComposite(id, viewContainerLocation, focus);
                    return paneComposite || null;
                }
            }
            return null;
        }
        async closeViewContainer(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                const isActive = viewContainerLocation !== null && this.paneCompositeService.getActivePaneComposite(viewContainerLocation);
                if (viewContainerLocation !== null) {
                    return isActive ? this.layoutService.setPartHidden(true, getPartByLocation(viewContainerLocation)) : undefined;
                }
            }
        }
        isViewVisible(id) {
            const activeView = this.getActiveViewWithId(id);
            return activeView?.isBodyVisible() || false;
        }
        getActiveViewWithId(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (viewContainer) {
                const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
                if (activeViewPaneContainer) {
                    return activeViewPaneContainer.getView(id);
                }
            }
            return null;
        }
        getViewWithId(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (viewContainer) {
                const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
                if (viewPaneContainer) {
                    return viewPaneContainer.getView(id);
                }
            }
            return null;
        }
        getFocusedViewName() {
            const viewId = this.contextKeyService.getContextKeyValue(contextkeys_1.FocusedViewContext.key) ?? '';
            const textEditorFocused = this.editorService.activeTextEditorControl?.hasTextFocus() ? (0, nls_1.localize)('editor', "Text Editor") : undefined;
            return this.viewDescriptorService.getViewDescriptorById(viewId.toString())?.name?.value ?? textEditorFocused ?? '';
        }
        async openView(id, focus) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (!viewContainer) {
                return null;
            }
            if (!this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.some(viewDescriptor => viewDescriptor.id === id)) {
                return null;
            }
            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            const compositeDescriptor = this.getComposite(viewContainer.id, location);
            if (compositeDescriptor) {
                const paneComposite = await this.openComposite(compositeDescriptor.id, location);
                if (paneComposite && paneComposite.openView) {
                    return paneComposite.openView(id, focus) || null;
                }
                else if (focus) {
                    paneComposite?.focus();
                }
            }
            return null;
        }
        closeView(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (viewContainer) {
                const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
                if (activeViewPaneContainer) {
                    const view = activeViewPaneContainer.getView(id);
                    if (view) {
                        if (activeViewPaneContainer.views.length === 1) {
                            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                            if (location === 0 /* ViewContainerLocation.Sidebar */) {
                                this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                            }
                            else if (location === 1 /* ViewContainerLocation.Panel */ || location === 2 /* ViewContainerLocation.AuxiliaryBar */) {
                                this.paneCompositeService.hideActivePaneComposite(location);
                            }
                            // The blur event doesn't fire on WebKit when the focused element is hidden,
                            // so the context key needs to be forced here too otherwise a view may still
                            // think it's showing, breaking toggle commands.
                            if (this.focusedViewContextKey.get() === id) {
                                this.focusedViewContextKey.reset();
                            }
                        }
                        else {
                            view.setExpanded(false);
                        }
                    }
                }
            }
        }
        getActiveViewPaneContainer(viewContainer) {
            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            if (location === null) {
                return null;
            }
            const activePaneComposite = this.paneCompositeService.getActivePaneComposite(location);
            if (activePaneComposite?.getId() === viewContainer.id) {
                return activePaneComposite.getViewPaneContainer() || null;
            }
            return null;
        }
        getViewProgressIndicator(viewId) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(viewId);
            if (!viewContainer) {
                return undefined;
            }
            const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
            if (!viewPaneContainer) {
                return undefined;
            }
            const view = viewPaneContainer.getView(viewId);
            if (!view) {
                return undefined;
            }
            if (viewPaneContainer.isViewMergedWithContainer()) {
                return this.getViewContainerProgressIndicator(viewContainer);
            }
            return view.getProgressIndicator();
        }
        getViewContainerProgressIndicator(viewContainer) {
            const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            if (viewContainerLocation === null) {
                return undefined;
            }
            return this.paneCompositeService.getProgressIndicator(viewContainer.id, viewContainerLocation);
        }
        registerOpenViewContainerAction(viewContainer) {
            const disposables = new lifecycle_1.DisposableStore();
            if (viewContainer.openCommandActionDescriptor) {
                const { id, mnemonicTitle, keybindings, order } = viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id };
                const title = viewContainer.openCommandActionDescriptor.title ?? viewContainer.title;
                const that = this;
                disposables.add((0, actions_1.registerAction2)(class OpenViewContainerAction extends actions_1.Action2 {
                    constructor() {
                        super({
                            id,
                            get title() {
                                const viewContainerLocation = that.viewDescriptorService.getViewContainerLocation(viewContainer);
                                const localizedTitle = typeof title === 'string' ? title : title.value;
                                const originalTitle = typeof title === 'string' ? title : title.original;
                                if (viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                                    return { value: (0, nls_1.localize)('show view', "Show {0}", localizedTitle), original: `Show ${originalTitle}` };
                                }
                                else {
                                    return { value: (0, nls_1.localize)('toggle view', "Toggle {0}", localizedTitle), original: `Toggle ${originalTitle}` };
                                }
                            },
                            category: actionCommonCategories_1.Categories.View,
                            precondition: contextkey_1.ContextKeyExpr.has(getEnabledViewContainerContextKey(viewContainer.id)),
                            keybinding: keybindings ? { ...keybindings, weight: 200 /* KeybindingWeight.WorkbenchContrib */ } : undefined,
                            f1: true
                        });
                    }
                    async run(serviceAccessor) {
                        const editorGroupService = serviceAccessor.get(editorGroupsService_1.IEditorGroupsService);
                        const viewDescriptorService = serviceAccessor.get(views_1.IViewDescriptorService);
                        const layoutService = serviceAccessor.get(layoutService_1.IWorkbenchLayoutService);
                        const viewsService = serviceAccessor.get(viewsService_1.IViewsService);
                        const viewContainerLocation = viewDescriptorService.getViewContainerLocation(viewContainer);
                        switch (viewContainerLocation) {
                            case 2 /* ViewContainerLocation.AuxiliaryBar */:
                            case 0 /* ViewContainerLocation.Sidebar */: {
                                const part = viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */ ? "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ : "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */;
                                if (!viewsService.isViewContainerVisible(viewContainer.id) || !layoutService.hasFocus(part)) {
                                    await viewsService.openViewContainer(viewContainer.id, true);
                                }
                                else {
                                    editorGroupService.activeGroup.focus();
                                }
                                break;
                            }
                            case 1 /* ViewContainerLocation.Panel */:
                                if (!viewsService.isViewContainerVisible(viewContainer.id) || !layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                                    await viewsService.openViewContainer(viewContainer.id, true);
                                }
                                else {
                                    viewsService.closeViewContainer(viewContainer.id);
                                }
                                break;
                        }
                    }
                }));
                if (mnemonicTitle) {
                    const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer);
                    disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
                        command: {
                            id,
                            title: mnemonicTitle,
                        },
                        group: defaultLocation === 0 /* ViewContainerLocation.Sidebar */ ? '3_views' : '4_panels',
                        when: contextkey_1.ContextKeyExpr.has(getEnabledViewContainerContextKey(viewContainer.id)),
                        order: order ?? Number.MAX_VALUE
                    }));
                }
            }
            return disposables;
        }
        registerOpenViewAction(viewDescriptor) {
            const disposables = new lifecycle_1.DisposableStore();
            if (viewDescriptor.openCommandActionDescriptor) {
                const title = viewDescriptor.openCommandActionDescriptor.title ?? viewDescriptor.name;
                const commandId = viewDescriptor.openCommandActionDescriptor.id;
                const that = this;
                disposables.add((0, actions_1.registerAction2)(class OpenViewAction extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: commandId,
                            get title() {
                                const viewContainerLocation = that.viewDescriptorService.getViewLocationById(viewDescriptor.id);
                                const localizedTitle = typeof title === 'string' ? title : title.value;
                                const originalTitle = typeof title === 'string' ? title : title.original;
                                if (viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                                    return { value: (0, nls_1.localize)('show view', "Show {0}", localizedTitle), original: `Show ${originalTitle}` };
                                }
                                else {
                                    return { value: (0, nls_1.localize)('toggle view', "Toggle {0}", localizedTitle), original: `Toggle ${originalTitle}` };
                                }
                            },
                            category: actionCommonCategories_1.Categories.View,
                            precondition: contextkey_1.ContextKeyExpr.has(`${viewDescriptor.id}.active`),
                            keybinding: viewDescriptor.openCommandActionDescriptor.keybindings ? { ...viewDescriptor.openCommandActionDescriptor.keybindings, weight: 200 /* KeybindingWeight.WorkbenchContrib */ } : undefined,
                            f1: true
                        });
                    }
                    async run(serviceAccessor) {
                        const editorGroupService = serviceAccessor.get(editorGroupsService_1.IEditorGroupsService);
                        const viewDescriptorService = serviceAccessor.get(views_1.IViewDescriptorService);
                        const layoutService = serviceAccessor.get(layoutService_1.IWorkbenchLayoutService);
                        const viewsService = serviceAccessor.get(viewsService_1.IViewsService);
                        const contextKeyService = serviceAccessor.get(contextkey_1.IContextKeyService);
                        const focusedViewId = contextkeys_1.FocusedViewContext.getValue(contextKeyService);
                        if (focusedViewId === viewDescriptor.id) {
                            const viewLocation = viewDescriptorService.getViewLocationById(viewDescriptor.id);
                            if (viewDescriptorService.getViewLocationById(viewDescriptor.id) === 0 /* ViewContainerLocation.Sidebar */) {
                                // focus the editor if the view is focused and in the side bar
                                editorGroupService.activeGroup.focus();
                            }
                            else if (viewLocation !== null) {
                                // otherwise hide the part where the view lives if focused
                                layoutService.setPartHidden(true, getPartByLocation(viewLocation));
                            }
                        }
                        else {
                            viewsService.openView(viewDescriptor.id, true);
                        }
                    }
                }));
                if (viewDescriptor.openCommandActionDescriptor.mnemonicTitle) {
                    const defaultViewContainer = this.viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
                    if (defaultViewContainer) {
                        const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(defaultViewContainer);
                        disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
                            command: {
                                id: commandId,
                                title: viewDescriptor.openCommandActionDescriptor.mnemonicTitle,
                            },
                            group: defaultLocation === 0 /* ViewContainerLocation.Sidebar */ ? '3_views' : '4_panels',
                            when: contextkey_1.ContextKeyExpr.has(`${viewDescriptor.id}.active`),
                            order: viewDescriptor.openCommandActionDescriptor.order ?? Number.MAX_VALUE
                        }));
                    }
                }
            }
            return disposables;
        }
        registerFocusViewAction(viewDescriptor, category) {
            return (0, actions_1.registerAction2)(class FocusViewAction extends actions_1.Action2 {
                constructor() {
                    const title = (0, nls_1.localize)({ key: 'focus view', comment: ['{0} indicates the name of the view to be focused.'] }, "Focus on {0} View", viewDescriptor.name.value);
                    super({
                        id: viewDescriptor.focusCommand ? viewDescriptor.focusCommand.id : `${viewDescriptor.id}.focus`,
                        title: { original: `Focus on ${viewDescriptor.name.original} View`, value: title },
                        category,
                        menu: [{
                                id: actions_1.MenuId.CommandPalette,
                                when: viewDescriptor.when,
                            }],
                        keybinding: {
                            when: contextkey_1.ContextKeyExpr.has(`${viewDescriptor.id}.active`),
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: viewDescriptor.focusCommand?.keybindings?.primary,
                            secondary: viewDescriptor.focusCommand?.keybindings?.secondary,
                            linux: viewDescriptor.focusCommand?.keybindings?.linux,
                            mac: viewDescriptor.focusCommand?.keybindings?.mac,
                            win: viewDescriptor.focusCommand?.keybindings?.win
                        },
                        metadata: {
                            description: title,
                            args: [
                                {
                                    name: 'focusOptions',
                                    description: 'Focus Options',
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            'preserveFocus': {
                                                type: 'boolean',
                                                default: false
                                            }
                                        },
                                    }
                                }
                            ]
                        }
                    });
                }
                run(accessor, options) {
                    accessor.get(viewsService_1.IViewsService).openView(viewDescriptor.id, !options?.preserveFocus);
                }
            });
        }
        registerResetViewLocationAction(viewDescriptor) {
            return (0, actions_1.registerAction2)(class ResetViewLocationAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `${viewDescriptor.id}.resetViewLocation`,
                        title: {
                            original: 'Reset Location',
                            value: (0, nls_1.localize)('resetViewLocation', "Reset Location")
                        },
                        menu: [{
                                id: actions_1.MenuId.ViewTitleContext,
                                when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewDescriptor.id), contextkey_1.ContextKeyExpr.equals(`${viewDescriptor.id}.defaultViewLocation`, false))),
                                group: '1_hide',
                                order: 2
                            }],
                    });
                }
                run(accessor) {
                    const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
                    const defaultContainer = viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
                    const containerModel = viewDescriptorService.getViewContainerModel(defaultContainer);
                    // The default container is hidden so we should try to reset its location first
                    if (defaultContainer.hideIfEmpty && containerModel.visibleViewDescriptors.length === 0) {
                        const defaultLocation = viewDescriptorService.getDefaultViewContainerLocation(defaultContainer);
                        viewDescriptorService.moveViewContainerToLocation(defaultContainer, defaultLocation, undefined, this.desc.id);
                    }
                    viewDescriptorService.moveViewsToContainer([viewDescriptor], viewDescriptorService.getDefaultContainerById(viewDescriptor.id), undefined, this.desc.id);
                    accessor.get(viewsService_1.IViewsService).openView(viewDescriptor.id, true);
                }
            });
        }
        registerPaneComposite(viewContainer, viewContainerLocation) {
            const that = this;
            let PaneContainer = class PaneContainer extends panecomposite_1.PaneComposite {
                constructor(telemetryService, contextService, storageService, instantiationService, themeService, contextMenuService, extensionService) {
                    super(viewContainer.id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService);
                }
                createViewPaneContainer(element) {
                    const viewPaneContainerDisposables = this._register(new lifecycle_1.DisposableStore());
                    // Use composite's instantiation service to get the editor progress service for any editors instantiated within the composite
                    const viewPaneContainer = that.createViewPaneContainer(element, viewContainer, viewContainerLocation, viewPaneContainerDisposables, this.instantiationService);
                    // Only updateTitleArea for non-filter views: microsoft/vscode-remote-release#3676
                    if (!(viewPaneContainer instanceof viewsViewlet_1.FilterViewPaneContainer)) {
                        viewPaneContainerDisposables.add(event_1.Event.any(viewPaneContainer.onDidAddViews, viewPaneContainer.onDidRemoveViews, viewPaneContainer.onTitleAreaUpdate)(() => {
                            // Update title area since there is no better way to update secondary actions
                            this.updateTitleArea();
                        }));
                    }
                    return viewPaneContainer;
                }
            };
            PaneContainer = __decorate([
                __param(0, telemetry_1.ITelemetryService),
                __param(1, workspace_1.IWorkspaceContextService),
                __param(2, storage_1.IStorageService),
                __param(3, instantiation_1.IInstantiationService),
                __param(4, themeService_1.IThemeService),
                __param(5, contextView_1.IContextMenuService),
                __param(6, extensions_2.IExtensionService)
            ], PaneContainer);
            platform_1.Registry.as(getPaneCompositeExtension(viewContainerLocation)).registerPaneComposite(panecomposite_1.PaneCompositeDescriptor.create(PaneContainer, viewContainer.id, typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value, (0, types_1.isString)(viewContainer.icon) ? viewContainer.icon : undefined, viewContainer.order, viewContainer.requestedIndex, viewContainer.icon instanceof uri_1.URI ? viewContainer.icon : undefined));
        }
        deregisterPaneComposite(viewContainer, viewContainerLocation) {
            platform_1.Registry.as(getPaneCompositeExtension(viewContainerLocation)).deregisterPaneComposite(viewContainer.id);
        }
        createViewPaneContainer(element, viewContainer, viewContainerLocation, disposables, instantiationService) {
            const viewPaneContainer = instantiationService.createInstance(viewContainer.ctorDescriptor.ctor, ...(viewContainer.ctorDescriptor.staticArguments || []));
            this.viewPaneContainers.set(viewPaneContainer.getId(), viewPaneContainer);
            disposables.add((0, lifecycle_1.toDisposable)(() => this.viewPaneContainers.delete(viewPaneContainer.getId())));
            disposables.add(viewPaneContainer.onDidAddViews(views => this.onViewsAdded(views)));
            disposables.add(viewPaneContainer.onDidChangeViewVisibility(view => this.onViewsVisibilityChanged(view, view.isBodyVisible())));
            disposables.add(viewPaneContainer.onDidRemoveViews(views => this.onViewsRemoved(views)));
            disposables.add(viewPaneContainer.onDidFocusView(view => {
                if (this.focusedViewContextKey.get() !== view.id) {
                    this.focusedViewContextKey.set(view.id);
                    this._onDidChangeFocusedView.fire();
                }
            }));
            disposables.add(viewPaneContainer.onDidBlurView(view => {
                if (this.focusedViewContextKey.get() === view.id) {
                    this.focusedViewContextKey.reset();
                    this._onDidChangeFocusedView.fire();
                }
            }));
            return viewPaneContainer;
        }
    };
    exports.ViewsService = ViewsService;
    exports.ViewsService = ViewsService = __decorate([
        __param(0, views_1.IViewDescriptorService),
        __param(1, panecomposite_2.IPaneCompositePartService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, layoutService_1.IWorkbenchLayoutService),
        __param(4, editorService_1.IEditorService)
    ], ViewsService);
    function getEnabledViewContainerContextKey(viewContainerId) { return `viewContainer.${viewContainerId}.enabled`; }
    function getPaneCompositeExtension(viewContainerLocation) {
        switch (viewContainerLocation) {
            case 2 /* ViewContainerLocation.AuxiliaryBar */:
                return panecomposite_1.Extensions.Auxiliary;
            case 1 /* ViewContainerLocation.Panel */:
                return panecomposite_1.Extensions.Panels;
            case 0 /* ViewContainerLocation.Sidebar */:
            default:
                return panecomposite_1.Extensions.Viewlets;
        }
    }
    function getPartByLocation(viewContainerLocation) {
        switch (viewContainerLocation) {
            case 2 /* ViewContainerLocation.AuxiliaryBar */:
                return "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */;
            case 1 /* ViewContainerLocation.Panel */:
                return "workbench.parts.panel" /* Parts.PANEL_PART */;
            case 0 /* ViewContainerLocation.Sidebar */:
            default:
                return "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */;
        }
    }
    exports.getPartByLocation = getPartByLocation;
    (0, extensions_1.registerSingleton)(viewsService_1.IViewsService, ViewsService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3NTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdmlld3MvYnJvd3Nlci92aWV3c1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0N6RixJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsc0JBQVU7UUFvQjNDLFlBQ3lCLHFCQUE4RCxFQUMzRCxvQkFBZ0UsRUFDdkUsaUJBQXNELEVBQ2pELGFBQXVELEVBQ2hFLGFBQThDO1lBRTlELEtBQUssRUFBRSxDQUFDO1lBTmlDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDMUMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUEyQjtZQUN0RCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2hDLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUMvQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFsQjlDLCtCQUEwQixHQUE4QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFvQyxDQUFDLENBQUM7WUFDaEosOEJBQXlCLEdBQTRDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7WUFFbkcsd0NBQW1DLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBcUUsQ0FBQyxDQUFDO1lBQy9JLHVDQUFrQyxHQUFHLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxLQUFLLENBQUM7WUFFNUUsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDdEUsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQWVwRSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBQzlELElBQUks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
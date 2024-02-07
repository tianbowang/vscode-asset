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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/touch", "vs/base/browser/ui/splitview/paneview", "vs/base/common/async", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/types", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions", "vs/workbench/browser/dnd", "vs/workbench/common/component", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/workbench/common/contextkeys", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/css!./media/paneviewlet"], function (require, exports, dom_1, mouseEvent_1, touch_1, paneview_1, async_1, event_1, keyCodes_1, lifecycle_1, types_1, nls, menuEntryActionViewItem_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, workspace_1, actions_2, dnd_1, component_1, theme_1, views_1, viewsService_1, contextkeys_1, extensions_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewPaneContainerAction = exports.ViewPaneContainer = exports.ViewsSubMenu = void 0;
    exports.ViewsSubMenu = new actions_1.MenuId('Views');
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewContainerTitle, {
        submenu: exports.ViewsSubMenu,
        title: nls.localize('views', "Views"),
        order: 1,
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */)), contextkey_1.ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */}`, "top" /* ActivityBarPosition.TOP */)),
    });
    var DropDirection;
    (function (DropDirection) {
        DropDirection[DropDirection["UP"] = 0] = "UP";
        DropDirection[DropDirection["DOWN"] = 1] = "DOWN";
        DropDirection[DropDirection["LEFT"] = 2] = "LEFT";
        DropDirection[DropDirection["RIGHT"] = 3] = "RIGHT";
    })(DropDirection || (DropDirection = {}));
    class ViewPaneDropOverlay extends themeService_1.Themable {
        static { this.OVERLAY_ID = 'monaco-pane-drop-overlay'; }
        get currentDropOperation() {
            return this._currentDropOperation;
        }
        constructor(paneElement, orientation, bounds, location, themeService) {
            super(themeService);
            this.paneElement = paneElement;
            this.orientation = orientation;
            this.bounds = bounds;
            this.location = location;
            this.cleanupOverlayScheduler = this._register(new async_1.RunOnceScheduler(() => this.dispose(), 300));
            this.create();
        }
        get disposed() {
            return !!this._disposed;
        }
        create() {
            // Container
            this.container = document.createElement('div');
            this.container.id = ViewPaneDropOverlay.OVERLAY_ID;
            this.container.style.top = '0px';
            // Parent
            this.paneElement.appendChild(this.container);
            this.paneElement.classList.add('dragged-over');
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.paneElement.removeChild(this.container);
                this.paneElement.classList.remove('dragged-over');
            }));
            // Overlay
            this.overlay = document.createElement('div');
            this.overlay.classList.add('pane-overlay-indicator');
            this.container.appendChild(this.overlay);
            // Overlay Event Handling
            this.registerListeners();
            // Styles
            this.updateStyles();
        }
        updateStyles() {
            // Overlay drop background
            this.overlay.style.backgroundColor = this.getColor(this.location === 1 /* ViewContainerLocation.Panel */ ? theme_1.PANEL_SECTION_DRAG_AND_DROP_BACKGROUND : theme_1.SIDE_BAR_DRAG_AND_DROP_BACKGROUND) || '';
            // Overlay contrast border (if any)
            const activeContrastBorderColor = this.getColor(colorRegistry_1.activeContrastBorder);
            this.overlay.style.outlineColor = activeContrastBorderColor || '';
            this.overlay.style.outlineOffset = activeContrastBorderColor ? '-2px' : '';
            this.overlay.style.outlineStyle = activeContrastBorderColor ? 'dashed' : '';
            this.overlay.style.outlineWidth = activeContrastBorderColor ? '2px' : '';
            this.overlay.style.borderColor = activeContrastBorderColor || '';
            this.overlay.style.borderStyle = 'solid';
            this.overlay.style.borderWidth = '0px';
        }
        registerListeners() {
            this._register(new dom_1.DragAndDropObserver(this.container, {
                onDragOver: e => {
                    // Position overlay
                    this.positionOverlay(e.offsetX, e.offsetY);
                    // Make sure to stop any running cleanup scheduler to remove the overlay
                    if (this.cleanupOverlayScheduler.isScheduled()) {
                        this.cleanupOverlayScheduler.cancel();
                    }
                },
                onDragLeave: e => this.dispose(),
                onDragEnd: e => this.dispose(),
                onDrop: e => {
                    // Dispose overlay
                    this.dispose();
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.MOUSE_OVER, () => {
                // Under some circumstances we have seen reports where the drop overlay is not being
                // cleaned up and as such the editor area remains under the overlay so that you cannot
                // type into the editor anymore. This seems related to using VMs and DND via host and
                // guest OS, though some users also saw it without VMs.
                // To protect against this issue we always destroy the overlay as soon as we detect a
                // mouse event over it. The delay is used to guarantee we are not interfering with the
                // actual DROP event that can also trigger a mouse over event.
                if (!this.cleanupOverlayScheduler.isScheduled()) {
                    this.cleanupOverlayScheduler.schedule();
                }
            }));
        }
        positionOverlay(mousePosX, mousePosY) {
            const paneWidth = this.paneElement.clientWidth;
            const paneHeight = this.paneElement.clientHeight;
            const splitWidthThreshold = paneWidth / 2;
            const splitHeightThreshold = paneHeight / 2;
            let dropDirection;
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                if (mousePosY < splitHeightThreshold) {
                    dropDirection = 0 /* DropDirection.UP */;
                }
                else if (mousePosY >= splitHeightThreshold) {
                    dropDirection = 1 /* DropDirection.DOWN */;
                }
            }
            else if (this.orientation === 1 /* Orientation.HORIZONTAL */) {
                if (mousePosX < splitWidthThreshold) {
                    dropDirection = 2 /* DropDirection.LEFT */;
                }
                else if (mousePosX >= splitWidthThreshold) {
                    dropDirection = 3 /* DropDirection.RIGHT */;
                }
            }
            // Draw overlay based on split direction
            switch (dropDirection) {
                case 0 /* DropDirection.UP */:
                    this.doPositionOverlay({ top: '0', left: '0', width: '100%', height: '50%' });
                    break;
                case 1 /* DropDirection.DOWN */:
                    this.doPositionOverlay({ bottom: '0', left: '0', width: '100%', height: '50%' });
                    break;
                case 2 /* DropDirection.LEFT */:
                    this.doPositionOverlay({ top: '0', left: '0', width: '50%', height: '100%' });
                    break;
                case 3 /* DropDirection.RIGHT */:
                    this.doPositionOverlay({ top: '0', right: '0', width: '50%', height: '100%' });
                    break;
                default: {
                    // const top = this.bounds?.top || 0;
                    // const left = this.bounds?.bottom || 0;
                    let top = '0';
                    let left = '0';
                    let width = '100%';
                    let height = '100%';
                    if (this.bounds) {
                        const boundingRect = this.container.getBoundingClientRect();
                        top = `${this.bounds.top - boundingRect.top}px`;
                        left = `${this.bounds.left - boundingRect.left}px`;
                        height = `${this.bounds.bottom - this.bounds.top}px`;
                        width = `${this.bounds.right - this.bounds.left}px`;
                    }
                    this.doPositionOverlay({ top, left, width, height });
                }
            }
            if ((this.orientation === 0 /* Orientation.VERTICAL */ && paneHeight <= 25) ||
                (this.orientation === 1 /* Orientation.HORIZONTAL */ && paneWidth <= 25)) {
                this.doUpdateOverlayBorder(dropDirection);
            }
            else {
                this.doUpdateOverlayBorder(undefined);
            }
            // Make sure the overlay is visible now
            this.overlay.style.opacity = '1';
            // Enable transition after a timeout to prevent initial animation
            setTimeout(() => this.overlay.classList.add('overlay-move-transition'), 0);
            // Remember as current split direction
            this._currentDropOperation = dropDirection;
        }
        doUpdateOverlayBorder(direction) {
            this.overlay.style.borderTopWidth = direction === 0 /* DropDirection.UP */ ? '2px' : '0px';
            this.overlay.style.borderLeftWidth = direction === 2 /* DropDirection.LEFT */ ? '2px' : '0px';
            this.overlay.style.borderBottomWidth = direction === 1 /* DropDirection.DOWN */ ? '2px' : '0px';
            this.overlay.style.borderRightWidth = direction === 3 /* DropDirection.RIGHT */ ? '2px' : '0px';
        }
        doPositionOverlay(options) {
            // Container
            this.container.style.height = '100%';
            // Overlay
            this.overlay.style.top = options.top || '';
            this.overlay.style.left = options.left || '';
            this.overlay.style.bottom = options.bottom || '';
            this.overlay.style.right = options.right || '';
            this.overlay.style.width = options.width;
            this.overlay.style.height = options.height;
        }
        contains(element) {
            return element === this.container || element === this.overlay;
        }
        dispose() {
            super.dispose();
            this._disposed = true;
        }
    }
    let ViewContainerMenuActions = class ViewContainerMenuActions extends actions_2.CompositeMenuActions {
        constructor(element, viewContainer, viewDescriptorService, contextKeyService, menuService) {
            const scopedContextKeyService = contextKeyService.createScoped(element);
            scopedContextKeyService.createKey('viewContainer', viewContainer.id);
            const viewContainerLocationKey = scopedContextKeyService.createKey('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(viewDescriptorService.getViewContainerLocation(viewContainer)));
            super(actions_1.MenuId.ViewContainerTitle, actions_1.MenuId.ViewContainerTitleContext, { shouldForwardArgs: true, renderShortTitle: true }, scopedContextKeyService, menuService);
            this._register(scopedContextKeyService);
            this._register(event_1.Event.filter(viewDescriptorService.onDidChangeContainerLocation, e => e.viewContainer === viewContainer)(() => viewContainerLocationKey.set((0, views_1.ViewContainerLocationToString)(viewDescriptorService.getViewContainerLocation(viewContainer)))));
        }
    };
    ViewContainerMenuActions = __decorate([
        __param(2, views_1.IViewDescriptorService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, actions_1.IMenuService)
    ], ViewContainerMenuActions);
    let ViewPaneContainer = class ViewPaneContainer extends component_1.Component {
        get onDidSashChange() {
            return (0, types_1.assertIsDefined)(this.paneview).onDidSashChange;
        }
        get panes() {
            return this.paneItems.map(i => i.pane);
        }
        get views() {
            return this.panes;
        }
        get length() {
            return this.paneItems.length;
        }
        get menuActions() {
            return this._menuActions;
        }
        constructor(id, options, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService) {
            super(id, themeService, storageService);
            this.options = options;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.layoutService = layoutService;
            this.contextMenuService = contextMenuService;
            this.telemetryService = telemetryService;
            this.extensionService = extensionService;
            this.storageService = storageService;
            this.contextService = contextService;
            this.viewDescriptorService = viewDescriptorService;
            this.paneItems = [];
            this.visible = false;
            this.areExtensionsReady = false;
            this.didLayout = false;
            this._onTitleAreaUpdate = this._register(new event_1.Emitter());
            this.onTitleAreaUpdate = this._onTitleAreaUpdate.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._onDidAddViews = this._register(new event_1.Emitter());
            this.onDidAddViews = this._onDidAddViews.event;
            this._onDidRemoveViews = this._register(new event_1.Emitter());
            this.onDidRemoveViews = this._onDidRemoveViews.event;
            this._onDidChangeViewVisibility = this._register(new event_1.Emitter());
            this.onDidChangeViewVisibility = this._onDidChangeViewVisibility.event;
            this._onDidFocusView = this._register(new event_1.Emitter());
            this.onDidFocusView = this._onDidFocusView.event;
            this._onDidBlurView = this._register(new event_1.Emitter());
            this.onDidBlurView = this._onDidBlurView.event;
            const container = this.viewDescriptorService.getViewContainerById(id);
            if (!container) {
                throw new Error('Could not find container');
            }
            this.viewContainer = container;
            this.visibleViewsStorageId = `${id}.numberOfVisibleViews`;
            this.visibleViewsCountFromCache = this.storageService.getNumber(this.visibleViewsStorageId, 1 /* StorageScope.WORKSPACE */, undefined);
            this.viewContainerModel = this.viewDescriptorService.getViewContainerModel(container);
        }
        create(parent) {
            const options = this.options;
            options.orientation = this.orientation;
            this.paneview = this._register(new paneview_1.PaneView(parent, this.options));
            if (this._boundarySashes) {
                this.paneview.setBoundarySashes(this._boundarySashes);
            }
            this._register(this.paneview.onDidDrop(({ from, to }) => this.movePane(from, to)));
            this._register(this.paneview.onDidScroll(_ => this.onDidScrollPane()));
            this._register(this.paneview.onDidSashReset((index) => this.onDidSashReset(index)));
            this._register((0, dom_1.addDisposableListener)(parent, dom_1.EventType.CONTEXT_MENU, (e) => this.showContextMenu(new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(parent), e))));
            this._register(touch_1.Gesture.addTarget(parent));
            this._register((0, dom_1.addDisposableListener)(parent, touch_1.EventType.Contextmenu, (e) => this.showContextMenu(new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(parent), e))));
            this._menuActions = this._register(this.instantiationService.createInstance(ViewContainerMenuActions, this.paneview.element, this.viewContainer));
            this._register(this._menuActions.onDidChange(() => this.updateTitleArea()));
            let overlay;
            const getOverlayBounds = () => {
                const fullSize = parent.getBoundingClientRect();
                const lastPane = this.panes[this.panes.length - 1].element.getBoundingClientRect();
                const top = this.orientation === 0 /* Orientation.VERTICAL */ ? lastPane.bottom : fullSize.top;
                const left = this.orientation === 1 /* Orientation.HORIZONTAL */ ? lastPane.right : fullSize.left;
                return {
                    top,
                    bottom: fullSize.bottom,
                    left,
                    right: fullSize.right,
                };
            };
            const inBounds = (bounds, pos) => {
                return pos.x >= bounds.left && pos.x <= bounds.right && pos.y >= bounds.top && pos.y <= bounds.bottom;
            };
            let bounds;
            this._register(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerTarget(parent, {
                onDragEnter: (e) => {
                    bounds = getOverlayBounds();
                    if (overlay && overlay.disposed) {
                        overlay = undefined;
                    }
                    if (!overlay && inBounds(bounds, e.eventData)) {
                        const dropData = e.dragAndDropData.getData();
                        if (dropData.type === 'view') {
                            const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(dropData.id);
                            const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(dropData.id);
                            if (oldViewContainer !== this.viewContainer && (!viewDescriptor || !viewDescriptor.canMoveView || this.viewContainer.rejectAddedViews)) {
                                return;
                            }
                            overlay = new ViewPaneDropOverlay(parent, undefined, bounds, this.viewDescriptorService.getViewContainerLocation(this.viewContainer), this.themeService);
                        }
                        if (dropData.type === 'composite' && dropData.id !== this.viewContainer.id) {
                            const container = this.viewDescriptorService.getViewContainerById(dropData.id);
                            const viewsToMove = this.viewDescriptorService.getViewContainerModel(container).allViewDescriptors;
                            if (!viewsToMove.some(v => !v.canMoveView) && viewsToMove.length > 0) {
                                overlay = new ViewPaneDropOverlay(parent, undefined, bounds, this.viewDescriptorService.getViewContainerLocation(this.viewContainer), this.themeService);
                            }
                        }
                    }
                },
                onDragOver: (e) => {
                    if (overlay && overlay.disposed) {
                        overlay = undefined;
                    }
                    if (overlay && !inBounds(bounds, e.eventData)) {
                        overlay.dispose();
                        overlay = undefined;
                    }
                    if (inBounds(bounds, e.eventData)) {
                        (0, dnd_1.toggleDropEffect)(e.eventData.dataTransfer, 'move', overlay !== undefined);
                    }
                },
                onDragLeave: (e) => {
                    overlay?.dispose();
                    overlay = undefined;
                },
                onDrop: (e) => {
                    if (overlay) {
                        const dropData = e.dragAndDropData.getData();
                        const viewsToMove = [];
                        if (dropData.type === 'composite' && dropData.id !== this.viewContainer.id) {
                            const container = this.viewDescriptorService.getViewContainerById(dropData.id);
                            const allViews = this.viewDescriptorService.getViewContainerModel(container).allViewDescriptors;
                            if (!allViews.some(v => !v.canMoveView)) {
                                viewsToMove.push(...allViews);
                            }
                        }
                        else if (dropData.type === 'view') {
                            const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(dropData.id);
                            const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(dropData.id);
                            if (oldViewContainer !== this.viewContainer && viewDescriptor && viewDescriptor.canMoveView) {
                                this.viewDescriptorService.moveViewsToContainer([viewDescriptor], this.viewContainer, undefined, 'dnd');
                            }
                        }
                        const paneCount = this.panes.length;
                        if (viewsToMove.length > 0) {
                            this.viewDescriptorService.moveViewsToContainer(viewsToMove, this.viewContainer, undefined, 'dnd');
                        }
                        if (paneCount > 0) {
                            for (const view of viewsToMove) {
                                const paneToMove = this.panes.find(p => p.id === view.id);
                                if (paneToMove) {
                                    this.movePane(paneToMove, this.panes[this.panes.length - 1]);
                                }
                            }
                        }
                    }
                    overlay?.dispose();
                    overlay = undefined;
                }
            }));
            this._register(this.onDidSashChange(() => this.saveViewSizes()));
            this._register(this.viewContainerModel.onDidAddVisibleViewDescriptors(added => this.onDidAddViewDescriptors(added)));
            this._register(this.viewContainerModel.onDidRemoveVisibleViewDescriptors(removed => this.onDidRemoveViewDescriptors(removed)));
            const addedViews = this.viewContainerModel.visibleViewDescriptors.map((viewDescriptor, index) => {
                const size = this.viewContainerModel.getSize(viewDescriptor.id);
                const collapsed = this.viewContainerModel.isCollapsed(viewDescriptor.id);
                return ({ viewDescriptor, index, size, collapsed });
            });
            if (addedViews.length) {
                this.onDidAddViewDescriptors(addedViews);
            }
            // Update headers after and title contributed views after available, since we read from cache in the beginning to know if the viewlet has single view or not. Ref #29609
            this.extensionService.whenInstalledExtensionsRegistered().then(() => {
                this.areExtensionsReady = true;
                if (this.panes.length) {
                    this.updateTitleArea();
                    this.updateViewHeaders();
                }
                this._register(this.configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */)) {
                        this.updateViewHeaders();
                    }
                }));
            });
            this._register(this.viewContainerModel.onDidChangeActiveViewDescriptors(() => this._onTitleAreaUpdate.fire()));
        }
        getTitle() {
            const containerTitle = this.viewContainerModel.title;
            if (this.isViewMergedWithContainer()) {
                const paneItemTitle = this.paneItems[0].pane.title;
                if (containerTitle === paneItemTitle) {
                    return this.paneItems[0].pane.title;
                }
                return paneItemTitle ? `${containerTitle}: ${paneItemTitle}` : containerTitle;
            }
            return containerTitle;
        }
        showContextMenu(event) {
            for (const paneItem of this.paneItems) {
                // Do not show context menu if target is coming from inside pane views
                if ((0, dom_1.isAncestor)(event.target, paneItem.pane.element)) {
                    return;
                }
            }
            event.stopPropagation();
            event.preventDefault();
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                getActions: () => this.menuActions?.getContextMenuActions() ?? []
            });
        }
        getActionsContext() {
            return undefined;
        }
        getActionViewItem(action) {
            if (this.isViewMergedWithContainer()) {
                return this.paneItems[0].pane.getActionViewItem(action);
            }
            return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action);
        }
        focus() {
            let paneToFocus = undefined;
            if (this.lastFocusedPane) {
                paneToFocus = this.lastFocusedPane;
            }
            else if (this.paneItems.length > 0) {
                for (const { pane } of this.paneItems) {
                    if (pane.isExpanded()) {
                        paneToFocus = pane;
                        break;
                    }
                }
            }
            if (paneToFocus) {
                paneToFocus.focus();
            }
        }
        get orientation() {
            switch (this.viewDescriptorService.getViewContainerLocation(this.viewContainer)) {
                case 0 /* ViewContainerLocation.Sidebar */:
                case 2 /* ViewContainerLocation.AuxiliaryBar */:
                    return 0 /* Orientation.VERTICAL */;
                case 1 /* ViewContainerLocation.Panel */:
                    return this.layoutService.getPanelPosition() === 2 /* Position.BOTTOM */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
            }
            return 0 /* Orientation.VERTICAL */;
        }
        layout(dimension) {
            if (this.paneview) {
                if (this.paneview.orientation !== this.orientation) {
                    this.paneview.flipOrientation(dimension.height, dimension.width);
                }
                this.paneview.layout(dimension.height, dimension.width);
            }
            this.dimension = dimension;
            if (this.didLayout) {
                this.saveViewSizes();
            }
            else {
                this.didLayout = true;
                this.restoreViewSizes();
            }
        }
        setBoundarySashes(sashes) {
            this._boundarySashes = sashes;
            this.paneview?.setBoundarySashes(sashes);
        }
        getOptimalWidth() {
            const additionalMargin = 16;
            const optimalWidth = Math.max(...this.panes.map(view => view.getOptimalWidth() || 0));
            return optimalWidth + additionalMargin;
        }
        addPanes(panes) {
            const wasMerged = this.isViewMergedWithContainer();
            for (const { pane: pane, size, index, disposable } of panes) {
                this.addPane(pane, size, disposable, index);
            }
            this.updateViewHeaders();
            if (this.isViewMergedWithContainer() !== wasMerged) {
                this.updateTitleArea();
            }
            this._onDidAddViews.fire(panes.map(({ pane }) => pane));
        }
        setVisible(visible) {
            if (this.visible !== !!visible) {
                this.visible = visible;
                this._onDidChangeVisibility.fire(visible);
            }
            this.panes.filter(view => view.isVisible() !== visible)
                .map((view) => view.setVisible(visible));
        }
        isVisible() {
            return this.visible;
        }
        updateTitleArea() {
            this._onTitleAreaUpdate.fire();
        }
        createView(viewDescriptor, options) {
            return this.instantiationService.createInstance(viewDescriptor.ctorDescriptor.ctor, ...(viewDescriptor.ctorDescriptor.staticArguments || []), options);
        }
        getView(id) {
            return this.panes.filter(view => view.id === id)[0];
        }
        saveViewSizes() {
            // Save size only when the layout has happened
            if (this.didLayout) {
                this.viewContainerModel.setSizes(this.panes.map(view => ({ id: view.id, size: this.getPaneSize(view) })));
            }
        }
        restoreViewSizes() {
            // Restore sizes only when the layout has happened
            if (this.didLayout) {
                let initialSizes;
                for (let i = 0; i < this.viewContainerModel.visibleViewDescriptors.length; i++) {
                    const pane = this.panes[i];
                    const viewDescriptor = this.viewContainerModel.visibleViewDescriptors[i];
                    const size = this.viewContainerModel.getSize(viewDescriptor.id);
                    if (typeof size === 'number') {
                        this.resizePane(pane, size);
                    }
                    else {
                        initialSizes = initialSizes ? initialSizes : this.computeInitialSizes();
                        this.resizePane(pane, initialSizes.get(pane.id) || 200);
                    }
                }
            }
        }
        computeInitialSizes() {
            const sizes = new Map();
            if (this.dimension) {
                const totalWeight = this.viewContainerModel.visibleViewDescriptors.reduce((totalWeight, { weight }) => totalWeight + (weight || 20), 0);
                for (const viewDescriptor of this.viewContainerModel.visibleViewDescriptors) {
                    if (this.orientation === 0 /* Orientation.VERTICAL */) {
                        sizes.set(viewDescriptor.id, this.dimension.height * (viewDescriptor.weight || 20) / totalWeight);
                    }
                    else {
                        sizes.set(viewDescriptor.id, this.dimension.width * (viewDescriptor.weight || 20) / totalWeight);
                    }
                }
            }
            return sizes;
        }
        saveState() {
            this.panes.forEach((view) => view.saveState());
            this.storageService.store(this.visibleViewsStorageId, this.length, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        onContextMenu(event, viewPane) {
            event.stopPropagation();
            event.preventDefault();
            const actions = viewPane.menuActions.getContextMenuActions();
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                getActions: () => actions
            });
        }
        openView(id, focus) {
            let view = this.getView(id);
            if (!view) {
                this.toggleViewVisibility(id);
            }
            view = this.getView(id);
            if (view) {
                view.setExpanded(true);
                if (focus) {
                    view.focus();
                }
            }
            return view;
        }
        onDidAddViewDescriptors(added) {
            const panesToAdd = [];
            for (const { viewDescriptor, collapsed, index, size } of added) {
                const pane = this.createView(viewDescriptor, {
                    id: viewDescriptor.id,
                    title: viewDescriptor.name.value,
                    fromExtensionId: viewDescriptor.extensionId,
                    expanded: !collapsed
                });
                pane.render();
                const contextMenuDisposable = (0, dom_1.addDisposableListener)(pane.draggableElement, 'contextmenu', e => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.onContextMenu(new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(pane.draggableElement), e), pane);
                });
                const collapseDisposable = event_1.Event.latch(event_1.Event.map(pane.onDidChange, () => !pane.isExpanded()))(collapsed => {
                    this.viewContainerModel.setCollapsed(viewDescriptor.id, collapsed);
                });
                panesToAdd.push({ pane, size: size || pane.minimumSize, index, disposable: (0, lifecycle_1.combinedDisposable)(contextMenuDisposable, collapseDisposable) });
            }
            this.addPanes(panesToAdd);
            this.restoreViewSizes();
            const panes = [];
            for (const { pane } of panesToAdd) {
                pane.setVisible(this.isVisible());
                panes.push(pane);
            }
            return panes;
        }
        onDidRemoveViewDescriptors(removed) {
            removed = removed.sort((a, b) => b.index - a.index);
            const panesToRemove = [];
            for (const { index } of removed) {
                const paneItem = this.paneItems[index];
                if (paneItem) {
                    panesToRemove.push(this.paneItems[index].pane);
                }
            }
            if (panesToRemove.length) {
                this.removePanes(panesToRemove);
                for (const pane of panesToRemove) {
                    pane.setVisible(false);
                }
            }
        }
        toggleViewVisibility(viewId) {
            // Check if view is active
            if (this.viewContainerModel.activeViewDescriptors.some(viewDescriptor => viewDescriptor.id === viewId)) {
                const visible = !this.viewContainerModel.isVisible(viewId);
                this.viewContainerModel.setVisible(viewId, visible);
            }
        }
        addPane(pane, size, disposable, index = this.paneItems.length - 1) {
            const onDidFocus = pane.onDidFocus(() => {
                this._onDidFocusView.fire(pane);
                this.lastFocusedPane = pane;
            });
            const onDidBlur = pane.onDidBlur(() => this._onDidBlurView.fire(pane));
            const onDidChangeTitleArea = pane.onDidChangeTitleArea(() => {
                if (this.isViewMergedWithContainer()) {
                    this.updateTitleArea();
                }
            });
            const onDidChangeVisibility = pane.onDidChangeBodyVisibility(() => this._onDidChangeViewVisibility.fire(pane));
            const onDidChange = pane.onDidChange(() => {
                if (pane === this.lastFocusedPane && !pane.isExpanded()) {
                    this.lastFocusedPane = undefined;
                }
            });
            const isPanel = this.viewDescriptorService.getViewContainerLocation(this.viewContainer) === 1 /* ViewContainerLocation.Panel */;
            pane.style({
                headerForeground: (0, colorRegistry_1.asCssVariable)(isPanel ? theme_1.PANEL_SECTION_HEADER_FOREGROUND : theme_1.SIDE_BAR_SECTION_HEADER_FOREGROUND),
                headerBackground: (0, colorRegistry_1.asCssVariable)(isPanel ? theme_1.PANEL_SECTION_HEADER_BACKGROUND : theme_1.SIDE_BAR_SECTION_HEADER_BACKGROUND),
                headerBorder: (0, colorRegistry_1.asCssVariable)(isPanel ? theme_1.PANEL_SECTION_HEADER_BORDER : theme_1.SIDE_BAR_SECTION_HEADER_BORDER),
                dropBackground: (0, colorRegistry_1.asCssVariable)(isPanel ? theme_1.PANEL_SECTION_DRAG_AND_DROP_BACKGROUND : theme_1.SIDE_BAR_DRAG_AND_DROP_BACKGROUND),
                leftBorder: isPanel ? (0, colorRegistry_1.asCssVariable)(theme_1.PANEL_SECTION_BORDER) : undefined
            });
            const store = new lifecycle_1.DisposableStore();
            store.add(disposable);
            store.add((0, lifecycle_1.combinedDisposable)(pane, onDidFocus, onDidBlur, onDidChangeTitleArea, onDidChange, onDidChangeVisibility));
            const paneItem = { pane, disposable: store };
            this.paneItems.splice(index, 0, paneItem);
            (0, types_1.assertIsDefined)(this.paneview).addPane(pane, size, index);
            let overlay;
            store.add(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerDraggable(pane.draggableElement, () => { return { type: 'view', id: pane.id }; }, {}));
            store.add(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerTarget(pane.dropTargetElement, {
                onDragEnter: (e) => {
                    if (!overlay) {
                        const dropData = e.dragAndDropData.getData();
                        if (dropData.type === 'view' && dropData.id !== pane.id) {
                            const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(dropData.id);
                            const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(dropData.id);
                            if (oldViewContainer !== this.viewContainer && (!viewDescriptor || !viewDescriptor.canMoveView || this.viewContainer.rejectAddedViews)) {
                                return;
                            }
                            overlay = new ViewPaneDropOverlay(pane.dropTargetElement, this.orientation ?? 0 /* Orientation.VERTICAL */, undefined, this.viewDescriptorService.getViewContainerLocation(this.viewContainer), this.themeService);
                        }
                        if (dropData.type === 'composite' && dropData.id !== this.viewContainer.id && !this.viewContainer.rejectAddedViews) {
                            const container = this.viewDescriptorService.getViewContainerById(dropData.id);
                            const viewsToMove = this.viewDescriptorService.getViewContainerModel(container).allViewDescriptors;
                            if (!viewsToMove.some(v => !v.canMoveView) && viewsToMove.length > 0) {
                                overlay = new ViewPaneDropOverlay(pane.dropTargetElement, this.orientation ?? 0 /* Orientation.VERTICAL */, undefined, this.viewDescriptorService.getViewContainerLocation(this.viewContainer), this.themeService);
                            }
                        }
                    }
                },
                onDragOver: (e) => {
                    (0, dnd_1.toggleDropEffect)(e.eventData.dataTransfer, 'move', overlay !== undefined);
                },
                onDragLeave: (e) => {
                    overlay?.dispose();
                    overlay = undefined;
                },
                onDrop: (e) => {
                    if (overlay) {
                        const dropData = e.dragAndDropData.getData();
                        const viewsToMove = [];
                        let anchorView;
                        if (dropData.type === 'composite' && dropData.id !== this.viewContainer.id && !this.viewContainer.rejectAddedViews) {
                            const container = this.viewDescriptorService.getViewContainerById(dropData.id);
                            const allViews = this.viewDescriptorService.getViewContainerModel(container).allViewDescriptors;
                            if (allViews.length > 0 && !allViews.some(v => !v.canMoveView)) {
                                viewsToMove.push(...allViews);
                                anchorView = allViews[0];
                            }
                        }
                        else if (dropData.type === 'view') {
                            const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(dropData.id);
                            const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(dropData.id);
                            if (oldViewContainer !== this.viewContainer && viewDescriptor && viewDescriptor.canMoveView && !this.viewContainer.rejectAddedViews) {
                                viewsToMove.push(viewDescriptor);
                            }
                            if (viewDescriptor) {
                                anchorView = viewDescriptor;
                            }
                        }
                        if (viewsToMove) {
                            this.viewDescriptorService.moveViewsToContainer(viewsToMove, this.viewContainer, undefined, 'dnd');
                        }
                        if (anchorView) {
                            if (overlay.currentDropOperation === 1 /* DropDirection.DOWN */ ||
                                overlay.currentDropOperation === 3 /* DropDirection.RIGHT */) {
                                const fromIndex = this.panes.findIndex(p => p.id === anchorView.id);
                                let toIndex = this.panes.findIndex(p => p.id === pane.id);
                                if (fromIndex >= 0 && toIndex >= 0) {
                                    if (fromIndex > toIndex) {
                                        toIndex++;
                                    }
                                    if (toIndex < this.panes.length && toIndex !== fromIndex) {
                                        this.movePane(this.panes[fromIndex], this.panes[toIndex]);
                                    }
                                }
                            }
                            if (overlay.currentDropOperation === 0 /* DropDirection.UP */ ||
                                overlay.currentDropOperation === 2 /* DropDirection.LEFT */) {
                                const fromIndex = this.panes.findIndex(p => p.id === anchorView.id);
                                let toIndex = this.panes.findIndex(p => p.id === pane.id);
                                if (fromIndex >= 0 && toIndex >= 0) {
                                    if (fromIndex < toIndex) {
                                        toIndex--;
                                    }
                                    if (toIndex >= 0 && toIndex !== fromIndex) {
                                        this.movePane(this.panes[fromIndex], this.panes[toIndex]);
                                    }
                                }
                            }
                            if (viewsToMove.length > 1) {
                                viewsToMove.slice(1).forEach(view => {
                                    let toIndex = this.panes.findIndex(p => p.id === anchorView.id);
                                    const fromIndex = this.panes.findIndex(p => p.id === view.id);
                                    if (fromIndex >= 0 && toIndex >= 0) {
                                        if (fromIndex > toIndex) {
                                            toIndex++;
                                        }
                                        if (toIndex < this.panes.length && toIndex !== fromIndex) {
                                            this.movePane(this.panes[fromIndex], this.panes[toIndex]);
                                            anchorView = view;
                                        }
                                    }
                                });
                            }
                        }
                    }
                    overlay?.dispose();
                    overlay = undefined;
                }
            }));
        }
        removePanes(panes) {
            const wasMerged = this.isViewMergedWithContainer();
            panes.forEach(pane => this.removePane(pane));
            this.updateViewHeaders();
            if (wasMerged !== this.isViewMergedWithContainer()) {
                this.updateTitleArea();
            }
            this._onDidRemoveViews.fire(panes);
        }
        removePane(pane) {
            const index = this.paneItems.findIndex(i => i.pane === pane);
            if (index === -1) {
                return;
            }
            if (this.lastFocusedPane === pane) {
                this.lastFocusedPane = undefined;
            }
            (0, types_1.assertIsDefined)(this.paneview).removePane(pane);
            const [paneItem] = this.paneItems.splice(index, 1);
            paneItem.disposable.dispose();
        }
        movePane(from, to) {
            const fromIndex = this.paneItems.findIndex(item => item.pane === from);
            const toIndex = this.paneItems.findIndex(item => item.pane === to);
            const fromViewDescriptor = this.viewContainerModel.visibleViewDescriptors[fromIndex];
            const toViewDescriptor = this.viewContainerModel.visibleViewDescriptors[toIndex];
            if (fromIndex < 0 || fromIndex >= this.paneItems.length) {
                return;
            }
            if (toIndex < 0 || toIndex >= this.paneItems.length) {
                return;
            }
            const [paneItem] = this.paneItems.splice(fromIndex, 1);
            this.paneItems.splice(toIndex, 0, paneItem);
            (0, types_1.assertIsDefined)(this.paneview).movePane(from, to);
            this.viewContainerModel.move(fromViewDescriptor.id, toViewDescriptor.id);
            this.updateTitleArea();
        }
        resizePane(pane, size) {
            (0, types_1.assertIsDefined)(this.paneview).resizePane(pane, size);
        }
        getPaneSize(pane) {
            return (0, types_1.assertIsDefined)(this.paneview).getPaneSize(pane);
        }
        updateViewHeaders() {
            if (this.isViewMergedWithContainer()) {
                if (this.paneItems[0].pane.isExpanded()) {
                    this.lastMergedCollapsedPane = undefined;
                }
                else {
                    this.lastMergedCollapsedPane = this.paneItems[0].pane;
                    this.paneItems[0].pane.setExpanded(true);
                }
                this.paneItems[0].pane.headerVisible = false;
                this.paneItems[0].pane.collapsible = true;
            }
            else {
                if (this.paneItems.length === 1) {
                    this.paneItems[0].pane.headerVisible = true;
                    if (this.paneItems[0].pane === this.lastMergedCollapsedPane) {
                        this.paneItems[0].pane.setExpanded(false);
                    }
                    this.paneItems[0].pane.collapsible = false;
                }
                else {
                    this.paneItems.forEach(i => {
                        i.pane.headerVisible = true;
                        i.pane.collapsible = true;
                        if (i.pane === this.lastMergedCollapsedPane) {
                            i.pane.setExpanded(false);
                        }
                    });
                }
                this.lastMergedCollapsedPane = undefined;
            }
        }
        isViewMergedWithContainer() {
            const location = this.viewDescriptorService.getViewContainerLocation(this.viewContainer);
            // Do not merge views in side bar when activity bar is on top because the view title is not shown
            if (location === 0 /* ViewContainerLocation.Sidebar */ && !this.layoutService.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */) && this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */) === "top" /* ActivityBarPosition.TOP */) {
                return false;
            }
            if (!(this.options.mergeViewWithContainerWhenSingleView && this.paneItems.length === 1)) {
                return false;
            }
            if (!this.areExtensionsReady) {
                if (this.visibleViewsCountFromCache === undefined) {
                    return this.paneItems[0].pane.isExpanded();
                }
                // Check in cache so that view do not jump. See #29609
                return this.visibleViewsCountFromCache === 1;
            }
            return true;
        }
        onDidScrollPane() {
            for (const pane of this.panes) {
                pane.onDidScrollRoot();
            }
        }
        onDidSashReset(index) {
            let firstPane = undefined;
            let secondPane = undefined;
            // Deal with collapsed views: to be clever, we split the space taken by the nearest uncollapsed views
            for (let i = index; i >= 0; i--) {
                if (this.paneItems[i].pane?.isVisible() && this.paneItems[i]?.pane.isExpanded()) {
                    firstPane = this.paneItems[i].pane;
                    break;
                }
            }
            for (let i = index + 1; i < this.paneItems.length; i++) {
                if (this.paneItems[i].pane?.isVisible() && this.paneItems[i]?.pane.isExpanded()) {
                    secondPane = this.paneItems[i].pane;
                    break;
                }
            }
            if (firstPane && secondPane) {
                const firstPaneSize = this.getPaneSize(firstPane);
                const secondPaneSize = this.getPaneSize(secondPane);
                // Avoid rounding errors and be consistent when resizing
                // The first pane always get half rounded up and the second is half rounded down
                const newFirstPaneSize = Math.ceil((firstPaneSize + secondPaneSize) / 2);
                const newSecondPaneSize = Math.floor((firstPaneSize + secondPaneSize) / 2);
                // Shrink the larger pane first, then grow the smaller pane
                // This prevents interfering with other view sizes
                if (firstPaneSize > secondPaneSize) {
                    this.resizePane(firstPane, newFirstPaneSize);
                    this.resizePane(secondPane, newSecondPaneSize);
                }
                else {
                    this.resizePane(secondPane, newSecondPaneSize);
                    this.resizePane(firstPane, newFirstPaneSize);
                }
            }
        }
        dispose() {
            super.dispose();
            this.paneItems.forEach(i => i.disposable.dispose());
            if (this.paneview) {
                this.paneview.dispose();
            }
        }
    };
    exports.ViewPaneContainer = ViewPaneContainer;
    exports.ViewPaneContainer = ViewPaneContainer = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, extensions_1.IExtensionService),
        __param(8, themeService_1.IThemeService),
        __param(9, storage_1.IStorageService),
        __param(10, workspace_1.IWorkspaceContextService),
        __param(11, views_1.IViewDescriptorService)
    ], ViewPaneContainer);
    class ViewPaneContainerAction extends actions_1.Action2 {
        constructor(desc) {
            super(desc);
            this.desc = desc;
        }
        run(accessor, ...args) {
            const viewPaneContainer = accessor.get(viewsService_1.IViewsService).getActiveViewPaneContainerWithId(this.desc.viewPaneContainerId);
            if (viewPaneContainer) {
                return this.runInViewPaneContainer(accessor, viewPaneContainer, ...args);
            }
        }
    }
    exports.ViewPaneContainerAction = ViewPaneContainerAction;
    class MoveViewPosition extends actions_1.Action2 {
        constructor(desc, offset) {
            super(desc);
            this.offset = offset;
        }
        async run(accessor) {
            const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const viewId = contextkeys_1.FocusedViewContext.getValue(contextKeyService);
            if (viewId === undefined) {
                return;
            }
            const viewContainer = viewDescriptorService.getViewContainerByViewId(viewId);
            const model = viewDescriptorService.getViewContainerModel(viewContainer);
            const viewDescriptor = model.visibleViewDescriptors.find(vd => vd.id === viewId);
            const currentIndex = model.visibleViewDescriptors.indexOf(viewDescriptor);
            if (currentIndex + this.offset < 0 || currentIndex + this.offset >= model.visibleViewDescriptors.length) {
                return;
            }
            const newPosition = model.visibleViewDescriptors[currentIndex + this.offset];
            model.move(viewDescriptor.id, newPosition.id);
        }
    }
    (0, actions_1.registerAction2)(class MoveViewUp extends MoveViewPosition {
        constructor() {
            super({
                id: 'views.moveViewUp',
                title: nls.localize('viewMoveUp', "Move View Up"),
                keybinding: {
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ + 41 /* KeyCode.KeyK */, 16 /* KeyCode.UpArrow */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    when: contextkeys_1.FocusedViewContext.notEqualsTo('')
                }
            }, -1);
        }
    });
    (0, actions_1.registerAction2)(class MoveViewLeft extends MoveViewPosition {
        constructor() {
            super({
                id: 'views.moveViewLeft',
                title: nls.localize('viewMoveLeft', "Move View Left"),
                keybinding: {
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ + 41 /* KeyCode.KeyK */, 15 /* KeyCode.LeftArrow */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    when: contextkeys_1.FocusedViewContext.notEqualsTo('')
                }
            }, -1);
        }
    });
    (0, actions_1.registerAction2)(class MoveViewDown extends MoveViewPosition {
        constructor() {
            super({
                id: 'views.moveViewDown',
                title: nls.localize('viewMoveDown', "Move View Down"),
                keybinding: {
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ + 41 /* KeyCode.KeyK */, 18 /* KeyCode.DownArrow */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    when: contextkeys_1.FocusedViewContext.notEqualsTo('')
                }
            }, 1);
        }
    });
    (0, actions_1.registerAction2)(class MoveViewRight extends MoveViewPosition {
        constructor() {
            super({
                id: 'views.moveViewRight',
                title: nls.localize('viewMoveRight', "Move View Right"),
                keybinding: {
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ + 41 /* KeyCode.KeyK */, 17 /* KeyCode.RightArrow */),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                    when: contextkeys_1.FocusedViewContext.notEqualsTo('')
                }
            }, 1);
        }
    });
    (0, actions_1.registerAction2)(class MoveViews extends actions_1.Action2 {
        constructor() {
            super({
                id: 'vscode.moveViews',
                title: nls.localize('viewsMove', "Move Views"),
            });
        }
        async run(accessor, options) {
            if (!Array.isArray(options?.viewIds) || typeof options?.destinationId !== 'string') {
                return Promise.reject('Invalid arguments');
            }
            const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            const destination = viewDescriptorService.getViewContainerById(options.destinationId);
            if (!destination) {
                return;
            }
            // FYI, don't use `moveViewsToContainer` in 1 shot, because it expects all views to have the same current location
            for (const viewId of options.viewIds) {
                const viewDescriptor = viewDescriptorService.getViewDescriptorById(viewId);
                if (viewDescriptor?.canMoveView) {
                    viewDescriptorService.moveViewsToContainer([viewDescriptor], destination, views_1.ViewVisibilityState.Default, this.desc.id);
                }
            }
            await accessor.get(viewsService_1.IViewsService).openViewContainer(destination.id, true);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld1BhbmVDb250YWluZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3ZpZXdzL3ZpZXdQYW5lQ29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdDbkYsUUFBQSxZQUFZLEdBQUcsSUFBSSxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsa0JBQWtCLEVBQWdCO1FBQ3BFLE9BQU8sRUFBRSxvQkFBWTtRQUNyQixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO1FBQ3JDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLElBQUEscUNBQTZCLHdDQUErQixDQUFDLEVBQUUsMkJBQWMsQ0FBQyxTQUFTLENBQUMsVUFBVSwyRUFBb0MsRUFBRSxzQ0FBMEIsQ0FBQztLQUMzTyxDQUFDLENBQUM7SUFXSCxJQUFXLGFBS1Y7SUFMRCxXQUFXLGFBQWE7UUFDdkIsNkNBQUUsQ0FBQTtRQUNGLGlEQUFJLENBQUE7UUFDSixpREFBSSxDQUFBO1FBQ0osbURBQUssQ0FBQTtJQUNOLENBQUMsRUFMVSxhQUFhLEtBQWIsYUFBYSxRQUt2QjtJQUlELE1BQU0sbUJBQW9CLFNBQVEsdUJBQVE7aUJBRWpCLGVBQVUsR0FBRywwQkFBMEIsQ0FBQztRQVloRSxJQUFJLG9CQUFvQjtZQUN2QixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztRQUNuQyxDQUFDO1FBRUQsWUFDUyxXQUF3QixFQUN4QixXQUFvQyxFQUNwQyxNQUFnQyxFQUM5QixRQUErQixFQUN6QyxZQUEyQjtZ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
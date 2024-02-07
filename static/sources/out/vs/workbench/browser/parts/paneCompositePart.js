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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/panecomposite", "vs/workbench/common/views", "vs/base/common/lifecycle", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/compositePart", "vs/workbench/browser/parts/paneCompositeBar", "vs/base/browser/dom", "vs/platform/registry/common/platform", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/extensions/common/extensions", "vs/nls", "vs/workbench/browser/dnd", "vs/workbench/common/theme", "vs/base/browser/ui/toolbar/toolbar", "vs/workbench/browser/actions", "vs/platform/actions/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/touch", "vs/base/browser/mouseEvent", "vs/base/common/actions", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/css!./media/paneCompositePart"], function (require, exports, event_1, instantiation_1, panecomposite_1, views_1, lifecycle_1, layoutService_1, compositePart_1, paneCompositeBar_1, dom_1, platform_1, notification_1, storage_1, contextView_1, keybinding_1, themeService_1, contextkey_1, extensions_1, nls_1, dnd_1, theme_1, toolbar_1, actions_1, actions_2, actionbar_1, touch_1, mouseEvent_1, actions_3, viewPaneContainer_1, menuEntryActionViewItem_1) {
    "use strict";
    var AbstractPaneCompositePart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractPaneCompositePart = void 0;
    let AbstractPaneCompositePart = class AbstractPaneCompositePart extends compositePart_1.CompositePart {
        static { AbstractPaneCompositePart_1 = this; }
        static { this.MIN_COMPOSITE_BAR_WIDTH = 50; }
        get snap() {
            // Always allow snapping closed
            // Only allow dragging open if the panel contains view containers
            return this.layoutService.isVisible(this.partId) || !!this.paneCompositeBar.value?.getVisiblePaneCompositeIds().length;
        }
        get onDidPaneCompositeOpen() { return event_1.Event.map(this.onDidCompositeOpen.event, compositeEvent => compositeEvent.composite); }
        constructor(partId, partOptions, activePaneCompositeSettingsKey, activePaneContextKey, paneFocusContextKey, nameForTelemetry, compositeCSSClass, titleForegroundColor, notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService) {
            let location = 0 /* ViewContainerLocation.Sidebar */;
            let registryId = panecomposite_1.Extensions.Viewlets;
            let globalActionsMenuId = actions_2.MenuId.SidebarTitle;
            if (partId === "workbench.parts.panel" /* Parts.PANEL_PART */) {
                location = 1 /* ViewContainerLocation.Panel */;
                registryId = panecomposite_1.Extensions.Panels;
                globalActionsMenuId = actions_2.MenuId.PanelTitle;
            }
            else if (partId === "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) {
                location = 2 /* ViewContainerLocation.AuxiliaryBar */;
                registryId = panecomposite_1.Extensions.Auxiliary;
                globalActionsMenuId = actions_2.MenuId.AuxiliaryBarTitle;
            }
            super(notificationService, storageService, contextMenuService, layoutService, keybindingService, instantiationService, themeService, platform_1.Registry.as(registryId), activePaneCompositeSettingsKey, viewDescriptorService.getDefaultViewContainer(location)?.id || '', nameForTelemetry, compositeCSSClass, titleForegroundColor, partId, partOptions);
            this.partId = partId;
            this.activePaneContextKey = activePaneContextKey;
            this.paneFocusContextKey = paneFocusContextKey;
            this.viewDescriptorService = viewDescriptorService;
            this.contextKeyService = contextKeyService;
            this.extensionService = extensionService;
            this.menuService = menuService;
            this.onDidPaneCompositeClose = this.onDidCompositeClose.event;
            this.paneCompositeBar = this._register(new lifecycle_1.MutableDisposable());
            this.blockOpening = false;
            this.location = location;
            this.globalActions = this._register(this.instantiationService.createInstance(actions_1.CompositeMenuActions, globalActionsMenuId, undefined, undefined));
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.onDidPaneCompositeOpen(composite => this.onDidOpen(composite)));
            this._register(this.onDidPaneCompositeClose(this.onDidClose, this));
            this._register(this.globalActions.onDidChange(() => this.updateGlobalToolbarActions()));
            this._register(this.registry.onDidDeregister(async (viewletDescriptor) => {
                const activeContainers = this.viewDescriptorService.getViewContainersByLocation(this.location)
                    .filter(container => this.viewDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0);
                if (activeContainers.length) {
                    if (this.getActiveComposite()?.getId() === viewletDescriptor.id) {
                        const defaultViewletId = this.viewDescriptorService.getDefaultViewContainer(this.location)?.id;
                        const containerToOpen = activeContainers.filter(c => c.id === defaultViewletId)[0] || activeContainers[0];
                        await this.openPaneComposite(containerToOpen.id);
                    }
                }
                else {
                    this.layoutService.setPartHidden(true, this.partId);
                }
                this.removeComposite(viewletDescriptor.id);
            }));
            this._register(this.extensionService.onDidRegisterExtensions(() => {
                this.layoutCompositeBar();
            }));
        }
        onDidOpen(composite) {
            this.activePaneContextKey.set(composite.getId());
        }
        onDidClose(composite) {
            const id = composite.getId();
            if (this.activePaneContextKey.get() === id) {
                this.activePaneContextKey.reset();
            }
        }
        showComposite(composite) {
            super.showComposite(composite);
            this.layoutCompositeBar();
            this.layoutEmptyMessage();
        }
        hideActiveComposite() {
            const composite = super.hideActiveComposite();
            this.layoutCompositeBar();
            this.layoutEmptyMessage();
            return composite;
        }
        create(parent) {
            this.element = parent;
            this.element.classList.add('pane-composite-part');
            super.create(parent);
            const contentArea = this.getContentArea();
            if (contentArea) {
                this.createEmptyPaneMessage(contentArea);
            }
            const focusTracker = this._register((0, dom_1.trackFocus)(parent));
            this._register(focusTracker.onDidFocus(() => this.paneFocusContextKey.set(true)));
            this._register(focusTracker.onDidBlur(() => this.paneFocusContextKey.set(false)));
        }
        createEmptyPaneMessage(parent) {
            this.emptyPaneMessageElement = document.createElement('div');
            this.emptyPaneMessageElement.classList.add('empty-pane-message-area');
            const messageElement = document.createElement('div');
            messageElement.classList.add('empty-pane-message');
            messageElement.innerText = (0, nls_1.localize)('pane.emptyMessage', "Drag a view here to display.");
            this.emptyPaneMessageElement.appendChild(messageElement);
            parent.appendChild(this.emptyPaneMessageElement);
            this._register(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerTarget(this.emptyPaneMessageElement, {
                onDragOver: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    if (this.paneCompositeBar.value) {
                        const validDropTarget = this.paneCompositeBar.value.dndHandler.onDragEnter(e.dragAndDropData, undefined, e.eventData);
                        (0, dnd_1.toggleDropEffect)(e.eventData.dataTransfer, 'move', validDropTarget);
                    }
                },
                onDragEnter: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    if (this.paneCompositeBar.value) {
                        const validDropTarget = this.paneCompositeBar.value.dndHandler.onDragEnter(e.dragAndDropData, undefined, e.eventData);
                        this.emptyPaneMessageElement.style.backgroundColor = validDropTarget ? this.theme.getColor(theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND)?.toString() || '' : '';
                    }
                },
                onDragLeave: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    this.emptyPaneMessageElement.style.backgroundColor = '';
                },
                onDragEnd: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    this.emptyPaneMessageElement.style.backgroundColor = '';
                },
                onDrop: (e) => {
                    dom_1.EventHelper.stop(e.eventData, true);
                    this.emptyPaneMessageElement.style.backgroundColor = '';
                    if (this.paneCompositeBar.value) {
                        this.paneCompositeBar.value.dndHandler.drop(e.dragAndDropData, undefined, e.eventData);
                    }
                },
            }));
        }
        createTitleArea(parent) {
            const titleArea = super.createTitleArea(parent);
            this._register((0, dom_1.addDisposableListener)(titleArea, dom_1.EventType.CONTEXT_MENU, e => {
                this.onTitleAreaContextMenu(new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(titleArea), e));
            }));
            this._register(touch_1.Gesture.addTarget(titleArea));
            this._register((0, dom_1.addDisposableListener)(titleArea, touch_1.EventType.Contextmenu, e => {
                this.onTitleAreaContextMenu(new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(titleArea), e));
            }));
            const globalTitleActionsContainer = titleArea.appendChild((0, dom_1.$)('.global-actions'));
            // Global Actions Toolbar
            this.globalToolBar = this._register(new toolbar_1.ToolBar(globalTitleActionsContainer, this.contextMenuService, {
                actionViewItemProvider: action => this.actionViewItemProvider(action),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                anchorAlignmentProvider: () => this.getTitleAreaDropDownAnchorAlignment(),
                toggleMenuTitle: (0, nls_1.localize)('moreActions', "More Actions...")
            }));
            this.updateGlobalToolbarActions();
            return titleArea;
        }
        createTitleLabel(parent) {
            this.titleContainer = parent;
            const titleLabel = super.createTitleLabel(parent);
            this.titleLabelElement.draggable = true;
            const draggedItemProvider = () => {
                const activeViewlet = this.getActivePaneComposite();
                return { type: 'composite', id: activeViewlet.getId() };
            };
            this._register(dnd_1.CompositeDragAndDropObserver.INSTANCE.registerDraggable(this.titleLabelElement, draggedItemProvider, {}));
            this.updateTitleArea();
            return titleLabel;
        }
        updateTitleArea() {
            if (!this.titleContainer) {
                return;
            }
            if (this.shouldShowCompositeBar()) {
                if (!this.paneCompositeBar.value) {
                    this.titleContainer.classList.add('has-composite-bar');
                    this.paneCompositeBarContainer = (0, dom_1.prepend)(this.titleContainer, (0, dom_1.$)('.composite-bar-container'));
                    this.paneCompositeBar.value = this.createCompisteBar();
                    this.paneCompositeBar.value.create(this.paneCompositeBarContainer);
                }
            }
            else {
                this.titleContainer.classList.remove('has-composite-bar');
                this.paneCompositeBarContainer?.remove();
                this.paneCompositeBarContainer = undefined;
                this.paneCompositeBar.clear();
            }
        }
        createCompisteBar() {
            return this.instantiationService.createInstance(paneCompositeBar_1.PaneCompositeBar, this.getCompositeBarOptions(), this.partId, this);
        }
        onTitleAreaUpdate(compositeId) {
            super.onTitleAreaUpdate(compositeId);
            // If title actions change, relayout the composite bar
            this.layoutCompositeBar();
        }
        async openPaneComposite(id, focus) {
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.doOpenPaneComposite(id, focus);
            }
            await this.extensionService.whenInstalledExtensionsRegistered();
            if (typeof id === 'string' && this.getPaneComposite(id)) {
                return this.doOpenPaneComposite(id, focus);
            }
            return undefined;
        }
        doOpenPaneComposite(id, focus) {
            if (this.blockOpening) {
                return undefined; // Workaround against a potential race condition
            }
            if (!this.layoutService.isVisible(this.partId)) {
                try {
                    this.blockOpening = true;
                    this.layoutService.setPartHidden(false, this.partId);
                }
                finally {
                    this.blockOpening = false;
                }
            }
            return this.openComposite(id, focus);
        }
        getPaneComposite(id) {
            return this.registry.getPaneComposite(id);
        }
        getPaneComposites() {
            return this.registry.getPaneComposites()
                .sort((v1, v2) => {
                if (typeof v1.order !== 'number') {
                    return 1;
                }
                if (typeof v2.order !== 'number') {
                    return -1;
                }
                return v1.order - v2.order;
            });
        }
        getPinnedPaneCompositeIds() {
            return this.paneCompositeBar.value?.getPinnedPaneCompositeIds() ?? [];
        }
        getVisiblePaneCompositeIds() {
            return this.paneCompositeBar.value?.getVisiblePaneCompositeIds() ?? [];
        }
        getActivePaneComposite() {
            return this.getActiveComposite();
        }
        getLastActivePaneCompositeId() {
            return this.getLastActiveCompositeId();
        }
        hideActivePaneComposite() {
            if (this.layoutService.isVisible(this.partId)) {
                this.layoutService.setPartHidden(true, this.partId);
            }
            this.hideActiveComposite();
        }
        focusComositeBar() {
            this.paneCompositeBar.value?.focus();
        }
        layout(width, height, top, left) {
            if (!this.layoutService.isVisible(this.partId)) {
                return;
            }
            this.contentDimension = new dom_1.Dimension(width, height);
            // Layout contents
            super.layout(this.contentDimension.width, this.contentDimension.height, top, left);
            // Layout composite bar
            this.layoutCompositeBar();
            // Add empty pane message
            this.layoutEmptyMessage();
        }
        layoutCompositeBar() {
            if (this.contentDimension && this.dimension && this.paneCompositeBar.value) {
                let availableWidth = this.contentDimension.width - 16; // take padding into account
                if (this.toolBar) {
                    availableWidth = Math.max(AbstractPaneCompositePart_1.MIN_COMPOSITE_BAR_WIDTH, availableWidth - this.getToolbarWidth());
                }
                this.paneCompositeBar.value.layout(availableWidth, this.dimension.height);
            }
        }
        layoutEmptyMessage() {
            this.emptyPaneMessageElement?.classList.toggle('visible', !this.getActiveComposite());
        }
        updateGlobalToolbarActions() {
            const primaryActions = this.globalActions.getPrimaryActions();
            const secondaryActions = this.globalActions.getSecondaryActions();
            this.globalToolBar?.setActions((0, actionbar_1.prepareActions)(primaryActions), (0, actionbar_1.prepareActions)(secondaryActions));
        }
        getToolbarWidth() {
            const activePane = this.getActivePaneComposite();
            if (!activePane || !this.toolBar) {
                return 0;
            }
            return this.toolBar.getItemsWidth() + 5 + (this.globalToolBar?.getItemsWidth() ?? 0); // 5px toolBar padding-left
        }
        onTitleAreaContextMenu(event) {
            if (this.shouldShowCompositeBar() && this.paneCompositeBar.value) {
                const actions = [...this.paneCompositeBar.value.getContextMenuActions()];
                if (actions.length) {
                    this.contextMenuService.showContextMenu({
                        getAnchor: () => event,
                        getActions: () => actions,
                        skipTelemetry: true
                    });
                }
            }
            else {
                const activePaneComposite = this.getActivePaneComposite();
                const activePaneCompositeActions = activePaneComposite ? activePaneComposite.getContextMenuActions() : [];
                if (activePaneCompositeActions.length) {
                    this.contextMenuService.showContextMenu({
                        getAnchor: () => event,
                        getActions: () => activePaneCompositeActions,
                        getActionViewItem: action => this.actionViewItemProvider(action),
                        actionRunner: activePaneComposite.getActionRunner(),
                        skipTelemetry: true
                    });
                }
            }
        }
        getViewsSubmenuAction() {
            const viewPaneContainer = this.getActivePaneComposite()?.getViewPaneContainer();
            if (viewPaneContainer) {
                const disposables = new lifecycle_1.DisposableStore();
                const viewsActions = [];
                const scopedContextKeyService = disposables.add(this.contextKeyService.createScoped(this.element));
                scopedContextKeyService.createKey('viewContainer', viewPaneContainer.viewContainer.id);
                const menu = disposables.add(this.menuService.createMenu(viewPaneContainer_1.ViewsSubMenu, scopedContextKeyService));
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true, renderShortTitle: true }, { primary: viewsActions, secondary: [] }, () => true);
                disposables.dispose();
                return viewsActions.length > 1 && viewsActions.some(a => a.enabled) ? new actions_3.SubmenuAction('views', (0, nls_1.localize)('views', "Views"), viewsActions) : undefined;
            }
            return undefined;
        }
    };
    exports.AbstractPaneCompositePart = AbstractPaneCompositePart;
    exports.AbstractPaneCompositePart = AbstractPaneCompositePart = AbstractPaneCompositePart_1 = __decorate([
        __param(8, notification_1.INotificationService),
        __param(9, storage_1.IStorageService),
        __param(10, contextView_1.IContextMenuService),
        __param(11, layoutService_1.IWorkbenchLayoutService),
        __param(12, keybinding_1.IKeybindingService),
        __param(13, instantiation_1.IInstantiationService),
        __param(14, themeService_1.IThemeService),
        __param(15, views_1.IViewDescriptorService),
        __param(16, contextkey_1.IContextKeyService),
        __param(17, extensions_1.IExtensionService),
        __param(18, actions_2.IMenuService)
    ], AbstractPaneCompositePart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZUNvbXBvc2l0ZVBhcnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3BhbmVDb21wb3NpdGVQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0RnpGLElBQWUseUJBQXlCLEdBQXhDLE1BQWUseUJBQTBCLFNBQVEsNkJBQTRCOztpQkFFM0QsNEJBQXVCLEdBQUcsRUFBRSxBQUFMLENBQU07UUFFckQsSUFBSSxJQUFJO1lBQ1AsK0JBQStCO1lBQy9CLGlFQUFpRTtZQUNqRSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUN4SCxDQUFDO1FBRUQsSUFBSSxzQkFBc0IsS0FBNEIsT0FBTyxhQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLEVBQUUsQ0FBaUIsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQWVwSyxZQUNVLE1BQXVFLEVBQ2hGLFdBQXlCLEVBQ3pCLDhCQUFzQyxFQUNyQixvQkFBeUMsRUFDbEQsbUJBQXlDLEVBQ2pELGdCQUF3QixFQUN4QixpQkFBeUIsRUFDekIsb0JBQXdDLEVBQ2xCLG1CQUF5QyxFQUM5QyxjQUErQixFQUMzQixrQkFBdUMsRUFDbkMsYUFBc0MsRUFDM0MsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUNuRCxZQUEyQixFQUNsQixxQkFBOEQsRUFDbEUsaUJBQXdELEVBQ3pELGdCQUFvRCxFQUN6RCxXQUE0QztZQUUxRCxJQUFJLFFBQVEsd0NBQWdDLENBQUM7WUFDN0Ms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
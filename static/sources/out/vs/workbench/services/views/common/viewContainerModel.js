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
define(["require", "exports", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/base/common/arrays", "vs/base/common/types", "vs/base/common/resources", "vs/base/common/themables", "vs/platform/log/common/log", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/output/common/output", "vs/base/common/map"], function (require, exports, views_1, contextkey_1, storage_1, platform_1, lifecycle_1, event_1, instantiation_1, uri_1, arrays_1, types_1, resources_1, themables_1, log_1, actions_1, actionCommonCategories_1, output_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewContainerModel = exports.getViewsStateStorageId = void 0;
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: '_workbench.output.showViewsLog',
                title: { value: 'Show Views Log', original: 'Show Views Log' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(servicesAccessor) {
            const loggerService = servicesAccessor.get(log_1.ILoggerService);
            const outputService = servicesAccessor.get(output_1.IOutputService);
            loggerService.setVisibility(views_1.VIEWS_LOG_ID, true);
            outputService.showChannel(views_1.VIEWS_LOG_ID);
        }
    });
    function getViewsStateStorageId(viewContainerStorageId) { return `${viewContainerStorageId}.hidden`; }
    exports.getViewsStateStorageId = getViewsStateStorageId;
    let ViewDescriptorsState = class ViewDescriptorsState extends lifecycle_1.Disposable {
        constructor(viewContainerStorageId, viewContainerName, storageService, loggerService) {
            super();
            this.viewContainerName = viewContainerName;
            this.storageService = storageService;
            this._onDidChangeStoredState = this._register(new event_1.Emitter());
            this.onDidChangeStoredState = this._onDidChangeStoredState.event;
            this.logger = loggerService.createLogger(views_1.VIEWS_LOG_ID, { name: views_1.VIEWS_LOG_NAME, hidden: true });
            this.globalViewsStateStorageId = getViewsStateStorageId(viewContainerStorageId);
            this.workspaceViewsStateStorageId = viewContainerStorageId;
            this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, this.globalViewsStateStorageId, this._register(new lifecycle_1.DisposableStore()))(() => this.onDidStorageChange()));
            this.state = this.initialize();
        }
        set(id, state) {
            this.state.set(id, state);
        }
        get(id) {
            return this.state.get(id);
        }
        updateState(viewDescriptors) {
            this.updateWorkspaceState(viewDescriptors);
            this.updateGlobalState(viewDescriptors);
        }
        updateWorkspaceState(viewDescriptors) {
            const storedViewsStates = this.getStoredWorkspaceState();
            for (const viewDescriptor of viewDescriptors) {
                const viewState = this.get(viewDescriptor.id);
                if (viewState) {
                    storedViewsStates[viewDescriptor.id] = {
                        collapsed: !!viewState.collapsed,
                        isHidden: !viewState.visibleWorkspace,
                        size: viewState.size,
                        order: viewDescriptor.workspace && viewState ? viewState.order : undefined
                    };
                }
            }
            if (Object.keys(storedViewsStates).length > 0) {
                this.storageService.store(this.workspaceViewsStateStorageId, JSON.stringify(storedViewsStates), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(this.workspaceViewsStateStorageId, 1 /* StorageScope.WORKSPACE */);
            }
        }
        updateGlobalState(viewDescriptors) {
            const storedGlobalState = this.getStoredGlobalState();
            for (const viewDescriptor of viewDescriptors) {
                const state = this.get(viewDescriptor.id);
                storedGlobalState.set(viewDescriptor.id, {
                    id: viewDescriptor.id,
                    isHidden: state && viewDescriptor.canToggleVisibility ? !state.visibleGlobal : false,
                    order: !viewDescriptor.workspace && state ? state.order : undefined
                });
            }
            this.setStoredGlobalState(storedGlobalState);
        }
        onDidStorageChange() {
            if (this.globalViewsStatesValue !== this.getStoredGlobalViewsStatesValue() /* This checks if current window changed the value or not */) {
                this._globalViewsStatesValue = undefined;
                const storedViewsVisibilityStates = this.getStoredGlobalState();
                const storedWorkspaceViewsStates = this.getStoredWorkspaceState();
                const changedStates = [];
                for (const [id, storedState] of storedViewsVisibilityStates) {
                    const state = this.get(id);
                    if (state) {
                        if (state.visibleGlobal !== !storedState.isHidden) {
                            if (!storedState.isHidden) {
                                this.logger.info(`View visibility state changed: ${id} is now visible`, this.viewContainerName);
                            }
                            changedStates.push({ id, visible: !storedState.isHidden });
                        }
                    }
                    else {
                        const workspaceViewState = storedWorkspaceViewsStates[id];
                        this.set(id, {
                            active: false,
                            visibleGlobal: !storedState.isHidden,
                            visibleWorkspace: (0, types_1.isUndefined)(workspaceViewState?.isHidden) ? undefined : !workspaceViewState?.isHidden,
                            collapsed: workspaceViewState?.collapsed,
                            order: workspaceViewState?.order,
                            size: workspaceViewState?.size,
                        });
                    }
                }
                if (changedStates.length) {
                    this._onDidChangeStoredState.fire(changedStates);
                    // Update the in memory state after firing the event
                    // so that the views can update their state accordingly
                    for (const changedState of changedStates) {
                        const state = this.get(changedState.id);
                        if (state) {
                            state.visibleGlobal = changedState.visible;
                        }
                    }
                }
            }
        }
        initialize() {
            const viewStates = new Map();
            const workspaceViewsStates = this.getStoredWorkspaceState();
            for (const id of Object.keys(workspaceViewsStates)) {
                const workspaceViewState = workspaceViewsStates[id];
                viewStates.set(id, {
                    active: false,
                    visibleGlobal: undefined,
                    visibleWorkspace: (0, types_1.isUndefined)(workspaceViewState.isHidden) ? undefined : !workspaceViewState.isHidden,
                    collapsed: workspaceViewState.collapsed,
                    order: workspaceViewState.order,
                    size: workspaceViewState.size,
                });
            }
            // Migrate to `viewletStateStorageId`
            const value = this.storageService.get(this.globalViewsStateStorageId, 1 /* StorageScope.WORKSPACE */, '[]');
            const { state: workspaceVisibilityStates } = this.parseStoredGlobalState(value);
            if (workspaceVisibilityStates.size > 0) {
                for (const { id, isHidden } of workspaceVisibilityStates.values()) {
                    const viewState = viewStates.get(id);
                    // Not migrated to `viewletStateStorageId`
                    if (viewState) {
                        if ((0, types_1.isUndefined)(viewState.visibleWorkspace)) {
                            viewState.visibleWorkspace = !isHidden;
                        }
                    }
                    else {
                        viewStates.set(id, {
                            active: false,
                            collapsed: undefined,
                            visibleGlobal: undefined,
                            visibleWorkspace: !isHidden,
                        });
                    }
                }
                this.storageService.remove(this.globalViewsStateStorageId, 1 /* StorageScope.WORKSPACE */);
            }
            const { state, hasDuplicates } = this.parseStoredGlobalState(this.globalViewsStatesValue);
            if (hasDuplicates) {
                this.setStoredGlobalState(state);
            }
            for (const { id, isHidden, order } of state.values()) {
                const viewState = viewStates.get(id);
                if (viewState) {
                    viewState.visibleGlobal = !isHidden;
                    if (!(0, types_1.isUndefined)(order)) {
                        viewState.order = order;
                    }
                }
                else {
                    viewStates.set(id, {
                        active: false,
                        visibleGlobal: !isHidden,
                        order,
                        collapsed: undefined,
                        visibleWorkspace: undefined,
                    });
                }
            }
            return viewStates;
        }
        getStoredWorkspaceState() {
            return JSON.parse(this.storageService.get(this.workspaceViewsStateStorageId, 1 /* StorageScope.WORKSPACE */, '{}'));
        }
        getStoredGlobalState() {
            return this.parseStoredGlobalState(this.globalViewsStatesValue).state;
        }
        setStoredGlobalState(storedGlobalState) {
            this.globalViewsStatesValue = JSON.stringify([...storedGlobalState.values()]);
        }
        parseStoredGlobalState(value) {
            const storedValue = JSON.parse(value);
            let hasDuplicates = false;
            const state = storedValue.reduce((result, storedState) => {
                if (typeof storedState === 'string' /* migration */) {
                    hasDuplicates = hasDuplicates || result.has(storedState);
                    result.set(storedState, { id: storedState, isHidden: true });
                }
                else {
                    hasDuplicates = hasDuplicates || result.has(storedState.id);
                    result.set(storedState.id, storedState);
                }
                return result;
            }, new Map());
            return { state, hasDuplicates };
        }
        get globalViewsStatesValue() {
            if (!this._globalViewsStatesValue) {
                this._globalViewsStatesValue = this.getStoredGlobalViewsStatesValue();
            }
            return this._globalViewsStatesValue;
        }
        set globalViewsStatesValue(globalViewsStatesValue) {
            if (this.globalViewsStatesValue !== globalViewsStatesValue) {
                this._globalViewsStatesValue = globalViewsStatesValue;
                this.setStoredGlobalViewsStatesValue(globalViewsStatesValue);
            }
        }
        getStoredGlobalViewsStatesValue() {
            return this.storageService.get(this.globalViewsStateStorageId, 0 /* StorageScope.PROFILE */, '[]');
        }
        setStoredGlobalViewsStatesValue(value) {
            this.storageService.store(this.globalViewsStateStorageId, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    ViewDescriptorsState = __decorate([
        __param(2, storage_1.IStorageService),
        __param(3, log_1.ILoggerService)
    ], ViewDescriptorsState);
    let ViewContainerModel = class ViewContainerModel extends lifecycle_1.Disposable {
        get title() { return this._title; }
        get icon() { return this._icon; }
        get keybindingId() { return this._keybindingId; }
        // All View Descriptors
        get allViewDescriptors() { return this.viewDescriptorItems.map(item => item.viewDescriptor); }
        // Active View Descriptors
        get activeViewDescriptors() { return this.viewDescriptorItems.filter(item => item.state.active).map(item => item.viewDescriptor); }
        // Visible View Descriptors
        get visibleViewDescriptors() { return this.viewDescriptorItems.filter(item => this.isViewDescriptorVisible(item)).map(item => item.viewDescriptor); }
        constructor(viewContainer, instantiationService, contextKeyService, loggerService) {
            super();
            this.viewContainer = viewContainer;
            this.contextKeyService = contextKeyService;
            this.contextKeys = new map_1.CounterSet();
            this.viewDescriptorItems = [];
            this._onDidChangeContainerInfo = this._register(new event_1.Emitter());
            this.onDidChangeContainerInfo = this._onDidChangeContainerInfo.event;
            this._onDidChangeAllViewDescriptors = this._register(new event_1.Emitter());
            this.onDidChangeAllViewDescriptors = this._onDidChangeAllViewDescriptors.event;
            this._onDidChangeActiveViewDescriptors = this._register(new event_1.Emitter());
            this.onDidChangeActiveViewDescriptors = this._onDidChangeActiveViewDescriptors.event;
            this._onDidAddVisibleViewDescriptors = this._register(new event_1.Emitter());
            this.onDidAddVisibleViewDescriptors = this._onDidAddVisibleViewDescriptors.event;
            this._onDidRemoveVisibleViewDescriptors = this._register(new event_1.Emitter());
            this.onDidRemoveVisibleViewDescriptors = this._onDidRemoveVisibleViewDescriptors.event;
            this._onDidMoveVisibleViewDescriptors = this._register(new event_1.Emitter());
            this.onDidMoveVisibleViewDescriptors = this._onDidMoveVisibleViewDescriptors.event;
            this.logger = loggerService.createLogger(views_1.VIEWS_LOG_ID, { name: views_1.VIEWS_LOG_NAME, hidden: true });
            this._register(event_1.Event.filter(contextKeyService.onDidChangeContext, e => e.affectsSome(this.contextKeys))(() => this.onDidChangeContext()));
            this.viewDescriptorsState = this._register(instantiationService.createInstance(ViewDescriptorsState, viewContainer.storageId || `${viewContainer.id}.state`, typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.original));
            this._register(this.viewDescriptorsState.onDidChangeStoredState(items => this.updateVisibility(items)));
            this.updateContainerInfo();
        }
        updateContainerInfo() {
            /* Use default container info if one of the visible view descriptors belongs to the current container by default */
            const useDefaultContainerInfo = this.viewContainer.alwaysUseContainerInfo || this.visibleViewDescriptors.length === 0 || this.visibleViewDescriptors.some(v => platform_1.Registry.as(views_1.Extensions.ViewsRegistry).getViewContainer(v.id) === this.viewContainer);
            const title = useDefaultContainerInfo ? (typeof this.viewContainer.title === 'string' ? this.viewContainer.title : this.viewContainer.title.value) : this.visibleViewDescriptors[0]?.containerTitle || this.visibleViewDescriptors[0]?.name?.value || '';
            let titleChanged = false;
            if (this._title !== title) {
                this._title = title;
                titleChanged = true;
            }
            const icon = useDefaultContainerInfo ? this.viewContainer.icon : this.visibleViewDescriptors[0]?.containerIcon || views_1.defaultViewIcon;
            let iconChanged = false;
            if (!this.isEqualIcon(icon)) {
                this._icon = icon;
                iconChanged = true;
            }
            const keybindingId = this.viewContainer.openCommandActionDescriptor?.id ?? this.activeViewDescriptors.find(v => v.openCommandActionDescriptor)?.openCommandActionDescriptor?.id;
            let keybindingIdChanged = false;
            if (this._keybindingId !== keybindingId) {
                this._keybindingId = keybindingId;
                keybindingIdChanged = true;
            }
            if (titleChanged || iconChanged || keybindingIdChanged) {
                this._onDidChangeContainerInfo.fire({ title: titleChanged, icon: iconChanged, keybindingId: keybindingIdChanged });
            }
        }
        isEqualIcon(icon) {
            if (uri_1.URI.isUri(icon)) {
                return uri_1.URI.isUri(this._icon) && (0, resources_1.isEqual)(icon, this._icon);
            }
            else if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                return themables_1.ThemeIcon.isThemeIcon(this._icon) && themables_1.ThemeIcon.isEqual(icon, this._icon);
            }
            return icon === this._icon;
        }
        isVisible(id) {
            const viewDescriptorItem = this.viewDescriptorItems.find(v => v.viewDescriptor.id === id);
            if (!viewDescriptorItem) {
                throw new Error(`Unknown view ${id}`);
            }
            return this.isViewDescriptorVisible(viewDescriptorItem);
        }
        setVisible(id, visible) {
            this.updateVisibility([{ id, visible }]);
        }
        updateVisibility(viewDescriptors) {
            // First: Update and remove the view descriptors which are asked to be hidden
            const viewDescriptorItemsToHide = (0, arrays_1.coalesce)(viewDescriptors.filter(({ visible }) => !visible)
                .map(({ id }) => this.findAndIgnoreIfNotFound(id)));
            const removed = [];
            for (const { viewDescriptorItem, visibleIndex } of viewDescriptorItemsToHide) {
                if (this.updateViewDescriptorItemVisibility(viewDescriptorItem, false)) {
                    removed.push({ viewDescriptor: viewDescriptorItem.viewDescriptor, index: visibleIndex });
                }
            }
            if (removed.length) {
                this.broadCastRemovedVisibleViewDescriptors(removed);
            }
            // Second: Update and add the view descriptors which are asked to be shown
            const added = [];
            for (const { id, visible } of viewDescriptors) {
                if (!visible) {
                    continue;
                }
                const foundViewDescriptor = this.findAndIgnoreIfNotFound(id);
                if (!foundViewDescriptor) {
                    continue;
                }
                const { viewDescriptorItem, visibleIndex } = foundViewDescriptor;
                if (this.updateViewDescriptorItemVisibility(viewDescriptorItem, true)) {
                    added.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor, size: viewDescriptorItem.state.size, collapsed: !!viewDescriptorItem.state.collapsed });
                }
            }
            if (added.length) {
                this.broadCastAddedVisibleViewDescriptors(added);
            }
        }
        updateViewDescriptorItemVisibility(viewDescriptorItem, visible) {
            if (!viewDescriptorItem.viewDescriptor.canToggleVisibility) {
                return false;
            }
            if (this.isViewDescriptorVisibleWhenActive(viewDescriptorItem) === visible) {
                return false;
            }
            // update visibility
            if (viewDescriptorItem.viewDescriptor.workspace) {
                viewDescriptorItem.state.visibleWorkspace = visible;
            }
            else {
                viewDescriptorItem.state.visibleGlobal = visible;
                if (visible) {
                    this.logger.info(`Showing view ${viewDescriptorItem.viewDescriptor.id} in the container ${this.viewContainer.id}`);
                }
            }
            // return `true` only if visibility is changed
            return this.isViewDescriptorVisible(viewDescriptorItem) === visible;
        }
        isCollapsed(id) {
            return !!this.find(id).viewDescriptorItem.state.collapsed;
        }
        setCollapsed(id, collapsed) {
            const { viewDescriptorItem } = this.find(id);
            if (viewDescriptorItem.state.collapsed !== collapsed) {
                viewDescriptorItem.state.collapsed = collapsed;
            }
            this.viewDescriptorsState.updateState(this.allViewDescriptors);
        }
        getSize(id) {
            return this.find(id).viewDescriptorItem.state.size;
        }
        setSizes(newSizes) {
            for (const { id, size } of newSizes) {
                const { viewDescriptorItem } = this.find(id);
                if (viewDescriptorItem.state.size !== size) {
                    viewDescriptorItem.state.size = size;
                }
            }
            this.viewDescriptorsState.updateState(this.allViewDescriptors);
        }
        move(from, to) {
            const fromIndex = this.viewDescriptorItems.findIndex(v => v.viewDescriptor.id === from);
            const toIndex = this.viewDescriptorItems.findIndex(v => v.viewDescriptor.id === to);
            const fromViewDescriptor = this.viewDescriptorItems[fromIndex];
            const toViewDescriptor = this.viewDescriptorItems[toIndex];
            (0, arrays_1.move)(this.viewDescriptorItems, fromIndex, toIndex);
            for (let index = 0; index < this.viewDescriptorItems.length; index++) {
                this.viewDescriptorItems[index].state.order = index;
            }
            this.broadCastMovedViewDescriptors({ index: fromIndex, viewDescriptor: fromViewDescriptor.viewDescriptor }, { index: toIndex, viewDescriptor: toViewDescriptor.viewDescriptor });
        }
        add(addedViewDescriptorStates) {
            const addedItems = [];
            for (const addedViewDescriptorState of addedViewDescriptorStates) {
                const viewDescriptor = addedViewDescriptorState.viewDescriptor;
                if (viewDescriptor.when) {
                    for (const key of viewDescriptor.when.keys()) {
                        this.contextKeys.add(key);
                    }
                }
                let state = this.viewDescriptorsState.get(viewDescriptor.id);
                if (state) {
                    // set defaults if not set
                    if (viewDescriptor.workspace) {
                        state.visibleWorkspace = (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.visible) ? ((0, types_1.isUndefinedOrNull)(state.visibleWorkspace) ? !viewDescriptor.hideByDefault : state.visibleWorkspace) : addedViewDescriptorState.visible;
                    }
                    else {
                        const isVisible = state.visibleGlobal;
                        state.visibleGlobal = (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.visible) ? ((0, types_1.isUndefinedOrNull)(state.visibleGlobal) ? !viewDescriptor.hideByDefault : state.visibleGlobal) : addedViewDescriptorState.visible;
                        if (state.visibleGlobal && !isVisible) {
                            this.logger.info(`Added view ${viewDescriptor.id} in the container ${this.viewContainer.id} and showing it.`, `${isVisible}`, `${viewDescriptor.hideByDefault}`, `${addedViewDescriptorState.visible}`);
                        }
                    }
                    state.collapsed = (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.collapsed) ? ((0, types_1.isUndefinedOrNull)(state.collapsed) ? !!viewDescriptor.collapsed : state.collapsed) : addedViewDescriptorState.collapsed;
                }
                else {
                    state = {
                        active: false,
                        visibleGlobal: (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.visible) ? !viewDescriptor.hideByDefault : addedViewDescriptorState.visible,
                        visibleWorkspace: (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.visible) ? !viewDescriptor.hideByDefault : addedViewDescriptorState.visible,
                        collapsed: (0, types_1.isUndefinedOrNull)(addedViewDescriptorState.collapsed) ? !!viewDescriptor.collapsed : addedViewDescriptorState.collapsed,
                    };
                }
                this.viewDescriptorsState.set(viewDescriptor.id, state);
                state.active = this.contextKeyService.contextMatchesRules(viewDescriptor.when);
                addedItems.push({ viewDescriptor, state });
            }
            this.viewDescriptorItems.push(...addedItems);
            this.viewDescriptorItems.sort(this.compareViewDescriptors.bind(this));
            this._onDidChangeAllViewDescriptors.fire({ added: addedItems.map(({ viewDescriptor }) => viewDescriptor), removed: [] });
            const addedActiveItems = [];
            for (const viewDescriptorItem of addedItems) {
                if (viewDescriptorItem.state.active) {
                    addedActiveItems.push({ viewDescriptorItem, visible: this.isViewDescriptorVisible(viewDescriptorItem) });
                }
            }
            if (addedActiveItems.length) {
                this._onDidChangeActiveViewDescriptors.fire(({ added: addedActiveItems.map(({ viewDescriptorItem }) => viewDescriptorItem.viewDescriptor), removed: [] }));
            }
            const addedVisibleDescriptors = [];
            for (const { viewDescriptorItem, visible } of addedActiveItems) {
                if (visible && this.isViewDescriptorVisible(viewDescriptorItem)) {
                    const { visibleIndex } = this.find(viewDescriptorItem.viewDescriptor.id);
                    addedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor, size: viewDescriptorItem.state.size, collapsed: !!viewDescriptorItem.state.collapsed });
                }
            }
            this.broadCastAddedVisibleViewDescriptors(addedVisibleDescriptors);
        }
        remove(viewDescriptors) {
            const removed = [];
            const removedItems = [];
            const removedActiveDescriptors = [];
            const removedVisibleDescriptors = [];
            for (const viewDescriptor of viewDescriptors) {
                if (viewDescriptor.when) {
                    for (const key of viewDescriptor.when.keys()) {
                        this.contextKeys.delete(key);
                    }
                }
                const index = this.viewDescriptorItems.findIndex(i => i.viewDescriptor.id === viewDescriptor.id);
                if (index !== -1) {
                    removed.push(viewDescriptor);
                    const viewDescriptorItem = this.viewDescriptorItems[index];
                    if (viewDescriptorItem.state.active) {
                        removedActiveDescriptors.push(viewDescriptorItem.viewDescriptor);
                    }
                    if (this.isViewDescriptorVisible(viewDescriptorItem)) {
                        const { visibleIndex } = this.find(viewDescriptorItem.viewDescriptor.id);
                        removedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: viewDescriptorItem.viewDescriptor });
                    }
                    removedItems.push(viewDescriptorItem);
                }
            }
            // update state
            removedItems.forEach(item => this.viewDescriptorItems.splice(this.viewDescriptorItems.indexOf(item), 1));
            this.broadCastRemovedVisibleViewDescriptors(removedVisibleDescriptors);
            if (removedActiveDescriptors.length) {
                this._onDidChangeActiveViewDescriptors.fire(({ added: [], removed: removedActiveDescriptors }));
            }
            if (removed.length) {
                this._onDidChangeAllViewDescriptors.fire({ added: [], removed });
            }
        }
        onDidChangeContext() {
            const addedActiveItems = [];
            const removedActiveItems = [];
            for (const item of this.viewDescriptorItems) {
                const wasActive = item.state.active;
                const isActive = this.contextKeyService.contextMatchesRules(item.viewDescriptor.when);
                if (wasActive !== isActive) {
                    if (isActive) {
                        addedActiveItems.push({ item, visibleWhenActive: this.isViewDescriptorVisibleWhenActive(item) });
                    }
                    else {
                        removedActiveItems.push(item);
                    }
                }
            }
            const removedVisibleDescriptors = [];
            for (const item of removedActiveItems) {
                if (this.isViewDescriptorVisible(item)) {
                    const { visibleIndex } = this.find(item.viewDescriptor.id);
                    removedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: item.viewDescriptor });
                }
            }
            // Update the State
            removedActiveItems.forEach(item => item.state.active = false);
            addedActiveItems.forEach(({ item }) => item.state.active = true);
            this.broadCastRemovedVisibleViewDescriptors(removedVisibleDescriptors);
            if (addedActiveItems.length || removedActiveItems.length) {
                this._onDidChangeActiveViewDescriptors.fire(({ added: addedActiveItems.map(({ item }) => item.viewDescriptor), removed: removedActiveItems.map(item => item.viewDescriptor) }));
            }
            const addedVisibleDescriptors = [];
            for (const { item, visibleWhenActive } of addedActiveItems) {
                if (visibleWhenActive && this.isViewDescriptorVisible(item)) {
                    const { visibleIndex } = this.find(item.viewDescriptor.id);
                    addedVisibleDescriptors.push({ index: visibleIndex, viewDescriptor: item.viewDescriptor, size: item.state.size, collapsed: !!item.state.collapsed });
                }
            }
            this.broadCastAddedVisibleViewDescriptors(addedVisibleDescriptors);
        }
        broadCastAddedVisibleViewDescriptors(added) {
            if (added.length) {
                this._onDidAddVisibleViewDescriptors.fire(added.sort((a, b) => a.index - b.index));
                this.updateState(`Added views:${added.map(v => v.viewDescriptor.id).join(',')} in ${this.viewContainer.id}`);
            }
        }
        broadCastRemovedVisibleViewDescriptors(removed) {
            if (removed.length) {
                this._onDidRemoveVisibleViewDescriptors.fire(removed.sort((a, b) => b.index - a.index));
                this.updateState(`Removed views:${removed.map(v => v.viewDescriptor.id).join(',')} from ${this.viewContainer.id}`);
            }
        }
        broadCastMovedViewDescriptors(from, to) {
            this._onDidMoveVisibleViewDescriptors.fire({ from, to });
            this.updateState(`Moved view ${from.viewDescriptor.id} to ${to.viewDescriptor.id} in ${this.viewContainer.id}`);
        }
        updateState(reason) {
            this.logger.info(reason);
            this.viewDescriptorsState.updateState(this.allViewDescriptors);
            this.updateContainerInfo();
        }
        isViewDescriptorVisible(viewDescriptorItem) {
            if (!viewDescriptorItem.state.active) {
                return false;
            }
            return this.isViewDescriptorVisibleWhenActive(viewDescriptorItem);
        }
        isViewDescriptorVisibleWhenActive(viewDescriptorItem) {
            if (viewDescriptorItem.viewDescriptor.workspace) {
                return !!viewDescriptorItem.state.visibleWorkspace;
            }
            return !!viewDescriptorItem.state.visibleGlobal;
        }
        find(id) {
            const result = this.findAndIgnoreIfNotFound(id);
            if (result) {
                return result;
            }
            throw new Error(`view descriptor ${id} not found`);
        }
        findAndIgnoreIfNotFound(id) {
            for (let i = 0, visibleIndex = 0; i < this.viewDescriptorItems.length; i++) {
                const viewDescriptorItem = this.viewDescriptorItems[i];
                if (viewDescriptorItem.viewDescriptor.id === id) {
                    return { index: i, visibleIndex, viewDescriptorItem: viewDescriptorItem };
                }
                if (this.isViewDescriptorVisible(viewDescriptorItem)) {
                    visibleIndex++;
                }
            }
            return undefined;
        }
        compareViewDescriptors(a, b) {
            if (a.viewDescriptor.id === b.viewDescriptor.id) {
                return 0;
            }
            return (this.getViewOrder(a) - this.getViewOrder(b)) || this.getGroupOrderResult(a.viewDescriptor, b.viewDescriptor);
        }
        getViewOrder(viewDescriptorItem) {
            const viewOrder = typeof viewDescriptorItem.state.order === 'number' ? viewDescriptorItem.state.order : viewDescriptorItem.viewDescriptor.order;
            return typeof viewOrder === 'number' ? viewOrder : Number.MAX_VALUE;
        }
        getGroupOrderResult(a, b) {
            if (!a.group || !b.group) {
                return 0;
            }
            if (a.group === b.group) {
                return 0;
            }
            return a.group < b.group ? -1 : 1;
        }
    };
    exports.ViewContainerModel = ViewContainerModel;
    exports.ViewContainerModel = ViewContainerModel = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, log_1.ILoggerService)
    ], ViewContainerModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0NvbnRhaW5lck1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdmlld3MvY29tbW9uL3ZpZXdDb250YWluZXJNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQmhHLElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87UUFDcEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGdDQUFnQztnQkFDcEMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRTtnQkFDOUQsUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztnQkFDOUIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBa0M7WUFDM0MsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLG9CQUFjLENBQUMsQ0FBQztZQUMzRCxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsdUJBQWMsQ0FBQyxDQUFDO1lBQzNELGFBQWEsQ0FBQyxhQUFhLENBQUMsb0JBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoRCxhQUFhLENBQUMsV0FBVyxDQUFDLG9CQUFZLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsU0FBZ0Isc0JBQXNCLENBQUMsc0JBQThCLElBQVksT0FBTyxHQUFHLHNCQUFzQixTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQTdILHdEQUE2SDtJQXdCN0gsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBVTtRQVc1QyxZQUNDLHNCQUE4QixFQUNiLGlCQUF5QixFQUN6QixjQUFnRCxFQUNq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
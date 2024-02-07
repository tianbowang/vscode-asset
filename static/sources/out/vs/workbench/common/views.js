/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/registry/common/platform", "vs/base/common/arrays", "vs/base/common/objects", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, event_1, nls_1, instantiation_1, lifecycle_1, map_1, platform_1, arrays_1, objects_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoTreeViewError = exports.ResolvableTreeItem = exports.TreeItemCollapsibleState = exports.ViewVisibilityState = exports.IViewDescriptorService = exports.ViewContentGroups = exports.ViewContainerLocationToString = exports.ViewContainerLocations = exports.ViewContainerLocation = exports.Extensions = exports.defaultViewIcon = exports.VIEWS_LOG_NAME = exports.VIEWS_LOG_ID = void 0;
    exports.VIEWS_LOG_ID = 'views';
    exports.VIEWS_LOG_NAME = (0, nls_1.localize)('views log', "Views");
    exports.defaultViewIcon = (0, iconRegistry_1.registerIcon)('default-view-icon', codicons_1.Codicon.window, (0, nls_1.localize)('defaultViewIcon', 'Default view icon.'));
    var Extensions;
    (function (Extensions) {
        Extensions.ViewContainersRegistry = 'workbench.registry.view.containers';
        Extensions.ViewsRegistry = 'workbench.registry.view';
    })(Extensions || (exports.Extensions = Extensions = {}));
    var ViewContainerLocation;
    (function (ViewContainerLocation) {
        ViewContainerLocation[ViewContainerLocation["Sidebar"] = 0] = "Sidebar";
        ViewContainerLocation[ViewContainerLocation["Panel"] = 1] = "Panel";
        ViewContainerLocation[ViewContainerLocation["AuxiliaryBar"] = 2] = "AuxiliaryBar";
    })(ViewContainerLocation || (exports.ViewContainerLocation = ViewContainerLocation = {}));
    exports.ViewContainerLocations = [0 /* ViewContainerLocation.Sidebar */, 1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */];
    function ViewContainerLocationToString(viewContainerLocation) {
        switch (viewContainerLocation) {
            case 0 /* ViewContainerLocation.Sidebar */: return 'sidebar';
            case 1 /* ViewContainerLocation.Panel */: return 'panel';
            case 2 /* ViewContainerLocation.AuxiliaryBar */: return 'auxiliarybar';
        }
    }
    exports.ViewContainerLocationToString = ViewContainerLocationToString;
    class ViewContainersRegistryImpl extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidRegister = this._register(new event_1.Emitter());
            this.onDidRegister = this._onDidRegister.event;
            this._onDidDeregister = this._register(new event_1.Emitter());
            this.onDidDeregister = this._onDidDeregister.event;
            this.viewContainers = new Map();
            this.defaultViewContainers = [];
        }
        get all() {
            return (0, arrays_1.flatten)([...this.viewContainers.values()]);
        }
        registerViewContainer(viewContainerDescriptor, viewContainerLocation, options) {
            const existing = this.get(viewContainerDescriptor.id);
            if (existing) {
                return existing;
            }
            const viewContainer = viewContainerDescriptor;
            viewContainer.openCommandActionDescriptor = options?.doNotRegisterOpenCommand ? undefined : (viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id });
            const viewContainers = (0, map_1.getOrSet)(this.viewContainers, viewContainerLocation, []);
            viewContainers.push(viewContainer);
            if (options?.isDefault) {
                this.defaultViewContainers.push(viewContainer);
            }
            this._onDidRegister.fire({ viewContainer, viewContainerLocation });
            return viewContainer;
        }
        deregisterViewContainer(viewContainer) {
            for (const viewContainerLocation of this.viewContainers.keys()) {
                const viewContainers = this.viewContainers.get(viewContainerLocation);
                const index = viewContainers?.indexOf(viewContainer);
                if (index !== -1) {
                    viewContainers?.splice(index, 1);
                    if (viewContainers.length === 0) {
                        this.viewContainers.delete(viewContainerLocation);
                    }
                    this._onDidDeregister.fire({ viewContainer, viewContainerLocation });
                    return;
                }
            }
        }
        get(id) {
            return this.all.filter(viewContainer => viewContainer.id === id)[0];
        }
        getViewContainers(location) {
            return [...(this.viewContainers.get(location) || [])];
        }
        getViewContainerLocation(container) {
            return [...this.viewContainers.keys()].filter(location => this.getViewContainers(location).filter(viewContainer => viewContainer?.id === container.id).length > 0)[0];
        }
        getDefaultViewContainer(location) {
            return this.defaultViewContainers.find(viewContainer => this.getViewContainerLocation(viewContainer) === location);
        }
    }
    platform_1.Registry.add(Extensions.ViewContainersRegistry, new ViewContainersRegistryImpl());
    var ViewContentGroups;
    (function (ViewContentGroups) {
        ViewContentGroups["Open"] = "2_open";
        ViewContentGroups["Debug"] = "4_debug";
        ViewContentGroups["SCM"] = "5_scm";
        ViewContentGroups["More"] = "9_more";
    })(ViewContentGroups || (exports.ViewContentGroups = ViewContentGroups = {}));
    function compareViewContentDescriptors(a, b) {
        const aGroup = a.group ?? ViewContentGroups.More;
        const bGroup = b.group ?? ViewContentGroups.More;
        if (aGroup !== bGroup) {
            return aGroup.localeCompare(bGroup);
        }
        return (a.order ?? 5) - (b.order ?? 5);
    }
    class ViewsRegistry extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onViewsRegistered = this._register(new event_1.Emitter());
            this.onViewsRegistered = this._onViewsRegistered.event;
            this._onViewsDeregistered = this._register(new event_1.Emitter());
            this.onViewsDeregistered = this._onViewsDeregistered.event;
            this._onDidChangeContainer = this._register(new event_1.Emitter());
            this.onDidChangeContainer = this._onDidChangeContainer.event;
            this._onDidChangeViewWelcomeContent = this._register(new event_1.Emitter());
            this.onDidChangeViewWelcomeContent = this._onDidChangeViewWelcomeContent.event;
            this._viewContainers = [];
            this._views = new Map();
            this._viewWelcomeContents = new map_1.SetMap();
        }
        registerViews(views, viewContainer) {
            this.registerViews2([{ views, viewContainer }]);
        }
        registerViews2(views) {
            views.forEach(({ views, viewContainer }) => this.addViews(views, viewContainer));
            this._onViewsRegistered.fire(views);
        }
        deregisterViews(viewDescriptors, viewContainer) {
            const views = this.removeViews(viewDescriptors, viewContainer);
            if (views.length) {
                this._onViewsDeregistered.fire({ views, viewContainer });
            }
        }
        moveViews(viewsToMove, viewContainer) {
            for (const container of this._views.keys()) {
                if (container !== viewContainer) {
                    const views = this.removeViews(viewsToMove, container);
                    if (views.length) {
                        this.addViews(views, viewContainer);
                        this._onDidChangeContainer.fire({ views, from: container, to: viewContainer });
                    }
                }
            }
        }
        getViews(loc) {
            return this._views.get(loc) || [];
        }
        getView(id) {
            for (const viewContainer of this._viewContainers) {
                const viewDescriptor = (this._views.get(viewContainer) || []).filter(v => v.id === id)[0];
                if (viewDescriptor) {
                    return viewDescriptor;
                }
            }
            return null;
        }
        getViewContainer(viewId) {
            for (const viewContainer of this._viewContainers) {
                const viewDescriptor = (this._views.get(viewContainer) || []).filter(v => v.id === viewId)[0];
                if (viewDescriptor) {
                    return viewContainer;
                }
            }
            return null;
        }
        registerViewWelcomeContent(id, viewContent) {
            this._viewWelcomeContents.add(id, viewContent);
            this._onDidChangeViewWelcomeContent.fire(id);
            return (0, lifecycle_1.toDisposable)(() => {
                this._viewWelcomeContents.delete(id, viewContent);
                this._onDidChangeViewWelcomeContent.fire(id);
            });
        }
        registerViewWelcomeContent2(id, viewContentMap) {
            const disposables = new Map();
            for (const [key, content] of viewContentMap) {
                this._viewWelcomeContents.add(id, content);
                disposables.set(key, (0, lifecycle_1.toDisposable)(() => {
                    this._viewWelcomeContents.delete(id, content);
                    this._onDidChangeViewWelcomeContent.fire(id);
                }));
            }
            this._onDidChangeViewWelcomeContent.fire(id);
            return disposables;
        }
        getViewWelcomeContent(id) {
            const result = [];
            this._viewWelcomeContents.forEach(id, descriptor => result.push(descriptor));
            return result.sort(compareViewContentDescriptors);
        }
        addViews(viewDescriptors, viewContainer) {
            let views = this._views.get(viewContainer);
            if (!views) {
                views = [];
                this._views.set(viewContainer, views);
                this._viewContainers.push(viewContainer);
            }
            for (const viewDescriptor of viewDescriptors) {
                if (this.getView(viewDescriptor.id) !== null) {
                    throw new Error((0, nls_1.localize)('duplicateId', "A view with id '{0}' is already registered", viewDescriptor.id));
                }
                views.push(viewDescriptor);
            }
        }
        removeViews(viewDescriptors, viewContainer) {
            const views = this._views.get(viewContainer);
            if (!views) {
                return [];
            }
            const viewsToDeregister = [];
            const remaningViews = [];
            for (const view of views) {
                if (!viewDescriptors.includes(view)) {
                    remaningViews.push(view);
                }
                else {
                    viewsToDeregister.push(view);
                }
            }
            if (viewsToDeregister.length) {
                if (remaningViews.length) {
                    this._views.set(viewContainer, remaningViews);
                }
                else {
                    this._views.delete(viewContainer);
                    this._viewContainers.splice(this._viewContainers.indexOf(viewContainer), 1);
                }
            }
            return viewsToDeregister;
        }
    }
    platform_1.Registry.add(Extensions.ViewsRegistry, new ViewsRegistry());
    exports.IViewDescriptorService = (0, instantiation_1.createDecorator)('viewDescriptorService');
    var ViewVisibilityState;
    (function (ViewVisibilityState) {
        ViewVisibilityState[ViewVisibilityState["Default"] = 0] = "Default";
        ViewVisibilityState[ViewVisibilityState["Expand"] = 1] = "Expand";
    })(ViewVisibilityState || (exports.ViewVisibilityState = ViewVisibilityState = {}));
    var TreeItemCollapsibleState;
    (function (TreeItemCollapsibleState) {
        TreeItemCollapsibleState[TreeItemCollapsibleState["None"] = 0] = "None";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Collapsed"] = 1] = "Collapsed";
        TreeItemCollapsibleState[TreeItemCollapsibleState["Expanded"] = 2] = "Expanded";
    })(TreeItemCollapsibleState || (exports.TreeItemCollapsibleState = TreeItemCollapsibleState = {}));
    class ResolvableTreeItem {
        constructor(treeItem, resolve) {
            this.resolved = false;
            this._hasResolve = false;
            (0, objects_1.mixin)(this, treeItem);
            this._hasResolve = !!resolve;
            this.resolve = async (token) => {
                if (resolve && !this.resolved) {
                    const resolvedItem = await resolve(token);
                    if (resolvedItem) {
                        // Resolvable elements. Currently tooltip and command.
                        this.tooltip = this.tooltip ?? resolvedItem.tooltip;
                        this.command = this.command ?? resolvedItem.command;
                    }
                }
                if (!token.isCancellationRequested) {
                    this.resolved = true;
                }
            };
        }
        get hasResolve() {
            return this._hasResolve;
        }
        resetResolve() {
            this.resolved = false;
        }
        asTreeItem() {
            return {
                handle: this.handle,
                parentHandle: this.parentHandle,
                collapsibleState: this.collapsibleState,
                label: this.label,
                description: this.description,
                icon: this.icon,
                iconDark: this.iconDark,
                themeIcon: this.themeIcon,
                resourceUri: this.resourceUri,
                tooltip: this.tooltip,
                contextValue: this.contextValue,
                command: this.command,
                children: this.children,
                accessibilityInformation: this.accessibilityInformation
            };
        }
    }
    exports.ResolvableTreeItem = ResolvableTreeItem;
    class NoTreeViewError extends Error {
        constructor(treeViewId) {
            super((0, nls_1.localize)('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
            this.name = 'NoTreeViewError';
        }
        static is(err) {
            return err.name === 'NoTreeViewError';
        }
    }
    exports.NoTreeViewError = NoTreeViewError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vdmlld3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJuRixRQUFBLFlBQVksR0FBRyxPQUFPLENBQUM7SUFDdkIsUUFBQSxjQUFjLEdBQUcsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELFFBQUEsZUFBZSxHQUFHLElBQUEsMkJBQVksRUFBQyxtQkFBbUIsRUFBRSxrQkFBTyxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7SUFFcEksSUFBaUIsVUFBVSxDQUcxQjtJQUhELFdBQWlCLFVBQVU7UUFDYixpQ0FBc0IsR0FBRyxvQ0FBb0MsQ0FBQztRQUM5RCx3QkFBYSxHQUFHLHlCQUF5QixDQUFDO0lBQ3hELENBQUMsRUFIZ0IsVUFBVSwwQkFBVixVQUFVLFFBRzFCO0lBRUQsSUFBa0IscUJBSWpCO0lBSkQsV0FBa0IscUJBQXFCO1FBQ3RDLHVFQUFPLENBQUE7UUFDUCxtRUFBSyxDQUFBO1FBQ0wsaUZBQVksQ0FBQTtJQUNiLENBQUMsRUFKaUIscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFJdEM7SUFFWSxRQUFBLHNCQUFzQixHQUFHLHdIQUFnRyxDQUFDO0lBRXZJLFNBQWdCLDZCQUE2QixDQUFDLHFCQUE0QztRQUN6RixRQUFRLHFCQUFxQixFQUFFLENBQUM7WUFDL0IsMENBQWtDLENBQUMsQ0FBQyxPQUFPLFNBQVMsQ0FBQztZQUNyRCx3Q0FBZ0MsQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDO1lBQ2pELCtDQUF1QyxDQUFDLENBQUMsT0FBTyxjQUFjLENBQUM7UUFDaEUsQ0FBQztJQUNGLENBQUM7SUFORCxzRUFNQztJQTZJRCxNQUFNLDBC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
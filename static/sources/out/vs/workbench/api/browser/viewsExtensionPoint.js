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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/strings", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/base/common/themables", "vs/workbench/browser/panecomposite", "vs/workbench/browser/parts/views/treeView", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/remote/browser/remoteExplorer", "vs/workbench/contrib/scm/common/scm", "vs/workbench/contrib/webviewView/browser/webviewViewPane", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/keyCodes", "vs/platform/list/browser/listService", "vs/platform/hover/browser/hover", "vs/base/common/cancellation", "vs/base/browser/ui/tree/asyncDataTree", "vs/workbench/services/views/browser/treeViewsService", "vs/platform/log/common/log"], function (require, exports, resources, strings_1, nls_1, contextkey_1, extensions_1, descriptors_1, instantiation_1, platform_1, themables_1, panecomposite_1, treeView_1, viewPaneContainer_1, contributions_1, views_1, debug_1, files_1, remoteExplorer_1, scm_1, webviewViewPane_1, extensions_2, extensionsRegistry_1, keybindingsRegistry_1, keyCodes_1, listService_1, hover_1, cancellation_1, asyncDataTree_1, treeViewsService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.viewsContainersContribution = void 0;
    const viewsContainerSchema = {
        type: 'object',
        properties: {
            id: {
                description: (0, nls_1.localize)({ key: 'vscode.extension.contributes.views.containers.id', comment: ['Contribution refers to those that an extension contributes to VS Code through an extension/contribution point. '] }, "Unique id used to identify the container in which views can be contributed using 'views' contribution point"),
                type: 'string',
                pattern: '^[a-zA-Z0-9_-]+$'
            },
            title: {
                description: (0, nls_1.localize)('vscode.extension.contributes.views.containers.title', 'Human readable string used to render the container'),
                type: 'string'
            },
            icon: {
                description: (0, nls_1.localize)('vscode.extension.contributes.views.containers.icon', "Path to the container icon. Icons are 24x24 centered on a 50x40 block and have a fill color of 'rgb(215, 218, 224)' or '#d7dae0'. It is recommended that icons be in SVG, though any image file type is accepted."),
                type: 'string'
            }
        },
        required: ['id', 'title', 'icon']
    };
    exports.viewsContainersContribution = {
        description: (0, nls_1.localize)('vscode.extension.contributes.viewsContainers', 'Contributes views containers to the editor'),
        type: 'object',
        properties: {
            'activitybar': {
                description: (0, nls_1.localize)('views.container.activitybar', "Contribute views containers to Activity Bar"),
                type: 'array',
                items: viewsContainerSchema
            },
            'panel': {
                description: (0, nls_1.localize)('views.container.panel', "Contribute views containers to Panel"),
                type: 'array',
                items: viewsContainerSchema
            }
        }
    };
    var ViewType;
    (function (ViewType) {
        ViewType["Tree"] = "tree";
        ViewType["Webview"] = "webview";
    })(ViewType || (ViewType = {}));
    var InitialVisibility;
    (function (InitialVisibility) {
        InitialVisibility["Visible"] = "visible";
        InitialVisibility["Hidden"] = "hidden";
        InitialVisibility["Collapsed"] = "collapsed";
    })(InitialVisibility || (InitialVisibility = {}));
    const viewDescriptor = {
        type: 'object',
        required: ['id', 'name'],
        defaultSnippets: [{ body: { id: '${1:id}', name: '${2:name}' } }],
        properties: {
            type: {
                markdownDescription: (0, nls_1.localize)('vscode.extension.contributes.view.type', "Type of the view. This can either be `tree` for a tree view based view or `webview` for a webview based view. The default is `tree`."),
                type: 'string',
                enum: [
                    'tree',
                    'webview',
                ],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)('vscode.extension.contributes.view.tree', "The view is backed by a `TreeView` created by `createTreeView`."),
                    (0, nls_1.localize)('vscode.extension.contributes.view.webview', "The view is backed by a `WebviewView` registered by `registerWebviewViewProvider`."),
                ]
            },
            id: {
                markdownDescription: (0, nls_1.localize)('vscode.extension.contributes.view.id', 'Identifier of the view. This should be unique across all views. It is recommended to include your extension id as part of the view id. Use this to register a data provider through `vscode.window.registerTreeDataProviderForView` API. Also to trigger activating your extension by registering `onView:${id}` event to `activationEvents`.'),
                type: 'string'
            },
            name: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.name', 'The human-readable name of the view. Will be shown'),
                type: 'string'
            },
            when: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.when', 'Condition which must be true to show this view'),
                type: 'string'
            },
            icon: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.icon', "Path to the view icon. View icons are displayed when the name of the view cannot be shown. It is recommended that icons be in SVG, though any image file type is accepted."),
                type: 'string'
            },
            contextualTitle: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.contextualTitle', "Human-readable context for when the view is moved out of its original location. By default, the view's container name will be used."),
                type: 'string'
            },
            visibility: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.initialState', "Initial state of the view when the extension is first installed. Once the user has changed the view state by collapsing, moving, or hiding the view, the initial state will not be used again."),
                type: 'string',
                enum: [
                    'visible',
                    'hidden',
                    'collapsed'
                ],
                default: 'visible',
                enumDescriptions: [
                    (0, nls_1.localize)('vscode.extension.contributes.view.initialState.visible', "The default initial state for the view. In most containers the view will be expanded, however; some built-in containers (explorer, scm, and debug) show all contributed views collapsed regardless of the `visibility`."),
                    (0, nls_1.localize)('vscode.extension.contributes.view.initialState.hidden', "The view will not be shown in the view container, but will be discoverable through the views menu and other view entry points and can be un-hidden by the user."),
                    (0, nls_1.localize)('vscode.extension.contributes.view.initialState.collapsed', "The view will show in the view container, but will be collapsed.")
                ]
            },
            initialSize: {
                type: 'number',
                description: (0, nls_1.localize)('vscode.extension.contributs.view.size', "The initial size of the view. The size will behave like the css 'flex' property, and will set the initial size when the view is first shown. In the side bar, this is the height of the view. This value is only respected when the same extension owns both the view and the view container."),
            }
        }
    };
    const remoteViewDescriptor = {
        type: 'object',
        required: ['id', 'name'],
        properties: {
            id: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.id', 'Identifier of the view. This should be unique across all views. It is recommended to include your extension id as part of the view id. Use this to register a data provider through `vscode.window.registerTreeDataProviderForView` API. Also to trigger activating your extension by registering `onView:${id}` event to `activationEvents`.'),
                type: 'string'
            },
            name: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.name', 'The human-readable name of the view. Will be shown'),
                type: 'string'
            },
            when: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.when', 'Condition which must be true to show this view'),
                type: 'string'
            },
            group: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.group', 'Nested group in the viewlet'),
                type: 'string'
            },
            remoteName: {
                description: (0, nls_1.localize)('vscode.extension.contributes.view.remoteName', 'The name of the remote type associated with this view'),
                type: ['string', 'array'],
                items: {
                    type: 'string'
                }
            }
        }
    };
    const viewsContribution = {
        description: (0, nls_1.localize)('vscode.extension.contributes.views', "Contributes views to the editor"),
        type: 'object',
        properties: {
            'explorer': {
                description: (0, nls_1.localize)('views.explorer', "Contributes views to Explorer container in the Activity bar"),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'debug': {
                description: (0, nls_1.localize)('views.debug', "Contributes views to Debug container in the Activity bar"),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'scm': {
                description: (0, nls_1.localize)('views.scm', "Contributes views to SCM container in the Activity bar"),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'test': {
                description: (0, nls_1.localize)('views.test', "Contributes views to Test container in the Activity bar"),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'remote': {
                description: (0, nls_1.localize)('views.remote', "Contributes views to Remote container in the Activity bar. To contribute to this container, enableProposedApi needs to be turned on"),
                type: 'array',
                items: remoteViewDescriptor,
                default: []
            }
        },
        additionalProperties: {
            description: (0, nls_1.localize)('views.contributed', "Contributes views to contributed views container"),
            type: 'array',
            items: viewDescriptor,
            default: []
        }
    };
    const viewsContainersExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'viewsContainers',
        jsonSchema: exports.viewsContainersContribution
    });
    const viewsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'views',
        deps: [viewsContainersExtensionPoint],
        jsonSchema: viewsContribution,
        activationEventsGenerator: (viewExtensionPointTypeArray, result) => {
            for (const viewExtensionPointType of viewExtensionPointTypeArray) {
                for (const viewDescriptors of Object.values(viewExtensionPointType)) {
                    for (const viewDescriptor of viewDescriptors) {
                        if (viewDescriptor.id) {
                            result.push(`onView:${viewDescriptor.id}`);
                        }
                    }
                }
            }
        }
    });
    const CUSTOM_VIEWS_START_ORDER = 7;
    let ViewsExtensionHandler = class ViewsExtensionHandler {
        constructor(instantiationService, logService) {
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            this.viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            this.handleAndRegisterCustomViewContainers();
            this.handleAndRegisterCustomViews();
            let showTreeHoverCancellation = new cancellation_1.CancellationTokenSource();
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: 'workbench.action.showTreeHover',
                handler: async (accessor, ...args) => {
                    showTreeHoverCancellation.cancel();
                    showTreeHoverCancellation = new cancellation_1.CancellationTokenSource();
                    const listService = accessor.get(listService_1.IListService);
                    const treeViewsService = accessor.get(treeViewsService_1.ITreeViewsService);
                    const hoverService = accessor.get(hover_1.IHoverService);
                    const lastFocusedList = listService.lastFocusedList;
                    if (!(lastFocusedList instanceof asyncDataTree_1.AsyncDataTree)) {
                        return;
                    }
                    const focus = lastFocusedList.getFocus();
                    if (!focus || (focus.length === 0)) {
                        return;
                    }
                    const treeItem = focus[0];
                    if (treeItem instanceof views_1.ResolvableTreeItem) {
                        await treeItem.resolve(showTreeHoverCancellation.token);
                    }
                    if (!treeItem.tooltip) {
                        return;
                    }
                    const element = treeViewsService.getRenderedTreeElement(('handle' in treeItem) ? treeItem.handle : treeItem);
                    if (!element) {
                        return;
                    }
                    hoverService.showHover({
                        content: treeItem.tooltip,
                        target: element,
                        position: {
                            hoverPosition: 2 /* HoverPosition.BELOW */,
                        },
                        persistence: {
                            hideOnHover: false
                        }
                    }, true);
                },
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                when: contextkey_1.ContextKeyExpr.and(treeView_1.RawCustomTreeViewContextKey, listService_1.WorkbenchListFocusContextKey)
            });
        }
        handleAndRegisterCustomViewContainers() {
            viewsContainersExtensionPoint.setHandler((extensions, { added, removed }) => {
                if (removed.length) {
                    this.removeCustomViewContainers(removed);
                }
                if (added.length) {
                    this.addCustomViewContainers(added, this.viewContainersRegistry.all);
                }
            });
        }
        addCustomViewContainers(extensionPoints, existingViewContainers) {
            const viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            let activityBarOrder = CUSTOM_VIEWS_START_ORDER + viewContainersRegistry.all.filter(v => !!v.extensionId && viewContainersRegistry.getViewContainerLocation(v) === 0 /* ViewContainerLocation.Sidebar */).length;
            let panelOrder = 5 + viewContainersRegistry.all.filter(v => !!v.extensionId && viewContainersRegistry.getViewContainerLocation(v) === 1 /* ViewContainerLocation.Panel */).length + 1;
            for (const { value, collector, description } of extensionPoints) {
                Object.entries(value).forEach(([key, value]) => {
                    if (!this.isValidViewsContainer(value, collector)) {
                        return;
                    }
                    switch (key) {
                        case 'activitybar':
                            activityBarOrder = this.registerCustomViewContainers(value, description, activityBarOrder, existingViewContainers, 0 /* ViewContainerLocation.Sidebar */);
                            break;
                        case 'panel':
                            panelOrder = this.registerCustomViewContainers(value, description, panelOrder, existingViewContainers, 1 /* ViewContainerLocation.Panel */);
                            break;
                    }
                });
            }
        }
        removeCustomViewContainers(extensionPoints) {
            const viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            const removedExtensions = extensionPoints.reduce((result, e) => { result.add(e.description.identifier); return result; }, new extensions_1.ExtensionIdentifierSet());
            for (const viewContainer of viewContainersRegistry.all) {
                if (viewContainer.extensionId && removedExtensions.has(viewContainer.extensionId)) {
                    // move all views in this container into default view container
                    const views = this.viewsRegistry.getViews(viewContainer);
                    if (views.length) {
                        this.viewsRegistry.moveViews(views, this.getDefaultViewContainer());
                    }
                    this.deregisterCustomViewContainer(viewContainer);
                }
            }
        }
        isValidViewsContainer(viewsContainersDescriptors, collector) {
            if (!Array.isArray(viewsContainersDescriptors)) {
                collector.error((0, nls_1.localize)('viewcontainer requirearray', "views containers must be an array"));
                return false;
            }
            for (const descriptor of viewsContainersDescriptors) {
                if (typeof descriptor.id !== 'string' && (0, strings_1.isFalsyOrWhitespace)(descriptor.id)) {
                    collector.error((0, nls_1.localize)('requireidstring', "property `{0}` is mandatory and must be of type `string` with non-empty value. Only alphanumeric characters, '_', and '-' are allowed.", 'id'));
                    return false;
                }
                if (!(/^[a-z0-9_-]+$/i.test(descriptor.id))) {
                    collector.error((0, nls_1.localize)('requireidstring', "property `{0}` is mandatory and must be of type `string` with non-empty value. Only alphanumeric characters, '_', and '-' are allowed.", 'id'));
                    return false;
                }
                if (typeof descriptor.title !== 'string') {
                    collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'title'));
                    return false;
                }
                if (typeof descriptor.icon !== 'string') {
                    collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'icon'));
                    return false;
                }
                if ((0, strings_1.isFalsyOrWhitespace)(descriptor.title)) {
                    collector.warn((0, nls_1.localize)('requirenonemptystring', "property `{0}` is mandatory and must be of type `string` with non-empty value", 'title'));
                    return true;
                }
            }
            return true;
        }
        registerCustomViewContainers(containers, extension, order, existingViewContainers, location) {
            containers.forEach(descriptor => {
                const themeIcon = themables_1.ThemeIcon.fromString(descriptor.icon);
                const icon = themeIcon || resources.joinPath(extension.extensionLocation, descriptor.icon);
                const id = `workbench.view.extension.${descriptor.id}`;
                const title = descriptor.title || id;
                const viewContainer = this.registerCustomViewContainer(id, title, icon, order++, extension.identifier, location);
                // Move those views that belongs to this container
                if (existingViewContainers.length) {
                    const viewsToMove = [];
                    for (const existingViewContainer of existingViewContainers) {
                        if (viewContainer !== existingViewContainer) {
                            viewsToMove.push(...this.viewsRegistry.getViews(existingViewContainer).filter(view => view.originalContainerId === descriptor.id));
                        }
                    }
                    if (viewsToMove.length) {
                        this.viewsRegistry.moveViews(viewsToMove, viewContainer);
                    }
                }
            });
            return order;
        }
        registerCustomViewContainer(id, title, icon, order, extensionId, location) {
            let viewContainer = this.viewContainersRegistry.get(id);
            if (!viewContainer) {
                viewContainer = this.viewContainersRegistry.registerViewContainer({
                    id,
                    title: { value: title, original: title },
                    extensionId,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [id, { mergeViewWithContainerWhenSingleView: true }]),
                    hideIfEmpty: true,
                    order,
                    icon,
                }, location);
            }
            return viewContainer;
        }
        deregisterCustomViewContainer(viewContainer) {
            this.viewContainersRegistry.deregisterViewContainer(viewContainer);
            platform_1.Registry.as(panecomposite_1.Extensions.Viewlets).deregisterPaneComposite(viewContainer.id);
        }
        handleAndRegisterCustomViews() {
            viewsExtensionPoint.setHandler((extensions, { added, removed }) => {
                if (removed.length) {
                    this.removeViews(removed);
                }
                if (added.length) {
                    this.addViews(added);
                }
            });
        }
        addViews(extensions) {
            const viewIds = new Set();
            const allViewDescriptors = [];
            for (const extension of extensions) {
                const { value, collector } = extension;
                Object.entries(value).forEach(([key, value]) => {
                    if (!this.isValidViewDescriptors(value, collector)) {
                        return;
                    }
                    if (key === 'remote' && !(0, extensions_2.isProposedApiEnabled)(extension.description, 'contribViewsRemote')) {
                        collector.warn((0, nls_1.localize)('ViewContainerRequiresProposedAPI', "View container '{0}' requires 'enabledApiProposals: [\"contribViewsRemote\"]' to be added to 'Remote'.", key));
                        return;
                    }
                    const viewContainer = this.getViewContainer(key);
                    if (!viewContainer) {
                        collector.warn((0, nls_1.localize)('ViewContainerDoesnotExist', "View container '{0}' does not exist and all views registered to it will be added to 'Explorer'.", key));
                    }
                    const container = viewContainer || this.getDefaultViewContainer();
                    const viewDescriptors = [];
                    for (let index = 0; index < value.length; index++) {
                        const item = value[index];
                        // validate
                        if (viewIds.has(item.id)) {
                            collector.error((0, nls_1.localize)('duplicateView1', "Cannot register multiple views with same id `{0}`", item.id));
                            continue;
                        }
                        if (this.viewsRegistry.getView(item.id) !== null) {
                            collector.error((0, nls_1.localize)('duplicateView2', "A view with id `{0}` is already registered.", item.id));
                            continue;
                        }
                        const order = extensions_1.ExtensionIdentifier.equals(extension.description.identifier, container.extensionId)
                            ? index + 1
                            : container.viewOrderDelegate
                                ? container.viewOrderDelegate.getOrder(item.group)
                                : undefined;
                        let icon;
                        if (typeof item.icon === 'string') {
                            icon = themables_1.ThemeIcon.fromString(item.icon) || resources.joinPath(extension.description.extensionLocation, item.icon);
                        }
                        const initialVisibility = this.convertInitialVisibility(item.visibility);
                        const type = this.getViewType(item.type);
                        if (!type) {
                            collector.error((0, nls_1.localize)('unknownViewType', "Unknown view type `{0}`.", item.type));
                            continue;
                        }
                        let weight = undefined;
                        if (typeof item.initialSize === 'number') {
                            if (container.extensionId?.value === extension.description.identifier.value) {
                                weight = item.initialSize;
                            }
                            else {
                                this.logService.warn(`${extension.description.identifier.value} tried to set the view size of ${item.id} but it was ignored because the view container does not belong to it.`);
                            }
                        }
                        const viewDescriptor = {
                            type: type,
                            ctorDescriptor: type === ViewType.Tree ? new descriptors_1.SyncDescriptor(treeView_1.TreeViewPane) : new descriptors_1.SyncDescriptor(webviewViewPane_1.WebviewViewPane),
                            id: item.id,
                            name: { value: item.name, original: item.name },
                            when: contextkey_1.ContextKeyExpr.deserialize(item.when),
                            containerIcon: icon || viewContainer?.icon,
                            containerTitle: item.contextualTitle || (viewContainer && (typeof viewContainer.title === 'string' ? viewContainer.title : viewContainer.title.value)),
                            canToggleVisibility: true,
                            canMoveView: viewContainer?.id !== remoteExplorer_1.VIEWLET_ID,
                            treeView: type === ViewType.Tree ? this.instantiationService.createInstance(treeView_1.CustomTreeView, item.id, item.name, extension.description.identifier.value) : undefined,
                            collapsed: this.showCollapsed(container) || initialVisibility === InitialVisibility.Collapsed,
                            order: order,
                            extensionId: extension.description.identifier,
                            originalContainerId: key,
                            group: item.group,
                            remoteAuthority: item.remoteName || item.remoteAuthority, // TODO@roblou - delete after remote extensions are updated
                            virtualWorkspace: item.virtualWorkspace,
                            hideByDefault: initialVisibility === InitialVisibility.Hidden,
                            workspace: viewContainer?.id === remoteExplorer_1.VIEWLET_ID ? true : undefined,
                            weight
                        };
                        viewIds.add(viewDescriptor.id);
                        viewDescriptors.push(viewDescriptor);
                    }
                    allViewDescriptors.push({ viewContainer: container, views: viewDescriptors });
                });
            }
            this.viewsRegistry.registerViews2(allViewDescriptors);
        }
        getViewType(type) {
            if (type === ViewType.Webview) {
                return ViewType.Webview;
            }
            if (!type || type === ViewType.Tree) {
                return ViewType.Tree;
            }
            return undefined;
        }
        getDefaultViewContainer() {
            return this.viewContainersRegistry.get(files_1.VIEWLET_ID);
        }
        removeViews(extensions) {
            const removedExtensions = extensions.reduce((result, e) => { result.add(e.description.identifier); return result; }, new extensions_1.ExtensionIdentifierSet());
            for (const viewContainer of this.viewContainersRegistry.all) {
                const removedViews = this.viewsRegistry.getViews(viewContainer).filter(v => v.extensionId && removedExtensions.has(v.extensionId));
                if (removedViews.length) {
                    this.viewsRegistry.deregisterViews(removedViews, viewContainer);
                    for (const view of removedViews) {
                        const anyView = view;
                        if (anyView.treeView) {
                            anyView.treeView.dispose();
                        }
                    }
                }
            }
        }
        convertInitialVisibility(value) {
            if (Object.values(InitialVisibility).includes(value)) {
                return value;
            }
            return undefined;
        }
        isValidViewDescriptors(viewDescriptors, collector) {
            if (!Array.isArray(viewDescriptors)) {
                collector.error((0, nls_1.localize)('requirearray', "views must be an array"));
                return false;
            }
            for (const descriptor of viewDescriptors) {
                if (typeof descriptor.id !== 'string') {
                    collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'id'));
                    return false;
                }
                if (typeof descriptor.name !== 'string') {
                    collector.error((0, nls_1.localize)('requirestring', "property `{0}` is mandatory and must be of type `string`", 'name'));
                    return false;
                }
                if (descriptor.when && typeof descriptor.when !== 'string') {
                    collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'when'));
                    return false;
                }
                if (descriptor.icon && typeof descriptor.icon !== 'string') {
                    collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'icon'));
                    return false;
                }
                if (descriptor.contextualTitle && typeof descriptor.contextualTitle !== 'string') {
                    collector.error((0, nls_1.localize)('optstring', "property `{0}` can be omitted or must be of type `string`", 'contextualTitle'));
                    return false;
                }
                if (descriptor.visibility && !this.convertInitialVisibility(descriptor.visibility)) {
                    collector.error((0, nls_1.localize)('optenum', "property `{0}` can be omitted or must be one of {1}", 'visibility', Object.values(InitialVisibility).join(', ')));
                    return false;
                }
            }
            return true;
        }
        getViewContainer(value) {
            switch (value) {
                case 'explorer': return this.viewContainersRegistry.get(files_1.VIEWLET_ID);
                case 'debug': return this.viewContainersRegistry.get(debug_1.VIEWLET_ID);
                case 'scm': return this.viewContainersRegistry.get(scm_1.VIEWLET_ID);
                case 'remote': return this.viewContainersRegistry.get(remoteExplorer_1.VIEWLET_ID);
                default: return this.viewContainersRegistry.get(`workbench.view.extension.${value}`);
            }
        }
        showCollapsed(container) {
            switch (container.id) {
                case files_1.VIEWLET_ID:
                case scm_1.VIEWLET_ID:
                case debug_1.VIEWLET_ID:
                    return true;
            }
            return false;
        }
    };
    ViewsExtensionHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, log_1.ILogService)
    ], ViewsExtensionHandler);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ViewsExtensionHandler, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3NFeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL3ZpZXdzRXh0ZW5zaW9uUG9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMENoRyxNQUFNLG9CQUFvQixHQUFnQjtRQUN6QyxJQUFJLEVBQUUsUUFBUTtRQUNkLFVBQVUsRUFBRTtZQUNYLEVBQUUsRUFBRTtnQkFDSCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsa0RBQWtELEVBQUUsT0FBTyxFQUFFLENBQUMsaUhBQWlILENBQUMsRUFBRSxFQUFFLDZHQUE2RyxDQUFDO2dCQUMvVCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsa0JBQWtCO2FBQzNCO1lBQ0QsS0FBSyxFQUFFO2dCQUNOLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxxREFBcUQsRUFBRSxvREFBb0QsQ0FBQztnQkFDbEksSUFBSSxFQUFFLFFBQVE7YUFDZDtZQUNELElBQUksRUFBRTtnQkFDTCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0RBQW9ELEVBQUUsbU5BQW1OLENBQUM7Z0JBQ2hTLElBQUksRUFBRSxRQUFRO2FBQ2Q7U0FDRDtRQUNELFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO0tBQ2pDLENBQUM7SUFFVyxRQUFBLDJCQUEyQixHQUFnQjtRQUN2RCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsOENBQThDLEVBQUUsNENBQTRDLENBQUM7UUFDbkgsSUFBSSxFQUFFLFFBQVE7UUFDZCxVQUFVLEVBQUU7WUFDWCxhQUFhLEVBQUU7Z0JBQ2QsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLDZCQUE2QixFQUFFLDZDQUE2QyxDQUFDO2dCQUNuRyxJ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
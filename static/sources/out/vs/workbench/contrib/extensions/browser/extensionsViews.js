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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/paging", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/workbench/services/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/workbench/browser/parts/views/viewPane", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/base/browser/ui/aria/aria", "vs/base/common/cancellation", "vs/base/common/actions", "vs/platform/extensions/common/extensions", "vs/base/common/async", "vs/platform/product/common/productService", "vs/platform/severityIcon/browser/severityIcon", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/workbench/services/preferences/common/preferences", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/layout/browser/layoutService", "vs/platform/log/common/log", "vs/base/parts/request/common/request", "vs/platform/theme/browser/defaultStyles"], function (require, exports, nls_1, lifecycle_1, event_1, errors_1, errorMessage_1, paging_1, extensionManagement_1, extensionRecommendations_1, extensionManagementUtil_1, keybinding_1, contextView_1, dom_1, instantiation_1, extensionsList_1, extensions_1, extensionQuery_1, extensions_2, themeService_1, telemetry_1, countBadge_1, extensionsActions_1, listService_1, configuration_1, notification_1, viewPane_1, workspace_1, arrays_1, aria_1, cancellation_1, actions_1, extensions_3, async_1, productService_1, severityIcon_1, contextkey_1, theme_1, views_1, opener_1, preferences_1, storage_1, extensionManifestPropertiesService_1, virtualWorkspace_1, workspaceTrust_1, layoutService_1, log_1, request_1, defaultStyles_1) {
    "use strict";
    var ExtensionsListView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAriaLabelForExtension = exports.WorkspaceRecommendedExtensionsView = exports.RecommendedExtensionsView = exports.DefaultRecommendedExtensionsView = exports.SearchMarketplaceExtensionsView = exports.DeprecatedExtensionsView = exports.VirtualWorkspacePartiallySupportedExtensionsView = exports.VirtualWorkspaceUnsupportedExtensionsView = exports.UntrustedWorkspacePartiallySupportedExtensionsView = exports.UntrustedWorkspaceUnsupportedExtensionsView = exports.StaticQueryExtensionsView = exports.RecentlyUpdatedExtensionsView = exports.OutdatedExtensionsView = exports.DisabledExtensionsView = exports.EnabledExtensionsView = exports.ServerInstalledExtensionsView = exports.DefaultPopularExtensionsView = exports.ExtensionsListView = exports.NONE_CATEGORY = void 0;
    exports.NONE_CATEGORY = 'none';
    class ExtensionsViewState extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onFocus = this._register(new event_1.Emitter());
            this.onFocus = this._onFocus.event;
            this._onBlur = this._register(new event_1.Emitter());
            this.onBlur = this._onBlur.event;
            this.currentlyFocusedItems = [];
        }
        onFocusChange(extensions) {
            this.currentlyFocusedItems.forEach(extension => this._onBlur.fire(extension));
            this.currentlyFocusedItems = extensions;
            this.currentlyFocusedItems.forEach(extension => this._onFocus.fire(extension));
        }
    }
    var LocalSortBy;
    (function (LocalSortBy) {
        LocalSortBy["UpdateDate"] = "UpdateDate";
    })(LocalSortBy || (LocalSortBy = {}));
    function isLocalSortBy(value) {
        switch (value) {
            case "UpdateDate" /* LocalSortBy.UpdateDate */: return true;
        }
    }
    let ExtensionsListView = class ExtensionsListView extends viewPane_1.ViewPane {
        static { ExtensionsListView_1 = this; }
        static { this.RECENT_UPDATE_DURATION = 7 * 24 * 60 * 60 * 1000; } // 7 days
        constructor(options, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, configurationService, contextService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, workspaceService, productService, contextKeyService, viewDescriptorService, openerService, preferencesService, storageService, workspaceTrustManagementService, extensionEnablementService, layoutService, logService) {
            super({
                ...viewletViewOptions,
                showActions: viewPane_1.ViewPaneShowActions.Always,
                maximumBodySize: options.flexibleHeight ? (storageService.getNumber(`${viewletViewOptions.id}.size`, 0 /* StorageScope.PROFILE */, 0) ? undefined : 0) : undefined
            }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.options = options;
            this.notificationService = notificationService;
            this.extensionService = extensionService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.contextService = contextService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.extensionManagementService = extensionManagementService;
            this.workspaceService = workspaceService;
            this.productService = productService;
            this.preferencesService = preferencesService;
            this.storageService = storageService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.layoutService = layoutService;
            this.logService = logService;
            this.list = null;
            this.queryRequest = null;
            this.contextMenuActionRunner = this._register(new actions_1.ActionRunner());
            if (this.options.onDidChangeTitle) {
                this._register(this.options.onDidChangeTitle(title => this.updateTitle(title)));
            }
            this._register(this.contextMenuActionRunner.onDidRun(({ error }) => error && this.notificationService.error(error)));
            this.registerActions();
        }
        registerActions() { }
        renderHeader(container) {
            container.classList.add('extension-view-header');
            super.renderHeader(container);
            if (!this.options.hideBadge) {
                this.badge = new countBadge_1.CountBadge((0, dom_1.append)(container, (0, dom_1.$)('.count-badge-wrapper')), {}, defaultStyles_1.defaultCountBadgeStyles);
            }
        }
        renderBody(container) {
            super.renderBody(container);
            const extensionsList = (0, dom_1.append)(container, (0, dom_1.$)('.extensions-list'));
            const messageContainer = (0, dom_1.append)(container, (0, dom_1.$)('.message-container'));
            const messageSeverityIcon = (0, dom_1.append)(messageContainer, (0, dom_1.$)(''));
            const messageBox = (0, dom_1.append)(messageContainer, (0, dom_1.$)('.message'));
            const delegate = new extensionsList_1.Delegate();
            const extensionsViewState = new ExtensionsViewState();
            const renderer = this.instantiationService.createInstance(extensionsList_1.Renderer, extensionsViewState, { hoverOptions: { position: () => { return this.layoutService.getSideBarPosition() === 0 /* Position.LEFT */ ? 1 /* HoverPosition.RIGHT */ : 0 /* HoverPosition.LEFT */; } } });
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchPagedList, 'Extensions', extensionsList, delegate, [renderer], {
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                horizontalScrolling: false,
                accessibilityProvider: {
                    getAriaLabel(extension) {
                        return getAriaLabelForExtension(extension);
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)('extensions', "Extensions");
                    }
                },
                overrideStyles: {
                    listBackground: theme_1.SIDE_BAR_BACKGROUND
                },
                openOnSingleClick: true
            });
            this._register(this.list.onContextMenu(e => this.onContextMenu(e), this));
            this._register(this.list.onDidChangeFocus(e => extensionsViewState.onFocusChange((0, arrays_1.coalesce)(e.elements)), this));
            this._register(this.list);
            this._register(extensionsViewState);
            this._register(event_1.Event.debounce(event_1.Event.filter(this.list.onDidOpen, e => e.element !== null), (_, event) => event, 75, true)(options => {
                this.openExtension(options.element, { sideByside: options.sideBySide, ...options.editorOptions });
            }));
            this.bodyTemplate = {
                extensionsList,
                messageBox,
                messageContainer,
                messageSeverityIcon
            };
            if (this.queryResult) {
                this.setModel(this.queryResult.model);
            }
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            if (this.bodyTemplate) {
                this.bodyTemplate.extensionsList.style.height = height + 'px';
            }
            this.list?.layout(height, width);
        }
        async show(query, refresh) {
            if (this.queryRequest) {
                if (!refresh && this.queryRequest.query === query) {
                    return this.queryRequest.request;
                }
                this.queryRequest.request.cancel();
                this.queryRequest = null;
            }
            if (this.queryResult) {
                this.queryResult.disposables.dispose();
                this.queryResult = undefined;
            }
            const parsedQuery = extensionQuery_1.Query.parse(query);
            const options = {
                sortOrder: 0 /* SortOrder.Default */
            };
            switch (parsedQuery.sortBy) {
                case 'installs':
                    options.sortBy = 4 /* GallerySortBy.InstallCount */;
                    break;
                case 'rating':
                    options.sortBy = 12 /* GallerySortBy.WeightedRating */;
                    break;
                case 'name':
                    options.sortBy = 2 /* GallerySortBy.Title */;
                    break;
                case 'publishedDate':
                    options.sortBy = 10 /* GallerySortBy.PublishedDate */;
                    break;
                case 'updateDate':
                    options.sortBy = "UpdateDate" /* LocalSortBy.UpdateDate */;
                    break;
            }
            const request = (0, async_1.createCancelablePromise)(async (token) => {
                try {
                    this.queryResult = await this.query(parsedQuery, options, token);
                    const model = this.queryResult.model;
                    this.setModel(model);
                    if (this.queryResult.onDidChangeModel) {
                        this.queryResult.disposables.add(this.queryResult.onDidChangeModel(model => {
                            if (this.queryResult) {
                                this.queryResult.model = model;
                                this.updateModel(model);
                            }
                        }));
                    }
                    return model;
                }
                catch (e) {
                    const model = new paging_1.PagedModel([]);
                    if (!(0, errors_1.isCancellationError)(e)) {
                        this.logService.error(e);
                        this.setModel(model, e);
                    }
                    return this.list ? this.list.model : model;
                }
            });
            request.finally(() => this.queryRequest = null);
            this.queryRequest = { query, request };
            return request;
        }
        count() {
            return this.queryResult?.model.length ?? 0;
        }
        showEmptyModel() {
            const emptyModel = new paging_1.PagedModel([]);
            this.setModel(emptyModel);
            return Promise.resolve(emptyModel);
        }
        async onContextMenu(e) {
            if (e.element) {
                const disposables = new lifecycle_1.DisposableStore();
                const manageExtensionAction = disposables.add(this.instantiationService.createInstance(extensionsActions_1.ManageExtensionAction));
                const extension = e.element ? this.extensionsWorkbenchService.local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, e.element.identifier) && (!e.element.server || e.element.server === local.server)) || e.element
                    : e.element;
                manageExtensionAction.extension = extension;
                let groups = [];
                if (manageExtensionAction.enabled) {
                    groups = await manageExtensionAction.getActionGroups();
                }
                else if (extension) {
                    groups = await (0, extensionsActions_1.getContextMenuActions)(extension, this.contextKeyService, this.instantiationService);
                    groups.forEach(group => group.forEach(extensionAction => {
                        if (extensionAction instanceof extensionsActions_1.ExtensionAction) {
                            extensionAction.extension = extension;
                        }
                    }));
                }
                let actions = [];
                for (const menuActions of groups) {
                    actions = [...actions, ...menuActions, new actions_1.Separator()];
                }
                actions.pop();
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions,
                    actionRunner: this.contextMenuActionRunner,
                    onHide: () => disposables.dispose()
                });
            }
        }
        async query(query, options, token) {
            const idRegex = /@id:(([a-z0-9A-Z][a-z0-9\-A-Z]*)\.([a-z0-9A-Z][a-z0-9\-A-Z]*))/g;
            const ids = [];
            let idMatch;
            while ((idMatch = idRegex.exec(query.value)) !== null) {
                const name = idMatch[1];
                ids.push(name);
            }
            if (ids.length) {
                const model = await this.queryByIds(ids, options, token);
                return { model, disposables: new lifecycle_1.DisposableStore() };
            }
            if (ExtensionsListView_1.isLocalExtensionsQuery(query.value, query.sortBy)) {
                return this.queryLocal(query, options);
            }
            if (ExtensionsListView_1.isSearchPopularQuery(query.value)) {
                query.value = query.value.replace('@popular', '');
                options.sortBy = !options.sortBy ? 4 /* GallerySortBy.InstallCount */ : options.sortBy;
            }
            else if (ExtensionsListView_1.isSearchRecentlyPublishedQuery(query.value)) {
                query.value = query.value.replace('@recentlyPublished', '');
                options.sortBy = !options.sortBy ? 10 /* GallerySortBy.PublishedDate */ : options.sortBy;
            }
            const galleryQueryOptions = { ...options, sortBy: isLocalSortBy(options.sortBy) ? undefined : options.sortBy };
            const model = await this.queryGallery(query, galleryQueryOptions, token);
            return { model, disposables: new lifecycle_1.DisposableStore() };
        }
        async queryByIds(ids, options, token) {
            const idsSet = ids.reduce((result, id) => { result.add(id.toLowerCase()); return result; }, new Set());
            const result = (await this.extensionsWorkbenchService.queryLocal(this.options.server))
                .filter(e => idsSet.has(e.identifier.id.toLowerCase()));
            const galleryIds = result.length ? ids.filter(id => result.every(r => !(0, extensionManagementUtil_1.areSameExtensions)(r.identifier, { id }))) : ids;
            if (galleryIds.length) {
                const galleryResult = await this.extensionsWorkbenchService.getExtensions(galleryIds.map(id => ({ id })), { source: 'queryById' }, token);
                result.push(...galleryResult);
            }
            return this.getPagedModel(result);
        }
        async queryLocal(query, options) {
            const local = await this.extensionsWorkbenchService.queryLocal(this.options.server);
            let { extensions, canIncludeInstalledExtensions } = await this.filterLocal(local, this.extensionService.extensions, query, options);
            const disposables = new lifecycle_1.DisposableStore();
            const onDidChangeModel = disposables.add(new event_1.Emitter());
            if (canIncludeInstalledExtensions) {
                let isDisposed = false;
                disposables.add((0, lifecycle_1.toDisposable)(() => isDisposed = true));
                disposables.add(event_1.Event.debounce(event_1.Event.any(event_1.Event.filter(this.extensionsWorkbenchService.onChange, e => e?.state === 1 /* ExtensionState.Installed */), this.extensionService.onDidChangeExtensions), () => undefined)(async () => {
                    const local = this.options.server ? this.extensionsWorkbenchService.installed.filter(e => e.server === this.options.server) : this.extensionsWorkbenchService.local;
                    const { extensions: newExtensions } = await this.filterLocal(local, this.extensionService.extensions, query, options);
                    if (!isDisposed) {
                        const mergedExtensions = this.mergeAddedExtensions(extensions, newExtensions);
                        if (mergedExtensions) {
                            extensions = mergedExtensions;
                            onDidChangeModel.fire(new paging_1.PagedModel(extensions));
                        }
                    }
                }));
            }
            return {
                model: new paging_1.PagedModel(extensions),
                onDidChangeModel: onDidChangeModel.event,
                disposables
            };
        }
        async filterLocal(local, runningExtensions, query, options) {
            const value = query.value;
            let extensions = [];
            let canIncludeInstalledExtensions = true;
            if (/@builtin/i.test(value)) {
                extensions = this.filterBuiltinExtensions(local, query, options);
                canIncludeInstalledExtensions = false;
            }
            else if (/@installed/i.test(value)) {
                extensions = this.filterInstalledExtensions(local, runningExtensions, query, options);
            }
            else if (/@outdated/i.test(value)) {
                extensions = this.filterOutdatedExtensions(local, query, options);
            }
            else if (/@disabled/i.test(value)) {
                extensions = this.filterDisabledExtensions(local, runningExtensions, query, options);
            }
            else if (/@enabled/i.test(value)) {
                extensions = this.filterEnabledExtensions(local, runningExtensions, query, options);
            }
            else if (/@workspaceUnsupported/i.test(value)) {
                extensions = this.filterWorkspaceUnsupportedExtensions(local, query, options);
            }
            else if (/@deprecated/i.test(query.value)) {
                extensions = await this.filterDeprecatedExtensions(local, query, options);
            }
            else if (/@recentlyUpdated/i.test(query.value)) {
                extensions = this.filterRecentlyUpdatedExtensions(local, query, options);
            }
            return { extensions, canIncludeInstalledExtensions };
        }
        filterBuiltinExtensions(local, query, options) {
            let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
            value = value.replace(/@builtin/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .filter(e => e.isBuiltin && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
            return this.sortExtensions(result, options);
        }
        filterExtensionByCategory(e, includedCategories, excludedCategories) {
            if (!includedCategories.length && !excludedCategories.length) {
                return true;
            }
            if (e.categories.length) {
                if (excludedCategories.length && e.categories.some(category => excludedCategories.includes(category.toLowerCase()))) {
                    return false;
                }
                return e.categories.some(category => includedCategories.includes(category.toLowerCase()));
            }
            else {
                return includedCategories.includes(exports.NONE_CATEGORY);
            }
        }
        parseCategories(value) {
            const includedCategories = [];
            const excludedCategories = [];
            value = value.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category) => {
                const entry = (category || quotedCategory || '').toLowerCase();
                if (entry.startsWith('-')) {
                    if (excludedCategories.indexOf(entry) === -1) {
                        excludedCategories.push(entry);
                    }
                }
                else {
                    if (includedCategories.indexOf(entry) === -1) {
                        includedCategories.push(entry);
                    }
                }
                return '';
            });
            return { value, includedCategories, excludedCategories };
        }
        filterInstalledExtensions(local, runningExtensions, query, options) {
            let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
            value = value.replace(/@installed/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const matchingText = (e) => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1 || e.description.toLowerCase().indexOf(value) > -1)
                && this.filterExtensionByCategory(e, includedCategories, excludedCategories);
            let result;
            if (options.sortBy !== undefined) {
                result = local.filter(e => !e.isBuiltin && matchingText(e));
                result = this.sortExtensions(result, options);
            }
            else {
                result = local.filter(e => (!e.isBuiltin || e.outdated || e.reloadRequiredStatus !== undefined) && matchingText(e));
                const runningExtensionsById = runningExtensions.reduce((result, e) => { result.set(e.identifier.value, e); return result; }, new extensions_3.ExtensionIdentifierMap());
                const defaultSort = (e1, e2) => {
                    const running1 = runningExtensionsById.get(e1.identifier.id);
                    const isE1Running = !!running1 && this.extensionManagementServerService.getExtensionManagementServer((0, extensions_2.toExtension)(running1)) === e1.server;
                    const running2 = runningExtensionsById.get(e2.identifier.id);
                    const isE2Running = running2 && this.extensionManagementServerService.getExtensionManagementServer((0, extensions_2.toExtension)(running2)) === e2.server;
                    if ((isE1Running && isE2Running)) {
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    const isE1LanguagePackExtension = e1.local && (0, extensions_3.isLanguagePackExtension)(e1.local.manifest);
                    const isE2LanguagePackExtension = e2.local && (0, extensions_3.isLanguagePackExtension)(e2.local.manifest);
                    if (!isE1Running && !isE2Running) {
                        if (isE1LanguagePackExtension) {
                            return -1;
                        }
                        if (isE2LanguagePackExtension) {
                            return 1;
                        }
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    if ((isE1Running && isE2LanguagePackExtension) || (isE2Running && isE1LanguagePackExtension)) {
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    return isE1Running ? -1 : 1;
                };
                const outdated = [];
                const reloadRequired = [];
                const noActionRequired = [];
                result.forEach(e => {
                    if (e.outdated) {
                        outdated.push(e);
                    }
                    else if (e.reloadRequiredStatus) {
                        reloadRequired.push(e);
                    }
                    else {
                        noActionRequired.push(e);
                    }
                });
                result = [...outdated.sort(defaultSort), ...reloadRequired.sort(defaultSort), ...noActionRequired.sort(defaultSort)];
            }
            return result;
        }
        filterOutdatedExtensions(local, query, options) {
            let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
            value = value.replace(/@outdated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(extension => extension.outdated
                && (extension.name.toLowerCase().indexOf(value) > -1 || extension.displayName.toLowerCase().indexOf(value) > -1)
                && this.filterExtensionByCategory(extension, includedCategories, excludedCategories));
            return this.sortExtensions(result, options);
        }
        filterDisabledExtensions(local, runningExtensions, query, options) {
            let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
            value = value.replace(/@disabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(e => runningExtensions.every(r => !(0, extensionManagementUtil_1.areSameExtensions)({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
                && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
            return this.sortExtensions(result, options);
        }
        filterEnabledExtensions(local, runningExtensions, query, options) {
            let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
            value = value ? value.replace(/@enabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase() : '';
            local = local.filter(e => !e.isBuiltin);
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(e => runningExtensions.some(r => (0, extensionManagementUtil_1.areSameExtensions)({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
                && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
            return this.sortExtensions(result, options);
        }
        filterWorkspaceUnsupportedExtensions(local, query, options) {
            // shows local extensions which are restricted or disabled in the current workspace because of the extension's capability
            const queryString = query.value; // @sortby is already filtered out
            const match = queryString.match(/^\s*@workspaceUnsupported(?::(untrusted|virtual)(Partial)?)?(?:\s+([^\s]*))?/i);
            if (!match) {
                return [];
            }
            const type = match[1]?.toLowerCase();
            const partial = !!match[2];
            const nameFilter = match[3]?.toLowerCase();
            if (nameFilter) {
                local = local.filter(extension => extension.name.toLowerCase().indexOf(nameFilter) > -1 || extension.displayName.toLowerCase().indexOf(nameFilter) > -1);
            }
            const hasVirtualSupportType = (extension, supportType) => {
                return extension.local && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.local.manifest) === supportType;
            };
            const hasRestrictedSupportType = (extension, supportType) => {
                if (!extension.local) {
                    return false;
                }
                const enablementState = this.extensionEnablementService.getEnablementState(extension.local);
                if (enablementState !== 8 /* EnablementState.EnabledGlobally */ && enablementState !== 9 /* EnablementState.EnabledWorkspace */ &&
                    enablementState !== 0 /* EnablementState.DisabledByTrustRequirement */ && enablementState !== 5 /* EnablementState.DisabledByExtensionDependency */) {
                    return false;
                }
                if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.local.manifest) === supportType) {
                    return true;
                }
                if (supportType === false) {
                    const dependencies = (0, extensionManagementUtil_1.getExtensionDependencies)(local.map(ext => ext.local), extension.local);
                    return dependencies.some(ext => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === supportType);
                }
                return false;
            };
            const inVirtualWorkspace = (0, virtualWorkspace_1.isVirtualWorkspace)(this.workspaceService.getWorkspace());
            const inRestrictedWorkspace = !this.workspaceTrustManagementService.isWorkspaceTrusted();
            if (type === 'virtual') {
                // show limited and disabled extensions unless disabled because of a untrusted workspace
                local = local.filter(extension => inVirtualWorkspace && hasVirtualSupportType(extension, partial ? 'limited' : false) && !(inRestrictedWorkspace && hasRestrictedSupportType(extension, false)));
            }
            else if (type === 'untrusted') {
                // show limited and disabled extensions unless disabled because of a virtual workspace
                local = local.filter(extension => hasRestrictedSupportType(extension, partial ? 'limited' : false) && !(inVirtualWorkspace && hasVirtualSupportType(extension, false)));
            }
            else {
                // show extensions that are restricted or disabled in the current workspace
                local = local.filter(extension => inVirtualWorkspace && !hasVirtualSupportType(extension, true) || inRestrictedWorkspace && !hasRestrictedSupportType(extension, true));
            }
            return this.sortExtensions(local, options);
        }
        async filterDeprecatedExtensions(local, query, options) {
            const value = query.value.replace(/@deprecated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
            const deprecatedExtensionIds = Object.keys(extensionsControlManifest.deprecated);
            local = local.filter(e => deprecatedExtensionIds.includes(e.identifier.id) && (!value || e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1));
            return this.sortExtensions(local, options);
        }
        filterRecentlyUpdatedExtensions(local, query, options) {
            let { value, includedCategories, excludedCategories } = this.parseCategories(query.value);
            const currentTime = Date.now();
            local = local.filter(e => !e.isBuiltin && !e.outdated && e.local?.updated && e.local?.installedTimestamp !== undefined && currentTime - e.local.installedTimestamp < ExtensionsListView_1.RECENT_UPDATE_DURATION);
            value = value.replace(/@recentlyUpdated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local.filter(e => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && this.filterExtensionByCategory(e, includedCategories, excludedCategories));
            options.sortBy = options.sortBy ?? "UpdateDate" /* LocalSortBy.UpdateDate */;
            return this.sortExtensions(result, options);
        }
        mergeAddedExtensions(extensions, newExtensions) {
            const oldExtensions = [...extensions];
            const findPreviousExtensionIndex = (from) => {
                let index = -1;
                const previousExtensionInNew = newExtensions[from];
                if (previousExtensionInNew) {
                    index = oldExtensions.findIndex(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, previousExtensionInNew.identifier));
                    if (index === -1) {
                        return findPreviousExtensionIndex(from - 1);
                    }
                }
                return index;
            };
            let hasChanged = false;
            for (let index = 0; index < newExtensions.length; index++) {
                const extension = newExtensions[index];
                if (extensions.every(r => !(0, extensionManagementUtil_1.areSameExtensions)(r.identifier, extension.identifier))) {
                    hasChanged = true;
                    extensions.splice(findPreviousExtensionIndex(index - 1) + 1, 0, extension);
                }
            }
            return hasChanged ? extensions : undefined;
        }
        async queryGallery(query, options, token) {
            const hasUserDefinedSortOrder = options.sortBy !== undefined;
            if (!hasUserDefinedSortOrder && !query.value.trim()) {
                options.sortBy = 4 /* GallerySortBy.InstallCount */;
            }
            if (this.isRecommendationsQuery(query)) {
                return this.queryRecommendations(query, options, token);
            }
            const text = query.value;
            if (/\bext:([^\s]+)\b/g.test(text)) {
                options.text = text;
                options.source = 'file-extension-tags';
                return this.extensionsWorkbenchService.queryGallery(options, token).then(pager => this.getPagedModel(pager));
            }
            let preferredResults = [];
            if (text) {
                options.text = text.substring(0, 350);
                options.source = 'searchText';
                if (!hasUserDefinedSortOrder) {
                    const manifest = await this.extensionManagementService.getExtensionsControlManifest();
                    const search = manifest.search;
                    if (Array.isArray(search)) {
                        for (const s of search) {
                            if (s.query && s.query.toLowerCase() === text.toLowerCase() && Array.isArray(s.preferredResults)) {
                                preferredResults = s.preferredResults;
                                break;
                            }
                        }
                    }
                }
            }
            else {
                options.source = 'viewlet';
            }
            const pager = await this.extensionsWorkbenchService.queryGallery(options, token);
            let positionToUpdate = 0;
            for (const preferredResult of preferredResults) {
                for (let j = positionToUpdate; j < pager.firstPage.length; j++) {
                    if ((0, extensionManagementUtil_1.areSameExtensions)(pager.firstPage[j].identifier, { id: preferredResult })) {
                        if (positionToUpdate !== j) {
                            const preferredExtension = pager.firstPage.splice(j, 1)[0];
                            pager.firstPage.splice(positionToUpdate, 0, preferredExtension);
                            positionToUpdate++;
                        }
                        break;
                    }
                }
            }
            return this.getPagedModel(pager);
        }
        sortExtensions(extensions, options) {
            switch (options.sortBy) {
                case 4 /* GallerySortBy.InstallCount */:
                    extensions = extensions.sort((e1, e2) => typeof e2.installCount === 'number' && typeof e1.installCount === 'number' ? e2.installCount - e1.installCount : NaN);
                    break;
                case "UpdateDate" /* LocalSortBy.UpdateDate */:
                    extensions = extensions.sort((e1, e2) => typeof e2.local?.installedTimestamp === 'number' && typeof e1.local?.installedTimestamp === 'number' ? e2.local.installedTimestamp - e1.local.installedTimestamp :
                        typeof e2.local?.installedTimestamp === 'number' ? 1 :
                            typeof e1.local?.installedTimestamp === 'number' ? -1 : NaN);
                    break;
                case 6 /* GallerySortBy.AverageRating */:
                case 12 /* GallerySortBy.WeightedRating */:
                    extensions = extensions.sort((e1, e2) => typeof e2.rating === 'number' && typeof e1.rating === 'number' ? e2.rating - e1.rating : NaN);
                    break;
                default:
                    extensions = extensions.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
                    break;
            }
            if (options.sortOrder === 2 /* SortOrder.Descending */) {
                extensions = extensions.reverse();
            }
            return extensions;
        }
        isRecommendationsQuery(query) {
            return ExtensionsListView_1.isWorkspaceRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isKeymapsRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isLanguageRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isExeRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isRemoteRecommendedExtensionsQuery(query.value)
                || /@recommended:all/i.test(query.value)
                || ExtensionsListView_1.isSearchRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isRecommendedExtensionsQuery(query.value);
        }
        async queryRecommendations(query, options, token) {
            // Workspace recommendations
            if (ExtensionsListView_1.isWorkspaceRecommendedExtensionsQuery(query.value)) {
                return this.getWorkspaceRecommendationsModel(query, options, token);
            }
            // Keymap recommendations
            if (ExtensionsListView_1.isKeymapsRecommendedExtensionsQuery(query.value)) {
                return this.getKeymapRecommendationsModel(query, options, token);
            }
            // Language recommendations
            if (ExtensionsListView_1.isLanguageRecommendedExtensionsQuery(query.value)) {
                return this.getLanguageRecommendationsModel(query, options, token);
            }
            // Exe recommendations
            if (ExtensionsListView_1.isExeRecommendedExtensionsQuery(query.value)) {
                return this.getExeRecommendationsModel(query, options, token);
            }
            // Remote recommendations
            if (ExtensionsListView_1.isRemoteRecommendedExtensionsQuery(query.value)) {
                return this.getRemoteRecommendationsModel(query, options, token);
            }
            // All recommendations
            if (/@recommended:all/i.test(query.value)) {
                return this.getAllRecommendationsModel(options, token);
            }
            // Search recommendations
            if (ExtensionsListView_1.isSearchRecommendedExtensionsQuery(query.value) ||
                (ExtensionsListView_1.isRecommendedExtensionsQuery(query.value) && options.sortBy !== undefined)) {
                return this.searchRecommendations(query, options, token);
            }
            // Other recommendations
            if (ExtensionsListView_1.isRecommendedExtensionsQuery(query.value)) {
                return this.getOtherRecommendationsModel(query, options, token);
            }
            return new paging_1.PagedModel([]);
        }
        async getInstallableRecommendations(recommendations, options, token) {
            const result = [];
            if (recommendations.length) {
                const extensions = await this.extensionsWorkbenchService.getExtensions(recommendations.map(id => ({ id })), { source: options.source }, token);
                for (const extension of extensions) {
                    if (extension.gallery && !extension.deprecationInfo && (await this.extensionManagementService.canInstall(extension.gallery))) {
                        result.push(extension);
                    }
                }
            }
            return result;
        }
        async getWorkspaceRecommendations() {
            const recommendations = await this.extensionRecommendationsService.getWorkspaceRecommendations();
            const { important } = await this.extensionRecommendationsService.getConfigBasedRecommendations();
            for (const configBasedRecommendation of important) {
                if (!recommendations.find(extensionId => extensionId === configBasedRecommendation)) {
                    recommendations.push(configBasedRecommendation);
                }
            }
            return recommendations;
        }
        async getWorkspaceRecommendationsModel(query, options, token) {
            const recommendations = await this.getWorkspaceRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-workspace' }, token));
            const result = (0, arrays_1.coalesce)(recommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(result);
        }
        async getKeymapRecommendationsModel(query, options, token) {
            const value = query.value.replace(/@recommended:keymaps/g, '').trim().toLowerCase();
            const recommendations = this.extensionRecommendationsService.getKeymapRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-keymaps' }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getLanguageRecommendationsModel(query, options, token) {
            const value = query.value.replace(/@recommended:languages/g, '').trim().toLowerCase();
            const recommendations = this.extensionRecommendationsService.getLanguageRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-languages' }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getRemoteRecommendationsModel(query, options, token) {
            const value = query.value.replace(/@recommended:remotes/g, '').trim().toLowerCase();
            const recommendations = this.extensionRecommendationsService.getRemoteRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-remotes' }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getExeRecommendationsModel(query, options, token) {
            const exe = query.value.replace(/@exe:/g, '').trim().toLowerCase();
            const { important, others } = await this.extensionRecommendationsService.getExeBasedRecommendations(exe.startsWith('"') ? exe.substring(1, exe.length - 1) : exe);
            const installableRecommendations = await this.getInstallableRecommendations([...important, ...others], { ...options, source: 'recommendations-exe' }, token);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getOtherRecommendationsModel(query, options, token) {
            const otherRecommendations = await this.getOtherRecommendations();
            const installableRecommendations = await this.getInstallableRecommendations(otherRecommendations, { ...options, source: 'recommendations-other', sortBy: undefined }, token);
            const result = (0, arrays_1.coalesce)(otherRecommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(result);
        }
        async getOtherRecommendations() {
            const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server))
                .map(e => e.identifier.id.toLowerCase());
            const workspaceRecommendations = (await this.getWorkspaceRecommendations())
                .map(extensionId => extensionId.toLowerCase());
            return (0, arrays_1.distinct)((0, arrays_1.flatten)(await Promise.all([
                // Order is important
                this.extensionRecommendationsService.getImportantRecommendations(),
                this.extensionRecommendationsService.getFileBasedRecommendations(),
                this.extensionRecommendationsService.getOtherRecommendations()
            ])).filter(extensionId => !local.includes(extensionId.toLowerCase()) && !workspaceRecommendations.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
        }
        // Get All types of recommendations, trimmed to show a max of 8 at any given time
        async getAllRecommendationsModel(options, token) {
            const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server)).map(e => e.identifier.id.toLowerCase());
            const allRecommendations = (0, arrays_1.distinct)((0, arrays_1.flatten)(await Promise.all([
                // Order is important
                this.getWorkspaceRecommendations(),
                this.extensionRecommendationsService.getImportantRecommendations(),
                this.extensionRecommendationsService.getFileBasedRecommendations(),
                this.extensionRecommendationsService.getOtherRecommendations()
            ])).filter(extensionId => !local.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
            const installableRecommendations = await this.getInstallableRecommendations(allRecommendations, { ...options, source: 'recommendations-all', sortBy: undefined }, token);
            const result = (0, arrays_1.coalesce)(allRecommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(result.slice(0, 8));
        }
        async searchRecommendations(query, options, token) {
            const value = query.value.replace(/@recommended/g, '').trim().toLowerCase();
            const recommendations = (0, arrays_1.distinct)([...await this.getWorkspaceRecommendations(), ...await this.getOtherRecommendations()]);
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations', sortBy: undefined }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            const result = (0, arrays_1.coalesce)(recommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(this.sortExtensions(result, options));
        }
        setModel(model, error, donotResetScrollTop) {
            if (this.list) {
                this.list.model = new paging_1.DelayedPagedModel(model);
                if (!donotResetScrollTop) {
                    this.list.scrollTop = 0;
                }
                this.updateBody(error);
            }
            if (this.badge) {
                this.badge.setCount(this.count());
            }
        }
        updateModel(model) {
            if (this.list) {
                this.list.model = new paging_1.DelayedPagedModel(model);
                this.updateBody();
            }
            if (this.badge) {
                this.badge.setCount(this.count());
            }
        }
        updateBody(error) {
            if (this.bodyTemplate) {
                const count = this.count();
                this.bodyTemplate.extensionsList.classList.toggle('hidden', count === 0);
                this.bodyTemplate.messageContainer.classList.toggle('hidden', count > 0);
                if (count === 0 && this.isBodyVisible()) {
                    if (error) {
                        if ((0, request_1.isOfflineError)(error)) {
                            this.bodyTemplate.messageSeverityIcon.className = severityIcon_1.SeverityIcon.className(notification_1.Severity.Warning);
                            this.bodyTemplate.messageBox.textContent = (0, nls_1.localize)('offline error', "Unable to search the Marketplace when offline, please check your network connection.");
                        }
                        else {
                            this.bodyTemplate.messageSeverityIcon.className = severityIcon_1.SeverityIcon.className(notification_1.Severity.Error);
                            this.bodyTemplate.messageBox.textContent = (0, nls_1.localize)('error', "Error while fetching extensions. {0}", (0, errors_1.getErrorMessage)(error));
                        }
                    }
                    else {
                        this.bodyTemplate.messageSeverityIcon.className = '';
                        this.bodyTemplate.messageBox.textContent = (0, nls_1.localize)('no extensions found', "No extensions found.");
                    }
                    (0, aria_1.alert)(this.bodyTemplate.messageBox.textContent);
                }
            }
            this.updateSize();
        }
        updateSize() {
            if (this.options.flexibleHeight) {
                this.maximumBodySize = this.list?.model.length ? Number.POSITIVE_INFINITY : 0;
                this.storageService.store(`${this.id}.size`, this.list?.model.length || 0, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        openExtension(extension, options) {
            extension = this.extensionsWorkbenchService.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0] || extension;
            this.extensionsWorkbenchService.open(extension, options).then(undefined, err => this.onError(err));
        }
        onError(err) {
            if ((0, errors_1.isCancellationError)(err)) {
                return;
            }
            const message = err && err.message || '';
            if (/ECONNREFUSED/.test(message)) {
                const error = (0, errorMessage_1.createErrorWithActions)((0, nls_1.localize)('suggestProxyError', "Marketplace returned 'ECONNREFUSED'. Please check the 'http.proxy' setting."), [
                    new actions_1.Action('open user settings', (0, nls_1.localize)('open user settings', "Open User Settings"), undefined, true, () => this.preferencesService.openUserSettings())
                ]);
                this.notificationService.error(error);
                return;
            }
            this.notificationService.error(err);
        }
        getPagedModel(arg) {
            if (Array.isArray(arg)) {
                return new paging_1.PagedModel(arg);
            }
            const pager = {
                total: arg.total,
                pageSize: arg.pageSize,
                firstPage: arg.firstPage,
                getPage: (pageIndex, cancellationToken) => arg.getPage(pageIndex, cancellationToken)
            };
            return new paging_1.PagedModel(pager);
        }
        dispose() {
            super.dispose();
            if (this.queryRequest) {
                this.queryRequest.request.cancel();
                this.queryRequest = null;
            }
            if (this.queryResult) {
                this.queryResult.disposables.dispose();
                this.queryResult = undefined;
            }
            this.list = null;
        }
        static isLocalExtensionsQuery(query, sortBy) {
            return this.isInstalledExtensionsQuery(query)
                || this.isSearchInstalledExtensionsQuery(query)
                || this.isOutdatedExtensionsQuery(query)
                || this.isEnabledExtensionsQuery(query)
                || this.isDisabledExtensionsQuery(query)
                || this.isBuiltInExtensionsQuery(query)
                || this.isSearchBuiltInExtensionsQuery(query)
                || this.isBuiltInGroupExtensionsQuery(query)
                || this.isSearchDeprecatedExtensionsQuery(query)
                || this.isSearchWorkspaceUnsupportedExtensionsQuery(query)
                || this.isSearchRecentlyUpdatedQuery(query)
                || this.isSearchExtensionUpdatesQuery(query)
                || this.isSortInstalledExtensionsQuery(query, sortBy);
        }
        static isSearchBuiltInExtensionsQuery(query) {
            return /@builtin\s.+/i.test(query);
        }
        static isBuiltInExtensionsQuery(query) {
            return /^\s*@builtin$/i.test(query.trim());
        }
        static isBuiltInGroupExtensionsQuery(query) {
            return /^\s*@builtin:.+$/i.test(query.trim());
        }
        static isSearchWorkspaceUnsupportedExtensionsQuery(query) {
            return /^\s*@workspaceUnsupported(:(untrusted|virtual)(Partial)?)?(\s|$)/i.test(query);
        }
        static isInstalledExtensionsQuery(query) {
            return /@installed$/i.test(query);
        }
        static isSearchInstalledExtensionsQuery(query) {
            return /@installed\s./i.test(query);
        }
        static isOutdatedExtensionsQuery(query) {
            return /@outdated/i.test(query);
        }
        static isEnabledExtensionsQuery(query) {
            return /@enabled/i.test(query);
        }
        static isDisabledExtensionsQuery(query) {
            return /@disabled/i.test(query);
        }
        static isSearchDeprecatedExtensionsQuery(query) {
            return /@deprecated\s?.*/i.test(query);
        }
        static isRecommendedExtensionsQuery(query) {
            return /^@recommended$/i.test(query.trim());
        }
        static isSearchRecommendedExtensionsQuery(query) {
            return /@recommended\s.+/i.test(query);
        }
        static isWorkspaceRecommendedExtensionsQuery(query) {
            return /@recommended:workspace/i.test(query);
        }
        static isExeRecommendedExtensionsQuery(query) {
            return /@exe:.+/i.test(query);
        }
        static isRemoteRecommendedExtensionsQuery(query) {
            return /@recommended:remotes/i.test(query);
        }
        static isKeymapsRecommendedExtensionsQuery(query) {
            return /@recommended:keymaps/i.test(query);
        }
        static isLanguageRecommendedExtensionsQuery(query) {
            return /@recommended:languages/i.test(query);
        }
        static isSortInstalledExtensionsQuery(query, sortBy) {
            return (sortBy !== undefined && sortBy !== '' && query === '') || (!sortBy && /^@sort:\S*$/i.test(query));
        }
        static isSearchPopularQuery(query) {
            return /@popular/i.test(query);
        }
        static isSearchRecentlyPublishedQuery(query) {
            return /@recentlyPublished/i.test(query);
        }
        static isSearchRecentlyUpdatedQuery(query) {
            return /@recentlyUpdated/i.test(query);
        }
        static isSearchExtensionUpdatesQuery(query) {
            return /@updates/i.test(query);
        }
        static isSortUpdateDateQuery(query) {
            return /@sort:updateDate/i.test(query);
        }
        focus() {
            super.focus();
            if (!this.list) {
                return;
            }
            if (!(this.list.getFocus().length || this.list.getSelection().length)) {
                this.list.focusNext();
            }
            this.list.domFocus();
        }
    };
    exports.ExtensionsListView = ExtensionsListView;
    exports.ExtensionsListView = ExtensionsListView = ExtensionsListView_1 = __decorate([
        __param(2, notification_1.INotificationService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, extensions_2.IExtensionService),
        __param(8, extensions_1.IExtensionsWorkbenchService),
        __param(9, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, workspace_1.IWorkspaceContextService),
        __param(13, extensionManagement_1.IExtensionManagementServerService),
        __param(14, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(15, extensionManagement_1.IWorkbenchExtensionManagementService),
        __param(16, workspace_1.IWorkspaceContextService),
        __param(17, productService_1.IProductService),
        __param(18, contextkey_1.IContextKeyService),
        __param(19, views_1.IViewDescriptorService),
        __param(20, opener_1.IOpenerService),
        __param(21, preferences_1.IPreferencesService),
        __param(22, storage_1.IStorageService),
        __param(23, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(24, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(25, layoutService_1.IWorkbenchLayoutService),
        __param(26, log_1.ILogService)
    ], ExtensionsListView);
    class DefaultPopularExtensionsView extends ExtensionsListView {
        async show() {
            const query = this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer ? '@web' : '';
            return super.show(query);
        }
    }
    exports.DefaultPopularExtensionsView = DefaultPopularExtensionsView;
    class ServerInstalledExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query ? query : '@installed';
            if (!ExtensionsListView.isLocalExtensionsQuery(query) || ExtensionsListView.isSortInstalledExtensionsQuery(query)) {
                query = query += ' @installed';
            }
            return super.show(query.trim());
        }
    }
    exports.ServerInstalledExtensionsView = ServerInstalledExtensionsView;
    class EnabledExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query || '@enabled';
            return ExtensionsListView.isEnabledExtensionsQuery(query) ? super.show(query) :
                ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show('@enabled ' + query) : this.showEmptyModel();
        }
    }
    exports.EnabledExtensionsView = EnabledExtensionsView;
    class DisabledExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query || '@disabled';
            return ExtensionsListView.isDisabledExtensionsQuery(query) ? super.show(query) :
                ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show('@disabled ' + query) : this.showEmptyModel();
        }
    }
    exports.DisabledExtensionsView = DisabledExtensionsView;
    class OutdatedExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query ? query : '@outdated';
            if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
                query = query.replace('@updates', '@outdated');
            }
            return super.show(query.trim());
        }
        updateSize() {
            super.updateSize();
            this.setExpanded(this.count() > 0);
        }
    }
    exports.OutdatedExtensionsView = OutdatedExtensionsView;
    class RecentlyUpdatedExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query ? query : '@recentlyUpdated';
            if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
                query = query.replace('@updates', '@recentlyUpdated');
            }
            return super.show(query.trim());
        }
    }
    exports.RecentlyUpdatedExtensionsView = RecentlyUpdatedExtensionsView;
    let StaticQueryExtensionsView = class StaticQueryExtensionsView extends ExtensionsListView {
        constructor(options, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, configurationService, contextService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, workspaceService, productService, contextKeyService, viewDescriptorService, openerService, preferencesService, storageService, workspaceTrustManagementService, extensionEnablementService, layoutService, logService) {
            super(options, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, configurationService, contextService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, workspaceService, productService, contextKeyService, viewDescriptorService, openerService, preferencesService, storageService, workspaceTrustManagementService, extensionEnablementService, layoutService, logService);
            this.options = options;
        }
        show() {
            return super.show(this.options.query);
        }
    };
    exports.StaticQueryExtensionsView = StaticQueryExtensionsView;
    exports.StaticQueryExtensionsView = StaticQueryExtensionsView = __decorate([
        __param(2, notification_1.INotificationService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, extensions_2.IExtensionService),
        __param(8, extensions_1.IExtensionsWorkbenchService),
        __param(9, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, workspace_1.IWorkspaceContextService),
        __param(13, extensionManagement_1.IExtensionManagementServerService),
        __param(14, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(15, extensionManagement_1.IWorkbenchExtensionManagementService),
        __param(16, workspace_1.IWorkspaceContextService),
        __param(17, productService_1.IProductService),
        __param(18, contextkey_1.IContextKeyService),
        __param(19, views_1.IViewDescriptorService),
        __param(20, opener_1.IOpenerService),
        __param(21, preferences_1.IPreferencesService),
        __param(22, storage_1.IStorageService),
        __param(23, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(24, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(25, layoutService_1.IWorkbenchLayoutService),
        __param(26, log_1.ILogService)
    ], StaticQueryExtensionsView);
    function toSpecificWorkspaceUnsupportedQuery(query, qualifier) {
        if (!query) {
            return '@workspaceUnsupported:' + qualifier;
        }
        const match = query.match(new RegExp(`@workspaceUnsupported(:${qualifier})?(\\s|$)`, 'i'));
        if (match) {
            if (!match[1]) {
                return query.replace(/@workspaceUnsupported/gi, '@workspaceUnsupported:' + qualifier);
            }
            return query;
        }
        return undefined;
    }
    class UntrustedWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'untrusted');
            return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
        }
    }
    exports.UntrustedWorkspaceUnsupportedExtensionsView = UntrustedWorkspaceUnsupportedExtensionsView;
    class UntrustedWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'untrustedPartial');
            return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
        }
    }
    exports.UntrustedWorkspacePartiallySupportedExtensionsView = UntrustedWorkspacePartiallySupportedExtensionsView;
    class VirtualWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'virtual');
            return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
        }
    }
    exports.VirtualWorkspaceUnsupportedExtensionsView = VirtualWorkspaceUnsupportedExtensionsView;
    class VirtualWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'virtualPartial');
            return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
        }
    }
    exports.VirtualWorkspacePartiallySupportedExtensionsView = VirtualWorkspacePartiallySupportedExtensionsView;
    class DeprecatedExtensionsView extends ExtensionsListView {
        async show(query) {
            return ExtensionsListView.isSearchDeprecatedExtensionsQuery(query) ? super.show(query) : this.showEmptyModel();
        }
    }
    exports.DeprecatedExtensionsView = DeprecatedExtensionsView;
    class SearchMarketplaceExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.reportSearchFinishedDelayer = this._register(new async_1.ThrottledDelayer(2000));
            this.searchWaitPromise = Promise.resolve();
        }
        async show(query) {
            const queryPromise = super.show(query);
            this.reportSearchFinishedDelayer.trigger(() => this.reportSearchFinished());
            this.searchWaitPromise = queryPromise.then(null, null);
            return queryPromise;
        }
        async reportSearchFinished() {
            await this.searchWaitPromise;
            this.telemetryService.publicLog2('extensionsView:MarketplaceSearchFinished');
        }
    }
    exports.SearchMarketplaceExtensionsView = SearchMarketplaceExtensionsView;
    class DefaultRecommendedExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.recommendedExtensionsQuery = '@recommended:all';
        }
        renderBody(container) {
            super.renderBody(container);
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
                this.show('');
            }));
        }
        async show(query) {
            if (query && query.trim() !== this.recommendedExtensionsQuery) {
                return this.showEmptyModel();
            }
            const model = await super.show(this.recommendedExtensionsQuery);
            if (!this.extensionsWorkbenchService.local.some(e => !e.isBuiltin)) {
                // This is part of popular extensions view. Collapse if no installed extensions.
                this.setExpanded(model.length > 0);
            }
            return model;
        }
    }
    exports.DefaultRecommendedExtensionsView = DefaultRecommendedExtensionsView;
    class RecommendedExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.recommendedExtensionsQuery = '@recommended';
        }
        renderBody(container) {
            super.renderBody(container);
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
                this.show('');
            }));
        }
        async show(query) {
            return (query && query.trim() !== this.recommendedExtensionsQuery) ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery);
        }
    }
    exports.RecommendedExtensionsView = RecommendedExtensionsView;
    class WorkspaceRecommendedExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.recommendedExtensionsQuery = '@recommended:workspace';
        }
        renderBody(container) {
            super.renderBody(container);
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.show(this.recommendedExtensionsQuery)));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.show(this.recommendedExtensionsQuery)));
        }
        async show(query) {
            const shouldShowEmptyView = query && query.trim() !== '@recommended' && query.trim() !== '@recommended:workspace';
            const model = await (shouldShowEmptyView ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery));
            this.setExpanded(model.length > 0);
            return model;
        }
        async getInstallableWorkspaceRecommendations() {
            const installed = (await this.extensionsWorkbenchService.queryLocal())
                .filter(l => l.enablementState !== 1 /* EnablementState.DisabledByExtensionKind */); // Filter extensions disabled by kind
            const recommendations = (await this.getWorkspaceRecommendations())
                .filter(extensionId => installed.every(local => !(0, extensionManagementUtil_1.areSameExtensions)({ id: extensionId }, local.identifier)));
            return this.getInstallableRecommendations(recommendations, { source: 'install-all-workspace-recommendations' }, cancellation_1.CancellationToken.None);
        }
        async installWorkspaceRecommendations() {
            const installableRecommendations = await this.getInstallableWorkspaceRecommendations();
            if (installableRecommendations.length) {
                await this.extensionManagementService.installGalleryExtensions(installableRecommendations.map(i => ({ extension: i.gallery, options: {} })));
            }
            else {
                this.notificationService.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)('no local extensions', "There are no extensions to install.")
                });
            }
        }
    }
    exports.WorkspaceRecommendedExtensionsView = WorkspaceRecommendedExtensionsView;
    function getAriaLabelForExtension(extension) {
        if (!extension) {
            return '';
        }
        const publisher = extension.publisherDomain?.verified ? (0, nls_1.localize)('extension.arialabel.verifiedPublisher', "Verified Publisher {0}", extension.publisherDisplayName) : (0, nls_1.localize)('extension.arialabel.publisher', "Publisher {0}", extension.publisherDisplayName);
        const deprecated = extension?.deprecationInfo ? (0, nls_1.localize)('extension.arialabel.deprecated', "Deprecated") : '';
        const rating = extension?.rating ? (0, nls_1.localize)('extension.arialabel.rating', "Rated {0} out of 5 stars by {1} users", extension.rating.toFixed(2), extension.ratingCount) : '';
        return `${extension.displayName}, ${deprecated ? `${deprecated}, ` : ''}${extension.version}, ${publisher}, ${extension.description} ${rating ? `, ${rating}` : ''}`;
    }
    exports.getAriaLabelForExtension = getAriaLabelForExtension;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1ZpZXdzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uc1ZpZXdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF1RG5GLFFBQUEsYUFBYSxHQUFHLE1BQU0sQ0FBQztJQUVwQyxNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBQTVDOztZQUVrQixhQUFRLEdBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWMsQ0FBQyxDQUFDO1lBQ2xGLFlBQU8sR0FBc0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFFekMsWUFBTyxHQUF3QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFjLENBQUMsQ0FBQztZQUNqRixXQUFNLEdBQXNCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBRWhELDBCQUFxQixHQUFpQixFQUFFLENBQUM7UUFPbEQsQ0FBQztRQUxBLGFBQWEsQ0FBQyxVQUF3QjtZQUNyQyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM5RSxJQUFJLENBQUMscUJBQXFCLEdBQUcsVUFBVSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7S0FDRDtJQWVELElBQVcsV0FFVjtJQUZELFdBQVcsV0FBVztRQUNyQix3Q0FBeUIsQ0FBQTtJQUMxQixDQUFDLEVB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
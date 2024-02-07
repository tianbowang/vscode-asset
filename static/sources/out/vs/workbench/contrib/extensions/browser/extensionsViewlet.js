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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extensions", "../common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/workbench/contrib/extensions/browser/extensionsViews", "vs/platform/progress/common/progress", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/severity", "vs/workbench/services/activity/common/activity", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/base/browser/ui/aria/aria", "vs/platform/extensions/common/extensions", "vs/platform/registry/common/platform", "vs/platform/label/common/label", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/preferences/common/preferences", "vs/workbench/common/theme", "vs/workbench/services/environment/common/environmentService", "vs/workbench/common/contextkeys", "vs/platform/commands/common/commands", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/actions/common/actions", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/arrays", "vs/platform/dnd/browser/dnd", "vs/base/common/resources", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/platform/actions/browser/toolbar", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/css!./media/extensionsViewlet"], function (require, exports, nls_1, async_1, errors_1, errorMessage_1, lifecycle_1, event_1, actions_1, dom_1, telemetry_1, instantiation_1, extensions_1, extensions_2, extensionsActions_1, extensionManagement_1, extensionManagement_2, extensionsInput_1, extensionsViews_1, progress_1, editorGroupsService_1, severity_1, activity_1, themeService_1, configuration_1, views_1, storage_1, workspace_1, contextkey_1, contextView_1, log_1, notification_1, host_1, layoutService_1, viewPaneContainer_1, extensionQuery_1, suggestEnabledInput_1, aria_1, extensions_3, platform_1, label_1, descriptors_1, preferences_1, theme_1, environmentService_1, contextkeys_1, commands_1, extensionsIcons_1, actions_2, panecomposite_1, arrays_1, dnd_1, resources_1, extensionManagementUtil_1, widgetNavigationCommands_1, toolbar_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MaliciousExtensionChecker = exports.StatusUpdater = exports.ExtensionsViewPaneContainer = exports.ExtensionsViewletViewsContribution = exports.RecommendedExtensionsContext = exports.BuiltInExtensionsContext = exports.SearchHasTextContext = exports.SearchMarketplaceExtensionsContext = exports.ExtensionsSortByContext = exports.DefaultViewsContext = void 0;
    exports.DefaultViewsContext = new contextkey_1.RawContextKey('defaultExtensionViews', true);
    exports.ExtensionsSortByContext = new contextkey_1.RawContextKey('extensionsSortByValue', '');
    exports.SearchMarketplaceExtensionsContext = new contextkey_1.RawContextKey('searchMarketplaceExtensions', false);
    exports.SearchHasTextContext = new contextkey_1.RawContextKey('extensionSearchHasText', false);
    const InstalledExtensionsContext = new contextkey_1.RawContextKey('installedExtensions', false);
    const SearchInstalledExtensionsContext = new contextkey_1.RawContextKey('searchInstalledExtensions', false);
    const SearchRecentlyUpdatedExtensionsContext = new contextkey_1.RawContextKey('searchRecentlyUpdatedExtensions', false);
    const SearchExtensionUpdatesContext = new contextkey_1.RawContextKey('searchExtensionUpdates', false);
    const SearchOutdatedExtensionsContext = new contextkey_1.RawContextKey('searchOutdatedExtensions', false);
    const SearchEnabledExtensionsContext = new contextkey_1.RawContextKey('searchEnabledExtensions', false);
    const SearchDisabledExtensionsContext = new contextkey_1.RawContextKey('searchDisabledExtensions', false);
    const HasInstalledExtensionsContext = new contextkey_1.RawContextKey('hasInstalledExtensions', true);
    exports.BuiltInExtensionsContext = new contextkey_1.RawContextKey('builtInExtensions', false);
    const SearchBuiltInExtensionsContext = new contextkey_1.RawContextKey('searchBuiltInExtensions', false);
    const SearchUnsupportedWorkspaceExtensionsContext = new contextkey_1.RawContextKey('searchUnsupportedWorkspaceExtensions', false);
    const SearchDeprecatedExtensionsContext = new contextkey_1.RawContextKey('searchDeprecatedExtensions', false);
    exports.RecommendedExtensionsContext = new contextkey_1.RawContextKey('recommendedExtensions', false);
    const SortByUpdateDateContext = new contextkey_1.RawContextKey('sortByUpdateDate', false);
    const REMOTE_CATEGORY = { value: (0, nls_1.localize)({ key: 'remote', comment: ['Remote as in remote machine'] }, "Remote"), original: 'Remote' };
    let ExtensionsViewletViewsContribution = class ExtensionsViewletViewsContribution {
        constructor(extensionManagementServerService, labelService, viewDescriptorService, contextKeyService) {
            this.extensionManagementServerService = extensionManagementServerService;
            this.labelService = labelService;
            this.contextKeyService = contextKeyService;
            this.container = viewDescriptorService.getViewContainerById(extensions_2.VIEWLET_ID);
            this.registerViews();
        }
        registerViews() {
            const viewDescriptors = [];
            /* Default views */
            viewDescriptors.push(...this.createDefaultExtensionsViewDescriptors());
            /* Search views */
            viewDescriptors.push(...this.createSearchExtensionsViewDescriptors());
            /* Recommendations views */
            viewDescriptors.push(...this.createRecommendedExtensionsViewDescriptors());
            /* Built-in extensions views */
            viewDescriptors.push(...this.createBuiltinExtensionsViewDescriptors());
            /* Trust Required extensions views */
            viewDescriptors.push(...this.createUnsupportedWorkspaceExtensionsViewDescriptors());
            /* Other Local Filtered extensions views */
            viewDescriptors.push(...this.createOtherLocalFilteredExtensionsViewDescriptors());
            platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews(viewDescriptors, this.container);
        }
        createDefaultExtensionsViewDescriptors() {
            const viewDescriptors = [];
            /*
             * Default installed extensions views - Shows all user installed extensions.
             */
            const servers = [];
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                servers.push(this.extensionManagementServerService.localExtensionManagementServer);
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                servers.push(this.extensionManagementServerService.remoteExtensionManagementServer);
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                servers.push(this.extensionManagementServerService.webExtensionManagementServer);
            }
            const getViewName = (viewTitle, server) => {
                return servers.length > 1 ? `${server.label} - ${viewTitle}` : viewTitle;
            };
            let installedWebExtensionsContextChangeEvent = event_1.Event.None;
            if (this.extensionManagementServerService.webExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                const interestingContextKeys = new Set();
                interestingContextKeys.add('hasInstalledWebExtensions');
                installedWebExtensionsContextChangeEvent = event_1.Event.filter(this.contextKeyService.onDidChangeContext, e => e.affectsSome(interestingContextKeys));
            }
            const serverLabelChangeEvent = event_1.Event.any(this.labelService.onDidChangeFormatters, installedWebExtensionsContextChangeEvent);
            for (const server of servers) {
                const getInstalledViewName = () => getViewName((0, nls_1.localize)('installed', "Installed"), server);
                const onDidChangeTitle = event_1.Event.map(serverLabelChangeEvent, () => getInstalledViewName());
                const id = servers.length > 1 ? `workbench.views.extensions.${server.id}.installed` : `workbench.views.extensions.installed`;
                /* Installed extensions view */
                viewDescriptors.push({
                    id,
                    get name() {
                        return {
                            value: getInstalledViewName(),
                            original: getViewName('Installed', server)
                        };
                    },
                    weight: 100,
                    order: 1,
                    when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext),
                    ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ServerInstalledExtensionsView, [{ server, flexibleHeight: true, onDidChangeTitle }]),
                    /* Installed extensions views shall not be allowed to hidden when there are more than one server */
                    canToggleVisibility: servers.length === 1
                });
                if (server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManagementServerService.localExtensionManagementServer) {
                    (0, actions_2.registerAction2)(class InstallLocalExtensionsInRemoteAction2 extends actions_2.Action2 {
                        constructor() {
                            super({
                                id: 'workbench.extensions.installLocalExtensions',
                                get title() {
                                    return {
                                        value: (0, nls_1.localize)('select and install local extensions', "Install Local Extensions in '{0}'...", server.label),
                                        original: `Install Local Extensions in '${server.label}'...`,
                                    };
                                },
                                category: REMOTE_CATEGORY,
                                icon: extensionsIcons_1.installLocalInRemoteIcon,
                                f1: true,
                                menu: {
                                    id: actions_2.MenuId.ViewTitle,
                                    when: contextkey_1.ContextKeyExpr.equals('view', id),
                                    group: 'navigation',
                                }
                            });
                        }
                        run(accessor) {
                            return accessor.get(instantiation_1.IInstantiationService).createInstance(extensionsActions_1.InstallLocalExtensionsInRemoteAction).run();
                        }
                    });
                }
            }
            if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                (0, actions_2.registerAction2)(class InstallRemoteExtensionsInLocalAction2 extends actions_2.Action2 {
                    constructor() {
                        super({
                            id: 'workbench.extensions.actions.installLocalExtensionsInRemote',
                            title: (0, nls_1.localize2)('install remote in local', 'Install Remote Extensions Locally...'),
                            category: REMOTE_CATEGORY,
                            f1: true
                        });
                    }
                    run(accessor) {
                        return accessor.get(instantiation_1.IInstantiationService).createInstance(extensionsActions_1.InstallRemoteExtensionsInLocalAction, 'workbench.extensions.actions.installLocalExtensionsInRemote').run();
                    }
                });
            }
            /*
             * Default popular extensions view
             * Separate view for popular extensions required as we need to show popular and recommended sections
             * in the default view when there is no search text, and user has no installed extensions.
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.popular',
                name: (0, nls_1.localize2)('popularExtensions', "Popular"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.DefaultPopularExtensionsView, [{ hideBadge: true }]),
                when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext, contextkey_1.ContextKeyExpr.not('hasInstalledExtensions'), extensions_2.CONTEXT_HAS_GALLERY),
                weight: 60,
                order: 2,
                canToggleVisibility: false
            });
            /*
             * Default recommended extensions view
             * When user has installed extensions, this is shown along with the views for enabled & disabled extensions
             * When user has no installed extensions, this is shown along with the view for popular extensions
             */
            viewDescriptors.push({
                id: 'extensions.recommendedList',
                name: (0, nls_1.localize2)('recommendedExtensions', "Recommended"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.DefaultRecommendedExtensionsView, [{ flexibleHeight: true }]),
                when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext, SortByUpdateDateContext.negate(), contextkey_1.ContextKeyExpr.not('config.extensions.showRecommendationsOnlyOnDemand'), extensions_2.CONTEXT_HAS_GALLERY),
                weight: 40,
                order: 3,
                canToggleVisibility: true
            });
            /* Installed views shall be default in multi server window  */
            if (servers.length === 1) {
                /*
                 * Default enabled extensions view - Shows all user installed enabled extensions.
                 * Hidden by default
                 */
                viewDescriptors.push({
                    id: 'workbench.views.extensions.enabled',
                    name: (0, nls_1.localize2)('enabledExtensions', "Enabled"),
                    ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.EnabledExtensionsView, [{}]),
                    when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext, contextkey_1.ContextKeyExpr.has('hasInstalledExtensions')),
                    hideByDefault: true,
                    weight: 40,
                    order: 4,
                    canToggleVisibility: true
                });
                /*
                 * Default disabled extensions view - Shows all disabled extensions.
                 * Hidden by default
                 */
                viewDescriptors.push({
                    id: 'workbench.views.extensions.disabled',
                    name: (0, nls_1.localize2)('disabledExtensions', "Disabled"),
                    ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.DisabledExtensionsView, [{}]),
                    when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext, contextkey_1.ContextKeyExpr.has('hasInstalledExtensions')),
                    hideByDefault: true,
                    weight: 10,
                    order: 5,
                    canToggleVisibility: true
                });
            }
            return viewDescriptors;
        }
        createSearchExtensionsViewDescriptors() {
            const viewDescriptors = [];
            /*
             * View used for searching Marketplace
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.marketplace',
                name: (0, nls_1.localize2)('marketPlace', "Marketplace"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.SearchMarketplaceExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchMarketplaceExtensions')),
            });
            /*
             * View used for searching all installed extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchInstalled',
                name: (0, nls_1.localize2)('installed', "Installed"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has('searchInstalledExtensions'), contextkey_1.ContextKeyExpr.has('installedExtensions')),
            });
            /*
             * View used for searching recently updated extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchRecentlyUpdated',
                name: (0, nls_1.localize2)('recently updated', "Recently Updated"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.RecentlyUpdatedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.or(SearchExtensionUpdatesContext, contextkey_1.ContextKeyExpr.has('searchRecentlyUpdatedExtensions')),
                order: 2,
            });
            /*
             * View used for searching enabled extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchEnabled',
                name: (0, nls_1.localize2)('enabled', "Enabled"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchEnabledExtensions')),
            });
            /*
             * View used for searching disabled extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchDisabled',
                name: (0, nls_1.localize2)('disabled', "Disabled"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchDisabledExtensions')),
            });
            /*
             * View used for searching outdated extensions
             */
            viewDescriptors.push({
                id: extensions_2.OUTDATED_EXTENSIONS_VIEW_ID,
                name: (0, nls_1.localize2)('availableUpdates', "Available Updates"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.OutdatedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.or(SearchExtensionUpdatesContext, contextkey_1.ContextKeyExpr.has('searchOutdatedExtensions')),
                order: 1,
            });
            /*
             * View used for searching builtin extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchBuiltin',
                name: (0, nls_1.localize2)('builtin', "Builtin"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchBuiltInExtensions')),
            });
            /*
             * View used for searching workspace unsupported extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchWorkspaceUnsupported',
                name: (0, nls_1.localize2)('workspaceUnsupported', "Workspace Unsupported"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchWorkspaceUnsupportedExtensions')),
            });
            return viewDescriptors;
        }
        createRecommendedExtensionsViewDescriptors() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID,
                name: (0, nls_1.localize2)('workspaceRecommendedExtensions', "Workspace Recommendations"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.WorkspaceRecommendedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('recommendedExtensions'), contextkeys_1.WorkbenchStateContext.notEqualsTo('empty')),
                order: 1
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.otherRecommendations',
                name: (0, nls_1.localize2)('otherRecommendedExtensions', "Other Recommendations"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.RecommendedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.has('recommendedExtensions'),
                order: 2
            });
            return viewDescriptors;
        }
        createBuiltinExtensionsViewDescriptors() {
            const viewDescriptors = [];
            const configuredCategories = ['themes', 'programming languages'];
            const otherCategories = extensions_3.EXTENSION_CATEGORIES.filter(c => !configuredCategories.includes(c.toLowerCase()));
            otherCategories.push(extensionsViews_1.NONE_CATEGORY);
            const otherCategoriesQuery = `${otherCategories.map(c => `category:"${c}"`).join(' ')} ${configuredCategories.map(c => `category:"-${c}"`).join(' ')}`;
            viewDescriptors.push({
                id: 'workbench.views.extensions.builtinFeatureExtensions',
                name: (0, nls_1.localize2)('builtinFeatureExtensions', "Features"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.StaticQueryExtensionsView, [{ query: `@builtin ${otherCategoriesQuery}` }]),
                when: contextkey_1.ContextKeyExpr.has('builtInExtensions'),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.builtinThemeExtensions',
                name: (0, nls_1.localize2)('builtInThemesExtensions', "Themes"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.StaticQueryExtensionsView, [{ query: `@builtin category:themes` }]),
                when: contextkey_1.ContextKeyExpr.has('builtInExtensions'),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.builtinProgrammingLanguageExtensions',
                name: (0, nls_1.localize2)('builtinProgrammingLanguageExtensions', "Programming Languages"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.StaticQueryExtensionsView, [{ query: `@builtin category:"programming languages"` }]),
                when: contextkey_1.ContextKeyExpr.has('builtInExtensions'),
            });
            return viewDescriptors;
        }
        createUnsupportedWorkspaceExtensionsViewDescriptors() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: 'workbench.views.extensions.untrustedUnsupportedExtensions',
                name: (0, nls_1.localize2)('untrustedUnsupportedExtensions', "Disabled in Restricted Mode"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.UntrustedWorkspaceUnsupportedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(SearchUnsupportedWorkspaceExtensionsContext),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.untrustedPartiallySupportedExtensions',
                name: (0, nls_1.localize2)('untrustedPartiallySupportedExtensions', "Limited in Restricted Mode"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.UntrustedWorkspacePartiallySupportedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(SearchUnsupportedWorkspaceExtensionsContext),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.virtualUnsupportedExtensions',
                name: (0, nls_1.localize2)('virtualUnsupportedExtensions', "Disabled in Virtual Workspaces"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.VirtualWorkspaceUnsupportedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkeys_1.VirtualWorkspaceContext, SearchUnsupportedWorkspaceExtensionsContext),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.virtualPartiallySupportedExtensions',
                name: (0, nls_1.localize2)('virtualPartiallySupportedExtensions', "Limited in Virtual Workspaces"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.VirtualWorkspacePartiallySupportedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkeys_1.VirtualWorkspaceContext, SearchUnsupportedWorkspaceExtensionsContext),
            });
            return viewDescriptors;
        }
        createOtherLocalFilteredExtensionsViewDescriptors() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: 'workbench.views.extensions.deprecatedExtensions',
                name: (0, nls_1.localize2)('deprecated', "Deprecated"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.DeprecatedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(SearchDeprecatedExtensionsContext),
            });
            return viewDescriptors;
        }
    };
    exports.ExtensionsViewletViewsContribution = ExtensionsViewletViewsContribution;
    exports.ExtensionsViewletViewsContribution = ExtensionsViewletViewsContribution = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, label_1.ILabelService),
        __param(2, views_1.IViewDescriptorService),
        __param(3, contextkey_1.IContextKeyService)
    ], ExtensionsViewletViewsContribution);
    let ExtensionsViewPaneContainer = class ExtensionsViewPaneContainer extends viewPaneContainer_1.ViewPaneContainer {
        constructor(layoutService, telemetryService, progressService, instantiationService, editorGroupService, extensionsWorkbenchService, extensionManagementServerService, notificationService, paneCompositeService, themeService, configurationService, storageService, contextService, contextKeyService, contextMenuService, extensionService, viewDescriptorService, preferencesService, commandService) {
            super(extensions_2.VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
            this.progressService = progressService;
            this.editorGroupService = editorGroupService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.notificationService = notificationService;
            this.paneCompositeService = paneCompositeService;
            this.contextKeyService = contextKeyService;
            this.preferencesService = preferencesService;
            this.commandService = commandService;
            this.searchDelayer = new async_1.Delayer(500);
            this.defaultViewsContextKey = exports.DefaultViewsContext.bindTo(contextKeyService);
            this.sortByContextKey = exports.ExtensionsSortByContext.bindTo(contextKeyService);
            this.searchMarketplaceExtensionsContextKey = exports.SearchMarketplaceExtensionsContext.bindTo(contextKeyService);
            this.searchHasTextContextKey = exports.SearchHasTextContext.bindTo(contextKeyService);
            this.sortByUpdateDateContextKey = SortByUpdateDateContext.bindTo(contextKeyService);
            this.installedExtensionsContextKey = InstalledExtensionsContext.bindTo(contextKeyService);
            this.searchInstalledExtensionsContextKey = SearchInstalledExtensionsContext.bindTo(contextKeyService);
            this.searchRecentlyUpdatedExtensionsContextKey = SearchRecentlyUpdatedExtensionsContext.bindTo(contextKeyService);
            this.searchExtensionUpdatesContextKey = SearchExtensionUpdatesContext.bindTo(contextKeyService);
            this.searchWorkspaceUnsupportedExtensionsContextKey = SearchUnsupportedWorkspaceExtensionsContext.bindTo(contextKeyService);
            this.searchDeprecatedExtensionsContextKey = SearchDeprecatedExtensionsContext.bindTo(contextKeyService);
            this.searchOutdatedExtensionsContextKey = SearchOutdatedExtensionsContext.bindTo(contextKeyService);
            this.searchEnabledExtensionsContextKey = SearchEnabledExtensionsContext.bindTo(contextKeyService);
            this.searchDisabledExtensionsContextKey = SearchDisabledExtensionsContext.bindTo(contextKeyService);
            this.hasInstalledExtensionsContextKey = HasInstalledExtensionsContext.bindTo(contextKeyService);
            this.builtInExtensionsContextKey = exports.BuiltInExtensionsContext.bindTo(contextKeyService);
            this.searchBuiltInExtensionsContextKey = SearchBuiltInExtensionsContext.bindTo(contextKeyService);
            this.recommendedExtensionsContextKey = exports.RecommendedExtensionsContext.bindTo(contextKeyService);
            this._register(this.paneCompositeService.onDidPaneCompositeOpen(e => { if (e.viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                this.onViewletOpen(e.composite);
            } }, this));
            this._register(extensionsWorkbenchService.onReset(() => this.refresh()));
            this.searchViewletState = this.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        get searchValue() {
            return this.searchBox?.getValue();
        }
        create(parent) {
            parent.classList.add('extensions-viewlet');
            this.root = parent;
            const overlay = (0, dom_1.append)(this.root, (0, dom_1.$)('.overlay'));
            const overlayBackgroundColor = this.getColor(theme_1.SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? '';
            overlay.style.backgroundColor = overlayBackgroundColor;
            (0, dom_1.hide)(overlay);
            const header = (0, dom_1.append)(this.root, (0, dom_1.$)('.header'));
            const placeholder = (0, nls_1.localize)('searchExtensions', "Search Extensions in Marketplace");
            const searchValue = this.searchViewletState['query.value'] ? this.searchViewletState['query.value'] : '';
            const searchContainer = (0, dom_1.append)(header, (0, dom_1.$)('.extensions-search-container'));
            this.searchBox = this._register(this.instantiationService.createInstance(suggestEnabledInput_1.SuggestEnabledInput, `${extensions_2.VIEWLET_ID}.searchbox`, searchContainer, {
                triggerCharacters: ['@'],
                sortKey: (item) => {
                    if (item.indexOf(':') === -1) {
                        return 'a';
                    }
                    else if (/ext:/.test(item) || /id:/.test(item) || /tag:/.test(item)) {
                        return 'b';
                    }
                    else if (/sort:/.test(item)) {
                        return 'c';
                    }
                    else {
                        return 'd';
                    }
                },
                provideResults: (query) => extensionQuery_1.Query.suggestions(query)
            }, placeholder, 'extensions:searchinput', { placeholderText: placeholder, value: searchValue }));
            this.updateInstalledExtensionsContexts();
            if (this.searchBox.getValue()) {
                this.triggerSearch();
            }
            this._register(this.searchBox.onInputDidChange(() => {
                this.sortByContextKey.set(extensionQuery_1.Query.parse(this.searchBox?.getValue() ?? '').sortBy);
                this.triggerSearch();
            }, this));
            this._register(this.searchBox.onShouldFocusResults(() => this.focusListView(), this));
            const controlElement = (0, dom_1.append)(searchContainer, (0, dom_1.$)('.extensions-search-actions-container'));
            this._register(this.instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, controlElement, extensions_2.extensionsSearchActionsMenu, {
                toolbarOptions: {
                    primaryGroup: () => true,
                },
                actionViewItemProvider: action => (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action)
            }));
            // Register DragAndDrop support
            this._register(new dom_1.DragAndDropObserver(this.root, {
                onDragEnter: (e) => {
                    if (this.isSupportedDragElement(e)) {
                        (0, dom_1.show)(overlay);
                    }
                },
                onDragLeave: (e) => {
                    if (this.isSupportedDragElement(e)) {
                        (0, dom_1.hide)(overlay);
                    }
                },
                onDragOver: (e) => {
                    if (this.isSupportedDragElement(e)) {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                },
                onDrop: async (e) => {
                    if (this.isSupportedDragElement(e)) {
                        (0, dom_1.hide)(overlay);
                        const vsixs = (0, arrays_1.coalesce)((await this.instantiationService.invokeFunction(accessor => (0, dnd_1.extractEditorsAndFilesDropData)(accessor, e)))
                            .map(editor => editor.resource && (0, resources_1.extname)(editor.resource) === '.vsix' ? editor.resource : undefined));
                        if (vsixs.length > 0) {
                            try {
                                // Attempt to install the extension(s)
                                await this.commandService.executeCommand(extensions_2.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID, vsixs);
                            }
                            catch (err) {
                                this.notificationService.error(err);
                            }
                        }
                    }
                }
            }));
            super.create((0, dom_1.append)(this.root, (0, dom_1.$)('.extensions')));
            const focusTracker = this._register((0, dom_1.trackFocus)(this.root));
            const isSearchBoxFocused = () => this.searchBox?.inputWidget.hasWidgetFocus();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [focusTracker],
                focusNextWidget: () => {
                    if (isSearchBoxFocused()) {
                        this.focusListView();
                    }
                },
                focusPreviousWidget: () => {
                    if (!isSearchBoxFocused()) {
                        this.searchBox?.focus();
                    }
                }
            }));
        }
        focus() {
            super.focus();
            this.searchBox?.focus();
        }
        layout(dimension) {
            if (this.root) {
                this.root.classList.toggle('narrow', dimension.width <= 250);
                this.root.classList.toggle('mini', dimension.width <= 200);
            }
            this.searchBox?.layout(new dom_1.Dimension(dimension.width - 34 - /*padding*/ 8 - (24 * 2), 20));
            super.layout(new dom_1.Dimension(dimension.width, dimension.height - 41));
        }
        getOptimalWidth() {
            return 400;
        }
        search(value) {
            if (this.searchBox && this.searchBox.getValue() !== value) {
                this.searchBox.setValue(value);
            }
        }
        async refresh() {
            await this.updateInstalledExtensionsContexts();
            this.doSearch(true);
            if (this.configurationService.getValue(extensions_2.AutoCheckUpdatesConfigurationKey)) {
                this.extensionsWorkbenchService.checkForUpdates();
            }
        }
        async updateInstalledExtensionsContexts() {
            const result = await this.extensionsWorkbenchService.queryLocal();
            this.hasInstalledExtensionsContextKey.set(result.some(r => !r.isBuiltin));
        }
        triggerSearch() {
            this.searchDelayer.trigger(() => this.doSearch(), this.searchBox && this.searchBox.getValue() ? 500 : 0).then(undefined, err => this.onError(err));
        }
        normalizedQuery() {
            return this.searchBox
                ? this.searchBox.getValue()
                    .trim()
                    .replace(/@category/g, 'category')
                    .replace(/@tag:/g, 'tag:')
                    .replace(/@ext:/g, 'ext:')
                    .replace(/@featured/g, 'featured')
                    .replace(/@popular/g, this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer ? '@web' : '@popular')
                : '';
        }
        saveState() {
            const value = this.searchBox ? this.searchBox.getValue() : '';
            if (extensionsViews_1.ExtensionsListView.isLocalExtensionsQuery(value)) {
                this.searchViewletState['query.value'] = value;
            }
            else {
                this.searchViewletState['query.value'] = '';
            }
            super.saveState();
        }
        doSearch(refresh) {
            const value = this.normalizedQuery();
            this.contextKeyService.bufferChangeEvents(() => {
                const isRecommendedExtensionsQuery = extensionsViews_1.ExtensionsListView.isRecommendedExtensionsQuery(value);
                this.searchHasTextContextKey.set(value.trim() !== '');
                this.installedExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isInstalledExtensionsQuery(value));
                this.searchInstalledExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isSearchInstalledExtensionsQuery(value));
                this.searchRecentlyUpdatedExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isSearchRecentlyUpdatedQuery(value) && !extensionsViews_1.ExtensionsListView.isSearchExtensionUpdatesQuery(value));
                this.searchOutdatedExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isOutdatedExtensionsQuery(value) && !extensionsViews_1.ExtensionsListView.isSearchExtensionUpdatesQuery(value));
                this.searchExtensionUpdatesContextKey.set(extensionsViews_1.ExtensionsListView.isSearchExtensionUpdatesQuery(value));
                this.searchEnabledExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isEnabledExtensionsQuery(value));
                this.searchDisabledExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isDisabledExtensionsQuery(value));
                this.searchBuiltInExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isSearchBuiltInExtensionsQuery(value));
                this.searchWorkspaceUnsupportedExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isSearchWorkspaceUnsupportedExtensionsQuery(value));
                this.searchDeprecatedExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isSearchDeprecatedExtensionsQuery(value));
                this.builtInExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isBuiltInExtensionsQuery(value));
                this.recommendedExtensionsContextKey.set(isRecommendedExtensionsQuery);
                this.searchMarketplaceExtensionsContextKey.set(!!value && !extensionsViews_1.ExtensionsListView.isLocalExtensionsQuery(value) && !isRecommendedExtensionsQuery);
                this.sortByUpdateDateContextKey.set(extensionsViews_1.ExtensionsListView.isSortUpdateDateQuery(value));
                this.defaultViewsContextKey.set(!value || extensionsViews_1.ExtensionsListView.isSortInstalledExtensionsQuery(value));
            });
            return this.progress(Promise.all(this.panes.map(view => view.show(this.normalizedQuery(), refresh)
                .then(model => this.alertSearchResult(model.length, view.id))))).then(() => undefined);
        }
        onDidAddViewDescriptors(added) {
            const addedViews = super.onDidAddViewDescriptors(added);
            this.progress(Promise.all(addedViews.map(addedView => addedView.show(this.normalizedQuery())
                .then(model => this.alertSearchResult(model.length, addedView.id)))));
            return addedViews;
        }
        alertSearchResult(count, viewId) {
            const view = this.viewContainerModel.visibleViewDescriptors.find(view => view.id === viewId);
            switch (count) {
                case 0:
                    break;
                case 1:
                    if (view) {
                        (0, aria_1.alert)((0, nls_1.localize)('extensionFoundInSection', "1 extension found in the {0} section.", view.name.value));
                    }
                    else {
                        (0, aria_1.alert)((0, nls_1.localize)('extensionFound', "1 extension found."));
                    }
                    break;
                default:
                    if (view) {
                        (0, aria_1.alert)((0, nls_1.localize)('extensionsFoundInSection', "{0} extensions found in the {1} section.", count, view.name.value));
                    }
                    else {
                        (0, aria_1.alert)((0, nls_1.localize)('extensionsFound', "{0} extensions found.", count));
                    }
                    break;
            }
        }
        getFirstExpandedPane() {
            for (const pane of this.panes) {
                if (pane.isExpanded() && pane instanceof extensionsViews_1.ExtensionsListView) {
                    return pane;
                }
            }
            return undefined;
        }
        focusListView() {
            const pane = this.getFirstExpandedPane();
            if (pane && pane.count() > 0) {
                pane.focus();
            }
        }
        onViewletOpen(viewlet) {
            if (!viewlet || viewlet.getId() === extensions_2.VIEWLET_ID) {
                return;
            }
            if (this.configurationService.getValue(extensions_2.CloseExtensionDetailsOnViewChangeKey)) {
                const promises = this.editorGroupService.groups.map(group => {
                    const editors = group.editors.filter(input => input instanceof extensionsInput_1.ExtensionsInput);
                    return group.closeEditors(editors);
                });
                Promise.all(promises);
            }
        }
        progress(promise) {
            return this.progressService.withProgress({ location: 5 /* ProgressLocation.Extensions */ }, () => promise);
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
        isSupportedDragElement(e) {
            if (e.dataTransfer) {
                const typesLowerCase = e.dataTransfer.types.map(t => t.toLocaleLowerCase());
                return typesLowerCase.indexOf('files') !== -1;
            }
            return false;
        }
    };
    exports.ExtensionsViewPaneContainer = ExtensionsViewPaneContainer;
    exports.ExtensionsViewPaneContainer = ExtensionsViewPaneContainer = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, progress_1.IProgressService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, extensions_2.IExtensionsWorkbenchService),
        __param(6, extensionManagement_2.IExtensionManagementServerService),
        __param(7, notification_1.INotificationService),
        __param(8, panecomposite_1.IPaneCompositePartService),
        __param(9, themeService_1.IThemeService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, storage_1.IStorageService),
        __param(12, workspace_1.IWorkspaceContextService),
        __param(13, contextkey_1.IContextKeyService),
        __param(14, contextView_1.IContextMenuService),
        __param(15, extensions_1.IExtensionService),
        __param(16, views_1.IViewDescriptorService),
        __param(17, preferences_1.IPreferencesService),
        __param(18, commands_1.ICommandService)
    ], ExtensionsViewPaneContainer);
    let StatusUpdater = class StatusUpdater extends lifecycle_1.Disposable {
        constructor(activityService, extensionsWorkbenchService, extensionEnablementService) {
            super();
            this.activityService = activityService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.badgeHandle = this._register(new lifecycle_1.MutableDisposable());
            this.onServiceChange();
            this._register(event_1.Event.debounce(extensionsWorkbenchService.onChange, () => undefined, 100, undefined, undefined, undefined, this._store)(this.onServiceChange, this));
        }
        onServiceChange() {
            this.badgeHandle.clear();
            const extensionsReloadRequired = this.extensionsWorkbenchService.installed.filter(e => e.reloadRequiredStatus !== undefined);
            const outdated = this.extensionsWorkbenchService.outdated.reduce((r, e) => r + (this.extensionEnablementService.isEnabled(e.local) && !extensionsReloadRequired.includes(e) ? 1 : 0), 0);
            const newBadgeNumber = outdated + extensionsReloadRequired.length;
            if (newBadgeNumber > 0) {
                let msg = '';
                if (outdated) {
                    msg += outdated === 1 ? (0, nls_1.localize)('extensionToUpdate', '{0} requires update', outdated) : (0, nls_1.localize)('extensionsToUpdate', '{0} require update', outdated);
                }
                if (outdated > 0 && extensionsReloadRequired.length > 0) {
                    msg += ', ';
                }
                if (extensionsReloadRequired.length) {
                    msg += extensionsReloadRequired.length === 1 ? (0, nls_1.localize)('extensionToReload', '{0} requires reload', extensionsReloadRequired.length) : (0, nls_1.localize)('extensionsToReload', '{0} require reload', extensionsReloadRequired.length);
                }
                const badge = new activity_1.NumberBadge(newBadgeNumber, () => msg);
                this.badgeHandle.value = this.activityService.showViewContainerActivity(extensions_2.VIEWLET_ID, { badge });
            }
        }
    };
    exports.StatusUpdater = StatusUpdater;
    exports.StatusUpdater = StatusUpdater = __decorate([
        __param(0, activity_1.IActivityService),
        __param(1, extensions_2.IExtensionsWorkbenchService),
        __param(2, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], StatusUpdater);
    let MaliciousExtensionChecker = class MaliciousExtensionChecker {
        constructor(extensionsManagementService, hostService, logService, notificationService, environmentService) {
            this.extensionsManagementService = extensionsManagementService;
            this.hostService = hostService;
            this.logService = logService;
            this.notificationService = notificationService;
            this.environmentService = environmentService;
            if (!this.environmentService.disableExtensions) {
                this.loopCheckForMaliciousExtensions();
            }
        }
        loopCheckForMaliciousExtensions() {
            this.checkForMaliciousExtensions()
                .then(() => (0, async_1.timeout)(1000 * 60 * 5)) // every five minutes
                .then(() => this.loopCheckForMaliciousExtensions());
        }
        checkForMaliciousExtensions() {
            return this.extensionsManagementService.getExtensionsControlManifest().then(extensionsControlManifest => {
                return this.extensionsManagementService.getInstalled(1 /* ExtensionType.User */).then(installed => {
                    const maliciousExtensions = installed
                        .filter(e => extensionsControlManifest.malicious.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier)));
                    if (maliciousExtensions.length) {
                        return async_1.Promises.settled(maliciousExtensions.map(e => this.extensionsManagementService.uninstall(e).then(() => {
                            this.notificationService.prompt(severity_1.default.Warning, (0, nls_1.localize)('malicious warning', "We have uninstalled '{0}' which was reported to be problematic.", e.identifier.id), [{
                                    label: (0, nls_1.localize)('reloadNow', "Reload Now"),
                                    run: () => this.hostService.reload()
                                }], {
                                sticky: true,
                                priority: notification_1.NotificationPriority.URGENT
                            });
                        })));
                    }
                    else {
                        return Promise.resolve(undefined);
                    }
                }).then(() => undefined);
            }, err => this.logService.error(err));
        }
    };
    exports.MaliciousExtensionChecker = MaliciousExtensionChecker;
    exports.MaliciousExtensionChecker = MaliciousExtensionChecker = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, host_1.IHostService),
        __param(2, log_1.ILogService),
        __param(3, notification_1.INotificationService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService)
    ], MaliciousExtensionChecker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1ZpZXdsZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25zVmlld2xldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnRW5GLFFBQUEsbUJBQW1CLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHVCQUF1QixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hGLFFBQUEsdUJBQXVCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2pGLFFBQUEsa0NBQWtDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RHLFFBQUEsb0JBQW9CLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHdCQUF3QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hHLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVGLE1BQU0sZ0NBQWdDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDJCQUEyQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hHLE1BQU0sc0NBQXNDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGlDQUFpQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BILE1BQU0sNkJBQTZCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHdCQUF3QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xHLE1BQU0sK0JBQStCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RHLE1BQU0sOEJBQThCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BHLE1BQU0sK0JB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
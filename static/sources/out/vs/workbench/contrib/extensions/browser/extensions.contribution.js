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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/common/contributions", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/workbench/contrib/extensions/browser/extensionEditor", "vs/workbench/contrib/extensions/browser/extensionsViewlet", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/contrib/extensions/common/extensionsFileTemplate", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/common/extensionsUtils", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/browser/editor", "vs/base/common/uri", "vs/workbench/contrib/extensions/browser/extensionsActivationProgress", "vs/base/common/errors", "vs/workbench/contrib/extensions/browser/extensionsDependencyChecker", "vs/base/common/cancellation", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/preferences/common/preferences", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/extensions/browser/extensionsQuickAccess", "vs/workbench/contrib/extensions/browser/extensionRecommendationsService", "vs/workbench/services/userDataSync/common/userDataSync", "vs/editor/contrib/clipboard/browser/clipboard", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/platform/action/common/actionCommonCategories", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService", "vs/workbench/services/extensions/common/extensions", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/common/contextkeys", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/base/common/network", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/workbench/contrib/extensions/browser/extensionEnablementWorkspaceTrustTransitionParticipant", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/base/common/async", "vs/workbench/common/editor", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/workbench/contrib/extensions/browser/extensionsCompletionItemsProvider", "vs/platform/quickinput/common/quickInput", "vs/base/common/event", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/extensions/browser/unsupportedExtensionsMigrationContribution", "vs/base/common/platform", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/storage/common/storage", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/extensions/browser/deprecatedExtensionsChecker"], function (require, exports, nls_1, platform_1, actions_1, extensions_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, contributions_1, descriptors_1, extensions_2, extensionsActions_1, extensionsInput_1, extensionEditor_1, extensionsViewlet_1, configurationRegistry_1, jsonContributionRegistry, extensionsFileTemplate_1, commands_1, instantiation_1, extensionsUtils_1, extensionManagementUtil_1, editor_1, uri_1, extensionsActivationProgress_1, errors_1, extensionsDependencyChecker_1, cancellation_1, views_1, viewsService_1, clipboardService_1, preferences_1, contextkey_1, quickAccess_1, extensionsQuickAccess_1, extensionRecommendationsService_1, userDataSync_1, clipboard_1, editorService_1, extensionsWorkbenchService_1, actionCommonCategories_1, extensionRecommendations_2, extensionRecommendationNotificationService_1, extensions_3, notification_1, host_1, contextkeys_1, workspaceExtensionsConfig_1, network_1, abstractRuntimeExtensionsEditor_1, extensionEnablementWorkspaceTrustTransitionParticipant_1, extensionsIcons_1, extensions_4, lifecycle_1, configuration_1, dialogs_1, labels_1, extensionQuery_1, async_1, editor_2, workspaceTrust_1, extensionsCompletionItemsProvider_1, quickInput_1, event_1, panecomposite_1, unsupportedExtensionsMigrationContribution_1, platform_2, extensionStorage_1, storage_1, preferences_2, deprecatedExtensionsChecker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CONTEXT_HAS_WEB_SERVER = exports.CONTEXT_HAS_REMOTE_SERVER = exports.CONTEXT_HAS_LOCAL_SERVER = void 0;
    // Singletons
    (0, extensions_1.registerSingleton)(extensions_2.IExtensionsWorkbenchService, extensionsWorkbenchService_1.ExtensionsWorkbenchService, 0 /* InstantiationType.Eager */);
    (0, extensions_1.registerSingleton)(extensionRecommendations_2.IExtensionRecommendationNotificationService, extensionRecommendationNotificationService_1.ExtensionRecommendationNotificationService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(extensionRecommendations_1.IExtensionRecommendationsService, extensionRecommendationsService_1.ExtensionRecommendationsService, 0 /* InstantiationType.Eager */);
    // Quick Access
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: extensionsQuickAccess_1.ManageExtensionsQuickAccessProvider,
        prefix: extensionsQuickAccess_1.ManageExtensionsQuickAccessProvider.PREFIX,
        placeholder: (0, nls_1.localize)('manageExtensionsQuickAccessPlaceholder', "Press Enter to manage extensions."),
        helpEntries: [{ description: (0, nls_1.localize)('manageExtensionsHelp', "Manage Extensions") }]
    });
    // Editor
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(extensionEditor_1.ExtensionEditor, extensionEditor_1.ExtensionEditor.ID, (0, nls_1.localize)('extension', "Extension")), [
        new descriptors_1.SyncDescriptor(extensionsInput_1.ExtensionsInput)
    ]);
    platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: extensions_2.VIEWLET_ID,
        title: (0, nls_1.localize2)('extensions', "Extensions"),
        openCommandActionDescriptor: {
            id: extensions_2.VIEWLET_ID,
            mnemonicTitle: (0, nls_1.localize)({ key: 'miViewExtensions', comment: ['&& denotes a mnemonic'] }, "E&&xtensions"),
            keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 54 /* KeyCode.KeyX */ },
            order: 4,
        },
        ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViewlet_1.ExtensionsViewPaneContainer),
        icon: extensionsIcons_1.extensionsViewIcon,
        order: 4,
        rejectAddedViews: true,
        alwaysUseContainerInfo: true,
    }, 0 /* ViewContainerLocation.Sidebar */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'extensions',
        order: 30,
        title: (0, nls_1.localize)('extensionsConfigurationTitle', "Extensions"),
        type: 'object',
        properties: {
            'extensions.autoUpdate': {
                enum: [true, 'onlyEnabledExtensions', 'onlySelectedExtensions', false,],
                enumItemLabels: [
                    (0, nls_1.localize)('all', "All Extensions"),
                    (0, nls_1.localize)('enabled', "Only Enabled Extensions"),
                    (0, nls_1.localize)('selected', "Only Selected Extensions"),
                    (0, nls_1.localize)('none', "None"),
                ],
                enumDescriptions: [
                    (0, nls_1.localize)('extensions.autoUpdate.true', 'Download and install updates automatically for all extensions except for those updates are ignored.'),
                    (0, nls_1.localize)('extensions.autoUpdate.enabled', 'Download and install updates automatically only for enabled extensions except for those updates are ignored. Disabled extensions are not updated automatically.'),
                    (0, nls_1.localize)('extensions.autoUpdate.selected', 'Download and install updates automatically only for selected extensions.'),
                    (0, nls_1.localize)('extensions.autoUpdate.false', 'Extensions are not automatically updated.'),
                ],
                description: (0, nls_1.localize)('extensions.autoUpdate', "Controls the automatic update behavior of extensions. The updates are fetched from a Microsoft online service."),
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                tags: ['usesOnlineServices']
            },
            'extensions.autoCheckUpdates': {
                type: 'boolean',
                description: (0, nls_1.localize)('extensionsCheckUpdates', "When enabled, automatically checks extensions for updates. If an extension has an update, it is marked as outdated in the Extensions view. The updates are fetched from a Microsoft online service."),
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                tags: ['usesOnlineServices']
            },
            'extensions.ignoreRecommendations': {
                type: 'boolean',
                description: (0, nls_1.localize)('extensionsIgnoreRecommendations', "When enabled, the notifications for extension recommendations will not be shown."),
                default: false
            },
            'extensions.showRecommendationsOnlyOnDemand': {
                type: 'boolean',
                deprecationMessage: (0, nls_1.localize)('extensionsShowRecommendationsOnlyOnDemand_Deprecated', "This setting is deprecated. Use extensions.ignoreRecommendations setting to control recommendation notifications. Use Extensions view's visibility actions to hide Recommended view by default."),
                default: false,
                tags: ['usesOnlineServices']
            },
            'extensions.closeExtensionDetailsOnViewChange': {
                type: 'boolean',
                description: (0, nls_1.localize)('extensionsCloseExtensionDetailsOnViewChange', "When enabled, editors with extension details will be automatically closed upon navigating away from the Extensions View."),
                default: false
            },
            'extensions.confirmedUriHandlerExtensionIds': {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: (0, nls_1.localize)('handleUriConfirmedExtensions', "When an extension is listed here, a confirmation prompt will not be shown when that extension handles a URI."),
                default: [],
                scope: 1 /* ConfigurationScope.APPLICATION */
            },
            'extensions.webWorker': {
                type: ['boolean', 'string'],
                enum: [true, false, 'auto'],
                enumDescriptions: [
                    (0, nls_1.localize)('extensionsWebWorker.true', "The Web Worker Extension Host will always be launched."),
                    (0, nls_1.localize)('extensionsWebWorker.false', "The Web Worker Extension Host will never be launched."),
                    (0, nls_1.localize)('extensionsWebWorker.auto', "The Web Worker Extension Host will be launched when a web extension needs it."),
                ],
                description: (0, nls_1.localize)('extensionsWebWorker', "Enable web worker extension host."),
                default: 'auto'
            },
            'extensions.supportVirtualWorkspaces': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)('extensions.supportVirtualWorkspaces', "Override the virtual workspaces support of an extension."),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                        type: 'boolean',
                        default: false
                    }
                },
                additionalProperties: false,
                default: {},
                defaultSnippets: [{
                        'body': {
                            'pub.name': false
                        }
                    }]
            },
            'extensions.experimental.affinity': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)('extensions.affinity', "Configure an extension to execute in a different extension host process."),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                        type: 'integer',
                        default: 1
                    }
                },
                additionalProperties: false,
                default: {},
                defaultSnippets: [{
                        'body': {
                            'pub.name': 1
                        }
                    }]
            },
            [workspaceTrust_1.WORKSPACE_TRUST_EXTENSION_SUPPORT]: {
                type: 'object',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                markdownDescription: (0, nls_1.localize)('extensions.supportUntrustedWorkspaces', "Override the untrusted workspace support of an extension. Extensions using `true` will always be enabled. Extensions using `limited` will always be enabled, and the extension will hide functionality that requires trust. Extensions using `false` will only be enabled only when the workspace is trusted."),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                        type: 'object',
                        properties: {
                            'supported': {
                                type: ['boolean', 'string'],
                                enum: [true, false, 'limited'],
                                enumDescriptions: [
                                    (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.true', "Extension will always be enabled."),
                                    (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.false', "Extension will only be enabled only when the workspace is trusted."),
                                    (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.limited', "Extension will always be enabled, and the extension will hide functionality requiring trust."),
                                ],
                                description: (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.supported', "Defines the untrusted workspace support setting for the extension."),
                            },
                            'version': {
                                type: 'string',
                                description: (0, nls_1.localize)('extensions.supportUntrustedWorkspaces.version', "Defines the version of the extension for which the override should be applied. If not specified, the override will be applied independent of the extension version."),
                            }
                        }
                    }
                }
            },
            'extensions.experimental.deferredStartupFinishedActivation': {
                type: 'boolean',
                description: (0, nls_1.localize)('extensionsDeferredStartupFinishedActivation', "When enabled, extensions which declare the `onStartupFinished` activation event will be activated after a timeout."),
                default: false
            }
        }
    });
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
    jsonRegistry.registerSchema(extensionsFileTemplate_1.ExtensionsConfigurationSchemaId, extensionsFileTemplate_1.ExtensionsConfigurationSchema);
    // Register Commands
    commands_1.CommandsRegistry.registerCommand('_extensions.manage', (accessor, extensionId, tab, preserveFocus) => {
        const extensionService = accessor.get(extensions_2.IExtensionsWorkbenchService);
        const extension = extensionService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }));
        if (extension) {
            extensionService.open(extension, { tab, preserveFocus });
        }
        else {
            throw new Error((0, nls_1.localize)('notFound', "Extension '{0}' not found.", extensionId));
        }
    });
    commands_1.CommandsRegistry.registerCommand('extension.open', async (accessor, extensionId, tab, preserveFocus) => {
        const extensionService = accessor.get(extensions_2.IExtensionsWorkbenchService);
        const commandService = accessor.get(commands_1.ICommandService);
        const [extension] = await extensionService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None);
        if (extension) {
            return extensionService.open(extension, { tab, preserveFocus });
        }
        return commandService.executeCommand('_extensions.manage', extensionId, tab, preserveFocus);
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.extensions.installExtension',
        metadata: {
            description: (0, nls_1.localize)('workbench.extensions.installExtension.description', "Install the given extension"),
            args: [
                {
                    name: 'extensionIdOrVSIXUri',
                    description: (0, nls_1.localize)('workbench.extensions.installExtension.arg.decription', "Extension id or VSIX resource uri"),
                    constraint: (value) => typeof value === 'string' || value instanceof uri_1.URI,
                },
                {
                    name: 'options',
                    description: '(optional) Options for installing the extension. Object with the following properties: ' +
                        '`installOnlyNewlyAddedFromExtensionPackVSIX`: When enabled, VS Code installs only newly added extensions from the extension pack VSIX. This option is considered only when installing VSIX. ',
                    isOptional: true,
                    schema: {
                        'type': 'object',
                        'properties': {
                            'installOnlyNewlyAddedFromExtensionPackVSIX': {
                                'type': 'boolean',
                                'description': (0, nls_1.localize)('workbench.extensions.installExtension.option.installOnlyNewlyAddedFromExtensionPackVSIX', "When enabled, VS Code installs only newly added extensions from the extension pack VSIX. This option is considered only while installing a VSIX."),
                                default: false
                            },
                            'installPreReleaseVersion': {
                                'type': 'boolean',
                                'description': (0, nls_1.localize)('workbench.extensions.installExtension.option.installPreReleaseVersion', "When enabled, VS Code installs the pre-release version of the extension if available."),
                                default: false
                            },
                            'donotSync': {
                                'type': 'boolean',
                                'description': (0, nls_1.localize)('workbench.extensions.installExtension.option.donotSync', "When enabled, VS Code do not sync this extension when Settings Sync is on."),
                                default: false
                            },
                            'context': {
                                'type': 'object',
                                'description': (0, nls_1.localize)('workbench.extensions.installExtension.option.context', "Context for the installation. This is a JSON object that can be used to pass any information to the installation handlers. i.e. `{skipWalkthrough: true}` will skip opening the walkthrough upon install."),
                            }
                        }
                    }
                }
            ]
        },
        handler: async (accessor, arg, options) => {
            const extensionsWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
            const extensionManagementService = accessor.get(extensionManagement_2.IWorkbenchExtensionManagementService);
            try {
                if (typeof arg === 'string') {
                    const [id, version] = (0, extensionManagementUtil_1.getIdAndVersion)(arg);
                    const [extension] = await extensionsWorkbenchService.getExtensions([{ id, preRelease: options?.installPreReleaseVersion }], cancellation_1.CancellationToken.None);
                    if (extension) {
                        const installOptions = {
                            isMachineScoped: options?.donotSync ? true : undefined, /* do not allow syncing extensions automatically while installing through the command */
                            installPreReleaseVersion: options?.installPreReleaseVersion,
                            installGivenVersion: !!version,
                            context: options?.context
                        };
                        if (extension.gallery && extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
                            await extensionManagementService.installFromGallery(extension.gallery, installOptions);
                            return;
                        }
                        if (version) {
                            await extensionsWorkbenchService.installVersion(extension, version, installOptions);
                        }
                        else {
                            await extensionsWorkbenchService.install(extension, installOptions);
                        }
                    }
                    else {
                        throw new Error((0, nls_1.localize)('notFound', "Extension '{0}' not found.", arg));
                    }
                }
                else {
                    const vsix = uri_1.URI.revive(arg);
                    await extensionsWorkbenchService.install(vsix, { installOnlyNewlyAddedFromExtensionPack: options?.installOnlyNewlyAddedFromExtensionPackVSIX });
                }
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                throw e;
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.extensions.uninstallExtension',
        metadata: {
            description: (0, nls_1.localize)('workbench.extensions.uninstallExtension.description', "Uninstall the given extension"),
            args: [
                {
                    name: (0, nls_1.localize)('workbench.extensions.uninstallExtension.arg.name', "Id of the extension to uninstall"),
                    schema: {
                        'type': 'string'
                    }
                }
            ]
        },
        handler: async (accessor, id) => {
            if (!id) {
                throw new Error((0, nls_1.localize)('id required', "Extension id required."));
            }
            const extensionManagementService = accessor.get(extensionManagement_1.IExtensionManagementService);
            const installed = await extensionManagementService.getInstalled();
            const [extensionToUninstall] = installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
            if (!extensionToUninstall) {
                throw new Error((0, nls_1.localize)('notInstalled', "Extension '{0}' is not installed. Make sure you use the full extension ID, including the publisher, e.g.: ms-dotnettools.csharp.", id));
            }
            if (extensionToUninstall.isBuiltin) {
                throw new Error((0, nls_1.localize)('builtin', "Extension '{0}' is a Built-in extension and cannot be installed", id));
            }
            try {
                await extensionManagementService.uninstall(extensionToUninstall);
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                throw e;
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.extensions.search',
        metadata: {
            description: (0, nls_1.localize)('workbench.extensions.search.description', "Search for a specific extension"),
            args: [
                {
                    name: (0, nls_1.localize)('workbench.extensions.search.arg.name', "Query to use in search"),
                    schema: { 'type': 'string' }
                }
            ]
        },
        handler: async (accessor, query = '') => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = await paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            if (!viewlet) {
                return;
            }
            viewlet.getViewPaneContainer().search(query);
            viewlet.focus();
        }
    });
    function overrideActionForActiveExtensionEditorWebview(command, f) {
        command?.addImplementation(105, 'extensions-editor', (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = editorService.activeEditorPane;
            if (editor instanceof extensionEditor_1.ExtensionEditor) {
                if (editor.activeWebview?.isFocused) {
                    f(editor.activeWebview);
                    return true;
                }
            }
            return false;
        });
    }
    overrideActionForActiveExtensionEditorWebview(clipboard_1.CopyAction, webview => webview.copy());
    overrideActionForActiveExtensionEditorWebview(clipboard_1.CutAction, webview => webview.cut());
    overrideActionForActiveExtensionEditorWebview(clipboard_1.PasteAction, webview => webview.paste());
    // Contexts
    exports.CONTEXT_HAS_LOCAL_SERVER = new contextkey_1.RawContextKey('hasLocalServer', false);
    exports.CONTEXT_HAS_REMOTE_SERVER = new contextkey_1.RawContextKey('hasRemoteServer', false);
    exports.CONTEXT_HAS_WEB_SERVER = new contextkey_1.RawContextKey('hasWebServer', false);
    async function runAction(action) {
        try {
            await action.run();
        }
        finally {
            if ((0, lifecycle_1.isDisposable)(action)) {
                action.dispose();
            }
        }
    }
    let ExtensionsContributions = class ExtensionsContributions extends lifecycle_1.Disposable {
        constructor(extensionManagementServerService, extensionGalleryService, contextKeyService, paneCompositeService, extensionsWorkbenchService, extensionEnablementService, instantiationService, dialogService, commandService) {
            super();
            this.extensionManagementServerService = extensionManagementServerService;
            this.paneCompositeService = paneCompositeService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.instantiationService = instantiationService;
            this.dialogService = dialogService;
            this.commandService = commandService;
            const hasGalleryContext = extensions_2.CONTEXT_HAS_GALLERY.bindTo(contextKeyService);
            if (extensionGalleryService.isEnabled()) {
                hasGalleryContext.set(true);
            }
            const hasLocalServerContext = exports.CONTEXT_HAS_LOCAL_SERVER.bindTo(contextKeyService);
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                hasLocalServerContext.set(true);
            }
            const hasRemoteServerContext = exports.CONTEXT_HAS_REMOTE_SERVER.bindTo(contextKeyService);
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                hasRemoteServerContext.set(true);
            }
            const hasWebServerContext = exports.CONTEXT_HAS_WEB_SERVER.bindTo(contextKeyService);
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                hasWebServerContext.set(true);
            }
            this.registerGlobalActions();
            this.registerContextMenuActions();
            this.registerQuickAccessProvider();
        }
        registerQuickAccessProvider() {
            if (this.extensionManagementServerService.localExtensionManagementServer
                || this.extensionManagementServerService.remoteExtensionManagementServer
                || this.extensionManagementServerService.webExtensionManagementServer) {
                platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
                    ctor: extensionsQuickAccess_1.InstallExtensionQuickAccessProvider,
                    prefix: extensionsQuickAccess_1.InstallExtensionQuickAccessProvider.PREFIX,
                    placeholder: (0, nls_1.localize)('installExtensionQuickAccessPlaceholder', "Type the name of an extension to install or search."),
                    helpEntries: [{ description: (0, nls_1.localize)('installExtensionQuickAccessHelp', "Install or Search Extensions") }]
                });
            }
        }
        // Global actions
        registerGlobalActions() {
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                command: {
                    id: extensions_2.VIEWLET_ID,
                    title: (0, nls_1.localize)({ key: 'miPreferencesExtensions', comment: ['&& denotes a mnemonic'] }, "&&Extensions")
                },
                group: '2_configuration',
                order: 3
            }));
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                command: {
                    id: extensions_2.VIEWLET_ID,
                    title: (0, nls_1.localize)('showExtensions', "Extensions")
                },
                group: '2_configuration',
                order: 3
            }));
            this.registerExtensionAction({
                id: 'workbench.extensions.action.focusExtensionsView',
                title: (0, nls_1.localize2)('focusExtensions', 'Focus on Extensions View'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                f1: true,
                run: async (accessor) => {
                    await accessor.get(panecomposite_1.IPaneCompositePartService).openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.installExtensions',
                title: (0, nls_1.localize2)('installExtensions', 'Install Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                },
                run: async (accessor) => {
                    accessor.get(viewsService_1.IViewsService).openViewContainer(extensions_2.VIEWLET_ID, true);
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showRecommendedKeymapExtensions',
                title: (0, nls_1.localize2)('showRecommendedKeymapExtensionsShort', 'Keymaps'),
                category: extensionManagement_1.PreferencesLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(preferences_2.CONTEXT_KEYBINDINGS_EDITOR, extensions_2.CONTEXT_HAS_GALLERY),
                        group: '2_keyboard_discover_actions'
                    }],
                menuTitles: {
                    [actions_1.MenuId.EditorTitle.id]: (0, nls_1.localize)('importKeyboardShortcutsFroms', "Migrate Keyboard Shortcuts from...")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recommended:keymaps '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showLanguageExtensions',
                title: (0, nls_1.localize2)('showLanguageExtensionsShort', 'Language Extensions'),
                category: extensionManagement_1.PreferencesLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: extensions_2.CONTEXT_HAS_GALLERY
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recommended:languages '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.checkForUpdates',
                title: (0, nls_1.localize2)('checkForUpdates', 'Check for Extension Updates'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID), extensions_2.CONTEXT_HAS_GALLERY),
                        group: '1_updates',
                        order: 1
                    }],
                run: async () => {
                    await this.extensionsWorkbenchService.checkForUpdates();
                    const outdated = this.extensionsWorkbenchService.outdated;
                    if (outdated.length) {
                        return runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@outdated '));
                    }
                    else {
                        return this.dialogService.info((0, nls_1.localize)('noUpdatesAvailable', "All extensions are up to date."));
                    }
                }
            });
            const autoUpdateExtensionsSubMenu = new actions_1.MenuId('autoUpdateExtensionsSubMenu');
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewContainerTitle, {
                submenu: autoUpdateExtensionsSubMenu,
                title: (0, nls_1.localize)('configure auto updating extensions', "Auto Update Extensions"),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID), extensions_2.CONTEXT_HAS_GALLERY),
                group: '1_updates',
                order: 5,
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.all',
                title: (0, nls_1.localize)('configureExtensionsAutoUpdate.all', "All Extensions"),
                toggled: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(`config.${extensions_2.AutoUpdateConfigurationKey}`), contextkey_1.ContextKeyExpr.notEquals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlyEnabledExtensions'), contextkey_1.ContextKeyExpr.notEquals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlySelectedExtensions')),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 1,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, true)
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.enabled',
                title: (0, nls_1.localize)('configureExtensionsAutoUpdate.enabled', "Enabled Extensions"),
                toggled: contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlyEnabledExtensions'),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 2,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, 'onlyEnabledExtensions')
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.selected',
                title: (0, nls_1.localize)('configureExtensionsAutoUpdate.selected', "Selected Extensions"),
                toggled: contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlySelectedExtensions'),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 2,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, 'onlySelectedExtensions')
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.none',
                title: (0, nls_1.localize)('configureExtensionsAutoUpdate.none', "None"),
                toggled: contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, false),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 3,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, false)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.updateAllExtensions',
                title: (0, nls_1.localize2)('updateAll', 'Update All Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                precondition: extensions_2.HasOutdatedExtensionsContext,
                menu: [
                    {
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has(`config.${extensions_2.AutoUpdateConfigurationKey}`).negate(), contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlyEnabledExtensions'))),
                        group: '1_updates',
                        order: 2
                    }, {
                        id: actions_1.MenuId.ViewTitle,
                        when: contextkey_1.ContextKeyExpr.equals('view', extensions_2.OUTDATED_EXTENSIONS_VIEW_ID),
                        group: 'navigation',
                        order: 1
                    }
                ],
                icon: extensionsIcons_1.installWorkspaceRecommendedIcon,
                run: async () => {
                    const outdated = this.extensionsWorkbenchService.outdated;
                    const results = await this.extensionsWorkbenchService.updateAll();
                    results.forEach((result) => {
                        if (result.error) {
                            const extension = outdated.find((extension) => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, result.identifier));
                            if (extension) {
                                runAction(this.instantiationService.createInstance(extensionsActions_1.PromptExtensionInstallFailureAction, extension, extension.latestVersion, 3 /* InstallOperation.Update */, result.error));
                            }
                        }
                    });
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.disableAutoUpdate',
                title: (0, nls_1.localize2)('disableAutoUpdate', 'Disable Auto Update for All Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                f1: true,
                precondition: extensions_2.CONTEXT_HAS_GALLERY,
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, false)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.enableAutoUpdate',
                title: (0, nls_1.localize2)('enableAutoUpdate', 'Enable Auto Update for All Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                f1: true,
                precondition: extensions_2.CONTEXT_HAS_GALLERY,
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, true)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.enableAll',
                title: (0, nls_1.localize2)('enableAll', 'Enable All Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID),
                        group: '2_enablement',
                        order: 1
                    }],
                run: async () => {
                    const extensionsToEnable = this.extensionsWorkbenchService.local.filter(e => !!e.local && this.extensionEnablementService.canChangeEnablement(e.local) && !this.extensionEnablementService.isEnabled(e.local));
                    if (extensionsToEnable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToEnable, 8 /* EnablementState.EnabledGlobally */);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.enableAllWorkspace',
                title: (0, nls_1.localize2)('enableAllWorkspace', 'Enable All Extensions for this Workspace'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                },
                run: async () => {
                    const extensionsToEnable = this.extensionsWorkbenchService.local.filter(e => !!e.local && this.extensionEnablementService.canChangeEnablement(e.local) && !this.extensionEnablementService.isEnabled(e.local));
                    if (extensionsToEnable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToEnable, 9 /* EnablementState.EnabledWorkspace */);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.disableAll',
                title: (0, nls_1.localize2)('disableAll', 'Disable All Installed Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID),
                        group: '2_enablement',
                        order: 2
                    }],
                run: async () => {
                    const extensionsToDisable = this.extensionsWorkbenchService.local.filter(e => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(e.local) && this.extensionEnablementService.canChangeEnablement(e.local));
                    if (extensionsToDisable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToDisable, 6 /* EnablementState.DisabledGlobally */);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.disableAllWorkspace',
                title: (0, nls_1.localize2)('disableAllWorkspace', 'Disable All Installed Extensions for this Workspace'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                },
                run: async () => {
                    const extensionsToDisable = this.extensionsWorkbenchService.local.filter(e => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(e.local) && this.extensionEnablementService.canChangeEnablement(e.local));
                    if (extensionsToDisable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToDisable, 7 /* EnablementState.DisabledWorkspace */);
                    }
                }
            });
            this.registerExtensionAction({
                id: extensions_2.SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID,
                title: (0, nls_1.localize2)('InstallFromVSIX', 'Install from VSIX...'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER)
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID), contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER)),
                        group: '3_install',
                        order: 1
                    }],
                run: async (accessor) => {
                    const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                    const commandService = accessor.get(commands_1.ICommandService);
                    const vsixPaths = await fileDialogService.showOpenDialog({
                        title: (0, nls_1.localize)('installFromVSIX', "Install from VSIX"),
                        filters: [{ name: 'VSIX Extensions', extensions: ['vsix'] }],
                        canSelectFiles: true,
                        canSelectMany: true,
                        openLabel: (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)({ key: 'installButton', comment: ['&& denotes a mnemonic'] }, "&&Install"))
                    });
                    if (vsixPaths) {
                        await commandService.executeCommand(extensions_2.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID, vsixPaths);
                    }
                }
            });
            this.registerExtensionAction({
                id: extensions_2.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
                title: (0, nls_1.localize)('installVSIX', "Install Extension VSIX"),
                menu: [{
                        id: actions_1.MenuId.ExplorerContext,
                        group: 'extensions',
                        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.Extension.isEqualTo('.vsix'), contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER)),
                    }],
                run: async (accessor, resources) => {
                    const extensionService = accessor.get(extensions_3.IExtensionService);
                    const extensionsWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const hostService = accessor.get(host_1.IHostService);
                    const notificationService = accessor.get(notification_1.INotificationService);
                    const extensions = Array.isArray(resources) ? resources : [resources];
                    await async_1.Promises.settled(extensions.map(async (vsix) => await extensionsWorkbenchService.install(vsix)))
                        .then(async (extensions) => {
                        for (const extension of extensions) {
                            const requireReload = !(extension.local && extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local)));
                            const message = requireReload ? (0, nls_1.localize)('InstallVSIXAction.successReload', "Completed installing {0} extension from VSIX. Please reload Visual Studio Code to enable it.", extension.displayName || extension.name)
                                : (0, nls_1.localize)('InstallVSIXAction.success', "Completed installing {0} extension from VSIX.", extension.displayName || extension.name);
                            const actions = requireReload ? [{
                                    label: (0, nls_1.localize)('InstallVSIXAction.reloadNow', "Reload Now"),
                                    run: () => hostService.reload()
                                }] : [];
                            notificationService.prompt(notification_1.Severity.Info, message, actions);
                        }
                    });
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.installExtensionFromLocation',
                title: (0, nls_1.localize2)('installExtensionFromLocation', 'Install Extension from Location...'),
                category: actionCommonCategories_1.Categories.Developer,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_WEB_SERVER, exports.CONTEXT_HAS_LOCAL_SERVER)
                    }],
                run: async (accessor) => {
                    const extensionManagementService = accessor.get(extensionManagement_2.IWorkbenchExtensionManagementService);
                    if (platform_2.isWeb) {
                        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                        const disposables = new lifecycle_1.DisposableStore();
                        const quickPick = disposables.add(quickInputService.createQuickPick());
                        quickPick.title = (0, nls_1.localize)('installFromLocation', "Install Extension from Location");
                        quickPick.customButton = true;
                        quickPick.customLabel = (0, nls_1.localize)('install button', "Install");
                        quickPick.placeholder = (0, nls_1.localize)('installFromLocationPlaceHolder', "Location of the web extension");
                        quickPick.ignoreFocusOut = true;
                        disposables.add(event_1.Event.any(quickPick.onDidAccept, quickPick.onDidCustom)(() => {
                            quickPick.hide();
                            if (quickPick.value) {
                                extensionManagementService.installFromLocation(uri_1.URI.parse(quickPick.value));
                            }
                        }));
                        disposables.add(quickPick.onDidHide(() => disposables.dispose()));
                        quickPick.show();
                    }
                    else {
                        const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                        const extensionLocation = await fileDialogService.showOpenDialog({
                            canSelectFolders: true,
                            canSelectFiles: false,
                            canSelectMany: false,
                            title: (0, nls_1.localize)('installFromLocation', "Install Extension from Location"),
                        });
                        if (extensionLocation?.[0]) {
                            extensionManagementService.installFromLocation(extensionLocation[0]);
                        }
                    }
                }
            });
            const extensionsFilterSubMenu = new actions_1.MenuId('extensionsFilterSubMenu');
            actions_1.MenuRegistry.appendMenuItem(extensions_2.extensionsSearchActionsMenu, {
                submenu: extensionsFilterSubMenu,
                title: (0, nls_1.localize)('filterExtensions', "Filter Extensions..."),
                group: 'navigation',
                order: 2,
                icon: extensionsIcons_1.filterIcon,
            });
            const showFeaturedExtensionsId = 'extensions.filter.featured';
            this.registerExtensionAction({
                id: showFeaturedExtensionsId,
                title: (0, nls_1.localize2)('showFeaturedExtensions', 'Show Featured Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 1,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('featured filter', "Featured")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@featured '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showPopularExtensions',
                title: (0, nls_1.localize2)('showPopularExtensions', 'Show Popular Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('most popular filter', "Most Popular")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@popular '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showRecommendedExtensions',
                title: (0, nls_1.localize2)('showRecommendedExtensions', 'Show Recommended Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('most popular recommended', "Recommended")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recommended '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.recentlyPublishedExtensions',
                title: (0, nls_1.localize2)('recentlyPublishedExtensions', 'Show Recently Published Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: extensions_2.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('recently published filter', "Recently Published")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recentlyPublished '))
            });
            const extensionsCategoryFilterSubMenu = new actions_1.MenuId('extensionsCategoryFilterSubMenu');
            actions_1.MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
                submenu: extensionsCategoryFilterSubMenu,
                title: (0, nls_1.localize)('filter by category', "Category"),
                when: extensions_2.CONTEXT_HAS_GALLERY,
                group: '2_categories',
                order: 1,
            });
            extensions_4.EXTENSION_CATEGORIES.map((category, index) => {
                this.registerExtensionAction({
                    id: `extensions.actions.searchByCategory.${category}`,
                    title: category,
                    menu: [{
                            id: extensionsCategoryFilterSubMenu,
                            when: extensions_2.CONTEXT_HAS_GALLERY,
                            order: index,
                        }],
                    run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, `@category:"${category.toLowerCase()}"`))
                });
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.listBuiltInExtensions',
                title: (0, nls_1.localize2)('showBuiltInExtensions', 'Show Built-in Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('builtin filter', "Built-in")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@builtin '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.extensionUpdates',
                title: (0, nls_1.localize2)('extensionUpdates', 'Show Extension Updates'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                precondition: extensions_2.CONTEXT_HAS_GALLERY,
                f1: true,
                menu: [{
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        when: extensions_2.CONTEXT_HAS_GALLERY,
                        order: 1,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('extension updates filter', "Updates")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@updates'))
            });
            this.registerExtensionAction({
                id: extensions_2.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID,
                title: (0, nls_1.localize2)('showWorkspaceUnsupportedExtensions', 'Show Extensions Unsupported By Workspace'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER),
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 5,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER),
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('workspace unsupported filter', "Workspace Unsupported")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@workspaceUnsupported'))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showEnabledExtensions',
                title: (0, nls_1.localize2)('showEnabledExtensions', 'Show Enabled Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 3,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('enabled filter', "Enabled")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@enabled '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showDisabledExtensions',
                title: (0, nls_1.localize2)('showDisabledExtensions', 'Show Disabled Extensions'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER)
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 4,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)('disabled filter', "Disabled")
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@disabled '))
            });
            const extensionsSortSubMenu = new actions_1.MenuId('extensionsSortSubMenu');
            actions_1.MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
                submenu: extensionsSortSubMenu,
                title: (0, nls_1.localize)('sorty by', "Sort By"),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(extensions_2.CONTEXT_HAS_GALLERY, extensionsViewlet_1.DefaultViewsContext)),
                group: '4_sort',
                order: 1,
            });
            [
                { id: 'installs', title: (0, nls_1.localize)('sort by installs', "Install Count"), precondition: extensionsViewlet_1.BuiltInExtensionsContext.negate() },
                { id: 'rating', title: (0, nls_1.localize)('sort by rating', "Rating"), precondition: extensionsViewlet_1.BuiltInExtensionsContext.negate() },
                { id: 'name', title: (0, nls_1.localize)('sort by name', "Name"), precondition: extensionsViewlet_1.BuiltInExtensionsContext.negate() },
                { id: 'publishedDate', title: (0, nls_1.localize)('sort by published date', "Published Date"), precondition: extensionsViewlet_1.BuiltInExtensionsContext.negate() },
                { id: 'updateDate', title: (0, nls_1.localize)('sort by update date', "Updated Date"), precondition: contextkey_1.ContextKeyExpr.and(extensionsViewlet_1.SearchMarketplaceExtensionsContext.negate(), extensionsViewlet_1.RecommendedExtensionsContext.negate(), extensionsViewlet_1.BuiltInExtensionsContext.negate()) },
            ].map(({ id, title, precondition }, index) => {
                this.registerExtensionAction({
                    id: `extensions.sort.${id}`,
                    title,
                    precondition: precondition,
                    menu: [{
                            id: extensionsSortSubMenu,
                            when: contextkey_1.ContextKeyExpr.or(extensions_2.CONTEXT_HAS_GALLERY, extensionsViewlet_1.DefaultViewsContext),
                            order: index,
                        }],
                    toggled: extensionsViewlet_1.ExtensionsSortByContext.isEqualTo(id),
                    run: async () => {
                        const viewlet = await this.paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
                        const extensionsViewPaneContainer = viewlet?.getViewPaneContainer();
                        const currentQuery = extensionQuery_1.Query.parse(extensionsViewPaneContainer.searchValue || '');
                        extensionsViewPaneContainer.search(new extensionQuery_1.Query(currentQuery.value, id).toString());
                        extensionsViewPaneContainer.focus();
                    }
                });
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.clearExtensionsSearchResults',
                title: (0, nls_1.localize2)('clearExtensionsSearchResults', 'Clear Extensions Search Results'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                icon: extensionsIcons_1.clearSearchResultsIcon,
                f1: true,
                precondition: extensionsViewlet_1.SearchHasTextContext,
                menu: {
                    id: extensions_2.extensionsSearchActionsMenu,
                    group: 'navigation',
                    order: 1,
                },
                run: async (accessor) => {
                    const viewPaneContainer = accessor.get(viewsService_1.IViewsService).getActiveViewPaneContainerWithId(extensions_2.VIEWLET_ID);
                    if (viewPaneContainer) {
                        const extensionsViewPaneContainer = viewPaneContainer;
                        extensionsViewPaneContainer.search('');
                        extensionsViewPaneContainer.focus();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.refreshExtension',
                title: (0, nls_1.localize2)('refreshExtension', 'Refresh'),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                icon: extensionsIcons_1.refreshIcon,
                f1: true,
                menu: {
                    id: actions_1.MenuId.ViewContainerTitle,
                    when: contextkey_1.ContextKeyExpr.equals('viewContainer', extensions_2.VIEWLET_ID),
                    group: 'navigation',
                    order: 2
                },
                run: async (accessor) => {
                    const viewPaneContainer = accessor.get(viewsService_1.IViewsService).getActiveViewPaneContainerWithId(extensions_2.VIEWLET_ID);
                    if (viewPaneContainer) {
                        await viewPaneContainer.refresh();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.installWorkspaceRecommendedExtensions',
                title: (0, nls_1.localize)('installWorkspaceRecommendedExtensions', "Install Workspace Recommended Extensions"),
                icon: extensionsIcons_1.installWorkspaceRecommendedIcon,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyExpr.equals('view', extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID),
                    group: 'navigation',
                    order: 1
                },
                run: async (accessor) => {
                    const view = accessor.get(viewsService_1.IViewsService).getActiveViewWithId(extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID);
                    return view.installWorkspaceRecommendations();
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.ID,
                title: extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL,
                icon: extensionsIcons_1.configureRecommendedIcon,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'),
                    }, {
                        id: actions_1.MenuId.ViewTitle,
                        when: contextkey_1.ContextKeyExpr.equals('view', extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID),
                        group: 'navigation',
                        order: 2
                    }],
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction, extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.ID, extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL))
            });
            this.registerExtensionAction({
                id: extensionsActions_1.InstallSpecificVersionOfExtensionAction.ID,
                title: { value: extensionsActions_1.InstallSpecificVersionOfExtensionAction.LABEL, original: 'Install Specific Version of Extension...' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER))
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.InstallSpecificVersionOfExtensionAction, extensionsActions_1.InstallSpecificVersionOfExtensionAction.ID, extensionsActions_1.InstallSpecificVersionOfExtensionAction.LABEL))
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ReinstallAction.ID,
                title: { value: extensionsActions_1.ReinstallAction.LABEL, original: 'Reinstall Extension...' },
                category: actionCommonCategories_1.Categories.Developer,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.or(exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER))
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.ReinstallAction, extensionsActions_1.ReinstallAction.ID, extensionsActions_1.ReinstallAction.LABEL))
            });
        }
        // Extension Context Menu
        registerContextMenuActions() {
            this.registerExtensionAction({
                id: extensionsActions_1.SetColorThemeAction.ID,
                title: extensionsActions_1.SetColorThemeAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.THEME_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasColorThemes'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.SetColorThemeAction);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.SetFileIconThemeAction.ID,
                title: extensionsActions_1.SetFileIconThemeAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.THEME_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasFileIconThemes'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.SetFileIconThemeAction);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.SetProductIconThemeAction.ID,
                title: extensionsActions_1.SetProductIconThemeAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.THEME_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasProductIconThemes'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.SetProductIconThemeAction);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showPreReleaseVersion',
                title: (0, nls_1.localize2)('show pre-release version', 'Show Pre-Release Version'),
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('inExtensionEditor'), contextkey_1.ContextKeyExpr.has('galleryExtensionHasPreReleaseVersion'), contextkey_1.ContextKeyExpr.not('showPreReleaseVersion'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = (await extensionWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    extensionWorkbenchService.open(extension, { showPreReleaseVersion: true });
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showReleasedVersion',
                title: (0, nls_1.localize2)('show released version', 'Show Release Version'),
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 1,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('inExtensionEditor'), contextkey_1.ContextKeyExpr.has('galleryExtensionHasPreReleaseVersion'), contextkey_1.ContextKeyExpr.has('extensionHasReleaseVersion'), contextkey_1.ContextKeyExpr.has('showPreReleaseVersion'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'))
                },
                run: async (accessor, extensionId) => {
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = (await extensionWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    extensionWorkbenchService.open(extension, { showPreReleaseVersion: false });
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ToggleAutoUpdateForExtensionAction.ID,
                title: { value: extensionsActions_1.ToggleAutoUpdateForExtensionAction.LABEL, original: 'Auto Update' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.UPDATE_ACTIONS_GROUP,
                    order: 1,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlySelectedExtensions'), contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, false)))
                },
                run: async (accessor, id) => {
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.ToggleAutoUpdateForExtensionAction, false, []);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ToggleAutoUpdatesForPublisherAction.ID,
                title: { value: extensionsActions_1.ToggleAutoUpdatesForPublisherAction.LABEL, original: 'Auto Update (Publisher)' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.UPDATE_ACTIONS_GROUP,
                    order: 2,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlySelectedExtensions'), contextkey_1.ContextKeyExpr.equals(`config.${extensions_2.AutoUpdateConfigurationKey}`, false)))
                },
                run: async (accessor, id) => {
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.ToggleAutoUpdatesForPublisherAction);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.switchToPreRlease',
                title: (0, nls_1.localize)('enablePreRleaseLabel', "Switch to Pre-Release Version"),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 2,
                    when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.has('galleryExtensionHasPreReleaseVersion'), contextkey_1.ContextKeyExpr.not('installedExtensionIsOptedToPreRelease'), contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'))
                },
                run: async (accessor, id) => {
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.TogglePreReleaseExtensionAction);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.switchToRelease',
                title: (0, nls_1.localize)('disablePreRleaseLabel', "Switch to Release Version"),
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 2,
                    when: contextkey_1.ContextKeyExpr.and(extensions_2.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyExpr.has('galleryExtensionHasPreReleaseVersion'), contextkey_1.ContextKeyExpr.has('installedExtensionIsOptedToPreRelease'), contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.not('isBuiltinExtension'))
                },
                run: async (accessor, id) => {
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extensionWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = extensionWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
                    if (extension) {
                        const action = instantiationService.createInstance(extensionsActions_1.TogglePreReleaseExtensionAction);
                        action.extension = extension;
                        return action.run();
                    }
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ClearLanguageAction.ID,
                title: extensionsActions_1.ClearLanguageAction.TITLE,
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: extensions_2.INSTALL_ACTIONS_GROUP,
                    order: 0,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('inExtensionEditor'), contextkey_1.ContextKeyExpr.has('canSetLanguage'), contextkey_1.ContextKeyExpr.has('isActiveLanguagePackExtension'))
                },
                run: async (accessor, extensionId) => {
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const extensionsWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const extension = (await extensionsWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    const action = instantiationService.createInstance(extensionsActions_1.ClearLanguageAction);
                    action.extension = extension;
                    return action.run();
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.copyExtension',
                title: (0, nls_1.localize2)('workbench.extensions.action.copyExtension', 'Copy'),
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '1_copy'
                },
                run: async (accessor, extensionId) => {
                    const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                    const extension = this.extensionsWorkbenchService.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }))[0]
                        || (await this.extensionsWorkbenchService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
                    if (extension) {
                        const name = (0, nls_1.localize)('extensionInfoName', 'Name: {0}', extension.displayName);
                        const id = (0, nls_1.localize)('extensionInfoId', 'Id: {0}', extensionId);
                        const description = (0, nls_1.localize)('extensionInfoDescription', 'Description: {0}', extension.description);
                        const verision = (0, nls_1.localize)('extensionInfoVersion', 'Version: {0}', extension.version);
                        const publisher = (0, nls_1.localize)('extensionInfoPublisher', 'Publisher: {0}', extension.publisherDisplayName);
                        const link = extension.url ? (0, nls_1.localize)('extensionInfoVSMarketplaceLink', 'VS Marketplace Link: {0}', `${extension.url}`) : null;
                        const clipboardStr = `${name}\n${id}\n${description}\n${verision}\n${publisher}${link ? '\n' + link : ''}`;
                        await clipboardService.writeText(clipboardStr);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.copyExtensionId',
                title: (0, nls_1.localize2)('workbench.extensions.action.copyExtensionId', 'Copy Extension ID'),
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '1_copy'
                },
                run: async (accessor, id) => accessor.get(clipboardService_1.IClipboardService).writeText(id)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.configure',
                title: (0, nls_1.localize2)('workbench.extensions.action.configure', 'Extension Settings'),
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasConfiguration')),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(preferences_1.IPreferencesService).openSettings({ jsonEditor: false, query: `@ext:${id}` })
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.configureKeybindings',
                title: (0, nls_1.localize2)('workbench.extensions.action.configureKeybindings', 'Extension Keyboard Shortcuts'),
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasKeybindings')),
                    order: 2
                },
                run: async (accessor, id) => accessor.get(preferences_1.IPreferencesService).openGlobalKeybindingSettings(false, { query: `@ext:${id}` })
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.toggleApplyToAllProfiles',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.toggleApplyToAllProfiles', "Apply Extension to all Profiles"), original: `Apply Extension to all Profiles` },
                toggled: contextkey_1.ContextKeyExpr.has('isApplicationScopedExtension'),
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('isDefaultApplicationScopedExtension').negate(), contextkey_1.ContextKeyExpr.has('isBuiltinExtension').negate()),
                    order: 3
                },
                run: async (accessor, id) => {
                    const extension = this.extensionsWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id }, e.identifier));
                    if (extension) {
                        return this.extensionsWorkbenchService.toggleApplyExtensionToAllProfiles(extension);
                    }
                }
            });
            this.registerExtensionAction({
                id: extensions_2.TOGGLE_IGNORE_EXTENSION_ACTION_ID,
                title: { value: (0, nls_1.localize)('workbench.extensions.action.toggleIgnoreExtension', "Sync This Extension"), original: `Sync This Extension` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(userDataSync_1.CONTEXT_SYNC_ENABLEMENT),
                    order: 4
                },
                run: async (accessor, id) => {
                    const extension = this.extensionsWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id }, e.identifier));
                    if (extension) {
                        return this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(extension);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.ignoreRecommendation',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.ignoreRecommendation', "Ignore Recommendation"), original: `Ignore Recommendation` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.has('isExtensionRecommended'),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id, true)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.undoIgnoredRecommendation',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.undoIgnoredRecommendation', "Undo Ignored Recommendation"), original: `Undo Ignored Recommendation` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.has('isUserIgnoredRecommendation'),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id, false)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addExtensionToWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addExtensionToWorkspaceRecommendations', "Add to Workspace Recommendations"), original: `Add to Workspace Recommendations` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.has('isBuiltinExtension').negate(), contextkey_1.ContextKeyExpr.has('isExtensionWorkspaceRecommended').negate(), contextkey_1.ContextKeyExpr.has('isUserIgnoredRecommendation').negate()),
                    order: 2
                },
                run: (accessor, id) => accessor.get(workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService).toggleRecommendation(id)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.removeExtensionFromWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.removeExtensionFromWorkspaceRecommendations', "Remove from Workspace Recommendations"), original: `Remove from Workspace Recommendations` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.has('isBuiltinExtension').negate(), contextkey_1.ContextKeyExpr.has('isExtensionWorkspaceRecommended')),
                    order: 2
                },
                run: (accessor, id) => accessor.get(workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService).toggleRecommendation(id)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addToWorkspaceRecommendations', "Add Extension to Workspace Recommendations"), original: `Add Extension to Workspace Recommendations` },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                async run(accessor) {
                    const editorService = accessor.get(editorService_1.IEditorService);
                    const workspaceExtensionsConfigService = accessor.get(workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService);
                    if (!(editorService.activeEditor instanceof extensionsInput_1.ExtensionsInput)) {
                        return;
                    }
                    const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
                    const recommendations = await workspaceExtensionsConfigService.getRecommendations();
                    if (recommendations.includes(extensionId)) {
                        return;
                    }
                    await workspaceExtensionsConfigService.toggleRecommendation(extensionId);
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceFolderRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addToWorkspaceFolderRecommendations', "Add Extension to Workspace Folder Recommendations"), original: `Add Extension to Workspace Folder Recommendations` },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('folder'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                run: () => this.commandService.executeCommand('workbench.extensions.action.addToWorkspaceRecommendations')
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceIgnoredRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addToWorkspaceIgnoredRecommendations', "Add Extension to Workspace Ignored Recommendations"), original: `Add Extension to Workspace Ignored Recommendations` },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                async run(accessor) {
                    const editorService = accessor.get(editorService_1.IEditorService);
                    const workspaceExtensionsConfigService = accessor.get(workspaceExtensionsConfig_1.IWorkspaceExtensionsConfigService);
                    if (!(editorService.activeEditor instanceof extensionsInput_1.ExtensionsInput)) {
                        return;
                    }
                    const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
                    const unwantedRecommendations = await workspaceExtensionsConfigService.getUnwantedRecommendations();
                    if (unwantedRecommendations.includes(extensionId)) {
                        return;
                    }
                    await workspaceExtensionsConfigService.toggleUnwantedRecommendation(extensionId);
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceFolderIgnoredRecommendations',
                title: { value: (0, nls_1.localize)('workbench.extensions.action.addToWorkspaceFolderIgnoredRecommendations', "Add Extension to Workspace Folder Ignored Recommendations"), original: `Add Extension to Workspace Folder Ignored Recommendations` },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('folder'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                run: () => this.commandService.executeCommand('workbench.extensions.action.addToWorkspaceIgnoredRecommendations')
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.ID,
                title: { value: extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.LABEL, original: 'Configure Recommended Extensions (Workspace)' },
                category: (0, nls_1.localize)('extensions', "Extensions"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'),
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction, extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.ID, extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.LABEL))
            });
        }
        registerExtensionAction(extensionActionOptions) {
            const menus = extensionActionOptions.menu ? Array.isArray(extensionActionOptions.menu) ? extensionActionOptions.menu : [extensionActionOptions.menu] : [];
            let menusWithOutTitles = [];
            const menusWithTitles = [];
            if (extensionActionOptions.menuTitles) {
                for (let index = 0; index < menus.length; index++) {
                    const menu = menus[index];
                    const menuTitle = extensionActionOptions.menuTitles[menu.id.id];
                    if (menuTitle) {
                        menusWithTitles.push({ id: menu.id, item: { ...menu, command: { id: extensionActionOptions.id, title: menuTitle } } });
                    }
                    else {
                        menusWithOutTitles.push(menu);
                    }
                }
            }
            else {
                menusWithOutTitles = menus;
            }
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        ...extensionActionOptions,
                        menu: menusWithOutTitles
                    });
                }
                run(accessor, ...args) {
                    return extensionActionOptions.run(accessor, ...args);
                }
            }));
            if (menusWithTitles.length) {
                disposables.add(actions_1.MenuRegistry.appendMenuItems(menusWithTitles));
            }
            return disposables;
        }
    };
    ExtensionsContributions = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, panecomposite_1.IPaneCompositePartService),
        __param(4, extensions_2.IExtensionsWorkbenchService),
        __param(5, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, dialogs_1.IDialogService),
        __param(8, commands_1.ICommandService)
    ], ExtensionsContributions);
    let ExtensionStorageCleaner = class ExtensionStorageCleaner {
        constructor(extensionManagementService, storageService) {
            extensionStorage_1.ExtensionStorageService.removeOutdatedExtensionVersions(extensionManagementService, storageService);
        }
    };
    ExtensionStorageCleaner = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, storage_1.IStorageService)
    ], ExtensionStorageCleaner);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.StatusUpdater, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.MaliciousExtensionChecker, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsUtils_1.KeymapExtensions, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.ExtensionsViewletViewsContribution, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsActivationProgress_1.ExtensionActivationProgress, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsDependencyChecker_1.ExtensionDependencyChecker, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionEnablementWorkspaceTrustTransitionParticipant_1.ExtensionEnablementWorkspaceTrustTransitionParticipant, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsCompletionItemsProvider_1.ExtensionsCompletionItemsProvider, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(unsupportedExtensionsMigrationContribution_1.UnsupportedExtensionsMigrationContrib, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(deprecatedExtensionsChecker_1.DeprecatedExtensionsChecker, 4 /* LifecyclePhase.Eventually */);
    if (platform_2.isWeb) {
        workbenchRegistry.registerWorkbenchContribution(ExtensionStorageCleaner, 4 /* LifecyclePhase.Eventually */);
    }
    // Running Extensions
    (0, actions_1.registerAction2)(abstractRuntimeExtensionsEditor_1.ShowRuntimeExtensionsAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25zLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUErRWhHLGFBQWE7SUFDYixJQUFBLDhCQUFpQixFQUFDLHdDQUEyQixFQUFFLHVEQUEwQixrQ0FBd0QsQ0FBQztJQUNsSSxJQUFBLDhCQUFpQixFQUFDLHNFQUEyQyxFQUFFLHVGQUEwQyxvQ0FBNEIsQ0FBQztJQUN0SSxJQUFBLDhCQUFpQixFQUFDLDJEQUFnQyxFQUFFLGlFQUErQixrQ0FBMEUsQ0FBQztJQUU5SixlQUFlO0lBQ2YsbUJBQVEsQ0FBQyxFQUFFLENBQXVCLHdCQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsMkJBQTJCLENBQUM7UUFDckYsSUFBSSxFQUFFLDJEQUFtQztRQUN6QyxNQUFNLEVBQUUsMkRBQW1DLENBQUMsTUFBTTtRQUNsRCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0NBQXdDLEVBQUUsbUNBQW1DLENBQUM7UUFDcEcsV0FBVyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsbUJBQW1CLENBQUMsRUFBRSxDQUFDO0tBQ3JGLENBQUMsQ0FBQztJQUVILFNBQVM7SUFDVCxtQkFBUSxDQUFDLEVBQUUsQ0FBc0IseUJBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsa0JBQWtCLENBQy9FLDZCQUFvQixDQUFDLE1BQU0sQ0FDMUIsaUNBQWUsRUFDZixpQ0FBZSxDQUFDLEVBQUUsRUFDbEIsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUNsQyxFQUNEO1FBQ0MsSUFBSSw0QkFBYyxDQUFDLGlD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
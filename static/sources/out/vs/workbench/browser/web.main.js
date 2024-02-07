/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/performance", "vs/base/browser/dom", "vs/base/common/types", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/log/browser/log", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/browser/workbench", "vs/workbench/services/remote/common/remoteFileSystemProviderClient", "vs/platform/product/common/productService", "vs/platform/product/common/product", "vs/workbench/services/remote/browser/remoteAgentService", "vs/platform/remote/browser/remoteAuthorityResolverService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "vs/base/common/errors", "vs/base/browser/browser", "vs/base/common/uri", "vs/workbench/services/configuration/browser/configurationService", "vs/workbench/services/configuration/common/configurationCache", "vs/platform/sign/common/sign", "vs/platform/sign/browser/signService", "vs/workbench/services/storage/browser/storageService", "vs/platform/storage/common/storage", "vs/base/common/date", "vs/platform/window/common/window", "vs/workbench/services/workspaces/browser/workspaces", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/commands/common/commands", "vs/platform/files/browser/indexedDBFileSystemProvider", "vs/workbench/services/request/browser/requestService", "vs/platform/request/common/request", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/host/browser/host", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/browser/window", "vs/workbench/services/timer/browser/timerService", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/platform/workspace/common/workspaceTrust", "vs/platform/files/browser/htmlFileSystemProvider", "vs/platform/opener/common/opener", "vs/base/common/objects", "vs/base/browser/indexedDB", "vs/platform/files/browser/webFileSystemAccess", "vs/platform/telemetry/common/telemetry", "vs/platform/progress/common/progress", "vs/workbench/services/output/common/delayedLogChannel", "vs/base/common/resources", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/policy/common/policy", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/tunnel/common/tunnel", "vs/platform/label/common/label", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/browser/userDataProfile", "vs/base/common/async", "vs/workbench/services/log/common/logConstants", "vs/platform/log/common/logService", "vs/platform/remote/common/remoteSocketFactoryService", "vs/platform/remote/browser/browserSocketFactory", "vs/base/common/buffer", "vs/workbench/services/userDataProfile/browser/userDataProfileInit", "vs/workbench/services/userDataSync/browser/userDataSyncInit", "vs/workbench/services/remote/browser/browserRemoteResourceHandler", "vs/platform/log/common/bufferLog", "vs/platform/log/common/fileLog", "vs/workbench/services/terminal/common/embedderTerminalService", "vs/workbench/services/secrets/browser/secretStorageService", "vs/workbench/services/encryption/browser/encryptionService", "vs/platform/encryption/common/encryptionService", "vs/platform/secrets/common/secrets", "vs/workbench/services/remote/common/tunnelModel", "vs/base/browser/window"], function (require, exports, performance_1, dom_1, types_1, serviceCollection_1, log_1, log_2, lifecycle_1, environmentService_1, workbench_1, remoteFileSystemProviderClient_1, productService_1, product_1, remoteAgentService_1, remoteAuthorityResolverService_1, remoteAuthorityResolver_1, remoteAgentService_2, files_1, fileService_1, network_1, workspace_1, configuration_1, errors_1, browser_1, uri_1, configurationService_1, configurationCache_1, sign_1, signService_1, storageService_1, storage_1, date_1, window_1, workspaces_1, inMemoryFilesystemProvider_1, commands_1, indexedDBFileSystemProvider_1, requestService_1, request_1, userDataInit_1, userDataSyncStoreService_1, userDataSync_1, lifecycle_2, actions_1, instantiation_1, nls_1, actionCommonCategories_1, dialogs_1, host_1, uriIdentity_1, uriIdentityService_1, window_2, timerService_1, workspaceTrust_1, workspaceTrust_2, htmlFileSystemProvider_1, opener_1, objects_1, indexedDB_1, webFileSystemAccess_1, telemetry_1, progress_1, delayedLogChannel_1, resources_1, userDataProfile_1, policy_1, remoteExplorerService_1, tunnel_1, label_1, userDataProfileService_1, userDataProfile_2, userDataProfile_3, async_1, logConstants_1, logService_1, remoteSocketFactoryService_1, browserSocketFactory_1, buffer_1, userDataProfileInit_1, userDataSyncInit_1, browserRemoteResourceHandler_1, bufferLog_1, fileLog_1, embedderTerminalService_1, secretStorageService_1, encryptionService_1, encryptionService_2, secrets_1, tunnelModel_1, window_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserMain = void 0;
    class BrowserMain extends lifecycle_1.Disposable {
        constructor(domElement, configuration) {
            super();
            this.domElement = domElement;
            this.configuration = configuration;
            this.onWillShutdownDisposables = this._register(new lifecycle_1.DisposableStore());
            this.indexedDBFileSystemProviders = [];
            this.init();
        }
        init() {
            // Browser config
            (0, browser_1.setFullscreen)(!!(0, dom_1.detectFullscreen)(window_3.mainWindow), window_3.mainWindow);
        }
        async open() {
            // Init services and wait for DOM to be ready in parallel
            const [services] = await Promise.all([this.initServices(), (0, dom_1.domContentLoaded)((0, dom_1.getWindow)(this.domElement))]);
            // Create Workbench
            const workbench = new workbench_1.Workbench(this.domElement, undefined, services.serviceCollection, services.logService);
            // Listeners
            this.registerListeners(workbench);
            // Startup
            const instantiationService = workbench.startup();
            // Window
            this._register(instantiationService.createInstance(window_2.BrowserWindow));
            // Logging
            services.logService.trace('workbench#open with configuration', (0, objects_1.safeStringify)(this.configuration));
            instantiationService.invokeFunction(accessor => {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                for (const indexedDbFileSystemProvider of this.indexedDBFileSystemProviders) {
                    this._register(indexedDbFileSystemProvider.onReportError(e => telemetryService.publicLog2('indexedDBFileSystemProviderError', e)));
                }
            });
            // Return API Facade
            return instantiationService.invokeFunction(accessor => {
                const commandService = accessor.get(commands_1.ICommandService);
                const lifecycleService = accessor.get(lifecycle_2.ILifecycleService);
                const timerService = accessor.get(timerService_1.ITimerService);
                const openerService = accessor.get(opener_1.IOpenerService);
                const productService = accessor.get(productService_1.IProductService);
                const progressService = accessor.get(progress_1.IProgressService);
                const environmentService = accessor.get(environmentService_1.IBrowserWorkbenchEnvironmentService);
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const labelService = accessor.get(label_1.ILabelService);
                const embedderTerminalService = accessor.get(embedderTerminalService_1.IEmbedderTerminalService);
                let logger = undefined;
                return {
                    commands: {
                        executeCommand: (command, ...args) => commandService.executeCommand(command, ...args)
                    },
                    env: {
                        async getUriScheme() {
                            return productService.urlProtocol;
                        },
                        async retrievePerformanceMarks() {
                            await timerService.whenReady();
                            return timerService.getPerformanceMarks();
                        },
                        async openUri(uri) {
                            return openerService.open(uri, {});
                        }
                    },
                    logger: {
                        log: (level, message) => {
                            if (!logger) {
                                logger = instantiationService.createInstance(delayedLogChannel_1.DelayedLogChannel, 'webEmbedder', productService.embedderIdentifier || productService.nameShort, (0, resources_1.joinPath)((0, resources_1.dirname)(environmentService.logFile), 'webEmbedder.log'));
                            }
                            logger.log(level, message);
                        }
                    },
                    window: {
                        withProgress: (options, task) => progressService.withProgress(options, task),
                        createTerminal: async (options) => embedderTerminalService.createTerminal(options),
                    },
                    workspace: {
                        openTunnel: async (tunnelOptions) => {
                            const tunnel = (0, types_1.assertIsDefined)(await remoteExplorerService.forward({
                                remote: tunnelOptions.remoteAddress,
                                local: tunnelOptions.localAddressPort,
                                name: tunnelOptions.label,
                                source: {
                                    source: tunnelModel_1.TunnelSource.Extension,
                                    description: labelService.getHostLabel(network_1.Schemas.vscodeRemote, this.configuration.remoteAuthority)
                                },
                                elevateIfNeeded: false,
                                privacy: tunnelOptions.privacy
                            }, {
                                label: tunnelOptions.label,
                                elevateIfNeeded: undefined,
                                onAutoForward: undefined,
                                requireLocalPort: undefined,
                                protocol: tunnelOptions.protocol === tunnel_1.TunnelProtocol.Https ? tunnelOptions.protocol : tunnel_1.TunnelProtocol.Http
                            }));
                            if (typeof tunnel === 'string') {
                                throw new Error(tunnel);
                            }
                            return new class extends tunnel_1.DisposableTunnel {
                            }({
                                port: tunnel.tunnelRemotePort,
                                host: tunnel.tunnelRemoteHost
                            }, tunnel.localAddress, () => tunnel.dispose());
                        }
                    },
                    shutdown: () => lifecycleService.shutdown()
                };
            });
        }
        registerListeners(workbench) {
            // Workbench Lifecycle
            this._register(workbench.onWillShutdown(() => this.onWillShutdownDisposables.clear()));
            this._register(workbench.onDidShutdown(() => this.dispose()));
        }
        async initServices() {
            const serviceCollection = new serviceCollection_1.ServiceCollection();
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const workspace = this.resolveWorkspace();
            // Product
            const productService = (0, objects_1.mixin)({ _serviceBrand: undefined, ...product_1.default }, this.configuration.productConfiguration);
            serviceCollection.set(productService_1.IProductService, productService);
            // Environment
            const logsPath = uri_1.URI.file((0, date_1.toLocalISOString)(new Date()).replace(/-|:|\.\d+Z$/g, '')).with({ scheme: 'vscode-log' });
            const environmentService = new environmentService_1.BrowserWorkbenchEnvironmentService(workspace.id, logsPath, this.configuration, productService);
            serviceCollection.set(environmentService_1.IBrowserWorkbenchEnvironmentService, environmentService);
            // Files
            const fileLogger = new bufferLog_1.BufferLogger();
            const fileService = this._register(new fileService_1.FileService(fileLogger));
            serviceCollection.set(files_1.IFileService, fileService);
            // Logger
            const loggerService = new fileLog_1.FileLoggerService((0, log_1.getLogLevel)(environmentService), logsPath, fileService);
            serviceCollection.set(log_1.ILoggerService, loggerService);
            // Log Service
            const otherLoggers = [new log_1.ConsoleLogger(loggerService.getLogLevel())];
            if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
                otherLoggers.push(new log_2.ConsoleLogInAutomationLogger(loggerService.getLogLevel()));
            }
            const logger = loggerService.createLogger(environmentService.logFile, { id: logConstants_1.windowLogId, name: (0, nls_1.localize)('rendererLog', "Window") });
            const logService = new logService_1.LogService(logger, otherLoggers);
            serviceCollection.set(log_1.ILogService, logService);
            // Set the logger of the fileLogger after the log service is ready.
            // This is to avoid cyclic dependency
            fileLogger.logger = logService;
            // Register File System Providers depending on IndexedDB support
            // Register them early because they are needed for the profiles initialization
            await this.registerIndexedDBFileSystemProviders(environmentService, fileService, logService, loggerService, logsPath);
            // Remote
            const connectionToken = environmentService.options.connectionToken || (0, dom_1.getCookieValue)(network_1.connectionTokenCookieName);
            const remoteResourceLoader = this.configuration.remoteResourceProvider ? new browserRemoteResourceHandler_1.BrowserRemoteResourceLoader(fileService, this.configuration.remoteResourceProvider) : undefined;
            const resourceUriProvider = this.configuration.resourceUriProvider ?? remoteResourceLoader?.getResourceUriProvider();
            const remoteAuthorityResolverService = new remoteAuthorityResolverService_1.RemoteAuthorityResolverService(!environmentService.expectsResolverExtension, connectionToken, resourceUriProvider, productService, logService);
            serviceCollection.set(remoteAuthorityResolver_1.IRemoteAuthorityResolverService, remoteAuthorityResolverService);
            // Signing
            const signService = new signService_1.SignService(productService);
            serviceCollection.set(sign_1.ISignService, signService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // URI Identity
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            serviceCollection.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // User Data Profiles
            const userDataProfilesService = new userDataProfile_3.BrowserUserDataProfilesService(environmentService, fileService, uriIdentityService, logService);
            serviceCollection.set(userDataProfile_1.IUserDataProfilesService, userDataProfilesService);
            const currentProfile = await this.getCurrentProfile(workspace, userDataProfilesService, environmentService);
            const userDataProfileService = new userDataProfileService_1.UserDataProfileService(currentProfile);
            serviceCollection.set(userDataProfile_2.IUserDataProfileService, userDataProfileService);
            // Remote Agent
            const remoteSocketFactoryService = new remoteSocketFactoryService_1.RemoteSocketFactoryService();
            remoteSocketFactoryService.register(0 /* RemoteConnectionType.WebSocket */, new browserSocketFactory_1.BrowserSocketFactory(this.configuration.webSocketFactory));
            serviceCollection.set(remoteSocketFactoryService_1.IRemoteSocketFactoryService, remoteSocketFactoryService);
            const remoteAgentService = this._register(new remoteAgentService_1.RemoteAgentService(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService));
            serviceCollection.set(remoteAgentService_2.IRemoteAgentService, remoteAgentService);
            this._register(remoteFileSystemProviderClient_1.RemoteFileSystemProviderClient.register(remoteAgentService, fileService, logService));
            // Long running services (workspace, config, storage)
            const [configurationService, storageService] = await Promise.all([
                this.createWorkspaceService(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService).then(service => {
                    // Workspace
                    serviceCollection.set(workspace_1.IWorkspaceContextService, service);
                    // Configuration
                    serviceCollection.set(configuration_1.IWorkbenchConfigurationService, service);
                    return service;
                }),
                this.createStorageService(workspace, logService, userDataProfileService).then(service => {
                    // Storage
                    serviceCollection.set(storage_1.IStorageService, service);
                    return service;
                })
            ]);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Workspace Trust Service
            const workspaceTrustEnablementService = new workspaceTrust_1.WorkspaceTrustEnablementService(configurationService, environmentService);
            serviceCollection.set(workspaceTrust_2.IWorkspaceTrustEnablementService, workspaceTrustEnablementService);
            const workspaceTrustManagementService = new workspaceTrust_1.WorkspaceTrustManagementService(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, configurationService, workspaceTrustEnablementService, fileService);
            serviceCollection.set(workspaceTrust_2.IWorkspaceTrustManagementService, workspaceTrustManagementService);
            // Update workspace trust so that configuration is updated accordingly
            configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
            this._register(workspaceTrustManagementService.onDidChangeTrust(() => configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted())));
            // Request Service
            const requestService = new requestService_1.BrowserRequestService(remoteAgentService, configurationService, loggerService);
            serviceCollection.set(request_1.IRequestService, requestService);
            // Userdata Sync Store Management Service
            const userDataSyncStoreManagementService = new userDataSyncStoreService_1.UserDataSyncStoreManagementService(productService, configurationService, storageService);
            serviceCollection.set(userDataSync_1.IUserDataSyncStoreManagementService, userDataSyncStoreManagementService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.web.main.ts` if the service
            //       is web only.
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const encryptionService = new encryptionService_1.EncryptionService();
            serviceCollection.set(encryptionService_2.IEncryptionService, encryptionService);
            const secretStorageService = new secretStorageService_1.BrowserSecretStorageService(storageService, encryptionService, environmentService, logService);
            serviceCollection.set(secrets_1.ISecretStorageService, secretStorageService);
            // Userdata Initialize Service
            const userDataInitializers = [];
            userDataInitializers.push(new userDataSyncInit_1.UserDataSyncInitializer(environmentService, secretStorageService, userDataSyncStoreManagementService, fileService, userDataProfilesService, storageService, productService, requestService, logService, uriIdentityService));
            if (environmentService.options.profile) {
                userDataInitializers.push(new userDataProfileInit_1.UserDataProfileInitializer(environmentService, fileService, userDataProfileService, storageService, logService, uriIdentityService, requestService));
            }
            const userDataInitializationService = new userDataInit_1.UserDataInitializationService(userDataInitializers);
            serviceCollection.set(userDataInit_1.IUserDataInitializationService, userDataInitializationService);
            try {
                await Promise.race([
                    // Do not block more than 5s
                    (0, async_1.timeout)(5000),
                    this.initializeUserData(userDataInitializationService, configurationService)
                ]);
            }
            catch (error) {
                logService.error(error);
            }
            return { serviceCollection, configurationService, logService };
        }
        async initializeUserData(userDataInitializationService, configurationService) {
            if (await userDataInitializationService.requiresInitialization()) {
                (0, performance_1.mark)('code/willInitRequiredUserData');
                // Initialize required resources - settings & global state
                await userDataInitializationService.initializeRequiredResources();
                // Important: Reload only local user configuration after initializing
                // Reloading complete configuration blocks workbench until remote configuration is loaded.
                await configurationService.reloadLocalUserConfiguration();
                (0, performance_1.mark)('code/didInitRequiredUserData');
            }
        }
        async registerIndexedDBFileSystemProviders(environmentService, fileService, logService, loggerService, logsPath) {
            // IndexedDB is used for logging and user data
            let indexedDB;
            const userDataStore = 'vscode-userdata-store';
            const logsStore = 'vscode-logs-store';
            const handlesStore = 'vscode-filehandles-store';
            try {
                indexedDB = await indexedDB_1.IndexedDB.create('vscode-web-db', 3, [userDataStore, logsStore, handlesStore]);
                // Close onWillShutdown
                this.onWillShutdownDisposables.add((0, lifecycle_1.toDisposable)(() => indexedDB?.close()));
            }
            catch (error) {
                logService.error('Error while creating IndexedDB', error);
            }
            // Logger
            if (indexedDB) {
                const logFileSystemProvider = new indexedDBFileSystemProvider_1.IndexedDBFileSystemProvider(logsPath.scheme, indexedDB, logsStore, false);
                this.indexedDBFileSystemProviders.push(logFileSystemProvider);
                fileService.registerProvider(logsPath.scheme, logFileSystemProvider);
            }
            else {
                fileService.registerProvider(logsPath.scheme, new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            }
            // User data
            let userDataProvider;
            if (indexedDB) {
                userDataProvider = new indexedDBFileSystemProvider_1.IndexedDBFileSystemProvider(network_1.Schemas.vscodeUserData, indexedDB, userDataStore, true);
                this.indexedDBFileSystemProviders.push(userDataProvider);
                this.registerDeveloperActions(userDataProvider);
            }
            else {
                logService.info('Using in-memory user data provider');
                userDataProvider = new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider();
            }
            fileService.registerProvider(network_1.Schemas.vscodeUserData, userDataProvider);
            // Local file access (if supported by browser)
            if (webFileSystemAccess_1.WebFileSystemAccess.supported(window_3.mainWindow)) {
                fileService.registerProvider(network_1.Schemas.file, new htmlFileSystemProvider_1.HTMLFileSystemProvider(indexedDB, handlesStore, logService));
            }
            // In-memory
            fileService.registerProvider(network_1.Schemas.tmp, new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
        }
        registerDeveloperActions(provider) {
            (0, actions_1.registerAction2)(class ResetUserDataAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.resetUserData',
                        title: { original: 'Reset User Data', value: (0, nls_1.localize)('reset', "Reset User Data") },
                        category: actionCommonCategories_1.Categories.Developer,
                        menu: {
                            id: actions_1.MenuId.CommandPalette
                        }
                    });
                }
                async run(accessor) {
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const hostService = accessor.get(host_1.IHostService);
                    const storageService = accessor.get(storage_1.IStorageService);
                    const logService = accessor.get(log_1.ILogService);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)('reset user data message', "Would you like to reset your data (settings, keybindings, extensions, snippets and UI State) and reload?")
                    });
                    if (result.confirmed) {
                        try {
                            await provider?.reset();
                            if (storageService instanceof storageService_1.BrowserStorageService) {
                                await storageService.clear();
                            }
                        }
                        catch (error) {
                            logService.error(error);
                            throw error;
                        }
                    }
                    hostService.reload();
                }
            });
        }
        async createStorageService(workspace, logService, userDataProfileService) {
            const storageService = new storageService_1.BrowserStorageService(workspace, userDataProfileService, logService);
            try {
                await storageService.initialize();
                // Register to close on shutdown
                this.onWillShutdownDisposables.add((0, lifecycle_1.toDisposable)(() => storageService.close()));
                return storageService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                logService.error(error);
                return storageService;
            }
        }
        async createWorkspaceService(workspace, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService) {
            // Temporary workspaces do not exist on startup because they are
            // just in memory. As such, detect this case and eagerly create
            // the workspace file empty so that it is a valid workspace.
            if ((0, workspace_1.isWorkspaceIdentifier)(workspace) && (0, workspace_1.isTemporaryWorkspace)(workspace.configPath)) {
                try {
                    const emptyWorkspace = { folders: [] };
                    await fileService.createFile(workspace.configPath, buffer_1.VSBuffer.fromString(JSON.stringify(emptyWorkspace, null, '\t')), { overwrite: false });
                }
                catch (error) {
                    // ignore if workspace file already exists
                }
            }
            const configurationCache = new configurationCache_1.ConfigurationCache([network_1.Schemas.file, network_1.Schemas.vscodeUserData, network_1.Schemas.tmp] /* Cache all non native resources */, environmentService, fileService);
            const workspaceService = new configurationService_1.WorkspaceService({ remoteAuthority: this.configuration.remoteAuthority, configurationCache }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, new policy_1.NullPolicyService());
            try {
                await workspaceService.initialize(workspace);
                return workspaceService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                logService.error(error);
                return workspaceService;
            }
        }
        async getCurrentProfile(workspace, userDataProfilesService, environmentService) {
            if (environmentService.options?.profile) {
                const profile = userDataProfilesService.profiles.find(p => p.name === environmentService.options?.profile?.name);
                if (profile) {
                    return profile;
                }
                return userDataProfilesService.createNamedProfile(environmentService.options?.profile?.name, undefined, workspace);
            }
            return userDataProfilesService.getProfileForWorkspace(workspace) ?? userDataProfilesService.defaultProfile;
        }
        resolveWorkspace() {
            let workspace = undefined;
            if (this.configuration.workspaceProvider) {
                workspace = this.configuration.workspaceProvider.workspace;
            }
            // Multi-root workspace
            if (workspace && (0, window_1.isWorkspaceToOpen)(workspace)) {
                return (0, workspaces_1.getWorkspaceIdentifier)(workspace.workspaceUri);
            }
            // Single-folder workspace
            if (workspace && (0, window_1.isFolderToOpen)(workspace)) {
                return (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(workspace.folderUri);
            }
            // Empty window workspace
            return workspace_1.UNKNOWN_EMPTY_WINDOW_WORKSPACE;
        }
    }
    exports.BrowserMain = BrowserMain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLm1haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3dlYi5tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQStGaEcsTUFBYSxXQUFZLFNBQVEsc0JBQVU7UUFLMUMsWUFDa0IsVUFBdUIsRUFDdkIsYUFBNEM7WUFFN0QsS0FBSyxFQUFFLENBQUM7WUFIUyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3ZCLGtCQUFhLEdBQWIsYUFBYSxDQUErQjtZQUw3Qyw4QkFBeUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFDbEUsaUNBQTRCLEdBQWtDLEVBQUUsQ0FBQztZQVFqRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDYixDQUFDO1FBRU8sSUFBSTtZQUVYLGlCQUFpQjtZQUNqQixJQUFBLHVCQUFhLEVBQUMsQ0FBQyxDQUFDLElBQUEsc0JBQWdCLEVBQUMsbUJBQVUsQ0FBQyxFQUFFLG1CQUFVLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUk7WUFFVCx5REFBeUQ7WUFDekQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFBLHNCQUFnQixFQUFDLElBQUEsZUFBUyxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxRyxtQkFBbUI7WUFDbkIsTUFBTSxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFN0csWUFBWTtZQUNaLElBQUksQ0FB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
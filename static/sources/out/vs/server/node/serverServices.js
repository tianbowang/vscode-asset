/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/node/id", "vs/base/node/pfs", "vs/base/parts/ipc/common/ipc", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/debug/common/extensionHostDebugIpc", "vs/platform/download/common/download", "vs/platform/download/common/downloadIpc", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/node/languagePacks", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/request/common/requestIpc", "vs/platform/request/node/requestService", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/node/errorTelemetry", "vs/platform/terminal/common/terminal", "vs/platform/terminal/node/ptyHostService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/server/node/remoteAgentEnvironmentImpl", "vs/server/node/remoteFileSystemProviderServer", "vs/platform/telemetry/common/remoteTelemetryChannel", "vs/platform/telemetry/common/serverTelemetryService", "vs/server/node/remoteTerminalChannel", "vs/workbench/api/node/uriTransformer", "vs/server/node/serverEnvironmentService", "vs/workbench/contrib/terminal/common/remote/remoteTerminalChannel", "vs/workbench/services/remote/common/remoteFileSystemProviderClient", "vs/server/node/extensionHostStatusService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/server/node/extensionsScannerService", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/policy/common/policy", "vs/platform/telemetry/node/1dsAppender", "vs/platform/log/node/loggerService", "vs/platform/userDataProfile/node/userDataProfile", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/common/logService", "vs/platform/log/common/logIpc", "vs/nls", "vs/server/node/remoteExtensionsScanner", "vs/platform/remote/common/remoteExtensionsScanner", "vs/platform/userDataProfile/common/userDataProfileIpc", "vs/platform/terminal/node/nodePtyHostStarter"], function (require, exports, os_1, event_1, lifecycle_1, network_1, path, id_1, pfs_1, ipc_1, configuration_1, configurationService_1, extensionHostDebugIpc_1, download_1, downloadIpc_1, environment_1, extensionGalleryService_1, extensionManagement_1, extensionSignatureVerificationService_1, extensionManagementCLI_1, extensionManagementIpc_1, extensionManagementService_1, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiationService_1, serviceCollection_1, languagePacks_1, languagePacks_2, log_1, product_1, productService_1, request_1, requestIpc_1, requestService_1, commonProperties_1, telemetry_1, telemetryUtils_1, errorTelemetry_1, terminal_1, ptyHostService_1, uriIdentity_1, uriIdentityService_1, remoteAgentEnvironmentImpl_1, remoteFileSystemProviderServer_1, remoteTelemetryChannel_1, serverTelemetryService_1, remoteTerminalChannel_1, uriTransformer_1, serverEnvironmentService_1, remoteTerminalChannel_2, remoteFileSystemProviderClient_1, extensionHostStatusService_1, extensionsScannerService_1, extensionsScannerService_2, extensionsProfileScannerService_1, userDataProfile_1, policy_1, _1dsAppender_1, loggerService_1, userDataProfile_2, extensionsProfileScannerService_2, logService_1, logIpc_1, nls_1, remoteExtensionsScanner_1, remoteExtensionsScanner_2, userDataProfileIpc_1, nodePtyHostStarter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SocketServer = exports.setupServerServices = void 0;
    const eventPrefix = 'monacoworkbench';
    async function setupServerServices(connectionToken, args, REMOTE_DATA_FOLDER, disposables) {
        const services = new serviceCollection_1.ServiceCollection();
        const socketServer = new SocketServer();
        const productService = { _serviceBrand: undefined, ...product_1.default };
        services.set(productService_1.IProductService, productService);
        const environmentService = new serverEnvironmentService_1.ServerEnvironmentService(args, productService);
        services.set(environment_1.IEnvironmentService, environmentService);
        services.set(environment_1.INativeEnvironmentService, environmentService);
        const loggerService = new loggerService_1.LoggerService((0, log_1.getLogLevel)(environmentService), environmentService.logsHome);
        services.set(log_1.ILoggerService, loggerService);
        socketServer.registerChannel('logger', new logIpc_1.LoggerChannel(loggerService, (ctx) => getUriTransformer(ctx.remoteAuthority)));
        const logger = loggerService.createLogger('remoteagent', { name: (0, nls_1.localize)('remoteExtensionLog', "Server") });
        const logService = new logService_1.LogService(logger, [new ServerLogger((0, log_1.getLogLevel)(environmentService))]);
        services.set(log_1.ILogService, logService);
        setTimeout(() => cleanupOlderLogs(environmentService.logsHome.with({ scheme: network_1.Schemas.file }).fsPath).then(null, err => logService.error(err)), 10000);
        logService.onDidChangeLogLevel(logLevel => (0, log_1.log)(logService, logLevel, `Log level changed to ${(0, log_1.LogLevelToString)(logService.getLevel())}`));
        logService.trace(`Remote configuration data at ${REMOTE_DATA_FOLDER}`);
        logService.trace('process arguments:', environmentService.args);
        if (Array.isArray(productService.serverGreeting)) {
            logService.info(`\n\n${productService.serverGreeting.join('\n')}\n\n`);
        }
        // ExtensionHost Debug broadcast service
        socketServer.registerChannel(extensionHostDebugIpc_1.ExtensionHostDebugBroadcastChannel.ChannelName, new extensionHostDebugIpc_1.ExtensionHostDebugBroadcastChannel());
        // TODO: @Sandy @Joao need dynamic context based router
        const router = new ipc_1.StaticRouter(ctx => ctx.clientId === 'renderer');
        // Files
        const fileService = disposables.add(new fileService_1.FileService(logService));
        services.set(files_1.IFileService, fileService);
        fileService.registerProvider(network_1.Schemas.file, disposables.add(new diskFileSystemProvider_1.DiskFileSystemProvider(logService)));
        // URI Identity
        const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
        services.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
        // Configuration
        const configurationService = new configurationService_1.ConfigurationService(environmentService.machineSettingsResource, fileService, new policy_1.NullPolicyService(), logService);
        services.set(configuration_1.IConfigurationService, configurationService);
        // User Data Profiles
        const userDataProfilesService = new userDataProfile_2.ServerUserDataProfilesService(uriIdentityService, environmentService, fileService, logService);
        services.set(userDataProfile_1.IUserDataProfilesService, userDataProfilesService);
        socketServer.registerChannel('userDataProfiles', new userDataProfileIpc_1.RemoteUserDataProfilesServiceChannel(userDataProfilesService, (ctx) => getUriTransformer(ctx.remoteAuthority)));
        // Initialize
        const [, , machineId, sqmId] = await Promise.all([
            configurationService.initialize(),
            userDataProfilesService.init(),
            (0, id_1.getMachineId)(logService.error.bind(logService)),
            (0, id_1.getSqmMachineId)(logService.error.bind(logService))
        ]);
        const extensionHostStatusService = new extensionHostStatusService_1.ExtensionHostStatusService();
        services.set(extensionHostStatusService_1.IExtensionHostStatusService, extensionHostStatusService);
        // Request
        const requestService = new requestService_1.RequestService(configurationService, environmentService, logService, loggerService);
        services.set(request_1.IRequestService, requestService);
        let oneDsAppender = telemetryUtils_1.NullAppender;
        const isInternal = (0, telemetryUtils_1.isInternalTelemetry)(productService, configurationService);
        if ((0, telemetryUtils_1.supportsTelemetry)(productService, environmentService)) {
            if (!(0, telemetryUtils_1.isLoggingOnly)(productService, environmentService) && productService.aiConfig?.ariaKey) {
                oneDsAppender = new _1dsAppender_1.OneDataSystemAppender(requestService, isInternal, eventPrefix, null, productService.aiConfig.ariaKey);
                disposables.add((0, lifecycle_1.toDisposable)(() => oneDsAppender?.flush())); // Ensure the AI appender is disposed so that it flushes remaining data
            }
            const config = {
                appenders: [oneDsAppender],
                commonProperties: (0, commonProperties_1.resolveCommonProperties)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, productService.commit, productService.version + '-remote', machineId, sqmId, isInternal, 'remoteAgent'),
                piiPaths: (0, telemetryUtils_1.getPiiPathsFromEnvironment)(environmentService)
            };
            const initialTelemetryLevelArg = environmentService.args['telemetry-level'];
            let injectedTelemetryLevel = 3 /* TelemetryLevel.USAGE */;
            // Convert the passed in CLI argument into a telemetry level for the telemetry service
            if (initialTelemetryLevelArg === 'all') {
                injectedTelemetryLevel = 3 /* TelemetryLevel.USAGE */;
            }
            else if (initialTelemetryLevelArg === 'error') {
                injectedTelemetryLevel = 2 /* TelemetryLevel.ERROR */;
            }
            else if (initialTelemetryLevelArg === 'crash') {
                injectedTelemetryLevel = 1 /* TelemetryLevel.CRASH */;
            }
            else if (initialTelemetryLevelArg !== undefined) {
                injectedTelemetryLevel = 0 /* TelemetryLevel.NONE */;
            }
            services.set(serverTelemetryService_1.IServerTelemetryService, new descriptors_1.SyncDescriptor(serverTelemetryService_1.ServerTelemetryService, [config, injectedTelemetryLevel]));
        }
        else {
            services.set(serverTelemetryService_1.IServerTelemetryService, serverTelemetryService_1.ServerNullTelemetryService);
        }
        services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryServiceWithNoStorageService));
        const downloadChannel = socketServer.getChannel('download', router);
        services.set(download_1.IDownloadService, new downloadIpc_1.DownloadServiceChannelClient(downloadChannel, () => getUriTransformer('renderer') /* TODO: @Sandy @Joao need dynamic context based router */));
        services.set(extensionsProfileScannerService_1.IExtensionsProfileScannerService, new descriptors_1.SyncDescriptor(extensionsProfileScannerService_2.ExtensionsProfileScannerService));
        services.set(extensionsScannerService_1.IExtensionsScannerService, new descriptors_1.SyncDescriptor(extensionsScannerService_2.ExtensionsScannerService));
        services.set(extensionSignatureVerificationService_1.IExtensionSignatureVerificationService, new descriptors_1.SyncDescriptor(extensionSignatureVerificationService_1.ExtensionSignatureVerificationService));
        services.set(extensionManagementService_1.INativeServerExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService));
        const instantiationService = new instantiationService_1.InstantiationService(services);
        services.set(languagePacks_1.ILanguagePackService, instantiationService.createInstance(languagePacks_2.NativeLanguagePackService));
        const ptyHostStarter = instantiationService.createInstance(nodePtyHostStarter_1.NodePtyHostStarter, {
            graceTime: 10800000 /* ProtocolConstants.ReconnectionGraceTime */,
            shortGraceTime: 300000 /* ProtocolConstants.ReconnectionShortGraceTime */,
            scrollback: configurationService.getValue("terminal.integrated.persistentSessionScrollback" /* TerminalSettingId.PersistentSessionScrollback */) ?? 100
        });
        const ptyHostService = instantiationService.createInstance(ptyHostService_1.PtyHostService, ptyHostStarter);
        services.set(terminal_1.IPtyService, ptyHostService);
        instantiationService.invokeFunction(accessor => {
            const extensionManagementService = accessor.get(extensionManagementService_1.INativeServerExtensionManagementService);
            const extensionsScannerService = accessor.get(extensionsScannerService_1.IExtensionsScannerService);
            const extensionGalleryService = accessor.get(extensionManagement_1.IExtensionGalleryService);
            const languagePackService = accessor.get(languagePacks_1.ILanguagePackService);
            const remoteExtensionEnvironmentChannel = new remoteAgentEnvironmentImpl_1.RemoteAgentEnvironmentChannel(connectionToken, environmentService, userDataProfilesService, extensionHostStatusService);
            socketServer.registerChannel('remoteextensionsenvironment', remoteExtensionEnvironmentChannel);
            const telemetryChannel = new remoteTelemetryChannel_1.ServerTelemetryChannel(accessor.get(serverTelemetryService_1.IServerTelemetryService), oneDsAppender);
            socketServer.registerChannel('telemetry', telemetryChannel);
            socketServer.registerChannel(remoteTerminalChannel_2.REMOTE_TERMINAL_CHANNEL_NAME, new remoteTerminalChannel_1.RemoteTerminalChannel(environmentService, logService, ptyHostService, productService, extensionManagementService, configurationService));
            const remoteExtensionsScanner = new remoteExtensionsScanner_1.RemoteExtensionsScannerService(instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, logService), environmentService, userDataProfilesService, extensionsScannerService, logService, extensionGalleryService, languagePackService);
            socketServer.registerChannel(remoteExtensionsScanner_2.RemoteExtensionsScannerChannelName, new remoteExtensionsScanner_1.RemoteExtensionsScannerChannel(remoteExtensionsScanner, (ctx) => getUriTransformer(ctx.remoteAuthority)));
            const remoteFileSystemChannel = new remoteFileSystemProviderServer_1.RemoteAgentFileSystemProviderChannel(logService, environmentService);
            socketServer.registerChannel(remoteFileSystemProviderClient_1.REMOTE_FILE_SYSTEM_CHANNEL_NAME, remoteFileSystemChannel);
            socketServer.registerChannel('request', new requestIpc_1.RequestChannel(accessor.get(request_1.IRequestService)));
            const channel = new extensionManagementIpc_1.ExtensionManagementChannel(extensionManagementService, (ctx) => getUriTransformer(ctx.remoteAuthority));
            socketServer.registerChannel('extensions', channel);
            // clean up extensions folder
            remoteExtensionsScanner.whenExtensionsReady().then(() => extensionManagementService.cleanUp());
            disposables.add(new errorTelemetry_1.default(accessor.get(telemetry_1.ITelemetryService)));
            return {
                telemetryService: accessor.get(telemetry_1.ITelemetryService)
            };
        });
        return { socketServer, instantiationService };
    }
    exports.setupServerServices = setupServerServices;
    const _uriTransformerCache = Object.create(null);
    function getUriTransformer(remoteAuthority) {
        if (!_uriTransformerCache[remoteAuthority]) {
            _uriTransformerCache[remoteAuthority] = (0, uriTransformer_1.createURITransformer)(remoteAuthority);
        }
        return _uriTransformerCache[remoteAuthority];
    }
    class SocketServer extends ipc_1.IPCServer {
        constructor() {
            const emitter = new event_1.Emitter();
            super(emitter.event);
            this._onDidConnectEmitter = emitter;
        }
        acceptConnection(protocol, onDidClientDisconnect) {
            this._onDidConnectEmitter.fire({ protocol, onDidClientDisconnect });
        }
    }
    exports.SocketServer = SocketServer;
    class ServerLogger extends log_1.AbstractLogger {
        constructor(logLevel = log_1.DEFAULT_LOG_LEVEL) {
            super();
            this.setLevel(logLevel);
            this.useColors = Boolean(process.stdout.isTTY);
        }
        trace(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Trace)) {
                if (this.useColors) {
                    console.log(`\x1b[90m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[${now()}]`, message, ...args);
                }
            }
        }
        debug(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Debug)) {
                if (this.useColors) {
                    console.log(`\x1b[90m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[${now()}]`, message, ...args);
                }
            }
        }
        info(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Info)) {
                if (this.useColors) {
                    console.log(`\x1b[90m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[${now()}]`, message, ...args);
                }
            }
        }
        warn(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Warning)) {
                if (this.useColors) {
                    console.warn(`\x1b[93m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.warn(`[${now()}]`, message, ...args);
                }
            }
        }
        error(message, ...args) {
            if (this.checkLogLevel(log_1.LogLevel.Error)) {
                if (this.useColors) {
                    console.error(`\x1b[91m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.error(`[${now()}]`, message, ...args);
                }
            }
        }
        flush() {
            // noop
        }
    }
    function now() {
        const date = new Date();
        return `${twodigits(date.getHours())}:${twodigits(date.getMinutes())}:${twodigits(date.getSeconds())}`;
    }
    function twodigits(n) {
        if (n < 10) {
            return `0${n}`;
        }
        return String(n);
    }
    /**
     * Cleans up older logs, while keeping the 10 most recent ones.
     */
    async function cleanupOlderLogs(logsPath) {
        const currentLog = path.basename(logsPath);
        const logsRoot = path.dirname(logsPath);
        const children = await pfs_1.Promises.readdir(logsRoot);
        const allSessions = children.filter(name => /^\d{8}T\d{6}$/.test(name));
        const oldSessions = allSessions.sort().filter((d) => d !== currentLog);
        const toDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 9));
        await Promise.all(toDelete.map(name => pfs_1.Promises.rm(path.join(logsRoot, name))));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyU2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3NlcnZlci9ub2RlL3NlcnZlclNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTZFaEcsTUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUM7SUFFL0IsS0FBSyxVQUFVLG1CQUFtQixDQUFDLGVBQXNDLEVBQUUsSUFBc0IsRUFBRSxrQkFBMEIsRUFBRSxXQUE0QjtRQUNqSyxNQUFNLFFBQVEsR0FBRyxJQUFJLHFDQUFpQixFQUFFLENBQUM7UUFDekMsTUFBTSxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQWdDLENBQUM7UUFFdEUsTUFBTSxjQUFjLEdBQW9CLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxHQUFHLGlCQUFPLEVBQUUsQ0FBQztRQUNqRixRQUFRLENBQUMsR0FBRyxDQUFDLGdDQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFOUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLG1EQUF3QixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLGlDQUFtQixFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDdEQsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1Q0FBeUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRTVELE1BQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxJQUFBLGlCQUFXLEVBQUMsa0JBQWtCLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0RyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFjLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDNUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxzQkFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQWlDLEVBQUUsRUFBRSxD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
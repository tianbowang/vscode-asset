/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/uri", "vs/base/node/pfs", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/download/common/download", "vs/platform/download/common/downloadService", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/node/languagePacks", "vs/platform/log/common/log", "vs/platform/policy/common/filePolicyService", "vs/platform/policy/common/policy", "vs/platform/policy/node/nativePolicyService", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/request/node/requestService", "vs/platform/state/node/stateService", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/node/1dsAppender", "vs/platform/telemetry/node/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/node/userDataProfile", "vs/platform/telemetry/node/telemetryUtils", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/common/logService", "vs/platform/log/node/loggerService", "vs/nls", "vs/platform/userData/common/fileUserDataProvider"], function (require, exports, os_1, async_1, errorMessage_1, errors_1, lifecycle_1, network_1, path_1, platform_1, process_1, uri_1, pfs_1, configuration_1, configurationService_1, download_1, downloadService_1, environment_1, environmentService_1, extensionGalleryService_1, extensionManagement_1, extensionSignatureVerificationService_1, extensionManagementCLI_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionManagementService_1, extensionsScannerService_2, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiationService_1, serviceCollection_1, languagePacks_1, languagePacks_2, log_1, filePolicyService_1, policy_1, nativePolicyService_1, product_1, productService_1, request_1, requestService_1, stateService_1, commonProperties_1, telemetry_1, telemetryService_1, telemetryUtils_1, _1dsAppender_1, telemetry_2, uriIdentity_1, uriIdentityService_1, userDataProfile_1, userDataProfile_2, telemetryUtils_2, extensionsProfileScannerService_2, logService_1, loggerService_1, nls_1, fileUserDataProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class CliMain extends lifecycle_1.Disposable {
        constructor(argv) {
            super();
            this.argv = argv;
            this.registerListeners();
        }
        registerListeners() {
            // Dispose on exit
            process.once('exit', () => this.dispose());
        }
        async run() {
            // Services
            const [instantiationService, appenders] = await this.initServices();
            return instantiationService.invokeFunction(async (accessor) => {
                const logService = accessor.get(log_1.ILogService);
                const fileService = accessor.get(files_1.IFileService);
                const environmentService = accessor.get(environment_1.INativeEnvironmentService);
                const userDataProfilesService = accessor.get(userDataProfile_1.IUserDataProfilesService);
                // Log info
                logService.info('CLI main', this.argv);
                // Error handler
                this.registerErrorHandler(logService);
                // Run based on argv
                await this.doRun(environmentService, fileService, userDataProfilesService, instantiationService);
                // Flush the remaining data in AI adapter (with 1s timeout)
                await Promise.all(appenders.map(a => {
                    (0, async_1.raceTimeout)(a.flush(), 1000);
                }));
                return;
            });
        }
        async initServices() {
            const services = new serviceCollection_1.ServiceCollection();
            // Product
            const productService = { _serviceBrand: undefined, ...product_1.default };
            services.set(productService_1.IProductService, productService);
            // Environment
            const environmentService = new environmentService_1.NativeEnvironmentService(this.argv, productService);
            services.set(environment_1.INativeEnvironmentService, environmentService);
            // Init folders
            await Promise.all([
                environmentService.appSettingsHome.with({ scheme: network_1.Schemas.file }).fsPath,
                environmentService.extensionsPath
            ].map(path => path ? pfs_1.Promises.mkdir(path, { recursive: true }) : undefined));
            // Logger
            const loggerService = new loggerService_1.LoggerService((0, log_1.getLogLevel)(environmentService), environmentService.logsHome);
            services.set(log_1.ILoggerService, loggerService);
            // Log
            const logger = this._register(loggerService.createLogger('cli', { name: (0, nls_1.localize)('cli', "CLI") }));
            const otherLoggers = [];
            if (loggerService.getLogLevel() === log_1.LogLevel.Trace) {
                otherLoggers.push(new log_1.ConsoleLogger(loggerService.getLogLevel()));
            }
            const logService = this._register(new logService_1.LogService(logger, otherLoggers));
            services.set(log_1.ILogService, logService);
            // Files
            const fileService = this._register(new fileService_1.FileService(logService));
            services.set(files_1.IFileService, fileService);
            const diskFileSystemProvider = this._register(new diskFileSystemProvider_1.DiskFileSystemProvider(logService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // Uri Identity
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            services.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // User Data Profiles
            const stateService = new stateService_1.StateReadonlyService(1 /* SaveStrategy.DELAYED */, environmentService, logService, fileService);
            const userDataProfilesService = new userDataProfile_2.UserDataProfilesReadonlyService(stateService, uriIdentityService, environmentService, fileService, logService);
            services.set(userDataProfile_1.IUserDataProfilesService, userDataProfilesService);
            // Use FileUserDataProvider for user data to
            // enable atomic read / write operations.
            fileService.registerProvider(network_1.Schemas.vscodeUserData, new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, diskFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
            // Policy
            const policyService = platform_1.isWindows && productService.win32RegValueName ? this._register(new nativePolicyService_1.NativePolicyService(logService, productService.win32RegValueName))
                : environmentService.policyFile ? this._register(new filePolicyService_1.FilePolicyService(environmentService.policyFile, fileService, logService))
                    : new policy_1.NullPolicyService();
            services.set(policy_1.IPolicyService, policyService);
            // Configuration
            const configurationService = this._register(new configurationService_1.ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, policyService, logService));
            services.set(configuration_1.IConfigurationService, configurationService);
            // Initialize
            await Promise.all([
                stateService.init(),
                configurationService.initialize()
            ]);
            // Get machine ID
            let machineId = undefined;
            try {
                machineId = await (0, telemetryUtils_2.resolveMachineId)(stateService, logService);
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    logService.error(error);
                }
            }
            const sqmId = await (0, telemetryUtils_2.resolveSqmId)(stateService, logService);
            // Initialize user data profiles after initializing the state
            userDataProfilesService.init();
            // URI Identity
            services.set(uriIdentity_1.IUriIdentityService, new uriIdentityService_1.UriIdentityService(fileService));
            // Request
            const requestService = new requestService_1.RequestService(configurationService, environmentService, logService, loggerService);
            services.set(request_1.IRequestService, requestService);
            // Download Service
            services.set(download_1.IDownloadService, new descriptors_1.SyncDescriptor(downloadService_1.DownloadService, undefined, true));
            // Extensions
            services.set(extensionsProfileScannerService_1.IExtensionsProfileScannerService, new descriptors_1.SyncDescriptor(extensionsProfileScannerService_2.ExtensionsProfileScannerService, undefined, true));
            services.set(extensionsScannerService_1.IExtensionsScannerService, new descriptors_1.SyncDescriptor(extensionsScannerService_2.ExtensionsScannerService, undefined, true));
            services.set(extensionSignatureVerificationService_1.IExtensionSignatureVerificationService, new descriptors_1.SyncDescriptor(extensionSignatureVerificationService_1.ExtensionSignatureVerificationService, undefined, true));
            services.set(extensionManagementService_1.INativeServerExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService, undefined, true));
            services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryServiceWithNoStorageService, undefined, true));
            // Localizations
            services.set(languagePacks_1.ILanguagePackService, new descriptors_1.SyncDescriptor(languagePacks_2.NativeLanguagePackService, undefined, false));
            // Telemetry
            const appenders = [];
            const isInternal = (0, telemetryUtils_1.isInternalTelemetry)(productService, configurationService);
            if ((0, telemetryUtils_1.supportsTelemetry)(productService, environmentService)) {
                if (productService.aiConfig && productService.aiConfig.ariaKey) {
                    appenders.push(new _1dsAppender_1.OneDataSystemAppender(requestService, isInternal, 'monacoworkbench', null, productService.aiConfig.ariaKey));
                }
                const config = {
                    appenders,
                    sendErrorTelemetry: false,
                    commonProperties: (0, commonProperties_1.resolveCommonProperties)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, productService.commit, productService.version, machineId, sqmId, isInternal),
                    piiPaths: (0, telemetryUtils_1.getPiiPathsFromEnvironment)(environmentService)
                };
                services.set(telemetry_1.ITelemetryService, new descriptors_1.SyncDescriptor(telemetryService_1.TelemetryService, [config], false));
            }
            else {
                services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            }
            return [new instantiationService_1.InstantiationService(services), appenders];
        }
        registerErrorHandler(logService) {
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => {
                const message = (0, errorMessage_1.toErrorMessage)(error, true);
                if (!message) {
                    return;
                }
                logService.error(`[uncaught exception in CLI]: ${message}`);
            });
            // Handle unhandled errors that can occur
            process.on('uncaughtException', err => {
                if (!(0, errors_1.isSigPipeError)(err)) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            });
            process.on('unhandledRejection', (reason) => (0, errors_1.onUnexpectedError)(reason));
        }
        async doRun(environmentService, fileService, userDataProfilesService, instantiationService) {
            let profile = undefined;
            if (environmentService.args.profile) {
                profile = userDataProfilesService.profiles.find(p => p.name === environmentService.args.profile);
                if (!profile) {
                    throw new Error(`Profile '${environmentService.args.profile}' not found.`);
                }
            }
            const profileLocation = (profile ?? userDataProfilesService.defaultProfile).extensionsResource;
            // List Extensions
            if (this.argv['list-extensions']) {
                return instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(log_1.LogLevel.Info, false)).listExtensions(!!this.argv['show-versions'], this.argv['category'], profileLocation);
            }
            // Install Extension
            else if (this.argv['install-extension'] || this.argv['install-builtin-extension']) {
                const installOptions = { isMachineScoped: !!this.argv['do-not-sync'], installPreReleaseVersion: !!this.argv['pre-release'], profileLocation };
                return instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(log_1.LogLevel.Info, false)).installExtensions(this.asExtensionIdOrVSIX(this.argv['install-extension'] || []), this.asExtensionIdOrVSIX(this.argv['install-builtin-extension'] || []), installOptions, !!this.argv['force']);
            }
            // Uninstall Extension
            else if (this.argv['uninstall-extension']) {
                return instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(log_1.LogLevel.Info, false)).uninstallExtensions(this.asExtensionIdOrVSIX(this.argv['uninstall-extension']), !!this.argv['force'], profileLocation);
            }
            else if (this.argv['update-extensions']) {
                return instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(log_1.LogLevel.Info, false)).updateExtensions(profileLocation);
            }
            // Locate Extension
            else if (this.argv['locate-extension']) {
                return instantiationService.createInstance(extensionManagementCLI_1.ExtensionManagementCLI, new log_1.ConsoleLogger(log_1.LogLevel.Info, false)).locateExtension(this.argv['locate-extension']);
            }
            // Telemetry
            else if (this.argv['telemetry']) {
                console.log(await (0, telemetry_2.buildTelemetryMessage)(environmentService.appRoot, environmentService.extensionsPath));
            }
        }
        asExtensionIdOrVSIX(inputs) {
            return inputs.map(input => /\.vsix$/i.test(input) ? uri_1.URI.file((0, path_1.isAbsolute)(input) ? input : (0, path_1.join)((0, process_1.cwd)(), input)) : input);
        }
    }
    async function main(argv) {
        const cliMain = new CliMain(argv);
        try {
            await cliMain.run();
        }
        finally {
            cliMain.dispose();
        }
    }
    exports.main = main;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpUHJvY2Vzc01haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2NvZGUvbm9kZS9jbGlQcm9jZXNzTWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUErRGhHLE1BQU0sT0FBUSxTQUFRLHNCQUFVO1FBRS9CLFlBQ1MsSUFBc0I7WUFFOUIsS0FBSyxFQUFFLENBQUM7WUFGQSxTQUFJLEdBQUosSUFBSSxDQUFrQjtZQUk5QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBRXhCLGtCQUFrQjtZQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUc7WUFFUixXQUFXO1lBQ1gsTUFBTSxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXBFLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBQyxRQUFRLEVBQUMsRUFBRTtnQkFDM0QsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBVyxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQVksQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUNBQXlCLENBQUMsQ0FBQztnQkFDbkUsTUFBTSx1QkFBdUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBDQUF3QixDQUFDLENBQUM7Z0JBRXZFLFdBQVc7Z0JBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FB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
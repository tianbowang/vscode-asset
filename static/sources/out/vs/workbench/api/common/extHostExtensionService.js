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
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/resources", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostConfiguration", "vs/workbench/api/common/extHostExtensionActivator", "vs/workbench/api/common/extHostStorage", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionDescriptionRegistry", "vs/base/common/errors", "vs/platform/extensions/common/extensions", "vs/base/common/buffer", "vs/workbench/api/common/extHostMemento", "vs/workbench/api/common/extHostTypes", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostStoragePaths", "vs/workbench/api/common/extHostRpcService", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/api/common/extHostTerminalService", "vs/base/common/event", "vs/workbench/services/extensions/common/workspaceContains", "vs/workbench/api/common/extHostSecretState", "vs/workbench/api/common/extHostSecrets", "vs/base/common/network", "vs/workbench/api/common/extHostLocalizationService", "vs/base/common/stopwatch", "vs/base/common/platform", "vs/workbench/api/common/extHostManagedSockets"], function (require, exports, nls, path, performance, resources_1, async_1, lifecycle_1, ternarySearchTree_1, uri_1, log_1, extHost_protocol_1, extHostConfiguration_1, extHostExtensionActivator_1, extHostStorage_1, extHostWorkspace_1, extensions_1, extensionDescriptionRegistry_1, errors, extensions_2, buffer_1, extHostMemento_1, extHostTypes_1, remoteAuthorityResolver_1, instantiation_1, extHostInitDataService_1, extHostStoragePaths_1, extHostRpcService_1, serviceCollection_1, extHostTunnelService_1, extHostTerminalService_1, event_1, workspaceContains_1, extHostSecretState_1, extHostSecrets_1, network_1, extHostLocalizationService_1, stopwatch_1, platform_1, extHostManagedSockets_1) {
    "use strict";
    var AbstractExtHostExtensionService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionPaths = exports.Extension = exports.IExtHostExtensionService = exports.AbstractExtHostExtensionService = exports.IHostUtils = void 0;
    exports.IHostUtils = (0, instantiation_1.createDecorator)('IHostUtils');
    let AbstractExtHostExtensionService = AbstractExtHostExtensionService_1 = class AbstractExtHostExtensionService extends lifecycle_1.Disposable {
        constructor(instaService, hostUtils, extHostContext, extHostWorkspace, extHostConfiguration, logService, initData, storagePath, extHostTunnelService, extHostTerminalService, extHostLocalizationService, _extHostManagedSockets) {
            super();
            this._extHostManagedSockets = _extHostManagedSockets;
            this._onDidChangeRemoteConnectionData = this._register(new event_1.Emitter());
            this.onDidChangeRemoteConnectionData = this._onDidChangeRemoteConnectionData.event;
            this._isTerminating = false;
            this._hostUtils = hostUtils;
            this._extHostContext = extHostContext;
            this._initData = initData;
            this._extHostWorkspace = extHostWorkspace;
            this._extHostConfiguration = extHostConfiguration;
            this._logService = logService;
            this._extHostTunnelService = extHostTunnelService;
            this._extHostTerminalService = extHostTerminalService;
            this._extHostLocalizationService = extHostLocalizationService;
            this._mainThreadWorkspaceProxy = this._extHostContext.getProxy(extHost_protocol_1.MainContext.MainThreadWorkspace);
            this._mainThreadTelemetryProxy = this._extHostContext.getProxy(extHost_protocol_1.MainContext.MainThreadTelemetry);
            this._mainThreadExtensionsProxy = this._extHostContext.getProxy(extHost_protocol_1.MainContext.MainThreadExtensionService);
            this._almostReadyToRunExtensions = new async_1.Barrier();
            this._readyToStartExtensionHost = new async_1.Barrier();
            this._readyToRunExtensions = new async_1.Barrier();
            this._eagerExtensionsActivated = new async_1.Barrier();
            this._activationEventsReader = new SyncedActivationEventsReader(this._initData.extensions.activationEvents);
            this._globalRegistry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry(this._activationEventsReader, this._initData.extensions.allExtensions);
            const myExtensionsSet = new extensions_2.ExtensionIdentifierSet(this._initData.extensions.myExtensions);
            this._myRegistry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry(this._activationEventsReader, filterExtensions(this._globalRegistry, myExtensionsSet));
            if (platform_1.isCI) {
                this._logService.info(`Creating extension host with the following global extensions: ${printExtIds(this._globalRegistry)}`);
                this._logService.info(`Creating extension host with the following local extensions: ${printExtIds(this._myRegistry)}`);
            }
            this._storage = new extHostStorage_1.ExtHostStorage(this._extHostContext, this._logService);
            this._secretState = new extHostSecretState_1.ExtHostSecretState(this._extHostContext);
            this._storagePath = storagePath;
            this._instaService = instaService.createChild(new serviceCollection_1.ServiceCollection([extHostStorage_1.IExtHostStorage, this._storage], [extHostSecretState_1.IExtHostSecretState, this._secretState]));
            this._activator = this._register(new extHostExtensionActivator_1.ExtensionsActivator(this._myRegistry, this._globalRegistry, {
                onExtensionActivationError: (extensionId, error, missingExtensionDependency) => {
                    this._mainThreadExtensionsProxy.$onExtensionActivationError(extensionId, errors.transformErrorForSerialization(error), missingExtensionDependency);
                },
                actualActivateExtension: async (extensionId, reason) => {
                    if (extensionDescriptionRegistry_1.ExtensionDescriptionRegistry.isHostExtension(extensionId, this._myRegistry, this._globalRegistry)) {
                        await this._mainThreadExtensionsProxy.$activateExtension(extensionId, reason);
                        return new extHostExtensionActivator_1.HostExtension();
                    }
                    const extensionDescription = this._myRegistry.getExtensionDescription(extensionId);
                    return this._activateExtension(extensionDescription, reason);
                }
            }, this._logService));
            this._extensionPathIndex = null;
            this._resolvers = Object.create(null);
            this._started = false;
            this._remoteConnectionData = this._initData.remote.connectionData;
        }
        getRemoteConnectionData() {
            return this._remoteConnectionData;
        }
        async initialize() {
            try {
                await this._beforeAlmostReadyToRunExtensions();
                this._almostReadyToRunExtensions.open();
                await this._extHostWorkspace.waitForInitializeCall();
                performance.mark('code/extHost/ready');
                this._readyToStartExtensionHost.open();
                if (this._initData.autoStart) {
                    this._startExtensionHost();
                }
            }
            catch (err) {
                errors.onUnexpectedError(err);
            }
        }
        async _deactivateAll() {
            this._storagePath.onWillDeactivateAll();
            let allPromises = [];
            try {
                const allExtensions = this._myRegistry.getAllExtensionDescriptions();
                const allExtensionsIds = allExtensions.map(ext => ext.identifier);
                const activatedExtensions = allExtensionsIds.filter(id => this.isActivated(id));
                allPromises = activatedExtensions.map((extensionId) => {
                    return this._deactivate(extensionId);
                });
            }
            catch (err) {
                // TODO: write to log once we have one
            }
            await Promise.all(allPromises);
        }
        terminate(reason, code = 0) {
            if (this._isTerminating) {
                // we are already shutting down...
                return;
            }
            this._isTerminating = true;
            this._logService.info(`Extension host terminating: ${reason}`);
            this._logService.flush();
            this._extHostTerminalService.dispose();
            this._activator.dispose();
            errors.setUnexpectedErrorHandler((err) => {
                this._logService.error(err);
            });
            // Invalidate all proxies
            this._extHostContext.dispose();
            const extensionsDeactivated = this._deactivateAll();
            // Give extensions at most 5 seconds to wrap up any async deactivate, then exit
            Promise.race([(0, async_1.timeout)(5000), extensionsDeactivated]).finally(() => {
                if (this._hostUtils.pid) {
                    this._logService.info(`Extension host with pid ${this._hostUtils.pid} exiting with code ${code}`);
                }
                else {
                    this._logService.info(`Extension host exiting with code ${code}`);
                }
                this._logService.flush();
                this._logService.dispose();
                this._hostUtils.exit(code);
            });
        }
        isActivated(extensionId) {
            if (this._readyToRunExtensions.isOpen()) {
                return this._activator.isActivated(extensionId);
            }
            return false;
        }
        async getExtension(extensionId) {
            const ext = await this._mainThreadExtensionsProxy.$getExtension(extensionId);
            return ext && {
                ...ext,
                identifier: new extensions_2.ExtensionIdentifier(ext.identifier.value),
                extensionLocation: uri_1.URI.revive(ext.extensionLocation)
            };
        }
        _activateByEvent(activationEvent, startup) {
            return this._activator.activateByEvent(activationEvent, startup);
        }
        _activateById(extensionId, reason) {
            return this._activator.activateById(extensionId, reason);
        }
        activateByIdWithErrors(extensionId, reason) {
            return this._activateById(extensionId, reason).then(() => {
                const extension = this._activator.getActivatedExtension(extensionId);
                if (extension.activationFailed) {
                    // activation failed => bubble up the error as the promise result
                    return Promise.reject(extension.activationFailedError);
                }
                return undefined;
            });
        }
        getExtensionRegistry() {
            return this._readyToRunExtensions.wait().then(_ => this._myRegistry);
        }
        getExtensionExports(extensionId) {
            if (this._readyToRunExtensions.isOpen()) {
                return this._activator.getActivatedExtension(extensionId).exports;
            }
            else {
                try {
                    return this._activator.getActivatedExtension(extensionId).exports;
                }
                catch (err) {
                    return null;
                }
            }
        }
        /**
         * Applies realpath to file-uris and returns all others uris unmodified
         */
        async _realPathExtensionUri(uri) {
            if (uri.scheme === network_1.Schemas.file && this._hostUtils.fsRealpath) {
                const realpathValue = await this._hostUtils.fsRealpath(uri.fsPath);
                return uri_1.URI.file(realpathValue);
            }
            return uri;
        }
        // create trie to enable fast 'filename -> extension id' look up
        async getExtensionPathIndex() {
            if (!this._extensionPathIndex) {
                this._extensionPathIndex = this._createExtensionPathIndex(this._myRegistry.getAllExtensionDescriptions()).then((searchTree) => {
                    return new ExtensionPaths(searchTree);
                });
            }
            return this._extensionPathIndex;
        }
        /**
         * create trie to enable fast 'filename -> extension id' look up
         */
        async _createExtensionPathIndex(extensions) {
            const tst = ternarySearchTree_1.TernarySearchTree.forUris(key => {
                // using the default/biased extUri-util because the IExtHostFileSystemInfo-service
                // isn't ready to be used yet, e.g the knowledge about `file` protocol and others
                // comes in while this code runs
                return resources_1.extUriBiasedIgnorePathCase.ignorePathCasing(key);
            });
            // const tst = TernarySearchTree.forUris<IExtensionDescription>(key => true);
            await Promise.all(extensions.map(async (ext) => {
                if (this._getEntryPoint(ext)) {
                    const uri = await this._realPathExtensionUri(ext.extensionLocation);
                    tst.set(uri, ext);
                }
            }));
            return tst;
        }
        _deactivate(extensionId) {
            let result = Promise.resolve(undefined);
            if (!this._readyToRunExtensions.isOpen()) {
                return result;
            }
            if (!this._activator.isActivated(extensionId)) {
                return result;
            }
            const extension = this._activator.getActivatedExtension(extensionId);
            if (!extension) {
                return result;
            }
            // call deactivate if available
            try {
                if (typeof extension.module.deactivate === 'function') {
                    result = Promise.resolve(extension.module.deactivate()).then(undefined, (err) => {
                        this._logService.error(err);
                        return Promise.resolve(undefined);
                    });
                }
            }
            catch (err) {
                this._logService.error(`An error occurred when deactivating the extension '${extensionId.value}':`);
                this._logService.error(err);
            }
            // clean up subscriptions
            try {
                (0, lifecycle_1.dispose)(extension.subscriptions);
            }
            catch (err) {
                this._logService.error(`An error occurred when deactivating the subscriptions for extension '${extensionId.value}':`);
                this._logService.error(err);
            }
            return result;
        }
        // --- impl
        async _activateExtension(extensionDescription, reason) {
            if (!this._initData.remote.isRemote) {
                // local extension host process
                await this._mainThreadExtensionsProxy.$onWillActivateExtension(extensionDescription.identifier);
            }
            else {
                // remote extension host process
                // do not wait for renderer confirmation
                this._mainThreadExtensionsProxy.$onWillActivateExtension(extensionDescription.identifier);
            }
            return this._doActivateExtension(extensionDescription, reason).then((activatedExtension) => {
                const activationTimes = activatedExtension.activationTimes;
                this._mainThreadExtensionsProxy.$onDidActivateExtension(extensionDescription.identifier, activationTimes.codeLoadingTime, activationTimes.activateCallTime, activationTimes.activateResolvedTime, reason);
                this._logExtensionActivationTimes(extensionDescription, reason, 'success', activationTimes);
                return activatedExtension;
            }, (err) => {
                this._logExtensionActivationTimes(extensionDescription, reason, 'failure');
                throw err;
            });
        }
        _logExtensionActivationTimes(extensionDescription, reason, outcome, activationTimes) {
            const event = getTelemetryActivationEvent(extensionDescription, reason);
            this._mainThreadTelemetryProxy.$publicLog2('extensionActivationTimes', {
                ...event,
                ...(activationTimes || {}),
                outcome
            });
        }
        _doActivateExtension(extensionDescription, reason) {
            const event = getTelemetryActivationEvent(extensionDescription, reason);
            this._mainThreadTelemetryProxy.$publicLog2('activatePlugin', event);
            const entryPoint = this._getEntryPoint(extensionDescription);
            if (!entryPoint) {
                // Treat the extension as being empty => NOT AN ERROR CASE
                return Promise.resolve(new extHostExtensionActivator_1.EmptyExtension(extHostExtensionActivator_1.ExtensionActivationTimes.NONE));
            }
            this._logService.info(`ExtensionService#_doActivateExtension ${extensionDescription.identifier.value}, startup: ${reason.startup}, activationEvent: '${reason.activationEvent}'${extensionDescription.identifier.value !== reason.extensionId.value ? `, root cause: ${reason.extensionId.value}` : ``}`);
            this._logService.flush();
            const activationTimesBuilder = new extHostExtensionActivator_1.ExtensionActivationTimesBuilder(reason.startup);
            return Promise.all([
                this._loadCommonJSModule(extensionDescription, (0, resources_1.joinPath)(extensionDescription.extensionLocation, entryPoint), activationTimesBuilder),
                this._loadExtensionContext(extensionDescription)
            ]).then(values => {
                performance.mark(`code/extHost/willActivateExtension/${extensionDescription.identifier.value}`);
                return AbstractExtHostExtensionService_1._callActivate(this._logService, extensionDescription.identifier, values[0], values[1], activationTimesBuilder);
            }).then((activatedExtension) => {
                performance.mark(`code/extHost/didActivateExtension/${extensionDescription.identifier.value}`);
                return activatedExtension;
            });
        }
        _loadExtensionContext(extensionDescription) {
            const globalState = new extHostMemento_1.ExtensionGlobalMemento(extensionDescription, this._storage);
            const workspaceState = new extHostMemento_1.ExtensionMemento(extensionDescription.identifier.value, false, this._storage);
            const secrets = new extHostSecrets_1.ExtensionSecrets(extensionDescription, this._secretState);
            const extensionMode = extensionDescription.isUnderDevelopment
                ? (this._initData.environment.extensionTestsLocationURI ? extHostTypes_1.ExtensionMode.Test : extHostTypes_1.ExtensionMode.Development)
                : extHostTypes_1.ExtensionMode.Production;
            const extensionKind = this._initData.remote.isRemote ? extHostTypes_1.ExtensionKind.Workspace : extHostTypes_1.ExtensionKind.UI;
            this._logService.trace(`ExtensionService#loadExtensionContext ${extensionDescription.identifier.value}`);
            return Promise.all([
                globalState.whenReady,
                workspaceState.whenReady,
                this._storagePath.whenReady
            ]).then(() => {
                const that = this;
                let extension;
                let messagePassingProtocol;
                const messagePort = (0, extensions_1.isProposedApiEnabled)(extensionDescription, 'ipc')
                    ? this._initData.messagePorts?.get(extensions_2.ExtensionIdentifier.toKey(extensionDescription.identifier))
                    : undefined;
                return Object.freeze({
                    globalState,
                    workspaceState,
                    secrets,
                    subscriptions: [],
                    get extensionUri() { return extensionDescription.extensionLocation; },
                    get extensionPath() { return extensionDescription.extensionLocation.fsPath; },
                    asAbsolutePath(relativePath) { return path.join(extensionDescription.extensionLocation.fsPath, relativePath); },
                    get storagePath() { return that._storagePath.workspaceValue(extensionDescription)?.fsPath; },
                    get globalStoragePath() { return that._storagePath.globalValue(extensionDescription).fsPath; },
                    get logPath() { return path.join(that._initData.logsLocation.fsPath, extensionDescription.identifier.value); },
                    get logUri() { return uri_1.URI.joinPath(that._initData.logsLocation, extensionDescription.identifier.value); },
                    get storageUri() { return that._storagePath.workspaceValue(extensionDescription); },
                    get globalStorageUri() { return that._storagePath.globalValue(extensionDescription); },
                    get extensionMode() { return extensionMode; },
                    get extension() {
                        if (extension === undefined) {
                            extension = new Extension(that, extensionDescription.identifier, extensionDescription, extensionKind, false);
                        }
                        return extension;
                    },
                    get extensionRuntime() {
                        (0, extensions_1.checkProposedApiEnabled)(extensionDescription, 'extensionRuntime');
                        return that.extensionRuntime;
                    },
                    get environmentVariableCollection() { return that._extHostTerminalService.getEnvironmentVariableCollection(extensionDescription); },
                    get messagePassingProtocol() {
                        if (!messagePassingProtocol) {
                            if (!messagePort) {
                                return undefined;
                            }
                            const onDidReceiveMessage = event_1.Event.buffer(event_1.Event.fromDOMEventEmitter(messagePort, 'message', e => e.data));
                            messagePort.start();
                            messagePassingProtocol = {
                                onDidReceiveMessage,
                                postMessage: messagePort.postMessage.bind(messagePort)
                            };
                        }
                        return messagePassingProtocol;
                    }
                });
            });
        }
        static _callActivate(logService, extensionId, extensionModule, context, activationTimesBuilder) {
            // Make sure the extension's surface is not undefined
            extensionModule = extensionModule || {
                activate: undefined,
                deactivate: undefined
            };
            return this._callActivateOptional(logService, extensionId, extensionModule, context, activationTimesBuilder).then((extensionExports) => {
                return new extHostExtensionActivator_1.ActivatedExtension(false, null, activationTimesBuilder.build(), extensionModule, extensionExports, context.subscriptions);
            });
        }
        static _callActivateOptional(logService, extensionId, extensionModule, context, activationTimesBuilder) {
            if (typeof extensionModule.activate === 'function') {
                try {
                    activationTimesBuilder.activateCallStart();
                    logService.trace(`ExtensionService#_callActivateOptional ${extensionId.value}`);
                    const scope = typeof global === 'object' ? global : self; // `global` is nodejs while `self` is for workers
                    const activateResult = extensionModule.activate.apply(scope, [context]);
                    activationTimesBuilder.activateCallStop();
                    activationTimesBuilder.activateResolveStart();
                    return Promise.resolve(activateResult).then((value) => {
                        activationTimesBuilder.activateResolveStop();
                        return value;
                    });
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
            else {
                // No activate found => the module is the extension's exports
                return Promise.resolve(extensionModule);
            }
        }
        // -- eager activation
        _activateOneStartupFinished(desc, activationEvent) {
            this._activateById(desc.identifier, {
                startup: false,
                extensionId: desc.identifier,
                activationEvent: activationEvent
            }).then(undefined, (err) => {
                this._logService.error(err);
            });
        }
        _activateAllStartupFinishedDeferred(extensions, start = 0) {
            const timeBudget = 50; // 50 milliseconds
            const startTime = Date.now();
            (0, platform_1.setTimeout0)(() => {
                for (let i = start; i < extensions.length; i += 1) {
                    const desc = extensions[i];
                    for (const activationEvent of (desc.activationEvents ?? [])) {
                        if (activationEvent === 'onStartupFinished') {
                            if (Date.now() - startTime > timeBudget) {
                                // time budget for current task has been exceeded
                                // set a new task to activate current and remaining extensions
                                this._activateAllStartupFinishedDeferred(extensions, i);
                                break;
                            }
                            else {
                                this._activateOneStartupFinished(desc, activationEvent);
                            }
                        }
                    }
                }
            });
        }
        _activateAllStartupFinished() {
            // startup is considered finished
            this._mainThreadExtensionsProxy.$setPerformanceMarks(performance.getMarks());
            this._extHostConfiguration.getConfigProvider().then((configProvider) => {
                const shouldDeferActivation = configProvider.getConfiguration('extensions.experimental').get('deferredStartupFinishedActivation');
                const allExtensionDescriptions = this._myRegistry.getAllExtensionDescriptions();
                if (shouldDeferActivation) {
                    this._activateAllStartupFinishedDeferred(allExtensionDescriptions);
                }
                else {
                    for (const desc of allExtensionDescriptions) {
                        if (desc.activationEvents) {
                            for (const activationEvent of desc.activationEvents) {
                                if (activationEvent === 'onStartupFinished') {
                                    this._activateOneStartupFinished(desc, activationEvent);
                                }
                            }
                        }
                    }
                }
            });
        }
        // Handle "eager" activation extensions
        _handleEagerExtensions() {
            const starActivation = this._activateByEvent('*', true).then(undefined, (err) => {
                this._logService.error(err);
            });
            this._register(this._extHostWorkspace.onDidChangeWorkspace((e) => this._handleWorkspaceContainsEagerExtensions(e.added)));
            const folders = this._extHostWorkspace.workspace ? this._extHostWorkspace.workspace.folders : [];
            const workspaceContainsActivation = this._handleWorkspaceContainsEagerExtensions(folders);
            const remoteResolverActivation = this._handleRemoteResolverEagerExtensions();
            const eagerExtensionsActivation = Promise.all([remoteResolverActivation, starActivation, workspaceContainsActivation]).then(() => { });
            Promise.race([eagerExtensionsActivation, (0, async_1.timeout)(10000)]).then(() => {
                this._activateAllStartupFinished();
            });
            return eagerExtensionsActivation;
        }
        _handleWorkspaceContainsEagerExtensions(folders) {
            if (folders.length === 0) {
                return Promise.resolve(undefined);
            }
            return Promise.all(this._myRegistry.getAllExtensionDescriptions().map((desc) => {
                return this._handleWorkspaceContainsEagerExtension(folders, desc);
            })).then(() => { });
        }
        async _handleWorkspaceContainsEagerExtension(folders, desc) {
            if (this.isActivated(desc.identifier)) {
                return;
            }
            const localWithRemote = !this._initData.remote.isRemote && !!this._initData.remote.authority;
            const host = {
                logService: this._logService,
                folders: folders.map(folder => folder.uri),
                forceUsingSearch: localWithRemote || !this._hostUtils.fsExists,
                exists: (uri) => this._hostUtils.fsExists(uri.fsPath),
                checkExists: (folders, includes, token) => this._mainThreadWorkspaceProxy.$checkExists(folders, includes, token)
            };
            const result = await (0, workspaceContains_1.checkActivateWorkspaceContainsExtension)(host, desc);
            if (!result) {
                return;
            }
            return (this._activateById(desc.identifier, { startup: true, extensionId: desc.identifier, activationEvent: result.activationEvent })
                .then(undefined, err => this._logService.error(err)));
        }
        async _handleRemoteResolverEagerExtensions() {
            if (this._initData.remote.authority) {
                return this._activateByEvent(`onResolveRemoteAuthority:${this._initData.remote.authority}`, false);
            }
        }
        async $extensionTestsExecute() {
            await this._eagerExtensionsActivated.wait();
            try {
                return await this._doHandleExtensionTests();
            }
            catch (error) {
                console.error(error); // ensure any error message makes it onto the console
                throw error;
            }
        }
        async _doHandleExtensionTests() {
            const { extensionDevelopmentLocationURI, extensionTestsLocationURI } = this._initData.environment;
            if (!extensionDevelopmentLocationURI || !extensionTestsLocationURI) {
                throw new Error(nls.localize('extensionTestError1', "Cannot load test runner."));
            }
            // Require the test runner via node require from the provided path
            const testRunner = await this._loadCommonJSModule(null, extensionTestsLocationURI, new extHostExtensionActivator_1.ExtensionActivationTimesBuilder(false));
            if (!testRunner || typeof testRunner.run !== 'function') {
                throw new Error(nls.localize('extensionTestError', "Path {0} does not point to a valid extension test runner.", extensionTestsLocationURI.toString()));
            }
            // Execute the runner if it follows the old `run` spec
            return new Promise((resolve, reject) => {
                const oldTestRunnerCallback = (error, failures) => {
                    if (error) {
                        if (platform_1.isCI) {
                            this._logService.error(`Test runner called back with error`, error);
                        }
                        reject(error);
                    }
                    else {
                        if (platform_1.isCI) {
                            if (failures) {
                                this._logService.info(`Test runner called back with ${failures} failures.`);
                            }
                            else {
                                this._logService.info(`Test runner called back with successful outcome.`);
                            }
                        }
                        resolve((typeof failures === 'number' && failures > 0) ? 1 /* ERROR */ : 0 /* OK */);
                    }
                };
                const extensionTestsPath = (0, resources_1.originalFSPath)(extensionTestsLocationURI); // for the old test runner API
                const runResult = testRunner.run(extensionTestsPath, oldTestRunnerCallback);
                // Using the new API `run(): Promise<void>`
                if (runResult && runResult.then) {
                    runResult
                        .then(() => {
                        if (platform_1.isCI) {
                            this._logService.info(`Test runner finished successfully.`);
                        }
                        resolve(0);
                    })
                        .catch((err) => {
                        if (platform_1.isCI) {
                            this._logService.error(`Test runner finished with error`, err);
                        }
                        reject(err instanceof Error && err.stack ? err.stack : String(err));
                    });
                }
            });
        }
        _startExtensionHost() {
            if (this._started) {
                throw new Error(`Extension host is already started!`);
            }
            this._started = true;
            return this._readyToStartExtensionHost.wait()
                .then(() => this._readyToRunExtensions.open())
                .then(() => {
                // wait for all activation events that came in during workbench startup, but at maximum 1s
                return Promise.race([this._activator.waitForActivatingExtensions(), (0, async_1.timeout)(1000)]);
            })
                .then(() => this._handleEagerExtensions())
                .then(() => {
                this._eagerExtensionsActivated.open();
                this._logService.info(`Eager extensions activated`);
            });
        }
        // -- called by extensions
        registerRemoteAuthorityResolver(authorityPrefix, resolver) {
            this._resolvers[authorityPrefix] = resolver;
            return (0, lifecycle_1.toDisposable)(() => {
                delete this._resolvers[authorityPrefix];
            });
        }
        async getRemoteExecServer(remoteAuthority) {
            const { resolver } = await this._activateAndGetResolver(remoteAuthority);
            return resolver?.resolveExecServer?.(remoteAuthority, { resolveAttempt: 0 });
        }
        // -- called by main thread
        async _activateAndGetResolver(remoteAuthority) {
            const authorityPlusIndex = remoteAuthority.indexOf('+');
            if (authorityPlusIndex === -1) {
                throw new extHostTypes_1.RemoteAuthorityResolverError(`Not an authority that can be resolved!`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.InvalidAuthority);
            }
            const authorityPrefix = remoteAuthority.substr(0, authorityPlusIndex);
            await this._almostReadyToRunExtensions.wait();
            await this._activateByEvent(`onResolveRemoteAuthority:${authorityPrefix}`, false);
            return { authorityPrefix, resolver: this._resolvers[authorityPrefix] };
        }
        async $resolveAuthority(remoteAuthorityChain, resolveAttempt) {
            const sw = stopwatch_1.StopWatch.create(false);
            const prefix = () => `[resolveAuthority(${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthorityChain)},${resolveAttempt})][${sw.elapsed()}ms] `;
            const logInfo = (msg) => this._logService.info(`${prefix()}${msg}`);
            const logWarning = (msg) => this._logService.warn(`${prefix()}${msg}`);
            const logError = (msg, err = undefined) => this._logService.error(`${prefix()}${msg}`, err);
            const normalizeError = (err) => {
                if (err instanceof extHostTypes_1.RemoteAuthorityResolverError) {
                    return {
                        type: 'error',
                        error: {
                            code: err._code,
                            message: err._message,
                            detail: err._detail
                        }
                    };
                }
                throw err;
            };
            const getResolver = async (remoteAuthority) => {
                logInfo(`activating resolver for ${remoteAuthority}...`);
                const { resolver, authorityPrefix } = await this._activateAndGetResolver(remoteAuthority);
                if (!resolver) {
                    logError(`no resolver for ${authorityPrefix}`);
                    throw new extHostTypes_1.RemoteAuthorityResolverError(`No remote extension installed to resolve ${authorityPrefix}.`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.NoResolverFound);
                }
                return { resolver, authorityPrefix, remoteAuthority };
            };
            const chain = remoteAuthorityChain.split(/@|%40/g).reverse();
            logInfo(`activating remote resolvers ${chain.join(' -> ')}`);
            let resolvers;
            try {
                resolvers = await Promise.all(chain.map(getResolver)).catch(async (e) => {
                    if (!(e instanceof extHostTypes_1.RemoteAuthorityResolverError) || e._code !== remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.InvalidAuthority) {
                        throw e;
                    }
                    logWarning(`resolving nested authorities failed: ${e.message}`);
                    return [await getResolver(remoteAuthorityChain)];
                });
            }
            catch (e) {
                return normalizeError(e);
            }
            const intervalLogger = new async_1.IntervalTimer();
            intervalLogger.cancelAndSet(() => logInfo('waiting...'), 1000);
            let result;
            let execServer;
            for (const [i, { authorityPrefix, resolver, remoteAuthority }] of resolvers.entries()) {
                try {
                    if (i === resolvers.length - 1) {
                        logInfo(`invoking final resolve()...`);
                        performance.mark(`code/extHost/willResolveAuthority/${authorityPrefix}`);
                        result = await resolver.resolve(remoteAuthority, { resolveAttempt, execServer });
                        performance.mark(`code/extHost/didResolveAuthorityOK/${authorityPrefix}`);
                        logInfo(`setting tunnel factory...`);
                        this._register(await this._extHostTunnelService.setTunnelFactory(resolver, extHostTypes_1.ManagedResolvedAuthority.isManagedResolvedAuthority(result) ? result : undefined));
                    }
                    else {
                        logInfo(`invoking resolveExecServer() for ${remoteAuthority}`);
                        performance.mark(`code/extHost/willResolveExecServer/${authorityPrefix}`);
                        execServer = await resolver.resolveExecServer?.(remoteAuthority, { resolveAttempt, execServer });
                        if (!execServer) {
                            throw new extHostTypes_1.RemoteAuthorityResolverError(`Exec server was not available for ${remoteAuthority}`, remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode.NoResolverFound); // we did, in fact, break the chain :(
                        }
                        performance.mark(`code/extHost/didResolveExecServerOK/${authorityPrefix}`);
                    }
                }
                catch (e) {
                    performance.mark(`code/extHost/didResolveAuthorityError/${authorityPrefix}`);
                    logError(`returned an error`, e);
                    intervalLogger.dispose();
                    return normalizeError(e);
                }
            }
            intervalLogger.dispose();
            const tunnelInformation = {
                environmentTunnels: result.environmentTunnels,
                features: result.tunnelFeatures ? {
                    elevation: result.tunnelFeatures.elevation,
                    privacyOptions: result.tunnelFeatures.privacyOptions,
                    protocol: result.tunnelFeatures.protocol === undefined ? true : result.tunnelFeatures.protocol,
                } : undefined
            };
            // Split merged API result into separate authority/options
            const options = {
                extensionHostEnv: result.extensionHostEnv,
                isTrusted: result.isTrusted,
                authenticationSession: result.authenticationSessionForInitializingExtensions ? { id: result.authenticationSessionForInitializingExtensions.id, providerId: result.authenticationSessionForInitializingExtensions.providerId } : undefined
            };
            // extension are not required to return an instance of ResolvedAuthority or ManagedResolvedAuthority, so don't use `instanceof`
            logInfo(`returned ${extHostTypes_1.ManagedResolvedAuthority.isManagedResolvedAuthority(result) ? 'managed authority' : `${result.host}:${result.port}`}`);
            let authority;
            if (extHostTypes_1.ManagedResolvedAuthority.isManagedResolvedAuthority(result)) {
                // The socket factory is identified by the `resolveAttempt`, since that is a number which
                // always increments and is unique over all resolve() calls in a workbench session.
                const socketFactoryId = resolveAttempt;
                // There is only on managed socket factory at a time, so we can just overwrite the old one.
                this._extHostManagedSockets.setFactory(socketFactoryId, result.makeConnection);
                authority = {
                    authority: remoteAuthorityChain,
                    connectTo: new remoteAuthorityResolver_1.ManagedRemoteConnection(socketFactoryId),
                    connectionToken: result.connectionToken
                };
            }
            else {
                authority = {
                    authority: remoteAuthorityChain,
                    connectTo: new remoteAuthorityResolver_1.WebSocketRemoteConnection(result.host, result.port),
                    connectionToken: result.connectionToken
                };
            }
            return {
                type: 'ok',
                value: {
                    authority: authority,
                    options,
                    tunnelInformation,
                }
            };
        }
        async $getCanonicalURI(remoteAuthority, uriComponents) {
            this._logService.info(`$getCanonicalURI invoked for authority (${(0, remoteAuthorityResolver_1.getRemoteAuthorityPrefix)(remoteAuthority)})`);
            const { resolver } = await this._activateAndGetResolver(remoteAuthority);
            if (!resolver) {
                // Return `null` if no resolver for `remoteAuthority` is found.
                return null;
            }
            const uri = uri_1.URI.revive(uriComponents);
            if (typeof resolver.getCanonicalURI === 'undefined') {
                // resolver cannot compute canonical URI
                return uri;
            }
            const result = await (0, async_1.asPromise)(() => resolver.getCanonicalURI(uri));
            if (!result) {
                return uri;
            }
            return result;
        }
        $startExtensionHost(extensionsDelta) {
            extensionsDelta.toAdd.forEach((extension) => extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation));
            const { globalRegistry, myExtensions } = applyExtensionsDelta(this._activationEventsReader, this._globalRegistry, this._myRegistry, extensionsDelta);
            this._globalRegistry.set(globalRegistry.getAllExtensionDescriptions());
            this._myRegistry.set(myExtensions);
            if (platform_1.isCI) {
                this._logService.info(`$startExtensionHost: global extensions: ${printExtIds(this._globalRegistry)}`);
                this._logService.info(`$startExtensionHost: local extensions: ${printExtIds(this._myRegistry)}`);
            }
            return this._startExtensionHost();
        }
        $activateByEvent(activationEvent, activationKind) {
            if (activationKind === 1 /* ActivationKind.Immediate */) {
                return this._almostReadyToRunExtensions.wait()
                    .then(_ => this._activateByEvent(activationEvent, false));
            }
            return (this._readyToRunExtensions.wait()
                .then(_ => this._activateByEvent(activationEvent, false)));
        }
        async $activate(extensionId, reason) {
            await this._readyToRunExtensions.wait();
            if (!this._myRegistry.getExtensionDescription(extensionId)) {
                // unknown extension => ignore
                return false;
            }
            await this._activateById(extensionId, reason);
            return true;
        }
        async $deltaExtensions(extensionsDelta) {
            extensionsDelta.toAdd.forEach((extension) => extension.extensionLocation = uri_1.URI.revive(extension.extensionLocation));
            // First build up and update the trie and only afterwards apply the delta
            const { globalRegistry, myExtensions } = applyExtensionsDelta(this._activationEventsReader, this._globalRegistry, this._myRegistry, extensionsDelta);
            const newSearchTree = await this._createExtensionPathIndex(myExtensions);
            const extensionsPaths = await this.getExtensionPathIndex();
            extensionsPaths.setSearchTree(newSearchTree);
            this._globalRegistry.set(globalRegistry.getAllExtensionDescriptions());
            this._myRegistry.set(myExtensions);
            if (platform_1.isCI) {
                this._logService.info(`$deltaExtensions: global extensions: ${printExtIds(this._globalRegistry)}`);
                this._logService.info(`$deltaExtensions: local extensions: ${printExtIds(this._myRegistry)}`);
            }
            return Promise.resolve(undefined);
        }
        async $test_latency(n) {
            return n;
        }
        async $test_up(b) {
            return b.byteLength;
        }
        async $test_down(size) {
            const buff = buffer_1.VSBuffer.alloc(size);
            const value = Math.random() % 256;
            for (let i = 0; i < size; i++) {
                buff.writeUInt8(value, i);
            }
            return buff;
        }
        async $updateRemoteConnectionData(connectionData) {
            this._remoteConnectionData = connectionData;
            this._onDidChangeRemoteConnectionData.fire();
        }
    };
    exports.AbstractExtHostExtensionService = AbstractExtHostExtensionService;
    exports.AbstractExtHostExtensionService = AbstractExtHostExtensionService = AbstractExtHostExtensionService_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, exports.IHostUtils),
        __param(2, extHostRpcService_1.IExtHostRpcService),
        __param(3, extHostWorkspace_1.IExtHostWorkspace),
        __param(4, extHostConfiguration_1.IExtHostConfiguration),
        __param(5, log_1.ILogService),
        __param(6, extHostInitDataService_1.IExtHostInitDataService),
        __param(7, extHostStoragePaths_1.IExtensionStoragePaths),
        __param(8, extHostTunnelService_1.IExtHostTunnelService),
        __param(9, extHostTerminalService_1.IExtHostTerminalService),
        __param(10, extHostLocalizationService_1.IExtHostLocalizationService),
        __param(11, extHostManagedSockets_1.IExtHostManagedSockets)
    ], AbstractExtHostExtensionService);
    function applyExtensionsDelta(activationEventsReader, oldGlobalRegistry, oldMyRegistry, extensionsDelta) {
        activationEventsReader.addActivationEvents(extensionsDelta.addActivationEvents);
        const globalRegistry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry(activationEventsReader, oldGlobalRegistry.getAllExtensionDescriptions());
        globalRegistry.deltaExtensions(extensionsDelta.toAdd, extensionsDelta.toRemove);
        const myExtensionsSet = new extensions_2.ExtensionIdentifierSet(oldMyRegistry.getAllExtensionDescriptions().map(extension => extension.identifier));
        for (const extensionId of extensionsDelta.myToRemove) {
            myExtensionsSet.delete(extensionId);
        }
        for (const extensionId of extensionsDelta.myToAdd) {
            myExtensionsSet.add(extensionId);
        }
        const myExtensions = filterExtensions(globalRegistry, myExtensionsSet);
        return { globalRegistry, myExtensions };
    }
    function getTelemetryActivationEvent(extensionDescription, reason) {
        const event = {
            id: extensionDescription.identifier.value,
            name: extensionDescription.name,
            extensionVersion: extensionDescription.version,
            publisherDisplayName: extensionDescription.publisher,
            activationEvents: extensionDescription.activationEvents ? extensionDescription.activationEvents.join(',') : null,
            isBuiltin: extensionDescription.isBuiltin,
            reason: reason.activationEvent,
            reasonId: reason.extensionId.value,
        };
        return event;
    }
    function printExtIds(registry) {
        return registry.getAllExtensionDescriptions().map(ext => ext.identifier.value).join(',');
    }
    exports.IExtHostExtensionService = (0, instantiation_1.createDecorator)('IExtHostExtensionService');
    class Extension {
        #extensionService;
        #originExtensionId;
        #identifier;
        constructor(extensionService, originExtensionId, description, kind, isFromDifferentExtensionHost) {
            this.#extensionService = extensionService;
            this.#originExtensionId = originExtensionId;
            this.#identifier = description.identifier;
            this.id = description.identifier.value;
            this.extensionUri = description.extensionLocation;
            this.extensionPath = path.normalize((0, resources_1.originalFSPath)(description.extensionLocation));
            this.packageJSON = description;
            this.extensionKind = kind;
            this.isFromDifferentExtensionHost = isFromDifferentExtensionHost;
        }
        get isActive() {
            // TODO@alexdima support this
            return this.#extensionService.isActivated(this.#identifier);
        }
        get exports() {
            if (this.packageJSON.api === 'none' || this.isFromDifferentExtensionHost) {
                return undefined; // Strict nulloverride - Public api
            }
            return this.#extensionService.getExtensionExports(this.#identifier);
        }
        async activate() {
            if (this.isFromDifferentExtensionHost) {
                throw new Error('Cannot activate foreign extension'); // TODO@alexdima support this
            }
            await this.#extensionService.activateByIdWithErrors(this.#identifier, { startup: false, extensionId: this.#originExtensionId, activationEvent: 'api' });
            return this.exports;
        }
    }
    exports.Extension = Extension;
    function filterExtensions(globalRegistry, desiredExtensions) {
        return globalRegistry.getAllExtensionDescriptions().filter(extension => desiredExtensions.has(extension.identifier));
    }
    class ExtensionPaths {
        constructor(_searchTree) {
            this._searchTree = _searchTree;
        }
        setSearchTree(searchTree) {
            this._searchTree = searchTree;
        }
        findSubstr(key) {
            return this._searchTree.findSubstr(key);
        }
        forEach(callback) {
            return this._searchTree.forEach(callback);
        }
    }
    exports.ExtensionPaths = ExtensionPaths;
    /**
     * This mirrors the activation events as seen by the renderer. The renderer
     * is the only one which can have a reliable view of activation events because
     * implicit activation events are generated via extension points, and they
     * are registered only on the renderer side.
     */
    class SyncedActivationEventsReader {
        constructor(activationEvents) {
            this._map = new extensions_2.ExtensionIdentifierMap();
            this.addActivationEvents(activationEvents);
        }
        readActivationEvents(extensionDescription) {
            return this._map.get(extensionDescription.identifier) ?? [];
        }
        addActivationEvents(activationEvents) {
            for (const extensionId of Object.keys(activationEvents)) {
                this._map.set(extensionId, activationEvents[extensionId]);
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEV4dGVuc2lvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RFeHRlbnNpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF5RG5GLFFBQUEsVUFBVSxHQUFHLElBQUEsK0JBQWUsRUFBYSxZQUFZLENBQUMsQ0FBQztJQXFCN0QsSUFBZSwrQkFBK0IsdUNBQTlDLE1BQWUsK0JBQWdDLFNBQVEsc0JBQVU7UUE0Q3ZFLFlBQ3dCLFlBQW1DLEVBQzlDLFNBQXFCLEVBQ2IsY0FBa0MsRUFDbkMsZ0JBQW1DLEVBQy9CLG9CQUEyQyxFQUNyRCxVQUF1QixFQUNYLFFBQWlDLEVBQ2xDLFdBQW1DLEVBQ3BDLG9CQUEyQyxFQUN6QyxzQkFBK0MsRUFDM0MsMEJBQXVELEVBQzVELHNCQUErRDtZQUV2RixLQUFLLEVBQUUsQ0FBQztZQUZpQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1lBbER2RSxxQ0FBZ0MsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUN4RSxvQ0FBK0IsR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsS0FBSyxDQUFDO1lBa0N0RixtQkFBYyxHQUFZLEtBQUssQ0FBQztZQWtCdkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7WUFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFFMUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1lBQzFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQztZQUNsRCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZ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
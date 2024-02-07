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
define(["require", "exports", "vs/base/common/event", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/electron-sandbox/localPty", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService", "vs/workbench/services/history/common/history", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/platform/product/common/productService", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/workbench/contrib/terminal/browser/baseTerminalBackend", "vs/platform/native/common/native", "vs/base/parts/ipc/common/ipc.mp", "vs/base/parts/ipc/electron-sandbox/ipc.mp", "vs/base/parts/ipc/common/ipc", "vs/base/common/performance", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/async", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/decorators", "vs/base/common/stopwatch", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, event_1, platform_1, configuration_1, instantiation_1, label_1, platform_2, storage_1, terminal_1, workspace_1, terminal_2, terminal_3, localPty_1, configurationResolver_1, shellEnvironmentService_1, history_1, terminalEnvironment, productService_1, environmentVariable_1, baseTerminalBackend_1, native_1, ipc_mp_1, ipc_mp_2, ipc_1, performance_1, lifecycle_1, async_1, statusbar_1, decorators_1, stopwatch_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalTerminalBackendContribution = void 0;
    let LocalTerminalBackendContribution = class LocalTerminalBackendContribution {
        constructor(instantiationService, terminalInstanceService) {
            const backend = instantiationService.createInstance(LocalTerminalBackend);
            platform_2.Registry.as(terminal_1.TerminalExtensions.Backend).registerTerminalBackend(backend);
            terminalInstanceService.didRegisterBackend(backend.remoteAuthority);
        }
    };
    exports.LocalTerminalBackendContribution = LocalTerminalBackendContribution;
    exports.LocalTerminalBackendContribution = LocalTerminalBackendContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, terminal_2.ITerminalInstanceService)
    ], LocalTerminalBackendContribution);
    let LocalTerminalBackend = class LocalTerminalBackend extends baseTerminalBackend_1.BaseTerminalBackend {
        /**
         * Communicate to the direct proxy (renderer<->ptyhost) if it's available, otherwise use the
         * indirect proxy (renderer<->main<->ptyhost). The latter may not need to actually launch the
         * pty host, for example when detecting profiles.
         */
        get _proxy() { return this._directProxy || this._localPtyService; }
        get whenReady() { return this._whenReady.p; }
        setReady() { this._whenReady.complete(); }
        constructor(workspaceContextService, _lifecycleService, logService, _localPtyService, _labelService, _shellEnvironmentService, _storageService, _configurationResolverService, _configurationService, _productService, _historyService, _terminalProfileResolverService, _environmentVariableService, historyService, _nativeHostService, statusBarService, _remoteAgentService) {
            super(_localPtyService, logService, historyService, _configurationResolverService, statusBarService, workspaceContextService);
            this._lifecycleService = _lifecycleService;
            this._localPtyService = _localPtyService;
            this._labelService = _labelService;
            this._shellEnvironmentService = _shellEnvironmentService;
            this._storageService = _storageService;
            this._configurationResolverService = _configurationResolverService;
            this._configurationService = _configurationService;
            this._productService = _productService;
            this._historyService = _historyService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._environmentVariableService = _environmentVariableService;
            this._nativeHostService = _nativeHostService;
            this._remoteAgentService = _remoteAgentService;
            this.remoteAuthority = undefined;
            this._ptys = new Map();
            this._whenReady = new async_1.DeferredPromise();
            this._onDidRequestDetach = this._register(new event_1.Emitter());
            this.onDidRequestDetach = this._onDidRequestDetach.event;
            this.onPtyHostRestart(() => {
                this._directProxy = undefined;
                this._directProxyClientEventually = undefined;
                this._connectToDirectProxy();
            });
        }
        /**
         * Request a direct connection to the pty host, this will launch the pty host process if necessary.
         */
        async _connectToDirectProxy() {
            // Check if connecting is in progress
            if (this._directProxyClientEventually) {
                await this._directProxyClientEventually.p;
                return;
            }
            this._logService.debug('Starting pty host');
            const directProxyClientEventually = new async_1.DeferredPromise();
            this._directProxyClientEventually = directProxyClientEventually;
            const directProxy = ipc_1.ProxyChannel.toService((0, ipc_1.getDelayedChannel)(this._directProxyClientEventually.p.then(client => client.getChannel(terminal_1.TerminalIpcChannels.PtyHostWindow))));
            this._directProxy = directProxy;
            // The pty host should not get launched until at least the window restored phase
            // if remote auth exists, don't await
            if (!this._remoteAgentService.getConnection()?.remoteAuthority) {
                await this._lifecycleService.when(3 /* LifecyclePhase.Restored */);
            }
            (0, performance_1.mark)('code/terminal/willConnectPtyHost');
            this._logService.trace('Renderer->PtyHost#connect: before acquirePort');
            (0, ipc_mp_2.acquirePort)('vscode:createPtyHostMessageChannel', 'vscode:createPtyHostMessageChannelResult').then(port => {
                (0, performance_1.mark)('code/terminal/didConnectPtyHost');
                this._logService.trace('Renderer->PtyHost#connect: connection established');
                // There are two connections to the pty host; one to the regular shared process
                // _localPtyService, and one directly via message port _ptyHostDirectProxy. The former is
                // used for pty host management messages, it would make sense in the future to use a
                // separate interface/service for this one.
                const client = new ipc_mp_1.Client(port, `window:${this._nativeHostService.windowId}`);
                directProxyClientEventually.complete(client);
                this._onPtyHostConnected.fire();
                // Attach process listeners
                directProxy.onProcessData(e => this._ptys.get(e.id)?.handleData(e.event));
                directProxy.onDidChangeProperty(e => this._ptys.get(e.id)?.handleDidChangeProperty(e.property));
                directProxy.onProcessExit(e => {
                    const pty = this._ptys.get(e.id);
                    if (pty) {
                        pty.handleExit(e.event);
                        this._ptys.delete(e.id);
                    }
                });
                directProxy.onProcessReady(e => this._ptys.get(e.id)?.handleReady(e.event));
                directProxy.onProcessReplay(e => this._ptys.get(e.id)?.handleReplay(e.event));
                directProxy.onProcessOrphanQuestion(e => this._ptys.get(e.id)?.handleOrphanQuestion());
                directProxy.onDidRequestDetach(e => this._onDidRequestDetach.fire(e));
                // Listen for config changes
                const initialConfig = this._configurationService.getValue(terminal_3.TERMINAL_CONFIG_SECTION);
                for (const match of Object.keys(initialConfig.autoReplies)) {
                    // Ensure the reply is value
                    const reply = initialConfig.autoReplies[match];
                    if (reply) {
                        directProxy.installAutoReply(match, reply);
                    }
                }
                // TODO: Could simplify update to a single call
                this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
                    if (e.affectsConfiguration("terminal.integrated.autoReplies" /* TerminalSettingId.AutoReplies */)) {
                        directProxy.uninstallAllAutoReplies();
                        const config = this._configurationService.getValue(terminal_3.TERMINAL_CONFIG_SECTION);
                        for (const match of Object.keys(config.autoReplies)) {
                            // Ensure the reply is value
                            const reply = config.autoReplies[match];
                            if (reply) {
                                this._proxy.installAutoReply(match, reply);
                            }
                        }
                    }
                }));
                // Eagerly fetch the backend's environment for memoization
                this.getEnvironment();
            });
        }
        async requestDetachInstance(workspaceId, instanceId) {
            return this._proxy.requestDetachInstance(workspaceId, instanceId);
        }
        async acceptDetachInstanceReply(requestId, persistentProcessId) {
            if (!persistentProcessId) {
                this._logService.warn('Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId');
                return;
            }
            return this._proxy.acceptDetachInstanceReply(requestId, persistentProcessId);
        }
        async persistTerminalState() {
            const ids = Array.from(this._ptys.keys());
            const serialized = await this._proxy.serializeTerminalState(ids);
            this._storageService.store("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async updateTitle(id, title, titleSource) {
            await this._proxy.updateTitle(id, title, titleSource);
        }
        async updateIcon(id, userInitiated, icon, color) {
            await this._proxy.updateIcon(id, userInitiated, icon, color);
        }
        async updateProperty(id, property, value) {
            return this._proxy.updateProperty(id, property, value);
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, options, shouldPersist) {
            await this._connectToDirectProxy();
            const executableEnv = await this._shellEnvironmentService.getShellEnv();
            const id = await this._proxy.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, this._getWorkspaceId(), this._getWorkspaceName());
            const pty = new localPty_1.LocalPty(id, shouldPersist, this._proxy);
            this._ptys.set(id, pty);
            return pty;
        }
        async attachToProcess(id) {
            await this._connectToDirectProxy();
            try {
                await this._proxy.attachToProcess(id);
                const pty = new localPty_1.LocalPty(id, true, this._proxy);
                this._ptys.set(id, pty);
                return pty;
            }
            catch (e) {
                this._logService.warn(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async attachToRevivedProcess(id) {
            await this._connectToDirectProxy();
            try {
                const newId = await this._proxy.getRevivedPtyNewId(this._getWorkspaceId(), id) ?? id;
                return await this.attachToProcess(newId);
            }
            catch (e) {
                this._logService.warn(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async listProcesses() {
            await this._connectToDirectProxy();
            return this._proxy.listProcesses();
        }
        async getLatency() {
            const measurements = [];
            const sw = new stopwatch_1.StopWatch();
            if (this._directProxy) {
                await this._directProxy.getLatency();
                sw.stop();
                measurements.push({
                    label: 'window<->ptyhost (message port)',
                    latency: sw.elapsed()
                });
                sw.reset();
            }
            const results = await this._localPtyService.getLatency();
            sw.stop();
            measurements.push({
                label: 'window<->ptyhostservice<->ptyhost',
                latency: sw.elapsed()
            });
            return [
                ...measurements,
                ...results
            ];
        }
        async getPerformanceMarks() {
            return this._proxy.getPerformanceMarks();
        }
        async reduceConnectionGraceTime() {
            this._proxy.reduceConnectionGraceTime();
        }
        async getDefaultSystemShell(osOverride) {
            return this._proxy.getDefaultSystemShell(osOverride);
        }
        async getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
            return this._localPtyService.getProfiles(this._workspaceContextService.getWorkspace().id, profiles, defaultProfile, includeDetectedProfiles) || [];
        }
        async getEnvironment() {
            return this._proxy.getEnvironment();
        }
        async getShellEnvironment() {
            return this._shellEnvironmentService.getShellEnv();
        }
        async getWslPath(original, direction) {
            return this._proxy.getWslPath(original, direction);
        }
        async setTerminalLayoutInfo(layoutInfo) {
            const args = {
                workspaceId: this._getWorkspaceId(),
                tabs: layoutInfo ? layoutInfo.tabs : []
            };
            await this._proxy.setTerminalLayoutInfo(args);
            // Store in the storage service as well to be used when reviving processes as normally this
            // is stored in memory on the pty host
            this._storageService.store("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, JSON.stringify(args), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async getTerminalLayoutInfo() {
            const workspaceId = this._getWorkspaceId();
            const layoutArgs = { workspaceId };
            // Revive processes if needed
            const serializedState = this._storageService.get("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
            const reviveBufferState = this._deserializeTerminalState(serializedState);
            if (reviveBufferState && reviveBufferState.length > 0) {
                try {
                    // Create variable resolver
                    const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
                    const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
                    const variableResolver = terminalEnvironment.createVariableResolver(lastActiveWorkspace, await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority), this._configurationResolverService);
                    // Re-resolve the environments and replace it on the state so local terminals use a fresh
                    // environment
                    (0, performance_1.mark)('code/terminal/willGetReviveEnvironments');
                    await Promise.all(reviveBufferState.map(state => new Promise(r => {
                        this._resolveEnvironmentForRevive(variableResolver, state.shellLaunchConfig).then(freshEnv => {
                            state.processLaunchConfig.env = freshEnv;
                            r();
                        });
                    })));
                    (0, performance_1.mark)('code/terminal/didGetReviveEnvironments');
                    (0, performance_1.mark)('code/terminal/willReviveTerminalProcesses');
                    await this._proxy.reviveTerminalProcesses(workspaceId, reviveBufferState, Intl.DateTimeFormat().resolvedOptions().locale);
                    (0, performance_1.mark)('code/terminal/didReviveTerminalProcesses');
                    this._storageService.remove("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
                    // If reviving processes, send the terminal layout info back to the pty host as it
                    // will not have been persisted on application exit
                    const layoutInfo = this._storageService.get("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                    if (layoutInfo) {
                        (0, performance_1.mark)('code/terminal/willSetTerminalLayoutInfo');
                        await this._proxy.setTerminalLayoutInfo(JSON.parse(layoutInfo));
                        (0, performance_1.mark)('code/terminal/didSetTerminalLayoutInfo');
                        this._storageService.remove("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                    }
                }
                catch (e) {
                    this._logService.warn('LocalTerminalBackend#getTerminalLayoutInfo Error', e && typeof e === 'object' && 'message' in e ? e.message : e);
                }
            }
            return this._proxy.getTerminalLayoutInfo(layoutArgs);
        }
        async _resolveEnvironmentForRevive(variableResolver, shellLaunchConfig) {
            const platformKey = platform_1.isWindows ? 'windows' : (platform_1.isMacintosh ? 'osx' : 'linux');
            const envFromConfigValue = this._configurationService.getValue(`terminal.integrated.env.${platformKey}`);
            const baseEnv = await (shellLaunchConfig.useShellEnvironment ? this.getShellEnvironment() : this.getEnvironment());
            const env = await terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, envFromConfigValue, variableResolver, this._productService.version, this._configurationService.getValue("terminal.integrated.detectLocale" /* TerminalSettingId.DetectLocale */), baseEnv);
            if (!shellLaunchConfig.strictEnv && !shellLaunchConfig.hideFromUser) {
                const workspaceFolder = terminalEnvironment.getWorkspaceForTerminal(shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
                await this._environmentVariableService.mergedCollection.applyToProcessEnvironment(env, { workspaceFolder }, variableResolver);
            }
            return env;
        }
        _getWorkspaceName() {
            return this._labelService.getWorkspaceLabel(this._workspaceContextService.getWorkspace());
        }
    };
    __decorate([
        decorators_1.memoize
    ], LocalTerminalBackend.prototype, "getEnvironment", null);
    __decorate([
        decorators_1.memoize
    ], LocalTerminalBackend.prototype, "getShellEnvironment", null);
    LocalTerminalBackend = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, lifecycle_1.ILifecycleService),
        __param(2, terminal_1.ITerminalLogService),
        __param(3, terminal_1.ILocalPtyService),
        __param(4, label_1.ILabelService),
        __param(5, shellEnvironmentService_1.IShellEnvironmentService),
        __param(6, storage_1.IStorageService),
        __param(7, configurationResolver_1.IConfigurationResolverService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, productService_1.IProductService),
        __param(10, history_1.IHistoryService),
        __param(11, terminal_3.ITerminalProfileResolverService),
        __param(12, environmentVariable_1.IEnvironmentVariableService),
        __param(13, history_1.IHistoryService),
        __param(14, native_1.INativeHostService),
        __param(15, statusbar_1.IStatusbarService),
        __param(16, remoteAgentService_1.IRemoteAgentService)
    ], LocalTerminalBackend);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxUZXJtaW5hbEJhY2tlbmQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2VsZWN0cm9uLXNhbmRib3gvbG9jYWxUZXJtaW5hbEJhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUN6RixJQUFNLGdDQUFnQyxHQUF0QyxNQUFNLGdDQUFnQztRQUM1QyxZQUN3QixvQkFBMkMsRUFDeEMsdUJBQWlEO1lBRTNFLE1BQU0sT0FBTyxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQzFFLG1CQUFRLENBQUMsRUFBRSxDQUEyQiw2QkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuRyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckUsQ0FBQztLQUNELENBQUE7SUFUWSw0RUFBZ0M7K0NBQWhDLGdDQUFnQztRQUUxQyxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsbUNBQXdCLENBQUE7T0FIZCxnQ0FBZ0MsQ0FTNUM7SUFFRCxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHlDQUFtQjtRQU9yRDs7OztXQUlHO1FBQ0gsSUFBWSxNQUFNLEtBQWtCLE9BQU8sSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBR3hGLElBQUksU0FBUyxLQUFvQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxRQUFRLEtBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFLaEQsWUFDMkIsdUJBQWlELEVBQ3hELGlCQUFxRCxFQUNuRCxVQUErQixFQUNsQyxnQkFBbUQsRUFDdEQsYUFBNkMsRUFDbEMsd0JBQW1FLEVBQzVFLGVBQWlELEVBQ25DLDZCQUE2RSxFQUNyRixxQkFBNkQsRUFDbkUsZUFBaUQsRUFDakQsZUFBaUQsRUFDakMsK0JBQWlGLEVBQ3JGLDJCQUF5RSxFQUNyRixjQUErQixFQUM1QixrQkFBdUQsRUFDeEQsZ0JBQW1DLEVBQ2pDLG1CQUF5RDtZQUU5RSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSw2QkFBNkIsRUFBRSxnQkFBZ0IsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1lBakIxRixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBRXJDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDckMsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDakIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUMzRCxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDbEIsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUErQjtZQUNwRSwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ2xELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNoQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEIsb0NBQStCLEdBQS9CLCtCQUErQixDQUFpQztZQUNwRSxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1lBRWpFLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFFckMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQXJDdEUsb0JBQWUsR0FBRyxTQUFTLENBQUM7WUFFcEIsVUFBSyxHQUEwQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBV3pDLGVBQVUsR0FBRyxJQUFJLHVCQUFlLEVBQVEsQ0FBQztZQUl6Qyx3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFrRSxDQUFDLENBQUM7WUFDNUgsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQXVCNUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7Z0JBQzlCLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxTQUFTLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVEOztXQUVHO1FBQ0ssS0FBSyxDQUFDLHFCQUFxQjtZQUNsQyxxQ0FBcUM7WUFDckMsSUFBSSxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztnQkFDdkMsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDNUMsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLHVCQUFlLEVBQXFCLENBQUM7WUFDN0UsSUFBSSxDQUFDLDRCQUE0QixHQUFHLDJCQUEyQixDQUFDO1lBQ2hFLE1BQU0sV0FBVyxHQUFHLGtCQUFZLENBQUMsU0FBUyxDQUFjLElBQUEsdUJBQWlCLEVBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLDhCQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JMLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1lBRWhDLGdGQUFnRjtZQUNoRixxQ0FBcUM7WUFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQztnQkFDaEUsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxpQ0FBeUIsQ0FBQztZQUM1RCxDQUFDO1lBRUQsSUFBQSxrQkFBSSxFQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQztZQUN4RSxJQUFBLG9CQUFXLEVBQUMsb0NBQW9DLEVBQUUsMENBQTBDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pHLElBQUEsa0JBQUksRUFBQyxpQ0FBaUMsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO2dCQUM1RSwrRUFBK0U7Z0JBQy9FLHlGQUF5RjtnQkFDekYsb0ZBQW9GO2dCQUNwRiwyQ0FBMkM7Z0JBQzNDLE1BQU0sTUFBTSxHQUFHLElBQUksZUFBaUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDekYsMkJBQTJCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRWhDLDJCQUEyQjtnQkFDM0IsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzFFLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDaEcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNqQyxJQUFJLEdBQUcsRUFBRSxDQUFDO3dCQUNULEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pCLENBQUM7Z0JBQ0YsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVFLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM5RSxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RixXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRFLDRCQUE0QjtnQkFDNUIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBeUIsa0NBQXVCLENBQUMsQ0FBQztnQkFDM0csS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO29CQUM1RCw0QkFBNEI7b0JBQzVCLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFrQixDQUFDO29CQUNoRSxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUNYLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzVDLENBQUM7Z0JBQ0YsQ0FBQztnQkFDRCwrQ0FBK0M7Z0JBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRTtvQkFDNUUsSUFBSSxDQUFDLENBQUMsb0JBQW9CLHVFQUErQixFQUFFLENBQUM7d0JBQzNELFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO3dCQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUF5QixrQ0FBdUIsQ0FBQyxDQUFDO3dCQUNwRyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7NEJBQ3JELDRCQUE0Qjs0QkFDNUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQWtCLENBQUM7NEJBQ3pELElBQUksS0FBSyxFQUFFLENBQUM7Z0NBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7NEJBQzVDLENBQUM7d0JBQ0YsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRUosMERBQTBEO2dCQUMxRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFdBQW1CLEVBQUUsVUFBa0I7WUFDbEUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsS0FBSyxDQUFDLHlCQUF5QixDQUFDLFNBQWlCLEVBQUUsbUJBQTRCO1lBQzlFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxrR0FBa0csQ0FBQyxDQUFDO2dCQUMxSCxPQUFPO1lBQ1IsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsS0FBSyxDQUFDLG9CQUFvQjtZQUN6QixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMxQyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLGtGQUEwQyxVQUFVLGdFQUFnRCxDQUFDO1FBQ2hJLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQVUsRUFBRSxLQUFhLEVBQUUsV0FBNkI7WUFDekUsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQVUsRUFBRSxhQUFzQixFQUFFLElBQThFLEVBQUUsS0FBYztZQUNsSixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxLQUFLLENBQUMsY0FBYyxDQUFnQyxFQUFVLEVBQUUsUUFBNkIsRUFBRSxLQUE2QjtZQUMzSCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELEtBQUssQ0FBQyxhQUFhLENBQ2xCLGlCQUFxQyxFQUNyQyxHQUFXLEVBQ1gsSUFBWSxFQUNaLElBQVksRUFDWixjQUEwQixFQUMxQixHQUF3QixFQUN4QixPQUFnQyxFQUNoQyxhQUFzQjtZQUV0QixNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ25DLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3hFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUM3TCxNQUFNLEdBQUcsR0FBRyxJQUFJLG1CQUFRLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVELEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBVTtZQUMvQixNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQztnQkFDSixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLEdBQUcsR0FBRyxJQUFJLG1CQUFRLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDeEIsT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDWixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDbEUsQ0FBQztZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLLENBQUMsc0JBQXNCLENBQUMsRUFBVTtZQUN0QyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQztnQkFDSixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDckYsT0FBTyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWE7WUFDbEIsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUNuQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVELEtBQUssQ0FBQyxVQUFVO1lBQ2YsTUFBTSxZQUFZLEdBQWlDLEVBQUUsQ0FBQztZQUN0RCxNQUFNLEVBQUUsR0FBRyxJQUFJLHFCQUFTLEVBQUUsQ0FBQztZQUMzQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNyQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1YsWUFBWSxDQUFDLElBQUksQ0FBQztvQkFDakIsS0FBSyxFQUFFLGlDQUFpQztvQkFDeEMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUU7aUJBQ3JCLENBQUMsQ0FBQztnQkFDSCxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWixDQUFDO1lBQ0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDekQsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDakIsS0FBSyxFQUFFLG1DQUFtQztnQkFDMUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUU7YUFDckIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztnQkFDTixHQUFHLFlBQVk7Z0JBQ2YsR0FBRyxPQUFPO2FBQ1YsQ0FBQztRQUNILENBQUM7UUFFRCxLQUFLLENBQUMsbUJBQW1CO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFFRCxLQUFLLENBQUMseUJBQXlCO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFVBQTRCO1lBQ3ZELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFpQixFQUFFLGNBQXVCLEVBQUUsdUJBQWlDO1lBQzlGLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEosQ0FBQztRQUdLLEFBQU4sS0FBSyxDQUFDLGNBQWM7WUFDbkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFHSyxBQUFOLEtBQUssQ0FBQyxtQkFBbUI7WUFDeEIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBZ0IsRUFBRSxTQUF3QztZQUMxRSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFVBQXFDO1lBQ2hFLE1BQU0sSUFBSSxHQUErQjtnQkFDeEMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ25DLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7YUFDdkMsQ0FBQztZQUNGLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QywyRkFBMkY7WUFDM0Ysc0NBQXNDO1lBQ3RDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxnRkFBeUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0VBQWdELENBQUM7UUFDekksQ0FBQztRQUVELEtBQUssQ0FBQyxxQkFBcUI7WUFDMUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzNDLE1BQU0sVUFBVSxHQUErQixFQUFFLFdBQVcsRUFBRSxDQUFDO1lBRS9ELDZCQUE2QjtZQUM3QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsaUhBQWlFLENBQUM7WUFDbEgsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDMUUsSUFBSSxpQkFBaUIsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZELElBQUksQ0FBQztvQkFDSiwyQkFBMkI7b0JBQzNCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO29CQUNqRixNQUFNLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztvQkFDdkosTUFBTSxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO29CQUU5TSx5RkFBeUY7b0JBQ3pGLGNBQWM7b0JBQ2QsSUFBQSxrQkFBSSxFQUFDLHlDQUF5QyxDQUFDLENBQUM7b0JBQ2hELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBTyxDQUFDLENBQUMsRUFBRTt3QkFDdEUsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTs0QkFDNUYsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7NEJBQ3pDLENBQUMsRUFBRSxDQUFDO3dCQUNMLENBQUMsQ0FBQyxDQUFDO29CQUNKLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDTCxJQUFBLGtCQUFJLEVBQUMsd0NBQXdDLENBQUMsQ0FBQztvQkFFL0MsSUFBQSxrQkFBSSxFQUFDLDJDQUEyQyxDQUFDLENBQUM7b0JBQ2xELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMxSCxJQUFBLGtCQUFJLEVBQUMsMENBQTBDLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLGlIQUFpRSxDQUFDO29CQUM3RixrRkFBa0Y7b0JBQ2xGLG1EQUFtRDtvQkFDbkQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLCtHQUFnRSxDQUFDO29CQUM1RyxJQUFJLFVBQVUsRUFBRSxDQUFDO3dCQUNoQixJQUFBLGtCQUFJLEVBQUMseUNBQXlDLENBQUMsQ0FBQzt3QkFDaEQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDaEUsSUFBQSxrQkFBSSxFQUFDLHdDQUF3QyxDQUFDLENBQUM7d0JBQy9DLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSwrR0FBZ0UsQ0FBQztvQkFDN0YsQ0FBQztnQkFDRixDQUFDO2dCQUFDLE9BQU8sQ0FBVSxFQUFFLENBQUM7b0JBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtEQUFrRCxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pJLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFTyxLQUFLLENBQUMsNEJBQTRCLENBQUMsZ0JBQWtFLEVBQUUsaUJBQXFDO1lBQ25KLE1BQU0sV0FBVyxHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxzQkFBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVFLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBbUMsMkJBQTJCLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDM0ksTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDbkgsTUFBTSxHQUFHLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyx5QkFBeUIsQ0FBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSx5RUFBZ0MsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNyTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3JFLE1BQU0sZUFBZSxHQUFHLG1CQUFtQixDQUFDLHVCQUF1QixDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNoSixNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLEVBQUUsRUFBRSxlQUFlLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQy9ILENBQUM7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLENBQUM7S0FDRCxDQUFBO0lBckZNO1FBREwsb0JBQU87OERBR1A7SUFHSztRQURMLG9CQUFPO21FQUdQO0lBN1BJLG9CQUFvQjtRQXNCdkIsV0FBQSxvQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsOEJBQW1CLENBQUE7UUFDbkIsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLGtEQUF3QixDQUFBO1FBQ3hCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEscURBQTZCLENBQUE7UUFDN0IsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLGdDQUFlLENBQUE7UUFDZixZQUFBLHlCQUFlLENBQUE7UUFDZixZQUFBLDBDQUErQixDQUFBO1FBQy9CLFlBQUEsaURBQTJCLENBQUE7UUFDM0IsWUFBQSx5QkFBZSxDQUFBO1FBQ2YsWUFBQSwyQkFBa0IsQ0FBQTtRQUNsQixZQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFlBQUEsd0NBQW1CLENBQUE7T0F0Q2hCLG9CQUFvQixDQTJVekIifQ==
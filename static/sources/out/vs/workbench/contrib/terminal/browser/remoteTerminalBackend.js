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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/marshalling", "vs/base/common/performance", "vs/base/common/stopwatch", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/storage/common/storage", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/baseTerminalBackend", "vs/workbench/contrib/terminal/browser/remotePty", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/remote/remoteTerminalChannel", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/history/common/history", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, async_1, event_1, marshalling_1, performance_1, stopwatch_1, commands_1, configuration_1, instantiation_1, platform_1, remoteAuthorityResolver_1, storage_1, terminal_1, workspace_1, baseTerminalBackend_1, remotePty_1, terminal_2, remoteTerminalChannel_1, terminal_3, configurationResolver_1, history_1, remoteAgentService_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteTerminalBackendContribution = void 0;
    let RemoteTerminalBackendContribution = class RemoteTerminalBackendContribution {
        constructor(instantiationService, remoteAgentService, terminalInstanceService) {
            const connection = remoteAgentService.getConnection();
            if (connection?.remoteAuthority) {
                const channel = instantiationService.createInstance(remoteTerminalChannel_1.RemoteTerminalChannelClient, connection.remoteAuthority, connection.getChannel(remoteTerminalChannel_1.REMOTE_TERMINAL_CHANNEL_NAME));
                const backend = instantiationService.createInstance(RemoteTerminalBackend, connection.remoteAuthority, channel);
                platform_1.Registry.as(terminal_1.TerminalExtensions.Backend).registerTerminalBackend(backend);
                terminalInstanceService.didRegisterBackend(backend.remoteAuthority);
            }
        }
    };
    exports.RemoteTerminalBackendContribution = RemoteTerminalBackendContribution;
    exports.RemoteTerminalBackendContribution = RemoteTerminalBackendContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, remoteAgentService_1.IRemoteAgentService),
        __param(2, terminal_2.ITerminalInstanceService)
    ], RemoteTerminalBackendContribution);
    let RemoteTerminalBackend = class RemoteTerminalBackend extends baseTerminalBackend_1.BaseTerminalBackend {
        get whenReady() { return this._whenConnected.p; }
        setReady() { this._whenConnected.complete(); }
        constructor(remoteAuthority, _remoteTerminalChannel, _remoteAgentService, _instantiationService, logService, _commandService, _storageService, _remoteAuthorityResolverService, workspaceContextService, configurationResolverService, _historyService, _configurationService, statusBarService) {
            super(_remoteTerminalChannel, logService, _historyService, configurationResolverService, statusBarService, workspaceContextService);
            this.remoteAuthority = remoteAuthority;
            this._remoteTerminalChannel = _remoteTerminalChannel;
            this._remoteAgentService = _remoteAgentService;
            this._instantiationService = _instantiationService;
            this._commandService = _commandService;
            this._storageService = _storageService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._historyService = _historyService;
            this._configurationService = _configurationService;
            this._ptys = new Map();
            this._whenConnected = new async_1.DeferredPromise();
            this._onDidRequestDetach = this._register(new event_1.Emitter());
            this.onDidRequestDetach = this._onDidRequestDetach.event;
            this._onRestoreCommands = this._register(new event_1.Emitter());
            this.onRestoreCommands = this._onRestoreCommands.event;
            this._remoteTerminalChannel.onProcessData(e => this._ptys.get(e.id)?.handleData(e.event));
            this._remoteTerminalChannel.onProcessReplay(e => {
                this._ptys.get(e.id)?.handleReplay(e.event);
                if (e.event.commands.commands.length > 0) {
                    this._onRestoreCommands.fire({ id: e.id, commands: e.event.commands.commands });
                }
            });
            this._remoteTerminalChannel.onProcessOrphanQuestion(e => this._ptys.get(e.id)?.handleOrphanQuestion());
            this._remoteTerminalChannel.onDidRequestDetach(e => this._onDidRequestDetach.fire(e));
            this._remoteTerminalChannel.onProcessReady(e => this._ptys.get(e.id)?.handleReady(e.event));
            this._remoteTerminalChannel.onDidChangeProperty(e => this._ptys.get(e.id)?.handleDidChangeProperty(e.property));
            this._remoteTerminalChannel.onProcessExit(e => {
                const pty = this._ptys.get(e.id);
                if (pty) {
                    pty.handleExit(e.event);
                    this._ptys.delete(e.id);
                }
            });
            const allowedCommands = ['_remoteCLI.openExternal', '_remoteCLI.windowOpen', '_remoteCLI.getSystemStatus', '_remoteCLI.manageExtensions'];
            this._remoteTerminalChannel.onExecuteCommand(async (e) => {
                // Ensure this request for for this window
                const pty = this._ptys.get(e.persistentProcessId);
                if (!pty) {
                    return;
                }
                const reqId = e.reqId;
                const commandId = e.commandId;
                if (!allowedCommands.includes(commandId)) {
                    this._remoteTerminalChannel.sendCommandResult(reqId, true, 'Invalid remote cli command: ' + commandId);
                    return;
                }
                const commandArgs = e.commandArgs.map(arg => (0, marshalling_1.revive)(arg));
                try {
                    const result = await this._commandService.executeCommand(e.commandId, ...commandArgs);
                    this._remoteTerminalChannel.sendCommandResult(reqId, false, result);
                }
                catch (err) {
                    this._remoteTerminalChannel.sendCommandResult(reqId, true, err);
                }
            });
            // Listen for config changes
            const initialConfig = this._configurationService.getValue(terminal_3.TERMINAL_CONFIG_SECTION);
            for (const match of Object.keys(initialConfig.autoReplies)) {
                // Ensure the value is truthy
                const reply = initialConfig.autoReplies[match];
                if (reply) {
                    this._remoteTerminalChannel.installAutoReply(match, reply);
                }
            }
            // TODO: Could simplify update to a single call
            this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("terminal.integrated.autoReplies" /* TerminalSettingId.AutoReplies */)) {
                    this._remoteTerminalChannel.uninstallAllAutoReplies();
                    const config = this._configurationService.getValue(terminal_3.TERMINAL_CONFIG_SECTION);
                    for (const match of Object.keys(config.autoReplies)) {
                        // Ensure the value is truthy
                        const reply = config.autoReplies[match];
                        if (reply) {
                            await this._remoteTerminalChannel.installAutoReply(match, reply);
                        }
                    }
                }
            }));
            this._onPtyHostConnected.fire();
        }
        async requestDetachInstance(workspaceId, instanceId) {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot request detach instance when there is no remote!`);
            }
            return this._remoteTerminalChannel.requestDetachInstance(workspaceId, instanceId);
        }
        async acceptDetachInstanceReply(requestId, persistentProcessId) {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot accept detached instance when there is no remote!`);
            }
            else if (!persistentProcessId) {
                this._logService.warn('Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId');
                return;
            }
            return this._remoteTerminalChannel.acceptDetachInstanceReply(requestId, persistentProcessId);
        }
        async persistTerminalState() {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot persist terminal state when there is no remote!`);
            }
            const ids = Array.from(this._ptys.keys());
            const serialized = await this._remoteTerminalChannel.serializeTerminalState(ids);
            this._storageService.store("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async createProcess(shellLaunchConfig, cwd, // TODO: This is ignored
        cols, rows, unicodeVersion, env, // TODO: This is ignored
        options, shouldPersist) {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot create remote terminal when there is no remote!`);
            }
            // Fetch the environment to check shell permissions
            const remoteEnv = await this._remoteAgentService.getEnvironment();
            if (!remoteEnv) {
                // Extension host processes are only allowed in remote extension hosts currently
                throw new Error('Could not fetch remote environment');
            }
            const terminalConfig = this._configurationService.getValue(terminal_3.TERMINAL_CONFIG_SECTION);
            const configuration = {
                'terminal.integrated.env.windows': this._configurationService.getValue("terminal.integrated.env.windows" /* TerminalSettingId.EnvWindows */),
                'terminal.integrated.env.osx': this._configurationService.getValue("terminal.integrated.env.osx" /* TerminalSettingId.EnvMacOs */),
                'terminal.integrated.env.linux': this._configurationService.getValue("terminal.integrated.env.linux" /* TerminalSettingId.EnvLinux */),
                'terminal.integrated.cwd': this._configurationService.getValue("terminal.integrated.cwd" /* TerminalSettingId.Cwd */),
                'terminal.integrated.detectLocale': terminalConfig.detectLocale
            };
            const shellLaunchConfigDto = {
                name: shellLaunchConfig.name,
                executable: shellLaunchConfig.executable,
                args: shellLaunchConfig.args,
                cwd: shellLaunchConfig.cwd,
                env: shellLaunchConfig.env,
                useShellEnvironment: shellLaunchConfig.useShellEnvironment,
                reconnectionProperties: shellLaunchConfig.reconnectionProperties,
                type: shellLaunchConfig.type,
                isFeatureTerminal: shellLaunchConfig.isFeatureTerminal
            };
            const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
            const result = await this._remoteTerminalChannel.createProcess(shellLaunchConfigDto, configuration, activeWorkspaceRootUri, options, shouldPersist, cols, rows, unicodeVersion);
            const pty = this._instantiationService.createInstance(remotePty_1.RemotePty, result.persistentTerminalId, shouldPersist, this._remoteTerminalChannel);
            this._ptys.set(result.persistentTerminalId, pty);
            return pty;
        }
        async attachToProcess(id) {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot create remote terminal when there is no remote!`);
            }
            try {
                await this._remoteTerminalChannel.attachToProcess(id);
                const pty = this._instantiationService.createInstance(remotePty_1.RemotePty, id, true, this._remoteTerminalChannel);
                this._ptys.set(id, pty);
                return pty;
            }
            catch (e) {
                this._logService.trace(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async attachToRevivedProcess(id) {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot create remote terminal when there is no remote!`);
            }
            try {
                const newId = await this._remoteTerminalChannel.getRevivedPtyNewId(id) ?? id;
                return await this.attachToProcess(newId);
            }
            catch (e) {
                this._logService.trace(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async listProcesses() {
            return this._remoteTerminalChannel.listProcesses();
        }
        async getLatency() {
            const sw = new stopwatch_1.StopWatch();
            const results = await this._remoteTerminalChannel.getLatency();
            sw.stop();
            return [
                {
                    label: 'window<->ptyhostservice<->ptyhost',
                    latency: sw.elapsed()
                },
                ...results
            ];
        }
        async updateProperty(id, property, value) {
            await this._remoteTerminalChannel.updateProperty(id, property, value);
        }
        async updateTitle(id, title, titleSource) {
            await this._remoteTerminalChannel.updateTitle(id, title, titleSource);
        }
        async updateIcon(id, userInitiated, icon, color) {
            await this._remoteTerminalChannel.updateIcon(id, userInitiated, icon, color);
        }
        async getDefaultSystemShell(osOverride) {
            return this._remoteTerminalChannel.getDefaultSystemShell(osOverride) || '';
        }
        async getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
            return this._remoteTerminalChannel.getProfiles(profiles, defaultProfile, includeDetectedProfiles) || [];
        }
        async getEnvironment() {
            return this._remoteTerminalChannel.getEnvironment() || {};
        }
        async getShellEnvironment() {
            const connection = this._remoteAgentService.getConnection();
            if (!connection) {
                return undefined;
            }
            const resolverResult = await this._remoteAuthorityResolverService.resolveAuthority(connection.remoteAuthority);
            return resolverResult.options?.extensionHostEnv;
        }
        async getWslPath(original, direction) {
            const env = await this._remoteAgentService.getEnvironment();
            if (env?.os !== 1 /* OperatingSystem.Windows */) {
                return original;
            }
            return this._remoteTerminalChannel.getWslPath(original, direction) || original;
        }
        async setTerminalLayoutInfo(layout) {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot call setActiveInstanceId when there is no remote`);
            }
            return this._remoteTerminalChannel.setTerminalLayoutInfo(layout);
        }
        async reduceConnectionGraceTime() {
            if (!this._remoteTerminalChannel) {
                throw new Error('Cannot reduce grace time when there is no remote');
            }
            return this._remoteTerminalChannel.reduceConnectionGraceTime();
        }
        async getTerminalLayoutInfo() {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot call getActiveInstanceId when there is no remote`);
            }
            const workspaceId = this._getWorkspaceId();
            // Revive processes if needed
            const serializedState = this._storageService.get("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
            const reviveBufferState = this._deserializeTerminalState(serializedState);
            if (reviveBufferState && reviveBufferState.length > 0) {
                try {
                    // Note that remote terminals do not get their environment re-resolved unlike in local terminals
                    (0, performance_1.mark)('code/terminal/willReviveTerminalProcessesRemote');
                    await this._remoteTerminalChannel.reviveTerminalProcesses(workspaceId, reviveBufferState, Intl.DateTimeFormat().resolvedOptions().locale);
                    (0, performance_1.mark)('code/terminal/didReviveTerminalProcessesRemote');
                    this._storageService.remove("terminal.integrated.bufferState" /* TerminalStorageKeys.TerminalBufferState */, 1 /* StorageScope.WORKSPACE */);
                    // If reviving processes, send the terminal layout info back to the pty host as it
                    // will not have been persisted on application exit
                    const layoutInfo = this._storageService.get("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                    if (layoutInfo) {
                        (0, performance_1.mark)('code/terminal/willSetTerminalLayoutInfoRemote');
                        await this._remoteTerminalChannel.setTerminalLayoutInfo(JSON.parse(layoutInfo));
                        (0, performance_1.mark)('code/terminal/didSetTerminalLayoutInfoRemote');
                        this._storageService.remove("terminal.integrated.layoutInfo" /* TerminalStorageKeys.TerminalLayoutInfo */, 1 /* StorageScope.WORKSPACE */);
                    }
                }
                catch (e) {
                    this._logService.warn('RemoteTerminalBackend#getTerminalLayoutInfo Error', e && typeof e === 'object' && 'message' in e ? e.message : e);
                }
            }
            return this._remoteTerminalChannel.getTerminalLayoutInfo();
        }
        async getPerformanceMarks() {
            return this._remoteTerminalChannel.getPerformanceMarks();
        }
    };
    RemoteTerminalBackend = __decorate([
        __param(2, remoteAgentService_1.IRemoteAgentService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, terminal_1.ITerminalLogService),
        __param(5, commands_1.ICommandService),
        __param(6, storage_1.IStorageService),
        __param(7, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, configurationResolver_1.IConfigurationResolverService),
        __param(10, history_1.IHistoryService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, statusbar_1.IStatusbarService)
    ], RemoteTerminalBackend);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVGVybWluYWxCYWNrZW5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3JlbW90ZVRlcm1pbmFsQmFja2VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE4QnpGLElBQU0saUNBQWlDLEdBQXZDLE1BQU0saUNBQWlDO1FBQzdDLFlBQ3dCLG9CQUEyQyxFQUM3QyxrQkFBdUMsRUFDbEMsdUJBQWlEO1lBRTNFLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3RELElBQUksVUFBVSxFQUFFLGVBQWUsRUFBRSxDQUFDO2dCQUNqQyxNQUFNLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsbURBQTJCLEVBQUUsVUFBVSxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLG9EQUE0QixDQUFDLENBQUMsQ0FBQztnQkFDbEssTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ2hILG1CQUFRLENBQUMsRUFBRSxDQUEyQiw2QkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkcsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQWRZLDhFQUFpQztnREFBakMsaUNBQWlDO1FBRTNDLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSx3Q0FBbUIsQ0FBQTtRQUNuQixXQUFBLG1DQUF3QixDQUFBO09BSmQsaUNBQWlDLENBYzdDO0lBRUQsSUFBTSxx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
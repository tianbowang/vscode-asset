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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalDataBuffering", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalProcessExtHostProxy", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/platform/terminal/common/environmentVariableShared", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform", "vs/base/common/async", "vs/workbench/contrib/terminalContrib/links/browser/links", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix"], function (require, exports, lifecycle_1, extHost_protocol_1, extHostCustomers_1, uri_1, instantiation_1, log_1, terminal_1, terminalDataBuffering_1, terminal_2, terminalProcessExtHostProxy_1, environmentVariable_1, environmentVariableShared_1, terminal_3, remoteAgentService_1, platform_1, async_1, links_1, quickFix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOutputMatchForLines = exports.MainThreadTerminalService = void 0;
    let MainThreadTerminalService = class MainThreadTerminalService {
        constructor(_extHostContext, _terminalService, _terminalLinkProviderService, _terminalQuickFixService, _instantiationService, _environmentVariableService, _logService, _terminalProfileResolverService, remoteAgentService, _terminalGroupService, _terminalEditorService, _terminalProfileService) {
            this._extHostContext = _extHostContext;
            this._terminalService = _terminalService;
            this._terminalLinkProviderService = _terminalLinkProviderService;
            this._terminalQuickFixService = _terminalQuickFixService;
            this._instantiationService = _instantiationService;
            this._environmentVariableService = _environmentVariableService;
            this._logService = _logService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._terminalGroupService = _terminalGroupService;
            this._terminalEditorService = _terminalEditorService;
            this._terminalProfileService = _terminalProfileService;
            this._store = new lifecycle_1.DisposableStore();
            /**
             * Stores a map from a temporary terminal id (a UUID generated on the extension host side)
             * to a numeric terminal id (an id generated on the renderer side)
             * This comes in play only when dealing with terminals created on the extension host side
             */
            this._extHostTerminals = new Map();
            this._terminalProcessProxies = new Map();
            this._profileProviders = new Map();
            this._quickFixProviders = new Map();
            this._dataEventTracker = new lifecycle_1.MutableDisposable();
            this._sendCommandEventListener = new lifecycle_1.MutableDisposable();
            this._os = platform_1.OS;
            this._proxy = _extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTerminalService);
            // ITerminalService listeners
            this._store.add(_terminalService.onDidCreateInstance((instance) => {
                this._onTerminalOpened(instance);
                this._onInstanceDimensionsChanged(instance);
            }));
            this._store.add(_terminalService.onDidDisposeInstance(instance => this._onTerminalDisposed(instance)));
            this._store.add(_terminalService.onAnyInstanceProcessIdReady(instance => this._onTerminalProcessIdReady(instance)));
            this._store.add(_terminalService.onDidChangeInstanceDimensions(instance => this._onInstanceDimensionsChanged(instance)));
            this._store.add(_terminalService.onAnyInstanceMaximumDimensionsChange(instance => this._onInstanceMaximumDimensionsChanged(instance)));
            this._store.add(_terminalService.onDidRequestStartExtensionTerminal(e => this._onRequestStartExtensionTerminal(e)));
            this._store.add(_terminalService.onDidChangeActiveInstance(instance => this._onActiveTerminalChanged(instance ? instance.instanceId : null)));
            this._store.add(_terminalService.onAnyInstanceTitleChange(instance => instance && this._onTitleChanged(instance.instanceId, instance.title)));
            this._store.add(_terminalService.onAnyInstanceDataInput(instance => this._proxy.$acceptTerminalInteraction(instance.instanceId)));
            this._store.add(_terminalService.onAnyInstanceSelectionChange(instance => this._proxy.$acceptTerminalSelection(instance.instanceId, instance.selection)));
            // Set initial ext host state
            for (const instance of this._terminalService.instances) {
                this._onTerminalOpened(instance);
                instance.processReady.then(() => this._onTerminalProcessIdReady(instance));
            }
            const activeInstance = this._terminalService.activeInstance;
            if (activeInstance) {
                this._proxy.$acceptActiveTerminalChanged(activeInstance.instanceId);
            }
            if (this._environmentVariableService.collections.size > 0) {
                const collectionAsArray = [...this._environmentVariableService.collections.entries()];
                const serializedCollections = collectionAsArray.map(e => {
                    return [e[0], (0, environmentVariableShared_1.serializeEnvironmentVariableCollection)(e[1].map)];
                });
                this._proxy.$initEnvironmentVariableCollections(serializedCollections);
            }
            remoteAgentService.getEnvironment().then(async (env) => {
                this._os = env?.os || platform_1.OS;
                this._updateDefaultProfile();
            });
            this._store.add(this._terminalProfileService.onDidChangeAvailableProfiles(() => this._updateDefaultProfile()));
        }
        dispose() {
            this._store.dispose();
            this._linkProvider?.dispose();
            for (const provider of this._profileProviders.values()) {
                provider.dispose();
            }
            for (const provider of this._quickFixProviders.values()) {
                provider.dispose();
            }
        }
        async _updateDefaultProfile() {
            const remoteAuthority = this._extHostContext.remoteAuthority ?? undefined;
            const defaultProfile = this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority, os: this._os });
            const defaultAutomationProfile = this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority, os: this._os, allowAutomationShell: true });
            this._proxy.$acceptDefaultProfile(...await Promise.all([defaultProfile, defaultAutomationProfile]));
        }
        async _getTerminalInstance(id) {
            if (typeof id === 'string') {
                return this._extHostTerminals.get(id);
            }
            return this._terminalService.getInstanceFromId(id);
        }
        async $createTerminal(extHostTerminalId, launchConfig) {
            const shellLaunchConfig = {
                name: launchConfig.name,
                executable: launchConfig.shellPath,
                args: launchConfig.shellArgs,
                cwd: typeof launchConfig.cwd === 'string' ? launchConfig.cwd : uri_1.URI.revive(launchConfig.cwd),
                icon: launchConfig.icon,
                color: launchConfig.color,
                initialText: launchConfig.initialText,
                waitOnExit: launchConfig.waitOnExit,
                ignoreConfigurationCwd: true,
                env: launchConfig.env,
                strictEnv: launchConfig.strictEnv,
                hideFromUser: launchConfig.hideFromUser,
                customPtyImplementation: launchConfig.isExtensionCustomPtyTerminal
                    ? (id, cols, rows) => new terminalProcessExtHostProxy_1.TerminalProcessExtHostProxy(id, cols, rows, this._terminalService)
                    : undefined,
                extHostTerminalId,
                isFeatureTerminal: launchConfig.isFeatureTerminal,
                isExtensionOwnedTerminal: launchConfig.isExtensionOwnedTerminal,
                useShellEnvironment: launchConfig.useShellEnvironment,
                isTransient: launchConfig.isTransient
            };
            const terminal = async_1.Promises.withAsyncBody(async (r) => {
                const terminal = await this._terminalService.createTerminal({
                    config: shellLaunchConfig,
                    location: await this._deserializeParentTerminal(launchConfig.location)
                });
                r(terminal);
            });
            this._extHostTerminals.set(extHostTerminalId, terminal);
            const terminalInstance = await terminal;
            this._store.add(terminalInstance.onDisposed(() => {
                this._extHostTerminals.delete(extHostTerminalId);
            }));
        }
        async _deserializeParentTerminal(location) {
            if (typeof location === 'object' && 'parentTerminal' in location) {
                const parentTerminal = await this._extHostTerminals.get(location.parentTerminal.toString());
                return parentTerminal ? { parentTerminal } : undefined;
            }
            return location;
        }
        async $show(id, preserveFocus) {
            const terminalInstance = await this._getTerminalInstance(id);
            if (terminalInstance) {
                this._terminalService.setActiveInstance(terminalInstance);
                if (terminalInstance.target === terminal_1.TerminalLocation.Editor) {
                    await this._terminalEditorService.revealActiveEditor(preserveFocus);
                }
                else {
                    await this._terminalGroupService.showPanel(!preserveFocus);
                }
            }
        }
        async $hide(id) {
            const instanceToHide = await this._getTerminalInstance(id);
            const activeInstance = this._terminalService.activeInstance;
            if (activeInstance && activeInstance.instanceId === instanceToHide?.instanceId && activeInstance.target !== terminal_1.TerminalLocation.Editor) {
                this._terminalGroupService.hidePanel();
            }
        }
        async $dispose(id) {
            (await this._getTerminalInstance(id))?.dispose(terminal_1.TerminalExitReason.Extension);
        }
        async $sendText(id, text, shouldExecute) {
            const instance = await this._getTerminalInstance(id);
            await instance?.sendText(text, shouldExecute);
        }
        $sendProcessExit(terminalId, exitCode) {
            this._terminalProcessProxies.get(terminalId)?.emitExit(exitCode);
        }
        $startSendingDataEvents() {
            if (!this._dataEventTracker.value) {
                this._dataEventTracker.value = this._instantiationService.createInstance(TerminalDataEventTracker, (id, data) => {
                    this._onTerminalData(id, data);
                });
                // Send initial events if they exist
                for (const instance of this._terminalService.instances) {
                    for (const data of instance.initialDataEvents || []) {
                        this._onTerminalData(instance.instanceId, data);
                    }
                }
            }
        }
        $stopSendingDataEvents() {
            this._dataEventTracker.clear();
        }
        $startSendingCommandEvents() {
            if (this._sendCommandEventListener.value) {
                return;
            }
            const multiplexer = this._terminalService.createOnInstanceCapabilityEvent(2 /* TerminalCapability.CommandDetection */, capability => capability.onCommandFinished);
            multiplexer.event(e => {
                this._onDidExecuteCommand(e.instance.instanceId, {
                    commandLine: e.data.command,
                    // TODO: Convert to URI if possible
                    cwd: e.data.cwd,
                    exitCode: e.data.exitCode,
                    output: e.data.getOutput()
                });
            });
            this._sendCommandEventListener.value = multiplexer;
        }
        $stopSendingCommandEvents() {
            this._sendCommandEventListener.clear();
        }
        $startLinkProvider() {
            this._linkProvider?.dispose();
            this._linkProvider = this._terminalLinkProviderService.registerLinkProvider(new ExtensionTerminalLinkProvider(this._proxy));
        }
        $stopLinkProvider() {
            this._linkProvider?.dispose();
            this._linkProvider = undefined;
        }
        $registerProcessSupport(isSupported) {
            this._terminalService.registerProcessSupport(isSupported);
        }
        $registerProfileProvider(id, extensionIdentifier) {
            // Proxy profile provider requests through the extension host
            this._profileProviders.set(id, this._terminalProfileService.registerTerminalProfileProvider(extensionIdentifier, id, {
                createContributedTerminalProfile: async (options) => {
                    return this._proxy.$createContributedProfileTerminal(id, options);
                }
            }));
        }
        $unregisterProfileProvider(id) {
            this._profileProviders.get(id)?.dispose();
            this._profileProviders.delete(id);
        }
        async $registerQuickFixProvider(id, extensionId) {
            this._quickFixProviders.set(id, this._terminalQuickFixService.registerQuickFixProvider(id, {
                provideTerminalQuickFixes: async (terminalCommand, lines, options, token) => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (options.outputMatcher?.length && options.outputMatcher.length > 40) {
                        options.outputMatcher.length = 40;
                        this._logService.warn('Cannot exceed output matcher length of 40');
                    }
                    const commandLineMatch = terminalCommand.command.match(options.commandLineMatcher);
                    if (!commandLineMatch || !lines) {
                        return;
                    }
                    const outputMatcher = options.outputMatcher;
                    let outputMatch;
                    if (outputMatcher) {
                        outputMatch = getOutputMatchForLines(lines, outputMatcher);
                    }
                    if (!outputMatch) {
                        return;
                    }
                    const matchResult = { commandLineMatch, outputMatch, commandLine: terminalCommand.command };
                    if (matchResult) {
                        const result = await this._proxy.$provideTerminalQuickFixes(id, matchResult, token);
                        if (result && Array.isArray(result)) {
                            return result.map(r => parseQuickFix(id, extensionId, r));
                        }
                        else if (result) {
                            return parseQuickFix(id, extensionId, result);
                        }
                    }
                    return;
                }
            }));
        }
        $unregisterQuickFixProvider(id) {
            this._quickFixProviders.get(id)?.dispose();
            this._quickFixProviders.delete(id);
        }
        _onActiveTerminalChanged(terminalId) {
            this._proxy.$acceptActiveTerminalChanged(terminalId);
        }
        _onTerminalData(terminalId, data) {
            this._proxy.$acceptTerminalProcessData(terminalId, data);
        }
        _onDidExecuteCommand(terminalId, command) {
            this._proxy.$acceptDidExecuteCommand(terminalId, command);
        }
        _onTitleChanged(terminalId, name) {
            this._proxy.$acceptTerminalTitleChange(terminalId, name);
        }
        _onTerminalDisposed(terminalInstance) {
            this._proxy.$acceptTerminalClosed(terminalInstance.instanceId, terminalInstance.exitCode, terminalInstance.exitReason ?? terminal_1.TerminalExitReason.Unknown);
        }
        _onTerminalOpened(terminalInstance) {
            const extHostTerminalId = terminalInstance.shellLaunchConfig.extHostTerminalId;
            const shellLaunchConfigDto = {
                name: terminalInstance.shellLaunchConfig.name,
                executable: terminalInstance.shellLaunchConfig.executable,
                args: terminalInstance.shellLaunchConfig.args,
                cwd: terminalInstance.shellLaunchConfig.cwd,
                env: terminalInstance.shellLaunchConfig.env,
                hideFromUser: terminalInstance.shellLaunchConfig.hideFromUser
            };
            this._proxy.$acceptTerminalOpened(terminalInstance.instanceId, extHostTerminalId, terminalInstance.title, shellLaunchConfigDto);
        }
        _onTerminalProcessIdReady(terminalInstance) {
            if (terminalInstance.processId === undefined) {
                return;
            }
            this._proxy.$acceptTerminalProcessId(terminalInstance.instanceId, terminalInstance.processId);
        }
        _onInstanceDimensionsChanged(instance) {
            this._proxy.$acceptTerminalDimensions(instance.instanceId, instance.cols, instance.rows);
        }
        _onInstanceMaximumDimensionsChanged(instance) {
            this._proxy.$acceptTerminalMaximumDimensions(instance.instanceId, instance.maxCols, instance.maxRows);
        }
        _onRequestStartExtensionTerminal(request) {
            const proxy = request.proxy;
            this._terminalProcessProxies.set(proxy.instanceId, proxy);
            // Note that onResize is not being listened to here as it needs to fire when max dimensions
            // change, excluding the dimension override
            const initialDimensions = request.cols && request.rows ? {
                columns: request.cols,
                rows: request.rows
            } : undefined;
            this._proxy.$startExtensionTerminal(proxy.instanceId, initialDimensions).then(request.callback);
            proxy.onInput(data => this._proxy.$acceptProcessInput(proxy.instanceId, data));
            proxy.onShutdown(immediate => this._proxy.$acceptProcessShutdown(proxy.instanceId, immediate));
            proxy.onRequestCwd(() => this._proxy.$acceptProcessRequestCwd(proxy.instanceId));
            proxy.onRequestInitialCwd(() => this._proxy.$acceptProcessRequestInitialCwd(proxy.instanceId));
        }
        $sendProcessData(terminalId, data) {
            this._terminalProcessProxies.get(terminalId)?.emitData(data);
        }
        $sendProcessReady(terminalId, pid, cwd, windowsPty) {
            this._terminalProcessProxies.get(terminalId)?.emitReady(pid, cwd, windowsPty);
        }
        $sendProcessProperty(terminalId, property) {
            if (property.type === "title" /* ProcessPropertyType.Title */) {
                const instance = this._terminalService.getInstanceFromId(terminalId);
                instance?.rename(property.value);
            }
            this._terminalProcessProxies.get(terminalId)?.emitProcessProperty(property);
        }
        $setEnvironmentVariableCollection(extensionIdentifier, persistent, collection, descriptionMap) {
            if (collection) {
                const translatedCollection = {
                    persistent,
                    map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)(collection),
                    descriptionMap: (0, environmentVariableShared_1.deserializeEnvironmentDescriptionMap)(descriptionMap)
                };
                this._environmentVariableService.set(extensionIdentifier, translatedCollection);
            }
            else {
                this._environmentVariableService.delete(extensionIdentifier);
            }
        }
    };
    exports.MainThreadTerminalService = MainThreadTerminalService;
    exports.MainThreadTerminalService = MainThreadTerminalService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadTerminalService),
        __param(1, terminal_2.ITerminalService),
        __param(2, links_1.ITerminalLinkProviderService),
        __param(3, quickFix_1.ITerminalQuickFixService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, environmentVariable_1.IEnvironmentVariableService),
        __param(6, log_1.ILogService),
        __param(7, terminal_3.ITerminalProfileResolverService),
        __param(8, remoteAgentService_1.IRemoteAgentService),
        __param(9, terminal_2.ITerminalGroupService),
        __param(10, terminal_2.ITerminalEditorService),
        __param(11, terminal_3.ITerminalProfileService)
    ], MainThreadTerminalService);
    /**
     * Encapsulates temporary tracking of data events from terminal instances, once disposed all
     * listeners are removed.
     */
    let TerminalDataEventTracker = class TerminalDataEventTracker extends lifecycle_1.Disposable {
        constructor(_callback, _terminalService) {
            super();
            this._callback = _callback;
            this._terminalService = _terminalService;
            this._register(this._bufferer = new terminalDataBuffering_1.TerminalDataBufferer(this._callback));
            for (const instance of this._terminalService.instances) {
                this._registerInstance(instance);
            }
            this._register(this._terminalService.onDidCreateInstance(instance => this._registerInstance(instance)));
            this._register(this._terminalService.onDidDisposeInstance(instance => this._bufferer.stopBuffering(instance.instanceId)));
        }
        _registerInstance(instance) {
            // Buffer data events to reduce the amount of messages going to the extension host
            this._register(this._bufferer.startBuffering(instance.instanceId, instance.onData));
        }
    };
    TerminalDataEventTracker = __decorate([
        __param(1, terminal_2.ITerminalService)
    ], TerminalDataEventTracker);
    class ExtensionTerminalLinkProvider {
        constructor(_proxy) {
            this._proxy = _proxy;
        }
        async provideLinks(instance, line) {
            const proxy = this._proxy;
            const extHostLinks = await proxy.$provideLinks(instance.instanceId, line);
            return extHostLinks.map(dto => ({
                id: dto.id,
                startIndex: dto.startIndex,
                length: dto.length,
                label: dto.label,
                activate: () => proxy.$activateLink(instance.instanceId, dto.id)
            }));
        }
    }
    function getOutputMatchForLines(lines, outputMatcher) {
        const match = lines.join('\n').match(outputMatcher.lineMatcher);
        return match ? { regexMatch: match, outputLines: lines } : undefined;
    }
    exports.getOutputMatchForLines = getOutputMatchForLines;
    function parseQuickFix(id, source, fix) {
        let type = quickFix_1.TerminalQuickFixType.TerminalCommand;
        if ('uri' in fix) {
            fix.uri = uri_1.URI.revive(fix.uri);
            type = quickFix_1.TerminalQuickFixType.Opener;
        }
        else if ('id' in fix) {
            type = quickFix_1.TerminalQuickFixType.VscodeCommand;
        }
        return { id, type, source, ...fix };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFRlcm1pbmFsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRUZXJtaW5hbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEJ6RixJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUF5QjtRQTBCckMsWUFDa0IsZUFBZ0MsRUFDL0IsZ0JBQW1ELEVBQ3ZDLDRCQUEyRSxFQUMvRSx3QkFBbUUsRUFDdEUscUJBQTZELEVBQ3ZELDJCQUF5RSxFQUN6RixXQUF5QyxFQUNyQiwrQkFBaUYsRUFDN0Ysa0JBQXVDLEVBQ3JDLHFCQUE2RCxFQUM1RCxzQkFBK0QsRUFDOUQsdUJBQWlFO1lBWHpFLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNkLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDdEIsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUE4QjtZQUM5RCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3JELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDdEMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtZQUN4RSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNKLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBaUM7WUFFMUUsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUMzQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1lBQzdDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFwQzFFLFdBQU0sR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUdoRDs7OztlQUlHO1lBQ2Msc0JBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7WUFDbEUsNEJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQXdDLENBQUM7WUFDMUUs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
(function anonymous() { /*---------------------------------------------------------------------------------------------
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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/contrib/debug/common/abstractDebugAdapter", "vs/workbench/contrib/debug/common/debugUtils", "../common/extHostConfiguration", "./extHostVariableResolverService", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/workbench/api/common/extHostCommands"], function (require, exports, async_1, event_1, uri_1, extensions_1, instantiation_1, extHost_protocol_1, extHostEditorTabs_1, extHostExtensionService_1, extHostRpcService_1, extHostTypes_1, extHostWorkspace_1, abstractDebugAdapter_1, debugUtils_1, extHostConfiguration_1, extHostVariableResolverService_1, lifecycle_1, themables_1, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkerExtHostDebugService = exports.ExtHostDebugConsole = exports.ExtHostDebugSession = exports.ExtHostDebugServiceBase = exports.IExtHostDebugService = void 0;
    exports.IExtHostDebugService = (0, instantiation_1.createDecorator)('IExtHostDebugService');
    let ExtHostDebugServiceBase = class ExtHostDebugServiceBase {
        get onDidStartDebugSession() { return this._onDidStartDebugSession.event; }
        get onDidTerminateDebugSession() { return this._onDidTerminateDebugSession.event; }
        get onDidChangeActiveDebugSession() { return this._onDidChangeActiveDebugSession.event; }
        get activeDebugSession() { return this._activeDebugSession; }
        get onDidReceiveDebugSessionCustomEvent() { return this._onDidReceiveDebugSessionCustomEvent.event; }
        get activeDebugConsole() { return this._activeDebugConsole.value; }
        constructor(extHostRpcService, _workspaceService, _extensionService, _configurationService, _editorTabs, _variableResolver, _commands) {
            this._workspaceService = _workspaceService;
            this._extensionService = _extensionService;
            this._configurationService = _configurationService;
            this._editorTabs = _editorTabs;
            this._variableResolver = _variableResolver;
            this._commands = _commands;
            this._debugSessions = new Map();
            this._debugVisualizationProviders = new Map();
            this._visualizers = new Map();
            this._visualizerIdCounter = 0;
            this._configProviderHandleCounter = 0;
            this._configProviders = [];
            this._adapterFactoryHandleCounter = 0;
            this._adapterFactories = [];
            this._trackerFactoryHandleCounter = 0;
            this._trackerFactories = [];
            this._debugAdapters = new Map();
            this._debugAdaptersTrackers = new Map();
            this._onDidStartDebugSession = new event_1.Emitter();
            this._onDidTerminateDebugSession = new event_1.Emitter();
            this._onDidChangeActiveDebugSession = new event_1.Emitter();
            this._onDidReceiveDebugSessionCustomEvent = new event_1.Emitter();
            this._debugServiceProxy = extHostRpcService.getProxy(extHost_protocol_1.MainContext.MainThreadDebugService);
            this._onDidChangeBreakpoints = new event_1.Emitter();
            this._onDidChangeStackFrameFocus = new event_1.Emitter();
            this._activeDebugConsole = new ExtHostDebugConsole(this._debugServiceProxy);
            this._breakpoints = new Map();
            this._extensionService.getExtensionRegistry().then((extensionRegistry) => {
                extensionRegistry.onDidChange(_ => {
                    this.registerAllDebugTypes(extensionRegistry);
                });
                this.registerAllDebugTypes(extensionRegistry);
            });
        }
        asDebugSourceUri(src, session) {
            const source = src;
            if (typeof source.sourceReference === 'number' && source.sourceReference > 0) {
                // src can be retrieved via DAP's "source" request
                let debug = `debug:${encodeURIComponent(source.path || '')}`;
                let sep = '?';
                if (session) {
                    debug += `${sep}session=${encodeURIComponent(session.id)}`;
                    sep = '&';
                }
                debug += `${sep}ref=${source.sourceReference}`;
                return uri_1.URI.parse(debug);
            }
            else if (source.path) {
                // src is just a local file path
                return uri_1.URI.file(source.path);
            }
            else {
                throw new Error(`cannot create uri from DAP 'source' object; properties 'path' and 'sourceReference' are both missing.`);
            }
        }
        registerAllDebugTypes(extensionRegistry) {
            const debugTypes = [];
            for (const ed of extensionRegistry.getAllExtensionDescriptions()) {
                if (ed.contributes) {
                    const debuggers = ed.contributes['debuggers'];
                    if (debuggers && debuggers.length > 0) {
                        for (const dbg of debuggers) {
                            if ((0, debugUtils_1.isDebuggerMainContribution)(dbg)) {
                                debugTypes.push(dbg.type);
                            }
                        }
                    }
                }
            }
            this._debugServiceProxy.$registerDebugTypes(debugTypes);
        }
        // extension debug API
        get stackFrameFocus() {
            return this._stackFrameFocus;
        }
        get onDidChangeStackFrameFocus() {
            return this._onDidChangeStackFrameFocus.event;
        }
        get onDidChangeBreakpoints() {
            return this._onDidChangeBreakpoints.event;
        }
        get breakpoints() {
            const result = [];
            this._breakpoints.forEach(bp => result.push(bp));
            return result;
        }
        async $resolveDebugVisualizer(id, token) {
            const visualizer = this._visualizers.get(id);
            if (!visualizer) {
                throw new Error(`No debug visualizer found with id '${id}'`);
            }
            let { v, provider } = visualizer;
            if (!v.visualization) {
                v = await provider.resolveDebugVisualization?.(v, token) || v;
                visualizer.v = v;
            }
            if (!v.visualization) {
                throw new Error(`No visualization returned from resolveDebugVisualization in '${provider}'`);
            }
            return this.serializeVisualization(v.visualization);
        }
        async $executeDebugVisualizerCommand(id) {
            const visualizer = this._visualizers.get(id);
            if (!visualizer) {
                throw new Error(`No debug visualizer found with id '${id}'`);
            }
            const command = visualizer.v.visualization;
            if (command && 'command' in command) {
                this._commands.executeCommand(command.command, ...(command.arguments || []));
            }
        }
        async $provideDebugVisualizers(extensionId, id, context, token) {
            const session = this._debugSessions.get(context.sessionId);
            const key = this.extensionVisKey(extensionId, id);
            const provider = this._debugVisualizationProviders.get(key);
            if (!session || !provider) {
                return []; // probably ended in the meantime
            }
            const visualizations = await provider.provideDebugVisualization({
                session,
                variable: context.variable,
                containerId: context.containerId,
                frameId: context.frameId,
                threadId: context.threadId,
            }, token);
            if (!visualizations) {
                return [];
            }
            return visualizations.map(v => {
                const id = ++this._visualizerIdCounter;
                this._visualizers.set(id, { v, provider });
                const icon = v.iconPath ? this.getIconPathOrClass(v.iconPath) : undefined;
                return {
                    id,
                    name: v.name,
                    iconClass: icon?.iconClass,
                    iconPath: icon?.iconPath,
                    visualization: this.serializeVisualization(v.visualization),
                };
            });
        }
        $disposeDebugVisualizers(ids) {
            for (const id of ids) {
                this._visualizers.delete(id);
            }
        }
        registerDebugVisualizationProvider(manifest, id, provider) {
            if (!manifest.contributes?.debugVisualizers?.some(r => r.id === id)) {
                throw new Error(`Extensions may only call registerDebugVisualizationProvider() for renderers they contribute (got ${id})`);
            }
            const extensionId = extensions_1.ExtensionIdentifier.toKey(manifest.identifier);
            const key = this.extensionVisKey(extensionId, id);
            if (this._debugVisualizationProviders.has(key)) {
                throw new Error(`A debug visualization provider with id '${id}' is already registered`);
            }
            this._debugVisualizationProviders.set(key, provider);
            this._debugServiceProxy.$registerDebugVisualizer(extensionId, id);
            return (0, lifecycle_1.toDisposable)(() => {
                this._debugServiceProxy.$unregisterDebugVisualizer(extensionId, id);
                this._debugVisualizationProviders.delete(id);
            });
        }
        addBreakpoints(breakpoints0) {
            // filter only new breakpoints
            const breakpoints = breakpoints0.filter(bp => {
                const id = bp.id;
                if (!this._breakpoints.has(id)) {
                    this._breakpoints.set(id, bp);
                    return true;
                }
                return false;
            });
            // send notification for added breakpoints
            this.fireBreakpointChanges(breakpoints, [], []);
            // convert added breakpoints to DTOs
            const dtos = [];
            const map = new Map();
            for (const bp of breakpoints) {
                if (bp instanceof extHostTypes_1.SourceBreakpoint) {
                    let dto = map.get(bp.location.uri.toString());
                    if (!dto) {
                        dto = {
                            type: 'sourceMulti',
                            uri: bp.location.uri,
                            lines: []
                        };
                        map.set(bp.location.uri.toString(), dto);
                        dtos.push(dto);
                    }
                    dto.lines.push({
                        id: bp.id,
                        enabled: bp.enabled,
                        condition: bp.condition,
                        hitCondition: bp.hitCondition,
                        logMessage: bp.logMessage,
                        line: bp.location.range.start.line,
                        character: bp.location.range.start.character
                    });
                }
                else if (bp instanceof extHostTypes_1.FunctionBreakpoint) {
                    dtos.push({
                        type: 'function',
                        id: bp.id,
                        enabled: bp.enabled,
                        hitCondition: bp.hitCondition,
                        logMessage: bp.logMessage,
                        condition: bp.condition,
                        functionName: bp.functionName
                    });
                }
            }
            // send DTOs to VS Code
            return this._debugServiceProxy.$registerBreakpoints(dtos);
        }
        removeBreakpoints(breakpoints0) {
            // remove from array
            const breakpoints = breakpoints0.filter(b => this._breakpoints.delete(b.id));
            // send notification
            this.fireBreakpointChanges([], breakpoints, []);
            // unregister with VS Code
            const ids = breakpoints.filter(bp => bp instanceof extHostTypes_1.SourceBreakpoint).map(bp => bp.id);
            const fids = breakpoints.filter(bp => bp instanceof extHostTypes_1.FunctionBreakpoint).map(bp => bp.id);
            const dids = breakpoints.filter(bp => bp instanceof extHostTypes_1.DataBreakpoint).map(bp => bp.id);
            return this._debugServiceProxy.$unregisterBreakpoints(ids, fids, dids);
        }
        startDebugging(folder, nameOrConfig, options) {
            return this._debugServiceProxy.$startDebugging(folder ? folder.uri : undefined, nameOrConfig, {
                parentSessionID: options.parentSession ? options.parentSession.id : undefined,
                lifecycleManagedByParent: options.lifecycleManagedByParent,
                repl: options.consoleMode === extHostTypes_1.DebugConsoleMode.MergeWithParent ? 'mergeWithParent' : 'separate',
                noDebug: options.noDebug,
                compact: options.compact,
                suppressSaveBeforeStart: options.suppressSaveBeforeStart,
                // Check debugUI for back-compat, #147264
                suppressDebugStatusbar: options.suppressDebugStatusbar ?? options.debugUI?.simple,
                suppressDebugToolbar: options.suppressDebugToolbar ?? options.debugUI?.simple,
                suppressDebugView: options.suppressDebugView ?? options.debugUI?.simple,
            });
        }
        stopDebugging(session) {
            return this._debugServiceProxy.$stopDebugging(session ? session.id : undefined);
        }
        registerDebugConfigurationProvider(type, provider, trigger) {
            if (!provider) {
                return new extHostTypes_1.Disposable(() => { });
            }
            const handle = this._configProviderHandleCounter++;
            this._configProviders.push({ type, handle, provider });
            this._debugServiceProxy.$registerDebugConfigurationProvider(type, trigger, !!provider.provideDebugConfigurations, !!provider.resolveDebugConfiguration, !!provider.resolveDebugConfigurationWithSubstitutedVariables, handle);
            return new extHostTypes_1.Disposable(() => {
                this._configProviders = this._configProviders.filter(p => p.provider !== provider); // remove
                this._debugServiceProxy.$unregisterDebugConfigurationProvider(handle);
            });
        }
        registerDebugAdapterDescriptorFactory(extension, type, factory) {
            if (!factory) {
                return new extHostTypes_1.Disposable(() => { });
            }
            // a DebugAdapterDescriptorFactory can only be registered in the extension that contributes the debugger
            if (!this.definesDebugType(extension, type)) {
                throw new Error(`a DebugAdapterDescriptorFactory can only be registered from the extension that defines the '${type}' debugger.`);
            }
            // make sure that only one factory for this type is registered
            if (this.getAdapterDescriptorFactoryByType(type)) {
                throw new Error(`a DebugAdapterDescriptorFactory can only be registered once per a type.`);
            }
            const handle = this._adapterFactoryHandleCounter++;
            this._adapterFactories.push({ type, handle, factory });
            this._debugServiceProxy.$registerDebugAdapterDescriptorFactory(type, handle);
            return new extHostTypes_1.Disposable(() => {
                this._adapterFactories = this._adapterFactories.filter(p => p.factory !== factory); // remove
                this._debugServiceProxy.$unregisterDebugAdapterDescriptorFactory(handle);
            });
        }
        registerDebugAdapterTrackerFactory(type, factory) {
            if (!factory) {
                return new extHostTypes_1.Disposable(() => { });
            }
            const handle = this._trackerFactoryHandleCounter++;
            this._trackerFactories.push({ type, handle, factory });
            return new extHostTypes_1.Disposable(() => {
                this._trackerFactories = this._trackerFactories.filter(p => p.factory !== factory); // remove
            });
        }
        // RPC methods (ExtHostDebugServiceShape)
        async $runInTerminal(args, sessionId) {
            return Promise.resolve(undefined);
        }
        async $substituteVariables(folderUri, config) {
            let ws;
            const folder = await this.getFolder(folderUri);
            if (folder) {
                ws = {
                    uri: folder.uri,
                    name: folder.name,
                    index: folder.index,
                    toResource: () => {
                        throw new Error('Not implemented');
                    }
                };
            }
            const variableResolver = await this._variableResolver.getResolver();
            return variableResolver.resolveAnyAsync(ws, config);
        }
        createDebugAdapter(adapter, session) {
            if (adapter.type === 'implementation') {
                return new DirectDebugAdapter(adapter.implementation);
            }
            return undefined;
        }
        createSignService() {
            return undefined;
        }
        async $startDASession(debugAdapterHandle, sessionDto) {
            const mythis = this;
            const session = await this.getSession(sessionDto);
            return this.getAdapterDescriptor(this.getAdapterDescriptorFactoryByType(session.type), session).then(daDescriptor => {
                if (!daDescriptor) {
                    throw new Error(`Couldn't find a debug adapter descriptor for debug type '${session.type}' (extension might have failed to activate)`);
                }
                const adapterDescriptor = this.convertToDto(daDescriptor);
                const da = this.createDebugAdapter(adapterDescriptor, session);
                if (!da) {
                    throw new Error(`Couldn't create a debug adapter for type '${session.type}'.`);
                }
                const debugAdapter = da;
                this._debugAdapters.set(debugAdapterHandle, debugAdapter);
                return this.getDebugAdapterTrackers(session).then(tracker => {
                    if (tracker) {
                        this._debugAdaptersTrackers.set(debugAdapterHandle, tracker);
                    }
                    debugAdapter.onMessage(async (message) => {
                        if (message.type === 'request' && message.command === 'handshake') {
                            const request = message;
                            const response = {
                                type: 'response',
                                seq: 0,
                                command: request.command,
                                request_seq: request.seq,
                                success: true
                            };
                            if (!this._signService) {
                                this._signService = this.createSignService();
                            }
                            try {
                                if (this._signService) {
                                    const signature = await this._signService.sign(request.arguments.value);
                                    response.body = {
                                        signature: signature
                                    };
                                    debugAdapter.sendResponse(response);
                                }
                                else {
                                    throw new Error('no signer');
                                }
                            }
                            catch (e) {
                                response.success = false;
                                response.message = e.message;
                                debugAdapter.sendResponse(response);
                            }
                        }
                        else {
                            if (tracker && tracker.onDidSendMessage) {
                                tracker.onDidSendMessage(message);
                            }
                            // DA -> VS Code
                            message = (0, debugUtils_1.convertToVSCPaths)(message, true);
                            mythis._debugServiceProxy.$acceptDAMessage(debugAdapterHandle, message);
                        }
                    });
                    debugAdapter.onError(err => {
                        if (tracker && tracker.onError) {
                            tracker.onError(err);
                        }
                        this._debugServiceProxy.$acceptDAError(debugAdapterHandle, err.name, err.message, err.stack);
                    });
                    debugAdapter.onExit((code) => {
                        if (tracker && tracker.onExit) {
                            tracker.onExit(code ?? undefined, undefined);
                        }
                        this._debugServiceProxy.$acceptDAExit(debugAdapterHandle, code ?? undefined, undefined);
                    });
                    if (tracker && tracker.onWillStartSession) {
                        tracker.onWillStartSession();
                    }
                    return debugAdapter.startSession();
                });
            });
        }
        $sendDAMessage(debugAdapterHandle, message) {
            // VS Code -> DA
            message = (0, debugUtils_1.convertToDAPaths)(message, false);
            const tracker = this._debugAdaptersTrackers.get(debugAdapterHandle); // TODO@AW: same handle?
            if (tracker && tracker.onWillReceiveMessage) {
                tracker.onWillReceiveMessage(message);
            }
            const da = this._debugAdapters.get(debugAdapterHandle);
            da?.sendMessage(message);
        }
        $stopDASession(debugAdapterHandle) {
            const tracker = this._debugAdaptersTrackers.get(debugAdapterHandle);
            this._debugAdaptersTrackers.delete(debugAdapterHandle);
            if (tracker && tracker.onWillStopSession) {
                tracker.onWillStopSession();
            }
            const da = this._debugAdapters.get(debugAdapterHandle);
            this._debugAdapters.delete(debugAdapterHandle);
            if (da) {
                return da.stopSession();
            }
            else {
                return Promise.resolve(void 0);
            }
        }
        $acceptBreakpointsDelta(delta) {
            const a = [];
            const r = [];
            const c = [];
            if (delta.added) {
                for (const bpd of delta.added) {
                    const id = bpd.id;
                    if (id && !this._breakpoints.has(id)) {
                        let bp;
                        if (bpd.type === 'function') {
                            bp = new extHostTypes_1.FunctionBreakpoint(bpd.functionName, bpd.enabled, bpd.condition, bpd.hitCondition, bpd.logMessage);
                        }
                        else if (bpd.type === 'data') {
                            bp = new extHostTypes_1.DataBreakpoint(bpd.label, bpd.dataId, bpd.canPersist, bpd.enabled, bpd.hitCondition, bpd.condition, bpd.logMessage);
                        }
                        else {
                            const uri = uri_1.URI.revive(bpd.uri);
                            bp = new extHostTypes_1.SourceBreakpoint(new extHostTypes_1.Location(uri, new extHostTypes_1.Position(bpd.line, bpd.character)), bpd.enabled, bpd.condition, bpd.hitCondition, bpd.logMessage);
                        }
                        (0, extHostTypes_1.setBreakpointId)(bp, id);
                        this._breakpoints.set(id, bp);
                        a.push(bp);
                    }
                }
            }
            if (delta.removed) {
                for (const id of delta.removed) {
                    const bp = this._breakpoints.get(id);
                    if (bp) {
                        this._breakpoints.delete(id);
                        r.push(bp);
                    }
                }
            }
            if (delta.changed) {
                for (const bpd of delta.changed) {
                    if (bpd.id) {
                        const bp = this._breakpoints.get(bpd.id);
                        if (bp) {
                            if (bp instanceof extHostTypes_1.FunctionBreakpoint && bpd.type === 'function') {
                                const fbp = bp;
                                fbp.enabled = bpd.enabled;
                                fbp.condition = bpd.condition;
                                fbp.hitCondition = bpd.hitCondition;
                                fbp.logMessage = bpd.logMessage;
                                fbp.functionName = bpd.functionName;
                            }
                            else if (bp instanceof extHostTypes_1.SourceBreakpoint && bpd.type === 'source') {
                                const sbp = bp;
                                sbp.enabled = bpd.enabled;
                                sbp.condition = bpd.condition;
                                sbp.hitCondition = bpd.hitCondition;
                                sbp.logMessage = bpd.logMessage;
                                sbp.location = new extHostTypes_1.Location(uri_1.URI.revive(bpd.uri), new extHostTypes_1.Position(bpd.line, bpd.character));
                            }
                            c.push(bp);
                        }
                    }
                }
            }
            this.fireBreakpointChanges(a, r, c);
        }
        async $acceptStackFrameFocus(focusDto) {
            let focus;
            const session = focusDto.sessionId ? await this.getSession(focusDto.sessionId) : undefined;
            if (!session) {
                throw new Error('no DebugSession found for debug focus context');
            }
            if (focusDto.kind === 'thread') {
                focus = new extHostTypes_1.ThreadFocus(session, focusDto.threadId);
            }
            else {
                focus = new extHostTypes_1.StackFrameFocus(session, focusDto.threadId, focusDto.frameId);
            }
            this._stackFrameFocus = focus;
            this._onDidChangeStackFrameFocus.fire(this._stackFrameFocus);
        }
        $provideDebugConfigurations(configProviderHandle, folderUri, token) {
            return (0, async_1.asPromise)(async () => {
                const provider = this.getConfigProviderByHandle(configProviderHandle);
                if (!provider) {
                    throw new Error('no DebugConfigurationProvider found');
                }
                if (!provider.provideDebugConfigurations) {
                    throw new Error('DebugConfigurationProvider has no method provideDebugConfigurations');
                }
                const folder = await this.getFolder(folderUri);
                return provider.provideDebugConfigurations(folder, token);
            }).then(debugConfigurations => {
                if (!debugConfigurations) {
                    throw new Error('nothing returned from DebugConfigurationProvider.provideDebugConfigurations');
                }
                return debugConfigurations;
            });
        }
        $resolveDebugConfiguration(configProviderHandle, folderUri, debugConfiguration, token) {
            return (0, async_1.asPromise)(async () => {
                const provider = this.getConfigProviderByHandle(configProviderHandle);
                if (!provider) {
                    throw new Error('no DebugConfigurationProvider found');
                }
                if (!provider.resolveDebugConfiguration) {
                    throw new Error('DebugConfigurationProvider has no method resolveDebugConfiguration');
                }
                const folder = await this.getFolder(folderUri);
                return provider.resolveDebugConfiguration(folder, debugConfiguration, token);
            });
        }
        $resolveDebugConfigurationWithSubstitutedVariables(configProviderHandle, folderUri, debugConfiguration, token) {
            return (0, async_1.asPromise)(async () => {
                const provider = this.getConfigProviderByHandle(configProviderHandle);
                if (!provider) {
                    throw new Error('no DebugConfigurationProvider found');
                }
                if (!provider.resolveDebugConfigurationWithSubstitutedVariables) {
                    throw new Error('DebugConfigurationProvider has no method resolveDebugConfigurationWithSubstitutedVariables');
                }
                const folder = await this.getFolder(folderUri);
                return provider.resolveDebugConfigurationWithSubstitutedVariables(folder, debugConfiguration, token);
            });
        }
        async $provideDebugAdapter(adapterFactoryHandle, sessionDto) {
            const adapterDescriptorFactory = this.getAdapterDescriptorFactoryByHandle(adapterFactoryHandle);
            if (!adapterDescriptorFactory) {
                return Promise.reject(new Error('no adapter descriptor factory found for handle'));
            }
            const session = await this.getSession(sessionDto);
            return this.getAdapterDescriptor(adapterDescriptorFactory, session).then(adapterDescriptor => {
                if (!adapterDescriptor) {
                    throw new Error(`Couldn't find a debug adapter descriptor for debug type '${session.type}'`);
                }
                return this.convertToDto(adapterDescriptor);
            });
        }
        async $acceptDebugSessionStarted(sessionDto) {
            const session = await this.getSession(sessionDto);
            this._onDidStartDebugSession.fire(session);
        }
        async $acceptDebugSessionTerminated(sessionDto) {
            const session = await this.getSession(sessionDto);
            if (session) {
                this._onDidTerminateDebugSession.fire(session);
                this._debugSessions.delete(session.id);
            }
        }
        async $acceptDebugSessionActiveChanged(sessionDto) {
            this._activeDebugSession = sessionDto ? await this.getSession(sessionDto) : undefined;
            this._onDidChangeActiveDebugSession.fire(this._activeDebugSession);
        }
        async $acceptDebugSessionNameChanged(sessionDto, name) {
            const session = await this.getSession(sessionDto);
            session?._acceptNameChanged(name);
        }
        async $acceptDebugSessionCustomEvent(sessionDto, event) {
            const session = await this.getSession(sessionDto);
            const ee = {
                session: session,
                event: event.event,
                body: event.body
            };
            this._onDidReceiveDebugSessionCustomEvent.fire(ee);
        }
        // private & dto helpers
        convertToDto(x) {
            if (x instanceof extHostTypes_1.DebugAdapterExecutable) {
                return {
                    type: 'executable',
                    command: x.command,
                    args: x.args,
                    options: x.options
                };
            }
            else if (x instanceof extHostTypes_1.DebugAdapterServer) {
                return {
                    type: 'server',
                    port: x.port,
                    host: x.host
                };
            }
            else if (x instanceof extHostTypes_1.DebugAdapterNamedPipeServer) {
                return {
                    type: 'pipeServer',
                    path: x.path
                };
            }
            else if (x instanceof extHostTypes_1.DebugAdapterInlineImplementation) {
                return {
                    type: 'implementation',
                    implementation: x.implementation
                };
            }
            else {
                throw new Error('convertToDto unexpected type');
            }
        }
        getAdapterDescriptorFactoryByType(type) {
            const results = this._adapterFactories.filter(p => p.type === type);
            if (results.length > 0) {
                return results[0].factory;
            }
            return undefined;
        }
        getAdapterDescriptorFactoryByHandle(handle) {
            const results = this._adapterFactories.filter(p => p.handle === handle);
            if (results.length > 0) {
                return results[0].factory;
            }
            return undefined;
        }
        getConfigProviderByHandle(handle) {
            const results = this._configProviders.filter(p => p.handle === handle);
            if (results.length > 0) {
                return results[0].provider;
            }
            return undefined;
        }
        definesDebugType(ed, type) {
            if (ed.contributes) {
                const debuggers = ed.contributes['debuggers'];
                if (debuggers && debuggers.length > 0) {
                    for (const dbg of debuggers) {
                        // only debugger contributions with a "label" are considered a "defining" debugger contribution
                        if (dbg.label && dbg.type) {
                            if (dbg.type === type) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }
        getDebugAdapterTrackers(session) {
            const config = session.configuration;
            const type = config.type;
            const promises = this._trackerFactories
                .filter(tuple => tuple.type === type || tuple.type === '*')
                .map(tuple => (0, async_1.asPromise)(() => tuple.factory.createDebugAdapterTracker(session)).then(p => p, err => null));
            return Promise.race([
                Promise.all(promises).then(result => {
                    const trackers = result.filter(t => !!t); // filter null
                    if (trackers.length > 0) {
                        return new MultiTracker(trackers);
                    }
                    return undefined;
                }),
                new Promise(resolve => setTimeout(() => resolve(undefined), 1000)),
            ]).catch(err => {
                // ignore errors
                return undefined;
            });
        }
        async getAdapterDescriptor(adapterDescriptorFactory, session) {
            // a "debugServer" attribute in the launch config takes precedence
            const serverPort = session.configuration.debugServer;
            if (typeof serverPort === 'number') {
                return Promise.resolve(new extHostTypes_1.DebugAdapterServer(serverPort));
            }
            if (adapterDescriptorFactory) {
                const extensionRegistry = await this._extensionService.getExtensionRegistry();
                return (0, async_1.asPromise)(() => adapterDescriptorFactory.createDebugAdapterDescriptor(session, this.daExecutableFromPackage(session, extensionRegistry))).then(daDescriptor => {
                    if (daDescriptor) {
                        return daDescriptor;
                    }
                    return undefined;
                });
            }
            // fallback: use executable information from package.json
            const extensionRegistry = await this._extensionService.getExtensionRegistry();
            return Promise.resolve(this.daExecutableFromPackage(session, extensionRegistry));
        }
        daExecutableFromPackage(session, extensionRegistry) {
            return undefined;
        }
        fireBreakpointChanges(added, removed, changed) {
            if (added.length > 0 || removed.length > 0 || changed.length > 0) {
                this._onDidChangeBreakpoints.fire(Object.freeze({
                    added,
                    removed,
                    changed,
                }));
            }
        }
        async getSession(dto) {
            if (dto) {
                if (typeof dto === 'string') {
                    const ds = this._debugSessions.get(dto);
                    if (ds) {
                        return ds;
                    }
                }
                else {
                    let ds = this._debugSessions.get(dto.id);
                    if (!ds) {
                        const folder = await this.getFolder(dto.folderUri);
                        const parent = dto.parent ? this._debugSessions.get(dto.parent) : undefined;
                        ds = new ExtHostDebugSession(this._debugServiceProxy, dto.id, dto.type, dto.name, folder, dto.configuration, parent);
                        this._debugSessions.set(ds.id, ds);
                        this._debugServiceProxy.$sessionCached(ds.id);
                    }
                    return ds;
                }
            }
            throw new Error('cannot find session');
        }
        getFolder(_folderUri) {
            if (_folderUri) {
                const folderURI = uri_1.URI.revive(_folderUri);
                return this._workspaceService.resolveWorkspaceFolder(folderURI);
            }
            return Promise.resolve(undefined);
        }
        extensionVisKey(extensionId, id) {
            return `${extensionId}\0${id}`;
        }
        serializeVisualization(viz) {
            if (!viz) {
                return undefined;
            }
            if ('title' in viz && 'command' in viz) {
                return { type: 0 /* DebugVisualizationType.Command */ };
            }
            throw new Error('Unsupported debug visualization type');
        }
        getIconPathOrClass(icon) {
            const iconPathOrIconClass = this.getIconUris(icon);
            let iconPath;
            let iconClass;
            if ('id' in iconPathOrIconClass) {
                iconClass = themables_1.ThemeIcon.asClassName(iconPathOrIconClass);
            }
            else {
                iconPath = iconPathOrIconClass;
            }
            return {
                iconPath,
                iconClass
            };
        }
        getIconUris(iconPath) {
            if (iconPath instanceof extHostTypes_1.ThemeIcon) {
                return { id: iconPath.id };
            }
            const dark = typeof iconPath === 'object' && 'dark' in iconPath ? iconPath.dark : iconPath;
            const light = typeof iconPath === 'object' && 'light' in iconPath ? iconPath.light : iconPath;
            return {
                dark: (typeof dark === 'string' ? uri_1.URI.file(dark) : dark),
                light: (typeof light === 'string' ? uri_1.URI.file(light) : light),
            };
        }
    };
    exports.ExtHostDebugServiceBase = ExtHostDebugServiceBase;
    exports.ExtHostDebugServiceBase = ExtHostDebugServiceBase = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostWorkspace_1.IExtHostWorkspace),
        __param(2, extHostExtensionService_1.IExtHostExtensionService),
        __param(3, extHostConfiguration_1.IExtHostConfiguration),
        __param(4, extHostEditorTabs_1.IExtHostEditorTabs),
        __param(5, extHostVariableResolverService_1.IExtHostVariableResolverProvider),
        __param(6, extHostCommands_1.IExtHostCommands)
    ], ExtHostDebugServiceBase);
    class ExtHostDebugSession {
        constructor(_debugServiceProxy, _id, _type, _name, _workspaceFolder, _configuration, _parentSession) {
            this._debugServiceProxy = _debugServiceProxy;
            this._id = _id;
            this._type = _type;
            this._name = _name;
            this._workspaceFolder = _workspaceFolder;
            this._configuration = _configuration;
            this._parentSession = _parentSession;
        }
        get id() {
            return this._id;
        }
        get type() {
            return this._type;
        }
        get name() {
            return this._name;
        }
        set name(name) {
            this._name = name;
            this._debugServiceProxy.$setDebugSessionName(this._id, name);
        }
        get parentSession() {
            return this._parentSession;
        }
        _acceptNameChanged(name) {
            this._name = name;
        }
        get workspaceFolder() {
            return this._workspaceFolder;
        }
        get configuration() {
            return this._configuration;
        }
        customRequest(command, args) {
            return this._debugServiceProxy.$customDebugAdapterRequest(this._id, command, args);
        }
        getDebugProtocolBreakpoint(breakpoint) {
            return this._debugServiceProxy.$getDebugProtocolBreakpoint(this._id, breakpoint.id);
        }
    }
    exports.ExtHostDebugSession = ExtHostDebugSession;
    class ExtHostDebugConsole {
        constructor(proxy) {
            this.value = Object.freeze({
                append(value) {
                    proxy.$appendDebugConsole(value);
                },
                appendLine(value) {
                    this.append(value + '\n');
                }
            });
        }
    }
    exports.ExtHostDebugConsole = ExtHostDebugConsole;
    class MultiTracker {
        constructor(trackers) {
            this.trackers = trackers;
        }
        onWillStartSession() {
            this.trackers.forEach(t => t.onWillStartSession ? t.onWillStartSession() : undefined);
        }
        onWillReceiveMessage(message) {
            this.trackers.forEach(t => t.onWillReceiveMessage ? t.onWillReceiveMessage(message) : undefined);
        }
        onDidSendMessage(message) {
            this.trackers.forEach(t => t.onDidSendMessage ? t.onDidSendMessage(message) : undefined);
        }
        onWillStopSession() {
            this.trackers.forEach(t => t.onWillStopSession ? t.onWillStopSession() : undefined);
        }
        onError(error) {
            this.trackers.forEach(t => t.onError ? t.onError(error) : undefined);
        }
        onExit(code, signal) {
            this.trackers.forEach(t => t.onExit ? t.onExit(code, signal) : undefined);
        }
    }
    /*
     * Call directly into a debug adapter implementation
     */
    class DirectDebugAdapter extends abstractDebugAdapter_1.AbstractDebugAdapter {
        constructor(implementation) {
            super();
            this.implementation = implementation;
            implementation.onDidSendMessage((message) => {
                this.acceptMessage(message);
            });
        }
        startSession() {
            return Promise.resolve(undefined);
        }
        sendMessage(message) {
            this.implementation.handleMessage(message);
        }
        stopSession() {
            this.implementation.dispose();
            return Promise.resolve(undefined);
        }
    }
    let WorkerExtHostDebugService = class WorkerExtHostDebugService extends ExtHostDebugServiceBase {
        constructor(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver, commands) {
            super(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver, commands);
        }
    };
    exports.WorkerExtHostDebugService = WorkerExtHostDebugService;
    exports.WorkerExtHostDebugService = WorkerExtHostDebugService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostWorkspace_1.IExtHostWorkspace),
        __param(2, extHostExtensionService_1.IExtHostExtensionService),
        __param(3, extHostConfiguration_1.IExtHostConfiguration),
        __param(4, extHostEditorTabs_1.IExtHostEditorTabs),
        __param(5, extHostVariableResolverService_1.IExtHostVariableResolverProvider),
        __param(6, extHostCommands_1.IExtHostCommands)
    ], WorkerExtHostDebugService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERlYnVnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdERlYnVnU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE0Qm5GLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSwrQkFBZSxFQUF1QixzQkFBc0IsQ0FBQyxDQUFDO0lBNEIzRixJQUFlLHVCQUF1QixHQUF0QyxNQUFlLHVCQUF1QjtRQWlCNUMsSUFBSSxzQkFBc0IsS0FBaUMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUd2RyxJQUFJLDBCQUEwQixLQUFpQyxPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRy9HLElBQUksNkJBQTZCLEtBQTZDLE9BQU8sSUFBSSxDQUFDLDhCQUE4QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFHakksSUFBSSxrQkFBa0IsS0FBc0MsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBRzlGLElBQUksbUNBQW1DLEtBQTRDLE9BQU8sSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFHNUksSUFBSSxrQkFBa0IsS0FBMEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQWtCeEYsWUFDcUIsaUJBQXFDLEVBQ3RDLGlCQUE4QyxFQUN2QyxpQkFBbUQsRUFDdEQscUJBQXNELEVBQ3pELFdBQXlDLEVBQzNCLGlCQUEyRCxFQUMzRSxTQUFtQztZQUx4QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQy9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBMEI7WUFDNUMsMEJBQXFCLEdB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
//# sourceURL=../../../vs/workbench/api/common/extHostDebugService.js
})
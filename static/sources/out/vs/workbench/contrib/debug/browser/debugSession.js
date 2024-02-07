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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/severity", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/debug/browser/rawDebugSession", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/contrib/debug/common/replModel", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/host/browser/host", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/browser/dom", "vs/base/browser/window"], function (require, exports, aria, arrays_1, async_1, cancellation_1, errors_1, event_1, labels_1, lifecycle_1, objects_1, platform, resources, severity_1, uri_1, uuid_1, nls_1, configuration_1, instantiation_1, log_1, notification_1, productService_1, telemetry_1, uriIdentity_1, workspace_1, rawDebugSession_1, debug_1, debugModel_1, debugSource_1, debugUtils_1, replModel_1, environmentService_1, host_1, lifecycle_2, panecomposite_1, dom_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ThreadStatusScheduler = exports.DebugSession = void 0;
    const TRIGGERED_BREAKPOINT_MAX_DELAY = 1500;
    let DebugSession = class DebugSession {
        constructor(id, _configuration, root, model, options, debugService, telemetryService, hostService, configurationService, paneCompositeService, workspaceContextService, productService, notificationService, lifecycleService, uriIdentityService, instantiationService, customEndpointTelemetryService, workbenchEnvironmentService, logService) {
            this.id = id;
            this._configuration = _configuration;
            this.root = root;
            this.model = model;
            this.debugService = debugService;
            this.telemetryService = telemetryService;
            this.hostService = hostService;
            this.configurationService = configurationService;
            this.paneCompositeService = paneCompositeService;
            this.workspaceContextService = workspaceContextService;
            this.productService = productService;
            this.notificationService = notificationService;
            this.uriIdentityService = uriIdentityService;
            this.instantiationService = instantiationService;
            this.customEndpointTelemetryService = customEndpointTelemetryService;
            this.workbenchEnvironmentService = workbenchEnvironmentService;
            this.logService = logService;
            this.initialized = false;
            this.sources = new Map();
            this.threads = new Map();
            this.threadIds = [];
            this.cancellationMap = new Map();
            this.rawListeners = new lifecycle_1.DisposableStore();
            this.globalDisposables = new lifecycle_1.DisposableStore();
            this.stoppedDetails = [];
            this.statusQueue = this.rawListeners.add(new ThreadStatusScheduler());
            this._onDidChangeState = new event_1.Emitter();
            this._onDidEndAdapter = new event_1.Emitter();
            this._onDidLoadedSource = new event_1.Emitter();
            this._onDidCustomEvent = new event_1.Emitter();
            this._onDidProgressStart = new event_1.Emitter();
            this._onDidProgressUpdate = new event_1.Emitter();
            this._onDidProgressEnd = new event_1.Emitter();
            this._onDidInvalidMemory = new event_1.Emitter();
            this._onDidChangeREPLElements = new event_1.Emitter();
            this._onDidChangeName = new event_1.Emitter();
            this._options = options || {};
            this.parentSession = this._options.parentSession;
            if (this.hasSeparateRepl()) {
                this.repl = new replModel_1.ReplModel(this.configurationService);
            }
            else {
                this.repl = this.parentSession.repl;
            }
            const toDispose = this.globalDisposables;
            const replListener = toDispose.add(new lifecycle_1.MutableDisposable());
            replListener.value = this.repl.onDidChangeElements(() => this._onDidChangeREPLElements.fire());
            if (lifecycleService) {
                toDispose.add(lifecycleService.onWillShutdown(() => {
                    this.shutdown();
                    (0, lifecycle_1.dispose)(toDispose);
                }));
            }
            const compoundRoot = this._options.compoundRoot;
            if (compoundRoot) {
                toDispose.add(compoundRoot.onDidSessionStop(() => this.terminate()));
            }
            this.passFocusScheduler = new async_1.RunOnceScheduler(() => {
                // If there is some session or thread that is stopped pass focus to it
                if (this.debugService.getModel().getSessions().some(s => s.state === 2 /* State.Stopped */) || this.getAllThreads().some(t => t.stopped)) {
                    if (typeof this.lastContinuedThreadId === 'number') {
                        const thread = this.debugService.getViewModel().focusedThread;
                        if (thread && thread.threadId === this.lastContinuedThreadId && !thread.stopped) {
                            const toFocusThreadId = this.getStoppedDetails()?.threadId;
                            const toFocusThread = typeof toFocusThreadId === 'number' ? this.getThread(toFocusThreadId) : undefined;
                            this.debugService.focusStackFrame(undefined, toFocusThread);
                        }
                    }
                    else {
                        const session = this.debugService.getViewModel().focusedSession;
                        if (session && session.getId() === this.getId() && session.state !== 2 /* State.Stopped */) {
                            this.debugService.focusStackFrame(undefined);
                        }
                    }
                }
            }, 800);
            const parent = this._options.parentSession;
            if (parent) {
                toDispose.add(parent.onDidEndAdapter(() => {
                    // copy the parent repl and get a new detached repl for this child, and
                    // remove its parent, if it's still running
                    if (!this.hasSeparateRepl() && this.raw?.isInShutdown === false) {
                        this.repl = this.repl.clone();
                        replListener.value = this.repl.onDidChangeElements(() => this._onDidChangeREPLElements.fire());
                        this.parentSession = undefined;
                    }
                }));
            }
        }
        getId() {
            return this.id;
        }
        setSubId(subId) {
            this._subId = subId;
        }
        getMemory(memoryReference) {
            return new debugModel_1.MemoryRegion(memoryReference, this);
        }
        get subId() {
            return this._subId;
        }
        get configuration() {
            return this._configuration.resolved;
        }
        get unresolvedConfiguration() {
            return this._configuration.unresolved;
        }
        get lifecycleManagedByParent() {
            return !!this._options.lifecycleManagedByParent;
        }
        get compact() {
            return !!this._options.compact;
        }
        get saveBeforeRestart() {
            return this._options.saveBeforeRestart ?? !this._options?.parentSession;
        }
        get compoundRoot() {
            return this._options.compoundRoot;
        }
        get suppressDebugStatusbar() {
            return this._options.suppressDebugStatusbar ?? false;
        }
        get suppressDebugToolbar() {
            return this._options.suppressDebugToolbar ?? false;
        }
        get suppressDebugView() {
            return this._options.suppressDebugView ?? false;
        }
        get autoExpandLazyVariables() {
            // This tiny helper avoids converting the entire debug model to use service injection
            return this.configurationService.getValue('debug').autoExpandLazyVariables;
        }
        setConfiguration(configuration) {
            this._configuration = configuration;
        }
        getLabel() {
            const includeRoot = this.workspaceContextService.getWorkspace().folders.length > 1;
            return includeRoot && this.root ? `${this.name} (${resources.basenameOrAuthority(this.root.uri)})` : this.name;
        }
        setName(name) {
            this._name = name;
            this._onDidChangeName.fire(name);
        }
        get name() {
            return this._name || this.configuration.name;
        }
        get state() {
            if (!this.initialized) {
                return 1 /* State.Initializing */;
            }
            if (!this.raw) {
                return 0 /* State.Inactive */;
            }
            const focusedThread = this.debugService.getViewModel().focusedThread;
            if (focusedThread && focusedThread.session === this) {
                return focusedThread.stopped ? 2 /* State.Stopped */ : 3 /* State.Running */;
            }
            if (this.getAllThreads().some(t => t.stopped)) {
                return 2 /* State.Stopped */;
            }
            return 3 /* State.Running */;
        }
        get capabilities() {
            return this.raw ? this.raw.capabilities : Object.create(null);
        }
        //---- events
        get onDidChangeState() {
            return this._onDidChangeState.event;
        }
        get onDidEndAdapter() {
            return this._onDidEndAdapter.event;
        }
        get onDidChangeReplElements() {
            return this._onDidChangeREPLElements.event;
        }
        get onDidChangeName() {
            return this._onDidChangeName.event;
        }
        //---- DAP events
        get onDidCustomEvent() {
            return this._onDidCustomEvent.event;
        }
        get onDidLoadedSource() {
            return this._onDidLoadedSource.event;
        }
        get onDidProgressStart() {
            return this._onDidProgressStart.event;
        }
        get onDidProgressUpdate() {
            return this._onDidProgressUpdate.event;
        }
        get onDidProgressEnd() {
            return this._onDidProgressEnd.event;
        }
        get onDidInvalidateMemory() {
            return this._onDidInvalidMemory.event;
        }
        //---- DAP requests
        /**
         * create and initialize a new debug adapter for this session
         */
        async initialize(dbgr) {
            if (this.raw) {
                // if there was already a connection make sure to remove old listeners
                await this.shutdown();
            }
            try {
                const debugAdapter = await dbgr.createDebugAdapter(this);
                this.raw = this.instantiationService.createInstance(rawDebugSession_1.RawDebugSession, debugAdapter, dbgr, this.id, this.configuration.name);
                await this.raw.start();
                this.registerListeners();
                await this.raw.initialize({
                    clientID: 'vscode',
                    clientName: this.productService.nameLong,
                    adapterID: this.configuration.type,
                    pathFormat: 'path',
                    linesStartAt1: true,
                    columnsStartAt1: true,
                    supportsVariableType: true, // #8858
                    supportsVariablePaging: true, // #9537
                    supportsRunInTerminalRequest: true, // #10574
                    locale: platform.language, // #169114
                    supportsProgressReporting: true, // #92253
                    supportsInvalidatedEvent: true, // #106745
                    supportsMemoryReferences: true, //#129684
                    supportsArgsCanBeInterpretedByShell: true, // #149910
                    supportsMemoryEvent: true, // #133643
                    supportsStartDebuggingRequest: true
                });
                this.initialized = true;
                this._onDidChangeState.fire();
                this.debugService.setExceptionBreakpointsForSession(this, (this.raw && this.raw.capabilities.exceptionBreakpointFilters) || []);
            }
            catch (err) {
                this.initialized = true;
                this._onDidChangeState.fire();
                await this.shutdown();
                throw err;
            }
        }
        /**
         * launch or attach to the debuggee
         */
        async launchOrAttach(config) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'launch or attach'));
            }
            if (this.parentSession && this.parentSession.state === 0 /* State.Inactive */) {
                throw (0, errors_1.canceled)();
            }
            // __sessionID only used for EH debugging (but we add it always for now...)
            config.__sessionId = this.getId();
            try {
                await this.raw.launchOrAttach(config);
            }
            catch (err) {
                this.shutdown();
                throw err;
            }
        }
        /**
         * terminate the current debug adapter session
         */
        async terminate(restart = false) {
            if (!this.raw) {
                // Adapter went down but it did not send a 'terminated' event, simulate like the event has been sent
                this.onDidExitAdapter();
            }
            this.cancelAllRequests();
            if (this._options.lifecycleManagedByParent && this.parentSession) {
                await this.parentSession.terminate(restart);
            }
            else if (this.raw) {
                if (this.raw.capabilities.supportsTerminateRequest && this._configuration.resolved.request === 'launch') {
                    await this.raw.terminate(restart);
                }
                else {
                    await this.raw.disconnect({ restart, terminateDebuggee: true });
                }
            }
            if (!restart) {
                this._options.compoundRoot?.sessionStopped();
            }
        }
        /**
         * end the current debug adapter session
         */
        async disconnect(restart = false, suspend = false) {
            if (!this.raw) {
                // Adapter went down but it did not send a 'terminated' event, simulate like the event has been sent
                this.onDidExitAdapter();
            }
            this.cancelAllRequests();
            if (this._options.lifecycleManagedByParent && this.parentSession) {
                await this.parentSession.disconnect(restart, suspend);
            }
            else if (this.raw) {
                // TODO terminateDebuggee should be undefined by default?
                await this.raw.disconnect({ restart, terminateDebuggee: false, suspendDebuggee: suspend });
            }
            if (!restart) {
                this._options.compoundRoot?.sessionStopped();
            }
        }
        /**
         * restart debug adapter session
         */
        async restart() {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'restart'));
            }
            this.cancelAllRequests();
            if (this._options.lifecycleManagedByParent && this.parentSession) {
                await this.parentSession.restart();
            }
            else {
                await this.raw.restart({ arguments: this.configuration });
            }
        }
        async sendBreakpoints(modelUri, breakpointsToSend, sourceModified) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'breakpoints'));
            }
            if (!this.raw.readyForBreakpoints) {
                return Promise.resolve(undefined);
            }
            const rawSource = this.getRawSource(modelUri);
            if (breakpointsToSend.length && !rawSource.adapterData) {
                rawSource.adapterData = breakpointsToSend[0].adapterData;
            }
            // Normalize all drive letters going out from vscode to debug adapters so we are consistent with our resolving #43959
            if (rawSource.path) {
                rawSource.path = (0, labels_1.normalizeDriveLetter)(rawSource.path);
            }
            const response = await this.raw.setBreakpoints({
                source: rawSource,
                lines: breakpointsToSend.map(bp => bp.sessionAgnosticData.lineNumber),
                breakpoints: breakpointsToSend.map(bp => ({ line: bp.sessionAgnosticData.lineNumber, column: bp.sessionAgnosticData.column, condition: bp.condition, hitCondition: bp.hitCondition, logMessage: bp.logMessage })),
                sourceModified
            });
            if (response && response.body) {
                const data = new Map();
                for (let i = 0; i < breakpointsToSend.length; i++) {
                    data.set(breakpointsToSend[i].getId(), response.body.breakpoints[i]);
                }
                this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
            }
        }
        async sendFunctionBreakpoints(fbpts) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'function breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const response = await this.raw.setFunctionBreakpoints({ breakpoints: fbpts });
                if (response && response.body) {
                    const data = new Map();
                    for (let i = 0; i < fbpts.length; i++) {
                        data.set(fbpts[i].getId(), response.body.breakpoints[i]);
                    }
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async sendExceptionBreakpoints(exbpts) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'exception breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const args = this.capabilities.supportsExceptionFilterOptions ? {
                    filters: [],
                    filterOptions: exbpts.map(exb => {
                        if (exb.condition) {
                            return { filterId: exb.filter, condition: exb.condition };
                        }
                        return { filterId: exb.filter };
                    })
                } : { filters: exbpts.map(exb => exb.filter) };
                const response = await this.raw.setExceptionBreakpoints(args);
                if (response && response.body && response.body.breakpoints) {
                    const data = new Map();
                    for (let i = 0; i < exbpts.length; i++) {
                        data.set(exbpts[i].getId(), response.body.breakpoints[i]);
                    }
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async dataBreakpointInfo(name, variablesReference) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'data breakpoints info'));
            }
            if (!this.raw.readyForBreakpoints) {
                throw new Error((0, nls_1.localize)('sessionNotReadyForBreakpoints', "Session is not ready for breakpoints"));
            }
            const response = await this.raw.dataBreakpointInfo({ name, variablesReference });
            return response?.body;
        }
        async sendDataBreakpoints(dataBreakpoints) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'data breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const response = await this.raw.setDataBreakpoints({ breakpoints: dataBreakpoints });
                if (response && response.body) {
                    const data = new Map();
                    for (let i = 0; i < dataBreakpoints.length; i++) {
                        data.set(dataBreakpoints[i].getId(), response.body.breakpoints[i]);
                    }
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async sendInstructionBreakpoints(instructionBreakpoints) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'instruction breakpoints'));
            }
            if (this.raw.readyForBreakpoints) {
                const response = await this.raw.setInstructionBreakpoints({ breakpoints: instructionBreakpoints.map(ib => ib.toJSON()) });
                if (response && response.body) {
                    const data = new Map();
                    for (let i = 0; i < instructionBreakpoints.length; i++) {
                        data.set(instructionBreakpoints[i].getId(), response.body.breakpoints[i]);
                    }
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }
        async breakpointsLocations(uri, lineNumber) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'breakpoints locations'));
            }
            const source = this.getRawSource(uri);
            const response = await this.raw.breakpointLocations({ source, line: lineNumber });
            if (!response || !response.body || !response.body.breakpoints) {
                return [];
            }
            const positions = response.body.breakpoints.map(bp => ({ lineNumber: bp.line, column: bp.column || 1 }));
            return (0, arrays_1.distinct)(positions, p => `${p.lineNumber}:${p.column}`);
        }
        getDebugProtocolBreakpoint(breakpointId) {
            return this.model.getDebugProtocolBreakpoint(breakpointId, this.getId());
        }
        customRequest(request, args) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", request));
            }
            return this.raw.custom(request, args);
        }
        stackTrace(threadId, startFrame, levels, token) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stackTrace'));
            }
            const sessionToken = this.getNewCancellationToken(threadId, token);
            return this.raw.stackTrace({ threadId, startFrame, levels }, sessionToken);
        }
        async exceptionInfo(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'exceptionInfo'));
            }
            const response = await this.raw.exceptionInfo({ threadId });
            if (response) {
                return {
                    id: response.body.exceptionId,
                    description: response.body.description,
                    breakMode: response.body.breakMode,
                    details: response.body.details
                };
            }
            return undefined;
        }
        scopes(frameId, threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'scopes'));
            }
            const token = this.getNewCancellationToken(threadId);
            return this.raw.scopes({ frameId }, token);
        }
        variables(variablesReference, threadId, filter, start, count) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'variables'));
            }
            const token = threadId ? this.getNewCancellationToken(threadId) : undefined;
            return this.raw.variables({ variablesReference, filter, start, count }, token);
        }
        evaluate(expression, frameId, context) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'evaluate'));
            }
            return this.raw.evaluate({ expression, frameId, context });
        }
        async restartFrame(frameId, threadId) {
            await this.waitForTriggeredBreakpoints();
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'restartFrame'));
            }
            await this.raw.restartFrame({ frameId }, threadId);
        }
        setLastSteppingGranularity(threadId, granularity) {
            const thread = this.getThread(threadId);
            if (thread) {
                thread.lastSteppingGranularity = granularity;
            }
        }
        async next(threadId, granularity) {
            await this.waitForTriggeredBreakpoints();
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'next'));
            }
            this.setLastSteppingGranularity(threadId, granularity);
            await this.raw.next({ threadId, granularity });
        }
        async stepIn(threadId, targetId, granularity) {
            await this.waitForTriggeredBreakpoints();
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepIn'));
            }
            this.setLastSteppingGranularity(threadId, granularity);
            await this.raw.stepIn({ threadId, targetId, granularity });
        }
        async stepOut(threadId, granularity) {
            await this.waitForTriggeredBreakpoints();
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepOut'));
            }
            this.setLastSteppingGranularity(threadId, granularity);
            await this.raw.stepOut({ threadId, granularity });
        }
        async stepBack(threadId, granularity) {
            await this.waitForTriggeredBreakpoints();
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepBack'));
            }
            this.setLastSteppingGranularity(threadId, granularity);
            await this.raw.stepBack({ threadId, granularity });
        }
        async continue(threadId) {
            await this.waitForTriggeredBreakpoints();
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'continue'));
            }
            await this.raw.continue({ threadId });
        }
        async reverseContinue(threadId) {
            await this.waitForTriggeredBreakpoints();
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'reverse continue'));
            }
            await this.raw.reverseContinue({ threadId });
        }
        async pause(threadId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'pause'));
            }
            await this.raw.pause({ threadId });
        }
        async terminateThreads(threadIds) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'terminateThreads'));
            }
            await this.raw.terminateThreads({ threadIds });
        }
        setVariable(variablesReference, name, value) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'setVariable'));
            }
            return this.raw.setVariable({ variablesReference, name, value });
        }
        setExpression(frameId, expression, value) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'setExpression'));
            }
            return this.raw.setExpression({ expression, value, frameId });
        }
        gotoTargets(source, line, column) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'gotoTargets'));
            }
            return this.raw.gotoTargets({ source, line, column });
        }
        goto(threadId, targetId) {
            if (!this.raw) {
                throw new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'goto'));
            }
            return this.raw.goto({ threadId, targetId });
        }
        loadSource(resource) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'loadSource')));
            }
            const source = this.getSourceForUri(resource);
            let rawSource;
            if (source) {
                rawSource = source.raw;
            }
            else {
                // create a Source
                const data = debugSource_1.Source.getEncodedDebugData(resource);
                rawSource = { path: data.path, sourceReference: data.sourceReference };
            }
            return this.raw.source({ sourceReference: rawSource.sourceReference || 0, source: rawSource });
        }
        async getLoadedSources() {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'getLoadedSources')));
            }
            const response = await this.raw.loadedSources({});
            if (response && response.body && response.body.sources) {
                return response.body.sources.map(src => this.getSource(src));
            }
            else {
                return [];
            }
        }
        async completions(frameId, threadId, text, position, overwriteBefore, token) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'completions')));
            }
            const sessionCancelationToken = this.getNewCancellationToken(threadId, token);
            return this.raw.completions({
                frameId,
                text,
                column: position.column,
                line: position.lineNumber,
            }, sessionCancelationToken);
        }
        async stepInTargets(frameId) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepInTargets')));
            }
            const response = await this.raw.stepInTargets({ frameId });
            return response?.body.targets;
        }
        async cancel(progressId) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'cancel')));
            }
            return this.raw.cancel({ progressId });
        }
        async disassemble(memoryReference, offset, instructionOffset, instructionCount) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'disassemble')));
            }
            const response = await this.raw.disassemble({ memoryReference, offset, instructionOffset, instructionCount, resolveSymbols: true });
            return response?.body?.instructions;
        }
        readMemory(memoryReference, offset, count) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'readMemory')));
            }
            return this.raw.readMemory({ count, memoryReference, offset });
        }
        writeMemory(memoryReference, offset, data, allowPartial) {
            if (!this.raw) {
                return Promise.reject(new Error((0, nls_1.localize)('noDebugAdapter', "No debugger available, can not send '{0}'", 'disassemble')));
            }
            return this.raw.writeMemory({ memoryReference, offset, allowPartial, data });
        }
        //---- threads
        getThread(threadId) {
            return this.threads.get(threadId);
        }
        getAllThreads() {
            const result = [];
            this.threadIds.forEach((threadId) => {
                const thread = this.threads.get(threadId);
                if (thread) {
                    result.push(thread);
                }
            });
            return result;
        }
        clearThreads(removeThreads, reference = undefined) {
            if (reference !== undefined && reference !== null) {
                const thread = this.threads.get(reference);
                if (thread) {
                    thread.clearCallStack();
                    thread.stoppedDetails = undefined;
                    thread.stopped = false;
                    if (removeThreads) {
                        this.threads.delete(reference);
                    }
                }
            }
            else {
                this.threads.forEach(thread => {
                    thread.clearCallStack();
                    thread.stoppedDetails = undefined;
                    thread.stopped = false;
                });
                if (removeThreads) {
                    this.threads.clear();
                    this.threadIds = [];
                    debugModel_1.ExpressionContainer.allValues.clear();
                }
            }
        }
        getStoppedDetails() {
            return this.stoppedDetails.length >= 1 ? this.stoppedDetails[0] : undefined;
        }
        rawUpdate(data) {
            this.threadIds = [];
            data.threads.forEach(thread => {
                this.threadIds.push(thread.id);
                if (!this.threads.has(thread.id)) {
                    // A new thread came in, initialize it.
                    this.threads.set(thread.id, new debugModel_1.Thread(this, thread.name, thread.id));
                }
                else if (thread.name) {
                    // Just the thread name got updated #18244
                    const oldThread = this.threads.get(thread.id);
                    if (oldThread) {
                        oldThread.name = thread.name;
                    }
                }
            });
            this.threads.forEach(t => {
                // Remove all old threads which are no longer part of the update #75980
                if (this.threadIds.indexOf(t.threadId) === -1) {
                    this.threads.delete(t.threadId);
                }
            });
            const stoppedDetails = data.stoppedDetails;
            if (stoppedDetails) {
                // Set the availability of the threads' callstacks depending on
                // whether the thread is stopped or not
                if (stoppedDetails.allThreadsStopped) {
                    this.threads.forEach(thread => {
                        thread.stoppedDetails = thread.threadId === stoppedDetails.threadId ? stoppedDetails : { reason: thread.stoppedDetails?.reason };
                        thread.stopped = true;
                        thread.clearCallStack();
                    });
                }
                else {
                    const thread = typeof stoppedDetails.threadId === 'number' ? this.threads.get(stoppedDetails.threadId) : undefined;
                    if (thread) {
                        // One thread is stopped, only update that thread.
                        thread.stoppedDetails = stoppedDetails;
                        thread.clearCallStack();
                        thread.stopped = true;
                    }
                }
            }
        }
        waitForTriggeredBreakpoints() {
            if (!this._waitToResume) {
                return;
            }
            return (0, async_1.raceTimeout)(this._waitToResume, TRIGGERED_BREAKPOINT_MAX_DELAY);
        }
        async fetchThreads(stoppedDetails) {
            if (this.raw) {
                const response = await this.raw.threads();
                if (response && response.body && response.body.threads) {
                    this.model.rawUpdate({
                        sessionId: this.getId(),
                        threads: response.body.threads,
                        stoppedDetails
                    });
                }
            }
        }
        initializeForTest(raw) {
            this.raw = raw;
            this.registerListeners();
        }
        //---- private
        registerListeners() {
            if (!this.raw) {
                return;
            }
            this.rawListeners.add(this.raw.onDidInitialize(async () => {
                aria.status(this.configuration.noDebug
                    ? (0, nls_1.localize)('debuggingStartedNoDebug', "Started running without debugging.")
                    : (0, nls_1.localize)('debuggingStarted', "Debugging started."));
                const sendConfigurationDone = async () => {
                    if (this.raw && this.raw.capabilities.supportsConfigurationDoneRequest) {
                        try {
                            await this.raw.configurationDone();
                        }
                        catch (e) {
                            // Disconnect the debug session on configuration done error #10596
                            this.notificationService.error(e);
                            this.raw?.disconnect({});
                        }
                    }
                    return undefined;
                };
                // Send all breakpoints
                try {
                    await this.debugService.sendAllBreakpoints(this);
                }
                finally {
                    await sendConfigurationDone();
                    await this.fetchThreads();
                }
            }));
            const statusQueue = this.statusQueue;
            this.rawListeners.add(this.raw.onDidStop(event => this.handleStop(event.body)));
            this.rawListeners.add(this.raw.onDidThread(event => {
                statusQueue.cancel([event.body.threadId]);
                if (event.body.reason === 'started') {
                    // debounce to reduce threadsRequest frequency and improve performance
                    if (!this.fetchThreadsScheduler) {
                        this.fetchThreadsScheduler = new async_1.RunOnceScheduler(() => {
                            this.fetchThreads();
                        }, 100);
                        this.rawListeners.add(this.fetchThreadsScheduler);
                    }
                    if (!this.fetchThreadsScheduler.isScheduled()) {
                        this.fetchThreadsScheduler.schedule();
                    }
                }
                else if (event.body.reason === 'exited') {
                    this.model.clearThreads(this.getId(), true, event.body.threadId);
                    const viewModel = this.debugService.getViewModel();
                    const focusedThread = viewModel.focusedThread;
                    this.passFocusScheduler.cancel();
                    if (focusedThread && event.body.threadId === focusedThread.threadId) {
                        // De-focus the thread in case it was focused
                        this.debugService.focusStackFrame(undefined, undefined, viewModel.focusedSession, { explicit: false });
                    }
                }
            }));
            this.rawListeners.add(this.raw.onDidTerminateDebugee(async (event) => {
                aria.status((0, nls_1.localize)('debuggingStopped', "Debugging stopped."));
                if (event.body && event.body.restart) {
                    await this.debugService.restartSession(this, event.body.restart);
                }
                else if (this.raw) {
                    await this.raw.disconnect({ terminateDebuggee: false });
                }
            }));
            this.rawListeners.add(this.raw.onDidContinued(event => {
                const allThreads = event.body.allThreadsContinued !== false;
                statusQueue.cancel(allThreads ? undefined : [event.body.threadId]);
                const threadId = allThreads ? undefined : event.body.threadId;
                if (typeof threadId === 'number') {
                    this.stoppedDetails = this.stoppedDetails.filter(sd => sd.threadId !== threadId);
                    const tokens = this.cancellationMap.get(threadId);
                    this.cancellationMap.delete(threadId);
                    tokens?.forEach(t => t.dispose(true));
                }
                else {
                    this.stoppedDetails = [];
                    this.cancelAllRequests();
                }
                this.lastContinuedThreadId = threadId;
                // We need to pass focus to other sessions / threads with a timeout in case a quick stop event occurs #130321
                this.passFocusScheduler.schedule();
                this.model.clearThreads(this.getId(), false, threadId);
                this._onDidChangeState.fire();
            }));
            const outputQueue = new async_1.Queue();
            this.rawListeners.add(this.raw.onDidOutput(async (event) => {
                const outputSeverity = event.body.category === 'stderr' ? severity_1.default.Error : event.body.category === 'console' ? severity_1.default.Warning : severity_1.default.Info;
                // When a variables event is received, execute immediately to obtain the variables value #126967
                if (event.body.variablesReference) {
                    const source = event.body.source && event.body.line ? {
                        lineNumber: event.body.line,
                        column: event.body.column ? event.body.column : 1,
                        source: this.getSource(event.body.source)
                    } : undefined;
                    const container = new debugModel_1.ExpressionContainer(this, undefined, event.body.variablesReference, (0, uuid_1.generateUuid)());
                    const children = container.getChildren();
                    // we should put appendToRepl into queue to make sure the logs to be displayed in correct order
                    // see https://github.com/microsoft/vscode/issues/126967#issuecomment-874954269
                    outputQueue.queue(async () => {
                        const resolved = await children;
                        // For single logged variables, try to use the output if we can so
                        // present a better (i.e. ANSI-aware) representation of the output
                        if (resolved.length === 1) {
                            this.appendToRepl({ output: event.body.output, expression: resolved[0], sev: outputSeverity, source }, event.body.category === 'important');
                            return;
                        }
                        resolved.forEach((child) => {
                            // Since we can not display multiple trees in a row, we are displaying these variables one after the other (ignoring their names)
                            child.name = null;
                            this.appendToRepl({ output: '', expression: child, sev: outputSeverity, source }, event.body.category === 'important');
                        });
                    });
                    return;
                }
                outputQueue.queue(async () => {
                    if (!event.body || !this.raw) {
                        return;
                    }
                    if (event.body.category === 'telemetry') {
                        // only log telemetry events from debug adapter if the debug extension provided the telemetry key
                        // and the user opted in telemetry
                        const telemetryEndpoint = this.raw.dbgr.getCustomTelemetryEndpoint();
                        if (telemetryEndpoint && this.telemetryService.telemetryLevel !== 0 /* TelemetryLevel.NONE */) {
                            // __GDPR__TODO__ We're sending events in the name of the debug extension and we can not ensure that those are declared correctly.
                            let data = event.body.data;
                            if (!telemetryEndpoint.sendErrorTelemetry && event.body.data) {
                                data = (0, debugUtils_1.filterExceptionsFromTelemetry)(event.body.data);
                            }
                            this.customEndpointTelemetryService.publicLog(telemetryEndpoint, event.body.output, data);
                        }
                        return;
                    }
                    // Make sure to append output in the correct order by properly waiting on preivous promises #33822
                    const source = event.body.source && event.body.line ? {
                        lineNumber: event.body.line,
                        column: event.body.column ? event.body.column : 1,
                        source: this.getSource(event.body.source)
                    } : undefined;
                    if (event.body.group === 'start' || event.body.group === 'startCollapsed') {
                        const expanded = event.body.group === 'start';
                        this.repl.startGroup(event.body.output || '', expanded, source);
                        return;
                    }
                    if (event.body.group === 'end') {
                        this.repl.endGroup();
                        if (!event.body.output) {
                            // Only return if the end event does not have additional output in it
                            return;
                        }
                    }
                    if (typeof event.body.output === 'string') {
                        this.appendToRepl({ output: event.body.output, sev: outputSeverity, source }, event.body.category === 'important');
                    }
                });
            }));
            this.rawListeners.add(this.raw.onDidBreakpoint(event => {
                const id = event.body && event.body.breakpoint ? event.body.breakpoint.id : undefined;
                const breakpoint = this.model.getBreakpoints().find(bp => bp.getIdFromAdapter(this.getId()) === id);
                const functionBreakpoint = this.model.getFunctionBreakpoints().find(bp => bp.getIdFromAdapter(this.getId()) === id);
                const dataBreakpoint = this.model.getDataBreakpoints().find(dbp => dbp.getIdFromAdapter(this.getId()) === id);
                const exceptionBreakpoint = this.model.getExceptionBreakpoints().find(excbp => excbp.getIdFromAdapter(this.getId()) === id);
                if (event.body.reason === 'new' && event.body.breakpoint.source && event.body.breakpoint.line) {
                    const source = this.getSource(event.body.breakpoint.source);
                    const bps = this.model.addBreakpoints(source.uri, [{
                            column: event.body.breakpoint.column,
                            enabled: true,
                            lineNumber: event.body.breakpoint.line,
                        }], false);
                    if (bps.length === 1) {
                        const data = new Map([[bps[0].getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                }
                if (event.body.reason === 'removed') {
                    if (breakpoint) {
                        this.model.removeBreakpoints([breakpoint]);
                    }
                    if (functionBreakpoint) {
                        this.model.removeFunctionBreakpoints(functionBreakpoint.getId());
                    }
                    if (dataBreakpoint) {
                        this.model.removeDataBreakpoints(dataBreakpoint.getId());
                    }
                }
                if (event.body.reason === 'changed') {
                    if (breakpoint) {
                        if (!breakpoint.column) {
                            event.body.breakpoint.column = undefined;
                        }
                        const data = new Map([[breakpoint.getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                    if (functionBreakpoint) {
                        const data = new Map([[functionBreakpoint.getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                    if (dataBreakpoint) {
                        const data = new Map([[dataBreakpoint.getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                    if (exceptionBreakpoint) {
                        const data = new Map([[exceptionBreakpoint.getId(), event.body.breakpoint]]);
                        this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                    }
                }
            }));
            this.rawListeners.add(this.raw.onDidLoadedSource(event => {
                this._onDidLoadedSource.fire({
                    reason: event.body.reason,
                    source: this.getSource(event.body.source)
                });
            }));
            this.rawListeners.add(this.raw.onDidCustomEvent(event => {
                this._onDidCustomEvent.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidProgressStart(event => {
                this._onDidProgressStart.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidProgressUpdate(event => {
                this._onDidProgressUpdate.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidProgressEnd(event => {
                this._onDidProgressEnd.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidInvalidateMemory(event => {
                this._onDidInvalidMemory.fire(event);
            }));
            this.rawListeners.add(this.raw.onDidInvalidated(async (event) => {
                const areas = event.body.areas || ['all'];
                // If invalidated event only requires to update variables or watch, do that, otherwise refetch threads https://github.com/microsoft/vscode/issues/106745
                if (areas.includes('threads') || areas.includes('stacks') || areas.includes('all')) {
                    this.cancelAllRequests();
                    this.model.clearThreads(this.getId(), true);
                    const details = this.stoppedDetails;
                    this.stoppedDetails.length = 1;
                    await Promise.all(details.map(d => this.handleStop(d)));
                }
                const viewModel = this.debugService.getViewModel();
                if (viewModel.focusedSession === this) {
                    viewModel.updateViews();
                }
            }));
            this.rawListeners.add(this.raw.onDidExitAdapter(event => this.onDidExitAdapter(event)));
        }
        async handleStop(event) {
            this.passFocusScheduler.cancel();
            this.stoppedDetails.push(event);
            // do this very eagerly if we have hitBreakpointIds, since it may take a
            // moment for breakpoints to set and we want to do our best to not miss
            // anything
            if (event.hitBreakpointIds) {
                this._waitToResume = this.enableDependentBreakpoints(event.hitBreakpointIds);
            }
            this.statusQueue.run(this.fetchThreads(event).then(() => event.threadId === undefined ? this.threadIds : [event.threadId]), async (threadId, token) => {
                const hasLotsOfThreads = event.threadId === undefined && this.threadIds.length > 10;
                // If the focus for the current session is on a non-existent thread, clear the focus.
                const focusedThread = this.debugService.getViewModel().focusedThread;
                const focusedThreadDoesNotExist = focusedThread !== undefined && focusedThread.session === this && !this.threads.has(focusedThread.threadId);
                if (focusedThreadDoesNotExist) {
                    this.debugService.focusStackFrame(undefined, undefined);
                }
                const thread = typeof threadId === 'number' ? this.getThread(threadId) : undefined;
                if (thread) {
                    // Call fetch call stack twice, the first only return the top stack frame.
                    // Second retrieves the rest of the call stack. For performance reasons #25605
                    // Second call is only done if there's few threads that stopped in this event.
                    const promises = this.model.refreshTopOfCallstack(thread, /* fetchFullStack= */ !hasLotsOfThreads);
                    const focus = async () => {
                        if (focusedThreadDoesNotExist || (!event.preserveFocusHint && thread.getCallStack().length)) {
                            const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                            if (!focusedStackFrame || focusedStackFrame.thread.session === this) {
                                // Only take focus if nothing is focused, or if the focus is already on the current session
                                const preserveFocus = !this.configurationService.getValue('debug').focusEditorOnBreak;
                                await this.debugService.focusStackFrame(undefined, thread, undefined, { preserveFocus });
                            }
                            if (thread.stoppedDetails && !token.isCancellationRequested) {
                                if (thread.stoppedDetails.reason === 'breakpoint' && this.configurationService.getValue('debug').openDebug === 'openOnDebugBreak' && !this.suppressDebugView) {
                                    await this.paneCompositeService.openPaneComposite(debug_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
                                }
                                if (this.configurationService.getValue('debug').focusWindowOnBreak && !this.workbenchEnvironmentService.extensionTestsLocationURI) {
                                    const activeWindow = (0, dom_1.getActiveWindow)();
                                    if (!activeWindow.document.hasFocus()) {
                                        await this.hostService.focus(window_1.mainWindow, { force: true /* Application may not be active */ });
                                    }
                                }
                            }
                        }
                    };
                    await promises.topCallStack;
                    if (!event.hitBreakpointIds) { // if hitBreakpointIds are present, this is handled earlier on
                        this._waitToResume = this.enableDependentBreakpoints(thread);
                    }
                    if (token.isCancellationRequested) {
                        return;
                    }
                    focus();
                    await promises.wholeCallStack;
                    if (token.isCancellationRequested) {
                        return;
                    }
                    const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                    if (!focusedStackFrame || !focusedStackFrame.source || focusedStackFrame.source.presentationHint === 'deemphasize' || focusedStackFrame.presentationHint === 'deemphasize') {
                        // The top stack frame can be deemphesized so try to focus again #68616
                        focus();
                    }
                }
                this._onDidChangeState.fire();
            });
        }
        async enableDependentBreakpoints(hitBreakpointIdsOrThread) {
            let breakpoints;
            if (Array.isArray(hitBreakpointIdsOrThread)) {
                breakpoints = this.model.getBreakpoints().filter(bp => hitBreakpointIdsOrThread.includes(bp.getIdFromAdapter(this.id)));
            }
            else {
                const frame = hitBreakpointIdsOrThread.getTopStackFrame();
                if (frame === undefined) {
                    return;
                }
                if (hitBreakpointIdsOrThread.stoppedDetails && hitBreakpointIdsOrThread.stoppedDetails.reason !== 'breakpoint') {
                    return;
                }
                breakpoints = this.getBreakpointsAtPosition(frame.source.uri, frame.range.startLineNumber, frame.range.endLineNumber, frame.range.startColumn, frame.range.endColumn);
            }
            // find the current breakpoints
            // check if the current breakpoints are dependencies, and if so collect and send the dependents to DA
            const urisToResend = new Set();
            this.model.getBreakpoints({ triggeredOnly: true, enabledOnly: true }).forEach(bp => {
                breakpoints.forEach(cbp => {
                    if (bp.enabled && bp.triggeredBy === cbp.getId()) {
                        bp.setSessionDidTrigger(this.getId());
                        urisToResend.add(bp.uri.toString());
                    }
                });
            });
            const results = [];
            urisToResend.forEach((uri) => results.push(this.debugService.sendBreakpoints(uri_1.URI.parse(uri), undefined, this)));
            return Promise.all(results);
        }
        getBreakpointsAtPosition(uri, startLineNumber, endLineNumber, startColumn, endColumn) {
            return this.model.getBreakpoints({ uri: uri }).filter(bp => {
                if (bp.lineNumber < startLineNumber || bp.lineNumber > endLineNumber) {
                    return false;
                }
                if (bp.column && (bp.column < startColumn || bp.column > endColumn)) {
                    return false;
                }
                return true;
            });
        }
        onDidExitAdapter(event) {
            this.initialized = true;
            this.model.setBreakpointSessionData(this.getId(), this.capabilities, undefined);
            this.shutdown();
            this._onDidEndAdapter.fire(event);
        }
        // Disconnects and clears state. Session can be initialized again for a new connection.
        shutdown() {
            this.rawListeners.clear();
            if (this.raw) {
                // Send out disconnect and immediatly dispose (do not wait for response) #127418
                this.raw.disconnect({});
                this.raw.dispose();
                this.raw = undefined;
            }
            this.fetchThreadsScheduler?.dispose();
            this.fetchThreadsScheduler = undefined;
            this.passFocusScheduler.cancel();
            this.passFocusScheduler.dispose();
            this.model.clearThreads(this.getId(), true);
            this._onDidChangeState.fire();
        }
        dispose() {
            this.cancelAllRequests();
            this.rawListeners.dispose();
            this.globalDisposables.dispose();
        }
        //---- sources
        getSourceForUri(uri) {
            return this.sources.get(this.uriIdentityService.asCanonicalUri(uri).toString());
        }
        getSource(raw) {
            let source = new debugSource_1.Source(raw, this.getId(), this.uriIdentityService, this.logService);
            const uriKey = source.uri.toString();
            const found = this.sources.get(uriKey);
            if (found) {
                source = found;
                // merge attributes of new into existing
                source.raw = (0, objects_1.mixin)(source.raw, raw);
                if (source.raw && raw) {
                    // Always take the latest presentation hint from adapter #42139
                    source.raw.presentationHint = raw.presentationHint;
                }
            }
            else {
                this.sources.set(uriKey, source);
            }
            return source;
        }
        getRawSource(uri) {
            const source = this.getSourceForUri(uri);
            if (source) {
                return source.raw;
            }
            else {
                const data = debugSource_1.Source.getEncodedDebugData(uri);
                return { name: data.name, path: data.path, sourceReference: data.sourceReference };
            }
        }
        getNewCancellationToken(threadId, token) {
            const tokenSource = new cancellation_1.CancellationTokenSource(token);
            const tokens = this.cancellationMap.get(threadId) || [];
            tokens.push(tokenSource);
            this.cancellationMap.set(threadId, tokens);
            return tokenSource.token;
        }
        cancelAllRequests() {
            this.cancellationMap.forEach(tokens => tokens.forEach(t => t.dispose(true)));
            this.cancellationMap.clear();
        }
        // REPL
        getReplElements() {
            return this.repl.getReplElements();
        }
        hasSeparateRepl() {
            return !this.parentSession || this._options.repl !== 'mergeWithParent';
        }
        removeReplExpressions() {
            this.repl.removeReplExpressions();
        }
        async addReplExpression(stackFrame, name) {
            await this.repl.addReplExpression(this, stackFrame, name);
            // Evaluate all watch expressions and fetch variables again since repl evaluation might have changed some.
            this.debugService.getViewModel().updateViews();
        }
        appendToRepl(data, isImportant) {
            this.repl.appendToRepl(this, data);
            if (isImportant) {
                this.notificationService.notify({ message: data.output.toString(), severity: data.sev, source: this.name });
            }
        }
    };
    exports.DebugSession = DebugSession;
    exports.DebugSession = DebugSession = __decorate([
        __param(5, debug_1.IDebugService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, host_1.IHostService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, panecomposite_1.IPaneCompositePartService),
        __param(10, workspace_1.IWorkspaceContextService),
        __param(11, productService_1.IProductService),
        __param(12, notification_1.INotificationService),
        __param(13, lifecycle_2.ILifecycleService),
        __param(14, uriIdentity_1.IUriIdentityService),
        __param(15, instantiation_1.IInstantiationService),
        __param(16, telemetry_1.ICustomEndpointTelemetryService),
        __param(17, environmentService_1.IWorkbenchEnvironmentService),
        __param(18, log_1.ILogService)
    ], DebugSession);
    /**
     * Keeps track of events for threads, and cancels any previous operations for
     * a thread when the thread goes into a new state. Currently, the operations a thread has are:
     *
     * - started
     * - stopped
     * - continue
     * - exited
     *
     * In each case, the new state preempts the old state, so we don't need to
     * queue work, just cancel old work. It's up to the caller to make sure that
     * no UI effects happen at the point when the `token` is cancelled.
     */
    class ThreadStatusScheduler extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            /**
             * An array of set of thread IDs. When a 'stopped' event is encountered, the
             * editor refreshes its thread IDs. In the meantime, the thread may change
             * state it again. So the editor puts a Set into this array when it starts
             * the refresh, and checks it after the refresh is finished, to see if
             * any of the threads it looked up should now be invalidated.
             */
            this.pendingCancellations = [];
            /**
             * Cancellation tokens for currently-running operations on threads.
             */
            this.threadOps = this._register(new lifecycle_1.DisposableMap());
        }
        /**
         * Runs the operation.
         * If thread is undefined it affects all threads.
         */
        async run(threadIdsP, operation) {
            const cancelledWhileLookingUpThreads = new Set();
            this.pendingCancellations.push(cancelledWhileLookingUpThreads);
            const threadIds = await threadIdsP;
            // Now that we got our threads,
            // 1. Remove our pending set, and
            // 2. Cancel any slower callers who might also have found this thread
            for (let i = 0; i < this.pendingCancellations.length; i++) {
                const s = this.pendingCancellations[i];
                if (s === cancelledWhileLookingUpThreads) {
                    this.pendingCancellations.splice(i, 1);
                    break;
                }
                else {
                    for (const threadId of threadIds) {
                        s.add(threadId);
                    }
                }
            }
            if (cancelledWhileLookingUpThreads.has(undefined)) {
                return;
            }
            await Promise.all(threadIds.map(threadId => {
                if (cancelledWhileLookingUpThreads.has(threadId)) {
                    return;
                }
                this.threadOps.get(threadId)?.cancel();
                const cts = new cancellation_1.CancellationTokenSource();
                this.threadOps.set(threadId, cts);
                return operation(threadId, cts.token);
            }));
        }
        /**
         * Cancels all ongoing state operations on the given threads.
         * If threads is undefined it cancel all threads.
         */
        cancel(threadIds) {
            if (!threadIds) {
                for (const [_, op] of this.threadOps) {
                    op.cancel();
                }
                this.threadOps.clearAndDisposeAll();
                for (const s of this.pendingCancellations) {
                    s.add(undefined);
                }
            }
            else {
                for (const threadId of threadIds) {
                    this.threadOps.get(threadId)?.cancel();
                    this.threadOps.deleteAndDispose(threadId);
                    for (const s of this.pendingCancellations) {
                        s.add(threadId);
                    }
                }
            }
        }
    }
    exports.ThreadStatusScheduler = ThreadStatusScheduler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnU2Vzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5Q2hHLE1BQU0sOEJBQThCLEdBQUcsSUFBSSxDQUFDO0lBRXJDLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQVk7UUEwQ3hCLFlBQ1MsRUFBVSxFQUNWLGNBQXNFLEVBQ3ZFLElBQWtDLEVBQ2pDLEtBQWlCLEVBQ3pCLE9BQXlDLEVBQzFCLFlBQTRDLEVBQ3hDLGdCQUFvRCxFQUN6RCxXQUEwQyxFQUNqQyxvQkFBNEQsRUFDeEQsb0JBQWdFLEVBQ2pFLHVCQUFrRSxFQUMzRSxjQUFnRCxFQUMzQyxtQkFBMEQsRUFDN0QsZ0JBQW1DLEVBQ2pDLGtCQUF3RCxFQUN0RCxvQkFBNEQsRUFDbEQsOEJBQWdGLEVBQ25GLDJCQUEwRSxFQUMzRixVQUF3QztZQWxCN0MsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUNWLG1CQUFjLEdBQWQsY0FBYyxDQUF3RDtZQUN2RSxTQUFJLEdBQUosSUFBSSxDQUE4QjtZQUNqQyxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBRU8saUJBQVksR0FBWixZQUFZLENBQWU7WUFDdkIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN4QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNoQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3ZDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBMkI7WUFDaEQsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUMxRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDMUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUUxQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lB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
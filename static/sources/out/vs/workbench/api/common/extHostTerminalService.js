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
define(["require", "exports", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/workbench/api/common/extHostRpcService", "vs/base/common/lifecycle", "./extHostTypes", "vs/nls", "vs/base/common/errors", "vs/platform/terminal/common/environmentVariableShared", "vs/base/common/cancellation", "vs/base/common/uuid", "vs/platform/terminal/common/terminalDataBuffering", "vs/base/common/themables", "vs/base/common/async", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostCommands"], function (require, exports, event_1, extHost_protocol_1, instantiation_1, uri_1, extHostRpcService_1, lifecycle_1, extHostTypes_1, nls_1, errors_1, environmentVariableShared_1, cancellation_1, uuid_1, terminalDataBuffering_1, themables_1, async_1, extHostTypeConverters_1, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkerExtHostTerminalService = exports.BaseExtHostTerminalService = exports.ExtHostTerminal = exports.IExtHostTerminalService = void 0;
    exports.IExtHostTerminalService = (0, instantiation_1.createDecorator)('IExtHostTerminalService');
    class ExtHostTerminal {
        constructor(_proxy, _id, _creationOptions, _name) {
            this._proxy = _proxy;
            this._id = _id;
            this._creationOptions = _creationOptions;
            this._name = _name;
            this._disposed = false;
            this._state = { isInteractedWith: false };
            this.isOpen = false;
            this._creationOptions = Object.freeze(this._creationOptions);
            this._pidPromise = new Promise(c => this._pidPromiseComplete = c);
            const that = this;
            this.value = {
                get name() {
                    return that._name || '';
                },
                get processId() {
                    return that._pidPromise;
                },
                get creationOptions() {
                    return that._creationOptions;
                },
                get exitStatus() {
                    return that._exitStatus;
                },
                get state() {
                    return that._state;
                },
                get selection() {
                    return that._selection;
                },
                sendText(text, shouldExecute = true) {
                    that._checkDisposed();
                    that._proxy.$sendText(that._id, text, shouldExecute);
                },
                show(preserveFocus) {
                    that._checkDisposed();
                    that._proxy.$show(that._id, preserveFocus);
                },
                hide() {
                    that._checkDisposed();
                    that._proxy.$hide(that._id);
                },
                dispose() {
                    if (!that._disposed) {
                        that._disposed = true;
                        that._proxy.$dispose(that._id);
                    }
                },
                get dimensions() {
                    if (that._cols === undefined || that._rows === undefined) {
                        return undefined;
                    }
                    return {
                        columns: that._cols,
                        rows: that._rows
                    };
                }
            };
        }
        async create(options, internalOptions) {
            if (typeof this._id !== 'string') {
                throw new Error('Terminal has already been created');
            }
            await this._proxy.$createTerminal(this._id, {
                name: options.name,
                shellPath: options.shellPath ?? undefined,
                shellArgs: options.shellArgs ?? undefined,
                cwd: options.cwd ?? internalOptions?.cwd ?? undefined,
                env: options.env ?? undefined,
                icon: asTerminalIcon(options.iconPath) ?? undefined,
                color: themables_1.ThemeColor.isThemeColor(options.color) ? options.color.id : undefined,
                initialText: options.message ?? undefined,
                strictEnv: options.strictEnv ?? undefined,
                hideFromUser: options.hideFromUser ?? undefined,
                isFeatureTerminal: internalOptions?.isFeatureTerminal ?? undefined,
                isExtensionOwnedTerminal: true,
                useShellEnvironment: internalOptions?.useShellEnvironment ?? undefined,
                location: internalOptions?.location || this._serializeParentTerminal(options.location, internalOptions?.resolvedExtHostIdentifier),
                isTransient: options.isTransient ?? undefined,
            });
        }
        async createExtensionTerminal(location, internalOptions, parentTerminal, iconPath, color) {
            if (typeof this._id !== 'string') {
                throw new Error('Terminal has already been created');
            }
            await this._proxy.$createTerminal(this._id, {
                name: this._name,
                isExtensionCustomPtyTerminal: true,
                icon: iconPath,
                color: themables_1.ThemeColor.isThemeColor(color) ? color.id : undefined,
                location: internalOptions?.location || this._serializeParentTerminal(location, parentTerminal),
                isTransient: true
            });
            // At this point, the id has been set via `$acceptTerminalOpened`
            if (typeof this._id === 'string') {
                throw new Error('Terminal creation failed');
            }
            return this._id;
        }
        _serializeParentTerminal(location, parentTerminal) {
            if (typeof location === 'object') {
                if ('parentTerminal' in location && location.parentTerminal && parentTerminal) {
                    return { parentTerminal };
                }
                if ('viewColumn' in location) {
                    return { viewColumn: extHostTypeConverters_1.ViewColumn.from(location.viewColumn), preserveFocus: location.preserveFocus };
                }
                return undefined;
            }
            return location;
        }
        _checkDisposed() {
            if (this._disposed) {
                throw new Error('Terminal has already been disposed');
            }
        }
        set name(name) {
            this._name = name;
        }
        setExitStatus(code, reason) {
            this._exitStatus = Object.freeze({ code, reason });
        }
        setDimensions(cols, rows) {
            if (cols === this._cols && rows === this._rows) {
                // Nothing changed
                return false;
            }
            if (cols === 0 || rows === 0) {
                return false;
            }
            this._cols = cols;
            this._rows = rows;
            return true;
        }
        setInteractedWith() {
            if (!this._state.isInteractedWith) {
                this._state = { isInteractedWith: true };
                return true;
            }
            return false;
        }
        setSelection(selection) {
            this._selection = selection;
        }
        _setProcessId(processId) {
            // The event may fire 2 times when the panel is restored
            if (this._pidPromiseComplete) {
                this._pidPromiseComplete(processId);
                this._pidPromiseComplete = undefined;
            }
            else {
                // Recreate the promise if this is the nth processId set (e.g. reused task terminals)
                this._pidPromise.then(pid => {
                    if (pid !== processId) {
                        this._pidPromise = Promise.resolve(processId);
                    }
                });
            }
        }
    }
    exports.ExtHostTerminal = ExtHostTerminal;
    class ExtHostPseudoterminal {
        get onProcessReady() { return this._onProcessReady.event; }
        constructor(_pty) {
            this._pty = _pty;
            this.id = 0;
            this.shouldPersist = false;
            this._onProcessData = new event_1.Emitter();
            this.onProcessData = this._onProcessData.event;
            this._onProcessReady = new event_1.Emitter();
            this._onDidChangeProperty = new event_1.Emitter();
            this.onDidChangeProperty = this._onDidChangeProperty.event;
            this._onProcessExit = new event_1.Emitter();
            this.onProcessExit = this._onProcessExit.event;
        }
        refreshProperty(property) {
            throw new Error(`refreshProperty is not suppported in extension owned terminals. property: ${property}`);
        }
        updateProperty(property, value) {
            throw new Error(`updateProperty is not suppported in extension owned terminals. property: ${property}, value: ${value}`);
        }
        async start() {
            return undefined;
        }
        shutdown() {
            this._pty.close();
        }
        input(data) {
            this._pty.handleInput?.(data);
        }
        resize(cols, rows) {
            this._pty.setDimensions?.({ columns: cols, rows });
        }
        clearBuffer() {
            // no-op
        }
        async processBinary(data) {
            // No-op, processBinary is not supported in extension owned terminals.
        }
        acknowledgeDataEvent(charCount) {
            // No-op, flow control is not supported in extension owned terminals. If this is ever
            // implemented it will need new pause and resume VS Code APIs.
        }
        async setUnicodeVersion(version) {
            // No-op, xterm-headless isn't used for extension owned terminals.
        }
        getInitialCwd() {
            return Promise.resolve('');
        }
        getCwd() {
            return Promise.resolve('');
        }
        startSendingEvents(initialDimensions) {
            // Attach the listeners
            this._pty.onDidWrite(e => this._onProcessData.fire(e));
            this._pty.onDidClose?.((e = undefined) => {
                this._onProcessExit.fire(e === void 0 ? undefined : e);
            });
            this._pty.onDidOverrideDimensions?.(e => {
                if (e) {
                    this._onDidChangeProperty.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: { cols: e.columns, rows: e.rows } });
                }
            });
            this._pty.onDidChangeName?.(title => {
                this._onDidChangeProperty.fire({ type: "title" /* ProcessPropertyType.Title */, value: title });
            });
            this._pty.open(initialDimensions ? initialDimensions : undefined);
            if (initialDimensions) {
                this._pty.setDimensions?.(initialDimensions);
            }
            this._onProcessReady.fire({ pid: -1, cwd: '', windowsPty: undefined });
        }
    }
    let nextLinkId = 1;
    let BaseExtHostTerminalService = class BaseExtHostTerminalService extends lifecycle_1.Disposable {
        get activeTerminal() { return this._activeTerminal?.value; }
        get terminals() { return this._terminals.map(term => term.value); }
        constructor(supportsProcesses, _extHostCommands, extHostRpc) {
            super();
            this._extHostCommands = _extHostCommands;
            this._terminals = [];
            this._terminalProcesses = new Map();
            this._terminalProcessDisposables = {};
            this._extensionTerminalAwaitingStart = {};
            this._getTerminalPromises = {};
            this._environmentVariableCollections = new Map();
            this._lastQuickFixCommands = this._register(new lifecycle_1.MutableDisposable());
            this._linkProviders = new Set();
            this._profileProviders = new Map();
            this._quickFixProviders = new Map();
            this._terminalLinkCache = new Map();
            this._terminalLinkCancellationSource = new Map();
            this._onDidCloseTerminal = new event_1.Emitter();
            this.onDidCloseTerminal = this._onDidCloseTerminal.event;
            this._onDidOpenTerminal = new event_1.Emitter();
            this.onDidOpenTerminal = this._onDidOpenTerminal.event;
            this._onDidChangeActiveTerminal = new event_1.Emitter();
            this.onDidChangeActiveTerminal = this._onDidChangeActiveTerminal.event;
            this._onDidChangeTerminalDimensions = new event_1.Emitter();
            this.onDidChangeTerminalDimensions = this._onDidChangeTerminalDimensions.event;
            this._onDidChangeTerminalState = new event_1.Emitter();
            this.onDidChangeTerminalState = this._onDidChangeTerminalState.event;
            this._onDidChangeShell = new event_1.Emitter();
            this.onDidChangeShell = this._onDidChangeShell.event;
            this._onDidWriteTerminalData = new event_1.Emitter({
                onWillAddFirstListener: () => this._proxy.$startSendingDataEvents(),
                onDidRemoveLastListener: () => this._proxy.$stopSendingDataEvents()
            });
            this.onDidWriteTerminalData = this._onDidWriteTerminalData.event;
            this._onDidExecuteCommand = new event_1.Emitter({
                onWillAddFirstListener: () => this._proxy.$startSendingCommandEvents(),
                onDidRemoveLastListener: () => this._proxy.$stopSendingCommandEvents()
            });
            this.onDidExecuteTerminalCommand = this._onDidExecuteCommand.event;
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadTerminalService);
            this._bufferer = new terminalDataBuffering_1.TerminalDataBufferer(this._proxy.$sendProcessData);
            this._proxy.$registerProcessSupport(supportsProcesses);
            this._extHostCommands.registerArgumentProcessor({
                processArgument: arg => {
                    const deserialize = (arg) => {
                        const cast = arg;
                        return this._getTerminalById(cast.instanceId)?.value;
                    };
                    switch (arg?.$mid) {
                        case 15 /* MarshalledId.TerminalContext */: return deserialize(arg);
                        default: {
                            // Do array transformation in place as this is a hot path
                            if (Array.isArray(arg)) {
                                for (let i = 0; i < arg.length; i++) {
                                    if (arg[i].$mid === 15 /* MarshalledId.TerminalContext */) {
                                        arg[i] = deserialize(arg[i]);
                                    }
                                    else {
                                        // Probably something else, so exit early
                                        break;
                                    }
                                }
                            }
                            return arg;
                        }
                    }
                }
            });
            this._register({
                dispose: () => {
                    for (const [_, terminalProcess] of this._terminalProcesses) {
                        terminalProcess.shutdown(true);
                    }
                }
            });
        }
        getDefaultShell(useAutomationShell) {
            const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
            return profile?.path || '';
        }
        getDefaultShellArgs(useAutomationShell) {
            const profile = useAutomationShell ? this._defaultAutomationProfile : this._defaultProfile;
            return profile?.args || [];
        }
        createExtensionTerminal(options, internalOptions) {
            const terminal = new ExtHostTerminal(this._proxy, (0, uuid_1.generateUuid)(), options, options.name);
            const p = new ExtHostPseudoterminal(options.pty);
            terminal.createExtensionTerminal(options.location, internalOptions, this._serializeParentTerminal(options, internalOptions).resolvedExtHostIdentifier, asTerminalIcon(options.iconPath), asTerminalColor(options.color)).then(id => {
                const disposable = this._setupExtHostProcessListeners(id, p);
                this._terminalProcessDisposables[id] = disposable;
            });
            this._terminals.push(terminal);
            return terminal.value;
        }
        _serializeParentTerminal(options, internalOptions) {
            internalOptions = internalOptions ? internalOptions : {};
            if (options.location && typeof options.location === 'object' && 'parentTerminal' in options.location) {
                const parentTerminal = options.location.parentTerminal;
                if (parentTerminal) {
                    const parentExtHostTerminal = this._terminals.find(t => t.value === parentTerminal);
                    if (parentExtHostTerminal) {
                        internalOptions.resolvedExtHostIdentifier = parentExtHostTerminal._id;
                    }
                }
            }
            else if (options.location && typeof options.location !== 'object') {
                internalOptions.location = options.location;
            }
            else if (internalOptions.location && typeof internalOptions.location === 'object' && 'splitActiveTerminal' in internalOptions.location) {
                internalOptions.location = { splitActiveTerminal: true };
            }
            return internalOptions;
        }
        attachPtyToTerminal(id, pty) {
            const terminal = this._getTerminalById(id);
            if (!terminal) {
                throw new Error(`Cannot resolve terminal with id ${id} for virtual process`);
            }
            const p = new ExtHostPseudoterminal(pty);
            const disposable = this._setupExtHostProcessListeners(id, p);
            this._terminalProcessDisposables[id] = disposable;
        }
        async $acceptActiveTerminalChanged(id) {
            const original = this._activeTerminal;
            if (id === null) {
                this._activeTerminal = undefined;
                if (original !== this._activeTerminal) {
                    this._onDidChangeActiveTerminal.fire(this._activeTerminal);
                }
                return;
            }
            const terminal = this._getTerminalById(id);
            if (terminal) {
                this._activeTerminal = terminal;
                if (original !== this._activeTerminal) {
                    this._onDidChangeActiveTerminal.fire(this._activeTerminal.value);
                }
            }
        }
        async $acceptTerminalProcessData(id, data) {
            const terminal = this._getTerminalById(id);
            if (terminal) {
                this._onDidWriteTerminalData.fire({ terminal: terminal.value, data });
            }
        }
        async $acceptTerminalDimensions(id, cols, rows) {
            const terminal = this._getTerminalById(id);
            if (terminal) {
                if (terminal.setDimensions(cols, rows)) {
                    this._onDidChangeTerminalDimensions.fire({
                        terminal: terminal.value,
                        dimensions: terminal.value.dimensions
                    });
                }
            }
        }
        async $acceptDidExecuteCommand(id, command) {
            const terminal = this._getTerminalById(id);
            if (terminal) {
                this._onDidExecuteCommand.fire({ terminal: terminal.value, ...command });
            }
        }
        async $acceptTerminalMaximumDimensions(id, cols, rows) {
            // Extension pty terminal only - when virtual process resize fires it means that the
            // terminal's maximum dimensions changed
            this._terminalProcesses.get(id)?.resize(cols, rows);
        }
        async $acceptTerminalTitleChange(id, name) {
            const terminal = this._getTerminalById(id);
            if (terminal) {
                terminal.name = name;
            }
        }
        async $acceptTerminalClosed(id, exitCode, exitReason) {
            const index = this._getTerminalObjectIndexById(this._terminals, id);
            if (index !== null) {
                const terminal = this._terminals.splice(index, 1)[0];
                terminal.setExitStatus(exitCode, exitReason);
                this._onDidCloseTerminal.fire(terminal.value);
            }
        }
        $acceptTerminalOpened(id, extHostTerminalId, name, shellLaunchConfigDto) {
            if (extHostTerminalId) {
                // Resolve with the renderer generated id
                const index = this._getTerminalObjectIndexById(this._terminals, extHostTerminalId);
                if (index !== null) {
                    // The terminal has already been created (via createTerminal*), only fire the event
                    this._terminals[index]._id = id;
                    this._onDidOpenTerminal.fire(this.terminals[index]);
                    this._terminals[index].isOpen = true;
                    return;
                }
            }
            const creationOptions = {
                name: shellLaunchConfigDto.name,
                shellPath: shellLaunchConfigDto.executable,
                shellArgs: shellLaunchConfigDto.args,
                cwd: typeof shellLaunchConfigDto.cwd === 'string' ? shellLaunchConfigDto.cwd : uri_1.URI.revive(shellLaunchConfigDto.cwd),
                env: shellLaunchConfigDto.env,
                hideFromUser: shellLaunchConfigDto.hideFromUser
            };
            const terminal = new ExtHostTerminal(this._proxy, id, creationOptions, name);
            this._terminals.push(terminal);
            this._onDidOpenTerminal.fire(terminal.value);
            terminal.isOpen = true;
        }
        async $acceptTerminalProcessId(id, processId) {
            const terminal = this._getTerminalById(id);
            terminal?._setProcessId(processId);
        }
        async $startExtensionTerminal(id, initialDimensions) {
            // Make sure the ExtHostTerminal exists so onDidOpenTerminal has fired before we call
            // Pseudoterminal.start
            const terminal = this._getTerminalById(id);
            if (!terminal) {
                return { message: (0, nls_1.localize)('launchFail.idMissingOnExtHost', "Could not find the terminal with id {0} on the extension host", id) };
            }
            // Wait for onDidOpenTerminal to fire
            if (!terminal.isOpen) {
                await new Promise(r => {
                    // Ensure open is called after onDidOpenTerminal
                    const listener = this.onDidOpenTerminal(async (e) => {
                        if (e === terminal.value) {
                            listener.dispose();
                            r();
                        }
                    });
                });
            }
            const terminalProcess = this._terminalProcesses.get(id);
            if (terminalProcess) {
                terminalProcess.startSendingEvents(initialDimensions);
            }
            else {
                // Defer startSendingEvents call to when _setupExtHostProcessListeners is called
                this._extensionTerminalAwaitingStart[id] = { initialDimensions };
            }
            return undefined;
        }
        _setupExtHostProcessListeners(id, p) {
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(p.onProcessReady(e => this._proxy.$sendProcessReady(id, e.pid, e.cwd, e.windowsPty)));
            disposables.add(p.onDidChangeProperty(property => this._proxy.$sendProcessProperty(id, property)));
            // Buffer data events to reduce the amount of messages going to the renderer
            this._bufferer.startBuffering(id, p.onProcessData);
            disposables.add(p.onProcessExit(exitCode => this._onProcessExit(id, exitCode)));
            this._terminalProcesses.set(id, p);
            const awaitingStart = this._extensionTerminalAwaitingStart[id];
            if (awaitingStart && p instanceof ExtHostPseudoterminal) {
                p.startSendingEvents(awaitingStart.initialDimensions);
                delete this._extensionTerminalAwaitingStart[id];
            }
            return disposables;
        }
        $acceptProcessAckDataEvent(id, charCount) {
            this._terminalProcesses.get(id)?.acknowledgeDataEvent(charCount);
        }
        $acceptProcessInput(id, data) {
            this._terminalProcesses.get(id)?.input(data);
        }
        $acceptTerminalInteraction(id) {
            const terminal = this._getTerminalById(id);
            if (terminal?.setInteractedWith()) {
                this._onDidChangeTerminalState.fire(terminal.value);
            }
        }
        $acceptTerminalSelection(id, selection) {
            this._getTerminalById(id)?.setSelection(selection);
        }
        $acceptProcessResize(id, cols, rows) {
            try {
                this._terminalProcesses.get(id)?.resize(cols, rows);
            }
            catch (error) {
                // We tried to write to a closed pipe / channel.
                if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
                    throw (error);
                }
            }
        }
        $acceptProcessShutdown(id, immediate) {
            this._terminalProcesses.get(id)?.shutdown(immediate);
        }
        $acceptProcessRequestInitialCwd(id) {
            this._terminalProcesses.get(id)?.getInitialCwd().then(initialCwd => this._proxy.$sendProcessProperty(id, { type: "initialCwd" /* ProcessPropertyType.InitialCwd */, value: initialCwd }));
        }
        $acceptProcessRequestCwd(id) {
            this._terminalProcesses.get(id)?.getCwd().then(cwd => this._proxy.$sendProcessProperty(id, { type: "cwd" /* ProcessPropertyType.Cwd */, value: cwd }));
        }
        $acceptProcessRequestLatency(id) {
            return Promise.resolve(id);
        }
        registerLinkProvider(provider) {
            this._linkProviders.add(provider);
            if (this._linkProviders.size === 1) {
                this._proxy.$startLinkProvider();
            }
            return new extHostTypes_1.Disposable(() => {
                this._linkProviders.delete(provider);
                if (this._linkProviders.size === 0) {
                    this._proxy.$stopLinkProvider();
                }
            });
        }
        registerProfileProvider(extension, id, provider) {
            if (this._profileProviders.has(id)) {
                throw new Error(`Terminal profile provider "${id}" already registered`);
            }
            this._profileProviders.set(id, provider);
            this._proxy.$registerProfileProvider(id, extension.identifier.value);
            return new extHostTypes_1.Disposable(() => {
                this._profileProviders.delete(id);
                this._proxy.$unregisterProfileProvider(id);
            });
        }
        registerTerminalQuickFixProvider(id, extensionId, provider) {
            if (this._quickFixProviders.has(id)) {
                throw new Error(`Terminal quick fix provider "${id}" is already registered`);
            }
            this._quickFixProviders.set(id, provider);
            this._proxy.$registerQuickFixProvider(id, extensionId);
            return new extHostTypes_1.Disposable(() => {
                this._quickFixProviders.delete(id);
                this._proxy.$unregisterQuickFixProvider(id);
            });
        }
        async $provideTerminalQuickFixes(id, matchResult) {
            const token = new cancellation_1.CancellationTokenSource().token;
            if (token.isCancellationRequested) {
                return;
            }
            const provider = this._quickFixProviders.get(id);
            if (!provider) {
                return;
            }
            const quickFixes = await provider.provideTerminalQuickFixes(matchResult, token);
            if (quickFixes === null || (Array.isArray(quickFixes) && quickFixes.length === 0)) {
                return undefined;
            }
            const store = new lifecycle_1.DisposableStore();
            this._lastQuickFixCommands.value = store;
            // Single
            if (!Array.isArray(quickFixes)) {
                return quickFixes ? extHostTypeConverters_1.TerminalQuickFix.from(quickFixes, this._extHostCommands.converter, store) : undefined;
            }
            // Many
            const result = [];
            for (const fix of quickFixes) {
                const converted = extHostTypeConverters_1.TerminalQuickFix.from(fix, this._extHostCommands.converter, store);
                if (converted) {
                    result.push(converted);
                }
            }
            return result;
        }
        async $createContributedProfileTerminal(id, options) {
            const token = new cancellation_1.CancellationTokenSource().token;
            let profile = await this._profileProviders.get(id)?.provideTerminalProfile(token);
            if (token.isCancellationRequested) {
                return;
            }
            if (profile && !('options' in profile)) {
                profile = { options: profile };
            }
            if (!profile || !('options' in profile)) {
                throw new Error(`No terminal profile options provided for id "${id}"`);
            }
            if ('pty' in profile.options) {
                this.createExtensionTerminal(profile.options, options);
                return;
            }
            this.createTerminalFromOptions(profile.options, options);
        }
        async $provideLinks(terminalId, line) {
            const terminal = this._getTerminalById(terminalId);
            if (!terminal) {
                return [];
            }
            // Discard any cached links the terminal has been holding, currently all links are released
            // when new links are provided.
            this._terminalLinkCache.delete(terminalId);
            const oldToken = this._terminalLinkCancellationSource.get(terminalId);
            oldToken?.dispose(true);
            const cancellationSource = new cancellation_1.CancellationTokenSource();
            this._terminalLinkCancellationSource.set(terminalId, cancellationSource);
            const result = [];
            const context = { terminal: terminal.value, line };
            const promises = [];
            for (const provider of this._linkProviders) {
                promises.push(async_1.Promises.withAsyncBody(async (r) => {
                    cancellationSource.token.onCancellationRequested(() => r({ provider, links: [] }));
                    const links = (await provider.provideTerminalLinks(context, cancellationSource.token)) || [];
                    if (!cancellationSource.token.isCancellationRequested) {
                        r({ provider, links });
                    }
                }));
            }
            const provideResults = await Promise.all(promises);
            if (cancellationSource.token.isCancellationRequested) {
                return [];
            }
            const cacheLinkMap = new Map();
            for (const provideResult of provideResults) {
                if (provideResult && provideResult.links.length > 0) {
                    result.push(...provideResult.links.map(providerLink => {
                        const link = {
                            id: nextLinkId++,
                            startIndex: providerLink.startIndex,
                            length: providerLink.length,
                            label: providerLink.tooltip
                        };
                        cacheLinkMap.set(link.id, {
                            provider: provideResult.provider,
                            link: providerLink
                        });
                        return link;
                    }));
                }
            }
            this._terminalLinkCache.set(terminalId, cacheLinkMap);
            return result;
        }
        $activateLink(terminalId, linkId) {
            const cachedLink = this._terminalLinkCache.get(terminalId)?.get(linkId);
            if (!cachedLink) {
                return;
            }
            cachedLink.provider.handleTerminalLink(cachedLink.link);
        }
        _onProcessExit(id, exitCode) {
            this._bufferer.stopBuffering(id);
            // Remove process reference
            this._terminalProcesses.delete(id);
            delete this._extensionTerminalAwaitingStart[id];
            // Clean up process disposables
            const processDiposable = this._terminalProcessDisposables[id];
            if (processDiposable) {
                processDiposable.dispose();
                delete this._terminalProcessDisposables[id];
            }
            // Send exit event to main side
            this._proxy.$sendProcessExit(id, exitCode);
        }
        _getTerminalById(id) {
            return this._getTerminalObjectById(this._terminals, id);
        }
        _getTerminalObjectById(array, id) {
            const index = this._getTerminalObjectIndexById(array, id);
            return index !== null ? array[index] : null;
        }
        _getTerminalObjectIndexById(array, id) {
            const index = array.findIndex(item => {
                return item._id === id;
            });
            if (index === -1) {
                return null;
            }
            return index;
        }
        getEnvironmentVariableCollection(extension) {
            let collection = this._environmentVariableCollections.get(extension.identifier.value);
            if (!collection) {
                collection = new UnifiedEnvironmentVariableCollection();
                this._setEnvironmentVariableCollection(extension.identifier.value, collection);
            }
            return collection.getScopedEnvironmentVariableCollection(undefined);
        }
        _syncEnvironmentVariableCollection(extensionIdentifier, collection) {
            const serialized = (0, environmentVariableShared_1.serializeEnvironmentVariableCollection)(collection.map);
            const serializedDescription = (0, environmentVariableShared_1.serializeEnvironmentDescriptionMap)(collection.descriptionMap);
            this._proxy.$setEnvironmentVariableCollection(extensionIdentifier, collection.persistent, serialized.length === 0 ? undefined : serialized, serializedDescription);
        }
        $initEnvironmentVariableCollections(collections) {
            collections.forEach(entry => {
                const extensionIdentifier = entry[0];
                const collection = new UnifiedEnvironmentVariableCollection(entry[1]);
                this._setEnvironmentVariableCollection(extensionIdentifier, collection);
            });
        }
        $acceptDefaultProfile(profile, automationProfile) {
            const oldProfile = this._defaultProfile;
            this._defaultProfile = profile;
            this._defaultAutomationProfile = automationProfile;
            if (oldProfile?.path !== profile.path) {
                this._onDidChangeShell.fire(profile.path);
            }
        }
        _setEnvironmentVariableCollection(extensionIdentifier, collection) {
            this._environmentVariableCollections.set(extensionIdentifier, collection);
            collection.onDidChangeCollection(() => {
                // When any collection value changes send this immediately, this is done to ensure
                // following calls to createTerminal will be created with the new environment. It will
                // result in more noise by sending multiple updates when called but collections are
                // expected to be small.
                this._syncEnvironmentVariableCollection(extensionIdentifier, collection);
            });
        }
    };
    exports.BaseExtHostTerminalService = BaseExtHostTerminalService;
    exports.BaseExtHostTerminalService = BaseExtHostTerminalService = __decorate([
        __param(1, extHostCommands_1.IExtHostCommands),
        __param(2, extHostRpcService_1.IExtHostRpcService)
    ], BaseExtHostTerminalService);
    /**
     * Unified environment variable collection carrying information for all scopes, for a specific extension.
     */
    class UnifiedEnvironmentVariableCollection {
        get persistent() { return this._persistent; }
        set persistent(value) {
            this._persistent = value;
            this._onDidChangeCollection.fire();
        }
        get onDidChangeCollection() { return this._onDidChangeCollection && this._onDidChangeCollection.event; }
        constructor(serialized) {
            this.map = new Map();
            this.scopedCollections = new Map();
            this.descriptionMap = new Map();
            this._persistent = true;
            this._onDidChangeCollection = new event_1.Emitter();
            this.map = new Map(serialized);
        }
        getScopedEnvironmentVariableCollection(scope) {
            const scopedCollectionKey = this.getScopeKey(scope);
            let scopedCollection = this.scopedCollections.get(scopedCollectionKey);
            if (!scopedCollection) {
                scopedCollection = new ScopedEnvironmentVariableCollection(this, scope);
                this.scopedCollections.set(scopedCollectionKey, scopedCollection);
                scopedCollection.onDidChangeCollection(() => this._onDidChangeCollection.fire());
            }
            return scopedCollection;
        }
        replace(variable, value, options, scope) {
            this._setIfDiffers(variable, { value, type: extHostTypes_1.EnvironmentVariableMutatorType.Replace, options: options ?? { applyAtProcessCreation: true }, scope });
        }
        append(variable, value, options, scope) {
            this._setIfDiffers(variable, { value, type: extHostTypes_1.EnvironmentVariableMutatorType.Append, options: options ?? { applyAtProcessCreation: true }, scope });
        }
        prepend(variable, value, options, scope) {
            this._setIfDiffers(variable, { value, type: extHostTypes_1.EnvironmentVariableMutatorType.Prepend, options: options ?? { applyAtProcessCreation: true }, scope });
        }
        _setIfDiffers(variable, mutator) {
            if (mutator.options && mutator.options.applyAtProcessCreation === false && !mutator.options.applyAtShellIntegration) {
                throw new Error('EnvironmentVariableMutatorOptions must apply at either process creation or shell integration');
            }
            const key = this.getKey(variable, mutator.scope);
            const current = this.map.get(key);
            const newOptions = mutator.options ? {
                applyAtProcessCreation: mutator.options.applyAtProcessCreation ?? false,
                applyAtShellIntegration: mutator.options.applyAtShellIntegration ?? false,
            } : {
                applyAtProcessCreation: true
            };
            if (!current ||
                current.value !== mutator.value ||
                current.type !== mutator.type ||
                current.options?.applyAtProcessCreation !== newOptions.applyAtProcessCreation ||
                current.options?.applyAtShellIntegration !== newOptions.applyAtShellIntegration ||
                current.scope?.workspaceFolder?.index !== mutator.scope?.workspaceFolder?.index) {
                const key = this.getKey(variable, mutator.scope);
                const value = {
                    variable,
                    ...mutator,
                    options: newOptions
                };
                this.map.set(key, value);
                this._onDidChangeCollection.fire();
            }
        }
        get(variable, scope) {
            const key = this.getKey(variable, scope);
            const value = this.map.get(key);
            // TODO: Set options to defaults if needed
            return value ? convertMutator(value) : undefined;
        }
        getKey(variable, scope) {
            const scopeKey = this.getScopeKey(scope);
            return scopeKey.length ? `${variable}:::${scopeKey}` : variable;
        }
        getScopeKey(scope) {
            return this.getWorkspaceKey(scope?.workspaceFolder) ?? '';
        }
        getWorkspaceKey(workspaceFolder) {
            return workspaceFolder ? workspaceFolder.uri.toString() : undefined;
        }
        getVariableMap(scope) {
            const map = new Map();
            for (const [_, value] of this.map) {
                if (this.getScopeKey(value.scope) === this.getScopeKey(scope)) {
                    map.set(value.variable, convertMutator(value));
                }
            }
            return map;
        }
        delete(variable, scope) {
            const key = this.getKey(variable, scope);
            this.map.delete(key);
            this._onDidChangeCollection.fire();
        }
        clear(scope) {
            if (scope?.workspaceFolder) {
                for (const [key, mutator] of this.map) {
                    if (mutator.scope?.workspaceFolder?.index === scope.workspaceFolder.index) {
                        this.map.delete(key);
                    }
                }
                this.clearDescription(scope);
            }
            else {
                this.map.clear();
                this.descriptionMap.clear();
            }
            this._onDidChangeCollection.fire();
        }
        setDescription(description, scope) {
            const key = this.getScopeKey(scope);
            const current = this.descriptionMap.get(key);
            if (!current || current.description !== description) {
                let descriptionStr;
                if (typeof description === 'string') {
                    descriptionStr = description;
                }
                else {
                    // Only take the description before the first `\n\n`, so that the description doesn't mess up the UI
                    descriptionStr = description?.value.split('\n\n')[0];
                }
                const value = { description: descriptionStr, scope };
                this.descriptionMap.set(key, value);
                this._onDidChangeCollection.fire();
            }
        }
        getDescription(scope) {
            const key = this.getScopeKey(scope);
            return this.descriptionMap.get(key)?.description;
        }
        clearDescription(scope) {
            const key = this.getScopeKey(scope);
            this.descriptionMap.delete(key);
        }
    }
    class ScopedEnvironmentVariableCollection {
        get persistent() { return this.collection.persistent; }
        set persistent(value) {
            this.collection.persistent = value;
        }
        get onDidChangeCollection() { return this._onDidChangeCollection && this._onDidChangeCollection.event; }
        constructor(collection, scope) {
            this.collection = collection;
            this.scope = scope;
            this._onDidChangeCollection = new event_1.Emitter();
        }
        getScoped(scope) {
            return this.collection.getScopedEnvironmentVariableCollection(scope);
        }
        replace(variable, value, options) {
            this.collection.replace(variable, value, options, this.scope);
        }
        append(variable, value, options) {
            this.collection.append(variable, value, options, this.scope);
        }
        prepend(variable, value, options) {
            this.collection.prepend(variable, value, options, this.scope);
        }
        get(variable) {
            return this.collection.get(variable, this.scope);
        }
        forEach(callback, thisArg) {
            this.collection.getVariableMap(this.scope).forEach((value, variable) => callback.call(thisArg, variable, value, this), this.scope);
        }
        [Symbol.iterator]() {
            return this.collection.getVariableMap(this.scope).entries();
        }
        delete(variable) {
            this.collection.delete(variable, this.scope);
            this._onDidChangeCollection.fire(undefined);
        }
        clear() {
            this.collection.clear(this.scope);
        }
        set description(description) {
            this.collection.setDescription(description, this.scope);
        }
        get description() {
            return this.collection.getDescription(this.scope);
        }
    }
    let WorkerExtHostTerminalService = class WorkerExtHostTerminalService extends BaseExtHostTerminalService {
        constructor(extHostCommands, extHostRpc) {
            super(false, extHostCommands, extHostRpc);
        }
        createTerminal(name, shellPath, shellArgs) {
            throw new errors_1.NotSupportedError();
        }
        createTerminalFromOptions(options, internalOptions) {
            throw new errors_1.NotSupportedError();
        }
    };
    exports.WorkerExtHostTerminalService = WorkerExtHostTerminalService;
    exports.WorkerExtHostTerminalService = WorkerExtHostTerminalService = __decorate([
        __param(0, extHostCommands_1.IExtHostCommands),
        __param(1, extHostRpcService_1.IExtHostRpcService)
    ], WorkerExtHostTerminalService);
    function asTerminalIcon(iconPath) {
        if (!iconPath || typeof iconPath === 'string') {
            return undefined;
        }
        if (!('id' in iconPath)) {
            return iconPath;
        }
        return {
            id: iconPath.id,
            color: iconPath.color
        };
    }
    function asTerminalColor(color) {
        return themables_1.ThemeColor.isThemeColor(color) ? color : undefined;
    }
    function convertMutator(mutator) {
        const newMutator = { ...mutator };
        delete newMutator.scope;
        newMutator.options = newMutator.options ?? undefined;
        delete newMutator.variable;
        return newMutator;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRlcm1pbmFsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFRlcm1pbmFsU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1RW5GLFFBQUEsdUJBQXVCLEdBQUcsSUFBQSwrQkFBZSxFQUEwQix5QkFBeUIsQ0FBQyxDQUFDO0lBRTNHLE1BQWEsZUFBZTtRQWMzQixZQUNTLE1BQXNDLEVBQ3ZDLEdBQThCLEVBQ3BCLGdCQUEwRSxFQUNuRixLQUFjO1lBSGQsV0FBTSxHQUFOLE1BQU0sQ0FBZ0M7WUFDdkMsUUFBRyxHQUFILEdBQUcsQ0FBMkI7WUFDcEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUEwRDtZQUNuRixVQUFLLEdBQUwsS0FBSyxDQUFTO1lBakJmLGNBQVMsR0FBWSxLQUFLLENBQUM7WUFNM0IsV0FBTSxHQUF5QixFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxDQUFDO1lBRzVELFdBQU0sR0FBWSxLQUFLLENBQUM7WUFVOUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFdEYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUc7Z0JBQ1osSUFBSSxJQUFJO29CQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsSUFBSSxTQUFTO29CQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcs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
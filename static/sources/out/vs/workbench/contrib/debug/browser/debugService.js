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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/severity", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/browser/editorBrowser", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/debug/common/extensionHostDebug", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/debug/browser/debugAdapterManager", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugConfigurationManager", "vs/workbench/contrib/debug/browser/debugMemory", "vs/workbench/contrib/debug/browser/debugSession", "vs/workbench/contrib/debug/browser/debugTaskRunner", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugCompoundRoot", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/debugStorage", "vs/workbench/contrib/debug/common/debugTelemetry", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/contrib/debug/common/debugViewModel", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/contrib/files/common/files", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, aria, actions_1, arrays_1, async_1, cancellation_1, errorMessage_1, errors, event_1, lifecycle_1, objects_1, severity_1, uri_1, uuid_1, editorBrowser_1, nls, commands_1, configuration_1, contextkey_1, extensionHostDebug_1, dialogs_1, files_1, instantiation_1, notification_1, quickInput_1, uriIdentity_1, workspace_1, workspaceTrust_1, views_1, viewsService_1, debugAdapterManager_1, debugCommands_1, debugConfigurationManager_1, debugMemory_1, debugSession_1, debugTaskRunner_1, debug_1, debugCompoundRoot_1, debugModel_1, debugSource_1, debugStorage_1, debugTelemetry_1, debugUtils_1, debugViewModel_1, disassemblyViewInput_1, files_2, activity_1, editorService_1, extensions_1, layoutService_1, lifecycle_2, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getStackFrameThreadAndSessionToFocus = exports.DebugService = void 0;
    let DebugService = class DebugService {
        constructor(editorService, paneCompositeService, viewsService, viewDescriptorService, notificationService, dialogService, layoutService, contextService, contextKeyService, lifecycleService, instantiationService, extensionService, fileService, configurationService, extensionHostDebugService, activityService, commandService, quickInputService, workspaceTrustRequestService, uriIdentityService) {
            this.editorService = editorService;
            this.paneCompositeService = paneCompositeService;
            this.viewsService = viewsService;
            this.viewDescriptorService = viewDescriptorService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.layoutService = layoutService;
            this.contextService = contextService;
            this.contextKeyService = contextKeyService;
            this.lifecycleService = lifecycleService;
            this.instantiationService = instantiationService;
            this.extensionService = extensionService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.extensionHostDebugService = extensionHostDebugService;
            this.activityService = activityService;
            this.commandService = commandService;
            this.quickInputService = quickInputService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.uriIdentityService = uriIdentityService;
            this.restartingSessions = new Set();
            this.disposables = new lifecycle_1.DisposableStore();
            this.initializing = false;
            this.sessionCancellationTokens = new Map();
            this.haveDoneLazySetup = false;
            this.breakpointsToSendOnResourceSaved = new Set();
            this._onDidChangeState = new event_1.Emitter();
            this._onDidNewSession = new event_1.Emitter();
            this._onWillNewSession = new event_1.Emitter();
            this._onDidEndSession = new event_1.Emitter();
            this.adapterManager = this.instantiationService.createInstance(debugAdapterManager_1.AdapterManager, { onDidNewSession: this.onDidNewSession });
            this.disposables.add(this.adapterManager);
            this.configurationManager = this.instantiationService.createInstance(debugConfigurationManager_1.ConfigurationManager, this.adapterManager);
            this.disposables.add(this.configurationManager);
            this.debugStorage = this.disposables.add(this.instantiationService.createInstance(debugStorage_1.DebugStorage));
            this.chosenEnvironments = this.debugStorage.loadChosenEnvironments();
            this.model = this.instantiationService.createInstance(debugModel_1.DebugModel, this.debugStorage);
            this.telemetry = this.instantiationService.createInstance(debugTelemetry_1.DebugTelemetry, this.model);
            this.viewModel = new debugViewModel_1.ViewModel(contextKeyService);
            this.taskRunner = this.instantiationService.createInstance(debugTaskRunner_1.DebugTaskRunner);
            this.disposables.add(this.fileService.onDidFilesChange(e => this.onFileChanges(e)));
            this.disposables.add(this.lifecycleService.onWillShutdown(this.dispose, this));
            this.disposables.add(this.extensionHostDebugService.onAttachSession(event => {
                const session = this.model.getSession(event.sessionId, true);
                if (session) {
                    // EH was started in debug mode -> attach to it
                    session.configuration.request = 'attach';
                    session.configuration.port = event.port;
                    session.setSubId(event.subId);
                    this.launchOrAttachToSession(session);
                }
            }));
            this.disposables.add(this.extensionHostDebugService.onTerminateSession(event => {
                const session = this.model.getSession(event.sessionId);
                if (session && session.subId === event.subId) {
                    session.disconnect();
                }
            }));
            this.disposables.add(this.viewModel.onDidFocusStackFrame(() => {
                this.onStateChange();
            }));
            this.disposables.add(this.viewModel.onDidFocusSession((session) => {
                this.onStateChange();
                if (session) {
                    this.setExceptionBreakpointFallbackSession(session.getId());
                }
            }));
            this.disposables.add(event_1.Event.any(this.adapterManager.onDidRegisterDebugger, this.configurationManager.onDidSelectConfiguration)(() => {
                const debugUxValue = (this.state !== 0 /* State.Inactive */ || (this.configurationManager.getAllConfigurations().length > 0 && this.adapterManager.hasEnabledDebuggers())) ? 'default' : 'simple';
                this.debugUx.set(debugUxValue);
                this.debugStorage.storeDebugUxState(debugUxValue);
            }));
            this.disposables.add(this.model.onDidChangeCallStack(() => {
                const numberOfSessions = this.model.getSessions().filter(s => !s.parentSession).length;
                this.activity?.dispose();
                if (numberOfSessions > 0) {
                    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(debug_1.CALLSTACK_VIEW_ID);
                    if (viewContainer) {
                        this.activity = this.activityService.showViewContainerActivity(viewContainer.id, { badge: new activity_1.NumberBadge(numberOfSessions, n => n === 1 ? nls.localize('1activeSession', "1 active session") : nls.localize('nActiveSessions', "{0} active sessions", n)) });
                    }
                }
            }));
            this.disposables.add(editorService.onDidActiveEditorChange(() => {
                this.contextKeyService.bufferChangeEvents(() => {
                    if (editorService.activeEditor === disassemblyViewInput_1.DisassemblyViewInput.instance) {
                        this.disassemblyViewFocus.set(true);
                    }
                    else {
                        // This key can be initialized a tick after this event is fired
                        this.disassemblyViewFocus?.reset();
                    }
                });
            }));
            this.disposables.add(this.lifecycleService.onBeforeShutdown(() => {
                for (const editor of editorService.editors) {
                    // Editors will not be valid on window reload, so close them.
                    if (editor.resource?.scheme === debug_1.DEBUG_MEMORY_SCHEME) {
                        editor.dispose();
                    }
                }
            }));
            this.initContextKeys(contextKeyService);
        }
        initContextKeys(contextKeyService) {
            queueMicrotask(() => {
                contextKeyService.bufferChangeEvents(() => {
                    this.debugType = debug_1.CONTEXT_DEBUG_TYPE.bindTo(contextKeyService);
                    this.debugState = debug_1.CONTEXT_DEBUG_STATE.bindTo(contextKeyService);
                    this.hasDebugged = debug_1.CONTEXT_HAS_DEBUGGED.bindTo(contextKeyService);
                    this.inDebugMode = debug_1.CONTEXT_IN_DEBUG_MODE.bindTo(contextKeyService);
                    this.debugUx = debug_1.CONTEXT_DEBUG_UX.bindTo(contextKeyService);
                    this.debugUx.set(this.debugStorage.loadDebugUxState());
                    this.breakpointsExist = debug_1.CONTEXT_BREAKPOINTS_EXIST.bindTo(contextKeyService);
                    // Need to set disassemblyViewFocus here to make it in the same context as the debug event handlers
                    this.disassemblyViewFocus = debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS.bindTo(contextKeyService);
                });
                const setBreakpointsExistContext = () => this.breakpointsExist.set(!!(this.model.getBreakpoints().length || this.model.getDataBreakpoints().length || this.model.getFunctionBreakpoints().length));
                setBreakpointsExistContext();
                this.disposables.add(this.model.onDidChangeBreakpoints(() => setBreakpointsExistContext()));
            });
        }
        getModel() {
            return this.model;
        }
        getViewModel() {
            return this.viewModel;
        }
        getConfigurationManager() {
            return this.configurationManager;
        }
        getAdapterManager() {
            return this.adapterManager;
        }
        sourceIsNotAvailable(uri) {
            this.model.sourceIsNotAvailable(uri);
        }
        dispose() {
            this.disposables.dispose();
        }
        //---- state management
        get state() {
            const focusedSession = this.viewModel.focusedSession;
            if (focusedSession) {
                return focusedSession.state;
            }
            return this.initializing ? 1 /* State.Initializing */ : 0 /* State.Inactive */;
        }
        get initializingOptions() {
            return this._initializingOptions;
        }
        startInitializingState(options) {
            if (!this.initializing) {
                this.initializing = true;
                this._initializingOptions = options;
                this.onStateChange();
            }
        }
        endInitializingState() {
            if (this.initializing) {
                this.initializing = false;
                this._initializingOptions = undefined;
                this.onStateChange();
            }
        }
        cancelTokens(id) {
            if (id) {
                const token = this.sessionCancellationTokens.get(id);
                if (token) {
                    token.cancel();
                    this.sessionCancellationTokens.delete(id);
                }
            }
            else {
                this.sessionCancellationTokens.forEach(t => t.cancel());
                this.sessionCancellationTokens.clear();
            }
        }
        onStateChange() {
            const state = this.state;
            if (this.previousState !== state) {
                this.contextKeyService.bufferChangeEvents(() => {
                    this.debugState.set((0, debug_1.getStateLabel)(state));
                    this.inDebugMode.set(state !== 0 /* State.Inactive */);
                    // Only show the simple ux if debug is not yet started and if no launch.json exists
                    const debugUxValue = ((state !== 0 /* State.Inactive */ && state !== 1 /* State.Initializing */) || (this.adapterManager.hasEnabledDebuggers() && this.configurationManager.selectedConfiguration.name)) ? 'default' : 'simple';
                    this.debugUx.set(debugUxValue);
                    this.debugStorage.storeDebugUxState(debugUxValue);
                });
                this.previousState = state;
                this._onDidChangeState.fire(state);
            }
        }
        get onDidChangeState() {
            return this._onDidChangeState.event;
        }
        get onDidNewSession() {
            return this._onDidNewSession.event;
        }
        get onWillNewSession() {
            return this._onWillNewSession.event;
        }
        get onDidEndSession() {
            return this._onDidEndSession.event;
        }
        lazySetup() {
            if (!this.haveDoneLazySetup) {
                // Registering fs providers is slow
                // https://github.com/microsoft/vscode/issues/159886
                this.disposables.add(this.fileService.registerProvider(debug_1.DEBUG_MEMORY_SCHEME, new debugMemory_1.DebugMemoryFileSystemProvider(this)));
                this.haveDoneLazySetup = true;
            }
        }
        //---- life cycle management
        /**
         * main entry point
         * properly manages compounds, checks for errors and handles the initializing state.
         */
        async startDebugging(launch, configOrName, options, saveBeforeStart = !options?.parentSession) {
            const message = options && options.noDebug ? nls.localize('runTrust', "Running executes build tasks and program code from your workspace.") : nls.localize('debugTrust', "Debugging executes build tasks and program code from your workspace.");
            const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({ message });
            if (!trust) {
                return false;
            }
            this.lazySetup();
            this.startInitializingState(options);
            this.hasDebugged.set(true);
            try {
                // make sure to save all files and that the configuration is up to date
                await this.extensionService.activateByEvent('onDebug');
                if (saveBeforeStart) {
                    await (0, debugUtils_1.saveAllBeforeDebugStart)(this.configurationService, this.editorService);
                }
                await this.extensionService.whenInstalledExtensionsRegistered();
                let config;
                let compound;
                if (!configOrName) {
                    configOrName = this.configurationManager.selectedConfiguration.name;
                }
                if (typeof configOrName === 'string' && launch) {
                    config = launch.getConfiguration(configOrName);
                    compound = launch.getCompound(configOrName);
                }
                else if (typeof configOrName !== 'string') {
                    config = configOrName;
                }
                if (compound) {
                    // we are starting a compound debug, first do some error checking and than start each configuration in the compound
                    if (!compound.configurations) {
                        throw new Error(nls.localize({ key: 'compoundMustHaveConfigurations', comment: ['compound indicates a "compounds" configuration item', '"configurations" is an attribute and should not be localized'] }, "Compound must have \"configurations\" attribute set in order to start multiple configurations."));
                    }
                    if (compound.preLaunchTask) {
                        const taskResult = await this.taskRunner.runTaskAndCheckErrors(launch?.workspace || this.contextService.getWorkspace(), compound.preLaunchTask);
                        if (taskResult === 0 /* TaskRunResult.Failure */) {
                            this.endInitializingState();
                            return false;
                        }
                    }
                    if (compound.stopAll) {
                        options = { ...options, compoundRoot: new debugCompoundRoot_1.DebugCompoundRoot() };
                    }
                    const values = await Promise.all(compound.configurations.map(configData => {
                        const name = typeof configData === 'string' ? configData : configData.name;
                        if (name === compound.name) {
                            return Promise.resolve(false);
                        }
                        let launchForName;
                        if (typeof configData === 'string') {
                            const launchesContainingName = this.configurationManager.getLaunches().filter(l => !!l.getConfiguration(name));
                            if (launchesContainingName.length === 1) {
                                launchForName = launchesContainingName[0];
                            }
                            else if (launch && launchesContainingName.length > 1 && launchesContainingName.indexOf(launch) >= 0) {
                                // If there are multiple launches containing the configuration give priority to the configuration in the current launch
                                launchForName = launch;
                            }
                            else {
                                throw new Error(launchesContainingName.length === 0 ? nls.localize('noConfigurationNameInWorkspace', "Could not find launch configuration '{0}' in the workspace.", name)
                                    : nls.localize('multipleConfigurationNamesInWorkspace', "There are multiple launch configurations '{0}' in the workspace. Use folder name to qualify the configuration.", name));
                            }
                        }
                        else if (configData.folder) {
                            const launchesMatchingConfigData = this.configurationManager.getLaunches().filter(l => l.workspace && l.workspace.name === configData.folder && !!l.getConfiguration(configData.name));
                            if (launchesMatchingConfigData.length === 1) {
                                launchForName = launchesMatchingConfigData[0];
                            }
                            else {
                                throw new Error(nls.localize('noFolderWithName', "Can not find folder with name '{0}' for configuration '{1}' in compound '{2}'.", configData.folder, configData.name, compound.name));
                            }
                        }
                        return this.createSession(launchForName, launchForName.getConfiguration(name), options);
                    }));
                    const result = values.every(success => !!success); // Compound launch is a success only if each configuration launched successfully
                    this.endInitializingState();
                    return result;
                }
                if (configOrName && !config) {
                    const message = !!launch ? nls.localize('configMissing', "Configuration '{0}' is missing in 'launch.json'.", typeof configOrName === 'string' ? configOrName : configOrName.name) :
                        nls.localize('launchJsonDoesNotExist', "'launch.json' does not exist for passed workspace folder.");
                    throw new Error(message);
                }
                const result = await this.createSession(launch, config, options);
                this.endInitializingState();
                return result;
            }
            catch (err) {
                // make sure to get out of initializing state, and propagate the result
                this.notificationService.error(err);
                this.endInitializingState();
                return Promise.reject(err);
            }
        }
        /**
         * gets the debugger for the type, resolves configurations by providers, substitutes variables and runs prelaunch tasks
         */
        async createSession(launch, config, options) {
            // We keep the debug type in a separate variable 'type' so that a no-folder config has no attributes.
            // Storing the type in the config would break extensions that assume that the no-folder case is indicated by an empty config.
            let type;
            if (config) {
                type = config.type;
            }
            else {
                // a no-folder workspace has no launch.config
                config = Object.create(null);
            }
            if (options && options.noDebug) {
                config.noDebug = true;
            }
            else if (options && typeof options.noDebug === 'undefined' && options.parentSession && options.parentSession.configuration.noDebug) {
                config.noDebug = true;
            }
            const unresolvedConfig = (0, objects_1.deepClone)(config);
            let guess;
            let activeEditor;
            if (!type) {
                activeEditor = this.editorService.activeEditor;
                if (activeEditor && activeEditor.resource) {
                    type = this.chosenEnvironments[activeEditor.resource.toString()];
                }
                if (!type) {
                    guess = await this.adapterManager.guessDebugger(false);
                    if (guess) {
                        type = guess.type;
                    }
                }
            }
            const initCancellationToken = new cancellation_1.CancellationTokenSource();
            const sessionId = (0, uuid_1.generateUuid)();
            this.sessionCancellationTokens.set(sessionId, initCancellationToken);
            const configByProviders = await this.configurationManager.resolveConfigurationByProviders(launch && launch.workspace ? launch.workspace.uri : undefined, type, config, initCancellationToken.token);
            // a falsy config indicates an aborted launch
            if (configByProviders && configByProviders.type) {
                try {
                    let resolvedConfig = await this.substituteVariables(launch, configByProviders);
                    if (!resolvedConfig) {
                        // User cancelled resolving of interactive variables, silently return
                        return false;
                    }
                    if (initCancellationToken.token.isCancellationRequested) {
                        // User cancelled, silently return
                        return false;
                    }
                    const workspace = launch?.workspace || this.contextService.getWorkspace();
                    const taskResult = await this.taskRunner.runTaskAndCheckErrors(workspace, resolvedConfig.preLaunchTask);
                    if (taskResult === 0 /* TaskRunResult.Failure */) {
                        return false;
                    }
                    const cfg = await this.configurationManager.resolveDebugConfigurationWithSubstitutedVariables(launch && launch.workspace ? launch.workspace.uri : undefined, resolvedConfig.type, resolvedConfig, initCancellationToken.token);
                    if (!cfg) {
                        if (launch && type && cfg === null && !initCancellationToken.token.isCancellationRequested) { // show launch.json only for "config" being "null".
                            await launch.openConfigFile({ preserveFocus: true, type }, initCancellationToken.token);
                        }
                        return false;
                    }
                    resolvedConfig = cfg;
                    const dbg = this.adapterManager.getDebugger(resolvedConfig.type);
                    if (!dbg || (configByProviders.request !== 'attach' && configByProviders.request !== 'launch')) {
                        let message;
                        if (configByProviders.request !== 'attach' && configByProviders.request !== 'launch') {
                            message = configByProviders.request ? nls.localize('debugRequestNotSupported', "Attribute '{0}' has an unsupported value '{1}' in the chosen debug configuration.", 'request', configByProviders.request)
                                : nls.localize('debugRequesMissing', "Attribute '{0}' is missing from the chosen debug configuration.", 'request');
                        }
                        else {
                            message = resolvedConfig.type ? nls.localize('debugTypeNotSupported', "Configured debug type '{0}' is not supported.", resolvedConfig.type) :
                                nls.localize('debugTypeMissing', "Missing property 'type' for the chosen launch configuration.");
                        }
                        const actionList = [];
                        actionList.push(new actions_1.Action('installAdditionalDebuggers', nls.localize({ key: 'installAdditionalDebuggers', comment: ['Placeholder is the debug type, so for example "node", "python"'] }, "Install {0} Extension", resolvedConfig.type), undefined, true, async () => this.commandService.executeCommand('debug.installAdditionalDebuggers', resolvedConfig?.type)));
                        await this.showError(message, actionList);
                        return false;
                    }
                    if (!dbg.enabled) {
                        await this.showError((0, debug_1.debuggerDisabledMessage)(dbg.type), []);
                        return false;
                    }
                    const result = await this.doCreateSession(sessionId, launch?.workspace, { resolved: resolvedConfig, unresolved: unresolvedConfig }, options);
                    if (result && guess && activeEditor && activeEditor.resource) {
                        // Remeber user choice of environment per active editor to make starting debugging smoother #124770
                        this.chosenEnvironments[activeEditor.resource.toString()] = guess.type;
                        this.debugStorage.storeChosenEnvironments(this.chosenEnvironments);
                    }
                    return result;
                }
                catch (err) {
                    if (err && err.message) {
                        await this.showError(err.message);
                    }
                    else if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                        await this.showError(nls.localize('noFolderWorkspaceDebugError', "The active file can not be debugged. Make sure it is saved and that you have a debug extension installed for that file type."));
                    }
                    if (launch && !initCancellationToken.token.isCancellationRequested) {
                        await launch.openConfigFile({ preserveFocus: true }, initCancellationToken.token);
                    }
                    return false;
                }
            }
            if (launch && type && configByProviders === null && !initCancellationToken.token.isCancellationRequested) { // show launch.json only for "config" being "null".
                await launch.openConfigFile({ preserveFocus: true, type }, initCancellationToken.token);
            }
            return false;
        }
        /**
         * instantiates the new session, initializes the session, registers session listeners and reports telemetry
         */
        async doCreateSession(sessionId, root, configuration, options) {
            const session = this.instantiationService.createInstance(debugSession_1.DebugSession, sessionId, configuration, root, this.model, options);
            if (options?.startedByUser && this.model.getSessions().some(s => s.getLabel() === session.getLabel()) && configuration.resolved.suppressMultipleSessionWarning !== true) {
                // There is already a session with the same name, prompt user #127721
                const result = await this.dialogService.confirm({ message: nls.localize('multipleSession', "'{0}' is already running. Do you want to start another instance?", session.getLabel()) });
                if (!result.confirmed) {
                    return false;
                }
            }
            this.model.addSession(session);
            // register listeners as the very first thing!
            this.registerSessionListeners(session);
            // since the Session is now properly registered under its ID and hooked, we can announce it
            // this event doesn't go to extensions
            this._onWillNewSession.fire(session);
            const openDebug = this.configurationService.getValue('debug').openDebug;
            // Open debug viewlet based on the visibility of the side bar and openDebug setting. Do not open for 'run without debug'
            if (!configuration.resolved.noDebug && (openDebug === 'openOnSessionStart' || (openDebug !== 'neverOpen' && this.viewModel.firstSessionStart)) && !session.suppressDebugView) {
                await this.paneCompositeService.openPaneComposite(debug_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
            }
            try {
                await this.launchOrAttachToSession(session);
                const internalConsoleOptions = session.configuration.internalConsoleOptions || this.configurationService.getValue('debug').internalConsoleOptions;
                if (internalConsoleOptions === 'openOnSessionStart' || (this.viewModel.firstSessionStart && internalConsoleOptions === 'openOnFirstSessionStart')) {
                    this.viewsService.openView(debug_1.REPL_VIEW_ID, false);
                }
                this.viewModel.firstSessionStart = false;
                const showSubSessions = this.configurationService.getValue('debug').showSubSessionsInToolBar;
                const sessions = this.model.getSessions();
                const shownSessions = showSubSessions ? sessions : sessions.filter(s => !s.parentSession);
                if (shownSessions.length > 1) {
                    this.viewModel.setMultiSessionView(true);
                }
                // since the initialized response has arrived announce the new Session (including extensions)
                this._onDidNewSession.fire(session);
                return true;
            }
            catch (error) {
                if (errors.isCancellationError(error)) {
                    // don't show 'canceled' error messages to the user #7906
                    return false;
                }
                // Show the repl if some error got logged there #5870
                if (session && session.getReplElements().length > 0) {
                    this.viewsService.openView(debug_1.REPL_VIEW_ID, false);
                }
                if (session.configuration && session.configuration.request === 'attach' && session.configuration.__autoAttach) {
                    // ignore attach timeouts in auto attach mode
                    return false;
                }
                const errorMessage = error instanceof Error ? error.message : error;
                if (error.showUser !== false) {
                    // Only show the error when showUser is either not defined, or is true #128484
                    await this.showError(errorMessage, (0, errorMessage_1.isErrorWithActions)(error) ? error.actions : []);
                }
                return false;
            }
        }
        async launchOrAttachToSession(session, forceFocus = false) {
            const dbgr = this.adapterManager.getDebugger(session.configuration.type);
            try {
                await session.initialize(dbgr);
                await session.launchOrAttach(session.configuration);
                const launchJsonExists = !!session.root && !!this.configurationService.getValue('launch', { resource: session.root.uri });
                await this.telemetry.logDebugSessionStart(dbgr, launchJsonExists);
                if (forceFocus || !this.viewModel.focusedSession || (session.parentSession === this.viewModel.focusedSession && session.compact)) {
                    await this.focusStackFrame(undefined, undefined, session);
                }
            }
            catch (err) {
                if (this.viewModel.focusedSession === session) {
                    await this.focusStackFrame(undefined);
                }
                return Promise.reject(err);
            }
        }
        registerSessionListeners(session) {
            const listenerDisposables = new lifecycle_1.DisposableStore();
            this.disposables.add(listenerDisposables);
            const sessionRunningScheduler = listenerDisposables.add(new async_1.RunOnceScheduler(() => {
                // Do not immediatly defocus the stack frame if the session is running
                if (session.state === 3 /* State.Running */ && this.viewModel.focusedSession === session) {
                    this.viewModel.setFocus(undefined, this.viewModel.focusedThread, session, false);
                }
            }, 200));
            listenerDisposables.add(session.onDidChangeState(() => {
                if (session.state === 3 /* State.Running */ && this.viewModel.focusedSession === session) {
                    sessionRunningScheduler.schedule();
                }
                if (session === this.viewModel.focusedSession) {
                    this.onStateChange();
                }
            }));
            listenerDisposables.add(this.onDidEndSession(e => {
                if (e.session === session && !e.restart) {
                    this.disposables.delete(listenerDisposables);
                }
            }));
            listenerDisposables.add(session.onDidEndAdapter(async (adapterExitEvent) => {
                if (adapterExitEvent) {
                    if (adapterExitEvent.error) {
                        this.notificationService.error(nls.localize('debugAdapterCrash', "Debug adapter process has terminated unexpectedly ({0})", adapterExitEvent.error.message || adapterExitEvent.error.toString()));
                    }
                    this.telemetry.logDebugSessionStop(session, adapterExitEvent);
                }
                // 'Run without debugging' mode VSCode must terminate the extension host. More details: #3905
                const extensionDebugSession = (0, debugUtils_1.getExtensionHostDebugSession)(session);
                if (extensionDebugSession && extensionDebugSession.state === 3 /* State.Running */ && extensionDebugSession.configuration.noDebug) {
                    this.extensionHostDebugService.close(extensionDebugSession.getId());
                }
                if (session.configuration.postDebugTask) {
                    const root = session.root ?? this.contextService.getWorkspace();
                    try {
                        await this.taskRunner.runTask(root, session.configuration.postDebugTask);
                    }
                    catch (err) {
                        this.notificationService.error(err);
                    }
                }
                this.endInitializingState();
                this.cancelTokens(session.getId());
                if (this.configurationService.getValue('debug').closeReadonlyTabsOnEnd) {
                    const editorsToClose = this.editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */).filter(({ editor }) => {
                        if (editor.resource?.scheme === debug_1.DEBUG_SCHEME) {
                            return editor.isReadonly() && session.getId() === debugSource_1.Source.getEncodedDebugData(editor.resource).sessionId;
                        }
                        return false;
                    });
                    this.editorService.closeEditors(editorsToClose);
                }
                this._onDidEndSession.fire({ session, restart: this.restartingSessions.has(session) });
                const focusedSession = this.viewModel.focusedSession;
                if (focusedSession && focusedSession.getId() === session.getId()) {
                    const { session, thread, stackFrame } = getStackFrameThreadAndSessionToFocus(this.model, undefined, undefined, undefined, focusedSession);
                    this.viewModel.setFocus(stackFrame, thread, session, false);
                }
                if (this.model.getSessions().length === 0) {
                    this.viewModel.setMultiSessionView(false);
                    if (this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) && this.configurationService.getValue('debug').openExplorerOnEnd) {
                        this.paneCompositeService.openPaneComposite(files_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
                    }
                    // Data breakpoints that can not be persisted should be cleared when a session ends
                    const dataBreakpoints = this.model.getDataBreakpoints().filter(dbp => !dbp.canPersist);
                    dataBreakpoints.forEach(dbp => this.model.removeDataBreakpoints(dbp.getId()));
                    if (this.configurationService.getValue('debug').console.closeOnEnd) {
                        const debugConsoleContainer = this.viewDescriptorService.getViewContainerByViewId(debug_1.REPL_VIEW_ID);
                        if (debugConsoleContainer && this.viewsService.isViewContainerVisible(debugConsoleContainer.id)) {
                            this.viewsService.closeViewContainer(debugConsoleContainer.id);
                        }
                    }
                }
                this.model.removeExceptionBreakpointsForSession(session.getId());
                // session.dispose(); TODO@roblourens
            }));
        }
        async restartSession(session, restartData) {
            if (session.saveBeforeRestart) {
                await (0, debugUtils_1.saveAllBeforeDebugStart)(this.configurationService, this.editorService);
            }
            const isAutoRestart = !!restartData;
            const runTasks = async () => {
                if (isAutoRestart) {
                    // Do not run preLaunch and postDebug tasks for automatic restarts
                    return Promise.resolve(1 /* TaskRunResult.Success */);
                }
                const root = session.root || this.contextService.getWorkspace();
                await this.taskRunner.runTask(root, session.configuration.preRestartTask);
                await this.taskRunner.runTask(root, session.configuration.postDebugTask);
                const taskResult1 = await this.taskRunner.runTaskAndCheckErrors(root, session.configuration.preLaunchTask);
                if (taskResult1 !== 1 /* TaskRunResult.Success */) {
                    return taskResult1;
                }
                return this.taskRunner.runTaskAndCheckErrors(root, session.configuration.postRestartTask);
            };
            const extensionDebugSession = (0, debugUtils_1.getExtensionHostDebugSession)(session);
            if (extensionDebugSession) {
                const taskResult = await runTasks();
                if (taskResult === 1 /* TaskRunResult.Success */) {
                    this.extensionHostDebugService.reload(extensionDebugSession.getId());
                }
                return;
            }
            // Read the configuration again if a launch.json has been changed, if not just use the inmemory configuration
            let needsToSubstitute = false;
            let unresolved;
            const launch = session.root ? this.configurationManager.getLaunch(session.root.uri) : undefined;
            if (launch) {
                unresolved = launch.getConfiguration(session.configuration.name);
                if (unresolved && !(0, objects_1.equals)(unresolved, session.unresolvedConfiguration)) {
                    // Take the type from the session since the debug extension might overwrite it #21316
                    unresolved.type = session.configuration.type;
                    unresolved.noDebug = session.configuration.noDebug;
                    needsToSubstitute = true;
                }
            }
            let resolved = session.configuration;
            if (launch && needsToSubstitute && unresolved) {
                const initCancellationToken = new cancellation_1.CancellationTokenSource();
                this.sessionCancellationTokens.set(session.getId(), initCancellationToken);
                const resolvedByProviders = await this.configurationManager.resolveConfigurationByProviders(launch.workspace ? launch.workspace.uri : undefined, unresolved.type, unresolved, initCancellationToken.token);
                if (resolvedByProviders) {
                    resolved = await this.substituteVariables(launch, resolvedByProviders);
                    if (resolved && !initCancellationToken.token.isCancellationRequested) {
                        resolved = await this.configurationManager.resolveDebugConfigurationWithSubstitutedVariables(launch && launch.workspace ? launch.workspace.uri : undefined, unresolved.type, resolved, initCancellationToken.token);
                    }
                }
                else {
                    resolved = resolvedByProviders;
                }
            }
            if (resolved) {
                session.setConfiguration({ resolved, unresolved });
            }
            session.configuration.__restart = restartData;
            const doRestart = async (fn) => {
                this.restartingSessions.add(session);
                let didRestart = false;
                try {
                    didRestart = (await fn()) !== false;
                }
                catch (e) {
                    didRestart = false;
                    throw e;
                }
                finally {
                    this.restartingSessions.delete(session);
                    // we previously may have issued an onDidEndSession with restart: true,
                    // assuming the adapter exited (in `registerSessionListeners`). But the
                    // restart failed, so emit the final termination now.
                    if (!didRestart) {
                        this._onDidEndSession.fire({ session, restart: false });
                    }
                }
            };
            if (session.capabilities.supportsRestartRequest) {
                const taskResult = await runTasks();
                if (taskResult === 1 /* TaskRunResult.Success */) {
                    await doRestart(async () => {
                        await session.restart();
                        return true;
                    });
                }
                return;
            }
            const shouldFocus = !!this.viewModel.focusedSession && session.getId() === this.viewModel.focusedSession.getId();
            return doRestart(async () => {
                // If the restart is automatic  -> disconnect, otherwise -> terminate #55064
                if (isAutoRestart) {
                    await session.disconnect(true);
                }
                else {
                    await session.terminate(true);
                }
                return new Promise((c, e) => {
                    setTimeout(async () => {
                        const taskResult = await runTasks();
                        if (taskResult !== 1 /* TaskRunResult.Success */) {
                            return c(false);
                        }
                        if (!resolved) {
                            return c(false);
                        }
                        try {
                            await this.launchOrAttachToSession(session, shouldFocus);
                            this._onDidNewSession.fire(session);
                            c(true);
                        }
                        catch (error) {
                            e(error);
                        }
                    }, 300);
                });
            });
        }
        async stopSession(session, disconnect = false, suspend = false) {
            if (session) {
                return disconnect ? session.disconnect(undefined, suspend) : session.terminate();
            }
            const sessions = this.model.getSessions();
            if (sessions.length === 0) {
                this.taskRunner.cancel();
                // User might have cancelled starting of a debug session, and in some cases the quick pick is left open
                await this.quickInputService.cancel();
                this.endInitializingState();
                this.cancelTokens(undefined);
            }
            return Promise.all(sessions.map(s => disconnect ? s.disconnect(undefined, suspend) : s.terminate()));
        }
        async substituteVariables(launch, config) {
            const dbg = this.adapterManager.getDebugger(config.type);
            if (dbg) {
                let folder = undefined;
                if (launch && launch.workspace) {
                    folder = launch.workspace;
                }
                else {
                    const folders = this.contextService.getWorkspace().folders;
                    if (folders.length === 1) {
                        folder = folders[0];
                    }
                }
                try {
                    return await dbg.substituteVariables(folder, config);
                }
                catch (err) {
                    this.showError(err.message, undefined, !!launch?.getConfiguration(config.name));
                    return undefined; // bail out
                }
            }
            return Promise.resolve(config);
        }
        async showError(message, errorActions = [], promptLaunchJson = true) {
            const configureAction = new actions_1.Action(debugCommands_1.DEBUG_CONFIGURE_COMMAND_ID, debugCommands_1.DEBUG_CONFIGURE_LABEL, undefined, true, () => this.commandService.executeCommand(debugCommands_1.DEBUG_CONFIGURE_COMMAND_ID));
            // Don't append the standard command if id of any provided action indicates it is a command
            const actions = errorActions.filter((action) => action.id.endsWith('.command')).length > 0 ?
                errorActions :
                [...errorActions, ...(promptLaunchJson ? [configureAction] : [])];
            await this.dialogService.prompt({
                type: severity_1.default.Error,
                message,
                buttons: actions.map(action => ({
                    label: action.label,
                    run: () => action.run()
                })),
                cancelButton: true
            });
        }
        //---- focus management
        async focusStackFrame(_stackFrame, _thread, _session, options) {
            const { stackFrame, thread, session } = getStackFrameThreadAndSessionToFocus(this.model, _stackFrame, _thread, _session);
            if (stackFrame) {
                const editor = await stackFrame.openInEditor(this.editorService, options?.preserveFocus ?? true, options?.sideBySide, options?.pinned);
                if (editor) {
                    if (editor.input === disassemblyViewInput_1.DisassemblyViewInput.instance) {
                        // Go to address is invoked via setFocus
                    }
                    else {
                        const control = editor.getControl();
                        if (stackFrame && (0, editorBrowser_1.isCodeEditor)(control) && control.hasModel()) {
                            const model = control.getModel();
                            const lineNumber = stackFrame.range.startLineNumber;
                            if (lineNumber >= 1 && lineNumber <= model.getLineCount()) {
                                const lineContent = control.getModel().getLineContent(lineNumber);
                                aria.alert(nls.localize({ key: 'debuggingPaused', comment: ['First placeholder is the file line content, second placeholder is the reason why debugging is stopped, for example "breakpoint", third is the stack frame name, and last is the line number.'] }, "{0}, debugging paused {1}, {2}:{3}", lineContent, thread && thread.stoppedDetails ? `, reason ${thread.stoppedDetails.reason}` : '', stackFrame.source ? stackFrame.source.name : '', stackFrame.range.startLineNumber));
                            }
                        }
                    }
                }
            }
            if (session) {
                this.debugType.set(session.configuration.type);
            }
            else {
                this.debugType.reset();
            }
            this.viewModel.setFocus(stackFrame, thread, session, !!options?.explicit);
        }
        //---- watches
        addWatchExpression(name) {
            const we = this.model.addWatchExpression(name);
            if (!name) {
                this.viewModel.setSelectedExpression(we, false);
            }
            this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
        }
        renameWatchExpression(id, newName) {
            this.model.renameWatchExpression(id, newName);
            this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
        }
        moveWatchExpression(id, position) {
            this.model.moveWatchExpression(id, position);
            this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
        }
        removeWatchExpressions(id) {
            this.model.removeWatchExpressions(id);
            this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
        }
        //---- breakpoints
        canSetBreakpointsIn(model) {
            return this.adapterManager.canSetBreakpointsIn(model);
        }
        async enableOrDisableBreakpoints(enable, breakpoint) {
            if (breakpoint) {
                this.model.setEnablement(breakpoint, enable);
                this.debugStorage.storeBreakpoints(this.model);
                if (breakpoint instanceof debugModel_1.Breakpoint) {
                    await this.makeTriggeredBreakpointsMatchEnablement(enable, breakpoint);
                    await this.sendBreakpoints(breakpoint.originalUri);
                }
                else if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
                    await this.sendFunctionBreakpoints();
                }
                else if (breakpoint instanceof debugModel_1.DataBreakpoint) {
                    await this.sendDataBreakpoints();
                }
                else if (breakpoint instanceof debugModel_1.InstructionBreakpoint) {
                    await this.sendInstructionBreakpoints();
                }
                else {
                    await this.sendExceptionBreakpoints();
                }
            }
            else {
                this.model.enableOrDisableAllBreakpoints(enable);
                this.debugStorage.storeBreakpoints(this.model);
                await this.sendAllBreakpoints();
            }
            this.debugStorage.storeBreakpoints(this.model);
        }
        async addBreakpoints(uri, rawBreakpoints, ariaAnnounce = true) {
            const breakpoints = this.model.addBreakpoints(uri, rawBreakpoints);
            if (ariaAnnounce) {
                breakpoints.forEach(bp => aria.status(nls.localize('breakpointAdded', "Added breakpoint, line {0}, file {1}", bp.lineNumber, uri.fsPath)));
            }
            // In some cases we need to store breakpoints before we send them because sending them can take a long time
            // And after sending them because the debug adapter can attach adapter data to a breakpoint
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendBreakpoints(uri);
            this.debugStorage.storeBreakpoints(this.model);
            return breakpoints;
        }
        async updateBreakpoints(uri, data, sendOnResourceSaved) {
            this.model.updateBreakpoints(data);
            this.debugStorage.storeBreakpoints(this.model);
            if (sendOnResourceSaved) {
                this.breakpointsToSendOnResourceSaved.add(uri);
            }
            else {
                await this.sendBreakpoints(uri);
                this.debugStorage.storeBreakpoints(this.model);
            }
        }
        async removeBreakpoints(id) {
            const breakpoints = this.model.getBreakpoints();
            const toRemove = breakpoints.filter(bp => !id || bp.getId() === id);
            // note: using the debugger-resolved uri for aria to reflect UI state
            toRemove.forEach(bp => aria.status(nls.localize('breakpointRemoved', "Removed breakpoint, line {0}, file {1}", bp.lineNumber, bp.uri.fsPath)));
            const urisToClear = new Set(toRemove.map(bp => bp.originalUri.toString()));
            this.model.removeBreakpoints(toRemove);
            this.unlinkTriggeredBreakpoints(breakpoints, toRemove).forEach(uri => urisToClear.add(uri.toString()));
            this.debugStorage.storeBreakpoints(this.model);
            await Promise.all([...urisToClear].map(uri => this.sendBreakpoints(uri_1.URI.parse(uri))));
        }
        setBreakpointsActivated(activated) {
            this.model.setBreakpointsActivated(activated);
            return this.sendAllBreakpoints();
        }
        addFunctionBreakpoint(name, id) {
            this.model.addFunctionBreakpoint(name || '', id);
        }
        async updateFunctionBreakpoint(id, update) {
            this.model.updateFunctionBreakpoint(id, update);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendFunctionBreakpoints();
        }
        async removeFunctionBreakpoints(id) {
            this.model.removeFunctionBreakpoints(id);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendFunctionBreakpoints();
        }
        async addDataBreakpoint(label, dataId, canPersist, accessTypes, accessType) {
            this.model.addDataBreakpoint(label, dataId, canPersist, accessTypes, accessType);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendDataBreakpoints();
            this.debugStorage.storeBreakpoints(this.model);
        }
        async updateDataBreakpoint(id, update) {
            this.model.updateDataBreakpoint(id, update);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendDataBreakpoints();
        }
        async removeDataBreakpoints(id) {
            this.model.removeDataBreakpoints(id);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendDataBreakpoints();
        }
        async addInstructionBreakpoint(instructionReference, offset, address, condition, hitCondition) {
            this.model.addInstructionBreakpoint(instructionReference, offset, address, condition, hitCondition);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendInstructionBreakpoints();
            this.debugStorage.storeBreakpoints(this.model);
        }
        async removeInstructionBreakpoints(instructionReference, offset) {
            this.model.removeInstructionBreakpoints(instructionReference, offset);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendInstructionBreakpoints();
        }
        setExceptionBreakpointFallbackSession(sessionId) {
            this.model.setExceptionBreakpointFallbackSession(sessionId);
            this.debugStorage.storeBreakpoints(this.model);
        }
        setExceptionBreakpointsForSession(session, data) {
            this.model.setExceptionBreakpointsForSession(session.getId(), data);
            this.debugStorage.storeBreakpoints(this.model);
        }
        async setExceptionBreakpointCondition(exceptionBreakpoint, condition) {
            this.model.setExceptionBreakpointCondition(exceptionBreakpoint, condition);
            this.debugStorage.storeBreakpoints(this.model);
            await this.sendExceptionBreakpoints();
        }
        async sendAllBreakpoints(session) {
            const setBreakpointsPromises = (0, arrays_1.distinct)(this.model.getBreakpoints(), bp => bp.originalUri.toString())
                .map(bp => this.sendBreakpoints(bp.originalUri, false, session));
            // If sending breakpoints to one session which we know supports the configurationDone request, can make all requests in parallel
            if (session?.capabilities.supportsConfigurationDoneRequest) {
                await Promise.all([
                    ...setBreakpointsPromises,
                    this.sendFunctionBreakpoints(session),
                    this.sendDataBreakpoints(session),
                    this.sendInstructionBreakpoints(session),
                    this.sendExceptionBreakpoints(session),
                ]);
            }
            else {
                await Promise.all(setBreakpointsPromises);
                await this.sendFunctionBreakpoints(session);
                await this.sendDataBreakpoints(session);
                await this.sendInstructionBreakpoints(session);
                // send exception breakpoints at the end since some debug adapters may rely on the order - this was the case before
                // the configurationDone request was introduced.
                await this.sendExceptionBreakpoints(session);
            }
        }
        /**
         * Removes the condition of triggered breakpoints that depended on
         * breakpoints in `removedBreakpoints`. Returns the URIs of resources that
         * had their breakpoints changed in this way.
         */
        unlinkTriggeredBreakpoints(allBreakpoints, removedBreakpoints) {
            const affectedUris = [];
            for (const removed of removedBreakpoints) {
                for (const existing of allBreakpoints) {
                    if (!removedBreakpoints.includes(existing) && existing.triggeredBy === removed.getId()) {
                        this.model.updateBreakpoints(new Map([[existing.getId(), { triggeredBy: undefined }]]));
                        affectedUris.push(existing.originalUri);
                    }
                }
            }
            return affectedUris;
        }
        async makeTriggeredBreakpointsMatchEnablement(enable, breakpoint) {
            if (enable) {
                /** If the breakpoint is being enabled, also ensure its triggerer is enabled */
                if (breakpoint.triggeredBy) {
                    const trigger = this.model.getBreakpoints().find(bp => breakpoint.triggeredBy === bp.getId());
                    if (trigger && !trigger.enabled) {
                        await this.enableOrDisableBreakpoints(enable, trigger);
                    }
                }
            }
            /** Makes its triggeree states match the state of this breakpoint */
            await Promise.all(this.model.getBreakpoints()
                .filter(bp => bp.triggeredBy === breakpoint.getId() && bp.enabled !== enable)
                .map(bp => this.enableOrDisableBreakpoints(enable, bp)));
        }
        async sendBreakpoints(modelUri, sourceModified = false, session) {
            const breakpointsToSend = this.model.getBreakpoints({ originalUri: modelUri, enabledOnly: true });
            await sendToOneOrAllSessions(this.model, session, async (s) => {
                if (!s.configuration.noDebug) {
                    const sessionBps = breakpointsToSend.filter(bp => !bp.triggeredBy || bp.getSessionDidTrigger(s.getId()));
                    await s.sendBreakpoints(modelUri, sessionBps, sourceModified);
                }
            });
        }
        async sendFunctionBreakpoints(session) {
            const breakpointsToSend = this.model.getFunctionBreakpoints().filter(fbp => fbp.enabled && this.model.areBreakpointsActivated());
            await sendToOneOrAllSessions(this.model, session, async (s) => {
                if (s.capabilities.supportsFunctionBreakpoints && !s.configuration.noDebug) {
                    await s.sendFunctionBreakpoints(breakpointsToSend);
                }
            });
        }
        async sendDataBreakpoints(session) {
            const breakpointsToSend = this.model.getDataBreakpoints().filter(fbp => fbp.enabled && this.model.areBreakpointsActivated());
            await sendToOneOrAllSessions(this.model, session, async (s) => {
                if (s.capabilities.supportsDataBreakpoints && !s.configuration.noDebug) {
                    await s.sendDataBreakpoints(breakpointsToSend);
                }
            });
        }
        async sendInstructionBreakpoints(session) {
            const breakpointsToSend = this.model.getInstructionBreakpoints().filter(fbp => fbp.enabled && this.model.areBreakpointsActivated());
            await sendToOneOrAllSessions(this.model, session, async (s) => {
                if (s.capabilities.supportsInstructionBreakpoints && !s.configuration.noDebug) {
                    await s.sendInstructionBreakpoints(breakpointsToSend);
                }
            });
        }
        sendExceptionBreakpoints(session) {
            return sendToOneOrAllSessions(this.model, session, async (s) => {
                const enabledExceptionBps = this.model.getExceptionBreakpointsForSession(s.getId()).filter(exb => exb.enabled);
                if (s.capabilities.supportsConfigurationDoneRequest && (!s.capabilities.exceptionBreakpointFilters || s.capabilities.exceptionBreakpointFilters.length === 0)) {
                    // Only call `setExceptionBreakpoints` as specified in dap protocol #90001
                    return;
                }
                if (!s.configuration.noDebug) {
                    await s.sendExceptionBreakpoints(enabledExceptionBps);
                }
            });
        }
        onFileChanges(fileChangesEvent) {
            const toRemove = this.model.getBreakpoints().filter(bp => fileChangesEvent.contains(bp.originalUri, 2 /* FileChangeType.DELETED */));
            if (toRemove.length) {
                this.model.removeBreakpoints(toRemove);
            }
            const toSend = [];
            for (const uri of this.breakpointsToSendOnResourceSaved) {
                if (fileChangesEvent.contains(uri, 0 /* FileChangeType.UPDATED */)) {
                    toSend.push(uri);
                }
            }
            for (const uri of toSend) {
                this.breakpointsToSendOnResourceSaved.delete(uri);
                this.sendBreakpoints(uri, true);
            }
        }
        async runTo(uri, lineNumber, column) {
            let breakpointToRemove;
            let threadToContinue = this.getViewModel().focusedThread;
            const addTempBreakPoint = async () => {
                const bpExists = !!(this.getModel().getBreakpoints({ column, lineNumber, uri }).length);
                if (!bpExists) {
                    const addResult = await this.addAndValidateBreakpoints(uri, lineNumber, column);
                    if (addResult.thread) {
                        threadToContinue = addResult.thread;
                    }
                    if (addResult.breakpoint) {
                        breakpointToRemove = addResult.breakpoint;
                    }
                }
                return { threadToContinue, breakpointToRemove };
            };
            const removeTempBreakPoint = (state) => {
                if (state === 2 /* State.Stopped */ || state === 0 /* State.Inactive */) {
                    if (breakpointToRemove) {
                        this.removeBreakpoints(breakpointToRemove.getId());
                    }
                    return true;
                }
                return false;
            };
            await addTempBreakPoint();
            if (this.state === 0 /* State.Inactive */) {
                // If no session exists start the debugger
                const { launch, name, getConfig } = this.getConfigurationManager().selectedConfiguration;
                const config = await getConfig();
                const configOrName = config ? Object.assign((0, objects_1.deepClone)(config), {}) : name;
                const listener = this.onDidChangeState(state => {
                    if (removeTempBreakPoint(state)) {
                        listener.dispose();
                    }
                });
                await this.startDebugging(launch, configOrName, undefined, true);
            }
            if (this.state === 2 /* State.Stopped */) {
                const focusedSession = this.getViewModel().focusedSession;
                if (!focusedSession || !threadToContinue) {
                    return;
                }
                const listener = threadToContinue.session.onDidChangeState(() => {
                    if (removeTempBreakPoint(focusedSession.state)) {
                        listener.dispose();
                    }
                });
                await threadToContinue.continue();
            }
        }
        async addAndValidateBreakpoints(uri, lineNumber, column) {
            const debugModel = this.getModel();
            const viewModel = this.getViewModel();
            const breakpoints = await this.addBreakpoints(uri, [{ lineNumber, column }], false);
            const breakpoint = breakpoints?.[0];
            if (!breakpoint) {
                return { breakpoint: undefined, thread: viewModel.focusedThread };
            }
            // If the breakpoint was not initially verified, wait up to 2s for it to become so.
            // Inherently racey if multiple sessions can verify async, but not solvable...
            if (!breakpoint.verified) {
                let listener;
                await (0, async_1.raceTimeout)(new Promise(resolve => {
                    listener = debugModel.onDidChangeBreakpoints(() => {
                        if (breakpoint.verified) {
                            resolve();
                        }
                    });
                }), 2000);
                listener.dispose();
            }
            // Look at paused threads for sessions that verified this bp. Prefer, in order:
            let Score;
            (function (Score) {
                /** The focused thread */
                Score[Score["Focused"] = 0] = "Focused";
                /** Any other stopped thread of a session that verified the bp */
                Score[Score["Verified"] = 1] = "Verified";
                /** Any thread that verified and paused in the same file */
                Score[Score["VerifiedAndPausedInFile"] = 2] = "VerifiedAndPausedInFile";
                /** The focused thread if it verified the breakpoint */
                Score[Score["VerifiedAndFocused"] = 3] = "VerifiedAndFocused";
            })(Score || (Score = {}));
            let bestThread = viewModel.focusedThread;
            let bestScore = 0 /* Score.Focused */;
            for (const sessionId of breakpoint.sessionsThatVerified) {
                const session = debugModel.getSession(sessionId);
                if (!session) {
                    continue;
                }
                const threads = session.getAllThreads().filter(t => t.stopped);
                if (bestScore < 3 /* Score.VerifiedAndFocused */) {
                    if (viewModel.focusedThread && threads.includes(viewModel.focusedThread)) {
                        bestThread = viewModel.focusedThread;
                        bestScore = 3 /* Score.VerifiedAndFocused */;
                    }
                }
                if (bestScore < 2 /* Score.VerifiedAndPausedInFile */) {
                    const pausedInThisFile = threads.find(t => {
                        const top = t.getTopStackFrame();
                        return top && this.uriIdentityService.extUri.isEqual(top.source.uri, uri);
                    });
                    if (pausedInThisFile) {
                        bestThread = pausedInThisFile;
                        bestScore = 2 /* Score.VerifiedAndPausedInFile */;
                    }
                }
                if (bestScore < 1 /* Score.Verified */) {
                    bestThread = threads[0];
                    bestScore = 2 /* Score.VerifiedAndPausedInFile */;
                }
            }
            return { thread: bestThread, breakpoint };
        }
    };
    exports.DebugService = DebugService;
    exports.DebugService = DebugService = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, panecomposite_1.IPaneCompositePartService),
        __param(2, viewsService_1.IViewsService),
        __param(3, views_1.IViewDescriptorService),
        __param(4, notification_1.INotificationService),
        __param(5, dialogs_1.IDialogService),
        __param(6, layoutService_1.IWorkbenchLayoutService),
        __param(7, workspace_1.IWorkspaceContextService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, lifecycle_2.ILifecycleService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, extensions_1.IExtensionService),
        __param(12, files_1.IFileService),
        __param(13, configuration_1.IConfigurationService),
        __param(14, extensionHostDebug_1.IExtensionHostDebugService),
        __param(15, activity_1.IActivityService),
        __param(16, commands_1.ICommandService),
        __param(17, quickInput_1.IQuickInputService),
        __param(18, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(19, uriIdentity_1.IUriIdentityService)
    ], DebugService);
    function getStackFrameThreadAndSessionToFocus(model, stackFrame, thread, session, avoidSession) {
        if (!session) {
            if (stackFrame || thread) {
                session = stackFrame ? stackFrame.thread.session : thread.session;
            }
            else {
                const sessions = model.getSessions();
                const stoppedSession = sessions.find(s => s.state === 2 /* State.Stopped */);
                // Make sure to not focus session that is going down
                session = stoppedSession || sessions.find(s => s !== avoidSession && s !== avoidSession?.parentSession) || (sessions.length ? sessions[0] : undefined);
            }
        }
        if (!thread) {
            if (stackFrame) {
                thread = stackFrame.thread;
            }
            else {
                const threads = session ? session.getAllThreads() : undefined;
                const stoppedThread = threads && threads.find(t => t.stopped);
                thread = stoppedThread || (threads && threads.length ? threads[0] : undefined);
            }
        }
        if (!stackFrame && thread) {
            stackFrame = thread.getTopStackFrame();
        }
        return { session, thread, stackFrame };
    }
    exports.getStackFrameThreadAndSessionToFocus = getStackFrameThreadAndSessionToFocus;
    async function sendToOneOrAllSessions(model, session, send) {
        if (session) {
            await send(session);
        }
        else {
            await Promise.all(model.getSessions().map(s => send(s)));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwRHpGLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQVk7UUFnQ3hCLFlBQ2lCLGFBQThDLEVBQ25DLG9CQUFnRSxFQUM1RSxZQUE0QyxFQUNuQyxxQkFBOEQsRUFDaEUsbUJBQTBELEVBQ2hFLGFBQThDLEVBQ3JDLGFBQXVELEVBQ3RELGNBQXlELEVBQy9ELGlCQUFzRCxFQUN2RCxnQkFBb0QsRUFDaEQsb0JBQTRELEVBQ2hFLGdCQUFvRCxFQUN6RCxXQUEwQyxFQUNqQyxvQkFBNEQsRUFDdkQseUJBQXNFLEVBQ2hGLGVBQWtELEVBQ25ELGNBQWdELEVBQzdDLGlCQUFzRCxFQUMzQyw0QkFBNEUsRUFDdEYsa0JBQXdEO1lBbkI1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDbEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUEyQjtZQUMzRCxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNsQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQy9DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDL0Msa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3BCLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUNyQyxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN4QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNoQix5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
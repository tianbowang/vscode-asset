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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalStrings", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/common/contextkeys", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalProfileQuickpick", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/browser/terminalInstance", "vs/platform/keybinding/common/keybinding", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/services/timer/browser/timerService", "vs/base/common/performance", "vs/workbench/contrib/terminal/browser/detachedTerminal", "vs/workbench/contrib/terminal/browser/terminalEvents", "vs/base/browser/window"], function (require, exports, dom, async_1, decorators_1, event_1, lifecycle_1, network_1, platform_1, uri_1, nls, commands_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, notification_1, terminal_1, terminalStrings_1, colorRegistry_1, iconRegistry_1, theme_1, themeService_1, themables_1, workspace_1, contextkeys_1, viewsService_1, terminal_2, terminalActions_1, terminalConfigHelper_1, terminalEditorInput_1, terminalIcon_1, terminalProfileQuickpick_1, terminalUri_1, terminal_3, terminalContextKey_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, environmentService_1, extensions_1, lifecycle_2, remoteAgentService_1, xtermTerminal_1, terminalInstance_1, keybinding_1, terminalCapabilityStore_1, timerService_1, performance_1, detachedTerminal_1, terminalEvents_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalService = void 0;
    let TerminalService = class TerminalService extends lifecycle_1.Disposable {
        get isProcessSupportRegistered() { return !!this._processSupportContextKey.get(); }
        get connectionState() { return this._connectionState; }
        get whenConnected() { return this._whenConnected.p; }
        get restoredGroupCount() { return this._restoredGroupCount; }
        get configHelper() { return this._configHelper; }
        get instances() {
            return this._terminalGroupService.instances.concat(this._terminalEditorService.instances);
        }
        get detachedInstances() {
            return this._detachedXterms;
        }
        getReconnectedTerminals(reconnectionOwner) {
            return this._reconnectedTerminals.get(reconnectionOwner);
        }
        get defaultLocation() { return this.configHelper.config.defaultLocation === "editor" /* TerminalLocationString.Editor */ ? terminal_1.TerminalLocation.Editor : terminal_1.TerminalLocation.Panel; }
        get activeInstance() {
            // Check if either an editor or panel terminal has focus and return that, regardless of the
            // value of _activeInstance. This avoids terminals created in the panel for example stealing
            // the active status even when it's not focused.
            for (const activeHostTerminal of this._hostActiveTerminals.values()) {
                if (activeHostTerminal?.hasFocus) {
                    return activeHostTerminal;
                }
            }
            // Fallback to the last recorded active terminal if neither have focus
            return this._activeInstance;
        }
        get onDidCreateInstance() { return this._onDidCreateInstance.event; }
        get onDidChangeInstanceDimensions() { return this._onDidChangeInstanceDimensions.event; }
        get onDidRegisterProcessSupport() { return this._onDidRegisterProcessSupport.event; }
        get onDidChangeConnectionState() { return this._onDidChangeConnectionState.event; }
        get onDidRequestStartExtensionTerminal() { return this._onDidRequestStartExtensionTerminal.event; }
        get onDidDisposeInstance() { return this._onDidDisposeInstance.event; }
        get onDidFocusInstance() { return this._onDidFocusInstance.event; }
        get onDidChangeActiveInstance() { return this._onDidChangeActiveInstance.event; }
        get onDidChangeInstances() { return this._onDidChangeInstances.event; }
        get onDidChangeInstanceCapability() { return this._onDidChangeInstanceCapability.event; }
        get onDidChangeActiveGroup() { return this._onDidChangeActiveGroup.event; }
        // Lazily initialized events that fire when the specified event fires on _any_ terminal
        get onAnyInstanceDataInput() { return this.createOnInstanceEvent(e => e.onDidInputData); }
        get onAnyInstanceIconChange() { return this.createOnInstanceEvent(e => e.onIconChanged); }
        get onAnyInstanceMaximumDimensionsChange() { return this.createOnInstanceEvent(e => event_1.Event.map(e.onMaximumDimensionsChanged, () => e, e.store)); }
        get onAnyInstancePrimaryStatusChange() { return this.createOnInstanceEvent(e => event_1.Event.map(e.statusList.onDidChangePrimaryStatus, () => e, e.store)); }
        get onAnyInstanceProcessIdReady() { return this.createOnInstanceEvent(e => e.onProcessIdReady); }
        get onAnyInstanceSelectionChange() { return this.createOnInstanceEvent(e => e.onDidChangeSelection); }
        get onAnyInstanceTitleChange() { return this.createOnInstanceEvent(e => e.onTitleChanged); }
        constructor(_contextKeyService, _lifecycleService, _logService, _dialogService, _instantiationService, _remoteAgentService, _viewsService, _configurationService, _environmentService, _terminalEditorService, _terminalGroupService, _terminalInstanceService, _editorGroupsService, _terminalProfileService, _extensionService, _notificationService, _workspaceContextService, _commandService, _keybindingService, _timerService) {
            super();
            this._contextKeyService = _contextKeyService;
            this._lifecycleService = _lifecycleService;
            this._logService = _logService;
            this._dialogService = _dialogService;
            this._instantiationService = _instantiationService;
            this._remoteAgentService = _remoteAgentService;
            this._viewsService = _viewsService;
            this._configurationService = _configurationService;
            this._environmentService = _environmentService;
            this._terminalEditorService = _terminalEditorService;
            this._terminalGroupService = _terminalGroupService;
            this._terminalInstanceService = _terminalInstanceService;
            this._editorGroupsService = _editorGroupsService;
            this._terminalProfileService = _terminalProfileService;
            this._extensionService = _extensionService;
            this._notificationService = _notificationService;
            this._workspaceContextService = _workspaceContextService;
            this._commandService = _commandService;
            this._keybindingService = _keybindingService;
            this._timerService = _timerService;
            this._hostActiveTerminals = new Map();
            this._detachedXterms = new Set();
            this._isShuttingDown = false;
            this._backgroundedTerminalInstances = [];
            this._backgroundedTerminalDisposables = new Map();
            this._connectionState = 0 /* TerminalConnectionState.Connecting */;
            this._whenConnected = new async_1.DeferredPromise();
            this._restoredGroupCount = 0;
            this._reconnectedTerminals = new Map();
            this._onDidCreateInstance = this._register(new event_1.Emitter());
            this._onDidChangeInstanceDimensions = this._register(new event_1.Emitter());
            this._onDidRegisterProcessSupport = this._register(new event_1.Emitter());
            this._onDidChangeConnectionState = this._register(new event_1.Emitter());
            this._onDidRequestStartExtensionTerminal = this._register(new event_1.Emitter());
            // ITerminalInstanceHost events
            this._onDidDisposeInstance = this._register(new event_1.Emitter());
            this._onDidFocusInstance = this._register(new event_1.Emitter());
            this._onDidChangeActiveInstance = this._register(new event_1.Emitter());
            this._onDidChangeInstances = this._register(new event_1.Emitter());
            this._onDidChangeInstanceCapability = this._register(new event_1.Emitter());
            // Terminal view events
            this._onDidChangeActiveGroup = this._register(new event_1.Emitter());
            this._configHelper = this._register(this._instantiationService.createInstance(terminalConfigHelper_1.TerminalConfigHelper));
            // the below avoids having to poll routinely.
            // we update detected profiles when an instance is created so that,
            // for example, we detect if you've installed a pwsh
            this.onDidCreateInstance(() => this._terminalProfileService.refreshAvailableProfiles());
            this._forwardInstanceHostEvents(this._terminalGroupService);
            this._forwardInstanceHostEvents(this._terminalEditorService);
            this._terminalGroupService.onDidChangeActiveGroup(this._onDidChangeActiveGroup.fire, this._onDidChangeActiveGroup);
            this._terminalInstanceService.onDidCreateInstance(instance => {
                this._initInstanceListeners(instance);
                this._onDidCreateInstance.fire(instance);
            });
            // Hide the panel if there are no more instances, provided that VS Code is not shutting
            // down. When shutting down the panel is locked in place so that it is restored upon next
            // launch.
            this._terminalGroupService.onDidChangeActiveInstance(instance => {
                if (!instance && !this._isShuttingDown) {
                    this._terminalGroupService.hidePanel();
                }
                if (instance?.shellType) {
                    this._terminalShellTypeContextKey.set(instance.shellType.toString());
                }
                else if (!instance) {
                    this._terminalShellTypeContextKey.reset();
                }
            });
            this._handleInstanceContextKeys();
            this._terminalShellTypeContextKey = terminalContextKey_1.TerminalContextKeys.shellType.bindTo(this._contextKeyService);
            this._processSupportContextKey = terminalContextKey_1.TerminalContextKeys.processSupported.bindTo(this._contextKeyService);
            this._processSupportContextKey.set(!platform_1.isWeb || this._remoteAgentService.getConnection() !== null);
            this._terminalHasBeenCreated = terminalContextKey_1.TerminalContextKeys.terminalHasBeenCreated.bindTo(this._contextKeyService);
            this._terminalCountContextKey = terminalContextKey_1.TerminalContextKeys.count.bindTo(this._contextKeyService);
            this._terminalEditorActive = terminalContextKey_1.TerminalContextKeys.terminalEditorActive.bindTo(this._contextKeyService);
            this.onDidChangeActiveInstance(instance => {
                this._terminalEditorActive.set(!!instance?.target && instance.target === terminal_1.TerminalLocation.Editor);
            });
            _lifecycleService.onBeforeShutdown(async (e) => e.veto(this._onBeforeShutdown(e.reason), 'veto.terminal'));
            _lifecycleService.onWillShutdown(e => this._onWillShutdown(e));
            this.initializePrimaryBackend();
            // Create async as the class depends on `this`
            (0, async_1.timeout)(0).then(() => this._register(this._instantiationService.createInstance(TerminalEditorStyle, window_1.mainWindow.document.head)));
        }
        async showProfileQuickPick(type, cwd) {
            const quickPick = this._instantiationService.createInstance(terminalProfileQuickpick_1.TerminalProfileQuickpick);
            const result = await quickPick.showAndGetResult(type);
            if (!result) {
                return;
            }
            if (typeof result === 'string') {
                return;
            }
            const keyMods = result.keyMods;
            if (type === 'createInstance') {
                const activeInstance = this.getDefaultInstanceHost().activeInstance;
                let instance;
                if (result.config && 'id' in result?.config) {
                    await this.createContributedTerminalProfile(result.config.extensionIdentifier, result.config.id, {
                        icon: result.config.options?.icon,
                        color: result.config.options?.color,
                        location: !!(keyMods?.alt && activeInstance) ? { splitActiveTerminal: true } : this.defaultLocation
                    });
                    return;
                }
                else if (result.config && 'profileName' in result.config) {
                    if (keyMods?.alt && activeInstance) {
                        // create split, only valid if there's an active instance
                        instance = await this.createTerminal({ location: { parentTerminal: activeInstance }, config: result.config, cwd });
                    }
                    else {
                        instance = await this.createTerminal({ location: this.defaultLocation, config: result.config, cwd });
                    }
                }
                if (instance && this.defaultLocation !== terminal_1.TerminalLocation.Editor) {
                    this._terminalGroupService.showPanel(true);
                    this.setActiveInstance(instance);
                    return instance;
                }
            }
            return undefined;
        }
        async initializePrimaryBackend() {
            (0, performance_1.mark)('code/terminal/willGetTerminalBackend');
            this._primaryBackend = await this._terminalInstanceService.getBackend(this._environmentService.remoteAuthority);
            (0, performance_1.mark)('code/terminal/didGetTerminalBackend');
            const enableTerminalReconnection = this.configHelper.config.enablePersistentSessions;
            // Connect to the extension host if it's there, set the connection state to connected when
            // it's done. This should happen even when there is no extension host.
            this._connectionState = 0 /* TerminalConnectionState.Connecting */;
            const isPersistentRemote = !!this._environmentService.remoteAuthority && enableTerminalReconnection;
            this._primaryBackend?.onDidRequestDetach(async (e) => {
                const instanceToDetach = this.getInstanceFromResource((0, terminalUri_1.getTerminalUri)(e.workspaceId, e.instanceId));
                if (instanceToDetach) {
                    const persistentProcessId = instanceToDetach?.persistentProcessId;
                    if (persistentProcessId && !instanceToDetach.shellLaunchConfig.isFeatureTerminal && !instanceToDetach.shellLaunchConfig.customPtyImplementation) {
                        if (instanceToDetach.target === terminal_1.TerminalLocation.Editor) {
                            this._terminalEditorService.detachInstance(instanceToDetach);
                        }
                        else {
                            this._terminalGroupService.getGroupForInstance(instanceToDetach)?.removeInstance(instanceToDetach);
                        }
                        await instanceToDetach.detachProcessAndDispose(terminal_1.TerminalExitReason.User);
                        await this._primaryBackend?.acceptDetachInstanceReply(e.requestId, persistentProcessId);
                    }
                    else {
                        // will get rejected without a persistentProcessId to attach to
                        await this._primaryBackend?.acceptDetachInstanceReply(e.requestId, undefined);
                    }
                }
            });
            (0, performance_1.mark)('code/terminal/willReconnect');
            let reconnectedPromise;
            if (isPersistentRemote) {
                reconnectedPromise = this._reconnectToRemoteTerminals();
            }
            else if (enableTerminalReconnection) {
                reconnectedPromise = this._reconnectToLocalTerminals();
            }
            else {
                reconnectedPromise = Promise.resolve();
            }
            reconnectedPromise.then(async () => {
                this._setConnected();
                (0, performance_1.mark)('code/terminal/didReconnect');
                (0, performance_1.mark)('code/terminal/willReplay');
                const instances = await this._reconnectedTerminalGroups?.then(groups => groups.map(e => e.terminalInstances).flat()) ?? [];
                await Promise.all(instances.map(e => new Promise(r => event_1.Event.once(e.onProcessReplayComplete)(r))));
                (0, performance_1.mark)('code/terminal/didReplay');
                (0, performance_1.mark)('code/terminal/willGetPerformanceMarks');
                await Promise.all(Array.from(this._terminalInstanceService.getRegisteredBackends()).map(async (backend) => {
                    this._timerService.setPerformanceMarks(backend.remoteAuthority === undefined ? 'localPtyHost' : 'remotePtyHost', await backend.getPerformanceMarks());
                    backend.setReady();
                }));
                (0, performance_1.mark)('code/terminal/didGetPerformanceMarks');
                this._whenConnected.complete();
            });
        }
        getPrimaryBackend() {
            return this._primaryBackend;
        }
        _forwardInstanceHostEvents(host) {
            host.onDidChangeInstances(this._onDidChangeInstances.fire, this._onDidChangeInstances);
            host.onDidDisposeInstance(this._onDidDisposeInstance.fire, this._onDidDisposeInstance);
            host.onDidChangeActiveInstance(instance => this._evaluateActiveInstance(host, instance));
            host.onDidFocusInstance(instance => {
                this._onDidFocusInstance.fire(instance);
                this._evaluateActiveInstance(host, instance);
            });
            host.onDidChangeInstanceCapability((instance) => {
                this._onDidChangeInstanceCapability.fire(instance);
            });
            this._hostActiveTerminals.set(host, undefined);
        }
        _evaluateActiveInstance(host, instance) {
            // Track the latest active terminal for each host so that when one becomes undefined, the
            // TerminalService's active terminal is set to the last active terminal from the other host.
            // This means if the last terminal editor is closed such that it becomes undefined, the last
            // active group's terminal will be used as the active terminal if available.
            this._hostActiveTerminals.set(host, instance);
            if (instance === undefined) {
                for (const active of this._hostActiveTerminals.values()) {
                    if (active) {
                        instance = active;
                    }
                }
            }
            this._activeInstance = instance;
            this._onDidChangeActiveInstance.fire(instance);
        }
        setActiveInstance(value) {
            // If this was a hideFromUser terminal created by the API this was triggered by show,
            // in which case we need to create the terminal group
            if (value.shellLaunchConfig.hideFromUser) {
                this._showBackgroundTerminal(value);
            }
            if (value.target === terminal_1.TerminalLocation.Editor) {
                this._terminalEditorService.setActiveInstance(value);
            }
            else {
                this._terminalGroupService.setActiveInstance(value);
            }
        }
        async focusActiveInstance() {
            if (!this._activeInstance) {
                return;
            }
            if (this._activeInstance.target === terminal_1.TerminalLocation.Editor) {
                return this._terminalEditorService.focusActiveInstance();
            }
            return this._terminalGroupService.focusActiveInstance();
        }
        async createContributedTerminalProfile(extensionIdentifier, id, options) {
            await this._extensionService.activateByEvent(`onTerminalProfile:${id}`);
            const profileProvider = this._terminalProfileService.getContributedProfileProvider(extensionIdentifier, id);
            if (!profileProvider) {
                this._notificationService.error(`No terminal profile provider registered for id "${id}"`);
                return;
            }
            try {
                await profileProvider.createContributedTerminalProfile(options);
                this._terminalGroupService.setActiveInstanceByIndex(this._terminalGroupService.instances.length - 1);
                await this._terminalGroupService.activeInstance?.focusWhenReady();
            }
            catch (e) {
                this._notificationService.error(e.message);
            }
        }
        async safeDisposeTerminal(instance) {
            // Confirm on kill in the editor is handled by the editor input
            if (instance.target !== terminal_1.TerminalLocation.Editor &&
                instance.hasChildProcesses &&
                (this.configHelper.config.confirmOnKill === 'panel' || this.configHelper.config.confirmOnKill === 'always')) {
                const veto = await this._showTerminalCloseConfirmation(true);
                if (veto) {
                    return;
                }
            }
            return new Promise(r => {
                event_1.Event.once(instance.onExit)(() => r());
                instance.dispose(terminal_1.TerminalExitReason.User);
            });
        }
        _setConnected() {
            this._connectionState = 1 /* TerminalConnectionState.Connected */;
            this._onDidChangeConnectionState.fire();
            this._logService.trace('Pty host ready');
        }
        async _reconnectToRemoteTerminals() {
            const remoteAuthority = this._environmentService.remoteAuthority;
            if (!remoteAuthority) {
                return;
            }
            const backend = await this._terminalInstanceService.getBackend(remoteAuthority);
            if (!backend) {
                return;
            }
            (0, performance_1.mark)('code/terminal/willGetTerminalLayoutInfo');
            const layoutInfo = await backend.getTerminalLayoutInfo();
            (0, performance_1.mark)('code/terminal/didGetTerminalLayoutInfo');
            backend.reduceConnectionGraceTime();
            (0, performance_1.mark)('code/terminal/willRecreateTerminalGroups');
            await this._recreateTerminalGroups(layoutInfo);
            (0, performance_1.mark)('code/terminal/didRecreateTerminalGroups');
            // now that terminals have been restored,
            // attach listeners to update remote when terminals are changed
            this._attachProcessLayoutListeners();
            this._logService.trace('Reconnected to remote terminals');
        }
        async _reconnectToLocalTerminals() {
            const localBackend = await this._terminalInstanceService.getBackend();
            if (!localBackend) {
                return;
            }
            (0, performance_1.mark)('code/terminal/willGetTerminalLayoutInfo');
            const layoutInfo = await localBackend.getTerminalLayoutInfo();
            (0, performance_1.mark)('code/terminal/didGetTerminalLayoutInfo');
            if (layoutInfo && layoutInfo.tabs.length > 0) {
                (0, performance_1.mark)('code/terminal/willRecreateTerminalGroups');
                this._reconnectedTerminalGroups = this._recreateTerminalGroups(layoutInfo);
                (0, performance_1.mark)('code/terminal/didRecreateTerminalGroups');
            }
            // now that terminals have been restored,
            // attach listeners to update local state when terminals are changed
            this._attachProcessLayoutListeners();
            this._logService.trace('Reconnected to local terminals');
        }
        _recreateTerminalGroups(layoutInfo) {
            const groupPromises = [];
            let activeGroup;
            if (layoutInfo) {
                for (const tabLayout of layoutInfo.tabs) {
                    const terminalLayouts = tabLayout.terminals.filter(t => t.terminal && t.terminal.isOrphan);
                    if (terminalLayouts.length) {
                        this._restoredGroupCount += terminalLayouts.length;
                        const promise = this._recreateTerminalGroup(tabLayout, terminalLayouts);
                        groupPromises.push(promise);
                        if (tabLayout.isActive) {
                            activeGroup = promise;
                        }
                        const activeInstance = this.instances.find(t => t.shellLaunchConfig.attachPersistentProcess?.id === tabLayout.activePersistentProcessId);
                        if (activeInstance) {
                            this.setActiveInstance(activeInstance);
                        }
                    }
                }
                if (layoutInfo.tabs.length) {
                    activeGroup?.then(group => this._terminalGroupService.activeGroup = group);
                }
            }
            return Promise.all(groupPromises).then(result => result.filter(e => !!e));
        }
        async _recreateTerminalGroup(tabLayout, terminalLayouts) {
            let lastInstance;
            for (const terminalLayout of terminalLayouts) {
                const attachPersistentProcess = terminalLayout.terminal;
                if (this._lifecycleService.startupKind !== 3 /* StartupKind.ReloadedWindow */ && attachPersistentProcess.type === 'Task') {
                    continue;
                }
                (0, performance_1.mark)(`code/terminal/willRecreateTerminal/${attachPersistentProcess.id}-${attachPersistentProcess.pid}`);
                lastInstance = this.createTerminal({
                    config: { attachPersistentProcess },
                    location: lastInstance ? { parentTerminal: lastInstance } : terminal_1.TerminalLocation.Panel
                });
                lastInstance.then(() => (0, performance_1.mark)(`code/terminal/didRecreateTerminal/${attachPersistentProcess.id}-${attachPersistentProcess.pid}`));
            }
            const group = lastInstance?.then(instance => {
                const g = this._terminalGroupService.getGroupForInstance(instance);
                g?.resizePanes(tabLayout.terminals.map(terminal => terminal.relativeSize));
                return g;
            });
            return group;
        }
        _attachProcessLayoutListeners() {
            this.onDidChangeActiveGroup(() => this._saveState());
            this.onDidChangeActiveInstance(() => this._saveState());
            this.onDidChangeInstances(() => this._saveState());
            // The state must be updated when the terminal is relaunched, otherwise the persistent
            // terminal ID will be stale and the process will be leaked.
            this.onAnyInstanceProcessIdReady(() => this._saveState());
            this.onAnyInstanceTitleChange(instance => this._updateTitle(instance));
            this.onAnyInstanceIconChange(e => this._updateIcon(e.instance, e.userInitiated));
        }
        _handleInstanceContextKeys() {
            const terminalIsOpenContext = terminalContextKey_1.TerminalContextKeys.isOpen.bindTo(this._contextKeyService);
            const updateTerminalContextKeys = () => {
                terminalIsOpenContext.set(this.instances.length > 0);
                this._terminalCountContextKey.set(this.instances.length);
            };
            this.onDidChangeInstances(() => updateTerminalContextKeys());
        }
        async getActiveOrCreateInstance(options) {
            const activeInstance = this.activeInstance;
            // No instance, create
            if (!activeInstance) {
                return this.createTerminal();
            }
            // Active instance, ensure accepts input
            if (!options?.acceptsInput || activeInstance.xterm?.isStdinDisabled !== true) {
                return activeInstance;
            }
            // Active instance doesn't accept input, create and focus
            const instance = await this.createTerminal();
            this.setActiveInstance(instance);
            await this.revealActiveTerminal();
            return instance;
        }
        async revealActiveTerminal(preserveFocus) {
            const instance = this.activeInstance;
            if (!instance) {
                return;
            }
            if (instance.target === terminal_1.TerminalLocation.Editor) {
                await this._terminalEditorService.revealActiveEditor(preserveFocus);
            }
            else {
                await this._terminalGroupService.showPanel();
            }
        }
        setEditable(instance, data) {
            if (!data) {
                this._editable = undefined;
            }
            else {
                this._editable = { instance: instance, data };
            }
            const pane = this._viewsService.getActiveViewWithId(terminal_3.TERMINAL_VIEW_ID);
            const isEditing = this.isEditable(instance);
            pane?.terminalTabbedView?.setEditable(isEditing);
        }
        isEditable(instance) {
            return !!this._editable && (this._editable.instance === instance || !instance);
        }
        getEditableData(instance) {
            return this._editable && this._editable.instance === instance ? this._editable.data : undefined;
        }
        requestStartExtensionTerminal(proxy, cols, rows) {
            // The initial request came from the extension host, no need to wait for it
            return new Promise(callback => {
                this._onDidRequestStartExtensionTerminal.fire({ proxy, cols, rows, callback });
            });
        }
        _onBeforeShutdown(reason) {
            // Never veto on web as this would block all windows from being closed. This disables
            // process revive as we can't handle it on shutdown.
            if (platform_1.isWeb) {
                this._isShuttingDown = true;
                return false;
            }
            return this._onBeforeShutdownAsync(reason);
        }
        async _onBeforeShutdownAsync(reason) {
            if (this.instances.length === 0) {
                // No terminal instances, don't veto
                return false;
            }
            // Persist terminal _buffer state_, note that even if this happens the dirty terminal prompt
            // still shows as that cannot be revived
            try {
                this._shutdownWindowCount = await this._nativeDelegate?.getWindowCount();
                const shouldReviveProcesses = this._shouldReviveProcesses(reason);
                if (shouldReviveProcesses) {
                    // Attempt to persist the terminal state but only allow 2000ms as we can't block
                    // shutdown. This can happen when in a remote workspace but the other side has been
                    // suspended and is in the process of reconnecting, the message will be put in a
                    // queue in this case for when the connection is back up and running. Aborting the
                    // process is preferable in this case.
                    await Promise.race([
                        this._primaryBackend?.persistTerminalState(),
                        (0, async_1.timeout)(2000)
                    ]);
                }
                // Persist terminal _processes_
                const shouldPersistProcesses = this._configHelper.config.enablePersistentSessions && reason === 3 /* ShutdownReason.RELOAD */;
                if (!shouldPersistProcesses) {
                    const hasDirtyInstances = ((this.configHelper.config.confirmOnExit === 'always' && this.instances.length > 0) ||
                        (this.configHelper.config.confirmOnExit === 'hasChildProcesses' && this.instances.some(e => e.hasChildProcesses)));
                    if (hasDirtyInstances) {
                        return this._onBeforeShutdownConfirmation(reason);
                    }
                }
            }
            catch (err) {
                // Swallow as exceptions should not cause a veto to prevent shutdown
                this._logService.warn('Exception occurred during terminal shutdown', err);
            }
            this._isShuttingDown = true;
            return false;
        }
        setNativeDelegate(nativeDelegate) {
            this._nativeDelegate = nativeDelegate;
        }
        _shouldReviveProcesses(reason) {
            if (!this._configHelper.config.enablePersistentSessions) {
                return false;
            }
            switch (this.configHelper.config.persistentSessionReviveProcess) {
                case 'onExit': {
                    // Allow on close if it's the last window on Windows or Linux
                    if (reason === 1 /* ShutdownReason.CLOSE */ && (this._shutdownWindowCount === 1 && !platform_1.isMacintosh)) {
                        return true;
                    }
                    return reason === 4 /* ShutdownReason.LOAD */ || reason === 2 /* ShutdownReason.QUIT */;
                }
                case 'onExitAndWindowClose': return reason !== 3 /* ShutdownReason.RELOAD */;
                default: return false;
            }
        }
        async _onBeforeShutdownConfirmation(reason) {
            // veto if configured to show confirmation and the user chose not to exit
            const veto = await this._showTerminalCloseConfirmation();
            if (!veto) {
                this._isShuttingDown = true;
            }
            return veto;
        }
        _onWillShutdown(e) {
            // Don't touch processes if the shutdown was a result of reload as they will be reattached
            const shouldPersistTerminals = this._configHelper.config.enablePersistentSessions && e.reason === 3 /* ShutdownReason.RELOAD */;
            for (const instance of [...this._terminalGroupService.instances, ...this._backgroundedTerminalInstances]) {
                if (shouldPersistTerminals && instance.shouldPersist) {
                    instance.detachProcessAndDispose(terminal_1.TerminalExitReason.Shutdown);
                }
                else {
                    instance.dispose(terminal_1.TerminalExitReason.Shutdown);
                }
            }
            // Clear terminal layout info only when not persisting
            if (!shouldPersistTerminals && !this._shouldReviveProcesses(e.reason)) {
                this._primaryBackend?.setTerminalLayoutInfo(undefined);
            }
        }
        _saveState() {
            // Avoid saving state when shutting down as that would override process state to be revived
            if (this._isShuttingDown) {
                return;
            }
            if (!this.configHelper.config.enablePersistentSessions) {
                return;
            }
            const tabs = this._terminalGroupService.groups.map(g => g.getLayoutInfo(g === this._terminalGroupService.activeGroup));
            const state = { tabs };
            this._primaryBackend?.setTerminalLayoutInfo(state);
        }
        _updateTitle(instance) {
            if (!this.configHelper.config.enablePersistentSessions || !instance || !instance.persistentProcessId || !instance.title || instance.isDisposed) {
                return;
            }
            if (instance.staticTitle) {
                this._primaryBackend?.updateTitle(instance.persistentProcessId, instance.staticTitle, terminal_1.TitleEventSource.Api);
            }
            else {
                this._primaryBackend?.updateTitle(instance.persistentProcessId, instance.title, instance.titleSource);
            }
        }
        _updateIcon(instance, userInitiated) {
            if (!this.configHelper.config.enablePersistentSessions || !instance || !instance.persistentProcessId || !instance.icon || instance.isDisposed) {
                return;
            }
            this._primaryBackend?.updateIcon(instance.persistentProcessId, userInitiated, instance.icon, instance.color);
        }
        refreshActiveGroup() {
            this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup);
        }
        getInstanceFromId(terminalId) {
            let bgIndex = -1;
            this._backgroundedTerminalInstances.forEach((terminalInstance, i) => {
                if (terminalInstance.instanceId === terminalId) {
                    bgIndex = i;
                }
            });
            if (bgIndex !== -1) {
                return this._backgroundedTerminalInstances[bgIndex];
            }
            try {
                return this.instances[this._getIndexFromId(terminalId)];
            }
            catch {
                return undefined;
            }
        }
        getInstanceFromIndex(terminalIndex) {
            return this.instances[terminalIndex];
        }
        getInstanceFromResource(resource) {
            return (0, terminalUri_1.getInstanceFromResource)(this.instances, resource);
        }
        isAttachedToTerminal(remoteTerm) {
            return this.instances.some(term => term.processId === remoteTerm.pid);
        }
        moveToEditor(source, group) {
            if (source.target === terminal_1.TerminalLocation.Editor) {
                return;
            }
            const sourceGroup = this._terminalGroupService.getGroupForInstance(source);
            if (!sourceGroup) {
                return;
            }
            sourceGroup.removeInstance(source);
            this._terminalEditorService.openEditor(source, group ? { viewColumn: group } : undefined);
        }
        moveIntoNewEditor(source) {
            this.moveToEditor(source, editorService_1.AUX_WINDOW_GROUP);
        }
        async moveToTerminalView(source, target, side) {
            if (uri_1.URI.isUri(source)) {
                source = this.getInstanceFromResource(source);
            }
            if (!source) {
                return;
            }
            this._terminalEditorService.detachInstance(source);
            if (source.target !== terminal_1.TerminalLocation.Editor) {
                await this._terminalGroupService.showPanel(true);
                return;
            }
            source.target = terminal_1.TerminalLocation.Panel;
            let group;
            if (target) {
                group = this._terminalGroupService.getGroupForInstance(target);
            }
            if (!group) {
                group = this._terminalGroupService.createGroup();
            }
            group.addInstance(source);
            this.setActiveInstance(source);
            await this._terminalGroupService.showPanel(true);
            if (target && side) {
                const index = group.terminalInstances.indexOf(target) + (side === 'after' ? 1 : 0);
                group.moveInstance(source, index);
            }
            // Fire events
            this._onDidChangeInstances.fire();
            this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup);
        }
        _initInstanceListeners(instance) {
            const instanceDisposables = [
                instance.onDimensionsChanged(() => {
                    this._onDidChangeInstanceDimensions.fire(instance);
                    if (this.configHelper.config.enablePersistentSessions && this.isProcessSupportRegistered) {
                        this._saveState();
                    }
                }),
                instance.onDidFocus(this._onDidChangeActiveInstance.fire, this._onDidChangeActiveInstance),
                instance.onRequestAddInstanceToGroup(async (e) => await this._addInstanceToGroup(instance, e))
            ];
            instance.onDisposed(() => (0, lifecycle_1.dispose)(instanceDisposables));
        }
        async _addInstanceToGroup(instance, e) {
            const terminalIdentifier = (0, terminalUri_1.parseTerminalUri)(e.uri);
            if (terminalIdentifier.instanceId === undefined) {
                return;
            }
            let sourceInstance = this.getInstanceFromResource(e.uri);
            // Terminal from a different window
            if (!sourceInstance) {
                const attachPersistentProcess = await this._primaryBackend?.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId);
                if (attachPersistentProcess) {
                    sourceInstance = await this.createTerminal({ config: { attachPersistentProcess }, resource: e.uri });
                    this._terminalGroupService.moveInstance(sourceInstance, instance, e.side);
                    return;
                }
            }
            // View terminals
            sourceInstance = this._terminalGroupService.getInstanceFromResource(e.uri);
            if (sourceInstance) {
                this._terminalGroupService.moveInstance(sourceInstance, instance, e.side);
                return;
            }
            // Terminal editors
            sourceInstance = this._terminalEditorService.getInstanceFromResource(e.uri);
            if (sourceInstance) {
                this.moveToTerminalView(sourceInstance, instance, e.side);
                return;
            }
            return;
        }
        registerProcessSupport(isSupported) {
            if (!isSupported) {
                return;
            }
            this._processSupportContextKey.set(isSupported);
            this._onDidRegisterProcessSupport.fire();
        }
        // TODO: Remove this, it should live in group/editor servioce
        _getIndexFromId(terminalId) {
            let terminalIndex = -1;
            this.instances.forEach((terminalInstance, i) => {
                if (terminalInstance.instanceId === terminalId) {
                    terminalIndex = i;
                }
            });
            if (terminalIndex === -1) {
                throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
            }
            return terminalIndex;
        }
        async _showTerminalCloseConfirmation(singleTerminal) {
            let message;
            if (this.instances.length === 1 || singleTerminal) {
                message = nls.localize('terminalService.terminalCloseConfirmationSingular', "Do you want to terminate the active terminal session?");
            }
            else {
                message = nls.localize('terminalService.terminalCloseConfirmationPlural', "Do you want to terminate the {0} active terminal sessions?", this.instances.length);
            }
            const { confirmed } = await this._dialogService.confirm({
                type: 'warning',
                message,
                primaryButton: nls.localize({ key: 'terminate', comment: ['&& denotes a mnemonic'] }, "&&Terminate")
            });
            return !confirmed;
        }
        getDefaultInstanceHost() {
            if (this.defaultLocation === terminal_1.TerminalLocation.Editor) {
                return this._terminalEditorService;
            }
            return this._terminalGroupService;
        }
        async getInstanceHost(location) {
            if (location) {
                if (location === terminal_1.TerminalLocation.Editor) {
                    return this._terminalEditorService;
                }
                else if (typeof location === 'object') {
                    if ('viewColumn' in location) {
                        return this._terminalEditorService;
                    }
                    else if ('parentTerminal' in location) {
                        return (await location.parentTerminal).target === terminal_1.TerminalLocation.Editor ? this._terminalEditorService : this._terminalGroupService;
                    }
                }
                else {
                    return this._terminalGroupService;
                }
            }
            return this;
        }
        async createTerminal(options) {
            // Await the initialization of available profiles as long as this is not a pty terminal or a
            // local terminal in a remote workspace as profile won't be used in those cases and these
            // terminals need to be launched before remote connections are established.
            if (this._terminalProfileService.availableProfiles.length === 0) {
                const isPtyTerminal = options?.config && 'customPtyImplementation' in options.config;
                const isLocalInRemoteTerminal = this._remoteAgentService.getConnection() && uri_1.URI.isUri(options?.cwd) && options?.cwd.scheme === network_1.Schemas.vscodeFileResource;
                if (!isPtyTerminal && !isLocalInRemoteTerminal) {
                    if (this._connectionState === 0 /* TerminalConnectionState.Connecting */) {
                        (0, performance_1.mark)(`code/terminal/willGetProfiles`);
                    }
                    await this._terminalProfileService.profilesReady;
                    if (this._connectionState === 0 /* TerminalConnectionState.Connecting */) {
                        (0, performance_1.mark)(`code/terminal/didGetProfiles`);
                    }
                }
            }
            const config = options?.config || this._terminalProfileService.getDefaultProfile();
            const shellLaunchConfig = config && 'extensionIdentifier' in config ? {} : this._terminalInstanceService.convertProfileToShellLaunchConfig(config || {});
            // Get the contributed profile if it was provided
            const contributedProfile = await this._getContributedProfile(shellLaunchConfig, options);
            const splitActiveTerminal = typeof options?.location === 'object' && 'splitActiveTerminal' in options.location ? options.location.splitActiveTerminal : typeof options?.location === 'object' ? 'parentTerminal' in options.location : false;
            await this._resolveCwd(shellLaunchConfig, splitActiveTerminal, options);
            // Launch the contributed profile
            if (contributedProfile) {
                const resolvedLocation = await this.resolveLocation(options?.location);
                let location;
                if (splitActiveTerminal) {
                    location = resolvedLocation === terminal_1.TerminalLocation.Editor ? { viewColumn: editorService_1.SIDE_GROUP } : { splitActiveTerminal: true };
                }
                else {
                    location = typeof options?.location === 'object' && 'viewColumn' in options.location ? options.location : resolvedLocation;
                }
                await this.createContributedTerminalProfile(contributedProfile.extensionIdentifier, contributedProfile.id, {
                    icon: contributedProfile.icon,
                    color: contributedProfile.color,
                    location,
                    cwd: shellLaunchConfig.cwd,
                });
                const instanceHost = resolvedLocation === terminal_1.TerminalLocation.Editor ? this._terminalEditorService : this._terminalGroupService;
                const instance = instanceHost.instances[instanceHost.instances.length - 1];
                await instance?.focusWhenReady();
                this._terminalHasBeenCreated.set(true);
                return instance;
            }
            if (!shellLaunchConfig.customPtyImplementation && !this.isProcessSupportRegistered) {
                throw new Error('Could not create terminal when process support is not registered');
            }
            if (shellLaunchConfig.hideFromUser) {
                const instance = this._terminalInstanceService.createInstance(shellLaunchConfig, terminal_1.TerminalLocation.Panel);
                this._backgroundedTerminalInstances.push(instance);
                this._backgroundedTerminalDisposables.set(instance.instanceId, [
                    instance.onDisposed(this._onDidDisposeInstance.fire, this._onDidDisposeInstance)
                ]);
                this._terminalHasBeenCreated.set(true);
                return instance;
            }
            this._evaluateLocalCwd(shellLaunchConfig);
            const location = await this.resolveLocation(options?.location) || this.defaultLocation;
            const parent = await this._getSplitParent(options?.location);
            this._terminalHasBeenCreated.set(true);
            if (parent) {
                return this._splitTerminal(shellLaunchConfig, location, parent);
            }
            return this._createTerminal(shellLaunchConfig, location, options);
        }
        async _getContributedProfile(shellLaunchConfig, options) {
            if (options?.config && 'extensionIdentifier' in options.config) {
                return options.config;
            }
            return this._terminalProfileService.getContributedDefaultProfile(shellLaunchConfig);
        }
        async createDetachedTerminal(options) {
            const ctor = await terminalInstance_1.TerminalInstance.getXtermConstructor(this._keybindingService, this._contextKeyService);
            const xterm = this._instantiationService.createInstance(xtermTerminal_1.XtermTerminal, ctor, this._configHelper, options.cols, options.rows, options.colorProvider, options.capabilities || new terminalCapabilityStore_1.TerminalCapabilityStore(), '', false);
            if (options.readonly) {
                xterm.raw.attachCustomKeyEventHandler(() => false);
            }
            const instance = new detachedTerminal_1.DetachedTerminal(xterm, options, this._instantiationService);
            this._detachedXterms.add(instance);
            const l = xterm.onDidDispose(() => {
                this._detachedXterms.delete(instance);
                l.dispose();
            });
            return instance;
        }
        async _resolveCwd(shellLaunchConfig, splitActiveTerminal, options) {
            const cwd = shellLaunchConfig.cwd;
            if (!cwd) {
                if (options?.cwd) {
                    shellLaunchConfig.cwd = options.cwd;
                }
                else if (splitActiveTerminal && options?.location) {
                    let parent = this.activeInstance;
                    if (typeof options.location === 'object' && 'parentTerminal' in options.location) {
                        parent = await options.location.parentTerminal;
                    }
                    if (!parent) {
                        throw new Error('Cannot split without an active instance');
                    }
                    shellLaunchConfig.cwd = await (0, terminalActions_1.getCwdForSplit)(this.configHelper, parent, this._workspaceContextService.getWorkspace().folders, this._commandService);
                }
            }
        }
        _splitTerminal(shellLaunchConfig, location, parent) {
            let instance;
            // Use the URI from the base instance if it exists, this will correctly split local terminals
            if (typeof shellLaunchConfig.cwd !== 'object' && typeof parent.shellLaunchConfig.cwd === 'object') {
                shellLaunchConfig.cwd = uri_1.URI.from({
                    scheme: parent.shellLaunchConfig.cwd.scheme,
                    authority: parent.shellLaunchConfig.cwd.authority,
                    path: shellLaunchConfig.cwd || parent.shellLaunchConfig.cwd.path
                });
            }
            if (location === terminal_1.TerminalLocation.Editor || parent.target === terminal_1.TerminalLocation.Editor) {
                instance = this._terminalEditorService.splitInstance(parent, shellLaunchConfig);
            }
            else {
                const group = this._terminalGroupService.getGroupForInstance(parent);
                if (!group) {
                    throw new Error(`Cannot split a terminal without a group ${parent}`);
                }
                shellLaunchConfig.parentTerminalId = parent.instanceId;
                instance = group.split(shellLaunchConfig);
            }
            this._addToReconnected(instance);
            return instance;
        }
        _addToReconnected(instance) {
            if (!instance.reconnectionProperties?.ownerId) {
                return;
            }
            const reconnectedTerminals = this._reconnectedTerminals.get(instance.reconnectionProperties.ownerId);
            if (reconnectedTerminals) {
                reconnectedTerminals.push(instance);
            }
            else {
                this._reconnectedTerminals.set(instance.reconnectionProperties.ownerId, [instance]);
            }
        }
        _createTerminal(shellLaunchConfig, location, options) {
            let instance;
            const editorOptions = this._getEditorOptions(options?.location);
            if (location === terminal_1.TerminalLocation.Editor) {
                instance = this._terminalInstanceService.createInstance(shellLaunchConfig, terminal_1.TerminalLocation.Editor);
                this._terminalEditorService.openEditor(instance, editorOptions);
            }
            else {
                // TODO: pass resource?
                const group = this._terminalGroupService.createGroup(shellLaunchConfig);
                instance = group.terminalInstances[0];
            }
            this._addToReconnected(instance);
            return instance;
        }
        async resolveLocation(location) {
            if (location && typeof location === 'object') {
                if ('parentTerminal' in location) {
                    // since we don't set the target unless it's an editor terminal, this is necessary
                    const parentTerminal = await location.parentTerminal;
                    return !parentTerminal.target ? terminal_1.TerminalLocation.Panel : parentTerminal.target;
                }
                else if ('viewColumn' in location) {
                    return terminal_1.TerminalLocation.Editor;
                }
                else if ('splitActiveTerminal' in location) {
                    // since we don't set the target unless it's an editor terminal, this is necessary
                    return !this._activeInstance?.target ? terminal_1.TerminalLocation.Panel : this._activeInstance?.target;
                }
            }
            return location;
        }
        async _getSplitParent(location) {
            if (location && typeof location === 'object' && 'parentTerminal' in location) {
                return location.parentTerminal;
            }
            else if (location && typeof location === 'object' && 'splitActiveTerminal' in location) {
                return this.activeInstance;
            }
            return undefined;
        }
        _getEditorOptions(location) {
            if (location && typeof location === 'object' && 'viewColumn' in location) {
                location.viewColumn = (0, editorGroupColumn_1.columnToEditorGroup)(this._editorGroupsService, this._configurationService, location.viewColumn);
                return location;
            }
            return undefined;
        }
        _evaluateLocalCwd(shellLaunchConfig) {
            // Add welcome message and title annotation for local terminals launched within remote or
            // virtual workspaces
            if (typeof shellLaunchConfig.cwd !== 'string' && shellLaunchConfig.cwd?.scheme === network_1.Schemas.file) {
                if (contextkeys_1.VirtualWorkspaceContext.getValue(this._contextKeyService)) {
                    shellLaunchConfig.initialText = (0, terminalStrings_1.formatMessageForTerminal)(nls.localize('localTerminalVirtualWorkspace', "This shell is open to a {0}local{1} folder, NOT to the virtual folder", '\x1b[3m', '\x1b[23m'), { excludeLeadingNewLine: true, loudFormatting: true });
                    shellLaunchConfig.type = 'Local';
                }
                else if (this._remoteAgentService.getConnection()) {
                    shellLaunchConfig.initialText = (0, terminalStrings_1.formatMessageForTerminal)(nls.localize('localTerminalRemote', "This shell is running on your {0}local{1} machine, NOT on the connected remote machine", '\x1b[3m', '\x1b[23m'), { excludeLeadingNewLine: true, loudFormatting: true });
                    shellLaunchConfig.type = 'Local';
                }
            }
        }
        _showBackgroundTerminal(instance) {
            this._backgroundedTerminalInstances.splice(this._backgroundedTerminalInstances.indexOf(instance), 1);
            const disposables = this._backgroundedTerminalDisposables.get(instance.instanceId);
            if (disposables) {
                (0, lifecycle_1.dispose)(disposables);
            }
            this._backgroundedTerminalDisposables.delete(instance.instanceId);
            instance.shellLaunchConfig.hideFromUser = false;
            this._terminalGroupService.createGroup(instance);
            // Make active automatically if it's the first instance
            if (this.instances.length === 1) {
                this._terminalGroupService.setActiveInstanceByIndex(0);
            }
            this._onDidChangeInstances.fire();
        }
        async setContainers(panelContainer, terminalContainer) {
            this._configHelper.panelContainer = panelContainer;
            this._terminalGroupService.setContainer(terminalContainer);
        }
        getEditingTerminal() {
            return this._editingTerminal;
        }
        setEditingTerminal(instance) {
            this._editingTerminal = instance;
        }
        createOnInstanceEvent(getEvent) {
            return this._register(new event_1.DynamicListEventMultiplexer(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, getEvent)).event;
        }
        createOnInstanceCapabilityEvent(capabilityId, getEvent) {
            return (0, terminalEvents_1.createInstanceCapabilityEventMultiplexer)(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, capabilityId, getEvent);
        }
    };
    exports.TerminalService = TerminalService;
    __decorate([
        decorators_1.memoize
    ], TerminalService.prototype, "onAnyInstanceDataInput", null);
    __decorate([
        decorators_1.memoize
    ], TerminalService.prototype, "onAnyInstanceIconChange", null);
    __decorate([
        decorators_1.memoize
    ], TerminalService.prototype, "onAnyInstanceMaximumDimensionsChange", null);
    __decorate([
        decorators_1.memoize
    ], TerminalService.prototype, "onAnyInstancePrimaryStatusChange", null);
    __decorate([
        decorators_1.memoize
    ], TerminalService.prototype, "onAnyInstanceProcessIdReady", null);
    __decorate([
        decorators_1.memoize
    ], TerminalService.prototype, "onAnyInstanceSelectionChange", null);
    __decorate([
        decorators_1.memoize
    ], TerminalService.prototype, "onAnyInstanceTitleChange", null);
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TerminalService.prototype, "_saveState", null);
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TerminalService.prototype, "_updateTitle", null);
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TerminalService.prototype, "_updateIcon", null);
    exports.TerminalService = TerminalService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, lifecycle_2.ILifecycleService),
        __param(2, terminal_1.ITerminalLogService),
        __param(3, dialogs_1.IDialogService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, remoteAgentService_1.IRemoteAgentService),
        __param(6, viewsService_1.IViewsService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, terminal_2.ITerminalEditorService),
        __param(10, terminal_2.ITerminalGroupService),
        __param(11, terminal_2.ITerminalInstanceService),
        __param(12, editorGroupsService_1.IEditorGroupsService),
        __param(13, terminal_3.ITerminalProfileService),
        __param(14, extensions_1.IExtensionService),
        __param(15, notification_1.INotificationService),
        __param(16, workspace_1.IWorkspaceContextService),
        __param(17, commands_1.ICommandService),
        __param(18, keybinding_1.IKeybindingService),
        __param(19, timerService_1.ITimerService)
    ], TerminalService);
    let TerminalEditorStyle = class TerminalEditorStyle extends themeService_1.Themable {
        constructor(container, _terminalService, _themeService, _terminalProfileService, _editorService) {
            super(_themeService);
            this._terminalService = _terminalService;
            this._themeService = _themeService;
            this._terminalProfileService = _terminalProfileService;
            this._editorService = _editorService;
            this._registerListeners();
            this._styleElement = dom.createStyleSheet(container);
            this._register((0, lifecycle_1.toDisposable)(() => container.removeChild(this._styleElement)));
            this.updateStyles();
        }
        _registerListeners() {
            this._register(this._terminalService.onAnyInstanceIconChange(() => this.updateStyles()));
            this._register(this._terminalService.onDidCreateInstance(() => this.updateStyles()));
            this._register(this._editorService.onDidActiveEditorChange(() => {
                if (this._editorService.activeEditor instanceof terminalEditorInput_1.TerminalEditorInput) {
                    this.updateStyles();
                }
            }));
            this._register(this._editorService.onDidCloseEditor(() => {
                if (this._editorService.activeEditor instanceof terminalEditorInput_1.TerminalEditorInput) {
                    this.updateStyles();
                }
            }));
            this._register(this._terminalProfileService.onDidChangeAvailableProfiles(() => this.updateStyles()));
        }
        updateStyles() {
            super.updateStyles();
            const colorTheme = this._themeService.getColorTheme();
            // TODO: add a rule collector to avoid duplication
            let css = '';
            const productIconTheme = this._themeService.getProductIconTheme();
            // Add icons
            for (const instance of this._terminalService.instances) {
                const icon = instance.icon;
                if (!icon) {
                    continue;
                }
                let uri = undefined;
                if (icon instanceof uri_1.URI) {
                    uri = icon;
                }
                else if (icon instanceof Object && 'light' in icon && 'dark' in icon) {
                    uri = colorTheme.type === theme_1.ColorScheme.LIGHT ? icon.light : icon.dark;
                }
                const iconClasses = (0, terminalIcon_1.getUriClasses)(instance, colorTheme.type);
                if (uri instanceof uri_1.URI && iconClasses && iconClasses.length > 1) {
                    css += (`.monaco-workbench .terminal-tab.${iconClasses[0]}::before` +
                        `{background-image: ${dom.asCSSUrl(uri)};}`);
                }
                if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                    const iconRegistry = (0, iconRegistry_1.getIconRegistry)();
                    const iconContribution = iconRegistry.getIcon(icon.id);
                    if (iconContribution) {
                        const def = productIconTheme.getIcon(iconContribution);
                        if (def) {
                            css += (`.monaco-workbench .terminal-tab.codicon-${icon.id}::before` +
                                `{content: '${def.fontCharacter}' !important; font-family: ${dom.asCSSPropertyValue(def.font?.id ?? 'codicon')} !important;}`);
                        }
                    }
                }
            }
            // Add colors
            const iconForegroundColor = colorTheme.getColor(colorRegistry_1.iconForeground);
            if (iconForegroundColor) {
                css += `.monaco-workbench .show-file-icons .file-icon.terminal-tab::before { color: ${iconForegroundColor}; }`;
            }
            css += (0, terminalIcon_1.getColorStyleContent)(colorTheme, true);
            this._styleElement.textContent = css;
        }
    };
    TerminalEditorStyle = __decorate([
        __param(1, terminal_2.ITerminalService),
        __param(2, themeService_1.IThemeService),
        __param(3, terminal_3.ITerminalProfileService),
        __param(4, editorService_1.IEditorService)
    ], TerminalEditorStyle);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwRHpGLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsc0JBQVU7UUF1QjlDLElBQUksMEJBQTBCLEtBQWMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUc1RixJQUFJLGVBQWUsS0FBOEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBR2hGLElBQUksYUFBYSxLQUFvQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUdwRSxJQUFJLGtCQUFrQixLQUFhLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUVyRSxJQUFJLFlBQVksS0FBNEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUN4RSxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzRixDQUFDO1FBQ0QsSUFBSSxpQkFBaUI7WUFDcEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFLRCx1QkFBdUIsQ0FBQyxpQkFBeUI7WUFDaEQsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVELElBQUksZUFBZSxLQUF1QixPQUFPLElBQUksQ0FBQyxZ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
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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/json", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/parsers", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/severity", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/markers/common/markers", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/workbench/services/extensions/common/extensions", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/editor/common/services/model", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/markers/common/markers", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/output/common/output", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/tasks/common/taskSystem", "vs/workbench/contrib/tasks/common/taskTemplates", "../common/taskConfiguration", "./terminalTaskSystem", "vs/platform/quickinput/common/quickInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/jsonFormatter", "vs/base/common/network", "vs/base/common/themables", "vs/editor/common/services/resolverService", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/contextkeys", "vs/workbench/common/editor", "vs/workbench/common/views", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/tasks/browser/taskQuickPick", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/path/common/pathService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, actions_1, event_1, glob, json, lifecycle_1, map_1, Objects, parsers_1, Platform, resources, severity_1, Types, uri_1, UUID, nls, commands_1, configuration_1, files_1, markers_1, progress_1, storage_1, telemetry_1, problemMatcher_1, extensions_1, dialogs_1, notification_1, opener_1, model_1, workspace_1, markers_2, configurationResolver_1, editorService_1, output_1, textfiles_1, terminal_1, terminal_2, tasks_1, taskService_1, taskSystem_1, taskTemplates_1, TaskConfig, terminalTaskSystem_1, quickInput_1, contextkey_1, taskDefinitionRegistry_1, async_1, cancellation_1, jsonFormatter_1, network_1, themables_1, resolverService_1, instantiation_1, log_1, terminal_3, themeService_1, workspaceTrust_1, contextkeys_1, editor_1, views_1, viewsService_1, taskQuickPick_1, environmentService_1, lifecycle_2, panecomposite_1, pathService_1, preferences_1, remoteAgentService_1) {
    "use strict";
    var AbstractTaskService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractTaskService = exports.ConfigureTaskAction = void 0;
    const QUICKOPEN_HISTORY_LIMIT_CONFIG = 'task.quickOpen.history';
    const PROBLEM_MATCHER_NEVER_CONFIG = 'task.problemMatchers.neverPrompt';
    const USE_SLOW_PICKER = 'task.quickOpen.showAll';
    var ConfigureTaskAction;
    (function (ConfigureTaskAction) {
        ConfigureTaskAction.ID = 'workbench.action.tasks.configureTaskRunner';
        ConfigureTaskAction.TEXT = nls.localize('ConfigureTaskRunnerAction.label', "Configure Task");
    })(ConfigureTaskAction || (exports.ConfigureTaskAction = ConfigureTaskAction = {}));
    class ProblemReporter {
        constructor(_outputChannel) {
            this._outputChannel = _outputChannel;
            this._validationStatus = new parsers_1.ValidationStatus();
        }
        info(message) {
            this._validationStatus.state = 1 /* ValidationState.Info */;
            this._outputChannel.append(message + '\n');
        }
        warn(message) {
            this._validationStatus.state = 2 /* ValidationState.Warning */;
            this._outputChannel.append(message + '\n');
        }
        error(message) {
            this._validationStatus.state = 3 /* ValidationState.Error */;
            this._outputChannel.append(message + '\n');
        }
        fatal(message) {
            this._validationStatus.state = 4 /* ValidationState.Fatal */;
            this._outputChannel.append(message + '\n');
        }
        get status() {
            return this._validationStatus;
        }
    }
    class TaskMap {
        constructor() {
            this._store = new Map();
        }
        forEach(callback) {
            this._store.forEach(callback);
        }
        static getKey(workspaceFolder) {
            let key;
            if (Types.isString(workspaceFolder)) {
                key = workspaceFolder;
            }
            else {
                const uri = (0, taskQuickPick_1.isWorkspaceFolder)(workspaceFolder) ? workspaceFolder.uri : workspaceFolder.configuration;
                key = uri ? uri.toString() : '';
            }
            return key;
        }
        get(workspaceFolder) {
            const key = TaskMap.getKey(workspaceFolder);
            let result = this._store.get(key);
            if (!result) {
                result = [];
                this._store.set(key, result);
            }
            return result;
        }
        add(workspaceFolder, ...task) {
            const key = TaskMap.getKey(workspaceFolder);
            let values = this._store.get(key);
            if (!values) {
                values = [];
                this._store.set(key, values);
            }
            values.push(...task);
        }
        all() {
            const result = [];
            this._store.forEach((values) => result.push(...values));
            return result;
        }
    }
    let AbstractTaskService = class AbstractTaskService extends lifecycle_1.Disposable {
        static { AbstractTaskService_1 = this; }
        // private static autoDetectTelemetryName: string = 'taskServer.autoDetect';
        static { this.RecentlyUsedTasks_Key = 'workbench.tasks.recentlyUsedTasks'; }
        static { this.RecentlyUsedTasks_KeyV2 = 'workbench.tasks.recentlyUsedTasks2'; }
        static { this.PersistentTasks_Key = 'workbench.tasks.persistentTasks'; }
        static { this.IgnoreTask010DonotShowAgain_key = 'workbench.tasks.ignoreTask010Shown'; }
        static { this.OutputChannelId = 'tasks'; }
        static { this.OutputChannelLabel = nls.localize('tasks', "Tasks"); }
        static { this._nextHandle = 0; }
        get isReconnected() { return this._tasksReconnected; }
        constructor(_configurationService, _markerService, _outputService, _paneCompositeService, _viewsService, _commandService, _editorService, _fileService, _contextService, _telemetryService, _textFileService, _modelService, _extensionService, _quickInputService, _configurationResolverService, _terminalService, _terminalGroupService, _storageService, _progressService, _openerService, _dialogService, _notificationService, _contextKeyService, _environmentService, _terminalProfileResolverService, _pathService, _textModelResolverService, _preferencesService, _viewDescriptorService, _workspaceTrustRequestService, _workspaceTrustManagementService, _logService, _themeService, _lifecycleService, remoteAgentService, _instantiationService) {
            super();
            this._configurationService = _configurationService;
            this._markerService = _markerService;
            this._outputService = _outputService;
            this._paneCompositeService = _paneCompositeService;
            this._viewsService = _viewsService;
            this._commandService = _commandService;
            this._editorService = _editorService;
            this._fileService = _fileService;
            this._contextService = _contextService;
            this._telemetryService = _telemetryService;
            this._textFileService = _textFileService;
            this._modelService = _modelService;
            this._extensionService = _extensionService;
            this._quickInputService = _quickInputService;
            this._configurationResolverService = _configurationResolverService;
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._storageService = _storageService;
            this._progressService = _progressService;
            this._openerService = _openerService;
            this._dialogService = _dialogService;
            this._notificationService = _notificationService;
            this._contextKeyService = _contextKeyService;
            this._environmentService = _environmentService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._pathService = _pathService;
            this._textModelResolverService = _textModelResolverService;
            this._preferencesService = _preferencesService;
            this._viewDescriptorService = _viewDescriptorService;
            this._workspaceTrustRequestService = _workspaceTrustRequestService;
            this._workspaceTrustManagementService = _workspaceTrustManagementService;
            this._logService = _logService;
            this._themeService = _themeService;
            this._lifecycleService = _lifecycleService;
            this._instantiationService = _instantiationService;
            this._tasksReconnected = false;
            this._taskSystemListeners = [];
            this._onDidRegisterSupportedExecutions = new event_1.Emitter();
            this._onDidRegisterAllSupportedExecutions = new event_1.Emitter();
            this._onDidChangeTaskSystemInfo = new event_1.Emitter();
            this._willRestart = false;
            this.onDidChangeTaskSystemInfo = this._onDidChangeTaskSystemInfo.event;
            this._onDidReconnectToTasks = new event_1.Emitter();
            this.onDidReconnectToTasks = this._onDidReconnectToTasks.event;
            this._whenTaskSystemReady = event_1.Event.toPromise(this.onDidChangeTaskSystemInfo);
            this._workspaceTasksPromise = undefined;
            this._taskSystem = undefined;
            this._taskSystemListeners = undefined;
            this._outputChannel = this._outputService.getChannel(AbstractTaskService_1.OutputChannelId);
            this._providers = new Map();
            this._providerTypes = new Map();
            this._taskSystemInfos = new Map();
            this._register(this._contextService.onDidChangeWorkspaceFolders(() => {
                const folderSetup = this._computeWorkspaceFolderSetup();
                if (this.executionEngine !== folderSetup[2]) {
                    this._disposeTaskSystemListeners();
                    this._taskSystem = undefined;
                }
                this._updateSetup(folderSetup);
                return this._updateWorkspaceTasks(2 /* TaskRunSource.FolderOpen */);
            }));
            this._register(this._configurationService.onDidChangeConfiguration((e) => {
                if (!e.affectsConfiguration('tasks') || (!this._taskSystem && !this._workspaceTasksPromise)) {
                    return;
                }
                if (!this._taskSystem || this._taskSystem instanceof terminalTaskSystem_1.TerminalTaskSystem) {
                    this._outputChannel.clear();
                }
                if (e.affectsConfiguration("task.reconnection" /* TaskSettingId.Reconnection */)) {
                    if (!this._configurationService.getValue("task.reconnection" /* TaskSettingId.Reconnection */)) {
                        this._persistentTasks?.clear();
                        this._storageService.remove(AbstractTaskService_1.PersistentTasks_Key, 1 /* StorageScope.WORKSPACE */);
                    }
                }
                this._setTaskLRUCacheLimit();
                return this._updateWorkspaceTasks(3 /* TaskRunSource.ConfigurationChange */);
            }));
            this._taskRunningState = tasks_1.TASK_RUNNING_STATE.bindTo(_contextKeyService);
            this._onDidStateChange = this._register(new event_1.Emitter());
            this._registerCommands().then(() => taskService_1.TaskCommandsRegistered.bindTo(this._contextKeyService).set(true));
            taskService_1.ServerlessWebContext.bindTo(this._contextKeyService).set(Platform.isWeb && !remoteAgentService.getConnection()?.remoteAuthority);
            this._configurationResolverService.contributeVariable('defaultBuildTask', async () => {
                let tasks = await this._getTasksForGroup(tasks_1.TaskGroup.Build);
                if (tasks.length > 0) {
                    const defaults = this._getDefaultTasks(tasks);
                    if (defaults.length === 1) {
                        return defaults[0]._label;
                    }
                    else if (defaults.length) {
                        tasks = defaults;
                    }
                }
                let entry;
                if (tasks && tasks.length > 0) {
                    entry = await this._showQuickPick(tasks, nls.localize('TaskService.pickBuildTaskForLabel', 'Select the build task (there is no default build task defined)'));
                }
                const task = entry ? entry.task : undefined;
                if (!task) {
                    return undefined;
                }
                return task._label;
            });
            this._lifecycleService.onBeforeShutdown(e => {
                this._willRestart = e.reason !== 3 /* ShutdownReason.RELOAD */;
            });
            this._register(this.onDidStateChange(e => {
                this._log(nls.localize('taskEvent', 'Task Event kind: {0}', e.kind), true);
                if (e.kind === "changed" /* TaskEventKind.Changed */) {
                    // no-op
                }
                else if ((this._willRestart || (e.kind === "terminated" /* TaskEventKind.Terminated */ && e.exitReason === terminal_3.TerminalExitReason.User)) && e.taskId) {
                    const key = e.__task.getKey();
                    if (key) {
                        this.removePersistentTask(key);
                    }
                }
                else if (e.kind === "start" /* TaskEventKind.Start */ && e.__task && e.__task.getWorkspaceFolder()) {
                    this._setPersistentTask(e.__task);
                }
            }));
            this._waitForAllSupportedExecutions = new Promise(resolve => {
                event_1.Event.once(this._onDidRegisterAllSupportedExecutions.event)(() => resolve());
            });
            if (this._terminalService.getReconnectedTerminals('Task')?.length) {
                this._attemptTaskReconnection();
            }
            else {
                this._terminalService.whenConnected.then(() => {
                    if (this._terminalService.getReconnectedTerminals('Task')?.length) {
                        this._attemptTaskReconnection();
                    }
                    else {
                        this._tasksReconnected = true;
                        this._onDidReconnectToTasks.fire();
                    }
                });
            }
            this._upgrade();
        }
        registerSupportedExecutions(custom, shell, process) {
            if (custom !== undefined) {
                const customContext = taskService_1.CustomExecutionSupportedContext.bindTo(this._contextKeyService);
                customContext.set(custom);
            }
            const isVirtual = !!contextkeys_1.VirtualWorkspaceContext.getValue(this._contextKeyService);
            if (shell !== undefined) {
                const shellContext = taskService_1.ShellExecutionSupportedContext.bindTo(this._contextKeyService);
                shellContext.set(shell && !isVirtual);
            }
            if (process !== undefined) {
                const processContext = taskService_1.ProcessExecutionSupportedContext.bindTo(this._contextKeyService);
                processContext.set(process && !isVirtual);
            }
            // update tasks so an incomplete list isn't returned when getWorkspaceTasks is called
            this._workspaceTasksPromise = undefined;
            this._onDidRegisterSupportedExecutions.fire();
            if (custom && shell && process) {
                this._onDidRegisterAllSupportedExecutions.fire();
            }
        }
        _attemptTaskReconnection() {
            if (this._lifecycleService.startupKind !== 3 /* StartupKind.ReloadedWindow */) {
                this._log(nls.localize('TaskService.skippingReconnection', 'Startup kind not window reload, setting connected and removing persistent tasks'), true);
                this._tasksReconnected = true;
                this._storageService.remove(AbstractTaskService_1.PersistentTasks_Key, 1 /* StorageScope.WORKSPACE */);
            }
            if (!this._configurationService.getValue("task.reconnection" /* TaskSettingId.Reconnection */) || this._tasksReconnected) {
                this._log(nls.localize('TaskService.notConnecting', 'Setting tasks connected configured value {0}, tasks were already reconnected {1}', this._configurationService.getValue("task.reconnection" /* TaskSettingId.Reconnection */), this._tasksReconnected), true);
                this._tasksReconnected = true;
                return;
            }
            this._log(nls.localize('TaskService.reconnecting', 'Reconnecting to running tasks...'), true);
            this.getWorkspaceTasks(4 /* TaskRunSource.Reconnect */).then(async () => {
                this._tasksReconnected = await this._reconnectTasks();
                this._log(nls.localize('TaskService.reconnected', 'Reconnected to running tasks.'), true);
                this._onDidReconnectToTasks.fire();
            });
        }
        async _reconnectTasks() {
            const tasks = await this.getSavedTasks('persistent');
            if (!tasks.length) {
                this._log(nls.localize('TaskService.noTasks', 'No persistent tasks to reconnect.'), true);
                return true;
            }
            const taskLabels = tasks.map(task => task._label).join(', ');
            this._log(nls.localize('TaskService.reconnectingTasks', 'Reconnecting to {0} tasks...', taskLabels), true);
            for (const task of tasks) {
                if (tasks_1.ConfiguringTask.is(task)) {
                    const resolved = await this.tryResolveTask(task);
                    if (resolved) {
                        this.run(resolved, undefined, 4 /* TaskRunSource.Reconnect */);
                    }
                }
                else {
                    this.run(task, undefined, 4 /* TaskRunSource.Reconnect */);
                }
            }
            return true;
        }
        get onDidStateChange() {
            return this._onDidStateChange.event;
        }
        get supportsMultipleTaskExecutions() {
            return this.inTerminal();
        }
        async _registerCommands() {
            commands_1.CommandsRegistry.registerCommand({
                id: 'workbench.action.tasks.runTask',
                handler: async (accessor, arg) => {
                    if (await this._trust()) {
                        await this._runTaskCommand(arg);
                    }
                },
                metadata: {
                    description: 'Run Task',
                    args: [{
                            name: 'args',
                            isOptional: true,
                            description: nls.localize('runTask.arg', "Filters the tasks shown in the quickpick"),
                            schema: {
                                anyOf: [
                                    {
                                        type: 'string',
                                        description: nls.localize('runTask.label', "The task's label or a term to filter by")
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            type: {
                                                type: 'string',
                                                description: nls.localize('runTask.type', "The contributed task type")
                                            },
                                            task: {
                                                type: 'string',
                                                description: nls.localize('runTask.task', "The task's label or a term to filter by")
                                            }
                                        }
                                    }
                                ]
                            }
                        }]
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.reRunTask', async (accessor, arg) => {
                if (await this._trust()) {
                    this._reRunTaskCommand();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.restartTask', async (accessor, arg) => {
                if (await this._trust()) {
                    this._runRestartTaskCommand(arg);
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.terminate', async (accessor, arg) => {
                if (await this._trust()) {
                    this._runTerminateCommand(arg);
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.showLog', () => {
                this._showOutput(undefined, true);
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.build', async () => {
                if (await this._trust()) {
                    this._runBuildCommand();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.test', async () => {
                if (await this._trust()) {
                    this._runTestCommand();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.configureTaskRunner', async () => {
                if (await this._trust()) {
                    this._runConfigureTasks();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.configureDefaultBuildTask', async () => {
                if (await this._trust()) {
                    this._runConfigureDefaultBuildTask();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.configureDefaultTestTask', async () => {
                if (await this._trust()) {
                    this._runConfigureDefaultTestTask();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.showTasks', async () => {
                if (await this._trust()) {
                    return this.runShowTasks();
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.toggleProblems', () => this._commandService.executeCommand(markers_2.Markers.TOGGLE_MARKERS_VIEW_ACTION_ID));
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.openUserTasks', async () => {
                const resource = this._getResourceForKind(tasks_1.TaskSourceKind.User);
                if (resource) {
                    this._openTaskFile(resource, tasks_1.TaskSourceKind.User);
                }
            });
            commands_1.CommandsRegistry.registerCommand('workbench.action.tasks.openWorkspaceFileTasks', async () => {
                const resource = this._getResourceForKind(tasks_1.TaskSourceKind.WorkspaceFile);
                if (resource) {
                    this._openTaskFile(resource, tasks_1.TaskSourceKind.WorkspaceFile);
                }
            });
        }
        get workspaceFolders() {
            if (!this._workspaceFolders) {
                this._updateSetup();
            }
            return this._workspaceFolders;
        }
        get ignoredWorkspaceFolders() {
            if (!this._ignoredWorkspaceFolders) {
                this._updateSetup();
            }
            return this._ignoredWorkspaceFolders;
        }
        get executionEngine() {
            if (this._executionEngine === undefined) {
                this._updateSetup();
            }
            return this._executionEngine;
        }
        get schemaVersion() {
            if (this._schemaVersion === undefined) {
                this._updateSetup();
            }
            return this._schemaVersion;
        }
        get showIgnoreMessage() {
            if (this._showIgnoreMessage === undefined) {
                this._showIgnoreMessage = !this._storageService.getBoolean(AbstractTaskService_1.IgnoreTask010DonotShowAgain_key, 1 /* StorageScope.WORKSPACE */, false);
            }
            return this._showIgnoreMessage;
        }
        _getActivationEvents(type) {
            const result = [];
            result.push('onCommand:workbench.action.tasks.runTask');
            if (type) {
                // send a specific activation event for this task type
                result.push(`onTaskType:${type}`);
            }
            else {
                // send activation events for all task types
                for (const definition of taskDefinitionRegistry_1.TaskDefinitionRegistry.all()) {
                    result.push(`onTaskType:${definition.taskType}`);
                }
            }
            return result;
        }
        async _activateTaskProviders(type) {
            // We need to first wait for extensions to be registered because we might read
            // the `TaskDefinitionRegistry` in case `type` is `undefined`
            await this._extensionService.whenInstalledExtensionsRegistered();
            await (0, async_1.raceTimeout)(Promise.all(this._getActivationEvents(type).map(activationEvent => this._extensionService.activateByEvent(activationEvent))), 5000, () => console.warn('Timed out activating extensions for task providers'));
        }
        _updateSetup(setup) {
            if (!setup) {
                setup = this._computeWorkspaceFolderSetup();
            }
            this._workspaceFolders = setup[0];
            if (this._ignoredWorkspaceFolders) {
                if (this._ignoredWorkspaceFolders.length !== setup[1].length) {
                    this._showIgnoreMessage = undefined;
                }
                else {
                    const set = new Set();
                    this._ignoredWorkspaceFolders.forEach(folder => set.add(folder.uri.toString()));
                    for (const folder of setup[1]) {
                        if (!set.has(folder.uri.toString())) {
                            this._showIgnoreMessage = undefined;
                            break;
                        }
                    }
                }
            }
            this._ignoredWorkspaceFolders = setup[1];
            this._executionEngine = setup[2];
            this._schemaVersion = setup[3];
            this._workspace = setup[4];
        }
        _showOutput(runSource = 1 /* TaskRunSource.User */, userRequested) {
            if (!contextkeys_1.VirtualWorkspaceContext.getValue(this._contextKeyService) && ((runSource === 1 /* TaskRunSource.User */) || (runSource === 3 /* TaskRunSource.ConfigurationChange */))) {
                if (userRequested) {
                    this._outputService.showChannel(this._outputChannel.id, true);
                }
                else {
                    this._notificationService.prompt(severity_1.default.Warning, nls.localize('taskServiceOutputPrompt', 'There are task errors. See the output for details.'), [{
                            label: nls.localize('showOutput', "Show output"),
                            run: () => {
                                this._outputService.showChannel(this._outputChannel.id, true);
                            }
                        }]);
                }
            }
        }
        _disposeTaskSystemListeners() {
            if (this._taskSystemListeners) {
                (0, lifecycle_1.dispose)(this._taskSystemListeners);
                this._taskSystemListeners = undefined;
            }
        }
        registerTaskProvider(provider, type) {
            if (!provider) {
                return {
                    dispose: () => { }
                };
            }
            const handle = AbstractTaskService_1._nextHandle++;
            this._providers.set(handle, provider);
            this._providerTypes.set(handle, type);
            return {
                dispose: () => {
                    this._providers.delete(handle);
                    this._providerTypes.delete(handle);
                }
            };
        }
        get hasTaskSystemInfo() {
            const infosCount = Array.from(this._taskSystemInfos.values()).flat().length;
            // If there's a remoteAuthority, then we end up with 2 taskSystemInfos,
            // one for each extension host.
            if (this._environmentService.remoteAuthority) {
                return infosCount > 1;
            }
            return infosCount > 0;
        }
        registerTaskSystem(key, info) {
            // Ideally the Web caller of registerRegisterTaskSystem would use the correct key.
            // However, the caller doesn't know about the workspace folders at the time of the call, even though we know about them here.
            if (info.platform === 0 /* Platform.Platform.Web */) {
                key = this.workspaceFolders.length ? this.workspaceFolders[0].uri.scheme : key;
            }
            if (!this._taskSystemInfos.has(key)) {
                this._taskSystemInfos.set(key, [info]);
            }
            else {
                const infos = this._taskSystemInfos.get(key);
                if (info.platform === 0 /* Platform.Platform.Web */) {
                    // Web infos should be pushed last.
                    infos.push(info);
                }
                else {
                    infos.unshift(info);
                }
            }
            if (this.hasTaskSystemInfo) {
                this._onDidChangeTaskSystemInfo.fire();
            }
        }
        _getTaskSystemInfo(key) {
            const infos = this._taskSystemInfos.get(key);
            return (infos && infos.length) ? infos[0] : undefined;
        }
        extensionCallbackTaskComplete(task, result) {
            if (!this._taskSystem) {
                return Promise.resolve();
            }
            return this._taskSystem.customExecutionComplete(task, result);
        }
        /**
         * Get a subset of workspace tasks that match a certain predicate.
         */
        async _findWorkspaceTasks(predicate) {
            const result = [];
            const tasks = await this.getWorkspaceTasks();
            for (const [, workspaceTasks] of tasks) {
                if (workspaceTasks.configurations) {
                    for (const taskName in workspaceTasks.configurations.byIdentifier) {
                        const task = workspaceTasks.configurations.byIdentifier[taskName];
                        if (predicate(task, workspaceTasks.workspaceFolder)) {
                            result.push(task);
                        }
                    }
                }
                if (workspaceTasks.set) {
                    for (const task of workspaceTasks.set.tasks) {
                        if (predicate(task, workspaceTasks.workspaceFolder)) {
                            result.push(task);
                        }
                    }
                }
            }
            return result;
        }
        async _findWorkspaceTasksInGroup(group, isDefault) {
            return this._findWorkspaceTasks((task) => {
                const taskGroup = task.configurationProperties.group;
                if (taskGroup && typeof taskGroup !== 'string') {
                    return (taskGroup._id === group._id && (!isDefault || !!taskGroup.isDefault));
                }
                return false;
            });
        }
        async getTask(folder, identifier, compareId = false, type = undefined) {
            if (!(await this._trust())) {
                return;
            }
            const name = Types.isString(folder) ? folder : (0, taskQuickPick_1.isWorkspaceFolder)(folder) ? folder.name : folder.configuration ? resources.basename(folder.configuration) : undefined;
            if (this.ignoredWorkspaceFolders.some(ignored => ignored.name === name)) {
                return Promise.reject(new Error(nls.localize('TaskServer.folderIgnored', 'The folder {0} is ignored since it uses task version 0.1.0', name)));
            }
            const key = !Types.isString(identifier)
                ? tasks_1.TaskDefinition.createTaskIdentifier(identifier, console)
                : identifier;
            if (key === undefined) {
                return Promise.resolve(undefined);
            }
            // Try to find the task in the workspace
            const requestedFolder = TaskMap.getKey(folder);
            const matchedTasks = await this._findWorkspaceTasks((task, workspaceFolder) => {
                const taskFolder = TaskMap.getKey(workspaceFolder);
                if (taskFolder !== requestedFolder && taskFolder !== tasks_1.USER_TASKS_GROUP_KEY) {
                    return false;
                }
                return task.matches(key, compareId);
            });
            matchedTasks.sort(task => task._source.kind === tasks_1.TaskSourceKind.Extension ? 1 : -1);
            if (matchedTasks.length > 0) {
                // Nice, we found a configured task!
                const task = matchedTasks[0];
                if (tasks_1.ConfiguringTask.is(task)) {
                    return this.tryResolveTask(task);
                }
                else {
                    return task;
                }
            }
            // We didn't find the task, so we need to ask all resolvers about it
            const map = await this._getGroupedTasks({ type });
            let values = map.get(folder);
            values = values.concat(map.get(tasks_1.USER_TASKS_GROUP_KEY));
            if (!values) {
                return undefined;
            }
            values = values.filter(task => task.matches(key, compareId)).sort(task => task._source.kind === tasks_1.TaskSourceKind.Extension ? 1 : -1);
            return values.length > 0 ? values[0] : undefined;
        }
        async tryResolveTask(configuringTask) {
            if (!(await this._trust())) {
                return;
            }
            await this._activateTaskProviders(configuringTask.type);
            let matchingProvider;
            let matchingProviderUnavailable = false;
            for (const [handle, provider] of this._providers) {
                const providerType = this._providerTypes.get(handle);
                if (configuringTask.type === providerType) {
                    if (providerType && !this._isTaskProviderEnabled(providerType)) {
                        matchingProviderUnavailable = true;
                        continue;
                    }
                    matchingProvider = provider;
                    break;
                }
            }
            if (!matchingProvider) {
                if (matchingProviderUnavailable) {
                    this._log(nls.localize('TaskService.providerUnavailable', 'Warning: {0} tasks are unavailable in the current environment.', configuringTask.configures.type));
                }
                return;
            }
            // Try to resolve the task first
            try {
                const resolvedTask = await matchingProvider.resolveTask(configuringTask);
                if (resolvedTask && (resolvedTask._id === configuringTask._id)) {
                    return TaskConfig.createCustomTask(resolvedTask, configuringTask);
                }
            }
            catch (error) {
                // Ignore errors. The task could not be provided by any of the providers.
            }
            // The task couldn't be resolved. Instead, use the less efficient provideTask.
            const tasks = await this.tasks({ type: configuringTask.type });
            for (const task of tasks) {
                if (task._id === configuringTask._id) {
                    return TaskConfig.createCustomTask(task, configuringTask);
                }
            }
            return;
        }
        async tasks(filter) {
            if (!(await this._trust())) {
                return [];
            }
            if (!this._versionAndEngineCompatible(filter)) {
                return Promise.resolve([]);
            }
            return this._getGroupedTasks(filter).then((map) => {
                if (!filter || !filter.type) {
                    return map.all();
                }
                const result = [];
                map.forEach((tasks) => {
                    for (const task of tasks) {
                        if (tasks_1.ContributedTask.is(task) && ((task.defines.type === filter.type) || (task._source.label === filter.type))) {
                            result.push(task);
                        }
                        else if (tasks_1.CustomTask.is(task)) {
                            if (task.type === filter.type) {
                                result.push(task);
                            }
                            else {
                                const customizes = task.customizes();
                                if (customizes && customizes.type === filter.type) {
                                    result.push(task);
                                }
                            }
                        }
                    }
                });
                return result;
            });
        }
        taskTypes() {
            const types = [];
            if (this._isProvideTasksEnabled()) {
                for (const definition of taskDefinitionRegistry_1.TaskDefinitionRegistry.all()) {
                    if (this._isTaskProviderEnabled(definition.taskType)) {
                        types.push(definition.taskType);
                    }
                }
            }
            return types;
        }
        createSorter() {
            return new tasks_1.TaskSorter(this._contextService.getWorkspace() ? this._contextService.getWorkspace().folders : []);
        }
        _isActive() {
            if (!this._taskSystem) {
                return Promise.resolve(false);
            }
            return this._taskSystem.isActive();
        }
        async getActiveTasks() {
            if (!this._taskSystem) {
                return [];
            }
            return this._taskSystem.getActiveTasks();
        }
        async getBusyTasks() {
            if (!this._taskSystem) {
                return [];
            }
            return this._taskSystem.getBusyTasks();
        }
        getRecentlyUsedTasksV1() {
            if (this._recentlyUsedTasksV1) {
                return this._recentlyUsedTasksV1;
            }
            const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            this._recentlyUsedTasksV1 = new map_1.LRUCache(quickOpenHistoryLimit);
            const storageValue = this._storageService.get(AbstractTaskService_1.RecentlyUsedTasks_Key, 1 /* StorageScope.WORKSPACE */);
            if (storageValue) {
                try {
                    const values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (const value of values) {
                            this._recentlyUsedTasksV1.set(value, value);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this._recentlyUsedTasksV1;
        }
        _getTasksFromStorage(type) {
            return type === 'persistent' ? this._getPersistentTasks() : this._getRecentTasks();
        }
        _getRecentTasks() {
            if (this._recentlyUsedTasks) {
                return this._recentlyUsedTasks;
            }
            const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            this._recentlyUsedTasks = new map_1.LRUCache(quickOpenHistoryLimit);
            const storageValue = this._storageService.get(AbstractTaskService_1.RecentlyUsedTasks_KeyV2, 1 /* StorageScope.WORKSPACE */);
            if (storageValue) {
                try {
                    const values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (const value of values) {
                            this._recentlyUsedTasks.set(value[0], value[1]);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this._recentlyUsedTasks;
        }
        _getPersistentTasks() {
            if (this._persistentTasks) {
                this._log(nls.localize('taskService.gettingCachedTasks', 'Returning cached tasks {0}', this._persistentTasks.size), true);
                return this._persistentTasks;
            }
            //TODO: should this # be configurable?
            this._persistentTasks = new map_1.LRUCache(10);
            const storageValue = this._storageService.get(AbstractTaskService_1.PersistentTasks_Key, 1 /* StorageScope.WORKSPACE */);
            if (storageValue) {
                try {
                    const values = JSON.parse(storageValue);
                    if (Array.isArray(values)) {
                        for (const value of values) {
                            this._persistentTasks.set(value[0], value[1]);
                        }
                    }
                }
                catch (error) {
                    // Ignore. We use the empty result
                }
            }
            return this._persistentTasks;
        }
        _getFolderFromTaskKey(key) {
            const keyValue = JSON.parse(key);
            return {
                folder: keyValue.folder, isWorkspaceFile: keyValue.id?.endsWith(tasks_1.TaskSourceKind.WorkspaceFile)
            };
        }
        async getSavedTasks(type) {
            const folderMap = Object.create(null);
            this.workspaceFolders.forEach(folder => {
                folderMap[folder.uri.toString()] = folder;
            });
            const folderToTasksMap = new Map();
            const workspaceToTaskMap = new Map();
            const storedTasks = this._getTasksFromStorage(type);
            const tasks = [];
            this._log(nls.localize('taskService.getSavedTasks', 'Fetching tasks from task storage.'), true);
            function addTaskToMap(map, folder, task) {
                if (folder && !map.has(folder)) {
                    map.set(folder, []);
                }
                if (folder && (folderMap[folder] || (folder === tasks_1.USER_TASKS_GROUP_KEY)) && task) {
                    map.get(folder).push(task);
                }
            }
            for (const entry of storedTasks.entries()) {
                try {
                    const key = entry[0];
                    const task = JSON.parse(entry[1]);
                    const folderInfo = this._getFolderFromTaskKey(key);
                    this._log(nls.localize('taskService.getSavedTasks.reading', 'Reading tasks from task storage, {0}, {1}, {2}', key, task, folderInfo.folder), true);
                    addTaskToMap(folderInfo.isWorkspaceFile ? workspaceToTaskMap : folderToTasksMap, folderInfo.folder, task);
                }
                catch (error) {
                    this._log(nls.localize('taskService.getSavedTasks.error', 'Fetching a task from task storage failed: {0}.', error), true);
                }
            }
            const readTasksMap = new Map();
            async function readTasks(that, map, isWorkspaceFile) {
                for (const key of map.keys()) {
                    const custom = [];
                    const customized = Object.create(null);
                    const taskConfigSource = (folderMap[key]
                        ? (isWorkspaceFile
                            ? TaskConfig.TaskConfigSource.WorkspaceFile : TaskConfig.TaskConfigSource.TasksJson)
                        : TaskConfig.TaskConfigSource.User);
                    await that._computeTasksForSingleConfig(folderMap[key] ?? await that._getAFolder(), {
                        version: '2.0.0',
                        tasks: map.get(key)
                    }, 0 /* TaskRunSource.System */, custom, customized, taskConfigSource, true);
                    custom.forEach(task => {
                        const taskKey = task.getKey();
                        if (taskKey) {
                            readTasksMap.set(taskKey, task);
                        }
                    });
                    for (const configuration in customized) {
                        const taskKey = customized[configuration].getKey();
                        if (taskKey) {
                            readTasksMap.set(taskKey, customized[configuration]);
                        }
                    }
                }
            }
            await readTasks(this, folderToTasksMap, false);
            await readTasks(this, workspaceToTaskMap, true);
            for (const key of storedTasks.keys()) {
                if (readTasksMap.has(key)) {
                    tasks.push(readTasksMap.get(key));
                    this._log(nls.localize('taskService.getSavedTasks.resolved', 'Resolved task {0}', key), true);
                }
                else {
                    this._log(nls.localize('taskService.getSavedTasks.unresolved', 'Unable to resolve task {0} ', key), true);
                }
            }
            return tasks;
        }
        removeRecentlyUsedTask(taskRecentlyUsedKey) {
            if (this._getTasksFromStorage('historical').has(taskRecentlyUsedKey)) {
                this._getTasksFromStorage('historical').delete(taskRecentlyUsedKey);
                this._saveRecentlyUsedTasks();
            }
        }
        removePersistentTask(key) {
            this._log(nls.localize('taskService.removePersistentTask', 'Removing persistent task {0}', key), true);
            if (this._getTasksFromStorage('persistent').has(key)) {
                this._getTasksFromStorage('persistent').delete(key);
                this._savePersistentTasks();
            }
        }
        _setTaskLRUCacheLimit() {
            const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            if (this._recentlyUsedTasks) {
                this._recentlyUsedTasks.limit = quickOpenHistoryLimit;
            }
        }
        async _setRecentlyUsedTask(task) {
            let key = task.getKey();
            if (!tasks_1.InMemoryTask.is(task) && key) {
                const customizations = this._createCustomizableTask(task);
                if (tasks_1.ContributedTask.is(task) && customizations) {
                    const custom = [];
                    const customized = Object.create(null);
                    await this._computeTasksForSingleConfig(task._source.workspaceFolder ?? this.workspaceFolders[0], {
                        version: '2.0.0',
                        tasks: [customizations]
                    }, 0 /* TaskRunSource.System */, custom, customized, TaskConfig.TaskConfigSource.TasksJson, true);
                    for (const configuration in customized) {
                        key = customized[configuration].getKey();
                    }
                }
                this._getTasksFromStorage('historical').set(key, JSON.stringify(customizations));
                this._saveRecentlyUsedTasks();
            }
        }
        _saveRecentlyUsedTasks() {
            if (!this._recentlyUsedTasks) {
                return;
            }
            const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
            // setting history limit to 0 means no LRU sorting
            if (quickOpenHistoryLimit === 0) {
                return;
            }
            let keys = [...this._recentlyUsedTasks.keys()];
            if (keys.length > quickOpenHistoryLimit) {
                keys = keys.slice(0, quickOpenHistoryLimit);
            }
            const keyValues = [];
            for (const key of keys) {
                keyValues.push([key, this._recentlyUsedTasks.get(key, 0 /* Touch.None */)]);
            }
            this._storageService.store(AbstractTaskService_1.RecentlyUsedTasks_KeyV2, JSON.stringify(keyValues), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        async _setPersistentTask(task) {
            if (!this._configurationService.getValue("task.reconnection" /* TaskSettingId.Reconnection */)) {
                return;
            }
            let key = task.getKey();
            if (!tasks_1.InMemoryTask.is(task) && key) {
                const customizations = this._createCustomizableTask(task);
                if (tasks_1.ContributedTask.is(task) && customizations) {
                    const custom = [];
                    const customized = Object.create(null);
                    await this._computeTasksForSingleConfig(task._source.workspaceFolder ?? this.workspaceFolders[0], {
                        version: '2.0.0',
                        tasks: [customizations]
                    }, 0 /* TaskRunSource.System */, custom, customized, TaskConfig.TaskConfigSource.TasksJson, true);
                    for (const configuration in customized) {
                        key = customized[configuration].getKey();
                    }
                }
                if (!task.configurationProperties.isBackground) {
                    return;
                }
                this._log(nls.localize('taskService.setPersistentTask', 'Setting persistent task {0}', key), true);
                this._getTasksFromStorage('persistent').set(key, JSON.stringify(customizations));
                this._savePersistentTasks();
            }
        }
        _savePersistentTasks() {
            this._persistentTasks = this._getTasksFromStorage('persistent');
            const keys = [...this._persistentTasks.keys()];
            const keyValues = [];
            for (const key of keys) {
                keyValues.push([key, this._persistentTasks.get(key, 0 /* Touch.None */)]);
            }
            this._log(nls.localize('savePersistentTask', 'Saving persistent tasks: {0}', keys.join(', ')), true);
            this._storageService.store(AbstractTaskService_1.PersistentTasks_Key, JSON.stringify(keyValues), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        _openDocumentation() {
            this._openerService.open(uri_1.URI.parse('https://code.visualstudio.com/docs/editor/tasks#_defining-a-problem-matcher'));
        }
        async _findSingleWorkspaceTaskOfGroup(group) {
            const tasksOfGroup = await this._findWorkspaceTasksInGroup(group, true);
            if ((tasksOfGroup.length === 1) && (typeof tasksOfGroup[0].configurationProperties.group !== 'string') && tasksOfGroup[0].configurationProperties.group?.isDefault) {
                let resolvedTask;
                if (tasks_1.ConfiguringTask.is(tasksOfGroup[0])) {
                    resolvedTask = await this.tryResolveTask(tasksOfGroup[0]);
                }
                else {
                    resolvedTask = tasksOfGroup[0];
                }
                if (resolvedTask) {
                    return this.run(resolvedTask, undefined, 1 /* TaskRunSource.User */);
                }
            }
            return undefined;
        }
        async _build() {
            const tryBuildShortcut = await this._findSingleWorkspaceTaskOfGroup(tasks_1.TaskGroup.Build);
            if (tryBuildShortcut) {
                return tryBuildShortcut;
            }
            return this._getGroupedTasksAndExecute();
        }
        async _runTest() {
            const tryTestShortcut = await this._findSingleWorkspaceTaskOfGroup(tasks_1.TaskGroup.Test);
            if (tryTestShortcut) {
                return tryTestShortcut;
            }
            return this._getGroupedTasksAndExecute(true);
        }
        async _getGroupedTasksAndExecute(test) {
            const tasks = await this._getGroupedTasks();
            const runnable = this._createRunnableTask(tasks, test ? tasks_1.TaskGroup.Test : tasks_1.TaskGroup.Build);
            if (!runnable || !runnable.task) {
                if (test) {
                    if (this.schemaVersion === 1 /* JsonSchemaVersion.V0_1_0 */) {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noTestTask1', 'No test task defined. Mark a task with \'isTestCommand\' in the tasks.json file.'), 3 /* TaskErrors.NoTestTask */);
                    }
                    else {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noTestTask2', 'No test task defined. Mark a task with as a \'test\' group in the tasks.json file.'), 3 /* TaskErrors.NoTestTask */);
                    }
                }
                else {
                    if (this.schemaVersion === 1 /* JsonSchemaVersion.V0_1_0 */) {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noBuildTask1', 'No build task defined. Mark a task with \'isBuildCommand\' in the tasks.json file.'), 2 /* TaskErrors.NoBuildTask */);
                    }
                    else {
                        throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskService.noBuildTask2', 'No build task defined. Mark a task with as a \'build\' group in the tasks.json file.'), 2 /* TaskErrors.NoBuildTask */);
                    }
                }
            }
            let executeTaskResult;
            try {
                executeTaskResult = await this._executeTask(runnable.task, runnable.resolver, 1 /* TaskRunSource.User */);
            }
            catch (error) {
                this._handleError(error);
                return Promise.reject(error);
            }
            return executeTaskResult;
        }
        async run(task, options, runSource = 0 /* TaskRunSource.System */) {
            if (!(await this._trust())) {
                return;
            }
            if (!task) {
                throw new taskSystem_1.TaskError(severity_1.default.Info, nls.localize('TaskServer.noTask', 'Task to execute is undefined'), 5 /* TaskErrors.TaskNotFound */);
            }
            const resolver = this._createResolver();
            let executeTaskResult;
            try {
                if (options && options.attachProblemMatcher && this._shouldAttachProblemMatcher(task) && !tasks_1.InMemoryTask.is(task)) {
                    const taskToExecute = await this._attachProblemMatcher(task);
                    if (taskToExecute) {
                        executeTaskResult = await this._executeTask(taskToExecute, resolver, runSource);
                    }
                }
                else {
                    executeTaskResult = await this._executeTask(task, resolver, runSource);
                }
                return executeTaskResult;
            }
            catch (error) {
                this._handleError(error);
                return Promise.reject(error);
            }
        }
        _isProvideTasksEnabled() {
            const settingValue = this._configurationService.getValue("task.autoDetect" /* TaskSettingId.AutoDetect */);
            return settingValue === 'on';
        }
        _isProblemMatcherPromptEnabled(type) {
            const settingValue = this._configurationService.getValue(PROBLEM_MATCHER_NEVER_CONFIG);
            if (Types.isBoolean(settingValue)) {
                return !settingValue;
            }
            if (type === undefined) {
                return true;
            }
            const settingValueMap = settingValue;
            return !settingValueMap[type];
        }
        _getTypeForTask(task) {
            let type;
            if (tasks_1.CustomTask.is(task)) {
                const configProperties = task._source.config.element;
                type = configProperties.type;
            }
            else {
                type = task.getDefinition().type;
            }
            return type;
        }
        _shouldAttachProblemMatcher(task) {
            const enabled = this._isProblemMatcherPromptEnabled(this._getTypeForTask(task));
            if (enabled === false) {
                return false;
            }
            if (!this._canCustomize(task)) {
                return false;
            }
            if (task.configurationProperties.group !== undefined && task.configurationProperties.group !== tasks_1.TaskGroup.Build) {
                return false;
            }
            if (task.configurationProperties.problemMatchers !== undefined && task.configurationProperties.problemMatchers.length > 0) {
                return false;
            }
            if (tasks_1.ContributedTask.is(task)) {
                return !task.hasDefinedMatchers && !!task.configurationProperties.problemMatchers && (task.configurationProperties.problemMatchers.length === 0);
            }
            if (tasks_1.CustomTask.is(task)) {
                const configProperties = task._source.config.element;
                return configProperties.problemMatcher === undefined && !task.hasDefinedMatchers;
            }
            return false;
        }
        async _updateNeverProblemMatcherSetting(type) {
            const current = this._configurationService.getValue(PROBLEM_MATCHER_NEVER_CONFIG);
            if (current === true) {
                return;
            }
            let newValue;
            if (current !== false) {
                newValue = current;
            }
            else {
                newValue = Object.create(null);
            }
            newValue[type] = true;
            return this._configurationService.updateValue(PROBLEM_MATCHER_NEVER_CONFIG, newValue);
        }
        async _attachProblemMatcher(task) {
            let entries = [];
            for (const key of problemMatcher_1.ProblemMatcherRegistry.keys()) {
                const matcher = problemMatcher_1.ProblemMatcherRegistry.get(key);
                if (matcher.deprecated) {
                    continue;
                }
                if (matcher.name === matcher.label) {
                    entries.push({ label: matcher.name, matcher: matcher });
                }
                else {
                    entries.push({
                        label: matcher.label,
                        description: `$${matcher.name}`,
                        matcher: matcher
                    });
                }
            }
            if (entries.length === 0) {
                return;
            }
            entries = entries.sort((a, b) => {
                if (a.label && b.label) {
                    return a.label.localeCompare(b.label);
                }
                else {
                    return 0;
                }
            });
            entries.unshift({ type: 'separator', label: nls.localize('TaskService.associate', 'associate') });
            let taskType;
            if (tasks_1.CustomTask.is(task)) {
                const configProperties = task._source.config.element;
                taskType = configProperties.type;
            }
            else {
                taskType = task.getDefinition().type;
            }
            entries.unshift({ label: nls.localize('TaskService.attachProblemMatcher.continueWithout', 'Continue without scanning the task output'), matcher: undefined }, { label: nls.localize('TaskService.attachProblemMatcher.never', 'Never scan the task output for this task'), matcher: undefined, never: true }, { label: nls.localize('TaskService.attachProblemMatcher.neverType', 'Never scan the task output for {0} tasks', taskType), matcher: undefined, setting: taskType }, { label: nls.localize('TaskService.attachProblemMatcher.learnMoreAbout', 'Learn more about scanning the task output'), matcher: undefined, learnMore: true });
            const problemMatcher = await this._quickInputService.pick(entries, { placeHolder: nls.localize('selectProblemMatcher', 'Select for which kind of errors and warnings to scan the task output') });
            if (!problemMatcher) {
                return task;
            }
            if (problemMatcher.learnMore) {
                this._openDocumentation();
                return undefined;
            }
            if (problemMatcher.never) {
                this.customize(task, { problemMatcher: [] }, true);
                return task;
            }
            if (problemMatcher.matcher) {
                const newTask = task.clone();
                const matcherReference = `$${problemMatcher.matcher.name}`;
                const properties = { problemMatcher: [matcherReference] };
                newTask.configurationProperties.problemMatchers = [matcherReference];
                const matcher = problemMatcher_1.ProblemMatcherRegistry.get(problemMatcher.matcher.name);
                if (matcher && matcher.watching !== undefined) {
                    properties.isBackground = true;
                    newTask.configurationProperties.isBackground = true;
                }
                this.customize(task, properties, true);
                return newTask;
            }
            if (problemMatcher.setting) {
                await this._updateNeverProblemMatcherSetting(problemMatcher.setting);
            }
            return task;
        }
        async _getTasksForGroup(group) {
            const groups = await this._getGroupedTasks();
            const result = [];
            groups.forEach(tasks => {
                for (const task of tasks) {
                    const configTaskGroup = tasks_1.TaskGroup.from(task.configurationProperties.group);
                    if (configTaskGroup?._id === group._id) {
                        result.push(task);
                    }
                }
            });
            return result;
        }
        needsFolderQualification() {
            return this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
        }
        _canCustomize(task) {
            if (this.schemaVersion !== 2 /* JsonSchemaVersion.V2_0_0 */) {
                return false;
            }
            if (tasks_1.CustomTask.is(task)) {
                return true;
            }
            if (tasks_1.ContributedTask.is(task)) {
                return !!task.getWorkspaceFolder();
            }
            return false;
        }
        async _formatTaskForJson(resource, task) {
            let reference;
            let stringValue = '';
            try {
                reference = await this._textModelResolverService.createModelReference(resource);
                const model = reference.object.textEditorModel;
                const { tabSize, insertSpaces } = model.getOptions();
                const eol = model.getEOL();
                let stringified = (0, jsonFormatter_1.toFormattedString)(task, { eol, tabSize, insertSpaces });
                const regex = new RegExp(eol + (insertSpaces ? ' '.repeat(tabSize) : '\\t'), 'g');
                stringified = stringified.replace(regex, eol + (insertSpaces ? ' '.repeat(tabSize * 3) : '\t\t\t'));
                const twoTabs = insertSpaces ? ' '.repeat(tabSize * 2) : '\t\t';
                stringValue = twoTabs + stringified.slice(0, stringified.length - 1) + twoTabs + stringified.slice(stringified.length - 1);
            }
            finally {
                reference?.dispose();
            }
            return stringValue;
        }
        async _openEditorAtTask(resource, task, configIndex = -1) {
            if (resource === undefined) {
                return Promise.resolve(false);
            }
            const fileContent = await this._fileService.readFile(resource);
            const content = fileContent.value;
            if (!content || !task) {
                return false;
            }
            const contentValue = content.toString();
            let stringValue;
            if (configIndex !== -1) {
                const json = this._configurationService.getValue('tasks', { resource });
                if (json.tasks && (json.tasks.length > configIndex)) {
                    stringValue = await this._formatTaskForJson(resource, json.tasks[configIndex]);
                }
            }
            if (!stringValue) {
                if (typeof task === 'string') {
                    stringValue = task;
                }
                else {
                    stringValue = await this._formatTaskForJson(resource, task);
                }
            }
            const index = contentValue.indexOf(stringValue);
            let startLineNumber = 1;
            for (let i = 0; i < index; i++) {
                if (contentValue.charAt(i) === '\n') {
                    startLineNumber++;
                }
            }
            let endLineNumber = startLineNumber;
            for (let i = 0; i < stringValue.length; i++) {
                if (stringValue.charAt(i) === '\n') {
                    endLineNumber++;
                }
            }
            const selection = startLineNumber > 1 ? { startLineNumber, startColumn: startLineNumber === endLineNumber ? 4 : 3, endLineNumber, endColumn: startLineNumber === endLineNumber ? undefined : 4 } : undefined;
            await this._editorService.openEditor({
                resource,
                options: {
                    pinned: false,
                    forceReload: true, // because content might have changed
                    selection,
                    selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */
                }
            });
            return !!selection;
        }
        _createCustomizableTask(task) {
            let toCustomize;
            const taskConfig = tasks_1.CustomTask.is(task) || tasks_1.ConfiguringTask.is(task) ? task._source.config : undefined;
            if (taskConfig && taskConfig.element) {
                toCustomize = { ...(taskConfig.element) };
            }
            else if (tasks_1.ContributedTask.is(task)) {
                toCustomize = {};
                const identifier = Object.assign(Object.create(null), task.defines);
                delete identifier['_key'];
                Object.keys(identifier).forEach(key => toCustomize[key] = identifier[key]);
                if (task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length > 0 && Types.isStringArray(task.configurationProperties.problemMatchers)) {
                    toCustomize.problemMatcher = task.configurationProperties.problemMatchers;
                }
                if (task.configurationProperties.group) {
                    toCustomize.group = TaskConfig.GroupKind.to(task.configurationProperties.group);
                }
            }
            if (!toCustomize) {
                return undefined;
            }
            if (toCustomize.problemMatcher === undefined && task.configurationProperties.problemMatchers === undefined || (task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length === 0)) {
                toCustomize.problemMatcher = [];
            }
            if (task._source.label !== 'Workspace') {
                toCustomize.label = task.configurationProperties.identifier;
            }
            else {
                toCustomize.label = task._label;
            }
            toCustomize.detail = task.configurationProperties.detail;
            return toCustomize;
        }
        async customize(task, properties, openConfig) {
            if (!(await this._trust())) {
                return;
            }
            const workspaceFolder = task.getWorkspaceFolder();
            if (!workspaceFolder) {
                return Promise.resolve(undefined);
            }
            const configuration = this._getConfiguration(workspaceFolder, task._source.kind);
            if (configuration.hasParseErrors) {
                this._notificationService.warn(nls.localize('customizeParseErrors', 'The current task configuration has errors. Please fix the errors first before customizing a task.'));
                return Promise.resolve(undefined);
            }
            const fileConfig = configuration.config;
            const toCustomize = this._createCustomizableTask(task);
            if (!toCustomize) {
                return Promise.resolve(undefined);
            }
            const index = tasks_1.CustomTask.is(task) ? task._source.config.index : undefined;
            if (properties) {
                for (const property of Object.getOwnPropertyNames(properties)) {
                    const value = properties[property];
                    if (value !== undefined && value !== null) {
                        toCustomize[property] = value;
                    }
                }
            }
            if (!fileConfig) {
                const value = {
                    version: '2.0.0',
                    tasks: [toCustomize]
                };
                let content = [
                    '{',
                    nls.localize('tasksJsonComment', '\t// See https://go.microsoft.com/fwlink/?LinkId=733558 \n\t// for the documentation about the tasks.json format'),
                ].join('\n') + JSON.stringify(value, null, '\t').substr(1);
                const editorConfig = this._configurationService.getValue();
                if (editorConfig.editor.insertSpaces) {
                    content = content.replace(/(\n)(\t+)/g, (_, s1, s2) => s1 + ' '.repeat(s2.length * editorConfig.editor.tabSize));
                }
                await this._textFileService.create([{ resource: workspaceFolder.toResource('.vscode/tasks.json'), value: content }]);
            }
            else {
                // We have a global task configuration
                if ((index === -1) && properties) {
                    if (properties.problemMatcher !== undefined) {
                        fileConfig.problemMatcher = properties.problemMatcher;
                        await this._writeConfiguration(workspaceFolder, 'tasks.problemMatchers', fileConfig.problemMatcher, task._source.kind);
                    }
                    else if (properties.group !== undefined) {
                        fileConfig.group = properties.group;
                        await this._writeConfiguration(workspaceFolder, 'tasks.group', fileConfig.group, task._source.kind);
                    }
                }
                else {
                    if (!Array.isArray(fileConfig.tasks)) {
                        fileConfig.tasks = [];
                    }
                    if (index === undefined) {
                        fileConfig.tasks.push(toCustomize);
                    }
                    else {
                        fileConfig.tasks[index] = toCustomize;
                    }
                    await this._writeConfiguration(workspaceFolder, 'tasks.tasks', fileConfig.tasks, task._source.kind);
                }
            }
            if (openConfig) {
                this._openEditorAtTask(this._getResourceForTask(task), toCustomize);
            }
        }
        _writeConfiguration(workspaceFolder, key, value, source) {
            let target = undefined;
            switch (source) {
                case tasks_1.TaskSourceKind.User:
                    target = 2 /* ConfigurationTarget.USER */;
                    break;
                case tasks_1.TaskSourceKind.WorkspaceFile:
                    target = 5 /* ConfigurationTarget.WORKSPACE */;
                    break;
                default: if (this._contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    target = 5 /* ConfigurationTarget.WORKSPACE */;
                }
                else if (this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                    target = 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
            }
            if (target) {
                return this._configurationService.updateValue(key, value, { resource: workspaceFolder.uri }, target);
            }
            else {
                return undefined;
            }
        }
        _getResourceForKind(kind) {
            this._updateSetup();
            switch (kind) {
                case tasks_1.TaskSourceKind.User: {
                    return resources.joinPath(resources.dirname(this._preferencesService.userSettingsResource), 'tasks.json');
                }
                case tasks_1.TaskSourceKind.WorkspaceFile: {
                    if (this._workspace && this._workspace.configuration) {
                        return this._workspace.configuration;
                    }
                }
                default: {
                    return undefined;
                }
            }
        }
        _getResourceForTask(task) {
            if (tasks_1.CustomTask.is(task)) {
                let uri = this._getResourceForKind(task._source.kind);
                if (!uri) {
                    const taskFolder = task.getWorkspaceFolder();
                    if (taskFolder) {
                        uri = taskFolder.toResource(task._source.config.file);
                    }
                    else {
                        uri = this.workspaceFolders[0].uri;
                    }
                }
                return uri;
            }
            else {
                return task.getWorkspaceFolder().toResource('.vscode/tasks.json');
            }
        }
        async openConfig(task) {
            let resource;
            if (task) {
                resource = this._getResourceForTask(task);
            }
            else {
                resource = (this._workspaceFolders && (this._workspaceFolders.length > 0)) ? this._workspaceFolders[0].toResource('.vscode/tasks.json') : undefined;
            }
            return this._openEditorAtTask(resource, task ? task._label : undefined, task ? task._source.config.index : -1);
        }
        _createRunnableTask(tasks, group) {
            const resolverData = new Map();
            const workspaceTasks = [];
            const extensionTasks = [];
            tasks.forEach((tasks, folder) => {
                let data = resolverData.get(folder);
                if (!data) {
                    data = {
                        id: new Map(),
                        label: new Map(),
                        identifier: new Map()
                    };
                    resolverData.set(folder, data);
                }
                for (const task of tasks) {
                    data.id.set(task._id, task);
                    data.label.set(task._label, task);
                    if (task.configurationProperties.identifier) {
                        data.identifier.set(task.configurationProperties.identifier, task);
                    }
                    if (group && task.configurationProperties.group === group) {
                        if (task._source.kind === tasks_1.TaskSourceKind.Workspace) {
                            workspaceTasks.push(task);
                        }
                        else {
                            extensionTasks.push(task);
                        }
                    }
                }
            });
            const resolver = {
                resolve: async (uri, alias) => {
                    const data = resolverData.get(typeof uri === 'string' ? uri : uri.toString());
                    if (!data) {
                        return undefined;
                    }
                    return data.id.get(alias) || data.label.get(alias) || data.identifier.get(alias);
                }
            };
            if (workspaceTasks.length > 0) {
                if (workspaceTasks.length > 1) {
                    this._log(nls.localize('moreThanOneBuildTask', 'There are many build tasks defined in the tasks.json. Executing the first one.'));
                }
                return { task: workspaceTasks[0], resolver };
            }
            if (extensionTasks.length === 0) {
                return undefined;
            }
            // We can only have extension tasks if we are in version 2.0.0. Then we can even run
            // multiple build tasks.
            if (extensionTasks.length === 1) {
                return { task: extensionTasks[0], resolver };
            }
            else {
                const id = UUID.generateUuid();
                const task = new tasks_1.InMemoryTask(id, { kind: tasks_1.TaskSourceKind.InMemory, label: 'inMemory' }, id, 'inMemory', { reevaluateOnRerun: true }, {
                    identifier: id,
                    dependsOn: extensionTasks.map((extensionTask) => { return { uri: extensionTask.getWorkspaceFolder().uri, task: extensionTask._id }; }),
                    name: id
                });
                return { task, resolver };
            }
        }
        _createResolver(grouped) {
            let resolverData;
            async function quickResolve(that, uri, identifier) {
                const foundTasks = await that._findWorkspaceTasks((task) => {
                    const taskUri = ((tasks_1.ConfiguringTask.is(task) || tasks_1.CustomTask.is(task)) ? task._source.config.workspaceFolder?.uri : undefined);
                    const originalUri = (typeof uri === 'string' ? uri : uri.toString());
                    if (taskUri?.toString() !== originalUri) {
                        return false;
                    }
                    if (Types.isString(identifier)) {
                        return ((task._label === identifier) || (task.configurationProperties.identifier === identifier));
                    }
                    else {
                        const keyedIdentifier = task.getDefinition(true);
                        const searchIdentifier = tasks_1.TaskDefinition.createTaskIdentifier(identifier, console);
                        return (searchIdentifier && keyedIdentifier) ? (searchIdentifier._key === keyedIdentifier._key) : false;
                    }
                });
                if (foundTasks.length === 0) {
                    return undefined;
                }
                const task = foundTasks[0];
                if (tasks_1.ConfiguringTask.is(task)) {
                    return that.tryResolveTask(task);
                }
                return task;
            }
            async function getResolverData(that) {
                if (resolverData === undefined) {
                    resolverData = new Map();
                    (grouped || await that._getGroupedTasks()).forEach((tasks, folder) => {
                        let data = resolverData.get(folder);
                        if (!data) {
                            data = { label: new Map(), identifier: new Map(), taskIdentifier: new Map() };
                            resolverData.set(folder, data);
                        }
                        for (const task of tasks) {
                            data.label.set(task._label, task);
                            if (task.configurationProperties.identifier) {
                                data.identifier.set(task.configurationProperties.identifier, task);
                            }
                            const keyedIdentifier = task.getDefinition(true);
                            if (keyedIdentifier !== undefined) {
                                data.taskIdentifier.set(keyedIdentifier._key, task);
                            }
                        }
                    });
                }
                return resolverData;
            }
            async function fullResolve(that, uri, identifier) {
                const allResolverData = await getResolverData(that);
                const data = allResolverData.get(typeof uri === 'string' ? uri : uri.toString());
                if (!data) {
                    return undefined;
                }
                if (Types.isString(identifier)) {
                    return data.label.get(identifier) || data.identifier.get(identifier);
                }
                else {
                    const key = tasks_1.TaskDefinition.createTaskIdentifier(identifier, console);
                    return key !== undefined ? data.taskIdentifier.get(key._key) : undefined;
                }
            }
            return {
                resolve: async (uri, identifier) => {
                    if (!identifier) {
                        return undefined;
                    }
                    if ((resolverData === undefined) && (grouped === undefined)) {
                        return (await quickResolve(this, uri, identifier)) ?? fullResolve(this, uri, identifier);
                    }
                    else {
                        return fullResolve(this, uri, identifier);
                    }
                }
            };
        }
        async _saveBeforeRun() {
            let SaveBeforeRunConfigOptions;
            (function (SaveBeforeRunConfigOptions) {
                SaveBeforeRunConfigOptions["Always"] = "always";
                SaveBeforeRunConfigOptions["Never"] = "never";
                SaveBeforeRunConfigOptions["Prompt"] = "prompt";
            })(SaveBeforeRunConfigOptions || (SaveBeforeRunConfigOptions = {}));
            const saveBeforeRunTaskConfig = this._configurationService.getValue("task.saveBeforeRun" /* TaskSettingId.SaveBeforeRun */);
            if (saveBeforeRunTaskConfig === SaveBeforeRunConfigOptions.Never) {
                return false;
            }
            else if (saveBeforeRunTaskConfig === SaveBeforeRunConfigOptions.Prompt && this._editorService.editors.some(e => e.isDirty())) {
                const { confirmed } = await this._dialogService.confirm({
                    message: nls.localize('TaskSystem.saveBeforeRun.prompt.title', "Save all editors?"),
                    detail: nls.localize('detail', "Do you want to save all editors before running the task?"),
                    primaryButton: nls.localize({ key: 'saveBeforeRun.save', comment: ['&& denotes a mnemonic'] }, '&&Save'),
                    cancelButton: nls.localize('saveBeforeRun.dontSave', 'Don\'t save'),
                });
                if (!confirmed) {
                    return false;
                }
            }
            await this._editorService.saveAll({ reason: 2 /* SaveReason.AUTO */ });
            return true;
        }
        async _executeTask(task, resolver, runSource) {
            let taskToRun = task;
            if (await this._saveBeforeRun()) {
                await this._configurationService.reloadConfiguration();
                await this._updateWorkspaceTasks();
                const taskFolder = task.getWorkspaceFolder();
                const taskIdentifier = task.configurationProperties.identifier;
                const taskType = tasks_1.CustomTask.is(task) ? task.customizes()?.type : (tasks_1.ContributedTask.is(task) ? task.type : undefined);
                // Since we save before running tasks, the task may have changed as part of the save.
                // However, if the TaskRunSource is not User, then we shouldn't try to fetch the task again
                // since this can cause a new'd task to get overwritten with a provided task.
                taskToRun = ((taskFolder && taskIdentifier && (runSource === 1 /* TaskRunSource.User */))
                    ? await this.getTask(taskFolder, taskIdentifier, false, taskType) : task) ?? task;
            }
            await problemMatcher_1.ProblemMatcherRegistry.onReady();
            const executeResult = runSource === 4 /* TaskRunSource.Reconnect */ ? this._getTaskSystem().reconnect(taskToRun, resolver) : this._getTaskSystem().run(taskToRun, resolver);
            if (executeResult) {
                return this._handleExecuteResult(executeResult, runSource);
            }
            return { exitCode: 0 };
        }
        async _handleExecuteResult(executeResult, runSource) {
            if (runSource === 1 /* TaskRunSource.User */) {
                await this._setRecentlyUsedTask(executeResult.task);
            }
            if (executeResult.kind === 2 /* TaskExecuteKind.Active */) {
                const active = executeResult.active;
                if (active && active.same && runSource === 2 /* TaskRunSource.FolderOpen */ || runSource === 4 /* TaskRunSource.Reconnect */) {
                    // ignore, the task is already active, likely from being reconnected or from folder open.
                    this._logService.debug('Ignoring task that is already active', executeResult.task);
                    return executeResult.promise;
                }
                if (active && active.same) {
                    if (this._taskSystem?.isTaskVisible(executeResult.task)) {
                        const message = nls.localize('TaskSystem.activeSame.noBackground', 'The task \'{0}\' is already active.', executeResult.task.getQualifiedLabel());
                        const lastInstance = this._getTaskSystem().getLastInstance(executeResult.task) ?? executeResult.task;
                        this._notificationService.prompt(severity_1.default.Warning, message, [{
                                label: nls.localize('terminateTask', "Terminate Task"),
                                run: () => this.terminate(lastInstance)
                            },
                            {
                                label: nls.localize('restartTask', "Restart Task"),
                                run: () => this._restart(lastInstance)
                            }], { sticky: true });
                    }
                    else {
                        this._taskSystem?.revealTask(executeResult.task);
                    }
                }
                else {
                    throw new taskSystem_1.TaskError(severity_1.default.Warning, nls.localize('TaskSystem.active', 'There is already a task running. Terminate it first before executing another task.'), 1 /* TaskErrors.RunningTask */);
                }
            }
            this._setRecentlyUsedTask(executeResult.task);
            return executeResult.promise;
        }
        async _restart(task) {
            if (!this._taskSystem) {
                return;
            }
            const response = await this._taskSystem.terminate(task);
            if (response.success) {
                try {
                    await this.run(task);
                }
                catch {
                    // eat the error, we don't care about it here
                }
            }
            else {
                this._notificationService.warn(nls.localize('TaskSystem.restartFailed', 'Failed to terminate and restart task {0}', Types.isString(task) ? task : task.configurationProperties.name));
            }
        }
        async terminate(task) {
            if (!(await this._trust())) {
                return { success: true, task: undefined };
            }
            if (!this._taskSystem) {
                return { success: true, task: undefined };
            }
            return this._taskSystem.terminate(task);
        }
        _terminateAll() {
            if (!this._taskSystem) {
                return Promise.resolve([]);
            }
            return this._taskSystem.terminateAll();
        }
        _createTerminalTaskSystem() {
            return new terminalTaskSystem_1.TerminalTaskSystem(this._terminalService, this._terminalGroupService, this._outputService, this._paneCompositeService, this._viewsService, this._markerService, this._modelService, this._configurationResolverService, this._contextService, this._environmentService, AbstractTaskService_1.OutputChannelId, this._fileService, this._terminalProfileResolverService, this._pathService, this._viewDescriptorService, this._logService, this._notificationService, this._instantiationService, (workspaceFolder) => {
                if (workspaceFolder) {
                    return this._getTaskSystemInfo(workspaceFolder.uri.scheme);
                }
                else if (this._taskSystemInfos.size > 0) {
                    const infos = Array.from(this._taskSystemInfos.entries());
                    const notFile = infos.filter(info => info[0] !== network_1.Schemas.file);
                    if (notFile.length > 0) {
                        return notFile[0][1][0];
                    }
                    return infos[0][1][0];
                }
                else {
                    return undefined;
                }
            });
        }
        _isTaskProviderEnabled(type) {
            const definition = taskDefinitionRegistry_1.TaskDefinitionRegistry.get(type);
            return !definition || !definition.when || this._contextKeyService.contextMatchesRules(definition.when);
        }
        async _getGroupedTasks(filter) {
            await this._waitForAllSupportedExecutions;
            const type = filter?.type;
            const needsRecentTasksMigration = this._needsRecentTasksMigration();
            await this._activateTaskProviders(filter?.type);
            const validTypes = Object.create(null);
            taskDefinitionRegistry_1.TaskDefinitionRegistry.all().forEach(definition => validTypes[definition.taskType] = true);
            validTypes['shell'] = true;
            validTypes['process'] = true;
            const contributedTaskSets = await new Promise(resolve => {
                const result = [];
                let counter = 0;
                const done = (value) => {
                    if (value) {
                        result.push(value);
                    }
                    if (--counter === 0) {
                        resolve(result);
                    }
                };
                const error = (error) => {
                    try {
                        if (error && Types.isString(error.message)) {
                            this._log(`Error: ${error.message}\n`);
                            this._showOutput();
                        }
                        else {
                            this._log('Unknown error received while collecting tasks from providers.');
                            this._showOutput();
                        }
                    }
                    finally {
                        if (--counter === 0) {
                            resolve(result);
                        }
                    }
                };
                if (this._isProvideTasksEnabled() && (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) && (this._providers.size > 0)) {
                    let foundAnyProviders = false;
                    for (const [handle, provider] of this._providers) {
                        const providerType = this._providerTypes.get(handle);
                        if ((type === undefined) || (type === providerType)) {
                            if (providerType && !this._isTaskProviderEnabled(providerType)) {
                                continue;
                            }
                            foundAnyProviders = true;
                            counter++;
                            (0, async_1.raceTimeout)(provider.provideTasks(validTypes).then((taskSet) => {
                                // Check that the tasks provided are of the correct type
                                for (const task of taskSet.tasks) {
                                    if (task.type !== this._providerTypes.get(handle)) {
                                        this._log(nls.localize('unexpectedTaskType', "The task provider for \"{0}\" tasks unexpectedly provided a task of type \"{1}\".\n", this._providerTypes.get(handle), task.type));
                                        if ((task.type !== 'shell') && (task.type !== 'process')) {
                                            this._showOutput();
                                        }
                                        break;
                                    }
                                }
                                return done(taskSet);
                            }, error), 5000, () => {
                                // onTimeout
                                console.error('Timed out getting tasks from ', providerType);
                                done(undefined);
                            });
                        }
                    }
                    if (!foundAnyProviders) {
                        resolve(result);
                    }
                }
                else {
                    resolve(result);
                }
            });
            const result = new TaskMap();
            const contributedTasks = new TaskMap();
            for (const set of contributedTaskSets) {
                for (const task of set.tasks) {
                    const workspaceFolder = task.getWorkspaceFolder();
                    if (workspaceFolder) {
                        contributedTasks.add(workspaceFolder, task);
                    }
                }
            }
            try {
                const customTasks = await this.getWorkspaceTasks();
                const customTasksKeyValuePairs = Array.from(customTasks);
                const customTasksPromises = customTasksKeyValuePairs.map(async ([key, folderTasks]) => {
                    const contributed = contributedTasks.get(key);
                    if (!folderTasks.set) {
                        if (contributed) {
                            result.add(key, ...contributed);
                        }
                        return;
                    }
                    if (this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                        result.add(key, ...folderTasks.set.tasks);
                    }
                    else {
                        const configurations = folderTasks.configurations;
                        const legacyTaskConfigurations = folderTasks.set ? this._getLegacyTaskConfigurations(folderTasks.set) : undefined;
                        const customTasksToDelete = [];
                        if (configurations || legacyTaskConfigurations) {
                            const unUsedConfigurations = new Set();
                            if (configurations) {
                                Object.keys(configurations.byIdentifier).forEach(key => unUsedConfigurations.add(key));
                            }
                            for (const task of contributed) {
                                if (!tasks_1.ContributedTask.is(task)) {
                                    continue;
                                }
                                if (configurations) {
                                    const configuringTask = configurations.byIdentifier[task.defines._key];
                                    if (configuringTask) {
                                        unUsedConfigurations.delete(task.defines._key);
                                        result.add(key, TaskConfig.createCustomTask(task, configuringTask));
                                    }
                                    else {
                                        result.add(key, task);
                                    }
                                }
                                else if (legacyTaskConfigurations) {
                                    const configuringTask = legacyTaskConfigurations[task.defines._key];
                                    if (configuringTask) {
                                        result.add(key, TaskConfig.createCustomTask(task, configuringTask));
                                        customTasksToDelete.push(configuringTask);
                                    }
                                    else {
                                        result.add(key, task);
                                    }
                                }
                                else {
                                    result.add(key, task);
                                }
                            }
                            if (customTasksToDelete.length > 0) {
                                const toDelete = customTasksToDelete.reduce((map, task) => {
                                    map[task._id] = true;
                                    return map;
                                }, Object.create(null));
                                for (const task of folderTasks.set.tasks) {
                                    if (toDelete[task._id]) {
                                        continue;
                                    }
                                    result.add(key, task);
                                }
                            }
                            else {
                                result.add(key, ...folderTasks.set.tasks);
                            }
                            const unUsedConfigurationsAsArray = Array.from(unUsedConfigurations);
                            const unUsedConfigurationPromises = unUsedConfigurationsAsArray.map(async (value) => {
                                const configuringTask = configurations.byIdentifier[value];
                                if (type && (type !== configuringTask.configures.type)) {
                                    return;
                                }
                                let requiredTaskProviderUnavailable = false;
                                for (const [handle, provider] of this._providers) {
                                    const providerType = this._providerTypes.get(handle);
                                    if (configuringTask.type === providerType) {
                                        if (providerType && !this._isTaskProviderEnabled(providerType)) {
                                            requiredTaskProviderUnavailable = true;
                                            continue;
                                        }
                                        try {
                                            const resolvedTask = await provider.resolveTask(configuringTask);
                                            if (resolvedTask && (resolvedTask._id === configuringTask._id)) {
                                                result.add(key, TaskConfig.createCustomTask(resolvedTask, configuringTask));
                                                return;
                                            }
                                        }
                                        catch (error) {
                                            // Ignore errors. The task could not be provided by any of the providers.
                                        }
                                    }
                                }
                                if (requiredTaskProviderUnavailable) {
                                    this._log(nls.localize('TaskService.providerUnavailable', 'Warning: {0} tasks are unavailable in the current environment.', configuringTask.configures.type));
                                }
                                else {
                                    this._log(nls.localize('TaskService.noConfiguration', 'Error: The {0} task detection didn\'t contribute a task for the following configuration:\n{1}\nThe task will be ignored.', configuringTask.configures.type, JSON.stringify(configuringTask._source.config.element, undefined, 4)));
                                    this._showOutput();
                                }
                            });
                            await Promise.all(unUsedConfigurationPromises);
                        }
                        else {
                            result.add(key, ...folderTasks.set.tasks);
                            result.add(key, ...contributed);
                        }
                    }
                });
                await Promise.all(customTasksPromises);
                if (needsRecentTasksMigration) {
                    // At this point we have all the tasks and can migrate the recently used tasks.
                    await this._migrateRecentTasks(result.all());
                }
                return result;
            }
            catch {
                // If we can't read the tasks.json file provide at least the contributed tasks
                const result = new TaskMap();
                for (const set of contributedTaskSets) {
                    for (const task of set.tasks) {
                        const folder = task.getWorkspaceFolder();
                        if (folder) {
                            result.add(folder, task);
                        }
                    }
                }
                return result;
            }
        }
        _getLegacyTaskConfigurations(workspaceTasks) {
            let result;
            function getResult() {
                if (result) {
                    return result;
                }
                result = Object.create(null);
                return result;
            }
            for (const task of workspaceTasks.tasks) {
                if (tasks_1.CustomTask.is(task)) {
                    const commandName = task.command && task.command.name;
                    // This is for backwards compatibility with the 0.1.0 task annotation code
                    // if we had a gulp, jake or grunt command a task specification was a annotation
                    if (commandName === 'gulp' || commandName === 'grunt' || commandName === 'jake') {
                        const identifier = tasks_1.KeyedTaskIdentifier.create({
                            type: commandName,
                            task: task.configurationProperties.name
                        });
                        getResult()[identifier._key] = task;
                    }
                }
            }
            return result;
        }
        async getWorkspaceTasks(runSource = 1 /* TaskRunSource.User */) {
            if (!(await this._trust())) {
                return new Map();
            }
            await (0, async_1.raceTimeout)(this._waitForAllSupportedExecutions, 2000, () => {
                this._logService.warn('Timed out waiting for all supported executions');
            });
            await this._whenTaskSystemReady;
            if (this._workspaceTasksPromise) {
                return this._workspaceTasksPromise;
            }
            return this._updateWorkspaceTasks(runSource);
        }
        _updateWorkspaceTasks(runSource = 1 /* TaskRunSource.User */) {
            this._workspaceTasksPromise = this._computeWorkspaceTasks(runSource);
            return this._workspaceTasksPromise;
        }
        async _getAFolder() {
            let folder = this.workspaceFolders.length > 0 ? this.workspaceFolders[0] : undefined;
            if (!folder) {
                const userhome = await this._pathService.userHome();
                folder = new workspace_1.WorkspaceFolder({ uri: userhome, name: resources.basename(userhome), index: 0 });
            }
            return folder;
        }
        async _computeWorkspaceTasks(runSource = 1 /* TaskRunSource.User */) {
            const promises = [];
            for (const folder of this.workspaceFolders) {
                promises.push(this._computeWorkspaceFolderTasks(folder, runSource));
            }
            const values = await Promise.all(promises);
            const result = new Map();
            for (const value of values) {
                if (value) {
                    result.set(value.workspaceFolder.uri.toString(), value);
                }
            }
            const folder = await this._getAFolder();
            if (this._contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                const workspaceFileTasks = await this._computeWorkspaceFileTasks(folder, runSource);
                if (workspaceFileTasks && this._workspace && this._workspace.configuration) {
                    result.set(this._workspace.configuration.toString(), workspaceFileTasks);
                }
            }
            const userTasks = await this._computeUserTasks(folder, runSource);
            if (userTasks) {
                result.set(tasks_1.USER_TASKS_GROUP_KEY, userTasks);
            }
            return result;
        }
        get _jsonTasksSupported() {
            return taskService_1.ShellExecutionSupportedContext.getValue(this._contextKeyService) === true && taskService_1.ProcessExecutionSupportedContext.getValue(this._contextKeyService) === true;
        }
        async _computeWorkspaceFolderTasks(workspaceFolder, runSource = 1 /* TaskRunSource.User */) {
            const workspaceFolderConfiguration = (this._executionEngine === tasks_1.ExecutionEngine.Process ? await this._computeLegacyConfiguration(workspaceFolder) : await this._computeConfiguration(workspaceFolder));
            if (!workspaceFolderConfiguration || !workspaceFolderConfiguration.config || workspaceFolderConfiguration.hasErrors) {
                return Promise.resolve({ workspaceFolder, set: undefined, configurations: undefined, hasErrors: workspaceFolderConfiguration ? workspaceFolderConfiguration.hasErrors : false });
            }
            await problemMatcher_1.ProblemMatcherRegistry.onReady();
            const taskSystemInfo = this._getTaskSystemInfo(workspaceFolder.uri.scheme);
            const problemReporter = new ProblemReporter(this._outputChannel);
            const parseResult = TaskConfig.parse(workspaceFolder, undefined, taskSystemInfo ? taskSystemInfo.platform : Platform.platform, workspaceFolderConfiguration.config, problemReporter, TaskConfig.TaskConfigSource.TasksJson, this._contextKeyService);
            let hasErrors = false;
            if (!parseResult.validationStatus.isOK() && (parseResult.validationStatus.state !== 1 /* ValidationState.Info */)) {
                hasErrors = true;
                this._showOutput(runSource);
            }
            if (problemReporter.status.isFatal()) {
                problemReporter.fatal(nls.localize('TaskSystem.configurationErrors', 'Error: the provided task configuration has validation errors and can\'t not be used. Please correct the errors first.'));
                return { workspaceFolder, set: undefined, configurations: undefined, hasErrors };
            }
            let customizedTasks;
            if (parseResult.configured && parseResult.configured.length > 0) {
                customizedTasks = {
                    byIdentifier: Object.create(null)
                };
                for (const task of parseResult.configured) {
                    customizedTasks.byIdentifier[task.configures._key] = task;
                }
            }
            if (!this._jsonTasksSupported && (parseResult.custom.length > 0)) {
                console.warn('Custom workspace tasks are not supported.');
            }
            return { workspaceFolder, set: { tasks: this._jsonTasksSupported ? parseResult.custom : [] }, configurations: customizedTasks, hasErrors };
        }
        _testParseExternalConfig(config, location) {
            if (!config) {
                return { config: undefined, hasParseErrors: false };
            }
            const parseErrors = config.$parseErrors;
            if (parseErrors) {
                let isAffected = false;
                for (const parseError of parseErrors) {
                    if (/tasks\.json$/.test(parseError)) {
                        isAffected = true;
                        break;
                    }
                }
                if (isAffected) {
                    this._log(nls.localize({ key: 'TaskSystem.invalidTaskJsonOther', comment: ['Message notifies of an error in one of several places there is tasks related json, not necessarily in a file named tasks.json'] }, 'Error: The content of the tasks json in {0} has syntax errors. Please correct them before executing a task.', location));
                    this._showOutput();
                    return { config, hasParseErrors: true };
                }
            }
            return { config, hasParseErrors: false };
        }
        _log(value, verbose) {
            if (!verbose || this._configurationService.getValue("task.verboseLogging" /* TaskSettingId.VerboseLogging */)) {
                this._outputChannel.append(value + '\n');
            }
        }
        async _computeWorkspaceFileTasks(workspaceFolder, runSource = 1 /* TaskRunSource.User */) {
            if (this._executionEngine === tasks_1.ExecutionEngine.Process) {
                return this._emptyWorkspaceTaskResults(workspaceFolder);
            }
            const workspaceFileConfig = this._getConfiguration(workspaceFolder, tasks_1.TaskSourceKind.WorkspaceFile);
            const configuration = this._testParseExternalConfig(workspaceFileConfig.config, nls.localize('TasksSystem.locationWorkspaceConfig', 'workspace file'));
            const customizedTasks = {
                byIdentifier: Object.create(null)
            };
            const custom = [];
            await this._computeTasksForSingleConfig(workspaceFolder, configuration.config, runSource, custom, customizedTasks.byIdentifier, TaskConfig.TaskConfigSource.WorkspaceFile);
            const engine = configuration.config ? TaskConfig.ExecutionEngine.from(configuration.config) : tasks_1.ExecutionEngine.Terminal;
            if (engine === tasks_1.ExecutionEngine.Process) {
                this._notificationService.warn(nls.localize('TaskSystem.versionWorkspaceFile', 'Only tasks version 2.0.0 permitted in workspace configuration files.'));
                return this._emptyWorkspaceTaskResults(workspaceFolder);
            }
            return { workspaceFolder, set: { tasks: custom }, configurations: customizedTasks, hasErrors: configuration.hasParseErrors };
        }
        async _computeUserTasks(workspaceFolder, runSource = 1 /* TaskRunSource.User */) {
            if (this._executionEngine === tasks_1.ExecutionEngine.Process) {
                return this._emptyWorkspaceTaskResults(workspaceFolder);
            }
            const userTasksConfig = this._getConfiguration(workspaceFolder, tasks_1.TaskSourceKind.User);
            const configuration = this._testParseExternalConfig(userTasksConfig.config, nls.localize('TasksSystem.locationUserConfig', 'user settings'));
            const customizedTasks = {
                byIdentifier: Object.create(null)
            };
            const custom = [];
            await this._computeTasksForSingleConfig(workspaceFolder, configuration.config, runSource, custom, customizedTasks.byIdentifier, TaskConfig.TaskConfigSource.User);
            const engine = configuration.config ? TaskConfig.ExecutionEngine.from(configuration.config) : tasks_1.ExecutionEngine.Terminal;
            if (engine === tasks_1.ExecutionEngine.Process) {
                this._notificationService.warn(nls.localize('TaskSystem.versionSettings', 'Only tasks version 2.0.0 permitted in user settings.'));
                return this._emptyWorkspaceTaskResults(workspaceFolder);
            }
            return { workspaceFolder, set: { tasks: custom }, configurations: customizedTasks, hasErrors: configuration.hasParseErrors };
        }
        _emptyWorkspaceTaskResults(workspaceFolder) {
            return { workspaceFolder, set: undefined, configurations: undefined, hasErrors: false };
        }
        async _computeTasksForSingleConfig(workspaceFolder, config, runSource, custom, customized, source, isRecentTask = false) {
            if (!config) {
                return false;
            }
            const taskSystemInfo = this._getTaskSystemInfo(workspaceFolder.uri.scheme);
            const problemReporter = new ProblemReporter(this._outputChannel);
            const parseResult = TaskConfig.parse(workspaceFolder, this._workspace, taskSystemInfo ? taskSystemInfo.platform : Platform.platform, config, problemReporter, source, this._contextKeyService, isRecentTask);
            let hasErrors = false;
            if (!parseResult.validationStatus.isOK() && (parseResult.validationStatus.state !== 1 /* ValidationState.Info */)) {
                this._showOutput(runSource);
                hasErrors = true;
            }
            if (problemReporter.status.isFatal()) {
                problemReporter.fatal(nls.localize('TaskSystem.configurationErrors', 'Error: the provided task configuration has validation errors and can\'t not be used. Please correct the errors first.'));
                return hasErrors;
            }
            if (parseResult.configured && parseResult.configured.length > 0) {
                for (const task of parseResult.configured) {
                    customized[task.configures._key] = task;
                }
            }
            if (!this._jsonTasksSupported && (parseResult.custom.length > 0)) {
                console.warn('Custom workspace tasks are not supported.');
            }
            else {
                for (const task of parseResult.custom) {
                    custom.push(task);
                }
            }
            return hasErrors;
        }
        _computeConfiguration(workspaceFolder) {
            const { config, hasParseErrors } = this._getConfiguration(workspaceFolder);
            return Promise.resolve({ workspaceFolder, config, hasErrors: hasParseErrors });
        }
        _computeWorkspaceFolderSetup() {
            const workspaceFolders = [];
            const ignoredWorkspaceFolders = [];
            let executionEngine = tasks_1.ExecutionEngine.Terminal;
            let schemaVersion = 2 /* JsonSchemaVersion.V2_0_0 */;
            let workspace;
            if (this._contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const workspaceFolder = this._contextService.getWorkspace().folders[0];
                workspaceFolders.push(workspaceFolder);
                executionEngine = this._computeExecutionEngine(workspaceFolder);
                const telemetryData = {
                    executionEngineVersion: executionEngine
                };
                /* __GDPR__
                    "taskService.engineVersion" : {
                        "owner": "alexr00",
                        "comment": "The engine version of tasks. Used to determine if a user is using a deprecated version.",
                        "executionEngineVersion" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The engine version of tasks." }
                    }
                */
                this._telemetryService.publicLog('taskService.engineVersion', telemetryData);
                schemaVersion = this._computeJsonSchemaVersion(workspaceFolder);
            }
            else if (this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                workspace = this._contextService.getWorkspace();
                for (const workspaceFolder of this._contextService.getWorkspace().folders) {
                    if (schemaVersion === this._computeJsonSchemaVersion(workspaceFolder)) {
                        workspaceFolders.push(workspaceFolder);
                    }
                    else {
                        ignoredWorkspaceFolders.push(workspaceFolder);
                        this._log(nls.localize('taskService.ignoreingFolder', 'Ignoring task configurations for workspace folder {0}. Multi folder workspace task support requires that all folders use task version 2.0.0', workspaceFolder.uri.fsPath));
                    }
                }
            }
            return [workspaceFolders, ignoredWorkspaceFolders, executionEngine, schemaVersion, workspace];
        }
        _computeExecutionEngine(workspaceFolder) {
            const { config } = this._getConfiguration(workspaceFolder);
            if (!config) {
                return tasks_1.ExecutionEngine._default;
            }
            return TaskConfig.ExecutionEngine.from(config);
        }
        _computeJsonSchemaVersion(workspaceFolder) {
            const { config } = this._getConfiguration(workspaceFolder);
            if (!config) {
                return 2 /* JsonSchemaVersion.V2_0_0 */;
            }
            return TaskConfig.JsonSchemaVersion.from(config);
        }
        _getConfiguration(workspaceFolder, source) {
            let result;
            if ((source !== tasks_1.TaskSourceKind.User) && (this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */)) {
                result = undefined;
            }
            else {
                const wholeConfig = this._configurationService.inspect('tasks', { resource: workspaceFolder.uri });
                switch (source) {
                    case tasks_1.TaskSourceKind.User: {
                        if (wholeConfig.userValue !== wholeConfig.workspaceFolderValue) {
                            result = Objects.deepClone(wholeConfig.userValue);
                        }
                        break;
                    }
                    case tasks_1.TaskSourceKind.Workspace:
                        result = Objects.deepClone(wholeConfig.workspaceFolderValue);
                        break;
                    case tasks_1.TaskSourceKind.WorkspaceFile: {
                        if ((this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */)
                            && (wholeConfig.workspaceFolderValue !== wholeConfig.workspaceValue)) {
                            result = Objects.deepClone(wholeConfig.workspaceValue);
                        }
                        break;
                    }
                    default: result = Objects.deepClone(wholeConfig.workspaceFolderValue);
                }
            }
            if (!result) {
                return { config: undefined, hasParseErrors: false };
            }
            const parseErrors = result.$parseErrors;
            if (parseErrors) {
                let isAffected = false;
                for (const parseError of parseErrors) {
                    if (/tasks\.json$/.test(parseError)) {
                        isAffected = true;
                        break;
                    }
                }
                if (isAffected) {
                    this._log(nls.localize('TaskSystem.invalidTaskJson', 'Error: The content of the tasks.json file has syntax errors. Please correct them before executing a task.'));
                    this._showOutput();
                    return { config: undefined, hasParseErrors: true };
                }
            }
            return { config: result, hasParseErrors: false };
        }
        inTerminal() {
            if (this._taskSystem) {
                return this._taskSystem instanceof terminalTaskSystem_1.TerminalTaskSystem;
            }
            return this._executionEngine === tasks_1.ExecutionEngine.Terminal;
        }
        configureAction() {
            const thisCapture = this;
            return new class extends actions_1.Action {
                constructor() {
                    super(ConfigureTaskAction.ID, ConfigureTaskAction.TEXT, undefined, true, () => { thisCapture._runConfigureTasks(); return Promise.resolve(undefined); });
                }
            };
        }
        _handleError(err) {
            let showOutput = true;
            if (err instanceof taskSystem_1.TaskError) {
                const buildError = err;
                const needsConfig = buildError.code === 0 /* TaskErrors.NotConfigured */ || buildError.code === 2 /* TaskErrors.NoBuildTask */ || buildError.code === 3 /* TaskErrors.NoTestTask */;
                const needsTerminate = buildError.code === 1 /* TaskErrors.RunningTask */;
                if (needsConfig || needsTerminate) {
                    this._notificationService.prompt(buildError.severity, buildError.message, [{
                            label: needsConfig ? ConfigureTaskAction.TEXT : nls.localize('TerminateAction.label', "Terminate Task"),
                            run: () => {
                                if (needsConfig) {
                                    this._runConfigureTasks();
                                }
                                else {
                                    this._runTerminateCommand();
                                }
                            }
                        }]);
                }
                else {
                    this._notificationService.notify({ severity: buildError.severity, message: buildError.message });
                }
            }
            else if (err instanceof Error) {
                const error = err;
                this._notificationService.error(error.message);
                showOutput = false;
            }
            else if (Types.isString(err)) {
                this._notificationService.error(err);
            }
            else {
                this._notificationService.error(nls.localize('TaskSystem.unknownError', 'An error has occurred while running a task. See task log for details.'));
            }
            if (showOutput) {
                this._showOutput();
            }
        }
        _showDetail() {
            return this._configurationService.getValue(taskQuickPick_1.QUICKOPEN_DETAIL_CONFIG);
        }
        async _createTaskQuickPickEntries(tasks, group = false, sort = false, selectedEntry, includeRecents = true) {
            let encounteredTasks = {};
            if (tasks === undefined || tasks === null || tasks.length === 0) {
                return [];
            }
            const TaskQuickPickEntry = (task) => {
                const newEntry = { label: task._label, description: this.getTaskDescription(task), task, detail: this._showDetail() ? task.configurationProperties.detail : undefined };
                if (encounteredTasks[task._id]) {
                    if (encounteredTasks[task._id].length === 1) {
                        encounteredTasks[task._id][0].label += ' (1)';
                    }
                    newEntry.label = newEntry.label + ' (' + (encounteredTasks[task._id].length + 1).toString() + ')';
                }
                else {
                    encounteredTasks[task._id] = [];
                }
                encounteredTasks[task._id].push(newEntry);
                return newEntry;
            };
            function fillEntries(entries, tasks, groupLabel) {
                if (tasks.length) {
                    entries.push({ type: 'separator', label: groupLabel });
                }
                for (const task of tasks) {
                    const entry = TaskQuickPickEntry(task);
                    entry.buttons = [{ iconClass: themables_1.ThemeIcon.asClassName(taskQuickPick_1.configureTaskIcon), tooltip: nls.localize('configureTask', "Configure Task") }];
                    if (selectedEntry && (task === selectedEntry.task)) {
                        entries.unshift(selectedEntry);
                    }
                    else {
                        entries.push(entry);
                    }
                }
            }
            let entries;
            if (group) {
                entries = [];
                if (tasks.length === 1) {
                    entries.push(TaskQuickPickEntry(tasks[0]));
                }
                else {
                    const recentlyUsedTasks = await this.getSavedTasks('historical');
                    const recent = [];
                    const recentSet = new Set();
                    let configured = [];
                    let detected = [];
                    const taskMap = Object.create(null);
                    tasks.forEach(task => {
                        const key = task.getCommonTaskId();
                        if (key) {
                            taskMap[key] = task;
                        }
                    });
                    recentlyUsedTasks.reverse().forEach(recentTask => {
                        const key = recentTask.getCommonTaskId();
                        if (key) {
                            recentSet.add(key);
                            const task = taskMap[key];
                            if (task) {
                                recent.push(task);
                            }
                        }
                    });
                    for (const task of tasks) {
                        const key = task.getCommonTaskId();
                        if (!key || !recentSet.has(key)) {
                            if ((task._source.kind === tasks_1.TaskSourceKind.Workspace) || (task._source.kind === tasks_1.TaskSourceKind.User)) {
                                configured.push(task);
                            }
                            else {
                                detected.push(task);
                            }
                        }
                    }
                    const sorter = this.createSorter();
                    if (includeRecents) {
                        fillEntries(entries, recent, nls.localize('recentlyUsed', 'recently used tasks'));
                    }
                    configured = configured.sort((a, b) => sorter.compare(a, b));
                    fillEntries(entries, configured, nls.localize('configured', 'configured tasks'));
                    detected = detected.sort((a, b) => sorter.compare(a, b));
                    fillEntries(entries, detected, nls.localize('detected', 'detected tasks'));
                }
            }
            else {
                if (sort) {
                    const sorter = this.createSorter();
                    tasks = tasks.sort((a, b) => sorter.compare(a, b));
                }
                entries = tasks.map(task => TaskQuickPickEntry(task));
            }
            encounteredTasks = {};
            return entries;
        }
        async _showTwoLevelQuickPick(placeHolder, defaultEntry, type, name) {
            return this._instantiationService.createInstance(taskQuickPick_1.TaskQuickPick).show(placeHolder, defaultEntry, type, name);
        }
        async _showQuickPick(tasks, placeHolder, defaultEntry, group = false, sort = false, selectedEntry, additionalEntries, name) {
            const resolvedTasks = await tasks;
            const entries = await (0, async_1.raceTimeout)(this._createTaskQuickPickEntries(resolvedTasks, group, sort, selectedEntry), 200, () => undefined);
            if (!entries) {
                return undefined;
            }
            if (entries.length === 1 && this._configurationService.getValue(taskQuickPick_1.QUICKOPEN_SKIP_CONFIG)) {
                return entries[0];
            }
            else if ((entries.length === 0) && defaultEntry) {
                entries.push(defaultEntry);
            }
            else if (entries.length > 1 && additionalEntries && additionalEntries.length > 0) {
                entries.push({ type: 'separator', label: '' });
                entries.push(additionalEntries[0]);
            }
            const picker = this._quickInputService.createQuickPick();
            picker.placeholder = placeHolder;
            picker.matchOnDescription = true;
            if (name) {
                picker.value = name;
            }
            picker.onDidTriggerItemButton(context => {
                const task = context.item.task;
                this._quickInputService.cancel();
                if (tasks_1.ContributedTask.is(task)) {
                    this.customize(task, undefined, true);
                }
                else if (tasks_1.CustomTask.is(task)) {
                    this.openConfig(task);
                }
            });
            picker.items = entries;
            picker.show();
            return new Promise(resolve => {
                this._register(picker.onDidAccept(async () => {
                    const selectedEntry = picker.selectedItems ? picker.selectedItems[0] : undefined;
                    picker.dispose();
                    if (!selectedEntry) {
                        resolve(undefined);
                    }
                    resolve(selectedEntry);
                }));
            });
        }
        _needsRecentTasksMigration() {
            return (this.getRecentlyUsedTasksV1().size > 0) && (this._getTasksFromStorage('historical').size === 0);
        }
        async _migrateRecentTasks(tasks) {
            if (!this._needsRecentTasksMigration()) {
                return;
            }
            const recentlyUsedTasks = this.getRecentlyUsedTasksV1();
            const taskMap = Object.create(null);
            tasks.forEach(task => {
                const key = task.getKey();
                if (key) {
                    taskMap[key] = task;
                }
            });
            const reversed = [...recentlyUsedTasks.keys()].reverse();
            for (const key in reversed) {
                const task = taskMap[key];
                if (task) {
                    await this._setRecentlyUsedTask(task);
                }
            }
            this._storageService.remove(AbstractTaskService_1.RecentlyUsedTasks_Key, 1 /* StorageScope.WORKSPACE */);
        }
        _showIgnoredFoldersMessage() {
            if (this.ignoredWorkspaceFolders.length === 0 || !this.showIgnoreMessage) {
                return Promise.resolve(undefined);
            }
            this._notificationService.prompt(severity_1.default.Info, nls.localize('TaskService.ignoredFolder', 'The following workspace folders are ignored since they use task version 0.1.0: {0}', this.ignoredWorkspaceFolders.map(f => f.name).join(', ')), [{
                    label: nls.localize('TaskService.notAgain', "Don't Show Again"),
                    isSecondary: true,
                    run: () => {
                        this._storageService.store(AbstractTaskService_1.IgnoreTask010DonotShowAgain_key, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                        this._showIgnoreMessage = false;
                    }
                }]);
            return Promise.resolve(undefined);
        }
        async _trust() {
            if (taskService_1.ServerlessWebContext && !taskService_1.TaskExecutionSupportedContext) {
                return false;
            }
            await this._workspaceTrustManagementService.workspaceTrustInitialized;
            if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
                return (await this._workspaceTrustRequestService.requestWorkspaceTrust({
                    message: nls.localize('TaskService.requestTrust', "Listing and running tasks requires that some of the files in this workspace be executed as code.")
                })) === true;
            }
            return true;
        }
        async _runTaskCommand(filter) {
            if (!this._tasksReconnected) {
                return;
            }
            if (!filter) {
                return this._doRunTaskCommand();
            }
            const type = typeof filter === 'string' ? undefined : filter.type;
            const taskName = typeof filter === 'string' ? filter : filter.task;
            const grouped = await this._getGroupedTasks({ type });
            const identifier = this._getTaskIdentifier(filter);
            const tasks = grouped.all();
            const resolver = this._createResolver(grouped);
            const folderURIs = this._contextService.getWorkspace().folders.map(folder => folder.uri);
            if (this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                folderURIs.push(this._contextService.getWorkspace().configuration);
            }
            folderURIs.push(tasks_1.USER_TASKS_GROUP_KEY);
            if (identifier) {
                for (const uri of folderURIs) {
                    const task = await resolver.resolve(uri, identifier);
                    if (task) {
                        this.run(task);
                        return;
                    }
                }
            }
            const exactMatchTask = !taskName ? undefined : tasks.find(t => t.configurationProperties.identifier === taskName || t.getDefinition(true)?.configurationProperties?.identifier === taskName);
            if (!exactMatchTask) {
                return this._doRunTaskCommand(tasks, type, taskName);
            }
            for (const uri of folderURIs) {
                const task = await resolver.resolve(uri, taskName);
                if (task) {
                    await this.run(task, { attachProblemMatcher: true }, 1 /* TaskRunSource.User */);
                    return;
                }
            }
        }
        _tasksAndGroupedTasks(filter) {
            if (!this._versionAndEngineCompatible(filter)) {
                return { tasks: Promise.resolve([]), grouped: Promise.resolve(new TaskMap()) };
            }
            const grouped = this._getGroupedTasks(filter);
            const tasks = grouped.then((map) => {
                if (!filter || !filter.type) {
                    return map.all();
                }
                const result = [];
                map.forEach((tasks) => {
                    for (const task of tasks) {
                        if (tasks_1.ContributedTask.is(task) && task.defines.type === filter.type) {
                            result.push(task);
                        }
                        else if (tasks_1.CustomTask.is(task)) {
                            if (task.type === filter.type) {
                                result.push(task);
                            }
                            else {
                                const customizes = task.customizes();
                                if (customizes && customizes.type === filter.type) {
                                    result.push(task);
                                }
                            }
                        }
                    }
                });
                return result;
            });
            return { tasks, grouped };
        }
        _doRunTaskCommand(tasks, type, name) {
            const pickThen = (task) => {
                if (task === undefined) {
                    return;
                }
                if (task === null) {
                    this._runConfigureTasks();
                }
                else {
                    this.run(task, { attachProblemMatcher: true }, 1 /* TaskRunSource.User */).then(undefined, reason => {
                        // eat the error, it has already been surfaced to the user and we don't care about it here
                    });
                }
            };
            const placeholder = nls.localize('TaskService.pickRunTask', 'Select the task to run');
            this._showIgnoredFoldersMessage().then(() => {
                if (this._configurationService.getValue(USE_SLOW_PICKER)) {
                    let taskResult = undefined;
                    if (!tasks) {
                        taskResult = this._tasksAndGroupedTasks();
                    }
                    this._showQuickPick(tasks ? tasks : taskResult.tasks, placeholder, {
                        label: '$(plus) ' + nls.localize('TaskService.noEntryToRun', 'Configure a Task'),
                        task: null
                    }, true, undefined, undefined, undefined, name).
                        then((entry) => {
                        return pickThen(entry ? entry.task : undefined);
                    });
                }
                else {
                    this._showTwoLevelQuickPick(placeholder, {
                        label: '$(plus) ' + nls.localize('TaskService.noEntryToRun', 'Configure a Task'),
                        task: null
                    }, type, name).
                        then(pickThen);
                }
            });
        }
        _reRunTaskCommand() {
            problemMatcher_1.ProblemMatcherRegistry.onReady().then(() => {
                return this._editorService.saveAll({ reason: 2 /* SaveReason.AUTO */ }).then(() => {
                    const executeResult = this._getTaskSystem().rerun();
                    if (executeResult) {
                        return this._handleExecuteResult(executeResult);
                    }
                    else {
                        if (!this._taskRunningState.get()) {
                            // No task running, prompt to ask which to run
                            this._doRunTaskCommand();
                        }
                        return Promise.resolve(undefined);
                    }
                });
            });
        }
        /**
         *
         * @param tasks - The tasks which need to be filtered
         * @param tasksInList - This tells splitPerGroupType to filter out globbed tasks (into defaults)
         * @returns
         */
        _getDefaultTasks(tasks, taskGlobsInList = false) {
            const defaults = [];
            for (const task of tasks) {
                // At this point (assuming taskGlobsInList is true) there are tasks with matching globs, so only put those in defaults
                if (taskGlobsInList && typeof task.configurationProperties.group.isDefault === 'string') {
                    defaults.push(task);
                }
                else if (!taskGlobsInList && task.configurationProperties.group.isDefault === true) {
                    defaults.push(task);
                }
            }
            return defaults;
        }
        _runTaskGroupCommand(taskGroup, strings, configure, legacyCommand) {
            if (this.schemaVersion === 1 /* JsonSchemaVersion.V0_1_0 */) {
                legacyCommand();
                return;
            }
            const options = {
                location: 10 /* ProgressLocation.Window */,
                title: strings.fetching
            };
            const promise = (async () => {
                let groupTasks = [];
                async function runSingleTask(task, problemMatcherOptions, that) {
                    that.run(task, problemMatcherOptions, 1 /* TaskRunSource.User */).then(undefined, reason => {
                        // eat the error, it has already been surfaced to the user and we don't care about it here
                    });
                }
                const chooseAndRunTask = (tasks) => {
                    this._showIgnoredFoldersMessage().then(() => {
                        this._showQuickPick(tasks, strings.select, {
                            label: strings.notFoundConfigure,
                            task: null
                        }, true).then((entry) => {
                            const task = entry ? entry.task : undefined;
                            if (task === undefined) {
                                return;
                            }
                            if (task === null) {
                                configure.apply(this);
                                return;
                            }
                            runSingleTask(task, { attachProblemMatcher: true }, this);
                        });
                    });
                };
                let globTasksDetected = false;
                // First check for globs before checking for the default tasks of the task group
                const absoluteURI = editor_1.EditorResourceAccessor.getOriginalUri(this._editorService.activeEditor);
                if (absoluteURI) {
                    const workspaceFolder = this._contextService.getWorkspaceFolder(absoluteURI);
                    if (workspaceFolder) {
                        const configuredTasks = this._getConfiguration(workspaceFolder)?.config?.tasks;
                        if (configuredTasks) {
                            globTasksDetected = configuredTasks.filter(task => task.group && typeof task.group !== 'string' && typeof task.group.isDefault === 'string').length > 0;
                            // This will activate extensions, so only do so if necessary #185960
                            if (globTasksDetected) {
                                // Fallback to absolute path of the file if it is not in a workspace or relative path cannot be found
                                const relativePath = workspaceFolder?.uri ? (resources.relativePath(workspaceFolder.uri, absoluteURI) ?? absoluteURI.path) : absoluteURI.path;
                                groupTasks = await this._findWorkspaceTasks((task) => {
                                    const currentTaskGroup = task.configurationProperties.group;
                                    if (currentTaskGroup && typeof currentTaskGroup !== 'string' && typeof currentTaskGroup.isDefault === 'string') {
                                        return (currentTaskGroup._id === taskGroup._id && glob.match(currentTaskGroup.isDefault, relativePath));
                                    }
                                    return false;
                                });
                            }
                        }
                    }
                }
                if (!globTasksDetected && groupTasks.length === 0) {
                    groupTasks = await this._findWorkspaceTasksInGroup(taskGroup, true);
                }
                const handleMultipleTasks = (areGlobTasks) => {
                    return this._getTasksForGroup(taskGroup).then((tasks) => {
                        if (tasks.length > 0) {
                            // If we're dealing with tasks that were chosen because of a glob match,
                            // then put globs in the defaults and everything else in none
                            const defaults = this._getDefaultTasks(tasks, areGlobTasks);
                            if (defaults.length === 1) {
                                runSingleTask(defaults[0], undefined, this);
                                return;
                            }
                            else if (defaults.length > 0) {
                                tasks = defaults;
                            }
                        }
                        // At this this point there are multiple tasks.
                        chooseAndRunTask(tasks);
                    });
                };
                const resolveTaskAndRun = (taskGroupTask) => {
                    if (tasks_1.ConfiguringTask.is(taskGroupTask)) {
                        this.tryResolveTask(taskGroupTask).then(resolvedTask => {
                            runSingleTask(resolvedTask, undefined, this);
                        });
                    }
                    else {
                        runSingleTask(taskGroupTask, undefined, this);
                    }
                };
                // A single default glob task was returned, just run it directly
                if (groupTasks.length === 1) {
                    return resolveTaskAndRun(groupTasks[0]);
                }
                // If there's multiple globs that match we want to show the quick picker for those tasks
                // We will need to call splitPerGroupType putting globs in defaults and the remaining tasks in none.
                // We don't need to carry on after here
                if (globTasksDetected && groupTasks.length > 1) {
                    return handleMultipleTasks(true);
                }
                // If no globs are found or matched fallback to checking for default tasks of the task group
                if (!groupTasks.length) {
                    groupTasks = await this._findWorkspaceTasksInGroup(taskGroup, false);
                }
                // A single default task was returned, just run it directly
                if (groupTasks.length === 1) {
                    return resolveTaskAndRun(groupTasks[0]);
                }
                // Multiple default tasks returned, show the quickPicker
                return handleMultipleTasks(false);
            })();
            this._progressService.withProgress(options, () => promise);
        }
        _runBuildCommand() {
            if (!this._tasksReconnected) {
                return;
            }
            return this._runTaskGroupCommand(tasks_1.TaskGroup.Build, {
                fetching: nls.localize('TaskService.fetchingBuildTasks', 'Fetching build tasks...'),
                select: nls.localize('TaskService.pickBuildTask', 'Select the build task to run'),
                notFoundConfigure: nls.localize('TaskService.noBuildTask', 'No build task to run found. Configure Build Task...')
            }, this._runConfigureDefaultBuildTask, this._build);
        }
        _runTestCommand() {
            return this._runTaskGroupCommand(tasks_1.TaskGroup.Test, {
                fetching: nls.localize('TaskService.fetchingTestTasks', 'Fetching test tasks...'),
                select: nls.localize('TaskService.pickTestTask', 'Select the test task to run'),
                notFoundConfigure: nls.localize('TaskService.noTestTaskTerminal', 'No test task to run found. Configure Tasks...')
            }, this._runConfigureDefaultTestTask, this._runTest);
        }
        _runTerminateCommand(arg) {
            if (arg === 'terminateAll') {
                this._terminateAll();
                return;
            }
            const runQuickPick = (promise) => {
                this._showQuickPick(promise || this.getActiveTasks(), nls.localize('TaskService.taskToTerminate', 'Select a task to terminate'), {
                    label: nls.localize('TaskService.noTaskRunning', 'No task is currently running'),
                    task: undefined
                }, false, true, undefined, [{
                        label: nls.localize('TaskService.terminateAllRunningTasks', 'All Running Tasks'),
                        id: 'terminateAll',
                        task: undefined
                    }]).then(entry => {
                    if (entry && entry.id === 'terminateAll') {
                        this._terminateAll();
                    }
                    const task = entry ? entry.task : undefined;
                    if (task === undefined || task === null) {
                        return;
                    }
                    this.terminate(task);
                });
            };
            if (this.inTerminal()) {
                const identifier = this._getTaskIdentifier(arg);
                let promise;
                if (identifier !== undefined) {
                    promise = this.getActiveTasks();
                    promise.then((tasks) => {
                        for (const task of tasks) {
                            if (task.matches(identifier)) {
                                this.terminate(task);
                                return;
                            }
                        }
                        runQuickPick(promise);
                    });
                }
                else {
                    runQuickPick();
                }
            }
            else {
                this._isActive().then((active) => {
                    if (active) {
                        this._terminateAll().then((responses) => {
                            // the output runner has only one task
                            const response = responses[0];
                            if (response.success) {
                                return;
                            }
                            if (response.code && response.code === 3 /* TerminateResponseCode.ProcessNotFound */) {
                                this._notificationService.error(nls.localize('TerminateAction.noProcess', 'The launched process doesn\'t exist anymore. If the task spawned background tasks exiting VS Code might result in orphaned processes.'));
                            }
                            else {
                                this._notificationService.error(nls.localize('TerminateAction.failed', 'Failed to terminate running task'));
                            }
                        });
                    }
                });
            }
        }
        async _runRestartTaskCommand(arg) {
            const activeTasks = await this.getActiveTasks();
            if (activeTasks.length === 1) {
                this._restart(activeTasks[0]);
                return;
            }
            if (this.inTerminal()) {
                // try dispatching using task identifier
                const identifier = this._getTaskIdentifier(arg);
                if (identifier !== undefined) {
                    for (const task of activeTasks) {
                        if (task.matches(identifier)) {
                            this._restart(task);
                            return;
                        }
                    }
                }
                // show quick pick with active tasks
                const entry = await this._showQuickPick(activeTasks, nls.localize('TaskService.taskToRestart', 'Select the task to restart'), {
                    label: nls.localize('TaskService.noTaskToRestart', 'No task to restart'),
                    task: null
                }, false, true);
                if (entry && entry.task) {
                    this._restart(entry.task);
                }
            }
            else {
                if (activeTasks.length > 0) {
                    this._restart(activeTasks[0]);
                }
            }
        }
        _getTaskIdentifier(filter) {
            let result = undefined;
            if (Types.isString(filter)) {
                result = filter;
            }
            else if (filter && Types.isString(filter.type)) {
                result = tasks_1.TaskDefinition.createTaskIdentifier(filter, console);
            }
            return result;
        }
        _configHasTasks(taskConfig) {
            return !!taskConfig && !!taskConfig.tasks && taskConfig.tasks.length > 0;
        }
        _openTaskFile(resource, taskSource) {
            let configFileCreated = false;
            this._fileService.stat(resource).then((stat) => stat, () => undefined).then(async (stat) => {
                const fileExists = !!stat;
                const configValue = this._configurationService.inspect('tasks');
                let tasksExistInFile;
                let target;
                switch (taskSource) {
                    case tasks_1.TaskSourceKind.User:
                        tasksExistInFile = this._configHasTasks(configValue.userValue);
                        target = 2 /* ConfigurationTarget.USER */;
                        break;
                    case tasks_1.TaskSourceKind.WorkspaceFile:
                        tasksExistInFile = this._configHasTasks(configValue.workspaceValue);
                        target = 5 /* ConfigurationTarget.WORKSPACE */;
                        break;
                    default:
                        tasksExistInFile = this._configHasTasks(configValue.workspaceFolderValue);
                        target = 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
                }
                let content;
                if (!tasksExistInFile) {
                    const pickTemplateResult = await this._quickInputService.pick((0, taskTemplates_1.getTemplates)(), { placeHolder: nls.localize('TaskService.template', 'Select a Task Template') });
                    if (!pickTemplateResult) {
                        return Promise.resolve(undefined);
                    }
                    content = pickTemplateResult.content;
                    const editorConfig = this._configurationService.getValue();
                    if (editorConfig.editor.insertSpaces) {
                        content = content.replace(/(\n)(\t+)/g, (_, s1, s2) => s1 + ' '.repeat(s2.length * editorConfig.editor.tabSize));
                    }
                    configFileCreated = true;
                }
                if (!fileExists && content) {
                    return this._textFileService.create([{ resource, value: content }]).then(result => {
                        return result[0].resource;
                    });
                }
                else if (fileExists && (tasksExistInFile || content)) {
                    if (content) {
                        this._configurationService.updateValue('tasks', json.parse(content), target);
                    }
                    return stat?.resource;
                }
                return undefined;
            }).then((resource) => {
                if (!resource) {
                    return;
                }
                this._editorService.openEditor({
                    resource,
                    options: {
                        pinned: configFileCreated // pin only if config file is created #8727
                    }
                });
            });
        }
        _isTaskEntry(value) {
            const candidate = value;
            return candidate && !!candidate.task;
        }
        _isSettingEntry(value) {
            const candidate = value;
            return candidate && !!candidate.settingType;
        }
        _configureTask(task) {
            if (tasks_1.ContributedTask.is(task)) {
                this.customize(task, undefined, true);
            }
            else if (tasks_1.CustomTask.is(task)) {
                this.openConfig(task);
            }
            else if (tasks_1.ConfiguringTask.is(task)) {
                // Do nothing.
            }
        }
        _handleSelection(selection) {
            if (!selection) {
                return;
            }
            if (this._isTaskEntry(selection)) {
                this._configureTask(selection.task);
            }
            else if (this._isSettingEntry(selection)) {
                const taskQuickPick = this._instantiationService.createInstance(taskQuickPick_1.TaskQuickPick);
                taskQuickPick.handleSettingOption(selection.settingType);
            }
            else if (selection.folder && (this._contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */)) {
                this._openTaskFile(selection.folder.toResource('.vscode/tasks.json'), tasks_1.TaskSourceKind.Workspace);
            }
            else {
                const resource = this._getResourceForKind(tasks_1.TaskSourceKind.User);
                if (resource) {
                    this._openTaskFile(resource, tasks_1.TaskSourceKind.User);
                }
            }
        }
        getTaskDescription(task) {
            let description;
            if (task._source.kind === tasks_1.TaskSourceKind.User) {
                description = nls.localize('taskQuickPick.userSettings', 'User');
            }
            else if (task._source.kind === tasks_1.TaskSourceKind.WorkspaceFile) {
                description = task.getWorkspaceFileName();
            }
            else if (this.needsFolderQualification()) {
                const workspaceFolder = task.getWorkspaceFolder();
                if (workspaceFolder) {
                    description = workspaceFolder.name;
                }
            }
            return description;
        }
        async _runConfigureTasks() {
            if (!(await this._trust())) {
                return;
            }
            let taskPromise;
            if (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) {
                taskPromise = this._getGroupedTasks();
            }
            else {
                taskPromise = Promise.resolve(new TaskMap());
            }
            const stats = this._contextService.getWorkspace().folders.map((folder) => {
                return this._fileService.stat(folder.toResource('.vscode/tasks.json')).then(stat => stat, () => undefined);
            });
            const createLabel = nls.localize('TaskService.createJsonFile', 'Create tasks.json file from template');
            const openLabel = nls.localize('TaskService.openJsonFile', 'Open tasks.json file');
            const tokenSource = new cancellation_1.CancellationTokenSource();
            const cancellationToken = tokenSource.token;
            const entries = Promise.all(stats).then((stats) => {
                return taskPromise.then((taskMap) => {
                    const entries = [];
                    let configuredCount = 0;
                    let tasks = taskMap.all();
                    if (tasks.length > 0) {
                        tasks = tasks.sort((a, b) => a._label.localeCompare(b._label));
                        for (const task of tasks) {
                            const entry = { label: taskQuickPick_1.TaskQuickPick.getTaskLabelWithIcon(task), task, description: this.getTaskDescription(task), detail: this._showDetail() ? task.configurationProperties.detail : undefined };
                            taskQuickPick_1.TaskQuickPick.applyColorStyles(task, entry, this._themeService);
                            entries.push(entry);
                            if (!tasks_1.ContributedTask.is(task)) {
                                configuredCount++;
                            }
                        }
                    }
                    const needsCreateOrOpen = (configuredCount === 0);
                    // If the only configured tasks are user tasks, then we should also show the option to create from a template.
                    if (needsCreateOrOpen || (taskMap.get(tasks_1.USER_TASKS_GROUP_KEY).length === configuredCount)) {
                        const label = stats[0] !== undefined ? openLabel : createLabel;
                        if (entries.length) {
                            entries.push({ type: 'separator' });
                        }
                        entries.push({ label, folder: this._contextService.getWorkspace().folders[0] });
                    }
                    if ((entries.length === 1) && !needsCreateOrOpen) {
                        tokenSource.cancel();
                    }
                    return entries;
                });
            });
            const timeout = await Promise.race([new Promise((resolve) => {
                    entries.then(() => resolve(false));
                }), new Promise((resolve) => {
                    const timer = setTimeout(() => {
                        clearTimeout(timer);
                        resolve(true);
                    }, 200);
                })]);
            if (!timeout && ((await entries).length === 1) && this._configurationService.getValue(taskQuickPick_1.QUICKOPEN_SKIP_CONFIG)) {
                const entry = ((await entries)[0]);
                if (entry.task) {
                    this._handleSelection(entry);
                    return;
                }
            }
            const entriesWithSettings = entries.then(resolvedEntries => {
                resolvedEntries.push(...taskQuickPick_1.TaskQuickPick.allSettingEntries(this._configurationService));
                return resolvedEntries;
            });
            this._quickInputService.pick(entriesWithSettings, { placeHolder: nls.localize('TaskService.pickTask', 'Select a task to configure') }, cancellationToken).
                then(async (selection) => {
                if (cancellationToken.isCancellationRequested) {
                    // canceled when there's only one task
                    const task = (await entries)[0];
                    if (task.task) {
                        selection = task;
                    }
                }
                this._handleSelection(selection);
            });
        }
        _runConfigureDefaultBuildTask() {
            if (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) {
                this.tasks().then((tasks => {
                    if (tasks.length === 0) {
                        this._runConfigureTasks();
                        return;
                    }
                    const entries = [];
                    let selectedTask;
                    let selectedEntry;
                    this._showIgnoredFoldersMessage().then(() => {
                        for (const task of tasks) {
                            const taskGroup = tasks_1.TaskGroup.from(task.configurationProperties.group);
                            if (taskGroup && taskGroup.isDefault && taskGroup._id === tasks_1.TaskGroup.Build._id) {
                                const label = nls.localize('TaskService.defaultBuildTaskExists', '{0} is already marked as the default build task', taskQuickPick_1.TaskQuickPick.getTaskLabelWithIcon(task, task.getQualifiedLabel()));
                                selectedTask = task;
                                selectedEntry = { label, task, description: this.getTaskDescription(task), detail: this._showDetail() ? task.configurationProperties.detail : undefined };
                                taskQuickPick_1.TaskQuickPick.applyColorStyles(task, selectedEntry, this._themeService);
                            }
                            else {
                                const entry = { label: taskQuickPick_1.TaskQuickPick.getTaskLabelWithIcon(task), task, description: this.getTaskDescription(task), detail: this._showDetail() ? task.configurationProperties.detail : undefined };
                                taskQuickPick_1.TaskQuickPick.applyColorStyles(task, entry, this._themeService);
                                entries.push(entry);
                            }
                        }
                        if (selectedEntry) {
                            entries.unshift(selectedEntry);
                        }
                        const tokenSource = new cancellation_1.CancellationTokenSource();
                        const cancellationToken = tokenSource.token;
                        this._quickInputService.pick(entries, { placeHolder: nls.localize('TaskService.pickTask', 'Select a task to configure') }, cancellationToken).
                            then(async (entry) => {
                            if (cancellationToken.isCancellationRequested) {
                                // canceled when there's only one task
                                const task = (await entries)[0];
                                if (task.task) {
                                    entry = task;
                                }
                            }
                            const task = entry && 'task' in entry ? entry.task : undefined;
                            if ((task === undefined) || (task === null)) {
                                return;
                            }
                            if (task === selectedTask && tasks_1.CustomTask.is(task)) {
                                this.openConfig(task);
                            }
                            if (!tasks_1.InMemoryTask.is(task)) {
                                this.customize(task, { group: { kind: 'build', isDefault: true } }, true).then(() => {
                                    if (selectedTask && (task !== selectedTask) && !tasks_1.InMemoryTask.is(selectedTask)) {
                                        this.customize(selectedTask, { group: 'build' }, false);
                                    }
                                });
                            }
                        });
                        this._quickInputService.pick(entries, {
                            placeHolder: nls.localize('TaskService.pickDefaultBuildTask', 'Select the task to be used as the default build task')
                        }).
                            then((entry) => {
                            const task = entry && 'task' in entry ? entry.task : undefined;
                            if ((task === undefined) || (task === null)) {
                                return;
                            }
                            if (task === selectedTask && tasks_1.CustomTask.is(task)) {
                                this.openConfig(task);
                            }
                            if (!tasks_1.InMemoryTask.is(task)) {
                                this.customize(task, { group: { kind: 'build', isDefault: true } }, true).then(() => {
                                    if (selectedTask && (task !== selectedTask) && !tasks_1.InMemoryTask.is(selectedTask)) {
                                        this.customize(selectedTask, { group: 'build' }, false);
                                    }
                                });
                            }
                        });
                    });
                }));
            }
            else {
                this._runConfigureTasks();
            }
        }
        _runConfigureDefaultTestTask() {
            if (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) {
                this.tasks().then((tasks => {
                    if (tasks.length === 0) {
                        this._runConfigureTasks();
                        return;
                    }
                    let selectedTask;
                    let selectedEntry;
                    for (const task of tasks) {
                        const taskGroup = tasks_1.TaskGroup.from(task.configurationProperties.group);
                        if (taskGroup && taskGroup.isDefault && taskGroup._id === tasks_1.TaskGroup.Test._id) {
                            selectedTask = task;
                            break;
                        }
                    }
                    if (selectedTask) {
                        selectedEntry = {
                            label: nls.localize('TaskService.defaultTestTaskExists', '{0} is already marked as the default test task.', selectedTask.getQualifiedLabel()),
                            task: selectedTask,
                            detail: this._showDetail() ? selectedTask.configurationProperties.detail : undefined
                        };
                    }
                    this._showIgnoredFoldersMessage().then(() => {
                        this._showQuickPick(tasks, nls.localize('TaskService.pickDefaultTestTask', 'Select the task to be used as the default test task'), undefined, true, false, selectedEntry).then((entry) => {
                            const task = entry ? entry.task : undefined;
                            if (!task) {
                                return;
                            }
                            if (task === selectedTask && tasks_1.CustomTask.is(task)) {
                                this.openConfig(task);
                            }
                            if (!tasks_1.InMemoryTask.is(task)) {
                                this.customize(task, { group: { kind: 'test', isDefault: true } }, true).then(() => {
                                    if (selectedTask && (task !== selectedTask) && !tasks_1.InMemoryTask.is(selectedTask)) {
                                        this.customize(selectedTask, { group: 'test' }, false);
                                    }
                                });
                            }
                        });
                    });
                }));
            }
            else {
                this._runConfigureTasks();
            }
        }
        async runShowTasks() {
            const activeTasksPromise = this.getActiveTasks();
            const activeTasks = await activeTasksPromise;
            let group;
            if (activeTasks.length === 1) {
                this._taskSystem.revealTask(activeTasks[0]);
            }
            else if (activeTasks.length && activeTasks.every((task) => {
                if (tasks_1.InMemoryTask.is(task)) {
                    return false;
                }
                if (!group) {
                    group = task.command.presentation?.group;
                }
                return task.command.presentation?.group && (task.command.presentation.group === group);
            })) {
                this._taskSystem.revealTask(activeTasks[0]);
            }
            else {
                this._showQuickPick(activeTasksPromise, nls.localize('TaskService.pickShowTask', 'Select the task to show its output'), {
                    label: nls.localize('TaskService.noTaskIsRunning', 'No task is running'),
                    task: null
                }, false, true).then((entry) => {
                    const task = entry ? entry.task : undefined;
                    if (task === undefined || task === null) {
                        return;
                    }
                    this._taskSystem.revealTask(task);
                });
            }
        }
        async _createTasksDotOld(folder) {
            const tasksFile = folder.toResource('.vscode/tasks.json');
            if (await this._fileService.exists(tasksFile)) {
                const oldFile = tasksFile.with({ path: `${tasksFile.path}.old` });
                await this._fileService.copy(tasksFile, oldFile, true);
                return [oldFile, tasksFile];
            }
            return undefined;
        }
        _upgradeTask(task, suppressTaskName, globalConfig) {
            if (!tasks_1.CustomTask.is(task)) {
                return;
            }
            const configElement = {
                label: task._label
            };
            const oldTaskTypes = new Set(['gulp', 'jake', 'grunt']);
            if (Types.isString(task.command.name) && oldTaskTypes.has(task.command.name)) {
                configElement.type = task.command.name;
                configElement.task = task.command.args[0];
            }
            else {
                if (task.command.runtime === tasks_1.RuntimeType.Shell) {
                    configElement.type = tasks_1.RuntimeType.toString(tasks_1.RuntimeType.Shell);
                }
                if (task.command.name && !suppressTaskName && !globalConfig.windows?.command && !globalConfig.osx?.command && !globalConfig.linux?.command) {
                    configElement.command = task.command.name;
                }
                else if (suppressTaskName) {
                    configElement.command = task._source.config.element.command;
                }
                if (task.command.args && (!Array.isArray(task.command.args) || (task.command.args.length > 0))) {
                    if (!globalConfig.windows?.args && !globalConfig.osx?.args && !globalConfig.linux?.args) {
                        configElement.args = task.command.args;
                    }
                    else {
                        configElement.args = task._source.config.element.args;
                    }
                }
            }
            if (task.configurationProperties.presentation) {
                configElement.presentation = task.configurationProperties.presentation;
            }
            if (task.configurationProperties.isBackground) {
                configElement.isBackground = task.configurationProperties.isBackground;
            }
            if (task.configurationProperties.problemMatchers) {
                configElement.problemMatcher = task._source.config.element.problemMatcher;
            }
            if (task.configurationProperties.group) {
                configElement.group = task.configurationProperties.group;
            }
            task._source.config.element = configElement;
            const tempTask = new tasks_1.CustomTask(task._id, task._source, task._label, task.type, task.command, task.hasDefinedMatchers, task.runOptions, task.configurationProperties);
            const configTask = this._createCustomizableTask(tempTask);
            if (configTask) {
                return configTask;
            }
            return;
        }
        async _upgrade() {
            if (this.schemaVersion === 2 /* JsonSchemaVersion.V2_0_0 */) {
                return;
            }
            if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
                this._register(event_1.Event.once(this._workspaceTrustManagementService.onDidChangeTrust)(isTrusted => {
                    if (isTrusted) {
                        this._upgrade();
                    }
                }));
                return;
            }
            const tasks = await this._getGroupedTasks();
            const fileDiffs = [];
            for (const folder of this.workspaceFolders) {
                const diff = await this._createTasksDotOld(folder);
                if (diff) {
                    fileDiffs.push(diff);
                }
                if (!diff) {
                    continue;
                }
                const configTasks = [];
                const suppressTaskName = !!this._configurationService.getValue("tasks.suppressTaskName" /* TasksSchemaProperties.SuppressTaskName */, { resource: folder.uri });
                const globalConfig = {
                    windows: this._configurationService.getValue("tasks.windows" /* TasksSchemaProperties.Windows */, { resource: folder.uri }),
                    osx: this._configurationService.getValue("tasks.osx" /* TasksSchemaProperties.Osx */, { resource: folder.uri }),
                    linux: this._configurationService.getValue("tasks.linux" /* TasksSchemaProperties.Linux */, { resource: folder.uri })
                };
                tasks.get(folder).forEach(task => {
                    const configTask = this._upgradeTask(task, suppressTaskName, globalConfig);
                    if (configTask) {
                        configTasks.push(configTask);
                    }
                });
                this._taskSystem = undefined;
                this._workspaceTasksPromise = undefined;
                await this._writeConfiguration(folder, 'tasks.tasks', configTasks);
                await this._writeConfiguration(folder, 'tasks.version', '2.0.0');
                if (this._configurationService.getValue("tasks.showOutput" /* TasksSchemaProperties.ShowOutput */, { resource: folder.uri })) {
                    await this._configurationService.updateValue("tasks.showOutput" /* TasksSchemaProperties.ShowOutput */, undefined, { resource: folder.uri });
                }
                if (this._configurationService.getValue("tasks.isShellCommand" /* TasksSchemaProperties.IsShellCommand */, { resource: folder.uri })) {
                    await this._configurationService.updateValue("tasks.isShellCommand" /* TasksSchemaProperties.IsShellCommand */, undefined, { resource: folder.uri });
                }
                if (this._configurationService.getValue("tasks.suppressTaskName" /* TasksSchemaProperties.SuppressTaskName */, { resource: folder.uri })) {
                    await this._configurationService.updateValue("tasks.suppressTaskName" /* TasksSchemaProperties.SuppressTaskName */, undefined, { resource: folder.uri });
                }
            }
            this._updateSetup();
            this._notificationService.prompt(severity_1.default.Warning, fileDiffs.length === 1 ?
                nls.localize('taskService.upgradeVersion', "The deprecated tasks version 0.1.0 has been removed. Your tasks have been upgraded to version 2.0.0. Open the diff to review the upgrade.")
                : nls.localize('taskService.upgradeVersionPlural', "The deprecated tasks version 0.1.0 has been removed. Your tasks have been upgraded to version 2.0.0. Open the diffs to review the upgrade."), [{
                    label: fileDiffs.length === 1 ? nls.localize('taskService.openDiff', "Open diff") : nls.localize('taskService.openDiffs', "Open diffs"),
                    run: async () => {
                        for (const upgrade of fileDiffs) {
                            await this._editorService.openEditor({
                                original: { resource: upgrade[0] },
                                modified: { resource: upgrade[1] }
                            });
                        }
                    }
                }]);
        }
    };
    exports.AbstractTaskService = AbstractTaskService;
    exports.AbstractTaskService = AbstractTaskService = AbstractTaskService_1 = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, markers_1.IMarkerService),
        __param(2, output_1.IOutputService),
        __param(3, panecomposite_1.IPaneCompositePartService),
        __param(4, viewsService_1.IViewsService),
        __param(5, commands_1.ICommandService),
        __param(6, editorService_1.IEditorService),
        __param(7, files_1.IFileService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, textfiles_1.ITextFileService),
        __param(11, model_1.IModelService),
        __param(12, extensions_1.IExtensionService),
        __param(13, quickInput_1.IQuickInputService),
        __param(14, configurationResolver_1.IConfigurationResolverService),
        __param(15, terminal_1.ITerminalService),
        __param(16, terminal_1.ITerminalGroupService),
        __param(17, storage_1.IStorageService),
        __param(18, progress_1.IProgressService),
        __param(19, opener_1.IOpenerService),
        __param(20, dialogs_1.IDialogService),
        __param(21, notification_1.INotificationService),
        __param(22, contextkey_1.IContextKeyService),
        __param(23, environmentService_1.IWorkbenchEnvironmentService),
        __param(24, terminal_2.ITerminalProfileResolverService),
        __param(25, pathService_1.IPathService),
        __param(26, resolverService_1.ITextModelService),
        __param(27, preferences_1.IPreferencesService),
        __param(28, views_1.IViewDescriptorService),
        __param(29, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(30, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(31, log_1.ILogService),
        __param(32, themeService_1.IThemeService),
        __param(33, lifecycle_2.ILifecycleService),
        __param(34, remoteAgentService_1.IRemoteAgentService),
        __param(35, instantiation_1.IInstantiationService)
    ], AbstractTaskService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RUYXNrU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGFza3MvYnJvd3Nlci9hYnN0cmFjdFRhc2tTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtRmhHLE1BQU0sOEJBQThCLEdBQUcsd0JBQXdCLENBQUM7SUFDaEUsTUFBTSw0QkFBNEIsR0FBRyxrQ0FBa0MsQ0FBQztJQUN4RSxNQUFNLGVBQWUsR0FBRyx3QkFBd0IsQ0FBQztJQUVqRCxJQUFpQixtQkFBbUIsQ0FHbkM7SUFIRCxXQUFpQixtQkFBbUI7UUFDdEIsc0JBQUUsR0FBRyw0Q0FBNEMsQ0FBQztRQUNsRCx3QkFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN2RixDQUFDLEVBSGdCLG1CQUFtQixtQ0FBbkIsbUJBQW1CLFFBR25DO0lBSUQsTUFBTSxlQUFlO1FBSXBCLFlBQW9CLGNBQThCO1lBQTlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUNqRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDO1FBQ2pELENBQUM7UUFFTSxJQUFJLENBQUMsT0FBZTtZQUMxQixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSywrQkFBdUIsQ0FBQztZQUNwRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLElBQUksQ0FBQyxPQUFlO1lBQzFCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLGtDQUEwQixDQUFDO1lBQ3ZELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM1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
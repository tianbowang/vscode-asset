/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/severity", "vs/base/common/types", "vs/nls", "vs/platform/markers/common/markers", "vs/workbench/contrib/markers/common/markers", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/base/common/codicons", "vs/base/common/network", "vs/base/common/themables", "vs/base/common/uri", "vs/platform/terminal/common/terminalStrings", "vs/workbench/contrib/tasks/browser/taskTerminalStatus", "vs/workbench/contrib/tasks/common/problemCollectors", "vs/workbench/contrib/tasks/common/taskConfiguration", "vs/workbench/contrib/tasks/common/taskSystem", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/terminal/browser/terminalEscapeSequences", "vs/workbench/contrib/terminal/browser/terminalProcessExtHostProxy", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, arrays_1, Async, event_1, extpath_1, lifecycle_1, map_1, Objects, path, Platform, resources, severity_1, Types, nls, markers_1, markers_2, problemMatcher_1, codicons_1, network_1, themables_1, uri_1, terminalStrings_1, taskTerminalStatus_1, problemCollectors_1, taskConfiguration_1, taskSystem_1, tasks_1, terminalEscapeSequences_1, terminalProcessExtHostProxy_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalTaskSystem = void 0;
    const ReconnectionType = 'Task';
    class VariableResolver {
        static { this._regex = /\$\{(.*?)\}/g; }
        constructor(workspaceFolder, taskSystemInfo, values, _service) {
            this.workspaceFolder = workspaceFolder;
            this.taskSystemInfo = taskSystemInfo;
            this.values = values;
            this._service = _service;
        }
        async resolve(value) {
            const replacers = [];
            value.replace(VariableResolver._regex, (match, ...args) => {
                replacers.push(this._replacer(match, args));
                return match;
            });
            const resolvedReplacers = await Promise.all(replacers);
            return value.replace(VariableResolver._regex, () => resolvedReplacers.shift());
        }
        async _replacer(match, args) {
            // Strip out the ${} because the map contains them variables without those characters.
            const result = this.values.get(match.substring(2, match.length - 1));
            if ((result !== undefined) && (result !== null)) {
                return result;
            }
            if (this._service) {
                return this._service.resolveAsync(this.workspaceFolder, match);
            }
            return match;
        }
    }
    class VerifiedTask {
        constructor(task, resolver, trigger) {
            this.task = task;
            this.resolver = resolver;
            this.trigger = trigger;
        }
        verify() {
            let verified = false;
            if (this.trigger && this.resolvedVariables && this.workspaceFolder && (this.shellLaunchConfig !== undefined)) {
                verified = true;
            }
            return verified;
        }
        getVerifiedTask() {
            if (this.verify()) {
                return { task: this.task, resolver: this.resolver, trigger: this.trigger, resolvedVariables: this.resolvedVariables, systemInfo: this.systemInfo, workspaceFolder: this.workspaceFolder, shellLaunchConfig: this.shellLaunchConfig };
            }
            else {
                throw new Error('VerifiedTask was not checked. verify must be checked before getVerifiedTask.');
            }
        }
    }
    class TerminalTaskSystem extends lifecycle_1.Disposable {
        static { this.TelemetryEventName = 'taskService'; }
        static { this.ProcessVarName = '__process__'; }
        static { this._shellQuotes = {
            'cmd': {
                strong: '"'
            },
            'powershell': {
                escape: {
                    escapeChar: '`',
                    charsToEscape: ' "\'()'
                },
                strong: '\'',
                weak: '"'
            },
            'bash': {
                escape: {
                    escapeChar: '\\',
                    charsToEscape: ' "\''
                },
                strong: '\'',
                weak: '"'
            },
            'zsh': {
                escape: {
                    escapeChar: '\\',
                    charsToEscape: ' "\''
                },
                strong: '\'',
                weak: '"'
            }
        }; }
        static { this._osShellQuotes = {
            'Linux': TerminalTaskSystem._shellQuotes['bash'],
            'Mac': TerminalTaskSystem._shellQuotes['bash'],
            'Windows': TerminalTaskSystem._shellQuotes['powershell']
        }; }
        taskShellIntegrationStartSequence(cwd) {
            return ((0, terminalEscapeSequences_1.VSCodeSequence)("A" /* VSCodeOscPt.PromptStart */) +
                (0, terminalEscapeSequences_1.VSCodeSequence)("P" /* VSCodeOscPt.Property */, `${"Task" /* VSCodeOscProperty.Task */}=True`) +
                (cwd
                    ? (0, terminalEscapeSequences_1.VSCodeSequence)("P" /* VSCodeOscPt.Property */, `${"Cwd" /* VSCodeOscProperty.Cwd */}=${typeof cwd === 'string' ? cwd : cwd.fsPath}`)
                    : '') +
                (0, terminalEscapeSequences_1.VSCodeSequence)("B" /* VSCodeOscPt.CommandStart */));
        }
        get taskShellIntegrationOutputSequence() {
            return (0, terminalEscapeSequences_1.VSCodeSequence)("C" /* VSCodeOscPt.CommandExecuted */);
        }
        constructor(_terminalService, _terminalGroupService, _outputService, _paneCompositeService, _viewsService, _markerService, _modelService, _configurationResolverService, _contextService, _environmentService, _outputChannelId, _fileService, _terminalProfileResolverService, _pathService, _viewDescriptorService, _logService, _notificationService, instantiationService, taskSystemInfoResolver) {
            super();
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._outputService = _outputService;
            this._paneCompositeService = _paneCompositeService;
            this._viewsService = _viewsService;
            this._markerService = _markerService;
            this._modelService = _modelService;
            this._configurationResolverService = _configurationResolverService;
            this._contextService = _contextService;
            this._environmentService = _environmentService;
            this._outputChannelId = _outputChannelId;
            this._fileService = _fileService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._pathService = _pathService;
            this._viewDescriptorService = _viewDescriptorService;
            this._logService = _logService;
            this._notificationService = _notificationService;
            this._isRerun = false;
            this._terminalCreationQueue = Promise.resolve();
            this._hasReconnected = false;
            this._activeTasks = Object.create(null);
            this._busyTasks = Object.create(null);
            this._terminals = Object.create(null);
            this._idleTaskTerminals = new map_1.LinkedMap();
            this._sameTaskTerminals = Object.create(null);
            this._onDidStateChange = new event_1.Emitter();
            this._taskSystemInfoResolver = taskSystemInfoResolver;
            this._register(this._terminalStatusManager = instantiationService.createInstance(taskTerminalStatus_1.TaskTerminalStatus));
        }
        get onDidStateChange() {
            return this._onDidStateChange.event;
        }
        _log(value) {
            this._appendOutput(value + '\n');
        }
        _showOutput() {
            this._outputService.showChannel(this._outputChannelId, true);
        }
        reconnect(task, resolver) {
            this._reconnectToTerminals();
            return this.run(task, resolver, taskSystem_1.Triggers.reconnect);
        }
        run(task, resolver, trigger = taskSystem_1.Triggers.command) {
            task = task.clone(); // A small amount of task state is stored in the task (instance) and tasks passed in to run may have that set already.
            const instances = tasks_1.InMemoryTask.is(task) || this._isTaskEmpty(task) ? [] : this._getInstances(task);
            const validInstance = instances.length < ((task.runOptions && task.runOptions.instanceLimit) ?? 1);
            const instance = instances[0]?.count?.count ?? 0;
            this._currentTask = new VerifiedTask(task, resolver, trigger);
            if (instance > 0) {
                task.instance = instance;
            }
            if (!validInstance) {
                const terminalData = instances[instances.length - 1];
                this._lastTask = this._currentTask;
                return { kind: 2 /* TaskExecuteKind.Active */, task: terminalData.task, active: { same: true, background: task.configurationProperties.isBackground }, promise: terminalData.promise };
            }
            try {
                const executeResult = { kind: 1 /* TaskExecuteKind.Started */, task, started: {}, promise: this._executeTask(task, resolver, trigger, new Set(), new Map(), undefined) };
                executeResult.promise.then(summary => {
                    this._lastTask = this._currentTask;
                });
                return executeResult;
            }
            catch (error) {
                if (error instanceof taskSystem_1.TaskError) {
                    throw error;
                }
                else if (error instanceof Error) {
                    this._log(error.message);
                    throw new taskSystem_1.TaskError(severity_1.default.Error, error.message, 7 /* TaskErrors.UnknownError */);
                }
                else {
                    this._log(error.toString());
                    throw new taskSystem_1.TaskError(severity_1.default.Error, nls.localize('TerminalTaskSystem.unknownError', 'A unknown error has occurred while executing a task. See task output log for details.'), 7 /* TaskErrors.UnknownError */);
                }
            }
        }
        rerun() {
            if (this._lastTask && this._lastTask.verify()) {
                if ((this._lastTask.task.runOptions.reevaluateOnRerun !== undefined) && !this._lastTask.task.runOptions.reevaluateOnRerun) {
                    this._isRerun = true;
                }
                const result = this.run(this._lastTask.task, this._lastTask.resolver);
                result.promise.then(summary => {
                    this._isRerun = false;
                });
                return result;
            }
            else {
                return undefined;
            }
        }
        _showTaskLoadErrors(task) {
            if (task.taskLoadMessages && task.taskLoadMessages.length > 0) {
                task.taskLoadMessages.forEach(loadMessage => {
                    this._log(loadMessage + '\n');
                });
                const openOutput = 'Show Output';
                this._notificationService.prompt(severity_1.default.Warning, nls.localize('TerminalTaskSystem.taskLoadReporting', "There are issues with task \"{0}\". See the output for more details.", task._label), [{
                        label: openOutput,
                        run: () => this._showOutput()
                    }]);
            }
        }
        isTaskVisible(task) {
            const terminalData = this._activeTasks[task.getMapKey()];
            if (!terminalData?.terminal) {
                return false;
            }
            const activeTerminalInstance = this._terminalService.activeInstance;
            const isPanelShowingTerminal = !!this._viewsService.getActiveViewWithId(terminal_1.TERMINAL_VIEW_ID);
            return isPanelShowingTerminal && (activeTerminalInstance?.instanceId === terminalData.terminal.instanceId);
        }
        revealTask(task) {
            const terminalData = this._activeTasks[task.getMapKey()];
            if (!terminalData?.terminal) {
                return false;
            }
            const isTerminalInPanel = this._viewDescriptorService.getViewLocationById(terminal_1.TERMINAL_VIEW_ID) === 1 /* ViewContainerLocation.Panel */;
            if (isTerminalInPanel && this.isTaskVisible(task)) {
                if (this._previousPanelId) {
                    if (this._previousTerminalInstance) {
                        this._terminalService.setActiveInstance(this._previousTerminalInstance);
                    }
                    this._paneCompositeService.openPaneComposite(this._previousPanelId, 1 /* ViewContainerLocation.Panel */);
                }
                else {
                    this._paneCompositeService.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                }
                this._previousPanelId = undefined;
                this._previousTerminalInstance = undefined;
            }
            else {
                if (isTerminalInPanel) {
                    this._previousPanelId = this._paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)?.getId();
                    if (this._previousPanelId === terminal_1.TERMINAL_VIEW_ID) {
                        this._previousTerminalInstance = this._terminalService.activeInstance ?? undefined;
                    }
                }
                this._terminalService.setActiveInstance(terminalData.terminal);
                if (tasks_1.CustomTask.is(task) || tasks_1.ContributedTask.is(task)) {
                    this._terminalGroupService.showPanel(task.command.presentation.focus);
                }
            }
            return true;
        }
        isActive() {
            return Promise.resolve(this.isActiveSync());
        }
        isActiveSync() {
            return Object.values(this._activeTasks).some(value => !!value.terminal);
        }
        canAutoTerminate() {
            return Object.values(this._activeTasks).every(value => !value.task.configurationProperties.promptOnClose);
        }
        getActiveTasks() {
            return Object.values(this._activeTasks).flatMap(value => value.terminal ? value.task : []);
        }
        getLastInstance(task) {
            const recentKey = task.getKey();
            return Object.values(this._activeTasks).reverse().find((value) => recentKey && recentKey === value.task.getKey())?.task;
        }
        getBusyTasks() {
            return Object.keys(this._busyTasks).map(key => this._busyTasks[key]);
        }
        customExecutionComplete(task, result) {
            const activeTerminal = this._activeTasks[task.getMapKey()];
            if (!activeTerminal?.terminal) {
                return Promise.reject(new Error('Expected to have a terminal for a custom execution task'));
            }
            return new Promise((resolve) => {
                // activeTerminal.terminal.rendererExit(result);
                resolve();
            });
        }
        _getInstances(task) {
            const recentKey = task.getKey();
            return Object.values(this._activeTasks).filter((value) => recentKey && recentKey === value.task.getKey());
        }
        _removeFromActiveTasks(task) {
            const key = typeof task === 'string' ? task : task.getMapKey();
            const taskToRemove = this._activeTasks[key];
            if (!taskToRemove) {
                return;
            }
            delete this._activeTasks[key];
        }
        _fireTaskEvent(event) {
            if (event.kind !== "changed" /* TaskEventKind.Changed */) {
                const activeTask = this._activeTasks[event.__task.getMapKey()];
                if (activeTask) {
                    activeTask.state = event.kind;
                }
            }
            this._onDidStateChange.fire(event);
        }
        terminate(task) {
            const activeTerminal = this._activeTasks[task.getMapKey()];
            const terminal = activeTerminal.terminal;
            if (!terminal) {
                return Promise.resolve({ success: false, task: undefined });
            }
            return new Promise((resolve, reject) => {
                terminal.onDisposed(terminal => {
                    this._fireTaskEvent(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                });
                const onExit = terminal.onExit(() => {
                    const task = activeTerminal.task;
                    try {
                        onExit.dispose();
                        this._fireTaskEvent(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                    }
                    catch (error) {
                        // Do nothing.
                    }
                    resolve({ success: true, task: task });
                });
                terminal.dispose();
            });
        }
        terminateAll() {
            const promises = [];
            for (const [key, terminalData] of Object.entries(this._activeTasks)) {
                const terminal = terminalData.terminal;
                if (terminal) {
                    promises.push(new Promise((resolve, reject) => {
                        const onExit = terminal.onExit(() => {
                            const task = terminalData.task;
                            try {
                                onExit.dispose();
                                this._fireTaskEvent(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
                            }
                            catch (error) {
                                // Do nothing.
                            }
                            if (this._activeTasks[key] === terminalData) {
                                delete this._activeTasks[key];
                            }
                            resolve({ success: true, task: terminalData.task });
                        });
                    }));
                    terminal.dispose();
                }
            }
            return Promise.all(promises);
        }
        _showDependencyCycleMessage(task) {
            this._log(nls.localize('dependencyCycle', 'There is a dependency cycle. See task "{0}".', task._label));
            this._showOutput();
        }
        _executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
            this._showTaskLoadErrors(task);
            const mapKey = task.getMapKey();
            // It's important that we add this task's entry to _activeTasks before
            // any of the code in the then runs (see #180541 and #180578). Wrapping
            // it in Promise.resolve().then() ensures that.
            const promise = Promise.resolve().then(async () => {
                alreadyResolved = alreadyResolved ?? new Map();
                const promises = [];
                if (task.configurationProperties.dependsOn) {
                    const nextLiveDependencies = new Set(liveDependencies).add(task.getCommonTaskId());
                    for (const dependency of task.configurationProperties.dependsOn) {
                        const dependencyTask = await resolver.resolve(dependency.uri, dependency.task);
                        if (dependencyTask) {
                            this._adoptConfigurationForDependencyTask(dependencyTask, task);
                            let taskResult;
                            const commonKey = dependencyTask.getCommonTaskId();
                            if (nextLiveDependencies.has(commonKey)) {
                                this._showDependencyCycleMessage(dependencyTask);
                                taskResult = Promise.resolve({});
                            }
                            else {
                                taskResult = encounteredTasks.get(commonKey);
                                if (!taskResult) {
                                    const activeTask = this._activeTasks[dependencyTask.getMapKey()] ?? this._getInstances(dependencyTask).pop();
                                    taskResult = activeTask && this._getDependencyPromise(activeTask);
                                }
                            }
                            if (!taskResult) {
                                this._fireTaskEvent(tasks_1.TaskEvent.general("dependsOnStarted" /* TaskEventKind.DependsOnStarted */, task));
                                taskResult = this._executeDependencyTask(dependencyTask, resolver, trigger, nextLiveDependencies, encounteredTasks, alreadyResolved);
                            }
                            encounteredTasks.set(commonKey, taskResult);
                            promises.push(taskResult);
                            if (task.configurationProperties.dependsOrder === "sequence" /* DependsOrder.sequence */) {
                                const promiseResult = await taskResult;
                                if (promiseResult.exitCode !== 0) {
                                    break;
                                }
                            }
                        }
                        else {
                            this._log(nls.localize('dependencyFailed', 'Couldn\'t resolve dependent task \'{0}\' in workspace folder \'{1}\'', Types.isString(dependency.task) ? dependency.task : JSON.stringify(dependency.task, undefined, 0), dependency.uri.toString()));
                            this._showOutput();
                        }
                    }
                }
                return Promise.all(promises).then((summaries) => {
                    for (const summary of summaries) {
                        if (summary.exitCode !== 0) {
                            return { exitCode: summary.exitCode };
                        }
                    }
                    if ((tasks_1.ContributedTask.is(task) || tasks_1.CustomTask.is(task)) && (task.command)) {
                        if (this._isRerun) {
                            return this._reexecuteCommand(task, trigger, alreadyResolved);
                        }
                        else {
                            return this._executeCommand(task, trigger, alreadyResolved);
                        }
                    }
                    return { exitCode: 0 };
                });
            }).finally(() => {
                if (this._activeTasks[mapKey] === activeTask) {
                    delete this._activeTasks[mapKey];
                }
            });
            const lastInstance = this._getInstances(task).pop();
            const count = lastInstance?.count ?? { count: 0 };
            count.count++;
            const activeTask = { task, promise, count };
            this._activeTasks[mapKey] = activeTask;
            return promise;
        }
        _createInactiveDependencyPromise(task) {
            return new Promise(resolve => {
                const taskInactiveDisposable = this.onDidStateChange(taskEvent => {
                    if ((taskEvent.kind === "inactive" /* TaskEventKind.Inactive */) && (taskEvent.__task === task)) {
                        taskInactiveDisposable.dispose();
                        resolve({ exitCode: 0 });
                    }
                });
            });
        }
        _adoptConfigurationForDependencyTask(dependencyTask, task) {
            if (dependencyTask.configurationProperties.icon) {
                dependencyTask.configurationProperties.icon.id ||= task.configurationProperties.icon?.id;
                dependencyTask.configurationProperties.icon.color ||= task.configurationProperties.icon?.color;
            }
            else {
                dependencyTask.configurationProperties.icon = task.configurationProperties.icon;
            }
        }
        async _getDependencyPromise(task) {
            if (!task.task.configurationProperties.isBackground) {
                return task.promise;
            }
            if (!task.task.configurationProperties.problemMatchers || task.task.configurationProperties.problemMatchers.length === 0) {
                return task.promise;
            }
            if (task.state === "inactive" /* TaskEventKind.Inactive */) {
                return { exitCode: 0 };
            }
            return this._createInactiveDependencyPromise(task.task);
        }
        async _executeDependencyTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
            // If the task is a background task with a watching problem matcher, we don't wait for the whole task to finish,
            // just for the problem matcher to go inactive.
            if (!task.configurationProperties.isBackground) {
                return this._executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved);
            }
            const inactivePromise = this._createInactiveDependencyPromise(task);
            return Promise.race([inactivePromise, this._executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved)]);
        }
        async _resolveAndFindExecutable(systemInfo, workspaceFolder, task, cwd, envPath) {
            const command = await this._configurationResolverService.resolveAsync(workspaceFolder, tasks_1.CommandString.value(task.command.name));
            cwd = cwd ? await this._configurationResolverService.resolveAsync(workspaceFolder, cwd) : undefined;
            const paths = envPath ? await Promise.all(envPath.split(path.delimiter).map(p => this._configurationResolverService.resolveAsync(workspaceFolder, p))) : undefined;
            let foundExecutable = await systemInfo?.findExecutable(command, cwd, paths);
            if (!foundExecutable) {
                foundExecutable = path.join(cwd ?? '', command);
            }
            return foundExecutable;
        }
        _findUnresolvedVariables(variables, alreadyResolved) {
            if (alreadyResolved.size === 0) {
                return variables;
            }
            const unresolved = new Set();
            for (const variable of variables) {
                if (!alreadyResolved.has(variable.substring(2, variable.length - 1))) {
                    unresolved.add(variable);
                }
            }
            return unresolved;
        }
        _mergeMaps(mergeInto, mergeFrom) {
            for (const entry of mergeFrom) {
                if (!mergeInto.has(entry[0])) {
                    mergeInto.set(entry[0], entry[1]);
                }
            }
        }
        async _acquireInput(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
            const resolved = await this._resolveVariablesFromSet(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved);
            this._fireTaskEvent(tasks_1.TaskEvent.general("acquiredInput" /* TaskEventKind.AcquiredInput */, task));
            return resolved;
        }
        _resolveVariablesFromSet(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
            const isProcess = task.command && task.command.runtime === tasks_1.RuntimeType.Process;
            const options = task.command && task.command.options ? task.command.options : undefined;
            const cwd = options ? options.cwd : undefined;
            let envPath = undefined;
            if (options && options.env) {
                for (const key of Object.keys(options.env)) {
                    if (key.toLowerCase() === 'path') {
                        if (Types.isString(options.env[key])) {
                            envPath = options.env[key];
                        }
                        break;
                    }
                }
            }
            const unresolved = this._findUnresolvedVariables(variables, alreadyResolved);
            let resolvedVariables;
            if (taskSystemInfo && workspaceFolder) {
                const resolveSet = {
                    variables: unresolved
                };
                if (taskSystemInfo.platform === 3 /* Platform.Platform.Windows */ && isProcess) {
                    resolveSet.process = { name: tasks_1.CommandString.value(task.command.name) };
                    if (cwd) {
                        resolveSet.process.cwd = cwd;
                    }
                    if (envPath) {
                        resolveSet.process.path = envPath;
                    }
                }
                resolvedVariables = taskSystemInfo.resolveVariables(workspaceFolder, resolveSet, tasks_1.TaskSourceKind.toConfigurationTarget(task._source.kind)).then(async (resolved) => {
                    if (!resolved) {
                        return undefined;
                    }
                    this._mergeMaps(alreadyResolved, resolved.variables);
                    resolved.variables = new Map(alreadyResolved);
                    if (isProcess) {
                        let process = tasks_1.CommandString.value(task.command.name);
                        if (taskSystemInfo.platform === 3 /* Platform.Platform.Windows */) {
                            process = await this._resolveAndFindExecutable(taskSystemInfo, workspaceFolder, task, cwd, envPath);
                        }
                        resolved.variables.set(TerminalTaskSystem.ProcessVarName, process);
                    }
                    return resolved;
                });
                return resolvedVariables;
            }
            else {
                const variablesArray = new Array();
                unresolved.forEach(variable => variablesArray.push(variable));
                return new Promise((resolve, reject) => {
                    this._configurationResolverService.resolveWithInteraction(workspaceFolder, variablesArray, 'tasks', undefined, tasks_1.TaskSourceKind.toConfigurationTarget(task._source.kind)).then(async (resolvedVariablesMap) => {
                        if (resolvedVariablesMap) {
                            this._mergeMaps(alreadyResolved, resolvedVariablesMap);
                            resolvedVariablesMap = new Map(alreadyResolved);
                            if (isProcess) {
                                let processVarValue;
                                if (Platform.isWindows) {
                                    processVarValue = await this._resolveAndFindExecutable(taskSystemInfo, workspaceFolder, task, cwd, envPath);
                                }
                                else {
                                    processVarValue = await this._configurationResolverService.resolveAsync(workspaceFolder, tasks_1.CommandString.value(task.command.name));
                                }
                                resolvedVariablesMap.set(TerminalTaskSystem.ProcessVarName, processVarValue);
                            }
                            const resolvedVariablesResult = {
                                variables: resolvedVariablesMap,
                            };
                            resolve(resolvedVariablesResult);
                        }
                        else {
                            resolve(undefined);
                        }
                    }, reason => {
                        reject(reason);
                    });
                });
            }
        }
        _executeCommand(task, trigger, alreadyResolved) {
            const taskWorkspaceFolder = task.getWorkspaceFolder();
            let workspaceFolder;
            if (taskWorkspaceFolder) {
                workspaceFolder = this._currentTask.workspaceFolder = taskWorkspaceFolder;
            }
            else {
                const folders = this._contextService.getWorkspace().folders;
                workspaceFolder = folders.length > 0 ? folders[0] : undefined;
            }
            const systemInfo = this._currentTask.systemInfo = this._taskSystemInfoResolver(workspaceFolder);
            const variables = new Set();
            this._collectTaskVariables(variables, task);
            const resolvedVariables = this._acquireInput(systemInfo, workspaceFolder, task, variables, alreadyResolved);
            return resolvedVariables.then((resolvedVariables) => {
                if (resolvedVariables && !this._isTaskEmpty(task)) {
                    this._currentTask.resolvedVariables = resolvedVariables;
                    return this._executeInTerminal(task, trigger, new VariableResolver(workspaceFolder, systemInfo, resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
                }
                else {
                    // Allows the taskExecutions array to be updated in the extension host
                    this._fireTaskEvent(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task));
                    return Promise.resolve({ exitCode: 0 });
                }
            }, reason => {
                return Promise.reject(reason);
            });
        }
        _isTaskEmpty(task) {
            const isCustomExecution = (task.command.runtime === tasks_1.RuntimeType.CustomExecution);
            return !((task.command !== undefined) && task.command.runtime && (isCustomExecution || (task.command.name !== undefined)));
        }
        _reexecuteCommand(task, trigger, alreadyResolved) {
            const lastTask = this._lastTask;
            if (!lastTask) {
                return Promise.reject(new Error('No task previously run'));
            }
            const workspaceFolder = this._currentTask.workspaceFolder = lastTask.workspaceFolder;
            const variables = new Set();
            this._collectTaskVariables(variables, task);
            // Check that the task hasn't changed to include new variables
            let hasAllVariables = true;
            variables.forEach(value => {
                if (value.substring(2, value.length - 1) in lastTask.getVerifiedTask().resolvedVariables) {
                    hasAllVariables = false;
                }
            });
            if (!hasAllVariables) {
                return this._acquireInput(lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().workspaceFolder, task, variables, alreadyResolved).then((resolvedVariables) => {
                    if (!resolvedVariables) {
                        // Allows the taskExecutions array to be updated in the extension host
                        this._fireTaskEvent(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task));
                        return { exitCode: 0 };
                    }
                    this._currentTask.resolvedVariables = resolvedVariables;
                    return this._executeInTerminal(task, trigger, new VariableResolver(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
                }, reason => {
                    return Promise.reject(reason);
                });
            }
            else {
                this._currentTask.resolvedVariables = lastTask.getVerifiedTask().resolvedVariables;
                return this._executeInTerminal(task, trigger, new VariableResolver(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
            }
        }
        async _executeInTerminal(task, trigger, resolver, workspaceFolder) {
            let terminal = undefined;
            let error = undefined;
            let promise = undefined;
            if (task.configurationProperties.isBackground) {
                const problemMatchers = await this._resolveMatchers(resolver, task.configurationProperties.problemMatchers);
                const watchingProblemMatcher = new problemCollectors_1.WatchingProblemCollector(problemMatchers, this._markerService, this._modelService, this._fileService);
                if ((problemMatchers.length > 0) && !watchingProblemMatcher.isWatching()) {
                    this._appendOutput(nls.localize('TerminalTaskSystem.nonWatchingMatcher', 'Task {0} is a background task but uses a problem matcher without a background pattern', task._label));
                    this._showOutput();
                }
                const toDispose = new lifecycle_1.DisposableStore();
                let eventCounter = 0;
                const mapKey = task.getMapKey();
                toDispose.add(watchingProblemMatcher.onDidStateChange((event) => {
                    if (event.kind === "backgroundProcessingBegins" /* ProblemCollectorEventKind.BackgroundProcessingBegins */) {
                        eventCounter++;
                        this._busyTasks[mapKey] = task;
                        this._fireTaskEvent(tasks_1.TaskEvent.general("active" /* TaskEventKind.Active */, task, terminal?.instanceId));
                    }
                    else if (event.kind === "backgroundProcessingEnds" /* ProblemCollectorEventKind.BackgroundProcessingEnds */) {
                        eventCounter--;
                        if (this._busyTasks[mapKey]) {
                            delete this._busyTasks[mapKey];
                        }
                        this._fireTaskEvent(tasks_1.TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal?.instanceId));
                        if (eventCounter === 0) {
                            if ((watchingProblemMatcher.numberOfMatches > 0) && watchingProblemMatcher.maxMarkerSeverity &&
                                (watchingProblemMatcher.maxMarkerSeverity >= markers_1.MarkerSeverity.Error)) {
                                const reveal = task.command.presentation.reveal;
                                const revealProblems = task.command.presentation.revealProblems;
                                if (revealProblems === tasks_1.RevealProblemKind.OnProblem) {
                                    this._viewsService.openView(markers_2.Markers.MARKERS_VIEW_ID, true);
                                }
                                else if (reveal === tasks_1.RevealKind.Silent) {
                                    this._terminalService.setActiveInstance(terminal);
                                    this._terminalGroupService.showPanel(false);
                                }
                            }
                        }
                    }
                }));
                watchingProblemMatcher.aboutToStart();
                let delayer = undefined;
                [terminal, error] = await this._createTerminal(task, resolver, workspaceFolder);
                if (error) {
                    return Promise.reject(new Error(error.message));
                }
                if (!terminal) {
                    return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
                }
                this._terminalStatusManager.addTerminal(task, terminal, watchingProblemMatcher);
                let processStartedSignaled = false;
                terminal.processReady.then(() => {
                    if (!processStartedSignaled) {
                        this._fireTaskEvent(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                        processStartedSignaled = true;
                    }
                }, (_error) => {
                    this._logService.error('Task terminal process never got ready');
                });
                this._fireTaskEvent(tasks_1.TaskEvent.start(task, terminal.instanceId, resolver.values));
                let onData;
                if (problemMatchers.length) {
                    // prevent https://github.com/microsoft/vscode/issues/174511 from happening
                    onData = terminal.onLineData((line) => {
                        watchingProblemMatcher.processLine(line);
                        if (!delayer) {
                            delayer = new Async.Delayer(3000);
                        }
                        delayer.trigger(() => {
                            watchingProblemMatcher.forceDelivery();
                            delayer = undefined;
                        });
                    });
                }
                promise = new Promise((resolve, reject) => {
                    const onExit = terminal.onExit((terminalLaunchResult) => {
                        const exitCode = typeof terminalLaunchResult === 'number' ? terminalLaunchResult : terminalLaunchResult?.code;
                        onData?.dispose();
                        onExit.dispose();
                        const key = task.getMapKey();
                        if (this._busyTasks[mapKey]) {
                            delete this._busyTasks[mapKey];
                        }
                        this._removeFromActiveTasks(task);
                        this._fireTaskEvent(tasks_1.TaskEvent.changed());
                        if (terminalLaunchResult !== undefined) {
                            // Only keep a reference to the terminal if it is not being disposed.
                            switch (task.command.presentation.panel) {
                                case tasks_1.PanelKind.Dedicated:
                                    this._sameTaskTerminals[key] = terminal.instanceId.toString();
                                    break;
                                case tasks_1.PanelKind.Shared:
                                    this._idleTaskTerminals.set(key, terminal.instanceId.toString(), 1 /* Touch.AsOld */);
                                    break;
                            }
                        }
                        const reveal = task.command.presentation.reveal;
                        if ((reveal === tasks_1.RevealKind.Silent) && ((exitCode !== 0) || (watchingProblemMatcher.numberOfMatches > 0) && watchingProblemMatcher.maxMarkerSeverity &&
                            (watchingProblemMatcher.maxMarkerSeverity >= markers_1.MarkerSeverity.Error))) {
                            try {
                                this._terminalService.setActiveInstance(terminal);
                                this._terminalGroupService.showPanel(false);
                            }
                            catch (e) {
                                // If the terminal has already been disposed, then setting the active instance will fail. #99828
                                // There is nothing else to do here.
                            }
                        }
                        watchingProblemMatcher.done();
                        watchingProblemMatcher.dispose();
                        if (!processStartedSignaled) {
                            this._fireTaskEvent(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                            processStartedSignaled = true;
                        }
                        this._fireTaskEvent(tasks_1.TaskEvent.processEnded(task, terminal.instanceId, exitCode));
                        for (let i = 0; i < eventCounter; i++) {
                            this._fireTaskEvent(tasks_1.TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal.instanceId));
                        }
                        eventCounter = 0;
                        this._fireTaskEvent(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task));
                        toDispose.dispose();
                        resolve({ exitCode: exitCode ?? undefined });
                    });
                });
                if (trigger === taskSystem_1.Triggers.reconnect && !!terminal.xterm) {
                    const bufferLines = [];
                    const bufferReverseIterator = terminal.xterm.getBufferReverseIterator();
                    const startRegex = new RegExp(watchingProblemMatcher.beginPatterns.map(pattern => pattern.source).join('|'));
                    for (const nextLine of bufferReverseIterator) {
                        bufferLines.push(nextLine);
                        if (startRegex.test(nextLine)) {
                            break;
                        }
                    }
                    let delayer = undefined;
                    for (let i = bufferLines.length - 1; i >= 0; i--) {
                        watchingProblemMatcher.processLine(bufferLines[i]);
                        if (!delayer) {
                            delayer = new Async.Delayer(3000);
                        }
                        delayer.trigger(() => {
                            watchingProblemMatcher.forceDelivery();
                            delayer = undefined;
                        });
                    }
                }
            }
            else {
                [terminal, error] = await this._createTerminal(task, resolver, workspaceFolder);
                if (error) {
                    return Promise.reject(new Error(error.message));
                }
                if (!terminal) {
                    return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
                }
                this._fireTaskEvent(tasks_1.TaskEvent.start(task, terminal.instanceId, resolver.values));
                const mapKey = task.getMapKey();
                this._busyTasks[mapKey] = task;
                this._fireTaskEvent(tasks_1.TaskEvent.general("active" /* TaskEventKind.Active */, task, terminal.instanceId));
                const problemMatchers = await this._resolveMatchers(resolver, task.configurationProperties.problemMatchers);
                const startStopProblemMatcher = new problemCollectors_1.StartStopProblemCollector(problemMatchers, this._markerService, this._modelService, 0 /* ProblemHandlingStrategy.Clean */, this._fileService);
                this._terminalStatusManager.addTerminal(task, terminal, startStopProblemMatcher);
                let processStartedSignaled = false;
                terminal.processReady.then(() => {
                    if (!processStartedSignaled) {
                        this._fireTaskEvent(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                        processStartedSignaled = true;
                    }
                }, (_error) => {
                    // The process never got ready. Need to think how to handle this.
                });
                const onData = terminal.onLineData((line) => {
                    startStopProblemMatcher.processLine(line);
                });
                promise = new Promise((resolve, reject) => {
                    const onExit = terminal.onExit((terminalLaunchResult) => {
                        const exitCode = typeof terminalLaunchResult === 'number' ? terminalLaunchResult : terminalLaunchResult?.code;
                        onExit.dispose();
                        const key = task.getMapKey();
                        this._removeFromActiveTasks(task);
                        this._fireTaskEvent(tasks_1.TaskEvent.changed());
                        if (terminalLaunchResult !== undefined) {
                            // Only keep a reference to the terminal if it is not being disposed.
                            switch (task.command.presentation.panel) {
                                case tasks_1.PanelKind.Dedicated:
                                    this._sameTaskTerminals[key] = terminal.instanceId.toString();
                                    break;
                                case tasks_1.PanelKind.Shared:
                                    this._idleTaskTerminals.set(key, terminal.instanceId.toString(), 1 /* Touch.AsOld */);
                                    break;
                            }
                        }
                        const reveal = task.command.presentation.reveal;
                        const revealProblems = task.command.presentation.revealProblems;
                        const revealProblemPanel = terminal && (revealProblems === tasks_1.RevealProblemKind.OnProblem) && (startStopProblemMatcher.numberOfMatches > 0);
                        if (revealProblemPanel) {
                            this._viewsService.openView(markers_2.Markers.MARKERS_VIEW_ID);
                        }
                        else if (terminal && (reveal === tasks_1.RevealKind.Silent) && ((exitCode !== 0) || (startStopProblemMatcher.numberOfMatches > 0) && startStopProblemMatcher.maxMarkerSeverity &&
                            (startStopProblemMatcher.maxMarkerSeverity >= markers_1.MarkerSeverity.Error))) {
                            try {
                                this._terminalService.setActiveInstance(terminal);
                                this._terminalGroupService.showPanel(false);
                            }
                            catch (e) {
                                // If the terminal has already been disposed, then setting the active instance will fail. #99828
                                // There is nothing else to do here.
                            }
                        }
                        // Hack to work around #92868 until terminal is fixed.
                        setTimeout(() => {
                            onData.dispose();
                            startStopProblemMatcher.done();
                            startStopProblemMatcher.dispose();
                        }, 100);
                        if (!processStartedSignaled && terminal) {
                            this._fireTaskEvent(tasks_1.TaskEvent.processStarted(task, terminal.instanceId, terminal.processId));
                            processStartedSignaled = true;
                        }
                        this._fireTaskEvent(tasks_1.TaskEvent.processEnded(task, terminal?.instanceId, exitCode ?? undefined));
                        if (this._busyTasks[mapKey]) {
                            delete this._busyTasks[mapKey];
                        }
                        this._fireTaskEvent(tasks_1.TaskEvent.general("inactive" /* TaskEventKind.Inactive */, task, terminal?.instanceId));
                        this._fireTaskEvent(tasks_1.TaskEvent.general("end" /* TaskEventKind.End */, task, terminal?.instanceId));
                        resolve({ exitCode: exitCode ?? undefined });
                    });
                });
            }
            const showProblemPanel = task.command.presentation && (task.command.presentation.revealProblems === tasks_1.RevealProblemKind.Always);
            if (showProblemPanel) {
                this._viewsService.openView(markers_2.Markers.MARKERS_VIEW_ID);
            }
            else if (task.command.presentation && (task.command.presentation.focus || task.command.presentation.reveal === tasks_1.RevealKind.Always)) {
                this._terminalService.setActiveInstance(terminal);
                await this._terminalService.revealActiveTerminal();
                if (task.command.presentation.focus) {
                    this._terminalService.focusActiveInstance();
                }
            }
            this._activeTasks[task.getMapKey()].terminal = terminal;
            this._fireTaskEvent(tasks_1.TaskEvent.changed());
            return promise;
        }
        _createTerminalName(task) {
            const needsFolderQualification = this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
            return needsFolderQualification ? task.getQualifiedLabel() : (task.configurationProperties.name || '');
        }
        async _createShellLaunchConfig(task, workspaceFolder, variableResolver, platform, options, command, args, waitOnExit) {
            let shellLaunchConfig;
            const isShellCommand = task.command.runtime === tasks_1.RuntimeType.Shell;
            const needsFolderQualification = this._contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */;
            const terminalName = this._createTerminalName(task);
            const type = ReconnectionType;
            const originalCommand = task.command.name;
            let cwd;
            if (options.cwd) {
                cwd = options.cwd;
                if (!path.isAbsolute(cwd)) {
                    if (workspaceFolder && (workspaceFolder.uri.scheme === network_1.Schemas.file)) {
                        cwd = path.join(workspaceFolder.uri.fsPath, cwd);
                    }
                }
                // This must be normalized to the OS
                cwd = (0, extpath_1.isUNC)(cwd) ? cwd : resources.toLocalResource(uri_1.URI.from({ scheme: network_1.Schemas.file, path: cwd }), this._environmentService.remoteAuthority, this._pathService.defaultUriScheme);
            }
            if (isShellCommand) {
                let os;
                switch (platform) {
                    case 3 /* Platform.Platform.Windows */:
                        os = 1 /* Platform.OperatingSystem.Windows */;
                        break;
                    case 1 /* Platform.Platform.Mac */:
                        os = 2 /* Platform.OperatingSystem.Macintosh */;
                        break;
                    case 2 /* Platform.Platform.Linux */:
                    default:
                        os = 3 /* Platform.OperatingSystem.Linux */;
                        break;
                }
                const defaultProfile = await this._terminalProfileResolverService.getDefaultProfile({
                    allowAutomationShell: true,
                    os,
                    remoteAuthority: this._environmentService.remoteAuthority
                });
                let icon;
                if (task.configurationProperties.icon?.id) {
                    icon = themables_1.ThemeIcon.fromId(task.configurationProperties.icon.id);
                }
                else {
                    const taskGroupKind = task.configurationProperties.group ? taskConfiguration_1.GroupKind.to(task.configurationProperties.group) : undefined;
                    const kindId = typeof taskGroupKind === 'string' ? taskGroupKind : taskGroupKind?.kind;
                    icon = kindId === 'test' ? themables_1.ThemeIcon.fromId(codicons_1.Codicon.beaker.id) : defaultProfile.icon;
                }
                shellLaunchConfig = {
                    name: terminalName,
                    type,
                    executable: defaultProfile.path,
                    args: defaultProfile.args,
                    env: { ...defaultProfile.env },
                    icon,
                    color: task.configurationProperties.icon?.color || undefined,
                    waitOnExit
                };
                let shellSpecified = false;
                const shellOptions = task.command.options && task.command.options.shell;
                if (shellOptions) {
                    if (shellOptions.executable) {
                        // Clear out the args so that we don't end up with mismatched args.
                        if (shellOptions.executable !== shellLaunchConfig.executable) {
                            shellLaunchConfig.args = undefined;
                        }
                        shellLaunchConfig.executable = await this._resolveVariable(variableResolver, shellOptions.executable);
                        shellSpecified = true;
                    }
                    if (shellOptions.args) {
                        shellLaunchConfig.args = await this._resolveVariables(variableResolver, shellOptions.args.slice());
                    }
                }
                if (shellLaunchConfig.args === undefined) {
                    shellLaunchConfig.args = [];
                }
                const shellArgs = Array.isArray(shellLaunchConfig.args) ? shellLaunchConfig.args.slice(0) : [shellLaunchConfig.args];
                const toAdd = [];
                const basename = path.posix.basename((await this._pathService.fileURI(shellLaunchConfig.executable)).path).toLowerCase();
                const commandLine = this._buildShellCommandLine(platform, basename, shellOptions, command, originalCommand, args);
                let windowsShellArgs = false;
                if (platform === 3 /* Platform.Platform.Windows */) {
                    windowsShellArgs = true;
                    // If we don't have a cwd, then the terminal uses the home dir.
                    const userHome = await this._pathService.userHome();
                    if (basename === 'cmd.exe' && ((options.cwd && (0, extpath_1.isUNC)(options.cwd)) || (!options.cwd && (0, extpath_1.isUNC)(userHome.fsPath)))) {
                        return undefined;
                    }
                    if ((basename === 'powershell.exe') || (basename === 'pwsh.exe')) {
                        if (!shellSpecified) {
                            toAdd.push('-Command');
                        }
                    }
                    else if ((basename === 'bash.exe') || (basename === 'zsh.exe')) {
                        windowsShellArgs = false;
                        if (!shellSpecified) {
                            toAdd.push('-c');
                        }
                    }
                    else if (basename === 'wsl.exe') {
                        if (!shellSpecified) {
                            toAdd.push('-e');
                        }
                    }
                    else {
                        if (!shellSpecified) {
                            toAdd.push('/d', '/c');
                        }
                    }
                }
                else {
                    if (!shellSpecified) {
                        // Under Mac remove -l to not start it as a login shell.
                        if (platform === 1 /* Platform.Platform.Mac */) {
                            // Background on -l on osx https://github.com/microsoft/vscode/issues/107563
                            // TODO: Handle by pulling the default terminal profile?
                            // const osxShellArgs = this._configurationService.inspect(TerminalSettingId.ShellArgsMacOs);
                            // if ((osxShellArgs.user === undefined) && (osxShellArgs.userLocal === undefined) && (osxShellArgs.userLocalValue === undefined)
                            // 	&& (osxShellArgs.userRemote === undefined) && (osxShellArgs.userRemoteValue === undefined)
                            // 	&& (osxShellArgs.userValue === undefined) && (osxShellArgs.workspace === undefined)
                            // 	&& (osxShellArgs.workspaceFolder === undefined) && (osxShellArgs.workspaceFolderValue === undefined)
                            // 	&& (osxShellArgs.workspaceValue === undefined)) {
                            // 	const index = shellArgs.indexOf('-l');
                            // 	if (index !== -1) {
                            // 		shellArgs.splice(index, 1);
                            // 	}
                            // }
                        }
                        toAdd.push('-c');
                    }
                }
                const combinedShellArgs = this._addAllArgument(toAdd, shellArgs);
                combinedShellArgs.push(commandLine);
                shellLaunchConfig.args = windowsShellArgs ? combinedShellArgs.join(' ') : combinedShellArgs;
                if (task.command.presentation && task.command.presentation.echo) {
                    if (needsFolderQualification && workspaceFolder) {
                        const folder = cwd && typeof cwd === 'object' && 'path' in cwd ? path.basename(cwd.path) : workspaceFolder.name;
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                            key: 'task.executingInFolder',
                            comment: ['The workspace folder the task is running in', 'The task command line or label']
                        }, 'Executing task in folder {0}: {1}', folder, commandLine), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                    }
                    else {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                            key: 'task.executing.shellIntegration',
                            comment: ['The task command line or label']
                        }, 'Executing task: {0}', commandLine), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                    }
                }
                else {
                    shellLaunchConfig.initialText = {
                        text: this.taskShellIntegrationStartSequence(cwd) + this.taskShellIntegrationOutputSequence,
                        trailingNewLine: false
                    };
                }
            }
            else {
                const commandExecutable = (task.command.runtime !== tasks_1.RuntimeType.CustomExecution) ? tasks_1.CommandString.value(command) : undefined;
                const executable = !isShellCommand
                    ? await this._resolveVariable(variableResolver, await this._resolveVariable(variableResolver, '${' + TerminalTaskSystem.ProcessVarName + '}'))
                    : commandExecutable;
                // When we have a process task there is no need to quote arguments. So we go ahead and take the string value.
                shellLaunchConfig = {
                    name: terminalName,
                    type,
                    icon: task.configurationProperties.icon?.id ? themables_1.ThemeIcon.fromId(task.configurationProperties.icon.id) : undefined,
                    color: task.configurationProperties.icon?.color || undefined,
                    executable: executable,
                    args: args.map(a => Types.isString(a) ? a : a.value),
                    waitOnExit
                };
                if (task.command.presentation && task.command.presentation.echo) {
                    const getArgsToEcho = (args) => {
                        if (!args || args.length === 0) {
                            return '';
                        }
                        if (Types.isString(args)) {
                            return args;
                        }
                        return args.join(' ');
                    };
                    if (needsFolderQualification && workspaceFolder) {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                            key: 'task.executingInFolder',
                            comment: ['The workspace folder the task is running in', 'The task command line or label']
                        }, 'Executing task in folder {0}: {1}', workspaceFolder.name, `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                    }
                    else {
                        shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd) + (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                            key: 'task.executing.shell-integration',
                            comment: ['The task command line or label']
                        }, 'Executing task: {0}', `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.taskShellIntegrationOutputSequence;
                    }
                }
                else {
                    shellLaunchConfig.initialText = {
                        text: this.taskShellIntegrationStartSequence(cwd) + this.taskShellIntegrationOutputSequence,
                        trailingNewLine: false
                    };
                }
            }
            if (cwd) {
                shellLaunchConfig.cwd = cwd;
            }
            if (options.env) {
                if (shellLaunchConfig.env) {
                    shellLaunchConfig.env = { ...shellLaunchConfig.env, ...options.env };
                }
                else {
                    shellLaunchConfig.env = options.env;
                }
            }
            shellLaunchConfig.isFeatureTerminal = true;
            shellLaunchConfig.useShellEnvironment = true;
            return shellLaunchConfig;
        }
        _addAllArgument(shellCommandArgs, configuredShellArgs) {
            const combinedShellArgs = Objects.deepClone(configuredShellArgs);
            shellCommandArgs.forEach(element => {
                const shouldAddShellCommandArg = configuredShellArgs.every((arg, index) => {
                    if ((arg.toLowerCase() === element) && (configuredShellArgs.length > index + 1)) {
                        // We can still add the argument, but only if not all of the following arguments begin with "-".
                        return !configuredShellArgs.slice(index + 1).every(testArg => testArg.startsWith('-'));
                    }
                    else {
                        return arg.toLowerCase() !== element;
                    }
                });
                if (shouldAddShellCommandArg) {
                    combinedShellArgs.push(element);
                }
            });
            return combinedShellArgs;
        }
        async _reconnectToTerminal(task) {
            if (!this._reconnectedTerminals) {
                return;
            }
            for (let i = 0; i < this._reconnectedTerminals.length; i++) {
                const terminal = this._reconnectedTerminals[i];
                if (getReconnectionData(terminal)?.lastTask === task.getCommonTaskId()) {
                    this._reconnectedTerminals.splice(i, 1);
                    return terminal;
                }
            }
            return undefined;
        }
        async _doCreateTerminal(task, group, launchConfigs) {
            const reconnectedTerminal = await this._reconnectToTerminal(task);
            const onDisposed = (terminal) => this._fireTaskEvent(tasks_1.TaskEvent.terminated(task, terminal.instanceId, terminal.exitReason));
            if (reconnectedTerminal) {
                if ('command' in task && task.command.presentation) {
                    reconnectedTerminal.waitOnExit = getWaitOnExitValue(task.command.presentation, task.configurationProperties);
                }
                reconnectedTerminal.onDisposed(onDisposed);
                this._logService.trace('reconnected to task and terminal', task._id);
                return reconnectedTerminal;
            }
            if (group) {
                // Try to find an existing terminal to split.
                // Even if an existing terminal is found, the split can fail if the terminal width is too small.
                for (const terminal of Object.values(this._terminals)) {
                    if (terminal.group === group) {
                        this._logService.trace(`Found terminal to split for group ${group}`);
                        const originalInstance = terminal.terminal;
                        const result = await this._terminalService.createTerminal({ location: { parentTerminal: originalInstance }, config: launchConfigs });
                        result.onDisposed(onDisposed);
                        if (result) {
                            return result;
                        }
                    }
                }
                this._logService.trace(`No terminal found to split for group ${group}`);
            }
            // Either no group is used, no terminal with the group exists or splitting an existing terminal failed.
            const createdTerminal = await this._terminalService.createTerminal({ config: launchConfigs });
            createdTerminal.onDisposed(onDisposed);
            return createdTerminal;
        }
        _reconnectToTerminals() {
            if (this._hasReconnected) {
                this._logService.trace(`Already reconnected, to ${this._reconnectedTerminals?.length} terminals so returning`);
                return;
            }
            this._reconnectedTerminals = this._terminalService.getReconnectedTerminals(ReconnectionType)?.filter(t => !t.isDisposed && getReconnectionData(t)) || [];
            this._logService.trace(`Attempting reconnection of ${this._reconnectedTerminals?.length} terminals`);
            if (!this._reconnectedTerminals?.length) {
                this._logService.trace(`No terminals to reconnect to so returning`);
            }
            else {
                for (const terminal of this._reconnectedTerminals) {
                    const data = getReconnectionData(terminal);
                    if (data) {
                        const terminalData = { lastTask: data.lastTask, group: data.group, terminal };
                        this._terminals[terminal.instanceId] = terminalData;
                        this._logService.trace('Reconnecting to task terminal', terminalData.lastTask, terminal.instanceId);
                    }
                }
            }
            this._hasReconnected = true;
        }
        _deleteTaskAndTerminal(terminal, terminalData) {
            delete this._terminals[terminal.instanceId];
            delete this._sameTaskTerminals[terminalData.lastTask];
            this._idleTaskTerminals.delete(terminalData.lastTask);
            // Delete the task now as a work around for cases when the onExit isn't fired.
            // This can happen if the terminal wasn't shutdown with an "immediate" flag and is expected.
            // For correct terminal re-use, the task needs to be deleted immediately.
            // Note that this shouldn't be a problem anymore since user initiated terminal kills are now immediate.
            const mapKey = terminalData.lastTask;
            this._removeFromActiveTasks(mapKey);
            if (this._busyTasks[mapKey]) {
                delete this._busyTasks[mapKey];
            }
        }
        async _createTerminal(task, resolver, workspaceFolder) {
            const platform = resolver.taskSystemInfo ? resolver.taskSystemInfo.platform : Platform.platform;
            const options = await this._resolveOptions(resolver, task.command.options);
            const presentationOptions = task.command.presentation;
            if (!presentationOptions) {
                throw new Error('Task presentation options should not be undefined here.');
            }
            const waitOnExit = getWaitOnExitValue(presentationOptions, task.configurationProperties);
            let command;
            let args;
            let launchConfigs;
            if (task.command.runtime === tasks_1.RuntimeType.CustomExecution) {
                this._currentTask.shellLaunchConfig = launchConfigs = {
                    customPtyImplementation: (id, cols, rows) => new terminalProcessExtHostProxy_1.TerminalProcessExtHostProxy(id, cols, rows, this._terminalService),
                    waitOnExit,
                    name: this._createTerminalName(task),
                    initialText: task.command.presentation && task.command.presentation.echo ? (0, terminalStrings_1.formatMessageForTerminal)(nls.localize({
                        key: 'task.executing',
                        comment: ['The task command line or label']
                    }, 'Executing task: {0}', task._label), { excludeLeadingNewLine: true }) : undefined,
                    isFeatureTerminal: true,
                    icon: task.configurationProperties.icon?.id ? themables_1.ThemeIcon.fromId(task.configurationProperties.icon.id) : undefined,
                    color: task.configurationProperties.icon?.color || undefined
                };
            }
            else {
                const resolvedResult = await this._resolveCommandAndArgs(resolver, task.command);
                command = resolvedResult.command;
                args = resolvedResult.args;
                this._currentTask.shellLaunchConfig = launchConfigs = await this._createShellLaunchConfig(task, workspaceFolder, resolver, platform, options, command, args, waitOnExit);
                if (launchConfigs === undefined) {
                    return [undefined, new taskSystem_1.TaskError(severity_1.default.Error, nls.localize('TerminalTaskSystem', 'Can\'t execute a shell command on an UNC drive using cmd.exe.'), 7 /* TaskErrors.UnknownError */)];
                }
            }
            const prefersSameTerminal = presentationOptions.panel === tasks_1.PanelKind.Dedicated;
            const allowsSharedTerminal = presentationOptions.panel === tasks_1.PanelKind.Shared;
            const group = presentationOptions.group;
            const taskKey = task.getMapKey();
            let terminalToReuse;
            if (prefersSameTerminal) {
                const terminalId = this._sameTaskTerminals[taskKey];
                if (terminalId) {
                    terminalToReuse = this._terminals[terminalId];
                    delete this._sameTaskTerminals[taskKey];
                }
            }
            else if (allowsSharedTerminal) {
                // Always allow to reuse the terminal previously used by the same task.
                let terminalId = this._idleTaskTerminals.remove(taskKey);
                if (!terminalId) {
                    // There is no idle terminal which was used by the same task.
                    // Search for any idle terminal used previously by a task of the same group
                    // (or, if the task has no group, a terminal used by a task without group).
                    for (const taskId of this._idleTaskTerminals.keys()) {
                        const idleTerminalId = this._idleTaskTerminals.get(taskId);
                        if (idleTerminalId && this._terminals[idleTerminalId] && this._terminals[idleTerminalId].group === group) {
                            terminalId = this._idleTaskTerminals.remove(taskId);
                            break;
                        }
                    }
                }
                if (terminalId) {
                    terminalToReuse = this._terminals[terminalId];
                }
            }
            if (terminalToReuse) {
                if (!launchConfigs) {
                    throw new Error('Task shell launch configuration should not be undefined here.');
                }
                terminalToReuse.terminal.scrollToBottom();
                if (task.configurationProperties.isBackground) {
                    launchConfigs.reconnectionProperties = { ownerId: ReconnectionType, data: { lastTask: task.getCommonTaskId(), group, label: task._label, id: task._id } };
                }
                await terminalToReuse.terminal.reuseTerminal(launchConfigs);
                if (task.command.presentation && task.command.presentation.clear) {
                    terminalToReuse.terminal.clearBuffer();
                }
                this._terminals[terminalToReuse.terminal.instanceId.toString()].lastTask = taskKey;
                return [terminalToReuse.terminal, undefined];
            }
            this._terminalCreationQueue = this._terminalCreationQueue.then(() => this._doCreateTerminal(task, group, launchConfigs));
            const terminal = (await this._terminalCreationQueue);
            if (task.configurationProperties.isBackground) {
                terminal.shellLaunchConfig.reconnectionProperties = { ownerId: ReconnectionType, data: { lastTask: task.getCommonTaskId(), group, label: task._label, id: task._id } };
            }
            const terminalKey = terminal.instanceId.toString();
            const terminalData = { terminal: terminal, lastTask: taskKey, group };
            terminal.onDisposed(() => this._deleteTaskAndTerminal(terminal, terminalData));
            this._terminals[terminalKey] = terminalData;
            return [terminal, undefined];
        }
        _buildShellCommandLine(platform, shellExecutable, shellOptions, command, originalCommand, args) {
            const basename = path.parse(shellExecutable).name.toLowerCase();
            const shellQuoteOptions = this._getQuotingOptions(basename, shellOptions, platform);
            function needsQuotes(value) {
                if (value.length >= 2) {
                    const first = value[0] === shellQuoteOptions.strong ? shellQuoteOptions.strong : value[0] === shellQuoteOptions.weak ? shellQuoteOptions.weak : undefined;
                    if (first === value[value.length - 1]) {
                        return false;
                    }
                }
                let quote;
                for (let i = 0; i < value.length; i++) {
                    // We found the end quote.
                    const ch = value[i];
                    if (ch === quote) {
                        quote = undefined;
                    }
                    else if (quote !== undefined) {
                        // skip the character. We are quoted.
                        continue;
                    }
                    else if (ch === shellQuoteOptions.escape) {
                        // Skip the next character
                        i++;
                    }
                    else if (ch === shellQuoteOptions.strong || ch === shellQuoteOptions.weak) {
                        quote = ch;
                    }
                    else if (ch === ' ') {
                        return true;
                    }
                }
                return false;
            }
            function quote(value, kind) {
                if (kind === tasks_1.ShellQuoting.Strong && shellQuoteOptions.strong) {
                    return [shellQuoteOptions.strong + value + shellQuoteOptions.strong, true];
                }
                else if (kind === tasks_1.ShellQuoting.Weak && shellQuoteOptions.weak) {
                    return [shellQuoteOptions.weak + value + shellQuoteOptions.weak, true];
                }
                else if (kind === tasks_1.ShellQuoting.Escape && shellQuoteOptions.escape) {
                    if (Types.isString(shellQuoteOptions.escape)) {
                        return [value.replace(/ /g, shellQuoteOptions.escape + ' '), true];
                    }
                    else {
                        const buffer = [];
                        for (const ch of shellQuoteOptions.escape.charsToEscape) {
                            buffer.push(`\\${ch}`);
                        }
                        const regexp = new RegExp('[' + buffer.join(',') + ']', 'g');
                        const escapeChar = shellQuoteOptions.escape.escapeChar;
                        return [value.replace(regexp, (match) => escapeChar + match), true];
                    }
                }
                return [value, false];
            }
            function quoteIfNecessary(value) {
                if (Types.isString(value)) {
                    if (needsQuotes(value)) {
                        return quote(value, tasks_1.ShellQuoting.Strong);
                    }
                    else {
                        return [value, false];
                    }
                }
                else {
                    return quote(value.value, value.quoting);
                }
            }
            // If we have no args and the command is a string then use the command to stay backwards compatible with the old command line
            // model. To allow variable resolving with spaces we do continue if the resolved value is different than the original one
            // and the resolved one needs quoting.
            if ((!args || args.length === 0) && Types.isString(command) && (command === originalCommand || needsQuotes(originalCommand))) {
                return command;
            }
            const result = [];
            let commandQuoted = false;
            let argQuoted = false;
            let value;
            let quoted;
            [value, quoted] = quoteIfNecessary(command);
            result.push(value);
            commandQuoted = quoted;
            for (const arg of args) {
                [value, quoted] = quoteIfNecessary(arg);
                result.push(value);
                argQuoted = argQuoted || quoted;
            }
            let commandLine = result.join(' ');
            // There are special rules quoted command line in cmd.exe
            if (platform === 3 /* Platform.Platform.Windows */) {
                if (basename === 'cmd' && commandQuoted && argQuoted) {
                    commandLine = '"' + commandLine + '"';
                }
                else if ((basename === 'powershell' || basename === 'pwsh') && commandQuoted) {
                    commandLine = '& ' + commandLine;
                }
            }
            return commandLine;
        }
        _getQuotingOptions(shellBasename, shellOptions, platform) {
            if (shellOptions && shellOptions.quoting) {
                return shellOptions.quoting;
            }
            return TerminalTaskSystem._shellQuotes[shellBasename] || TerminalTaskSystem._osShellQuotes[Platform.PlatformToString(platform)];
        }
        _collectTaskVariables(variables, task) {
            if (task.command && task.command.name) {
                this._collectCommandVariables(variables, task.command, task);
            }
            this._collectMatcherVariables(variables, task.configurationProperties.problemMatchers);
            if (task.command.runtime === tasks_1.RuntimeType.CustomExecution && (tasks_1.CustomTask.is(task) || tasks_1.ContributedTask.is(task))) {
                let definition;
                if (tasks_1.CustomTask.is(task)) {
                    definition = task._source.config.element;
                }
                else {
                    definition = Objects.deepClone(task.defines);
                    delete definition._key;
                    delete definition.type;
                }
                this._collectDefinitionVariables(variables, definition);
            }
        }
        _collectDefinitionVariables(variables, definition) {
            if (Types.isString(definition)) {
                this._collectVariables(variables, definition);
            }
            else if (Array.isArray(definition)) {
                definition.forEach((element) => this._collectDefinitionVariables(variables, element));
            }
            else if (Types.isObject(definition)) {
                for (const key in definition) {
                    this._collectDefinitionVariables(variables, definition[key]);
                }
            }
        }
        _collectCommandVariables(variables, command, task) {
            // The custom execution should have everything it needs already as it provided
            // the callback.
            if (command.runtime === tasks_1.RuntimeType.CustomExecution) {
                return;
            }
            if (command.name === undefined) {
                throw new Error('Command name should never be undefined here.');
            }
            this._collectVariables(variables, command.name);
            command.args?.forEach(arg => this._collectVariables(variables, arg));
            // Try to get a scope.
            const scope = task._source.scope;
            if (scope !== 1 /* TaskScope.Global */) {
                variables.add('${workspaceFolder}');
            }
            if (command.options) {
                const options = command.options;
                if (options.cwd) {
                    this._collectVariables(variables, options.cwd);
                }
                const optionsEnv = options.env;
                if (optionsEnv) {
                    Object.keys(optionsEnv).forEach((key) => {
                        const value = optionsEnv[key];
                        if (Types.isString(value)) {
                            this._collectVariables(variables, value);
                        }
                    });
                }
                if (options.shell) {
                    if (options.shell.executable) {
                        this._collectVariables(variables, options.shell.executable);
                    }
                    options.shell.args?.forEach(arg => this._collectVariables(variables, arg));
                }
            }
        }
        _collectMatcherVariables(variables, values) {
            if (values === undefined || values === null || values.length === 0) {
                return;
            }
            values.forEach((value) => {
                let matcher;
                if (Types.isString(value)) {
                    if (value[0] === '$') {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value.substring(1));
                    }
                    else {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value);
                    }
                }
                else {
                    matcher = value;
                }
                if (matcher && matcher.filePrefix) {
                    if (Types.isString(matcher.filePrefix)) {
                        this._collectVariables(variables, matcher.filePrefix);
                    }
                    else {
                        for (const fp of [...(0, arrays_1.asArray)(matcher.filePrefix.include || []), ...(0, arrays_1.asArray)(matcher.filePrefix.exclude || [])]) {
                            this._collectVariables(variables, fp);
                        }
                    }
                }
            });
        }
        _collectVariables(variables, value) {
            const string = Types.isString(value) ? value : value.value;
            const r = /\$\{(.*?)\}/g;
            let matches;
            do {
                matches = r.exec(string);
                if (matches) {
                    variables.add(matches[0]);
                }
            } while (matches);
        }
        async _resolveCommandAndArgs(resolver, commandConfig) {
            // First we need to use the command args:
            let args = commandConfig.args ? commandConfig.args.slice() : [];
            args = await this._resolveVariables(resolver, args);
            const command = await this._resolveVariable(resolver, commandConfig.name);
            return { command, args };
        }
        async _resolveVariables(resolver, value) {
            return Promise.all(value.map(s => this._resolveVariable(resolver, s)));
        }
        async _resolveMatchers(resolver, values) {
            if (values === undefined || values === null || values.length === 0) {
                return [];
            }
            const result = [];
            for (const value of values) {
                let matcher;
                if (Types.isString(value)) {
                    if (value[0] === '$') {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value.substring(1));
                    }
                    else {
                        matcher = problemMatcher_1.ProblemMatcherRegistry.get(value);
                    }
                }
                else {
                    matcher = value;
                }
                if (!matcher) {
                    this._appendOutput(nls.localize('unknownProblemMatcher', 'Problem matcher {0} can\'t be resolved. The matcher will be ignored'));
                    continue;
                }
                const taskSystemInfo = resolver.taskSystemInfo;
                const hasFilePrefix = matcher.filePrefix !== undefined;
                const hasUriProvider = taskSystemInfo !== undefined && taskSystemInfo.uriProvider !== undefined;
                if (!hasFilePrefix && !hasUriProvider) {
                    result.push(matcher);
                }
                else {
                    const copy = Objects.deepClone(matcher);
                    if (hasUriProvider && (taskSystemInfo !== undefined)) {
                        copy.uriProvider = taskSystemInfo.uriProvider;
                    }
                    if (hasFilePrefix) {
                        const filePrefix = copy.filePrefix;
                        if (Types.isString(filePrefix)) {
                            copy.filePrefix = await this._resolveVariable(resolver, filePrefix);
                        }
                        else if (filePrefix !== undefined) {
                            if (filePrefix.include) {
                                filePrefix.include = Array.isArray(filePrefix.include)
                                    ? await Promise.all(filePrefix.include.map(x => this._resolveVariable(resolver, x)))
                                    : await this._resolveVariable(resolver, filePrefix.include);
                            }
                            if (filePrefix.exclude) {
                                filePrefix.exclude = Array.isArray(filePrefix.exclude)
                                    ? await Promise.all(filePrefix.exclude.map(x => this._resolveVariable(resolver, x)))
                                    : await this._resolveVariable(resolver, filePrefix.exclude);
                            }
                        }
                    }
                    result.push(copy);
                }
            }
            return result;
        }
        async _resolveVariable(resolver, value) {
            // TODO@Dirk Task.getWorkspaceFolder should return a WorkspaceFolder that is defined in workspace.ts
            if (Types.isString(value)) {
                return resolver.resolve(value);
            }
            else if (value !== undefined) {
                return {
                    value: await resolver.resolve(value.value),
                    quoting: value.quoting
                };
            }
            else { // This should never happen
                throw new Error('Should never try to resolve undefined.');
            }
        }
        async _resolveOptions(resolver, options) {
            if (options === undefined || options === null) {
                let cwd;
                try {
                    cwd = await this._resolveVariable(resolver, '${workspaceFolder}');
                }
                catch (e) {
                    // No workspace
                }
                return { cwd };
            }
            const result = Types.isString(options.cwd)
                ? { cwd: await this._resolveVariable(resolver, options.cwd) }
                : { cwd: await this._resolveVariable(resolver, '${workspaceFolder}') };
            if (options.env) {
                result.env = Object.create(null);
                for (const key of Object.keys(options.env)) {
                    const value = options.env[key];
                    if (Types.isString(value)) {
                        result.env[key] = await this._resolveVariable(resolver, value);
                    }
                    else {
                        result.env[key] = value.toString();
                    }
                }
            }
            return result;
        }
        static { this.WellKnownCommands = {
            'ant': true,
            'cmake': true,
            'eslint': true,
            'gradle': true,
            'grunt': true,
            'gulp': true,
            'jake': true,
            'jenkins': true,
            'jshint': true,
            'make': true,
            'maven': true,
            'msbuild': true,
            'msc': true,
            'nmake': true,
            'npm': true,
            'rake': true,
            'tsc': true,
            'xbuild': true
        }; }
        getSanitizedCommand(cmd) {
            let result = cmd.toLowerCase();
            const index = result.lastIndexOf(path.sep);
            if (index !== -1) {
                result = result.substring(index + 1);
            }
            if (TerminalTaskSystem.WellKnownCommands[result]) {
                return result;
            }
            return 'other';
        }
        _appendOutput(output) {
            const outputChannel = this._outputService.getChannel(this._outputChannelId);
            outputChannel?.append(output);
        }
    }
    exports.TerminalTaskSystem = TerminalTaskSystem;
    function getWaitOnExitValue(presentationOptions, configurationProperties) {
        if ((presentationOptions.close === undefined) || (presentationOptions.close === false)) {
            if ((presentationOptions.reveal !== tasks_1.RevealKind.Never) || !configurationProperties.isBackground || (presentationOptions.close === false)) {
                if (presentationOptions.panel === tasks_1.PanelKind.New) {
                    return taskShellIntegrationWaitOnExitSequence(nls.localize('closeTerminal', 'Press any key to close the terminal.'));
                }
                else if (presentationOptions.showReuseMessage) {
                    return taskShellIntegrationWaitOnExitSequence(nls.localize('reuseTerminal', 'Terminal will be reused by tasks, press any key to close it.'));
                }
                else {
                    return true;
                }
            }
        }
        return !presentationOptions.close;
    }
    function taskShellIntegrationWaitOnExitSequence(message) {
        return (exitCode) => {
            return `${(0, terminalEscapeSequences_1.VSCodeSequence)("D" /* VSCodeOscPt.CommandFinished */, exitCode.toString())}${message}`;
        };
    }
    function getReconnectionData(terminal) {
        return terminal.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties?.data;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxUYXNrU3lzdGVtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy9icm93c2VyL3Rlcm1pbmFsVGFza1N5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEyRWhHLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDO0lBRWhDLE1BQU0sZ0JBQWdCO2lCQUNOLFdBQU0sR0FBRyxjQUFjLENBQUM7UUFDdkMsWUFBbUIsZUFBNkMsRUFBUyxjQUEyQyxFQUFrQixNQUEyQixFQUFVLFFBQW1EO1lBQTNNLG9CQUFlLEdBQWYsZUFBZSxDQUE4QjtZQUFTLG1CQUFjLEdBQWQsY0FBYyxDQUE2QjtZQUFrQixXQUFNLEdBQU4sTUFBTSxDQUFxQjtZQUFVLGFBQVEsR0FBUixRQUFRLENBQTJDO1FBQzlOLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQWE7WUFDMUIsTUFBTSxTQUFTLEdBQXNCLEVBQUUsQ0FBQztZQUN4QyxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFO2dCQUN6RCxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2RCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRyxDQUFDLENBQUM7UUFFakYsQ0FBQztR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
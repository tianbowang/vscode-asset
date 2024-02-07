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
define(["require", "exports", "vs/nls", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/contrib/tasks/common/tasks", "vs/platform/quickinput/common/quickInput", "vs/platform/actions/common/actions", "vs/platform/workspace/common/workspaceTrust", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/platform/log/common/log"], function (require, exports, nls, resources, lifecycle_1, taskService_1, tasks_1, quickInput_1, actions_1, workspaceTrust_1, configuration_1, event_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ManageAutomaticTaskRunning = exports.RunAutomaticTasks = void 0;
    const ALLOW_AUTOMATIC_TASKS = 'task.allowAutomaticTasks';
    let RunAutomaticTasks = class RunAutomaticTasks extends lifecycle_1.Disposable {
        constructor(_taskService, _configurationService, _workspaceTrustManagementService, _logService) {
            super();
            this._taskService = _taskService;
            this._configurationService = _configurationService;
            this._workspaceTrustManagementService = _workspaceTrustManagementService;
            this._logService = _logService;
            this._hasRunTasks = false;
            if (this._taskService.isReconnected) {
                this._tryRunTasks();
            }
            else {
                this._register(event_1.Event.once(this._taskService.onDidReconnectToTasks)(async () => await this._tryRunTasks()));
            }
            this._register(this._workspaceTrustManagementService.onDidChangeTrust(async () => await this._tryRunTasks()));
        }
        async _tryRunTasks() {
            if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
                return;
            }
            if (this._hasRunTasks || this._configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === 'off') {
                return;
            }
            this._hasRunTasks = true;
            this._logService.trace('RunAutomaticTasks: Trying to run tasks.');
            // Wait until we have task system info (the extension host and workspace folders are available).
            if (!this._taskService.hasTaskSystemInfo) {
                this._logService.trace('RunAutomaticTasks: Awaiting task system info.');
                await event_1.Event.toPromise(event_1.Event.once(this._taskService.onDidChangeTaskSystemInfo));
            }
            const workspaceTasks = await this._taskService.getWorkspaceTasks(2 /* TaskRunSource.FolderOpen */);
            this._logService.trace(`RunAutomaticTasks: Found ${workspaceTasks.size} automatic tasks`);
            await this._runWithPermission(this._taskService, this._configurationService, workspaceTasks);
        }
        _runTasks(taskService, tasks) {
            tasks.forEach(task => {
                if (task instanceof Promise) {
                    task.then(promiseResult => {
                        if (promiseResult) {
                            taskService.run(promiseResult);
                        }
                    });
                }
                else {
                    taskService.run(task);
                }
            });
        }
        _getTaskSource(source) {
            const taskKind = tasks_1.TaskSourceKind.toConfigurationTarget(source.kind);
            switch (taskKind) {
                case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */: {
                    return resources.joinPath(source.config.workspaceFolder.uri, source.config.file);
                }
                case 5 /* ConfigurationTarget.WORKSPACE */: {
                    return source.config.workspace?.configuration ?? undefined;
                }
            }
            return undefined;
        }
        _findAutoTasks(taskService, workspaceTaskResult) {
            const tasks = new Array();
            const taskNames = new Array();
            const locations = new Map();
            if (workspaceTaskResult) {
                workspaceTaskResult.forEach(resultElement => {
                    if (resultElement.set) {
                        resultElement.set.tasks.forEach(task => {
                            if (task.runOptions.runOn === tasks_1.RunOnOptions.folderOpen) {
                                tasks.push(task);
                                taskNames.push(task._label);
                                const location = this._getTaskSource(task._source);
                                if (location) {
                                    locations.set(location.fsPath, location);
                                }
                            }
                        });
                    }
                    if (resultElement.configurations) {
                        for (const configuredTask of Object.values(resultElement.configurations.byIdentifier)) {
                            if (configuredTask.runOptions.runOn === tasks_1.RunOnOptions.folderOpen) {
                                tasks.push(new Promise(resolve => {
                                    taskService.getTask(resultElement.workspaceFolder, configuredTask._id, true).then(task => resolve(task));
                                }));
                                if (configuredTask._label) {
                                    taskNames.push(configuredTask._label);
                                }
                                else {
                                    taskNames.push(configuredTask.configures.task);
                                }
                                const location = this._getTaskSource(configuredTask._source);
                                if (location) {
                                    locations.set(location.fsPath, location);
                                }
                            }
                        }
                    }
                });
            }
            return { tasks, taskNames, locations };
        }
        async _runWithPermission(taskService, configurationService, workspaceTaskResult) {
            const { tasks, taskNames } = this._findAutoTasks(taskService, workspaceTaskResult);
            if (taskNames.length === 0) {
                return;
            }
            if (configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === 'off') {
                return;
            }
            this._runTasks(taskService, tasks);
        }
    };
    exports.RunAutomaticTasks = RunAutomaticTasks;
    exports.RunAutomaticTasks = RunAutomaticTasks = __decorate([
        __param(0, taskService_1.ITaskService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(3, log_1.ILogService)
    ], RunAutomaticTasks);
    class ManageAutomaticTaskRunning extends actions_1.Action2 {
        static { this.ID = 'workbench.action.tasks.manageAutomaticRunning'; }
        static { this.LABEL = nls.localize('workbench.action.tasks.manageAutomaticRunning', "Manage Automatic Tasks"); }
        constructor() {
            super({
                id: ManageAutomaticTaskRunning.ID,
                title: ManageAutomaticTaskRunning.LABEL,
                category: tasks_1.TASKS_CATEGORY
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const allowItem = { label: nls.localize('workbench.action.tasks.allowAutomaticTasks', "Allow Automatic Tasks") };
            const disallowItem = { label: nls.localize('workbench.action.tasks.disallowAutomaticTasks', "Disallow Automatic Tasks") };
            const value = await quickInputService.pick([allowItem, disallowItem], { canPickMany: false });
            if (!value) {
                return;
            }
            configurationService.updateValue(ALLOW_AUTOMATIC_TASKS, value === allowItem ? 'on' : 'off', 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.ManageAutomaticTaskRunning = ManageAutomaticTaskRunning;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuQXV0b21hdGljVGFza3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2Jyb3dzZXIvcnVuQXV0b21hdGljVGFza3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUJoRyxNQUFNLHFCQUFxQixHQUFHLDBCQUEwQixDQUFDO0lBRWxELElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsc0JBQVU7UUFFaEQsWUFDZSxZQUEyQyxFQUNsQyxxQkFBNkQsRUFDbEQsZ0NBQW1GLEVBQ3hHLFdBQXlDO1lBQ3RELEtBQUssRUFBRSxDQUFDO1lBSnVCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ2pCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDakMscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFrQztZQUN2RixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUwvQyxpQkFBWSxHQUFZLEtBQUssQ0FBQztZQU9yQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNyQixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1RyxDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFD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
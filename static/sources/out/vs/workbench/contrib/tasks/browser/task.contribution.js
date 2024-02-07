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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/platform/progress/common/progress", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/services/output/common/output", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/common/contributions", "vs/workbench/contrib/tasks/browser/runAutomaticTasks", "vs/platform/keybinding/common/keybindingsRegistry", "../common/jsonSchema_v1", "../common/jsonSchema_v2", "vs/workbench/contrib/tasks/browser/abstractTaskService", "vs/workbench/services/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/contextkeys", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/tasks/browser/tasksQuickAccess", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/base/common/types"], function (require, exports, nls, lifecycle_1, platform_1, actions_1, problemMatcher_1, progress_1, jsonContributionRegistry, statusbar_1, output_1, tasks_1, taskService_1, contributions_1, runAutomaticTasks_1, keybindingsRegistry_1, jsonSchema_v1_1, jsonSchema_v2_1, abstractTaskService_1, configuration_1, configurationRegistry_1, contextkeys_1, quickAccess_1, tasksQuickAccess_1, contextkey_1, taskDefinitionRegistry_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskStatusBarContributions = void 0;
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(runAutomaticTasks_1.RunAutomaticTasks, 4 /* LifecyclePhase.Eventually */);
    (0, actions_1.registerAction2)(runAutomaticTasks_1.ManageAutomaticTaskRunning);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: runAutomaticTasks_1.ManageAutomaticTaskRunning.ID,
            title: runAutomaticTasks_1.ManageAutomaticTaskRunning.LABEL,
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    let TaskStatusBarContributions = class TaskStatusBarContributions extends lifecycle_1.Disposable {
        constructor(_taskService, _statusbarService, _progressService) {
            super();
            this._taskService = _taskService;
            this._statusbarService = _statusbarService;
            this._progressService = _progressService;
            this._activeTasksCount = 0;
            this._registerListeners();
        }
        _registerListeners() {
            let promise = undefined;
            let resolver;
            this._taskService.onDidStateChange(event => {
                if (event.kind === "changed" /* TaskEventKind.Changed */) {
                    this._updateRunningTasksStatus();
                }
                if (!this._ignoreEventForUpdateRunningTasksCount(event)) {
                    switch (event.kind) {
                        case "active" /* TaskEventKind.Active */:
                            this._activeTasksCount++;
                            if (this._activeTasksCount === 1) {
                                if (!promise) {
                                    promise = new Promise((resolve) => {
                                        resolver = resolve;
                                    });
                                }
                            }
                            break;
                        case "inactive" /* TaskEventKind.Inactive */:
                            // Since the exiting of the sub process is communicated async we can't order inactive and terminate events.
                            // So try to treat them accordingly.
                            if (this._activeTasksCount > 0) {
                                this._activeTasksCount--;
                                if (this._activeTasksCount === 0) {
                                    if (promise && resolver) {
                                        resolver();
                                    }
                                }
                            }
                            break;
                        case "terminated" /* TaskEventKind.Terminated */:
                            if (this._activeTasksCount !== 0) {
                                this._activeTasksCount = 0;
                                if (promise && resolver) {
                                    resolver();
                                }
                            }
                            break;
                    }
                }
                if (promise && (event.kind === "active" /* TaskEventKind.Active */) && (this._activeTasksCount === 1)) {
                    this._progressService.withProgress({ location: 10 /* ProgressLocation.Window */, command: 'workbench.action.tasks.showTasks', type: 'loading' }, progress => {
                        progress.report({ message: nls.localize('building', 'Building...') });
                        return promise;
                    }).then(() => {
                        promise = undefined;
                    });
                }
            });
        }
        async _updateRunningTasksStatus() {
            const tasks = await this._taskService.getActiveTasks();
            if (tasks.length === 0) {
                if (this._runningTasksStatusItem) {
                    this._runningTasksStatusItem.dispose();
                    this._runningTasksStatusItem = undefined;
                }
            }
            else {
                const itemProps = {
                    name: nls.localize('status.runningTasks', "Running Tasks"),
                    text: `$(tools) ${tasks.length}`,
                    ariaLabel: nls.localize('numberOfRunningTasks', "{0} running tasks", tasks.length),
                    tooltip: nls.localize('runningTasks', "Show Running Tasks"),
                    command: 'workbench.action.tasks.showTasks',
                };
                if (!this._runningTasksStatusItem) {
                    this._runningTasksStatusItem = this._statusbarService.addEntry(itemProps, 'status.runningTasks', 0 /* StatusbarAlignment.LEFT */, 49 /* Medium Priority, next to Markers */);
                }
                else {
                    this._runningTasksStatusItem.update(itemProps);
                }
            }
        }
        _ignoreEventForUpdateRunningTasksCount(event) {
            if (!this._taskService.inTerminal() || event.kind === "changed" /* TaskEventKind.Changed */) {
                return false;
            }
            if (((0, types_1.isString)(event.group) ? event.group : event.group?._id) !== tasks_1.TaskGroup.Build._id) {
                return true;
            }
            return event.__task.configurationProperties.problemMatchers === undefined || event.__task.configurationProperties.problemMatchers.length === 0;
        }
    };
    exports.TaskStatusBarContributions = TaskStatusBarContributions;
    exports.TaskStatusBarContributions = TaskStatusBarContributions = __decorate([
        __param(0, taskService_1.ITaskService),
        __param(1, statusbar_1.IStatusbarService),
        __param(2, progress_1.IProgressService)
    ], TaskStatusBarContributions);
    workbenchRegistry.registerWorkbenchContribution(TaskStatusBarContributions, 3 /* LifecyclePhase.Restored */);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "2_run" /* TerminalMenuBarGroup.Run */,
        command: {
            id: 'workbench.action.tasks.runTask',
            title: nls.localize({ key: 'miRunTask', comment: ['&& denotes a mnemonic'] }, "&&Run Task...")
        },
        order: 1,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "2_run" /* TerminalMenuBarGroup.Run */,
        command: {
            id: 'workbench.action.tasks.build',
            title: nls.localize({ key: 'miBuildTask', comment: ['&& denotes a mnemonic'] }, "Run &&Build Task...")
        },
        order: 2,
        when: taskService_1.TaskExecutionSupportedContext
    });
    // Manage Tasks
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "3_manage" /* TerminalMenuBarGroup.Manage */,
        command: {
            precondition: tasks_1.TASK_RUNNING_STATE,
            id: 'workbench.action.tasks.showTasks',
            title: nls.localize({ key: 'miRunningTask', comment: ['&& denotes a mnemonic'] }, "Show Runnin&&g Tasks...")
        },
        order: 1,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "3_manage" /* TerminalMenuBarGroup.Manage */,
        command: {
            precondition: tasks_1.TASK_RUNNING_STATE,
            id: 'workbench.action.tasks.restartTask',
            title: nls.localize({ key: 'miRestartTask', comment: ['&& denotes a mnemonic'] }, "R&&estart Running Task...")
        },
        order: 2,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "3_manage" /* TerminalMenuBarGroup.Manage */,
        command: {
            precondition: tasks_1.TASK_RUNNING_STATE,
            id: 'workbench.action.tasks.terminate',
            title: nls.localize({ key: 'miTerminateTask', comment: ['&& denotes a mnemonic'] }, "&&Terminate Task...")
        },
        order: 3,
        when: taskService_1.TaskExecutionSupportedContext
    });
    // Configure Tasks
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "4_configure" /* TerminalMenuBarGroup.Configure */,
        command: {
            id: 'workbench.action.tasks.configureTaskRunner',
            title: nls.localize({ key: 'miConfigureTask', comment: ['&& denotes a mnemonic'] }, "&&Configure Tasks...")
        },
        order: 1,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: "4_configure" /* TerminalMenuBarGroup.Configure */,
        command: {
            id: 'workbench.action.tasks.configureDefaultBuildTask',
            title: nls.localize({ key: 'miConfigureBuildTask', comment: ['&& denotes a mnemonic'] }, "Configure De&&fault Build Task...")
        },
        order: 2,
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.openWorkspaceFileTasks',
            title: { value: nls.localize('workbench.action.tasks.openWorkspaceFileTasks', "Open Workspace Tasks"), original: 'Open Workspace Tasks' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), taskService_1.TaskExecutionSupportedContext)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: abstractTaskService_1.ConfigureTaskAction.ID,
            title: { value: abstractTaskService_1.ConfigureTaskAction.TEXT, original: 'Configure Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.showLog',
            title: { value: nls.localize('ShowLogAction.label', "Show Task Log"), original: 'Show Task Log' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.runTask',
            title: { value: nls.localize('RunTaskAction.label', "Run Task"), original: 'Run Task' },
            category: tasks_1.TASKS_CATEGORY
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.reRunTask',
            title: { value: nls.localize('ReRunTaskAction.label', "Rerun Last Task"), original: 'Rerun Last Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.restartTask',
            title: { value: nls.localize('RestartTaskAction.label', "Restart Running Task"), original: 'Restart Running Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.showTasks',
            title: { value: nls.localize('ShowTasksAction.label', "Show Running Tasks"), original: 'Show Running Tasks' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.terminate',
            title: { value: nls.localize('TerminateAction.label', "Terminate Task"), original: 'Terminate Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.build',
            title: { value: nls.localize('BuildAction.label', "Run Build Task"), original: 'Run Build Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.test',
            title: { value: nls.localize('TestAction.label', "Run Test Task"), original: 'Run Test Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.configureDefaultBuildTask',
            title: {
                value: nls.localize('ConfigureDefaultBuildTask.label', "Configure Default Build Task"),
                original: 'Configure Default Build Task'
            },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.configureDefaultTestTask',
            title: {
                value: nls.localize('ConfigureDefaultTestTask.label', "Configure Default Test Task"),
                original: 'Configure Default Test Task'
            },
            category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.openUserTasks',
            title: {
                value: nls.localize('workbench.action.tasks.openUserTasks', "Open User Tasks"),
                original: 'Open User Tasks'
            }, category: tasks_1.TASKS_CATEGORY
        },
        when: taskService_1.TaskExecutionSupportedContext
    });
    class UserTasksGlobalActionContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this.registerActions();
        }
        registerActions() {
            const id = 'workbench.action.tasks.openUserTasks';
            const title = nls.localize('userTasks', "User Tasks");
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                command: {
                    id,
                    title
                },
                when: taskService_1.TaskExecutionSupportedContext,
                group: '2_configuration',
                order: 6
            }));
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                command: {
                    id,
                    title
                },
                when: taskService_1.TaskExecutionSupportedContext,
                group: '2_configuration',
                order: 6
            }));
        }
    }
    workbenchRegistry.registerWorkbenchContribution(UserTasksGlobalActionContribution, 3 /* LifecyclePhase.Restored */);
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.rebuild', title: nls.localize('RebuildAction.label', 'Run Rebuild Task'), category: tasksCategory });
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.clean', title: nls.localize('CleanAction.label', 'Run Clean Task'), category: tasksCategory });
    keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
        id: 'workbench.action.tasks.build',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: taskService_1.TaskCommandsRegistered,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 32 /* KeyCode.KeyB */
    });
    // Tasks Output channel. Register it before using it in Task Service.
    const outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
    outputChannelRegistry.registerChannel({ id: abstractTaskService_1.AbstractTaskService.OutputChannelId, label: abstractTaskService_1.AbstractTaskService.OutputChannelLabel, log: false });
    // Register Quick Access
    const quickAccessRegistry = (platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
    const tasksPickerContextKey = 'inTasksPicker';
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: tasksQuickAccess_1.TasksQuickAccessProvider,
        prefix: tasksQuickAccess_1.TasksQuickAccessProvider.PREFIX,
        contextKey: tasksPickerContextKey,
        placeholder: nls.localize('tasksQuickAccessPlaceholder', "Type the name of a task to run."),
        helpEntries: [{ description: nls.localize('tasksQuickAccessHelp', "Run Task"), commandCenterOrder: 60 }]
    });
    // tasks.json validation
    const schema = {
        id: configuration_1.tasksSchemaId,
        description: 'Task definition file',
        type: 'object',
        allowTrailingCommas: true,
        allowComments: true,
        default: {
            version: '2.0.0',
            tasks: [
                {
                    label: 'My Task',
                    command: 'echo hello',
                    type: 'shell',
                    args: [],
                    problemMatcher: ['$tsc'],
                    presentation: {
                        reveal: 'always'
                    },
                    group: 'build'
                }
            ]
        }
    };
    schema.definitions = {
        ...jsonSchema_v1_1.default.definitions,
        ...jsonSchema_v2_1.default.definitions,
    };
    schema.oneOf = [...(jsonSchema_v2_1.default.oneOf || []), ...(jsonSchema_v1_1.default.oneOf || [])];
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
    jsonRegistry.registerSchema(configuration_1.tasksSchemaId, schema);
    problemMatcher_1.ProblemMatcherRegistry.onMatcherChanged(() => {
        (0, jsonSchema_v2_1.updateProblemMatchers)();
        jsonRegistry.notifySchemaChanged(configuration_1.tasksSchemaId);
    });
    taskDefinitionRegistry_1.TaskDefinitionRegistry.onDefinitionsChanged(() => {
        (0, jsonSchema_v2_1.updateTaskDefinitions)();
        jsonRegistry.notifySchemaChanged(configuration_1.tasksSchemaId);
    });
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'task',
        order: 100,
        title: nls.localize('tasksConfigurationTitle', "Tasks"),
        type: 'object',
        properties: {
            ["task.problemMatchers.neverPrompt" /* TaskSettingId.ProblemMatchersNeverPrompt */]: {
                markdownDescription: nls.localize('task.problemMatchers.neverPrompt', "Configures whether to show the problem matcher prompt when running a task. Set to `true` to never prompt, or use a dictionary of task types to turn off prompting only for specific task types."),
                'oneOf': [
                    {
                        type: 'boolean',
                        markdownDescription: nls.localize('task.problemMatchers.neverPrompt.boolean', 'Sets problem matcher prompting behavior for all tasks.')
                    },
                    {
                        type: 'object',
                        patternProperties: {
                            '.*': {
                                type: 'boolean'
                            }
                        },
                        markdownDescription: nls.localize('task.problemMatchers.neverPrompt.array', 'An object containing task type-boolean pairs to never prompt for problem matchers on.'),
                        default: {
                            'shell': true
                        }
                    }
                ],
                default: false
            },
            ["task.autoDetect" /* TaskSettingId.AutoDetect */]: {
                markdownDescription: nls.localize('task.autoDetect', "Controls enablement of `provideTasks` for all task provider extension. If the Tasks: Run Task command is slow, disabling auto detect for task providers may help. Individual extensions may also provide settings that disable auto detection."),
                type: 'string',
                enum: ['on', 'off'],
                default: 'on'
            },
            ["task.slowProviderWarning" /* TaskSettingId.SlowProviderWarning */]: {
                markdownDescription: nls.localize('task.slowProviderWarning', "Configures whether a warning is shown when a provider is slow"),
                'oneOf': [
                    {
                        type: 'boolean',
                        markdownDescription: nls.localize('task.slowProviderWarning.boolean', 'Sets the slow provider warning for all tasks.')
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string',
                            markdownDescription: nls.localize('task.slowProviderWarning.array', 'An array of task types to never show the slow provider warning.')
                        }
                    }
                ],
                default: true
            },
            ["task.quickOpen.history" /* TaskSettingId.QuickOpenHistory */]: {
                markdownDescription: nls.localize('task.quickOpen.history', "Controls the number of recent items tracked in task quick open dialog."),
                type: 'number',
                default: 30, minimum: 0, maximum: 30
            },
            ["task.quickOpen.detail" /* TaskSettingId.QuickOpenDetail */]: {
                markdownDescription: nls.localize('task.quickOpen.detail', "Controls whether to show the task detail for tasks that have a detail in task quick picks, such as Run Task."),
                type: 'boolean',
                default: true
            },
            ["task.quickOpen.skip" /* TaskSettingId.QuickOpenSkip */]: {
                type: 'boolean',
                description: nls.localize('task.quickOpen.skip', "Controls whether the task quick pick is skipped when there is only one task to pick from."),
                default: false
            },
            ["task.quickOpen.showAll" /* TaskSettingId.QuickOpenShowAll */]: {
                type: 'boolean',
                description: nls.localize('task.quickOpen.showAll', "Causes the Tasks: Run Task command to use the slower \"show all\" behavior instead of the faster two level picker where tasks are grouped by provider."),
                default: false
            },
            ["task.allowAutomaticTasks" /* TaskSettingId.AllowAutomaticTasks */]: {
                type: 'string',
                enum: ['on', 'off'],
                enumDescriptions: [
                    nls.localize('task.allowAutomaticTasks.on', "Always"),
                    nls.localize('task.allowAutomaticTasks.off', "Never"),
                ],
                description: nls.localize('task.allowAutomaticTasks', "Enable automatic tasks - note that tasks won't run in an untrusted workspace."),
                default: 'on',
                restricted: true
            },
            ["task.reconnection" /* TaskSettingId.Reconnection */]: {
                type: 'boolean',
                description: nls.localize('task.reconnection', "On window reload, reconnect to tasks that have problem matchers."),
                default: true
            },
            ["task.saveBeforeRun" /* TaskSettingId.SaveBeforeRun */]: {
                markdownDescription: nls.localize('task.saveBeforeRun', 'Save all dirty editors before running a task.'),
                type: 'string',
                enum: ['always', 'never', 'prompt'],
                enumDescriptions: [
                    nls.localize('task.saveBeforeRun.always', 'Always saves all editors before running.'),
                    nls.localize('task.saveBeforeRun.never', 'Never saves editors before running.'),
                    nls.localize('task.SaveBeforeRun.prompt', 'Prompts whether to save editors before running.'),
                ],
                default: 'always',
            },
            ["task.verboseLogging" /* TaskSettingId.VerboseLogging */]: {
                type: 'boolean',
                description: nls.localize('task.verboseLogging', "Enable verbose logging for tasks."),
                default: false
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rhc2tzL2Jyb3dzZXIvdGFzay5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUNoRyxNQUFNLGlCQUFpQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0RyxpQkFBaUIsQ0FBQyw2QkFBNkIsQ0FBQyxxQ0FBaUIsb0NBQTRCLENBQUM7SUFFOUYsSUFBQSx5QkFBZSxFQUFDLDhDQUEwQixDQUFDLENBQUM7SUFDNUMsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxjQUFjLEVBQUU7UUFDbEQsT0FBTyxFQUFFO1lBQ1IsRUFBRSxFQUFFLDhDQUEwQixDQUFDLEVBQUU7WUFDakMsS0FBSyxFQUFFLDhDQUEwQixDQUFDLEtBQUs7WUFDdkMsUUFBUSxFQUFFLHNCQUFjO1NBQ3hCO1FBQ0QsSUFBSSxFQUFFLDJDQUE2QjtLQUNuQyxDQUFDLENBQUM7SUFFSSxJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEyQixTQUFRLHNCQUFVO1FBSXpELFlBQ2UsWUFBMkMsRUFDdEMsaUJBQXFELEVBQ3RELGdCQUFtRDtZQUVyRSxLQUFLLEVBQUUsQ0FBQztZQUp1QixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUNyQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ3JDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFMOUQsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1lBUXJDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTyxrQkFBa0I7WUFDekIsSUFBSSxPQUFPLEdBQThCLFNBQVMsQ0FBQztZQUNuRCxJ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
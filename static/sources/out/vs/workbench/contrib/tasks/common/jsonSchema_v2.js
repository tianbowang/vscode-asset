/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/objects", "./jsonSchemaCommon", "vs/workbench/contrib/tasks/common/problemMatcher", "./taskDefinitionRegistry", "vs/workbench/services/configurationResolver/common/configurationResolverUtils", "vs/workbench/services/configurationResolver/common/configurationResolverSchema", "vs/base/common/codicons"], function (require, exports, nls, Objects, jsonSchemaCommon_1, problemMatcher_1, taskDefinitionRegistry_1, ConfigurationResolverUtils, configurationResolverSchema_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateProblemMatchers = exports.updateTaskDefinitions = void 0;
    function fixReferences(literal) {
        if (Array.isArray(literal)) {
            literal.forEach(fixReferences);
        }
        else if (typeof literal === 'object') {
            if (literal['$ref']) {
                literal['$ref'] = literal['$ref'] + '2';
            }
            Object.getOwnPropertyNames(literal).forEach(property => {
                const value = literal[property];
                if (Array.isArray(value) || typeof value === 'object') {
                    fixReferences(value);
                }
            });
        }
    }
    const shellCommand = {
        anyOf: [
            {
                type: 'boolean',
                default: true,
                description: nls.localize('JsonSchema.shell', 'Specifies whether the command is a shell command or an external program. Defaults to false if omitted.')
            },
            {
                $ref: '#/definitions/shellConfiguration'
            }
        ],
        deprecationMessage: nls.localize('JsonSchema.tasks.isShellCommand.deprecated', 'The property isShellCommand is deprecated. Use the type property of the task and the shell property in the options instead. See also the 1.14 release notes.')
    };
    const hide = {
        type: 'boolean',
        description: nls.localize('JsonSchema.hide', 'Hide this task from the run task quick pick'),
        default: true
    };
    const taskIdentifier = {
        type: 'object',
        additionalProperties: true,
        properties: {
            type: {
                type: 'string',
                description: nls.localize('JsonSchema.tasks.dependsOn.identifier', 'The task identifier.')
            }
        }
    };
    const dependsOn = {
        anyOf: [
            {
                type: 'string',
                description: nls.localize('JsonSchema.tasks.dependsOn.string', 'Another task this task depends on.')
            },
            taskIdentifier,
            {
                type: 'array',
                description: nls.localize('JsonSchema.tasks.dependsOn.array', 'The other tasks this task depends on.'),
                items: {
                    anyOf: [
                        {
                            type: 'string',
                        },
                        taskIdentifier
                    ]
                }
            }
        ],
        description: nls.localize('JsonSchema.tasks.dependsOn', 'Either a string representing another task or an array of other tasks that this task depends on.')
    };
    const dependsOrder = {
        type: 'string',
        enum: ['parallel', 'sequence'],
        enumDescriptions: [
            nls.localize('JsonSchema.tasks.dependsOrder.parallel', 'Run all dependsOn tasks in parallel.'),
            nls.localize('JsonSchema.tasks.dependsOrder.sequence', 'Run all dependsOn tasks in sequence.'),
        ],
        default: 'parallel',
        description: nls.localize('JsonSchema.tasks.dependsOrder', 'Determines the order of the dependsOn tasks for this task. Note that this property is not recursive.')
    };
    const detail = {
        type: 'string',
        description: nls.localize('JsonSchema.tasks.detail', 'An optional description of a task that shows in the Run Task quick pick as a detail.')
    };
    const icon = {
        type: 'object',
        description: nls.localize('JsonSchema.tasks.icon', 'An optional icon for the task'),
        properties: {
            id: {
                description: nls.localize('JsonSchema.tasks.icon.id', 'An optional codicon ID to use'),
                type: ['string', 'null'],
                enum: Array.from((0, codicons_1.getAllCodicons)(), icon => icon.id),
                markdownEnumDescriptions: Array.from((0, codicons_1.getAllCodicons)(), icon => `$(${icon.id})`),
            },
            color: {
                description: nls.localize('JsonSchema.tasks.icon.color', 'An optional color of the icon'),
                type: ['string', 'null'],
                enum: [
                    'terminal.ansiBlack',
                    'terminal.ansiRed',
                    'terminal.ansiGreen',
                    'terminal.ansiYellow',
                    'terminal.ansiBlue',
                    'terminal.ansiMagenta',
                    'terminal.ansiCyan',
                    'terminal.ansiWhite'
                ],
            },
        }
    };
    const presentation = {
        type: 'object',
        default: {
            echo: true,
            reveal: 'always',
            focus: false,
            panel: 'shared',
            showReuseMessage: true,
            clear: false,
        },
        description: nls.localize('JsonSchema.tasks.presentation', 'Configures the panel that is used to present the task\'s output and reads its input.'),
        additionalProperties: false,
        properties: {
            echo: {
                type: 'boolean',
                default: true,
                description: nls.localize('JsonSchema.tasks.presentation.echo', 'Controls whether the executed command is echoed to the panel. Default is true.')
            },
            focus: {
                type: 'boolean',
                default: false,
                description: nls.localize('JsonSchema.tasks.presentation.focus', 'Controls whether the panel takes focus. Default is false. If set to true the panel is revealed as well.')
            },
            revealProblems: {
                type: 'string',
                enum: ['always', 'onProblem', 'never'],
                enumDescriptions: [
                    nls.localize('JsonSchema.tasks.presentation.revealProblems.always', 'Always reveals the problems panel when this task is executed.'),
                    nls.localize('JsonSchema.tasks.presentation.revealProblems.onProblem', 'Only reveals the problems panel if a problem is found.'),
                    nls.localize('JsonSchema.tasks.presentation.revealProblems.never', 'Never reveals the problems panel when this task is executed.'),
                ],
                default: 'never',
                description: nls.localize('JsonSchema.tasks.presentation.revealProblems', 'Controls whether the problems panel is revealed when running this task or not. Takes precedence over option \"reveal\". Default is \"never\".')
            },
            reveal: {
                type: 'string',
                enum: ['always', 'silent', 'never'],
                enumDescriptions: [
                    nls.localize('JsonSchema.tasks.presentation.reveal.always', 'Always reveals the terminal when this task is executed.'),
                    nls.localize('JsonSchema.tasks.presentation.reveal.silent', 'Only reveals the terminal if the task exits with an error or the problem matcher finds an error.'),
                    nls.localize('JsonSchema.tasks.presentation.reveal.never', 'Never reveals the terminal when this task is executed.'),
                ],
                default: 'always',
                description: nls.localize('JsonSchema.tasks.presentation.reveal', 'Controls whether the terminal running the task is revealed or not. May be overridden by option \"revealProblems\". Default is \"always\".')
            },
            panel: {
                type: 'string',
                enum: ['shared', 'dedicated', 'new'],
                default: 'shared',
                description: nls.localize('JsonSchema.tasks.presentation.instance', 'Controls if the panel is shared between tasks, dedicated to this task or a new one is created on every run.')
            },
            showReuseMessage: {
                type: 'boolean',
                default: true,
                description: nls.localize('JsonSchema.tasks.presentation.showReuseMessage', 'Controls whether to show the `Terminal will be reused by tasks, press any key to close it` message.')
            },
            clear: {
                type: 'boolean',
                default: false,
                description: nls.localize('JsonSchema.tasks.presentation.clear', 'Controls whether the terminal is cleared before executing the task.')
            },
            group: {
                type: 'string',
                description: nls.localize('JsonSchema.tasks.presentation.group', 'Controls whether the task is executed in a specific terminal group using split panes.')
            },
            close: {
                type: 'boolean',
                description: nls.localize('JsonSchema.tasks.presentation.close', 'Controls whether the terminal the task runs in is closed when the task exits.')
            }
        }
    };
    const terminal = Objects.deepClone(presentation);
    terminal.deprecationMessage = nls.localize('JsonSchema.tasks.terminal', 'The terminal property is deprecated. Use presentation instead');
    const groupStrings = {
        type: 'string',
        enum: [
            'build',
            'test',
            'none'
        ],
        enumDescriptions: [
            nls.localize('JsonSchema.tasks.group.build', 'Marks the task as a build task accessible through the \'Run Build Task\' command.'),
            nls.localize('JsonSchema.tasks.group.test', 'Marks the task as a test task accessible through the \'Run Test Task\' command.'),
            nls.localize('JsonSchema.tasks.group.none', 'Assigns the task to no group')
        ],
        description: nls.localize('JsonSchema.tasks.group.kind', 'The task\'s execution group.')
    };
    const group = {
        oneOf: [
            groupStrings,
            {
                type: 'object',
                properties: {
                    kind: groupStrings,
                    isDefault: {
                        type: ['boolean', 'string'],
                        default: false,
                        description: nls.localize('JsonSchema.tasks.group.isDefault', 'Defines if this task is the default task in the group, or a glob to match the file which should trigger this task.')
                    }
                }
            },
        ],
        defaultSnippets: [
            {
                body: { kind: 'build', isDefault: true },
                description: nls.localize('JsonSchema.tasks.group.defaultBuild', 'Marks the task as the default build task.')
            },
            {
                body: { kind: 'test', isDefault: true },
                description: nls.localize('JsonSchema.tasks.group.defaultTest', 'Marks the task as the default test task.')
            }
        ],
        description: nls.localize('JsonSchema.tasks.group', 'Defines to which execution group this task belongs to. It supports "build" to add it to the build group and "test" to add it to the test group.')
    };
    const taskType = {
        type: 'string',
        enum: ['shell'],
        default: 'process',
        description: nls.localize('JsonSchema.tasks.type', 'Defines whether the task is run as a process or as a command inside a shell.')
    };
    const command = {
        oneOf: [
            {
                oneOf: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: nls.localize('JsonSchema.commandArray', 'The shell command to be executed. Array items will be joined using a space character')
                    }
                ]
            },
            {
                type: 'object',
                required: ['value', 'quoting'],
                properties: {
                    value: {
                        oneOf: [
                            {
                                type: 'string'
                            },
                            {
                                type: 'array',
                                items: {
                                    type: 'string'
                                },
                                description: nls.localize('JsonSchema.commandArray', 'The shell command to be executed. Array items will be joined using a space character')
                            }
                        ],
                        description: nls.localize('JsonSchema.command.quotedString.value', 'The actual command value')
                    },
                    quoting: {
                        type: 'string',
                        enum: ['escape', 'strong', 'weak'],
                        enumDescriptions: [
                            nls.localize('JsonSchema.tasks.quoting.escape', 'Escapes characters using the shell\'s escape character (e.g. ` under PowerShell and \\ under bash).'),
                            nls.localize('JsonSchema.tasks.quoting.strong', 'Quotes the argument using the shell\'s strong quote character (e.g. \' under PowerShell and bash).'),
                            nls.localize('JsonSchema.tasks.quoting.weak', 'Quotes the argument using the shell\'s weak quote character (e.g. " under PowerShell and bash).'),
                        ],
                        default: 'strong',
                        description: nls.localize('JsonSchema.command.quotesString.quote', 'How the command value should be quoted.')
                    }
                }
            }
        ],
        description: nls.localize('JsonSchema.command', 'The command to be executed. Can be an external program or a shell command.')
    };
    const args = {
        type: 'array',
        items: {
            oneOf: [
                {
                    type: 'string',
                },
                {
                    type: 'object',
                    required: ['value', 'quoting'],
                    properties: {
                        value: {
                            type: 'string',
                            description: nls.localize('JsonSchema.args.quotedString.value', 'The actual argument value')
                        },
                        quoting: {
                            type: 'string',
                            enum: ['escape', 'strong', 'weak'],
                            enumDescriptions: [
                                nls.localize('JsonSchema.tasks.quoting.escape', 'Escapes characters using the shell\'s escape character (e.g. ` under PowerShell and \\ under bash).'),
                                nls.localize('JsonSchema.tasks.quoting.strong', 'Quotes the argument using the shell\'s strong quote character (e.g. \' under PowerShell and bash).'),
                                nls.localize('JsonSchema.tasks.quoting.weak', 'Quotes the argument using the shell\'s weak quote character (e.g. " under PowerShell and bash).'),
                            ],
                            default: 'strong',
                            description: nls.localize('JsonSchema.args.quotesString.quote', 'How the argument value should be quoted.')
                        }
                    }
                }
            ]
        },
        description: nls.localize('JsonSchema.tasks.args', 'Arguments passed to the command when this task is invoked.')
    };
    const label = {
        type: 'string',
        description: nls.localize('JsonSchema.tasks.label', "The task's user interface label")
    };
    const version = {
        type: 'string',
        enum: ['2.0.0'],
        description: nls.localize('JsonSchema.version', 'The config\'s version number.')
    };
    const identifier = {
        type: 'string',
        description: nls.localize('JsonSchema.tasks.identifier', 'A user defined identifier to reference the task in launch.json or a dependsOn clause.'),
        deprecationMessage: nls.localize('JsonSchema.tasks.identifier.deprecated', 'User defined identifiers are deprecated. For custom task use the name as a reference and for tasks provided by extensions use their defined task identifier.')
    };
    const runOptions = {
        type: 'object',
        additionalProperties: false,
        properties: {
            reevaluateOnRerun: {
                type: 'boolean',
                description: nls.localize('JsonSchema.tasks.reevaluateOnRerun', 'Whether to reevaluate task variables on rerun.'),
                default: true
            },
            runOn: {
                type: 'string',
                enum: ['default', 'folderOpen'],
                description: nls.localize('JsonSchema.tasks.runOn', 'Configures when the task should be run. If set to folderOpen, then the task will be run automatically when the folder is opened.'),
                default: 'default'
            },
            instanceLimit: {
                type: 'number',
                description: nls.localize('JsonSchema.tasks.instanceLimit', 'The number of instances of the task that are allowed to run simultaneously.'),
                default: 1
            },
        },
        description: nls.localize('JsonSchema.tasks.runOptions', 'The task\'s run related options')
    };
    const commonSchemaDefinitions = jsonSchemaCommon_1.default.definitions;
    const options = Objects.deepClone(commonSchemaDefinitions.options);
    const optionsProperties = options.properties;
    optionsProperties.shell = Objects.deepClone(commonSchemaDefinitions.shellConfiguration);
    const taskConfiguration = {
        type: 'object',
        additionalProperties: false,
        properties: {
            label: {
                type: 'string',
                description: nls.localize('JsonSchema.tasks.taskLabel', "The task's label")
            },
            taskName: {
                type: 'string',
                description: nls.localize('JsonSchema.tasks.taskName', 'The task\'s name'),
                deprecationMessage: nls.localize('JsonSchema.tasks.taskName.deprecated', 'The task\'s name property is deprecated. Use the label property instead.')
            },
            identifier: Objects.deepClone(identifier),
            group: Objects.deepClone(group),
            isBackground: {
                type: 'boolean',
                description: nls.localize('JsonSchema.tasks.background', 'Whether the executed task is kept alive and is running in the background.'),
                default: true
            },
            promptOnClose: {
                type: 'boolean',
                description: nls.localize('JsonSchema.tasks.promptOnClose', 'Whether the user is prompted when VS Code closes with a running task.'),
                default: false
            },
            presentation: Objects.deepClone(presentation),
            icon: Objects.deepClone(icon),
            hide: Objects.deepClone(hide),
            options: options,
            problemMatcher: {
                $ref: '#/definitions/problemMatcherType',
                description: nls.localize('JsonSchema.tasks.matchers', 'The problem matcher(s) to use. Can either be a string or a problem matcher definition or an array of strings and problem matchers.')
            },
            runOptions: Objects.deepClone(runOptions),
            dependsOn: Objects.deepClone(dependsOn),
            dependsOrder: Objects.deepClone(dependsOrder),
            detail: Objects.deepClone(detail),
        }
    };
    const taskDefinitions = [];
    taskDefinitionRegistry_1.TaskDefinitionRegistry.onReady().then(() => {
        updateTaskDefinitions();
    });
    function updateTaskDefinitions() {
        for (const taskType of taskDefinitionRegistry_1.TaskDefinitionRegistry.all()) {
            // Check that we haven't already added this task type
            if (taskDefinitions.find(schema => {
                return schema.properties?.type?.enum?.find ? schema.properties?.type.enum.find(element => element === taskType.taskType) : undefined;
            })) {
                continue;
            }
            const schema = Objects.deepClone(taskConfiguration);
            const schemaProperties = schema.properties;
            // Since we do this after the schema is assigned we need to patch the refs.
            schemaProperties.type = {
                type: 'string',
                description: nls.localize('JsonSchema.customizations.customizes.type', 'The task type to customize'),
                enum: [taskType.taskType]
            };
            if (taskType.required) {
                schema.required = taskType.required.slice();
            }
            else {
                schema.required = [];
            }
            // Customized tasks require that the task type be set.
            schema.required.push('type');
            if (taskType.properties) {
                for (const key of Object.keys(taskType.properties)) {
                    const property = taskType.properties[key];
                    schemaProperties[key] = Objects.deepClone(property);
                }
            }
            fixReferences(schema);
            taskDefinitions.push(schema);
        }
    }
    exports.updateTaskDefinitions = updateTaskDefinitions;
    const customize = Objects.deepClone(taskConfiguration);
    customize.properties.customize = {
        type: 'string',
        deprecationMessage: nls.localize('JsonSchema.tasks.customize.deprecated', 'The customize property is deprecated. See the 1.14 release notes on how to migrate to the new task customization approach')
    };
    if (!customize.required) {
        customize.required = [];
    }
    customize.required.push('customize');
    taskDefinitions.push(customize);
    const definitions = Objects.deepClone(commonSchemaDefinitions);
    const taskDescription = definitions.taskDescription;
    taskDescription.required = ['label'];
    const taskDescriptionProperties = taskDescription.properties;
    taskDescriptionProperties.label = Objects.deepClone(label);
    taskDescriptionProperties.command = Objects.deepClone(command);
    taskDescriptionProperties.args = Objects.deepClone(args);
    taskDescriptionProperties.isShellCommand = Objects.deepClone(shellCommand);
    taskDescriptionProperties.dependsOn = dependsOn;
    taskDescriptionProperties.hide = Objects.deepClone(hide);
    taskDescriptionProperties.dependsOrder = dependsOrder;
    taskDescriptionProperties.identifier = Objects.deepClone(identifier);
    taskDescriptionProperties.type = Objects.deepClone(taskType);
    taskDescriptionProperties.presentation = Objects.deepClone(presentation);
    taskDescriptionProperties.terminal = terminal;
    taskDescriptionProperties.icon = Objects.deepClone(icon);
    taskDescriptionProperties.group = Objects.deepClone(group);
    taskDescriptionProperties.runOptions = Objects.deepClone(runOptions);
    taskDescriptionProperties.detail = detail;
    taskDescriptionProperties.taskName.deprecationMessage = nls.localize('JsonSchema.tasks.taskName.deprecated', 'The task\'s name property is deprecated. Use the label property instead.');
    // Clone the taskDescription for process task before setting a default to prevent two defaults #115281
    const processTask = Objects.deepClone(taskDescription);
    taskDescription.default = {
        label: 'My Task',
        type: 'shell',
        command: 'echo Hello',
        problemMatcher: []
    };
    definitions.showOutputType.deprecationMessage = nls.localize('JsonSchema.tasks.showOutput.deprecated', 'The property showOutput is deprecated. Use the reveal property inside the presentation property instead. See also the 1.14 release notes.');
    taskDescriptionProperties.echoCommand.deprecationMessage = nls.localize('JsonSchema.tasks.echoCommand.deprecated', 'The property echoCommand is deprecated. Use the echo property inside the presentation property instead. See also the 1.14 release notes.');
    taskDescriptionProperties.suppressTaskName.deprecationMessage = nls.localize('JsonSchema.tasks.suppressTaskName.deprecated', 'The property suppressTaskName is deprecated. Inline the command with its arguments into the task instead. See also the 1.14 release notes.');
    taskDescriptionProperties.isBuildCommand.deprecationMessage = nls.localize('JsonSchema.tasks.isBuildCommand.deprecated', 'The property isBuildCommand is deprecated. Use the group property instead. See also the 1.14 release notes.');
    taskDescriptionProperties.isTestCommand.deprecationMessage = nls.localize('JsonSchema.tasks.isTestCommand.deprecated', 'The property isTestCommand is deprecated. Use the group property instead. See also the 1.14 release notes.');
    // Process tasks are almost identical schema-wise to shell tasks, but they are required to have a command
    processTask.properties.type = {
        type: 'string',
        enum: ['process'],
        default: 'process',
        description: nls.localize('JsonSchema.tasks.type', 'Defines whether the task is run as a process or as a command inside a shell.')
    };
    processTask.required.push('command');
    processTask.required.push('type');
    taskDefinitions.push(processTask);
    taskDefinitions.push({
        $ref: '#/definitions/taskDescription'
    });
    const definitionsTaskRunnerConfigurationProperties = definitions.taskRunnerConfiguration.properties;
    const tasks = definitionsTaskRunnerConfigurationProperties.tasks;
    tasks.items = {
        oneOf: taskDefinitions
    };
    definitionsTaskRunnerConfigurationProperties.inputs = configurationResolverSchema_1.inputsSchema.definitions.inputs;
    definitions.commandConfiguration.properties.isShellCommand = Objects.deepClone(shellCommand);
    definitions.commandConfiguration.properties.args = Objects.deepClone(args);
    definitions.options.properties.shell = {
        $ref: '#/definitions/shellConfiguration'
    };
    definitionsTaskRunnerConfigurationProperties.isShellCommand = Objects.deepClone(shellCommand);
    definitionsTaskRunnerConfigurationProperties.type = Objects.deepClone(taskType);
    definitionsTaskRunnerConfigurationProperties.group = Objects.deepClone(group);
    definitionsTaskRunnerConfigurationProperties.presentation = Objects.deepClone(presentation);
    definitionsTaskRunnerConfigurationProperties.suppressTaskName.deprecationMessage = nls.localize('JsonSchema.tasks.suppressTaskName.deprecated', 'The property suppressTaskName is deprecated. Inline the command with its arguments into the task instead. See also the 1.14 release notes.');
    definitionsTaskRunnerConfigurationProperties.taskSelector.deprecationMessage = nls.localize('JsonSchema.tasks.taskSelector.deprecated', 'The property taskSelector is deprecated. Inline the command with its arguments into the task instead. See also the 1.14 release notes.');
    const osSpecificTaskRunnerConfiguration = Objects.deepClone(definitions.taskRunnerConfiguration);
    delete osSpecificTaskRunnerConfiguration.properties.tasks;
    osSpecificTaskRunnerConfiguration.additionalProperties = false;
    definitions.osSpecificTaskRunnerConfiguration = osSpecificTaskRunnerConfiguration;
    definitionsTaskRunnerConfigurationProperties.version = Objects.deepClone(version);
    const schema = {
        oneOf: [
            {
                'allOf': [
                    {
                        type: 'object',
                        required: ['version'],
                        properties: {
                            version: Objects.deepClone(version),
                            windows: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize('JsonSchema.windows', 'Windows specific command configuration')
                            },
                            osx: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize('JsonSchema.mac', 'Mac specific command configuration')
                            },
                            linux: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize('JsonSchema.linux', 'Linux specific command configuration')
                            }
                        }
                    },
                    {
                        $ref: '#/definitions/taskRunnerConfiguration'
                    }
                ]
            }
        ]
    };
    schema.definitions = definitions;
    function deprecatedVariableMessage(schemaMap, property) {
        const mapAtProperty = schemaMap[property].properties;
        if (mapAtProperty) {
            Object.keys(mapAtProperty).forEach(name => {
                deprecatedVariableMessage(mapAtProperty, name);
            });
        }
        else {
            ConfigurationResolverUtils.applyDeprecatedVariableMessage(schemaMap[property]);
        }
    }
    Object.getOwnPropertyNames(definitions).forEach(key => {
        const newKey = key + '2';
        definitions[newKey] = definitions[key];
        delete definitions[key];
        deprecatedVariableMessage(definitions, newKey);
    });
    fixReferences(schema);
    function updateProblemMatchers() {
        try {
            const matcherIds = problemMatcher_1.ProblemMatcherRegistry.keys().map(key => '$' + key);
            definitions.problemMatcherType2.oneOf[0].enum = matcherIds;
            definitions.problemMatcherType2.oneOf[2].items.anyOf[0].enum = matcherIds;
        }
        catch (err) {
            console.log('Installing problem matcher ids failed');
        }
    }
    exports.updateProblemMatchers = updateProblemMatchers;
    problemMatcher_1.ProblemMatcherRegistry.onReady().then(() => {
        updateProblemMatchers();
    });
    exports.default = schema;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvblNjaGVtYV92Mi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGFza3MvY29tbW9uL2pzb25TY2hlbWFfdjIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLFNBQVMsYUFBYSxDQUFDLE9BQVk7UUFDbEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDNUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoQyxDQUFDO2FBQU0sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUN4QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNyQixPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUN6QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDdEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQ3ZELGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEIsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztJQUNGLENBQUM7SUFFRCxNQUFNLFlBQVksR0FBZ0I7UUFDakMsS0FBSyxFQUFFO1lBQ047Z0JBQ0MsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsd0dBQXdHLENBQUM7YUFDdko7WUFDRDtnQkFDQyxJQUFJLEVBQUUsa0NBQWtDO2FBQ3hDO1NBQ0Q7UUFDRCxrQkFBa0IsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDRDQUE0QyxFQUFFLDhKQUE4SixDQUFDO0tBQzlPLENBQUM7SUFHRixNQUFNLElBQUksR0FBZ0I7UUFDekIsSUFBSSxFQUFFLFNBQVM7UUFDZixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSw2Q0FBNkMsQ0FBQztRQUMzRixPQUFPLEVBQUUsSUFBSTtLQUNiLENBQUM7SUFFRixNQUFNLGNBQWMsR0FBZ0I7UUFDbkMsSUFBSSxFQUFFLFFBQVE7UUFDZCxvQkFBb0IsRUFBRSxJQUFJO1FBQzFCLFVBQVUsRUFBRTtZQUNYLElBQUksRUFBRTtnQkFDTCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsRUFBRSxzQkFBc0IsQ0FBQzthQUMxRjtTQUNEO0tBQ0QsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFnQjtRQUM5QixLQUFLLEVBQUU7WUFDTjtnQkFDQyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQ0FBbUMsRUFBRSxvQ0FBb0MsQ0FBQzthQUNwRztZQUNELGNBQWM7WUFDZDtnQkFDQyxJQUFJLEVBQUUsT0FBTztnQkFDYixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSx1Q0FBdUMsQ0FBQztnQkFDdEcsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRTt3QkFDTjs0QkFDQyxJQUFJLEVBQUUsUUFBUTt5QkFDZDt3QkFDRCxjQUFjO3FCQUNkO2lCQUNEO2FBQ0Q7U0FDRDtRQUNELFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLGlHQUFpRyxDQUFDO0tBQzFKLENBQUM7SUFFRixNQUFNLFlBQVksR0FBZ0I7UUFDakMsSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDO1FBQzlCLGdCQUFnQixFQUFFO1lBQ2pCLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0NBQXdDLEVBQUUsc0NBQXNDLENBQUM7WUFDOUYsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSxzQ0FBc0MsQ0FBQztTQUM5RjtRQUNELE9BQU8sRUFBRSxVQUFVO1FBQ25CLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLHNHQUFzRyxDQUFDO0tBQ2xLLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBZ0I7UUFDM0IsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxzRkFBc0YsQ0FBQztLQUM1SSxDQUFDO0lBRUYsTUFBTSxJQUFJLEdBQWdCO1FBQ3pCLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsK0JBQStCLENBQUM7UUFDbkYsVUFBVSxFQUFFO1lBQ1gsRUFBRSxFQUFFO2dCQUNILFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLCtCQUErQixDQUFDO2dCQUN0RixJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO2dCQUN4QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFBLHlCQUFjLEdBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ25ELHdCQUF3QixFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBQSx5QkFBYyxHQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQzthQUMvRTtZQUNELEtBQUssRUFBRTtnQkFDTixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSwrQkFBK0IsQ0FBQztnQkFDekYsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztnQkFDeEIsSUFBSSxFQUFFO29CQUNMLG9CQUFvQjtvQkFDcEIsa0JBQWtCO29CQUNsQixvQkFBb0I7b0JBQ3BCLHFCQUFxQjtvQkFDckIsbUJBQW1CO29CQUNuQixzQkFBc0I7b0JBQ3RCLG1CQUFtQjtvQkFDbkIsb0JBQW9CO2lCQUNwQjthQUNEO1NBQ0Q7S0FDRCxDQUFDO0lBRUYsTUFBTSxZQUFZLEdBQWdCO1FBQ2pDLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFO1lBQ1IsSUFBSSxFQUFFLElBQUk7WUFDVixNQUFNLEVBQUUsUUFBUTtZQUNoQixLQUFLLEVBQUUsS0FBSztZQUNaLEtBQUssRUFBRSxRQUFRO1lBQ2YsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixLQUFLLEVBQUUsS0FBSztTQUNaO1FBQ0QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUsc0ZBQXNGLENBQUM7UUFDbEosb0JBQW9CLEVBQUUsS0FBSztRQUMzQixVQUFVLEVBQUU7WUFDWCxJQUFJLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0NBQW9DLEVBQUUsZ0ZBQWdGLENBQUM7YUFDako7WUFDRCxLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUNBQXFDLEVBQUUseUdBQXlHLENBQUM7YUFDM0s7WUFDRCxjQUFjLEVBQUU7Z0JBQ2YsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUM7Z0JBQ3RDLGdCQUFnQixFQUFFO29CQUNqQixHQUFHLENBQUMsUUFBUSxDQUFDLHFEQUFxRCxFQUFFLCtEQUErRCxDQUFDO29CQUNwSSxHQUFHLENBQUMsUUFBUSxDQUFDLHdEQUF3RCxFQUFFLHdEQUF3RCxDQUFDO29CQUNoSSxHQUFHLENBQUMsUUFBUSxDQUFDLG9EQUFvRCxFQUFFLDhEQUE4RCxDQUFDO2lCQUNsSTtnQkFDRCxPQUFPLEVBQUUsT0FBTztnQkFDaEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsOENBQThDLEVBQUUsK0lBQStJLENBQUM7YUFDMU47WUFDRCxNQUFNLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUM7Z0JBQ25DLGdCQUFnQixFQUFFO29CQUNqQixHQUFHLENBQUMsUUFBUSxDQUFDLDZDQUE2QyxFQUFFLHlEQUF5RCxDQUFDO29CQUN0SCxHQUFHLENBQUMsUUFBUSxDQUFDLDZDQUE2QyxFQUFFLGtHQUFrRyxDQUFDO29CQUMvSixHQUFHLENBQUMsUUFBUSxDQUFDLDRDQUE0QyxFQUFFLHdEQUF3RCxDQUFDO2lCQUNwSDtnQkFDRCxPQUFPLEVBQUUsUUFBUTtnQkFDakIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0NBQXNDLEVBQUUsMklBQTJJLENBQUM7YUFDOU07WUFDRCxLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUM7Z0JBQ3BDLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSw2R0FBNkcsQ0FBQzthQUNsTDtZQUNELGdCQUFnQixFQUFFO2dCQUNqQixJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsSUFBSTtnQkFDYixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnREFBZ0QsRUFBRSxxR0FBcUcsQ0FBQzthQUNsTDtZQUNELEtBQUssRUFBRTtnQkFDTixJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsS0FBSztnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSxxRUFBcUUsQ0FBQzthQUN2STtZQUNELEtBQUssRUFBRTtnQkFDTixJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSx1RkFBdUYsQ0FBQzthQUN6SjtZQUNELEtBQUssRUFBRTtnQkFDTixJQUFJLEVBQUUsU0FBUztnQkFDZixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSwrRUFBK0UsQ0FBQzthQUNqSjtTQUNEO0tBQ0QsQ0FBQztJQUVGLE1BQU0sUUFBUSxHQUFnQixPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlELFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLCtEQUErRCxDQUFDLENBQUM7SUFFekksTUFBTSxZQUFZLEdBQWdCO1FBQ2pDLElBQUksRUFBRSxRQUFRO1FBQ2QsSUFBSSxFQUFFO1lBQ0wsT0FBTztZQUNQLE1BQU07WUFDTixNQUFNO1NBQ047UUFDRCxnQkFBZ0IsRUFBRTtZQUNqQixHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLG1GQUFtRixDQUFDO1lBQ2pJLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkJBQTZCLEVBQUUsaUZBQWlGLENBQUM7WUFDOUgsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSw4QkFBOEIsQ0FBQztTQUMzRTtRQUNELFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLDhCQUE4QixDQUFDO0tBQ3hGLENBQUM7SUFFRixNQUFNLEtBQUssR0FBZ0I7UUFDMUIsS0FBSyxFQUFFO1lBQ04sWUFBWTtZQUNaO2dCQUNDLElBQUksRUFBRSxRQUFRO2dCQUNkLFVBQVUsRUFBRTtvQkFDWCxJQUFJLEVBQUUsWUFBWTtvQkFDbEIsU0FBUyxFQUFFO3dCQUNWLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUM7d0JBQzNCLE9BQU8sRUFBRSxLQUFLO3dCQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLG9IQUFvSCxDQUFDO3FCQUNuTDtpQkFDRDthQUNEO1NBQ0Q7UUFDRCxlQUFlLEVBQUU7WUFDaEI7Z0JBQ0MsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO2dCQUN4QyxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSwyQ0FBMkMsQ0FBQzthQUM3RztZQUNEO2dCQUNDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtnQkFDdkMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0NBQW9DLEVBQUUsMENBQTBDLENBQUM7YUFDM0c7U0FDRDtRQUNELFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLGlKQUFpSixDQUFDO0tBQ3RNLENBQUM7SUFFRixNQUFNLFFBQVEsR0FBZ0I7UUFDN0IsSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUM7UUFDZixPQUFPLEVBQUUsU0FBUztRQUNsQixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSw4RUFBOEUsQ0FBQztLQUNsSSxDQUFDO0lBRUYsTUFBTSxPQUFPLEdBQWdCO1FBQzVCLEtBQUssRUFBRTtZQUNOO2dCQUNDLEtBQUssRUFBRTtvQkFDTjt3QkFDQyxJQUFJLEVBQUUsUUFBUTtxQkFDZDtvQkFDRDt3QkFDQyxJQUFJLEVBQUUsT0FBTzt3QkFDYixLQUFLLEVBQUU7NEJBQ04sSUFBSSxFQUFFLFFBQVE7eUJBQ2Q7d0JBQ0QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsc0ZBQXNGLENBQUM7cUJBQzVJO2lCQUNEO2FBQ0Q7WUFDRDtnQkFDQyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO2dCQUM5QixVQUFVLEVBQUU7b0JBQ1gsS0FBSyxFQUFFO3dCQUNOLEtBQUssRUFBRTs0QkFDTjtnQ0FDQyxJQUFJLEVBQUUsUUFBUTs2QkFDZDs0QkFDRDtnQ0FDQyxJQUFJLEVBQUUsT0FBTztnQ0FDYixLQUFLLEVBQUU7b0NBQ04sSUFBSSxFQUFFLFFBQVE7aUNBQ2Q7Z0NBQ0QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsc0ZBQXNGLENBQUM7NkJBQzVJO3lCQUNEO3dCQUNELFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHVDQUF1QyxFQUFFLDBCQUEwQixDQUFDO3FCQUM5RjtvQkFDRCxPQUFPLEVBQUU7d0JBQ1IsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUM7d0JBQ2xDLGdCQUFnQixFQUFFOzRCQUNqQixHQUFHLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxFQUFFLHFHQUFxRyxDQUFDOzRCQUN0SixHQUFHLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxFQUFFLG9HQUFvRyxDQUFDOzRCQUNySixHQUFHLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLGlHQUFpRyxDQUFDO3lCQUNoSjt3QkFDRCxPQUFPLEVBQUUsUUFBUTt3QkFDakIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUNBQXVDLEVBQUUseUNBQXlDLENBQUM7cUJBQzdHO2lCQUNEO2FBRUQ7U0FDRDtRQUNELFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLDRFQUE0RSxDQUFDO0tBQzdILENBQUM7SUFFRixNQUFNLElBQUksR0FBZ0I7UUFDekIsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUU7WUFDTixLQUFLLEVBQUU7Z0JBQ047b0JBQ0MsSUFBSSxFQUFFLFFBQVE7aUJBQ2Q7Z0JBQ0Q7b0JBQ0MsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztvQkFDOUIsVUFBVSxFQUFFO3dCQUNYLEtBQUssRUFBRTs0QkFDTixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSwyQkFBMkIsQ0FBQzt5QkFDNUY7d0JBQ0QsT0FBTyxFQUFFOzRCQUNSLElBQUksRUFBRSxRQUFROzRCQUNkLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDOzRCQUNsQyxnQkFBZ0IsRUFBRTtnQ0FDakIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRSxxR0FBcUcsQ0FBQztnQ0FDdEosR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRSxvR0FBb0csQ0FBQztnQ0FDckosR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSxpR0FBaUcsQ0FBQzs2QkFDaEo7NEJBQ0QsT0FBTyxFQUFFLFFBQVE7NEJBQ2pCLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9DQUFvQyxFQUFFLDBDQUEwQyxDQUFDO3lCQUMzRztxQkFDRDtpQkFFRDthQUNEO1NBQ0Q7UUFDRCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSw0REFBNEQsQ0FBQztLQUNoSCxDQUFDO0lBRUYsTUFBTSxLQUFLLEdBQWdCO1FBQzFCLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsaUNBQWlDLENBQUM7S0FDdEYsQ0FBQztJQUVGLE1BQU0sT0FBTyxHQUFnQjtRQUM1QixJQUFJLEVBQUUsUUFBUTtRQUNkLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQztRQUNmLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLCtCQUErQixDQUFDO0tBQ2hGLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBZ0I7UUFDL0IsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSx1RkFBdUYsQ0FBQztRQUNqSixrQkFBa0IsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHdDQUF3QyxFQUFFLDhKQUE4SixDQUFDO0tBQzFPLENBQUM7SUFFRixNQUFNLFVBQVUsR0FBZ0I7UUFDL0IsSUFBSSxFQUFFLFFBQVE7UUFDZCxvQkFBb0IsRUFBRSxLQUFLO1FBQzNCLFVBQVUsRUFBRTtZQUNYLGlCQUFpQixFQUFFO2dCQUNsQixJQUFJLEVBQUUsU0FBUztnQkFDZixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSxnREFBZ0QsQ0FBQztnQkFDakgsT0FBTyxFQUFFLElBQUk7YUFDYjtZQUNELEtBQUssRUFBRTtnQkFDTixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDO2dCQUMvQixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxrSUFBa0ksQ0FBQztnQkFDdkwsT0FBTyxFQUFFLFNBQVM7YUFDbEI7WUFDRCxhQUFhLEVBQUU7Z0JBQ2QsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsNkVBQTZFLENBQUM7Z0JBQzFJLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7U0FDRDtRQUNELFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDZCQUE2QixFQUFFLGlDQUFpQyxDQUFDO0tBQzNGLENBQUM7SUFFRixNQUFNLHVCQUF1QixHQUFHLDBCQUFZLENBQUMsV0FBWSxDQUFDO0lBQzFELE1BQU0sT0FBTyxHQUFnQixPQUFPLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hGLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLFVBQVcsQ0FBQztJQUM5QyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBRXhGLE1BQU0saUJBQWlCLEdBQWdCO1FBQ3RDLElBQUksRUFBRSxRQUFRO1FBQ2Qsb0JBQW9CLEVBQUUsS0FBSztRQUMzQixVQUFVLEVBQUU7WUFDWCxLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUUsa0JBQWtCLENBQUM7YUFDM0U7WUFDRCxRQUFRLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsa0JBQWtCLENBQUM7Z0JBQzFFLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0NBQXNDLEVBQUUsMEVBQTBFLENBQUM7YUFDcEo7WUFDRCxVQUFVLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7WUFDekMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQy9CLFlBQVksRUFBRTtnQkFDYixJQUFJLEVBQUUsU0FBUztnQkFDZixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSwyRUFBMkUsQ0FBQztnQkFDckksT0FBTyxFQUFFLElBQUk7YUFDYjtZQUNELGFBQWEsRUFBRTtnQkFDZCxJQUFJLEVBQUUsU0FBUztnQkFDZixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRSx1RUFBdUUsQ0FBQztnQkFDcEksT0FBTyxFQUFFLEtBQUs7YUFDZDtZQUNELFlBQVksRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztZQUM3QyxJQUFJLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFDN0IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQzdCLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLGNBQWMsRUFBRTtnQkFDZixJQUFJLEVBQUUsa0NBQWtDO2dCQUN4QyxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxvSUFBb0ksQ0FBQzthQUM1TDtZQUNELFVBQVUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztZQUN6QyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7WUFDdkMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO1lBQzdDLE1BQU0sRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztTQUNqQztLQUNELENBQUM7SUFFRixNQUFNLGVBQWUsR0FBa0IsRUFBRSxDQUFDO0lBQzFDLCtDQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDMUMscUJBQXFCLEVBQUUsQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQztJQUVILFNBQWdCLHFCQUFxQjtRQUNwQyxLQUFLLE1BQU0sUUFBUSxJQUFJLCtDQUFzQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDckQscURBQXFEO1lBQ3JELElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDakMsT0FBTyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3RJLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ0osU0FBUztZQUNWLENBQUM7WUFFRCxNQUFNLE1BQU0sR0FBZ0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFVBQVcsQ0FBQztZQUM1QywyRUFBMkU7WUFDM0UsZ0JBQWdCLENBQUMsSUFBSSxHQUFHO2dCQUN2QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQ0FBMkMsRUFBRSw0QkFBNEIsQ0FBQztnQkFDcEcsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQzthQUN6QixDQUFDO1lBQ0YsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM3QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDdEIsQ0FBQztZQUNELHNEQUFzRDtZQUN0RCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QixJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDekIsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO29CQUNwRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMxQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDO1lBQ0YsQ0FBQztZQUNELGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QixlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLENBQUM7SUFDRixDQUFDO0lBakNELHNEQWlDQztJQUVELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2RCxTQUFTLENBQUMsVUFBVyxDQUFDLFNBQVMsR0FBRztRQUNqQyxJQUFJLEVBQUUsUUFBUTtRQUNkLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUNBQXVDLEVBQUUsMkhBQTJILENBQUM7S0FDdE0sQ0FBQztJQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDekIsU0FBUyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUNELFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3JDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFaEMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQy9ELE1BQU0sZUFBZSxHQUFnQixXQUFXLENBQUMsZUFBZSxDQUFDO0lBQ2pFLGVBQWUsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxNQUFNLHlCQUF5QixHQUFHLGVBQWUsQ0FBQyxVQUFXLENBQUM7SUFDOUQseUJBQXlCLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0QseUJBQXlCLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0QseUJBQXlCLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekQseUJBQXlCLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDM0UseUJBQXlCLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUNoRCx5QkFBeUIsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6RCx5QkFBeUIsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ3RELHlCQUF5QixDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JFLHlCQUF5QixDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdELHlCQUF5QixDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3pFLHlCQUF5QixDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDOUMseUJBQXlCLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekQseUJBQXlCLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0QseUJBQXlCLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckUseUJBQXlCLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUMxQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FDbkUsc0NBQXNDLEVBQ3RDLDBFQUEwRSxDQUMxRSxDQUFDO0lBQ0Ysc0dBQXNHO0lBQ3RHLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdkQsZUFBZSxDQUFDLE9BQU8sR0FBRztRQUN6QixLQUFLLEVBQUUsU0FBUztRQUNoQixJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLGNBQWMsRUFBRSxFQUFFO0tBQ2xCLENBQUM7SUFDRixXQUFXLENBQUMsY0FBYyxDQUFDLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQzNELHdDQUF3QyxFQUN4QywySUFBMkksQ0FDM0ksQ0FBQztJQUNGLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUN0RSx5Q0FBeUMsRUFDekMsMElBQTBJLENBQzFJLENBQUM7SUFDRix5QkFBeUIsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUMzRSw4Q0FBOEMsRUFDOUMsNElBQTRJLENBQzVJLENBQUM7SUFDRix5QkFBeUIsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FDekUsNENBQTRDLEVBQzVDLDZHQUE2RyxDQUM3RyxDQUFDO0lBQ0YseUJBQXlCLENBQUMsYUFBYSxDQUFDLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQ3hFLDJDQUEyQyxFQUMzQyw0R0FBNEcsQ0FDNUcsQ0FBQztJQUVGLHlHQUF5RztJQUN6RyxXQUFXLENBQUMsVUFBVyxDQUFDLElBQUksR0FBRztRQUM5QixJQUFJLEVBQUUsUUFBUTtRQUNkLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQztRQUNqQixPQUFPLEVBQUUsU0FBUztRQUNsQixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSw4RUFBOEUsQ0FBQztLQUNsSSxDQUFDO0lBQ0YsV0FBVyxDQUFDLFFBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEMsV0FBVyxDQUFDLFFBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbkMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVsQyxlQUFlLENBQUMsSUFBSSxDQUFDO1FBQ3BCLElBQUksRUFBRSwrQkFBK0I7S0FDdEIsQ0FBQyxDQUFDO0lBRWxCLE1BQU0sNENBQTRDLEdBQUcsV0FBVyxDQUFDLHVCQUF1QixDQUFDLFVBQVcsQ0FBQztJQUNyRyxNQUFNLEtBQUssR0FBRyw0Q0FBNEMsQ0FBQyxLQUFLLENBQUM7SUFDakUsS0FBSyxDQUFDLEtBQUssR0FBRztRQUNiLEtBQUssRUFBRSxlQUFlO0tBQ3RCLENBQUM7SUFFRiw0Q0FBNEMsQ0FBQyxNQUFNLEdBQUcsMENBQVksQ0FBQyxXQUFZLENBQUMsTUFBTSxDQUFDO0lBRXZGLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFXLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUYsV0FBVyxDQUFDLG9CQUFvQixDQUFDLFVBQVcsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1RSxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVcsQ0FBQyxLQUFLLEdBQUc7UUFDdkMsSUFBSSxFQUFFLGtDQUFrQztLQUN4QyxDQUFDO0lBRUYsNENBQTRDLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUYsNENBQTRDLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEYsNENBQTRDLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUUsNENBQTRDLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUYsNENBQTRDLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FDOUYsOENBQThDLEVBQzlDLDRJQUE0SSxDQUM1SSxDQUFDO0lBQ0YsNENBQTRDLENBQUMsWUFBWSxDQUFDLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQzFGLDBDQUEwQyxFQUMxQyx3SUFBd0ksQ0FDeEksQ0FBQztJQUVGLE1BQU0saUNBQWlDLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUNqRyxPQUFPLGlDQUFpQyxDQUFDLFVBQVcsQ0FBQyxLQUFLLENBQUM7SUFDM0QsaUNBQWlDLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0lBQy9ELFdBQVcsQ0FBQyxpQ0FBaUMsR0FBRyxpQ0FBaUMsQ0FBQztJQUNsRiw0Q0FBNEMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVsRixNQUFNLE1BQU0sR0FBZ0I7UUFDM0IsS0FBSyxFQUFFO1lBQ047Z0JBQ0MsT0FBTyxFQUFFO29CQUNSO3dCQUNDLElBQUksRUFBRSxRQUFRO3dCQUNkLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQzt3QkFDckIsVUFBVSxFQUFFOzRCQUNYLE9BQU8sRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQzs0QkFDbkMsT0FBTyxFQUFFO2dDQUNSLE1BQU0sRUFBRSxpREFBaUQ7Z0NBQ3pELGFBQWEsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHdDQUF3QyxDQUFDOzZCQUMzRjs0QkFDRCxHQUFHLEVBQUU7Z0NBQ0osTUFBTSxFQUFFLGlEQUFpRDtnQ0FDekQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsb0NBQW9DLENBQUM7NkJBQ25GOzRCQUNELEtBQUssRUFBRTtnQ0FDTixNQUFNLEVBQUUsaURBQWlEO2dDQUN6RCxhQUFhLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxzQ0FBc0MsQ0FBQzs2QkFDdkY7eUJBQ0Q7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsSUFBSSxFQUFFLHVDQUF1QztxQkFDN0M7aUJBQ0Q7YUFDRDtTQUNEO0tBQ0QsQ0FBQztJQUVGLE1BQU0sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBRWpDLFNBQVMseUJBQXlCLENBQUMsU0FBeUIsRUFBRSxRQUFnQjtRQUM3RSxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVyxDQUFDO1FBQ3RELElBQUksYUFBYSxFQUFFLENBQUM7WUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pDLHlCQUF5QixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ1AsMEJBQTBCLENBQUMsOEJBQThCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FBQztJQUNGLENBQUM7SUFFRCxNQUFNLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3JELE1BQU0sTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDekIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxPQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4Qix5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQyxDQUFDLENBQUM7SUFDSCxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFdEIsU0FBZ0IscUJBQXFCO1FBQ3BDLElBQUksQ0FBQztZQUNKLE1BQU0sVUFBVSxHQUFHLHVDQUFzQixDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUN2RSxXQUFXLENBQUMsbUJBQW1CLENBQUMsS0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7WUFDM0QsV0FBVyxDQUFDLG1CQUFtQixDQUFDLEtBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFxQixDQUFDLEtBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQzlGLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7SUFDRixDQUFDO0lBUkQsc0RBUUM7SUFFRCx1Q0FBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQzFDLHFCQUFxQixFQUFFLENBQUM7SUFDekIsQ0FBQyxDQUFDLENBQUM7SUFFSCxrQkFBZSxNQUFNLENBQUMifQ==
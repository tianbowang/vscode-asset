/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/configuration/common/configuration", "vs/base/common/types", "vs/platform/extensions/common/extensions"], function (require, exports, nls, objects, platform_1, extensionsRegistry_1, configurationRegistry_1, jsonContributionRegistry_1, configuration_1, types_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const configurationEntrySchema = {
        type: 'object',
        defaultSnippets: [{ body: { title: '', properties: {} } }],
        properties: {
            title: {
                description: nls.localize('vscode.extension.contributes.configuration.title', 'A title for the current category of settings. This label will be rendered in the Settings editor as a subheading. If the title is the same as the extension display name, then the category will be grouped under the main extension heading.'),
                type: 'string'
            },
            order: {
                description: nls.localize('vscode.extension.contributes.configuration.order', 'When specified, gives the order of this category of settings relative to other categories.'),
                type: 'integer'
            },
            properties: {
                description: nls.localize('vscode.extension.contributes.configuration.properties', 'Description of the configuration properties.'),
                type: 'object',
                propertyNames: {
                    pattern: '\\S+',
                    patternErrorMessage: nls.localize('vscode.extension.contributes.configuration.property.empty', 'Property should not be empty.'),
                },
                additionalProperties: {
                    anyOf: [
                        {
                            title: nls.localize('vscode.extension.contributes.configuration.properties.schema', 'Schema of the configuration property.'),
                            $ref: 'http://json-schema.org/draft-07/schema#'
                        },
                        {
                            type: 'object',
                            properties: {
                                scope: {
                                    type: 'string',
                                    enum: ['application', 'machine', 'window', 'resource', 'language-overridable', 'machine-overridable'],
                                    default: 'window',
                                    enumDescriptions: [
                                        nls.localize('scope.application.description', "Configuration that can be configured only in the user settings."),
                                        nls.localize('scope.machine.description', "Configuration that can be configured only in the user settings or only in the remote settings."),
                                        nls.localize('scope.window.description', "Configuration that can be configured in the user, remote or workspace settings."),
                                        nls.localize('scope.resource.description', "Configuration that can be configured in the user, remote, workspace or folder settings."),
                                        nls.localize('scope.language-overridable.description', "Resource configuration that can be configured in language specific settings."),
                                        nls.localize('scope.machine-overridable.description', "Machine configuration that can be configured also in workspace or folder settings.")
                                    ],
                                    markdownDescription: nls.localize('scope.description', "Scope in which the configuration is applicable. Available scopes are `application`, `machine`, `window`, `resource`, and `machine-overridable`.")
                                },
                                enumDescriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: nls.localize('scope.enumDescriptions', 'Descriptions for enum values')
                                },
                                markdownEnumDescriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: nls.localize('scope.markdownEnumDescriptions', 'Descriptions for enum values in the markdown format.')
                                },
                                enumItemLabels: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    markdownDescription: nls.localize('scope.enumItemLabels', 'Labels for enum values to be displayed in the Settings editor. When specified, the {0} values still show after the labels, but less prominently.', '`enum`')
                                },
                                markdownDescription: {
                                    type: 'string',
                                    description: nls.localize('scope.markdownDescription', 'The description in the markdown format.')
                                },
                                deprecationMessage: {
                                    type: 'string',
                                    description: nls.localize('scope.deprecationMessage', 'If set, the property is marked as deprecated and the given message is shown as an explanation.')
                                },
                                markdownDeprecationMessage: {
                                    type: 'string',
                                    description: nls.localize('scope.markdownDeprecationMessage', 'If set, the property is marked as deprecated and the given message is shown as an explanation in the markdown format.')
                                },
                                editPresentation: {
                                    type: 'string',
                                    enum: ['singlelineText', 'multilineText'],
                                    enumDescriptions: [
                                        nls.localize('scope.singlelineText.description', 'The value will be shown in an inputbox.'),
                                        nls.localize('scope.multilineText.description', 'The value will be shown in a textarea.')
                                    ],
                                    default: 'singlelineText',
                                    description: nls.localize('scope.editPresentation', 'When specified, controls the presentation format of the string setting.')
                                },
                                order: {
                                    type: 'integer',
                                    description: nls.localize('scope.order', 'When specified, gives the order of this setting relative to other settings within the same category. Settings with an order property will be placed before settings without this property set.')
                                },
                                ignoreSync: {
                                    type: 'boolean',
                                    description: nls.localize('scope.ignoreSync', 'When enabled, Settings Sync will not sync the user value of this configuration by default.')
                                },
                            }
                        }
                    ]
                }
            }
        }
    };
    // build up a delta across two ext points and only apply it once
    let _configDelta;
    // BEGIN VSCode extension point `configurationDefaults`
    const defaultConfigurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'configurationDefaults',
        jsonSchema: {
            $ref: configurationRegistry_1.configurationDefaultsSchemaId,
        }
    });
    defaultConfigurationExtPoint.setHandler((extensions, { added, removed }) => {
        if (_configDelta) {
            // HIGHLY unlikely, but just in case
            configurationRegistry.deltaConfiguration(_configDelta);
        }
        const configNow = _configDelta = {};
        // schedule a HIGHLY unlikely task in case only the default configurations EXT point changes
        queueMicrotask(() => {
            if (_configDelta === configNow) {
                configurationRegistry.deltaConfiguration(_configDelta);
                _configDelta = undefined;
            }
        });
        if (removed.length) {
            const removedDefaultConfigurations = removed.map(extension => ({ overrides: objects.deepClone(extension.value), source: { id: extension.description.identifier.value, displayName: extension.description.displayName } }));
            _configDelta.removedDefaults = removedDefaultConfigurations;
        }
        if (added.length) {
            const registeredProperties = configurationRegistry.getConfigurationProperties();
            const allowedScopes = [6 /* ConfigurationScope.MACHINE_OVERRIDABLE */, 3 /* ConfigurationScope.WINDOW */, 4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */];
            const addedDefaultConfigurations = added.map(extension => {
                const overrides = objects.deepClone(extension.value);
                for (const key of Object.keys(overrides)) {
                    if (!configurationRegistry_1.OVERRIDE_PROPERTY_REGEX.test(key)) {
                        const registeredPropertyScheme = registeredProperties[key];
                        if (registeredPropertyScheme?.scope && !allowedScopes.includes(registeredPropertyScheme.scope)) {
                            extension.collector.warn(nls.localize('config.property.defaultConfiguration.warning', "Cannot register configuration defaults for '{0}'. Only defaults for machine-overridable, window, resource and language overridable scoped settings are supported.", key));
                            delete overrides[key];
                        }
                    }
                }
                return { overrides, source: { id: extension.description.identifier.value, displayName: extension.description.displayName } };
            });
            _configDelta.addedDefaults = addedDefaultConfigurations;
        }
    });
    // END VSCode extension point `configurationDefaults`
    // BEGIN VSCode extension point `configuration`
    const configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'configuration',
        deps: [defaultConfigurationExtPoint],
        jsonSchema: {
            description: nls.localize('vscode.extension.contributes.configuration', 'Contributes configuration settings.'),
            oneOf: [
                configurationEntrySchema,
                {
                    type: 'array',
                    items: configurationEntrySchema
                }
            ]
        }
    });
    const extensionConfigurations = new extensions_1.ExtensionIdentifierMap();
    configurationExtPoint.setHandler((extensions, { added, removed }) => {
        // HIGHLY unlikely (only configuration but not defaultConfiguration EXT point changes)
        _configDelta ??= {};
        if (removed.length) {
            const removedConfigurations = [];
            for (const extension of removed) {
                removedConfigurations.push(...(extensionConfigurations.get(extension.description.identifier) || []));
                extensionConfigurations.delete(extension.description.identifier);
            }
            _configDelta.removedConfigurations = removedConfigurations;
        }
        const seenProperties = new Set();
        function handleConfiguration(node, extension) {
            const configurations = [];
            const configuration = objects.deepClone(node);
            if (configuration.title && (typeof configuration.title !== 'string')) {
                extension.collector.error(nls.localize('invalid.title', "'configuration.title' must be a string"));
            }
            validateProperties(configuration, extension);
            configuration.id = node.id || extension.description.identifier.value;
            configuration.extensionInfo = { id: extension.description.identifier.value, displayName: extension.description.displayName };
            configuration.restrictedProperties = extension.description.capabilities?.untrustedWorkspaces?.supported === 'limited' ? extension.description.capabilities?.untrustedWorkspaces.restrictedConfigurations : undefined;
            configuration.title = configuration.title || extension.description.displayName || extension.description.identifier.value;
            configurations.push(configuration);
            return configurations;
        }
        function validateProperties(configuration, extension) {
            const properties = configuration.properties;
            if (properties) {
                if (typeof properties !== 'object') {
                    extension.collector.error(nls.localize('invalid.properties', "'configuration.properties' must be an object"));
                    configuration.properties = {};
                }
                for (const key in properties) {
                    const propertyConfiguration = properties[key];
                    const message = (0, configurationRegistry_1.validateProperty)(key, propertyConfiguration);
                    if (message) {
                        delete properties[key];
                        extension.collector.warn(message);
                        continue;
                    }
                    if (seenProperties.has(key)) {
                        delete properties[key];
                        extension.collector.warn(nls.localize('config.property.duplicate', "Cannot register '{0}'. This property is already registered.", key));
                        continue;
                    }
                    if (!(0, types_1.isObject)(propertyConfiguration)) {
                        delete properties[key];
                        extension.collector.error(nls.localize('invalid.property', "configuration.properties property '{0}' must be an object", key));
                        continue;
                    }
                    seenProperties.add(key);
                    if (propertyConfiguration.scope) {
                        if (propertyConfiguration.scope.toString() === 'application') {
                            propertyConfiguration.scope = 1 /* ConfigurationScope.APPLICATION */;
                        }
                        else if (propertyConfiguration.scope.toString() === 'machine') {
                            propertyConfiguration.scope = 2 /* ConfigurationScope.MACHINE */;
                        }
                        else if (propertyConfiguration.scope.toString() === 'resource') {
                            propertyConfiguration.scope = 4 /* ConfigurationScope.RESOURCE */;
                        }
                        else if (propertyConfiguration.scope.toString() === 'machine-overridable') {
                            propertyConfiguration.scope = 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */;
                        }
                        else if (propertyConfiguration.scope.toString() === 'language-overridable') {
                            propertyConfiguration.scope = 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */;
                        }
                        else {
                            propertyConfiguration.scope = 3 /* ConfigurationScope.WINDOW */;
                        }
                    }
                    else {
                        propertyConfiguration.scope = 3 /* ConfigurationScope.WINDOW */;
                    }
                }
            }
            const subNodes = configuration.allOf;
            if (subNodes) {
                extension.collector.error(nls.localize('invalid.allOf', "'configuration.allOf' is deprecated and should no longer be used. Instead, pass multiple configuration sections as an array to the 'configuration' contribution point."));
                for (const node of subNodes) {
                    validateProperties(node, extension);
                }
            }
        }
        if (added.length) {
            const addedConfigurations = [];
            for (const extension of added) {
                const configurations = [];
                const value = extension.value;
                if (Array.isArray(value)) {
                    value.forEach(v => configurations.push(...handleConfiguration(v, extension)));
                }
                else {
                    configurations.push(...handleConfiguration(value, extension));
                }
                extensionConfigurations.set(extension.description.identifier, configurations);
                addedConfigurations.push(...configurations);
            }
            _configDelta.addedConfigurations = addedConfigurations;
        }
        configurationRegistry.deltaConfiguration(_configDelta);
        _configDelta = undefined;
    });
    // END VSCode extension point `configuration`
    jsonRegistry.registerSchema('vscode://schemas/workspaceConfig', {
        allowComments: true,
        allowTrailingCommas: true,
        default: {
            folders: [
                {
                    path: ''
                }
            ],
            settings: {}
        },
        required: ['folders'],
        properties: {
            'folders': {
                minItems: 0,
                uniqueItems: true,
                description: nls.localize('workspaceConfig.folders.description', "List of folders to be loaded in the workspace."),
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { path: '$1' } }],
                    oneOf: [{
                            properties: {
                                path: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.path.description', "A file path. e.g. `/root/folderA` or `./folderA` for a relative path that will be resolved against the location of the workspace file.")
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.name.description', "An optional name for the folder. ")
                                }
                            },
                            required: ['path']
                        }, {
                            properties: {
                                uri: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.uri.description', "URI of the folder")
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize('workspaceConfig.name.description', "An optional name for the folder. ")
                                }
                            },
                            required: ['uri']
                        }]
                }
            },
            'settings': {
                type: 'object',
                default: {},
                description: nls.localize('workspaceConfig.settings.description', "Workspace settings"),
                $ref: configuration_1.workspaceSettingsSchemaId
            },
            'launch': {
                type: 'object',
                default: { configurations: [], compounds: [] },
                description: nls.localize('workspaceConfig.launch.description', "Workspace launch configurations"),
                $ref: configuration_1.launchSchemaId
            },
            'tasks': {
                type: 'object',
                default: { version: '2.0.0', tasks: [] },
                description: nls.localize('workspaceConfig.tasks.description', "Workspace task configurations"),
                $ref: configuration_1.tasksSchemaId
            },
            'extensions': {
                type: 'object',
                default: {},
                description: nls.localize('workspaceConfig.extensions.description', "Workspace extensions"),
                $ref: 'vscode://schemas/extensions'
            },
            'remoteAuthority': {
                type: 'string',
                doNotSuggest: true,
                description: nls.localize('workspaceConfig.remoteAuthority', "The remote server where the workspace is located."),
            },
            'transient': {
                type: 'boolean',
                doNotSuggest: true,
                description: nls.localize('workspaceConfig.transient', "A transient workspace will disappear when restarting or reloading."),
            }
        },
        errorMessage: nls.localize('unknownWorkspaceProperty', "Unknown workspace configuration property")
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbkV4dGVuc2lvblBvaW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9jb25maWd1cmF0aW9uRXh0ZW5zaW9uUG9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFjaEcsTUFBTSxZQUFZLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQTRCLHFDQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM3RixNQUFNLHFCQUFxQixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRTVGLE1BQU0sd0JBQXdCLEdBQWdCO1FBQzdDLElBQUksRUFBRSxRQUFRO1FBQ2QsZUFBZSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQzFELFVBQVUsRUFBRTtZQUNYLEtBQUssRUFBRTtnQkFDTixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrREFBa0QsRUFBRSwrT0FBK08sQ0FBQztnQkFDOVQsSUFBSSxFQUFFLFFBQVE7YUFDZDtZQUNELEtBQUssRUFBRTtnQkFDTixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrREFBa0QsRUFBRSw0RkFBNEYsQ0FBQztnQkFDM0ssSUFBSSxFQUFFLFNBQVM7YUFDZjtZQUNELFVBQVUsRUFBRTtnQkFDWCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1REFBdUQsRUFBRSw4Q0FBOEMsQ0FBQztnQkFDbEksSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsYUFBYSxFQUFFO29CQUNkLE9BQU8sRUFBRSxNQUFNO29CQUNmLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMkRBQTJELEVBQUUs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
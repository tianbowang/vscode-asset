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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/arrays", "vs/base/common/event", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files"], function (require, exports, nls_1, platform_1, lifecycle_1, configurationRegistry_1, configuration_1, editorResolverService_1, extensions_1, arrays_1, event_1, environmentService_1, files_1) {
    "use strict";
    var DynamicEditorConfigurations_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DynamicEditorConfigurations = void 0;
    let DynamicEditorConfigurations = class DynamicEditorConfigurations extends lifecycle_1.Disposable {
        static { DynamicEditorConfigurations_1 = this; }
        static { this.AUTO_LOCK_DEFAULT_ENABLED = new Set([
            'terminalEditor',
            'mainThreadWebview-simpleBrowser.view',
            'mainThreadWebview-browserPreview'
        ]); }
        static { this.AUTO_LOCK_EXTRA_EDITORS = [
            // List some editor input identifiers that are not
            // registered yet via the editor resolver infrastructure
            {
                id: 'workbench.input.interactive',
                label: (0, nls_1.localize)('interactiveWindow', 'Interactive Window'),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            },
            {
                id: 'mainThreadWebview-markdown.preview',
                label: (0, nls_1.localize)('markdownPreview', "Markdown Preview"),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            },
            {
                id: 'mainThreadWebview-simpleBrowser.view',
                label: (0, nls_1.localize)('simpleBrowser', "Simple Browser"),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            },
            {
                id: 'mainThreadWebview-browserPreview',
                label: (0, nls_1.localize)('livePreview', "Live Preview"),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }
        ]; }
        static { this.AUTO_LOCK_REMOVE_EDITORS = new Set([
            // List some editor types that the above `AUTO_LOCK_EXTRA_EDITORS`
            // already covers to avoid duplicates.
            'vscode-interactive-input',
            'interactive',
            'vscode.markdown.preview.editor'
        ]); }
        constructor(editorResolverService, extensionService, environmentService) {
            super();
            this.editorResolverService = editorResolverService;
            this.environmentService = environmentService;
            this.configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            // Editor configurations are getting updated very aggressively
            // (atleast 20 times) while the extensions are getting registered.
            // As such push out the dynamic configuration until after extensions
            // are registered.
            (async () => {
                await extensionService.whenInstalledExtensionsRegistered();
                this.updateDynamicEditorConfigurations();
                this.registerListeners();
            })();
        }
        registerListeners() {
            // Registered editors (debounced to reduce perf overhead)
            event_1.Event.debounce(this.editorResolverService.onDidChangeEditorRegistrations, (_, e) => e)(() => this.updateDynamicEditorConfigurations());
        }
        updateDynamicEditorConfigurations() {
            const lockableEditors = [...this.editorResolverService.getEditors(), ...DynamicEditorConfigurations_1.AUTO_LOCK_EXTRA_EDITORS].filter(e => !DynamicEditorConfigurations_1.AUTO_LOCK_REMOVE_EDITORS.has(e.id));
            const binaryEditorCandidates = this.editorResolverService.getEditors().filter(e => e.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive).map(e => e.id);
            // Build config from registered editors
            const autoLockGroupConfiguration = Object.create(null);
            for (const editor of lockableEditors) {
                autoLockGroupConfiguration[editor.id] = {
                    type: 'boolean',
                    default: DynamicEditorConfigurations_1.AUTO_LOCK_DEFAULT_ENABLED.has(editor.id),
                    description: editor.label
                };
            }
            // Build default config too
            const defaultAutoLockGroupConfiguration = Object.create(null);
            for (const editor of lockableEditors) {
                defaultAutoLockGroupConfiguration[editor.id] = DynamicEditorConfigurations_1.AUTO_LOCK_DEFAULT_ENABLED.has(editor.id);
            }
            // Register setting for auto locking groups
            const oldAutoLockConfigurationNode = this.autoLockConfigurationNode;
            this.autoLockConfigurationNode = {
                ...configuration_1.workbenchConfigurationNodeBase,
                properties: {
                    'workbench.editor.autoLockGroups': {
                        type: 'object',
                        description: (0, nls_1.localize)('workbench.editor.autoLockGroups', "If an editor matching one of the listed types is opened as the first in an editor group and more than one group is open, the group is automatically locked. Locked groups will only be used for opening editors when explicitly chosen by a user gesture (for example drag and drop), but not by default. Consequently, the active editor in a locked group is less likely to be replaced accidentally with a different editor."),
                        properties: autoLockGroupConfiguration,
                        default: defaultAutoLockGroupConfiguration,
                        additionalProperties: false
                    }
                }
            };
            // Registers setting for default binary editors
            const oldDefaultBinaryEditorConfigurationNode = this.defaultBinaryEditorConfigurationNode;
            this.defaultBinaryEditorConfigurationNode = {
                ...configuration_1.workbenchConfigurationNodeBase,
                properties: {
                    'workbench.editor.defaultBinaryEditor': {
                        type: 'string',
                        default: '',
                        // This allows for intellisense autocompletion
                        enum: [...binaryEditorCandidates, ''],
                        description: (0, nls_1.localize)('workbench.editor.defaultBinaryEditor', "The default editor for files detected as binary. If undefined, the user will be presented with a picker."),
                    }
                }
            };
            // Registers setting for editorAssociations
            const oldEditorAssociationsConfigurationNode = this.editorAssociationsConfigurationNode;
            this.editorAssociationsConfigurationNode = {
                ...configuration_1.workbenchConfigurationNodeBase,
                properties: {
                    'workbench.editorAssociations': {
                        type: 'object',
                        markdownDescription: (0, nls_1.localize)('editor.editorAssociations', "Configure [glob patterns](https://aka.ms/vscode-glob-patterns) to editors (for example `\"*.hex\": \"hexEditor.hexedit\"`). These have precedence over the default behavior."),
                        patternProperties: {
                            '.*': {
                                type: 'string',
                                enum: binaryEditorCandidates,
                            }
                        }
                    }
                }
            };
            // Registers setting for large file confirmation based on environment
            const oldEditorLargeFileConfirmationConfigurationNode = this.editorLargeFileConfirmationConfigurationNode;
            this.editorLargeFileConfirmationConfigurationNode = {
                ...configuration_1.workbenchConfigurationNodeBase,
                properties: {
                    'workbench.editorLargeFileConfirmation': {
                        type: 'number',
                        default: (0, files_1.getLargeFileConfirmationLimit)(this.environmentService.remoteAuthority) / files_1.ByteSize.MB,
                        minimum: 1,
                        scope: 4 /* ConfigurationScope.RESOURCE */,
                        markdownDescription: (0, nls_1.localize)('editorLargeFileSizeConfirmation', "Controls the minimum size of a file in MB before asking for confirmation when opening in the editor. Note that this setting may not apply to all editor types and environments."),
                    }
                }
            };
            this.configurationRegistry.updateConfigurations({
                add: [
                    this.autoLockConfigurationNode,
                    this.defaultBinaryEditorConfigurationNode,
                    this.editorAssociationsConfigurationNode,
                    this.editorLargeFileConfirmationConfigurationNode
                ],
                remove: (0, arrays_1.coalesce)([
                    oldAutoLockConfigurationNode,
                    oldDefaultBinaryEditorConfigurationNode,
                    oldEditorAssociationsConfigurationNode,
                    oldEditorLargeFileConfirmationConfigurationNode
                ])
            });
        }
    };
    exports.DynamicEditorConfigurations = DynamicEditorConfigurations;
    exports.DynamicEditorConfigurations = DynamicEditorConfigurations = DynamicEditorConfigurations_1 = __decorate([
        __param(0, editorResolverService_1.IEditorResolverService),
        __param(1, extensions_1.IExtensionService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService)
    ], DynamicEditorConfigurations);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQ29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2VkaXRvckNvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdCekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTs7aUJBRWxDLDhCQUF5QixHQUFHLElBQUksR0FBRyxDQUFTO1lBQ25FLGdCQUFnQjtZQUNoQixzQ0FBc0M7WUFDdEMsa0NBQWtDO1NBQ2xDLENBQUMsQUFKK0MsQ0FJOUM7aUJBRXFCLDRCQUF1QixHQUEyQjtZQUV6RSxrREFBa0Q7WUFDbEQsd0RBQXdEO1lBRXhEO2dCQUNDLEVBQUUsRUFBRSw2QkFBNkI7Z0JBQ2pDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxvQkFBb0IsQ0FBQztnQkFDMUQsUUFBUSxFQUFFLGdEQUF3QixDQUFDLE9BQU87YUFDMUM7WUFDRDtnQkFDQyxFQUFFLEVBQUUsb0NBQW9DO2dCQUN4QyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLENBQUM7Z0JBQ3RELFFBQVEsRUFBRSxnREFBd0IsQ0FBQyxPQUFPO2FBQzFDO1lBQ0Q7Z0JBQ0MsRUFBRSxFQUFFLHNDQUFzQztnQkFDMUMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQztnQkFDbEQsUUFBUSxFQUFFLGdEQUF3QixDQUFDLE9BQU87YUFDMUM7WUFDRDtnQkFDQyxFQUFFLEVBQUUsa0NBQWtDO2dCQUN0QyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQztnQkFDOUMsUUFBUSxFQUFFLGdEQUF3QixDQUFDLE9BQU87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
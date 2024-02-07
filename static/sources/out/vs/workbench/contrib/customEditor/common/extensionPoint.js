/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/language/common/languageService"], function (require, exports, nls, extensionsRegistry_1, languageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.customEditorsExtensionPoint = void 0;
    const Fields = Object.freeze({
        viewType: 'viewType',
        displayName: 'displayName',
        selector: 'selector',
        priority: 'priority',
    });
    const CustomEditorsContribution = {
        description: nls.localize('contributes.customEditors', 'Contributed custom editors.'),
        type: 'array',
        defaultSnippets: [{
                body: [{
                        [Fields.viewType]: '$1',
                        [Fields.displayName]: '$2',
                        [Fields.selector]: [{
                                filenamePattern: '$3'
                            }],
                    }]
            }],
        items: {
            type: 'object',
            required: [
                Fields.viewType,
                Fields.displayName,
                Fields.selector,
            ],
            properties: {
                [Fields.viewType]: {
                    type: 'string',
                    markdownDescription: nls.localize('contributes.viewType', 'Identifier for the custom editor. This must be unique across all custom editors, so we recommend including your extension id as part of `viewType`. The `viewType` is used when registering custom editors with `vscode.registerCustomEditorProvider` and in the `onCustomEditor:${id}` [activation event](https://code.visualstudio.com/api/references/activation-events).'),
                },
                [Fields.displayName]: {
                    type: 'string',
                    description: nls.localize('contributes.displayName', 'Human readable name of the custom editor. This is displayed to users when selecting which editor to use.'),
                },
                [Fields.selector]: {
                    type: 'array',
                    description: nls.localize('contributes.selector', 'Set of globs that the custom editor is enabled for.'),
                    items: {
                        type: 'object',
                        defaultSnippets: [{
                                body: {
                                    filenamePattern: '$1',
                                }
                            }],
                        properties: {
                            filenamePattern: {
                                type: 'string',
                                description: nls.localize('contributes.selector.filenamePattern', 'Glob that the custom editor is enabled for.'),
                            },
                        }
                    }
                },
                [Fields.priority]: {
                    type: 'string',
                    markdownDeprecationMessage: nls.localize('contributes.priority', 'Controls if the custom editor is enabled automatically when the user opens a file. This may be overridden by users using the `workbench.editorAssociations` setting.'),
                    enum: [
                        "default" /* CustomEditorPriority.default */,
                        "option" /* CustomEditorPriority.option */,
                    ],
                    markdownEnumDescriptions: [
                        nls.localize('contributes.priority.default', 'The editor is automatically used when the user opens a resource, provided that no other default custom editors are registered for that resource.'),
                        nls.localize('contributes.priority.option', 'The editor is not automatically used when the user opens a resource, but a user can switch to the editor using the `Reopen With` command.'),
                    ],
                    default: 'default'
                }
            }
        }
    };
    exports.customEditorsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'customEditors',
        deps: [languageService_1.languagesExtPoint],
        jsonSchema: CustomEditorsContribution,
        activationEventsGenerator: (contribs, result) => {
            for (const contrib of contribs) {
                const viewType = contrib[Fields.viewType];
                if (viewType) {
                    result.push(`onCustomEditor:${viewType}`);
                }
            }
        },
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUG9pbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2N1c3RvbUVkaXRvci9jb21tb24vZXh0ZW5zaW9uUG9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsV0FBVyxFQUFFLGFBQWE7UUFDMUIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFLFVBQVU7S0FDcEIsQ0FBQyxDQUFDO0lBU0gsTUFBTSx5QkFBeUIsR0FBZ0I7UUFDOUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsNkJBQTZCLENBQUM7UUFDckYsSUFBSSxFQUFFLE9BQU87UUFDYixlQUFlLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxFQUFFLENBQUM7d0JBQ04sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSTt3QkFDdkIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSTt3QkFDMUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQ0FDbkIsZUFBZSxFQUFFLElBQUk7NkJBQ3JCLENBQUM7cUJBQ0YsQ0FBQzthQUNGLENBQUM7UUFDRixLQUFLLEVBQUU7WUFDTixJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBRTtnQkFDVCxNQUFNLENBQUMsUUFBUTtnQkFDZixNQUFNLENBQUMsV0FBVztnQkFDbEIsTUFBTSxDQUFDLFFBQVE7YUFDZjtZQUNELFVBQVUsRUFBRTtnQkFDWCxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDbEIsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSw2V0FBNlcsQ0FBQztpQkFDeGE7Z0JBQ0QsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ3JCLElBQUksRUFBRSxRQUFRO29CQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLDBHQUEwRyxDQUFDO2lCQUNoSztnQkFDRCxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDbEIsSUFBSSxFQUFFLE9BQU87b0JBQ2IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUscURBQXFELENBQUM7b0JBQ3hHLEtBQUssRUFBRTt3QkFDTixJQUFJLEVBQUUsUUFBUTt3QkFDZCxlQUFlLEVBQUUsQ0FBQztnQ0FDakIsSUFBSSxFQUFFO29DQUNMLGVBQWUsRUFBRSxJQUFJO2lDQUNyQjs2QkFDRCxDQUFDO3dCQUNGLFVBQVUsRUFBRTs0QkFDWCxlQUFlLEVBQUU7Z0NBQ2hCLElBQUksRUFBRSxRQUFRO2dDQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLDZDQUE2QyxDQUFDOzZCQUNoSDt5QkFDRDtxQkFDRDtpQkFDRDtnQkFDRCxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDbEIsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsMEJBQTBCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxzS0FBc0ssQ0FBQztvQkFDeE8sSUFBSSxFQUFFOzs7cUJBR0w7b0JBQ0Qsd0JBQXdCLEVBQUU7d0JBQ3pCLEdBQUcsQ0FBQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsa0pBQWtKLENBQUM7d0JBQ2hNLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkJBQTZCLEVBQUUsMklBQTJJLENBQUM7cUJBQ3hMO29CQUNELE9BQU8sRUFBRSxTQUFTO2lCQUNsQjthQUNEO1NBQ0Q7S0FDRCxDQUFDO0lBRVcsUUFBQSwyQkFBMkIsR0FBRyx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBaUM7UUFDcEgsY0FBYyxFQUFFLGVBQWU7UUFDL0IsSUFBSSxFQUFFLENBQUMsbUNBQWlCLENBQUM7UUFDekIsVUFBVSxFQUFFLHlCQUF5QjtRQUNyQyx5QkFBeUIsRUFBRSxDQUFDLFFBQXdDLEVBQUUsTUFBb0MsRUFBRSxFQUFFO1lBQzdHLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzFDLElBQUksUUFBUSxFQUFFLENBQUM7b0JBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO0tBQ0QsQ0FBQyxDQUFDIn0=
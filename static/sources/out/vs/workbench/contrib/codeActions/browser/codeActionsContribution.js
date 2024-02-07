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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/config/editorConfigurationSchema", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform"], function (require, exports, event_1, lifecycle_1, editorConfigurationSchema_1, codeAction_1, types_1, nls, configurationRegistry_1, keybinding_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionsContribution = exports.editorConfiguration = void 0;
    const createCodeActionsAutoSave = (description) => {
        return {
            type: 'string',
            enum: ['always', 'explicit', 'never', true, false],
            enumDescriptions: [
                nls.localize('alwaysSave', 'Triggers Code Actions on explicit saves and auto saves triggered by window or focus changes.'),
                nls.localize('explicitSave', 'Triggers Code Actions only when explicitly saved'),
                nls.localize('neverSave', 'Never triggers Code Actions on save'),
                nls.localize('explicitSaveBoolean', 'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "explicit".'),
                nls.localize('neverSaveBoolean', 'Never triggers Code Actions on save. This value will be deprecated in favor of "never".')
            ],
            default: 'explicit',
            description: description
        };
    };
    const codeActionsOnSaveDefaultProperties = Object.freeze({
        'source.fixAll': createCodeActionsAutoSave(nls.localize('codeActionsOnSave.fixAll', "Controls whether auto fix action should be run on file save.")),
    });
    const codeActionsOnSaveSchema = {
        oneOf: [
            {
                type: 'object',
                properties: codeActionsOnSaveDefaultProperties,
                additionalProperties: {
                    type: 'string'
                },
            },
            {
                type: 'array',
                items: { type: 'string' }
            }
        ],
        markdownDescription: nls.localize('editor.codeActionsOnSave', 'Run Code Actions for the editor on save. Code Actions must be specified and the editor must not be shutting down. Example: `"source.organizeImports": "explicit" `'),
        type: ['object', 'array'],
        additionalProperties: {
            type: 'string',
            enum: ['always', 'explicit', 'never', true, false],
        },
        default: {},
        scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
    };
    exports.editorConfiguration = Object.freeze({
        ...editorConfigurationSchema_1.editorConfigurationBaseNode,
        properties: {
            'editor.codeActionsOnSave': codeActionsOnSaveSchema
        }
    });
    let CodeActionsContribution = class CodeActionsContribution extends lifecycle_1.Disposable {
        constructor(codeActionsExtensionPoint, keybindingService) {
            super();
            this._contributedCodeActions = [];
            this._onDidChangeContributions = this._register(new event_1.Emitter());
            codeActionsExtensionPoint.setHandler(extensionPoints => {
                this._contributedCodeActions = extensionPoints.flatMap(x => x.value).filter(x => Array.isArray(x.actions));
                this.updateConfigurationSchema(this._contributedCodeActions);
                this._onDidChangeContributions.fire();
            });
            keybindingService.registerSchemaContribution({
                getSchemaAdditions: () => this.getSchemaAdditions(),
                onDidChange: this._onDidChangeContributions.event,
            });
        }
        updateConfigurationSchema(codeActionContributions) {
            const newProperties = { ...codeActionsOnSaveDefaultProperties };
            for (const [sourceAction, props] of this.getSourceActions(codeActionContributions)) {
                newProperties[sourceAction] = createCodeActionsAutoSave(nls.localize('codeActionsOnSave.generic', "Controls whether '{0}' actions should be run on file save.", props.title));
            }
            codeActionsOnSaveSchema.properties = newProperties;
            platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
                .notifyConfigurationSchemaUpdated(exports.editorConfiguration);
        }
        getSourceActions(contributions) {
            const defaultKinds = Object.keys(codeActionsOnSaveDefaultProperties).map(value => new types_1.CodeActionKind(value));
            const sourceActions = new Map();
            for (const contribution of contributions) {
                for (const action of contribution.actions) {
                    const kind = new types_1.CodeActionKind(action.kind);
                    if (types_1.CodeActionKind.Source.contains(kind)
                        // Exclude any we already included by default
                        && !defaultKinds.some(defaultKind => defaultKind.contains(kind))) {
                        sourceActions.set(kind.value, action);
                    }
                }
            }
            return sourceActions;
        }
        getSchemaAdditions() {
            const conditionalSchema = (command, actions) => {
                return {
                    if: {
                        required: ['command'],
                        properties: {
                            'command': { const: command }
                        }
                    },
                    then: {
                        properties: {
                            'args': {
                                required: ['kind'],
                                properties: {
                                    'kind': {
                                        anyOf: [
                                            {
                                                enum: actions.map(action => action.kind),
                                                enumDescriptions: actions.map(action => action.description ?? action.title),
                                            },
                                            { type: 'string' },
                                        ]
                                    }
                                }
                            }
                        }
                    }
                };
            };
            const getActions = (ofKind) => {
                const allActions = this._contributedCodeActions.flatMap(desc => desc.actions);
                const out = new Map();
                for (const action of allActions) {
                    if (!out.has(action.kind) && ofKind.contains(new types_1.CodeActionKind(action.kind))) {
                        out.set(action.kind, action);
                    }
                }
                return Array.from(out.values());
            };
            return [
                conditionalSchema(codeAction_1.codeActionCommandId, getActions(types_1.CodeActionKind.Empty)),
                conditionalSchema(codeAction_1.refactorCommandId, getActions(types_1.CodeActionKind.Refactor)),
                conditionalSchema(codeAction_1.sourceActionCommandId, getActions(types_1.CodeActionKind.Source)),
            ];
        }
    };
    exports.CodeActionsContribution = CodeActionsContribution;
    exports.CodeActionsContribution = CodeActionsContribution = __decorate([
        __param(1, keybinding_1.IKeybindingService)
    ], CodeActionsContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbnNDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVBY3Rpb25zL2Jyb3dzZXIvY29kZUFjdGlvbnNDb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0JoRyxNQUFNLHlCQUF5QixHQUFHLENBQUMsV0FBbUIsRUFBZSxFQUFFO1FBQ3RFLE9BQU87WUFDTixJQUFJLEVBQUUsUUFBUTtZQUNkLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7WUFDbEQsZ0JBQWdCLEVBQUU7Z0JBQ2pCLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLDhGQUE4RixDQUFDO2dCQUMxSCxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxrREFBa0QsQ0FBQztnQkFDaEYsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUscUNBQXFDLENBQUM7Z0JBQ2hFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUseUdBQXlHLENBQUM7Z0JBQzlJLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUseUZBQXlGLENBQUM7YUFDM0g7WUFDRCxPQUFPLEVBQUUsVUFBVTtZQUNuQixXQUFXLEVBQUUsV0FBVztTQUN4QixDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsTUFBTSxrQ0FBa0MsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFpQjtRQUN4RSxlQUFlLEVBQUUseUJBQXlCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSw4REFBOEQsQ0FBQyxDQUFDO0tBQ3BKLENBQUMsQ0FBQztJQUVILE1BQU0sdUJBQXVCLEdBQWlDO1FBQzdELEtBQUssRUFBRTtZ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
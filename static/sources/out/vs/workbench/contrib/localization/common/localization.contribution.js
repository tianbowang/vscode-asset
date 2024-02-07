/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/contrib/localization/common/localizationsActions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, lifecycle_1, nls_1, actions_1, localizationsActions_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseLocalizationWorkbenchContribution = void 0;
    class BaseLocalizationWorkbenchContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            // Register action to configure locale and related settings
            (0, actions_1.registerAction2)(localizationsActions_1.ConfigureDisplayLanguageAction);
            (0, actions_1.registerAction2)(localizationsActions_1.ClearDisplayLanguageAction);
            extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
                extensionPoint: 'localizations',
                defaultExtensionKind: ['ui', 'workspace'],
                jsonSchema: {
                    description: (0, nls_1.localize)('vscode.extension.contributes.localizations', "Contributes localizations to the editor"),
                    type: 'array',
                    default: [],
                    items: {
                        type: 'object',
                        required: ['languageId', 'translations'],
                        defaultSnippets: [{ body: { languageId: '', languageName: '', localizedLanguageName: '', translations: [{ id: 'vscode', path: '' }] } }],
                        properties: {
                            languageId: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.localizations.languageId', 'Id of the language into which the display strings are translated.'),
                                type: 'string'
                            },
                            languageName: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.localizations.languageName', 'Name of the language in English.'),
                                type: 'string'
                            },
                            localizedLanguageName: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.localizations.languageNameLocalized', 'Name of the language in contributed language.'),
                                type: 'string'
                            },
                            translations: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.localizations.translations', 'List of translations associated to the language.'),
                                type: 'array',
                                default: [{ id: 'vscode', path: '' }],
                                items: {
                                    type: 'object',
                                    required: ['id', 'path'],
                                    properties: {
                                        id: {
                                            type: 'string',
                                            description: (0, nls_1.localize)('vscode.extension.contributes.localizations.translations.id', "Id of VS Code or Extension for which this translation is contributed to. Id of VS Code is always `vscode` and of extension should be in format `publisherId.extensionName`."),
                                            pattern: '^((vscode)|([a-z0-9A-Z][a-z0-9A-Z-]*)\\.([a-z0-9A-Z][a-z0-9A-Z-]*))$',
                                            patternErrorMessage: (0, nls_1.localize)('vscode.extension.contributes.localizations.translations.id.pattern', "Id should be `vscode` or in format `publisherId.extensionName` for translating VS code or an extension respectively.")
                                        },
                                        path: {
                                            type: 'string',
                                            description: (0, nls_1.localize)('vscode.extension.contributes.localizations.translations.path', "A relative path to a file containing translations for the language.")
                                        }
                                    },
                                    defaultSnippets: [{ body: { id: '', path: '' } }],
                                },
                            }
                        }
                    }
                }
            });
        }
    }
    exports.BaseLocalizationWorkbenchContribution = BaseLocalizationWorkbenchContribution;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbG9jYWxpemF0aW9uL2NvbW1vbi9sb2NhbGl6YXRpb24uY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLHFDQUFzQyxTQUFRLHNCQUFVO1FBQ3BFO1lBQ0MsS0FBSyxFQUFFLENBQUM7WUFFUiwyREFBMkQ7WUFDM0QsSUFBQSx5QkFBZSxFQUFDLHFEQUE4QixDQUFDLENBQUM7WUFDaEQsSUFBQSx5QkFBZSxFQUFDLGlEQUEwQixDQUFDLENBQUM7WUFFNUMsdUNBQWtCLENBQUMsc0JBQXNCLENBQUM7Z0JBQ3pDLGNBQWMsRUFBRSxlQUFlO2dCQUMvQixvQkFBb0IsRUFBRSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUM7Z0JBQ3pDLFVBQVUsRUFBRTtvQkFDWCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsNENBQTRDLEVBQUUseUNBQXlDLENBQUM7b0JBQzlHLElBQUksRUFBRSxPQUFPO29CQUNiLE9BQU8sRUFBRSxFQUFFO29CQUNYLEtBQUssRUFBRTt3QkFDTixJQUFJLEVBQUUsUUFBUTt3QkFDZCxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDO3dCQUN4QyxlQUFlLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDeEksVUFBVSxFQUFFOzRCQUNYLFVBQVUsRUFBRTtnQ0FDWCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsdURBQXVELEVBQUUsbUVBQW1FLENBQUM7Z0NBQ25KLElBQUksRUFBRSxRQUFROzZCQUNkOzRCQUNELFlBQVksRUFBRTtnQ0FDYixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMseURBQXlELEVBQUUsa0NBQWtDLENBQUM7Z0NBQ3BILElBQUksRUFBRSxRQUFROzZCQUNkOzRCQUNELHFCQUFxQixFQUFFO2dDQUN0QixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0VBQWtFLEVBQUUsK0NBQStDLENBQUM7Z0NBQzFJLElBQUksRUFBRSxRQUFROzZCQUNkOzRCQUNELFlBQVksRUFBRTtnQ0FDYixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMseURBQXlELEVBQUUsa0RBQWtELENBQUM7Z0NBQ3BJLElBQUksRUFBRSxPQUFPO2dDQUNiLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0NBQ3JDLEtBQUssRUFBRTtvQ0FDTixJQUFJLEVBQUUsUUFBUTtvQ0FDZCxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO29DQUN4QixVQUFVLEVBQUU7d0NBQ1gsRUFBRSxFQUFFOzRDQUNILElBQUksRUFBRSxRQUFROzRDQUNkLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyw0REFBNEQsRUFBRSw2S0FBNkssQ0FBQzs0Q0FDbFEsT0FBTyxFQUFFLHNFQUFzRTs0Q0FDL0UsbUJBQW1CLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0VBQW9FLEVBQUUsc0hBQXNILENBQUM7eUNBQzNOO3dDQUNELElBQUksRUFBRTs0Q0FDTCxJQUFJLEVBQUUsUUFBUTs0Q0FDZCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsOERBQThELEVBQUUscUVBQXFFLENBQUM7eUNBQzVKO3FDQUNEO29DQUNELGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztpQ0FDakQ7NkJBQ0Q7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUEzREQsc0ZBMkRDIn0=
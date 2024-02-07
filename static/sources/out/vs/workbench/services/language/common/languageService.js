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
define(["require", "exports", "vs/nls", "vs/editor/common/services/languagesAssociations", "vs/base/common/resources", "vs/editor/common/languages/language", "vs/editor/common/services/languageService", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log"], function (require, exports, nls_1, languagesAssociations_1, resources_1, language_1, languageService_1, configuration_1, environment_1, files_1, extensions_1, extensionsRegistry_1, extensions_2, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchLanguageService = exports.languagesExtPoint = void 0;
    exports.languagesExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'languages',
        jsonSchema: {
            description: (0, nls_1.localize)('vscode.extension.contributes.languages', 'Contributes language declarations.'),
            type: 'array',
            items: {
                type: 'object',
                defaultSnippets: [{ body: { id: '${1:languageId}', aliases: ['${2:label}'], extensions: ['${3:extension}'], configuration: './language-configuration.json' } }],
                properties: {
                    id: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.id', 'ID of the language.'),
                        type: 'string'
                    },
                    aliases: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.aliases', 'Name aliases for the language.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    extensions: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.extensions', 'File extensions associated to the language.'),
                        default: ['.foo'],
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    filenames: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.filenames', 'File names associated to the language.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    filenamePatterns: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.filenamePatterns', 'File name glob patterns associated to the language.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    mimetypes: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.mimetypes', 'Mime types associated to the language.'),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    },
                    firstLine: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.firstLine', 'A regular expression matching the first line of a file of the language.'),
                        type: 'string'
                    },
                    configuration: {
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.configuration', 'A relative path to a file containing configuration options for the language.'),
                        type: 'string',
                        default: './language-configuration.json'
                    },
                    icon: {
                        type: 'object',
                        description: (0, nls_1.localize)('vscode.extension.contributes.languages.icon', 'A icon to use as file icon, if no icon theme provides one for the language.'),
                        properties: {
                            light: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.languages.icon.light', 'Icon path when a light theme is used'),
                                type: 'string'
                            },
                            dark: {
                                description: (0, nls_1.localize)('vscode.extension.contributes.languages.icon.dark', 'Icon path when a dark theme is used'),
                                type: 'string'
                            }
                        }
                    }
                }
            }
        },
        activationEventsGenerator: (languageContributions, result) => {
            for (const languageContribution of languageContributions) {
                if (languageContribution.id && languageContribution.configuration) {
                    result.push(`onLanguage:${languageContribution.id}`);
                }
            }
        }
    });
    let WorkbenchLanguageService = class WorkbenchLanguageService extends languageService_1.LanguageService {
        constructor(extensionService, configurationService, environmentService, logService) {
            super(environmentService.verbose || environmentService.isExtensionDevelopment || !environmentService.isBuilt);
            this.logService = logService;
            this._configurationService = configurationService;
            this._extensionService = extensionService;
            exports.languagesExtPoint.setHandler((extensions) => {
                const allValidLanguages = [];
                for (let i = 0, len = extensions.length; i < len; i++) {
                    const extension = extensions[i];
                    if (!Array.isArray(extension.value)) {
                        extension.collector.error((0, nls_1.localize)('invalid', "Invalid `contributes.{0}`. Expected an array.", exports.languagesExtPoint.name));
                        continue;
                    }
                    for (let j = 0, lenJ = extension.value.length; j < lenJ; j++) {
                        const ext = extension.value[j];
                        if (isValidLanguageExtensionPoint(ext, extension.description, extension.collector)) {
                            let configuration = undefined;
                            if (ext.configuration) {
                                configuration = (0, resources_1.joinPath)(extension.description.extensionLocation, ext.configuration);
                            }
                            allValidLanguages.push({
                                id: ext.id,
                                extensions: ext.extensions,
                                filenames: ext.filenames,
                                filenamePatterns: ext.filenamePatterns,
                                firstLine: ext.firstLine,
                                aliases: ext.aliases,
                                mimetypes: ext.mimetypes,
                                configuration: configuration,
                                icon: ext.icon && {
                                    light: (0, resources_1.joinPath)(extension.description.extensionLocation, ext.icon.light),
                                    dark: (0, resources_1.joinPath)(extension.description.extensionLocation, ext.icon.dark)
                                }
                            });
                        }
                    }
                }
                this._registry.setDynamicLanguages(allValidLanguages);
            });
            this.updateMime();
            this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(files_1.FILES_ASSOCIATIONS_CONFIG)) {
                    this.updateMime();
                }
            });
            this._extensionService.whenInstalledExtensionsRegistered().then(() => {
                this.updateMime();
            });
            this._register(this.onDidRequestRichLanguageFeatures((languageId) => {
                // extension activation
                this._extensionService.activateByEvent(`onLanguage:${languageId}`);
                this._extensionService.activateByEvent(`onLanguage`);
            }));
        }
        updateMime() {
            const configuration = this._configurationService.getValue();
            // Clear user configured mime associations
            (0, languagesAssociations_1.clearConfiguredLanguageAssociations)();
            // Register based on settings
            if (configuration.files?.associations) {
                Object.keys(configuration.files.associations).forEach(pattern => {
                    const langId = configuration.files.associations[pattern];
                    if (typeof langId !== 'string') {
                        this.logService.warn(`Ignoring configured 'files.associations' for '${pattern}' because its type is not a string but '${typeof langId}'`);
                        return; // https://github.com/microsoft/vscode/issues/147284
                    }
                    const mimeType = this.getMimeType(langId) || `text/x-${langId}`;
                    (0, languagesAssociations_1.registerConfiguredLanguageAssociation)({ id: langId, mime: mimeType, filepattern: pattern });
                });
            }
            this._onDidChange.fire();
        }
    };
    exports.WorkbenchLanguageService = WorkbenchLanguageService;
    exports.WorkbenchLanguageService = WorkbenchLanguageService = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, log_1.ILogService)
    ], WorkbenchLanguageService);
    function isUndefinedOrStringArray(value) {
        if (typeof value === 'undefined') {
            return true;
        }
        if (!Array.isArray(value)) {
            return false;
        }
        return value.every(item => typeof item === 'string');
    }
    function isValidLanguageExtensionPoint(value, extension, collector) {
        if (!value) {
            collector.error((0, nls_1.localize)('invalid.empty', "Empty value for `contributes.{0}`", exports.languagesExtPoint.name));
            return false;
        }
        if (typeof value.id !== 'string') {
            collector.error((0, nls_1.localize)('require.id', "property `{0}` is mandatory and must be of type `string`", 'id'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.extensions)) {
            collector.error((0, nls_1.localize)('opt.extensions', "property `{0}` can be omitted and must be of type `string[]`", 'extensions'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.filenames)) {
            collector.error((0, nls_1.localize)('opt.filenames', "property `{0}` can be omitted and must be of type `string[]`", 'filenames'));
            return false;
        }
        if (typeof value.firstLine !== 'undefined' && typeof value.firstLine !== 'string') {
            collector.error((0, nls_1.localize)('opt.firstLine', "property `{0}` can be omitted and must be of type `string`", 'firstLine'));
            return false;
        }
        if (typeof value.configuration !== 'undefined' && typeof value.configuration !== 'string') {
            collector.error((0, nls_1.localize)('opt.configuration', "property `{0}` can be omitted and must be of type `string`", 'configuration'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.aliases)) {
            collector.error((0, nls_1.localize)('opt.aliases', "property `{0}` can be omitted and must be of type `string[]`", 'aliases'));
            return false;
        }
        if (!isUndefinedOrStringArray(value.mimetypes)) {
            collector.error((0, nls_1.localize)('opt.mimetypes', "property `{0}` can be omitted and must be of type `string[]`", 'mimetypes'));
            return false;
        }
        if (typeof value.icon !== 'undefined') {
            if (typeof value.icon !== 'object' || typeof value.icon.light !== 'string' || typeof value.icon.dark !== 'string') {
                collector.error((0, nls_1.localize)('opt.icon', "property `{0}` can be omitted and must be of type `object` with properties `{1}` and `{2}` of type `string`", 'icon', 'light', 'dark'));
                return false;
            }
        }
        return true;
    }
    (0, extensions_2.registerSingleton)(language_1.ILanguageService, WorkbenchLanguageService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvbGFuZ3VhZ2UvY29tbW9uL2xhbmd1YWdlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2Qm5GLFFBQUEsaUJBQWlCLEdBQWtELHVDQUFrQixDQUFDLHNCQUFzQixDQUErQjtRQUN2SixjQUFjLEVBQUUsV0FBVztRQUMzQixVQUFVLEVBQUU7WUFDWCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0NBQXdDLEVBQUUsb0NBQW9DLENBQUM7WUFDckcsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsZUFBZSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxhQUFhLEVBQUUsK0JBQStCLEVBQUUsRUFBRSxDQUFDO2dCQUMvSixVQUFVLEVBQUU7b0JBQ1gsRUFBRSxFQUFFO3dCQUNILFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQywyQ0FBMkMsRUFBRSxxQkFBcUIsQ0FBQzt3QkFDekYsSUFBSSxFQUFFLFFBQVE7cUJBQ2Q7b0JBQ0QsT0FBTyxFQUFFO3dCQUNSLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxnREFBZ0QsRUFBRSxnQ0FBZ0MsQ0FBQzt3QkFDekcsSUFBSSxFQUFFLE9BQU87d0JBQ2IsS0FBSyxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFRO3lCQUNkO3FCQUNEO29CQUNELFVBQVUsRUFBRTt3QkFDWCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsbURBQW1ELEVBQUUsNkNBQTZDLENB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
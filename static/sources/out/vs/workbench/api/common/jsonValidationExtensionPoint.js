/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/resources", "vs/base/common/types"], function (require, exports, nls, extensionsRegistry_1, resources, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JSONValidationExtensionPoint = void 0;
    const configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'jsonValidation',
        defaultExtensionKind: ['workspace', 'web'],
        jsonSchema: {
            description: nls.localize('contributes.jsonValidation', 'Contributes json schema configuration.'),
            type: 'array',
            defaultSnippets: [{ body: [{ fileMatch: '${1:file.json}', url: '${2:url}' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { fileMatch: '${1:file.json}', url: '${2:url}' } }],
                properties: {
                    fileMatch: {
                        type: ['string', 'array'],
                        description: nls.localize('contributes.jsonValidation.fileMatch', 'The file pattern (or an array of patterns) to match, for example "package.json" or "*.launch". Exclusion patterns start with \'!\''),
                        items: {
                            type: ['string']
                        }
                    },
                    url: {
                        description: nls.localize('contributes.jsonValidation.url', 'A schema URL (\'http:\', \'https:\') or relative path to the extension folder (\'./\').'),
                        type: 'string'
                    }
                }
            }
        }
    });
    class JSONValidationExtensionPoint {
        constructor() {
            configurationExtPoint.setHandler((extensions) => {
                for (const extension of extensions) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    const extensionLocation = extension.description.extensionLocation;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize('invalid.jsonValidation', "'configuration.jsonValidation' must be a array"));
                        return;
                    }
                    extensionValue.forEach(extension => {
                        if (!(0, types_1.isString)(extension.fileMatch) && !(Array.isArray(extension.fileMatch) && extension.fileMatch.every(types_1.isString))) {
                            collector.error(nls.localize('invalid.fileMatch', "'configuration.jsonValidation.fileMatch' must be defined as a string or an array of strings."));
                            return;
                        }
                        const uri = extension.url;
                        if (!(0, types_1.isString)(uri)) {
                            collector.error(nls.localize('invalid.url', "'configuration.jsonValidation.url' must be a URL or relative path"));
                            return;
                        }
                        if (uri.startsWith('./')) {
                            try {
                                const colorThemeLocation = resources.joinPath(extensionLocation, uri);
                                if (!resources.isEqualOrParent(colorThemeLocation, extensionLocation)) {
                                    collector.warn(nls.localize('invalid.path.1', "Expected `contributes.{0}.url` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", configurationExtPoint.name, colorThemeLocation.toString(), extensionLocation.path));
                                }
                            }
                            catch (e) {
                                collector.error(nls.localize('invalid.url.fileschema', "'configuration.jsonValidation.url' is an invalid relative URL: {0}", e.message));
                            }
                        }
                        else if (!/^[^:/?#]+:\/\//.test(uri)) {
                            collector.error(nls.localize('invalid.url.schema', "'configuration.jsonValidation.url' must be an absolute URL or start with './'  to reference schemas located in the extension."));
                            return;
                        }
                    });
                }
            });
        }
    }
    exports.JSONValidationExtensionPoint = JSONValidationExtensionPoint;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvblZhbGlkYXRpb25FeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vanNvblZhbGlkYXRpb25FeHRlbnNpb25Qb2ludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBTSxxQkFBcUIsR0FBRyx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBa0M7UUFDeEcsY0FBYyxFQUFFLGdCQUFnQjtRQUNoQyxvQkFBb0IsRUFBRSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUM7UUFDMUMsVUFBVSxFQUFFO1lBQ1gsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUUsd0NBQXdDLENBQUM7WUFDakcsSUFBSSxFQUFFLE9BQU87WUFDYixlQUFlLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDL0UsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLGVBQWUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDO2dCQUM3RSxVQUFVLEVBQUU7b0JBQ1gsU0FBUyxFQUFFO3dCQUNWLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUM7d0JBQ3pCLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLG9JQUFvSSxDQUFDO3dCQUN2TSxLQUFLLEVBQUU7NEJBQ04sSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDO3lCQUNoQjtxQkFDRDtvQkFDRCxHQUFHLEVBQUU7d0JBQ0osV0FBVyxFQUFFLEdBQUcsQ0FB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
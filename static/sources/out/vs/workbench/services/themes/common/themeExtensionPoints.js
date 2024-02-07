/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/base/common/resources", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/event"], function (require, exports, nls, types, resources, extensionsRegistry_1, workbenchThemeService_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ThemeRegistry = exports.registerProductIconThemeExtensionPoint = exports.registerFileIconThemeExtensionPoint = exports.registerColorThemeExtensionPoint = void 0;
    function registerColorThemeExtensionPoint() {
        return extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'themes',
            jsonSchema: {
                description: nls.localize('vscode.extension.contributes.themes', 'Contributes textmate color themes.'),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { label: '${1:label}', id: '${2:id}', uiTheme: workbenchThemeService_1.VS_DARK_THEME, path: './themes/${3:id}.tmTheme.' } }],
                    properties: {
                        id: {
                            description: nls.localize('vscode.extension.contributes.themes.id', 'Id of the color theme as used in the user settings.'),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize('vscode.extension.contributes.themes.label', 'Label of the color theme as shown in the UI.'),
                            type: 'string'
                        },
                        uiTheme: {
                            description: nls.localize('vscode.extension.contributes.themes.uiTheme', 'Base theme defining the colors around the editor: \'vs\' is the light color theme, \'vs-dark\' is the dark color theme. \'hc-black\' is the dark high contrast theme, \'hc-light\' is the light high contrast theme.'),
                            enum: [workbenchThemeService_1.VS_LIGHT_THEME, workbenchThemeService_1.VS_DARK_THEME, workbenchThemeService_1.VS_HC_THEME, workbenchThemeService_1.VS_HC_LIGHT_THEME]
                        },
                        path: {
                            description: nls.localize('vscode.extension.contributes.themes.path', 'Path of the tmTheme file. The path is relative to the extension folder and is typically \'./colorthemes/awesome-color-theme.json\'.'),
                            type: 'string'
                        }
                    },
                    required: ['path', 'uiTheme']
                }
            }
        });
    }
    exports.registerColorThemeExtensionPoint = registerColorThemeExtensionPoint;
    function registerFileIconThemeExtensionPoint() {
        return extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'iconThemes',
            jsonSchema: {
                description: nls.localize('vscode.extension.contributes.iconThemes', 'Contributes file icon themes.'),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { id: '${1:id}', label: '${2:label}', path: './fileicons/${3:id}-icon-theme.json' } }],
                    properties: {
                        id: {
                            description: nls.localize('vscode.extension.contributes.iconThemes.id', 'Id of the file icon theme as used in the user settings.'),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize('vscode.extension.contributes.iconThemes.label', 'Label of the file icon theme as shown in the UI.'),
                            type: 'string'
                        },
                        path: {
                            description: nls.localize('vscode.extension.contributes.iconThemes.path', 'Path of the file icon theme definition file. The path is relative to the extension folder and is typically \'./fileicons/awesome-icon-theme.json\'.'),
                            type: 'string'
                        }
                    },
                    required: ['path', 'id']
                }
            }
        });
    }
    exports.registerFileIconThemeExtensionPoint = registerFileIconThemeExtensionPoint;
    function registerProductIconThemeExtensionPoint() {
        return extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'productIconThemes',
            jsonSchema: {
                description: nls.localize('vscode.extension.contributes.productIconThemes', 'Contributes product icon themes.'),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { id: '${1:id}', label: '${2:label}', path: './producticons/${3:id}-product-icon-theme.json' } }],
                    properties: {
                        id: {
                            description: nls.localize('vscode.extension.contributes.productIconThemes.id', 'Id of the product icon theme as used in the user settings.'),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize('vscode.extension.contributes.productIconThemes.label', 'Label of the product icon theme as shown in the UI.'),
                            type: 'string'
                        },
                        path: {
                            description: nls.localize('vscode.extension.contributes.productIconThemes.path', 'Path of the product icon theme definition file. The path is relative to the extension folder and is typically \'./producticons/awesome-product-icon-theme.json\'.'),
                            type: 'string'
                        }
                    },
                    required: ['path', 'id']
                }
            }
        });
    }
    exports.registerProductIconThemeExtensionPoint = registerProductIconThemeExtensionPoint;
    class ThemeRegistry {
        constructor(themesExtPoint, create, idRequired = false, builtInTheme = undefined) {
            this.themesExtPoint = themesExtPoint;
            this.create = create;
            this.idRequired = idRequired;
            this.builtInTheme = builtInTheme;
            this.onDidChangeEmitter = new event_1.Emitter();
            this.onDidChange = this.onDidChangeEmitter.event;
            this.extensionThemes = [];
            this.initialize();
        }
        initialize() {
            this.themesExtPoint.setHandler((extensions, delta) => {
                const previousIds = {};
                const added = [];
                for (const theme of this.extensionThemes) {
                    previousIds[theme.id] = theme;
                }
                this.extensionThemes.length = 0;
                for (const ext of extensions) {
                    const extensionData = workbenchThemeService_1.ExtensionData.fromName(ext.description.publisher, ext.description.name, ext.description.isBuiltin);
                    this.onThemes(extensionData, ext.description.extensionLocation, ext.value, this.extensionThemes, ext.collector);
                }
                for (const theme of this.extensionThemes) {
                    if (!previousIds[theme.id]) {
                        added.push(theme);
                    }
                    else {
                        delete previousIds[theme.id];
                    }
                }
                const removed = Object.values(previousIds);
                this.onDidChangeEmitter.fire({ themes: this.extensionThemes, added, removed });
            });
        }
        onThemes(extensionData, extensionLocation, themeContributions, resultingThemes = [], log) {
            if (!Array.isArray(themeContributions)) {
                log?.error(nls.localize('reqarray', "Extension point `{0}` must be an array.", this.themesExtPoint.name));
                return resultingThemes;
            }
            themeContributions.forEach(theme => {
                if (!theme.path || !types.isString(theme.path)) {
                    log?.error(nls.localize('reqpath', "Expected string in `contributes.{0}.path`. Provided value: {1}", this.themesExtPoint.name, String(theme.path)));
                    return;
                }
                if (this.idRequired && (!theme.id || !types.isString(theme.id))) {
                    log?.error(nls.localize('reqid', "Expected string in `contributes.{0}.id`. Provided value: {1}", this.themesExtPoint.name, String(theme.id)));
                    return;
                }
                const themeLocation = resources.joinPath(extensionLocation, theme.path);
                if (!resources.isEqualOrParent(themeLocation, extensionLocation)) {
                    log?.warn(nls.localize('invalid.path.1', "Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.", this.themesExtPoint.name, themeLocation.path, extensionLocation.path));
                }
                const themeData = this.create(theme, themeLocation, extensionData);
                resultingThemes.push(themeData);
            });
            return resultingThemes;
        }
        findThemeById(themeId) {
            if (this.builtInTheme && this.builtInTheme.id === themeId) {
                return this.builtInTheme;
            }
            const allThemes = this.getThemes();
            for (const t of allThemes) {
                if (t.id === themeId) {
                    return t;
                }
            }
            return undefined;
        }
        findThemeBySettingsId(settingsId, defaultSettingsId) {
            if (this.builtInTheme && this.builtInTheme.settingsId === settingsId) {
                return this.builtInTheme;
            }
            const allThemes = this.getThemes();
            let defaultTheme = undefined;
            for (const t of allThemes) {
                if (t.settingsId === settingsId) {
                    return t;
                }
                if (t.settingsId === defaultSettingsId) {
                    defaultTheme = t;
                }
            }
            return defaultTheme;
        }
        findThemeByExtensionLocation(extLocation) {
            if (extLocation) {
                return this.getThemes().filter(t => t.location && resources.isEqualOrParent(t.location, extLocation));
            }
            return [];
        }
        getThemes() {
            return this.extensionThemes;
        }
        getMarketplaceThemes(manifest, extensionLocation, extensionData) {
            const themes = manifest?.contributes?.[this.themesExtPoint.name];
            if (Array.isArray(themes)) {
                return this.onThemes(extensionData, extensionLocation, themes);
            }
            return [];
        }
    }
    exports.ThemeRegistry = ThemeRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVFeHRlbnNpb25Qb2ludHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90aGVtZXMvY29tbW9uL3RoZW1lRXh0ZW5zaW9uUG9pbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxTQUFnQixnQ0FBZ0M7UUFDL0MsT0FBTyx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBeUI7WUFDeEUsY0FBYyxFQUFFLFFBQVE7WUFDeEIsVUFBVSxFQUFFO2dCQUNYLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxFQUFFLG9DQUFvQyxDQUFDO2dCQUN0RyxJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUU7b0JBQ04sSUFBSSxFQUFFLFFBQVE7b0JBQ2QsZUFBZSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLHFDQUFhLEVBQUUsSUFBSSxFQUFFLDJCQUEyQixFQUFFLEVBQUUsQ0FBQztvQkFDOUgsVUFBVSxFQUFFO3dCQUNYLEVBQUUsRUFBRTs0QkFDSCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSxxREFBcUQsQ0FBQzs0QkFDMUgsSUFBSSxFQUFFLFFBQVE7eUJBQ2Q7d0JBQ0QsS0FBSyxFQUFFOzRCQUNOLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDJDQUEyQyxFQUFFLDhDQUE4QyxDQUFDOzRCQUN0SCxJQUFJLEVBQUUsUUFBUTt5QkFDZDt3QkFDRCxPQUFPLEVBQUU7NEJBQ1IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkNBQTZDLEVBQUUsc05BQXNOLENBQUM7NEJBQ2hTLElBQUksRUFBRSxDQUFDLHNDQUFjLEVBQUUscUNB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
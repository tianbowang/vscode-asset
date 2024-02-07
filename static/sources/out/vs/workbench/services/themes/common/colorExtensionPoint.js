/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/platform/registry/common/platform"], function (require, exports, nls, extensionsRegistry_1, colorRegistry_1, color_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorExtensionPoint = void 0;
    const colorRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
    const colorReferenceSchema = colorRegistry.getColorReferenceSchema();
    const colorIdPattern = '^\\w+[.\\w+]*$';
    const configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'colors',
        jsonSchema: {
            description: nls.localize('contributes.color', 'Contributes extension defined themable colors'),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize('contributes.color.id', 'The identifier of the themable color'),
                        pattern: colorIdPattern,
                        patternErrorMessage: nls.localize('contributes.color.id.format', 'Identifiers must only contain letters, digits and dots and can not start with a dot'),
                    },
                    description: {
                        type: 'string',
                        description: nls.localize('contributes.color.description', 'The description of the themable color'),
                    },
                    defaults: {
                        type: 'object',
                        properties: {
                            light: {
                                description: nls.localize('contributes.defaults.light', 'The default color for light themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default.'),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            dark: {
                                description: nls.localize('contributes.defaults.dark', 'The default color for dark themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default.'),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            highContrast: {
                                description: nls.localize('contributes.defaults.highContrast', 'The default color for high contrast dark themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default. If not provided, the `dark` color is used as default for high contrast dark themes.'),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            highContrastLight: {
                                description: nls.localize('contributes.defaults.highContrastLight', 'The default color for high contrast light themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default. If not provided, the `light` color is used as default for high contrast light themes.'),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            }
                        },
                        required: ['light', 'dark']
                    }
                }
            }
        }
    });
    class ColorExtensionPoint {
        constructor() {
            configurationExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize('invalid.colorConfiguration', "'configuration.colors' must be a array"));
                        return;
                    }
                    const parseColorValue = (s, name) => {
                        if (s.length > 0) {
                            if (s[0] === '#') {
                                return color_1.Color.Format.CSS.parseHex(s);
                            }
                            else {
                                return s;
                            }
                        }
                        collector.error(nls.localize('invalid.default.colorType', "{0} must be either a color value in hex (#RRGGBB[AA] or #RGB[A]) or the identifier of a themable color which provides the default.", name));
                        return color_1.Color.red;
                    };
                    for (const colorContribution of extensionValue) {
                        if (typeof colorContribution.id !== 'string' || colorContribution.id.length === 0) {
                            collector.error(nls.localize('invalid.id', "'configuration.colors.id' must be defined and can not be empty"));
                            return;
                        }
                        if (!colorContribution.id.match(colorIdPattern)) {
                            collector.error(nls.localize('invalid.id.format', "'configuration.colors.id' must only contain letters, digits and dots and can not start with a dot"));
                            return;
                        }
                        if (typeof colorContribution.description !== 'string' || colorContribution.id.length === 0) {
                            collector.error(nls.localize('invalid.description', "'configuration.colors.description' must be defined and can not be empty"));
                            return;
                        }
                        const defaults = colorContribution.defaults;
                        if (!defaults || typeof defaults !== 'object' || typeof defaults.light !== 'string' || typeof defaults.dark !== 'string') {
                            collector.error(nls.localize('invalid.defaults', "'configuration.colors.defaults' must be defined and must contain 'light' and 'dark'"));
                            return;
                        }
                        if (defaults.highContrast && typeof defaults.highContrast !== 'string') {
                            collector.error(nls.localize('invalid.defaults.highContrast', "If defined, 'configuration.colors.defaults.highContrast' must be a string."));
                            return;
                        }
                        if (defaults.highContrastLight && typeof defaults.highContrastLight !== 'string') {
                            collector.error(nls.localize('invalid.defaults.highContrastLight', "If defined, 'configuration.colors.defaults.highContrastLight' must be a string."));
                            return;
                        }
                        colorRegistry.registerColor(colorContribution.id, {
                            light: parseColorValue(defaults.light, 'configuration.colors.defaults.light'),
                            dark: parseColorValue(defaults.dark, 'configuration.colors.defaults.dark'),
                            hcDark: parseColorValue(defaults.highContrast ?? defaults.dark, 'configuration.colors.defaults.highContrast'),
                            hcLight: parseColorValue(defaults.highContrastLight ?? defaults.light, 'configuration.colors.defaults.highContrastLight'),
                        }, colorContribution.description);
                    }
                }
                for (const extension of delta.removed) {
                    const extensionValue = extension.value;
                    for (const colorContribution of extensionValue) {
                        colorRegistry.deregisterColor(colorContribution.id);
                    }
                }
            });
        }
    }
    exports.ColorExtensionPoint = ColorExtensionPoint;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JFeHRlbnNpb25Qb2ludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RoZW1lcy9jb21tb24vY29sb3JFeHRlbnNpb25Qb2ludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBTSxhQUFhLEdBQW1CLG1CQUFRLENBQUMsRUFBRSxDQUFpQiwwQkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRTdHLE1BQU0sb0JBQW9CLEdBQUcsYUFBYSxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFDckUsTUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7SUFFeEMsTUFBTSxxQkFBcUIsR0FBRyx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBeUI7UUFDL0YsY0FBYyxFQUFFLFFBQVE7UUFDeEIsVUFBVSxFQUFFO1lBQ1gsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsK0NBQStDLENBQUM7WUFDL0YsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsVUFBVSxFQUFFO29CQUNYLEVBQUUsRUFBRTt3QkFDSCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxzQ0FBc0MsQ0FBQzt3QkFDekYsT0FBTyxFQUFFLGNBQWM7d0JBQ3ZCLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNkJBQTZCLEVBQUUscUZBQXFGLENBQUM7cUJBQ3ZKO29CQUNELFdBQVcsRUFBRTt3QkFDWixJQUFJLEVBQUUsUUFBUTt3QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSx1Q0FBdUMsQ0FBQztxQkFDbkc7b0JBQ0QsUUFBUSxFQUFFO3dC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
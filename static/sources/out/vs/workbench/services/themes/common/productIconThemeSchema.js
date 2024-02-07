define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls, platform_1, jsonContributionRegistry_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerProductIconThemeSchemas = exports.fontFormatRegex = exports.fontSizeRegex = exports.fontWeightRegex = exports.fontStyleRegex = exports.fontIdRegex = void 0;
    exports.fontIdRegex = '^([\\w_-]+)$';
    exports.fontStyleRegex = '^(normal|italic|(oblique[ \\w\\s-]+))$';
    exports.fontWeightRegex = '^(normal|bold|lighter|bolder|(\\d{0-1000}))$';
    exports.fontSizeRegex = '^([\\w .%_-]+)$';
    exports.fontFormatRegex = '^woff|woff2|truetype|opentype|embedded-opentype|svg$';
    const schemaId = 'vscode://schemas/product-icon-theme';
    const schema = {
        type: 'object',
        allowComments: true,
        allowTrailingCommas: true,
        properties: {
            fonts: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: nls.localize('schema.id', 'The ID of the font.'),
                            pattern: exports.fontIdRegex,
                            patternErrorMessage: nls.localize('schema.id.formatError', 'The ID must only contain letters, numbers, underscore and minus.')
                        },
                        src: {
                            type: 'array',
                            description: nls.localize('schema.src', 'The location of the font.'),
                            items: {
                                type: 'object',
                                properties: {
                                    path: {
                                        type: 'string',
                                        description: nls.localize('schema.font-path', 'The font path, relative to the current product icon theme file.'),
                                    },
                                    format: {
                                        type: 'string',
                                        description: nls.localize('schema.font-format', 'The format of the font.'),
                                        enum: ['woff', 'woff2', 'truetype', 'opentype', 'embedded-opentype', 'svg']
                                    }
                                },
                                required: [
                                    'path',
                                    'format'
                                ]
                            }
                        },
                        weight: {
                            type: 'string',
                            description: nls.localize('schema.font-weight', 'The weight of the font. See https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight for valid values.'),
                            anyOf: [
                                { enum: ['normal', 'bold', 'lighter', 'bolder'] },
                                { type: 'string', pattern: exports.fontWeightRegex }
                            ]
                        },
                        style: {
                            type: 'string',
                            description: nls.localize('schema.font-style', 'The style of the font. See https://developer.mozilla.org/en-US/docs/Web/CSS/font-style for valid values.'),
                            anyOf: [
                                { enum: ['normal', 'italic', 'oblique'] },
                                { type: 'string', pattern: exports.fontStyleRegex }
                            ]
                        }
                    },
                    required: [
                        'id',
                        'src'
                    ]
                }
            },
            iconDefinitions: {
                description: nls.localize('schema.iconDefinitions', 'Association of icon name to a font character.'),
                $ref: iconRegistry_1.iconsSchemaId
            }
        }
    };
    function registerProductIconThemeSchemas() {
        const schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        schemaRegistry.registerSchema(schemaId, schema);
    }
    exports.registerProductIconThemeSchemas = registerProductIconThemeSchemas;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdEljb25UaGVtZVNjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RoZW1lcy9jb21tb24vcHJvZHVjdEljb25UaGVtZVNjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBV2EsUUFBQSxXQUFXLEdBQUcsY0FBYyxDQUFDO0lBQzdCLFFBQUEsY0FBYyxHQUFHLHdDQUF3QyxDQUFDO0lBQzFELFFBQUEsZUFBZSxHQUFHLDhDQUE4QyxDQUFDO0lBQ2pFLFFBQUEsYUFBYSxHQUFHLGlCQUFpQixDQUFDO0lBQ2xDLFFBQUEsZUFBZSxHQUFHLHNEQUFzRCxDQUFDO0lBRXRGLE1BQU0sUUFBUSxHQUFHLHFDQUFxQyxDQUFDO0lBQ3ZELE1BQU0sTUFBTSxHQUFnQjtRQUMzQixJQUFJLEVBQUUsUUFBUTtRQUNkLGFBQWEsRUFBRSxJQUFJO1FBQ25CLG1CQUFtQixFQUFFLElBQUk7UUFDekIsVUFBVSxFQUFFO1lBQ1gsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRTtvQkFDTixJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1gsRUFBRSxFQUFFOzRCQUNILElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsQ0FBQzs0QkFDN0QsT0FBTyxFQUFFLG1CQUFXOzRCQUNwQixtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFLGtFQUFrRSxDQUFDO3lCQUM5SDt3QkFDRCxHQUFHLEVBQUU7NEJBQ0osSUFBSSxFQUFFLE9BQU87NEJBQ2IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLDJCQUEyQixDQUFDOzRCQUNwRSxLQUFLLEVBQUU7Z0NBQ04sSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsVUFBVSxFQUFFO29DQUNYLElBQUksRUFBRTt3Q0FDTCxJQUFJLEVBQUUsUUFBUTt3Q0FDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxpRUFBaUUsQ0FBQztxQ0FDaEg7b0NBQ0QsTUFBTSxFQUFFO3dDQUNQLElBQUksRUFBRSxRQUFRO3dDQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHlCQUF5QixDQUFDO3dDQUMxRSxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxDQUFDO3FDQUMzRTtpQ0FDRDtnQ0FDRCxRQUFRLEVBQUU7b0NBQ1QsTUFBTTtvQ0FDTixRQUFRO2lDQUNSOzZCQUNEO3lCQUNEO3dCQUNELE1BQU0sRUFBRTs0QkFDUCxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSw0R0FBNEcsQ0FBQzs0QkFDN0osS0FBSyxFQUFFO2dDQUNOLEVBQUUsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7Z0NBQ2pELEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsdUJBQWUsRUFBRTs2QkFDNUM7eUJBQ0Q7d0JBQ0QsS0FBSyxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLDBHQUEwRyxDQUFDOzRCQUMxSixLQUFLLEVBQUU7Z0NBQ04sRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dDQUN6QyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLHNCQUFjLEVBQUU7NkJBQzNDO3lCQUNEO3FCQUNEO29CQUNELFFBQVEsRUFBRTt3QkFDVCxJQUFJO3dCQUNKLEtBQUs7cUJBQ0w7aUJBQ0Q7YUFDRDtZQUNELGVBQWUsRUFBRTtnQkFDaEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsK0NBQStDLENBQUM7Z0JBQ3BHLElBQUksRUFBRSw0QkFBYTthQUNuQjtTQUNEO0tBQ0QsQ0FBQztJQUVGLFNBQWdCLCtCQUErQjtRQUM5QyxNQUFNLGNBQWMsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBNEIscUNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQy9GLGNBQWMsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFIRCwwRUFHQyJ9
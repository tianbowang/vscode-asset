define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/tokenClassificationRegistry"], function (require, exports, nls, platform_1, jsonContributionRegistry_1, colorRegistry_1, tokenClassificationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerColorThemeSchemas = exports.colorThemeSchemaId = exports.textmateColorGroupSchemaId = exports.textmateColorsSchemaId = void 0;
    const textMateScopes = [
        'comment',
        'comment.block',
        'comment.block.documentation',
        'comment.line',
        'constant',
        'constant.character',
        'constant.character.escape',
        'constant.numeric',
        'constant.numeric.integer',
        'constant.numeric.float',
        'constant.numeric.hex',
        'constant.numeric.octal',
        'constant.other',
        'constant.regexp',
        'constant.rgb-value',
        'emphasis',
        'entity',
        'entity.name',
        'entity.name.class',
        'entity.name.function',
        'entity.name.method',
        'entity.name.section',
        'entity.name.selector',
        'entity.name.tag',
        'entity.name.type',
        'entity.other',
        'entity.other.attribute-name',
        'entity.other.inherited-class',
        'invalid',
        'invalid.deprecated',
        'invalid.illegal',
        'keyword',
        'keyword.control',
        'keyword.operator',
        'keyword.operator.new',
        'keyword.operator.assignment',
        'keyword.operator.arithmetic',
        'keyword.operator.logical',
        'keyword.other',
        'markup',
        'markup.bold',
        'markup.changed',
        'markup.deleted',
        'markup.heading',
        'markup.inline.raw',
        'markup.inserted',
        'markup.italic',
        'markup.list',
        'markup.list.numbered',
        'markup.list.unnumbered',
        'markup.other',
        'markup.quote',
        'markup.raw',
        'markup.underline',
        'markup.underline.link',
        'meta',
        'meta.block',
        'meta.cast',
        'meta.class',
        'meta.function',
        'meta.function-call',
        'meta.preprocessor',
        'meta.return-type',
        'meta.selector',
        'meta.tag',
        'meta.type.annotation',
        'meta.type',
        'punctuation.definition.string.begin',
        'punctuation.definition.string.end',
        'punctuation.separator',
        'punctuation.separator.continuation',
        'punctuation.terminator',
        'storage',
        'storage.modifier',
        'storage.type',
        'string',
        'string.interpolated',
        'string.other',
        'string.quoted',
        'string.quoted.double',
        'string.quoted.other',
        'string.quoted.single',
        'string.quoted.triple',
        'string.regexp',
        'string.unquoted',
        'strong',
        'support',
        'support.class',
        'support.constant',
        'support.function',
        'support.other',
        'support.type',
        'support.type.property-name',
        'support.variable',
        'variable',
        'variable.language',
        'variable.name',
        'variable.other',
        'variable.other.readwrite',
        'variable.parameter'
    ];
    exports.textmateColorsSchemaId = 'vscode://schemas/textmate-colors';
    exports.textmateColorGroupSchemaId = `${exports.textmateColorsSchemaId}#/definitions/colorGroup`;
    const textmateColorSchema = {
        type: 'array',
        definitions: {
            colorGroup: {
                default: '#FF0000',
                anyOf: [
                    {
                        type: 'string',
                        format: 'color-hex'
                    },
                    {
                        $ref: '#/definitions/settings'
                    }
                ]
            },
            settings: {
                type: 'object',
                description: nls.localize('schema.token.settings', 'Colors and styles for the token.'),
                properties: {
                    foreground: {
                        type: 'string',
                        description: nls.localize('schema.token.foreground', 'Foreground color for the token.'),
                        format: 'color-hex',
                        default: '#ff0000'
                    },
                    background: {
                        type: 'string',
                        deprecationMessage: nls.localize('schema.token.background.warning', 'Token background colors are currently not supported.')
                    },
                    fontStyle: {
                        type: 'string',
                        description: nls.localize('schema.token.fontStyle', 'Font style of the rule: \'italic\', \'bold\', \'underline\', \'strikethrough\' or a combination. The empty string unsets inherited settings.'),
                        pattern: '^(\\s*\\b(italic|bold|underline|strikethrough))*\\s*$',
                        patternErrorMessage: nls.localize('schema.fontStyle.error', 'Font style must be \'italic\', \'bold\', \'underline\', \'strikethrough\' or a combination or the empty string.'),
                        defaultSnippets: [
                            { label: nls.localize('schema.token.fontStyle.none', 'None (clear inherited style)'), bodyText: '""' },
                            { body: 'italic' },
                            { body: 'bold' },
                            { body: 'underline' },
                            { body: 'strikethrough' },
                            { body: 'italic bold' },
                            { body: 'italic underline' },
                            { body: 'italic strikethrough' },
                            { body: 'bold underline' },
                            { body: 'bold strikethrough' },
                            { body: 'underline strikethrough' },
                            { body: 'italic bold underline' },
                            { body: 'italic bold strikethrough' },
                            { body: 'italic underline strikethrough' },
                            { body: 'bold underline strikethrough' },
                            { body: 'italic bold underline strikethrough' }
                        ]
                    }
                },
                additionalProperties: false,
                defaultSnippets: [{ body: { foreground: '${1:#FF0000}', fontStyle: '${2:bold}' } }]
            }
        },
        items: {
            type: 'object',
            defaultSnippets: [{ body: { scope: '${1:keyword.operator}', settings: { foreground: '${2:#FF0000}' } } }],
            properties: {
                name: {
                    type: 'string',
                    description: nls.localize('schema.properties.name', 'Description of the rule.')
                },
                scope: {
                    description: nls.localize('schema.properties.scope', 'Scope selector against which this rule matches.'),
                    anyOf: [
                        {
                            enum: textMateScopes
                        },
                        {
                            type: 'string'
                        },
                        {
                            type: 'array',
                            items: {
                                enum: textMateScopes
                            }
                        },
                        {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        }
                    ]
                },
                settings: {
                    $ref: '#/definitions/settings'
                }
            },
            required: [
                'settings'
            ],
            additionalProperties: false
        }
    };
    exports.colorThemeSchemaId = 'vscode://schemas/color-theme';
    const colorThemeSchema = {
        type: 'object',
        allowComments: true,
        allowTrailingCommas: true,
        properties: {
            colors: {
                description: nls.localize('schema.workbenchColors', 'Colors in the workbench'),
                $ref: colorRegistry_1.workbenchColorsSchemaId,
                additionalProperties: false
            },
            tokenColors: {
                anyOf: [{
                        type: 'string',
                        description: nls.localize('schema.tokenColors.path', 'Path to a tmTheme file (relative to the current file).')
                    },
                    {
                        description: nls.localize('schema.colors', 'Colors for syntax highlighting'),
                        $ref: exports.textmateColorsSchemaId
                    }
                ]
            },
            semanticHighlighting: {
                type: 'boolean',
                description: nls.localize('schema.supportsSemanticHighlighting', 'Whether semantic highlighting should be enabled for this theme.')
            },
            semanticTokenColors: {
                type: 'object',
                description: nls.localize('schema.semanticTokenColors', 'Colors for semantic tokens'),
                $ref: tokenClassificationRegistry_1.tokenStylingSchemaId
            }
        }
    };
    function registerColorThemeSchemas() {
        const schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        schemaRegistry.registerSchema(exports.colorThemeSchemaId, colorThemeSchema);
        schemaRegistry.registerSchema(exports.textmateColorsSchemaId, textmateColorSchema);
    }
    exports.registerColorThemeSchemas = registerColorThemeSchemas;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JUaGVtZVNjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RoZW1lcy9jb21tb24vY29sb3JUaGVtZVNjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBYUEsTUFBTSxjQUFjLEdBQUc7UUFDdEIsU0FBUztRQUNULGVBQWU7UUFDZiw2QkFBNkI7UUFDN0IsY0FBYztRQUNkLFVBQVU7UUFDVixvQkFBb0I7UUFDcEIsMkJBQTJCO1FBQzNCLGtCQUFrQjtRQUNsQiwwQkFBMEI7UUFDMUIsd0JBQXdCO1FBQ3hCLHNCQUFzQjtRQUN0Qix3QkFBd0I7UUFDeEIsZ0JBQWdCO1FBQ2hCLGlCQUFpQjtRQUNqQixvQkFBb0I7UUFDcEIsVUFBVTtRQUNWLFFBQVE7UUFDUixhQUFhO1FBQ2IsbUJBQW1CO1FBQ25CLHNCQUFzQjtRQUN0QixvQkFBb0I7UUFDcEIscUJBQXFCO1FBQ3JCLHNCQUFzQjtRQUN0QixpQkFBaUI7UUFDakIsa0JBQWtCO1FBQ2xCLGNBQWM7UUFDZCw2QkFBNkI7UUFDN0IsOEJBQThCO1FBQzlCLFNBQVM7UUFDVCxvQkFBb0I7UUFDcEIsaUJBQWlCO1FBQ2pCLFNBQVM7UUFDVCxpQkFBaUI7UUFDakIsa0JBQWtCO1FBQ2xCLHNCQUFzQjtRQUN0Qiw2QkFBNkI7UUFDN0IsNkJBQTZCO1FBQzdCLDBCQUEwQjtRQUMxQixlQUFlO1FBQ2YsUUFBUTtRQUNSLGFBQWE7UUFDYixnQkFBZ0I7UUFDaEIsZ0JBQWdCO1FBQ2hCLGdCQUFnQjtRQUNoQixtQkFBbUI7UUFDbkIsaUJBQWlCO1FBQ2pCLGVBQWU7UUFDZixhQUFhO1FBQ2Isc0JBQXNCO1FBQ3RCLHdCQUF3QjtRQUN4QixjQUFjO1FBQ2QsY0FBYztRQUNkLFlBQVk7UUFDWixrQkFBa0I7UUFDbEIsdUJBQXVCO1FBQ3ZCLE1BQU07UUFDTixZQUFZO1FB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
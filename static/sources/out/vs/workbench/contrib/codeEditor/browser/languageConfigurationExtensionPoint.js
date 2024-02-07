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
define(["require", "exports", "vs/nls", "vs/base/common/json", "vs/base/common/types", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/language", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extensions", "vs/base/common/jsonErrorMessages", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/base/common/hash", "vs/base/common/lifecycle"], function (require, exports, nls, json_1, types, languageConfiguration_1, languageConfigurationRegistry_1, language_1, jsonContributionRegistry_1, platform_1, extensions_1, jsonErrorMessages_1, extensionResourceLoader_1, hash_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageConfigurationFileHandler = void 0;
    function isStringArr(something) {
        if (!Array.isArray(something)) {
            return false;
        }
        for (let i = 0, len = something.length; i < len; i++) {
            if (typeof something[i] !== 'string') {
                return false;
            }
        }
        return true;
    }
    function isCharacterPair(something) {
        return (isStringArr(something)
            && something.length === 2);
    }
    let LanguageConfigurationFileHandler = class LanguageConfigurationFileHandler extends lifecycle_1.Disposable {
        constructor(_languageService, _extensionResourceLoaderService, _extensionService, _languageConfigurationService) {
            super();
            this._languageService = _languageService;
            this._extensionResourceLoaderService = _extensionResourceLoaderService;
            this._extensionService = _extensionService;
            this._languageConfigurationService = _languageConfigurationService;
            /**
             * A map from language id to a hash computed from the config files locations.
             */
            this._done = new Map();
            this._register(this._languageService.onDidRequestBasicLanguageFeatures(async (languageIdentifier) => {
                // Modes can be instantiated before the extension points have finished registering
                this._extensionService.whenInstalledExtensionsRegistered().then(() => {
                    this._loadConfigurationsForMode(languageIdentifier);
                });
            }));
            this._register(this._languageService.onDidChange(() => {
                // reload language configurations as necessary
                for (const [languageId] of this._done) {
                    this._loadConfigurationsForMode(languageId);
                }
            }));
        }
        async _loadConfigurationsForMode(languageId) {
            const configurationFiles = this._languageService.getConfigurationFiles(languageId);
            const configurationHash = (0, hash_1.hash)(configurationFiles.map(uri => uri.toString()));
            if (this._done.get(languageId) === configurationHash) {
                return;
            }
            this._done.set(languageId, configurationHash);
            const configs = await Promise.all(configurationFiles.map(configFile => this._readConfigFile(configFile)));
            for (const config of configs) {
                this._handleConfig(languageId, config);
            }
        }
        async _readConfigFile(configFileLocation) {
            try {
                const contents = await this._extensionResourceLoaderService.readExtensionResource(configFileLocation);
                const errors = [];
                let configuration = (0, json_1.parse)(contents, errors);
                if (errors.length) {
                    console.error(nls.localize('parseErrors', "Errors parsing {0}: {1}", configFileLocation.toString(), errors.map(e => (`[${e.offset}, ${e.length}] ${(0, jsonErrorMessages_1.getParseErrorMessage)(e.error)}`)).join('\n')));
                }
                if ((0, json_1.getNodeType)(configuration) !== 'object') {
                    console.error(nls.localize('formatError', "{0}: Invalid format, JSON object expected.", configFileLocation.toString()));
                    configuration = {};
                }
                return configuration;
            }
            catch (err) {
                console.error(err);
                return {};
            }
        }
        _extractValidCommentRule(languageId, configuration) {
            const source = configuration.comments;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!types.isObject(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`comments\` to be an object.`);
                return undefined;
            }
            let result = undefined;
            if (typeof source.lineComment !== 'undefined') {
                if (typeof source.lineComment !== 'string') {
                    console.warn(`[${languageId}]: language configuration: expected \`comments.lineComment\` to be a string.`);
                }
                else {
                    result = result || {};
                    result.lineComment = source.lineComment;
                }
            }
            if (typeof source.blockComment !== 'undefined') {
                if (!isCharacterPair(source.blockComment)) {
                    console.warn(`[${languageId}]: language configuration: expected \`comments.blockComment\` to be an array of two strings.`);
                }
                else {
                    result = result || {};
                    result.blockComment = source.blockComment;
                }
            }
            return result;
        }
        _extractValidBrackets(languageId, configuration) {
            const source = configuration.brackets;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`brackets\` to be an array.`);
                return undefined;
            }
            let result = undefined;
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (!isCharacterPair(pair)) {
                    console.warn(`[${languageId}]: language configuration: expected \`brackets[${i}]\` to be an array of two strings.`);
                    continue;
                }
                result = result || [];
                result.push(pair);
            }
            return result;
        }
        _extractValidAutoClosingPairs(languageId, configuration) {
            const source = configuration.autoClosingPairs;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs\` to be an array.`);
                return undefined;
            }
            let result = undefined;
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (Array.isArray(pair)) {
                    if (!isCharacterPair(pair)) {
                        console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    result = result || [];
                    result.push({ open: pair[0], close: pair[1] });
                }
                else {
                    if (!types.isObject(pair)) {
                        console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    if (typeof pair.open !== 'string') {
                        console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}].open\` to be a string.`);
                        continue;
                    }
                    if (typeof pair.close !== 'string') {
                        console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}].close\` to be a string.`);
                        continue;
                    }
                    if (typeof pair.notIn !== 'undefined') {
                        if (!isStringArr(pair.notIn)) {
                            console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i}].notIn\` to be a string array.`);
                            continue;
                        }
                    }
                    result = result || [];
                    result.push({ open: pair.open, close: pair.close, notIn: pair.notIn });
                }
            }
            return result;
        }
        _extractValidSurroundingPairs(languageId, configuration) {
            const source = configuration.surroundingPairs;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs\` to be an array.`);
                return undefined;
            }
            let result = undefined;
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (Array.isArray(pair)) {
                    if (!isCharacterPair(pair)) {
                        console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    result = result || [];
                    result.push({ open: pair[0], close: pair[1] });
                }
                else {
                    if (!types.isObject(pair)) {
                        console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    if (typeof pair.open !== 'string') {
                        console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i}].open\` to be a string.`);
                        continue;
                    }
                    if (typeof pair.close !== 'string') {
                        console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i}].close\` to be a string.`);
                        continue;
                    }
                    result = result || [];
                    result.push({ open: pair.open, close: pair.close });
                }
            }
            return result;
        }
        _extractValidColorizedBracketPairs(languageId, configuration) {
            const source = configuration.colorizedBracketPairs;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`colorizedBracketPairs\` to be an array.`);
                return undefined;
            }
            const result = [];
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (!isCharacterPair(pair)) {
                    console.warn(`[${languageId}]: language configuration: expected \`colorizedBracketPairs[${i}]\` to be an array of two strings.`);
                    continue;
                }
                result.push([pair[0], pair[1]]);
            }
            return result;
        }
        _extractValidOnEnterRules(languageId, configuration) {
            const source = configuration.onEnterRules;
            if (typeof source === 'undefined') {
                return undefined;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageId}]: language configuration: expected \`onEnterRules\` to be an array.`);
                return undefined;
            }
            let result = undefined;
            for (let i = 0, len = source.length; i < len; i++) {
                const onEnterRule = source[i];
                if (!types.isObject(onEnterRule)) {
                    console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}]\` to be an object.`);
                    continue;
                }
                if (!types.isObject(onEnterRule.action)) {
                    console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}].action\` to be an object.`);
                    continue;
                }
                let indentAction;
                if (onEnterRule.action.indent === 'none') {
                    indentAction = languageConfiguration_1.IndentAction.None;
                }
                else if (onEnterRule.action.indent === 'indent') {
                    indentAction = languageConfiguration_1.IndentAction.Indent;
                }
                else if (onEnterRule.action.indent === 'indentOutdent') {
                    indentAction = languageConfiguration_1.IndentAction.IndentOutdent;
                }
                else if (onEnterRule.action.indent === 'outdent') {
                    indentAction = languageConfiguration_1.IndentAction.Outdent;
                }
                else {
                    console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}].action.indent\` to be 'none', 'indent', 'indentOutdent' or 'outdent'.`);
                    continue;
                }
                const action = { indentAction };
                if (onEnterRule.action.appendText) {
                    if (typeof onEnterRule.action.appendText === 'string') {
                        action.appendText = onEnterRule.action.appendText;
                    }
                    else {
                        console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}].action.appendText\` to be undefined or a string.`);
                    }
                }
                if (onEnterRule.action.removeText) {
                    if (typeof onEnterRule.action.removeText === 'number') {
                        action.removeText = onEnterRule.action.removeText;
                    }
                    else {
                        console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i}].action.removeText\` to be undefined or a number.`);
                    }
                }
                const beforeText = this._parseRegex(languageId, `onEnterRules[${i}].beforeText`, onEnterRule.beforeText);
                if (!beforeText) {
                    continue;
                }
                const resultingOnEnterRule = { beforeText, action };
                if (onEnterRule.afterText) {
                    const afterText = this._parseRegex(languageId, `onEnterRules[${i}].afterText`, onEnterRule.afterText);
                    if (afterText) {
                        resultingOnEnterRule.afterText = afterText;
                    }
                }
                if (onEnterRule.previousLineText) {
                    const previousLineText = this._parseRegex(languageId, `onEnterRules[${i}].previousLineText`, onEnterRule.previousLineText);
                    if (previousLineText) {
                        resultingOnEnterRule.previousLineText = previousLineText;
                    }
                }
                result = result || [];
                result.push(resultingOnEnterRule);
            }
            return result;
        }
        _handleConfig(languageId, configuration) {
            const comments = this._extractValidCommentRule(languageId, configuration);
            const brackets = this._extractValidBrackets(languageId, configuration);
            const autoClosingPairs = this._extractValidAutoClosingPairs(languageId, configuration);
            const surroundingPairs = this._extractValidSurroundingPairs(languageId, configuration);
            const colorizedBracketPairs = this._extractValidColorizedBracketPairs(languageId, configuration);
            const autoCloseBefore = (typeof configuration.autoCloseBefore === 'string' ? configuration.autoCloseBefore : undefined);
            const wordPattern = (configuration.wordPattern ? this._parseRegex(languageId, `wordPattern`, configuration.wordPattern) : undefined);
            const indentationRules = (configuration.indentationRules ? this._mapIndentationRules(languageId, configuration.indentationRules) : undefined);
            let folding = undefined;
            if (configuration.folding) {
                const rawMarkers = configuration.folding.markers;
                const startMarker = (rawMarkers && rawMarkers.start ? this._parseRegex(languageId, `folding.markers.start`, rawMarkers.start) : undefined);
                const endMarker = (rawMarkers && rawMarkers.end ? this._parseRegex(languageId, `folding.markers.end`, rawMarkers.end) : undefined);
                const markers = (startMarker && endMarker ? { start: startMarker, end: endMarker } : undefined);
                folding = {
                    offSide: configuration.folding.offSide,
                    markers
                };
            }
            const onEnterRules = this._extractValidOnEnterRules(languageId, configuration);
            const richEditConfig = {
                comments,
                brackets,
                wordPattern,
                indentationRules,
                onEnterRules,
                autoClosingPairs,
                surroundingPairs,
                colorizedBracketPairs,
                autoCloseBefore,
                folding,
                __electricCharacterSupport: undefined,
            };
            this._languageConfigurationService.register(languageId, richEditConfig, 50);
        }
        _parseRegex(languageId, confPath, value) {
            if (typeof value === 'string') {
                try {
                    return new RegExp(value, '');
                }
                catch (err) {
                    console.warn(`[${languageId}]: Invalid regular expression in \`${confPath}\`: `, err);
                    return undefined;
                }
            }
            if (types.isObject(value)) {
                if (typeof value.pattern !== 'string') {
                    console.warn(`[${languageId}]: language configuration: expected \`${confPath}.pattern\` to be a string.`);
                    return undefined;
                }
                if (typeof value.flags !== 'undefined' && typeof value.flags !== 'string') {
                    console.warn(`[${languageId}]: language configuration: expected \`${confPath}.flags\` to be a string.`);
                    return undefined;
                }
                try {
                    return new RegExp(value.pattern, value.flags);
                }
                catch (err) {
                    console.warn(`[${languageId}]: Invalid regular expression in \`${confPath}\`: `, err);
                    return undefined;
                }
            }
            console.warn(`[${languageId}]: language configuration: expected \`${confPath}\` to be a string or an object.`);
            return undefined;
        }
        _mapIndentationRules(languageId, indentationRules) {
            const increaseIndentPattern = this._parseRegex(languageId, `indentationRules.increaseIndentPattern`, indentationRules.increaseIndentPattern);
            if (!increaseIndentPattern) {
                return undefined;
            }
            const decreaseIndentPattern = this._parseRegex(languageId, `indentationRules.decreaseIndentPattern`, indentationRules.decreaseIndentPattern);
            if (!decreaseIndentPattern) {
                return undefined;
            }
            const result = {
                increaseIndentPattern: increaseIndentPattern,
                decreaseIndentPattern: decreaseIndentPattern
            };
            if (indentationRules.indentNextLinePattern) {
                result.indentNextLinePattern = this._parseRegex(languageId, `indentationRules.indentNextLinePattern`, indentationRules.indentNextLinePattern);
            }
            if (indentationRules.unIndentedLinePattern) {
                result.unIndentedLinePattern = this._parseRegex(languageId, `indentationRules.unIndentedLinePattern`, indentationRules.unIndentedLinePattern);
            }
            return result;
        }
    };
    exports.LanguageConfigurationFileHandler = LanguageConfigurationFileHandler;
    exports.LanguageConfigurationFileHandler = LanguageConfigurationFileHandler = __decorate([
        __param(0, language_1.ILanguageService),
        __param(1, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(2, extensions_1.IExtensionService),
        __param(3, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], LanguageConfigurationFileHandler);
    const schemaId = 'vscode://schemas/language-configuration';
    const schema = {
        allowComments: true,
        allowTrailingCommas: true,
        default: {
            comments: {
                blockComment: ['/*', '*/'],
                lineComment: '//'
            },
            brackets: [['(', ')'], ['[', ']'], ['{', '}']],
            autoClosingPairs: [['(', ')'], ['[', ']'], ['{', '}']],
            surroundingPairs: [['(', ')'], ['[', ']'], ['{', '}']]
        },
        definitions: {
            openBracket: {
                type: 'string',
                description: nls.localize('schema.openBracket', 'The opening bracket character or string sequence.')
            },
            closeBracket: {
                type: 'string',
                description: nls.localize('schema.closeBracket', 'The closing bracket character or string sequence.')
            },
            bracketPair: {
                type: 'array',
                items: [{
                        $ref: '#/definitions/openBracket'
                    }, {
                        $ref: '#/definitions/closeBracket'
                    }]
            }
        },
        properties: {
            comments: {
                default: {
                    blockComment: ['/*', '*/'],
                    lineComment: '//'
                },
                description: nls.localize('schema.comments', 'Defines the comment symbols'),
                type: 'object',
                properties: {
                    blockComment: {
                        type: 'array',
                        description: nls.localize('schema.blockComments', 'Defines how block comments are marked.'),
                        items: [{
                                type: 'string',
                                description: nls.localize('schema.blockComment.begin', 'The character sequence that starts a block comment.')
                            }, {
                                type: 'string',
                                description: nls.localize('schema.blockComment.end', 'The character sequence that ends a block comment.')
                            }]
                    },
                    lineComment: {
                        type: 'string',
                        description: nls.localize('schema.lineComment', 'The character sequence that starts a line comment.')
                    }
                }
            },
            brackets: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                markdownDescription: nls.localize('schema.brackets', 'Defines the bracket symbols that increase or decrease the indentation. When bracket pair colorization is enabled and {0} is not defined, this also defines the bracket pairs that are colorized by their nesting level.', '\`colorizedBracketPairs\`'),
                type: 'array',
                items: {
                    $ref: '#/definitions/bracketPair'
                }
            },
            colorizedBracketPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                markdownDescription: nls.localize('schema.colorizedBracketPairs', 'Defines the bracket pairs that are colorized by their nesting level if bracket pair colorization is enabled. Any brackets included here that are not included in {0} will be automatically included in {0}.', '\`brackets\`'),
                type: 'array',
                items: {
                    $ref: '#/definitions/bracketPair'
                }
            },
            autoClosingPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                description: nls.localize('schema.autoClosingPairs', 'Defines the bracket pairs. When a opening bracket is entered, the closing bracket is inserted automatically.'),
                type: 'array',
                items: {
                    oneOf: [{
                            $ref: '#/definitions/bracketPair'
                        }, {
                            type: 'object',
                            properties: {
                                open: {
                                    $ref: '#/definitions/openBracket'
                                },
                                close: {
                                    $ref: '#/definitions/closeBracket'
                                },
                                notIn: {
                                    type: 'array',
                                    description: nls.localize('schema.autoClosingPairs.notIn', 'Defines a list of scopes where the auto pairs are disabled.'),
                                    items: {
                                        enum: ['string', 'comment']
                                    }
                                }
                            }
                        }]
                }
            },
            autoCloseBefore: {
                default: ';:.,=}])> \n\t',
                description: nls.localize('schema.autoCloseBefore', 'Defines what characters must be after the cursor in order for bracket or quote autoclosing to occur when using the \'languageDefined\' autoclosing setting. This is typically the set of characters which can not start an expression.'),
                type: 'string',
            },
            surroundingPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                description: nls.localize('schema.surroundingPairs', 'Defines the bracket pairs that can be used to surround a selected string.'),
                type: 'array',
                items: {
                    oneOf: [{
                            $ref: '#/definitions/bracketPair'
                        }, {
                            type: 'object',
                            properties: {
                                open: {
                                    $ref: '#/definitions/openBracket'
                                },
                                close: {
                                    $ref: '#/definitions/closeBracket'
                                }
                            }
                        }]
                }
            },
            wordPattern: {
                default: '',
                description: nls.localize('schema.wordPattern', 'Defines what is considered to be a word in the programming language.'),
                type: ['string', 'object'],
                properties: {
                    pattern: {
                        type: 'string',
                        description: nls.localize('schema.wordPattern.pattern', 'The RegExp pattern used to match words.'),
                        default: '',
                    },
                    flags: {
                        type: 'string',
                        description: nls.localize('schema.wordPattern.flags', 'The RegExp flags used to match words.'),
                        default: 'g',
                        pattern: '^([gimuy]+)$',
                        patternErrorMessage: nls.localize('schema.wordPattern.flags.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                    }
                }
            },
            indentationRules: {
                default: {
                    increaseIndentPattern: '',
                    decreaseIndentPattern: ''
                },
                description: nls.localize('schema.indentationRules', 'The language\'s indentation settings.'),
                type: 'object',
                properties: {
                    increaseIndentPattern: {
                        type: ['string', 'object'],
                        description: nls.localize('schema.indentationRules.increaseIndentPattern', 'If a line matches this pattern, then all the lines after it should be indented once (until another rule matches).'),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.increaseIndentPattern.pattern', 'The RegExp pattern for increaseIndentPattern.'),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.increaseIndentPattern.flags', 'The RegExp flags for increaseIndentPattern.'),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize('schema.indentationRules.increaseIndentPattern.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                            }
                        }
                    },
                    decreaseIndentPattern: {
                        type: ['string', 'object'],
                        description: nls.localize('schema.indentationRules.decreaseIndentPattern', 'If a line matches this pattern, then all the lines after it should be unindented once (until another rule matches).'),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.decreaseIndentPattern.pattern', 'The RegExp pattern for decreaseIndentPattern.'),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.decreaseIndentPattern.flags', 'The RegExp flags for decreaseIndentPattern.'),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize('schema.indentationRules.decreaseIndentPattern.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                            }
                        }
                    },
                    indentNextLinePattern: {
                        type: ['string', 'object'],
                        description: nls.localize('schema.indentationRules.indentNextLinePattern', 'If a line matches this pattern, then **only the next line** after it should be indented once.'),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.indentNextLinePattern.pattern', 'The RegExp pattern for indentNextLinePattern.'),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.indentNextLinePattern.flags', 'The RegExp flags for indentNextLinePattern.'),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize('schema.indentationRules.indentNextLinePattern.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                            }
                        }
                    },
                    unIndentedLinePattern: {
                        type: ['string', 'object'],
                        description: nls.localize('schema.indentationRules.unIndentedLinePattern', 'If a line matches this pattern, then its indentation should not be changed and it should not be evaluated against the other rules.'),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.unIndentedLinePattern.pattern', 'The RegExp pattern for unIndentedLinePattern.'),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize('schema.indentationRules.unIndentedLinePattern.flags', 'The RegExp flags for unIndentedLinePattern.'),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize('schema.indentationRules.unIndentedLinePattern.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                            }
                        }
                    }
                }
            },
            folding: {
                type: 'object',
                description: nls.localize('schema.folding', 'The language\'s folding settings.'),
                properties: {
                    offSide: {
                        type: 'boolean',
                        description: nls.localize('schema.folding.offSide', 'A language adheres to the off-side rule if blocks in that language are expressed by their indentation. If set, empty lines belong to the subsequent block.'),
                    },
                    markers: {
                        type: 'object',
                        description: nls.localize('schema.folding.markers', 'Language specific folding markers such as \'#region\' and \'#endregion\'. The start and end regexes will be tested against the contents of all lines and must be designed efficiently'),
                        properties: {
                            start: {
                                type: 'string',
                                description: nls.localize('schema.folding.markers.start', 'The RegExp pattern for the start marker. The regexp must start with \'^\'.')
                            },
                            end: {
                                type: 'string',
                                description: nls.localize('schema.folding.markers.end', 'The RegExp pattern for the end marker. The regexp must start with \'^\'.')
                            },
                        }
                    }
                }
            },
            onEnterRules: {
                type: 'array',
                description: nls.localize('schema.onEnterRules', 'The language\'s rules to be evaluated when pressing Enter.'),
                items: {
                    type: 'object',
                    description: nls.localize('schema.onEnterRules', 'The language\'s rules to be evaluated when pressing Enter.'),
                    required: ['beforeText', 'action'],
                    properties: {
                        beforeText: {
                            type: ['string', 'object'],
                            description: nls.localize('schema.onEnterRules.beforeText', 'This rule will only execute if the text before the cursor matches this regular expression.'),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.beforeText.pattern', 'The RegExp pattern for beforeText.'),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.beforeText.flags', 'The RegExp flags for beforeText.'),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize('schema.onEnterRules.beforeText.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                                }
                            }
                        },
                        afterText: {
                            type: ['string', 'object'],
                            description: nls.localize('schema.onEnterRules.afterText', 'This rule will only execute if the text after the cursor matches this regular expression.'),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.afterText.pattern', 'The RegExp pattern for afterText.'),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.afterText.flags', 'The RegExp flags for afterText.'),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize('schema.onEnterRules.afterText.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                                }
                            }
                        },
                        previousLineText: {
                            type: ['string', 'object'],
                            description: nls.localize('schema.onEnterRules.previousLineText', 'This rule will only execute if the text above the line matches this regular expression.'),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.previousLineText.pattern', 'The RegExp pattern for previousLineText.'),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.previousLineText.flags', 'The RegExp flags for previousLineText.'),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize('schema.onEnterRules.previousLineText.errorMessage', 'Must match the pattern `/^([gimuy]+)$/`.')
                                }
                            }
                        },
                        action: {
                            type: ['string', 'object'],
                            description: nls.localize('schema.onEnterRules.action', 'The action to execute.'),
                            required: ['indent'],
                            default: { 'indent': 'indent' },
                            properties: {
                                indent: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.action.indent', "Describe what to do with the indentation"),
                                    default: 'indent',
                                    enum: ['none', 'indent', 'indentOutdent', 'outdent'],
                                    markdownEnumDescriptions: [
                                        nls.localize('schema.onEnterRules.action.indent.none', "Insert new line and copy the previous line's indentation."),
                                        nls.localize('schema.onEnterRules.action.indent.indent', "Insert new line and indent once (relative to the previous line's indentation)."),
                                        nls.localize('schema.onEnterRules.action.indent.indentOutdent', "Insert two new lines:\n - the first one indented which will hold the cursor\n - the second one at the same indentation level"),
                                        nls.localize('schema.onEnterRules.action.indent.outdent', "Insert new line and outdent once (relative to the previous line's indentation).")
                                    ]
                                },
                                appendText: {
                                    type: 'string',
                                    description: nls.localize('schema.onEnterRules.action.appendText', 'Describes text to be appended after the new line and after the indentation.'),
                                    default: '',
                                },
                                removeText: {
                                    type: 'number',
                                    description: nls.localize('schema.onEnterRules.action.removeText', 'Describes the number of characters to remove from the new line\'s indentation.'),
                                    default: 0,
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    const schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(schemaId, schema);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VDb25maWd1cmF0aW9uRXh0ZW5zaW9uUG9pbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9sYW5ndWFnZUNvbmZpZ3VyYXRpb25FeHRlbnNpb25Qb2ludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpRWhHLFNBQVMsV0FBVyxDQUFDLFNBQTBCO1FBQzlDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDL0IsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RELElBQUksT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ3RDLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUViLENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FBQyxTQUErQjtRQUN2RCxPQUFPLENBQ04sV0FBVyxDQUFDLFNBQVMsQ0FBQztlQUNuQixTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FDekIsQ0FBQztJQUNILENBQUM7SUFFTSxJQUFNLGdDQUFnQyxHQUF0QyxNQUFNLGdDQUFpQyxTQUFRLHNCQUFVO1FBTy9ELFlBQ21CLGdCQUFtRCxFQUNwQywrQkFBaUYsRUFDL0YsaUJBQXFELEVBQ3pDLDZCQUE2RTtZQUU1RyxLQUFLLEVBQUUsQ0FBQztZQUwyQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ25CLG9DQUErQixHQUEvQiwr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
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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/core/wordHelper", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/supports", "vs/editor/common/languages/supports/characterPair", "vs/editor/common/languages/supports/electricCharacter", "vs/editor/common/languages/supports/indentRules", "vs/editor/common/languages/supports/onEnter", "vs/editor/common/languages/supports/richEditBrackets", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/editor/common/languages/language", "vs/platform/instantiation/common/extensions", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/supports/languageBracketsConfiguration"], function (require, exports, event_1, lifecycle_1, strings, wordHelper_1, languageConfiguration_1, supports_1, characterPair_1, electricCharacter_1, indentRules_1, onEnter_1, richEditBrackets_1, instantiation_1, configuration_1, language_1, extensions_1, modesRegistry_1, languageBracketsConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResolvedLanguageConfiguration = exports.LanguageConfigurationRegistry = exports.LanguageConfigurationChangeEvent = exports.getScopedLineTokens = exports.getIndentationAtPosition = exports.LanguageConfigurationService = exports.ILanguageConfigurationService = exports.LanguageConfigurationServiceChangeEvent = void 0;
    class LanguageConfigurationServiceChangeEvent {
        constructor(languageId) {
            this.languageId = languageId;
        }
        affects(languageId) {
            return !this.languageId ? true : this.languageId === languageId;
        }
    }
    exports.LanguageConfigurationServiceChangeEvent = LanguageConfigurationServiceChangeEvent;
    exports.ILanguageConfigurationService = (0, instantiation_1.createDecorator)('languageConfigurationService');
    let LanguageConfigurationService = class LanguageConfigurationService extends lifecycle_1.Disposable {
        constructor(configurationService, languageService) {
            super();
            this.configurationService = configurationService;
            this.languageService = languageService;
            this._registry = this._register(new LanguageConfigurationRegistry());
            this.onDidChangeEmitter = this._register(new event_1.Emitter());
            this.onDidChange = this.onDidChangeEmitter.event;
            this.configurations = new Map();
            const languageConfigKeys = new Set(Object.values(customizedLanguageConfigKeys));
            this._register(this.configurationService.onDidChangeConfiguration((e) => {
                const globalConfigChanged = e.change.keys.some((k) => languageConfigKeys.has(k));
                const localConfigChanged = e.change.overrides
                    .filter(([overrideLangName, keys]) => keys.some((k) => languageConfigKeys.has(k)))
                    .map(([overrideLangName]) => overrideLangName);
                if (globalConfigChanged) {
                    this.configurations.clear();
                    this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(undefined));
                }
                else {
                    for (const languageId of localConfigChanged) {
                        if (this.languageService.isRegisteredLanguageId(languageId)) {
                            this.configurations.delete(languageId);
                            this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(languageId));
                        }
                    }
                }
            }));
            this._register(this._registry.onDidChange((e) => {
                this.configurations.delete(e.languageId);
                this.onDidChangeEmitter.fire(new LanguageConfigurationServiceChangeEvent(e.languageId));
            }));
        }
        register(languageId, configuration, priority) {
            return this._registry.register(languageId, configuration, priority);
        }
        getLanguageConfiguration(languageId) {
            let result = this.configurations.get(languageId);
            if (!result) {
                result = computeConfig(languageId, this._registry, this.configurationService, this.languageService);
                this.configurations.set(languageId, result);
            }
            return result;
        }
    };
    exports.LanguageConfigurationService = LanguageConfigurationService;
    exports.LanguageConfigurationService = LanguageConfigurationService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, language_1.ILanguageService)
    ], LanguageConfigurationService);
    function computeConfig(languageId, registry, configurationService, languageService) {
        let languageConfig = registry.getLanguageConfiguration(languageId);
        if (!languageConfig) {
            if (!languageService.isRegisteredLanguageId(languageId)) {
                // this happens for the null language, which can be returned by monarch.
                // Instead of throwing an error, we just return a default config.
                return new ResolvedLanguageConfiguration(languageId, {});
            }
            languageConfig = new ResolvedLanguageConfiguration(languageId, {});
        }
        const customizedConfig = getCustomizedLanguageConfig(languageConfig.languageId, configurationService);
        const data = combineLanguageConfigurations([languageConfig.underlyingConfig, customizedConfig]);
        const config = new ResolvedLanguageConfiguration(languageConfig.languageId, data);
        return config;
    }
    const customizedLanguageConfigKeys = {
        brackets: 'editor.language.brackets',
        colorizedBracketPairs: 'editor.language.colorizedBracketPairs'
    };
    function getCustomizedLanguageConfig(languageId, configurationService) {
        const brackets = configurationService.getValue(customizedLanguageConfigKeys.brackets, {
            overrideIdentifier: languageId,
        });
        const colorizedBracketPairs = configurationService.getValue(customizedLanguageConfigKeys.colorizedBracketPairs, {
            overrideIdentifier: languageId,
        });
        return {
            brackets: validateBracketPairs(brackets),
            colorizedBracketPairs: validateBracketPairs(colorizedBracketPairs),
        };
    }
    function validateBracketPairs(data) {
        if (!Array.isArray(data)) {
            return undefined;
        }
        return data.map(pair => {
            if (!Array.isArray(pair) || pair.length !== 2) {
                return undefined;
            }
            return [pair[0], pair[1]];
        }).filter((p) => !!p);
    }
    function getIndentationAtPosition(model, lineNumber, column) {
        const lineText = model.getLineContent(lineNumber);
        let indentation = strings.getLeadingWhitespace(lineText);
        if (indentation.length > column - 1) {
            indentation = indentation.substring(0, column - 1);
        }
        return indentation;
    }
    exports.getIndentationAtPosition = getIndentationAtPosition;
    function getScopedLineTokens(model, lineNumber, columnNumber) {
        model.tokenization.forceTokenization(lineNumber);
        const lineTokens = model.tokenization.getLineTokens(lineNumber);
        const column = (typeof columnNumber === 'undefined' ? model.getLineMaxColumn(lineNumber) - 1 : columnNumber - 1);
        return (0, supports_1.createScopedLineTokens)(lineTokens, column);
    }
    exports.getScopedLineTokens = getScopedLineTokens;
    class ComposedLanguageConfiguration {
        constructor(languageId) {
            this.languageId = languageId;
            this._resolved = null;
            this._entries = [];
            this._order = 0;
            this._resolved = null;
        }
        register(configuration, priority) {
            const entry = new LanguageConfigurationContribution(configuration, priority, ++this._order);
            this._entries.push(entry);
            this._resolved = null;
            return (0, lifecycle_1.toDisposable)(() => {
                for (let i = 0; i < this._entries.length; i++) {
                    if (this._entries[i] === entry) {
                        this._entries.splice(i, 1);
                        this._resolved = null;
                        break;
                    }
                }
            });
        }
        getResolvedConfiguration() {
            if (!this._resolved) {
                const config = this._resolve();
                if (config) {
                    this._resolved = new ResolvedLanguageConfiguration(this.languageId, config);
                }
            }
            return this._resolved;
        }
        _resolve() {
            if (this._entries.length === 0) {
                return null;
            }
            this._entries.sort(LanguageConfigurationContribution.cmp);
            return combineLanguageConfigurations(this._entries.map(e => e.configuration));
        }
    }
    function combineLanguageConfigurations(configs) {
        let result = {
            comments: undefined,
            brackets: undefined,
            wordPattern: undefined,
            indentationRules: undefined,
            onEnterRules: undefined,
            autoClosingPairs: undefined,
            surroundingPairs: undefined,
            autoCloseBefore: undefined,
            folding: undefined,
            colorizedBracketPairs: undefined,
            __electricCharacterSupport: undefined,
        };
        for (const entry of configs) {
            result = {
                comments: entry.comments || result.comments,
                brackets: entry.brackets || result.brackets,
                wordPattern: entry.wordPattern || result.wordPattern,
                indentationRules: entry.indentationRules || result.indentationRules,
                onEnterRules: entry.onEnterRules || result.onEnterRules,
                autoClosingPairs: entry.autoClosingPairs || result.autoClosingPairs,
                surroundingPairs: entry.surroundingPairs || result.surroundingPairs,
                autoCloseBefore: entry.autoCloseBefore || result.autoCloseBefore,
                folding: entry.folding || result.folding,
                colorizedBracketPairs: entry.colorizedBracketPairs || result.colorizedBracketPairs,
                __electricCharacterSupport: entry.__electricCharacterSupport || result.__electricCharacterSupport,
            };
        }
        return result;
    }
    class LanguageConfigurationContribution {
        constructor(configuration, priority, order) {
            this.configuration = configuration;
            this.priority = priority;
            this.order = order;
        }
        static cmp(a, b) {
            if (a.priority === b.priority) {
                // higher order last
                return a.order - b.order;
            }
            // higher priority last
            return a.priority - b.priority;
        }
    }
    class LanguageConfigurationChangeEvent {
        constructor(languageId) {
            this.languageId = languageId;
        }
    }
    exports.LanguageConfigurationChangeEvent = LanguageConfigurationChangeEvent;
    class LanguageConfigurationRegistry extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._entries = new Map();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(this.register(modesRegistry_1.PLAINTEXT_LANGUAGE_ID, {
                brackets: [
                    ['(', ')'],
                    ['[', ']'],
                    ['{', '}'],
                ],
                surroundingPairs: [
                    { open: '{', close: '}' },
                    { open: '[', close: ']' },
                    { open: '(', close: ')' },
                    { open: '<', close: '>' },
                    { open: '\"', close: '\"' },
                    { open: '\'', close: '\'' },
                    { open: '`', close: '`' },
                ],
                colorizedBracketPairs: [],
                folding: {
                    offSide: true
                }
            }, 0));
        }
        /**
         * @param priority Use a higher number for higher priority
         */
        register(languageId, configuration, priority = 0) {
            let entries = this._entries.get(languageId);
            if (!entries) {
                entries = new ComposedLanguageConfiguration(languageId);
                this._entries.set(languageId, entries);
            }
            const disposable = entries.register(configuration, priority);
            this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageId));
            return (0, lifecycle_1.toDisposable)(() => {
                disposable.dispose();
                this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageId));
            });
        }
        getLanguageConfiguration(languageId) {
            const entries = this._entries.get(languageId);
            return entries?.getResolvedConfiguration() || null;
        }
    }
    exports.LanguageConfigurationRegistry = LanguageConfigurationRegistry;
    /**
     * Immutable.
    */
    class ResolvedLanguageConfiguration {
        constructor(languageId, underlyingConfig) {
            this.languageId = languageId;
            this.underlyingConfig = underlyingConfig;
            this._brackets = null;
            this._electricCharacter = null;
            this._onEnterSupport =
                this.underlyingConfig.brackets ||
                    this.underlyingConfig.indentationRules ||
                    this.underlyingConfig.onEnterRules
                    ? new onEnter_1.OnEnterSupport(this.underlyingConfig)
                    : null;
            this.comments = ResolvedLanguageConfiguration._handleComments(this.underlyingConfig);
            this.characterPair = new characterPair_1.CharacterPairSupport(this.underlyingConfig);
            this.wordDefinition = this.underlyingConfig.wordPattern || wordHelper_1.DEFAULT_WORD_REGEXP;
            this.indentationRules = this.underlyingConfig.indentationRules;
            if (this.underlyingConfig.indentationRules) {
                this.indentRulesSupport = new indentRules_1.IndentRulesSupport(this.underlyingConfig.indentationRules);
            }
            else {
                this.indentRulesSupport = null;
            }
            this.foldingRules = this.underlyingConfig.folding || {};
            this.bracketsNew = new languageBracketsConfiguration_1.LanguageBracketsConfiguration(languageId, this.underlyingConfig);
        }
        getWordDefinition() {
            return (0, wordHelper_1.ensureValidWordDefinition)(this.wordDefinition);
        }
        get brackets() {
            if (!this._brackets && this.underlyingConfig.brackets) {
                this._brackets = new richEditBrackets_1.RichEditBrackets(this.languageId, this.underlyingConfig.brackets);
            }
            return this._brackets;
        }
        get electricCharacter() {
            if (!this._electricCharacter) {
                this._electricCharacter = new electricCharacter_1.BracketElectricCharacterSupport(this.brackets);
            }
            return this._electricCharacter;
        }
        onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
            if (!this._onEnterSupport) {
                return null;
            }
            return this._onEnterSupport.onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText);
        }
        getAutoClosingPairs() {
            return new languageConfiguration_1.AutoClosingPairs(this.characterPair.getAutoClosingPairs());
        }
        getAutoCloseBeforeSet(forQuotes) {
            return this.characterPair.getAutoCloseBeforeSet(forQuotes);
        }
        getSurroundingPairs() {
            return this.characterPair.getSurroundingPairs();
        }
        static _handleComments(conf) {
            const commentRule = conf.comments;
            if (!commentRule) {
                return null;
            }
            // comment configuration
            const comments = {};
            if (commentRule.lineComment) {
                comments.lineCommentToken = commentRule.lineComment;
            }
            if (commentRule.blockComment) {
                const [blockStart, blockEnd] = commentRule.blockComment;
                comments.blockCommentStartToken = blockStart;
                comments.blockCommentEndToken = blockEnd;
            }
            return comments;
        }
    }
    exports.ResolvedLanguageConfiguration = ResolvedLanguageConfiguration;
    (0, extensions_1.registerSingleton)(exports.ILanguageConfigurationService, LanguageConfigurationService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VDb25maWd1cmF0aW9uUmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbGFuZ3VhZ2VzL2xhbmd1YWdlQ29uZmlndXJhdGlvblJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZDaEcsTUFBYSx1Q0FBdUM7UUFDbkQsWUFBNEIsVUFBOEI7WUFBOUIsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7UUFBSSxDQUFDO1FBRXhELE9BQU8sQ0FBQyxVQUFrQjtZQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLFVBQVUsQ0FBQztRQUNqRSxDQUFDO0tBQ0Q7SUFORCwwRkFNQztJQUVZLFFBQUEsNkJBQTZCLEdBQUcsSUFBQSwrQkFBZSxFQUFnQyw4QkFBOEIsQ0FBQyxDQUFDO0lBRXJILElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTZCLFNBQVEsc0JBQVU7UUFVM0QsWUFDd0Isb0JBQTRELEVBQ2pFLGVBQWtEO1lBRXBFLEtBQUssRUFBRSxDQUFDO1lBSGdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDaEQsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBVHBELGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQTZCLEVBQUUsQ0FBQyxDQUFDO1lBRWhFLHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTJDLENBQUMsQ0FBQztZQUM3RixnQkFBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7WUFFM0MsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBeUMsQ0FBQztZQVFsRixNQUFNLGtCQUFr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
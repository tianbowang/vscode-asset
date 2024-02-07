/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/language", "vs/editor/common/standalone/standaloneEnums", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/common/monarch/monarchCompile", "vs/editor/standalone/common/monarch/monarchLexer", "vs/editor/standalone/common/standaloneTheme", "vs/platform/markers/common/markers", "vs/editor/common/services/languageFeatures", "vs/platform/configuration/common/configuration"], function (require, exports, color_1, range_1, languages, languageConfigurationRegistry_1, modesRegistry_1, language_1, standaloneEnums, standaloneServices_1, monarchCompile_1, monarchLexer_1, standaloneTheme_1, markers_1, languageFeatures_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMonacoLanguagesAPI = exports.registerInlayHintsProvider = exports.registerInlineCompletionsProvider = exports.registerDocumentRangeSemanticTokensProvider = exports.registerDocumentSemanticTokensProvider = exports.registerSelectionRangeProvider = exports.registerDeclarationProvider = exports.registerFoldingRangeProvider = exports.registerColorProvider = exports.registerCompletionItemProvider = exports.registerLinkProvider = exports.registerOnTypeFormattingEditProvider = exports.registerDocumentRangeFormattingEditProvider = exports.registerDocumentFormattingEditProvider = exports.registerCodeActionProvider = exports.registerCodeLensProvider = exports.registerTypeDefinitionProvider = exports.registerImplementationProvider = exports.registerDefinitionProvider = exports.registerLinkedEditingRangeProvider = exports.registerDocumentHighlightProvider = exports.registerDocumentSymbolProvider = exports.registerHoverProvider = exports.registerSignatureHelpProvider = exports.registerRenameProvider = exports.registerReferenceProvider = exports.setMonarchTokensProvider = exports.setTokensProvider = exports.registerTokensProviderFactory = exports.setColorMap = exports.TokenizationSupportAdapter = exports.EncodedTokenizationSupportAdapter = exports.setLanguageConfiguration = exports.onLanguageEncountered = exports.onLanguage = exports.getEncodedLanguageId = exports.getLanguages = exports.register = void 0;
    /**
     * Register information about a new language.
     */
    function register(language) {
        // Intentionally using the `ModesRegistry` here to avoid
        // instantiating services too quickly in the standalone editor.
        modesRegistry_1.ModesRegistry.registerLanguage(language);
    }
    exports.register = register;
    /**
     * Get the information of all the registered languages.
     */
    function getLanguages() {
        let result = [];
        result = result.concat(modesRegistry_1.ModesRegistry.getLanguages());
        return result;
    }
    exports.getLanguages = getLanguages;
    function getEncodedLanguageId(languageId) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        return languageService.languageIdCodec.encodeLanguageId(languageId);
    }
    exports.getEncodedLanguageId = getEncodedLanguageId;
    /**
     * An event emitted when a language is associated for the first time with a text model.
     * @event
     */
    function onLanguage(languageId, callback) {
        return standaloneServices_1.StandaloneServices.withServices(() => {
            const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
            const disposable = languageService.onDidRequestRichLanguageFeatures((encounteredLanguageId) => {
                if (encounteredLanguageId === languageId) {
                    // stop listening
                    disposable.dispose();
                    // invoke actual listener
                    callback();
                }
            });
            return disposable;
        });
    }
    exports.onLanguage = onLanguage;
    /**
     * An event emitted when a language is associated for the first time with a text model or
     * when a language is encountered during the tokenization of another language.
     * @event
     */
    function onLanguageEncountered(languageId, callback) {
        return standaloneServices_1.StandaloneServices.withServices(() => {
            const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
            const disposable = languageService.onDidRequestBasicLanguageFeatures((encounteredLanguageId) => {
                if (encounteredLanguageId === languageId) {
                    // stop listening
                    disposable.dispose();
                    // invoke actual listener
                    callback();
                }
            });
            return disposable;
        });
    }
    exports.onLanguageEncountered = onLanguageEncountered;
    /**
     * Set the editing configuration for a language.
     */
    function setLanguageConfiguration(languageId, configuration) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        if (!languageService.isRegisteredLanguageId(languageId)) {
            throw new Error(`Cannot set configuration for unknown language ${languageId}`);
        }
        const languageConfigurationService = standaloneServices_1.StandaloneServices.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
        return languageConfigurationService.register(languageId, configuration, 100);
    }
    exports.setLanguageConfiguration = setLanguageConfiguration;
    /**
     * @internal
     */
    class EncodedTokenizationSupportAdapter {
        constructor(languageId, actual) {
            this._languageId = languageId;
            this._actual = actual;
        }
        dispose() {
            // NOOP
        }
        getInitialState() {
            return this._actual.getInitialState();
        }
        tokenize(line, hasEOL, state) {
            if (typeof this._actual.tokenize === 'function') {
                return TokenizationSupportAdapter.adaptTokenize(this._languageId, this._actual, line, state);
            }
            throw new Error('Not supported!');
        }
        tokenizeEncoded(line, hasEOL, state) {
            const result = this._actual.tokenizeEncoded(line, state);
            return new languages.EncodedTokenizationResult(result.tokens, result.endState);
        }
    }
    exports.EncodedTokenizationSupportAdapter = EncodedTokenizationSupportAdapter;
    /**
     * @internal
     */
    class TokenizationSupportAdapter {
        constructor(_languageId, _actual, _languageService, _standaloneThemeService) {
            this._languageId = _languageId;
            this._actual = _actual;
            this._languageService = _languageService;
            this._standaloneThemeService = _standaloneThemeService;
        }
        dispose() {
            // NOOP
        }
        getInitialState() {
            return this._actual.getInitialState();
        }
        static _toClassicTokens(tokens, language) {
            const result = [];
            let previousStartIndex = 0;
            for (let i = 0, len = tokens.length; i < len; i++) {
                const t = tokens[i];
                let startIndex = t.startIndex;
                // Prevent issues stemming from a buggy external tokenizer.
                if (i === 0) {
                    // Force first token to start at first index!
                    startIndex = 0;
                }
                else if (startIndex < previousStartIndex) {
                    // Force tokens to be after one another!
                    startIndex = previousStartIndex;
                }
                result[i] = new languages.Token(startIndex, t.scopes, language);
                previousStartIndex = startIndex;
            }
            return result;
        }
        static adaptTokenize(language, actual, line, state) {
            const actualResult = actual.tokenize(line, state);
            const tokens = TokenizationSupportAdapter._toClassicTokens(actualResult.tokens, language);
            let endState;
            // try to save an object if possible
            if (actualResult.endState.equals(state)) {
                endState = state;
            }
            else {
                endState = actualResult.endState;
            }
            return new languages.TokenizationResult(tokens, endState);
        }
        tokenize(line, hasEOL, state) {
            return TokenizationSupportAdapter.adaptTokenize(this._languageId, this._actual, line, state);
        }
        _toBinaryTokens(languageIdCodec, tokens) {
            const languageId = languageIdCodec.encodeLanguageId(this._languageId);
            const tokenTheme = this._standaloneThemeService.getColorTheme().tokenTheme;
            const result = [];
            let resultLen = 0;
            let previousStartIndex = 0;
            for (let i = 0, len = tokens.length; i < len; i++) {
                const t = tokens[i];
                const metadata = tokenTheme.match(languageId, t.scopes) | 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */;
                if (resultLen > 0 && result[resultLen - 1] === metadata) {
                    // same metadata
                    continue;
                }
                let startIndex = t.startIndex;
                // Prevent issues stemming from a buggy external tokenizer.
                if (i === 0) {
                    // Force first token to start at first index!
                    startIndex = 0;
                }
                else if (startIndex < previousStartIndex) {
                    // Force tokens to be after one another!
                    startIndex = previousStartIndex;
                }
                result[resultLen++] = startIndex;
                result[resultLen++] = metadata;
                previousStartIndex = startIndex;
            }
            const actualResult = new Uint32Array(resultLen);
            for (let i = 0; i < resultLen; i++) {
                actualResult[i] = result[i];
            }
            return actualResult;
        }
        tokenizeEncoded(line, hasEOL, state) {
            const actualResult = this._actual.tokenize(line, state);
            const tokens = this._toBinaryTokens(this._languageService.languageIdCodec, actualResult.tokens);
            let endState;
            // try to save an object if possible
            if (actualResult.endState.equals(state)) {
                endState = state;
            }
            else {
                endState = actualResult.endState;
            }
            return new languages.EncodedTokenizationResult(tokens, endState);
        }
    }
    exports.TokenizationSupportAdapter = TokenizationSupportAdapter;
    function isATokensProvider(provider) {
        return (typeof provider.getInitialState === 'function');
    }
    function isEncodedTokensProvider(provider) {
        return 'tokenizeEncoded' in provider;
    }
    function isThenable(obj) {
        return obj && typeof obj.then === 'function';
    }
    /**
     * Change the color map that is used for token colors.
     * Supported formats (hex): #RRGGBB, $RRGGBBAA, #RGB, #RGBA
     */
    function setColorMap(colorMap) {
        const standaloneThemeService = standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService);
        if (colorMap) {
            const result = [null];
            for (let i = 1, len = colorMap.length; i < len; i++) {
                result[i] = color_1.Color.fromHex(colorMap[i]);
            }
            standaloneThemeService.setColorMapOverride(result);
        }
        else {
            standaloneThemeService.setColorMapOverride(null);
        }
    }
    exports.setColorMap = setColorMap;
    /**
     * @internal
     */
    function createTokenizationSupportAdapter(languageId, provider) {
        if (isEncodedTokensProvider(provider)) {
            return new EncodedTokenizationSupportAdapter(languageId, provider);
        }
        else {
            return new TokenizationSupportAdapter(languageId, provider, standaloneServices_1.StandaloneServices.get(language_1.ILanguageService), standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService));
        }
    }
    /**
     * Register a tokens provider factory for a language. This tokenizer will be exclusive with a tokenizer
     * set using `setTokensProvider` or one created using `setMonarchTokensProvider`, but will work together
     * with a tokens provider set using `registerDocumentSemanticTokensProvider` or `registerDocumentRangeSemanticTokensProvider`.
     */
    function registerTokensProviderFactory(languageId, factory) {
        const adaptedFactory = new languages.LazyTokenizationSupport(async () => {
            const result = await Promise.resolve(factory.create());
            if (!result) {
                return null;
            }
            if (isATokensProvider(result)) {
                return createTokenizationSupportAdapter(languageId, result);
            }
            return new monarchLexer_1.MonarchTokenizer(standaloneServices_1.StandaloneServices.get(language_1.ILanguageService), standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService), languageId, (0, monarchCompile_1.compile)(languageId, result), standaloneServices_1.StandaloneServices.get(configuration_1.IConfigurationService));
        });
        return languages.TokenizationRegistry.registerFactory(languageId, adaptedFactory);
    }
    exports.registerTokensProviderFactory = registerTokensProviderFactory;
    /**
     * Set the tokens provider for a language (manual implementation). This tokenizer will be exclusive
     * with a tokenizer created using `setMonarchTokensProvider`, or with `registerTokensProviderFactory`,
     * but will work together with a tokens provider set using `registerDocumentSemanticTokensProvider`
     * or `registerDocumentRangeSemanticTokensProvider`.
     */
    function setTokensProvider(languageId, provider) {
        const languageService = standaloneServices_1.StandaloneServices.get(language_1.ILanguageService);
        if (!languageService.isRegisteredLanguageId(languageId)) {
            throw new Error(`Cannot set tokens provider for unknown language ${languageId}`);
        }
        if (isThenable(provider)) {
            return registerTokensProviderFactory(languageId, { create: () => provider });
        }
        return languages.TokenizationRegistry.register(languageId, createTokenizationSupportAdapter(languageId, provider));
    }
    exports.setTokensProvider = setTokensProvider;
    /**
     * Set the tokens provider for a language (monarch implementation). This tokenizer will be exclusive
     * with a tokenizer set using `setTokensProvider`, or with `registerTokensProviderFactory`, but will
     * work together with a tokens provider set using `registerDocumentSemanticTokensProvider` or
     * `registerDocumentRangeSemanticTokensProvider`.
     */
    function setMonarchTokensProvider(languageId, languageDef) {
        const create = (languageDef) => {
            return new monarchLexer_1.MonarchTokenizer(standaloneServices_1.StandaloneServices.get(language_1.ILanguageService), standaloneServices_1.StandaloneServices.get(standaloneTheme_1.IStandaloneThemeService), languageId, (0, monarchCompile_1.compile)(languageId, languageDef), standaloneServices_1.StandaloneServices.get(configuration_1.IConfigurationService));
        };
        if (isThenable(languageDef)) {
            return registerTokensProviderFactory(languageId, { create: () => languageDef });
        }
        return languages.TokenizationRegistry.register(languageId, create(languageDef));
    }
    exports.setMonarchTokensProvider = setMonarchTokensProvider;
    /**
     * Register a reference provider (used by e.g. reference search).
     */
    function registerReferenceProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.referenceProvider.register(languageSelector, provider);
    }
    exports.registerReferenceProvider = registerReferenceProvider;
    /**
     * Register a rename provider (used by e.g. rename symbol).
     */
    function registerRenameProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.renameProvider.register(languageSelector, provider);
    }
    exports.registerRenameProvider = registerRenameProvider;
    /**
     * Register a signature help provider (used by e.g. parameter hints).
     */
    function registerSignatureHelpProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.signatureHelpProvider.register(languageSelector, provider);
    }
    exports.registerSignatureHelpProvider = registerSignatureHelpProvider;
    /**
     * Register a hover provider (used by e.g. editor hover).
     */
    function registerHoverProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.hoverProvider.register(languageSelector, {
            provideHover: (model, position, token) => {
                const word = model.getWordAtPosition(position);
                return Promise.resolve(provider.provideHover(model, position, token)).then((value) => {
                    if (!value) {
                        return undefined;
                    }
                    if (!value.range && word) {
                        value.range = new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
                    }
                    if (!value.range) {
                        value.range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
                    }
                    return value;
                });
            }
        });
    }
    exports.registerHoverProvider = registerHoverProvider;
    /**
     * Register a document symbol provider (used by e.g. outline).
     */
    function registerDocumentSymbolProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentSymbolProvider.register(languageSelector, provider);
    }
    exports.registerDocumentSymbolProvider = registerDocumentSymbolProvider;
    /**
     * Register a document highlight provider (used by e.g. highlight occurrences).
     */
    function registerDocumentHighlightProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentHighlightProvider.register(languageSelector, provider);
    }
    exports.registerDocumentHighlightProvider = registerDocumentHighlightProvider;
    /**
     * Register an linked editing range provider.
     */
    function registerLinkedEditingRangeProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.linkedEditingRangeProvider.register(languageSelector, provider);
    }
    exports.registerLinkedEditingRangeProvider = registerLinkedEditingRangeProvider;
    /**
     * Register a definition provider (used by e.g. go to definition).
     */
    function registerDefinitionProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.definitionProvider.register(languageSelector, provider);
    }
    exports.registerDefinitionProvider = registerDefinitionProvider;
    /**
     * Register a implementation provider (used by e.g. go to implementation).
     */
    function registerImplementationProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.implementationProvider.register(languageSelector, provider);
    }
    exports.registerImplementationProvider = registerImplementationProvider;
    /**
     * Register a type definition provider (used by e.g. go to type definition).
     */
    function registerTypeDefinitionProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.typeDefinitionProvider.register(languageSelector, provider);
    }
    exports.registerTypeDefinitionProvider = registerTypeDefinitionProvider;
    /**
     * Register a code lens provider (used by e.g. inline code lenses).
     */
    function registerCodeLensProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.codeLensProvider.register(languageSelector, provider);
    }
    exports.registerCodeLensProvider = registerCodeLensProvider;
    /**
     * Register a code action provider (used by e.g. quick fix).
     */
    function registerCodeActionProvider(languageSelector, provider, metadata) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.codeActionProvider.register(languageSelector, {
            providedCodeActionKinds: metadata?.providedCodeActionKinds,
            documentation: metadata?.documentation,
            provideCodeActions: (model, range, context, token) => {
                const markerService = standaloneServices_1.StandaloneServices.get(markers_1.IMarkerService);
                const markers = markerService.read({ resource: model.uri }).filter(m => {
                    return range_1.Range.areIntersectingOrTouching(m, range);
                });
                return provider.provideCodeActions(model, range, { markers, only: context.only, trigger: context.trigger }, token);
            },
            resolveCodeAction: provider.resolveCodeAction
        });
    }
    exports.registerCodeActionProvider = registerCodeActionProvider;
    /**
     * Register a formatter that can handle only entire models.
     */
    function registerDocumentFormattingEditProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentFormattingEditProvider.register(languageSelector, provider);
    }
    exports.registerDocumentFormattingEditProvider = registerDocumentFormattingEditProvider;
    /**
     * Register a formatter that can handle a range inside a model.
     */
    function registerDocumentRangeFormattingEditProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentRangeFormattingEditProvider.register(languageSelector, provider);
    }
    exports.registerDocumentRangeFormattingEditProvider = registerDocumentRangeFormattingEditProvider;
    /**
     * Register a formatter than can do formatting as the user types.
     */
    function registerOnTypeFormattingEditProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.onTypeFormattingEditProvider.register(languageSelector, provider);
    }
    exports.registerOnTypeFormattingEditProvider = registerOnTypeFormattingEditProvider;
    /**
     * Register a link provider that can find links in text.
     */
    function registerLinkProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.linkProvider.register(languageSelector, provider);
    }
    exports.registerLinkProvider = registerLinkProvider;
    /**
     * Register a completion item provider (use by e.g. suggestions).
     */
    function registerCompletionItemProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.completionProvider.register(languageSelector, provider);
    }
    exports.registerCompletionItemProvider = registerCompletionItemProvider;
    /**
     * Register a document color provider (used by Color Picker, Color Decorator).
     */
    function registerColorProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.colorProvider.register(languageSelector, provider);
    }
    exports.registerColorProvider = registerColorProvider;
    /**
     * Register a folding range provider
     */
    function registerFoldingRangeProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.foldingRangeProvider.register(languageSelector, provider);
    }
    exports.registerFoldingRangeProvider = registerFoldingRangeProvider;
    /**
     * Register a declaration provider
     */
    function registerDeclarationProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.declarationProvider.register(languageSelector, provider);
    }
    exports.registerDeclarationProvider = registerDeclarationProvider;
    /**
     * Register a selection range provider
     */
    function registerSelectionRangeProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.selectionRangeProvider.register(languageSelector, provider);
    }
    exports.registerSelectionRangeProvider = registerSelectionRangeProvider;
    /**
     * Register a document semantic tokens provider. A semantic tokens provider will complement and enhance a
     * simple top-down tokenizer. Simple top-down tokenizers can be set either via `setMonarchTokensProvider`
     * or `setTokensProvider`.
     *
     * For the best user experience, register both a semantic tokens provider and a top-down tokenizer.
     */
    function registerDocumentSemanticTokensProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentSemanticTokensProvider.register(languageSelector, provider);
    }
    exports.registerDocumentSemanticTokensProvider = registerDocumentSemanticTokensProvider;
    /**
     * Register a document range semantic tokens provider. A semantic tokens provider will complement and enhance a
     * simple top-down tokenizer. Simple top-down tokenizers can be set either via `setMonarchTokensProvider`
     * or `setTokensProvider`.
     *
     * For the best user experience, register both a semantic tokens provider and a top-down tokenizer.
     */
    function registerDocumentRangeSemanticTokensProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.documentRangeSemanticTokensProvider.register(languageSelector, provider);
    }
    exports.registerDocumentRangeSemanticTokensProvider = registerDocumentRangeSemanticTokensProvider;
    /**
     * Register an inline completions provider.
     */
    function registerInlineCompletionsProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.inlineCompletionsProvider.register(languageSelector, provider);
    }
    exports.registerInlineCompletionsProvider = registerInlineCompletionsProvider;
    /**
     * Register an inlay hints provider.
     */
    function registerInlayHintsProvider(languageSelector, provider) {
        const languageFeaturesService = standaloneServices_1.StandaloneServices.get(languageFeatures_1.ILanguageFeaturesService);
        return languageFeaturesService.inlayHintsProvider.register(languageSelector, provider);
    }
    exports.registerInlayHintsProvider = registerInlayHintsProvider;
    /**
     * @internal
     */
    function createMonacoLanguagesAPI() {
        return {
            register: register,
            getLanguages: getLanguages,
            onLanguage: onLanguage,
            onLanguageEncountered: onLanguageEncountered,
            getEncodedLanguageId: getEncodedLanguageId,
            // provider methods
            setLanguageConfiguration: setLanguageConfiguration,
            setColorMap: setColorMap,
            registerTokensProviderFactory: registerTokensProviderFactory,
            setTokensProvider: setTokensProvider,
            setMonarchTokensProvider: setMonarchTokensProvider,
            registerReferenceProvider: registerReferenceProvider,
            registerRenameProvider: registerRenameProvider,
            registerCompletionItemProvider: registerCompletionItemProvider,
            registerSignatureHelpProvider: registerSignatureHelpProvider,
            registerHoverProvider: registerHoverProvider,
            registerDocumentSymbolProvider: registerDocumentSymbolProvider,
            registerDocumentHighlightProvider: registerDocumentHighlightProvider,
            registerLinkedEditingRangeProvider: registerLinkedEditingRangeProvider,
            registerDefinitionProvider: registerDefinitionProvider,
            registerImplementationProvider: registerImplementationProvider,
            registerTypeDefinitionProvider: registerTypeDefinitionProvider,
            registerCodeLensProvider: registerCodeLensProvider,
            registerCodeActionProvider: registerCodeActionProvider,
            registerDocumentFormattingEditProvider: registerDocumentFormattingEditProvider,
            registerDocumentRangeFormattingEditProvider: registerDocumentRangeFormattingEditProvider,
            registerOnTypeFormattingEditProvider: registerOnTypeFormattingEditProvider,
            registerLinkProvider: registerLinkProvider,
            registerColorProvider: registerColorProvider,
            registerFoldingRangeProvider: registerFoldingRangeProvider,
            registerDeclarationProvider: registerDeclarationProvider,
            registerSelectionRangeProvider: registerSelectionRangeProvider,
            registerDocumentSemanticTokensProvider: registerDocumentSemanticTokensProvider,
            registerDocumentRangeSemanticTokensProvider: registerDocumentRangeSemanticTokensProvider,
            registerInlineCompletionsProvider: registerInlineCompletionsProvider,
            registerInlayHintsProvider: registerInlayHintsProvider,
            // enums
            DocumentHighlightKind: standaloneEnums.DocumentHighlightKind,
            CompletionItemKind: standaloneEnums.CompletionItemKind,
            CompletionItemTag: standaloneEnums.CompletionItemTag,
            CompletionItemInsertTextRule: standaloneEnums.CompletionItemInsertTextRule,
            SymbolKind: standaloneEnums.SymbolKind,
            SymbolTag: standaloneEnums.SymbolTag,
            IndentAction: standaloneEnums.IndentAction,
            CompletionTriggerKind: standaloneEnums.CompletionTriggerKind,
            SignatureHelpTriggerKind: standaloneEnums.SignatureHelpTriggerKind,
            InlayHintKind: standaloneEnums.InlayHintKind,
            InlineCompletionTriggerKind: standaloneEnums.InlineCompletionTriggerKind,
            CodeActionTriggerType: standaloneEnums.CodeActionTriggerType,
            // classes
            FoldingRangeKind: languages.FoldingRangeKind,
            SelectedSuggestionInfo: languages.SelectedSuggestionInfo,
        };
    }
    exports.createMonacoLanguagesAPI = createMonacoLanguagesAPI;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUxhbmd1YWdlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvYnJvd3Nlci9zdGFuZGFsb25lTGFuZ3VhZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlCaEc7O09BRUc7SUFDSCxTQUFnQixRQUFRLENBQUMsUUFBaUM7UUFDekQsd0RBQXdEO1FBQ3hELCtEQUErRDtRQUMvRCw2QkFBYSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFKRCw0QkFJQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsWUFBWTtRQUMzQixJQUFJLE1BQU0sR0FBOEIsRUFBRSxDQUFDO1FBQzNDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLDZCQUFhLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNyRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFKRCxvQ0FJQztJQUVELFNBQWdCLG9CQUFvQixDQUFDLFVBQWtCO1FBQ3RELE1BQU0sZUFBZSxHQUFHLHVDQUFrQixDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pFLE9BQU8sZUFBZSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBSEQsb0RBR0M7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixVQUFVLENBQUMsVUFBa0IsRUFBRSxRQUFvQjtRQUNsRSxPQUFPLHVDQUFrQixDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUU7WUFDM0MsTUFBTSxlQUFlLEdBQUcsdUNBQWtCLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7WUFDakUsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLGdDQUFnQyxDQUFDLENBQUMscUJBQXFCLEVBQUUsRUFBRTtnQkFD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
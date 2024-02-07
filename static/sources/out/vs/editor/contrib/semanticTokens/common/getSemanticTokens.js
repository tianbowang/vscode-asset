/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/uri", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/editor/common/services/semanticTokensDto", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures"], function (require, exports, cancellation_1, errors_1, uri_1, model_1, commands_1, types_1, semanticTokensDto_1, range_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDocumentRangeSemanticTokens = exports.hasDocumentRangeSemanticTokensProvider = exports.getDocumentSemanticTokens = exports.hasDocumentSemanticTokensProvider = exports.DocumentSemanticTokensResult = exports.isSemanticTokensEdits = exports.isSemanticTokens = void 0;
    function isSemanticTokens(v) {
        return v && !!(v.data);
    }
    exports.isSemanticTokens = isSemanticTokens;
    function isSemanticTokensEdits(v) {
        return v && Array.isArray(v.edits);
    }
    exports.isSemanticTokensEdits = isSemanticTokensEdits;
    class DocumentSemanticTokensResult {
        constructor(provider, tokens, error) {
            this.provider = provider;
            this.tokens = tokens;
            this.error = error;
        }
    }
    exports.DocumentSemanticTokensResult = DocumentSemanticTokensResult;
    function hasDocumentSemanticTokensProvider(registry, model) {
        return registry.has(model);
    }
    exports.hasDocumentSemanticTokensProvider = hasDocumentSemanticTokensProvider;
    function getDocumentSemanticTokensProviders(registry, model) {
        const groups = registry.orderedGroups(model);
        return (groups.length > 0 ? groups[0] : []);
    }
    async function getDocumentSemanticTokens(registry, model, lastProvider, lastResultId, token) {
        const providers = getDocumentSemanticTokensProviders(registry, model);
        // Get tokens from all providers at the same time.
        const results = await Promise.all(providers.map(async (provider) => {
            let result;
            let error = null;
            try {
                result = await provider.provideDocumentSemanticTokens(model, (provider === lastProvider ? lastResultId : null), token);
            }
            catch (err) {
                error = err;
                result = null;
            }
            if (!result || (!isSemanticTokens(result) && !isSemanticTokensEdits(result))) {
                result = null;
            }
            return new DocumentSemanticTokensResult(provider, result, error);
        }));
        // Try to return the first result with actual tokens or
        // the first result which threw an error (!!)
        for (const result of results) {
            if (result.error) {
                throw result.error;
            }
            if (result.tokens) {
                return result;
            }
        }
        // Return the first result, even if it doesn't have tokens
        if (results.length > 0) {
            return results[0];
        }
        return null;
    }
    exports.getDocumentSemanticTokens = getDocumentSemanticTokens;
    function _getDocumentSemanticTokensProviderHighestGroup(registry, model) {
        const result = registry.orderedGroups(model);
        return (result.length > 0 ? result[0] : null);
    }
    class DocumentRangeSemanticTokensResult {
        constructor(provider, tokens) {
            this.provider = provider;
            this.tokens = tokens;
        }
    }
    function hasDocumentRangeSemanticTokensProvider(providers, model) {
        return providers.has(model);
    }
    exports.hasDocumentRangeSemanticTokensProvider = hasDocumentRangeSemanticTokensProvider;
    function getDocumentRangeSemanticTokensProviders(providers, model) {
        const groups = providers.orderedGroups(model);
        return (groups.length > 0 ? groups[0] : []);
    }
    async function getDocumentRangeSemanticTokens(registry, model, range, token) {
        const providers = getDocumentRangeSemanticTokensProviders(registry, model);
        // Get tokens from all providers at the same time.
        const results = await Promise.all(providers.map(async (provider) => {
            let result;
            try {
                result = await provider.provideDocumentRangeSemanticTokens(model, range, token);
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
                result = null;
            }
            if (!result || !isSemanticTokens(result)) {
                result = null;
            }
            return new DocumentRangeSemanticTokensResult(provider, result);
        }));
        // Try to return the first result with actual tokens
        for (const result of results) {
            if (result.tokens) {
                return result;
            }
        }
        // Return the first result, even if it doesn't have tokens
        if (results.length > 0) {
            return results[0];
        }
        return null;
    }
    exports.getDocumentRangeSemanticTokens = getDocumentRangeSemanticTokens;
    commands_1.CommandsRegistry.registerCommand('_provideDocumentSemanticTokensLegend', async (accessor, ...args) => {
        const [uri] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentSemanticTokensProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const providers = _getDocumentSemanticTokensProviderHighestGroup(documentSemanticTokensProvider, model);
        if (!providers) {
            // there is no provider => fall back to a document range semantic tokens provider
            return accessor.get(commands_1.ICommandService).executeCommand('_provideDocumentRangeSemanticTokensLegend', uri);
        }
        return providers[0].getLegend();
    });
    commands_1.CommandsRegistry.registerCommand('_provideDocumentSemanticTokens', async (accessor, ...args) => {
        const [uri] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentSemanticTokensProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        if (!hasDocumentSemanticTokensProvider(documentSemanticTokensProvider, model)) {
            // there is no provider => fall back to a document range semantic tokens provider
            return accessor.get(commands_1.ICommandService).executeCommand('_provideDocumentRangeSemanticTokens', uri, model.getFullModelRange());
        }
        const r = await getDocumentSemanticTokens(documentSemanticTokensProvider, model, null, null, cancellation_1.CancellationToken.None);
        if (!r) {
            return undefined;
        }
        const { provider, tokens } = r;
        if (!tokens || !isSemanticTokens(tokens)) {
            return undefined;
        }
        const buff = (0, semanticTokensDto_1.encodeSemanticTokensDto)({
            id: 0,
            type: 'full',
            data: tokens.data
        });
        if (tokens.resultId) {
            provider.releaseDocumentSemanticTokens(tokens.resultId);
        }
        return buff;
    });
    commands_1.CommandsRegistry.registerCommand('_provideDocumentRangeSemanticTokensLegend', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentRangeSemanticTokensProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const providers = getDocumentRangeSemanticTokensProviders(documentRangeSemanticTokensProvider, model);
        if (providers.length === 0) {
            // no providers
            return undefined;
        }
        if (providers.length === 1) {
            // straight forward case, just a single provider
            return providers[0].getLegend();
        }
        if (!range || !range_1.Range.isIRange(range)) {
            // if no range is provided, we cannot support multiple providers
            // as we cannot fall back to the one which would give results
            // => return the first legend for backwards compatibility and print a warning
            console.warn(`provideDocumentRangeSemanticTokensLegend might be out-of-sync with provideDocumentRangeSemanticTokens unless a range argument is passed in`);
            return providers[0].getLegend();
        }
        const result = await getDocumentRangeSemanticTokens(documentRangeSemanticTokensProvider, model, range_1.Range.lift(range), cancellation_1.CancellationToken.None);
        if (!result) {
            return undefined;
        }
        return result.provider.getLegend();
    });
    commands_1.CommandsRegistry.registerCommand('_provideDocumentRangeSemanticTokens', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        (0, types_1.assertType)(range_1.Range.isIRange(range));
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentRangeSemanticTokensProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const result = await getDocumentRangeSemanticTokens(documentRangeSemanticTokensProvider, model, range_1.Range.lift(range), cancellation_1.CancellationToken.None);
        if (!result || !result.tokens) {
            // there is no provider or it didn't return tokens
            return undefined;
        }
        return (0, semanticTokensDto_1.encodeSemanticTokensDto)({
            id: 0,
            type: 'full',
            data: result.tokens.data
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0U2VtYW50aWNUb2tlbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NlbWFudGljVG9rZW5zL2NvbW1vbi9nZXRTZW1hbnRpY1Rva2Vucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLFNBQWdCLGdCQUFnQixDQUFDLENBQXVDO1FBQ3ZFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFrQixDQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUZELDRDQUVDO0lBRUQsU0FBZ0IscUJBQXFCLENBQUMsQ0FBdUM7UUFDNUUsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBdUIsQ0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFGRCxzREFFQztJQUVELE1BQWEsNEJBQTRCO1FBQ3hDLFlBQ2lCLFFBQXdDLEVBQ3hDLE1BQW1ELEVBQ25ELEtBQVU7WUFGVixhQUFRLEdBQVIsUUFBUSxDQUFnQztZQUN4QyxXQUFNLEdBQU4sTUFBTSxDQUE2QztZQUNuRCxVQUFLLEdBQUwsS0FBSyxDQUFLO1FBQ3ZCLENBQUM7S0FDTDtJQU5ELG9FQU1DO0lBRUQsU0FBZ0IsaUNBQWlDLENBQUMsUUFBaUUsRUFBRSxLQUFpQjtRQUNySSxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUZELDhFQUVDO0lBRUQsU0FBUyxrQ0FBa0MsQ0FBQyxRQUFpRSxFQUFFLEtBQWlCO1FBQy9ILE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FB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
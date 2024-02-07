/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/map", "vs/base/common/errors", "vs/editor/common/core/range", "vs/editor/common/model/bracketPairsTextModelPart/fixBrackets", "vs/editor/contrib/inlineCompletions/browser/singleTextEdit", "vs/editor/contrib/inlineCompletions/browser/utils", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, assert_1, async_1, cancellation_1, map_1, errors_1, range_1, fixBrackets_1, singleTextEdit_1, utils_1, snippetParser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionItem = exports.InlineCompletionList = exports.InlineCompletionProviderResult = exports.provideInlineCompletions = void 0;
    async function provideInlineCompletions(registry, position, model, context, token = cancellation_1.CancellationToken.None, languageConfigurationService) {
        // Important: Don't use position after the await calls, as the model could have been changed in the meantime!
        const defaultReplaceRange = getDefaultRange(position, model);
        const providers = registry.all(model);
        const multiMap = new map_1.SetMap();
        for (const provider of providers) {
            if (provider.groupId) {
                multiMap.add(provider.groupId, provider);
            }
        }
        function getPreferredProviders(provider) {
            if (!provider.yieldsToGroupIds) {
                return [];
            }
            const result = [];
            for (const groupId of provider.yieldsToGroupIds || []) {
                const providers = multiMap.get(groupId);
                for (const p of providers) {
                    result.push(p);
                }
            }
            return result;
        }
        const states = new Map();
        const seen = new Set();
        function findPreferredProviderCircle(provider, stack) {
            stack = [...stack, provider];
            if (seen.has(provider)) {
                return stack;
            }
            seen.add(provider);
            try {
                const preferred = getPreferredProviders(provider);
                for (const p of preferred) {
                    const c = findPreferredProviderCircle(p, stack);
                    if (c) {
                        return c;
                    }
                }
            }
            finally {
                seen.delete(provider);
            }
            return undefined;
        }
        function processProvider(provider) {
            const state = states.get(provider);
            if (state) {
                return state;
            }
            const circle = findPreferredProviderCircle(provider, []);
            if (circle) {
                (0, errors_1.onUnexpectedExternalError)(new Error(`Inline completions: cyclic yield-to dependency detected. Path: ${circle.map(s => s.toString ? s.toString() : ('' + s)).join(' -> ')}`));
            }
            const deferredPromise = new async_1.DeferredPromise();
            states.set(provider, deferredPromise.p);
            (async () => {
                if (!circle) {
                    const preferred = getPreferredProviders(provider);
                    for (const p of preferred) {
                        const result = await processProvider(p);
                        if (result && result.items.length > 0) {
                            // Skip provider
                            return undefined;
                        }
                    }
                }
                try {
                    const completions = await provider.provideInlineCompletions(model, position, context, token);
                    return completions;
                }
                catch (e) {
                    (0, errors_1.onUnexpectedExternalError)(e);
                    return undefined;
                }
            })().then(c => deferredPromise.complete(c), e => deferredPromise.error(e));
            return deferredPromise.p;
        }
        const providerResults = await Promise.all(providers.map(async (provider) => ({ provider, completions: await processProvider(provider) })));
        const itemsByHash = new Map();
        const lists = [];
        for (const result of providerResults) {
            const completions = result.completions;
            if (!completions) {
                continue;
            }
            const list = new InlineCompletionList(completions, result.provider);
            lists.push(list);
            for (const item of completions.items) {
                const inlineCompletionItem = InlineCompletionItem.from(item, list, defaultReplaceRange, model, languageConfigurationService);
                itemsByHash.set(inlineCompletionItem.hash(), inlineCompletionItem);
            }
        }
        return new InlineCompletionProviderResult(Array.from(itemsByHash.values()), new Set(itemsByHash.keys()), lists);
    }
    exports.provideInlineCompletions = provideInlineCompletions;
    class InlineCompletionProviderResult {
        constructor(
        /**
         * Free of duplicates.
         */
        completions, hashs, providerResults) {
            this.completions = completions;
            this.hashs = hashs;
            this.providerResults = providerResults;
        }
        has(item) {
            return this.hashs.has(item.hash());
        }
        dispose() {
            for (const result of this.providerResults) {
                result.removeRef();
            }
        }
    }
    exports.InlineCompletionProviderResult = InlineCompletionProviderResult;
    /**
     * A ref counted pointer to the computed `InlineCompletions` and the `InlineCompletionsProvider` that
     * computed them.
     */
    class InlineCompletionList {
        constructor(inlineCompletions, provider) {
            this.inlineCompletions = inlineCompletions;
            this.provider = provider;
            this.refCount = 1;
        }
        addRef() {
            this.refCount++;
        }
        removeRef() {
            this.refCount--;
            if (this.refCount === 0) {
                this.provider.freeInlineCompletions(this.inlineCompletions);
            }
        }
    }
    exports.InlineCompletionList = InlineCompletionList;
    class InlineCompletionItem {
        static from(inlineCompletion, source, defaultReplaceRange, textModel, languageConfigurationService) {
            let insertText;
            let snippetInfo;
            let range = inlineCompletion.range ? range_1.Range.lift(inlineCompletion.range) : defaultReplaceRange;
            if (typeof inlineCompletion.insertText === 'string') {
                insertText = inlineCompletion.insertText;
                if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
                    insertText = closeBrackets(insertText, range.getStartPosition(), textModel, languageConfigurationService);
                    // Modify range depending on if brackets are added or removed
                    const diff = insertText.length - inlineCompletion.insertText.length;
                    if (diff !== 0) {
                        range = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
                    }
                }
                snippetInfo = undefined;
            }
            else if ('snippet' in inlineCompletion.insertText) {
                const preBracketCompletionLength = inlineCompletion.insertText.snippet.length;
                if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
                    inlineCompletion.insertText.snippet = closeBrackets(inlineCompletion.insertText.snippet, range.getStartPosition(), textModel, languageConfigurationService);
                    // Modify range depending on if brackets are added or removed
                    const diff = inlineCompletion.insertText.snippet.length - preBracketCompletionLength;
                    if (diff !== 0) {
                        range = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
                    }
                }
                const snippet = new snippetParser_1.SnippetParser().parse(inlineCompletion.insertText.snippet);
                if (snippet.children.length === 1 && snippet.children[0] instanceof snippetParser_1.Text) {
                    insertText = snippet.children[0].value;
                    snippetInfo = undefined;
                }
                else {
                    insertText = snippet.toString();
                    snippetInfo = {
                        snippet: inlineCompletion.insertText.snippet,
                        range: range
                    };
                }
            }
            else {
                (0, assert_1.assertNever)(inlineCompletion.insertText);
            }
            return new InlineCompletionItem(insertText, inlineCompletion.command, range, insertText, snippetInfo, inlineCompletion.additionalTextEdits || (0, utils_1.getReadonlyEmptyArray)(), inlineCompletion, source);
        }
        constructor(filterText, command, range, insertText, snippetInfo, additionalTextEdits, 
        /**
         * A reference to the original inline completion this inline completion has been constructed from.
         * Used for event data to ensure referential equality.
        */
        sourceInlineCompletion, 
        /**
         * A reference to the original inline completion list this inline completion has been constructed from.
         * Used for event data to ensure referential equality.
        */
        source) {
            this.filterText = filterText;
            this.command = command;
            this.range = range;
            this.insertText = insertText;
            this.snippetInfo = snippetInfo;
            this.additionalTextEdits = additionalTextEdits;
            this.sourceInlineCompletion = sourceInlineCompletion;
            this.source = source;
            filterText = filterText.replace(/\r\n|\r/g, '\n');
            insertText = filterText.replace(/\r\n|\r/g, '\n');
        }
        withRange(updatedRange) {
            return new InlineCompletionItem(this.filterText, this.command, updatedRange, this.insertText, this.snippetInfo, this.additionalTextEdits, this.sourceInlineCompletion, this.source);
        }
        hash() {
            return JSON.stringify({ insertText: this.insertText, range: this.range.toString() });
        }
        toSingleTextEdit() {
            return new singleTextEdit_1.SingleTextEdit(this.range, this.insertText);
        }
    }
    exports.InlineCompletionItem = InlineCompletionItem;
    function getDefaultRange(position, model) {
        const word = model.getWordAtPosition(position);
        const maxColumn = model.getLineMaxColumn(position.lineNumber);
        // By default, always replace up until the end of the current line.
        // This default might be subject to change!
        return word
            ? new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, maxColumn)
            : range_1.Range.fromPositions(position, position.with(undefined, maxColumn));
    }
    function closeBrackets(text, position, model, languageConfigurationService) {
        const lineStart = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
        const newLine = lineStart + text;
        const newTokens = model.tokenization.tokenizeLineWithEdit(position, newLine.length - (position.column - 1), text);
        const slicedTokens = newTokens?.sliceAndInflate(position.column - 1, newLine.length, 0);
        if (!slicedTokens) {
            return text;
        }
        const newText = (0, fixBrackets_1.fixBracketsInLine)(slicedTokens, languageConfigurationService);
        return newText;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZUlubGluZUNvbXBsZXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy9icm93c2VyL3Byb3ZpZGVJbmxpbmVDb21wbGV0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQnpGLEtBQUssVUFBVSx3QkFBd0IsQ0FDN0MsUUFBNEQsRUFDNUQsUUFBa0IsRUFDbEIsS0FBaUIsRUFDakIsT0FBZ0MsRUFDaEMsUUFBMkIsZ0NBQWlCLENBQUMsSUFBSSxFQUNqRCw0QkFBNEQ7UUFFNUQsNkdBQTZHO1FBQzdHLE1BQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3RCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXRDLE1BQU0sUUFBUSxHQUFHLElBQUksWUFBTSxFQUFtRSxDQUFDO1FBQy9GLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFLENBQUM7WUFDbEMsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMxQyxDQUFDO1FBQ0YsQ0FBQztRQUVELFNBQVMscUJBQXFCLENBQUMsUUFBd0M7WUFDdEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUFDLE9BQU8sRUFBRSxDQUFDO1lBQUMsQ0FBQztZQUM5QyxNQUFNLE1BQU0sR0FBcUMsRUFBRSxDQUFDO1lBQ3BELEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsRUFBRSxDQUFDO2dCQUN2RCxNQUFNLFNBQVMsR0FBRyxRQUFR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
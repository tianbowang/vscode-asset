/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/stopwatch", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/resolverService", "vs/editor/contrib/snippet/browser/snippetParser", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/languageFeatures", "vs/platform/history/browser/contextScopedHistoryWidget"], function (require, exports, cancellation_1, errors_1, filters_1, lifecycle_1, stopwatch_1, types_1, uri_1, position_1, range_1, resolverService_1, snippetParser_1, nls_1, actions_1, commands_1, contextkey_1, languageFeatures_1, contextScopedHistoryWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickSuggestionsOptions = exports.showSimpleSuggestions = exports.getSuggestionComparator = exports.provideSuggestionItems = exports.CompletionItemModel = exports.setSnippetSuggestSupport = exports.getSnippetSuggestSupport = exports.CompletionOptions = exports.SnippetSortOrder = exports.CompletionItem = exports.suggestWidgetStatusbarMenu = exports.Context = void 0;
    exports.Context = {
        Visible: contextScopedHistoryWidget_1.historyNavigationVisible,
        HasFocusedSuggestion: new contextkey_1.RawContextKey('suggestWidgetHasFocusedSuggestion', false, (0, nls_1.localize)('suggestWidgetHasSelection', "Whether any suggestion is focused")),
        DetailsVisible: new contextkey_1.RawContextKey('suggestWidgetDetailsVisible', false, (0, nls_1.localize)('suggestWidgetDetailsVisible', "Whether suggestion details are visible")),
        MultipleSuggestions: new contextkey_1.RawContextKey('suggestWidgetMultipleSuggestions', false, (0, nls_1.localize)('suggestWidgetMultipleSuggestions', "Whether there are multiple suggestions to pick from")),
        MakesTextEdit: new contextkey_1.RawContextKey('suggestionMakesTextEdit', true, (0, nls_1.localize)('suggestionMakesTextEdit', "Whether inserting the current suggestion yields in a change or has everything already been typed")),
        AcceptSuggestionsOnEnter: new contextkey_1.RawContextKey('acceptSuggestionOnEnter', true, (0, nls_1.localize)('acceptSuggestionOnEnter', "Whether suggestions are inserted when pressing Enter")),
        HasInsertAndReplaceRange: new contextkey_1.RawContextKey('suggestionHasInsertAndReplaceRange', false, (0, nls_1.localize)('suggestionHasInsertAndReplaceRange', "Whether the current suggestion has insert and replace behaviour")),
        InsertMode: new contextkey_1.RawContextKey('suggestionInsertMode', undefined, { type: 'string', description: (0, nls_1.localize)('suggestionInsertMode', "Whether the default behaviour is to insert or replace") }),
        CanResolve: new contextkey_1.RawContextKey('suggestionCanResolve', false, (0, nls_1.localize)('suggestionCanResolve', "Whether the current suggestion supports to resolve further details")),
    };
    exports.suggestWidgetStatusbarMenu = new actions_1.MenuId('suggestWidgetStatusBar');
    class CompletionItem {
        constructor(position, completion, container, provider) {
            this.position = position;
            this.completion = completion;
            this.container = container;
            this.provider = provider;
            // validation
            this.isInvalid = false;
            // sorting, filtering
            this.score = filters_1.FuzzyScore.Default;
            this.distance = 0;
            this.textLabel = typeof completion.label === 'string'
                ? completion.label
                : completion.label?.label;
            // ensure lower-variants (perf)
            this.labelLow = this.textLabel.toLowerCase();
            // validate label
            this.isInvalid = !this.textLabel;
            this.sortTextLow = completion.sortText && completion.sortText.toLowerCase();
            this.filterTextLow = completion.filterText && completion.filterText.toLowerCase();
            this.extensionId = completion.extensionId;
            // normalize ranges
            if (range_1.Range.isIRange(completion.range)) {
                this.editStart = new position_1.Position(completion.range.startLineNumber, completion.range.startColumn);
                this.editInsertEnd = new position_1.Position(completion.range.endLineNumber, completion.range.endColumn);
                this.editReplaceEnd = new position_1.Position(completion.range.endLineNumber, completion.range.endColumn);
                // validate range
                this.isInvalid = this.isInvalid
                    || range_1.Range.spansMultipleLines(completion.range) || completion.range.startLineNumber !== position.lineNumber;
            }
            else {
                this.editStart = new position_1.Position(completion.range.insert.startLineNumber, completion.range.insert.startColumn);
                this.editInsertEnd = new position_1.Position(completion.range.insert.endLineNumber, completion.range.insert.endColumn);
                this.editReplaceEnd = new position_1.Position(completion.range.replace.endLineNumber, completion.range.replace.endColumn);
                // validate ranges
                this.isInvalid = this.isInvalid
                    || range_1.Range.spansMultipleLines(completion.range.insert) || range_1.Range.spansMultipleLines(completion.range.replace)
                    || completion.range.insert.startLineNumber !== position.lineNumber || completion.range.replace.startLineNumber !== position.lineNumber
                    || completion.range.insert.startColumn !== completion.range.replace.startColumn;
            }
            // create the suggestion resolver
            if (typeof provider.resolveCompletionItem !== 'function') {
                this._resolveCache = Promise.resolve();
                this._resolveDuration = 0;
            }
        }
        // ---- resolving
        get isResolved() {
            return this._resolveDuration !== undefined;
        }
        get resolveDuration() {
            return this._resolveDuration !== undefined ? this._resolveDuration : -1;
        }
        async resolve(token) {
            if (!this._resolveCache) {
                const sub = token.onCancellationRequested(() => {
                    this._resolveCache = undefined;
                    this._resolveDuration = undefined;
                });
                const sw = new stopwatch_1.StopWatch(true);
                this._resolveCache = Promise.resolve(this.provider.resolveCompletionItem(this.completion, token)).then(value => {
                    Object.assign(this.completion, value);
                    this._resolveDuration = sw.elapsed();
                }, err => {
                    if ((0, errors_1.isCancellationError)(err)) {
                        // the IPC queue will reject the request with the
                        // cancellation error -> reset cached
                        this._resolveCache = undefined;
                        this._resolveDuration = undefined;
                    }
                }).finally(() => {
                    sub.dispose();
                });
            }
            return this._resolveCache;
        }
    }
    exports.CompletionItem = CompletionItem;
    var SnippetSortOrder;
    (function (SnippetSortOrder) {
        SnippetSortOrder[SnippetSortOrder["Top"] = 0] = "Top";
        SnippetSortOrder[SnippetSortOrder["Inline"] = 1] = "Inline";
        SnippetSortOrder[SnippetSortOrder["Bottom"] = 2] = "Bottom";
    })(SnippetSortOrder || (exports.SnippetSortOrder = SnippetSortOrder = {}));
    class CompletionOptions {
        static { this.default = new CompletionOptions(); }
        constructor(snippetSortOrder = 2 /* SnippetSortOrder.Bottom */, kindFilter = new Set(), providerFilter = new Set(), providerItemsToReuse = new Map(), showDeprecated = true) {
            this.snippetSortOrder = snippetSortOrder;
            this.kindFilter = kindFilter;
            this.providerFilter = providerFilter;
            this.providerItemsToReuse = providerItemsToReuse;
            this.showDeprecated = showDeprecated;
        }
    }
    exports.CompletionOptions = CompletionOptions;
    let _snippetSuggestSupport;
    function getSnippetSuggestSupport() {
        return _snippetSuggestSupport;
    }
    exports.getSnippetSuggestSupport = getSnippetSuggestSupport;
    function setSnippetSuggestSupport(support) {
        const old = _snippetSuggestSupport;
        _snippetSuggestSupport = support;
        return old;
    }
    exports.setSnippetSuggestSupport = setSnippetSuggestSupport;
    class CompletionItemModel {
        constructor(items, needsClipboard, durations, disposable) {
            this.items = items;
            this.needsClipboard = needsClipboard;
            this.durations = durations;
            this.disposable = disposable;
        }
    }
    exports.CompletionItemModel = CompletionItemModel;
    async function provideSuggestionItems(registry, model, position, options = CompletionOptions.default, context = { triggerKind: 0 /* languages.CompletionTriggerKind.Invoke */ }, token = cancellation_1.CancellationToken.None) {
        const sw = new stopwatch_1.StopWatch();
        position = position.clone();
        const word = model.getWordAtPosition(position);
        const defaultReplaceRange = word ? new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn) : range_1.Range.fromPositions(position);
        const defaultRange = { replace: defaultReplaceRange, insert: defaultReplaceRange.setEndPosition(position.lineNumber, position.column) };
        const result = [];
        const disposables = new lifecycle_1.DisposableStore();
        const durations = [];
        let needsClipboard = false;
        const onCompletionList = (provider, container, sw) => {
            let didAddResult = false;
            if (!container) {
                return didAddResult;
            }
            for (const suggestion of container.suggestions) {
                if (!options.kindFilter.has(suggestion.kind)) {
                    // skip if not showing deprecated suggestions
                    if (!options.showDeprecated && suggestion?.tags?.includes(1 /* languages.CompletionItemTag.Deprecated */)) {
                        continue;
                    }
                    // fill in default range when missing
                    if (!suggestion.range) {
                        suggestion.range = defaultRange;
                    }
                    // fill in default sortText when missing
                    if (!suggestion.sortText) {
                        suggestion.sortText = typeof suggestion.label === 'string' ? suggestion.label : suggestion.label.label;
                    }
                    if (!needsClipboard && suggestion.insertTextRules && suggestion.insertTextRules & 4 /* languages.CompletionItemInsertTextRule.InsertAsSnippet */) {
                        needsClipboard = snippetParser_1.SnippetParser.guessNeedsClipboard(suggestion.insertText);
                    }
                    result.push(new CompletionItem(position, suggestion, container, provider));
                    didAddResult = true;
                }
            }
            if ((0, lifecycle_1.isDisposable)(container)) {
                disposables.add(container);
            }
            durations.push({
                providerName: provider._debugDisplayName ?? 'unknown_provider', elapsedProvider: container.duration ?? -1, elapsedOverall: sw.elapsed()
            });
            return didAddResult;
        };
        // ask for snippets in parallel to asking "real" providers. Only do something if configured to
        // do so - no snippet filter, no special-providers-only request
        const snippetCompletions = (async () => {
            if (!_snippetSuggestSupport || options.kindFilter.has(27 /* languages.CompletionItemKind.Snippet */)) {
                return;
            }
            // we have items from a previous session that we can reuse
            const reuseItems = options.providerItemsToReuse.get(_snippetSuggestSupport);
            if (reuseItems) {
                reuseItems.forEach(item => result.push(item));
                return;
            }
            if (options.providerFilter.size > 0 && !options.providerFilter.has(_snippetSuggestSupport)) {
                return;
            }
            const sw = new stopwatch_1.StopWatch();
            const list = await _snippetSuggestSupport.provideCompletionItems(model, position, context, token);
            onCompletionList(_snippetSuggestSupport, list, sw);
        })();
        // add suggestions from contributed providers - providers are ordered in groups of
        // equal score and once a group produces a result the process stops
        // get provider groups, always add snippet suggestion provider
        for (const providerGroup of registry.orderedGroups(model)) {
            // for each support in the group ask for suggestions
            let didAddResult = false;
            await Promise.all(providerGroup.map(async (provider) => {
                // we have items from a previous session that we can reuse
                if (options.providerItemsToReuse.has(provider)) {
                    const items = options.providerItemsToReuse.get(provider);
                    items.forEach(item => result.push(item));
                    didAddResult = didAddResult || items.length > 0;
                    return;
                }
                // check if this provider is filtered out
                if (options.providerFilter.size > 0 && !options.providerFilter.has(provider)) {
                    return;
                }
                try {
                    const sw = new stopwatch_1.StopWatch();
                    const list = await provider.provideCompletionItems(model, position, context, token);
                    didAddResult = onCompletionList(provider, list, sw) || didAddResult;
                }
                catch (err) {
                    (0, errors_1.onUnexpectedExternalError)(err);
                }
            }));
            if (didAddResult || token.isCancellationRequested) {
                break;
            }
        }
        await snippetCompletions;
        if (token.isCancellationRequested) {
            disposables.dispose();
            return Promise.reject(new errors_1.CancellationError());
        }
        return new CompletionItemModel(result.sort(getSuggestionComparator(options.snippetSortOrder)), needsClipboard, { entries: durations, elapsed: sw.elapsed() }, disposables);
    }
    exports.provideSuggestionItems = provideSuggestionItems;
    function defaultComparator(a, b) {
        // check with 'sortText'
        if (a.sortTextLow && b.sortTextLow) {
            if (a.sortTextLow < b.sortTextLow) {
                return -1;
            }
            else if (a.sortTextLow > b.sortTextLow) {
                return 1;
            }
        }
        // check with 'label'
        if (a.textLabel < b.textLabel) {
            return -1;
        }
        else if (a.textLabel > b.textLabel) {
            return 1;
        }
        // check with 'type'
        return a.completion.kind - b.completion.kind;
    }
    function snippetUpComparator(a, b) {
        if (a.completion.kind !== b.completion.kind) {
            if (a.completion.kind === 27 /* languages.CompletionItemKind.Snippet */) {
                return -1;
            }
            else if (b.completion.kind === 27 /* languages.CompletionItemKind.Snippet */) {
                return 1;
            }
        }
        return defaultComparator(a, b);
    }
    function snippetDownComparator(a, b) {
        if (a.completion.kind !== b.completion.kind) {
            if (a.completion.kind === 27 /* languages.CompletionItemKind.Snippet */) {
                return 1;
            }
            else if (b.completion.kind === 27 /* languages.CompletionItemKind.Snippet */) {
                return -1;
            }
        }
        return defaultComparator(a, b);
    }
    const _snippetComparators = new Map();
    _snippetComparators.set(0 /* SnippetSortOrder.Top */, snippetUpComparator);
    _snippetComparators.set(2 /* SnippetSortOrder.Bottom */, snippetDownComparator);
    _snippetComparators.set(1 /* SnippetSortOrder.Inline */, defaultComparator);
    function getSuggestionComparator(snippetConfig) {
        return _snippetComparators.get(snippetConfig);
    }
    exports.getSuggestionComparator = getSuggestionComparator;
    commands_1.CommandsRegistry.registerCommand('_executeCompletionItemProvider', async (accessor, ...args) => {
        const [uri, position, triggerCharacter, maxItemsToResolve] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(position_1.Position.isIPosition(position));
        (0, types_1.assertType)(typeof triggerCharacter === 'string' || !triggerCharacter);
        (0, types_1.assertType)(typeof maxItemsToResolve === 'number' || !maxItemsToResolve);
        const { completionProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const ref = await accessor.get(resolverService_1.ITextModelService).createModelReference(uri);
        try {
            const result = {
                incomplete: false,
                suggestions: []
            };
            const resolving = [];
            const actualPosition = ref.object.textEditorModel.validatePosition(position);
            const completions = await provideSuggestionItems(completionProvider, ref.object.textEditorModel, actualPosition, undefined, { triggerCharacter: triggerCharacter ?? undefined, triggerKind: triggerCharacter ? 1 /* languages.CompletionTriggerKind.TriggerCharacter */ : 0 /* languages.CompletionTriggerKind.Invoke */ });
            for (const item of completions.items) {
                if (resolving.length < (maxItemsToResolve ?? 0)) {
                    resolving.push(item.resolve(cancellation_1.CancellationToken.None));
                }
                result.incomplete = result.incomplete || item.container.incomplete;
                result.suggestions.push(item.completion);
            }
            try {
                await Promise.all(resolving);
                return result;
            }
            finally {
                setTimeout(() => completions.disposable.dispose(), 100);
            }
        }
        finally {
            ref.dispose();
        }
    });
    function showSimpleSuggestions(editor, provider) {
        editor.getContribution('editor.contrib.suggestController')?.triggerSuggest(new Set().add(provider), undefined, true);
    }
    exports.showSimpleSuggestions = showSimpleSuggestions;
    class QuickSuggestionsOptions {
        static isAllOff(config) {
            return config.other === 'off' && config.comments === 'off' && config.strings === 'off';
        }
        static isAllOn(config) {
            return config.other === 'on' && config.comments === 'on' && config.strings === 'on';
        }
        static valueFor(config, tokenType) {
            switch (tokenType) {
                case 1 /* StandardTokenType.Comment */: return config.comments;
                case 2 /* StandardTokenType.String */: return config.strings;
                default: return config.other;
            }
        }
    }
    exports.QuickSuggestionsOptions = QuickSuggestionsOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3VnZ2VzdC9icm93c2VyL3N1Z2dlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNEJuRixRQUFBLE9BQU8sR0FBRztRQUN0QixPQUFPLEVBQUUscURBQXdCO1FBQ2pDLG9CQUFvQixFQUFFLElBQUksMEJBQWEsQ0FBVSxtQ0FBbUMsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztRQUN4SyxjQUFjLEVBQUUsSUFBSSwwQkFBYSxDQUFVLDZCQUE2QixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyw2QkFBNkIsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ25LLG1CQUFtQixFQUFFLElBQUksMEJBQWEsQ0FBVSxrQ0FBa0MsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0NBQWtDLEVBQUUscURBQXFELENBQUMsQ0FBQztRQUMvTCxhQUFhLEVBQUUsSUFBSSwwQkFBYSxDQUFVLHlCQUF5QixFQUFFLElBQUksRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSxrR0FBa0csQ0FBQyxDQUFDO1FBQ25OLHdCQUF3QixFQUFFLElBQUksMEJBQWEsQ0FBVSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUsc0RBQXNELENBQUMsQ0FBQztRQUNsTCx3QkFBd0IsRUFBRSxJQUFJLDBCQUFhLENBQVUsb0NBQW9DLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLG9DQUFvQyxFQUFFLGlFQUFpRSxDQUFDLENBQUM7UUFDcE4sVUFBVSxFQUFFLElBQUksMEJBQWEsQ0FBdUIsc0JBQXNCLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFF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
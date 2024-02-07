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
define(["require", "exports", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/base/common/fuzzyScorer", "vs/workbench/services/search/common/queryBuilder", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/search/common/search", "vs/workbench/services/search/common/search", "vs/platform/workspace/common/workspace", "vs/base/common/labels", "vs/workbench/services/path/common/pathService", "vs/base/common/uri", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/platform/label/common/label", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/nls", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/editor/common/core/range", "vs/base/common/async", "vs/base/common/arrays", "vs/workbench/contrib/search/common/cacheState", "vs/workbench/services/history/common/history", "vs/base/common/network", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/base/common/map", "vs/workbench/contrib/search/browser/symbolsQuickAccess", "vs/platform/quickinput/common/quickAccess", "vs/workbench/browser/quickaccess", "vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess", "vs/editor/common/services/resolverService", "vs/base/common/event", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/iconLabels", "vs/base/common/lazy", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/workbench/contrib/chat/browser/actions/chatQuickInputActions", "vs/workbench/contrib/chat/browser/chat", "vs/css!./media/anythingQuickAccess"], function (require, exports, quickInput_1, pickerQuickAccess_1, fuzzyScorer_1, queryBuilder_1, instantiation_1, search_1, search_2, workspace_1, labels_1, pathService_1, uri_1, resources_1, environmentService_1, files_1, lifecycle_1, label_1, getIconClasses_1, model_1, language_1, nls_1, workingCopyService_1, configuration_1, editor_1, editorService_1, range_1, async_1, arrays_1, cacheState_1, history_1, network_1, filesConfigurationService_1, map_1, symbolsQuickAccess_1, quickAccess_1, quickaccess_1, gotoSymbolQuickAccess_1, resolverService_1, event_1, codicons_1, themables_1, uriIdentity_1, iconLabels_1, lazy_1, keybinding_1, platform_1, chatQuickInputActions_1, chat_1) {
    "use strict";
    var AnythingQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AnythingQuickAccessProvider = void 0;
    function isEditorSymbolQuickPickItem(pick) {
        const candidate = pick;
        return !!candidate?.range && !!candidate.resource;
    }
    let AnythingQuickAccessProvider = class AnythingQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        static { AnythingQuickAccessProvider_1 = this; }
        static { this.PREFIX = ''; }
        static { this.NO_RESULTS_PICK = {
            label: (0, nls_1.localize)('noAnythingResults', "No matching results")
        }; }
        static { this.MAX_RESULTS = 512; }
        static { this.TYPING_SEARCH_DELAY = 200; } // this delay accommodates for the user typing a word and then stops typing to start searching
        static { this.SYMBOL_PICKS_MERGE_DELAY = 200; } // allow some time to merge fast and slow picks to reduce flickering
        get defaultFilterValue() {
            if (this.configuration.preserveInput) {
                return quickAccess_1.DefaultQuickAccessFilterValue.LAST;
            }
            return undefined;
        }
        constructor(instantiationService, searchService, contextService, pathService, environmentService, fileService, labelService, modelService, languageService, workingCopyService, configurationService, editorService, historyService, filesConfigurationService, textModelService, uriIdentityService, quickInputService, keybindingService, quickChatService) {
            super(AnythingQuickAccessProvider_1.PREFIX, {
                canAcceptInBackground: true,
                noResultsPick: AnythingQuickAccessProvider_1.NO_RESULTS_PICK
            });
            this.instantiationService = instantiationService;
            this.searchService = searchService;
            this.contextService = contextService;
            this.pathService = pathService;
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.labelService = labelService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.workingCopyService = workingCopyService;
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.historyService = historyService;
            this.filesConfigurationService = filesConfigurationService;
            this.textModelService = textModelService;
            this.uriIdentityService = uriIdentityService;
            this.quickInputService = quickInputService;
            this.keybindingService = keybindingService;
            this.quickChatService = quickChatService;
            this.pickState = new class {
                constructor(provider, editorService) {
                    this.provider = provider;
                    this.picker = undefined;
                    this.scorerCache = Object.create(null);
                    this.fileQueryCache = undefined;
                    this.lastOriginalFilter = undefined;
                    this.lastFilter = undefined;
                    this.lastRange = undefined;
                    this.lastGlobalPicks = undefined;
                    this.isQuickNavigating = undefined;
                    this.editorViewState = new quickaccess_1.EditorViewState(editorService);
                }
                set(picker) {
                    // Picker for this run
                    this.picker = picker;
                    event_1.Event.once(picker.onDispose)(() => {
                        if (picker === this.picker) {
                            this.picker = undefined; // clear the picker when disposed to not keep it in memory for too long
                        }
                    });
                    // Caches
                    const isQuickNavigating = !!picker.quickNavigate;
                    if (!isQuickNavigating) {
                        this.fileQueryCache = this.provider.createFileQueryCache();
                        this.scorerCache = Object.create(null);
                    }
                    // Other
                    this.isQuickNavigating = isQuickNavigating;
                    this.lastOriginalFilter = undefined;
                    this.lastFilter = undefined;
                    this.lastRange = undefined;
                    this.lastGlobalPicks = undefined;
                    this.editorViewState.reset();
                }
            }(this, this.editorService);
            //#region Editor History
            this.labelOnlyEditorHistoryPickAccessor = new quickInput_1.QuickPickItemScorerAccessor({ skipDescription: true });
            //#endregion
            //#region File Search
            this.fileQueryDelayer = this._register(new async_1.ThrottledDelayer(AnythingQuickAccessProvider_1.TYPING_SEARCH_DELAY));
            this.fileQueryBuilder = this.instantiationService.createInstance(queryBuilder_1.QueryBuilder);
            //#endregion
            //#region Command Center (if enabled)
            this.lazyRegistry = new lazy_1.Lazy(() => platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
            //#endregion
            //#region Workspace Symbols (if enabled)
            this.workspaceSymbolsQuickAccess = this._register(this.instantiationService.createInstance(symbolsQuickAccess_1.SymbolsQuickAccessProvider));
            //#endregion
            //#region Editor Symbols (if narrowing down into a global pick via `@`)
            this.editorSymbolsQuickAccess = this.instantiationService.createInstance(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider);
        }
        get configuration() {
            const editorConfig = this.configurationService.getValue().workbench?.editor;
            const searchConfig = this.configurationService.getValue().search;
            const quickAccessConfig = this.configurationService.getValue().workbench.quickOpen;
            return {
                openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
                openSideBySideDirection: editorConfig?.openSideBySideDirection,
                includeSymbols: searchConfig?.quickOpen.includeSymbols,
                includeHistory: searchConfig?.quickOpen.includeHistory,
                historyFilterSortOrder: searchConfig?.quickOpen.history.filterSortOrder,
                preserveInput: quickAccessConfig.preserveInput
            };
        }
        provide(picker, token, runOptions) {
            const disposables = new lifecycle_1.DisposableStore();
            // Update the pick state for this run
            this.pickState.set(picker);
            // Add editor decorations for active editor symbol picks
            const editorDecorationsDisposable = disposables.add(new lifecycle_1.MutableDisposable());
            disposables.add(picker.onDidChangeActive(() => {
                // Clear old decorations
                editorDecorationsDisposable.value = undefined;
                // Add new decoration if editor symbol is active
                const [item] = picker.activeItems;
                if (isEditorSymbolQuickPickItem(item)) {
                    editorDecorationsDisposable.value = this.decorateAndRevealSymbolRange(item);
                }
            }));
            // Restore view state upon cancellation if we changed it
            // but only when the picker was closed via explicit user
            // gesture and not e.g. when focus was lost because that
            // could mean the user clicked into the editor directly.
            disposables.add(event_1.Event.once(picker.onDidHide)(({ reason }) => {
                if (reason === quickInput_1.QuickInputHideReason.Gesture) {
                    this.pickState.editorViewState.restore();
                }
            }));
            // Start picker
            disposables.add(super.provide(picker, token, runOptions));
            return disposables;
        }
        decorateAndRevealSymbolRange(pick) {
            const activeEditor = this.editorService.activeEditor;
            if (!this.uriIdentityService.extUri.isEqual(pick.resource, activeEditor?.resource)) {
                return lifecycle_1.Disposable.None; // active editor needs to be for resource
            }
            const activeEditorControl = this.editorService.activeTextEditorControl;
            if (!activeEditorControl) {
                return lifecycle_1.Disposable.None; // we need a text editor control to decorate and reveal
            }
            // we must remember our curret view state to be able to restore
            this.pickState.editorViewState.set();
            // Reveal
            activeEditorControl.revealRangeInCenter(pick.range.selection, 0 /* ScrollType.Smooth */);
            // Decorate
            this.addDecorations(activeEditorControl, pick.range.decoration);
            return (0, lifecycle_1.toDisposable)(() => this.clearDecorations(activeEditorControl));
        }
        _getPicks(originalFilter, disposables, token, runOptions) {
            // Find a suitable range from the pattern looking for ":", "#" or ","
            // unless we have the `@` editor symbol character inside the filter
            const filterWithRange = (0, search_1.extractRangeFromFilter)(originalFilter, [gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX]);
            // Update filter with normalized values
            let filter;
            if (filterWithRange) {
                filter = filterWithRange.filter;
            }
            else {
                filter = originalFilter;
            }
            // Remember as last range
            this.pickState.lastRange = filterWithRange?.range;
            // If the original filter value has changed but the normalized
            // one has not, we return early with a `null` result indicating
            // that the results should preserve because the range information
            // (:<line>:<column>) does not need to trigger any re-sorting.
            if (originalFilter !== this.pickState.lastOriginalFilter && filter === this.pickState.lastFilter) {
                return null;
            }
            // Remember as last filter
            const lastWasFiltering = !!this.pickState.lastOriginalFilter;
            this.pickState.lastOriginalFilter = originalFilter;
            this.pickState.lastFilter = filter;
            // Remember our pick state before returning new picks
            // unless we are inside an editor symbol filter or result.
            // We can use this state to return back to the global pick
            // when the user is narrowing back out of editor symbols.
            const picks = this.pickState.picker?.items;
            const activePick = this.pickState.picker?.activeItems[0];
            if (picks && activePick) {
                const activePickIsEditorSymbol = isEditorSymbolQuickPickItem(activePick);
                const activePickIsNoResultsInEditorSymbols = activePick === AnythingQuickAccessProvider_1.NO_RESULTS_PICK && filter.indexOf(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX) >= 0;
                if (!activePickIsEditorSymbol && !activePickIsNoResultsInEditorSymbols) {
                    this.pickState.lastGlobalPicks = {
                        items: picks,
                        active: activePick
                    };
                }
            }
            // `enableEditorSymbolSearch`: this will enable local editor symbol
            // search if the filter value includes `@` character. We only want
            // to enable this support though if the user was filtering in the
            // picker because this feature depends on an active item in the result
            // list to get symbols from. If we would simply trigger editor symbol
            // search without prior filtering, you could not paste a file name
            // including the `@` character to open it (e.g. /some/file@path)
            // refs: https://github.com/microsoft/vscode/issues/93845
            return this.doGetPicks(filter, { enableEditorSymbolSearch: lastWasFiltering, includeHelp: runOptions?.includeHelp, from: runOptions?.from }, disposables, token);
        }
        doGetPicks(filter, options, disposables, token) {
            const query = (0, fuzzyScorer_1.prepareQuery)(filter);
            // Return early if we have editor symbol picks. We support this by:
            // - having a previously active global pick (e.g. a file)
            // - the user typing `@` to start the local symbol query
            if (options.enableEditorSymbolSearch) {
                const editorSymbolPicks = this.getEditorSymbolPicks(query, disposables, token);
                if (editorSymbolPicks) {
                    return editorSymbolPicks;
                }
            }
            // If we have a known last active editor symbol pick, we try to restore
            // the last global pick to support the case of narrowing out from a
            // editor symbol search back into the global search
            const activePick = this.pickState.picker?.activeItems[0];
            if (isEditorSymbolQuickPickItem(activePick) && this.pickState.lastGlobalPicks) {
                return this.pickState.lastGlobalPicks;
            }
            // Otherwise return normally with history and file/symbol results
            const historyEditorPicks = this.getEditorHistoryPicks(query);
            let picks;
            if (this.pickState.isQuickNavigating) {
                picks = historyEditorPicks;
            }
            else {
                picks = [];
                if (options.includeHelp) {
                    picks.push(...this.getHelpPicks(query, token, options));
                }
                if (historyEditorPicks.length !== 0) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('recentlyOpenedSeparator', "recently opened") });
                    picks.push(...historyEditorPicks);
                }
            }
            return {
                // Fast picks: help (if included) & editor history
                picks,
                // Slow picks: files and symbols
                additionalPicks: (async () => {
                    // Exclude any result that is already present in editor history
                    const additionalPicksExcludes = new map_1.ResourceMap();
                    for (const historyEditorPick of historyEditorPicks) {
                        if (historyEditorPick.resource) {
                            additionalPicksExcludes.set(historyEditorPick.resource, true);
                        }
                    }
                    const additionalPicks = await this.getAdditionalPicks(query, additionalPicksExcludes, token);
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    return additionalPicks.length > 0 ? [
                        { type: 'separator', label: this.configuration.includeSymbols ? (0, nls_1.localize)('fileAndSymbolResultsSeparator', "file and symbol results") : (0, nls_1.localize)('fileResultsSeparator', "file results") },
                        ...additionalPicks
                    ] : [];
                })(),
                // allow some time to merge files and symbols to reduce flickering
                mergeDelay: AnythingQuickAccessProvider_1.SYMBOL_PICKS_MERGE_DELAY
            };
        }
        async getAdditionalPicks(query, excludes, token) {
            // Resolve file and symbol picks (if enabled)
            const [filePicks, symbolPicks] = await Promise.all([
                this.getFilePicks(query, excludes, token),
                this.getWorkspaceSymbolPicks(query, token)
            ]);
            if (token.isCancellationRequested) {
                return [];
            }
            // Perform sorting (top results by score)
            const sortedAnythingPicks = (0, arrays_1.top)([...filePicks, ...symbolPicks], (anyPickA, anyPickB) => (0, fuzzyScorer_1.compareItemsByFuzzyScore)(anyPickA, anyPickB, query, true, quickInput_1.quickPickItemScorerAccessor, this.pickState.scorerCache), AnythingQuickAccessProvider_1.MAX_RESULTS);
            // Perform filtering
            const filteredAnythingPicks = [];
            for (const anythingPick of sortedAnythingPicks) {
                // Always preserve any existing highlights (e.g. from workspace symbols)
                if (anythingPick.highlights) {
                    filteredAnythingPicks.push(anythingPick);
                }
                // Otherwise, do the scoring and matching here
                else {
                    const { score, labelMatch, descriptionMatch } = (0, fuzzyScorer_1.scoreItemFuzzy)(anythingPick, query, true, quickInput_1.quickPickItemScorerAccessor, this.pickState.scorerCache);
                    if (!score) {
                        continue;
                    }
                    anythingPick.highlights = {
                        label: labelMatch,
                        description: descriptionMatch
                    };
                    filteredAnythingPicks.push(anythingPick);
                }
            }
            return filteredAnythingPicks;
        }
        getEditorHistoryPicks(query) {
            const configuration = this.configuration;
            // Just return all history entries if not searching
            if (!query.normalized) {
                return this.historyService.getHistory().map(editor => this.createAnythingPick(editor, configuration));
            }
            if (!this.configuration.includeHistory) {
                return []; // disabled when searching
            }
            // Perform filtering
            const editorHistoryScorerAccessor = query.containsPathSeparator ? quickInput_1.quickPickItemScorerAccessor : this.labelOnlyEditorHistoryPickAccessor; // Only match on label of the editor unless the search includes path separators
            const editorHistoryPicks = [];
            for (const editor of this.historyService.getHistory()) {
                const resource = editor.resource;
                // allow untitled and terminal editors to go through
                if (!resource || (!this.fileService.hasProvider(resource) && resource.scheme !== network_1.Schemas.untitled && resource.scheme !== network_1.Schemas.vscodeTerminal)) {
                    continue; // exclude editors without file resource if we are searching by pattern
                }
                const editorHistoryPick = this.createAnythingPick(editor, configuration);
                const { score, labelMatch, descriptionMatch } = (0, fuzzyScorer_1.scoreItemFuzzy)(editorHistoryPick, query, false, editorHistoryScorerAccessor, this.pickState.scorerCache);
                if (!score) {
                    continue; // exclude editors not matching query
                }
                editorHistoryPick.highlights = {
                    label: labelMatch,
                    description: descriptionMatch
                };
                editorHistoryPicks.push(editorHistoryPick);
            }
            // Return without sorting if settings tell to sort by recency
            if (this.configuration.historyFilterSortOrder === 'recency') {
                return editorHistoryPicks;
            }
            // Perform sorting
            return editorHistoryPicks.sort((editorA, editorB) => (0, fuzzyScorer_1.compareItemsByFuzzyScore)(editorA, editorB, query, false, editorHistoryScorerAccessor, this.pickState.scorerCache));
        }
        createFileQueryCache() {
            return new cacheState_1.FileQueryCacheState(cacheKey => this.fileQueryBuilder.file(this.contextService.getWorkspace().folders, this.getFileQueryOptions({ cacheKey })), query => this.searchService.fileSearch(query), cacheKey => this.searchService.clearCache(cacheKey), this.pickState.fileQueryCache).load();
        }
        async getFilePicks(query, excludes, token) {
            if (!query.normalized) {
                return [];
            }
            // Absolute path result
            const absolutePathResult = await this.getAbsolutePathFileResult(query, token);
            if (token.isCancellationRequested) {
                return [];
            }
            // Use absolute path result as only results if present
            let fileMatches;
            if (absolutePathResult) {
                if (excludes.has(absolutePathResult)) {
                    return []; // excluded
                }
                // Create a single result pick and make sure to apply full
                // highlights to ensure the pick is displayed. Since a
                // ~ might have been used for searching, our fuzzy scorer
                // may otherwise not properly respect the pick as a result
                const absolutePathPick = this.createAnythingPick(absolutePathResult, this.configuration);
                absolutePathPick.highlights = {
                    label: [{ start: 0, end: absolutePathPick.label.length }],
                    description: absolutePathPick.description ? [{ start: 0, end: absolutePathPick.description.length }] : undefined
                };
                return [absolutePathPick];
            }
            // Otherwise run the file search (with a delayer if cache is not ready yet)
            if (this.pickState.fileQueryCache?.isLoaded) {
                fileMatches = await this.doFileSearch(query, token);
            }
            else {
                fileMatches = await this.fileQueryDelayer.trigger(async () => {
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    return this.doFileSearch(query, token);
                });
            }
            if (token.isCancellationRequested) {
                return [];
            }
            // Filter excludes & convert to picks
            const configuration = this.configuration;
            return fileMatches
                .filter(resource => !excludes.has(resource))
                .map(resource => this.createAnythingPick(resource, configuration));
        }
        async doFileSearch(query, token) {
            const [fileSearchResults, relativePathFileResults] = await Promise.all([
                // File search: this is a search over all files of the workspace using the provided pattern
                this.getFileSearchResults(query, token),
                // Relative path search: we also want to consider results that match files inside the workspace
                // by looking for relative paths that the user typed as query. This allows to return even excluded
                // results into the picker if found (e.g. helps for opening compilation results that are otherwise
                // excluded)
                this.getRelativePathFileResults(query, token)
            ]);
            if (token.isCancellationRequested) {
                return [];
            }
            // Return quickly if no relative results are present
            if (!relativePathFileResults) {
                return fileSearchResults;
            }
            // Otherwise, make sure to filter relative path results from
            // the search results to prevent duplicates
            const relativePathFileResultsMap = new map_1.ResourceMap();
            for (const relativePathFileResult of relativePathFileResults) {
                relativePathFileResultsMap.set(relativePathFileResult, true);
            }
            return [
                ...fileSearchResults.filter(result => !relativePathFileResultsMap.has(result)),
                ...relativePathFileResults
            ];
        }
        async getFileSearchResults(query, token) {
            // filePattern for search depends on the number of queries in input:
            // - with multiple: only take the first one and let the filter later drop non-matching results
            // - with single: just take the original in full
            //
            // This enables to e.g. search for "someFile someFolder" by only returning
            // search results for "someFile" and not both that would normally not match.
            //
            let filePattern = '';
            if (query.values && query.values.length > 1) {
                filePattern = query.values[0].original;
            }
            else {
                filePattern = query.original;
            }
            const fileSearchResults = await this.doGetFileSearchResults(filePattern, token);
            if (token.isCancellationRequested) {
                return [];
            }
            // If we detect that the search limit has been hit and we have a query
            // that was composed of multiple inputs where we only took the first part
            // we run another search with the full original query included to make
            // sure we are including all possible results that could match.
            if (fileSearchResults.limitHit && query.values && query.values.length > 1) {
                const additionalFileSearchResults = await this.doGetFileSearchResults(query.original, token);
                if (token.isCancellationRequested) {
                    return [];
                }
                // Remember which result we already covered
                const existingFileSearchResultsMap = new map_1.ResourceMap();
                for (const fileSearchResult of fileSearchResults.results) {
                    existingFileSearchResultsMap.set(fileSearchResult.resource, true);
                }
                // Add all additional results to the original set for inclusion
                for (const additionalFileSearchResult of additionalFileSearchResults.results) {
                    if (!existingFileSearchResultsMap.has(additionalFileSearchResult.resource)) {
                        fileSearchResults.results.push(additionalFileSearchResult);
                    }
                }
            }
            return fileSearchResults.results.map(result => result.resource);
        }
        doGetFileSearchResults(filePattern, token) {
            return this.searchService.fileSearch(this.fileQueryBuilder.file(this.contextService.getWorkspace().folders, this.getFileQueryOptions({
                filePattern,
                cacheKey: this.pickState.fileQueryCache?.cacheKey,
                maxResults: AnythingQuickAccessProvider_1.MAX_RESULTS
            })), token);
        }
        getFileQueryOptions(input) {
            return {
                _reason: 'openFileHandler', // used for telemetry - do not change
                extraFileResources: this.instantiationService.invokeFunction(search_1.getOutOfWorkspaceEditorResources),
                filePattern: input.filePattern || '',
                cacheKey: input.cacheKey,
                maxResults: input.maxResults || 0,
                sortByScore: true
            };
        }
        async getAbsolutePathFileResult(query, token) {
            if (!query.containsPathSeparator) {
                return;
            }
            const userHome = await this.pathService.userHome();
            const detildifiedQuery = (0, labels_1.untildify)(query.original, userHome.scheme === network_1.Schemas.file ? userHome.fsPath : userHome.path);
            if (token.isCancellationRequested) {
                return;
            }
            const isAbsolutePathQuery = (await this.pathService.path).isAbsolute(detildifiedQuery);
            if (token.isCancellationRequested) {
                return;
            }
            if (isAbsolutePathQuery) {
                const resource = (0, resources_1.toLocalResource)(await this.pathService.fileURI(detildifiedQuery), this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
                if (token.isCancellationRequested) {
                    return;
                }
                try {
                    if ((await this.fileService.stat(resource)).isFile) {
                        return resource;
                    }
                }
                catch (error) {
                    // ignore if file does not exist
                }
            }
            return;
        }
        async getRelativePathFileResults(query, token) {
            if (!query.containsPathSeparator) {
                return;
            }
            // Convert relative paths to absolute paths over all folders of the workspace
            // and return them as results if the absolute paths exist
            const isAbsolutePathQuery = (await this.pathService.path).isAbsolute(query.original);
            if (!isAbsolutePathQuery) {
                const resources = [];
                for (const folder of this.contextService.getWorkspace().folders) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    const resource = (0, resources_1.toLocalResource)(folder.toResource(query.original), this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
                    try {
                        if ((await this.fileService.stat(resource)).isFile) {
                            resources.push(resource);
                        }
                    }
                    catch (error) {
                        // ignore if file does not exist
                    }
                }
                return resources;
            }
            return;
        }
        getHelpPicks(query, token, runOptions) {
            if (query.normalized) {
                return []; // If there's a filter, we don't show the help
            }
            const providers = this.lazyRegistry.value.getQuickAccessProviders()
                .filter(p => p.helpEntries.some(h => h.commandCenterOrder !== undefined))
                .flatMap(provider => provider.helpEntries
                .filter(h => h.commandCenterOrder !== undefined)
                .map(helpEntry => {
                const providerSpecificOptions = {
                    ...runOptions,
                    includeHelp: provider.prefix === AnythingQuickAccessProvider_1.PREFIX ? false : runOptions?.includeHelp
                };
                const label = helpEntry.commandCenterLabel ?? helpEntry.description;
                return {
                    label,
                    description: helpEntry.prefix ?? provider.prefix,
                    commandCenterOrder: helpEntry.commandCenterOrder,
                    keybinding: helpEntry.commandId ? this.keybindingService.lookupKeybinding(helpEntry.commandId) : undefined,
                    ariaLabel: (0, nls_1.localize)('helpPickAriaLabel', "{0}, {1}", label, helpEntry.description),
                    accept: () => {
                        this.quickInputService.quickAccess.show(provider.prefix, {
                            preserveValue: true,
                            providerOptions: providerSpecificOptions
                        });
                    }
                };
            }));
            // TODO: There has to be a better place for this, but it's the first time we are adding a non-quick access provider
            // to the command center, so for now, let's do this.
            if (this.quickChatService.enabled) {
                providers.push({
                    label: (0, nls_1.localize)('chat', "Open Quick Chat"),
                    commandCenterOrder: 30,
                    keybinding: this.keybindingService.lookupKeybinding(chatQuickInputActions_1.ASK_QUICK_QUESTION_ACTION_ID),
                    accept: () => this.quickChatService.toggle()
                });
            }
            return providers.sort((a, b) => a.commandCenterOrder - b.commandCenterOrder);
        }
        async getWorkspaceSymbolPicks(query, token) {
            const configuration = this.configuration;
            if (!query.normalized || // we need a value for search for
                !configuration.includeSymbols || // we need to enable symbols in search
                this.pickState.lastRange // a range is an indicator for just searching for files
            ) {
                return [];
            }
            // Delegate to the existing symbols quick access
            // but skip local results and also do not score
            return this.workspaceSymbolsQuickAccess.getSymbolPicks(query.original, {
                skipLocal: true,
                skipSorting: true,
                delay: AnythingQuickAccessProvider_1.TYPING_SEARCH_DELAY
            }, token);
        }
        getEditorSymbolPicks(query, disposables, token) {
            const filterSegments = query.original.split(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX);
            const filter = filterSegments.length > 1 ? filterSegments[filterSegments.length - 1].trim() : undefined;
            if (typeof filter !== 'string') {
                return null; // we need to be searched for editor symbols via `@`
            }
            const activeGlobalPick = this.pickState.lastGlobalPicks?.active;
            if (!activeGlobalPick) {
                return null; // we need an active global pick to find symbols for
            }
            const activeGlobalResource = activeGlobalPick.resource;
            if (!activeGlobalResource || (!this.fileService.hasProvider(activeGlobalResource) && activeGlobalResource.scheme !== network_1.Schemas.untitled)) {
                return null; // we need a resource that we can resolve
            }
            if (activeGlobalPick.label.includes(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX) || activeGlobalPick.description?.includes(gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX)) {
                if (filterSegments.length < 3) {
                    return null; // require at least 2 `@` if our active pick contains `@` in label or description
                }
            }
            return this.doGetEditorSymbolPicks(activeGlobalPick, activeGlobalResource, filter, disposables, token);
        }
        async doGetEditorSymbolPicks(activeGlobalPick, activeGlobalResource, filter, disposables, token) {
            // Bring the editor to front to review symbols to go to
            try {
                // we must remember our curret view state to be able to restore
                this.pickState.editorViewState.set();
                // open it
                await this.editorService.openEditor({
                    resource: activeGlobalResource,
                    options: { preserveFocus: true, revealIfOpened: true, ignoreError: true }
                });
            }
            catch (error) {
                return []; // return if resource cannot be opened
            }
            if (token.isCancellationRequested) {
                return [];
            }
            // Obtain model from resource
            let model = this.modelService.getModel(activeGlobalResource);
            if (!model) {
                try {
                    const modelReference = disposables.add(await this.textModelService.createModelReference(activeGlobalResource));
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    model = modelReference.object.textEditorModel;
                }
                catch (error) {
                    return []; // return if model cannot be resolved
                }
            }
            // Ask provider for editor symbols
            const editorSymbolPicks = (await this.editorSymbolsQuickAccess.getSymbolPicks(model, filter, { extraContainerLabel: (0, iconLabels_1.stripIcons)(activeGlobalPick.label) }, disposables, token));
            if (token.isCancellationRequested) {
                return [];
            }
            return editorSymbolPicks.map(editorSymbolPick => {
                // Preserve separators
                if (editorSymbolPick.type === 'separator') {
                    return editorSymbolPick;
                }
                // Convert editor symbols to anything pick
                return {
                    ...editorSymbolPick,
                    resource: activeGlobalResource,
                    description: editorSymbolPick.description,
                    trigger: (buttonIndex, keyMods) => {
                        this.openAnything(activeGlobalResource, { keyMods, range: editorSymbolPick.range?.selection, forceOpenSideBySide: true });
                        return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                    },
                    accept: (keyMods, event) => this.openAnything(activeGlobalResource, { keyMods, range: editorSymbolPick.range?.selection, preserveFocus: event.inBackground, forcePinned: event.inBackground })
                };
            });
        }
        addDecorations(editor, range) {
            this.editorSymbolsQuickAccess.addDecorations(editor, range);
        }
        clearDecorations(editor) {
            this.editorSymbolsQuickAccess.clearDecorations(editor);
        }
        //#endregion
        //#region Helpers
        createAnythingPick(resourceOrEditor, configuration) {
            const isEditorHistoryEntry = !uri_1.URI.isUri(resourceOrEditor);
            let resource;
            let label;
            let description = undefined;
            let isDirty = undefined;
            let extraClasses;
            let icon = undefined;
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                resource = editor_1.EditorResourceAccessor.getOriginalUri(resourceOrEditor);
                label = resourceOrEditor.getName();
                description = resourceOrEditor.getDescription();
                isDirty = resourceOrEditor.isDirty() && !resourceOrEditor.isSaving();
                extraClasses = resourceOrEditor.getLabelExtraClasses();
                icon = resourceOrEditor.getIcon();
            }
            else {
                resource = uri_1.URI.isUri(resourceOrEditor) ? resourceOrEditor : resourceOrEditor.resource;
                label = (0, resources_1.basenameOrAuthority)(resource);
                description = this.labelService.getUriLabel((0, resources_1.dirname)(resource), { relative: true });
                isDirty = this.workingCopyService.isDirty(resource) && !this.filesConfigurationService.hasShortAutoSaveDelay(resource);
                extraClasses = [];
            }
            const labelAndDescription = description ? `${label} ${description}` : label;
            const iconClassesValue = new lazy_1.Lazy(() => (0, getIconClasses_1.getIconClasses)(this.modelService, this.languageService, resource, undefined, icon).concat(extraClasses));
            const buttonsValue = new lazy_1.Lazy(() => {
                const openSideBySideDirection = configuration.openSideBySideDirection;
                const buttons = [];
                // Open to side / below
                buttons.push({
                    iconClass: openSideBySideDirection === 'right' ? themables_1.ThemeIcon.asClassName(codicons_1.Codicon.splitHorizontal) : themables_1.ThemeIcon.asClassName(codicons_1.Codicon.splitVertical),
                    tooltip: openSideBySideDirection === 'right' ?
                        (0, nls_1.localize)({ key: 'openToSide', comment: ['Open this file in a split editor on the left/right side'] }, "Open to the Side") :
                        (0, nls_1.localize)({ key: 'openToBottom', comment: ['Open this file in a split editor on the bottom'] }, "Open to the Bottom")
                });
                // Remove from History
                if (isEditorHistoryEntry) {
                    buttons.push({
                        iconClass: isDirty ? ('dirty-anything ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.circleFilled)) : themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close),
                        tooltip: (0, nls_1.localize)('closeEditor', "Remove from Recently Opened"),
                        alwaysVisible: isDirty
                    });
                }
                return buttons;
            });
            return {
                resource,
                label,
                ariaLabel: isDirty ? (0, nls_1.localize)('filePickAriaLabelDirty', "{0} unsaved changes", labelAndDescription) : labelAndDescription,
                description,
                get iconClasses() { return iconClassesValue.value; },
                get buttons() { return buttonsValue.value; },
                trigger: (buttonIndex, keyMods) => {
                    switch (buttonIndex) {
                        // Open to side / below
                        case 0:
                            this.openAnything(resourceOrEditor, { keyMods, range: this.pickState.lastRange, forceOpenSideBySide: true });
                            return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                        // Remove from History
                        case 1:
                            if (!uri_1.URI.isUri(resourceOrEditor)) {
                                this.historyService.removeFromHistory(resourceOrEditor);
                                return pickerQuickAccess_1.TriggerAction.REMOVE_ITEM;
                            }
                    }
                    return pickerQuickAccess_1.TriggerAction.NO_ACTION;
                },
                accept: (keyMods, event) => this.openAnything(resourceOrEditor, { keyMods, range: this.pickState.lastRange, preserveFocus: event.inBackground, forcePinned: event.inBackground })
            };
        }
        async openAnything(resourceOrEditor, options) {
            // Craft some editor options based on quick access usage
            const editorOptions = {
                preserveFocus: options.preserveFocus,
                pinned: options.keyMods?.ctrlCmd || options.forcePinned || this.configuration.openEditorPinned,
                selection: options.range ? range_1.Range.collapseToStart(options.range) : undefined
            };
            const targetGroup = options.keyMods?.alt || (this.configuration.openEditorPinned && options.keyMods?.ctrlCmd) || options.forceOpenSideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP;
            // Restore any view state if the target is the side group
            if (targetGroup === editorService_1.SIDE_GROUP) {
                await this.pickState.editorViewState.restore();
            }
            // Open editor (typed)
            if ((0, editor_1.isEditorInput)(resourceOrEditor)) {
                await this.editorService.openEditor(resourceOrEditor, editorOptions, targetGroup);
            }
            // Open editor (untyped)
            else {
                let resourceEditorInput;
                if (uri_1.URI.isUri(resourceOrEditor)) {
                    resourceEditorInput = {
                        resource: resourceOrEditor,
                        options: editorOptions
                    };
                }
                else {
                    resourceEditorInput = {
                        ...resourceOrEditor,
                        options: {
                            ...resourceOrEditor.options,
                            ...editorOptions
                        }
                    };
                }
                await this.editorService.openEditor(resourceEditorInput, targetGroup);
            }
        }
    };
    exports.AnythingQuickAccessProvider = AnythingQuickAccessProvider;
    exports.AnythingQuickAccessProvider = AnythingQuickAccessProvider = AnythingQuickAccessProvider_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, search_2.ISearchService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, pathService_1.IPathService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, files_1.IFileService),
        __param(6, label_1.ILabelService),
        __param(7, model_1.IModelService),
        __param(8, language_1.ILanguageService),
        __param(9, workingCopyService_1.IWorkingCopyService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, editorService_1.IEditorService),
        __param(12, history_1.IHistoryService),
        __param(13, filesConfigurationService_1.IFilesConfigurationService),
        __param(14, resolverService_1.ITextModelService),
        __param(15, uriIdentity_1.IUriIdentityService),
        __param(16, quickInput_1.IQuickInputService),
        __param(17, keybinding_1.IKeybindingService),
        __param(18, chat_1.IQuickChatService)
    ], AnythingQuickAccessProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW55dGhpbmdRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvYW55dGhpbmdRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBOERoRyxTQUFTLDJCQUEyQixDQUFDLElBQTZCO1FBQ2pFLE1BQU0sU0FBUyxHQUFHLElBQXNELENBQUM7UUFFekUsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEtBQUssSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUNuRCxDQUFDO0lBRU0sSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSw2Q0FBaUQ7O2lCQUUxRixXQUFNLEdBQUcsRUFBRSxBQUFMLENBQU07aUJBRUssb0JBQWUsR0FBMkI7WUFDakUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDO1NBQzNELEFBRnNDLENBRXJDO2lCQUVzQixnQkFBVyxHQUFHLEdBQUcsQUFBTixDQUFPO2lCQUVsQix3QkFBbUIsR0FBRyxHQUFHLEFBQU4sQ0FBTyxHQUFDLDhGQUE4RjtpQkFFbEksNkJBQXdCLEdBQUcsR0FBRyxBQUFOLENBQU8sR0FBQyxvRUFBb0U7UUFrRG5ILElBQUksa0JBQWtCO1lBQ3JCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdEMsT0FBTywyQ0FBNkIsQ0FBQyxJQUFJLENBQUM7WUFDM0MsQ0FBQztZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxZQUN3QixvQkFBNEQsRUFDbkUsYUFBOEMsRUFDcEMsY0FBeUQsRUFDckUsV0FBMEMsRUFDMUIsa0JBQWlFLEVBQ2pGLFdBQTBDLEVBQ3pDLFlBQTRDLEVBQzVDLFlBQTRDLEVBQ3pDLGVBQWtELEVBQy9DLGtCQUF3RCxFQUN0RCxvQkFBNEQsRUFDbkUsYUFBOEMsRUFDN0MsY0FBZ0QsRUFDckMseUJBQXNFLEVBQy9FLGdCQUFvRCxFQUNsRCxrQkFBd0QsRUFDekQsaUJBQXNELEVBQ3RELGlCQUFzRCxFQUN2RCxnQkFBb0Q7WUFFdkUsS0FBSyxDQUFDLDZCQUEyQixDQUFDLE1BQU0sRUFBRTtnQkFDekMscUJBQXFCLEVBQUUsSUFBSTtnQkFDM0IsYUFBYSxFQUFFLDZCQUEyQixDQUFDLGVBQWU7YUFDMUQsQ0FBQyxDQUFDO1lBdkJxQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2xELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNuQixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDcEQsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDVCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQ2hFLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3hCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQzNCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3hCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUM5Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3JDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDbEQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzVCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNwQiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTRCO1lBQzlELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDakMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN4QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ3JDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDdEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQTNFdkQsY0FBUyxHQUFHLElBQUk7Z0JBaUJoQyxZQUE2QixRQUFxQyxFQUFFLGFBQTZCO29CQUFwRSxhQUFRLEdBQVIsUUFBUSxDQUE2QjtvQkFmbEUsV0FBTSxHQUFtRCxTQUFTLENBQUM7b0JBSW5FLGdCQUFXLEdBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BELG1CQUFjLEdBQW9DLFNBQVMsQ0FBQztvQkFFNUQsdUJBQWtCLEdBQXVCLFNBQVMsQ0FBQztvQkFDbkQsZUFBVSxHQUF1QixTQUFTLENBQUM7b0JBQzNDLGNBQVMsR0FBdUIsU0FBUyxDQUFDO29CQUUxQyxvQkFBZSxHQUF3RCxTQUFTLENBQUM7b0JBRWpGLHNCQUFpQixHQUF3QixTQUFTLENBQUM7b0JBR2xELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSw2QkFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUMzRCxDQUFDO2dCQUVELEdBQUcsQ0FBQyxNQUEwQztvQkFFN0Msc0JBQXNCO29CQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztvQkFDckIsYUFBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFO3dCQUNqQyxJQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7NEJBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsdUVBQXVFO3dCQUNqRyxDQUFDO29CQUNGLENBQUMsQ0FBQyxDQUFDO29CQUVILFNBQVM7b0JBQ1QsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztvQkFDakQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7d0JBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO3dCQUMzRCxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3hDLENBQUM7b0JBRUQsUUFBUTtvQkFDUixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7b0JBQzNDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO29CQUM1QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztvQkFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzlCLENBQUM7YUFDRCxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFvUzVCLHdCQUF3QjtZQUVQLHVDQUFrQyxHQUFHLElBQUksd0NBQTJCLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQWdEakgsWUFBWTtZQUdaLHFCQUFxQjtZQUVKLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBUSw2QkFBMkIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFFaEgscUJBQWdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQkFBWSxDQUFDLENBQUM7WUF1UDNGLFlBQVk7WUFFWixxQ0FBcUM7WUFFcEIsaUJBQVksR0FBRyxJQUFJLFdBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxtQkFBUSxDQUFDLEVBQUUsQ0FBdUIsd0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBZ0QxRyxZQUFZO1lBRVosd0NBQXdDO1lBRWhDLGdDQUEyQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywrQ0FBMEIsQ0FBQyxDQUFDLENBQUM7WUFxQjNILFlBQVk7WUFHWix1RUFBdUU7WUFFdEQsNkJBQXdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxxREFBNkIsQ0FBQyxDQUFDO1FBbm9CcEgsQ0FBQztRQUVELElBQVksYUFBYTtZQUN4QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFpQyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7WUFDM0csTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBaUMsQ0FBQyxNQUFNLENBQUM7WUFDaEcsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFzQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7WUFFdkgsT0FBTztnQkFDTixnQkFBZ0IsRUFBRSxDQUFDLFlBQVksRUFBRSwwQkFBMEIsSUFBSSxDQUFDLFlBQVksRUFBRSxhQUFhO2dCQUMzRix1QkFBdUIsRUFBRSxZQUFZLEVBQUUsdUJBQXVCO2dCQUM5RCxjQUFjLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxjQUFjO2dCQUN0RCxjQUFjLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxjQUFjO2dCQUN0RCxzQkFBc0IsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlO2dCQUN2RSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsYUFBYTthQUM5QyxDQUFDO1FBQ0gsQ0FBQztRQUVRLE9BQU8sQ0FBQyxNQUEwQyxFQUFFLEtBQXdCLEVBQUUsVUFBa0Q7WUFDeEksTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFMUMscUNBQXFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTNCLHdEQUF3RDtZQUN4RCxNQUFNLDJCQUEyQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFDN0UsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO2dCQUU3Qyx3QkFBd0I7Z0JBQ3hCLDJCQUEyQixDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7Z0JBRTlDLGdEQUFnRDtnQkFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQ2xDLElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDdkMsMkJBQTJCLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0UsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSix3REFBd0Q7WUFDeEQsd0RBQXdEO1lBQ3hELHdEQUF3RDtZQUN4RCx3REFBd0Q7WUFDeEQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtnQkFDM0QsSUFBSSxNQUFNLEtBQUssaUNBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxQyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLGVBQWU7WUFDZixXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBRTFELE9BQU8sV0FBVyxDQUFDO1FBQ3BCLENBQUM7UUFFTyw0QkFBNEIsQ0FBQyxJQUF3QztZQUM1RSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQztZQUNyRCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDcEYsT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLHlDQUF5QztZQUNsRSxDQUFDO1lBRUQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDO1lBQ3ZFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUMxQixPQUFPLHNCQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsdURBQXVEO1lBQ2hGLENBQUM7WUFFRCwrREFBK0Q7WUFDL0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFckMsU0FBUztZQUNULG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyw0QkFBb0IsQ0FBQztZQUVqRixXQUFXO1lBQ1gsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRWhFLE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVTLFNBQVMsQ0FBQyxjQUFzQixFQUFFLFdBQTRCLEVBQUUsS0FBd0IsRUFBRSxVQUFrRDtZQUVySixxRUFBcUU7WUFDckUsbUVBQW1FO1lBQ25FLE1BQU0sZUFBZSxHQUFHLElBQUEsK0JBQXNCLEVBQUMsY0FBYyxFQUFFLENBQUMscURBQTZCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUV2Ryx1Q0FBdUM7WUFDdkMsSUFBSSxNQUFjLENBQUM7WUFDbkIsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7WUFDakMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE1BQU0sR0FBRyxjQUFjLENBQUM7WUFDekIsQ0FBQztZQUVELHlCQUF5QjtZQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxlQUFlLEVBQUUsS0FBSyxDQUFDO1lBRWxELDhEQUE4RDtZQUM5RCwrREFBK0Q7WUFDL0QsaUVBQWlFO1lBQ2pFLDhEQUE4RDtZQUM5RCxJQUFJLGNBQWMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixJQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNsRyxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCwwQkFBMEI7WUFDMUIsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztZQUM3RCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHLGNBQWMsQ0FBQztZQUNuRCxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFFbkMscURBQXFEO1lBQ3JELDBEQUEwRDtZQUMxRCwwREFBMEQ7WUFDMUQseURBQXlEO1lBQ3pELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztZQUMzQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsSUFBSSxLQUFLLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ3pCLE1BQU0sd0JBQXdCLEdBQUcsMkJBQTJCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pFLE1BQU0sb0NBQW9DLEdBQUcsVUFBVSxLQUFLLDZCQUEyQixDQUFDLGVBQWUsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLHFEQUE2QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckssSUFBSSxDQUFDLHdCQUF3QixJQUFJLENBQUMsb0NBQW9DLEVBQUUsQ0FBQztvQkFDeEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUc7d0JBQ2hDLEtBQUssRUFBRSxLQUFLO3dCQUNaLE1BQU0sRUFBRSxVQUFVO3FCQUNsQixDQUFDO2dCQUNILENBQUM7WUFDRixDQUFDO1lBRUQsbUVBQW1FO1lBQ25FLGtFQUFrRTtZQUNsRSxpRUFBaUU7WUFDakUsc0VBQXNFO1lBQ3RFLHFFQUFxRTtZQUNyRSxrRUFBa0U7WUFDbEUsZ0VBQWdFO1lBQ2hFLHlEQUF5RDtZQUN6RCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsd0JBQXdCLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEssQ0FBQztRQUVPLFVBQVUsQ0FDakIsTUFBYyxFQUNkLE9BQXNGLEVBQ3RGLFdBQTRCLEVBQzVCLEtBQXdCO1lBRXhCLE1BQU0sS0FBSyxHQUFHLElBQUEsMEJBQVksRUFBQyxNQUFNLENBQUMsQ0FBQztZQUVuQyxtRUFBbUU7WUFDbkUseURBQXlEO1lBQ3pELHdEQUF3RDtZQUN4RCxJQUFJLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2dCQUN0QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLGlCQUFpQixFQUFFLENBQUM7b0JBQ3ZCLE9BQU8saUJBQWlCLENBQUM7Z0JBQzFCLENBQUM7WUFDRixDQUFDO1lBRUQsdUVBQXVFO1lBQ3ZFLG1FQUFtRTtZQUNuRSxtREFBbUQ7WUFDbkQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELElBQUksMkJBQTJCLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDL0UsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQztZQUN2QyxDQUFDO1lBRUQsaUVBQWlFO1lBQ2pFLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTdELElBQUksS0FBMEQsQ0FBQztZQUMvRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDdEMsS0FBSyxHQUFHLGtCQUFrQixDQUFDO1lBQzVCLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNYLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELENBQUM7Z0JBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ3JDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSxpQkFBaUIsQ0FBQyxFQUF5QixDQUFDLENBQUM7b0JBQ3hILEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNuQyxDQUFDO1lBQ0YsQ0FBQztZQUVELE9BQU87Z0JBRU4sa0RBQWtEO2dCQUNsRCxLQUFLO2dCQUVMLGdDQUFnQztnQkFDaEMsZUFBZSxFQUFFLENBQUMsS0FBSyxJQUE0QyxFQUFFO29CQUVwRSwrREFBK0Q7b0JBQy9ELE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxpQkFBVyxFQUFXLENBQUM7b0JBQzNELEtBQUssTUFBTSxpQkFBaUIsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO3dCQUNwRCxJQUFJLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUNoQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUMvRCxDQUFDO29CQUNGLENBQUM7b0JBRUQsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUM3RixJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO3dCQUNuQyxPQUFPLEVBQUUsQ0FBQztvQkFDWCxDQUFDO29CQUVELE9BQU8sZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNuQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQywrQkFBK0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxjQUFjLENBQUMsRUFBRTt3QkFDekwsR0FBRyxlQUFlO3FCQUNsQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ1IsQ0FBQyxDQUFDLEVBQUU7Z0JBRUosa0VBQWtFO2dCQUNsRSxVQUFVLEVBQUUsNkJBQTJCLENBQUMsd0JBQXdCO2FBQ2hFLENBQUM7UUFDSCxDQUFDO1FBRU8sS0FBSyxDQUFDLGtCQUFrQixDQUFDLEtBQXFCLEVBQUUsUUFBOEIsRUFBRSxLQUF3QjtZQUUvRyw2Q0FBNkM7WUFDN0MsTUFBTSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO2FBQzFDLENBQUMsQ0FBQztZQUVILElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25DLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUVELHlDQUF5QztZQUN6QyxNQUFNLG1CQUFtQixHQUFHLElBQUEsWUFBRyxFQUM5QixDQUFDLEdBQUcsU0FBUyxFQUFFLEdBQUcsV0FBVyxDQUFDLEVBQzlCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBQSxzQ0FBd0IsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsd0NBQTJCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFDMUksNkJBQTJCLENBQUMsV0FBVyxDQUN2QyxDQUFDO1lBRUYsb0JBQW9CO1lBQ3BCLE1BQU0scUJBQXFCLEdBQTZCLEVBQUUsQ0FBQztZQUMzRCxLQUFLLE1BQU0sWUFBWSxJQUFJLG1CQUFtQixFQUFFLENBQUM7Z0JBRWhELHdFQUF3RTtnQkFDeEUsSUFBSSxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzdCLHFCQUFxQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUMsQ0FBQztnQkFFRCw4Q0FBOEM7cUJBQ3pDLENBQUM7b0JBQ0wsTUFBTSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxJQUFBLDRCQUFjLEVBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsd0NBQTJCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDbkosSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNaLFNBQVM7b0JBQ1YsQ0FBQztvQkFFRCxZQUFZLENBQUMsVUFBVSxHQUFHO3dCQUN6QixLQUFLLEVBQUUsVUFBVTt3QkFDakIsV0FBVyxFQUFFLGdCQUFnQjtxQkFDN0IsQ0FBQztvQkFFRixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzFDLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxxQkFBcUIsQ0FBQztRQUM5QixDQUFDO1FBT08scUJBQXFCLENBQUMsS0FBcUI7WUFDbEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUV6QyxtREFBbUQ7WUFDbkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN2RyxDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLE9BQU8sRUFBRSxDQUFDLENBQUMsMEJBQTBCO1lBQ3RDLENBQUM7WUFFRCxvQkFBb0I7WUFDcEIsTUFBTSwyQkFBMkIsR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLHdDQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQywrRUFBK0U7WUFDeE4sTUFBTSxrQkFBa0IsR0FBa0MsRUFBRSxDQUFDO1lBQzdELEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO2dCQUN2RCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxvREFBb0Q7Z0JBQ3BELElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7b0JBQ2xKLFNBQVMsQ0FBQyx1RUFBdUU7Z0JBQ2xGLENBQUM7Z0JBRUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUV6RSxNQUFNLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLElBQUEsNEJBQWMsRUFBQyxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3pKLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDWixTQUFTLENBQUMscUNBQXFDO2dCQUNoRCxDQUFDO2dCQUVELGlCQUFpQixDQUFDLFVBQVUsR0FBRztvQkFDOUIsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLFdBQVcsRUFBRSxnQkFBZ0I7aUJBQzdCLENBQUM7Z0JBRUYsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUVELDZEQUE2RDtZQUM3RCxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsc0JBQXNCLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzdELE9BQU8sa0JBQWtCLENBQUM7WUFDM0IsQ0FBQztZQUVELGtCQUFrQjtZQUNsQixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUEsc0NBQXdCLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6SyxDQUFDO1FBV08sb0JBQW9CO1lBQzNCLE9BQU8sSUFBSSxnQ0FBbUIsQ0FDN0IsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFDMUgsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFDN0MsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQzdCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDVixDQUFDO1FBRU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFxQixFQUFFLFFBQThCLEVBQUUsS0FBd0I7WUFDekcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBRUQsdUJBQXVCO1lBQ3ZCLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlFLElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25DLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUVELHNEQUFzRDtZQUN0RCxJQUFJLFdBQXVCLENBQUM7WUFDNUIsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO2dCQUN4QixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO29CQUN0QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFdBQVc7Z0JBQ3ZCLENBQUM7Z0JBRUQsMERBQTBEO2dCQUMxRCxzREFBc0Q7Z0JBQ3RELHlEQUF5RDtnQkFDekQsMERBQTBEO2dCQUMxRCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3pGLGdCQUFnQixDQUFDLFVBQVUsR0FBRztvQkFDN0IsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3pELFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztpQkFDaEgsQ0FBQztnQkFFRixPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMzQixDQUFDO1lBRUQsMkVBQTJFO1lBQzNFLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsUUFBUSxFQUFFLENBQUM7Z0JBQzdDLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JELENBQUM7aUJBQU0sQ0FBQztnQkFDUCxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUM1RCxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO3dCQUNuQyxPQUFPLEVBQUUsQ0FBQztvQkFDWCxDQUFDO29CQUVELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25DLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUVELHFDQUFxQztZQUNyQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3pDLE9BQU8sV0FBVztpQkFDaEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMzQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUVPLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBcUIsRUFBRSxLQUF3QjtZQUN6RSxNQUFNLENBQUMsaUJBQWlCLEVBQUUsdUJBQXVCLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBRXRFLDJGQUEyRjtnQkFDM0YsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7Z0JBRXZDLCtGQUErRjtnQkFDL0Ysa0dBQWtHO2dCQUNsRyxrR0FBa0c7Z0JBQ2xHLFlBQVk7Z0JBQ1osSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7YUFDN0MsQ0FBQyxDQUFDO1lBRUgsSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFDbkMsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBRUQsb0RBQW9EO1lBQ3BELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUM5QixPQUFPLGlCQUFpQixDQUFDO1lBQzFCLENBQUM7WUFFRCw0REFBNEQ7WUFDNUQsMkNBQTJDO1lBQzNDLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxpQkFBVyxFQUFXLENBQUM7WUFDOUQsS0FBSyxNQUFNLHNCQUFzQixJQUFJLHVCQUF1QixFQUFFLENBQUM7Z0JBQzlELDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBRUQsT0FBTztnQkFDTixHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5RSxHQUFHLHVCQUF1QjthQUMxQixDQUFDO1FBQ0gsQ0FBQztRQUVPLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFxQixFQUFFLEtBQXdCO1lBRWpGLG9FQUFvRTtZQUNwRSw4RkFBOEY7WUFDOUYsZ0RBQWdEO1lBQ2hELEVBQUU7WUFDRiwwRUFBMEU7WUFDMUUsNEVBQTRFO1lBQzVFLEVBQUU7WUFDRixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM3QyxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDeEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFdBQVcsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQzlCLENBQUM7WUFFRCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRixJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUNuQyxPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFFRCxzRUFBc0U7WUFDdEUseUVBQXlFO1lBQ3pFLHNFQUFzRTtZQUN0RSwrREFBK0Q7WUFDL0QsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDM0UsTUFBTSwyQkFBMkIsR0FBRyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM3RixJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO29CQUNuQyxPQUFPLEVBQUUsQ0FBQztnQkFDWCxDQUFDO2dCQUVELDJDQUEyQztnQkFDM0MsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLGlCQUFXLEVBQVcsQ0FBQztnQkFDaEUsS0FBSyxNQUFNLGdCQUFnQixJQUFJLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUMxRCw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuRSxDQUFDO2dCQUVELCtEQUErRDtnQkFDL0QsS0FBSyxNQUFNLDBCQUEwQixJQUFJLDJCQUEyQixDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUM5RSxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7d0JBQzVFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztvQkFDNUQsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVELE9BQU8saUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRU8sc0JBQXNCLENBQUMsV0FBbUIsRUFBRSxLQUF3QjtZQUMzRSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUNuQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUN6QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFDMUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO2dCQUN4QixXQUFXO2dCQUNYLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxRQUFRO2dCQUNqRCxVQUFVLEVBQUUsNkJBQTJCLENBQUMsV0FBVzthQUNuRCxDQUFDLENBQ0YsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNaLENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxLQUF1RTtZQUNsRyxPQUFPO2dCQUNOLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxxQ0FBcUM7Z0JBQ2pFLGtCQUFrQixFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUNBQWdDLENBQUM7Z0JBQzlGLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVyxJQUFJLEVBQUU7Z0JBQ3BDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtnQkFDeEIsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQztnQkFDakMsV0FBVyxFQUFFLElBQUk7YUFDakIsQ0FBQztRQUNILENBQUM7UUFFTyxLQUFLLENBQUMseUJBQXlCLENBQUMsS0FBcUIsRUFBRSxLQUF3QjtZQUN0RixJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ2xDLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxrQkFBUyxFQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZILElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25DLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN2RixJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUNuQyxPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksbUJBQW1CLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxRQUFRLEdBQUcsSUFBQSwyQkFBZSxFQUMvQixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQ2hELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQ2pDLENBQUM7Z0JBRUYsSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztvQkFDbkMsT0FBTztnQkFDUixDQUFDO2dCQUVELElBQUksQ0FBQztvQkFDSixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNwRCxPQUFPLFFBQVEsQ0FBQztvQkFDakIsQ0FBQztnQkFDRixDQUFDO2dCQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7b0JBQ2hCLGdDQUFnQztnQkFDakMsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPO1FBQ1IsQ0FBQztRQUVPLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxLQUFxQixFQUFFLEtBQXdCO1lBQ3ZGLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDbEMsT0FBTztZQUNSLENBQUM7WUFFRCw2RUFBNkU7WUFDN0UseURBQXlEO1lBQ3pELE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxTQUFTLEdBQVUsRUFBRSxDQUFDO2dCQUM1QixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2pFLElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7d0JBQ25DLE1BQU07b0JBQ1AsQ0FBQztvQkFFRCxNQUFNLFFBQVEsR0FBRyxJQUFBLDJCQUFlLEVBQy9CLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNqQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUNqQyxDQUFDO29CQUVGLElBQUksQ0FBQzt3QkFDSixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDOzRCQUNwRCxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUMxQixDQUFDO29CQUNGLENBQUM7b0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQzt3QkFDaEIsZ0NBQWdDO29CQUNqQyxDQUFDO2dCQUNGLENBQUM7Z0JBRUQsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUVELE9BQU87UUFDUixDQUFDO1FBUU8sWUFBWSxDQUFDLEtBQXFCLEVBQUUsS0FBd0IsRUFBRSxVQUFrRDtZQUN2SCxJQUFJLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdEIsT0FBTyxFQUFFLENBQUMsQ0FBQyw4Q0FBOEM7WUFDMUQsQ0FBQztZQUdELE1BQU0sU0FBUyxHQUFpQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRTtpQkFDL0YsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEtBQUssU0FBUyxDQUFDLENBQUM7aUJBQ3hFLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXO2lCQUN2QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEtBQUssU0FBUyxDQUFDO2lCQUMvQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2hCLE1BQU0sdUJBQXVCLEdBQXNEO29CQUNsRixHQUFHLFVBQVU7b0JBQ2IsV0FBVyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEtBQUssNkJBQTJCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxXQUFXO2lCQUNyRyxDQUFDO2dCQUVGLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsSUFBSSxTQUFTLENBQUMsV0FBWSxDQUFDO2dCQUNyRSxPQUFPO29CQUNOLEtBQUs7b0JBQ0wsV0FBVyxFQUFFLFNBQVMsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLE1BQU07b0JBQ2hELGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxrQkFBbUI7b0JBQ2pELFVBQVUsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO29CQUMxRyxTQUFTLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDO29CQUNsRixNQUFNLEVBQUUsR0FBRyxFQUFFO3dCQUNaLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7NEJBQ3hELGFBQWEsRUFBRSxJQUFJOzRCQUNuQixlQUFlLEVBQUUsdUJBQXVCO3lCQUN4QyxDQUFDLENBQUM7b0JBQ0osQ0FBQztpQkFDRCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVOLG1IQUFtSDtZQUNuSCxvREFBb0Q7WUFDcEQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25DLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0JBQ2QsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQztvQkFDMUMsa0JBQWtCLEVBQUUsRUFBRTtvQkFDdEIsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxvREFBNEIsQ0FBQztvQkFDakYsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7aUJBQzVDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDOUUsQ0FBQztRQVFPLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxLQUFxQixFQUFFLEtBQXdCO1lBQ3BGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDekMsSUFDQyxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksaUNBQWlDO2dCQUN0RCxDQUFDLGFBQWEsQ0FBQyxjQUFjLElBQUssc0NBQXNDO2dCQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBSSx1REFBdUQ7Y0FDbEYsQ0FBQztnQkFDRixPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFFRCxnREFBZ0Q7WUFDaEQsK0NBQStDO1lBQy9DLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO2dCQUN0RSxTQUFTLEVBQUUsSUFBSTtnQkFDZixXQUFXLEVBQUUsSUFBSTtnQkFDakIsS0FBSyxFQUFFLDZCQUEyQixDQUFDLG1CQUFtQjthQUN0RCxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQVNPLG9CQUFvQixDQUFDLEtBQXFCLEVBQUUsV0FBNEIsRUFBRSxLQUF3QjtZQUN6RyxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxxREFBNkIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRixNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN4RyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNoQyxPQUFPLElBQUksQ0FBQyxDQUFDLG9EQUFvRDtZQUNsRSxDQUFDO1lBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUM7WUFDaEUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDLENBQUMsb0RBQW9EO1lBQ2xFLENBQUM7WUFFRCxNQUFNLG9CQUFvQixHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztZQUN2RCxJQUFJLENBQUMsb0JBQW9CLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksb0JBQW9CLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDeEksT0FBTyxJQUFJLENBQUMsQ0FBQyx5Q0FBeUM7WUFDdkQsQ0FBQztZQUVELElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxxREFBNkIsQ0FBQyxNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLHFEQUE2QixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQzNKLElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDL0IsT0FBTyxJQUFJLENBQUMsQ0FBQyxpRkFBaUY7Z0JBQy9GLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RyxDQUFDO1FBRU8sS0FBSyxDQUFDLHNCQUFzQixDQUFDLGdCQUF3QyxFQUFFLG9CQUF5QixFQUFFLE1BQWMsRUFBRSxXQUE0QixFQUFFLEtBQXdCO1lBRS9LLHVEQUF1RDtZQUN2RCxJQUFJLENBQUM7Z0JBRUosK0RBQStEO2dCQUMvRCxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFFckMsVUFBVTtnQkFDVixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDO29CQUNuQyxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixPQUFPLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTtpQkFDekUsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sRUFBRSxDQUFDLENBQUMsc0NBQXNDO1lBQ2xELENBQUM7WUFFRCxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUNuQyxPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFFRCw2QkFBNkI7WUFDN0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ1osSUFBSSxDQUFDO29CQUNKLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO29CQUMvRyxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO3dCQUNuQyxPQUFPLEVBQUUsQ0FBQztvQkFDWCxDQUFDO29CQUVELEtBQUssR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztnQkFDL0MsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNoQixPQUFPLEVBQUUsQ0FBQyxDQUFDLHFDQUFxQztnQkFDakQsQ0FBQztZQUNGLENBQUM7WUFFRCxrQ0FBa0M7WUFDbEMsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsSUFBQSx1QkFBVSxFQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0ssSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFDbkMsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBRUQsT0FBTyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFFL0Msc0JBQXNCO2dCQUN0QixJQUFJLGdCQUFnQixDQUFDLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQztvQkFDM0MsT0FBTyxnQkFBZ0IsQ0FBQztnQkFDekIsQ0FBQztnQkFFRCwwQ0FBMEM7Z0JBQzFDLE9BQU87b0JBQ04sR0FBRyxnQkFBZ0I7b0JBQ25CLFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXO29CQUN6QyxPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLEVBQUU7d0JBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFFMUgsT0FBTyxpQ0FBYSxDQUFDLFlBQVksQ0FBQztvQkFDbkMsQ0FBQztvQkFDRCxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQzlMLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxjQUFjLENBQUMsTUFBZSxFQUFFLEtBQWE7WUFDNUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELGdCQUFnQixDQUFDLE1BQWU7WUFDL0IsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxZQUFZO1FBR1osaUJBQWlCO1FBRVQsa0JBQWtCLENBQUMsZ0JBQTBELEVBQUUsYUFBd0U7WUFDOUosTUFBTSxvQkFBb0IsR0FBRyxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUUxRCxJQUFJLFFBQXlCLENBQUM7WUFDOUIsSUFBSSxLQUFhLENBQUM7WUFDbEIsSUFBSSxXQUFXLEdBQXVCLFNBQVMsQ0FBQztZQUNoRCxJQUFJLE9BQU8sR0FBd0IsU0FBUyxDQUFDO1lBQzdDLElBQUksWUFBc0IsQ0FBQztZQUMzQixJQUFJLElBQUksR0FBMEIsU0FBUyxDQUFDO1lBRTVDLElBQUksSUFBQSxzQkFBYSxFQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztnQkFDckMsUUFBUSxHQUFHLCtCQUFzQixDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNuRSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25DLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDaEQsT0FBTyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3JFLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUN2RCxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbkMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFFBQVEsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7Z0JBQ3RGLEtBQUssR0FBRyxJQUFBLCtCQUFtQixFQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0QyxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBQSxtQkFBTyxFQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ25GLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2SCxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQ25CLENBQUM7WUFFRCxNQUFNLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUU1RSxNQUFNLGdCQUFnQixHQUFHLElBQUksV0FBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUEsK0JBQWMsRUFBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUVqSixNQUFNLFlBQVksR0FBRyxJQUFJLFdBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xDLE1BQU0sdUJBQXVCLEdBQUcsYUFBYSxDQUFDLHVCQUF1QixDQUFDO2dCQUN0RSxNQUFNLE9BQU8sR0FBd0IsRUFBRSxDQUFDO2dCQUV4Qyx1QkFBdUI7Z0JBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ1osU0FBUyxFQUFFLHVCQUF1QixLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxhQUFhLENBQUM7b0JBQzlJLE9BQU8sRUFBRSx1QkFBdUIsS0FBSyxPQUFPLENBQUMsQ0FBQzt3QkFDN0MsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDLHlEQUF5RCxDQUFDLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7d0JBQzNILElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxnREFBZ0QsQ0FBQyxFQUFFLEVBQUUsb0JBQW9CLENBQUM7aUJBQ3JILENBQUMsQ0FBQztnQkFFSCxzQkFBc0I7Z0JBQ3RCLElBQUksb0JBQW9CLEVBQUUsQ0FBQztvQkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQzt3QkFDWixTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixHQUFHLHFCQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxLQUFLLENBQUM7d0JBQzdILE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsNkJBQTZCLENBQUM7d0JBQy9ELGFBQWEsRUFBRSxPQUFPO3FCQUN0QixDQUFDLENBQUM7Z0JBQ0osQ0FBQztnQkFFRCxPQUFPLE9BQU8sQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU87Z0JBQ04sUUFBUTtnQkFDUixLQUFLO2dCQUNMLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLHdCQUF3QixFQUFFLHFCQUFxQixFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQjtnQkFDekgsV0FBVztnQkFDWCxJQUFJLFdBQVcsS0FBSyxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELElBQUksT0FBTyxLQUFLLE9BQU8sWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsRUFBRTtvQkFDakMsUUFBUSxXQUFXLEVBQUUsQ0FBQzt3QkFFckIsdUJBQXVCO3dCQUN2QixLQUFLLENBQUM7NEJBQ0wsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzs0QkFFN0csT0FBTyxpQ0FBYSxDQUFDLFlBQVksQ0FBQzt3QkFFbkMsc0JBQXNCO3dCQUN0QixLQUFLLENBQUM7NEJBQ0wsSUFBSSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO2dDQUNsQyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0NBRXhELE9BQU8saUNBQWEsQ0FBQyxXQUFXLENBQUM7NEJBQ2xDLENBQUM7b0JBQ0gsQ0FBQztvQkFFRCxPQUFPLGlDQUFhLENBQUMsU0FBUyxDQUFDO2dCQUNoQyxDQUFDO2dCQUNELE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDakwsQ0FBQztRQUNILENBQUM7UUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLGdCQUEwRCxFQUFFLE9BQThIO1lBRXBOLHdEQUF3RDtZQUN4RCxNQUFNLGFBQWEsR0FBdUI7Z0JBQ3pDLGFBQWEsRUFBRSxPQUFPLENBQUMsYUFBYTtnQkFDcEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0I7Z0JBQzlGLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUzthQUMzRSxDQUFDO1lBRUYsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQywwQkFBVSxDQUFDLENBQUMsQ0FBQyw0QkFBWSxDQUFDO1lBRXpLLHlEQUF5RDtZQUN6RCxJQUFJLFdBQVcsS0FBSywwQkFBVSxFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEQsQ0FBQztZQUVELHNCQUFzQjtZQUN0QixJQUFJLElBQUEsc0JBQWEsRUFBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ25GLENBQUM7WUFFRCx3QkFBd0I7aUJBQ25CLENBQUM7Z0JBQ0wsSUFBSSxtQkFBeUMsQ0FBQztnQkFDOUMsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztvQkFDakMsbUJBQW1CLEdBQUc7d0JBQ3JCLFFBQVEsRUFBRSxnQkFBZ0I7d0JBQzFCLE9BQU8sRUFBRSxhQUFhO3FCQUN0QixDQUFDO2dCQUNILENBQUM7cUJBQU0sQ0FBQztvQkFDUCxtQkFBbUIsR0FBRzt3QkFDckIsR0FBRyxnQkFBZ0I7d0JBQ25CLE9BQU8sRUFBRTs0QkFDUixHQUFHLGdCQUFnQixDQUFDLE9BQU87NEJBQzNCLEdBQUcsYUFBYTt5QkFDaEI7cUJBQ0QsQ0FBQztnQkFDSCxDQUFDO2dCQUVELE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkUsQ0FBQztRQUNGLENBQUM7O0lBeDhCVyxrRUFBMkI7MENBQTNCLDJCQUEyQjtRQXVFckMsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHVCQUFjLENBQUE7UUFDZCxXQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFdBQUEsMEJBQVksQ0FBQTtRQUNaLFdBQUEsaURBQTRCLENBQUE7UUFDNUIsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFlBQUEscUNBQXFCLENBQUE7UUFDckIsWUFBQSw4QkFBYyxDQUFBO1FBQ2QsWUFBQSx5QkFBZSxDQUFBO1FBQ2YsWUFBQSxzREFBMEIsQ0FBQTtRQUMxQixZQUFBLG1DQUFpQixDQUFBO1FBQ2pCLFlBQUEsaUNBQW1CLENBQUE7UUFDbkIsWUFBQSwrQkFBa0IsQ0FBQTtRQUNsQixZQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFlBQUEsd0JBQWlCLENBQUE7T0F6RlAsMkJBQTJCLENBMjhCdkMifQ==
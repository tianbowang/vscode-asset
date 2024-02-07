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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/stopwatch", "vs/base/common/types", "vs/editor/common/services/model", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchHelpers"], function (require, exports, arrays, async_1, errors_1, lifecycle_1, map_1, network_1, stopwatch_1, types_1, model_1, files_1, log_1, telemetry_1, uriIdentity_1, editor_1, editorService_1, extensions_1, search_1, searchHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchService = void 0;
    let SearchService = class SearchService extends lifecycle_1.Disposable {
        constructor(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService) {
            super();
            this.modelService = modelService;
            this.editorService = editorService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.extensionService = extensionService;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.fileSearchProviders = new Map();
            this.textSearchProviders = new Map();
            this.deferredFileSearchesByScheme = new Map();
            this.deferredTextSearchesByScheme = new Map();
            this.loggedSchemesMissingProviders = new Set();
        }
        registerSearchResultProvider(scheme, type, provider) {
            let list;
            let deferredMap;
            if (type === 0 /* SearchProviderType.file */) {
                list = this.fileSearchProviders;
                deferredMap = this.deferredFileSearchesByScheme;
            }
            else if (type === 1 /* SearchProviderType.text */) {
                list = this.textSearchProviders;
                deferredMap = this.deferredTextSearchesByScheme;
            }
            else {
                throw new Error('Unknown SearchProviderType');
            }
            list.set(scheme, provider);
            if (deferredMap.has(scheme)) {
                deferredMap.get(scheme).complete(provider);
                deferredMap.delete(scheme);
            }
            return (0, lifecycle_1.toDisposable)(() => {
                list.delete(scheme);
            });
        }
        async textSearch(query, token, onProgress) {
            const results = this.textSearchSplitSyncAsync(query, token, onProgress);
            const openEditorResults = results.syncResults;
            const otherResults = await results.asyncResults;
            return {
                limitHit: otherResults.limitHit || openEditorResults.limitHit,
                results: [...otherResults.results, ...openEditorResults.results],
                messages: [...otherResults.messages, ...openEditorResults.messages]
            };
        }
        textSearchSplitSyncAsync(query, token, onProgress, notebookFilesToIgnore, asyncNotebookFilesToIgnore) {
            // Get open editor results from dirty/untitled
            const openEditorResults = this.getOpenEditorResults(query);
            if (onProgress) {
                arrays.coalesce([...openEditorResults.results.values()]).filter(e => !(notebookFilesToIgnore && notebookFilesToIgnore.has(e.resource))).forEach(onProgress);
            }
            const syncResults = {
                results: arrays.coalesce([...openEditorResults.results.values()]),
                limitHit: openEditorResults.limitHit ?? false,
                messages: []
            };
            const getAsyncResults = async () => {
                const resolvedAsyncNotebookFilesToIgnore = await asyncNotebookFilesToIgnore ?? new map_1.ResourceSet();
                const onProviderProgress = (progress) => {
                    if ((0, search_1.isFileMatch)(progress)) {
                        // Match
                        if (!openEditorResults.results.has(progress.resource) && !resolvedAsyncNotebookFilesToIgnore.has(progress.resource) && onProgress) { // don't override open editor results
                            onProgress(progress);
                        }
                    }
                    else if (onProgress) {
                        // Progress
                        onProgress(progress);
                    }
                    if ((0, search_1.isProgressMessage)(progress)) {
                        this.logService.debug('SearchService#search', progress.message);
                    }
                };
                return await this.doSearch(query, token, onProviderProgress);
            };
            return {
                syncResults,
                asyncResults: getAsyncResults()
            };
        }
        fileSearch(query, token) {
            return this.doSearch(query, token);
        }
        doSearch(query, token, onProgress) {
            this.logService.trace('SearchService#search', JSON.stringify(query));
            const schemesInQuery = this.getSchemesInQuery(query);
            const providerActivations = [Promise.resolve(null)];
            schemesInQuery.forEach(scheme => providerActivations.push(this.extensionService.activateByEvent(`onSearch:${scheme}`)));
            providerActivations.push(this.extensionService.activateByEvent('onSearch:file'));
            const providerPromise = (async () => {
                await Promise.all(providerActivations);
                await this.extensionService.whenInstalledExtensionsRegistered();
                // Cancel faster if search was canceled while waiting for extensions
                if (token && token.isCancellationRequested) {
                    return Promise.reject(new errors_1.CancellationError());
                }
                const progressCallback = (item) => {
                    if (token && token.isCancellationRequested) {
                        return;
                    }
                    onProgress?.(item);
                };
                const exists = await Promise.all(query.folderQueries.map(query => this.fileService.exists(query.folder)));
                query.folderQueries = query.folderQueries.filter((_, i) => exists[i]);
                let completes = await this.searchWithProviders(query, progressCallback, token);
                completes = arrays.coalesce(completes);
                if (!completes.length) {
                    return {
                        limitHit: false,
                        results: [],
                        messages: [],
                    };
                }
                return {
                    limitHit: completes[0] && completes[0].limitHit,
                    stats: completes[0].stats,
                    messages: arrays.coalesce(arrays.flatten(completes.map(i => i.messages))).filter(arrays.uniqueFilter(message => message.type + message.text + message.trusted)),
                    results: arrays.flatten(completes.map((c) => c.results))
                };
            })();
            return new Promise((resolve, reject) => {
                if (token) {
                    token.onCancellationRequested(() => {
                        reject(new errors_1.CancellationError());
                    });
                }
                providerPromise.then(resolve, reject);
            });
        }
        getSchemesInQuery(query) {
            const schemes = new Set();
            query.folderQueries?.forEach(fq => schemes.add(fq.folder.scheme));
            query.extraFileResources?.forEach(extraFile => schemes.add(extraFile.scheme));
            return schemes;
        }
        async waitForProvider(queryType, scheme) {
            const deferredMap = queryType === 1 /* QueryType.File */ ?
                this.deferredFileSearchesByScheme :
                this.deferredTextSearchesByScheme;
            if (deferredMap.has(scheme)) {
                return deferredMap.get(scheme).p;
            }
            else {
                const deferred = new async_1.DeferredPromise();
                deferredMap.set(scheme, deferred);
                return deferred.p;
            }
        }
        async searchWithProviders(query, onProviderProgress, token) {
            const e2eSW = stopwatch_1.StopWatch.create(false);
            const searchPs = [];
            const fqs = this.groupFolderQueriesByScheme(query);
            const someSchemeHasProvider = [...fqs.keys()].some(scheme => {
                return query.type === 1 /* QueryType.File */ ?
                    this.fileSearchProviders.has(scheme) :
                    this.textSearchProviders.has(scheme);
            });
            await Promise.all([...fqs.keys()].map(async (scheme) => {
                const schemeFQs = fqs.get(scheme);
                let provider = query.type === 1 /* QueryType.File */ ?
                    this.fileSearchProviders.get(scheme) :
                    this.textSearchProviders.get(scheme);
                if (!provider) {
                    if (someSchemeHasProvider) {
                        if (!this.loggedSchemesMissingProviders.has(scheme)) {
                            this.logService.warn(`No search provider registered for scheme: ${scheme}. Another scheme has a provider, not waiting for ${scheme}`);
                            this.loggedSchemesMissingProviders.add(scheme);
                        }
                        return;
                    }
                    else {
                        if (!this.loggedSchemesMissingProviders.has(scheme)) {
                            this.logService.warn(`No search provider registered for scheme: ${scheme}, waiting`);
                            this.loggedSchemesMissingProviders.add(scheme);
                        }
                        provider = await this.waitForProvider(query.type, scheme);
                    }
                }
                const oneSchemeQuery = {
                    ...query,
                    ...{
                        folderQueries: schemeFQs
                    }
                };
                searchPs.push(query.type === 1 /* QueryType.File */ ?
                    provider.fileSearch(oneSchemeQuery, token) :
                    provider.textSearch(oneSchemeQuery, onProviderProgress, token));
            }));
            return Promise.all(searchPs).then(completes => {
                const endToEndTime = e2eSW.elapsed();
                this.logService.trace(`SearchService#search: ${endToEndTime}ms`);
                completes.forEach(complete => {
                    this.sendTelemetry(query, endToEndTime, complete);
                });
                return completes;
            }, err => {
                const endToEndTime = e2eSW.elapsed();
                this.logService.trace(`SearchService#search: ${endToEndTime}ms`);
                const searchError = (0, search_1.deserializeSearchError)(err);
                this.logService.trace(`SearchService#searchError: ${searchError.message}`);
                this.sendTelemetry(query, endToEndTime, undefined, searchError);
                throw searchError;
            });
        }
        groupFolderQueriesByScheme(query) {
            const queries = new Map();
            query.folderQueries.forEach(fq => {
                const schemeFQs = queries.get(fq.folder.scheme) || [];
                schemeFQs.push(fq);
                queries.set(fq.folder.scheme, schemeFQs);
            });
            return queries;
        }
        sendTelemetry(query, endToEndTime, complete, err) {
            const fileSchemeOnly = query.folderQueries.every(fq => fq.folder.scheme === network_1.Schemas.file);
            const otherSchemeOnly = query.folderQueries.every(fq => fq.folder.scheme !== network_1.Schemas.file);
            const scheme = fileSchemeOnly ? network_1.Schemas.file :
                otherSchemeOnly ? 'other' :
                    'mixed';
            if (query.type === 1 /* QueryType.File */ && complete && complete.stats) {
                const fileSearchStats = complete.stats;
                if (fileSearchStats.fromCache) {
                    const cacheStats = fileSearchStats.detailStats;
                    this.telemetryService.publicLog2('cachedSearchComplete', {
                        reason: query._reason,
                        resultCount: fileSearchStats.resultCount,
                        workspaceFolderCount: query.folderQueries.length,
                        endToEndTime: endToEndTime,
                        sortingTime: fileSearchStats.sortingTime,
                        cacheWasResolved: cacheStats.cacheWasResolved,
                        cacheLookupTime: cacheStats.cacheLookupTime,
                        cacheFilterTime: cacheStats.cacheFilterTime,
                        cacheEntryCount: cacheStats.cacheEntryCount,
                        scheme
                    });
                }
                else {
                    const searchEngineStats = fileSearchStats.detailStats;
                    this.telemetryService.publicLog2('searchComplete', {
                        reason: query._reason,
                        resultCount: fileSearchStats.resultCount,
                        workspaceFolderCount: query.folderQueries.length,
                        endToEndTime: endToEndTime,
                        sortingTime: fileSearchStats.sortingTime,
                        fileWalkTime: searchEngineStats.fileWalkTime,
                        directoriesWalked: searchEngineStats.directoriesWalked,
                        filesWalked: searchEngineStats.filesWalked,
                        cmdTime: searchEngineStats.cmdTime,
                        cmdResultCount: searchEngineStats.cmdResultCount,
                        scheme
                    });
                }
            }
            else if (query.type === 2 /* QueryType.Text */) {
                let errorType;
                if (err) {
                    errorType = err.code === search_1.SearchErrorCode.regexParseError ? 'regex' :
                        err.code === search_1.SearchErrorCode.unknownEncoding ? 'encoding' :
                            err.code === search_1.SearchErrorCode.globParseError ? 'glob' :
                                err.code === search_1.SearchErrorCode.invalidLiteral ? 'literal' :
                                    err.code === search_1.SearchErrorCode.other ? 'other' :
                                        err.code === search_1.SearchErrorCode.canceled ? 'canceled' :
                                            'unknown';
                }
                this.telemetryService.publicLog2('textSearchComplete', {
                    reason: query._reason,
                    workspaceFolderCount: query.folderQueries.length,
                    endToEndTime: endToEndTime,
                    scheme,
                    error: errorType,
                });
            }
        }
        getOpenEditorResults(query) {
            const openEditorResults = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            let limitHit = false;
            if (query.type === 2 /* QueryType.Text */) {
                const canonicalToOriginalResources = new map_1.ResourceMap();
                for (const editorInput of this.editorService.editors) {
                    const canonical = editor_1.EditorResourceAccessor.getCanonicalUri(editorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    const original = editor_1.EditorResourceAccessor.getOriginalUri(editorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                    if (canonical) {
                        canonicalToOriginalResources.set(canonical, original ?? canonical);
                    }
                }
                const models = this.modelService.getModels();
                models.forEach((model) => {
                    const resource = model.uri;
                    if (!resource) {
                        return;
                    }
                    if (limitHit) {
                        return;
                    }
                    const originalResource = canonicalToOriginalResources.get(resource);
                    if (!originalResource) {
                        return;
                    }
                    // Skip search results
                    if (model.getLanguageId() === search_1.SEARCH_RESULT_LANGUAGE_ID && !(query.includePattern && query.includePattern['**/*.code-search'])) {
                        // TODO: untitled search editors will be excluded from search even when include *.code-search is specified
                        return;
                    }
                    // Block walkthrough, webview, etc.
                    if (originalResource.scheme !== network_1.Schemas.untitled && !this.fileService.hasProvider(originalResource)) {
                        return;
                    }
                    // Exclude files from the git FileSystemProvider, e.g. to prevent open staged files from showing in search results
                    if (originalResource.scheme === 'git') {
                        return;
                    }
                    if (!this.matches(originalResource, query)) {
                        return; // respect user filters
                    }
                    // Use editor API to find matches
                    const askMax = (0, types_1.isNumber)(query.maxResults) ? query.maxResults + 1 : Number.MAX_SAFE_INTEGER;
                    let matches = model.findMatches(query.contentPattern.pattern, false, !!query.contentPattern.isRegExp, !!query.contentPattern.isCaseSensitive, query.contentPattern.isWordMatch ? query.contentPattern.wordSeparators : null, false, askMax);
                    if (matches.length) {
                        if (askMax && matches.length >= askMax) {
                            limitHit = true;
                            matches = matches.slice(0, askMax - 1);
                        }
                        const fileMatch = new search_1.FileMatch(originalResource);
                        openEditorResults.set(originalResource, fileMatch);
                        const textSearchResults = (0, searchHelpers_1.editorMatchesToTextSearchResults)(matches, model, query.previewOptions);
                        fileMatch.results = (0, searchHelpers_1.getTextSearchMatchWithModelContext)(textSearchResults, model, query);
                    }
                    else {
                        openEditorResults.set(originalResource, null);
                    }
                });
            }
            return {
                results: openEditorResults,
                limitHit
            };
        }
        matches(resource, query) {
            return (0, search_1.pathIncludedInQuery)(query, resource.fsPath);
        }
        async clearCache(cacheKey) {
            const clearPs = Array.from(this.fileSearchProviders.values())
                .map(provider => provider && provider.clearCache(cacheKey));
            await Promise.all(clearPs);
        }
    };
    exports.SearchService = SearchService;
    exports.SearchService = SearchService = __decorate([
        __param(0, model_1.IModelService),
        __param(1, editorService_1.IEditorService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, log_1.ILogService),
        __param(4, extensions_1.IExtensionService),
        __param(5, files_1.IFileService),
        __param(6, uriIdentity_1.IUriIdentityService)
    ], SearchService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC9jb21tb24vc2VhcmNoU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1QnpGLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxzQkFBVTtRQVk1QyxZQUNnQixZQUE0QyxFQUMzQyxhQUE4QyxFQUMzQyxnQkFBb0QsRUFDMUQsVUFBd0MsRUFDbEMsZ0JBQW9ELEVBQ3pELFdBQTBDLEVBQ25DLGtCQUF3RDtZQUU3RSxLQUFLLEVBQUUsQ0FBQztZQVJ3QixpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUMxQixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDMUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2pCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDeEMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDbEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQWY3RCx3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztZQUMvRCx3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztZQUV4RSxpQ0FBNEIsR0FBRyxJQUFJLEdBQUcsRUFBa0QsQ0FBQztZQUN6RixpQ0FBNEIsR0FBRyxJQUFJLEdBQUcsRUFBa0QsQ0FBQztZQUV6RixrQ0FBNkIsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBWTFELENBQUM7UUFFRCw0QkFBNEIsQ0FBQyxNQUFjLEVBQUUsSUFBd0IsRUFBRSxRQUErQjtZQUNyRyxJQUFJLElBQXdDLENBQUM7WUFDN0MsSUFBSSxXQUFnRSxDQUFDO1lBQ3JFLElBQUksSUFBSSxvQ0FBNEIsRUFBRSxDQUFD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
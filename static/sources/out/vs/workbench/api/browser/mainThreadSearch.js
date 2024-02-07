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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/search/common/search", "../common/extHost.protocol", "vs/base/common/marshalling"], function (require, exports, cancellation_1, lifecycle_1, uri_1, configuration_1, telemetry_1, extHostCustomers_1, search_1, extHost_protocol_1, marshalling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadSearch = void 0;
    let MainThreadSearch = class MainThreadSearch {
        constructor(extHostContext, _searchService, _telemetryService, _configurationService) {
            this._searchService = _searchService;
            this._telemetryService = _telemetryService;
            this._searchProvider = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostSearch);
            this._proxy.$enableExtensionHostSearch();
        }
        dispose() {
            this._searchProvider.forEach(value => value.dispose());
            this._searchProvider.clear();
        }
        $registerTextSearchProvider(handle, scheme) {
            this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, 1 /* SearchProviderType.text */, scheme, handle, this._proxy));
        }
        $registerFileSearchProvider(handle, scheme) {
            this._searchProvider.set(handle, new RemoteSearchProvider(this._searchService, 0 /* SearchProviderType.file */, scheme, handle, this._proxy));
        }
        $unregisterProvider(handle) {
            (0, lifecycle_1.dispose)(this._searchProvider.get(handle));
            this._searchProvider.delete(handle);
        }
        $handleFileMatch(handle, session, data) {
            const provider = this._searchProvider.get(handle);
            if (!provider) {
                throw new Error('Got result for unknown provider');
            }
            provider.handleFindMatch(session, data);
        }
        $handleTextMatch(handle, session, data) {
            const provider = this._searchProvider.get(handle);
            if (!provider) {
                throw new Error('Got result for unknown provider');
            }
            provider.handleFindMatch(session, data);
        }
        $handleTelemetry(eventName, data) {
            this._telemetryService.publicLog(eventName, data);
        }
    };
    exports.MainThreadSearch = MainThreadSearch;
    exports.MainThreadSearch = MainThreadSearch = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadSearch),
        __param(1, search_1.ISearchService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, configuration_1.IConfigurationService)
    ], MainThreadSearch);
    class SearchOperation {
        static { this._idPool = 0; }
        constructor(progress, id = ++SearchOperation._idPool, matches = new Map()) {
            this.progress = progress;
            this.id = id;
            this.matches = matches;
            //
        }
        addMatch(match) {
            const existingMatch = this.matches.get(match.resource.toString());
            if (existingMatch) {
                // TODO@rob clean up text/file result types
                // If a file search returns the same file twice, we would enter this branch.
                // It's possible that could happen, #90813
                if (existingMatch.results && match.results) {
                    existingMatch.results.push(...match.results);
                }
            }
            else {
                this.matches.set(match.resource.toString(), match);
            }
            this.progress?.(match);
        }
    }
    class RemoteSearchProvider {
        constructor(searchService, type, _scheme, _handle, _proxy) {
            this._scheme = _scheme;
            this._handle = _handle;
            this._proxy = _proxy;
            this._registrations = new lifecycle_1.DisposableStore();
            this._searches = new Map();
            this._registrations.add(searchService.registerSearchResultProvider(this._scheme, type, this));
        }
        dispose() {
            this._registrations.dispose();
        }
        fileSearch(query, token = cancellation_1.CancellationToken.None) {
            return this.doSearch(query, undefined, token);
        }
        textSearch(query, onProgress, token = cancellation_1.CancellationToken.None) {
            return this.doSearch(query, onProgress, token);
        }
        doSearch(query, onProgress, token = cancellation_1.CancellationToken.None) {
            if (!query.folderQueries.length) {
                throw new Error('Empty folderQueries');
            }
            const search = new SearchOperation(onProgress);
            this._searches.set(search.id, search);
            const searchP = query.type === 1 /* QueryType.File */
                ? this._proxy.$provideFileSearchResults(this._handle, search.id, query, token)
                : this._proxy.$provideTextSearchResults(this._handle, search.id, query, token);
            return Promise.resolve(searchP).then((result) => {
                this._searches.delete(search.id);
                return { results: Array.from(search.matches.values()), stats: result.stats, limitHit: result.limitHit, messages: result.messages };
            }, err => {
                this._searches.delete(search.id);
                return Promise.reject(err);
            });
        }
        clearCache(cacheKey) {
            return Promise.resolve(this._proxy.$clearCache(cacheKey));
        }
        handleFindMatch(session, dataOrUri) {
            const searchOp = this._searches.get(session);
            if (!searchOp) {
                // ignore...
                return;
            }
            dataOrUri.forEach(result => {
                if (result.results) {
                    searchOp.addMatch((0, marshalling_1.revive)(result));
                }
                else {
                    searchOp.addMatch({
                        resource: uri_1.URI.revive(result)
                    });
                }
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRTZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWdCO1FBSzVCLFlBQ0MsY0FBK0IsRUFDZixjQUErQyxFQUM1QyxpQkFBcUQsRUFDakQscUJBQTRDO1lBRmxDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUMzQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBTHhELG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7WUFRMUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFRCwyQkFBMkIsQ0FBQyxNQUFjLEVBQUUsTUFBYztZQUN6RCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxtQ0FBMkIsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2SSxDQUFDO1FBRUQsMkJBQTJCLENBQUMsTUFBYyxFQUFFLE1BQWM7WUFDekQsSUFBSSxDQUFDLGVBQWUs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
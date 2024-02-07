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
define(["require", "exports", "vs/base/common/lifecycle", "../common/extHost.protocol", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/search/common/fileSearchManager", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostUriTransformerService", "vs/platform/log/common/log", "vs/base/common/uri", "vs/workbench/services/search/common/textSearchManager"], function (require, exports, lifecycle_1, extHost_protocol_1, instantiation_1, fileSearchManager_1, extHostRpcService_1, extHostUriTransformerService_1, log_1, uri_1, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reviveQuery = exports.ExtHostSearch = exports.IExtHostSearch = void 0;
    exports.IExtHostSearch = (0, instantiation_1.createDecorator)('IExtHostSearch');
    let ExtHostSearch = class ExtHostSearch {
        constructor(extHostRpc, _uriTransformer, _logService) {
            this.extHostRpc = extHostRpc;
            this._uriTransformer = _uriTransformer;
            this._logService = _logService;
            this._proxy = this.extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadSearch);
            this._handlePool = 0;
            this._textSearchProvider = new Map();
            this._textSearchUsedSchemes = new Set();
            this._fileSearchProvider = new Map();
            this._fileSearchUsedSchemes = new Set();
            this._fileSearchManager = new fileSearchManager_1.FileSearchManager();
        }
        _transformScheme(scheme) {
            return this._uriTransformer.transformOutgoingScheme(scheme);
        }
        registerTextSearchProvider(scheme, provider) {
            if (this._textSearchUsedSchemes.has(scheme)) {
                throw new Error(`a text search provider for the scheme '${scheme}' is already registered`);
            }
            this._textSearchUsedSchemes.add(scheme);
            const handle = this._handlePool++;
            this._textSearchProvider.set(handle, provider);
            this._proxy.$registerTextSearchProvider(handle, this._transformScheme(scheme));
            return (0, lifecycle_1.toDisposable)(() => {
                this._textSearchUsedSchemes.delete(scheme);
                this._textSearchProvider.delete(handle);
                this._proxy.$unregisterProvider(handle);
            });
        }
        registerFileSearchProvider(scheme, provider) {
            if (this._fileSearchUsedSchemes.has(scheme)) {
                throw new Error(`a file search provider for the scheme '${scheme}' is already registered`);
            }
            this._fileSearchUsedSchemes.add(scheme);
            const handle = this._handlePool++;
            this._fileSearchProvider.set(handle, provider);
            this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
            return (0, lifecycle_1.toDisposable)(() => {
                this._fileSearchUsedSchemes.delete(scheme);
                this._fileSearchProvider.delete(handle);
                this._proxy.$unregisterProvider(handle);
            });
        }
        $provideFileSearchResults(handle, session, rawQuery, token) {
            const query = reviveQuery(rawQuery);
            const provider = this._fileSearchProvider.get(handle);
            if (provider) {
                return this._fileSearchManager.fileSearch(query, provider, batch => {
                    this._proxy.$handleFileMatch(handle, session, batch.map(p => p.resource));
                }, token);
            }
            else {
                throw new Error('unknown provider: ' + handle);
            }
        }
        async doInternalFileSearchWithCustomCallback(query, token, handleFileMatch) {
            return { messages: [] };
        }
        $clearCache(cacheKey) {
            this._fileSearchManager.clearCache(cacheKey);
            return Promise.resolve(undefined);
        }
        $provideTextSearchResults(handle, session, rawQuery, token) {
            const provider = this._textSearchProvider.get(handle);
            if (!provider || !provider.provideTextSearchResults) {
                throw new Error(`Unknown provider ${handle}`);
            }
            const query = reviveQuery(rawQuery);
            const engine = this.createTextSearchManager(query, provider);
            return engine.search(progress => this._proxy.$handleTextMatch(handle, session, progress), token);
        }
        $enableExtensionHostSearch() { }
        createTextSearchManager(query, provider) {
            return new textSearchManager_1.TextSearchManager(query, provider, {
                readdir: resource => Promise.resolve([]), // TODO@rob implement
                toCanonicalName: encoding => encoding
            }, 'textSearchProvider');
        }
    };
    exports.ExtHostSearch = ExtHostSearch;
    exports.ExtHostSearch = ExtHostSearch = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostUriTransformerService_1.IURITransformerService),
        __param(2, log_1.ILogService)
    ], ExtHostSearch);
    function reviveQuery(rawQuery) {
        return {
            ...rawQuery, // TODO@rob ???
            ...{
                folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery),
                extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map(components => uri_1.URI.revive(components))
            }
        };
    }
    exports.reviveQuery = reviveQuery;
    function reviveFolderQuery(rawFolderQuery) {
        return {
            ...rawFolderQuery,
            folder: uri_1.URI.revive(rawFolderQuery.folder)
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFNlYXJjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQm5GLFFBQUEsY0FBYyxHQUFHLElBQUEsK0JBQWUsRUFBaUIsZ0JBQWdCLENBQUMsQ0FBQztJQUV6RSxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFhO1FBWXpCLFlBQ3FCLFVBQXNDLEVBQ2xDLGVBQWlELEVBQzVELFdBQWtDO1lBRm5CLGVBQVUsR0FBVixVQUFVLENBQW9CO1lBQ3hCLG9CQUFlLEdBQWYsZUFBZSxDQUF3QjtZQUNsRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQWI3QixXQUFNLEdBQTBCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNoRyxnQkFBVyxHQUFXLENBQUMsQ0FBQztZQUVqQix3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztZQUNuRSwyQkFBc0IsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQzNDLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUFxQyxDQUFDO1lBQ25FLDJCQUFzQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFFM0MsdUJBQWtCLEdBQUcsSUFBSSxxQ0FBaUIsRUFBRSxDQUFDO1FBTTFELENBQUM7UUFFSyxnQkFBZ0IsQ0FBQyxNQUFjO1lBQ3hDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsMEJBQTBCLENBQUMsTUFBYyxFQUFFLFFBQW1DO1lBQzdFLElBQUksSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFB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
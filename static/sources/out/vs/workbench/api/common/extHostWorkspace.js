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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/network", "vs/base/common/numbers", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/workspace/common/workspace", "vs/workbench/api/common/extHostFileSystemInfo", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostUriTransformerService", "vs/workbench/services/search/common/search", "./extHost.protocol", "vs/base/common/marshalling"], function (require, exports, arrays_1, async_1, cancellation_1, event_1, lifecycle_1, ternarySearchTree_1, network_1, numbers_1, resources_1, strings_1, uri_1, nls_1, instantiation_1, log_1, notification_1, workspace_1, extHostFileSystemInfo_1, extHostInitDataService_1, extHostRpcService_1, extHostTypeConverters_1, extHostTypes_1, extHostUriTransformerService_1, search_1, extHost_protocol_1, marshalling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostWorkspace = exports.ExtHostWorkspace = void 0;
    function isFolderEqual(folderA, folderB, extHostFileSystemInfo) {
        return new resources_1.ExtUri(uri => ignorePathCasing(uri, extHostFileSystemInfo)).isEqual(folderA, folderB);
    }
    function compareWorkspaceFolderByUri(a, b, extHostFileSystemInfo) {
        return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? 0 : (0, strings_1.compare)(a.uri.toString(), b.uri.toString());
    }
    function compareWorkspaceFolderByUriAndNameAndIndex(a, b, extHostFileSystemInfo) {
        if (a.index !== b.index) {
            return a.index < b.index ? -1 : 1;
        }
        return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? (0, strings_1.compare)(a.name, b.name) : (0, strings_1.compare)(a.uri.toString(), b.uri.toString());
    }
    function delta(oldFolders, newFolders, compare, extHostFileSystemInfo) {
        const oldSortedFolders = oldFolders.slice(0).sort((a, b) => compare(a, b, extHostFileSystemInfo));
        const newSortedFolders = newFolders.slice(0).sort((a, b) => compare(a, b, extHostFileSystemInfo));
        return (0, arrays_1.delta)(oldSortedFolders, newSortedFolders, (a, b) => compare(a, b, extHostFileSystemInfo));
    }
    function ignorePathCasing(uri, extHostFileSystemInfo) {
        const capabilities = extHostFileSystemInfo.getCapabilities(uri.scheme);
        return !(capabilities && (capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */));
    }
    class ExtHostWorkspaceImpl extends workspace_1.Workspace {
        static toExtHostWorkspace(data, previousConfirmedWorkspace, previousUnconfirmedWorkspace, extHostFileSystemInfo) {
            if (!data) {
                return { workspace: null, added: [], removed: [] };
            }
            const { id, name, folders, configuration, transient, isUntitled } = data;
            const newWorkspaceFolders = [];
            // If we have an existing workspace, we try to find the folders that match our
            // data and update their properties. It could be that an extension stored them
            // for later use and we want to keep them "live" if they are still present.
            const oldWorkspace = previousConfirmedWorkspace;
            if (previousConfirmedWorkspace) {
                folders.forEach((folderData, index) => {
                    const folderUri = uri_1.URI.revive(folderData.uri);
                    const existingFolder = ExtHostWorkspaceImpl._findFolder(previousUnconfirmedWorkspace || previousConfirmedWorkspace, folderUri, extHostFileSystemInfo);
                    if (existingFolder) {
                        existingFolder.name = folderData.name;
                        existingFolder.index = folderData.index;
                        newWorkspaceFolders.push(existingFolder);
                    }
                    else {
                        newWorkspaceFolders.push({ uri: folderUri, name: folderData.name, index });
                    }
                });
            }
            else {
                newWorkspaceFolders.push(...folders.map(({ uri, name, index }) => ({ uri: uri_1.URI.revive(uri), name, index })));
            }
            // make sure to restore sort order based on index
            newWorkspaceFolders.sort((f1, f2) => f1.index < f2.index ? -1 : 1);
            const workspace = new ExtHostWorkspaceImpl(id, name, newWorkspaceFolders, !!transient, configuration ? uri_1.URI.revive(configuration) : null, !!isUntitled, uri => ignorePathCasing(uri, extHostFileSystemInfo));
            const { added, removed } = delta(oldWorkspace ? oldWorkspace.workspaceFolders : [], workspace.workspaceFolders, compareWorkspaceFolderByUri, extHostFileSystemInfo);
            return { workspace, added, removed };
        }
        static _findFolder(workspace, folderUriToFind, extHostFileSystemInfo) {
            for (let i = 0; i < workspace.folders.length; i++) {
                const folder = workspace.workspaceFolders[i];
                if (isFolderEqual(folder.uri, folderUriToFind, extHostFileSystemInfo)) {
                    return folder;
                }
            }
            return undefined;
        }
        constructor(id, _name, folders, transient, configuration, _isUntitled, ignorePathCasing) {
            super(id, folders.map(f => new workspace_1.WorkspaceFolder(f)), transient, configuration, ignorePathCasing);
            this._name = _name;
            this._isUntitled = _isUntitled;
            this._workspaceFolders = [];
            this._structure = ternarySearchTree_1.TernarySearchTree.forUris(ignorePathCasing);
            // setup the workspace folder data structure
            folders.forEach(folder => {
                this._workspaceFolders.push(folder);
                this._structure.set(folder.uri, folder);
            });
        }
        get name() {
            return this._name;
        }
        get isUntitled() {
            return this._isUntitled;
        }
        get workspaceFolders() {
            return this._workspaceFolders.slice(0);
        }
        getWorkspaceFolder(uri, resolveParent) {
            if (resolveParent && this._structure.get(uri)) {
                // `uri` is a workspace folder so we check for its parent
                uri = (0, resources_1.dirname)(uri);
            }
            return this._structure.findSubstr(uri);
        }
        resolveWorkspaceFolder(uri) {
            return this._structure.get(uri);
        }
    }
    let ExtHostWorkspace = class ExtHostWorkspace {
        constructor(extHostRpc, initData, extHostFileSystemInfo, logService, uriTransformerService) {
            this._onDidChangeWorkspace = new event_1.Emitter();
            this.onDidChangeWorkspace = this._onDidChangeWorkspace.event;
            this._onDidGrantWorkspaceTrust = new event_1.Emitter();
            this.onDidGrantWorkspaceTrust = this._onDidGrantWorkspaceTrust.event;
            this._activeSearchCallbacks = [];
            this._trusted = false;
            this._editSessionIdentityProviders = new Map();
            // --- edit sessions ---
            this._providerHandlePool = 0;
            this._onWillCreateEditSessionIdentityEvent = new event_1.AsyncEmitter();
            // --- canonical uri identity ---
            this._canonicalUriProviders = new Map();
            this._logService = logService;
            this._extHostFileSystemInfo = extHostFileSystemInfo;
            this._uriTransformerService = uriTransformerService;
            this._requestIdProvider = new numbers_1.Counter();
            this._barrier = new async_1.Barrier();
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadWorkspace);
            this._messageService = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadMessageService);
            const data = initData.workspace;
            this._confirmedWorkspace = data ? new ExtHostWorkspaceImpl(data.id, data.name, [], !!data.transient, data.configuration ? uri_1.URI.revive(data.configuration) : null, !!data.isUntitled, uri => ignorePathCasing(uri, extHostFileSystemInfo)) : undefined;
        }
        $initializeWorkspace(data, trusted) {
            this._trusted = trusted;
            this.$acceptWorkspaceData(data);
            this._barrier.open();
        }
        waitForInitializeCall() {
            return this._barrier.wait();
        }
        // --- workspace ---
        get workspace() {
            return this._actualWorkspace;
        }
        get name() {
            return this._actualWorkspace ? this._actualWorkspace.name : undefined;
        }
        get workspaceFile() {
            if (this._actualWorkspace) {
                if (this._actualWorkspace.configuration) {
                    if (this._actualWorkspace.isUntitled) {
                        return uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: (0, resources_1.basename)((0, resources_1.dirname)(this._actualWorkspace.configuration)) }); // Untitled Workspace: return untitled URI
                    }
                    return this._actualWorkspace.configuration; // Workspace: return the configuration location
                }
            }
            return undefined;
        }
        get _actualWorkspace() {
            return this._unconfirmedWorkspace || this._confirmedWorkspace;
        }
        getWorkspaceFolders() {
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.workspaceFolders.slice(0);
        }
        async getWorkspaceFolders2() {
            await this._barrier.wait();
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.workspaceFolders.slice(0);
        }
        updateWorkspaceFolders(extension, index, deleteCount, ...workspaceFoldersToAdd) {
            const validatedDistinctWorkspaceFoldersToAdd = [];
            if (Array.isArray(workspaceFoldersToAdd)) {
                workspaceFoldersToAdd.forEach(folderToAdd => {
                    if (uri_1.URI.isUri(folderToAdd.uri) && !validatedDistinctWorkspaceFoldersToAdd.some(f => isFolderEqual(f.uri, folderToAdd.uri, this._extHostFileSystemInfo))) {
                        validatedDistinctWorkspaceFoldersToAdd.push({ uri: folderToAdd.uri, name: folderToAdd.name || (0, resources_1.basenameOrAuthority)(folderToAdd.uri) });
                    }
                });
            }
            if (!!this._unconfirmedWorkspace) {
                return false; // prevent accumulated calls without a confirmed workspace
            }
            if ([index, deleteCount].some(i => typeof i !== 'number' || i < 0)) {
                return false; // validate numbers
            }
            if (deleteCount === 0 && validatedDistinctWorkspaceFoldersToAdd.length === 0) {
                return false; // nothing to delete or add
            }
            const currentWorkspaceFolders = this._actualWorkspace ? this._actualWorkspace.workspaceFolders : [];
            if (index + deleteCount > currentWorkspaceFolders.length) {
                return false; // cannot delete more than we have
            }
            // Simulate the updateWorkspaceFolders method on our data to do more validation
            const newWorkspaceFolders = currentWorkspaceFolders.slice(0);
            newWorkspaceFolders.splice(index, deleteCount, ...validatedDistinctWorkspaceFoldersToAdd.map(f => ({ uri: f.uri, name: f.name || (0, resources_1.basenameOrAuthority)(f.uri), index: undefined /* fixed later */ })));
            for (let i = 0; i < newWorkspaceFolders.length; i++) {
                const folder = newWorkspaceFolders[i];
                if (newWorkspaceFolders.some((otherFolder, index) => index !== i && isFolderEqual(folder.uri, otherFolder.uri, this._extHostFileSystemInfo))) {
                    return false; // cannot add the same folder multiple times
                }
            }
            newWorkspaceFolders.forEach((f, index) => f.index = index); // fix index
            const { added, removed } = delta(currentWorkspaceFolders, newWorkspaceFolders, compareWorkspaceFolderByUriAndNameAndIndex, this._extHostFileSystemInfo);
            if (added.length === 0 && removed.length === 0) {
                return false; // nothing actually changed
            }
            // Trigger on main side
            if (this._proxy) {
                const extName = extension.displayName || extension.name;
                this._proxy.$updateWorkspaceFolders(extName, index, deleteCount, validatedDistinctWorkspaceFoldersToAdd).then(undefined, error => {
                    // in case of an error, make sure to clear out the unconfirmed workspace
                    // because we cannot expect the acknowledgement from the main side for this
                    this._unconfirmedWorkspace = undefined;
                    // show error to user
                    const options = { source: { identifier: extension.identifier, label: extension.displayName || extension.name } };
                    this._messageService.$showMessage(notification_1.Severity.Error, (0, nls_1.localize)('updateerror', "Extension '{0}' failed to update workspace folders: {1}", extName, error.toString()), options, []);
                });
            }
            // Try to accept directly
            this.trySetWorkspaceFolders(newWorkspaceFolders);
            return true;
        }
        getWorkspaceFolder(uri, resolveParent) {
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.getWorkspaceFolder(uri, resolveParent);
        }
        async getWorkspaceFolder2(uri, resolveParent) {
            await this._barrier.wait();
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.getWorkspaceFolder(uri, resolveParent);
        }
        async resolveWorkspaceFolder(uri) {
            await this._barrier.wait();
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.resolveWorkspaceFolder(uri);
        }
        getPath() {
            // this is legacy from the days before having
            // multi-root and we keep it only alive if there
            // is just one workspace folder.
            if (!this._actualWorkspace) {
                return undefined;
            }
            const { folders } = this._actualWorkspace;
            if (folders.length === 0) {
                return undefined;
            }
            // #54483 @Joh Why are we still using fsPath?
            return folders[0].uri.fsPath;
        }
        getRelativePath(pathOrUri, includeWorkspace) {
            let resource;
            let path = '';
            if (typeof pathOrUri === 'string') {
                resource = uri_1.URI.file(pathOrUri);
                path = pathOrUri;
            }
            else if (typeof pathOrUri !== 'undefined') {
                resource = pathOrUri;
                path = pathOrUri.fsPath;
            }
            if (!resource) {
                return path;
            }
            const folder = this.getWorkspaceFolder(resource, true);
            if (!folder) {
                return path;
            }
            if (typeof includeWorkspace === 'undefined' && this._actualWorkspace) {
                includeWorkspace = this._actualWorkspace.folders.length > 1;
            }
            let result = (0, resources_1.relativePath)(folder.uri, resource);
            if (includeWorkspace && folder.name) {
                result = `${folder.name}/${result}`;
            }
            return result;
        }
        trySetWorkspaceFolders(folders) {
            // Update directly here. The workspace is unconfirmed as long as we did not get an
            // acknowledgement from the main side (via $acceptWorkspaceData)
            if (this._actualWorkspace) {
                this._unconfirmedWorkspace = ExtHostWorkspaceImpl.toExtHostWorkspace({
                    id: this._actualWorkspace.id,
                    name: this._actualWorkspace.name,
                    configuration: this._actualWorkspace.configuration,
                    folders,
                    isUntitled: this._actualWorkspace.isUntitled
                }, this._actualWorkspace, undefined, this._extHostFileSystemInfo).workspace || undefined;
            }
        }
        $acceptWorkspaceData(data) {
            const { workspace, added, removed } = ExtHostWorkspaceImpl.toExtHostWorkspace(data, this._confirmedWorkspace, this._unconfirmedWorkspace, this._extHostFileSystemInfo);
            // Update our workspace object. We have a confirmed workspace, so we drop our
            // unconfirmed workspace.
            this._confirmedWorkspace = workspace || undefined;
            this._unconfirmedWorkspace = undefined;
            // Events
            this._onDidChangeWorkspace.fire(Object.freeze({
                added,
                removed,
            }));
        }
        // --- search ---
        /**
         * Note, null/undefined have different and important meanings for "exclude"
         */
        findFiles(include, exclude, maxResults, extensionId, token = cancellation_1.CancellationToken.None) {
            this._logService.trace(`extHostWorkspace#findFiles: fileSearch, extension: ${extensionId.value}, entryPoint: findFiles`);
            let excludePatternOrDisregardExcludes = undefined;
            if (exclude === null) {
                excludePatternOrDisregardExcludes = false;
            }
            else if (exclude) {
                if (typeof exclude === 'string') {
                    excludePatternOrDisregardExcludes = exclude;
                }
                else {
                    excludePatternOrDisregardExcludes = exclude.pattern;
                }
            }
            if (token && token.isCancellationRequested) {
                return Promise.resolve([]);
            }
            const { includePattern, folder } = parseSearchInclude(extHostTypeConverters_1.GlobPattern.from(include));
            return this._proxy.$startFileSearch(includePattern ?? null, folder ?? null, excludePatternOrDisregardExcludes ?? null, maxResults ?? null, token)
                .then(data => Array.isArray(data) ? data.map(d => uri_1.URI.revive(d)) : []);
        }
        async findTextInFiles(query, options, callback, extensionId, token = cancellation_1.CancellationToken.None) {
            this._logService.trace(`extHostWorkspace#findTextInFiles: textSearch, extension: ${extensionId.value}, entryPoint: findTextInFiles`);
            const requestId = this._requestIdProvider.getNext();
            const previewOptions = typeof options.previewOptions === 'undefined' ?
                {
                    matchLines: 100,
                    charsPerLine: 10000
                } :
                options.previewOptions;
            const { includePattern, folder } = parseSearchInclude(extHostTypeConverters_1.GlobPattern.from(options.include));
            const excludePattern = (typeof options.exclude === 'string') ? options.exclude :
                options.exclude ? options.exclude.pattern : undefined;
            const queryOptions = {
                ignoreSymlinks: typeof options.followSymlinks === 'boolean' ? !options.followSymlinks : undefined,
                disregardIgnoreFiles: typeof options.useIgnoreFiles === 'boolean' ? !options.useIgnoreFiles : undefined,
                disregardGlobalIgnoreFiles: typeof options.useGlobalIgnoreFiles === 'boolean' ? !options.useGlobalIgnoreFiles : undefined,
                disregardParentIgnoreFiles: typeof options.useParentIgnoreFiles === 'boolean' ? !options.useParentIgnoreFiles : undefined,
                disregardExcludeSettings: typeof options.useDefaultExcludes === 'boolean' ? !options.useDefaultExcludes : true,
                fileEncoding: options.encoding,
                maxResults: options.maxResults,
                previewOptions,
                afterContext: options.afterContext,
                beforeContext: options.beforeContext,
                includePattern: includePattern,
                excludePattern: excludePattern
            };
            const isCanceled = false;
            this._activeSearchCallbacks[requestId] = p => {
                if (isCanceled) {
                    return;
                }
                const uri = uri_1.URI.revive(p.resource);
                p.results.forEach(rawResult => {
                    const result = (0, marshalling_1.revive)(rawResult);
                    if ((0, search_1.resultIsMatch)(result)) {
                        callback({
                            uri,
                            preview: {
                                text: result.preview.text,
                                matches: (0, arrays_1.mapArrayOrNot)(result.preview.matches, m => new extHostTypes_1.Range(m.startLineNumber, m.startColumn, m.endLineNumber, m.endColumn))
                            },
                            ranges: (0, arrays_1.mapArrayOrNot)(result.ranges, r => new extHostTypes_1.Range(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn))
                        });
                    }
                    else {
                        callback({
                            uri,
                            text: result.text,
                            lineNumber: result.lineNumber
                        });
                    }
                });
            };
            if (token.isCancellationRequested) {
                return {};
            }
            try {
                const result = await this._proxy.$startTextSearch(query, folder ?? null, queryOptions, requestId, token);
                delete this._activeSearchCallbacks[requestId];
                return result || {};
            }
            catch (err) {
                delete this._activeSearchCallbacks[requestId];
                throw err;
            }
        }
        $handleTextSearchResult(result, requestId) {
            this._activeSearchCallbacks[requestId]?.(result);
        }
        async save(uri) {
            const result = await this._proxy.$save(uri, { saveAs: false });
            return uri_1.URI.revive(result);
        }
        async saveAs(uri) {
            const result = await this._proxy.$save(uri, { saveAs: true });
            return uri_1.URI.revive(result);
        }
        saveAll(includeUntitled) {
            return this._proxy.$saveAll(includeUntitled);
        }
        resolveProxy(url) {
            return this._proxy.$resolveProxy(url);
        }
        loadCertificates() {
            return this._proxy.$loadCertificates();
        }
        // --- trust ---
        get trusted() {
            return this._trusted;
        }
        requestWorkspaceTrust(options) {
            return this._proxy.$requestWorkspaceTrust(options);
        }
        $onDidGrantWorkspaceTrust() {
            if (!this._trusted) {
                this._trusted = true;
                this._onDidGrantWorkspaceTrust.fire();
            }
        }
        // called by ext host
        registerEditSessionIdentityProvider(scheme, provider) {
            if (this._editSessionIdentityProviders.has(scheme)) {
                throw new Error(`A provider has already been registered for scheme ${scheme}`);
            }
            this._editSessionIdentityProviders.set(scheme, provider);
            const outgoingScheme = this._uriTransformerService.transformOutgoingScheme(scheme);
            const handle = this._providerHandlePool++;
            this._proxy.$registerEditSessionIdentityProvider(handle, outgoingScheme);
            return (0, lifecycle_1.toDisposable)(() => {
                this._editSessionIdentityProviders.delete(scheme);
                this._proxy.$unregisterEditSessionIdentityProvider(handle);
            });
        }
        // called by main thread
        async $getEditSessionIdentifier(workspaceFolder, cancellationToken) {
            this._logService.info('Getting edit session identifier for workspaceFolder', workspaceFolder);
            const folder = await this.resolveWorkspaceFolder(uri_1.URI.revive(workspaceFolder));
            if (!folder) {
                this._logService.warn('Unable to resolve workspace folder');
                return undefined;
            }
            this._logService.info('Invoking #provideEditSessionIdentity for workspaceFolder', folder);
            const provider = this._editSessionIdentityProviders.get(folder.uri.scheme);
            this._logService.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
            if (!provider) {
                return undefined;
            }
            const result = await provider.provideEditSessionIdentity(folder, cancellationToken);
            this._logService.info('Provider returned edit session identifier: ', result);
            if (!result) {
                return undefined;
            }
            return result;
        }
        async $provideEditSessionIdentityMatch(workspaceFolder, identity1, identity2, cancellationToken) {
            this._logService.info('Getting edit session identifier for workspaceFolder', workspaceFolder);
            const folder = await this.resolveWorkspaceFolder(uri_1.URI.revive(workspaceFolder));
            if (!folder) {
                this._logService.warn('Unable to resolve workspace folder');
                return undefined;
            }
            this._logService.info('Invoking #provideEditSessionIdentity for workspaceFolder', folder);
            const provider = this._editSessionIdentityProviders.get(folder.uri.scheme);
            this._logService.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
            if (!provider) {
                return undefined;
            }
            const result = await provider.provideEditSessionIdentityMatch?.(identity1, identity2, cancellationToken);
            this._logService.info('Provider returned edit session identifier match result: ', result);
            if (!result) {
                return undefined;
            }
            return result;
        }
        getOnWillCreateEditSessionIdentityEvent(extension) {
            return (listener, thisArg, disposables) => {
                const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
                wrappedListener.extension = extension;
                return this._onWillCreateEditSessionIdentityEvent.event(wrappedListener, undefined, disposables);
            };
        }
        // main thread calls this to trigger participants
        async $onWillCreateEditSessionIdentity(workspaceFolder, token, timeout) {
            const folder = await this.resolveWorkspaceFolder(uri_1.URI.revive(workspaceFolder));
            if (folder === undefined) {
                throw new Error('Unable to resolve workspace folder');
            }
            await this._onWillCreateEditSessionIdentityEvent.fireAsync({ workspaceFolder: folder }, token, async (thenable, listener) => {
                const now = Date.now();
                await Promise.resolve(thenable);
                if (Date.now() - now > timeout) {
                    this._logService.warn('SLOW edit session create-participant', listener.extension.identifier);
                }
            });
            if (token.isCancellationRequested) {
                return undefined;
            }
        }
        // called by ext host
        registerCanonicalUriProvider(scheme, provider) {
            if (this._canonicalUriProviders.has(scheme)) {
                throw new Error(`A provider has already been registered for scheme ${scheme}`);
            }
            this._canonicalUriProviders.set(scheme, provider);
            const outgoingScheme = this._uriTransformerService.transformOutgoingScheme(scheme);
            const handle = this._providerHandlePool++;
            this._proxy.$registerCanonicalUriProvider(handle, outgoingScheme);
            return (0, lifecycle_1.toDisposable)(() => {
                this._canonicalUriProviders.delete(scheme);
                this._proxy.$unregisterCanonicalUriProvider(handle);
            });
        }
        async provideCanonicalUri(uri, options, cancellationToken) {
            const provider = this._canonicalUriProviders.get(uri.scheme);
            if (!provider) {
                return undefined;
            }
            const result = await provider.provideCanonicalUri?.(uri_1.URI.revive(uri), options, cancellationToken);
            if (!result) {
                return undefined;
            }
            return result;
        }
        // called by main thread
        async $provideCanonicalUri(uri, targetScheme, cancellationToken) {
            return this.provideCanonicalUri(uri_1.URI.revive(uri), { targetScheme }, cancellationToken);
        }
    };
    exports.ExtHostWorkspace = ExtHostWorkspace;
    exports.ExtHostWorkspace = ExtHostWorkspace = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, extHostFileSystemInfo_1.IExtHostFileSystemInfo),
        __param(3, log_1.ILogService),
        __param(4, extHostUriTransformerService_1.IURITransformerService)
    ], ExtHostWorkspace);
    exports.IExtHostWorkspace = (0, instantiation_1.createDecorator)('IExtHostWorkspace');
    function parseSearchInclude(include) {
        let includePattern;
        let includeFolder;
        if (include) {
            if (typeof include === 'string') {
                includePattern = include;
            }
            else {
                includePattern = include.pattern;
                includeFolder = uri_1.URI.revive(include.baseUri);
            }
        }
        return {
            includePattern,
            folder: includeFolder
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdvcmtzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFdvcmtzcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5Q2hHLFNBQVMsYUFBYSxDQUFDLE9BQVksRUFBRSxPQUFZLEVBQUUscUJBQTZDO1FBQy9GLE9BQU8sSUFBSSxrQkFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xHLENBQUM7SUFFRCxTQUFTLDJCQUEyQixDQUFDLENBQXlCLEVBQUUsQ0FBeUIsRUFBRSxxQkFBNkM7UUFDdkksT0FBTyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxpQkFBTyxFQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzdHLENBQUM7SUFFRCxTQUFTLDBDQUEwQyxDQUFDLENBQXlCLEVBQUUsQ0FBeUIsRUFBRSxxQkFBNkM7UUFDdEosSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QixPQUFPLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsT0FBTyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdB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
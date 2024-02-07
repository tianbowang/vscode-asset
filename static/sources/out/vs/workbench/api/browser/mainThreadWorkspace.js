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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/notification/common/notification", "vs/platform/request/common/request", "vs/platform/workspace/common/workspaceTrust", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/extensions/common/workspaceContains", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/search/common/search", "vs/workbench/services/workspaces/common/workspaceEditing", "../common/extHost.protocol", "vs/platform/workspace/common/editSessions", "vs/workbench/common/editor", "vs/base/common/arrays", "vs/platform/workspace/common/canonicalUri"], function (require, exports, errors_1, lifecycle_1, platform_1, uri_1, nls_1, environment_1, files_1, instantiation_1, label_1, notification_1, request_1, workspaceTrust_1, workspace_1, extHostCustomers_1, workspaceContains_1, queryBuilder_1, editorService_1, search_1, workspaceEditing_1, extHost_protocol_1, editSessions_1, editor_1, arrays_1, canonicalUri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadWorkspace = void 0;
    let MainThreadWorkspace = class MainThreadWorkspace {
        constructor(extHostContext, _searchService, _contextService, _editSessionIdentityService, _canonicalUriService, _editorService, _workspaceEditingService, _notificationService, _requestService, _instantiationService, _labelService, _environmentService, fileService, _workspaceTrustManagementService, _workspaceTrustRequestService) {
            this._searchService = _searchService;
            this._contextService = _contextService;
            this._editSessionIdentityService = _editSessionIdentityService;
            this._canonicalUriService = _canonicalUriService;
            this._editorService = _editorService;
            this._workspaceEditingService = _workspaceEditingService;
            this._notificationService = _notificationService;
            this._requestService = _requestService;
            this._instantiationService = _instantiationService;
            this._labelService = _labelService;
            this._environmentService = _environmentService;
            this._workspaceTrustManagementService = _workspaceTrustManagementService;
            this._workspaceTrustRequestService = _workspaceTrustRequestService;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._activeCancelTokens = Object.create(null);
            this._queryBuilder = this._instantiationService.createInstance(queryBuilder_1.QueryBuilder);
            // --- edit sessions ---
            this.registeredEditSessionProviders = new Map();
            // --- canonical uri identities ---
            this.registeredCanonicalUriProviders = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostWorkspace);
            const workspace = this._contextService.getWorkspace();
            // The workspace file is provided be a unknown file system provider. It might come
            // from the extension host. So initialize now knowing that `rootPath` is undefined.
            if (workspace.configuration && !platform_1.isNative && !fileService.hasProvider(workspace.configuration)) {
                this._proxy.$initializeWorkspace(this.getWorkspaceData(workspace), this.isWorkspaceTrusted());
            }
            else {
                this._contextService.getCompleteWorkspace().then(workspace => this._proxy.$initializeWorkspace(this.getWorkspaceData(workspace), this.isWorkspaceTrusted()));
            }
            this._contextService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspace, this, this._toDispose);
            this._contextService.onDidChangeWorkbenchState(this._onDidChangeWorkspace, this, this._toDispose);
            this._workspaceTrustManagementService.onDidChangeTrust(this._onDidGrantWorkspaceTrust, this, this._toDispose);
        }
        dispose() {
            this._toDispose.dispose();
            for (const requestId in this._activeCancelTokens) {
                const tokenSource = this._activeCancelTokens[requestId];
                tokenSource.cancel();
            }
        }
        // --- workspace ---
        $updateWorkspaceFolders(extensionName, index, deleteCount, foldersToAdd) {
            const workspaceFoldersToAdd = foldersToAdd.map(f => ({ uri: uri_1.URI.revive(f.uri), name: f.name }));
            // Indicate in status message
            this._notificationService.status(this.getStatusMessage(extensionName, workspaceFoldersToAdd.length, deleteCount), { hideAfter: 10 * 1000 /* 10s */ });
            return this._workspaceEditingService.updateFolders(index, deleteCount, workspaceFoldersToAdd, true);
        }
        getStatusMessage(extensionName, addCount, removeCount) {
            let message;
            const wantsToAdd = addCount > 0;
            const wantsToDelete = removeCount > 0;
            // Add Folders
            if (wantsToAdd && !wantsToDelete) {
                if (addCount === 1) {
                    message = (0, nls_1.localize)('folderStatusMessageAddSingleFolder', "Extension '{0}' added 1 folder to the workspace", extensionName);
                }
                else {
                    message = (0, nls_1.localize)('folderStatusMessageAddMultipleFolders', "Extension '{0}' added {1} folders to the workspace", extensionName, addCount);
                }
            }
            // Delete Folders
            else if (wantsToDelete && !wantsToAdd) {
                if (removeCount === 1) {
                    message = (0, nls_1.localize)('folderStatusMessageRemoveSingleFolder', "Extension '{0}' removed 1 folder from the workspace", extensionName);
                }
                else {
                    message = (0, nls_1.localize)('folderStatusMessageRemoveMultipleFolders', "Extension '{0}' removed {1} folders from the workspace", extensionName, removeCount);
                }
            }
            // Change Folders
            else {
                message = (0, nls_1.localize)('folderStatusChangeFolder', "Extension '{0}' changed folders of the workspace", extensionName);
            }
            return message;
        }
        _onDidChangeWorkspace() {
            this._proxy.$acceptWorkspaceData(this.getWorkspaceData(this._contextService.getWorkspace()));
        }
        getWorkspaceData(workspace) {
            if (this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return null;
            }
            return {
                configuration: workspace.configuration || undefined,
                isUntitled: workspace.configuration ? (0, workspace_1.isUntitledWorkspace)(workspace.configuration, this._environmentService) : false,
                folders: workspace.folders,
                id: workspace.id,
                name: this._labelService.getWorkspaceLabel(workspace),
                transient: workspace.transient
            };
        }
        // --- search ---
        $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
            const includeFolder = uri_1.URI.revive(_includeFolder);
            const workspace = this._contextService.getWorkspace();
            const query = this._queryBuilder.file(includeFolder ? [includeFolder] : workspace.folders, {
                maxResults: maxResults ?? undefined,
                disregardExcludeSettings: (excludePatternOrDisregardExcludes === false) || undefined,
                disregardSearchExcludeSettings: true,
                disregardIgnoreFiles: true,
                includePattern: includePattern ?? undefined,
                excludePattern: typeof excludePatternOrDisregardExcludes === 'string' ? excludePatternOrDisregardExcludes : undefined,
                _reason: 'startFileSearch'
            });
            return this._searchService.fileSearch(query, token).then(result => {
                return result.results.map(m => m.resource);
            }, err => {
                if (!(0, errors_1.isCancellationError)(err)) {
                    return Promise.reject(err);
                }
                return null;
            });
        }
        $startTextSearch(pattern, _folder, options, requestId, token) {
            const folder = uri_1.URI.revive(_folder);
            const workspace = this._contextService.getWorkspace();
            const folders = folder ? [folder] : workspace.folders.map(folder => folder.uri);
            const query = this._queryBuilder.text(pattern, folders, options);
            query._reason = 'startTextSearch';
            const onProgress = (p) => {
                if (p.results) {
                    this._proxy.$handleTextSearchResult(p, requestId);
                }
            };
            const search = this._searchService.textSearch(query, token, onProgress).then(result => {
                return { limitHit: result.limitHit };
            }, err => {
                if (!(0, errors_1.isCancellationError)(err)) {
                    return Promise.reject(err);
                }
                return null;
            });
            return search;
        }
        $checkExists(folders, includes, token) {
            return this._instantiationService.invokeFunction((accessor) => (0, workspaceContains_1.checkGlobFileExists)(accessor, folders, includes, token));
        }
        // --- save & edit resources ---
        async $save(uriComponents, options) {
            const uri = uri_1.URI.revive(uriComponents);
            const editors = [...this._editorService.findEditors(uri, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })];
            const result = await this._editorService.save(editors, {
                reason: 1 /* SaveReason.EXPLICIT */,
                saveAs: options.saveAs,
                force: !options.saveAs
            });
            return (0, arrays_1.firstOrDefault)(this._saveResultToUris(result));
        }
        _saveResultToUris(result) {
            if (!result.success) {
                return [];
            }
            return (0, arrays_1.coalesce)(result.editors.map(editor => editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY })));
        }
        $saveAll(includeUntitled) {
            return this._editorService.saveAll({ includeUntitled }).then(res => res.success);
        }
        $resolveProxy(url) {
            return this._requestService.resolveProxy(url);
        }
        $loadCertificates() {
            return this._requestService.loadCertificates();
        }
        // --- trust ---
        $requestWorkspaceTrust(options) {
            return this._workspaceTrustRequestService.requestWorkspaceTrust(options);
        }
        isWorkspaceTrusted() {
            return this._workspaceTrustManagementService.isWorkspaceTrusted();
        }
        _onDidGrantWorkspaceTrust() {
            this._proxy.$onDidGrantWorkspaceTrust();
        }
        $registerEditSessionIdentityProvider(handle, scheme) {
            const disposable = this._editSessionIdentityService.registerEditSessionIdentityProvider({
                scheme: scheme,
                getEditSessionIdentifier: async (workspaceFolder, token) => {
                    return this._proxy.$getEditSessionIdentifier(workspaceFolder.uri, token);
                },
                provideEditSessionIdentityMatch: async (workspaceFolder, identity1, identity2, token) => {
                    return this._proxy.$provideEditSessionIdentityMatch(workspaceFolder.uri, identity1, identity2, token);
                }
            });
            this.registeredEditSessionProviders.set(handle, disposable);
            this._toDispose.add(disposable);
        }
        $unregisterEditSessionIdentityProvider(handle) {
            const disposable = this.registeredEditSessionProviders.get(handle);
            disposable?.dispose();
            this.registeredEditSessionProviders.delete(handle);
        }
        $registerCanonicalUriProvider(handle, scheme) {
            const disposable = this._canonicalUriService.registerCanonicalUriProvider({
                scheme: scheme,
                provideCanonicalUri: async (uri, targetScheme, token) => {
                    const result = await this._proxy.$provideCanonicalUri(uri, targetScheme, token);
                    if (result) {
                        return uri_1.URI.revive(result);
                    }
                    return result;
                }
            });
            this.registeredCanonicalUriProviders.set(handle, disposable);
            this._toDispose.add(disposable);
        }
        $unregisterCanonicalUriProvider(handle) {
            const disposable = this.registeredCanonicalUriProviders.get(handle);
            disposable?.dispose();
            this.registeredCanonicalUriProviders.delete(handle);
        }
    };
    exports.MainThreadWorkspace = MainThreadWorkspace;
    exports.MainThreadWorkspace = MainThreadWorkspace = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadWorkspace),
        __param(1, search_1.ISearchService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, editSessions_1.IEditSessionIdentityService),
        __param(4, canonicalUri_1.ICanonicalUriService),
        __param(5, editorService_1.IEditorService),
        __param(6, workspaceEditing_1.IWorkspaceEditingService),
        __param(7, notification_1.INotificationService),
        __param(8, request_1.IRequestService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, label_1.ILabelService),
        __param(11, environment_1.IEnvironmentService),
        __param(12, files_1.IFileService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(14, workspaceTrust_1.IWorkspaceTrustRequestService)
    ], MainThreadWorkspace);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFdvcmtzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRXb3Jrc3BhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkJ6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtRQU8vQixZQUNDLGNBQStCLEVBQ2YsY0FBK0MsRUFDckMsZUFBMEQsRUFDdkQsMkJBQXlFLEVBQ2hGLG9CQUEyRCxFQUNqRSxjQUErQyxFQUNyQyx3QkFBbUUsRUFDdkUsb0JBQTJELEVBQ2hFLGVBQWlELEVBQzNDLHFCQUE2RCxFQUNyRSxhQUE2QyxFQUN2QyxtQkFBeUQsRUFDaEUsV0FBeUIsRUFDTCxnQ0FBbUYsRUFDdEYsNkJBQTZFO1lBYjNFLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUNwQixvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7WUFDdEMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtZQUMvRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2hELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUNwQiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3RELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDL0Msb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQzFCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDcEQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDdEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUUzQixxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQWtDO1lBQ3JFLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7WUFwQjVGLGVBQVUsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNuQyx3QkFBbUIsR0FBOEMsTUFBTSxD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
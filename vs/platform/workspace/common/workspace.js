(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/base/common/ternarySearchTree", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/base/common/network"], function (require, exports, nls_1, path_1, ternarySearchTree_1, resources_1, uri_1, instantiation_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasWorkspaceFileExtension = exports.isSavedWorkspace = exports.isStandaloneEditorWorkspace = exports.STANDALONE_EDITOR_WORKSPACE_ID = exports.isTemporaryWorkspace = exports.isUntitledWorkspace = exports.UNTITLED_WORKSPACE_NAME = exports.WORKSPACE_FILTER = exports.WORKSPACE_SUFFIX = exports.WORKSPACE_EXTENSION = exports.toWorkspaceFolder = exports.WorkspaceFolder = exports.Workspace = exports.isWorkspaceFolder = exports.isWorkspace = exports.WorkbenchState = exports.reviveIdentifier = exports.isWorkspaceIdentifier = exports.toWorkspaceIdentifier = exports.UNKNOWN_EMPTY_WINDOW_WORKSPACE = exports.EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE = exports.isEmptyWorkspaceIdentifier = exports.isSingleFolderWorkspaceIdentifier = exports.IWorkspaceContextService = void 0;
    exports.IWorkspaceContextService = (0, instantiation_1.createDecorator)('contextService');
    function isSingleFolderWorkspaceIdentifier(obj) {
        const singleFolderIdentifier = obj;
        return typeof singleFolderIdentifier?.id === 'string' && uri_1.URI.isUri(singleFolderIdentifier.uri);
    }
    exports.isSingleFolderWorkspaceIdentifier = isSingleFolderWorkspaceIdentifier;
    function isEmptyWorkspaceIdentifier(obj) {
        const emptyWorkspaceIdentifier = obj;
        return typeof emptyWorkspaceIdentifier?.id === 'string'
            && !isSingleFolderWorkspaceIdentifier(obj)
            && !isWorkspaceIdentifier(obj);
    }
    exports.isEmptyWorkspaceIdentifier = isEmptyWorkspaceIdentifier;
    exports.EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE = { id: 'ext-dev' };
    exports.UNKNOWN_EMPTY_WINDOW_WORKSPACE = { id: 'empty-window' };
    function toWorkspaceIdentifier(arg0, isExtensionDevelopment) {
        // Empty workspace
        if (typeof arg0 === 'string' || typeof arg0 === 'undefined') {
            // With a backupPath, the basename is the empty workspace identifier
            if (typeof arg0 === 'string') {
                return {
                    id: (0, path_1.basename)(arg0)
                };
            }
            // Extension development empty windows have backups disabled
            // so we return a constant workspace identifier for extension
            // authors to allow to restore their workspace state even then.
            if (isExtensionDevelopment) {
                return exports.EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE;
            }
            return exports.UNKNOWN_EMPTY_WINDOW_WORKSPACE;
        }
        // Multi root
        const workspace = arg0;
        if (workspace.configuration) {
            return {
                id: workspace.id,
                configPath: workspace.configuration
            };
        }
        // Single folder
        if (workspace.folders.length === 1) {
            return {
                id: workspace.id,
                uri: workspace.folders[0].uri
            };
        }
        // Empty window
        return {
            id: workspace.id
        };
    }
    exports.toWorkspaceIdentifier = toWorkspaceIdentifier;
    function isWorkspaceIdentifier(obj) {
        const workspaceIdentifier = obj;
        return typeof workspaceIdentifier?.id === 'string' && uri_1.URI.isUri(workspaceIdentifier.configPath);
    }
    exports.isWorkspaceIdentifier = isWorkspaceIdentifier;
    function reviveIdentifier(identifier) {
        // Single Folder
        const singleFolderIdentifierCandidate = identifier;
        if (singleFolderIdentifierCandidate?.uri) {
            return { id: singleFolderIdentifierCandidate.id, uri: uri_1.URI.revive(singleFolderIdentifierCandidate.uri) };
        }
        // Multi folder
        const workspaceIdentifierCandidate = identifier;
        if (workspaceIdentifierCandidate?.configPath) {
            return { id: workspaceIdentifierCandidate.id, configPath: uri_1.URI.revive(workspaceIdentifierCandidate.configPath) };
        }
        // Empty
        if (identifier?.id) {
            return { id: identifier.id };
        }
        return undefined;
    }
    exports.reviveIdentifier = reviveIdentifier;
    var WorkbenchState;
    (function (WorkbenchState) {
        WorkbenchState[WorkbenchState["EMPTY"] = 1] = "EMPTY";
        WorkbenchState[WorkbenchState["FOLDER"] = 2] = "FOLDER";
        WorkbenchState[WorkbenchState["WORKSPACE"] = 3] = "WORKSPACE";
    })(WorkbenchState || (exports.WorkbenchState = WorkbenchState = {}));
    function isWorkspace(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && typeof candidate.id === 'string'
            && Array.isArray(candidate.folders));
    }
    exports.isWorkspace = isWorkspace;
    function isWorkspaceFolder(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && uri_1.URI.isUri(candidate.uri)
            && typeof candidate.name === 'string'
            && typeof candidate.toResource === 'function');
    }
    exports.isWorkspaceFolder = isWorkspaceFolder;
    class Workspace {
        constructor(_id, folders, _transient, _configuration, _ignorePathCasing) {
            this._id = _id;
            this._transient = _transient;
            this._configuration = _configuration;
            this._ignorePathCasing = _ignorePathCasing;
            this._foldersMap = ternarySearchTree_1.TernarySearchTree.forUris(this._ignorePathCasing, () => true);
            this.folders = folders;
        }
        update(workspace) {
            this._id = workspace.id;
            this._configuration = workspace.configuration;
            this._transient = workspace.transient;
            this._ignorePathCasing = workspace._ignorePathCasing;
            this.folders = workspace.folders;
        }
        get folders() {
            return this._folders;
        }
        set folders(folders) {
            this._folders = folders;
            this.updateFoldersMap();
        }
        get id() {
            return this._id;
        }
        get transient() {
            return this._transient;
        }
        get configuration() {
            return this._configuration;
        }
        set configuration(configuration) {
            this._configuration = configuration;
        }
        getFolder(resource) {
            if (!resource) {
                return null;
            }
            return this._foldersMap.findSubstr(resource) || null;
        }
        updateFoldersMap() {
            this._foldersMap = ternarySearchTree_1.TernarySearchTree.forUris(this._ignorePathCasing, () => true);
            for (const folder of this.folders) {
                this._foldersMap.set(folder.uri, folder);
            }
        }
        toJSON() {
            return { id: this.id, folders: this.folders, transient: this.transient, configuration: this.configuration };
        }
    }
    exports.Workspace = Workspace;
    class WorkspaceFolder {
        constructor(data, 
        /**
         * Provides access to the original metadata for this workspace
         * folder. This can be different from the metadata provided in
         * this class:
         * - raw paths can be relative
         * - raw paths are not normalized
         */
        raw) {
            this.raw = raw;
            this.uri = data.uri;
            this.index = data.index;
            this.name = data.name;
        }
        toResource(relativePath) {
            return (0, resources_1.joinPath)(this.uri, relativePath);
        }
        toJSON() {
            return { uri: this.uri, name: this.name, index: this.index };
        }
    }
    exports.WorkspaceFolder = WorkspaceFolder;
    function toWorkspaceFolder(resource) {
        return new WorkspaceFolder({ uri: resource, index: 0, name: (0, resources_1.basenameOrAuthority)(resource) }, { uri: resource.toString() });
    }
    exports.toWorkspaceFolder = toWorkspaceFolder;
    exports.WORKSPACE_EXTENSION = 'code-workspace';
    exports.WORKSPACE_SUFFIX = `.${exports.WORKSPACE_EXTENSION}`;
    exports.WORKSPACE_FILTER = [{ name: (0, nls_1.localize)('codeWorkspace', "Code Workspace"), extensions: [exports.WORKSPACE_EXTENSION] }];
    exports.UNTITLED_WORKSPACE_NAME = 'workspace.json';
    function isUntitledWorkspace(path, environmentService) {
        return resources_1.extUriBiasedIgnorePathCase.isEqualOrParent(path, environmentService.untitledWorkspacesHome);
    }
    exports.isUntitledWorkspace = isUntitledWorkspace;
    function isTemporaryWorkspace(arg1) {
        let path;
        if (uri_1.URI.isUri(arg1)) {
            path = arg1;
        }
        else {
            path = arg1.configuration;
        }
        return path?.scheme === network_1.Schemas.tmp;
    }
    exports.isTemporaryWorkspace = isTemporaryWorkspace;
    exports.STANDALONE_EDITOR_WORKSPACE_ID = '4064f6ec-cb38-4ad0-af64-ee6467e63c82';
    function isStandaloneEditorWorkspace(workspace) {
        return workspace.id === exports.STANDALONE_EDITOR_WORKSPACE_ID;
    }
    exports.isStandaloneEditorWorkspace = isStandaloneEditorWorkspace;
    function isSavedWorkspace(path, environmentService) {
        return !isUntitledWorkspace(path, environmentService) && !isTemporaryWorkspace(path);
    }
    exports.isSavedWorkspace = isSavedWorkspace;
    function hasWorkspaceFileExtension(path) {
        const ext = (typeof path === 'string') ? (0, path_1.extname)(path) : (0, resources_1.extname)(path);
        return ext === exports.WORKSPACE_SUFFIX;
    }
    exports.hasWorkspaceFileExtension = hasWorkspaceFileExtension;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS93b3Jrc3BhY2UvY29tbW9uL3dvcmtzcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZbkYsUUFBQSx3QkFBd0IsR0FBRyxJQUFBLCtCQUFlLEVBQTJCLGdCQUFnQixDQUFDLENBQUM7SUF5SHBHLFNBQWdCLGlDQUFpQyxDQUFDLEdBQVk7UUFDN0QsTUFBTSxzQkFBc0IsR0FBRyxHQUFtRCxDQUFDO1FBRW5GLE9BQU8sT0FBTyxzQkFBc0IsRUFBRSxFQUFFLEtBQUssUUFBUSxJQUFJLFNBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEcsQ0FBQztJQUpELDhFQUlDO0lBRUQsU0FBZ0IsMEJBQTBCLENBQUMsR0FBWTtRQUN0RCxNQUFNLHdCQUF3QixHQUFHLEdBQTRDLENBQUM7UUFDOUUsT0FBTyxPQUFPLHdCQUF3QixFQUFFLEVBQUUsS0FBSyxRQUFRO2VBQ25ELENBQUMsaUNBQWlDLENBQUMsR0FBRyxDQUFDO2VBQ3ZDLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUxELGdFQUtDO0lBRVksUUFBQSw0Q0FBNEMsR0FBOEIsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDNUYsUUFBQSw4QkFBOEIsR0FBOEIsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUM7SUFJaEcsU0FBZ0IscUJBQXFCLENBQUMsSUFBcUMsRUFBRSxzQkFBZ0M7UUFFNUcsa0JBQWtCO1FBQ2xCLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBRTdELG9FQUFvRTtZQUNwRSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUM5QixPQUFPO29CQUNOLEVBQUUsRUFBRSxJQUFBLGVBQVEsRUFBQyxJQUFJLENBQUM7aUJBQ2xCLENBQUM7WUFDSCxDQUFDO1lBRUQsNERBQTREO1lBQzVELDZEQUE2RDtZQUM3RCwrREFBK0Q7WUFDL0QsSUFBSSxzQkFBc0IsRUFBRSxDQUFDO2dCQUM1QixPQUFPLG9EQUE0QyxDQUFDO1lBQ3JELENBQUM7WUFFRCxPQUFPLHNDQUE4QixDQUFDO1FBQ3ZDLENBQUM7UUFFRCxhQUFhO1FBQ2IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzdCLE9BQU87Z0JBQ04sRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUNoQixVQUFVLEVBQUUsU0FBUyxDQUFDLGFBQWE7YUFDbkMsQ0FBQztRQUNILENBQUM7UUFFRCxnQkFBZ0I7UUFDaEIsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNwQyxPQUFPO2dCQUNOLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRTtnQkFDaEIsR0FBRyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRzthQUM3QixDQUFDO1FBQ0gsQ0FBQztRQUVELGVBQWU7UUFDZixPQUFPO1lBQ04sRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFO1NBQ2hCLENBQUM7SUFDSCxDQUFDO0lBM0NELHNEQTJDQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLEdBQVk7UUFDakQsTUFBTSxtQkFBbUIsR0FBRyxHQUF1QyxDQUFDO1FBRXBFLE9BQU8sT0FBTyxtQkFBbUIsRUFBRSxFQUFFLEtBQUssUUFBUSxJQUFJLFNBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUpELHNEQUlDO0lBZUQsU0FBZ0IsZ0JBQWdCLENBQUMsVUFBK0g7UUFFL0osZ0JBQWdCO1FBQ2hCLE1BQU0sK0JBQStCLEdBQUcsVUFBb0UsQ0FBQztRQUM3RyxJQUFJLCtCQUErQixFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQzFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsK0JBQStCLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLCtCQUErQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDekcsQ0FBQztRQUVELGVBQWU7UUFDZixNQUFNLDRCQUE0QixHQUFHLFVBQXdELENBQUM7UUFDOUYsSUFBSSw0QkFBNEIsRUFBRSxVQUFVLEVBQUUsQ0FBQztZQUM5QyxPQUFPLEVBQUUsRUFBRSxFQUFFLDRCQUE0QixDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ2pILENBQUM7UUFFRCxRQUFRO1FBQ1IsSUFBSSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDcEIsT0FBTyxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFwQkQsNENBb0JDO0lBRUQsSUFBa0IsY0FJakI7SUFKRCxXQUFrQixjQUFjO1FBQy9CLHFEQUFTLENBQUE7UUFDVCx1REFBTSxDQUFBO1FBQ04sNkRBQVMsQ0FBQTtJQUNWLENBQUMsRUFKaUIsY0FBYyw4QkFBZCxjQUFjLFFBSS9CO0lBeUNELFNBQWdCLFdBQVcsQ0FBQyxLQUFjO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLEtBQStCLENBQUM7UUFFbEQsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUTtlQUNoRCxPQUFPLFNBQVMsQ0FBQyxFQUFFLEtBQUssUUFBUTtlQUNoQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFORCxrQ0FNQztJQTZCRCxTQUFnQixpQkFBaUIsQ0FBQyxLQUFjO1FBQy9DLE1BQU0sU0FBUyxHQUFHLEtBQXlCLENBQUM7UUFFNUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUTtlQUNoRCxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7ZUFDeEIsT0FBTyxTQUFTLENBQUMsSUFBSSxLQUFLLFFBQVE7ZUFDbEMsT0FBTyxTQUFTLENBQUMsVUFBVSxLQUFLLFVBQVUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFQRCw4Q0FPQztJQUVELE1BQWEsU0FBUztRQUtyQixZQUNTLEdBQVcsRUFDbkIsT0FBMEIsRUFDbEIsVUFBbUIsRUFDbkIsY0FBMEIsRUFDMUIsaUJBQXdDO1lBSnhDLFFBQUcsR0FBSCxHQUFHLENBQVE7WUFFWCxlQUFVLEdBQVYsVUFBVSxDQUFTO1lBQ25CLG1CQUFjLEdBQWQsY0FBYyxDQUFZO1lBQzFCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBdUI7WUFSekMsZ0JBQVcsR0FBNEMscUNBQWlCLENBQUMsT0FBTyxDQUFrQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFVN0ksSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDeEIsQ0FBQztRQUVELE1BQU0sQ0FBQyxTQUFvQjtZQUMxQixJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDO1lBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztZQUN0QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUFDO1lBQ3JELElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztRQUNsQyxDQUFDO1FBRUQsSUFBSSxPQUFPO1lBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUEwQjtZQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBSSxFQUFFO1lBQ0wsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQUksYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDNUIsQ0FBQztRQUVELElBQUksYUFBYSxDQUFDLGFBQXlCO1lBQzFDLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBQ3JDLENBQUM7UUFFRCxTQUFTLENBQUMsUUFBYTtZQUN0QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2YsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDdEQsQ0FBQztRQUVPLGdCQUFnQjtZQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLHFDQUFpQixDQUFDLE9BQU8sQ0FBa0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xHLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLENBQUM7UUFDRixDQUFDO1FBRUQsTUFBTTtZQUNMLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdHLENBQUM7S0FDRDtJQWxFRCw4QkFrRUM7SUFZRCxNQUFhLGVBQWU7UUFNM0IsWUFDQyxJQUEwQjtRQUMxQjs7Ozs7O1dBTUc7UUFDTSxHQUFzRDtZQUF0RCxRQUFHLEdBQUgsR0FBRyxDQUFtRDtZQUUvRCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixDQUFDO1FBRUQsVUFBVSxDQUFDLFlBQW9CO1lBQzlCLE9BQU8sSUFBQSxvQkFBUSxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELE1BQU07WUFDTCxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM5RCxDQUFDO0tBQ0Q7SUE3QkQsMENBNkJDO0lBRUQsU0FBZ0IsaUJBQWlCLENBQUMsUUFBYTtRQUM5QyxPQUFPLElBQUksZUFBZSxDQUFDLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFBLCtCQUFtQixFQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM1SCxDQUFDO0lBRkQsOENBRUM7SUFFWSxRQUFBLG1CQUFtQixHQUFHLGdCQUFnQixDQUFDO0lBQ3ZDLFFBQUEsZ0JBQWdCLEdBQUcsSUFBSSwyQkFBbUIsRUFBRSxDQUFDO0lBQzdDLFFBQUEsZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQywyQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5RyxRQUFBLHVCQUF1QixHQUFHLGdCQUFnQixDQUFDO0lBRXhELFNBQWdCLG1CQUFtQixDQUFDLElBQVMsRUFBRSxrQkFBdUM7UUFDckYsT0FBTyxzQ0FBMEIsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDcEcsQ0FBQztJQUZELGtEQUVDO0lBSUQsU0FBZ0Isb0JBQW9CLENBQUMsSUFBc0I7UUFDMUQsSUFBSSxJQUE0QixDQUFDO1FBQ2pDLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3JCLElBQUksR0FBRyxJQUFJLENBQUM7UUFDYixDQUFDO2FBQU0sQ0FBQztZQUNQLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzNCLENBQUM7UUFFRCxPQUFPLElBQUksRUFBRSxNQUFNLEtBQUssaUJBQU8sQ0FBQyxHQUFHLENBQUM7SUFDckMsQ0FBQztJQVRELG9EQVNDO0lBRVksUUFBQSw4QkFBOEIsR0FBRyxzQ0FBc0MsQ0FBQztJQUNyRixTQUFnQiwyQkFBMkIsQ0FBQyxTQUFxQjtRQUNoRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLEtBQUssc0NBQThCLENBQUM7SUFDeEQsQ0FBQztJQUZELGtFQUVDO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBUyxFQUFFLGtCQUF1QztRQUNsRixPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRkQsNENBRUM7SUFFRCxTQUFnQix5QkFBeUIsQ0FBQyxJQUFrQjtRQUMzRCxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxtQkFBZSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9FLE9BQU8sR0FBRyxLQUFLLHdCQUFnQixDQUFDO0lBQ2pDLENBQUM7SUFKRCw4REFJQyJ9
//# sourceURL=../../../vs/platform/workspace/common/workspace.js
})
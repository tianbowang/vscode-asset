/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/json", "vs/base/common/jsonEdit", "vs/base/common/labels", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/workspace"], function (require, exports, extpath_1, json, jsonEdit, labels_1, network_1, path_1, platform_1, resources_1, uri_1, instantiation_1, remoteHosts_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toStoreData = exports.restoreRecentlyOpened = exports.rewriteWorkspaceFileForNewLocation = exports.toWorkspaceFolders = exports.getStoredWorkspaceFolder = exports.isStoredWorkspaceFolder = exports.isRecentFile = exports.isRecentFolder = exports.isRecentWorkspace = exports.IWorkspacesService = void 0;
    exports.IWorkspacesService = (0, instantiation_1.createDecorator)('workspacesService');
    function isRecentWorkspace(curr) {
        return curr.hasOwnProperty('workspace');
    }
    exports.isRecentWorkspace = isRecentWorkspace;
    function isRecentFolder(curr) {
        return curr.hasOwnProperty('folderUri');
    }
    exports.isRecentFolder = isRecentFolder;
    function isRecentFile(curr) {
        return curr.hasOwnProperty('fileUri');
    }
    exports.isRecentFile = isRecentFile;
    //#endregion
    //#region Workspace File Utilities
    function isStoredWorkspaceFolder(obj) {
        return isRawFileWorkspaceFolder(obj) || isRawUriWorkspaceFolder(obj);
    }
    exports.isStoredWorkspaceFolder = isStoredWorkspaceFolder;
    function isRawFileWorkspaceFolder(obj) {
        const candidate = obj;
        return typeof candidate?.path === 'string' && (!candidate.name || typeof candidate.name === 'string');
    }
    function isRawUriWorkspaceFolder(obj) {
        const candidate = obj;
        return typeof candidate?.uri === 'string' && (!candidate.name || typeof candidate.name === 'string');
    }
    /**
     * Given a folder URI and the workspace config folder, computes the `IStoredWorkspaceFolder`
     * using a relative or absolute path or a uri.
     * Undefined is returned if the `folderURI` and the `targetConfigFolderURI` don't have the
     * same schema or authority.
     *
     * @param folderURI a workspace folder
     * @param forceAbsolute if set, keep the path absolute
     * @param folderName a workspace name
     * @param targetConfigFolderURI the folder where the workspace is living in
     */
    function getStoredWorkspaceFolder(folderURI, forceAbsolute, folderName, targetConfigFolderURI, extUri) {
        // Scheme mismatch: use full absolute URI as `uri`
        if (folderURI.scheme !== targetConfigFolderURI.scheme) {
            return { name: folderName, uri: folderURI.toString(true) };
        }
        // Always prefer a relative path if possible unless
        // prevented to make the workspace file shareable
        // with other users
        let folderPath = !forceAbsolute ? extUri.relativePath(targetConfigFolderURI, folderURI) : undefined;
        if (folderPath !== undefined) {
            if (folderPath.length === 0) {
                folderPath = '.';
            }
            else {
                if (platform_1.isWindows) {
                    folderPath = massagePathForWindows(folderPath);
                }
            }
        }
        // We could not resolve a relative path
        else {
            // Local file: use `fsPath`
            if (folderURI.scheme === network_1.Schemas.file) {
                folderPath = folderURI.fsPath;
                if (platform_1.isWindows) {
                    folderPath = massagePathForWindows(folderPath);
                }
            }
            // Different authority: use full absolute URI
            else if (!extUri.isEqualAuthority(folderURI.authority, targetConfigFolderURI.authority)) {
                return { name: folderName, uri: folderURI.toString(true) };
            }
            // Non-local file: use `path` of URI
            else {
                folderPath = folderURI.path;
            }
        }
        return { name: folderName, path: folderPath };
    }
    exports.getStoredWorkspaceFolder = getStoredWorkspaceFolder;
    function massagePathForWindows(folderPath) {
        // Drive letter should be upper case
        folderPath = (0, labels_1.normalizeDriveLetter)(folderPath);
        // Always prefer slash over backslash unless
        // we deal with UNC paths where backslash is
        // mandatory.
        if (!(0, extpath_1.isUNC)(folderPath)) {
            folderPath = (0, extpath_1.toSlashes)(folderPath);
        }
        return folderPath;
    }
    function toWorkspaceFolders(configuredFolders, workspaceConfigFile, extUri) {
        const result = [];
        const seen = new Set();
        const relativeTo = extUri.dirname(workspaceConfigFile);
        for (const configuredFolder of configuredFolders) {
            let uri = undefined;
            if (isRawFileWorkspaceFolder(configuredFolder)) {
                if (configuredFolder.path) {
                    uri = extUri.resolvePath(relativeTo, configuredFolder.path);
                }
            }
            else if (isRawUriWorkspaceFolder(configuredFolder)) {
                try {
                    uri = uri_1.URI.parse(configuredFolder.uri);
                    if (uri.path[0] !== path_1.posix.sep) {
                        uri = uri.with({ path: path_1.posix.sep + uri.path }); // this makes sure all workspace folder are absolute
                    }
                }
                catch (e) {
                    console.warn(e); // ignore
                }
            }
            if (uri) {
                // remove duplicates
                const comparisonKey = extUri.getComparisonKey(uri);
                if (!seen.has(comparisonKey)) {
                    seen.add(comparisonKey);
                    const name = configuredFolder.name || extUri.basenameOrAuthority(uri);
                    result.push(new workspace_1.WorkspaceFolder({ uri, name, index: result.length }, configuredFolder));
                }
            }
        }
        return result;
    }
    exports.toWorkspaceFolders = toWorkspaceFolders;
    /**
     * Rewrites the content of a workspace file to be saved at a new location.
     * Throws an exception if file is not a valid workspace file
     */
    function rewriteWorkspaceFileForNewLocation(rawWorkspaceContents, configPathURI, isFromUntitledWorkspace, targetConfigPathURI, extUri) {
        const storedWorkspace = doParseStoredWorkspace(configPathURI, rawWorkspaceContents);
        const sourceConfigFolder = extUri.dirname(configPathURI);
        const targetConfigFolder = extUri.dirname(targetConfigPathURI);
        const rewrittenFolders = [];
        for (const folder of storedWorkspace.folders) {
            const folderURI = isRawFileWorkspaceFolder(folder) ? extUri.resolvePath(sourceConfigFolder, folder.path) : uri_1.URI.parse(folder.uri);
            let absolute;
            if (isFromUntitledWorkspace) {
                absolute = false; // if it was an untitled workspace, try to make paths relative
            }
            else {
                absolute = !isRawFileWorkspaceFolder(folder) || (0, path_1.isAbsolute)(folder.path); // for existing workspaces, preserve whether a path was absolute or relative
            }
            rewrittenFolders.push(getStoredWorkspaceFolder(folderURI, absolute, folder.name, targetConfigFolder, extUri));
        }
        // Preserve as much of the existing workspace as possible by using jsonEdit
        // and only changing the folders portion.
        const formattingOptions = { insertSpaces: false, tabSize: 4, eol: (platform_1.isLinux || platform_1.isMacintosh) ? '\n' : '\r\n' };
        const edits = jsonEdit.setProperty(rawWorkspaceContents, ['folders'], rewrittenFolders, formattingOptions);
        let newContent = jsonEdit.applyEdits(rawWorkspaceContents, edits);
        if ((0, resources_1.isEqualAuthority)(storedWorkspace.remoteAuthority, (0, remoteHosts_1.getRemoteAuthority)(targetConfigPathURI))) {
            // unsaved remote workspaces have the remoteAuthority set. Remove it when no longer nexessary.
            newContent = jsonEdit.applyEdits(newContent, jsonEdit.removeProperty(newContent, ['remoteAuthority'], formattingOptions));
        }
        return newContent;
    }
    exports.rewriteWorkspaceFileForNewLocation = rewriteWorkspaceFileForNewLocation;
    function doParseStoredWorkspace(path, contents) {
        // Parse workspace file
        const storedWorkspace = json.parse(contents); // use fault tolerant parser
        // Filter out folders which do not have a path or uri set
        if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
            storedWorkspace.folders = storedWorkspace.folders.filter(folder => isStoredWorkspaceFolder(folder));
        }
        else {
            throw new Error(`${path} looks like an invalid workspace file.`);
        }
        return storedWorkspace;
    }
    function isSerializedRecentWorkspace(data) {
        return data.workspace && typeof data.workspace === 'object' && typeof data.workspace.id === 'string' && typeof data.workspace.configPath === 'string';
    }
    function isSerializedRecentFolder(data) {
        return typeof data.folderUri === 'string';
    }
    function isSerializedRecentFile(data) {
        return typeof data.fileUri === 'string';
    }
    function restoreRecentlyOpened(data, logService) {
        const result = { workspaces: [], files: [] };
        if (data) {
            const restoreGracefully = function (entries, onEntry) {
                for (let i = 0; i < entries.length; i++) {
                    try {
                        onEntry(entries[i], i);
                    }
                    catch (e) {
                        logService.warn(`Error restoring recent entry ${JSON.stringify(entries[i])}: ${e.toString()}. Skip entry.`);
                    }
                }
            };
            const storedRecents = data;
            if (Array.isArray(storedRecents.entries)) {
                restoreGracefully(storedRecents.entries, entry => {
                    const label = entry.label;
                    const remoteAuthority = entry.remoteAuthority;
                    if (isSerializedRecentWorkspace(entry)) {
                        result.workspaces.push({ label, remoteAuthority, workspace: { id: entry.workspace.id, configPath: uri_1.URI.parse(entry.workspace.configPath) } });
                    }
                    else if (isSerializedRecentFolder(entry)) {
                        result.workspaces.push({ label, remoteAuthority, folderUri: uri_1.URI.parse(entry.folderUri) });
                    }
                    else if (isSerializedRecentFile(entry)) {
                        result.files.push({ label, remoteAuthority, fileUri: uri_1.URI.parse(entry.fileUri) });
                    }
                });
            }
        }
        return result;
    }
    exports.restoreRecentlyOpened = restoreRecentlyOpened;
    function toStoreData(recents) {
        const serialized = { entries: [] };
        for (const recent of recents.workspaces) {
            if (isRecentFolder(recent)) {
                serialized.entries.push({ folderUri: recent.folderUri.toString(), label: recent.label, remoteAuthority: recent.remoteAuthority });
            }
            else {
                serialized.entries.push({ workspace: { id: recent.workspace.id, configPath: recent.workspace.configPath.toString() }, label: recent.label, remoteAuthority: recent.remoteAuthority });
            }
        }
        for (const recent of recents.files) {
            serialized.entries.push({ fileUri: recent.fileUri.toString(), label: recent.label, remoteAuthority: recent.remoteAuthority });
        }
        return serialized;
    }
    exports.toStoreData = toStoreData;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd29ya3NwYWNlcy9jb21tb24vd29ya3NwYWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQm5GLFFBQUEsa0JBQWtCLEdBQUcsSUFBQSwrQkFBZSxFQUFxQixtQkFBbUIsQ0FBQyxDQUFDO0lBa0QzRixTQUFnQixpQkFBaUIsQ0FBQyxJQUFhO1FBQzlDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRkQsOENBRUM7SUFFRCxTQUFnQixjQUFjLENBQUMsSUFBYTtRQUMzQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUZELHdDQUVDO0lBRUQsU0FBZ0IsWUFBWSxDQUFDLElBQWE7UUFDekMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFGRCxvQ0FFQztJQUVELFlBQVk7SUFFWixrQ0FBa0M7SUFFbEMsU0FBZ0IsdUJBQXVCLENBQUMsR0FBWTtRQUNuRCxPQUFPLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxJQUFJLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFGRCwwREFFQztJQUVELFNBQVMsd0JBQXdCLENBQUMsR0FBWTtRQUM3QyxNQUFNLFNBQVMsR0FBRyxHQUEwQyxDQUFDO1FBRTdELE9BQU8sT0FBTyxTQUFTLEVBQUUsSUFBSSxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxPQUFPLFNBQVMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUM7SUFDdkcsQ0FBQztJQUVELFNBQVMsdUJBQXVCLENBQUMsR0FBWTtRQUM1QyxNQUFNLFNB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
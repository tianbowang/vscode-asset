/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "crypto", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources"], function (require, exports, crypto_1, network_1, platform_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createEmptyWorkspaceIdentifier = exports.getSingleFolderWorkspaceIdentifier = exports.getWorkspaceIdentifier = exports.NON_EMPTY_WORKSPACE_ID_LENGTH = void 0;
    /**
     * Length of workspace identifiers that are not empty. Those are
     * MD5 hashes (128bits / 4 due to hex presentation).
     */
    exports.NON_EMPTY_WORKSPACE_ID_LENGTH = 128 / 4;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function getWorkspaceIdentifier(configPath) {
        function getWorkspaceId() {
            let configPathStr = configPath.scheme === network_1.Schemas.file ? (0, resources_1.originalFSPath)(configPath) : configPath.toString();
            if (!platform_1.isLinux) {
                configPathStr = configPathStr.toLowerCase(); // sanitize for platform file system
            }
            return (0, crypto_1.createHash)('md5').update(configPathStr).digest('hex'); // CodeQL [SM04514] Using MD5 to convert a file path to a fixed length
        }
        return {
            id: getWorkspaceId(),
            configPath
        };
    }
    exports.getWorkspaceIdentifier = getWorkspaceIdentifier;
    function getSingleFolderWorkspaceIdentifier(folderUri, folderStat) {
        function getFolderId() {
            // Remote: produce a hash from the entire URI
            if (folderUri.scheme !== network_1.Schemas.file) {
                return (0, crypto_1.createHash)('md5').update(folderUri.toString()).digest('hex'); // CodeQL [SM04514] Using MD5 to convert a file path to a fixed length
            }
            // Local: we use the ctime as extra salt to the
            // identifier so that folders getting recreated
            // result in a different identifier. However, if
            // the stat is not provided we return `undefined`
            // to ensure identifiers are stable for the given
            // URI.
            if (!folderStat) {
                return undefined;
            }
            let ctime;
            if (platform_1.isLinux) {
                ctime = folderStat.ino; // Linux: birthtime is ctime, so we cannot use it! We use the ino instead!
            }
            else if (platform_1.isMacintosh) {
                ctime = folderStat.birthtime.getTime(); // macOS: birthtime is fine to use as is
            }
            else if (platform_1.isWindows) {
                if (typeof folderStat.birthtimeMs === 'number') {
                    ctime = Math.floor(folderStat.birthtimeMs); // Windows: fix precision issue in node.js 8.x to get 7.x results (see https://github.com/nodejs/node/issues/19897)
                }
                else {
                    ctime = folderStat.birthtime.getTime();
                }
            }
            return (0, crypto_1.createHash)('md5').update(folderUri.fsPath).update(ctime ? String(ctime) : '').digest('hex'); // CodeQL [SM04514] Using MD5 to convert a file path to a fixed length
        }
        const folderId = getFolderId();
        if (typeof folderId === 'string') {
            return {
                id: folderId,
                uri: folderUri
            };
        }
        return undefined; // invalid folder
    }
    exports.getSingleFolderWorkspaceIdentifier = getSingleFolderWorkspaceIdentifier;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function createEmptyWorkspaceIdentifier() {
        return {
            id: (Date.now() + Math.round(Math.random() * 1000)).toString()
        };
    }
    exports.createEmptyWorkspaceIdentifier = createEmptyWorkspaceIdentifier;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd29ya3NwYWNlcy9ub2RlL3dvcmtzcGFjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHOzs7T0FHRztJQUNVLFFBQUEsNkJBQTZCLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUVyRCx5REFBeUQ7SUFDekQseURBQXlEO0lBQ3pELHlEQUF5RDtJQUV6RCxTQUFnQixzQkFBc0IsQ0FBQyxVQUFlO1FBRXJELFNBQVMsY0FBYztZQUN0QixJQUFJLGFBQWEsR0FBRyxVQUFVLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFBLDBCQUFjLEVBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM1RyxJQUFJLENBQUMsa0JBQU8sRUFBRSxDQUFDO2dCQUNkLGFBQWEsR0FBRyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxvQ0FBb0M7WUFDbEYsQ0FBQztZQUVELE9BQU8sSUFBQSxtQkFBVSxFQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxzRUFBc0U7UUFDckksQ0FBQztRQUVELE9BQU87WUFDTixFQUFFLEVBQUUsY0FBYyxFQUFFO1lBQ3BCLFVBQVU7U0FDVixDQUFDO0lBQ0gsQ0FBQztJQWZELHdEQWVDO0lBUUQsU0FBZ0Isa0NBQWtDLENBQUMsU0FBYyxFQUFFLFVBQWtCO1FBRXBGLFNBQVMsV0FBVztZQUVuQiw2Q0FBNkM7WUFDN0MsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3ZDLE9BQU8sSUFBQSxtQkFBVSxFQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxzRUFBc0U7WUFDNUksQ0FBQztZQUVELCtDQUErQztZQUMvQywrQ0FBK0M7WUFDL0MsZ0RBQWdEO1lBQ2hELGlEQUFpRDtZQUNqRCxpREFBaUQ7WUFDakQsT0FBTztZQUVQLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDakIsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUVELElBQUksS0FBeUIsQ0FBQztZQUM5QixJQUFJLGtCQUFPLEVBQUUsQ0FBQztnQkFDYixLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLDBFQUEwRTtZQUNuRyxDQUFDO2lCQUFNLElBQUksc0JBQVcsRUFBRSxDQUFDO2dCQUN4QixLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLHdDQUF3QztZQUNqRixDQUFDO2lCQUFNLElBQUksb0JBQVMsRUFBRSxDQUFDO2dCQUN0QixJQUFJLE9BQU8sVUFBVSxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDaEQsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsbUhBQW1IO2dCQUNoSyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsS0FBSyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3hDLENBQUM7WUFDRixDQUFDO1lBRUQsT0FBTyxJQUFBLG1CQUFVLEVBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLHNFQUFzRTtRQUMzSyxDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcsV0FBVyxFQUFFLENBQUM7UUFDL0IsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNsQyxPQUFPO2dCQUNOLEVBQUUsRUFBRSxRQUFRO2dCQUNaLEdBQUcsRUFBRSxTQUFTO2FBQ2QsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQyxDQUFDLGlCQUFpQjtJQUNwQyxDQUFDO0lBN0NELGdGQTZDQztJQUVELHlEQUF5RDtJQUN6RCx5REFBeUQ7SUFDekQseURBQXlEO0lBRXpELFNBQWdCLDhCQUE4QjtRQUM3QyxPQUFPO1lBQ04sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO1NBQzlELENBQUM7SUFDSCxDQUFDO0lBSkQsd0VBSUMifQ==
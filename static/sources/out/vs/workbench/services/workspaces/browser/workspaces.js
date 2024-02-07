/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/hash"], function (require, exports, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSingleFolderWorkspaceIdentifier = exports.getWorkspaceIdentifier = void 0;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function getWorkspaceIdentifier(workspaceUri) {
        return {
            id: getWorkspaceId(workspaceUri),
            configPath: workspaceUri
        };
    }
    exports.getWorkspaceIdentifier = getWorkspaceIdentifier;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function getSingleFolderWorkspaceIdentifier(folderUri) {
        return {
            id: getWorkspaceId(folderUri),
            uri: folderUri
        };
    }
    exports.getSingleFolderWorkspaceIdentifier = getSingleFolderWorkspaceIdentifier;
    function getWorkspaceId(uri) {
        return (0, hash_1.hash)(uri.toString()).toString(16);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtzcGFjZXMvYnJvd3Nlci93b3Jrc3BhY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyx5REFBeUQ7SUFDekQseURBQXlEO0lBQ3pELHlEQUF5RDtJQUV6RCxTQUFnQixzQkFBc0IsQ0FBQyxZQUFpQjtRQUN2RCxPQUFPO1lBQ04sRUFBRSxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUM7WUFDaEMsVUFBVSxFQUFFLFlBQVk7U0FDeEIsQ0FBQztJQUNILENBQUM7SUFMRCx3REFLQztJQUVELHlEQUF5RDtJQUN6RCx5REFBeUQ7SUFDekQseURBQXlEO0lBRXpELFNBQWdCLGtDQUFrQyxDQUFDLFNBQWM7UUFDaEUsT0FBTztZQUNOLEVBQUUsRUFBRSxjQUFjLENBQUMsU0FBUyxDQUFDO1lBQzdCLEdBQUcsRUFBRSxTQUFTO1NBQ2QsQ0FBQztJQUNILENBQUM7SUFMRCxnRkFLQztJQUVELFNBQVMsY0FBYyxDQUFDLEdBQVE7UUFDL0IsT0FBTyxJQUFBLFdBQUksRUFBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQyJ9
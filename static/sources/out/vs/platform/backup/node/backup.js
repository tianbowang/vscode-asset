/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deserializeFolderInfos = exports.deserializeWorkspaceInfos = exports.isEmptyWindowBackupInfo = void 0;
    function isEmptyWindowBackupInfo(obj) {
        const candidate = obj;
        return typeof candidate?.backupFolder === 'string';
    }
    exports.isEmptyWindowBackupInfo = isEmptyWindowBackupInfo;
    function deserializeWorkspaceInfos(serializedBackupWorkspaces) {
        let workspaceBackupInfos = [];
        try {
            if (Array.isArray(serializedBackupWorkspaces.workspaces)) {
                workspaceBackupInfos = serializedBackupWorkspaces.workspaces.map(workspace => ({
                    workspace: {
                        id: workspace.id,
                        configPath: uri_1.URI.parse(workspace.configURIPath)
                    },
                    remoteAuthority: workspace.remoteAuthority
                }));
            }
        }
        catch (e) {
            // ignore URI parsing exceptions
        }
        return workspaceBackupInfos;
    }
    exports.deserializeWorkspaceInfos = deserializeWorkspaceInfos;
    function deserializeFolderInfos(serializedBackupWorkspaces) {
        let folderBackupInfos = [];
        try {
            if (Array.isArray(serializedBackupWorkspaces.folders)) {
                folderBackupInfos = serializedBackupWorkspaces.folders.map(folder => ({
                    folderUri: uri_1.URI.parse(folder.folderUri),
                    remoteAuthority: folder.remoteAuthority
                }));
            }
        }
        catch (e) {
            // ignore URI parsing exceptions
        }
        return folderBackupInfos;
    }
    exports.deserializeFolderInfos = deserializeFolderInfos;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3VwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9iYWNrdXAvbm9kZS9iYWNrdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLFNBQWdCLHVCQUF1QixDQUFDLEdBQVk7UUFDbkQsTUFBTSxTQUFTLEdBQUcsR0FBeUMsQ0FBQztRQUU1RCxPQUFPLE9BQU8sU0FBUyxFQUFFLFlBQVksS0FBSyxRQUFRLENBQUM7SUFDcEQsQ0FBQztJQUpELDBEQUlDO0lBUUQsU0FBZ0IseUJBQXlCLENBQUMsMEJBQXVEO1FBQ2hHLElBQUksb0JBQW9CLEdBQTJCLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUM7WUFDSixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDMUQsb0JBQW9CLEdBQUcsMEJBQTBCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQzdFO29CQUNDLFNBQVMsRUFBRTt3QkFDVixFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQUU7d0JBQ2hCLFVBQVUsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7cUJBQzlDO29CQUNELGVBQWUsRUFBRSxTQUFTLENBQUMsZUFBZTtpQkFDMUMsQ0FDRCxDQUFDLENBQUM7WUFDSixDQUFDO1FBQ0YsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDWixnQ0FBZ0M7UUFDakMsQ0FBQztRQUVELE9BQU8sb0JBQW9CLENBQUM7SUFDN0IsQ0FBQztJQW5CRCw4REFtQkM7SUFPRCxTQUFnQixzQkFBc0IsQ0FBQywwQkFBdUQ7UUFDN0YsSUFBSSxpQkFBaUIsR0FBd0IsRUFBRSxDQUFDO1FBQ2hELElBQUksQ0FBQztZQUNKLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUN2RCxpQkFBaUIsR0FBRywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FDcEU7b0JBQ0MsU0FBUyxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztvQkFDdEMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxlQUFlO2lCQUN2QyxDQUNELENBQUMsQ0FBQztZQUNKLENBQUM7UUFDRixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNaLGdDQUFnQztRQUNqQyxDQUFDO1FBRUQsT0FBTyxpQkFBaUIsQ0FBQztJQUMxQixDQUFDO0lBaEJELHdEQWdCQyJ9
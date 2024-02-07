/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/workspace/common/workspace"], function (require, exports, resources_1, uri_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findWindowOnExtensionDevelopmentPath = exports.findWindowOnWorkspaceOrFolder = exports.findWindowOnFile = void 0;
    async function findWindowOnFile(windows, fileUri, localWorkspaceResolver) {
        // First check for windows with workspaces that have a parent folder of the provided path opened
        for (const window of windows) {
            const workspace = window.openedWorkspace;
            if ((0, workspace_1.isWorkspaceIdentifier)(workspace)) {
                const resolvedWorkspace = await localWorkspaceResolver(workspace);
                // resolved workspace: folders are known and can be compared with
                if (resolvedWorkspace) {
                    if (resolvedWorkspace.folders.some(folder => resources_1.extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, folder.uri))) {
                        return window;
                    }
                }
                // unresolved: can only compare with workspace location
                else {
                    if (resources_1.extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, workspace.configPath)) {
                        return window;
                    }
                }
            }
        }
        // Then go with single folder windows that are parent of the provided file path
        const singleFolderWindowsOnFilePath = windows.filter(window => (0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.openedWorkspace) && resources_1.extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, window.openedWorkspace.uri));
        if (singleFolderWindowsOnFilePath.length) {
            return singleFolderWindowsOnFilePath.sort((windowA, windowB) => -(windowA.openedWorkspace.uri.path.length - windowB.openedWorkspace.uri.path.length))[0];
        }
        return undefined;
    }
    exports.findWindowOnFile = findWindowOnFile;
    function findWindowOnWorkspaceOrFolder(windows, folderOrWorkspaceConfigUri) {
        for (const window of windows) {
            // check for workspace config path
            if ((0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace) && resources_1.extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.configPath, folderOrWorkspaceConfigUri)) {
                return window;
            }
            // check for folder path
            if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.openedWorkspace) && resources_1.extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.uri, folderOrWorkspaceConfigUri)) {
                return window;
            }
        }
        return undefined;
    }
    exports.findWindowOnWorkspaceOrFolder = findWindowOnWorkspaceOrFolder;
    function findWindowOnExtensionDevelopmentPath(windows, extensionDevelopmentPaths) {
        const matches = (uriString) => {
            return extensionDevelopmentPaths.some(path => resources_1.extUriBiasedIgnorePathCase.isEqual(uri_1.URI.file(path), uri_1.URI.file(uriString)));
        };
        for (const window of windows) {
            // match on extension development path. the path can be one or more paths
            // so we check if any of the paths match on any of the provided ones
            if (window.config?.extensionDevelopmentPath?.some(path => matches(path))) {
                return window;
            }
        }
        return undefined;
    }
    exports.findWindowOnExtensionDevelopmentPath = findWindowOnExtensionDevelopmentPath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c0ZpbmRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93cy9lbGVjdHJvbi1tYWluL3dpbmRvd3NGaW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT3pGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxPQUFzQixFQUFFLE9BQVksRUFBRSxzQkFBb0c7UUFFaEwsZ0dBQWdHO1FBQ2hHLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7WUFDOUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQztZQUN6QyxJQUFJLElBQUEsaUNBQXFCLEVBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDdEMsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVsRSxpRUFBaUU7Z0JBQ2pFLElBQUksaUJBQWlCLEVBQUUsQ0FBQztvQkFDdkIsSUFBSSxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsc0NBQTBCLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUMvRyxPQUFPLE1BQU0sQ0FBQztvQkFDZixDQUFDO2dCQUNGLENBQUM7Z0JBRUQsdURBQXVEO3FCQUNsRCxDQUFDO29CQUNMLElBQUksc0NBQTBCLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQzt3QkFDL0UsT0FBTyxNQUFNLENBQUM7b0JBQ2YsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFRCwrRUFBK0U7UUFDL0UsTUFBTSw2QkFBNkIsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBQSw2Q0FBaUMsRUFBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksc0NBQTBCLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN00sSUFBSSw2QkFBNkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMxQyxPQUFPLDZCQUE2QixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBRSxPQUFPLENBQUMsZUFBb0QsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBSSxPQUFPLENBQUMsZUFBb0QsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdE8sQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUEvQkQsNENBK0JDO0lBRUQsU0FBZ0IsNkJBQTZCLENBQUMsT0FBc0IsRUFBRSwwQkFBK0I7UUFFcEcsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUU5QixrQ0FBa0M7WUFDbEMsSUFBSSxJQUFBLGlDQUFxQixFQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxzQ0FBMEIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsMEJBQTBCLENBQUMsRUFBRSxDQUFDO2dCQUN4SixPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUM7WUFFRCx3QkFBd0I7WUFDeEIsSUFBSSxJQUFBLDZDQUFpQyxFQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxzQ0FBMEIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLENBQUMsRUFBRSxDQUFDO2dCQUM3SixPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQWhCRCxzRUFnQkM7SUFHRCxTQUFnQixvQ0FBb0MsQ0FBQyxPQUFzQixFQUFFLHlCQUFtQztRQUUvRyxNQUFNLE9BQU8sR0FBRyxDQUFDLFNBQWlCLEVBQVcsRUFBRTtZQUM5QyxPQUFPLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHNDQUEwQixDQUFDLE9BQU8sQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hILENBQUMsQ0FBQztRQUVGLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7WUFFOUIseUVBQXlFO1lBQ3pFLG9FQUFvRTtZQUNwRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDMUUsT0FBTyxNQUFNLENBQUM7WUFDZixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFoQkQsb0ZBZ0JDIn0=
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/tags/common/workspaceTags"], function (require, exports, extensions_1, workspaceTags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoOpWorkspaceTagsService = void 0;
    class NoOpWorkspaceTagsService {
        getTags() {
            return Promise.resolve({});
        }
        async getTelemetryWorkspaceId(workspace, state) {
            return undefined;
        }
        getHashedRemotesFromUri(workspaceUri, stripEndingDotGit) {
            return Promise.resolve([]);
        }
    }
    exports.NoOpWorkspaceTagsService = NoOpWorkspaceTagsService;
    (0, extensions_1.registerSingleton)(workspaceTags_1.IWorkspaceTagsService, NoOpWorkspaceTagsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVGFnc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3RhZ3MvYnJvd3Nlci93b3Jrc3BhY2VUYWdzU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsTUFBYSx3QkFBd0I7UUFJcEMsT0FBTztZQUNOLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFNBQXFCLEVBQUUsS0FBcUI7WUFDekUsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELHVCQUF1QixDQUFDLFlBQWlCLEVBQUUsaUJBQTJCO1lBQ3JFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQ0Q7SUFmRCw0REFlQztJQUVELElBQUEsOEJBQWlCLEVBQUMscUNBQXFCLEVBQUUsd0JBQXdCLG9DQUE0QixDQUFDIn0=
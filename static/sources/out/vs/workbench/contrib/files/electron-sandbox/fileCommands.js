/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/network"], function (require, exports, async_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.revealResourcesInOS = void 0;
    // Commands
    function revealResourcesInOS(resources, nativeHostService, workspaceContextService) {
        if (resources.length) {
            (0, async_1.sequence)(resources.map(r => async () => {
                if (r.scheme === network_1.Schemas.file || r.scheme === network_1.Schemas.vscodeUserData) {
                    nativeHostService.showItemInFolder(r.with({ scheme: network_1.Schemas.file }).fsPath);
                }
            }));
        }
        else if (workspaceContextService.getWorkspace().folders.length) {
            const uri = workspaceContextService.getWorkspace().folders[0].uri;
            if (uri.scheme === network_1.Schemas.file) {
                nativeHostService.showItemInFolder(uri.fsPath);
            }
        }
    }
    exports.revealResourcesInOS = revealResourcesInOS;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUNvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9lbGVjdHJvbi1zYW5kYm94L2ZpbGVDb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsV0FBVztJQUVYLFNBQWdCLG1CQUFtQixDQUFDLFNBQWdCLEVBQUUsaUJBQXFDLEVBQUUsdUJBQWlEO1FBQzdJLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3RCLElBQUEsZ0JBQVEsRUFBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3RFLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3RSxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7YUFBTSxJQUFJLHVCQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsRSxNQUFNLEdBQUcsR0FBRyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ2xFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNqQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEQsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBYkQsa0RBYUMifQ==
(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isVirtualWorkspace = exports.getVirtualWorkspaceAuthority = exports.getVirtualWorkspaceScheme = exports.getVirtualWorkspaceLocation = exports.isVirtualResource = void 0;
    function isVirtualResource(resource) {
        return resource.scheme !== network_1.Schemas.file && resource.scheme !== network_1.Schemas.vscodeRemote;
    }
    exports.isVirtualResource = isVirtualResource;
    function getVirtualWorkspaceLocation(workspace) {
        if (workspace.folders.length) {
            return workspace.folders.every(f => isVirtualResource(f.uri)) ? workspace.folders[0].uri : undefined;
        }
        else if (workspace.configuration && isVirtualResource(workspace.configuration)) {
            return workspace.configuration;
        }
        return undefined;
    }
    exports.getVirtualWorkspaceLocation = getVirtualWorkspaceLocation;
    function getVirtualWorkspaceScheme(workspace) {
        return getVirtualWorkspaceLocation(workspace)?.scheme;
    }
    exports.getVirtualWorkspaceScheme = getVirtualWorkspaceScheme;
    function getVirtualWorkspaceAuthority(workspace) {
        return getVirtualWorkspaceLocation(workspace)?.authority;
    }
    exports.getVirtualWorkspaceAuthority = getVirtualWorkspaceAuthority;
    function isVirtualWorkspace(workspace) {
        return getVirtualWorkspaceLocation(workspace) !== undefined;
    }
    exports.isVirtualWorkspace = isVirtualWorkspace;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbFdvcmtzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd29ya3NwYWNlL2NvbW1vbi92aXJ0dWFsV29ya3NwYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxTQUFnQixpQkFBaUIsQ0FBQyxRQUFhO1FBQzlDLE9BQU8sUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsWUFBWSxDQUFDO0lBQ3JGLENBQUM7SUFGRCw4Q0FFQztJQUVELFNBQWdCLDJCQUEyQixDQUFDLFNBQXFCO1FBQ2hFLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDdEcsQ0FBQzthQUFNLElBQUksU0FBUyxDQUFDLGFBQWEsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztZQUNsRixPQUFPLFNBQVMsQ0FBQyxhQUFhLENBQUM7UUFDaEMsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFQRCxrRUFPQztJQUVELFNBQWdCLHlCQUF5QixDQUFDLFNBQXFCO1FBQzlELE9BQU8sMkJBQTJCLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDO0lBQ3ZELENBQUM7SUFGRCw4REFFQztJQUVELFNBQWdCLDRCQUE0QixDQUFDLFNBQXFCO1FBQ2pFLE9BQU8sMkJBQTJCLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxDQUFDO0lBQzFELENBQUM7SUFGRCxvRUFFQztJQUVELFNBQWdCLGtCQUFrQixDQUFDLFNBQXFCO1FBQ3ZELE9BQU8sMkJBQTJCLENBQUMsU0FBUyxDQUFDLEtBQUssU0FBUyxDQUFDO0lBQzdELENBQUM7SUFGRCxnREFFQyJ9
//# sourceURL=../../../vs/platform/workspace/common/virtualWorkspace.js
})
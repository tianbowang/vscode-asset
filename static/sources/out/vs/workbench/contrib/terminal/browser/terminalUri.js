/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInstanceFromResource = exports.getTerminalResourcesFromDragEvent = exports.getTerminalUri = exports.parseTerminalUri = void 0;
    function parseTerminalUri(resource) {
        const [, workspaceId, instanceId] = resource.path.split('/');
        if (!workspaceId || !Number.parseInt(instanceId)) {
            throw new Error(`Could not parse terminal uri for resource ${resource}`);
        }
        return { workspaceId, instanceId: Number.parseInt(instanceId) };
    }
    exports.parseTerminalUri = parseTerminalUri;
    function getTerminalUri(workspaceId, instanceId, title) {
        return uri_1.URI.from({
            scheme: network_1.Schemas.vscodeTerminal,
            path: `/${workspaceId}/${instanceId}`,
            fragment: title || undefined,
        });
    }
    exports.getTerminalUri = getTerminalUri;
    function getTerminalResourcesFromDragEvent(event) {
        const resources = event.dataTransfer?.getData("Terminals" /* TerminalDataTransfers.Terminals */);
        if (resources) {
            const json = JSON.parse(resources);
            const result = [];
            for (const entry of json) {
                result.push(uri_1.URI.parse(entry));
            }
            return result.length === 0 ? undefined : result;
        }
        return undefined;
    }
    exports.getTerminalResourcesFromDragEvent = getTerminalResourcesFromDragEvent;
    function getInstanceFromResource(instances, resource) {
        if (resource) {
            for (const instance of instances) {
                // Note that the URI's workspace and instance id might not originally be from this window
                // Don't bother checking the scheme and assume instances only contains terminals
                if (instance.resource.path === resource.path) {
                    return instance;
                }
            }
        }
        return undefined;
    }
    exports.getInstanceFromResource = getInstanceFromResource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxVcmkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxVcmkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLFNBQWdCLGdCQUFnQixDQUFDLFFBQWE7UUFDN0MsTUFBTSxDQUFDLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBQ0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO0lBQ2pFLENBQUM7SUFORCw0Q0FNQztJQUVELFNBQWdCLGNBQWMsQ0FBQyxXQUFtQixFQUFFLFVBQWtCLEVBQUUsS0FBYztRQUNyRixPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUM7WUFDZixNQUFNLEVBQUUsaUJBQU8sQ0FBQyxjQUFjO1lBQzlCLElBQUksRUFBRSxJQUFJLFdBQVcsSUFBSSxVQUFVLEVBQUU7WUFDckMsUUFBUSxFQUFFLEtBQUssSUFBSSxTQUFTO1NBQzVCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFORCx3Q0FNQztJQVdELFNBQWdCLGlDQUFpQyxDQUFDLEtBQXdCO1FBQ3pFLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxZQUFZLEVBQUUsT0FBTyxtREFBaUMsQ0FBQztRQUMvRSxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2YsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuQyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDbEIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0IsQ0FBQztZQUNELE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2pELENBQUM7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBWEQsOEVBV0M7SUFFRCxTQUFnQix1QkFBdUIsQ0FBZ0QsU0FBYyxFQUFFLFFBQXlCO1FBQy9ILElBQUksUUFBUSxFQUFFLENBQUM7WUFDZCxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUNsQyx5RkFBeUY7Z0JBQ3pGLGdGQUFnRjtnQkFDaEYsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQzlDLE9BQU8sUUFBUSxDQUFDO2dCQUNqQixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBWEQsMERBV0MifQ==
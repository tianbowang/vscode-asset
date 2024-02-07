/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/workspace/common/workspace"], function (require, exports, platform_1, uri_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testWorkspace = exports.TestWorkspace = exports.Workspace = void 0;
    class Workspace extends workspace_1.Workspace {
        constructor(id, folders = [], configuration = null, ignorePathCasing = () => !platform_1.isLinux) {
            super(id, folders, false, configuration, ignorePathCasing);
        }
    }
    exports.Workspace = Workspace;
    const wsUri = uri_1.URI.file(platform_1.isWindows ? 'C:\\testWorkspace' : '/testWorkspace');
    exports.TestWorkspace = testWorkspace(wsUri);
    function testWorkspace(resource) {
        return new Workspace(resource.toString(), [(0, workspace_1.toWorkspaceFolder)(resource)]);
    }
    exports.testWorkspace = testWorkspace;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFdvcmtzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd29ya3NwYWNlL3Rlc3QvY29tbW9uL3Rlc3RXb3Jrc3BhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsU0FBVSxTQUFRLHFCQUFhO1FBQzNDLFlBQ0MsRUFBVSxFQUNWLFVBQTZCLEVBQUUsRUFDL0IsZ0JBQTRCLElBQUksRUFDaEMsbUJBQTBDLEdBQUcsRUFBRSxDQUFDLENBQUMsa0JBQU87WUFFeEQsS0FBSyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzVELENBQUM7S0FDRDtJQVRELDhCQVNDO0lBRUQsTUFBTSxLQUFLLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM5RCxRQUFBLGFBQWEsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFbEQsU0FBZ0IsYUFBYSxDQUFDLFFBQWE7UUFDMUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFBLDZCQUFpQixFQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRkQsc0NBRUMifQ==
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/test/common/mockDebug", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, log_1, uriIdentityService_1, debugModel_1, mockDebug_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMockDebugModel = exports.mockUriIdentityService = void 0;
    const fileService = new workbenchTestServices_1.TestFileService();
    exports.mockUriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
    function createMockDebugModel(disposable) {
        const storage = disposable.add(new workbenchTestServices_2.TestStorageService());
        const debugStorage = disposable.add(new mockDebug_1.MockDebugStorage(storage));
        return disposable.add(new debugModel_1.DebugModel(debugStorage, { isDirty: (e) => false }, exports.mockUriIdentityService, new log_1.NullLogService()));
    }
    exports.createMockDebugModel = createMockDebugModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja0RlYnVnTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL3Rlc3QvYnJvd3Nlci9tb2NrRGVidWdNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBTSxXQUFXLEdBQUcsSUFBSSx1Q0FBZSxFQUFFLENBQUM7SUFDN0IsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLHVDQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRTFFLFNBQWdCLG9CQUFvQixDQUFDLFVBQXdDO1FBQzVFLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSwwQ0FBa0IsRUFBRSxDQUFDLENBQUM7UUFDekQsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLDRCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDbkUsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksdUJBQVUsQ0FBQyxZQUFZLEVBQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLDhCQUFzQixFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4SSxDQUFDO0lBSkQsb0RBSUMifQ==
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/platform/instantiation/common/instantiation"], function (require, exports, network_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAuxiliaryWindow = exports.IAuxiliaryWindowsMainService = void 0;
    exports.IAuxiliaryWindowsMainService = (0, instantiation_1.createDecorator)('auxiliaryWindowsMainService');
    function isAuxiliaryWindow(webContents) {
        return webContents?.opener?.url.startsWith(`${network_1.Schemas.vscodeFileResource}://${network_1.VSCODE_AUTHORITY}/`);
    }
    exports.isAuxiliaryWindow = isAuxiliaryWindow;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV4aWxpYXJ5V2luZG93cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYXV4aWxpYXJ5V2luZG93L2VsZWN0cm9uLW1haW4vYXV4aWxpYXJ5V2luZG93cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRbkYsUUFBQSw0QkFBNEIsR0FBRyxJQUFBLCtCQUFlLEVBQStCLDZCQUE2QixDQUFDLENBQUM7SUFzQnpILFNBQWdCLGlCQUFpQixDQUFDLFdBQXdCO1FBQ3pELE9BQU8sV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxrQkFBa0IsTUFBTSwwQkFBZ0IsR0FBRyxDQUFDLENBQUM7SUFDcEcsQ0FBQztJQUZELDhDQUVDIn0=
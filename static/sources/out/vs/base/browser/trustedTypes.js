/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/window", "vs/base/common/errors"], function (require, exports, window_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTrustedTypesPolicy = void 0;
    function createTrustedTypesPolicy(policyName, policyOptions) {
        const monacoEnvironment = globalThis.MonacoEnvironment;
        if (monacoEnvironment?.createTrustedTypesPolicy) {
            try {
                return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
                return undefined;
            }
        }
        try {
            return window_1.mainWindow.trustedTypes?.createPolicy(policyName, policyOptions);
        }
        catch (err) {
            (0, errors_1.onUnexpectedError)(err);
            return undefined;
        }
    }
    exports.createTrustedTypesPolicy = createTrustedTypesPolicy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZFR5cGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdHJ1c3RlZFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxTQUFnQix3QkFBd0IsQ0FDdkMsVUFBa0IsRUFDbEIsYUFBdUI7UUFTdkIsTUFBTSxpQkFBaUIsR0FBb0MsVUFBa0IsQ0FBQyxpQkFBaUIsQ0FBQztRQUVoRyxJQUFJLGlCQUFpQixFQUFFLHdCQUF3QixFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDO2dCQUNKLE9BQU8saUJBQWlCLENBQUMsd0JBQXdCLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzlFLENBQUM7WUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2dCQUNkLElBQUEsMEJBQWlCLEVBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZCLE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7UUFDRixDQUFDO1FBQ0QsSUFBSSxDQUFDO1lBQ0osT0FBTyxtQkFBVSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2QsSUFBQSwwQkFBaUIsRUFBQyxHQUFHLENBQUMsQ0FBQztZQUN2QixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO0lBQ0YsQ0FBQztJQTNCRCw0REEyQkMifQ==
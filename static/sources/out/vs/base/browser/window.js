/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAuxiliaryWindow = exports.$window = exports.mainWindow = exports.ensureCodeWindow = void 0;
    function ensureCodeWindow(targetWindow, fallbackWindowId) {
        const codeWindow = targetWindow;
        if (typeof codeWindow.vscodeWindowId !== 'number') {
            Object.defineProperty(codeWindow, 'vscodeWindowId', {
                get: () => fallbackWindowId
            });
        }
    }
    exports.ensureCodeWindow = ensureCodeWindow;
    // eslint-disable-next-line no-restricted-globals
    exports.mainWindow = window;
    /**
     * @deprecated to support multi-window scenarios, use `DOM.mainWindow`
     * if you target the main global window or use helpers such as `DOM.getWindow()`
     * or `DOM.getActiveWindow()` to obtain the correct window for the context you are in.
     */
    exports.$window = exports.mainWindow;
    function isAuxiliaryWindow(obj) {
        if (obj === exports.mainWindow) {
            return false;
        }
        const candidate = obj;
        return typeof candidate?.vscodeWindowId === 'number';
    }
    exports.isAuxiliaryWindow = isAuxiliaryWindow;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvd2luZG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxTQUFnQixnQkFBZ0IsQ0FBQyxZQUFvQixFQUFFLGdCQUF3QjtRQUM5RSxNQUFNLFVBQVUsR0FBRyxZQUFtQyxDQUFDO1FBRXZELElBQUksT0FBTyxVQUFVLENBQUMsY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFO2dCQUNuRCxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCO2FBQzNCLENBQUMsQ0FBQztRQUNKLENBQUM7SUFDRixDQUFDO0lBUkQsNENBUUM7SUFFRCxpREFBaUQ7SUFDcEMsUUFBQSxVQUFVLEdBQUcsTUFBb0IsQ0FBQztJQUUvQzs7OztPQUlHO0lBQ1UsUUFBQSxPQUFPLEdBQUcsa0JBQVUsQ0FBQztJQUVsQyxTQUFnQixpQkFBaUIsQ0FBQyxHQUFXO1FBQzVDLElBQUksR0FBRyxLQUFLLGtCQUFVLEVBQUUsQ0FBQztZQUN4QixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBRyxHQUE2QixDQUFDO1FBRWhELE9BQU8sT0FBTyxTQUFTLEVBQUUsY0FBYyxLQUFLLFFBQVEsQ0FBQztJQUN0RCxDQUFDO0lBUkQsOENBUUMifQ==
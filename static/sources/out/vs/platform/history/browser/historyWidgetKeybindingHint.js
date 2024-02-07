/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showHistoryKeybindingHint = void 0;
    function showHistoryKeybindingHint(keybindingService) {
        return keybindingService.lookupKeybinding('history.showPrevious')?.getElectronAccelerator() === 'Up' && keybindingService.lookupKeybinding('history.showNext')?.getElectronAccelerator() === 'Down';
    }
    exports.showHistoryKeybindingHint = showHistoryKeybindingHint;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeVdpZGdldEtleWJpbmRpbmdIaW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9oaXN0b3J5L2Jyb3dzZXIvaGlzdG9yeVdpZGdldEtleWJpbmRpbmdIaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxTQUFnQix5QkFBeUIsQ0FBQyxpQkFBcUM7UUFDOUUsT0FBTyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLHNCQUFzQixFQUFFLEtBQUssSUFBSSxJQUFJLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEVBQUUsc0JBQXNCLEVBQUUsS0FBSyxNQUFNLENBQUM7SUFDck0sQ0FBQztJQUZELDhEQUVDIn0=
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OfflineError = exports.isOfflineError = void 0;
    const offlineName = 'Offline';
    /**
     * Checks if the given error is offline error
     */
    function isOfflineError(error) {
        if (error instanceof OfflineError) {
            return true;
        }
        return error instanceof Error && error.name === offlineName && error.message === offlineName;
    }
    exports.isOfflineError = isOfflineError;
    class OfflineError extends Error {
        constructor() {
            super(offlineName);
            this.name = this.message;
        }
    }
    exports.OfflineError = OfflineError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9wYXJ0cy9yZXF1ZXN0L2NvbW1vbi9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUM7SUFFOUI7O09BRUc7SUFDSCxTQUFnQixjQUFjLENBQUMsS0FBVTtRQUN4QyxJQUFJLEtBQUssWUFBWSxZQUFZLEVBQUUsQ0FBQztZQUNuQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFDRCxPQUFPLEtBQUssWUFBWSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxXQUFXLENBQUM7SUFDOUYsQ0FBQztJQUxELHdDQUtDO0lBRUQsTUFBYSxZQUFhLFNBQVEsS0FBSztRQUN0QztZQUNDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDMUIsQ0FBQztLQUNEO0lBTEQsb0NBS0MifQ==
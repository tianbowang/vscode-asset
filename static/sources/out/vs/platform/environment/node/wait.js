/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "os", "vs/base/common/extpath"], function (require, exports, fs_1, os_1, extpath_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createWaitMarkerFileSync = void 0;
    function createWaitMarkerFileSync(verbose) {
        const randomWaitMarkerPath = (0, extpath_1.randomPath)((0, os_1.tmpdir)());
        try {
            (0, fs_1.writeFileSync)(randomWaitMarkerPath, ''); // use built-in fs to avoid dragging in more dependencies
            if (verbose) {
                console.log(`Marker file for --wait created: ${randomWaitMarkerPath}`);
            }
            return randomWaitMarkerPath;
        }
        catch (err) {
            if (verbose) {
                console.error(`Failed to create marker file for --wait: ${err}`);
            }
            return undefined;
        }
    }
    exports.createWaitMarkerFileSync = createWaitMarkerFileSync;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FpdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZW52aXJvbm1lbnQvbm9kZS93YWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxTQUFnQix3QkFBd0IsQ0FBQyxPQUFpQjtRQUN6RCxNQUFNLG9CQUFvQixHQUFHLElBQUEsb0JBQVUsRUFBQyxJQUFBLFdBQU0sR0FBRSxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDO1lBQ0osSUFBQSxrQkFBYSxFQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMseURBQXlEO1lBQ2xHLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLENBQUM7WUFDRCxPQUFPLG9CQUFvQixDQUFDO1FBQzdCLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2QsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDRDQUE0QyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO0lBQ0YsQ0FBQztJQWZELDREQWVDIn0=
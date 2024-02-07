/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/window", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/window/common/window"], function (require, exports, browser_1, dom_1, window_1, globals_1, window_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.zoomOut = exports.zoomIn = exports.applyZoom = exports.MIN_ZOOM_LEVEL = exports.MAX_ZOOM_LEVEL = exports.ApplyZoomTarget = void 0;
    var ApplyZoomTarget;
    (function (ApplyZoomTarget) {
        ApplyZoomTarget[ApplyZoomTarget["ACTIVE_WINDOW"] = 1] = "ACTIVE_WINDOW";
        ApplyZoomTarget[ApplyZoomTarget["ALL_WINDOWS"] = 2] = "ALL_WINDOWS";
    })(ApplyZoomTarget || (exports.ApplyZoomTarget = ApplyZoomTarget = {}));
    exports.MAX_ZOOM_LEVEL = 8;
    exports.MIN_ZOOM_LEVEL = -8;
    /**
     * Apply a zoom level to the window. Also sets it in our in-memory
     * browser helper so that it can be accessed in non-electron layers.
     */
    function applyZoom(zoomLevel, target) {
        zoomLevel = Math.min(Math.max(zoomLevel, exports.MIN_ZOOM_LEVEL), exports.MAX_ZOOM_LEVEL); // cap zoom levels between -8 and 8
        const targetWindows = [];
        if (target === ApplyZoomTarget.ACTIVE_WINDOW) {
            targetWindows.push((0, dom_1.getActiveWindow)());
        }
        else if (target === ApplyZoomTarget.ALL_WINDOWS) {
            targetWindows.push(...Array.from((0, dom_1.getWindows)()).map(({ window }) => window));
        }
        else {
            targetWindows.push(target);
        }
        for (const targetWindow of targetWindows) {
            getGlobals(targetWindow)?.webFrame?.setZoomLevel(zoomLevel);
            (0, browser_1.setZoomFactor)((0, window_2.zoomLevelToZoomFactor)(zoomLevel), targetWindow);
            (0, browser_1.setZoomLevel)(zoomLevel, targetWindow);
        }
    }
    exports.applyZoom = applyZoom;
    function getGlobals(win) {
        if (win === window_1.mainWindow) {
            // main window
            return { ipcRenderer: globals_1.ipcRenderer, webFrame: globals_1.webFrame };
        }
        else {
            // auxiliary window
            const auxiliaryWindow = win;
            if (auxiliaryWindow?.vscode?.ipcRenderer && auxiliaryWindow?.vscode?.webFrame) {
                return auxiliaryWindow.vscode;
            }
        }
        return undefined;
    }
    function zoomIn(target) {
        applyZoom((0, browser_1.getZoomLevel)(typeof target === 'number' ? (0, dom_1.getActiveWindow)() : target) + 1, target);
    }
    exports.zoomIn = zoomIn;
    function zoomOut(target) {
        applyZoom((0, browser_1.getZoomLevel)(typeof target === 'number' ? (0, dom_1.getActiveWindow)() : target) - 1, target);
    }
    exports.zoomOut = zoomOut;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS93aW5kb3cvZWxlY3Ryb24tc2FuZGJveC93aW5kb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLElBQVksZUFHWDtJQUhELFdBQVksZUFBZTtRQUMxQix1RUFBaUIsQ0FBQTtRQUNqQixtRUFBVyxDQUFBO0lBQ1osQ0FBQyxFQUhXLGVBQWUsK0JBQWYsZUFBZSxRQUcxQjtJQUVZLFFBQUEsY0FBYyxHQUFHLENBQUMsQ0FBQztJQUNuQixRQUFBLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVqQzs7O09BR0c7SUFDSCxTQUFnQixTQUFTLENBQUMsU0FBaUIsRUFBRSxNQUFnQztRQUM1RSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxzQkFBYyxDQUFDLEVBQUUsc0JBQWMsQ0FBQyxDQUFDLENBQUMsbUNBQW1DO1FBRTlHLE1BQU0sYUFBYSxHQUFhLEVBQUUsQ0FBQztRQUNuQyxJQUFJLE1BQU0sS0FBSyxlQUFlLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDOUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFBLHFCQUFlLEdBQUUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7YUFBTSxJQUFJLE1BQU0sS0FBSyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkQsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBQSxnQkFBVSxHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzdFLENBQUM7YUFBTSxDQUFDO1lBQ1AsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsS0FBSyxNQUFNLFlBQVksSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUMxQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1RCxJQUFBLHVCQUFhLEVBQUMsSUFBQSw4QkFBcUIsRUFBQyxTQUFTLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM5RCxJQUFBLHNCQUFZLEVBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7SUFDRixDQUFDO0lBakJELDhCQWlCQztJQUVELFNBQVMsVUFBVSxDQUFDLEdBQVc7UUFDOUIsSUFBSSxHQUFHLEtBQUssbUJBQVUsRUFBRSxDQUFDO1lBQ3hCLGNBQWM7WUFDZCxPQUFPLEVBQUUsV0FBVyxFQUFYLHFCQUFXLEVBQUUsUUFBUSxFQUFSLGtCQUFRLEVBQUUsQ0FBQztRQUNsQyxDQUFDO2FBQU0sQ0FBQztZQUNQLG1CQUFtQjtZQUNuQixNQUFNLGVBQWUsR0FBRyxHQUE2QyxDQUFDO1lBQ3RFLElBQUksZUFBZSxFQUFFLE1BQU0sRUFBRSxXQUFXLElBQUksZUFBZSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQztnQkFDL0UsT0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDO1lBQy9CLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVELFNBQWdCLE1BQU0sQ0FBQyxNQUFnQztRQUN0RCxTQUFTLENBQUMsSUFBQSxzQkFBWSxFQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBQSxxQkFBZSxHQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRkQsd0JBRUM7SUFFRCxTQUFnQixPQUFPLENBQUMsTUFBZ0M7UUFDdkQsU0FBUyxDQUFDLElBQUEsc0JBQVksRUFBQyxPQUFPLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUEscUJBQWUsR0FBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUZELDBCQUVDIn0=
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/window", "vs/base/common/lifecycle"], function (require, exports, DOM, window_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewWindowDragMonitor = void 0;
    /**
     * Allows webviews to monitor when an element in the VS Code editor is being dragged/dropped.
     *
     * This is required since webview end up eating the drag event. VS Code needs to see this
     * event so it can handle editor element drag drop.
     */
    class WebviewWindowDragMonitor extends lifecycle_1.Disposable {
        constructor(getWebview) {
            super();
            this._register(DOM.addDisposableListener(window_1.$window, DOM.EventType.DRAG_START, () => {
                getWebview()?.windowDidDragStart();
            }));
            const onDragEnd = () => {
                getWebview()?.windowDidDragEnd();
            };
            this._register(DOM.addDisposableListener(window_1.$window, DOM.EventType.DRAG_END, onDragEnd));
            this._register(DOM.addDisposableListener(window_1.$window, DOM.EventType.MOUSE_MOVE, currentEvent => {
                if (currentEvent.buttons === 0) {
                    onDragEnd();
                }
            }));
        }
    }
    exports.WebviewWindowDragMonitor = WebviewWindowDragMonitor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1dpbmRvd0RyYWdNb25pdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2Jyb3dzZXIvd2Vidmlld1dpbmRvd0RyYWdNb25pdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRzs7Ozs7T0FLRztJQUNILE1BQWEsd0JBQXlCLFNBQVEsc0JBQVU7UUFDdkQsWUFBWSxVQUFzQztZQUNqRCxLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGdCQUFPLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO2dCQUNoRixVQUFVLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUU7Z0JBQ3RCLFVBQVUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLENBQUM7WUFDbEMsQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsZ0JBQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGdCQUFPLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLEVBQUU7Z0JBQzFGLElBQUksWUFBWSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDaEMsU0FBUyxFQUFFLENBQUM7Z0JBQ2IsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0Q7SUFuQkQsNERBbUJDIn0=
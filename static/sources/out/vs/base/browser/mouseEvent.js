/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/iframe", "vs/base/common/platform"], function (require, exports, browser, iframe_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandardWheelEvent = exports.DragMouseEvent = exports.StandardMouseEvent = void 0;
    class StandardMouseEvent {
        constructor(targetWindow, e) {
            this.timestamp = Date.now();
            this.browserEvent = e;
            this.leftButton = e.button === 0;
            this.middleButton = e.button === 1;
            this.rightButton = e.button === 2;
            this.buttons = e.buttons;
            this.target = e.target;
            this.detail = e.detail || 1;
            if (e.type === 'dblclick') {
                this.detail = 2;
            }
            this.ctrlKey = e.ctrlKey;
            this.shiftKey = e.shiftKey;
            this.altKey = e.altKey;
            this.metaKey = e.metaKey;
            if (typeof e.pageX === 'number') {
                this.posx = e.pageX;
                this.posy = e.pageY;
            }
            else {
                // Probably hit by MSGestureEvent
                this.posx = e.clientX + this.target.ownerDocument.body.scrollLeft + this.target.ownerDocument.documentElement.scrollLeft;
                this.posy = e.clientY + this.target.ownerDocument.body.scrollTop + this.target.ownerDocument.documentElement.scrollTop;
            }
            // Find the position of the iframe this code is executing in relative to the iframe where the event was captured.
            const iframeOffsets = iframe_1.IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow(targetWindow, e.view);
            this.posx -= iframeOffsets.left;
            this.posy -= iframeOffsets.top;
        }
        preventDefault() {
            this.browserEvent.preventDefault();
        }
        stopPropagation() {
            this.browserEvent.stopPropagation();
        }
    }
    exports.StandardMouseEvent = StandardMouseEvent;
    class DragMouseEvent extends StandardMouseEvent {
        constructor(targetWindow, e) {
            super(targetWindow, e);
            this.dataTransfer = e.dataTransfer;
        }
    }
    exports.DragMouseEvent = DragMouseEvent;
    class StandardWheelEvent {
        constructor(e, deltaX = 0, deltaY = 0) {
            this.browserEvent = e || null;
            this.target = e ? (e.target || e.targetNode || e.srcElement) : null;
            this.deltaY = deltaY;
            this.deltaX = deltaX;
            if (e) {
                // Old (deprecated) wheel events
                const e1 = e;
                const e2 = e;
                const devicePixelRatio = e.view?.devicePixelRatio || 1;
                // vertical delta scroll
                if (typeof e1.wheelDeltaY !== 'undefined') {
                    if (browser.isChrome) {
                        // Refs https://github.com/microsoft/vscode/issues/146403#issuecomment-1854538928
                        this.deltaY = e1.wheelDeltaY / (120 * devicePixelRatio);
                    }
                    else {
                        this.deltaY = e1.wheelDeltaY / 120;
                    }
                }
                else if (typeof e2.VERTICAL_AXIS !== 'undefined' && e2.axis === e2.VERTICAL_AXIS) {
                    this.deltaY = -e2.detail / 3;
                }
                else if (e.type === 'wheel') {
                    // Modern wheel event
                    // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent
                    const ev = e;
                    if (ev.deltaMode === ev.DOM_DELTA_LINE) {
                        // the deltas are expressed in lines
                        if (browser.isFirefox && !platform.isMacintosh) {
                            this.deltaY = -e.deltaY / 3;
                        }
                        else {
                            this.deltaY = -e.deltaY;
                        }
                    }
                    else {
                        this.deltaY = -e.deltaY / 40;
                    }
                }
                // horizontal delta scroll
                if (typeof e1.wheelDeltaX !== 'undefined') {
                    if (browser.isSafari && platform.isWindows) {
                        this.deltaX = -(e1.wheelDeltaX / 120);
                    }
                    else if (browser.isChrome) {
                        // Refs https://github.com/microsoft/vscode/issues/146403#issuecomment-1854538928
                        this.deltaX = e1.wheelDeltaX / (120 * devicePixelRatio);
                    }
                    else {
                        this.deltaX = e1.wheelDeltaX / 120;
                    }
                }
                else if (typeof e2.HORIZONTAL_AXIS !== 'undefined' && e2.axis === e2.HORIZONTAL_AXIS) {
                    this.deltaX = -e.detail / 3;
                }
                else if (e.type === 'wheel') {
                    // Modern wheel event
                    // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent
                    const ev = e;
                    if (ev.deltaMode === ev.DOM_DELTA_LINE) {
                        // the deltas are expressed in lines
                        if (browser.isFirefox && !platform.isMacintosh) {
                            this.deltaX = -e.deltaX / 3;
                        }
                        else {
                            this.deltaX = -e.deltaX;
                        }
                    }
                    else {
                        this.deltaX = -e.deltaX / 40;
                    }
                }
                // Assume a vertical scroll if nothing else worked
                if (this.deltaY === 0 && this.deltaX === 0 && e.wheelDelta) {
                    if (browser.isChrome) {
                        // Refs https://github.com/microsoft/vscode/issues/146403#issuecomment-1854538928
                        this.deltaY = e.wheelDelta / (120 * devicePixelRatio);
                    }
                    else {
                        this.deltaY = e.wheelDelta / 120;
                    }
                }
            }
        }
        preventDefault() {
            this.browserEvent?.preventDefault();
        }
        stopPropagation() {
            this.browserEvent?.stopPropagation();
        }
    }
    exports.StandardWheelEvent = StandardWheelEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW91c2VFdmVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL21vdXNlRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMEJoRyxNQUFhLGtCQUFrQjtRQWtCOUIsWUFBWSxZQUFvQixFQUFFLENBQWE7WUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBRXpCLElBQUksQ0FBQyxNQUFNLEdBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFFcEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLENBQUM7WUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFP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
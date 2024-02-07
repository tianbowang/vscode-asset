/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/grid/gridview", "vs/base/common/event"], function (require, exports, assert, gridview_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodesToArrays = exports.TestView = void 0;
    class TestView {
        get minimumWidth() { return this._minimumWidth; }
        set minimumWidth(size) { this._minimumWidth = size; this._onDidChange.fire(undefined); }
        get maximumWidth() { return this._maximumWidth; }
        set maximumWidth(size) { this._maximumWidth = size; this._onDidChange.fire(undefined); }
        get minimumHeight() { return this._minimumHeight; }
        set minimumHeight(size) { this._minimumHeight = size; this._onDidChange.fire(undefined); }
        get maximumHeight() { return this._maximumHeight; }
        set maximumHeight(size) { this._maximumHeight = size; this._onDidChange.fire(undefined); }
        get element() { this._onDidGetElement.fire(); return this._element; }
        get width() { return this._width; }
        get height() { return this._height; }
        get top() { return this._top; }
        get left() { return this._left; }
        get size() { return [this.width, this.height]; }
        constructor(_minimumWidth, _maximumWidth, _minimumHeight, _maximumHeight) {
            this._minimumWidth = _minimumWidth;
            this._maximumWidth = _maximumWidth;
            this._minimumHeight = _minimumHeight;
            this._maximumHeight = _maximumHeight;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._element = document.createElement('div');
            this._onDidGetElement = new event_1.Emitter();
            this.onDidGetElement = this._onDidGetElement.event;
            this._width = 0;
            this._height = 0;
            this._top = 0;
            this._left = 0;
            this._onDidLayout = new event_1.Emitter();
            this.onDidLayout = this._onDidLayout.event;
            this._onDidFocus = new event_1.Emitter();
            this.onDidFocus = this._onDidFocus.event;
            assert(_minimumWidth <= _maximumWidth, 'gridview view minimum width must be <= maximum width');
            assert(_minimumHeight <= _maximumHeight, 'gridview view minimum height must be <= maximum height');
        }
        layout(width, height, top, left) {
            this._width = width;
            this._height = height;
            this._top = top;
            this._left = left;
            this._onDidLayout.fire({ width, height, top, left });
        }
        focus() {
            this._onDidFocus.fire();
        }
        dispose() {
            this._onDidChange.dispose();
            this._onDidGetElement.dispose();
            this._onDidLayout.dispose();
            this._onDidFocus.dispose();
        }
    }
    exports.TestView = TestView;
    function nodesToArrays(node) {
        if ((0, gridview_1.isGridBranchNode)(node)) {
            return node.children.map(nodesToArrays);
        }
        else {
            return node.view;
        }
    }
    exports.nodesToArrays = nodesToArrays;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2Jyb3dzZXIvdWkvZ3JpZC91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFhLFFBQVE7UUFLcEIsSUFBSSxZQUFZLEtBQWEsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUN6RCxJQUFJLFlBQVksQ0FBQyxJQUFZLElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEcsSUFBSSxZQUFZLEtBQWEsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUN6RCxJQUFJLFlBQVksQ0FBQyxJQUFZLElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEcsSUFBSSxhQUFhLEtBQWEsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFJLGFBQWEsQ0FBQyxJQUFZLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEcsSUFBSSxhQUFhLEtBQWEsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFJLGFBQWEsQ0FBQyxJQUFZLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENB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
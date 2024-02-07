/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorCommon"], function (require, exports, editorCommon) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIEditor = exports.getCodeEditor = exports.isCompositeEditor = exports.isDiffEditor = exports.isCodeEditor = exports.DiffEditorState = exports.MouseTargetType = exports.OverlayWidgetPositionPreference = exports.ContentWidgetPositionPreference = void 0;
    /**
     * A positioning preference for rendering content widgets.
     */
    var ContentWidgetPositionPreference;
    (function (ContentWidgetPositionPreference) {
        /**
         * Place the content widget exactly at a position
         */
        ContentWidgetPositionPreference[ContentWidgetPositionPreference["EXACT"] = 0] = "EXACT";
        /**
         * Place the content widget above a position
         */
        ContentWidgetPositionPreference[ContentWidgetPositionPreference["ABOVE"] = 1] = "ABOVE";
        /**
         * Place the content widget below a position
         */
        ContentWidgetPositionPreference[ContentWidgetPositionPreference["BELOW"] = 2] = "BELOW";
    })(ContentWidgetPositionPreference || (exports.ContentWidgetPositionPreference = ContentWidgetPositionPreference = {}));
    /**
     * A positioning preference for rendering overlay widgets.
     */
    var OverlayWidgetPositionPreference;
    (function (OverlayWidgetPositionPreference) {
        /**
         * Position the overlay widget in the top right corner
         */
        OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_RIGHT_CORNER"] = 0] = "TOP_RIGHT_CORNER";
        /**
         * Position the overlay widget in the bottom right corner
         */
        OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["BOTTOM_RIGHT_CORNER"] = 1] = "BOTTOM_RIGHT_CORNER";
        /**
         * Position the overlay widget in the top center
         */
        OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_CENTER"] = 2] = "TOP_CENTER";
    })(OverlayWidgetPositionPreference || (exports.OverlayWidgetPositionPreference = OverlayWidgetPositionPreference = {}));
    /**
     * Type of hit element with the mouse in the editor.
     */
    var MouseTargetType;
    (function (MouseTargetType) {
        /**
         * Mouse is on top of an unknown element.
         */
        MouseTargetType[MouseTargetType["UNKNOWN"] = 0] = "UNKNOWN";
        /**
         * Mouse is on top of the textarea used for input.
         */
        MouseTargetType[MouseTargetType["TEXTAREA"] = 1] = "TEXTAREA";
        /**
         * Mouse is on top of the glyph margin
         */
        MouseTargetType[MouseTargetType["GUTTER_GLYPH_MARGIN"] = 2] = "GUTTER_GLYPH_MARGIN";
        /**
         * Mouse is on top of the line numbers
         */
        MouseTargetType[MouseTargetType["GUTTER_LINE_NUMBERS"] = 3] = "GUTTER_LINE_NUMBERS";
        /**
         * Mouse is on top of the line decorations
         */
        MouseTargetType[MouseTargetType["GUTTER_LINE_DECORATIONS"] = 4] = "GUTTER_LINE_DECORATIONS";
        /**
         * Mouse is on top of the whitespace left in the gutter by a view zone.
         */
        MouseTargetType[MouseTargetType["GUTTER_VIEW_ZONE"] = 5] = "GUTTER_VIEW_ZONE";
        /**
         * Mouse is on top of text in the content.
         */
        MouseTargetType[MouseTargetType["CONTENT_TEXT"] = 6] = "CONTENT_TEXT";
        /**
         * Mouse is on top of empty space in the content (e.g. after line text or below last line)
         */
        MouseTargetType[MouseTargetType["CONTENT_EMPTY"] = 7] = "CONTENT_EMPTY";
        /**
         * Mouse is on top of a view zone in the content.
         */
        MouseTargetType[MouseTargetType["CONTENT_VIEW_ZONE"] = 8] = "CONTENT_VIEW_ZONE";
        /**
         * Mouse is on top of a content widget.
         */
        MouseTargetType[MouseTargetType["CONTENT_WIDGET"] = 9] = "CONTENT_WIDGET";
        /**
         * Mouse is on top of the decorations overview ruler.
         */
        MouseTargetType[MouseTargetType["OVERVIEW_RULER"] = 10] = "OVERVIEW_RULER";
        /**
         * Mouse is on top of a scrollbar.
         */
        MouseTargetType[MouseTargetType["SCROLLBAR"] = 11] = "SCROLLBAR";
        /**
         * Mouse is on top of an overlay widget.
         */
        MouseTargetType[MouseTargetType["OVERLAY_WIDGET"] = 12] = "OVERLAY_WIDGET";
        /**
         * Mouse is outside of the editor.
         */
        MouseTargetType[MouseTargetType["OUTSIDE_EDITOR"] = 13] = "OUTSIDE_EDITOR";
    })(MouseTargetType || (exports.MouseTargetType = MouseTargetType = {}));
    /**
     * @internal
     */
    var DiffEditorState;
    (function (DiffEditorState) {
        DiffEditorState[DiffEditorState["Idle"] = 0] = "Idle";
        DiffEditorState[DiffEditorState["ComputingDiff"] = 1] = "ComputingDiff";
        DiffEditorState[DiffEditorState["DiffComputed"] = 2] = "DiffComputed";
    })(DiffEditorState || (exports.DiffEditorState = DiffEditorState = {}));
    /**
     *@internal
     */
    function isCodeEditor(thing) {
        if (thing && typeof thing.getEditorType === 'function') {
            return thing.getEditorType() === editorCommon.EditorType.ICodeEditor;
        }
        else {
            return false;
        }
    }
    exports.isCodeEditor = isCodeEditor;
    /**
     *@internal
     */
    function isDiffEditor(thing) {
        if (thing && typeof thing.getEditorType === 'function') {
            return thing.getEditorType() === editorCommon.EditorType.IDiffEditor;
        }
        else {
            return false;
        }
    }
    exports.isDiffEditor = isDiffEditor;
    /**
     *@internal
     */
    function isCompositeEditor(thing) {
        return !!thing
            && typeof thing === 'object'
            && typeof thing.onDidChangeActiveEditor === 'function';
    }
    exports.isCompositeEditor = isCompositeEditor;
    /**
     *@internal
     */
    function getCodeEditor(thing) {
        if (isCodeEditor(thing)) {
            return thing;
        }
        if (isDiffEditor(thing)) {
            return thing.getModifiedEditor();
        }
        if (isCompositeEditor(thing) && isCodeEditor(thing.activeCodeEditor)) {
            return thing.activeCodeEditor;
        }
        return null;
    }
    exports.getCodeEditor = getCodeEditor;
    /**
     *@internal
     */
    function getIEditor(thing) {
        if (isCodeEditor(thing) || isDiffEditor(thing)) {
            return thing;
        }
        return null;
    }
    exports.getIEditor = getIEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvZWRpdG9yQnJvd3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtSGhHOztPQUVHO0lBQ0gsSUFBa0IsK0JBYWpCO0lBYkQsV0FBa0IsK0JBQStCO1FBQ2hEOztXQUVHO1FBQ0gsdUZBQUssQ0FBQTtRQUNMOztXQUVHO1FBQ0gsdUZBQUssQ0FBQTtRQUNMOztXQUVHO1FBQ0gsdUZBQUssQ0FBQTtJQUNOLENBQUMsRUFiaUIsK0JBQStCLCtDQUEvQiwrQkFBK0IsUUFhaEQ7SUEwRUQ7O09BRUc7SUFDSCxJQUFrQiwrQkFlakI7SUFmRCxXQUFrQiwrQkFBK0I7UUFDaEQ7O1dBRUc7UUFDSCw2R0FBZ0IsQ0FBQTtRQUVoQjs7V0FFRztRQUNILG1IQUFtQixDQUFBO1FBRW5COztXQUVHO1FBQ0gsaUdBQVUsQ0FBQTtJQUNYLENBQUMsRUFmaUIsK0JBQStCLCtDQUEvQiwrQkFBK0IsUUFlaEQ7SUEwRkQ7O09BRUc7SUFDSCxJQUFrQixlQXlEakI7SUF6REQsV0FBa0IsZUFBZTtRQUNoQzs7V0FFRztRQUNILDJEQUFPLENBQUE7UUFDUDs7V0FFRztRQUNILDZEQUFRLENBQUE7UUFDUjs7V0FFRztRQUNILG1GQUFtQixDQUFBO1FBQ25COztXQUVHO1FBQ0gsbUZBQW1CLENBQUE7UUFDbkI7O1dBRUc7UUFDSCwyRkFBdUIsQ0FBQTtRQUN2Qjs7V0FFRztRQUNILDZFQUFnQixDQUFBO1FBQ2hCOztXQUVHO1FBQ0gscUVBQVksQ0FBQTtRQUNaOztXQUVHO1FBQ0gsdUVBQWEsQ0FBQTtRQUNiOztXQUVHO1FBQ0gsK0VBQWlCLENBQUE7UUFDakI7O1dBRUc7UUFDSCx5RUFBYyxDQUFBO1FBQ2Q7O1dBRUc7UUFDSCwwRUFBYyxDQUFBO1FBQ2Q7O1dBRUc7UUFDSCxnRUFBUyxDQUFBO1FBQ1Q7O1dBRUc7UUFDSCwwRUFBYyxDQUFBO1FBQ2Q7O1dBRUc7UUFDSCwwRUFBYyxDQUFBO0lBQ2YsQ0FBQyxFQXpEaUIsZUFBZSwrQkFBZixlQUFlLFFBeURoQztJQTB5QkQ7O09BRUc7SUFDSCxJQUFrQixlQUlqQjtJQUpELFdBQWtCLGVBQWU7UUFDaEMscURBQUksQ0FBQTtRQUNKLHVFQUFhLENBQUE7UUFDYixxRUFBWSxDQUFBO0lBQ2IsQ0FBQyxFQUppQixlQUFlLCtCQUFmLGVBQWUsUUFJaEM7SUFvSEQ7O09BRUc7SUFDSCxTQUFnQixZQUFZLENBQUMsS0FBYztRQUMxQyxJQUFJLEtBQUssSUFBSSxPQUFxQixLQUFNLENBQUMsYUFBYSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3ZFLE9BQXFCLEtBQU0sQ0FBQyxhQUFhLEVBQUUsS0FBSyxZQUFZLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztRQUNyRixDQUFDO2FBQU0sQ0FBQztZQUNQLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNGLENBQUM7SUFORCxvQ0FNQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFDLEtBQWM7UUFDMUMsSUFBSSxLQUFLLElBQUksT0FBcUIsS0FBTSxDQUFDLGFBQWEsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUN2RSxPQUFxQixLQUFNLENBQUMsYUFBYSxFQUFFLEtBQUssWUFBWSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7UUFDckYsQ0FBQzthQUFNLENBQUM7WUFDUCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7SUFDRixDQUFDO0lBTkQsb0NBTUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLGlCQUFpQixDQUFDLEtBQWM7UUFDL0MsT0FBTyxDQUFDLENBQUMsS0FBSztlQUNWLE9BQU8sS0FBSyxLQUFLLFFBQVE7ZUFDekIsT0FBMkMsS0FBTSxDQUFDLHVCQUF1QixLQUFLLFVBQVUsQ0FBQztJQUU5RixDQUFDO0lBTEQsOENBS0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLGFBQWEsQ0FBQyxLQUFjO1FBQzNDLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDekIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN6QixPQUFPLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxJQUFJLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1lBQ3RFLE9BQU8sS0FBSyxDQUFDLGdCQUFnQixDQUFDO1FBQy9CLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFkRCxzQ0FjQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsVUFBVSxDQUFDLEtBQVU7UUFDcEMsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDaEQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBTkQsZ0NBTUMifQ==
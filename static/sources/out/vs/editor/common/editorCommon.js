/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Handler = exports.EditorType = exports.isThemeColor = exports.ScrollType = void 0;
    var ScrollType;
    (function (ScrollType) {
        ScrollType[ScrollType["Smooth"] = 0] = "Smooth";
        ScrollType[ScrollType["Immediate"] = 1] = "Immediate";
    })(ScrollType || (exports.ScrollType = ScrollType = {}));
    /**
     * @internal
     */
    function isThemeColor(o) {
        return o && typeof o.id === 'string';
    }
    exports.isThemeColor = isThemeColor;
    /**
     * The type of the `IEditor`.
     */
    exports.EditorType = {
        ICodeEditor: 'vs.editor.ICodeEditor',
        IDiffEditor: 'vs.editor.IDiffEditor'
    };
    /**
     * Built-in commands.
     * @internal
     */
    var Handler;
    (function (Handler) {
        Handler["CompositionStart"] = "compositionStart";
        Handler["CompositionEnd"] = "compositionEnd";
        Handler["Type"] = "type";
        Handler["ReplacePreviousChar"] = "replacePreviousChar";
        Handler["CompositionType"] = "compositionType";
        Handler["Paste"] = "paste";
        Handler["Cut"] = "cut";
    })(Handler || (exports.Handler = Handler = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQ29tbW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2VkaXRvckNvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEyTWhHLElBQWtCLFVBR2pCO0lBSEQsV0FBa0IsVUFBVTtRQUMzQiwrQ0FBVSxDQUFBO1FBQ1YscURBQWEsQ0FBQTtJQUNkLENBQUMsRUFIaUIsVUFBVSwwQkFBVixVQUFVLFFBRzNCO0lBc1lEOztPQUVHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFDLENBQU07UUFDbEMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FBQztJQUN0QyxDQUFDO0lBRkQsb0NBRUM7SUEwSEQ7O09BRUc7SUFDVSxRQUFBLFVBQVUsR0FBRztRQUN6QixXQUFXLEVBQUUsdUJBQXVCO1FBQ3BDLFdBQVcsRUFBRSx1QkFBdUI7S0FDcEMsQ0FBQztJQUVGOzs7T0FHRztJQUNILElBQWtCLE9BUWpCO0lBUkQsV0FBa0IsT0FBTztRQUN4QixnREFBcUMsQ0FBQTtRQUNyQyw0Q0FBaUMsQ0FBQTtRQUNqQyx3QkFBYSxDQUFBO1FBQ2Isc0RBQTJDLENBQUE7UUFDM0MsOENBQW1DLENBQUE7UUFDbkMsMEJBQWUsQ0FBQTtRQUNmLHNCQUFXLENBQUE7SUFDWixDQUFDLEVBUmlCLE9BQU8sdUJBQVAsT0FBTyxRQVF4QiJ9
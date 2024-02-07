/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isDark = exports.isHighContrast = exports.ColorScheme = void 0;
    /**
     * Color scheme used by the OS and by color themes.
     */
    var ColorScheme;
    (function (ColorScheme) {
        ColorScheme["DARK"] = "dark";
        ColorScheme["LIGHT"] = "light";
        ColorScheme["HIGH_CONTRAST_DARK"] = "hcDark";
        ColorScheme["HIGH_CONTRAST_LIGHT"] = "hcLight";
    })(ColorScheme || (exports.ColorScheme = ColorScheme = {}));
    function isHighContrast(scheme) {
        return scheme === ColorScheme.HIGH_CONTRAST_DARK || scheme === ColorScheme.HIGH_CONTRAST_LIGHT;
    }
    exports.isHighContrast = isHighContrast;
    function isDark(scheme) {
        return scheme === ColorScheme.DARK || scheme === ColorScheme.HIGH_CONTRAST_DARK;
    }
    exports.isDark = isDark;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RoZW1lL2NvbW1vbi90aGVtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEc7O09BRUc7SUFDSCxJQUFZLFdBS1g7SUFMRCxXQUFZLFdBQVc7UUFDdEIsNEJBQWEsQ0FBQTtRQUNiLDhCQUFlLENBQUE7UUFDZiw0Q0FBNkIsQ0FBQTtRQUM3Qiw4Q0FBK0IsQ0FBQTtJQUNoQyxDQUFDLEVBTFcsV0FBVywyQkFBWCxXQUFXLFFBS3RCO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLE1BQW1CO1FBQ2pELE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxrQkFBa0IsSUFBSSxNQUFNLEtBQUssV0FBVyxDQUFDLG1CQUFtQixDQUFDO0lBQ2hHLENBQUM7SUFGRCx3Q0FFQztJQUVELFNBQWdCLE1BQU0sQ0FBQyxNQUFtQjtRQUN6QyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUMsSUFBSSxJQUFJLE1BQU0sS0FBSyxXQUFXLENBQUMsa0JBQWtCLENBQUM7SUFDakYsQ0FBQztJQUZELHdCQUVDIn0=
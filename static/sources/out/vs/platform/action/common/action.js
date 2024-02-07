/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isICommandActionToggleInfo = exports.isLocalizedString = void 0;
    function isLocalizedString(thing) {
        return thing
            && typeof thing === 'object'
            && typeof thing.original === 'string'
            && typeof thing.value === 'string';
    }
    exports.isLocalizedString = isLocalizedString;
    function isICommandActionToggleInfo(thing) {
        return thing ? thing.condition !== undefined : false;
    }
    exports.isICommandActionToggleInfo = isICommandActionToggleInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hY3Rpb24vY29tbW9uL2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQmhHLFNBQWdCLGlCQUFpQixDQUFDLEtBQVU7UUFDM0MsT0FBTyxLQUFLO2VBQ1IsT0FBTyxLQUFLLEtBQUssUUFBUTtlQUN6QixPQUFPLEtBQUssQ0FBQyxRQUFRLEtBQUssUUFBUTtlQUNsQyxPQUFPLEtBQUssQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUFDO0lBQ3JDLENBQUM7SUFMRCw4Q0FLQztJQWtDRCxTQUFnQiwwQkFBMEIsQ0FBQyxLQUFrRTtRQUM1RyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQTRCLEtBQU0sQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDbEYsQ0FBQztJQUZELGdFQUVDIn0=
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAccessibilityInformation = exports.CONTEXT_ACCESSIBILITY_MODE_ENABLED = exports.AccessibilitySupport = exports.IAccessibilityService = void 0;
    exports.IAccessibilityService = (0, instantiation_1.createDecorator)('accessibilityService');
    var AccessibilitySupport;
    (function (AccessibilitySupport) {
        /**
         * This should be the browser case where it is not known if a screen reader is attached or no.
         */
        AccessibilitySupport[AccessibilitySupport["Unknown"] = 0] = "Unknown";
        AccessibilitySupport[AccessibilitySupport["Disabled"] = 1] = "Disabled";
        AccessibilitySupport[AccessibilitySupport["Enabled"] = 2] = "Enabled";
    })(AccessibilitySupport || (exports.AccessibilitySupport = AccessibilitySupport = {}));
    exports.CONTEXT_ACCESSIBILITY_MODE_ENABLED = new contextkey_1.RawContextKey('accessibilityModeEnabled', false);
    function isAccessibilityInformation(obj) {
        return obj && typeof obj === 'object'
            && typeof obj.label === 'string'
            && (typeof obj.role === 'undefined' || typeof obj.role === 'string');
    }
    exports.isAccessibilityInformation = isAccessibilityInformation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYWNjZXNzaWJpbGl0eS9jb21tb24vYWNjZXNzaWJpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNbkYsUUFBQSxxQkFBcUIsR0FBRyxJQUFBLCtCQUFlLEVBQXdCLHNCQUFzQixDQUFDLENBQUM7SUFpQnBHLElBQWtCLG9CQVNqQjtJQVRELFdBQWtCLG9CQUFvQjtRQUNyQzs7V0FFRztRQUNILHFFQUFXLENBQUE7UUFFWCx1RUFBWSxDQUFBO1FBRVoscUVBQVcsQ0FBQTtJQUNaLENBQUMsRUFUaUIsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFTckM7SUFFWSxRQUFBLGtDQUFrQyxHQUFHLElBQUksMEJBQWEsQ0FBVSwwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQU9oSCxTQUFnQiwwQkFBMEIsQ0FBQyxHQUFRO1FBQ2xELE9BQU8sR0FBRyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVE7ZUFDakMsT0FBTyxHQUFHLENBQUMsS0FBSyxLQUFLLFFBQVE7ZUFDN0IsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBSkQsZ0VBSUMifQ==
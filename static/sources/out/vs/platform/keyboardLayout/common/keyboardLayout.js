/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/platform/instantiation/common/instantiation"], function (require, exports, keyCodes_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.macLinuxKeyboardMappingEquals = exports.windowsKeyboardMappingEquals = exports.getKeyboardLayoutId = exports.parseKeyboardLayoutDescription = exports.areKeyboardLayoutsEqual = exports.IKeyboardLayoutService = void 0;
    exports.IKeyboardLayoutService = (0, instantiation_1.createDecorator)('keyboardLayoutService');
    function areKeyboardLayoutsEqual(a, b) {
        if (!a || !b) {
            return false;
        }
        if (a.name && b.name && a.name === b.name) {
            return true;
        }
        if (a.id && b.id && a.id === b.id) {
            return true;
        }
        if (a.model &&
            b.model &&
            a.model === b.model &&
            a.layout === b.layout) {
            return true;
        }
        return false;
    }
    exports.areKeyboardLayoutsEqual = areKeyboardLayoutsEqual;
    function parseKeyboardLayoutDescription(layout) {
        if (!layout) {
            return { label: '', description: '' };
        }
        if (layout.name) {
            // windows
            const windowsLayout = layout;
            return {
                label: windowsLayout.text,
                description: ''
            };
        }
        if (layout.id) {
            const macLayout = layout;
            if (macLayout.localizedName) {
                return {
                    label: macLayout.localizedName,
                    description: ''
                };
            }
            if (/^com\.apple\.keylayout\./.test(macLayout.id)) {
                return {
                    label: macLayout.id.replace(/^com\.apple\.keylayout\./, '').replace(/-/, ' '),
                    description: ''
                };
            }
            if (/^.*inputmethod\./.test(macLayout.id)) {
                return {
                    label: macLayout.id.replace(/^.*inputmethod\./, '').replace(/[-\.]/, ' '),
                    description: `Input Method (${macLayout.lang})`
                };
            }
            return {
                label: macLayout.lang,
                description: ''
            };
        }
        const linuxLayout = layout;
        return {
            label: linuxLayout.layout,
            description: ''
        };
    }
    exports.parseKeyboardLayoutDescription = parseKeyboardLayoutDescription;
    function getKeyboardLayoutId(layout) {
        if (layout.name) {
            return layout.name;
        }
        if (layout.id) {
            return layout.id;
        }
        return layout.layout;
    }
    exports.getKeyboardLayoutId = getKeyboardLayoutId;
    function windowsKeyMappingEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return (a.vkey === b.vkey
            && a.value === b.value
            && a.withShift === b.withShift
            && a.withAltGr === b.withAltGr
            && a.withShiftAltGr === b.withShiftAltGr);
    }
    function windowsKeyboardMappingEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        for (let scanCode = 0; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
            const strScanCode = keyCodes_1.ScanCodeUtils.toString(scanCode);
            const aEntry = a[strScanCode];
            const bEntry = b[strScanCode];
            if (!windowsKeyMappingEquals(aEntry, bEntry)) {
                return false;
            }
        }
        return true;
    }
    exports.windowsKeyboardMappingEquals = windowsKeyboardMappingEquals;
    function macLinuxKeyMappingEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return (a.value === b.value
            && a.withShift === b.withShift
            && a.withAltGr === b.withAltGr
            && a.withShiftAltGr === b.withShiftAltGr);
    }
    function macLinuxKeyboardMappingEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        for (let scanCode = 0; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
            const strScanCode = keyCodes_1.ScanCodeUtils.toString(scanCode);
            const aEntry = a[strScanCode];
            const bEntry = b[strScanCode];
            if (!macLinuxKeyMappingEquals(aEntry, bEntry)) {
                return false;
            }
        }
        return true;
    }
    exports.macLinuxKeyboardMappingEquals = macLinuxKeyboardMappingEquals;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRMYXlvdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2tleWJvYXJkTGF5b3V0L2NvbW1vbi9rZXlib2FyZExheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRbkYsUUFBQSxzQkFBc0IsR0FBRyxJQUFBLCtCQUFlLEVBQXlCLHVCQUF1QixDQUFDLENBQUM7SUEwRXZHLFNBQWdCLHVCQUF1QixDQUFDLENBQTZCLEVBQUUsQ0FBNkI7UUFDbkcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBaUMsQ0FBRSxDQUFDLElBQUksSUFBaUMsQ0FBRSxDQUFDLElBQUksSUFBaUMsQ0FBRSxDQUFDLElBQUksS0FBa0MsQ0FBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25LLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELElBQTZCLENBQUUsQ0FBQyxFQUFFLElBQTZCLENBQUUsQ0FBQyxFQUFFLElBQTZCLENBQUUsQ0FBQyxFQUFFLEtBQThCLENBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzSSxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxJQUErQixDQUFFLENBQUMsS0FBSztZQUNYLENBQUUsQ0FBQyxLQUFLO1lBQ1IsQ0FBRSxDQUFDLEtBQUssS0FBZ0MsQ0FBRSxDQUFDLEtBQUs7WUFDaEQsQ0FBRSxDQUFDLE1BQU0sS0FBZ0MsQ0FBRSxDQUFDLE1BQU0sRUFDNUUsQ0FBQztZQUNGLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQXRCRCwwREFzQkM7SUFFRCxTQUFnQiw4QkFBOEIsQ0FBQyxNQUFrQztRQUNoRixJQUFJLENBQUMsTUFB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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/platform"], function (require, exports, browser, keyCodes_1, keybindings_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandardKeyboardEvent = exports.printStandardKeyboardEvent = exports.printKeyboardEvent = void 0;
    function extractKeyCode(e) {
        if (e.charCode) {
            // "keypress" events mostly
            const char = String.fromCharCode(e.charCode).toUpperCase();
            return keyCodes_1.KeyCodeUtils.fromString(char);
        }
        const keyCode = e.keyCode;
        // browser quirks
        if (keyCode === 3) {
            return 7 /* KeyCode.PauseBreak */;
        }
        else if (browser.isFirefox) {
            switch (keyCode) {
                case 59: return 85 /* KeyCode.Semicolon */;
                case 60:
                    if (platform.isLinux) {
                        return 97 /* KeyCode.IntlBackslash */;
                    }
                    break;
                case 61: return 86 /* KeyCode.Equal */;
                // based on: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#numpad_keys
                case 107: return 109 /* KeyCode.NumpadAdd */;
                case 109: return 111 /* KeyCode.NumpadSubtract */;
                case 173: return 88 /* KeyCode.Minus */;
                case 224:
                    if (platform.isMacintosh) {
                        return 57 /* KeyCode.Meta */;
                    }
                    break;
            }
        }
        else if (browser.isWebKit) {
            if (platform.isMacintosh && keyCode === 93) {
                // the two meta keys in the Mac have different key codes (91 and 93)
                return 57 /* KeyCode.Meta */;
            }
            else if (!platform.isMacintosh && keyCode === 92) {
                return 57 /* KeyCode.Meta */;
            }
        }
        // cross browser keycodes:
        return keyCodes_1.EVENT_KEY_CODE_MAP[keyCode] || 0 /* KeyCode.Unknown */;
    }
    const ctrlKeyMod = (platform.isMacintosh ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */);
    const altKeyMod = 512 /* KeyMod.Alt */;
    const shiftKeyMod = 1024 /* KeyMod.Shift */;
    const metaKeyMod = (platform.isMacintosh ? 2048 /* KeyMod.CtrlCmd */ : 256 /* KeyMod.WinCtrl */);
    function printKeyboardEvent(e) {
        const modifiers = [];
        if (e.ctrlKey) {
            modifiers.push(`ctrl`);
        }
        if (e.shiftKey) {
            modifiers.push(`shift`);
        }
        if (e.altKey) {
            modifiers.push(`alt`);
        }
        if (e.metaKey) {
            modifiers.push(`meta`);
        }
        return `modifiers: [${modifiers.join(',')}], code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`;
    }
    exports.printKeyboardEvent = printKeyboardEvent;
    function printStandardKeyboardEvent(e) {
        const modifiers = [];
        if (e.ctrlKey) {
            modifiers.push(`ctrl`);
        }
        if (e.shiftKey) {
            modifiers.push(`shift`);
        }
        if (e.altKey) {
            modifiers.push(`alt`);
        }
        if (e.metaKey) {
            modifiers.push(`meta`);
        }
        return `modifiers: [${modifiers.join(',')}], code: ${e.code}, keyCode: ${e.keyCode} ('${keyCodes_1.KeyCodeUtils.toString(e.keyCode)}')`;
    }
    exports.printStandardKeyboardEvent = printStandardKeyboardEvent;
    class StandardKeyboardEvent {
        constructor(source) {
            this._standardKeyboardEventBrand = true;
            const e = source;
            this.browserEvent = e;
            this.target = e.target;
            this.ctrlKey = e.ctrlKey;
            this.shiftKey = e.shiftKey;
            this.altKey = e.altKey;
            this.metaKey = e.metaKey;
            this.altGraphKey = e.getModifierState('AltGraph');
            this.keyCode = extractKeyCode(e);
            this.code = e.code;
            // console.info(e.type + ": keyCode: " + e.keyCode + ", which: " + e.which + ", charCode: " + e.charCode + ", detail: " + e.detail + " ====> " + this.keyCode + ' -- ' + KeyCode[this.keyCode]);
            this.ctrlKey = this.ctrlKey || this.keyCode === 5 /* KeyCode.Ctrl */;
            this.altKey = this.altKey || this.keyCode === 6 /* KeyCode.Alt */;
            this.shiftKey = this.shiftKey || this.keyCode === 4 /* KeyCode.Shift */;
            this.metaKey = this.metaKey || this.keyCode === 57 /* KeyCode.Meta */;
            this._asKeybinding = this._computeKeybinding();
            this._asKeyCodeChord = this._computeKeyCodeChord();
            // console.log(`code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`);
        }
        preventDefault() {
            if (this.browserEvent && this.browserEvent.preventDefault) {
                this.browserEvent.preventDefault();
            }
        }
        stopPropagation() {
            if (this.browserEvent && this.browserEvent.stopPropagation) {
                this.browserEvent.stopPropagation();
            }
        }
        toKeyCodeChord() {
            return this._asKeyCodeChord;
        }
        equals(other) {
            return this._asKeybinding === other;
        }
        _computeKeybinding() {
            let key = 0 /* KeyCode.Unknown */;
            if (this.keyCode !== 5 /* KeyCode.Ctrl */ && this.keyCode !== 4 /* KeyCode.Shift */ && this.keyCode !== 6 /* KeyCode.Alt */ && this.keyCode !== 57 /* KeyCode.Meta */) {
                key = this.keyCode;
            }
            let result = 0;
            if (this.ctrlKey) {
                result |= ctrlKeyMod;
            }
            if (this.altKey) {
                result |= altKeyMod;
            }
            if (this.shiftKey) {
                result |= shiftKeyMod;
            }
            if (this.metaKey) {
                result |= metaKeyMod;
            }
            result |= key;
            return result;
        }
        _computeKeyCodeChord() {
            let key = 0 /* KeyCode.Unknown */;
            if (this.keyCode !== 5 /* KeyCode.Ctrl */ && this.keyCode !== 4 /* KeyCode.Shift */ && this.keyCode !== 6 /* KeyCode.Alt */ && this.keyCode !== 57 /* KeyCode.Meta */) {
                key = this.keyCode;
            }
            return new keybindings_1.KeyCodeChord(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
        }
    }
    exports.StandardKeyboardEvent = StandardKeyboardEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRFdmVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2tleWJvYXJkRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLFNBQVMsY0FBYyxDQUFDLENBQWdCO1FBQ3ZDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLDJCQUEyQjtZQUMzQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMzRCxPQUFPLHVCQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBRTFCLGlCQUFpQjtRQUNqQixJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuQixrQ0FBMEI7UUFDM0IsQ0FBQzthQUFNLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzlCLFFBQVEsT0FBTyxFQUFFLENBQUM7Z0JBQ2pCLEtBQUssRUFBRSxDQUFDLENBQUMsa0NBQXlCO2dCQUNsQyxLQUFLLEVBQUU7b0JBQ04sSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQUMsc0NBQTZCO29CQUFDLENBQUM7b0JBQ3ZELE1BQU07Z0JBQ1AsS0FBSyxFQUFFLENBQUMsQ0FBQyw4QkFBcUI7Z0JBQzlCLCtGQUErRjtnQkFDL0YsS0FBSyxHQUFHLENBQUMsQ0FBQyxtQ0FBeUI7Z0JBQ25DLEtBQUssR0FBRyxDQUFDLENBQUMsd0NBQThCO2dCQUN4QyxLQUFLLEdBQUcsQ0FBQyxDQUFDLDhCQUFxQjtnQkFDL0IsS0FBSyxHQUFHO29CQUNQLElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dC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
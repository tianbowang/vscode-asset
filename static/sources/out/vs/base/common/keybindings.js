/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResolvedKeybinding = exports.ResolvedChord = exports.Keybinding = exports.ScanCodeChord = exports.KeyCodeChord = exports.createSimpleKeybinding = exports.decodeKeybinding = void 0;
    /**
     * Binary encoding strategy:
     * ```
     *    1111 11
     *    5432 1098 7654 3210
     *    ---- CSAW KKKK KKKK
     *  C = bit 11 = ctrlCmd flag
     *  S = bit 10 = shift flag
     *  A = bit 9 = alt flag
     *  W = bit 8 = winCtrl flag
     *  K = bits 0-7 = key code
     * ```
     */
    var BinaryKeybindingsMask;
    (function (BinaryKeybindingsMask) {
        BinaryKeybindingsMask[BinaryKeybindingsMask["CtrlCmd"] = 2048] = "CtrlCmd";
        BinaryKeybindingsMask[BinaryKeybindingsMask["Shift"] = 1024] = "Shift";
        BinaryKeybindingsMask[BinaryKeybindingsMask["Alt"] = 512] = "Alt";
        BinaryKeybindingsMask[BinaryKeybindingsMask["WinCtrl"] = 256] = "WinCtrl";
        BinaryKeybindingsMask[BinaryKeybindingsMask["KeyCode"] = 255] = "KeyCode";
    })(BinaryKeybindingsMask || (BinaryKeybindingsMask = {}));
    function decodeKeybinding(keybinding, OS) {
        if (typeof keybinding === 'number') {
            if (keybinding === 0) {
                return null;
            }
            const firstChord = (keybinding & 0x0000FFFF) >>> 0;
            const secondChord = (keybinding & 0xFFFF0000) >>> 16;
            if (secondChord !== 0) {
                return new Keybinding([
                    createSimpleKeybinding(firstChord, OS),
                    createSimpleKeybinding(secondChord, OS)
                ]);
            }
            return new Keybinding([createSimpleKeybinding(firstChord, OS)]);
        }
        else {
            const chords = [];
            for (let i = 0; i < keybinding.length; i++) {
                chords.push(createSimpleKeybinding(keybinding[i], OS));
            }
            return new Keybinding(chords);
        }
    }
    exports.decodeKeybinding = decodeKeybinding;
    function createSimpleKeybinding(keybinding, OS) {
        const ctrlCmd = (keybinding & 2048 /* BinaryKeybindingsMask.CtrlCmd */ ? true : false);
        const winCtrl = (keybinding & 256 /* BinaryKeybindingsMask.WinCtrl */ ? true : false);
        const ctrlKey = (OS === 2 /* OperatingSystem.Macintosh */ ? winCtrl : ctrlCmd);
        const shiftKey = (keybinding & 1024 /* BinaryKeybindingsMask.Shift */ ? true : false);
        const altKey = (keybinding & 512 /* BinaryKeybindingsMask.Alt */ ? true : false);
        const metaKey = (OS === 2 /* OperatingSystem.Macintosh */ ? ctrlCmd : winCtrl);
        const keyCode = (keybinding & 255 /* BinaryKeybindingsMask.KeyCode */);
        return new KeyCodeChord(ctrlKey, shiftKey, altKey, metaKey, keyCode);
    }
    exports.createSimpleKeybinding = createSimpleKeybinding;
    /**
     * Represents a chord which uses the `keyCode` field of keyboard events.
     * A chord is a combination of keys pressed simultaneously.
     */
    class KeyCodeChord {
        constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.keyCode = keyCode;
        }
        equals(other) {
            return (other instanceof KeyCodeChord
                && this.ctrlKey === other.ctrlKey
                && this.shiftKey === other.shiftKey
                && this.altKey === other.altKey
                && this.metaKey === other.metaKey
                && this.keyCode === other.keyCode);
        }
        getHashCode() {
            const ctrl = this.ctrlKey ? '1' : '0';
            const shift = this.shiftKey ? '1' : '0';
            const alt = this.altKey ? '1' : '0';
            const meta = this.metaKey ? '1' : '0';
            return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`;
        }
        isModifierKey() {
            return (this.keyCode === 0 /* KeyCode.Unknown */
                || this.keyCode === 5 /* KeyCode.Ctrl */
                || this.keyCode === 57 /* KeyCode.Meta */
                || this.keyCode === 6 /* KeyCode.Alt */
                || this.keyCode === 4 /* KeyCode.Shift */);
        }
        toKeybinding() {
            return new Keybinding([this]);
        }
        /**
         * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
         */
        isDuplicateModifierCase() {
            return ((this.ctrlKey && this.keyCode === 5 /* KeyCode.Ctrl */)
                || (this.shiftKey && this.keyCode === 4 /* KeyCode.Shift */)
                || (this.altKey && this.keyCode === 6 /* KeyCode.Alt */)
                || (this.metaKey && this.keyCode === 57 /* KeyCode.Meta */));
        }
    }
    exports.KeyCodeChord = KeyCodeChord;
    /**
     * Represents a chord which uses the `code` field of keyboard events.
     * A chord is a combination of keys pressed simultaneously.
     */
    class ScanCodeChord {
        constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.scanCode = scanCode;
        }
        equals(other) {
            return (other instanceof ScanCodeChord
                && this.ctrlKey === other.ctrlKey
                && this.shiftKey === other.shiftKey
                && this.altKey === other.altKey
                && this.metaKey === other.metaKey
                && this.scanCode === other.scanCode);
        }
        getHashCode() {
            const ctrl = this.ctrlKey ? '1' : '0';
            const shift = this.shiftKey ? '1' : '0';
            const alt = this.altKey ? '1' : '0';
            const meta = this.metaKey ? '1' : '0';
            return `S${ctrl}${shift}${alt}${meta}${this.scanCode}`;
        }
        /**
         * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
         */
        isDuplicateModifierCase() {
            return ((this.ctrlKey && (this.scanCode === 157 /* ScanCode.ControlLeft */ || this.scanCode === 161 /* ScanCode.ControlRight */))
                || (this.shiftKey && (this.scanCode === 158 /* ScanCode.ShiftLeft */ || this.scanCode === 162 /* ScanCode.ShiftRight */))
                || (this.altKey && (this.scanCode === 159 /* ScanCode.AltLeft */ || this.scanCode === 163 /* ScanCode.AltRight */))
                || (this.metaKey && (this.scanCode === 160 /* ScanCode.MetaLeft */ || this.scanCode === 164 /* ScanCode.MetaRight */)));
        }
    }
    exports.ScanCodeChord = ScanCodeChord;
    /**
     * A keybinding is a sequence of chords.
     */
    class Keybinding {
        constructor(chords) {
            if (chords.length === 0) {
                throw (0, errors_1.illegalArgument)(`chords`);
            }
            this.chords = chords;
        }
        getHashCode() {
            let result = '';
            for (let i = 0, len = this.chords.length; i < len; i++) {
                if (i !== 0) {
                    result += ';';
                }
                result += this.chords[i].getHashCode();
            }
            return result;
        }
        equals(other) {
            if (other === null) {
                return false;
            }
            if (this.chords.length !== other.chords.length) {
                return false;
            }
            for (let i = 0; i < this.chords.length; i++) {
                if (!this.chords[i].equals(other.chords[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.Keybinding = Keybinding;
    class ResolvedChord {
        constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.keyLabel = keyLabel;
            this.keyAriaLabel = keyAriaLabel;
        }
    }
    exports.ResolvedChord = ResolvedChord;
    /**
     * A resolved keybinding. Consists of one or multiple chords.
     */
    class ResolvedKeybinding {
    }
    exports.ResolvedKeybinding = ResolvedKeybinding;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2tleWJpbmRpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRzs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxJQUFXLHFCQU1WO0lBTkQsV0FBVyxxQkFBcUI7UUFDL0IsMEVBQXlCLENBQUE7UUFDekIsc0VBQXVCLENBQUE7UUFDdkIsaUVBQW9CLENBQUE7UUFDcEIseUVBQXdCLENBQUE7UUFDeEIseUVBQW9CLENBQUE7SUFDckIsQ0FBQyxFQU5VLHFCQUFxQixLQUFyQixxQkFBcUIsUUFNL0I7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxVQUE2QixFQUFFLEVBQW1CO1FBQ2xGLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDcEMsSUFBSSxVQUFVLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztZQUNELE1BQU0sVUFBVSxHQUFHLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuRCxNQUFNLFdBQVcsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDckQsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLE9BQU8sSUFBSSxVQUFVLENBQUM7b0JBQ3JCLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7b0JBQ3RDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7aUJBQ3ZDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFDRCxPQUFPLElBQUksVUFBVSxDQUFDLENBQUMsc0JBQXNCLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO2FBQU0sQ0FB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
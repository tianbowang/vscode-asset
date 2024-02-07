(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/base/common/platform", "vs/base/common/buffer"], function (require, exports, strings, platform, buffer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StringBuilder = exports.decodeUTF16LE = exports.getPlatformTextDecoder = void 0;
    let _utf16LE_TextDecoder;
    function getUTF16LE_TextDecoder() {
        if (!_utf16LE_TextDecoder) {
            _utf16LE_TextDecoder = new TextDecoder('UTF-16LE');
        }
        return _utf16LE_TextDecoder;
    }
    let _utf16BE_TextDecoder;
    function getUTF16BE_TextDecoder() {
        if (!_utf16BE_TextDecoder) {
            _utf16BE_TextDecoder = new TextDecoder('UTF-16BE');
        }
        return _utf16BE_TextDecoder;
    }
    let _platformTextDecoder;
    function getPlatformTextDecoder() {
        if (!_platformTextDecoder) {
            _platformTextDecoder = platform.isLittleEndian() ? getUTF16LE_TextDecoder() : getUTF16BE_TextDecoder();
        }
        return _platformTextDecoder;
    }
    exports.getPlatformTextDecoder = getPlatformTextDecoder;
    function decodeUTF16LE(source, offset, len) {
        const view = new Uint16Array(source.buffer, offset, len);
        if (len > 0 && (view[0] === 0xFEFF || view[0] === 0xFFFE)) {
            // UTF16 sometimes starts with a BOM https://de.wikipedia.org/wiki/Byte_Order_Mark
            // It looks like TextDecoder.decode will eat up a leading BOM (0xFEFF or 0xFFFE)
            // We don't want that behavior because we know the string is UTF16LE and the BOM should be maintained
            // So we use the manual decoder
            return compatDecodeUTF16LE(source, offset, len);
        }
        return getUTF16LE_TextDecoder().decode(view);
    }
    exports.decodeUTF16LE = decodeUTF16LE;
    function compatDecodeUTF16LE(source, offset, len) {
        const result = [];
        let resultLen = 0;
        for (let i = 0; i < len; i++) {
            const charCode = buffer.readUInt16LE(source, offset);
            offset += 2;
            result[resultLen++] = String.fromCharCode(charCode);
        }
        return result.join('');
    }
    class StringBuilder {
        constructor(capacity) {
            this._capacity = capacity | 0;
            this._buffer = new Uint16Array(this._capacity);
            this._completedStrings = null;
            this._bufferLength = 0;
        }
        reset() {
            this._completedStrings = null;
            this._bufferLength = 0;
        }
        build() {
            if (this._completedStrings !== null) {
                this._flushBuffer();
                return this._completedStrings.join('');
            }
            return this._buildBuffer();
        }
        _buildBuffer() {
            if (this._bufferLength === 0) {
                return '';
            }
            const view = new Uint16Array(this._buffer.buffer, 0, this._bufferLength);
            return getPlatformTextDecoder().decode(view);
        }
        _flushBuffer() {
            const bufferString = this._buildBuffer();
            this._bufferLength = 0;
            if (this._completedStrings === null) {
                this._completedStrings = [bufferString];
            }
            else {
                this._completedStrings[this._completedStrings.length] = bufferString;
            }
        }
        /**
         * Append a char code (<2^16)
         */
        appendCharCode(charCode) {
            const remainingSpace = this._capacity - this._bufferLength;
            if (remainingSpace <= 1) {
                if (remainingSpace === 0 || strings.isHighSurrogate(charCode)) {
                    this._flushBuffer();
                }
            }
            this._buffer[this._bufferLength++] = charCode;
        }
        /**
         * Append an ASCII char code (<2^8)
         */
        appendASCIICharCode(charCode) {
            if (this._bufferLength === this._capacity) {
                // buffer is full
                this._flushBuffer();
            }
            this._buffer[this._bufferLength++] = charCode;
        }
        appendString(str) {
            const strLen = str.length;
            if (this._bufferLength + strLen >= this._capacity) {
                // This string does not fit in the remaining buffer space
                this._flushBuffer();
                this._completedStrings[this._completedStrings.length] = str;
                return;
            }
            for (let i = 0; i < strLen; i++) {
                this._buffer[this._bufferLength++] = str.charCodeAt(i);
            }
        }
    }
    exports.StringBuilder = StringBuilder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nQnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb3JlL3N0cmluZ0J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLElBQUksb0JBQXdDLENBQUM7SUFDN0MsU0FBUyxzQkFBc0I7UUFDOUIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDM0Isb0JBQW9CLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELE9BQU8sb0JBQW9CLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQUksb0JBQXdDLENBQUM7SUFDN0MsU0FBUyxzQkFBc0I7UUFDOUIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDM0Isb0JBQW9CLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELE9BQU8sb0JBQW9CLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQUksb0JBQXdDLENBQUM7SUFDN0MsU0FBZ0Isc0JBQXNCO1FBQ3JDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzNCLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUN4RyxDQUFDO1FBQ0QsT0FBTyxvQkFBb0IsQ0FBQztJQUM3QixDQUFDO0lBTEQsd0RBS0M7SUFFRCxTQUFnQixhQUFhLENBQUMsTUFBa0IsRUFBRSxNQUFjLEVBQUUsR0FBVztRQUM1RSxNQUFNLElBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6RCxJQUFJLEdBQUcsR0FBRyxDQUFD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
//# sourceURL=../../../vs/editor/common/core/stringBuilder.js
})
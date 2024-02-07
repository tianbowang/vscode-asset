(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StringSHA1 = exports.toHexString = exports.Hasher = exports.stringHash = exports.numberHash = exports.doHash = exports.hash = void 0;
    /**
     * Return a hash value for an object.
     */
    function hash(obj) {
        return doHash(obj, 0);
    }
    exports.hash = hash;
    function doHash(obj, hashVal) {
        switch (typeof obj) {
            case 'object':
                if (obj === null) {
                    return numberHash(349, hashVal);
                }
                else if (Array.isArray(obj)) {
                    return arrayHash(obj, hashVal);
                }
                return objectHash(obj, hashVal);
            case 'string':
                return stringHash(obj, hashVal);
            case 'boolean':
                return booleanHash(obj, hashVal);
            case 'number':
                return numberHash(obj, hashVal);
            case 'undefined':
                return numberHash(937, hashVal);
            default:
                return numberHash(617, hashVal);
        }
    }
    exports.doHash = doHash;
    function numberHash(val, initialHashVal) {
        return (((initialHashVal << 5) - initialHashVal) + val) | 0; // hashVal * 31 + ch, keep as int32
    }
    exports.numberHash = numberHash;
    function booleanHash(b, initialHashVal) {
        return numberHash(b ? 433 : 863, initialHashVal);
    }
    function stringHash(s, hashVal) {
        hashVal = numberHash(149417, hashVal);
        for (let i = 0, length = s.length; i < length; i++) {
            hashVal = numberHash(s.charCodeAt(i), hashVal);
        }
        return hashVal;
    }
    exports.stringHash = stringHash;
    function arrayHash(arr, initialHashVal) {
        initialHashVal = numberHash(104579, initialHashVal);
        return arr.reduce((hashVal, item) => doHash(item, hashVal), initialHashVal);
    }
    function objectHash(obj, initialHashVal) {
        initialHashVal = numberHash(181387, initialHashVal);
        return Object.keys(obj).sort().reduce((hashVal, key) => {
            hashVal = stringHash(key, hashVal);
            return doHash(obj[key], hashVal);
        }, initialHashVal);
    }
    class Hasher {
        constructor() {
            this._value = 0;
        }
        get value() {
            return this._value;
        }
        hash(obj) {
            this._value = doHash(obj, this._value);
            return this._value;
        }
    }
    exports.Hasher = Hasher;
    var SHA1Constant;
    (function (SHA1Constant) {
        SHA1Constant[SHA1Constant["BLOCK_SIZE"] = 64] = "BLOCK_SIZE";
        SHA1Constant[SHA1Constant["UNICODE_REPLACEMENT"] = 65533] = "UNICODE_REPLACEMENT";
    })(SHA1Constant || (SHA1Constant = {}));
    function leftRotate(value, bits, totalBits = 32) {
        // delta + bits = totalBits
        const delta = totalBits - bits;
        // All ones, expect `delta` zeros aligned to the right
        const mask = ~((1 << delta) - 1);
        // Join (value left-shifted `bits` bits) with (masked value right-shifted `delta` bits)
        return ((value << bits) | ((mask & value) >>> delta)) >>> 0;
    }
    function fill(dest, index = 0, count = dest.byteLength, value = 0) {
        for (let i = 0; i < count; i++) {
            dest[index + i] = value;
        }
    }
    function leftPad(value, length, char = '0') {
        while (value.length < length) {
            value = char + value;
        }
        return value;
    }
    function toHexString(bufferOrValue, bitsize = 32) {
        if (bufferOrValue instanceof ArrayBuffer) {
            return Array.from(new Uint8Array(bufferOrValue)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        return leftPad((bufferOrValue >>> 0).toString(16), bitsize / 4);
    }
    exports.toHexString = toHexString;
    /**
     * A SHA1 implementation that works with strings and does not allocate.
     */
    class StringSHA1 {
        static { this._bigBlock32 = new DataView(new ArrayBuffer(320)); } // 80 * 4 = 320
        constructor() {
            this._h0 = 0x67452301;
            this._h1 = 0xEFCDAB89;
            this._h2 = 0x98BADCFE;
            this._h3 = 0x10325476;
            this._h4 = 0xC3D2E1F0;
            this._buff = new Uint8Array(64 /* SHA1Constant.BLOCK_SIZE */ + 3 /* to fit any utf-8 */);
            this._buffDV = new DataView(this._buff.buffer);
            this._buffLen = 0;
            this._totalLen = 0;
            this._leftoverHighSurrogate = 0;
            this._finished = false;
        }
        update(str) {
            const strLen = str.length;
            if (strLen === 0) {
                return;
            }
            const buff = this._buff;
            let buffLen = this._buffLen;
            let leftoverHighSurrogate = this._leftoverHighSurrogate;
            let charCode;
            let offset;
            if (leftoverHighSurrogate !== 0) {
                charCode = leftoverHighSurrogate;
                offset = -1;
                leftoverHighSurrogate = 0;
            }
            else {
                charCode = str.charCodeAt(0);
                offset = 0;
            }
            while (true) {
                let codePoint = charCode;
                if (strings.isHighSurrogate(charCode)) {
                    if (offset + 1 < strLen) {
                        const nextCharCode = str.charCodeAt(offset + 1);
                        if (strings.isLowSurrogate(nextCharCode)) {
                            offset++;
                            codePoint = strings.computeCodePoint(charCode, nextCharCode);
                        }
                        else {
                            // illegal => unicode replacement character
                            codePoint = 65533 /* SHA1Constant.UNICODE_REPLACEMENT */;
                        }
                    }
                    else {
                        // last character is a surrogate pair
                        leftoverHighSurrogate = charCode;
                        break;
                    }
                }
                else if (strings.isLowSurrogate(charCode)) {
                    // illegal => unicode replacement character
                    codePoint = 65533 /* SHA1Constant.UNICODE_REPLACEMENT */;
                }
                buffLen = this._push(buff, buffLen, codePoint);
                offset++;
                if (offset < strLen) {
                    charCode = str.charCodeAt(offset);
                }
                else {
                    break;
                }
            }
            this._buffLen = buffLen;
            this._leftoverHighSurrogate = leftoverHighSurrogate;
        }
        _push(buff, buffLen, codePoint) {
            if (codePoint < 0x0080) {
                buff[buffLen++] = codePoint;
            }
            else if (codePoint < 0x0800) {
                buff[buffLen++] = 0b11000000 | ((codePoint & 0b00000000000000000000011111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else if (codePoint < 0x10000) {
                buff[buffLen++] = 0b11100000 | ((codePoint & 0b00000000000000001111000000000000) >>> 12);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else {
                buff[buffLen++] = 0b11110000 | ((codePoint & 0b00000000000111000000000000000000) >>> 18);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000111111000000000000) >>> 12);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            if (buffLen >= 64 /* SHA1Constant.BLOCK_SIZE */) {
                this._step();
                buffLen -= 64 /* SHA1Constant.BLOCK_SIZE */;
                this._totalLen += 64 /* SHA1Constant.BLOCK_SIZE */;
                // take last 3 in case of UTF8 overflow
                buff[0] = buff[64 /* SHA1Constant.BLOCK_SIZE */ + 0];
                buff[1] = buff[64 /* SHA1Constant.BLOCK_SIZE */ + 1];
                buff[2] = buff[64 /* SHA1Constant.BLOCK_SIZE */ + 2];
            }
            return buffLen;
        }
        digest() {
            if (!this._finished) {
                this._finished = true;
                if (this._leftoverHighSurrogate) {
                    // illegal => unicode replacement character
                    this._leftoverHighSurrogate = 0;
                    this._buffLen = this._push(this._buff, this._buffLen, 65533 /* SHA1Constant.UNICODE_REPLACEMENT */);
                }
                this._totalLen += this._buffLen;
                this._wrapUp();
            }
            return toHexString(this._h0) + toHexString(this._h1) + toHexString(this._h2) + toHexString(this._h3) + toHexString(this._h4);
        }
        _wrapUp() {
            this._buff[this._buffLen++] = 0x80;
            fill(this._buff, this._buffLen);
            if (this._buffLen > 56) {
                this._step();
                fill(this._buff);
            }
            // this will fit because the mantissa can cover up to 52 bits
            const ml = 8 * this._totalLen;
            this._buffDV.setUint32(56, Math.floor(ml / 4294967296), false);
            this._buffDV.setUint32(60, ml % 4294967296, false);
            this._step();
        }
        _step() {
            const bigBlock32 = StringSHA1._bigBlock32;
            const data = this._buffDV;
            for (let j = 0; j < 64 /* 16*4 */; j += 4) {
                bigBlock32.setUint32(j, data.getUint32(j, false), false);
            }
            for (let j = 64; j < 320 /* 80*4 */; j += 4) {
                bigBlock32.setUint32(j, leftRotate((bigBlock32.getUint32(j - 12, false) ^ bigBlock32.getUint32(j - 32, false) ^ bigBlock32.getUint32(j - 56, false) ^ bigBlock32.getUint32(j - 64, false)), 1), false);
            }
            let a = this._h0;
            let b = this._h1;
            let c = this._h2;
            let d = this._h3;
            let e = this._h4;
            let f, k;
            let temp;
            for (let j = 0; j < 80; j++) {
                if (j < 20) {
                    f = (b & c) | ((~b) & d);
                    k = 0x5A827999;
                }
                else if (j < 40) {
                    f = b ^ c ^ d;
                    k = 0x6ED9EBA1;
                }
                else if (j < 60) {
                    f = (b & c) | (b & d) | (c & d);
                    k = 0x8F1BBCDC;
                }
                else {
                    f = b ^ c ^ d;
                    k = 0xCA62C1D6;
                }
                temp = (leftRotate(a, 5) + f + e + k + bigBlock32.getUint32(j * 4, false)) & 0xffffffff;
                e = d;
                d = c;
                c = leftRotate(b, 30);
                b = a;
                a = temp;
            }
            this._h0 = (this._h0 + a) & 0xffffffff;
            this._h1 = (this._h1 + b) & 0xffffffff;
            this._h2 = (this._h2 + c) & 0xffffffff;
            this._h3 = (this._h3 + d) & 0xffffffff;
            this._h4 = (this._h4 + e) & 0xffffffff;
        }
    }
    exports.StringSHA1 = StringSHA1;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vaGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEc7O09BRUc7SUFDSCxTQUFnQixJQUFJLENBQUMsR0FBUTtRQUM1QixPQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUZELG9CQUVDO0lBRUQsU0FBZ0IsTUFBTSxDQUFDLEdBQVEsRUFBRSxPQUFlO1FBQy9DLFFBQVEsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNwQixLQUFLLFFBQVE7Z0JBQ1osSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFLENBQUM7b0JBQ2xCLE9BQU8sVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDakMsQ0FBQztxQkFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDL0IsT0FBTyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO2dCQUNELE9BQU8sVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqQyxLQUFLLFFBQVE7Z0JBQ1osT0FBTyxVQUFVLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2pDLEtBQUssU0FBUztnQkFDYixPQUFPLFdBQVcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbEMsS0FBSyxRQUFRO2dCQUNaLE9BQU8sVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqQyxLQUFLLFdBQVc7Z0JBQ2YsT0FBTyxVQUFVLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2pDO2dCQUNDLE9BQU8sVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMs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
//# sourceURL=../../../vs/base/common/hash.js
})
(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/stream"], function (require, exports, lazy_1, streams) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.encodeBase64 = exports.decodeBase64 = exports.prefixedBufferStream = exports.prefixedBufferReadable = exports.newWriteableBufferStream = exports.streamToBufferReadableStream = exports.bufferToStream = exports.bufferedStreamToBuffer = exports.streamToBuffer = exports.bufferToReadable = exports.readableToBuffer = exports.writeUInt8 = exports.readUInt8 = exports.writeUInt32LE = exports.readUInt32LE = exports.writeUInt32BE = exports.readUInt32BE = exports.writeUInt16LE = exports.readUInt16LE = exports.binaryIndexOf = exports.VSBuffer = void 0;
    const hasBuffer = (typeof Buffer !== 'undefined');
    const indexOfTable = new lazy_1.Lazy(() => new Uint8Array(256));
    let textEncoder;
    let textDecoder;
    class VSBuffer {
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        static alloc(byteLength) {
            if (hasBuffer) {
                return new VSBuffer(Buffer.allocUnsafe(byteLength));
            }
            else {
                return new VSBuffer(new Uint8Array(byteLength));
            }
        }
        /**
         * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
         * the returned `VSBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
         * which is not transferrable.
         */
        static wrap(actual) {
            if (hasBuffer && !(Buffer.isBuffer(actual))) {
                // https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
                // Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
                actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
            }
            return new VSBuffer(actual);
        }
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        static fromString(source, options) {
            const dontUseNodeBuffer = options?.dontUseNodeBuffer || false;
            if (!dontUseNodeBuffer && hasBuffer) {
                return new VSBuffer(Buffer.from(source));
            }
            else {
                if (!textEncoder) {
                    textEncoder = new TextEncoder();
                }
                return new VSBuffer(textEncoder.encode(source));
            }
        }
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        static fromByteArray(source) {
            const result = VSBuffer.alloc(source.length);
            for (let i = 0, len = source.length; i < len; i++) {
                result.buffer[i] = source[i];
            }
            return result;
        }
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        static concat(buffers, totalLength) {
            if (typeof totalLength === 'undefined') {
                totalLength = 0;
                for (let i = 0, len = buffers.length; i < len; i++) {
                    totalLength += buffers[i].byteLength;
                }
            }
            const ret = VSBuffer.alloc(totalLength);
            let offset = 0;
            for (let i = 0, len = buffers.length; i < len; i++) {
                const element = buffers[i];
                ret.set(element, offset);
                offset += element.byteLength;
            }
            return ret;
        }
        constructor(buffer) {
            this.buffer = buffer;
            this.byteLength = this.buffer.byteLength;
        }
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        clone() {
            const result = VSBuffer.alloc(this.byteLength);
            result.set(this);
            return result;
        }
        toString() {
            if (hasBuffer) {
                return this.buffer.toString();
            }
            else {
                if (!textDecoder) {
                    textDecoder = new TextDecoder();
                }
                return textDecoder.decode(this.buffer);
            }
        }
        slice(start, end) {
            // IMPORTANT: use subarray instead of slice because TypedArray#slice
            // creates shallow copy and NodeBuffer#slice doesn't. The use of subarray
            // ensures the same, performance, behaviour.
            return new VSBuffer(this.buffer.subarray(start, end));
        }
        set(array, offset) {
            if (array instanceof VSBuffer) {
                this.buffer.set(array.buffer, offset);
            }
            else if (array instanceof Uint8Array) {
                this.buffer.set(array, offset);
            }
            else if (array instanceof ArrayBuffer) {
                this.buffer.set(new Uint8Array(array), offset);
            }
            else if (ArrayBuffer.isView(array)) {
                this.buffer.set(new Uint8Array(array.buffer, array.byteOffset, array.byteLength), offset);
            }
            else {
                throw new Error(`Unknown argument 'array'`);
            }
        }
        readUInt32BE(offset) {
            return readUInt32BE(this.buffer, offset);
        }
        writeUInt32BE(value, offset) {
            writeUInt32BE(this.buffer, value, offset);
        }
        readUInt32LE(offset) {
            return readUInt32LE(this.buffer, offset);
        }
        writeUInt32LE(value, offset) {
            writeUInt32LE(this.buffer, value, offset);
        }
        readUInt8(offset) {
            return readUInt8(this.buffer, offset);
        }
        writeUInt8(value, offset) {
            writeUInt8(this.buffer, value, offset);
        }
        indexOf(subarray, offset = 0) {
            return binaryIndexOf(this.buffer, subarray instanceof VSBuffer ? subarray.buffer : subarray, offset);
        }
    }
    exports.VSBuffer = VSBuffer;
    /**
     * Like String.indexOf, but works on Uint8Arrays.
     * Uses the boyer-moore-horspool algorithm to be reasonably speedy.
     */
    function binaryIndexOf(haystack, needle, offset = 0) {
        const needleLen = needle.byteLength;
        const haystackLen = haystack.byteLength;
        if (needleLen === 0) {
            return 0;
        }
        if (needleLen === 1) {
            return haystack.indexOf(needle[0]);
        }
        if (needleLen > haystackLen - offset) {
            return -1;
        }
        // find index of the subarray using boyer-moore-horspool algorithm
        const table = indexOfTable.value;
        table.fill(needle.length);
        for (let i = 0; i < needle.length; i++) {
            table[needle[i]] = needle.length - i - 1;
        }
        let i = offset + needle.length - 1;
        let j = i;
        let result = -1;
        while (i < haystackLen) {
            if (haystack[i] === needle[j]) {
                if (j === 0) {
                    result = i;
                    break;
                }
                i--;
                j--;
            }
            else {
                i += Math.max(needle.length - j, table[haystack[i]]);
                j = needle.length - 1;
            }
        }
        return result;
    }
    exports.binaryIndexOf = binaryIndexOf;
    function readUInt16LE(source, offset) {
        return (((source[offset + 0] << 0) >>> 0) |
            ((source[offset + 1] << 8) >>> 0));
    }
    exports.readUInt16LE = readUInt16LE;
    function writeUInt16LE(destination, value, offset) {
        destination[offset + 0] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 1] = (value & 0b11111111);
    }
    exports.writeUInt16LE = writeUInt16LE;
    function readUInt32BE(source, offset) {
        return (source[offset] * 2 ** 24
            + source[offset + 1] * 2 ** 16
            + source[offset + 2] * 2 ** 8
            + source[offset + 3]);
    }
    exports.readUInt32BE = readUInt32BE;
    function writeUInt32BE(destination, value, offset) {
        destination[offset + 3] = value;
        value = value >>> 8;
        destination[offset + 2] = value;
        value = value >>> 8;
        destination[offset + 1] = value;
        value = value >>> 8;
        destination[offset] = value;
    }
    exports.writeUInt32BE = writeUInt32BE;
    function readUInt32LE(source, offset) {
        return (((source[offset + 0] << 0) >>> 0) |
            ((source[offset + 1] << 8) >>> 0) |
            ((source[offset + 2] << 16) >>> 0) |
            ((source[offset + 3] << 24) >>> 0));
    }
    exports.readUInt32LE = readUInt32LE;
    function writeUInt32LE(destination, value, offset) {
        destination[offset + 0] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 1] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 2] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 3] = (value & 0b11111111);
    }
    exports.writeUInt32LE = writeUInt32LE;
    function readUInt8(source, offset) {
        return source[offset];
    }
    exports.readUInt8 = readUInt8;
    function writeUInt8(destination, value, offset) {
        destination[offset] = value;
    }
    exports.writeUInt8 = writeUInt8;
    function readableToBuffer(readable) {
        return streams.consumeReadable(readable, chunks => VSBuffer.concat(chunks));
    }
    exports.readableToBuffer = readableToBuffer;
    function bufferToReadable(buffer) {
        return streams.toReadable(buffer);
    }
    exports.bufferToReadable = bufferToReadable;
    function streamToBuffer(stream) {
        return streams.consumeStream(stream, chunks => VSBuffer.concat(chunks));
    }
    exports.streamToBuffer = streamToBuffer;
    async function bufferedStreamToBuffer(bufferedStream) {
        if (bufferedStream.ended) {
            return VSBuffer.concat(bufferedStream.buffer);
        }
        return VSBuffer.concat([
            // Include already read chunks...
            ...bufferedStream.buffer,
            // ...and all additional chunks
            await streamToBuffer(bufferedStream.stream)
        ]);
    }
    exports.bufferedStreamToBuffer = bufferedStreamToBuffer;
    function bufferToStream(buffer) {
        return streams.toStream(buffer, chunks => VSBuffer.concat(chunks));
    }
    exports.bufferToStream = bufferToStream;
    function streamToBufferReadableStream(stream) {
        return streams.transform(stream, { data: data => typeof data === 'string' ? VSBuffer.fromString(data) : VSBuffer.wrap(data) }, chunks => VSBuffer.concat(chunks));
    }
    exports.streamToBufferReadableStream = streamToBufferReadableStream;
    function newWriteableBufferStream(options) {
        return streams.newWriteableStream(chunks => VSBuffer.concat(chunks), options);
    }
    exports.newWriteableBufferStream = newWriteableBufferStream;
    function prefixedBufferReadable(prefix, readable) {
        return streams.prefixedReadable(prefix, readable, chunks => VSBuffer.concat(chunks));
    }
    exports.prefixedBufferReadable = prefixedBufferReadable;
    function prefixedBufferStream(prefix, stream) {
        return streams.prefixedStream(prefix, stream, chunks => VSBuffer.concat(chunks));
    }
    exports.prefixedBufferStream = prefixedBufferStream;
    /** Decodes base64 to a uint8 array. URL-encoded and unpadded base64 is allowed. */
    function decodeBase64(encoded) {
        let building = 0;
        let remainder = 0;
        let bufi = 0;
        // The simpler way to do this is `Uint8Array.from(atob(str), c => c.charCodeAt(0))`,
        // but that's about 10-20x slower than this function in current Chromium versions.
        const buffer = new Uint8Array(Math.floor(encoded.length / 4 * 3));
        const append = (value) => {
            switch (remainder) {
                case 3:
                    buffer[bufi++] = building | value;
                    remainder = 0;
                    break;
                case 2:
                    buffer[bufi++] = building | (value >>> 2);
                    building = value << 6;
                    remainder = 3;
                    break;
                case 1:
                    buffer[bufi++] = building | (value >>> 4);
                    building = value << 4;
                    remainder = 2;
                    break;
                default:
                    building = value << 2;
                    remainder = 1;
            }
        };
        for (let i = 0; i < encoded.length; i++) {
            const code = encoded.charCodeAt(i);
            // See https://datatracker.ietf.org/doc/html/rfc4648#section-4
            // This branchy code is about 3x faster than an indexOf on a base64 char string.
            if (code >= 65 && code <= 90) {
                append(code - 65); // A-Z starts ranges from char code 65 to 90
            }
            else if (code >= 97 && code <= 122) {
                append(code - 97 + 26); // a-z starts ranges from char code 97 to 122, starting at byte 26
            }
            else if (code >= 48 && code <= 57) {
                append(code - 48 + 52); // 0-9 starts ranges from char code 48 to 58, starting at byte 52
            }
            else if (code === 43 || code === 45) {
                append(62); // "+" or "-" for URLS
            }
            else if (code === 47 || code === 95) {
                append(63); // "/" or "_" for URLS
            }
            else if (code === 61) {
                break; // "="
            }
            else {
                throw new SyntaxError(`Unexpected base64 character ${encoded[i]}`);
            }
        }
        const unpadded = bufi;
        while (remainder > 0) {
            append(0);
        }
        // slice is needed to account for overestimation due to padding
        return VSBuffer.wrap(buffer).slice(0, unpadded);
    }
    exports.decodeBase64 = decodeBase64;
    const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const base64UrlSafeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    /** Encodes a buffer to a base64 string. */
    function encodeBase64({ buffer }, padded = true, urlSafe = false) {
        const dictionary = urlSafe ? base64UrlSafeAlphabet : base64Alphabet;
        let output = '';
        const remainder = buffer.byteLength % 3;
        let i = 0;
        for (; i < buffer.byteLength - remainder; i += 3) {
            const a = buffer[i + 0];
            const b = buffer[i + 1];
            const c = buffer[i + 2];
            output += dictionary[a >>> 2];
            output += dictionary[(a << 4 | b >>> 4) & 0b111111];
            output += dictionary[(b << 2 | c >>> 6) & 0b111111];
            output += dictionary[c & 0b111111];
        }
        if (remainder === 1) {
            const a = buffer[i + 0];
            output += dictionary[a >>> 2];
            output += dictionary[(a << 4) & 0b111111];
            if (padded) {
                output += '==';
            }
        }
        else if (remainder === 2) {
            const a = buffer[i + 0];
            const b = buffer[i + 1];
            output += dictionary[a >>> 2];
            output += dictionary[(a << 4 | b >>> 4) & 0b111111];
            output += dictionary[(b << 2) & 0b111111];
            if (padded) {
                output += '=';
            }
        }
        return output;
    }
    exports.encodeBase64 = encodeBase64;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmZmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9idWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQU0sU0FBUyxHQUFHLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUM7SUFDbEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxXQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUV6RCxJQUFJLFdBQStCLENBQUM7SUFDcEMsSUFBSSxXQUErQixDQUFDO0lBRXBDLE1BQWEsUUFBUTtRQUVwQjs7O1dBR0c7UUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQWtCO1lBQzlCLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ2YsT0FBTyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0YsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQWtCO1lBQzdCLElBQUksU0FBUyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDN0MsMEhBQTBIO2dCQUMxSCx3RkFBd0Y7Z0JBQ3hGLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0UsQ0FBQztZQUNELE9BQU8sSUFBSSxRQUFRLENBQUMsTUFB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
//# sourceURL=../../../vs/base/common/buffer.js
})
(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/platform"], function (require, exports, buffer_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeSemanticTokensDto = exports.encodeSemanticTokensDto = void 0;
    var EncodedSemanticTokensType;
    (function (EncodedSemanticTokensType) {
        EncodedSemanticTokensType[EncodedSemanticTokensType["Full"] = 1] = "Full";
        EncodedSemanticTokensType[EncodedSemanticTokensType["Delta"] = 2] = "Delta";
    })(EncodedSemanticTokensType || (EncodedSemanticTokensType = {}));
    function reverseEndianness(arr) {
        for (let i = 0, len = arr.length; i < len; i += 4) {
            // flip bytes 0<->3 and 1<->2
            const b0 = arr[i + 0];
            const b1 = arr[i + 1];
            const b2 = arr[i + 2];
            const b3 = arr[i + 3];
            arr[i + 0] = b3;
            arr[i + 1] = b2;
            arr[i + 2] = b1;
            arr[i + 3] = b0;
        }
    }
    function toLittleEndianBuffer(arr) {
        const uint8Arr = new Uint8Array(arr.buffer, arr.byteOffset, arr.length * 4);
        if (!platform.isLittleEndian()) {
            // the byte order must be changed
            reverseEndianness(uint8Arr);
        }
        return buffer_1.VSBuffer.wrap(uint8Arr);
    }
    function fromLittleEndianBuffer(buff) {
        const uint8Arr = buff.buffer;
        if (!platform.isLittleEndian()) {
            // the byte order must be changed
            reverseEndianness(uint8Arr);
        }
        if (uint8Arr.byteOffset % 4 === 0) {
            return new Uint32Array(uint8Arr.buffer, uint8Arr.byteOffset, uint8Arr.length / 4);
        }
        else {
            // unaligned memory access doesn't work on all platforms
            const data = new Uint8Array(uint8Arr.byteLength);
            data.set(uint8Arr);
            return new Uint32Array(data.buffer, data.byteOffset, data.length / 4);
        }
    }
    function encodeSemanticTokensDto(semanticTokens) {
        const dest = new Uint32Array(encodeSemanticTokensDtoSize(semanticTokens));
        let offset = 0;
        dest[offset++] = semanticTokens.id;
        if (semanticTokens.type === 'full') {
            dest[offset++] = 1 /* EncodedSemanticTokensType.Full */;
            dest[offset++] = semanticTokens.data.length;
            dest.set(semanticTokens.data, offset);
            offset += semanticTokens.data.length;
        }
        else {
            dest[offset++] = 2 /* EncodedSemanticTokensType.Delta */;
            dest[offset++] = semanticTokens.deltas.length;
            for (const delta of semanticTokens.deltas) {
                dest[offset++] = delta.start;
                dest[offset++] = delta.deleteCount;
                if (delta.data) {
                    dest[offset++] = delta.data.length;
                    dest.set(delta.data, offset);
                    offset += delta.data.length;
                }
                else {
                    dest[offset++] = 0;
                }
            }
        }
        return toLittleEndianBuffer(dest);
    }
    exports.encodeSemanticTokensDto = encodeSemanticTokensDto;
    function encodeSemanticTokensDtoSize(semanticTokens) {
        let result = 0;
        result += (+1 // id
            + 1 // type
        );
        if (semanticTokens.type === 'full') {
            result += (+1 // data length
                + semanticTokens.data.length);
        }
        else {
            result += (+1 // delta count
            );
            result += (+1 // start
                + 1 // deleteCount
                + 1 // data length
            ) * semanticTokens.deltas.length;
            for (const delta of semanticTokens.deltas) {
                if (delta.data) {
                    result += delta.data.length;
                }
            }
        }
        return result;
    }
    function decodeSemanticTokensDto(_buff) {
        const src = fromLittleEndianBuffer(_buff);
        let offset = 0;
        const id = src[offset++];
        const type = src[offset++];
        if (type === 1 /* EncodedSemanticTokensType.Full */) {
            const length = src[offset++];
            const data = src.subarray(offset, offset + length);
            offset += length;
            return {
                id: id,
                type: 'full',
                data: data
            };
        }
        const deltaCount = src[offset++];
        const deltas = [];
        for (let i = 0; i < deltaCount; i++) {
            const start = src[offset++];
            const deleteCount = src[offset++];
            const length = src[offset++];
            let data;
            if (length > 0) {
                data = src.subarray(offset, offset + length);
                offset += length;
            }
            deltas[i] = { start, deleteCount, data };
        }
        return {
            id: id,
            type: 'delta',
            deltas: deltas
        };
    }
    exports.decodeSemanticTokensDto = decodeSemanticTokensDto;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtYW50aWNUb2tlbnNEdG8uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vc2VydmljZXMvc2VtYW50aWNUb2tlbnNEdG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyxJQUFXLHlCQUdWO0lBSEQsV0FBVyx5QkFBeUI7UUFDbkMseUVBQVEsQ0FBQTtRQUNSLDJFQUFTLENBQUE7SUFDVixDQUFDLEVBSFUseUJBQXlCLEtBQXpCLHlCQUF5QixRQUduQztJQUVELFNBQVMsaUJBQWlCLENBQUMsR0FBZTtRQUN6QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuRCw2QkFBNkI7WUFDN0IsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0QixNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0QixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNoQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNoQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNoQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNqQixDQUFD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
//# sourceURL=../../../vs/editor/common/services/semanticTokensDto.js
})
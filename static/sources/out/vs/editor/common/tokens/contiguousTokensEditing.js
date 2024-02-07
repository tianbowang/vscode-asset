/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/tokens/lineTokens"], function (require, exports, lineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toUint32Array = exports.ContiguousTokensEditing = exports.EMPTY_LINE_TOKENS = void 0;
    exports.EMPTY_LINE_TOKENS = (new Uint32Array(0)).buffer;
    class ContiguousTokensEditing {
        static deleteBeginning(lineTokens, toChIndex) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            return ContiguousTokensEditing.delete(lineTokens, 0, toChIndex);
        }
        static deleteEnding(lineTokens, fromChIndex) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const lineTextLength = tokens[tokens.length - 2];
            return ContiguousTokensEditing.delete(lineTokens, fromChIndex, lineTextLength);
        }
        static delete(lineTokens, fromChIndex, toChIndex) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS || fromChIndex === toChIndex) {
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const tokensCount = (tokens.length >>> 1);
            // special case: deleting everything
            if (fromChIndex === 0 && tokens[tokens.length - 2] === toChIndex) {
                return exports.EMPTY_LINE_TOKENS;
            }
            const fromTokenIndex = lineTokens_1.LineTokens.findIndexInTokensArray(tokens, fromChIndex);
            const fromTokenStartOffset = (fromTokenIndex > 0 ? tokens[(fromTokenIndex - 1) << 1] : 0);
            const fromTokenEndOffset = tokens[fromTokenIndex << 1];
            if (toChIndex < fromTokenEndOffset) {
                // the delete range is inside a single token
                const delta = (toChIndex - fromChIndex);
                for (let i = fromTokenIndex; i < tokensCount; i++) {
                    tokens[i << 1] -= delta;
                }
                return lineTokens;
            }
            let dest;
            let lastEnd;
            if (fromTokenStartOffset !== fromChIndex) {
                tokens[fromTokenIndex << 1] = fromChIndex;
                dest = ((fromTokenIndex + 1) << 1);
                lastEnd = fromChIndex;
            }
            else {
                dest = (fromTokenIndex << 1);
                lastEnd = fromTokenStartOffset;
            }
            const delta = (toChIndex - fromChIndex);
            for (let tokenIndex = fromTokenIndex + 1; tokenIndex < tokensCount; tokenIndex++) {
                const tokenEndOffset = tokens[tokenIndex << 1] - delta;
                if (tokenEndOffset > lastEnd) {
                    tokens[dest++] = tokenEndOffset;
                    tokens[dest++] = tokens[(tokenIndex << 1) + 1];
                    lastEnd = tokenEndOffset;
                }
            }
            if (dest === tokens.length) {
                // nothing to trim
                return lineTokens;
            }
            const tmp = new Uint32Array(dest);
            tmp.set(tokens.subarray(0, dest), 0);
            return tmp.buffer;
        }
        static append(lineTokens, _otherTokens) {
            if (_otherTokens === exports.EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            if (lineTokens === exports.EMPTY_LINE_TOKENS) {
                return _otherTokens;
            }
            if (lineTokens === null) {
                return lineTokens;
            }
            if (_otherTokens === null) {
                // cannot determine combined line length...
                return null;
            }
            const myTokens = toUint32Array(lineTokens);
            const otherTokens = toUint32Array(_otherTokens);
            const otherTokensCount = (otherTokens.length >>> 1);
            const result = new Uint32Array(myTokens.length + otherTokens.length);
            result.set(myTokens, 0);
            let dest = myTokens.length;
            const delta = myTokens[myTokens.length - 2];
            for (let i = 0; i < otherTokensCount; i++) {
                result[dest++] = otherTokens[(i << 1)] + delta;
                result[dest++] = otherTokens[(i << 1) + 1];
            }
            return result.buffer;
        }
        static insert(lineTokens, chIndex, textLength) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS) {
                // nothing to do
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const tokensCount = (tokens.length >>> 1);
            let fromTokenIndex = lineTokens_1.LineTokens.findIndexInTokensArray(tokens, chIndex);
            if (fromTokenIndex > 0) {
                const fromTokenStartOffset = tokens[(fromTokenIndex - 1) << 1];
                if (fromTokenStartOffset === chIndex) {
                    fromTokenIndex--;
                }
            }
            for (let tokenIndex = fromTokenIndex; tokenIndex < tokensCount; tokenIndex++) {
                tokens[tokenIndex << 1] += textLength;
            }
            return lineTokens;
        }
    }
    exports.ContiguousTokensEditing = ContiguousTokensEditing;
    function toUint32Array(arr) {
        if (arr instanceof Uint32Array) {
            return arr;
        }
        else {
            return new Uint32Array(arr);
        }
    }
    exports.toUint32Array = toUint32Array;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGlndW91c1Rva2Vuc0VkaXRpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdG9rZW5zL2NvbnRpZ3VvdXNUb2tlbnNFZGl0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUluRixRQUFBLGlCQUFpQixHQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFFN0QsTUFBYSx1QkFBdUI7UUFFNUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUE0QyxFQUFFLFNBQWlCO1lBQzVGLElBQUksVUFBVSxLQUFLLElBQUksSUFBSSxVQUFVLEtBQUsseUJBQWlCLEVBQUUsQ0FBQztnQkFDN0QsT0FBTyxVQUFVLENBQUM7WUFDbkIsQ0FBQztZQUNELE9BQU8sdUJBQXVCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVNLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBNEMsRUFBRSxXQUFtQjtZQUMzRixJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksVUFBVSxLQUFLLHlCQUFpQixFQUFFLENBQUM7Z0JBQzdELE9BQU8sVUFBVSxDQUFDO1lBQ25CLENBQUM7WUFFRCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekMsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakQsT0FBTyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUE0QyxFQUFFLFdBQW1CLEVBQUUsU0FBaUI7WUFDeEcsSUFB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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/tokens/lineTokens", "vs/editor/common/languages/supports", "vs/editor/common/services/languagesRegistry"], function (require, exports, lineTokens_1, supports_1, languagesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createFakeScopedLineTokens = void 0;
    function createFakeScopedLineTokens(rawTokens) {
        const tokens = new Uint32Array(rawTokens.length << 1);
        let line = '';
        for (let i = 0, len = rawTokens.length; i < len; i++) {
            const rawToken = rawTokens[i];
            const startOffset = line.length;
            const metadata = ((rawToken.type << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>> 0;
            tokens[(i << 1)] = startOffset;
            tokens[(i << 1) + 1] = metadata;
            line += rawToken.text;
        }
        lineTokens_1.LineTokens.convertToEndOffset(tokens, line.length);
        return (0, supports_1.createScopedLineTokens)(new lineTokens_1.LineTokens(tokens, line, new languagesRegistry_1.LanguageIdCodec()), 0);
    }
    exports.createFakeScopedLineTokens = createFakeScopedLineTokens;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZXNUZXN0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9tb2Rlc1Rlc3RVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsU0FBZ0IsMEJBQTBCLENBQUMsU0FBc0I7UUFDaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFFZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDdEQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTlCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDaEMsTUFBTSxRQUFRLEdBQUcsQ0FDaEIsQ0FBQyxRQUFRLENBQUMsSUFBSSw0Q0FBb0MsQ0FBQyxDQUNuRCxLQUFLLENBQUMsQ0FBQztZQUVSLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztZQUMvQixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO1lBQ2hDLElBQUksSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCx1QkFBVSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFBLGlDQUFzQixFQUFDLElBQUksdUJBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksbUNBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQW5CRCxnRUFtQkMifQ==
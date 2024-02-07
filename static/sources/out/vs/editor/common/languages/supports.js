/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ignoreBracketsInToken = exports.ScopedLineTokens = exports.createScopedLineTokens = void 0;
    function createScopedLineTokens(context, offset) {
        const tokenCount = context.getCount();
        const tokenIndex = context.findTokenIndexAtOffset(offset);
        const desiredLanguageId = context.getLanguageId(tokenIndex);
        let lastTokenIndex = tokenIndex;
        while (lastTokenIndex + 1 < tokenCount && context.getLanguageId(lastTokenIndex + 1) === desiredLanguageId) {
            lastTokenIndex++;
        }
        let firstTokenIndex = tokenIndex;
        while (firstTokenIndex > 0 && context.getLanguageId(firstTokenIndex - 1) === desiredLanguageId) {
            firstTokenIndex--;
        }
        return new ScopedLineTokens(context, desiredLanguageId, firstTokenIndex, lastTokenIndex + 1, context.getStartOffset(firstTokenIndex), context.getEndOffset(lastTokenIndex));
    }
    exports.createScopedLineTokens = createScopedLineTokens;
    class ScopedLineTokens {
        constructor(actual, languageId, firstTokenIndex, lastTokenIndex, firstCharOffset, lastCharOffset) {
            this._scopedLineTokensBrand = undefined;
            this._actual = actual;
            this.languageId = languageId;
            this._firstTokenIndex = firstTokenIndex;
            this._lastTokenIndex = lastTokenIndex;
            this.firstCharOffset = firstCharOffset;
            this._lastCharOffset = lastCharOffset;
        }
        getLineContent() {
            const actualLineContent = this._actual.getLineContent();
            return actualLineContent.substring(this.firstCharOffset, this._lastCharOffset);
        }
        getActualLineContentBefore(offset) {
            const actualLineContent = this._actual.getLineContent();
            return actualLineContent.substring(0, this.firstCharOffset + offset);
        }
        getTokenCount() {
            return this._lastTokenIndex - this._firstTokenIndex;
        }
        findTokenIndexAtOffset(offset) {
            return this._actual.findTokenIndexAtOffset(offset + this.firstCharOffset) - this._firstTokenIndex;
        }
        getStandardTokenType(tokenIndex) {
            return this._actual.getStandardTokenType(tokenIndex + this._firstTokenIndex);
        }
    }
    exports.ScopedLineTokens = ScopedLineTokens;
    var IgnoreBracketsInTokens;
    (function (IgnoreBracketsInTokens) {
        IgnoreBracketsInTokens[IgnoreBracketsInTokens["value"] = 3] = "value";
    })(IgnoreBracketsInTokens || (IgnoreBracketsInTokens = {}));
    function ignoreBracketsInToken(standardTokenType) {
        return (standardTokenType & 3 /* IgnoreBracketsInTokens.value */) !== 0;
    }
    exports.ignoreBracketsInToken = ignoreBracketsInToken;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VwcG9ydHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbGFuZ3VhZ2VzL3N1cHBvcnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxTQUFnQixzQkFBc0IsQ0FBQyxPQUFtQixFQUFFLE1BQWM7UUFDekUsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxRCxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFNUQsSUFBSSxjQUFjLEdBQUcsVUFBVSxDQUFDO1FBQ2hDLE9BQU8sY0FBYyxHQUFHLENBQUMsR0FBRyxVQUFVLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLEtBQUssaUJBQWlCLEVBQUUsQ0FBQztZQUMzRyxjQUFjLEVBQUUsQ0FBQztRQUNsQixDQUFDO1FBRUQsSUFBSSxlQUFlLEdBQUcsVUFBVSxDQUFDO1FBQ2pDLE9BQU8sZUFBZSxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsS0FBSyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2hHLGVBQWUsRUFBRSxDQUFDO1FBQ25CLENBQUM7UUFFRCxPQUFPLElBQUksZ0JBQWdCLENBQzFCLE9BQU8sRUFDUCxpQkFBaUIsRUFDakIsZUFBZSxFQUNmLGNBQWMsR0FBRyxDQUFDLEVBQ2xCLE9BQU8sQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEVBQ3ZDLE9BQU8sQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQ3BDLENBQUM7SUFDSCxDQUFDO0lBdkJELHdEQXVCQztJQUVELE1BQWEsZ0JBQWdCO1FBVTVCLFlBQ0MsTUFBa0IsRUFDbEIsVUFBa0IsRUFDbEIsZUFBdUIsRUFDdkIsY0FBc0IsRUFDdEIsZUFBdUIsRUFDdkIsY0FBc0I7WUFmdkIsMkJBQXNCLEdBQVMsU0FBUyxDQUFDO1lBaUJ4QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUM3QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3ZDLENBQUM7UUFFTSxjQUFjO1lBQ3BCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN4RCxPQUFPLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRU0sMEJBQTBCLENBQUMsTUFBYztZQUMvQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDeEQsT0FBTyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUNyRCxDQUFDO1FBRU0sc0JBQXNCLENBQUMsTUFBYztZQUMzQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDbkcsQ0FBQztRQUVNLG9CQUFvQixDQUFDLFVBQWtCO1lBQzdDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUUsQ0FBQztLQUNEO0lBL0NELDRDQStDQztJQUVELElBQVcsc0JBRVY7SUFGRCxXQUFXLHNCQUFzQjtRQUNoQyxxRUFBc0YsQ0FBQTtJQUN2RixDQUFDLEVBRlUsc0JBQXNCLEtBQXRCLHNCQUFzQixRQUVoQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLGlCQUFvQztRQUN6RSxPQUFPLENBQUMsaUJBQWlCLHVDQUErQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFGRCxzREFFQyJ9
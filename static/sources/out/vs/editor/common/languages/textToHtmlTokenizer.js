/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/tokens/lineTokens", "vs/editor/common/languages", "vs/editor/common/languages/nullTokenize"], function (require, exports, strings, lineTokens_1, languages_1, nullTokenize_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._tokenizeToString = exports.tokenizeLineToHTML = exports.tokenizeToString = exports.tokenizeToStringSync = void 0;
    const fallback = {
        getInitialState: () => nullTokenize_1.NullState,
        tokenizeEncoded: (buffer, hasEOL, state) => (0, nullTokenize_1.nullTokenizeEncoded)(0 /* LanguageId.Null */, state)
    };
    function tokenizeToStringSync(languageService, text, languageId) {
        return _tokenizeToString(text, languageService.languageIdCodec, languages_1.TokenizationRegistry.get(languageId) || fallback);
    }
    exports.tokenizeToStringSync = tokenizeToStringSync;
    async function tokenizeToString(languageService, text, languageId) {
        if (!languageId) {
            return _tokenizeToString(text, languageService.languageIdCodec, fallback);
        }
        const tokenizationSupport = await languages_1.TokenizationRegistry.getOrCreate(languageId);
        return _tokenizeToString(text, languageService.languageIdCodec, tokenizationSupport || fallback);
    }
    exports.tokenizeToString = tokenizeToString;
    function tokenizeLineToHTML(text, viewLineTokens, colorMap, startOffset, endOffset, tabSize, useNbsp) {
        let result = `<div>`;
        let charIndex = startOffset;
        let tabsCharDelta = 0;
        let prevIsSpace = true;
        for (let tokenIndex = 0, tokenCount = viewLineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
            const tokenEndIndex = viewLineTokens.getEndOffset(tokenIndex);
            if (tokenEndIndex <= startOffset) {
                continue;
            }
            let partContent = '';
            for (; charIndex < tokenEndIndex && charIndex < endOffset; charIndex++) {
                const charCode = text.charCodeAt(charIndex);
                switch (charCode) {
                    case 9 /* CharCode.Tab */: {
                        let insertSpacesCount = tabSize - (charIndex + tabsCharDelta) % tabSize;
                        tabsCharDelta += insertSpacesCount - 1;
                        while (insertSpacesCount > 0) {
                            if (useNbsp && prevIsSpace) {
                                partContent += '&#160;';
                                prevIsSpace = false;
                            }
                            else {
                                partContent += ' ';
                                prevIsSpace = true;
                            }
                            insertSpacesCount--;
                        }
                        break;
                    }
                    case 60 /* CharCode.LessThan */:
                        partContent += '&lt;';
                        prevIsSpace = false;
                        break;
                    case 62 /* CharCode.GreaterThan */:
                        partContent += '&gt;';
                        prevIsSpace = false;
                        break;
                    case 38 /* CharCode.Ampersand */:
                        partContent += '&amp;';
                        prevIsSpace = false;
                        break;
                    case 0 /* CharCode.Null */:
                        partContent += '&#00;';
                        prevIsSpace = false;
                        break;
                    case 65279 /* CharCode.UTF8_BOM */:
                    case 8232 /* CharCode.LINE_SEPARATOR */:
                    case 8233 /* CharCode.PARAGRAPH_SEPARATOR */:
                    case 133 /* CharCode.NEXT_LINE */:
                        partContent += '\ufffd';
                        prevIsSpace = false;
                        break;
                    case 13 /* CharCode.CarriageReturn */:
                        // zero width space, because carriage return would introduce a line break
                        partContent += '&#8203';
                        prevIsSpace = false;
                        break;
                    case 32 /* CharCode.Space */:
                        if (useNbsp && prevIsSpace) {
                            partContent += '&#160;';
                            prevIsSpace = false;
                        }
                        else {
                            partContent += ' ';
                            prevIsSpace = true;
                        }
                        break;
                    default:
                        partContent += String.fromCharCode(charCode);
                        prevIsSpace = false;
                }
            }
            result += `<span style="${viewLineTokens.getInlineStyle(tokenIndex, colorMap)}">${partContent}</span>`;
            if (tokenEndIndex > endOffset || charIndex >= endOffset) {
                break;
            }
        }
        result += `</div>`;
        return result;
    }
    exports.tokenizeLineToHTML = tokenizeLineToHTML;
    function _tokenizeToString(text, languageIdCodec, tokenizationSupport) {
        let result = `<div class="monaco-tokenized-source">`;
        const lines = strings.splitLines(text);
        let currentState = tokenizationSupport.getInitialState();
        for (let i = 0, len = lines.length; i < len; i++) {
            const line = lines[i];
            if (i > 0) {
                result += `<br/>`;
            }
            const tokenizationResult = tokenizationSupport.tokenizeEncoded(line, true, currentState);
            lineTokens_1.LineTokens.convertToEndOffset(tokenizationResult.tokens, line.length);
            const lineTokens = new lineTokens_1.LineTokens(tokenizationResult.tokens, line, languageIdCodec);
            const viewLineTokens = lineTokens.inflate();
            let startOffset = 0;
            for (let j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
                const type = viewLineTokens.getClassName(j);
                const endIndex = viewLineTokens.getEndOffset(j);
                result += `<span class="${type}">${strings.escape(line.substring(startOffset, endIndex))}</span>`;
                startOffset = endIndex;
            }
            currentState = tokenizationResult.endState;
        }
        result += `</div>`;
        return result;
    }
    exports._tokenizeToString = _tokenizeToString;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFRvSHRtbFRva2VuaXplci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9sYW5ndWFnZXMvdGV4dFRvSHRtbFRva2VuaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBTSxRQUFRLEdBQWdDO1FBQzdDLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyx3QkFBUztRQUNoQyxlQUFlLEVBQUUsQ0FBQyxNQUFjLEVBQUUsTUFBZSxFQUFFLEtBQWEsRUFBRSxFQUFFLENBQUMsSUFBQSxrQ0FBbUIsMkJBQWtCLEtBQUssQ0FBQztLQUNoSCxDQUFDO0lBRUYsU0FBZ0Isb0JBQW9CLENBQUMsZUFBaUMsRUFBRSxJQUFZLEVBQUUsVUFBa0I7UUFDdkcsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLGVBQWUsRUFBRSxnQ0FBb0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLENBQUM7SUFDbkgsQ0FBQztJQUZELG9EQUVDO0lBRU0sS0FBSyxVQUFVLGdCQUFnQixDQUFDLGVBQWlDLEVBQUUsSUFBWSxFQUFFLFVBQXlCO1FBQ2hILElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNqQixPQUFPLGlCQUFpQixDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFDRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sZ0NBQW9CLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLE9BQU8saUJBQWlCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxlQUFlLEVBQUUsbUJBQW1CLElBQUksUUFBUSxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQU5ELDRDQU1DO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsSUFB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
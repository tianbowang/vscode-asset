/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/strings", "vs/editor/common/core/stringBuilder", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/linePart"], function (require, exports, nls, strings, stringBuilder_1, lineDecorations_1, linePart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderViewLine2 = exports.RenderLineOutput2 = exports.renderViewLine = exports.RenderLineOutput = exports.ForeignElementType = exports.CharacterMapping = exports.DomPosition = exports.RenderLineInput = exports.LineRange = exports.RenderWhitespace = void 0;
    var RenderWhitespace;
    (function (RenderWhitespace) {
        RenderWhitespace[RenderWhitespace["None"] = 0] = "None";
        RenderWhitespace[RenderWhitespace["Boundary"] = 1] = "Boundary";
        RenderWhitespace[RenderWhitespace["Selection"] = 2] = "Selection";
        RenderWhitespace[RenderWhitespace["Trailing"] = 3] = "Trailing";
        RenderWhitespace[RenderWhitespace["All"] = 4] = "All";
    })(RenderWhitespace || (exports.RenderWhitespace = RenderWhitespace = {}));
    class LineRange {
        constructor(startIndex, endIndex) {
            this.startOffset = startIndex;
            this.endOffset = endIndex;
        }
        equals(otherLineRange) {
            return this.startOffset === otherLineRange.startOffset
                && this.endOffset === otherLineRange.endOffset;
        }
    }
    exports.LineRange = LineRange;
    class RenderLineInput {
        constructor(useMonospaceOptimizations, canUseHalfwidthRightwardsArrow, lineContent, continuesWithWrappedLine, isBasicASCII, containsRTL, fauxIndentLength, lineTokens, lineDecorations, tabSize, startVisibleColumn, spaceWidth, middotWidth, wsmiddotWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures, selectionsOnLine) {
            this.useMonospaceOptimizations = useMonospaceOptimizations;
            this.canUseHalfwidthRightwardsArrow = canUseHalfwidthRightwardsArrow;
            this.lineContent = lineContent;
            this.continuesWithWrappedLine = continuesWithWrappedLine;
            this.isBasicASCII = isBasicASCII;
            this.containsRTL = containsRTL;
            this.fauxIndentLength = fauxIndentLength;
            this.lineTokens = lineTokens;
            this.lineDecorations = lineDecorations.sort(lineDecorations_1.LineDecoration.compare);
            this.tabSize = tabSize;
            this.startVisibleColumn = startVisibleColumn;
            this.spaceWidth = spaceWidth;
            this.stopRenderingLineAfter = stopRenderingLineAfter;
            this.renderWhitespace = (renderWhitespace === 'all'
                ? 4 /* RenderWhitespace.All */
                : renderWhitespace === 'boundary'
                    ? 1 /* RenderWhitespace.Boundary */
                    : renderWhitespace === 'selection'
                        ? 2 /* RenderWhitespace.Selection */
                        : renderWhitespace === 'trailing'
                            ? 3 /* RenderWhitespace.Trailing */
                            : 0 /* RenderWhitespace.None */);
            this.renderControlCharacters = renderControlCharacters;
            this.fontLigatures = fontLigatures;
            this.selectionsOnLine = selectionsOnLine && selectionsOnLine.sort((a, b) => a.startOffset < b.startOffset ? -1 : 1);
            const wsmiddotDiff = Math.abs(wsmiddotWidth - spaceWidth);
            const middotDiff = Math.abs(middotWidth - spaceWidth);
            if (wsmiddotDiff < middotDiff) {
                this.renderSpaceWidth = wsmiddotWidth;
                this.renderSpaceCharCode = 0x2E31; // U+2E31 - WORD SEPARATOR MIDDLE DOT
            }
            else {
                this.renderSpaceWidth = middotWidth;
                this.renderSpaceCharCode = 0xB7; // U+00B7 - MIDDLE DOT
            }
        }
        sameSelection(otherSelections) {
            if (this.selectionsOnLine === null) {
                return otherSelections === null;
            }
            if (otherSelections === null) {
                return false;
            }
            if (otherSelections.length !== this.selectionsOnLine.length) {
                return false;
            }
            for (let i = 0; i < this.selectionsOnLine.length; i++) {
                if (!this.selectionsOnLine[i].equals(otherSelections[i])) {
                    return false;
                }
            }
            return true;
        }
        equals(other) {
            return (this.useMonospaceOptimizations === other.useMonospaceOptimizations
                && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow
                && this.lineContent === other.lineContent
                && this.continuesWithWrappedLine === other.continuesWithWrappedLine
                && this.isBasicASCII === other.isBasicASCII
                && this.containsRTL === other.containsRTL
                && this.fauxIndentLength === other.fauxIndentLength
                && this.tabSize === other.tabSize
                && this.startVisibleColumn === other.startVisibleColumn
                && this.spaceWidth === other.spaceWidth
                && this.renderSpaceWidth === other.renderSpaceWidth
                && this.renderSpaceCharCode === other.renderSpaceCharCode
                && this.stopRenderingLineAfter === other.stopRenderingLineAfter
                && this.renderWhitespace === other.renderWhitespace
                && this.renderControlCharacters === other.renderControlCharacters
                && this.fontLigatures === other.fontLigatures
                && lineDecorations_1.LineDecoration.equalsArr(this.lineDecorations, other.lineDecorations)
                && this.lineTokens.equals(other.lineTokens)
                && this.sameSelection(other.selectionsOnLine));
        }
    }
    exports.RenderLineInput = RenderLineInput;
    var CharacterMappingConstants;
    (function (CharacterMappingConstants) {
        CharacterMappingConstants[CharacterMappingConstants["PART_INDEX_MASK"] = 4294901760] = "PART_INDEX_MASK";
        CharacterMappingConstants[CharacterMappingConstants["CHAR_INDEX_MASK"] = 65535] = "CHAR_INDEX_MASK";
        CharacterMappingConstants[CharacterMappingConstants["CHAR_INDEX_OFFSET"] = 0] = "CHAR_INDEX_OFFSET";
        CharacterMappingConstants[CharacterMappingConstants["PART_INDEX_OFFSET"] = 16] = "PART_INDEX_OFFSET";
    })(CharacterMappingConstants || (CharacterMappingConstants = {}));
    class DomPosition {
        constructor(partIndex, charIndex) {
            this.partIndex = partIndex;
            this.charIndex = charIndex;
        }
    }
    exports.DomPosition = DomPosition;
    /**
     * Provides a both direction mapping between a line's character and its rendered position.
     */
    class CharacterMapping {
        static getPartIndex(partData) {
            return (partData & 4294901760 /* CharacterMappingConstants.PART_INDEX_MASK */) >>> 16 /* CharacterMappingConstants.PART_INDEX_OFFSET */;
        }
        static getCharIndex(partData) {
            return (partData & 65535 /* CharacterMappingConstants.CHAR_INDEX_MASK */) >>> 0 /* CharacterMappingConstants.CHAR_INDEX_OFFSET */;
        }
        constructor(length, partCount) {
            this.length = length;
            this._data = new Uint32Array(this.length);
            this._horizontalOffset = new Uint32Array(this.length);
        }
        setColumnInfo(column, partIndex, charIndex, horizontalOffset) {
            const partData = ((partIndex << 16 /* CharacterMappingConstants.PART_INDEX_OFFSET */)
                | (charIndex << 0 /* CharacterMappingConstants.CHAR_INDEX_OFFSET */)) >>> 0;
            this._data[column - 1] = partData;
            this._horizontalOffset[column - 1] = horizontalOffset;
        }
        getHorizontalOffset(column) {
            if (this._horizontalOffset.length === 0) {
                // No characters on this line
                return 0;
            }
            return this._horizontalOffset[column - 1];
        }
        charOffsetToPartData(charOffset) {
            if (this.length === 0) {
                return 0;
            }
            if (charOffset < 0) {
                return this._data[0];
            }
            if (charOffset >= this.length) {
                return this._data[this.length - 1];
            }
            return this._data[charOffset];
        }
        getDomPosition(column) {
            const partData = this.charOffsetToPartData(column - 1);
            const partIndex = CharacterMapping.getPartIndex(partData);
            const charIndex = CharacterMapping.getCharIndex(partData);
            return new DomPosition(partIndex, charIndex);
        }
        getColumn(domPosition, partLength) {
            const charOffset = this.partDataToCharOffset(domPosition.partIndex, partLength, domPosition.charIndex);
            return charOffset + 1;
        }
        partDataToCharOffset(partIndex, partLength, charIndex) {
            if (this.length === 0) {
                return 0;
            }
            const searchEntry = ((partIndex << 16 /* CharacterMappingConstants.PART_INDEX_OFFSET */)
                | (charIndex << 0 /* CharacterMappingConstants.CHAR_INDEX_OFFSET */)) >>> 0;
            let min = 0;
            let max = this.length - 1;
            while (min + 1 < max) {
                const mid = ((min + max) >>> 1);
                const midEntry = this._data[mid];
                if (midEntry === searchEntry) {
                    return mid;
                }
                else if (midEntry > searchEntry) {
                    max = mid;
                }
                else {
                    min = mid;
                }
            }
            if (min === max) {
                return min;
            }
            const minEntry = this._data[min];
            const maxEntry = this._data[max];
            if (minEntry === searchEntry) {
                return min;
            }
            if (maxEntry === searchEntry) {
                return max;
            }
            const minPartIndex = CharacterMapping.getPartIndex(minEntry);
            const minCharIndex = CharacterMapping.getCharIndex(minEntry);
            const maxPartIndex = CharacterMapping.getPartIndex(maxEntry);
            let maxCharIndex;
            if (minPartIndex !== maxPartIndex) {
                // sitting between parts
                maxCharIndex = partLength;
            }
            else {
                maxCharIndex = CharacterMapping.getCharIndex(maxEntry);
            }
            const minEntryDistance = charIndex - minCharIndex;
            const maxEntryDistance = maxCharIndex - charIndex;
            if (minEntryDistance <= maxEntryDistance) {
                return min;
            }
            return max;
        }
        inflate() {
            const result = [];
            for (let i = 0; i < this.length; i++) {
                const partData = this._data[i];
                const partIndex = CharacterMapping.getPartIndex(partData);
                const charIndex = CharacterMapping.getCharIndex(partData);
                const visibleColumn = this._horizontalOffset[i];
                result.push([partIndex, charIndex, visibleColumn]);
            }
            return result;
        }
    }
    exports.CharacterMapping = CharacterMapping;
    var ForeignElementType;
    (function (ForeignElementType) {
        ForeignElementType[ForeignElementType["None"] = 0] = "None";
        ForeignElementType[ForeignElementType["Before"] = 1] = "Before";
        ForeignElementType[ForeignElementType["After"] = 2] = "After";
    })(ForeignElementType || (exports.ForeignElementType = ForeignElementType = {}));
    class RenderLineOutput {
        constructor(characterMapping, containsRTL, containsForeignElements) {
            this._renderLineOutputBrand = undefined;
            this.characterMapping = characterMapping;
            this.containsRTL = containsRTL;
            this.containsForeignElements = containsForeignElements;
        }
    }
    exports.RenderLineOutput = RenderLineOutput;
    function renderViewLine(input, sb) {
        if (input.lineContent.length === 0) {
            if (input.lineDecorations.length > 0) {
                // This line is empty, but it contains inline decorations
                sb.appendString(`<span>`);
                let beforeCount = 0;
                let afterCount = 0;
                let containsForeignElements = 0 /* ForeignElementType.None */;
                for (const lineDecoration of input.lineDecorations) {
                    if (lineDecoration.type === 1 /* InlineDecorationType.Before */ || lineDecoration.type === 2 /* InlineDecorationType.After */) {
                        sb.appendString(`<span class="`);
                        sb.appendString(lineDecoration.className);
                        sb.appendString(`"></span>`);
                        if (lineDecoration.type === 1 /* InlineDecorationType.Before */) {
                            containsForeignElements |= 1 /* ForeignElementType.Before */;
                            beforeCount++;
                        }
                        if (lineDecoration.type === 2 /* InlineDecorationType.After */) {
                            containsForeignElements |= 2 /* ForeignElementType.After */;
                            afterCount++;
                        }
                    }
                }
                sb.appendString(`</span>`);
                const characterMapping = new CharacterMapping(1, beforeCount + afterCount);
                characterMapping.setColumnInfo(1, beforeCount, 0, 0);
                return new RenderLineOutput(characterMapping, false, containsForeignElements);
            }
            // completely empty line
            sb.appendString('<span><span></span></span>');
            return new RenderLineOutput(new CharacterMapping(0, 0), false, 0 /* ForeignElementType.None */);
        }
        return _renderLine(resolveRenderLineInput(input), sb);
    }
    exports.renderViewLine = renderViewLine;
    class RenderLineOutput2 {
        constructor(characterMapping, html, containsRTL, containsForeignElements) {
            this.characterMapping = characterMapping;
            this.html = html;
            this.containsRTL = containsRTL;
            this.containsForeignElements = containsForeignElements;
        }
    }
    exports.RenderLineOutput2 = RenderLineOutput2;
    function renderViewLine2(input) {
        const sb = new stringBuilder_1.StringBuilder(10000);
        const out = renderViewLine(input, sb);
        return new RenderLineOutput2(out.characterMapping, sb.build(), out.containsRTL, out.containsForeignElements);
    }
    exports.renderViewLine2 = renderViewLine2;
    class ResolvedRenderLineInput {
        constructor(fontIsMonospace, canUseHalfwidthRightwardsArrow, lineContent, len, isOverflowing, overflowingCharCount, parts, containsForeignElements, fauxIndentLength, tabSize, startVisibleColumn, containsRTL, spaceWidth, renderSpaceCharCode, renderWhitespace, renderControlCharacters) {
            this.fontIsMonospace = fontIsMonospace;
            this.canUseHalfwidthRightwardsArrow = canUseHalfwidthRightwardsArrow;
            this.lineContent = lineContent;
            this.len = len;
            this.isOverflowing = isOverflowing;
            this.overflowingCharCount = overflowingCharCount;
            this.parts = parts;
            this.containsForeignElements = containsForeignElements;
            this.fauxIndentLength = fauxIndentLength;
            this.tabSize = tabSize;
            this.startVisibleColumn = startVisibleColumn;
            this.containsRTL = containsRTL;
            this.spaceWidth = spaceWidth;
            this.renderSpaceCharCode = renderSpaceCharCode;
            this.renderWhitespace = renderWhitespace;
            this.renderControlCharacters = renderControlCharacters;
            //
        }
    }
    function resolveRenderLineInput(input) {
        const lineContent = input.lineContent;
        let isOverflowing;
        let overflowingCharCount;
        let len;
        if (input.stopRenderingLineAfter !== -1 && input.stopRenderingLineAfter < lineContent.length) {
            isOverflowing = true;
            overflowingCharCount = lineContent.length - input.stopRenderingLineAfter;
            len = input.stopRenderingLineAfter;
        }
        else {
            isOverflowing = false;
            overflowingCharCount = 0;
            len = lineContent.length;
        }
        let tokens = transformAndRemoveOverflowing(lineContent, input.containsRTL, input.lineTokens, input.fauxIndentLength, len);
        if (input.renderControlCharacters && !input.isBasicASCII) {
            // Calling `extractControlCharacters` before adding (possibly empty) line parts
            // for inline decorations. `extractControlCharacters` removes empty line parts.
            tokens = extractControlCharacters(lineContent, tokens);
        }
        if (input.renderWhitespace === 4 /* RenderWhitespace.All */ ||
            input.renderWhitespace === 1 /* RenderWhitespace.Boundary */ ||
            (input.renderWhitespace === 2 /* RenderWhitespace.Selection */ && !!input.selectionsOnLine) ||
            (input.renderWhitespace === 3 /* RenderWhitespace.Trailing */ && !input.continuesWithWrappedLine)) {
            tokens = _applyRenderWhitespace(input, lineContent, len, tokens);
        }
        let containsForeignElements = 0 /* ForeignElementType.None */;
        if (input.lineDecorations.length > 0) {
            for (let i = 0, len = input.lineDecorations.length; i < len; i++) {
                const lineDecoration = input.lineDecorations[i];
                if (lineDecoration.type === 3 /* InlineDecorationType.RegularAffectingLetterSpacing */) {
                    // Pretend there are foreign elements... although not 100% accurate.
                    containsForeignElements |= 1 /* ForeignElementType.Before */;
                }
                else if (lineDecoration.type === 1 /* InlineDecorationType.Before */) {
                    containsForeignElements |= 1 /* ForeignElementType.Before */;
                }
                else if (lineDecoration.type === 2 /* InlineDecorationType.After */) {
                    containsForeignElements |= 2 /* ForeignElementType.After */;
                }
            }
            tokens = _applyInlineDecorations(lineContent, len, tokens, input.lineDecorations);
        }
        if (!input.containsRTL) {
            // We can never split RTL text, as it ruins the rendering
            tokens = splitLargeTokens(lineContent, tokens, !input.isBasicASCII || input.fontLigatures);
        }
        return new ResolvedRenderLineInput(input.useMonospaceOptimizations, input.canUseHalfwidthRightwardsArrow, lineContent, len, isOverflowing, overflowingCharCount, tokens, containsForeignElements, input.fauxIndentLength, input.tabSize, input.startVisibleColumn, input.containsRTL, input.spaceWidth, input.renderSpaceCharCode, input.renderWhitespace, input.renderControlCharacters);
    }
    /**
     * In the rendering phase, characters are always looped until token.endIndex.
     * Ensure that all tokens end before `len` and the last one ends precisely at `len`.
     */
    function transformAndRemoveOverflowing(lineContent, lineContainsRTL, tokens, fauxIndentLength, len) {
        const result = [];
        let resultLen = 0;
        // The faux indent part of the line should have no token type
        if (fauxIndentLength > 0) {
            result[resultLen++] = new linePart_1.LinePart(fauxIndentLength, '', 0, false);
        }
        let startOffset = fauxIndentLength;
        for (let tokenIndex = 0, tokensLen = tokens.getCount(); tokenIndex < tokensLen; tokenIndex++) {
            const endIndex = tokens.getEndOffset(tokenIndex);
            if (endIndex <= fauxIndentLength) {
                // The faux indent part of the line should have no token type
                continue;
            }
            const type = tokens.getClassName(tokenIndex);
            if (endIndex >= len) {
                const tokenContainsRTL = (lineContainsRTL ? strings.containsRTL(lineContent.substring(startOffset, len)) : false);
                result[resultLen++] = new linePart_1.LinePart(len, type, 0, tokenContainsRTL);
                break;
            }
            const tokenContainsRTL = (lineContainsRTL ? strings.containsRTL(lineContent.substring(startOffset, endIndex)) : false);
            result[resultLen++] = new linePart_1.LinePart(endIndex, type, 0, tokenContainsRTL);
            startOffset = endIndex;
        }
        return result;
    }
    /**
     * written as a const enum to get value inlining.
     */
    var Constants;
    (function (Constants) {
        Constants[Constants["LongToken"] = 50] = "LongToken";
    })(Constants || (Constants = {}));
    /**
     * See https://github.com/microsoft/vscode/issues/6885.
     * It appears that having very large spans causes very slow reading of character positions.
     * So here we try to avoid that.
     */
    function splitLargeTokens(lineContent, tokens, onlyAtSpaces) {
        let lastTokenEndIndex = 0;
        const result = [];
        let resultLen = 0;
        if (onlyAtSpaces) {
            // Split only at spaces => we need to walk each character
            for (let i = 0, len = tokens.length; i < len; i++) {
                const token = tokens[i];
                const tokenEndIndex = token.endIndex;
                if (lastTokenEndIndex + 50 /* Constants.LongToken */ < tokenEndIndex) {
                    const tokenType = token.type;
                    const tokenMetadata = token.metadata;
                    const tokenContainsRTL = token.containsRTL;
                    let lastSpaceOffset = -1;
                    let currTokenStart = lastTokenEndIndex;
                    for (let j = lastTokenEndIndex; j < tokenEndIndex; j++) {
                        if (lineContent.charCodeAt(j) === 32 /* CharCode.Space */) {
                            lastSpaceOffset = j;
                        }
                        if (lastSpaceOffset !== -1 && j - currTokenStart >= 50 /* Constants.LongToken */) {
                            // Split at `lastSpaceOffset` + 1
                            result[resultLen++] = new linePart_1.LinePart(lastSpaceOffset + 1, tokenType, tokenMetadata, tokenContainsRTL);
                            currTokenStart = lastSpaceOffset + 1;
                            lastSpaceOffset = -1;
                        }
                    }
                    if (currTokenStart !== tokenEndIndex) {
                        result[resultLen++] = new linePart_1.LinePart(tokenEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
                    }
                }
                else {
                    result[resultLen++] = token;
                }
                lastTokenEndIndex = tokenEndIndex;
            }
        }
        else {
            // Split anywhere => we don't need to walk each character
            for (let i = 0, len = tokens.length; i < len; i++) {
                const token = tokens[i];
                const tokenEndIndex = token.endIndex;
                const diff = (tokenEndIndex - lastTokenEndIndex);
                if (diff > 50 /* Constants.LongToken */) {
                    const tokenType = token.type;
                    const tokenMetadata = token.metadata;
                    const tokenContainsRTL = token.containsRTL;
                    const piecesCount = Math.ceil(diff / 50 /* Constants.LongToken */);
                    for (let j = 1; j < piecesCount; j++) {
                        const pieceEndIndex = lastTokenEndIndex + (j * 50 /* Constants.LongToken */);
                        result[resultLen++] = new linePart_1.LinePart(pieceEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
                    }
                    result[resultLen++] = new linePart_1.LinePart(tokenEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
                }
                else {
                    result[resultLen++] = token;
                }
                lastTokenEndIndex = tokenEndIndex;
            }
        }
        return result;
    }
    function isControlCharacter(charCode) {
        if (charCode < 32) {
            return (charCode !== 9 /* CharCode.Tab */);
        }
        if (charCode === 127) {
            // DEL
            return true;
        }
        if ((charCode >= 0x202A && charCode <= 0x202E)
            || (charCode >= 0x2066 && charCode <= 0x2069)
            || (charCode >= 0x200E && charCode <= 0x200F)
            || charCode === 0x061C) {
            // Unicode Directional Formatting Characters
            // LRE	U+202A	LEFT-TO-RIGHT EMBEDDING
            // RLE	U+202B	RIGHT-TO-LEFT EMBEDDING
            // PDF	U+202C	POP DIRECTIONAL FORMATTING
            // LRO	U+202D	LEFT-TO-RIGHT OVERRIDE
            // RLO	U+202E	RIGHT-TO-LEFT OVERRIDE
            // LRI	U+2066	LEFT-TO-RIGHT ISOLATE
            // RLI	U+2067	RIGHT-TO-LEFT ISOLATE
            // FSI	U+2068	FIRST STRONG ISOLATE
            // PDI	U+2069	POP DIRECTIONAL ISOLATE
            // LRM	U+200E	LEFT-TO-RIGHT MARK
            // RLM	U+200F	RIGHT-TO-LEFT MARK
            // ALM	U+061C	ARABIC LETTER MARK
            return true;
        }
        return false;
    }
    function extractControlCharacters(lineContent, tokens) {
        const result = [];
        let lastLinePart = new linePart_1.LinePart(0, '', 0, false);
        let charOffset = 0;
        for (const token of tokens) {
            const tokenEndIndex = token.endIndex;
            for (; charOffset < tokenEndIndex; charOffset++) {
                const charCode = lineContent.charCodeAt(charOffset);
                if (isControlCharacter(charCode)) {
                    if (charOffset > lastLinePart.endIndex) {
                        // emit previous part if it has text
                        lastLinePart = new linePart_1.LinePart(charOffset, token.type, token.metadata, token.containsRTL);
                        result.push(lastLinePart);
                    }
                    lastLinePart = new linePart_1.LinePart(charOffset + 1, 'mtkcontrol', token.metadata, false);
                    result.push(lastLinePart);
                }
            }
            if (charOffset > lastLinePart.endIndex) {
                // emit previous part if it has text
                lastLinePart = new linePart_1.LinePart(tokenEndIndex, token.type, token.metadata, token.containsRTL);
                result.push(lastLinePart);
            }
        }
        return result;
    }
    /**
     * Whitespace is rendered by "replacing" tokens with a special-purpose `mtkw` type that is later recognized in the rendering phase.
     * Moreover, a token is created for every visual indent because on some fonts the glyphs used for rendering whitespace (&rarr; or &middot;) do not have the same width as &nbsp;.
     * The rendering phase will generate `style="width:..."` for these tokens.
     */
    function _applyRenderWhitespace(input, lineContent, len, tokens) {
        const continuesWithWrappedLine = input.continuesWithWrappedLine;
        const fauxIndentLength = input.fauxIndentLength;
        const tabSize = input.tabSize;
        const startVisibleColumn = input.startVisibleColumn;
        const useMonospaceOptimizations = input.useMonospaceOptimizations;
        const selections = input.selectionsOnLine;
        const onlyBoundary = (input.renderWhitespace === 1 /* RenderWhitespace.Boundary */);
        const onlyTrailing = (input.renderWhitespace === 3 /* RenderWhitespace.Trailing */);
        const generateLinePartForEachWhitespace = (input.renderSpaceWidth !== input.spaceWidth);
        const result = [];
        let resultLen = 0;
        let tokenIndex = 0;
        let tokenType = tokens[tokenIndex].type;
        let tokenContainsRTL = tokens[tokenIndex].containsRTL;
        let tokenEndIndex = tokens[tokenIndex].endIndex;
        const tokensLength = tokens.length;
        let lineIsEmptyOrWhitespace = false;
        let firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
        let lastNonWhitespaceIndex;
        if (firstNonWhitespaceIndex === -1) {
            lineIsEmptyOrWhitespace = true;
            firstNonWhitespaceIndex = len;
            lastNonWhitespaceIndex = len;
        }
        else {
            lastNonWhitespaceIndex = strings.lastNonWhitespaceIndex(lineContent);
        }
        let wasInWhitespace = false;
        let currentSelectionIndex = 0;
        let currentSelection = selections && selections[currentSelectionIndex];
        let tmpIndent = startVisibleColumn % tabSize;
        for (let charIndex = fauxIndentLength; charIndex < len; charIndex++) {
            const chCode = lineContent.charCodeAt(charIndex);
            if (currentSelection && charIndex >= currentSelection.endOffset) {
                currentSelectionIndex++;
                currentSelection = selections && selections[currentSelectionIndex];
            }
            let isInWhitespace;
            if (charIndex < firstNonWhitespaceIndex || charIndex > lastNonWhitespaceIndex) {
                // in leading or trailing whitespace
                isInWhitespace = true;
            }
            else if (chCode === 9 /* CharCode.Tab */) {
                // a tab character is rendered both in all and boundary cases
                isInWhitespace = true;
            }
            else if (chCode === 32 /* CharCode.Space */) {
                // hit a space character
                if (onlyBoundary) {
                    // rendering only boundary whitespace
                    if (wasInWhitespace) {
                        isInWhitespace = true;
                    }
                    else {
                        const nextChCode = (charIndex + 1 < len ? lineContent.charCodeAt(charIndex + 1) : 0 /* CharCode.Null */);
                        isInWhitespace = (nextChCode === 32 /* CharCode.Space */ || nextChCode === 9 /* CharCode.Tab */);
                    }
                }
                else {
                    isInWhitespace = true;
                }
            }
            else {
                isInWhitespace = false;
            }
            // If rendering whitespace on selection, check that the charIndex falls within a selection
            if (isInWhitespace && selections) {
                isInWhitespace = !!currentSelection && currentSelection.startOffset <= charIndex && currentSelection.endOffset > charIndex;
            }
            // If rendering only trailing whitespace, check that the charIndex points to trailing whitespace.
            if (isInWhitespace && onlyTrailing) {
                isInWhitespace = lineIsEmptyOrWhitespace || charIndex > lastNonWhitespaceIndex;
            }
            if (isInWhitespace && tokenContainsRTL) {
                // If the token contains RTL text, breaking it up into multiple line parts
                // to render whitespace might affect the browser's bidi layout.
                //
                // We render whitespace in such tokens only if the whitespace
                // is the leading or the trailing whitespace of the line,
                // which doesn't affect the browser's bidi layout.
                if (charIndex >= firstNonWhitespaceIndex && charIndex <= lastNonWhitespaceIndex) {
                    isInWhitespace = false;
                }
            }
            if (wasInWhitespace) {
                // was in whitespace token
                if (!isInWhitespace || (!useMonospaceOptimizations && tmpIndent >= tabSize)) {
                    // leaving whitespace token or entering a new indent
                    if (generateLinePartForEachWhitespace) {
                        const lastEndIndex = (resultLen > 0 ? result[resultLen - 1].endIndex : fauxIndentLength);
                        for (let i = lastEndIndex + 1; i <= charIndex; i++) {
                            result[resultLen++] = new linePart_1.LinePart(i, 'mtkw', 1 /* LinePartMetadata.IS_WHITESPACE */, false);
                        }
                    }
                    else {
                        result[resultLen++] = new linePart_1.LinePart(charIndex, 'mtkw', 1 /* LinePartMetadata.IS_WHITESPACE */, false);
                    }
                    tmpIndent = tmpIndent % tabSize;
                }
            }
            else {
                // was in regular token
                if (charIndex === tokenEndIndex || (isInWhitespace && charIndex > fauxIndentLength)) {
                    result[resultLen++] = new linePart_1.LinePart(charIndex, tokenType, 0, tokenContainsRTL);
                    tmpIndent = tmpIndent % tabSize;
                }
            }
            if (chCode === 9 /* CharCode.Tab */) {
                tmpIndent = tabSize;
            }
            else if (strings.isFullWidthCharacter(chCode)) {
                tmpIndent += 2;
            }
            else {
                tmpIndent++;
            }
            wasInWhitespace = isInWhitespace;
            while (charIndex === tokenEndIndex) {
                tokenIndex++;
                if (tokenIndex < tokensLength) {
                    tokenType = tokens[tokenIndex].type;
                    tokenContainsRTL = tokens[tokenIndex].containsRTL;
                    tokenEndIndex = tokens[tokenIndex].endIndex;
                }
                else {
                    break;
                }
            }
        }
        let generateWhitespace = false;
        if (wasInWhitespace) {
            // was in whitespace token
            if (continuesWithWrappedLine && onlyBoundary) {
                const lastCharCode = (len > 0 ? lineContent.charCodeAt(len - 1) : 0 /* CharCode.Null */);
                const prevCharCode = (len > 1 ? lineContent.charCodeAt(len - 2) : 0 /* CharCode.Null */);
                const isSingleTrailingSpace = (lastCharCode === 32 /* CharCode.Space */ && (prevCharCode !== 32 /* CharCode.Space */ && prevCharCode !== 9 /* CharCode.Tab */));
                if (!isSingleTrailingSpace) {
                    generateWhitespace = true;
                }
            }
            else {
                generateWhitespace = true;
            }
        }
        if (generateWhitespace) {
            if (generateLinePartForEachWhitespace) {
                const lastEndIndex = (resultLen > 0 ? result[resultLen - 1].endIndex : fauxIndentLength);
                for (let i = lastEndIndex + 1; i <= len; i++) {
                    result[resultLen++] = new linePart_1.LinePart(i, 'mtkw', 1 /* LinePartMetadata.IS_WHITESPACE */, false);
                }
            }
            else {
                result[resultLen++] = new linePart_1.LinePart(len, 'mtkw', 1 /* LinePartMetadata.IS_WHITESPACE */, false);
            }
        }
        else {
            result[resultLen++] = new linePart_1.LinePart(len, tokenType, 0, tokenContainsRTL);
        }
        return result;
    }
    /**
     * Inline decorations are "merged" on top of tokens.
     * Special care must be taken when multiple inline decorations are at play and they overlap.
     */
    function _applyInlineDecorations(lineContent, len, tokens, _lineDecorations) {
        _lineDecorations.sort(lineDecorations_1.LineDecoration.compare);
        const lineDecorations = lineDecorations_1.LineDecorationsNormalizer.normalize(lineContent, _lineDecorations);
        const lineDecorationsLen = lineDecorations.length;
        let lineDecorationIndex = 0;
        const result = [];
        let resultLen = 0;
        let lastResultEndIndex = 0;
        for (let tokenIndex = 0, len = tokens.length; tokenIndex < len; tokenIndex++) {
            const token = tokens[tokenIndex];
            const tokenEndIndex = token.endIndex;
            const tokenType = token.type;
            const tokenMetadata = token.metadata;
            const tokenContainsRTL = token.containsRTL;
            while (lineDecorationIndex < lineDecorationsLen && lineDecorations[lineDecorationIndex].startOffset < tokenEndIndex) {
                const lineDecoration = lineDecorations[lineDecorationIndex];
                if (lineDecoration.startOffset > lastResultEndIndex) {
                    lastResultEndIndex = lineDecoration.startOffset;
                    result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
                }
                if (lineDecoration.endOffset + 1 <= tokenEndIndex) {
                    // This line decoration ends before this token ends
                    lastResultEndIndex = lineDecoration.endOffset + 1;
                    result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, tokenType + ' ' + lineDecoration.className, tokenMetadata | lineDecoration.metadata, tokenContainsRTL);
                    lineDecorationIndex++;
                }
                else {
                    // This line decoration continues on to the next token
                    lastResultEndIndex = tokenEndIndex;
                    result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, tokenType + ' ' + lineDecoration.className, tokenMetadata | lineDecoration.metadata, tokenContainsRTL);
                    break;
                }
            }
            if (tokenEndIndex > lastResultEndIndex) {
                lastResultEndIndex = tokenEndIndex;
                result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
            }
        }
        const lastTokenEndIndex = tokens[tokens.length - 1].endIndex;
        if (lineDecorationIndex < lineDecorationsLen && lineDecorations[lineDecorationIndex].startOffset === lastTokenEndIndex) {
            while (lineDecorationIndex < lineDecorationsLen && lineDecorations[lineDecorationIndex].startOffset === lastTokenEndIndex) {
                const lineDecoration = lineDecorations[lineDecorationIndex];
                result[resultLen++] = new linePart_1.LinePart(lastResultEndIndex, lineDecoration.className, lineDecoration.metadata, false);
                lineDecorationIndex++;
            }
        }
        return result;
    }
    /**
     * This function is on purpose not split up into multiple functions to allow runtime type inference (i.e. performance reasons).
     * Notice how all the needed data is fully resolved and passed in (i.e. no other calls).
     */
    function _renderLine(input, sb) {
        const fontIsMonospace = input.fontIsMonospace;
        const canUseHalfwidthRightwardsArrow = input.canUseHalfwidthRightwardsArrow;
        const containsForeignElements = input.containsForeignElements;
        const lineContent = input.lineContent;
        const len = input.len;
        const isOverflowing = input.isOverflowing;
        const overflowingCharCount = input.overflowingCharCount;
        const parts = input.parts;
        const fauxIndentLength = input.fauxIndentLength;
        const tabSize = input.tabSize;
        const startVisibleColumn = input.startVisibleColumn;
        const containsRTL = input.containsRTL;
        const spaceWidth = input.spaceWidth;
        const renderSpaceCharCode = input.renderSpaceCharCode;
        const renderWhitespace = input.renderWhitespace;
        const renderControlCharacters = input.renderControlCharacters;
        const characterMapping = new CharacterMapping(len + 1, parts.length);
        let lastCharacterMappingDefined = false;
        let charIndex = 0;
        let visibleColumn = startVisibleColumn;
        let charOffsetInPart = 0; // the character offset in the current part
        let charHorizontalOffset = 0; // the character horizontal position in terms of chars relative to line start
        let partDisplacement = 0;
        if (containsRTL) {
            sb.appendString('<span dir="ltr">');
        }
        else {
            sb.appendString('<span>');
        }
        for (let partIndex = 0, tokensLen = parts.length; partIndex < tokensLen; partIndex++) {
            const part = parts[partIndex];
            const partEndIndex = part.endIndex;
            const partType = part.type;
            const partContainsRTL = part.containsRTL;
            const partRendersWhitespace = (renderWhitespace !== 0 /* RenderWhitespace.None */ && part.isWhitespace());
            const partRendersWhitespaceWithWidth = partRendersWhitespace && !fontIsMonospace && (partType === 'mtkw' /*only whitespace*/ || !containsForeignElements);
            const partIsEmptyAndHasPseudoAfter = (charIndex === partEndIndex && part.isPseudoAfter());
            charOffsetInPart = 0;
            sb.appendString('<span ');
            if (partContainsRTL) {
                sb.appendString('style="unicode-bidi:isolate" ');
            }
            sb.appendString('class="');
            sb.appendString(partRendersWhitespaceWithWidth ? 'mtkz' : partType);
            sb.appendASCIICharCode(34 /* CharCode.DoubleQuote */);
            if (partRendersWhitespace) {
                let partWidth = 0;
                {
                    let _charIndex = charIndex;
                    let _visibleColumn = visibleColumn;
                    for (; _charIndex < partEndIndex; _charIndex++) {
                        const charCode = lineContent.charCodeAt(_charIndex);
                        const charWidth = (charCode === 9 /* CharCode.Tab */ ? (tabSize - (_visibleColumn % tabSize)) : 1) | 0;
                        partWidth += charWidth;
                        if (_charIndex >= fauxIndentLength) {
                            _visibleColumn += charWidth;
                        }
                    }
                }
                if (partRendersWhitespaceWithWidth) {
                    sb.appendString(' style="width:');
                    sb.appendString(String(spaceWidth * partWidth));
                    sb.appendString('px"');
                }
                sb.appendASCIICharCode(62 /* CharCode.GreaterThan */);
                for (; charIndex < partEndIndex; charIndex++) {
                    characterMapping.setColumnInfo(charIndex + 1, partIndex - partDisplacement, charOffsetInPart, charHorizontalOffset);
                    partDisplacement = 0;
                    const charCode = lineContent.charCodeAt(charIndex);
                    let producedCharacters;
                    let charWidth;
                    if (charCode === 9 /* CharCode.Tab */) {
                        producedCharacters = (tabSize - (visibleColumn % tabSize)) | 0;
                        charWidth = producedCharacters;
                        if (!canUseHalfwidthRightwardsArrow || charWidth > 1) {
                            sb.appendCharCode(0x2192); // RIGHTWARDS ARROW
                        }
                        else {
                            sb.appendCharCode(0xFFEB); // HALFWIDTH RIGHTWARDS ARROW
                        }
                        for (let space = 2; space <= charWidth; space++) {
                            sb.appendCharCode(0xA0); // &nbsp;
                        }
                    }
                    else { // must be CharCode.Space
                        producedCharacters = 2;
                        charWidth = 1;
                        sb.appendCharCode(renderSpaceCharCode); // &middot; or word separator middle dot
                        sb.appendCharCode(0x200C); // ZERO WIDTH NON-JOINER
                    }
                    charOffsetInPart += producedCharacters;
                    charHorizontalOffset += charWidth;
                    if (charIndex >= fauxIndentLength) {
                        visibleColumn += charWidth;
                    }
                }
            }
            else {
                sb.appendASCIICharCode(62 /* CharCode.GreaterThan */);
                for (; charIndex < partEndIndex; charIndex++) {
                    characterMapping.setColumnInfo(charIndex + 1, partIndex - partDisplacement, charOffsetInPart, charHorizontalOffset);
                    partDisplacement = 0;
                    const charCode = lineContent.charCodeAt(charIndex);
                    let producedCharacters = 1;
                    let charWidth = 1;
                    switch (charCode) {
                        case 9 /* CharCode.Tab */:
                            producedCharacters = (tabSize - (visibleColumn % tabSize));
                            charWidth = producedCharacters;
                            for (let space = 1; space <= producedCharacters; space++) {
                                sb.appendCharCode(0xA0); // &nbsp;
                            }
                            break;
                        case 32 /* CharCode.Space */:
                            sb.appendCharCode(0xA0); // &nbsp;
                            break;
                        case 60 /* CharCode.LessThan */:
                            sb.appendString('&lt;');
                            break;
                        case 62 /* CharCode.GreaterThan */:
                            sb.appendString('&gt;');
                            break;
                        case 38 /* CharCode.Ampersand */:
                            sb.appendString('&amp;');
                            break;
                        case 0 /* CharCode.Null */:
                            if (renderControlCharacters) {
                                // See https://unicode-table.com/en/blocks/control-pictures/
                                sb.appendCharCode(9216);
                            }
                            else {
                                sb.appendString('&#00;');
                            }
                            break;
                        case 65279 /* CharCode.UTF8_BOM */:
                        case 8232 /* CharCode.LINE_SEPARATOR */:
                        case 8233 /* CharCode.PARAGRAPH_SEPARATOR */:
                        case 133 /* CharCode.NEXT_LINE */:
                            sb.appendCharCode(0xFFFD);
                            break;
                        default:
                            if (strings.isFullWidthCharacter(charCode)) {
                                charWidth++;
                            }
                            // See https://unicode-table.com/en/blocks/control-pictures/
                            if (renderControlCharacters && charCode < 32) {
                                sb.appendCharCode(9216 + charCode);
                            }
                            else if (renderControlCharacters && charCode === 127) {
                                // DEL
                                sb.appendCharCode(9249);
                            }
                            else if (renderControlCharacters && isControlCharacter(charCode)) {
                                sb.appendString('[U+');
                                sb.appendString(to4CharHex(charCode));
                                sb.appendString(']');
                                producedCharacters = 8;
                                charWidth = producedCharacters;
                            }
                            else {
                                sb.appendCharCode(charCode);
                            }
                    }
                    charOffsetInPart += producedCharacters;
                    charHorizontalOffset += charWidth;
                    if (charIndex >= fauxIndentLength) {
                        visibleColumn += charWidth;
                    }
                }
            }
            if (partIsEmptyAndHasPseudoAfter) {
                partDisplacement++;
            }
            else {
                partDisplacement = 0;
            }
            if (charIndex >= len && !lastCharacterMappingDefined && part.isPseudoAfter()) {
                lastCharacterMappingDefined = true;
                characterMapping.setColumnInfo(charIndex + 1, partIndex, charOffsetInPart, charHorizontalOffset);
            }
            sb.appendString('</span>');
        }
        if (!lastCharacterMappingDefined) {
            // When getting client rects for the last character, we will position the
            // text range at the end of the span, insteaf of at the beginning of next span
            characterMapping.setColumnInfo(len + 1, parts.length - 1, charOffsetInPart, charHorizontalOffset);
        }
        if (isOverflowing) {
            sb.appendString('<span class="mtkoverflow">');
            sb.appendString(nls.localize('showMore', "Show more ({0})", renderOverflowingCharCount(overflowingCharCount)));
            sb.appendString('</span>');
        }
        sb.appendString('</span>');
        return new RenderLineOutput(characterMapping, containsRTL, containsForeignElements);
    }
    function to4CharHex(n) {
        return n.toString(16).toUpperCase().padStart(4, '0');
    }
    function renderOverflowingCharCount(n) {
        if (n < 1024) {
            return nls.localize('overflow.chars', "{0} chars", n);
        }
        if (n < 1024 * 1024) {
            return `${(n / 1024).toFixed(1)} KB`;
        }
        return `${(n / 1024 / 1024).toFixed(1)} MB`;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0xpbmVSZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi92aWV3TGF5b3V0L3ZpZXdMaW5lUmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLElBQWtCLGdCQU1qQjtJQU5ELFdBQWtCLGdCQUFnQjtRQUNqQyx1REFBUSxDQUFBO1FBQ1IsK0RBQVksQ0FBQTtRQUNaLGlFQUFhLENBQUE7UUFDYiwrREFBWSxDQUFBO1FBQ1oscURBQU8sQ0FBQTtJQUNSLENBQUMsRUFOaUIsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFNakM7SUFFRCxNQUFhLFNBQVM7UUFXckIsWUFBWSxVQUFrQixFQUFFLFFBQWdCO1lBQy9DLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzNCLENBQUM7UUFFTSxNQUFNLENBQUMsY0FBeUI7WUFDdEMsT0FBTyxJQUFJLENBQUMsV0FBVyxLQUFLLGNBQWMsQ0FBQyxXQUFXO21CQUNsRCxJQUFJLENBQUMsU0FBUyxLQUFLLGNBQWMsQ0FBQyxTQUFTLENBQUM7UUFDakQsQ0FBQztLQUNEO0lBcEJELDhCQW9CQztJQUVELE1BQWEsZUFBZTtRQTJCM0IsWUFDQyx5QkFBa0MsRUFDbEMsOEJBQXVDLEVBQ3ZDLFdBQW1CLEVBQ25CLHdCQUFpQyxFQUNqQyxZQUFxQixFQUNyQixXQUFvQixFQUNwQixnQkFBd0IsRUFDeEIsVUFBMkIsRUFDM0IsZUFBaUMsRUFDakMsT0FBZSxFQUNmLGtCQUEwQixFQUMxQixVQUFrQixFQUNsQixXQUFtQixFQUNuQixhQUFxQixFQUNyQixzQkFBOEIsRUFDOUIsZ0JBQXdFLEVBQ3hFLHVCQUFnQyxFQUNoQyxhQUFzQixFQUN0QixnQkFBb0M7WUFFcEMsSUFBSSxD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
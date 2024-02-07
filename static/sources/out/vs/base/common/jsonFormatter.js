/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./json"], function (require, exports, json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isEOL = exports.getEOL = exports.toFormattedString = exports.format = void 0;
    function format(documentText, range, options) {
        let initialIndentLevel;
        let formatText;
        let formatTextStart;
        let rangeStart;
        let rangeEnd;
        if (range) {
            rangeStart = range.offset;
            rangeEnd = rangeStart + range.length;
            formatTextStart = rangeStart;
            while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
                formatTextStart--;
            }
            let endOffset = rangeEnd;
            while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
                endOffset++;
            }
            formatText = documentText.substring(formatTextStart, endOffset);
            initialIndentLevel = computeIndentLevel(formatText, options);
        }
        else {
            formatText = documentText;
            initialIndentLevel = 0;
            formatTextStart = 0;
            rangeStart = 0;
            rangeEnd = documentText.length;
        }
        const eol = getEOL(options, documentText);
        let lineBreak = false;
        let indentLevel = 0;
        let indentValue;
        if (options.insertSpaces) {
            indentValue = repeat(' ', options.tabSize || 4);
        }
        else {
            indentValue = '\t';
        }
        const scanner = (0, json_1.createScanner)(formatText, false);
        let hasError = false;
        function newLineAndIndent() {
            return eol + repeat(indentValue, initialIndentLevel + indentLevel);
        }
        function scanNext() {
            let token = scanner.scan();
            lineBreak = false;
            while (token === 15 /* SyntaxKind.Trivia */ || token === 14 /* SyntaxKind.LineBreakTrivia */) {
                lineBreak = lineBreak || (token === 14 /* SyntaxKind.LineBreakTrivia */);
                token = scanner.scan();
            }
            hasError = token === 16 /* SyntaxKind.Unknown */ || scanner.getTokenError() !== 0 /* ScanError.None */;
            return token;
        }
        const editOperations = [];
        function addEdit(text, startOffset, endOffset) {
            if (!hasError && startOffset < rangeEnd && endOffset > rangeStart && documentText.substring(startOffset, endOffset) !== text) {
                editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
            }
        }
        let firstToken = scanNext();
        if (firstToken !== 17 /* SyntaxKind.EOF */) {
            const firstTokenStart = scanner.getTokenOffset() + formatTextStart;
            const initialIndent = repeat(indentValue, initialIndentLevel);
            addEdit(initialIndent, formatTextStart, firstTokenStart);
        }
        while (firstToken !== 17 /* SyntaxKind.EOF */) {
            let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
            let secondToken = scanNext();
            let replaceContent = '';
            while (!lineBreak && (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */)) {
                // comments on the same line: keep them on the same line, but ignore them otherwise
                const commentTokenStart = scanner.getTokenOffset() + formatTextStart;
                addEdit(' ', firstTokenEnd, commentTokenStart);
                firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
                replaceContent = secondToken === 12 /* SyntaxKind.LineCommentTrivia */ ? newLineAndIndent() : '';
                secondToken = scanNext();
            }
            if (secondToken === 2 /* SyntaxKind.CloseBraceToken */) {
                if (firstToken !== 1 /* SyntaxKind.OpenBraceToken */) {
                    indentLevel--;
                    replaceContent = newLineAndIndent();
                }
            }
            else if (secondToken === 4 /* SyntaxKind.CloseBracketToken */) {
                if (firstToken !== 3 /* SyntaxKind.OpenBracketToken */) {
                    indentLevel--;
                    replaceContent = newLineAndIndent();
                }
            }
            else {
                switch (firstToken) {
                    case 3 /* SyntaxKind.OpenBracketToken */:
                    case 1 /* SyntaxKind.OpenBraceToken */:
                        indentLevel++;
                        replaceContent = newLineAndIndent();
                        break;
                    case 5 /* SyntaxKind.CommaToken */:
                    case 12 /* SyntaxKind.LineCommentTrivia */:
                        replaceContent = newLineAndIndent();
                        break;
                    case 13 /* SyntaxKind.BlockCommentTrivia */:
                        if (lineBreak) {
                            replaceContent = newLineAndIndent();
                        }
                        else {
                            // symbol following comment on the same line: keep on same line, separate with ' '
                            replaceContent = ' ';
                        }
                        break;
                    case 6 /* SyntaxKind.ColonToken */:
                        replaceContent = ' ';
                        break;
                    case 10 /* SyntaxKind.StringLiteral */:
                        if (secondToken === 6 /* SyntaxKind.ColonToken */) {
                            replaceContent = '';
                            break;
                        }
                    // fall through
                    case 7 /* SyntaxKind.NullKeyword */:
                    case 8 /* SyntaxKind.TrueKeyword */:
                    case 9 /* SyntaxKind.FalseKeyword */:
                    case 11 /* SyntaxKind.NumericLiteral */:
                    case 2 /* SyntaxKind.CloseBraceToken */:
                    case 4 /* SyntaxKind.CloseBracketToken */:
                        if (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */) {
                            replaceContent = ' ';
                        }
                        else if (secondToken !== 5 /* SyntaxKind.CommaToken */ && secondToken !== 17 /* SyntaxKind.EOF */) {
                            hasError = true;
                        }
                        break;
                    case 16 /* SyntaxKind.Unknown */:
                        hasError = true;
                        break;
                }
                if (lineBreak && (secondToken === 12 /* SyntaxKind.LineCommentTrivia */ || secondToken === 13 /* SyntaxKind.BlockCommentTrivia */)) {
                    replaceContent = newLineAndIndent();
                }
            }
            const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
            addEdit(replaceContent, firstTokenEnd, secondTokenStart);
            firstToken = secondToken;
        }
        return editOperations;
    }
    exports.format = format;
    /**
     * Creates a formatted string out of the object passed as argument, using the given formatting options
     * @param any The object to stringify and format
     * @param options The formatting options to use
     */
    function toFormattedString(obj, options) {
        const content = JSON.stringify(obj, undefined, options.insertSpaces ? options.tabSize || 4 : '\t');
        if (options.eol !== undefined) {
            return content.replace(/\r\n|\r|\n/g, options.eol);
        }
        return content;
    }
    exports.toFormattedString = toFormattedString;
    function repeat(s, count) {
        let result = '';
        for (let i = 0; i < count; i++) {
            result += s;
        }
        return result;
    }
    function computeIndentLevel(content, options) {
        let i = 0;
        let nChars = 0;
        const tabSize = options.tabSize || 4;
        while (i < content.length) {
            const ch = content.charAt(i);
            if (ch === ' ') {
                nChars++;
            }
            else if (ch === '\t') {
                nChars += tabSize;
            }
            else {
                break;
            }
            i++;
        }
        return Math.floor(nChars / tabSize);
    }
    function getEOL(options, text) {
        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);
            if (ch === '\r') {
                if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
                    return '\r\n';
                }
                return '\r';
            }
            else if (ch === '\n') {
                return '\n';
            }
        }
        return (options && options.eol) || '\n';
    }
    exports.getEOL = getEOL;
    function isEOL(text, offset) {
        return '\r\n'.indexOf(text.charAt(offset)) !== -1;
    }
    exports.isEOL = isEOL;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkZvcm1hdHRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vanNvbkZvcm1hdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvRGhHLFNBQWdCLE1BQU0sQ0FBQyxZQUFvQixFQUFFLEtBQXdCLEVBQUUsT0FBMEI7UUFDaEcsSUFBSSxrQkFBMEIsQ0FBQztRQUMvQixJQUFJLFVBQWtCLENBQUM7UUFDdkIsSUFBSSxlQUF1QixDQUFDO1FBQzVCLElBQUksVUFBa0IsQ0FBQztRQUN2QixJQUFJLFFBQWdCLENBQUM7UUFDckIsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNYLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQzFCLFFBQVEsR0FBRyxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUVyQyxlQUFlLEdBQUcsVUFBVSxDQUFDO1lBQzdCLE9BQU8sZUFBZSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsZUFBZSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pFLGVBQWUsRUFBRSxDQUFDO1lBQ25CLENBQUM7WUFDRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDekIsT0FBTyxTQUFTLEdBQUcsWUFBWSxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDM0UsU0FBUyxFQUFFLENBQUM7WUFDYixDQUFDO1lBQ0QsVUFBVSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2hFLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RCxDQUFDO2FBQU0sQ0FBQztZQUNQLFVBQVUsR0FBRyxZQUFZ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
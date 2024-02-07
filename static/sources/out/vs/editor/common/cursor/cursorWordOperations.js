/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/cursorDeleteOperations", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, strings, cursorCommon_1, cursorDeleteOperations_1, wordCharacterClassifier_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WordPartOperations = exports.WordOperations = exports.WordNavigationType = void 0;
    var WordType;
    (function (WordType) {
        WordType[WordType["None"] = 0] = "None";
        WordType[WordType["Regular"] = 1] = "Regular";
        WordType[WordType["Separator"] = 2] = "Separator";
    })(WordType || (WordType = {}));
    var WordNavigationType;
    (function (WordNavigationType) {
        WordNavigationType[WordNavigationType["WordStart"] = 0] = "WordStart";
        WordNavigationType[WordNavigationType["WordStartFast"] = 1] = "WordStartFast";
        WordNavigationType[WordNavigationType["WordEnd"] = 2] = "WordEnd";
        WordNavigationType[WordNavigationType["WordAccessibility"] = 3] = "WordAccessibility"; // Respect chrome definition of a word
    })(WordNavigationType || (exports.WordNavigationType = WordNavigationType = {}));
    class WordOperations {
        static _createWord(lineContent, wordType, nextCharClass, start, end) {
            // console.log('WORD ==> ' + start + ' => ' + end + ':::: <<<' + lineContent.substring(start, end) + '>>>');
            return { start: start, end: end, wordType: wordType, nextCharClass: nextCharClass };
        }
        static _findPreviousWordOnLine(wordSeparators, model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            return this._doFindPreviousWordOnLine(lineContent, wordSeparators, position);
        }
        static _doFindPreviousWordOnLine(lineContent, wordSeparators, position) {
            let wordType = 0 /* WordType.None */;
            for (let chIndex = position.column - 2; chIndex >= 0; chIndex--) {
                const chCode = lineContent.charCodeAt(chIndex);
                const chClass = wordSeparators.get(chCode);
                if (chClass === 0 /* WordCharacterClass.Regular */) {
                    if (wordType === 2 /* WordType.Separator */) {
                        return this._createWord(lineContent, wordType, chClass, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators, wordType, chIndex + 1));
                    }
                    wordType = 1 /* WordType.Regular */;
                }
                else if (chClass === 2 /* WordCharacterClass.WordSeparator */) {
                    if (wordType === 1 /* WordType.Regular */) {
                        return this._createWord(lineContent, wordType, chClass, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators, wordType, chIndex + 1));
                    }
                    wordType = 2 /* WordType.Separator */;
                }
                else if (chClass === 1 /* WordCharacterClass.Whitespace */) {
                    if (wordType !== 0 /* WordType.None */) {
                        return this._createWord(lineContent, wordType, chClass, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators, wordType, chIndex + 1));
                    }
                }
            }
            if (wordType !== 0 /* WordType.None */) {
                return this._createWord(lineContent, wordType, 1 /* WordCharacterClass.Whitespace */, 0, this._findEndOfWord(lineContent, wordSeparators, wordType, 0));
            }
            return null;
        }
        static _findEndOfWord(lineContent, wordSeparators, wordType, startIndex) {
            const len = lineContent.length;
            for (let chIndex = startIndex; chIndex < len; chIndex++) {
                const chCode = lineContent.charCodeAt(chIndex);
                const chClass = wordSeparators.get(chCode);
                if (chClass === 1 /* WordCharacterClass.Whitespace */) {
                    return chIndex;
                }
                if (wordType === 1 /* WordType.Regular */ && chClass === 2 /* WordCharacterClass.WordSeparator */) {
                    return chIndex;
                }
                if (wordType === 2 /* WordType.Separator */ && chClass === 0 /* WordCharacterClass.Regular */) {
                    return chIndex;
                }
            }
            return len;
        }
        static _findNextWordOnLine(wordSeparators, model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            return this._doFindNextWordOnLine(lineContent, wordSeparators, position);
        }
        static _doFindNextWordOnLine(lineContent, wordSeparators, position) {
            let wordType = 0 /* WordType.None */;
            const len = lineContent.length;
            for (let chIndex = position.column - 1; chIndex < len; chIndex++) {
                const chCode = lineContent.charCodeAt(chIndex);
                const chClass = wordSeparators.get(chCode);
                if (chClass === 0 /* WordCharacterClass.Regular */) {
                    if (wordType === 2 /* WordType.Separator */) {
                        return this._createWord(lineContent, wordType, chClass, this._findStartOfWord(lineContent, wordSeparators, wordType, chIndex - 1), chIndex);
                    }
                    wordType = 1 /* WordType.Regular */;
                }
                else if (chClass === 2 /* WordCharacterClass.WordSeparator */) {
                    if (wordType === 1 /* WordType.Regular */) {
                        return this._createWord(lineContent, wordType, chClass, this._findStartOfWord(lineContent, wordSeparators, wordType, chIndex - 1), chIndex);
                    }
                    wordType = 2 /* WordType.Separator */;
                }
                else if (chClass === 1 /* WordCharacterClass.Whitespace */) {
                    if (wordType !== 0 /* WordType.None */) {
                        return this._createWord(lineContent, wordType, chClass, this._findStartOfWord(lineContent, wordSeparators, wordType, chIndex - 1), chIndex);
                    }
                }
            }
            if (wordType !== 0 /* WordType.None */) {
                return this._createWord(lineContent, wordType, 1 /* WordCharacterClass.Whitespace */, this._findStartOfWord(lineContent, wordSeparators, wordType, len - 1), len);
            }
            return null;
        }
        static _findStartOfWord(lineContent, wordSeparators, wordType, startIndex) {
            for (let chIndex = startIndex; chIndex >= 0; chIndex--) {
                const chCode = lineContent.charCodeAt(chIndex);
                const chClass = wordSeparators.get(chCode);
                if (chClass === 1 /* WordCharacterClass.Whitespace */) {
                    return chIndex + 1;
                }
                if (wordType === 1 /* WordType.Regular */ && chClass === 2 /* WordCharacterClass.WordSeparator */) {
                    return chIndex + 1;
                }
                if (wordType === 2 /* WordType.Separator */ && chClass === 0 /* WordCharacterClass.Regular */) {
                    return chIndex + 1;
                }
            }
            return 0;
        }
        static moveWordLeft(wordSeparators, model, position, wordNavigationType) {
            let lineNumber = position.lineNumber;
            let column = position.column;
            if (column === 1) {
                if (lineNumber > 1) {
                    lineNumber = lineNumber - 1;
                    column = model.getLineMaxColumn(lineNumber);
                }
            }
            let prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, column));
            if (wordNavigationType === 0 /* WordNavigationType.WordStart */) {
                return new position_1.Position(lineNumber, prevWordOnLine ? prevWordOnLine.start + 1 : 1);
            }
            if (wordNavigationType === 1 /* WordNavigationType.WordStartFast */) {
                if (prevWordOnLine
                    && prevWordOnLine.wordType === 2 /* WordType.Separator */
                    && prevWordOnLine.end - prevWordOnLine.start === 1
                    && prevWordOnLine.nextCharClass === 0 /* WordCharacterClass.Regular */) {
                    // Skip over a word made up of one single separator and followed by a regular character
                    prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, prevWordOnLine.start + 1));
                }
                return new position_1.Position(lineNumber, prevWordOnLine ? prevWordOnLine.start + 1 : 1);
            }
            if (wordNavigationType === 3 /* WordNavigationType.WordAccessibility */) {
                while (prevWordOnLine
                    && prevWordOnLine.wordType === 2 /* WordType.Separator */) {
                    // Skip over words made up of only separators
                    prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, prevWordOnLine.start + 1));
                }
                return new position_1.Position(lineNumber, prevWordOnLine ? prevWordOnLine.start + 1 : 1);
            }
            // We are stopping at the ending of words
            if (prevWordOnLine && column <= prevWordOnLine.end + 1) {
                prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, prevWordOnLine.start + 1));
            }
            return new position_1.Position(lineNumber, prevWordOnLine ? prevWordOnLine.end + 1 : 1);
        }
        static _moveWordPartLeft(model, position) {
            const lineNumber = position.lineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            if (position.column === 1) {
                return (lineNumber > 1 ? new position_1.Position(lineNumber - 1, model.getLineMaxColumn(lineNumber - 1)) : position);
            }
            const lineContent = model.getLineContent(lineNumber);
            for (let column = position.column - 1; column > 1; column--) {
                const left = lineContent.charCodeAt(column - 2);
                const right = lineContent.charCodeAt(column - 1);
                if (left === 95 /* CharCode.Underline */ && right !== 95 /* CharCode.Underline */) {
                    // snake_case_variables
                    return new position_1.Position(lineNumber, column);
                }
                if (left === 45 /* CharCode.Dash */ && right !== 45 /* CharCode.Dash */) {
                    // kebab-case-variables
                    return new position_1.Position(lineNumber, column);
                }
                if ((strings.isLowerAsciiLetter(left) || strings.isAsciiDigit(left)) && strings.isUpperAsciiLetter(right)) {
                    // camelCaseVariables
                    return new position_1.Position(lineNumber, column);
                }
                if (strings.isUpperAsciiLetter(left) && strings.isUpperAsciiLetter(right)) {
                    // thisIsACamelCaseWithOneLetterWords
                    if (column + 1 < maxColumn) {
                        const rightRight = lineContent.charCodeAt(column);
                        if (strings.isLowerAsciiLetter(rightRight) || strings.isAsciiDigit(rightRight)) {
                            return new position_1.Position(lineNumber, column);
                        }
                    }
                }
            }
            return new position_1.Position(lineNumber, 1);
        }
        static moveWordRight(wordSeparators, model, position, wordNavigationType) {
            let lineNumber = position.lineNumber;
            let column = position.column;
            let movedDown = false;
            if (column === model.getLineMaxColumn(lineNumber)) {
                if (lineNumber < model.getLineCount()) {
                    movedDown = true;
                    lineNumber = lineNumber + 1;
                    column = 1;
                }
            }
            let nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, column));
            if (wordNavigationType === 2 /* WordNavigationType.WordEnd */) {
                if (nextWordOnLine && nextWordOnLine.wordType === 2 /* WordType.Separator */) {
                    if (nextWordOnLine.end - nextWordOnLine.start === 1 && nextWordOnLine.nextCharClass === 0 /* WordCharacterClass.Regular */) {
                        // Skip over a word made up of one single separator and followed by a regular character
                        nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                    }
                }
                if (nextWordOnLine) {
                    column = nextWordOnLine.end + 1;
                }
                else {
                    column = model.getLineMaxColumn(lineNumber);
                }
            }
            else if (wordNavigationType === 3 /* WordNavigationType.WordAccessibility */) {
                if (movedDown) {
                    // If we move to the next line, pretend that the cursor is right before the first character.
                    // This is needed when the first word starts right at the first character - and in order not to miss it,
                    // we need to start before.
                    column = 0;
                }
                while (nextWordOnLine
                    && (nextWordOnLine.wordType === 2 /* WordType.Separator */
                        || nextWordOnLine.start + 1 <= column)) {
                    // Skip over a word made up of one single separator
                    // Also skip over word if it begins before current cursor position to ascertain we're moving forward at least 1 character.
                    nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                }
                if (nextWordOnLine) {
                    column = nextWordOnLine.start + 1;
                }
                else {
                    column = model.getLineMaxColumn(lineNumber);
                }
            }
            else {
                if (nextWordOnLine && !movedDown && column >= nextWordOnLine.start + 1) {
                    nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                }
                if (nextWordOnLine) {
                    column = nextWordOnLine.start + 1;
                }
                else {
                    column = model.getLineMaxColumn(lineNumber);
                }
            }
            return new position_1.Position(lineNumber, column);
        }
        static _moveWordPartRight(model, position) {
            const lineNumber = position.lineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            if (position.column === maxColumn) {
                return (lineNumber < model.getLineCount() ? new position_1.Position(lineNumber + 1, 1) : position);
            }
            const lineContent = model.getLineContent(lineNumber);
            for (let column = position.column + 1; column < maxColumn; column++) {
                const left = lineContent.charCodeAt(column - 2);
                const right = lineContent.charCodeAt(column - 1);
                if (left !== 95 /* CharCode.Underline */ && right === 95 /* CharCode.Underline */) {
                    // snake_case_variables
                    return new position_1.Position(lineNumber, column);
                }
                if (left !== 45 /* CharCode.Dash */ && right === 45 /* CharCode.Dash */) {
                    // kebab-case-variables
                    return new position_1.Position(lineNumber, column);
                }
                if ((strings.isLowerAsciiLetter(left) || strings.isAsciiDigit(left)) && strings.isUpperAsciiLetter(right)) {
                    // camelCaseVariables
                    return new position_1.Position(lineNumber, column);
                }
                if (strings.isUpperAsciiLetter(left) && strings.isUpperAsciiLetter(right)) {
                    // thisIsACamelCaseWithOneLetterWords
                    if (column + 1 < maxColumn) {
                        const rightRight = lineContent.charCodeAt(column);
                        if (strings.isLowerAsciiLetter(rightRight) || strings.isAsciiDigit(rightRight)) {
                            return new position_1.Position(lineNumber, column);
                        }
                    }
                }
            }
            return new position_1.Position(lineNumber, maxColumn);
        }
        static _deleteWordLeftWhitespace(model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            const startIndex = position.column - 2;
            const lastNonWhitespace = strings.lastNonWhitespaceIndex(lineContent, startIndex);
            if (lastNonWhitespace + 1 < startIndex) {
                return new range_1.Range(position.lineNumber, lastNonWhitespace + 2, position.lineNumber, position.column);
            }
            return null;
        }
        static deleteWordLeft(ctx, wordNavigationType) {
            const wordSeparators = ctx.wordSeparators;
            const model = ctx.model;
            const selection = ctx.selection;
            const whitespaceHeuristics = ctx.whitespaceHeuristics;
            if (!selection.isEmpty()) {
                return selection;
            }
            if (cursorDeleteOperations_1.DeleteOperations.isAutoClosingPairDelete(ctx.autoClosingDelete, ctx.autoClosingBrackets, ctx.autoClosingQuotes, ctx.autoClosingPairs.autoClosingPairsOpenByEnd, ctx.model, [ctx.selection], ctx.autoClosedCharacters)) {
                const position = ctx.selection.getPosition();
                return new range_1.Range(position.lineNumber, position.column - 1, position.lineNumber, position.column + 1);
            }
            const position = new position_1.Position(selection.positionLineNumber, selection.positionColumn);
            let lineNumber = position.lineNumber;
            let column = position.column;
            if (lineNumber === 1 && column === 1) {
                // Ignore deleting at beginning of file
                return null;
            }
            if (whitespaceHeuristics) {
                const r = this._deleteWordLeftWhitespace(model, position);
                if (r) {
                    return r;
                }
            }
            let prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, position);
            if (wordNavigationType === 0 /* WordNavigationType.WordStart */) {
                if (prevWordOnLine) {
                    column = prevWordOnLine.start + 1;
                }
                else {
                    if (column > 1) {
                        column = 1;
                    }
                    else {
                        lineNumber--;
                        column = model.getLineMaxColumn(lineNumber);
                    }
                }
            }
            else {
                if (prevWordOnLine && column <= prevWordOnLine.end + 1) {
                    prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, prevWordOnLine.start + 1));
                }
                if (prevWordOnLine) {
                    column = prevWordOnLine.end + 1;
                }
                else {
                    if (column > 1) {
                        column = 1;
                    }
                    else {
                        lineNumber--;
                        column = model.getLineMaxColumn(lineNumber);
                    }
                }
            }
            return new range_1.Range(lineNumber, column, position.lineNumber, position.column);
        }
        static deleteInsideWord(wordSeparators, model, selection) {
            if (!selection.isEmpty()) {
                return selection;
            }
            const position = new position_1.Position(selection.positionLineNumber, selection.positionColumn);
            const r = this._deleteInsideWordWhitespace(model, position);
            if (r) {
                return r;
            }
            return this._deleteInsideWordDetermineDeleteRange(wordSeparators, model, position);
        }
        static _charAtIsWhitespace(str, index) {
            const charCode = str.charCodeAt(index);
            return (charCode === 32 /* CharCode.Space */ || charCode === 9 /* CharCode.Tab */);
        }
        static _deleteInsideWordWhitespace(model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            const lineContentLength = lineContent.length;
            if (lineContentLength === 0) {
                // empty line
                return null;
            }
            let leftIndex = Math.max(position.column - 2, 0);
            if (!this._charAtIsWhitespace(lineContent, leftIndex)) {
                // touches a non-whitespace character to the left
                return null;
            }
            let rightIndex = Math.min(position.column - 1, lineContentLength - 1);
            if (!this._charAtIsWhitespace(lineContent, rightIndex)) {
                // touches a non-whitespace character to the right
                return null;
            }
            // walk over whitespace to the left
            while (leftIndex > 0 && this._charAtIsWhitespace(lineContent, leftIndex - 1)) {
                leftIndex--;
            }
            // walk over whitespace to the right
            while (rightIndex + 1 < lineContentLength && this._charAtIsWhitespace(lineContent, rightIndex + 1)) {
                rightIndex++;
            }
            return new range_1.Range(position.lineNumber, leftIndex + 1, position.lineNumber, rightIndex + 2);
        }
        static _deleteInsideWordDetermineDeleteRange(wordSeparators, model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            const lineLength = lineContent.length;
            if (lineLength === 0) {
                // empty line
                if (position.lineNumber > 1) {
                    return new range_1.Range(position.lineNumber - 1, model.getLineMaxColumn(position.lineNumber - 1), position.lineNumber, 1);
                }
                else {
                    if (position.lineNumber < model.getLineCount()) {
                        return new range_1.Range(position.lineNumber, 1, position.lineNumber + 1, 1);
                    }
                    else {
                        // empty model
                        return new range_1.Range(position.lineNumber, 1, position.lineNumber, 1);
                    }
                }
            }
            const touchesWord = (word) => {
                return (word.start + 1 <= position.column && position.column <= word.end + 1);
            };
            const createRangeWithPosition = (startColumn, endColumn) => {
                startColumn = Math.min(startColumn, position.column);
                endColumn = Math.max(endColumn, position.column);
                return new range_1.Range(position.lineNumber, startColumn, position.lineNumber, endColumn);
            };
            const deleteWordAndAdjacentWhitespace = (word) => {
                let startColumn = word.start + 1;
                let endColumn = word.end + 1;
                let expandedToTheRight = false;
                while (endColumn - 1 < lineLength && this._charAtIsWhitespace(lineContent, endColumn - 1)) {
                    expandedToTheRight = true;
                    endColumn++;
                }
                if (!expandedToTheRight) {
                    while (startColumn > 1 && this._charAtIsWhitespace(lineContent, startColumn - 2)) {
                        startColumn--;
                    }
                }
                return createRangeWithPosition(startColumn, endColumn);
            };
            const prevWordOnLine = WordOperations._findPreviousWordOnLine(wordSeparators, model, position);
            if (prevWordOnLine && touchesWord(prevWordOnLine)) {
                return deleteWordAndAdjacentWhitespace(prevWordOnLine);
            }
            const nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, position);
            if (nextWordOnLine && touchesWord(nextWordOnLine)) {
                return deleteWordAndAdjacentWhitespace(nextWordOnLine);
            }
            if (prevWordOnLine && nextWordOnLine) {
                return createRangeWithPosition(prevWordOnLine.end + 1, nextWordOnLine.start + 1);
            }
            if (prevWordOnLine) {
                return createRangeWithPosition(prevWordOnLine.start + 1, prevWordOnLine.end + 1);
            }
            if (nextWordOnLine) {
                return createRangeWithPosition(nextWordOnLine.start + 1, nextWordOnLine.end + 1);
            }
            return createRangeWithPosition(1, lineLength + 1);
        }
        static _deleteWordPartLeft(model, selection) {
            if (!selection.isEmpty()) {
                return selection;
            }
            const pos = selection.getPosition();
            const toPosition = WordOperations._moveWordPartLeft(model, pos);
            return new range_1.Range(pos.lineNumber, pos.column, toPosition.lineNumber, toPosition.column);
        }
        static _findFirstNonWhitespaceChar(str, startIndex) {
            const len = str.length;
            for (let chIndex = startIndex; chIndex < len; chIndex++) {
                const ch = str.charAt(chIndex);
                if (ch !== ' ' && ch !== '\t') {
                    return chIndex;
                }
            }
            return len;
        }
        static _deleteWordRightWhitespace(model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            const startIndex = position.column - 1;
            const firstNonWhitespace = this._findFirstNonWhitespaceChar(lineContent, startIndex);
            if (startIndex + 1 < firstNonWhitespace) {
                // bingo
                return new range_1.Range(position.lineNumber, position.column, position.lineNumber, firstNonWhitespace + 1);
            }
            return null;
        }
        static deleteWordRight(ctx, wordNavigationType) {
            const wordSeparators = ctx.wordSeparators;
            const model = ctx.model;
            const selection = ctx.selection;
            const whitespaceHeuristics = ctx.whitespaceHeuristics;
            if (!selection.isEmpty()) {
                return selection;
            }
            const position = new position_1.Position(selection.positionLineNumber, selection.positionColumn);
            let lineNumber = position.lineNumber;
            let column = position.column;
            const lineCount = model.getLineCount();
            const maxColumn = model.getLineMaxColumn(lineNumber);
            if (lineNumber === lineCount && column === maxColumn) {
                // Ignore deleting at end of file
                return null;
            }
            if (whitespaceHeuristics) {
                const r = this._deleteWordRightWhitespace(model, position);
                if (r) {
                    return r;
                }
            }
            let nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, position);
            if (wordNavigationType === 2 /* WordNavigationType.WordEnd */) {
                if (nextWordOnLine) {
                    column = nextWordOnLine.end + 1;
                }
                else {
                    if (column < maxColumn || lineNumber === lineCount) {
                        column = maxColumn;
                    }
                    else {
                        lineNumber++;
                        nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, 1));
                        if (nextWordOnLine) {
                            column = nextWordOnLine.start + 1;
                        }
                        else {
                            column = model.getLineMaxColumn(lineNumber);
                        }
                    }
                }
            }
            else {
                if (nextWordOnLine && column >= nextWordOnLine.start + 1) {
                    nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, nextWordOnLine.end + 1));
                }
                if (nextWordOnLine) {
                    column = nextWordOnLine.start + 1;
                }
                else {
                    if (column < maxColumn || lineNumber === lineCount) {
                        column = maxColumn;
                    }
                    else {
                        lineNumber++;
                        nextWordOnLine = WordOperations._findNextWordOnLine(wordSeparators, model, new position_1.Position(lineNumber, 1));
                        if (nextWordOnLine) {
                            column = nextWordOnLine.start + 1;
                        }
                        else {
                            column = model.getLineMaxColumn(lineNumber);
                        }
                    }
                }
            }
            return new range_1.Range(lineNumber, column, position.lineNumber, position.column);
        }
        static _deleteWordPartRight(model, selection) {
            if (!selection.isEmpty()) {
                return selection;
            }
            const pos = selection.getPosition();
            const toPosition = WordOperations._moveWordPartRight(model, pos);
            return new range_1.Range(pos.lineNumber, pos.column, toPosition.lineNumber, toPosition.column);
        }
        static _createWordAtPosition(model, lineNumber, word) {
            const range = new range_1.Range(lineNumber, word.start + 1, lineNumber, word.end + 1);
            return {
                word: model.getValueInRange(range),
                startColumn: range.startColumn,
                endColumn: range.endColumn
            };
        }
        static getWordAtPosition(model, _wordSeparators, position) {
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(_wordSeparators);
            const prevWord = WordOperations._findPreviousWordOnLine(wordSeparators, model, position);
            if (prevWord && prevWord.wordType === 1 /* WordType.Regular */ && prevWord.start <= position.column - 1 && position.column - 1 <= prevWord.end) {
                return WordOperations._createWordAtPosition(model, position.lineNumber, prevWord);
            }
            const nextWord = WordOperations._findNextWordOnLine(wordSeparators, model, position);
            if (nextWord && nextWord.wordType === 1 /* WordType.Regular */ && nextWord.start <= position.column - 1 && position.column - 1 <= nextWord.end) {
                return WordOperations._createWordAtPosition(model, position.lineNumber, nextWord);
            }
            return null;
        }
        static word(config, model, cursor, inSelectionMode, position) {
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(config.wordSeparators);
            const prevWord = WordOperations._findPreviousWordOnLine(wordSeparators, model, position);
            const nextWord = WordOperations._findNextWordOnLine(wordSeparators, model, position);
            if (!inSelectionMode) {
                // Entering word selection for the first time
                let startColumn;
                let endColumn;
                if (prevWord && prevWord.wordType === 1 /* WordType.Regular */ && prevWord.start <= position.column - 1 && position.column - 1 <= prevWord.end) {
                    // isTouchingPrevWord
                    startColumn = prevWord.start + 1;
                    endColumn = prevWord.end + 1;
                }
                else if (nextWord && nextWord.wordType === 1 /* WordType.Regular */ && nextWord.start <= position.column - 1 && position.column - 1 <= nextWord.end) {
                    // isTouchingNextWord
                    startColumn = nextWord.start + 1;
                    endColumn = nextWord.end + 1;
                }
                else {
                    if (prevWord) {
                        startColumn = prevWord.end + 1;
                    }
                    else {
                        startColumn = 1;
                    }
                    if (nextWord) {
                        endColumn = nextWord.start + 1;
                    }
                    else {
                        endColumn = model.getLineMaxColumn(position.lineNumber);
                    }
                }
                return new cursorCommon_1.SingleCursorState(new range_1.Range(position.lineNumber, startColumn, position.lineNumber, endColumn), 1 /* SelectionStartKind.Word */, 0, new position_1.Position(position.lineNumber, endColumn), 0);
            }
            let startColumn;
            let endColumn;
            if (prevWord && prevWord.wordType === 1 /* WordType.Regular */ && prevWord.start < position.column - 1 && position.column - 1 < prevWord.end) {
                // isInsidePrevWord
                startColumn = prevWord.start + 1;
                endColumn = prevWord.end + 1;
            }
            else if (nextWord && nextWord.wordType === 1 /* WordType.Regular */ && nextWord.start < position.column - 1 && position.column - 1 < nextWord.end) {
                // isInsideNextWord
                startColumn = nextWord.start + 1;
                endColumn = nextWord.end + 1;
            }
            else {
                startColumn = position.column;
                endColumn = position.column;
            }
            const lineNumber = position.lineNumber;
            let column;
            if (cursor.selectionStart.containsPosition(position)) {
                column = cursor.selectionStart.endColumn;
            }
            else if (position.isBeforeOrEqual(cursor.selectionStart.getStartPosition())) {
                column = startColumn;
                const possiblePosition = new position_1.Position(lineNumber, column);
                if (cursor.selectionStart.containsPosition(possiblePosition)) {
                    column = cursor.selectionStart.endColumn;
                }
            }
            else {
                column = endColumn;
                const possiblePosition = new position_1.Position(lineNumber, column);
                if (cursor.selectionStart.containsPosition(possiblePosition)) {
                    column = cursor.selectionStart.startColumn;
                }
            }
            return cursor.move(true, lineNumber, column, 0);
        }
    }
    exports.WordOperations = WordOperations;
    class WordPartOperations extends WordOperations {
        static deleteWordPartLeft(ctx) {
            const candidates = enforceDefined([
                WordOperations.deleteWordLeft(ctx, 0 /* WordNavigationType.WordStart */),
                WordOperations.deleteWordLeft(ctx, 2 /* WordNavigationType.WordEnd */),
                WordOperations._deleteWordPartLeft(ctx.model, ctx.selection)
            ]);
            candidates.sort(range_1.Range.compareRangesUsingEnds);
            return candidates[2];
        }
        static deleteWordPartRight(ctx) {
            const candidates = enforceDefined([
                WordOperations.deleteWordRight(ctx, 0 /* WordNavigationType.WordStart */),
                WordOperations.deleteWordRight(ctx, 2 /* WordNavigationType.WordEnd */),
                WordOperations._deleteWordPartRight(ctx.model, ctx.selection)
            ]);
            candidates.sort(range_1.Range.compareRangesUsingStarts);
            return candidates[0];
        }
        static moveWordPartLeft(wordSeparators, model, position) {
            const candidates = enforceDefined([
                WordOperations.moveWordLeft(wordSeparators, model, position, 0 /* WordNavigationType.WordStart */),
                WordOperations.moveWordLeft(wordSeparators, model, position, 2 /* WordNavigationType.WordEnd */),
                WordOperations._moveWordPartLeft(model, position)
            ]);
            candidates.sort(position_1.Position.compare);
            return candidates[2];
        }
        static moveWordPartRight(wordSeparators, model, position) {
            const candidates = enforceDefined([
                WordOperations.moveWordRight(wordSeparators, model, position, 0 /* WordNavigationType.WordStart */),
                WordOperations.moveWordRight(wordSeparators, model, position, 2 /* WordNavigationType.WordEnd */),
                WordOperations._moveWordPartRight(model, position)
            ]);
            candidates.sort(position_1.Position.compare);
            return candidates[0];
        }
    }
    exports.WordPartOperations = WordPartOperations;
    function enforceDefined(arr) {
        return arr.filter(el => Boolean(el));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yV29yZE9wZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY3Vyc29yL2N1cnNvcldvcmRPcGVyYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtDaEcsSUFBVyxRQUlWO0lBSkQsV0FBVyxRQUFRO1FBQ2xCLHVDQUFRLENBQUE7UUFDUiw2Q0FBVyxDQUFBO1FBQ1gsaURBQWEsQ0FBQTtJQUNkLENBQUMsRUFKVSxRQUFRLEtBQVIsUUFBUSxRQUlsQjtJQUVELElBQWtCLGtCQUtqQjtJQUxELFdBQWtCLGtCQUFrQjtRQUNuQyxxRUFBYSxDQUFBO1FBQ2IsNkVBQWlCLENBQUE7UUFDakIsaUVBQVcsQ0FBQTtRQUNYLHFGQUFxQixDQUFBLENBQUMsc0NBQXNDO0lBQzdELENBQUMsRUFMaUIsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFLbkM7SUFjRCxNQUFhLGNBQWM7UUFFbEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFtQixFQUFFLFFBQWtCLEVBQUUsYUFBaUMsRUFBRSxLQUFhLEVBQUUsR0FBVztZQUNoSSw0R0FBNEc7WUFDNUcsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsQ0FBQztRQUNyRixDQUFDO1FBRU8sTUFBTSxDQUFDLHVCQUF1QixDQUFDLGNBQXVDLEVBQUUsS0FBeUIsRUFBRSxRQUFrQjtZQUM1SCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5RCxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFF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
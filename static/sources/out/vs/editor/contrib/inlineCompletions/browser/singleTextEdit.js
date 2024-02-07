/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/diff/diff", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/contrib/inlineCompletions/browser/ghostText", "vs/editor/contrib/inlineCompletions/browser/utils"], function (require, exports, diff_1, strings_1, range_1, ghostText_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SingleTextEdit = void 0;
    class SingleTextEdit {
        constructor(range, text) {
            this.range = range;
            this.text = text;
        }
        removeCommonPrefix(model, validModelRange) {
            const modelRange = validModelRange ? this.range.intersectRanges(validModelRange) : this.range;
            if (!modelRange) {
                return this;
            }
            const valueToReplace = model.getValueInRange(modelRange, 1 /* EndOfLinePreference.LF */);
            const commonPrefixLen = (0, strings_1.commonPrefixLength)(valueToReplace, this.text);
            const start = (0, utils_1.addPositions)(this.range.getStartPosition(), (0, utils_1.lengthOfText)(valueToReplace.substring(0, commonPrefixLen)));
            const text = this.text.substring(commonPrefixLen);
            const range = range_1.Range.fromPositions(start, this.range.getEndPosition());
            return new SingleTextEdit(range, text);
        }
        augments(base) {
            // The augmented completion must replace the base range, but can replace even more
            return this.text.startsWith(base.text) && rangeExtends(this.range, base.range);
        }
        /**
         * @param previewSuffixLength Sets where to split `inlineCompletion.text`.
         * 	If the text is `hello` and the suffix length is 2, the non-preview part is `hel` and the preview-part is `lo`.
        */
        computeGhostText(model, mode, cursorPosition, previewSuffixLength = 0) {
            let edit = this.removeCommonPrefix(model);
            if (edit.range.endLineNumber !== edit.range.startLineNumber) {
                // This edit might span multiple lines, but the first lines must be a common prefix.
                return undefined;
            }
            const sourceLine = model.getLineContent(edit.range.startLineNumber);
            const sourceIndentationLength = (0, strings_1.getLeadingWhitespace)(sourceLine).length;
            const suggestionTouchesIndentation = edit.range.startColumn - 1 <= sourceIndentationLength;
            if (suggestionTouchesIndentation) {
                // source:      ··········[······abc]
                //                         ^^^^^^^^^ inlineCompletion.range
                //              ^^^^^^^^^^ ^^^^^^ sourceIndentationLength
                //                         ^^^^^^ replacedIndentation.length
                //                               ^^^ rangeThatDoesNotReplaceIndentation
                // inlineCompletion.text: '··foo'
                //                         ^^ suggestionAddedIndentationLength
                const suggestionAddedIndentationLength = (0, strings_1.getLeadingWhitespace)(edit.text).length;
                const replacedIndentation = sourceLine.substring(edit.range.startColumn - 1, sourceIndentationLength);
                const [startPosition, endPosition] = [edit.range.getStartPosition(), edit.range.getEndPosition()];
                const newStartPosition = startPosition.column + replacedIndentation.length <= endPosition.column
                    ? startPosition.delta(0, replacedIndentation.length)
                    : endPosition;
                const rangeThatDoesNotReplaceIndentation = range_1.Range.fromPositions(newStartPosition, endPosition);
                const suggestionWithoutIndentationChange = edit.text.startsWith(replacedIndentation)
                    // Adds more indentation without changing existing indentation: We can add ghost text for this
                    ? edit.text.substring(replacedIndentation.length)
                    // Changes or removes existing indentation. Only add ghost text for the non-indentation part.
                    : edit.text.substring(suggestionAddedIndentationLength);
                edit = new SingleTextEdit(rangeThatDoesNotReplaceIndentation, suggestionWithoutIndentationChange);
            }
            // This is a single line string
            const valueToBeReplaced = model.getValueInRange(edit.range);
            const changes = cachingDiff(valueToBeReplaced, edit.text);
            if (!changes) {
                // No ghost text in case the diff would be too slow to compute
                return undefined;
            }
            const lineNumber = edit.range.startLineNumber;
            const parts = new Array();
            if (mode === 'prefix') {
                const filteredChanges = changes.filter(c => c.originalLength === 0);
                if (filteredChanges.length > 1 || filteredChanges.length === 1 && filteredChanges[0].originalStart !== valueToBeReplaced.length) {
                    // Prefixes only have a single change.
                    return undefined;
                }
            }
            const previewStartInCompletionText = edit.text.length - previewSuffixLength;
            for (const c of changes) {
                const insertColumn = edit.range.startColumn + c.originalStart + c.originalLength;
                if (mode === 'subwordSmart' && cursorPosition && cursorPosition.lineNumber === edit.range.startLineNumber && insertColumn < cursorPosition.column) {
                    // No ghost text before cursor
                    return undefined;
                }
                if (c.originalLength > 0) {
                    return undefined;
                }
                if (c.modifiedLength === 0) {
                    continue;
                }
                const modifiedEnd = c.modifiedStart + c.modifiedLength;
                const nonPreviewTextEnd = Math.max(c.modifiedStart, Math.min(modifiedEnd, previewStartInCompletionText));
                const nonPreviewText = edit.text.substring(c.modifiedStart, nonPreviewTextEnd);
                const italicText = edit.text.substring(nonPreviewTextEnd, Math.max(c.modifiedStart, modifiedEnd));
                if (nonPreviewText.length > 0) {
                    const lines = (0, strings_1.splitLines)(nonPreviewText);
                    parts.push(new ghostText_1.GhostTextPart(insertColumn, lines, false));
                }
                if (italicText.length > 0) {
                    const lines = (0, strings_1.splitLines)(italicText);
                    parts.push(new ghostText_1.GhostTextPart(insertColumn, lines, true));
                }
            }
            return new ghostText_1.GhostText(lineNumber, parts);
        }
    }
    exports.SingleTextEdit = SingleTextEdit;
    function rangeExtends(extendingRange, rangeToExtend) {
        return rangeToExtend.getStartPosition().equals(extendingRange.getStartPosition())
            && rangeToExtend.getEndPosition().isBeforeOrEqual(extendingRange.getEndPosition());
    }
    let lastRequest = undefined;
    function cachingDiff(originalValue, newValue) {
        if (lastRequest?.originalValue === originalValue && lastRequest?.newValue === newValue) {
            return lastRequest?.changes;
        }
        else {
            let changes = smartDiff(originalValue, newValue, true);
            if (changes) {
                const deletedChars = deletedCharacters(changes);
                if (deletedChars > 0) {
                    // For performance reasons, don't compute diff if there is nothing to improve
                    const newChanges = smartDiff(originalValue, newValue, false);
                    if (newChanges && deletedCharacters(newChanges) < deletedChars) {
                        // Disabling smartness seems to be better here
                        changes = newChanges;
                    }
                }
            }
            lastRequest = {
                originalValue,
                newValue,
                changes
            };
            return changes;
        }
    }
    function deletedCharacters(changes) {
        let sum = 0;
        for (const c of changes) {
            sum += c.originalLength;
        }
        return sum;
    }
    /**
     * When matching `if ()` with `if (f() = 1) { g(); }`,
     * align it like this:        `if (       )`
     * Not like this:			  `if (  )`
     * Also not like this:		  `if (             )`.
     *
     * The parenthesis are preprocessed to ensure that they match correctly.
     */
    function smartDiff(originalValue, newValue, smartBracketMatching) {
        if (originalValue.length > 5000 || newValue.length > 5000) {
            // We don't want to work on strings that are too big
            return undefined;
        }
        function getMaxCharCode(val) {
            let maxCharCode = 0;
            for (let i = 0, len = val.length; i < len; i++) {
                const charCode = val.charCodeAt(i);
                if (charCode > maxCharCode) {
                    maxCharCode = charCode;
                }
            }
            return maxCharCode;
        }
        const maxCharCode = Math.max(getMaxCharCode(originalValue), getMaxCharCode(newValue));
        function getUniqueCharCode(id) {
            if (id < 0) {
                throw new Error('unexpected');
            }
            return maxCharCode + id + 1;
        }
        function getElements(source) {
            let level = 0;
            let group = 0;
            const characters = new Int32Array(source.length);
            for (let i = 0, len = source.length; i < len; i++) {
                // TODO support more brackets
                if (smartBracketMatching && source[i] === '(') {
                    const id = group * 100 + level;
                    characters[i] = getUniqueCharCode(2 * id);
                    level++;
                }
                else if (smartBracketMatching && source[i] === ')') {
                    level = Math.max(level - 1, 0);
                    const id = group * 100 + level;
                    characters[i] = getUniqueCharCode(2 * id + 1);
                    if (level === 0) {
                        group++;
                    }
                }
                else {
                    characters[i] = source.charCodeAt(i);
                }
            }
            return characters;
        }
        const elements1 = getElements(originalValue);
        const elements2 = getElements(newValue);
        return new diff_1.LcsDiff({ getElements: () => elements1 }, { getElements: () => elements2 }).ComputeDiff(false).changes;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlVGV4dEVkaXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGluZUNvbXBsZXRpb25zL2Jyb3dzZXIvc2luZ2xlVGV4dEVkaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsY0FBYztRQUMxQixZQUNpQixLQUFZLEVBQ1osSUFBWTtZQURaLFVBQUssR0FBTCxLQUFLLENBQU87WUFDWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBRTdCLENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLGVBQXVCO1lBQzVELE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDOUYsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNqQixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLFVBQVUsaUNBQXlCLENBQUM7WUFDakYsTUFBTSxlQUFlLEdBQUcsSUFBQSw0QkFBa0IsRUFBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sS0FBSyxHQUFHLElBQUEsb0JBQVksRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsSUFBQSxvQkFBWSxFQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0SCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNsRCxNQUFNLEtBQUssR0FBRyxhQUFLLENB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
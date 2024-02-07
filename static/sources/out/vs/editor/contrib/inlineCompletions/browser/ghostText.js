/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/contrib/inlineCompletions/browser/utils"], function (require, exports, range_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ghostTextOrReplacementEquals = exports.GhostTextReplacement = exports.GhostTextPart = exports.GhostText = void 0;
    class GhostText {
        constructor(lineNumber, parts) {
            this.lineNumber = lineNumber;
            this.parts = parts;
        }
        equals(other) {
            return this.lineNumber === other.lineNumber &&
                this.parts.length === other.parts.length &&
                this.parts.every((part, index) => part.equals(other.parts[index]));
        }
        /**
         * Only used for testing/debugging.
        */
        render(documentText, debug = false) {
            const l = this.lineNumber;
            return (0, utils_1.applyEdits)(documentText, [
                ...this.parts.map(p => ({
                    range: { startLineNumber: l, endLineNumber: l, startColumn: p.column, endColumn: p.column },
                    text: debug ? `[${p.lines.join('\n')}]` : p.lines.join('\n')
                })),
            ]);
        }
        renderForScreenReader(lineText) {
            if (this.parts.length === 0) {
                return '';
            }
            const lastPart = this.parts[this.parts.length - 1];
            const cappedLineText = lineText.substr(0, lastPart.column - 1);
            const text = (0, utils_1.applyEdits)(cappedLineText, this.parts.map(p => ({
                range: { startLineNumber: 1, endLineNumber: 1, startColumn: p.column, endColumn: p.column },
                text: p.lines.join('\n')
            })));
            return text.substring(this.parts[0].column - 1);
        }
        isEmpty() {
            return this.parts.every(p => p.lines.length === 0);
        }
        get lineCount() {
            return 1 + this.parts.reduce((r, p) => r + p.lines.length - 1, 0);
        }
    }
    exports.GhostText = GhostText;
    class GhostTextPart {
        constructor(column, lines, 
        /**
         * Indicates if this part is a preview of an inline suggestion when a suggestion is previewed.
        */
        preview) {
            this.column = column;
            this.lines = lines;
            this.preview = preview;
        }
        equals(other) {
            return this.column === other.column &&
                this.lines.length === other.lines.length &&
                this.lines.every((line, index) => line === other.lines[index]);
        }
    }
    exports.GhostTextPart = GhostTextPart;
    class GhostTextReplacement {
        constructor(lineNumber, columnRange, newLines, additionalReservedLineCount = 0) {
            this.lineNumber = lineNumber;
            this.columnRange = columnRange;
            this.newLines = newLines;
            this.additionalReservedLineCount = additionalReservedLineCount;
            this.parts = [
                new GhostTextPart(this.columnRange.endColumnExclusive, this.newLines, false),
            ];
        }
        renderForScreenReader(_lineText) {
            return this.newLines.join('\n');
        }
        render(documentText, debug = false) {
            const replaceRange = this.columnRange.toRange(this.lineNumber);
            if (debug) {
                return (0, utils_1.applyEdits)(documentText, [
                    { range: range_1.Range.fromPositions(replaceRange.getStartPosition()), text: `(` },
                    { range: range_1.Range.fromPositions(replaceRange.getEndPosition()), text: `)[${this.newLines.join('\n')}]` }
                ]);
            }
            else {
                return (0, utils_1.applyEdits)(documentText, [
                    { range: replaceRange, text: this.newLines.join('\n') }
                ]);
            }
        }
        get lineCount() {
            return this.newLines.length;
        }
        isEmpty() {
            return this.parts.every(p => p.lines.length === 0);
        }
        equals(other) {
            return this.lineNumber === other.lineNumber &&
                this.columnRange.equals(other.columnRange) &&
                this.newLines.length === other.newLines.length &&
                this.newLines.every((line, index) => line === other.newLines[index]) &&
                this.additionalReservedLineCount === other.additionalReservedLineCount;
        }
    }
    exports.GhostTextReplacement = GhostTextReplacement;
    function ghostTextOrReplacementEquals(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        if (a instanceof GhostText && b instanceof GhostText) {
            return a.equals(b);
        }
        if (a instanceof GhostTextReplacement && b instanceof GhostTextReplacement) {
            return a.equals(b);
        }
        return false;
    }
    exports.ghostTextOrReplacementEquals = ghostTextOrReplacementEquals;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3RUZXh0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy9icm93c2VyL2dob3N0VGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBYSxTQUFTO1FBQ3JCLFlBQ2lCLFVBQWtCLEVBQ2xCLEtBQXNCO1lBRHRCLGVBQVUsR0FBVixVQUFVLENBQVE7WUFDbEIsVUFBSyxHQUFMLEtBQUssQ0FBaUI7UUFFdkMsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFnQjtZQUN0QixPQUFPLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLFVBQVU7Z0JBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRDs7VUFFRTtRQUNGLE1BQU0sQ0FBQyxZQUFvQixFQUFFLFFBQWlCLEtBQUs7WUFDbEQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUMxQixPQUFPLElBQUEsa0JBQVUsRUFBQyxZQUFZLEVBQUU7Z0JBQy9CLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN2QixLQUFLLEVBQUUsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFN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
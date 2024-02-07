/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/editOperation", "vs/editor/common/core/range"], function (require, exports, strings, editOperation_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.trimTrailingWhitespace = exports.TrimTrailingWhitespaceCommand = void 0;
    class TrimTrailingWhitespaceCommand {
        constructor(selection, cursors) {
            this._selection = selection;
            this._cursors = cursors;
            this._selectionId = null;
        }
        getEditOperations(model, builder) {
            const ops = trimTrailingWhitespace(model, this._cursors);
            for (let i = 0, len = ops.length; i < len; i++) {
                const op = ops[i];
                builder.addEditOperation(op.range, op.text);
            }
            this._selectionId = builder.trackSelection(this._selection);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this._selectionId);
        }
    }
    exports.TrimTrailingWhitespaceCommand = TrimTrailingWhitespaceCommand;
    /**
     * Generate commands for trimming trailing whitespace on a model and ignore lines on which cursors are sitting.
     */
    function trimTrailingWhitespace(model, cursors) {
        // Sort cursors ascending
        cursors.sort((a, b) => {
            if (a.lineNumber === b.lineNumber) {
                return a.column - b.column;
            }
            return a.lineNumber - b.lineNumber;
        });
        // Reduce multiple cursors on the same line and only keep the last one on the line
        for (let i = cursors.length - 2; i >= 0; i--) {
            if (cursors[i].lineNumber === cursors[i + 1].lineNumber) {
                // Remove cursor at `i`
                cursors.splice(i, 1);
            }
        }
        const r = [];
        let rLen = 0;
        let cursorIndex = 0;
        const cursorLen = cursors.length;
        for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
            const lineContent = model.getLineContent(lineNumber);
            const maxLineColumn = lineContent.length + 1;
            let minEditColumn = 0;
            if (cursorIndex < cursorLen && cursors[cursorIndex].lineNumber === lineNumber) {
                minEditColumn = cursors[cursorIndex].column;
                cursorIndex++;
                if (minEditColumn === maxLineColumn) {
                    // The cursor is at the end of the line => no edits for sure on this line
                    continue;
                }
            }
            if (lineContent.length === 0) {
                continue;
            }
            const lastNonWhitespaceIndex = strings.lastNonWhitespaceIndex(lineContent);
            let fromColumn = 0;
            if (lastNonWhitespaceIndex === -1) {
                // Entire line is whitespace
                fromColumn = 1;
            }
            else if (lastNonWhitespaceIndex !== lineContent.length - 1) {
                // There is trailing whitespace
                fromColumn = lastNonWhitespaceIndex + 2;
            }
            else {
                // There is no trailing whitespace
                continue;
            }
            fromColumn = Math.max(minEditColumn, fromColumn);
            r[rLen++] = editOperation_1.EditOperation.delete(new range_1.Range(lineNumber, fromColumn, lineNumber, maxLineColumn));
        }
        return r;
    }
    exports.trimTrailingWhitespace = trimTrailingWhitespace;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJpbVRyYWlsaW5nV2hpdGVzcGFjZUNvbW1hbmQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29tbWFuZHMvdHJpbVRyYWlsaW5nV2hpdGVzcGFjZUNvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsNkJBQTZCO1FBTXpDLFlBQVksU0FBb0IsRUFBRSxPQUFtQjtZQUNwRCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUMxQixDQUFDO1FBRU0saUJBQWlCLENBQUMsS0FBaUIsRUFBRSxPQUE4QjtZQUN6RSxNQUFNLEdBQUcsR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDaEQsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVsQixPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUVELElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVNLGtCQUFrQixDQUFDLEtBQWlCLEVBQUUsTUFBZ0M7WUFDNUUsT0FBTyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFlBQWEsQ0FBQyxD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
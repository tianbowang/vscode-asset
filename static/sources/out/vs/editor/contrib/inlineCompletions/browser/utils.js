/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, errors_1, lifecycle_1, observable_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lengthOfText = exports.addPositions = exports.applyObservableDecorations = exports.ColumnRange = exports.getReadonlyEmptyArray = exports.applyEdits = void 0;
    function applyEdits(text, edits) {
        const transformer = new PositionOffsetTransformer(text);
        const offsetEdits = edits.map(e => {
            const range = range_1.Range.lift(e.range);
            return ({
                startOffset: transformer.getOffset(range.getStartPosition()),
                endOffset: transformer.getOffset(range.getEndPosition()),
                text: e.text
            });
        });
        offsetEdits.sort((a, b) => b.startOffset - a.startOffset);
        for (const edit of offsetEdits) {
            text = text.substring(0, edit.startOffset) + edit.text + text.substring(edit.endOffset);
        }
        return text;
    }
    exports.applyEdits = applyEdits;
    class PositionOffsetTransformer {
        constructor(text) {
            this.lineStartOffsetByLineIdx = [];
            this.lineStartOffsetByLineIdx.push(0);
            for (let i = 0; i < text.length; i++) {
                if (text.charAt(i) === '\n') {
                    this.lineStartOffsetByLineIdx.push(i + 1);
                }
            }
        }
        getOffset(position) {
            return this.lineStartOffsetByLineIdx[position.lineNumber - 1] + position.column - 1;
        }
    }
    const array = [];
    function getReadonlyEmptyArray() {
        return array;
    }
    exports.getReadonlyEmptyArray = getReadonlyEmptyArray;
    class ColumnRange {
        constructor(startColumn, endColumnExclusive) {
            this.startColumn = startColumn;
            this.endColumnExclusive = endColumnExclusive;
            if (startColumn > endColumnExclusive) {
                throw new errors_1.BugIndicatingError(`startColumn ${startColumn} cannot be after endColumnExclusive ${endColumnExclusive}`);
            }
        }
        toRange(lineNumber) {
            return new range_1.Range(lineNumber, this.startColumn, lineNumber, this.endColumnExclusive);
        }
        equals(other) {
            return this.startColumn === other.startColumn
                && this.endColumnExclusive === other.endColumnExclusive;
        }
    }
    exports.ColumnRange = ColumnRange;
    function applyObservableDecorations(editor, decorations) {
        const d = new lifecycle_1.DisposableStore();
        const decorationsCollection = editor.createDecorationsCollection();
        d.add((0, observable_1.autorunOpts)({ debugName: () => `Apply decorations from ${decorations.debugName}` }, reader => {
            const d = decorations.read(reader);
            decorationsCollection.set(d);
        }));
        d.add({
            dispose: () => {
                decorationsCollection.clear();
            }
        });
        return d;
    }
    exports.applyObservableDecorations = applyObservableDecorations;
    function addPositions(pos1, pos2) {
        return new position_1.Position(pos1.lineNumber + pos2.lineNumber - 1, pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column);
    }
    exports.addPositions = addPositions;
    function lengthOfText(text) {
        let line = 1;
        let column = 1;
        for (const c of text) {
            if (c === '\n') {
                line++;
                column = 1;
            }
            else {
                column++;
            }
        }
        return new position_1.Position(line, column);
    }
    exports.lengthOfText = lengthOfText;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGluZUNvbXBsZXRpb25zL2Jyb3dzZXIvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLFNBQWdCLFVBQVUsQ0FBQyxJQUFZLEVBQUUsS0FBd0M7UUFDaEYsTUFBTSxXQUFXLEdBQUcsSUFBSSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2pDLE1BQU0sS0FBSyxHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sQ0FBQztnQkFDUCxXQUFXLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDNUQsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4RCxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7YUFDWixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUxRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztR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
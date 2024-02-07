/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/test/browser/testCommand", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, trimTrailingWhitespaceCommand_1, position_1, range_1, selection_1, testCommand_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Create single edit operation
     */
    function createInsertDeleteSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
        return {
            range: new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text
        };
    }
    /**
     * Create single edit operation
     */
    function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
        return {
            range: new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text,
            forceMoveMarkers: false
        };
    }
    function assertTrimTrailingWhitespaceCommand(text, expected) {
        return (0, testTextModel_1.withEditorModel)(text, (model) => {
            const op = new trimTrailingWhitespaceCommand_1.TrimTrailingWhitespaceCommand(new selection_1.Selection(1, 1, 1, 1), []);
            const actual = (0, testCommand_1.getEditOperation)(model, op);
            assert.deepStrictEqual(actual, expected);
        });
    }
    function assertTrimTrailingWhitespace(text, cursors, expected) {
        return (0, testTextModel_1.withEditorModel)(text, (model) => {
            const actual = (0, trimTrailingWhitespaceCommand_1.trimTrailingWhitespace)(model, cursors);
            assert.deepStrictEqual(actual, expected);
        });
    }
    suite('Editor Commands - Trim Trailing Whitespace Command', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('remove trailing whitespace', function () {
            assertTrimTrailingWhitespaceCommand([''], []);
            assertTrimTrailingWhitespaceCommand(['text'], []);
            assertTrimTrailingWhitespaceCommand(['text   '], [createSingleEditOp(null, 1, 5, 1, 8)]);
            assertTrimTrailingWhitespaceCommand(['text\t   '], [createSingleEditOp(null, 1, 5, 1, 9)]);
            assertTrimTrailingWhitespaceCommand(['\t   '], [createSingleEditOp(null, 1, 1, 1, 5)]);
            assertTrimTrailingWhitespaceCommand(['text\t'], [createSingleEditOp(null, 1, 5, 1, 6)]);
            assertTrimTrailingWhitespaceCommand([
                'some text\t',
                'some more text',
                '\t  ',
                'even more text  ',
                'and some mixed\t   \t'
            ], [
                createSingleEditOp(null, 1, 10, 1, 11),
                createSingleEditOp(null, 3, 1, 3, 4),
                createSingleEditOp(null, 4, 15, 4, 17),
                createSingleEditOp(null, 5, 15, 5, 20)
            ]);
            assertTrimTrailingWhitespace(['text   '], [new position_1.Position(1, 1), new position_1.Position(1, 2), new position_1.Position(1, 3)], [createInsertDeleteSingleEditOp(null, 1, 5, 1, 8)]);
            assertTrimTrailingWhitespace(['text   '], [new position_1.Position(1, 1), new position_1.Position(1, 5)], [createInsertDeleteSingleEditOp(null, 1, 5, 1, 8)]);
            assertTrimTrailingWhitespace(['text   '], [new position_1.Position(1, 1), new position_1.Position(1, 5), new position_1.Position(1, 6)], [createInsertDeleteSingleEditOp(null, 1, 6, 1, 8)]);
            assertTrimTrailingWhitespace([
                'some text\t',
                'some more text',
                '\t  ',
                'even more text  ',
                'and some mixed\t   \t'
            ], [], [
                createInsertDeleteSingleEditOp(null, 1, 10, 1, 11),
                createInsertDeleteSingleEditOp(null, 3, 1, 3, 4),
                createInsertDeleteSingleEditOp(null, 4, 15, 4, 17),
                createInsertDeleteSingleEditOp(null, 5, 15, 5, 20)
            ]);
            assertTrimTrailingWhitespace([
                'some text\t',
                'some more text',
                '\t  ',
                'even more text  ',
                'and some mixed\t   \t'
            ], [new position_1.Position(1, 11), new position_1.Position(3, 2), new position_1.Position(5, 1), new position_1.Position(4, 1), new position_1.Position(5, 10)], [
                createInsertDeleteSingleEditOp(null, 3, 2, 3, 4),
                createInsertDeleteSingleEditOp(null, 4, 15, 4, 17),
                createInsertDeleteSingleEditOp(null, 5, 15, 5, 20)
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJpbVRyYWlsaW5nV2hpdGVzcGFjZUNvbW1hbmQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvYnJvd3Nlci9jb21tYW5kcy90cmltVHJhaWxpbmdXaGl0ZXNwYWNlQ29tbWFuZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBWWhHOztPQUVHO0lBQ0gsU0FBUyw4QkFBOEIsQ0FBQyxJQUFtQixFQUFFLGtCQUEwQixFQUFFLGNBQXNCLEVBQUUsc0JBQThCLGtCQUFrQixFQUFFLGtCQUEwQixjQUFjO1FBQzFNLE9BQU87WUFDTixLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsbUJBQW1CLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFFLGNBQWMsQ0FBQztZQUMxRixJQUFJLEVBQUUsSUFBSTtTQUNWLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLGtCQUFrQixDQUFDLElBQW1CLEVBQUUsa0JBQTBCLEVBQUUsY0FBc0IsRUFBRSxzQkFBOEIsa0JBQWtCLEVBQUUsa0JBQTBCLGNBQWM7UUFDOUwsT0FBTztZQUNOLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxtQkFBbUIsRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxDQUFDO1lBQzFGLElBQUksRUFBRSxJQUFJO1lBQ1YsZ0JBQWdCLEVBQUUsS0FBSztTQUN2QixDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVMsbUNBQW1DLENBQUMsSUFBYyxFQUFFLFFBQWdDO1FBQzVGLE9BQU8sSUFBQSwrQkFBZSxFQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3RDLE1BQU0sRUFBRSxHQUFHLElBQUksNkRBQTZCLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FB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Q0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUMxRyw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRCw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNsRCw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQ2xELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUosQ0FBQyxDQUFDLENBQUMifQ==
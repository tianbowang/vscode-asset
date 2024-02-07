/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/editor/browser/coreCommands", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/replaceCommand", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/cursor/cursorTypeOperations", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/contrib/linesOperations/browser/copyLinesCommand", "vs/editor/contrib/linesOperations/browser/moveLinesCommand", "vs/editor/contrib/linesOperations/browser/sortLinesCommand", "vs/nls", "vs/platform/actions/common/actions", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, keyCodes_1, coreCommands_1, editorExtensions_1, replaceCommand_1, trimTrailingWhitespaceCommand_1, cursorTypeOperations_1, editOperation_1, position_1, range_1, selection_1, editorContextKeys_1, copyLinesCommand_1, moveLinesCommand_1, sortLinesCommand_1, nls, actions_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KebabCaseAction = exports.CamelCaseAction = exports.SnakeCaseAction = exports.TitleCaseAction = exports.LowerCaseAction = exports.UpperCaseAction = exports.AbstractCaseAction = exports.TransposeAction = exports.JoinLinesAction = exports.DeleteAllRightAction = exports.DeleteAllLeftAction = exports.AbstractDeleteAllToBoundaryAction = exports.InsertLineAfterAction = exports.InsertLineBeforeAction = exports.IndentLinesAction = exports.DeleteLinesAction = exports.TrimTrailingWhitespaceAction = exports.DeleteDuplicateLinesAction = exports.SortLinesDescendingAction = exports.SortLinesAscendingAction = exports.AbstractSortLinesAction = exports.DuplicateSelectionAction = void 0;
    // copy lines
    class AbstractCopyLinesAction extends editorExtensions_1.EditorAction {
        constructor(down, opts) {
            super(opts);
            this.down = down;
        }
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const selections = editor.getSelections().map((selection, index) => ({ selection, index, ignore: false }));
            selections.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.selection, b.selection));
            // Remove selections that would result in copying the same line
            let prev = selections[0];
            for (let i = 1; i < selections.length; i++) {
                const curr = selections[i];
                if (prev.selection.endLineNumber === curr.selection.startLineNumber) {
                    // these two selections would copy the same line
                    if (prev.index < curr.index) {
                        // prev wins
                        curr.ignore = true;
                    }
                    else {
                        // curr wins
                        prev.ignore = true;
                        prev = curr;
                    }
                }
            }
            const commands = [];
            for (const selection of selections) {
                commands.push(new copyLinesCommand_1.CopyLinesCommand(selection.selection, this.down, selection.ignore));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    class CopyLinesUpAction extends AbstractCopyLinesAction {
        constructor() {
            super(false, {
                id: 'editor.action.copyLinesUpAction',
                label: nls.localize('lines.copyUp', "Copy Line Up"),
                alias: 'Copy Line Up',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miCopyLinesUp', comment: ['&& denotes a mnemonic'] }, "&&Copy Line Up"),
                    order: 1
                }
            });
        }
    }
    class CopyLinesDownAction extends AbstractCopyLinesAction {
        constructor() {
            super(true, {
                id: 'editor.action.copyLinesDownAction',
                label: nls.localize('lines.copyDown', "Copy Line Down"),
                alias: 'Copy Line Down',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miCopyLinesDown', comment: ['&& denotes a mnemonic'] }, "Co&&py Line Down"),
                    order: 2
                }
            });
        }
    }
    class DuplicateSelectionAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.duplicateSelection',
                label: nls.localize('duplicateSelection', "Duplicate Selection"),
                alias: 'Duplicate Selection',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miDuplicateSelection', comment: ['&& denotes a mnemonic'] }, "&&Duplicate Selection"),
                    order: 5
                }
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const commands = [];
            const selections = editor.getSelections();
            const model = editor.getModel();
            for (const selection of selections) {
                if (selection.isEmpty()) {
                    commands.push(new copyLinesCommand_1.CopyLinesCommand(selection, true));
                }
                else {
                    const insertSelection = new selection_1.Selection(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn);
                    commands.push(new replaceCommand_1.ReplaceCommandThatSelectsText(insertSelection, model.getValueInRange(selection)));
                }
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.DuplicateSelectionAction = DuplicateSelectionAction;
    // move lines
    class AbstractMoveLinesAction extends editorExtensions_1.EditorAction {
        constructor(down, opts) {
            super(opts);
            this.down = down;
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const commands = [];
            const selections = editor.getSelections() || [];
            const autoIndent = editor.getOption(12 /* EditorOption.autoIndent */);
            for (const selection of selections) {
                commands.push(new moveLinesCommand_1.MoveLinesCommand(selection, this.down, autoIndent, languageConfigurationService));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    class MoveLinesUpAction extends AbstractMoveLinesAction {
        constructor() {
            super(false, {
                id: 'editor.action.moveLinesUpAction',
                label: nls.localize('lines.moveUp', "Move Line Up"),
                alias: 'Move Line Up',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                    linux: { primary: 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miMoveLinesUp', comment: ['&& denotes a mnemonic'] }, "Mo&&ve Line Up"),
                    order: 3
                }
            });
        }
    }
    class MoveLinesDownAction extends AbstractMoveLinesAction {
        constructor() {
            super(true, {
                id: 'editor.action.moveLinesDownAction',
                label: nls.localize('lines.moveDown', "Move Line Down"),
                alias: 'Move Line Down',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                    linux: { primary: 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '2_line',
                    title: nls.localize({ key: 'miMoveLinesDown', comment: ['&& denotes a mnemonic'] }, "Move &&Line Down"),
                    order: 4
                }
            });
        }
    }
    class AbstractSortLinesAction extends editorExtensions_1.EditorAction {
        constructor(descending, opts) {
            super(opts);
            this.descending = descending;
        }
        run(_accessor, editor) {
            const selections = editor.getSelections() || [];
            for (const selection of selections) {
                if (!sortLinesCommand_1.SortLinesCommand.canRun(editor.getModel(), selection, this.descending)) {
                    return;
                }
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                commands[i] = new sortLinesCommand_1.SortLinesCommand(selections[i], this.descending);
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.AbstractSortLinesAction = AbstractSortLinesAction;
    class SortLinesAscendingAction extends AbstractSortLinesAction {
        constructor() {
            super(false, {
                id: 'editor.action.sortLinesAscending',
                label: nls.localize('lines.sortAscending', "Sort Lines Ascending"),
                alias: 'Sort Lines Ascending',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.SortLinesAscendingAction = SortLinesAscendingAction;
    class SortLinesDescendingAction extends AbstractSortLinesAction {
        constructor() {
            super(true, {
                id: 'editor.action.sortLinesDescending',
                label: nls.localize('lines.sortDescending', "Sort Lines Descending"),
                alias: 'Sort Lines Descending',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.SortLinesDescendingAction = SortLinesDescendingAction;
    class DeleteDuplicateLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.removeDuplicateLines',
                label: nls.localize('lines.deleteDuplicates', "Delete Duplicate Lines"),
                alias: 'Delete Duplicate Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const model = editor.getModel();
            if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
                return;
            }
            const edits = [];
            const endCursorState = [];
            let linesDeleted = 0;
            for (const selection of editor.getSelections()) {
                const uniqueLines = new Set();
                const lines = [];
                for (let i = selection.startLineNumber; i <= selection.endLineNumber; i++) {
                    const line = model.getLineContent(i);
                    if (uniqueLines.has(line)) {
                        continue;
                    }
                    lines.push(line);
                    uniqueLines.add(line);
                }
                const selectionToReplace = new selection_1.Selection(selection.startLineNumber, 1, selection.endLineNumber, model.getLineMaxColumn(selection.endLineNumber));
                const adjustedSelectionStart = selection.startLineNumber - linesDeleted;
                const finalSelection = new selection_1.Selection(adjustedSelectionStart, 1, adjustedSelectionStart + lines.length - 1, lines[lines.length - 1].length);
                edits.push(editOperation_1.EditOperation.replace(selectionToReplace, lines.join('\n')));
                endCursorState.push(finalSelection);
                linesDeleted += (selection.endLineNumber - selection.startLineNumber + 1) - lines.length;
            }
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, endCursorState);
            editor.pushUndoStop();
        }
    }
    exports.DeleteDuplicateLinesAction = DeleteDuplicateLinesAction;
    class TrimTrailingWhitespaceAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.trimTrailingWhitespace'; }
        constructor() {
            super({
                id: TrimTrailingWhitespaceAction.ID,
                label: nls.localize('lines.trimTrailingWhitespace', "Trim Trailing Whitespace"),
                alias: 'Trim Trailing Whitespace',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor, args) {
            let cursors = [];
            if (args.reason === 'auto-save') {
                // See https://github.com/editorconfig/editorconfig-vscode/issues/47
                // It is very convenient for the editor config extension to invoke this action.
                // So, if we get a reason:'auto-save' passed in, let's preserve cursor positions.
                cursors = (editor.getSelections() || []).map(s => new position_1.Position(s.positionLineNumber, s.positionColumn));
            }
            const selection = editor.getSelection();
            if (selection === null) {
                return;
            }
            const command = new trimTrailingWhitespaceCommand_1.TrimTrailingWhitespaceCommand(selection, cursors);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
        }
    }
    exports.TrimTrailingWhitespaceAction = TrimTrailingWhitespaceAction;
    class DeleteLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.deleteLines',
                label: nls.localize('lines.delete', "Delete Line"),
                alias: 'Delete Line',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 41 /* KeyCode.KeyK */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const ops = this._getLinesToRemove(editor);
            const model = editor.getModel();
            if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
                // Model is empty
                return;
            }
            let linesDeleted = 0;
            const edits = [];
            const cursorState = [];
            for (let i = 0, len = ops.length; i < len; i++) {
                const op = ops[i];
                let startLineNumber = op.startLineNumber;
                let endLineNumber = op.endLineNumber;
                let startColumn = 1;
                let endColumn = model.getLineMaxColumn(endLineNumber);
                if (endLineNumber < model.getLineCount()) {
                    endLineNumber += 1;
                    endColumn = 1;
                }
                else if (startLineNumber > 1) {
                    startLineNumber -= 1;
                    startColumn = model.getLineMaxColumn(startLineNumber);
                }
                edits.push(editOperation_1.EditOperation.replace(new selection_1.Selection(startLineNumber, startColumn, endLineNumber, endColumn), ''));
                cursorState.push(new selection_1.Selection(startLineNumber - linesDeleted, op.positionColumn, startLineNumber - linesDeleted, op.positionColumn));
                linesDeleted += (op.endLineNumber - op.startLineNumber + 1);
            }
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, cursorState);
            editor.pushUndoStop();
        }
        _getLinesToRemove(editor) {
            // Construct delete operations
            const operations = editor.getSelections().map((s) => {
                let endLineNumber = s.endLineNumber;
                if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
                    endLineNumber -= 1;
                }
                return {
                    startLineNumber: s.startLineNumber,
                    selectionStartColumn: s.selectionStartColumn,
                    endLineNumber: endLineNumber,
                    positionColumn: s.positionColumn
                };
            });
            // Sort delete operations
            operations.sort((a, b) => {
                if (a.startLineNumber === b.startLineNumber) {
                    return a.endLineNumber - b.endLineNumber;
                }
                return a.startLineNumber - b.startLineNumber;
            });
            // Merge delete operations which are adjacent or overlapping
            const mergedOperations = [];
            let previousOperation = operations[0];
            for (let i = 1; i < operations.length; i++) {
                if (previousOperation.endLineNumber + 1 >= operations[i].startLineNumber) {
                    // Merge current operations into the previous one
                    previousOperation.endLineNumber = operations[i].endLineNumber;
                }
                else {
                    // Push previous operation
                    mergedOperations.push(previousOperation);
                    previousOperation = operations[i];
                }
            }
            // Push the last operation
            mergedOperations.push(previousOperation);
            return mergedOperations;
        }
    }
    exports.DeleteLinesAction = DeleteLinesAction;
    class IndentLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.indentLines',
                label: nls.localize('lines.indent', "Indent Line"),
                alias: 'Indent Line',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                return;
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.indent(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
            editor.pushUndoStop();
        }
    }
    exports.IndentLinesAction = IndentLinesAction;
    class OutdentLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.outdentLines',
                label: nls.localize('lines.outdent', "Outdent Line"),
                alias: 'Outdent Line',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 92 /* KeyCode.BracketLeft */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            coreCommands_1.CoreEditingCommands.Outdent.runEditorCommand(_accessor, editor, null);
        }
    }
    class InsertLineBeforeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.insertLineBefore',
                label: nls.localize('lines.insertBefore', "Insert Line Above"),
                alias: 'Insert Line Above',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                return;
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.lineInsertBefore(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
        }
    }
    exports.InsertLineBeforeAction = InsertLineBeforeAction;
    class InsertLineAfterAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.insertLineAfter',
                label: nls.localize('lines.insertAfter', "Insert Line Below"),
                alias: 'Insert Line Below',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                return;
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.lineInsertAfter(viewModel.cursorConfig, editor.getModel(), editor.getSelections()));
        }
    }
    exports.InsertLineAfterAction = InsertLineAfterAction;
    class AbstractDeleteAllToBoundaryAction extends editorExtensions_1.EditorAction {
        run(_accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const primaryCursor = editor.getSelection();
            const rangesToDelete = this._getRangesToDelete(editor);
            // merge overlapping selections
            const effectiveRanges = [];
            for (let i = 0, count = rangesToDelete.length - 1; i < count; i++) {
                const range = rangesToDelete[i];
                const nextRange = rangesToDelete[i + 1];
                if (range_1.Range.intersectRanges(range, nextRange) === null) {
                    effectiveRanges.push(range);
                }
                else {
                    rangesToDelete[i + 1] = range_1.Range.plusRange(range, nextRange);
                }
            }
            effectiveRanges.push(rangesToDelete[rangesToDelete.length - 1]);
            const endCursorState = this._getEndCursorState(primaryCursor, effectiveRanges);
            const edits = effectiveRanges.map(range => {
                return editOperation_1.EditOperation.replace(range, '');
            });
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, endCursorState);
            editor.pushUndoStop();
        }
    }
    exports.AbstractDeleteAllToBoundaryAction = AbstractDeleteAllToBoundaryAction;
    class DeleteAllLeftAction extends AbstractDeleteAllToBoundaryAction {
        constructor() {
            super({
                id: 'deleteAllLeft',
                label: nls.localize('lines.deleteAllLeft', "Delete All Left"),
                alias: 'Delete All Left',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _getEndCursorState(primaryCursor, rangesToDelete) {
            let endPrimaryCursor = null;
            const endCursorState = [];
            let deletedLines = 0;
            rangesToDelete.forEach(range => {
                let endCursor;
                if (range.endColumn === 1 && deletedLines > 0) {
                    const newStartLine = range.startLineNumber - deletedLines;
                    endCursor = new selection_1.Selection(newStartLine, range.startColumn, newStartLine, range.startColumn);
                }
                else {
                    endCursor = new selection_1.Selection(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
                }
                deletedLines += range.endLineNumber - range.startLineNumber;
                if (range.intersectRanges(primaryCursor)) {
                    endPrimaryCursor = endCursor;
                }
                else {
                    endCursorState.push(endCursor);
                }
            });
            if (endPrimaryCursor) {
                endCursorState.unshift(endPrimaryCursor);
            }
            return endCursorState;
        }
        _getRangesToDelete(editor) {
            const selections = editor.getSelections();
            if (selections === null) {
                return [];
            }
            let rangesToDelete = selections;
            const model = editor.getModel();
            if (model === null) {
                return [];
            }
            rangesToDelete.sort(range_1.Range.compareRangesUsingStarts);
            rangesToDelete = rangesToDelete.map(selection => {
                if (selection.isEmpty()) {
                    if (selection.startColumn === 1) {
                        const deleteFromLine = Math.max(1, selection.startLineNumber - 1);
                        const deleteFromColumn = selection.startLineNumber === 1 ? 1 : model.getLineLength(deleteFromLine) + 1;
                        return new range_1.Range(deleteFromLine, deleteFromColumn, selection.startLineNumber, 1);
                    }
                    else {
                        return new range_1.Range(selection.startLineNumber, 1, selection.startLineNumber, selection.startColumn);
                    }
                }
                else {
                    return new range_1.Range(selection.startLineNumber, 1, selection.endLineNumber, selection.endColumn);
                }
            });
            return rangesToDelete;
        }
    }
    exports.DeleteAllLeftAction = DeleteAllLeftAction;
    class DeleteAllRightAction extends AbstractDeleteAllToBoundaryAction {
        constructor() {
            super({
                id: 'deleteAllRight',
                label: nls.localize('lines.deleteAllRight', "Delete All Right"),
                alias: 'Delete All Right',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 41 /* KeyCode.KeyK */, secondary: [2048 /* KeyMod.CtrlCmd */ | 20 /* KeyCode.Delete */] },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _getEndCursorState(primaryCursor, rangesToDelete) {
            let endPrimaryCursor = null;
            const endCursorState = [];
            for (let i = 0, len = rangesToDelete.length, offset = 0; i < len; i++) {
                const range = rangesToDelete[i];
                const endCursor = new selection_1.Selection(range.startLineNumber - offset, range.startColumn, range.startLineNumber - offset, range.startColumn);
                if (range.intersectRanges(primaryCursor)) {
                    endPrimaryCursor = endCursor;
                }
                else {
                    endCursorState.push(endCursor);
                }
            }
            if (endPrimaryCursor) {
                endCursorState.unshift(endPrimaryCursor);
            }
            return endCursorState;
        }
        _getRangesToDelete(editor) {
            const model = editor.getModel();
            if (model === null) {
                return [];
            }
            const selections = editor.getSelections();
            if (selections === null) {
                return [];
            }
            const rangesToDelete = selections.map((sel) => {
                if (sel.isEmpty()) {
                    const maxColumn = model.getLineMaxColumn(sel.startLineNumber);
                    if (sel.startColumn === maxColumn) {
                        return new range_1.Range(sel.startLineNumber, sel.startColumn, sel.startLineNumber + 1, 1);
                    }
                    else {
                        return new range_1.Range(sel.startLineNumber, sel.startColumn, sel.startLineNumber, maxColumn);
                    }
                }
                return sel;
            });
            rangesToDelete.sort(range_1.Range.compareRangesUsingStarts);
            return rangesToDelete;
        }
    }
    exports.DeleteAllRightAction = DeleteAllRightAction;
    class JoinLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.joinLines',
                label: nls.localize('lines.joinLines', "Join Lines"),
                alias: 'Join Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 0,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 40 /* KeyCode.KeyJ */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            const selections = editor.getSelections();
            if (selections === null) {
                return;
            }
            let primaryCursor = editor.getSelection();
            if (primaryCursor === null) {
                return;
            }
            selections.sort(range_1.Range.compareRangesUsingStarts);
            const reducedSelections = [];
            const lastSelection = selections.reduce((previousValue, currentValue) => {
                if (previousValue.isEmpty()) {
                    if (previousValue.endLineNumber === currentValue.startLineNumber) {
                        if (primaryCursor.equalsSelection(previousValue)) {
                            primaryCursor = currentValue;
                        }
                        return currentValue;
                    }
                    if (currentValue.startLineNumber > previousValue.endLineNumber + 1) {
                        reducedSelections.push(previousValue);
                        return currentValue;
                    }
                    else {
                        return new selection_1.Selection(previousValue.startLineNumber, previousValue.startColumn, currentValue.endLineNumber, currentValue.endColumn);
                    }
                }
                else {
                    if (currentValue.startLineNumber > previousValue.endLineNumber) {
                        reducedSelections.push(previousValue);
                        return currentValue;
                    }
                    else {
                        return new selection_1.Selection(previousValue.startLineNumber, previousValue.startColumn, currentValue.endLineNumber, currentValue.endColumn);
                    }
                }
            });
            reducedSelections.push(lastSelection);
            const model = editor.getModel();
            if (model === null) {
                return;
            }
            const edits = [];
            const endCursorState = [];
            let endPrimaryCursor = primaryCursor;
            let lineOffset = 0;
            for (let i = 0, len = reducedSelections.length; i < len; i++) {
                const selection = reducedSelections[i];
                const startLineNumber = selection.startLineNumber;
                const startColumn = 1;
                let columnDeltaOffset = 0;
                let endLineNumber, endColumn;
                const selectionEndPositionOffset = model.getLineLength(selection.endLineNumber) - selection.endColumn;
                if (selection.isEmpty() || selection.startLineNumber === selection.endLineNumber) {
                    const position = selection.getStartPosition();
                    if (position.lineNumber < model.getLineCount()) {
                        endLineNumber = startLineNumber + 1;
                        endColumn = model.getLineMaxColumn(endLineNumber);
                    }
                    else {
                        endLineNumber = position.lineNumber;
                        endColumn = model.getLineMaxColumn(position.lineNumber);
                    }
                }
                else {
                    endLineNumber = selection.endLineNumber;
                    endColumn = model.getLineMaxColumn(endLineNumber);
                }
                let trimmedLinesContent = model.getLineContent(startLineNumber);
                for (let i = startLineNumber + 1; i <= endLineNumber; i++) {
                    const lineText = model.getLineContent(i);
                    const firstNonWhitespaceIdx = model.getLineFirstNonWhitespaceColumn(i);
                    if (firstNonWhitespaceIdx >= 1) {
                        let insertSpace = true;
                        if (trimmedLinesContent === '') {
                            insertSpace = false;
                        }
                        if (insertSpace && (trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === ' ' ||
                            trimmedLinesContent.charAt(trimmedLinesContent.length - 1) === '\t')) {
                            insertSpace = false;
                            trimmedLinesContent = trimmedLinesContent.replace(/[\s\uFEFF\xA0]+$/g, ' ');
                        }
                        const lineTextWithoutIndent = lineText.substr(firstNonWhitespaceIdx - 1);
                        trimmedLinesContent += (insertSpace ? ' ' : '') + lineTextWithoutIndent;
                        if (insertSpace) {
                            columnDeltaOffset = lineTextWithoutIndent.length + 1;
                        }
                        else {
                            columnDeltaOffset = lineTextWithoutIndent.length;
                        }
                    }
                    else {
                        columnDeltaOffset = 0;
                    }
                }
                const deleteSelection = new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
                if (!deleteSelection.isEmpty()) {
                    let resultSelection;
                    if (selection.isEmpty()) {
                        edits.push(editOperation_1.EditOperation.replace(deleteSelection, trimmedLinesContent));
                        resultSelection = new selection_1.Selection(deleteSelection.startLineNumber - lineOffset, trimmedLinesContent.length - columnDeltaOffset + 1, startLineNumber - lineOffset, trimmedLinesContent.length - columnDeltaOffset + 1);
                    }
                    else {
                        if (selection.startLineNumber === selection.endLineNumber) {
                            edits.push(editOperation_1.EditOperation.replace(deleteSelection, trimmedLinesContent));
                            resultSelection = new selection_1.Selection(selection.startLineNumber - lineOffset, selection.startColumn, selection.endLineNumber - lineOffset, selection.endColumn);
                        }
                        else {
                            edits.push(editOperation_1.EditOperation.replace(deleteSelection, trimmedLinesContent));
                            resultSelection = new selection_1.Selection(selection.startLineNumber - lineOffset, selection.startColumn, selection.startLineNumber - lineOffset, trimmedLinesContent.length - selectionEndPositionOffset);
                        }
                    }
                    if (range_1.Range.intersectRanges(deleteSelection, primaryCursor) !== null) {
                        endPrimaryCursor = resultSelection;
                    }
                    else {
                        endCursorState.push(resultSelection);
                    }
                }
                lineOffset += deleteSelection.endLineNumber - deleteSelection.startLineNumber;
            }
            endCursorState.unshift(endPrimaryCursor);
            editor.pushUndoStop();
            editor.executeEdits(this.id, edits, endCursorState);
            editor.pushUndoStop();
        }
    }
    exports.JoinLinesAction = JoinLinesAction;
    class TransposeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.transpose',
                label: nls.localize('editor.transpose', "Transpose Characters around the Cursor"),
                alias: 'Transpose Characters around the Cursor',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(_accessor, editor) {
            const selections = editor.getSelections();
            if (selections === null) {
                return;
            }
            const model = editor.getModel();
            if (model === null) {
                return;
            }
            const commands = [];
            for (let i = 0, len = selections.length; i < len; i++) {
                const selection = selections[i];
                if (!selection.isEmpty()) {
                    continue;
                }
                const cursor = selection.getStartPosition();
                const maxColumn = model.getLineMaxColumn(cursor.lineNumber);
                if (cursor.column >= maxColumn) {
                    if (cursor.lineNumber === model.getLineCount()) {
                        continue;
                    }
                    // The cursor is at the end of current line and current line is not empty
                    // then we transpose the character before the cursor and the line break if there is any following line.
                    const deleteSelection = new range_1.Range(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber + 1, 1);
                    const chars = model.getValueInRange(deleteSelection).split('').reverse().join('');
                    commands.push(new replaceCommand_1.ReplaceCommand(new selection_1.Selection(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber + 1, 1), chars));
                }
                else {
                    const deleteSelection = new range_1.Range(cursor.lineNumber, Math.max(1, cursor.column - 1), cursor.lineNumber, cursor.column + 1);
                    const chars = model.getValueInRange(deleteSelection).split('').reverse().join('');
                    commands.push(new replaceCommand_1.ReplaceCommandThatPreservesSelection(deleteSelection, chars, new selection_1.Selection(cursor.lineNumber, cursor.column + 1, cursor.lineNumber, cursor.column + 1)));
                }
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.TransposeAction = TransposeAction;
    class AbstractCaseAction extends editorExtensions_1.EditorAction {
        run(_accessor, editor) {
            const selections = editor.getSelections();
            if (selections === null) {
                return;
            }
            const model = editor.getModel();
            if (model === null) {
                return;
            }
            const wordSeparators = editor.getOption(129 /* EditorOption.wordSeparators */);
            const textEdits = [];
            for (const selection of selections) {
                if (selection.isEmpty()) {
                    const cursor = selection.getStartPosition();
                    const word = editor.getConfiguredWordAtPosition(cursor);
                    if (!word) {
                        continue;
                    }
                    const wordRange = new range_1.Range(cursor.lineNumber, word.startColumn, cursor.lineNumber, word.endColumn);
                    const text = model.getValueInRange(wordRange);
                    textEdits.push(editOperation_1.EditOperation.replace(wordRange, this._modifyText(text, wordSeparators)));
                }
                else {
                    const text = model.getValueInRange(selection);
                    textEdits.push(editOperation_1.EditOperation.replace(selection, this._modifyText(text, wordSeparators)));
                }
            }
            editor.pushUndoStop();
            editor.executeEdits(this.id, textEdits);
            editor.pushUndoStop();
        }
    }
    exports.AbstractCaseAction = AbstractCaseAction;
    class UpperCaseAction extends AbstractCaseAction {
        constructor() {
            super({
                id: 'editor.action.transformToUppercase',
                label: nls.localize('editor.transformToUppercase', "Transform to Uppercase"),
                alias: 'Transform to Uppercase',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            return text.toLocaleUpperCase();
        }
    }
    exports.UpperCaseAction = UpperCaseAction;
    class LowerCaseAction extends AbstractCaseAction {
        constructor() {
            super({
                id: 'editor.action.transformToLowercase',
                label: nls.localize('editor.transformToLowercase', "Transform to Lowercase"),
                alias: 'Transform to Lowercase',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            return text.toLocaleLowerCase();
        }
    }
    exports.LowerCaseAction = LowerCaseAction;
    class BackwardsCompatibleRegExp {
        constructor(_pattern, _flags) {
            this._pattern = _pattern;
            this._flags = _flags;
            this._actual = null;
            this._evaluated = false;
        }
        get() {
            if (!this._evaluated) {
                this._evaluated = true;
                try {
                    this._actual = new RegExp(this._pattern, this._flags);
                }
                catch (err) {
                    // this browser does not support this regular expression
                }
            }
            return this._actual;
        }
        isSupported() {
            return (this.get() !== null);
        }
    }
    class TitleCaseAction extends AbstractCaseAction {
        static { this.titleBoundary = new BackwardsCompatibleRegExp('(^|[^\\p{L}\\p{N}\']|((^|\\P{L})\'))\\p{L}', 'gmu'); }
        constructor() {
            super({
                id: 'editor.action.transformToTitlecase',
                label: nls.localize('editor.transformToTitlecase', "Transform to Title Case"),
                alias: 'Transform to Title Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            const titleBoundary = TitleCaseAction.titleBoundary.get();
            if (!titleBoundary) {
                // cannot support this
                return text;
            }
            return text
                .toLocaleLowerCase()
                .replace(titleBoundary, (b) => b.toLocaleUpperCase());
        }
    }
    exports.TitleCaseAction = TitleCaseAction;
    class SnakeCaseAction extends AbstractCaseAction {
        static { this.caseBoundary = new BackwardsCompatibleRegExp('(\\p{Ll})(\\p{Lu})', 'gmu'); }
        static { this.singleLetters = new BackwardsCompatibleRegExp('(\\p{Lu}|\\p{N})(\\p{Lu})(\\p{Ll})', 'gmu'); }
        constructor() {
            super({
                id: 'editor.action.transformToSnakecase',
                label: nls.localize('editor.transformToSnakecase', "Transform to Snake Case"),
                alias: 'Transform to Snake Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            const caseBoundary = SnakeCaseAction.caseBoundary.get();
            const singleLetters = SnakeCaseAction.singleLetters.get();
            if (!caseBoundary || !singleLetters) {
                // cannot support this
                return text;
            }
            return (text
                .replace(caseBoundary, '$1_$2')
                .replace(singleLetters, '$1_$2$3')
                .toLocaleLowerCase());
        }
    }
    exports.SnakeCaseAction = SnakeCaseAction;
    class CamelCaseAction extends AbstractCaseAction {
        static { this.wordBoundary = new BackwardsCompatibleRegExp('[_\\s-]', 'gm'); }
        constructor() {
            super({
                id: 'editor.action.transformToCamelcase',
                label: nls.localize('editor.transformToCamelcase', "Transform to Camel Case"),
                alias: 'Transform to Camel Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, wordSeparators) {
            const wordBoundary = CamelCaseAction.wordBoundary.get();
            if (!wordBoundary) {
                // cannot support this
                return text;
            }
            const words = text.split(wordBoundary);
            const firstWord = words.shift();
            return firstWord + words.map((word) => word.substring(0, 1).toLocaleUpperCase() + word.substring(1))
                .join('');
        }
    }
    exports.CamelCaseAction = CamelCaseAction;
    class KebabCaseAction extends AbstractCaseAction {
        static isSupported() {
            const areAllRegexpsSupported = [
                this.caseBoundary,
                this.singleLetters,
                this.underscoreBoundary,
            ].every((regexp) => regexp.isSupported());
            return areAllRegexpsSupported;
        }
        static { this.caseBoundary = new BackwardsCompatibleRegExp('(\\p{Ll})(\\p{Lu})', 'gmu'); }
        static { this.singleLetters = new BackwardsCompatibleRegExp('(\\p{Lu}|\\p{N})(\\p{Lu}\\p{Ll})', 'gmu'); }
        static { this.underscoreBoundary = new BackwardsCompatibleRegExp('(\\S)(_)(\\S)', 'gm'); }
        constructor() {
            super({
                id: 'editor.action.transformToKebabcase',
                label: nls.localize('editor.transformToKebabcase', 'Transform to Kebab Case'),
                alias: 'Transform to Kebab Case',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        _modifyText(text, _) {
            const caseBoundary = KebabCaseAction.caseBoundary.get();
            const singleLetters = KebabCaseAction.singleLetters.get();
            const underscoreBoundary = KebabCaseAction.underscoreBoundary.get();
            if (!caseBoundary || !singleLetters || !underscoreBoundary) {
                // one or more regexps aren't supported
                return text;
            }
            return text
                .replace(underscoreBoundary, '$1-$3')
                .replace(caseBoundary, '$1-$2')
                .replace(singleLetters, '$1-$2')
                .toLocaleLowerCase();
        }
    }
    exports.KebabCaseAction = KebabCaseAction;
    (0, editorExtensions_1.registerEditorAction)(CopyLinesUpAction);
    (0, editorExtensions_1.registerEditorAction)(CopyLinesDownAction);
    (0, editorExtensions_1.registerEditorAction)(DuplicateSelectionAction);
    (0, editorExtensions_1.registerEditorAction)(MoveLinesUpAction);
    (0, editorExtensions_1.registerEditorAction)(MoveLinesDownAction);
    (0, editorExtensions_1.registerEditorAction)(SortLinesAscendingAction);
    (0, editorExtensions_1.registerEditorAction)(SortLinesDescendingAction);
    (0, editorExtensions_1.registerEditorAction)(DeleteDuplicateLinesAction);
    (0, editorExtensions_1.registerEditorAction)(TrimTrailingWhitespaceAction);
    (0, editorExtensions_1.registerEditorAction)(DeleteLinesAction);
    (0, editorExtensions_1.registerEditorAction)(IndentLinesAction);
    (0, editorExtensions_1.registerEditorAction)(OutdentLinesAction);
    (0, editorExtensions_1.registerEditorAction)(InsertLineBeforeAction);
    (0, editorExtensions_1.registerEditorAction)(InsertLineAfterAction);
    (0, editorExtensions_1.registerEditorAction)(DeleteAllLeftAction);
    (0, editorExtensions_1.registerEditorAction)(DeleteAllRightAction);
    (0, editorExtensions_1.registerEditorAction)(JoinLinesAction);
    (0, editorExtensions_1.registerEditorAction)(TransposeAction);
    (0, editorExtensions_1.registerEditorAction)(UpperCaseAction);
    (0, editorExtensions_1.registerEditorAction)(LowerCaseAction);
    if (SnakeCaseAction.caseBoundary.isSupported() && SnakeCaseAction.singleLetters.isSupported()) {
        (0, editorExtensions_1.registerEditorAction)(SnakeCaseAction);
    }
    if (CamelCaseAction.wordBoundary.isSupported()) {
        (0, editorExtensions_1.registerEditorAction)(CamelCaseAction);
    }
    if (TitleCaseAction.titleBoundary.isSupported()) {
        (0, editorExtensions_1.registerEditorAction)(TitleCaseAction);
    }
    if (KebabCaseAction.isSupported()) {
        (0, editorExtensions_1.registerEditorAction)(KebabCaseAction);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZXNPcGVyYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9saW5lc09wZXJhdGlvbnMvYnJvd3Nlci9saW5lc09wZXJhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBeUJoRyxhQUFhO0lBRWIsTUFBZSx1QkFBd0IsU0FBUSwrQkFBWTtRQUkxRCxZQUFZLElBQWEsRUFBRSxJQUFvQjtZQUM5QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixDQUFDO1FBRU0sR0FBRyxDQUFDLFNBQTJCLEVBQUUsTUFBbUI7WUFDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2dCQUN4QixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxhQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVwRiwrREFBK0Q7WUFDL0QsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzVDLE1B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
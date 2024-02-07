/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/replaceCommand", "vs/editor/common/config/editorOptions", "vs/editor/common/cursorCommon", "vs/editor/common/cursor/cursorWordOperations", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/languageConfigurationRegistry", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys"], function (require, exports, editorExtensions_1, replaceCommand_1, editorOptions_1, cursorCommon_1, cursorWordOperations_1, wordCharacterClassifier_1, position_1, range_1, selection_1, editorContextKeys_1, languageConfigurationRegistry_1, nls, accessibility_1, contextkey_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DeleteInsideWord = exports.DeleteWordRight = exports.DeleteWordEndRight = exports.DeleteWordStartRight = exports.DeleteWordLeft = exports.DeleteWordEndLeft = exports.DeleteWordStartLeft = exports.DeleteWordRightCommand = exports.DeleteWordLeftCommand = exports.DeleteWordCommand = exports.CursorWordAccessibilityRightSelect = exports.CursorWordAccessibilityRight = exports.CursorWordRightSelect = exports.CursorWordEndRightSelect = exports.CursorWordStartRightSelect = exports.CursorWordRight = exports.CursorWordEndRight = exports.CursorWordStartRight = exports.CursorWordAccessibilityLeftSelect = exports.CursorWordAccessibilityLeft = exports.CursorWordLeftSelect = exports.CursorWordEndLeftSelect = exports.CursorWordStartLeftSelect = exports.CursorWordLeft = exports.CursorWordEndLeft = exports.CursorWordStartLeft = exports.WordRightCommand = exports.WordLeftCommand = exports.MoveWordCommand = void 0;
    class MoveWordCommand extends editorExtensions_1.EditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
            this._wordNavigationType = opts.wordNavigationType;
        }
        runEditorCommand(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(editor.getOption(129 /* EditorOption.wordSeparators */));
            const model = editor.getModel();
            const selections = editor.getSelections();
            const result = selections.map((sel) => {
                const inPosition = new position_1.Position(sel.positionLineNumber, sel.positionColumn);
                const outPosition = this._move(wordSeparators, model, inPosition, this._wordNavigationType);
                return this._moveTo(sel, outPosition, this._inSelectionMode);
            });
            model.pushStackElement();
            editor._getViewModel().setCursorStates('moveWordCommand', 3 /* CursorChangeReason.Explicit */, result.map(r => cursorCommon_1.CursorState.fromModelSelection(r)));
            if (result.length === 1) {
                const pos = new position_1.Position(result[0].positionLineNumber, result[0].positionColumn);
                editor.revealPosition(pos, 0 /* ScrollType.Smooth */);
            }
        }
        _moveTo(from, to, inSelectionMode) {
            if (inSelectionMode) {
                // move just position
                return new selection_1.Selection(from.selectionStartLineNumber, from.selectionStartColumn, to.lineNumber, to.column);
            }
            else {
                // move everything
                return new selection_1.Selection(to.lineNumber, to.column, to.lineNumber, to.column);
            }
        }
    }
    exports.MoveWordCommand = MoveWordCommand;
    class WordLeftCommand extends MoveWordCommand {
        _move(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.WordOperations.moveWordLeft(wordSeparators, model, position, wordNavigationType);
        }
    }
    exports.WordLeftCommand = WordLeftCommand;
    class WordRightCommand extends MoveWordCommand {
        _move(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.WordOperations.moveWordRight(wordSeparators, model, position, wordNavigationType);
        }
    }
    exports.WordRightCommand = WordRightCommand;
    class CursorWordStartLeft extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordStartLeft',
                precondition: undefined
            });
        }
    }
    exports.CursorWordStartLeft = CursorWordStartLeft;
    class CursorWordEndLeft extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordEndLeft',
                precondition: undefined
            });
        }
    }
    exports.CursorWordEndLeft = CursorWordEndLeft;
    class CursorWordLeft extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 1 /* WordNavigationType.WordStartFast */,
                id: 'cursorWordLeft',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, contextkeys_1.IsWindowsContext)?.negate()),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.CursorWordLeft = CursorWordLeft;
    class CursorWordStartLeftSelect extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordStartLeftSelect',
                precondition: undefined
            });
        }
    }
    exports.CursorWordStartLeftSelect = CursorWordStartLeftSelect;
    class CursorWordEndLeftSelect extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordEndLeftSelect',
                precondition: undefined
            });
        }
    }
    exports.CursorWordEndLeftSelect = CursorWordEndLeftSelect;
    class CursorWordLeftSelect extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 1 /* WordNavigationType.WordStartFast */,
                id: 'cursorWordLeftSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, contextkeys_1.IsWindowsContext)?.negate()),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.CursorWordLeftSelect = CursorWordLeftSelect;
    // Accessibility navigation commands should only be enabled on windows since they are tuned to what NVDA expects
    class CursorWordAccessibilityLeft extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 3 /* WordNavigationType.WordAccessibility */,
                id: 'cursorWordAccessibilityLeft',
                precondition: undefined
            });
        }
        _move(_, model, position, wordNavigationType) {
            return super._move((0, wordCharacterClassifier_1.getMapForWordSeparators)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.CursorWordAccessibilityLeft = CursorWordAccessibilityLeft;
    class CursorWordAccessibilityLeftSelect extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 3 /* WordNavigationType.WordAccessibility */,
                id: 'cursorWordAccessibilityLeftSelect',
                precondition: undefined
            });
        }
        _move(_, model, position, wordNavigationType) {
            return super._move((0, wordCharacterClassifier_1.getMapForWordSeparators)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.CursorWordAccessibilityLeftSelect = CursorWordAccessibilityLeftSelect;
    class CursorWordStartRight extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordStartRight',
                precondition: undefined
            });
        }
    }
    exports.CursorWordStartRight = CursorWordStartRight;
    class CursorWordEndRight extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordEndRight',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, contextkeys_1.IsWindowsContext)?.negate()),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.CursorWordEndRight = CursorWordEndRight;
    class CursorWordRight extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordRight',
                precondition: undefined
            });
        }
    }
    exports.CursorWordRight = CursorWordRight;
    class CursorWordStartRightSelect extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'cursorWordStartRightSelect',
                precondition: undefined
            });
        }
    }
    exports.CursorWordStartRightSelect = CursorWordStartRightSelect;
    class CursorWordEndRightSelect extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordEndRightSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, contextkeys_1.IsWindowsContext)?.negate()),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.CursorWordEndRightSelect = CursorWordEndRightSelect;
    class CursorWordRightSelect extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'cursorWordRightSelect',
                precondition: undefined
            });
        }
    }
    exports.CursorWordRightSelect = CursorWordRightSelect;
    class CursorWordAccessibilityRight extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 3 /* WordNavigationType.WordAccessibility */,
                id: 'cursorWordAccessibilityRight',
                precondition: undefined
            });
        }
        _move(_, model, position, wordNavigationType) {
            return super._move((0, wordCharacterClassifier_1.getMapForWordSeparators)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.CursorWordAccessibilityRight = CursorWordAccessibilityRight;
    class CursorWordAccessibilityRightSelect extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 3 /* WordNavigationType.WordAccessibility */,
                id: 'cursorWordAccessibilityRightSelect',
                precondition: undefined
            });
        }
        _move(_, model, position, wordNavigationType) {
            return super._move((0, wordCharacterClassifier_1.getMapForWordSeparators)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.CursorWordAccessibilityRightSelect = CursorWordAccessibilityRightSelect;
    class DeleteWordCommand extends editorExtensions_1.EditorCommand {
        constructor(opts) {
            super(opts);
            this._whitespaceHeuristics = opts.whitespaceHeuristics;
            this._wordNavigationType = opts.wordNavigationType;
        }
        runEditorCommand(accessor, editor, args) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            if (!editor.hasModel()) {
                return;
            }
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(editor.getOption(129 /* EditorOption.wordSeparators */));
            const model = editor.getModel();
            const selections = editor.getSelections();
            const autoClosingBrackets = editor.getOption(6 /* EditorOption.autoClosingBrackets */);
            const autoClosingQuotes = editor.getOption(11 /* EditorOption.autoClosingQuotes */);
            const autoClosingPairs = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getAutoClosingPairs();
            const viewModel = editor._getViewModel();
            const commands = selections.map((sel) => {
                const deleteRange = this._delete({
                    wordSeparators,
                    model,
                    selection: sel,
                    whitespaceHeuristics: this._whitespaceHeuristics,
                    autoClosingDelete: editor.getOption(9 /* EditorOption.autoClosingDelete */),
                    autoClosingBrackets,
                    autoClosingQuotes,
                    autoClosingPairs,
                    autoClosedCharacters: viewModel.getCursorAutoClosedCharacters()
                }, this._wordNavigationType);
                return new replaceCommand_1.ReplaceCommand(deleteRange, '');
            });
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.DeleteWordCommand = DeleteWordCommand;
    class DeleteWordLeftCommand extends DeleteWordCommand {
        _delete(ctx, wordNavigationType) {
            const r = cursorWordOperations_1.WordOperations.deleteWordLeft(ctx, wordNavigationType);
            if (r) {
                return r;
            }
            return new range_1.Range(1, 1, 1, 1);
        }
    }
    exports.DeleteWordLeftCommand = DeleteWordLeftCommand;
    class DeleteWordRightCommand extends DeleteWordCommand {
        _delete(ctx, wordNavigationType) {
            const r = cursorWordOperations_1.WordOperations.deleteWordRight(ctx, wordNavigationType);
            if (r) {
                return r;
            }
            const lineCount = ctx.model.getLineCount();
            const maxColumn = ctx.model.getLineMaxColumn(lineCount);
            return new range_1.Range(lineCount, maxColumn, lineCount, maxColumn);
        }
    }
    exports.DeleteWordRightCommand = DeleteWordRightCommand;
    class DeleteWordStartLeft extends DeleteWordLeftCommand {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'deleteWordStartLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.DeleteWordStartLeft = DeleteWordStartLeft;
    class DeleteWordEndLeft extends DeleteWordLeftCommand {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'deleteWordEndLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.DeleteWordEndLeft = DeleteWordEndLeft;
    class DeleteWordLeft extends DeleteWordLeftCommand {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'deleteWordLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 1 /* KeyCode.Backspace */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.DeleteWordLeft = DeleteWordLeft;
    class DeleteWordStartRight extends DeleteWordRightCommand {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 0 /* WordNavigationType.WordStart */,
                id: 'deleteWordStartRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.DeleteWordStartRight = DeleteWordStartRight;
    class DeleteWordEndRight extends DeleteWordRightCommand {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'deleteWordEndRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.DeleteWordEndRight = DeleteWordEndRight;
    class DeleteWordRight extends DeleteWordRightCommand {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 2 /* WordNavigationType.WordEnd */,
                id: 'deleteWordRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 20 /* KeyCode.Delete */,
                    mac: { primary: 512 /* KeyMod.Alt */ | 20 /* KeyCode.Delete */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    exports.DeleteWordRight = DeleteWordRight;
    class DeleteInsideWord extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'deleteInsideWord',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                label: nls.localize('deleteInsideWord', "Delete Word"),
                alias: 'Delete Word'
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(editor.getOption(129 /* EditorOption.wordSeparators */));
            const model = editor.getModel();
            const selections = editor.getSelections();
            const commands = selections.map((sel) => {
                const deleteRange = cursorWordOperations_1.WordOperations.deleteInsideWord(wordSeparators, model, sel);
                return new replaceCommand_1.ReplaceCommand(deleteRange, '');
            });
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.DeleteInsideWord = DeleteInsideWord;
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordStartLeft());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordEndLeft());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordLeft());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordStartLeftSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordEndLeftSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordLeftSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordStartRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordEndRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordStartRightSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordEndRightSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordRightSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordAccessibilityLeft());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordAccessibilityLeftSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordAccessibilityRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordAccessibilityRightSelect());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordStartLeft());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordEndLeft());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordLeft());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordStartRight());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordEndRight());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordRight());
    (0, editorExtensions_1.registerEditorAction)(DeleteInsideWord);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZE9wZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3dvcmRPcGVyYXRpb25zL2Jyb3dzZXIvd29yZE9wZXJhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNkJoRyxNQUFzQixlQUFnQixTQUFRLGdDQUFhO1FBSzFELFlBQVksSUFBcUI7WUFDaEMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDN0MsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNwRCxDQUFDO1FBRU0sZ0JBQWdCLENBQUMsUUFBMEIsRUFBRSxNQUFtQixFQUFFLElBQVM7WUFDakYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2dCQUN4QixPQUFPO1lBQ1IsQ0FBQztZQUNELE1BQU0sY0FBYyxHQUFHLElBQUEsaURBQXVCLEVBQUMsTUFBTSxDQUFDLFNBQVMsdUNBQTZCLENBQUMsQ0FBQztZQUM5RixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRTFDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDckMsTUFBTSxVQUFVLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLG1C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
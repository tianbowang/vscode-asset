/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, codicons_1, language_1, nls_1, actions_1, contextkey_1, contextkeys_1, cellOperations_1, coreActions_1, notebookContextKeys_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InsertCellCommand = exports.insertNewCell = void 0;
    const INSERT_CODE_CELL_ABOVE_COMMAND_ID = 'notebook.cell.insertCodeCellAbove';
    const INSERT_CODE_CELL_BELOW_COMMAND_ID = 'notebook.cell.insertCodeCellBelow';
    const INSERT_CODE_CELL_ABOVE_AND_FOCUS_CONTAINER_COMMAND_ID = 'notebook.cell.insertCodeCellAboveAndFocusContainer';
    const INSERT_CODE_CELL_BELOW_AND_FOCUS_CONTAINER_COMMAND_ID = 'notebook.cell.insertCodeCellBelowAndFocusContainer';
    const INSERT_CODE_CELL_AT_TOP_COMMAND_ID = 'notebook.cell.insertCodeCellAtTop';
    const INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID = 'notebook.cell.insertMarkdownCellAbove';
    const INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID = 'notebook.cell.insertMarkdownCellBelow';
    const INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID = 'notebook.cell.insertMarkdownCellAtTop';
    function insertNewCell(accessor, context, kind, direction, focusEditor) {
        let newCell = null;
        if (context.ui) {
            context.notebookEditor.focus();
        }
        const languageService = accessor.get(language_1.ILanguageService);
        if (context.cell) {
            const idx = context.notebookEditor.getCellIndex(context.cell);
            newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, idx, kind, direction, undefined, true);
        }
        else {
            const focusRange = context.notebookEditor.getFocus();
            const next = Math.max(focusRange.end - 1, 0);
            newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, next, kind, direction, undefined, true);
        }
        return newCell;
    }
    exports.insertNewCell = insertNewCell;
    class InsertCellCommand extends coreActions_1.NotebookAction {
        constructor(desc, kind, direction, focusEditor) {
            super(desc);
            this.kind = kind;
            this.direction = direction;
            this.focusEditor = focusEditor;
        }
        async runWithContext(accessor, context) {
            const newCell = await insertNewCell(accessor, context, this.kind, this.direction, this.focusEditor);
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, this.focusEditor ? 'editor' : 'container');
            }
        }
    }
    exports.InsertCellCommand = InsertCellCommand;
    (0, actions_1.registerAction2)(class InsertCodeCellAboveAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellAbove', "Insert Code Cell Above"),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 0
                }
            }, notebookCommon_1.CellKind.Code, 'above', true);
        }
    });
    (0, actions_1.registerAction2)(class InsertCodeCellAboveAndFocusContainerAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_ABOVE_AND_FOCUS_CONTAINER_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellAboveAndFocusContainer', "Insert Code Cell Above and Focus Container")
            }, notebookCommon_1.CellKind.Code, 'above', false);
        }
    });
    (0, actions_1.registerAction2)(class InsertCodeCellBelowAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellBelow', "Insert Code Cell Below"),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 1
                }
            }, notebookCommon_1.CellKind.Code, 'below', true);
        }
    });
    (0, actions_1.registerAction2)(class InsertCodeCellBelowAndFocusContainerAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_BELOW_AND_FOCUS_CONTAINER_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellBelowAndFocusContainer', "Insert Code Cell Below and Focus Container"),
            }, notebookCommon_1.CellKind.Code, 'below', false);
        }
    });
    (0, actions_1.registerAction2)(class InsertMarkdownCellAboveAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertMarkdownCellAbove', "Insert Markdown Cell Above"),
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 2
                }
            }, notebookCommon_1.CellKind.Markup, 'above', true);
        }
    });
    (0, actions_1.registerAction2)(class InsertMarkdownCellBelowAction extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertMarkdownCellBelow', "Insert Markdown Cell Below"),
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 3
                }
            }, notebookCommon_1.CellKind.Markup, 'below', true);
        }
    });
    (0, actions_1.registerAction2)(class InsertCodeCellAtTopAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertCodeCellAtTop', "Add Code Cell At Top"),
                f1: false
            });
        }
        async run(accessor, context) {
            context = context ?? this.getEditorContextFromArgsOrActive(accessor);
            if (context) {
                this.runWithContext(accessor, context);
            }
        }
        async runWithContext(accessor, context) {
            const languageService = accessor.get(language_1.ILanguageService);
            const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, 0, notebookCommon_1.CellKind.Code, 'above', undefined, true);
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
    });
    (0, actions_1.registerAction2)(class InsertMarkdownCellAtTopAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.insertMarkdownCellAtTop', "Add Markdown Cell At Top"),
                f1: false
            });
        }
        async run(accessor, context) {
            context = context ?? this.getEditorContextFromArgsOrActive(accessor);
            if (context) {
                this.runWithContext(accessor, context);
            }
        }
        async runWithContext(accessor, context) {
            const languageService = accessor.get(language_1.ILanguageService);
            const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, 0, notebookCommon_1.CellKind.Markup, 'above', undefined, true);
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellBetween, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)('notebookActions.menu.insertCode', "Code"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellBetween, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            title: (0, nls_1.localize)('notebookActions.menu.insertCode.minimalToolbar', "Add Code"),
            icon: codicons_1.Codicon.add,
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.equals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookToolbar, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            icon: codicons_1.Codicon.add,
            title: (0, nls_1.localize)('notebookActions.menu.insertCode.ontoolbar', "Code"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: -5,
        group: 'navigation/add',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'betweenCells'), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'hidden'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellListTop, {
        command: {
            id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)('notebookActions.menu.insertCode', "Code"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellListTop, {
        command: {
            id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
            title: (0, nls_1.localize)('notebookActions.menu.insertCode.minimaltoolbar', "Add Code"),
            icon: codicons_1.Codicon.add,
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Add Code Cell")
        },
        order: 0,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.equals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellBetween, {
        command: {
            id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)('notebookActions.menu.insertMarkdown', "Markdown"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertMarkdown.tooltip', "Add Markdown Cell")
        },
        order: 1,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookToolbar, {
        command: {
            id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
            icon: codicons_1.Codicon.add,
            title: (0, nls_1.localize)('notebookActions.menu.insertMarkdown.ontoolbar', "Markdown"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertMarkdown.tooltip', "Add Markdown Cell")
        },
        order: -5,
        group: 'navigation/add',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'betweenCells'), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'hidden'), contextkey_1.ContextKeyExpr.notEquals(`config.${notebookCommon_1.NotebookSetting.globalToolbarShowLabel}`, false), contextkey_1.ContextKeyExpr.notEquals(`config.${notebookCommon_1.NotebookSetting.globalToolbarShowLabel}`, 'never'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellListTop, {
        command: {
            id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
            title: '$(add) ' + (0, nls_1.localize)('notebookActions.menu.insertMarkdown', "Markdown"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertMarkdown.tooltip', "Add Markdown Cell")
        },
        order: 1,
        group: 'inline',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.experimental.insertToolbarAlignment', 'left'))
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zZXJ0Q2VsbEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJvbGxlci9pbnNlcnRDZWxsQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQmhHLE1BQU0saUNBQWlDLEdBQUcsbUNBQW1DLENBQUM7SUFDOUUsTUFBTSxpQ0FBaUMsR0FBRyxtQ0FBbUMsQ0FBQztJQUM5RSxNQUFNLHFEQUFxRCxHQUFHLG9EQUFvRCxDQUFDO0lBQ25ILE1BQU0scURBQXFELEdBQUcsb0RBQW9ELENBQUM7SUFDbkgsTUFBTSxrQ0FBa0MsR0FBRyxtQ0FBbUMsQ0FBQztJQUMvRSxNQUFNLHFDQUFxQyxHQUFHLHVDQUF1QyxDQUFDO0lBQ3RGLE1BQU0scUNBQXFDLEdBQUcsdUNBQXVDLENBQUM7SUFDdEYsTUFBTSxzQ0FBc0MsR0FBRyx1Q0FBdUMsQ0FBQztJQUV2RixTQUFnQixhQUFhLENBQUMsUUFBMEIsRUFBRSxPQUErQixFQUFFLElBQWMsRUFBRSxTQUE0QixFQUFFLFdBQW9CO1FBQzVKLElBQUksT0FBTyxHQUF5QixJQUFJLENBQUM7UUFDekMsSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZELElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxPQUFPLEdBQUcsSUFBQSwyQkFBVSxFQUFDLGVB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
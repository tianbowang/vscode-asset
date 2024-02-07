/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/resources", "vs/base/common/themables", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, iterator_1, resources_1, themables_1, language_1, nls_1, actions_1, configuration_1, contextkey_1, debug_1, inlineChatController_1, inlineChat_1, cellOperations_1, coreActions_1, notebookBrowser_1, icons, notebookCommon_1, notebookContextKeys_1, notebookEditorInput_1, notebookExecutionStateService_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.executeThisCellCondition = exports.executeCondition = void 0;
    const EXECUTE_NOTEBOOK_COMMAND_ID = 'notebook.execute';
    const CANCEL_NOTEBOOK_COMMAND_ID = 'notebook.cancelExecution';
    const INTERRUPT_NOTEBOOK_COMMAND_ID = 'notebook.interruptExecution';
    const CANCEL_CELL_COMMAND_ID = 'notebook.cell.cancelExecution';
    const EXECUTE_CELL_FOCUS_CONTAINER_COMMAND_ID = 'notebook.cell.executeAndFocusContainer';
    const EXECUTE_CELL_SELECT_BELOW = 'notebook.cell.executeAndSelectBelow';
    const EXECUTE_CELL_INSERT_BELOW = 'notebook.cell.executeAndInsertBelow';
    const EXECUTE_CELL_AND_BELOW = 'notebook.cell.executeCellAndBelow';
    const EXECUTE_CELLS_ABOVE = 'notebook.cell.executeCellsAbove';
    const RENDER_ALL_MARKDOWN_CELLS = 'notebook.renderAllMarkdownCells';
    const REVEAL_RUNNING_CELL = 'notebook.revealRunningCell';
    const REVEAL_LAST_FAILED_CELL = 'notebook.revealLastFailedCell';
    // If this changes, update getCodeCellExecutionContextKeyService to match
    exports.executeCondition = contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('code'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.greater(notebookContextKeys_1.NOTEBOOK_KERNEL_COUNT.key, 0), contextkey_1.ContextKeyExpr.greater(notebookContextKeys_1.NOTEBOOK_KERNEL_SOURCE_COUNT.key, 0), notebookContextKeys_1.NOTEBOOK_MISSING_KERNEL_EXTENSION));
    exports.executeThisCellCondition = contextkey_1.ContextKeyExpr.and(exports.executeCondition, notebookContextKeys_1.NOTEBOOK_CELL_EXECUTING.toNegated());
    function renderAllMarkdownCells(context) {
        for (let i = 0; i < context.notebookEditor.getLength(); i++) {
            const cell = context.notebookEditor.cellAt(i);
            if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'renderAllMarkdownCells');
            }
        }
    }
    async function runCell(editorGroupsService, context) {
        const group = editorGroupsService.activeGroup;
        if (group) {
            if (group.activeEditor) {
                group.pinEditor(group.activeEditor);
            }
        }
        if (context.ui && context.cell) {
            await context.notebookEditor.executeNotebookCells(iterator_1.Iterable.single(context.cell));
            if (context.autoReveal) {
                const cellIndex = context.notebookEditor.getCellIndex(context.cell);
                context.notebookEditor.revealCellRangeInView({ start: cellIndex, end: cellIndex + 1 });
            }
        }
        else if (context.selectedCells?.length || context.cell) {
            const selectedCells = context.selectedCells?.length ? context.selectedCells : [context.cell];
            await context.notebookEditor.executeNotebookCells(selectedCells);
            const firstCell = selectedCells[0];
            if (firstCell && context.autoReveal) {
                const cellIndex = context.notebookEditor.getCellIndex(firstCell);
                context.notebookEditor.revealCellRangeInView({ start: cellIndex, end: cellIndex + 1 });
            }
        }
        let foundEditor = undefined;
        for (const [, codeEditor] of context.notebookEditor.codeEditors) {
            if ((0, resources_1.isEqual)(codeEditor.getModel()?.uri, (context.cell ?? context.selectedCells?.[0])?.uri)) {
                foundEditor = codeEditor;
                break;
            }
        }
        if (!foundEditor) {
            return;
        }
        const controller = inlineChatController_1.InlineChatController.get(foundEditor);
        if (!controller) {
            return;
        }
        controller.createSnapshot();
    }
    (0, actions_1.registerAction2)(class RenderAllMarkdownCellsAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: RENDER_ALL_MARKDOWN_CELLS,
                title: (0, nls_1.localize)('notebookActions.renderMarkdown', "Render All Markdown Cells"),
            });
        }
        async runWithContext(accessor, context) {
            renderAllMarkdownCells(context);
        }
    });
    (0, actions_1.registerAction2)(class ExecuteNotebookAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: EXECUTE_NOTEBOOK_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.executeNotebook', "Run All"),
                icon: icons.executeAllIcon,
                metadata: {
                    description: (0, nls_1.localize)('notebookActions.executeNotebook', "Run All"),
                    args: [
                        {
                            name: 'uri',
                            description: 'The document uri'
                        }
                    ]
                },
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        order: -1,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, coreActions_1.executeNotebookCondition, contextkey_1.ContextKeyExpr.or(notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING.toNegated()), contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        order: -1,
                        group: 'navigation/execute',
                        when: contextkey_1.ContextKeyExpr.and(coreActions_1.executeNotebookCondition, contextkey_1.ContextKeyExpr.or(notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING.toNegated()), contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated())?.negate(), contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true))
                    }
                ]
            });
        }
        getEditorContextFromArgsOrActive(accessor, context) {
            return (0, coreActions_1.getContextFromUri)(accessor, context) ?? (0, coreActions_1.getContextFromActiveEditor)(accessor.get(editorService_1.IEditorService));
        }
        async runWithContext(accessor, context) {
            renderAllMarkdownCells(context);
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).find(editor => editor.editor instanceof notebookEditorInput_1.NotebookEditorInput && editor.editor.viewType === context.notebookEditor.textModel.viewType && editor.editor.resource.toString() === context.notebookEditor.textModel.uri.toString());
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            if (editor) {
                const group = editorGroupService.getGroup(editor.groupId);
                group?.pinEditor(editor.editor);
            }
            return context.notebookEditor.executeNotebookCells();
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCell extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.EXECUTE_CELL_COMMAND_ID,
                precondition: exports.executeThisCellCondition,
                title: (0, nls_1.localize)('notebookActions.execute', "Execute Cell"),
                keybinding: {
                    when: notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED,
                    primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */,
                    win: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
                    },
                    weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellExecutePrimary,
                    when: exports.executeThisCellCondition,
                    group: 'inline'
                },
                metadata: {
                    description: (0, nls_1.localize)('notebookActions.execute', "Execute Cell"),
                    args: coreActions_1.cellExecutionArgs
                },
                icon: icons.executeIcon
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            if (context.ui) {
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
            }
            await runCell(editorGroupsService, context);
        }
    });
    (0, actions_1.registerAction2)(class ExecuteAboveCells extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: EXECUTE_CELLS_ABOVE,
                precondition: exports.executeCondition,
                title: (0, nls_1.localize)('notebookActions.executeAbove', "Execute Above Cells"),
                menu: [
                    {
                        id: actions_1.MenuId.NotebookCellExecute,
                        when: contextkey_1.ContextKeyExpr.and(exports.executeCondition, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.consolidatedRunButton}`, true))
                    },
                    {
                        id: actions_1.MenuId.NotebookCellTitle,
                        order: 1 /* CellToolbarOrder.ExecuteAboveCells */,
                        group: coreActions_1.CELL_TITLE_CELL_GROUP_ID,
                        when: contextkey_1.ContextKeyExpr.and(exports.executeCondition, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.consolidatedRunButton}`, false))
                    }
                ],
                icon: icons.executeAboveIcon
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            let endCellIdx = undefined;
            if (context.ui) {
                endCellIdx = context.notebookEditor.getCellIndex(context.cell);
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
            }
            else {
                endCellIdx = Math.min(...context.selectedCells.map(cell => context.notebookEditor.getCellIndex(cell)));
            }
            if (typeof endCellIdx === 'number') {
                const range = { start: 0, end: endCellIdx };
                const cells = context.notebookEditor.getCellsInRange(range);
                context.notebookEditor.executeNotebookCells(cells);
            }
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCellAndBelow extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_AND_BELOW,
                precondition: exports.executeCondition,
                title: (0, nls_1.localize)('notebookActions.executeBelow', "Execute Cell and Below"),
                menu: [
                    {
                        id: actions_1.MenuId.NotebookCellExecute,
                        when: contextkey_1.ContextKeyExpr.and(exports.executeCondition, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.consolidatedRunButton}`, true))
                    },
                    {
                        id: actions_1.MenuId.NotebookCellTitle,
                        order: 2 /* CellToolbarOrder.ExecuteCellAndBelow */,
                        group: coreActions_1.CELL_TITLE_CELL_GROUP_ID,
                        when: contextkey_1.ContextKeyExpr.and(exports.executeCondition, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.consolidatedRunButton}`, false))
                    }
                ],
                icon: icons.executeBelowIcon
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            let startCellIdx = undefined;
            if (context.ui) {
                startCellIdx = context.notebookEditor.getCellIndex(context.cell);
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
            }
            else {
                startCellIdx = Math.min(...context.selectedCells.map(cell => context.notebookEditor.getCellIndex(cell)));
            }
            if (typeof startCellIdx === 'number') {
                const range = { start: startCellIdx, end: context.notebookEditor.getLength() };
                const cells = context.notebookEditor.getCellsInRange(range);
                context.notebookEditor.executeNotebookCells(cells);
            }
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCellFocusContainer extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_FOCUS_CONTAINER_COMMAND_ID,
                precondition: exports.executeThisCellCondition,
                title: (0, nls_1.localize)('notebookActions.executeAndFocusContainer', "Execute Cell and Focus Container"),
                metadata: {
                    description: (0, nls_1.localize)('notebookActions.executeAndFocusContainer', "Execute Cell and Focus Container"),
                    args: coreActions_1.cellExecutionArgs
                },
                icon: icons.executeIcon
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            if (context.ui) {
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
            }
            else {
                const firstCell = context.selectedCells[0];
                if (firstCell) {
                    await context.notebookEditor.focusNotebookCell(firstCell, 'container', { skipReveal: true });
                }
            }
            await runCell(editorGroupsService, context);
        }
    });
    const cellCancelCondition = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals(notebookContextKeys_1.NOTEBOOK_CELL_EXECUTION_STATE.key, 'executing'), contextkey_1.ContextKeyExpr.equals(notebookContextKeys_1.NOTEBOOK_CELL_EXECUTION_STATE.key, 'pending'));
    (0, actions_1.registerAction2)(class CancelExecuteCell extends coreActions_1.NotebookMultiCellAction {
        constructor() {
            super({
                id: CANCEL_CELL_COMMAND_ID,
                precondition: cellCancelCondition,
                title: (0, nls_1.localize)('notebookActions.cancel', "Stop Cell Execution"),
                icon: icons.stopIcon,
                menu: {
                    id: actions_1.MenuId.NotebookCellExecutePrimary,
                    when: cellCancelCondition,
                    group: 'inline'
                },
                metadata: {
                    description: (0, nls_1.localize)('notebookActions.cancel', "Stop Cell Execution"),
                    args: [
                        {
                            name: 'options',
                            description: 'The cell range options',
                            schema: {
                                'type': 'object',
                                'required': ['ranges'],
                                'properties': {
                                    'ranges': {
                                        'type': 'array',
                                        items: [
                                            {
                                                'type': 'object',
                                                'required': ['start', 'end'],
                                                'properties': {
                                                    'start': {
                                                        'type': 'number'
                                                    },
                                                    'end': {
                                                        'type': 'number'
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    'document': {
                                        'type': 'object',
                                        'description': 'The document uri',
                                    }
                                }
                            }
                        }
                    ]
                },
            });
        }
        parseArgs(accessor, ...args) {
            return (0, coreActions_1.parseMultiCellExecutionArgs)(accessor, ...args);
        }
        async runWithContext(accessor, context) {
            if (context.ui) {
                await context.notebookEditor.focusNotebookCell(context.cell, 'container', { skipReveal: true });
                return context.notebookEditor.cancelNotebookCells(iterator_1.Iterable.single(context.cell));
            }
            else {
                return context.notebookEditor.cancelNotebookCells(context.selectedCells);
            }
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCellSelectBelow extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_SELECT_BELOW,
                precondition: contextkey_1.ContextKeyExpr.or(exports.executeThisCellCondition, notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup')),
                title: (0, nls_1.localize)('notebookActions.executeAndSelectBelow', "Execute Notebook Cell and Select Below"),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_FOCUSED.negate()),
                    primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
            });
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const idx = context.notebookEditor.getCellIndex(context.cell);
            if (typeof idx !== 'number') {
                return;
            }
            const languageService = accessor.get(language_1.ILanguageService);
            const config = accessor.get(configuration_1.IConfigurationService);
            const scrollBehavior = config.getValue(notebookCommon_1.NotebookSetting.scrollToRevealCell);
            let focusOptions;
            if (scrollBehavior === 'none') {
                focusOptions = { skipReveal: true };
            }
            else {
                focusOptions = {
                    revealBehavior: scrollBehavior === 'fullCell' ? notebookBrowser_1.ScrollToRevealBehavior.fullCell : notebookBrowser_1.ScrollToRevealBehavior.firstLine
                };
            }
            if (context.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                const nextCell = context.notebookEditor.cellAt(idx + 1);
                context.cell.updateEditState(notebookBrowser_1.CellEditState.Preview, EXECUTE_CELL_SELECT_BELOW);
                if (nextCell) {
                    await context.notebookEditor.focusNotebookCell(nextCell, 'container', focusOptions);
                }
                else {
                    const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, idx, notebookCommon_1.CellKind.Markup, 'below');
                    if (newCell) {
                        await context.notebookEditor.focusNotebookCell(newCell, 'editor', focusOptions);
                    }
                }
                return;
            }
            else {
                const nextCell = context.notebookEditor.cellAt(idx + 1);
                if (nextCell) {
                    await context.notebookEditor.focusNotebookCell(nextCell, 'container', focusOptions);
                }
                else {
                    const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, idx, notebookCommon_1.CellKind.Code, 'below');
                    if (newCell) {
                        await context.notebookEditor.focusNotebookCell(newCell, 'editor', focusOptions);
                    }
                }
                return runCell(editorGroupsService, context);
            }
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCellInsertBelow extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_INSERT_BELOW,
                precondition: contextkey_1.ContextKeyExpr.or(exports.executeThisCellCondition, notebookContextKeys_1.NOTEBOOK_CELL_TYPE.isEqualTo('markup')),
                title: (0, nls_1.localize)('notebookActions.executeAndInsertBelow', "Execute Notebook Cell and Insert Below"),
                keybinding: {
                    when: notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED,
                    primary: 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */,
                    weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
            });
        }
        async runWithContext(accessor, context) {
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const idx = context.notebookEditor.getCellIndex(context.cell);
            const languageService = accessor.get(language_1.ILanguageService);
            const newFocusMode = context.cell.focusMode === notebookBrowser_1.CellFocusMode.Editor ? 'editor' : 'container';
            const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, idx, context.cell.cellKind, 'below');
            if (newCell) {
                await context.notebookEditor.focusNotebookCell(newCell, newFocusMode);
            }
            if (context.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                context.cell.updateEditState(notebookBrowser_1.CellEditState.Preview, EXECUTE_CELL_INSERT_BELOW);
            }
            else {
                runCell(editorGroupsService, context);
            }
        }
    });
    class CancelNotebook extends coreActions_1.NotebookAction {
        getEditorContextFromArgsOrActive(accessor, context) {
            return (0, coreActions_1.getContextFromUri)(accessor, context) ?? (0, coreActions_1.getContextFromActiveEditor)(accessor.get(editorService_1.IEditorService));
        }
        async runWithContext(accessor, context) {
            return context.notebookEditor.cancelNotebookCells();
        }
    }
    (0, actions_1.registerAction2)(class CancelAllNotebook extends CancelNotebook {
        constructor() {
            super({
                id: CANCEL_NOTEBOOK_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.cancelNotebook', "Stop Execution"),
                    original: 'Stop Execution'
                },
                icon: icons.stopIcon,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        order: -1,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        order: -1,
                        group: 'navigation/execute',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true))
                    }
                ]
            });
        }
    });
    (0, actions_1.registerAction2)(class InterruptNotebook extends CancelNotebook {
        constructor() {
            super({
                id: INTERRUPT_NOTEBOOK_COMMAND_ID,
                title: {
                    value: (0, nls_1.localize)('notebookActions.interruptNotebook', "Interrupt"),
                    original: 'Interrupt'
                },
                precondition: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL),
                icon: icons.stopIcon,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        order: -1,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL, contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        order: -1,
                        group: 'navigation/execute',
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_SOMETHING_RUNNING, notebookContextKeys_1.NOTEBOOK_INTERRUPTIBLE_KERNEL, contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true))
                    },
                    {
                        id: actions_1.MenuId.InteractiveToolbar,
                        group: 'navigation/execute'
                    }
                ]
            });
        }
    });
    (0, actions_1.registerAction2)(class RevealRunningCellAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: REVEAL_RUNNING_CELL,
                title: (0, nls_1.localize)('revealRunningCell', "Go to Running Cell"),
                tooltip: (0, nls_1.localize)('revealRunningCell', "Go to Running Cell"),
                shortTitle: (0, nls_1.localize)('revealRunningCellShort', "Go To"),
                precondition: notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL, contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: 0
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL, contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true)),
                        group: 'navigation/execute',
                        order: 20
                    },
                    {
                        id: actions_1.MenuId.InteractiveToolbar,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL, contextkey_1.ContextKeyExpr.equals('activeEditor', 'workbench.editor.interactive')),
                        group: 'navigation',
                        order: 10
                    }
                ],
                icon: themables_1.ThemeIcon.modify(icons.executingStateIcon, 'spin')
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.INotebookExecutionStateService);
            const notebook = context.notebookEditor.textModel.uri;
            const executingCells = notebookExecutionStateService.getCellExecutionsForNotebook(notebook);
            if (executingCells[0]) {
                const topStackFrameCell = this.findCellAtTopFrame(accessor, notebook);
                const focusHandle = topStackFrameCell ?? executingCells[0].cellHandle;
                const cell = context.notebookEditor.getCellByHandle(focusHandle);
                if (cell) {
                    context.notebookEditor.focusNotebookCell(cell, 'container');
                }
            }
        }
        findCellAtTopFrame(accessor, notebook) {
            const debugService = accessor.get(debug_1.IDebugService);
            for (const session of debugService.getModel().getSessions()) {
                for (const thread of session.getAllThreads()) {
                    const sf = thread.getTopStackFrame();
                    if (sf) {
                        const parsed = notebookCommon_1.CellUri.parse(sf.source.uri);
                        if (parsed && parsed.notebook.toString() === notebook.toString()) {
                            return parsed.handle;
                        }
                    }
                }
            }
            return undefined;
        }
    });
    (0, actions_1.registerAction2)(class RevealLastFailedCellAction extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: REVEAL_LAST_FAILED_CELL,
                title: (0, nls_1.localize)('revealLastFailedCell', "Go to Most Recently Failed Cell"),
                tooltip: (0, nls_1.localize)('revealLastFailedCell', "Go to Most Recently Failed Cell"),
                shortTitle: (0, nls_1.localize)('revealLastFailedCellShort', "Go To"),
                precondition: notebookContextKeys_1.NOTEBOOK_LAST_CELL_FAILED,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_LAST_CELL_FAILED, notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: 0
                    },
                    {
                        id: actions_1.MenuId.NotebookToolbar,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookContextKeys_1.NOTEBOOK_LAST_CELL_FAILED, notebookContextKeys_1.NOTEBOOK_HAS_RUNNING_CELL.toNegated(), contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true)),
                        group: 'navigation/execute',
                        order: 20
                    },
                ],
                icon: icons.errorStateIcon,
            });
        }
        async runWithContext(accessor, context) {
            const notebookExecutionStateService = accessor.get(notebookExecutionStateService_1.INotebookExecutionStateService);
            const notebook = context.notebookEditor.textModel.uri;
            const lastFailedCellHandle = notebookExecutionStateService.getLastFailedCellForNotebook(notebook);
            if (lastFailedCellHandle !== undefined) {
                const lastFailedCell = context.notebookEditor.getCellByHandle(lastFailedCellHandle);
                if (lastFailedCell) {
                    context.notebookEditor.focusNotebookCell(lastFailedCell, 'container');
                }
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0ZUFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJvbGxlci9leGVjdXRlQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE2QmhHLE1BQU0sMkJBQTJCLEdBQUcsa0JBQWtCLENBQUM7SUFDdkQsTUFBTSwwQkFBMEIsR0FBRywwQkFBMEIsQ0FBQztJQUM5RCxNQUFNLDZCQUE2QixHQUFHLDZCQUE2QixDQUFDO0lBQ3BFLE1BQU0sc0JBQXNCLEdBQUcsK0JBQStCLENBQUM7SUFDL0QsTUFBTSx1Q0FBdUMsR0FBRyx3Q0FBd0MsQ0FBQztJQUN6RixNQUFNLHlCQUF5QixHQUFHLHFDQUFxQyxDQUFDO0lBQ3hFLE1BQU0seUJBQXlCLEdBQUcscUNBQXFDLENBQUM7SUFDeEUsTUFBTSxzQkFBc0IsR0FBRyxtQ0FBbUMsQ0FBQztJQUNuRSxNQUFNLG1CQUFtQixHQUFHLGlDQUFpQyxDQUFDO0lBQzlELE1BQU0seUJBQXlCLEdBQUcsaUNBQWlDLENBQUM7SUFDcEUsTUFBTSxtQkFBbUIsR0FBRyw0QkFBNEIsQ0FBQztJQUN6RCxNQUFNLHVCQUF1QixHQUFHLCtCQUErQixDQUFDO0lBRWhFLHlFQUF5RTtJQUM1RCxRQUFBLGdCQUFnQixHQUFHLDJCQUFjLENBQUMsR0FBRyxDQUNqRCx3Q0FBa0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQ3BDLDJCQUFjLENBQUMsRUFBRSxDQUNoQiwyQkFBYyxDQUFDLE9BQU8sQ0FBQywyQ0FBcUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQ3BELDJCQUFjLENBQUMsT0FBTyxDQUFDLGtEQUE0QixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFDM0QsdURBQWlDLENBQ2pDLENBQUMsQ0FBQztJ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
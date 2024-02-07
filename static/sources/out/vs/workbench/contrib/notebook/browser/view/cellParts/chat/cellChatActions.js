/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/controller/insertCellActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellParts/chat/cellChatController", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys"], function (require, exports, codicons_1, editorContextKeys_1, language_1, nls_1, accessibility_1, actions_1, contextkey_1, contextkeys_1, inlineChat_1, cellOperations_1, coreActions_1, insertCellActions_1, notebookBrowser_1, cellChatController_1, notebookCommon_1, notebookContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.chat.accept',
                title: {
                    value: (0, nls_1.localize)('notebook.cell.chat.accept', "Make Request"),
                    original: 'Make Request'
                },
                icon: codicons_1.Codicon.send,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(cellChatController_1.CTX_NOTEBOOK_CELL_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_FOCUSED),
                    weight: 0 /* KeybindingWeight.EditorCore */ + 7,
                    primary: 3 /* KeyCode.Enter */
                },
                menu: {
                    id: cellChatController_1.MENU_CELL_CHAT_INPUT,
                    group: 'main',
                    order: 1,
                    when: cellChatController_1.CTX_NOTEBOOK_CHAT_HAS_ACTIVE_REQUEST.negate()
                }
            });
        }
        async runWithContext(accessor, context) {
            const ctrl = cellChatController_1.NotebookCellChatController.get(context.cell);
            if (!ctrl) {
                return;
            }
            ctrl.acceptInput();
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.chat.arrowOutUp',
                title: (0, nls_1.localize)('arrowUp', 'Cursor Up'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(cellChatController_1.CTX_NOTEBOOK_CELL_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_FIRST, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                    weight: 0 /* KeybindingWeight.EditorCore */ + 7,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */
                }
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            const idx = editor.getCellIndex(activeCell);
            if (typeof idx !== 'number') {
                return;
            }
            if (idx < 1 || editor.getLength() === 0) {
                // we don't do loop
                return;
            }
            const newCell = editor.cellAt(idx - 1);
            const newFocusMode = newCell.cellKind === notebookCommon_1.CellKind.Markup && newCell.getEditState() === notebookBrowser_1.CellEditState.Preview ? 'container' : 'editor';
            const focusEditorLine = newCell.textBuffer.getLineCount();
            await editor.focusNotebookCell(newCell, newFocusMode, { focusEditorLine: focusEditorLine });
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.chat.arrowOutDown',
                title: (0, nls_1.localize)('arrowDown', 'Cursor Down'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(cellChatController_1.CTX_NOTEBOOK_CELL_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_LAST, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                    weight: 0 /* KeybindingWeight.EditorCore */ + 7,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
                }
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            await editor.focusNotebookCell(activeCell, 'editor');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.focusChatWidget',
                title: (0, nls_1.localize)('focusChatWidget', 'Focus Chat Widget'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus, notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('bottom'), notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('none')), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                    weight: 0 /* KeybindingWeight.EditorCore */ + 7,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */
                }
            });
        }
        async runWithContext(accessor, context) {
            const activeCell = context.cell;
            // Navigate to cell chat widget if it exists
            const controller = cellChatController_1.NotebookCellChatController.get(activeCell);
            if (controller && controller.isWidgetVisible()) {
                controller.focusWidget();
                return;
            }
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.focusNextChatWidget',
                title: (0, nls_1.localize)('focusNextChatWidget', 'Focus Next Cell Chat Widget'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus, notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('top'), notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('none')), editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.negate()),
                    weight: 0 /* KeybindingWeight.EditorCore */ + 7,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
                }
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            const idx = editor.getCellIndex(activeCell);
            if (typeof idx !== 'number') {
                return;
            }
            if (idx >= editor.getLength() - 1) {
                // last one
                return;
            }
            const targetCell = editor.cellAt(idx + 1);
            if (targetCell) {
                // Navigate to cell chat widget if it exists
                const controller = cellChatController_1.NotebookCellChatController.get(targetCell);
                if (controller && controller.isWidgetVisible()) {
                    controller.focusWidget();
                    return;
                }
            }
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.chat.stop',
                title: {
                    value: (0, nls_1.localize)('notebook.cell.chat.stop', "Stop Request"),
                    original: 'Make Request'
                },
                icon: codicons_1.Codicon.debugStop,
                menu: {
                    id: cellChatController_1.MENU_CELL_CHAT_INPUT,
                    group: 'main',
                    order: 1,
                    when: cellChatController_1.CTX_NOTEBOOK_CHAT_HAS_ACTIVE_REQUEST
                }
            });
        }
        async runWithContext(accessor, context) {
            const ctrl = cellChatController_1.NotebookCellChatController.get(context.cell);
            if (!ctrl) {
                return;
            }
            ctrl.cancelCurrentRequest(false);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.chat.close',
                title: {
                    value: (0, nls_1.localize)('notebook.cell.chat.close', "Close Chat"),
                    original: 'Close Chat'
                },
                icon: codicons_1.Codicon.close,
                menu: {
                    id: cellChatController_1.MENU_CELL_CHAT_WIDGET,
                    group: 'main',
                    order: 2
                }
            });
        }
        async runWithContext(accessor, context) {
            const ctrl = cellChatController_1.NotebookCellChatController.get(context.cell);
            if (!ctrl) {
                return;
            }
            ctrl.dismiss(false);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: 'notebook.cell.chat.acceptChanges',
                title: { value: (0, nls_1.localize)('apply1', 'Accept Changes'), original: 'Accept Changes' },
                shortTitle: (0, nls_1.localize)('apply2', 'Accept'),
                icon: codicons_1.Codicon.check,
                tooltip: (0, nls_1.localize)('apply1', 'Accept Changes'),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(cellChatController_1.CTX_NOTEBOOK_CELL_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_FOCUSED),
                    weight: 100 /* KeybindingWeight.EditorContrib */ + 10,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                },
                menu: [
                    {
                        id: cellChatController_1.MENU_CELL_CHAT_WIDGET_STATUS,
                        group: 'inline',
                        order: 0,
                        when: inlineChat_1.CTX_INLINE_CHAT_RESPONSE_TYPES.notEqualsTo("onlyMessages" /* InlineChatResponseTypes.OnlyMessages */),
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            const ctrl = cellChatController_1.NotebookCellChatController.get(context.cell);
            if (!ctrl) {
                return;
            }
            ctrl.acceptSession();
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.chat.discard',
                title: (0, nls_1.localize)('discard', 'Discard'),
                icon: codicons_1.Codicon.discard,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(cellChatController_1.CTX_NOTEBOOK_CELL_CHAT_FOCUSED, inlineChat_1.CTX_INLINE_CHAT_FOCUSED, notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED),
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */
                },
                menu: {
                    id: cellChatController_1.MENU_CELL_CHAT_WIDGET_STATUS,
                    group: 'main',
                    order: 1
                }
            });
        }
        async runWithContext(accessor, context) {
            const ctrl = cellChatController_1.NotebookCellChatController.get(context.cell);
            if (!ctrl) {
                return;
            }
            // todo discard
            ctrl.dismiss(true);
            // focus on the cell editor container
            context.notebookEditor.focusNotebookCell(context.cell, 'container');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.feedbackHelpful',
                title: (0, nls_1.localize)('feedback.helpful', 'Helpful'),
                icon: codicons_1.Codicon.thumbsup,
                menu: {
                    id: cellChatController_1.MENU_CELL_CHAT_WIDGET_FEEDBACK,
                    group: 'inline',
                    order: 1,
                    when: inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.notEqualsTo(undefined),
                }
            });
        }
        async runWithContext(accessor, context) {
            const ctrl = cellChatController_1.NotebookCellChatController.get(context.cell);
            if (!ctrl) {
                return;
            }
            ctrl.feedbackLast(1 /* InlineChatResponseFeedbackKind.Helpful */);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.feedbackUnhelpful',
                title: (0, nls_1.localize)('feedback.unhelpful', 'Unhelpful'),
                icon: codicons_1.Codicon.thumbsdown,
                menu: {
                    id: cellChatController_1.MENU_CELL_CHAT_WIDGET_FEEDBACK,
                    group: 'inline',
                    order: 2,
                    when: inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.notEqualsTo(undefined),
                }
            });
        }
        async runWithContext(accessor, context) {
            const ctrl = cellChatController_1.NotebookCellChatController.get(context.cell);
            if (!ctrl) {
                return;
            }
            ctrl.feedbackLast(0 /* InlineChatResponseFeedbackKind.Unhelpful */);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.reportIssueForBug',
                title: (0, nls_1.localize)('feedback.reportIssueForBug', 'Report Issue'),
                icon: codicons_1.Codicon.report,
                menu: {
                    id: cellChatController_1.MENU_CELL_CHAT_WIDGET_FEEDBACK,
                    group: 'inline',
                    order: 3,
                    when: inlineChat_1.CTX_INLINE_CHAT_LAST_RESPONSE_TYPE.notEqualsTo(undefined),
                }
            });
        }
        async runWithContext(accessor, context) {
            const ctrl = cellChatController_1.NotebookCellChatController.get(context.cell);
            if (!ctrl) {
                return;
            }
            ctrl.feedbackLast(4 /* InlineChatResponseFeedbackKind.Bug */);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: 'notebook.cell.insertCodeCellWithChat',
                title: {
                    value: '$(sparkle) ' + (0, nls_1.localize)('notebookActions.menu.insertCodeCellWithChat', "Generate"),
                    original: '$(sparkle) Generate',
                },
                tooltip: (0, nls_1.localize)('notebookActions.menu.insertCodeCellWithChat.tooltip', "Generate Code Cell with Chat"),
                metadata: {
                    description: (0, nls_1.localize)('notebookActions.menu.insertCodeCellWithChat.tooltip', "Generate Code Cell with Chat"),
                    args: [
                        {
                            name: 'args',
                            schema: {
                                type: 'object',
                                required: ['index'],
                                properties: {
                                    'index': {
                                        type: 'number'
                                    },
                                    'input': {
                                        type: 'string'
                                    },
                                    'autoSend': {
                                        type: 'boolean'
                                    }
                                }
                            }
                        }
                    ]
                },
                menu: [
                    {
                        id: actions_1.MenuId.NotebookCellBetween,
                        group: 'inline',
                        order: -1,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), inlineChat_1.CTX_INLINE_CHAT_HAS_PROVIDER, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.cellChat}`, true))
                    }
                ]
            });
        }
        getEditorContextFromArgsOrActive(accessor, ...args) {
            const [firstArg] = args;
            if (!firstArg) {
                return undefined;
            }
            if (typeof firstArg !== 'object' || typeof firstArg.index !== 'number') {
                return undefined;
            }
            const notebookEditor = (0, coreActions_1.getEditorFromArgsOrActivePane)(accessor);
            if (!notebookEditor) {
                return undefined;
            }
            const cell = firstArg.index <= 0 ? undefined : notebookEditor.cellAt(firstArg.index - 1);
            return {
                cell,
                notebookEditor,
                input: firstArg.input,
                autoSend: firstArg.autoSend
            };
        }
        async runWithContext(accessor, context) {
            let newCell = null;
            if (!context.cell) {
                // insert at the top
                const languageService = accessor.get(language_1.ILanguageService);
                newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, 0, notebookCommon_1.CellKind.Code, 'above', undefined, true);
            }
            else {
                newCell = (0, insertCellActions_1.insertNewCell)(accessor, context, notebookCommon_1.CellKind.Code, 'below', true);
            }
            if (!newCell) {
                return;
            }
            await context.notebookEditor.focusNotebookCell(newCell, 'container');
            const ctrl = cellChatController_1.NotebookCellChatController.get(newCell);
            if (!ctrl) {
                return;
            }
            context.notebookEditor.getCellsInRange().forEach(cell => {
                const cellCtrl = cellChatController_1.NotebookCellChatController.get(cell);
                if (cellCtrl) {
                    cellCtrl.dismiss(false);
                }
            });
            ctrl.show(context.input, context.autoSend);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: 'notebook.cell.insertCodeCellWithChatAtTop',
                title: {
                    value: '$(sparkle) ' + (0, nls_1.localize)('notebookActions.menu.insertCodeCellWithChat', "Generate"),
                    original: '$(sparkle) Generate',
                },
                tooltip: (0, nls_1.localize)('notebookActions.menu.insertCodeCellWithChat.tooltip', "Generate Code Cell with Chat"),
                menu: [
                    {
                        id: actions_1.MenuId.NotebookCellListTop,
                        group: 'inline',
                        order: -1,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), inlineChat_1.CTX_INLINE_CHAT_HAS_PROVIDER, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.cellChat}`, true))
                    },
                ]
            });
        }
        async runWithContext(accessor, context) {
            const languageService = accessor.get(language_1.ILanguageService);
            const newCell = (0, cellOperations_1.insertCell)(languageService, context.notebookEditor, 0, notebookCommon_1.CellKind.Code, 'above', undefined, true);
            if (!newCell) {
                return;
            }
            await context.notebookEditor.focusNotebookCell(newCell, 'container');
            const ctrl = cellChatController_1.NotebookCellChatController.get(newCell);
            if (!ctrl) {
                return;
            }
            context.notebookEditor.getCellsInRange().forEach(cell => {
                const cellCtrl = cellChatController_1.NotebookCellChatController.get(cell);
                if (cellCtrl) {
                    cellCtrl.dismiss(false);
                }
            });
            ctrl.show();
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookToolbar, {
        command: {
            id: 'notebook.cell.insertCodeCellWithChat',
            icon: codicons_1.Codicon.sparkle,
            title: (0, nls_1.localize)('notebookActions.menu.insertCode.ontoolbar', "Generate"),
            tooltip: (0, nls_1.localize)('notebookActions.menu.insertCode.tooltip', "Generate Code Cell with Chat")
        },
        order: -10,
        group: 'navigation/add',
        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'betweenCells'), contextkey_1.ContextKeyExpr.notEquals('config.notebook.insertToolbarLocation', 'hidden'), inlineChat_1.CTX_INLINE_CHAT_HAS_PROVIDER, contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.cellChat}`, true))
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbENoYXRBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NoYXQvY2VsbENoYXRBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBdUJoRyxJQUFBLHlCQUFlLEVBQUMsS0FBTSxTQUFRLGdDQUFrQjtRQUMvQztZQUNDLEtBQUssQ0FDSjtnQkFDQyxFQUFFLEVBQUUsMkJBQTJCO2dCQUMvQixLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLGNBQWMsQ0FBQztvQkFDNUQsUUFBUSxFQUFFLGNBQWM7aUJBQ3hCO2dCQUNELElBQUksRUFBRSxrQkFBTyxDQUFDLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRTtvQkFDWCxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsbURBQThCLEVBQUUsb0NBQXVCLENBQUM7b0JBQ2pGLE1BQU0sRUFBRSxzQ0FBOEIsQ0FBQztvQkFDdkMsT0FBTyx1QkFBZTtpQkFDdEI7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSx5Q0FBb0I7b0JBQ3hCLEtBQUssRUFBRSxNQUFNO29CQUNiLEtBQUssRUFBRSxDQUFDO29CQUNSLElBQUksRUFBRSx5REFBb0MsQ0FBQyxNQUFNLEVBQUU7aUJBQ25EO2FBQ0QsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBMEIsRUFBRSxPQUFtQztZQUNuRixNQUFNLElBQUksR0FBRywrQ0FBMEIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUks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
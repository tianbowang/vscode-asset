/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/editor/common/core/selection"], function (require, exports, nls_1, actions_1, configuration_1, contextkey_1, codeEditorService_1, coreCommands_1, position_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleColumnSelectionAction = void 0;
    class ToggleColumnSelectionAction extends actions_1.Action2 {
        static { this.ID = 'editor.action.toggleColumnSelection'; }
        constructor() {
            super({
                id: ToggleColumnSelectionAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleColumnSelection', "Toggle Column Selection Mode"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miColumnSelection', comment: ['&& denotes a mnemonic'] }, "Column &&Selection Mode"),
                    original: 'Toggle Column Selection Mode'
                },
                f1: true,
                toggled: contextkey_1.ContextKeyExpr.equals('config.editor.columnSelection', true),
                menu: {
                    id: actions_1.MenuId.MenubarSelectionMenu,
                    group: '4_config',
                    order: 2
                }
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const oldValue = configurationService.getValue('editor.columnSelection');
            const codeEditor = this._getCodeEditor(codeEditorService);
            await configurationService.updateValue('editor.columnSelection', !oldValue);
            const newValue = configurationService.getValue('editor.columnSelection');
            if (!codeEditor || codeEditor !== this._getCodeEditor(codeEditorService) || oldValue === newValue || !codeEditor.hasModel() || typeof oldValue !== 'boolean' || typeof newValue !== 'boolean') {
                return;
            }
            const viewModel = codeEditor._getViewModel();
            if (codeEditor.getOption(22 /* EditorOption.columnSelection */)) {
                const selection = codeEditor.getSelection();
                const modelSelectionStart = new position_1.Position(selection.selectionStartLineNumber, selection.selectionStartColumn);
                const viewSelectionStart = viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelSelectionStart);
                const modelPosition = new position_1.Position(selection.positionLineNumber, selection.positionColumn);
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, {
                    position: modelSelectionStart,
                    viewPosition: viewSelectionStart
                });
                const visibleColumn = viewModel.cursorConfig.visibleColumnFromColumn(viewModel, viewPosition);
                coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
                    position: modelPosition,
                    viewPosition: viewPosition,
                    doColumnSelect: true,
                    mouseColumn: visibleColumn + 1
                });
            }
            else {
                const columnSelectData = viewModel.getCursorColumnSelectData();
                const fromViewColumn = viewModel.cursorConfig.columnFromVisibleColumn(viewModel, columnSelectData.fromViewLineNumber, columnSelectData.fromViewVisualColumn);
                const fromPosition = viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(columnSelectData.fromViewLineNumber, fromViewColumn));
                const toViewColumn = viewModel.cursorConfig.columnFromVisibleColumn(viewModel, columnSelectData.toViewLineNumber, columnSelectData.toViewVisualColumn);
                const toPosition = viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(columnSelectData.toViewLineNumber, toViewColumn));
                codeEditor.setSelection(new selection_1.Selection(fromPosition.lineNumber, fromPosition.column, toPosition.lineNumber, toPosition.column));
            }
        }
        _getCodeEditor(codeEditorService) {
            const codeEditor = codeEditorService.getFocusedCodeEditor();
            if (codeEditor) {
                return codeEditor;
            }
            return codeEditorService.getActiveCodeEditor();
        }
    }
    exports.ToggleColumnSelectionAction = ToggleColumnSelectionAction;
    (0, actions_1.registerAction2)(ToggleColumnSelectionAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlQ29sdW1uU2VsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb2RlRWRpdG9yL2Jyb3dzZXIvdG9nZ2xlQ29sdW1uU2VsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFhLDJCQUE0QixTQUFRLGlCQUFPO2lCQUV2QyxPQUFFLEdBQUcscUNBQXFDLENBQUM7UUFFM0Q7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDJCQUEyQixDQUFDLEVBQUU7Z0JBQ2xDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsdUJBQXVCLEVBQUUsOEJBQThCLENBQUM7b0JBQ3hFLGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUseUJBQXlCLENBQUM7b0JBQ3BILFFBQVEsRUFBRSw4QkFBOEI7aUJBQ3hDO2dCQUNELEVBQUUsRUFBRSxJQUFJO2dCQUNSLE9BQU8sRUFBRSwyQkFBYyxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsRUFBRSxJQUFJLENBQUM7Z0JBQ3JFLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxvQkFBb0I7b0JBQy9CLEtBQUssRUFBRSxVQUFVO29CQUNqQixLQUFLLEVBQUUsQ0FBQztpQkFDUjthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQzVDLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQ0FBa0IsQ0FBQyxD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
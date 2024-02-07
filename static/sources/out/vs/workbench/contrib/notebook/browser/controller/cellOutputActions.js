/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/platform/log/common/log", "vs/workbench/contrib/notebook/browser/contrib/clipboard/cellOutputClipboard", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls_1, actions_1, clipboardService_1, coreActions_1, notebookContextKeys_1, icons, log_1, cellOutputClipboard_1, editorService_1, notebookBrowser_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.COPY_OUTPUT_COMMAND_ID = void 0;
    exports.COPY_OUTPUT_COMMAND_ID = 'notebook.cellOutput.copy';
    (0, actions_1.registerAction2)(class CopyCellOutputAction extends actions_1.Action2 {
        constructor() {
            super({
                id: exports.COPY_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)('notebookActions.copyOutput', "Copy Output"),
                menu: {
                    id: actions_1.MenuId.NotebookOutputToolbar,
                    when: notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS
                },
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                icon: icons.copyIcon,
            });
        }
        async run(accessor, outputContext) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const notebookEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
            if (!notebookEditor) {
                return;
            }
            let outputViewModel;
            if ('outputId' in outputContext && typeof outputContext.outputId === 'string') {
                outputViewModel = getOutputViewModelFromId(outputContext.outputId, notebookEditor);
            }
            else {
                outputViewModel = outputContext.outputViewModel;
            }
            if (!outputViewModel) {
                return;
            }
            const mimeType = outputViewModel.pickedMimeType?.mimeType;
            if (mimeType?.startsWith('image/')) {
                const focusOptions = { skipReveal: true, outputId: outputViewModel.model.outputId, altOutputId: outputViewModel.model.alternativeOutputId };
                await notebookEditor.focusNotebookCell(outputViewModel.cellViewModel, 'output', focusOptions);
                notebookEditor.copyOutputImage(outputViewModel);
            }
            else {
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const logService = accessor.get(log_1.ILogService);
                (0, cellOutputClipboard_1.copyCellOutput)(mimeType, outputViewModel, clipboardService, logService);
            }
        }
    });
    function getOutputViewModelFromId(outputId, notebookEditor) {
        const notebookViewModel = notebookEditor.getViewModel();
        if (notebookViewModel) {
            const codeCells = notebookViewModel.viewCells.filter(cell => cell.cellKind === notebookCommon_1.CellKind.Code);
            for (const cell of codeCells) {
                const output = cell.outputsViewModels.find(output => output.model.outputId === outputId);
                if (output) {
                    return output;
                }
            }
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbE91dHB1dEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJvbGxlci9jZWxsT3V0cHV0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQm5GLFFBQUEsc0JBQXNCLEdBQUcsMEJBQTBCLENBQUM7SUFFakUsSUFBQSx5QkFBZSxFQUFDLE1BQU0sb0JBQXFCLFNBQVEsaUJBQU87UUFDekQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDhCQUFzQjtnQkFDMUIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDRCQUE0QixFQUFFLGFBQWEsQ0FBQztnQkFDNUQsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLHFCQUFxQjtvQkFDaEMsSUFBSSxFQUFFLCtDQUF5QjtpQkFDL0I7Z0JBQ0QsUUFBUSxFQUFFLHVDQUF5QjtnQkFDbkMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRO2FBQ3BCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsYUFBdUY7WUFDNUgsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxjQUFjLEdBQUcsSUFBQSxpREFBK0IsRUFBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUV2RixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3JCLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxlQUFpRCxDQUFDO1lBQ3RELElBQUksVUFBVSxJQUFJLGFBQWEsSUFBSSxPQUFPLGFBQWEsQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQy9FLGVBQWUsR0FBRyx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3BGLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxlQUFlLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQztZQUNqRCxDQUFDO1lBRUQsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN0QixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDO1lBRTFELElBQUksUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLFlBQVksR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLGVBQWUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQzVJLE1BQU0sY0FBYyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxhQUErQixFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDaEgsY0FBYyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNqRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7Z0JBQ3pELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQVcsQ0FBQyxDQUFDO2dCQUU3QyxJQUFBLG9DQUFjLEVBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN6RSxDQUFDO1FBQ0YsQ0FBQztLQUVELENBQUMsQ0FBQztJQUVILFNBQVMsd0JBQXdCLENBQUMsUUFBZ0IsRUFBRSxjQUErQjtRQUNsRixNQUFNLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4RCxJQUFJLGlCQUFpQixFQUFFLENBQUM7WUFDdkIsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUsseUJBQVEsQ0FBQyxJQUFJLENBQXdCLENBQUM7WUFDckgsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RixJQUFJLE1BQU0sRUFBRSxDQUFDO29CQUNaLE9BQU8sTUFBTSxDQUFDO2dCQUNmLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUMifQ==
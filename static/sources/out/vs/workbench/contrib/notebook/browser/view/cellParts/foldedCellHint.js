/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/codicons", "vs/base/common/themables", "vs/nls", "vs/workbench/contrib/notebook/browser/controller/foldingController", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, codicons_1, themables_1, nls_1, foldingController_1, notebookBrowser_1, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FoldedCellHint = void 0;
    class FoldedCellHint extends cellPart_1.CellContentPart {
        constructor(_notebookEditor, _container) {
            super();
            this._notebookEditor = _notebookEditor;
            this._container = _container;
        }
        didRenderCell(element) {
            this.update(element);
        }
        update(element) {
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            if (element.isInputCollapsed || element.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                DOM.hide(this._container);
            }
            else if (element.foldingState === 2 /* CellFoldingState.Collapsed */) {
                const idx = this._notebookEditor.getViewModel().getCellIndex(element);
                const length = this._notebookEditor.getViewModel().getFoldedLength(idx);
                DOM.reset(this._container, this.getHiddenCellsLabel(length), this.getHiddenCellHintButton(element));
                DOM.show(this._container);
                const foldHintTop = element.layoutInfo.previewHeight;
                this._container.style.top = `${foldHintTop}px`;
            }
            else {
                DOM.hide(this._container);
            }
        }
        getHiddenCellsLabel(num) {
            const label = num === 1 ?
                (0, nls_1.localize)('hiddenCellsLabel', "1 cell hidden") :
                (0, nls_1.localize)('hiddenCellsLabelPlural', "{0} cells hidden", num);
            return DOM.$('span.notebook-folded-hint-label', undefined, label);
        }
        getHiddenCellHintButton(element) {
            const expandIcon = DOM.$('span.cell-expand-part-button');
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.more));
            this._register(DOM.addDisposableListener(expandIcon, DOM.EventType.CLICK, () => {
                const controller = this._notebookEditor.getContribution(foldingController_1.FoldingController.id);
                const idx = this._notebookEditor.getCellIndex(element);
                if (typeof idx === 'number') {
                    controller.setFoldingStateDown(idx, 1 /* CellFoldingState.Expanded */, 1);
                }
            }));
            return expandIcon;
        }
        updateInternalLayoutNow(element) {
            this.update(element);
        }
    }
    exports.FoldedCellHint = FoldedCellHint;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVkQ2VsbEhpbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9jZWxsUGFydHMvZm9sZGVkQ2VsbEhpbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEsY0FBZSxTQUFRLDBCQUFlO1FBRWxELFlBQ2tCLGVBQWdDLEVBQ2hDLFVBQXVCO1lBRXhDLEtBQUssRUFBRSxDQUFDO1lBSFMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ2hDLGVBQVUsR0FBVixVQUFVLENBQWE7UUFHekMsQ0FBQztRQUVRLGFBQWEsQ0FBQyxPQUE0QjtZQUNsRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFTyxNQUFNLENBQUMsT0FBNEI7WUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztnQkFDdEMsT0FBTztZQUNSLENBQUM7WUFFRCxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssK0JBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEYsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0IsQ0FBQztpQkFBTSxJQUFJLE9BQU8sQ0FBQyxZQUFZLHVDQUErQixFQUFFLENBQUM7Z0JBQ2hFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDcEcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRTFCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO2dCQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxXQUFXLElBQUksQ0FBQztZQUNoRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0IsQ0FBQztRQUNGLENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxHQUFXO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDL0MsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFN0QsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlDQUFpQyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRU8sdUJBQXVCLENBQUMsT0FBNEI7WUFDM0QsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQ3pELFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcscUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDOUUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQW9CLHFDQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDN0IsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEdBQUcscUNBQTZCLENBQUMsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFFUSx1QkFBdUIsQ0FBQyxPQUE0QjtZQUM1RCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLENBQUM7S0FDRDtJQTFERCx3Q0EwREMifQ==
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, lifecycle_1, contextkey_1, instantiation_1, notebookBrowser_1, cellPart_1, codeCellViewModel_1, markupCellViewModel_1, notebookCommon_1, notebookContextKeys_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellContextKeyManager = exports.CellContextKeyPart = void 0;
    let CellContextKeyPart = class CellContextKeyPart extends cellPart_1.CellContentPart {
        constructor(notebookEditor, instantiationService) {
            super();
            this.instantiationService = instantiationService;
            this.cellContextKeyManager = this._register(this.instantiationService.createInstance(CellContextKeyManager, notebookEditor, undefined));
        }
        didRenderCell(element) {
            this.cellContextKeyManager.updateForElement(element);
        }
    };
    exports.CellContextKeyPart = CellContextKeyPart;
    exports.CellContextKeyPart = CellContextKeyPart = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], CellContextKeyPart);
    let CellContextKeyManager = class CellContextKeyManager extends lifecycle_1.Disposable {
        constructor(notebookEditor, element, _contextKeyService, _notebookExecutionStateService) {
            super();
            this.notebookEditor = notebookEditor;
            this.element = element;
            this._contextKeyService = _contextKeyService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this.elementDisposables = this._register(new lifecycle_1.DisposableStore());
            this._contextKeyService.bufferChangeEvents(() => {
                this.cellType = notebookContextKeys_1.NOTEBOOK_CELL_TYPE.bindTo(this._contextKeyService);
                this.cellEditable = notebookContextKeys_1.NOTEBOOK_CELL_EDITABLE.bindTo(this._contextKeyService);
                this.cellFocused = notebookContextKeys_1.NOTEBOOK_CELL_FOCUSED.bindTo(this._contextKeyService);
                this.cellEditorFocused = notebookContextKeys_1.NOTEBOOK_CELL_EDITOR_FOCUSED.bindTo(this._contextKeyService);
                this.markdownEditMode = notebookContextKeys_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.bindTo(this._contextKeyService);
                this.cellRunState = notebookContextKeys_1.NOTEBOOK_CELL_EXECUTION_STATE.bindTo(this._contextKeyService);
                this.cellExecuting = notebookContextKeys_1.NOTEBOOK_CELL_EXECUTING.bindTo(this._contextKeyService);
                this.cellHasOutputs = notebookContextKeys_1.NOTEBOOK_CELL_HAS_OUTPUTS.bindTo(this._contextKeyService);
                this.cellContentCollapsed = notebookContextKeys_1.NOTEBOOK_CELL_INPUT_COLLAPSED.bindTo(this._contextKeyService);
                this.cellOutputCollapsed = notebookContextKeys_1.NOTEBOOK_CELL_OUTPUT_COLLAPSED.bindTo(this._contextKeyService);
                this.cellLineNumbers = notebookContextKeys_1.NOTEBOOK_CELL_LINE_NUMBERS.bindTo(this._contextKeyService);
                this.cellResource = notebookContextKeys_1.NOTEBOOK_CELL_RESOURCE.bindTo(this._contextKeyService);
                if (element) {
                    this.updateForElement(element);
                }
            });
            this._register(this._notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && this.element && e.affectsCell(this.element.uri)) {
                    this.updateForExecutionState();
                }
            }));
        }
        updateForElement(element) {
            this.elementDisposables.clear();
            this.element = element;
            if (!element) {
                return;
            }
            this.elementDisposables.add(element.onDidChangeState(e => this.onDidChangeState(e)));
            if (element instanceof codeCellViewModel_1.CodeCellViewModel) {
                this.elementDisposables.add(element.onDidChangeOutputs(() => this.updateForOutputs()));
            }
            this.elementDisposables.add(this.notebookEditor.onDidChangeActiveCell(() => this.updateForFocusState()));
            if (this.element instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this.cellType.set('markup');
            }
            else if (this.element instanceof codeCellViewModel_1.CodeCellViewModel) {
                this.cellType.set('code');
            }
            this._contextKeyService.bufferChangeEvents(() => {
                this.updateForFocusState();
                this.updateForExecutionState();
                this.updateForEditState();
                this.updateForCollapseState();
                this.updateForOutputs();
                this.cellLineNumbers.set(this.element.lineNumbers);
                this.cellResource.set(this.element.uri.toString());
            });
        }
        onDidChangeState(e) {
            this._contextKeyService.bufferChangeEvents(() => {
                if (e.internalMetadataChanged) {
                    this.updateForExecutionState();
                }
                if (e.editStateChanged) {
                    this.updateForEditState();
                }
                if (e.focusModeChanged) {
                    this.updateForFocusState();
                }
                if (e.cellLineNumberChanged) {
                    this.cellLineNumbers.set(this.element.lineNumbers);
                }
                if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
                    this.updateForCollapseState();
                }
            });
        }
        updateForFocusState() {
            if (!this.element) {
                return;
            }
            const activeCell = this.notebookEditor.getActiveCell();
            this.cellFocused.set(this.notebookEditor.getActiveCell() === this.element);
            if (activeCell === this.element) {
                this.cellEditorFocused.set(this.element.focusMode === notebookBrowser_1.CellFocusMode.Editor);
            }
            else {
                this.cellEditorFocused.set(false);
            }
        }
        updateForExecutionState() {
            if (!this.element) {
                return;
            }
            const internalMetadata = this.element.internalMetadata;
            this.cellEditable.set(!this.notebookEditor.isReadOnly);
            const exeState = this._notebookExecutionStateService.getCellExecution(this.element.uri);
            if (this.element instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this.cellRunState.reset();
                this.cellExecuting.reset();
            }
            else if (exeState?.state === notebookCommon_1.NotebookCellExecutionState.Executing) {
                this.cellRunState.set('executing');
                this.cellExecuting.set(true);
            }
            else if (exeState?.state === notebookCommon_1.NotebookCellExecutionState.Pending || exeState?.state === notebookCommon_1.NotebookCellExecutionState.Unconfirmed) {
                this.cellRunState.set('pending');
                this.cellExecuting.set(true);
            }
            else if (internalMetadata.lastRunSuccess === true) {
                this.cellRunState.set('succeeded');
                this.cellExecuting.set(false);
            }
            else if (internalMetadata.lastRunSuccess === false) {
                this.cellRunState.set('failed');
                this.cellExecuting.set(false);
            }
            else {
                this.cellRunState.set('idle');
                this.cellExecuting.set(false);
            }
        }
        updateForEditState() {
            if (!this.element) {
                return;
            }
            if (this.element instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this.markdownEditMode.set(this.element.getEditState() === notebookBrowser_1.CellEditState.Editing);
            }
            else {
                this.markdownEditMode.set(false);
            }
        }
        updateForCollapseState() {
            if (!this.element) {
                return;
            }
            this.cellContentCollapsed.set(!!this.element.isInputCollapsed);
            this.cellOutputCollapsed.set(!!this.element.isOutputCollapsed);
        }
        updateForOutputs() {
            if (this.element instanceof codeCellViewModel_1.CodeCellViewModel) {
                this.cellHasOutputs.set(this.element.outputsViewModels.length > 0);
            }
            else {
                this.cellHasOutputs.set(false);
            }
        }
    };
    exports.CellContextKeyManager = CellContextKeyManager;
    exports.CellContextKeyManager = CellContextKeyManager = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], CellContextKeyManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbENvbnRleHRLZXlzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NlbGxDb250ZXh0S2V5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSwwQkFBZTtRQUd0RCxZQUNDLGNBQXVDLEVBQ0Msb0JBQTJDO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBRmdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFJbkYsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsRUFBRSxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN6SSxDQUFDO1FBRVEsYUFBYSxDQUFDLE9BQXVCO1lBQzdDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQ0QsQ0FBQTtJQWZZLGdEQUFrQjtpQ0FBbEIsa0JBQWtCO1FBSzVCLFdBQUEscUNBQXFCLENBQUE7T0FMWCxrQkFBa0IsQ0FlOUI7SUFFTSxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHNCQUFVO1FBa0JwRCxZQUNrQixjQUF1QyxFQUNoRCxPQUFtQyxFQUN2QixrQkFBdUQsRUFDM0MsOEJBQStFO1lBRS9HLEtBQUssRUFBRSxDQUFDO1lBTFMsbUJBQWMsR0FBZCxjQUFjLENBQXlCO1lBQ2hELFlBQU8sR0FBUCxPQUFPLENBQTRCO1lBQ04sdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUMxQixtQ0FBOEIsR0FBOUIsOEJBQThCLENBQWdD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
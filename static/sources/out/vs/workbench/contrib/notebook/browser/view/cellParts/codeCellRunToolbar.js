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
define(["require", "exports", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkeys", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbarStickyScroll", "vs/workbench/contrib/notebook/common/notebookContextKeys"], function (require, exports, toolbar_1, actions_1, lifecycle_1, editorContextKeys_1, nls_1, dropdownWithPrimaryActionViewItem_1, menuEntryActionViewItem_1, actions_2, contextkeys_1, contextView_1, instantiation_1, keybinding_1, cellPart_1, cellToolbarStickyScroll_1, notebookContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCodeCellExecutionContextKeyService = exports.RunToolbar = void 0;
    let RunToolbar = class RunToolbar extends cellPart_1.CellContentPart {
        constructor(notebookEditor, contextKeyService, cellContainer, runButtonContainer, menuService, keybindingService, contextMenuService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.contextKeyService = contextKeyService;
            this.cellContainer = cellContainer;
            this.runButtonContainer = runButtonContainer;
            this.keybindingService = keybindingService;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.primaryMenu = this._register(menuService.createMenu(this.notebookEditor.creationOptions.menuIds.cellExecutePrimary, contextKeyService));
            this.secondaryMenu = this._register(menuService.createMenu(this.notebookEditor.creationOptions.menuIds.cellExecuteToolbar, contextKeyService));
            this.createRunCellToolbar(runButtonContainer, cellContainer, contextKeyService);
            const updateActions = () => {
                const actions = this.getCellToolbarActions(this.primaryMenu);
                const primary = actions.primary[0]; // Only allow one primary action
                this.toolbar.setActions(primary ? [primary] : []);
            };
            updateActions();
            this._register(this.primaryMenu.onDidChange(updateActions));
            this._register(this.secondaryMenu.onDidChange(updateActions));
            this._register(this.notebookEditor.notebookOptions.onDidChangeOptions(updateActions));
        }
        didRenderCell(element) {
            this.cellDisposables.add((0, cellToolbarStickyScroll_1.registerCellToolbarStickyScroll)(this.notebookEditor, element, this.runButtonContainer));
            this.toolbar.context = {
                ui: true,
                cell: element,
                notebookEditor: this.notebookEditor,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            };
        }
        getCellToolbarActions(menu) {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
            return result;
        }
        createRunCellToolbar(container, cellContainer, contextKeyService) {
            const actionViewItemDisposables = this._register(new lifecycle_1.DisposableStore());
            const dropdownAction = this._register(new actions_1.Action('notebook.moreRunActions', (0, nls_1.localize)('notebook.moreRunActionsLabel', "More..."), 'codicon-chevron-down', true));
            const keybindingProvider = (action) => this.keybindingService.lookupKeybinding(action.id, executionContextKeyService);
            const executionContextKeyService = this._register(getCodeCellExecutionContextKeyService(contextKeyService));
            this.toolbar = this._register(new toolbar_1.ToolBar(container, this.contextMenuService, {
                getKeyBinding: keybindingProvider,
                actionViewItemProvider: _action => {
                    actionViewItemDisposables.clear();
                    const primary = this.getCellToolbarActions(this.primaryMenu).primary[0];
                    if (!(primary instanceof actions_2.MenuItemAction)) {
                        return undefined;
                    }
                    const secondary = this.getCellToolbarActions(this.secondaryMenu).secondary;
                    if (!secondary.length) {
                        return undefined;
                    }
                    const item = this.instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem, primary, dropdownAction, secondary, 'notebook-cell-run-toolbar', this.contextMenuService, {
                        getKeyBinding: keybindingProvider
                    });
                    actionViewItemDisposables.add(item.onDidChangeDropdownVisibility(visible => {
                        cellContainer.classList.toggle('cell-run-toolbar-dropdown-active', visible);
                    }));
                    return item;
                },
                renderDropdownAsChildElement: true
            }));
        }
    };
    exports.RunToolbar = RunToolbar;
    exports.RunToolbar = RunToolbar = __decorate([
        __param(4, actions_2.IMenuService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, instantiation_1.IInstantiationService)
    ], RunToolbar);
    function getCodeCellExecutionContextKeyService(contextKeyService) {
        // Create a fake ContextKeyService, and look up the keybindings within this context.
        const executionContextKeyService = contextKeyService.createScoped(document.createElement('div'));
        contextkeys_1.InputFocusedContext.bindTo(executionContextKeyService).set(true);
        editorContextKeys_1.EditorContextKeys.editorTextFocus.bindTo(executionContextKeyService).set(true);
        editorContextKeys_1.EditorContextKeys.focus.bindTo(executionContextKeyService).set(true);
        editorContextKeys_1.EditorContextKeys.textInputFocus.bindTo(executionContextKeyService).set(true);
        notebookContextKeys_1.NOTEBOOK_CELL_EXECUTION_STATE.bindTo(executionContextKeyService).set('idle');
        notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED.bindTo(executionContextKeyService).set(true);
        notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED.bindTo(executionContextKeyService).set(true);
        notebookContextKeys_1.NOTEBOOK_CELL_TYPE.bindTo(executionContextKeyService).set('code');
        return executionContextKeyService;
    }
    exports.getCodeCellExecutionContextKeyService = getCodeCellExecutionContextKeyService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUNlbGxSdW5Ub29sYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NvZGVDZWxsUnVuVG9vbGJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQnpGLElBQU0sVUFBVSxHQUFoQixNQUFNLFVBQVcsU0FBUSwwQkFBZTtRQU05QyxZQUNVLGNBQXVDLEVBQ3ZDLGlCQUFxQyxFQUNyQyxhQUEwQixFQUMxQixrQkFBK0IsRUFDMUIsV0FBeUIsRUFDRixpQkFBcUMsRUFDcEMsa0JBQXVDLEVBQ3JDLG9CQUEyQztZQUVuRixLQUFLLEVBQUUsQ0FBQztZQVRDLG1CQUFjLEdBQWQsY0FBYyxDQUF5QjtZQUN2QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ3JDLGtCQUFhLEdBQWIsYUFBYSxDQUFhO1lBQzFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBYTtZQUVILHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDcEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUNyQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBSW5GLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxrQkFBbUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDOUksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FB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
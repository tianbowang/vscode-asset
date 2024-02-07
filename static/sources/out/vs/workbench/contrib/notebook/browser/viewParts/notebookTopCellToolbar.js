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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView"], function (require, exports, DOM, lifecycle_1, toolbar_1, actions_1, contextView_1, instantiation_1, cellActionView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListTopCellToolbar = void 0;
    let ListTopCellToolbar = class ListTopCellToolbar extends lifecycle_1.Disposable {
        constructor(notebookEditor, contextKeyService, insertionIndicatorContainer, instantiationService, contextMenuService, menuService) {
            super();
            this.notebookEditor = notebookEditor;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.menuService = menuService;
            this._modelDisposables = this._register(new lifecycle_1.DisposableStore());
            this.topCellToolbar = DOM.append(insertionIndicatorContainer, DOM.$('.cell-list-top-cell-toolbar-container'));
            this.toolbar = this._register(instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this.topCellToolbar, this.notebookEditor.creationOptions.menuIds.cellTopInsertToolbar, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.MenuItemAction) {
                        const item = this.instantiationService.createInstance(cellActionView_1.CodiconActionViewItem, action, undefined);
                        return item;
                    }
                    return undefined;
                },
                menuOptions: {
                    shouldForwardArgs: true
                },
                toolbarOptions: {
                    primaryGroup: (g) => /^inline/.test(g),
                },
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
            }));
            this.toolbar.context = {
                notebookEditor
            };
            // update toolbar container css based on cell list length
            this._register(this.notebookEditor.onDidChangeModel(() => {
                this._modelDisposables.clear();
                if (this.notebookEditor.hasModel()) {
                    this._modelDisposables.add(this.notebookEditor.onDidChangeViewCells(() => {
                        this.updateClass();
                    }));
                    this.updateClass();
                }
            }));
            this.updateClass();
        }
        updateClass() {
            if (this.notebookEditor.hasModel() && this.notebookEditor.getLength() === 0) {
                this.topCellToolbar.classList.add('emptyNotebook');
            }
            else {
                this.topCellToolbar.classList.remove('emptyNotebook');
            }
        }
    };
    exports.ListTopCellToolbar = ListTopCellToolbar;
    exports.ListTopCellToolbar = ListTopCellToolbar = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, actions_1.IMenuService)
    ], ListTopCellToolbar);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tUb3BDZWxsVG9vbGJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3UGFydHMvbm90ZWJvb2tUb3BDZWxsVG9vbGJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQUlqRCxZQUNvQixjQUF1QyxFQUUxRCxpQkFBcUMsRUFDckMsMkJBQXdDLEVBQ2pCLG9CQUE4RCxFQUNoRSxrQkFBMEQsRUFDakUsV0FBNEM7WUFFMUQsS0FBSyxFQUFFLENBQUM7WUFSVyxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7WUFJaEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM3Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQzlDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBUjFDLHNCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQVkxRSxJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUM7WUFFOUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw4QkFBb0IsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRTtnQkFDOUssc0JBQXNCLEVBQUUsTUFBTSxDQUFDLEVBQUU7b0JBQ2hDLElBQUksTUFBTSxZQUFZLHdCQUFjLEVBQUUsQ0FBQzt3QkFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxzQ0FBcUIsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQ2hHLE9BQU8sSUFBSSxDQUFDO29CQUNiLENBQUM7b0JBRUQsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUM7Z0JBQ0QsV0FBVyxFQUFFO29CQUNaLGlCQUFpQixFQUFFLElBQUk7aUJBQ3ZCO2dCQUNELGNBQWMsRUFBRTtvQkFDZixZQUFZLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUM5QztnQkFDRCxrQkFBa0IsbUNBQTJCO2FBQzdDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQTJCO2dCQUM5QyxjQUFjO2FBQ2QsQ0FBQztZQUVGLHlEQUF5RDtZQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFO2dCQUN4RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRS9CLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO29CQUNwQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFO3dCQUN4RSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ3BCLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRUosSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRU8sV0FBVztZQUNsQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3BELENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdkQsQ0FBQztRQUNGLENBQUM7S0FDRCxDQUFBO0lBOURZLGdEQUFrQjtpQ0FBbEIsa0JBQWtCO1FBUzVCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLHNCQUFZLENBQUE7T0FYRixrQkFBa0IsQ0E4RDlCIn0=
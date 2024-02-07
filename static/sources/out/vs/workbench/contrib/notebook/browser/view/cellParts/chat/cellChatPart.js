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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/view/cellParts/chat/cellChatController", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/view/cellParts/chat/cellChatActions"], function (require, exports, instantiation_1, cellPart_1, cellChatController_1, configuration_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellChatPart = void 0;
    let CellChatPart = class CellChatPart extends cellPart_1.CellContentPart {
        get activeCell() {
            return this.currentCell;
        }
        constructor(_notebookEditor, _partContainer, _instantiationService, _configurationService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._partContainer = _partContainer;
            this._instantiationService = _instantiationService;
            this._configurationService = _configurationService;
        }
        didRenderCell(element) {
            this._controller?.dispose();
            const enabled = this._configurationService.getValue(notebookCommon_1.NotebookSetting.cellChat);
            if (enabled) {
                this._controller = this._instantiationService.createInstance(cellChatController_1.NotebookCellChatController, this._notebookEditor, this, element, this._partContainer);
            }
            super.didRenderCell(element);
        }
        unrenderCell(element) {
            this._controller?.dispose();
            this._controller = undefined;
            super.unrenderCell(element);
        }
        updateInternalLayoutNow(element) {
            this._controller?.layout();
        }
        dispose() {
            this._controller?.dispose();
            this._controller = undefined;
            super.dispose();
        }
    };
    exports.CellChatPart = CellChatPart;
    exports.CellChatPart = CellChatPart = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, configuration_1.IConfigurationService)
    ], CellChatPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbENoYXRQYXJ0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NoYXQvY2VsbENoYXRQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVd6RixJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsMEJBQWU7UUFHaEQsSUFBSSxVQUFVO1lBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxZQUNrQixlQUF3QyxFQUN4QyxjQUEyQixFQUNKLHFCQUE0QyxFQUM1QyxxQkFBNEM7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFMUyxvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7WUFDeEMsbUJBQWMsR0FBZCxjQUFjLENBQWE7WUFDSiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzVDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFHckYsQ0FBQztRQUVRLGFBQWEsQ0FBQyxPQUF1QjtZQUM3QyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQVUsZ0NBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RixJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQywrQ0FBMEIsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BKLENBQUM7WUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFUSxZQUFZLENBQUMsT0FBdUI7WUFDNUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztZQUM3QixLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFUSx1QkFBdUIsQ0FBQyxPQUF1QjtZQUN2RCxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztZQUM3QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztLQUNELENBQUE7SUF6Q1ksb0NBQVk7MkJBQVosWUFBWTtRQVV0QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEscUNBQXFCLENBQUE7T0FYWCxZQUFZLENBeUN4QiJ9
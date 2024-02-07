/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/memento", "vs/platform/theme/common/themeService"], function (require, exports, memento_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Component = void 0;
    class Component extends themeService_1.Themable {
        constructor(id, themeService, storageService) {
            super(themeService);
            this.id = id;
            this.id = id;
            this.memento = new memento_1.Memento(this.id, storageService);
            this._register(storageService.onWillSaveState(() => {
                // Ask the component to persist state into the memento
                this.saveState();
                // Then save the memento into storage
                this.memento.saveMemento();
            }));
        }
        getId() {
            return this.id;
        }
        getMemento(scope, target) {
            return this.memento.getMemento(scope, target);
        }
        reloadMemento(scope) {
            return this.memento.reloadMemento(scope);
        }
        onDidChangeMementoValue(scope, disposables) {
            return this.memento.onDidChangeValue(scope, disposables);
        }
        saveState() {
            // Subclasses to implement for storing state
        }
    }
    exports.Component = Component;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29tbW9uL2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSxTQUFVLFNBQVEsdUJBQVE7UUFJdEMsWUFDa0IsRUFBVSxFQUMzQixZQUEyQixFQUMzQixjQUErQjtZQUUvQixLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFKSCxPQUFFLEdBQUYsRUFBRSxDQUFRO1lBTTNCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUVwRCxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFO2dCQUVsRCxzREFBc0Q7Z0JBQ3RELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFFakIscUNBQXFDO2dCQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsS0FBSztZQUNKLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBRVMsVUFBVSxDQUFDLEtBQW1CLEVBQUUsTUFBcUI7WUFDOUQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVTLGFBQWEsQ0FBQyxLQUFtQjtZQUMxQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFUyx1QkFBdUIsQ0FBQyxLQUFtQixFQUFFLFdBQTRCO1lBQ2xGLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVTLFNBQVM7WUFDbEIsNENBQTRDO1FBQzdDLENBQUM7S0FDRDtJQTNDRCw4QkEyQ0MifQ==
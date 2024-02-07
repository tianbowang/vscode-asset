/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellMetadataEdit = exports.SpliceCellsEdit = exports.MoveCellEdit = void 0;
    class MoveCellEdit {
        constructor(resource, fromIndex, length, toIndex, editingDelegate, beforedSelections, endSelections) {
            this.resource = resource;
            this.fromIndex = fromIndex;
            this.length = length;
            this.toIndex = toIndex;
            this.editingDelegate = editingDelegate;
            this.beforedSelections = beforedSelections;
            this.endSelections = endSelections;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Move Cell';
            this.code = 'undoredo.notebooks.moveCell';
        }
        undo() {
            if (!this.editingDelegate.moveCell) {
                throw new Error('Notebook Move Cell not implemented for Undo/Redo');
            }
            this.editingDelegate.moveCell(this.toIndex, this.length, this.fromIndex, this.endSelections, this.beforedSelections);
        }
        redo() {
            if (!this.editingDelegate.moveCell) {
                throw new Error('Notebook Move Cell not implemented for Undo/Redo');
            }
            this.editingDelegate.moveCell(this.fromIndex, this.length, this.toIndex, this.beforedSelections, this.endSelections);
        }
    }
    exports.MoveCellEdit = MoveCellEdit;
    class SpliceCellsEdit {
        constructor(resource, diffs, editingDelegate, beforeHandles, endHandles) {
            this.resource = resource;
            this.diffs = diffs;
            this.editingDelegate = editingDelegate;
            this.beforeHandles = beforeHandles;
            this.endHandles = endHandles;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Insert Cell';
            this.code = 'undoredo.notebooks.insertCell';
        }
        undo() {
            if (!this.editingDelegate.replaceCell) {
                throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
            }
            this.diffs.forEach(diff => {
                this.editingDelegate.replaceCell(diff[0], diff[2].length, diff[1], this.beforeHandles);
            });
        }
        redo() {
            if (!this.editingDelegate.replaceCell) {
                throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
            }
            this.diffs.reverse().forEach(diff => {
                this.editingDelegate.replaceCell(diff[0], diff[1].length, diff[2], this.endHandles);
            });
        }
    }
    exports.SpliceCellsEdit = SpliceCellsEdit;
    class CellMetadataEdit {
        constructor(resource, index, oldMetadata, newMetadata, editingDelegate) {
            this.resource = resource;
            this.index = index;
            this.oldMetadata = oldMetadata;
            this.newMetadata = newMetadata;
            this.editingDelegate = editingDelegate;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Update Cell Metadata';
            this.code = 'undoredo.notebooks.updateCellMetadata';
        }
        undo() {
            if (!this.editingDelegate.updateCellMetadata) {
                return;
            }
            this.editingDelegate.updateCellMetadata(this.index, this.oldMetadata);
        }
        redo() {
            if (!this.editingDelegate.updateCellMetadata) {
                return;
            }
            this.editingDelegate.updateCellMetadata(this.index, this.newMetadata);
        }
    }
    exports.CellMetadataEdit = CellMetadataEdit;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEVkaXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2NvbW1vbi9tb2RlbC9jZWxsRWRpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQWEsWUFBWTtRQUt4QixZQUNRLFFBQWEsRUFDWixTQUFpQixFQUNqQixNQUFjLEVBQ2QsT0FBZSxFQUNmLGVBQXlDLEVBQ3pDLGlCQUE4QyxFQUM5QyxhQUEwQztZQU4zQyxhQUFRLEdBQVIsUUFBUSxDQUFLO1lBQ1osY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNqQixXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLG9CQUFlLEdBQWYsZUFBZSxDQUEwQjtZQUN6QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQTZCO1lBQzlDLGtCQUFhLEdBQWIsYUFBYSxDQUE2QjtZQVhuRCxTQUFJLHdDQUE4RDtZQUNsRSxVQUFLLEdBQVcsV0FBVyxDQUFDO1lBQzVCLFNBQUksR0FBVyw2QkFBNkIsQ0FBQztRQVc3QyxDQUFDO1FBRUQsSUFBSTtZQUNILElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUVELElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdEgsQ0FBQztRQUVELElBQUk7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7WUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3RILENBQUM7S0FDRDtJQS9CRCxvQ0ErQkM7SUFFRCxNQUFhLGVBQWU7UUFJM0IsWUFDUSxRQUFhLEVBQ1osS0FBbUUsRUFDbkUsZUFBeUMsRUFDekMsYUFBMEMsRUFDMUMsVUFBdUM7WUFKeEMsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNaLFVBQUssR0FBTCxLQUFLLENBQThEO1lBQ25FLG9CQUFlLEdBQWYsZUFBZSxDQUEwQjtZQUN6QyxrQkFBYSxHQUFiLGFBQWEsQ0FBNkI7WUFDMUMsZUFBVSxHQUFWLFVBQVUsQ0FBNkI7WUFSaEQsU0FBSSx3Q0FBOEQ7WUFDbEUsVUFBSyxHQUFXLGFBQWEsQ0FBQztZQUM5QixTQUFJLEdBQVcsK0JBQStCLENBQUM7UUFRL0MsQ0FBQztRQUVELElBQUk7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO1lBQ3hFLENBQUM7WUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN6RixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQztZQUN4RSxDQUFDO1lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEYsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFoQ0QsMENBZ0NDO0lBRUQsTUFBYSxnQkFBZ0I7UUFJNUIsWUFDUSxRQUFhLEVBQ1gsS0FBYSxFQUNiLFdBQWlDLEVBQ2pDLFdBQWlDLEVBQ2xDLGVBQXlDO1lBSjFDLGFBQVEsR0FBUixRQUFRLENBQUs7WUFDWCxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsZ0JBQVcsR0FBWCxXQUFXLENBQXNCO1lBQ2pDLGdCQUFXLEdBQVgsV0FBVyxDQUFzQjtZQUNsQyxvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7WUFSbEQsU0FBSSx3Q0FBOEQ7WUFDbEUsVUFBSyxHQUFXLHNCQUFzQixDQUFDO1lBQ3ZDLFNBQUksR0FBVyx1Q0FBdUMsQ0FBQztRQVN2RCxDQUFDO1FBRUQsSUFBSTtZQUNILElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzlDLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRUQsSUFBSTtZQUNILElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzlDLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RSxDQUFDO0tBQ0Q7SUE3QkQsNENBNkJDIn0=
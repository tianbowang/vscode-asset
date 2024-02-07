/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/list/listView"], function (require, exports, listView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellListView = void 0;
    class NotebookCellListView extends listView_1.ListView {
        constructor() {
            super(...arguments);
            this._renderingStack = 0;
        }
        get inRenderingTransaction() {
            return this._renderingStack > 0;
        }
        render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM) {
            this._renderingStack++;
            super.render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM);
            this._renderingStack--;
        }
        _rerender(renderTop, renderHeight, inSmoothScrolling) {
            this._renderingStack++;
            super._rerender(renderTop, renderHeight, inSmoothScrolling);
            this._renderingStack--;
        }
    }
    exports.NotebookCellListView = NotebookCellListView;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDZWxsTGlzdFZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9ub3RlYm9va0NlbGxMaXN0Vmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBYSxvQkFBd0IsU0FBUSxtQkFBVztRQUF4RDs7WUFDUyxvQkFBZSxHQUFHLENBQUMsQ0FBQztRQWlCN0IsQ0FBQztRQWZBLElBQUksc0JBQXNCO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVrQixNQUFNLENBQUMsbUJBQTJCLEVBQUUsU0FBaUIsRUFBRSxZQUFvQixFQUFFLFVBQThCLEVBQUUsV0FBK0IsRUFBRSxnQkFBMEI7WUFDMUwsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDdEcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFa0IsU0FBUyxDQUFDLFNBQWlCLEVBQUUsWUFBb0IsRUFBRSxpQkFBdUM7WUFDNUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixDQUFDO0tBQ0Q7SUFsQkQsb0RBa0JDIn0=
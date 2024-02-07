/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/dom", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, iconLabels_1, DOM, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionViewWithLabel = exports.CodiconActionViewItem = void 0;
    class CodiconActionViewItem extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        updateLabel() {
            if (this.options.label && this.label) {
                DOM.reset(this.label, ...(0, iconLabels_1.renderLabelWithIcons)(this._commandAction.label ?? ''));
            }
        }
    }
    exports.CodiconActionViewItem = CodiconActionViewItem;
    class ActionViewWithLabel extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        render(container) {
            super.render(container);
            container.classList.add('notebook-action-view-item');
            this._actionLabel = document.createElement('a');
            container.appendChild(this._actionLabel);
            this.updateLabel();
        }
        updateLabel() {
            if (this._actionLabel) {
                this._actionLabel.classList.add('notebook-label');
                this._actionLabel.innerText = this._action.label;
                this._actionLabel.title = this._action.tooltip.length ? this._action.tooltip : this._action.label;
            }
        }
    }
    exports.ActionViewWithLabel = ActionViewWithLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEFjdGlvblZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9jZWxsUGFydHMvY2VsbEFjdGlvblZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEscUJBQXNCLFNBQVEsaURBQXVCO1FBRTlDLFdBQVc7WUFDN0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3RDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUEsaUNBQW9CLEVBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRixDQUFDO1FBQ0YsQ0FBQztLQUNEO0lBUEQsc0RBT0M7SUFFRCxNQUFhLG1CQUFvQixTQUFRLGlEQUF1QjtRQUd0RCxNQUFNLENBQUMsU0FBc0I7WUFDckMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoRCxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEIsQ0FBQztRQUVrQixXQUFXO1lBQzdCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ25HLENBQUM7UUFDRixDQUFDO0tBQ0Q7SUFsQkQsa0RBa0JDIn0=
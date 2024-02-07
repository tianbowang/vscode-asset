/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/actions"], function (require, exports, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionRunnerWithContext = void 0;
    class ActionRunnerWithContext extends actions_1.ActionRunner {
        constructor(_getContext) {
            super();
            this._getContext = _getContext;
        }
        runAction(action, _context) {
            return super.runAction(action, this._getContext());
        }
    }
    exports.ActionRunnerWithContext = ActionRunnerWithContext;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9tdWx0aURpZmZFZGl0b3JXaWRnZXQvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVk7UUFDeEQsWUFBNkIsV0FBc0I7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsZ0JBQVcsR0FBWCxXQUFXLENBQVc7UUFFbkQsQ0FBQztRQUVrQixTQUFTLENBQUMsTUFBZSxFQUFFLFFBQWtCO1lBQy9ELE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQztLQUNEO0lBUkQsMERBUUMifQ==
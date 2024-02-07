/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusbarEntryKinds = exports.ShowTooltipCommand = exports.isStatusbarEntryPriority = exports.isStatusbarEntryLocation = exports.StatusbarAlignment = exports.IStatusbarService = void 0;
    exports.IStatusbarService = (0, instantiation_1.createDecorator)('statusbarService');
    var StatusbarAlignment;
    (function (StatusbarAlignment) {
        StatusbarAlignment[StatusbarAlignment["LEFT"] = 0] = "LEFT";
        StatusbarAlignment[StatusbarAlignment["RIGHT"] = 1] = "RIGHT";
    })(StatusbarAlignment || (exports.StatusbarAlignment = StatusbarAlignment = {}));
    function isStatusbarEntryLocation(thing) {
        const candidate = thing;
        return typeof candidate?.id === 'string' && typeof candidate.alignment === 'number';
    }
    exports.isStatusbarEntryLocation = isStatusbarEntryLocation;
    function isStatusbarEntryPriority(thing) {
        const candidate = thing;
        return (typeof candidate?.primary === 'number' || isStatusbarEntryLocation(candidate?.primary)) && typeof candidate?.secondary === 'number';
    }
    exports.isStatusbarEntryPriority = isStatusbarEntryPriority;
    exports.ShowTooltipCommand = {
        id: 'statusBar.entry.showTooltip',
        title: ''
    };
    exports.StatusbarEntryKinds = ['standard', 'warning', 'error', 'prominent', 'remote', 'offline'];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc3RhdHVzYmFyL2Jyb3dzZXIvc3RhdHVzYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVuRixRQUFBLGlCQUFpQixHQUFHLElBQUEsK0JBQWUsRUFBb0Isa0JBQWtCLENBQUMsQ0FBQztJQXVCeEYsSUFBa0Isa0JBR2pCO0lBSEQsV0FBa0Isa0JBQWtCO1FBQ25DLDJEQUFJLENBQUE7UUFDSiw2REFBSyxDQUFBO0lBQ04sQ0FBQyxFQUhpQixrQkFBa0Isa0NBQWxCLGtCQUFrQixRQUduQztJQXdCRCxTQUFnQix3QkFBd0IsQ0FBQyxLQUFjO1FBQ3RELE1BQU0sU0FBUyxHQUFHLEtBQTRDLENBQUM7UUFFL0QsT0FBTyxPQUFPLFNBQVMsRUFBRSxFQUFFLEtBQUssUUFBUSxJQUFJLE9BQU8sU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUM7SUFDckYsQ0FBQztJQUpELDREQUlDO0lBeUJELFNBQWdCLHdCQUF3QixDQUFDLEtBQWM7UUFDdEQsTUFBTSxTQUFTLEdBQUcsS0FBNEMsQ0FBQztRQUUvRCxPQUFPLENBQUMsT0FBTyxTQUFTLEVBQUUsT0FBTyxLQUFLLFFBQVEsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxPQUFPLFNBQVMsRUFBRSxTQUFTLEtBQUssUUFBUSxDQUFDO0lBQzdJLENBQUM7SUFKRCw0REFJQztJQUVZLFFBQUEsa0JBQWtCLEdBQVk7UUFDMUMsRUFBRSxFQUFFLDZCQUE2QjtRQUNqQyxLQUFLLEVBQUUsRUFBRTtLQUNULENBQUM7SUFVVyxRQUFBLG1CQUFtQixHQUF5QixDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMifQ==
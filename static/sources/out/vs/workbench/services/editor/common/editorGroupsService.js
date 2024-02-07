/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor"], function (require, exports, instantiation_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.preferredSideBySideGroupDirection = exports.isEditorGroup = exports.OpenEditorContext = exports.GroupsOrder = exports.isEditorReplacement = exports.MergeGroupMode = exports.GroupsArrangement = exports.GroupLocation = exports.GroupOrientation = exports.GroupDirection = exports.IEditorGroupsService = void 0;
    exports.IEditorGroupsService = (0, instantiation_1.createDecorator)('editorGroupsService');
    var GroupDirection;
    (function (GroupDirection) {
        GroupDirection[GroupDirection["UP"] = 0] = "UP";
        GroupDirection[GroupDirection["DOWN"] = 1] = "DOWN";
        GroupDirection[GroupDirection["LEFT"] = 2] = "LEFT";
        GroupDirection[GroupDirection["RIGHT"] = 3] = "RIGHT";
    })(GroupDirection || (exports.GroupDirection = GroupDirection = {}));
    var GroupOrientation;
    (function (GroupOrientation) {
        GroupOrientation[GroupOrientation["HORIZONTAL"] = 0] = "HORIZONTAL";
        GroupOrientation[GroupOrientation["VERTICAL"] = 1] = "VERTICAL";
    })(GroupOrientation || (exports.GroupOrientation = GroupOrientation = {}));
    var GroupLocation;
    (function (GroupLocation) {
        GroupLocation[GroupLocation["FIRST"] = 0] = "FIRST";
        GroupLocation[GroupLocation["LAST"] = 1] = "LAST";
        GroupLocation[GroupLocation["NEXT"] = 2] = "NEXT";
        GroupLocation[GroupLocation["PREVIOUS"] = 3] = "PREVIOUS";
    })(GroupLocation || (exports.GroupLocation = GroupLocation = {}));
    var GroupsArrangement;
    (function (GroupsArrangement) {
        /**
         * Make the current active group consume the entire
         * editor area.
         */
        GroupsArrangement[GroupsArrangement["MAXIMIZE"] = 0] = "MAXIMIZE";
        /**
         * Make the current active group consume the maximum
         * amount of space possible.
         */
        GroupsArrangement[GroupsArrangement["EXPAND"] = 1] = "EXPAND";
        /**
         * Size all groups evenly.
         */
        GroupsArrangement[GroupsArrangement["EVEN"] = 2] = "EVEN";
    })(GroupsArrangement || (exports.GroupsArrangement = GroupsArrangement = {}));
    var MergeGroupMode;
    (function (MergeGroupMode) {
        MergeGroupMode[MergeGroupMode["COPY_EDITORS"] = 0] = "COPY_EDITORS";
        MergeGroupMode[MergeGroupMode["MOVE_EDITORS"] = 1] = "MOVE_EDITORS";
    })(MergeGroupMode || (exports.MergeGroupMode = MergeGroupMode = {}));
    function isEditorReplacement(replacement) {
        const candidate = replacement;
        return (0, editor_1.isEditorInput)(candidate?.editor) && (0, editor_1.isEditorInput)(candidate?.replacement);
    }
    exports.isEditorReplacement = isEditorReplacement;
    var GroupsOrder;
    (function (GroupsOrder) {
        /**
         * Groups sorted by creation order (oldest one first)
         */
        GroupsOrder[GroupsOrder["CREATION_TIME"] = 0] = "CREATION_TIME";
        /**
         * Groups sorted by most recent activity (most recent active first)
         */
        GroupsOrder[GroupsOrder["MOST_RECENTLY_ACTIVE"] = 1] = "MOST_RECENTLY_ACTIVE";
        /**
         * Groups sorted by grid widget order
         */
        GroupsOrder[GroupsOrder["GRID_APPEARANCE"] = 2] = "GRID_APPEARANCE";
    })(GroupsOrder || (exports.GroupsOrder = GroupsOrder = {}));
    var OpenEditorContext;
    (function (OpenEditorContext) {
        OpenEditorContext[OpenEditorContext["NEW_EDITOR"] = 1] = "NEW_EDITOR";
        OpenEditorContext[OpenEditorContext["MOVE_EDITOR"] = 2] = "MOVE_EDITOR";
        OpenEditorContext[OpenEditorContext["COPY_EDITOR"] = 3] = "COPY_EDITOR";
    })(OpenEditorContext || (exports.OpenEditorContext = OpenEditorContext = {}));
    function isEditorGroup(obj) {
        const group = obj;
        return !!group && typeof group.id === 'number' && Array.isArray(group.editors);
    }
    exports.isEditorGroup = isEditorGroup;
    //#region Editor Group Helpers
    function preferredSideBySideGroupDirection(configurationService) {
        const openSideBySideDirection = configurationService.getValue('workbench.editor.openSideBySideDirection');
        if (openSideBySideDirection === 'down') {
            return 1 /* GroupDirection.DOWN */;
        }
        return 3 /* GroupDirection.RIGHT */;
    }
    exports.preferredSideBySideGroupDirection = preferredSideBySideGroupDirection;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBzU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2VkaXRvci9jb21tb24vZWRpdG9yR3JvdXBzU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQm5GLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSwrQkFBZSxFQUF1QixxQkFBcUIsQ0FBQyxDQUFDO0lBRWpHLElBQWtCLGNBS2pCO0lBTEQsV0FBa0IsY0FBYztRQUMvQiwrQ0FBRSxDQUFBO1FBQ0YsbURBQUksQ0FBQTtRQUNKLG1EQUFJLENBQUE7UUFDSixxREFBSyxDQUFBO0lBQ04sQ0FBQyxFQUxpQixjQUFjLDhCQUFkLGNBQWMsUUFLL0I7SUFFRCxJQUFrQixnQkFHakI7SUFIRCxXQUFrQixnQkFBZ0I7UUFDakMsbUVBQVUsQ0FBQTtRQUNWLCtEQUFRLENBQUE7SUFDVCxDQUFDLEVBSGlCLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBR2pDO0lBRUQsSUFBa0IsYUFLakI7SUFMRCxXQUFrQixhQUFhO1FBQzlCLG1EQUFLLENBQUE7UUFDTCxpREFBSSxDQUFBO1FBQ0osaURBQUksQ0FBQTtRQUNKLHlEQUFRLENBQUE7SUFDVCxDQUFDLEVBTGlCLGFBQWEsNkJBQWIsYUFBYSxRQUs5QjtJQU9ELElBQWtCLGlCQWlCakI7SUFqQkQsV0FBa0IsaUJBQWlCO1FBQ2xDOzs7V0FHRztRQUNILGlFQUFRLENBQUE7UUFFUjs7O1dBR0c7UUFDSCw2REFBTSxDQUFBO1FBRU47O1dBRUc7UUFDSCx5REFBSSxDQUFBO0lBQ0wsQ0FBQyxFQWpCaUIsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUFpQmxDO0lBZ0NELElBQWtCLGNBR2pCO0lBSEQsV0FBa0IsY0FBYztRQUMvQixtRUFBWSxDQUFBO1FBQ1osbUVBQVksQ0FBQTtJQUNiLENBQUMsRUFIaUIsY0FBYyw4QkFBZCxjQUFjLFFBRy9CO0lBa0NELFNBQWdCLG1CQUFtQixDQUFDLFdBQW9CO1FBQ3ZELE1BQU0sU0FBUyxHQUFHLFdBQTZDLENBQUM7UUFFaEUsT0FBTyxJQUFBLHNCQUFhLEVBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUEsc0JBQWEsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUpELGtEQUlDO0lBRUQsSUFBa0IsV0FnQmpCO0lBaEJELFdBQWtCLFdBQVc7UUFFNUI7O1dBRUc7UUFDSCwrREFBYSxDQUFBO1FBRWI7O1dBRUc7UUFDSCw2RUFBb0IsQ0FBQTtRQUVwQjs7V0FFRztRQUNILG1FQUFlLENBQUE7SUFDaEIsQ0FBQyxFQWhCaUIsV0FBVywyQkFBWCxXQUFXLFFBZ0I1QjtJQTZYRCxJQUFrQixpQkFJakI7SUFKRCxXQUFrQixpQkFBaUI7UUFDbEMscUVBQWMsQ0FBQTtRQUNkLHVFQUFlLENBQUE7UUFDZix1RUFBZSxDQUFBO0lBQ2hCLENBQUMsRUFKaUIsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUFJbEM7SUErVEQsU0FBZ0IsYUFBYSxDQUFDLEdBQVk7UUFDekMsTUFBTSxLQUFLLEdBQUcsR0FBK0IsQ0FBQztRQUU5QyxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRSxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBSkQsc0NBSUM7SUFFRCw4QkFBOEI7SUFFOUIsU0FBZ0IsaUNBQWlDLENBQUMsb0JBQTJDO1FBQzVGLE1BQU0sdUJBQXVCLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFFMUcsSUFBSSx1QkFBdUIsS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUN4QyxtQ0FBMkI7UUFDNUIsQ0FBQztRQUVELG9DQUE0QjtJQUM3QixDQUFDO0lBUkQsOEVBUUM7O0FBRUQsWUFBWSJ9
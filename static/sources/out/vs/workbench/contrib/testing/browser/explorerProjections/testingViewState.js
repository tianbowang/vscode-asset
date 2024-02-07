/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/testing/common/testId"], function (require, exports, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isCollapsedInSerializedTestTree = void 0;
    /**
     * Gets whether the given test ID is collapsed.
     */
    function isCollapsedInSerializedTestTree(serialized, id) {
        if (!(id instanceof testId_1.TestId)) {
            id = testId_1.TestId.fromString(id);
        }
        let node = serialized;
        for (const part of id.path) {
            if (!node.children?.hasOwnProperty(part)) {
                return undefined;
            }
            node = node.children[part];
        }
        return node.collapsed;
    }
    exports.isCollapsedInSerializedTestTree = isCollapsedInSerializedTestTree;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ1ZpZXdTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9icm93c2VyL2V4cGxvcmVyUHJvamVjdGlvbnMvdGVzdGluZ1ZpZXdTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEc7O09BRUc7SUFDSCxTQUFnQiwrQkFBK0IsQ0FBQyxVQUE0QyxFQUFFLEVBQW1CO1FBQ2hILElBQUksQ0FBQyxDQUFDLEVBQUUsWUFBWSxlQUFNLENBQUMsRUFBRSxDQUFDO1lBQzdCLEVBQUUsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFJLElBQUksR0FBRyxVQUFVLENBQUM7UUFDdEIsS0FBSyxNQUFNLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzFDLE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7WUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3ZCLENBQUM7SUFmRCwwRUFlQyJ9
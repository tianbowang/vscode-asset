(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, instantiation_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isPreferredGroup = exports.AUX_WINDOW_GROUP = exports.SIDE_GROUP = exports.ACTIVE_GROUP = exports.IEditorService = void 0;
    exports.IEditorService = (0, instantiation_1.createDecorator)('editorService');
    /**
     * Open an editor in the currently active group.
     */
    exports.ACTIVE_GROUP = -1;
    /**
     * Open an editor to the side of the active group.
     */
    exports.SIDE_GROUP = -2;
    /**
     * Open an editor in a new auxiliary window.
     */
    exports.AUX_WINDOW_GROUP = -3;
    function isPreferredGroup(obj) {
        const candidate = obj;
        return typeof obj === 'number' || (0, editorGroupsService_1.isEditorGroup)(candidate);
    }
    exports.isPreferredGroup = isPreferredGroup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2VkaXRvci9jb21tb24vZWRpdG9yU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhbkYsUUFBQSxjQUFjLEdBQUcsSUFBQSwrQkFBZSxFQUFpQixlQUFlLENBQUMsQ0FBQztJQUUvRTs7T0FFRztJQUNVLFFBQUEsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRy9COztPQUVHO0lBQ1UsUUFBQSxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFHN0I7O09BRUc7SUFDVSxRQUFBLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBS25DLFNBQWdCLGdCQUFnQixDQUFDLEdBQVk7UUFDNUMsTUFBTSxTQUFTLEdBQUcsR0FBaUMsQ0FBQztRQUVwRCxPQUFPLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxJQUFBLG1DQUFhLEVBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUpELDRDQUlDIn0=
//# sourceURL=../../../vs/workbench/services/editor/common/editorService.js
})
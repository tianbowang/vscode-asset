/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IWorkspaceTrustRequestService = exports.WorkspaceTrustUriResponse = exports.IWorkspaceTrustManagementService = exports.IWorkspaceTrustEnablementService = exports.workspaceTrustToString = exports.WorkspaceTrustScope = void 0;
    var WorkspaceTrustScope;
    (function (WorkspaceTrustScope) {
        WorkspaceTrustScope[WorkspaceTrustScope["Local"] = 0] = "Local";
        WorkspaceTrustScope[WorkspaceTrustScope["Remote"] = 1] = "Remote";
    })(WorkspaceTrustScope || (exports.WorkspaceTrustScope = WorkspaceTrustScope = {}));
    function workspaceTrustToString(trustState) {
        if (trustState) {
            return (0, nls_1.localize)('trusted', "Trusted");
        }
        else {
            return (0, nls_1.localize)('untrusted', "Restricted Mode");
        }
    }
    exports.workspaceTrustToString = workspaceTrustToString;
    exports.IWorkspaceTrustEnablementService = (0, instantiation_1.createDecorator)('workspaceTrustEnablementService');
    exports.IWorkspaceTrustManagementService = (0, instantiation_1.createDecorator)('workspaceTrustManagementService');
    var WorkspaceTrustUriResponse;
    (function (WorkspaceTrustUriResponse) {
        WorkspaceTrustUriResponse[WorkspaceTrustUriResponse["Open"] = 1] = "Open";
        WorkspaceTrustUriResponse[WorkspaceTrustUriResponse["OpenInNewWindow"] = 2] = "OpenInNewWindow";
        WorkspaceTrustUriResponse[WorkspaceTrustUriResponse["Cancel"] = 3] = "Cancel";
    })(WorkspaceTrustUriResponse || (exports.WorkspaceTrustUriResponse = WorkspaceTrustUriResponse = {}));
    exports.IWorkspaceTrustRequestService = (0, instantiation_1.createDecorator)('workspaceTrustRequestService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVHJ1c3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dvcmtzcGFjZS9jb21tb24vd29ya3NwYWNlVHJ1c3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLElBQVksbUJBR1g7SUFIRCxXQUFZLG1CQUFtQjtRQUM5QiwrREFBUyxDQUFBO1FBQ1QsaUVBQVUsQ0FBQTtJQUNYLENBQUMsRUFIVyxtQkFBbUIsbUNBQW5CLG1CQUFtQixRQUc5QjtJQUVELFNBQWdCLHNCQUFzQixDQUFDLFVBQW1CO1FBQ3pELElBQUksVUFBVSxFQUFFLENBQUM7WUFDaEIsT0FBTyxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkMsQ0FBQzthQUFNLENBQUM7WUFDUCxPQUFPLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pELENBQUM7SUFDRixDQUFDO0lBTkQsd0RBTUM7SUFZWSxRQUFBLGdDQUFnQyxHQUFHLElBQUEsK0JBQWUsRUFBbUMsaUNBQWlDLENBQUMsQ0FBQztJQVF4SCxRQUFBLGdDQUFnQyxHQUFHLElBQUEsK0JBQWUsRUFBbUMsaUNBQWlDLENBQUMsQ0FBQztJQThCckksSUFBa0IseUJBSWpCO0lBSkQsV0FBa0IseUJBQXlCO1FBQzFDLHlFQUFRLENBQUE7UUFDUiwrRkFBbUIsQ0FBQTtRQUNuQiw2RUFBVSxDQUFBO0lBQ1gsQ0FBQyxFQUppQix5QkFBeUIseUNBQXpCLHlCQUF5QixRQUkxQztJQUVZLFFBQUEsNkJBQTZCLEdBQUcsSUFBQSwrQkFBZSxFQUFnQyw4QkFBOEIsQ0FBQyxDQUFDIn0=
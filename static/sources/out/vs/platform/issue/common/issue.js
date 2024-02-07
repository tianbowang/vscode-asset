/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IIssueMainService = exports.IssueType = void 0;
    var IssueType;
    (function (IssueType) {
        IssueType[IssueType["Bug"] = 0] = "Bug";
        IssueType[IssueType["PerformanceIssue"] = 1] = "PerformanceIssue";
        IssueType[IssueType["FeatureRequest"] = 2] = "FeatureRequest";
    })(IssueType || (exports.IssueType = IssueType = {}));
    exports.IIssueMainService = (0, instantiation_1.createDecorator)('issueService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2lzc3VlL2NvbW1vbi9pc3N1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLElBQWtCLFNBSWpCO0lBSkQsV0FBa0IsU0FBUztRQUMxQix1Q0FBRyxDQUFBO1FBQ0gsaUVBQWdCLENBQUE7UUFDaEIsNkRBQWMsQ0FBQTtJQUNmLENBQUMsRUFKaUIsU0FBUyx5QkFBVCxTQUFTLFFBSTFCO0lBcUdZLFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwrQkFBZSxFQUFvQixjQUFjLENBQUMsQ0FBQyJ9
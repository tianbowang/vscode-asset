/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionRecommendationNotificationService = exports.RecommendationsNotificationResult = exports.RecommendationSourceToString = exports.RecommendationSource = void 0;
    var RecommendationSource;
    (function (RecommendationSource) {
        RecommendationSource[RecommendationSource["FILE"] = 1] = "FILE";
        RecommendationSource[RecommendationSource["WORKSPACE"] = 2] = "WORKSPACE";
        RecommendationSource[RecommendationSource["EXE"] = 3] = "EXE";
    })(RecommendationSource || (exports.RecommendationSource = RecommendationSource = {}));
    function RecommendationSourceToString(source) {
        switch (source) {
            case 1 /* RecommendationSource.FILE */: return 'file';
            case 2 /* RecommendationSource.WORKSPACE */: return 'workspace';
            case 3 /* RecommendationSource.EXE */: return 'exe';
        }
    }
    exports.RecommendationSourceToString = RecommendationSourceToString;
    var RecommendationsNotificationResult;
    (function (RecommendationsNotificationResult) {
        RecommendationsNotificationResult["Ignored"] = "ignored";
        RecommendationsNotificationResult["Cancelled"] = "cancelled";
        RecommendationsNotificationResult["TooMany"] = "toomany";
        RecommendationsNotificationResult["IncompatibleWindow"] = "incompatibleWindow";
        RecommendationsNotificationResult["Accepted"] = "reacted";
    })(RecommendationsNotificationResult || (exports.RecommendationsNotificationResult = RecommendationsNotificationResult = {}));
    exports.IExtensionRecommendationNotificationService = (0, instantiation_1.createDecorator)('IExtensionRecommendationNotificationService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25SZWNvbW1lbmRhdGlvbnMvY29tbW9uL2V4dGVuc2lvblJlY29tbWVuZGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsSUFBa0Isb0JBSWpCO0lBSkQsV0FBa0Isb0JBQW9CO1FBQ3JDLCtEQUFRLENBQUE7UUFDUix5RUFBYSxDQUFBO1FBQ2IsNkRBQU8sQ0FBQTtJQUNSLENBQUMsRUFKaUIsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFJckM7SUFTRCxTQUFnQiw0QkFBNEIsQ0FBQyxNQUE0QjtRQUN4RSxRQUFRLE1BQU0sRUFBRSxDQUFDO1lBQ2hCLHNDQUE4QixDQUFDLENBQUMsT0FBTyxNQUFNLENBQUM7WUFDOUMsMkNBQW1DLENBQUMsQ0FBQyxPQUFPLFdBQVcsQ0FBQztZQUN4RCxxQ0FBNkIsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDO1FBQzdDLENBQUM7SUFDRixDQUFDO0lBTkQsb0VBTUM7SUFFRCxJQUFrQixpQ0FNakI7SUFORCxXQUFrQixpQ0FBaUM7UUFDbEQsd0RBQW1CLENBQUE7UUFDbkIsNERBQXVCLENBQUE7UUFDdkIsd0RBQW1CLENBQUE7UUFDbkIsOEVBQXlDLENBQUE7UUFDekMseURBQW9CLENBQUE7SUFDckIsQ0FBQyxFQU5pQixpQ0FBaUMsaURBQWpDLGlDQUFpQyxRQU1sRDtJQUVZLFFBQUEsMkNBQTJDLEdBQUcsSUFBQSwrQkFBZSxFQUE4Qyw2Q0FBNkMsQ0FBQyxDQUFDIn0=
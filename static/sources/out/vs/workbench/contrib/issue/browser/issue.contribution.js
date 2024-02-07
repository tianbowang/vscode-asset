/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/extensions", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/issue/browser/issueService", "vs/workbench/services/issue/common/issue", "vs/workbench/contrib/issue/common/issue.contribution"], function (require, exports, nls, commands_1, extensions_1, productService_1, platform_1, contributions_1, issueService_1, issue_1, issue_contribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let WebIssueContribution = class WebIssueContribution extends issue_contribution_1.BaseIssueContribution {
        constructor(productService) {
            super(productService);
        }
    };
    WebIssueContribution = __decorate([
        __param(0, productService_1.IProductService)
    ], WebIssueContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WebIssueContribution, 3 /* LifecyclePhase.Restored */);
    (0, extensions_1.registerSingleton)(issue_1.IWorkbenchIssueService, issueService_1.WebIssueService, 1 /* InstantiationType.Delayed */);
    commands_1.CommandsRegistry.registerCommand('_issues.getSystemStatus', (accessor) => {
        return nls.localize('statusUnsupported', "The --status argument is not yet supported in browsers.");
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWUuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9pc3N1ZS9icm93c2VyL2lzc3VlLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQWFoRyxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLDBDQUFxQjtRQUN2RCxZQUE2QixjQUErQjtZQUMzRCxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdkIsQ0FBQztLQUNELENBQUE7SUFKSyxvQkFBb0I7UUFDWixXQUFBLGdDQUFlLENBQUE7T0FEdkIsb0JBQW9CLENBSXpCO0lBRUQsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsb0JBQW9CLGtDQUEwQixDQUFDO0lBRWhKLElBQUEsOEJBQWlCLEVBQUMsOEJBQXNCLEVBQUUsOEJBQWUsb0NBQTRCLENBQUM7SUFFdEYsMkJBQWdCLENBQUMsZUFBZSxDQUFDLHlCQUF5QixFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUU7UUFDeEUsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLHlEQUF5RCxDQUFDLENBQUM7SUFDckcsQ0FBQyxDQUFDLENBQUMifQ==
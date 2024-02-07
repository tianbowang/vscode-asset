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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/opener/common/opener", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, lifecycle_1, opener_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExternalUriResolverContribution = void 0;
    let ExternalUriResolverContribution = class ExternalUriResolverContribution extends lifecycle_1.Disposable {
        constructor(_openerService, _workbenchEnvironmentService) {
            super();
            if (_workbenchEnvironmentService.options && _workbenchEnvironmentService.options.resolveExternalUri) {
                this._register(_openerService.registerExternalUriResolver({
                    resolveExternalUri: async (resource) => {
                        return {
                            resolved: await _workbenchEnvironmentService.options.resolveExternalUri(resource),
                            dispose: () => {
                                // TODO
                            }
                        };
                    }
                }));
            }
        }
    };
    exports.ExternalUriResolverContribution = ExternalUriResolverContribution;
    exports.ExternalUriResolverContribution = ExternalUriResolverContribution = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, environmentService_1.IBrowserWorkbenchEnvironmentService)
    ], ExternalUriResolverContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxVcmlSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdXJsL2Jyb3dzZXIvZXh0ZXJuYWxVcmlSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFPekYsSUFBTSwrQkFBK0IsR0FBckMsTUFBTSwrQkFBZ0MsU0FBUSxzQkFBVTtRQUM5RCxZQUNpQixjQUE4QixFQUNULDRCQUFpRTtZQUV0RyxLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksNEJBQTRCLENBQUMsT0FBTyxJQUFJLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUNyRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsQ0FBQztvQkFDekQsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFO3dCQUN0QyxPQUFPOzRCQUNOLFFBQVEsRUFBRSxNQUFNLDRCQUE0QixDQUFDLE9BQVEsQ0FBQyxrQkFBbUIsQ0FBQyxRQUFRLENBQUM7NEJBQ25GLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0NBQ2IsT0FBTzs0QkFDUixDQUFDO3lCQUNELENBQUM7b0JBQ0gsQ0FBQztpQkFDRCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXBCWSwwRUFBK0I7OENBQS9CLCtCQUErQjtRQUV6QyxXQUFBLHVCQUFjLENBQUE7UUFDZCxXQUFBLHdEQUFtQyxDQUFBO09BSHpCLCtCQUErQixDQW9CM0MifQ==
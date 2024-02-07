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
define(["require", "exports", "vs/base/common/errors", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log"], function (require, exports, errors_1, instantiation_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionSignatureVerificationService = exports.IExtensionSignatureVerificationService = void 0;
    exports.IExtensionSignatureVerificationService = (0, instantiation_1.createDecorator)('IExtensionSignatureVerificationService');
    let ExtensionSignatureVerificationService = class ExtensionSignatureVerificationService {
        constructor(logService) {
            this.logService = logService;
        }
        vsceSign() {
            if (!this.moduleLoadingPromise) {
                this.moduleLoadingPromise = new Promise((resolve, reject) => require(['node-vsce-sign'], async (obj) => {
                    const instance = obj;
                    return resolve(instance);
                }, reject));
            }
            return this.moduleLoadingPromise;
        }
        async verify(vsixFilePath, signatureArchiveFilePath, verbose) {
            let module;
            try {
                module = await this.vsceSign();
            }
            catch (error) {
                this.logService.error('Could not load vsce-sign module', (0, errors_1.getErrorMessage)(error));
                return false;
            }
            return module.verify(vsixFilePath, signatureArchiveFilePath, verbose);
        }
    };
    exports.ExtensionSignatureVerificationService = ExtensionSignatureVerificationService;
    exports.ExtensionSignatureVerificationService = ExtensionSignatureVerificationService = __decorate([
        __param(0, log_1.ILogService)
    ], ExtensionSignatureVerificationService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uU2lnbmF0dXJlVmVyaWZpY2F0aW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9ub2RlL2V4dGVuc2lvblNpZ25hdHVyZVZlcmlmaWNhdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBTW5GLFFBQUEsc0NBQXNDLEdBQUcsSUFBQSwrQkFBZSxFQUF5Qyx3Q0FBd0MsQ0FBQyxDQUFDO0lBa0NqSixJQUFNLHFDQUFxQyxHQUEzQyxNQUFNLHFDQUFxQztRQUtqRCxZQUMrQixVQUF1QjtZQUF2QixlQUFVLEdBQVYsVUFBVSxDQUFhO1FBQ2xELENBQUM7UUFFRyxRQUFRO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxPQUFPLENBQ3RDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUMzQixDQUFDLGdCQUFnQixDQUFDLEVBQ2xCLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRTtvQkFDYixNQUFNLFFBQVEsR0FBb0IsR0FBRyxDQUFDO29CQUV0QyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDMUIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDZixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7UUFDbEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBb0IsRUFBRSx3QkFBZ0MsRUFBRSxPQUFnQjtZQUMzRixJQUFJLE1BQXVCLENBQUM7WUFFNUIsSUFBSSxDQUFDO2dCQUNKLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQyxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEVBQUUsSUFBQSx3QkFBZSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2pGLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsd0JBQXdCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkUsQ0FBQztLQUNELENBQUE7SUFwQ1ksc0ZBQXFDO29EQUFyQyxxQ0FBcUM7UUFNL0MsV0FBQSxpQkFBVyxDQUFBO09BTkQscUNBQXFDLENBb0NqRCJ9
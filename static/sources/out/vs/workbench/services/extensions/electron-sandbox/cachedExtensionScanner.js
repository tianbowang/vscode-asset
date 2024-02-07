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
define(["require", "exports", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/workbench/services/extensions/common/extensionsUtil", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/log/common/log", "vs/base/common/severity", "vs/nls", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/base/common/async", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/errors"], function (require, exports, path, platform, uri_1, extensionsUtil_1, extensionsScannerService_1, log_1, severity_1, nls_1, notification_1, host_1, async_1, userDataProfile_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachedExtensionScanner = void 0;
    let CachedExtensionScanner = class CachedExtensionScanner {
        constructor(_notificationService, _hostService, _extensionsScannerService, _userDataProfileService, _logService) {
            this._notificationService = _notificationService;
            this._hostService = _hostService;
            this._extensionsScannerService = _extensionsScannerService;
            this._userDataProfileService = _userDataProfileService;
            this._logService = _logService;
            this.scannedExtensions = new Promise((resolve, reject) => {
                this._scannedExtensionsResolve = resolve;
                this._scannedExtensionsReject = reject;
            });
        }
        async scanSingleExtension(extensionPath, isBuiltin) {
            const scannedExtension = await this._extensionsScannerService.scanExistingExtension(uri_1.URI.file(path.resolve(extensionPath)), isBuiltin ? 0 /* ExtensionType.System */ : 1 /* ExtensionType.User */, { language: platform.language });
            return scannedExtension ? (0, extensionsScannerService_1.toExtensionDescription)(scannedExtension, false) : null;
        }
        async startScanningExtensions() {
            try {
                const extensions = await this._scanInstalledExtensions();
                this._scannedExtensionsResolve(extensions);
            }
            catch (err) {
                this._scannedExtensionsReject(err);
            }
        }
        async _scanInstalledExtensions() {
            try {
                const language = platform.language;
                const result = await Promise.allSettled([
                    this._extensionsScannerService.scanSystemExtensions({ language, useCache: true, checkControlFile: true }),
                    this._extensionsScannerService.scanUserExtensions({ language, profileLocation: this._userDataProfileService.currentProfile.extensionsResource, useCache: true })
                ]);
                let scannedSystemExtensions = [], scannedUserExtensions = [], scannedDevelopedExtensions = [], hasErrors = false;
                if (result[0].status === 'fulfilled') {
                    scannedSystemExtensions = result[0].value;
                }
                else {
                    hasErrors = true;
                    this._logService.error(`Error scanning system extensions:`, (0, errors_1.getErrorMessage)(result[0].reason));
                }
                if (result[1].status === 'fulfilled') {
                    scannedUserExtensions = result[1].value;
                }
                else {
                    hasErrors = true;
                    this._logService.error(`Error scanning user extensions:`, (0, errors_1.getErrorMessage)(result[1].reason));
                }
                try {
                    scannedDevelopedExtensions = await this._extensionsScannerService.scanExtensionsUnderDevelopment({ language }, [...scannedSystemExtensions, ...scannedUserExtensions]);
                }
                catch (error) {
                    this._logService.error(error);
                }
                const system = scannedSystemExtensions.map(e => (0, extensionsScannerService_1.toExtensionDescription)(e, false));
                const user = scannedUserExtensions.map(e => (0, extensionsScannerService_1.toExtensionDescription)(e, false));
                const development = scannedDevelopedExtensions.map(e => (0, extensionsScannerService_1.toExtensionDescription)(e, true));
                const r = (0, extensionsUtil_1.dedupExtensions)(system, user, development, this._logService);
                if (!hasErrors) {
                    const disposable = this._extensionsScannerService.onDidChangeCache(() => {
                        disposable.dispose();
                        this._notificationService.prompt(severity_1.default.Error, (0, nls_1.localize)('extensionCache.invalid', "Extensions have been modified on disk. Please reload the window."), [{
                                label: (0, nls_1.localize)('reloadWindow', "Reload Window"),
                                run: () => this._hostService.reload()
                            }]);
                    });
                    (0, async_1.timeout)(5000).then(() => disposable.dispose());
                }
                return r;
            }
            catch (err) {
                this._logService.error(`Error scanning installed extensions:`);
                this._logService.error(err);
                return [];
            }
        }
    };
    exports.CachedExtensionScanner = CachedExtensionScanner;
    exports.CachedExtensionScanner = CachedExtensionScanner = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, host_1.IHostService),
        __param(2, extensionsScannerService_1.IExtensionsScannerService),
        __param(3, userDataProfile_1.IUserDataProfileService),
        __param(4, log_1.ILogService)
    ], CachedExtensionScanner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGVkRXh0ZW5zaW9uU2Nhbm5lci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvZWxlY3Ryb24tc2FuZGJveC9jYWNoZWRFeHRlbnNpb25TY2FubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCekYsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBc0I7UUFNbEMsWUFDd0Msb0JBQTBDLEVBQ2xELFlBQTBCLEVBQ2IseUJBQW9ELEVBQ3RELHVCQUFnRCxFQUM1RCxXQUF3QjtZQUpmLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDbEQsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDYiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1lBQ3RELDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFDNUQsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFFdEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksT0FBTyxDQUEwQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDakYsSUFBSSxDQUFDLHlCQUF5QixHQUFHLE9BQU8sQ0FBQztnQkFDekMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLE1BQU0sQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsYUFBcUIsRUFBRSxTQUFrQjtZQUN6RSxNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLHFCQUFxQixDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLDhCQUFzQixDQUFDLDJCQUFtQixFQUFFLEVBQUUsUUFBUSxFQUFF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
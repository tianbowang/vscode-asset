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
define(["require", "exports", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, extensions_1, notification_1, storage_1, nls_1, instantiation_1, extensionsActions_1, arrays_1, lifecycle_1, extensionManagement_1, extensionManagementUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DeprecatedExtensionsChecker = void 0;
    let DeprecatedExtensionsChecker = class DeprecatedExtensionsChecker extends lifecycle_1.Disposable {
        constructor(extensionsWorkbenchService, extensionManagementService, storageService, notificationService, instantiationService) {
            super();
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.instantiationService = instantiationService;
            this.checkForDeprecatedExtensions();
            this._register(extensionManagementService.onDidInstallExtensions(e => {
                const ids = [];
                for (const { local } of e) {
                    if (local && extensionsWorkbenchService.local.find(extension => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, local.identifier))?.deprecationInfo) {
                        ids.push(local.identifier.id.toLowerCase());
                    }
                }
                if (ids.length) {
                    this.setNotifiedDeprecatedExtensions(ids);
                }
            }));
        }
        async checkForDeprecatedExtensions() {
            if (this.storageService.getBoolean('extensionsAssistant/doNotCheckDeprecated', 0 /* StorageScope.PROFILE */, false)) {
                return;
            }
            const local = await this.extensionsWorkbenchService.queryLocal();
            const previouslyNotified = this.getNotifiedDeprecatedExtensions();
            const toNotify = local.filter(e => !!e.deprecationInfo).filter(e => !previouslyNotified.includes(e.identifier.id.toLowerCase()));
            if (toNotify.length) {
                this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('deprecated extensions', "You have deprecated extensions installed. We recommend to review them and migrate to alternatives."), [{
                        label: (0, nls_1.localize)('showDeprecated', "Show Deprecated Extensions"),
                        run: async () => {
                            this.setNotifiedDeprecatedExtensions(toNotify.map(e => e.identifier.id.toLowerCase()));
                            const action = this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, toNotify.map(extension => `@id:${extension.identifier.id}`).join(' '));
                            try {
                                await action.run();
                            }
                            finally {
                                action.dispose();
                            }
                        }
                    }, {
                        label: (0, nls_1.localize)('neverShowAgain', "Don't Show Again"),
                        isSecondary: true,
                        run: () => this.storageService.store('extensionsAssistant/doNotCheckDeprecated', true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)
                    }]);
            }
        }
        getNotifiedDeprecatedExtensions() {
            return JSON.parse(this.storageService.get('extensionsAssistant/deprecated', 0 /* StorageScope.PROFILE */, '[]'));
        }
        setNotifiedDeprecatedExtensions(notified) {
            this.storageService.store('extensionsAssistant/deprecated', JSON.stringify((0, arrays_1.distinct)([...this.getNotifiedDeprecatedExtensions(), ...notified])), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    exports.DeprecatedExtensionsChecker = DeprecatedExtensionsChecker;
    exports.DeprecatedExtensionsChecker = DeprecatedExtensionsChecker = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_1.IExtensionManagementService),
        __param(2, storage_1.IStorageService),
        __param(3, notification_1.INotificationService),
        __param(4, instantiation_1.IInstantiationService)
    ], DeprecatedExtensionsChecker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwcmVjYXRlZEV4dGVuc2lvbnNDaGVja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZGVwcmVjYXRlZEV4dGVuc2lvbnNDaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO1FBRTFELFlBQytDLDBCQUF1RCxFQUN4RSwwQkFBdUQsRUFDbEQsY0FBK0IsRUFDMUIsbUJBQXlDLEVBQ3hDLG9CQUEyQztZQUVuRixLQUFLLEVBQUUsQ0FBQztZQU5zQywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBRW5FLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUMxQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ3hDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFHbkYsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDcEUsTUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFDO2dCQUN6QixLQUFLLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDM0IsSUFBSSxLQUFLLElBQUksMEJBQTBCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUEsMkNBQWlCLEVBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQzt3QkFDN0ksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FB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
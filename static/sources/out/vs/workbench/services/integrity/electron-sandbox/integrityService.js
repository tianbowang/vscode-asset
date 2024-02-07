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
define(["require", "exports", "vs/nls", "vs/base/common/severity", "vs/base/common/uri", "vs/workbench/services/integrity/common/integrity", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/product/common/productService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/extensions", "vs/platform/opener/common/opener", "vs/base/common/network", "vs/platform/checksum/common/checksumService"], function (require, exports, nls_1, severity_1, uri_1, integrity_1, lifecycle_1, productService_1, notification_1, storage_1, extensions_1, opener_1, network_1, checksumService_1) {
    "use strict";
    var IntegrityService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrityService = void 0;
    class IntegrityStorage {
        static { this.KEY = 'integrityService'; }
        constructor(storageService) {
            this.storageService = storageService;
            this.value = this._read();
        }
        _read() {
            const jsonValue = this.storageService.get(IntegrityStorage.KEY, -1 /* StorageScope.APPLICATION */);
            if (!jsonValue) {
                return null;
            }
            try {
                return JSON.parse(jsonValue);
            }
            catch (err) {
                return null;
            }
        }
        get() {
            return this.value;
        }
        set(data) {
            this.value = data;
            this.storageService.store(IntegrityStorage.KEY, JSON.stringify(this.value), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
    }
    let IntegrityService = IntegrityService_1 = class IntegrityService {
        constructor(notificationService, storageService, lifecycleService, openerService, productService, checksumService) {
            this.notificationService = notificationService;
            this.lifecycleService = lifecycleService;
            this.openerService = openerService;
            this.productService = productService;
            this.checksumService = checksumService;
            this._storage = new IntegrityStorage(storageService);
            this._isPurePromise = this._isPure();
            this.isPure().then(r => {
                if (r.isPure) {
                    return; // all is good
                }
                this._prompt();
            });
        }
        _prompt() {
            const storedData = this._storage.get();
            if (storedData?.dontShowPrompt && storedData.commit === this.productService.commit) {
                return; // Do not prompt
            }
            const checksumFailMoreInfoUrl = this.productService.checksumFailMoreInfoUrl;
            const message = (0, nls_1.localize)('integrity.prompt', "Your {0} installation appears to be corrupt. Please reinstall.", this.productService.nameShort);
            if (checksumFailMoreInfoUrl) {
                this.notificationService.prompt(severity_1.default.Warning, message, [
                    {
                        label: (0, nls_1.localize)('integrity.moreInformation', "More Information"),
                        run: () => this.openerService.open(uri_1.URI.parse(checksumFailMoreInfoUrl))
                    },
                    {
                        label: (0, nls_1.localize)('integrity.dontShowAgain', "Don't Show Again"),
                        isSecondary: true,
                        run: () => this._storage.set({ dontShowPrompt: true, commit: this.productService.commit })
                    }
                ], {
                    sticky: true,
                    priority: notification_1.NotificationPriority.URGENT
                });
            }
            else {
                this.notificationService.notify({
                    severity: severity_1.default.Warning,
                    message,
                    sticky: true
                });
            }
        }
        isPure() {
            return this._isPurePromise;
        }
        async _isPure() {
            const expectedChecksums = this.productService.checksums || {};
            await this.lifecycleService.when(4 /* LifecyclePhase.Eventually */);
            const allResults = await Promise.all(Object.keys(expectedChecksums).map(filename => this._resolve(filename, expectedChecksums[filename])));
            let isPure = true;
            for (let i = 0, len = allResults.length; i < len; i++) {
                if (!allResults[i].isPure) {
                    isPure = false;
                    break;
                }
            }
            return {
                isPure: isPure,
                proof: allResults
            };
        }
        async _resolve(filename, expected) {
            const fileUri = network_1.FileAccess.asFileUri(filename);
            try {
                const checksum = await this.checksumService.checksum(fileUri);
                return IntegrityService_1._createChecksumPair(fileUri, checksum, expected);
            }
            catch (error) {
                return IntegrityService_1._createChecksumPair(fileUri, '', expected);
            }
        }
        static _createChecksumPair(uri, actual, expected) {
            return {
                uri: uri,
                actual: actual,
                expected: expected,
                isPure: (actual === expected)
            };
        }
    };
    exports.IntegrityService = IntegrityService;
    exports.IntegrityService = IntegrityService = IntegrityService_1 = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, storage_1.IStorageService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, opener_1.IOpenerService),
        __param(4, productService_1.IProductService),
        __param(5, checksumService_1.IChecksumService)
    ], IntegrityService);
    (0, extensions_1.registerSingleton)(integrity_1.IIntegrityService, IntegrityService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWdyaXR5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2ludGVncml0eS9lbGVjdHJvbi1zYW5kYm94L2ludGVncml0eVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9CaEcsTUFBTSxnQkFBZ0I7aUJBQ0csUUFBRyxHQUFHLGtCQUFrQixDQUFDO1FBS2pELFlBQVksY0FBK0I7WUFDMUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7WUFDckMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVPLEtBQUs7WUFDWixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLG9DQUEyQixDQUFDO1lBQzFGLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBQ0QsSUFBSSxDQUFDO2dCQUNKLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDZCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7UUFDRixDQUFDO1FBRUQsR0FBRztZQUNGLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRUQsR0FBRyxDQUFDLElBQXlCO1lBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsbUVBQWtELENBQUM7UUFDOUgsQ0FBQzs7SUFHSyxJQUFNLGdCQUFnQix3QkFBdEIsTUFBTSxnQkFBZ0I7UUFPNUIsWUFDd0MsbUJBQXlDLEVBQy9ELGNBQStCLEVBQ1osZ0JBQW1DLEVBQ3RDLGFBQTZCLEVBQzVCLGNBQStCLEVBQzlCLGVBQWlDO1lBTDdCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFFNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN0QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDNUIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzlCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUVwRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFckQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFckMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2QsT0FBTyxDQUFDLGNBQWM7Z0JBQ3ZCLENBQUM7Z0JBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLE9BQU87WUFDZCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksVUFBVSxFQUFFLGNBQWMsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3BGLE9BQU8sQ0FBQyxnQkFBZ0I7WUFDekIsQ0FBQztZQUVELE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQztZQUM1RSxNQUFNLE9BQU8sR0FBRyxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxnRUFBZ0UsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlJLElBQUksdUJBQXVCLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FDOUIsa0JBQVEsQ0FBQyxPQUFPLEVBQ2hCLE9BQU8sRUFDUDtvQkFDQzt3QkFDQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsa0JBQWtCLENBQUM7d0JBQ2hFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7cUJBQ3RFO29CQUNEO3dCQUNDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSxrQkFBa0IsQ0FBQzt3QkFDOUQsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7cUJBQzFGO2lCQUNELEVBQ0Q7b0JBQ0MsTUFBTSxFQUFFLElBQUk7b0JBQ1osUUFBUSxFQUFFLG1DQUFvQixDQUFDLE1BQU07aUJBQ3JDLENBQ0QsQ0FBQztZQUNILENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDO29CQUMvQixRQUFRLEVBQUUsa0JBQVEsQ0FBQyxPQUFPO29CQUMxQixPQUFPO29CQUNQLE1BQU0sRUFBRSxJQUFJO2lCQUNaLENBQUMsQ0FBQztZQUNKLENBQUM7UUFDRixDQUFDO1FBRUQsTUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM1QixDQUFDO1FBRU8sS0FBSyxDQUFDLE9BQU87WUFDcEIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7WUFFOUQsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxtQ0FBMkIsQ0FBQztZQUU1RCxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQWtCLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU1SixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUMzQixNQUFNLEdBQUcsS0FBSyxDQUFDO29CQUNmLE1BQU07Z0JBQ1AsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPO2dCQUNOLE1BQU0sRUFBRSxNQUFNO2dCQUNkLEtBQUssRUFBRSxVQUFVO2FBQ2pCLENBQUM7UUFDSCxDQUFDO1FBRU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUF5QixFQUFFLFFBQWdCO1lBQ2pFLE1BQU0sT0FBTyxHQUFHLG9CQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRS9DLElBQUksQ0FBQztnQkFDSixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUU5RCxPQUFPLGtCQUFnQixDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDMUUsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sa0JBQWdCLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNwRSxDQUFDO1FBQ0YsQ0FBQztRQUVPLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFRLEVBQUUsTUFBYyxFQUFFLFFBQWdCO1lBQzVFLE9BQU87Z0JBQ04sR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLE1BQU0sRUFBRSxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUM7YUFDN0IsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBOUdZLDRDQUFnQjsrQkFBaEIsZ0JBQWdCO1FBUTFCLFdBQUEsbUNBQW9CLENBQUE7UUFDcEIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLHVCQUFjLENBQUE7UUFDZCxXQUFBLGdDQUFlLENBQUE7UUFDZixXQUFBLGtDQUFnQixDQUFBO09BYk4sZ0JBQWdCLENBOEc1QjtJQUVELElBQUEsOEJBQWlCLEVBQUMsNkJBQWlCLEVBQUUsZ0JBQWdCLG9DQUE0QixDQUFDIn0=
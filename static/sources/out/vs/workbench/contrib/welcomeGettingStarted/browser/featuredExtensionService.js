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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/extensions", "vs/platform/product/common/productService", "vs/base/common/cancellation", "vs/platform/storage/common/storage", "vs/nls", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensions"], function (require, exports, instantiation_1, lifecycle_1, extensionManagement_1, extensions_1, productService_1, cancellation_1, storage_1, nls_1, extensions_2, extensions_3) {
    "use strict";
    var FeaturedExtensionsService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FeaturedExtensionsService = exports.IFeaturedExtensionsService = void 0;
    exports.IFeaturedExtensionsService = (0, instantiation_1.createDecorator)('featuredExtensionsService');
    var FeaturedExtensionMetadataType;
    (function (FeaturedExtensionMetadataType) {
        FeaturedExtensionMetadataType[FeaturedExtensionMetadataType["Title"] = 0] = "Title";
        FeaturedExtensionMetadataType[FeaturedExtensionMetadataType["Description"] = 1] = "Description";
        FeaturedExtensionMetadataType[FeaturedExtensionMetadataType["ImagePath"] = 2] = "ImagePath";
    })(FeaturedExtensionMetadataType || (FeaturedExtensionMetadataType = {}));
    let FeaturedExtensionsService = class FeaturedExtensionsService extends lifecycle_1.Disposable {
        static { FeaturedExtensionsService_1 = this; }
        static { this.STORAGE_KEY = 'workbench.welcomePage.extensionMetadata'; }
        constructor(extensionManagementService, extensionService, storageService, productService, galleryService) {
            super();
            this.extensionManagementService = extensionManagementService;
            this.extensionService = extensionService;
            this.storageService = storageService;
            this.productService = productService;
            this.galleryService = galleryService;
            this.ignoredExtensions = new Set();
            this._isInitialized = false;
            this.title = (0, nls_1.localize)('gettingStarted.featuredTitle', 'Recommended');
        }
        async getExtensions() {
            await this._init();
            const featuredExtensions = [];
            for (const extension of this.productService.featuredExtensions?.filter(e => !this.ignoredExtensions.has(e.id)) ?? []) {
                const resolvedExtension = await this.resolveExtension(extension);
                if (resolvedExtension) {
                    featuredExtensions.push(resolvedExtension);
                }
            }
            return featuredExtensions;
        }
        async _init() {
            if (this._isInitialized) {
                return;
            }
            const featuredExtensions = this.productService.featuredExtensions;
            if (!featuredExtensions) {
                this._isInitialized = true;
                return;
            }
            await this.extensionService.whenInstalledExtensionsRegistered();
            const installed = await this.extensionManagementService.getInstalled();
            for (const extension of featuredExtensions) {
                if (installed.some(e => extensions_2.ExtensionIdentifier.equals(e.identifier.id, extension.id))) {
                    this.ignoredExtensions.add(extension.id);
                }
                else {
                    let galleryExtension;
                    try {
                        galleryExtension = (await this.galleryService.getExtensions([{ id: extension.id }], cancellation_1.CancellationToken.None))[0];
                    }
                    catch (err) {
                        continue;
                    }
                    if (!await this.extensionManagementService.canInstall(galleryExtension)) {
                        this.ignoredExtensions.add(extension.id);
                    }
                }
            }
            this._isInitialized = true;
        }
        async resolveExtension(productMetadata) {
            const title = productMetadata.title ?? await this.getMetadata(productMetadata.id, 0 /* FeaturedExtensionMetadataType.Title */);
            const description = productMetadata.description ?? await this.getMetadata(productMetadata.id, 1 /* FeaturedExtensionMetadataType.Description */);
            const imagePath = productMetadata.imagePath ?? await this.getMetadata(productMetadata.id, 2 /* FeaturedExtensionMetadataType.ImagePath */);
            if (title && description && imagePath) {
                return {
                    id: productMetadata.id,
                    title: title,
                    description: description,
                    imagePath: imagePath,
                };
            }
            return undefined;
        }
        async getMetadata(extensionId, key) {
            const storageMetadata = this.getStorageData(extensionId);
            if (storageMetadata) {
                switch (key) {
                    case 0 /* FeaturedExtensionMetadataType.Title */: {
                        return storageMetadata.title;
                    }
                    case 1 /* FeaturedExtensionMetadataType.Description */: {
                        return storageMetadata.description;
                    }
                    case 2 /* FeaturedExtensionMetadataType.ImagePath */: {
                        return storageMetadata.imagePath;
                    }
                    default:
                        return undefined;
                }
            }
            return await this.getGalleryMetadata(extensionId, key);
        }
        getStorageData(extensionId) {
            const metadata = this.storageService.get(FeaturedExtensionsService_1.STORAGE_KEY + '.' + extensionId, -1 /* StorageScope.APPLICATION */);
            if (metadata) {
                const value = JSON.parse(metadata);
                const lastUpdateDate = new Date().getTime() - value.date;
                if (lastUpdateDate < 1000 * 60 * 60 * 24 * 7) {
                    return value;
                }
            }
            return undefined;
        }
        async getGalleryMetadata(extensionId, key) {
            const storageKey = FeaturedExtensionsService_1.STORAGE_KEY + '.' + extensionId;
            this.storageService.remove(storageKey, -1 /* StorageScope.APPLICATION */);
            let metadata;
            let galleryExtension;
            try {
                galleryExtension = (await this.galleryService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
            }
            catch (err) {
            }
            if (!galleryExtension) {
                return metadata;
            }
            switch (key) {
                case 0 /* FeaturedExtensionMetadataType.Title */: {
                    metadata = galleryExtension.displayName;
                    break;
                }
                case 1 /* FeaturedExtensionMetadataType.Description */: {
                    metadata = galleryExtension.description;
                    break;
                }
                case 2 /* FeaturedExtensionMetadataType.ImagePath */: {
                    metadata = galleryExtension.assets.icon?.uri;
                    break;
                }
            }
            this.storageService.store(storageKey, JSON.stringify({
                title: galleryExtension.displayName,
                description: galleryExtension.description,
                imagePath: galleryExtension.assets.icon?.uri,
                date: new Date().getTime()
            }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            return metadata;
        }
    };
    exports.FeaturedExtensionsService = FeaturedExtensionsService;
    exports.FeaturedExtensionsService = FeaturedExtensionsService = FeaturedExtensionsService_1 = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, extensions_3.IExtensionService),
        __param(2, storage_1.IStorageService),
        __param(3, productService_1.IProductService),
        __param(4, extensionManagement_1.IExtensionGalleryService)
    ], FeaturedExtensionsService);
    (0, extensions_1.registerSingleton)(exports.IFeaturedExtensionsService, FeaturedExtensionsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVhdHVyZWRFeHRlbnNpb25TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lR2V0dGluZ1N0YXJ0ZWQvYnJvd3Nlci9mZWF0dXJlZEV4dGVuc2lvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdCbkYsUUFBQSwwQkFBMEIsR0FBRyxJQUFBLCtCQUFlLEVBQTZCLDJCQUEyQixDQUFDLENBQUM7SUFTbkgsSUFBVyw2QkFJVjtJQUpELFdBQVcsNkJBQTZCO1FBQ3ZDLG1GQUFLLENBQUE7UUFDTCwrRkFBVyxDQUFBO1FBQ1gsMkZBQVMsQ0FBQTtJQUNWLENBQUMsRUFKVSw2QkFBNkIsS0FBN0IsNkJBQTZCLFFBSXZDO0lBRU0sSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBMEIsU0FBUSxzQkFBVTs7aUJBTWhDLGdCQUFXLEdBQUcseUNBQXlDLEFBQTVDLENBQTZDO1FBRWhGLFlBQzhCLDBCQUF3RSxFQUNsRixnQkFBb0QsRUFDdEQsY0FBZ0QsRUFDaEQsY0FBZ0QsRUFDdkMsY0FBeUQ7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFOc0MsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUNqRSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3JDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUMvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDdEIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBVjVFLHNCQUFpQixHQUFnQixJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQ25ELG1CQUFjLEdBQVksS0FBSyxDQUFDO1lBWXZDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsOEJBQThCLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDdEUsQ0FBQztR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
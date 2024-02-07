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
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/common/platform", "vs/platform/instantiation/common/extensions", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionNls", "vs/nls", "vs/base/common/semver/semver", "vs/base/common/types", "vs/base/common/errors", "vs/base/common/map", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/contextkey/common/contextkeys", "vs/workbench/services/editor/common/editorService", "vs/base/common/path", "vs/platform/extensionManagement/common/extensionStorage", "vs/base/common/arrays", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/platform/extensions/common/extensionValidator", "vs/base/common/severity", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, extensions_1, environmentService_1, extensionManagement_1, platform_1, extensions_2, resources_1, uri_1, files_1, async_1, buffer_1, log_1, cancellation_1, extensionManagement_2, extensionManagementUtil_1, lifecycle_1, extensionNls_1, nls_1, semver, types_1, errors_1, map_1, extensionManifestPropertiesService_1, extensionResourceLoader_1, actions_1, actionCommonCategories_1, contextkeys_1, editorService_1, path_1, extensionStorage_1, arrays_1, lifecycle_2, storage_1, productService_1, extensionValidator_1, severity_1, userDataProfile_1, userDataProfile_2, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebExtensionsScannerService = void 0;
    function isGalleryExtensionInfo(obj) {
        const galleryExtensionInfo = obj;
        return typeof galleryExtensionInfo?.id === 'string'
            && (galleryExtensionInfo.preRelease === undefined || typeof galleryExtensionInfo.preRelease === 'boolean')
            && (galleryExtensionInfo.migrateStorageFrom === undefined || typeof galleryExtensionInfo.migrateStorageFrom === 'string');
    }
    function isUriComponents(thing) {
        if (!thing) {
            return false;
        }
        return (0, types_1.isString)(thing.path) &&
            (0, types_1.isString)(thing.scheme);
    }
    let WebExtensionsScannerService = class WebExtensionsScannerService extends lifecycle_1.Disposable {
        constructor(environmentService, builtinExtensionsScannerService, fileService, logService, galleryService, extensionManifestPropertiesService, extensionResourceLoaderService, extensionStorageService, storageService, productService, userDataProfilesService, uriIdentityService, lifecycleService) {
            super();
            this.environmentService = environmentService;
            this.builtinExtensionsScannerService = builtinExtensionsScannerService;
            this.fileService = fileService;
            this.logService = logService;
            this.galleryService = galleryService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.extensionResourceLoaderService = extensionResourceLoaderService;
            this.extensionStorageService = extensionStorageService;
            this.storageService = storageService;
            this.productService = productService;
            this.userDataProfilesService = userDataProfilesService;
            this.uriIdentityService = uriIdentityService;
            this.systemExtensionsCacheResource = undefined;
            this.customBuiltinExtensionsCacheResource = undefined;
            this.resourcesAccessQueueMap = new map_1.ResourceMap();
            if (platform_1.isWeb) {
                this.systemExtensionsCacheResource = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, 'systemExtensionsCache.json');
                this.customBuiltinExtensionsCacheResource = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, 'customBuiltinExtensionsCache.json');
                // Eventually update caches
                lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(() => this.updateCaches());
            }
        }
        readCustomBuiltinExtensionsInfoFromEnv() {
            if (!this._customBuiltinExtensionsInfoPromise) {
                this._customBuiltinExtensionsInfoPromise = (async () => {
                    let extensions = [];
                    const extensionLocations = [];
                    const extensionGalleryResources = [];
                    const extensionsToMigrate = [];
                    const customBuiltinExtensionsInfo = this.environmentService.options && Array.isArray(this.environmentService.options.additionalBuiltinExtensions)
                        ? this.environmentService.options.additionalBuiltinExtensions.map(additionalBuiltinExtension => (0, types_1.isString)(additionalBuiltinExtension) ? { id: additionalBuiltinExtension } : additionalBuiltinExtension)
                        : [];
                    for (const e of customBuiltinExtensionsInfo) {
                        if (isGalleryExtensionInfo(e)) {
                            extensions.push({ id: e.id, preRelease: !!e.preRelease });
                            if (e.migrateStorageFrom) {
                                extensionsToMigrate.push([e.migrateStorageFrom, e.id]);
                            }
                        }
                        else if (isUriComponents(e)) {
                            const extensionLocation = uri_1.URI.revive(e);
                            if (this.extensionResourceLoaderService.isExtensionGalleryResource(extensionLocation)) {
                                extensionGalleryResources.push(extensionLocation);
                            }
                            else {
                                extensionLocations.push(extensionLocation);
                            }
                        }
                    }
                    if (extensions.length) {
                        extensions = await this.checkAdditionalBuiltinExtensions(extensions);
                    }
                    if (extensions.length) {
                        this.logService.info('Found additional builtin gallery extensions in env', extensions);
                    }
                    if (extensionLocations.length) {
                        this.logService.info('Found additional builtin location extensions in env', extensionLocations.map(e => e.toString()));
                    }
                    if (extensionGalleryResources.length) {
                        this.logService.info('Found additional builtin extension gallery resources in env', extensionGalleryResources.map(e => e.toString()));
                    }
                    return { extensions, extensionsToMigrate, extensionLocations, extensionGalleryResources };
                })();
            }
            return this._customBuiltinExtensionsInfoPromise;
        }
        async checkAdditionalBuiltinExtensions(extensions) {
            const extensionsControlManifest = await this.galleryService.getExtensionsControlManifest();
            const result = [];
            for (const extension of extensions) {
                if (extensionsControlManifest.malicious.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, { id: extension.id }))) {
                    this.logService.info(`Checking additional builtin extensions: Ignoring '${extension.id}' because it is reported to be malicious.`);
                    continue;
                }
                const deprecationInfo = extensionsControlManifest.deprecated[extension.id.toLowerCase()];
                if (deprecationInfo?.extension?.autoMigrate) {
                    const preReleaseExtensionId = deprecationInfo.extension.id;
                    this.logService.info(`Checking additional builtin extensions: '${extension.id}' is deprecated, instead using '${preReleaseExtensionId}'`);
                    result.push({ id: preReleaseExtensionId, preRelease: !!extension.preRelease });
                }
                else {
                    result.push(extension);
                }
            }
            return result;
        }
        /**
         * All system extensions bundled with the product
         */
        async readSystemExtensions() {
            const systemExtensions = await this.builtinExtensionsScannerService.scanBuiltinExtensions();
            const cachedSystemExtensions = await Promise.all((await this.readSystemExtensionsCache()).map(e => this.toScannedExtension(e, true, 0 /* ExtensionType.System */)));
            const result = new Map();
            for (const extension of [...systemExtensions, ...cachedSystemExtensions]) {
                const existing = result.get(extension.identifier.id.toLowerCase());
                if (existing) {
                    // Incase there are duplicates always take the latest version
                    if (semver.gt(existing.manifest.version, extension.manifest.version)) {
                        continue;
                    }
                }
                result.set(extension.identifier.id.toLowerCase(), extension);
            }
            return [...result.values()];
        }
        /**
         * All extensions defined via `additionalBuiltinExtensions` API
         */
        async readCustomBuiltinExtensions(scanOptions) {
            const [customBuiltinExtensionsFromLocations, customBuiltinExtensionsFromGallery] = await Promise.all([
                this.getCustomBuiltinExtensionsFromLocations(scanOptions),
                this.getCustomBuiltinExtensionsFromGallery(scanOptions),
            ]);
            const customBuiltinExtensions = [...customBuiltinExtensionsFromLocations, ...customBuiltinExtensionsFromGallery];
            await this.migrateExtensionsStorage(customBuiltinExtensions);
            return customBuiltinExtensions;
        }
        async getCustomBuiltinExtensionsFromLocations(scanOptions) {
            const { extensionLocations } = await this.readCustomBuiltinExtensionsInfoFromEnv();
            if (!extensionLocations.length) {
                return [];
            }
            const result = [];
            await Promise.allSettled(extensionLocations.map(async (extensionLocation) => {
                try {
                    const webExtension = await this.toWebExtension(extensionLocation);
                    const extension = await this.toScannedExtension(webExtension, true);
                    if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                        result.push(extension);
                    }
                    else {
                        this.logService.info(`Skipping invalid additional builtin extension ${webExtension.identifier.id}`);
                    }
                }
                catch (error) {
                    this.logService.info(`Error while fetching the additional builtin extension ${extensionLocation.toString()}.`, (0, errors_1.getErrorMessage)(error));
                }
            }));
            return result;
        }
        async getCustomBuiltinExtensionsFromGallery(scanOptions) {
            if (!this.galleryService.isEnabled()) {
                this.logService.info('Ignoring fetching additional builtin extensions from gallery as it is disabled.');
                return [];
            }
            const result = [];
            const { extensions, extensionGalleryResources } = await this.readCustomBuiltinExtensionsInfoFromEnv();
            try {
                const cacheValue = JSON.stringify({
                    extensions: extensions.sort((a, b) => a.id.localeCompare(b.id)),
                    extensionGalleryResources: extensionGalleryResources.map(e => e.toString()).sort()
                });
                const useCache = this.storageService.get('additionalBuiltinExtensions', -1 /* StorageScope.APPLICATION */, '{}') === cacheValue;
                const webExtensions = await (useCache ? this.getCustomBuiltinExtensionsFromCache() : this.updateCustomBuiltinExtensionsCache());
                if (webExtensions.length) {
                    await Promise.all(webExtensions.map(async (webExtension) => {
                        try {
                            const extension = await this.toScannedExtension(webExtension, true);
                            if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                                result.push(extension);
                            }
                            else {
                                this.logService.info(`Skipping invalid additional builtin gallery extension ${webExtension.identifier.id}`);
                            }
                        }
                        catch (error) {
                            this.logService.info(`Ignoring additional builtin extension ${webExtension.identifier.id} because there is an error while converting it into scanned extension`, (0, errors_1.getErrorMessage)(error));
                        }
                    }));
                }
                this.storageService.store('additionalBuiltinExtensions', cacheValue, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            catch (error) {
                this.logService.info('Ignoring following additional builtin extensions as there is an error while fetching them from gallery', extensions.map(({ id }) => id), (0, errors_1.getErrorMessage)(error));
            }
            return result;
        }
        async getCustomBuiltinExtensionsFromCache() {
            const cachedCustomBuiltinExtensions = await this.readCustomBuiltinExtensionsCache();
            const webExtensionsMap = new Map();
            for (const webExtension of cachedCustomBuiltinExtensions) {
                const existing = webExtensionsMap.get(webExtension.identifier.id.toLowerCase());
                if (existing) {
                    // Incase there are duplicates always take the latest version
                    if (semver.gt(existing.version, webExtension.version)) {
                        continue;
                    }
                }
                /* Update preRelease flag in the cache - https://github.com/microsoft/vscode/issues/142831 */
                if (webExtension.metadata?.isPreReleaseVersion && !webExtension.metadata?.preRelease) {
                    webExtension.metadata.preRelease = true;
                }
                webExtensionsMap.set(webExtension.identifier.id.toLowerCase(), webExtension);
            }
            return [...webExtensionsMap.values()];
        }
        async migrateExtensionsStorage(customBuiltinExtensions) {
            if (!this._migrateExtensionsStoragePromise) {
                this._migrateExtensionsStoragePromise = (async () => {
                    const { extensionsToMigrate } = await this.readCustomBuiltinExtensionsInfoFromEnv();
                    if (!extensionsToMigrate.length) {
                        return;
                    }
                    const fromExtensions = await this.galleryService.getExtensions(extensionsToMigrate.map(([id]) => ({ id })), cancellation_1.CancellationToken.None);
                    try {
                        await Promise.allSettled(extensionsToMigrate.map(async ([from, to]) => {
                            const toExtension = customBuiltinExtensions.find(extension => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, { id: to }));
                            if (toExtension) {
                                const fromExtension = fromExtensions.find(extension => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, { id: from }));
                                const fromExtensionManifest = fromExtension ? await this.galleryService.getManifest(fromExtension, cancellation_1.CancellationToken.None) : null;
                                const fromExtensionId = fromExtensionManifest ? (0, extensionManagementUtil_1.getExtensionId)(fromExtensionManifest.publisher, fromExtensionManifest.name) : from;
                                const toExtensionId = (0, extensionManagementUtil_1.getExtensionId)(toExtension.manifest.publisher, toExtension.manifest.name);
                                this.extensionStorageService.addToMigrationList(fromExtensionId, toExtensionId);
                            }
                            else {
                                this.logService.info(`Skipped migrating extension storage from '${from}' to '${to}', because the '${to}' extension is not found.`);
                            }
                        }));
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                })();
            }
            return this._migrateExtensionsStoragePromise;
        }
        async updateCaches() {
            await this.updateSystemExtensionsCache();
            await this.updateCustomBuiltinExtensionsCache();
        }
        async updateSystemExtensionsCache() {
            const systemExtensions = await this.builtinExtensionsScannerService.scanBuiltinExtensions();
            const cachedSystemExtensions = (await this.readSystemExtensionsCache())
                .filter(cached => {
                const systemExtension = systemExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, cached.identifier));
                return systemExtension && semver.gt(cached.version, systemExtension.manifest.version);
            });
            await this.writeSystemExtensionsCache(() => cachedSystemExtensions);
        }
        async updateCustomBuiltinExtensionsCache() {
            if (!this._updateCustomBuiltinExtensionsCachePromise) {
                this._updateCustomBuiltinExtensionsCachePromise = (async () => {
                    this.logService.info('Updating additional builtin extensions cache');
                    const { extensions, extensionGalleryResources } = await this.readCustomBuiltinExtensionsInfoFromEnv();
                    const [galleryWebExtensions, extensionGalleryResourceWebExtensions] = await Promise.all([
                        this.resolveBuiltinGalleryExtensions(extensions),
                        this.resolveBuiltinExtensionGalleryResources(extensionGalleryResources)
                    ]);
                    const webExtensionsMap = new Map();
                    for (const webExtension of [...galleryWebExtensions, ...extensionGalleryResourceWebExtensions]) {
                        webExtensionsMap.set(webExtension.identifier.id.toLowerCase(), webExtension);
                    }
                    await this.resolveDependenciesAndPackedExtensions(extensionGalleryResourceWebExtensions, webExtensionsMap);
                    const webExtensions = [...webExtensionsMap.values()];
                    await this.writeCustomBuiltinExtensionsCache(() => webExtensions);
                    return webExtensions;
                })();
            }
            return this._updateCustomBuiltinExtensionsCachePromise;
        }
        async resolveBuiltinExtensionGalleryResources(extensionGalleryResources) {
            if (extensionGalleryResources.length === 0) {
                return [];
            }
            const result = new Map();
            const extensionInfos = [];
            await Promise.all(extensionGalleryResources.map(async (extensionGalleryResource) => {
                const webExtension = await this.toWebExtensionFromExtensionGalleryResource(extensionGalleryResource);
                result.set(webExtension.identifier.id.toLowerCase(), webExtension);
                extensionInfos.push({ id: webExtension.identifier.id, version: webExtension.version });
            }));
            const galleryExtensions = await this.galleryService.getExtensions(extensionInfos, cancellation_1.CancellationToken.None);
            for (const galleryExtension of galleryExtensions) {
                const webExtension = result.get(galleryExtension.identifier.id.toLowerCase());
                if (webExtension) {
                    result.set(galleryExtension.identifier.id.toLowerCase(), {
                        ...webExtension,
                        identifier: { id: webExtension.identifier.id, uuid: galleryExtension.identifier.uuid },
                        readmeUri: galleryExtension.assets.readme ? uri_1.URI.parse(galleryExtension.assets.readme.uri) : undefined,
                        changelogUri: galleryExtension.assets.changelog ? uri_1.URI.parse(galleryExtension.assets.changelog.uri) : undefined,
                        metadata: { isPreReleaseVersion: galleryExtension.properties.isPreReleaseVersion, preRelease: galleryExtension.properties.isPreReleaseVersion, isBuiltin: true, pinned: true }
                    });
                }
            }
            return [...result.values()];
        }
        async resolveBuiltinGalleryExtensions(extensions) {
            if (extensions.length === 0) {
                return [];
            }
            const webExtensions = [];
            const galleryExtensionsMap = await this.getExtensionsWithDependenciesAndPackedExtensions(extensions);
            const missingExtensions = extensions.filter(({ id }) => !galleryExtensionsMap.has(id.toLowerCase()));
            if (missingExtensions.length) {
                this.logService.info('Skipping the additional builtin extensions because their compatible versions are not found.', missingExtensions);
            }
            await Promise.all([...galleryExtensionsMap.values()].map(async (gallery) => {
                try {
                    const webExtension = await this.toWebExtensionFromGallery(gallery, { isPreReleaseVersion: gallery.properties.isPreReleaseVersion, preRelease: gallery.properties.isPreReleaseVersion, isBuiltin: true });
                    webExtensions.push(webExtension);
                }
                catch (error) {
                    this.logService.info(`Ignoring additional builtin extension ${gallery.identifier.id} because there is an error while converting it into web extension`, (0, errors_1.getErrorMessage)(error));
                }
            }));
            return webExtensions;
        }
        async resolveDependenciesAndPackedExtensions(webExtensions, result) {
            const extensionInfos = [];
            for (const webExtension of webExtensions) {
                for (const e of [...(webExtension.manifest?.extensionDependencies ?? []), ...(webExtension.manifest?.extensionPack ?? [])]) {
                    if (!result.has(e.toLowerCase())) {
                        extensionInfos.push({ id: e, version: webExtension.version });
                    }
                }
            }
            if (extensionInfos.length === 0) {
                return;
            }
            const galleryExtensions = await this.getExtensionsWithDependenciesAndPackedExtensions(extensionInfos, new Set([...result.keys()]));
            await Promise.all([...galleryExtensions.values()].map(async (gallery) => {
                try {
                    const webExtension = await this.toWebExtensionFromGallery(gallery, { isPreReleaseVersion: gallery.properties.isPreReleaseVersion, preRelease: gallery.properties.isPreReleaseVersion, isBuiltin: true });
                    result.set(webExtension.identifier.id.toLowerCase(), webExtension);
                }
                catch (error) {
                    this.logService.info(`Ignoring additional builtin extension ${gallery.identifier.id} because there is an error while converting it into web extension`, (0, errors_1.getErrorMessage)(error));
                }
            }));
        }
        async getExtensionsWithDependenciesAndPackedExtensions(toGet, seen = new Set(), result = new Map()) {
            if (toGet.length === 0) {
                return result;
            }
            const extensions = await this.galleryService.getExtensions(toGet, { compatible: true, targetPlatform: "web" /* TargetPlatform.WEB */ }, cancellation_1.CancellationToken.None);
            const packsAndDependencies = new Map();
            for (const extension of extensions) {
                result.set(extension.identifier.id.toLowerCase(), extension);
                for (const id of [...((0, arrays_1.isNonEmptyArray)(extension.properties.dependencies) ? extension.properties.dependencies : []), ...((0, arrays_1.isNonEmptyArray)(extension.properties.extensionPack) ? extension.properties.extensionPack : [])]) {
                    if (!result.has(id.toLowerCase()) && !packsAndDependencies.has(id.toLowerCase()) && !seen.has(id.toLowerCase())) {
                        const extensionInfo = toGet.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e, extension.identifier));
                        packsAndDependencies.set(id.toLowerCase(), { id, preRelease: extensionInfo?.preRelease });
                    }
                }
            }
            return this.getExtensionsWithDependenciesAndPackedExtensions([...packsAndDependencies.values()].filter(({ id }) => !result.has(id.toLowerCase())), seen, result);
        }
        async scanSystemExtensions() {
            return this.readSystemExtensions();
        }
        async scanUserExtensions(profileLocation, scanOptions) {
            const extensions = new Map();
            // Custom builtin extensions defined through `additionalBuiltinExtensions` API
            const customBuiltinExtensions = await this.readCustomBuiltinExtensions(scanOptions);
            for (const extension of customBuiltinExtensions) {
                extensions.set(extension.identifier.id.toLowerCase(), extension);
            }
            // User Installed extensions
            const installedExtensions = await this.scanInstalledExtensions(profileLocation, scanOptions);
            for (const extension of installedExtensions) {
                extensions.set(extension.identifier.id.toLowerCase(), extension);
            }
            return [...extensions.values()];
        }
        async scanExtensionsUnderDevelopment() {
            const devExtensions = this.environmentService.options?.developmentOptions?.extensions;
            const result = [];
            if (Array.isArray(devExtensions)) {
                await Promise.allSettled(devExtensions.map(async (devExtension) => {
                    try {
                        const location = uri_1.URI.revive(devExtension);
                        if (uri_1.URI.isUri(location)) {
                            const webExtension = await this.toWebExtension(location);
                            result.push(await this.toScannedExtension(webExtension, false));
                        }
                        else {
                            this.logService.info(`Skipping the extension under development ${devExtension} as it is not URI type.`);
                        }
                    }
                    catch (error) {
                        this.logService.info(`Error while fetching the extension under development ${devExtension.toString()}.`, (0, errors_1.getErrorMessage)(error));
                    }
                }));
            }
            return result;
        }
        async scanExistingExtension(extensionLocation, extensionType, profileLocation) {
            if (extensionType === 0 /* ExtensionType.System */) {
                const systemExtensions = await this.scanSystemExtensions();
                return systemExtensions.find(e => e.location.toString() === extensionLocation.toString()) || null;
            }
            const userExtensions = await this.scanUserExtensions(profileLocation);
            return userExtensions.find(e => e.location.toString() === extensionLocation.toString()) || null;
        }
        async scanExtensionManifest(extensionLocation) {
            try {
                return await this.getExtensionManifest(extensionLocation);
            }
            catch (error) {
                this.logService.warn(`Error while fetching manifest from ${extensionLocation.toString()}`, (0, errors_1.getErrorMessage)(error));
                return null;
            }
        }
        async addExtensionFromGallery(galleryExtension, metadata, profileLocation) {
            const webExtension = await this.toWebExtensionFromGallery(galleryExtension, metadata);
            return this.addWebExtension(webExtension, profileLocation);
        }
        async addExtension(location, metadata, profileLocation) {
            const webExtension = await this.toWebExtension(location, undefined, undefined, undefined, undefined, undefined, undefined, metadata);
            const extension = await this.toScannedExtension(webExtension, false);
            await this.addToInstalledExtensions([webExtension], profileLocation);
            return extension;
        }
        async removeExtension(extension, profileLocation) {
            await this.writeInstalledExtensions(profileLocation, installedExtensions => installedExtensions.filter(installedExtension => !(0, extensionManagementUtil_1.areSameExtensions)(installedExtension.identifier, extension.identifier)));
        }
        async updateMetadata(extension, metadata, profileLocation) {
            let updatedExtension = undefined;
            await this.writeInstalledExtensions(profileLocation, installedExtensions => {
                const result = [];
                for (const installedExtension of installedExtensions) {
                    if ((0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, installedExtension.identifier)) {
                        installedExtension.metadata = { ...installedExtension.metadata, ...metadata };
                        updatedExtension = installedExtension;
                        result.push(installedExtension);
                    }
                    else {
                        result.push(installedExtension);
                    }
                }
                return result;
            });
            if (!updatedExtension) {
                throw new Error('Extension not found');
            }
            return this.toScannedExtension(updatedExtension, extension.isBuiltin);
        }
        async copyExtensions(fromProfileLocation, toProfileLocation, filter) {
            const extensionsToCopy = [];
            const fromWebExtensions = await this.readInstalledExtensions(fromProfileLocation);
            await Promise.all(fromWebExtensions.map(async (webExtension) => {
                const scannedExtension = await this.toScannedExtension(webExtension, false);
                if (filter(scannedExtension)) {
                    extensionsToCopy.push(webExtension);
                }
            }));
            if (extensionsToCopy.length) {
                await this.addToInstalledExtensions(extensionsToCopy, toProfileLocation);
            }
        }
        async addWebExtension(webExtension, profileLocation) {
            const isSystem = !!(await this.scanSystemExtensions()).find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, webExtension.identifier));
            const isBuiltin = !!webExtension.metadata?.isBuiltin;
            const extension = await this.toScannedExtension(webExtension, isBuiltin);
            if (isSystem) {
                await this.writeSystemExtensionsCache(systemExtensions => {
                    // Remove the existing extension to avoid duplicates
                    systemExtensions = systemExtensions.filter(extension => !(0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, webExtension.identifier));
                    systemExtensions.push(webExtension);
                    return systemExtensions;
                });
                return extension;
            }
            // Update custom builtin extensions to custom builtin extensions cache
            if (isBuiltin) {
                await this.writeCustomBuiltinExtensionsCache(customBuiltinExtensions => {
                    // Remove the existing extension to avoid duplicates
                    customBuiltinExtensions = customBuiltinExtensions.filter(extension => !(0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, webExtension.identifier));
                    customBuiltinExtensions.push(webExtension);
                    return customBuiltinExtensions;
                });
                const installedExtensions = await this.readInstalledExtensions(profileLocation);
                // Also add to installed extensions if it is installed to update its version
                if (installedExtensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, webExtension.identifier))) {
                    await this.addToInstalledExtensions([webExtension], profileLocation);
                }
                return extension;
            }
            // Add to installed extensions
            await this.addToInstalledExtensions([webExtension], profileLocation);
            return extension;
        }
        async addToInstalledExtensions(webExtensions, profileLocation) {
            await this.writeInstalledExtensions(profileLocation, installedExtensions => {
                // Remove the existing extension to avoid duplicates
                installedExtensions = installedExtensions.filter(installedExtension => webExtensions.some(extension => !(0, extensionManagementUtil_1.areSameExtensions)(installedExtension.identifier, extension.identifier)));
                installedExtensions.push(...webExtensions);
                return installedExtensions;
            });
        }
        async scanInstalledExtensions(profileLocation, scanOptions) {
            let installedExtensions = await this.readInstalledExtensions(profileLocation);
            // If current profile is not a default profile, then add the application extensions to the list
            if (!this.uriIdentityService.extUri.isEqual(profileLocation, this.userDataProfilesService.defaultProfile.extensionsResource)) {
                // Remove application extensions from the non default profile
                installedExtensions = installedExtensions.filter(i => !i.metadata?.isApplicationScoped);
                // Add application extensions from the default profile to the list
                const defaultProfileExtensions = await this.readInstalledExtensions(this.userDataProfilesService.defaultProfile.extensionsResource);
                installedExtensions.push(...defaultProfileExtensions.filter(i => i.metadata?.isApplicationScoped));
            }
            installedExtensions.sort((a, b) => a.identifier.id < b.identifier.id ? -1 : a.identifier.id > b.identifier.id ? 1 : semver.rcompare(a.version, b.version));
            const result = new Map();
            for (const webExtension of installedExtensions) {
                const existing = result.get(webExtension.identifier.id.toLowerCase());
                if (existing && semver.gt(existing.manifest.version, webExtension.version)) {
                    continue;
                }
                const extension = await this.toScannedExtension(webExtension, false);
                if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                    result.set(extension.identifier.id.toLowerCase(), extension);
                }
                else {
                    this.logService.info(`Skipping invalid installed extension ${webExtension.identifier.id}`);
                }
            }
            return [...result.values()];
        }
        async toWebExtensionFromGallery(galleryExtension, metadata) {
            const extensionLocation = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({
                publisher: galleryExtension.publisher,
                name: galleryExtension.name,
                version: galleryExtension.version,
                targetPlatform: galleryExtension.properties.targetPlatform === "web" /* TargetPlatform.WEB */ ? "web" /* TargetPlatform.WEB */ : undefined
            }, 'extension');
            if (!extensionLocation) {
                throw new Error('No extension gallery service configured.');
            }
            return this.toWebExtensionFromExtensionGalleryResource(extensionLocation, galleryExtension.identifier, galleryExtension.assets.readme ? uri_1.URI.parse(galleryExtension.assets.readme.uri) : undefined, galleryExtension.assets.changelog ? uri_1.URI.parse(galleryExtension.assets.changelog.uri) : undefined, metadata);
        }
        async toWebExtensionFromExtensionGalleryResource(extensionLocation, identifier, readmeUri, changelogUri, metadata) {
            const extensionResources = await this.listExtensionResources(extensionLocation);
            const packageNLSResources = this.getPackageNLSResourceMapFromResources(extensionResources);
            // The fallback, in English, will fill in any gaps missing in the localized file.
            const fallbackPackageNLSResource = extensionResources.find(e => (0, path_1.basename)(e) === 'package.nls.json');
            return this.toWebExtension(extensionLocation, identifier, undefined, packageNLSResources, fallbackPackageNLSResource ? uri_1.URI.parse(fallbackPackageNLSResource) : null, readmeUri, changelogUri, metadata);
        }
        getPackageNLSResourceMapFromResources(extensionResources) {
            const packageNLSResources = new Map();
            extensionResources.forEach(e => {
                // Grab all package.nls.{language}.json files
                const regexResult = /package\.nls\.([\w-]+)\.json/.exec((0, path_1.basename)(e));
                if (regexResult?.[1]) {
                    packageNLSResources.set(regexResult[1], uri_1.URI.parse(e));
                }
            });
            return packageNLSResources;
        }
        async toWebExtension(extensionLocation, identifier, manifest, packageNLSUris, fallbackPackageNLSUri, readmeUri, changelogUri, metadata) {
            if (!manifest) {
                try {
                    manifest = await this.getExtensionManifest(extensionLocation);
                }
                catch (error) {
                    throw new Error(`Error while fetching manifest from the location '${extensionLocation.toString()}'. ${(0, errors_1.getErrorMessage)(error)}`);
                }
            }
            if (!this.extensionManifestPropertiesService.canExecuteOnWeb(manifest)) {
                throw new Error((0, nls_1.localize)('not a web extension', "Cannot add '{0}' because this extension is not a web extension.", manifest.displayName || manifest.name));
            }
            if (fallbackPackageNLSUri === undefined) {
                try {
                    fallbackPackageNLSUri = (0, resources_1.joinPath)(extensionLocation, 'package.nls.json');
                    await this.extensionResourceLoaderService.readExtensionResource(fallbackPackageNLSUri);
                }
                catch (error) {
                    fallbackPackageNLSUri = undefined;
                }
            }
            const defaultManifestTranslations = fallbackPackageNLSUri ? uri_1.URI.isUri(fallbackPackageNLSUri) ? await this.getTranslations(fallbackPackageNLSUri) : fallbackPackageNLSUri : null;
            return {
                identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name), uuid: identifier?.uuid },
                version: manifest.version,
                location: extensionLocation,
                manifest,
                readmeUri,
                changelogUri,
                packageNLSUris,
                fallbackPackageNLSUri: uri_1.URI.isUri(fallbackPackageNLSUri) ? fallbackPackageNLSUri : undefined,
                defaultManifestTranslations,
                metadata,
            };
        }
        async toScannedExtension(webExtension, isBuiltin, type = 1 /* ExtensionType.User */) {
            const validations = [];
            let manifest = webExtension.manifest;
            if (!manifest) {
                try {
                    manifest = await this.getExtensionManifest(webExtension.location);
                }
                catch (error) {
                    validations.push([severity_1.default.Error, `Error while fetching manifest from the location '${webExtension.location}'. ${(0, errors_1.getErrorMessage)(error)}`]);
                }
            }
            if (!manifest) {
                const [publisher, name] = webExtension.identifier.id.split('.');
                manifest = {
                    name,
                    publisher,
                    version: webExtension.version,
                    engines: { vscode: '*' },
                };
            }
            const packageNLSUri = webExtension.packageNLSUris?.get(platform_1.Language.value().toLowerCase());
            const fallbackPackageNLS = webExtension.defaultManifestTranslations ?? webExtension.fallbackPackageNLSUri;
            if (packageNLSUri) {
                manifest = await this.translateManifest(manifest, packageNLSUri, fallbackPackageNLS);
            }
            else if (fallbackPackageNLS) {
                manifest = await this.translateManifest(manifest, fallbackPackageNLS);
            }
            const uuid = webExtension.metadata?.id;
            validations.push(...(0, extensionValidator_1.validateExtensionManifest)(this.productService.version, this.productService.date, webExtension.location, manifest, false));
            let isValid = true;
            for (const [severity, message] of validations) {
                if (severity === severity_1.default.Error) {
                    isValid = false;
                    this.logService.error(message);
                }
            }
            return {
                identifier: { id: webExtension.identifier.id, uuid: webExtension.identifier.uuid || uuid },
                location: webExtension.location,
                manifest,
                type,
                isBuiltin,
                readmeUrl: webExtension.readmeUri,
                changelogUrl: webExtension.changelogUri,
                metadata: webExtension.metadata,
                targetPlatform: "web" /* TargetPlatform.WEB */,
                validations,
                isValid
            };
        }
        async listExtensionResources(extensionLocation) {
            try {
                const result = await this.extensionResourceLoaderService.readExtensionResource(extensionLocation);
                return JSON.parse(result);
            }
            catch (error) {
                this.logService.warn('Error while fetching extension resources list', (0, errors_1.getErrorMessage)(error));
            }
            return [];
        }
        async translateManifest(manifest, nlsURL, fallbackNLS) {
            try {
                const translations = uri_1.URI.isUri(nlsURL) ? await this.getTranslations(nlsURL) : nlsURL;
                const fallbackTranslations = uri_1.URI.isUri(fallbackNLS) ? await this.getTranslations(fallbackNLS) : fallbackNLS;
                if (translations) {
                    manifest = (0, extensionNls_1.localizeManifest)(this.logService, manifest, translations, fallbackTranslations);
                }
            }
            catch (error) { /* ignore */ }
            return manifest;
        }
        async getExtensionManifest(location) {
            const url = (0, resources_1.joinPath)(location, 'package.json');
            const content = await this.extensionResourceLoaderService.readExtensionResource(url);
            return JSON.parse(content);
        }
        async getTranslations(nlsUrl) {
            try {
                const content = await this.extensionResourceLoaderService.readExtensionResource(nlsUrl);
                return JSON.parse(content);
            }
            catch (error) {
                this.logService.error(`Error while fetching translations of an extension`, nlsUrl.toString(), (0, errors_1.getErrorMessage)(error));
            }
            return undefined;
        }
        async readInstalledExtensions(profileLocation) {
            return this.withWebExtensions(profileLocation);
        }
        writeInstalledExtensions(profileLocation, updateFn) {
            return this.withWebExtensions(profileLocation, updateFn);
        }
        readCustomBuiltinExtensionsCache() {
            return this.withWebExtensions(this.customBuiltinExtensionsCacheResource);
        }
        writeCustomBuiltinExtensionsCache(updateFn) {
            return this.withWebExtensions(this.customBuiltinExtensionsCacheResource, updateFn);
        }
        readSystemExtensionsCache() {
            return this.withWebExtensions(this.systemExtensionsCacheResource);
        }
        writeSystemExtensionsCache(updateFn) {
            return this.withWebExtensions(this.systemExtensionsCacheResource, updateFn);
        }
        async withWebExtensions(file, updateFn) {
            if (!file) {
                return [];
            }
            return this.getResourceAccessQueue(file).queue(async () => {
                let webExtensions = [];
                // Read
                try {
                    const content = await this.fileService.readFile(file);
                    const storedWebExtensions = JSON.parse(content.value.toString());
                    for (const e of storedWebExtensions) {
                        if (!e.location || !e.identifier || !e.version) {
                            this.logService.info('Ignoring invalid extension while scanning', storedWebExtensions);
                            continue;
                        }
                        let packageNLSUris;
                        if (e.packageNLSUris) {
                            packageNLSUris = new Map();
                            Object.entries(e.packageNLSUris).forEach(([key, value]) => packageNLSUris.set(key, uri_1.URI.revive(value)));
                        }
                        webExtensions.push({
                            identifier: e.identifier,
                            version: e.version,
                            location: uri_1.URI.revive(e.location),
                            manifest: e.manifest,
                            readmeUri: uri_1.URI.revive(e.readmeUri),
                            changelogUri: uri_1.URI.revive(e.changelogUri),
                            packageNLSUris,
                            fallbackPackageNLSUri: uri_1.URI.revive(e.fallbackPackageNLSUri),
                            defaultManifestTranslations: e.defaultManifestTranslations,
                            packageNLSUri: uri_1.URI.revive(e.packageNLSUri),
                            metadata: e.metadata,
                        });
                    }
                    try {
                        webExtensions = await this.migrateWebExtensions(webExtensions, file);
                    }
                    catch (error) {
                        this.logService.error(`Error while migrating scanned extensions in ${file.toString()}`, (0, errors_1.getErrorMessage)(error));
                    }
                }
                catch (error) {
                    /* Ignore */
                    if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        this.logService.error(error);
                    }
                }
                // Update
                if (updateFn) {
                    await this.storeWebExtensions(webExtensions = updateFn(webExtensions), file);
                }
                return webExtensions;
            });
        }
        async migrateWebExtensions(webExtensions, file) {
            let update = false;
            webExtensions = await Promise.all(webExtensions.map(async (webExtension) => {
                if (!webExtension.manifest) {
                    try {
                        webExtension.manifest = await this.getExtensionManifest(webExtension.location);
                        update = true;
                    }
                    catch (error) {
                        this.logService.error(`Error while updating manifest of an extension in ${file.toString()}`, webExtension.identifier.id, (0, errors_1.getErrorMessage)(error));
                    }
                }
                if ((0, types_1.isUndefined)(webExtension.defaultManifestTranslations)) {
                    if (webExtension.fallbackPackageNLSUri) {
                        try {
                            const content = await this.extensionResourceLoaderService.readExtensionResource(webExtension.fallbackPackageNLSUri);
                            webExtension.defaultManifestTranslations = JSON.parse(content);
                            update = true;
                        }
                        catch (error) {
                            this.logService.error(`Error while fetching default manifest translations of an extension`, webExtension.identifier.id, (0, errors_1.getErrorMessage)(error));
                        }
                    }
                    else {
                        update = true;
                        webExtension.defaultManifestTranslations = null;
                    }
                }
                const migratedLocation = (0, extensionResourceLoader_1.migratePlatformSpecificExtensionGalleryResourceURL)(webExtension.location, "web" /* TargetPlatform.WEB */);
                if (migratedLocation) {
                    update = true;
                    webExtension.location = migratedLocation;
                }
                if ((0, types_1.isUndefined)(webExtension.metadata?.hasPreReleaseVersion) && webExtension.metadata?.preRelease) {
                    update = true;
                    webExtension.metadata.hasPreReleaseVersion = true;
                }
                return webExtension;
            }));
            if (update) {
                await this.storeWebExtensions(webExtensions, file);
            }
            return webExtensions;
        }
        async storeWebExtensions(webExtensions, file) {
            function toStringDictionary(dictionary) {
                if (!dictionary) {
                    return undefined;
                }
                const result = Object.create(null);
                dictionary.forEach((value, key) => result[key] = value.toJSON());
                return result;
            }
            const storedWebExtensions = webExtensions.map(e => ({
                identifier: e.identifier,
                version: e.version,
                manifest: e.manifest,
                location: e.location.toJSON(),
                readmeUri: e.readmeUri?.toJSON(),
                changelogUri: e.changelogUri?.toJSON(),
                packageNLSUris: toStringDictionary(e.packageNLSUris),
                defaultManifestTranslations: e.defaultManifestTranslations,
                fallbackPackageNLSUri: e.fallbackPackageNLSUri?.toJSON(),
                metadata: e.metadata
            }));
            await this.fileService.writeFile(file, buffer_1.VSBuffer.fromString(JSON.stringify(storedWebExtensions)));
        }
        getResourceAccessQueue(file) {
            let resourceQueue = this.resourcesAccessQueueMap.get(file);
            if (!resourceQueue) {
                this.resourcesAccessQueueMap.set(file, resourceQueue = new async_1.Queue());
            }
            return resourceQueue;
        }
    };
    exports.WebExtensionsScannerService = WebExtensionsScannerService;
    exports.WebExtensionsScannerService = WebExtensionsScannerService = __decorate([
        __param(0, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(1, extensions_1.IBuiltinExtensionsScannerService),
        __param(2, files_1.IFileService),
        __param(3, log_1.ILogService),
        __param(4, extensionManagement_2.IExtensionGalleryService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(6, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(7, extensionStorage_1.IExtensionStorageService),
        __param(8, storage_1.IStorageService),
        __param(9, productService_1.IProductService),
        __param(10, userDataProfile_2.IUserDataProfilesService),
        __param(11, uriIdentity_1.IUriIdentityService),
        __param(12, lifecycle_2.ILifecycleService)
    ], WebExtensionsScannerService);
    if (platform_1.isWeb) {
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.extensions.action.openInstalledWebExtensionsResource',
                    title: (0, nls_1.localize2)('openInstalledWebExtensionsResource', 'Open Installed Web Extensions Resource'),
                    category: actionCommonCategories_1.Categories.Developer,
                    f1: true,
                    precondition: contextkeys_1.IsWebContext
                });
            }
            run(serviceAccessor) {
                const editorService = serviceAccessor.get(editorService_1.IEditorService);
                const userDataProfileService = serviceAccessor.get(userDataProfile_1.IUserDataProfileService);
                editorService.openEditor({ resource: userDataProfileService.currentProfile.extensionsResource });
            }
        });
    }
    (0, extensions_2.registerSingleton)(extensionManagement_1.IWebExtensionsScannerService, WebExtensionsScannerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViRXh0ZW5zaW9uc1NjYW5uZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9icm93c2VyL3dlYkV4dGVuc2lvbnNTY2FubmVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE4Q2hHLFNBQVMsc0JBQXNCLENBQUMsR0FBWTtRQUMzQyxNQUFNLG9CQUFvQixHQUFHLEdBQXVDLENBQUM7UUFDckUsT0FBTyxPQUFPLG9CQUFvQixFQUFFLEVBQUUsS0FBSyxRQUFRO2VBQy9DLENBQUMsb0JBQW9CLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxPQUFPLG9CQUFvQixDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUM7ZUFDdkcsQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsS0FBSyxTQUFTLElBQUksT0FBTyxvQkFBb0IsQ0FBQyxrQkFBa0IsS0FBSyxRQUFRLENBQUMsQ0FBQztJQUM1SCxDQUFDO0lBRUQsU0FBUyxlQUFlLENBQUMsS0FBYztRQUN0QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxPQUFPLElBQUEsZ0JBQVEsRUFBTyxLQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2pDLElBQUEsZ0JBQVEsRUFBTyxLQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQWdDTSxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO1FBUTFELFlBQ3NDLGtCQUF3RSxFQUMzRSwrQkFBa0YsRUFDdEcsV0FBMEMsRUFDM0MsVUFBd0MsRUFDM0IsY0FBeUQsRUFDOUMsa0NBQXdGLEVBQzVGLDhCQUFnRixFQUN2Rix1QkFBa0UsRUFDM0UsY0FBZ0QsRUFD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
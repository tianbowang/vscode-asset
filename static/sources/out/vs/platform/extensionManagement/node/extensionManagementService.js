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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/node/pfs", "vs/base/node/zip", "vs/nls", "vs/platform/download/common/download", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/abstractExtensionManagementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionDownloader", "vs/platform/extensionManagement/node/extensionLifecycle", "vs/platform/extensionManagement/node/extensionManagementUtil", "vs/platform/extensionManagement/node/extensionsManifestCache", "vs/platform/extensionManagement/node/extensionsWatcher", "vs/platform/extensions/common/extensionValidator", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, async_1, buffer_1, cancellation_1, errorMessage_1, errors_1, event_1, hash_1, lifecycle_1, map_1, network_1, path, resources_1, semver, types_1, uri_1, uuid_1, pfs, zip_1, nls, download_1, environment_1, abstractExtensionManagementService_1, extensionManagement_1, extensionManagementUtil_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionDownloader_1, extensionLifecycle_1, extensionManagementUtil_2, extensionsManifestCache_1, extensionsWatcher_1, extensionValidator_1, files_1, instantiation_1, log_1, productService_1, telemetry_1, uriIdentity_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InstallGalleryExtensionTask = exports.ExtensionsScanner = exports.ExtensionManagementService = exports.INativeServerExtensionManagementService = void 0;
    exports.INativeServerExtensionManagementService = (0, instantiation_1.refineServiceDecorator)(extensionManagement_1.IExtensionManagementService);
    const DELETED_FOLDER_POSTFIX = '.vsctmp';
    let ExtensionManagementService = class ExtensionManagementService extends abstractExtensionManagementService_1.AbstractExtensionManagementService {
        constructor(galleryService, telemetryService, logService, environmentService, extensionsScannerService, extensionsProfileScannerService, downloadService, instantiationService, fileService, productService, uriIdentityService, userDataProfilesService) {
            super(galleryService, telemetryService, uriIdentityService, logService, productService, userDataProfilesService);
            this.extensionsScannerService = extensionsScannerService;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.downloadService = downloadService;
            this.fileService = fileService;
            this.installGalleryExtensionsTasks = new Map();
            this.knownDirectories = new map_1.ResourceSet();
            const extensionLifecycle = this._register(instantiationService.createInstance(extensionLifecycle_1.ExtensionsLifecycle));
            this.extensionsScanner = this._register(instantiationService.createInstance(ExtensionsScanner, extension => extensionLifecycle.postUninstall(extension)));
            this.manifestCache = this._register(new extensionsManifestCache_1.ExtensionsManifestCache(userDataProfilesService, fileService, uriIdentityService, this, this.logService));
            this.extensionsDownloader = this._register(instantiationService.createInstance(extensionDownloader_1.ExtensionsDownloader));
            const extensionsWatcher = this._register(new extensionsWatcher_1.ExtensionsWatcher(this, this.extensionsScannerService, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService));
            this._register(extensionsWatcher.onDidChangeExtensionsByAnotherSource(e => this.onDidChangeExtensionsFromAnotherSource(e)));
            this.watchForExtensionsNotInstalledBySystem();
        }
        getTargetPlatform() {
            if (!this._targetPlatformPromise) {
                this._targetPlatformPromise = (0, extensionManagementUtil_1.computeTargetPlatform)(this.fileService, this.logService);
            }
            return this._targetPlatformPromise;
        }
        async zip(extension) {
            this.logService.trace('ExtensionManagementService#zip', extension.identifier.id);
            const files = await this.collectFiles(extension);
            const location = await (0, zip_1.zip)((0, resources_1.joinPath)(this.extensionsDownloader.extensionsDownloadDir, (0, uuid_1.generateUuid)()).fsPath, files);
            return uri_1.URI.file(location);
        }
        async unzip(zipLocation) {
            this.logService.trace('ExtensionManagementService#unzip', zipLocation.toString());
            const local = await this.install(zipLocation);
            return local.identifier;
        }
        async getManifest(vsix) {
            const { location, cleanup } = await this.downloadVsix(vsix);
            const zipPath = path.resolve(location.fsPath);
            try {
                return await (0, extensionManagementUtil_2.getManifest)(zipPath);
            }
            finally {
                await cleanup();
            }
        }
        getInstalled(type, profileLocation = this.userDataProfilesService.defaultProfile.extensionsResource) {
            return this.extensionsScanner.scanExtensions(type ?? null, profileLocation);
        }
        scanAllUserInstalledExtensions() {
            return this.extensionsScanner.scanAllUserExtensions(false);
        }
        scanInstalledExtensionAtLocation(location) {
            return this.extensionsScanner.scanUserExtensionAtLocation(location);
        }
        async install(vsix, options = {}) {
            this.logService.trace('ExtensionManagementService#install', vsix.toString());
            const { location, cleanup } = await this.downloadVsix(vsix);
            try {
                const manifest = await (0, extensionManagementUtil_2.getManifest)(path.resolve(location.fsPath));
                const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
                if (manifest.engines && manifest.engines.vscode && !(0, extensionValidator_1.isEngineValid)(manifest.engines.vscode, this.productService.version, this.productService.date)) {
                    throw new Error(nls.localize('incompatible', "Unable to install extension '{0}' as it is not compatible with VS Code '{1}'.", extensionId, this.productService.version));
                }
                const results = await this.installExtensions([{ manifest, extension: location, options }]);
                const result = results.find(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, { id: extensionId }));
                if (result?.local) {
                    return result.local;
                }
                if (result?.error) {
                    throw result.error;
                }
                throw (0, abstractExtensionManagementService_1.toExtensionManagementError)(new Error(`Unknown error while installing extension ${extensionId}`));
            }
            finally {
                await cleanup();
            }
        }
        async installFromLocation(location, profileLocation) {
            this.logService.trace('ExtensionManagementService#installFromLocation', location.toString());
            const local = await this.extensionsScanner.scanUserExtensionAtLocation(location);
            if (!local) {
                throw new Error(`Cannot find a valid extension from the location ${location.toString()}`);
            }
            await this.addExtensionsToProfile([[local, undefined]], profileLocation);
            this.logService.info('Successfully installed extension', local.identifier.id, profileLocation.toString());
            return local;
        }
        async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
            this.logService.trace('ExtensionManagementService#installExtensionsFromProfile', extensions, fromProfileLocation.toString(), toProfileLocation.toString());
            const extensionsToInstall = (await this.extensionsScanner.scanExtensions(1 /* ExtensionType.User */, fromProfileLocation)).filter(e => extensions.some(id => (0, extensionManagementUtil_1.areSameExtensions)(id, e.identifier)));
            if (extensionsToInstall.length) {
                const metadata = await Promise.all(extensionsToInstall.map(e => this.extensionsScanner.scanMetadata(e, fromProfileLocation)));
                await this.addExtensionsToProfile(extensionsToInstall.map((e, index) => [e, metadata[index]]), toProfileLocation);
                this.logService.info('Successfully installed extensions', extensionsToInstall.map(e => e.identifier.id), toProfileLocation.toString());
            }
            return extensionsToInstall;
        }
        async updateMetadata(local, metadata, profileLocation = this.userDataProfilesService.defaultProfile.extensionsResource) {
            this.logService.trace('ExtensionManagementService#updateMetadata', local.identifier.id);
            if (metadata.isPreReleaseVersion) {
                metadata.preRelease = true;
                metadata.hasPreReleaseVersion = true;
            }
            // unset if false
            if (metadata.isMachineScoped === false) {
                metadata.isMachineScoped = undefined;
            }
            if (metadata.isBuiltin === false) {
                metadata.isBuiltin = undefined;
            }
            if (metadata.pinned === false) {
                metadata.pinned = undefined;
            }
            local = await this.extensionsScanner.updateMetadata(local, metadata, profileLocation);
            this.manifestCache.invalidate(profileLocation);
            this._onDidUpdateExtensionMetadata.fire(local);
            return local;
        }
        async reinstallFromGallery(extension) {
            this.logService.trace('ExtensionManagementService#reinstallFromGallery', extension.identifier.id);
            if (!this.galleryService.isEnabled()) {
                throw new Error(nls.localize('MarketPlaceDisabled', "Marketplace is not enabled"));
            }
            const targetPlatform = await this.getTargetPlatform();
            const [galleryExtension] = await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: extension.preRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
            if (!galleryExtension) {
                throw new Error(nls.localize('Not a Marketplace extension', "Only Marketplace Extensions can be reinstalled"));
            }
            await this.extensionsScanner.setUninstalled(extension);
            try {
                await this.extensionsScanner.removeUninstalledExtension(extension);
            }
            catch (e) {
                throw new Error(nls.localize('removeError', "Error while removing the extension: {0}. Please Quit and Start VS Code before trying again.", (0, errorMessage_1.toErrorMessage)(e)));
            }
            return this.installFromGallery(galleryExtension);
        }
        copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
            return this.extensionsScanner.copyExtension(extension, fromProfileLocation, toProfileLocation, metadata);
        }
        copyExtensions(fromProfileLocation, toProfileLocation) {
            return this.extensionsScanner.copyExtensions(fromProfileLocation, toProfileLocation);
        }
        markAsUninstalled(...extensions) {
            return this.extensionsScanner.setUninstalled(...extensions);
        }
        async cleanUp() {
            this.logService.trace('ExtensionManagementService#cleanUp');
            try {
                await this.extensionsScanner.cleanUp();
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        async download(extension, operation, donotVerifySignature) {
            const { location } = await this.extensionsDownloader.download(extension, operation, !donotVerifySignature);
            return location;
        }
        async downloadVsix(vsix) {
            if (vsix.scheme === network_1.Schemas.file) {
                return { location: vsix, async cleanup() { } };
            }
            this.logService.trace('Downloading extension from', vsix.toString());
            const location = (0, resources_1.joinPath)(this.extensionsDownloader.extensionsDownloadDir, (0, uuid_1.generateUuid)());
            await this.downloadService.download(vsix, location);
            this.logService.info('Downloaded extension to', location.toString());
            const cleanup = async () => {
                try {
                    await this.fileService.del(location);
                }
                catch (error) {
                    this.logService.error(error);
                }
            };
            return { location, cleanup };
        }
        getCurrentExtensionsManifestLocation() {
            return this.userDataProfilesService.defaultProfile.extensionsResource;
        }
        createInstallExtensionTask(manifest, extension, options) {
            if (uri_1.URI.isUri(extension)) {
                return new InstallVSIXTask(manifest, extension, options, this.galleryService, this.extensionsScanner, this.uriIdentityService, this.userDataProfilesService, this.extensionsScannerService, this.extensionsProfileScannerService, this.logService);
            }
            const key = extensionManagementUtil_1.ExtensionKey.create(extension).toString();
            let installExtensionTask = this.installGalleryExtensionsTasks.get(key);
            if (!installExtensionTask) {
                this.installGalleryExtensionsTasks.set(key, installExtensionTask = new InstallGalleryExtensionTask(manifest, extension, options, this.extensionsDownloader, this.extensionsScanner, this.uriIdentityService, this.userDataProfilesService, this.extensionsScannerService, this.extensionsProfileScannerService, this.logService));
                installExtensionTask.waitUntilTaskIsFinished().finally(() => this.installGalleryExtensionsTasks.delete(key));
            }
            return installExtensionTask;
        }
        createUninstallExtensionTask(extension, options) {
            return new UninstallExtensionTask(extension, options.profileLocation, this.extensionsProfileScannerService);
        }
        async collectFiles(extension) {
            const collectFilesFromDirectory = async (dir) => {
                let entries = await pfs.Promises.readdir(dir);
                entries = entries.map(e => path.join(dir, e));
                const stats = await Promise.all(entries.map(e => pfs.Promises.stat(e)));
                let promise = Promise.resolve([]);
                stats.forEach((stat, index) => {
                    const entry = entries[index];
                    if (stat.isFile()) {
                        promise = promise.then(result => ([...result, entry]));
                    }
                    if (stat.isDirectory()) {
                        promise = promise
                            .then(result => collectFilesFromDirectory(entry)
                            .then(files => ([...result, ...files])));
                    }
                });
                return promise;
            };
            const files = await collectFilesFromDirectory(extension.location.fsPath);
            return files.map(f => ({ path: `extension/${path.relative(extension.location.fsPath, f)}`, localPath: f }));
        }
        async onDidChangeExtensionsFromAnotherSource({ added, removed }) {
            if (removed) {
                const removedExtensions = added && this.uriIdentityService.extUri.isEqual(removed.profileLocation, added.profileLocation)
                    ? removed.extensions.filter(e => added.extensions.every(identifier => !(0, extensionManagementUtil_1.areSameExtensions)(identifier, e)))
                    : removed.extensions;
                for (const identifier of removedExtensions) {
                    this.logService.info('Extensions removed from another source', identifier.id, removed.profileLocation.toString());
                    this._onDidUninstallExtension.fire({ identifier, profileLocation: removed.profileLocation });
                }
            }
            if (added) {
                const extensions = await this.extensionsScanner.scanExtensions(1 /* ExtensionType.User */, added.profileLocation);
                const addedExtensions = extensions.filter(e => added.extensions.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, e.identifier)));
                this._onDidInstallExtensions.fire(addedExtensions.map(local => {
                    this.logService.info('Extensions added from another source', local.identifier.id, added.profileLocation.toString());
                    return { identifier: local.identifier, local, profileLocation: added.profileLocation, operation: 1 /* InstallOperation.None */ };
                }));
            }
        }
        async watchForExtensionsNotInstalledBySystem() {
            this._register(this.extensionsScanner.onExtract(resource => this.knownDirectories.add(resource)));
            const stat = await this.fileService.resolve(this.extensionsScannerService.userExtensionsLocation);
            for (const childStat of stat.children ?? []) {
                if (childStat.isDirectory) {
                    this.knownDirectories.add(childStat.resource);
                }
            }
            this._register(this.fileService.watch(this.extensionsScannerService.userExtensionsLocation));
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        }
        async onDidFilesChange(e) {
            if (!e.affects(this.extensionsScannerService.userExtensionsLocation, 1 /* FileChangeType.ADDED */)) {
                return;
            }
            const added = [];
            for (const resource of e.rawAdded) {
                // Check if this is a known directory
                if (this.knownDirectories.has(resource)) {
                    continue;
                }
                // Is not immediate child of extensions resource
                if (!this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.dirname(resource), this.extensionsScannerService.userExtensionsLocation)) {
                    continue;
                }
                // .obsolete file changed
                if (this.uriIdentityService.extUri.isEqual(resource, this.uriIdentityService.extUri.joinPath(this.extensionsScannerService.userExtensionsLocation, '.obsolete'))) {
                    continue;
                }
                // Ignore changes to files starting with `.`
                if (this.uriIdentityService.extUri.basename(resource).startsWith('.')) {
                    continue;
                }
                // Check if this is a directory
                if (!(await this.fileService.stat(resource)).isDirectory) {
                    continue;
                }
                // Check if this is an extension added by another source
                // Extension added by another source will not have installed timestamp
                const extension = await this.extensionsScanner.scanUserExtensionAtLocation(resource);
                if (extension && extension.installedTimestamp === undefined) {
                    this.knownDirectories.add(resource);
                    added.push(extension);
                }
            }
            if (added.length) {
                await this.addExtensionsToProfile(added.map(e => [e, undefined]), this.userDataProfilesService.defaultProfile.extensionsResource);
                this.logService.info('Added extensions to default profile from external source', added.map(e => e.identifier.id));
            }
        }
        async addExtensionsToProfile(extensions, profileLocation) {
            const localExtensions = extensions.map(e => e[0]);
            await this.setInstalled(localExtensions);
            await this.extensionsProfileScannerService.addExtensionsToProfile(extensions, profileLocation);
            this._onDidInstallExtensions.fire(localExtensions.map(local => ({ local, identifier: local.identifier, operation: 1 /* InstallOperation.None */, profileLocation })));
        }
        async setInstalled(extensions) {
            const uninstalled = await this.extensionsScanner.getUninstalledExtensions();
            for (const extension of extensions) {
                const extensionKey = extensionManagementUtil_1.ExtensionKey.create(extension);
                if (!uninstalled[extensionKey.toString()]) {
                    continue;
                }
                this.logService.trace('Removing the extension from uninstalled list:', extensionKey.id);
                await this.extensionsScanner.setInstalled(extensionKey);
                this.logService.info('Removed the extension from uninstalled list:', extensionKey.id);
            }
        }
    };
    exports.ExtensionManagementService = ExtensionManagementService;
    exports.ExtensionManagementService = ExtensionManagementService = __decorate([
        __param(0, extensionManagement_1.IExtensionGalleryService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, log_1.ILogService),
        __param(3, environment_1.INativeEnvironmentService),
        __param(4, extensionsScannerService_1.IExtensionsScannerService),
        __param(5, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(6, download_1.IDownloadService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, files_1.IFileService),
        __param(9, productService_1.IProductService),
        __param(10, uriIdentity_1.IUriIdentityService),
        __param(11, userDataProfile_1.IUserDataProfilesService)
    ], ExtensionManagementService);
    let ExtensionsScanner = class ExtensionsScanner extends lifecycle_1.Disposable {
        constructor(beforeRemovingExtension, fileService, extensionsScannerService, extensionsProfileScannerService, uriIdentityService, logService) {
            super();
            this.beforeRemovingExtension = beforeRemovingExtension;
            this.fileService = fileService;
            this.extensionsScannerService = extensionsScannerService;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this._onExtract = this._register(new event_1.Emitter());
            this.onExtract = this._onExtract.event;
            this.uninstalledResource = (0, resources_1.joinPath)(this.extensionsScannerService.userExtensionsLocation, '.obsolete');
            this.uninstalledFileLimiter = new async_1.Queue();
        }
        async cleanUp() {
            await this.removeTemporarilyDeletedFolders();
            await this.removeUninstalledExtensions();
        }
        async scanExtensions(type, profileLocation) {
            const userScanOptions = { includeInvalid: true, profileLocation };
            let scannedExtensions = [];
            if (type === null || type === 0 /* ExtensionType.System */) {
                scannedExtensions.push(...await this.extensionsScannerService.scanAllExtensions({ includeInvalid: true }, userScanOptions, false));
            }
            else if (type === 1 /* ExtensionType.User */) {
                scannedExtensions.push(...await this.extensionsScannerService.scanUserExtensions(userScanOptions));
            }
            scannedExtensions = type !== null ? scannedExtensions.filter(r => r.type === type) : scannedExtensions;
            return Promise.all(scannedExtensions.map(extension => this.toLocalExtension(extension)));
        }
        async scanAllUserExtensions(excludeOutdated) {
            const scannedExtensions = await this.extensionsScannerService.scanUserExtensions({ includeAllVersions: !excludeOutdated, includeInvalid: true });
            return Promise.all(scannedExtensions.map(extension => this.toLocalExtension(extension)));
        }
        async scanUserExtensionAtLocation(location) {
            try {
                const scannedExtension = await this.extensionsScannerService.scanExistingExtension(location, 1 /* ExtensionType.User */, { includeInvalid: true });
                if (scannedExtension) {
                    return await this.toLocalExtension(scannedExtension);
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            return null;
        }
        async extractUserExtension(extensionKey, zipPath, metadata, removeIfExists, token) {
            const folderName = extensionKey.toString();
            const tempLocation = uri_1.URI.file(path.join(this.extensionsScannerService.userExtensionsLocation.fsPath, `.${(0, uuid_1.generateUuid)()}`));
            const extensionLocation = uri_1.URI.file(path.join(this.extensionsScannerService.userExtensionsLocation.fsPath, folderName));
            let exists = await this.fileService.exists(extensionLocation);
            if (exists && removeIfExists) {
                try {
                    await this.deleteExtensionFromLocation(extensionKey.id, extensionLocation, 'removeExisting');
                }
                catch (error) {
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize('errorDeleting', "Unable to delete the existing folder '{0}' while installing the extension '{1}'. Please delete the folder manually and try again", extensionLocation.fsPath, extensionKey.id), extensionManagement_1.ExtensionManagementErrorCode.Delete);
                }
                exists = false;
            }
            if (exists) {
                await this.extensionsScannerService.updateMetadata(extensionLocation, metadata);
            }
            else {
                try {
                    // Extract
                    try {
                        this.logService.trace(`Started extracting the extension from ${zipPath} to ${extensionLocation.fsPath}`);
                        await (0, zip_1.extract)(zipPath, tempLocation.fsPath, { sourcePath: 'extension', overwrite: true }, token);
                        this.logService.info(`Extracted extension to ${extensionLocation}:`, extensionKey.id);
                    }
                    catch (e) {
                        let errorCode = extensionManagement_1.ExtensionManagementErrorCode.Extract;
                        if (e instanceof zip_1.ExtractError) {
                            if (e.type === 'CorruptZip') {
                                errorCode = extensionManagement_1.ExtensionManagementErrorCode.CorruptZip;
                            }
                            else if (e.type === 'Incomplete') {
                                errorCode = extensionManagement_1.ExtensionManagementErrorCode.IncompleteZip;
                            }
                        }
                        throw new extensionManagement_1.ExtensionManagementError(e.message, errorCode);
                    }
                    await this.extensionsScannerService.updateMetadata(tempLocation, metadata);
                    // Rename
                    try {
                        this.logService.trace(`Started renaming the extension from ${tempLocation.fsPath} to ${extensionLocation.fsPath}`);
                        await this.rename(tempLocation.fsPath, extensionLocation.fsPath);
                        this.logService.info('Renamed to', extensionLocation.fsPath);
                    }
                    catch (error) {
                        if (error.code === 'ENOTEMPTY') {
                            this.logService.info(`Rename failed because extension was installed by another source. So ignoring renaming.`, extensionKey.id);
                        }
                        else {
                            this.logService.info(`Rename failed because of ${(0, errors_1.getErrorMessage)(error)}. Deleted from extracted location`, tempLocation);
                            throw error;
                        }
                    }
                    this._onExtract.fire(extensionLocation);
                }
                catch (error) {
                    try {
                        await this.fileService.del(tempLocation, { recursive: true });
                    }
                    catch (e) { /* ignore */ }
                    throw error;
                }
            }
            return this.scanLocalExtension(extensionLocation, 1 /* ExtensionType.User */);
        }
        async scanMetadata(local, profileLocation) {
            if (profileLocation) {
                const extension = await this.getScannedExtension(local, profileLocation);
                return extension?.metadata;
            }
            else {
                return this.extensionsScannerService.scanMetadata(local.location);
            }
        }
        async getScannedExtension(local, profileLocation) {
            const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(profileLocation);
            return extensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, local.identifier));
        }
        async updateMetadata(local, metadata, profileLocation) {
            if (profileLocation) {
                await this.extensionsProfileScannerService.updateMetadata([[local, metadata]], profileLocation);
            }
            else {
                await this.extensionsScannerService.updateMetadata(local.location, metadata);
            }
            return this.scanLocalExtension(local.location, local.type, profileLocation);
        }
        getUninstalledExtensions() {
            return this.withUninstalledExtensions();
        }
        async setUninstalled(...extensions) {
            const extensionKeys = extensions.map(e => extensionManagementUtil_1.ExtensionKey.create(e));
            await this.withUninstalledExtensions(uninstalled => extensionKeys.forEach(extensionKey => {
                uninstalled[extensionKey.toString()] = true;
                this.logService.info('Marked extension as uninstalled', extensionKey.toString());
            }));
        }
        async setInstalled(extensionKey) {
            await this.withUninstalledExtensions(uninstalled => delete uninstalled[extensionKey.toString()]);
        }
        async removeExtension(extension, type) {
            if (this.uriIdentityService.extUri.isEqualOrParent(extension.location, this.extensionsScannerService.userExtensionsLocation)) {
                return this.deleteExtensionFromLocation(extension.identifier.id, extension.location, type);
            }
        }
        async removeUninstalledExtension(extension) {
            await this.removeExtension(extension, 'uninstalled');
            await this.withUninstalledExtensions(uninstalled => delete uninstalled[extensionManagementUtil_1.ExtensionKey.create(extension).toString()]);
        }
        async copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
            const source = await this.getScannedExtension(extension, fromProfileLocation);
            const target = await this.getScannedExtension(extension, toProfileLocation);
            metadata = { ...source?.metadata, ...metadata };
            if (target) {
                await this.extensionsProfileScannerService.updateMetadata([[extension, { ...target.metadata, ...metadata }]], toProfileLocation);
            }
            else {
                await this.extensionsProfileScannerService.addExtensionsToProfile([[extension, metadata]], toProfileLocation);
            }
            return this.scanLocalExtension(extension.location, extension.type, toProfileLocation);
        }
        async copyExtensions(fromProfileLocation, toProfileLocation) {
            const fromExtensions = await this.scanExtensions(1 /* ExtensionType.User */, fromProfileLocation);
            const extensions = await Promise.all(fromExtensions
                .filter(e => !e.isApplicationScoped) /* remove application scoped extensions */
                .map(async (e) => ([e, await this.scanMetadata(e, fromProfileLocation)])));
            await this.extensionsProfileScannerService.addExtensionsToProfile(extensions, toProfileLocation);
        }
        async deleteExtensionFromLocation(id, location, type) {
            this.logService.trace(`Deleting ${type} extension from disk`, id, location.fsPath);
            const renamedLocation = this.uriIdentityService.extUri.joinPath(this.uriIdentityService.extUri.dirname(location), `${this.uriIdentityService.extUri.basename(location)}.${(0, hash_1.hash)((0, uuid_1.generateUuid)()).toString(16)}${DELETED_FOLDER_POSTFIX}`);
            await this.rename(location.fsPath, renamedLocation.fsPath);
            await this.fileService.del(renamedLocation, { recursive: true });
            this.logService.info(`Deleted ${type} extension from disk`, id, location.fsPath);
        }
        async withUninstalledExtensions(updateFn) {
            return this.uninstalledFileLimiter.queue(async () => {
                let raw;
                try {
                    const content = await this.fileService.readFile(this.uninstalledResource, 'utf8');
                    raw = content.value.toString();
                }
                catch (error) {
                    if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        throw error;
                    }
                }
                let uninstalled = {};
                if (raw) {
                    try {
                        uninstalled = JSON.parse(raw);
                    }
                    catch (e) { /* ignore */ }
                }
                if (updateFn) {
                    updateFn(uninstalled);
                    if (Object.keys(uninstalled).length) {
                        await this.fileService.writeFile(this.uninstalledResource, buffer_1.VSBuffer.fromString(JSON.stringify(uninstalled)));
                    }
                    else {
                        await this.fileService.del(this.uninstalledResource);
                    }
                }
                return uninstalled;
            });
        }
        async rename(extractPath, renamePath) {
            try {
                await pfs.Promises.rename(extractPath, renamePath, 2 * 60 * 1000 /* Retry for 2 minutes */);
            }
            catch (error) {
                throw new extensionManagement_1.ExtensionManagementError(error.message || nls.localize('renameError', "Unknown error while renaming {0} to {1}", extractPath, renamePath), error.code || extensionManagement_1.ExtensionManagementErrorCode.Rename);
            }
        }
        async scanLocalExtension(location, type, profileLocation) {
            if (profileLocation) {
                const scannedExtensions = await this.extensionsScannerService.scanUserExtensions({ profileLocation });
                const scannedExtension = scannedExtensions.find(e => this.uriIdentityService.extUri.isEqual(e.location, location));
                if (scannedExtension) {
                    return this.toLocalExtension(scannedExtension);
                }
            }
            else {
                const scannedExtension = await this.extensionsScannerService.scanExistingExtension(location, type, { includeInvalid: true });
                if (scannedExtension) {
                    return this.toLocalExtension(scannedExtension);
                }
            }
            throw new Error(nls.localize('cannot read', "Cannot read the extension from {0}", location.path));
        }
        async toLocalExtension(extension) {
            const stat = await this.fileService.resolve(extension.location);
            let readmeUrl;
            let changelogUrl;
            if (stat.children) {
                readmeUrl = stat.children.find(({ name }) => /^readme(\.txt|\.md|)$/i.test(name))?.resource;
                changelogUrl = stat.children.find(({ name }) => /^changelog(\.txt|\.md|)$/i.test(name))?.resource;
            }
            return {
                identifier: extension.identifier,
                type: extension.type,
                isBuiltin: extension.isBuiltin || !!extension.metadata?.isBuiltin,
                location: extension.location,
                manifest: extension.manifest,
                targetPlatform: extension.targetPlatform,
                validations: extension.validations,
                isValid: extension.isValid,
                readmeUrl,
                changelogUrl,
                publisherDisplayName: extension.metadata?.publisherDisplayName || null,
                publisherId: extension.metadata?.publisherId || null,
                isApplicationScoped: !!extension.metadata?.isApplicationScoped,
                isMachineScoped: !!extension.metadata?.isMachineScoped,
                isPreReleaseVersion: !!extension.metadata?.isPreReleaseVersion,
                hasPreReleaseVersion: !!extension.metadata?.hasPreReleaseVersion,
                preRelease: !!extension.metadata?.preRelease,
                installedTimestamp: extension.metadata?.installedTimestamp,
                updated: !!extension.metadata?.updated,
                pinned: !!extension.metadata?.pinned,
            };
        }
        async removeUninstalledExtensions() {
            const uninstalled = await this.getUninstalledExtensions();
            if (Object.keys(uninstalled).length === 0) {
                this.logService.debug(`No uninstalled extensions found.`);
                return;
            }
            this.logService.debug(`Removing uninstalled extensions:`, Object.keys(uninstalled));
            const extensions = await this.extensionsScannerService.scanUserExtensions({ includeAllVersions: true, includeUninstalled: true, includeInvalid: true }); // All user extensions
            const installed = new Set();
            for (const e of extensions) {
                if (!uninstalled[extensionManagementUtil_1.ExtensionKey.create(e).toString()]) {
                    installed.add(e.identifier.id.toLowerCase());
                }
            }
            try {
                // running post uninstall tasks for extensions that are not installed anymore
                const byExtension = (0, extensionManagementUtil_1.groupByExtension)(extensions, e => e.identifier);
                await async_1.Promises.settled(byExtension.map(async (e) => {
                    const latest = e.sort((a, b) => semver.rcompare(a.manifest.version, b.manifest.version))[0];
                    if (!installed.has(latest.identifier.id.toLowerCase())) {
                        await this.beforeRemovingExtension(await this.toLocalExtension(latest));
                    }
                }));
            }
            catch (error) {
                this.logService.error(error);
            }
            const toRemove = extensions.filter(e => e.metadata /* Installed by System */ && uninstalled[extensionManagementUtil_1.ExtensionKey.create(e).toString()]);
            await Promise.allSettled(toRemove.map(e => this.removeUninstalledExtension(e)));
        }
        async removeTemporarilyDeletedFolders() {
            this.logService.trace('ExtensionManagementService#removeTempDeleteFolders');
            let stat;
            try {
                stat = await this.fileService.resolve(this.extensionsScannerService.userExtensionsLocation);
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
                return;
            }
            if (!stat?.children) {
                return;
            }
            try {
                await Promise.allSettled(stat.children.map(async (child) => {
                    if (!child.isDirectory || !child.name.endsWith(DELETED_FOLDER_POSTFIX)) {
                        return;
                    }
                    this.logService.trace('Deleting the temporarily deleted folder', child.resource.toString());
                    try {
                        await this.fileService.del(child.resource, { recursive: true });
                        this.logService.trace('Deleted the temporarily deleted folder', child.resource.toString());
                    }
                    catch (error) {
                        if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                            this.logService.error(error);
                        }
                    }
                }));
            }
            catch (error) { /* ignore */ }
        }
    };
    exports.ExtensionsScanner = ExtensionsScanner;
    exports.ExtensionsScanner = ExtensionsScanner = __decorate([
        __param(1, files_1.IFileService),
        __param(2, extensionsScannerService_1.IExtensionsScannerService),
        __param(3, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, log_1.ILogService)
    ], ExtensionsScanner);
    class InstallExtensionTask extends abstractExtensionManagementService_1.AbstractExtensionTask {
        get profileLocation() { return this._profileLocation; }
        get verificationStatus() { return this._verificationStatus; }
        get operation() { return (0, types_1.isUndefined)(this.options.operation) ? this._operation : this.options.operation; }
        constructor(identifier, source, options, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService) {
            super();
            this.identifier = identifier;
            this.source = source;
            this.options = options;
            this.extensionsScanner = extensionsScanner;
            this.uriIdentityService = uriIdentityService;
            this.userDataProfilesService = userDataProfilesService;
            this.extensionsScannerService = extensionsScannerService;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.logService = logService;
            this._profileLocation = this.options.profileLocation;
            this._verificationStatus = false;
            this._operation = 2 /* InstallOperation.Install */;
        }
        async doRun(token) {
            const [local, metadata] = await this.install(token);
            this._profileLocation = local.isBuiltin || local.isApplicationScoped ? this.userDataProfilesService.defaultProfile.extensionsResource : this.options.profileLocation;
            if (this.uriIdentityService.extUri.isEqual(this.userDataProfilesService.defaultProfile.extensionsResource, this._profileLocation)) {
                await this.extensionsScannerService.initializeDefaultProfileExtensions();
            }
            await this.extensionsProfileScannerService.addExtensionsToProfile([[local, metadata]], this._profileLocation);
            return local;
        }
        async extractExtension({ zipPath, key, metadata }, removeIfExists, token) {
            let local = await this.unsetIfUninstalled(key);
            if (local) {
                local = await this.extensionsScanner.updateMetadata(local, metadata);
            }
            else {
                this.logService.trace('Extracting extension...', key.id);
                local = await this.extensionsScanner.extractUserExtension(key, zipPath, metadata, removeIfExists, token);
                this.logService.info('Extracting extension completed.', key.id);
            }
            return local;
        }
        async unsetIfUninstalled(extensionKey) {
            const isUninstalled = await this.isUninstalled(extensionKey);
            if (!isUninstalled) {
                return undefined;
            }
            this.logService.trace('Removing the extension from uninstalled list:', extensionKey.id);
            // If the same version of extension is marked as uninstalled, remove it from there and return the local.
            await this.extensionsScanner.setInstalled(extensionKey);
            this.logService.info('Removed the extension from uninstalled list:', extensionKey.id);
            const userExtensions = await this.extensionsScanner.scanAllUserExtensions(true);
            return userExtensions.find(i => extensionManagementUtil_1.ExtensionKey.create(i).equals(extensionKey));
        }
        async isUninstalled(extensionId) {
            const uninstalled = await this.extensionsScanner.getUninstalledExtensions();
            return !!uninstalled[extensionId.toString()];
        }
    }
    class InstallGalleryExtensionTask extends InstallExtensionTask {
        constructor(manifest, gallery, options, extensionsDownloader, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService) {
            super(gallery.identifier, gallery, options, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService);
            this.gallery = gallery;
            this.extensionsDownloader = extensionsDownloader;
        }
        async install(token) {
            let installed;
            try {
                installed = await this.extensionsScanner.scanExtensions(null, this.options.profileLocation);
            }
            catch (error) {
                throw new extensionManagement_1.ExtensionManagementError(error, extensionManagement_1.ExtensionManagementErrorCode.Scanning);
            }
            const existingExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, this.gallery.identifier));
            if (existingExtension) {
                this._operation = 3 /* InstallOperation.Update */;
            }
            const metadata = {
                id: this.gallery.identifier.uuid,
                publisherId: this.gallery.publisherId,
                publisherDisplayName: this.gallery.publisherDisplayName,
                targetPlatform: this.gallery.properties.targetPlatform,
                isApplicationScoped: this.options.isApplicationScoped || existingExtension?.isApplicationScoped,
                isMachineScoped: this.options.isMachineScoped || existingExtension?.isMachineScoped,
                isBuiltin: this.options.isBuiltin || existingExtension?.isBuiltin,
                isSystem: existingExtension?.type === 0 /* ExtensionType.System */ ? true : undefined,
                updated: !!existingExtension,
                isPreReleaseVersion: this.gallery.properties.isPreReleaseVersion,
                hasPreReleaseVersion: existingExtension?.hasPreReleaseVersion || this.gallery.properties.isPreReleaseVersion,
                installedTimestamp: Date.now(),
                pinned: this.options.installGivenVersion ? true : (this.options.pinned ?? existingExtension?.pinned),
                preRelease: (0, types_1.isBoolean)(this.options.preRelease)
                    ? this.options.preRelease
                    : this.options.installPreReleaseVersion || this.gallery.properties.isPreReleaseVersion || existingExtension?.preRelease
            };
            if (existingExtension?.manifest.version === this.gallery.version) {
                try {
                    const local = await this.extensionsScanner.updateMetadata(existingExtension, metadata);
                    return [local, metadata];
                }
                catch (error) {
                    throw new extensionManagement_1.ExtensionManagementError((0, errors_1.getErrorMessage)(error), extensionManagement_1.ExtensionManagementErrorCode.UpdateMetadata);
                }
            }
            const { location, verificationStatus } = await this.extensionsDownloader.download(this.gallery, this._operation, !this.options.donotVerifySignature);
            try {
                this._verificationStatus = verificationStatus;
                this.validateManifest(location.fsPath);
                const local = await this.extractExtension({ zipPath: location.fsPath, key: extensionManagementUtil_1.ExtensionKey.create(this.gallery), metadata }, false, token);
                return [local, metadata];
            }
            catch (error) {
                try {
                    await this.extensionsDownloader.delete(location);
                }
                catch (error) {
                    /* Ignore */
                    this.logService.warn(`Error while deleting the downloaded file`, location.toString(), (0, errors_1.getErrorMessage)(error));
                }
                throw error;
            }
        }
        async validateManifest(zipPath) {
            try {
                await (0, extensionManagementUtil_2.getManifest)(zipPath);
            }
            catch (error) {
                throw new extensionManagement_1.ExtensionManagementError((0, abstractExtensionManagementService_1.joinErrors)(error).message, extensionManagement_1.ExtensionManagementErrorCode.Invalid);
            }
        }
    }
    exports.InstallGalleryExtensionTask = InstallGalleryExtensionTask;
    class InstallVSIXTask extends InstallExtensionTask {
        constructor(manifest, location, options, galleryService, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService) {
            super({ id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) }, location, options, extensionsScanner, uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService);
            this.manifest = manifest;
            this.location = location;
            this.galleryService = galleryService;
        }
        async doRun(token) {
            const local = await super.doRun(token);
            this.updateMetadata(local, token);
            return local;
        }
        async install(token) {
            const extensionKey = new extensionManagementUtil_1.ExtensionKey(this.identifier, this.manifest.version);
            const installedExtensions = await this.extensionsScanner.scanExtensions(1 /* ExtensionType.User */, this.options.profileLocation);
            const existing = installedExtensions.find(i => (0, extensionManagementUtil_1.areSameExtensions)(this.identifier, i.identifier));
            const metadata = {
                isApplicationScoped: this.options.isApplicationScoped || existing?.isApplicationScoped,
                isMachineScoped: this.options.isMachineScoped || existing?.isMachineScoped,
                isBuiltin: this.options.isBuiltin || existing?.isBuiltin,
                installedTimestamp: Date.now(),
                pinned: this.options.installGivenVersion ? true : (this.options.pinned ?? existing?.pinned),
            };
            if (existing) {
                this._operation = 3 /* InstallOperation.Update */;
                if (extensionKey.equals(new extensionManagementUtil_1.ExtensionKey(existing.identifier, existing.manifest.version))) {
                    try {
                        await this.extensionsScanner.removeExtension(existing, 'existing');
                    }
                    catch (e) {
                        throw new Error(nls.localize('restartCode', "Please restart VS Code before reinstalling {0}.", this.manifest.displayName || this.manifest.name));
                    }
                }
                else if (!this.options.profileLocation && semver.gt(existing.manifest.version, this.manifest.version)) {
                    await this.extensionsScanner.setUninstalled(existing);
                }
            }
            else {
                // Remove the extension with same version if it is already uninstalled.
                // Installing a VSIX extension shall replace the existing extension always.
                const existing = await this.unsetIfUninstalled(extensionKey);
                if (existing) {
                    try {
                        await this.extensionsScanner.removeExtension(existing, 'existing');
                    }
                    catch (e) {
                        throw new Error(nls.localize('restartCode', "Please restart VS Code before reinstalling {0}.", this.manifest.displayName || this.manifest.name));
                    }
                }
            }
            const local = await this.extractExtension({ zipPath: path.resolve(this.location.fsPath), key: extensionKey, metadata }, true, token);
            return [local, metadata];
        }
        async updateMetadata(extension, token) {
            try {
                let [galleryExtension] = await this.galleryService.getExtensions([{ id: extension.identifier.id, version: extension.manifest.version }], token);
                if (!galleryExtension) {
                    [galleryExtension] = await this.galleryService.getExtensions([{ id: extension.identifier.id }], token);
                }
                if (galleryExtension) {
                    const metadata = {
                        id: galleryExtension.identifier.uuid,
                        publisherDisplayName: galleryExtension.publisherDisplayName,
                        publisherId: galleryExtension.publisherId,
                        isPreReleaseVersion: galleryExtension.properties.isPreReleaseVersion,
                        hasPreReleaseVersion: extension.hasPreReleaseVersion || galleryExtension.properties.isPreReleaseVersion,
                        preRelease: galleryExtension.properties.isPreReleaseVersion || this.options.installPreReleaseVersion
                    };
                    await this.extensionsScanner.updateMetadata(extension, metadata, this.options.profileLocation);
                }
            }
            catch (error) {
                /* Ignore Error */
            }
        }
    }
    class UninstallExtensionTask extends abstractExtensionManagementService_1.AbstractExtensionTask {
        constructor(extension, profileLocation, extensionsProfileScannerService) {
            super();
            this.extension = extension;
            this.profileLocation = profileLocation;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
        }
        async doRun(token) {
            await this.extensionsProfileScannerService.removeExtensionFromProfile(this.extension, this.profileLocation);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvbm9kZS9leHRlbnNpb25NYW5hZ2VtZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxRG5GLFFBQUEsdUNBQXVDLEdBQUcsSUFBQSxzQ0FBc0IsRUFBdUUsaURBQTJCLENBQUMsQ0FBQztJQVFqTCxNQUFNLHNCQUFzQixHQUFHLFNBQVMsQ0FBQztJQUVsQyxJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEyQixTQUFRLHVFQUFrQztRQVFqRixZQUMyQixjQUF3QyxFQUMvQyxnQkFBbUMsRUFDekMsVUFBdUIsRUFDVCxrQkFBNkMsRUFDN0Msd0JBQW9FLEVBQzdELCtCQUFrRixFQUNsRyxlQUF5QyxFQUNwQyxvQkFBMkMsRUFDcEQsV0FBMEMsRUFDdkMsY0FBK0IsRUFDM0Isa0JBQXVDLEVBQ2xDLHVCQUFpRDtZQUUzRSxLQUFLLENBQUMsY0FBYyxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztZQVRyRSw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTJCO1lBQzVDLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBa0M7WUFDMUYsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBRTVCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBWHhDLGtDQUE2QixHQUFHLElBQUksR0FBRyxFQUF1QyxDQUFDO1lBZ1IvRSxxQkFBZ0IsR0FBRyxJQUFJLGlCQUFXLEVBQUUsQ0FBQztZQS9QckQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx3Q0FBbUIsQ0FBQyxD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
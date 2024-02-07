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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/uri", "vs/nls", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions"], function (require, exports, cancellation_1, errors_1, network_1, resources_1, semver_1, uri_1, nls_1, extensionManagement_1, extensionManagementUtil_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementCLI = void 0;
    const notFound = (id) => (0, nls_1.localize)('notFound', "Extension '{0}' not found.", id);
    const useId = (0, nls_1.localize)('useId', "Make sure you use the full extension ID, including the publisher, e.g.: {0}", 'ms-dotnettools.csharp');
    let ExtensionManagementCLI = class ExtensionManagementCLI {
        constructor(logger, extensionManagementService, extensionGalleryService) {
            this.logger = logger;
            this.extensionManagementService = extensionManagementService;
            this.extensionGalleryService = extensionGalleryService;
        }
        get location() {
            return undefined;
        }
        async listExtensions(showVersions, category, profileLocation) {
            let extensions = await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */, profileLocation);
            const categories = extensions_1.EXTENSION_CATEGORIES.map(c => c.toLowerCase());
            if (category && category !== '') {
                if (categories.indexOf(category.toLowerCase()) < 0) {
                    this.logger.info('Invalid category please enter a valid category. To list valid categories run --category without a category specified');
                    return;
                }
                extensions = extensions.filter(e => {
                    if (e.manifest.categories) {
                        const lowerCaseCategories = e.manifest.categories.map(c => c.toLowerCase());
                        return lowerCaseCategories.indexOf(category.toLowerCase()) > -1;
                    }
                    return false;
                });
            }
            else if (category === '') {
                this.logger.info('Possible Categories: ');
                categories.forEach(category => {
                    this.logger.info(category);
                });
                return;
            }
            if (this.location) {
                this.logger.info((0, nls_1.localize)('listFromLocation', "Extensions installed on {0}:", this.location));
            }
            extensions = extensions.sort((e1, e2) => e1.identifier.id.localeCompare(e2.identifier.id));
            let lastId = undefined;
            for (const extension of extensions) {
                if (lastId !== extension.identifier.id) {
                    lastId = extension.identifier.id;
                    this.logger.info(showVersions ? `${lastId}@${extension.manifest.version}` : lastId);
                }
            }
        }
        async installExtensions(extensions, builtinExtensions, installOptions, force) {
            const failed = [];
            try {
                const installedExtensionsManifests = [];
                if (extensions.length) {
                    this.logger.info(this.location ? (0, nls_1.localize)('installingExtensionsOnLocation', "Installing extensions on {0}...", this.location) : (0, nls_1.localize)('installingExtensions', "Installing extensions..."));
                }
                const installVSIXInfos = [];
                let installExtensionInfos = [];
                const addInstallExtensionInfo = (id, version, isBuiltin) => {
                    installExtensionInfos.push({ id, version: version !== 'prerelease' ? version : undefined, installOptions: { ...installOptions, isBuiltin, installPreReleaseVersion: version === 'prerelease' || installOptions.installPreReleaseVersion } });
                };
                for (const extension of extensions) {
                    if (extension instanceof uri_1.URI) {
                        installVSIXInfos.push({ vsix: extension, installOptions });
                    }
                    else {
                        const [id, version] = (0, extensionManagementUtil_1.getIdAndVersion)(extension);
                        addInstallExtensionInfo(id, version, false);
                    }
                }
                for (const extension of builtinExtensions) {
                    if (extension instanceof uri_1.URI) {
                        installVSIXInfos.push({ vsix: extension, installOptions: { ...installOptions, isBuiltin: true, donotIncludePackAndDependencies: true } });
                    }
                    else {
                        const [id, version] = (0, extensionManagementUtil_1.getIdAndVersion)(extension);
                        addInstallExtensionInfo(id, version, true);
                    }
                }
                const installed = await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */, installOptions.profileLocation);
                if (installVSIXInfos.length) {
                    await Promise.all(installVSIXInfos.map(async ({ vsix, installOptions }) => {
                        try {
                            const manifest = await this.installVSIX(vsix, installOptions, force, installed);
                            if (manifest) {
                                installedExtensionsManifests.push(manifest);
                            }
                        }
                        catch (err) {
                            this.logger.error(err);
                            failed.push(vsix.toString());
                        }
                    }));
                }
                if (installExtensionInfos.length) {
                    installExtensionInfos = installExtensionInfos.filter(({ id, version }) => {
                        const installedExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }));
                        if (installedExtension) {
                            if (!force && (!version || (version === 'prerelease' && installedExtension.preRelease))) {
                                this.logger.info((0, nls_1.localize)('alreadyInstalled-checkAndUpdate', "Extension '{0}' v{1} is already installed. Use '--force' option to update to latest version or provide '@<version>' to install a specific version, for example: '{2}@1.2.3'.", id, installedExtension.manifest.version, id));
                                return false;
                            }
                            if (version && installedExtension.manifest.version === version) {
                                this.logger.info((0, nls_1.localize)('alreadyInstalled', "Extension '{0}' is already installed.", `${id}@${version}`));
                                return false;
                            }
                        }
                        return true;
                    });
                    if (installExtensionInfos.length) {
                        const galleryExtensions = await this.getGalleryExtensions(installExtensionInfos);
                        await Promise.all(installExtensionInfos.map(async (extensionInfo) => {
                            const gallery = galleryExtensions.get(extensionInfo.id.toLowerCase());
                            if (gallery) {
                                try {
                                    const manifest = await this.installFromGallery(extensionInfo, gallery, installed);
                                    if (manifest) {
                                        installedExtensionsManifests.push(manifest);
                                    }
                                }
                                catch (err) {
                                    this.logger.error(err.message || err.stack || err);
                                    failed.push(extensionInfo.id);
                                }
                            }
                            else {
                                this.logger.error(`${notFound(extensionInfo.version ? `${extensionInfo.id}@${extensionInfo.version}` : extensionInfo.id)}\n${useId}`);
                                failed.push(extensionInfo.id);
                            }
                        }));
                    }
                }
            }
            catch (error) {
                this.logger.error((0, nls_1.localize)('error while installing extensions', "Error while installing extensions: {0}", (0, errors_1.getErrorMessage)(error)));
                throw error;
            }
            if (failed.length) {
                throw new Error((0, nls_1.localize)('installation failed', "Failed Installing Extensions: {0}", failed.join(', ')));
            }
        }
        async updateExtensions(profileLocation) {
            const installedExtensions = await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */, profileLocation);
            const installedExtensionsQuery = [];
            for (const extension of installedExtensions) {
                if (!!extension.identifier.uuid) { // No need to check new version for an unpublished extension
                    installedExtensionsQuery.push({ ...extension.identifier, preRelease: extension.preRelease });
                }
            }
            this.logger.trace((0, nls_1.localize)('updateExtensionsQuery', "Fetching latest versions for {0} extensions", installedExtensionsQuery.length));
            const availableVersions = await this.extensionGalleryService.getExtensions(installedExtensionsQuery, { compatible: true }, cancellation_1.CancellationToken.None);
            const extensionsToUpdate = [];
            for (const newVersion of availableVersions) {
                for (const oldVersion of installedExtensions) {
                    if ((0, extensionManagementUtil_1.areSameExtensions)(oldVersion.identifier, newVersion.identifier) && (0, semver_1.gt)(newVersion.version, oldVersion.manifest.version)) {
                        extensionsToUpdate.push({
                            extension: newVersion,
                            options: { operation: 3 /* InstallOperation.Update */, installPreReleaseVersion: oldVersion.isPreReleaseVersion }
                        });
                    }
                }
            }
            if (!extensionsToUpdate.length) {
                this.logger.info((0, nls_1.localize)('updateExtensionsNoExtensions', "No extension to update"));
                return;
            }
            this.logger.info((0, nls_1.localize)('updateExtensionsNewVersionsAvailable', "Updating extensions: {0}", extensionsToUpdate.map(ext => ext.extension.identifier.id).join(', ')));
            const installationResult = await this.extensionManagementService.installGalleryExtensions(extensionsToUpdate);
            for (const extensionResult of installationResult) {
                if (extensionResult.error) {
                    this.logger.error((0, nls_1.localize)('errorUpdatingExtension', "Error while updating extension {0}: {1}", extensionResult.identifier.id, (0, errors_1.getErrorMessage)(extensionResult.error)));
                }
                else {
                    this.logger.info((0, nls_1.localize)('successUpdate', "Extension '{0}' v{1} was successfully updated.", extensionResult.identifier.id, extensionResult.local?.manifest.version));
                }
            }
        }
        async installVSIX(vsix, installOptions, force, installedExtensions) {
            const manifest = await this.extensionManagementService.getManifest(vsix);
            if (!manifest) {
                throw new Error('Invalid vsix');
            }
            const valid = await this.validateVSIX(manifest, force, installOptions.profileLocation, installedExtensions);
            if (valid) {
                try {
                    await this.extensionManagementService.install(vsix, installOptions);
                    this.logger.info((0, nls_1.localize)('successVsixInstall', "Extension '{0}' was successfully installed.", (0, resources_1.basename)(vsix)));
                    return manifest;
                }
                catch (error) {
                    if ((0, errors_1.isCancellationError)(error)) {
                        this.logger.info((0, nls_1.localize)('cancelVsixInstall', "Cancelled installing extension '{0}'.", (0, resources_1.basename)(vsix)));
                        return null;
                    }
                    else {
                        throw error;
                    }
                }
            }
            return null;
        }
        async getGalleryExtensions(extensions) {
            const galleryExtensions = new Map();
            const preRelease = extensions.some(e => e.installOptions.installPreReleaseVersion);
            const targetPlatform = await this.extensionManagementService.getTargetPlatform();
            const extensionInfos = [];
            for (const extension of extensions) {
                if (extensionManagement_1.EXTENSION_IDENTIFIER_REGEX.test(extension.id)) {
                    extensionInfos.push({ ...extension, preRelease });
                }
            }
            if (extensionInfos.length) {
                const result = await this.extensionGalleryService.getExtensions(extensionInfos, { targetPlatform }, cancellation_1.CancellationToken.None);
                for (const extension of result) {
                    galleryExtensions.set(extension.identifier.id.toLowerCase(), extension);
                }
            }
            return galleryExtensions;
        }
        async installFromGallery({ id, version, installOptions }, galleryExtension, installed) {
            const manifest = await this.extensionGalleryService.getManifest(galleryExtension, cancellation_1.CancellationToken.None);
            if (manifest && !this.validateExtensionKind(manifest)) {
                return null;
            }
            const installedExtension = installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, galleryExtension.identifier));
            if (installedExtension) {
                if (galleryExtension.version === installedExtension.manifest.version) {
                    this.logger.info((0, nls_1.localize)('alreadyInstalled', "Extension '{0}' is already installed.", version ? `${id}@${version}` : id));
                    return null;
                }
                this.logger.info((0, nls_1.localize)('updateMessage', "Updating the extension '{0}' to the version {1}", id, galleryExtension.version));
            }
            try {
                if (installOptions.isBuiltin) {
                    this.logger.info(version ? (0, nls_1.localize)('installing builtin with version', "Installing builtin extension '{0}' v{1}...", id, version) : (0, nls_1.localize)('installing builtin ', "Installing builtin extension '{0}'...", id));
                }
                else {
                    this.logger.info(version ? (0, nls_1.localize)('installing with version', "Installing extension '{0}' v{1}...", id, version) : (0, nls_1.localize)('installing', "Installing extension '{0}'...", id));
                }
                const local = await this.extensionManagementService.installFromGallery(galleryExtension, { ...installOptions, installGivenVersion: !!version });
                this.logger.info((0, nls_1.localize)('successInstall', "Extension '{0}' v{1} was successfully installed.", id, local.manifest.version));
                return manifest;
            }
            catch (error) {
                if ((0, errors_1.isCancellationError)(error)) {
                    this.logger.info((0, nls_1.localize)('cancelInstall', "Cancelled installing extension '{0}'.", id));
                    return null;
                }
                else {
                    throw error;
                }
            }
        }
        validateExtensionKind(_manifest) {
            return true;
        }
        async validateVSIX(manifest, force, profileLocation, installedExtensions) {
            if (!force) {
                const extensionIdentifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) };
                const newer = installedExtensions.find(local => (0, extensionManagementUtil_1.areSameExtensions)(extensionIdentifier, local.identifier) && (0, semver_1.gt)(local.manifest.version, manifest.version));
                if (newer) {
                    this.logger.info((0, nls_1.localize)('forceDowngrade', "A newer version of extension '{0}' v{1} is already installed. Use '--force' option to downgrade to older version.", newer.identifier.id, newer.manifest.version, manifest.version));
                    return false;
                }
            }
            return this.validateExtensionKind(manifest);
        }
        async uninstallExtensions(extensions, force, profileLocation) {
            const getId = async (extensionDescription) => {
                if (extensionDescription instanceof uri_1.URI) {
                    const manifest = await this.extensionManagementService.getManifest(extensionDescription);
                    return (0, extensionManagementUtil_1.getExtensionId)(manifest.publisher, manifest.name);
                }
                return extensionDescription;
            };
            const uninstalledExtensions = [];
            for (const extension of extensions) {
                const id = await getId(extension);
                const installed = await this.extensionManagementService.getInstalled(undefined, profileLocation);
                const extensionsToUninstall = installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
                if (!extensionsToUninstall.length) {
                    throw new Error(`${this.notInstalled(id)}\n${useId}`);
                }
                if (extensionsToUninstall.some(e => e.type === 0 /* ExtensionType.System */)) {
                    this.logger.info((0, nls_1.localize)('builtin', "Extension '{0}' is a Built-in extension and cannot be uninstalled", id));
                    return;
                }
                if (!force && extensionsToUninstall.some(e => e.isBuiltin)) {
                    this.logger.info((0, nls_1.localize)('forceUninstall', "Extension '{0}' is marked as a Built-in extension by user. Please use '--force' option to uninstall it.", id));
                    return;
                }
                this.logger.info((0, nls_1.localize)('uninstalling', "Uninstalling {0}...", id));
                for (const extensionToUninstall of extensionsToUninstall) {
                    await this.extensionManagementService.uninstall(extensionToUninstall, { profileLocation });
                    uninstalledExtensions.push(extensionToUninstall);
                }
                if (this.location) {
                    this.logger.info((0, nls_1.localize)('successUninstallFromLocation', "Extension '{0}' was successfully uninstalled from {1}!", id, this.location));
                }
                else {
                    this.logger.info((0, nls_1.localize)('successUninstall', "Extension '{0}' was successfully uninstalled!", id));
                }
            }
        }
        async locateExtension(extensions) {
            const installed = await this.extensionManagementService.getInstalled();
            extensions.forEach(e => {
                installed.forEach(i => {
                    if (i.identifier.id === e) {
                        if (i.location.scheme === network_1.Schemas.file) {
                            this.logger.info(i.location.fsPath);
                            return;
                        }
                    }
                });
            });
        }
        notInstalled(id) {
            return this.location ? (0, nls_1.localize)('notInstalleddOnLocation', "Extension '{0}' is not installed on {1}.", id, this.location) : (0, nls_1.localize)('notInstalled', "Extension '{0}' is not installed.", id);
        }
    };
    exports.ExtensionManagementCLI = ExtensionManagementCLI;
    exports.ExtensionManagementCLI = ExtensionManagementCLI = __decorate([
        __param(1, extensionManagement_1.IExtensionManagementService),
        __param(2, extensionManagement_1.IExtensionGalleryService)
    ], ExtensionManagementCLI);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudENMSS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vZXh0ZW5zaW9uTWFuYWdlbWVudENMSS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFlaEcsTUFBTSxRQUFRLEdBQUcsQ0FBQyxFQUFVLEVBQUUsRUFBRSxDQUFDLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSw0QkFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4RixNQUFNLEtBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsNkVBQTZFLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUtqSSxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUFzQjtRQUVsQyxZQUNvQixNQUFlLEVBQ1ksMEJBQXVELEVBQzFELHVCQUFpRDtZQUZ6RSxXQUFNLEdBQU4sTUFBTSxDQUFTO1lBQ1ksK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUMxRCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1FBQ3pGLENBQUM7UUFFTCxJQUFjLFFBQVE7WUFDckIsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBcUIsRUFBRSxRQUFpQixFQUFFLGVBQXFCO1lBQzFGLElBQUksVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFlBQVksNkJBQXFCLGVBQWUsQ0FBQyxDQUFDO1lBQ3pHLE1BQU0sVUFBVSxHQUFHLGlDQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLElBQUksUUFBUSxJQUFJLFFBQVEsS0FBSyxFQUFFLEVBQUUsQ0FBQztn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
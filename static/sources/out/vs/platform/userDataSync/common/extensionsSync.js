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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/jsonFormatter", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/extensionsMerge", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataProfile/common/userDataProfileStorageService"], function (require, exports, async_1, cancellation_1, errors_1, event_1, jsonFormatter_1, lifecycle_1, strings_1, configuration_1, environment_1, extensionEnablementService_1, extensionManagement_1, extensionManagementUtil_1, extensionStorage_1, extensions_1, files_1, instantiation_1, serviceCollection_1, log_1, storage_1, telemetry_1, uriIdentity_1, userDataProfile_1, abstractSynchronizer_1, extensionsMerge_1, ignoredExtensions_1, userDataSync_1, userDataProfileStorageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractExtensionsInitializer = exports.LocalExtensionsProvider = exports.ExtensionsSynchroniser = exports.stringify = exports.parseExtensions = void 0;
    async function parseAndMigrateExtensions(syncData, extensionManagementService) {
        const extensions = JSON.parse(syncData.content);
        if (syncData.version === 1
            || syncData.version === 2) {
            const builtinExtensions = (await extensionManagementService.getInstalled(0 /* ExtensionType.System */)).filter(e => e.isBuiltin);
            for (const extension of extensions) {
                // #region Migration from v1 (enabled -> disabled)
                if (syncData.version === 1) {
                    if (extension.enabled === false) {
                        extension.disabled = true;
                    }
                    delete extension.enabled;
                }
                // #endregion
                // #region Migration from v2 (set installed property on extension)
                if (syncData.version === 2) {
                    if (builtinExtensions.every(installed => !(0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, extension.identifier))) {
                        extension.installed = true;
                    }
                }
                // #endregion
            }
        }
        return extensions;
    }
    function parseExtensions(syncData) {
        return JSON.parse(syncData.content);
    }
    exports.parseExtensions = parseExtensions;
    function stringify(extensions, format) {
        extensions.sort((e1, e2) => {
            if (!e1.identifier.uuid && e2.identifier.uuid) {
                return -1;
            }
            if (e1.identifier.uuid && !e2.identifier.uuid) {
                return 1;
            }
            return (0, strings_1.compare)(e1.identifier.id, e2.identifier.id);
        });
        return format ? (0, jsonFormatter_1.toFormattedString)(extensions, {}) : JSON.stringify(extensions);
    }
    exports.stringify = stringify;
    let ExtensionsSynchroniser = class ExtensionsSynchroniser extends abstractSynchronizer_1.AbstractSynchroniser {
        constructor(
        // profileLocation changes for default profile
        profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, extensionManagementService, ignoredExtensionsManagementService, logService, configurationService, userDataSyncEnablementService, telemetryService, extensionStorageService, uriIdentityService, userDataProfileStorageService, instantiationService) {
            super({ syncResource: "extensions" /* SyncResource.Extensions */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.extensionManagementService = extensionManagementService;
            this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
            this.instantiationService = instantiationService;
            /*
                Version 3 - Introduce installed property to skip installing built in extensions
                protected readonly version: number = 3;
            */
            /* Version 4: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
            /* Version 5: Introduce extension state */
            /* Version 6: Added isApplicationScoped property */
            this.version = 6;
            this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'extensions.json');
            this.baseResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' });
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
            this.localExtensionsProvider = this.instantiationService.createInstance(LocalExtensionsProvider);
            this._register(event_1.Event.any(event_1.Event.filter(this.extensionManagementService.onDidInstallExtensions, (e => e.some(({ local }) => !!local))), event_1.Event.filter(this.extensionManagementService.onDidUninstallExtension, (e => !e.error)), event_1.Event.filter(userDataProfileStorageService.onDidChange, e => e.valueChanges.some(({ profile, changes }) => this.syncResource.profile.id === profile.id && changes.some(change => change.key === extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH))), extensionStorageService.onDidChangeExtensionStorageToSync)(() => this.triggerLocalChange()));
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData) {
            const remoteExtensions = remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
            const skippedExtensions = lastSyncUserData?.skippedExtensions ?? [];
            const builtinExtensions = lastSyncUserData?.builtinExtensions ?? null;
            const lastSyncExtensions = lastSyncUserData?.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
            const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
            if (remoteExtensions) {
                this.logService.trace(`${this.syncResourceLogLabel}: Merging remote extensions with local extensions...`);
            }
            else {
                this.logService.trace(`${this.syncResourceLogLabel}: Remote extensions does not exist. Synchronizing extensions for the first time.`);
            }
            const { local, remote } = (0, extensionsMerge_1.merge)(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, builtinExtensions);
            const previewResult = {
                local, remote,
                content: this.getPreviewContent(localExtensions, local.added, local.updated, local.removed),
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
            const localContent = this.stringify(localExtensions, false);
            return [{
                    skippedExtensions,
                    builtinExtensions,
                    baseResource: this.baseResource,
                    baseContent: lastSyncExtensions ? this.stringify(lastSyncExtensions, false) : localContent,
                    localResource: this.localResource,
                    localContent,
                    localExtensions,
                    remoteResource: this.remoteResource,
                    remoteExtensions,
                    remoteContent: remoteExtensions ? this.stringify(remoteExtensions, false) : null,
                    previewResource: this.previewResource,
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.acceptedResource,
                }];
        }
        async hasRemoteChanged(lastSyncUserData) {
            const lastSyncExtensions = lastSyncUserData.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
            const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
            const { remote } = (0, extensionsMerge_1.merge)(localExtensions, lastSyncExtensions, lastSyncExtensions, lastSyncUserData.skippedExtensions || [], ignoredExtensions, lastSyncUserData.builtinExtensions || []);
            return remote !== null;
        }
        getPreviewContent(localExtensions, added, updated, removed) {
            const preview = [...added, ...updated];
            const idsOrUUIDs = new Set();
            const addIdentifier = (identifier) => {
                idsOrUUIDs.add(identifier.id.toLowerCase());
                if (identifier.uuid) {
                    idsOrUUIDs.add(identifier.uuid);
                }
            };
            preview.forEach(({ identifier }) => addIdentifier(identifier));
            removed.forEach(addIdentifier);
            for (const localExtension of localExtensions) {
                if (idsOrUUIDs.has(localExtension.identifier.id.toLowerCase()) || (localExtension.identifier.uuid && idsOrUUIDs.has(localExtension.identifier.uuid))) {
                    // skip
                    continue;
                }
                preview.push(localExtension);
            }
            return this.stringify(preview, false);
        }
        async getMergeResult(resourcePreview, token) {
            return { ...resourcePreview.previewResult, hasConflicts: false };
        }
        async getAcceptResult(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.extUri.isEqual(resource, this.localResource)) {
                return this.acceptLocal(resourcePreview);
            }
            /* Accept remote resource */
            if (this.extUri.isEqual(resource, this.remoteResource)) {
                return this.acceptRemote(resourcePreview);
            }
            /* Accept preview resource */
            if (this.extUri.isEqual(resource, this.previewResource)) {
                return resourcePreview.previewResult;
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async acceptLocal(resourcePreview) {
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, this.syncResource.profile.extensionsResource);
            const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
            const mergeResult = (0, extensionsMerge_1.merge)(resourcePreview.localExtensions, null, null, resourcePreview.skippedExtensions, ignoredExtensions, resourcePreview.builtinExtensions);
            const { local, remote } = mergeResult;
            return {
                content: resourcePreview.localContent,
                local,
                remote,
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
        }
        async acceptRemote(resourcePreview) {
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, this.syncResource.profile.extensionsResource);
            const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
            const remoteExtensions = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
            if (remoteExtensions !== null) {
                const mergeResult = (0, extensionsMerge_1.merge)(resourcePreview.localExtensions, remoteExtensions, resourcePreview.localExtensions, [], ignoredExtensions, resourcePreview.builtinExtensions);
                const { local, remote } = mergeResult;
                return {
                    content: resourcePreview.remoteContent,
                    local,
                    remote,
                    localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                    remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
                };
            }
            else {
                return {
                    content: resourcePreview.remoteContent,
                    local: { added: [], removed: [], updated: [] },
                    remote: null,
                    localChange: 0 /* Change.None */,
                    remoteChange: 0 /* Change.None */,
                };
            }
        }
        async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            let { skippedExtensions, builtinExtensions, localExtensions } = resourcePreviews[0][0];
            const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing extensions.`);
            }
            if (localChange !== 0 /* Change.None */) {
                await this.backupLocal(JSON.stringify(localExtensions));
                skippedExtensions = await this.localExtensionsProvider.updateLocalExtensions(local.added, local.removed, local.updated, skippedExtensions, this.syncResource.profile);
            }
            if (remote) {
                // update remote
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote extensions...`);
                const content = JSON.stringify(remote.all);
                remoteUserData = await this.updateRemoteUserData(content, force ? null : remoteUserData.ref);
                this.logService.info(`${this.syncResourceLogLabel}: Updated remote extensions.${remote.added.length ? ` Added: ${JSON.stringify(remote.added.map(e => e.identifier.id))}.` : ''}${remote.updated.length ? ` Updated: ${JSON.stringify(remote.updated.map(e => e.identifier.id))}.` : ''}${remote.removed.length ? ` Removed: ${JSON.stringify(remote.removed.map(e => e.identifier.id))}.` : ''}`);
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized extensions...`);
                builtinExtensions = this.computeBuiltinExtensions(localExtensions, builtinExtensions);
                await this.updateLastSyncUserData(remoteUserData, { skippedExtensions, builtinExtensions });
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized extensions.${skippedExtensions.length ? ` Skipped: ${JSON.stringify(skippedExtensions.map(e => e.identifier.id))}.` : ''}`);
            }
        }
        computeBuiltinExtensions(localExtensions, previousBuiltinExtensions) {
            const localExtensionsSet = new Set();
            const builtinExtensions = [];
            for (const localExtension of localExtensions) {
                localExtensionsSet.add(localExtension.identifier.id.toLowerCase());
                if (!localExtension.installed) {
                    builtinExtensions.push(localExtension.identifier);
                }
            }
            if (previousBuiltinExtensions) {
                for (const builtinExtension of previousBuiltinExtensions) {
                    // Add previous builtin extension if it does not exist in local extensions
                    if (!localExtensionsSet.has(builtinExtension.id.toLowerCase())) {
                        builtinExtensions.push(builtinExtension);
                    }
                }
            }
            return builtinExtensions;
        }
        async resolveContent(uri) {
            if (this.extUri.isEqual(this.remoteResource, uri)
                || this.extUri.isEqual(this.baseResource, uri)
                || this.extUri.isEqual(this.localResource, uri)
                || this.extUri.isEqual(this.acceptedResource, uri)) {
                const content = await this.resolvePreviewContent(uri);
                return content ? this.stringify(JSON.parse(content), true) : content;
            }
            return null;
        }
        stringify(extensions, format) {
            return stringify(extensions, format);
        }
        async hasLocalData() {
            try {
                const { localExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
                if (localExtensions.some(e => e.installed || e.disabled)) {
                    return true;
                }
            }
            catch (error) {
                /* ignore error */
            }
            return false;
        }
    };
    exports.ExtensionsSynchroniser = ExtensionsSynchroniser;
    exports.ExtensionsSynchroniser = ExtensionsSynchroniser = __decorate([
        __param(2, environment_1.IEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, storage_1.IStorageService),
        __param(5, userDataSync_1.IUserDataSyncStoreService),
        __param(6, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(7, extensionManagement_1.IExtensionManagementService),
        __param(8, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(9, userDataSync_1.IUserDataSyncLogService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, userDataSync_1.IUserDataSyncEnablementService),
        __param(12, telemetry_1.ITelemetryService),
        __param(13, extensionStorage_1.IExtensionStorageService),
        __param(14, uriIdentity_1.IUriIdentityService),
        __param(15, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(16, instantiation_1.IInstantiationService)
    ], ExtensionsSynchroniser);
    let LocalExtensionsProvider = class LocalExtensionsProvider {
        constructor(extensionManagementService, userDataProfileStorageService, extensionGalleryService, ignoredExtensionsManagementService, instantiationService, logService) {
            this.extensionManagementService = extensionManagementService;
            this.userDataProfileStorageService = userDataProfileStorageService;
            this.extensionGalleryService = extensionGalleryService;
            this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
            this.instantiationService = instantiationService;
            this.logService = logService;
        }
        async getLocalExtensions(profile) {
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
            const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
            const localExtensions = await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
                const disabledExtensions = extensionEnablementService.getDisabledExtensions();
                return installedExtensions
                    .map(extension => {
                    const { identifier, isBuiltin, manifest, preRelease, pinned, isApplicationScoped } = extension;
                    const syncExntesion = { identifier, preRelease, version: manifest.version, pinned: !!pinned };
                    if (isApplicationScoped && !(0, extensions_1.isApplicationScopedExtension)(manifest)) {
                        syncExntesion.isApplicationScoped = isApplicationScoped;
                    }
                    if (disabledExtensions.some(disabledExtension => (0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier))) {
                        syncExntesion.disabled = true;
                    }
                    if (!isBuiltin) {
                        syncExntesion.installed = true;
                    }
                    try {
                        const keys = extensionStorageService.getKeysForSync({ id: identifier.id, version: manifest.version });
                        if (keys) {
                            const extensionStorageState = extensionStorageService.getExtensionState(extension, true) || {};
                            syncExntesion.state = Object.keys(extensionStorageState).reduce((state, key) => {
                                if (keys.includes(key)) {
                                    state[key] = extensionStorageState[key];
                                }
                                return state;
                            }, {});
                        }
                    }
                    catch (error) {
                        this.logService.info(`${(0, abstractSynchronizer_1.getSyncResourceLogLabel)("extensions" /* SyncResource.Extensions */, profile)}: Error while parsing extension state`, (0, errors_1.getErrorMessage)(error));
                    }
                    return syncExntesion;
                });
            });
            return { localExtensions, ignoredExtensions };
        }
        async updateLocalExtensions(added, removed, updated, skippedExtensions, profile) {
            const syncResourceLogLabel = (0, abstractSynchronizer_1.getSyncResourceLogLabel)("extensions" /* SyncResource.Extensions */, profile);
            const extensionsToInstall = [];
            const syncExtensionsToInstall = new Map();
            const removeFromSkipped = [];
            const addToSkipped = [];
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
            // 1. Sync extensions state first so that the storage is flushed and updated in all opened windows
            if (added.length || updated.length) {
                await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
                    await async_1.Promises.settled([...added, ...updated].map(async (e) => {
                        const installedExtension = installedExtensions.find(installed => (0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, e.identifier));
                        // Builtin Extension Sync: Enablement & State
                        if (installedExtension && installedExtension.isBuiltin) {
                            if (e.state && installedExtension.manifest.version === e.version) {
                                this.updateExtensionState(e.state, installedExtension, installedExtension.manifest.version, extensionStorageService);
                            }
                            const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, e.identifier));
                            if (isDisabled !== !!e.disabled) {
                                if (e.disabled) {
                                    this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id);
                                    await extensionEnablementService.disableExtension(e.identifier);
                                    this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id);
                                }
                                else {
                                    this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id);
                                    await extensionEnablementService.enableExtension(e.identifier);
                                    this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id);
                                }
                            }
                            removeFromSkipped.push(e.identifier);
                            return;
                        }
                        // User Extension Sync: Install/Update, Enablement & State
                        const version = e.pinned ? e.version : undefined;
                        const extension = (await this.extensionGalleryService.getExtensions([{ ...e.identifier, version, preRelease: version ? undefined : e.preRelease }], cancellation_1.CancellationToken.None))[0];
                        /* Update extension state only if
                         *	extension is installed and version is same as synced version or
                         *	extension is not installed and installable
                         */
                        if (e.state &&
                            (installedExtension ? installedExtension.manifest.version === e.version /* Installed and remote has same version */
                                : !!extension /* Installable */)) {
                            this.updateExtensionState(e.state, installedExtension || extension, installedExtension?.manifest.version, extensionStorageService);
                        }
                        if (extension) {
                            try {
                                const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => (0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, e.identifier));
                                if (isDisabled !== !!e.disabled) {
                                    if (e.disabled) {
                                        this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id, extension.version);
                                        await extensionEnablementService.disableExtension(extension.identifier);
                                        this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id, extension.version);
                                    }
                                    else {
                                        this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id, extension.version);
                                        await extensionEnablementService.enableExtension(extension.identifier);
                                        this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id, extension.version);
                                    }
                                }
                                if (!installedExtension // Install if the extension does not exist
                                    || installedExtension.preRelease !== e.preRelease // Install if the extension pre-release preference has changed
                                    || installedExtension.pinned !== e.pinned // Install if the extension pinned preference has changed
                                    || (version && installedExtension.manifest.version !== version) // Install if the extension version has changed
                                ) {
                                    if (await this.extensionManagementService.canInstall(extension)) {
                                        extensionsToInstall.push({
                                            extension, options: {
                                                isMachineScoped: false /* set isMachineScoped value to prevent install and sync dialog in web */,
                                                donotIncludePackAndDependencies: true,
                                                installGivenVersion: e.pinned && !!e.version,
                                                installPreReleaseVersion: e.preRelease,
                                                profileLocation: profile.extensionsResource,
                                                isApplicationScoped: e.isApplicationScoped,
                                                context: { [extensionManagement_1.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true, [extensionManagement_1.EXTENSION_INSTALL_SYNC_CONTEXT]: true }
                                            }
                                        });
                                        syncExtensionsToInstall.set(extension.identifier.id.toLowerCase(), e);
                                    }
                                    else {
                                        this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because it cannot be installed.`, extension.displayName || extension.identifier.id);
                                        addToSkipped.push(e);
                                    }
                                }
                            }
                            catch (error) {
                                addToSkipped.push(e);
                                this.logService.error(error);
                                this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, extension.displayName || extension.identifier.id);
                            }
                        }
                        else {
                            addToSkipped.push(e);
                            this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the extension is not found.`, e.identifier.id);
                        }
                    }));
                });
            }
            // 2. Next uninstall the removed extensions
            if (removed.length) {
                const extensionsToRemove = installedExtensions.filter(({ identifier, isBuiltin }) => !isBuiltin && removed.some(r => (0, extensionManagementUtil_1.areSameExtensions)(identifier, r)));
                await async_1.Promises.settled(extensionsToRemove.map(async (extensionToRemove) => {
                    this.logService.trace(`${syncResourceLogLabel}: Uninstalling local extension...`, extensionToRemove.identifier.id);
                    await this.extensionManagementService.uninstall(extensionToRemove, { donotIncludePack: true, donotCheckDependents: true, profileLocation: profile.extensionsResource });
                    this.logService.info(`${syncResourceLogLabel}: Uninstalled local extension.`, extensionToRemove.identifier.id);
                    removeFromSkipped.push(extensionToRemove.identifier);
                }));
            }
            // 3. Install extensions at the end
            const results = await this.extensionManagementService.installGalleryExtensions(extensionsToInstall);
            for (const { identifier, local, error, source } of results) {
                const gallery = source;
                if (local) {
                    this.logService.info(`${syncResourceLogLabel}: Installed extension.`, identifier.id, gallery.version);
                    removeFromSkipped.push(identifier);
                }
                else {
                    const e = syncExtensionsToInstall.get(identifier.id.toLowerCase());
                    if (e) {
                        addToSkipped.push(e);
                        this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, gallery.displayName || gallery.identifier.id);
                    }
                    if (error instanceof extensionManagement_1.ExtensionManagementError && [extensionManagement_1.ExtensionManagementErrorCode.Incompatible, extensionManagement_1.ExtensionManagementErrorCode.IncompatibleTargetPlatform].includes(error.code)) {
                        this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the compatible extension is not found.`, gallery.displayName || gallery.identifier.id);
                    }
                    else if (error) {
                        this.logService.error(error);
                    }
                }
            }
            const newSkippedExtensions = [];
            for (const skippedExtension of skippedExtensions) {
                if (!removeFromSkipped.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, skippedExtension.identifier))) {
                    newSkippedExtensions.push(skippedExtension);
                }
            }
            for (const skippedExtension of addToSkipped) {
                if (!newSkippedExtensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, skippedExtension.identifier))) {
                    newSkippedExtensions.push(skippedExtension);
                }
            }
            return newSkippedExtensions;
        }
        updateExtensionState(state, extension, version, extensionStorageService) {
            const extensionState = extensionStorageService.getExtensionState(extension, true) || {};
            const keys = version ? extensionStorageService.getKeysForSync({ id: extension.identifier.id, version }) : undefined;
            if (keys) {
                keys.forEach(key => { extensionState[key] = state[key]; });
            }
            else {
                Object.keys(state).forEach(key => extensionState[key] = state[key]);
            }
            extensionStorageService.setExtensionState(extension, extensionState, true);
        }
        async withProfileScopedServices(profile, fn) {
            return this.userDataProfileStorageService.withProfileScopedStorageService(profile, async (storageService) => {
                const disposables = new lifecycle_1.DisposableStore();
                const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([storage_1.IStorageService, storageService]));
                const extensionEnablementService = disposables.add(instantiationService.createInstance(extensionEnablementService_1.GlobalExtensionEnablementService));
                const extensionStorageService = disposables.add(instantiationService.createInstance(extensionStorage_1.ExtensionStorageService));
                try {
                    return await fn(extensionEnablementService, extensionStorageService);
                }
                finally {
                    disposables.dispose();
                }
            });
        }
    };
    exports.LocalExtensionsProvider = LocalExtensionsProvider;
    exports.LocalExtensionsProvider = LocalExtensionsProvider = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, userDataSync_1.IUserDataSyncLogService)
    ], LocalExtensionsProvider);
    let AbstractExtensionsInitializer = class AbstractExtensionsInitializer extends abstractSynchronizer_1.AbstractInitializer {
        constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("extensions" /* SyncResource.Extensions */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
            this.extensionManagementService = extensionManagementService;
            this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
        }
        async parseExtensions(remoteUserData) {
            return remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
        }
        generatePreview(remoteExtensions, localExtensions) {
            const installedExtensions = [];
            const newExtensions = [];
            const disabledExtensions = [];
            for (const extension of remoteExtensions) {
                if (this.ignoredExtensionsManagementService.hasToNeverSyncExtension(extension.identifier.id)) {
                    // Skip extension ignored to sync
                    continue;
                }
                const installedExtension = localExtensions.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, extension.identifier));
                if (installedExtension) {
                    installedExtensions.push(installedExtension);
                    if (extension.disabled) {
                        disabledExtensions.push(extension.identifier);
                    }
                }
                else if (extension.installed) {
                    newExtensions.push({ ...extension.identifier, preRelease: !!extension.preRelease });
                    if (extension.disabled) {
                        disabledExtensions.push(extension.identifier);
                    }
                }
            }
            return { installedExtensions, newExtensions, disabledExtensions, remoteExtensions };
        }
    };
    exports.AbstractExtensionsInitializer = AbstractExtensionsInitializer;
    exports.AbstractExtensionsInitializer = AbstractExtensionsInitializer = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(2, files_1.IFileService),
        __param(3, userDataProfile_1.IUserDataProfilesService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, log_1.ILogService),
        __param(6, storage_1.IStorageService),
        __param(7, uriIdentity_1.IUriIdentityService)
    ], AbstractExtensionsInitializer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1N5bmMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhU3luYy9jb21tb24vZXh0ZW5zaW9uc1N5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBK0NoRyxLQUFLLFVBQVUseUJBQXlCLENBQUMsUUFBbUIsRUFBRSwwQkFBdUQ7UUFDcEgsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEQsSUFBSSxRQUFRLENBQUMsT0FBTyxLQUFLLENBQUM7ZUFDdEIsUUFBUSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQ3hCLENBQUM7WUFDRixNQUFNLGlCQUFpQixHQUFHLENBQUMsTUFBTSwwQkFBMEIsQ0FBQyxZQUFZLDhCQUFzQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pILEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ3BDLGtEQUFrRDtnQkFDbEQsSUFBSSxRQUFRLENBQUMsT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUM1QixJQUFVLFNBQVUsQ0FBQyxPQUFPLEtBQUssS0FBSyxFQUFFLENBQUM7d0JBQ3hDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO29CQUMzQixDQUFDO29CQUNELE9BQWEsU0FBVSxDQUFDLE9BQU8sQ0FBQztnQkFDakMsQ0FBQztnQkFDRCxhQUFhO2dCQUViLGtFQUFrRTtnQkFDbEUsSUFBSSxRQUFRLENBQUMsT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUM1QixJQUFJLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQzFHLFNBQVMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUM1QixDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsYUFBYTtZQUNkLENBQUM7UUFDRixDQUFDO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDbkIsQ0FBQztJQUVELFNBQWdCLGVBQWUsQ0FBQyxRQUFtQjtRQUNsRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFGRCwwQ0FFQztJQUVELFNBQWdCLFNBQVMsQ0FBQyxVQUE0QixFQUFFLE1BQWU7UUFDdEUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUMxQixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDL0MsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNYLENBQUM7WUFDRCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDL0MsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDO1lBQ0QsT0FBTyxJQUFBLGlCQUFPLEVBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwRCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFBLGlDQUFpQixFQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBWEQsOEJBV0M7SUFFTSxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLDJDQUFvQjtRQW1CL0Q7UUFDQyw4Q0FBOEM7UUFDOUMsT0FBeUIsRUFDekIsVUFBOEIsRUFDVCxrQkFBdUMsRUFDOUMsV0FBeUIsRUFDdEIsY0FBK0IsRUFDckIsd0JBQW1ELEVBQzlDLDZCQUE2RCxFQUNoRSwwQkFBd0UsRUFDaEUsa0NBQXdGLEVBQ3BHLFVBQW1DLEVBQ3JDLG9CQUEyQyxFQUNsQyw2QkFBNkQsRUFDMUUsZ0JBQW1DLEVBQzVCLHVCQUFpRCxFQUN0RCxrQkFBdUMsRUFDNUIsNkJBQTZELEVBQ3RFLG9CQUE0RDtZQUVuRixLQUFLLENBQUMsRUFBRSxZQUFZLDRDQUF5QixFQUFFLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFFLDZCQUE2QixFQUFFLDZCQUE2QixFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBWHpPLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDL0MsdUNBQWtDLEdBQWxDLGtDQUFrQyxDQUFxQztZQVFyRix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBbkNwRjs7O2NBR0U7WUFDRixtRkFBbUY7WUFDbkYsMENBQTBDO1lBQzFDLG1EQUFtRDtZQUNoQyxZQUFPLEdBQVcsQ0FBQyxDQUFDO1lBRXRCLG9CQUFlLEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDdkYsaUJBQVksR0FBUSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNwRyxrQkFBYSxHQUFRLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3RHLG1CQUFjLEdBQVEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDeEcscUJBQWdCLEdBQVEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7WUF5QjVILElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDakcsSUFBSSxDQUFDLFNBQVMsQ0FDYixhQUFLLENBQUMsR0FBRyxDQUNSLGFBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDM0csYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ3RGLGFBQUssQ0FBQyxNQUFNLENBQUMsNkJBQTZCLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssc0RBQWdDLENBQUMsQ0FBQyxDQUFDLEVBQ25PLHVCQUF1QixDQUFDLGlDQUFpQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFUyxLQUFLLENBQUMsbUJBQW1CLENBQUMsY0FBK0IsRUFBRSxnQkFBMEM7WUFDOUcsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLHlCQUF5QixDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNwSixNQUFNLGlCQUFpQixHQUFHLGdCQUFnQixFQUFFLGlCQUFpQixJQUFJLEVBQUUsQ0FBQztZQUNwRSxNQUFNLGlCQUFpQixHQUFHLGdCQUFnQixFQUFFLGlCQUFpQixJQUFJLElBQUksQ0FBQztZQUN0RSxNQUFNLGtCQUFrQixHQUFHLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSx5QkFBeUIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUUzSixNQUFNLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVoSSxJQUFJLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixzREFBc0QsQ0FBQyxDQUFDO1lBQzNHLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0Isa0ZBQWtGLENBQUMsQ0FBQztZQUN2SSxDQUFDO1lBRUQsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFBLHVCQUFLLEVBQUMsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDaEosTUFBTSxhQUFhLEdBQWtDO2dCQUNwRCxLQUFLLEVBQUUsTUFBTTtnQkFDYixPQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQztnQkFDM0YsV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMseUJBQWlCLENBQUMsb0JBQVk7Z0JBQzNILFlBQVksRUFBRSxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMseUJBQWlCLENBQUMsb0JBQVk7YUFDN0QsQ0FBQztZQUVGLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVELE9BQU8sQ0FBQztvQkFDUCxpQkFBaUI7b0JBQ2pCLGlCQUFpQjtvQkFDakIsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMvQixXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVk7b0JBQzFGLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtvQkFDakMsWUFBWTtvQkFDWixlQUFlO29CQUNmLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztvQkFDbkMsZ0JBQWdCO29CQUNoQixhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ2hGLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZTtvQkFDckMsYUFBYTtvQkFDYixXQUFXLEVBQUUsYUFBYSxDQUFDLFdBQVc7b0JBQ3RDLFlBQVksRUFBRSxhQUFhLENBQUMsWUFBWTtvQkFDeEMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtpQkFDdkMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVTLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBbUM7WUFDbkUsTUFBTSxrQkFBa0IsR0FBNEIsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLHlCQUF5QixDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25MLE1BQU0sRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hJLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFBLHVCQUFLLEVBQUMsZUFBZSxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLGlCQUFpQixJQUFJLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN6TCxPQUFPLE1BQU0sS0FBSyxJQUFJLENBQUM7UUFDeEIsQ0FBQztRQUVPLGlCQUFpQixDQUFDLGVBQWlDLEVBQUUsS0FBdUIsRUFBRSxPQUF5QixFQUFFLE9BQStCO1lBQy9JLE1BQU0sT0FBTyxHQUFxQixDQUFDLEdBQUcsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFFekQsTUFBTSxVQUFVLEdBQWdCLElBQUksR0FBRyxFQUFVLENBQUM7WUFDbEQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxVQUFnQyxFQUFFLEVBQUU7Z0JBQzFELFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDckIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7WUFDRixDQUFDLENBQUM7WUFDRixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDL0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUUvQixLQUFLLE1BQU0sY0FBYyxJQUFJLGVBQWUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ3RKLE9BQU87b0JBQ1AsU0FBUztnQkFDVixDQUFDO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVTLEtBQUssQ0FBQyxjQUFjLENBQUMsZUFBMEMsRUFBRSxLQUF3QjtZQUNsRyxPQUFPLEVBQUUsR0FBRyxlQUFlLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUNsRSxDQUFDO1FBRVMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxlQUEwQyxFQUFFLFFBQWEsRUFBRSxPQUFrQyxFQUFFLEtBQXdCO1lBRXRKLDJCQUEyQjtZQUMzQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztnQkFDdkQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFFRCw0QkFBNEI7WUFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBRUQsNkJBQTZCO1lBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO2dCQUN6RCxPQUFPLGVBQWUsQ0FBQyxhQUFhLENBQUM7WUFDdEMsQ0FBQztZQUVELE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVPLEtBQUssQ0FBQyxXQUFXLENBQUMsZUFBMEM7WUFDbkUsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDeEksTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0NBQWtDLENBQUMsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUM1RyxNQUFNLFdBQVcsR0FBRyxJQUFBLHVCQUFLLEVBQUMsZUFBZSxDQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoSyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQztZQUN0QyxPQUFPO2dCQUNOLE9BQU8sRUFBRSxlQUFlLENBQUMsWUFBWTtnQkFDckMsS0FBSztnQkFDTCxNQUFNO2dCQUNOLFdBQVcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLHlCQUFpQixDQUFDLG9CQUFZO2dCQUMzSCxZQUFZLEVBQUUsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLHlCQUFpQixDQUFDLG9CQUFZO2FBQzdELENBQUM7UUFDSCxDQUFDO1FBRU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxlQUEwQztZQUNwRSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN4SSxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQzVHLE1BQU0sZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMxRyxJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRSxDQUFDO2dCQUMvQixNQUFNLFdBQVcsR0FBRyxJQUFBLHVCQUFLLEVBQUMsZUFBZSxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDeEssTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxXQUFXLENBQUM7Z0JBQ3RDLE9BQU87b0JBQ04sT0FBTyxFQUFFLGVBQWUsQ0FBQyxhQUFhO29CQUN0QyxLQUFLO29CQUNMLE1BQU07b0JBQ04sV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMseUJBQWlCLENBQUMsb0JBQVk7b0JBQzNILFlBQVksRUFBRSxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMseUJBQWlCLENBQUMsb0JBQVk7aUJBQzdELENBQUM7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsT0FBTztvQkFDTixPQUFPLEVBQUUsZUFBZSxDQUFDLGFBQWE7b0JBQ3RDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO29CQUM5QyxNQUFNLEVBQUUsSUFBSTtvQkFDWixXQUFXLHFCQUFhO29CQUN4QixZQUFZLHFCQUFhO2lCQUN6QixDQUFDO1lBQ0gsQ0FBQztRQUNGLENBQUM7UUFFUyxLQUFLLENBQUMsV0FBVyxDQUFDLGNBQStCLEVBQUUsZ0JBQXdDLEVBQUUsZ0JBQThFLEVBQUUsS0FBYztZQUNwTSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkYsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTVFLElBQUksV0FBVyx3QkFBZ0IsSUFBSSxZQUFZLHdCQUFnQixFQUFFLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixxREFBcUQsQ0FBQyxDQUFDO1lBQ3pHLENBQUM7WUFFRCxJQUFJLFdBQVcsd0JBQWdCLEVBQUUsQ0FBQztnQkFDakMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDeEQsaUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2SyxDQUFDO1lBRUQsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDWixnQkFBZ0I7Z0JBQ2hCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixpQ0FBaUMsQ0FBQyxDQUFDO2dCQUNyRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0MsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3RixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsK0JBQStCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwWSxDQUFDO1lBRUQsSUFBSSxnQkFBZ0IsRUFBRSxHQUFHLEtBQUssY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNsRCxtQkFBbUI7Z0JBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQiw0Q0FBNEMsQ0FBQyxDQUFDO2dCQUNoRyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3RGLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsRUFBRSxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztnQkFDNUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLDBDQUEwQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzTSxDQUFDO1FBQ0YsQ0FBQztRQUVPLHdCQUF3QixDQUFDLGVBQXNDLEVBQUUseUJBQXdEO1lBQ2hJLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUM3QyxNQUFNLGlCQUFpQixHQUEyQixFQUFFLENBQUM7WUFDckQsS0FBSyxNQUFNLGNBQWMsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDOUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQy9CLGlCQUFpQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ25ELENBQUM7WUFDRixDQUFDO1lBQ0QsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO2dCQUMvQixLQUFLLE1BQU0sZ0JBQWdCLElBQUkseUJBQXlCLEVBQUUsQ0FBQztvQkFDMUQsMEVBQTBFO29CQUMxRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUM7d0JBQ2hFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUMxQyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1lBQ0QsT0FBTyxpQkFBaUIsQ0FBQztRQUMxQixDQUFDO1FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFRO1lBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUM7bUJBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDO21CQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQzttQkFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxFQUNqRCxDQUFDO2dCQUNGLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0RCxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDdEUsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVPLFNBQVMsQ0FBQyxVQUE0QixFQUFFLE1BQWU7WUFDOUQsT0FBTyxTQUFTLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWTtZQUNqQixJQUFJLENBQUM7Z0JBQ0osTUFBTSxFQUFFLGVBQWUsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzdHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7b0JBQzFELE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7WUFDRixDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDaEIsa0JBQWtCO1lBQ25CLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FFRCxDQUFBO0lBdlFZLHdEQUFzQjtxQ0FBdEIsc0JBQXNCO1FBdUJoQyxXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsd0NBQXlCLENBQUE7UUFDekIsV0FBQSw2Q0FBOEIsQ0FBQTtRQUM5QixXQUFBLGlEQUEyQixDQUFBO1FBQzNCLFdBQUEsdURBQW1DLENBQUE7UUFDbkMsV0FBQSxzQ0FBdUIsQ0FBQTtRQUN2QixZQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFlBQUEsNkNBQThCLENBQUE7UUFDOUIsWUFBQSw2QkFBaUIsQ0FBQTtRQUNqQixZQUFBLDJDQUF3QixDQUFBO1FBQ3hCLFlBQUEsaUNBQW1CLENBQUE7UUFDbkIsWUFBQSw4REFBOEIsQ0FBQTtRQUM5QixZQUFBLHFDQUFxQixDQUFBO09BckNYLHNCQUFzQixDQXVRbEM7SUFFTSxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1QjtRQUVuQyxZQUMrQywwQkFBdUQsRUFDcEQsNkJBQTZELEVBQ25FLHVCQUFpRCxFQUN0QyxrQ0FBdUUsRUFDckYsb0JBQTJDLEVBQ3pDLFVBQW1DO1lBTC9CLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDcEQsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFnQztZQUNuRSw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ3RDLHVDQUFrQyxHQUFsQyxrQ0FBa0MsQ0FBcUM7WUFDckYseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUN6QyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtRQUMxRSxDQUFDO1FBRUwsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQXlCO1lBQ2pELE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN0SCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQzVHLE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsdUJBQXVCLEVBQUUsRUFBRTtnQkFDbkksTUFBTSxrQkFBa0IsR0FBRywwQkFBMEIsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM5RSxPQUFPLG1CQUFtQjtxQkFDeEIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNoQixNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxHQUFHLFNBQVMsQ0FBQztvQkFDL0YsTUFBTSxhQUFhLEdBQXdCLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNuSCxJQUFJLG1CQUFtQixJQUFJLENBQUMsSUFBQSx5Q0FBNEIsRUFBQyxRQUFRLENBQUMsRUFBRSxDQUFDO3dCQUNwRSxhQUFhLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7b0JBQ3pELENBQUM7b0JBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLElBQUEsMkNBQWlCLEVBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUNwRyxhQUFhLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztvQkFDL0IsQ0FBQztvQkFDRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ2hCLGFBQWEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUNoQyxDQUFDO29CQUNELElBQUksQ0FBQzt3QkFDSixNQUFNLElBQUksR0FBRyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7d0JBQ3RHLElBQUksSUFBSSxFQUFFLENBQUM7NEJBQ1YsTUFBTSxxQkFBcUIsR0FBRyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOzRCQUMvRixhQUFhLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUE2QixFQUFFLEdBQUcsRUFBRSxFQUFFO2dDQUN0RyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQ0FDeEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUN6QyxDQUFDO2dDQUNELE9BQU8sS0FBSyxDQUFDOzRCQUNkLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDUixDQUFDO29CQUNGLENBQUM7b0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQzt3QkFDaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFBLDhDQUF1Qiw4Q0FBMEIsT0FBTyxDQUFDLHVDQUF1QyxFQUFFLElBQUEsd0JBQWUsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNuSixDQUFDO29CQUNELE9BQU8sYUFBYSxDQUFDO2dCQUN0QixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxDQUFDO1FBQy9DLENBQUM7UUFFRCxLQUFLLENBQUMscUJBQXFCLENBQUMsS0FBdUIsRUFBRSxPQUErQixFQUFFLE9BQXlCLEVBQUUsaUJBQW1DLEVBQUUsT0FBeUI7WUFDOUssTUFBTSxvQkFBb0IsR0FBRyxJQUFBLDhDQUF1Qiw4Q0FBMEIsT0FBTyxDQUFDLENBQUM7WUFDdkYsTUFBTSxtQkFBbUIsR0FBMkIsRUFBRSxDQUFDO1lBQ3ZELE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7WUFDbEUsTUFBTSxpQkFBaUIsR0FBMkIsRUFBRSxDQUFDO1lBQ3JELE1BQU0sWUFBWSxHQUFxQixFQUFFLENBQUM7WUFDMUMsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRXRILGtHQUFrRztZQUNsRyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNwQyxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLDBCQUEwQixFQUFFLHVCQUF1QixFQUFFLEVBQUU7b0JBQzNHLE1BQU0sZ0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUU7d0JBQzNELE1BQU0sa0JBQWtCLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUV4SCw2Q0FBNkM7d0JBQzdDLElBQUksa0JBQWtCLElBQUksa0JBQWtCLENBQUMsU0FBUyxFQUFFLENBQUM7NEJBQ3hELElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQ0FDbEUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSx1QkFBdUIsQ0FBQyxDQUFDOzRCQUN0SCxDQUFDOzRCQUNELE1BQU0sVUFBVSxHQUFHLDBCQUEwQixDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxJQUFBLDJDQUFpQixFQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDOzRCQUNwSixJQUFJLFVBQVUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dDQUNqQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQ0FDaEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBb0IsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQ0FDMUYsTUFBTSwwQkFBMEIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7b0NBQ2hFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsb0JBQW9CLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7Z0NBQ3RGLENBQUM7cUNBQU0sQ0FBQztvQ0FDUCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLG9CQUFvQix5QkFBeUIsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29DQUN6RixNQUFNLDBCQUEwQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7b0NBQy9ELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsb0JBQW9CLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7Z0NBQ3JGLENBQUM7NEJBQ0YsQ0FBQzs0QkFDRCxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUNyQyxPQUFPO3dCQUNSLENBQUM7d0JBRUQsMERBQTBEO3dCQUMxRCxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7d0JBQ2pELE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFaEw7OzsyQkFHRzt3QkFDSCxJQUFJLENBQUMsQ0FBQyxLQUFLOzRCQUNWLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQywyQ0FBMkM7Z0NBQ2xILENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLEVBQ2hDLENBQUM7NEJBQ0YsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLElBQUksU0FBUyxFQUFFLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsdUJBQXVCLENBQUMsQ0FBQzt3QkFDcEksQ0FBQzt3QkFFRCxJQUFJLFNBQVMsRUFBRSxDQUFDOzRCQUNmLElBQUksQ0FBQztnQ0FDSixNQUFNLFVBQVUsR0FBRywwQkFBMEIsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQ0FDcEosSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQ0FDakMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7d0NBQ2hCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsb0JBQW9CLDBCQUEwQixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3Q0FDN0csTUFBTSwwQkFBMEIsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7d0NBQ3hFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsb0JBQW9CLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQ0FDekcsQ0FBQzt5Q0FBTSxDQUFDO3dDQUNQLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsb0JBQW9CLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3Q0FDNUcsTUFBTSwwQkFBMEIsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dDQUN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLG9CQUFvQixxQkFBcUIsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7b0NBQ3hHLENBQUM7Z0NBQ0YsQ0FBQztnQ0FFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsMENBQTBDO3VDQUM5RCxrQkFBa0IsQ0FBQyxVQUFVLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyw4REFBOEQ7dUNBQzdHLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFFLHlEQUF5RDt1Q0FDakcsQ0FBQyxPQUFPLElBQUksa0JBQWtCLENBQUMsUUFBUSxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsQ0FBRSwrQ0FBK0M7a0NBQy9HLENBQUM7b0NBQ0YsSUFBSSxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQzt3Q0FDakUsbUJBQW1CLENBQUMsSUFBSSxDQUFDOzRDQUN4QixTQUFTLEVBQUUsT0FBTyxFQUFFO2dEQUNuQixlQUFlLEVBQUUsS0FBSyxDQUFDLHlFQUF5RTtnREFDaEcsK0JBQStCLEVBQUUsSUFBSTtnREFDckMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87Z0RBQzVDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyxVQUFVO2dEQUN0QyxlQUFlLEVBQUUsT0FBTyxDQUFDLGtCQUFrQjtnREFDM0MsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtnREFDMUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxnRUFBMEMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLG9EQUE4QixDQUFDLEVBQUUsSUFBSSxFQUFFOzZDQUN2Rzt5Q0FDRCxDQUFDLENBQUM7d0NBQ0gsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO29DQUN2RSxDQUFDO3lDQUFNLENBQUM7d0NBQ1AsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxvQkFBb0IsbUVBQW1FLEVBQUUsU0FBUyxDQUFDLFdBQVcsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dDQUNuSyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUN0QixDQUFDO2dDQUNGLENBQUM7NEJBQ0YsQ0FBQzs0QkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dDQUNoQixZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQ0FDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxvQkFBb0IsbUNBQW1DLEVBQUUsU0FBUyxDQUFDLFdBQVcsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDOzRCQUNwSSxDQUFDO3dCQUNGLENBQUM7NkJBQU0sQ0FBQzs0QkFDUCxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLG9CQUFvQix1RUFBdUUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUN2SSxDQUFDO29CQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsMkNBQTJDO1lBQzNDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNwQixNQUFNLGtCQUFrQixHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4SixNQUFNLGdCQUFRLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsaUJBQWlCLEVBQUMsRUFBRTtvQkFDdkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBb0IsbUNBQW1DLEVBQUUsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNuSCxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO29CQUN4SyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLG9CQUFvQixnQ0FBZ0MsRUFBRSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQy9HLGlCQUFpQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEQsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7WUFFRCxtQ0FBbUM7WUFDbkMsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNwRyxLQUFLLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDNUQsTUFBTSxPQUFPLEdBQUcsTUFBMkIsQ0FBQztnQkFDNUMsSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDWCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLG9CQUFvQix3QkFBd0IsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDdEcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsTUFBTSxDQUFDLEdBQUcsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztvQkFDbkUsSUFBSSxDQUFDLEVBQUUsQ0FBQzt3QkFDUCxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLG9CQUFvQixtQ0FBbUMsRUFBRSxPQUFPLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2hJLENBQUM7b0JBQ0QsSUFBSSxLQUFLLFlBQVksOENBQXdCLElBQUksQ0FBQyxrREFBNEIsQ0FBQyxZQUFZLEVBQUUsa0RBQTRCLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7d0JBQzVLLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsb0JBQW9CLGtGQUFrRixFQUFFLE9BQU8sQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDL0ssQ0FBQzt5QkFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUNsQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDOUIsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVELE1BQU0sb0JBQW9CLEdBQXFCLEVBQUUsQ0FBQztZQUNsRCxLQUFLLE1BQU0sZ0JBQWdCLElBQUksaUJBQWlCLEVBQUUsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsMkNBQWlCLEVBQUMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDckYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzdDLENBQUM7WUFDRixDQUFDO1lBQ0QsS0FBSyxNQUFNLGdCQUFnQixJQUFJLFlBQVksRUFBRSxDQUFDO2dCQUM3QyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxDQUFDLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDbkcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzdDLENBQUM7WUFDRixDQUFDO1lBQ0QsT0FBTyxvQkFBb0IsQ0FBQztRQUM3QixDQUFDO1FBRU8sb0JBQW9CLENBQUMsS0FBNkIsRUFBRSxTQUE4QyxFQUFFLE9BQTJCLEVBQUUsdUJBQWlEO1lBQ3pMLE1BQU0sY0FBYyxHQUFHLHVCQUF1QixDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEYsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3BILElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUNELHVCQUF1QixDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUVPLEtBQUssQ0FBQyx5QkFBeUIsQ0FBSSxPQUF5QixFQUFFLEVBQW9JO1lBQ3pNLE9BQU8sSUFBSSxDQUFDLDZCQUE2QixDQUFDLCtCQUErQixDQUFDLE9BQU8sRUFDaEYsS0FBSyxFQUFDLGNBQWMsRUFBQyxFQUFFO2dCQUN0QixNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLElBQUkscUNBQWlCLENBQUMsQ0FBQyx5QkFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0gsTUFBTSwwQkFBMEIsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw2REFBZ0MsQ0FBQyxDQUFDLENBQUM7Z0JBQzFILE1BQU0sdUJBQXVCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMENBQXVCLENBQUMsQ0FBQyxDQUFDO2dCQUM5RyxJQUFJLENBQUM7b0JBQ0osT0FBTyxNQUFNLEVBQUUsQ0FBQywwQkFBMEIsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO2dCQUN0RSxDQUFDO3dCQUFTLENBQUM7b0JBQ1YsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN2QixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBRUQsQ0FBQTtJQTlOWSwwREFBdUI7c0NBQXZCLHVCQUF1QjtRQUdqQyxXQUFBLGlEQUEyQixDQUFBO1FBQzNCLFdBQUEsOERBQThCLENBQUE7UUFDOUIsV0FBQSw4Q0FBd0IsQ0FBQTtRQUN4QixXQUFBLHVEQUFtQyxDQUFBO1FBQ25DLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxzQ0FBdUIsQ0FBQTtPQVJiLHVCQUF1QixDQThObkM7SUFTTSxJQUFlLDZCQUE2QixHQUE1QyxNQUFlLDZCQUE4QixTQUFRLDBDQUFtQjtRQUU5RSxZQUNpRCwwQkFBdUQsRUFDakQsa0NBQXVFLEVBQy9HLFdBQXlCLEVBQ2IsdUJBQWlELEVBQ3RELGtCQUF1QyxFQUMvQyxVQUF1QixFQUNuQixjQUErQixFQUMzQixrQkFBdUM7WUFFNUQsS0FBSyw2Q0FBMEIsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQVR6RiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQ2pELHVDQUFrQyxHQUFsQyxrQ0FBa0MsQ0FBcUM7UUFTOUgsQ0FBQztRQUVTLEtBQUssQ0FBQyxlQUFlLENBQUMsY0FBK0I7WUFDOUQsT0FBTyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLHlCQUF5QixDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNuSSxDQUFDO1FBRVMsZUFBZSxDQUFDLGdCQUFrQyxFQUFFLGVBQWtDO1lBQy9GLE1BQU0sbUJBQW1CLEdBQXNCLEVBQUUsQ0FBQztZQUNsRCxNQUFNLGFBQWEsR0FBdUQsRUFBRSxDQUFDO1lBQzdFLE1BQU0sa0JBQWtCLEdBQTJCLEVBQUUsQ0FBQztZQUN0RCxLQUFLLE1BQU0sU0FBUyxJQUFJLGdCQUFnQixFQUFFLENBQUM7Z0JBQzFDLElBQUksSUFBSSxDQUFDLGtDQUFrQyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztvQkFDOUYsaUNBQWlDO29CQUNqQyxTQUFTO2dCQUNWLENBQUM7Z0JBRUQsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUM1RyxJQUFJLGtCQUFrQixFQUFFLENBQUM7b0JBQ3hCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUM3QyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDeEIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDL0MsQ0FBQztnQkFDRixDQUFDO3FCQUFNLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNoQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ3BGLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUN4QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUMvQyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1lBQ0QsT0FBTyxFQUFFLG1CQUFtQixFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JGLENBQUM7S0FFRCxDQUFBO0lBN0NxQixzRUFBNkI7NENBQTdCLDZCQUE2QjtRQUdoRCxXQUFBLGlEQUEyQixDQUFBO1FBQzNCLFdBQUEsdURBQW1DLENBQUE7UUFDbkMsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSwwQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsaUNBQW1CLENBQUE7T0FWQSw2QkFBNkIsQ0E2Q2xEIn0=
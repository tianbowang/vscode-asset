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
define(["require", "exports", "vs/base/common/jsonFormatter", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/userDataProfilesManifestMerge", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, jsonFormatter_1, configuration_1, environment_1, files_1, storage_1, telemetry_1, uriIdentity_1, userDataProfile_1, abstractSynchronizer_1, userDataProfilesManifestMerge_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseUserDataProfilesManifest = exports.stringifyLocalProfiles = exports.UserDataProfilesManifestSynchroniser = void 0;
    let UserDataProfilesManifestSynchroniser = class UserDataProfilesManifestSynchroniser extends abstractSynchronizer_1.AbstractSynchroniser {
        constructor(profile, collection, userDataProfilesService, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, telemetryService, uriIdentityService) {
            super({ syncResource: "profiles" /* SyncResource.Profiles */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.userDataProfilesService = userDataProfilesService;
            this.version = 2;
            this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'profiles.json');
            this.baseResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' });
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
            this._register(userDataProfilesService.onDidChangeProfiles(() => this.triggerLocalChange()));
        }
        async getLastSyncedProfiles() {
            const lastSyncUserData = await this.getLastSyncUserData();
            return lastSyncUserData?.syncData ? parseUserDataProfilesManifest(lastSyncUserData.syncData) : null;
        }
        async getRemoteSyncedProfiles(manifest) {
            const lastSyncUserData = await this.getLastSyncUserData();
            const remoteUserData = await this.getLatestRemoteUserData(manifest, lastSyncUserData);
            return remoteUserData?.syncData ? parseUserDataProfilesManifest(remoteUserData.syncData) : null;
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
            if (!this.userDataProfilesService.isEnabled()) {
                throw new userDataSync_1.UserDataSyncError('Cannot sync profiles because they are disabled', "LocalError" /* UserDataSyncErrorCode.LocalError */);
            }
            const remoteProfiles = remoteUserData.syncData ? parseUserDataProfilesManifest(remoteUserData.syncData) : null;
            const lastSyncProfiles = lastSyncUserData?.syncData ? parseUserDataProfilesManifest(lastSyncUserData.syncData) : null;
            const localProfiles = this.getLocalUserDataProfiles();
            const { local, remote } = (0, userDataProfilesManifestMerge_1.merge)(localProfiles, remoteProfiles, lastSyncProfiles, []);
            const previewResult = {
                local, remote,
                content: lastSyncProfiles ? this.stringifyRemoteProfiles(lastSyncProfiles) : null,
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
            const localContent = stringifyLocalProfiles(localProfiles, false);
            return [{
                    baseResource: this.baseResource,
                    baseContent: lastSyncProfiles ? this.stringifyRemoteProfiles(lastSyncProfiles) : null,
                    localResource: this.localResource,
                    localContent,
                    remoteResource: this.remoteResource,
                    remoteContent: remoteProfiles ? this.stringifyRemoteProfiles(remoteProfiles) : null,
                    remoteProfiles,
                    previewResource: this.previewResource,
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.acceptedResource
                }];
        }
        async hasRemoteChanged(lastSyncUserData) {
            const lastSyncProfiles = lastSyncUserData?.syncData ? parseUserDataProfilesManifest(lastSyncUserData.syncData) : null;
            const localProfiles = this.getLocalUserDataProfiles();
            const { remote } = (0, userDataProfilesManifestMerge_1.merge)(localProfiles, lastSyncProfiles, lastSyncProfiles, []);
            return !!remote?.added.length || !!remote?.removed.length || !!remote?.updated.length;
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
            const localProfiles = this.getLocalUserDataProfiles();
            const mergeResult = (0, userDataProfilesManifestMerge_1.merge)(localProfiles, null, null, []);
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
            const remoteProfiles = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
            const lastSyncProfiles = [];
            const localProfiles = [];
            for (const profile of this.getLocalUserDataProfiles()) {
                const remoteProfile = remoteProfiles?.find(remoteProfile => remoteProfile.id === profile.id);
                if (remoteProfile) {
                    lastSyncProfiles.push({ id: profile.id, name: profile.name, collection: remoteProfile.collection });
                    localProfiles.push(profile);
                }
            }
            if (remoteProfiles !== null) {
                const mergeResult = (0, userDataProfilesManifestMerge_1.merge)(localProfiles, remoteProfiles, lastSyncProfiles, []);
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
            const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing profiles.`);
            }
            const remoteProfiles = resourcePreviews[0][0].remoteProfiles || [];
            if (remoteProfiles.length + (remote?.added.length ?? 0) - (remote?.removed.length ?? 0) > 20) {
                throw new userDataSync_1.UserDataSyncError('Too many profiles to sync. Please remove some profiles and try again.', "LocalTooManyProfiles" /* UserDataSyncErrorCode.LocalTooManyProfiles */);
            }
            if (localChange !== 0 /* Change.None */) {
                await this.backupLocal(stringifyLocalProfiles(this.getLocalUserDataProfiles(), false));
                const promises = [];
                for (const profile of local.added) {
                    promises.push((async () => {
                        this.logService.trace(`${this.syncResourceLogLabel}: Creating '${profile.name}' profile...`);
                        await this.userDataProfilesService.createProfile(profile.id, profile.name, { shortName: profile.shortName, icon: profile.icon, useDefaultFlags: profile.useDefaultFlags });
                        this.logService.info(`${this.syncResourceLogLabel}: Created profile '${profile.name}'.`);
                    })());
                }
                for (const profile of local.removed) {
                    promises.push((async () => {
                        this.logService.trace(`${this.syncResourceLogLabel}: Removing '${profile.name}' profile...`);
                        await this.userDataProfilesService.removeProfile(profile);
                        this.logService.info(`${this.syncResourceLogLabel}: Removed profile '${profile.name}'.`);
                    })());
                }
                for (const profile of local.updated) {
                    const localProfile = this.userDataProfilesService.profiles.find(p => p.id === profile.id);
                    if (localProfile) {
                        promises.push((async () => {
                            this.logService.trace(`${this.syncResourceLogLabel}: Updating '${profile.name}' profile...`);
                            await this.userDataProfilesService.updateProfile(localProfile, { name: profile.name, shortName: profile.shortName, icon: profile.icon, useDefaultFlags: profile.useDefaultFlags });
                            this.logService.info(`${this.syncResourceLogLabel}: Updated profile '${profile.name}'.`);
                        })());
                    }
                    else {
                        this.logService.info(`${this.syncResourceLogLabel}: Could not find profile with id '${profile.id}' to update.`);
                    }
                }
                await Promise.all(promises);
            }
            if (remoteChange !== 0 /* Change.None */) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote profiles...`);
                const addedCollections = [];
                const canAddRemoteProfiles = remoteProfiles.length + (remote?.added.length ?? 0) <= 20;
                if (canAddRemoteProfiles) {
                    for (const profile of remote?.added || []) {
                        const collection = await this.userDataSyncStoreService.createCollection(this.syncHeaders);
                        addedCollections.push(collection);
                        remoteProfiles.push({ id: profile.id, name: profile.name, collection, shortName: profile.shortName, icon: profile.icon, useDefaultFlags: profile.useDefaultFlags });
                    }
                }
                else {
                    this.logService.info(`${this.syncResourceLogLabel}: Could not create remote profiles as there are too many profiles.`);
                }
                for (const profile of remote?.removed || []) {
                    remoteProfiles.splice(remoteProfiles.findIndex(({ id }) => profile.id === id), 1);
                }
                for (const profile of remote?.updated || []) {
                    const profileToBeUpdated = remoteProfiles.find(({ id }) => profile.id === id);
                    if (profileToBeUpdated) {
                        remoteProfiles.splice(remoteProfiles.indexOf(profileToBeUpdated), 1, { ...profileToBeUpdated, id: profile.id, name: profile.name, shortName: profile.shortName, icon: profile.icon, useDefaultFlags: profile.useDefaultFlags });
                    }
                }
                try {
                    remoteUserData = await this.updateRemoteProfiles(remoteProfiles, force ? null : remoteUserData.ref);
                    this.logService.info(`${this.syncResourceLogLabel}: Updated remote profiles.${canAddRemoteProfiles && remote?.added.length ? ` Added: ${JSON.stringify(remote.added.map(e => e.name))}.` : ''}${remote?.updated.length ? ` Updated: ${JSON.stringify(remote.updated.map(e => e.name))}.` : ''}${remote?.removed.length ? ` Removed: ${JSON.stringify(remote.removed.map(e => e.name))}.` : ''}`);
                }
                catch (error) {
                    if (addedCollections.length) {
                        this.logService.info(`${this.syncResourceLogLabel}: Failed to update remote profiles. Cleaning up added collections...`);
                        for (const collection of addedCollections) {
                            await this.userDataSyncStoreService.deleteCollection(collection, this.syncHeaders);
                        }
                    }
                    throw error;
                }
                for (const profile of remote?.removed || []) {
                    await this.userDataSyncStoreService.deleteCollection(profile.collection, this.syncHeaders);
                }
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized profiles...`);
                await this.updateLastSyncUserData(remoteUserData);
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized profiles.`);
            }
        }
        async updateRemoteProfiles(profiles, ref) {
            return this.updateRemoteUserData(this.stringifyRemoteProfiles(profiles), ref);
        }
        async hasLocalData() {
            return this.getLocalUserDataProfiles().length > 0;
        }
        async resolveContent(uri) {
            if (this.extUri.isEqual(this.remoteResource, uri)
                || this.extUri.isEqual(this.baseResource, uri)
                || this.extUri.isEqual(this.localResource, uri)
                || this.extUri.isEqual(this.acceptedResource, uri)) {
                const content = await this.resolvePreviewContent(uri);
                return content ? (0, jsonFormatter_1.toFormattedString)(JSON.parse(content), {}) : content;
            }
            return null;
        }
        getLocalUserDataProfiles() {
            return this.userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient);
        }
        stringifyRemoteProfiles(profiles) {
            return JSON.stringify([...profiles].sort((a, b) => a.name.localeCompare(b.name)));
        }
    };
    exports.UserDataProfilesManifestSynchroniser = UserDataProfilesManifestSynchroniser;
    exports.UserDataProfilesManifestSynchroniser = UserDataProfilesManifestSynchroniser = __decorate([
        __param(2, userDataProfile_1.IUserDataProfilesService),
        __param(3, files_1.IFileService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, storage_1.IStorageService),
        __param(6, userDataSync_1.IUserDataSyncStoreService),
        __param(7, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(8, userDataSync_1.IUserDataSyncLogService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, userDataSync_1.IUserDataSyncEnablementService),
        __param(11, telemetry_1.ITelemetryService),
        __param(12, uriIdentity_1.IUriIdentityService)
    ], UserDataProfilesManifestSynchroniser);
    function stringifyLocalProfiles(profiles, format) {
        const result = [...profiles].sort((a, b) => a.name.localeCompare(b.name)).map(p => ({ id: p.id, name: p.name }));
        return format ? (0, jsonFormatter_1.toFormattedString)(result, {}) : JSON.stringify(result);
    }
    exports.stringifyLocalProfiles = stringifyLocalProfiles;
    function parseUserDataProfilesManifest(syncData) {
        return JSON.parse(syncData.content);
    }
    exports.parseUserDataProfilesManifest = parseUserDataProfilesManifest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlc01hbmlmZXN0U3luYy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi91c2VyRGF0YVByb2ZpbGVzTWFuaWZlc3RTeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBCekYsSUFBTSxvQ0FBb0MsR0FBMUMsTUFBTSxvQ0FBcUMsU0FBUSwyQ0FBb0I7UUFTN0UsWUFDQyxPQUF5QixFQUN6QixVQUE4QixFQUNKLHVCQUFrRSxFQUM5RSxXQUF5QixFQUNsQixrQkFBdUMsRUFDM0MsY0FBK0IsRUFDckIsd0JBQW1ELEVBQzlDLDZCQUE2RCxFQUNwRSxVQUFtQyxFQUNyQyxvQkFBMkMsRUFDbEMsNkJBQTZELEVBQzFFLGdCQUFtQyxFQUNqQyxrQkFBdUM7WUFFNUQsS0FBSyxDQUFDLEVBQUUsWUFBWSx3Q0FBdUIsRUFBRSxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSw2QkFBNkIsRUFBRSw2QkFBNkIsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQVoxTyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBVjFFLFlBQU8sR0FBVyxDQUFDLENBQUM7WUFDOUIsb0JBQWUsR0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDckYsaUJBQVksR0FBUSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxvQ0FBcUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNwRyxrQkFBYSxHQUFRLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG9DQUFxQixFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3RHLG1CQUFjLEdBQVEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDeEcscUJBQWdCLEdBQVEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsb0NBQXFCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFrQnBILElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFRCxLQUFLLENBQUMscUJBQXFCO1lBQzFCLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUMxRCxPQUFPLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNyRyxDQUFDO1FBRUQsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFFBQTBDO1lBQ3ZFLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUMxRCxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUN0RixPQUFPLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2pHLENBQUM7UUFFUyxLQUFLLENBQUMsbUJBQW1CLENBQUMsY0FBK0IsRUFBRSxnQkFBd0MsRUFBRSw4QkFBdUM7WUFDckosSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxNQUFNLElBQUksZ0NBQWlCLENBQUMsZ0RBQWdELHNEQUFtQyxDQUFDO1lBQ2pILENBQUM7WUFDRCxNQUFNLGNBQWMsR0FBa0MsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDOUksTUFBTSxnQkFBZ0IsR0FBa0MsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3JKLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBRXRELE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBQSxxQ0FBSyxFQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckYsTUFBTSxhQUFhLEdBQWdEO2dCQUNsRSxLQUFLLEVBQUUsTUFBTTtnQkFDYixPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUNqRixXQUFXLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyx5QkFBaUIsQ0FBQyxvQkFBWTtnQkFDM0gsWUFBWSxFQUFFLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyx5QkFBaUIsQ0FBQyxvQkFBWTthQUM3RCxDQUFDO1lBRUYsTUFBTSxZQUFZLEdBQUcsc0JBQXNCLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xFLE9BQU8sQ0FBQztvQkFDUCxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7b0JBQy9CLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3JGLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtvQkFDakMsWUFBWTtvQkFDWixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7b0JBQ25DLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDbkYsY0FBYztvQkFDZCxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7b0JBQ3JDLGFBQWE7b0JBQ2IsV0FBVyxFQUFFLGFBQWEsQ0FBQyxXQUFXO29CQUN0QyxZQUFZLEVBQUUsYUFBYSxDQUFDLFlBQVk7b0JBQ3hDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7aUJBQ3ZDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWlDO1lBQ2pFLE1BQU0sZ0JBQWdCLEdBQWtDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNySixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUN0RCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBQSxxQ0FBSyxFQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoRixPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3ZGLENBQUM7UUFFUyxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQXlELEVBQUUsS0FBd0I7WUFDakgsT0FBTyxFQUFFLEdBQUcsZUFBZSxDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDbEUsQ0FBQztRQUVTLEtBQUssQ0FBQyxlQUFlLENBQUMsZUFBeUQsRUFBRSxRQUFhLEVBQUUsT0FBa0MsRUFBRSxLQUF3QjtZQUNySywyQkFBMkI7WUFDM0IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBRUQsNEJBQTRCO1lBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO2dCQUN4RCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDM0MsQ0FBQztZQUVELDZCQUE2QjtZQUM3QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztnQkFDekQsT0FBTyxlQUFlLENBQUMsYUFBYSxDQUFDO1lBQ3RDLENBQUM7WUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFTyxLQUFLLENBQUMsV0FBVyxDQUFDLGVBQXlEO1lBQ2xGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQ3RELE1BQU0sV0FBVyxHQUFHLElBQUEscUNBQUssRUFBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQztZQUN0QyxPQUFPO2dCQUNOLE9BQU8sRUFBRSxlQUFlLENBQUMsWUFBWTtnQkFDckMsS0FBSztnQkFDTCxNQUFNO2dCQUNOLFdBQVcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLHlCQUFpQixDQUFDLG9CQUFZO2dCQUMzSCxZQUFZLEVBQUUsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLHlCQUFpQixDQUFDLG9CQUFZO2FBQzdELENBQUM7UUFDSCxDQUFDO1FBRU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxlQUF5RDtZQUNuRixNQUFNLGNBQWMsR0FBMkIsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNoSSxNQUFNLGdCQUFnQixHQUEyQixFQUFFLENBQUM7WUFDcEQsTUFBTSxhQUFhLEdBQXVCLEVBQUUsQ0FBQztZQUM3QyxLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUM7Z0JBQ3ZELE1BQU0sYUFBYSxHQUFHLGNBQWMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDN0YsSUFBSSxhQUFhLEVBQUUsQ0FBQztvQkFDbkIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUNwRyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM3QixDQUFDO1lBQ0YsQ0FBQztZQUNELElBQUksY0FBYyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUM3QixNQUFNLFdBQVcsR0FBRyxJQUFBLHFDQUFLLEVBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDL0UsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxXQUFXLENBQUM7Z0JBQ3RDLE9BQU87b0JBQ04sT0FBTyxFQUFFLGVBQWUsQ0FBQyxhQUFhO29CQUN0QyxLQUFLO29CQUNMLE1BQU07b0JBQ04sV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMseUJBQWlCLENBQUMsb0JBQVk7b0JBQzNILFlBQVksRUFBRSxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMseUJBQWlCLENBQUMsb0JBQVk7aUJBQzdELENBQUM7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsT0FBTztvQkFDTixPQUFPLEVBQUUsZUFBZSxDQUFDLGFBQWE7b0JBQ3RDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO29CQUM5QyxNQUFNLEVBQUUsSUFBSTtvQkFDWixXQUFXLHFCQUFhO29CQUN4QixZQUFZLHFCQUFhO2lCQUN6QixDQUFDO1lBQ0gsQ0FBQztRQUNGLENBQUM7UUFFUyxLQUFLLENBQUMsV0FBVyxDQUFDLGNBQStCLEVBQUUsZ0JBQXdDLEVBQUUsZ0JBQTJHLEVBQUUsS0FBYztZQUNqTyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUUsSUFBSSxXQUFXLHdCQUFnQixJQUFJLFlBQVksd0JBQWdCLEVBQUUsQ0FBQztnQkFDakUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLG1EQUFtRCxDQUFDLENBQUM7WUFDdkcsQ0FBQztZQUVELE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7WUFDbkUsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDOUYsTUFBTSxJQUFJLGdDQUFpQixDQUFDLHVFQUF1RSwwRUFBNkMsQ0FBQztZQUNsSixDQUFDO1lBRUQsSUFBSSxXQUFXLHdCQUFnQixFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixNQUFNLFFBQVEsR0FBbUIsRUFBRSxDQUFDO2dCQUNwQyxLQUFLLE1BQU0sT0FBTyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUN6QixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsZUFBZSxPQUFPLENBQUMsSUFBSSxjQUFjLENBQUMsQ0FBQzt3QkFDN0YsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQzt3QkFDM0ssSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLHNCQUFzQixPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztvQkFDMUYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBQ0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTt3QkFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLGVBQWUsT0FBTyxDQUFDLElBQUksY0FBYyxDQUFDLENBQUM7d0JBQzdGLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLHNCQUFzQixPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztvQkFDMUYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBQ0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3JDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzFGLElBQUksWUFBWSxFQUFFLENBQUM7d0JBQ2xCLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTs0QkFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLGVBQWUsT0FBTyxDQUFDLElBQUksY0FBYyxDQUFDLENBQUM7NEJBQzdGLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7NEJBQ25MLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixzQkFBc0IsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7d0JBQzFGLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDUCxDQUFDO3lCQUFNLENBQUM7d0JBQ1AsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLHFDQUFxQyxPQUFPLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDakgsQ0FBQztnQkFDRixDQUFDO2dCQUNELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBRUQsSUFBSSxZQUFZLHdCQUFnQixFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQiwrQkFBK0IsQ0FBQyxDQUFDO2dCQUNuRixNQUFNLGdCQUFnQixHQUFhLEVBQUUsQ0FBQztnQkFDdEMsTUFBTSxvQkFBb0IsR0FBRyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN2RixJQUFJLG9CQUFvQixFQUFFLENBQUM7b0JBQzFCLEtBQUssTUFBTSxPQUFPLElBQUksTUFBTSxFQUFFLEtBQUssSUFBSSxFQUFFLEVBQUUsQ0FBQzt3QkFDM0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUMxRixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ2xDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO29CQUNySyxDQUFDO2dCQUNGLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0Isb0VBQW9FLENBQUMsQ0FBQztnQkFDeEgsQ0FBQztnQkFDRCxLQUFLLE1BQU0sT0FBTyxJQUFJLE1BQU0sRUFBRSxPQUFPLElBQUksRUFBRSxFQUFFLENBQUM7b0JBQzdDLGNBQWMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLENBQUM7Z0JBQ0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxNQUFNLEVBQUUsT0FBTyxJQUFJLEVBQUUsRUFBRSxDQUFDO29CQUM3QyxNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUM5RSxJQUFJLGtCQUFrQixFQUFFLENBQUM7d0JBQ3hCLGNBQWMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO29CQUNqTyxDQUFDO2dCQUNGLENBQUM7Z0JBRUQsSUFBSSxDQUFDO29CQUNKLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDcEcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLDZCQUE2QixvQkFBb0IsSUFBSSxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2xZLENBQUM7Z0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLHNFQUFzRSxDQUFDLENBQUM7d0JBQ3pILEtBQUssTUFBTSxVQUFVLElBQUksZ0JBQWdCLEVBQUUsQ0FBQzs0QkFDM0MsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDcEYsQ0FBQztvQkFDRixDQUFDO29CQUNELE1BQU0sS0FBSyxDQUFDO2dCQUNiLENBQUM7Z0JBRUQsS0FBSyxNQUFNLE9BQU8sSUFBSSxNQUFNLEVBQUUsT0FBTyxJQUFJLEVBQUUsRUFBRSxDQUFDO29CQUM3QyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDNUYsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLGdCQUFnQixFQUFFLEdBQUcsS0FBSyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2xELG1CQUFtQjtnQkFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLDBDQUEwQyxDQUFDLENBQUM7Z0JBQzlGLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsdUNBQXVDLENBQUMsQ0FBQztZQUMzRixDQUFDO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxRQUFnQyxFQUFFLEdBQWtCO1lBQzlFLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQsS0FBSyxDQUFDLFlBQVk7WUFDakIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQVE7WUFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQzttQkFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUM7bUJBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDO21CQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLEVBQ2pELENBQUM7Z0JBQ0YsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3RELE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFBLGlDQUFpQixFQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN2RSxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU8sd0JBQXdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUVPLHVCQUF1QixDQUFDLFFBQWdDO1lBQy9ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRixDQUFDO0tBRUQsQ0FBQTtJQTNRWSxvRkFBb0M7bURBQXBDLG9DQUFvQztRQVk5QyxXQUFBLDBDQUF3QixDQUFBO1FBQ3hCLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSx3Q0FBeUIsQ0FBQTtRQUN6QixXQUFBLDZDQUE4QixDQUFBO1FBQzlCLFdBQUEsc0NBQXVCLENBQUE7UUFDdkIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixZQUFBLDZDQUE4QixDQUFBO1FBQzlCLFlBQUEsNkJBQWlCLENBQUE7UUFDakIsWUFBQSxpQ0FBbUIsQ0FBQTtPQXRCVCxvQ0FBb0MsQ0EyUWhEO0lBRUQsU0FBZ0Isc0JBQXNCLENBQUMsUUFBNEIsRUFBRSxNQUFlO1FBQ25GLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakgsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUEsaUNBQWlCLEVBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFIRCx3REFHQztJQUVELFNBQWdCLDZCQUE2QixDQUFDLFFBQW1CO1FBQ2hFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUZELHNFQUVDIn0=
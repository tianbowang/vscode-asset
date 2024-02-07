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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/json", "vs/base/common/jsonFormatter", "vs/base/common/platform", "vs/base/common/uuid", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/content", "vs/platform/userDataSync/common/globalStateMerge", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/instantiation/common/instantiation"], function (require, exports, buffer_1, errors_1, event_1, json_1, jsonFormatter_1, platform_1, uuid_1, configuration_1, environment_1, files_1, log_1, serviceMachineId_1, storage_1, telemetry_1, uriIdentity_1, abstractSynchronizer_1, content_1, globalStateMerge_1, userDataSync_1, userDataProfile_1, userDataProfileStorageService_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncStoreTypeSynchronizer = exports.GlobalStateInitializer = exports.LocalGlobalStateProvider = exports.GlobalStateSynchroniser = exports.stringify = void 0;
    const argvStoragePrefx = 'globalState.argv.';
    const argvProperties = ['locale'];
    function stringify(globalState, format) {
        const storageKeys = globalState.storage ? Object.keys(globalState.storage).sort() : [];
        const storage = {};
        storageKeys.forEach(key => storage[key] = globalState.storage[key]);
        globalState.storage = storage;
        return format ? (0, jsonFormatter_1.toFormattedString)(globalState, {}) : JSON.stringify(globalState);
    }
    exports.stringify = stringify;
    const GLOBAL_STATE_DATA_VERSION = 1;
    /**
     * Synchronises global state that includes
     * 	- Global storage with user scope
     * 	- Locale from argv properties
     *
     * Global storage is synced without checking version just like other resources (settings, keybindings).
     * If there is a change in format of the value of a storage key which requires migration then
     * 		Owner of that key should remove that key from user scope and replace that with new user scoped key.
     */
    let GlobalStateSynchroniser = class GlobalStateSynchroniser extends abstractSynchronizer_1.AbstractSynchroniser {
        constructor(profile, collection, userDataProfileStorageService, fileService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, environmentService, userDataSyncEnablementService, telemetryService, configurationService, storageService, uriIdentityService, instantiationService) {
            super({ syncResource: "globalState" /* SyncResource.GlobalState */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.userDataProfileStorageService = userDataProfileStorageService;
            this.version = GLOBAL_STATE_DATA_VERSION;
            this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'globalState.json');
            this.baseResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' });
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
            this.localGlobalStateProvider = instantiationService.createInstance(LocalGlobalStateProvider);
            this._register(fileService.watch(this.extUri.dirname(this.environmentService.argvResource)));
            this._register(event_1.Event.any(
            /* Locale change */
            event_1.Event.filter(fileService.onDidFilesChange, e => e.contains(this.environmentService.argvResource)), event_1.Event.filter(userDataProfileStorageService.onDidChange, e => {
                /* StorageTarget has changed in profile storage */
                if (e.targetChanges.some(profile => this.syncResource.profile.id === profile.id)) {
                    return true;
                }
                /* User storage data has changed in profile storage */
                if (e.valueChanges.some(({ profile, changes }) => this.syncResource.profile.id === profile.id && changes.some(change => change.target === 0 /* StorageTarget.USER */))) {
                    return true;
                }
                return false;
            }))((() => this.triggerLocalChange())));
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
            const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSyncGlobalState = lastSyncUserData && lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
            const localGlobalState = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
            if (remoteGlobalState) {
                this.logService.trace(`${this.syncResourceLogLabel}: Merging remote ui state with local ui state...`);
            }
            else {
                this.logService.trace(`${this.syncResourceLogLabel}: Remote ui state does not exist. Synchronizing ui state for the first time.`);
            }
            const storageKeys = await this.getStorageKeys(lastSyncGlobalState);
            const { local, remote } = (0, globalStateMerge_1.merge)(localGlobalState.storage, remoteGlobalState ? remoteGlobalState.storage : null, lastSyncGlobalState ? lastSyncGlobalState.storage : null, storageKeys, this.logService);
            const previewResult = {
                content: null,
                local,
                remote,
                localChange: Object.keys(local.added).length > 0 || Object.keys(local.updated).length > 0 || local.removed.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote.all !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
            const localContent = stringify(localGlobalState, false);
            return [{
                    baseResource: this.baseResource,
                    baseContent: lastSyncGlobalState ? stringify(lastSyncGlobalState, false) : localContent,
                    localResource: this.localResource,
                    localContent,
                    localUserData: localGlobalState,
                    remoteResource: this.remoteResource,
                    remoteContent: remoteGlobalState ? stringify(remoteGlobalState, false) : null,
                    previewResource: this.previewResource,
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.acceptedResource,
                    storageKeys
                }];
        }
        async hasRemoteChanged(lastSyncUserData) {
            const lastSyncGlobalState = lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
            if (lastSyncGlobalState === null) {
                return true;
            }
            const localGlobalState = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
            const storageKeys = await this.getStorageKeys(lastSyncGlobalState);
            const { remote } = (0, globalStateMerge_1.merge)(localGlobalState.storage, lastSyncGlobalState.storage, lastSyncGlobalState.storage, storageKeys, this.logService);
            return remote.all !== null;
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
            return {
                content: resourcePreview.localContent,
                local: { added: {}, removed: [], updated: {} },
                remote: { added: Object.keys(resourcePreview.localUserData.storage), removed: [], updated: [], all: resourcePreview.localUserData.storage },
                localChange: 0 /* Change.None */,
                remoteChange: 2 /* Change.Modified */,
            };
        }
        async acceptRemote(resourcePreview) {
            if (resourcePreview.remoteContent !== null) {
                const remoteGlobalState = JSON.parse(resourcePreview.remoteContent);
                const { local, remote } = (0, globalStateMerge_1.merge)(resourcePreview.localUserData.storage, remoteGlobalState.storage, null, resourcePreview.storageKeys, this.logService);
                return {
                    content: resourcePreview.remoteContent,
                    local,
                    remote,
                    localChange: Object.keys(local.added).length > 0 || Object.keys(local.updated).length > 0 || local.removed.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                    remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
                };
            }
            else {
                return {
                    content: resourcePreview.remoteContent,
                    local: { added: {}, removed: [], updated: {} },
                    remote: { added: [], removed: [], updated: [], all: null },
                    localChange: 0 /* Change.None */,
                    remoteChange: 0 /* Change.None */,
                };
            }
        }
        async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const { localUserData } = resourcePreviews[0][0];
            const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing ui state.`);
            }
            if (localChange !== 0 /* Change.None */) {
                // update local
                this.logService.trace(`${this.syncResourceLogLabel}: Updating local ui state...`);
                await this.backupLocal(JSON.stringify(localUserData));
                await this.localGlobalStateProvider.writeLocalGlobalState(local, this.syncResource.profile);
                this.logService.info(`${this.syncResourceLogLabel}: Updated local ui state`);
            }
            if (remoteChange !== 0 /* Change.None */) {
                // update remote
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote ui state...`);
                const content = JSON.stringify({ storage: remote.all });
                remoteUserData = await this.updateRemoteUserData(content, force ? null : remoteUserData.ref);
                this.logService.info(`${this.syncResourceLogLabel}: Updated remote ui state.${remote.added.length ? ` Added: ${remote.added}.` : ''}${remote.updated.length ? ` Updated: ${remote.updated}.` : ''}${remote.removed.length ? ` Removed: ${remote.removed}.` : ''}`);
            }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                // update last sync
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized ui state...`);
                await this.updateLastSyncUserData(remoteUserData);
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized ui state`);
            }
        }
        async resolveContent(uri) {
            if (this.extUri.isEqual(this.remoteResource, uri)
                || this.extUri.isEqual(this.baseResource, uri)
                || this.extUri.isEqual(this.localResource, uri)
                || this.extUri.isEqual(this.acceptedResource, uri)) {
                const content = await this.resolvePreviewContent(uri);
                return content ? stringify(JSON.parse(content), true) : content;
            }
            return null;
        }
        async hasLocalData() {
            try {
                const { storage } = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
                if (Object.keys(storage).length > 1 || storage[`${argvStoragePrefx}.locale`]?.value !== 'en') {
                    return true;
                }
            }
            catch (error) {
                /* ignore error */
            }
            return false;
        }
        async getStorageKeys(lastSyncGlobalState) {
            const storageData = await this.userDataProfileStorageService.readStorageData(this.syncResource.profile);
            const user = [], machine = [];
            for (const [key, value] of storageData) {
                if (value.target === 0 /* StorageTarget.USER */) {
                    user.push(key);
                }
                else if (value.target === 1 /* StorageTarget.MACHINE */) {
                    machine.push(key);
                }
            }
            const registered = [...user, ...machine];
            const unregistered = lastSyncGlobalState?.storage ? Object.keys(lastSyncGlobalState.storage).filter(key => !key.startsWith(argvStoragePrefx) && !registered.includes(key) && storageData.get(key) !== undefined) : [];
            if (!platform_1.isWeb) {
                // Following keys are synced only in web. Do not sync these keys in other platforms
                const keysSyncedOnlyInWeb = [...userDataSync_1.ALL_SYNC_RESOURCES.map(resource => (0, userDataSync_1.getEnablementKey)(resource)), userDataSync_1.SYNC_SERVICE_URL_TYPE];
                unregistered.push(...keysSyncedOnlyInWeb);
                machine.push(...keysSyncedOnlyInWeb);
            }
            return { user, machine, unregistered };
        }
    };
    exports.GlobalStateSynchroniser = GlobalStateSynchroniser;
    exports.GlobalStateSynchroniser = GlobalStateSynchroniser = __decorate([
        __param(2, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(3, files_1.IFileService),
        __param(4, userDataSync_1.IUserDataSyncStoreService),
        __param(5, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(6, userDataSync_1.IUserDataSyncLogService),
        __param(7, environment_1.IEnvironmentService),
        __param(8, userDataSync_1.IUserDataSyncEnablementService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, storage_1.IStorageService),
        __param(12, uriIdentity_1.IUriIdentityService),
        __param(13, instantiation_1.IInstantiationService)
    ], GlobalStateSynchroniser);
    let LocalGlobalStateProvider = class LocalGlobalStateProvider {
        constructor(fileService, environmentService, userDataProfileStorageService, logService) {
            this.fileService = fileService;
            this.environmentService = environmentService;
            this.userDataProfileStorageService = userDataProfileStorageService;
            this.logService = logService;
        }
        async getLocalGlobalState(profile) {
            const storage = {};
            if (profile.isDefault) {
                const argvContent = await this.getLocalArgvContent();
                const argvValue = (0, json_1.parse)(argvContent);
                for (const argvProperty of argvProperties) {
                    if (argvValue[argvProperty] !== undefined) {
                        storage[`${argvStoragePrefx}${argvProperty}`] = { version: 1, value: argvValue[argvProperty] };
                    }
                }
            }
            const storageData = await this.userDataProfileStorageService.readStorageData(profile);
            for (const [key, value] of storageData) {
                if (value.value && value.target === 0 /* StorageTarget.USER */) {
                    storage[key] = { version: 1, value: value.value };
                }
            }
            return { storage };
        }
        async getLocalArgvContent() {
            try {
                this.logService.debug('GlobalStateSync#getLocalArgvContent', this.environmentService.argvResource);
                const content = await this.fileService.readFile(this.environmentService.argvResource);
                this.logService.debug('GlobalStateSync#getLocalArgvContent - Resolved', this.environmentService.argvResource);
                return content.value.toString();
            }
            catch (error) {
                this.logService.debug((0, errors_1.getErrorMessage)(error));
            }
            return '{}';
        }
        async writeLocalGlobalState({ added, removed, updated }, profile) {
            const syncResourceLogLabel = (0, abstractSynchronizer_1.getSyncResourceLogLabel)("globalState" /* SyncResource.GlobalState */, profile);
            const argv = {};
            const updatedStorage = new Map();
            const storageData = await this.userDataProfileStorageService.readStorageData(profile);
            const handleUpdatedStorage = (keys, storage) => {
                for (const key of keys) {
                    if (key.startsWith(argvStoragePrefx)) {
                        argv[key.substring(argvStoragePrefx.length)] = storage ? storage[key].value : undefined;
                        continue;
                    }
                    if (storage) {
                        const storageValue = storage[key];
                        if (storageValue.value !== storageData.get(key)?.value) {
                            updatedStorage.set(key, storageValue.value);
                        }
                    }
                    else {
                        if (storageData.get(key) !== undefined) {
                            updatedStorage.set(key, undefined);
                        }
                    }
                }
            };
            handleUpdatedStorage(Object.keys(added), added);
            handleUpdatedStorage(Object.keys(updated), updated);
            handleUpdatedStorage(removed);
            if (Object.keys(argv).length) {
                this.logService.trace(`${syncResourceLogLabel}: Updating locale...`);
                const argvContent = await this.getLocalArgvContent();
                let content = argvContent;
                for (const argvProperty of Object.keys(argv)) {
                    content = (0, content_1.edit)(content, [argvProperty], argv[argvProperty], {});
                }
                if (argvContent !== content) {
                    this.logService.trace(`${syncResourceLogLabel}: Updating locale...`);
                    await this.fileService.writeFile(this.environmentService.argvResource, buffer_1.VSBuffer.fromString(content));
                    this.logService.info(`${syncResourceLogLabel}: Updated locale.`);
                }
                this.logService.info(`${syncResourceLogLabel}: Updated locale`);
            }
            if (updatedStorage.size) {
                this.logService.trace(`${syncResourceLogLabel}: Updating global state...`);
                await this.userDataProfileStorageService.updateStorageData(profile, updatedStorage, 0 /* StorageTarget.USER */);
                this.logService.info(`${syncResourceLogLabel}: Updated global state`, [...updatedStorage.keys()]);
            }
        }
    };
    exports.LocalGlobalStateProvider = LocalGlobalStateProvider;
    exports.LocalGlobalStateProvider = LocalGlobalStateProvider = __decorate([
        __param(0, files_1.IFileService),
        __param(1, environment_1.IEnvironmentService),
        __param(2, userDataProfileStorageService_1.IUserDataProfileStorageService),
        __param(3, userDataSync_1.IUserDataSyncLogService)
    ], LocalGlobalStateProvider);
    let GlobalStateInitializer = class GlobalStateInitializer extends abstractSynchronizer_1.AbstractInitializer {
        constructor(storageService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService) {
            super("globalState" /* SyncResource.GlobalState */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
        }
        async doInitialize(remoteUserData) {
            const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
            if (!remoteGlobalState) {
                this.logService.info('Skipping initializing global state because remote global state does not exist.');
                return;
            }
            const argv = {};
            const storage = {};
            for (const key of Object.keys(remoteGlobalState.storage)) {
                if (key.startsWith(argvStoragePrefx)) {
                    argv[key.substring(argvStoragePrefx.length)] = remoteGlobalState.storage[key].value;
                }
                else {
                    if (this.storageService.get(key, 0 /* StorageScope.PROFILE */) === undefined) {
                        storage[key] = remoteGlobalState.storage[key].value;
                    }
                }
            }
            if (Object.keys(argv).length) {
                let content = '{}';
                try {
                    const fileContent = await this.fileService.readFile(this.environmentService.argvResource);
                    content = fileContent.value.toString();
                }
                catch (error) { }
                for (const argvProperty of Object.keys(argv)) {
                    content = (0, content_1.edit)(content, [argvProperty], argv[argvProperty], {});
                }
                await this.fileService.writeFile(this.environmentService.argvResource, buffer_1.VSBuffer.fromString(content));
            }
            if (Object.keys(storage).length) {
                const storageEntries = [];
                for (const key of Object.keys(storage)) {
                    storageEntries.push({ key, value: storage[key], scope: 0 /* StorageScope.PROFILE */, target: 0 /* StorageTarget.USER */ });
                }
                this.storageService.storeAll(storageEntries, true);
            }
        }
    };
    exports.GlobalStateInitializer = GlobalStateInitializer;
    exports.GlobalStateInitializer = GlobalStateInitializer = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, files_1.IFileService),
        __param(2, userDataProfile_1.IUserDataProfilesService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, userDataSync_1.IUserDataSyncLogService),
        __param(5, uriIdentity_1.IUriIdentityService)
    ], GlobalStateInitializer);
    let UserDataSyncStoreTypeSynchronizer = class UserDataSyncStoreTypeSynchronizer {
        constructor(userDataSyncStoreClient, storageService, environmentService, fileService, logService) {
            this.userDataSyncStoreClient = userDataSyncStoreClient;
            this.storageService = storageService;
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.logService = logService;
        }
        getSyncStoreType(userData) {
            const remoteGlobalState = this.parseGlobalState(userData);
            return remoteGlobalState?.storage[userDataSync_1.SYNC_SERVICE_URL_TYPE]?.value;
        }
        async sync(userDataSyncStoreType) {
            const syncHeaders = (0, userDataSync_1.createSyncHeaders)((0, uuid_1.generateUuid)());
            try {
                return await this.doSync(userDataSyncStoreType, syncHeaders);
            }
            catch (e) {
                if (e instanceof userDataSync_1.UserDataSyncError) {
                    switch (e.code) {
                        case "PreconditionFailed" /* UserDataSyncErrorCode.PreconditionFailed */:
                            this.logService.info(`Failed to synchronize UserDataSyncStoreType as there is a new remote version available. Synchronizing again...`);
                            return this.doSync(userDataSyncStoreType, syncHeaders);
                    }
                }
                throw e;
            }
        }
        async doSync(userDataSyncStoreType, syncHeaders) {
            // Read the global state from remote
            const globalStateUserData = await this.userDataSyncStoreClient.readResource("globalState" /* SyncResource.GlobalState */, null, undefined, syncHeaders);
            const remoteGlobalState = this.parseGlobalState(globalStateUserData) || { storage: {} };
            // Update the sync store type
            remoteGlobalState.storage[userDataSync_1.SYNC_SERVICE_URL_TYPE] = { value: userDataSyncStoreType, version: GLOBAL_STATE_DATA_VERSION };
            // Write the global state to remote
            const machineId = await (0, serviceMachineId_1.getServiceMachineId)(this.environmentService, this.fileService, this.storageService);
            const syncDataToUpdate = { version: GLOBAL_STATE_DATA_VERSION, machineId, content: stringify(remoteGlobalState, false) };
            await this.userDataSyncStoreClient.writeResource("globalState" /* SyncResource.GlobalState */, JSON.stringify(syncDataToUpdate), globalStateUserData.ref, undefined, syncHeaders);
        }
        parseGlobalState({ content }) {
            if (!content) {
                return null;
            }
            const syncData = JSON.parse(content);
            if ((0, abstractSynchronizer_1.isSyncData)(syncData)) {
                return syncData ? JSON.parse(syncData.content) : null;
            }
            throw new Error('Invalid remote data');
        }
    };
    exports.UserDataSyncStoreTypeSynchronizer = UserDataSyncStoreTypeSynchronizer;
    exports.UserDataSyncStoreTypeSynchronizer = UserDataSyncStoreTypeSynchronizer = __decorate([
        __param(1, storage_1.IStorageService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, log_1.ILogService)
    ], UserDataSyncStoreTypeSynchronizer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU3RhdGVTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL2dsb2JhbFN0YXRlU3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE4QmhHLE1BQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUM7SUFDN0MsTUFBTSxjQUFjLEdBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQWU1QyxTQUFnQixTQUFTLENBQUMsV0FBeUIsRUFBRSxNQUFlO1FBQ25FLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkYsTUFBTSxPQUFPLEdBQXFDLEVBQUUsQ0FBQztRQUNyRCxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNwRSxXQUFXLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUM5QixPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBQSxpQ0FBaUIsRUFBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQU5ELDhCQU1DO0lBRUQsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLENBQUM7SUFFcEM7Ozs7Ozs7O09BUUc7SUFDSSxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLDJDQUFvQjtRQVdoRSxZQUNDLE9BQXlCLEVBQ3pCLFVB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
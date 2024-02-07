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
define(["require", "exports", "vs/nls", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/services/activity/common/activity", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/update/common/update", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/contrib/update/browser/releaseNotesEditor", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/workbench/services/host/browser/host", "vs/platform/product/common/productService", "vs/platform/userDataSync/common/userDataSync", "vs/platform/contextkey/common/contextkeys", "vs/base/common/async", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/event", "vs/base/common/actions"], function (require, exports, nls, severity_1, lifecycle_1, uri_1, activity_1, instantiation_1, opener_1, storage_1, update_1, notification_1, dialogs_1, environmentService_1, releaseNotesEditor_1, platform_1, configuration_1, contextkey_1, actions_1, commands_1, host_1, productService_1, userDataSync_1, contextkeys_1, async_1, userDataSync_2, event_1, actions_2) {
    "use strict";
    var ProductContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SwitchProductQualityContribution = exports.UpdateContribution = exports.ProductContribution = exports.showReleaseNotesInEditor = exports.DOWNLOAD_URL = exports.RELEASE_NOTES_URL = exports.MAJOR_MINOR_UPDATE_AVAILABLE = exports.CONTEXT_UPDATE_STATE = void 0;
    exports.CONTEXT_UPDATE_STATE = new contextkey_1.RawContextKey('updateState', "uninitialized" /* StateType.Uninitialized */);
    exports.MAJOR_MINOR_UPDATE_AVAILABLE = new contextkey_1.RawContextKey('majorMinorUpdateAvailable', false);
    exports.RELEASE_NOTES_URL = new contextkey_1.RawContextKey('releaseNotesUrl', '');
    exports.DOWNLOAD_URL = new contextkey_1.RawContextKey('downloadUrl', '');
    let releaseNotesManager = undefined;
    function showReleaseNotesInEditor(instantiationService, version) {
        if (!releaseNotesManager) {
            releaseNotesManager = instantiationService.createInstance(releaseNotesEditor_1.ReleaseNotesManager);
        }
        return releaseNotesManager.show(version);
    }
    exports.showReleaseNotesInEditor = showReleaseNotesInEditor;
    async function openLatestReleaseNotesInBrowser(accessor) {
        const openerService = accessor.get(opener_1.IOpenerService);
        const productService = accessor.get(productService_1.IProductService);
        if (productService.releaseNotesUrl) {
            const uri = uri_1.URI.parse(productService.releaseNotesUrl);
            await openerService.open(uri);
        }
        else {
            throw new Error(nls.localize('update.noReleaseNotesOnline', "This version of {0} does not have release notes online", productService.nameLong));
        }
    }
    async function showReleaseNotes(accessor, version) {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        try {
            await showReleaseNotesInEditor(instantiationService, version);
        }
        catch (err) {
            try {
                await instantiationService.invokeFunction(openLatestReleaseNotesInBrowser);
            }
            catch (err2) {
                throw new Error(`${err.message} and ${err2.message}`);
            }
        }
    }
    function parseVersion(version) {
        const match = /([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(version);
        if (!match) {
            return undefined;
        }
        return {
            major: parseInt(match[1]),
            minor: parseInt(match[2]),
            patch: parseInt(match[3])
        };
    }
    function isMajorMinorUpdate(before, after) {
        return before.major < after.major || before.minor < after.minor;
    }
    let ProductContribution = class ProductContribution {
        static { ProductContribution_1 = this; }
        static { this.KEY = 'releaseNotes/lastVersion'; }
        constructor(storageService, instantiationService, notificationService, environmentService, openerService, configurationService, hostService, productService, contextKeyService) {
            if (productService.releaseNotesUrl) {
                const releaseNotesUrlKey = exports.RELEASE_NOTES_URL.bindTo(contextKeyService);
                releaseNotesUrlKey.set(productService.releaseNotesUrl);
            }
            if (productService.downloadUrl) {
                const downloadUrlKey = exports.DOWNLOAD_URL.bindTo(contextKeyService);
                downloadUrlKey.set(productService.downloadUrl);
            }
            if (platform_1.isWeb) {
                return;
            }
            hostService.hadLastFocus().then(async (hadLastFocus) => {
                if (!hadLastFocus) {
                    return;
                }
                const lastVersion = parseVersion(storageService.get(ProductContribution_1.KEY, -1 /* StorageScope.APPLICATION */, ''));
                const currentVersion = parseVersion(productService.version);
                const shouldShowReleaseNotes = configurationService.getValue('update.showReleaseNotes');
                const releaseNotesUrl = productService.releaseNotesUrl;
                // was there a major/minor update? if so, open release notes
                if (shouldShowReleaseNotes && !environmentService.skipReleaseNotes && releaseNotesUrl && lastVersion && currentVersion && isMajorMinorUpdate(lastVersion, currentVersion)) {
                    showReleaseNotesInEditor(instantiationService, productService.version)
                        .then(undefined, () => {
                        notificationService.prompt(severity_1.default.Info, nls.localize('read the release notes', "Welcome to {0} v{1}! Would you like to read the Release Notes?", productService.nameLong, productService.version), [{
                                label: nls.localize('releaseNotes', "Release Notes"),
                                run: () => {
                                    const uri = uri_1.URI.parse(releaseNotesUrl);
                                    openerService.open(uri);
                                }
                            }]);
                    });
                }
                storageService.store(ProductContribution_1.KEY, productService.version, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            });
        }
    };
    exports.ProductContribution = ProductContribution;
    exports.ProductContribution = ProductContribution = ProductContribution_1 = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, notification_1.INotificationService),
        __param(3, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(4, opener_1.IOpenerService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, host_1.IHostService),
        __param(7, productService_1.IProductService),
        __param(8, contextkey_1.IContextKeyService)
    ], ProductContribution);
    let UpdateContribution = class UpdateContribution extends lifecycle_1.Disposable {
        constructor(storageService, instantiationService, notificationService, dialogService, updateService, activityService, contextKeyService, productService, openerService, hostService) {
            super();
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.updateService = updateService;
            this.activityService = activityService;
            this.contextKeyService = contextKeyService;
            this.productService = productService;
            this.openerService = openerService;
            this.hostService = hostService;
            this.badgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.state = updateService.state;
            this.updateStateContextKey = exports.CONTEXT_UPDATE_STATE.bindTo(this.contextKeyService);
            this.majorMinorUpdateAvailableContextKey = exports.MAJOR_MINOR_UPDATE_AVAILABLE.bindTo(this.contextKeyService);
            this._register(updateService.onStateChange(this.onUpdateStateChange, this));
            this.onUpdateStateChange(this.updateService.state);
            /*
            The `update/lastKnownVersion` and `update/updateNotificationTime` storage keys are used in
            combination to figure out when to show a message to the user that he should update.
    
            This message should appear if the user has received an update notification but hasn't
            updated since 5 days.
            */
            const currentVersion = this.productService.commit;
            const lastKnownVersion = this.storageService.get('update/lastKnownVersion', -1 /* StorageScope.APPLICATION */);
            // if current version != stored version, clear both fields
            if (currentVersion !== lastKnownVersion) {
                this.storageService.remove('update/lastKnownVersion', -1 /* StorageScope.APPLICATION */);
                this.storageService.remove('update/updateNotificationTime', -1 /* StorageScope.APPLICATION */);
            }
            this.registerGlobalActivityActions();
        }
        async onUpdateStateChange(state) {
            this.updateStateContextKey.set(state.type);
            switch (state.type) {
                case "disabled" /* StateType.Disabled */:
                    if (state.reason === 5 /* DisablementReason.RunningAsAdmin */) {
                        this.notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: nls.localize('update service disabled', "Updates are disabled because you are running the user-scope installation of {0} as Administrator.", this.productService.nameLong),
                            actions: {
                                primary: [
                                    new actions_2.Action('', nls.localize('learn more', "Learn More"), undefined, undefined, () => {
                                        this.openerService.open('https://aka.ms/vscode-windows-setup');
                                    })
                                ]
                            },
                            neverShowAgain: { id: 'no-updates-running-as-admin', }
                        });
                    }
                    break;
                case "idle" /* StateType.Idle */:
                    if (state.error) {
                        this.onError(state.error);
                    }
                    else if (this.state.type === "checking for updates" /* StateType.CheckingForUpdates */ && this.state.explicit && await this.hostService.hadLastFocus()) {
                        this.onUpdateNotAvailable();
                    }
                    break;
                case "available for download" /* StateType.AvailableForDownload */:
                    this.onUpdateAvailable(state.update);
                    break;
                case "downloaded" /* StateType.Downloaded */:
                    this.onUpdateDownloaded(state.update);
                    break;
                case "ready" /* StateType.Ready */: {
                    const currentVersion = parseVersion(this.productService.version);
                    const nextVersion = parseVersion(state.update.productVersion);
                    this.majorMinorUpdateAvailableContextKey.set(Boolean(currentVersion && nextVersion && isMajorMinorUpdate(currentVersion, nextVersion)));
                    this.onUpdateReady(state.update);
                    break;
                }
            }
            let badge = undefined;
            let priority = undefined;
            if (state.type === "available for download" /* StateType.AvailableForDownload */ || state.type === "downloaded" /* StateType.Downloaded */ || state.type === "ready" /* StateType.Ready */) {
                badge = new activity_1.NumberBadge(1, () => nls.localize('updateIsReady', "New {0} update available.", this.productService.nameShort));
            }
            else if (state.type === "checking for updates" /* StateType.CheckingForUpdates */) {
                badge = new activity_1.ProgressBadge(() => nls.localize('checkingForUpdates', "Checking for Updates..."));
                priority = 1;
            }
            else if (state.type === "downloading" /* StateType.Downloading */) {
                badge = new activity_1.ProgressBadge(() => nls.localize('downloading', "Downloading..."));
                priority = 1;
            }
            else if (state.type === "updating" /* StateType.Updating */) {
                badge = new activity_1.ProgressBadge(() => nls.localize('updating', "Updating..."));
                priority = 1;
            }
            this.badgeDisposable.clear();
            if (badge) {
                this.badgeDisposable.value = this.activityService.showGlobalActivity({ badge, priority });
            }
            this.state = state;
        }
        onError(error) {
            if (/The request timed out|The network connection was lost/i.test(error)) {
                return;
            }
            error = error.replace(/See https:\/\/github\.com\/Squirrel\/Squirrel\.Mac\/issues\/182 for more information/, 'This might mean the application was put on quarantine by macOS. See [this link](https://github.com/microsoft/vscode/issues/7426#issuecomment-425093469) for more information');
            this.notificationService.notify({
                severity: notification_1.Severity.Error,
                message: error,
                source: nls.localize('update service', "Update Service"),
            });
        }
        onUpdateNotAvailable() {
            this.dialogService.info(nls.localize('noUpdatesAvailable', "There are currently no updates available."));
        }
        // linux
        onUpdateAvailable(update) {
            if (!this.shouldShowNotification()) {
                return;
            }
            this.notificationService.prompt(severity_1.default.Info, nls.localize('thereIsUpdateAvailable', "There is an available update."), [{
                    label: nls.localize('download update', "Download Update"),
                    run: () => this.updateService.downloadUpdate()
                }, {
                    label: nls.localize('later', "Later"),
                    run: () => { }
                }, {
                    label: nls.localize('releaseNotes', "Release Notes"),
                    run: () => {
                        this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, update.productVersion));
                    }
                }]);
        }
        // windows fast updates (target === system)
        onUpdateDownloaded(update) {
            if (!this.shouldShowNotification()) {
                return;
            }
            this.notificationService.prompt(severity_1.default.Info, nls.localize('updateAvailable', "There's an update available: {0} {1}", this.productService.nameLong, update.productVersion), [{
                    label: nls.localize('installUpdate', "Install Update"),
                    run: () => this.updateService.applyUpdate()
                }, {
                    label: nls.localize('later', "Later"),
                    run: () => { }
                }, {
                    label: nls.localize('releaseNotes', "Release Notes"),
                    run: () => {
                        this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, update.productVersion));
                    }
                }]);
        }
        // windows and mac
        onUpdateReady(update) {
            if (!(platform_1.isWindows && this.productService.target !== 'user') && !this.shouldShowNotification()) {
                return;
            }
            const actions = [{
                    label: nls.localize('updateNow', "Update Now"),
                    run: () => this.updateService.quitAndInstall()
                }, {
                    label: nls.localize('later', "Later"),
                    run: () => { }
                }];
            // TODO@joao check why snap updates send `update` as falsy
            if (update.productVersion) {
                actions.push({
                    label: nls.localize('releaseNotes', "Release Notes"),
                    run: () => {
                        this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, update.productVersion));
                    }
                });
            }
            // windows user fast updates and mac
            this.notificationService.prompt(severity_1.default.Info, nls.localize('updateAvailableAfterRestart', "Restart {0} to apply the latest update.", this.productService.nameLong), actions, { sticky: true });
        }
        shouldShowNotification() {
            const currentVersion = this.productService.commit;
            const currentMillis = new Date().getTime();
            const lastKnownVersion = this.storageService.get('update/lastKnownVersion', -1 /* StorageScope.APPLICATION */);
            // if version != stored version, save version and date
            if (currentVersion !== lastKnownVersion) {
                this.storageService.store('update/lastKnownVersion', currentVersion, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this.storageService.store('update/updateNotificationTime', currentMillis, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
            const updateNotificationMillis = this.storageService.getNumber('update/updateNotificationTime', -1 /* StorageScope.APPLICATION */, currentMillis);
            const diffDays = (currentMillis - updateNotificationMillis) / (1000 * 60 * 60 * 24);
            return diffDays > 5;
        }
        registerGlobalActivityActions() {
            commands_1.CommandsRegistry.registerCommand('update.check', () => this.updateService.checkForUpdates(true));
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.check',
                    title: nls.localize('checkForUpdates', "Check for Updates...")
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("idle" /* StateType.Idle */)
            });
            commands_1.CommandsRegistry.registerCommand('update.checking', () => { });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.checking',
                    title: nls.localize('checkingForUpdates', "Checking for Updates..."),
                    precondition: contextkey_1.ContextKeyExpr.false()
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("checking for updates" /* StateType.CheckingForUpdates */)
            });
            commands_1.CommandsRegistry.registerCommand('update.downloadNow', () => this.updateService.downloadUpdate());
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.downloadNow',
                    title: nls.localize('download update_1', "Download Update (1)")
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("available for download" /* StateType.AvailableForDownload */)
            });
            commands_1.CommandsRegistry.registerCommand('update.downloading', () => { });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.downloading',
                    title: nls.localize('DownloadingUpdate', "Downloading Update..."),
                    precondition: contextkey_1.ContextKeyExpr.false()
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("downloading" /* StateType.Downloading */)
            });
            commands_1.CommandsRegistry.registerCommand('update.install', () => this.updateService.applyUpdate());
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.install',
                    title: nls.localize('installUpdate...', "Install Update... (1)")
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("downloaded" /* StateType.Downloaded */)
            });
            commands_1.CommandsRegistry.registerCommand('update.updating', () => { });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.updating',
                    title: nls.localize('installingUpdate', "Installing Update..."),
                    precondition: contextkey_1.ContextKeyExpr.false()
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("updating" /* StateType.Updating */)
            });
            if (this.productService.quality === 'stable') {
                commands_1.CommandsRegistry.registerCommand('update.showUpdateReleaseNotes', () => {
                    if (this.updateService.state.type !== "ready" /* StateType.Ready */) {
                        return;
                    }
                    const version = this.updateService.state.update.version;
                    this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor, version));
                });
                actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                    group: '7_update',
                    order: 1,
                    command: {
                        id: 'update.showUpdateReleaseNotes',
                        title: nls.localize('showUpdateReleaseNotes', "Show Update Release Notes")
                    },
                    when: contextkey_1.ContextKeyExpr.and(exports.CONTEXT_UPDATE_STATE.isEqualTo("ready" /* StateType.Ready */), exports.MAJOR_MINOR_UPDATE_AVAILABLE)
                });
            }
            commands_1.CommandsRegistry.registerCommand('update.restart', () => this.updateService.quitAndInstall());
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '7_update',
                order: 2,
                command: {
                    id: 'update.restart',
                    title: nls.localize('restartToUpdate', "Restart to Update (1)")
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("ready" /* StateType.Ready */)
            });
            commands_1.CommandsRegistry.registerCommand('_update.state', () => {
                return this.state;
            });
        }
    };
    exports.UpdateContribution = UpdateContribution;
    exports.UpdateContribution = UpdateContribution = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, notification_1.INotificationService),
        __param(3, dialogs_1.IDialogService),
        __param(4, update_1.IUpdateService),
        __param(5, activity_1.IActivityService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, productService_1.IProductService),
        __param(8, opener_1.IOpenerService),
        __param(9, host_1.IHostService)
    ], UpdateContribution);
    let SwitchProductQualityContribution = class SwitchProductQualityContribution extends lifecycle_1.Disposable {
        constructor(productService, environmentService) {
            super();
            this.productService = productService;
            this.environmentService = environmentService;
            this.registerGlobalActivityActions();
        }
        registerGlobalActivityActions() {
            const quality = this.productService.quality;
            const productQualityChangeHandler = this.environmentService.options?.productQualityChangeHandler;
            if (productQualityChangeHandler && (quality === 'stable' || quality === 'insider')) {
                const newQuality = quality === 'stable' ? 'insider' : 'stable';
                const commandId = `update.switchQuality.${newQuality}`;
                const isSwitchingToInsiders = newQuality === 'insider';
                (0, actions_1.registerAction2)(class SwitchQuality extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: commandId,
                            title: isSwitchingToInsiders ? nls.localize('switchToInsiders', "Switch to Insiders Version...") : nls.localize('switchToStable', "Switch to Stable Version..."),
                            precondition: contextkeys_1.IsWebContext,
                            menu: {
                                id: actions_1.MenuId.GlobalActivity,
                                when: contextkeys_1.IsWebContext,
                                group: '7_update',
                            }
                        });
                    }
                    async run(accessor) {
                        const dialogService = accessor.get(dialogs_1.IDialogService);
                        const userDataSyncEnablementService = accessor.get(userDataSync_1.IUserDataSyncEnablementService);
                        const userDataSyncStoreManagementService = accessor.get(userDataSync_1.IUserDataSyncStoreManagementService);
                        const storageService = accessor.get(storage_1.IStorageService);
                        const userDataSyncWorkbenchService = accessor.get(userDataSync_2.IUserDataSyncWorkbenchService);
                        const userDataSyncService = accessor.get(userDataSync_1.IUserDataSyncService);
                        const notificationService = accessor.get(notification_1.INotificationService);
                        try {
                            const selectSettingsSyncServiceDialogShownKey = 'switchQuality.selectSettingsSyncServiceDialogShown';
                            const userDataSyncStore = userDataSyncStoreManagementService.userDataSyncStore;
                            let userDataSyncStoreType;
                            if (userDataSyncStore && isSwitchingToInsiders && userDataSyncEnablementService.isEnabled()
                                && !storageService.getBoolean(selectSettingsSyncServiceDialogShownKey, -1 /* StorageScope.APPLICATION */, false)) {
                                userDataSyncStoreType = await this.selectSettingsSyncService(dialogService);
                                if (!userDataSyncStoreType) {
                                    return;
                                }
                                storageService.store(selectSettingsSyncServiceDialogShownKey, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                                if (userDataSyncStoreType === 'stable') {
                                    // Update the stable service type in the current window, so that it uses stable service after switched to insiders version (after reload).
                                    await userDataSyncStoreManagementService.switch(userDataSyncStoreType);
                                }
                            }
                            const res = await dialogService.confirm({
                                type: 'info',
                                message: nls.localize('relaunchMessage', "Changing the version requires a reload to take effect"),
                                detail: newQuality === 'insider' ?
                                    nls.localize('relaunchDetailInsiders', "Press the reload button to switch to the Insiders version of VS Code.") :
                                    nls.localize('relaunchDetailStable', "Press the reload button to switch to the Stable version of VS Code."),
                                primaryButton: nls.localize({ key: 'reload', comment: ['&& denotes a mnemonic'] }, "&&Reload")
                            });
                            if (res.confirmed) {
                                const promises = [];
                                // If sync is happening wait until it is finished before reload
                                if (userDataSyncService.status === "syncing" /* SyncStatus.Syncing */) {
                                    promises.push(event_1.Event.toPromise(event_1.Event.filter(userDataSyncService.onDidChangeStatus, status => status !== "syncing" /* SyncStatus.Syncing */)));
                                }
                                // If user chose the sync service then synchronise the store type option in insiders service, so that other clients using insiders service are also updated.
                                if (isSwitchingToInsiders && userDataSyncStoreType) {
                                    promises.push(userDataSyncWorkbenchService.synchroniseUserDataSyncStoreType());
                                }
                                await async_1.Promises.settled(promises);
                                productQualityChangeHandler(newQuality);
                            }
                            else {
                                // Reset
                                if (userDataSyncStoreType) {
                                    storageService.remove(selectSettingsSyncServiceDialogShownKey, -1 /* StorageScope.APPLICATION */);
                                }
                            }
                        }
                        catch (error) {
                            notificationService.error(error);
                        }
                    }
                    async selectSettingsSyncService(dialogService) {
                        const { result } = await dialogService.prompt({
                            type: notification_1.Severity.Info,
                            message: nls.localize('selectSyncService.message', "Choose the settings sync service to use after changing the version"),
                            detail: nls.localize('selectSyncService.detail', "The Insiders version of VS Code will synchronize your settings, keybindings, extensions, snippets and UI State using separate insiders settings sync service by default."),
                            buttons: [
                                {
                                    label: nls.localize({ key: 'use insiders', comment: ['&& denotes a mnemonic'] }, "&&Insiders"),
                                    run: () => 'insiders'
                                },
                                {
                                    label: nls.localize({ key: 'use stable', comment: ['&& denotes a mnemonic'] }, "&&Stable (current)"),
                                    run: () => 'stable'
                                }
                            ],
                            cancelButton: true
                        });
                        return result;
                    }
                });
            }
        }
    };
    exports.SwitchProductQualityContribution = SwitchProductQualityContribution;
    exports.SwitchProductQualityContribution = SwitchProductQualityContribution = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, environmentService_1.IBrowserWorkbenchEnvironmentService)
    ], SwitchProductQualityContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi91cGRhdGUvYnJvd3Nlci91cGRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThCbkYsUUFBQSxvQkFBb0IsR0FBRyxJQUFJLDBCQUFhLENBQVMsYUFBYSxnREFBMEIsQ0FBQztJQUN6RixRQUFBLDRCQUE0QixHQUFHLElBQUksMEJBQWEsQ0FBVSwyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5RixRQUFBLGlCQUFpQixHQUFHLElBQUksMEJBQWEsQ0FBUyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNyRSxRQUFBLFlBQVksR0FBRyxJQUFJLDBCQUFhLENBQVMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXpFLElBQUksbUJBQW1CLEdBQW9DLFNBQVMsQ0FBQztJQUVyRSxTQUFnQix3QkFBd0IsQ0FBQyxvQkFBMkMsRUFBRSxPQUFlO1FBQ3BHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzFCLG1CQUFtQixHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx3Q0FBbUIsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRCxPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBTkQsNERBTUM7SUFFRCxLQUFLLFVBQVUsK0JBQStCLENBQUMsUUFBMEI7UUFDeEUsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxDQUFDLENBQUM7UUFDbkQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZSxDQUFDLENBQUM7UUFFckQsSUFBSSxjQUFjLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDcEMsTUFBTSxHQUFHLEdBQUcs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
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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations"], function (require, exports, arrays_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, nls_1, configuration_1, extensionManagementUtil_1, extensionRecommendations_1, instantiation_1, notification_1, storage_1, telemetry_1, userDataSync_1, extensionsActions_1, extensions_1, environmentService_1, extensionManagement_1, extensionRecommendations_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionRecommendationNotificationService = void 0;
    const ignoreImportantExtensionRecommendationStorageKey = 'extensionsAssistant/importantRecommendationsIgnore';
    const donotShowWorkspaceRecommendationsStorageKey = 'extensionsAssistant/workspaceRecommendationsIgnore';
    class RecommendationsNotification extends lifecycle_1.Disposable {
        constructor(severity, message, choices, notificationService) {
            super();
            this.severity = severity;
            this.message = message;
            this.choices = choices;
            this.notificationService = notificationService;
            this._onDidClose = this._register(new event_1.Emitter());
            this.onDidClose = this._onDidClose.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.cancelled = false;
            this.onDidCloseDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.onDidChangeVisibilityDisposable = this._register(new lifecycle_1.MutableDisposable());
        }
        show() {
            if (!this.notificationHandle) {
                this.updateNotificationHandle(this.notificationService.prompt(this.severity, this.message, this.choices, { sticky: true, onCancel: () => this.cancelled = true }));
            }
        }
        hide() {
            if (this.notificationHandle) {
                this.onDidCloseDisposable.clear();
                this.notificationHandle.close();
                this.cancelled = false;
                this.updateNotificationHandle(this.notificationService.prompt(this.severity, this.message, this.choices, { priority: notification_1.NotificationPriority.SILENT, onCancel: () => this.cancelled = true }));
            }
        }
        isCancelled() {
            return this.cancelled;
        }
        updateNotificationHandle(notificationHandle) {
            this.onDidCloseDisposable.clear();
            this.onDidChangeVisibilityDisposable.clear();
            this.notificationHandle = notificationHandle;
            this.onDidCloseDisposable.value = this.notificationHandle.onDidClose(() => {
                this.onDidCloseDisposable.dispose();
                this.onDidChangeVisibilityDisposable.dispose();
                this._onDidClose.fire();
                this._onDidClose.dispose();
                this._onDidChangeVisibility.dispose();
            });
            this.onDidChangeVisibilityDisposable.value = this.notificationHandle.onDidChangeVisibility((e) => this._onDidChangeVisibility.fire(e));
        }
    }
    let ExtensionRecommendationNotificationService = class ExtensionRecommendationNotificationService extends lifecycle_1.Disposable {
        // Ignored Important Recommendations
        get ignoredRecommendations() {
            return (0, arrays_1.distinct)([...JSON.parse(this.storageService.get(ignoreImportantExtensionRecommendationStorageKey, 0 /* StorageScope.PROFILE */, '[]'))].map(i => i.toLowerCase()));
        }
        constructor(configurationService, storageService, notificationService, telemetryService, instantiationService, extensionsWorkbenchService, extensionManagementService, extensionEnablementService, extensionIgnoredRecommendationsService, userDataSyncEnablementService, workbenchEnvironmentService) {
            super();
            this.configurationService = configurationService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.instantiationService = instantiationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.workbenchEnvironmentService = workbenchEnvironmentService;
            this.recommendedExtensions = [];
            this.recommendationSources = [];
            this.pendingNotificaitons = [];
        }
        hasToIgnoreRecommendationNotifications() {
            const config = this.configurationService.getValue('extensions');
            return config.ignoreRecommendations || !!config.showRecommendationsOnlyOnDemand;
        }
        async promptImportantExtensionsInstallNotification(extensionRecommendations) {
            const ignoredRecommendations = [...this.extensionIgnoredRecommendationsService.ignoredRecommendations, ...this.ignoredRecommendations];
            const extensions = extensionRecommendations.extensions.filter(id => !ignoredRecommendations.includes(id));
            if (!extensions.length) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            return this.promptRecommendationsNotification({ ...extensionRecommendations, extensions }, {
                onDidInstallRecommendedExtensions: (extensions) => extensions.forEach(extension => this.telemetryService.publicLog2('extensionRecommendations:popup', { userReaction: 'install', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.RecommendationSourceToString)(extensionRecommendations.source) })),
                onDidShowRecommendedExtensions: (extensions) => extensions.forEach(extension => this.telemetryService.publicLog2('extensionRecommendations:popup', { userReaction: 'show', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.RecommendationSourceToString)(extensionRecommendations.source) })),
                onDidCancelRecommendedExtensions: (extensions) => extensions.forEach(extension => this.telemetryService.publicLog2('extensionRecommendations:popup', { userReaction: 'cancelled', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.RecommendationSourceToString)(extensionRecommendations.source) })),
                onDidNeverShowRecommendedExtensionsAgain: (extensions) => {
                    for (const extension of extensions) {
                        this.addToImportantRecommendationsIgnore(extension.identifier.id);
                        this.telemetryService.publicLog2('extensionRecommendations:popup', { userReaction: 'neverShowAgain', extensionId: extension.identifier.id, source: (0, extensionRecommendations_1.RecommendationSourceToString)(extensionRecommendations.source) });
                    }
                    this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('ignoreExtensionRecommendations', "Do you want to ignore all extension recommendations?"), [{
                            label: (0, nls_1.localize)('ignoreAll', "Yes, Ignore All"),
                            run: () => this.setIgnoreRecommendationsConfig(true)
                        }, {
                            label: (0, nls_1.localize)('no', "No"),
                            run: () => this.setIgnoreRecommendationsConfig(false)
                        }]);
                },
            });
        }
        async promptWorkspaceRecommendations(recommendations) {
            if (this.storageService.getBoolean(donotShowWorkspaceRecommendationsStorageKey, 1 /* StorageScope.WORKSPACE */, false)) {
                return;
            }
            let installed = await this.extensionManagementService.getInstalled();
            installed = installed.filter(l => this.extensionEnablementService.getEnablementState(l) !== 1 /* EnablementState.DisabledByExtensionKind */); // Filter extensions disabled by kind
            recommendations = recommendations.filter(extensionId => installed.every(local => !(0, extensionManagementUtil_1.areSameExtensions)({ id: extensionId }, local.identifier)));
            if (!recommendations.length) {
                return;
            }
            await this.promptRecommendationsNotification({ extensions: recommendations, source: 2 /* RecommendationSource.WORKSPACE */, name: (0, nls_1.localize)({ key: 'this repository', comment: ['this repository means the current repository that is opened'] }, "this repository") }, {
                onDidInstallRecommendedExtensions: () => this.telemetryService.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'install' }),
                onDidShowRecommendedExtensions: () => this.telemetryService.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'show' }),
                onDidCancelRecommendedExtensions: () => this.telemetryService.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'cancelled' }),
                onDidNeverShowRecommendedExtensionsAgain: () => {
                    this.telemetryService.publicLog2('extensionWorkspaceRecommendations:popup', { userReaction: 'neverShowAgain' });
                    this.storageService.store(donotShowWorkspaceRecommendationsStorageKey, true, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                },
            });
        }
        async promptRecommendationsNotification({ extensions: extensionIds, source, name, searchValue }, recommendationsNotificationActions) {
            if (this.hasToIgnoreRecommendationNotifications()) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            // Do not show exe based recommendations in remote window
            if (source === 3 /* RecommendationSource.EXE */ && this.workbenchEnvironmentService.remoteAuthority) {
                return "incompatibleWindow" /* RecommendationsNotificationResult.IncompatibleWindow */;
            }
            // Ignore exe recommendation if the window
            // 		=> has shown an exe based recommendation already
            // 		=> or has shown any two recommendations already
            if (source === 3 /* RecommendationSource.EXE */ && (this.recommendationSources.includes(3 /* RecommendationSource.EXE */) || this.recommendationSources.length >= 2)) {
                return "toomany" /* RecommendationsNotificationResult.TooMany */;
            }
            this.recommendationSources.push(source);
            // Ignore exe recommendation if recommendations are already shown
            if (source === 3 /* RecommendationSource.EXE */ && extensionIds.every(id => this.recommendedExtensions.includes(id))) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            const extensions = await this.getInstallableExtensions(extensionIds);
            if (!extensions.length) {
                return "ignored" /* RecommendationsNotificationResult.Ignored */;
            }
            this.recommendedExtensions = (0, arrays_1.distinct)([...this.recommendedExtensions, ...extensionIds]);
            let extensionsMessage = '';
            if (extensions.length === 1) {
                extensionsMessage = (0, nls_1.localize)('extensionFromPublisher', "'{0}' extension from {1}", extensions[0].displayName, extensions[0].publisherDisplayName);
            }
            else {
                const publishers = [...extensions.reduce((result, extension) => result.add(extension.publisherDisplayName), new Set())];
                if (publishers.length > 2) {
                    extensionsMessage = (0, nls_1.localize)('extensionsFromMultiplePublishers', "extensions from {0}, {1} and others", publishers[0], publishers[1]);
                }
                else if (publishers.length === 2) {
                    extensionsMessage = (0, nls_1.localize)('extensionsFromPublishers', "extensions from {0} and {1}", publishers[0], publishers[1]);
                }
                else {
                    extensionsMessage = (0, nls_1.localize)('extensionsFromPublisher', "extensions from {0}", publishers[0]);
                }
            }
            let message = (0, nls_1.localize)('recommended', "Do you want to install the recommended {0} for {1}?", extensionsMessage, name);
            if (source === 3 /* RecommendationSource.EXE */) {
                message = (0, nls_1.localize)({ key: 'exeRecommended', comment: ['Placeholder string is the name of the software that is installed.'] }, "You have {0} installed on your system. Do you want to install the recommended {1} for it?", name, extensionsMessage);
            }
            if (!searchValue) {
                searchValue = source === 2 /* RecommendationSource.WORKSPACE */ ? '@recommended' : extensions.map(extensionId => `@id:${extensionId.identifier.id}`).join(' ');
            }
            const donotShowAgainLabel = source === 2 /* RecommendationSource.WORKSPACE */ ? (0, nls_1.localize)('donotShowAgain', "Don't Show Again for this Repository")
                : extensions.length > 1 ? (0, nls_1.localize)('donotShowAgainExtension', "Don't Show Again for these Extensions") : (0, nls_1.localize)('donotShowAgainExtensionSingle', "Don't Show Again for this Extension");
            return (0, async_1.raceCancellablePromises)([
                this._registerP(this.showRecommendationsNotification(extensions, message, searchValue, donotShowAgainLabel, source, recommendationsNotificationActions)),
                this._registerP(this.waitUntilRecommendationsAreInstalled(extensions))
            ]);
        }
        showRecommendationsNotification(extensions, message, searchValue, donotShowAgainLabel, source, { onDidInstallRecommendedExtensions, onDidShowRecommendedExtensions, onDidCancelRecommendedExtensions, onDidNeverShowRecommendedExtensionsAgain }) {
            return (0, async_1.createCancelablePromise)(async (token) => {
                let accepted = false;
                const choices = [];
                const installExtensions = async (isMachineScoped) => {
                    this.runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, searchValue));
                    onDidInstallRecommendedExtensions(extensions);
                    await async_1.Promises.settled([
                        async_1.Promises.settled(extensions.map(extension => this.extensionsWorkbenchService.open(extension, { pinned: true }))),
                        this.extensionManagementService.installGalleryExtensions(extensions.map(e => ({ extension: e.gallery, options: { isMachineScoped } })))
                    ]);
                };
                choices.push({
                    label: (0, nls_1.localize)('install', "Install"),
                    run: () => installExtensions(false),
                    menu: this.userDataSyncEnablementService.isEnabled() && this.userDataSyncEnablementService.isResourceEnabled("extensions" /* SyncResource.Extensions */) ? [{
                            label: (0, nls_1.localize)('install and do no sync', "Install (Do not sync)"),
                            run: () => installExtensions(true)
                        }] : undefined,
                });
                choices.push(...[{
                        label: (0, nls_1.localize)('show recommendations', "Show Recommendations"),
                        run: async () => {
                            onDidShowRecommendedExtensions(extensions);
                            for (const extension of extensions) {
                                this.extensionsWorkbenchService.open(extension, { pinned: true });
                            }
                            this.runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, searchValue));
                        }
                    }, {
                        label: donotShowAgainLabel,
                        isSecondary: true,
                        run: () => {
                            onDidNeverShowRecommendedExtensionsAgain(extensions);
                        }
                    }]);
                try {
                    accepted = await this.doShowRecommendationsNotification(notification_1.Severity.Info, message, choices, source, token);
                }
                catch (error) {
                    if (!(0, errors_1.isCancellationError)(error)) {
                        throw error;
                    }
                }
                if (accepted) {
                    return "reacted" /* RecommendationsNotificationResult.Accepted */;
                }
                else {
                    onDidCancelRecommendedExtensions(extensions);
                    return "cancelled" /* RecommendationsNotificationResult.Cancelled */;
                }
            });
        }
        waitUntilRecommendationsAreInstalled(extensions) {
            const installedExtensions = [];
            const disposables = new lifecycle_1.DisposableStore();
            return (0, async_1.createCancelablePromise)(async (token) => {
                disposables.add(token.onCancellationRequested(e => disposables.dispose()));
                return new Promise((c, e) => {
                    disposables.add(this.extensionManagementService.onInstallExtension(e => {
                        installedExtensions.push(e.identifier.id.toLowerCase());
                        if (extensions.every(e => installedExtensions.includes(e.identifier.id.toLowerCase()))) {
                            c("reacted" /* RecommendationsNotificationResult.Accepted */);
                        }
                    }));
                });
            });
        }
        /**
         * Show recommendations in Queue
         * At any time only one recommendation is shown
         * If a new recommendation comes in
         * 		=> If no recommendation is visible, show it immediately
         *		=> Otherwise, add to the pending queue
         * 			=> If it is not exe based and has higher or same priority as current, hide the current notification after showing it for 3s.
         * 			=> Otherwise wait until the current notification is hidden.
         */
        async doShowRecommendationsNotification(severity, message, choices, source, token) {
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const recommendationsNotification = disposables.add(new RecommendationsNotification(severity, message, choices, this.notificationService));
                disposables.add(event_1.Event.once(event_1.Event.filter(recommendationsNotification.onDidChangeVisibility, e => !e))(() => this.showNextNotification()));
                if (this.visibleNotification) {
                    const index = this.pendingNotificaitons.length;
                    disposables.add(token.onCancellationRequested(() => this.pendingNotificaitons.splice(index, 1)));
                    this.pendingNotificaitons.push({ recommendationsNotification, source, token });
                    if (source !== 3 /* RecommendationSource.EXE */ && source <= this.visibleNotification.source) {
                        this.hideVisibleNotification(3000);
                    }
                }
                else {
                    this.visibleNotification = { recommendationsNotification, source, from: Date.now() };
                    recommendationsNotification.show();
                }
                await (0, async_1.raceCancellation)(new Promise(c => disposables.add(event_1.Event.once(recommendationsNotification.onDidClose)(c))), token);
                return !recommendationsNotification.isCancelled();
            }
            finally {
                disposables.dispose();
            }
        }
        showNextNotification() {
            const index = this.getNextPendingNotificationIndex();
            const [nextNotificaiton] = index > -1 ? this.pendingNotificaitons.splice(index, 1) : [];
            // Show the next notification after a delay of 500ms (after the current notification is dismissed)
            (0, async_1.timeout)(nextNotificaiton ? 500 : 0)
                .then(() => {
                this.unsetVisibileNotification();
                if (nextNotificaiton) {
                    this.visibleNotification = { recommendationsNotification: nextNotificaiton.recommendationsNotification, source: nextNotificaiton.source, from: Date.now() };
                    nextNotificaiton.recommendationsNotification.show();
                }
            });
        }
        /**
         * Return the recent high priroity pending notification
         */
        getNextPendingNotificationIndex() {
            let index = this.pendingNotificaitons.length - 1;
            if (this.pendingNotificaitons.length) {
                for (let i = 0; i < this.pendingNotificaitons.length; i++) {
                    if (this.pendingNotificaitons[i].source <= this.pendingNotificaitons[index].source) {
                        index = i;
                    }
                }
            }
            return index;
        }
        hideVisibleNotification(timeInMillis) {
            if (this.visibleNotification && !this.hideVisibleNotificationPromise) {
                const visibleNotification = this.visibleNotification;
                this.hideVisibleNotificationPromise = (0, async_1.timeout)(Math.max(timeInMillis - (Date.now() - visibleNotification.from), 0));
                this.hideVisibleNotificationPromise.then(() => visibleNotification.recommendationsNotification.hide());
            }
        }
        unsetVisibileNotification() {
            this.hideVisibleNotificationPromise?.cancel();
            this.hideVisibleNotificationPromise = undefined;
            this.visibleNotification = undefined;
        }
        async getInstallableExtensions(extensionIds) {
            const result = [];
            if (extensionIds.length) {
                const extensions = await this.extensionsWorkbenchService.getExtensions(extensionIds.map(id => ({ id })), { source: 'install-recommendations' }, cancellation_1.CancellationToken.None);
                for (const extension of extensions) {
                    if (extension.gallery && (await this.extensionManagementService.canInstall(extension.gallery))) {
                        result.push(extension);
                    }
                }
            }
            return result;
        }
        async runAction(action) {
            try {
                await action.run();
            }
            finally {
                if ((0, lifecycle_1.isDisposable)(action)) {
                    action.dispose();
                }
            }
        }
        addToImportantRecommendationsIgnore(id) {
            const importantRecommendationsIgnoreList = [...this.ignoredRecommendations];
            if (!importantRecommendationsIgnoreList.includes(id.toLowerCase())) {
                importantRecommendationsIgnoreList.push(id.toLowerCase());
                this.storageService.store(ignoreImportantExtensionRecommendationStorageKey, JSON.stringify(importantRecommendationsIgnoreList), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
        }
        setIgnoreRecommendationsConfig(configVal) {
            this.configurationService.updateValue('extensions.ignoreRecommendations', configVal);
        }
        _registerP(o) {
            this._register((0, lifecycle_1.toDisposable)(() => o.cancel()));
            return o;
        }
    };
    exports.ExtensionRecommendationNotificationService = ExtensionRecommendationNotificationService;
    exports.ExtensionRecommendationNotificationService = ExtensionRecommendationNotificationService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, storage_1.IStorageService),
        __param(2, notification_1.INotificationService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, extensions_1.IExtensionsWorkbenchService),
        __param(6, extensionManagement_1.IWorkbenchExtensionManagementService),
        __param(7, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(8, extensionRecommendations_2.IExtensionIgnoredRecommendationsService),
        __param(9, userDataSync_1.IUserDataSyncEnablementService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService)
    ], ExtensionRecommendationNotificationService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25Ob3RpZmljYXRpb25TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25Ob3RpZmljYXRpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXNDaEcsTUFBTSxnREFBZ0QsR0FBRyxvREFBb0QsQ0FBQztJQUM5RyxNQUFNLDJDQUEyQyxHQUFHLG9EQUFvRCxDQUFDO0lBU3pHLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7UUFXbkQsWUFDa0IsUUFBa0IsRUFDbEIsT0FBZSxFQUNmLE9BQXdCLEVBQ3hCLG1CQUF5QztZQUUxRCxLQUFLLEVBQUUsQ0FBQztZQUxTLGFBQVEsR0FBUixRQUFRLENBQVU7WUFDbEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLFlBQU8sR0FBUCxPQUFPLENBQWlCO1lBQ3hCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFibkQsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNqRCxlQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFFckMsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVyxDQUFDLENBQUM7WUFDL0QsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUczRCxjQUFTLEdBQVksS0FBSyxDQUFDO1lBOEIzQix5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELG9DQUErQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7UUF0QmxGLENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUM5QixJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BLLENBQUM7UUFDRixDQUFDO1FBRUQsSUFBSTtZQUNILElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztnQkFDdkIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsbUNBQW9CLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3TCxDQUFDO1FBQ0YsQ0FBQztRQUVELFdBQVc7WUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkIsQ0FBQztRQUlPLHdCQUF3QixDQUFDLGtCQUF1QztZQUN2RSxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLCtCQUErQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztZQUU3QyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUN6RSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLCtCQUErQixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4SSxDQUFDO0tBQ0Q7SUFLTSxJQUFNLDBDQUEwQyxHQUFoRCxNQUFNLDBDQUEyQyxTQUFRLHNCQUFVO1FBSXpFLG9DQUFvQztRQUNwQyxJQUFJLHNCQUFzQjtZQUN6QixPQUFPLElBQUEsaUJBQVEsRUFBQyxDQUFDLEdBQWMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxnREFBZ0QsZ0NBQXdCLElBQUksQ0FBQyxDQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9LLENBQUM7UUFTRCxZQUN3QixvQkFBNEQsRUFDbEUsY0FBZ0QsRUFDM0MsbUJBQTBELEVBQzdELGdCQUFvRCxFQUNoRCxvQkFBNEQsRUFDdEQsMEJBQXdFLEVBQy9ELDBCQUFpRixFQUNqRiwwQkFBaUYsRUFDOUUsc0NBQWdHLEVBQ3pHLDZCQUE4RSxFQUNoRiwyQkFBMEU7WUFFeEcsS0FBSyxFQUFFLENBQUM7WUFaZ0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDMUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDckMsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUM5QywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQXNDO1lBQ2hFLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBc0M7WUFDN0QsMkNBQXNDLEdBQXRDLHNDQUFzQyxDQUF5QztZQUN4RixrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBQy9ELGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBOEI7WUFsQmpHLDBCQUFxQixHQUFhLEVBQUUsQ0FBQztZQUNyQywwQkFBcUIsR0FBMkIsRUFBRSxDQUFDO1lBSW5ELHlCQUFvQixHQUF5QyxFQUFFLENBQUM7UUFnQnhFLENBQUM7UUFFRCxzQ0FBc0M7WUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBZ0YsWUFBWSxDQUFDLENBQUM7WUFDL0ksT0FBTyxNQUFNLENBQUMscUJBQXFCLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQztRQUNqRixDQUFDO1FBRUQsS0FBSyxDQUFDLDRDQUE0QyxDQUFDLHdCQUFtRDtZQUNyRyxNQUFNLHNCQUFzQixHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsc0NBQXNDLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUN2SSxNQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN4QixpRUFBaUQ7WUFDbEQsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEVBQUUsR0FBRyx3QkFBd0IsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFDMUYsaUNBQWlDLEVBQUUsQ0FBQyxVQUF3QixFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBb0gsZ0NBQWdDLEVBQUUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBQSx1REFBNEIsRUFBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2phLDhCQUE4QixFQUFFLENBQUMsVUFBd0IsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQW9ILGdDQUFnQyxFQUFFLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUEsdURBQTRCLEVBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMzWixnQ0FBZ0MsRUFBRSxDQUFDLFVBQXdCLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFvSCxnQ0FBZ0MsRUFBRSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFBLHVEQUE0QixFQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbGEsd0NBQXdDLEVBQUUsQ0FBQyxVQUF3QixFQUFFLEVBQUU7b0JBQ3RFLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFLENBQUM7d0JBQ3BDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNsRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFvSCxnQ0FBZ0MsRUFBRSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUEsdURBQTRCLEVBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN4VSxDQUFDO29CQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQzlCLHVCQUFRLENBQUMsSUFBSSxFQUNiLElBQUEsY0FBUSxFQUFDLGdDQUFnQyxFQUFFLHNEQUFzRCxDQUFDLEVBQ2xHLENBQUM7NEJBQ0EsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQzs0QkFDL0MsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUM7eUJBQ3BELEVBQUU7NEJBQ0YsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUM7NEJBQzNCLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDO3lCQUNyRCxDQUFDLENBQ0YsQ0FBQztnQkFDSCxDQUFDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxlQUF5QjtZQUM3RCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLDJDQUEyQyxrQ0FBMEIsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDaEgsT0FBTztZQUNSLENBQUM7WUFFRCxJQUFJLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNyRSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsb0RBQTRDLENBQUMsQ0FBQyxDQUFDLHFDQUFxQztZQUMzSyxlQUFlLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUEsMkNBQWlCLEVBQUMsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3SSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxNQUFNLHdDQUFnQyxFQUFFLElBQUksRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsQ0FBQyw2REFBNkQsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxFQUFFO2dCQUM5UCxpQ0FBaUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUF3Rix5Q0FBeUMsRUFBRSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsQ0FBQztnQkFDeE8sOEJBQThCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBd0YseUNBQXlDLEVBQUUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQ2xPLGdDQUFnQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQXdGLHlDQUF5QyxFQUFFLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxDQUFDO2dCQUN6Tyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7b0JBQzlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQXdGLHlDQUF5QyxFQUFFLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztvQkFDdk0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsMkNBQTJDLEVBQUUsSUFBSSxnRUFBZ0QsQ0FBQztnQkFDN0gsQ0FBQzthQUNELENBQUMsQ0FBQztRQUVKLENBQUM7UUFFTyxLQUFLLENBQUMsaUNBQWlDLENBQUMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUE2QixFQUFFLGtDQUFzRTtZQUV6TSxJQUFJLElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxFQUFFLENBQUM7Z0JBQ25ELGlFQUFpRDtZQUNsRCxDQUFDO1lBRUQseURBQXlEO1lBQ3pELElBQUksTUFBTSxxQ0FBNkIsSUFBSSxJQUFJLENBQUMsMkJBQTJCLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzdGLHVGQUE0RDtZQUM3RCxDQUFDO1lBRUQsMENBQTBDO1lBQzFDLHFEQUFxRDtZQUNyRCxvREFBb0Q7WUFDcEQsSUFBSSxNQUFNLHFDQUE2QixJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsa0NBQTBCLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN0SixpRUFBaUQ7WUFDbEQsQ0FBQztZQUVELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFeEMsaUVBQWlFO1lBQ2pFLElBQUksTUFBTSxxQ0FBNkIsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzlHLGlFQUFpRDtZQUNsRCxDQUFDO1lBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDeEIsaUVBQWlEO1lBQ2xELENBQUM7WUFFRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBQSxpQkFBUSxFQUFDLENBQUMsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBRXhGLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDO1lBQzNCLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDN0IsaUJBQWlCLEdBQUcsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsMEJBQTBCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNuSixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxVQUFVLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNoSSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzNCLGlCQUFpQixHQUFHLElBQUEsY0FBUSxFQUFDLGtDQUFrQyxFQUFFLHFDQUFxQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkksQ0FBQztxQkFBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ3BDLGlCQUFpQixHQUFHLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLDZCQUE2QixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkgsQ0FBQztxQkFBTSxDQUFDO29CQUNQLGlCQUFpQixHQUFHLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRixDQUFDO1lBQ0YsQ0FBQztZQUVELElBQUksT0FBTyxHQUFHLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxxREFBcUQsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0SCxJQUFJLE1BQU0scUNBQTZCLEVBQUUsQ0FBQztnQkFDekMsT0FBTyxHQUFHLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxDQUFDLG1FQUFtRSxDQUFDLEVBQUUsRUFBRSwyRkFBMkYsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNyUCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNsQixXQUFXLEdBQUcsTUFBTSwyQ0FBbUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hKLENBQUM7WUFFRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sMkNBQW1DLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLHNDQUFzQyxDQUFDO2dCQUN6SSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLHVDQUF1QyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLHFDQUFxQyxDQUFDLENBQUM7WUFFM0wsT0FBTyxJQUFBLCtCQUF1QixFQUFDO2dCQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztnQkFDeEosSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdEUsQ0FBQyxDQUFDO1FBRUosQ0FBQztRQUVPLCtCQUErQixDQUFDLFVBQXdCLEVBQUUsT0FBZSxFQUFFLFdBQW1CLEVBQUUsbUJBQTJCLEVBQUUsTUFBNEIsRUFDaEssRUFBRSxpQ0FBaUMsRUFBRSw4QkFBOEIsRUFBRSxnQ0FBZ0MsRUFBRSx3Q0FBd0MsRUFBc0M7WUFDckwsT0FBTyxJQUFBLCtCQUF1QixFQUFvQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7Z0JBQy9FLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDckIsTUFBTSxPQUFPLEdBQThDLEVBQUUsQ0FBQztnQkFDOUQsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsZUFBd0IsRUFBRSxFQUFFO29CQUM1RCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMENBQXNCLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDOUYsaUNBQWlDLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzlDLE1BQU0sZ0JBQVEsQ0FBQyxPQUFPLENBQU07d0JBQzNCLGdCQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQ2hILElBQUksQ0FBQywwQkFBMEIsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUN4SSxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDO2dCQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ1osS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7b0JBQ3JDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7b0JBQ25DLElBQUksRUFBRSxJQUFJLENBQUMsNkJBQTZCLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDLDZCQUE2QixDQUFDLGlCQUFpQiw0Q0FBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDeEksS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHdCQUF3QixFQUFFLHVCQUF1QixDQUFDOzRCQUNsRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO3lCQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQ2QsQ0FBQyxDQUFDO2dCQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO3dCQUNoQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsc0JBQXNCLENBQUM7d0JBQy9ELEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRTs0QkFDZiw4QkFBOEIsQ0FBQyxVQUFVLENBQUMsQ0FBQzs0QkFDM0MsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQ0FDcEMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzs0QkFDbkUsQ0FBQzs0QkFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMENBQXNCLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDL0YsQ0FBQztxQkFDRCxFQUFFO3dCQUNGLEtBQUssRUFBRSxtQkFBbUI7d0JBQzFCLFdBQVcsRUFBRSxJQUFJO3dCQUNqQixHQUFHLEVBQUUsR0FBRyxFQUFFOzRCQUNULHdDQUF3QyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUN0RCxDQUFDO3FCQUNELENBQUMsQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQztvQkFDSixRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsdUJBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3pHLENBQUM7Z0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLElBQUEsNEJBQW1CLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDakMsTUFBTSxLQUFLLENBQUM7b0JBQ2IsQ0FBQztnQkFDRixDQUFDO2dCQUVELElBQUksUUFBUSxFQUFFLENBQUM7b0JBQ2Qsa0VBQWtEO2dCQUNuRCxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsZ0NBQWdDLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzdDLHFFQUFtRDtnQkFDcEQsQ0FBQztZQUVGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLG9DQUFvQyxDQUFDLFVBQXdCO1lBQ3BFLE1BQU0sbUJBQW1CLEdBQWEsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzFDLE9BQU8sSUFBQSwrQkFBdUIsRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7Z0JBQzVDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0UsT0FBTyxJQUFJLE9BQU8sQ0FBNkMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZFLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUN0RSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzt3QkFDeEQsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDOzRCQUN4RixDQUFDLDREQUE0QyxDQUFDO3dCQUMvQyxDQUFDO29CQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDs7Ozs7Ozs7V0FRRztRQUNLLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxRQUFrQixFQUFFLE9BQWUsRUFBRSxPQUF3QixFQUFFLE1BQTRCLEVBQUUsS0FBd0I7WUFDcEssTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDO2dCQUNKLE1BQU0sMkJBQTJCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7Z0JBQzNJLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLElBQUksQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDekksSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQztvQkFDL0MsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQy9FLElBQUksTUFBTSxxQ0FBNkIsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLG1CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUN2RixJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BDLENBQUM7Z0JBQ0YsQ0FBQztxQkFBTSxDQUFDO29CQUNQLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7b0JBQ3JGLDJCQUEyQixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQyxDQUFDO2dCQUNELE1BQU0sSUFBQSx3QkFBZ0IsRUFBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3hILE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuRCxDQUFDO29CQUFTLENBQUM7Z0JBQ1YsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLENBQUM7UUFDRixDQUFDO1FBRU8sb0JBQW9CO1lBQzNCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUV4RixrR0FBa0c7WUFDbEcsSUFBQSxlQUFPLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNqQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNWLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLGdCQUFnQixFQUFFLENBQUM7b0JBQ3RCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLDJCQUEyQixFQUFFLGdCQUFnQixDQUFDLDJCQUEyQixFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO29CQUM1SixnQkFBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDckQsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVEOztXQUVHO1FBQ0ssK0JBQStCO1lBQ3RDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2pELElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN0QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUMzRCxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNwRixLQUFLLEdBQUcsQ0FBQyxDQUFDO29CQUNYLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTyx1QkFBdUIsQ0FBQyxZQUFvQjtZQUNuRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO2dCQUN0RSxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztnQkFDckQsSUFBSSxDQUFDLDhCQUE4QixHQUFHLElBQUEsZUFBTyxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25ILElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsbUJBQW9CLENBQUMsMkJBQTJCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN6RyxDQUFDO1FBQ0YsQ0FBQztRQUVPLHlCQUF5QjtZQUNoQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLDhCQUE4QixHQUFHLFNBQVMsQ0FBQztZQUNoRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO1FBQ3RDLENBQUM7UUFFTyxLQUFLLENBQUMsd0JBQXdCLENBQUMsWUFBc0I7WUFDNUQsTUFBTSxNQUFNLEdBQWlCLEVBQUUsQ0FBQztZQUNoQyxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLHlCQUF5QixFQUFFLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hLLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ3BDLElBQUksU0FBUyxDQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUNoRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN4QixDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFlO1lBQ3RDLElBQUksQ0FBQztnQkFDSixNQUFNLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNwQixDQUFDO29CQUFTLENBQUM7Z0JBQ1YsSUFBSSxJQUFBLHdCQUFZLEVBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDMUIsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNsQixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFTyxtQ0FBbUMsQ0FBQyxFQUFVO1lBQ3JELE1BQU0sa0NBQWtDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDcEUsa0NBQWtDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtDQUFrQyxDQUFDLDJEQUEyQyxDQUFDO1lBQzNLLENBQUM7UUFDRixDQUFDO1FBRU8sOEJBQThCLENBQUMsU0FBa0I7WUFDeEQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxrQ0FBa0MsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRU8sVUFBVSxDQUFJLENBQXVCO1lBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0MsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO0tBQ0QsQ0FBQTtJQXRWWSxnR0FBMEM7eURBQTFDLDBDQUEwQztRQWlCcEQsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLG1DQUFvQixDQUFBO1FBQ3BCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHdDQUEyQixDQUFBO1FBQzNCLFdBQUEsMERBQW9DLENBQUE7UUFDcEMsV0FBQSwwREFBb0MsQ0FBQTtRQUNwQyxXQUFBLGtFQUF1QyxDQUFBO1FBQ3ZDLFdBQUEsNkNBQThCLENBQUE7UUFDOUIsWUFBQSxpREFBNEIsQ0FBQTtPQTNCbEIsMENBQTBDLENBc1Z0RCJ9
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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/base/common/arrays", "vs/base/common/event", "vs/platform/environment/common/environment", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/contrib/extensions/browser/exeBasedRecommendations", "vs/workbench/contrib/extensions/browser/workspaceRecommendations", "vs/workbench/contrib/extensions/browser/fileBasedRecommendations", "vs/workbench/contrib/extensions/browser/keymapRecommendations", "vs/workbench/contrib/extensions/browser/languageRecommendations", "vs/workbench/contrib/extensions/browser/configBasedRecommendations", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/base/common/async", "vs/base/common/uri", "vs/workbench/contrib/extensions/browser/webRecommendations", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/contrib/extensions/browser/remoteRecommendations", "vs/platform/remote/common/remoteExtensionsScanner", "vs/workbench/services/userData/browser/userDataInit"], function (require, exports, lifecycle_1, extensionManagement_1, extensionRecommendations_1, instantiation_1, telemetry_1, arrays_1, event_1, environment_1, lifecycle_2, exeBasedRecommendations_1, workspaceRecommendations_1, fileBasedRecommendations_1, keymapRecommendations_1, languageRecommendations_1, configBasedRecommendations_1, extensionRecommendations_2, async_1, uri_1, webRecommendations_1, extensions_1, extensionManagementUtil_1, remoteRecommendations_1, remoteExtensionsScanner_1, userDataInit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionRecommendationsService = void 0;
    let ExtensionRecommendationsService = class ExtensionRecommendationsService extends lifecycle_1.Disposable {
        constructor(instantiationService, lifecycleService, galleryService, telemetryService, environmentService, extensionManagementService, extensionRecommendationsManagementService, extensionRecommendationNotificationService, extensionsWorkbenchService, remoteExtensionsScannerService, userDataInitializationService) {
            super();
            this.lifecycleService = lifecycleService;
            this.galleryService = galleryService;
            this.telemetryService = telemetryService;
            this.environmentService = environmentService;
            this.extensionManagementService = extensionManagementService;
            this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
            this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.remoteExtensionsScannerService = remoteExtensionsScannerService;
            this.userDataInitializationService = userDataInitializationService;
            this._onDidChangeRecommendations = this._register(new event_1.Emitter());
            this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
            this.workspaceRecommendations = this._register(instantiationService.createInstance(workspaceRecommendations_1.WorkspaceRecommendations));
            this.fileBasedRecommendations = this._register(instantiationService.createInstance(fileBasedRecommendations_1.FileBasedRecommendations));
            this.configBasedRecommendations = this._register(instantiationService.createInstance(configBasedRecommendations_1.ConfigBasedRecommendations));
            this.exeBasedRecommendations = this._register(instantiationService.createInstance(exeBasedRecommendations_1.ExeBasedRecommendations));
            this.keymapRecommendations = this._register(instantiationService.createInstance(keymapRecommendations_1.KeymapRecommendations));
            this.webRecommendations = this._register(instantiationService.createInstance(webRecommendations_1.WebRecommendations));
            this.languageRecommendations = this._register(instantiationService.createInstance(languageRecommendations_1.LanguageRecommendations));
            this.remoteRecommendations = this._register(instantiationService.createInstance(remoteRecommendations_1.RemoteRecommendations));
            if (!this.isEnabled()) {
                this.sessionSeed = 0;
                this.activationPromise = Promise.resolve();
                return;
            }
            this.sessionSeed = +new Date();
            // Activation
            this.activationPromise = this.activate();
            this._register(this.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
        }
        async activate() {
            try {
                await Promise.allSettled([
                    this.remoteExtensionsScannerService.whenExtensionsReady(),
                    this.userDataInitializationService.whenInitializationFinished(),
                    this.lifecycleService.when(3 /* LifecyclePhase.Restored */)
                ]);
            }
            catch (error) { /* ignore */ }
            // activate all recommendations
            await Promise.all([
                this.workspaceRecommendations.activate(),
                this.configBasedRecommendations.activate(),
                this.fileBasedRecommendations.activate(),
                this.keymapRecommendations.activate(),
                this.languageRecommendations.activate(),
                this.webRecommendations.activate(),
                this.remoteRecommendations.activate()
            ]);
            this._register(event_1.Event.any(this.workspaceRecommendations.onDidChangeRecommendations, this.configBasedRecommendations.onDidChangeRecommendations, this.extensionRecommendationsManagementService.onDidChangeIgnoredRecommendations)(() => this._onDidChangeRecommendations.fire()));
            this._register(this.extensionRecommendationsManagementService.onDidChangeGlobalIgnoredRecommendation(({ extensionId, isRecommended }) => {
                if (!isRecommended) {
                    const reason = this.getAllRecommendationsWithReason()[extensionId];
                    if (reason && reason.reasonId) {
                        this.telemetryService.publicLog2('extensionsRecommendations:ignoreRecommendation', { extensionId, recommendationReason: reason.reasonId });
                    }
                }
            }));
            this.promptWorkspaceRecommendations();
        }
        isEnabled() {
            return this.galleryService.isEnabled() && !this.environmentService.isExtensionDevelopment;
        }
        async activateProactiveRecommendations() {
            await Promise.all([this.exeBasedRecommendations.activate(), this.configBasedRecommendations.activate()]);
        }
        getAllRecommendationsWithReason() {
            /* Activate proactive recommendations */
            this.activateProactiveRecommendations();
            const output = Object.create(null);
            const allRecommendations = [
                ...this.configBasedRecommendations.recommendations,
                ...this.exeBasedRecommendations.recommendations,
                ...this.fileBasedRecommendations.recommendations,
                ...this.workspaceRecommendations.recommendations,
                ...this.keymapRecommendations.recommendations,
                ...this.languageRecommendations.recommendations,
                ...this.webRecommendations.recommendations,
            ];
            for (const { extensionId, reason } of allRecommendations) {
                if (this.isExtensionAllowedToBeRecommended(extensionId)) {
                    output[extensionId.toLowerCase()] = reason;
                }
            }
            return output;
        }
        async getConfigBasedRecommendations() {
            await this.configBasedRecommendations.activate();
            return {
                important: this.toExtensionRecommendations(this.configBasedRecommendations.importantRecommendations),
                others: this.toExtensionRecommendations(this.configBasedRecommendations.otherRecommendations)
            };
        }
        async getOtherRecommendations() {
            await this.activationPromise;
            await this.activateProactiveRecommendations();
            const recommendations = [
                ...this.configBasedRecommendations.otherRecommendations,
                ...this.exeBasedRecommendations.otherRecommendations,
                ...this.webRecommendations.recommendations
            ];
            const extensionIds = (0, arrays_1.distinct)(recommendations.map(e => e.extensionId))
                .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
            (0, arrays_1.shuffle)(extensionIds, this.sessionSeed);
            return extensionIds;
        }
        async getImportantRecommendations() {
            await this.activateProactiveRecommendations();
            const recommendations = [
                ...this.fileBasedRecommendations.importantRecommendations,
                ...this.configBasedRecommendations.importantRecommendations,
                ...this.exeBasedRecommendations.importantRecommendations,
            ];
            const extensionIds = (0, arrays_1.distinct)(recommendations.map(e => e.extensionId))
                .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
            (0, arrays_1.shuffle)(extensionIds, this.sessionSeed);
            return extensionIds;
        }
        getKeymapRecommendations() {
            return this.toExtensionRecommendations(this.keymapRecommendations.recommendations);
        }
        getLanguageRecommendations() {
            return this.toExtensionRecommendations(this.languageRecommendations.recommendations);
        }
        getRemoteRecommendations() {
            return this.toExtensionRecommendations(this.remoteRecommendations.recommendations);
        }
        async getWorkspaceRecommendations() {
            if (!this.isEnabled()) {
                return [];
            }
            await this.workspaceRecommendations.activate();
            return this.toExtensionRecommendations(this.workspaceRecommendations.recommendations);
        }
        async getExeBasedRecommendations(exe) {
            await this.exeBasedRecommendations.activate();
            const { important, others } = exe ? this.exeBasedRecommendations.getRecommendations(exe)
                : { important: this.exeBasedRecommendations.importantRecommendations, others: this.exeBasedRecommendations.otherRecommendations };
            return { important: this.toExtensionRecommendations(important), others: this.toExtensionRecommendations(others) };
        }
        getFileBasedRecommendations() {
            return this.toExtensionRecommendations(this.fileBasedRecommendations.recommendations);
        }
        onDidInstallExtensions(results) {
            for (const e of results) {
                if (e.source && !uri_1.URI.isUri(e.source) && e.operation === 2 /* InstallOperation.Install */) {
                    const extRecommendations = this.getAllRecommendationsWithReason() || {};
                    const recommendationReason = extRecommendations[e.source.identifier.id.toLowerCase()];
                    if (recommendationReason) {
                        /* __GDPR__
                            "extensionGallery:install:recommendations" : {
                                "owner": "sandy081",
                                "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                                "${include}": [
                                    "${GalleryExtensionTelemetryData}"
                                ]
                            }
                        */
                        this.telemetryService.publicLog('extensionGallery:install:recommendations', { ...e.source.telemetryData, recommendationReason: recommendationReason.reasonId });
                    }
                }
            }
        }
        toExtensionRecommendations(recommendations) {
            const extensionIds = (0, arrays_1.distinct)(recommendations.map(e => e.extensionId))
                .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
            return extensionIds;
        }
        isExtensionAllowedToBeRecommended(extensionId) {
            return !this.extensionRecommendationsManagementService.ignoredRecommendations.includes(extensionId.toLowerCase());
        }
        async promptWorkspaceRecommendations() {
            const installed = await this.extensionsWorkbenchService.queryLocal();
            const allowedRecommendations = [
                ...this.workspaceRecommendations.recommendations,
                ...this.configBasedRecommendations.importantRecommendations.filter(recommendation => !recommendation.whenNotInstalled || recommendation.whenNotInstalled.every(id => installed.every(local => !(0, extensionManagementUtil_1.areSameExtensions)(local.identifier, { id }))))
            ]
                .map(({ extensionId }) => extensionId)
                .filter(extensionId => this.isExtensionAllowedToBeRecommended(extensionId));
            if (allowedRecommendations.length) {
                await this._registerP((0, async_1.timeout)(5000));
                await this.extensionRecommendationNotificationService.promptWorkspaceRecommendations(allowedRecommendations);
            }
        }
        _registerP(o) {
            this._register((0, lifecycle_1.toDisposable)(() => o.cancel()));
            return o;
        }
    };
    exports.ExtensionRecommendationsService = ExtensionRecommendationsService;
    exports.ExtensionRecommendationsService = ExtensionRecommendationsService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, lifecycle_2.ILifecycleService),
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, extensionManagement_1.IExtensionManagementService),
        __param(6, extensionRecommendations_1.IExtensionIgnoredRecommendationsService),
        __param(7, extensionRecommendations_2.IExtensionRecommendationNotificationService),
        __param(8, extensions_1.IExtensionsWorkbenchService),
        __param(9, remoteExtensionsScanner_1.IRemoteExtensionsScannerService),
        __param(10, userDataInit_1.IUserDataInitializationService)
    ], ExtensionRecommendationsService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvblJlY29tbWVuZGF0aW9uc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUN6RixJQUFNLCtCQUErQixHQUFyQyxNQUFNLCtCQUFnQyxTQUFRLHNCQUFVO1FBb0I5RCxZQUN3QixvQkFBMkMsRUFDL0MsZ0JBQW9ELEVBQzdDLGNBQXlELEVBQ2hFLGdCQUFvRCxFQUNsRCxrQkFBd0QsRUFDaEQsMEJBQXdFLEVBQzVELHlDQUFtRyxFQUMvRiwwQ0FBd0csRUFDeEgsMEJBQXdFLEVBQ3BFLDhCQUFnRixFQUNqRiw2QkFBOEU7WUFFOUcsS0FBSyxFQUFFLENBQUM7WUFYNEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUM1QixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNqQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQy9CLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDM0MsOENBQXlDLEdBQXpDLHlDQUF5QyxDQUF5QztZQUM5RSwrQ0FBMEMsR0FBMUMsMENBQTBDLENBQTZDO1lBQ3ZHLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDbkQsbUNBQThCLEdBQTlCLDhCQUE4QixDQUFpQztZQUNoRSxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBZHZHLGdDQUEyQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2pFLCtCQUEwQixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUM7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
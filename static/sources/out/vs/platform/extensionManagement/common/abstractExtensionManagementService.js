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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, arrays_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, platform_1, types_1, uri_1, nls, extensionManagement_1, extensionManagementUtil_1, extensions_1, log_1, productService_1, telemetry_1, uriIdentity_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractExtensionTask = exports.toExtensionManagementError = exports.joinErrors = exports.AbstractExtensionManagementService = void 0;
    let AbstractExtensionManagementService = class AbstractExtensionManagementService extends lifecycle_1.Disposable {
        get onInstallExtension() { return this._onInstallExtension.event; }
        get onDidInstallExtensions() { return this._onDidInstallExtensions.event; }
        get onUninstallExtension() { return this._onUninstallExtension.event; }
        get onDidUninstallExtension() { return this._onDidUninstallExtension.event; }
        get onDidUpdateExtensionMetadata() { return this._onDidUpdateExtensionMetadata.event; }
        constructor(galleryService, telemetryService, uriIdentityService, logService, productService, userDataProfilesService) {
            super();
            this.galleryService = galleryService;
            this.telemetryService = telemetryService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.productService = productService;
            this.userDataProfilesService = userDataProfilesService;
            this.lastReportTimestamp = 0;
            this.installingExtensions = new Map();
            this.uninstallingExtensions = new Map();
            this._onInstallExtension = this._register(new event_1.Emitter());
            this._onDidInstallExtensions = this._register(new event_1.Emitter());
            this._onUninstallExtension = this._register(new event_1.Emitter());
            this._onDidUninstallExtension = this._register(new event_1.Emitter());
            this._onDidUpdateExtensionMetadata = this._register(new event_1.Emitter());
            this.participants = [];
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.installingExtensions.forEach(({ task }) => task.cancel());
                this.uninstallingExtensions.forEach(promise => promise.cancel());
                this.installingExtensions.clear();
                this.uninstallingExtensions.clear();
            }));
        }
        async canInstall(extension) {
            const currentTargetPlatform = await this.getTargetPlatform();
            return extension.allTargetPlatforms.some(targetPlatform => (0, extensionManagement_1.isTargetPlatformCompatible)(targetPlatform, extension.allTargetPlatforms, currentTargetPlatform));
        }
        async installFromGallery(extension, options = {}) {
            try {
                const results = await this.installGalleryExtensions([{ extension, options }]);
                const result = results.find(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, extension.identifier));
                if (result?.local) {
                    return result?.local;
                }
                if (result?.error) {
                    throw result.error;
                }
                throw new extensionManagement_1.ExtensionManagementError(`Unknown error while installing extension ${extension.identifier.id}`, extensionManagement_1.ExtensionManagementErrorCode.Unknown);
            }
            catch (error) {
                throw toExtensionManagementError(error);
            }
        }
        async installGalleryExtensions(extensions) {
            if (!this.galleryService.isEnabled()) {
                throw new extensionManagement_1.ExtensionManagementError(nls.localize('MarketPlaceDisabled', "Marketplace is not enabled"), extensionManagement_1.ExtensionManagementErrorCode.NotAllowed);
            }
            const results = [];
            const installableExtensions = [];
            await Promise.allSettled(extensions.map(async ({ extension, options }) => {
                try {
                    const compatible = await this.checkAndGetCompatibleVersion(extension, !!options?.installGivenVersion, !!options?.installPreReleaseVersion);
                    installableExtensions.push({ ...compatible, options });
                }
                catch (error) {
                    results.push({ identifier: extension.identifier, operation: 2 /* InstallOperation.Install */, source: extension, error });
                }
            }));
            if (installableExtensions.length) {
                results.push(...await this.installExtensions(installableExtensions));
            }
            for (const result of results) {
                if (result.error) {
                    this.logService.error(`Failed to install extension.`, result.identifier.id);
                    this.logService.error(result.error);
                    if (result.source && !uri_1.URI.isUri(result.source)) {
                        reportTelemetry(this.telemetryService, 'extensionGallery:install', { extensionData: (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(result.source), error: result.error });
                    }
                }
            }
            return results;
        }
        async uninstall(extension, options = {}) {
            this.logService.trace('ExtensionManagementService#uninstall', extension.identifier.id);
            return this.uninstallExtension(extension, options);
        }
        async toggleAppliationScope(extension, fromProfileLocation) {
            if ((0, extensions_1.isApplicationScopedExtension)(extension.manifest) || extension.isBuiltin) {
                return extension;
            }
            if (extension.isApplicationScoped) {
                let local = await this.updateMetadata(extension, { isApplicationScoped: false }, this.userDataProfilesService.defaultProfile.extensionsResource);
                if (!this.uriIdentityService.extUri.isEqual(fromProfileLocation, this.userDataProfilesService.defaultProfile.extensionsResource)) {
                    local = await this.copyExtension(extension, this.userDataProfilesService.defaultProfile.extensionsResource, fromProfileLocation);
                }
                for (const profile of this.userDataProfilesService.profiles) {
                    const existing = (await this.getInstalled(1 /* ExtensionType.User */, profile.extensionsResource))
                        .find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier));
                    if (existing) {
                        this._onDidUpdateExtensionMetadata.fire(existing);
                    }
                    else {
                        this._onDidUninstallExtension.fire({ identifier: extension.identifier, profileLocation: profile.extensionsResource });
                    }
                }
                return local;
            }
            else {
                const local = this.uriIdentityService.extUri.isEqual(fromProfileLocation, this.userDataProfilesService.defaultProfile.extensionsResource)
                    ? await this.updateMetadata(extension, { isApplicationScoped: true }, this.userDataProfilesService.defaultProfile.extensionsResource)
                    : await this.copyExtension(extension, fromProfileLocation, this.userDataProfilesService.defaultProfile.extensionsResource, { isApplicationScoped: true });
                this._onDidInstallExtensions.fire([{ identifier: local.identifier, operation: 2 /* InstallOperation.Install */, local, profileLocation: this.userDataProfilesService.defaultProfile.extensionsResource, applicationScoped: true }]);
                return local;
            }
        }
        getExtensionsControlManifest() {
            const now = new Date().getTime();
            if (!this.extensionsControlManifest || now - this.lastReportTimestamp > 1000 * 60 * 5) { // 5 minute cache freshness
                this.extensionsControlManifest = this.updateControlCache();
                this.lastReportTimestamp = now;
            }
            return this.extensionsControlManifest;
        }
        registerParticipant(participant) {
            this.participants.push(participant);
        }
        async installExtensions(extensions) {
            const results = [];
            await Promise.allSettled(extensions.map(async (e) => {
                try {
                    const result = await this.installExtension(e, (taskToWait, taskToWaitFor) => {
                        if (extensions.some(e => (0, extensionManagementUtil_1.adoptToGalleryExtensionId)(taskToWaitFor.identifier.id) === (0, extensionManagementUtil_1.getGalleryExtensionId)(e.manifest.publisher, e.manifest.name))) {
                            return false;
                        }
                        return this.canWaitForTask(taskToWait, taskToWaitFor);
                    });
                    results.push(...result);
                }
                catch (error) {
                    results.push({ identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(e.manifest.publisher, e.manifest.name) }, operation: 2 /* InstallOperation.Install */, source: e.extension, error });
                }
            }));
            this._onDidInstallExtensions.fire(results);
            return results;
        }
        async installExtension({ manifest, extension, options }, shouldWait) {
            const isApplicationScoped = options.isApplicationScoped || options.isBuiltin || (0, extensions_1.isApplicationScopedExtension)(manifest);
            const installExtensionTaskOptions = {
                ...options,
                installOnlyNewlyAddedFromExtensionPack: uri_1.URI.isUri(extension) ? options.installOnlyNewlyAddedFromExtensionPack : true, /* always true for gallery extensions */
                isApplicationScoped,
                profileLocation: isApplicationScoped ? this.userDataProfilesService.defaultProfile.extensionsResource : options.profileLocation ?? this.getCurrentExtensionsManifestLocation()
            };
            const getInstallExtensionTaskKey = (extension) => `${extensionManagementUtil_1.ExtensionKey.create(extension).toString()}${installExtensionTaskOptions.profileLocation ? `-${installExtensionTaskOptions.profileLocation.toString()}` : ''}`;
            // only cache gallery extensions tasks
            if (!uri_1.URI.isUri(extension)) {
                const installingExtension = this.installingExtensions.get(getInstallExtensionTaskKey(extension));
                if (installingExtension) {
                    this.logService.info('Extensions is already requested to install', extension.identifier.id);
                    await installingExtension.task.waitUntilTaskIsFinished();
                    return [];
                }
            }
            const allInstallExtensionTasks = [];
            const alreadyRequestedInstallations = [];
            const installResults = [];
            const installExtensionTask = this.createInstallExtensionTask(manifest, extension, installExtensionTaskOptions);
            if (!uri_1.URI.isUri(extension)) {
                this.installingExtensions.set(getInstallExtensionTaskKey(extension), { task: installExtensionTask, waitingTasks: [] });
            }
            this._onInstallExtension.fire({ identifier: installExtensionTask.identifier, source: extension, profileLocation: installExtensionTaskOptions.profileLocation });
            this.logService.info('Installing extension:', installExtensionTask.identifier.id);
            allInstallExtensionTasks.push({ task: installExtensionTask, manifest });
            let installExtensionHasDependents = false;
            try {
                if (installExtensionTaskOptions.donotIncludePackAndDependencies) {
                    this.logService.info('Installing the extension without checking dependencies and pack', installExtensionTask.identifier.id);
                }
                else {
                    try {
                        const allDepsAndPackExtensionsToInstall = await this.getAllDepsAndPackExtensions(installExtensionTask.identifier, manifest, !!installExtensionTaskOptions.installOnlyNewlyAddedFromExtensionPack, !!installExtensionTaskOptions.installPreReleaseVersion, installExtensionTaskOptions.profileLocation);
                        const installed = await this.getInstalled(undefined, installExtensionTaskOptions.profileLocation);
                        const options = { ...installExtensionTaskOptions, donotIncludePackAndDependencies: true, context: { ...installExtensionTaskOptions.context, [extensionManagement_1.EXTENSION_INSTALL_DEP_PACK_CONTEXT]: true } };
                        for (const { gallery, manifest } of (0, arrays_1.distinct)(allDepsAndPackExtensionsToInstall, ({ gallery }) => gallery.identifier.id)) {
                            installExtensionHasDependents = installExtensionHasDependents || !!manifest.extensionDependencies?.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, installExtensionTask.identifier));
                            const key = getInstallExtensionTaskKey(gallery);
                            const existingInstallingExtension = this.installingExtensions.get(key);
                            if (existingInstallingExtension) {
                                if (shouldWait(installExtensionTask, existingInstallingExtension.task)) {
                                    const identifier = existingInstallingExtension.task.identifier;
                                    this.logService.info('Waiting for already requested installing extension', identifier.id, installExtensionTask.identifier.id);
                                    existingInstallingExtension.waitingTasks.push(installExtensionTask);
                                    // add promise that waits until the extension is completely installed, ie., onDidInstallExtensions event is triggered for this extension
                                    alreadyRequestedInstallations.push(event_1.Event.toPromise(event_1.Event.filter(this.onDidInstallExtensions, results => results.some(result => (0, extensionManagementUtil_1.areSameExtensions)(result.identifier, identifier)))).then(results => {
                                        this.logService.info('Finished waiting for already requested installing extension', identifier.id, installExtensionTask.identifier.id);
                                        const result = results.find(result => (0, extensionManagementUtil_1.areSameExtensions)(result.identifier, identifier));
                                        if (!result?.local) {
                                            // Extension failed to install
                                            throw new Error(`Extension ${identifier.id} is not installed`);
                                        }
                                    }));
                                }
                            }
                            else if (!installed.some(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, gallery.identifier))) {
                                const task = this.createInstallExtensionTask(manifest, gallery, options);
                                this.installingExtensions.set(key, { task, waitingTasks: [installExtensionTask] });
                                this._onInstallExtension.fire({ identifier: task.identifier, source: gallery, profileLocation: installExtensionTaskOptions.profileLocation });
                                this.logService.info('Installing extension:', task.identifier.id, installExtensionTask.identifier.id);
                                allInstallExtensionTasks.push({ task, manifest });
                            }
                        }
                    }
                    catch (error) {
                        // Installing through VSIX
                        if (uri_1.URI.isUri(installExtensionTask.source)) {
                            // Ignore installing dependencies and packs
                            if ((0, arrays_1.isNonEmptyArray)(manifest.extensionDependencies)) {
                                this.logService.warn(`Cannot install dependencies of extension:`, installExtensionTask.identifier.id, error.message);
                            }
                            if ((0, arrays_1.isNonEmptyArray)(manifest.extensionPack)) {
                                this.logService.warn(`Cannot install packed extensions of extension:`, installExtensionTask.identifier.id, error.message);
                            }
                        }
                        else {
                            this.logService.error('Error while preparing to install dependencies and extension packs of the extension:', installExtensionTask.identifier.id);
                            throw error;
                        }
                    }
                }
                const extensionsToInstallMap = allInstallExtensionTasks.reduce((result, { task, manifest }) => {
                    result.set(task.identifier.id.toLowerCase(), { task, manifest });
                    return result;
                }, new Map());
                while (extensionsToInstallMap.size) {
                    let extensionsToInstall;
                    const extensionsWithoutDepsToInstall = [...extensionsToInstallMap.values()].filter(({ manifest }) => !manifest.extensionDependencies?.some(id => extensionsToInstallMap.has(id.toLowerCase())));
                    if (extensionsWithoutDepsToInstall.length) {
                        extensionsToInstall = extensionsToInstallMap.size === 1 ? extensionsWithoutDepsToInstall
                            /* If the main extension has no dependents remove it and install it at the end */
                            : extensionsWithoutDepsToInstall.filter(({ task }) => !(task === installExtensionTask && !installExtensionHasDependents));
                    }
                    else {
                        this.logService.info('Found extensions with circular dependencies', extensionsWithoutDepsToInstall.map(({ task }) => task.identifier.id));
                        extensionsToInstall = [...extensionsToInstallMap.values()];
                    }
                    // Install extensions in parallel and wait until all extensions are installed / failed
                    await this.joinAllSettled(extensionsToInstall.map(async ({ task }) => {
                        const startTime = new Date().getTime();
                        try {
                            const local = await task.run();
                            await this.joinAllSettled(this.participants.map(participant => participant.postInstall(local, task.source, installExtensionTaskOptions, cancellation_1.CancellationToken.None)));
                            if (!uri_1.URI.isUri(task.source)) {
                                const isUpdate = task.operation === 3 /* InstallOperation.Update */;
                                const durationSinceUpdate = isUpdate ? undefined : (new Date().getTime() - task.source.lastUpdated) / 1000;
                                reportTelemetry(this.telemetryService, isUpdate ? 'extensionGallery:update' : 'extensionGallery:install', {
                                    extensionData: (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(task.source),
                                    verificationStatus: task.verificationStatus,
                                    duration: new Date().getTime() - startTime,
                                    durationSinceUpdate
                                });
                                // In web, report extension install statistics explicitly. In Desktop, statistics are automatically updated while downloading the VSIX.
                                if (platform_1.isWeb && task.operation !== 3 /* InstallOperation.Update */) {
                                    try {
                                        await this.galleryService.reportStatistic(local.manifest.publisher, local.manifest.name, local.manifest.version, "install" /* StatisticType.Install */);
                                    }
                                    catch (error) { /* ignore */ }
                                }
                            }
                            installResults.push({ local, identifier: task.identifier, operation: task.operation, source: task.source, context: task.options.context, profileLocation: task.profileLocation, applicationScoped: local.isApplicationScoped });
                        }
                        catch (error) {
                            this.logService.error('Error while installing the extension', task.identifier.id, (0, errors_1.getErrorMessage)(error));
                            throw error;
                        }
                        finally {
                            extensionsToInstallMap.delete(task.identifier.id.toLowerCase());
                        }
                    }));
                }
                if (alreadyRequestedInstallations.length) {
                    await this.joinAllSettled(alreadyRequestedInstallations);
                }
                installResults.forEach(({ identifier }) => this.logService.info(`Extension installed successfully:`, identifier.id));
                return installResults;
            }
            catch (error) {
                // cancel all tasks
                allInstallExtensionTasks.forEach(({ task }) => task.cancel());
                // rollback installed extensions
                if (installResults.length) {
                    try {
                        const result = await Promise.allSettled(installResults.map(({ local }) => this.createUninstallExtensionTask(local, { versionOnly: true, profileLocation: installExtensionTaskOptions.profileLocation }).run()));
                        for (let index = 0; index < result.length; index++) {
                            const r = result[index];
                            const { identifier } = installResults[index];
                            if (r.status === 'fulfilled') {
                                this.logService.info('Rollback: Uninstalled extension', identifier.id);
                            }
                            else {
                                this.logService.warn('Rollback: Error while uninstalling extension', identifier.id, (0, errors_1.getErrorMessage)(r.reason));
                            }
                        }
                    }
                    catch (error) {
                        // ignore error
                        this.logService.warn('Error while rolling back extensions', (0, errors_1.getErrorMessage)(error), installResults.map(({ identifier }) => identifier.id));
                    }
                }
                return allInstallExtensionTasks.map(({ task }) => ({ identifier: task.identifier, operation: 2 /* InstallOperation.Install */, source: task.source, context: installExtensionTaskOptions.context, profileLocation: installExtensionTaskOptions.profileLocation, error }));
            }
            finally {
                // Finally, remove all the tasks from the cache
                for (const { task } of allInstallExtensionTasks) {
                    if (task.source && !uri_1.URI.isUri(task.source)) {
                        this.installingExtensions.delete(getInstallExtensionTaskKey(task.source));
                    }
                }
            }
        }
        canWaitForTask(taskToWait, taskToWaitFor) {
            for (const [, { task, waitingTasks }] of this.installingExtensions.entries()) {
                if (task === taskToWait) {
                    // Cannot be waited, If taskToWaitFor is waiting for taskToWait
                    if (waitingTasks.includes(taskToWaitFor)) {
                        return false;
                    }
                    // Cannot be waited, If taskToWaitFor is waiting for tasks waiting for taskToWait
                    if (waitingTasks.some(waitingTask => this.canWaitForTask(waitingTask, taskToWaitFor))) {
                        return false;
                    }
                }
                // Cannot be waited, if the taskToWait cannot be waited for the task created the taskToWaitFor
                // Because, the task waits for the tasks it created
                if (task === taskToWaitFor && waitingTasks[0] && !this.canWaitForTask(taskToWait, waitingTasks[0])) {
                    return false;
                }
            }
            return true;
        }
        async joinAllSettled(promises) {
            const results = [];
            const errors = [];
            const promiseResults = await Promise.allSettled(promises);
            for (const r of promiseResults) {
                if (r.status === 'fulfilled') {
                    results.push(r.value);
                }
                else {
                    errors.push(r.reason);
                }
            }
            // If there are errors, throw the error.
            if (errors.length) {
                throw joinErrors(errors);
            }
            return results;
        }
        async getAllDepsAndPackExtensions(extensionIdentifier, manifest, getOnlyNewlyAddedFromExtensionPack, installPreRelease, profile) {
            if (!this.galleryService.isEnabled()) {
                return [];
            }
            const installed = await this.getInstalled(undefined, profile);
            const knownIdentifiers = [];
            const allDependenciesAndPacks = [];
            const collectDependenciesAndPackExtensionsToInstall = async (extensionIdentifier, manifest) => {
                knownIdentifiers.push(extensionIdentifier);
                const dependecies = manifest.extensionDependencies || [];
                const dependenciesAndPackExtensions = [...dependecies];
                if (manifest.extensionPack) {
                    const existing = getOnlyNewlyAddedFromExtensionPack ? installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extensionIdentifier)) : undefined;
                    for (const extension of manifest.extensionPack) {
                        // add only those extensions which are new in currently installed extension
                        if (!(existing && existing.manifest.extensionPack && existing.manifest.extensionPack.some(old => (0, extensionManagementUtil_1.areSameExtensions)({ id: old }, { id: extension })))) {
                            if (dependenciesAndPackExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)({ id: e }, { id: extension }))) {
                                dependenciesAndPackExtensions.push(extension);
                            }
                        }
                    }
                }
                if (dependenciesAndPackExtensions.length) {
                    // filter out known extensions
                    const ids = dependenciesAndPackExtensions.filter(id => knownIdentifiers.every(galleryIdentifier => !(0, extensionManagementUtil_1.areSameExtensions)(galleryIdentifier, { id })));
                    if (ids.length) {
                        const galleryExtensions = await this.galleryService.getExtensions(ids.map(id => ({ id, preRelease: installPreRelease })), cancellation_1.CancellationToken.None);
                        for (const galleryExtension of galleryExtensions) {
                            if (knownIdentifiers.find(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, galleryExtension.identifier))) {
                                continue;
                            }
                            const isDependency = dependecies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, galleryExtension.identifier));
                            let compatible;
                            try {
                                compatible = await this.checkAndGetCompatibleVersion(galleryExtension, false, installPreRelease);
                            }
                            catch (error) {
                                if (!isDependency) {
                                    this.logService.info('Skipping the packed extension as it cannot be installed', galleryExtension.identifier.id, (0, errors_1.getErrorMessage)(error));
                                    continue;
                                }
                                else {
                                    throw error;
                                }
                            }
                            allDependenciesAndPacks.push({ gallery: compatible.extension, manifest: compatible.manifest });
                            await collectDependenciesAndPackExtensionsToInstall(compatible.extension.identifier, compatible.manifest);
                        }
                    }
                }
            };
            await collectDependenciesAndPackExtensionsToInstall(extensionIdentifier, manifest);
            return allDependenciesAndPacks;
        }
        async checkAndGetCompatibleVersion(extension, sameVersion, installPreRelease) {
            let compatibleExtension;
            const extensionsControlManifest = await this.getExtensionsControlManifest();
            if (extensionsControlManifest.malicious.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, identifier))) {
                throw new extensionManagement_1.ExtensionManagementError(nls.localize('malicious extension', "Can't install '{0}' extension since it was reported to be problematic.", extension.identifier.id), extensionManagement_1.ExtensionManagementErrorCode.Malicious);
            }
            const deprecationInfo = extensionsControlManifest.deprecated[extension.identifier.id.toLowerCase()];
            if (deprecationInfo?.extension?.autoMigrate) {
                this.logService.info(`The '${extension.identifier.id}' extension is deprecated, fetching the compatible '${deprecationInfo.extension.id}' extension instead.`);
                compatibleExtension = (await this.galleryService.getExtensions([{ id: deprecationInfo.extension.id, preRelease: deprecationInfo.extension.preRelease }], { targetPlatform: await this.getTargetPlatform(), compatible: true }, cancellation_1.CancellationToken.None))[0];
                if (!compatibleExtension) {
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize('notFoundDeprecatedReplacementExtension', "Can't install '{0}' extension since it was deprecated and the replacement extension '{1}' can't be found.", extension.identifier.id, deprecationInfo.extension.id), extensionManagement_1.ExtensionManagementErrorCode.Deprecated);
                }
            }
            else {
                if (!await this.canInstall(extension)) {
                    const targetPlatform = await this.getTargetPlatform();
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize('incompatible platform', "The '{0}' extension is not available in {1} for {2}.", extension.identifier.id, this.productService.nameLong, (0, extensionManagement_1.TargetPlatformToString)(targetPlatform)), extensionManagement_1.ExtensionManagementErrorCode.IncompatibleTargetPlatform);
                }
                compatibleExtension = await this.getCompatibleVersion(extension, sameVersion, installPreRelease);
                if (!compatibleExtension) {
                    /** If no compatible release version is found, check if the extension has a release version or not and throw relevant error */
                    if (!installPreRelease && extension.properties.isPreReleaseVersion && (await this.galleryService.getExtensions([extension.identifier], cancellation_1.CancellationToken.None))[0]) {
                        throw new extensionManagement_1.ExtensionManagementError(nls.localize('notFoundReleaseExtension', "Can't install release version of '{0}' extension because it has no release version.", extension.displayName ?? extension.identifier.id), extensionManagement_1.ExtensionManagementErrorCode.ReleaseVersionNotFound);
                    }
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize('notFoundCompatibleDependency', "Can't install '{0}' extension because it is not compatible with the current version of {1} (version {2}).", extension.identifier.id, this.productService.nameLong, this.productService.version), extensionManagement_1.ExtensionManagementErrorCode.Incompatible);
                }
            }
            this.logService.info('Getting Manifest...', compatibleExtension.identifier.id);
            const manifest = await this.galleryService.getManifest(compatibleExtension, cancellation_1.CancellationToken.None);
            if (manifest === null) {
                throw new extensionManagement_1.ExtensionManagementError(`Missing manifest for extension ${compatibleExtension.identifier.id}`, extensionManagement_1.ExtensionManagementErrorCode.Invalid);
            }
            if (manifest.version !== compatibleExtension.version) {
                throw new extensionManagement_1.ExtensionManagementError(`Cannot install '${compatibleExtension.identifier.id}' extension because of version mismatch in Marketplace`, extensionManagement_1.ExtensionManagementErrorCode.Invalid);
            }
            return { extension: compatibleExtension, manifest };
        }
        async getCompatibleVersion(extension, sameVersion, includePreRelease) {
            const targetPlatform = await this.getTargetPlatform();
            let compatibleExtension = null;
            if (!sameVersion && extension.hasPreReleaseVersion && extension.properties.isPreReleaseVersion !== includePreRelease) {
                compatibleExtension = (await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: includePreRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0] || null;
            }
            if (!compatibleExtension && await this.galleryService.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
                compatibleExtension = extension;
            }
            if (!compatibleExtension) {
                if (sameVersion) {
                    compatibleExtension = (await this.galleryService.getExtensions([{ ...extension.identifier, version: extension.version }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0] || null;
                }
                else {
                    compatibleExtension = await this.galleryService.getCompatibleExtension(extension, includePreRelease, targetPlatform);
                }
            }
            return compatibleExtension;
        }
        async uninstallExtension(extension, options) {
            const uninstallOptions = {
                ...options,
                profileLocation: extension.isApplicationScoped ? this.userDataProfilesService.defaultProfile.extensionsResource : options.profileLocation ?? this.getCurrentExtensionsManifestLocation()
            };
            const getUninstallExtensionTaskKey = (identifier) => `${identifier.id.toLowerCase()}${uninstallOptions.versionOnly ? `-${extension.manifest.version}` : ''}${uninstallOptions.profileLocation ? `@${uninstallOptions.profileLocation.toString()}` : ''}`;
            const uninstallExtensionTask = this.uninstallingExtensions.get(getUninstallExtensionTaskKey(extension.identifier));
            if (uninstallExtensionTask) {
                this.logService.info('Extensions is already requested to uninstall', extension.identifier.id);
                return uninstallExtensionTask.waitUntilTaskIsFinished();
            }
            const createUninstallExtensionTask = (extension) => {
                const uninstallExtensionTask = this.createUninstallExtensionTask(extension, uninstallOptions);
                this.uninstallingExtensions.set(getUninstallExtensionTaskKey(uninstallExtensionTask.extension.identifier), uninstallExtensionTask);
                if (uninstallOptions.profileLocation) {
                    this.logService.info('Uninstalling extension from the profile:', `${extension.identifier.id}@${extension.manifest.version}`, uninstallOptions.profileLocation.toString());
                }
                else {
                    this.logService.info('Uninstalling extension:', `${extension.identifier.id}@${extension.manifest.version}`);
                }
                this._onUninstallExtension.fire({ identifier: extension.identifier, profileLocation: uninstallOptions.profileLocation, applicationScoped: extension.isApplicationScoped });
                return uninstallExtensionTask;
            };
            const postUninstallExtension = (extension, error) => {
                if (error) {
                    if (uninstallOptions.profileLocation) {
                        this.logService.error('Failed to uninstall extension from the profile:', `${extension.identifier.id}@${extension.manifest.version}`, uninstallOptions.profileLocation.toString(), error.message);
                    }
                    else {
                        this.logService.error('Failed to uninstall extension:', `${extension.identifier.id}@${extension.manifest.version}`, error.message);
                    }
                }
                else {
                    if (uninstallOptions.profileLocation) {
                        this.logService.info('Successfully uninstalled extension from the profile', `${extension.identifier.id}@${extension.manifest.version}`, uninstallOptions.profileLocation.toString());
                    }
                    else {
                        this.logService.info('Successfully uninstalled extension:', `${extension.identifier.id}@${extension.manifest.version}`);
                    }
                }
                reportTelemetry(this.telemetryService, 'extensionGallery:uninstall', { extensionData: (0, extensionManagementUtil_1.getLocalExtensionTelemetryData)(extension), error });
                this._onDidUninstallExtension.fire({ identifier: extension.identifier, error: error?.code, profileLocation: uninstallOptions.profileLocation, applicationScoped: extension.isApplicationScoped });
            };
            const allTasks = [];
            const processedTasks = [];
            try {
                allTasks.push(createUninstallExtensionTask(extension));
                const installed = await this.getInstalled(1 /* ExtensionType.User */, uninstallOptions.profileLocation);
                if (uninstallOptions.donotIncludePack) {
                    this.logService.info('Uninstalling the extension without including packed extension', `${extension.identifier.id}@${extension.manifest.version}`);
                }
                else {
                    const packedExtensions = this.getAllPackExtensionsToUninstall(extension, installed);
                    for (const packedExtension of packedExtensions) {
                        if (this.uninstallingExtensions.has(getUninstallExtensionTaskKey(packedExtension.identifier))) {
                            this.logService.info('Extensions is already requested to uninstall', packedExtension.identifier.id);
                        }
                        else {
                            allTasks.push(createUninstallExtensionTask(packedExtension));
                        }
                    }
                }
                if (uninstallOptions.donotCheckDependents) {
                    this.logService.info('Uninstalling the extension without checking dependents', `${extension.identifier.id}@${extension.manifest.version}`);
                }
                else {
                    this.checkForDependents(allTasks.map(task => task.extension), installed, extension);
                }
                // Uninstall extensions in parallel and wait until all extensions are uninstalled / failed
                await this.joinAllSettled(allTasks.map(async (task) => {
                    try {
                        await task.run();
                        await this.joinAllSettled(this.participants.map(participant => participant.postUninstall(task.extension, uninstallOptions, cancellation_1.CancellationToken.None)));
                        // only report if extension has a mapped gallery extension. UUID identifies the gallery extension.
                        if (task.extension.identifier.uuid) {
                            try {
                                await this.galleryService.reportStatistic(task.extension.manifest.publisher, task.extension.manifest.name, task.extension.manifest.version, "uninstall" /* StatisticType.Uninstall */);
                            }
                            catch (error) { /* ignore */ }
                        }
                        postUninstallExtension(task.extension);
                    }
                    catch (e) {
                        const error = e instanceof extensionManagement_1.ExtensionManagementError ? e : new extensionManagement_1.ExtensionManagementError((0, errors_1.getErrorMessage)(e), extensionManagement_1.ExtensionManagementErrorCode.Internal);
                        postUninstallExtension(task.extension, error);
                        throw error;
                    }
                    finally {
                        processedTasks.push(task);
                    }
                }));
            }
            catch (e) {
                const error = e instanceof extensionManagement_1.ExtensionManagementError ? e : new extensionManagement_1.ExtensionManagementError((0, errors_1.getErrorMessage)(e), extensionManagement_1.ExtensionManagementErrorCode.Internal);
                for (const task of allTasks) {
                    // cancel the tasks
                    try {
                        task.cancel();
                    }
                    catch (error) { /* ignore */ }
                    if (!processedTasks.includes(task)) {
                        postUninstallExtension(task.extension, error);
                    }
                }
                throw error;
            }
            finally {
                // Remove tasks from cache
                for (const task of allTasks) {
                    if (!this.uninstallingExtensions.delete(getUninstallExtensionTaskKey(task.extension.identifier))) {
                        this.logService.warn('Uninstallation task is not found in the cache', task.extension.identifier.id);
                    }
                }
            }
        }
        checkForDependents(extensionsToUninstall, installed, extensionToUninstall) {
            for (const extension of extensionsToUninstall) {
                const dependents = this.getDependents(extension, installed);
                if (dependents.length) {
                    const remainingDependents = dependents.filter(dependent => !extensionsToUninstall.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, dependent.identifier)));
                    if (remainingDependents.length) {
                        throw new Error(this.getDependentsErrorMessage(extension, remainingDependents, extensionToUninstall));
                    }
                }
            }
        }
        getDependentsErrorMessage(dependingExtension, dependents, extensionToUninstall) {
            if (extensionToUninstall === dependingExtension) {
                if (dependents.length === 1) {
                    return nls.localize('singleDependentError', "Cannot uninstall '{0}' extension. '{1}' extension depends on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
                }
                if (dependents.length === 2) {
                    return nls.localize('twoDependentsError', "Cannot uninstall '{0}' extension. '{1}' and '{2}' extensions depend on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
                }
                return nls.localize('multipleDependentsError', "Cannot uninstall '{0}' extension. '{1}', '{2}' and other extension depend on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            if (dependents.length === 1) {
                return nls.localize('singleIndirectDependentError', "Cannot uninstall '{0}' extension . It includes uninstalling '{1}' extension and '{2}' extension depends on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                    || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
            }
            if (dependents.length === 2) {
                return nls.localize('twoIndirectDependentsError', "Cannot uninstall '{0}' extension. It includes uninstalling '{1}' extension and '{2}' and '{3}' extensions depend on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                    || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            return nls.localize('multipleIndirectDependentsError', "Cannot uninstall '{0}' extension. It includes uninstalling '{1}' extension and '{2}', '{3}' and other extensions depend on this.", extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        }
        getAllPackExtensionsToUninstall(extension, installed, checked = []) {
            if (checked.indexOf(extension) !== -1) {
                return [];
            }
            checked.push(extension);
            const extensionsPack = extension.manifest.extensionPack ? extension.manifest.extensionPack : [];
            if (extensionsPack.length) {
                const packedExtensions = installed.filter(i => !i.isBuiltin && extensionsPack.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, i.identifier)));
                const packOfPackedExtensions = [];
                for (const packedExtension of packedExtensions) {
                    packOfPackedExtensions.push(...this.getAllPackExtensionsToUninstall(packedExtension, installed, checked));
                }
                return [...packedExtensions, ...packOfPackedExtensions];
            }
            return [];
        }
        getDependents(extension, installed) {
            return installed.filter(e => e.manifest.extensionDependencies && e.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)));
        }
        async updateControlCache() {
            try {
                this.logService.trace('ExtensionManagementService.refreshReportedCache');
                const manifest = await this.galleryService.getExtensionsControlManifest();
                this.logService.trace(`ExtensionManagementService.refreshControlCache`, manifest);
                return manifest;
            }
            catch (err) {
                this.logService.trace('ExtensionManagementService.refreshControlCache - failed to get extension control manifest');
                return { malicious: [], deprecated: {}, search: [] };
            }
        }
    };
    exports.AbstractExtensionManagementService = AbstractExtensionManagementService;
    exports.AbstractExtensionManagementService = AbstractExtensionManagementService = __decorate([
        __param(0, extensionManagement_1.IExtensionGalleryService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, log_1.ILogService),
        __param(4, productService_1.IProductService),
        __param(5, userDataProfile_1.IUserDataProfilesService)
    ], AbstractExtensionManagementService);
    function joinErrors(errorOrErrors) {
        const errors = Array.isArray(errorOrErrors) ? errorOrErrors : [errorOrErrors];
        if (errors.length === 1) {
            return errors[0] instanceof Error ? errors[0] : new Error(errors[0]);
        }
        return errors.reduce((previousValue, currentValue) => {
            return new Error(`${previousValue.message}${previousValue.message ? ',' : ''}${currentValue instanceof Error ? currentValue.message : currentValue}`);
        }, new Error(''));
    }
    exports.joinErrors = joinErrors;
    function toExtensionManagementError(error) {
        if (error instanceof extensionManagement_1.ExtensionManagementError) {
            return error;
        }
        if (error instanceof extensionManagement_1.ExtensionGalleryError) {
            const e = new extensionManagement_1.ExtensionManagementError(error.message, extensionManagement_1.ExtensionManagementErrorCode.Gallery);
            e.stack = error.stack;
            return e;
        }
        const e = new extensionManagement_1.ExtensionManagementError(error.message, extensionManagement_1.ExtensionManagementErrorCode.Internal);
        e.stack = error.stack;
        return e;
    }
    exports.toExtensionManagementError = toExtensionManagementError;
    function reportTelemetry(telemetryService, eventName, { extensionData, verificationStatus, duration, error, durationSinceUpdate }) {
        let errorcode;
        let errorcodeDetail;
        if ((0, types_1.isDefined)(verificationStatus)) {
            if (verificationStatus === true) {
                verificationStatus = 'Verified';
            }
            else if (verificationStatus === false) {
                verificationStatus = 'Unverified';
            }
            else {
                errorcode = extensionManagement_1.ExtensionManagementErrorCode.Signature;
                errorcodeDetail = verificationStatus;
                verificationStatus = 'Unverified';
            }
        }
        if (error) {
            if (error instanceof extensionManagement_1.ExtensionManagementError || error instanceof extensionManagement_1.ExtensionGalleryError) {
                errorcode = error.code;
                if (error.code === extensionManagement_1.ExtensionManagementErrorCode.Signature) {
                    errorcodeDetail = error.message;
                }
            }
            else {
                errorcode = extensionManagement_1.ExtensionManagementErrorCode.Internal;
            }
        }
        /* __GDPR__
            "extensionGallery:install" : {
                "owner": "sandy081",
                "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "durationSinceUpdate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "errorcode": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "errorcodeDetail": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "recommendationReason": { "retiredFromVersion": "1.23.0", "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "verificationStatus" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
        */
        /* __GDPR__
            "extensionGallery:uninstall" : {
                "owner": "sandy081",
                "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "errorcode": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
        */
        /* __GDPR__
            "extensionGallery:update" : {
                "owner": "sandy081",
                "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                "errorcode": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "errorcodeDetail": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                "verificationStatus" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
        */
        telemetryService.publicLog(eventName, { ...extensionData, verificationStatus, success: !error, duration, errorcode, errorcodeDetail, durationSinceUpdate });
    }
    class AbstractExtensionTask {
        constructor() {
            this.barrier = new async_1.Barrier();
        }
        async waitUntilTaskIsFinished() {
            await this.barrier.wait();
            return this.cancellablePromise;
        }
        async run() {
            if (!this.cancellablePromise) {
                this.cancellablePromise = (0, async_1.createCancelablePromise)(token => this.doRun(token));
            }
            this.barrier.open();
            return this.cancellablePromise;
        }
        cancel() {
            if (!this.cancellablePromise) {
                this.cancellablePromise = (0, async_1.createCancelablePromise)(token => {
                    return new Promise((c, e) => {
                        const disposable = token.onCancellationRequested(() => {
                            disposable.dispose();
                            e(new errors_1.CancellationError());
                        });
                    });
                });
                this.barrier.open();
            }
            this.cancellablePromise.cancel();
        }
    }
    exports.AbstractExtensionTask = AbstractExtensionTask;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RFeHRlbnNpb25NYW5hZ2VtZW50U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vYWJzdHJhY3RFeHRlbnNpb25NYW5hZ2VtZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpRHpGLElBQWUsa0NBQWtDLEdBQWpELE1BQWUsa0NBQW1DLFNBQVEsc0JBQVU7UUFVMUUsSUFBSSxrQkFBa0IsS0FBSyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBR25FLElBQUksc0JBQXNCLEtBQUssT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUczRSxJQUFJLG9CQUFvQixLQUFLLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFHdkUsSUFBSSx1QkFBdUIsS0FBSyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRzdFLElBQUksNEJBQTRCLEtBQUssT0FBTyxJQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUl2RixZQUMyQixjQUEyRCxFQUNsRSxnQkFBc0QsRUFDcEQsa0JBQTBELEVBQ2xFLFVBQTBDLEVBQ3RDLGNBQWtELEVBQ3pDLHVCQUFvRTtZQUU5RixLQUFLLEVBQUUsQ0FBQztZQVBxQyxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNqQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQy9DLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDbkIsbUJBQWMsR0FBZCxjQUFjLENB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
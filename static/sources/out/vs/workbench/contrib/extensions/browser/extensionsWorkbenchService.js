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
define(["require", "exports", "vs/nls", "vs/base/common/semver/semver", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/paging", "vs/platform/telemetry/common/telemetry", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/workbench/services/host/browser/host", "vs/base/common/uri", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/editor/common/editorService", "vs/platform/url/common/url", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/platform/notification/common/notification", "vs/base/common/resources", "vs/base/common/cancellation", "vs/platform/storage/common/storage", "vs/platform/files/common/files", "vs/platform/extensions/common/extensions", "vs/editor/common/languages/language", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionEditor", "vs/base/common/platform", "vs/platform/languagePacks/common/languagePacks", "vs/workbench/services/localization/common/locale", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/browser/window"], function (require, exports, nls, semver, event_1, arrays_1, async_1, errors_1, lifecycle_1, paging_1, telemetry_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, instantiation_1, configuration_1, host_1, uri_1, extensions_1, editorService_1, url_1, extensionsInput_1, log_1, progress_1, notification_1, resources, cancellation_1, storage_1, files_1, extensions_2, language_1, productService_1, network_1, ignoredExtensions_1, userDataSync_1, contextkey_1, types_1, extensionManifestPropertiesService_1, extensions_3, extensionEditor_1, platform_1, languagePacks_1, locale_1, telemetryUtils_1, lifecycle_2, userDataProfile_1, window_1) {
    "use strict";
    var Extensions_1, ExtensionsWorkbenchService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsWorkbenchService = exports.Extension = void 0;
    let Extension = class Extension {
        constructor(stateProvider, runtimeStateProvider, server, local, gallery, galleryService, telemetryService, logService, fileService, productService) {
            this.stateProvider = stateProvider;
            this.runtimeStateProvider = runtimeStateProvider;
            this.server = server;
            this.local = local;
            this.gallery = gallery;
            this.galleryService = galleryService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.fileService = fileService;
            this.productService = productService;
            this.enablementState = 8 /* EnablementState.EnabledGlobally */;
            this.isMalicious = false;
        }
        get type() {
            return this.local ? this.local.type : 1 /* ExtensionType.User */;
        }
        get isBuiltin() {
            return this.local ? this.local.isBuiltin : false;
        }
        get name() {
            return this.gallery ? this.gallery.name : this.local.manifest.name;
        }
        get displayName() {
            if (this.gallery) {
                return this.gallery.displayName || this.gallery.name;
            }
            return this.local.manifest.displayName || this.local.manifest.name;
        }
        get identifier() {
            if (this.gallery) {
                return this.gallery.identifier;
            }
            return this.local.identifier;
        }
        get uuid() {
            return this.gallery ? this.gallery.identifier.uuid : this.local.identifier.uuid;
        }
        get publisher() {
            return this.gallery ? this.gallery.publisher : this.local.manifest.publisher;
        }
        get publisherDisplayName() {
            if (this.gallery) {
                return this.gallery.publisherDisplayName || this.gallery.publisher;
            }
            if (this.local?.publisherDisplayName) {
                return this.local.publisherDisplayName;
            }
            return this.local.manifest.publisher;
        }
        get publisherUrl() {
            if (!this.productService.extensionsGallery || !this.gallery) {
                return undefined;
            }
            return resources.joinPath(uri_1.URI.parse(this.productService.extensionsGallery.publisherUrl), this.publisher);
        }
        get publisherDomain() {
            return this.gallery?.publisherDomain;
        }
        get publisherSponsorLink() {
            return this.gallery?.publisherSponsorLink ? uri_1.URI.parse(this.gallery.publisherSponsorLink) : undefined;
        }
        get version() {
            return this.local ? this.local.manifest.version : this.latestVersion;
        }
        get pinned() {
            return !!this.local?.pinned;
        }
        get latestVersion() {
            return this.gallery ? this.gallery.version : this.local.manifest.version;
        }
        get description() {
            return this.gallery ? this.gallery.description : this.local.manifest.description || '';
        }
        get url() {
            if (!this.productService.extensionsGallery || !this.gallery) {
                return undefined;
            }
            return `${this.productService.extensionsGallery.itemUrl}?itemName=${this.publisher}.${this.name}`;
        }
        get iconUrl() {
            return this.galleryIconUrl || this.localIconUrl || this.defaultIconUrl;
        }
        get iconUrlFallback() {
            return this.galleryIconUrlFallback || this.localIconUrl || this.defaultIconUrl;
        }
        get localIconUrl() {
            if (this.local && this.local.manifest.icon) {
                return network_1.FileAccess.uriToBrowserUri(resources.joinPath(this.local.location, this.local.manifest.icon)).toString(true);
            }
            return null;
        }
        get galleryIconUrl() {
            return this.gallery?.assets.icon ? this.gallery.assets.icon.uri : null;
        }
        get galleryIconUrlFallback() {
            return this.gallery?.assets.icon ? this.gallery.assets.icon.fallbackUri : null;
        }
        get defaultIconUrl() {
            if (this.type === 0 /* ExtensionType.System */ && this.local) {
                if (this.local.manifest && this.local.manifest.contributes) {
                    if (Array.isArray(this.local.manifest.contributes.themes) && this.local.manifest.contributes.themes.length) {
                        return network_1.FileAccess.asBrowserUri('vs/workbench/contrib/extensions/browser/media/theme-icon.png').toString(true);
                    }
                    if (Array.isArray(this.local.manifest.contributes.grammars) && this.local.manifest.contributes.grammars.length) {
                        return network_1.FileAccess.asBrowserUri('vs/workbench/contrib/extensions/browser/media/language-icon.svg').toString(true);
                    }
                }
            }
            return extensionManagement_2.DefaultIconPath;
        }
        get repository() {
            return this.gallery && this.gallery.assets.repository ? this.gallery.assets.repository.uri : undefined;
        }
        get licenseUrl() {
            return this.gallery && this.gallery.assets.license ? this.gallery.assets.license.uri : undefined;
        }
        get supportUrl() {
            return this.gallery && this.gallery.supportLink ? this.gallery.supportLink : undefined;
        }
        get state() {
            return this.stateProvider(this);
        }
        get installCount() {
            return this.gallery ? this.gallery.installCount : undefined;
        }
        get rating() {
            return this.gallery ? this.gallery.rating : undefined;
        }
        get ratingCount() {
            return this.gallery ? this.gallery.ratingCount : undefined;
        }
        get outdated() {
            try {
                if (!this.gallery || !this.local) {
                    return false;
                }
                // Do not allow updating system extensions in stable
                if (this.type === 0 /* ExtensionType.System */ && this.productService.quality === 'stable') {
                    return false;
                }
                if (!this.local.preRelease && this.gallery.properties.isPreReleaseVersion) {
                    return false;
                }
                if (semver.gt(this.latestVersion, this.version)) {
                    return true;
                }
                if (this.outdatedTargetPlatform) {
                    return true;
                }
            }
            catch (error) {
                /* Ignore */
            }
            return false;
        }
        get outdatedTargetPlatform() {
            return !!this.local && !!this.gallery
                && !["undefined" /* TargetPlatform.UNDEFINED */, "web" /* TargetPlatform.WEB */].includes(this.local.targetPlatform)
                && this.gallery.properties.targetPlatform !== "web" /* TargetPlatform.WEB */
                && this.local.targetPlatform !== this.gallery.properties.targetPlatform
                && semver.eq(this.latestVersion, this.version);
        }
        get reloadRequiredStatus() {
            return this.runtimeStateProvider(this);
        }
        get telemetryData() {
            const { local, gallery } = this;
            if (gallery) {
                return (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(gallery);
            }
            else {
                return (0, extensionManagementUtil_1.getLocalExtensionTelemetryData)(local);
            }
        }
        get preview() {
            return this.local?.manifest.preview ?? this.gallery?.preview ?? false;
        }
        get preRelease() {
            return !!this.local?.preRelease;
        }
        get isPreReleaseVersion() {
            if (this.local) {
                return this.local.isPreReleaseVersion;
            }
            return !!this.gallery?.properties.isPreReleaseVersion;
        }
        get hasPreReleaseVersion() {
            return !!this.gallery?.hasPreReleaseVersion || !!this.local?.hasPreReleaseVersion;
        }
        get hasReleaseVersion() {
            return !!this.gallery?.hasReleaseVersion;
        }
        getLocal() {
            return this.local && !this.outdated ? this.local : undefined;
        }
        async getManifest(token) {
            const local = this.getLocal();
            if (local) {
                return local.manifest;
            }
            if (this.gallery) {
                if (this.gallery.assets.manifest) {
                    return this.galleryService.getManifest(this.gallery, token);
                }
                this.logService.error(nls.localize('Manifest is not found', "Manifest is not found"), this.identifier.id);
                return null;
            }
            return null;
        }
        hasReadme() {
            if (this.local && this.local.readmeUrl) {
                return true;
            }
            if (this.gallery && this.gallery.assets.readme) {
                return true;
            }
            return this.type === 0 /* ExtensionType.System */;
        }
        async getReadme(token) {
            const local = this.getLocal();
            if (local?.readmeUrl) {
                const content = await this.fileService.readFile(local.readmeUrl);
                return content.value.toString();
            }
            if (this.gallery) {
                if (this.gallery.assets.readme) {
                    return this.galleryService.getReadme(this.gallery, token);
                }
                this.telemetryService.publicLog('extensions:NotFoundReadMe', this.telemetryData);
            }
            if (this.type === 0 /* ExtensionType.System */) {
                return Promise.resolve(`# ${this.displayName || this.name}
**Notice:** This extension is bundled with Visual Studio Code. It can be disabled but not uninstalled.
## Features
${this.description}
`);
            }
            return Promise.reject(new Error('not available'));
        }
        hasChangelog() {
            if (this.local && this.local.changelogUrl) {
                return true;
            }
            if (this.gallery && this.gallery.assets.changelog) {
                return true;
            }
            return this.type === 0 /* ExtensionType.System */;
        }
        async getChangelog(token) {
            const local = this.getLocal();
            if (local?.changelogUrl) {
                const content = await this.fileService.readFile(local.changelogUrl);
                return content.value.toString();
            }
            if (this.gallery?.assets.changelog) {
                return this.galleryService.getChangelog(this.gallery, token);
            }
            if (this.type === 0 /* ExtensionType.System */) {
                return Promise.resolve('Please check the [VS Code Release Notes](command:update.showCurrentReleaseNotes) for changes to the built-in extensions.');
            }
            return Promise.reject(new Error('not available'));
        }
        get categories() {
            const { local, gallery } = this;
            if (local && local.manifest.categories && !this.outdated) {
                return local.manifest.categories;
            }
            if (gallery) {
                return gallery.categories;
            }
            return [];
        }
        get tags() {
            const { gallery } = this;
            if (gallery) {
                return gallery.tags.filter(tag => !tag.startsWith('_'));
            }
            return [];
        }
        get dependencies() {
            const { local, gallery } = this;
            if (local && local.manifest.extensionDependencies && !this.outdated) {
                return local.manifest.extensionDependencies;
            }
            if (gallery) {
                return gallery.properties.dependencies || [];
            }
            return [];
        }
        get extensionPack() {
            const { local, gallery } = this;
            if (local && local.manifest.extensionPack && !this.outdated) {
                return local.manifest.extensionPack;
            }
            if (gallery) {
                return gallery.properties.extensionPack || [];
            }
            return [];
        }
    };
    exports.Extension = Extension;
    exports.Extension = Extension = __decorate([
        __param(5, extensionManagement_1.IExtensionGalleryService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, log_1.ILogService),
        __param(8, files_1.IFileService),
        __param(9, productService_1.IProductService)
    ], Extension);
    const EXTENSIONS_AUTO_UPDATE_KEY = 'extensions.autoUpdate';
    let Extensions = Extensions_1 = class Extensions extends lifecycle_1.Disposable {
        static updateExtensionFromControlManifest(extension, extensionsControlManifest) {
            extension.isMalicious = extensionsControlManifest.malicious.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, identifier));
            extension.deprecationInfo = extensionsControlManifest.deprecated ? extensionsControlManifest.deprecated[extension.identifier.id.toLowerCase()] : undefined;
        }
        get onChange() { return this._onChange.event; }
        get onReset() { return this._onReset.event; }
        constructor(server, stateProvider, runtimeStateProvider, galleryService, extensionEnablementService, telemetryService, instantiationService) {
            super();
            this.server = server;
            this.stateProvider = stateProvider;
            this.runtimeStateProvider = runtimeStateProvider;
            this.galleryService = galleryService;
            this.extensionEnablementService = extensionEnablementService;
            this.telemetryService = telemetryService;
            this.instantiationService = instantiationService;
            this._onChange = this._register(new event_1.Emitter());
            this._onReset = this._register(new event_1.Emitter());
            this.installing = [];
            this.uninstalling = [];
            this.installed = [];
            this._register(server.extensionManagementService.onInstallExtension(e => this.onInstallExtension(e)));
            this._register(server.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
            this._register(server.extensionManagementService.onUninstallExtension(e => this.onUninstallExtension(e.identifier)));
            this._register(server.extensionManagementService.onDidUninstallExtension(e => this.onDidUninstallExtension(e)));
            this._register(server.extensionManagementService.onDidUpdateExtensionMetadata(e => this.onDidUpdateExtensionMetadata(e)));
            this._register(server.extensionManagementService.onDidChangeProfile(() => this.reset()));
            this._register(extensionEnablementService.onEnablementChanged(e => this.onEnablementChanged(e)));
            this._register(event_1.Event.any(this.onChange, this.onReset)(() => this._local = undefined));
        }
        get local() {
            if (!this._local) {
                this._local = [];
                for (const extension of this.installed) {
                    this._local.push(extension);
                }
                for (const extension of this.installing) {
                    if (!this.installed.some(installed => (0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, extension.identifier))) {
                        this._local.push(extension);
                    }
                }
            }
            return this._local;
        }
        async queryInstalled() {
            await this.fetchInstalledExtensions();
            this._onChange.fire(undefined);
            return this.local;
        }
        async syncInstalledExtensionsWithGallery(galleryExtensions) {
            let hasChanged = false;
            const extensions = await this.mapInstalledExtensionWithCompatibleGalleryExtension(galleryExtensions);
            for (const [extension, gallery] of extensions) {
                // update metadata of the extension if it does not exist
                if (extension.local && !extension.local.identifier.uuid) {
                    extension.local = await this.updateMetadata(extension.local, gallery);
                }
                if (!extension.gallery || extension.gallery.version !== gallery.version || extension.gallery.properties.targetPlatform !== gallery.properties.targetPlatform) {
                    extension.gallery = gallery;
                    this._onChange.fire({ extension });
                    hasChanged = true;
                }
            }
            return hasChanged;
        }
        async mapInstalledExtensionWithCompatibleGalleryExtension(galleryExtensions) {
            const mappedExtensions = this.mapInstalledExtensionWithGalleryExtension(galleryExtensions);
            const targetPlatform = await this.server.extensionManagementService.getTargetPlatform();
            const compatibleGalleryExtensions = [];
            const compatibleGalleryExtensionsToFetch = [];
            await Promise.allSettled(mappedExtensions.map(async ([extension, gallery]) => {
                if (extension.local) {
                    if (await this.galleryService.isExtensionCompatible(gallery, extension.local.preRelease, targetPlatform)) {
                        compatibleGalleryExtensions.push(gallery);
                    }
                    else {
                        compatibleGalleryExtensionsToFetch.push({ ...extension.local.identifier, preRelease: extension.local.preRelease });
                    }
                }
            }));
            if (compatibleGalleryExtensionsToFetch.length) {
                const result = await this.galleryService.getExtensions(compatibleGalleryExtensionsToFetch, { targetPlatform, compatible: true, queryAllVersions: true }, cancellation_1.CancellationToken.None);
                compatibleGalleryExtensions.push(...result);
            }
            return this.mapInstalledExtensionWithGalleryExtension(compatibleGalleryExtensions);
        }
        mapInstalledExtensionWithGalleryExtension(galleryExtensions) {
            const mappedExtensions = [];
            const byUUID = new Map(), byID = new Map();
            for (const gallery of galleryExtensions) {
                byUUID.set(gallery.identifier.uuid, gallery);
                byID.set(gallery.identifier.id.toLowerCase(), gallery);
            }
            for (const installed of this.installed) {
                if (installed.uuid) {
                    const gallery = byUUID.get(installed.uuid);
                    if (gallery) {
                        mappedExtensions.push([installed, gallery]);
                        continue;
                    }
                }
                const gallery = byID.get(installed.identifier.id.toLowerCase());
                if (gallery) {
                    mappedExtensions.push([installed, gallery]);
                }
            }
            return mappedExtensions;
        }
        async updateMetadata(localExtension, gallery) {
            let isPreReleaseVersion = false;
            if (localExtension.manifest.version !== gallery.version) {
                this.telemetryService.publicLog2('galleryService:updateMetadata');
                const galleryWithLocalVersion = (await this.galleryService.getExtensions([{ ...localExtension.identifier, version: localExtension.manifest.version }], cancellation_1.CancellationToken.None))[0];
                isPreReleaseVersion = !!galleryWithLocalVersion?.properties?.isPreReleaseVersion;
            }
            return this.server.extensionManagementService.updateMetadata(localExtension, { id: gallery.identifier.uuid, publisherDisplayName: gallery.publisherDisplayName, publisherId: gallery.publisherId, isPreReleaseVersion });
        }
        canInstall(galleryExtension) {
            return this.server.extensionManagementService.canInstall(galleryExtension);
        }
        onInstallExtension(event) {
            const { source } = event;
            if (source && !uri_1.URI.isUri(source)) {
                const extension = this.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, source.identifier))[0]
                    || this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, undefined, source);
                this.installing.push(extension);
                this._onChange.fire({ extension });
            }
        }
        async fetchInstalledExtensions() {
            const extensionsControlManifest = await this.server.extensionManagementService.getExtensionsControlManifest();
            const all = await this.server.extensionManagementService.getInstalled();
            // dedup user and system extensions by giving priority to user extensions.
            const installed = (0, extensionManagementUtil_1.groupByExtension)(all, r => r.identifier).reduce((result, extensions) => {
                const extension = extensions.length === 1 ? extensions[0]
                    : extensions.find(e => e.type === 1 /* ExtensionType.User */) || extensions.find(e => e.type === 0 /* ExtensionType.System */);
                result.push(extension);
                return result;
            }, []);
            const byId = (0, arrays_1.index)(this.installed, e => e.local ? e.local.identifier.id : e.identifier.id);
            this.installed = installed.map(local => {
                const extension = byId[local.identifier.id] || this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, local, undefined);
                extension.local = local;
                extension.enablementState = this.extensionEnablementService.getEnablementState(local);
                Extensions_1.updateExtensionFromControlManifest(extension, extensionsControlManifest);
                return extension;
            });
        }
        async reset() {
            this.installed = [];
            this.installing = [];
            this.uninstalling = [];
            await this.fetchInstalledExtensions();
            this._onReset.fire();
        }
        async onDidInstallExtensions(results) {
            for (const event of results) {
                const { local, source } = event;
                const gallery = source && !uri_1.URI.isUri(source) ? source : undefined;
                const location = source && uri_1.URI.isUri(source) ? source : undefined;
                const installingExtension = gallery ? this.installing.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, gallery.identifier))[0] : null;
                this.installing = installingExtension ? this.installing.filter(e => e !== installingExtension) : this.installing;
                let extension = installingExtension ? installingExtension
                    : (location || local) ? this.instantiationService.createInstance(Extension, this.stateProvider, this.runtimeStateProvider, this.server, local, undefined)
                        : undefined;
                if (extension) {
                    if (local) {
                        const installed = this.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0];
                        if (installed) {
                            extension = installed;
                        }
                        else {
                            this.installed.push(extension);
                        }
                        extension.local = local;
                        if (!extension.gallery) {
                            extension.gallery = gallery;
                        }
                        Extensions_1.updateExtensionFromControlManifest(extension, await this.server.extensionManagementService.getExtensionsControlManifest());
                        extension.enablementState = this.extensionEnablementService.getEnablementState(local);
                    }
                }
                this._onChange.fire(!local || !extension ? undefined : { extension, operation: event.operation });
                if (extension && extension.local && !extension.gallery) {
                    await this.syncInstalledExtensionWithGallery(extension);
                }
            }
        }
        async onDidUpdateExtensionMetadata(local) {
            const extension = this.installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, local.identifier));
            if (extension?.local) {
                const hasChanged = extension.local.pinned !== local.pinned
                    || extension.local.preRelease !== local.preRelease;
                extension.local = local;
                if (hasChanged) {
                    this._onChange.fire({ extension });
                }
            }
        }
        async syncInstalledExtensionWithGallery(extension) {
            if (!this.galleryService.isEnabled()) {
                return;
            }
            this.telemetryService.publicLog2('galleryService:matchInstalledExtension');
            const [compatible] = await this.galleryService.getExtensions([{ ...extension.identifier, preRelease: extension.local?.preRelease }], { compatible: true, targetPlatform: await this.server.extensionManagementService.getTargetPlatform() }, cancellation_1.CancellationToken.None);
            if (compatible) {
                extension.gallery = compatible;
                this._onChange.fire({ extension });
            }
        }
        onUninstallExtension(identifier) {
            const extension = this.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier))[0];
            if (extension) {
                const uninstalling = this.uninstalling.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier))[0] || extension;
                this.uninstalling = [uninstalling, ...this.uninstalling.filter(e => !(0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier))];
                this._onChange.fire(uninstalling ? { extension: uninstalling } : undefined);
            }
        }
        onDidUninstallExtension({ identifier, error }) {
            const uninstalled = this.uninstalling.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier)) || this.installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier));
            this.uninstalling = this.uninstalling.filter(e => !(0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier));
            if (!error) {
                this.installed = this.installed.filter(e => !(0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier));
            }
            if (uninstalled) {
                this._onChange.fire({ extension: uninstalled });
            }
        }
        onEnablementChanged(platformExtensions) {
            const extensions = this.local.filter(e => platformExtensions.some(p => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, p.identifier)));
            for (const extension of extensions) {
                if (extension.local) {
                    const enablementState = this.extensionEnablementService.getEnablementState(extension.local);
                    if (enablementState !== extension.enablementState) {
                        extension.enablementState = enablementState;
                        this._onChange.fire({ extension: extension });
                    }
                }
            }
        }
        getExtensionState(extension) {
            if (extension.gallery && this.installing.some(e => !!e.gallery && (0, extensionManagementUtil_1.areSameExtensions)(e.gallery.identifier, extension.gallery.identifier))) {
                return 0 /* ExtensionState.Installing */;
            }
            if (this.uninstalling.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))) {
                return 2 /* ExtensionState.Uninstalling */;
            }
            const local = this.installed.filter(e => e === extension || (e.gallery && extension.gallery && (0, extensionManagementUtil_1.areSameExtensions)(e.gallery.identifier, extension.gallery.identifier)))[0];
            return local ? 1 /* ExtensionState.Installed */ : 3 /* ExtensionState.Uninstalled */;
        }
    };
    Extensions = Extensions_1 = __decorate([
        __param(3, extensionManagement_1.IExtensionGalleryService),
        __param(4, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, instantiation_1.IInstantiationService)
    ], Extensions);
    let ExtensionsWorkbenchService = class ExtensionsWorkbenchService extends lifecycle_1.Disposable {
        static { ExtensionsWorkbenchService_1 = this; }
        static { this.UpdatesCheckInterval = 1000 * 60 * 60 * 12; } // 12 hours
        get onChange() { return this._onChange.event; }
        get onReset() { return this._onReset.event; }
        constructor(instantiationService, editorService, extensionManagementService, galleryService, configurationService, telemetryService, notificationService, urlService, extensionEnablementService, hostService, progressService, extensionManagementServerService, languageService, extensionsSyncManagementService, userDataAutoSyncService, productService, contextKeyService, extensionManifestPropertiesService, logService, extensionService, localeService, lifecycleService, fileService, userDataProfileService, storageService) {
            super();
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.extensionManagementService = extensionManagementService;
            this.galleryService = galleryService;
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.notificationService = notificationService;
            this.extensionEnablementService = extensionEnablementService;
            this.hostService = hostService;
            this.progressService = progressService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.languageService = languageService;
            this.extensionsSyncManagementService = extensionsSyncManagementService;
            this.userDataAutoSyncService = userDataAutoSyncService;
            this.productService = productService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.logService = logService;
            this.extensionService = extensionService;
            this.localeService = localeService;
            this.lifecycleService = lifecycleService;
            this.fileService = fileService;
            this.userDataProfileService = userDataProfileService;
            this.storageService = storageService;
            this.localExtensions = null;
            this.remoteExtensions = null;
            this.webExtensions = null;
            this.extensionsServers = [];
            this._onChange = new event_1.Emitter();
            this._onReset = new event_1.Emitter();
            this.preferPreReleases = this.productService.quality !== 'stable';
            this.installing = [];
            this.tasksInProgress = [];
            const preferPreReleasesValue = configurationService.getValue('_extensions.preferPreReleases');
            if (!(0, types_1.isUndefined)(preferPreReleasesValue)) {
                this.preferPreReleases = !!preferPreReleasesValue;
            }
            this.hasOutdatedExtensionsContextKey = extensions_1.HasOutdatedExtensionsContext.bindTo(contextKeyService);
            if (extensionManagementServerService.localExtensionManagementServer) {
                this.localExtensions = this._register(instantiationService.createInstance(Extensions, extensionManagementServerService.localExtensionManagementServer, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext)));
                this._register(this.localExtensions.onChange(e => this.onDidChangeExtensions(e?.extension)));
                this._register(this.localExtensions.onReset(e => this.reset()));
                this.extensionsServers.push(this.localExtensions);
            }
            if (extensionManagementServerService.remoteExtensionManagementServer) {
                this.remoteExtensions = this._register(instantiationService.createInstance(Extensions, extensionManagementServerService.remoteExtensionManagementServer, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext)));
                this._register(this.remoteExtensions.onChange(e => this.onDidChangeExtensions(e?.extension)));
                this._register(this.remoteExtensions.onReset(e => this.reset()));
                this.extensionsServers.push(this.remoteExtensions);
            }
            if (extensionManagementServerService.webExtensionManagementServer) {
                this.webExtensions = this._register(instantiationService.createInstance(Extensions, extensionManagementServerService.webExtensionManagementServer, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext)));
                this._register(this.webExtensions.onChange(e => this.onDidChangeExtensions(e?.extension)));
                this._register(this.webExtensions.onReset(e => this.reset()));
                this.extensionsServers.push(this.webExtensions);
            }
            this.updatesCheckDelayer = new async_1.ThrottledDelayer(ExtensionsWorkbenchService_1.UpdatesCheckInterval);
            this.autoUpdateDelayer = new async_1.ThrottledDelayer(1000);
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.updatesCheckDelayer.cancel();
                this.autoUpdateDelayer.cancel();
            }));
            urlService.registerHandler(this);
            this.whenInitialized = this.initialize();
        }
        async initialize() {
            // initialize local extensions
            await Promise.all([this.queryLocal(), this.extensionService.whenInstalledExtensionsRegistered()]);
            if (this._store.isDisposed) {
                return;
            }
            this.onDidChangeRunningExtensions(this.extensionService.extensions, []);
            this._register(this.extensionService.onDidChangeExtensions(({ added, removed }) => this.onDidChangeRunningExtensions(added, removed)));
            await this.lifecycleService.when(4 /* LifecyclePhase.Eventually */);
            if (this._store.isDisposed) {
                return;
            }
            this.initializeAutoUpdate();
            this.reportInstalledExtensionsTelemetry();
            this._register(event_1.Event.debounce(this.onChange, () => undefined, 100)(() => this.reportProgressFromOtherSources()));
            this._register(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, EXTENSIONS_AUTO_UPDATE_KEY, this._store)(e => this.onDidSelectedExtensionToAutoUpdateValueChange(false)));
        }
        initializeAutoUpdate() {
            // Register listeners for auto updates
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(extensions_1.AutoUpdateConfigurationKey)) {
                    this.onDidAutoUpdateConfigurationChange();
                }
                if (e.affectsConfiguration(extensions_1.AutoCheckUpdatesConfigurationKey)) {
                    if (this.isAutoCheckUpdatesEnabled()) {
                        this.checkForUpdates();
                    }
                }
            }));
            this._register(this.extensionEnablementService.onEnablementChanged(platformExtensions => {
                if (this.getAutoUpdateValue() === 'onlyEnabledExtensions' && platformExtensions.some(e => this.extensionEnablementService.isEnabled(e))) {
                    this.checkForUpdates();
                }
            }));
            this._register(event_1.Event.debounce(this.onChange, () => undefined, 100)(() => this.hasOutdatedExtensionsContextKey.set(this.outdated.length > 0)));
            // Update AutoUpdate Contexts
            this.hasOutdatedExtensionsContextKey.set(this.outdated.length > 0);
            // Check for updates
            this.eventuallyCheckForUpdates(true);
            if (platform_1.isWeb) {
                this.syncPinnedBuiltinExtensions();
                // Always auto update builtin extensions in web
                if (!this.isAutoUpdateEnabled()) {
                    this.autoUpdateBuiltinExtensions();
                }
            }
        }
        reportInstalledExtensionsTelemetry() {
            const extensionIds = this.installed.filter(extension => !extension.isBuiltin &&
                (extension.enablementState === 9 /* EnablementState.EnabledWorkspace */ ||
                    extension.enablementState === 8 /* EnablementState.EnabledGlobally */))
                .map(extension => extensions_2.ExtensionIdentifier.toKey(extension.identifier.id));
            this.telemetryService.publicLog2('installedExtensions', { extensionIds: new telemetryUtils_1.TelemetryTrustedValue(extensionIds.join(';')), count: extensionIds.length });
        }
        async onDidChangeRunningExtensions(added, removed) {
            const changedExtensions = [];
            const extsNotInstalled = [];
            for (const desc of added) {
                const extension = this.installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: desc.identifier.value, uuid: desc.uuid }, e.identifier));
                if (extension) {
                    changedExtensions.push(extension);
                }
                else {
                    extsNotInstalled.push({ id: desc.identifier.value, uuid: desc.uuid });
                }
            }
            if (extsNotInstalled.length) {
                const extensions = await this.getExtensions(extsNotInstalled, cancellation_1.CancellationToken.None);
                for (const extension of extensions) {
                    changedExtensions.push(extension);
                }
            }
            for (const changedExtension of changedExtensions) {
                this._onChange.fire(changedExtension);
            }
        }
        reset() {
            for (const task of this.tasksInProgress) {
                task.cancel();
            }
            this.tasksInProgress = [];
            this.installing = [];
            this.onDidChangeExtensions();
            this._onReset.fire();
        }
        onDidChangeExtensions(extension) {
            this._installed = undefined;
            this._local = undefined;
            this._onChange.fire(extension);
        }
        get local() {
            if (!this._local) {
                if (this.extensionsServers.length === 1) {
                    this._local = this.installed;
                }
                else {
                    this._local = [];
                    const byId = (0, extensionManagementUtil_1.groupByExtension)(this.installed, r => r.identifier);
                    for (const extensions of byId) {
                        this._local.push(this.getPrimaryExtension(extensions));
                    }
                }
            }
            return this._local;
        }
        get installed() {
            if (!this._installed) {
                this._installed = [];
                for (const extensions of this.extensionsServers) {
                    for (const extension of extensions.local) {
                        this._installed.push(extension);
                    }
                }
            }
            return this._installed;
        }
        get outdated() {
            return this.installed.filter(e => e.outdated && e.local && e.state === 1 /* ExtensionState.Installed */);
        }
        async queryLocal(server) {
            if (server) {
                if (this.localExtensions && this.extensionManagementServerService.localExtensionManagementServer === server) {
                    return this.localExtensions.queryInstalled();
                }
                if (this.remoteExtensions && this.extensionManagementServerService.remoteExtensionManagementServer === server) {
                    return this.remoteExtensions.queryInstalled();
                }
                if (this.webExtensions && this.extensionManagementServerService.webExtensionManagementServer === server) {
                    return this.webExtensions.queryInstalled();
                }
            }
            if (this.localExtensions) {
                try {
                    await this.localExtensions.queryInstalled();
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            if (this.remoteExtensions) {
                try {
                    await this.remoteExtensions.queryInstalled();
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            if (this.webExtensions) {
                try {
                    await this.webExtensions.queryInstalled();
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            return this.local;
        }
        async queryGallery(arg1, arg2) {
            if (!this.galleryService.isEnabled()) {
                return (0, paging_1.singlePagePager)([]);
            }
            const options = cancellation_1.CancellationToken.isCancellationToken(arg1) ? {} : arg1;
            const token = cancellation_1.CancellationToken.isCancellationToken(arg1) ? arg1 : arg2;
            options.text = options.text ? this.resolveQueryText(options.text) : options.text;
            options.includePreRelease = (0, types_1.isUndefined)(options.includePreRelease) ? this.preferPreReleases : options.includePreRelease;
            const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
            const pager = await this.galleryService.query(options, token);
            this.syncInstalledExtensionsWithGallery(pager.firstPage);
            return {
                firstPage: pager.firstPage.map(gallery => this.fromGallery(gallery, extensionsControlManifest)),
                total: pager.total,
                pageSize: pager.pageSize,
                getPage: async (pageIndex, token) => {
                    const page = await pager.getPage(pageIndex, token);
                    this.syncInstalledExtensionsWithGallery(page);
                    return page.map(gallery => this.fromGallery(gallery, extensionsControlManifest));
                }
            };
        }
        async getExtensions(extensionInfos, arg1, arg2) {
            if (!this.galleryService.isEnabled()) {
                return [];
            }
            extensionInfos.forEach(e => e.preRelease = e.preRelease ?? this.preferPreReleases);
            const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
            const galleryExtensions = await this.galleryService.getExtensions(extensionInfos, arg1, arg2);
            this.syncInstalledExtensionsWithGallery(galleryExtensions);
            return galleryExtensions.map(gallery => this.fromGallery(gallery, extensionsControlManifest));
        }
        resolveQueryText(text) {
            text = text.replace(/@web/g, `tag:"${extensionManagement_1.WEB_EXTENSION_TAG}"`);
            const extensionRegex = /\bext:([^\s]+)\b/g;
            if (extensionRegex.test(text)) {
                text = text.replace(extensionRegex, (m, ext) => {
                    // Get curated keywords
                    const lookup = this.productService.extensionKeywords || {};
                    const keywords = lookup[ext] || [];
                    // Get mode name
                    const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(uri_1.URI.file(`.${ext}`));
                    const languageName = languageId && this.languageService.getLanguageName(languageId);
                    const languageTag = languageName ? ` tag:"${languageName}"` : '';
                    // Construct a rich query
                    return `tag:"__ext_${ext}" tag:"__ext_.${ext}" ${keywords.map(tag => `tag:"${tag}"`).join(' ')}${languageTag} tag:"${ext}"`;
                });
            }
            return text.substr(0, 350);
        }
        fromGallery(gallery, extensionsControlManifest) {
            let extension = this.getInstalledExtensionMatchingGallery(gallery);
            if (!extension) {
                extension = this.instantiationService.createInstance(Extension, ext => this.getExtensionState(ext), ext => this.getReloadStatus(ext), undefined, undefined, gallery);
                Extensions.updateExtensionFromControlManifest(extension, extensionsControlManifest);
            }
            return extension;
        }
        getInstalledExtensionMatchingGallery(gallery) {
            for (const installed of this.local) {
                if (installed.identifier.uuid) { // Installed from Gallery
                    if (installed.identifier.uuid === gallery.identifier.uuid) {
                        return installed;
                    }
                }
                else {
                    if ((0, extensionManagementUtil_1.areSameExtensions)(installed.identifier, gallery.identifier)) { // Installed from other sources
                        return installed;
                    }
                }
            }
            return null;
        }
        async open(extension, options) {
            if (typeof extension === 'string') {
                const id = extension;
                extension = this.installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id })) ?? (await this.getExtensions([{ id: extension }], cancellation_1.CancellationToken.None))[0];
            }
            if (!extension) {
                throw new Error(`Extension not found. ${extension}`);
            }
            const editor = await this.editorService.openEditor(this.instantiationService.createInstance(extensionsInput_1.ExtensionsInput, extension), options, options?.sideByside ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
            if (options?.tab && editor instanceof extensionEditor_1.ExtensionEditor) {
                await editor.openTab(options.tab);
            }
        }
        getExtensionStatus(extension) {
            const extensionsStatus = this.extensionService.getExtensionsStatus();
            for (const id of Object.keys(extensionsStatus)) {
                if ((0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)) {
                    return extensionsStatus[id];
                }
            }
            return undefined;
        }
        getReloadStatus(extension) {
            const isUninstalled = extension.state === 3 /* ExtensionState.Uninstalled */;
            const runningExtension = this.extensionService.extensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, extension.identifier));
            if (isUninstalled) {
                const canRemoveRunningExtension = runningExtension && this.extensionService.canRemoveExtension(runningExtension);
                const isSameExtensionRunning = runningExtension && (!extension.server || extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension)));
                if (!canRemoveRunningExtension && isSameExtensionRunning && !runningExtension.isUnderDevelopment) {
                    return nls.localize('postUninstallTooltip', "Please reload Visual Studio Code to complete the uninstallation of this extension.");
                }
                return undefined;
            }
            if (extension.local) {
                const isSameExtensionRunning = runningExtension && extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension));
                const isEnabled = this.extensionEnablementService.isEnabled(extension.local);
                // Extension is running
                if (runningExtension) {
                    if (isEnabled) {
                        // No Reload is required if extension can run without reload
                        if (this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local))) {
                            return undefined;
                        }
                        const runningExtensionServer = this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension));
                        if (isSameExtensionRunning) {
                            // Different version or target platform of same extension is running. Requires reload to run the current version
                            if (!runningExtension.isUnderDevelopment && (extension.version !== runningExtension.version || extension.local.targetPlatform !== runningExtension.targetPlatform)) {
                                return nls.localize('postUpdateTooltip', "Please reload Visual Studio Code to enable the updated extension.");
                            }
                            if (this.extensionsServers.length > 1) {
                                const extensionInOtherServer = this.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier) && e.server !== extension.server)[0];
                                if (extensionInOtherServer) {
                                    // This extension prefers to run on UI/Local side but is running in remote
                                    if (runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(extension.local.manifest) && extensionInOtherServer.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                        return nls.localize('enable locally', "Please reload Visual Studio Code to enable this extension locally.");
                                    }
                                    // This extension prefers to run on Workspace/Remote side but is running in local
                                    if (runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(extension.local.manifest) && extensionInOtherServer.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                        return nls.localize('enable remote', "Please reload Visual Studio Code to enable this extension in {0}.", this.extensionManagementServerService.remoteExtensionManagementServer?.label);
                                    }
                                }
                            }
                        }
                        else {
                            if (extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                // This extension prefers to run on UI/Local side but is running in remote
                                if (this.extensionManifestPropertiesService.prefersExecuteOnUI(extension.local.manifest)) {
                                    return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                                }
                            }
                            if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
                                // This extension prefers to run on Workspace/Remote side but is running in local
                                if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(extension.local.manifest)) {
                                    return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                                }
                            }
                        }
                        return undefined;
                    }
                    else {
                        if (isSameExtensionRunning) {
                            return nls.localize('postDisableTooltip', "Please reload Visual Studio Code to disable this extension.");
                        }
                    }
                    return undefined;
                }
                // Extension is not running
                else {
                    if (isEnabled && !this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local))) {
                        return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                    }
                    const otherServer = extension.server ? extension.server === this.extensionManagementServerService.localExtensionManagementServer ? this.extensionManagementServerService.remoteExtensionManagementServer : this.extensionManagementServerService.localExtensionManagementServer : null;
                    if (otherServer && extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
                        const extensionInOtherServer = this.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier) && e.server === otherServer)[0];
                        // Same extension in other server exists and
                        if (extensionInOtherServer && extensionInOtherServer.local && this.extensionEnablementService.isEnabled(extensionInOtherServer.local)) {
                            return nls.localize('postEnableTooltip', "Please reload Visual Studio Code to enable this extension.");
                        }
                    }
                }
            }
            return undefined;
        }
        getPrimaryExtension(extensions) {
            if (extensions.length === 1) {
                return extensions[0];
            }
            const enabledExtensions = extensions.filter(e => e.local && this.extensionEnablementService.isEnabled(e.local));
            if (enabledExtensions.length === 1) {
                return enabledExtensions[0];
            }
            const extensionsToChoose = enabledExtensions.length ? enabledExtensions : extensions;
            const manifest = extensionsToChoose.find(e => e.local && e.local.manifest)?.local?.manifest;
            // Manifest is not found which should not happen.
            // In which case return the first extension.
            if (!manifest) {
                return extensionsToChoose[0];
            }
            const extensionKinds = this.extensionManifestPropertiesService.getExtensionKind(manifest);
            let extension = extensionsToChoose.find(extension => {
                for (const extensionKind of extensionKinds) {
                    switch (extensionKind) {
                        case 'ui':
                            /* UI extension is chosen only if it is installed locally */
                            if (extension.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                return true;
                            }
                            return false;
                        case 'workspace':
                            /* Choose remote workspace extension if exists */
                            if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                return true;
                            }
                            return false;
                        case 'web':
                            /* Choose web extension if exists */
                            if (extension.server === this.extensionManagementServerService.webExtensionManagementServer) {
                                return true;
                            }
                            return false;
                    }
                }
                return false;
            });
            if (!extension && this.extensionManagementServerService.localExtensionManagementServer) {
                extension = extensionsToChoose.find(extension => {
                    for (const extensionKind of extensionKinds) {
                        switch (extensionKind) {
                            case 'workspace':
                                /* Choose local workspace extension if exists */
                                if (extension.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                            case 'web':
                                /* Choose local web extension if exists */
                                if (extension.server === this.extensionManagementServerService.localExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                });
            }
            if (!extension && this.extensionManagementServerService.webExtensionManagementServer) {
                extension = extensionsToChoose.find(extension => {
                    for (const extensionKind of extensionKinds) {
                        switch (extensionKind) {
                            case 'web':
                                /* Choose web extension if exists */
                                if (extension.server === this.extensionManagementServerService.webExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                });
            }
            if (!extension && this.extensionManagementServerService.remoteExtensionManagementServer) {
                extension = extensionsToChoose.find(extension => {
                    for (const extensionKind of extensionKinds) {
                        switch (extensionKind) {
                            case 'web':
                                /* Choose remote web extension if exists */
                                if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                    return true;
                                }
                                return false;
                        }
                    }
                    return false;
                });
            }
            return extension || extensions[0];
        }
        getExtensionState(extension) {
            if (this.installing.some(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, extension.identifier) && (!extension.server || i.server === extension.server))) {
                return 0 /* ExtensionState.Installing */;
            }
            if (this.remoteExtensions) {
                const state = this.remoteExtensions.getExtensionState(extension);
                if (state !== 3 /* ExtensionState.Uninstalled */) {
                    return state;
                }
            }
            if (this.webExtensions) {
                const state = this.webExtensions.getExtensionState(extension);
                if (state !== 3 /* ExtensionState.Uninstalled */) {
                    return state;
                }
            }
            if (this.localExtensions) {
                return this.localExtensions.getExtensionState(extension);
            }
            return 3 /* ExtensionState.Uninstalled */;
        }
        async onDidAutoUpdateConfigurationChange() {
            await this.updateExtensionsPinnedState();
            if (this.isAutoUpdateEnabled()) {
                this.checkForUpdates();
            }
            else {
                this.setSelectedExtensionsToAutoUpdate([]);
            }
        }
        async checkForUpdates(onlyBuiltin) {
            if (!this.galleryService.isEnabled()) {
                return;
            }
            const extensions = [];
            if (this.localExtensions) {
                extensions.push(this.localExtensions);
            }
            if (this.remoteExtensions) {
                extensions.push(this.remoteExtensions);
            }
            if (this.webExtensions) {
                extensions.push(this.webExtensions);
            }
            if (!extensions.length) {
                return;
            }
            const infos = [];
            for (const installed of this.local) {
                if (onlyBuiltin && !installed.isBuiltin) {
                    // Skip if check updates only for builtin extensions and current extension is not builtin.
                    continue;
                }
                if (installed.isBuiltin && !installed.local?.pinned && (installed.type === 0 /* ExtensionType.System */ || !installed.local?.identifier.uuid)) {
                    // Skip checking updates for a builtin extension if it is a system extension or if it does not has Marketplace identifier
                    continue;
                }
                infos.push({ ...installed.identifier, preRelease: !!installed.local?.preRelease });
            }
            if (infos.length) {
                const targetPlatform = await extensions[0].server.extensionManagementService.getTargetPlatform();
                this.telemetryService.publicLog2('galleryService:checkingForUpdates', {
                    count: infos.length,
                });
                const galleryExtensions = await this.galleryService.getExtensions(infos, { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
                if (galleryExtensions.length) {
                    await this.syncInstalledExtensionsWithGallery(galleryExtensions);
                }
            }
        }
        async updateAll() {
            const toUpdate = [];
            this.outdated.forEach((extension) => {
                if (extension.gallery) {
                    toUpdate.push({
                        extension: extension.gallery,
                        options: {
                            operation: 3 /* InstallOperation.Update */,
                            installPreReleaseVersion: extension.local?.isPreReleaseVersion,
                            profileLocation: this.userDataProfileService.currentProfile.extensionsResource,
                        }
                    });
                }
            });
            return this.extensionManagementService.installGalleryExtensions(toUpdate);
        }
        async syncInstalledExtensionsWithGallery(gallery) {
            const extensions = [];
            if (this.localExtensions) {
                extensions.push(this.localExtensions);
            }
            if (this.remoteExtensions) {
                extensions.push(this.remoteExtensions);
            }
            if (this.webExtensions) {
                extensions.push(this.webExtensions);
            }
            if (!extensions.length) {
                return;
            }
            const result = await Promise.allSettled(extensions.map(extensions => extensions.syncInstalledExtensionsWithGallery(gallery)));
            if (this.isAutoUpdateEnabled() && result.some(r => r.status === 'fulfilled' && r.value)) {
                this.eventuallyAutoUpdateExtensions();
            }
        }
        getAutoUpdateValue() {
            const autoUpdate = this.configurationService.getValue(extensions_1.AutoUpdateConfigurationKey);
            return (0, types_1.isBoolean)(autoUpdate) || autoUpdate === 'onlyEnabledExtensions' || autoUpdate === 'onlySelectedExtensions' ? autoUpdate : true;
        }
        isAutoUpdateEnabled() {
            return this.getAutoUpdateValue() !== false;
        }
        isAutoCheckUpdatesEnabled() {
            return this.configurationService.getValue(extensions_1.AutoCheckUpdatesConfigurationKey);
        }
        eventuallyCheckForUpdates(immediate = false) {
            this.updatesCheckDelayer.trigger(async () => {
                if (this.isAutoUpdateEnabled() || this.isAutoCheckUpdatesEnabled()) {
                    await this.checkForUpdates();
                }
                this.eventuallyCheckForUpdates();
            }, immediate ? 0 : ExtensionsWorkbenchService_1.UpdatesCheckInterval).then(undefined, err => null);
        }
        eventuallyAutoUpdateExtensions() {
            this.autoUpdateDelayer.trigger(() => this.autoUpdateExtensions())
                .then(undefined, err => null);
        }
        async autoUpdateBuiltinExtensions() {
            await this.checkForUpdates(true);
            const toUpdate = this.outdated.filter(e => e.isBuiltin);
            await async_1.Promises.settled(toUpdate.map(e => this.install(e, e.local?.preRelease ? { installPreReleaseVersion: true } : undefined)));
        }
        async syncPinnedBuiltinExtensions() {
            const infos = [];
            for (const installed of this.local) {
                if (installed.isBuiltin && installed.local?.pinned && installed.local?.identifier.uuid) {
                    infos.push({ ...installed.identifier, version: installed.version });
                }
            }
            if (infos.length) {
                const galleryExtensions = await this.galleryService.getExtensions(infos, cancellation_1.CancellationToken.None);
                if (galleryExtensions.length) {
                    await this.syncInstalledExtensionsWithGallery(galleryExtensions);
                }
            }
        }
        async autoUpdateExtensions() {
            if (!this.isAutoUpdateEnabled()) {
                return;
            }
            const toUpdate = this.outdated.filter(e => !e.local?.pinned && this.shouldAutoUpdateExtension(e));
            await async_1.Promises.settled(toUpdate.map(e => this.install(e, e.local?.preRelease ? { installPreReleaseVersion: true } : undefined)));
        }
        async updateExtensionsPinnedState() {
            await Promise.all(this.installed.map(async (e) => {
                if (e.isBuiltin) {
                    return;
                }
                const shouldBePinned = !this.shouldAutoUpdateExtension(e);
                if (e.local && e.local.pinned !== shouldBePinned) {
                    await this.extensionManagementService.updateMetadata(e.local, { pinned: shouldBePinned });
                }
            }));
        }
        shouldAutoUpdateExtension(extension) {
            const autoUpdate = this.getAutoUpdateValue();
            if ((0, types_1.isBoolean)(autoUpdate)) {
                return autoUpdate;
            }
            if (autoUpdate === 'onlyEnabledExtensions') {
                return this.extensionEnablementService.isEnabledEnablementState(extension.enablementState);
            }
            const extensionsToAutoUpdate = this.getSelectedExtensionsToAutoUpdate();
            const extensionId = extension.identifier.id.toLowerCase();
            return extensionsToAutoUpdate.includes(extensionId) ||
                (!extensionsToAutoUpdate.includes(`-${extensionId}`) && this.isAutoUpdateEnabledForPublisher(extension.publisher));
        }
        isAutoUpdateEnabledFor(extensionOrPublisher) {
            if ((0, types_1.isString)(extensionOrPublisher)) {
                if (extensionManagement_1.EXTENSION_IDENTIFIER_REGEX.test(extensionOrPublisher)) {
                    throw new Error('Expected publisher string, found extension identifier');
                }
                const autoUpdate = this.getAutoUpdateValue();
                if ((0, types_1.isBoolean)(autoUpdate)) {
                    return autoUpdate;
                }
                if (autoUpdate === 'onlyEnabledExtensions') {
                    return false;
                }
                return this.isAutoUpdateEnabledForPublisher(extensionOrPublisher);
            }
            return !extensionOrPublisher.local?.pinned && this.shouldAutoUpdateExtension(extensionOrPublisher);
        }
        isAutoUpdateEnabledForPublisher(publisher) {
            const publishersToAutoUpdate = this.getPublishersToAutoUpdate();
            return publishersToAutoUpdate.includes(publisher.toLowerCase());
        }
        async updateAutoUpdateEnablementFor(extensionOrPublisher, enable) {
            const autoUpdateValue = this.getAutoUpdateValue();
            if (autoUpdateValue === true || autoUpdateValue === 'onlyEnabledExtensions') {
                if ((0, types_1.isString)(extensionOrPublisher)) {
                    throw new Error('Expected extension, found publisher string');
                }
                if (!extensionOrPublisher.local) {
                    throw new Error('Only installed extensions can be pinned');
                }
                await this.extensionManagementService.updateMetadata(extensionOrPublisher.local, { pinned: !enable });
                if (enable) {
                    this.eventuallyAutoUpdateExtensions();
                }
                return;
            }
            if (autoUpdateValue === false && enable) {
                await this.configurationService.updateValue(extensions_1.AutoUpdateConfigurationKey, 'onlySelectedExtensions');
            }
            let update = false;
            const autoUpdateExtensions = this.getSelectedExtensionsToAutoUpdate();
            if ((0, types_1.isString)(extensionOrPublisher)) {
                if (extensionManagement_1.EXTENSION_IDENTIFIER_REGEX.test(extensionOrPublisher)) {
                    throw new Error('Expected publisher string, found extension identifier');
                }
                extensionOrPublisher = extensionOrPublisher.toLowerCase();
                if (this.isAutoUpdateEnabledFor(extensionOrPublisher) !== enable) {
                    update = true;
                    if (enable) {
                        autoUpdateExtensions.push(extensionOrPublisher);
                    }
                    else {
                        if (autoUpdateExtensions.includes(extensionOrPublisher)) {
                            autoUpdateExtensions.splice(autoUpdateExtensions.indexOf(extensionOrPublisher), 1);
                        }
                    }
                }
            }
            else {
                const extensionId = extensionOrPublisher.identifier.id.toLowerCase();
                const enableAutoUpdatesForPublisher = this.isAutoUpdateEnabledFor(extensionOrPublisher.publisher.toLowerCase());
                const enableAutoUpdatesForExtension = autoUpdateExtensions.includes(extensionId);
                const disableAutoUpdatesForExtension = autoUpdateExtensions.includes(`-${extensionId}`);
                if (enable) {
                    if (disableAutoUpdatesForExtension) {
                        autoUpdateExtensions.splice(autoUpdateExtensions.indexOf(`-${extensionId}`), 1);
                        update = true;
                    }
                    if (enableAutoUpdatesForPublisher) {
                        if (enableAutoUpdatesForExtension) {
                            autoUpdateExtensions.splice(autoUpdateExtensions.indexOf(extensionId), 1);
                            update = true;
                        }
                    }
                    else {
                        if (!enableAutoUpdatesForExtension) {
                            autoUpdateExtensions.push(extensionId);
                            update = true;
                        }
                    }
                }
                // Disable Auto Updates
                else {
                    if (enableAutoUpdatesForExtension) {
                        autoUpdateExtensions.splice(autoUpdateExtensions.indexOf(extensionId), 1);
                        update = true;
                    }
                    if (enableAutoUpdatesForPublisher) {
                        if (!disableAutoUpdatesForExtension) {
                            autoUpdateExtensions.push(`-${extensionId}`);
                            update = true;
                        }
                    }
                    else {
                        if (disableAutoUpdatesForExtension) {
                            autoUpdateExtensions.splice(autoUpdateExtensions.indexOf(`-${extensionId}`), 1);
                            update = true;
                        }
                    }
                }
            }
            if (update) {
                this.setSelectedExtensionsToAutoUpdate(autoUpdateExtensions);
                await this.onDidSelectedExtensionToAutoUpdateValueChange(true);
                if (autoUpdateValue === 'onlySelectedExtensions' && autoUpdateExtensions.length === 0) {
                    await this.configurationService.updateValue(extensions_1.AutoUpdateConfigurationKey, false);
                }
            }
        }
        async onDidSelectedExtensionToAutoUpdateValueChange(forceUpdate) {
            if (forceUpdate || this.selectedExtensionsToAutoUpdateValue !== this.getSelectedExtensionsToAutoUpdateValue() /* This checks if current window changed the value or not */) {
                await this.updateExtensionsPinnedState();
                this.eventuallyAutoUpdateExtensions();
            }
        }
        async canInstall(extension) {
            if (!(extension instanceof Extension)) {
                return false;
            }
            if (extension.isMalicious) {
                return false;
            }
            if (extension.deprecationInfo?.disallowInstall) {
                return false;
            }
            if (!extension.gallery) {
                return false;
            }
            if (this.localExtensions && await this.localExtensions.canInstall(extension.gallery)) {
                return true;
            }
            if (this.remoteExtensions && await this.remoteExtensions.canInstall(extension.gallery)) {
                return true;
            }
            if (this.webExtensions && await this.webExtensions.canInstall(extension.gallery)) {
                return true;
            }
            return false;
        }
        install(extension, installOptions, progressLocation) {
            return this.doInstall(extension, async () => {
                if (extension instanceof uri_1.URI) {
                    return this.installFromVSIX(extension, installOptions);
                }
                if (extension.isMalicious) {
                    throw new Error(nls.localize('malicious', "This extension is reported to be problematic."));
                }
                if (!extension.gallery) {
                    throw new Error('Missing gallery');
                }
                return this.installFromGallery(extension, extension.gallery, installOptions);
            }, progressLocation);
        }
        async installInServer(extension, server) {
            await this.doInstall(extension, async () => {
                const local = extension.local;
                if (!local) {
                    throw new Error('Extension not found');
                }
                if (!extension.gallery) {
                    extension = (await this.getExtensions([{ ...extension.identifier, preRelease: local.preRelease }], cancellation_1.CancellationToken.None))[0] ?? extension;
                }
                if (extension.gallery) {
                    return server.extensionManagementService.installFromGallery(extension.gallery, { installPreReleaseVersion: local.preRelease });
                }
                const targetPlatform = await server.extensionManagementService.getTargetPlatform();
                if (!(0, extensionManagement_1.isTargetPlatformCompatible)(local.targetPlatform, [local.targetPlatform], targetPlatform)) {
                    throw new Error(nls.localize('incompatible', "Can't install '{0}' extension because it is not compatible.", extension.identifier.id));
                }
                const vsix = await this.extensionManagementService.zip(local);
                try {
                    return await server.extensionManagementService.install(vsix);
                }
                finally {
                    try {
                        await this.fileService.del(vsix);
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                }
            });
        }
        canSetLanguage(extension) {
            if (!platform_1.isWeb) {
                return false;
            }
            if (!extension.gallery) {
                return false;
            }
            const locale = (0, languagePacks_1.getLocale)(extension.gallery);
            if (!locale) {
                return false;
            }
            return true;
        }
        async setLanguage(extension) {
            if (!this.canSetLanguage(extension)) {
                throw new Error('Can not set language');
            }
            const locale = (0, languagePacks_1.getLocale)(extension.gallery);
            if (locale === platform_1.language) {
                return;
            }
            const localizedLanguageName = extension.gallery?.properties?.localizedLanguages?.[0];
            return this.localeService.setLocale({ id: locale, galleryExtension: extension.gallery, extensionId: extension.identifier.id, label: localizedLanguageName ?? extension.displayName });
        }
        setEnablement(extensions, enablementState) {
            extensions = Array.isArray(extensions) ? extensions : [extensions];
            return this.promptAndSetEnablement(extensions, enablementState);
        }
        uninstall(extension) {
            const ext = extension.local ? extension : this.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0];
            const toUninstall = ext && ext.local ? ext.local : null;
            if (!toUninstall) {
                return Promise.reject(new Error('Missing local'));
            }
            return this.withProgress({
                location: 5 /* ProgressLocation.Extensions */,
                title: nls.localize('uninstallingExtension', 'Uninstalling extension....'),
                source: `${toUninstall.identifier.id}`
            }, () => this.extensionManagementService.uninstall(toUninstall).then(() => undefined));
        }
        async installVersion(extension, version, installOptions = {}) {
            extension = await this.doInstall(extension, async () => {
                if (!extension.gallery) {
                    throw new Error('Missing gallery');
                }
                const targetPlatform = extension.server ? await extension.server.extensionManagementService.getTargetPlatform() : undefined;
                const [gallery] = await this.galleryService.getExtensions([{ id: extension.gallery.identifier.id, version }], { targetPlatform }, cancellation_1.CancellationToken.None);
                if (!gallery) {
                    throw new Error(nls.localize('not found', "Unable to install extension '{0}' because the requested version '{1}' is not found.", extension.gallery.identifier.id, version));
                }
                installOptions.installGivenVersion = true;
                return this.installFromGallery(extension, gallery, installOptions);
            });
            await this.updateAutoUpdateEnablementFor(extension, false);
            return extension;
        }
        reinstall(extension) {
            return this.doInstall(extension, () => {
                const ext = extension.local ? extension : this.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0];
                const toReinstall = ext && ext.local ? ext.local : null;
                if (!toReinstall) {
                    throw new Error('Missing local');
                }
                return this.extensionManagementService.reinstallFromGallery(toReinstall);
            });
        }
        isExtensionIgnoredToSync(extension) {
            return extension.local ? !this.isInstalledExtensionSynced(extension.local)
                : this.extensionsSyncManagementService.hasToNeverSyncExtension(extension.identifier.id);
        }
        async togglePreRelease(extension) {
            if (!extension.local) {
                return;
            }
            if (extension.preRelease !== extension.isPreReleaseVersion) {
                await this.extensionManagementService.updateMetadata(extension.local, { preRelease: !extension.preRelease });
                return;
            }
            await this.install(extension, { installPreReleaseVersion: !extension.preRelease, preRelease: !extension.preRelease });
        }
        async toggleExtensionIgnoredToSync(extension) {
            const isIgnored = this.isExtensionIgnoredToSync(extension);
            if (extension.local && isIgnored) {
                extension.local = await this.updateSynchronizingInstalledExtension(extension.local, true);
                this._onChange.fire(extension);
            }
            else {
                this.extensionsSyncManagementService.updateIgnoredExtensions(extension.identifier.id, !isIgnored);
            }
            await this.userDataAutoSyncService.triggerSync(['IgnoredExtensionsUpdated'], false, false);
        }
        async toggleApplyExtensionToAllProfiles(extension) {
            if (!extension.local || (0, extensions_2.isApplicationScopedExtension)(extension.local.manifest) || extension.isBuiltin) {
                return;
            }
            await this.extensionManagementService.toggleAppliationScope(extension.local, this.userDataProfileService.currentProfile.extensionsResource);
        }
        isInstalledExtensionSynced(extension) {
            if (extension.isMachineScoped) {
                return false;
            }
            if (this.extensionsSyncManagementService.hasToAlwaysSyncExtension(extension.identifier.id)) {
                return true;
            }
            return !this.extensionsSyncManagementService.hasToNeverSyncExtension(extension.identifier.id);
        }
        async updateSynchronizingInstalledExtension(extension, sync) {
            const isMachineScoped = !sync;
            if (extension.isMachineScoped !== isMachineScoped) {
                extension = await this.extensionManagementService.updateMetadata(extension, { isMachineScoped });
            }
            if (sync) {
                this.extensionsSyncManagementService.updateIgnoredExtensions(extension.identifier.id, false);
            }
            return extension;
        }
        doInstall(extension, installTask, progressLocation) {
            const title = extension instanceof uri_1.URI ? nls.localize('installing extension', 'Installing extension....') : nls.localize('installing named extension', "Installing '{0}' extension....", extension.displayName);
            return this.withProgress({
                location: progressLocation ?? 5 /* ProgressLocation.Extensions */,
                title
            }, async () => {
                try {
                    if (!(extension instanceof uri_1.URI)) {
                        this.installing.push(extension);
                        this._onChange.fire(extension);
                    }
                    const local = await installTask();
                    return await this.waitAndGetInstalledExtension(local.identifier);
                }
                finally {
                    if (!(extension instanceof uri_1.URI)) {
                        this.installing = this.installing.filter(e => e !== extension);
                        // Trigger the change without passing the extension because it is replaced by a new instance.
                        this._onChange.fire(undefined);
                    }
                }
            });
        }
        async installFromVSIX(vsix, installOptions) {
            const manifest = await this.extensionManagementService.getManifest(vsix);
            const existingExtension = this.local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) }));
            if (existingExtension) {
                installOptions = installOptions || {};
                if (existingExtension.latestVersion === manifest.version) {
                    installOptions.pinned = existingExtension.local?.pinned || !this.shouldAutoUpdateExtension(existingExtension);
                }
                else {
                    installOptions.installGivenVersion = true;
                }
            }
            return this.extensionManagementService.installVSIX(vsix, manifest, installOptions);
        }
        installFromGallery(extension, gallery, installOptions) {
            installOptions = installOptions ?? {};
            installOptions.pinned = extension.local?.pinned || !this.shouldAutoUpdateExtension(extension);
            if (extension.local) {
                return this.extensionManagementService.updateFromGallery(gallery, extension.local, installOptions);
            }
            else {
                return this.extensionManagementService.installFromGallery(gallery, installOptions);
            }
        }
        async waitAndGetInstalledExtension(identifier) {
            let installedExtension = this.local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, identifier));
            if (!installedExtension) {
                await event_1.Event.toPromise(event_1.Event.filter(this.onChange, e => !!e && this.local.some(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, identifier))));
            }
            installedExtension = this.local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, identifier));
            if (!installedExtension) {
                // This should not happen
                throw new Error('Extension should have been installed');
            }
            return installedExtension;
        }
        promptAndSetEnablement(extensions, enablementState) {
            const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
            if (enable) {
                const allDependenciesAndPackedExtensions = this.getExtensionsRecursively(extensions, this.local, enablementState, { dependencies: true, pack: true });
                return this.checkAndSetEnablement(extensions, allDependenciesAndPackedExtensions, enablementState);
            }
            else {
                const packedExtensions = this.getExtensionsRecursively(extensions, this.local, enablementState, { dependencies: false, pack: true });
                if (packedExtensions.length) {
                    return this.checkAndSetEnablement(extensions, packedExtensions, enablementState);
                }
                return this.checkAndSetEnablement(extensions, [], enablementState);
            }
        }
        checkAndSetEnablement(extensions, otherExtensions, enablementState) {
            const allExtensions = [...extensions, ...otherExtensions];
            const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
            if (!enable) {
                for (const extension of extensions) {
                    const dependents = this.getDependentsAfterDisablement(extension, allExtensions, this.local);
                    if (dependents.length) {
                        return new Promise((resolve, reject) => {
                            this.notificationService.prompt(notification_1.Severity.Error, this.getDependentsErrorMessage(extension, allExtensions, dependents), [
                                {
                                    label: nls.localize('disable all', 'Disable All'),
                                    run: async () => {
                                        try {
                                            await this.checkAndSetEnablement(dependents, [extension], enablementState);
                                            resolve();
                                        }
                                        catch (error) {
                                            reject(error);
                                        }
                                    }
                                }
                            ], {
                                onCancel: () => reject(new errors_1.CancellationError())
                            });
                        });
                    }
                }
            }
            return this.doSetEnablement(allExtensions, enablementState);
        }
        getExtensionsRecursively(extensions, installed, enablementState, options, checked = []) {
            const toCheck = extensions.filter(e => checked.indexOf(e) === -1);
            if (toCheck.length) {
                for (const extension of toCheck) {
                    checked.push(extension);
                }
                const extensionsToEanbleOrDisable = installed.filter(i => {
                    if (checked.indexOf(i) !== -1) {
                        return false;
                    }
                    const enable = enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */;
                    const isExtensionEnabled = i.enablementState === 8 /* EnablementState.EnabledGlobally */ || i.enablementState === 9 /* EnablementState.EnabledWorkspace */;
                    if (enable === isExtensionEnabled) {
                        return false;
                    }
                    return (enable || !i.isBuiltin) // Include all Extensions for enablement and only non builtin extensions for disablement
                        && (options.dependencies || options.pack)
                        && extensions.some(extension => (options.dependencies && extension.dependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, i.identifier)))
                            || (options.pack && extension.extensionPack.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, i.identifier))));
                });
                if (extensionsToEanbleOrDisable.length) {
                    extensionsToEanbleOrDisable.push(...this.getExtensionsRecursively(extensionsToEanbleOrDisable, installed, enablementState, options, checked));
                }
                return extensionsToEanbleOrDisable;
            }
            return [];
        }
        getDependentsAfterDisablement(extension, extensionsToDisable, installed) {
            return installed.filter(i => {
                if (i.dependencies.length === 0) {
                    return false;
                }
                if (i === extension) {
                    return false;
                }
                if (!this.extensionEnablementService.isEnabledEnablementState(i.enablementState)) {
                    return false;
                }
                if (extensionsToDisable.indexOf(i) !== -1) {
                    return false;
                }
                return i.dependencies.some(dep => [extension, ...extensionsToDisable].some(d => (0, extensionManagementUtil_1.areSameExtensions)(d.identifier, { id: dep })));
            });
        }
        getDependentsErrorMessage(extension, allDisabledExtensions, dependents) {
            for (const e of [extension, ...allDisabledExtensions]) {
                const dependentsOfTheExtension = dependents.filter(d => d.dependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, e.identifier)));
                if (dependentsOfTheExtension.length) {
                    return this.getErrorMessageForDisablingAnExtensionWithDependents(e, dependentsOfTheExtension);
                }
            }
            return '';
        }
        getErrorMessageForDisablingAnExtensionWithDependents(extension, dependents) {
            if (dependents.length === 1) {
                return nls.localize('singleDependentError', "Cannot disable '{0}' extension alone. '{1}' extension depends on this. Do you want to disable all these extensions?", extension.displayName, dependents[0].displayName);
            }
            if (dependents.length === 2) {
                return nls.localize('twoDependentsError', "Cannot disable '{0}' extension alone. '{1}' and '{2}' extensions depend on this. Do you want to disable all these extensions?", extension.displayName, dependents[0].displayName, dependents[1].displayName);
            }
            return nls.localize('multipleDependentsError', "Cannot disable '{0}' extension alone. '{1}', '{2}' and other extensions depend on this. Do you want to disable all these extensions?", extension.displayName, dependents[0].displayName, dependents[1].displayName);
        }
        async doSetEnablement(extensions, enablementState) {
            const changed = await this.extensionEnablementService.setEnablement(extensions.map(e => e.local), enablementState);
            for (let i = 0; i < changed.length; i++) {
                if (changed[i]) {
                    /* __GDPR__
                    "extension:enable" : {
                        "owner": "sandy081",
                        "${include}": [
                            "${GalleryExtensionTelemetryData}"
                        ]
                    }
                    */
                    /* __GDPR__
                    "extension:disable" : {
                        "owner": "sandy081",
                        "${include}": [
                            "${GalleryExtensionTelemetryData}"
                        ]
                    }
                    */
                    this.telemetryService.publicLog(enablementState === 8 /* EnablementState.EnabledGlobally */ || enablementState === 9 /* EnablementState.EnabledWorkspace */ ? 'extension:enable' : 'extension:disable', extensions[i].telemetryData);
                }
            }
            return changed;
        }
        reportProgressFromOtherSources() {
            if (this.installed.some(e => e.state === 0 /* ExtensionState.Installing */ || e.state === 2 /* ExtensionState.Uninstalling */)) {
                if (!this._activityCallBack) {
                    this.withProgress({ location: 5 /* ProgressLocation.Extensions */ }, () => new Promise(resolve => this._activityCallBack = resolve));
                }
            }
            else {
                this._activityCallBack?.();
                this._activityCallBack = undefined;
            }
        }
        withProgress(options, task) {
            return this.progressService.withProgress(options, async () => {
                const cancelableTask = (0, async_1.createCancelablePromise)(() => task());
                this.tasksInProgress.push(cancelableTask);
                try {
                    return await cancelableTask;
                }
                finally {
                    const index = this.tasksInProgress.indexOf(cancelableTask);
                    if (index !== -1) {
                        this.tasksInProgress.splice(index, 1);
                    }
                }
            });
        }
        onError(err) {
            if ((0, errors_1.isCancellationError)(err)) {
                return;
            }
            const message = err && err.message || '';
            if (/getaddrinfo ENOTFOUND|getaddrinfo ENOENT|connect EACCES|connect ECONNREFUSED/.test(message)) {
                return;
            }
            this.notificationService.error(err);
        }
        handleURL(uri, options) {
            if (!/^extension/.test(uri.path)) {
                return Promise.resolve(false);
            }
            this.onOpenExtensionUrl(uri);
            return Promise.resolve(true);
        }
        onOpenExtensionUrl(uri) {
            const match = /^extension\/([^/]+)$/.exec(uri.path);
            if (!match) {
                return;
            }
            const extensionId = match[1];
            this.queryLocal().then(async (local) => {
                let extension = local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, { id: extensionId }));
                if (!extension) {
                    [extension] = await this.getExtensions([{ id: extensionId }], { source: 'uri' }, cancellation_1.CancellationToken.None);
                }
                if (extension) {
                    await this.hostService.focus(window_1.mainWindow);
                    await this.open(extension);
                }
            }).then(undefined, error => this.onError(error));
        }
        getPublishersToAutoUpdate() {
            return this.getSelectedExtensionsToAutoUpdate().filter(id => !extensionManagement_1.EXTENSION_IDENTIFIER_REGEX.test(id));
        }
        getSelectedExtensionsToAutoUpdate() {
            try {
                const parsedValue = JSON.parse(this.selectedExtensionsToAutoUpdateValue);
                if (Array.isArray(parsedValue)) {
                    return parsedValue;
                }
            }
            catch (e) { /* Ignore */ }
            return [];
        }
        setSelectedExtensionsToAutoUpdate(selectedExtensionsToAutoUpdate) {
            this.selectedExtensionsToAutoUpdateValue = JSON.stringify(selectedExtensionsToAutoUpdate);
        }
        get selectedExtensionsToAutoUpdateValue() {
            if (!this._selectedExtensionsToAutoUpdateValue) {
                this._selectedExtensionsToAutoUpdateValue = this.getSelectedExtensionsToAutoUpdateValue();
            }
            return this._selectedExtensionsToAutoUpdateValue;
        }
        set selectedExtensionsToAutoUpdateValue(placeholderViewContainesValue) {
            if (this.selectedExtensionsToAutoUpdateValue !== placeholderViewContainesValue) {
                this._selectedExtensionsToAutoUpdateValue = placeholderViewContainesValue;
                this.setSelectedExtensionsToAutoUpdateValue(placeholderViewContainesValue);
            }
        }
        getSelectedExtensionsToAutoUpdateValue() {
            return this.storageService.get(EXTENSIONS_AUTO_UPDATE_KEY, -1 /* StorageScope.APPLICATION */, '[]');
        }
        setSelectedExtensionsToAutoUpdateValue(value) {
            this.storageService.store(EXTENSIONS_AUTO_UPDATE_KEY, value, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
    };
    exports.ExtensionsWorkbenchService = ExtensionsWorkbenchService;
    exports.ExtensionsWorkbenchService = ExtensionsWorkbenchService = ExtensionsWorkbenchService_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, editorService_1.IEditorService),
        __param(2, extensionManagement_2.IWorkbenchExtensionManagementService),
        __param(3, extensionManagement_1.IExtensionGalleryService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, notification_1.INotificationService),
        __param(7, url_1.IURLService),
        __param(8, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(9, host_1.IHostService),
        __param(10, progress_1.IProgressService),
        __param(11, extensionManagement_2.IExtensionManagementServerService),
        __param(12, language_1.ILanguageService),
        __param(13, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(14, userDataSync_1.IUserDataAutoSyncService),
        __param(15, productService_1.IProductService),
        __param(16, contextkey_1.IContextKeyService),
        __param(17, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(18, log_1.ILogService),
        __param(19, extensions_3.IExtensionService),
        __param(20, locale_1.ILocaleService),
        __param(21, lifecycle_2.ILifecycleService),
        __param(22, files_1.IFileService),
        __param(23, userDataProfile_1.IUserDataProfileService),
        __param(24, storage_1.IStorageService)
    ], ExtensionsWorkbenchService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1dvcmtiZW5jaFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25zV29ya2JlbmNoU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUV6RixJQUFNLFNBQVMsR0FBZixNQUFNLFNBQVM7UUFJckIsWUFDUyxhQUFzRCxFQUN0RCxvQkFBaUUsRUFDekQsTUFBOEMsRUFDdkQsS0FBa0MsRUFDbEMsT0FBc0MsRUFDbkIsY0FBeUQsRUFDaEUsZ0JBQW9ELEVBQzFELFVBQXdDLEVBQ3ZDLFdBQTBDLEVBQ3ZDLGNBQWdEO1lBVHpELGtCQUFhLEdBQWIsYUFBYSxDQUF5QztZQUN0RCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTZDO1lBQ3pELFdBQU0sR0FBTixNQUFNLENBQXdDO1lBQ3ZELFVBQUssR0FBTCxLQUFLLENBQTZCO1lBQ2xDLFlBQU8sR0FBUCxPQUFPLENBQStCO1lBQ0YsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQy9DLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDekMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUN0QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUN0QixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFaM0Qsb0JBQWUsMkNBQW9EO1lBMkpuRSxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQTlJaEMsQ0FBQztRQUVMLElBQUksSUFBSTtZQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQywyQkFBbUIsQ0FBQztRQUMxRCxDQUFDO1FBRUQsSUFBSSxTQUFTO1lBQ1osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2xELENBQUM7UUFFRCxJQUFJLElBQUk7WUFDUCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDckUsQ0FBQztRQUVELElBQUksV0FBVztZQUNkLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ3RELENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxLQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsS0FBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDdEUsQ0FBQztRQUVELElBQUksVUFBVTtZQUNiLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQ2hDLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxLQUFNLENBQUMsVUFBVSxDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFJLElBQUk7WUFDUCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2xGLENBQUM7UUFFRCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7UUFD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
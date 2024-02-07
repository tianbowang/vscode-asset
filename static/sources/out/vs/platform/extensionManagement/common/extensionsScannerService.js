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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/objects", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/json", "vs/base/common/jsonErrorMessages", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/semver/semver", "vs/base/common/severity", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/extensions/common/extensionValidator", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/base/common/event", "vs/base/common/marshalling", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/extensionManagement/common/extensionNls"], function (require, exports, arrays_1, async_1, objects, buffer_1, errors_1, json_1, jsonErrorMessages_1, lifecycle_1, network_1, path, platform, resources_1, semver, severity_1, types_1, uri_1, nls_1, environment_1, extensionManagementUtil_1, extensions_1, extensionValidator_1, files_1, instantiation_1, log_1, productService_1, event_1, marshalling_1, extensionsProfileScannerService_1, userDataProfile_1, uriIdentity_1, extensionNls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeExtensionsScannerService = exports.toExtensionDescription = exports.ExtensionScannerInput = exports.AbstractExtensionsScannerService = exports.IExtensionsScannerService = exports.Translations = void 0;
    var Translations;
    (function (Translations) {
        function equals(a, b) {
            if (a === b) {
                return true;
            }
            const aKeys = Object.keys(a);
            const bKeys = new Set();
            for (const key of Object.keys(b)) {
                bKeys.add(key);
            }
            if (aKeys.length !== bKeys.size) {
                return false;
            }
            for (const key of aKeys) {
                if (a[key] !== b[key]) {
                    return false;
                }
                bKeys.delete(key);
            }
            return bKeys.size === 0;
        }
        Translations.equals = equals;
    })(Translations || (exports.Translations = Translations = {}));
    exports.IExtensionsScannerService = (0, instantiation_1.createDecorator)('IExtensionsScannerService');
    let AbstractExtensionsScannerService = class AbstractExtensionsScannerService extends lifecycle_1.Disposable {
        constructor(systemExtensionsLocation, userExtensionsLocation, extensionsControlLocation, currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
            super();
            this.systemExtensionsLocation = systemExtensionsLocation;
            this.userExtensionsLocation = userExtensionsLocation;
            this.extensionsControlLocation = extensionsControlLocation;
            this.currentProfile = currentProfile;
            this.userDataProfilesService = userDataProfilesService;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.fileService = fileService;
            this.logService = logService;
            this.environmentService = environmentService;
            this.productService = productService;
            this.uriIdentityService = uriIdentityService;
            this.instantiationService = instantiationService;
            this._onDidChangeCache = this._register(new event_1.Emitter());
            this.onDidChangeCache = this._onDidChangeCache.event;
            this.obsoleteFile = (0, resources_1.joinPath)(this.userExtensionsLocation, '.obsolete');
            this.systemExtensionsCachedScanner = this._register(this.instantiationService.createInstance(CachedExtensionsScanner, this.currentProfile, this.obsoleteFile));
            this.userExtensionsCachedScanner = this._register(this.instantiationService.createInstance(CachedExtensionsScanner, this.currentProfile, this.obsoleteFile));
            this.extensionsScanner = this._register(this.instantiationService.createInstance(ExtensionsScanner, this.obsoleteFile));
            this.initializeDefaultProfileExtensionsPromise = undefined;
            this._register(this.systemExtensionsCachedScanner.onDidChangeCache(() => this._onDidChangeCache.fire(0 /* ExtensionType.System */)));
            this._register(this.userExtensionsCachedScanner.onDidChangeCache(() => this._onDidChangeCache.fire(1 /* ExtensionType.User */)));
        }
        getTargetPlatform() {
            if (!this._targetPlatformPromise) {
                this._targetPlatformPromise = (0, extensionManagementUtil_1.computeTargetPlatform)(this.fileService, this.logService);
            }
            return this._targetPlatformPromise;
        }
        async scanAllExtensions(systemScanOptions, userScanOptions, includeExtensionsUnderDev) {
            const [system, user] = await Promise.all([
                this.scanSystemExtensions(systemScanOptions),
                this.scanUserExtensions(userScanOptions),
            ]);
            const development = includeExtensionsUnderDev ? await this.scanExtensionsUnderDevelopment(systemScanOptions, [...system, ...user]) : [];
            return this.dedupExtensions(system, user, development, await this.getTargetPlatform(), true);
        }
        async scanSystemExtensions(scanOptions) {
            const promises = [];
            promises.push(this.scanDefaultSystemExtensions(!!scanOptions.useCache, scanOptions.language));
            promises.push(this.scanDevSystemExtensions(scanOptions.language, !!scanOptions.checkControlFile));
            const [defaultSystemExtensions, devSystemExtensions] = await Promise.all(promises);
            return this.applyScanOptions([...defaultSystemExtensions, ...devSystemExtensions], 0 /* ExtensionType.System */, scanOptions, false);
        }
        async scanUserExtensions(scanOptions) {
            const location = scanOptions.profileLocation ?? this.userExtensionsLocation;
            this.logService.trace('Started scanning user extensions', location);
            const profileScanOptions = this.uriIdentityService.extUri.isEqual(scanOptions.profileLocation, this.userDataProfilesService.defaultProfile.extensionsResource) ? { bailOutWhenFileNotFound: true } : undefined;
            const extensionsScannerInput = await this.createExtensionScannerInput(location, !!scanOptions.profileLocation, 1 /* ExtensionType.User */, !scanOptions.includeUninstalled, scanOptions.language, true, profileScanOptions);
            const extensionsScanner = scanOptions.useCache && !extensionsScannerInput.devMode && extensionsScannerInput.excludeObsolete ? this.userExtensionsCachedScanner : this.extensionsScanner;
            let extensions;
            try {
                extensions = await extensionsScanner.scanExtensions(extensionsScannerInput);
            }
            catch (error) {
                if (error instanceof extensionsProfileScannerService_1.ExtensionsProfileScanningError && error.code === "ERROR_PROFILE_NOT_FOUND" /* ExtensionsProfileScanningErrorCode.ERROR_PROFILE_NOT_FOUND */) {
                    await this.doInitializeDefaultProfileExtensions();
                    extensions = await extensionsScanner.scanExtensions(extensionsScannerInput);
                }
                else {
                    throw error;
                }
            }
            extensions = await this.applyScanOptions(extensions, 1 /* ExtensionType.User */, scanOptions, true);
            this.logService.trace('Scanned user extensions:', extensions.length);
            return extensions;
        }
        async scanExtensionsUnderDevelopment(scanOptions, existingExtensions) {
            if (this.environmentService.isExtensionDevelopment && this.environmentService.extensionDevelopmentLocationURI) {
                const extensions = (await Promise.all(this.environmentService.extensionDevelopmentLocationURI.filter(extLoc => extLoc.scheme === network_1.Schemas.file)
                    .map(async (extensionDevelopmentLocationURI) => {
                    const input = await this.createExtensionScannerInput(extensionDevelopmentLocationURI, false, 1 /* ExtensionType.User */, true, scanOptions.language, false /* do not validate */, undefined);
                    const extensions = await this.extensionsScanner.scanOneOrMultipleExtensions(input);
                    return extensions.map(extension => {
                        // Override the extension type from the existing extensions
                        extension.type = existingExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))?.type ?? extension.type;
                        // Validate the extension
                        return this.extensionsScanner.validate(extension, input);
                    });
                })))
                    .flat();
                return this.applyScanOptions(extensions, 'development', scanOptions, true);
            }
            return [];
        }
        async scanExistingExtension(extensionLocation, extensionType, scanOptions) {
            const extensionsScannerInput = await this.createExtensionScannerInput(extensionLocation, false, extensionType, true, scanOptions.language, true, undefined);
            const extension = await this.extensionsScanner.scanExtension(extensionsScannerInput);
            if (!extension) {
                return null;
            }
            if (!scanOptions.includeInvalid && !extension.isValid) {
                return null;
            }
            return extension;
        }
        async scanOneOrMultipleExtensions(extensionLocation, extensionType, scanOptions) {
            const extensionsScannerInput = await this.createExtensionScannerInput(extensionLocation, false, extensionType, true, scanOptions.language, true, undefined);
            const extensions = await this.extensionsScanner.scanOneOrMultipleExtensions(extensionsScannerInput);
            return this.applyScanOptions(extensions, extensionType, scanOptions, true);
        }
        async scanMetadata(extensionLocation) {
            const manifestLocation = (0, resources_1.joinPath)(extensionLocation, 'package.json');
            const content = (await this.fileService.readFile(manifestLocation)).value.toString();
            const manifest = JSON.parse(content);
            return manifest.__metadata;
        }
        async updateMetadata(extensionLocation, metaData) {
            const manifestLocation = (0, resources_1.joinPath)(extensionLocation, 'package.json');
            const content = (await this.fileService.readFile(manifestLocation)).value.toString();
            const manifest = JSON.parse(content);
            // unset if false
            if (metaData.isMachineScoped === false) {
                delete metaData.isMachineScoped;
            }
            if (metaData.isBuiltin === false) {
                delete metaData.isBuiltin;
            }
            manifest.__metadata = { ...manifest.__metadata, ...metaData };
            await this.fileService.writeFile((0, resources_1.joinPath)(extensionLocation, 'package.json'), buffer_1.VSBuffer.fromString(JSON.stringify(manifest, null, '\t')));
        }
        async initializeDefaultProfileExtensions() {
            try {
                await this.extensionsProfileScannerService.scanProfileExtensions(this.userDataProfilesService.defaultProfile.extensionsResource, { bailOutWhenFileNotFound: true });
            }
            catch (error) {
                if (error instanceof extensionsProfileScannerService_1.ExtensionsProfileScanningError && error.code === "ERROR_PROFILE_NOT_FOUND" /* ExtensionsProfileScanningErrorCode.ERROR_PROFILE_NOT_FOUND */) {
                    await this.doInitializeDefaultProfileExtensions();
                }
                else {
                    throw error;
                }
            }
        }
        async doInitializeDefaultProfileExtensions() {
            if (!this.initializeDefaultProfileExtensionsPromise) {
                this.initializeDefaultProfileExtensionsPromise = (async () => {
                    try {
                        this.logService.info('Started initializing default profile extensions in extensions installation folder.', this.userExtensionsLocation.toString());
                        const userExtensions = await this.scanUserExtensions({ includeInvalid: true });
                        if (userExtensions.length) {
                            await this.extensionsProfileScannerService.addExtensionsToProfile(userExtensions.map(e => [e, e.metadata]), this.userDataProfilesService.defaultProfile.extensionsResource);
                        }
                        else {
                            try {
                                await this.fileService.createFile(this.userDataProfilesService.defaultProfile.extensionsResource, buffer_1.VSBuffer.fromString(JSON.stringify([])));
                            }
                            catch (error) {
                                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                                    this.logService.warn('Failed to create default profile extensions manifest in extensions installation folder.', this.userExtensionsLocation.toString(), (0, errors_1.getErrorMessage)(error));
                                }
                            }
                        }
                        this.logService.info('Completed initializing default profile extensions in extensions installation folder.', this.userExtensionsLocation.toString());
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                    finally {
                        this.initializeDefaultProfileExtensionsPromise = undefined;
                    }
                })();
            }
            return this.initializeDefaultProfileExtensionsPromise;
        }
        async applyScanOptions(extensions, type, scanOptions, pickLatest) {
            if (!scanOptions.includeAllVersions) {
                extensions = this.dedupExtensions(type === 0 /* ExtensionType.System */ ? extensions : undefined, type === 1 /* ExtensionType.User */ ? extensions : undefined, type === 'development' ? extensions : undefined, await this.getTargetPlatform(), pickLatest);
            }
            if (!scanOptions.includeInvalid) {
                extensions = extensions.filter(extension => extension.isValid);
            }
            return extensions.sort((a, b) => {
                const aLastSegment = path.basename(a.location.fsPath);
                const bLastSegment = path.basename(b.location.fsPath);
                if (aLastSegment < bLastSegment) {
                    return -1;
                }
                if (aLastSegment > bLastSegment) {
                    return 1;
                }
                return 0;
            });
        }
        dedupExtensions(system, user, development, targetPlatform, pickLatest) {
            const pick = (existing, extension, isDevelopment) => {
                if (existing.isValid && !extension.isValid) {
                    return false;
                }
                if (existing.isValid === extension.isValid) {
                    if (pickLatest && semver.gt(existing.manifest.version, extension.manifest.version)) {
                        this.logService.debug(`Skipping extension ${extension.location.path} with lower version ${extension.manifest.version} in favour of ${existing.location.path} with version ${existing.manifest.version}`);
                        return false;
                    }
                    if (semver.eq(existing.manifest.version, extension.manifest.version)) {
                        if (existing.type === 0 /* ExtensionType.System */) {
                            this.logService.debug(`Skipping extension ${extension.location.path} in favour of system extension ${existing.location.path} with same version`);
                            return false;
                        }
                        if (existing.targetPlatform === targetPlatform) {
                            this.logService.debug(`Skipping extension ${extension.location.path} from different target platform ${extension.targetPlatform}`);
                            return false;
                        }
                    }
                }
                if (isDevelopment) {
                    this.logService.warn(`Overwriting user extension ${existing.location.path} with ${extension.location.path}.`);
                }
                else {
                    this.logService.debug(`Overwriting user extension ${existing.location.path} with ${extension.location.path}.`);
                }
                return true;
            };
            const result = new extensions_1.ExtensionIdentifierMap();
            system?.forEach((extension) => {
                const existing = result.get(extension.identifier.id);
                if (!existing || pick(existing, extension, false)) {
                    result.set(extension.identifier.id, extension);
                }
            });
            user?.forEach((extension) => {
                const existing = result.get(extension.identifier.id);
                if (!existing && system && extension.type === 0 /* ExtensionType.System */) {
                    this.logService.debug(`Skipping obsolete system extension ${extension.location.path}.`);
                    return;
                }
                if (!existing || pick(existing, extension, false)) {
                    result.set(extension.identifier.id, extension);
                }
            });
            development?.forEach(extension => {
                const existing = result.get(extension.identifier.id);
                if (!existing || pick(existing, extension, true)) {
                    result.set(extension.identifier.id, extension);
                }
                result.set(extension.identifier.id, extension);
            });
            return [...result.values()];
        }
        async scanDefaultSystemExtensions(useCache, language) {
            this.logService.trace('Started scanning system extensions');
            const extensionsScannerInput = await this.createExtensionScannerInput(this.systemExtensionsLocation, false, 0 /* ExtensionType.System */, true, language, true, undefined);
            const extensionsScanner = useCache && !extensionsScannerInput.devMode ? this.systemExtensionsCachedScanner : this.extensionsScanner;
            const result = await extensionsScanner.scanExtensions(extensionsScannerInput);
            this.logService.trace('Scanned system extensions:', result.length);
            return result;
        }
        async scanDevSystemExtensions(language, checkControlFile) {
            const devSystemExtensionsList = this.environmentService.isBuilt ? [] : this.productService.builtInExtensions;
            if (!devSystemExtensionsList?.length) {
                return [];
            }
            this.logService.trace('Started scanning dev system extensions');
            const builtinExtensionControl = checkControlFile ? await this.getBuiltInExtensionControl() : {};
            const devSystemExtensionsLocations = [];
            const devSystemExtensionsLocation = uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('').fsPath, '..', '.build', 'builtInExtensions')));
            for (const extension of devSystemExtensionsList) {
                const controlState = builtinExtensionControl[extension.name] || 'marketplace';
                switch (controlState) {
                    case 'disabled':
                        break;
                    case 'marketplace':
                        devSystemExtensionsLocations.push((0, resources_1.joinPath)(devSystemExtensionsLocation, extension.name));
                        break;
                    default:
                        devSystemExtensionsLocations.push(uri_1.URI.file(controlState));
                        break;
                }
            }
            const result = await Promise.all(devSystemExtensionsLocations.map(async (location) => this.extensionsScanner.scanExtension((await this.createExtensionScannerInput(location, false, 0 /* ExtensionType.System */, true, language, true, undefined)))));
            this.logService.trace('Scanned dev system extensions:', result.length);
            return (0, arrays_1.coalesce)(result);
        }
        async getBuiltInExtensionControl() {
            try {
                const content = await this.fileService.readFile(this.extensionsControlLocation);
                return JSON.parse(content.value.toString());
            }
            catch (error) {
                return {};
            }
        }
        async createExtensionScannerInput(location, profile, type, excludeObsolete, language, validate, profileScanOptions) {
            const translations = await this.getTranslations(language ?? platform.language);
            const mtime = await this.getMtime(location);
            const applicationExtensionsLocation = profile && !this.uriIdentityService.extUri.isEqual(location, this.userDataProfilesService.defaultProfile.extensionsResource) ? this.userDataProfilesService.defaultProfile.extensionsResource : undefined;
            const applicationExtensionsLocationMtime = applicationExtensionsLocation ? await this.getMtime(applicationExtensionsLocation) : undefined;
            return new ExtensionScannerInput(location, mtime, applicationExtensionsLocation, applicationExtensionsLocationMtime, profile, profileScanOptions, type, excludeObsolete, validate, this.productService.version, this.productService.date, this.productService.commit, !this.environmentService.isBuilt, language, translations);
        }
        async getMtime(location) {
            try {
                const stat = await this.fileService.stat(location);
                if (typeof stat.mtime === 'number') {
                    return stat.mtime;
                }
            }
            catch (err) {
                // That's ok...
            }
            return undefined;
        }
    };
    exports.AbstractExtensionsScannerService = AbstractExtensionsScannerService;
    exports.AbstractExtensionsScannerService = AbstractExtensionsScannerService = __decorate([
        __param(4, userDataProfile_1.IUserDataProfilesService),
        __param(5, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(6, files_1.IFileService),
        __param(7, log_1.ILogService),
        __param(8, environment_1.IEnvironmentService),
        __param(9, productService_1.IProductService),
        __param(10, uriIdentity_1.IUriIdentityService),
        __param(11, instantiation_1.IInstantiationService)
    ], AbstractExtensionsScannerService);
    class ExtensionScannerInput {
        constructor(location, mtime, applicationExtensionslocation, applicationExtensionslocationMtime, profile, profileScanOptions, type, excludeObsolete, validate, productVersion, productDate, productCommit, devMode, language, translations) {
            this.location = location;
            this.mtime = mtime;
            this.applicationExtensionslocation = applicationExtensionslocation;
            this.applicationExtensionslocationMtime = applicationExtensionslocationMtime;
            this.profile = profile;
            this.profileScanOptions = profileScanOptions;
            this.type = type;
            this.excludeObsolete = excludeObsolete;
            this.validate = validate;
            this.productVersion = productVersion;
            this.productDate = productDate;
            this.productCommit = productCommit;
            this.devMode = devMode;
            this.language = language;
            this.translations = translations;
            // Keep empty!! (JSON.parse)
        }
        static createNlsConfiguration(input) {
            return {
                language: input.language,
                pseudo: input.language === 'pseudo',
                devMode: input.devMode,
                translations: input.translations
            };
        }
        static equals(a, b) {
            return ((0, resources_1.isEqual)(a.location, b.location)
                && a.mtime === b.mtime
                && (0, resources_1.isEqual)(a.applicationExtensionslocation, b.applicationExtensionslocation)
                && a.applicationExtensionslocationMtime === b.applicationExtensionslocationMtime
                && a.profile === b.profile
                && objects.equals(a.profileScanOptions, b.profileScanOptions)
                && a.type === b.type
                && a.excludeObsolete === b.excludeObsolete
                && a.validate === b.validate
                && a.productVersion === b.productVersion
                && a.productDate === b.productDate
                && a.productCommit === b.productCommit
                && a.devMode === b.devMode
                && a.language === b.language
                && Translations.equals(a.translations, b.translations));
        }
    }
    exports.ExtensionScannerInput = ExtensionScannerInput;
    let ExtensionsScanner = class ExtensionsScanner extends lifecycle_1.Disposable {
        constructor(obsoleteFile, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
            super();
            this.obsoleteFile = obsoleteFile;
            this.extensionsProfileScannerService = extensionsProfileScannerService;
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this.logService = logService;
        }
        async scanExtensions(input) {
            const extensions = input.profile ? await this.scanExtensionsFromProfile(input) : await this.scanExtensionsFromLocation(input);
            let obsolete = {};
            if (input.excludeObsolete && input.type === 1 /* ExtensionType.User */) {
                try {
                    const raw = (await this.fileService.readFile(this.obsoleteFile)).value.toString();
                    obsolete = JSON.parse(raw);
                }
                catch (error) { /* ignore */ }
            }
            return (0, types_1.isEmptyObject)(obsolete) ? extensions : extensions.filter(e => !obsolete[extensionManagementUtil_1.ExtensionKey.create(e).toString()]);
        }
        async scanExtensionsFromLocation(input) {
            const stat = await this.fileService.resolve(input.location);
            if (!stat.children?.length) {
                return [];
            }
            const extensions = await Promise.all(stat.children.map(async (c) => {
                if (!c.isDirectory) {
                    return null;
                }
                // Do not consider user extension folder starting with `.`
                if (input.type === 1 /* ExtensionType.User */ && (0, resources_1.basename)(c.resource).indexOf('.') === 0) {
                    return null;
                }
                const extensionScannerInput = new ExtensionScannerInput(c.resource, input.mtime, input.applicationExtensionslocation, input.applicationExtensionslocationMtime, input.profile, input.profileScanOptions, input.type, input.excludeObsolete, input.validate, input.productVersion, input.productDate, input.productCommit, input.devMode, input.language, input.translations);
                return this.scanExtension(extensionScannerInput);
            }));
            return (0, arrays_1.coalesce)(extensions)
                // Sort: Make sure extensions are in the same order always. Helps cache invalidation even if the order changes.
                .sort((a, b) => a.location.path < b.location.path ? -1 : 1);
        }
        async scanExtensionsFromProfile(input) {
            let profileExtensions = await this.scanExtensionsFromProfileResource(input.location, () => true, input);
            if (input.applicationExtensionslocation && !this.uriIdentityService.extUri.isEqual(input.location, input.applicationExtensionslocation)) {
                profileExtensions = profileExtensions.filter(e => !e.metadata?.isApplicationScoped);
                const applicationExtensions = await this.scanExtensionsFromProfileResource(input.applicationExtensionslocation, (e) => !!e.metadata?.isBuiltin || !!e.metadata?.isApplicationScoped, input);
                profileExtensions.push(...applicationExtensions);
            }
            return profileExtensions;
        }
        async scanExtensionsFromProfileResource(profileResource, filter, input) {
            const scannedProfileExtensions = await this.extensionsProfileScannerService.scanProfileExtensions(profileResource, input.profileScanOptions);
            if (!scannedProfileExtensions.length) {
                return [];
            }
            const extensions = await Promise.all(scannedProfileExtensions.map(async (extensionInfo) => {
                if (filter(extensionInfo)) {
                    const extensionScannerInput = new ExtensionScannerInput(extensionInfo.location, input.mtime, input.applicationExtensionslocation, input.applicationExtensionslocationMtime, input.profile, input.profileScanOptions, input.type, input.excludeObsolete, input.validate, input.productVersion, input.productDate, input.productCommit, input.devMode, input.language, input.translations);
                    return this.scanExtension(extensionScannerInput, extensionInfo.metadata);
                }
                return null;
            }));
            return (0, arrays_1.coalesce)(extensions);
        }
        async scanOneOrMultipleExtensions(input) {
            try {
                if (await this.fileService.exists((0, resources_1.joinPath)(input.location, 'package.json'))) {
                    const extension = await this.scanExtension(input);
                    return extension ? [extension] : [];
                }
                else {
                    return await this.scanExtensions(input);
                }
            }
            catch (error) {
                this.logService.error(`Error scanning extensions at ${input.location.path}:`, (0, errors_1.getErrorMessage)(error));
                return [];
            }
        }
        async scanExtension(input, metadata) {
            try {
                let manifest = await this.scanExtensionManifest(input.location);
                if (manifest) {
                    // allow publisher to be undefined to make the initial extension authoring experience smoother
                    if (!manifest.publisher) {
                        manifest.publisher = extensions_1.UNDEFINED_PUBLISHER;
                    }
                    metadata = metadata ?? manifest.__metadata;
                    delete manifest.__metadata;
                    const id = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
                    const identifier = metadata?.id ? { id, uuid: metadata.id } : { id };
                    const type = metadata?.isSystem ? 0 /* ExtensionType.System */ : input.type;
                    const isBuiltin = type === 0 /* ExtensionType.System */ || !!metadata?.isBuiltin;
                    manifest = await this.translateManifest(input.location, manifest, ExtensionScannerInput.createNlsConfiguration(input));
                    const extension = {
                        type,
                        identifier,
                        manifest,
                        location: input.location,
                        isBuiltin,
                        targetPlatform: metadata?.targetPlatform ?? "undefined" /* TargetPlatform.UNDEFINED */,
                        metadata,
                        isValid: true,
                        validations: []
                    };
                    return input.validate ? this.validate(extension, input) : extension;
                }
            }
            catch (e) {
                if (input.type !== 0 /* ExtensionType.System */) {
                    this.logService.error(e);
                }
            }
            return null;
        }
        validate(extension, input) {
            let isValid = true;
            const validations = (0, extensionValidator_1.validateExtensionManifest)(input.productVersion, input.productDate, input.location, extension.manifest, extension.isBuiltin);
            for (const [severity, message] of validations) {
                if (severity === severity_1.default.Error) {
                    isValid = false;
                    this.logService.error(this.formatMessage(input.location, message));
                }
            }
            extension.isValid = isValid;
            extension.validations = validations;
            return extension;
        }
        async scanExtensionManifest(extensionLocation) {
            const manifestLocation = (0, resources_1.joinPath)(extensionLocation, 'package.json');
            let content;
            try {
                content = (await this.fileService.readFile(manifestLocation)).value.toString();
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('fileReadFail', "Cannot read file {0}: {1}.", manifestLocation.path, error.message)));
                }
                return null;
            }
            let manifest;
            try {
                manifest = JSON.parse(content);
            }
            catch (err) {
                // invalid JSON, let's get good errors
                const errors = [];
                (0, json_1.parse)(content, errors);
                for (const e of errors) {
                    this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonParseFail', "Failed to parse {0}: [{1}, {2}] {3}.", manifestLocation.path, e.offset, e.length, (0, jsonErrorMessages_1.getParseErrorMessage)(e.error))));
                }
                return null;
            }
            if ((0, json_1.getNodeType)(manifest) !== 'object') {
                this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonParseInvalidType', "Invalid manifest file {0}: Not an JSON object.", manifestLocation.path)));
                return null;
            }
            return manifest;
        }
        async translateManifest(extensionLocation, extensionManifest, nlsConfiguration) {
            const localizedMessages = await this.getLocalizedMessages(extensionLocation, extensionManifest, nlsConfiguration);
            if (localizedMessages) {
                try {
                    const errors = [];
                    // resolveOriginalMessageBundle returns null if localizedMessages.default === undefined;
                    const defaults = await this.resolveOriginalMessageBundle(localizedMessages.default, errors);
                    if (errors.length > 0) {
                        errors.forEach((error) => {
                            this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonsParseReportErrors', "Failed to parse {0}: {1}.", localizedMessages.default?.path, (0, jsonErrorMessages_1.getParseErrorMessage)(error.error))));
                        });
                        return extensionManifest;
                    }
                    else if ((0, json_1.getNodeType)(localizedMessages) !== 'object') {
                        this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonInvalidFormat', "Invalid format {0}: JSON object expected.", localizedMessages.default?.path)));
                        return extensionManifest;
                    }
                    const localized = localizedMessages.values || Object.create(null);
                    return (0, extensionNls_1.localizeManifest)(this.logService, extensionManifest, localized, defaults);
                }
                catch (error) {
                    /*Ignore Error*/
                }
            }
            return extensionManifest;
        }
        async getLocalizedMessages(extensionLocation, extensionManifest, nlsConfiguration) {
            const defaultPackageNLS = (0, resources_1.joinPath)(extensionLocation, 'package.nls.json');
            const reportErrors = (localized, errors) => {
                errors.forEach((error) => {
                    this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonsParseReportErrors', "Failed to parse {0}: {1}.", localized?.path, (0, jsonErrorMessages_1.getParseErrorMessage)(error.error))));
                });
            };
            const reportInvalidFormat = (localized) => {
                this.logService.error(this.formatMessage(extensionLocation, (0, nls_1.localize)('jsonInvalidFormat', "Invalid format {0}: JSON object expected.", localized?.path)));
            };
            const translationId = `${extensionManifest.publisher}.${extensionManifest.name}`;
            const translationPath = nlsConfiguration.translations[translationId];
            if (translationPath) {
                try {
                    const translationResource = uri_1.URI.file(translationPath);
                    const content = (await this.fileService.readFile(translationResource)).value.toString();
                    const errors = [];
                    const translationBundle = (0, json_1.parse)(content, errors);
                    if (errors.length > 0) {
                        reportErrors(translationResource, errors);
                        return { values: undefined, default: defaultPackageNLS };
                    }
                    else if ((0, json_1.getNodeType)(translationBundle) !== 'object') {
                        reportInvalidFormat(translationResource);
                        return { values: undefined, default: defaultPackageNLS };
                    }
                    else {
                        const values = translationBundle.contents ? translationBundle.contents.package : undefined;
                        return { values: values, default: defaultPackageNLS };
                    }
                }
                catch (error) {
                    return { values: undefined, default: defaultPackageNLS };
                }
            }
            else {
                const exists = await this.fileService.exists(defaultPackageNLS);
                if (!exists) {
                    return undefined;
                }
                let messageBundle;
                try {
                    messageBundle = await this.findMessageBundles(extensionLocation, nlsConfiguration);
                }
                catch (error) {
                    return undefined;
                }
                if (!messageBundle.localized) {
                    return { values: undefined, default: messageBundle.original };
                }
                try {
                    const messageBundleContent = (await this.fileService.readFile(messageBundle.localized)).value.toString();
                    const errors = [];
                    const messages = (0, json_1.parse)(messageBundleContent, errors);
                    if (errors.length > 0) {
                        reportErrors(messageBundle.localized, errors);
                        return { values: undefined, default: messageBundle.original };
                    }
                    else if ((0, json_1.getNodeType)(messages) !== 'object') {
                        reportInvalidFormat(messageBundle.localized);
                        return { values: undefined, default: messageBundle.original };
                    }
                    return { values: messages, default: messageBundle.original };
                }
                catch (error) {
                    return { values: undefined, default: messageBundle.original };
                }
            }
        }
        /**
         * Parses original message bundle, returns null if the original message bundle is null.
         */
        async resolveOriginalMessageBundle(originalMessageBundle, errors) {
            if (originalMessageBundle) {
                try {
                    const originalBundleContent = (await this.fileService.readFile(originalMessageBundle)).value.toString();
                    return (0, json_1.parse)(originalBundleContent, errors);
                }
                catch (error) {
                    /* Ignore Error */
                }
            }
            return;
        }
        /**
         * Finds localized message bundle and the original (unlocalized) one.
         * If the localized file is not present, returns null for the original and marks original as localized.
         */
        findMessageBundles(extensionLocation, nlsConfiguration) {
            return new Promise((c, e) => {
                const loop = (locale) => {
                    const toCheck = (0, resources_1.joinPath)(extensionLocation, `package.nls.${locale}.json`);
                    this.fileService.exists(toCheck).then(exists => {
                        if (exists) {
                            c({ localized: toCheck, original: (0, resources_1.joinPath)(extensionLocation, 'package.nls.json') });
                        }
                        const index = locale.lastIndexOf('-');
                        if (index === -1) {
                            c({ localized: (0, resources_1.joinPath)(extensionLocation, 'package.nls.json'), original: null });
                        }
                        else {
                            locale = locale.substring(0, index);
                            loop(locale);
                        }
                    });
                };
                if (nlsConfiguration.devMode || nlsConfiguration.pseudo || !nlsConfiguration.language) {
                    return c({ localized: (0, resources_1.joinPath)(extensionLocation, 'package.nls.json'), original: null });
                }
                loop(nlsConfiguration.language);
            });
        }
        formatMessage(extensionLocation, message) {
            return `[${extensionLocation.path}]: ${message}`;
        }
    };
    ExtensionsScanner = __decorate([
        __param(1, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, files_1.IFileService),
        __param(4, log_1.ILogService)
    ], ExtensionsScanner);
    let CachedExtensionsScanner = class CachedExtensionsScanner extends ExtensionsScanner {
        constructor(currentProfile, obsoleteFile, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
            super(obsoleteFile, extensionsProfileScannerService, uriIdentityService, fileService, logService);
            this.currentProfile = currentProfile;
            this.userDataProfilesService = userDataProfilesService;
            this.cacheValidatorThrottler = this._register(new async_1.ThrottledDelayer(3000));
            this._onDidChangeCache = this._register(new event_1.Emitter());
            this.onDidChangeCache = this._onDidChangeCache.event;
        }
        async scanExtensions(input) {
            const cacheFile = this.getCacheFile(input);
            const cacheContents = await this.readExtensionCache(cacheFile);
            this.input = input;
            if (cacheContents && cacheContents.input && ExtensionScannerInput.equals(cacheContents.input, this.input)) {
                this.logService.debug('Using cached extensions scan result', input.location.toString());
                this.cacheValidatorThrottler.trigger(() => this.validateCache());
                return cacheContents.result.map((extension) => {
                    // revive URI object
                    extension.location = uri_1.URI.revive(extension.location);
                    return extension;
                });
            }
            const result = await super.scanExtensions(input);
            await this.writeExtensionCache(cacheFile, { input, result });
            return result;
        }
        async readExtensionCache(cacheFile) {
            try {
                const cacheRawContents = await this.fileService.readFile(cacheFile);
                const extensionCacheData = JSON.parse(cacheRawContents.value.toString());
                return { result: extensionCacheData.result, input: (0, marshalling_1.revive)(extensionCacheData.input) };
            }
            catch (error) {
                this.logService.debug('Error while reading the extension cache file:', cacheFile.path, (0, errors_1.getErrorMessage)(error));
            }
            return null;
        }
        async writeExtensionCache(cacheFile, cacheContents) {
            try {
                await this.fileService.writeFile(cacheFile, buffer_1.VSBuffer.fromString(JSON.stringify(cacheContents)));
            }
            catch (error) {
                this.logService.debug('Error while writing the extension cache file:', cacheFile.path, (0, errors_1.getErrorMessage)(error));
            }
        }
        async validateCache() {
            if (!this.input) {
                // Input has been unset by the time we get here, so skip validation
                return;
            }
            const cacheFile = this.getCacheFile(this.input);
            const cacheContents = await this.readExtensionCache(cacheFile);
            if (!cacheContents) {
                // Cache has been deleted by someone else, which is perfectly fine...
                return;
            }
            const actual = cacheContents.result;
            const expected = JSON.parse(JSON.stringify(await super.scanExtensions(this.input)));
            if (objects.equals(expected, actual)) {
                // Cache is valid and running with it is perfectly fine...
                return;
            }
            try {
                this.logService.info('Invalidating Cache', actual, expected);
                // Cache is invalid, delete it
                await this.fileService.del(cacheFile);
                this._onDidChangeCache.fire();
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        getCacheFile(input) {
            const profile = this.getProfile(input);
            return this.uriIdentityService.extUri.joinPath(profile.cacheHome, input.type === 0 /* ExtensionType.System */ ? extensions_1.BUILTIN_MANIFEST_CACHE_FILE : extensions_1.USER_MANIFEST_CACHE_FILE);
        }
        getProfile(input) {
            if (input.type === 0 /* ExtensionType.System */) {
                return this.userDataProfilesService.defaultProfile;
            }
            if (!input.profile) {
                return this.userDataProfilesService.defaultProfile;
            }
            if (this.uriIdentityService.extUri.isEqual(input.location, this.currentProfile.extensionsResource)) {
                return this.currentProfile;
            }
            return this.userDataProfilesService.profiles.find(p => this.uriIdentityService.extUri.isEqual(input.location, p.extensionsResource)) ?? this.currentProfile;
        }
    };
    CachedExtensionsScanner = __decorate([
        __param(2, userDataProfile_1.IUserDataProfilesService),
        __param(3, extensionsProfileScannerService_1.IExtensionsProfileScannerService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, files_1.IFileService),
        __param(6, log_1.ILogService)
    ], CachedExtensionsScanner);
    function toExtensionDescription(extension, isUnderDevelopment) {
        const id = (0, extensionManagementUtil_1.getExtensionId)(extension.manifest.publisher, extension.manifest.name);
        return {
            id,
            identifier: new extensions_1.ExtensionIdentifier(id),
            isBuiltin: extension.type === 0 /* ExtensionType.System */,
            isUserBuiltin: extension.type === 1 /* ExtensionType.User */ && extension.isBuiltin,
            isUnderDevelopment,
            extensionLocation: extension.location,
            uuid: extension.identifier.uuid,
            targetPlatform: extension.targetPlatform,
            ...extension.manifest,
        };
    }
    exports.toExtensionDescription = toExtensionDescription;
    class NativeExtensionsScannerService extends AbstractExtensionsScannerService {
        constructor(systemExtensionsLocation, userExtensionsLocation, userHome, currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
            super(systemExtensionsLocation, userExtensionsLocation, (0, resources_1.joinPath)(userHome, '.vscode-oss-dev', 'extensions', 'control.json'), currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
            this.translationsPromise = (async () => {
                if (platform.translationsConfigFile) {
                    try {
                        const content = await this.fileService.readFile(uri_1.URI.file(platform.translationsConfigFile));
                        return JSON.parse(content.value.toString());
                    }
                    catch (err) { /* Ignore Error */ }
                }
                return Object.create(null);
            })();
        }
        getTranslations(language) {
            return this.translationsPromise;
        }
    }
    exports.NativeExtensionsScannerService = NativeExtensionsScannerService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1NjYW5uZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L2NvbW1vbi9leHRlbnNpb25zU2Nhbm5lclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0RoRyxJQUFpQixZQUFZLENBc0I1QjtJQXRCRCxXQUFpQixZQUFZO1FBQzVCLFNBQWdCLE1BQU0sQ0FBQyxDQUFlLEVBQUUsQ0FBZTtZQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDYixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sS0FBSyxHQUFnQixJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQzdDLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLENBQUM7WUFDRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNqQyxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUN6QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDdkIsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQztnQkFDRCxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQyxJ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
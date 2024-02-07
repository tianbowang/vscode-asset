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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/types", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensionValidator", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/externalServices/common/marketplace", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/base/common/stopwatch"], function (require, exports, arrays_1, cancellation_1, errors_1, platform_1, process_1, types_1, uri_1, configuration_1, environment_1, extensionManagement_1, extensionManagementUtil_1, extensionValidator_1, files_1, log_1, productService_1, request_1, marketplace_1, storage_1, telemetry_1, stopwatch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionGalleryServiceWithNoStorageService = exports.ExtensionGalleryService = exports.sortExtensionVersions = void 0;
    const CURRENT_TARGET_PLATFORM = platform_1.isWeb ? "web" /* TargetPlatform.WEB */ : (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch);
    const ACTIVITY_HEADER_NAME = 'X-Market-Search-Activity-Id';
    var Flags;
    (function (Flags) {
        /**
         * None is used to retrieve only the basic extension details.
         */
        Flags[Flags["None"] = 0] = "None";
        /**
         * IncludeVersions will return version information for extensions returned
         */
        Flags[Flags["IncludeVersions"] = 1] = "IncludeVersions";
        /**
         * IncludeFiles will return information about which files were found
         * within the extension that were stored independent of the manifest.
         * When asking for files, versions will be included as well since files
         * are returned as a property of the versions.
         * These files can be retrieved using the path to the file without
         * requiring the entire manifest be downloaded.
         */
        Flags[Flags["IncludeFiles"] = 2] = "IncludeFiles";
        /**
         * Include the Categories and Tags that were added to the extension definition.
         */
        Flags[Flags["IncludeCategoryAndTags"] = 4] = "IncludeCategoryAndTags";
        /**
         * Include the details about which accounts the extension has been shared
         * with if the extension is a private extension.
         */
        Flags[Flags["IncludeSharedAccounts"] = 8] = "IncludeSharedAccounts";
        /**
         * Include properties associated with versions of the extension
         */
        Flags[Flags["IncludeVersionProperties"] = 16] = "IncludeVersionProperties";
        /**
         * Excluding non-validated extensions will remove any extension versions that
         * either are in the process of being validated or have failed validation.
         */
        Flags[Flags["ExcludeNonValidated"] = 32] = "ExcludeNonValidated";
        /**
         * Include the set of installation targets the extension has requested.
         */
        Flags[Flags["IncludeInstallationTargets"] = 64] = "IncludeInstallationTargets";
        /**
         * Include the base uri for assets of this extension
         */
        Flags[Flags["IncludeAssetUri"] = 128] = "IncludeAssetUri";
        /**
         * Include the statistics associated with this extension
         */
        Flags[Flags["IncludeStatistics"] = 256] = "IncludeStatistics";
        /**
         * When retrieving versions from a query, only include the latest
         * version of the extensions that matched. This is useful when the
         * caller doesn't need all the published versions. It will save a
         * significant size in the returned payload.
         */
        Flags[Flags["IncludeLatestVersionOnly"] = 512] = "IncludeLatestVersionOnly";
        /**
         * This flag switches the asset uri to use GetAssetByName instead of CDN
         * When this is used, values of base asset uri and base asset uri fallback are switched
         * When this is used, source of asset files are pointed to Gallery service always even if CDN is available
         */
        Flags[Flags["Unpublished"] = 4096] = "Unpublished";
        /**
         * Include the details if an extension is in conflict list or not
         */
        Flags[Flags["IncludeNameConflictInfo"] = 32768] = "IncludeNameConflictInfo";
    })(Flags || (Flags = {}));
    function flagsToString(...flags) {
        return String(flags.reduce((r, f) => r | f, 0));
    }
    var FilterType;
    (function (FilterType) {
        FilterType[FilterType["Tag"] = 1] = "Tag";
        FilterType[FilterType["ExtensionId"] = 4] = "ExtensionId";
        FilterType[FilterType["Category"] = 5] = "Category";
        FilterType[FilterType["ExtensionName"] = 7] = "ExtensionName";
        FilterType[FilterType["Target"] = 8] = "Target";
        FilterType[FilterType["Featured"] = 9] = "Featured";
        FilterType[FilterType["SearchText"] = 10] = "SearchText";
        FilterType[FilterType["ExcludeWithFlags"] = 12] = "ExcludeWithFlags";
    })(FilterType || (FilterType = {}));
    const AssetType = {
        Icon: 'Microsoft.VisualStudio.Services.Icons.Default',
        Details: 'Microsoft.VisualStudio.Services.Content.Details',
        Changelog: 'Microsoft.VisualStudio.Services.Content.Changelog',
        Manifest: 'Microsoft.VisualStudio.Code.Manifest',
        VSIX: 'Microsoft.VisualStudio.Services.VSIXPackage',
        License: 'Microsoft.VisualStudio.Services.Content.License',
        Repository: 'Microsoft.VisualStudio.Services.Links.Source',
        Signature: 'Microsoft.VisualStudio.Services.VsixSignature'
    };
    const PropertyType = {
        Dependency: 'Microsoft.VisualStudio.Code.ExtensionDependencies',
        ExtensionPack: 'Microsoft.VisualStudio.Code.ExtensionPack',
        Engine: 'Microsoft.VisualStudio.Code.Engine',
        PreRelease: 'Microsoft.VisualStudio.Code.PreRelease',
        LocalizedLanguages: 'Microsoft.VisualStudio.Code.LocalizedLanguages',
        WebExtension: 'Microsoft.VisualStudio.Code.WebExtension',
        SponsorLink: 'Microsoft.VisualStudio.Code.SponsorLink',
        SupportLink: 'Microsoft.VisualStudio.Services.Links.Support',
    };
    const DefaultPageSize = 10;
    const DefaultQueryState = {
        pageNumber: 1,
        pageSize: DefaultPageSize,
        sortBy: 0 /* SortBy.NoneOrRelevance */,
        sortOrder: 0 /* SortOrder.Default */,
        flags: Flags.None,
        criteria: [],
        assetTypes: []
    };
    class Query {
        constructor(state = DefaultQueryState) {
            this.state = state;
        }
        get pageNumber() { return this.state.pageNumber; }
        get pageSize() { return this.state.pageSize; }
        get sortBy() { return this.state.sortBy; }
        get sortOrder() { return this.state.sortOrder; }
        get flags() { return this.state.flags; }
        get criteria() { return this.state.criteria; }
        withPage(pageNumber, pageSize = this.state.pageSize) {
            return new Query({ ...this.state, pageNumber, pageSize });
        }
        withFilter(filterType, ...values) {
            const criteria = [
                ...this.state.criteria,
                ...values.length ? values.map(value => ({ filterType, value })) : [{ filterType }]
            ];
            return new Query({ ...this.state, criteria });
        }
        withSortBy(sortBy) {
            return new Query({ ...this.state, sortBy });
        }
        withSortOrder(sortOrder) {
            return new Query({ ...this.state, sortOrder });
        }
        withFlags(...flags) {
            return new Query({ ...this.state, flags: flags.reduce((r, f) => r | f, 0) });
        }
        withAssetTypes(...assetTypes) {
            return new Query({ ...this.state, assetTypes });
        }
        withSource(source) {
            return new Query({ ...this.state, source });
        }
        get raw() {
            const { criteria, pageNumber, pageSize, sortBy, sortOrder, flags, assetTypes } = this.state;
            const filters = [{ criteria, pageNumber, pageSize, sortBy, sortOrder }];
            return { filters, assetTypes, flags };
        }
        get searchText() {
            const criterium = this.state.criteria.filter(criterium => criterium.filterType === FilterType.SearchText)[0];
            return criterium && criterium.value ? criterium.value : '';
        }
        get telemetryData() {
            return {
                filterTypes: this.state.criteria.map(criterium => String(criterium.filterType)),
                flags: this.state.flags,
                sortBy: String(this.sortBy),
                sortOrder: String(this.sortOrder),
                pageNumber: String(this.pageNumber),
                source: this.state.source,
                searchTextLength: this.searchText.length
            };
        }
    }
    function getStatistic(statistics, name) {
        const result = (statistics || []).filter(s => s.statisticName === name)[0];
        return result ? result.value : 0;
    }
    function getCoreTranslationAssets(version) {
        const coreTranslationAssetPrefix = 'Microsoft.VisualStudio.Code.Translation.';
        const result = version.files.filter(f => f.assetType.indexOf(coreTranslationAssetPrefix) === 0);
        return result.reduce((result, file) => {
            const asset = getVersionAsset(version, file.assetType);
            if (asset) {
                result.push([file.assetType.substring(coreTranslationAssetPrefix.length), asset]);
            }
            return result;
        }, []);
    }
    function getRepositoryAsset(version) {
        if (version.properties) {
            const results = version.properties.filter(p => p.key === AssetType.Repository);
            const gitRegExp = new RegExp('((git|ssh|http(s)?)|(git@[\\w.]+))(:(//)?)([\\w.@:/\\-~]+)(.git)(/)?');
            const uri = results.filter(r => gitRegExp.test(r.value))[0];
            return uri ? { uri: uri.value, fallbackUri: uri.value } : null;
        }
        return getVersionAsset(version, AssetType.Repository);
    }
    function getDownloadAsset(version) {
        return {
            // always use fallbackAssetUri for download asset to hit the Marketplace API so that downloads are counted
            uri: `${version.fallbackAssetUri}/${AssetType.VSIX}?redirect=true${version.targetPlatform ? `&targetPlatform=${version.targetPlatform}` : ''}`,
            fallbackUri: `${version.fallbackAssetUri}/${AssetType.VSIX}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ''}`
        };
    }
    function getVersionAsset(version, type) {
        const result = version.files.filter(f => f.assetType === type)[0];
        return result ? {
            uri: `${version.assetUri}/${type}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ''}`,
            fallbackUri: `${version.fallbackAssetUri}/${type}${version.targetPlatform ? `?targetPlatform=${version.targetPlatform}` : ''}`
        } : null;
    }
    function getExtensions(version, property) {
        const values = version.properties ? version.properties.filter(p => p.key === property) : [];
        const value = values.length > 0 && values[0].value;
        return value ? value.split(',').map(v => (0, extensionManagementUtil_1.adoptToGalleryExtensionId)(v)) : [];
    }
    function getEngine(version) {
        const values = version.properties ? version.properties.filter(p => p.key === PropertyType.Engine) : [];
        return (values.length > 0 && values[0].value) || '';
    }
    function isPreReleaseVersion(version) {
        const values = version.properties ? version.properties.filter(p => p.key === PropertyType.PreRelease) : [];
        return values.length > 0 && values[0].value === 'true';
    }
    function getLocalizedLanguages(version) {
        const values = version.properties ? version.properties.filter(p => p.key === PropertyType.LocalizedLanguages) : [];
        const value = (values.length > 0 && values[0].value) || '';
        return value ? value.split(',') : [];
    }
    function getSponsorLink(version) {
        return version.properties?.find(p => p.key === PropertyType.SponsorLink)?.value;
    }
    function getSupportLink(version) {
        return version.properties?.find(p => p.key === PropertyType.SupportLink)?.value;
    }
    function getIsPreview(flags) {
        return flags.indexOf('preview') !== -1;
    }
    function getTargetPlatformForExtensionVersion(version) {
        return version.targetPlatform ? (0, extensionManagement_1.toTargetPlatform)(version.targetPlatform) : "undefined" /* TargetPlatform.UNDEFINED */;
    }
    function getAllTargetPlatforms(rawGalleryExtension) {
        const allTargetPlatforms = (0, arrays_1.distinct)(rawGalleryExtension.versions.map(getTargetPlatformForExtensionVersion));
        // Is a web extension only if it has WEB_EXTENSION_TAG
        const isWebExtension = !!rawGalleryExtension.tags?.includes(extensionManagement_1.WEB_EXTENSION_TAG);
        // Include Web Target Platform only if it is a web extension
        const webTargetPlatformIndex = allTargetPlatforms.indexOf("web" /* TargetPlatform.WEB */);
        if (isWebExtension) {
            if (webTargetPlatformIndex === -1) {
                // Web extension but does not has web target platform -> add it
                allTargetPlatforms.push("web" /* TargetPlatform.WEB */);
            }
        }
        else {
            if (webTargetPlatformIndex !== -1) {
                // Not a web extension but has web target platform -> remove it
                allTargetPlatforms.splice(webTargetPlatformIndex, 1);
            }
        }
        return allTargetPlatforms;
    }
    function sortExtensionVersions(versions, preferredTargetPlatform) {
        /* It is expected that versions from Marketplace are sorted by version. So we are just sorting by preferred targetPlatform */
        for (let index = 0; index < versions.length; index++) {
            const version = versions[index];
            if (version.version === versions[index - 1]?.version) {
                let insertionIndex = index;
                const versionTargetPlatform = getTargetPlatformForExtensionVersion(version);
                /* put it at the beginning */
                if (versionTargetPlatform === preferredTargetPlatform) {
                    while (insertionIndex > 0 && versions[insertionIndex - 1].version === version.version) {
                        insertionIndex--;
                    }
                }
                if (insertionIndex !== index) {
                    versions.splice(index, 1);
                    versions.splice(insertionIndex, 0, version);
                }
            }
        }
        return versions;
    }
    exports.sortExtensionVersions = sortExtensionVersions;
    function setTelemetry(extension, index, querySource) {
        /* __GDPR__FRAGMENT__
        "GalleryExtensionTelemetryData2" : {
            "index" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
            "querySource": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "queryActivityId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        }
        */
        extension.telemetryData = { index, querySource, queryActivityId: extension.queryContext?.[ACTIVITY_HEADER_NAME] };
    }
    function toExtension(galleryExtension, version, allTargetPlatforms, queryContext) {
        const latestVersion = galleryExtension.versions[0];
        const assets = {
            manifest: getVersionAsset(version, AssetType.Manifest),
            readme: getVersionAsset(version, AssetType.Details),
            changelog: getVersionAsset(version, AssetType.Changelog),
            license: getVersionAsset(version, AssetType.License),
            repository: getRepositoryAsset(version),
            download: getDownloadAsset(version),
            icon: getVersionAsset(version, AssetType.Icon),
            signature: getVersionAsset(version, AssetType.Signature),
            coreTranslations: getCoreTranslationAssets(version)
        };
        return {
            identifier: {
                id: (0, extensionManagementUtil_1.getGalleryExtensionId)(galleryExtension.publisher.publisherName, galleryExtension.extensionName),
                uuid: galleryExtension.extensionId
            },
            name: galleryExtension.extensionName,
            version: version.version,
            displayName: galleryExtension.displayName,
            publisherId: galleryExtension.publisher.publisherId,
            publisher: galleryExtension.publisher.publisherName,
            publisherDisplayName: galleryExtension.publisher.displayName,
            publisherDomain: galleryExtension.publisher.domain ? { link: galleryExtension.publisher.domain, verified: !!galleryExtension.publisher.isDomainVerified } : undefined,
            publisherSponsorLink: getSponsorLink(latestVersion),
            description: galleryExtension.shortDescription || '',
            installCount: getStatistic(galleryExtension.statistics, 'install'),
            rating: getStatistic(galleryExtension.statistics, 'averagerating'),
            ratingCount: getStatistic(galleryExtension.statistics, 'ratingcount'),
            categories: galleryExtension.categories || [],
            tags: galleryExtension.tags || [],
            releaseDate: Date.parse(galleryExtension.releaseDate),
            lastUpdated: Date.parse(galleryExtension.lastUpdated),
            allTargetPlatforms,
            assets,
            properties: {
                dependencies: getExtensions(version, PropertyType.Dependency),
                extensionPack: getExtensions(version, PropertyType.ExtensionPack),
                engine: getEngine(version),
                localizedLanguages: getLocalizedLanguages(version),
                targetPlatform: getTargetPlatformForExtensionVersion(version),
                isPreReleaseVersion: isPreReleaseVersion(version)
            },
            hasPreReleaseVersion: isPreReleaseVersion(latestVersion),
            hasReleaseVersion: true,
            preview: getIsPreview(galleryExtension.flags),
            isSigned: !!assets.signature,
            queryContext,
            supportLink: getSupportLink(latestVersion)
        };
    }
    let AbstractExtensionGalleryService = class AbstractExtensionGalleryService {
        constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
            this.requestService = requestService;
            this.logService = logService;
            this.environmentService = environmentService;
            this.telemetryService = telemetryService;
            this.fileService = fileService;
            this.productService = productService;
            this.configurationService = configurationService;
            const config = productService.extensionsGallery;
            const isPPEEnabled = config?.servicePPEUrl && configurationService.getValue('_extensionsGallery.enablePPE');
            this.extensionsGalleryUrl = isPPEEnabled ? config.servicePPEUrl : config?.serviceUrl;
            this.extensionsGallerySearchUrl = isPPEEnabled ? undefined : config?.searchUrl;
            this.extensionsControlUrl = config?.controlUrl;
            this.commonHeadersPromise = (0, marketplace_1.resolveMarketplaceHeaders)(productService.version, productService, this.environmentService, this.configurationService, this.fileService, storageService, this.telemetryService);
        }
        api(path = '') {
            return `${this.extensionsGalleryUrl}${path}`;
        }
        isEnabled() {
            return !!this.extensionsGalleryUrl;
        }
        async getExtensions(extensionInfos, arg1, arg2) {
            const options = cancellation_1.CancellationToken.isCancellationToken(arg1) ? {} : arg1;
            const token = cancellation_1.CancellationToken.isCancellationToken(arg1) ? arg1 : arg2;
            const names = [];
            const ids = [], includePreReleases = [], versions = [];
            let isQueryForReleaseVersionFromPreReleaseVersion = true;
            for (const extensionInfo of extensionInfos) {
                if (extensionInfo.uuid) {
                    ids.push(extensionInfo.uuid);
                }
                else {
                    names.push(extensionInfo.id);
                }
                // Set includePreRelease to true if version is set, because the version can be a pre-release version
                const includePreRelease = !!(extensionInfo.version || extensionInfo.preRelease);
                includePreReleases.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, includePreRelease });
                if (extensionInfo.version) {
                    versions.push({ id: extensionInfo.id, uuid: extensionInfo.uuid, version: extensionInfo.version });
                }
                isQueryForReleaseVersionFromPreReleaseVersion = isQueryForReleaseVersionFromPreReleaseVersion && (!!extensionInfo.hasPreRelease && !includePreRelease);
            }
            if (!ids.length && !names.length) {
                return [];
            }
            let query = new Query().withPage(1, extensionInfos.length);
            if (ids.length) {
                query = query.withFilter(FilterType.ExtensionId, ...ids);
            }
            if (names.length) {
                query = query.withFilter(FilterType.ExtensionName, ...names);
            }
            if (options.queryAllVersions || isQueryForReleaseVersionFromPreReleaseVersion /* Inlcude all versions if every requested extension is for release version and has pre-release version  */) {
                query = query.withFlags(query.flags, Flags.IncludeVersions);
            }
            if (options.source) {
                query = query.withSource(options.source);
            }
            const { extensions } = await this.queryGalleryExtensions(query, { targetPlatform: options.targetPlatform ?? CURRENT_TARGET_PLATFORM, includePreRelease: includePreReleases, versions, compatible: !!options.compatible }, token);
            if (options.source) {
                extensions.forEach((e, index) => setTelemetry(e, index, options.source));
            }
            return extensions;
        }
        async getCompatibleExtension(extension, includePreRelease, targetPlatform) {
            if ((0, extensionManagement_1.isNotWebExtensionInWebTargetPlatform)(extension.allTargetPlatforms, targetPlatform)) {
                return null;
            }
            if (await this.isExtensionCompatible(extension, includePreRelease, targetPlatform)) {
                return extension;
            }
            const query = new Query()
                .withFlags(Flags.IncludeVersions)
                .withPage(1, 1)
                .withFilter(FilterType.ExtensionId, extension.identifier.uuid);
            const { extensions } = await this.queryGalleryExtensions(query, { targetPlatform, compatible: true, includePreRelease }, cancellation_1.CancellationToken.None);
            return extensions[0] || null;
        }
        async isExtensionCompatible(extension, includePreRelease, targetPlatform) {
            if (!(0, extensionManagement_1.isTargetPlatformCompatible)(extension.properties.targetPlatform, extension.allTargetPlatforms, targetPlatform)) {
                return false;
            }
            if (!includePreRelease && extension.properties.isPreReleaseVersion) {
                // Pre-releases are not allowed when include pre-release flag is not set
                return false;
            }
            let engine = extension.properties.engine;
            if (!engine) {
                const manifest = await this.getManifest(extension, cancellation_1.CancellationToken.None);
                if (!manifest) {
                    throw new Error('Manifest was not found');
                }
                engine = manifest.engines.vscode;
            }
            return (0, extensionValidator_1.isEngineValid)(engine, this.productService.version, this.productService.date);
        }
        async isValidVersion(rawGalleryExtensionVersion, versionType, compatible, allTargetPlatforms, targetPlatform) {
            if (!(0, extensionManagement_1.isTargetPlatformCompatible)(getTargetPlatformForExtensionVersion(rawGalleryExtensionVersion), allTargetPlatforms, targetPlatform)) {
                return false;
            }
            if (versionType !== 'any' && isPreReleaseVersion(rawGalleryExtensionVersion) !== (versionType === 'prerelease')) {
                return false;
            }
            if (compatible) {
                try {
                    const engine = await this.getEngine(rawGalleryExtensionVersion);
                    if (!(0, extensionValidator_1.isEngineValid)(engine, this.productService.version, this.productService.date)) {
                        return false;
                    }
                }
                catch (error) {
                    this.logService.error(`Error while getting the engine for the version ${rawGalleryExtensionVersion.version}.`, (0, errors_1.getErrorMessage)(error));
                    return false;
                }
            }
            return true;
        }
        async query(options, token) {
            let text = options.text || '';
            const pageSize = options.pageSize ?? 50;
            let query = new Query()
                .withPage(1, pageSize);
            if (text) {
                // Use category filter instead of "category:themes"
                text = text.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category) => {
                    query = query.withFilter(FilterType.Category, category || quotedCategory);
                    return '';
                });
                // Use tag filter instead of "tag:debuggers"
                text = text.replace(/\btag:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedTag, tag) => {
                    query = query.withFilter(FilterType.Tag, tag || quotedTag);
                    return '';
                });
                // Use featured filter
                text = text.replace(/\bfeatured(\s+|\b|$)/g, () => {
                    query = query.withFilter(FilterType.Featured);
                    return '';
                });
                text = text.trim();
                if (text) {
                    text = text.length < 200 ? text : text.substring(0, 200);
                    query = query.withFilter(FilterType.SearchText, text);
                }
                query = query.withSortBy(0 /* SortBy.NoneOrRelevance */);
            }
            else if (options.ids) {
                query = query.withFilter(FilterType.ExtensionId, ...options.ids);
            }
            else if (options.names) {
                query = query.withFilter(FilterType.ExtensionName, ...options.names);
            }
            else {
                query = query.withSortBy(4 /* SortBy.InstallCount */);
            }
            if (typeof options.sortBy === 'number') {
                query = query.withSortBy(options.sortBy);
            }
            if (typeof options.sortOrder === 'number') {
                query = query.withSortOrder(options.sortOrder);
            }
            if (options.source) {
                query = query.withSource(options.source);
            }
            const runQuery = async (query, token) => {
                const { extensions, total } = await this.queryGalleryExtensions(query, { targetPlatform: CURRENT_TARGET_PLATFORM, compatible: false, includePreRelease: !!options.includePreRelease }, token);
                extensions.forEach((e, index) => setTelemetry(e, ((query.pageNumber - 1) * query.pageSize) + index, options.source));
                return { extensions, total };
            };
            const { extensions, total } = await runQuery(query, token);
            const getPage = async (pageIndex, ct) => {
                if (ct.isCancellationRequested) {
                    throw new errors_1.CancellationError();
                }
                const { extensions } = await runQuery(query.withPage(pageIndex + 1), ct);
                return extensions;
            };
            return { firstPage: extensions, total, pageSize: query.pageSize, getPage };
        }
        async queryGalleryExtensions(query, criteria, token) {
            const flags = query.flags;
            /**
             * If both version flags (IncludeLatestVersionOnly and IncludeVersions) are included, then only include latest versions (IncludeLatestVersionOnly) flag.
             */
            if (!!(query.flags & Flags.IncludeLatestVersionOnly) && !!(query.flags & Flags.IncludeVersions)) {
                query = query.withFlags(query.flags & ~Flags.IncludeVersions, Flags.IncludeLatestVersionOnly);
            }
            /**
             * If version flags (IncludeLatestVersionOnly and IncludeVersions) are not included, default is to query for latest versions (IncludeLatestVersionOnly).
             */
            if (!(query.flags & Flags.IncludeLatestVersionOnly) && !(query.flags & Flags.IncludeVersions)) {
                query = query.withFlags(query.flags, Flags.IncludeLatestVersionOnly);
            }
            /**
             * If versions criteria exist, then remove IncludeLatestVersionOnly flag and add IncludeVersions flag.
             */
            if (criteria.versions?.length) {
                query = query.withFlags(query.flags & ~Flags.IncludeLatestVersionOnly, Flags.IncludeVersions);
            }
            /**
             * Add necessary extension flags
             */
            query = query.withFlags(query.flags, Flags.IncludeAssetUri, Flags.IncludeCategoryAndTags, Flags.IncludeFiles, Flags.IncludeStatistics, Flags.IncludeVersionProperties);
            const { galleryExtensions: rawGalleryExtensions, total, context } = await this.queryRawGalleryExtensions(query, token);
            const hasAllVersions = !(query.flags & Flags.IncludeLatestVersionOnly);
            if (hasAllVersions) {
                const extensions = [];
                for (const rawGalleryExtension of rawGalleryExtensions) {
                    const extension = await this.toGalleryExtensionWithCriteria(rawGalleryExtension, criteria, context);
                    if (extension) {
                        extensions.push(extension);
                    }
                }
                return { extensions, total };
            }
            const result = [];
            const needAllVersions = new Map();
            for (let index = 0; index < rawGalleryExtensions.length; index++) {
                const rawGalleryExtension = rawGalleryExtensions[index];
                const extensionIdentifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
                const includePreRelease = (0, types_1.isBoolean)(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find(extensionIdentifierWithPreRelease => (0, extensionManagementUtil_1.areSameExtensions)(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
                if (criteria.compatible && (0, extensionManagement_1.isNotWebExtensionInWebTargetPlatform)(getAllTargetPlatforms(rawGalleryExtension), criteria.targetPlatform)) {
                    /** Skip if requested for a web-compatible extension and it is not a web extension.
                     * All versions are not needed in this case
                    */
                    continue;
                }
                const extension = await this.toGalleryExtensionWithCriteria(rawGalleryExtension, criteria, context);
                if (!extension
                    /** Need all versions if the extension is a pre-release version but
                     * 		- the query is to look for a release version or
                     * 		- the extension has no release version
                     * Get all versions to get or check the release version
                    */
                    || (extension.properties.isPreReleaseVersion && (!includePreRelease || !extension.hasReleaseVersion))
                    /**
                     * Need all versions if the extension is a release version with a different target platform than requested and also has a pre-release version
                     * Because, this is a platform specific extension and can have a newer release version supporting this platform.
                     * See https://github.com/microsoft/vscode/issues/139628
                    */
                    || (!extension.properties.isPreReleaseVersion && extension.properties.targetPlatform !== criteria.targetPlatform && extension.hasPreReleaseVersion)) {
                    needAllVersions.set(rawGalleryExtension.extensionId, index);
                }
                else {
                    result.push([index, extension]);
                }
            }
            if (needAllVersions.size) {
                const stopWatch = new stopwatch_1.StopWatch();
                const query = new Query()
                    .withFlags(flags & ~Flags.IncludeLatestVersionOnly, Flags.IncludeVersions)
                    .withPage(1, needAllVersions.size)
                    .withFilter(FilterType.ExtensionId, ...needAllVersions.keys());
                const { extensions } = await this.queryGalleryExtensions(query, criteria, token);
                this.telemetryService.publicLog2('galleryService:additionalQuery', {
                    duration: stopWatch.elapsed(),
                    count: needAllVersions.size
                });
                for (const extension of extensions) {
                    const index = needAllVersions.get(extension.identifier.uuid);
                    result.push([index, extension]);
                }
            }
            return { extensions: result.sort((a, b) => a[0] - b[0]).map(([, extension]) => extension), total };
        }
        async toGalleryExtensionWithCriteria(rawGalleryExtension, criteria, queryContext) {
            const extensionIdentifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(rawGalleryExtension.publisher.publisherName, rawGalleryExtension.extensionName), uuid: rawGalleryExtension.extensionId };
            const version = criteria.versions?.find(extensionIdentifierWithVersion => (0, extensionManagementUtil_1.areSameExtensions)(extensionIdentifierWithVersion, extensionIdentifier))?.version;
            const includePreRelease = (0, types_1.isBoolean)(criteria.includePreRelease) ? criteria.includePreRelease : !!criteria.includePreRelease.find(extensionIdentifierWithPreRelease => (0, extensionManagementUtil_1.areSameExtensions)(extensionIdentifierWithPreRelease, extensionIdentifier))?.includePreRelease;
            const allTargetPlatforms = getAllTargetPlatforms(rawGalleryExtension);
            const rawGalleryExtensionVersions = sortExtensionVersions(rawGalleryExtension.versions, criteria.targetPlatform);
            if (criteria.compatible && (0, extensionManagement_1.isNotWebExtensionInWebTargetPlatform)(allTargetPlatforms, criteria.targetPlatform)) {
                return null;
            }
            for (let index = 0; index < rawGalleryExtensionVersions.length; index++) {
                const rawGalleryExtensionVersion = rawGalleryExtensionVersions[index];
                if (version && rawGalleryExtensionVersion.version !== version) {
                    continue;
                }
                // Allow any version if includePreRelease flag is set otherwise only release versions are allowed
                if (await this.isValidVersion(rawGalleryExtensionVersion, includePreRelease ? 'any' : 'release', criteria.compatible, allTargetPlatforms, criteria.targetPlatform)) {
                    return toExtension(rawGalleryExtension, rawGalleryExtensionVersion, allTargetPlatforms, queryContext);
                }
                if (version && rawGalleryExtensionVersion.version === version) {
                    return null;
                }
            }
            if (version || criteria.compatible) {
                return null;
            }
            /**
             * Fallback: Return the latest version
             * This can happen when the extension does not have a release version or does not have a version compatible with the given target platform.
             */
            return toExtension(rawGalleryExtension, rawGalleryExtension.versions[0], allTargetPlatforms);
        }
        async queryRawGalleryExtensions(query, token) {
            if (!this.isEnabled()) {
                throw new Error('No extension gallery service configured.');
            }
            query = query
                /* Always exclude non validated extensions */
                .withFlags(query.flags, Flags.ExcludeNonValidated)
                .withFilter(FilterType.Target, 'Microsoft.VisualStudio.Code')
                /* Always exclude unpublished extensions */
                .withFilter(FilterType.ExcludeWithFlags, flagsToString(Flags.Unpublished));
            const commonHeaders = await this.commonHeadersPromise;
            const data = JSON.stringify(query.raw);
            const headers = {
                ...commonHeaders,
                'Content-Type': 'application/json',
                'Accept': 'application/json;api-version=3.0-preview.1',
                'Accept-Encoding': 'gzip',
                'Content-Length': String(data.length),
            };
            const stopWatch = new stopwatch_1.StopWatch();
            let context, error, total = 0;
            try {
                context = await this.requestService.request({
                    type: 'POST',
                    url: this.extensionsGallerySearchUrl && query.criteria.some(c => c.filterType === FilterType.SearchText) ? this.extensionsGallerySearchUrl : this.api('/extensionquery'),
                    data,
                    headers
                }, token);
                if (context.res.statusCode && context.res.statusCode >= 400 && context.res.statusCode < 500) {
                    return { galleryExtensions: [], total };
                }
                const result = await (0, request_1.asJson)(context);
                if (result) {
                    const r = result.results[0];
                    const galleryExtensions = r.extensions;
                    const resultCount = r.resultMetadata && r.resultMetadata.filter(m => m.metadataType === 'ResultCount')[0];
                    total = resultCount && resultCount.metadataItems.filter(i => i.name === 'TotalCount')[0].count || 0;
                    return {
                        galleryExtensions,
                        total,
                        context: {
                            [ACTIVITY_HEADER_NAME]: context.res.headers['activityid']
                        }
                    };
                }
                return { galleryExtensions: [], total };
            }
            catch (e) {
                const errorCode = (0, errors_1.isCancellationError)(e) ? extensionManagement_1.ExtensionGalleryErrorCode.Cancelled : (0, errors_1.getErrorMessage)(e).startsWith('XHR timeout') ? extensionManagement_1.ExtensionGalleryErrorCode.Timeout : extensionManagement_1.ExtensionGalleryErrorCode.Failed;
                error = new extensionManagement_1.ExtensionGalleryError((0, errors_1.getErrorMessage)(e), errorCode);
                throw error;
            }
            finally {
                this.telemetryService.publicLog2('galleryService:query', {
                    ...query.telemetryData,
                    requestBodySize: String(data.length),
                    duration: stopWatch.elapsed(),
                    success: !!context && (0, request_1.isSuccess)(context),
                    responseBodySize: context?.res.headers['Content-Length'],
                    statusCode: context ? String(context.res.statusCode) : undefined,
                    errorCode: error?.code,
                    count: String(total)
                });
            }
        }
        async reportStatistic(publisher, name, version, type) {
            if (!this.isEnabled()) {
                return undefined;
            }
            const url = platform_1.isWeb ? this.api(`/itemName/${publisher}.${name}/version/${version}/statType/${type === "install" /* StatisticType.Install */ ? '1' : '3'}/vscodewebextension`) : this.api(`/publishers/${publisher}/extensions/${name}/${version}/stats?statType=${type}`);
            const Accept = platform_1.isWeb ? 'api-version=6.1-preview.1' : '*/*;api-version=4.0-preview.1';
            const commonHeaders = await this.commonHeadersPromise;
            const headers = { ...commonHeaders, Accept };
            try {
                await this.requestService.request({
                    type: 'POST',
                    url,
                    headers
                }, cancellation_1.CancellationToken.None);
            }
            catch (error) { /* Ignore */ }
        }
        async download(extension, location, operation) {
            this.logService.trace('ExtensionGalleryService#download', extension.identifier.id);
            const data = (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(extension);
            const startTime = new Date().getTime();
            /* __GDPR__
                "galleryService:downloadVSIX" : {
                    "owner": "sandy081",
                    "duration": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            const log = (duration) => this.telemetryService.publicLog('galleryService:downloadVSIX', { ...data, duration });
            const operationParam = operation === 2 /* InstallOperation.Install */ ? 'install' : operation === 3 /* InstallOperation.Update */ ? 'update' : '';
            const downloadAsset = operationParam ? {
                uri: `${extension.assets.download.uri}${uri_1.URI.parse(extension.assets.download.uri).query ? '&' : '?'}${operationParam}=true`,
                fallbackUri: `${extension.assets.download.fallbackUri}${uri_1.URI.parse(extension.assets.download.fallbackUri).query ? '&' : '?'}${operationParam}=true`
            } : extension.assets.download;
            const headers = extension.queryContext?.[ACTIVITY_HEADER_NAME] ? { [ACTIVITY_HEADER_NAME]: extension.queryContext[ACTIVITY_HEADER_NAME] } : undefined;
            const context = await this.getAsset(downloadAsset, headers ? { headers } : undefined);
            await this.fileService.writeFile(location, context.stream);
            log(new Date().getTime() - startTime);
        }
        async downloadSignatureArchive(extension, location) {
            if (!extension.assets.signature) {
                throw new Error('No signature asset found');
            }
            this.logService.trace('ExtensionGalleryService#downloadSignatureArchive', extension.identifier.id);
            const context = await this.getAsset(extension.assets.signature);
            await this.fileService.writeFile(location, context.stream);
        }
        async getReadme(extension, token) {
            if (extension.assets.readme) {
                const context = await this.getAsset(extension.assets.readme, {}, token);
                const content = await (0, request_1.asTextOrError)(context);
                return content || '';
            }
            return '';
        }
        async getManifest(extension, token) {
            if (extension.assets.manifest) {
                const context = await this.getAsset(extension.assets.manifest, {}, token);
                const text = await (0, request_1.asTextOrError)(context);
                return text ? JSON.parse(text) : null;
            }
            return null;
        }
        async getManifestFromRawExtensionVersion(rawExtensionVersion, token) {
            const manifestAsset = getVersionAsset(rawExtensionVersion, AssetType.Manifest);
            if (!manifestAsset) {
                throw new Error('Manifest was not found');
            }
            const headers = { 'Accept-Encoding': 'gzip' };
            const context = await this.getAsset(manifestAsset, { headers });
            return await (0, request_1.asJson)(context);
        }
        async getCoreTranslation(extension, languageId) {
            const asset = extension.assets.coreTranslations.filter(t => t[0] === languageId.toUpperCase())[0];
            if (asset) {
                const context = await this.getAsset(asset[1]);
                const text = await (0, request_1.asTextOrError)(context);
                return text ? JSON.parse(text) : null;
            }
            return null;
        }
        async getChangelog(extension, token) {
            if (extension.assets.changelog) {
                const context = await this.getAsset(extension.assets.changelog, {}, token);
                const content = await (0, request_1.asTextOrError)(context);
                return content || '';
            }
            return '';
        }
        async getAllCompatibleVersions(extension, includePreRelease, targetPlatform) {
            let query = new Query()
                .withFlags(Flags.IncludeVersions, Flags.IncludeCategoryAndTags, Flags.IncludeFiles, Flags.IncludeVersionProperties)
                .withPage(1, 1);
            if (extension.identifier.uuid) {
                query = query.withFilter(FilterType.ExtensionId, extension.identifier.uuid);
            }
            else {
                query = query.withFilter(FilterType.ExtensionName, extension.identifier.id);
            }
            const { galleryExtensions } = await this.queryRawGalleryExtensions(query, cancellation_1.CancellationToken.None);
            if (!galleryExtensions.length) {
                return [];
            }
            const allTargetPlatforms = getAllTargetPlatforms(galleryExtensions[0]);
            if ((0, extensionManagement_1.isNotWebExtensionInWebTargetPlatform)(allTargetPlatforms, targetPlatform)) {
                return [];
            }
            const validVersions = [];
            await Promise.all(galleryExtensions[0].versions.map(async (version) => {
                try {
                    if (await this.isValidVersion(version, includePreRelease ? 'any' : 'release', true, allTargetPlatforms, targetPlatform)) {
                        validVersions.push(version);
                    }
                }
                catch (error) { /* Ignore error and skip version */ }
            }));
            const result = [];
            const seen = new Set();
            for (const version of sortExtensionVersions(validVersions, targetPlatform)) {
                if (!seen.has(version.version)) {
                    seen.add(version.version);
                    result.push({ version: version.version, date: version.lastUpdated, isPreReleaseVersion: isPreReleaseVersion(version) });
                }
            }
            return result;
        }
        async getAsset(asset, options = {}, token = cancellation_1.CancellationToken.None) {
            const commonHeaders = await this.commonHeadersPromise;
            const baseOptions = { type: 'GET' };
            const headers = { ...commonHeaders, ...(options.headers || {}) };
            options = { ...options, ...baseOptions, headers };
            const url = asset.uri;
            const fallbackUrl = asset.fallbackUri;
            const firstOptions = { ...options, url };
            try {
                const context = await this.requestService.request(firstOptions, token);
                if (context.res.statusCode === 200) {
                    return context;
                }
                const message = await (0, request_1.asTextOrError)(context);
                throw new Error(`Expected 200, got back ${context.res.statusCode} instead.\n\n${message}`);
            }
            catch (err) {
                if ((0, errors_1.isCancellationError)(err)) {
                    throw err;
                }
                const message = (0, errors_1.getErrorMessage)(err);
                this.telemetryService.publicLog2('galleryService:cdnFallback', { url, message });
                const fallbackOptions = { ...options, url: fallbackUrl };
                return this.requestService.request(fallbackOptions, token);
            }
        }
        async getEngine(rawExtensionVersion) {
            let engine = getEngine(rawExtensionVersion);
            if (!engine) {
                const manifest = await this.getManifestFromRawExtensionVersion(rawExtensionVersion, cancellation_1.CancellationToken.None);
                if (!manifest) {
                    throw new Error('Manifest was not found');
                }
                engine = manifest.engines.vscode;
            }
            return engine;
        }
        async getExtensionsControlManifest() {
            if (!this.isEnabled()) {
                throw new Error('No extension gallery service configured.');
            }
            if (!this.extensionsControlUrl) {
                return { malicious: [], deprecated: {}, search: [] };
            }
            const context = await this.requestService.request({ type: 'GET', url: this.extensionsControlUrl }, cancellation_1.CancellationToken.None);
            if (context.res.statusCode !== 200) {
                throw new Error('Could not get extensions report.');
            }
            const result = await (0, request_1.asJson)(context);
            const malicious = [];
            const deprecated = {};
            const search = [];
            if (result) {
                for (const id of result.malicious) {
                    malicious.push({ id });
                }
                if (result.migrateToPreRelease) {
                    for (const [unsupportedPreReleaseExtensionId, preReleaseExtensionInfo] of Object.entries(result.migrateToPreRelease)) {
                        if (!preReleaseExtensionInfo.engine || (0, extensionValidator_1.isEngineValid)(preReleaseExtensionInfo.engine, this.productService.version, this.productService.date)) {
                            deprecated[unsupportedPreReleaseExtensionId.toLowerCase()] = {
                                disallowInstall: true,
                                extension: {
                                    id: preReleaseExtensionInfo.id,
                                    displayName: preReleaseExtensionInfo.displayName,
                                    autoMigrate: { storage: !!preReleaseExtensionInfo.migrateStorage },
                                    preRelease: true
                                }
                            };
                        }
                    }
                }
                if (result.deprecated) {
                    for (const [deprecatedExtensionId, deprecationInfo] of Object.entries(result.deprecated)) {
                        if (deprecationInfo) {
                            deprecated[deprecatedExtensionId.toLowerCase()] = (0, types_1.isBoolean)(deprecationInfo) ? {} : deprecationInfo;
                        }
                    }
                }
                if (result.search) {
                    for (const s of result.search) {
                        search.push(s);
                    }
                }
            }
            return { malicious, deprecated, search };
        }
    };
    AbstractExtensionGalleryService = __decorate([
        __param(1, request_1.IRequestService),
        __param(2, log_1.ILogService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, files_1.IFileService),
        __param(6, productService_1.IProductService),
        __param(7, configuration_1.IConfigurationService)
    ], AbstractExtensionGalleryService);
    let ExtensionGalleryService = class ExtensionGalleryService extends AbstractExtensionGalleryService {
        constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
            super(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
        }
    };
    exports.ExtensionGalleryService = ExtensionGalleryService;
    exports.ExtensionGalleryService = ExtensionGalleryService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, request_1.IRequestService),
        __param(2, log_1.ILogService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, files_1.IFileService),
        __param(6, productService_1.IProductService),
        __param(7, configuration_1.IConfigurationService)
    ], ExtensionGalleryService);
    let ExtensionGalleryServiceWithNoStorageService = class ExtensionGalleryServiceWithNoStorageService extends AbstractExtensionGalleryService {
        constructor(requestService, logService, environmentService, telemetryService, fileService, productService, configurationService) {
            super(undefined, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService);
        }
    };
    exports.ExtensionGalleryServiceWithNoStorageService = ExtensionGalleryServiceWithNoStorageService;
    exports.ExtensionGalleryServiceWithNoStorageService = ExtensionGalleryServiceWithNoStorageService = __decorate([
        __param(0, request_1.IRequestService),
        __param(1, log_1.ILogService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, files_1.IFileService),
        __param(5, productService_1.IProductService),
        __param(6, configuration_1.IConfigurationService)
    ], ExtensionGalleryServiceWithNoStorageService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uR2FsbGVyeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2V4dGVuc2lvbkdhbGxlcnlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTJCaEcsTUFBTSx1QkFBdUIsR0FBRyxnQkFBSyxDQUFDLENBQUMsZ0NBQW9CLENBQUMsQ0FBQyxJQUFBLHVDQUFpQixFQUFDLG1CQUFRLEVBQUUsY0FBSSxDQUFDLENBQUM7SUFDL0YsTUFBTSxvQkFBb0IsR0FBRyw2QkFBNkIsQ0FBQztJQXNFM0QsSUFBSyxLQThFSjtJQTlFRCxXQUFLLEtBQUs7UUFFVDs7V0FFRztRQUNILGlDQUFVLENBQUE7UUFFVjs7V0FFRztRQUNILHVEQUFxQixDQUFBO1FBRXJCOzs7Ozs7O1dBT0c7UUFDSCxpREFBa0IsQ0FBQTtRQUVsQjs7V0FFRztRQUNILHFFQUE0QixDQUFBO1FBRTVCOzs7V0FHRztRQUNILG1FQUEyQixDQUFBO1FBRTNCOztXQUVHO1FBQ0gsMEVBQStCLENBQUE7UUFFL0I7OztXQUdHO1FBQ0gsZ0VBQTBCLENBQUE7UUFFMUI7O1dBRUc7UUFDSCw4RUFBaUMsQ0FBQTtRQUVqQzs7V0FFRztRQUNILHlEQUFzQixDQUFBO1FBRXRCOztXQUVHO1FBQ0gsNkRBQXlCLENBQUE7UUFFekI7Ozs7O1dBS0c7UUFDSCwyRUFBZ0MsQ0FBQTtRQUVoQzs7OztXQUlHO1FBQ0gsa0RBQW9CLENBQUE7UUFFcEI7O1dBRUc7UUFDSCwyRUFBZ0MsQ0FBQTtJQUNqQyxDQUFDLEVBOUVJLEtBQUssS0FBTCxLQUFLLFFBOEVUO0lBRUQsU0FBUyxhQUFhLENBQUMsR0FBRyxLQUFjO1FBQ3ZDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMs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
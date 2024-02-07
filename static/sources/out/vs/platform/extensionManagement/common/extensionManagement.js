/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PreferencesLocalizedLabel = exports.ExtensionsLocalizedLabel = exports.ExtensionsLabel = exports.IExtensionTipsService = exports.IGlobalExtensionEnablementService = exports.ENABLED_EXTENSIONS_STORAGE_PATH = exports.DISABLED_EXTENSIONS_STORAGE_PATH = exports.IExtensionManagementService = exports.ExtensionGalleryError = exports.ExtensionGalleryErrorCode = exports.ExtensionManagementError = exports.ExtensionSignaturetErrorCode = exports.ExtensionManagementErrorCode = exports.IExtensionGalleryService = exports.InstallOperation = exports.StatisticType = exports.SortOrder = exports.SortBy = exports.isIExtensionIdentifier = exports.isTargetPlatformCompatible = exports.isNotWebExtensionInWebTargetPlatform = exports.getTargetPlatform = exports.toTargetPlatform = exports.TargetPlatformToString = exports.EXTENSION_INSTALL_DEP_PACK_CONTEXT = exports.EXTENSION_INSTALL_SYNC_CONTEXT = exports.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = exports.WEB_EXTENSION_TAG = exports.EXTENSION_IDENTIFIER_REGEX = exports.EXTENSION_IDENTIFIER_PATTERN = void 0;
    exports.EXTENSION_IDENTIFIER_PATTERN = '^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$';
    exports.EXTENSION_IDENTIFIER_REGEX = new RegExp(exports.EXTENSION_IDENTIFIER_PATTERN);
    exports.WEB_EXTENSION_TAG = '__web_extension';
    exports.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = 'skipWalkthrough';
    exports.EXTENSION_INSTALL_SYNC_CONTEXT = 'extensionsSync';
    exports.EXTENSION_INSTALL_DEP_PACK_CONTEXT = 'dependecyOrPackExtensionInstall';
    function TargetPlatformToString(targetPlatform) {
        switch (targetPlatform) {
            case "win32-x64" /* TargetPlatform.WIN32_X64 */: return 'Windows 64 bit';
            case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return 'Windows ARM';
            case "linux-x64" /* TargetPlatform.LINUX_X64 */: return 'Linux 64 bit';
            case "linux-arm64" /* TargetPlatform.LINUX_ARM64 */: return 'Linux ARM 64';
            case "linux-armhf" /* TargetPlatform.LINUX_ARMHF */: return 'Linux ARM';
            case "alpine-x64" /* TargetPlatform.ALPINE_X64 */: return 'Alpine Linux 64 bit';
            case "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */: return 'Alpine ARM 64';
            case "darwin-x64" /* TargetPlatform.DARWIN_X64 */: return 'Mac';
            case "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */: return 'Mac Silicon';
            case "web" /* TargetPlatform.WEB */: return 'Web';
            case "universal" /* TargetPlatform.UNIVERSAL */: return "universal" /* TargetPlatform.UNIVERSAL */;
            case "unknown" /* TargetPlatform.UNKNOWN */: return "unknown" /* TargetPlatform.UNKNOWN */;
            case "undefined" /* TargetPlatform.UNDEFINED */: return "undefined" /* TargetPlatform.UNDEFINED */;
        }
    }
    exports.TargetPlatformToString = TargetPlatformToString;
    function toTargetPlatform(targetPlatform) {
        switch (targetPlatform) {
            case "win32-x64" /* TargetPlatform.WIN32_X64 */: return "win32-x64" /* TargetPlatform.WIN32_X64 */;
            case "win32-arm64" /* TargetPlatform.WIN32_ARM64 */: return "win32-arm64" /* TargetPlatform.WIN32_ARM64 */;
            case "linux-x64" /* TargetPlatform.LINUX_X64 */: return "linux-x64" /* TargetPlatform.LINUX_X64 */;
            case "linux-arm64" /* TargetPlatform.LINUX_ARM64 */: return "linux-arm64" /* TargetPlatform.LINUX_ARM64 */;
            case "linux-armhf" /* TargetPlatform.LINUX_ARMHF */: return "linux-armhf" /* TargetPlatform.LINUX_ARMHF */;
            case "alpine-x64" /* TargetPlatform.ALPINE_X64 */: return "alpine-x64" /* TargetPlatform.ALPINE_X64 */;
            case "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */: return "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */;
            case "darwin-x64" /* TargetPlatform.DARWIN_X64 */: return "darwin-x64" /* TargetPlatform.DARWIN_X64 */;
            case "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */: return "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */;
            case "web" /* TargetPlatform.WEB */: return "web" /* TargetPlatform.WEB */;
            case "universal" /* TargetPlatform.UNIVERSAL */: return "universal" /* TargetPlatform.UNIVERSAL */;
            default: return "unknown" /* TargetPlatform.UNKNOWN */;
        }
    }
    exports.toTargetPlatform = toTargetPlatform;
    function getTargetPlatform(platform, arch) {
        switch (platform) {
            case 3 /* Platform.Windows */:
                if (arch === 'x64') {
                    return "win32-x64" /* TargetPlatform.WIN32_X64 */;
                }
                if (arch === 'arm64') {
                    return "win32-arm64" /* TargetPlatform.WIN32_ARM64 */;
                }
                return "unknown" /* TargetPlatform.UNKNOWN */;
            case 2 /* Platform.Linux */:
                if (arch === 'x64') {
                    return "linux-x64" /* TargetPlatform.LINUX_X64 */;
                }
                if (arch === 'arm64') {
                    return "linux-arm64" /* TargetPlatform.LINUX_ARM64 */;
                }
                if (arch === 'arm') {
                    return "linux-armhf" /* TargetPlatform.LINUX_ARMHF */;
                }
                return "unknown" /* TargetPlatform.UNKNOWN */;
            case 'alpine':
                if (arch === 'x64') {
                    return "alpine-x64" /* TargetPlatform.ALPINE_X64 */;
                }
                if (arch === 'arm64') {
                    return "alpine-arm64" /* TargetPlatform.ALPINE_ARM64 */;
                }
                return "unknown" /* TargetPlatform.UNKNOWN */;
            case 1 /* Platform.Mac */:
                if (arch === 'x64') {
                    return "darwin-x64" /* TargetPlatform.DARWIN_X64 */;
                }
                if (arch === 'arm64') {
                    return "darwin-arm64" /* TargetPlatform.DARWIN_ARM64 */;
                }
                return "unknown" /* TargetPlatform.UNKNOWN */;
            case 0 /* Platform.Web */: return "web" /* TargetPlatform.WEB */;
        }
    }
    exports.getTargetPlatform = getTargetPlatform;
    function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform) {
        // Not a web extension in web target platform
        return productTargetPlatform === "web" /* TargetPlatform.WEB */ && !allTargetPlatforms.includes("web" /* TargetPlatform.WEB */);
    }
    exports.isNotWebExtensionInWebTargetPlatform = isNotWebExtensionInWebTargetPlatform;
    function isTargetPlatformCompatible(extensionTargetPlatform, allTargetPlatforms, productTargetPlatform) {
        // Not compatible when extension is not a web extension in web target platform
        if (isNotWebExtensionInWebTargetPlatform(allTargetPlatforms, productTargetPlatform)) {
            return false;
        }
        // Compatible when extension target platform is not defined
        if (extensionTargetPlatform === "undefined" /* TargetPlatform.UNDEFINED */) {
            return true;
        }
        // Compatible when extension target platform is universal
        if (extensionTargetPlatform === "universal" /* TargetPlatform.UNIVERSAL */) {
            return true;
        }
        // Not compatible when extension target platform is unknown
        if (extensionTargetPlatform === "unknown" /* TargetPlatform.UNKNOWN */) {
            return false;
        }
        // Compatible when extension and product target platforms matches
        if (extensionTargetPlatform === productTargetPlatform) {
            return true;
        }
        return false;
    }
    exports.isTargetPlatformCompatible = isTargetPlatformCompatible;
    function isIExtensionIdentifier(thing) {
        return thing
            && typeof thing === 'object'
            && typeof thing.id === 'string'
            && (!thing.uuid || typeof thing.uuid === 'string');
    }
    exports.isIExtensionIdentifier = isIExtensionIdentifier;
    var SortBy;
    (function (SortBy) {
        SortBy[SortBy["NoneOrRelevance"] = 0] = "NoneOrRelevance";
        SortBy[SortBy["LastUpdatedDate"] = 1] = "LastUpdatedDate";
        SortBy[SortBy["Title"] = 2] = "Title";
        SortBy[SortBy["PublisherName"] = 3] = "PublisherName";
        SortBy[SortBy["InstallCount"] = 4] = "InstallCount";
        SortBy[SortBy["PublishedDate"] = 10] = "PublishedDate";
        SortBy[SortBy["AverageRating"] = 6] = "AverageRating";
        SortBy[SortBy["WeightedRating"] = 12] = "WeightedRating";
    })(SortBy || (exports.SortBy = SortBy = {}));
    var SortOrder;
    (function (SortOrder) {
        SortOrder[SortOrder["Default"] = 0] = "Default";
        SortOrder[SortOrder["Ascending"] = 1] = "Ascending";
        SortOrder[SortOrder["Descending"] = 2] = "Descending";
    })(SortOrder || (exports.SortOrder = SortOrder = {}));
    var StatisticType;
    (function (StatisticType) {
        StatisticType["Install"] = "install";
        StatisticType["Uninstall"] = "uninstall";
    })(StatisticType || (exports.StatisticType = StatisticType = {}));
    var InstallOperation;
    (function (InstallOperation) {
        InstallOperation[InstallOperation["None"] = 1] = "None";
        InstallOperation[InstallOperation["Install"] = 2] = "Install";
        InstallOperation[InstallOperation["Update"] = 3] = "Update";
        InstallOperation[InstallOperation["Migrate"] = 4] = "Migrate";
    })(InstallOperation || (exports.InstallOperation = InstallOperation = {}));
    exports.IExtensionGalleryService = (0, instantiation_1.createDecorator)('extensionGalleryService');
    var ExtensionManagementErrorCode;
    (function (ExtensionManagementErrorCode) {
        ExtensionManagementErrorCode["Unsupported"] = "Unsupported";
        ExtensionManagementErrorCode["Deprecated"] = "Deprecated";
        ExtensionManagementErrorCode["Malicious"] = "Malicious";
        ExtensionManagementErrorCode["Incompatible"] = "Incompatible";
        ExtensionManagementErrorCode["IncompatibleTargetPlatform"] = "IncompatibleTargetPlatform";
        ExtensionManagementErrorCode["ReleaseVersionNotFound"] = "ReleaseVersionNotFound";
        ExtensionManagementErrorCode["Invalid"] = "Invalid";
        ExtensionManagementErrorCode["Download"] = "Download";
        ExtensionManagementErrorCode["DownloadSignature"] = "DownloadSignature";
        ExtensionManagementErrorCode["UpdateMetadata"] = "UpdateMetadata";
        ExtensionManagementErrorCode["Extract"] = "Extract";
        ExtensionManagementErrorCode["Scanning"] = "Scanning";
        ExtensionManagementErrorCode["Delete"] = "Delete";
        ExtensionManagementErrorCode["Rename"] = "Rename";
        ExtensionManagementErrorCode["CorruptZip"] = "CorruptZip";
        ExtensionManagementErrorCode["IncompleteZip"] = "IncompleteZip";
        ExtensionManagementErrorCode["Signature"] = "Signature";
        ExtensionManagementErrorCode["NotAllowed"] = "NotAllowed";
        ExtensionManagementErrorCode["Gallery"] = "Gallery";
        ExtensionManagementErrorCode["Unknown"] = "Unknown";
        ExtensionManagementErrorCode["Internal"] = "Internal";
    })(ExtensionManagementErrorCode || (exports.ExtensionManagementErrorCode = ExtensionManagementErrorCode = {}));
    var ExtensionSignaturetErrorCode;
    (function (ExtensionSignaturetErrorCode) {
        ExtensionSignaturetErrorCode["UnknownError"] = "UnknownError";
        ExtensionSignaturetErrorCode["PackageIsInvalidZip"] = "PackageIsInvalidZip";
        ExtensionSignaturetErrorCode["SignatureArchiveIsInvalidZip"] = "SignatureArchiveIsInvalidZip";
    })(ExtensionSignaturetErrorCode || (exports.ExtensionSignaturetErrorCode = ExtensionSignaturetErrorCode = {}));
    class ExtensionManagementError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
            this.name = code;
        }
    }
    exports.ExtensionManagementError = ExtensionManagementError;
    var ExtensionGalleryErrorCode;
    (function (ExtensionGalleryErrorCode) {
        ExtensionGalleryErrorCode["Timeout"] = "Timeout";
        ExtensionGalleryErrorCode["Cancelled"] = "Cancelled";
        ExtensionGalleryErrorCode["Failed"] = "Failed";
    })(ExtensionGalleryErrorCode || (exports.ExtensionGalleryErrorCode = ExtensionGalleryErrorCode = {}));
    class ExtensionGalleryError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
            this.name = code;
        }
    }
    exports.ExtensionGalleryError = ExtensionGalleryError;
    exports.IExtensionManagementService = (0, instantiation_1.createDecorator)('extensionManagementService');
    exports.DISABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/disabled';
    exports.ENABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/enabled';
    exports.IGlobalExtensionEnablementService = (0, instantiation_1.createDecorator)('IGlobalExtensionEnablementService');
    exports.IExtensionTipsService = (0, instantiation_1.createDecorator)('IExtensionTipsService');
    exports.ExtensionsLabel = (0, nls_1.localize)('extensions', "Extensions");
    exports.ExtensionsLocalizedLabel = { value: exports.ExtensionsLabel, original: 'Extensions' };
    exports.PreferencesLocalizedLabel = (0, nls_1.localize2)('preferences', 'Preferences');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vZXh0ZW5zaW9uTWFuYWdlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZbkYsUUFBQSw0QkFBNEIsR0FBRywyREFBMkQsQ0FBQztJQUMzRixRQUFBLDBCQUEwQixHQUFHLElBQUksTUFBTSxDQUFDLG9DQUE0QixDQUFDLENBQUM7SUFDdEUsUUFBQSxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztJQUN0QyxRQUFBLDBDQUEwQyxHQUFHLGlCQUFpQixDQUFDO0lBQy9ELFFBQUEsOEJBQThCLEdBQUcsZ0JBQWdCLENBQUM7SUFDbEQsUUFBQSxrQ0FBa0MsR0FBRyxpQ0FBaUMsQ0FBQztJQUVwRixTQUFnQixzQkFBc0IsQ0FBQyxjQUE4QjtRQUNwRSxRQUFRLGNBQWMsRUFBRSxDQUFDO1lBQ3hCLCtDQUE2QixDQUFDLENBQUMsT0FBTyxnQkFBZ0IsQ0FBQztZQUN2RCxtREFBK0IsQ0FBQyxDQUFDLE9BQU8sYUFBYSxDQUFDO1lBRXRELCtDQUE2QixDQUFDLENBQUMsT0FBTyxjQUFjLENBQUM7WUFDckQsbURBQStCLENBQUMsQ0FBQyxPQUFPLGNBQWMsQ0FBQztZQUN2RCxtREFBK0IsQ0FBQyxDQUFDLE9BQU8sV0FBVyxDQUFDO1lBRXBELGlEQUE4QixDQUFDLENBQUMsT0FBTyxxQkFBcUIsQ0FBQztZQUM3RCxxREFBZ0MsQ0FBQyxDQUFDLE9BQU8sZUFBZSxDQUFDO1lBRXpELGlEQUE4QixDQUFDLENBQUMsT0FBTyxLQUFLLENBQUM7WUFDN0MscURBQWdDLENBQUMsQ0FBQyxPQUFPLGFBQWEsQ0FBQztZQUV2RCxtQ0FBdUIsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDO1lBRXRDLCtDQUE2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
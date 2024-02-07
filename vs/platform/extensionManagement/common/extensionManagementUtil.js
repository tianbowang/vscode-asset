(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/errors", "vs/base/common/process", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, strings_1, extensionManagement_1, extensions_1, platform_1, uri_1, errors_1, process_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeTargetPlatform = exports.getExtensionDependencies = exports.BetterMergeId = exports.getGalleryExtensionTelemetryData = exports.getLocalExtensionTelemetryData = exports.groupByExtension = exports.getGalleryExtensionId = exports.adoptToGalleryExtensionId = exports.getExtensionId = exports.getIdAndVersion = exports.ExtensionKey = exports.areSameExtensions = void 0;
    function areSameExtensions(a, b) {
        if (a.uuid && b.uuid) {
            return a.uuid === b.uuid;
        }
        if (a.id === b.id) {
            return true;
        }
        return (0, strings_1.compareIgnoreCase)(a.id, b.id) === 0;
    }
    exports.areSameExtensions = areSameExtensions;
    const ExtensionKeyRegex = /^([^.]+\..+)-(\d+\.\d+\.\d+)(-(.+))?$/;
    class ExtensionKey {
        static create(extension) {
            const version = extension.manifest ? extension.manifest.version : extension.version;
            const targetPlatform = extension.manifest ? extension.targetPlatform : extension.properties.targetPlatform;
            return new ExtensionKey(extension.identifier, version, targetPlatform);
        }
        static parse(key) {
            const matches = ExtensionKeyRegex.exec(key);
            return matches && matches[1] && matches[2] ? new ExtensionKey({ id: matches[1] }, matches[2], matches[4] || undefined) : null;
        }
        constructor(identifier, version, targetPlatform = "undefined" /* TargetPlatform.UNDEFINED */) {
            this.version = version;
            this.targetPlatform = targetPlatform;
            this.id = identifier.id;
        }
        toString() {
            return `${this.id}-${this.version}${this.targetPlatform !== "undefined" /* TargetPlatform.UNDEFINED */ ? `-${this.targetPlatform}` : ''}`;
        }
        equals(o) {
            if (!(o instanceof ExtensionKey)) {
                return false;
            }
            return areSameExtensions(this, o) && this.version === o.version && this.targetPlatform === o.targetPlatform;
        }
    }
    exports.ExtensionKey = ExtensionKey;
    const EXTENSION_IDENTIFIER_WITH_VERSION_REGEX = /^([^.]+\..+)@((prerelease)|(\d+\.\d+\.\d+(-.*)?))$/;
    function getIdAndVersion(id) {
        const matches = EXTENSION_IDENTIFIER_WITH_VERSION_REGEX.exec(id);
        if (matches && matches[1]) {
            return [adoptToGalleryExtensionId(matches[1]), matches[2]];
        }
        return [adoptToGalleryExtensionId(id), undefined];
    }
    exports.getIdAndVersion = getIdAndVersion;
    function getExtensionId(publisher, name) {
        return `${publisher}.${name}`;
    }
    exports.getExtensionId = getExtensionId;
    function adoptToGalleryExtensionId(id) {
        return id.toLowerCase();
    }
    exports.adoptToGalleryExtensionId = adoptToGalleryExtensionId;
    function getGalleryExtensionId(publisher, name) {
        return adoptToGalleryExtensionId(getExtensionId(publisher ?? extensions_1.UNDEFINED_PUBLISHER, name));
    }
    exports.getGalleryExtensionId = getGalleryExtensionId;
    function groupByExtension(extensions, getExtensionIdentifier) {
        const byExtension = [];
        const findGroup = (extension) => {
            for (const group of byExtension) {
                if (group.some(e => areSameExtensions(getExtensionIdentifier(e), getExtensionIdentifier(extension)))) {
                    return group;
                }
            }
            return null;
        };
        for (const extension of extensions) {
            const group = findGroup(extension);
            if (group) {
                group.push(extension);
            }
            else {
                byExtension.push([extension]);
            }
        }
        return byExtension;
    }
    exports.groupByExtension = groupByExtension;
    function getLocalExtensionTelemetryData(extension) {
        return {
            id: extension.identifier.id,
            name: extension.manifest.name,
            galleryId: null,
            publisherId: extension.publisherId,
            publisherName: extension.manifest.publisher,
            publisherDisplayName: extension.publisherDisplayName,
            dependencies: extension.manifest.extensionDependencies && extension.manifest.extensionDependencies.length > 0
        };
    }
    exports.getLocalExtensionTelemetryData = getLocalExtensionTelemetryData;
    /* __GDPR__FRAGMENT__
        "GalleryExtensionTelemetryData" : {
            "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "name": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "galleryId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "publisherId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "publisherName": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "publisherDisplayName": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "isPreReleaseVersion": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "dependencies": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
            "isSigned": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
            "${include}": [
                "${GalleryExtensionTelemetryData2}"
            ]
        }
    */
    function getGalleryExtensionTelemetryData(extension) {
        return {
            id: new telemetryUtils_1.TelemetryTrustedValue(extension.identifier.id),
            name: new telemetryUtils_1.TelemetryTrustedValue(extension.name),
            galleryId: extension.identifier.uuid,
            publisherId: extension.publisherId,
            publisherName: extension.publisher,
            publisherDisplayName: extension.publisherDisplayName,
            isPreReleaseVersion: extension.properties.isPreReleaseVersion,
            dependencies: !!(extension.properties.dependencies && extension.properties.dependencies.length > 0),
            isSigned: extension.isSigned,
            ...extension.telemetryData
        };
    }
    exports.getGalleryExtensionTelemetryData = getGalleryExtensionTelemetryData;
    exports.BetterMergeId = new extensions_1.ExtensionIdentifier('pprice.better-merge');
    function getExtensionDependencies(installedExtensions, extension) {
        const dependencies = [];
        const extensions = extension.manifest.extensionDependencies?.slice(0) ?? [];
        while (extensions.length) {
            const id = extensions.shift();
            if (id && dependencies.every(e => !areSameExtensions(e.identifier, { id }))) {
                const ext = installedExtensions.filter(e => areSameExtensions(e.identifier, { id }));
                if (ext.length === 1) {
                    dependencies.push(ext[0]);
                    extensions.push(...ext[0].manifest.extensionDependencies?.slice(0) ?? []);
                }
            }
        }
        return dependencies;
    }
    exports.getExtensionDependencies = getExtensionDependencies;
    async function isAlpineLinux(fileService, logService) {
        if (!platform_1.isLinux) {
            return false;
        }
        let content;
        try {
            const fileContent = await fileService.readFile(uri_1.URI.file('/etc/os-release'));
            content = fileContent.value.toString();
        }
        catch (error) {
            try {
                const fileContent = await fileService.readFile(uri_1.URI.file('/usr/lib/os-release'));
                content = fileContent.value.toString();
            }
            catch (error) {
                /* Ignore */
                logService.debug(`Error while getting the os-release file.`, (0, errors_1.getErrorMessage)(error));
            }
        }
        return !!content && (content.match(/^ID=([^\u001b\r\n]*)/m) || [])[1] === 'alpine';
    }
    async function computeTargetPlatform(fileService, logService) {
        const alpineLinux = await isAlpineLinux(fileService, logService);
        const targetPlatform = (0, extensionManagement_1.getTargetPlatform)(alpineLinux ? 'alpine' : platform_1.platform, process_1.arch);
        logService.debug('ComputeTargetPlatform:', targetPlatform);
        return targetPlatform;
    }
    exports.computeTargetPlatform = computeTargetPlatform;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFV0aWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvY29tbW9uL2V4dGVuc2lvbk1hbmFnZW1lbnRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxTQUFnQixpQkFBaUIsQ0FBQyxDQUF1QixFQUFFLENBQXVCO1FBQ2pGLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEIsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbkIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsT0FBTyxJQUFBLDJCQUFpQixFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBUkQsOENBUUM7SUFFRCxNQUFNLGlCQUFpQixHQUFHLHVDQUF1QyxDQUFDO0lBRWxFLE1BQWEsWUFBWTtRQUV4QixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQXlDO1lBQ3RELE1BQU0sT0FBTyxHQUFJLFNBQXdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBRSxTQUF3QixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLFNBQStCLENBQUMsT0FBTyxDQUFDO1lBQzNJLE1BQU0sY0FBYyxHQUFJLFNBQXdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBRSxTQUF3QixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUUsU0FBK0IsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDO1lBQ2xLLE9BQU8sSUFBSSxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBVztZQUN2QixNQUFNLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsT0FBTyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQW1CLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNqSixDQUFDO1FBSUQsWUFDQyxVQUFnQyxFQUN2QixPQUFlLEVBQ2YsMkRBQXlEO1lBRHpELFlBQU8sR0FBUCxPQUFPLENBQVE7WUFDZixtQkFBYyxHQUFkLGNBQWMsQ0FBMkM7WUFFbEUsSUFBSSxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFFRCxRQUFRO1lBQ1AsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYywrQ0FBNkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3pILENBQUM7UUFFRCxNQUFNLENBQUMsQ0FBTTtZQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxZQUFZLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxPQUFPLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBQzdHLENBQUM7S0FDRDtJQWpDRCxvQ0FpQ0M7SUFFRCxNQUFNLHVDQUF1QyxHQUFHLG9EQUFvRCxDQUFDO0lBQ3JHLFNBQWdCLGVBQWUsQ0FBQyxFQUFVO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLHVDQUF1QyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqRSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMzQixPQUFPLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUNELE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBTkQsMENBTUM7SUFFRCxTQUFnQixjQUFjLENBQUMsU0FBaUIsRUFBRSxJQUFZO1FBQzdELE9BQU8sR0FBRyxTQUFTLElBQUksSUFBSSxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUZELHdDQUVDO0lBRUQsU0FBZ0IseUJBQXlCLENBQUMsRUFBVTtRQUNuRCxPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRkQsOERBRUM7SUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxTQUE2QixFQUFFLElBQVk7UUFDaEYsT0FBTyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsU0FBUyxJQUFJLGdDQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUZELHNEQUVDO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUksVUFBZSxFQUFFLHNCQUFzRDtRQUMxRyxNQUFNLFdBQVcsR0FBVSxFQUFFLENBQUM7UUFDOUIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxTQUFZLEVBQUUsRUFBRTtZQUNsQyxLQUFLLE1BQU0sS0FBSyxJQUFJLFdBQVcsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDdEcsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQztZQUNGLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUMsQ0FBQztRQUNGLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFLENBQUM7WUFDcEMsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25DLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ1gsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLFdBQVcsQ0FBQztJQUNwQixDQUFDO0lBbkJELDRDQW1CQztJQUVELFNBQWdCLDhCQUE4QixDQUFDLFNBQTBCO1FBQ3hFLE9BQU87WUFDTixFQUFFLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzNCLElBQUksRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUk7WUFDN0IsU0FBUyxFQUFFLElBQUk7WUFDZixXQUFXLEVBQUUsU0FBUyxDQUFDLFdBQVc7WUFDbEMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUztZQUMzQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsb0JBQW9CO1lBQ3BELFlBQVksRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLHFCQUFxQixJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsTUFBTSxHQUFHLENBQUM7U0FDN0csQ0FBQztJQUNILENBQUM7SUFWRCx3RUFVQztJQUdEOzs7Ozs7Ozs7Ozs7Ozs7TUFlRTtJQUNGLFNBQWdCLGdDQUFnQyxDQUFDLFNBQTRCO1FBQzVFLE9BQU87WUFDTixFQUFFLEVBQUUsSUFBSSxzQ0FBcUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUN0RCxJQUFJLEVBQUUsSUFBSSxzQ0FBcUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQy9DLFNBQVMsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUk7WUFDcEMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXO1lBQ2xDLGFBQWEsRUFBRSxTQUFTLENBQUMsU0FBUztZQUNsQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsb0JBQW9CO1lBQ3BELG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsbUJBQW1CO1lBQzdELFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ25HLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtZQUM1QixHQUFHLFNBQVMsQ0FBQyxhQUFhO1NBQzFCLENBQUM7SUFDSCxDQUFDO0lBYkQsNEVBYUM7SUFFWSxRQUFBLGFBQWEsR0FBRyxJQUFJLGdDQUFtQixDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFNUUsU0FBZ0Isd0JBQXdCLENBQUMsbUJBQThDLEVBQUUsU0FBcUI7UUFDN0csTUFBTSxZQUFZLEdBQWlCLEVBQUUsQ0FBQztRQUN0QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFNUUsT0FBTyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDMUIsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRTlCLElBQUksRUFBRSxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDN0UsTUFBTSxHQUFHLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckYsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUN0QixZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQixVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzNFLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sWUFBWSxDQUFDO0lBQ3JCLENBQUM7SUFqQkQsNERBaUJDO0lBRUQsS0FBSyxVQUFVLGFBQWEsQ0FBQyxXQUF5QixFQUFFLFVBQXVCO1FBQzlFLElBQUksQ0FBQyxrQkFBTyxFQUFFLENBQUM7WUFDZCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLE9BQTJCLENBQUM7UUFDaEMsSUFBSSxDQUFDO1lBQ0osTUFBTSxXQUFXLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQzVFLE9BQU8sR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQztnQkFDSixNQUFNLFdBQVcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLE9BQU8sR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hDLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNoQixZQUFZO2dCQUNaLFVBQVUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLEVBQUUsSUFBQSx3QkFBZSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdEYsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDO0lBQ3BGLENBQUM7SUFFTSxLQUFLLFVBQVUscUJBQXFCLENBQUMsV0FBeUIsRUFBRSxVQUF1QjtRQUM3RixNQUFNLFdBQVcsR0FBRyxNQUFNLGFBQWEsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakUsTUFBTSxjQUFjLEdBQUcsSUFBQSx1Q0FBaUIsRUFBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsbUJBQVEsRUFBRSxjQUFJLENBQUMsQ0FBQztRQUNsRixVQUFVLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzNELE9BQU8sY0FBYyxDQUFDO0lBQ3ZCLENBQUM7SUFMRCxzREFLQyJ9
//# sourceURL=../../../vs/platform/extensionManagement/common/extensionManagementUtil.js
})
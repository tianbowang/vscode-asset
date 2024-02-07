/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, cancellation_1, extensionManagementUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.migrateUnsupportedExtensions = void 0;
    /**
     * Migrates the installed unsupported nightly extension to a supported pre-release extension. It includes following:
     * 	- Uninstall the Unsupported extension
     * 	- Install (with optional storage migration) the Pre-release extension only if
     * 		- the extension is not installed
     * 		- or it is a release version and the unsupported extension is enabled.
     */
    async function migrateUnsupportedExtensions(extensionManagementService, galleryService, extensionStorageService, extensionEnablementService, logService) {
        try {
            const extensionsControlManifest = await extensionManagementService.getExtensionsControlManifest();
            if (!extensionsControlManifest.deprecated) {
                return;
            }
            const installed = await extensionManagementService.getInstalled(1 /* ExtensionType.User */);
            for (const [unsupportedExtensionId, deprecated] of Object.entries(extensionsControlManifest.deprecated)) {
                if (!deprecated?.extension) {
                    continue;
                }
                const { id: preReleaseExtensionId, autoMigrate, preRelease } = deprecated.extension;
                if (!autoMigrate) {
                    continue;
                }
                const unsupportedExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id: unsupportedExtensionId }));
                // Unsupported Extension is not installed
                if (!unsupportedExtension) {
                    continue;
                }
                const gallery = (await galleryService.getExtensions([{ id: preReleaseExtensionId, preRelease }], { targetPlatform: await extensionManagementService.getTargetPlatform(), compatible: true }, cancellation_1.CancellationToken.None))[0];
                if (!gallery) {
                    logService.info(`Skipping migrating '${unsupportedExtension.identifier.id}' extension because, the comaptible target '${preReleaseExtensionId}' extension is not found`);
                    continue;
                }
                try {
                    logService.info(`Migrating '${unsupportedExtension.identifier.id}' extension to '${preReleaseExtensionId}' extension...`);
                    const isUnsupportedExtensionEnabled = !extensionEnablementService.getDisabledExtensions().some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, unsupportedExtension.identifier));
                    await extensionManagementService.uninstall(unsupportedExtension);
                    logService.info(`Uninstalled the unsupported extension '${unsupportedExtension.identifier.id}'`);
                    let preReleaseExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id: preReleaseExtensionId }));
                    if (!preReleaseExtension || (!preReleaseExtension.isPreReleaseVersion && isUnsupportedExtensionEnabled)) {
                        preReleaseExtension = await extensionManagementService.installFromGallery(gallery, { installPreReleaseVersion: true, isMachineScoped: unsupportedExtension.isMachineScoped, operation: 4 /* InstallOperation.Migrate */ });
                        logService.info(`Installed the pre-release extension '${preReleaseExtension.identifier.id}'`);
                        if (!isUnsupportedExtensionEnabled) {
                            await extensionEnablementService.disableExtension(preReleaseExtension.identifier);
                            logService.info(`Disabled the pre-release extension '${preReleaseExtension.identifier.id}' because the unsupported extension '${unsupportedExtension.identifier.id}' is disabled`);
                        }
                        if (autoMigrate.storage) {
                            extensionStorageService.addToMigrationList((0, extensionManagementUtil_1.getExtensionId)(unsupportedExtension.manifest.publisher, unsupportedExtension.manifest.name), (0, extensionManagementUtil_1.getExtensionId)(preReleaseExtension.manifest.publisher, preReleaseExtension.manifest.name));
                            logService.info(`Added pre-release extension to the storage migration list`);
                        }
                    }
                    logService.info(`Migrated '${unsupportedExtension.identifier.id}' extension to '${preReleaseExtensionId}' extension.`);
                }
                catch (error) {
                    logService.error(error);
                }
            }
        }
        catch (error) {
            logService.error(error);
        }
    }
    exports.migrateUnsupportedExtensions = migrateUnsupportedExtensions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5zdXBwb3J0ZWRFeHRlbnNpb25zTWlncmF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L2NvbW1vbi91bnN1cHBvcnRlZEV4dGVuc2lvbnNNaWdyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHOzs7Ozs7T0FNRztJQUNJLEtBQUssVUFBVSw0QkFBNEIsQ0FBQywwQkFBdUQsRUFBRSxjQUF3QyxFQUFFLHVCQUFpRCxFQUFFLDBCQUE2RCxFQUFFLFVBQXVCO1FBQzlSLElBQUksQ0FBQztZQUNKLE1BQU0seUJBQXlCLEdBQUcsTUFBTSwwQkFBMEIsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO1lBQ2xHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDM0MsT0FBTztZQUNSLENBQUM7WUFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLDBCQUEwQixDQUFDLFlBQVksNEJBQW9CLENBQUM7WUFDcEYsS0FBSyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUN6RyxJQUFJLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDO29CQUM1QixTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsTUFBTSxFQUFFLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztnQkFDcEYsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUNsQixTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsTUFBTSxvQkFBb0IsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSwy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
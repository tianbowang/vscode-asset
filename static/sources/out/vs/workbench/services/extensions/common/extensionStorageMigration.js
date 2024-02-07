/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionStorage", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/workspace/common/workspace"], function (require, exports, errors_1, environment_1, extensionStorage_1, files_1, log_1, storage_1, uriIdentity_1, userDataProfile_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.migrateExtensionStorage = void 0;
    /**
     * An extension storage has following
     * 	- State: Stored using storage service with extension id as key and state as value.
     *  - Resources: Stored under a location scoped to the extension.
     */
    async function migrateExtensionStorage(fromExtensionId, toExtensionId, global, instantionService) {
        return instantionService.invokeFunction(async (serviceAccessor) => {
            const environmentService = serviceAccessor.get(environment_1.IEnvironmentService);
            const userDataProfilesService = serviceAccessor.get(userDataProfile_1.IUserDataProfilesService);
            const extensionStorageService = serviceAccessor.get(extensionStorage_1.IExtensionStorageService);
            const storageService = serviceAccessor.get(storage_1.IStorageService);
            const uriIdentityService = serviceAccessor.get(uriIdentity_1.IUriIdentityService);
            const fileService = serviceAccessor.get(files_1.IFileService);
            const workspaceContextService = serviceAccessor.get(workspace_1.IWorkspaceContextService);
            const logService = serviceAccessor.get(log_1.ILogService);
            const storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
            const migrateLowerCaseStorageKey = fromExtensionId.toLowerCase() === toExtensionId.toLowerCase() ? `extension.storage.migrateFromLowerCaseKey.${fromExtensionId.toLowerCase()}` : undefined;
            if (fromExtensionId === toExtensionId) {
                return;
            }
            const getExtensionStorageLocation = (extensionId, global) => {
                if (global) {
                    return uriIdentityService.extUri.joinPath(userDataProfilesService.defaultProfile.globalStorageHome, extensionId.toLowerCase() /* Extension id is lower cased for global storage */);
                }
                return uriIdentityService.extUri.joinPath(environmentService.workspaceStorageHome, workspaceContextService.getWorkspace().id, extensionId);
            };
            const storageScope = global ? 0 /* StorageScope.PROFILE */ : 1 /* StorageScope.WORKSPACE */;
            if (!storageService.getBoolean(storageMigratedKey, storageScope, false) && !(migrateLowerCaseStorageKey && storageService.getBoolean(migrateLowerCaseStorageKey, storageScope, false))) {
                logService.info(`Migrating ${global ? 'global' : 'workspace'} extension storage from ${fromExtensionId} to ${toExtensionId}...`);
                // Migrate state
                const value = extensionStorageService.getExtensionState(fromExtensionId, global);
                if (value) {
                    extensionStorageService.setExtensionState(toExtensionId, value, global);
                    extensionStorageService.setExtensionState(fromExtensionId, undefined, global);
                }
                // Migrate stored files
                const fromPath = getExtensionStorageLocation(fromExtensionId, global);
                const toPath = getExtensionStorageLocation(toExtensionId, global);
                if (!uriIdentityService.extUri.isEqual(fromPath, toPath)) {
                    try {
                        await fileService.move(fromPath, toPath, true);
                    }
                    catch (error) {
                        if (error.code !== files_1.FileSystemProviderErrorCode.FileNotFound) {
                            logService.info(`Error while migrating ${global ? 'global' : 'workspace'} file storage from '${fromExtensionId}' to '${toExtensionId}'`, (0, errors_1.getErrorMessage)(error));
                        }
                    }
                }
                logService.info(`Migrated ${global ? 'global' : 'workspace'} extension storage from ${fromExtensionId} to ${toExtensionId}`);
                storageService.store(storageMigratedKey, true, storageScope, 1 /* StorageTarget.MACHINE */);
            }
        });
    }
    exports.migrateExtensionStorage = migrateExtensionStorage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uU3RvcmFnZU1pZ3JhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvY29tbW9uL2V4dGVuc2lvblN0b3JhZ2VNaWdyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHOzs7O09BSUc7SUFDSSxLQUFLLFVBQVUsdUJBQXVCLENBQUMsZUFBdUIsRUFBRSxhQUFxQixFQUFFLE1BQWUsRUFBRSxpQkFBd0M7UUFDdEosT0FBTyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFDLGVBQWUsRUFBQyxFQUFFO1lBQy9ELE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxpQ0FBbUIsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sdUJBQXVCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQywwQ0FBd0IsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sdUJBQXVCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQywyQ0FBd0IsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMseUJBQWUsQ0FBQyxDQUFDO1lBQzVELE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxpQ0FBbUIsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsb0JBQVksQ0FBQyxDQUFDO1lBQ3RELE1BQU0sdUJBQXVCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxvQ0FBd0IsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsaUJBQVcsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sa0JBQWtCLEdBQUcsNEJBQTRCLGVBQWUsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUMxRixNQUFNLDBCQUEwQixHQUFHLGVBQWUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLDZDQUE2QyxlQUFlLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBRTVMLElBQUksZUFBZSxLQUFLLGFBQWEsRUFBRSxDQUFDO2dCQUN2QyxPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxXQUFtQixFQUFFLE1BQWUsRUFBTyxFQUFFO2dCQUNqRixJQUFJLE1BQU0sRUFBRSxDQUFDO29CQUNaLE9BQU8sa0JBQWtCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLG9EQUFvRCxDQUFDLENBQUM7Z0JBQ3JMLENBQUM7Z0JBQ0QsT0FBTyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixFQUFFLHVCQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM1SSxDQUFDLENBQUM7WUFFRixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsQ0FBQyw4QkFBc0IsQ0FBQywrQkFBdUIsQ0FBQztZQUM1RSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLDBCQUEwQixJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsMEJBQTBCLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDeEwsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxXQUFXLDJCQUEyQixlQUFlLE9BQU8sYUFBYSxLQUFLLENBQUMsQ0FBQztnQkFDakksZ0JBQWdCO2dCQUNoQixNQUFNLEtBQUssR0FBRyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2pGLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1gsdUJBQXVCLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDeEUsdUJBQXVCLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0UsQ0FBQztnQkFFRCx1QkFBdUI7Z0JBQ3ZCLE1BQU0sUUFBUSxHQUFHLDJCQUEyQixDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDdEUsTUFBTSxNQUFNLEdBQUcsMkJBQTJCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDMUQsSUFBSSxDQUFDO3dCQUNKLE1BQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNoRCxDQUFDO29CQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7d0JBQ2hCLElBQThCLEtBQU0sQ0FBQyxJQUFJLEtBQUssbUNBQTJCLENBQUMsWUFBWSxFQUFFLENBQUM7NEJBQ3hGLFVBQVUsQ0FBQyxJQUFJLENBQUMseUJBQXlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxXQUFXLHVCQUF1QixlQUFlLFNBQVMsYUFBYSxHQUFHLEVBQUUsSUFBQSx3QkFBZSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ2xLLENBQUM7b0JBQ0YsQ0FBQztnQkFDRixDQUFDO2dCQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVywyQkFBMkIsZUFBZSxPQUFPLGFBQWEsRUFBRSxDQUFDLENBQUM7Z0JBQzdILGNBQWMsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLFlBQVksZ0NBQXdCLENBQUM7WUFDckYsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQWxERCwwREFrREMifQ==
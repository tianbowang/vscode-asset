/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/log/common/log", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/extensionManagement/common/extensionStorage", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/buffer", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/services/extensions/common/extensionStorageMigration", "vs/platform/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/utils"], function (require, exports, assert, environment_1, files_1, fileService_1, inMemoryFilesystemProvider_1, log_1, workbenchTestServices_1, extensionStorage_1, uri_1, resources_1, buffer_1, testWorkspace_1, extensionStorageMigration_1, storage_1, userDataProfile_1, userDataProfileService_1, userDataProfile_2, uriIdentityService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionStorageMigration', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
        const workspaceStorageHome = (0, resources_1.joinPath)(ROOT, 'workspaceStorageHome');
        let instantiationService;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const fileService = disposables.add(new fileService_1.FileService(new log_1.NullLogService()));
            disposables.add(fileService.registerProvider(ROOT.scheme, disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider())));
            instantiationService.stub(files_1.IFileService, fileService);
            const environmentService = instantiationService.stub(environment_1.IEnvironmentService, { userRoamingDataHome: ROOT, workspaceStorageHome, cacheHome: ROOT });
            const userDataProfilesService = instantiationService.stub(userDataProfile_1.IUserDataProfilesService, disposables.add(new userDataProfile_1.UserDataProfilesService(environmentService, fileService, disposables.add(new uriIdentityService_1.UriIdentityService(fileService)), new log_1.NullLogService())));
            instantiationService.stub(userDataProfile_2.IUserDataProfileService, disposables.add(new userDataProfileService_1.UserDataProfileService(userDataProfilesService.defaultProfile)));
            instantiationService.stub(extensionStorage_1.IExtensionStorageService, disposables.add(instantiationService.createInstance(extensionStorage_1.ExtensionStorageService)));
        });
        test('migrate extension storage', async () => {
            const fromExtensionId = 'pub.from', toExtensionId = 'pub.to', storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
            const extensionStorageService = instantiationService.get(extensionStorage_1.IExtensionStorageService), fileService = instantiationService.get(files_1.IFileService), storageService = instantiationService.get(storage_1.IStorageService), userDataProfilesService = instantiationService.get(userDataProfile_1.IUserDataProfilesService);
            extensionStorageService.setExtensionState(fromExtensionId, { globalKey: 'hello global state' }, true);
            extensionStorageService.setExtensionState(fromExtensionId, { workspaceKey: 'hello workspace state' }, false);
            await fileService.writeFile((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.globalStorageHome, fromExtensionId), buffer_1.VSBuffer.fromString('hello global storage'));
            await fileService.writeFile((0, resources_1.joinPath)(workspaceStorageHome, testWorkspace_1.TestWorkspace.id, fromExtensionId), buffer_1.VSBuffer.fromString('hello workspace storage'));
            await (0, extensionStorageMigration_1.migrateExtensionStorage)(fromExtensionId, toExtensionId, true, instantiationService);
            await (0, extensionStorageMigration_1.migrateExtensionStorage)(fromExtensionId, toExtensionId, false, instantiationService);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(fromExtensionId, true), undefined);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(fromExtensionId, false), undefined);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.globalStorageHome, fromExtensionId))), false);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.joinPath)(workspaceStorageHome, testWorkspace_1.TestWorkspace.id, fromExtensionId))), false);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(toExtensionId, true), { globalKey: 'hello global state' });
            assert.deepStrictEqual(extensionStorageService.getExtensionState(toExtensionId, false), { workspaceKey: 'hello workspace state' });
            assert.deepStrictEqual((await fileService.readFile((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.globalStorageHome, toExtensionId))).value.toString(), 'hello global storage');
            assert.deepStrictEqual((await fileService.readFile((0, resources_1.joinPath)(workspaceStorageHome, testWorkspace_1.TestWorkspace.id, toExtensionId))).value.toString(), 'hello workspace storage');
            assert.deepStrictEqual(storageService.get(storageMigratedKey, 0 /* StorageScope.PROFILE */), 'true');
            assert.deepStrictEqual(storageService.get(storageMigratedKey, 1 /* StorageScope.WORKSPACE */), 'true');
        });
        test('migrate extension storage when does not exist', async () => {
            const fromExtensionId = 'pub.from', toExtensionId = 'pub.to', storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
            const extensionStorageService = instantiationService.get(extensionStorage_1.IExtensionStorageService), fileService = instantiationService.get(files_1.IFileService), storageService = instantiationService.get(storage_1.IStorageService), userDataProfilesService = instantiationService.get(userDataProfile_1.IUserDataProfilesService);
            await (0, extensionStorageMigration_1.migrateExtensionStorage)(fromExtensionId, toExtensionId, true, instantiationService);
            await (0, extensionStorageMigration_1.migrateExtensionStorage)(fromExtensionId, toExtensionId, false, instantiationService);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(fromExtensionId, true), undefined);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(fromExtensionId, false), undefined);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.globalStorageHome, fromExtensionId))), false);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.joinPath)(workspaceStorageHome, testWorkspace_1.TestWorkspace.id, fromExtensionId))), false);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(toExtensionId, true), undefined);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(toExtensionId, false), undefined);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.globalStorageHome, toExtensionId))), false);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.joinPath)(workspaceStorageHome, testWorkspace_1.TestWorkspace.id, toExtensionId))), false);
            assert.deepStrictEqual(storageService.get(storageMigratedKey, 0 /* StorageScope.PROFILE */), 'true');
            assert.deepStrictEqual(storageService.get(storageMigratedKey, 1 /* StorageScope.WORKSPACE */), 'true');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uU3RvcmFnZU1pZ3JhdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy90ZXN0L2Jyb3dzZXIvZXh0ZW5zaW9uU3RvcmFnZU1pZ3JhdGlvbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBdUJoRyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1FBRXZDLE1BQU0sV0FBVyxHQUFHLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUM5RCxNQUFNLElBQUksR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sb0JBQW9CLEdBQUcsSUFBQSxvQkFBUSxFQUFDLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBRXBFLElBQUksb0JBQThDLENBQUM7UUFFbkQsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLG9CQUFvQixHQUE2QixJQUFBLHFEQUE2QixFQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUV2RyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUkseUJBQVcsQ0FBQyxJQUFJLG9CQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0UsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksdURBQTBCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsb0JBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNyRCxNQUFNLGtCQUFrQixHQUFHLG9CQUFv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
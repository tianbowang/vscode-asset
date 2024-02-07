/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionDownloader", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, assert, buffer_1, lifecycle_1, platform_1, process_1, resources_1, types_1, uri_1, uuid_1, mock_1, utils_1, configuration_1, testConfigurationService_1, environment_1, extensionManagement_1, extensionManagementUtil_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionDownloader_1, extensionManagementService_1, extensionSignatureVerificationService_1, extensionsProfileScannerService_2, extensionsScannerService_2, files_1, fileService_1, inMemoryFilesystemProvider_1, instantiationServiceMock_1, log_1, productService_1, telemetry_1, telemetryUtils_1, uriIdentity_1, uriIdentityService_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
    class TestExtensionsScanner extends (0, mock_1.mock)() {
        async scanExtensions() { return []; }
    }
    class TestExtensionSignatureVerificationService extends (0, mock_1.mock)() {
        constructor(verificationResult, didExecute) {
            super();
            this.verificationResult = verificationResult;
            this.didExecute = didExecute;
        }
        async verify() {
            if ((0, types_1.isBoolean)(this.verificationResult)) {
                return this.verificationResult;
            }
            const error = Error(this.verificationResult);
            error.code = this.verificationResult;
            error.didExecute = this.didExecute;
            throw error;
        }
    }
    class TestInstallGalleryExtensionTask extends extensionManagementService_1.InstallGalleryExtensionTask {
        constructor(extension, extensionDownloader, disposables) {
            const instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService());
            const logService = instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
            const fileService = instantiationService.stub(files_1.IFileService, disposables.add(new fileService_1.FileService(logService)));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            const systemExtensionsLocation = (0, resources_1.joinPath)(ROOT, 'system');
            const userExtensionsLocation = (0, resources_1.joinPath)(ROOT, 'extensions');
            instantiationService.stub(environment_1.INativeEnvironmentService, {
                userHome: ROOT,
                userRoamingDataHome: ROOT,
                builtinExtensionsPath: systemExtensionsLocation.fsPath,
                extensionsPath: userExtensionsLocation.fsPath,
                userDataPath: userExtensionsLocation.fsPath,
                cacheHome: ROOT,
            });
            instantiationService.stub(productService_1.IProductService, {});
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            const uriIdentityService = instantiationService.stub(uriIdentity_1.IUriIdentityService, disposables.add(instantiationService.createInstance(uriIdentityService_1.UriIdentityService)));
            const userDataProfilesService = instantiationService.stub(userDataProfile_1.IUserDataProfilesService, disposables.add(instantiationService.createInstance(userDataProfile_1.UserDataProfilesService)));
            const extensionsProfileScannerService = instantiationService.stub(extensionsProfileScannerService_1.IExtensionsProfileScannerService, disposables.add(instantiationService.createInstance(extensionsProfileScannerService_2.ExtensionsProfileScannerService)));
            const extensionsScannerService = instantiationService.stub(extensionsScannerService_1.IExtensionsScannerService, disposables.add(instantiationService.createInstance(extensionsScannerService_2.ExtensionsScannerService)));
            super({
                name: extension.name,
                publisher: extension.publisher,
                version: extension.version,
                engines: { vscode: '*' },
            }, extension, { profileLocation: userDataProfilesService.defaultProfile.extensionsResource }, extensionDownloader, new TestExtensionsScanner(), uriIdentityService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService);
            this.installed = false;
        }
        async doRun(token) {
            const result = await this.install(token);
            return result[0];
        }
        async extractExtension() {
            this.installed = true;
            return new class extends (0, mock_1.mock)() {
            };
        }
        async validateManifest() { }
    }
    suite('InstallGalleryExtensionTask Tests', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('if verification is enabled by default, the task completes', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: true, didExecute: true }), disposables.add(new lifecycle_1.DisposableStore()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, true);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification is enabled in stable, the task completes', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: true, didExecute: true, quality: 'stable' }), disposables.add(new lifecycle_1.DisposableStore()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, true);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification is disabled by setting set to false, the task skips verification', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: false, verificationResult: 'error', didExecute: false }), disposables.add(new lifecycle_1.DisposableStore()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, false);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification is disabled because the module is not loaded, the task skips verification', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: false, didExecute: false }), disposables.add(new lifecycle_1.DisposableStore()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, false);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification fails to execute, the task completes', async () => {
            const errorCode = 'ENOENT';
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: errorCode, didExecute: false }), disposables.add(new lifecycle_1.DisposableStore()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, errorCode);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification fails', async () => {
            const errorCode = 'IntegrityCheckFailed';
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: errorCode, didExecute: true }), disposables.add(new lifecycle_1.DisposableStore()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, errorCode);
            assert.strictEqual(testObject.installed, true);
        });
        test('if verification succeeds, the task completes', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: true }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: true, didExecute: true }), disposables.add(new lifecycle_1.DisposableStore()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, true);
            assert.strictEqual(testObject.installed, true);
        });
        test('task completes for unsigned extension', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: false }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: true, didExecute: false }), disposables.add(new lifecycle_1.DisposableStore()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, false);
            assert.strictEqual(testObject.installed, true);
        });
        test('task completes for an unsigned extension even when signature verification throws error', async () => {
            const testObject = new TestInstallGalleryExtensionTask(aGalleryExtension('a', { isSigned: false }), anExtensionsDownloader({ isSignatureVerificationEnabled: true, verificationResult: 'error', didExecute: true }), disposables.add(new lifecycle_1.DisposableStore()));
            await testObject.run();
            assert.strictEqual(testObject.verificationStatus, false);
            assert.strictEqual(testObject.installed, true);
        });
        function anExtensionsDownloader(options) {
            const logService = new log_1.NullLogService();
            const fileService = disposables.add(new fileService_1.FileService(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            const instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(productService_1.IProductService, { quality: options.quality ?? 'insiders' });
            instantiationService.stub(files_1.IFileService, fileService);
            instantiationService.stub(log_1.ILogService, logService);
            instantiationService.stub(environment_1.INativeEnvironmentService, { extensionsDownloadLocation: (0, resources_1.joinPath)(ROOT, 'CachedExtensionVSIXs') });
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, {
                async download(extension, location, operation) {
                    await fileService.writeFile(location, buffer_1.VSBuffer.fromString('extension vsix'));
                },
                async downloadSignatureArchive(extension, location) {
                    await fileService.writeFile(location, buffer_1.VSBuffer.fromString('extension signature'));
                },
            });
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService((0, types_1.isBoolean)(options.isSignatureVerificationEnabled) ? { extensions: { verifySignature: options.isSignatureVerificationEnabled } } : undefined));
            instantiationService.stub(extensionSignatureVerificationService_1.IExtensionSignatureVerificationService, new TestExtensionSignatureVerificationService(options.verificationResult, !!options.didExecute));
            return disposables.add(instantiationService.createInstance(extensionDownloader_1.ExtensionsDownloader));
        }
        function aGalleryExtension(name, properties = {}, galleryExtensionProperties = {}, assets = {}) {
            const targetPlatform = (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch);
            const galleryExtension = Object.create({ name, publisher: 'pub', version: '1.0.0', allTargetPlatforms: [targetPlatform], properties: {}, assets: {}, ...properties });
            galleryExtension.properties = { ...galleryExtension.properties, dependencies: [], targetPlatform, ...galleryExtensionProperties };
            galleryExtension.assets = { ...galleryExtension.assets, ...assets };
            galleryExtension.identifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(galleryExtension.publisher, galleryExtension.name), uuid: (0, uuid_1.generateUuid)() };
            return galleryExtension;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbEdhbGxlcnlFeHRlbnNpb25UYXNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvdGVzdC9ub2RlL2luc3RhbGxHYWxsZXJ5RXh0ZW5zaW9uVGFzay50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBc0NoRyxNQUFNLElBQUksR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBRWhFLE1BQU0scUJBQXNCLFNBQVEsSUFBQSxXQUFJLEdBQXFCO1FBQ25ELEtBQUssQ0FBQyxjQUFjLEtBQWlDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMxRTtJQUVELE1BQU0seUNBQTBDLFNBQVEsSUFBQSxXQUFJLEdBQTBDO1FBRXJHLFlBQ2tCLGtCQUFvQyxFQUNwQyxVQUFtQjtZQUNwQyxLQUFLLEVBQUUsQ0FBQztZQUZTLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBa0I7WUFDcEMsZUFBVSxHQUFWLFVBQVUsQ0FBUztRQUVyQyxDQUFDO1FBRVEsS0FBSyxDQUFDLE1BQU07WUFDcEIsSUFBSSxJQUFBLGlCQUFTLEVBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztnQkFDeEMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7WUFDaEMsQ0FBQztZQUNELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM1QyxLQUFhLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztZQUM3QyxLQUFhLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDNUMsTUFBTSxLQUFLLENBQUM7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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon", "assert", "vs/base/common/uuid", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/extensionManagement/test/browser/extensionEnablementService.test", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/url/common/url", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/test/electron-sandbox/workbenchTestServices", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/workbench/services/progress/browser/progressService", "vs/platform/notification/common/notification", "vs/platform/url/common/urlService", "vs/base/common/uri", "vs/base/common/cancellation", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/electron-sandbox/remoteAgentService", "vs/platform/ipc/electron-sandbox/services", "vs/workbench/test/common/workbenchTestServices", "vs/platform/product/common/productService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/network", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/base/common/platform", "vs/base/common/process", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, sinon, assert, uuid_1, extensions_1, extensionsWorkbenchService_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, extensionManagementUtil_1, extensionEnablementService_test_1, extensionGalleryService_1, url_1, instantiationServiceMock_1, event_1, telemetry_1, telemetryUtils_1, workspace_1, workbenchTestServices_1, configuration_1, log_1, progress_1, progressService_1, notification_1, urlService_1, uri_1, cancellation_1, remoteAgentService_1, remoteAgentService_2, services_1, workbenchTestServices_2, productService_1, lifecycle_1, workbenchTestServices_3, network_1, contextkey_1, mockKeybindingService_1, platform_1, process_1, extensions_2, lifecycle_2, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionsWorkbenchServiceTest', () => {
        let instantiationService;
        let testObject;
        const disposableStore = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let installEvent, didInstallEvent, uninstallEvent, didUninstallEvent;
        setup(async () => {
            disposableStore.add((0, lifecycle_2.toDisposable)(() => sinon.restore()));
            installEvent = disposableStore.add(new event_1.Emitter());
            didInstallEvent = disposableStore.add(new event_1.Emitter());
            uninstallEvent = disposableStore.add(new event_1.Emitter());
            didUninstallEvent = disposableStore.add(new event_1.Emitter());
            instantiationService = disposableStore.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(log_1.ILogService, log_1.NullLogService);
            instantiationService.stub(progress_1.IProgressService, progressService_1.ProgressService);
            instantiationService.stub(productService_1.IProductService, {});
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, extensionGalleryService_1.ExtensionGalleryService);
            instantiationService.stub(url_1.IURLService, urlService_1.NativeURLService);
            instantiationService.stub(services_1.ISharedProcessService, workbenchTestServices_1.TestSharedProcessService);
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_2.TestContextService());
            stubConfiguration();
            instantiationService.stub(remoteAgentService_1.IRemoteAgentService, remoteAgentService_2.RemoteAgentService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionManagementService, {
                onDidInstallExtensions: didInstallEvent.event,
                onInstallExtension: installEvent.event,
                onUninstallExtension: uninstallEvent.event,
                onDidUninstallExtension: didUninstallEvent.event,
                onDidUpdateExtensionMetadata: event_1.Event.None,
                onDidChangeProfile: event_1.Event.None,
                async getInstalled() { return []; },
                async getExtensionsControlManifest() { return { malicious: [], deprecated: {}, search: [] }; },
                async updateMetadata(local, metadata) {
                    local.identifier.uuid = metadata.id;
                    local.publisherDisplayName = metadata.publisherDisplayName;
                    local.publisherId = metadata.publisherId;
                    return local;
                },
                async canInstall() { return true; },
                getTargetPlatform: async () => (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch)
            });
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, (0, extensionEnablementService_test_1.anExtensionManagementServerService)({
                id: 'local',
                label: 'local',
                extensionManagementService: instantiationService.get(extensionManagement_1.IExtensionManagementService),
            }, null, null));
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            instantiationService.stub(lifecycle_1.ILifecycleService, disposableStore.add(new workbenchTestServices_3.TestLifecycleService()));
            instantiationService.stub(extensionManagement_1.IExtensionTipsService, disposableStore.add(instantiationService.createInstance(workbenchTestServices_1.TestExtensionTipsService)));
            instantiationService.stub(extensionRecommendations_1.IExtensionRecommendationsService, {});
            instantiationService.stub(notification_1.INotificationService, { prompt: () => null });
            instantiationService.stub(extensions_2.IExtensionService, {
                onDidChangeExtensions: event_1.Event.None,
                extensions: [],
                async whenInstalledExtensionsRegistered() { return true; }
            });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', []);
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, 'isEnabled', true);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage());
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getExtensions', []);
            instantiationService.stubPromise(notification_1.INotificationService, 'prompt', 0);
            instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).reset();
        });
        test('test gallery extension', async () => {
            const expected = aGalleryExtension('expectedName', {
                displayName: 'expectedDisplayName',
                version: '1.5.0',
                publisherId: 'expectedPublisherId',
                publisher: 'expectedPublisher',
                publisherDisplayName: 'expectedPublisherDisplayName',
                description: 'expectedDescription',
                installCount: 1000,
                rating: 4,
                ratingCount: 100
            }, {
                dependencies: ['pub.1', 'pub.2'],
            }, {
                manifest: { uri: 'uri:manifest', fallbackUri: 'fallback:manifest' },
                readme: { uri: 'uri:readme', fallbackUri: 'fallback:readme' },
                changelog: { uri: 'uri:changelog', fallbackUri: 'fallback:changlog' },
                download: { uri: 'uri:download', fallbackUri: 'fallback:download' },
                icon: { uri: 'uri:icon', fallbackUri: 'fallback:icon' },
                license: { uri: 'uri:license', fallbackUri: 'fallback:license' },
                repository: { uri: 'uri:repository', fallbackUri: 'fallback:repository' },
                signature: { uri: 'uri:signature', fallbackUri: 'fallback:signature' },
                coreTranslations: []
            });
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(expected));
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(pagedResponse => {
                assert.strictEqual(1, pagedResponse.firstPage.length);
                const actual = pagedResponse.firstPage[0];
                assert.strictEqual(1 /* ExtensionType.User */, actual.type);
                assert.strictEqual('expectedName', actual.name);
                assert.strictEqual('expectedDisplayName', actual.displayName);
                assert.strictEqual('expectedpublisher.expectedname', actual.identifier.id);
                assert.strictEqual('expectedPublisher', actual.publisher);
                assert.strictEqual('expectedPublisherDisplayName', actual.publisherDisplayName);
                assert.strictEqual('1.5.0', actual.version);
                assert.strictEqual('1.5.0', actual.latestVersion);
                assert.strictEqual('expectedDescription', actual.description);
                assert.strictEqual('uri:icon', actual.iconUrl);
                assert.strictEqual('fallback:icon', actual.iconUrlFallback);
                assert.strictEqual('uri:license', actual.licenseUrl);
                assert.strictEqual(3 /* ExtensionState.Uninstalled */, actual.state);
                assert.strictEqual(1000, actual.installCount);
                assert.strictEqual(4, actual.rating);
                assert.strictEqual(100, actual.ratingCount);
                assert.strictEqual(false, actual.outdated);
                assert.deepStrictEqual(['pub.1', 'pub.2'], actual.dependencies);
            });
        });
        test('test for empty installed extensions', async () => {
            testObject = await aWorkbenchService();
            assert.deepStrictEqual([], testObject.local);
        });
        test('test for installed extensions', async () => {
            const expected1 = aLocalExtension('local1', {
                publisher: 'localPublisher1',
                version: '1.1.0',
                displayName: 'localDisplayName1',
                description: 'localDescription1',
                icon: 'localIcon1',
                extensionDependencies: ['pub.1', 'pub.2'],
            }, {
                type: 1 /* ExtensionType.User */,
                readmeUrl: 'localReadmeUrl1',
                changelogUrl: 'localChangelogUrl1',
                location: uri_1.URI.file('localPath1')
            });
            const expected2 = aLocalExtension('local2', {
                publisher: 'localPublisher2',
                version: '1.2.0',
                displayName: 'localDisplayName2',
                description: 'localDescription2',
            }, {
                type: 0 /* ExtensionType.System */,
                readmeUrl: 'localReadmeUrl2',
                changelogUrl: 'localChangelogUrl2',
            });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [expected1, expected2]);
            testObject = await aWorkbenchService();
            const actuals = testObject.local;
            assert.strictEqual(2, actuals.length);
            let actual = actuals[0];
            assert.strictEqual(1 /* ExtensionType.User */, actual.type);
            assert.strictEqual('local1', actual.name);
            assert.strictEqual('localDisplayName1', actual.displayName);
            assert.strictEqual('localpublisher1.local1', actual.identifier.id);
            assert.strictEqual('localPublisher1', actual.publisher);
            assert.strictEqual('1.1.0', actual.version);
            assert.strictEqual('1.1.0', actual.latestVersion);
            assert.strictEqual('localDescription1', actual.description);
            assert.ok(actual.iconUrl === 'file:///localPath1/localIcon1' || actual.iconUrl === 'vscode-file://vscode-app/localPath1/localIcon1');
            assert.ok(actual.iconUrlFallback === 'file:///localPath1/localIcon1' || actual.iconUrlFallback === 'vscode-file://vscode-app/localPath1/localIcon1');
            assert.strictEqual(undefined, actual.licenseUrl);
            assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
            assert.strictEqual(undefined, actual.installCount);
            assert.strictEqual(undefined, actual.rating);
            assert.strictEqual(undefined, actual.ratingCount);
            assert.strictEqual(false, actual.outdated);
            assert.deepStrictEqual(['pub.1', 'pub.2'], actual.dependencies);
            actual = actuals[1];
            assert.strictEqual(0 /* ExtensionType.System */, actual.type);
            assert.strictEqual('local2', actual.name);
            assert.strictEqual('localDisplayName2', actual.displayName);
            assert.strictEqual('localpublisher2.local2', actual.identifier.id);
            assert.strictEqual('localPublisher2', actual.publisher);
            assert.strictEqual('1.2.0', actual.version);
            assert.strictEqual('1.2.0', actual.latestVersion);
            assert.strictEqual('localDescription2', actual.description);
            assert.strictEqual(undefined, actual.licenseUrl);
            assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
            assert.strictEqual(undefined, actual.installCount);
            assert.strictEqual(undefined, actual.rating);
            assert.strictEqual(undefined, actual.ratingCount);
            assert.strictEqual(false, actual.outdated);
            assert.deepStrictEqual([], actual.dependencies);
        });
        test('test installed extensions get syncs with gallery', async () => {
            const local1 = aLocalExtension('local1', {
                publisher: 'localPublisher1',
                version: '1.1.0',
                displayName: 'localDisplayName1',
                description: 'localDescription1',
                icon: 'localIcon1',
                extensionDependencies: ['pub.1', 'pub.2'],
            }, {
                type: 1 /* ExtensionType.User */,
                readmeUrl: 'localReadmeUrl1',
                changelogUrl: 'localChangelogUrl1',
                location: uri_1.URI.file('localPath1')
            });
            const local2 = aLocalExtension('local2', {
                publisher: 'localPublisher2',
                version: '1.2.0',
                displayName: 'localDisplayName2',
                description: 'localDescription2',
            }, {
                type: 0 /* ExtensionType.System */,
                readmeUrl: 'localReadmeUrl2',
                changelogUrl: 'localChangelogUrl2',
            });
            const gallery1 = aGalleryExtension(local1.manifest.name, {
                identifier: local1.identifier,
                displayName: 'expectedDisplayName',
                version: '1.5.0',
                publisherId: 'expectedPublisherId',
                publisher: local1.manifest.publisher,
                publisherDisplayName: 'expectedPublisherDisplayName',
                description: 'expectedDescription',
                installCount: 1000,
                rating: 4,
                ratingCount: 100
            }, {
                dependencies: ['pub.1'],
            }, {
                manifest: { uri: 'uri:manifest', fallbackUri: 'fallback:manifest' },
                readme: { uri: 'uri:readme', fallbackUri: 'fallback:readme' },
                changelog: { uri: 'uri:changelog', fallbackUri: 'fallback:changlog' },
                download: { uri: 'uri:download', fallbackUri: 'fallback:download' },
                icon: { uri: 'uri:icon', fallbackUri: 'fallback:icon' },
                license: { uri: 'uri:license', fallbackUri: 'fallback:license' },
                repository: { uri: 'uri:repository', fallbackUri: 'fallback:repository' },
                signature: { uri: 'uri:signature', fallbackUri: 'fallback:signature' },
                coreTranslations: []
            });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local1, local2]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery1));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getCompatibleExtension', gallery1);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getExtensions', [gallery1]);
            testObject = await aWorkbenchService();
            await testObject.queryLocal();
            return event_1.Event.toPromise(testObject.onChange).then(() => {
                const actuals = testObject.local;
                assert.strictEqual(2, actuals.length);
                let actual = actuals[0];
                assert.strictEqual(1 /* ExtensionType.User */, actual.type);
                assert.strictEqual('local1', actual.name);
                assert.strictEqual('expectedDisplayName', actual.displayName);
                assert.strictEqual('localpublisher1.local1', actual.identifier.id);
                assert.strictEqual('localPublisher1', actual.publisher);
                assert.strictEqual('1.1.0', actual.version);
                assert.strictEqual('1.5.0', actual.latestVersion);
                assert.strictEqual('expectedDescription', actual.description);
                assert.strictEqual('uri:icon', actual.iconUrl);
                assert.strictEqual('fallback:icon', actual.iconUrlFallback);
                assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
                assert.strictEqual('uri:license', actual.licenseUrl);
                assert.strictEqual(1000, actual.installCount);
                assert.strictEqual(4, actual.rating);
                assert.strictEqual(100, actual.ratingCount);
                assert.strictEqual(true, actual.outdated);
                assert.deepStrictEqual(['pub.1'], actual.dependencies);
                actual = actuals[1];
                assert.strictEqual(0 /* ExtensionType.System */, actual.type);
                assert.strictEqual('local2', actual.name);
                assert.strictEqual('localDisplayName2', actual.displayName);
                assert.strictEqual('localpublisher2.local2', actual.identifier.id);
                assert.strictEqual('localPublisher2', actual.publisher);
                assert.strictEqual('1.2.0', actual.version);
                assert.strictEqual('1.2.0', actual.latestVersion);
                assert.strictEqual('localDescription2', actual.description);
                assert.strictEqual(undefined, actual.licenseUrl);
                assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
                assert.strictEqual(undefined, actual.installCount);
                assert.strictEqual(undefined, actual.rating);
                assert.strictEqual(undefined, actual.ratingCount);
                assert.strictEqual(false, actual.outdated);
                assert.deepStrictEqual([], actual.dependencies);
            });
        });
        test('test extension state computation', async () => {
            const gallery = aGalleryExtension('gallery1');
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(page => {
                const extension = page.firstPage[0];
                assert.strictEqual(3 /* ExtensionState.Uninstalled */, extension.state);
                testObject.install(extension);
                const identifier = gallery.identifier;
                // Installing
                installEvent.fire({ identifier, source: gallery });
                const local = testObject.local;
                assert.strictEqual(1, local.length);
                const actual = local[0];
                assert.strictEqual(`${gallery.publisher}.${gallery.name}`, actual.identifier.id);
                assert.strictEqual(0 /* ExtensionState.Installing */, actual.state);
                // Installed
                didInstallEvent.fire([{ identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension(gallery.name, gallery, { identifier }) }]);
                assert.strictEqual(1 /* ExtensionState.Installed */, actual.state);
                assert.strictEqual(1, testObject.local.length);
                testObject.uninstall(actual);
                // Uninstalling
                uninstallEvent.fire({ identifier });
                assert.strictEqual(2 /* ExtensionState.Uninstalling */, actual.state);
                // Uninstalled
                didUninstallEvent.fire({ identifier });
                assert.strictEqual(3 /* ExtensionState.Uninstalled */, actual.state);
                assert.strictEqual(0, testObject.local.length);
            });
        });
        test('test extension doesnot show outdated for system extensions', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier, version: '1.0.2' })));
            testObject = await aWorkbenchService();
            await testObject.queryLocal();
            assert.ok(!testObject.local[0].outdated);
        });
        test('test canInstall returns false for extensions with out gallery', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = await aWorkbenchService();
            const target = testObject.local[0];
            testObject.uninstall(target);
            uninstallEvent.fire({ identifier: local.identifier });
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(!(await testObject.canInstall(target)));
        });
        test('test canInstall returns false for a system extension', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier })));
            testObject = await aWorkbenchService();
            const target = testObject.local[0];
            assert.ok(!(await testObject.canInstall(target)));
        });
        test('test canInstall returns true for extensions with gallery', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 1 /* ExtensionType.User */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const gallery = aGalleryExtension(local.manifest.name, { identifier: local.identifier });
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getCompatibleExtension', gallery);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'getExtensions', [gallery]);
            testObject = await aWorkbenchService();
            const target = testObject.local[0];
            await event_1.Event.toPromise(event_1.Event.filter(testObject.onChange, e => !!e?.gallery));
            assert.ok(await testObject.canInstall(target));
        });
        test('test onchange event is triggered while installing', async () => {
            const gallery = aGalleryExtension('gallery1');
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const page = await testObject.queryGallery(cancellation_1.CancellationToken.None);
            const extension = page.firstPage[0];
            assert.strictEqual(3 /* ExtensionState.Uninstalled */, extension.state);
            testObject.install(extension);
            installEvent.fire({ identifier: gallery.identifier, source: gallery });
            const promise = event_1.Event.toPromise(testObject.onChange);
            // Installed
            didInstallEvent.fire([{ identifier: gallery.identifier, source: gallery, operation: 2 /* InstallOperation.Install */, local: aLocalExtension(gallery.name, gallery, gallery) }]);
            await promise;
        });
        test('test onchange event is triggered when installation is finished', async () => {
            const gallery = aGalleryExtension('gallery1');
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const target = sinon.spy();
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(page => {
                const extension = page.firstPage[0];
                assert.strictEqual(3 /* ExtensionState.Uninstalled */, extension.state);
                testObject.install(extension);
                disposableStore.add(testObject.onChange(target));
                // Installing
                installEvent.fire({ identifier: gallery.identifier, source: gallery });
                assert.ok(target.calledOnce);
            });
        });
        test('test onchange event is triggered while uninstalling', async () => {
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = await aWorkbenchService();
            const target = sinon.spy();
            testObject.uninstall(testObject.local[0]);
            disposableStore.add(testObject.onChange(target));
            uninstallEvent.fire({ identifier: local.identifier });
            assert.ok(target.calledOnce);
        });
        test('test onchange event is triggered when uninstalling is finished', async () => {
            const local = aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = await aWorkbenchService();
            const target = sinon.spy();
            testObject.uninstall(testObject.local[0]);
            uninstallEvent.fire({ identifier: local.identifier });
            disposableStore.add(testObject.onChange(target));
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(target.calledOnce);
        });
        test('test uninstalled extensions are always enabled', async () => {
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                testObject = await aWorkbenchService();
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a')));
                return testObject.queryGallery(cancellation_1.CancellationToken.None).then(pagedResponse => {
                    const actual = pagedResponse.firstPage[0];
                    assert.strictEqual(actual.enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test enablement state installed enabled extension', async () => {
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
                testObject = await aWorkbenchService();
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 8 /* EnablementState.EnabledGlobally */);
            });
        });
        test('test workspace disabled extension', async () => {
            const extensionA = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('d')], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 7 /* EnablementState.DisabledWorkspace */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('e')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA]);
                testObject = await aWorkbenchService();
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 7 /* EnablementState.DisabledWorkspace */);
            });
        });
        test('test globally disabled extension', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('d')], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 6 /* EnablementState.DisabledGlobally */);
            });
        });
        test('test enablement state is updated for user extensions', async () => {
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 7 /* EnablementState.DisabledWorkspace */)
                    .then(() => {
                    const actual = testObject.local[0];
                    assert.strictEqual(actual.enablementState, 7 /* EnablementState.DisabledWorkspace */);
                });
            });
        });
        test('test enable extension globally when extension is disabled for workspace', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 7 /* EnablementState.DisabledWorkspace */)
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    const actual = testObject.local[0];
                    assert.strictEqual(actual.enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test disable extension globally', async () => {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
            testObject = await aWorkbenchService();
            return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 6 /* EnablementState.DisabledGlobally */);
            });
        });
        test('test system extensions can be disabled', async () => {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a', {}, { type: 0 /* ExtensionType.System */ })]);
            testObject = await aWorkbenchService();
            return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                .then(() => {
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 6 /* EnablementState.DisabledGlobally */);
            });
        });
        test('test enablement state is updated on change from outside', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    const actual = testObject.local[0];
                    assert.strictEqual(actual.enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension with dependencies disable only itself', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test disable extension pack disables the pack', async () => {
            const extensionA = aLocalExtension('a', { extensionPack: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension pack disable all', async () => {
            const extensionA = aLocalExtension('a', { extensionPack: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension fails if extension is a dependent of other', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            instantiationService.stub(notification_1.INotificationService, {
                prompt(severity, message, choices, options) {
                    options.onCancel();
                    return null;
                }
            });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[1], 6 /* EnablementState.DisabledGlobally */).then(() => assert.fail('Should fail'), error => assert.ok(true));
            });
        });
        test('test disable extension disables all dependents when chosen to disable all', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            instantiationService.stub(notification_1.INotificationService, {
                prompt(severity, message, choices, options) {
                    choices[0].run();
                    return null;
                }
            });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                await testObject.setEnablement(testObject.local[1], 6 /* EnablementState.DisabledGlobally */);
                assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
            });
        });
        test('test disable extension when extension is part of a pack', async () => {
            const extensionA = aLocalExtension('a', { extensionPack: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[1], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable both dependency and dependent do not promot and do not fail', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement([testObject.local[1], testObject.local[0]], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test enable both dependency and dependent do not promot and do not fail', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement([testObject.local[1], testObject.local[0]], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test disable extension does not fail if its dependency is a dependent of other but chosen to disable only itself', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension if its dependency is a dependent of other disabled extension', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
                });
            });
        });
        test('test disable extension if its dependencys dependency is itself', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b', { extensionDependencies: ['pub.a'] });
            const extensionC = aLocalExtension('c');
            instantiationService.stub(notification_1.INotificationService, {
                prompt(severity, message, choices, options) {
                    options.onCancel();
                    return null;
                }
            });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.fail('An extension with dependent should not be disabled'), () => null);
            });
        });
        test('test disable extension if its dependency is dependent and is disabled', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.strictEqual(testObject.local[0].enablementState, 6 /* EnablementState.DisabledGlobally */));
            });
        });
        test('test disable extension with cyclic dependencies', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b', { extensionDependencies: ['pub.c'] });
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.a'] });
            instantiationService.stub(notification_1.INotificationService, {
                prompt(severity, message, choices, options) {
                    options.onCancel();
                    return null;
                }
            });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 8 /* EnablementState.EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 8 /* EnablementState.EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.fail('An extension with dependent should not be disabled'), () => null);
            });
        });
        test('test enable extension with dependencies enable all', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test enable extension with dependencies does not prompt if dependency is enabled already', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 8 /* EnablementState.EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test enable extension with dependency does not prompt if both are enabled', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement([testObject.local[1], testObject.local[0]], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test enable extension with cyclic dependencies', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b', { extensionDependencies: ['pub.c'] });
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.a'] });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnablementState.DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnablementState.DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 8 /* EnablementState.EnabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 8 /* EnablementState.EnabledGlobally */);
                    assert.strictEqual(testObject.local[2].enablementState, 8 /* EnablementState.EnabledGlobally */);
                });
            });
        });
        test('test change event is fired when disablement flags are changed', async () => {
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
                testObject = await aWorkbenchService();
                const target = sinon.spy();
                disposableStore.add(testObject.onChange(target));
                return testObject.setEnablement(testObject.local[0], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.ok(target.calledOnce));
            });
        });
        test('test change event is fired when disablement flags are changed from outside', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 6 /* EnablementState.DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 7 /* EnablementState.DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                const target = sinon.spy();
                disposableStore.add(testObject.onChange(target));
                return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 6 /* EnablementState.DisabledGlobally */)
                    .then(() => assert.ok(target.calledOnce));
            });
        });
        test('test updating an extension does not re-eanbles it when disabled globally', async () => {
            testObject = await aWorkbenchService();
            const local = aLocalExtension('pub.a');
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 6 /* EnablementState.DisabledGlobally */);
            didInstallEvent.fire([{ local, identifier: local.identifier, operation: 3 /* InstallOperation.Update */ }]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
        });
        test('test updating an extension does not re-eanbles it when workspace disabled', async () => {
            testObject = await aWorkbenchService();
            const local = aLocalExtension('pub.a');
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 7 /* EnablementState.DisabledWorkspace */);
            didInstallEvent.fire([{ local, identifier: local.identifier, operation: 3 /* InstallOperation.Update */ }]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual[0].enablementState, 7 /* EnablementState.DisabledWorkspace */);
        });
        test('test user extension is preferred when the same extension exists as system and user extension', async () => {
            testObject = await aWorkbenchService();
            const userExtension = aLocalExtension('pub.a');
            const systemExtension = aLocalExtension('pub.a', {}, { type: 0 /* ExtensionType.System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [systemExtension, userExtension]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, userExtension);
        });
        test('test user extension is disabled when the same extension exists as system and user extension and system extension is disabled', async () => {
            testObject = await aWorkbenchService();
            const systemExtension = aLocalExtension('pub.a', {}, { type: 0 /* ExtensionType.System */ });
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([systemExtension], 6 /* EnablementState.DisabledGlobally */);
            const userExtension = aLocalExtension('pub.a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [systemExtension, userExtension]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, userExtension);
            assert.strictEqual(actual[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
        });
        test('Test local ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local web extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace,ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace', 'ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,workspace,web extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace', 'web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,web,workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui', 'web', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local web,ui,workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['web', 'ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local web,workspace,ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['web', 'workspace', 'ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace,web,ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace', 'web', 'ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace,ui,web extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace', 'ui', 'web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local UI extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,workspace extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test remote workspace extension is chosen if it exists in remote server', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
        });
        test('Test remote workspace extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
        });
        test('Test remote workspace extension is chosen if it exists in both servers and local is disabled', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([remoteExtension], 6 /* EnablementState.DisabledGlobally */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
            assert.strictEqual(actual[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
        });
        test('Test remote workspace extension is chosen if it exists in both servers and remote is disabled in workspace', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([remoteExtension], 7 /* EnablementState.DisabledWorkspace */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
            assert.strictEqual(actual[0].enablementState, 7 /* EnablementState.DisabledWorkspace */);
        });
        test('Test local ui, workspace extension is chosen if it exists in both servers and local is disabled', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 6 /* EnablementState.DisabledGlobally */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
            assert.strictEqual(actual[0].enablementState, 6 /* EnablementState.DisabledGlobally */);
        });
        test('Test local ui, workspace extension is chosen if it exists in both servers and local is disabled in workspace', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 7 /* EnablementState.DisabledWorkspace */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
            assert.strictEqual(actual[0].enablementState, 7 /* EnablementState.DisabledWorkspace */);
        });
        test('Test local web extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test remote web extension is chosen if it exists only in remote', async () => {
            // multi server setup
            const extensionKind = ['web'];
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, disposableStore.add(new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService)));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
        });
        test('Test disable autoupdate for extension when auto update is enabled for all', async () => {
            const extension1 = aLocalExtension('a');
            const extension2 = aLocalExtension('b');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2]);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'updateMetadata', (local, metadata) => {
                local.pinned = !!metadata.pinned;
                return local;
            });
            testObject = await aWorkbenchService();
            assert.strictEqual(testObject.local[0].local?.pinned, undefined);
            assert.strictEqual(testObject.local[1].local?.pinned, undefined);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], false);
            assert.strictEqual(testObject.local[0].local?.pinned, true);
            assert.strictEqual(testObject.local[1].local?.pinned, undefined);
            assert.deepStrictEqual(testObject.getSelectedExtensionsToAutoUpdate(), []);
        });
        test('Test enable autoupdate for extension when auto update is enabled for all', async () => {
            const extension1 = aLocalExtension('a');
            const extension2 = aLocalExtension('b');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2]);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'updateMetadata', (local, metadata) => {
                local.pinned = !!metadata.pinned;
                return local;
            });
            testObject = await aWorkbenchService();
            assert.strictEqual(testObject.local[0].local?.pinned, undefined);
            assert.strictEqual(testObject.local[1].local?.pinned, undefined);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], false);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], true);
            assert.strictEqual(testObject.local[0].local?.pinned, false);
            assert.strictEqual(testObject.local[1].local?.pinned, undefined);
            assert.deepStrictEqual(testObject.getSelectedExtensionsToAutoUpdate(), []);
        });
        test('Test updateAutoUpdateEnablementFor throws error when auto update is disabled', async () => {
            stubConfiguration(false);
            const extension1 = aLocalExtension('a');
            const extension2 = aLocalExtension('b');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2]);
            testObject = await aWorkbenchService();
            try {
                await testObject.updateAutoUpdateEnablementFor(testObject.local[0], true);
                assert.fail('error expected');
            }
            catch (error) {
                // expected
            }
        });
        test('Test updateAutoUpdateEnablementFor throws error for publisher when auto update is enabled', async () => {
            const extension1 = aLocalExtension('a');
            const extension2 = aLocalExtension('b');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2]);
            testObject = await aWorkbenchService();
            try {
                await testObject.updateAutoUpdateEnablementFor(testObject.local[0].publisher, true);
                assert.fail('error expected');
            }
            catch (error) {
                // expected
            }
        });
        test('Test updateAutoUpdateEnablementFor throws error for extension id when auto update mode is onlySelectedExtensions', async () => {
            stubConfiguration('onlySelectedExtensions');
            const extension1 = aLocalExtension('a');
            const extension2 = aLocalExtension('b');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2]);
            testObject = await aWorkbenchService();
            try {
                await testObject.updateAutoUpdateEnablementFor(testObject.local[0].identifier.id, true);
                assert.fail('error expected');
            }
            catch (error) {
                // expected
            }
        });
        test('Test enable autoupdate for extension when auto update is set to onlySelectedExtensions', async () => {
            stubConfiguration('onlySelectedExtensions');
            const extension1 = aLocalExtension('a', undefined, { pinned: true });
            const extension2 = aLocalExtension('b', undefined, { pinned: true });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2]);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'updateMetadata', (local, metadata) => {
                local.pinned = !!metadata.pinned;
                return local;
            });
            testObject = await aWorkbenchService();
            assert.strictEqual(testObject.local[0].local?.pinned, true);
            assert.strictEqual(testObject.local[1].local?.pinned, true);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], true);
            assert.strictEqual(testObject.local[0].local?.pinned, false);
            assert.strictEqual(testObject.local[1].local?.pinned, true);
            assert.deepStrictEqual(testObject.getSelectedExtensionsToAutoUpdate(), ['pub.a']);
            assert.equal(instantiationService.get(configuration_1.IConfigurationService).getValue(extensions_1.AutoUpdateConfigurationKey), 'onlySelectedExtensions');
        });
        test('Test enable autoupdate for extension when auto update is disabled', async () => {
            stubConfiguration(false);
            const extension1 = aLocalExtension('a', undefined, { pinned: true });
            const extension2 = aLocalExtension('b', undefined, { pinned: true });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2]);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'updateMetadata', (local, metadata) => {
                local.pinned = !!metadata.pinned;
                return local;
            });
            testObject = await aWorkbenchService();
            assert.strictEqual(testObject.local[0].local?.pinned, true);
            assert.strictEqual(testObject.local[1].local?.pinned, true);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], true);
            assert.strictEqual(testObject.local[0].local?.pinned, false);
            assert.strictEqual(testObject.local[1].local?.pinned, true);
            assert.deepStrictEqual(testObject.getSelectedExtensionsToAutoUpdate(), ['pub.a']);
            assert.equal(instantiationService.get(configuration_1.IConfigurationService).getValue(extensions_1.AutoUpdateConfigurationKey), 'onlySelectedExtensions');
        });
        test('Test disable autoupdate for extension when auto update is set to onlySelectedExtensions', async () => {
            stubConfiguration('onlySelectedExtensions');
            const extension1 = aLocalExtension('a', undefined, { pinned: true });
            const extension2 = aLocalExtension('b', undefined, { pinned: true });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2]);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'updateMetadata', (local, metadata) => {
                local.pinned = !!metadata.pinned;
                return local;
            });
            testObject = await aWorkbenchService();
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], true);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], false);
            assert.strictEqual(testObject.local[0].local?.pinned, true);
            assert.strictEqual(testObject.local[1].local?.pinned, true);
            assert.deepStrictEqual(testObject.getSelectedExtensionsToAutoUpdate(), []);
            assert.equal(instantiationService.get(configuration_1.IConfigurationService).getValue(extensions_1.AutoUpdateConfigurationKey), false);
        });
        test('Test enable auto update for publisher when auto update mode is onlySelectedExtensions', async () => {
            stubConfiguration('onlySelectedExtensions');
            const extension1 = aLocalExtension('a', undefined, { pinned: true });
            const extension2 = aLocalExtension('b', undefined, { pinned: true });
            const extension3 = aLocalExtension('a', { publisher: 'pub2' }, { pinned: true });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2, extension3]);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'updateMetadata', (local, metadata) => {
                local.pinned = !!metadata.pinned;
                return local;
            });
            testObject = await aWorkbenchService();
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0].publisher, true);
            assert.strictEqual(testObject.local[0].local?.pinned, false);
            assert.strictEqual(testObject.local[1].local?.pinned, false);
            assert.strictEqual(testObject.local[2].local?.pinned, true);
            assert.deepStrictEqual(testObject.getSelectedExtensionsToAutoUpdate(), ['pub']);
        });
        test('Test disable auto update for publisher when auto update mode is onlySelectedExtensions', async () => {
            stubConfiguration('onlySelectedExtensions');
            const extension1 = aLocalExtension('a', undefined, { pinned: true });
            const extension2 = aLocalExtension('b', undefined, { pinned: true });
            const extension3 = aLocalExtension('a', { publisher: 'pub2' }, { pinned: true });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2, extension3]);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'updateMetadata', (local, metadata) => {
                local.pinned = !!metadata.pinned;
                return local;
            });
            testObject = await aWorkbenchService();
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0].publisher, true);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0].publisher, false);
            assert.strictEqual(testObject.local[0].local?.pinned, true);
            assert.strictEqual(testObject.local[1].local?.pinned, true);
            assert.strictEqual(testObject.local[2].local?.pinned, true);
            assert.deepStrictEqual(testObject.getSelectedExtensionsToAutoUpdate(), []);
        });
        test('Test disable auto update for an extension when auto update for publisher is enabled and update mode is onlySelectedExtensions', async () => {
            stubConfiguration('onlySelectedExtensions');
            const extension1 = aLocalExtension('a', undefined, { pinned: true });
            const extension2 = aLocalExtension('b', undefined, { pinned: true });
            const extension3 = aLocalExtension('a', { publisher: 'pub2' }, { pinned: true });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2, extension3]);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'updateMetadata', (local, metadata) => {
                local.pinned = !!metadata.pinned;
                return local;
            });
            testObject = await aWorkbenchService();
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0].publisher, true);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], false);
            assert.strictEqual(testObject.local[0].local?.pinned, true);
            assert.strictEqual(testObject.local[1].local?.pinned, false);
            assert.strictEqual(testObject.local[2].local?.pinned, true);
            assert.deepStrictEqual(testObject.getSelectedExtensionsToAutoUpdate(), ['pub', '-pub.a']);
        });
        test('Test enable auto update for an extension when auto updates is enabled for publisher and disabled for extension and update mode is onlySelectedExtensions', async () => {
            stubConfiguration('onlySelectedExtensions');
            const extension1 = aLocalExtension('a', undefined, { pinned: true });
            const extension2 = aLocalExtension('b', undefined, { pinned: true });
            const extension3 = aLocalExtension('a', { publisher: 'pub2' }, { pinned: true });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extension1, extension2, extension3]);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'updateMetadata', (local, metadata) => {
                local.pinned = !!metadata.pinned;
                return local;
            });
            testObject = await aWorkbenchService();
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0].publisher, true);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], false);
            await testObject.updateAutoUpdateEnablementFor(testObject.local[0], true);
            assert.strictEqual(testObject.local[0].local?.pinned, false);
            assert.strictEqual(testObject.local[1].local?.pinned, false);
            assert.strictEqual(testObject.local[2].local?.pinned, true);
            assert.deepStrictEqual(testObject.getSelectedExtensionsToAutoUpdate(), ['pub']);
        });
        async function aWorkbenchService() {
            const workbenchService = disposableStore.add(instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
            await workbenchService.queryLocal();
            return workbenchService;
        }
        function stubConfiguration(autoUpdateValue, autoCheckUpdatesValue) {
            const values = {
                [extensions_1.AutoUpdateConfigurationKey]: autoUpdateValue ?? true,
                [extensions_1.AutoCheckUpdatesConfigurationKey]: autoCheckUpdatesValue ?? true
            };
            instantiationService.stub(configuration_1.IConfigurationService, {
                onDidChangeConfiguration: () => { return undefined; },
                getValue: (key) => {
                    return key ? values[key] : undefined;
                },
                updateValue: async (key, value) => {
                    values[key] = value;
                }
            });
        }
        function aLocalExtension(name = 'someext', manifest = {}, properties = {}) {
            manifest = { name, publisher: 'pub', version: '1.0.0', ...manifest };
            properties = {
                type: 1 /* ExtensionType.User */,
                location: uri_1.URI.file(`pub.${name}`),
                identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) },
                ...properties
            };
            return Object.create({ manifest, ...properties });
        }
        const noAssets = {
            changelog: null,
            download: null,
            icon: null,
            license: null,
            manifest: null,
            readme: null,
            repository: null,
            signature: null,
            coreTranslations: []
        };
        function aGalleryExtension(name, properties = {}, galleryExtensionProperties = {}, assets = noAssets) {
            const targetPlatform = (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch);
            const galleryExtension = Object.create({ name, publisher: 'pub', version: '1.0.0', allTargetPlatforms: [targetPlatform], properties: {}, assets: {}, ...properties });
            galleryExtension.properties = { ...galleryExtension.properties, dependencies: [], targetPlatform, ...galleryExtensionProperties };
            galleryExtension.assets = { ...galleryExtension.assets, ...assets };
            galleryExtension.identifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(galleryExtension.publisher, galleryExtension.name), uuid: (0, uuid_1.generateUuid)() };
            return galleryExtension;
        }
        function aPage(...objects) {
            return { firstPage: objects, total: objects.length, pageSize: objects.length, getPage: () => null };
        }
        function aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, remoteExtensionManagementService) {
            const localExtensionManagementServer = {
                id: 'vscode-local',
                label: 'local',
                extensionManagementService: localExtensionManagementService || createExtensionManagementService(),
            };
            const remoteExtensionManagementServer = {
                id: 'vscode-remote',
                label: 'remote',
                extensionManagementService: remoteExtensionManagementService || createExtensionManagementService(),
            };
            return (0, extensionEnablementService_test_1.anExtensionManagementServerService)(localExtensionManagementServer, remoteExtensionManagementServer, null);
        }
        function createExtensionManagementService(installed = []) {
            return {
                onInstallExtension: event_1.Event.None,
                onDidInstallExtensions: event_1.Event.None,
                onUninstallExtension: event_1.Event.None,
                onDidUninstallExtension: event_1.Event.None,
                onDidChangeProfile: event_1.Event.None,
                onDidUpdateExtensionMetadata: event_1.Event.None,
                getInstalled: () => Promise.resolve(installed),
                installFromGallery: (extension) => Promise.reject(new Error('not supported')),
                updateMetadata: async (local, metadata) => {
                    local.identifier.uuid = metadata.id;
                    local.publisherDisplayName = metadata.publisherDisplayName;
                    local.publisherId = metadata.publisherId;
                    return local;
                },
                getTargetPlatform: async () => (0, extensionManagement_1.getTargetPlatform)(platform_1.platform, process_1.arch),
                async getExtensionsControlManifest() { return { malicious: [], deprecated: {}, search: [] }; },
            };
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1dvcmtiZW5jaFNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy90ZXN0L2VsZWN0cm9uLXNhbmRib3gvZXh0ZW5zaW9uc1dvcmtiZW5jaFNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQW1EaEcsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtRQUU1QyxJQUFJLG9CQUE4QyxDQUFDO1FBQ25ELElBQUksVUFBc0MsQ0FBQztRQUMzQyxNQUFNLGVBQWUsR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFbEUsSUFBSSxZQUE0QyxFQUMvQyxlQUEyRCxFQUMzRCxjQUFnRCxFQUNoRCxpQkFBc0QsQ0FBQztRQUV4RCxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDaEIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RCxZQUFZLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQU8sRUFBeUIsQ0FBQyxDQUFDO1lBQ3pFLGVBQWUsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksZUFBTyxFQUFxQyxDQUFDLENBQUM7WUFDeEYsY0FBYyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFPLEVBQTJCLENBQUMsQ0FBQztZQUM3RSxpQkFBaUIsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksZUFBTyxFQUE4QixDQUFDLENBQUM7WUFFbkYsb0JBQW9CLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQztZQUMzRSxvQkFBb0IsQ0FBQyxJ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
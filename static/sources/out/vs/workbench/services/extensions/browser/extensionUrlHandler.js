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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/url/common/url", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/actions/common/actions", "vs/platform/quickinput/common/quickInput", "vs/platform/progress/common/progress", "vs/platform/contextkey/common/contextkeys", "vs/base/common/cancellation", "vs/platform/telemetry/common/telemetry", "vs/platform/product/common/productService", "vs/base/browser/dom", "vs/base/browser/window"], function (require, exports, nls_1, lifecycle_1, uri_1, configuration_1, dialogs_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, instantiation_1, notification_1, storage_1, url_1, host_1, extensions_1, extensions_2, extensions_3, platform_1, contributions_1, actions_1, quickInput_1, progress_1, contextkeys_1, cancellation_1, telemetry_1, productService_1, dom_1, window_1) {
    "use strict";
    var ExtensionUrlBootstrapHandler_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionUrlHandler = void 0;
    const FIVE_MINUTES = 5 * 60 * 1000;
    const THIRTY_SECONDS = 30 * 1000;
    const URL_TO_HANDLE = 'extensionUrlHandler.urlToHandle';
    const USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY = 'extensions.confirmedUriHandlerExtensionIds';
    const USER_TRUSTED_EXTENSIONS_STORAGE_KEY = 'extensionUrlHandler.confirmedExtensions';
    function isExtensionId(value) {
        return /^[a-z0-9][a-z0-9\-]*\.[a-z0-9][a-z0-9\-]*$/i.test(value);
    }
    class UserTrustedExtensionIdStorage {
        get extensions() {
            const userTrustedExtensionIdsJson = this.storageService.get(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, 0 /* StorageScope.PROFILE */, '[]');
            try {
                return JSON.parse(userTrustedExtensionIdsJson);
            }
            catch {
                return [];
            }
        }
        constructor(storageService) {
            this.storageService = storageService;
        }
        has(id) {
            return this.extensions.indexOf(id) > -1;
        }
        add(id) {
            this.set([...this.extensions, id]);
        }
        set(ids) {
            this.storageService.store(USER_TRUSTED_EXTENSIONS_STORAGE_KEY, JSON.stringify(ids), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    exports.IExtensionUrlHandler = (0, instantiation_1.createDecorator)('extensionUrlHandler');
    /**
     * This class handles URLs which are directed towards extensions.
     * If a URL is directed towards an inactive extension, it buffers it,
     * activates the extension and re-opens the URL once the extension registers
     * a URL handler. If the extension never registers a URL handler, the urls
     * will eventually be garbage collected.
     *
     * It also makes sure the user confirms opening URLs directed towards extensions.
     */
    let ExtensionUrlHandler = class ExtensionUrlHandler {
        constructor(urlService, extensionService, dialogService, notificationService, extensionManagementService, extensionEnablementService, hostService, galleryService, storageService, configurationService, progressService, telemetryService, productService) {
            this.extensionService = extensionService;
            this.dialogService = dialogService;
            this.notificationService = notificationService;
            this.extensionManagementService = extensionManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.hostService = hostService;
            this.galleryService = galleryService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.progressService = progressService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.extensionHandlers = new Map();
            this.uriBuffer = new Map();
            this.userTrustedExtensionsStorage = new UserTrustedExtensionIdStorage(storageService);
            const interval = (0, dom_1.disposableWindowInterval)(window_1.mainWindow, () => this.garbageCollect(), THIRTY_SECONDS);
            const urlToHandleValue = this.storageService.get(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
            if (urlToHandleValue) {
                this.storageService.remove(URL_TO_HANDLE, 1 /* StorageScope.WORKSPACE */);
                this.handleURL(uri_1.URI.revive(JSON.parse(urlToHandleValue)), { trusted: true });
            }
            this.disposable = (0, lifecycle_1.combinedDisposable)(urlService.registerHandler(this), interval);
            const cache = ExtensionUrlBootstrapHandler.cache;
            setTimeout(() => cache.forEach(([uri, option]) => this.handleURL(uri, option)));
        }
        async handleURL(uri, options) {
            if (!isExtensionId(uri.authority)) {
                return false;
            }
            const extensionId = uri.authority;
            this.telemetryService.publicLog2('uri_invoked/start', { extensionId });
            const initialHandler = this.extensionHandlers.get(extensions_2.ExtensionIdentifier.toKey(extensionId));
            let extensionDisplayName;
            if (!initialHandler) {
                // The extension is not yet activated, so let's check if it is installed and enabled
                const extension = await this.extensionService.getExtension(extensionId);
                if (!extension) {
                    await this.handleUnhandledURL(uri, { id: extensionId }, options);
                    return true;
                }
                else {
                    extensionDisplayName = extension.displayName ?? '';
                }
            }
            else {
                extensionDisplayName = initialHandler.extensionDisplayName;
            }
            const trusted = options?.trusted
                || this.productService.trustedExtensionProtocolHandlers?.includes(extensionId)
                || this.didUserTrustExtension(extensions_2.ExtensionIdentifier.toKey(extensionId));
            if (!trusted) {
                let uriString = uri.toString(false);
                if (uriString.length > 40) {
                    uriString = `${uriString.substring(0, 30)}...${uriString.substring(uriString.length - 5)}`;
                }
                const result = await this.dialogService.confirm({
                    message: (0, nls_1.localize)('confirmUrl', "Allow '{0}' extension to open this URI?", extensionDisplayName),
                    checkbox: {
                        label: (0, nls_1.localize)('rememberConfirmUrl', "Do not ask me again for this extension"),
                    },
                    detail: uriString,
                    primaryButton: (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open")
                });
                if (!result.confirmed) {
                    this.telemetryService.publicLog2('uri_invoked/cancel', { extensionId });
                    return true;
                }
                if (result.checkboxChecked) {
                    this.userTrustedExtensionsStorage.add(extensions_2.ExtensionIdentifier.toKey(extensionId));
                }
            }
            const handler = this.extensionHandlers.get(extensions_2.ExtensionIdentifier.toKey(extensionId));
            if (handler) {
                if (!initialHandler) {
                    // forward it directly
                    return await this.handleURLByExtension(extensionId, handler, uri, options);
                }
                // let the ExtensionUrlHandler instance handle this
                return false;
            }
            // collect URI for eventual extension activation
            const timestamp = new Date().getTime();
            let uris = this.uriBuffer.get(extensions_2.ExtensionIdentifier.toKey(extensionId));
            if (!uris) {
                uris = [];
                this.uriBuffer.set(extensions_2.ExtensionIdentifier.toKey(extensionId), uris);
            }
            uris.push({ timestamp, uri });
            // activate the extension using ActivationKind.Immediate because URI handling might be part
            // of resolving authorities (via authentication extensions)
            await this.extensionService.activateByEvent(`onUri:${extensions_2.ExtensionIdentifier.toKey(extensionId)}`, 1 /* ActivationKind.Immediate */);
            return true;
        }
        registerExtensionHandler(extensionId, handler) {
            this.extensionHandlers.set(extensions_2.ExtensionIdentifier.toKey(extensionId), handler);
            const uris = this.uriBuffer.get(extensions_2.ExtensionIdentifier.toKey(extensionId)) || [];
            for (const { uri } of uris) {
                this.handleURLByExtension(extensionId, handler, uri);
            }
            this.uriBuffer.delete(extensions_2.ExtensionIdentifier.toKey(extensionId));
        }
        unregisterExtensionHandler(extensionId) {
            this.extensionHandlers.delete(extensions_2.ExtensionIdentifier.toKey(extensionId));
        }
        async handleURLByExtension(extensionId, handler, uri, options) {
            this.telemetryService.publicLog2('uri_invoked/end', { extensionId: extensions_2.ExtensionIdentifier.toKey(extensionId) });
            return await handler.handleURL(uri, options);
        }
        async handleUnhandledURL(uri, extensionIdentifier, options) {
            const installedExtensions = await this.extensionManagementService.getInstalled();
            let extension = installedExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extensionIdentifier));
            // Extension is not installed
            if (!extension) {
                let galleryExtension;
                try {
                    galleryExtension = (await this.galleryService.getExtensions([extensionIdentifier], cancellation_1.CancellationToken.None))[0] ?? undefined;
                }
                catch (err) {
                    return;
                }
                if (!galleryExtension) {
                    return;
                }
                this.telemetryService.publicLog2('uri_invoked/install_extension/start', { extensionId: extensionIdentifier.id });
                // Install the Extension and reload the window to handle.
                const result = await this.dialogService.confirm({
                    message: (0, nls_1.localize)('installAndHandle', "Would you like to install '{0}' extension from '{1}' to open this URI?", galleryExtension.displayName, galleryExtension.publisherDisplayName),
                    detail: `${(0, nls_1.localize)('installDetail', "'{0}' extension wants to open a URI:", galleryExtension.displayName)}\n\n${uri.toString()}`,
                    primaryButton: (0, nls_1.localize)({ key: 'install and open', comment: ['&& denotes a mnemonic'] }, "&&Install and Open")
                });
                if (!result.confirmed) {
                    this.telemetryService.publicLog2('uri_invoked/install_extension/cancel', { extensionId: extensionIdentifier.id });
                    return;
                }
                this.telemetryService.publicLog2('uri_invoked/install_extension/accept', { extensionId: extensionIdentifier.id });
                try {
                    extension = await this.progressService.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: (0, nls_1.localize)('Installing', "Installing Extension '{0}'...", galleryExtension.displayName || galleryExtension.name)
                    }, () => this.extensionManagementService.installFromGallery(galleryExtension));
                }
                catch (error) {
                    this.notificationService.error(error);
                    return;
                }
            }
            // Extension is installed but not enabled
            if (!this.extensionEnablementService.isEnabled(extension)) {
                this.telemetryService.publicLog2('uri_invoked/enable_extension/start', { extensionId: extensionIdentifier.id });
                const result = await this.dialogService.confirm({
                    message: (0, nls_1.localize)('enableAndHandle', "Extension '{0}' is disabled. Would you like to enable the extension and open the URL?", extension.manifest.displayName || extension.manifest.name),
                    detail: `${extension.manifest.displayName || extension.manifest.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                    primaryButton: (0, nls_1.localize)({ key: 'enableAndReload', comment: ['&& denotes a mnemonic'] }, "&&Enable and Open")
                });
                if (!result.confirmed) {
                    this.telemetryService.publicLog2('uri_invoked/enable_extension/cancel', { extensionId: extensionIdentifier.id });
                    return;
                }
                this.telemetryService.publicLog2('uri_invoked/enable_extension/accept', { extensionId: extensionIdentifier.id });
                await this.extensionEnablementService.setEnablement([extension], 8 /* EnablementState.EnabledGlobally */);
            }
            if (this.extensionService.canAddExtension((0, extensions_1.toExtensionDescription)(extension))) {
                await this.waitUntilExtensionIsAdded(extensionIdentifier);
                await this.handleURL(uri, { ...options, trusted: true });
            }
            /* Extension cannot be added and require window reload */
            else {
                this.telemetryService.publicLog2('uri_invoked/activate_extension/start', { extensionId: extensionIdentifier.id });
                const result = await this.dialogService.confirm({
                    message: (0, nls_1.localize)('reloadAndHandle', "Extension '{0}' is not loaded. Would you like to reload the window to load the extension and open the URL?", extension.manifest.displayName || extension.manifest.name),
                    detail: `${extension.manifest.displayName || extension.manifest.name} (${extensionIdentifier.id}) wants to open a URL:\n\n${uri.toString()}`,
                    primaryButton: (0, nls_1.localize)({ key: 'reloadAndOpen', comment: ['&& denotes a mnemonic'] }, "&&Reload Window and Open")
                });
                if (!result.confirmed) {
                    this.telemetryService.publicLog2('uri_invoked/activate_extension/cancel', { extensionId: extensionIdentifier.id });
                    return;
                }
                this.telemetryService.publicLog2('uri_invoked/activate_extension/accept', { extensionId: extensionIdentifier.id });
                this.storageService.store(URL_TO_HANDLE, JSON.stringify(uri.toJSON()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                await this.hostService.reload();
            }
        }
        async waitUntilExtensionIsAdded(extensionId) {
            if (!(await this.extensionService.getExtension(extensionId.id))) {
                await new Promise((c, e) => {
                    const disposable = this.extensionService.onDidChangeExtensions(async () => {
                        try {
                            if (await this.extensionService.getExtension(extensionId.id)) {
                                disposable.dispose();
                                c();
                            }
                        }
                        catch (error) {
                            e(error);
                        }
                    });
                });
            }
        }
        // forget about all uris buffered more than 5 minutes ago
        garbageCollect() {
            const now = new Date().getTime();
            const uriBuffer = new Map();
            this.uriBuffer.forEach((uris, extensionId) => {
                uris = uris.filter(({ timestamp }) => now - timestamp < FIVE_MINUTES);
                if (uris.length > 0) {
                    uriBuffer.set(extensionId, uris);
                }
            });
            this.uriBuffer = uriBuffer;
        }
        didUserTrustExtension(id) {
            if (this.userTrustedExtensionsStorage.has(id)) {
                return true;
            }
            return this.getConfirmedTrustedExtensionIdsFromConfiguration().indexOf(id) > -1;
        }
        getConfirmedTrustedExtensionIdsFromConfiguration() {
            const trustedExtensionIds = this.configurationService.getValue(USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY);
            if (!Array.isArray(trustedExtensionIds)) {
                return [];
            }
            return trustedExtensionIds;
        }
        dispose() {
            this.disposable.dispose();
            this.extensionHandlers.clear();
            this.uriBuffer.clear();
        }
    };
    ExtensionUrlHandler = __decorate([
        __param(0, url_1.IURLService),
        __param(1, extensions_1.IExtensionService),
        __param(2, dialogs_1.IDialogService),
        __param(3, notification_1.INotificationService),
        __param(4, extensionManagement_1.IExtensionManagementService),
        __param(5, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(6, host_1.IHostService),
        __param(7, extensionManagement_1.IExtensionGalleryService),
        __param(8, storage_1.IStorageService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, progress_1.IProgressService),
        __param(11, telemetry_1.ITelemetryService),
        __param(12, productService_1.IProductService)
    ], ExtensionUrlHandler);
    (0, extensions_3.registerSingleton)(exports.IExtensionUrlHandler, ExtensionUrlHandler, 0 /* InstantiationType.Eager */);
    /**
     * This class handles URLs before `ExtensionUrlHandler` is instantiated.
     * More info: https://github.com/microsoft/vscode/issues/73101
     */
    let ExtensionUrlBootstrapHandler = class ExtensionUrlBootstrapHandler {
        static { ExtensionUrlBootstrapHandler_1 = this; }
        static { this._cache = []; }
        static get cache() {
            ExtensionUrlBootstrapHandler_1.disposable.dispose();
            const result = ExtensionUrlBootstrapHandler_1._cache;
            ExtensionUrlBootstrapHandler_1._cache = [];
            return result;
        }
        constructor(urlService) {
            ExtensionUrlBootstrapHandler_1.disposable = urlService.registerHandler(this);
        }
        async handleURL(uri, options) {
            if (!isExtensionId(uri.authority)) {
                return false;
            }
            ExtensionUrlBootstrapHandler_1._cache.push([uri, options]);
            return true;
        }
    };
    ExtensionUrlBootstrapHandler = ExtensionUrlBootstrapHandler_1 = __decorate([
        __param(0, url_1.IURLService)
    ], ExtensionUrlBootstrapHandler);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExtensionUrlBootstrapHandler, 2 /* LifecyclePhase.Ready */);
    class ManageAuthorizedExtensionURIsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.extensions.action.manageAuthorizedExtensionURIs',
                title: (0, nls_1.localize2)('manage', 'Manage Authorized Extension URIs...'),
                category: (0, nls_1.localize2)('extensions', 'Extensions'),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkeys_1.IsWebContext.toNegated()
                }
            });
        }
        async run(accessor) {
            const storageService = accessor.get(storage_1.IStorageService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const storage = new UserTrustedExtensionIdStorage(storageService);
            const items = storage.extensions.map(label => ({ label, picked: true }));
            if (items.length === 0) {
                await quickInputService.pick([{ label: (0, nls_1.localize)('no', 'There are currently no authorized extension URIs.') }]);
                return;
            }
            const result = await quickInputService.pick(items, { canPickMany: true });
            if (!result) {
                return;
            }
            storage.set(result.map(item => item.label));
        }
    }
    (0, actions_1.registerAction2)(ManageAuthorizedExtensionURIsAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVXJsSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvYnJvd3Nlci9leHRlbnNpb25VcmxIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErQmhHLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBQ25DLE1BQU0sY0FBYyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDakMsTUFBTSxhQUFhLEdBQUcsaUNBQWlDLENBQUM7SUFDeEQsTUFBTSx5Q0FBeUMsR0FBRyw0Q0FBNEMsQ0FBQztJQUMvRixNQUFNLG1DQUFtQyxHQUFHLHlDQUF5QyxDQUFDO0lBRXRGLFNBQVMsYUFBYSxDQUFDLEtBQWE7UUFDbkMsT0FBTyw2Q0FBNkMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELE1BQU0sNkJBQTZCO1FBRWxDLElBQUksVUFBVTtZQUNiLE1BQU0sMkJBQTJCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsbUNBQW1DLGdDQUF3QixJQUFJLENBQUMsQ0FBQztZQUU3SCxJQUFJLENBQUM7Z0JBQ0osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDaEQsQ0FBQztZQUFDLE1BQU0sQ0FBQztnQkFDUixPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7UUFDRixDQUFDO1FBRUQsWUFBb0IsY0FBK0I7WUFBL0IsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1FBQUksQ0FBQztRQUV4RCxHQUFHLENBQUMsRUFBVTtZQUNiLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENB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
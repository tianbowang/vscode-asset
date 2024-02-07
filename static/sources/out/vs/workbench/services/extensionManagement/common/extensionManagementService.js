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
define(["require", "exports", "vs/base/common/event", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/nls", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/download/common/download", "vs/base/common/arrays", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/async", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/base/common/errors", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, event_1, extensionManagement_1, extensionManagement_2, extensions_1, lifecycle_1, configuration_1, cancellation_1, extensionManagementUtil_1, nls_1, productService_1, network_1, download_1, arrays_1, dialogs_1, severity_1, userDataSync_1, async_1, workspaceTrust_1, extensionManifestPropertiesService_1, instantiation_1, commands_1, types_1, files_1, log_1, errors_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementService = void 0;
    let ExtensionManagementService = class ExtensionManagementService extends lifecycle_1.Disposable {
        constructor(extensionManagementServerService, extensionGalleryService, userDataProfileService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService) {
            super();
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionGalleryService = extensionGalleryService;
            this.userDataProfileService = userDataProfileService;
            this.configurationService = configurationService;
            this.productService = productService;
            this.downloadService = downloadService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.dialogService = dialogService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.fileService = fileService;
            this.logService = logService;
            this.instantiationService = instantiationService;
            this.servers = [];
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                this.servers.push(this.extensionManagementServerService.localExtensionManagementServer);
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                this.servers.push(this.extensionManagementServerService.remoteExtensionManagementServer);
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                this.servers.push(this.extensionManagementServerService.webExtensionManagementServer);
            }
            this.onInstallExtension = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(event_1.Event.map(server.extensionManagementService.onInstallExtension, e => ({ ...e, server })))); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onDidInstallExtensions = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(server.extensionManagementService.onDidInstallExtensions)); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onUninstallExtension = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(event_1.Event.map(server.extensionManagementService.onUninstallExtension, e => ({ ...e, server })))); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onDidUninstallExtension = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(event_1.Event.map(server.extensionManagementService.onDidUninstallExtension, e => ({ ...e, server })))); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onDidUpdateExtensionMetadata = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(server.extensionManagementService.onDidUpdateExtensionMetadata)); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
            this.onDidChangeProfile = this._register(this.servers.reduce((emitter, server) => { this._register(emitter.add(event_1.Event.map(server.extensionManagementService.onDidChangeProfile, e => ({ ...e, server })))); return emitter; }, this._register(new event_1.EventMultiplexer()))).event;
        }
        async getInstalled(type, profileLocation) {
            const result = await Promise.all(this.servers.map(({ extensionManagementService }) => extensionManagementService.getInstalled(type, profileLocation)));
            return (0, arrays_1.flatten)(result);
        }
        async uninstall(extension, options) {
            const server = this.getServer(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            if (this.servers.length > 1) {
                if ((0, extensions_1.isLanguagePackExtension)(extension.manifest)) {
                    return this.uninstallEverywhere(extension, options);
                }
                return this.uninstallInServer(extension, server, options);
            }
            return server.extensionManagementService.uninstall(extension, options);
        }
        async uninstallEverywhere(extension, options) {
            const server = this.getServer(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            const promise = server.extensionManagementService.uninstall(extension, options);
            const otherServers = this.servers.filter(s => s !== server);
            if (otherServers.length) {
                for (const otherServer of otherServers) {
                    const installed = await otherServer.extensionManagementService.getInstalled();
                    extension = installed.filter(i => !i.isBuiltin && (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, extension.identifier))[0];
                    if (extension) {
                        await otherServer.extensionManagementService.uninstall(extension, options);
                    }
                }
            }
            return promise;
        }
        async uninstallInServer(extension, server, options) {
            if (server === this.extensionManagementServerService.localExtensionManagementServer) {
                const installedExtensions = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getInstalled(1 /* ExtensionType.User */);
                const dependentNonUIExtensions = installedExtensions.filter(i => !this.extensionManifestPropertiesService.prefersExecuteOnUI(i.manifest)
                    && i.manifest.extensionDependencies && i.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)));
                if (dependentNonUIExtensions.length) {
                    return Promise.reject(new Error(this.getDependentsErrorMessage(extension, dependentNonUIExtensions)));
                }
            }
            return server.extensionManagementService.uninstall(extension, options);
        }
        getDependentsErrorMessage(extension, dependents) {
            if (dependents.length === 1) {
                return (0, nls_1.localize)('singleDependentError', "Cannot uninstall extension '{0}'. Extension '{1}' depends on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
            }
            if (dependents.length === 2) {
                return (0, nls_1.localize)('twoDependentsError', "Cannot uninstall extension '{0}'. Extensions '{1}' and '{2}' depend on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            return (0, nls_1.localize)('multipleDependentsError', "Cannot uninstall extension '{0}'. Extensions '{1}', '{2}' and others depend on this.", extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        }
        async reinstallFromGallery(extension) {
            const server = this.getServer(extension);
            if (server) {
                await this.checkForWorkspaceTrust(extension.manifest);
                return server.extensionManagementService.reinstallFromGallery(extension);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        updateMetadata(extension, metadata, profileLocation) {
            const server = this.getServer(extension);
            if (server) {
                return server.extensionManagementService.updateMetadata(extension, metadata, profileLocation);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        zip(extension) {
            const server = this.getServer(extension);
            if (server) {
                return server.extensionManagementService.zip(extension);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        unzip(zipLocation) {
            return async_1.Promises.settled(this.servers
                // Filter out web server
                .filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer)
                .map(({ extensionManagementService }) => extensionManagementService.unzip(zipLocation))).then(([extensionIdentifier]) => extensionIdentifier);
        }
        download(extension, operation, donotVerifySignature) {
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.download(extension, operation, donotVerifySignature);
            }
            throw new Error('Cannot download extension');
        }
        async install(vsix, options) {
            const manifest = await this.getManifest(vsix);
            return this.installVSIX(vsix, manifest, options);
        }
        async installVSIX(vsix, manifest, options) {
            const serversToInstall = this.getServersToInstall(manifest);
            if (serversToInstall?.length) {
                await this.checkForWorkspaceTrust(manifest);
                const [local] = await async_1.Promises.settled(serversToInstall.map(server => this.installVSIXInServer(vsix, server, options)));
                return local;
            }
            return Promise.reject('No Servers to Install');
        }
        getServersToInstall(manifest) {
            if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                if ((0, extensions_1.isLanguagePackExtension)(manifest)) {
                    // Install on both servers
                    return [this.extensionManagementServerService.localExtensionManagementServer, this.extensionManagementServerService.remoteExtensionManagementServer];
                }
                if (this.extensionManifestPropertiesService.prefersExecuteOnUI(manifest)) {
                    // Install only on local server
                    return [this.extensionManagementServerService.localExtensionManagementServer];
                }
                // Install only on remote server
                return [this.extensionManagementServerService.remoteExtensionManagementServer];
            }
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return [this.extensionManagementServerService.localExtensionManagementServer];
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                return [this.extensionManagementServerService.remoteExtensionManagementServer];
            }
            return undefined;
        }
        async installFromLocation(location) {
            if (location.scheme === network_1.Schemas.file) {
                if (this.extensionManagementServerService.localExtensionManagementServer) {
                    return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.installFromLocation(location, this.userDataProfileService.currentProfile.extensionsResource);
                }
                throw new Error('Local extension management server is not found');
            }
            if (location.scheme === network_1.Schemas.vscodeRemote) {
                if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                    return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.installFromLocation(location, this.userDataProfileService.currentProfile.extensionsResource);
                }
                throw new Error('Remote extension management server is not found');
            }
            if (!this.extensionManagementServerService.webExtensionManagementServer) {
                throw new Error('Web extension management server is not found');
            }
            return this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.installFromLocation(location, this.userDataProfileService.currentProfile.extensionsResource);
        }
        installVSIXInServer(vsix, server, options) {
            return server.extensionManagementService.install(vsix, options);
        }
        getManifest(vsix) {
            if (vsix.scheme === network_1.Schemas.file && this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            if (vsix.scheme === network_1.Schemas.file && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            if (vsix.scheme === network_1.Schemas.vscodeRemote && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            return Promise.reject('No Servers');
        }
        async canInstall(gallery) {
            if (this.extensionManagementServerService.localExtensionManagementServer
                && await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.canInstall(gallery)) {
                return true;
            }
            const manifest = await this.extensionGalleryService.getManifest(gallery, cancellation_1.CancellationToken.None);
            if (!manifest) {
                return false;
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer
                && await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.canInstall(gallery)
                && this.extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)) {
                return true;
            }
            if (this.extensionManagementServerService.webExtensionManagementServer
                && await this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.canInstall(gallery)
                && this.extensionManifestPropertiesService.canExecuteOnWeb(manifest)) {
                return true;
            }
            return false;
        }
        async updateFromGallery(gallery, extension, installOptions) {
            const server = this.getServer(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            const servers = [];
            // Update Language pack on local and remote servers
            if ((0, extensions_1.isLanguagePackExtension)(extension.manifest)) {
                servers.push(...this.servers.filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer));
            }
            else {
                servers.push(server);
            }
            return async_1.Promises.settled(servers.map(server => server.extensionManagementService.installFromGallery(gallery, installOptions))).then(([local]) => local);
        }
        async installGalleryExtensions(extensions) {
            const results = new Map();
            const extensionsByServer = new Map();
            await Promise.all(extensions.map(async ({ extension, options }) => {
                try {
                    const servers = await this.validateAndGetExtensionManagementServersToInstall(extension, options);
                    if (!options.isMachineScoped && this.isExtensionsSyncEnabled()) {
                        if (this.extensionManagementServerService.localExtensionManagementServer && !servers.includes(this.extensionManagementServerService.localExtensionManagementServer) && (await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.canInstall(extension))) {
                            servers.push(this.extensionManagementServerService.localExtensionManagementServer);
                        }
                    }
                    for (const server of servers) {
                        let exensions = extensionsByServer.get(server);
                        if (!exensions) {
                            extensionsByServer.set(server, exensions = []);
                        }
                        exensions.push({ extension, options });
                    }
                }
                catch (error) {
                    results.set(extension.identifier.id.toLowerCase(), { identifier: extension.identifier, source: extension, error, operation: 2 /* InstallOperation.Install */ });
                }
            }));
            await Promise.all([...extensionsByServer.entries()].map(async ([server, extensions]) => {
                const serverResults = await server.extensionManagementService.installGalleryExtensions(extensions);
                for (const result of serverResults) {
                    results.set(result.identifier.id.toLowerCase(), result);
                }
            }));
            return [...results.values()];
        }
        async installFromGallery(gallery, installOptions) {
            const servers = await this.validateAndGetExtensionManagementServersToInstall(gallery, installOptions);
            if (!installOptions || (0, types_1.isUndefined)(installOptions.isMachineScoped)) {
                const isMachineScoped = await this.hasToFlagExtensionsMachineScoped([gallery]);
                installOptions = { ...(installOptions || {}), isMachineScoped };
            }
            if (!installOptions.isMachineScoped && this.isExtensionsSyncEnabled()) {
                if (this.extensionManagementServerService.localExtensionManagementServer && !servers.includes(this.extensionManagementServerService.localExtensionManagementServer) && (await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.canInstall(gallery))) {
                    servers.push(this.extensionManagementServerService.localExtensionManagementServer);
                }
            }
            return async_1.Promises.settled(servers.map(server => server.extensionManagementService.installFromGallery(gallery, installOptions))).then(([local]) => local);
        }
        async validateAndGetExtensionManagementServersToInstall(gallery, installOptions) {
            const manifest = await this.extensionGalleryService.getManifest(gallery, cancellation_1.CancellationToken.None);
            if (!manifest) {
                return Promise.reject((0, nls_1.localize)('Manifest is not found', "Installing Extension {0} failed: Manifest is not found.", gallery.displayName || gallery.name));
            }
            const servers = [];
            // Install Language pack on local and remote servers
            if ((0, extensions_1.isLanguagePackExtension)(manifest)) {
                servers.push(...this.servers.filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer));
            }
            else {
                const server = this.getExtensionManagementServerToInstall(manifest);
                if (server) {
                    servers.push(server);
                }
            }
            if (!servers.length) {
                const error = new Error((0, nls_1.localize)('cannot be installed', "Cannot install the '{0}' extension because it is not available in this setup.", gallery.displayName || gallery.name));
                error.name = extensionManagement_1.ExtensionManagementErrorCode.Unsupported;
                throw error;
            }
            if (!installOptions?.context?.[extensionManagement_1.EXTENSION_INSTALL_SYNC_CONTEXT]) {
                await this.checkForWorkspaceTrust(manifest);
            }
            if (!installOptions?.donotIncludePackAndDependencies) {
                await this.checkInstallingExtensionOnWeb(gallery, manifest);
            }
            return servers;
        }
        getExtensionManagementServerToInstall(manifest) {
            // Only local server
            if (this.servers.length === 1 && this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer;
            }
            const extensionKind = this.extensionManifestPropertiesService.getExtensionKind(manifest);
            for (const kind of extensionKind) {
                if (kind === 'ui' && this.extensionManagementServerService.localExtensionManagementServer) {
                    return this.extensionManagementServerService.localExtensionManagementServer;
                }
                if (kind === 'workspace' && this.extensionManagementServerService.remoteExtensionManagementServer) {
                    return this.extensionManagementServerService.remoteExtensionManagementServer;
                }
                if (kind === 'web' && this.extensionManagementServerService.webExtensionManagementServer) {
                    return this.extensionManagementServerService.webExtensionManagementServer;
                }
            }
            // Local server can accept any extension. So return local server if not compatible server found.
            return this.extensionManagementServerService.localExtensionManagementServer;
        }
        isExtensionsSyncEnabled() {
            return this.userDataSyncEnablementService.isEnabled() && this.userDataSyncEnablementService.isResourceEnabled("extensions" /* SyncResource.Extensions */);
        }
        async hasToFlagExtensionsMachineScoped(extensions) {
            if (this.isExtensionsSyncEnabled()) {
                const { result } = await this.dialogService.prompt({
                    type: severity_1.default.Info,
                    message: extensions.length === 1 ? (0, nls_1.localize)('install extension', "Install Extension") : (0, nls_1.localize)('install extensions', "Install Extensions"),
                    detail: extensions.length === 1
                        ? (0, nls_1.localize)('install single extension', "Would you like to install and synchronize '{0}' extension across your devices?", extensions[0].displayName)
                        : (0, nls_1.localize)('install multiple extensions', "Would you like to install and synchronize extensions across your devices?"),
                    buttons: [
                        {
                            label: (0, nls_1.localize)({ key: 'install', comment: ['&& denotes a mnemonic'] }, "&&Install"),
                            run: () => false
                        },
                        {
                            label: (0, nls_1.localize)({ key: 'install and do no sync', comment: ['&& denotes a mnemonic'] }, "Install (Do &&not sync)"),
                            run: () => true
                        }
                    ],
                    cancelButton: {
                        run: () => {
                            throw new errors_1.CancellationError();
                        }
                    }
                });
                return result;
            }
            return false;
        }
        getExtensionsControlManifest() {
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                return this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.getExtensionsControlManifest();
            }
            return Promise.resolve({ malicious: [], deprecated: {}, search: [] });
        }
        getServer(extension) {
            return this.extensionManagementServerService.getExtensionManagementServer(extension);
        }
        async checkForWorkspaceTrust(manifest) {
            if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(manifest) === false) {
                const trustState = await this.workspaceTrustRequestService.requestWorkspaceTrust({
                    message: (0, nls_1.localize)('extensionInstallWorkspaceTrustMessage', "Enabling this extension requires a trusted workspace."),
                    buttons: [
                        { label: (0, nls_1.localize)('extensionInstallWorkspaceTrustButton', "Trust Workspace & Install"), type: 'ContinueWithTrust' },
                        { label: (0, nls_1.localize)('extensionInstallWorkspaceTrustContinueButton', "Install"), type: 'ContinueWithoutTrust' },
                        { label: (0, nls_1.localize)('extensionInstallWorkspaceTrustManageButton', "Learn More"), type: 'Manage' }
                    ]
                });
                if (trustState === undefined) {
                    throw new errors_1.CancellationError();
                }
            }
        }
        async checkInstallingExtensionOnWeb(extension, manifest) {
            if (this.servers.length !== 1 || this.servers[0] !== this.extensionManagementServerService.webExtensionManagementServer) {
                return;
            }
            const nonWebExtensions = [];
            if (manifest.extensionPack?.length) {
                const extensions = await this.extensionGalleryService.getExtensions(manifest.extensionPack.map(id => ({ id })), cancellation_1.CancellationToken.None);
                for (const extension of extensions) {
                    if (!(await this.servers[0].extensionManagementService.canInstall(extension))) {
                        nonWebExtensions.push(extension);
                    }
                }
                if (nonWebExtensions.length && nonWebExtensions.length === extensions.length) {
                    throw new extensionManagement_1.ExtensionManagementError('Not supported in Web', extensionManagement_1.ExtensionManagementErrorCode.Unsupported);
                }
            }
            const productName = (0, nls_1.localize)('VS Code for Web', "{0} for the Web", this.productService.nameLong);
            const virtualWorkspaceSupport = this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(manifest);
            const virtualWorkspaceSupportReason = (0, extensions_1.getWorkspaceSupportTypeMessage)(manifest.capabilities?.virtualWorkspaces);
            const hasLimitedSupport = virtualWorkspaceSupport === 'limited' || !!virtualWorkspaceSupportReason;
            if (!nonWebExtensions.length && !hasLimitedSupport) {
                return;
            }
            const limitedSupportMessage = (0, nls_1.localize)('limited support', "'{0}' has limited functionality in {1}.", extension.displayName || extension.identifier.id, productName);
            let message;
            let buttons = [];
            let detail;
            const installAnywayButton = {
                label: (0, nls_1.localize)({ key: 'install anyways', comment: ['&& denotes a mnemonic'] }, "&&Install Anyway"),
                run: () => { }
            };
            const showExtensionsButton = {
                label: (0, nls_1.localize)({ key: 'showExtensions', comment: ['&& denotes a mnemonic'] }, "&&Show Extensions"),
                run: () => this.instantiationService.invokeFunction(accessor => accessor.get(commands_1.ICommandService).executeCommand('extension.open', extension.identifier.id, 'extensionPack'))
            };
            if (nonWebExtensions.length && hasLimitedSupport) {
                message = limitedSupportMessage;
                detail = `${virtualWorkspaceSupportReason ? `${virtualWorkspaceSupportReason}\n` : ''}${(0, nls_1.localize)('non web extensions detail', "Contains extensions which are not supported.")}`;
                buttons = [
                    installAnywayButton,
                    showExtensionsButton
                ];
            }
            else if (hasLimitedSupport) {
                message = limitedSupportMessage;
                detail = virtualWorkspaceSupportReason || undefined;
                buttons = [installAnywayButton];
            }
            else {
                message = (0, nls_1.localize)('non web extensions', "'{0}' contains extensions which are not supported in {1}.", extension.displayName || extension.identifier.id, productName);
                buttons = [
                    installAnywayButton,
                    showExtensionsButton
                ];
            }
            await this.dialogService.prompt({
                type: severity_1.default.Info,
                message,
                detail,
                buttons,
                cancelButton: {
                    run: () => { throw new errors_1.CancellationError(); }
                }
            });
        }
        getTargetPlatform() {
            if (!this._targetPlatformPromise) {
                this._targetPlatformPromise = (0, extensionManagementUtil_1.computeTargetPlatform)(this.fileService, this.logService);
            }
            return this._targetPlatformPromise;
        }
        async cleanUp() {
            await Promise.allSettled(this.servers.map(server => server.extensionManagementService.cleanUp()));
        }
        toggleAppliationScope(extension, fromProfileLocation) {
            const server = this.getServer(extension);
            if (server) {
                return server.extensionManagementService.toggleAppliationScope(extension, fromProfileLocation);
            }
            throw new Error('Not Supported');
        }
        copyExtensions(from, to) {
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                throw new Error('Not Supported');
            }
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.copyExtensions(from, to);
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                return this.extensionManagementServerService.webExtensionManagementServer.extensionManagementService.copyExtensions(from, to);
            }
            return Promise.resolve();
        }
        registerParticipant() { throw new Error('Not Supported'); }
        installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) { throw new Error('Not Supported'); }
    };
    exports.ExtensionManagementService = ExtensionManagementService;
    exports.ExtensionManagementService = ExtensionManagementService = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, userDataProfile_1.IUserDataProfileService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, productService_1.IProductService),
        __param(5, download_1.IDownloadService),
        __param(6, userDataSync_1.IUserDataSyncEnablementService),
        __param(7, dialogs_1.IDialogService),
        __param(8, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(9, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(10, files_1.IFileService),
        __param(11, log_1.ILogService),
        __param(12, instantiation_1.IInstantiationService)
    ], ExtensionManagementService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25NYW5hZ2VtZW50L2NvbW1vbi9leHRlbnNpb25NYW5hZ2VtZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQ3pGLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTJCLFNBQVEsc0JBQVU7UUFhekQsWUFDb0MsZ0NBQXNGLEVBQy9GLHVCQUFrRSxFQUNuRSxzQkFBZ0UsRUFDbEUsb0JBQThELEVBQ3BFLGNBQWtELEVBQ2pELGVBQW9ELEVBQ3RDLDZCQUE4RSxFQUM5RixhQUE4QyxFQUMvQiw0QkFBNEUsRUFDdEUsa0NBQXdGLEVBQy9HLFdBQTBDLEVBQzNDLFVBQXdDLEVBQzlCLG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQWQ4QyxxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQW1DO1lBQzlFLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDbEQsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUMvQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUM5QixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDckIsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFnQztZQUM3RSxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDZCxpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQStCO1lBQ3JELHVDQUFrQyxHQUFsQyxrQ0FBa0MsQ0FBcUM7WUFDOUYsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDMUIsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNiLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFmakUsWUFBTyxHQUFpQyxF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
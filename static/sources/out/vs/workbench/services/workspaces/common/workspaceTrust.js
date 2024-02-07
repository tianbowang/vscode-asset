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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/network", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/memento", "vs/workbench/services/environment/common/environmentService", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/resources", "vs/base/common/platform", "vs/platform/files/common/files"], function (require, exports, event_1, lifecycle_1, linkedList_1, network_1, uri_1, configuration_1, extensions_1, remoteAuthorityResolver_1, remoteHosts_1, virtualWorkspace_1, storage_1, workspace_1, workspaceTrust_1, memento_1, environmentService_1, uriIdentity_1, resources_1, platform_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustRequestService = exports.WorkspaceTrustManagementService = exports.WorkspaceTrustEnablementService = exports.CanonicalWorkspace = exports.WORKSPACE_TRUST_STORAGE_KEY = exports.WORKSPACE_TRUST_EXTENSION_SUPPORT = exports.WORKSPACE_TRUST_EMPTY_WINDOW = exports.WORKSPACE_TRUST_UNTRUSTED_FILES = exports.WORKSPACE_TRUST_BANNER = exports.WORKSPACE_TRUST_STARTUP_PROMPT = exports.WORKSPACE_TRUST_ENABLED = void 0;
    exports.WORKSPACE_TRUST_ENABLED = 'security.workspace.trust.enabled';
    exports.WORKSPACE_TRUST_STARTUP_PROMPT = 'security.workspace.trust.startupPrompt';
    exports.WORKSPACE_TRUST_BANNER = 'security.workspace.trust.banner';
    exports.WORKSPACE_TRUST_UNTRUSTED_FILES = 'security.workspace.trust.untrustedFiles';
    exports.WORKSPACE_TRUST_EMPTY_WINDOW = 'security.workspace.trust.emptyWindow';
    exports.WORKSPACE_TRUST_EXTENSION_SUPPORT = 'extensions.supportUntrustedWorkspaces';
    exports.WORKSPACE_TRUST_STORAGE_KEY = 'content.trust.model.key';
    class CanonicalWorkspace {
        constructor(originalWorkspace, canonicalFolderUris, canonicalConfiguration) {
            this.originalWorkspace = originalWorkspace;
            this.canonicalFolderUris = canonicalFolderUris;
            this.canonicalConfiguration = canonicalConfiguration;
        }
        get folders() {
            return this.originalWorkspace.folders.map((folder, index) => {
                return {
                    index: folder.index,
                    name: folder.name,
                    toResource: folder.toResource,
                    uri: this.canonicalFolderUris[index]
                };
            });
        }
        get transient() {
            return this.originalWorkspace.transient;
        }
        get configuration() {
            return this.canonicalConfiguration ?? this.originalWorkspace.configuration;
        }
        get id() {
            return this.originalWorkspace.id;
        }
    }
    exports.CanonicalWorkspace = CanonicalWorkspace;
    let WorkspaceTrustEnablementService = class WorkspaceTrustEnablementService extends lifecycle_1.Disposable {
        constructor(configurationService, environmentService) {
            super();
            this.configurationService = configurationService;
            this.environmentService = environmentService;
        }
        isWorkspaceTrustEnabled() {
            if (this.environmentService.disableWorkspaceTrust) {
                return false;
            }
            return !!this.configurationService.getValue(exports.WORKSPACE_TRUST_ENABLED);
        }
    };
    exports.WorkspaceTrustEnablementService = WorkspaceTrustEnablementService;
    exports.WorkspaceTrustEnablementService = WorkspaceTrustEnablementService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService)
    ], WorkspaceTrustEnablementService);
    let WorkspaceTrustManagementService = class WorkspaceTrustManagementService extends lifecycle_1.Disposable {
        constructor(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, workspaceService, workspaceTrustEnablementService, fileService) {
            super();
            this.configurationService = configurationService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.storageService = storageService;
            this.uriIdentityService = uriIdentityService;
            this.environmentService = environmentService;
            this.workspaceService = workspaceService;
            this.workspaceTrustEnablementService = workspaceTrustEnablementService;
            this.fileService = fileService;
            this.storageKey = exports.WORKSPACE_TRUST_STORAGE_KEY;
            this._onDidChangeTrust = this._register(new event_1.Emitter());
            this.onDidChangeTrust = this._onDidChangeTrust.event;
            this._onDidChangeTrustedFolders = this._register(new event_1.Emitter());
            this.onDidChangeTrustedFolders = this._onDidChangeTrustedFolders.event;
            this._canonicalStartupFiles = [];
            this._canonicalUrisResolved = false;
            this._canonicalWorkspace = this.workspaceService.getWorkspace();
            this._workspaceResolvedPromise = new Promise((resolve) => {
                this._workspaceResolvedPromiseResolve = resolve;
            });
            this._workspaceTrustInitializedPromise = new Promise((resolve) => {
                this._workspaceTrustInitializedPromiseResolve = resolve;
            });
            this._storedTrustState = new WorkspaceTrustMemento(platform_1.isWeb && this.isEmptyWorkspace() ? undefined : this.storageService);
            this._trustTransitionManager = this._register(new WorkspaceTrustTransitionManager());
            this._trustStateInfo = this.loadTrustInfo();
            this._isTrusted = this.calculateWorkspaceTrust();
            this.initializeWorkspaceTrust();
            this.registerListeners();
        }
        //#region initialize
        initializeWorkspaceTrust() {
            // Resolve canonical Uris
            this.resolveCanonicalUris()
                .then(async () => {
                this._canonicalUrisResolved = true;
                await this.updateWorkspaceTrust();
            })
                .finally(() => {
                this._workspaceResolvedPromiseResolve();
                if (!this.environmentService.remoteAuthority) {
                    this._workspaceTrustInitializedPromiseResolve();
                }
            });
            // Remote - resolve remote authority
            if (this.environmentService.remoteAuthority) {
                this.remoteAuthorityResolverService.resolveAuthority(this.environmentService.remoteAuthority)
                    .then(async (result) => {
                    this._remoteAuthority = result;
                    await this.fileService.activateProvider(network_1.Schemas.vscodeRemote);
                    await this.updateWorkspaceTrust();
                })
                    .finally(() => {
                    this._workspaceTrustInitializedPromiseResolve();
                });
            }
            // Empty workspace - save initial state to memento
            if (this.isEmptyWorkspace()) {
                this._workspaceTrustInitializedPromise.then(() => {
                    if (this._storedTrustState.isEmptyWorkspaceTrusted === undefined) {
                        this._storedTrustState.isEmptyWorkspaceTrusted = this.isWorkspaceTrusted();
                    }
                });
            }
        }
        //#endregion
        //#region private interface
        registerListeners() {
            this._register(this.workspaceService.onDidChangeWorkspaceFolders(async () => await this.updateWorkspaceTrust()));
            this._register(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, this.storageKey, this._register(new lifecycle_1.DisposableStore()))(async () => {
                /* This will only execute if storage was changed by a user action in a separate window */
                if (JSON.stringify(this._trustStateInfo) !== JSON.stringify(this.loadTrustInfo())) {
                    this._trustStateInfo = this.loadTrustInfo();
                    this._onDidChangeTrustedFolders.fire();
                    await this.updateWorkspaceTrust();
                }
            }));
        }
        async getCanonicalUri(uri) {
            let canonicalUri = uri;
            if (this.environmentService.remoteAuthority && uri.scheme === network_1.Schemas.vscodeRemote) {
                canonicalUri = await this.remoteAuthorityResolverService.getCanonicalURI(uri);
            }
            else if (uri.scheme === 'vscode-vfs') {
                const index = uri.authority.indexOf('+');
                if (index !== -1) {
                    canonicalUri = uri.with({ authority: uri.authority.substr(0, index) });
                }
            }
            // ignore query and fragent section of uris always
            return canonicalUri.with({ query: null, fragment: null });
        }
        async resolveCanonicalUris() {
            // Open editors
            const filesToOpen = [];
            if (this.environmentService.filesToOpenOrCreate) {
                filesToOpen.push(...this.environmentService.filesToOpenOrCreate);
            }
            if (this.environmentService.filesToDiff) {
                filesToOpen.push(...this.environmentService.filesToDiff);
            }
            if (this.environmentService.filesToMerge) {
                filesToOpen.push(...this.environmentService.filesToMerge);
            }
            if (filesToOpen.length) {
                const filesToOpenOrCreateUris = filesToOpen.filter(f => !!f.fileUri).map(f => f.fileUri);
                const canonicalFilesToOpen = await Promise.all(filesToOpenOrCreateUris.map(uri => this.getCanonicalUri(uri)));
                this._canonicalStartupFiles.push(...canonicalFilesToOpen.filter(uri => this._canonicalStartupFiles.every(u => !this.uriIdentityService.extUri.isEqual(uri, u))));
            }
            // Workspace
            const workspaceUris = this.workspaceService.getWorkspace().folders.map(f => f.uri);
            const canonicalWorkspaceFolders = await Promise.all(workspaceUris.map(uri => this.getCanonicalUri(uri)));
            let canonicalWorkspaceConfiguration = this.workspaceService.getWorkspace().configuration;
            if (canonicalWorkspaceConfiguration && (0, workspace_1.isSavedWorkspace)(canonicalWorkspaceConfiguration, this.environmentService)) {
                canonicalWorkspaceConfiguration = await this.getCanonicalUri(canonicalWorkspaceConfiguration);
            }
            this._canonicalWorkspace = new CanonicalWorkspace(this.workspaceService.getWorkspace(), canonicalWorkspaceFolders, canonicalWorkspaceConfiguration);
        }
        loadTrustInfo() {
            const infoAsString = this.storageService.get(this.storageKey, -1 /* StorageScope.APPLICATION */);
            let result;
            try {
                if (infoAsString) {
                    result = JSON.parse(infoAsString);
                }
            }
            catch { }
            if (!result) {
                result = {
                    uriTrustInfo: []
                };
            }
            if (!result.uriTrustInfo) {
                result.uriTrustInfo = [];
            }
            result.uriTrustInfo = result.uriTrustInfo.map(info => { return { uri: uri_1.URI.revive(info.uri), trusted: info.trusted }; });
            result.uriTrustInfo = result.uriTrustInfo.filter(info => info.trusted);
            return result;
        }
        async saveTrustInfo() {
            this.storageService.store(this.storageKey, JSON.stringify(this._trustStateInfo), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this._onDidChangeTrustedFolders.fire();
            await this.updateWorkspaceTrust();
        }
        getWorkspaceUris() {
            const workspaceUris = this._canonicalWorkspace.folders.map(f => f.uri);
            const workspaceConfiguration = this._canonicalWorkspace.configuration;
            if (workspaceConfiguration && (0, workspace_1.isSavedWorkspace)(workspaceConfiguration, this.environmentService)) {
                workspaceUris.push(workspaceConfiguration);
            }
            return workspaceUris;
        }
        calculateWorkspaceTrust() {
            // Feature is disabled
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return true;
            }
            // Canonical Uris not yet resolved
            if (!this._canonicalUrisResolved) {
                return false;
            }
            // Remote - resolver explicitly sets workspace trust to TRUE
            if (this.environmentService.remoteAuthority && this._remoteAuthority?.options?.isTrusted) {
                return this._remoteAuthority.options.isTrusted;
            }
            // Empty workspace - use memento, open ediors, or user setting
            if (this.isEmptyWorkspace()) {
                // Use memento if present
                if (this._storedTrustState.isEmptyWorkspaceTrusted !== undefined) {
                    return this._storedTrustState.isEmptyWorkspaceTrusted;
                }
                // Startup files
                if (this._canonicalStartupFiles.length) {
                    return this.getUrisTrust(this._canonicalStartupFiles);
                }
                // User setting
                return !!this.configurationService.getValue(exports.WORKSPACE_TRUST_EMPTY_WINDOW);
            }
            return this.getUrisTrust(this.getWorkspaceUris());
        }
        async updateWorkspaceTrust(trusted) {
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return;
            }
            if (trusted === undefined) {
                await this.resolveCanonicalUris();
                trusted = this.calculateWorkspaceTrust();
            }
            if (this.isWorkspaceTrusted() === trusted) {
                return;
            }
            // Update workspace trust
            this.isTrusted = trusted;
            // Run workspace trust transition participants
            await this._trustTransitionManager.participate(trusted);
            // Fire workspace trust change event
            this._onDidChangeTrust.fire(trusted);
        }
        getUrisTrust(uris) {
            let state = true;
            for (const uri of uris) {
                const { trusted } = this.doGetUriTrustInfo(uri);
                if (!trusted) {
                    state = trusted;
                    return state;
                }
            }
            return state;
        }
        doGetUriTrustInfo(uri) {
            // Return trusted when workspace trust is disabled
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return { trusted: true, uri };
            }
            if (this.isTrustedVirtualResource(uri)) {
                return { trusted: true, uri };
            }
            if (this.isTrustedByRemote(uri)) {
                return { trusted: true, uri };
            }
            let resultState = false;
            let maxLength = -1;
            let resultUri = uri;
            for (const trustInfo of this._trustStateInfo.uriTrustInfo) {
                if (this.uriIdentityService.extUri.isEqualOrParent(uri, trustInfo.uri)) {
                    const fsPath = trustInfo.uri.fsPath;
                    if (fsPath.length > maxLength) {
                        maxLength = fsPath.length;
                        resultState = trustInfo.trusted;
                        resultUri = trustInfo.uri;
                    }
                }
            }
            return { trusted: resultState, uri: resultUri };
        }
        async doSetUrisTrust(uris, trusted) {
            let changed = false;
            for (const uri of uris) {
                if (trusted) {
                    if (this.isTrustedVirtualResource(uri)) {
                        continue;
                    }
                    if (this.isTrustedByRemote(uri)) {
                        continue;
                    }
                    const foundItem = this._trustStateInfo.uriTrustInfo.find(trustInfo => this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri));
                    if (!foundItem) {
                        this._trustStateInfo.uriTrustInfo.push({ uri, trusted: true });
                        changed = true;
                    }
                }
                else {
                    const previousLength = this._trustStateInfo.uriTrustInfo.length;
                    this._trustStateInfo.uriTrustInfo = this._trustStateInfo.uriTrustInfo.filter(trustInfo => !this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri));
                    if (previousLength !== this._trustStateInfo.uriTrustInfo.length) {
                        changed = true;
                    }
                }
            }
            if (changed) {
                await this.saveTrustInfo();
            }
        }
        isEmptyWorkspace() {
            if (this.workspaceService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                return true;
            }
            const workspace = this.workspaceService.getWorkspace();
            if (workspace) {
                return (0, workspace_1.isTemporaryWorkspace)(this.workspaceService.getWorkspace()) && workspace.folders.length === 0;
            }
            return false;
        }
        isTrustedVirtualResource(uri) {
            return (0, virtualWorkspace_1.isVirtualResource)(uri) && uri.scheme !== 'vscode-vfs';
        }
        isTrustedByRemote(uri) {
            if (!this.environmentService.remoteAuthority) {
                return false;
            }
            if (!this._remoteAuthority) {
                return false;
            }
            return ((0, resources_1.isEqualAuthority)((0, remoteHosts_1.getRemoteAuthority)(uri), this._remoteAuthority.authority.authority)) && !!this._remoteAuthority.options?.isTrusted;
        }
        set isTrusted(value) {
            this._isTrusted = value;
            // Reset acceptsOutOfWorkspaceFiles
            if (!value) {
                this._storedTrustState.acceptsOutOfWorkspaceFiles = false;
            }
            // Empty workspace - save memento
            if (this.isEmptyWorkspace()) {
                this._storedTrustState.isEmptyWorkspaceTrusted = value;
            }
        }
        //#endregion
        //#region public interface
        get workspaceResolved() {
            return this._workspaceResolvedPromise;
        }
        get workspaceTrustInitialized() {
            return this._workspaceTrustInitializedPromise;
        }
        get acceptsOutOfWorkspaceFiles() {
            return this._storedTrustState.acceptsOutOfWorkspaceFiles;
        }
        set acceptsOutOfWorkspaceFiles(value) {
            this._storedTrustState.acceptsOutOfWorkspaceFiles = value;
        }
        isWorkspaceTrusted() {
            return this._isTrusted;
        }
        isWorkspaceTrustForced() {
            // Remote - remote authority explicitly sets workspace trust
            if (this.environmentService.remoteAuthority && this._remoteAuthority && this._remoteAuthority.options?.isTrusted !== undefined) {
                return true;
            }
            // All workspace uris are trusted automatically
            const workspaceUris = this.getWorkspaceUris().filter(uri => !this.isTrustedVirtualResource(uri));
            if (workspaceUris.length === 0) {
                return true;
            }
            return false;
        }
        canSetParentFolderTrust() {
            const workspaceIdentifier = (0, workspace_1.toWorkspaceIdentifier)(this._canonicalWorkspace);
            if (!(0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier)) {
                return false;
            }
            if (workspaceIdentifier.uri.scheme !== network_1.Schemas.file && workspaceIdentifier.uri.scheme !== network_1.Schemas.vscodeRemote) {
                return false;
            }
            const parentFolder = this.uriIdentityService.extUri.dirname(workspaceIdentifier.uri);
            if (this.uriIdentityService.extUri.isEqual(workspaceIdentifier.uri, parentFolder)) {
                return false;
            }
            return true;
        }
        async setParentFolderTrust(trusted) {
            if (this.canSetParentFolderTrust()) {
                const workspaceUri = (0, workspace_1.toWorkspaceIdentifier)(this._canonicalWorkspace).uri;
                const parentFolder = this.uriIdentityService.extUri.dirname(workspaceUri);
                await this.setUrisTrust([parentFolder], trusted);
            }
        }
        canSetWorkspaceTrust() {
            // Remote - remote authority not yet resolved, or remote authority explicitly sets workspace trust
            if (this.environmentService.remoteAuthority && (!this._remoteAuthority || this._remoteAuthority.options?.isTrusted !== undefined)) {
                return false;
            }
            // Empty workspace
            if (this.isEmptyWorkspace()) {
                return true;
            }
            // All workspace uris are trusted automatically
            const workspaceUris = this.getWorkspaceUris().filter(uri => !this.isTrustedVirtualResource(uri));
            if (workspaceUris.length === 0) {
                return false;
            }
            // Untrusted workspace
            if (!this.isWorkspaceTrusted()) {
                return true;
            }
            // Trusted workspaces
            // Can only untrusted in the single folder scenario
            const workspaceIdentifier = (0, workspace_1.toWorkspaceIdentifier)(this._canonicalWorkspace);
            if (!(0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier)) {
                return false;
            }
            // Can only be untrusted in certain schemes
            if (workspaceIdentifier.uri.scheme !== network_1.Schemas.file && workspaceIdentifier.uri.scheme !== 'vscode-vfs') {
                return false;
            }
            // If the current folder isn't trusted directly, return false
            const trustInfo = this.doGetUriTrustInfo(workspaceIdentifier.uri);
            if (!trustInfo.trusted || !this.uriIdentityService.extUri.isEqual(workspaceIdentifier.uri, trustInfo.uri)) {
                return false;
            }
            // Check if the parent is also trusted
            if (this.canSetParentFolderTrust()) {
                const parentFolder = this.uriIdentityService.extUri.dirname(workspaceIdentifier.uri);
                const parentPathTrustInfo = this.doGetUriTrustInfo(parentFolder);
                if (parentPathTrustInfo.trusted) {
                    return false;
                }
            }
            return true;
        }
        async setWorkspaceTrust(trusted) {
            // Empty workspace
            if (this.isEmptyWorkspace()) {
                await this.updateWorkspaceTrust(trusted);
                return;
            }
            const workspaceFolders = this.getWorkspaceUris();
            await this.setUrisTrust(workspaceFolders, trusted);
        }
        async getUriTrustInfo(uri) {
            // Return trusted when workspace trust is disabled
            if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                return { trusted: true, uri };
            }
            // Uri is trusted automatically by the remote
            if (this.isTrustedByRemote(uri)) {
                return { trusted: true, uri };
            }
            return this.doGetUriTrustInfo(await this.getCanonicalUri(uri));
        }
        async setUrisTrust(uris, trusted) {
            this.doSetUrisTrust(await Promise.all(uris.map(uri => this.getCanonicalUri(uri))), trusted);
        }
        getTrustedUris() {
            return this._trustStateInfo.uriTrustInfo.map(info => info.uri);
        }
        async setTrustedUris(uris) {
            this._trustStateInfo.uriTrustInfo = [];
            for (const uri of uris) {
                const canonicalUri = await this.getCanonicalUri(uri);
                const cleanUri = this.uriIdentityService.extUri.removeTrailingPathSeparator(canonicalUri);
                let added = false;
                for (const addedUri of this._trustStateInfo.uriTrustInfo) {
                    if (this.uriIdentityService.extUri.isEqual(addedUri.uri, cleanUri)) {
                        added = true;
                        break;
                    }
                }
                if (added) {
                    continue;
                }
                this._trustStateInfo.uriTrustInfo.push({
                    trusted: true,
                    uri: cleanUri
                });
            }
            await this.saveTrustInfo();
        }
        addWorkspaceTrustTransitionParticipant(participant) {
            return this._trustTransitionManager.addWorkspaceTrustTransitionParticipant(participant);
        }
    };
    exports.WorkspaceTrustManagementService = WorkspaceTrustManagementService;
    exports.WorkspaceTrustManagementService = WorkspaceTrustManagementService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(2, storage_1.IStorageService),
        __param(3, uriIdentity_1.IUriIdentityService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, workspaceTrust_1.IWorkspaceTrustEnablementService),
        __param(7, files_1.IFileService)
    ], WorkspaceTrustManagementService);
    let WorkspaceTrustRequestService = class WorkspaceTrustRequestService extends lifecycle_1.Disposable {
        constructor(configurationService, workspaceTrustManagementService) {
            super();
            this.configurationService = configurationService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this._onDidInitiateOpenFilesTrustRequest = this._register(new event_1.Emitter());
            this.onDidInitiateOpenFilesTrustRequest = this._onDidInitiateOpenFilesTrustRequest.event;
            this._onDidInitiateWorkspaceTrustRequest = this._register(new event_1.Emitter());
            this.onDidInitiateWorkspaceTrustRequest = this._onDidInitiateWorkspaceTrustRequest.event;
            this._onDidInitiateWorkspaceTrustRequestOnStartup = this._register(new event_1.Emitter());
            this.onDidInitiateWorkspaceTrustRequestOnStartup = this._onDidInitiateWorkspaceTrustRequestOnStartup.event;
        }
        //#region Open file(s) trust request
        get untrustedFilesSetting() {
            return this.configurationService.getValue(exports.WORKSPACE_TRUST_UNTRUSTED_FILES);
        }
        set untrustedFilesSetting(value) {
            this.configurationService.updateValue(exports.WORKSPACE_TRUST_UNTRUSTED_FILES, value);
        }
        async completeOpenFilesTrustRequest(result, saveResponse) {
            if (!this._openFilesTrustRequestResolver) {
                return;
            }
            // Set acceptsOutOfWorkspaceFiles
            if (result === 1 /* WorkspaceTrustUriResponse.Open */) {
                this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles = true;
            }
            // Save response
            if (saveResponse) {
                if (result === 1 /* WorkspaceTrustUriResponse.Open */) {
                    this.untrustedFilesSetting = 'open';
                }
                if (result === 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */) {
                    this.untrustedFilesSetting = 'newWindow';
                }
            }
            // Resolve promise
            this._openFilesTrustRequestResolver(result);
            this._openFilesTrustRequestResolver = undefined;
            this._openFilesTrustRequestPromise = undefined;
        }
        async requestOpenFilesTrust(uris) {
            // If workspace is untrusted, there is no conflict
            if (!this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
            const openFilesTrustInfo = await Promise.all(uris.map(uri => this.workspaceTrustManagementService.getUriTrustInfo(uri)));
            // If all uris are trusted, there is no conflict
            if (openFilesTrustInfo.map(info => info.trusted).every(trusted => trusted)) {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
            // If user has setting, don't need to ask
            if (this.untrustedFilesSetting !== 'prompt') {
                if (this.untrustedFilesSetting === 'newWindow') {
                    return 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */;
                }
                if (this.untrustedFilesSetting === 'open') {
                    return 1 /* WorkspaceTrustUriResponse.Open */;
                }
            }
            // If we already asked the user, don't need to ask again
            if (this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles) {
                return 1 /* WorkspaceTrustUriResponse.Open */;
            }
            // Create/return a promise
            if (!this._openFilesTrustRequestPromise) {
                this._openFilesTrustRequestPromise = new Promise(resolve => {
                    this._openFilesTrustRequestResolver = resolve;
                });
            }
            else {
                return this._openFilesTrustRequestPromise;
            }
            this._onDidInitiateOpenFilesTrustRequest.fire();
            return this._openFilesTrustRequestPromise;
        }
        //#endregion
        //#region Workspace trust request
        resolveWorkspaceTrustRequest(trusted) {
            if (this._workspaceTrustRequestResolver) {
                this._workspaceTrustRequestResolver(trusted ?? this.workspaceTrustManagementService.isWorkspaceTrusted());
                this._workspaceTrustRequestResolver = undefined;
                this._workspaceTrustRequestPromise = undefined;
            }
        }
        cancelWorkspaceTrustRequest() {
            if (this._workspaceTrustRequestResolver) {
                this._workspaceTrustRequestResolver(undefined);
                this._workspaceTrustRequestResolver = undefined;
                this._workspaceTrustRequestPromise = undefined;
            }
        }
        async completeWorkspaceTrustRequest(trusted) {
            if (trusted === undefined || trusted === this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                this.resolveWorkspaceTrustRequest(trusted);
                return;
            }
            // Register one-time event handler to resolve the promise when workspace trust changed
            event_1.Event.once(this.workspaceTrustManagementService.onDidChangeTrust)(trusted => this.resolveWorkspaceTrustRequest(trusted));
            // Update storage, transition workspace state
            await this.workspaceTrustManagementService.setWorkspaceTrust(trusted);
        }
        async requestWorkspaceTrust(options) {
            // Trusted workspace
            if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
                return this.workspaceTrustManagementService.isWorkspaceTrusted();
            }
            // Modal request
            if (!this._workspaceTrustRequestPromise) {
                // Create promise
                this._workspaceTrustRequestPromise = new Promise(resolve => {
                    this._workspaceTrustRequestResolver = resolve;
                });
            }
            else {
                // Return existing promise
                return this._workspaceTrustRequestPromise;
            }
            this._onDidInitiateWorkspaceTrustRequest.fire(options);
            return this._workspaceTrustRequestPromise;
        }
        requestWorkspaceTrustOnStartup() {
            if (!this._workspaceTrustRequestPromise) {
                // Create promise
                this._workspaceTrustRequestPromise = new Promise(resolve => {
                    this._workspaceTrustRequestResolver = resolve;
                });
            }
            this._onDidInitiateWorkspaceTrustRequestOnStartup.fire();
        }
    };
    exports.WorkspaceTrustRequestService = WorkspaceTrustRequestService;
    exports.WorkspaceTrustRequestService = WorkspaceTrustRequestService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], WorkspaceTrustRequestService);
    class WorkspaceTrustTransitionManager extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.participants = new linkedList_1.LinkedList();
        }
        addWorkspaceTrustTransitionParticipant(participant) {
            const remove = this.participants.push(participant);
            return (0, lifecycle_1.toDisposable)(() => remove());
        }
        async participate(trusted) {
            for (const participant of this.participants) {
                await participant.participate(trusted);
            }
        }
        dispose() {
            this.participants.clear();
            super.dispose();
        }
    }
    class WorkspaceTrustMemento {
        constructor(storageService) {
            this._acceptsOutOfWorkspaceFilesKey = 'acceptsOutOfWorkspaceFiles';
            this._isEmptyWorkspaceTrustedKey = 'isEmptyWorkspaceTrusted';
            if (storageService) {
                this._memento = new memento_1.Memento('workspaceTrust', storageService);
                this._mementoObject = this._memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this._mementoObject = {};
            }
        }
        get acceptsOutOfWorkspaceFiles() {
            return this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] ?? false;
        }
        set acceptsOutOfWorkspaceFiles(value) {
            this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] = value;
            this._memento?.saveMemento();
        }
        get isEmptyWorkspaceTrusted() {
            return this._mementoObject[this._isEmptyWorkspaceTrustedKey];
        }
        set isEmptyWorkspaceTrusted(value) {
            this._mementoObject[this._isEmptyWorkspaceTrustedKey] = value;
            this._memento?.saveMemento();
        }
    }
    (0, extensions_1.registerSingleton)(workspaceTrust_1.IWorkspaceTrustRequestService, WorkspaceTrustRequestService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVHJ1c3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3Jrc3BhY2VzL2NvbW1vbi93b3Jrc3BhY2VUcnVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1Qm5GLFFBQUEsdUJBQXVCLEdBQUcsa0NBQWtDLENBQUM7SUFDN0QsUUFBQSw4QkFBOEIsR0FBRyx3Q0FBd0MsQ0FBQztJQUMxRSxRQUFBLHNCQUFzQixHQUFHLGlDQUFpQyxDQUFDO0lBQzNELFFBQUEsK0JBQStCLEdBQUcseUNBQXlDLENBQUM7SUFDNUUsUUFBQSw0QkFBNEIsR0FBRyxzQ0FBc0MsQ0FBQztJQUN0RSxRQUFBLGlDQUFpQyxHQUFHLHVDQUF1QyxDQUFDO0lBQzVFLFFBQUEsMkJBQTJCLEdBQUcseUJBQXlCLENBQUM7SUFFckUsTUFBYSxrQkFBa0I7UUFDOUIsWUFDa0IsaUJBQTZCLEVBQzdCLG1CQUEwQixFQUMxQixzQkFBOEM7WUFGOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFZO1lBQzdCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBTztZQUMxQiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1FBQzVELENBQUM7UUFHTCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUMzRCxPQUFPO29CQUNOLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztvQkFDbkIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO29CQUNqQixVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVU7b0JBQzdCLEdBQUcsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO2lCQUNwQyxDQUFDO1lB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
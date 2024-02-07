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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/workbench/services/environment/common/environmentService", "vs/platform/extensions/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/workbench/services/extensions/common/extensions", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensionManagement/browser/extensionBisect", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, event_1, lifecycle_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, workspace_1, storage_1, environmentService_1, extensions_1, configuration_1, extensions_2, extensionEnablementService_1, extensions_3, userDataSyncAccount_1, userDataSync_1, lifecycle_2, notification_1, host_1, extensionBisect_1, workspaceTrust_1, extensionManifestPropertiesService_1, virtualWorkspace_1, log_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionEnablementService = void 0;
    const SOURCE = 'IWorkbenchExtensionEnablementService';
    let ExtensionEnablementService = class ExtensionEnablementService extends lifecycle_1.Disposable {
        constructor(storageService, globalExtensionEnablementService, contextService, environmentService, extensionManagementService, configurationService, extensionManagementServerService, userDataSyncEnablementService, userDataSyncAccountService, lifecycleService, notificationService, hostService, extensionBisectService, workspaceTrustManagementService, workspaceTrustRequestService, extensionManifestPropertiesService, instantiationService) {
            super();
            this.globalExtensionEnablementService = globalExtensionEnablementService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.configurationService = configurationService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.userDataSyncAccountService = userDataSyncAccountService;
            this.lifecycleService = lifecycleService;
            this.notificationService = notificationService;
            this.extensionBisectService = extensionBisectService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this._onEnablementChanged = new event_1.Emitter();
            this.onEnablementChanged = this._onEnablementChanged.event;
            this.storageManger = this._register(new extensionEnablementService_1.StorageManager(storageService));
            const uninstallDisposable = this._register(event_1.Event.filter(extensionManagementService.onDidUninstallExtension, e => !e.error)(({ identifier }) => this._reset(identifier)));
            let isDisposed = false;
            this._register((0, lifecycle_1.toDisposable)(() => isDisposed = true));
            this.extensionsManager = this._register(instantiationService.createInstance(ExtensionsManager));
            this.extensionsManager.whenInitialized().then(() => {
                if (!isDisposed) {
                    this._register(this.extensionsManager.onDidChangeExtensions(({ added, removed, isProfileSwitch }) => this._onDidChangeExtensions(added, removed, isProfileSwitch)));
                    uninstallDisposable.dispose();
                }
            });
            this._register(this.globalExtensionEnablementService.onDidChangeEnablement(({ extensions, source }) => this._onDidChangeGloballyDisabledExtensions(extensions, source)));
            // delay notification for extensions disabled until workbench restored
            if (this.allUserExtensionsDisabled) {
                this.lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(() => {
                    this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('extensionsDisabled', "All installed extensions are temporarily disabled."), [{
                            label: (0, nls_1.localize)('Reload', "Reload and Enable Extensions"),
                            run: () => hostService.reload({ disableExtensions: false })
                        }], {
                        sticky: true,
                        priority: notification_1.NotificationPriority.URGENT
                    });
                });
            }
        }
        get hasWorkspace() {
            return this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
        }
        get allUserExtensionsDisabled() {
            return this.environmentService.disableExtensions === true;
        }
        getEnablementState(extension) {
            return this._computeEnablementState(extension, this.extensionsManager.extensions, this.getWorkspaceType());
        }
        getEnablementStates(extensions, workspaceTypeOverrides = {}) {
            const extensionsEnablements = new Map();
            const workspaceType = { ...this.getWorkspaceType(), ...workspaceTypeOverrides };
            return extensions.map(extension => this._computeEnablementState(extension, extensions, workspaceType, extensionsEnablements));
        }
        getDependenciesEnablementStates(extension) {
            return (0, extensionManagementUtil_1.getExtensionDependencies)(this.extensionsManager.extensions, extension).map(e => [e, this.getEnablementState(e)]);
        }
        canChangeEnablement(extension) {
            try {
                this.throwErrorIfCannotChangeEnablement(extension);
                return true;
            }
            catch (error) {
                return false;
            }
        }
        canChangeWorkspaceEnablement(extension) {
            if (!this.canChangeEnablement(extension)) {
                return false;
            }
            try {
                this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
                return true;
            }
            catch (error) {
                return false;
            }
        }
        throwErrorIfCannotChangeEnablement(extension, donotCheckDependencies) {
            if ((0, extensions_1.isLanguagePackExtension)(extension.manifest)) {
                throw new Error((0, nls_1.localize)('cannot disable language pack extension', "Cannot change enablement of {0} extension because it contributes language packs.", extension.manifest.displayName || extension.identifier.id));
            }
            if (this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account &&
                (0, extensions_1.isAuthenticationProviderExtension)(extension.manifest) && extension.manifest.contributes.authentication.some(a => a.id === this.userDataSyncAccountService.account.authenticationProviderId)) {
                throw new Error((0, nls_1.localize)('cannot disable auth extension', "Cannot change enablement {0} extension because Settings Sync depends on it.", extension.manifest.displayName || extension.identifier.id));
            }
            if (this._isEnabledInEnv(extension)) {
                throw new Error((0, nls_1.localize)('cannot change enablement environment', "Cannot change enablement of {0} extension because it is enabled in environment", extension.manifest.displayName || extension.identifier.id));
            }
            this.throwErrorIfEnablementStateCannotBeChanged(extension, this.getEnablementState(extension), donotCheckDependencies);
        }
        throwErrorIfEnablementStateCannotBeChanged(extension, enablementStateOfExtension, donotCheckDependencies) {
            switch (enablementStateOfExtension) {
                case 2 /* EnablementState.DisabledByEnvironment */:
                    throw new Error((0, nls_1.localize)('cannot change disablement environment', "Cannot change enablement of {0} extension because it is disabled in environment", extension.manifest.displayName || extension.identifier.id));
                case 4 /* EnablementState.DisabledByVirtualWorkspace */:
                    throw new Error((0, nls_1.localize)('cannot change enablement virtual workspace', "Cannot change enablement of {0} extension because it does not support virtual workspaces", extension.manifest.displayName || extension.identifier.id));
                case 1 /* EnablementState.DisabledByExtensionKind */:
                    throw new Error((0, nls_1.localize)('cannot change enablement extension kind', "Cannot change enablement of {0} extension because of its extension kind", extension.manifest.displayName || extension.identifier.id));
                case 5 /* EnablementState.DisabledByExtensionDependency */:
                    if (donotCheckDependencies) {
                        break;
                    }
                    // Can be changed only when all its dependencies enablements can be changed
                    for (const dependency of (0, extensionManagementUtil_1.getExtensionDependencies)(this.extensionsManager.extensions, extension)) {
                        if (this.isEnabled(dependency)) {
                            continue;
                        }
                        try {
                            this.throwErrorIfCannotChangeEnablement(dependency, true);
                        }
                        catch (error) {
                            throw new Error((0, nls_1.localize)('cannot change enablement dependency', "Cannot enable '{0}' extension because it depends on '{1}' extension that cannot be enabled", extension.manifest.displayName || extension.identifier.id, dependency.manifest.displayName || dependency.identifier.id));
                        }
                    }
            }
        }
        throwErrorIfCannotChangeWorkspaceEnablement(extension) {
            if (!this.hasWorkspace) {
                throw new Error((0, nls_1.localize)('noWorkspace', "No workspace."));
            }
            if ((0, extensions_1.isAuthenticationProviderExtension)(extension.manifest)) {
                throw new Error((0, nls_1.localize)('cannot disable auth extension in workspace', "Cannot change enablement of {0} extension in workspace because it contributes authentication providers", extension.manifest.displayName || extension.identifier.id));
            }
        }
        async setEnablement(extensions, newState) {
            await this.extensionsManager.whenInitialized();
            if (newState === 8 /* EnablementState.EnabledGlobally */ || newState === 9 /* EnablementState.EnabledWorkspace */) {
                extensions.push(...this.getExtensionsToEnableRecursively(extensions, this.extensionsManager.extensions, newState, { dependencies: true, pack: true }));
            }
            const workspace = newState === 7 /* EnablementState.DisabledWorkspace */ || newState === 9 /* EnablementState.EnabledWorkspace */;
            for (const extension of extensions) {
                if (workspace) {
                    this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
                }
                else {
                    this.throwErrorIfCannotChangeEnablement(extension);
                }
            }
            const result = [];
            for (const extension of extensions) {
                const enablementState = this.getEnablementState(extension);
                if (enablementState === 0 /* EnablementState.DisabledByTrustRequirement */
                    /* All its disabled dependencies are disabled by Trust Requirement */
                    || (enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.getDependenciesEnablementStates(extension).every(([, e]) => this.isEnabledEnablementState(e) || e === 0 /* EnablementState.DisabledByTrustRequirement */))) {
                    const trustState = await this.workspaceTrustRequestService.requestWorkspaceTrust();
                    result.push(trustState ?? false);
                }
                else {
                    result.push(await this._setUserEnablementState(extension, newState));
                }
            }
            const changedExtensions = extensions.filter((e, index) => result[index]);
            if (changedExtensions.length) {
                this._onEnablementChanged.fire(changedExtensions);
            }
            return result;
        }
        getExtensionsToEnableRecursively(extensions, allExtensions, enablementState, options, checked = []) {
            if (!options.dependencies && !options.pack) {
                return [];
            }
            const toCheck = extensions.filter(e => checked.indexOf(e) === -1);
            if (!toCheck.length) {
                return [];
            }
            for (const extension of toCheck) {
                checked.push(extension);
            }
            const extensionsToEnable = [];
            for (const extension of allExtensions) {
                // Extension is already checked
                if (checked.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))) {
                    continue;
                }
                const enablementStateOfExtension = this.getEnablementState(extension);
                // Extension is enabled
                if (this.isEnabledEnablementState(enablementStateOfExtension)) {
                    continue;
                }
                // Skip if dependency extension is disabled by extension kind
                if (enablementStateOfExtension === 1 /* EnablementState.DisabledByExtensionKind */) {
                    continue;
                }
                // Check if the extension is a dependency or in extension pack
                if (extensions.some(e => (options.dependencies && e.manifest.extensionDependencies?.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)))
                    || (options.pack && e.manifest.extensionPack?.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier))))) {
                    const index = extensionsToEnable.findIndex(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier));
                    // Extension is not added to the disablement list so add it
                    if (index === -1) {
                        extensionsToEnable.push(extension);
                    }
                    // Extension is there already in the disablement list.
                    else {
                        try {
                            // Replace only if the enablement state can be changed
                            this.throwErrorIfEnablementStateCannotBeChanged(extension, enablementStateOfExtension, true);
                            extensionsToEnable.splice(index, 1, extension);
                        }
                        catch (error) { /*Do not add*/ }
                    }
                }
            }
            if (extensionsToEnable.length) {
                extensionsToEnable.push(...this.getExtensionsToEnableRecursively(extensionsToEnable, allExtensions, enablementState, options, checked));
            }
            return extensionsToEnable;
        }
        _setUserEnablementState(extension, newState) {
            const currentState = this._getUserEnablementState(extension.identifier);
            if (currentState === newState) {
                return Promise.resolve(false);
            }
            switch (newState) {
                case 8 /* EnablementState.EnabledGlobally */:
                    this._enableExtension(extension.identifier);
                    break;
                case 6 /* EnablementState.DisabledGlobally */:
                    this._disableExtension(extension.identifier);
                    break;
                case 9 /* EnablementState.EnabledWorkspace */:
                    this._enableExtensionInWorkspace(extension.identifier);
                    break;
                case 7 /* EnablementState.DisabledWorkspace */:
                    this._disableExtensionInWorkspace(extension.identifier);
                    break;
            }
            return Promise.resolve(true);
        }
        isEnabled(extension) {
            const enablementState = this.getEnablementState(extension);
            return this.isEnabledEnablementState(enablementState);
        }
        isEnabledEnablementState(enablementState) {
            return enablementState === 3 /* EnablementState.EnabledByEnvironment */ || enablementState === 9 /* EnablementState.EnabledWorkspace */ || enablementState === 8 /* EnablementState.EnabledGlobally */;
        }
        isDisabledGlobally(extension) {
            return this._isDisabledGlobally(extension.identifier);
        }
        _computeEnablementState(extension, extensions, workspaceType, computedEnablementStates) {
            computedEnablementStates = computedEnablementStates ?? new Map();
            let enablementState = computedEnablementStates.get(extension);
            if (enablementState !== undefined) {
                return enablementState;
            }
            enablementState = this._getUserEnablementState(extension.identifier);
            if (this.extensionBisectService.isDisabledByBisect(extension)) {
                enablementState = 2 /* EnablementState.DisabledByEnvironment */;
            }
            else if (this._isDisabledInEnv(extension)) {
                enablementState = 2 /* EnablementState.DisabledByEnvironment */;
            }
            else if (this._isDisabledByVirtualWorkspace(extension, workspaceType)) {
                enablementState = 4 /* EnablementState.DisabledByVirtualWorkspace */;
            }
            else if (this.isEnabledEnablementState(enablementState) && this._isDisabledByWorkspaceTrust(extension, workspaceType)) {
                enablementState = 0 /* EnablementState.DisabledByTrustRequirement */;
            }
            else if (this._isDisabledByExtensionKind(extension)) {
                enablementState = 1 /* EnablementState.DisabledByExtensionKind */;
            }
            else if (this.isEnabledEnablementState(enablementState) && this._isDisabledByExtensionDependency(extension, extensions, workspaceType, computedEnablementStates)) {
                enablementState = 5 /* EnablementState.DisabledByExtensionDependency */;
            }
            else if (!this.isEnabledEnablementState(enablementState) && this._isEnabledInEnv(extension)) {
                enablementState = 3 /* EnablementState.EnabledByEnvironment */;
            }
            computedEnablementStates.set(extension, enablementState);
            return enablementState;
        }
        _isDisabledInEnv(extension) {
            if (this.allUserExtensionsDisabled) {
                return !extension.isBuiltin && !(0, extensions_1.isResolverExtension)(extension.manifest, this.environmentService.remoteAuthority);
            }
            const disabledExtensions = this.environmentService.disableExtensions;
            if (Array.isArray(disabledExtensions)) {
                return disabledExtensions.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier));
            }
            // Check if this is the better merge extension which was migrated to a built-in extension
            if ((0, extensionManagementUtil_1.areSameExtensions)({ id: extensionManagementUtil_1.BetterMergeId.value }, extension.identifier)) {
                return true;
            }
            return false;
        }
        _isEnabledInEnv(extension) {
            const enabledExtensions = this.environmentService.enableExtensions;
            if (Array.isArray(enabledExtensions)) {
                return enabledExtensions.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier));
            }
            return false;
        }
        _isDisabledByVirtualWorkspace(extension, workspaceType) {
            // Not a virtual workspace
            if (!workspaceType.virtual) {
                return false;
            }
            // Supports virtual workspace
            if (this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.manifest) !== false) {
                return false;
            }
            // Web extension from web extension management server
            if (this.extensionManagementServerService.getExtensionManagementServer(extension) === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWeb(extension.manifest)) {
                return false;
            }
            return true;
        }
        _isDisabledByExtensionKind(extension) {
            if (this.extensionManagementServerService.remoteExtensionManagementServer || this.extensionManagementServerService.webExtensionManagementServer) {
                const installLocation = this.extensionManagementServerService.getExtensionInstallLocation(extension);
                for (const extensionKind of this.extensionManifestPropertiesService.getExtensionKind(extension.manifest)) {
                    if (extensionKind === 'ui') {
                        if (installLocation === 1 /* ExtensionInstallLocation.Local */) {
                            return false;
                        }
                    }
                    if (extensionKind === 'workspace') {
                        if (installLocation === 2 /* ExtensionInstallLocation.Remote */) {
                            return false;
                        }
                    }
                    if (extensionKind === 'web') {
                        if (this.extensionManagementServerService.webExtensionManagementServer /* web */) {
                            if (installLocation === 3 /* ExtensionInstallLocation.Web */ || installLocation === 2 /* ExtensionInstallLocation.Remote */) {
                                return false;
                            }
                        }
                        else if (installLocation === 1 /* ExtensionInstallLocation.Local */) {
                            const enableLocalWebWorker = this.configurationService.getValue(extensions_3.webWorkerExtHostConfig);
                            if (enableLocalWebWorker === true || enableLocalWebWorker === 'auto') {
                                // Web extensions are enabled on all configurations
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
            return false;
        }
        _isDisabledByWorkspaceTrust(extension, workspaceType) {
            if (workspaceType.trusted) {
                return false;
            }
            return this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.manifest) === false;
        }
        _isDisabledByExtensionDependency(extension, extensions, workspaceType, computedEnablementStates) {
            // Find dependencies from the same server as of the extension
            const dependencyExtensions = extension.manifest.extensionDependencies
                ? extensions.filter(e => extension.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }) && this.extensionManagementServerService.getExtensionManagementServer(e) === this.extensionManagementServerService.getExtensionManagementServer(extension)))
                : [];
            if (!dependencyExtensions.length) {
                return false;
            }
            const hasEnablementState = computedEnablementStates.has(extension);
            if (!hasEnablementState) {
                // Placeholder to handle cyclic deps
                computedEnablementStates.set(extension, 8 /* EnablementState.EnabledGlobally */);
            }
            try {
                for (const dependencyExtension of dependencyExtensions) {
                    const enablementState = this._computeEnablementState(dependencyExtension, extensions, workspaceType, computedEnablementStates);
                    if (!this.isEnabledEnablementState(enablementState) && enablementState !== 1 /* EnablementState.DisabledByExtensionKind */) {
                        return true;
                    }
                }
            }
            finally {
                if (!hasEnablementState) {
                    // remove the placeholder
                    computedEnablementStates.delete(extension);
                }
            }
            return false;
        }
        _getUserEnablementState(identifier) {
            if (this.hasWorkspace) {
                if (this._getWorkspaceEnabledExtensions().filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e, identifier))[0]) {
                    return 9 /* EnablementState.EnabledWorkspace */;
                }
                if (this._getWorkspaceDisabledExtensions().filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e, identifier))[0]) {
                    return 7 /* EnablementState.DisabledWorkspace */;
                }
            }
            if (this._isDisabledGlobally(identifier)) {
                return 6 /* EnablementState.DisabledGlobally */;
            }
            return 8 /* EnablementState.EnabledGlobally */;
        }
        _isDisabledGlobally(identifier) {
            return this.globalExtensionEnablementService.getDisabledExtensions().some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, identifier));
        }
        _enableExtension(identifier) {
            this._removeFromWorkspaceDisabledExtensions(identifier);
            this._removeFromWorkspaceEnabledExtensions(identifier);
            return this.globalExtensionEnablementService.enableExtension(identifier, SOURCE);
        }
        _disableExtension(identifier) {
            this._removeFromWorkspaceDisabledExtensions(identifier);
            this._removeFromWorkspaceEnabledExtensions(identifier);
            return this.globalExtensionEnablementService.disableExtension(identifier, SOURCE);
        }
        _enableExtensionInWorkspace(identifier) {
            this._removeFromWorkspaceDisabledExtensions(identifier);
            this._addToWorkspaceEnabledExtensions(identifier);
        }
        _disableExtensionInWorkspace(identifier) {
            this._addToWorkspaceDisabledExtensions(identifier);
            this._removeFromWorkspaceEnabledExtensions(identifier);
        }
        _addToWorkspaceDisabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return Promise.resolve(false);
            }
            const disabledExtensions = this._getWorkspaceDisabledExtensions();
            if (disabledExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)(e, identifier))) {
                disabledExtensions.push(identifier);
                this._setDisabledExtensions(disabledExtensions);
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        }
        async _removeFromWorkspaceDisabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return false;
            }
            const disabledExtensions = this._getWorkspaceDisabledExtensions();
            for (let index = 0; index < disabledExtensions.length; index++) {
                const disabledExtension = disabledExtensions[index];
                if ((0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier)) {
                    disabledExtensions.splice(index, 1);
                    this._setDisabledExtensions(disabledExtensions);
                    return true;
                }
            }
            return false;
        }
        _addToWorkspaceEnabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return false;
            }
            const enabledExtensions = this._getWorkspaceEnabledExtensions();
            if (enabledExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)(e, identifier))) {
                enabledExtensions.push(identifier);
                this._setEnabledExtensions(enabledExtensions);
                return true;
            }
            return false;
        }
        _removeFromWorkspaceEnabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return false;
            }
            const enabledExtensions = this._getWorkspaceEnabledExtensions();
            for (let index = 0; index < enabledExtensions.length; index++) {
                const disabledExtension = enabledExtensions[index];
                if ((0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier)) {
                    enabledExtensions.splice(index, 1);
                    this._setEnabledExtensions(enabledExtensions);
                    return true;
                }
            }
            return false;
        }
        _getWorkspaceEnabledExtensions() {
            return this._getExtensions(extensionManagement_1.ENABLED_EXTENSIONS_STORAGE_PATH);
        }
        _setEnabledExtensions(enabledExtensions) {
            this._setExtensions(extensionManagement_1.ENABLED_EXTENSIONS_STORAGE_PATH, enabledExtensions);
        }
        _getWorkspaceDisabledExtensions() {
            return this._getExtensions(extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH);
        }
        _setDisabledExtensions(disabledExtensions) {
            this._setExtensions(extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH, disabledExtensions);
        }
        _getExtensions(storageId) {
            if (!this.hasWorkspace) {
                return [];
            }
            return this.storageManger.get(storageId, 1 /* StorageScope.WORKSPACE */);
        }
        _setExtensions(storageId, extensions) {
            this.storageManger.set(storageId, extensions, 1 /* StorageScope.WORKSPACE */);
        }
        async _onDidChangeGloballyDisabledExtensions(extensionIdentifiers, source) {
            if (source !== SOURCE) {
                await this.extensionsManager.whenInitialized();
                const extensions = this.extensionsManager.extensions.filter(installedExtension => extensionIdentifiers.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, installedExtension.identifier)));
                this._onEnablementChanged.fire(extensions);
            }
        }
        _onDidChangeExtensions(added, removed, isProfileSwitch) {
            const disabledExtensions = added.filter(e => !this.isEnabledEnablementState(this.getEnablementState(e)));
            if (disabledExtensions.length) {
                this._onEnablementChanged.fire(disabledExtensions);
            }
            if (!isProfileSwitch) {
                removed.forEach(({ identifier }) => this._reset(identifier));
            }
        }
        async updateExtensionsEnablementsWhenWorkspaceTrustChanges() {
            await this.extensionsManager.whenInitialized();
            const computeEnablementStates = (workspaceType) => {
                const extensionsEnablements = new Map();
                return this.extensionsManager.extensions.map(extension => [extension, this._computeEnablementState(extension, this.extensionsManager.extensions, workspaceType, extensionsEnablements)]);
            };
            const workspaceType = this.getWorkspaceType();
            const enablementStatesWithTrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: true });
            const enablementStatesWithUntrustedWorkspace = computeEnablementStates({ ...workspaceType, trusted: false });
            const enablementChangedExtensionsBecauseOfTrust = enablementStatesWithTrustedWorkspace.filter(([, enablementState], index) => enablementState !== enablementStatesWithUntrustedWorkspace[index][1]).map(([extension]) => extension);
            if (enablementChangedExtensionsBecauseOfTrust.length) {
                this._onEnablementChanged.fire(enablementChangedExtensionsBecauseOfTrust);
            }
        }
        getWorkspaceType() {
            return { trusted: this.workspaceTrustManagementService.isWorkspaceTrusted(), virtual: (0, virtualWorkspace_1.isVirtualWorkspace)(this.contextService.getWorkspace()) };
        }
        _reset(extension) {
            this._removeFromWorkspaceDisabledExtensions(extension);
            this._removeFromWorkspaceEnabledExtensions(extension);
            this.globalExtensionEnablementService.enableExtension(extension);
        }
    };
    exports.ExtensionEnablementService = ExtensionEnablementService;
    exports.ExtensionEnablementService = ExtensionEnablementService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, extensionManagement_1.IGlobalExtensionEnablementService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, extensionManagement_1.IExtensionManagementService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, extensionManagement_2.IExtensionManagementServerService),
        __param(7, userDataSync_1.IUserDataSyncEnablementService),
        __param(8, userDataSyncAccount_1.IUserDataSyncAccountService),
        __param(9, lifecycle_2.ILifecycleService),
        __param(10, notification_1.INotificationService),
        __param(11, host_1.IHostService),
        __param(12, extensionBisect_1.IExtensionBisectService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(14, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(15, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(16, instantiation_1.IInstantiationService)
    ], ExtensionEnablementService);
    let ExtensionsManager = class ExtensionsManager extends lifecycle_1.Disposable {
        get extensions() { return this._extensions; }
        constructor(extensionManagementService, extensionManagementServerService, logService) {
            super();
            this.extensionManagementService = extensionManagementService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.logService = logService;
            this._extensions = [];
            this._onDidChangeExtensions = this._register(new event_1.Emitter());
            this.onDidChangeExtensions = this._onDidChangeExtensions.event;
            this.disposed = false;
            this._register((0, lifecycle_1.toDisposable)(() => this.disposed = true));
            this.initializePromise = this.initialize();
        }
        whenInitialized() {
            return this.initializePromise;
        }
        async initialize() {
            try {
                this._extensions = await this.extensionManagementService.getInstalled();
                if (this.disposed) {
                    return;
                }
                this._onDidChangeExtensions.fire({ added: this.extensions, removed: [], isProfileSwitch: false });
            }
            catch (error) {
                this.logService.error(error);
            }
            this._register(this.extensionManagementService.onDidInstallExtensions(e => this.updateExtensions(e.reduce((result, { local, operation }) => {
                if (local && operation !== 4 /* InstallOperation.Migrate */) {
                    result.push(local);
                }
                return result;
            }, []), [], undefined, false)));
            this._register(event_1.Event.filter(this.extensionManagementService.onDidUninstallExtension, (e => !e.error))(e => this.updateExtensions([], [e.identifier], e.server, false)));
            this._register(this.extensionManagementService.onDidChangeProfile(({ added, removed, server }) => {
                this.updateExtensions(added, removed.map(({ identifier }) => identifier), server, true);
            }));
        }
        updateExtensions(added, identifiers, server, isProfileSwitch) {
            if (added.length) {
                this._extensions.push(...added);
            }
            const removed = [];
            for (const identifier of identifiers) {
                const index = this._extensions.findIndex(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier) && this.extensionManagementServerService.getExtensionManagementServer(e) === server);
                if (index !== -1) {
                    removed.push(...this._extensions.splice(index, 1));
                }
            }
            if (added.length || removed.length) {
                this._onDidChangeExtensions.fire({ added, removed, isProfileSwitch });
            }
        }
    };
    ExtensionsManager = __decorate([
        __param(0, extensionManagement_2.IWorkbenchExtensionManagementService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, log_1.ILogService)
    ], ExtensionsManager);
    (0, extensions_2.registerSingleton)(extensionManagement_2.IWorkbenchExtensionEnablementService, ExtensionEnablementService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRW5hYmxlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25NYW5hZ2VtZW50L2Jyb3dzZXIvZXh0ZW5zaW9uRW5hYmxlbWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNEJoRyxNQUFNLE1BQU0sR0FBRyxzQ0FBc0MsQ0FBQztJQUkvQyxJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEyQixTQUFRLHNCQUFVO1FBVXpELFlBQ2tCLGNBQStCLEVBQ2IsZ0NBQXNGLEVBQy9GLGNBQXlELEVBQ3JELGtCQUFpRSxFQUNsRSwwQkFBdUQsRUFDN0Qsb0JBQTRELEVBQ2hELGdDQUFvRixFQUN2Riw2QkFBOEUsRUFDakYsMEJBQXdFLEVBQ2xGLGdCQUFvRCxFQUNqRCxtQkFBMEQsRUFDbEUsV0FBeUIsRUFDZCxzQkFBZ0UsRUFDdkQsK0JBQWtGLEVBQ3JGLDRCQUE0RSxFQUN0RSxrQ0FBd0YsRUFDdEcsb0JBQTJDO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBakI4QyxxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQW1DO1lBQzlFLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUNwQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBRXZELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDL0IscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUN0RSxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBQ2hFLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDakUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNoQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBRXRDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDdEMs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
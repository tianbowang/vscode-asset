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
define(["require", "exports", "vs/base/common/date", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/types", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/workbench/services/activity/common/activity", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, date_1, event_1, lifecycle_1, strings_1, types_1, nls, actions_1, commands_1, contextkey_1, dialogs_1, extensions_1, notification_1, productService_1, quickInput_1, storage_1, activity_1, authentication_1, environmentService_1, extensions_2, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuthenticationService = exports.getCurrentAuthenticationSessionInfo = exports.addAccountUsage = exports.getAuthenticationProviderActivationEvent = void 0;
    function getAuthenticationProviderActivationEvent(id) { return `onAuthenticationRequest:${id}`; }
    exports.getAuthenticationProviderActivationEvent = getAuthenticationProviderActivationEvent;
    // TODO: make this account usage stuff a service
    function readAccountUsages(storageService, providerId, accountName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        const storedUsages = storageService.get(accountKey, -1 /* StorageScope.APPLICATION */);
        let usages = [];
        if (storedUsages) {
            try {
                usages = JSON.parse(storedUsages);
            }
            catch (e) {
                // ignore
            }
        }
        return usages;
    }
    function removeAccountUsage(storageService, providerId, accountName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        storageService.remove(accountKey, -1 /* StorageScope.APPLICATION */);
    }
    function addAccountUsage(storageService, providerId, accountName, extensionId, extensionName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        const usages = readAccountUsages(storageService, providerId, accountName);
        const existingUsageIndex = usages.findIndex(usage => usage.extensionId === extensionId);
        if (existingUsageIndex > -1) {
            usages.splice(existingUsageIndex, 1, {
                extensionId,
                extensionName,
                lastUsed: Date.now()
            });
        }
        else {
            usages.push({
                extensionId,
                extensionName,
                lastUsed: Date.now()
            });
        }
        storageService.store(accountKey, JSON.stringify(usages), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
    }
    exports.addAccountUsage = addAccountUsage;
    async function getCurrentAuthenticationSessionInfo(secretStorageService, productService) {
        const authenticationSessionValue = await secretStorageService.get(`${productService.urlProtocol}.loginAccount`);
        if (authenticationSessionValue) {
            try {
                const authenticationSessionInfo = JSON.parse(authenticationSessionValue);
                if (authenticationSessionInfo
                    && (0, types_1.isString)(authenticationSessionInfo.id)
                    && (0, types_1.isString)(authenticationSessionInfo.accessToken)
                    && (0, types_1.isString)(authenticationSessionInfo.providerId)) {
                    return authenticationSessionInfo;
                }
            }
            catch (e) {
                // This is a best effort operation.
                console.error(`Failed parsing current auth session value: ${e}`);
            }
        }
        return undefined;
    }
    exports.getCurrentAuthenticationSessionInfo = getCurrentAuthenticationSessionInfo;
    function readAllowedExtensions(storageService, providerId, accountName) {
        let trustedExtensions = [];
        try {
            const trustedExtensionSrc = storageService.get(`${providerId}-${accountName}`, -1 /* StorageScope.APPLICATION */);
            if (trustedExtensionSrc) {
                trustedExtensions = JSON.parse(trustedExtensionSrc);
            }
        }
        catch (err) { }
        return trustedExtensions;
    }
    // OAuth2 spec prohibits space in a scope, so use that to join them.
    const SCOPESLIST_SEPARATOR = ' ';
    commands_1.CommandsRegistry.registerCommand('workbench.getCodeExchangeProxyEndpoints', function (accessor, _) {
        const environmentService = accessor.get(environmentService_1.IBrowserWorkbenchEnvironmentService);
        return environmentService.options?.codeExchangeProxyEndpoints;
    });
    const authenticationDefinitionSchema = {
        type: 'object',
        additionalProperties: false,
        properties: {
            id: {
                type: 'string',
                description: nls.localize('authentication.id', 'The id of the authentication provider.')
            },
            label: {
                type: 'string',
                description: nls.localize('authentication.label', 'The human readable name of the authentication provider.'),
            }
        }
    };
    const authenticationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'authentication',
        jsonSchema: {
            description: nls.localize({ key: 'authenticationExtensionPoint', comment: [`'Contributes' means adds here`] }, 'Contributes authentication'),
            type: 'array',
            items: authenticationDefinitionSchema
        },
        activationEventsGenerator: (authenticationProviders, result) => {
            for (const authenticationProvider of authenticationProviders) {
                if (authenticationProvider.id) {
                    result.push(`onAuthenticationRequest:${authenticationProvider.id}`);
                }
            }
        }
    });
    let placeholderMenuItem = actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.AccountsContext, {
        command: {
            id: 'noAuthenticationProviders',
            title: nls.localize('authentication.Placeholder', "No accounts requested yet..."),
            precondition: contextkey_1.ContextKeyExpr.false()
        },
    });
    let AuthenticationService = class AuthenticationService extends lifecycle_1.Disposable {
        constructor(activityService, extensionService, storageService, dialogService, quickInputService, productService, environmentService) {
            super();
            this.activityService = activityService;
            this.extensionService = extensionService;
            this.storageService = storageService;
            this.dialogService = dialogService;
            this.quickInputService = quickInputService;
            this.productService = productService;
            this._signInRequestItems = new Map();
            this._sessionAccessRequestItems = new Map();
            this._accountBadgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this._authenticationProviders = new Map();
            this._authenticationProviderDisposables = this._register(new lifecycle_1.DisposableMap());
            /**
             * All providers that have been statically declared by extensions. These may not be registered.
             */
            this.declaredProviders = [];
            this._onDidRegisterAuthenticationProvider = this._register(new event_1.Emitter());
            this.onDidRegisterAuthenticationProvider = this._onDidRegisterAuthenticationProvider.event;
            this._onDidUnregisterAuthenticationProvider = this._register(new event_1.Emitter());
            this.onDidUnregisterAuthenticationProvider = this._onDidUnregisterAuthenticationProvider.event;
            this._onDidChangeSessions = this._register(new event_1.Emitter());
            this.onDidChangeSessions = this._onDidChangeSessions.event;
            this._onDidChangeDeclaredProviders = this._register(new event_1.Emitter());
            this.onDidChangeDeclaredProviders = this._onDidChangeDeclaredProviders.event;
            environmentService.options?.authenticationProviders?.forEach(provider => this.registerAuthenticationProvider(provider.id, provider));
            authenticationExtPoint.setHandler((extensions, { added, removed }) => {
                added.forEach(point => {
                    for (const provider of point.value) {
                        if ((0, strings_1.isFalsyOrWhitespace)(provider.id)) {
                            point.collector.error(nls.localize('authentication.missingId', 'An authentication contribution must specify an id.'));
                            continue;
                        }
                        if ((0, strings_1.isFalsyOrWhitespace)(provider.label)) {
                            point.collector.error(nls.localize('authentication.missingLabel', 'An authentication contribution must specify a label.'));
                            continue;
                        }
                        if (!this.declaredProviders.some(p => p.id === provider.id)) {
                            this.declaredProviders.push(provider);
                        }
                        else {
                            point.collector.error(nls.localize('authentication.idConflict', "This authentication id '{0}' has already been registered", provider.id));
                        }
                    }
                });
                const removedExtPoints = removed.flatMap(r => r.value);
                removedExtPoints.forEach(point => {
                    const index = this.declaredProviders.findIndex(provider => provider.id === point.id);
                    if (index > -1) {
                        this.declaredProviders.splice(index, 1);
                    }
                });
                this._onDidChangeDeclaredProviders.fire(this.declaredProviders);
            });
        }
        getProviderIds() {
            const providerIds = [];
            this._authenticationProviders.forEach(provider => {
                providerIds.push(provider.id);
            });
            return providerIds;
        }
        isAuthenticationProviderRegistered(id) {
            return this._authenticationProviders.has(id);
        }
        registerAuthenticationProvider(id, authenticationProvider) {
            this._authenticationProviders.set(id, authenticationProvider);
            const disposableStore = new lifecycle_1.DisposableStore();
            disposableStore.add(authenticationProvider.onDidChangeSessions(e => this.sessionsUpdate(authenticationProvider, e)));
            if ((0, lifecycle_1.isDisposable)(authenticationProvider)) {
                disposableStore.add(authenticationProvider);
            }
            this._authenticationProviderDisposables.set(id, disposableStore);
            this._onDidRegisterAuthenticationProvider.fire({ id, label: authenticationProvider.label });
            if (placeholderMenuItem) {
                placeholderMenuItem.dispose();
                placeholderMenuItem = undefined;
            }
        }
        unregisterAuthenticationProvider(id) {
            const provider = this._authenticationProviders.get(id);
            if (provider) {
                this._authenticationProviders.delete(id);
                this._onDidUnregisterAuthenticationProvider.fire({ id, label: provider.label });
                const accessRequests = this._sessionAccessRequestItems.get(id) || {};
                Object.keys(accessRequests).forEach(extensionId => {
                    this.removeAccessRequest(id, extensionId);
                });
            }
            this._authenticationProviderDisposables.deleteAndDispose(id);
            if (!this._authenticationProviders.size) {
                placeholderMenuItem = actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.AccountsContext, {
                    command: {
                        id: 'noAuthenticationProviders',
                        title: nls.localize('loading', "Loading..."),
                        precondition: contextkey_1.ContextKeyExpr.false()
                    },
                });
            }
        }
        async sessionsUpdate(provider, event) {
            this._onDidChangeSessions.fire({ providerId: provider.id, label: provider.label, event });
            if (event.added?.length) {
                await this.updateNewSessionRequests(provider, event.added);
            }
            if (event.removed?.length) {
                await this.updateAccessRequests(provider.id, event.removed);
            }
            this.updateBadgeCount();
        }
        async updateNewSessionRequests(provider, addedSessions) {
            const existingRequestsForProvider = this._signInRequestItems.get(provider.id);
            if (!existingRequestsForProvider) {
                return;
            }
            Object.keys(existingRequestsForProvider).forEach(requestedScopes => {
                if (addedSessions.some(session => session.scopes.slice().join(SCOPESLIST_SEPARATOR) === requestedScopes)) {
                    const sessionRequest = existingRequestsForProvider[requestedScopes];
                    sessionRequest?.disposables.forEach(item => item.dispose());
                    delete existingRequestsForProvider[requestedScopes];
                    if (Object.keys(existingRequestsForProvider).length === 0) {
                        this._signInRequestItems.delete(provider.id);
                    }
                    else {
                        this._signInRequestItems.set(provider.id, existingRequestsForProvider);
                    }
                }
            });
        }
        async updateAccessRequests(providerId, removedSessions) {
            const providerRequests = this._sessionAccessRequestItems.get(providerId);
            if (providerRequests) {
                Object.keys(providerRequests).forEach(extensionId => {
                    removedSessions.forEach(removed => {
                        const indexOfSession = providerRequests[extensionId].possibleSessions.findIndex(session => session.id === removed.id);
                        if (indexOfSession) {
                            providerRequests[extensionId].possibleSessions.splice(indexOfSession, 1);
                        }
                    });
                    if (!providerRequests[extensionId].possibleSessions.length) {
                        this.removeAccessRequest(providerId, extensionId);
                    }
                });
            }
        }
        updateBadgeCount() {
            this._accountBadgeDisposable.clear();
            let numberOfRequests = 0;
            this._signInRequestItems.forEach(providerRequests => {
                Object.keys(providerRequests).forEach(request => {
                    numberOfRequests += providerRequests[request].requestingExtensionIds.length;
                });
            });
            this._sessionAccessRequestItems.forEach(accessRequest => {
                numberOfRequests += Object.keys(accessRequest).length;
            });
            if (numberOfRequests > 0) {
                const badge = new activity_1.NumberBadge(numberOfRequests, () => nls.localize('sign in', "Sign in requested"));
                this._accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge });
            }
        }
        removeAccessRequest(providerId, extensionId) {
            const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
            if (providerRequests[extensionId]) {
                (0, lifecycle_1.dispose)(providerRequests[extensionId].disposables);
                delete providerRequests[extensionId];
                this.updateBadgeCount();
            }
        }
        /**
         * Check extension access to an account
         * @param providerId The id of the authentication provider
         * @param accountName The account name that access is checked for
         * @param extensionId The id of the extension requesting access
         * @returns Returns true or false if the user has opted to permanently grant or disallow access, and undefined
         * if they haven't made a choice yet
         */
        isAccessAllowed(providerId, accountName, extensionId) {
            const allowList = readAllowedExtensions(this.storageService, providerId, accountName);
            const extensionData = allowList.find(extension => extension.id === extensionId);
            if (extensionData) {
                // This property didn't exist on this data previously, inclusion in the list at all indicates allowance
                return extensionData.allowed !== undefined
                    ? extensionData.allowed
                    : true;
            }
            if (this.productService.trustedExtensionAuthAccess?.includes(extensionId)) {
                return true;
            }
            return undefined;
        }
        updateAllowedExtension(providerId, accountName, extensionId, extensionName, isAllowed) {
            const allowList = readAllowedExtensions(this.storageService, providerId, accountName);
            const index = allowList.findIndex(extension => extension.id === extensionId);
            if (index === -1) {
                allowList.push({ id: extensionId, name: extensionName, allowed: isAllowed });
            }
            else {
                allowList[index].allowed = isAllowed;
            }
            this.storageService.store(`${providerId}-${accountName}`, JSON.stringify(allowList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
        //#region Session Preference
        updateSessionPreference(providerId, extensionId, session) {
            // The 3 parts of this key are important:
            // * Extension id: The extension that has a preference
            // * Provider id: The provider that the preference is for
            // * The scopes: The subset of sessions that the preference applies to
            const key = `${extensionId}-${providerId}-${session.scopes.join(' ')}`;
            // Store the preference in the workspace and application storage. This allows new workspaces to
            // have a preference set already to limit the number of prompts that are shown... but also allows
            // a specific workspace to override the global preference.
            this.storageService.store(key, session.id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.storageService.store(key, session.id, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        getSessionPreference(providerId, extensionId, scopes) {
            // The 3 parts of this key are important:
            // * Extension id: The extension that has a preference
            // * Provider id: The provider that the preference is for
            // * The scopes: The subset of sessions that the preference applies to
            const key = `${extensionId}-${providerId}-${scopes.join(' ')}`;
            // If a preference is set in the workspace, use that. Otherwise, use the global preference.
            return this.storageService.get(key, 1 /* StorageScope.WORKSPACE */) ?? this.storageService.get(key, -1 /* StorageScope.APPLICATION */);
        }
        removeSessionPreference(providerId, extensionId, scopes) {
            // The 3 parts of this key are important:
            // * Extension id: The extension that has a preference
            // * Provider id: The provider that the preference is for
            // * The scopes: The subset of sessions that the preference applies to
            const key = `${extensionId}-${providerId}-${scopes.join(' ')}`;
            // This won't affect any other workspaces that have a preference set, but it will remove the preference
            // for this workspace and the global preference. This is only paired with a call to updateSessionPreference...
            // so we really don't _need_ to remove them as they are about to be overridden anyway... but it's more correct
            // to remove them first... and in case this gets called from somewhere else in the future.
            this.storageService.remove(key, 1 /* StorageScope.WORKSPACE */);
            this.storageService.remove(key, -1 /* StorageScope.APPLICATION */);
        }
        //#endregion
        async showGetSessionPrompt(providerId, accountName, extensionId, extensionName) {
            const providerName = this.getLabel(providerId);
            let SessionPromptChoice;
            (function (SessionPromptChoice) {
                SessionPromptChoice[SessionPromptChoice["Allow"] = 0] = "Allow";
                SessionPromptChoice[SessionPromptChoice["Deny"] = 1] = "Deny";
                SessionPromptChoice[SessionPromptChoice["Cancel"] = 2] = "Cancel";
            })(SessionPromptChoice || (SessionPromptChoice = {}));
            const { result } = await this.dialogService.prompt({
                type: notification_1.Severity.Info,
                message: nls.localize('confirmAuthenticationAccess', "The extension '{0}' wants to access the {1} account '{2}'.", extensionName, providerName, accountName),
                buttons: [
                    {
                        label: nls.localize({ key: 'allow', comment: ['&& denotes a mnemonic'] }, "&&Allow"),
                        run: () => SessionPromptChoice.Allow
                    },
                    {
                        label: nls.localize({ key: 'deny', comment: ['&& denotes a mnemonic'] }, "&&Deny"),
                        run: () => SessionPromptChoice.Deny
                    }
                ],
                cancelButton: {
                    run: () => SessionPromptChoice.Cancel
                }
            });
            if (result !== SessionPromptChoice.Cancel) {
                this.updateAllowedExtension(providerId, accountName, extensionId, extensionName, result === SessionPromptChoice.Allow);
                this.removeAccessRequest(providerId, extensionId);
            }
            return result === SessionPromptChoice.Allow;
        }
        async selectSession(providerId, extensionId, extensionName, scopes, availableSessions) {
            return new Promise((resolve, reject) => {
                // This function should be used only when there are sessions to disambiguate.
                if (!availableSessions.length) {
                    reject('No available sessions');
                }
                const quickPick = this.quickInputService.createQuickPick();
                quickPick.ignoreFocusOut = true;
                const items = availableSessions.map(session => {
                    return {
                        label: session.account.label,
                        session: session
                    };
                });
                items.push({
                    label: nls.localize('useOtherAccount', "Sign in to another account")
                });
                const providerName = this.getLabel(providerId);
                quickPick.items = items;
                quickPick.title = nls.localize({
                    key: 'selectAccount',
                    comment: ['The placeholder {0} is the name of an extension. {1} is the name of the type of account, such as Microsoft or GitHub.']
                }, "The extension '{0}' wants to access a {1} account", extensionName, providerName);
                quickPick.placeholder = nls.localize('getSessionPlateholder', "Select an account for '{0}' to use or Esc to cancel", extensionName);
                quickPick.onDidAccept(async (_) => {
                    const session = quickPick.selectedItems[0].session ?? await this.createSession(providerId, scopes);
                    const accountName = session.account.label;
                    this.updateAllowedExtension(providerId, accountName, extensionId, extensionName, true);
                    this.updateSessionPreference(providerId, extensionId, session);
                    this.removeAccessRequest(providerId, extensionId);
                    quickPick.dispose();
                    resolve(session);
                });
                quickPick.onDidHide(_ => {
                    if (!quickPick.selectedItems[0]) {
                        reject('User did not consent to account access');
                    }
                    quickPick.dispose();
                });
                quickPick.show();
            });
        }
        async completeSessionAccessRequest(providerId, extensionId, extensionName, scopes) {
            const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
            const existingRequest = providerRequests[extensionId];
            if (!existingRequest) {
                return;
            }
            const possibleSessions = existingRequest.possibleSessions;
            const supportsMultipleAccounts = this.supportsMultipleAccounts(providerId);
            let session;
            if (supportsMultipleAccounts) {
                try {
                    session = await this.selectSession(providerId, extensionId, extensionName, scopes, possibleSessions);
                }
                catch (_) {
                    // ignore cancel
                }
            }
            else {
                const approved = await this.showGetSessionPrompt(providerId, possibleSessions[0].account.label, extensionId, extensionName);
                if (approved) {
                    session = possibleSessions[0];
                }
            }
            if (session) {
                addAccountUsage(this.storageService, providerId, session.account.label, extensionId, extensionName);
                const providerName = this.getLabel(providerId);
                this._onDidChangeSessions.fire({ providerId, label: providerName, event: { added: [], removed: [], changed: [session] } });
            }
        }
        requestSessionAccess(providerId, extensionId, extensionName, scopes, possibleSessions) {
            const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
            const hasExistingRequest = providerRequests[extensionId];
            if (hasExistingRequest) {
                return;
            }
            const menuItem = actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.AccountsContext, {
                group: '3_accessRequests',
                command: {
                    id: `${providerId}${extensionId}Access`,
                    title: nls.localize({
                        key: 'accessRequest',
                        comment: [`The placeholder {0} will be replaced with an authentication provider''s label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count`]
                    }, "Grant access to {0} for {1}... (1)", this.getLabel(providerId), extensionName)
                }
            });
            const accessCommand = commands_1.CommandsRegistry.registerCommand({
                id: `${providerId}${extensionId}Access`,
                handler: async (accessor) => {
                    const authenticationService = accessor.get(authentication_1.IAuthenticationService);
                    authenticationService.completeSessionAccessRequest(providerId, extensionId, extensionName, scopes);
                }
            });
            providerRequests[extensionId] = { possibleSessions, disposables: [menuItem, accessCommand] };
            this._sessionAccessRequestItems.set(providerId, providerRequests);
            this.updateBadgeCount();
        }
        async requestNewSession(providerId, scopes, extensionId, extensionName) {
            let provider = this._authenticationProviders.get(providerId);
            if (!provider) {
                // Activate has already been called for the authentication provider, but it cannot block on registering itself
                // since this is sync and returns a disposable. So, wait for registration event to fire that indicates the
                // provider is now in the map.
                await new Promise((resolve, _) => {
                    const dispose = this.onDidRegisterAuthenticationProvider(e => {
                        if (e.id === providerId) {
                            provider = this._authenticationProviders.get(providerId);
                            dispose.dispose();
                            resolve();
                        }
                    });
                });
            }
            if (!provider) {
                return;
            }
            const providerRequests = this._signInRequestItems.get(providerId);
            const scopesList = scopes.join(SCOPESLIST_SEPARATOR);
            const extensionHasExistingRequest = providerRequests
                && providerRequests[scopesList]
                && providerRequests[scopesList].requestingExtensionIds.includes(extensionId);
            if (extensionHasExistingRequest) {
                return;
            }
            // Construct a commandId that won't clash with others generated here, nor likely with an extension's command
            const commandId = `${providerId}:${extensionId}:signIn${Object.keys(providerRequests || []).length}`;
            const menuItem = actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.AccountsContext, {
                group: '2_signInRequests',
                command: {
                    id: commandId,
                    title: nls.localize({
                        key: 'signInRequest',
                        comment: [`The placeholder {0} will be replaced with an authentication provider's label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count.`]
                    }, "Sign in with {0} to use {1} (1)", provider.label, extensionName)
                }
            });
            const signInCommand = commands_1.CommandsRegistry.registerCommand({
                id: commandId,
                handler: async (accessor) => {
                    const authenticationService = accessor.get(authentication_1.IAuthenticationService);
                    const session = await authenticationService.createSession(providerId, scopes);
                    this.updateAllowedExtension(providerId, session.account.label, extensionId, extensionName, true);
                    this.updateSessionPreference(providerId, extensionId, session);
                }
            });
            if (providerRequests) {
                const existingRequest = providerRequests[scopesList] || { disposables: [], requestingExtensionIds: [] };
                providerRequests[scopesList] = {
                    disposables: [...existingRequest.disposables, menuItem, signInCommand],
                    requestingExtensionIds: [...existingRequest.requestingExtensionIds, extensionId]
                };
                this._signInRequestItems.set(providerId, providerRequests);
            }
            else {
                this._signInRequestItems.set(providerId, {
                    [scopesList]: {
                        disposables: [menuItem, signInCommand],
                        requestingExtensionIds: [extensionId]
                    }
                });
            }
            this.updateBadgeCount();
        }
        getLabel(id) {
            const authProvider = this._authenticationProviders.get(id);
            if (authProvider) {
                return authProvider.label;
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        supportsMultipleAccounts(id) {
            const authProvider = this._authenticationProviders.get(id);
            if (authProvider) {
                return authProvider.supportsMultipleAccounts;
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async tryActivateProvider(providerId, activateImmediate) {
            await this.extensionService.activateByEvent(getAuthenticationProviderActivationEvent(providerId), activateImmediate ? 1 /* ActivationKind.Immediate */ : 0 /* ActivationKind.Normal */);
            let provider = this._authenticationProviders.get(providerId);
            if (provider) {
                return provider;
            }
            // When activate has completed, the extension has made the call to `registerAuthenticationProvider`.
            // However, activate cannot block on this, so the renderer may not have gotten the event yet.
            const didRegister = new Promise((resolve, _) => {
                this.onDidRegisterAuthenticationProvider(e => {
                    if (e.id === providerId) {
                        provider = this._authenticationProviders.get(providerId);
                        if (provider) {
                            resolve(provider);
                        }
                        else {
                            throw new Error(`No authentication provider '${providerId}' is currently registered.`);
                        }
                    }
                });
            });
            const didTimeout = new Promise((_, reject) => {
                setTimeout(() => {
                    reject('Timed out waiting for authentication provider to register');
                }, 5000);
            });
            return Promise.race([didRegister, didTimeout]);
        }
        async getSessions(id, scopes, activateImmediate = false) {
            const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, activateImmediate);
            if (authProvider) {
                return await authProvider.getSessions(scopes);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async createSession(id, scopes, options) {
            const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, !!options?.activateImmediate);
            if (authProvider) {
                return await authProvider.createSession(scopes, {
                    sessionToRecreate: options?.sessionToRecreate
                });
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async removeSession(id, sessionId) {
            const authProvider = this._authenticationProviders.get(id);
            if (authProvider) {
                return authProvider.removeSession(sessionId);
            }
            else {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
        }
        async manageTrustedExtensionsForAccount(id, accountName) {
            const authProvider = this._authenticationProviders.get(id);
            if (!authProvider) {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
            const allowedExtensions = readAllowedExtensions(this.storageService, authProvider.id, accountName);
            if (!allowedExtensions.length) {
                this.dialogService.info(nls.localize('noTrustedExtensions', "This account has not been used by any extensions."));
                return;
            }
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.canSelectMany = true;
            quickPick.customButton = true;
            quickPick.customLabel = nls.localize('manageTrustedExtensions.cancel', 'Cancel');
            const usages = readAccountUsages(this.storageService, authProvider.id, accountName);
            const items = allowedExtensions.map(extension => {
                const usage = usages.find(usage => extension.id === usage.extensionId);
                return {
                    label: extension.name,
                    description: usage
                        ? nls.localize({ key: 'accountLastUsedDate', comment: ['The placeholder {0} is a string with time information, such as "3 days ago"'] }, "Last used this account {0}", (0, date_1.fromNow)(usage.lastUsed, true))
                        : nls.localize('notUsed', "Has not used this account"),
                    extension
                };
            });
            quickPick.items = items;
            quickPick.selectedItems = items.filter(item => item.extension.allowed === undefined || item.extension.allowed);
            quickPick.title = nls.localize('manageTrustedExtensions', "Manage Trusted Extensions");
            quickPick.placeholder = nls.localize('manageExtensions', "Choose which extensions can access this account");
            quickPick.onDidAccept(() => {
                const updatedAllowedList = quickPick.items.map(i => i.extension);
                this.storageService.store(`${authProvider.id}-${accountName}`, JSON.stringify(updatedAllowedList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                quickPick.dispose();
            });
            quickPick.onDidChangeSelection((changed) => {
                quickPick.items.forEach(item => {
                    if (item.extension) {
                        item.extension.allowed = false;
                    }
                });
                changed.forEach((item) => item.extension.allowed = true);
            });
            quickPick.onDidHide(() => {
                quickPick.dispose();
            });
            quickPick.onDidCustom(() => {
                quickPick.hide();
            });
            quickPick.show();
        }
        async removeAccountSessions(id, accountName, sessions) {
            const authProvider = this._authenticationProviders.get(id);
            if (!authProvider) {
                throw new Error(`No authentication provider '${id}' is currently registered.`);
            }
            const accountUsages = readAccountUsages(this.storageService, authProvider.id, accountName);
            const { confirmed } = await this.dialogService.confirm({
                type: notification_1.Severity.Info,
                message: accountUsages.length
                    ? nls.localize('signOutMessage', "The account '{0}' has been used by: \n\n{1}\n\n Sign out from these extensions?", accountName, accountUsages.map(usage => usage.extensionName).join('\n'))
                    : nls.localize('signOutMessageSimple', "Sign out of '{0}'?", accountName),
                primaryButton: nls.localize({ key: 'signOut', comment: ['&& denotes a mnemonic'] }, "&&Sign Out")
            });
            if (confirmed) {
                const removeSessionPromises = sessions.map(session => authProvider.removeSession(session.id));
                await Promise.all(removeSessionPromises);
                removeAccountUsage(this.storageService, authProvider.id, accountName);
                this.storageService.remove(`${authProvider.id}-${accountName}`, -1 /* StorageScope.APPLICATION */);
            }
        }
    };
    exports.AuthenticationService = AuthenticationService;
    exports.AuthenticationService = AuthenticationService = __decorate([
        __param(0, activity_1.IActivityService),
        __param(1, extensions_2.IExtensionService),
        __param(2, storage_1.IStorageService),
        __param(3, dialogs_1.IDialogService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, productService_1.IProductService),
        __param(6, environmentService_1.IBrowserWorkbenchEnvironmentService)
    ], AuthenticationService);
    (0, extensions_1.registerSingleton)(authentication_1.IAuthenticationService, AuthenticationService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRpb25TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvYXV0aGVudGljYXRpb24vYnJvd3Nlci9hdXRoZW50aWNhdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxTQUFnQix3Q0FBd0MsQ0FBQyxFQUFVLElBQVksT0FBTywyQkFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQXhILDRGQUF3SDtJQVF4SCxnREFBZ0Q7SUFFaEQsU0FBUyxpQkFBaUIsQ0FBQyxjQUErQixFQUFFLFVBQWtCLEVBQUUsV0FBbUI7UUFDbEcsTUFBTSxVQUFVLEdBQUcsR0FBRyxVQUFVLElBQUksV0FBVyxTQUFTLENBQUM7UUFDekQsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLG9DQUEyQixDQUFDO1FBQzlFLElBQUksTUFBTSxHQUFvQixFQUFFLENBQUM7UUFDakMsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUM7Z0JBQ0osTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ1osU0FBUztZQUNWLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxjQUErQixFQUFFLFVBQWtCLEVBQUUsV0FBbUI7UUFDbkcsTUFBTSxVQUFVLEdBQUcsR0FBRyxVQUFVLElBQUksV0FBVyxTQUFTLENBQUM7UUFDekQsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLG9DQUEyQixDQUFDO0lBQzdELENBQUM7SUFFRCxTQUFnQixlQUFlLENBQUMsY0FBK0Is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
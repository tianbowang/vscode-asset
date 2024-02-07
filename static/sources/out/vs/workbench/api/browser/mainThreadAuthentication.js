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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "../common/extHost.protocol", "vs/platform/dialogs/common/dialogs", "vs/platform/storage/common/storage", "vs/base/common/severity", "vs/platform/notification/common/notification", "vs/workbench/services/extensions/common/extensions", "vs/platform/telemetry/common/telemetry", "vs/base/common/event"], function (require, exports, lifecycle_1, nls, extHostCustomers_1, authenticationService_1, authentication_1, extHost_protocol_1, dialogs_1, storage_1, severity_1, notification_1, extensions_1, telemetry_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadAuthentication = exports.MainThreadAuthenticationProvider = void 0;
    class MainThreadAuthenticationProvider extends lifecycle_1.Disposable {
        constructor(_proxy, id, label, supportsMultipleAccounts, notificationService, onDidChangeSessionsEmitter) {
            super();
            this._proxy = _proxy;
            this.id = id;
            this.label = label;
            this.supportsMultipleAccounts = supportsMultipleAccounts;
            this.notificationService = notificationService;
            this.onDidChangeSessions = onDidChangeSessionsEmitter.event;
        }
        async getSessions(scopes) {
            return this._proxy.$getSessions(this.id, scopes);
        }
        createSession(scopes, options) {
            return this._proxy.$createSession(this.id, scopes, options);
        }
        async removeSession(sessionId) {
            await this._proxy.$removeSession(this.id, sessionId);
            this.notificationService.info(nls.localize('signedOut', "Successfully signed out."));
        }
    }
    exports.MainThreadAuthenticationProvider = MainThreadAuthenticationProvider;
    let MainThreadAuthentication = class MainThreadAuthentication extends lifecycle_1.Disposable {
        constructor(extHostContext, authenticationService, dialogService, storageService, notificationService, extensionService, telemetryService) {
            super();
            this.authenticationService = authenticationService;
            this.dialogService = dialogService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.extensionService = extensionService;
            this.telemetryService = telemetryService;
            this._registrations = this._register(new lifecycle_1.DisposableMap());
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostAuthentication);
            this._register(this.authenticationService.onDidChangeSessions(e => {
                this._proxy.$onDidChangeAuthenticationSessions(e.providerId, e.label);
            }));
        }
        async $registerAuthenticationProvider(id, label, supportsMultipleAccounts) {
            const emitter = new event_1.Emitter();
            this._registrations.set(id, emitter);
            const provider = new MainThreadAuthenticationProvider(this._proxy, id, label, supportsMultipleAccounts, this.notificationService, emitter);
            this.authenticationService.registerAuthenticationProvider(id, provider);
        }
        $unregisterAuthenticationProvider(id) {
            this._registrations.deleteAndDispose(id);
            this.authenticationService.unregisterAuthenticationProvider(id);
        }
        async $ensureProvider(id) {
            if (!this.authenticationService.isAuthenticationProviderRegistered(id)) {
                return await this.extensionService.activateByEvent((0, authenticationService_1.getAuthenticationProviderActivationEvent)(id), 1 /* ActivationKind.Immediate */);
            }
        }
        $sendDidChangeSessions(providerId, event) {
            const obj = this._registrations.get(providerId);
            if (obj instanceof event_1.Emitter) {
                obj.fire(event);
            }
        }
        $removeSession(providerId, sessionId) {
            return this.authenticationService.removeSession(providerId, sessionId);
        }
        async loginPrompt(providerName, extensionName, recreatingSession, detail) {
            const message = recreatingSession
                ? nls.localize('confirmRelogin', "The extension '{0}' wants you to sign in again using {1}.", extensionName, providerName)
                : nls.localize('confirmLogin', "The extension '{0}' wants to sign in using {1}.", extensionName, providerName);
            const { confirmed } = await this.dialogService.confirm({
                type: severity_1.default.Info,
                message,
                detail,
                primaryButton: nls.localize({ key: 'allow', comment: ['&& denotes a mnemonic'] }, "&&Allow")
            });
            return confirmed;
        }
        async doGetSession(providerId, scopes, extensionId, extensionName, options) {
            const sessions = await this.authenticationService.getSessions(providerId, scopes, true);
            const supportsMultipleAccounts = this.authenticationService.supportsMultipleAccounts(providerId);
            // Error cases
            if (options.forceNewSession && options.createIfNone) {
                throw new Error('Invalid combination of options. Please remove one of the following: forceNewSession, createIfNone');
            }
            if (options.forceNewSession && options.silent) {
                throw new Error('Invalid combination of options. Please remove one of the following: forceNewSession, silent');
            }
            if (options.createIfNone && options.silent) {
                throw new Error('Invalid combination of options. Please remove one of the following: createIfNone, silent');
            }
            // Check if the sessions we have are valid
            if (!options.forceNewSession && sessions.length) {
                if (supportsMultipleAccounts) {
                    if (options.clearSessionPreference) {
                        // Clearing the session preference is usually paired with createIfNone, so just remove the preference and
                        // defer to the rest of the logic in this function to choose the session.
                        this.authenticationService.removeSessionPreference(providerId, extensionId, scopes);
                    }
                    else {
                        // If we have an existing session preference, use that. If not, we'll return any valid session at the end of this function.
                        const existingSessionPreference = this.authenticationService.getSessionPreference(providerId, extensionId, scopes);
                        if (existingSessionPreference) {
                            const matchingSession = sessions.find(session => session.id === existingSessionPreference);
                            if (matchingSession && this.authenticationService.isAccessAllowed(providerId, matchingSession.account.label, extensionId)) {
                                return matchingSession;
                            }
                        }
                    }
                }
                else if (this.authenticationService.isAccessAllowed(providerId, sessions[0].account.label, extensionId)) {
                    return sessions[0];
                }
            }
            // We may need to prompt because we don't have a valid session
            // modal flows
            if (options.createIfNone || options.forceNewSession) {
                const providerName = this.authenticationService.getLabel(providerId);
                const detail = (typeof options.forceNewSession === 'object') ? options.forceNewSession.detail : undefined;
                // We only want to show the "recreating session" prompt if we are using forceNewSession & there are sessions
                // that we will be "forcing through".
                const recreatingSession = !!(options.forceNewSession && sessions.length);
                const isAllowed = await this.loginPrompt(providerName, extensionName, recreatingSession, detail);
                if (!isAllowed) {
                    throw new Error('User did not consent to login.');
                }
                let session;
                if (sessions?.length && !options.forceNewSession) {
                    session = supportsMultipleAccounts
                        ? await this.authenticationService.selectSession(providerId, extensionId, extensionName, scopes, sessions)
                        : sessions[0];
                }
                else {
                    let sessionToRecreate;
                    if (typeof options.forceNewSession === 'object' && options.forceNewSession.sessionToRecreate) {
                        sessionToRecreate = options.forceNewSession.sessionToRecreate;
                    }
                    else {
                        const sessionIdToRecreate = this.authenticationService.getSessionPreference(providerId, extensionId, scopes);
                        sessionToRecreate = sessionIdToRecreate ? sessions.find(session => session.id === sessionIdToRecreate) : undefined;
                    }
                    session = await this.authenticationService.createSession(providerId, scopes, { activateImmediate: true, sessionToRecreate });
                }
                this.authenticationService.updateAllowedExtension(providerId, session.account.label, extensionId, extensionName, true);
                this.authenticationService.updateSessionPreference(providerId, extensionId, session);
                return session;
            }
            // For the silent flows, if we have a session, even though it may not be the user's preference, we'll return it anyway because it might be for a specific
            // set of scopes.
            const validSession = sessions.find(session => this.authenticationService.isAccessAllowed(providerId, session.account.label, extensionId));
            if (validSession) {
                // Migration. If we have a valid session, but no preference, we'll set the preference to the valid session.
                // TODO: Remove this after in a few releases.
                if (!this.authenticationService.getSessionPreference(providerId, extensionId, scopes)) {
                    if (this.storageService.get(`${extensionName}-${providerId}`, -1 /* StorageScope.APPLICATION */)) {
                        this.storageService.remove(`${extensionName}-${providerId}`, -1 /* StorageScope.APPLICATION */);
                    }
                    this.authenticationService.updateAllowedExtension(providerId, validSession.account.label, extensionId, extensionName, true);
                    this.authenticationService.updateSessionPreference(providerId, extensionId, validSession);
                }
                return validSession;
            }
            // passive flows (silent or default)
            if (!options.silent) {
                // If there is a potential session, but the extension doesn't have access to it, use the "grant access" flow,
                // otherwise request a new one.
                sessions.length
                    ? this.authenticationService.requestSessionAccess(providerId, extensionId, extensionName, scopes, sessions)
                    : await this.authenticationService.requestNewSession(providerId, scopes, extensionId, extensionName);
            }
            return undefined;
        }
        async $getSession(providerId, scopes, extensionId, extensionName, options) {
            const session = await this.doGetSession(providerId, scopes, extensionId, extensionName, options);
            if (session) {
                this.sendProviderUsageTelemetry(extensionId, providerId);
                (0, authenticationService_1.addAccountUsage)(this.storageService, providerId, session.account.label, extensionId, extensionName);
            }
            return session;
        }
        async $getSessions(providerId, scopes, extensionId, extensionName) {
            const sessions = await this.authenticationService.getSessions(providerId, [...scopes], true);
            const accessibleSessions = sessions.filter(s => this.authenticationService.isAccessAllowed(providerId, s.account.label, extensionId));
            if (accessibleSessions.length) {
                this.sendProviderUsageTelemetry(extensionId, providerId);
                for (const session of accessibleSessions) {
                    (0, authenticationService_1.addAccountUsage)(this.storageService, providerId, session.account.label, extensionId, extensionName);
                }
            }
            return accessibleSessions;
        }
        sendProviderUsageTelemetry(extensionId, providerId) {
            this.telemetryService.publicLog2('authentication.providerUsage', { providerId, extensionId });
        }
    };
    exports.MainThreadAuthentication = MainThreadAuthentication;
    exports.MainThreadAuthentication = MainThreadAuthentication = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadAuthentication),
        __param(1, authentication_1.IAuthenticationService),
        __param(2, dialogs_1.IDialogService),
        __param(3, storage_1.IStorageService),
        __param(4, notification_1.INotificationService),
        __param(5, extensions_1.IExtensionService),
        __param(6, telemetry_1.ITelemetryService)
    ], MainThreadAuthentication);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEF1dGhlbnRpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZEF1dGhlbnRpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCaEcsTUFBYSxnQ0FBaUMsU0FBUSxzQkFBVTtRQUkvRCxZQUNrQixNQUFrQyxFQUNuQyxFQUFVLEVBQ1YsS0FBYSxFQUNiLHdCQUFpQyxFQUNoQyxtQkFBeUMsRUFDMUQsMEJBQXNFO1lBRXRFLEtBQUssRUFBRSxDQUFDO1lBUFMsV0FBTSxHQUFOLE1BQU0sQ0FBNEI7WUFDbkMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUNWLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDYiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQVM7WUFDaEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUkxRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsMEJBQTBCLENBQUMsS0FBSyxDQUFDO1FBQzdELENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQWlCO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsYUFBYSxDQUFDLE1BQWdCLEVBQUUsT0FBNEM7WUFDM0UsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFpQjtZQUNwQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFD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
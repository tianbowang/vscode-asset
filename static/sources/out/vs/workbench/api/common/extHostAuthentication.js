/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/platform/extensions/common/extensions"], function (require, exports, event_1, extHost_protocol_1, extHostTypes_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostAuthentication = void 0;
    class ExtHostAuthentication {
        constructor(mainContext) {
            this._authenticationProviders = new Map();
            this._onDidChangeSessions = new event_1.Emitter();
            this.onDidChangeSessions = this._onDidChangeSessions.event;
            this._getSessionTaskSingler = new TaskSingler();
            this._getSessionsTaskSingler = new TaskSingler();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadAuthentication);
        }
        async getSession(requestingExtension, providerId, scopes, options = {}) {
            const extensionId = extensions_1.ExtensionIdentifier.toKey(requestingExtension.identifier);
            const sortedScopes = [...scopes].sort().join(' ');
            return await this._getSessionTaskSingler.getOrCreate(`${extensionId} ${providerId} ${sortedScopes}`, async () => {
                await this._proxy.$ensureProvider(providerId);
                const extensionName = requestingExtension.displayName || requestingExtension.name;
                return this._proxy.$getSession(providerId, scopes, extensionId, extensionName, options);
            });
        }
        async getSessions(requestingExtension, providerId, scopes) {
            const extensionId = extensions_1.ExtensionIdentifier.toKey(requestingExtension.identifier);
            const sortedScopes = [...scopes].sort().join(' ');
            return await this._getSessionsTaskSingler.getOrCreate(`${extensionId} ${sortedScopes}`, async () => {
                await this._proxy.$ensureProvider(providerId);
                const extensionName = requestingExtension.displayName || requestingExtension.name;
                return this._proxy.$getSessions(providerId, scopes, extensionId, extensionName);
            });
        }
        async removeSession(providerId, sessionId) {
            const providerData = this._authenticationProviders.get(providerId);
            if (!providerData) {
                return this._proxy.$removeSession(providerId, sessionId);
            }
            return providerData.provider.removeSession(sessionId);
        }
        registerAuthenticationProvider(id, label, provider, options) {
            if (this._authenticationProviders.get(id)) {
                throw new Error(`An authentication provider with id '${id}' is already registered.`);
            }
            this._authenticationProviders.set(id, { label, provider, options: options ?? { supportsMultipleAccounts: false } });
            const listener = provider.onDidChangeSessions(e => this._proxy.$sendDidChangeSessions(id, e));
            this._proxy.$registerAuthenticationProvider(id, label, options?.supportsMultipleAccounts ?? false);
            return new extHostTypes_1.Disposable(() => {
                listener.dispose();
                this._authenticationProviders.delete(id);
                this._proxy.$unregisterAuthenticationProvider(id);
            });
        }
        $createSession(providerId, scopes, options) {
            const providerData = this._authenticationProviders.get(providerId);
            if (providerData) {
                return Promise.resolve(providerData.provider.createSession(scopes, options));
            }
            throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
        }
        $removeSession(providerId, sessionId) {
            const providerData = this._authenticationProviders.get(providerId);
            if (providerData) {
                return Promise.resolve(providerData.provider.removeSession(sessionId));
            }
            throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
        }
        $getSessions(providerId, scopes) {
            const providerData = this._authenticationProviders.get(providerId);
            if (providerData) {
                return Promise.resolve(providerData.provider.getSessions(scopes));
            }
            throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
        }
        $onDidChangeAuthenticationSessions(id, label) {
            this._onDidChangeSessions.fire({ provider: { id, label } });
            return Promise.resolve();
        }
    }
    exports.ExtHostAuthentication = ExtHostAuthentication;
    class TaskSingler {
        constructor() {
            this._inFlightPromises = new Map();
        }
        getOrCreate(key, promiseFactory) {
            const inFlight = this._inFlightPromises.get(key);
            if (inFlight) {
                return inFlight;
            }
            const promise = promiseFactory().finally(() => this._inFlightPromises.delete(key));
            this._inFlightPromises.set(key, promise);
            return promise;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEF1dGhlbnRpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0QXV0aGVudGljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQWEscUJBQXFCO1FBVWpDLFlBQVksV0FBeUI7WUFSN0IsNkJBQXdCLEdBQXNDLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBRXRHLHlCQUFvQixHQUFHLElBQUksZUFBTyxFQUE0QyxDQUFDO1lBQzlFLHdCQUFtQixHQUFvRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBRXhHLDJCQUFzQixHQUFHLElBQUksV0FBVyxFQUE0QyxDQUFDO1lBQ3JGLDRCQUF1QixHQUFHLElBQUksV0FBVyxFQUErQyxDQUFDO1lBR2hHLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDMUUsQ0FBQztRQU1ELEtBQUssQ0FBQyxVQUFVLENBQUMsbUJBQTBDLEVBQUUsVUFBa0IsRUFBRSxNQUF5QixFQUFFLFVBQWtELEVBQUU7WUFDL0osTUFBTSxXQUFXLEdBQUcsZ0NBQW1CLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEQsT0FBTyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLElBQUksVUFBVSxJQUFJLFlBQVksRUFBRSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUMvRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZUFB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
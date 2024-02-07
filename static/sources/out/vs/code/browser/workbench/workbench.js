/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/window", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/product/common/product", "vs/platform/window/common/window", "vs/workbench/workbench.web.main"], function (require, exports, browser_1, window_1, buffer_1, event_1, lifecycle_1, marshalling_1, network_1, path_1, resources_1, strings_1, uri_1, product_1, window_2, workbench_web_main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalStorageSecretStorageProvider = void 0;
    class TransparentCrypto {
        async seal(data) {
            return data;
        }
        async unseal(data) {
            return data;
        }
    }
    var AESConstants;
    (function (AESConstants) {
        AESConstants["ALGORITHM"] = "AES-GCM";
        AESConstants[AESConstants["KEY_LENGTH"] = 256] = "KEY_LENGTH";
        AESConstants[AESConstants["IV_LENGTH"] = 12] = "IV_LENGTH";
    })(AESConstants || (AESConstants = {}));
    class ServerKeyedAESCrypto {
        /** Gets whether the algorithm is supported; requires a secure context */
        static supported() {
            return !!crypto.subtle;
        }
        constructor(authEndpoint) {
            this.authEndpoint = authEndpoint;
        }
        async seal(data) {
            // Get a new key and IV on every change, to avoid the risk of reusing the same key and IV pair with AES-GCM
            // (see also: https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams#properties)
            const iv = window_1.mainWindow.crypto.getRandomValues(new Uint8Array(12 /* AESConstants.IV_LENGTH */));
            // crypto.getRandomValues isn't a good-enough PRNG to generate crypto keys, so we need to use crypto.subtle.generateKey and export the key instead
            const clientKeyObj = await window_1.mainWindow.crypto.subtle.generateKey({ name: "AES-GCM" /* AESConstants.ALGORITHM */, length: 256 /* AESConstants.KEY_LENGTH */ }, true, ['encrypt', 'decrypt']);
            const clientKey = new Uint8Array(await window_1.mainWindow.crypto.subtle.exportKey('raw', clientKeyObj));
            const key = await this.getKey(clientKey);
            const dataUint8Array = new TextEncoder().encode(data);
            const cipherText = await window_1.mainWindow.crypto.subtle.encrypt({ name: "AES-GCM" /* AESConstants.ALGORITHM */, iv }, key, dataUint8Array);
            // Base64 encode the result and store the ciphertext, the key, and the IV in localStorage
            // Note that the clientKey and IV don't need to be secret
            const result = new Uint8Array([...clientKey, ...iv, ...new Uint8Array(cipherText)]);
            return (0, buffer_1.encodeBase64)(buffer_1.VSBuffer.wrap(result));
        }
        async unseal(data) {
            // encrypted should contain, in order: the key (32-byte), the IV for AES-GCM (12-byte) and the ciphertext (which has the GCM auth tag at the end)
            // Minimum length must be 44 (key+IV length) + 16 bytes (1 block encrypted with AES - regardless of key size)
            const dataUint8Array = (0, buffer_1.decodeBase64)(data);
            if (dataUint8Array.byteLength < 60) {
                throw Error('Invalid length for the value for credentials.crypto');
            }
            const keyLength = 256 /* AESConstants.KEY_LENGTH */ / 8;
            const clientKey = dataUint8Array.slice(0, keyLength);
            const iv = dataUint8Array.slice(keyLength, keyLength + 12 /* AESConstants.IV_LENGTH */);
            const cipherText = dataUint8Array.slice(keyLength + 12 /* AESConstants.IV_LENGTH */);
            // Do the decryption and parse the result as JSON
            const key = await this.getKey(clientKey.buffer);
            const decrypted = await window_1.mainWindow.crypto.subtle.decrypt({ name: "AES-GCM" /* AESConstants.ALGORITHM */, iv: iv.buffer }, key, cipherText.buffer);
            return new TextDecoder().decode(new Uint8Array(decrypted));
        }
        /**
         * Given a clientKey, returns the CryptoKey object that is used to encrypt/decrypt the data.
         * The actual key is (clientKey XOR serverKey)
         */
        async getKey(clientKey) {
            if (!clientKey || clientKey.byteLength !== 256 /* AESConstants.KEY_LENGTH */ / 8) {
                throw Error('Invalid length for clientKey');
            }
            const serverKey = await this.getServerKeyPart();
            const keyData = new Uint8Array(256 /* AESConstants.KEY_LENGTH */ / 8);
            for (let i = 0; i < keyData.byteLength; i++) {
                keyData[i] = clientKey[i] ^ serverKey[i];
            }
            return window_1.mainWindow.crypto.subtle.importKey('raw', keyData, {
                name: "AES-GCM" /* AESConstants.ALGORITHM */,
                length: 256 /* AESConstants.KEY_LENGTH */,
            }, true, ['encrypt', 'decrypt']);
        }
        async getServerKeyPart() {
            if (this._serverKey) {
                return this._serverKey;
            }
            let attempt = 0;
            let lastError;
            while (attempt <= 3) {
                try {
                    const res = await fetch(this.authEndpoint, { credentials: 'include', method: 'POST' });
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    }
                    const serverKey = new Uint8Array(await await res.arrayBuffer());
                    if (serverKey.byteLength !== 256 /* AESConstants.KEY_LENGTH */ / 8) {
                        throw Error(`The key retrieved by the server is not ${256 /* AESConstants.KEY_LENGTH */} bit long.`);
                    }
                    this._serverKey = serverKey;
                    return this._serverKey;
                }
                catch (e) {
                    lastError = e;
                    attempt++;
                    // exponential backoff
                    await new Promise(resolve => setTimeout(resolve, attempt * attempt * 100));
                }
            }
            throw lastError;
        }
    }
    class LocalStorageSecretStorageProvider {
        constructor(crypto) {
            this.crypto = crypto;
            this._storageKey = 'secrets.provider';
            this._secretsPromise = this.load();
            this.type = 'persisted';
        }
        async load() {
            const record = this.loadAuthSessionFromElement();
            // Get the secrets from localStorage
            const encrypted = localStorage.getItem(this._storageKey);
            if (encrypted) {
                try {
                    const decrypted = JSON.parse(await this.crypto.unseal(encrypted));
                    return { ...record, ...decrypted };
                }
                catch (err) {
                    // TODO: send telemetry
                    console.error('Failed to decrypt secrets from localStorage', err);
                    localStorage.removeItem(this._storageKey);
                }
            }
            return record;
        }
        loadAuthSessionFromElement() {
            let authSessionInfo;
            const authSessionElement = window_1.mainWindow.document.getElementById('vscode-workbench-auth-session');
            const authSessionElementAttribute = authSessionElement ? authSessionElement.getAttribute('data-settings') : undefined;
            if (authSessionElementAttribute) {
                try {
                    authSessionInfo = JSON.parse(authSessionElementAttribute);
                }
                catch (error) { /* Invalid session is passed. Ignore. */ }
            }
            if (!authSessionInfo) {
                return {};
            }
            const record = {};
            // Settings Sync Entry
            record[`${product_1.default.urlProtocol}.loginAccount`] = JSON.stringify(authSessionInfo);
            // Auth extension Entry
            if (authSessionInfo.providerId !== 'github') {
                console.error(`Unexpected auth provider: ${authSessionInfo.providerId}. Expected 'github'.`);
                return record;
            }
            const authAccount = JSON.stringify({ extensionId: 'vscode.github-authentication', key: 'github.auth' });
            record[authAccount] = JSON.stringify(authSessionInfo.scopes.map(scopes => ({
                id: authSessionInfo.id,
                scopes,
                accessToken: authSessionInfo.accessToken
            })));
            return record;
        }
        async get(key) {
            const secrets = await this._secretsPromise;
            return secrets[key];
        }
        async set(key, value) {
            const secrets = await this._secretsPromise;
            secrets[key] = value;
            this._secretsPromise = Promise.resolve(secrets);
            this.save();
        }
        async delete(key) {
            const secrets = await this._secretsPromise;
            delete secrets[key];
            this._secretsPromise = Promise.resolve(secrets);
            this.save();
        }
        async save() {
            try {
                const encrypted = await this.crypto.seal(JSON.stringify(await this._secretsPromise));
                localStorage.setItem(this._storageKey, encrypted);
            }
            catch (err) {
                console.error(err);
            }
        }
    }
    exports.LocalStorageSecretStorageProvider = LocalStorageSecretStorageProvider;
    class LocalStorageURLCallbackProvider extends lifecycle_1.Disposable {
        static { this.REQUEST_ID = 0; }
        static { this.QUERY_KEYS = [
            'scheme',
            'authority',
            'path',
            'query',
            'fragment'
        ]; }
        constructor(_callbackRoute) {
            super();
            this._callbackRoute = _callbackRoute;
            this._onCallback = this._register(new event_1.Emitter());
            this.onCallback = this._onCallback.event;
            this.pendingCallbacks = new Set();
            this.lastTimeChecked = Date.now();
            this.checkCallbacksTimeout = undefined;
        }
        create(options = {}) {
            const id = ++LocalStorageURLCallbackProvider.REQUEST_ID;
            const queryParams = [`vscode-reqid=${id}`];
            for (const key of LocalStorageURLCallbackProvider.QUERY_KEYS) {
                const value = options[key];
                if (value) {
                    queryParams.push(`vscode-${key}=${encodeURIComponent(value)}`);
                }
            }
            // TODO@joao remove eventually
            // https://github.com/microsoft/vscode-dev/issues/62
            // https://github.com/microsoft/vscode/blob/159479eb5ae451a66b5dac3c12d564f32f454796/extensions/github-authentication/src/githubServer.ts#L50-L50
            if (!(options.authority === 'vscode.github-authentication' && options.path === '/dummy')) {
                const key = `vscode-web.url-callbacks[${id}]`;
                localStorage.removeItem(key);
                this.pendingCallbacks.add(id);
                this.startListening();
            }
            return uri_1.URI.parse(window_1.mainWindow.location.href).with({ path: this._callbackRoute, query: queryParams.join('&') });
        }
        startListening() {
            if (this.onDidChangeLocalStorageDisposable) {
                return;
            }
            const fn = () => this.onDidChangeLocalStorage();
            window_1.mainWindow.addEventListener('storage', fn);
            this.onDidChangeLocalStorageDisposable = { dispose: () => window_1.mainWindow.removeEventListener('storage', fn) };
        }
        stopListening() {
            this.onDidChangeLocalStorageDisposable?.dispose();
            this.onDidChangeLocalStorageDisposable = undefined;
        }
        // this fires every time local storage changes, but we
        // don't want to check more often than once a second
        async onDidChangeLocalStorage() {
            const ellapsed = Date.now() - this.lastTimeChecked;
            if (ellapsed > 1000) {
                this.checkCallbacks();
            }
            else if (this.checkCallbacksTimeout === undefined) {
                this.checkCallbacksTimeout = setTimeout(() => {
                    this.checkCallbacksTimeout = undefined;
                    this.checkCallbacks();
                }, 1000 - ellapsed);
            }
        }
        checkCallbacks() {
            let pendingCallbacks;
            for (const id of this.pendingCallbacks) {
                const key = `vscode-web.url-callbacks[${id}]`;
                const result = localStorage.getItem(key);
                if (result !== null) {
                    try {
                        this._onCallback.fire(uri_1.URI.revive(JSON.parse(result)));
                    }
                    catch (error) {
                        console.error(error);
                    }
                    pendingCallbacks = pendingCallbacks ?? new Set(this.pendingCallbacks);
                    pendingCallbacks.delete(id);
                    localStorage.removeItem(key);
                }
            }
            if (pendingCallbacks) {
                this.pendingCallbacks = pendingCallbacks;
                if (this.pendingCallbacks.size === 0) {
                    this.stopListening();
                }
            }
            this.lastTimeChecked = Date.now();
        }
    }
    class WorkspaceProvider {
        static { this.QUERY_PARAM_EMPTY_WINDOW = 'ew'; }
        static { this.QUERY_PARAM_FOLDER = 'folder'; }
        static { this.QUERY_PARAM_WORKSPACE = 'workspace'; }
        static { this.QUERY_PARAM_PAYLOAD = 'payload'; }
        static create(config) {
            let foundWorkspace = false;
            let workspace;
            let payload = Object.create(null);
            const query = new URL(document.location.href).searchParams;
            query.forEach((value, key) => {
                switch (key) {
                    // Folder
                    case WorkspaceProvider.QUERY_PARAM_FOLDER:
                        if (config.remoteAuthority && value.startsWith(path_1.posix.sep)) {
                            // when connected to a remote and having a value
                            // that is a path (begins with a `/`), assume this
                            // is a vscode-remote resource as simplified URL.
                            workspace = { folderUri: uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, path: value, authority: config.remoteAuthority }) };
                        }
                        else {
                            workspace = { folderUri: uri_1.URI.parse(value) };
                        }
                        foundWorkspace = true;
                        break;
                    // Workspace
                    case WorkspaceProvider.QUERY_PARAM_WORKSPACE:
                        if (config.remoteAuthority && value.startsWith(path_1.posix.sep)) {
                            // when connected to a remote and having a value
                            // that is a path (begins with a `/`), assume this
                            // is a vscode-remote resource as simplified URL.
                            workspace = { workspaceUri: uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, path: value, authority: config.remoteAuthority }) };
                        }
                        else {
                            workspace = { workspaceUri: uri_1.URI.parse(value) };
                        }
                        foundWorkspace = true;
                        break;
                    // Empty
                    case WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW:
                        workspace = undefined;
                        foundWorkspace = true;
                        break;
                    // Payload
                    case WorkspaceProvider.QUERY_PARAM_PAYLOAD:
                        try {
                            payload = (0, marshalling_1.parse)(value); // use marshalling#parse() to revive potential URIs
                        }
                        catch (error) {
                            console.error(error); // possible invalid JSON
                        }
                        break;
                }
            });
            // If no workspace is provided through the URL, check for config
            // attribute from server
            if (!foundWorkspace) {
                if (config.folderUri) {
                    workspace = { folderUri: uri_1.URI.revive(config.folderUri) };
                }
                else if (config.workspaceUri) {
                    workspace = { workspaceUri: uri_1.URI.revive(config.workspaceUri) };
                }
            }
            return new WorkspaceProvider(workspace, payload, config);
        }
        constructor(workspace, payload, config) {
            this.workspace = workspace;
            this.payload = payload;
            this.config = config;
            this.trusted = true;
        }
        async open(workspace, options) {
            if (options?.reuse && !options.payload && this.isSame(this.workspace, workspace)) {
                return true; // return early if workspace and environment is not changing and we are reusing window
            }
            const targetHref = this.createTargetUrl(workspace, options);
            if (targetHref) {
                if (options?.reuse) {
                    window_1.mainWindow.location.href = targetHref;
                    return true;
                }
                else {
                    let result;
                    if ((0, browser_1.isStandalone)()) {
                        result = window_1.mainWindow.open(targetHref, '_blank', 'toolbar=no'); // ensures to open another 'standalone' window!
                    }
                    else {
                        result = window_1.mainWindow.open(targetHref);
                    }
                    return !!result;
                }
            }
            return false;
        }
        createTargetUrl(workspace, options) {
            // Empty
            let targetHref = undefined;
            if (!workspace) {
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW}=true`;
            }
            // Folder
            else if ((0, window_2.isFolderToOpen)(workspace)) {
                const queryParamFolder = this.encodeWorkspacePath(workspace.folderUri);
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_FOLDER}=${queryParamFolder}`;
            }
            // Workspace
            else if ((0, window_2.isWorkspaceToOpen)(workspace)) {
                const queryParamWorkspace = this.encodeWorkspacePath(workspace.workspaceUri);
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_WORKSPACE}=${queryParamWorkspace}`;
            }
            // Append payload if any
            if (options?.payload) {
                targetHref += `&${WorkspaceProvider.QUERY_PARAM_PAYLOAD}=${encodeURIComponent(JSON.stringify(options.payload))}`;
            }
            return targetHref;
        }
        encodeWorkspacePath(uri) {
            if (this.config.remoteAuthority && uri.scheme === network_1.Schemas.vscodeRemote) {
                // when connected to a remote and having a folder
                // or workspace for that remote, only use the path
                // as query value to form shorter, nicer URLs.
                // however, we still need to `encodeURIComponent`
                // to ensure to preserve special characters, such
                // as `+` in the path.
                return encodeURIComponent(`${path_1.posix.sep}${(0, strings_1.ltrim)(uri.path, path_1.posix.sep)}`).replaceAll('%2F', '/');
            }
            return encodeURIComponent(uri.toString(true));
        }
        isSame(workspaceA, workspaceB) {
            if (!workspaceA || !workspaceB) {
                return workspaceA === workspaceB; // both empty
            }
            if ((0, window_2.isFolderToOpen)(workspaceA) && (0, window_2.isFolderToOpen)(workspaceB)) {
                return (0, resources_1.isEqual)(workspaceA.folderUri, workspaceB.folderUri); // same workspace
            }
            if ((0, window_2.isWorkspaceToOpen)(workspaceA) && (0, window_2.isWorkspaceToOpen)(workspaceB)) {
                return (0, resources_1.isEqual)(workspaceA.workspaceUri, workspaceB.workspaceUri); // same workspace
            }
            return false;
        }
        hasRemote() {
            if (this.workspace) {
                if ((0, window_2.isFolderToOpen)(this.workspace)) {
                    return this.workspace.folderUri.scheme === network_1.Schemas.vscodeRemote;
                }
                if ((0, window_2.isWorkspaceToOpen)(this.workspace)) {
                    return this.workspace.workspaceUri.scheme === network_1.Schemas.vscodeRemote;
                }
            }
            return true;
        }
    }
    function readCookie(name) {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1);
            }
        }
        return undefined;
    }
    (function () {
        // Find config by checking for DOM
        const configElement = window_1.mainWindow.document.getElementById('vscode-workbench-web-configuration');
        const configElementAttribute = configElement ? configElement.getAttribute('data-settings') : undefined;
        if (!configElement || !configElementAttribute) {
            throw new Error('Missing web configuration element');
        }
        const config = JSON.parse(configElementAttribute);
        const secretStorageKeyPath = readCookie('vscode-secret-key-path');
        const secretStorageCrypto = secretStorageKeyPath && ServerKeyedAESCrypto.supported()
            ? new ServerKeyedAESCrypto(secretStorageKeyPath) : new TransparentCrypto();
        // Create workbench
        (0, workbench_web_main_1.create)(window_1.mainWindow.document.body, {
            ...config,
            windowIndicator: config.windowIndicator ?? { label: '$(remote)', tooltip: `${product_1.default.nameShort} Web` },
            settingsSyncOptions: config.settingsSyncOptions ? { enabled: config.settingsSyncOptions.enabled, } : undefined,
            workspaceProvider: WorkspaceProvider.create(config),
            urlCallbackProvider: new LocalStorageURLCallbackProvider(config.callbackRoute),
            secretStorageProvider: config.remoteAuthority && !secretStorageKeyPath
                ? undefined /* with a remote without embedder-preferred storage, store on the remote */
                : new LocalStorageSecretStorageProvider(secretStorageCrypto),
        });
    })();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9jb2RlL2Jyb3dzZXIvd29ya2JlbmNoL3dvcmtiZW5jaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEwQmhHLE1BQU0saUJBQWlCO1FBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBWTtZQUN0QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQVk7WUFDeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO0tBQ0Q7SUFFRCxJQUFXLFlBSVY7SUFKRCxXQUFXLFlBQVk7UUFDdEIscUNBQXFCLENBQUE7UUFDckIsNkRBQWdCLENBQUE7UUFDaEIsMERBQWMsQ0FBQTtJQUNmLENBQUMsRUFKVSxZQUFZLEtBQVosWUFBWSxRQUl0QjtJQUVELE1BQU0sb0JBQW9CO1FBR3pCLHlFQUF5RTtRQUNsRSxNQUFNLENBQUMsU0FBUztZQUN0QixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxZQUE2QixZQUFvQjtZQUFwQixpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUFJLENBQUM7UUFFdEQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFZO1lBQ3RCLDJHQUEyRztZQUMzRyx1RkFBdUY7WUFDdkYsTUFBTSxFQUFFLEdBQUcsbUJBQVUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksVUFBVSxpQ0FBd0IsQ0FBQyxDQUFDO1lBQ3JGLGtKQUFrSjtZQUNsSixNQUFNLFlBQVksR0FBRyxNQUFNLG1CQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQzlELEVBQUUsSUFBSSxFQUFFLHNDQUErQixFQUFFLE1BQU0sRUFBRSxpQ0FBZ0MsRUFBRSxFQUNuRixJQUFJLEVBQ0osQ0FBQyxTQUFT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
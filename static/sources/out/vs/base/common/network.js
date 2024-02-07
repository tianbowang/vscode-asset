/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri"], function (require, exports, errors, platform, strings_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.COI = exports.FileAccess = exports.VSCODE_AUTHORITY = exports.nodeModulesAsarUnpackedPath = exports.nodeModulesAsarPath = exports.nodeModulesPath = exports.builtinExtensionsPath = exports.RemoteAuthorities = exports.connectionTokenQueryName = exports.connectionTokenCookieName = exports.matchesSomeScheme = exports.matchesScheme = exports.Schemas = void 0;
    var Schemas;
    (function (Schemas) {
        /**
         * A schema that is used for models that exist in memory
         * only and that have no correspondence on a server or such.
         */
        Schemas.inMemory = 'inmemory';
        /**
         * A schema that is used for setting files
         */
        Schemas.vscode = 'vscode';
        /**
         * A schema that is used for internal private files
         */
        Schemas.internal = 'private';
        /**
         * A walk-through document.
         */
        Schemas.walkThrough = 'walkThrough';
        /**
         * An embedded code snippet.
         */
        Schemas.walkThroughSnippet = 'walkThroughSnippet';
        Schemas.http = 'http';
        Schemas.https = 'https';
        Schemas.file = 'file';
        Schemas.mailto = 'mailto';
        Schemas.untitled = 'untitled';
        Schemas.data = 'data';
        Schemas.command = 'command';
        Schemas.vscodeRemote = 'vscode-remote';
        Schemas.vscodeRemoteResource = 'vscode-remote-resource';
        Schemas.vscodeManagedRemoteResource = 'vscode-managed-remote-resource';
        Schemas.vscodeUserData = 'vscode-userdata';
        Schemas.vscodeCustomEditor = 'vscode-custom-editor';
        Schemas.vscodeNotebookCell = 'vscode-notebook-cell';
        Schemas.vscodeNotebookCellMetadata = 'vscode-notebook-cell-metadata';
        Schemas.vscodeNotebookCellOutput = 'vscode-notebook-cell-output';
        Schemas.vscodeInteractiveInput = 'vscode-interactive-input';
        Schemas.vscodeSettings = 'vscode-settings';
        Schemas.vscodeWorkspaceTrust = 'vscode-workspace-trust';
        Schemas.vscodeTerminal = 'vscode-terminal';
        Schemas.vscodeChatSesssion = 'vscode-chat-editor';
        /**
         * Scheme used internally for webviews that aren't linked to a resource (i.e. not custom editors)
         */
        Schemas.webviewPanel = 'webview-panel';
        /**
         * Scheme used for loading the wrapper html and script in webviews.
         */
        Schemas.vscodeWebview = 'vscode-webview';
        /**
         * Scheme used for extension pages
         */
        Schemas.extension = 'extension';
        /**
         * Scheme used as a replacement of `file` scheme to load
         * files with our custom protocol handler (desktop only).
         */
        Schemas.vscodeFileResource = 'vscode-file';
        /**
         * Scheme used for temporary resources
         */
        Schemas.tmp = 'tmp';
        /**
         * Scheme used vs live share
         */
        Schemas.vsls = 'vsls';
        /**
         * Scheme used for the Source Control commit input's text document
         */
        Schemas.vscodeSourceControl = 'vscode-scm';
    })(Schemas || (exports.Schemas = Schemas = {}));
    function matchesScheme(target, scheme) {
        if (uri_1.URI.isUri(target)) {
            return (0, strings_1.equalsIgnoreCase)(target.scheme, scheme);
        }
        else {
            return (0, strings_1.startsWithIgnoreCase)(target, scheme + ':');
        }
    }
    exports.matchesScheme = matchesScheme;
    function matchesSomeScheme(target, ...schemes) {
        return schemes.some(scheme => matchesScheme(target, scheme));
    }
    exports.matchesSomeScheme = matchesSomeScheme;
    exports.connectionTokenCookieName = 'vscode-tkn';
    exports.connectionTokenQueryName = 'tkn';
    class RemoteAuthoritiesImpl {
        constructor() {
            this._hosts = Object.create(null);
            this._ports = Object.create(null);
            this._connectionTokens = Object.create(null);
            this._preferredWebSchema = 'http';
            this._delegate = null;
            this._remoteResourcesPath = `/${Schemas.vscodeRemoteResource}`;
        }
        setPreferredWebSchema(schema) {
            this._preferredWebSchema = schema;
        }
        setDelegate(delegate) {
            this._delegate = delegate;
        }
        setServerRootPath(serverRootPath) {
            this._remoteResourcesPath = `${serverRootPath}/${Schemas.vscodeRemoteResource}`;
        }
        set(authority, host, port) {
            this._hosts[authority] = host;
            this._ports[authority] = port;
        }
        setConnectionToken(authority, connectionToken) {
            this._connectionTokens[authority] = connectionToken;
        }
        getPreferredWebSchema() {
            return this._preferredWebSchema;
        }
        rewrite(uri) {
            if (this._delegate) {
                try {
                    return this._delegate(uri);
                }
                catch (err) {
                    errors.onUnexpectedError(err);
                    return uri;
                }
            }
            const authority = uri.authority;
            let host = this._hosts[authority];
            if (host && host.indexOf(':') !== -1 && host.indexOf('[') === -1) {
                host = `[${host}]`;
            }
            const port = this._ports[authority];
            const connectionToken = this._connectionTokens[authority];
            let query = `path=${encodeURIComponent(uri.path)}`;
            if (typeof connectionToken === 'string') {
                query += `&${exports.connectionTokenQueryName}=${encodeURIComponent(connectionToken)}`;
            }
            return uri_1.URI.from({
                scheme: platform.isWeb ? this._preferredWebSchema : Schemas.vscodeRemoteResource,
                authority: `${host}:${port}`,
                path: this._remoteResourcesPath,
                query
            });
        }
    }
    exports.RemoteAuthorities = new RemoteAuthoritiesImpl();
    exports.builtinExtensionsPath = 'vs/../../extensions';
    exports.nodeModulesPath = 'vs/../../node_modules';
    exports.nodeModulesAsarPath = 'vs/../../node_modules.asar';
    exports.nodeModulesAsarUnpackedPath = 'vs/../../node_modules.asar.unpacked';
    exports.VSCODE_AUTHORITY = 'vscode-app';
    class FileAccessImpl {
        static { this.FALLBACK_AUTHORITY = exports.VSCODE_AUTHORITY; }
        /**
         * Returns a URI to use in contexts where the browser is responsible
         * for loading (e.g. fetch()) or when used within the DOM.
         *
         * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
         */
        asBrowserUri(resourcePath) {
            const uri = this.toUri(resourcePath, require);
            return this.uriToBrowserUri(uri);
        }
        /**
         * Returns a URI to use in contexts where the browser is responsible
         * for loading (e.g. fetch()) or when used within the DOM.
         *
         * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
         */
        uriToBrowserUri(uri) {
            // Handle remote URIs via `RemoteAuthorities`
            if (uri.scheme === Schemas.vscodeRemote) {
                return exports.RemoteAuthorities.rewrite(uri);
            }
            // Convert to `vscode-file` resource..
            if (
            // ...only ever for `file` resources
            uri.scheme === Schemas.file &&
                (
                // ...and we run in native environments
                platform.isNative ||
                    // ...or web worker extensions on desktop
                    (platform.webWorkerOrigin === `${Schemas.vscodeFileResource}://${FileAccessImpl.FALLBACK_AUTHORITY}`))) {
                return uri.with({
                    scheme: Schemas.vscodeFileResource,
                    // We need to provide an authority here so that it can serve
                    // as origin for network and loading matters in chromium.
                    // If the URI is not coming with an authority already, we
                    // add our own
                    authority: uri.authority || FileAccessImpl.FALLBACK_AUTHORITY,
                    query: null,
                    fragment: null
                });
            }
            return uri;
        }
        /**
         * Returns the `file` URI to use in contexts where node.js
         * is responsible for loading.
         */
        asFileUri(resourcePath) {
            const uri = this.toUri(resourcePath, require);
            return this.uriToFileUri(uri);
        }
        /**
         * Returns the `file` URI to use in contexts where node.js
         * is responsible for loading.
         */
        uriToFileUri(uri) {
            // Only convert the URI if it is `vscode-file:` scheme
            if (uri.scheme === Schemas.vscodeFileResource) {
                return uri.with({
                    scheme: Schemas.file,
                    // Only preserve the `authority` if it is different from
                    // our fallback authority. This ensures we properly preserve
                    // Windows UNC paths that come with their own authority.
                    authority: uri.authority !== FileAccessImpl.FALLBACK_AUTHORITY ? uri.authority : null,
                    query: null,
                    fragment: null
                });
            }
            return uri;
        }
        toUri(uriOrModule, moduleIdToUrl) {
            if (uri_1.URI.isUri(uriOrModule)) {
                return uriOrModule;
            }
            return uri_1.URI.parse(moduleIdToUrl.toUrl(uriOrModule));
        }
    }
    exports.FileAccess = new FileAccessImpl();
    var COI;
    (function (COI) {
        const coiHeaders = new Map([
            ['1', { 'Cross-Origin-Opener-Policy': 'same-origin' }],
            ['2', { 'Cross-Origin-Embedder-Policy': 'require-corp' }],
            ['3', { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' }],
        ]);
        COI.CoopAndCoep = Object.freeze(coiHeaders.get('3'));
        const coiSearchParamName = 'vscode-coi';
        /**
         * Extract desired headers from `vscode-coi` invocation
         */
        function getHeadersFromQuery(url) {
            let params;
            if (typeof url === 'string') {
                params = new URL(url).searchParams;
            }
            else if (url instanceof URL) {
                params = url.searchParams;
            }
            else if (uri_1.URI.isUri(url)) {
                params = new URL(url.toString(true)).searchParams;
            }
            const value = params?.get(coiSearchParamName);
            if (!value) {
                return undefined;
            }
            return coiHeaders.get(value);
        }
        COI.getHeadersFromQuery = getHeadersFromQuery;
        /**
         * Add the `vscode-coi` query attribute based on wanting `COOP` and `COEP`. Will be a noop when `crossOriginIsolated`
         * isn't enabled the current context
         */
        function addSearchParam(urlOrSearch, coop, coep) {
            if (!globalThis.crossOriginIsolated) {
                // depends on the current context being COI
                return;
            }
            const value = coop && coep ? '3' : coep ? '2' : '1';
            if (urlOrSearch instanceof URLSearchParams) {
                urlOrSearch.set(coiSearchParamName, value);
            }
            else {
                urlOrSearch[coiSearchParamName] = value;
            }
        }
        COI.addSearchParam = addSearchParam;
    })(COI || (exports.COI = COI = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vbmV0d29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsSUFBaUIsT0FBTyxDQW9HdkI7SUFwR0QsV0FBaUIsT0FBTztRQUV2Qjs7O1dBR0c7UUFDVSxnQkFBUSxHQUFHLFVBQVUsQ0FBQztRQUVuQzs7V0FFRztRQUNVLGNBQU0sR0FBRyxRQUFRLENBQUM7UUFFL0I7O1dBRUc7UUFDVSxnQkFBUSxHQUFHLFNBQVMsQ0FBQztRQUVsQzs7V0FFRztRQUNVLG1CQUFXLEdBQUcsYUFBYSxDQUFDO1FBRXpDOztXQUVHO1FBQ1UsMEJBQWtCLEdBQUcsb0JBQW9CLENBQUM7UUFFMUMsWUFBSSxHQUFHLE1BQU0sQ0FBQztRQUVkLGFBQUssR0FBRyxPQUFPLENBQUM7UUFFaEIsWUFBSSxHQUFHLE1BQU0sQ0FBQztRQUVkLGNBQU0sR0FBRyxRQUFRLENBQUM7UUFFbEIsZ0JBQVEsR0FBRyxVQUFVLENBQUM7UUFFdEIsWUFBSSxHQUFHLE1BQU0sQ0FBQztRQUVkLGVBQU8sR0FBRyxTQUFTLENBQUM7UUFFcEIsb0JBQVksR0FBRyxlQUFlLENBQUM7UUFFL0IsNEJBQW9CLEdBQUcsd0JBQXdCLENBQUM7UUFFaEQsbUNBQTJCLEdBQUcsZ0NBQWdDLENBQUM7UUFFL0Qsc0JBQWMsR0FBRyxpQkFBaUIsQ0FBQztRQUVuQywwQkFBa0IsR0FBRyxzQkFBc0IsQ0FBQztRQUU1QywwQkFBa0IsR0FBRyxzQkFBc0IsQ0FBQztRQUM1QyxrQ0FBMEIsR0FBRywrQkFBK0IsQ0FBQztRQUM3RCxnQ0FBd0IsR0FBRyw2QkFBNkIsQ0FBQztRQUN6RCw4QkFBc0IsR0FBRywwQkFBMEIsQ0FBQztRQUVwRCxzQkFBYyxHQUFHLGlCQUFpQixDQUFDO1FBRW5DLDRCQUFvQixHQUFHLHdC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
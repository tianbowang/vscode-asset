/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["require","exports","vs/base/common/platform","vs/base/common/strings","vs/base/common/path","vs/base/common/extpath","vs/base/common/uri","vs/base/common/resources","vs/base/common/async","vs/base/common/glob","vs/base/common/symbols","vs/base/common/network","vs/base/common/errors","vs/base/common/cancellation","vs/workbench/services/search/common/getFileResults","vs/workbench/services/search/common/ignoreFile","vs/base/common/types","vs/base/common/event","vs/base/common/lifecycle","vs/base/common/lazy","vs/base/common/arrays","vs/base/common/map","vs/editor/common/core/range","vs/workbench/services/search/worker/localFileSearch"];
var __M = function(deps) {
  var result = [];
  for (var i = 0, len = deps.length; i < len; i++) {
    result[i] = __m[deps[i]];
  }
  return result;
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[10/*vs/base/common/symbols*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MicrotaskDelay = void 0;
    /**
     * Can be passed into the Delayed to defer using a microtask
     * */
    exports.MicrotaskDelay = Symbol('MicrotaskDelay');
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[5/*vs/base/common/extpath*/], __M([0/*require*/,1/*exports*/,4/*vs/base/common/path*/,2/*vs/base/common/platform*/,3/*vs/base/common/strings*/,16/*vs/base/common/types*/]), function (require, exports, path_1, platform_1, strings_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.randomPath = exports.parseLineAndColumnAware = exports.indexOfPath = exports.getDriveLetter = exports.hasDriveLetter = exports.isRootOrDriveLetter = exports.sanitizeFilePath = exports.isWindowsDriveLetter = exports.isEqualOrParent = exports.isEqual = exports.isValidBasename = exports.isUNC = exports.getRoot = exports.toPosixPath = exports.toSlashes = exports.isPathSeparator = void 0;
    function isPathSeparator(code) {
        return code === 47 /* CharCode.Slash */ || code === 92 /* CharCode.Backslash */;
    }
    exports.isPathSeparator = isPathSeparator;
    /**
     * Takes a Windows OS path and changes backward slashes to forward slashes.
     * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
     * Using it on a Linux or MaxOS path might change it.
     */
    function toSlashes(osPath) {
        return osPath.replace(/[\\/]/g, path_1.posix.sep);
    }
    exports.toSlashes = toSlashes;
    /**
     * Takes a Windows OS path (using backward or forward slashes) and turns it into a posix path:
     * - turns backward slashes into forward slashes
     * - makes it absolute if it starts with a drive letter
     * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
     * Using it on a Linux or MaxOS path might change it.
     */
    function toPosixPath(osPath) {
        if (osPath.indexOf('/') === -1) {
            osPath = toSlashes(osPath);
        }
        if (/^[a-zA-Z]:(\/|$)/.test(osPath)) { // starts with a drive letter
            osPath = '/' + osPath;
        }
        return osPath;
    }
    exports.toPosixPath = toPosixPath;
    /**
     * Computes the _root_ this path, like `getRoot('c:\files') === c:\`,
     * `getRoot('files:///files/path') === files:///`,
     * or `getRoot('\\server\shares\path') === \\server\shares\`
     */
    function getRoot(path, sep = path_1.posix.sep) {
        if (!path) {
            return '';
        }
        const len = path.length;
        const firstLetter = path.charCodeAt(0);
        if (isPathSeparator(firstLetter)) {
            if (isPathSeparator(path.charCodeAt(1))) {
                // UNC candidate \\localhost\shares\ddd
                //               ^^^^^^^^^^^^^^^^^^^
                if (!isPathSeparator(path.charCodeAt(2))) {
                    let pos = 3;
                    const start = pos;
                    for (; pos < len; pos++) {
                        if (isPathSeparator(path.charCodeAt(pos))) {
                            break;
                        }
                    }
                    if (start !== pos && !isPathSeparator(path.charCodeAt(pos + 1))) {
                        pos += 1;
                        for (; pos < len; pos++) {
                            if (isPathSeparator(path.charCodeAt(pos))) {
                                return path.slice(0, pos + 1) // consume this separator
                                    .replace(/[\\/]/g, sep);
                            }
                        }
                    }
                }
            }
            // /user/far
            // ^
            return sep;
        }
        else if (isWindowsDriveLetter(firstLetter)) {
            // check for windows drive letter c:\ or c:
            if (path.charCodeAt(1) === 58 /* CharCode.Colon */) {
                if (isPathSeparator(path.charCodeAt(2))) {
                    // C:\fff
                    // ^^^
                    return path.slice(0, 2) + sep;
                }
                else {
                    // C:
                    // ^^
                    return path.slice(0, 2);
                }
            }
        }
        // check for URI
        // scheme://authority/path
        // ^^^^^^^^^^^^^^^^^^^
        let pos = path.indexOf('://');
        if (pos !== -1) {
            pos += 3; // 3 -> "://".length
            for (; pos < len; pos++) {
                if (isPathSeparator(path.charCodeAt(pos))) {
                    return path.slice(0, pos + 1); // consume this separator
                }
            }
        }
        return '';
    }
    exports.getRoot = getRoot;
    /**
     * Check if the path follows this pattern: `\\hostname\sharename`.
     *
     * @see https://msdn.microsoft.com/en-us/library/gg465305.aspx
     * @return A boolean indication if the path is a UNC path, on none-windows
     * always false.
     */
    function isUNC(path) {
        if (!platform_1.isWindows) {
            // UNC is a windows concept
            return false;
        }
        if (!path || path.length < 5) {
            // at least \\a\b
            return false;
        }
        let code = path.charCodeAt(0);
        if (code !== 92 /* CharCode.Backslash */) {
            return false;
        }
        code = path.charCodeAt(1);
        if (code !== 92 /* CharCode.Backslash */) {
            return false;
        }
        let pos = 2;
        const start = pos;
        for (; pos < path.length; pos++) {
            code = path.charCodeAt(pos);
            if (code === 92 /* CharCode.Backslash */) {
                break;
            }
        }
        if (start === pos) {
            return false;
        }
        code = path.charCodeAt(pos + 1);
        if (isNaN(code) || code === 92 /* CharCode.Backslash */) {
            return false;
        }
        return true;
    }
    exports.isUNC = isUNC;
    // Reference: https://en.wikipedia.org/wiki/Filename
    const WINDOWS_INVALID_FILE_CHARS = /[\\/:\*\?"<>\|]/g;
    const UNIX_INVALID_FILE_CHARS = /[\\/]/g;
    const WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])(\.(.*?))?$/i;
    function isValidBasename(name, isWindowsOS = platform_1.isWindows) {
        const invalidFileChars = isWindowsOS ? WINDOWS_INVALID_FILE_CHARS : UNIX_INVALID_FILE_CHARS;
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return false; // require a name that is not just whitespace
        }
        invalidFileChars.lastIndex = 0; // the holy grail of software development
        if (invalidFileChars.test(name)) {
            return false; // check for certain invalid file characters
        }
        if (isWindowsOS && WINDOWS_FORBIDDEN_NAMES.test(name)) {
            return false; // check for certain invalid file names
        }
        if (name === '.' || name === '..') {
            return false; // check for reserved values
        }
        if (isWindowsOS && name[name.length - 1] === '.') {
            return false; // Windows: file cannot end with a "."
        }
        if (isWindowsOS && name.length !== name.trim().length) {
            return false; // Windows: file cannot end with a whitespace
        }
        if (name.length > 255) {
            return false; // most file systems do not allow files > 255 length
        }
        return true;
    }
    exports.isValidBasename = isValidBasename;
    /**
     * @deprecated please use `IUriIdentityService.extUri.isEqual` instead. If you are
     * in a context without services, consider to pass down the `extUri` from the outside
     * or use `extUriBiasedIgnorePathCase` if you know what you are doing.
     */
    function isEqual(pathA, pathB, ignoreCase) {
        const identityEquals = (pathA === pathB);
        if (!ignoreCase || identityEquals) {
            return identityEquals;
        }
        if (!pathA || !pathB) {
            return false;
        }
        return (0, strings_1.equalsIgnoreCase)(pathA, pathB);
    }
    exports.isEqual = isEqual;
    /**
     * @deprecated please use `IUriIdentityService.extUri.isEqualOrParent` instead. If
     * you are in a context without services, consider to pass down the `extUri` from the
     * outside, or use `extUriBiasedIgnorePathCase` if you know what you are doing.
     */
    function isEqualOrParent(base, parentCandidate, ignoreCase, separator = path_1.sep) {
        if (base === parentCandidate) {
            return true;
        }
        if (!base || !parentCandidate) {
            return false;
        }
        if (parentCandidate.length > base.length) {
            return false;
        }
        if (ignoreCase) {
            const beginsWith = (0, strings_1.startsWithIgnoreCase)(base, parentCandidate);
            if (!beginsWith) {
                return false;
            }
            if (parentCandidate.length === base.length) {
                return true; // same path, different casing
            }
            let sepOffset = parentCandidate.length;
            if (parentCandidate.charAt(parentCandidate.length - 1) === separator) {
                sepOffset--; // adjust the expected sep offset in case our candidate already ends in separator character
            }
            return base.charAt(sepOffset) === separator;
        }
        if (parentCandidate.charAt(parentCandidate.length - 1) !== separator) {
            parentCandidate += separator;
        }
        return base.indexOf(parentCandidate) === 0;
    }
    exports.isEqualOrParent = isEqualOrParent;
    function isWindowsDriveLetter(char0) {
        return char0 >= 65 /* CharCode.A */ && char0 <= 90 /* CharCode.Z */ || char0 >= 97 /* CharCode.a */ && char0 <= 122 /* CharCode.z */;
    }
    exports.isWindowsDriveLetter = isWindowsDriveLetter;
    function sanitizeFilePath(candidate, cwd) {
        // Special case: allow to open a drive letter without trailing backslash
        if (platform_1.isWindows && candidate.endsWith(':')) {
            candidate += path_1.sep;
        }
        // Ensure absolute
        if (!(0, path_1.isAbsolute)(candidate)) {
            candidate = (0, path_1.join)(cwd, candidate);
        }
        // Ensure normalized
        candidate = (0, path_1.normalize)(candidate);
        // Ensure no trailing slash/backslash
        if (platform_1.isWindows) {
            candidate = (0, strings_1.rtrim)(candidate, path_1.sep);
            // Special case: allow to open drive root ('C:\')
            if (candidate.endsWith(':')) {
                candidate += path_1.sep;
            }
        }
        else {
            candidate = (0, strings_1.rtrim)(candidate, path_1.sep);
            // Special case: allow to open root ('/')
            if (!candidate) {
                candidate = path_1.sep;
            }
        }
        return candidate;
    }
    exports.sanitizeFilePath = sanitizeFilePath;
    function isRootOrDriveLetter(path) {
        const pathNormalized = (0, path_1.normalize)(path);
        if (platform_1.isWindows) {
            if (path.length > 3) {
                return false;
            }
            return hasDriveLetter(pathNormalized) &&
                (path.length === 2 || pathNormalized.charCodeAt(2) === 92 /* CharCode.Backslash */);
        }
        return pathNormalized === path_1.posix.sep;
    }
    exports.isRootOrDriveLetter = isRootOrDriveLetter;
    function hasDriveLetter(path, isWindowsOS = platform_1.isWindows) {
        if (isWindowsOS) {
            return isWindowsDriveLetter(path.charCodeAt(0)) && path.charCodeAt(1) === 58 /* CharCode.Colon */;
        }
        return false;
    }
    exports.hasDriveLetter = hasDriveLetter;
    function getDriveLetter(path, isWindowsOS = platform_1.isWindows) {
        return hasDriveLetter(path, isWindowsOS) ? path[0] : undefined;
    }
    exports.getDriveLetter = getDriveLetter;
    function indexOfPath(path, candidate, ignoreCase) {
        if (candidate.length > path.length) {
            return -1;
        }
        if (path === candidate) {
            return 0;
        }
        if (ignoreCase) {
            path = path.toLowerCase();
            candidate = candidate.toLowerCase();
        }
        return path.indexOf(candidate);
    }
    exports.indexOfPath = indexOfPath;
    function parseLineAndColumnAware(rawPath) {
        const segments = rawPath.split(':'); // C:\file.txt:<line>:<column>
        let path = undefined;
        let line = undefined;
        let column = undefined;
        for (const segment of segments) {
            const segmentAsNumber = Number(segment);
            if (!(0, types_1.isNumber)(segmentAsNumber)) {
                path = !!path ? [path, segment].join(':') : segment; // a colon can well be part of a path (e.g. C:\...)
            }
            else if (line === undefined) {
                line = segmentAsNumber;
            }
            else if (column === undefined) {
                column = segmentAsNumber;
            }
        }
        if (!path) {
            throw new Error('Format for `--goto` should be: `FILE:LINE(:COLUMN)`');
        }
        return {
            path,
            line: line !== undefined ? line : undefined,
            column: column !== undefined ? column : line !== undefined ? 1 : undefined // if we have a line, make sure column is also set
        };
    }
    exports.parseLineAndColumnAware = parseLineAndColumnAware;
    const pathChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const windowsSafePathFirstChars = 'BDEFGHIJKMOQRSTUVWXYZbdefghijkmoqrstuvwxyz0123456789';
    function randomPath(parent, prefix, randomLength = 8) {
        let suffix = '';
        for (let i = 0; i < randomLength; i++) {
            let pathCharsTouse;
            if (i === 0 && platform_1.isWindows && !prefix && (randomLength === 3 || randomLength === 4)) {
                // Windows has certain reserved file names that cannot be used, such
                // as AUX, CON, PRN, etc. We want to avoid generating a random name
                // that matches that pattern, so we use a different set of characters
                // for the first character of the name that does not include any of
                // the reserved names first characters.
                pathCharsTouse = windowsSafePathFirstChars;
            }
            else {
                pathCharsTouse = pathChars;
            }
            suffix += pathCharsTouse.charAt(Math.floor(Math.random() * pathCharsTouse.length));
        }
        let randomFileName;
        if (prefix) {
            randomFileName = `${prefix}-${suffix}`;
        }
        else {
            randomFileName = suffix;
        }
        if (parent) {
            return (0, path_1.join)(parent, randomFileName);
        }
        return randomFileName;
    }
    exports.randomPath = randomPath;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[11/*vs/base/common/network*/], __M([0/*require*/,1/*exports*/,12/*vs/base/common/errors*/,2/*vs/base/common/platform*/,3/*vs/base/common/strings*/,6/*vs/base/common/uri*/]), function (require, exports, errors, platform, strings_1, uri_1) {
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
        /** Scheme used for code blocks in chat. */
        Schemas.vscodeChatCodeBlock = 'vscode-chat-code-block';
        /** Scheme used for the chat input editor. */
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
        /**
         * Scheme used for special rendering of settings in the release notes
         */
        Schemas.codeSetting = 'code-setting';
        /**
         * Scheme used for special rendering of features in the release notes
         */
        Schemas.codeFeature = 'code-feature';
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

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[7/*vs/base/common/resources*/], __M([0/*require*/,1/*exports*/,5/*vs/base/common/extpath*/,11/*vs/base/common/network*/,4/*vs/base/common/path*/,2/*vs/base/common/platform*/,3/*vs/base/common/strings*/,6/*vs/base/common/uri*/]), function (require, exports, extpath, network_1, paths, platform_1, strings_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toLocalResource = exports.DataUri = exports.distinctParents = exports.addTrailingPathSeparator = exports.removeTrailingPathSeparator = exports.hasTrailingPathSeparator = exports.isEqualAuthority = exports.isAbsolutePath = exports.resolvePath = exports.relativePath = exports.normalizePath = exports.joinPath = exports.dirname = exports.extname = exports.basename = exports.basenameOrAuthority = exports.getComparisonKey = exports.isEqualOrParent = exports.isEqual = exports.extUriIgnorePathCase = exports.extUriBiasedIgnorePathCase = exports.extUri = exports.ExtUri = exports.originalFSPath = void 0;
    function originalFSPath(uri) {
        return (0, uri_1.uriToFsPath)(uri, true);
    }
    exports.originalFSPath = originalFSPath;
    class ExtUri {
        constructor(_ignorePathCasing) {
            this._ignorePathCasing = _ignorePathCasing;
        }
        compare(uri1, uri2, ignoreFragment = false) {
            if (uri1 === uri2) {
                return 0;
            }
            return (0, strings_1.compare)(this.getComparisonKey(uri1, ignoreFragment), this.getComparisonKey(uri2, ignoreFragment));
        }
        isEqual(uri1, uri2, ignoreFragment = false) {
            if (uri1 === uri2) {
                return true;
            }
            if (!uri1 || !uri2) {
                return false;
            }
            return this.getComparisonKey(uri1, ignoreFragment) === this.getComparisonKey(uri2, ignoreFragment);
        }
        getComparisonKey(uri, ignoreFragment = false) {
            return uri.with({
                path: this._ignorePathCasing(uri) ? uri.path.toLowerCase() : undefined,
                fragment: ignoreFragment ? null : undefined
            }).toString();
        }
        ignorePathCasing(uri) {
            return this._ignorePathCasing(uri);
        }
        isEqualOrParent(base, parentCandidate, ignoreFragment = false) {
            if (base.scheme === parentCandidate.scheme) {
                if (base.scheme === network_1.Schemas.file) {
                    return extpath.isEqualOrParent(originalFSPath(base), originalFSPath(parentCandidate), this._ignorePathCasing(base)) && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
                }
                if ((0, exports.isEqualAuthority)(base.authority, parentCandidate.authority)) {
                    return extpath.isEqualOrParent(base.path, parentCandidate.path, this._ignorePathCasing(base), '/') && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
                }
            }
            return false;
        }
        // --- path math
        joinPath(resource, ...pathFragment) {
            return uri_1.URI.joinPath(resource, ...pathFragment);
        }
        basenameOrAuthority(resource) {
            return (0, exports.basename)(resource) || resource.authority;
        }
        basename(resource) {
            return paths.posix.basename(resource.path);
        }
        extname(resource) {
            return paths.posix.extname(resource.path);
        }
        dirname(resource) {
            if (resource.path.length === 0) {
                return resource;
            }
            let dirname;
            if (resource.scheme === network_1.Schemas.file) {
                dirname = uri_1.URI.file(paths.dirname(originalFSPath(resource))).path;
            }
            else {
                dirname = paths.posix.dirname(resource.path);
                if (resource.authority && dirname.length && dirname.charCodeAt(0) !== 47 /* CharCode.Slash */) {
                    console.error(`dirname("${resource.toString})) resulted in a relative path`);
                    dirname = '/'; // If a URI contains an authority component, then the path component must either be empty or begin with a CharCode.Slash ("/") character
                }
            }
            return resource.with({
                path: dirname
            });
        }
        normalizePath(resource) {
            if (!resource.path.length) {
                return resource;
            }
            let normalizedPath;
            if (resource.scheme === network_1.Schemas.file) {
                normalizedPath = uri_1.URI.file(paths.normalize(originalFSPath(resource))).path;
            }
            else {
                normalizedPath = paths.posix.normalize(resource.path);
            }
            return resource.with({
                path: normalizedPath
            });
        }
        relativePath(from, to) {
            if (from.scheme !== to.scheme || !(0, exports.isEqualAuthority)(from.authority, to.authority)) {
                return undefined;
            }
            if (from.scheme === network_1.Schemas.file) {
                const relativePath = paths.relative(originalFSPath(from), originalFSPath(to));
                return platform_1.isWindows ? extpath.toSlashes(relativePath) : relativePath;
            }
            let fromPath = from.path || '/';
            const toPath = to.path || '/';
            if (this._ignorePathCasing(from)) {
                // make casing of fromPath match toPath
                let i = 0;
                for (const len = Math.min(fromPath.length, toPath.length); i < len; i++) {
                    if (fromPath.charCodeAt(i) !== toPath.charCodeAt(i)) {
                        if (fromPath.charAt(i).toLowerCase() !== toPath.charAt(i).toLowerCase()) {
                            break;
                        }
                    }
                }
                fromPath = toPath.substr(0, i) + fromPath.substr(i);
            }
            return paths.posix.relative(fromPath, toPath);
        }
        resolvePath(base, path) {
            if (base.scheme === network_1.Schemas.file) {
                const newURI = uri_1.URI.file(paths.resolve(originalFSPath(base), path));
                return base.with({
                    authority: newURI.authority,
                    path: newURI.path
                });
            }
            path = extpath.toPosixPath(path); // we allow path to be a windows path
            return base.with({
                path: paths.posix.resolve(base.path, path)
            });
        }
        // --- misc
        isAbsolutePath(resource) {
            return !!resource.path && resource.path[0] === '/';
        }
        isEqualAuthority(a1, a2) {
            return a1 === a2 || (a1 !== undefined && a2 !== undefined && (0, strings_1.equalsIgnoreCase)(a1, a2));
        }
        hasTrailingPathSeparator(resource, sep = paths.sep) {
            if (resource.scheme === network_1.Schemas.file) {
                const fsp = originalFSPath(resource);
                return fsp.length > extpath.getRoot(fsp).length && fsp[fsp.length - 1] === sep;
            }
            else {
                const p = resource.path;
                return (p.length > 1 && p.charCodeAt(p.length - 1) === 47 /* CharCode.Slash */) && !(/^[a-zA-Z]:(\/$|\\$)/.test(resource.fsPath)); // ignore the slash at offset 0
            }
        }
        removeTrailingPathSeparator(resource, sep = paths.sep) {
            // Make sure that the path isn't a drive letter. A trailing separator there is not removable.
            if ((0, exports.hasTrailingPathSeparator)(resource, sep)) {
                return resource.with({ path: resource.path.substr(0, resource.path.length - 1) });
            }
            return resource;
        }
        addTrailingPathSeparator(resource, sep = paths.sep) {
            let isRootSep = false;
            if (resource.scheme === network_1.Schemas.file) {
                const fsp = originalFSPath(resource);
                isRootSep = ((fsp !== undefined) && (fsp.length === extpath.getRoot(fsp).length) && (fsp[fsp.length - 1] === sep));
            }
            else {
                sep = '/';
                const p = resource.path;
                isRootSep = p.length === 1 && p.charCodeAt(p.length - 1) === 47 /* CharCode.Slash */;
            }
            if (!isRootSep && !(0, exports.hasTrailingPathSeparator)(resource, sep)) {
                return resource.with({ path: resource.path + '/' });
            }
            return resource;
        }
    }
    exports.ExtUri = ExtUri;
    /**
     * Unbiased utility that takes uris "as they are". This means it can be interchanged with
     * uri#toString() usages. The following is true
     * ```
     * assertEqual(aUri.toString() === bUri.toString(), exturi.isEqual(aUri, bUri))
     * ```
     */
    exports.extUri = new ExtUri(() => false);
    /**
     * BIASED utility that _mostly_ ignored the case of urs paths. ONLY use this util if you
     * understand what you are doing.
     *
     * This utility is INCOMPATIBLE with `uri.toString()`-usages and both CANNOT be used interchanged.
     *
     * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
     * because those uris come from a "trustworthy source". When creating unknown uris it's always
     * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
     * casing matters.
     */
    exports.extUriBiasedIgnorePathCase = new ExtUri(uri => {
        // A file scheme resource is in the same platform as code, so ignore case for non linux platforms
        // Resource can be from another platform. Lowering the case as an hack. Should come from File system provider
        return uri.scheme === network_1.Schemas.file ? !platform_1.isLinux : true;
    });
    /**
     * BIASED utility that always ignores the casing of uris paths. ONLY use this util if you
     * understand what you are doing.
     *
     * This utility is INCOMPATIBLE with `uri.toString()`-usages and both CANNOT be used interchanged.
     *
     * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
     * because those uris come from a "trustworthy source". When creating unknown uris it's always
     * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
     * casing matters.
     */
    exports.extUriIgnorePathCase = new ExtUri(_ => true);
    exports.isEqual = exports.extUri.isEqual.bind(exports.extUri);
    exports.isEqualOrParent = exports.extUri.isEqualOrParent.bind(exports.extUri);
    exports.getComparisonKey = exports.extUri.getComparisonKey.bind(exports.extUri);
    exports.basenameOrAuthority = exports.extUri.basenameOrAuthority.bind(exports.extUri);
    exports.basename = exports.extUri.basename.bind(exports.extUri);
    exports.extname = exports.extUri.extname.bind(exports.extUri);
    exports.dirname = exports.extUri.dirname.bind(exports.extUri);
    exports.joinPath = exports.extUri.joinPath.bind(exports.extUri);
    exports.normalizePath = exports.extUri.normalizePath.bind(exports.extUri);
    exports.relativePath = exports.extUri.relativePath.bind(exports.extUri);
    exports.resolvePath = exports.extUri.resolvePath.bind(exports.extUri);
    exports.isAbsolutePath = exports.extUri.isAbsolutePath.bind(exports.extUri);
    exports.isEqualAuthority = exports.extUri.isEqualAuthority.bind(exports.extUri);
    exports.hasTrailingPathSeparator = exports.extUri.hasTrailingPathSeparator.bind(exports.extUri);
    exports.removeTrailingPathSeparator = exports.extUri.removeTrailingPathSeparator.bind(exports.extUri);
    exports.addTrailingPathSeparator = exports.extUri.addTrailingPathSeparator.bind(exports.extUri);
    //#endregion
    function distinctParents(items, resourceAccessor) {
        const distinctParents = [];
        for (let i = 0; i < items.length; i++) {
            const candidateResource = resourceAccessor(items[i]);
            if (items.some((otherItem, index) => {
                if (index === i) {
                    return false;
                }
                return (0, exports.isEqualOrParent)(candidateResource, resourceAccessor(otherItem));
            })) {
                continue;
            }
            distinctParents.push(items[i]);
        }
        return distinctParents;
    }
    exports.distinctParents = distinctParents;
    /**
     * Data URI related helpers.
     */
    var DataUri;
    (function (DataUri) {
        DataUri.META_DATA_LABEL = 'label';
        DataUri.META_DATA_DESCRIPTION = 'description';
        DataUri.META_DATA_SIZE = 'size';
        DataUri.META_DATA_MIME = 'mime';
        function parseMetaData(dataUri) {
            const metadata = new Map();
            // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
            // the metadata is: size:2313;label:SomeLabel;description:SomeDescription
            const meta = dataUri.path.substring(dataUri.path.indexOf(';') + 1, dataUri.path.lastIndexOf(';'));
            meta.split(';').forEach(property => {
                const [key, value] = property.split(':');
                if (key && value) {
                    metadata.set(key, value);
                }
            });
            // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
            // the mime is: image/png
            const mime = dataUri.path.substring(0, dataUri.path.indexOf(';'));
            if (mime) {
                metadata.set(DataUri.META_DATA_MIME, mime);
            }
            return metadata;
        }
        DataUri.parseMetaData = parseMetaData;
    })(DataUri || (exports.DataUri = DataUri = {}));
    function toLocalResource(resource, authority, localScheme) {
        if (authority) {
            let path = resource.path;
            if (path && path[0] !== paths.posix.sep) {
                path = paths.posix.sep + path;
            }
            return resource.with({ scheme: localScheme, authority, path });
        }
        return resource.with({ scheme: localScheme });
    }
    exports.toLocalResource = toLocalResource;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[8/*vs/base/common/async*/], __M([0/*require*/,1/*exports*/,13/*vs/base/common/cancellation*/,12/*vs/base/common/errors*/,17/*vs/base/common/event*/,18/*vs/base/common/lifecycle*/,7/*vs/base/common/resources*/,2/*vs/base/common/platform*/,10/*vs/base/common/symbols*/,19/*vs/base/common/lazy*/]), function (require, exports, cancellation_1, errors_1, event_1, lifecycle_1, resources_1, platform_1, symbols_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AsyncIterableSource = exports.createCancelableAsyncIterable = exports.CancelableAsyncIterableObject = exports.AsyncIterableObject = exports.LazyStatefulPromise = exports.StatefulPromise = exports.Promises = exports.DeferredPromise = exports.IntervalCounter = exports.TaskSequentializer = exports.retry = exports.GlobalIdleValue = exports.AbstractIdleValue = exports._runWhenIdle = exports.runWhenGlobalIdle = exports.ThrottledWorker = exports.RunOnceWorker = exports.ProcessTimeRunOnceScheduler = exports.RunOnceScheduler = exports.IntervalTimer = exports.TimeoutTimer = exports.ResourceQueue = exports.LimitedQueue = exports.Queue = exports.Limiter = exports.firstParallel = exports.first = exports.sequence = exports.disposableTimeout = exports.timeout = exports.AutoOpenBarrier = exports.Barrier = exports.ThrottledDelayer = exports.Delayer = exports.SequencerByKey = exports.Sequencer = exports.Throttler = exports.promiseWithResolvers = exports.asPromise = exports.raceTimeout = exports.raceCancellablePromises = exports.raceCancellationError = exports.raceCancellation = exports.createCancelablePromise = exports.isThenable = void 0;
    function isThenable(obj) {
        return !!obj && typeof obj.then === 'function';
    }
    exports.isThenable = isThenable;
    function createCancelablePromise(callback) {
        const source = new cancellation_1.CancellationTokenSource();
        const thenable = callback(source.token);
        const promise = new Promise((resolve, reject) => {
            const subscription = source.token.onCancellationRequested(() => {
                subscription.dispose();
                reject(new errors_1.CancellationError());
            });
            Promise.resolve(thenable).then(value => {
                subscription.dispose();
                source.dispose();
                resolve(value);
            }, err => {
                subscription.dispose();
                source.dispose();
                reject(err);
            });
        });
        return new class {
            cancel() {
                source.cancel();
                source.dispose();
            }
            then(resolve, reject) {
                return promise.then(resolve, reject);
            }
            catch(reject) {
                return this.then(undefined, reject);
            }
            finally(onfinally) {
                return promise.finally(onfinally);
            }
        };
    }
    exports.createCancelablePromise = createCancelablePromise;
    function raceCancellation(promise, token, defaultValue) {
        return new Promise((resolve, reject) => {
            const ref = token.onCancellationRequested(() => {
                ref.dispose();
                resolve(defaultValue);
            });
            promise.then(resolve, reject).finally(() => ref.dispose());
        });
    }
    exports.raceCancellation = raceCancellation;
    /**
     * Returns a promise that rejects with an {@CancellationError} as soon as the passed token is cancelled.
     * @see {@link raceCancellation}
     */
    function raceCancellationError(promise, token) {
        return new Promise((resolve, reject) => {
            const ref = token.onCancellationRequested(() => {
                ref.dispose();
                reject(new errors_1.CancellationError());
            });
            promise.then(resolve, reject).finally(() => ref.dispose());
        });
    }
    exports.raceCancellationError = raceCancellationError;
    /**
     * Returns as soon as one of the promises resolves or rejects and cancels remaining promises
     */
    async function raceCancellablePromises(cancellablePromises) {
        let resolvedPromiseIndex = -1;
        const promises = cancellablePromises.map((promise, index) => promise.then(result => { resolvedPromiseIndex = index; return result; }));
        try {
            const result = await Promise.race(promises);
            return result;
        }
        finally {
            cancellablePromises.forEach((cancellablePromise, index) => {
                if (index !== resolvedPromiseIndex) {
                    cancellablePromise.cancel();
                }
            });
        }
    }
    exports.raceCancellablePromises = raceCancellablePromises;
    function raceTimeout(promise, timeout, onTimeout) {
        let promiseResolve = undefined;
        const timer = setTimeout(() => {
            promiseResolve?.(undefined);
            onTimeout?.();
        }, timeout);
        return Promise.race([
            promise.finally(() => clearTimeout(timer)),
            new Promise(resolve => promiseResolve = resolve)
        ]);
    }
    exports.raceTimeout = raceTimeout;
    function asPromise(callback) {
        return new Promise((resolve, reject) => {
            const item = callback();
            if (isThenable(item)) {
                item.then(resolve, reject);
            }
            else {
                resolve(item);
            }
        });
    }
    exports.asPromise = asPromise;
    /**
     * Creates and returns a new promise, plus its `resolve` and `reject` callbacks.
     *
     * Replace with standardized [`Promise.withResolvers`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) once it is supported
     */
    function promiseWithResolvers() {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve: resolve, reject: reject };
    }
    exports.promiseWithResolvers = promiseWithResolvers;
    /**
     * A helper to prevent accumulation of sequential async tasks.
     *
     * Imagine a mail man with the sole task of delivering letters. As soon as
     * a letter submitted for delivery, he drives to the destination, delivers it
     * and returns to his base. Imagine that during the trip, N more letters were submitted.
     * When the mail man returns, he picks those N letters and delivers them all in a
     * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
     *
     * The throttler implements this via the queue() method, by providing it a task
     * factory. Following the example:
     *
     * 		const throttler = new Throttler();
     * 		const letters = [];
     *
     * 		function deliver() {
     * 			const lettersToDeliver = letters;
     * 			letters = [];
     * 			return makeTheTrip(lettersToDeliver);
     * 		}
     *
     * 		function onLetterReceived(l) {
     * 			letters.push(l);
     * 			throttler.queue(deliver);
     * 		}
     */
    class Throttler {
        constructor() {
            this.isDisposed = false;
            this.activePromise = null;
            this.queuedPromise = null;
            this.queuedPromiseFactory = null;
        }
        queue(promiseFactory) {
            if (this.isDisposed) {
                return Promise.reject(new Error('Throttler is disposed'));
            }
            if (this.activePromise) {
                this.queuedPromiseFactory = promiseFactory;
                if (!this.queuedPromise) {
                    const onComplete = () => {
                        this.queuedPromise = null;
                        if (this.isDisposed) {
                            return;
                        }
                        const result = this.queue(this.queuedPromiseFactory);
                        this.queuedPromiseFactory = null;
                        return result;
                    };
                    this.queuedPromise = new Promise(resolve => {
                        this.activePromise.then(onComplete, onComplete).then(resolve);
                    });
                }
                return new Promise((resolve, reject) => {
                    this.queuedPromise.then(resolve, reject);
                });
            }
            this.activePromise = promiseFactory();
            return new Promise((resolve, reject) => {
                this.activePromise.then((result) => {
                    this.activePromise = null;
                    resolve(result);
                }, (err) => {
                    this.activePromise = null;
                    reject(err);
                });
            });
        }
        dispose() {
            this.isDisposed = true;
        }
    }
    exports.Throttler = Throttler;
    class Sequencer {
        constructor() {
            this.current = Promise.resolve(null);
        }
        queue(promiseTask) {
            return this.current = this.current.then(() => promiseTask(), () => promiseTask());
        }
    }
    exports.Sequencer = Sequencer;
    class SequencerByKey {
        constructor() {
            this.promiseMap = new Map();
        }
        queue(key, promiseTask) {
            const runningPromise = this.promiseMap.get(key) ?? Promise.resolve();
            const newPromise = runningPromise
                .catch(() => { })
                .then(promiseTask)
                .finally(() => {
                if (this.promiseMap.get(key) === newPromise) {
                    this.promiseMap.delete(key);
                }
            });
            this.promiseMap.set(key, newPromise);
            return newPromise;
        }
    }
    exports.SequencerByKey = SequencerByKey;
    const timeoutDeferred = (timeout, fn) => {
        let scheduled = true;
        const handle = setTimeout(() => {
            scheduled = false;
            fn();
        }, timeout);
        return {
            isTriggered: () => scheduled,
            dispose: () => {
                clearTimeout(handle);
                scheduled = false;
            },
        };
    };
    const microtaskDeferred = (fn) => {
        let scheduled = true;
        queueMicrotask(() => {
            if (scheduled) {
                scheduled = false;
                fn();
            }
        });
        return {
            isTriggered: () => scheduled,
            dispose: () => { scheduled = false; },
        };
    };
    /**
     * A helper to delay (debounce) execution of a task that is being requested often.
     *
     * Following the throttler, now imagine the mail man wants to optimize the number of
     * trips proactively. The trip itself can be long, so he decides not to make the trip
     * as soon as a letter is submitted. Instead he waits a while, in case more
     * letters are submitted. After said waiting period, if no letters were submitted, he
     * decides to make the trip. Imagine that N more letters were submitted after the first
     * one, all within a short period of time between each other. Even though N+1
     * submissions occurred, only 1 delivery was made.
     *
     * The delayer offers this behavior via the trigger() method, into which both the task
     * to be executed and the waiting period (delay) must be passed in as arguments. Following
     * the example:
     *
     * 		const delayer = new Delayer(WAITING_PERIOD);
     * 		const letters = [];
     *
     * 		function letterReceived(l) {
     * 			letters.push(l);
     * 			delayer.trigger(() => { return makeTheTrip(); });
     * 		}
     */
    class Delayer {
        constructor(defaultDelay) {
            this.defaultDelay = defaultDelay;
            this.deferred = null;
            this.completionPromise = null;
            this.doResolve = null;
            this.doReject = null;
            this.task = null;
        }
        trigger(task, delay = this.defaultDelay) {
            this.task = task;
            this.cancelTimeout();
            if (!this.completionPromise) {
                this.completionPromise = new Promise((resolve, reject) => {
                    this.doResolve = resolve;
                    this.doReject = reject;
                }).then(() => {
                    this.completionPromise = null;
                    this.doResolve = null;
                    if (this.task) {
                        const task = this.task;
                        this.task = null;
                        return task();
                    }
                    return undefined;
                });
            }
            const fn = () => {
                this.deferred = null;
                this.doResolve?.(null);
            };
            this.deferred = delay === symbols_1.MicrotaskDelay ? microtaskDeferred(fn) : timeoutDeferred(delay, fn);
            return this.completionPromise;
        }
        isTriggered() {
            return !!this.deferred?.isTriggered();
        }
        cancel() {
            this.cancelTimeout();
            if (this.completionPromise) {
                this.doReject?.(new errors_1.CancellationError());
                this.completionPromise = null;
            }
        }
        cancelTimeout() {
            this.deferred?.dispose();
            this.deferred = null;
        }
        dispose() {
            this.cancel();
        }
    }
    exports.Delayer = Delayer;
    /**
     * A helper to delay execution of a task that is being requested often, while
     * preventing accumulation of consecutive executions, while the task runs.
     *
     * The mail man is clever and waits for a certain amount of time, before going
     * out to deliver letters. While the mail man is going out, more letters arrive
     * and can only be delivered once he is back. Once he is back the mail man will
     * do one more trip to deliver the letters that have accumulated while he was out.
     */
    class ThrottledDelayer {
        constructor(defaultDelay) {
            this.delayer = new Delayer(defaultDelay);
            this.throttler = new Throttler();
        }
        trigger(promiseFactory, delay) {
            return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay);
        }
        isTriggered() {
            return this.delayer.isTriggered();
        }
        cancel() {
            this.delayer.cancel();
        }
        dispose() {
            this.delayer.dispose();
            this.throttler.dispose();
        }
    }
    exports.ThrottledDelayer = ThrottledDelayer;
    /**
     * A barrier that is initially closed and then becomes opened permanently.
     */
    class Barrier {
        constructor() {
            this._isOpen = false;
            this._promise = new Promise((c, e) => {
                this._completePromise = c;
            });
        }
        isOpen() {
            return this._isOpen;
        }
        open() {
            this._isOpen = true;
            this._completePromise(true);
        }
        wait() {
            return this._promise;
        }
    }
    exports.Barrier = Barrier;
    /**
     * A barrier that is initially closed and then becomes opened permanently after a certain period of
     * time or when open is called explicitly
     */
    class AutoOpenBarrier extends Barrier {
        constructor(autoOpenTimeMs) {
            super();
            this._timeout = setTimeout(() => this.open(), autoOpenTimeMs);
        }
        open() {
            clearTimeout(this._timeout);
            super.open();
        }
    }
    exports.AutoOpenBarrier = AutoOpenBarrier;
    function timeout(millis, token) {
        if (!token) {
            return createCancelablePromise(token => timeout(millis, token));
        }
        return new Promise((resolve, reject) => {
            const handle = setTimeout(() => {
                disposable.dispose();
                resolve();
            }, millis);
            const disposable = token.onCancellationRequested(() => {
                clearTimeout(handle);
                disposable.dispose();
                reject(new errors_1.CancellationError());
            });
        });
    }
    exports.timeout = timeout;
    /**
     * Creates a timeout that can be disposed using its returned value.
     * @param handler The timeout handler.
     * @param timeout An optional timeout in milliseconds.
     * @param store An optional {@link DisposableStore} that will have the timeout disposable managed automatically.
     *
     * @example
     * const store = new DisposableStore;
     * // Call the timeout after 1000ms at which point it will be automatically
     * // evicted from the store.
     * const timeoutDisposable = disposableTimeout(() => {}, 1000, store);
     *
     * if (foo) {
     *   // Cancel the timeout and evict it from store.
     *   timeoutDisposable.dispose();
     * }
     */
    function disposableTimeout(handler, timeout = 0, store) {
        const timer = setTimeout(() => {
            handler();
            if (store) {
                disposable.dispose();
            }
        }, timeout);
        const disposable = (0, lifecycle_1.toDisposable)(() => {
            clearTimeout(timer);
            store?.deleteAndLeak(disposable);
        });
        store?.add(disposable);
        return disposable;
    }
    exports.disposableTimeout = disposableTimeout;
    /**
     * Runs the provided list of promise factories in sequential order. The returned
     * promise will complete to an array of results from each promise.
     */
    function sequence(promiseFactories) {
        const results = [];
        let index = 0;
        const len = promiseFactories.length;
        function next() {
            return index < len ? promiseFactories[index++]() : null;
        }
        function thenHandler(result) {
            if (result !== undefined && result !== null) {
                results.push(result);
            }
            const n = next();
            if (n) {
                return n.then(thenHandler);
            }
            return Promise.resolve(results);
        }
        return Promise.resolve(null).then(thenHandler);
    }
    exports.sequence = sequence;
    function first(promiseFactories, shouldStop = t => !!t, defaultValue = null) {
        let index = 0;
        const len = promiseFactories.length;
        const loop = () => {
            if (index >= len) {
                return Promise.resolve(defaultValue);
            }
            const factory = promiseFactories[index++];
            const promise = Promise.resolve(factory());
            return promise.then(result => {
                if (shouldStop(result)) {
                    return Promise.resolve(result);
                }
                return loop();
            });
        };
        return loop();
    }
    exports.first = first;
    function firstParallel(promiseList, shouldStop = t => !!t, defaultValue = null) {
        if (promiseList.length === 0) {
            return Promise.resolve(defaultValue);
        }
        let todo = promiseList.length;
        const finish = () => {
            todo = -1;
            for (const promise of promiseList) {
                promise.cancel?.();
            }
        };
        return new Promise((resolve, reject) => {
            for (const promise of promiseList) {
                promise.then(result => {
                    if (--todo >= 0 && shouldStop(result)) {
                        finish();
                        resolve(result);
                    }
                    else if (todo === 0) {
                        resolve(defaultValue);
                    }
                })
                    .catch(err => {
                    if (--todo >= 0) {
                        finish();
                        reject(err);
                    }
                });
            }
        });
    }
    exports.firstParallel = firstParallel;
    /**
     * A helper to queue N promises and run them all with a max degree of parallelism. The helper
     * ensures that at any time no more than M promises are running at the same time.
     */
    class Limiter {
        constructor(maxDegreeOfParalellism) {
            this._size = 0;
            this._isDisposed = false;
            this.maxDegreeOfParalellism = maxDegreeOfParalellism;
            this.outstandingPromises = [];
            this.runningPromises = 0;
            this._onDrained = new event_1.Emitter();
        }
        /**
         *
         * @returns A promise that resolved when all work is done (onDrained) or when
         * there is nothing to do
         */
        whenIdle() {
            return this.size > 0
                ? event_1.Event.toPromise(this.onDrained)
                : Promise.resolve();
        }
        get onDrained() {
            return this._onDrained.event;
        }
        get size() {
            return this._size;
        }
        queue(factory) {
            if (this._isDisposed) {
                throw new Error('Object has been disposed');
            }
            this._size++;
            return new Promise((c, e) => {
                this.outstandingPromises.push({ factory, c, e });
                this.consume();
            });
        }
        consume() {
            while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
                const iLimitedTask = this.outstandingPromises.shift();
                this.runningPromises++;
                const promise = iLimitedTask.factory();
                promise.then(iLimitedTask.c, iLimitedTask.e);
                promise.then(() => this.consumed(), () => this.consumed());
            }
        }
        consumed() {
            if (this._isDisposed) {
                return;
            }
            this.runningPromises--;
            if (--this._size === 0) {
                this._onDrained.fire();
            }
            if (this.outstandingPromises.length > 0) {
                this.consume();
            }
        }
        clear() {
            if (this._isDisposed) {
                throw new Error('Object has been disposed');
            }
            this.outstandingPromises.length = 0;
            this._size = this.runningPromises;
        }
        dispose() {
            this._isDisposed = true;
            this.outstandingPromises.length = 0; // stop further processing
            this._size = 0;
            this._onDrained.dispose();
        }
    }
    exports.Limiter = Limiter;
    /**
     * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
     */
    class Queue extends Limiter {
        constructor() {
            super(1);
        }
    }
    exports.Queue = Queue;
    /**
     * Same as `Queue`, ensures that only 1 task is executed at the same time. The difference to `Queue` is that
     * there is only 1 task about to be scheduled next. As such, calling `queue` while a task is executing will
     * replace the currently queued task until it executes.
     *
     * As such, the returned promise may not be from the factory that is passed in but from the next factory that
     * is running after having called `queue`.
     */
    class LimitedQueue {
        constructor() {
            this.sequentializer = new TaskSequentializer();
            this.tasks = 0;
        }
        queue(factory) {
            if (!this.sequentializer.isRunning()) {
                return this.sequentializer.run(this.tasks++, factory());
            }
            return this.sequentializer.queue(() => {
                return this.sequentializer.run(this.tasks++, factory());
            });
        }
    }
    exports.LimitedQueue = LimitedQueue;
    /**
     * A helper to organize queues per resource. The ResourceQueue makes sure to manage queues per resource
     * by disposing them once the queue is empty.
     */
    class ResourceQueue {
        constructor() {
            this.queues = new Map();
            this.drainers = new Set();
            this.drainListeners = undefined;
            this.drainListenerCount = 0;
        }
        async whenDrained() {
            if (this.isDrained()) {
                return;
            }
            const promise = new DeferredPromise();
            this.drainers.add(promise);
            return promise.p;
        }
        isDrained() {
            for (const [, queue] of this.queues) {
                if (queue.size > 0) {
                    return false;
                }
            }
            return true;
        }
        queueSize(resource, extUri = resources_1.extUri) {
            const key = extUri.getComparisonKey(resource);
            return this.queues.get(key)?.size ?? 0;
        }
        queueFor(resource, factory, extUri = resources_1.extUri) {
            const key = extUri.getComparisonKey(resource);
            let queue = this.queues.get(key);
            if (!queue) {
                queue = new Queue();
                const drainListenerId = this.drainListenerCount++;
                const drainListener = event_1.Event.once(queue.onDrained)(() => {
                    queue?.dispose();
                    this.queues.delete(key);
                    this.onDidQueueDrain();
                    this.drainListeners?.deleteAndDispose(drainListenerId);
                    if (this.drainListeners?.size === 0) {
                        this.drainListeners.dispose();
                        this.drainListeners = undefined;
                    }
                });
                if (!this.drainListeners) {
                    this.drainListeners = new lifecycle_1.DisposableMap();
                }
                this.drainListeners.set(drainListenerId, drainListener);
                this.queues.set(key, queue);
            }
            return queue.queue(factory);
        }
        onDidQueueDrain() {
            if (!this.isDrained()) {
                return; // not done yet
            }
            this.releaseDrainers();
        }
        releaseDrainers() {
            for (const drainer of this.drainers) {
                drainer.complete();
            }
            this.drainers.clear();
        }
        dispose() {
            for (const [, queue] of this.queues) {
                queue.dispose();
            }
            this.queues.clear();
            // Even though we might still have pending
            // tasks queued, after the queues have been
            // disposed, we can no longer track them, so
            // we release drainers to prevent hanging
            // promises when the resource queue is being
            // disposed.
            this.releaseDrainers();
            this.drainListeners?.dispose();
        }
    }
    exports.ResourceQueue = ResourceQueue;
    class TimeoutTimer {
        constructor(runner, timeout) {
            this._token = -1;
            if (typeof runner === 'function' && typeof timeout === 'number') {
                this.setIfNotSet(runner, timeout);
            }
        }
        dispose() {
            this.cancel();
        }
        cancel() {
            if (this._token !== -1) {
                clearTimeout(this._token);
                this._token = -1;
            }
        }
        cancelAndSet(runner, timeout) {
            this.cancel();
            this._token = setTimeout(() => {
                this._token = -1;
                runner();
            }, timeout);
        }
        setIfNotSet(runner, timeout) {
            if (this._token !== -1) {
                // timer is already set
                return;
            }
            this._token = setTimeout(() => {
                this._token = -1;
                runner();
            }, timeout);
        }
    }
    exports.TimeoutTimer = TimeoutTimer;
    class IntervalTimer {
        constructor() {
            this.disposable = undefined;
        }
        cancel() {
            this.disposable?.dispose();
            this.disposable = undefined;
        }
        cancelAndSet(runner, interval, context = globalThis) {
            this.cancel();
            const handle = context.setInterval(() => {
                runner();
            }, interval);
            this.disposable = (0, lifecycle_1.toDisposable)(() => {
                context.clearInterval(handle);
                this.disposable = undefined;
            });
        }
        dispose() {
            this.cancel();
        }
    }
    exports.IntervalTimer = IntervalTimer;
    class RunOnceScheduler {
        constructor(runner, delay) {
            this.timeoutToken = -1;
            this.runner = runner;
            this.timeout = delay;
            this.timeoutHandler = this.onTimeout.bind(this);
        }
        /**
         * Dispose RunOnceScheduler
         */
        dispose() {
            this.cancel();
            this.runner = null;
        }
        /**
         * Cancel current scheduled runner (if any).
         */
        cancel() {
            if (this.isScheduled()) {
                clearTimeout(this.timeoutToken);
                this.timeoutToken = -1;
            }
        }
        /**
         * Cancel previous runner (if any) & schedule a new runner.
         */
        schedule(delay = this.timeout) {
            this.cancel();
            this.timeoutToken = setTimeout(this.timeoutHandler, delay);
        }
        get delay() {
            return this.timeout;
        }
        set delay(value) {
            this.timeout = value;
        }
        /**
         * Returns true if scheduled.
         */
        isScheduled() {
            return this.timeoutToken !== -1;
        }
        flush() {
            if (this.isScheduled()) {
                this.cancel();
                this.doRun();
            }
        }
        onTimeout() {
            this.timeoutToken = -1;
            if (this.runner) {
                this.doRun();
            }
        }
        doRun() {
            this.runner?.();
        }
    }
    exports.RunOnceScheduler = RunOnceScheduler;
    /**
     * Same as `RunOnceScheduler`, but doesn't count the time spent in sleep mode.
     * > **NOTE**: Only offers 1s resolution.
     *
     * When calling `setTimeout` with 3hrs, and putting the computer immediately to sleep
     * for 8hrs, `setTimeout` will fire **as soon as the computer wakes from sleep**. But
     * this scheduler will execute 3hrs **after waking the computer from sleep**.
     */
    class ProcessTimeRunOnceScheduler {
        constructor(runner, delay) {
            if (delay % 1000 !== 0) {
                console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
            }
            this.runner = runner;
            this.timeout = delay;
            this.counter = 0;
            this.intervalToken = -1;
            this.intervalHandler = this.onInterval.bind(this);
        }
        dispose() {
            this.cancel();
            this.runner = null;
        }
        cancel() {
            if (this.isScheduled()) {
                clearInterval(this.intervalToken);
                this.intervalToken = -1;
            }
        }
        /**
         * Cancel previous runner (if any) & schedule a new runner.
         */
        schedule(delay = this.timeout) {
            if (delay % 1000 !== 0) {
                console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
            }
            this.cancel();
            this.counter = Math.ceil(delay / 1000);
            this.intervalToken = setInterval(this.intervalHandler, 1000);
        }
        /**
         * Returns true if scheduled.
         */
        isScheduled() {
            return this.intervalToken !== -1;
        }
        onInterval() {
            this.counter--;
            if (this.counter > 0) {
                // still need to wait
                return;
            }
            // time elapsed
            clearInterval(this.intervalToken);
            this.intervalToken = -1;
            this.runner?.();
        }
    }
    exports.ProcessTimeRunOnceScheduler = ProcessTimeRunOnceScheduler;
    class RunOnceWorker extends RunOnceScheduler {
        constructor(runner, timeout) {
            super(runner, timeout);
            this.units = [];
        }
        work(unit) {
            this.units.push(unit);
            if (!this.isScheduled()) {
                this.schedule();
            }
        }
        doRun() {
            const units = this.units;
            this.units = [];
            this.runner?.(units);
        }
        dispose() {
            this.units = [];
            super.dispose();
        }
    }
    exports.RunOnceWorker = RunOnceWorker;
    /**
     * The `ThrottledWorker` will accept units of work `T`
     * to handle. The contract is:
     * * there is a maximum of units the worker can handle at once (via `maxWorkChunkSize`)
     * * there is a maximum of units the worker will keep in memory for processing (via `maxBufferedWork`)
     * * after having handled `maxWorkChunkSize` units, the worker needs to rest (via `throttleDelay`)
     */
    class ThrottledWorker extends lifecycle_1.Disposable {
        constructor(options, handler) {
            super();
            this.options = options;
            this.handler = handler;
            this.pendingWork = [];
            this.throttler = this._register(new lifecycle_1.MutableDisposable());
            this.disposed = false;
        }
        /**
         * The number of work units that are pending to be processed.
         */
        get pending() { return this.pendingWork.length; }
        /**
         * Add units to be worked on. Use `pending` to figure out
         * how many units are not yet processed after this method
         * was called.
         *
         * @returns whether the work was accepted or not. If the
         * worker is disposed, it will not accept any more work.
         * If the number of pending units would become larger
         * than `maxPendingWork`, more work will also not be accepted.
         */
        work(units) {
            if (this.disposed) {
                return false; // work not accepted: disposed
            }
            // Check for reaching maximum of pending work
            if (typeof this.options.maxBufferedWork === 'number') {
                // Throttled: simple check if pending + units exceeds max pending
                if (this.throttler.value) {
                    if (this.pending + units.length > this.options.maxBufferedWork) {
                        return false; // work not accepted: too much pending work
                    }
                }
                // Unthrottled: same as throttled, but account for max chunk getting
                // worked on directly without being pending
                else {
                    if (this.pending + units.length - this.options.maxWorkChunkSize > this.options.maxBufferedWork) {
                        return false; // work not accepted: too much pending work
                    }
                }
            }
            // Add to pending units first
            for (const unit of units) {
                this.pendingWork.push(unit);
            }
            // If not throttled, start working directly
            // Otherwise, when the throttle delay has
            // past, pending work will be worked again.
            if (!this.throttler.value) {
                this.doWork();
            }
            return true; // work accepted
        }
        doWork() {
            // Extract chunk to handle and handle it
            this.handler(this.pendingWork.splice(0, this.options.maxWorkChunkSize));
            // If we have remaining work, schedule it after a delay
            if (this.pendingWork.length > 0) {
                this.throttler.value = new RunOnceScheduler(() => {
                    this.throttler.clear();
                    this.doWork();
                }, this.options.throttleDelay);
                this.throttler.value.schedule();
            }
        }
        dispose() {
            super.dispose();
            this.disposed = true;
        }
    }
    exports.ThrottledWorker = ThrottledWorker;
    (function () {
        if (typeof globalThis.requestIdleCallback !== 'function' || typeof globalThis.cancelIdleCallback !== 'function') {
            exports._runWhenIdle = (_targetWindow, runner) => {
                (0, platform_1.setTimeout0)(() => {
                    if (disposed) {
                        return;
                    }
                    const end = Date.now() + 15; // one frame at 64fps
                    const deadline = {
                        didTimeout: true,
                        timeRemaining() {
                            return Math.max(0, end - Date.now());
                        }
                    };
                    runner(Object.freeze(deadline));
                });
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                    }
                };
            };
        }
        else {
            exports._runWhenIdle = (targetWindow, runner, timeout) => {
                const handle = targetWindow.requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                        targetWindow.cancelIdleCallback(handle);
                    }
                };
            };
        }
        exports.runWhenGlobalIdle = (runner) => (0, exports._runWhenIdle)(globalThis, runner);
    })();
    class AbstractIdleValue {
        constructor(targetWindow, executor) {
            this._didRun = false;
            this._executor = () => {
                try {
                    this._value = executor();
                }
                catch (err) {
                    this._error = err;
                }
                finally {
                    this._didRun = true;
                }
            };
            this._handle = (0, exports._runWhenIdle)(targetWindow, () => this._executor());
        }
        dispose() {
            this._handle.dispose();
        }
        get value() {
            if (!this._didRun) {
                this._handle.dispose();
                this._executor();
            }
            if (this._error) {
                throw this._error;
            }
            return this._value;
        }
        get isInitialized() {
            return this._didRun;
        }
    }
    exports.AbstractIdleValue = AbstractIdleValue;
    /**
     * An `IdleValue` that always uses the current window (which might be throttled or inactive)
     *
     * **Note** that there is `dom.ts#WindowIdleValue` which is better suited when running inside a browser
     * context
     */
    class GlobalIdleValue extends AbstractIdleValue {
        constructor(executor) {
            super(globalThis, executor);
        }
    }
    exports.GlobalIdleValue = GlobalIdleValue;
    //#endregion
    async function retry(task, delay, retries) {
        let lastError;
        for (let i = 0; i < retries; i++) {
            try {
                return await task();
            }
            catch (error) {
                lastError = error;
                await timeout(delay);
            }
        }
        throw lastError;
    }
    exports.retry = retry;
    /**
     * @deprecated use `LimitedQueue` instead for an easier to use API
     */
    class TaskSequentializer {
        isRunning(taskId) {
            if (typeof taskId === 'number') {
                return this._running?.taskId === taskId;
            }
            return !!this._running;
        }
        get running() {
            return this._running?.promise;
        }
        cancelRunning() {
            this._running?.cancel();
        }
        run(taskId, promise, onCancel) {
            this._running = { taskId, cancel: () => onCancel?.(), promise };
            promise.then(() => this.doneRunning(taskId), () => this.doneRunning(taskId));
            return promise;
        }
        doneRunning(taskId) {
            if (this._running && taskId === this._running.taskId) {
                // only set running to done if the promise finished that is associated with that taskId
                this._running = undefined;
                // schedule the queued task now that we are free if we have any
                this.runQueued();
            }
        }
        runQueued() {
            if (this._queued) {
                const queued = this._queued;
                this._queued = undefined;
                // Run queued task and complete on the associated promise
                queued.run().then(queued.promiseResolve, queued.promiseReject);
            }
        }
        /**
         * Note: the promise to schedule as next run MUST itself call `run`.
         *       Otherwise, this sequentializer will report `false` for `isRunning`
         *       even when this task is running. Missing this detail means that
         *       suddenly multiple tasks will run in parallel.
         */
        queue(run) {
            // this is our first queued task, so we create associated promise with it
            // so that we can return a promise that completes when the task has
            // completed.
            if (!this._queued) {
                const { promise, resolve: promiseResolve, reject: promiseReject } = promiseWithResolvers();
                this._queued = {
                    run,
                    promise,
                    promiseResolve: promiseResolve,
                    promiseReject: promiseReject
                };
            }
            // we have a previous queued task, just overwrite it
            else {
                this._queued.run = run;
            }
            return this._queued.promise;
        }
        hasQueued() {
            return !!this._queued;
        }
        async join() {
            return this._queued?.promise ?? this._running?.promise;
        }
    }
    exports.TaskSequentializer = TaskSequentializer;
    //#endregion
    //#region
    /**
     * The `IntervalCounter` allows to count the number
     * of calls to `increment()` over a duration of
     * `interval`. This utility can be used to conditionally
     * throttle a frequent task when a certain threshold
     * is reached.
     */
    class IntervalCounter {
        constructor(interval, nowFn = () => Date.now()) {
            this.interval = interval;
            this.nowFn = nowFn;
            this.lastIncrementTime = 0;
            this.value = 0;
        }
        increment() {
            const now = this.nowFn();
            // We are outside of the range of `interval` and as such
            // start counting from 0 and remember the time
            if (now - this.lastIncrementTime > this.interval) {
                this.lastIncrementTime = now;
                this.value = 0;
            }
            this.value++;
            return this.value;
        }
    }
    exports.IntervalCounter = IntervalCounter;
    var DeferredOutcome;
    (function (DeferredOutcome) {
        DeferredOutcome[DeferredOutcome["Resolved"] = 0] = "Resolved";
        DeferredOutcome[DeferredOutcome["Rejected"] = 1] = "Rejected";
    })(DeferredOutcome || (DeferredOutcome = {}));
    /**
     * Creates a promise whose resolution or rejection can be controlled imperatively.
     */
    class DeferredPromise {
        get isRejected() {
            return this.outcome?.outcome === 1 /* DeferredOutcome.Rejected */;
        }
        get isResolved() {
            return this.outcome?.outcome === 0 /* DeferredOutcome.Resolved */;
        }
        get isSettled() {
            return !!this.outcome;
        }
        get value() {
            return this.outcome?.outcome === 0 /* DeferredOutcome.Resolved */ ? this.outcome?.value : undefined;
        }
        constructor() {
            this.p = new Promise((c, e) => {
                this.completeCallback = c;
                this.errorCallback = e;
            });
        }
        complete(value) {
            return new Promise(resolve => {
                this.completeCallback(value);
                this.outcome = { outcome: 0 /* DeferredOutcome.Resolved */, value };
                resolve();
            });
        }
        error(err) {
            return new Promise(resolve => {
                this.errorCallback(err);
                this.outcome = { outcome: 1 /* DeferredOutcome.Rejected */, value: err };
                resolve();
            });
        }
        cancel() {
            return this.error(new errors_1.CancellationError());
        }
    }
    exports.DeferredPromise = DeferredPromise;
    //#endregion
    //#region Promises
    var Promises;
    (function (Promises) {
        /**
         * A drop-in replacement for `Promise.all` with the only difference
         * that the method awaits every promise to either fulfill or reject.
         *
         * Similar to `Promise.all`, only the first error will be returned
         * if any.
         */
        async function settled(promises) {
            let firstError = undefined;
            const result = await Promise.all(promises.map(promise => promise.then(value => value, error => {
                if (!firstError) {
                    firstError = error;
                }
                return undefined; // do not rethrow so that other promises can settle
            })));
            if (typeof firstError !== 'undefined') {
                throw firstError;
            }
            return result; // cast is needed and protected by the `throw` above
        }
        Promises.settled = settled;
        /**
         * A helper to create a new `Promise<T>` with a body that is a promise
         * itself. By default, an error that raises from the async body will
         * end up as a unhandled rejection, so this utility properly awaits the
         * body and rejects the promise as a normal promise does without async
         * body.
         *
         * This method should only be used in rare cases where otherwise `async`
         * cannot be used (e.g. when callbacks are involved that require this).
         */
        function withAsyncBody(bodyFn) {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                try {
                    await bodyFn(resolve, reject);
                }
                catch (error) {
                    reject(error);
                }
            });
        }
        Promises.withAsyncBody = withAsyncBody;
    })(Promises || (exports.Promises = Promises = {}));
    class StatefulPromise {
        get value() { return this._value; }
        get error() { return this._error; }
        get isResolved() { return this._isResolved; }
        constructor(promise) {
            this._value = undefined;
            this._error = undefined;
            this._isResolved = false;
            this.promise = promise.then(value => {
                this._value = value;
                this._isResolved = true;
                return value;
            }, error => {
                this._error = error;
                this._isResolved = true;
                throw error;
            });
        }
        /**
         * Returns the resolved value.
         * Throws if the promise is not resolved yet.
         */
        requireValue() {
            if (!this._isResolved) {
                throw new errors_1.BugIndicatingError('Promise is not resolved yet');
            }
            if (this._error) {
                throw this._error;
            }
            return this._value;
        }
    }
    exports.StatefulPromise = StatefulPromise;
    class LazyStatefulPromise {
        constructor(_compute) {
            this._compute = _compute;
            this._promise = new lazy_1.Lazy(() => new StatefulPromise(this._compute()));
        }
        /**
         * Returns the resolved value.
         * Throws if the promise is not resolved yet.
         */
        requireValue() {
            return this._promise.value.requireValue();
        }
        /**
         * Returns the promise (and triggers a computation of the promise if not yet done so).
         */
        getPromise() {
            return this._promise.value.promise;
        }
        /**
         * Reads the current value without triggering a computation of the promise.
         */
        get currentValue() {
            return this._promise.rawValue?.value;
        }
    }
    exports.LazyStatefulPromise = LazyStatefulPromise;
    //#endregion
    //#region
    var AsyncIterableSourceState;
    (function (AsyncIterableSourceState) {
        AsyncIterableSourceState[AsyncIterableSourceState["Initial"] = 0] = "Initial";
        AsyncIterableSourceState[AsyncIterableSourceState["DoneOK"] = 1] = "DoneOK";
        AsyncIterableSourceState[AsyncIterableSourceState["DoneError"] = 2] = "DoneError";
    })(AsyncIterableSourceState || (AsyncIterableSourceState = {}));
    /**
     * A rich implementation for an `AsyncIterable<T>`.
     */
    class AsyncIterableObject {
        static fromArray(items) {
            return new AsyncIterableObject((writer) => {
                writer.emitMany(items);
            });
        }
        static fromPromise(promise) {
            return new AsyncIterableObject(async (emitter) => {
                emitter.emitMany(await promise);
            });
        }
        static fromPromises(promises) {
            return new AsyncIterableObject(async (emitter) => {
                await Promise.all(promises.map(async (p) => emitter.emitOne(await p)));
            });
        }
        static merge(iterables) {
            return new AsyncIterableObject(async (emitter) => {
                await Promise.all(iterables.map(async (iterable) => {
                    for await (const item of iterable) {
                        emitter.emitOne(item);
                    }
                }));
            });
        }
        static { this.EMPTY = AsyncIterableObject.fromArray([]); }
        constructor(executor) {
            this._state = 0 /* AsyncIterableSourceState.Initial */;
            this._results = [];
            this._error = null;
            this._onStateChanged = new event_1.Emitter();
            queueMicrotask(async () => {
                const writer = {
                    emitOne: (item) => this.emitOne(item),
                    emitMany: (items) => this.emitMany(items),
                    reject: (error) => this.reject(error)
                };
                try {
                    await Promise.resolve(executor(writer));
                    this.resolve();
                }
                catch (err) {
                    this.reject(err);
                }
                finally {
                    writer.emitOne = undefined;
                    writer.emitMany = undefined;
                    writer.reject = undefined;
                }
            });
        }
        [Symbol.asyncIterator]() {
            let i = 0;
            return {
                next: async () => {
                    do {
                        if (this._state === 2 /* AsyncIterableSourceState.DoneError */) {
                            throw this._error;
                        }
                        if (i < this._results.length) {
                            return { done: false, value: this._results[i++] };
                        }
                        if (this._state === 1 /* AsyncIterableSourceState.DoneOK */) {
                            return { done: true, value: undefined };
                        }
                        await event_1.Event.toPromise(this._onStateChanged.event);
                    } while (true);
                }
            };
        }
        static map(iterable, mapFn) {
            return new AsyncIterableObject(async (emitter) => {
                for await (const item of iterable) {
                    emitter.emitOne(mapFn(item));
                }
            });
        }
        map(mapFn) {
            return AsyncIterableObject.map(this, mapFn);
        }
        static filter(iterable, filterFn) {
            return new AsyncIterableObject(async (emitter) => {
                for await (const item of iterable) {
                    if (filterFn(item)) {
                        emitter.emitOne(item);
                    }
                }
            });
        }
        filter(filterFn) {
            return AsyncIterableObject.filter(this, filterFn);
        }
        static coalesce(iterable) {
            return AsyncIterableObject.filter(iterable, item => !!item);
        }
        coalesce() {
            return AsyncIterableObject.coalesce(this);
        }
        static async toPromise(iterable) {
            const result = [];
            for await (const item of iterable) {
                result.push(item);
            }
            return result;
        }
        toPromise() {
            return AsyncIterableObject.toPromise(this);
        }
        /**
         * The value will be appended at the end.
         *
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        emitOne(value) {
            if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            // it is important to add new values at the end,
            // as we may have iterators already running on the array
            this._results.push(value);
            this._onStateChanged.fire();
        }
        /**
         * The values will be appended at the end.
         *
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        emitMany(values) {
            if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            // it is important to add new values at the end,
            // as we may have iterators already running on the array
            this._results = this._results.concat(values);
            this._onStateChanged.fire();
        }
        /**
         * Calling `resolve()` will mark the result array as complete.
         *
         * **NOTE** `resolve()` must be called, otherwise all consumers of this iterable will hang indefinitely, similar to a non-resolved promise.
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        resolve() {
            if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            this._state = 1 /* AsyncIterableSourceState.DoneOK */;
            this._onStateChanged.fire();
        }
        /**
         * Writing an error will permanently invalidate this iterable.
         * The current users will receive an error thrown, as will all future users.
         *
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        reject(error) {
            if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            this._state = 2 /* AsyncIterableSourceState.DoneError */;
            this._error = error;
            this._onStateChanged.fire();
        }
    }
    exports.AsyncIterableObject = AsyncIterableObject;
    class CancelableAsyncIterableObject extends AsyncIterableObject {
        constructor(_source, executor) {
            super(executor);
            this._source = _source;
        }
        cancel() {
            this._source.cancel();
        }
    }
    exports.CancelableAsyncIterableObject = CancelableAsyncIterableObject;
    function createCancelableAsyncIterable(callback) {
        const source = new cancellation_1.CancellationTokenSource();
        const innerIterable = callback(source.token);
        return new CancelableAsyncIterableObject(source, async (emitter) => {
            const subscription = source.token.onCancellationRequested(() => {
                subscription.dispose();
                source.dispose();
                emitter.reject(new errors_1.CancellationError());
            });
            try {
                for await (const item of innerIterable) {
                    if (source.token.isCancellationRequested) {
                        // canceled in the meantime
                        return;
                    }
                    emitter.emitOne(item);
                }
                subscription.dispose();
                source.dispose();
            }
            catch (err) {
                subscription.dispose();
                source.dispose();
                emitter.reject(err);
            }
        });
    }
    exports.createCancelableAsyncIterable = createCancelableAsyncIterable;
    class AsyncIterableSource {
        constructor() {
            this._deferred = new DeferredPromise();
            this._asyncIterable = new AsyncIterableObject(emitter => {
                if (earlyError) {
                    emitter.reject(earlyError);
                    return;
                }
                if (earlyItems) {
                    emitter.emitMany(earlyItems);
                }
                this._errorFn = (error) => emitter.reject(error);
                this._emitFn = (item) => emitter.emitOne(item);
                return this._deferred.p;
            });
            let earlyError;
            let earlyItems;
            this._emitFn = (item) => {
                if (!earlyItems) {
                    earlyItems = [];
                }
                earlyItems.push(item);
            };
            this._errorFn = (error) => {
                if (!earlyError) {
                    earlyError = error;
                }
            };
        }
        get asyncIterable() {
            return this._asyncIterable;
        }
        resolve() {
            this._deferred.complete();
        }
        reject(error) {
            this._errorFn(error);
            this._deferred.complete();
        }
        emitOne(item) {
            this._emitFn(item);
        }
    }
    exports.AsyncIterableSource = AsyncIterableSource;
});
//#endregion

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[9/*vs/base/common/glob*/], __M([0/*require*/,1/*exports*/,20/*vs/base/common/arrays*/,8/*vs/base/common/async*/,5/*vs/base/common/extpath*/,21/*vs/base/common/map*/,4/*vs/base/common/path*/,2/*vs/base/common/platform*/,3/*vs/base/common/strings*/]), function (require, exports, arrays_1, async_1, extpath_1, map_1, path_1, platform_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.patternsEquals = exports.getPathTerms = exports.getBasenameTerms = exports.isRelativePattern = exports.parse = exports.match = exports.splitGlobAware = exports.GLOB_SPLIT = exports.GLOBSTAR = exports.getEmptyExpression = void 0;
    function getEmptyExpression() {
        return Object.create(null);
    }
    exports.getEmptyExpression = getEmptyExpression;
    exports.GLOBSTAR = '**';
    exports.GLOB_SPLIT = '/';
    const PATH_REGEX = '[/\\\\]'; // any slash or backslash
    const NO_PATH_REGEX = '[^/\\\\]'; // any non-slash and non-backslash
    const ALL_FORWARD_SLASHES = /\//g;
    function starsToRegExp(starCount, isLastPattern) {
        switch (starCount) {
            case 0:
                return '';
            case 1:
                return `${NO_PATH_REGEX}*?`; // 1 star matches any number of characters except path separator (/ and \) - non greedy (?)
            default:
                // Matches:  (Path Sep OR Path Val followed by Path Sep) 0-many times except when it's the last pattern
                //           in which case also matches (Path Sep followed by Path Val)
                // Group is non capturing because we don't need to capture at all (?:...)
                // Overall we use non-greedy matching because it could be that we match too much
                return `(?:${PATH_REGEX}|${NO_PATH_REGEX}+${PATH_REGEX}${isLastPattern ? `|${PATH_REGEX}${NO_PATH_REGEX}+` : ''})*?`;
        }
    }
    function splitGlobAware(pattern, splitChar) {
        if (!pattern) {
            return [];
        }
        const segments = [];
        let inBraces = false;
        let inBrackets = false;
        let curVal = '';
        for (const char of pattern) {
            switch (char) {
                case splitChar:
                    if (!inBraces && !inBrackets) {
                        segments.push(curVal);
                        curVal = '';
                        continue;
                    }
                    break;
                case '{':
                    inBraces = true;
                    break;
                case '}':
                    inBraces = false;
                    break;
                case '[':
                    inBrackets = true;
                    break;
                case ']':
                    inBrackets = false;
                    break;
            }
            curVal += char;
        }
        // Tail
        if (curVal) {
            segments.push(curVal);
        }
        return segments;
    }
    exports.splitGlobAware = splitGlobAware;
    function parseRegExp(pattern) {
        if (!pattern) {
            return '';
        }
        let regEx = '';
        // Split up into segments for each slash found
        const segments = splitGlobAware(pattern, exports.GLOB_SPLIT);
        // Special case where we only have globstars
        if (segments.every(segment => segment === exports.GLOBSTAR)) {
            regEx = '.*';
        }
        // Build regex over segments
        else {
            let previousSegmentWasGlobStar = false;
            segments.forEach((segment, index) => {
                // Treat globstar specially
                if (segment === exports.GLOBSTAR) {
                    // if we have more than one globstar after another, just ignore it
                    if (previousSegmentWasGlobStar) {
                        return;
                    }
                    regEx += starsToRegExp(2, index === segments.length - 1);
                }
                // Anything else, not globstar
                else {
                    // States
                    let inBraces = false;
                    let braceVal = '';
                    let inBrackets = false;
                    let bracketVal = '';
                    for (const char of segment) {
                        // Support brace expansion
                        if (char !== '}' && inBraces) {
                            braceVal += char;
                            continue;
                        }
                        // Support brackets
                        if (inBrackets && (char !== ']' || !bracketVal) /* ] is literally only allowed as first character in brackets to match it */) {
                            let res;
                            // range operator
                            if (char === '-') {
                                res = char;
                            }
                            // negation operator (only valid on first index in bracket)
                            else if ((char === '^' || char === '!') && !bracketVal) {
                                res = '^';
                            }
                            // glob split matching is not allowed within character ranges
                            // see http://man7.org/linux/man-pages/man7/glob.7.html
                            else if (char === exports.GLOB_SPLIT) {
                                res = '';
                            }
                            // anything else gets escaped
                            else {
                                res = (0, strings_1.escapeRegExpCharacters)(char);
                            }
                            bracketVal += res;
                            continue;
                        }
                        switch (char) {
                            case '{':
                                inBraces = true;
                                continue;
                            case '[':
                                inBrackets = true;
                                continue;
                            case '}': {
                                const choices = splitGlobAware(braceVal, ',');
                                // Converts {foo,bar} => [foo|bar]
                                const braceRegExp = `(?:${choices.map(choice => parseRegExp(choice)).join('|')})`;
                                regEx += braceRegExp;
                                inBraces = false;
                                braceVal = '';
                                break;
                            }
                            case ']': {
                                regEx += ('[' + bracketVal + ']');
                                inBrackets = false;
                                bracketVal = '';
                                break;
                            }
                            case '?':
                                regEx += NO_PATH_REGEX; // 1 ? matches any single character except path separator (/ and \)
                                continue;
                            case '*':
                                regEx += starsToRegExp(1);
                                continue;
                            default:
                                regEx += (0, strings_1.escapeRegExpCharacters)(char);
                        }
                    }
                    // Tail: Add the slash we had split on if there is more to
                    // come and the remaining pattern is not a globstar
                    // For example if pattern: some/**/*.js we want the "/" after
                    // some to be included in the RegEx to prevent a folder called
                    // "something" to match as well.
                    if (index < segments.length - 1 && // more segments to come after this
                        (segments[index + 1] !== exports.GLOBSTAR || // next segment is not **, or...
                            index + 2 < segments.length // ...next segment is ** but there is more segments after that
                        )) {
                        regEx += PATH_REGEX;
                    }
                }
                // update globstar state
                previousSegmentWasGlobStar = (segment === exports.GLOBSTAR);
            });
        }
        return regEx;
    }
    // regexes to check for trivial glob patterns that just check for String#endsWith
    const T1 = /^\*\*\/\*\.[\w\.-]+$/; // **/*.something
    const T2 = /^\*\*\/([\w\.-]+)\/?$/; // **/something
    const T3 = /^{\*\*\/\*?[\w\.-]+\/?(,\*\*\/\*?[\w\.-]+\/?)*}$/; // {**/*.something,**/*.else} or {**/package.json,**/project.json}
    const T3_2 = /^{\*\*\/\*?[\w\.-]+(\/(\*\*)?)?(,\*\*\/\*?[\w\.-]+(\/(\*\*)?)?)*}$/; // Like T3, with optional trailing /**
    const T4 = /^\*\*((\/[\w\.-]+)+)\/?$/; // **/something/else
    const T5 = /^([\w\.-]+(\/[\w\.-]+)*)\/?$/; // something/else
    const CACHE = new map_1.LRUCache(10000); // bounded to 10000 elements
    const FALSE = function () {
        return false;
    };
    const NULL = function () {
        return null;
    };
    function parsePattern(arg1, options) {
        if (!arg1) {
            return NULL;
        }
        // Handle relative patterns
        let pattern;
        if (typeof arg1 !== 'string') {
            pattern = arg1.pattern;
        }
        else {
            pattern = arg1;
        }
        // Whitespace trimming
        pattern = pattern.trim();
        // Check cache
        const patternKey = `${pattern}_${!!options.trimForExclusions}`;
        let parsedPattern = CACHE.get(patternKey);
        if (parsedPattern) {
            return wrapRelativePattern(parsedPattern, arg1);
        }
        // Check for Trivials
        let match;
        if (T1.test(pattern)) {
            parsedPattern = trivia1(pattern.substr(4), pattern); // common pattern: **/*.txt just need endsWith check
        }
        else if (match = T2.exec(trimForExclusions(pattern, options))) { // common pattern: **/some.txt just need basename check
            parsedPattern = trivia2(match[1], pattern);
        }
        else if ((options.trimForExclusions ? T3_2 : T3).test(pattern)) { // repetition of common patterns (see above) {**/*.txt,**/*.png}
            parsedPattern = trivia3(pattern, options);
        }
        else if (match = T4.exec(trimForExclusions(pattern, options))) { // common pattern: **/something/else just need endsWith check
            parsedPattern = trivia4and5(match[1].substr(1), pattern, true);
        }
        else if (match = T5.exec(trimForExclusions(pattern, options))) { // common pattern: something/else just need equals check
            parsedPattern = trivia4and5(match[1], pattern, false);
        }
        // Otherwise convert to pattern
        else {
            parsedPattern = toRegExp(pattern);
        }
        // Cache
        CACHE.set(patternKey, parsedPattern);
        return wrapRelativePattern(parsedPattern, arg1);
    }
    function wrapRelativePattern(parsedPattern, arg2) {
        if (typeof arg2 === 'string') {
            return parsedPattern;
        }
        const wrappedPattern = function (path, basename) {
            if (!(0, extpath_1.isEqualOrParent)(path, arg2.base, !platform_1.isLinux)) {
                // skip glob matching if `base` is not a parent of `path`
                return null;
            }
            // Given we have checked `base` being a parent of `path`,
            // we can now remove the `base` portion of the `path`
            // and only match on the remaining path components
            // For that we try to extract the portion of the `path`
            // that comes after the `base` portion. We have to account
            // for the fact that `base` might end in a path separator
            // (https://github.com/microsoft/vscode/issues/162498)
            return parsedPattern((0, strings_1.ltrim)(path.substr(arg2.base.length), path_1.sep), basename);
        };
        // Make sure to preserve associated metadata
        wrappedPattern.allBasenames = parsedPattern.allBasenames;
        wrappedPattern.allPaths = parsedPattern.allPaths;
        wrappedPattern.basenames = parsedPattern.basenames;
        wrappedPattern.patterns = parsedPattern.patterns;
        return wrappedPattern;
    }
    function trimForExclusions(pattern, options) {
        return options.trimForExclusions && pattern.endsWith('/**') ? pattern.substr(0, pattern.length - 2) : pattern; // dropping **, tailing / is dropped later
    }
    // common pattern: **/*.txt just need endsWith check
    function trivia1(base, pattern) {
        return function (path, basename) {
            return typeof path === 'string' && path.endsWith(base) ? pattern : null;
        };
    }
    // common pattern: **/some.txt just need basename check
    function trivia2(base, pattern) {
        const slashBase = `/${base}`;
        const backslashBase = `\\${base}`;
        const parsedPattern = function (path, basename) {
            if (typeof path !== 'string') {
                return null;
            }
            if (basename) {
                return basename === base ? pattern : null;
            }
            return path === base || path.endsWith(slashBase) || path.endsWith(backslashBase) ? pattern : null;
        };
        const basenames = [base];
        parsedPattern.basenames = basenames;
        parsedPattern.patterns = [pattern];
        parsedPattern.allBasenames = basenames;
        return parsedPattern;
    }
    // repetition of common patterns (see above) {**/*.txt,**/*.png}
    function trivia3(pattern, options) {
        const parsedPatterns = aggregateBasenameMatches(pattern.slice(1, -1)
            .split(',')
            .map(pattern => parsePattern(pattern, options))
            .filter(pattern => pattern !== NULL), pattern);
        const patternsLength = parsedPatterns.length;
        if (!patternsLength) {
            return NULL;
        }
        if (patternsLength === 1) {
            return parsedPatterns[0];
        }
        const parsedPattern = function (path, basename) {
            for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                if (parsedPatterns[i](path, basename)) {
                    return pattern;
                }
            }
            return null;
        };
        const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
        if (withBasenames) {
            parsedPattern.allBasenames = withBasenames.allBasenames;
        }
        const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
        if (allPaths.length) {
            parsedPattern.allPaths = allPaths;
        }
        return parsedPattern;
    }
    // common patterns: **/something/else just need endsWith check, something/else just needs and equals check
    function trivia4and5(targetPath, pattern, matchPathEnds) {
        const usingPosixSep = path_1.sep === path_1.posix.sep;
        const nativePath = usingPosixSep ? targetPath : targetPath.replace(ALL_FORWARD_SLASHES, path_1.sep);
        const nativePathEnd = path_1.sep + nativePath;
        const targetPathEnd = path_1.posix.sep + targetPath;
        let parsedPattern;
        if (matchPathEnds) {
            parsedPattern = function (path, basename) {
                return typeof path === 'string' && ((path === nativePath || path.endsWith(nativePathEnd)) || !usingPosixSep && (path === targetPath || path.endsWith(targetPathEnd))) ? pattern : null;
            };
        }
        else {
            parsedPattern = function (path, basename) {
                return typeof path === 'string' && (path === nativePath || (!usingPosixSep && path === targetPath)) ? pattern : null;
            };
        }
        parsedPattern.allPaths = [(matchPathEnds ? '*/' : './') + targetPath];
        return parsedPattern;
    }
    function toRegExp(pattern) {
        try {
            const regExp = new RegExp(`^${parseRegExp(pattern)}$`);
            return function (path) {
                regExp.lastIndex = 0; // reset RegExp to its initial state to reuse it!
                return typeof path === 'string' && regExp.test(path) ? pattern : null;
            };
        }
        catch (error) {
            return NULL;
        }
    }
    function match(arg1, path, hasSibling) {
        if (!arg1 || typeof path !== 'string') {
            return false;
        }
        return parse(arg1)(path, undefined, hasSibling);
    }
    exports.match = match;
    function parse(arg1, options = {}) {
        if (!arg1) {
            return FALSE;
        }
        // Glob with String
        if (typeof arg1 === 'string' || isRelativePattern(arg1)) {
            const parsedPattern = parsePattern(arg1, options);
            if (parsedPattern === NULL) {
                return FALSE;
            }
            const resultPattern = function (path, basename) {
                return !!parsedPattern(path, basename);
            };
            if (parsedPattern.allBasenames) {
                resultPattern.allBasenames = parsedPattern.allBasenames;
            }
            if (parsedPattern.allPaths) {
                resultPattern.allPaths = parsedPattern.allPaths;
            }
            return resultPattern;
        }
        // Glob with Expression
        return parsedExpression(arg1, options);
    }
    exports.parse = parse;
    function isRelativePattern(obj) {
        const rp = obj;
        if (!rp) {
            return false;
        }
        return typeof rp.base === 'string' && typeof rp.pattern === 'string';
    }
    exports.isRelativePattern = isRelativePattern;
    function getBasenameTerms(patternOrExpression) {
        return patternOrExpression.allBasenames || [];
    }
    exports.getBasenameTerms = getBasenameTerms;
    function getPathTerms(patternOrExpression) {
        return patternOrExpression.allPaths || [];
    }
    exports.getPathTerms = getPathTerms;
    function parsedExpression(expression, options) {
        const parsedPatterns = aggregateBasenameMatches(Object.getOwnPropertyNames(expression)
            .map(pattern => parseExpressionPattern(pattern, expression[pattern], options))
            .filter(pattern => pattern !== NULL));
        const patternsLength = parsedPatterns.length;
        if (!patternsLength) {
            return NULL;
        }
        if (!parsedPatterns.some(parsedPattern => !!parsedPattern.requiresSiblings)) {
            if (patternsLength === 1) {
                return parsedPatterns[0];
            }
            const resultExpression = function (path, basename) {
                let resultPromises = undefined;
                for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                    const result = parsedPatterns[i](path, basename);
                    if (typeof result === 'string') {
                        return result; // immediately return as soon as the first expression matches
                    }
                    // If the result is a promise, we have to keep it for
                    // later processing and await the result properly.
                    if ((0, async_1.isThenable)(result)) {
                        if (!resultPromises) {
                            resultPromises = [];
                        }
                        resultPromises.push(result);
                    }
                }
                // With result promises, we have to loop over each and
                // await the result before we can return any result.
                if (resultPromises) {
                    return (async () => {
                        for (const resultPromise of resultPromises) {
                            const result = await resultPromise;
                            if (typeof result === 'string') {
                                return result;
                            }
                        }
                        return null;
                    })();
                }
                return null;
            };
            const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
            if (withBasenames) {
                resultExpression.allBasenames = withBasenames.allBasenames;
            }
            const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
            if (allPaths.length) {
                resultExpression.allPaths = allPaths;
            }
            return resultExpression;
        }
        const resultExpression = function (path, base, hasSibling) {
            let name = undefined;
            let resultPromises = undefined;
            for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                // Pattern matches path
                const parsedPattern = parsedPatterns[i];
                if (parsedPattern.requiresSiblings && hasSibling) {
                    if (!base) {
                        base = (0, path_1.basename)(path);
                    }
                    if (!name) {
                        name = base.substr(0, base.length - (0, path_1.extname)(path).length);
                    }
                }
                const result = parsedPattern(path, base, name, hasSibling);
                if (typeof result === 'string') {
                    return result; // immediately return as soon as the first expression matches
                }
                // If the result is a promise, we have to keep it for
                // later processing and await the result properly.
                if ((0, async_1.isThenable)(result)) {
                    if (!resultPromises) {
                        resultPromises = [];
                    }
                    resultPromises.push(result);
                }
            }
            // With result promises, we have to loop over each and
            // await the result before we can return any result.
            if (resultPromises) {
                return (async () => {
                    for (const resultPromise of resultPromises) {
                        const result = await resultPromise;
                        if (typeof result === 'string') {
                            return result;
                        }
                    }
                    return null;
                })();
            }
            return null;
        };
        const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
        if (withBasenames) {
            resultExpression.allBasenames = withBasenames.allBasenames;
        }
        const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
        if (allPaths.length) {
            resultExpression.allPaths = allPaths;
        }
        return resultExpression;
    }
    function parseExpressionPattern(pattern, value, options) {
        if (value === false) {
            return NULL; // pattern is disabled
        }
        const parsedPattern = parsePattern(pattern, options);
        if (parsedPattern === NULL) {
            return NULL;
        }
        // Expression Pattern is <boolean>
        if (typeof value === 'boolean') {
            return parsedPattern;
        }
        // Expression Pattern is <SiblingClause>
        if (value) {
            const when = value.when;
            if (typeof when === 'string') {
                const result = (path, basename, name, hasSibling) => {
                    if (!hasSibling || !parsedPattern(path, basename)) {
                        return null;
                    }
                    const clausePattern = when.replace('$(basename)', () => name);
                    const matched = hasSibling(clausePattern);
                    return (0, async_1.isThenable)(matched) ?
                        matched.then(match => match ? pattern : null) :
                        matched ? pattern : null;
                };
                result.requiresSiblings = true;
                return result;
            }
        }
        // Expression is anything
        return parsedPattern;
    }
    function aggregateBasenameMatches(parsedPatterns, result) {
        const basenamePatterns = parsedPatterns.filter(parsedPattern => !!parsedPattern.basenames);
        if (basenamePatterns.length < 2) {
            return parsedPatterns;
        }
        const basenames = basenamePatterns.reduce((all, current) => {
            const basenames = current.basenames;
            return basenames ? all.concat(basenames) : all;
        }, []);
        let patterns;
        if (result) {
            patterns = [];
            for (let i = 0, n = basenames.length; i < n; i++) {
                patterns.push(result);
            }
        }
        else {
            patterns = basenamePatterns.reduce((all, current) => {
                const patterns = current.patterns;
                return patterns ? all.concat(patterns) : all;
            }, []);
        }
        const aggregate = function (path, basename) {
            if (typeof path !== 'string') {
                return null;
            }
            if (!basename) {
                let i;
                for (i = path.length; i > 0; i--) {
                    const ch = path.charCodeAt(i - 1);
                    if (ch === 47 /* CharCode.Slash */ || ch === 92 /* CharCode.Backslash */) {
                        break;
                    }
                }
                basename = path.substr(i);
            }
            const index = basenames.indexOf(basename);
            return index !== -1 ? patterns[index] : null;
        };
        aggregate.basenames = basenames;
        aggregate.patterns = patterns;
        aggregate.allBasenames = basenames;
        const aggregatedPatterns = parsedPatterns.filter(parsedPattern => !parsedPattern.basenames);
        aggregatedPatterns.push(aggregate);
        return aggregatedPatterns;
    }
    function patternsEquals(patternsA, patternsB) {
        return (0, arrays_1.equals)(patternsA, patternsB, (a, b) => {
            if (typeof a === 'string' && typeof b === 'string') {
                return a === b;
            }
            if (typeof a !== 'string' && typeof b !== 'string') {
                return a.base === b.base && a.pattern === b.pattern;
            }
            return false;
        });
    }
    exports.patternsEquals = patternsEquals;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[14/*vs/workbench/services/search/common/getFileResults*/], __M([0/*require*/,1/*exports*/,22/*vs/editor/common/core/range*/]), function (require, exports, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFileResults = void 0;
    const getFileResults = (bytes, pattern, options) => {
        let text;
        if (bytes[0] === 0xff && bytes[1] === 0xfe) {
            text = new TextDecoder('utf-16le').decode(bytes);
        }
        else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
            text = new TextDecoder('utf-16be').decode(bytes);
        }
        else {
            text = new TextDecoder('utf8').decode(bytes);
            if (text.slice(0, 1000).includes('\uFFFD') && bytes.includes(0)) {
                return [];
            }
        }
        const results = [];
        const patternIndecies = [];
        let patternMatch = null;
        let remainingResultQuota = options.remainingResultQuota;
        while (remainingResultQuota >= 0 && (patternMatch = pattern.exec(text))) {
            patternIndecies.push({ matchStartIndex: patternMatch.index, matchedText: patternMatch[0] });
            remainingResultQuota--;
        }
        if (patternIndecies.length) {
            const contextLinesNeeded = new Set();
            const resultLines = new Set();
            const lineRanges = [];
            const readLine = (lineNumber) => text.slice(lineRanges[lineNumber].start, lineRanges[lineNumber].end);
            let prevLineEnd = 0;
            let lineEndingMatch = null;
            const lineEndRegex = /\r?\n/g;
            while ((lineEndingMatch = lineEndRegex.exec(text))) {
                lineRanges.push({ start: prevLineEnd, end: lineEndingMatch.index });
                prevLineEnd = lineEndingMatch.index + lineEndingMatch[0].length;
            }
            if (prevLineEnd < text.length) {
                lineRanges.push({ start: prevLineEnd, end: text.length });
            }
            let startLine = 0;
            for (const { matchStartIndex, matchedText } of patternIndecies) {
                if (remainingResultQuota < 0) {
                    break;
                }
                while (Boolean(lineRanges[startLine + 1]) && matchStartIndex > lineRanges[startLine].end) {
                    startLine++;
                }
                let endLine = startLine;
                while (Boolean(lineRanges[endLine + 1]) && matchStartIndex + matchedText.length > lineRanges[endLine].end) {
                    endLine++;
                }
                if (options.beforeContext) {
                    for (let contextLine = Math.max(0, startLine - options.beforeContext); contextLine < startLine; contextLine++) {
                        contextLinesNeeded.add(contextLine);
                    }
                }
                let previewText = '';
                let offset = 0;
                for (let matchLine = startLine; matchLine <= endLine; matchLine++) {
                    let previewLine = readLine(matchLine);
                    if (options.previewOptions?.charsPerLine && previewLine.length > options.previewOptions.charsPerLine) {
                        offset = Math.max(matchStartIndex - lineRanges[startLine].start - 20, 0);
                        previewLine = previewLine.substr(offset, options.previewOptions.charsPerLine);
                    }
                    previewText += `${previewLine}\n`;
                    resultLines.add(matchLine);
                }
                const fileRange = new range_1.Range(startLine, matchStartIndex - lineRanges[startLine].start, endLine, matchStartIndex + matchedText.length - lineRanges[endLine].start);
                const previewRange = new range_1.Range(0, matchStartIndex - lineRanges[startLine].start - offset, endLine - startLine, matchStartIndex + matchedText.length - lineRanges[endLine].start - (endLine === startLine ? offset : 0));
                const match = {
                    ranges: fileRange,
                    preview: { text: previewText, matches: previewRange },
                };
                results.push(match);
                if (options.afterContext) {
                    for (let contextLine = endLine + 1; contextLine <= Math.min(endLine + options.afterContext, lineRanges.length - 1); contextLine++) {
                        contextLinesNeeded.add(contextLine);
                    }
                }
            }
            for (const contextLine of contextLinesNeeded) {
                if (!resultLines.has(contextLine)) {
                    results.push({
                        text: readLine(contextLine),
                        lineNumber: contextLine + 1,
                    });
                }
            }
        }
        return results;
    };
    exports.getFileResults = getFileResults;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[15/*vs/workbench/services/search/common/ignoreFile*/], __M([0/*require*/,1/*exports*/,9/*vs/base/common/glob*/]), function (require, exports, glob) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IgnoreFile = void 0;
    class IgnoreFile {
        constructor(contents, location, parent) {
            this.location = location;
            this.parent = parent;
            if (location[location.length - 1] === '\\') {
                throw Error('Unexpected path format, do not use trailing backslashes');
            }
            if (location[location.length - 1] !== '/') {
                location += '/';
            }
            this.isPathIgnored = this.parseIgnoreFile(contents, this.location, this.parent);
        }
        /**
         * Updates the contents of the ignorefile. Preservering the location and parent
         * @param contents The new contents of the gitignore file
         */
        updateContents(contents) {
            this.isPathIgnored = this.parseIgnoreFile(contents, this.location, this.parent);
        }
        /**
         * Returns true if a path in a traversable directory has not been ignored.
         *
         * Note: For performance reasons this does not check if the parent directories have been ignored,
         * so it should always be used in tandem with `shouldTraverseDir` when walking a directory.
         *
         * In cases where a path must be tested in isolation, `isArbitraryPathIncluded` should be used.
         */
        isPathIncludedInTraversal(path, isDir) {
            if (path[0] !== '/' || path[path.length - 1] === '/') {
                throw Error('Unexpected path format, expectred to begin with slash and end without. got:' + path);
            }
            const ignored = this.isPathIgnored(path, isDir);
            return !ignored;
        }
        /**
         * Returns true if an arbitrary path has not been ignored.
         * This is an expensive operation and should only be used ouside of traversals.
         */
        isArbitraryPathIgnored(path, isDir) {
            if (path[0] !== '/' || path[path.length - 1] === '/') {
                throw Error('Unexpected path format, expectred to begin with slash and end without. got:' + path);
            }
            const segments = path.split('/').filter(x => x);
            let ignored = false;
            let walkingPath = '';
            for (let i = 0; i < segments.length; i++) {
                const isLast = i === segments.length - 1;
                const segment = segments[i];
                walkingPath = walkingPath + '/' + segment;
                if (!this.isPathIncludedInTraversal(walkingPath, isLast ? isDir : true)) {
                    ignored = true;
                    break;
                }
            }
            return ignored;
        }
        gitignoreLinesToExpression(lines, dirPath, trimForExclusions) {
            const includeLines = lines.map(line => this.gitignoreLineToGlob(line, dirPath));
            const includeExpression = Object.create(null);
            for (const line of includeLines) {
                includeExpression[line] = true;
            }
            return glob.parse(includeExpression, { trimForExclusions });
        }
        parseIgnoreFile(ignoreContents, dirPath, parent) {
            const contentLines = ignoreContents
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && line[0] !== '#');
            // Pull out all the lines that end with `/`, those only apply to directories
            const fileLines = contentLines.filter(line => !line.endsWith('/'));
            const fileIgnoreLines = fileLines.filter(line => !line.includes('!'));
            const isFileIgnored = this.gitignoreLinesToExpression(fileIgnoreLines, dirPath, true);
            // TODO: Slight hack... this naieve approach may reintroduce too many files in cases of weirdly complex .gitignores
            const fileIncludeLines = fileLines.filter(line => line.includes('!')).map(line => line.replace(/!/g, ''));
            const isFileIncluded = this.gitignoreLinesToExpression(fileIncludeLines, dirPath, false);
            // When checking if a dir is ignored we can use all lines
            const dirIgnoreLines = contentLines.filter(line => !line.includes('!'));
            const isDirIgnored = this.gitignoreLinesToExpression(dirIgnoreLines, dirPath, true);
            // Same hack.
            const dirIncludeLines = contentLines.filter(line => line.includes('!')).map(line => line.replace(/!/g, ''));
            const isDirIncluded = this.gitignoreLinesToExpression(dirIncludeLines, dirPath, false);
            const isPathIgnored = (path, isDir) => {
                if (!path.startsWith(dirPath)) {
                    return false;
                }
                if (isDir && isDirIgnored(path) && !isDirIncluded(path)) {
                    return true;
                }
                if (isFileIgnored(path) && !isFileIncluded(path)) {
                    return true;
                }
                if (parent) {
                    return parent.isPathIgnored(path, isDir);
                }
                return false;
            };
            return isPathIgnored;
        }
        gitignoreLineToGlob(line, dirPath) {
            const firstSep = line.indexOf('/');
            if (firstSep === -1 || firstSep === line.length - 1) {
                line = '**/' + line;
            }
            else {
                if (firstSep === 0) {
                    if (dirPath.slice(-1) === '/') {
                        line = line.slice(1);
                    }
                }
                else {
                    if (dirPath.slice(-1) !== '/') {
                        line = '/' + line;
                    }
                }
                line = dirPath + line;
            }
            return line;
        }
    }
    exports.IgnoreFile = IgnoreFile;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[23/*vs/workbench/services/search/worker/localFileSearch*/], __M([0/*require*/,1/*exports*/,9/*vs/base/common/glob*/,6/*vs/base/common/uri*/,4/*vs/base/common/path*/,13/*vs/base/common/cancellation*/,14/*vs/workbench/services/search/common/getFileResults*/,15/*vs/workbench/services/search/common/ignoreFile*/,3/*vs/base/common/strings*/,8/*vs/base/common/async*/,7/*vs/base/common/resources*/]), function (require, exports, glob, uri_1, paths, cancellation_1, getFileResults_1, ignoreFile_1, strings_1, async_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalFileSearchSimpleWorker = exports.create = void 0;
    const PERF = false;
    const globalStart = +new Date();
    const itrcount = {};
    const time = async (name, task) => {
        if (!PERF) {
            return task();
        }
        const start = Date.now();
        const itr = (itrcount[name] ?? 0) + 1;
        console.info(name, itr, 'starting', Math.round((start - globalStart) * 10) / 10000);
        itrcount[name] = itr;
        const r = await task();
        const end = Date.now();
        console.info(name, itr, 'took', end - start);
        return r;
    };
    /**
     * Called on the worker side
     * @internal
     */
    function create(host) {
        return new LocalFileSearchSimpleWorker(host);
    }
    exports.create = create;
    class LocalFileSearchSimpleWorker {
        constructor(host) {
            this.host = host;
            this.cancellationTokens = new Map();
        }
        cancelQuery(queryId) {
            this.cancellationTokens.get(queryId)?.cancel();
        }
        registerCancellationToken(queryId) {
            const source = new cancellation_1.CancellationTokenSource();
            this.cancellationTokens.set(queryId, source);
            return source;
        }
        async listDirectory(handle, query, folderQuery, ignorePathCasing, queryId) {
            const revivedFolderQuery = reviveFolderQuery(folderQuery);
            const extUri = new resources_1.ExtUri(() => ignorePathCasing);
            const token = this.registerCancellationToken(queryId);
            const entries = [];
            let limitHit = false;
            let count = 0;
            const max = query.maxResults || 512;
            const filePatternMatcher = query.filePattern
                ? (name) => query.filePattern.split('').every(c => name.includes(c))
                : (name) => true;
            await time('listDirectory', () => this.walkFolderQuery(handle, reviveQueryProps(query), revivedFolderQuery, extUri, file => {
                if (!filePatternMatcher(file.name)) {
                    return;
                }
                count++;
                if (max && count > max) {
                    limitHit = true;
                    token.cancel();
                }
                return entries.push(file.path);
            }, token.token));
            return {
                results: entries,
                limitHit
            };
        }
        async searchDirectory(handle, query, folderQuery, ignorePathCasing, queryId) {
            const revivedQuery = reviveFolderQuery(folderQuery);
            const extUri = new resources_1.ExtUri(() => ignorePathCasing);
            return time('searchInFiles', async () => {
                const token = this.registerCancellationToken(queryId);
                const results = [];
                const pattern = createSearchRegExp(query.contentPattern);
                const onGoingProcesses = [];
                let fileCount = 0;
                let resultCount = 0;
                const limitHit = false;
                const processFile = async (file) => {
                    if (token.token.isCancellationRequested) {
                        return;
                    }
                    fileCount++;
                    const contents = await file.resolve();
                    if (token.token.isCancellationRequested) {
                        return;
                    }
                    const bytes = new Uint8Array(contents);
                    const fileResults = (0, getFileResults_1.getFileResults)(bytes, pattern, {
                        afterContext: query.afterContext ?? 0,
                        beforeContext: query.beforeContext ?? 0,
                        previewOptions: query.previewOptions,
                        remainingResultQuota: query.maxResults ? (query.maxResults - resultCount) : 10000,
                    });
                    if (fileResults.length) {
                        resultCount += fileResults.length;
                        if (query.maxResults && resultCount > query.maxResults) {
                            token.cancel();
                        }
                        const match = {
                            resource: uri_1.URI.joinPath(revivedQuery.folder, file.path),
                            results: fileResults,
                        };
                        this.host.sendTextSearchMatch(match, queryId);
                        results.push(match);
                    }
                };
                await time('walkFolderToResolve', () => this.walkFolderQuery(handle, reviveQueryProps(query), revivedQuery, extUri, async (file) => onGoingProcesses.push(processFile(file)), token.token));
                await time('resolveOngoingProcesses', () => Promise.all(onGoingProcesses));
                if (PERF) {
                    console.log('Searched in', fileCount, 'files');
                }
                return {
                    results,
                    limitHit,
                };
            });
        }
        async walkFolderQuery(handle, queryProps, folderQuery, extUri, onFile, token) {
            const folderExcludes = glob.parse(folderQuery.excludePattern ?? {}, { trimForExclusions: true });
            // For folders, only check if the folder is explicitly excluded so walking continues.
            const isFolderExcluded = (path, basename, hasSibling) => {
                path = path.slice(1);
                if (folderExcludes(path, basename, hasSibling)) {
                    return true;
                }
                if (pathExcludedInQuery(queryProps, path)) {
                    return true;
                }
                return false;
            };
            // For files ensure the full check takes place.
            const isFileIncluded = (path, basename, hasSibling) => {
                path = path.slice(1);
                if (folderExcludes(path, basename, hasSibling)) {
                    return false;
                }
                if (!pathIncludedInQuery(queryProps, path, extUri)) {
                    return false;
                }
                return true;
            };
            const processFile = (file, prior) => {
                const resolved = {
                    type: 'file',
                    name: file.name,
                    path: prior,
                    resolve: () => file.getFile().then(r => r.arrayBuffer())
                };
                return resolved;
            };
            const isFileSystemDirectoryHandle = (handle) => {
                return handle.kind === 'directory';
            };
            const isFileSystemFileHandle = (handle) => {
                return handle.kind === 'file';
            };
            const processDirectory = async (directory, prior, ignoreFile) => {
                if (!folderQuery.disregardIgnoreFiles) {
                    const ignoreFiles = await Promise.all([
                        directory.getFileHandle('.gitignore').catch(e => undefined),
                        directory.getFileHandle('.ignore').catch(e => undefined),
                    ]);
                    await Promise.all(ignoreFiles.map(async (file) => {
                        if (!file) {
                            return;
                        }
                        const ignoreContents = new TextDecoder('utf8').decode(new Uint8Array(await (await file.getFile()).arrayBuffer()));
                        ignoreFile = new ignoreFile_1.IgnoreFile(ignoreContents, prior, ignoreFile);
                    }));
                }
                const entries = async_1.Promises.withAsyncBody(async (c) => {
                    const files = [];
                    const dirs = [];
                    const entries = [];
                    const sibilings = new Set();
                    for await (const entry of directory.entries()) {
                        entries.push(entry);
                        sibilings.add(entry[0]);
                    }
                    for (const [basename, handle] of entries) {
                        if (token.isCancellationRequested) {
                            break;
                        }
                        const path = prior + basename;
                        if (ignoreFile && !ignoreFile.isPathIncludedInTraversal(path, handle.kind === 'directory')) {
                            continue;
                        }
                        const hasSibling = (query) => sibilings.has(query);
                        if (isFileSystemDirectoryHandle(handle) && !isFolderExcluded(path, basename, hasSibling)) {
                            dirs.push(processDirectory(handle, path + '/', ignoreFile));
                        }
                        else if (isFileSystemFileHandle(handle) && isFileIncluded(path, basename, hasSibling)) {
                            files.push(processFile(handle, path));
                        }
                    }
                    c([...await Promise.all(dirs), ...files]);
                });
                return {
                    type: 'dir',
                    name: directory.name,
                    entries
                };
            };
            const resolveDirectory = async (directory, onFile) => {
                if (token.isCancellationRequested) {
                    return;
                }
                await Promise.all((await directory.entries)
                    .sort((a, b) => -(a.type === 'dir' ? 0 : 1) + (b.type === 'dir' ? 0 : 1))
                    .map(async (entry) => {
                    if (entry.type === 'dir') {
                        return resolveDirectory(entry, onFile);
                    }
                    else {
                        return onFile(entry);
                    }
                }));
            };
            const processed = await time('process', () => processDirectory(handle, '/'));
            await time('resolve', () => resolveDirectory(processed, onFile));
        }
    }
    exports.LocalFileSearchSimpleWorker = LocalFileSearchSimpleWorker;
    function createSearchRegExp(options) {
        return (0, strings_1.createRegExp)(options.pattern, !!options.isRegExp, {
            wholeWord: options.isWordMatch,
            global: true,
            matchCase: options.isCaseSensitive,
            multiline: true,
            unicode: true,
        });
    }
    function reviveFolderQuery(folderQuery) {
        return {
            ...folderQuery,
            folder: uri_1.URI.revive(folderQuery.folder),
        };
    }
    function reviveQueryProps(queryProps) {
        return {
            ...queryProps,
            extraFileResources: queryProps.extraFileResources?.map(r => uri_1.URI.revive(r)),
            folderQueries: queryProps.folderQueries.map(fq => reviveFolderQuery(fq)),
        };
    }
    function pathExcludedInQuery(queryProps, fsPath) {
        if (queryProps.excludePattern && glob.match(queryProps.excludePattern, fsPath)) {
            return true;
        }
        return false;
    }
    function pathIncludedInQuery(queryProps, path, extUri) {
        if (queryProps.excludePattern && glob.match(queryProps.excludePattern, path)) {
            return false;
        }
        if (queryProps.includePattern || queryProps.usingSearchPaths) {
            if (queryProps.includePattern && glob.match(queryProps.includePattern, path)) {
                return true;
            }
            // If searchPaths are being used, the extra file must be in a subfolder and match the pattern, if present
            if (queryProps.usingSearchPaths) {
                return !!queryProps.folderQueries && queryProps.folderQueries.some(fq => {
                    const searchPath = fq.folder;
                    const uri = uri_1.URI.file(path);
                    if (extUri.isEqualOrParent(uri, searchPath)) {
                        const relPath = paths.relative(searchPath.path, uri.path);
                        return !fq.includePattern || !!glob.match(fq.includePattern, relPath);
                    }
                    else {
                        return false;
                    }
                });
            }
            return false;
        }
        return true;
    }
});

}).call(this);
//# sourceMappingURL=localFileSearch.js.map

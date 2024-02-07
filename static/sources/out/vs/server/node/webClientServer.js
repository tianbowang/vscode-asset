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
define(["require", "exports", "fs", "vs/base/node/pfs", "path", "url", "cookie", "crypto", "vs/base/common/extpath", "vs/base/common/mime", "vs/base/common/platform", "vs/platform/log/common/log", "vs/server/node/serverEnvironmentService", "vs/base/common/path", "vs/base/common/network", "vs/base/common/uuid", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/base/common/cancellation", "vs/base/common/uri", "vs/base/common/buffer", "vs/base/common/types", "vs/platform/remote/common/remoteHosts"], function (require, exports, fs_1, pfs_1, path, url, cookie, crypto, extpath_1, mime_1, platform_1, log_1, serverEnvironmentService_1, path_1, network_1, uuid_1, productService_1, request_1, cancellation_1, uri_1, buffer_1, types_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebClientServer = exports.serveFile = exports.CacheControl = exports.serveError = void 0;
    const textMimeType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
    };
    /**
     * Return an error to the client.
     */
    async function serveError(req, res, errorCode, errorMessage) {
        res.writeHead(errorCode, { 'Content-Type': 'text/plain' });
        res.end(errorMessage);
    }
    exports.serveError = serveError;
    var CacheControl;
    (function (CacheControl) {
        CacheControl[CacheControl["NO_CACHING"] = 0] = "NO_CACHING";
        CacheControl[CacheControl["ETAG"] = 1] = "ETAG";
        CacheControl[CacheControl["NO_EXPIRY"] = 2] = "NO_EXPIRY";
    })(CacheControl || (exports.CacheControl = CacheControl = {}));
    /**
     * Serve a file at a given path or 404 if the file is missing.
     */
    async function serveFile(filePath, cacheControl, logService, req, res, responseHeaders) {
        try {
            const stat = await pfs_1.Promises.stat(filePath); // throws an error if file doesn't exist
            if (cacheControl === 1 /* CacheControl.ETAG */) {
                // Check if file modified since
                const etag = `W/"${[stat.ino, stat.size, stat.mtime.getTime()].join('-')}"`; // weak validator (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)
                if (req.headers['if-none-match'] === etag) {
                    res.writeHead(304);
                    return void res.end();
                }
                responseHeaders['Etag'] = etag;
            }
            else if (cacheControl === 2 /* CacheControl.NO_EXPIRY */) {
                responseHeaders['Cache-Control'] = 'public, max-age=31536000';
            }
            else if (cacheControl === 0 /* CacheControl.NO_CACHING */) {
                responseHeaders['Cache-Control'] = 'no-store';
            }
            responseHeaders['Content-Type'] = textMimeType[(0, path_1.extname)(filePath)] || (0, mime_1.getMediaMime)(filePath) || 'text/plain';
            res.writeHead(200, responseHeaders);
            // Data
            (0, fs_1.createReadStream)(filePath).pipe(res);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                logService.error(error);
                console.error(error.toString());
            }
            else {
                console.error(`File not found: ${filePath}`);
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return void res.end('Not found');
        }
    }
    exports.serveFile = serveFile;
    const APP_ROOT = (0, path_1.dirname)(network_1.FileAccess.asFileUri('').fsPath);
    let WebClientServer = class WebClientServer {
        constructor(_connectionToken, _environmentService, _logService, _requestService, _productService) {
            this._connectionToken = _connectionToken;
            this._environmentService = _environmentService;
            this._logService = _logService;
            this._requestService = _requestService;
            this._productService = _productService;
            this._webExtensionResourceUrlTemplate = this._productService.extensionsGallery?.resourceUrlTemplate ? uri_1.URI.parse(this._productService.extensionsGallery.resourceUrlTemplate) : undefined;
            const serverRootPath = (0, remoteHosts_1.getRemoteServerRootPath)(_productService);
            this._staticRoute = `${serverRootPath}/static`;
            this._callbackRoute = `${serverRootPath}/callback`;
            this._webExtensionRoute = `${serverRootPath}/web-extension-resource`;
        }
        /**
         * Handle web resources (i.e. only needed by the web client).
         * **NOTE**: This method is only invoked when the server has web bits.
         * **NOTE**: This method is only invoked after the connection token has been validated.
         */
        async handle(req, res, parsedUrl) {
            try {
                const pathname = parsedUrl.pathname;
                if (pathname.startsWith(this._staticRoute) && pathname.charCodeAt(this._staticRoute.length) === 47 /* CharCode.Slash */) {
                    return this._handleStatic(req, res, parsedUrl);
                }
                if (pathname === '/') {
                    return this._handleRoot(req, res, parsedUrl);
                }
                if (pathname === this._callbackRoute) {
                    // callback support
                    return this._handleCallback(res);
                }
                if (pathname.startsWith(this._webExtensionRoute) && pathname.charCodeAt(this._webExtensionRoute.length) === 47 /* CharCode.Slash */) {
                    // extension resource support
                    return this._handleWebExtensionResource(req, res, parsedUrl);
                }
                return serveError(req, res, 404, 'Not found.');
            }
            catch (error) {
                this._logService.error(error);
                console.error(error.toString());
                return serveError(req, res, 500, 'Internal Server Error.');
            }
        }
        /**
         * Handle HTTP requests for /static/*
         */
        async _handleStatic(req, res, parsedUrl) {
            const headers = Object.create(null);
            // Strip the this._staticRoute from the path
            const normalizedPathname = decodeURIComponent(parsedUrl.pathname); // support paths that are uri-encoded (e.g. spaces => %20)
            const relativeFilePath = normalizedPathname.substring(this._staticRoute.length + 1);
            const filePath = (0, path_1.join)(APP_ROOT, relativeFilePath); // join also normalizes the path
            if (!(0, extpath_1.isEqualOrParent)(filePath, APP_ROOT, !platform_1.isLinux)) {
                return serveError(req, res, 400, `Bad request.`);
            }
            return serveFile(filePath, this._environmentService.isBuilt ? 2 /* CacheControl.NO_EXPIRY */ : 1 /* CacheControl.ETAG */, this._logService, req, res, headers);
        }
        _getResourceURLTemplateAuthority(uri) {
            const index = uri.authority.indexOf('.');
            return index !== -1 ? uri.authority.substring(index + 1) : undefined;
        }
        /**
         * Handle extension resources
         */
        async _handleWebExtensionResource(req, res, parsedUrl) {
            if (!this._webExtensionResourceUrlTemplate) {
                return serveError(req, res, 500, 'No extension gallery service configured.');
            }
            // Strip `/web-extension-resource/` from the path
            const normalizedPathname = decodeURIComponent(parsedUrl.pathname); // support paths that are uri-encoded (e.g. spaces => %20)
            const path = (0, path_1.normalize)(normalizedPathname.substring(this._webExtensionRoute.length + 1));
            const uri = uri_1.URI.parse(path).with({
                scheme: this._webExtensionResourceUrlTemplate.scheme,
                authority: path.substring(0, path.indexOf('/')),
                path: path.substring(path.indexOf('/') + 1)
            });
            if (this._getResourceURLTemplateAuthority(this._webExtensionResourceUrlTemplate) !== this._getResourceURLTemplateAuthority(uri)) {
                return serveError(req, res, 403, 'Request Forbidden');
            }
            const headers = {};
            const setRequestHeader = (header) => {
                const value = req.headers[header];
                if (value && ((0, types_1.isString)(value) || value[0])) {
                    headers[header] = (0, types_1.isString)(value) ? value : value[0];
                }
                else if (header !== header.toLowerCase()) {
                    setRequestHeader(header.toLowerCase());
                }
            };
            setRequestHeader('X-Client-Name');
            setRequestHeader('X-Client-Version');
            setRequestHeader('X-Machine-Id');
            setRequestHeader('X-Client-Commit');
            const context = await this._requestService.request({
                type: 'GET',
                url: uri.toString(true),
                headers
            }, cancellation_1.CancellationToken.None);
            const status = context.res.statusCode || 500;
            if (status !== 200) {
                let text = null;
                try {
                    text = await (0, request_1.asTextOrError)(context);
                }
                catch (error) { /* Ignore */ }
                return serveError(req, res, status, text || `Request failed with status ${status}`);
            }
            const responseHeaders = Object.create(null);
            const setResponseHeader = (header) => {
                const value = context.res.headers[header];
                if (value) {
                    responseHeaders[header] = value;
                }
                else if (header !== header.toLowerCase()) {
                    setResponseHeader(header.toLowerCase());
                }
            };
            setResponseHeader('Cache-Control');
            setResponseHeader('Content-Type');
            res.writeHead(200, responseHeaders);
            const buffer = await (0, buffer_1.streamToBuffer)(context.stream);
            return void res.end(buffer.buffer);
        }
        /**
         * Handle HTTP requests for /
         */
        async _handleRoot(req, res, parsedUrl) {
            const queryConnectionToken = parsedUrl.query[network_1.connectionTokenQueryName];
            if (typeof queryConnectionToken === 'string') {
                // We got a connection token as a query parameter.
                // We want to have a clean URL, so we strip it
                const responseHeaders = Object.create(null);
                responseHeaders['Set-Cookie'] = cookie.serialize(network_1.connectionTokenCookieName, queryConnectionToken, {
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 /* 1 week */
                });
                const newQuery = Object.create(null);
                for (const key in parsedUrl.query) {
                    if (key !== network_1.connectionTokenQueryName) {
                        newQuery[key] = parsedUrl.query[key];
                    }
                }
                const newLocation = url.format({ pathname: '/', query: newQuery });
                responseHeaders['Location'] = newLocation;
                res.writeHead(302, responseHeaders);
                return void res.end();
            }
            const getFirstHeader = (headerName) => {
                const val = req.headers[headerName];
                return Array.isArray(val) ? val[0] : val;
            };
            const useTestResolver = (!this._environmentService.isBuilt && this._environmentService.args['use-test-resolver']);
            const remoteAuthority = (useTestResolver
                ? 'test+test'
                : (getFirstHeader('x-original-host') || getFirstHeader('x-forwarded-host') || req.headers.host));
            if (!remoteAuthority) {
                return serveError(req, res, 400, `Bad request.`);
            }
            function asJSON(value) {
                return JSON.stringify(value).replace(/"/g, '&quot;');
            }
            let _wrapWebWorkerExtHostInIframe = undefined;
            if (this._environmentService.args['enable-smoke-test-driver']) {
                // integration tests run at a time when the built output is not yet published to the CDN
                // so we must disable the iframe wrapping because the iframe URL will give a 404
                _wrapWebWorkerExtHostInIframe = false;
            }
            const resolveWorkspaceURI = (defaultLocation) => defaultLocation && uri_1.URI.file(path.resolve(defaultLocation)).with({ scheme: network_1.Schemas.vscodeRemote, authority: remoteAuthority });
            const filePath = network_1.FileAccess.asFileUri(this._environmentService.isBuilt ? 'vs/code/browser/workbench/workbench.html' : 'vs/code/browser/workbench/workbench-dev.html').fsPath;
            const authSessionInfo = !this._environmentService.isBuilt && this._environmentService.args['github-auth'] ? {
                id: (0, uuid_1.generateUuid)(),
                providerId: 'github',
                accessToken: this._environmentService.args['github-auth'],
                scopes: [['user:email'], ['repo']]
            } : undefined;
            const productConfiguration = {
                embedderIdentifier: 'server-distro',
                extensionsGallery: this._webExtensionResourceUrlTemplate ? {
                    ...this._productService.extensionsGallery,
                    'resourceUrlTemplate': this._webExtensionResourceUrlTemplate.with({
                        scheme: 'http',
                        authority: remoteAuthority,
                        path: `${this._webExtensionRoute}/${this._webExtensionResourceUrlTemplate.authority}${this._webExtensionResourceUrlTemplate.path}`
                    }).toString(true)
                } : undefined
            };
            if (!this._environmentService.isBuilt) {
                try {
                    const productOverrides = JSON.parse((await pfs_1.Promises.readFile((0, path_1.join)(APP_ROOT, 'product.overrides.json'))).toString());
                    Object.assign(productConfiguration, productOverrides);
                }
                catch (err) { /* Ignore Error */ }
            }
            const workbenchWebConfiguration = {
                remoteAuthority,
                _wrapWebWorkerExtHostInIframe,
                developmentOptions: { enableSmokeTestDriver: this._environmentService.args['enable-smoke-test-driver'] ? true : undefined, logLevel: this._logService.getLevel() },
                settingsSyncOptions: !this._environmentService.isBuilt && this._environmentService.args['enable-sync'] ? { enabled: true } : undefined,
                enableWorkspaceTrust: !this._environmentService.args['disable-workspace-trust'],
                folderUri: resolveWorkspaceURI(this._environmentService.args['default-folder']),
                workspaceUri: resolveWorkspaceURI(this._environmentService.args['default-workspace']),
                productConfiguration,
                callbackRoute: this._callbackRoute
            };
            const nlsBaseUrl = this._productService.extensionsGallery?.nlsBaseUrl;
            const values = {
                WORKBENCH_WEB_CONFIGURATION: asJSON(workbenchWebConfiguration),
                WORKBENCH_AUTH_SESSION: authSessionInfo ? asJSON(authSessionInfo) : '',
                WORKBENCH_WEB_BASE_URL: this._staticRoute,
                WORKBENCH_NLS_BASE_URL: nlsBaseUrl ? `${nlsBaseUrl}${!nlsBaseUrl.endsWith('/') ? '/' : ''}${this._productService.commit}/${this._productService.version}/` : '',
            };
            if (useTestResolver) {
                const bundledExtensions = [];
                for (const extensionPath of ['vscode-test-resolver', 'github-authentication']) {
                    const packageJSON = JSON.parse((await pfs_1.Promises.readFile(network_1.FileAccess.asFileUri(`${network_1.builtinExtensionsPath}/${extensionPath}/package.json`).fsPath)).toString());
                    bundledExtensions.push({ extensionPath, packageJSON });
                }
                values['WORKBENCH_BUILTIN_EXTENSIONS'] = asJSON(bundledExtensions);
            }
            let data;
            try {
                const workbenchTemplate = (await pfs_1.Promises.readFile(filePath)).toString();
                data = workbenchTemplate.replace(/\{\{([^}]+)\}\}/g, (_, key) => values[key] ?? 'undefined');
            }
            catch (e) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                return void res.end('Not found');
            }
            const webWorkerExtensionHostIframeScriptSHA = 'sha256-75NYUUvf+5++1WbfCZOV3PSWxBhONpaxwx+mkOFRv/Y=';
            const cspDirectives = [
                'default-src \'self\';',
                'img-src \'self\' https: data: blob:;',
                'media-src \'self\';',
                `script-src 'self' 'unsafe-eval' ${this._getScriptCspHashes(data).join(' ')} '${webWorkerExtensionHostIframeScriptSHA}' ${useTestResolver ? '' : `http://${remoteAuthority}`};`, // the sha is the same as in src/vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html
                'child-src \'self\';',
                `frame-src 'self' https://*.vscode-cdn.net data:;`,
                'worker-src \'self\' data: blob:;',
                'style-src \'self\' \'unsafe-inline\';',
                'connect-src \'self\' ws: wss: https:;',
                'font-src \'self\' blob:;',
                'manifest-src \'self\';'
            ].join(' ');
            const headers = {
                'Content-Type': 'text/html',
                'Content-Security-Policy': cspDirectives
            };
            if (this._connectionToken.type !== 0 /* ServerConnectionTokenType.None */) {
                // At this point we know the client has a valid cookie
                // and we want to set it prolong it to ensure that this
                // client is valid for another 1 week at least
                headers['Set-Cookie'] = cookie.serialize(network_1.connectionTokenCookieName, this._connectionToken.value, {
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 /* 1 week */
                });
            }
            res.writeHead(200, headers);
            return void res.end(data);
        }
        _getScriptCspHashes(content) {
            // Compute the CSP hashes for line scripts. Uses regex
            // which means it isn't 100% good.
            const regex = /<script>([\s\S]+?)<\/script>/img;
            const result = [];
            let match;
            while (match = regex.exec(content)) {
                const hasher = crypto.createHash('sha256');
                // This only works on Windows if we strip `\r` from `\r\n`.
                const script = match[1].replace(/\r\n/g, '\n');
                const hash = hasher
                    .update(Buffer.from(script))
                    .digest().toString('base64');
                result.push(`'sha256-${hash}'`);
            }
            return result;
        }
        /**
         * Handle HTTP requests for /callback
         */
        async _handleCallback(res) {
            const filePath = network_1.FileAccess.asFileUri('vs/code/browser/workbench/callback.html').fsPath;
            const data = (await pfs_1.Promises.readFile(filePath)).toString();
            const cspDirectives = [
                'default-src \'self\';',
                'img-src \'self\' https: data: blob:;',
                'media-src \'none\';',
                `script-src 'self' ${this._getScriptCspHashes(data).join(' ')};`,
                'style-src \'self\' \'unsafe-inline\';',
                'font-src \'self\' blob:;'
            ].join(' ');
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Security-Policy': cspDirectives
            });
            return void res.end(data);
        }
    };
    exports.WebClientServer = WebClientServer;
    exports.WebClientServer = WebClientServer = __decorate([
        __param(1, serverEnvironmentService_1.IServerEnvironmentService),
        __param(2, log_1.ILogService),
        __param(3, request_1.IRequestService),
        __param(4, productService_1.IProductService)
    ], WebClientServer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViQ2xpZW50U2VydmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvbm9kZS93ZWJDbGllbnRTZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEJoRyxNQUFNLFlBQVksR0FBRztRQUNwQixPQUFPLEVBQUUsV0FBVztRQUNwQixLQUFLLEVBQUUsaUJBQWlCO1FBQ3hCLE9BQU8sRUFBRSxrQkFBa0I7UUFDM0IsTUFBTSxFQUFFLFVBQVU7UUFDbEIsTUFBTSxFQUFFLGVBQWU7S0FDa0IsQ0FBQztJQUUzQzs7T0FFRztJQUNJLEtBQUssVUFBVSxVQUFVLENBQUMsR0FBeUIsRUFBRSxHQUF3QixFQUFFLFNBQWlCLEVBQUUsWUFBb0I7UUFDNUgsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUMzRCxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFIRCxnQ0FHQztJQUVELElBQWtCLFlBRWpCO0lBRkQsV0FBa0IsWUFBWTtRQUM3QiwyREFBVSxDQUFBO1FBQUUsK0NBQUksQ0FBQTtRQUFFLHlEQUFTLENBQUE7SUFDNUIsQ0FBQyxFQUZpQixZQUFZLDRCQUFaLFlBQVksUUFFN0I7SUFFRDs7T0FFRztJQUNJLEtBQUssVUFBVSxTQUFTLENBQUMsUUFBZ0IsRUFBRSxZQUEwQixFQUFFLFVBQXVCLEVBQUUsR0FBeUIsRUFBRSxHQUF3QixFQUFFLGVBQXVDO1FBQ2xNLElBQUksQ0FBQztZQUNKLE1BQU0sSUFBSSxHQUFHLE1BQU0sY0FBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLHdDQUF3QztZQUNwRixJQUFJLFlBQVksOEJBQXNCLEVBQUUsQ0FBQztnQkFFeEMsK0JBQStC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
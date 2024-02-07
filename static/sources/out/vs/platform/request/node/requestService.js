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
define(["require", "exports", "url", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/types", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/shell/node/shellEnv", "vs/platform/log/common/log", "vs/platform/request/common/request", "vs/platform/request/node/proxy", "zlib"], function (require, exports, url_1, async_1, buffer_1, errors_1, types_1, configuration_1, environment_1, shellEnv_1, log_1, request_1, proxy_1, zlib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodeRequest = exports.RequestService = void 0;
    /**
     * This service exposes the `request` API, while using the global
     * or configured proxy settings.
     */
    let RequestService = class RequestService extends request_1.AbstractRequestService {
        constructor(configurationService, environmentService, logService, loggerService) {
            super(loggerService);
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.logService = logService;
            this.configure();
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('http')) {
                    this.configure();
                }
            }));
        }
        configure() {
            const config = this.configurationService.getValue('http');
            this.proxyUrl = config?.proxy;
            this.strictSSL = !!config?.proxyStrictSSL;
            this.authorization = config?.proxyAuthorization;
        }
        async request(options, token) {
            const { proxyUrl, strictSSL } = this;
            let shellEnv = undefined;
            try {
                shellEnv = await (0, shellEnv_1.getResolvedShellEnv)(this.configurationService, this.logService, this.environmentService.args, process.env);
            }
            catch (error) {
                if (!this.shellEnvErrorLogged) {
                    this.shellEnvErrorLogged = true;
                    this.logService.error(`resolving shell environment failed`, (0, errors_1.getErrorMessage)(error));
                }
            }
            const env = {
                ...process.env,
                ...shellEnv
            };
            const agent = options.agent ? options.agent : await (0, proxy_1.getProxyAgent)(options.url || '', env, { proxyUrl, strictSSL });
            options.agent = agent;
            options.strictSSL = strictSSL;
            if (this.authorization) {
                options.headers = {
                    ...(options.headers || {}),
                    'Proxy-Authorization': this.authorization
                };
            }
            return this.logAndRequest(options.isChromiumNetwork ? 'electron' : 'node', options, () => nodeRequest(options, token));
        }
        async resolveProxy(url) {
            return undefined; // currently not implemented in node
        }
        async loadCertificates() {
            const proxyAgent = await new Promise((resolve_1, reject_1) => { require(['@vscode/proxy-agent'], resolve_1, reject_1); });
            return proxyAgent.loadSystemCertificates({ log: this.logService });
        }
    };
    exports.RequestService = RequestService;
    exports.RequestService = RequestService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, environment_1.INativeEnvironmentService),
        __param(2, log_1.ILogService),
        __param(3, log_1.ILoggerService)
    ], RequestService);
    async function getNodeRequest(options) {
        const endpoint = (0, url_1.parse)(options.url);
        const module = endpoint.protocol === 'https:' ? await new Promise((resolve_2, reject_2) => { require(['https'], resolve_2, reject_2); }) : await new Promise((resolve_3, reject_3) => { require(['http'], resolve_3, reject_3); });
        return module.request;
    }
    async function nodeRequest(options, token) {
        return async_1.Promises.withAsyncBody(async (resolve, reject) => {
            const endpoint = (0, url_1.parse)(options.url);
            const rawRequest = options.getRawRequest
                ? options.getRawRequest(options)
                : await getNodeRequest(options);
            const opts = {
                hostname: endpoint.hostname,
                port: endpoint.port ? parseInt(endpoint.port) : (endpoint.protocol === 'https:' ? 443 : 80),
                protocol: endpoint.protocol,
                path: endpoint.path,
                method: options.type || 'GET',
                headers: options.headers,
                agent: options.agent,
                rejectUnauthorized: (0, types_1.isBoolean)(options.strictSSL) ? options.strictSSL : true
            };
            if (options.user && options.password) {
                opts.auth = options.user + ':' + options.password;
            }
            const req = rawRequest(opts, (res) => {
                const followRedirects = (0, types_1.isNumber)(options.followRedirects) ? options.followRedirects : 3;
                if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers['location']) {
                    nodeRequest({
                        ...options,
                        url: res.headers['location'],
                        followRedirects: followRedirects - 1
                    }, token).then(resolve, reject);
                }
                else {
                    let stream = res;
                    // Responses from Electron net module should be treated as response
                    // from browser, which will apply gzip filter and decompress the response
                    // using zlib before passing the result to us. Following step can be bypassed
                    // in this case and proceed further.
                    // Refs https://source.chromium.org/chromium/chromium/src/+/main:net/url_request/url_request_http_job.cc;l=1266-1318
                    if (!options.isChromiumNetwork && res.headers['content-encoding'] === 'gzip') {
                        stream = res.pipe((0, zlib_1.createGunzip)());
                    }
                    resolve({ res, stream: (0, buffer_1.streamToBufferReadableStream)(stream) });
                }
            });
            req.on('error', reject);
            if (options.timeout) {
                req.setTimeout(options.timeout);
            }
            // Chromium will abort the request if forbidden headers are set.
            // Ref https://source.chromium.org/chromium/chromium/src/+/main:services/network/public/cpp/header_util.cc;l=14-48;
            // for additional context.
            if (options.isChromiumNetwork) {
                req.removeHeader('Content-Length');
            }
            if (options.data) {
                if (typeof options.data === 'string') {
                    req.write(options.data);
                }
            }
            req.end();
            token.onCancellationRequested(() => {
                req.abort();
                reject(new errors_1.CancellationError());
            });
        });
    }
    exports.nodeRequest = nodeRequest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlcXVlc3Qvbm9kZS9yZXF1ZXN0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQ2hHOzs7T0FHRztJQUNJLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxnQ0FBc0I7UUFTekQsWUFDeUMsb0JBQTJDLEVBQ3ZDLGtCQUE2QyxFQUMzRCxVQUF1QixFQUNyQyxhQUE2QjtZQUU3QyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFMbUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUN2Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTJCO1lBQzNELGVBQVUsR0FBVixVQUFVLENBQWE7WUFJckQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sU0FBUztZQUNoQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFpQyxNQUFNLENBQUMsQ0FBQztZQUUxRixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sRUFBRSxLQUFLLENBQUM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQztZQUMxQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQztRQUNq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
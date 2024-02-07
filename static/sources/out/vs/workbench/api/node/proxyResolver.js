/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "http", "https", "tls", "net", "vs/base/common/uri", "vs/platform/log/common/log", "@vscode/proxy-agent"], function (require, exports, http, https, tls, net, uri_1, log_1, proxy_agent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.connectProxyResolver = void 0;
    const systemCertificatesV2Default = false;
    function connectProxyResolver(extHostWorkspace, configProvider, extensionService, extHostLogService, mainThreadTelemetry, initData) {
        const useHostProxy = initData.environment.useHostProxy;
        const doUseHostProxy = typeof useHostProxy === 'boolean' ? useHostProxy : !initData.remote.isRemote;
        const params = {
            resolveProxy: url => extHostWorkspace.resolveProxy(url),
            lookupProxyAuthorization: lookupProxyAuthorization.bind(undefined, extHostLogService, mainThreadTelemetry, configProvider, {}, initData.remote.isRemote),
            getProxyURL: () => configProvider.getConfiguration('http').get('proxy'),
            getProxySupport: () => configProvider.getConfiguration('http').get('proxySupport') || 'off',
            addCertificatesV1: () => certSettingV1(configProvider),
            addCertificatesV2: () => certSettingV2(configProvider),
            log: extHostLogService,
            getLogLevel: () => {
                const level = extHostLogService.getLevel();
                switch (level) {
                    case log_1.LogLevel.Trace: return proxy_agent_1.LogLevel.Trace;
                    case log_1.LogLevel.Debug: return proxy_agent_1.LogLevel.Debug;
                    case log_1.LogLevel.Info: return proxy_agent_1.LogLevel.Info;
                    case log_1.LogLevel.Warning: return proxy_agent_1.LogLevel.Warning;
                    case log_1.LogLevel.Error: return proxy_agent_1.LogLevel.Error;
                    case log_1.LogLevel.Off: return proxy_agent_1.LogLevel.Off;
                    default: return never(level);
                }
                function never(level) {
                    extHostLogService.error('Unknown log level', level);
                    return proxy_agent_1.LogLevel.Debug;
                }
            },
            proxyResolveTelemetry: () => { },
            useHostProxy: doUseHostProxy,
            loadAdditionalCertificates: async () => {
                const promises = [];
                if (initData.remote.isRemote) {
                    promises.push((0, proxy_agent_1.loadSystemCertificates)({ log: extHostLogService }));
                }
                if (doUseHostProxy) {
                    extHostLogService.trace('ProxyResolver#loadAdditionalCertificates: Loading certificates from main process');
                    const certs = extHostWorkspace.loadCertificates(); // Loading from main process to share cache.
                    certs.then(certs => extHostLogService.trace('ProxyResolver#loadAdditionalCertificates: Loaded certificates from main process', certs.length));
                    promises.push(certs);
                }
                return (await Promise.all(promises)).flat();
            },
            env: process.env,
        };
        const resolveProxy = (0, proxy_agent_1.createProxyResolver)(params);
        const lookup = createPatchedModules(params, resolveProxy);
        return configureModuleLoading(extensionService, lookup);
    }
    exports.connectProxyResolver = connectProxyResolver;
    function createPatchedModules(params, resolveProxy) {
        return {
            http: Object.assign(http, (0, proxy_agent_1.createHttpPatch)(params, http, resolveProxy)),
            https: Object.assign(https, (0, proxy_agent_1.createHttpPatch)(params, https, resolveProxy)),
            net: Object.assign(net, (0, proxy_agent_1.createNetPatch)(params, net)),
            tls: Object.assign(tls, (0, proxy_agent_1.createTlsPatch)(params, tls))
        };
    }
    function certSettingV1(configProvider) {
        const http = configProvider.getConfiguration('http');
        return !http.get('experimental.systemCertificatesV2', systemCertificatesV2Default) && !!http.get('systemCertificates');
    }
    function certSettingV2(configProvider) {
        const http = configProvider.getConfiguration('http');
        return !!http.get('experimental.systemCertificatesV2', systemCertificatesV2Default) && !!http.get('systemCertificates');
    }
    const modulesCache = new Map();
    function configureModuleLoading(extensionService, lookup) {
        return extensionService.getExtensionPathIndex()
            .then(extensionPaths => {
            const node_module = globalThis._VSCODE_NODE_MODULES.module;
            const original = node_module._load;
            node_module._load = function load(request, parent, isMain) {
                if (request === 'net') {
                    return lookup.net;
                }
                if (request === 'tls') {
                    return lookup.tls;
                }
                if (request !== 'http' && request !== 'https') {
                    return original.apply(this, arguments);
                }
                const ext = extensionPaths.findSubstr(uri_1.URI.file(parent.filename));
                let cache = modulesCache.get(ext);
                if (!cache) {
                    modulesCache.set(ext, cache = {});
                }
                if (!cache[request]) {
                    const mod = lookup[request];
                    cache[request] = { ...mod }; // Copy to work around #93167.
                }
                return cache[request];
            };
        });
    }
    async function lookupProxyAuthorization(extHostLogService, mainThreadTelemetry, configProvider, proxyAuthenticateCache, isRemote, proxyURL, proxyAuthenticate, state) {
        const cached = proxyAuthenticateCache[proxyURL];
        if (proxyAuthenticate) {
            proxyAuthenticateCache[proxyURL] = proxyAuthenticate;
        }
        extHostLogService.trace('ProxyResolver#lookupProxyAuthorization callback', `proxyURL:${proxyURL}`, `proxyAuthenticate:${proxyAuthenticate}`, `proxyAuthenticateCache:${cached}`);
        const header = proxyAuthenticate || cached;
        const authenticate = Array.isArray(header) ? header : typeof header === 'string' ? [header] : [];
        sendTelemetry(mainThreadTelemetry, authenticate, isRemote);
        if (authenticate.some(a => /^(Negotiate|Kerberos)( |$)/i.test(a)) && !state.kerberosRequested) {
            try {
                state.kerberosRequested = true;
                const kerberos = await new Promise((resolve_1, reject_1) => { require(['kerberos'], resolve_1, reject_1); });
                const url = new URL(proxyURL);
                const spn = configProvider.getConfiguration('http').get('proxyKerberosServicePrincipal')
                    || (process.platform === 'win32' ? `HTTP/${url.hostname}` : `HTTP@${url.hostname}`);
                extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Kerberos authentication lookup', `proxyURL:${proxyURL}`, `spn:${spn}`);
                const client = await kerberos.initializeClient(spn);
                const response = await client.step('');
                return 'Negotiate ' + response;
            }
            catch (err) {
                extHostLogService.error('ProxyResolver#lookupProxyAuthorization Kerberos authentication failed', err);
            }
        }
        return undefined;
    }
    let telemetrySent = false;
    function sendTelemetry(mainThreadTelemetry, authenticate, isRemote) {
        if (telemetrySent || !authenticate.length) {
            return;
        }
        telemetrySent = true;
        mainThreadTelemetry.$publicLog2('proxyAuthenticationRequest', {
            authenticationType: authenticate.map(a => a.split(' ')[0]).join(','),
            extensionHostType: isRemote ? 'remote' : 'local',
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHlSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9ub2RlL3Byb3h5UmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFNLDJCQUEyQixHQUFHLEtBQUssQ0FBQztJQUUxQyxTQUFnQixvQkFBb0IsQ0FDbkMsZ0JBQTJDLEVBQzNDLGNBQXFDLEVBQ3JDLGdCQUF5QyxFQUN6QyxpQkFBOEIsRUFDOUIsbUJBQTZDLEVBQzdDLFFBQWdDO1FBRWhDLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDO1FBQ3ZELE1BQU0sY0FBYyxHQUFHLE9BQU8sWUFBWSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ3BHLE1BQU0sTUFBTSxHQUFxQjtZQUNoQyxZQUFZLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDO1lBQ3ZELHdCQUF3QixFQUFFLHdCQUF3QixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUN4SixXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7WUFDdkUsZUFBZSxFQUFFLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQXNCLGNBQWMsQ0FBQyxJQUFJLEtBQUs7WUFDaEgsaUJBQWlCLEVBQUUs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
(function anonymous() { /*---------------------------------------------------------------------------------------------
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
define(["require", "exports", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log"], function (require, exports, event_1, configuration_1, instantiation_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractTunnelService = exports.DisposableTunnel = exports.isPortPrivileged = exports.isAllInterfaces = exports.ALL_INTERFACES_ADDRESSES = exports.isLocalhost = exports.LOCALHOST_ADDRESSES = exports.extractLocalHostUriMetaDataForPortMapping = exports.ProvidedOnAutoForward = exports.isTunnelProvider = exports.TunnelPrivacyId = exports.TunnelProtocol = exports.ISharedTunnelsService = exports.ITunnelService = void 0;
    exports.ITunnelService = (0, instantiation_1.createDecorator)('tunnelService');
    exports.ISharedTunnelsService = (0, instantiation_1.createDecorator)('sharedTunnelsService');
    var TunnelProtocol;
    (function (TunnelProtocol) {
        TunnelProtocol["Http"] = "http";
        TunnelProtocol["Https"] = "https";
    })(TunnelProtocol || (exports.TunnelProtocol = TunnelProtocol = {}));
    var TunnelPrivacyId;
    (function (TunnelPrivacyId) {
        TunnelPrivacyId["ConstantPrivate"] = "constantPrivate";
        TunnelPrivacyId["Private"] = "private";
        TunnelPrivacyId["Public"] = "public";
    })(TunnelPrivacyId || (exports.TunnelPrivacyId = TunnelPrivacyId = {}));
    function isTunnelProvider(addressOrTunnelProvider) {
        return !!addressOrTunnelProvider.forwardPort;
    }
    exports.isTunnelProvider = isTunnelProvider;
    var ProvidedOnAutoForward;
    (function (ProvidedOnAutoForward) {
        ProvidedOnAutoForward[ProvidedOnAutoForward["Notify"] = 1] = "Notify";
        ProvidedOnAutoForward[ProvidedOnAutoForward["OpenBrowser"] = 2] = "OpenBrowser";
        ProvidedOnAutoForward[ProvidedOnAutoForward["OpenPreview"] = 3] = "OpenPreview";
        ProvidedOnAutoForward[ProvidedOnAutoForward["Silent"] = 4] = "Silent";
        ProvidedOnAutoForward[ProvidedOnAutoForward["Ignore"] = 5] = "Ignore";
        ProvidedOnAutoForward[ProvidedOnAutoForward["OpenBrowserOnce"] = 6] = "OpenBrowserOnce";
    })(ProvidedOnAutoForward || (exports.ProvidedOnAutoForward = ProvidedOnAutoForward = {}));
    function extractLocalHostUriMetaDataForPortMapping(uri) {
        if (uri.scheme !== 'http' && uri.scheme !== 'https') {
            return undefined;
        }
        const localhostMatch = /^(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)$/.exec(uri.authority);
        if (!localhostMatch) {
            return undefined;
        }
        return {
            address: localhostMatch[1],
            port: +localhostMatch[2],
        };
    }
    exports.extractLocalHostUriMetaDataForPortMapping = extractLocalHostUriMetaDataForPortMapping;
    exports.LOCALHOST_ADDRESSES = ['localhost', '127.0.0.1', '0:0:0:0:0:0:0:1', '::1'];
    function isLocalhost(host) {
        return exports.LOCALHOST_ADDRESSES.indexOf(host) >= 0;
    }
    exports.isLocalhost = isLocalhost;
    exports.ALL_INTERFACES_ADDRESSES = ['0.0.0.0', '0:0:0:0:0:0:0:0', '::'];
    function isAllInterfaces(host) {
        return exports.ALL_INTERFACES_ADDRESSES.indexOf(host) >= 0;
    }
    exports.isAllInterfaces = isAllInterfaces;
    function isPortPrivileged(port, host, os, osRelease) {
        if (os === 1 /* OperatingSystem.Windows */) {
            return false;
        }
        if (os === 2 /* OperatingSystem.Macintosh */) {
            if (isAllInterfaces(host)) {
                const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(osRelease);
                if (osVersion?.length === 4) {
                    const major = parseInt(osVersion[1]);
                    if (major >= 18 /* since macOS Mojave, darwin version 18.0.0 */) {
                        return false;
                    }
                }
            }
        }
        return port < 1024;
    }
    exports.isPortPrivileged = isPortPrivileged;
    class DisposableTunnel {
        constructor(remoteAddress, localAddress, _dispose) {
            this.remoteAddress = remoteAddress;
            this.localAddress = localAddress;
            this._dispose = _dispose;
            this._onDispose = new event_1.Emitter();
            this.onDidDispose = this._onDispose.event;
        }
        dispose() {
            this._onDispose.fire();
            return this._dispose();
        }
    }
    exports.DisposableTunnel = DisposableTunnel;
    let AbstractTunnelService = class AbstractTunnelService {
        constructor(logService, configurationService) {
            this.logService = logService;
            this.configurationService = configurationService;
            this._onTunnelOpened = new event_1.Emitter();
            this.onTunnelOpened = this._onTunnelOpened.event;
            this._onTunnelClosed = new event_1.Emitter();
            this.onTunnelClosed = this._onTunnelClosed.event;
            this._onAddedTunnelProvider = new event_1.Emitter();
            this.onAddedTunnelProvider = this._onAddedTunnelProvider.event;
            this._tunnels = new Map();
            this._canElevate = false;
            this._canChangeProtocol = true;
            this._privacyOptions = [];
            this._factoryInProgress = new Set();
        }
        get hasTunnelProvider() {
            return !!this._tunnelProvider;
        }
        get defaultTunnelHost() {
            const settingValue = this.configurationService.getValue('remote.localPortHost');
            return (!settingValue || settingValue === 'localhost') ? '127.0.0.1' : '0.0.0.0';
        }
        setTunnelProvider(provider) {
            this._tunnelProvider = provider;
            if (!provider) {
                // clear features
                this._canElevate = false;
                this._privacyOptions = [];
                this._onAddedTunnelProvider.fire();
                return {
                    dispose: () => { }
                };
            }
            this._onAddedTunnelProvider.fire();
            return {
                dispose: () => {
                    this._tunnelProvider = undefined;
                    this._canElevate = false;
                    this._privacyOptions = [];
                }
            };
        }
        setTunnelFeatures(features) {
            this._canElevate = features.elevation;
            this._privacyOptions = features.privacyOptions;
            this._canChangeProtocol = features.protocol;
        }
        get canChangeProtocol() {
            return this._canChangeProtocol;
        }
        get canElevate() {
            return this._canElevate;
        }
        get canChangePrivacy() {
            return this._privacyOptions.length > 0;
        }
        get privacyOptions() {
            return this._privacyOptions;
        }
        get tunnels() {
            return this.getTunnels();
        }
        async getTunnels() {
            const tunnels = [];
            const tunnelArray = Array.from(this._tunnels.values());
            for (const portMap of tunnelArray) {
                const portArray = Array.from(portMap.values());
                for (const x of portArray) {
                    const tunnelValue = await x.value;
                    if (tunnelValue && (typeof tunnelValue !== 'string')) {
                        tunnels.push(tunnelValue);
                    }
                }
            }
            return tunnels;
        }
        async dispose() {
            for (const portMap of this._tunnels.values()) {
                for (const { value } of portMap.values()) {
                    await value.then(tunnel => typeof tunnel !== 'string' ? tunnel?.dispose() : undefined);
                }
                portMap.clear();
            }
            this._tunnels.clear();
        }
        setEnvironmentTunnel(remoteHost, remotePort, localAddress, privacy, protocol) {
            this.addTunnelToMap(remoteHost, remotePort, Promise.resolve({
                tunnelRemoteHost: remoteHost,
                tunnelRemotePort: remotePort,
                localAddress,
                privacy,
                protocol,
                dispose: () => Promise.resolve()
            }));
        }
        async getExistingTunnel(remoteHost, remotePort) {
            if (isAllInterfaces(remoteHost) || isLocalhost(remoteHost)) {
                remoteHost = exports.LOCALHOST_ADDRESSES[0];
            }
            const existing = this.getTunnelFromMap(remoteHost, remotePort);
            if (existing) {
                ++existing.refcount;
                return existing.value;
            }
            return undefined;
        }
        openTunnel(addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded = false, privacy, protocol) {
            this.logService.trace(`ForwardedPorts: (TunnelService) openTunnel request for ${remoteHost}:${remotePort} on local port ${localPort}.`);
            const addressOrTunnelProvider = this._tunnelProvider ?? addressProvider;
            if (!addressOrTunnelProvider) {
                return undefined;
            }
            if (!remoteHost) {
                remoteHost = 'localhost';
            }
            if (!localHost) {
                localHost = this.defaultTunnelHost;
            }
            // Prevent tunnel factories from calling openTunnel from within the factory
            if (this._tunnelProvider && this._factoryInProgress.has(remotePort)) {
                this.logService.debug(`ForwardedPorts: (TunnelService) Another call to create a tunnel with the same address has occurred before the last one completed. This call will be ignored.`);
                return;
            }
            const resolvedTunnel = this.retainOrCreateTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol);
            if (!resolvedTunnel) {
                this.logService.trace(`ForwardedPorts: (TunnelService) Tunnel was not created.`);
                return resolvedTunnel;
            }
            return resolvedTunnel.then(tunnel => {
                if (!tunnel) {
                    this.logService.trace('ForwardedPorts: (TunnelService) New tunnel is undefined.');
                    this.removeEmptyOrErrorTunnelFromMap(remoteHost, remotePort);
                    return undefined;
                }
                else if (typeof tunnel === 'string') {
                    this.logService.trace('ForwardedPorts: (TunnelService) The tunnel provider returned an error when creating the tunnel.');
                    this.removeEmptyOrErrorTunnelFromMap(remoteHost, remotePort);
                    return tunnel;
                }
                this.logService.trace('ForwardedPorts: (TunnelService) New tunnel established.');
                const newTunnel = this.makeTunnel(tunnel);
                if (tunnel.tunnelRemoteHost !== remoteHost || tunnel.tunnelRemotePort !== remotePort) {
                    this.logService.warn('ForwardedPorts: (TunnelService) Created tunnel does not match requirements of requested tunnel. Host or port mismatch.');
                }
                if (privacy && tunnel.privacy !== privacy) {
                    this.logService.warn('ForwardedPorts: (TunnelService) Created tunnel does not match requirements of requested tunnel. Privacy mismatch.');
                }
                this._onTunnelOpened.fire(newTunnel);
                return newTunnel;
            });
        }
        makeTunnel(tunnel) {
            return {
                tunnelRemotePort: tunnel.tunnelRemotePort,
                tunnelRemoteHost: tunnel.tunnelRemoteHost,
                tunnelLocalPort: tunnel.tunnelLocalPort,
                localAddress: tunnel.localAddress,
                privacy: tunnel.privacy,
                protocol: tunnel.protocol,
                dispose: async () => {
                    this.logService.trace(`ForwardedPorts: (TunnelService) dispose request for ${tunnel.tunnelRemoteHost}:${tunnel.tunnelRemotePort} `);
                    const existingHost = this._tunnels.get(tunnel.tunnelRemoteHost);
                    if (existingHost) {
                        const existing = existingHost.get(tunnel.tunnelRemotePort);
                        if (existing) {
                            existing.refcount--;
                            await this.tryDisposeTunnel(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort, existing);
                        }
                    }
                }
            };
        }
        async tryDisposeTunnel(remoteHost, remotePort, tunnel) {
            if (tunnel.refcount <= 0) {
                this.logService.trace(`ForwardedPorts: (TunnelService) Tunnel is being disposed ${remoteHost}:${remotePort}.`);
                const disposePromise = tunnel.value.then(async (tunnel) => {
                    if (tunnel && (typeof tunnel !== 'string')) {
                        await tunnel.dispose(true);
                        this._onTunnelClosed.fire({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort });
                    }
                });
                if (this._tunnels.has(remoteHost)) {
                    this._tunnels.get(remoteHost).delete(remotePort);
                }
                return disposePromise;
            }
        }
        async closeTunnel(remoteHost, remotePort) {
            this.logService.trace(`ForwardedPorts: (TunnelService) close request for ${remoteHost}:${remotePort} `);
            const portMap = this._tunnels.get(remoteHost);
            if (portMap && portMap.has(remotePort)) {
                const value = portMap.get(remotePort);
                value.refcount = 0;
                await this.tryDisposeTunnel(remoteHost, remotePort, value);
            }
        }
        addTunnelToMap(remoteHost, remotePort, tunnel) {
            if (!this._tunnels.has(remoteHost)) {
                this._tunnels.set(remoteHost, new Map());
            }
            this._tunnels.get(remoteHost).set(remotePort, { refcount: 1, value: tunnel });
        }
        async removeEmptyOrErrorTunnelFromMap(remoteHost, remotePort) {
            const hostMap = this._tunnels.get(remoteHost);
            if (hostMap) {
                const tunnel = hostMap.get(remotePort);
                const tunnelResult = tunnel ? await tunnel.value : undefined;
                if (!tunnelResult || (typeof tunnelResult === 'string')) {
                    hostMap.delete(remotePort);
                }
                if (hostMap.size === 0) {
                    this._tunnels.delete(remoteHost);
                }
            }
        }
        getTunnelFromMap(remoteHost, remotePort) {
            const hosts = [remoteHost];
            // Order matters. We want the original host to be first.
            if (isLocalhost(remoteHost)) {
                hosts.push(...exports.LOCALHOST_ADDRESSES);
                // For localhost, we add the all interfaces hosts because if the tunnel is already available at all interfaces,
                // then of course it is available at localhost.
                hosts.push(...exports.ALL_INTERFACES_ADDRESSES);
            }
            else if (isAllInterfaces(remoteHost)) {
                hosts.push(...exports.ALL_INTERFACES_ADDRESSES);
            }
            const existingPortMaps = hosts.map(host => this._tunnels.get(host));
            for (const map of existingPortMaps) {
                const existingTunnel = map?.get(remotePort);
                if (existingTunnel) {
                    return existingTunnel;
                }
            }
            return undefined;
        }
        canTunnel(uri) {
            return !!extractLocalHostUriMetaDataForPortMapping(uri);
        }
        createWithProvider(tunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol) {
            this.logService.trace(`ForwardedPorts: (TunnelService) Creating tunnel with provider ${remoteHost}:${remotePort} on local port ${localPort}.`);
            const key = remotePort;
            this._factoryInProgress.add(key);
            const preferredLocalPort = localPort === undefined ? remotePort : localPort;
            const creationInfo = { elevationRequired: elevateIfNeeded ? this.isPortPrivileged(preferredLocalPort) : false };
            const tunnelOptions = { remoteAddress: { host: remoteHost, port: remotePort }, localAddressPort: localPort, privacy, public: privacy ? (privacy !== TunnelPrivacyId.Private) : undefined, protocol };
            const tunnel = tunnelProvider.forwardPort(tunnelOptions, creationInfo);
            if (tunnel) {
                this.addTunnelToMap(remoteHost, remotePort, tunnel);
                tunnel.finally(() => {
                    this.logService.trace('ForwardedPorts: (TunnelService) Tunnel created by provider.');
                    this._factoryInProgress.delete(key);
                });
            }
            else {
                this._factoryInProgress.delete(key);
            }
            return tunnel;
        }
    };
    exports.AbstractTunnelService = AbstractTunnelService;
    exports.AbstractTunnelService = AbstractTunnelService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, configuration_1.IConfigurationService)
    ], AbstractTunnelService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVubmVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90dW5uZWwvY29tbW9uL3R1bm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhbkYsUUFBQSxjQUFjLEdBQUcsSUFBQSwrQkFBZSxFQUFpQixlQUFlLENBQUMsQ0FBQztJQUNsRSxRQUFBLHFCQUFxQixHQUFHLElBQUEsK0JBQWUsRUFBd0Isc0JBQXNCLENBQUMsQ0FBQztJQXFCcEcsSUFBWSxjQUdYO0lBSEQsV0FBWSxjQUFjO1FBQ3pCLCtCQUFhLENBQUE7UUFDYixpQ0FBZSxDQUFBO0lBQ2hCLENBQUMsRUFIVyxjQUFjLDhCQUFkLGNBQWMsUUFHekI7SUFFRCxJQUFZLGVBSVg7SUFKRCxXQUFZLGVBQWU7UUFDMUIsc0RBQW1DLENBQUE7UUFDbkMsc0NBQW1CLENBQUE7UUFDbkIsb0NBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQUpXLGVBQWUsK0JBQWYsZUFBZSxRQUkxQjtJQW9CRCxTQUFnQixnQkFBZ0IsQ0FBQyx1QkFBMkQ7UUFDM0YsT0FBTyxDQUFDLENBQUUsdUJBQTJDLENBQUMsV0FBVyxDQUFDO0lBQ25FLENBQUM7SUFGRCw0Q0FFQztJQUVELElBQVkscUJBT1g7SUFQRCxXQUFZLHFCQUFxQjtRQUNoQyxxRUFBVSxDQUFBO1FBQ1YsK0VBQWUsQ0FBQTtRQUNmLCtFQUFlLENBQUE7UUFDZixxRUFBVSxDQUFBO1FBQ1YscUVBQVUsQ0FBQTtRQUNWLHVGQUFtQixDQUFBO0lBQ3BCLENBQUMsRUFQVyxxQkFBcUIscUNBQXJCLHFCQUFxQixRQU9oQztJQWlFRCxTQUFnQix5Q0FBeUMsQ0FBQyxHQUFRO1FBQ2pFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxPQUFPLEVBQUUsQ0FBQztZ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
//# sourceURL=../../../vs/platform/tunnel/common/tunnel.js
})
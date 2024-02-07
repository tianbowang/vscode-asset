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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/tunnel/common/tunnel", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypes"], function (require, exports, cancellation_1, event_1, lifecycle_1, nls, instantiation_1, log_1, tunnel_1, extHost_protocol_1, extHostInitDataService_1, extHostRpcService_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTunnelService = exports.IExtHostTunnelService = exports.TunnelDtoConverter = void 0;
    class ExtensionTunnel extends tunnel_1.DisposableTunnel {
    }
    var TunnelDtoConverter;
    (function (TunnelDtoConverter) {
        function fromApiTunnel(tunnel) {
            return {
                remoteAddress: tunnel.remoteAddress,
                localAddress: tunnel.localAddress,
                public: !!tunnel.public,
                privacy: tunnel.privacy ?? (tunnel.public ? tunnel_1.TunnelPrivacyId.Public : tunnel_1.TunnelPrivacyId.Private),
                protocol: tunnel.protocol
            };
        }
        TunnelDtoConverter.fromApiTunnel = fromApiTunnel;
        function fromServiceTunnel(tunnel) {
            return {
                remoteAddress: {
                    host: tunnel.tunnelRemoteHost,
                    port: tunnel.tunnelRemotePort
                },
                localAddress: tunnel.localAddress,
                public: tunnel.privacy !== tunnel_1.TunnelPrivacyId.ConstantPrivate && tunnel.privacy !== tunnel_1.TunnelPrivacyId.ConstantPrivate,
                privacy: tunnel.privacy,
                protocol: tunnel.protocol
            };
        }
        TunnelDtoConverter.fromServiceTunnel = fromServiceTunnel;
    })(TunnelDtoConverter || (exports.TunnelDtoConverter = TunnelDtoConverter = {}));
    exports.IExtHostTunnelService = (0, instantiation_1.createDecorator)('IExtHostTunnelService');
    let ExtHostTunnelService = class ExtHostTunnelService extends lifecycle_1.Disposable {
        constructor(extHostRpc, initData, logService) {
            super();
            this.logService = logService;
            this._showCandidatePort = () => { return Promise.resolve(true); };
            this._extensionTunnels = new Map();
            this._onDidChangeTunnels = new event_1.Emitter();
            this.onDidChangeTunnels = this._onDidChangeTunnels.event;
            this._providerHandleCounter = 0;
            this._portAttributesProviders = new Map();
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadTunnelService);
        }
        async openTunnel(extension, forward) {
            this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) ${extension.identifier.value} called openTunnel API for ${forward.remoteAddress.host}:${forward.remoteAddress.port}.`);
            const tunnel = await this._proxy.$openTunnel(forward, extension.displayName);
            if (tunnel) {
                const disposableTunnel = new ExtensionTunnel(tunnel.remoteAddress, tunnel.localAddress, () => {
                    return this._proxy.$closeTunnel(tunnel.remoteAddress);
                });
                this._register(disposableTunnel);
                return disposableTunnel;
            }
            return undefined;
        }
        async getTunnels() {
            return this._proxy.$getTunnels();
        }
        nextPortAttributesProviderHandle() {
            return this._providerHandleCounter++;
        }
        registerPortsAttributesProvider(portSelector, provider) {
            const providerHandle = this.nextPortAttributesProviderHandle();
            this._portAttributesProviders.set(providerHandle, { selector: portSelector, provider });
            this._proxy.$registerPortsAttributesProvider(portSelector, providerHandle);
            return new types.Disposable(() => {
                this._portAttributesProviders.delete(providerHandle);
                this._proxy.$unregisterPortsAttributesProvider(providerHandle);
            });
        }
        async $providePortAttributes(handles, ports, pid, commandLine, cancellationToken) {
            const providedAttributes = [];
            for (const handle of handles) {
                const provider = this._portAttributesProviders.get(handle);
                if (!provider) {
                    return [];
                }
                providedAttributes.push(...(await Promise.all(ports.map(async (port) => {
                    let providedAttributes;
                    try {
                        providedAttributes = await provider.provider.providePortAttributes({ port, pid, commandLine }, cancellationToken);
                    }
                    catch (e) {
                        // Call with old signature for breaking API change
                        providedAttributes = await provider.provider.providePortAttributes(port, pid, commandLine, cancellationToken);
                    }
                    return { providedAttributes, port };
                }))));
            }
            const allAttributes = providedAttributes.filter(attribute => !!attribute.providedAttributes);
            return (allAttributes.length > 0) ? allAttributes.map(attributes => {
                return {
                    autoForwardAction: attributes.providedAttributes.autoForwardAction,
                    port: attributes.port
                };
            }) : [];
        }
        async $registerCandidateFinder(_enable) { }
        registerTunnelProvider(provider, information) {
            if (this._forwardPortProvider) {
                throw new Error('A tunnel provider has already been registered. Only the first tunnel provider to be registered will be used.');
            }
            this._forwardPortProvider = async (tunnelOptions, tunnelCreationOptions) => {
                const result = await provider.provideTunnel(tunnelOptions, tunnelCreationOptions, new cancellation_1.CancellationTokenSource().token);
                return result ?? undefined;
            };
            const tunnelFeatures = information.tunnelFeatures ? {
                elevation: !!information.tunnelFeatures?.elevation,
                privacyOptions: information.tunnelFeatures?.privacyOptions,
                protocol: information.tunnelFeatures.protocol === undefined ? true : information.tunnelFeatures.protocol,
            } : undefined;
            this._proxy.$setTunnelProvider(tunnelFeatures);
            return Promise.resolve((0, lifecycle_1.toDisposable)(() => {
                this._forwardPortProvider = undefined;
                this._proxy.$setTunnelProvider(undefined);
            }));
        }
        /**
         * Applies the tunnel metadata and factory found in the remote authority
         * resolver to the tunnel system.
         *
         * `managedRemoteAuthority` should be be passed if the resolver returned on.
         * If this is the case, the tunnel cannot be connected to via a websocket from
         * the share process, so a synethic tunnel factory is used as a default.
         */
        async setTunnelFactory(provider, managedRemoteAuthority) {
            // Do not wait for any of the proxy promises here.
            // It will delay startup and there is nothing that needs to be waited for.
            if (provider) {
                if (provider.candidatePortSource !== undefined) {
                    this._proxy.$setCandidatePortSource(provider.candidatePortSource);
                }
                if (provider.showCandidatePort) {
                    this._showCandidatePort = provider.showCandidatePort;
                    this._proxy.$setCandidateFilter();
                }
                const tunnelFactory = provider.tunnelFactory ?? (managedRemoteAuthority ? this.makeManagedTunnelFactory(managedRemoteAuthority) : undefined);
                if (tunnelFactory) {
                    this._forwardPortProvider = tunnelFactory;
                    let privacyOptions = provider.tunnelFeatures?.privacyOptions ?? [];
                    if (provider.tunnelFeatures?.public && (privacyOptions.length === 0)) {
                        privacyOptions = [
                            {
                                id: 'private',
                                label: nls.localize('tunnelPrivacy.private', "Private"),
                                themeIcon: 'lock'
                            },
                            {
                                id: 'public',
                                label: nls.localize('tunnelPrivacy.public', "Public"),
                                themeIcon: 'eye'
                            }
                        ];
                    }
                    const tunnelFeatures = provider.tunnelFeatures ? {
                        elevation: !!provider.tunnelFeatures?.elevation,
                        public: !!provider.tunnelFeatures?.public,
                        privacyOptions,
                        protocol: true
                    } : undefined;
                    this._proxy.$setTunnelProvider(tunnelFeatures);
                }
            }
            else {
                this._forwardPortProvider = undefined;
            }
            return (0, lifecycle_1.toDisposable)(() => {
                this._forwardPortProvider = undefined;
            });
        }
        makeManagedTunnelFactory(_authority) {
            return undefined; // may be overridden
        }
        async $closeTunnel(remote, silent) {
            if (this._extensionTunnels.has(remote.host)) {
                const hostMap = this._extensionTunnels.get(remote.host);
                if (hostMap.has(remote.port)) {
                    if (silent) {
                        hostMap.get(remote.port).disposeListener.dispose();
                    }
                    await hostMap.get(remote.port).tunnel.dispose();
                    hostMap.delete(remote.port);
                }
            }
        }
        async $onDidTunnelsChange() {
            this._onDidChangeTunnels.fire();
        }
        async $forwardPort(tunnelOptions, tunnelCreationOptions) {
            if (this._forwardPortProvider) {
                try {
                    this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Getting tunnel from provider.');
                    const providedPort = this._forwardPortProvider(tunnelOptions, tunnelCreationOptions);
                    this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Got tunnel promise from provider.');
                    if (providedPort !== undefined) {
                        const tunnel = await providedPort;
                        this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Successfully awaited tunnel from provider.');
                        if (tunnel === undefined) {
                            this.logService.error('ForwardedPorts: (ExtHostTunnelService) Resolved tunnel is undefined');
                            return undefined;
                        }
                        if (!this._extensionTunnels.has(tunnelOptions.remoteAddress.host)) {
                            this._extensionTunnels.set(tunnelOptions.remoteAddress.host, new Map());
                        }
                        const disposeListener = this._register(tunnel.onDidDispose(() => {
                            this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Extension fired tunnel\'s onDidDispose.');
                            return this._proxy.$closeTunnel(tunnel.remoteAddress);
                        }));
                        this._extensionTunnels.get(tunnelOptions.remoteAddress.host).set(tunnelOptions.remoteAddress.port, { tunnel, disposeListener });
                        return TunnelDtoConverter.fromApiTunnel(tunnel);
                    }
                    else {
                        this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Tunnel is undefined');
                    }
                }
                catch (e) {
                    this.logService.trace('ForwardedPorts: (ExtHostTunnelService) tunnel provider error');
                    if (e instanceof Error) {
                        return e.message;
                    }
                }
            }
            return undefined;
        }
        async $applyCandidateFilter(candidates) {
            const filter = await Promise.all(candidates.map(candidate => this._showCandidatePort(candidate.host, candidate.port, candidate.detail ?? '')));
            const result = candidates.filter((candidate, index) => filter[index]);
            this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) filtered from ${candidates.map(port => port.port).join(', ')} to ${result.map(port => port.port).join(', ')}`);
            return result;
        }
    };
    exports.ExtHostTunnelService = ExtHostTunnelService;
    exports.ExtHostTunnelService = ExtHostTunnelService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, log_1.ILogService)
    ], ExtHostTunnelService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFR1bm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RUdW5uZWxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCaEcsTUFBTSxlQUFnQixTQUFRLHlCQUFnQjtLQUE2QjtJQUUzRSxJQUFpQixrQkFBa0IsQ0FzQmxDO0lBdEJELFdBQWlCLGtCQUFrQjtRQUNsQyxTQUFnQixhQUFhLENBQUMsTUFBcUI7WUFDbEQsT0FBTztnQkFDTixhQUFhLEVBQUUsTUFBTSxDQUFDLGFBQWE7Z0JBQ25DLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtnQkFDakMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTTtnQkFDdkIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQWUsQ0FBQyxPQUFPLENBQUM7Z0JBQzdGLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTthQUN6QixDQUFDO1FBQ0gsQ0FBQztRQVJlLGdDQUFhLGdCQVE1QixDQUFBO1FBQ0QsU0FBZ0IsaUJBQWlCLENBQUMsTUFBb0I7WUFDckQsT0FBTztnQkFDTixhQUFhLEVBQUU7b0JBQ2QsSUFBSSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7b0JBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCO2lCQUM3QjtnQkFDRCxZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVk7Z0JBQ2pDLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTyxLQUFLLHdCQUFlLENBQUMsZUFBZSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssd0JBQWUsQ0FBQyxlQUFlO2dCQUNo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
//# sourceURL=../../../vs/workbench/api/common/extHostTunnelService.js
})
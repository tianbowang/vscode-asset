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
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/log/common/log", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/storage/common/storage", "vs/platform/tunnel/common/tunnel", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/cancellation", "vs/base/common/types", "vs/base/common/objects", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, arrays_1, decorators_1, event_1, hash_1, lifecycle_1, uri_1, configuration_1, dialogs_1, log_1, remoteAuthorityResolver_1, storage_1, tunnel_1, workspace_1, environmentService_1, extensions_1, cancellation_1, types_1, objects_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TunnelModel = exports.PortsAttributes = exports.isCandidatePort = exports.OnPortForward = exports.makeAddress = exports.mapHasAddressLocalhostOrAllInterfaces = exports.mapHasAddress = exports.AutoTunnelSource = exports.UserTunnelSource = exports.TunnelSource = exports.TunnelCloseReason = exports.parseAddress = exports.forwardedPortsViewEnabled = exports.ACTIVATION_EVENT = void 0;
    const MISMATCH_LOCAL_PORT_COOLDOWN = 10 * 1000; // 10 seconds
    const TUNNELS_TO_RESTORE = 'remote.tunnels.toRestore';
    exports.ACTIVATION_EVENT = 'onTunnel';
    exports.forwardedPortsViewEnabled = new contextkey_1.RawContextKey('forwardedPortsViewEnabled', false, nls.localize('tunnel.forwardedPortsViewEnabled', "Whether the Ports view is enabled."));
    function parseAddress(address) {
        const matches = address.match(/^([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*:)?([0-9]+)$/);
        if (!matches) {
            return undefined;
        }
        return { host: matches[1]?.substring(0, matches[1].length - 1) || 'localhost', port: Number(matches[2]) };
    }
    exports.parseAddress = parseAddress;
    var TunnelCloseReason;
    (function (TunnelCloseReason) {
        TunnelCloseReason["Other"] = "Other";
        TunnelCloseReason["User"] = "User";
        TunnelCloseReason["AutoForwardEnd"] = "AutoForwardEnd";
    })(TunnelCloseReason || (exports.TunnelCloseReason = TunnelCloseReason = {}));
    var TunnelSource;
    (function (TunnelSource) {
        TunnelSource[TunnelSource["User"] = 0] = "User";
        TunnelSource[TunnelSource["Auto"] = 1] = "Auto";
        TunnelSource[TunnelSource["Extension"] = 2] = "Extension";
    })(TunnelSource || (exports.TunnelSource = TunnelSource = {}));
    exports.UserTunnelSource = {
        source: TunnelSource.User,
        description: nls.localize('tunnel.source.user', "User Forwarded")
    };
    exports.AutoTunnelSource = {
        source: TunnelSource.Auto,
        description: nls.localize('tunnel.source.auto', "Auto Forwarded")
    };
    function mapHasAddress(map, host, port) {
        const initialAddress = map.get(makeAddress(host, port));
        if (initialAddress) {
            return initialAddress;
        }
        if ((0, tunnel_1.isLocalhost)(host)) {
            // Do localhost checks
            for (const testHost of tunnel_1.LOCALHOST_ADDRESSES) {
                const testAddress = makeAddress(testHost, port);
                if (map.has(testAddress)) {
                    return map.get(testAddress);
                }
            }
        }
        else if ((0, tunnel_1.isAllInterfaces)(host)) {
            // Do all interfaces checks
            for (const testHost of tunnel_1.ALL_INTERFACES_ADDRESSES) {
                const testAddress = makeAddress(testHost, port);
                if (map.has(testAddress)) {
                    return map.get(testAddress);
                }
            }
        }
        return undefined;
    }
    exports.mapHasAddress = mapHasAddress;
    function mapHasAddressLocalhostOrAllInterfaces(map, host, port) {
        const originalAddress = mapHasAddress(map, host, port);
        if (originalAddress) {
            return originalAddress;
        }
        const otherHost = (0, tunnel_1.isAllInterfaces)(host) ? 'localhost' : ((0, tunnel_1.isLocalhost)(host) ? '0.0.0.0' : undefined);
        if (otherHost) {
            return mapHasAddress(map, otherHost, port);
        }
        return undefined;
    }
    exports.mapHasAddressLocalhostOrAllInterfaces = mapHasAddressLocalhostOrAllInterfaces;
    function makeAddress(host, port) {
        return host + ':' + port;
    }
    exports.makeAddress = makeAddress;
    var OnPortForward;
    (function (OnPortForward) {
        OnPortForward["Notify"] = "notify";
        OnPortForward["OpenBrowser"] = "openBrowser";
        OnPortForward["OpenBrowserOnce"] = "openBrowserOnce";
        OnPortForward["OpenPreview"] = "openPreview";
        OnPortForward["Silent"] = "silent";
        OnPortForward["Ignore"] = "ignore";
    })(OnPortForward || (exports.OnPortForward = OnPortForward = {}));
    function isCandidatePort(candidate) {
        return candidate && 'host' in candidate && typeof candidate.host === 'string'
            && 'port' in candidate && typeof candidate.port === 'number'
            && (!('detail' in candidate) || typeof candidate.detail === 'string')
            && (!('pid' in candidate) || typeof candidate.pid === 'string');
    }
    exports.isCandidatePort = isCandidatePort;
    class PortsAttributes extends lifecycle_1.Disposable {
        static { this.SETTING = 'remote.portsAttributes'; }
        static { this.DEFAULTS = 'remote.otherPortsAttributes'; }
        static { this.RANGE = /^(\d+)\-(\d+)$/; }
        static { this.HOST_AND_PORT = /^([a-z0-9\-]+):(\d{1,5})$/; }
        constructor(configurationService) {
            super();
            this.configurationService = configurationService;
            this.portsAttributes = [];
            this._onDidChangeAttributes = new event_1.Emitter();
            this.onDidChangeAttributes = this._onDidChangeAttributes.event;
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(PortsAttributes.SETTING) || e.affectsConfiguration(PortsAttributes.DEFAULTS)) {
                    this.updateAttributes();
                }
            }));
            this.updateAttributes();
        }
        updateAttributes() {
            this.portsAttributes = this.readSetting();
            this._onDidChangeAttributes.fire();
        }
        getAttributes(port, host, commandLine) {
            let index = this.findNextIndex(port, host, commandLine, this.portsAttributes, 0);
            const attributes = {
                label: undefined,
                onAutoForward: undefined,
                elevateIfNeeded: undefined,
                requireLocalPort: undefined,
                protocol: undefined
            };
            while (index >= 0) {
                const found = this.portsAttributes[index];
                if (found.key === port) {
                    attributes.onAutoForward = found.onAutoForward ?? attributes.onAutoForward;
                    attributes.elevateIfNeeded = (found.elevateIfNeeded !== undefined) ? found.elevateIfNeeded : attributes.elevateIfNeeded;
                    attributes.label = found.label ?? attributes.label;
                    attributes.requireLocalPort = found.requireLocalPort;
                    attributes.protocol = found.protocol;
                }
                else {
                    // It's a range or regex, which means that if the attribute is already set, we keep it
                    attributes.onAutoForward = attributes.onAutoForward ?? found.onAutoForward;
                    attributes.elevateIfNeeded = (attributes.elevateIfNeeded !== undefined) ? attributes.elevateIfNeeded : found.elevateIfNeeded;
                    attributes.label = attributes.label ?? found.label;
                    attributes.requireLocalPort = (attributes.requireLocalPort !== undefined) ? attributes.requireLocalPort : undefined;
                    attributes.protocol = attributes.protocol ?? found.protocol;
                }
                index = this.findNextIndex(port, host, commandLine, this.portsAttributes, index + 1);
            }
            if (attributes.onAutoForward !== undefined || attributes.elevateIfNeeded !== undefined
                || attributes.label !== undefined || attributes.requireLocalPort !== undefined
                || attributes.protocol !== undefined) {
                return attributes;
            }
            // If we find no matches, then use the other port attributes.
            return this.getOtherAttributes();
        }
        hasStartEnd(value) {
            return (value.start !== undefined) && (value.end !== undefined);
        }
        hasHostAndPort(value) {
            return (value.host !== undefined) && (value.port !== undefined)
                && (0, types_1.isString)(value.host) && (0, types_1.isNumber)(value.port);
        }
        findNextIndex(port, host, commandLine, attributes, fromIndex) {
            if (fromIndex >= attributes.length) {
                return -1;
            }
            const shouldUseHost = !(0, tunnel_1.isLocalhost)(host) && !(0, tunnel_1.isAllInterfaces)(host);
            const sliced = attributes.slice(fromIndex);
            const foundIndex = sliced.findIndex((value) => {
                if ((0, types_1.isNumber)(value.key)) {
                    return shouldUseHost ? false : value.key === port;
                }
                else if (this.hasStartEnd(value.key)) {
                    return shouldUseHost ? false : (port >= value.key.start && port <= value.key.end);
                }
                else if (this.hasHostAndPort(value.key)) {
                    return (port === value.key.port) && (host === value.key.host);
                }
                else {
                    return commandLine ? value.key.test(commandLine) : false;
                }
            });
            return foundIndex >= 0 ? foundIndex + fromIndex : -1;
        }
        readSetting() {
            const settingValue = this.configurationService.getValue(PortsAttributes.SETTING);
            if (!settingValue || !(0, types_1.isObject)(settingValue)) {
                return [];
            }
            const attributes = [];
            for (const attributesKey in settingValue) {
                if (attributesKey === undefined) {
                    continue;
                }
                const setting = settingValue[attributesKey];
                let key = undefined;
                if (Number(attributesKey)) {
                    key = Number(attributesKey);
                }
                else if ((0, types_1.isString)(attributesKey)) {
                    if (PortsAttributes.RANGE.test(attributesKey)) {
                        const match = attributesKey.match(PortsAttributes.RANGE);
                        key = { start: Number(match[1]), end: Number(match[2]) };
                    }
                    else if (PortsAttributes.HOST_AND_PORT.test(attributesKey)) {
                        const match = attributesKey.match(PortsAttributes.HOST_AND_PORT);
                        key = { host: match[1], port: Number(match[2]) };
                    }
                    else {
                        let regTest = undefined;
                        try {
                            regTest = RegExp(attributesKey);
                        }
                        catch (e) {
                            // The user entered an invalid regular expression.
                        }
                        if (regTest) {
                            key = regTest;
                        }
                    }
                }
                if (!key) {
                    continue;
                }
                attributes.push({
                    key: key,
                    elevateIfNeeded: setting.elevateIfNeeded,
                    onAutoForward: setting.onAutoForward,
                    label: setting.label,
                    requireLocalPort: setting.requireLocalPort,
                    protocol: setting.protocol
                });
            }
            const defaults = this.configurationService.getValue(PortsAttributes.DEFAULTS);
            if (defaults) {
                this.defaultPortAttributes = {
                    elevateIfNeeded: defaults.elevateIfNeeded,
                    label: defaults.label,
                    onAutoForward: defaults.onAutoForward,
                    requireLocalPort: defaults.requireLocalPort,
                    protocol: defaults.protocol
                };
            }
            return this.sortAttributes(attributes);
        }
        sortAttributes(attributes) {
            function getVal(item, thisRef) {
                if ((0, types_1.isNumber)(item.key)) {
                    return item.key;
                }
                else if (thisRef.hasStartEnd(item.key)) {
                    return item.key.start;
                }
                else if (thisRef.hasHostAndPort(item.key)) {
                    return item.key.port;
                }
                else {
                    return Number.MAX_VALUE;
                }
            }
            return attributes.sort((a, b) => {
                return getVal(a, this) - getVal(b, this);
            });
        }
        getOtherAttributes() {
            return this.defaultPortAttributes;
        }
        static providedActionToAction(providedAction) {
            switch (providedAction) {
                case tunnel_1.ProvidedOnAutoForward.Notify: return OnPortForward.Notify;
                case tunnel_1.ProvidedOnAutoForward.OpenBrowser: return OnPortForward.OpenBrowser;
                case tunnel_1.ProvidedOnAutoForward.OpenBrowserOnce: return OnPortForward.OpenBrowserOnce;
                case tunnel_1.ProvidedOnAutoForward.OpenPreview: return OnPortForward.OpenPreview;
                case tunnel_1.ProvidedOnAutoForward.Silent: return OnPortForward.Silent;
                case tunnel_1.ProvidedOnAutoForward.Ignore: return OnPortForward.Ignore;
                default: return undefined;
            }
        }
        async addAttributes(port, attributes, target) {
            const settingValue = this.configurationService.inspect(PortsAttributes.SETTING);
            const remoteValue = settingValue.userRemoteValue;
            let newRemoteValue;
            if (!remoteValue || !(0, types_1.isObject)(remoteValue)) {
                newRemoteValue = {};
            }
            else {
                newRemoteValue = (0, objects_1.deepClone)(remoteValue);
            }
            if (!newRemoteValue[`${port}`]) {
                newRemoteValue[`${port}`] = {};
            }
            for (const attribute in attributes) {
                newRemoteValue[`${port}`][attribute] = attributes[attribute];
            }
            return this.configurationService.updateValue(PortsAttributes.SETTING, newRemoteValue, target);
        }
    }
    exports.PortsAttributes = PortsAttributes;
    let TunnelModel = class TunnelModel extends lifecycle_1.Disposable {
        constructor(tunnelService, storageService, configurationService, environmentService, remoteAuthorityResolverService, workspaceContextService, logService, dialogService, extensionService, contextKeyService) {
            super();
            this.tunnelService = tunnelService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.workspaceContextService = workspaceContextService;
            this.logService = logService;
            this.dialogService = dialogService;
            this.extensionService = extensionService;
            this.contextKeyService = contextKeyService;
            this.inProgress = new Map();
            this._onForwardPort = new event_1.Emitter();
            this.onForwardPort = this._onForwardPort.event;
            this._onClosePort = new event_1.Emitter();
            this.onClosePort = this._onClosePort.event;
            this._onPortName = new event_1.Emitter();
            this.onPortName = this._onPortName.event;
            this._onCandidatesChanged = new event_1.Emitter();
            // onCandidateChanged returns the removed candidates
            this.onCandidatesChanged = this._onCandidatesChanged.event;
            this._onEnvironmentTunnelsSet = new event_1.Emitter();
            this.onEnvironmentTunnelsSet = this._onEnvironmentTunnelsSet.event;
            this._environmentTunnelsSet = false;
            this.restoreListener = undefined;
            this.restoreComplete = false;
            this.onRestoreComplete = new event_1.Emitter();
            this.unrestoredExtensionTunnels = new Map();
            this.sessionCachedProperties = new Map();
            this.portAttributesProviders = [];
            this.mismatchCooldown = new Date();
            this.configPortsAttributes = new PortsAttributes(configurationService);
            this.tunnelRestoreValue = this.getTunnelRestoreValue();
            this._register(this.configPortsAttributes.onDidChangeAttributes(this.updateAttributes, this));
            this.forwarded = new Map();
            this.remoteTunnels = new Map();
            this.tunnelService.tunnels.then(async (tunnels) => {
                const attributes = await this.getAttributes(tunnels.map(tunnel => {
                    return { port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost };
                }));
                for (const tunnel of tunnels) {
                    if (tunnel.localAddress) {
                        const key = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        this.forwarded.set(key, {
                            remotePort: tunnel.tunnelRemotePort,
                            remoteHost: tunnel.tunnelRemoteHost,
                            localAddress: tunnel.localAddress,
                            protocol: attributes?.get(tunnel.tunnelRemotePort)?.protocol ?? tunnel_1.TunnelProtocol.Http,
                            localUri: await this.makeLocalUri(tunnel.localAddress, attributes?.get(tunnel.tunnelRemotePort)),
                            localPort: tunnel.tunnelLocalPort,
                            runningProcess: matchingCandidate?.detail,
                            hasRunningProcess: !!matchingCandidate,
                            pid: matchingCandidate?.pid,
                            privacy: tunnel.privacy,
                            source: exports.UserTunnelSource,
                        });
                        this.remoteTunnels.set(key, tunnel);
                    }
                }
            });
            this.detected = new Map();
            this._register(this.tunnelService.onTunnelOpened(async (tunnel) => {
                const key = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                if (!mapHasAddressLocalhostOrAllInterfaces(this.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                    && !mapHasAddressLocalhostOrAllInterfaces(this.detected, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                    && !mapHasAddressLocalhostOrAllInterfaces(this.inProgress, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort)
                    && tunnel.localAddress) {
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    const attributes = (await this.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]))?.get(tunnel.tunnelRemotePort);
                    this.forwarded.set(key, {
                        remoteHost: tunnel.tunnelRemoteHost,
                        remotePort: tunnel.tunnelRemotePort,
                        localAddress: tunnel.localAddress,
                        protocol: attributes?.protocol ?? tunnel_1.TunnelProtocol.Http,
                        localUri: await this.makeLocalUri(tunnel.localAddress, attributes),
                        localPort: tunnel.tunnelLocalPort,
                        closeable: true,
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        privacy: tunnel.privacy,
                        source: exports.UserTunnelSource,
                    });
                }
                await this.storeForwarded();
                this.remoteTunnels.set(key, tunnel);
                this._onForwardPort.fire(this.forwarded.get(key));
            }));
            this._register(this.tunnelService.onTunnelClosed(address => {
                return this.onTunnelClosed(address, TunnelCloseReason.Other);
            }));
            this.checkExtensionActivationEvents();
        }
        extensionHasActivationEvent() {
            if (this.extensionService.extensions.find(extension => extension.activationEvents?.includes(exports.ACTIVATION_EVENT))) {
                this.contextKeyService.createKey(exports.forwardedPortsViewEnabled.key, true);
                return true;
            }
            return false;
        }
        checkExtensionActivationEvents() {
            if (this.extensionHasActivationEvent()) {
                return;
            }
            const activationDisposable = this._register(this.extensionService.onDidRegisterExtensions(() => {
                if (this.extensionHasActivationEvent()) {
                    activationDisposable.dispose();
                }
            }));
        }
        async onTunnelClosed(address, reason) {
            const key = makeAddress(address.host, address.port);
            if (this.forwarded.has(key)) {
                this.forwarded.delete(key);
                await this.storeForwarded();
                this._onClosePort.fire(address);
            }
        }
        makeLocalUri(localAddress, attributes) {
            if (localAddress.startsWith('http')) {
                return uri_1.URI.parse(localAddress);
            }
            const protocol = attributes?.protocol ?? 'http';
            return uri_1.URI.parse(`${protocol}://${localAddress}`);
        }
        async getStorageKey() {
            const workspace = this.workspaceContextService.getWorkspace();
            const workspaceHash = workspace.configuration ? (0, hash_1.hash)(workspace.configuration.path) : (workspace.folders.length > 0 ? (0, hash_1.hash)(workspace.folders[0].uri.path) : undefined);
            if (workspaceHash === undefined) {
                this.logService.debug('Could not get workspace hash for forwarded ports storage key.');
                return undefined;
            }
            return `${TUNNELS_TO_RESTORE}.${this.environmentService.remoteAuthority}.${workspaceHash}`;
        }
        async getTunnelRestoreValue() {
            const deprecatedValue = this.storageService.get(TUNNELS_TO_RESTORE, 1 /* StorageScope.WORKSPACE */);
            if (deprecatedValue) {
                this.storageService.remove(TUNNELS_TO_RESTORE, 1 /* StorageScope.WORKSPACE */);
                await this.storeForwarded();
                return deprecatedValue;
            }
            const storageKey = await this.getStorageKey();
            if (!storageKey) {
                return undefined;
            }
            return this.storageService.get(storageKey, 0 /* StorageScope.PROFILE */);
        }
        async restoreForwarded() {
            if (this.configurationService.getValue('remote.restoreForwardedPorts')) {
                const tunnelRestoreValue = await this.tunnelRestoreValue;
                if (tunnelRestoreValue && (tunnelRestoreValue !== this.knownPortsRestoreValue)) {
                    const tunnels = JSON.parse(tunnelRestoreValue) ?? [];
                    this.logService.trace(`ForwardedPorts: (TunnelModel) restoring ports ${tunnels.map(tunnel => tunnel.remotePort).join(', ')}`);
                    for (const tunnel of tunnels) {
                        const alreadyForwarded = mapHasAddressLocalhostOrAllInterfaces(this.detected, tunnel.remoteHost, tunnel.remotePort);
                        // Extension forwarded ports should only be updated, not restored.
                        if ((tunnel.source.source !== TunnelSource.Extension && !alreadyForwarded) || (tunnel.source.source === TunnelSource.Extension && alreadyForwarded)) {
                            await this.doForward({
                                remote: { host: tunnel.remoteHost, port: tunnel.remotePort },
                                local: tunnel.localPort,
                                name: tunnel.name,
                                privacy: tunnel.privacy,
                                elevateIfNeeded: true,
                                source: tunnel.source
                            });
                        }
                        else if (tunnel.source.source === TunnelSource.Extension && !alreadyForwarded) {
                            this.unrestoredExtensionTunnels.set(makeAddress(tunnel.remoteHost, tunnel.remotePort), tunnel);
                        }
                    }
                }
            }
            this.restoreComplete = true;
            this.onRestoreComplete.fire();
            if (!this.restoreListener) {
                // It's possible that at restore time the value hasn't synced.
                const key = await this.getStorageKey();
                this.restoreListener = this._register(new lifecycle_1.DisposableStore());
                this.restoreListener.add(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, this.restoreListener)(async (e) => {
                    if (e.key === key) {
                        this.tunnelRestoreValue = Promise.resolve(this.storageService.get(key, 0 /* StorageScope.PROFILE */));
                        await this.restoreForwarded();
                    }
                }));
            }
        }
        async storeForwarded() {
            if (this.configurationService.getValue('remote.restoreForwardedPorts')) {
                const valueToStore = JSON.stringify(Array.from(this.forwarded.values()));
                if (valueToStore !== this.knownPortsRestoreValue) {
                    this.knownPortsRestoreValue = valueToStore;
                    const key = await this.getStorageKey();
                    if (key) {
                        this.storageService.store(key, this.knownPortsRestoreValue, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                    }
                }
            }
        }
        async showPortMismatchModalIfNeeded(tunnel, expectedLocal, attributes) {
            if (!tunnel.tunnelLocalPort || !attributes?.requireLocalPort) {
                return;
            }
            if (tunnel.tunnelLocalPort === expectedLocal) {
                return;
            }
            const newCooldown = new Date();
            if ((this.mismatchCooldown.getTime() + MISMATCH_LOCAL_PORT_COOLDOWN) > newCooldown.getTime()) {
                return;
            }
            this.mismatchCooldown = newCooldown;
            const mismatchString = nls.localize('remote.localPortMismatch.single', "Local port {0} could not be used for forwarding to remote port {1}.\n\nThis usually happens when there is already another process using local port {0}.\n\nPort number {2} has been used instead.", expectedLocal, tunnel.tunnelRemotePort, tunnel.tunnelLocalPort);
            return this.dialogService.info(mismatchString);
        }
        async forward(tunnelProperties, attributes) {
            if (!this.restoreComplete && this.environmentService.remoteAuthority) {
                await event_1.Event.toPromise(this.onRestoreComplete.event);
            }
            return this.doForward(tunnelProperties, attributes);
        }
        async doForward(tunnelProperties, attributes) {
            await this.extensionService.activateByEvent(exports.ACTIVATION_EVENT);
            const existingTunnel = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, tunnelProperties.remote.host, tunnelProperties.remote.port);
            attributes = attributes ??
                ((attributes !== null)
                    ? (await this.getAttributes([tunnelProperties.remote]))?.get(tunnelProperties.remote.port)
                    : undefined);
            const localPort = (tunnelProperties.local !== undefined) ? tunnelProperties.local : tunnelProperties.remote.port;
            let noTunnelValue;
            if (!existingTunnel) {
                const authority = this.environmentService.remoteAuthority;
                const addressProvider = authority ? {
                    getAddress: async () => { return (await this.remoteAuthorityResolverService.resolveAuthority(authority)).authority; }
                } : undefined;
                const key = makeAddress(tunnelProperties.remote.host, tunnelProperties.remote.port);
                this.inProgress.set(key, true);
                tunnelProperties = this.mergeCachedAndUnrestoredProperties(key, tunnelProperties);
                const tunnel = await this.tunnelService.openTunnel(addressProvider, tunnelProperties.remote.host, tunnelProperties.remote.port, undefined, localPort, (!tunnelProperties.elevateIfNeeded) ? attributes?.elevateIfNeeded : tunnelProperties.elevateIfNeeded, tunnelProperties.privacy, attributes?.protocol);
                if (typeof tunnel === 'string') {
                    // There was an error  while creating the tunnel.
                    noTunnelValue = tunnel;
                }
                else if (tunnel && tunnel.localAddress) {
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnelProperties.remote.host, tunnelProperties.remote.port);
                    const protocol = (tunnel.protocol ?
                        ((tunnel.protocol === tunnel_1.TunnelProtocol.Https) ? tunnel_1.TunnelProtocol.Https : tunnel_1.TunnelProtocol.Http)
                        : (attributes?.protocol ?? tunnel_1.TunnelProtocol.Http));
                    const newForward = {
                        remoteHost: tunnel.tunnelRemoteHost,
                        remotePort: tunnel.tunnelRemotePort,
                        localPort: tunnel.tunnelLocalPort,
                        name: attributes?.label ?? tunnelProperties.name,
                        closeable: true,
                        localAddress: tunnel.localAddress,
                        protocol,
                        localUri: await this.makeLocalUri(tunnel.localAddress, attributes),
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        source: tunnelProperties.source ?? exports.UserTunnelSource,
                        privacy: tunnel.privacy,
                    };
                    this.forwarded.set(key, newForward);
                    this.remoteTunnels.set(key, tunnel);
                    this.inProgress.delete(key);
                    await this.storeForwarded();
                    await this.showPortMismatchModalIfNeeded(tunnel, localPort, attributes);
                    this._onForwardPort.fire(newForward);
                    return tunnel;
                }
                this.inProgress.delete(key);
            }
            else {
                return this.mergeAttributesIntoExistingTunnel(existingTunnel, tunnelProperties, attributes);
            }
            return noTunnelValue;
        }
        mergeCachedAndUnrestoredProperties(key, tunnelProperties) {
            const map = this.unrestoredExtensionTunnels.has(key) ? this.unrestoredExtensionTunnels : (this.sessionCachedProperties.has(key) ? this.sessionCachedProperties : undefined);
            if (map) {
                const updateProps = map.get(key);
                map.delete(key);
                if (updateProps) {
                    tunnelProperties.name = updateProps.name ?? tunnelProperties.name;
                    tunnelProperties.local = (('local' in updateProps) ? updateProps.local : (('localPort' in updateProps) ? updateProps.localPort : undefined)) ?? tunnelProperties.local;
                    tunnelProperties.privacy = updateProps.privacy ?? tunnelProperties.privacy;
                }
            }
            return tunnelProperties;
        }
        async mergeAttributesIntoExistingTunnel(existingTunnel, tunnelProperties, attributes) {
            const newName = attributes?.label ?? tunnelProperties.name;
            let MergedAttributeAction;
            (function (MergedAttributeAction) {
                MergedAttributeAction[MergedAttributeAction["None"] = 0] = "None";
                MergedAttributeAction[MergedAttributeAction["Fire"] = 1] = "Fire";
                MergedAttributeAction[MergedAttributeAction["Reopen"] = 2] = "Reopen";
            })(MergedAttributeAction || (MergedAttributeAction = {}));
            let mergedAction = MergedAttributeAction.None;
            if (newName !== existingTunnel.name) {
                existingTunnel.name = newName;
                mergedAction = MergedAttributeAction.Fire;
            }
            // Source of existing tunnel wins so that original source is maintained
            if ((attributes?.protocol || (existingTunnel.protocol !== tunnel_1.TunnelProtocol.Http)) && (attributes?.protocol !== existingTunnel.protocol)) {
                tunnelProperties.source = existingTunnel.source;
                mergedAction = MergedAttributeAction.Reopen;
            }
            // New privacy value wins
            if (tunnelProperties.privacy && (existingTunnel.privacy !== tunnelProperties.privacy)) {
                mergedAction = MergedAttributeAction.Reopen;
            }
            switch (mergedAction) {
                case MergedAttributeAction.Fire: {
                    this._onForwardPort.fire();
                    break;
                }
                case MergedAttributeAction.Reopen: {
                    await this.close(existingTunnel.remoteHost, existingTunnel.remotePort, TunnelCloseReason.User);
                    await this.doForward(tunnelProperties, attributes);
                }
            }
            return mapHasAddressLocalhostOrAllInterfaces(this.remoteTunnels, tunnelProperties.remote.host, tunnelProperties.remote.port);
        }
        async name(host, port, name) {
            const existingForwarded = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, host, port);
            const key = makeAddress(host, port);
            if (existingForwarded) {
                existingForwarded.name = name;
                await this.storeForwarded();
                this._onPortName.fire({ host, port });
                return;
            }
            else if (this.detected.has(key)) {
                this.detected.get(key).name = name;
                this._onPortName.fire({ host, port });
            }
        }
        async close(host, port, reason) {
            const key = makeAddress(host, port);
            const oldTunnel = this.forwarded.get(key);
            if ((reason === TunnelCloseReason.AutoForwardEnd) && oldTunnel && (oldTunnel.source.source === TunnelSource.Auto)) {
                this.sessionCachedProperties.set(key, {
                    local: oldTunnel.localPort,
                    name: oldTunnel.name,
                    privacy: oldTunnel.privacy,
                });
            }
            await this.tunnelService.closeTunnel(host, port);
            return this.onTunnelClosed({ host, port }, reason);
        }
        address(host, port) {
            const key = makeAddress(host, port);
            return (this.forwarded.get(key) || this.detected.get(key))?.localAddress;
        }
        get environmentTunnelsSet() {
            return this._environmentTunnelsSet;
        }
        addEnvironmentTunnels(tunnels) {
            if (tunnels) {
                for (const tunnel of tunnels) {
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel.remoteAddress.host, tunnel.remoteAddress.port);
                    const localAddress = typeof tunnel.localAddress === 'string' ? tunnel.localAddress : makeAddress(tunnel.localAddress.host, tunnel.localAddress.port);
                    this.detected.set(makeAddress(tunnel.remoteAddress.host, tunnel.remoteAddress.port), {
                        remoteHost: tunnel.remoteAddress.host,
                        remotePort: tunnel.remoteAddress.port,
                        localAddress: localAddress,
                        protocol: tunnel_1.TunnelProtocol.Http,
                        localUri: this.makeLocalUri(localAddress),
                        closeable: false,
                        runningProcess: matchingCandidate?.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate?.pid,
                        privacy: tunnel_1.TunnelPrivacyId.ConstantPrivate,
                        source: {
                            source: TunnelSource.Extension,
                            description: nls.localize('tunnel.staticallyForwarded', "Statically Forwarded")
                        }
                    });
                    this.tunnelService.setEnvironmentTunnel(tunnel.remoteAddress.host, tunnel.remoteAddress.port, localAddress, tunnel_1.TunnelPrivacyId.ConstantPrivate, tunnel_1.TunnelProtocol.Http);
                }
            }
            this._environmentTunnelsSet = true;
            this._onEnvironmentTunnelsSet.fire();
            this._onForwardPort.fire();
        }
        setCandidateFilter(filter) {
            this._candidateFilter = filter;
        }
        async setCandidates(candidates) {
            let processedCandidates = candidates;
            if (this._candidateFilter) {
                // When an extension provides a filter, we do the filtering on the extension host before the candidates are set here.
                // However, when the filter doesn't come from an extension we filter here.
                processedCandidates = await this._candidateFilter(candidates);
            }
            const removedCandidates = this.updateInResponseToCandidates(processedCandidates);
            this.logService.trace(`ForwardedPorts: (TunnelModel) removed candidates ${Array.from(removedCandidates.values()).map(candidate => candidate.port).join(', ')}`);
            this._onCandidatesChanged.fire(removedCandidates);
        }
        // Returns removed candidates
        updateInResponseToCandidates(candidates) {
            const removedCandidates = this._candidates ?? new Map();
            const candidatesMap = new Map();
            this._candidates = candidatesMap;
            candidates.forEach(value => {
                const addressKey = makeAddress(value.host, value.port);
                candidatesMap.set(addressKey, {
                    host: value.host,
                    port: value.port,
                    detail: value.detail,
                    pid: value.pid
                });
                if (removedCandidates.has(addressKey)) {
                    removedCandidates.delete(addressKey);
                }
                const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, value.host, value.port);
                if (forwardedValue) {
                    forwardedValue.runningProcess = value.detail;
                    forwardedValue.hasRunningProcess = true;
                    forwardedValue.pid = value.pid;
                }
            });
            removedCandidates.forEach((_value, key) => {
                const parsedAddress = parseAddress(key);
                if (!parsedAddress) {
                    return;
                }
                const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, parsedAddress.host, parsedAddress.port);
                if (forwardedValue) {
                    forwardedValue.runningProcess = undefined;
                    forwardedValue.hasRunningProcess = false;
                    forwardedValue.pid = undefined;
                }
                const detectedValue = mapHasAddressLocalhostOrAllInterfaces(this.detected, parsedAddress.host, parsedAddress.port);
                if (detectedValue) {
                    detectedValue.runningProcess = undefined;
                    detectedValue.hasRunningProcess = false;
                    detectedValue.pid = undefined;
                }
            });
            return removedCandidates;
        }
        get candidates() {
            return this._candidates ? Array.from(this._candidates.values()) : [];
        }
        get candidatesOrUndefined() {
            return this._candidates ? this.candidates : undefined;
        }
        async updateAttributes() {
            // If the label changes in the attributes, we should update it.
            const tunnels = Array.from(this.forwarded.values());
            const allAttributes = await this.getAttributes(tunnels.map(tunnel => {
                return { port: tunnel.remotePort, host: tunnel.remoteHost };
            }), false);
            if (!allAttributes) {
                return;
            }
            for (const forwarded of tunnels) {
                const attributes = allAttributes.get(forwarded.remotePort);
                if ((attributes?.protocol || (forwarded.protocol !== tunnel_1.TunnelProtocol.Http)) && (attributes?.protocol !== forwarded.protocol)) {
                    await this.doForward({
                        remote: { host: forwarded.remoteHost, port: forwarded.remotePort },
                        local: forwarded.localPort,
                        name: forwarded.name,
                        source: forwarded.source
                    }, attributes);
                }
                if (!attributes) {
                    continue;
                }
                if (attributes.label && attributes.label !== forwarded.name) {
                    await this.name(forwarded.remoteHost, forwarded.remotePort, attributes.label);
                }
            }
        }
        async getAttributes(forwardedPorts, checkProviders = true) {
            const matchingCandidates = new Map();
            const pidToPortsMapping = new Map();
            forwardedPorts.forEach(forwardedPort => {
                const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? new Map(), tunnel_1.LOCALHOST_ADDRESSES[0], forwardedPort.port) ?? forwardedPort;
                if (matchingCandidate) {
                    matchingCandidates.set(forwardedPort.port, matchingCandidate);
                    const pid = isCandidatePort(matchingCandidate) ? matchingCandidate.pid : undefined;
                    if (!pidToPortsMapping.has(pid)) {
                        pidToPortsMapping.set(pid, []);
                    }
                    pidToPortsMapping.get(pid)?.push(forwardedPort.port);
                }
            });
            const configAttributes = new Map();
            forwardedPorts.forEach(forwardedPort => {
                const attributes = this.configPortsAttributes.getAttributes(forwardedPort.port, forwardedPort.host, matchingCandidates.get(forwardedPort.port)?.detail);
                if (attributes) {
                    configAttributes.set(forwardedPort.port, attributes);
                }
            });
            if ((this.portAttributesProviders.length === 0) || !checkProviders) {
                return (configAttributes.size > 0) ? configAttributes : undefined;
            }
            // Group calls to provide attributes by pid.
            const allProviderResults = await Promise.all((0, arrays_1.flatten)(this.portAttributesProviders.map(provider => {
                return Array.from(pidToPortsMapping.entries()).map(entry => {
                    const portGroup = entry[1];
                    const matchingCandidate = matchingCandidates.get(portGroup[0]);
                    return provider.providePortAttributes(portGroup, matchingCandidate?.pid, matchingCandidate?.detail, new cancellation_1.CancellationTokenSource().token);
                });
            })));
            const providedAttributes = new Map();
            allProviderResults.forEach(attributes => attributes.forEach(attribute => {
                if (attribute) {
                    providedAttributes.set(attribute.port, attribute);
                }
            }));
            if (!configAttributes && !providedAttributes) {
                return undefined;
            }
            // Merge. The config wins.
            const mergedAttributes = new Map();
            forwardedPorts.forEach(forwardedPorts => {
                const config = configAttributes.get(forwardedPorts.port);
                const provider = providedAttributes.get(forwardedPorts.port);
                mergedAttributes.set(forwardedPorts.port, {
                    elevateIfNeeded: config?.elevateIfNeeded,
                    label: config?.label,
                    onAutoForward: config?.onAutoForward ?? PortsAttributes.providedActionToAction(provider?.autoForwardAction),
                    requireLocalPort: config?.requireLocalPort,
                    protocol: config?.protocol
                });
            });
            return mergedAttributes;
        }
        addAttributesProvider(provider) {
            this.portAttributesProviders.push(provider);
        }
    };
    exports.TunnelModel = TunnelModel;
    __decorate([
        (0, decorators_1.debounce)(1000)
    ], TunnelModel.prototype, "storeForwarded", null);
    exports.TunnelModel = TunnelModel = __decorate([
        __param(0, tunnel_1.ITunnelService),
        __param(1, storage_1.IStorageService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, log_1.ILogService),
        __param(7, dialogs_1.IDialogService),
        __param(8, extensions_1.IExtensionService),
        __param(9, contextkey_1.IContextKeyService)
    ], TunnelModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVubmVsTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9yZW1vdGUvY29tbW9uL3R1bm5lbE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdCaEcsTUFBTSw0QkFBNEIsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsYUFBYTtJQUM3RCxNQUFNLGtCQUFrQixHQUFHLDBCQUEwQixDQUFDO0lBQ3pDLFFBQUEsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO0lBQzlCLFFBQUEseUJBQXlCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDJCQUEyQixFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztJQXFCaE0sU0FBZ0IsWUFBWSxDQUFDLE9BQWU7UUFDM0MsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1FBQ25GLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNkLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUMzRyxDQUFDO0lBTkQsb0NBTUM7SUFFRCxJQUFZLGlCQUlYO0lBSkQsV0FBWSxpQkFBaUI7UUFDNUIsb0NBQWUsQ0FBQTtRQUNmLGtDQUFhLENBQUE7UUFDYixzREFBaUMsQ0FBQTtJQUNsQyxDQUFDLEVBSlcsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUFJNUI7SUFFRCxJQUFZLFlBSVg7SUFKRCxXQUFZLFlBQVk7UUFDdkIsK0NBQUksQ0FBQTtRQUNKLCtDQUFJLENBQUE7UUFDSix5REFBUyxDQUFBO0lBQ1YsQ0FBQyxFQUpXLFlBQVksNEJBQVosWUFBWSxRQUl2QjtJQUVZLFFBQUEsZ0JBQWdCLEdBQUc7UUFDL0IsTUFBTSxFQUFFLFlBQVksQ0FBQyxJQUFJO1FBQ3pCLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLGdCQUFnQixDQUFDO0tBQ2pFLENBQUM7SUFDVyxRQUFBLGdCQUFnQixHQUFHO1FBQy9CLE1BQU0sRUFBRSxZQUFZLENBQUMsSUFBSTtRQUN6QixXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxnQkFBZ0IsQ0FBQztLQUNqRSxDQUFDO0lBRUYsU0FBZ0IsYUFBYSxDQUFJLEdBQW1CLEVBQUUsSUFBWSxFQUFFLElBQVk7UUFDL0UsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNwQixPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBSSxJQUFBLG9CQUFXLEVBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN2QixzQkFBc0I7WUFDdEIsS0FBSyxNQUFNLFFBQVEsSUFBSSw0QkFBbUIsRUFBRSxDQUFDO2dCQUM1QyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztvQkFDMUIsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM3QixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7YUFBTSxJQUFJLElBQUEsd0JBQWUsRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2xDLDJCQUEyQjtZQUMzQixLQUFLLE1BQU0sUUFBUSxJQUFJLGlDQUF3QixFQUFFLENBQUM7Z0JBQ2pELE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hELElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO29CQUMxQixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzdCLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUF6QkQsc0NBeUJDO0lBRUQsU0FBZ0IscUNBQXFDLENBQUksR0FBbUIsRUFBRSxJQUFZLEVBQUUsSUFBWTtRQUN2RyxNQUFNLGVBQWUsR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RCxJQUFJLGVBQWUsRUFBRSxDQUFDO1lBQ3JCLE9BQU8sZUFBZSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFBLHdCQUFlLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLG9CQUFXLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEcsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNmLE9BQU8sYUFBYSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFWRCxzRkFVQztJQUdELFNBQWdCLFdBQVcsQ0FBQyxJQUFZLEVBQUUsSUFBWTtRQUNyRCxPQUFPLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFGRCxrQ0FFQztJQXlCRCxJQUFZLGFBT1g7SUFQRCxXQUFZLGFBQWE7UUFDeEIsa0NBQWlCLENBQUE7UUFDakIsNENBQTJCLENBQUE7UUFDM0Isb0RBQW1DLENBQUE7UUFDbkMsNENBQTJCLENBQUE7UUFDM0Isa0NBQWlCLENBQUE7UUFDakIsa0NBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQVBXLGFBQWEsNkJBQWIsYUFBYSxRQU94QjtJQWNELFNBQWdCLGVBQWUsQ0FBQyxTQUFjO1FBQzdDLE9BQU8sU0FBUyxJQUFJLE1BQU0sSUFBSSxTQUFTLElBQUksT0FBTyxTQUFTLENBQUMsSUFBSSxLQUFLLFFBQVE7ZUFDekUsTUFBTSxJQUFJLFNBQVMsSUFBSSxPQUFPLFNBQVMsQ0FBQyxJQUFJLEtBQUssUUFBUTtlQUN6RCxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLElBQUksT0FBTyxTQUFTLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQztlQUNsRSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLElBQUksT0FBTyxTQUFTLENBQUMsR0FBRyxLQUFLLFFBQVEsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFMRCwwQ0FLQztJQUVELE1BQWEsZUFBZ0IsU0FBUSxzQkFBVTtpQkFDL0IsWUFBTyxHQUFHLHdCQUF3QixBQUEzQixDQUE0QjtpQkFDbkMsYUFBUSxHQUFHLDZCQUE2QixBQUFoQyxDQUFpQztpQkFDekMsVUFBSyxHQUFHLGdCQUFnQixBQUFuQixDQUFvQjtpQkFDekIsa0JBQWEsR0FBRywyQkFBMkIsQUFBOUIsQ0FBK0I7UUFNM0QsWUFBNkIsb0JBQTJDO1lBQ3ZFLEtBQUssRUFBRSxDQUFDO1lBRG9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFMaEUsb0JBQWUsR0FBcUIsRUFBRSxDQUFDO1lBRXZDLDJCQUFzQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDckMsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUl6RSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNoRSxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO29CQUN6RyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDekIsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRU8sZ0JBQWdCO1lBQ3ZCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRUQsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsV0FBb0I7WUFDN0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sVUFBVSxHQUFlO2dCQUM5QixLQUFLLEVBQUUsU0FBUztnQkFDaEIsYUFBYSxFQUFFLFNBQVM7Z0JBQ3hCLGVBQWUsRUFBRSxTQUFTO2dCQUMxQixnQkFBZ0IsRUFBRSxTQUFTO2dCQUMzQixRQUFRLEVBQUUsU0FBUzthQUNuQixDQUFDO1lBQ0YsT0FBTyxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFDLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDeEIsVUFBVSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUM7b0JBQzNFLFVBQVUsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO29CQUN4SCxVQUFVLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDbkQsVUFBVSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDckQsVUFBVSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO2dCQUN0QyxDQUFDO3FCQUFNLENBQUM7b0JBQ1Asc0ZBQXNGO29CQUN0RixVQUFVLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQztvQkFDM0UsVUFBVSxDQUFDLGVBQWUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxlQUFlLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7b0JBQzdILFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDO29CQUNuRCxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO29CQUNwSCxVQUFVLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQztnQkFDN0QsQ0FBQztnQkFDRCxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0RixDQUFDO1lBQ0QsSUFBSSxVQUFVLENBQUMsYUFBYSxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsZUFBZSxLQUFLLFNBQVM7bUJBQ2xGLFVBQVUsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTO21CQUMzRSxVQUFVLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUN2QyxPQUFPLFVBQVUsQ0FBQztZQUNuQixDQUFDO1lBRUQsNkRBQTZEO1lBQzdELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbEMsQ0FBQztRQUVPLFdBQVcsQ0FBQyxLQUFnRDtZQUNuRSxPQUFPLENBQU8sS0FBTSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFPLEtBQU0sQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVPLGNBQWMsQ0FBQyxLQUFnRDtZQUN0RSxPQUFPLENBQU8sS0FBTSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFPLEtBQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO21CQUN6RSxJQUFBLGdCQUFRLEVBQU8sS0FBTSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUEsZ0JBQVEsRUFBTyxLQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVPLGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLFdBQStCLEVBQUUsVUFBNEIsRUFBRSxTQUFpQjtZQUNqSSxJQUFJLFNBQVMsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3BDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDWCxDQUFDO1lBQ0QsTUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFBLG9CQUFXLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFBLHdCQUFlLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQzdDLElBQUksSUFBQSxnQkFBUSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUN6QixPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQztnQkFDbkQsQ0FBQztxQkFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3hDLE9BQU8sYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuRixDQUFDO3FCQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDM0MsT0FBTyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9ELENBQUM7cUJBQU0sQ0FBQztvQkFDUCxPQUFPLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDMUQsQ0FBQztZQUVGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRU8sV0FBVztZQUNsQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBQSxnQkFBUSxFQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQzlDLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFxQixFQUFFLENBQUM7WUFDeEMsS0FBSyxNQUFNLGFBQWEsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFLENBQUM7b0JBQ2pDLFNBQVM7Z0JBQ1YsQ0FBQztnQkFDRCxNQUFNLE9BQU8sR0FBUyxZQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ25ELElBQUksR0FBRyxHQUEwRCxTQUFTLENBQUM7Z0JBQzNFLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7b0JBQzNCLEdBQUcsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzdCLENBQUM7cUJBQU0sSUFBSSxJQUFBLGdCQUFRLEVBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztvQkFDcEMsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO3dCQUMvQyxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDekQsR0FBRyxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEtBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQzVELENBQUM7eUJBQU0sSUFBSSxlQUFlLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO3dCQUM5RCxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDakUsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ3BELENBQUM7eUJBQU0sQ0FBQzt3QkFDUCxJQUFJLE9BQU8sR0FBdUIsU0FBUyxDQUFDO3dCQUM1QyxJQUFJLENBQUM7NEJBQ0osT0FBTyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDakMsQ0FBQzt3QkFBQyxPQUFPLENBQUMsRUFBRSxDQUFDOzRCQUNaLGtEQUFrRDt3QkFDbkQsQ0FBQzt3QkFDRCxJQUFJLE9BQU8sRUFBRSxDQUFDOzRCQUNiLEdBQUcsR0FBRyxPQUFPLENBQUM7d0JBQ2YsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUNWLFNBQVM7Z0JBQ1YsQ0FBQztnQkFDRCxVQUFVLENBQUMsSUFBSSxDQUFDO29CQUNmLEdBQUcsRUFBRSxHQUFHO29CQUNSLGVBQWUsRUFBRSxPQUFPLENBQUMsZUFBZTtvQkFDeEMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxhQUFhO29CQUNwQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7b0JBQ3BCLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxnQkFBZ0I7b0JBQzFDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtpQkFDMUIsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFRLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25GLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLHFCQUFxQixHQUFHO29CQUM1QixlQUFlLEVBQUUsUUFBUSxDQUFDLGVBQWU7b0JBQ3pDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSztvQkFDckIsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO29CQUNyQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsZ0JBQWdCO29CQUMzQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7aUJBQzNCLENBQUM7WUFDSCxDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFTyxjQUFjLENBQUMsVUFBNEI7WUFDbEQsU0FBUyxNQUFNLENBQUMsSUFBb0IsRUFBRSxPQUF3QjtnQkFDN0QsSUFBSSxJQUFBLGdCQUFRLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3hCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDakIsQ0FBQztxQkFBTSxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzFDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ3ZCLENBQUM7cUJBQU0sSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUM3QyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUN0QixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUN6QixDQUFDO1lBQ0YsQ0FBQztZQUVELE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDL0IsT0FBTyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sa0JBQWtCO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDO1FBQ25DLENBQUM7UUFFRCxNQUFNLENBQUMsc0JBQXNCLENBQUMsY0FBaUQ7WUFDOUUsUUFBUSxjQUFjLEVBQUUsQ0FBQztnQkFDeEIsS0FBSyw4QkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7Z0JBQy9ELEtBQUssOEJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxhQUFhLENBQUMsV0FBVyxDQUFDO2dCQUN6RSxLQUFLLDhCQUFxQixDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sYUFBYSxDQUFDLGVBQWUsQ0FBQztnQkFDakYsS0FBSyw4QkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLGFBQWEsQ0FBQyxXQUFXLENBQUM7Z0JBQ3pFLEtBQUssOEJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxhQUFhLENBQUMsTUFBTSxDQUFDO2dCQUMvRCxLQUFLLDhCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQztnQkFDL0QsT0FBTyxDQUFDLENBQUMsT0FBTyxTQUFTLENBQUM7WUFDM0IsQ0FBQztRQUNGLENBQUM7UUFFTSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQVksRUFBRSxVQUErQixFQUFFLE1BQTJCO1lBQ3BHLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hGLE1BQU0sV0FBVyxHQUFRLFlBQVksQ0FBQyxlQUFlLENBQUM7WUFDdEQsSUFBSSxjQUFtQixDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFBLGdCQUFRLEVBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztnQkFDNUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztZQUNyQixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsY0FBYyxHQUFHLElBQUEsbUJBQVMsRUFBQyxXQUFXLENBQUMsQ0FBQztZQUN6QyxDQUFDO1lBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDaEMsY0FBYyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDaEMsQ0FBQztZQUNELEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ3BDLGNBQWMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQVMsVUFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDL0YsQ0FBQzs7SUE3TUYsMENBOE1DO0lBRU0sSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLHNCQUFVO1FBOEIxQyxZQUNpQixhQUE4QyxFQUM3QyxjQUFnRCxFQUMxQyxvQkFBNEQsRUFDckQsa0JBQWlFLEVBQzlELDhCQUFnRixFQUN2Rix1QkFBa0UsRUFDL0UsVUFBd0MsRUFDckMsYUFBOEMsRUFDM0MsZ0JBQW9ELEVBQ25ELGlCQUFzRDtZQUUxRSxLQUFLLEVBQUUsQ0FBQztZQVh5QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDNUIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ3pCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDcEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUM3QyxtQ0FBOEIsR0FBOUIsOEJBQThCLENBQWlDO1lBQ3RFLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDOUQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNwQixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDMUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNsQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBdEMxRCxlQUFVLEdBQXNCLElBQUksR0FBRyxFQUFFLENBQUM7WUFHbkQsbUJBQWMsR0FBMkIsSUFBSSxlQUFPLEVBQUUsQ0FBQztZQUN4RCxrQkFBYSxHQUF5QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztZQUMvRCxpQkFBWSxHQUE0QyxJQUFJLGVBQU8sRUFBRSxDQUFDO1lBQ3ZFLGdCQUFXLEdBQTBDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQzVFLGdCQUFXLEdBQTRDLElBQUksZUFBTyxFQUFFLENBQUM7WUFDdEUsZUFBVSxHQUEwQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUUxRSx5QkFBb0IsR0FBeUQsSUFBSSxlQUFPLEVBQUUsQ0FBQztZQUNuRyxvREFBb0Q7WUFDN0Msd0JBQW1CLEdBQXVELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFHekcsNkJBQXdCLEdBQWtCLElBQUksZUFBTyxFQUFFLENBQUM7WUFDekQsNEJBQXVCLEdBQWdCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUM7WUFDMUUsMkJBQXNCLEdBQVksS0FBSyxDQUFDO1lBRXhDLG9CQUFlLEdBQWdDLFNBQVMsQ0FBQztZQUV6RCxvQkFBZSxHQUFHLEtBQUssQ0FBQztZQUN4QixzQkFBaUIsR0FBa0IsSUFBSSxlQUFPLEVBQUUsQ0FBQztZQUNqRCwrQkFBMEIsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM1RCw0QkFBdUIsR0FBMkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUU1RSw0QkFBdUIsR0FBNkIsRUFBRSxDQUFDO1lBb012RCxxQkFBZ0IsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBckxyQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxlQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNqRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDaEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN6RSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNKLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQzlCLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUN6QixNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO3dCQUMxRSxNQUFNLGlCQUFpQixHQUFHLHFDQUFxQyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQ2pKLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTs0QkFDdkIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7NEJBQ25DLFVBQVUsRUFBRSxNQUFNLENBQUMsZ0JBQWdCOzRCQUNuQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVk7NEJBQ2pDLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFFBQVEsSUFBSSx1QkFBYyxDQUFDLElBQUk7NEJBQ25GLFFBQVEsRUFBRSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzRCQUNoRyxTQUFTLEVBQUUsTUFBTSxDQUFDLGVBQWU7NEJBQ2pDLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNOzRCQUN6QyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsaUJBQWlCOzRCQUN0QyxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsR0FBRzs0QkFDM0IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPOzRCQUN2QixNQUFNLEVBQUUsd0JBQWdCO3lCQUN4QixDQUFDLENBQUM7d0JBQ0gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNyQyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDakUsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDMUUsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQzt1QkFDeEcsQ0FBQyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7dUJBQ3ZHLENBQUMscUNBQXFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDO3VCQUN6RyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQ3pCLE1BQU0saUJBQWlCLEdBQUcscUNBQXFDLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDakosTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDaEosSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO3dCQUN2QixVQUFVLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjt3QkFDbkMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7d0JBQ25DLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTt3QkFDakMsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLElBQUksdUJBQWMsQ0FBQyxJQUFJO3dCQUNyRCxRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDO3dCQUNsRSxTQUFTLEVBQUUsTUFBTSxDQUFDLGVBQWU7d0JBQ2pDLFNBQVMsRUFBRSxJQUFJO3dCQUNmLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNO3dCQUN6QyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsaUJBQWlCO3dCQUN0QyxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsR0FBRzt3QkFDM0IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO3dCQUN2QixNQUFNLEVBQUUsd0JBQWdCO3FCQUN4QixDQUFDLENBQUM7Z0JBQ0osQ0FBQztnQkFDRCxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMxRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBRU8sMkJBQTJCO1lBQ2xDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLHdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNoSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGlDQUF5QixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEUsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sOEJBQThCO1lBQ3JDLElBQUksSUFBSSxDQUFDLDJCQUEyQixFQUFFLEVBQUUsQ0FBQztnQkFDeEMsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRTtnQkFDOUYsSUFBSSxJQUFJLENBQUMsMkJBQTJCLEVBQUUsRUFBRSxDQUFDO29CQUN4QyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDaEMsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUF1QyxFQUFFLE1BQXlCO1lBQzlGLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakMsQ0FBQztRQUNGLENBQUM7UUFFTyxZQUFZLENBQUMsWUFBb0IsRUFBRSxVQUF1QjtZQUNqRSxJQUFJLFlBQVksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDckMsT0FBTyxTQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2hDLENBQUM7WUFDRCxNQUFNLFFBQVEsR0FBRyxVQUFVLEVBQUUsUUFBUSxJQUFJLE1BQU0sQ0FBQztZQUNoRCxPQUFPLFNBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLE1BQU0sWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRU8sS0FBSyxDQUFDLGFBQWE7WUFDMUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQzlELE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLFdBQUksRUFBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEssSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUM7Z0JBQ3ZGLE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7WUFDRCxPQUFPLEdBQUcsa0JBQWtCLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUM1RixDQUFDO1FBRU8sS0FBSyxDQUFDLHFCQUFxQjtZQUNsQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsaUNBQXlCLENBQUM7WUFDNUYsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLGlDQUF5QixDQUFDO2dCQUN2RSxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxlQUFlLENBQUM7WUFDeEIsQ0FBQztZQUNELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDakIsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSwrQkFBdUIsQ0FBQztRQUNsRSxDQUFDO1FBRUQsS0FBSyxDQUFDLGdCQUFnQjtZQUNyQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsOEJBQThCLENBQUMsRUFBRSxDQUFDO2dCQUN4RSxNQUFNLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDO2dCQUN6RCxJQUFJLGtCQUFrQixJQUFJLENBQUMsa0JBQWtCLEtBQUssSUFBSSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQztvQkFDaEYsTUFBTSxPQUFPLEdBQXlCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQzNFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGlEQUFpRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzlILEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7d0JBQzlCLE1BQU0sZ0JBQWdCLEdBQUcscUNBQXFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDcEgsa0VBQWtFO3dCQUNsRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssWUFBWSxDQUFDLFNBQVMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxZQUFZLENBQUMsU0FBUyxJQUFJLGdCQUFnQixDQUFDLEVBQUUsQ0FBQzs0QkFDckosTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDO2dDQUNwQixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRTtnQ0FDNUQsS0FBSyxFQUFFLE1BQU0sQ0FBQyxTQUFTO2dDQUN2QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0NBQ2pCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztnQ0FDdkIsZUFBZSxFQUFFLElBQUk7Z0NBQ3JCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTs2QkFDckIsQ0FBQyxDQUFDO3dCQUNKLENBQUM7NkJBQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxZQUFZLENBQUMsU0FBUyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs0QkFDakYsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ2hHLENBQUM7b0JBQ0YsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQzVCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUU5QixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUMzQiw4REFBOEQ7Z0JBQzlELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsK0JBQXVCLFNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNoSSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7d0JBQ25CLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsK0JBQXVCLENBQUMsQ0FBQzt3QkFDOUYsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDL0IsQ0FBQztnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNGLENBQUM7UUFHYSxBQUFOLEtBQUssQ0FBQyxjQUFjO1lBQzNCLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDekUsSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7b0JBQ2xELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxZQUFZLENBQUM7b0JBQzNDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUN2QyxJQUFJLEdBQUcsRUFBRSxDQUFDO3dCQUNULElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsc0JBQXNCLDJEQUEyQyxDQUFDO29CQUN2RyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUdPLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxNQUFvQixFQUFFLGFBQXFCLEVBQUUsVUFBa0M7WUFDMUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLElBQUksQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDOUQsT0FBTztZQUNSLENBQUM7WUFDRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssYUFBYSxFQUFFLENBQUM7Z0JBQzlDLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLDRCQUE0QixDQUFDLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7Z0JBQzlGLE9BQU87WUFDUixDQUFDO1lBQ0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQztZQUNwQyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxFQUFFLG1NQUFtTSxFQUN6USxhQUFhLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNqRSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFrQyxFQUFFLFVBQThCO1lBQy9FLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdEUsTUFBTSxhQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFTyxLQUFLLENBQUMsU0FBUyxDQUFDLGdCQUFrQyxFQUFFLFVBQThCO1lBQ3pGLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyx3QkFBZ0IsQ0FBQyxDQUFDO1lBRTlELE1BQU0sY0FBYyxHQUFHLHFDQUFxQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekksVUFBVSxHQUFHLFVBQVU7Z0JBQ3RCLENBQUMsQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDO29CQUNyQixDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQzFGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNmLE1BQU0sU0FBUyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDakgsSUFBSSxhQUFpQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztnQkFDMUQsTUFBTSxlQUFlLEdBQWlDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pFLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQ3JILENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFFZCxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BGLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0IsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUVsRixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM1UyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNoQyxpREFBaUQ7b0JBQ2pELGFBQWEsR0FBRyxNQUFNLENBQUM7Z0JBQ3hCLENBQUM7cUJBQU0sSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUMxQyxNQUFNLGlCQUFpQixHQUFHLHFDQUFxQyxDQUFnQixJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksR0FBRyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzFLLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUNsQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsS0FBSyx1QkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyx1QkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsdUJBQWMsQ0FBQyxJQUFJLENBQUM7d0JBQ3pGLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxRQUFRLElBQUksdUJBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNsRCxNQUFNLFVBQVUsR0FBVzt3QkFDMUIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7d0JBQ25DLFVBQVUsRUFBRSxNQUFNLENBQUMsZ0JBQWdCO3dCQUNuQyxTQUFTLEVBQUUsTUFBTSxDQUFDLGVBQWU7d0JBQ2pDLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxJQUFJLGdCQUFnQixDQUFDLElBQUk7d0JBQ2hELFNBQVMsRUFBRSxJQUFJO3dCQUNmLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTt3QkFDakMsUUFBUTt3QkFDUixRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDO3dCQUNsRSxjQUFjLEVBQUUsaUJBQWlCLEVBQUUsTUFBTTt3QkFDekMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQjt3QkFDdEMsR0FBRyxFQUFFLGlCQUFpQixFQUFFLEdBQUc7d0JBQzNCLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksd0JBQWdCO3dCQUNuRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87cUJBQ3ZCLENBQUM7b0JBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM1QixNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDNUIsTUFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDeEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3JDLE9BQU8sTUFBTSxDQUFDO2dCQUNmLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM3RixDQUFDO1lBRUQsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVPLGtDQUFrQyxDQUFDLEdBQVcsRUFBRSxnQkFBa0M7WUFDekYsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUssSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDVCxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxDQUFDO2dCQUNsQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixJQUFJLFdBQVcsRUFBRSxDQUFDO29CQUNqQixnQkFBZ0IsQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7b0JBQ2xFLGdCQUFnQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLEtBQUssQ0FBQztvQkFDdkssZ0JBQWdCLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsT0FBTyxDQUFDO2dCQUM1RSxDQUFDO1lBQ0YsQ0FBQztZQUNELE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVPLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxjQUFzQixFQUFFLGdCQUFrQyxFQUFFLFVBQWtDO1lBQzdJLE1BQU0sT0FBTyxHQUFHLFVBQVUsRUFBRSxLQUFLLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDO1lBQzNELElBQUsscUJBSUo7WUFKRCxXQUFLLHFCQUFxQjtnQkFDekIsaUVBQVEsQ0FBQTtnQkFDUixpRUFBUSxDQUFBO2dCQUNSLHFFQUFVLENBQUE7WUFDWCxDQUFDLEVBSkkscUJBQXFCLEtBQXJCLHFCQUFxQixRQUl6QjtZQUNELElBQUksWUFBWSxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQztZQUM5QyxJQUFJLE9BQU8sS0FBSyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JDLGNBQWMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO2dCQUM5QixZQUFZLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDO1lBQzNDLENBQUM7WUFDRCx1RUFBdUU7WUFDdkUsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxLQUFLLHVCQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLEtBQUssY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO2dCQUNoRCxZQUFZLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDO1lBQzdDLENBQUM7WUFDRCx5QkFBeUI7WUFDekIsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxLQUFLLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZGLFlBQVksR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUM7WUFDN0MsQ0FBQztZQUNELFFBQVEsWUFBWSxFQUFFLENBQUM7Z0JBQ3RCLEtBQUsscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDakMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDM0IsTUFBTTtnQkFDUCxDQUFDO2dCQUNELEtBQUsscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDbkMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDL0YsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDO1lBQ0YsQ0FBQztZQUVELE9BQU8scUNBQXFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5SCxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLElBQVk7WUFDbEQsTUFBTSxpQkFBaUIsR0FBRyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1RixNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksaUJBQWlCLEVBQUUsQ0FBQztnQkFDdkIsaUJBQWlCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDOUIsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLE9BQU87WUFDUixDQUFDO2lCQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxNQUF5QjtZQUNoRSxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxNQUFNLEtBQUssaUJBQWlCLENBQUMsY0FBYyxDQUFDLElBQUksU0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ25ILElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO29CQUNyQyxLQUFLLEVBQUUsU0FBUyxDQUFDLFNBQVM7b0JBQzFCLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTtvQkFDcEIsT0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPO2lCQUMxQixDQUFDLENBQUM7WUFDSixDQUFDO1lBQ0QsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDakQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxPQUFPLENBQUMsSUFBWSxFQUFFLElBQVk7WUFDakMsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUM7UUFDMUUsQ0FBQztRQUVELElBQVcscUJBQXFCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDO1FBQ3BDLENBQUM7UUFFRCxxQkFBcUIsQ0FBQyxPQUF3QztZQUM3RCxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQzlCLE1BQU0saUJBQWlCLEdBQUcscUNBQXFDLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3JKLE1BQU0sWUFBWSxHQUFHLE9BQU8sTUFBTSxDQUFDLFlBQVksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNySixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDcEYsVUFBVSxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSTt3QkFDckMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSTt3QkFDckMsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFFBQVEsRUFBRSx1QkFBYyxDQUFDLElBQUk7d0JBQzdCLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQzt3QkFDekMsU0FBUyxFQUFFLEtBQUs7d0JBQ2hCLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNO3dCQUN6QyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsaUJBQWlCO3dCQUN0QyxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsR0FBRzt3QkFDM0IsT0FBTyxFQUFFLHdCQUFlLENBQUMsZUFBZTt3QkFDeEMsTUFBTSxFQUFFOzRCQUNQLE1BQU0sRUFBRSxZQUFZLENBQUMsU0FBUzs0QkFDOUIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEVBQUUsc0JBQXNCLENBQUM7eUJBQy9FO3FCQUNELENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSx3QkFBZSxDQUFDLGVBQWUsRUFBRSx1QkFBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuSyxDQUFDO1lBQ0YsQ0FBQztZQUNELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7WUFDbkMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVELGtCQUFrQixDQUFDLE1BQStFO1lBQ2pHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUM7UUFDaEMsQ0FBQztRQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBMkI7WUFDOUMsSUFBSSxtQkFBbUIsR0FBRyxVQUFVLENBQUM7WUFDckMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDM0IscUhBQXFIO2dCQUNySCwwRUFBMEU7Z0JBQzFFLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9ELENBQUM7WUFDRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ2pGLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEssSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCw2QkFBNkI7UUFDckIsNEJBQTRCLENBQUMsVUFBMkI7WUFDL0QsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7WUFDeEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQztZQUNqQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMxQixNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZELGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFO29CQUM3QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7b0JBQ2hCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtvQkFDaEIsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO29CQUNwQixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7aUJBQ2QsQ0FBQyxDQUFDO2dCQUNILElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztnQkFDRCxNQUFNLGNBQWMsR0FBRyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyRyxJQUFJLGNBQWMsRUFBRSxDQUFDO29CQUNwQixjQUFjLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7b0JBQzdDLGNBQWMsQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7b0JBQ3hDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztnQkFDaEMsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO2dCQUN6QyxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDcEIsT0FBTztnQkFDUixDQUFDO2dCQUNELE1BQU0sY0FBYyxHQUFHLHFDQUFxQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JILElBQUksY0FBYyxFQUFFLENBQUM7b0JBQ3BCLGNBQWMsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO29CQUMxQyxjQUFjLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO29CQUN6QyxjQUFjLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztnQkFDaEMsQ0FBQztnQkFDRCxNQUFNLGFBQWEsR0FBRyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuSCxJQUFJLGFBQWEsRUFBRSxDQUFDO29CQUNuQixhQUFhLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztvQkFDekMsYUFBYSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztvQkFDeEMsYUFBYSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7Z0JBQy9CLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8saUJBQWlCLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQUksVUFBVTtZQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN0RSxDQUFDO1FBRUQsSUFBSSxxQkFBcUI7WUFDeEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDdkQsQ0FBQztRQUVPLEtBQUssQ0FBQyxnQkFBZ0I7WUFDN0IsK0RBQStEO1lBQy9ELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNuRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM3RCxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDcEIsT0FBTztZQUNSLENBQUM7WUFDRCxLQUFLLE1BQU0sU0FBUyxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNqQyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxLQUFLLHVCQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLEtBQUssU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7b0JBQzdILE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDcEIsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUU7d0JBQ2xFLEtBQUssRUFBRSxTQUFTLENBQUMsU0FBUzt3QkFDMUIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO3dCQUNwQixNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU07cUJBQ3hCLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ2hCLENBQUM7Z0JBRUQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUNqQixTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsSUFBSSxVQUFVLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUM3RCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0UsQ0FBQztZQUVGLENBQUM7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxjQUFnRCxFQUFFLGlCQUEwQixJQUFJO1lBQ25HLE1BQU0sa0JBQWtCLEdBQStCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDakUsTUFBTSxpQkFBaUIsR0FBc0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN2RSxjQUFjLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUN0QyxNQUFNLGlCQUFpQixHQUFHLHFDQUFxQyxDQUFnQixJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksR0FBRyxFQUFFLEVBQUUsNEJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQztnQkFDM0ssSUFBSSxpQkFBaUIsRUFBRSxDQUFDO29CQUN2QixrQkFBa0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO29CQUM5RCxNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQ25GLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDakMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDaEMsQ0FBQztvQkFDRCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxnQkFBZ0IsR0FBNEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM1RCxjQUFjLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUN0QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN4SixJQUFJLFVBQVUsRUFBRSxDQUFDO29CQUNoQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNuRSxDQUFDO1lBRUQsNENBQTRDO1lBQzVDLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUEsZ0JBQU8sRUFBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNoRyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQzFELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELE9BQU8sUUFBUSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFDOUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxJQUFJLHNDQUF1QixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFGLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsTUFBTSxrQkFBa0IsR0FBd0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMxRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN2RSxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNmLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNuRCxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzlDLE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7WUFFRCwwQkFBMEI7WUFDMUIsTUFBTSxnQkFBZ0IsR0FBNEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM1RCxjQUFjLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUN2QyxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3RCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRTtvQkFDekMsZUFBZSxFQUFFLE1BQU0sRUFBRSxlQUFlO29CQUN4QyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUs7b0JBQ3BCLGFBQWEsRUFBRSxNQUFNLEVBQUUsYUFBYSxJQUFJLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUM7b0JBQzNHLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxnQkFBZ0I7b0JBQzFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUTtpQkFDMUIsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFRCxxQkFBcUIsQ0FBQyxRQUFnQztZQUNyRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLENBQUM7S0FDRCxDQUFBO0lBN2tCWSxrQ0FBVztJQW1OVDtRQURiLElBQUEscUJBQVEsRUFBQyxJQUFJLENBQUM7cURBWWQ7MEJBOU5XLFdBQVc7UUErQnJCLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxpREFBNEIsQ0FBQTtRQUM1QixXQUFBLHlEQUErQixDQUFBO1FBQy9CLFdBQUEsb0NBQXdCLENBQUE7UUFDeEIsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSx3QkFBYyxDQUFBO1FBQ2QsV0FBQSw4QkFBaUIsQ0FBQTtRQUNqQixXQUFBLCtCQUFrQixDQUFBO09BeENSLFdBQVcsQ0E2a0J2QiJ9
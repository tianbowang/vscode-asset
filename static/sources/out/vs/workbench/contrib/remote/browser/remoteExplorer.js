var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/workbench/services/remote/common/remoteExplorerService", "vs/workbench/services/remote/common/tunnelModel", "vs/workbench/contrib/remote/browser/tunnelView", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/environment/common/environmentService", "vs/platform/registry/common/platform", "vs/workbench/services/statusbar/browser/statusbar", "vs/workbench/contrib/remote/browser/urlFinder", "vs/base/common/severity", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform", "vs/platform/tunnel/common/tunnel", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/services/activity/common/activity", "vs/workbench/contrib/remote/browser/remoteIcons", "vs/base/common/event", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService", "vs/workbench/services/host/browser/host", "vs/platform/configuration/common/configurationRegistry", "vs/platform/log/common/log", "vs/workbench/services/configuration/common/configuration", "vs/base/common/actions", "vs/workbench/services/preferences/common/preferences", "vs/platform/storage/common/storage"], function (require, exports, nls, lifecycle_1, views_1, remoteExplorerService_1, tunnelModel_1, tunnelView_1, contextkey_1, environmentService_1, platform_1, statusbar_1, urlFinder_1, severity_1, notification_1, opener_1, terminal_1, debug_1, remoteAgentService_1, platform_2, tunnel_1, descriptors_1, viewPaneContainer_1, activity_1, remoteIcons_1, event_1, externalUriOpenerService_1, host_1, configurationRegistry_1, log_1, configuration_1, actions_1, preferences_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutomaticPortForwarding = exports.PortRestore = exports.ForwardedPortsView = exports.VIEWLET_ID = void 0;
    exports.VIEWLET_ID = 'workbench.view.remote';
    let ForwardedPortsView = class ForwardedPortsView extends lifecycle_1.Disposable {
        constructor(contextKeyService, environmentService, remoteExplorerService, tunnelService, activityService, statusbarService) {
            super();
            this.contextKeyService = contextKeyService;
            this.environmentService = environmentService;
            this.remoteExplorerService = remoteExplorerService;
            this.tunnelService = tunnelService;
            this.activityService = activityService;
            this.statusbarService = statusbarService;
            this._register(platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViewWelcomeContent(remoteExplorerService_1.TUNNEL_VIEW_ID, {
                content: this.environmentService.remoteAuthority ? nls.localize('remoteNoPorts', "No forwarded ports. Forward a port to access your running services locally.\n[Forward a Port]({0})", `command:${tunnelView_1.ForwardPortAction.INLINE_ID}`)
                    : nls.localize('noRemoteNoPorts', "No forwarded ports. Forward a port to access your locally running services over the internet.\n[Forward a Port]({0})", `command:${tunnelView_1.ForwardPortAction.INLINE_ID}`),
            }));
            this.enableBadgeAndStatusBar();
            this.enableForwardedPortsView();
        }
        async getViewContainer() {
            return platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: remoteExplorerService_1.TUNNEL_VIEW_CONTAINER_ID,
                title: { value: nls.localize('ports', "Ports"), original: 'Ports' },
                icon: remoteIcons_1.portsViewIcon,
                ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [remoteExplorerService_1.TUNNEL_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
                storageId: remoteExplorerService_1.TUNNEL_VIEW_CONTAINER_ID,
                hideIfEmpty: true,
                order: 5
            }, 1 /* ViewContainerLocation.Panel */);
        }
        async enableForwardedPortsView() {
            if (this.contextKeyListener) {
                this.contextKeyListener.dispose();
                this.contextKeyListener = undefined;
            }
            const viewEnabled = !!tunnelModel_1.forwardedPortsViewEnabled.getValue(this.contextKeyService);
            if (viewEnabled) {
                const viewContainer = await this.getViewContainer();
                const tunnelPanelDescriptor = new tunnelView_1.TunnelPanelDescriptor(new tunnelView_1.TunnelViewModel(this.remoteExplorerService, this.tunnelService), this.environmentService);
                const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
                if (viewContainer) {
                    this.remoteExplorerService.enablePortsFeatures();
                    viewsRegistry.registerViews([tunnelPanelDescriptor], viewContainer);
                }
            }
            else {
                this.contextKeyListener = this.contextKeyService.onDidChangeContext(e => {
                    if (e.affectsSome(new Set(tunnelModel_1.forwardedPortsViewEnabled.keys()))) {
                        this.enableForwardedPortsView();
                    }
                });
            }
        }
        enableBadgeAndStatusBar() {
            const disposable = platform_1.Registry.as(views_1.Extensions.ViewsRegistry).onViewsRegistered(e => {
                if (e.find(view => view.views.find(viewDescriptor => viewDescriptor.id === remoteExplorerService_1.TUNNEL_VIEW_ID))) {
                    this._register(event_1.Event.debounce(this.remoteExplorerService.tunnelModel.onForwardPort, (_last, e) => e, 50)(() => {
                        this.updateActivityBadge();
                        this.updateStatusBar();
                    }));
                    this._register(event_1.Event.debounce(this.remoteExplorerService.tunnelModel.onClosePort, (_last, e) => e, 50)(() => {
                        this.updateActivityBadge();
                        this.updateStatusBar();
                    }));
                    this.updateActivityBadge();
                    this.updateStatusBar();
                    disposable.dispose();
                }
            });
        }
        async updateActivityBadge() {
            this._activityBadge?.dispose();
            if (this.remoteExplorerService.tunnelModel.forwarded.size > 0) {
                this._activityBadge = this.activityService.showViewActivity(remoteExplorerService_1.TUNNEL_VIEW_ID, {
                    badge: new activity_1.NumberBadge(this.remoteExplorerService.tunnelModel.forwarded.size, n => n === 1 ? nls.localize('1forwardedPort', "1 forwarded port") : nls.localize('nForwardedPorts', "{0} forwarded ports", n))
                });
            }
        }
        updateStatusBar() {
            if (!this.entryAccessor) {
                this._register(this.entryAccessor = this.statusbarService.addEntry(this.entry, 'status.forwardedPorts', 0 /* StatusbarAlignment.LEFT */, 40));
            }
            else {
                this.entryAccessor.update(this.entry);
            }
        }
        get entry() {
            let tooltip;
            const count = this.remoteExplorerService.tunnelModel.forwarded.size + this.remoteExplorerService.tunnelModel.detected.size;
            const text = `${count}`;
            if (count === 0) {
                tooltip = nls.localize('remote.forwardedPorts.statusbarTextNone', "No Ports Forwarded");
            }
            else {
                const allTunnels = Array.from(this.remoteExplorerService.tunnelModel.forwarded.values());
                allTunnels.push(...Array.from(this.remoteExplorerService.tunnelModel.detected.values()));
                tooltip = nls.localize('remote.forwardedPorts.statusbarTooltip', "Forwarded Ports: {0}", allTunnels.map(forwarded => forwarded.remotePort).join(', '));
            }
            return {
                name: nls.localize('status.forwardedPorts', "Forwarded Ports"),
                text: `$(radio-tower) ${text}`,
                ariaLabel: tooltip,
                tooltip,
                command: `${remoteExplorerService_1.TUNNEL_VIEW_ID}.focus`
            };
        }
    };
    exports.ForwardedPortsView = ForwardedPortsView;
    exports.ForwardedPortsView = ForwardedPortsView = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, remoteExplorerService_1.IRemoteExplorerService),
        __param(3, tunnel_1.ITunnelService),
        __param(4, activity_1.IActivityService),
        __param(5, statusbar_1.IStatusbarService)
    ], ForwardedPortsView);
    let PortRestore = class PortRestore {
        constructor(remoteExplorerService, logService) {
            this.remoteExplorerService = remoteExplorerService;
            this.logService = logService;
            if (!this.remoteExplorerService.tunnelModel.environmentTunnelsSet) {
                event_1.Event.once(this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet)(async () => {
                    await this.restore();
                });
            }
            else {
                this.restore();
            }
        }
        async restore() {
            this.logService.trace('ForwardedPorts: Doing first restore.');
            return this.remoteExplorerService.restore();
        }
    };
    exports.PortRestore = PortRestore;
    exports.PortRestore = PortRestore = __decorate([
        __param(0, remoteExplorerService_1.IRemoteExplorerService),
        __param(1, log_1.ILogService)
    ], PortRestore);
    let AutomaticPortForwarding = class AutomaticPortForwarding extends lifecycle_1.Disposable {
        constructor(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, environmentService, contextKeyService, configurationService, debugService, remoteAgentService, tunnelService, hostService, logService, storageService, preferencesService) {
            super();
            this.terminalService = terminalService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.externalOpenerService = externalOpenerService;
            this.remoteExplorerService = remoteExplorerService;
            this.environmentService = environmentService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.debugService = debugService;
            this.remoteAgentService = remoteAgentService;
            this.tunnelService = tunnelService;
            this.hostService = hostService;
            this.logService = logService;
            this.storageService = storageService;
            this.preferencesService = preferencesService;
            if (!environmentService.remoteAuthority) {
                return;
            }
            configurationService.whenRemoteConfigurationLoaded().then(() => remoteAgentService.getEnvironment()).then(environment => {
                this.setup(environment);
                this._register(configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING)) {
                        this.setup(environment);
                    }
                    else if (e.affectsConfiguration(remoteExplorerService_1.PORT_AUTO_FALLBACK_SETTING) && !this.portListener) {
                        this.listenForPorts();
                    }
                }));
            });
            if (!this.storageService.getBoolean('processPortForwardingFallback', 1 /* StorageScope.WORKSPACE */, true)) {
                this.configurationService.updateValue(remoteExplorerService_1.PORT_AUTO_FALLBACK_SETTING, 0, 5 /* ConfigurationTarget.WORKSPACE */);
            }
        }
        listenForPorts() {
            let fallbackAt = this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FALLBACK_SETTING);
            if (fallbackAt === 0) {
                this.portListener?.dispose();
                return;
            }
            if (this.procForwarder && !this.portListener && (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING) === remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_PROCESS)) {
                this.portListener = this._register(this.remoteExplorerService.tunnelModel.onForwardPort(async () => {
                    fallbackAt = this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FALLBACK_SETTING);
                    if (fallbackAt === 0) {
                        this.portListener?.dispose();
                        return;
                    }
                    if (Array.from(this.remoteExplorerService.tunnelModel.forwarded.values()).filter(tunnel => tunnel.source.source === tunnelModel_1.TunnelSource.Auto).length > fallbackAt) {
                        await this.configurationService.updateValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING, remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_HYBRID);
                        this.notificationService.notify({
                            message: nls.localize('remote.autoForwardPortsSource.fallback', "Over 20 ports have been automatically forwarded. The `process` based automatic port forwarding has been switched to `hybrid` in settings. Some ports may no longer be detected."),
                            severity: severity_1.default.Warning,
                            actions: {
                                primary: [
                                    new actions_1.Action('switchBack', nls.localize('remote.autoForwardPortsSource.fallback.switchBack', "Undo"), undefined, true, async () => {
                                        await this.configurationService.updateValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING, remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_PROCESS);
                                        await this.configurationService.updateValue(remoteExplorerService_1.PORT_AUTO_FALLBACK_SETTING, 0, 5 /* ConfigurationTarget.WORKSPACE */);
                                        this.portListener?.dispose();
                                        this.portListener = undefined;
                                    }),
                                    new actions_1.Action('showPortSourceSetting', nls.localize('remote.autoForwardPortsSource.fallback.showPortSourceSetting', "Show Setting"), undefined, true, async () => {
                                        await this.preferencesService.openSettings({
                                            query: 'remote.autoForwardPortsSource'
                                        });
                                    })
                                ]
                            }
                        });
                    }
                }));
            }
            else {
                this.portListener?.dispose();
                this.portListener = undefined;
            }
        }
        setup(environment) {
            const alreadyForwarded = this.procForwarder?.forwarded;
            const isSwitch = this.outputForwarder || this.procForwarder;
            this.procForwarder?.dispose();
            this.procForwarder = undefined;
            this.outputForwarder?.dispose();
            this.outputForwarder = undefined;
            if (environment?.os !== 3 /* OperatingSystem.Linux */) {
                platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
                    .registerDefaultConfigurations([{ overrides: { 'remote.autoForwardPortsSource': remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_OUTPUT } }]);
                this.outputForwarder = this._register(new OutputAutomaticPortForwarding(this.terminalService, this.notificationService, this.openerService, this.externalOpenerService, this.remoteExplorerService, this.configurationService, this.debugService, this.tunnelService, this.hostService, this.logService, this.contextKeyService, () => false));
            }
            else {
                const useProc = () => (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING) === remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_PROCESS);
                if (useProc()) {
                    this.procForwarder = this._register(new ProcAutomaticPortForwarding(false, alreadyForwarded, !isSwitch, this.configurationService, this.remoteExplorerService, this.notificationService, this.openerService, this.externalOpenerService, this.tunnelService, this.hostService, this.logService, this.contextKeyService));
                }
                else if (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING) === remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_HYBRID) {
                    this.procForwarder = this._register(new ProcAutomaticPortForwarding(true, alreadyForwarded, !isSwitch, this.configurationService, this.remoteExplorerService, this.notificationService, this.openerService, this.externalOpenerService, this.tunnelService, this.hostService, this.logService, this.contextKeyService));
                }
                this.outputForwarder = this._register(new OutputAutomaticPortForwarding(this.terminalService, this.notificationService, this.openerService, this.externalOpenerService, this.remoteExplorerService, this.configurationService, this.debugService, this.tunnelService, this.hostService, this.logService, this.contextKeyService, useProc));
            }
            this.listenForPorts();
        }
    };
    exports.AutomaticPortForwarding = AutomaticPortForwarding;
    exports.AutomaticPortForwarding = AutomaticPortForwarding = __decorate([
        __param(0, terminal_1.ITerminalService),
        __param(1, notification_1.INotificationService),
        __param(2, opener_1.IOpenerService),
        __param(3, externalUriOpenerService_1.IExternalUriOpenerService),
        __param(4, remoteExplorerService_1.IRemoteExplorerService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, configuration_1.IWorkbenchConfigurationService),
        __param(8, debug_1.IDebugService),
        __param(9, remoteAgentService_1.IRemoteAgentService),
        __param(10, tunnel_1.ITunnelService),
        __param(11, host_1.IHostService),
        __param(12, log_1.ILogService),
        __param(13, storage_1.IStorageService),
        __param(14, preferences_1.IPreferencesService)
    ], AutomaticPortForwarding);
    class OnAutoForwardedAction extends lifecycle_1.Disposable {
        static { this.NOTIFY_COOL_DOWN = 5000; } // milliseconds
        constructor(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService) {
            super();
            this.notificationService = notificationService;
            this.remoteExplorerService = remoteExplorerService;
            this.openerService = openerService;
            this.externalOpenerService = externalOpenerService;
            this.tunnelService = tunnelService;
            this.hostService = hostService;
            this.logService = logService;
            this.contextKeyService = contextKeyService;
            this.alreadyOpenedOnce = new Set();
            this.lastNotifyTime = new Date();
            this.lastNotifyTime.setFullYear(this.lastNotifyTime.getFullYear() - 1);
        }
        async doAction(tunnels) {
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting action for ${tunnels[0]?.tunnelRemotePort}`);
            this.doActionTunnels = tunnels;
            const tunnel = await this.portNumberHeuristicDelay();
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose ${tunnel?.tunnelRemotePort}`);
            if (tunnel) {
                const allAttributes = await this.remoteExplorerService.tunnelModel.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]);
                const attributes = allAttributes?.get(tunnel.tunnelRemotePort)?.onAutoForward;
                this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) onAutoForward action is ${attributes}`);
                switch (attributes) {
                    case tunnelModel_1.OnPortForward.OpenBrowserOnce: {
                        if (this.alreadyOpenedOnce.has(tunnel.localAddress)) {
                            break;
                        }
                        this.alreadyOpenedOnce.add(tunnel.localAddress);
                        // Intentionally do not break so that the open browser path can be run.
                    }
                    case tunnelModel_1.OnPortForward.OpenBrowser: {
                        const address = (0, tunnelModel_1.makeAddress)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        await tunnelView_1.OpenPortInBrowserAction.run(this.remoteExplorerService.tunnelModel, this.openerService, address);
                        break;
                    }
                    case tunnelModel_1.OnPortForward.OpenPreview: {
                        const address = (0, tunnelModel_1.makeAddress)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        await tunnelView_1.OpenPortInPreviewAction.run(this.remoteExplorerService.tunnelModel, this.openerService, this.externalOpenerService, address);
                        break;
                    }
                    case tunnelModel_1.OnPortForward.Silent: break;
                    default: {
                        const elapsed = new Date().getTime() - this.lastNotifyTime.getTime();
                        this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) time elapsed since last notification ${elapsed} ms`);
                        if (elapsed > OnAutoForwardedAction.NOTIFY_COOL_DOWN) {
                            await this.showNotification(tunnel);
                        }
                    }
                }
            }
        }
        hide(removedPorts) {
            if (this.doActionTunnels) {
                this.doActionTunnels = this.doActionTunnels.filter(value => !removedPorts.includes(value.tunnelRemotePort));
            }
            if (this.lastShownPort && removedPorts.indexOf(this.lastShownPort) >= 0) {
                this.lastNotification?.close();
            }
        }
        async portNumberHeuristicDelay() {
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting heuristic delay`);
            if (!this.doActionTunnels || this.doActionTunnels.length === 0) {
                return;
            }
            this.doActionTunnels = this.doActionTunnels.sort((a, b) => a.tunnelRemotePort - b.tunnelRemotePort);
            const firstTunnel = this.doActionTunnels.shift();
            // Heuristic.
            if (firstTunnel.tunnelRemotePort % 1000 === 0) {
                this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because % 1000: ${firstTunnel.tunnelRemotePort}`);
                this.newerTunnel = firstTunnel;
                return firstTunnel;
                // 9229 is the node inspect port
            }
            else if (firstTunnel.tunnelRemotePort < 10000 && firstTunnel.tunnelRemotePort !== 9229) {
                this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because < 10000: ${firstTunnel.tunnelRemotePort}`);
                this.newerTunnel = firstTunnel;
                return firstTunnel;
            }
            this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Waiting for "better" tunnel than ${firstTunnel.tunnelRemotePort}`);
            this.newerTunnel = undefined;
            return new Promise(resolve => {
                setTimeout(() => {
                    if (this.newerTunnel) {
                        resolve(undefined);
                    }
                    else if (this.doActionTunnels?.includes(firstTunnel)) {
                        resolve(firstTunnel);
                    }
                    else {
                        resolve(undefined);
                    }
                }, 3000);
            });
        }
        async basicMessage(tunnel) {
            const properties = await this.remoteExplorerService.tunnelModel.getAttributes([{ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }], false);
            const label = properties?.get(tunnel.tunnelRemotePort)?.label;
            return nls.localize('remote.tunnelsView.automaticForward', "Your application{0} running on port {1} is available.  ", label ? ` (${label})` : '', tunnel.tunnelRemotePort);
        }
        linkMessage() {
            return nls.localize({ key: 'remote.tunnelsView.notificationLink2', comment: ['[See all forwarded ports]({0}) is a link. Only translate `See all forwarded ports`. Do not change brackets and parentheses or {0}'] }, "[See all forwarded ports]({0})", `command:${tunnelView_1.TunnelPanel.ID}.focus`);
        }
        async showNotification(tunnel) {
            if (!await this.hostService.hadLastFocus()) {
                return;
            }
            this.lastNotification?.close();
            let message = await this.basicMessage(tunnel);
            const choices = [this.openBrowserChoice(tunnel)];
            if (!platform_2.isWeb || tunnelView_1.openPreviewEnabledContext.getValue(this.contextKeyService)) {
                choices.push(this.openPreviewChoice(tunnel));
            }
            if ((tunnel.tunnelLocalPort !== tunnel.tunnelRemotePort) && this.tunnelService.canElevate && this.tunnelService.isPortPrivileged(tunnel.tunnelRemotePort)) {
                // Privileged ports are not on Windows, so it's safe to use "superuser"
                message += nls.localize('remote.tunnelsView.elevationMessage', "You'll need to run as superuser to use port {0} locally.  ", tunnel.tunnelRemotePort);
                choices.unshift(this.elevateChoice(tunnel));
            }
            if (tunnel.privacy === tunnel_1.TunnelPrivacyId.Private && platform_2.isWeb && this.tunnelService.canChangePrivacy) {
                choices.push(this.makePublicChoice(tunnel));
            }
            message += this.linkMessage();
            this.lastNotification = this.notificationService.prompt(severity_1.default.Info, message, choices, { neverShowAgain: { id: 'remote.tunnelsView.autoForwardNeverShow', isSecondary: true } });
            this.lastShownPort = tunnel.tunnelRemotePort;
            this.lastNotifyTime = new Date();
            this.lastNotification.onDidClose(() => {
                this.lastNotification = undefined;
                this.lastShownPort = undefined;
            });
        }
        makePublicChoice(tunnel) {
            return {
                label: nls.localize('remote.tunnelsView.makePublic', "Make Public"),
                run: async () => {
                    const oldTunnelDetails = (0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(this.remoteExplorerService.tunnelModel.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, tunnelModel_1.TunnelCloseReason.Other);
                    return this.remoteExplorerService.forward({
                        remote: { host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort },
                        local: tunnel.tunnelLocalPort,
                        name: oldTunnelDetails?.name,
                        elevateIfNeeded: true,
                        privacy: tunnel_1.TunnelPrivacyId.Public,
                        source: oldTunnelDetails?.source
                    });
                }
            };
        }
        openBrowserChoice(tunnel) {
            const address = (0, tunnelModel_1.makeAddress)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
            return {
                label: tunnelView_1.OpenPortInBrowserAction.LABEL,
                run: () => tunnelView_1.OpenPortInBrowserAction.run(this.remoteExplorerService.tunnelModel, this.openerService, address)
            };
        }
        openPreviewChoice(tunnel) {
            const address = (0, tunnelModel_1.makeAddress)(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
            return {
                label: tunnelView_1.OpenPortInPreviewAction.LABEL,
                run: () => tunnelView_1.OpenPortInPreviewAction.run(this.remoteExplorerService.tunnelModel, this.openerService, this.externalOpenerService, address)
            };
        }
        elevateChoice(tunnel) {
            return {
                // Privileged ports are not on Windows, so it's ok to stick to just "sudo".
                label: nls.localize('remote.tunnelsView.elevationButton', "Use Port {0} as Sudo...", tunnel.tunnelRemotePort),
                run: async () => {
                    await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, tunnelModel_1.TunnelCloseReason.Other);
                    const newTunnel = await this.remoteExplorerService.forward({
                        remote: { host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort },
                        local: tunnel.tunnelRemotePort,
                        elevateIfNeeded: true,
                        source: tunnelModel_1.AutoTunnelSource
                    });
                    if (!newTunnel || (typeof newTunnel === 'string')) {
                        return;
                    }
                    this.lastNotification?.close();
                    this.lastShownPort = newTunnel.tunnelRemotePort;
                    this.lastNotification = this.notificationService.prompt(severity_1.default.Info, await this.basicMessage(newTunnel) + this.linkMessage(), [this.openBrowserChoice(newTunnel), this.openPreviewChoice(tunnel)], { neverShowAgain: { id: 'remote.tunnelsView.autoForwardNeverShow', isSecondary: true } });
                    this.lastNotification.onDidClose(() => {
                        this.lastNotification = undefined;
                        this.lastShownPort = undefined;
                    });
                }
            };
        }
    }
    class OutputAutomaticPortForwarding extends lifecycle_1.Disposable {
        constructor(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, configurationService, debugService, tunnelService, hostService, logService, contextKeyService, privilegedOnly) {
            super();
            this.terminalService = terminalService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.externalOpenerService = externalOpenerService;
            this.remoteExplorerService = remoteExplorerService;
            this.configurationService = configurationService;
            this.debugService = debugService;
            this.tunnelService = tunnelService;
            this.hostService = hostService;
            this.logService = logService;
            this.contextKeyService = contextKeyService;
            this.privilegedOnly = privilegedOnly;
            this.notifier = new OnAutoForwardedAction(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
            this._register(configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                    this.tryStartStopUrlFinder();
                }
            }));
            this.portsFeatures = this._register(this.remoteExplorerService.onEnabledPortsFeatures(() => {
                this.tryStartStopUrlFinder();
            }));
            this.tryStartStopUrlFinder();
            if (configurationService.getValue(remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING) === remoteExplorerService_1.PORT_AUTO_SOURCE_SETTING_HYBRID) {
                this._register(this.tunnelService.onTunnelClosed(tunnel => this.notifier.hide([tunnel.port])));
            }
        }
        tryStartStopUrlFinder() {
            if (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                this.startUrlFinder();
            }
            else {
                this.stopUrlFinder();
            }
        }
        startUrlFinder() {
            if (!this.urlFinder && !this.remoteExplorerService.portsFeaturesEnabled) {
                return;
            }
            this.portsFeatures?.dispose();
            this.urlFinder = this._register(new urlFinder_1.UrlFinder(this.terminalService, this.debugService));
            this._register(this.urlFinder.onDidMatchLocalUrl(async (localUrl) => {
                if ((0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(this.remoteExplorerService.tunnelModel.detected, localUrl.host, localUrl.port)) {
                    return;
                }
                const attributes = (await this.remoteExplorerService.tunnelModel.getAttributes([localUrl]))?.get(localUrl.port);
                if (attributes?.onAutoForward === tunnelModel_1.OnPortForward.Ignore) {
                    return;
                }
                if (this.privilegedOnly() && !this.tunnelService.isPortPrivileged(localUrl.port)) {
                    return;
                }
                const forwarded = await this.remoteExplorerService.forward({ remote: localUrl, source: tunnelModel_1.AutoTunnelSource }, attributes ?? null);
                if (forwarded && (typeof forwarded !== 'string')) {
                    this.notifier.doAction([forwarded]);
                }
            }));
        }
        stopUrlFinder() {
            if (this.urlFinder) {
                this.urlFinder.dispose();
                this.urlFinder = undefined;
            }
        }
    }
    class ProcAutomaticPortForwarding extends lifecycle_1.Disposable {
        constructor(unforwardOnly, alreadyAutoForwarded, needsInitialCandidates, configurationService, remoteExplorerService, notificationService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService) {
            super();
            this.unforwardOnly = unforwardOnly;
            this.alreadyAutoForwarded = alreadyAutoForwarded;
            this.needsInitialCandidates = needsInitialCandidates;
            this.configurationService = configurationService;
            this.remoteExplorerService = remoteExplorerService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.externalOpenerService = externalOpenerService;
            this.tunnelService = tunnelService;
            this.hostService = hostService;
            this.logService = logService;
            this.contextKeyService = contextKeyService;
            this.autoForwarded = new Set();
            this.notifiedOnly = new Set();
            this.initialCandidates = new Set();
            this.notifier = new OnAutoForwardedAction(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
            alreadyAutoForwarded?.forEach(port => this.autoForwarded.add(port));
            this.initialize();
        }
        get forwarded() {
            return this.autoForwarded;
        }
        async initialize() {
            if (!this.remoteExplorerService.tunnelModel.environmentTunnelsSet) {
                await new Promise(resolve => this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet(() => resolve()));
            }
            this._register(this.configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                    await this.startStopCandidateListener();
                }
            }));
            this.portsFeatures = this._register(this.remoteExplorerService.onEnabledPortsFeatures(async () => {
                await this.startStopCandidateListener();
            }));
            this.startStopCandidateListener();
        }
        async startStopCandidateListener() {
            if (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                await this.startCandidateListener();
            }
            else {
                this.stopCandidateListener();
            }
        }
        stopCandidateListener() {
            if (this.candidateListener) {
                this.candidateListener.dispose();
                this.candidateListener = undefined;
            }
        }
        async startCandidateListener() {
            if (this.candidateListener || !this.remoteExplorerService.portsFeaturesEnabled) {
                return;
            }
            this.portsFeatures?.dispose();
            // Capture list of starting candidates so we don't auto forward them later.
            await this.setInitialCandidates();
            // Need to check the setting again, since it may have changed while we waited for the initial candidates to be set.
            if (this.configurationService.getValue(remoteExplorerService_1.PORT_AUTO_FORWARD_SETTING)) {
                this.candidateListener = this._register(this.remoteExplorerService.tunnelModel.onCandidatesChanged(this.handleCandidateUpdate, this));
            }
        }
        async setInitialCandidates() {
            if (!this.needsInitialCandidates) {
                this.logService.debug(`ForwardedPorts: (ProcForwarding) Not setting initial candidates`);
                return;
            }
            let startingCandidates = this.remoteExplorerService.tunnelModel.candidatesOrUndefined;
            if (!startingCandidates) {
                await new Promise(resolve => this.remoteExplorerService.tunnelModel.onCandidatesChanged(() => resolve()));
                startingCandidates = this.remoteExplorerService.tunnelModel.candidates;
            }
            for (const value of startingCandidates) {
                this.initialCandidates.add((0, tunnelModel_1.makeAddress)(value.host, value.port));
            }
            this.logService.debug(`ForwardedPorts: (ProcForwarding) Initial candidates set to ${startingCandidates.map(candidate => candidate.port).join(', ')}`);
        }
        async forwardCandidates() {
            let attributes;
            const allTunnels = [];
            this.logService.trace(`ForwardedPorts: (ProcForwarding) Attempting to forward ${this.remoteExplorerService.tunnelModel.candidates.length} candidates`);
            for (const value of this.remoteExplorerService.tunnelModel.candidates) {
                if (!value.detail) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} missing detail`);
                    continue;
                }
                if (!attributes) {
                    attributes = await this.remoteExplorerService.tunnelModel.getAttributes(this.remoteExplorerService.tunnelModel.candidates);
                }
                const portAttributes = attributes?.get(value.port);
                const address = (0, tunnelModel_1.makeAddress)(value.host, value.port);
                if (this.initialCandidates.has(address) && (portAttributes?.onAutoForward === undefined)) {
                    continue;
                }
                if (this.notifiedOnly.has(address) || this.autoForwarded.has(address)) {
                    continue;
                }
                const alreadyForwarded = (0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(this.remoteExplorerService.tunnelModel.forwarded, value.host, value.port);
                if ((0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(this.remoteExplorerService.tunnelModel.detected, value.host, value.port)) {
                    continue;
                }
                if (portAttributes?.onAutoForward === tunnelModel_1.OnPortForward.Ignore) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} is ignored`);
                    continue;
                }
                const forwarded = await this.remoteExplorerService.forward({ remote: value, source: tunnelModel_1.AutoTunnelSource }, portAttributes ?? null);
                if (!alreadyForwarded && forwarded) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} has been forwarded`);
                    this.autoForwarded.add(address);
                }
                else if (forwarded) {
                    this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value.port} has been notified`);
                    this.notifiedOnly.add(address);
                }
                if (forwarded && (typeof forwarded !== 'string')) {
                    allTunnels.push(forwarded);
                }
            }
            this.logService.trace(`ForwardedPorts: (ProcForwarding) Forwarded ${allTunnels.length} candidates`);
            if (allTunnels.length === 0) {
                return undefined;
            }
            return allTunnels;
        }
        async handleCandidateUpdate(removed) {
            const removedPorts = [];
            let autoForwarded;
            if (this.unforwardOnly) {
                autoForwarded = new Map();
                for (const entry of this.remoteExplorerService.tunnelModel.forwarded.entries()) {
                    if (entry[1].source.source === tunnelModel_1.TunnelSource.Auto) {
                        autoForwarded.set(entry[0], entry[1]);
                    }
                }
            }
            else {
                autoForwarded = new Map(this.autoForwarded.entries());
            }
            for (const removedPort of removed) {
                const key = removedPort[0];
                let value = removedPort[1];
                const forwardedValue = (0, tunnelModel_1.mapHasAddressLocalhostOrAllInterfaces)(autoForwarded, value.host, value.port);
                if (forwardedValue) {
                    if (typeof forwardedValue === 'string') {
                        this.autoForwarded.delete(key);
                    }
                    else {
                        value = { host: forwardedValue.remoteHost, port: forwardedValue.remotePort };
                    }
                    await this.remoteExplorerService.close(value, tunnelModel_1.TunnelCloseReason.AutoForwardEnd);
                    removedPorts.push(value.port);
                }
                else if (this.notifiedOnly.has(key)) {
                    this.notifiedOnly.delete(key);
                    removedPorts.push(value.port);
                }
                else if (this.initialCandidates.has(key)) {
                    this.initialCandidates.delete(key);
                }
            }
            if (this.unforwardOnly) {
                return;
            }
            if (removedPorts.length > 0) {
                await this.notifier.hide(removedPorts);
            }
            const tunnels = await this.forwardCandidates();
            if (tunnels) {
                await this.notifier.doAction(tunnels);
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXhwbG9yZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3JlbW90ZS9icm93c2VyL3JlbW90ZUV4cGxvcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUF3Q2EsUUFBQSxVQUFVLEdBQUcsdUJBQXVCLENBQUM7SUFFM0MsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQUtqRCxZQUNzQyxpQkFBcUMsRUFDM0Isa0JBQWdELEVBQ3RELHFCQUE2QyxFQUNyRCxhQUE2QixFQUMzQixlQUFpQyxFQUNoQyxnQkFBbUM7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFQNkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUMzQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQ3RELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDckQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzNCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNoQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBR3ZFLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQVEsQ0FBQyxFQUFFLENBQWlCLGtCQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsMEJBQTBCLENBQUMsc0NBQWMsRUFBRTtnQkFDL0csT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLG9HQUFvRyxFQUFFLFdBQVcsOEJBQWlCLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQy9OLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLHNIQUFzSCxFQUFFLFdBQVcsOEJBQWlCLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDcE0sQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRU8sS0FBSyxDQUFDLGdCQUFnQjtZQUM3QixPQUFPLG1CQUFRLENBQUMsRUFBRSxDQUEwQixrQkFBVSxDQUFDLHNCQUFzQixDQUFDLENBQUMscUJBQXFCLENBQUM7Z0JBQ3BHLEVBQUUsRUFBRSxnREFBd0I7Z0JBQzVCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO2dCQUNuRSxJQUFJLEVBQUUsMkJBQWE7Z0JBQ25CLGNBQWMsRUFBRSxJQUFJLDRCQUFjLENBQUMscUNBQWlCLEVBQUUsQ0FBQyxnREFBd0IsRUFBRSxFQUFFLG9DQUFvQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ2pJLFNBQVMsRUFBRSxnREFBd0I7Z0JBQ25DLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixLQUFLLEVBQUUsQ0FBQzthQUNSLHNDQUE4QixDQUFDO1FBQ2pDLENBQUM7UUFFTyxLQUFLLENBQUMsd0JBQXdCO1lBQ3JDLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztZQUNyQyxDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQVksQ0FBQyxDQUFDLHVDQUF5QixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUUxRixJQUFJLFdBQVcsRUFBRSxDQUFDO2dCQUNqQixNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNwRCxNQUFNLHFCQUFxQixHQUFHLElBQUksa0NBQXFCLENBQUMsSUFBSSw0QkFBZSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3RKLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM1RSxJQUFJLGFBQWEsRUFBRSxDQUFDO29CQUNuQixJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFDakQsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDLHFCQUFzQixDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3RFLENBQUM7WUFDRixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDdkUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDLHVDQUF5QixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUM5RCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztvQkFDakMsQ0FBQztnQkFDRixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUM7UUFDRixDQUFDO1FBRU8sdUJBQXVCO1lBQzlCLE1BQU0sVUFBVSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM5RixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEtBQUssc0NBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDN0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRTt3QkFDN0csSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7d0JBQzNCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDSixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFO3dCQUMzRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzt3QkFDM0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVKLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO29CQUMzQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ3ZCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLEtBQUssQ0FBQyxtQkFBbUI7WUFDaEMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUMvQixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLHNDQUFjLEVBQUU7b0JBQzNFLEtBQUssRUFBRSxJQUFJLHNCQUFXLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUM1TSxDQUFDLENBQUM7WUFDSixDQUFDO1FBQ0YsQ0FBQztRQUVPLGVBQWU7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSx1QkFBdUIsbUNBQTJCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkksQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0YsQ0FBQztRQUVELElBQVksS0FBSztZQUNoQixJQUFJLE9BQWUsQ0FBQztZQUNwQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQzNILE1BQU0sSUFBSSxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUM7WUFDeEIsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ2pCLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHlDQUF5QyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDekYsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDekYsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN6RixPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSxzQkFBc0IsRUFDdEYsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoRSxDQUFDO1lBQ0QsT0FBTztnQkFDTixJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxpQkFBaUIsQ0FBQztnQkFDOUQsSUFBSSxFQUFFLGtCQUFrQixJQUFJLEVBQUU7Z0JBQzlCLFNBQVMsRUFBRSxPQUFPO2dCQUNsQixPQUFPO2dCQUNQLE9BQU8sRUFBRSxHQUFHLHNDQUFjLFFBQVE7YUFDbEMsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBbkhZLGdEQUFrQjtpQ0FBbEIsa0JBQWtCO1FBTTVCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSxpREFBNEIsQ0FBQTtRQUM1QixXQUFBLDhDQUFzQixDQUFBO1FBQ3RCLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSw2QkFBaUIsQ0FBQTtPQVhQLGtCQUFrQixDQW1IOUI7SUFFTSxJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFXO1FBQ3ZCLFlBQzBDLHFCQUE2QyxFQUN4RCxVQUF1QjtZQURaLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDeEQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUVyRCxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUNuRSxhQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDckYsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQixDQUFDO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxPQUFPO1lBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDOUQsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0MsQ0FBQztLQUNELENBQUE7SUFsQlksa0NBQVc7MEJBQVgsV0FBVztRQUVyQixXQUFBLDhDQUFzQixDQUFBO1FBQ3RCLFdBQUEsaUJBQVcsQ0FBQTtPQUhELFdBQVcsQ0FrQnZCO0lBR00sSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxzQkFBVTtRQUt0RCxZQUNvQyxlQUFpQyxFQUM3QixtQkFBeUMsRUFDL0MsYUFBNkIsRUFDbEIscUJBQWdELEVBQ25ELHFCQUE2QyxFQUMvQyxrQkFBZ0QsRUFDbEQsaUJBQXFDLEVBQ3pCLG9CQUFvRCxFQUNyRSxZQUEyQixFQUM3QixrQkFBdUMsRUFDcEMsYUFBNkIsRUFDL0IsV0FBeUIsRUFDMUIsVUFBdUIsRUFDbkIsY0FBK0IsRUFDM0Isa0JBQXVDO1lBRTdFLEtBQUssRUFBRSxDQUFDO1lBaEIyQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDN0Isd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUMvQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDbEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUEyQjtZQUNuRCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQy9DLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7WUFDbEQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN6Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQWdDO1lBQ3JFLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQzdCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDcEMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQy9CLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQzFCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDbkIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzNCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFHN0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN6QyxPQUFPO1lBQ1IsQ0FBQztZQUVELG9CQUFvQixDQUFDLDZCQUE2QixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUN2SCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNoRSxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxnREFBd0IsQ0FBQyxFQUFFLENBQUM7d0JBQ3RELElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3pCLENBQUM7eUJBQU0sSUFBSSxDQUFDLENBQUMsb0JBQW9CLENBQUMsa0RBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzt3QkFDckYsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUN2QixDQUFDO2dCQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQywrQkFBK0Isa0NBQTBCLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3BHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsa0RBQTBCLEVBQUUsQ0FBQyx3Q0FBZ0MsQ0FBQztZQUNyRyxDQUFDO1FBQ0YsQ0FBQztRQUVPLGNBQWM7WUFDckIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBUyxrREFBMEIsQ0FBQyxDQUFDO1lBQ3hGLElBQUksVUFBVSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1IsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLGdEQUF3QixDQUFDLEtBQUssd0RBQWdDLENBQUMsRUFBRSxDQUFDO2dCQUNySixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQ2xHLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFTLGtEQUEwQixDQUFDLENBQUM7b0JBQ3BGLElBQUksVUFBVSxLQUFLLENBQUMsRUFBRSxDQUFDO3dCQUN0QixJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixPQUFPO29CQUNSLENBQUM7b0JBQ0QsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssMEJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxFQUFFLENBQUM7d0JBQzVKLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxnREFBd0IsRUFBRSx1REFBK0IsQ0FBQyxDQUFDO3dCQUN2RyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDOzRCQUMvQixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSxpTEFBaUwsQ0FBQzs0QkFDbFAsUUFBUSxFQUFFLGtCQUFRLENBQUMsT0FBTzs0QkFDMUIsT0FBTyxFQUFFO2dDQUNSLE9BQU8sRUFBRTtvQ0FDUixJQUFJLGdCQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsbURBQW1ELEVBQUUsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTt3Q0FDL0gsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLGdEQUF3QixFQUFFLHdEQUFnQyxDQUFDLENBQUM7d0NBQ3hHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxrREFBMEIsRUFBRSxDQUFDLHdDQUFnQyxDQUFDO3dDQUMxRyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDO3dDQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztvQ0FDL0IsQ0FBQyxDQUFDO29DQUNGLElBQUksZ0JBQU0sQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDhEQUE4RCxFQUFFLGNBQWMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUU7d0NBQzdKLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQzs0Q0FDMUMsS0FBSyxFQUFFLCtCQUErQjt5Q0FDdEMsQ0FBQyxDQUFDO29DQUNKLENBQUMsQ0FBQztpQ0FDRjs2QkFDRDt5QkFDRCxDQUFDLENBQUM7b0JBQ0osQ0FBQztnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1lBQy9CLENBQUM7UUFDRixDQUFDO1FBR08sS0FBSyxDQUFDLFdBQTJDO1lBQ3hELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUM7WUFDdkQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQzVELElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDL0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztZQUNqQyxJQUFJLFdBQVcsRUFBRSxFQUFFLGtDQUEwQixFQUFFLENBQUM7Z0JBQy9DLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBdUIsQ0FBQyxhQUFhLENBQUM7cUJBQ3hFLDZCQUE2QixDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSwrQkFBK0IsRUFBRSx1REFBK0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN2SCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFDckssSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3pLLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsZ0RBQXdCLENBQUMsS0FBSyx3REFBZ0MsQ0FBQyxDQUFDO2dCQUMxSCxJQUFJLE9BQU8sRUFBRSxFQUFFLENBQUM7b0JBQ2YsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQTJCLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUN0TCxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUNsSSxDQUFDO3FCQUFNLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxnREFBd0IsQ0FBQyxLQUFLLHVEQUErQixFQUFFLENBQUM7b0JBQzdHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUEyQixDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFDckwsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDbEksQ0FBQztnQkFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFDckssSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3JLLENBQUM7WUFDRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsQ0FBQztLQUNELENBQUE7SUFqSFksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFNakMsV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLG1DQUFvQixDQUFBO1FBQ3BCLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsb0RBQXlCLENBQUE7UUFDekIsV0FBQSw4Q0FBc0IsQ0FBQTtRQUN0QixXQUFBLGlEQUE0QixDQUFBO1FBQzVCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSw4Q0FBOEIsQ0FBQTtRQUM5QixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFlBQUEsdUJBQWMsQ0FBQTtRQUNkLFlBQUEsbUJBQVksQ0FBQTtRQUNaLFlBQUEsaUJBQVcsQ0FBQTtRQUNYLFlBQUEseUJBQWUsQ0FBQTtRQUNmLFlBQUEsaUNBQW1CLENBQUE7T0FwQlQsdUJBQXVCLENBaUhuQztJQUVELE1BQU0scUJBQXNCLFNBQVEsc0JBQVU7aUJBRTlCLHFCQUFnQixHQUFHLElBQUksQUFBUCxDQUFRLEdBQUMsZUFBZTtRQU12RCxZQUE2QixtQkFBeUMsRUFDcEQscUJBQTZDLEVBQzdDLGFBQTZCLEVBQzdCLHFCQUFnRCxFQUNoRCxhQUE2QixFQUM3QixXQUF5QixFQUN6QixVQUF1QixFQUN2QixpQkFBcUM7WUFDdEQsS0FBSyxFQUFFLENBQUM7WUFSb0Isd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUNwRCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQzdDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUM3QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQTJCO1lBQ2hELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUM3QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUN6QixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3ZCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFUL0Msc0JBQWlCLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUM7WUFXbEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVNLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBdUI7WUFDNUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0RBQStELE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7WUFDckgsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUM7WUFDL0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQywyREFBMkQsTUFBTSxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztZQUM3RyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNaLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckosTUFBTSxVQUFVLEdBQUcsYUFBYSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxhQUFhLENBQUM7Z0JBQzlFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLG1FQUFtRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RyxRQUFRLFVBQVUsRUFBRSxDQUFDO29CQUNwQixLQUFLLDJCQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzt3QkFDcEMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDOzRCQUNyRCxNQUFNO3dCQUNQLENBQUM7d0JBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQ2hELHVFQUF1RTtvQkFDeEUsQ0FBQztvQkFDRCxLQUFLLDJCQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBQSx5QkFBVyxFQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDOUUsTUFBTSxvQ0FBdUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUN2RyxNQUFNO29CQUNQLENBQUM7b0JBQ0QsS0FBSywyQkFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7d0JBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUEseUJBQVcsRUFBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQzlFLE1BQU0sb0NBQXVCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ25JLE1BQU07b0JBQ1AsQ0FBQztvQkFDRCxLQUFLLDJCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTTtvQkFDakMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDVCxNQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ3JFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGdGQUFnRixPQUFPLEtBQUssQ0FBQyxDQUFDO3dCQUNwSCxJQUFJLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOzRCQUN0RCxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDckMsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVNLElBQUksQ0FBQyxZQUFzQjtZQUNqQyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQzdHLENBQUM7WUFDRCxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNoQyxDQUFDO1FBQ0YsQ0FBQztRQUdPLEtBQUssQ0FBQyx3QkFBd0I7WUFDckMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsa0VBQWtFLENBQUMsQ0FBQztZQUMxRixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDaEUsT0FBTztZQUNSLENBQUM7WUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3BHLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFHLENBQUM7WUFDbEQsYUFBYTtZQUNiLElBQUksV0FBVyxDQUFDLGdCQUFnQixHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsa0ZBQWtGLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7Z0JBQ3hJLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUMvQixPQUFPLFdBQVcsQ0FBQztnQkFDbkIsZ0NBQWdDO1lBQ2pDLENBQUM7aUJBQU0sSUFBSSxXQUFXLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDMUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsbUZBQW1GLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7Z0JBQ3pJLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUMvQixPQUFPLFdBQVcsQ0FBQztZQUNwQixDQUFDO1lBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsNEVBQTRFLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7WUFDbEksSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7WUFDN0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDNUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDZixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDdEIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNwQixDQUFDO3lCQUFNLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQzt3QkFDeEQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUN0QixDQUFDO3lCQUFNLENBQUM7d0JBQ1AsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNwQixDQUFDO2dCQUNGLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBb0I7WUFDOUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6SixNQUFNLEtBQUssR0FBRyxVQUFVLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssQ0FBQztZQUM5RCxPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMscUNBQXFDLEVBQUUseURBQXlELEVBQ25ILEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUMxQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRU8sV0FBVztZQUNsQixPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQ2xCLEVBQUUsR0FBRyxFQUFFLHNDQUFzQyxFQUFFLE9BQU8sRUFBRSxDQUFDLG1JQUFtSSxDQUFDLEVBQUUsRUFDL0wsZ0NBQWdDLEVBQUUsV0FBVyx3QkFBVyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFvQjtZQUNsRCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7Z0JBQzVDLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxDQUFDO1lBQy9CLElBQUksT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxNQUFNLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxnQkFBSyxJQUFJLHNDQUF5QixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO2dCQUMxRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlDLENBQUM7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsS0FBSyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7Z0JBQzNKLHVFQUF1RTtnQkFDdkUsT0FBTyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMscUNBQXFDLEVBQUUsNERBQTRELEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3RKLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFFRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssd0JBQWUsQ0FBQyxPQUFPLElBQUksZ0JBQUssSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ2hHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUVELE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFOUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsa0JBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSx5Q0FBeUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25MLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQzdDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sZ0JBQWdCLENBQUMsTUFBb0I7WUFDNUMsT0FBTztnQkFDTixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSxhQUFhLENBQUM7Z0JBQ25FLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDZixNQUFNLGdCQUFnQixHQUFHLElBQUEsbURBQXFDLEVBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNuSyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSwrQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDbEksT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDO3dCQUN6QyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7d0JBQ3hFLEtBQUssRUFBRSxNQUFNLENBQUMsZUFBZTt3QkFDN0IsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUk7d0JBQzVCLGVBQWUsRUFBRSxJQUFJO3dCQUNyQixPQUFPLEVBQUUsd0JBQWUsQ0FBQyxNQUFNO3dCQUMvQixNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTTtxQkFDaEMsQ0FBQyxDQUFDO2dCQUNKLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVPLGlCQUFpQixDQUFDLE1BQW9CO1lBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUEseUJBQVcsRUFBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDOUUsT0FBTztnQkFDTixLQUFLLEVBQUUsb0NBQXVCLENBQUMsS0FBSztnQkFDcEMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLG9DQUF1QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDO2FBQzNHLENBQUM7UUFDSCxDQUFDO1FBRU8saUJBQWlCLENBQUMsTUFBb0I7WUFDN0MsTUFBTSxPQUFPLEdBQUcsSUFBQSx5QkFBVyxFQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM5RSxPQUFPO2dCQUNOLEtBQUssRUFBRSxvQ0FBdUIsQ0FBQyxLQUFLO2dCQUNwQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsb0NBQXVCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUsT0FBTyxDQUFDO2FBQ3ZJLENBQUM7UUFDSCxDQUFDO1FBRU8sYUFBYSxDQUFDLE1BQW9CO1lBQ3pDLE9BQU87Z0JBQ04sMkVBQTJFO2dCQUMzRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSx5QkFBeUIsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzdHLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDZixNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSwrQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDbEksTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDO3dCQUMxRCxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7d0JBQ3hFLEtBQUssRUFBRSxNQUFNLENBQUMsZ0JBQWdCO3dCQUM5QixlQUFlLEVBQUUsSUFBSTt3QkFDckIsTUFBTSxFQUFFLDhCQUFnQjtxQkFDeEIsQ0FBQyxDQUFDO29CQUNILElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxRQUFRLENBQUMsRUFBRSxDQUFDO3dCQUNuRCxPQUFPO29CQUNSLENBQUM7b0JBQ0QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxDQUFDO29CQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDaEQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsa0JBQVEsQ0FBQyxJQUFJLEVBQ3BFLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQ3ZELENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUNuRSxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsRUFBRSx5Q0FBeUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUMzRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTt3QkFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQzt3QkFDbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7b0JBQ2hDLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQzs7SUFHRixNQUFNLDZCQUE4QixTQUFRLHNCQUFVO1FBS3JELFlBQ2tCLGVBQWlDLEVBQ3pDLG1CQUF5QyxFQUN6QyxhQUE2QixFQUM3QixxQkFBZ0QsRUFDeEMscUJBQTZDLEVBQzdDLG9CQUEyQyxFQUMzQyxZQUEyQixFQUNuQyxhQUE2QixFQUM3QixXQUF5QixFQUN6QixVQUF1QixFQUN2QixpQkFBcUMsRUFDckMsY0FBNkI7WUFFdEMsS0FBSyxFQUFFLENBQUM7WUFiUyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDekMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUN6QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDN0IsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUEyQjtZQUN4QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQzdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDbkMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzdCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3pCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDdkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNyQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZTtZQUd0QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUkscUJBQXFCLENBQUMsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUsYUFBYSxFQUFFLHFCQUFxQixFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDdkwsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNsRSxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxpREFBeUIsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZELElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM5QixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFO2dCQUMxRixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFN0IsSUFBSSxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsZ0RBQXdCLENBQUMsS0FBSyx1REFBK0IsRUFBRSxDQUFDO2dCQUNqRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEcsQ0FBQztRQUNGLENBQUM7UUFFTyxxQkFBcUI7WUFDNUIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLGlEQUF5QixDQUFDLEVBQUUsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdEIsQ0FBQztRQUNGLENBQUM7UUFFTyxjQUFjO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQ3pFLE9BQU87WUFDUixDQUFDO1lBQ0QsSUFBSSxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDeEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRTtnQkFDbkUsSUFBSSxJQUFBLG1EQUFxQyxFQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQzFILE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxNQUFNLFVBQVUsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEgsSUFBSSxVQUFVLEVBQUUsYUFBYSxLQUFLLDJCQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3hELE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ2xGLE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSw4QkFBZ0IsRUFBRSxFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztnQkFDL0gsSUFBSSxTQUFTLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxRQUFRLENBQUMsRUFBRSxDQUFDO29CQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLGFBQWE7WUFDcEIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzVCLENBQUM7UUFDRixDQUFDO0tBQ0Q7SUFFRCxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO1FBUW5ELFlBQ2tCLGFBQXNCLEVBQzlCLG9CQUE2QyxFQUNyQyxzQkFBK0IsRUFDL0Isb0JBQTJDLEVBQ25ELHFCQUE2QyxFQUM3QyxtQkFBeUMsRUFDekMsYUFBNkIsRUFDN0IscUJBQWdELEVBQ2hELGFBQTZCLEVBQzdCLFdBQXlCLEVBQ3pCLFVBQXVCLEVBQ3ZCLGlCQUFxQztZQUU5QyxLQUFLLEVBQUUsQ0FBQztZQWJTLGtCQUFhLEdBQWIsYUFBYSxDQUFTO1lBQzlCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBeUI7WUFDckMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUFTO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDbkQsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUM3Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ3pDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUM3QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQTJCO1lBQ2hELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUM3QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUN6QixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3ZCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFsQnZDLGtCQUFhLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDdkMsaUJBQVksR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUV0QyxzQkFBaUIsR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQWtCbEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHFCQUFxQixDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLGFBQWEsRUFBRSxxQkFBcUIsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3ZMLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ25CLENBQUM7UUFFRCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVPLEtBQUssQ0FBQyxVQUFVO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ25FLE1BQU0sSUFBSSxPQUFPLENBQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNySCxDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM3RSxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxpREFBeUIsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZELE1BQU0sSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7Z0JBQ3pDLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDaEcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVPLEtBQUssQ0FBQywwQkFBMEI7WUFDdkMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLGlEQUF5QixDQUFDLEVBQUUsQ0FBQztnQkFDbkUsTUFBTSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUNyQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDOUIsQ0FBQztRQUNGLENBQUM7UUFFTyxxQkFBcUI7WUFDNUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDO1lBQ3BDLENBQUM7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLHNCQUFzQjtZQUNuQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUNoRixPQUFPO1lBQ1IsQ0FBQztZQUNELElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFFOUIsMkVBQTJFO1lBQzNFLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFFbEMsbUhBQW1IO1lBQ25ILElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxpREFBeUIsQ0FBQyxFQUFFLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkksQ0FBQztRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsb0JBQW9CO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsaUVBQWlFLENBQUMsQ0FBQztnQkFDekYsT0FBTztZQUNSLENBQUM7WUFDRCxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUM7WUFDdEYsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3pCLE1BQU0sSUFBSSxPQUFPLENBQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEgsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUM7WUFDeEUsQ0FBQztZQUVELEtBQUssTUFBTSxLQUFLLElBQUksa0JBQWtCLEVBQUUsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFBLHlCQUFXLEVBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqRSxDQUFDO1lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsOERBQThELGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZKLENBQUM7UUFFTyxLQUFLLENBQUMsaUJBQWlCO1lBQzlCLElBQUksVUFBK0MsQ0FBQztZQUNwRCxNQUFNLFVBQVUsR0FBbUIsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLDBEQUEwRCxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLGFBQWEsQ0FBQyxDQUFDO1lBQ3ZKLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdkUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMseUNBQXlDLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDLENBQUM7b0JBQzVGLFNBQVM7Z0JBQ1YsQ0FBQztnQkFFRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ2pCLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzVILENBQUM7Z0JBRUQsTUFBTSxjQUFjLEdBQUcsVUFBVSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRW5ELE1BQU0sT0FBTyxHQUFHLElBQUEseUJBQVcsRUFBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGFBQWEsS0FBSyxTQUFTLENBQUMsRUFBRSxDQUFDO29CQUMxRixTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUN2RSxTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLG1EQUFxQyxFQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6SSxJQUFJLElBQUEsbURBQXFDLEVBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDcEgsU0FBUztnQkFDVixDQUFDO2dCQUVELElBQUksY0FBYyxFQUFFLGFBQWEsS0FBSywyQkFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUM1RCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsS0FBSyxDQUFDLElBQUksYUFBYSxDQUFDLENBQUM7b0JBQ3hGLFNBQVM7Z0JBQ1YsQ0FBQztnQkFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSw4QkFBZ0IsRUFBRSxFQUFFLGNBQWMsSUFBSSxJQUFJLENBQUMsQ0FBQztnQkFDaEksSUFBSSxDQUFDLGdCQUFnQixJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsS0FBSyxDQUFDLElBQUkscUJBQXFCLENBQUMsQ0FBQztvQkFDaEcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7cUJBQU0sSUFBSSxTQUFTLEVBQUUsQ0FBQztvQkFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMseUNBQXlDLEtBQUssQ0FBQyxJQUFJLG9CQUFvQixDQUFDLENBQUM7b0JBQy9GLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO2dCQUNELElBQUksU0FBUyxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDbEQsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztZQUNGLENBQUM7WUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsVUFBVSxDQUFDLE1BQU0sYUFBYSxDQUFDLENBQUM7WUFDcEcsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1lBQ0QsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztRQUVPLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxPQUFvRDtZQUN2RixNQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7WUFDbEMsSUFBSSxhQUEyQyxDQUFDO1lBQ2hELElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN4QixhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDMUIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO29CQUNoRixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLDBCQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ2xELGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2QyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN2RCxDQUFDO1lBRUQsS0FBSyxNQUFNLFdBQVcsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDbkMsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sY0FBYyxHQUFHLElBQUEsbURBQXFDLEVBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRyxJQUFJLGNBQWMsRUFBRSxDQUFDO29CQUNwQixJQUFJLE9BQU8sY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO3dCQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDaEMsQ0FBQzt5QkFBTSxDQUFDO3dCQUNQLEtBQUssR0FBRyxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzlFLENBQUM7b0JBQ0QsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSwrQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDaEYsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9CLENBQUM7cUJBQU0sSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDOUIsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9CLENBQUM7cUJBQU0sSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzVDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3hCLE9BQU87WUFDUixDQUFDO1lBRUQsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM3QixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3hDLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQy9DLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ2IsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0YsQ0FBQztLQUNEIn0=
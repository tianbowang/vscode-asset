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
define(["require", "exports", "vs/nls", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/label/common/label", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/workbench/services/extensions/common/extensions", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/environment/browser/environmentService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/host/browser/host", "vs/base/common/platform", "vs/base/common/strings", "vs/platform/workspace/common/workspace", "vs/platform/remote/common/remoteHosts", "vs/platform/workspace/common/virtualWorkspace", "vs/base/common/iconLabels", "vs/platform/log/common/log", "vs/workbench/browser/actions/windowActions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/common/extensions", "vs/base/common/htmlContent", "vs/workbench/common/contextkeys", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/telemetry/common/telemetry", "vs/platform/product/common/productService", "vs/base/browser/event", "vs/platform/extensions/common/extensions", "vs/base/common/cancellation", "vs/base/common/themables", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/base/browser/window"], function (require, exports, nls, remoteAgentService_1, async_1, event_1, lifecycle_1, actions_1, statusbar_1, label_1, contextkey_1, commands_1, network_1, extensions_1, quickInput_1, environmentService_1, remoteAuthorityResolver_1, host_1, platform_1, strings_1, workspace_1, remoteHosts_1, virtualWorkspace_1, iconLabels_1, log_1, windowActions_1, extensionManagement_1, extensions_2, htmlContent_1, contextkeys_1, panecomposite_1, telemetry_1, productService_1, event_2, extensions_3, cancellation_1, themables_1, extensionsIcons_1, opener_1, uri_1, window_1) {
    "use strict";
    var RemoteStatusIndicator_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteStatusIndicator = void 0;
    let RemoteStatusIndicator = class RemoteStatusIndicator extends lifecycle_1.Disposable {
        static { RemoteStatusIndicator_1 = this; }
        static { this.REMOTE_ACTIONS_COMMAND_ID = 'workbench.action.remote.showMenu'; }
        static { this.CLOSE_REMOTE_COMMAND_ID = 'workbench.action.remote.close'; }
        static { this.SHOW_CLOSE_REMOTE_COMMAND_ID = !platform_1.isWeb; } // web does not have a "Close Remote" command
        static { this.INSTALL_REMOTE_EXTENSIONS_ID = 'workbench.action.remote.extensions'; }
        static { this.REMOTE_STATUS_LABEL_MAX_LENGTH = 40; }
        static { this.REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY = 60 * 1000; }
        static { this.REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY = 10 * 1000; }
        constructor(statusbarService, environmentService, labelService, contextKeyService, menuService, quickInputService, commandService, extensionService, remoteAgentService, remoteAuthorityResolverService, hostService, workspaceContextService, logService, extensionGalleryService, telemetryService, productService, extensionManagementService, openerService) {
            super();
            this.statusbarService = statusbarService;
            this.environmentService = environmentService;
            this.labelService = labelService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.quickInputService = quickInputService;
            this.commandService = commandService;
            this.extensionService = extensionService;
            this.remoteAgentService = remoteAgentService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.hostService = hostService;
            this.workspaceContextService = workspaceContextService;
            this.logService = logService;
            this.extensionGalleryService = extensionGalleryService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.extensionManagementService = extensionManagementService;
            this.openerService = openerService;
            this.legacyIndicatorMenu = this._register(this.menuService.createMenu(actions_1.MenuId.StatusBarWindowIndicatorMenu, this.contextKeyService)); // to be removed once migration completed
            this.remoteIndicatorMenu = this._register(this.menuService.createMenu(actions_1.MenuId.StatusBarRemoteIndicatorMenu, this.contextKeyService));
            this.remoteAuthority = this.environmentService.remoteAuthority;
            this.virtualWorkspaceLocation = undefined;
            this.connectionState = undefined;
            this.connectionToken = undefined;
            this.connectionStateContextKey = new contextkey_1.RawContextKey('remoteConnectionState', '').bindTo(this.contextKeyService);
            this.networkState = undefined;
            this.measureNetworkConnectionLatencyScheduler = undefined;
            this.loggedInvalidGroupNames = Object.create(null);
            this.remoteMetadataInitialized = false;
            this._onDidChangeEntries = this._register(new event_1.Emitter());
            this.onDidChangeEntries = this._onDidChangeEntries.event;
            const remoteExtensionTips = { ...this.productService.remoteExtensionTips, ...this.productService.virtualWorkspaceExtensionTips };
            this.remoteExtensionMetadata = Object.values(remoteExtensionTips).filter(value => value.startEntry !== undefined).map(value => {
                return {
                    id: value.extensionId,
                    installed: false,
                    friendlyName: value.friendlyName,
                    isPlatformCompatible: false,
                    dependencies: [],
                    helpLink: value.startEntry?.helpLink ?? '',
                    startConnectLabel: value.startEntry?.startConnectLabel ?? '',
                    startCommand: value.startEntry?.startCommand ?? '',
                    priority: value.startEntry?.priority ?? 10,
                    supportedPlatforms: value.supportedPlatforms
                };
            });
            this.remoteExtensionMetadata.sort((ext1, ext2) => ext1.priority - ext2.priority);
            // Set initial connection state
            if (this.remoteAuthority) {
                this.connectionState = 'initializing';
                this.connectionStateContextKey.set(this.connectionState);
            }
            else {
                this.updateVirtualWorkspaceLocation();
            }
            this.registerActions();
            this.registerListeners();
            this.updateWhenInstalledExtensionsRegistered();
            this.updateRemoteStatusIndicator();
        }
        registerActions() {
            const category = { value: nls.localize('remote.category', "Remote"), original: 'Remote' };
            // Show Remote Menu
            const that = this;
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: RemoteStatusIndicator_1.REMOTE_ACTIONS_COMMAND_ID,
                        category,
                        title: { value: nls.localize('remote.showMenu', "Show Remote Menu"), original: 'Show Remote Menu' },
                        f1: true,
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 45 /* KeyCode.KeyO */,
                        }
                    });
                    this.run = () => that.showRemoteMenu();
                }
            });
            // Close Remote Connection
            if (RemoteStatusIndicator_1.SHOW_CLOSE_REMOTE_COMMAND_ID) {
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: RemoteStatusIndicator_1.CLOSE_REMOTE_COMMAND_ID,
                            category,
                            title: { value: nls.localize('remote.close', "Close Remote Connection"), original: 'Close Remote Connection' },
                            f1: true,
                            precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.RemoteNameContext, contextkeys_1.VirtualWorkspaceContext)
                        });
                        this.run = () => that.hostService.openWindow({ forceReuseWindow: true, remoteAuthority: null });
                    }
                });
                if (this.remoteAuthority) {
                    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
                        group: '6_close',
                        command: {
                            id: RemoteStatusIndicator_1.CLOSE_REMOTE_COMMAND_ID,
                            title: nls.localize({ key: 'miCloseRemote', comment: ['&& denotes a mnemonic'] }, "Close Re&&mote Connection")
                        },
                        order: 3.5
                    });
                }
            }
            if (this.extensionGalleryService.isEnabled()) {
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: RemoteStatusIndicator_1.INSTALL_REMOTE_EXTENSIONS_ID,
                            category,
                            title: { value: nls.localize('remote.install', "Install Remote Development Extensions"), original: 'Install Remote Development Extensions' },
                            f1: true
                        });
                        this.run = (accessor, input) => {
                            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
                            return paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true).then(viewlet => {
                                if (viewlet) {
                                    (viewlet?.getViewPaneContainer()).search(`@recommended:remotes`);
                                    viewlet.focus();
                                }
                            });
                        };
                    }
                });
            }
        }
        registerListeners() {
            // Menu changes
            const updateRemoteActions = () => {
                this.remoteMenuActionsGroups = undefined;
                this.updateRemoteStatusIndicator();
            };
            this._register(this.legacyIndicatorMenu.onDidChange(updateRemoteActions));
            this._register(this.remoteIndicatorMenu.onDidChange(updateRemoteActions));
            // Update indicator when formatter changes as it may have an impact on the remote label
            this._register(this.labelService.onDidChangeFormatters(() => this.updateRemoteStatusIndicator()));
            // Update based on remote indicator changes if any
            const remoteIndicator = this.environmentService.options?.windowIndicator;
            if (remoteIndicator && remoteIndicator.onDidChange) {
                this._register(remoteIndicator.onDidChange(() => this.updateRemoteStatusIndicator()));
            }
            // Listen to changes of the connection
            if (this.remoteAuthority) {
                const connection = this.remoteAgentService.getConnection();
                if (connection) {
                    this._register(connection.onDidStateChange((e) => {
                        switch (e.type) {
                            case 0 /* PersistentConnectionEventType.ConnectionLost */:
                            case 2 /* PersistentConnectionEventType.ReconnectionRunning */:
                            case 1 /* PersistentConnectionEventType.ReconnectionWait */:
                                this.setConnectionState('reconnecting');
                                break;
                            case 3 /* PersistentConnectionEventType.ReconnectionPermanentFailure */:
                                this.setConnectionState('disconnected');
                                break;
                            case 4 /* PersistentConnectionEventType.ConnectionGain */:
                                this.setConnectionState('connected');
                                break;
                        }
                    }));
                }
            }
            else {
                this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => {
                    this.updateVirtualWorkspaceLocation();
                    this.updateRemoteStatusIndicator();
                }));
            }
            // Online / Offline changes (web only)
            if (platform_1.isWeb) {
                this._register(event_1.Event.any(this._register(new event_2.DomEmitter(window_1.mainWindow, 'online')).event, this._register(new event_2.DomEmitter(window_1.mainWindow, 'offline')).event)(() => this.setNetworkState(navigator.onLine ? 'online' : 'offline')));
            }
            this._register(this.extensionService.onDidChangeExtensions(async (result) => {
                for (const ext of result.added) {
                    const index = this.remoteExtensionMetadata.findIndex(value => extensions_3.ExtensionIdentifier.equals(value.id, ext.identifier));
                    if (index > -1) {
                        this.remoteExtensionMetadata[index].installed = true;
                    }
                }
            }));
            this._register(this.extensionManagementService.onDidUninstallExtension(async (result) => {
                const index = this.remoteExtensionMetadata.findIndex(value => extensions_3.ExtensionIdentifier.equals(value.id, result.identifier.id));
                if (index > -1) {
                    this.remoteExtensionMetadata[index].installed = false;
                }
            }));
        }
        async initializeRemoteMetadata() {
            if (this.remoteMetadataInitialized) {
                return;
            }
            const currentPlatform = (0, platform_1.PlatformToString)(platform_1.platform);
            for (let i = 0; i < this.remoteExtensionMetadata.length; i++) {
                const extensionId = this.remoteExtensionMetadata[i].id;
                const supportedPlatforms = this.remoteExtensionMetadata[i].supportedPlatforms;
                const isInstalled = (await this.extensionManagementService.getInstalled()).find(value => extensions_3.ExtensionIdentifier.equals(value.identifier.id, extensionId)) ? true : false;
                this.remoteExtensionMetadata[i].installed = isInstalled;
                if (isInstalled) {
                    this.remoteExtensionMetadata[i].isPlatformCompatible = true;
                }
                else if (supportedPlatforms && !supportedPlatforms.includes(currentPlatform)) {
                    this.remoteExtensionMetadata[i].isPlatformCompatible = false;
                }
                else {
                    this.remoteExtensionMetadata[i].isPlatformCompatible = true;
                }
            }
            this.remoteMetadataInitialized = true;
            this._onDidChangeEntries.fire();
            this.updateRemoteStatusIndicator();
        }
        updateVirtualWorkspaceLocation() {
            this.virtualWorkspaceLocation = (0, virtualWorkspace_1.getVirtualWorkspaceLocation)(this.workspaceContextService.getWorkspace());
        }
        async updateWhenInstalledExtensionsRegistered() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            const remoteAuthority = this.remoteAuthority;
            if (remoteAuthority) {
                // Try to resolve the authority to figure out connection state
                (async () => {
                    try {
                        const { authority } = await this.remoteAuthorityResolverService.resolveAuthority(remoteAuthority);
                        this.connectionToken = authority.connectionToken;
                        this.setConnectionState('connected');
                    }
                    catch (error) {
                        this.setConnectionState('disconnected');
                    }
                })();
            }
            this.updateRemoteStatusIndicator();
            this.initializeRemoteMetadata();
        }
        setConnectionState(newState) {
            if (this.connectionState !== newState) {
                this.connectionState = newState;
                // simplify context key which doesn't support `connecting`
                if (this.connectionState === 'reconnecting') {
                    this.connectionStateContextKey.set('disconnected');
                }
                else {
                    this.connectionStateContextKey.set(this.connectionState);
                }
                // indicate status
                this.updateRemoteStatusIndicator();
                // start measuring connection latency once connected
                if (newState === 'connected') {
                    this.scheduleMeasureNetworkConnectionLatency();
                }
            }
        }
        scheduleMeasureNetworkConnectionLatency() {
            if (!this.remoteAuthority || // only when having a remote connection
                this.measureNetworkConnectionLatencyScheduler // already scheduled
            ) {
                return;
            }
            this.measureNetworkConnectionLatencyScheduler = this._register(new async_1.RunOnceScheduler(() => this.measureNetworkConnectionLatency(), RemoteStatusIndicator_1.REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY));
            this.measureNetworkConnectionLatencyScheduler.schedule(RemoteStatusIndicator_1.REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY);
        }
        async measureNetworkConnectionLatency() {
            // Measure latency if we are online
            // but only when the window has focus to prevent constantly
            // waking up the connection to the remote
            if (this.hostService.hasFocus && this.networkState !== 'offline') {
                const measurement = await remoteAgentService_1.remoteConnectionLatencyMeasurer.measure(this.remoteAgentService);
                if (measurement) {
                    if (measurement.high) {
                        this.setNetworkState('high-latency');
                    }
                    else if (this.networkState === 'high-latency') {
                        this.setNetworkState('online');
                    }
                }
            }
            this.measureNetworkConnectionLatencyScheduler?.schedule();
        }
        setNetworkState(newState) {
            if (this.networkState !== newState) {
                const oldState = this.networkState;
                this.networkState = newState;
                if (newState === 'high-latency') {
                    this.logService.warn(`Remote network connection appears to have high latency (${remoteAgentService_1.remoteConnectionLatencyMeasurer.latency?.current?.toFixed(2)}ms last, ${remoteAgentService_1.remoteConnectionLatencyMeasurer.latency?.average?.toFixed(2)}ms average)`);
                }
                if (this.connectionToken) {
                    if (newState === 'online' && oldState === 'high-latency') {
                        this.logNetworkConnectionHealthTelemetry(this.connectionToken, 'good');
                    }
                    else if (newState === 'high-latency' && oldState === 'online') {
                        this.logNetworkConnectionHealthTelemetry(this.connectionToken, 'poor');
                    }
                }
                // update status
                this.updateRemoteStatusIndicator();
            }
        }
        logNetworkConnectionHealthTelemetry(connectionToken, connectionHealth) {
            this.telemetryService.publicLog2('remoteConnectionHealth', {
                remoteName: (0, remoteHosts_1.getRemoteName)(this.remoteAuthority),
                reconnectionToken: connectionToken,
                connectionHealth
            });
        }
        validatedGroup(group) {
            if (!group.match(/^(remote|virtualfs)_(\d\d)_(([a-z][a-z0-9+.-]*)_(.*))$/)) {
                if (!this.loggedInvalidGroupNames[group]) {
                    this.loggedInvalidGroupNames[group] = true;
                    this.logService.warn(`Invalid group name used in "statusBar/remoteIndicator" menu contribution: ${group}. Entries ignored. Expected format: 'remote_$ORDER_$REMOTENAME_$GROUPING or 'virtualfs_$ORDER_$FILESCHEME_$GROUPING.`);
                }
                return false;
            }
            return true;
        }
        getRemoteMenuActions(doNotUseCache) {
            if (!this.remoteMenuActionsGroups || doNotUseCache) {
                this.remoteMenuActionsGroups = this.remoteIndicatorMenu.getActions().filter(a => this.validatedGroup(a[0])).concat(this.legacyIndicatorMenu.getActions());
            }
            return this.remoteMenuActionsGroups;
        }
        updateRemoteStatusIndicator() {
            // Remote Indicator: show if provided via options, e.g. by the web embedder API
            const remoteIndicator = this.environmentService.options?.windowIndicator;
            if (remoteIndicator) {
                let remoteIndicatorLabel = remoteIndicator.label.trim();
                if (!remoteIndicatorLabel.startsWith('$(')) {
                    remoteIndicatorLabel = `$(remote) ${remoteIndicatorLabel}`; // ensure the indicator has a codicon
                }
                this.renderRemoteStatusIndicator((0, strings_1.truncate)(remoteIndicatorLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH), remoteIndicator.tooltip, remoteIndicator.command);
                return;
            }
            // Show for remote windows on the desktop
            if (this.remoteAuthority) {
                const hostLabel = this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, this.remoteAuthority) || this.remoteAuthority;
                switch (this.connectionState) {
                    case 'initializing':
                        this.renderRemoteStatusIndicator(nls.localize('host.open', "Opening Remote..."), nls.localize('host.open', "Opening Remote..."), undefined, true /* progress */);
                        break;
                    case 'reconnecting':
                        this.renderRemoteStatusIndicator(`${nls.localize('host.reconnecting', "Reconnecting to {0}...", (0, strings_1.truncate)(hostLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH))}`, undefined, undefined, true /* progress */);
                        break;
                    case 'disconnected':
                        this.renderRemoteStatusIndicator(`$(alert) ${nls.localize('disconnectedFrom', "Disconnected from {0}", (0, strings_1.truncate)(hostLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH))}`);
                        break;
                    default: {
                        const tooltip = new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
                        const hostNameTooltip = this.labelService.getHostTooltip(network_1.Schemas.vscodeRemote, this.remoteAuthority);
                        if (hostNameTooltip) {
                            tooltip.appendMarkdown(hostNameTooltip);
                        }
                        else {
                            tooltip.appendText(nls.localize({ key: 'host.tooltip', comment: ['{0} is a remote host name, e.g. Dev Container'] }, "Editing on {0}", hostLabel));
                        }
                        this.renderRemoteStatusIndicator(`$(remote) ${(0, strings_1.truncate)(hostLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, tooltip);
                    }
                }
                return;
            }
            // Show when in a virtual workspace
            if (this.virtualWorkspaceLocation) {
                // Workspace with label: indicate editing source
                const workspaceLabel = this.labelService.getHostLabel(this.virtualWorkspaceLocation.scheme, this.virtualWorkspaceLocation.authority);
                if (workspaceLabel) {
                    const tooltip = new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
                    const hostNameTooltip = this.labelService.getHostTooltip(this.virtualWorkspaceLocation.scheme, this.virtualWorkspaceLocation.authority);
                    if (hostNameTooltip) {
                        tooltip.appendMarkdown(hostNameTooltip);
                    }
                    else {
                        tooltip.appendText(nls.localize({ key: 'workspace.tooltip', comment: ['{0} is a remote workspace name, e.g. GitHub'] }, "Editing on {0}", workspaceLabel));
                    }
                    if (!platform_1.isWeb || this.remoteAuthority) {
                        tooltip.appendMarkdown('\n\n');
                        tooltip.appendMarkdown(nls.localize({ key: 'workspace.tooltip2', comment: ['[features are not available]({1}) is a link. Only translate `features are not available`. Do not change brackets and parentheses or {0}'] }, "Some [features are not available]({0}) for resources located on a virtual file system.", `command:${extensions_2.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`));
                    }
                    this.renderRemoteStatusIndicator(`$(remote) ${(0, strings_1.truncate)(workspaceLabel, RemoteStatusIndicator_1.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, tooltip);
                    return;
                }
            }
            this.renderRemoteStatusIndicator(`$(remote)`, nls.localize('noHost.tooltip', "Open a Remote Window"));
            return;
        }
        renderRemoteStatusIndicator(initialText, initialTooltip, command, showProgress) {
            const { text, tooltip, ariaLabel } = this.withNetworkStatus(initialText, initialTooltip, showProgress);
            const properties = {
                name: nls.localize('remoteHost', "Remote Host"),
                kind: this.networkState === 'offline' ? 'offline' : 'remote',
                ariaLabel,
                text,
                showProgress,
                tooltip,
                command: command ?? RemoteStatusIndicator_1.REMOTE_ACTIONS_COMMAND_ID
            };
            if (this.remoteStatusEntry) {
                this.remoteStatusEntry.update(properties);
            }
            else {
                this.remoteStatusEntry = this.statusbarService.addEntry(properties, 'status.host', 0 /* StatusbarAlignment.LEFT */, Number.MAX_VALUE /* first entry */);
            }
        }
        withNetworkStatus(initialText, initialTooltip, showProgress) {
            let text = initialText;
            let tooltip = initialTooltip;
            let ariaLabel = (0, iconLabels_1.getCodiconAriaLabel)(text);
            function textWithAlert() {
                // `initialText` can have a codicon in the beginning that already
                // indicates some kind of status, or we may have been asked to
                // show progress, where a spinning codicon appears. we only want
                // to replace with an alert icon for when a normal remote indicator
                // is shown.
                if (!showProgress && initialText.startsWith('$(remote)')) {
                    return initialText.replace('$(remote)', '$(alert)');
                }
                return initialText;
            }
            switch (this.networkState) {
                case 'offline': {
                    const offlineMessage = nls.localize('networkStatusOfflineTooltip', "Network appears to be offline, certain features might be unavailable.");
                    text = textWithAlert();
                    tooltip = this.appendTooltipLine(tooltip, offlineMessage);
                    ariaLabel = `${ariaLabel}, ${offlineMessage}`;
                    break;
                }
                case 'high-latency':
                    text = textWithAlert();
                    tooltip = this.appendTooltipLine(tooltip, nls.localize('networkStatusHighLatencyTooltip', "Network appears to have high latency ({0}ms last, {1}ms average), certain features may be slow to respond.", remoteAgentService_1.remoteConnectionLatencyMeasurer.latency?.current?.toFixed(2), remoteAgentService_1.remoteConnectionLatencyMeasurer.latency?.average?.toFixed(2)));
                    break;
            }
            return { text, tooltip, ariaLabel };
        }
        appendTooltipLine(tooltip, line) {
            let markdownTooltip;
            if (typeof tooltip === 'string') {
                markdownTooltip = new htmlContent_1.MarkdownString(tooltip, { isTrusted: true, supportThemeIcons: true });
            }
            else {
                markdownTooltip = tooltip ?? new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
            }
            if (markdownTooltip.value.length > 0) {
                markdownTooltip.appendMarkdown('\n\n');
            }
            markdownTooltip.appendMarkdown(line);
            return markdownTooltip;
        }
        async installExtension(extensionId) {
            const galleryExtension = (await this.extensionGalleryService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
            await this.extensionManagementService.installFromGallery(galleryExtension, {
                isMachineScoped: false,
                donotIncludePackAndDependencies: false,
                context: { [extensionManagement_1.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
            });
        }
        async runRemoteStartCommand(extensionId, startCommand) {
            // check to ensure the extension is installed
            await (0, async_1.retry)(async () => {
                const ext = await this.extensionService.getExtension(extensionId);
                if (!ext) {
                    throw Error('Failed to find installed remote extension');
                }
                return ext;
            }, 300, 10);
            this.commandService.executeCommand(startCommand);
            this.telemetryService.publicLog2('workbenchActionExecuted', {
                id: 'remoteInstallAndRun',
                detail: extensionId,
                from: 'remote indicator'
            });
        }
        showRemoteMenu() {
            const getCategoryLabel = (action) => {
                if (action.item.category) {
                    return typeof action.item.category === 'string' ? action.item.category : action.item.category.value;
                }
                return undefined;
            };
            const matchCurrentRemote = () => {
                if (this.remoteAuthority) {
                    return new RegExp(`^remote_\\d\\d_${(0, remoteHosts_1.getRemoteName)(this.remoteAuthority)}_`);
                }
                else if (this.virtualWorkspaceLocation) {
                    return new RegExp(`^virtualfs_\\d\\d_${this.virtualWorkspaceLocation.scheme}_`);
                }
                return undefined;
            };
            const computeItems = () => {
                let actionGroups = this.getRemoteMenuActions(true);
                const items = [];
                const currentRemoteMatcher = matchCurrentRemote();
                if (currentRemoteMatcher) {
                    // commands for the current remote go first
                    actionGroups = actionGroups.sort((g1, g2) => {
                        const isCurrentRemote1 = currentRemoteMatcher.test(g1[0]);
                        const isCurrentRemote2 = currentRemoteMatcher.test(g2[0]);
                        if (isCurrentRemote1 !== isCurrentRemote2) {
                            return isCurrentRemote1 ? -1 : 1;
                        }
                        // legacy indicator commands go last
                        if (g1[0] !== '' && g2[0] === '') {
                            return -1;
                        }
                        else if (g1[0] === '' && g2[0] !== '') {
                            return 1;
                        }
                        return g1[0].localeCompare(g2[0]);
                    });
                }
                let lastCategoryName = undefined;
                for (const actionGroup of actionGroups) {
                    let hasGroupCategory = false;
                    for (const action of actionGroup[1]) {
                        if (action instanceof actions_1.MenuItemAction) {
                            if (!hasGroupCategory) {
                                const category = getCategoryLabel(action);
                                if (category !== lastCategoryName) {
                                    items.push({ type: 'separator', label: category });
                                    lastCategoryName = category;
                                }
                                hasGroupCategory = true;
                            }
                            const label = typeof action.item.title === 'string' ? action.item.title : action.item.title.value;
                            items.push({
                                type: 'item',
                                id: action.item.id,
                                label
                            });
                        }
                    }
                }
                if (this.extensionGalleryService.isEnabled() && this.remoteMetadataInitialized) {
                    const notInstalledItems = [];
                    for (const metadata of this.remoteExtensionMetadata) {
                        if (!metadata.installed && metadata.isPlatformCompatible) {
                            // Create Install QuickPick with a help link
                            const label = metadata.startConnectLabel;
                            const buttons = [{
                                    iconClass: themables_1.ThemeIcon.asClassName(extensionsIcons_1.infoIcon),
                                    tooltip: nls.localize('remote.startActions.help', "Learn More")
                                }];
                            notInstalledItems.push({ type: 'item', id: metadata.id, label: label, buttons: buttons });
                        }
                    }
                    items.push({
                        type: 'separator', label: nls.localize('remote.startActions.install', 'Install')
                    });
                    items.push(...notInstalledItems);
                }
                items.push({
                    type: 'separator'
                });
                const entriesBeforeConfig = items.length;
                if (RemoteStatusIndicator_1.SHOW_CLOSE_REMOTE_COMMAND_ID) {
                    if (this.remoteAuthority) {
                        items.push({
                            type: 'item',
                            id: RemoteStatusIndicator_1.CLOSE_REMOTE_COMMAND_ID,
                            label: nls.localize('closeRemoteConnection.title', 'Close Remote Connection')
                        });
                        if (this.connectionState === 'disconnected') {
                            items.push({
                                type: 'item',
                                id: windowActions_1.ReloadWindowAction.ID,
                                label: nls.localize('reloadWindow', 'Reload Window')
                            });
                        }
                    }
                    else if (this.virtualWorkspaceLocation) {
                        items.push({
                            type: 'item',
                            id: RemoteStatusIndicator_1.CLOSE_REMOTE_COMMAND_ID,
                            label: nls.localize('closeVirtualWorkspace.title', 'Close Remote Workspace')
                        });
                    }
                }
                if (items.length === entriesBeforeConfig) {
                    items.pop(); // remove the separator again
                }
                return items;
            };
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.placeholder = nls.localize('remoteActions', "Select an option to open a Remote Window");
            quickPick.items = computeItems();
            quickPick.sortByLabel = false;
            quickPick.canSelectMany = false;
            event_1.Event.once(quickPick.onDidAccept)((async (_) => {
                const selectedItems = quickPick.selectedItems;
                if (selectedItems.length === 1) {
                    const commandId = selectedItems[0].id;
                    const remoteExtension = this.remoteExtensionMetadata.find(value => extensions_3.ExtensionIdentifier.equals(value.id, commandId));
                    if (remoteExtension) {
                        quickPick.items = [];
                        quickPick.busy = true;
                        quickPick.placeholder = nls.localize('remote.startActions.installingExtension', 'Installing extension... ');
                        await this.installExtension(remoteExtension.id);
                        quickPick.hide();
                        await this.runRemoteStartCommand(remoteExtension.id, remoteExtension.startCommand);
                    }
                    else {
                        this.telemetryService.publicLog2('workbenchActionExecuted', {
                            id: commandId,
                            from: 'remote indicator'
                        });
                        this.commandService.executeCommand(commandId);
                        quickPick.hide();
                    }
                }
            }));
            event_1.Event.once(quickPick.onDidTriggerItemButton)(async (e) => {
                const remoteExtension = this.remoteExtensionMetadata.find(value => extensions_3.ExtensionIdentifier.equals(value.id, e.item.id));
                if (remoteExtension) {
                    await this.openerService.open(uri_1.URI.parse(remoteExtension.helpLink));
                }
            });
            // refresh the items when actions change
            const legacyItemUpdater = this.legacyIndicatorMenu.onDidChange(() => quickPick.items = computeItems());
            quickPick.onDidHide(legacyItemUpdater.dispose);
            const itemUpdater = this.remoteIndicatorMenu.onDidChange(() => quickPick.items = computeItems());
            quickPick.onDidHide(itemUpdater.dispose);
            if (!this.remoteMetadataInitialized) {
                quickPick.busy = true;
                this._register(this.onDidChangeEntries(() => {
                    // If quick pick is open, update the quick pick items after initialization.
                    quickPick.busy = false;
                    quickPick.items = computeItems();
                }));
            }
            quickPick.show();
        }
    };
    exports.RemoteStatusIndicator = RemoteStatusIndicator;
    exports.RemoteStatusIndicator = RemoteStatusIndicator = RemoteStatusIndicator_1 = __decorate([
        __param(0, statusbar_1.IStatusbarService),
        __param(1, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(2, label_1.ILabelService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, actions_1.IMenuService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, commands_1.ICommandService),
        __param(7, extensions_1.IExtensionService),
        __param(8, remoteAgentService_1.IRemoteAgentService),
        __param(9, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(10, host_1.IHostService),
        __param(11, workspace_1.IWorkspaceContextService),
        __param(12, log_1.ILogService),
        __param(13, extensionManagement_1.IExtensionGalleryService),
        __param(14, telemetry_1.ITelemetryService),
        __param(15, productService_1.IProductService),
        __param(16, extensionManagement_1.IExtensionManagementService),
        __param(17, opener_1.IOpenerService)
    ], RemoteStatusIndicator);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlSW5kaWNhdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9yZW1vdGUvYnJvd3Nlci9yZW1vdGVJbmRpY2F0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQStEekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBVTs7aUJBRTVCLDhCQUF5QixHQUFHLGtDQUFrQyxBQUFyQyxDQUFzQztpQkFDL0QsNEJBQXVCLEdBQUcsK0JBQStCLEFBQWxDLENBQW1DO2lCQUMxRCxpQ0FBNEIsR0FBRyxDQUFDLGdCQUFLLEFBQVQsQ0FBVSxHQUFDLDZDQUE2QztpQkFDcEYsaUNBQTRCLEdBQUcsb0NBQW9DLEFBQXZDLENBQXdDO2lCQUVwRSxtQ0FBOEIsR0FBRyxFQUFFLEFBQUwsQ0FBTTtpQkFFcEMsOENBQXlDLEdBQUcsRUFBRSxHQUFHLElBQUksQUFBWixDQUFhO2lCQUN0RCx3REFBbUQsR0FBRyxFQUFFLEdBQUcsSUFBSSxBQUFaLENBQWE7UUEwQnhGLFlBQ29CLGdCQUFvRCxFQUNsQyxrQkFBd0UsRUFDOUYsWUFBNEMsRUFDdkMsaUJBQTZDLEVBQ25ELFdBQWlDLEVBQzNCLGlCQUFzRCxFQUN6RCxjQUFnRCxFQUM5QyxnQkFBb0QsRUFDbEQsa0JBQXdELEVBQzVDLDhCQUFnRixFQUNuRyxXQUEwQyxFQUM5Qix1QkFBa0UsRUFDL0UsVUFBd0MsRUFDM0IsdUJBQWtFLEVBQ3pFLGdCQUFvRCxFQUN0RCxjQUFnRCxFQUNwQywwQkFBd0UsRUFDckYsYUFBOEM7WUFFOUQsS0FBSyxFQUFFLENBQUM7WUFuQjRCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDakIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQztZQUM3RSxpQkFBWSxHQUFaLFlBQVksQ0FB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
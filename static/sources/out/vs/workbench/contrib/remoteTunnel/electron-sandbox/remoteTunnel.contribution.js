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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/platform/remoteTunnel/common/remoteTunnel", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/workbench/common/contributions", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/output/common/output", "vs/workbench/services/preferences/common/preferences"], function (require, exports, actions_1, lifecycle_1, network_1, resources_1, types_1, uri_1, nls_1, actions_2, clipboardService_1, commands_1, configurationRegistry_1, contextkey_1, dialogs_1, environment_1, log_1, notification_1, opener_1, productService_1, progress_1, quickInput_1, platform_1, remoteTunnel_1, storage_1, workspace_1, contributions_1, authentication_1, extensions_1, output_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteTunnelWorkbenchContribution = exports.REMOTE_TUNNEL_CONNECTION_STATE = exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY = exports.REMOTE_TUNNEL_CATEGORY = void 0;
    exports.REMOTE_TUNNEL_CATEGORY = {
        original: 'Remote-Tunnels',
        value: (0, nls_1.localize)('remoteTunnel.category', 'Remote Tunnels')
    };
    exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY = 'remoteTunnelConnection';
    exports.REMOTE_TUNNEL_CONNECTION_STATE = new contextkey_1.RawContextKey(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'disconnected');
    const REMOTE_TUNNEL_USED_STORAGE_KEY = 'remoteTunnelServiceUsed';
    const REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY = 'remoteTunnelServicePromptedPreview';
    const REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY = 'remoteTunnelExtensionRecommended';
    const REMOTE_TUNNEL_HAS_USED_BEFORE = 'remoteTunnelHasUsed';
    const REMOTE_TUNNEL_EXTENSION_TIMEOUT = 4 * 60 * 1000; // show the recommendation that a machine started using tunnels if it joined less than 4 minutes ago
    const INVALID_TOKEN_RETRIES = 2;
    var RemoteTunnelCommandIds;
    (function (RemoteTunnelCommandIds) {
        RemoteTunnelCommandIds["turnOn"] = "workbench.remoteTunnel.actions.turnOn";
        RemoteTunnelCommandIds["turnOff"] = "workbench.remoteTunnel.actions.turnOff";
        RemoteTunnelCommandIds["connecting"] = "workbench.remoteTunnel.actions.connecting";
        RemoteTunnelCommandIds["manage"] = "workbench.remoteTunnel.actions.manage";
        RemoteTunnelCommandIds["showLog"] = "workbench.remoteTunnel.actions.showLog";
        RemoteTunnelCommandIds["configure"] = "workbench.remoteTunnel.actions.configure";
        RemoteTunnelCommandIds["copyToClipboard"] = "workbench.remoteTunnel.actions.copyToClipboard";
        RemoteTunnelCommandIds["learnMore"] = "workbench.remoteTunnel.actions.learnMore";
    })(RemoteTunnelCommandIds || (RemoteTunnelCommandIds = {}));
    // name shown in nofications
    var RemoteTunnelCommandLabels;
    (function (RemoteTunnelCommandLabels) {
        RemoteTunnelCommandLabels.turnOn = (0, nls_1.localize)('remoteTunnel.actions.turnOn', 'Turn on Remote Tunnel Access...');
        RemoteTunnelCommandLabels.turnOff = (0, nls_1.localize)('remoteTunnel.actions.turnOff', 'Turn off Remote Tunnel Access...');
        RemoteTunnelCommandLabels.showLog = (0, nls_1.localize)('remoteTunnel.actions.showLog', 'Show Remote Tunnel Service Log');
        RemoteTunnelCommandLabels.configure = (0, nls_1.localize)('remoteTunnel.actions.configure', 'Configure Tunnel Name...');
        RemoteTunnelCommandLabels.copyToClipboard = (0, nls_1.localize)('remoteTunnel.actions.copyToClipboard', 'Copy Browser URI to Clipboard');
        RemoteTunnelCommandLabels.learnMore = (0, nls_1.localize)('remoteTunnel.actions.learnMore', 'Get Started with Tunnels');
    })(RemoteTunnelCommandLabels || (RemoteTunnelCommandLabels = {}));
    let RemoteTunnelWorkbenchContribution = class RemoteTunnelWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(authenticationService, dialogService, extensionService, contextKeyService, productService, storageService, loggerService, quickInputService, environmentService, remoteTunnelService, commandService, workspaceContextService, progressService, notificationService) {
            super();
            this.authenticationService = authenticationService;
            this.dialogService = dialogService;
            this.extensionService = extensionService;
            this.contextKeyService = contextKeyService;
            this.storageService = storageService;
            this.quickInputService = quickInputService;
            this.environmentService = environmentService;
            this.remoteTunnelService = remoteTunnelService;
            this.commandService = commandService;
            this.workspaceContextService = workspaceContextService;
            this.progressService = progressService;
            this.notificationService = notificationService;
            this.expiredSessions = new Set();
            this.logger = this._register(loggerService.createLogger((0, resources_1.joinPath)(environmentService.logsHome, `${remoteTunnel_1.LOG_ID}.log`), { id: remoteTunnel_1.LOG_ID, name: remoteTunnel_1.LOGGER_NAME }));
            this.connectionStateContext = exports.REMOTE_TUNNEL_CONNECTION_STATE.bindTo(this.contextKeyService);
            const serverConfiguration = productService.tunnelApplicationConfig;
            if (!serverConfiguration || !productService.tunnelApplicationName) {
                this.logger.error('Missing \'tunnelApplicationConfig\' or \'tunnelApplicationName\' in product.json. Remote tunneling is not available.');
                this.serverConfiguration = { authenticationProviders: {}, editorWebUrl: '', extension: { extensionId: '', friendlyName: '' } };
                return;
            }
            this.serverConfiguration = serverConfiguration;
            this._register(this.remoteTunnelService.onDidChangeTunnelStatus(s => this.handleTunnelStatusUpdate(s)));
            this.registerCommands();
            this.initialize();
            this.recommendRemoteExtensionIfNeeded();
        }
        handleTunnelStatusUpdate(status) {
            this.connectionInfo = undefined;
            if (status.type === 'disconnected') {
                if (status.onTokenFailed) {
                    this.expiredSessions.add(status.onTokenFailed.sessionId);
                }
                this.connectionStateContext.set('disconnected');
            }
            else if (status.type === 'connecting') {
                this.connectionStateContext.set('connecting');
            }
            else if (status.type === 'connected') {
                this.connectionInfo = status.info;
                this.connectionStateContext.set('connected');
            }
        }
        async recommendRemoteExtensionIfNeeded() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            const remoteExtension = this.serverConfiguration.extension;
            const shouldRecommend = async () => {
                if (this.storageService.getBoolean(REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY, -1 /* StorageScope.APPLICATION */)) {
                    return false;
                }
                if (await this.extensionService.getExtension(remoteExtension.extensionId)) {
                    return false;
                }
                const usedOnHostMessage = this.storageService.get(REMOTE_TUNNEL_USED_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
                if (!usedOnHostMessage) {
                    return false;
                }
                let usedTunnelName;
                try {
                    const message = JSON.parse(usedOnHostMessage);
                    if (!(0, types_1.isObject)(message)) {
                        return false;
                    }
                    const { hostName, timeStamp } = message;
                    if (!(0, types_1.isString)(hostName) || !(0, types_1.isNumber)(timeStamp) || new Date().getTime() > timeStamp + REMOTE_TUNNEL_EXTENSION_TIMEOUT) {
                        return false;
                    }
                    usedTunnelName = hostName;
                }
                catch (_) {
                    // problems parsing the message, likly the old message format
                    return false;
                }
                const currentTunnelName = await this.remoteTunnelService.getTunnelName();
                if (!currentTunnelName || currentTunnelName === usedTunnelName) {
                    return false;
                }
                return usedTunnelName;
            };
            const recommed = async () => {
                const usedOnHost = await shouldRecommend();
                if (!usedOnHost) {
                    return false;
                }
                this.notificationService.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)({
                        key: 'recommend.remoteExtension',
                        comment: ['{0} will be a tunnel name, {1} will the link address to the web UI, {6} an extension name. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format']
                    }, "Tunnel '{0}' is avaiable for remote access. The {1} extension can be used to connect to it.", usedOnHost, remoteExtension.friendlyName),
                    actions: {
                        primary: [
                            new actions_1.Action('showExtension', (0, nls_1.localize)('action.showExtension', "Show Extension"), undefined, true, () => {
                                return this.commandService.executeCommand('workbench.extensions.action.showExtensionsWithIds', [remoteExtension.extensionId]);
                            }),
                            new actions_1.Action('doNotShowAgain', (0, nls_1.localize)('action.doNotShowAgain', "Do not show again"), undefined, true, () => {
                                this.storageService.store(REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                            }),
                        ]
                    }
                });
                return true;
            };
            if (await shouldRecommend()) {
                const disposables = this._register(new lifecycle_1.DisposableStore());
                disposables.add(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, REMOTE_TUNNEL_USED_STORAGE_KEY, disposables)(async () => {
                    const success = await recommed();
                    if (success) {
                        disposables.dispose();
                    }
                }));
            }
        }
        async initialize() {
            const [mode, status] = await Promise.all([
                this.remoteTunnelService.getMode(),
                this.remoteTunnelService.getTunnelStatus(),
            ]);
            this.handleTunnelStatusUpdate(status);
            if (mode.active && mode.session.token) {
                return; // already initialized, token available
            }
            const doInitialStateDiscovery = async (progress) => {
                const listener = progress && this.remoteTunnelService.onDidChangeTunnelStatus(status => {
                    switch (status.type) {
                        case 'connecting':
                            if (status.progress) {
                                progress.report({ message: status.progress });
                            }
                            break;
                    }
                });
                let newSession;
                if (mode.active) {
                    const token = await this.getSessionToken(mode.session);
                    if (token) {
                        newSession = { ...mode.session, token };
                    }
                }
                const status = await this.remoteTunnelService.initialize(mode.active && newSession ? { ...mode, session: newSession } : remoteTunnel_1.INACTIVE_TUNNEL_MODE);
                listener?.dispose();
                if (status.type === 'connected') {
                    this.connectionInfo = status.info;
                    this.connectionStateContext.set('connected');
                    return;
                }
            };
            const hasUsed = this.storageService.getBoolean(REMOTE_TUNNEL_HAS_USED_BEFORE, -1 /* StorageScope.APPLICATION */, false);
            if (hasUsed) {
                await this.progressService.withProgress({
                    location: 10 /* ProgressLocation.Window */,
                    title: (0, nls_1.localize)({ key: 'initialize.progress.title', comment: ['Only translate \'Looking for remote tunnel\', do not change the format of the rest (markdown link format)'] }, "[Looking for remote tunnel](command:{0})", RemoteTunnelCommandIds.showLog),
                }, doInitialStateDiscovery);
            }
            else {
                doInitialStateDiscovery(undefined);
            }
        }
        getPreferredTokenFromSession(session) {
            return session.session.accessToken || session.session.idToken;
        }
        async startTunnel(asService) {
            if (this.connectionInfo) {
                return this.connectionInfo;
            }
            this.storageService.store(REMOTE_TUNNEL_HAS_USED_BEFORE, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            let tokenProblems = false;
            for (let i = 0; i < INVALID_TOKEN_RETRIES; i++) {
                tokenProblems = false;
                const authenticationSession = await this.getAuthenticationSession();
                if (authenticationSession === undefined) {
                    this.logger.info('No authentication session available, not starting tunnel');
                    return undefined;
                }
                const result = await this.progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: (0, nls_1.localize)({ key: 'startTunnel.progress.title', comment: ['Only translate \'Starting remote tunnel\', do not change the format of the rest (markdown link format)'] }, "[Starting remote tunnel](command:{0})", RemoteTunnelCommandIds.showLog),
                }, (progress) => {
                    return new Promise((s, e) => {
                        let completed = false;
                        const listener = this.remoteTunnelService.onDidChangeTunnelStatus(status => {
                            switch (status.type) {
                                case 'connecting':
                                    if (status.progress) {
                                        progress.report({ message: status.progress });
                                    }
                                    break;
                                case 'connected':
                                    listener.dispose();
                                    completed = true;
                                    s(status.info);
                                    if (status.serviceInstallFailed) {
                                        this.notificationService.notify({
                                            severity: notification_1.Severity.Warning,
                                            message: (0, nls_1.localize)({
                                                key: 'remoteTunnel.serviceInstallFailed',
                                                comment: ['{Locked="](command:{0})"}']
                                            }, "Installation as a service failed, and we fell back to running the tunnel for this session. See the [error log](command:{0}) for details.", RemoteTunnelCommandIds.showLog),
                                        });
                                    }
                                    break;
                                case 'disconnected':
                                    listener.dispose();
                                    completed = true;
                                    tokenProblems = !!status.onTokenFailed;
                                    s(undefined);
                                    break;
                            }
                        });
                        const token = this.getPreferredTokenFromSession(authenticationSession);
                        const account = { sessionId: authenticationSession.session.id, token, providerId: authenticationSession.providerId, accountLabel: authenticationSession.session.account.label };
                        this.remoteTunnelService.startTunnel({ active: true, asService, session: account }).then(status => {
                            if (!completed && (status.type === 'connected' || status.type === 'disconnected')) {
                                listener.dispose();
                                if (status.type === 'connected') {
                                    s(status.info);
                                }
                                else {
                                    tokenProblems = !!status.onTokenFailed;
                                    s(undefined);
                                }
                            }
                        });
                    });
                });
                if (result || !tokenProblems) {
                    return result;
                }
            }
            return undefined;
        }
        async getAuthenticationSession() {
            const sessions = await this.getAllSessions();
            const quickpick = this.quickInputService.createQuickPick();
            quickpick.ok = false;
            quickpick.placeholder = (0, nls_1.localize)('accountPreference.placeholder', "Sign in to an account to enable remote access");
            quickpick.ignoreFocusOut = true;
            quickpick.items = await this.createQuickpickItems(sessions);
            return new Promise((resolve, reject) => {
                quickpick.onDidHide((e) => {
                    resolve(undefined);
                    quickpick.dispose();
                });
                quickpick.onDidAccept(async (e) => {
                    const selection = quickpick.selectedItems[0];
                    if ('provider' in selection) {
                        const session = await this.authenticationService.createSession(selection.provider.id, selection.provider.scopes);
                        resolve(this.createExistingSessionItem(session, selection.provider.id));
                    }
                    else if ('session' in selection) {
                        resolve(selection);
                    }
                    else {
                        resolve(undefined);
                    }
                    quickpick.hide();
                });
                quickpick.show();
            });
        }
        createExistingSessionItem(session, providerId) {
            return {
                label: session.account.label,
                description: this.authenticationService.getLabel(providerId),
                session,
                providerId
            };
        }
        async createQuickpickItems(sessions) {
            const options = [];
            if (sessions.length) {
                options.push({ type: 'separator', label: (0, nls_1.localize)('signed in', "Signed In") });
                options.push(...sessions);
                options.push({ type: 'separator', label: (0, nls_1.localize)('others', "Others") });
            }
            for (const authenticationProvider of (await this.getAuthenticationProviders())) {
                const signedInForProvider = sessions.some(account => account.providerId === authenticationProvider.id);
                if (!signedInForProvider || this.authenticationService.supportsMultipleAccounts(authenticationProvider.id)) {
                    const providerName = this.authenticationService.getLabel(authenticationProvider.id);
                    options.push({ label: (0, nls_1.localize)({ key: 'sign in using account', comment: ['{0} will be a auth provider (e.g. Github)'] }, "Sign in with {0}", providerName), provider: authenticationProvider });
                }
            }
            return options;
        }
        /**
         * Returns all authentication sessions available from {@link getAuthenticationProviders}.
         */
        async getAllSessions() {
            const authenticationProviders = await this.getAuthenticationProviders();
            const accounts = new Map();
            const currentAccount = await this.remoteTunnelService.getMode();
            let currentSession;
            for (const provider of authenticationProviders) {
                const sessions = await this.authenticationService.getSessions(provider.id, provider.scopes);
                for (const session of sessions) {
                    if (!this.expiredSessions.has(session.id)) {
                        const item = this.createExistingSessionItem(session, provider.id);
                        accounts.set(item.session.account.id, item);
                        if (currentAccount.active && currentAccount.session.sessionId === session.id) {
                            currentSession = item;
                        }
                    }
                }
            }
            if (currentSession !== undefined) {
                accounts.set(currentSession.session.account.id, currentSession);
            }
            return [...accounts.values()];
        }
        async getSessionToken(session) {
            if (session) {
                const sessionItem = (await this.getAllSessions()).find(s => s.session.id === session.sessionId);
                if (sessionItem) {
                    return this.getPreferredTokenFromSession(sessionItem);
                }
            }
            return undefined;
        }
        /**
         * Returns all authentication providers which can be used to authenticate
         * to the remote storage service, based on product.json configuration
         * and registered authentication providers.
         */
        async getAuthenticationProviders() {
            // Get the list of authentication providers configured in product.json
            const authenticationProviders = this.serverConfiguration.authenticationProviders;
            const configuredAuthenticationProviders = Object.keys(authenticationProviders).reduce((result, id) => {
                result.push({ id, scopes: authenticationProviders[id].scopes });
                return result;
            }, []);
            // Filter out anything that isn't currently available through the authenticationService
            const availableAuthenticationProviders = this.authenticationService.declaredProviders;
            return configuredAuthenticationProviders.filter(({ id }) => availableAuthenticationProviders.some(provider => provider.id === id));
        }
        registerCommands() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.turnOn,
                        title: RemoteTunnelCommandLabels.turnOn,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        precondition: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'disconnected'),
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                            },
                            {
                                id: actions_2.MenuId.AccountsContext,
                                group: '2_remoteTunnel',
                                when: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'disconnected'),
                            }]
                    });
                }
                async run(accessor) {
                    const notificationService = accessor.get(notification_1.INotificationService);
                    const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                    const commandService = accessor.get(commands_1.ICommandService);
                    const storageService = accessor.get(storage_1.IStorageService);
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const productService = accessor.get(productService_1.IProductService);
                    const didNotifyPreview = storageService.getBoolean(REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, -1 /* StorageScope.APPLICATION */, false);
                    if (!didNotifyPreview) {
                        const { confirmed } = await dialogService.confirm({
                            message: (0, nls_1.localize)('tunnel.preview', 'Remote Tunnels is currently in preview. Please report any problems using the "Help: Report Issue" command.'),
                            primaryButton: (0, nls_1.localize)({ key: 'enable', comment: ['&& denotes a mnemonic'] }, '&&Enable')
                        });
                        if (!confirmed) {
                            return;
                        }
                        storageService.store(REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    }
                    const disposables = new lifecycle_1.DisposableStore();
                    const quickPick = quickInputService.createQuickPick();
                    quickPick.placeholder = (0, nls_1.localize)('tunnel.enable.placeholder', 'Select how you want to enable access');
                    quickPick.items = [
                        { service: false, label: (0, nls_1.localize)('tunnel.enable.session', 'Turn on for this session'), description: (0, nls_1.localize)('tunnel.enable.session.description', 'Run whenever {0} is open', productService.nameShort) },
                        { service: true, label: (0, nls_1.localize)('tunnel.enable.service', 'Install as a service'), description: (0, nls_1.localize)('tunnel.enable.service.description', 'Run whenever you\'re logged in') }
                    ];
                    const asService = await new Promise(resolve => {
                        disposables.add(quickPick.onDidAccept(() => resolve(quickPick.selectedItems[0]?.service)));
                        disposables.add(quickPick.onDidHide(() => resolve(undefined)));
                        quickPick.show();
                    });
                    quickPick.dispose();
                    if (asService === undefined) {
                        return; // no-op
                    }
                    const connectionInfo = await that.startTunnel(/* installAsService= */ asService);
                    if (connectionInfo) {
                        const linkToOpen = that.getLinkToOpen(connectionInfo);
                        const remoteExtension = that.serverConfiguration.extension;
                        const linkToOpenForMarkdown = linkToOpen.toString(false).replace(/\)/g, '%29');
                        notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)({
                                key: 'progress.turnOn.final',
                                comment: ['{0} will be the tunnel name, {1} will the link address to the web UI, {6} an extension name, {7} a link to the extension documentation. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format']
                            }, "You can now access this machine anywhere via the secure tunnel [{0}](command:{4}). To connect via a different machine, use the generated [{1}]({2}) link or use the [{6}]({7}) extension in the desktop or web. You can [configure](command:{3}) or [turn off](command:{5}) this access via the VS Code Accounts menu.", connectionInfo.tunnelName, connectionInfo.domain, linkToOpenForMarkdown, RemoteTunnelCommandIds.manage, RemoteTunnelCommandIds.configure, RemoteTunnelCommandIds.turnOff, remoteExtension.friendlyName, 'https://code.visualstudio.com/docs/remote/tunnels'),
                            actions: {
                                primary: [
                                    new actions_1.Action('copyToClipboard', (0, nls_1.localize)('action.copyToClipboard', "Copy Browser Link to Clipboard"), undefined, true, () => clipboardService.writeText(linkToOpen.toString(true))),
                                    new actions_1.Action('showExtension', (0, nls_1.localize)('action.showExtension', "Show Extension"), undefined, true, () => {
                                        return commandService.executeCommand('workbench.extensions.action.showExtensionsWithIds', [remoteExtension.extensionId]);
                                    })
                                ]
                            }
                        });
                        const usedOnHostMessage = { hostName: connectionInfo.tunnelName, timeStamp: new Date().getTime() };
                        storageService.store(REMOTE_TUNNEL_USED_STORAGE_KEY, JSON.stringify(usedOnHostMessage), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    }
                    else {
                        notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)('progress.turnOn.failed', "Unable to turn on the remote tunnel access. Check the Remote Tunnel Service log for details."),
                        });
                        await commandService.executeCommand(RemoteTunnelCommandIds.showLog);
                    }
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.manage,
                        title: (0, nls_1.localize)('remoteTunnel.actions.manage.on.v2', 'Remote Tunnel Access is On'),
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: [{
                                id: actions_2.MenuId.AccountsContext,
                                group: '2_remoteTunnel',
                                when: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'connected'),
                            }]
                    });
                }
                async run() {
                    that.showManageOptions();
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.connecting,
                        title: (0, nls_1.localize)('remoteTunnel.actions.manage.connecting', 'Remote Tunnel Access is Connecting'),
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: [{
                                id: actions_2.MenuId.AccountsContext,
                                group: '2_remoteTunnel',
                                when: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'connecting'),
                            }]
                    });
                }
                async run() {
                    that.showManageOptions();
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.turnOff,
                        title: RemoteTunnelCommandLabels.turnOff,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        precondition: contextkey_1.ContextKeyExpr.notEquals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'disconnected'),
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.notEquals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, ''),
                            }]
                    });
                }
                async run() {
                    const message = that.connectionInfo?.isAttached ?
                        (0, nls_1.localize)('remoteTunnel.turnOffAttached.confirm', 'Do you want to turn off Remote Tunnel Access? This will also stop the service that was started externally.') :
                        (0, nls_1.localize)('remoteTunnel.turnOff.confirm', 'Do you want to turn off Remote Tunnel Access?');
                    const { confirmed } = await that.dialogService.confirm({ message });
                    if (confirmed) {
                        that.remoteTunnelService.stopTunnel();
                    }
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.showLog,
                        title: RemoteTunnelCommandLabels.showLog,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.notEquals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, ''),
                            }]
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.IOutputService);
                    outputService.showChannel(remoteTunnel_1.LOG_ID);
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.configure,
                        title: RemoteTunnelCommandLabels.configure,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.notEquals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, ''),
                            }]
                    });
                }
                async run(accessor) {
                    const preferencesService = accessor.get(preferences_1.IPreferencesService);
                    preferencesService.openSettings({ query: remoteTunnel_1.CONFIGURATION_KEY_PREFIX });
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.copyToClipboard,
                        title: RemoteTunnelCommandLabels.copyToClipboard,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        precondition: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'connected'),
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.equals(exports.REMOTE_TUNNEL_CONNECTION_STATE_KEY, 'connected'),
                            }]
                    });
                }
                async run(accessor) {
                    const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                    if (that.connectionInfo) {
                        const linkToOpen = that.getLinkToOpen(that.connectionInfo);
                        clipboardService.writeText(linkToOpen.toString(true));
                    }
                }
            }));
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: RemoteTunnelCommandIds.learnMore,
                        title: RemoteTunnelCommandLabels.learnMore,
                        category: exports.REMOTE_TUNNEL_CATEGORY,
                        menu: []
                    });
                }
                async run(accessor) {
                    const openerService = accessor.get(opener_1.IOpenerService);
                    await openerService.open('https://aka.ms/vscode-server-doc');
                }
            }));
        }
        getLinkToOpen(connectionInfo) {
            const workspace = this.workspaceContextService.getWorkspace();
            const folders = workspace.folders;
            let resource;
            if (folders.length === 1) {
                resource = folders[0].uri;
            }
            else if (workspace.configuration && !(0, workspace_1.isUntitledWorkspace)(workspace.configuration, this.environmentService)) {
                resource = workspace.configuration;
            }
            const link = uri_1.URI.parse(connectionInfo.link);
            if (resource?.scheme === network_1.Schemas.file) {
                return (0, resources_1.joinPath)(link, resource.path);
            }
            return (0, resources_1.joinPath)(link, this.environmentService.userHome.path);
        }
        async showManageOptions() {
            const account = await this.remoteTunnelService.getMode();
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                quickPick.placeholder = (0, nls_1.localize)('manage.placeholder', 'Select a command to invoke');
                disposables.add(quickPick);
                const items = [];
                items.push({ id: RemoteTunnelCommandIds.learnMore, label: RemoteTunnelCommandLabels.learnMore });
                if (this.connectionInfo) {
                    quickPick.title =
                        this.connectionInfo.isAttached ?
                            (0, nls_1.localize)({ key: 'manage.title.attached', comment: ['{0} is the tunnel name'] }, 'Remote Tunnel Access enabled for {0} (launched externally)', this.connectionInfo.tunnelName) :
                            (0, nls_1.localize)({ key: 'manage.title.orunning', comment: ['{0} is the tunnel name'] }, 'Remote Tunnel Access enabled for {0}', this.connectionInfo.tunnelName);
                    items.push({ id: RemoteTunnelCommandIds.copyToClipboard, label: RemoteTunnelCommandLabels.copyToClipboard, description: this.connectionInfo.domain });
                }
                else {
                    quickPick.title = (0, nls_1.localize)('manage.title.off', 'Remote Tunnel Access not enabled');
                }
                items.push({ id: RemoteTunnelCommandIds.showLog, label: (0, nls_1.localize)('manage.showLog', 'Show Log') });
                items.push({ type: 'separator' });
                items.push({ id: RemoteTunnelCommandIds.configure, label: (0, nls_1.localize)('manage.tunnelName', 'Change Tunnel Name'), description: this.connectionInfo?.tunnelName });
                items.push({ id: RemoteTunnelCommandIds.turnOff, label: RemoteTunnelCommandLabels.turnOff, description: account.active ? `${account.session.accountLabel} (${account.session.providerId})` : undefined });
                quickPick.items = items;
                disposables.add(quickPick.onDidAccept(() => {
                    if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
                        this.commandService.executeCommand(quickPick.selectedItems[0].id);
                    }
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    disposables.dispose();
                    c();
                }));
                quickPick.show();
            });
        }
    };
    exports.RemoteTunnelWorkbenchContribution = RemoteTunnelWorkbenchContribution;
    exports.RemoteTunnelWorkbenchContribution = RemoteTunnelWorkbenchContribution = __decorate([
        __param(0, authentication_1.IAuthenticationService),
        __param(1, dialogs_1.IDialogService),
        __param(2, extensions_1.IExtensionService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, productService_1.IProductService),
        __param(5, storage_1.IStorageService),
        __param(6, log_1.ILoggerService),
        __param(7, quickInput_1.IQuickInputService),
        __param(8, environment_1.INativeEnvironmentService),
        __param(9, remoteTunnel_1.IRemoteTunnelService),
        __param(10, commands_1.ICommandService),
        __param(11, workspace_1.IWorkspaceContextService),
        __param(12, progress_1.IProgressService),
        __param(13, notification_1.INotificationService)
    ], RemoteTunnelWorkbenchContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(RemoteTunnelWorkbenchContribution, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        type: 'object',
        properties: {
            [remoteTunnel_1.CONFIGURATION_KEY_HOST_NAME]: {
                description: (0, nls_1.localize)('remoteTunnelAccess.machineName', "The name under which the remote tunnel access is registered. If not set, the host name is used."),
                type: 'string',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                pattern: '^(\\w[\\w-]*)?$',
                patternErrorMessage: (0, nls_1.localize)('remoteTunnelAccess.machineNameRegex', "The name must only consist of letters, numbers, underscore and dash. It must not start with a dash."),
                maxLength: 20,
                default: ''
            },
            [remoteTunnel_1.CONFIGURATION_KEY_PREVENT_SLEEP]: {
                description: (0, nls_1.localize)('remoteTunnelAccess.preventSleep', "Prevent this computer from sleeping when remote tunnel access is turned on."),
                type: 'boolean',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                default: false,
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVHVubmVsLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcmVtb3RlVHVubmVsL2VsZWN0cm9uLXNhbmRib3gvcmVtb3RlVHVubmVsLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQ25GLFFBQUEsc0JBQXNCLEdBQXFCO1FBQ3ZELFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHVCQUF1QixFQUFFLGdCQUFnQixDQUFDO0tBQzFELENBQUM7SUFJVyxRQUFBLGtDQUFrQyxHQUFHLHdCQUF3QixDQUFDO0lBQzlELFFBQUEsOEJBQThCLEdBQUcsSUFBSSwwQkFBYSxDQUFxQiwwQ0FBa0MsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUV4SSxNQUFNLDhCQUE4QixHQUFHLHlCQUF5QixDQUFDO0lBQ2pFLE1BQU0sMENBQTBDLEdBQUcsb0NBQW9DLENBQUM7SUFDeEYsTUFBTSx1Q0FBdUMsR0FBRyxrQ0FBa0MsQ0FBQztJQUNuRixNQUFNLDZCQUE2QixHQUFHLHFCQUFxQixDQUFDO0lBQzVELE1BQU0sK0JBQStCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxvR0FBb0c7SUFFM0osTUFBTSxxQkFBcUIsR0FBRyxDQUFDLENBQUM7SUFRaEMsSUFBSyxzQkFTSjtJQVRELFdBQUssc0JBQXNCO1FBQzFCLDBFQUFnRCxDQUFBO1FBQ2hELDRFQUFrRCxDQUFBO1FBQ2xELGtGQUF3RCxDQUFBO1FBQ3hELDBFQUFnRCxDQUFBO1FBQ2hELDRFQUFrRCxDQUFBO1FBQ2xELGdGQUFzRCxDQUFBO1FBQ3RELDRGQUFrRSxDQUFBO1FBQ2xFLGdGQUFzRCxDQUFBO0lBQ3ZELENBQUMsRUFUSSxz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
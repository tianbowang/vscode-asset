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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/label/common/label", "vs/base/common/platform", "vs/base/common/network", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/log/common/log", "vs/nls", "vs/base/common/lifecycle", "vs/platform/configuration/common/configurationRegistry", "vs/platform/files/common/files", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/remote/common/remoteAgentConnection", "vs/platform/telemetry/common/telemetry", "vs/platform/remote/common/remoteHosts", "vs/platform/download/common/download", "vs/platform/download/common/downloadIpc", "vs/platform/log/common/logIpc"], function (require, exports, contributions_1, platform_1, label_1, platform_2, network_1, remoteAgentService_1, log_1, nls_1, lifecycle_1, configurationRegistry_1, files_1, dialogs_1, environmentService_1, workspace_1, arrays_1, actions_1, actionCommonCategories_1, remoteAgentConnection_1, telemetry_1, remoteHosts_1, download_1, downloadIpc_1, logIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LabelContribution = void 0;
    let LabelContribution = class LabelContribution {
        constructor(labelService, remoteAgentService) {
            this.labelService = labelService;
            this.remoteAgentService = remoteAgentService;
            this.registerFormatters();
        }
        registerFormatters() {
            this.remoteAgentService.getEnvironment().then(remoteEnvironment => {
                const os = remoteEnvironment?.os || platform_2.OS;
                const formatting = {
                    label: '${path}',
                    separator: os === 1 /* OperatingSystem.Windows */ ? '\\' : '/',
                    tildify: os !== 1 /* OperatingSystem.Windows */,
                    normalizeDriveLetter: os === 1 /* OperatingSystem.Windows */,
                    workspaceSuffix: platform_2.isWeb ? undefined : network_1.Schemas.vscodeRemote
                };
                this.labelService.registerFormatter({
                    scheme: network_1.Schemas.vscodeRemote,
                    formatting
                });
                if (remoteEnvironment) {
                    this.labelService.registerFormatter({
                        scheme: network_1.Schemas.vscodeUserData,
                        formatting
                    });
                }
            });
        }
    };
    exports.LabelContribution = LabelContribution;
    exports.LabelContribution = LabelContribution = __decorate([
        __param(0, label_1.ILabelService),
        __param(1, remoteAgentService_1.IRemoteAgentService)
    ], LabelContribution);
    let RemoteChannelsContribution = class RemoteChannelsContribution extends lifecycle_1.Disposable {
        constructor(remoteAgentService, downloadService, loggerService) {
            super();
            const connection = remoteAgentService.getConnection();
            if (connection) {
                connection.registerChannel('download', new downloadIpc_1.DownloadServiceChannel(downloadService));
                connection.withChannel('logger', async (channel) => this._register(new logIpc_1.RemoteLoggerChannelClient(loggerService, channel)));
            }
        }
    };
    RemoteChannelsContribution = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, download_1.IDownloadService),
        __param(2, log_1.ILoggerService)
    ], RemoteChannelsContribution);
    let RemoteInvalidWorkspaceDetector = class RemoteInvalidWorkspaceDetector extends lifecycle_1.Disposable {
        constructor(fileService, dialogService, environmentService, contextService, fileDialogService, remoteAgentService) {
            super();
            this.fileService = fileService;
            this.dialogService = dialogService;
            this.environmentService = environmentService;
            this.contextService = contextService;
            this.fileDialogService = fileDialogService;
            // When connected to a remote workspace, we currently cannot
            // validate that the workspace exists before actually opening
            // it. As such, we need to check on that after startup and guide
            // the user to a valid workspace.
            // (see https://github.com/microsoft/vscode/issues/133872)
            if (this.environmentService.remoteAuthority) {
                remoteAgentService.getEnvironment().then(remoteEnv => {
                    if (remoteEnv) {
                        // we use the presence of `remoteEnv` to figure out
                        // if we got a healthy remote connection
                        // (see https://github.com/microsoft/vscode/issues/135331)
                        this.validateRemoteWorkspace();
                    }
                });
            }
        }
        async validateRemoteWorkspace() {
            const workspace = this.contextService.getWorkspace();
            const workspaceUriToStat = workspace.configuration ?? (0, arrays_1.firstOrDefault)(workspace.folders)?.uri;
            if (!workspaceUriToStat) {
                return; // only when in workspace
            }
            const exists = await this.fileService.exists(workspaceUriToStat);
            if (exists) {
                return; // all good!
            }
            const res = await this.dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)('invalidWorkspaceMessage', "Workspace does not exist"),
                detail: (0, nls_1.localize)('invalidWorkspaceDetail', "Please select another workspace to open."),
                primaryButton: (0, nls_1.localize)({ key: 'invalidWorkspacePrimary', comment: ['&& denotes a mnemonic'] }, "&&Open Workspace...")
            });
            if (res.confirmed) {
                // Pick Workspace
                if (workspace.configuration) {
                    return this.fileDialogService.pickWorkspaceAndOpen({});
                }
                // Pick Folder
                return this.fileDialogService.pickFolderAndOpen({});
            }
        }
    };
    RemoteInvalidWorkspaceDetector = __decorate([
        __param(0, files_1.IFileService),
        __param(1, dialogs_1.IDialogService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, dialogs_1.IFileDialogService),
        __param(5, remoteAgentService_1.IRemoteAgentService)
    ], RemoteInvalidWorkspaceDetector);
    let InitialRemoteConnectionHealthContribution = class InitialRemoteConnectionHealthContribution {
        constructor(_remoteAgentService, _environmentService, _telemetryService) {
            this._remoteAgentService = _remoteAgentService;
            this._environmentService = _environmentService;
            this._telemetryService = _telemetryService;
            if (this._environmentService.remoteAuthority) {
                this._checkInitialRemoteConnectionHealth();
            }
        }
        async _checkInitialRemoteConnectionHealth() {
            try {
                await this._remoteAgentService.getRawEnvironment();
                this._telemetryService.publicLog2('remoteConnectionSuccess', {
                    web: platform_2.isWeb,
                    connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
                    remoteName: (0, remoteHosts_1.getRemoteName)(this._environmentService.remoteAuthority)
                });
                await this._measureExtHostLatency();
            }
            catch (err) {
                this._telemetryService.publicLog2('remoteConnectionFailure', {
                    web: platform_2.isWeb,
                    connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
                    remoteName: (0, remoteHosts_1.getRemoteName)(this._environmentService.remoteAuthority),
                    message: err ? err.message : ''
                });
            }
        }
        async _measureExtHostLatency() {
            const measurement = await remoteAgentService_1.remoteConnectionLatencyMeasurer.measure(this._remoteAgentService);
            if (measurement === undefined) {
                return;
            }
            this._telemetryService.publicLog2('remoteConnectionLatency', {
                web: platform_2.isWeb,
                remoteName: (0, remoteHosts_1.getRemoteName)(this._environmentService.remoteAuthority),
                latencyMs: measurement.current
            });
        }
    };
    InitialRemoteConnectionHealthContribution = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, telemetry_1.ITelemetryService)
    ], InitialRemoteConnectionHealthContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(LabelContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteChannelsContribution, 3 /* LifecyclePhase.Restored */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteInvalidWorkspaceDetector, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(InitialRemoteConnectionHealthContribution, 3 /* LifecyclePhase.Restored */);
    const enableDiagnostics = true;
    if (enableDiagnostics) {
        class TriggerReconnectAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.triggerReconnect',
                    title: (0, nls_1.localize2)('triggerReconnect', 'Connection: Trigger Reconnect'),
                    category: actionCommonCategories_1.Categories.Developer,
                    f1: true,
                });
            }
            async run(accessor) {
                remoteAgentConnection_1.PersistentConnection.debugTriggerReconnection();
            }
        }
        class PauseSocketWriting extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.pauseSocketWriting',
                    title: (0, nls_1.localize2)('pauseSocketWriting', 'Connection: Pause socket writing'),
                    category: actionCommonCategories_1.Categories.Developer,
                    f1: true,
                });
            }
            async run(accessor) {
                remoteAgentConnection_1.PersistentConnection.debugPauseSocketWriting();
            }
        }
        (0, actions_1.registerAction2)(TriggerReconnectAction);
        (0, actions_1.registerAction2)(PauseSocketWriting);
    }
    const extensionKindSchema = {
        type: 'string',
        enum: [
            'ui',
            'workspace'
        ],
        enumDescriptions: [
            (0, nls_1.localize)('ui', "UI extension kind. In a remote window, such extensions are enabled only when available on the local machine."),
            (0, nls_1.localize)('workspace', "Workspace extension kind. In a remote window, such extensions are enabled only when available on the remote.")
        ],
    };
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'remote',
        title: (0, nls_1.localize)('remote', "Remote"),
        type: 'object',
        properties: {
            'remote.extensionKind': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)('remote.extensionKind', "Override the kind of an extension. `ui` extensions are installed and run on the local machine while `workspace` extensions are run on the remote. By overriding an extension's default kind using this setting, you specify if that extension should be installed and enabled locally or remotely."),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                        oneOf: [{ type: 'array', items: extensionKindSchema }, extensionKindSchema],
                        default: ['ui'],
                    },
                },
                default: {
                    'pub.name': ['ui']
                }
            },
            'remote.restoreForwardedPorts': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)('remote.restoreForwardedPorts', "Restores the ports you forwarded in a workspace."),
                default: true
            },
            'remote.autoForwardPorts': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)('remote.autoForwardPorts', "When enabled, new running processes are detected and ports that they listen on are automatically forwarded. Disabling this setting will not prevent all ports from being forwarded. Even when disabled, extensions will still be able to cause ports to be forwarded, and opening some URLs will still cause ports to forwarded."),
                default: true
            },
            'remote.autoForwardPortsSource': {
                type: 'string',
                markdownDescription: (0, nls_1.localize)('remote.autoForwardPortsSource', "Sets the source from which ports are automatically forwarded when {0} is true. On Windows and macOS remotes, the `process` and `hybrid` options have no effect and `output` will be used.", '`#remote.autoForwardPorts#`'),
                enum: ['process', 'output', 'hybrid'],
                enumDescriptions: [
                    (0, nls_1.localize)('remote.autoForwardPortsSource.process', "Ports will be automatically forwarded when discovered by watching for processes that are started and include a port."),
                    (0, nls_1.localize)('remote.autoForwardPortsSource.output', "Ports will be automatically forwarded when discovered by reading terminal and debug output. Not all processes that use ports will print to the integrated terminal or debug console, so some ports will be missed. Ports forwarded based on output will not be \"un-forwarded\" until reload or until the port is closed by the user in the Ports view."),
                    (0, nls_1.localize)('remote.autoForwardPortsSource.hybrid', "Ports will be automatically forwarded when discovered by reading terminal and debug output. Not all processes that use ports will print to the integrated terminal or debug console, so some ports will be missed. Ports will be \"un-forwarded\" by watching for processes that listen on that port to be terminated.")
                ],
                default: 'process'
            },
            'remote.autoForwardPortsFallback': {
                type: 'number',
                default: 20,
                markdownDescription: (0, nls_1.localize)('remote.autoForwardPortFallback', "The number of auto forwarded ports that will trigger the switch from `process` to `hybrid` when automatically forwarding ports and `remote.autoForwardPortsSource` is set to `process`. Set to `0` to disable the fallback.")
            },
            'remote.forwardOnOpen': {
                type: 'boolean',
                description: (0, nls_1.localize)('remote.forwardOnClick', "Controls whether local URLs with a port will be forwarded when opened from the terminal and the debug console."),
                default: true
            },
            // Consider making changes to extensions\configuration-editing\schemas\devContainer.schema.src.json
            // and extensions\configuration-editing\schemas\attachContainer.schema.json
            // to keep in sync with devcontainer.json schema.
            'remote.portsAttributes': {
                type: 'object',
                patternProperties: {
                    '(^\\d+(-\\d+)?$)|(.+)': {
                        type: 'object',
                        description: (0, nls_1.localize)('remote.portsAttributes.port', "A port, range of ports (ex. \"40000-55000\"), host and port (ex. \"db:1234\"), or regular expression (ex. \".+\\\\/server.js\").  For a port number or range, the attributes will apply to that port number or range of port numbers. Attributes which use a regular expression will apply to ports whose associated process command line matches the expression."),
                        properties: {
                            'onAutoForward': {
                                type: 'string',
                                enum: ['notify', 'openBrowser', 'openBrowserOnce', 'openPreview', 'silent', 'ignore'],
                                enumDescriptions: [
                                    (0, nls_1.localize)('remote.portsAttributes.notify', "Shows a notification when a port is automatically forwarded."),
                                    (0, nls_1.localize)('remote.portsAttributes.openBrowser', "Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),
                                    (0, nls_1.localize)('remote.portsAttributes.openBrowserOnce', "Opens the browser when the port is automatically forwarded, but only the first time the port is forward during a session. Depending on your settings, this could open an embedded browser."),
                                    (0, nls_1.localize)('remote.portsAttributes.openPreview', "Opens a preview in the same window when the port is automatically forwarded."),
                                    (0, nls_1.localize)('remote.portsAttributes.silent', "Shows no notification and takes no action when this port is automatically forwarded."),
                                    (0, nls_1.localize)('remote.portsAttributes.ignore', "This port will not be automatically forwarded.")
                                ],
                                description: (0, nls_1.localize)('remote.portsAttributes.onForward', "Defines the action that occurs when the port is discovered for automatic forwarding"),
                                default: 'notify'
                            },
                            'elevateIfNeeded': {
                                type: 'boolean',
                                description: (0, nls_1.localize)('remote.portsAttributes.elevateIfNeeded', "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),
                                default: false
                            },
                            'label': {
                                type: 'string',
                                description: (0, nls_1.localize)('remote.portsAttributes.label', "Label that will be shown in the UI for this port."),
                                default: (0, nls_1.localize)('remote.portsAttributes.labelDefault', "Application")
                            },
                            'requireLocalPort': {
                                type: 'boolean',
                                markdownDescription: (0, nls_1.localize)('remote.portsAttributes.requireLocalPort', "When true, a modal dialog will show if the chosen local port isn't used for forwarding."),
                                default: false
                            },
                            'protocol': {
                                type: 'string',
                                enum: ['http', 'https'],
                                description: (0, nls_1.localize)('remote.portsAttributes.protocol', "The protocol to use when forwarding this port.")
                            }
                        },
                        default: {
                            'label': (0, nls_1.localize)('remote.portsAttributes.labelDefault', "Application"),
                            'onAutoForward': 'notify'
                        }
                    }
                },
                markdownDescription: (0, nls_1.localize)('remote.portsAttributes', "Set properties that are applied when a specific port number is forwarded. For example:\n\n```\n\"3000\": {\n  \"label\": \"Application\"\n},\n\"40000-55000\": {\n  \"onAutoForward\": \"ignore\"\n},\n\".+\\\\/server.js\": {\n \"onAutoForward\": \"openPreview\"\n}\n```"),
                defaultSnippets: [{ body: { '${1:3000}': { label: '${2:Application}', onAutoForward: 'openPreview' } } }],
                errorMessage: (0, nls_1.localize)('remote.portsAttributes.patternError', "Must be a port number, range of port numbers, or regular expression."),
                additionalProperties: false,
                default: {
                    '443': {
                        'protocol': 'https'
                    },
                    '8443': {
                        'protocol': 'https'
                    }
                }
            },
            'remote.otherPortsAttributes': {
                type: 'object',
                properties: {
                    'onAutoForward': {
                        type: 'string',
                        enum: ['notify', 'openBrowser', 'openPreview', 'silent', 'ignore'],
                        enumDescriptions: [
                            (0, nls_1.localize)('remote.portsAttributes.notify', "Shows a notification when a port is automatically forwarded."),
                            (0, nls_1.localize)('remote.portsAttributes.openBrowser', "Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),
                            (0, nls_1.localize)('remote.portsAttributes.openPreview', "Opens a preview in the same window when the port is automatically forwarded."),
                            (0, nls_1.localize)('remote.portsAttributes.silent', "Shows no notification and takes no action when this port is automatically forwarded."),
                            (0, nls_1.localize)('remote.portsAttributes.ignore', "This port will not be automatically forwarded.")
                        ],
                        description: (0, nls_1.localize)('remote.portsAttributes.onForward', "Defines the action that occurs when the port is discovered for automatic forwarding"),
                        default: 'notify'
                    },
                    'elevateIfNeeded': {
                        type: 'boolean',
                        description: (0, nls_1.localize)('remote.portsAttributes.elevateIfNeeded', "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),
                        default: false
                    },
                    'label': {
                        type: 'string',
                        description: (0, nls_1.localize)('remote.portsAttributes.label', "Label that will be shown in the UI for this port."),
                        default: (0, nls_1.localize)('remote.portsAttributes.labelDefault', "Application")
                    },
                    'requireLocalPort': {
                        type: 'boolean',
                        markdownDescription: (0, nls_1.localize)('remote.portsAttributes.requireLocalPort', "When true, a modal dialog will show if the chosen local port isn't used for forwarding."),
                        default: false
                    },
                    'protocol': {
                        type: 'string',
                        enum: ['http', 'https'],
                        description: (0, nls_1.localize)('remote.portsAttributes.protocol', "The protocol to use when forwarding this port.")
                    }
                },
                defaultSnippets: [{ body: { onAutoForward: 'ignore' } }],
                markdownDescription: (0, nls_1.localize)('remote.portsAttributes.defaults', "Set default properties that are applied to all ports that don't get properties from the setting {0}. For example:\n\n```\n{\n  \"onAutoForward\": \"ignore\"\n}\n```", '`#remote.portsAttributes#`'),
                additionalProperties: false
            },
            'remote.localPortHost': {
                type: 'string',
                enum: ['localhost', 'allInterfaces'],
                default: 'localhost',
                description: (0, nls_1.localize)('remote.localPortHost', "Specifies the local host name that will be used for port forwarding.")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcmVtb3RlL2NvbW1vbi9yZW1vdGUuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZCekYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7UUFDN0IsWUFDaUMsWUFBMkIsRUFDckIsa0JBQXVDO1lBRDdDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3JCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDN0UsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVPLGtCQUFrQjtZQUN6QixJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBQ2pFLE1BQU0sRUFBRSxHQUFHLGlCQUFpQixFQUFFLEVBQUUsSUFBSSxhQUFFLENBQUM7Z0JBQ3ZDLE1BQU0sVUFBVSxHQUE0QjtvQkFDM0MsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLFNBQVMsRUFBRSxFQUFFLG9DQUE0QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUc7b0JBQ3RELE9BQU8sRUFBRSxFQUFFLG9DQUE0QjtvQkFDdkMsb0JBQW9CLEVBQUUsRUFBRSxvQ0FBNEI7b0JBQ3BELGVBQWUsRUFBRSxnQkFBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGlCQUFPLENBQUMsWUFBWTtpQkFDekQsQ0FBQztnQkFDRixJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO29CQUNuQyxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxZQUFZO29CQUM1QixVQUFVO2lCQUNWLENBQUMsQ0FBQztnQkFFSCxJQUFJ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
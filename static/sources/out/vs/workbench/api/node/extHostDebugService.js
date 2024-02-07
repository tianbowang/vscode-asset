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
define(["require", "exports", "vs/base/common/async", "vs/base/common/platform", "vs/nls", "vs/platform/externalTerminal/node/externalTerminalService", "vs/platform/sign/node/signService", "vs/workbench/api/common/extHostDebugService", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostVariableResolverService", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/contrib/debug/node/debugAdapter", "vs/workbench/contrib/debug/node/terminals", "../common/extHostConfiguration", "vs/workbench/api/common/extHostCommands"], function (require, exports, async_1, platform, nls, externalTerminalService_1, signService_1, extHostDebugService_1, extHostEditorTabs_1, extHostExtensionService_1, extHostRpcService_1, extHostTerminalService_1, extHostTypes_1, extHostVariableResolverService_1, extHostWorkspace_1, debugAdapter_1, terminals_1, extHostConfiguration_1, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostDebugService = void 0;
    let ExtHostDebugService = class ExtHostDebugService extends extHostDebugService_1.ExtHostDebugServiceBase {
        constructor(extHostRpcService, workspaceService, extensionService, configurationService, _terminalService, editorTabs, variableResolver, commands) {
            super(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver, commands);
            this._terminalService = _terminalService;
            this._integratedTerminalInstances = new DebugTerminalCollection();
        }
        createDebugAdapter(adapter, session) {
            switch (adapter.type) {
                case 'server':
                    return new debugAdapter_1.SocketDebugAdapter(adapter);
                case 'pipeServer':
                    return new debugAdapter_1.NamedPipeDebugAdapter(adapter);
                case 'executable':
                    return new debugAdapter_1.ExecutableDebugAdapter(adapter, session.type);
            }
            return super.createDebugAdapter(adapter, session);
        }
        daExecutableFromPackage(session, extensionRegistry) {
            const dae = debugAdapter_1.ExecutableDebugAdapter.platformAdapterExecutable(extensionRegistry.getAllExtensionDescriptions(), session.type);
            if (dae) {
                return new extHostTypes_1.DebugAdapterExecutable(dae.command, dae.args, dae.options);
            }
            return undefined;
        }
        createSignService() {
            return new signService_1.SignService();
        }
        async $runInTerminal(args, sessionId) {
            if (args.kind === 'integrated') {
                if (!this._terminalDisposedListener) {
                    // React on terminal disposed and check if that is the debug terminal #12956
                    this._terminalDisposedListener = this._terminalService.onDidCloseTerminal(terminal => {
                        this._integratedTerminalInstances.onTerminalClosed(terminal);
                    });
                }
                const configProvider = await this._configurationService.getConfigProvider();
                const shell = this._terminalService.getDefaultShell(true);
                const shellArgs = this._terminalService.getDefaultShellArgs(true);
                const terminalName = args.title || nls.localize('debug.terminal.title', "Debug Process");
                const shellConfig = JSON.stringify({ shell, shellArgs });
                let terminal = await this._integratedTerminalInstances.checkout(shellConfig, terminalName);
                let cwdForPrepareCommand;
                let giveShellTimeToInitialize = false;
                if (!terminal) {
                    const options = {
                        shellPath: shell,
                        shellArgs: shellArgs,
                        cwd: args.cwd,
                        name: terminalName,
                        iconPath: new extHostTypes_1.ThemeIcon('debug'),
                    };
                    giveShellTimeToInitialize = true;
                    terminal = this._terminalService.createTerminalFromOptions(options, {
                        isFeatureTerminal: true,
                        useShellEnvironment: true
                    });
                    this._integratedTerminalInstances.insert(terminal, shellConfig);
                }
                else {
                    cwdForPrepareCommand = args.cwd;
                }
                terminal.show(true);
                const shellProcessId = await terminal.processId;
                if (giveShellTimeToInitialize) {
                    // give a new terminal some time to initialize the shell
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                else {
                    if (configProvider.getConfiguration('debug.terminal').get('clearBeforeReusing')) {
                        // clear terminal before reusing it
                        if (shell.indexOf('powershell') >= 0 || shell.indexOf('pwsh') >= 0 || shell.indexOf('cmd.exe') >= 0) {
                            terminal.sendText('cls');
                        }
                        else if (shell.indexOf('bash') >= 0) {
                            terminal.sendText('clear');
                        }
                        else if (platform.isWindows) {
                            terminal.sendText('cls');
                        }
                        else {
                            terminal.sendText('clear');
                        }
                    }
                }
                const command = (0, terminals_1.prepareCommand)(shell, args.args, !!args.argsCanBeInterpretedByShell, cwdForPrepareCommand, args.env);
                terminal.sendText(command);
                // Mark terminal as unused when its session ends, see #112055
                const sessionListener = this.onDidTerminateDebugSession(s => {
                    if (s.id === sessionId) {
                        this._integratedTerminalInstances.free(terminal);
                        sessionListener.dispose();
                    }
                });
                return shellProcessId;
            }
            else if (args.kind === 'external') {
                return runInExternalTerminal(args, await this._configurationService.getConfigProvider());
            }
            return super.$runInTerminal(args, sessionId);
        }
    };
    exports.ExtHostDebugService = ExtHostDebugService;
    exports.ExtHostDebugService = ExtHostDebugService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostWorkspace_1.IExtHostWorkspace),
        __param(2, extHostExtensionService_1.IExtHostExtensionService),
        __param(3, extHostConfiguration_1.IExtHostConfiguration),
        __param(4, extHostTerminalService_1.IExtHostTerminalService),
        __param(5, extHostEditorTabs_1.IExtHostEditorTabs),
        __param(6, extHostVariableResolverService_1.IExtHostVariableResolverProvider),
        __param(7, extHostCommands_1.IExtHostCommands)
    ], ExtHostDebugService);
    let externalTerminalService = undefined;
    function runInExternalTerminal(args, configProvider) {
        if (!externalTerminalService) {
            if (platform.isWindows) {
                externalTerminalService = new externalTerminalService_1.WindowsExternalTerminalService();
            }
            else if (platform.isMacintosh) {
                externalTerminalService = new externalTerminalService_1.MacExternalTerminalService();
            }
            else if (platform.isLinux) {
                externalTerminalService = new externalTerminalService_1.LinuxExternalTerminalService();
            }
            else {
                throw new Error('external terminals not supported on this platform');
            }
        }
        const config = configProvider.getConfiguration('terminal');
        return externalTerminalService.runInTerminal(args.title, args.cwd, args.args, args.env || {}, config.external || {});
    }
    class DebugTerminalCollection {
        constructor() {
            this._terminalInstances = new Map();
        }
        /**
         * Delay before a new terminal is a candidate for reuse. See #71850
         */
        static { this.minUseDelay = 1000; }
        async checkout(config, name) {
            const entries = [...this._terminalInstances.entries()];
            const promises = entries.map(([terminal, termInfo]) => (0, async_1.createCancelablePromise)(async (ct) => {
                // Only allow terminals that match the title.  See #123189
                if (terminal.name !== name) {
                    return null;
                }
                if (termInfo.lastUsedAt !== -1 && await (0, terminals_1.hasChildProcesses)(await terminal.processId)) {
                    return null;
                }
                // important: date check and map operations must be synchronous
                const now = Date.now();
                if (termInfo.lastUsedAt + DebugTerminalCollection.minUseDelay > now || ct.isCancellationRequested) {
                    return null;
                }
                if (termInfo.config !== config) {
                    return null;
                }
                termInfo.lastUsedAt = now;
                return terminal;
            }));
            return await (0, async_1.firstParallel)(promises, (t) => !!t);
        }
        insert(terminal, termConfig) {
            this._terminalInstances.set(terminal, { lastUsedAt: Date.now(), config: termConfig });
        }
        free(terminal) {
            const info = this._terminalInstances.get(terminal);
            if (info) {
                info.lastUsedAt = -1;
            }
        }
        onTerminalClosed(terminal) {
            this._terminalInstances.delete(terminal);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERlYnVnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9ub2RlL2V4dEhvc3REZWJ1Z1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkJ6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLDZDQUF1QjtRQU8vRCxZQUNxQixpQkFBcUMsRUFDdEMsZ0JBQW1DLEVBQzVCLGdCQUEwQyxFQUM3QyxvQkFBMkMsRUFDekMsZ0JBQWlELEVBQ3RELFVBQThCLEVBQ2hCLGdCQUFrRCxFQUNsRSxRQUEwQjtZQUU1QyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBTDFGLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBeUI7WUFSbkUsaUNBQTRCLEdBQUcsSUFBSSx1QkFBdUIsRUFBRSxDQUFDO1FBY3JFLENBQUM7UUFFa0Isa0JBQWtCLENBQUMsT0FBMkIsRUFBRSxPQUE0QjtZQUM5RixRQUFRLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDdEIsS0FBSyxRQUFRO29CQUNaLE9BQU8sSUFBSSxpQ0FBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEMsS0FBSyxZQUFZO29CQUNoQixPQUFPLElBQUksb0NBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNDLEtBQUssWUFBWTtvQkFDaEIsT0FBTyxJQUFJLHFDQUFzQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsQ0FBQztZQUNELE9BQU8sS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRCxD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
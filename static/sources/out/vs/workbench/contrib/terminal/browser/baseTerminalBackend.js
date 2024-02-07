/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/nls"], function (require, exports, event_1, lifecycle_1, network_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseTerminalBackend = void 0;
    class BaseTerminalBackend extends lifecycle_1.Disposable {
        get isResponsive() { return !this._isPtyHostUnresponsive; }
        constructor(_ptyHostController, _logService, historyService, configurationResolverService, statusBarService, _workspaceContextService) {
            super();
            this._ptyHostController = _ptyHostController;
            this._logService = _logService;
            this._workspaceContextService = _workspaceContextService;
            this._isPtyHostUnresponsive = false;
            this._onPtyHostConnected = this._register(new event_1.Emitter());
            this.onPtyHostConnected = this._onPtyHostConnected.event;
            this._onPtyHostRestart = this._register(new event_1.Emitter());
            this.onPtyHostRestart = this._onPtyHostRestart.event;
            this._onPtyHostUnresponsive = this._register(new event_1.Emitter());
            this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
            this._onPtyHostResponsive = this._register(new event_1.Emitter());
            this.onPtyHostResponsive = this._onPtyHostResponsive.event;
            let unresponsiveStatusBarEntry;
            let statusBarAccessor;
            let hasStarted = false;
            // Attach pty host listeners
            this._register(this._ptyHostController.onPtyHostExit(() => {
                this._logService.error(`The terminal's pty host process exited, the connection to all terminal processes was lost`);
            }));
            this.onPtyHostConnected(() => hasStarted = true);
            this._register(this._ptyHostController.onPtyHostStart(() => {
                this._logService.debug(`The terminal's pty host process is starting`);
                // Only fire the _restart_ event after it has started
                if (hasStarted) {
                    this._logService.trace('IPtyHostController#onPtyHostRestart');
                    this._onPtyHostRestart.fire();
                }
                statusBarAccessor?.dispose();
                this._isPtyHostUnresponsive = false;
            }));
            this._register(this._ptyHostController.onPtyHostUnresponsive(() => {
                statusBarAccessor?.dispose();
                if (!unresponsiveStatusBarEntry) {
                    unresponsiveStatusBarEntry = {
                        name: (0, nls_1.localize)('ptyHostStatus', 'Pty Host Status'),
                        text: `$(debug-disconnect) ${(0, nls_1.localize)('ptyHostStatus.short', 'Pty Host')}`,
                        tooltip: (0, nls_1.localize)('nonResponsivePtyHost', "The connection to the terminal's pty host process is unresponsive, terminals may stop working. Click to manually restart the pty host."),
                        ariaLabel: (0, nls_1.localize)('ptyHostStatus.ariaLabel', 'Pty Host is unresponsive'),
                        command: "workbench.action.terminal.restartPtyHost" /* TerminalCommandId.RestartPtyHost */,
                        kind: 'warning'
                    };
                }
                statusBarAccessor = statusBarService.addEntry(unresponsiveStatusBarEntry, 'ptyHostStatus', 0 /* StatusbarAlignment.LEFT */);
                this._isPtyHostUnresponsive = true;
                this._onPtyHostUnresponsive.fire();
            }));
            this._register(this._ptyHostController.onPtyHostResponsive(() => {
                if (!this._isPtyHostUnresponsive) {
                    return;
                }
                this._logService.info('The pty host became responsive again');
                statusBarAccessor?.dispose();
                this._isPtyHostUnresponsive = false;
                this._onPtyHostResponsive.fire();
            }));
            this._register(this._ptyHostController.onPtyHostRequestResolveVariables(async (e) => {
                // Only answer requests for this workspace
                if (e.workspaceId !== this._workspaceContextService.getWorkspace().id) {
                    return;
                }
                const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
                const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
                const resolveCalls = e.originalText.map(t => {
                    return configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, t);
                });
                const result = await Promise.all(resolveCalls);
                this._ptyHostController.acceptPtyHostResolvedVariables(e.requestId, result);
            }));
        }
        restartPtyHost() {
            this._ptyHostController.restartPtyHost();
        }
        _deserializeTerminalState(serializedState) {
            if (serializedState === undefined) {
                return undefined;
            }
            const parsedUnknown = JSON.parse(serializedState);
            if (!('version' in parsedUnknown) || !('state' in parsedUnknown) || !Array.isArray(parsedUnknown.state)) {
                this._logService.warn('Could not revive serialized processes, wrong format', parsedUnknown);
                return undefined;
            }
            const parsedCrossVersion = parsedUnknown;
            if (parsedCrossVersion.version !== 1) {
                this._logService.warn(`Could not revive serialized processes, wrong version "${parsedCrossVersion.version}"`, parsedCrossVersion);
                return undefined;
            }
            return parsedCrossVersion.state;
        }
        _getWorkspaceId() {
            return this._workspaceContextService.getWorkspace().id;
        }
    }
    exports.BaseTerminalBackend = BaseTerminalBackend;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZVRlcm1pbmFsQmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci9iYXNlVGVybWluYWxCYWNrZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxNQUFzQixtQkFBb0IsU0FBUSxzQkFBVTtRQUczRCxJQUFJLFlBQVksS0FBYyxPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztRQVdwRSxZQUNrQixrQkFBc0MsRUFDcEMsV0FBZ0MsRUFDbkQsY0FBK0IsRUFDL0IsNEJBQTJELEVBQzNELGdCQUFtQyxFQUNoQix3QkFBa0Q7WUFFckUsS0FBSyxFQUFFLENBQUM7WUFQUyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3BDLGdCQUFXLEdBQVgsV0FBVyxDQUFxQjtZQUloQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBbkI5RCwyQkFBc0IsR0FBWSxLQUFLLENBQUM7WUFJN0Isd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDcEUsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUMxQyxzQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNsRSxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBQ3RDLDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3ZFLDBCQUFxQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFDaEQseUJBQW9CLEdBQUcsSUFBSSxDQUFD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
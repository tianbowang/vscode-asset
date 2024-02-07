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
define(["require", "exports", "electron", "os", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/ps", "vs/base/parts/ipc/electron-main/ipcMain", "vs/nls", "vs/platform/diagnostics/common/diagnostics", "vs/platform/diagnostics/electron-main/diagnosticsMainService", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/log/common/log", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/protocol/electron-main/protocol", "vs/platform/state/node/state", "vs/platform/utilityProcess/electron-main/utilityProcess", "vs/platform/window/common/window", "vs/platform/windows/electron-main/windows"], function (require, exports, electron_1, os_1, async_1, cancellation_1, extpath_1, lifecycle_1, network_1, platform_1, uri_1, ps_1, ipcMain_1, nls_1, diagnostics_1, diagnosticsMainService_1, dialogMainService_1, environmentMainService_1, log_1, nativeHostMainService_1, product_1, productService_1, protocol_1, state_1, utilityProcess_1, window_1, windows_1) {
    "use strict";
    var IssueMainService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IssueMainService = void 0;
    const processExplorerWindowState = 'issue.processExplorerWindowState';
    let IssueMainService = class IssueMainService {
        static { IssueMainService_1 = this; }
        static { this.DEFAULT_BACKGROUND_COLOR = '#1E1E1E'; }
        constructor(userEnv, environmentMainService, logService, diagnosticsService, diagnosticsMainService, dialogMainService, nativeHostMainService, protocolMainService, productService, stateService, windowsMainService) {
            this.userEnv = userEnv;
            this.environmentMainService = environmentMainService;
            this.logService = logService;
            this.diagnosticsService = diagnosticsService;
            this.diagnosticsMainService = diagnosticsMainService;
            this.dialogMainService = dialogMainService;
            this.nativeHostMainService = nativeHostMainService;
            this.protocolMainService = protocolMainService;
            this.productService = productService;
            this.stateService = stateService;
            this.windowsMainService = windowsMainService;
            this.issueReporterWindow = null;
            this.issueReporterParentWindow = null;
            this.processExplorerWindow = null;
            this.processExplorerParentWindow = null;
            this.registerListeners();
        }
        //#region Register Listeners
        registerListeners() {
            ipcMain_1.validatedIpcMain.on('vscode:listProcesses', async (event) => {
                const processes = [];
                try {
                    processes.push({ name: (0, nls_1.localize)('local', "Local"), rootProcess: await (0, ps_1.listProcesses)(process.pid) });
                    const remoteDiagnostics = await this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true });
                    remoteDiagnostics.forEach(data => {
                        if ((0, diagnostics_1.isRemoteDiagnosticError)(data)) {
                            processes.push({
                                name: data.hostName,
                                rootProcess: data
                            });
                        }
                        else {
                            if (data.processes) {
                                processes.push({
                                    name: data.hostName,
                                    rootProcess: data.processes
                                });
                            }
                        }
                    });
                }
                catch (e) {
                    this.logService.error(`Listing processes failed: ${e}`);
                }
                this.safeSend(event, 'vscode:listProcessesResponse', processes);
            });
            ipcMain_1.validatedIpcMain.on('vscode:workbenchCommand', (_, commandInfo) => {
                const { id, from, args } = commandInfo;
                let parentWindow;
                switch (from) {
                    case 'processExplorer':
                        parentWindow = this.processExplorerParentWindow;
                        break;
                    default:
                        // The issue reporter does not use this anymore.
                        throw new Error(`Unexpected command source: ${from}`);
                }
                parentWindow?.webContents.send('vscode:runAction', { id, from, args });
            });
            ipcMain_1.validatedIpcMain.on('vscode:closeProcessExplorer', event => {
                this.processExplorerWindow?.close();
            });
            ipcMain_1.validatedIpcMain.on('vscode:pidToNameRequest', async (event) => {
                const mainProcessInfo = await this.diagnosticsMainService.getMainDiagnostics();
                const pidToNames = [];
                for (const window of mainProcessInfo.windows) {
                    pidToNames.push([window.pid, `window [${window.id}] (${window.title})`]);
                }
                for (const { pid, name } of utilityProcess_1.UtilityProcess.getAll()) {
                    pidToNames.push([pid, name]);
                }
                this.safeSend(event, 'vscode:pidToNameResponse', pidToNames);
            });
        }
        //#endregion
        //#region Used by renderer
        async openReporter(data) {
            if (!this.issueReporterWindow) {
                this.issueReporterParentWindow = electron_1.BrowserWindow.getFocusedWindow();
                if (this.issueReporterParentWindow) {
                    const issueReporterDisposables = new lifecycle_1.DisposableStore();
                    const issueReporterWindowConfigUrl = issueReporterDisposables.add(this.protocolMainService.createIPCObjectUrl());
                    const position = this.getWindowPosition(this.issueReporterParentWindow, 700, 800);
                    this.issueReporterWindow = this.createBrowserWindow(position, issueReporterWindowConfigUrl, {
                        backgroundColor: data.styles.backgroundColor,
                        title: (0, nls_1.localize)('issueReporter', "Issue Reporter"),
                        zoomLevel: data.zoomLevel,
                        alwaysOnTop: false
                    }, 'issue-reporter');
                    // Store into config object URL
                    issueReporterWindowConfigUrl.update({
                        appRoot: this.environmentMainService.appRoot,
                        windowId: this.issueReporterWindow.id,
                        userEnv: this.userEnv,
                        data,
                        disableExtensions: !!this.environmentMainService.disableExtensions,
                        os: {
                            type: (0, os_1.type)(),
                            arch: (0, os_1.arch)(),
                            release: (0, os_1.release)(),
                        },
                        product: product_1.default
                    });
                    this.issueReporterWindow.loadURL(network_1.FileAccess.asBrowserUri(`vs/code/electron-sandbox/issue/issueReporter${this.environmentMainService.isBuilt ? '' : '-dev'}.html`).toString(true));
                    this.issueReporterWindow.on('close', () => {
                        this.issueReporterWindow = null;
                        issueReporterDisposables.dispose();
                    });
                    this.issueReporterParentWindow.on('closed', () => {
                        if (this.issueReporterWindow) {
                            this.issueReporterWindow.close();
                            this.issueReporterWindow = null;
                            issueReporterDisposables.dispose();
                        }
                    });
                }
            }
            if (this.issueReporterWindow) {
                this.focusWindow(this.issueReporterWindow);
            }
        }
        async openProcessExplorer(data) {
            if (!this.processExplorerWindow) {
                this.processExplorerParentWindow = electron_1.BrowserWindow.getFocusedWindow();
                if (this.processExplorerParentWindow) {
                    const processExplorerDisposables = new lifecycle_1.DisposableStore();
                    const processExplorerWindowConfigUrl = processExplorerDisposables.add(this.protocolMainService.createIPCObjectUrl());
                    const savedPosition = this.stateService.getItem(processExplorerWindowState, undefined);
                    const position = isStrictWindowState(savedPosition) ? savedPosition : this.getWindowPosition(this.processExplorerParentWindow, 800, 500);
                    this.processExplorerWindow = this.createBrowserWindow(position, processExplorerWindowConfigUrl, {
                        backgroundColor: data.styles.backgroundColor,
                        title: (0, nls_1.localize)('processExplorer', "Process Explorer"),
                        zoomLevel: data.zoomLevel,
                        alwaysOnTop: true
                    }, 'process-explorer');
                    // Store into config object URL
                    processExplorerWindowConfigUrl.update({
                        appRoot: this.environmentMainService.appRoot,
                        windowId: this.processExplorerWindow.id,
                        userEnv: this.userEnv,
                        data,
                        product: product_1.default
                    });
                    this.processExplorerWindow.loadURL(network_1.FileAccess.asBrowserUri(`vs/code/electron-sandbox/processExplorer/processExplorer${this.environmentMainService.isBuilt ? '' : '-dev'}.html`).toString(true));
                    this.processExplorerWindow.on('close', () => {
                        this.processExplorerWindow = null;
                        processExplorerDisposables.dispose();
                    });
                    this.processExplorerParentWindow.on('close', () => {
                        if (this.processExplorerWindow) {
                            this.processExplorerWindow.close();
                            this.processExplorerWindow = null;
                            processExplorerDisposables.dispose();
                        }
                    });
                    const storeState = () => {
                        if (!this.processExplorerWindow) {
                            return;
                        }
                        const size = this.processExplorerWindow.getSize();
                        const position = this.processExplorerWindow.getPosition();
                        if (!size || !position) {
                            return;
                        }
                        const state = {
                            width: size[0],
                            height: size[1],
                            x: position[0],
                            y: position[1]
                        };
                        this.stateService.setItem(processExplorerWindowState, state);
                    };
                    this.processExplorerWindow.on('moved', storeState);
                    this.processExplorerWindow.on('resized', storeState);
                }
            }
            if (this.processExplorerWindow) {
                this.focusWindow(this.processExplorerWindow);
            }
        }
        async stopTracing() {
            if (!this.environmentMainService.args.trace) {
                return; // requires tracing to be on
            }
            const path = await electron_1.contentTracing.stopRecording(`${(0, extpath_1.randomPath)(this.environmentMainService.userHome.fsPath, this.productService.applicationName)}.trace.txt`);
            // Inform user to report an issue
            await this.dialogMainService.showMessageBox({
                type: 'info',
                message: (0, nls_1.localize)('trace.message', "Successfully created the trace file"),
                detail: (0, nls_1.localize)('trace.detail', "Please create an issue and manually attach the following file:\n{0}", path),
                buttons: [(0, nls_1.localize)({ key: 'trace.ok', comment: ['&& denotes a mnemonic'] }, "&&OK")],
            }, electron_1.BrowserWindow.getFocusedWindow() ?? undefined);
            // Show item in explorer
            this.nativeHostMainService.showItemInFolder(undefined, path);
        }
        async getSystemStatus() {
            const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
            return this.diagnosticsService.getDiagnostics(info, remoteData);
        }
        //#endregion
        //#region used by issue reporter window
        async $getSystemInfo() {
            const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
            const msg = await this.diagnosticsService.getSystemInfo(info, remoteData);
            return msg;
        }
        async $getPerformanceInfo() {
            try {
                const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true })]);
                return await this.diagnosticsService.getPerformanceInfo(info, remoteData);
            }
            catch (error) {
                this.logService.warn('issueService#getPerformanceInfo ', error.message);
                throw error;
            }
        }
        async $reloadWithExtensionsDisabled() {
            if (this.issueReporterParentWindow) {
                try {
                    await this.nativeHostMainService.reload(this.issueReporterParentWindow.id, { disableExtensions: true });
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
        async $showConfirmCloseDialog() {
            if (this.issueReporterWindow) {
                const { response } = await this.dialogMainService.showMessageBox({
                    type: 'warning',
                    message: (0, nls_1.localize)('confirmCloseIssueReporter', "Your input will not be saved. Are you sure you want to close this window?"),
                    buttons: [
                        (0, nls_1.localize)({ key: 'yes', comment: ['&& denotes a mnemonic'] }, "&&Yes"),
                        (0, nls_1.localize)('cancel', "Cancel")
                    ]
                }, this.issueReporterWindow);
                if (response === 0) {
                    if (this.issueReporterWindow) {
                        this.issueReporterWindow.destroy();
                        this.issueReporterWindow = null;
                    }
                }
            }
        }
        async $showClipboardDialog() {
            if (this.issueReporterWindow) {
                const { response } = await this.dialogMainService.showMessageBox({
                    type: 'warning',
                    message: (0, nls_1.localize)('issueReporterWriteToClipboard', "There is too much data to send to GitHub directly. The data will be copied to the clipboard, please paste it into the GitHub issue page that is opened."),
                    buttons: [
                        (0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                        (0, nls_1.localize)('cancel', "Cancel")
                    ]
                }, this.issueReporterWindow);
                return response === 0;
            }
            return false;
        }
        issueReporterWindowCheck() {
            if (!this.issueReporterParentWindow) {
                throw new Error('Issue reporter window not available');
            }
            const window = this.windowsMainService.getWindowById(this.issueReporterParentWindow.id);
            if (!window) {
                throw new Error('Window not found');
            }
            return window;
        }
        async $getIssueReporterUri(extensionId) {
            const window = this.issueReporterWindowCheck();
            const replyChannel = `vscode:triggerIssueUriRequestHandlerResponse${window.id}`;
            return async_1.Promises.withAsyncBody(async (resolve, reject) => {
                const cts = new cancellation_1.CancellationTokenSource();
                window.sendWhenReady('vscode:triggerIssueUriRequestHandler', cts.token, { replyChannel, extensionId });
                ipcMain_1.validatedIpcMain.once(replyChannel, (_, data) => {
                    resolve(uri_1.URI.parse(data));
                });
                try {
                    await (0, async_1.timeout)(5000);
                    cts.cancel();
                    reject(new Error('Timed out waiting for issue reporter URI'));
                }
                finally {
                    ipcMain_1.validatedIpcMain.removeHandler(replyChannel);
                }
            });
        }
        async $getIssueReporterData(extensionId) {
            const window = this.issueReporterWindowCheck();
            const replyChannel = `vscode:triggerIssueDataProviderResponse${window.id}`;
            return async_1.Promises.withAsyncBody(async (resolve) => {
                const cts = new cancellation_1.CancellationTokenSource();
                window.sendWhenReady('vscode:triggerIssueDataProvider', cts.token, { replyChannel, extensionId });
                ipcMain_1.validatedIpcMain.once(replyChannel, (_, data) => {
                    resolve(data);
                });
                try {
                    await (0, async_1.timeout)(5000);
                    cts.cancel();
                    resolve('Error: Extension timed out waiting for issue reporter data');
                }
                finally {
                    ipcMain_1.validatedIpcMain.removeHandler(replyChannel);
                }
            });
        }
        async $getIssueReporterTemplate(extensionId) {
            const window = this.issueReporterWindowCheck();
            const replyChannel = `vscode:triggerIssueDataTemplateResponse${window.id}`;
            return async_1.Promises.withAsyncBody(async (resolve) => {
                const cts = new cancellation_1.CancellationTokenSource();
                window.sendWhenReady('vscode:triggerIssueDataTemplate', cts.token, { replyChannel, extensionId });
                ipcMain_1.validatedIpcMain.once(replyChannel, (_, data) => {
                    resolve(data);
                });
                try {
                    await (0, async_1.timeout)(5000);
                    cts.cancel();
                    resolve('Error: Extension timed out waiting for issue reporter template');
                }
                finally {
                    ipcMain_1.validatedIpcMain.removeHandler(replyChannel);
                }
            });
        }
        async $getReporterStatus(extensionId, extensionName) {
            const defaultResult = [false, false];
            const window = this.issueReporterWindowCheck();
            const replyChannel = `vscode:triggerReporterStatus`;
            const cts = new cancellation_1.CancellationTokenSource();
            window.sendWhenReady(replyChannel, cts.token, { replyChannel, extensionId, extensionName });
            const result = await (0, async_1.raceTimeout)(new Promise(resolve => ipcMain_1.validatedIpcMain.once('vscode:triggerReporterStatusResponse', (_, data) => resolve(data))), 2000, () => {
                this.logService.error('Error: Extension timed out waiting for reporter status');
                cts.cancel();
            });
            return (result ?? defaultResult);
        }
        async $closeReporter() {
            this.issueReporterWindow?.close();
        }
        async closeProcessExplorer() {
            this.processExplorerWindow?.close();
        }
        //#endregion
        focusWindow(window) {
            if (window.isMinimized()) {
                window.restore();
            }
            window.focus();
        }
        safeSend(event, channel, ...args) {
            if (!event.sender.isDestroyed()) {
                event.sender.send(channel, ...args);
            }
        }
        createBrowserWindow(position, ipcObjectUrl, options, windowKind) {
            const window = new electron_1.BrowserWindow({
                fullscreen: false,
                skipTaskbar: false,
                resizable: true,
                width: position.width,
                height: position.height,
                minWidth: 300,
                minHeight: 200,
                x: position.x,
                y: position.y,
                title: options.title,
                backgroundColor: options.backgroundColor || IssueMainService_1.DEFAULT_BACKGROUND_COLOR,
                webPreferences: {
                    preload: network_1.FileAccess.asFileUri('vs/base/parts/sandbox/electron-sandbox/preload.js').fsPath,
                    additionalArguments: [`--vscode-window-config=${ipcObjectUrl.resource.toString()}`],
                    v8CacheOptions: this.environmentMainService.useCodeCache ? 'bypassHeatCheck' : 'none',
                    enableWebSQL: false,
                    spellcheck: false,
                    zoomFactor: (0, window_1.zoomLevelToZoomFactor)(options.zoomLevel),
                    sandbox: true
                },
                alwaysOnTop: options.alwaysOnTop,
                experimentalDarkMode: true
            });
            window.setMenuBarVisibility(false);
            return window;
        }
        getWindowPosition(parentWindow, defaultWidth, defaultHeight) {
            // We want the new window to open on the same display that the parent is in
            let displayToUse;
            const displays = electron_1.screen.getAllDisplays();
            // Single Display
            if (displays.length === 1) {
                displayToUse = displays[0];
            }
            // Multi Display
            else {
                // on mac there is 1 menu per window so we need to use the monitor where the cursor currently is
                if (platform_1.isMacintosh) {
                    const cursorPoint = electron_1.screen.getCursorScreenPoint();
                    displayToUse = electron_1.screen.getDisplayNearestPoint(cursorPoint);
                }
                // if we have a last active window, use that display for the new window
                if (!displayToUse && parentWindow) {
                    displayToUse = electron_1.screen.getDisplayMatching(parentWindow.getBounds());
                }
                // fallback to primary display or first display
                if (!displayToUse) {
                    displayToUse = electron_1.screen.getPrimaryDisplay() || displays[0];
                }
            }
            const displayBounds = displayToUse.bounds;
            const state = {
                width: defaultWidth,
                height: defaultHeight,
                x: displayBounds.x + (displayBounds.width / 2) - (defaultWidth / 2),
                y: displayBounds.y + (displayBounds.height / 2) - (defaultHeight / 2)
            };
            if (displayBounds.width > 0 && displayBounds.height > 0 /* Linux X11 sessions sometimes report wrong display bounds */) {
                if (state.x < displayBounds.x) {
                    state.x = displayBounds.x; // prevent window from falling out of the screen to the left
                }
                if (state.y < displayBounds.y) {
                    state.y = displayBounds.y; // prevent window from falling out of the screen to the top
                }
                if (state.x > (displayBounds.x + displayBounds.width)) {
                    state.x = displayBounds.x; // prevent window from falling out of the screen to the right
                }
                if (state.y > (displayBounds.y + displayBounds.height)) {
                    state.y = displayBounds.y; // prevent window from falling out of the screen to the bottom
                }
                if (state.width > displayBounds.width) {
                    state.width = displayBounds.width; // prevent window from exceeding display bounds width
                }
                if (state.height > displayBounds.height) {
                    state.height = displayBounds.height; // prevent window from exceeding display bounds height
                }
            }
            return state;
        }
    };
    exports.IssueMainService = IssueMainService;
    exports.IssueMainService = IssueMainService = IssueMainService_1 = __decorate([
        __param(1, environmentMainService_1.IEnvironmentMainService),
        __param(2, log_1.ILogService),
        __param(3, diagnostics_1.IDiagnosticsService),
        __param(4, diagnosticsMainService_1.IDiagnosticsMainService),
        __param(5, dialogMainService_1.IDialogMainService),
        __param(6, nativeHostMainService_1.INativeHostMainService),
        __param(7, protocol_1.IProtocolMainService),
        __param(8, productService_1.IProductService),
        __param(9, state_1.IStateService),
        __param(10, windows_1.IWindowsMainService)
    ], IssueMainService);
    function isStrictWindowState(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }
        return ('x' in obj &&
            'y' in obj &&
            'width' in obj &&
            'height' in obj);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vaXNzdWUvZWxlY3Ryb24tbWFpbi9pc3N1ZU1haW5TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE4QmhHLE1BQU0sMEJBQTBCLEdBQUcsa0NBQWtDLENBQUM7SUFXL0QsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBZ0I7O2lCQUlKLDZCQUF3QixHQUFHLFNBQVMsQUFBWixDQUFhO1FBUTdELFlBQ1MsT0FBNEIsRUFDWCxzQkFBZ0UsRUFDNUUsVUFBd0MsRUFDaEMsa0JBQXdELEVBQ3BELHNCQUFnRSxFQUNyRSxpQkFBc0QsRUFDbEQscUJBQThELEVBQ2hFLG1CQUEwRCxFQUMvRCxjQUFnRCxFQUNsRCxZQUE0QyxFQUN0QyxrQkFBd0Q7WUFWckUsWUFBTyxHQUFQLE9BQU8sQ0FBcUI7WUFDTSwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQzNELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDZix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ25DLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDcEQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNqQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1lBQy9DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDOUMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2pDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3JCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFqQnRFLHdCQUFtQixHQUF5QixJQUFJLENBQUM7WUFDakQsOEJBQXlCLEdBQXlCLElBQUksQ0FBQztZQUV2RCwwQkFBcUIsR0FBeUIsSUFBSSxDQUFDO1lBQ25ELGdDQUEyQixHQUF5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
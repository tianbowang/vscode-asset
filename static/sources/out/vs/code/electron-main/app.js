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
define(["require", "exports", "electron", "vs/base/node/unc", "vs/base/parts/ipc/electron-main/ipcMain", "os", "vs/base/common/buffer", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/extpath", "vs/base/common/event", "vs/base/common/json", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/parts/contextmenu/electron-main/contextmenu", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/electron-main/ipc.electron", "vs/base/parts/ipc/electron-main/ipc.mp", "vs/code/electron-main/auth", "vs/nls", "vs/platform/backup/electron-main/backup", "vs/platform/backup/electron-main/backupMainService", "vs/platform/configuration/common/configuration", "vs/platform/debug/electron-main/extensionHostDebugIpc", "vs/platform/diagnostics/common/diagnostics", "vs/platform/diagnostics/electron-main/diagnosticsMainService", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/encryption/common/encryptionService", "vs/platform/encryption/electron-main/encryptionMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argvHelper", "vs/platform/shell/node/shellEnv", "vs/platform/extensions/common/extensionHostStarter", "vs/platform/extensions/electron-main/extensionHostStarter", "vs/platform/externalTerminal/electron-main/externalTerminal", "vs/platform/externalTerminal/node/externalTerminalService", "vs/platform/files/common/diskFileSystemProviderClient", "vs/platform/files/common/files", "vs/platform/files/electron-main/diskFileSystemProviderServer", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/issue/common/issue", "vs/platform/issue/electron-main/issueMainService", "vs/platform/keyboardLayout/electron-main/keyboardLayoutMainService", "vs/platform/launch/electron-main/launchMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/menubar/electron-main/menubarMainService", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/productService", "vs/platform/remote/common/remoteHosts", "vs/platform/sharedProcess/electron-main/sharedProcess", "vs/platform/sign/common/sign", "vs/platform/state/node/state", "vs/platform/storage/electron-main/storageIpc", "vs/platform/storage/electron-main/storageMainService", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/update/common/update", "vs/platform/update/common/updateIpc", "vs/platform/update/electron-main/updateService.darwin", "vs/platform/update/electron-main/updateService.linux", "vs/platform/update/electron-main/updateService.snap", "vs/platform/update/electron-main/updateService.win32", "vs/platform/url/common/url", "vs/platform/url/common/urlIpc", "vs/platform/url/common/urlService", "vs/platform/url/electron-main/electronUrlListener", "vs/platform/webview/common/webviewManagerService", "vs/platform/webview/electron-main/webviewMainService", "vs/platform/window/common/window", "vs/platform/windows/electron-main/windows", "vs/platform/windows/electron-main/windowsMainService", "vs/platform/windows/node/windowTracker", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/platform/workspaces/electron-main/workspacesMainService", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/policy/common/policy", "vs/platform/policy/common/policyIpc", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/request/common/requestIpc", "vs/platform/request/common/request", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/extensionManagement/node/extensionsScannerService", "vs/platform/userDataProfile/electron-main/userDataProfilesHandler", "vs/platform/userDataProfile/electron-main/userDataProfileStorageIpc", "vs/base/common/async", "vs/platform/telemetry/electron-main/telemetryUtils", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/electron-main/logIpc", "vs/platform/log/electron-main/loggerService", "vs/platform/utilityProcess/electron-main/utilityProcessWorkerMainService", "vs/platform/utilityProcess/common/utilityProcessWorkerService", "vs/base/common/arrays", "vs/platform/terminal/common/terminal", "vs/platform/terminal/electron-main/electronPtyHostStarter", "vs/platform/terminal/node/ptyHostService", "vs/platform/remote/common/electronRemoteResources", "vs/base/common/lazy", "vs/platform/auxiliaryWindow/electron-main/auxiliaryWindows", "vs/platform/auxiliaryWindow/electron-main/auxiliaryWindowsMainService"], function (require, exports, electron_1, unc_1, ipcMain_1, os_1, buffer_1, errorMessage_1, errors_1, extpath_1, event_1, json_1, labels_1, lifecycle_1, network_1, path_1, platform_1, types_1, uri_1, uuid_1, contextmenu_1, ipc_1, ipc_electron_1, ipc_mp_1, auth_1, nls_1, backup_1, backupMainService_1, configuration_1, extensionHostDebugIpc_1, diagnostics_1, diagnosticsMainService_1, dialogMainService_1, encryptionService_1, encryptionMainService_1, environmentMainService_1, argvHelper_1, shellEnv_1, extensionHostStarter_1, extensionHostStarter_2, externalTerminal_1, externalTerminalService_1, diskFileSystemProviderClient_1, files_1, diskFileSystemProviderServer_1, diskFileSystemProvider_1, descriptors_1, instantiation_1, serviceCollection_1, issue_1, issueMainService_1, keyboardLayoutMainService_1, launchMainService_1, lifecycleMainService_1, log_1, menubarMainService_1, nativeHostMainService_1, productService_1, remoteHosts_1, sharedProcess_1, sign_1, state_1, storageIpc_1, storageMainService_1, commonProperties_1, telemetry_1, telemetryIpc_1, telemetryService_1, telemetryUtils_1, update_1, updateIpc_1, updateService_darwin_1, updateService_linux_1, updateService_snap_1, updateService_win32_1, url_1, urlIpc_1, urlService_1, electronUrlListener_1, webviewManagerService_1, webviewMainService_1, window_1, windows_1, windowsMainService_1, windowTracker_1, workspace_1, workspaces_1, workspacesHistoryMainService_1, workspacesMainService_1, workspacesManagementMainService_1, policy_1, policyIpc_1, userDataProfile_1, requestIpc_1, request_1, extensionsProfileScannerService_1, extensionsScannerService_1, extensionsScannerService_2, userDataProfilesHandler_1, userDataProfileStorageIpc_1, async_1, telemetryUtils_2, extensionsProfileScannerService_2, logIpc_1, loggerService_1, utilityProcessWorkerMainService_1, utilityProcessWorkerService_1, arrays_1, terminal_1, electronPtyHostStarter_1, ptyHostService_1, electronRemoteResources_1, lazy_1, auxiliaryWindows_1, auxiliaryWindowsMainService_1) {
    "use strict";
    var CodeApplication_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeApplication = void 0;
    /**
     * The main VS Code application. There will only ever be one instance,
     * even if the user starts many instances (e.g. from the command line).
     */
    let CodeApplication = class CodeApplication extends lifecycle_1.Disposable {
        static { CodeApplication_1 = this; }
        static { this.SECURITY_PROTOCOL_HANDLING_CONFIRMATION_SETTING_KEY = {
            [network_1.Schemas.file]: 'security.promptForLocalFileProtocolHandling',
            [network_1.Schemas.vscodeRemote]: 'security.promptForRemoteFileProtocolHandling'
        }; }
        constructor(mainProcessNodeIpcServer, userEnv, mainInstantiationService, logService, loggerService, environmentMainService, lifecycleMainService, configurationService, stateService, fileService, productService, userDataProfilesMainService) {
            super();
            this.mainProcessNodeIpcServer = mainProcessNodeIpcServer;
            this.userEnv = userEnv;
            this.mainInstantiationService = mainInstantiationService;
            this.logService = logService;
            this.loggerService = loggerService;
            this.environmentMainService = environmentMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.configurationService = configurationService;
            this.stateService = stateService;
            this.fileService = fileService;
            this.productService = productService;
            this.userDataProfilesMainService = userDataProfilesMainService;
            this.configureSession();
            this.registerListeners();
        }
        configureSession() {
            //#region Security related measures (https://electronjs.org/docs/tutorial/security)
            //
            // !!! DO NOT CHANGE without consulting the documentation !!!
            //
            const isUrlFromWebview = (requestingUrl) => requestingUrl?.startsWith(`${network_1.Schemas.vscodeWebview}://`);
            const allowedPermissionsInWebview = new Set([
                'clipboard-read',
                'clipboard-sanitized-write',
            ]);
            electron_1.session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback, details) => {
                if (isUrlFromWebview(details.requestingUrl)) {
                    return callback(allowedPermissionsInWebview.has(permission));
                }
                return callback(false);
            });
            electron_1.session.defaultSession.setPermissionCheckHandler((_webContents, permission, _origin, details) => {
                if (isUrlFromWebview(details.requestingUrl)) {
                    return allowedPermissionsInWebview.has(permission);
                }
                return false;
            });
            //#endregion
            //#region Request filtering
            // Block all SVG requests from unsupported origins
            const supportedSvgSchemes = new Set([network_1.Schemas.file, network_1.Schemas.vscodeFileResource, network_1.Schemas.vscodeRemoteResource, network_1.Schemas.vscodeManagedRemoteResource, 'devtools']);
            // But allow them if the are made from inside an webview
            const isSafeFrame = (requestFrame) => {
                for (let frame = requestFrame; frame; frame = frame.parent) {
                    if (frame.url.startsWith(`${network_1.Schemas.vscodeWebview}://`)) {
                        return true;
                    }
                }
                return false;
            };
            const isSvgRequestFromSafeContext = (details) => {
                return details.resourceType === 'xhr' || isSafeFrame(details.frame);
            };
            const isAllowedVsCodeFileRequest = (details) => {
                const frame = details.frame;
                if (!frame || !this.windowsMainService) {
                    return false;
                }
                // Check to see if the request comes from one of the main windows (or shared process) and not from embedded content
                const windows = electron_1.BrowserWindow.getAllWindows();
                for (const window of windows) {
                    if (frame.processId === window.webContents.mainFrame.processId) {
                        return true;
                    }
                }
                return false;
            };
            const isAllowedWebviewRequest = (uri, details) => {
                if (uri.path !== '/index.html') {
                    return true; // Only restrict top level page of webviews: index.html
                }
                const frame = details.frame;
                if (!frame || !this.windowsMainService) {
                    return false;
                }
                // Check to see if the request comes from one of the main editor windows.
                for (const window of this.windowsMainService.getWindows()) {
                    if (window.win) {
                        if (frame.processId === window.win.webContents.mainFrame.processId) {
                            return true;
                        }
                    }
                }
                return false;
            };
            electron_1.session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
                const uri = uri_1.URI.parse(details.url);
                if (uri.scheme === network_1.Schemas.vscodeWebview) {
                    if (!isAllowedWebviewRequest(uri, details)) {
                        this.logService.error('Blocked vscode-webview request', details.url);
                        return callback({ cancel: true });
                    }
                }
                if (uri.scheme === network_1.Schemas.vscodeFileResource) {
                    if (!isAllowedVsCodeFileRequest(details)) {
                        this.logService.error('Blocked vscode-file request', details.url);
                        return callback({ cancel: true });
                    }
                }
                // Block most svgs
                if (uri.path.endsWith('.svg')) {
                    const isSafeResourceUrl = supportedSvgSchemes.has(uri.scheme);
                    if (!isSafeResourceUrl) {
                        return callback({ cancel: !isSvgRequestFromSafeContext(details) });
                    }
                }
                return callback({ cancel: false });
            });
            // Configure SVG header content type properly
            // https://github.com/microsoft/vscode/issues/97564
            electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
                const responseHeaders = details.responseHeaders;
                const contentTypes = (responseHeaders['content-type'] || responseHeaders['Content-Type']);
                if (contentTypes && Array.isArray(contentTypes)) {
                    const uri = uri_1.URI.parse(details.url);
                    if (uri.path.endsWith('.svg')) {
                        if (supportedSvgSchemes.has(uri.scheme)) {
                            responseHeaders['Content-Type'] = ['image/svg+xml'];
                            return callback({ cancel: false, responseHeaders });
                        }
                    }
                    // remote extension schemes have the following format
                    // http://127.0.0.1:<port>/vscode-remote-resource?path=
                    if (!uri.path.endsWith(network_1.Schemas.vscodeRemoteResource) && contentTypes.some(contentType => contentType.toLowerCase().includes('image/svg'))) {
                        return callback({ cancel: !isSvgRequestFromSafeContext(details) });
                    }
                }
                return callback({ cancel: false });
            });
            //#endregion
            //#region Allow CORS for the PRSS CDN
            // https://github.com/microsoft/vscode-remote-release/issues/9246
            electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
                if (details.url.startsWith('https://vscode.download.prss.microsoft.com/')) {
                    const responseHeaders = details.responseHeaders ?? Object.create(null);
                    if (responseHeaders['Access-Control-Allow-Origin'] === undefined) {
                        responseHeaders['Access-Control-Allow-Origin'] = ['*'];
                        return callback({ cancel: false, responseHeaders });
                    }
                }
                return callback({ cancel: false });
            });
            const defaultSession = electron_1.session.defaultSession;
            if (typeof defaultSession.setCodeCachePath === 'function' && this.environmentMainService.codeCachePath) {
                // Make sure to partition Chrome's code cache folder
                // in the same way as our code cache path to help
                // invalidate caches that we know are invalid
                // (https://github.com/microsoft/vscode/issues/120655)
                defaultSession.setCodeCachePath((0, path_1.join)(this.environmentMainService.codeCachePath, 'chrome'));
            }
            //#endregion
            //#region UNC Host Allowlist (Windows)
            if (platform_1.isWindows) {
                if (this.configurationService.getValue('security.restrictUNCAccess') === false) {
                    (0, unc_1.disableUNCAccessRestrictions)();
                }
                else {
                    (0, unc_1.addUNCHostToAllowlist)(this.configurationService.getValue('security.allowedUNCHosts'));
                }
            }
            //#endregion
        }
        registerListeners() {
            // We handle uncaught exceptions here to prevent electron from opening a dialog to the user
            (0, errors_1.setUnexpectedErrorHandler)(error => this.onUnexpectedError(error));
            process.on('uncaughtException', error => {
                if (!(0, errors_1.isSigPipeError)(error)) {
                    (0, errors_1.onUnexpectedError)(error);
                }
            });
            process.on('unhandledRejection', (reason) => (0, errors_1.onUnexpectedError)(reason));
            // Dispose on shutdown
            this.lifecycleMainService.onWillShutdown(() => this.dispose());
            // Contextmenu via IPC support
            (0, contextmenu_1.registerContextMenuListener)();
            // Accessibility change event
            electron_1.app.on('accessibility-support-changed', (event, accessibilitySupportEnabled) => {
                this.windowsMainService?.sendToAll('vscode:accessibilitySupportChanged', accessibilitySupportEnabled);
            });
            // macOS dock activate
            electron_1.app.on('activate', async (event, hasVisibleWindows) => {
                this.logService.trace('app#activate');
                // Mac only event: open new window when we get activated
                if (!hasVisibleWindows) {
                    await this.windowsMainService?.openEmptyWindow({ context: 1 /* OpenContext.DOCK */ });
                }
            });
            //#region Security related measures (https://electronjs.org/docs/tutorial/security)
            //
            // !!! DO NOT CHANGE without consulting the documentation !!!
            //
            electron_1.app.on('web-contents-created', (event, contents) => {
                // Auxiliary Window: delegate to `AuxiliaryWindow` class
                if ((0, auxiliaryWindows_1.isAuxiliaryWindow)(contents)) {
                    this.logService.trace('[aux window]  app.on("web-contents-created"): Registering auxiliary window');
                    this.auxiliaryWindowsMainService?.registerWindow(contents);
                }
                // Block any in-page navigation
                contents.on('will-navigate', event => {
                    this.logService.error('webContents#will-navigate: Prevented webcontent navigation');
                    event.preventDefault();
                });
                // All Windows: only allow about:blank auxiliary windows to open
                // For all other URLs, delegate to the OS.
                contents.setWindowOpenHandler(handler => {
                    // about:blank windows can open as window witho our default options
                    if (handler.url === 'about:blank') {
                        this.logService.trace('[aux window] webContents#setWindowOpenHandler: Allowing auxiliary window to open on about:blank');
                        return {
                            action: 'allow',
                            overrideBrowserWindowOptions: this.auxiliaryWindowsMainService?.createWindow()
                        };
                    }
                    // Any other URL: delegate to OS
                    else {
                        this.logService.trace(`webContents#setWindowOpenHandler: Prevented opening window with URL ${handler.url}}`);
                        this.nativeHostMainService?.openExternal(undefined, handler.url);
                        return { action: 'deny' };
                    }
                });
            });
            //#endregion
            let macOpenFileURIs = [];
            let runningTimeout = undefined;
            electron_1.app.on('open-file', (event, path) => {
                this.logService.trace('app#open-file: ', path);
                event.preventDefault();
                // Keep in array because more might come!
                macOpenFileURIs.push((0, workspace_1.hasWorkspaceFileExtension)(path) ? { workspaceUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) });
                // Clear previous handler if any
                if (runningTimeout !== undefined) {
                    clearTimeout(runningTimeout);
                    runningTimeout = undefined;
                }
                // Handle paths delayed in case more are coming!
                runningTimeout = setTimeout(async () => {
                    await this.windowsMainService?.open({
                        context: 1 /* OpenContext.DOCK */ /* can also be opening from finder while app is running */,
                        cli: this.environmentMainService.args,
                        urisToOpen: macOpenFileURIs,
                        gotoLineMode: false,
                        preferNewWindow: true /* dropping on the dock or opening from finder prefers to open in a new window */
                    });
                    macOpenFileURIs = [];
                    runningTimeout = undefined;
                }, 100);
            });
            electron_1.app.on('new-window-for-tab', async () => {
                await this.windowsMainService?.openEmptyWindow({ context: 4 /* OpenContext.DESKTOP */ }); //macOS native tab "+" button
            });
            //#region Bootstrap IPC Handlers
            ipcMain_1.validatedIpcMain.handle('vscode:fetchShellEnv', event => {
                // Prefer to use the args and env from the target window
                // when resolving the shell env. It is possible that
                // a first window was opened from the UI but a second
                // from the CLI and that has implications for whether to
                // resolve the shell environment or not.
                //
                // Window can be undefined for e.g. the shared process
                // that is not part of our windows registry!
                const window = this.windowsMainService?.getWindowByWebContents(event.sender); // Note: this can be `undefined` for the shared process
                let args;
                let env;
                if (window?.config) {
                    args = window.config;
                    env = { ...process.env, ...window.config.userEnv };
                }
                else {
                    args = this.environmentMainService.args;
                    env = process.env;
                }
                // Resolve shell env
                return this.resolveShellEnvironment(args, env, false);
            });
            ipcMain_1.validatedIpcMain.handle('vscode:writeNlsFile', (event, path, data) => {
                const uri = this.validateNlsPath([path]);
                if (!uri || typeof data !== 'string') {
                    throw new Error('Invalid operation (vscode:writeNlsFile)');
                }
                return this.fileService.writeFile(uri, buffer_1.VSBuffer.fromString(data));
            });
            ipcMain_1.validatedIpcMain.handle('vscode:readNlsFile', async (event, ...paths) => {
                const uri = this.validateNlsPath(paths);
                if (!uri) {
                    throw new Error('Invalid operation (vscode:readNlsFile)');
                }
                return (await this.fileService.readFile(uri)).value.toString();
            });
            ipcMain_1.validatedIpcMain.on('vscode:toggleDevTools', event => event.sender.toggleDevTools());
            ipcMain_1.validatedIpcMain.on('vscode:openDevTools', event => event.sender.openDevTools());
            ipcMain_1.validatedIpcMain.on('vscode:reloadWindow', event => event.sender.reload());
            ipcMain_1.validatedIpcMain.handle('vscode:notifyZoomLevel', async (event, zoomLevel) => {
                const window = this.windowsMainService?.getWindowById(event.sender.id);
                if (window) {
                    window.notifyZoomLevel(zoomLevel);
                }
            });
            //#endregion
        }
        validateNlsPath(pathSegments) {
            let path = undefined;
            for (const pathSegment of pathSegments) {
                if (typeof pathSegment === 'string') {
                    if (typeof path !== 'string') {
                        path = pathSegment;
                    }
                    else {
                        path = (0, path_1.join)(path, pathSegment);
                    }
                }
            }
            if (typeof path !== 'string' || !(0, path_1.isAbsolute)(path) || !(0, extpath_1.isEqualOrParent)(path, this.environmentMainService.cachedLanguagesPath, !platform_1.isLinux)) {
                return undefined;
            }
            return uri_1.URI.file(path);
        }
        onUnexpectedError(error) {
            if (error) {
                // take only the message and stack property
                const friendlyError = {
                    message: `[uncaught exception in main]: ${error.message}`,
                    stack: error.stack
                };
                // handle on client side
                this.windowsMainService?.sendToFocused('vscode:reportError', JSON.stringify(friendlyError));
            }
            this.logService.error(`[uncaught exception in main]: ${error}`);
            if (error.stack) {
                this.logService.error(error.stack);
            }
        }
        async startup() {
            this.logService.debug('Starting VS Code');
            this.logService.debug(`from: ${this.environmentMainService.appRoot}`);
            this.logService.debug('args:', this.environmentMainService.args);
            // Make sure we associate the program with the app user model id
            // This will help Windows to associate the running program with
            // any shortcut that is pinned to the taskbar and prevent showing
            // two icons in the taskbar for the same app.
            const win32AppUserModelId = this.productService.win32AppUserModelId;
            if (platform_1.isWindows && win32AppUserModelId) {
                electron_1.app.setAppUserModelId(win32AppUserModelId);
            }
            // Fix native tabs on macOS 10.13
            // macOS enables a compatibility patch for any bundle ID beginning with
            // "com.microsoft.", which breaks native tabs for VS Code when using this
            // identifier (from the official build).
            // Explicitly opt out of the patch here before creating any windows.
            // See: https://github.com/microsoft/vscode/issues/35361#issuecomment-399794085
            try {
                if (platform_1.isMacintosh && this.configurationService.getValue('window.nativeTabs') === true && !electron_1.systemPreferences.getUserDefault('NSUseImprovedLayoutPass', 'boolean')) {
                    electron_1.systemPreferences.setUserDefault('NSUseImprovedLayoutPass', 'boolean', true);
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            // Main process server (electron IPC based)
            const mainProcessElectronServer = new ipc_electron_1.Server();
            this.lifecycleMainService.onWillShutdown(e => {
                if (e.reason === 2 /* ShutdownReason.KILL */) {
                    // When we go down abnormally, make sure to free up
                    // any IPC we accept from other windows to reduce
                    // the chance of doing work after we go down. Kill
                    // is special in that it does not orderly shutdown
                    // windows.
                    mainProcessElectronServer.dispose();
                }
            });
            // Resolve unique machine ID
            this.logService.trace('Resolving machine identifier...');
            const [machineId, sqmId] = await Promise.all([
                (0, telemetryUtils_2.resolveMachineId)(this.stateService, this.logService),
                (0, telemetryUtils_2.resolveSqmId)(this.stateService, this.logService)
            ]);
            this.logService.trace(`Resolved machine identifier: ${machineId}`);
            // Shared process
            const { sharedProcessReady, sharedProcessClient } = this.setupSharedProcess(machineId, sqmId);
            // Services
            const appInstantiationService = await this.initServices(machineId, sqmId, sharedProcessReady);
            // Auth Handler
            this._register(appInstantiationService.createInstance(auth_1.ProxyAuthHandler));
            // Transient profiles handler
            this._register(appInstantiationService.createInstance(userDataProfilesHandler_1.UserDataProfilesHandler));
            // Init Channels
            appInstantiationService.invokeFunction(accessor => this.initChannels(accessor, mainProcessElectronServer, sharedProcessClient));
            // Setup Protocol URL Handlers
            const initialProtocolUrls = await appInstantiationService.invokeFunction(accessor => this.setupProtocolUrlHandlers(accessor, mainProcessElectronServer));
            // Setup vscode-remote-resource protocol handler.
            this.setupManagedRemoteResourceUrlHandler(mainProcessElectronServer);
            // Signal phase: ready - before opening first window
            this.lifecycleMainService.phase = 2 /* LifecycleMainPhase.Ready */;
            // Open Windows
            await appInstantiationService.invokeFunction(accessor => this.openFirstWindow(accessor, initialProtocolUrls));
            // Signal phase: after window open
            this.lifecycleMainService.phase = 3 /* LifecycleMainPhase.AfterWindowOpen */;
            // Post Open Windows Tasks
            this.afterWindowOpen();
            // Set lifecycle phase to `Eventually` after a short delay and when idle (min 2.5sec, max 5sec)
            const eventuallyPhaseScheduler = this._register(new async_1.RunOnceScheduler(() => {
                this._register((0, async_1.runWhenGlobalIdle)(() => this.lifecycleMainService.phase = 4 /* LifecycleMainPhase.Eventually */, 2500));
            }, 2500));
            eventuallyPhaseScheduler.schedule();
        }
        async setupProtocolUrlHandlers(accessor, mainProcessElectronServer) {
            const windowsMainService = this.windowsMainService = accessor.get(windows_1.IWindowsMainService);
            const urlService = accessor.get(url_1.IURLService);
            const nativeHostMainService = this.nativeHostMainService = accessor.get(nativeHostMainService_1.INativeHostMainService);
            const dialogMainService = accessor.get(dialogMainService_1.IDialogMainService);
            // Install URL handlers that deal with protocl URLs either
            // from this process by opening windows and/or by forwarding
            // the URLs into a window process to be handled there.
            const app = this;
            urlService.registerHandler({
                async handleURL(uri, options) {
                    return app.handleProtocolUrl(windowsMainService, dialogMainService, urlService, uri, options);
                }
            });
            const activeWindowManager = this._register(new windowTracker_1.ActiveWindowManager({
                onDidOpenMainWindow: nativeHostMainService.onDidOpenMainWindow,
                onDidFocusMainWindow: nativeHostMainService.onDidFocusMainWindow,
                getActiveWindowId: () => nativeHostMainService.getActiveWindowId(-1)
            }));
            const activeWindowRouter = new ipc_1.StaticRouter(ctx => activeWindowManager.getActiveClientId().then(id => ctx === id));
            const urlHandlerRouter = new urlIpc_1.URLHandlerRouter(activeWindowRouter, this.logService);
            const urlHandlerChannel = mainProcessElectronServer.getChannel('urlHandler', urlHandlerRouter);
            urlService.registerHandler(new urlIpc_1.URLHandlerChannelClient(urlHandlerChannel));
            const initialProtocolUrls = await this.resolveInitialProtocolUrls(windowsMainService, dialogMainService);
            this._register(new electronUrlListener_1.ElectronURLListener(initialProtocolUrls?.urls, urlService, windowsMainService, this.environmentMainService, this.productService, this.logService));
            return initialProtocolUrls;
        }
        setupManagedRemoteResourceUrlHandler(mainProcessElectronServer) {
            const notFound = () => ({ statusCode: 404, data: 'Not found' });
            const remoteResourceChannel = new lazy_1.Lazy(() => mainProcessElectronServer.getChannel(electronRemoteResources_1.NODE_REMOTE_RESOURCE_CHANNEL_NAME, new electronRemoteResources_1.NodeRemoteResourceRouter()));
            electron_1.protocol.registerBufferProtocol(network_1.Schemas.vscodeManagedRemoteResource, (request, callback) => {
                const url = uri_1.URI.parse(request.url);
                if (!url.authority.startsWith('window:')) {
                    return callback(notFound());
                }
                remoteResourceChannel.value.call(electronRemoteResources_1.NODE_REMOTE_RESOURCE_IPC_METHOD_NAME, [url]).then(r => callback({ ...r, data: Buffer.from(r.body, 'base64') }), err => {
                    this.logService.warn('error dispatching remote resource call', err);
                    callback({ statusCode: 500, data: String(err) });
                });
            });
        }
        async resolveInitialProtocolUrls(windowsMainService, dialogMainService) {
            /**
             * Protocol URL handling on startup is complex, refer to
             * {@link IInitialProtocolUrls} for an explainer.
             */
            // Windows/Linux: protocol handler invokes CLI with --open-url
            const protocolUrlsFromCommandLine = this.environmentMainService.args['open-url'] ? this.environmentMainService.args._urls || [] : [];
            if (protocolUrlsFromCommandLine.length > 0) {
                this.logService.trace('app#resolveInitialProtocolUrls() protocol urls from command line:', protocolUrlsFromCommandLine);
            }
            // macOS: open-url events that were received before the app is ready
            const protocolUrlsFromEvent = (global.getOpenUrls() || []);
            if (protocolUrlsFromEvent.length > 0) {
                this.logService.trace(`app#resolveInitialProtocolUrls() protocol urls from macOS 'open-url' event:`, protocolUrlsFromEvent);
            }
            if (protocolUrlsFromCommandLine.length + protocolUrlsFromEvent.length === 0) {
                return undefined;
            }
            const protocolUrls = [
                ...protocolUrlsFromCommandLine,
                ...protocolUrlsFromEvent
            ].map(url => {
                try {
                    return { uri: uri_1.URI.parse(url), originalUrl: url };
                }
                catch {
                    this.logService.trace('app#resolveInitialProtocolUrls() protocol url failed to parse:', url);
                    return undefined;
                }
            });
            const openables = [];
            const urls = [];
            for (const protocolUrl of protocolUrls) {
                if (!protocolUrl) {
                    continue; // invalid
                }
                const windowOpenable = this.getWindowOpenableFromProtocolUrl(protocolUrl.uri);
                if (windowOpenable) {
                    if (await this.shouldBlockOpenable(windowOpenable, windowsMainService, dialogMainService)) {
                        this.logService.trace('app#resolveInitialProtocolUrls() protocol url was blocked:', protocolUrl.uri.toString(true));
                        continue; // blocked
                    }
                    else {
                        this.logService.trace('app#resolveInitialProtocolUrls() protocol url will be handled as window to open:', protocolUrl.uri.toString(true), windowOpenable);
                        openables.push(windowOpenable); // handled as window to open
                    }
                }
                else {
                    this.logService.trace('app#resolveInitialProtocolUrls() protocol url will be passed to active window for handling:', protocolUrl.uri.toString(true));
                    urls.push(protocolUrl); // handled within active window
                }
            }
            return { urls, openables };
        }
        async shouldBlockOpenable(openable, windowsMainService, dialogMainService) {
            let openableUri;
            let message;
            if ((0, window_1.isWorkspaceToOpen)(openable)) {
                openableUri = openable.workspaceUri;
                message = (0, nls_1.localize)('confirmOpenMessageWorkspace', "An external application wants to open '{0}' in {1}. Do you want to open this workspace file?", openableUri.scheme === network_1.Schemas.file ? (0, labels_1.getPathLabel)(openableUri, { os: platform_1.OS, tildify: this.environmentMainService }) : openableUri.toString(true), this.productService.nameShort);
            }
            else if ((0, window_1.isFolderToOpen)(openable)) {
                openableUri = openable.folderUri;
                message = (0, nls_1.localize)('confirmOpenMessageFolder', "An external application wants to open '{0}' in {1}. Do you want to open this folder?", openableUri.scheme === network_1.Schemas.file ? (0, labels_1.getPathLabel)(openableUri, { os: platform_1.OS, tildify: this.environmentMainService }) : openableUri.toString(true), this.productService.nameShort);
            }
            else {
                openableUri = openable.fileUri;
                message = (0, nls_1.localize)('confirmOpenMessageFileOrFolder', "An external application wants to open '{0}' in {1}. Do you want to open this file or folder?", openableUri.scheme === network_1.Schemas.file ? (0, labels_1.getPathLabel)(openableUri, { os: platform_1.OS, tildify: this.environmentMainService }) : openableUri.toString(true), this.productService.nameShort);
            }
            if (openableUri.scheme !== network_1.Schemas.file && openableUri.scheme !== network_1.Schemas.vscodeRemote) {
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                //
                // NOTE: we currently only ask for confirmation for `file` and `vscode-remote`
                // authorities here. There is an additional confirmation for `extension.id`
                // authorities from within the window.
                //
                // IF YOU ARE PLANNING ON ADDING ANOTHER AUTHORITY HERE, MAKE SURE TO ALSO
                // ADD IT TO THE CONFIRMATION CODE BELOW OR INSIDE THE WINDOW!
                //
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                return false;
            }
            const askForConfirmation = this.configurationService.getValue(CodeApplication_1.SECURITY_PROTOCOL_HANDLING_CONFIRMATION_SETTING_KEY[openableUri.scheme]);
            if (askForConfirmation === false) {
                return false; // not blocked via settings
            }
            const { response, checkboxChecked } = await dialogMainService.showMessageBox({
                type: 'warning',
                buttons: [
                    (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Yes"),
                    (0, nls_1.localize)({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&No")
                ],
                message,
                detail: (0, nls_1.localize)('confirmOpenDetail', "If you did not initiate this request, it may represent an attempted attack on your system. Unless you took an explicit action to initiate this request, you should press 'No'"),
                checkboxLabel: openableUri.scheme === network_1.Schemas.file ? (0, nls_1.localize)('doNotAskAgainLocal', "Allow opening local paths without asking") : (0, nls_1.localize)('doNotAskAgainRemote', "Allow opening remote paths without asking"),
                cancelId: 1
            });
            if (response !== 0) {
                return true; // blocked by user choice
            }
            if (checkboxChecked) {
                // Due to https://github.com/microsoft/vscode/issues/195436, we can only
                // update settings from within a window. But we do not know if a window
                // is about to open or can already handle the request, so we have to send
                // to any current window and any newly opening window.
                const request = { channel: 'vscode:disablePromptForProtocolHandling', args: openableUri.scheme === network_1.Schemas.file ? 'local' : 'remote' };
                windowsMainService.sendToFocused(request.channel, request.args);
                windowsMainService.sendToOpeningWindow(request.channel, request.args);
            }
            return false; // not blocked by user choice
        }
        getWindowOpenableFromProtocolUrl(uri) {
            if (!uri.path) {
                return undefined;
            }
            // File path
            if (uri.authority === network_1.Schemas.file) {
                const fileUri = uri_1.URI.file(uri.fsPath);
                if ((0, workspace_1.hasWorkspaceFileExtension)(fileUri)) {
                    return { workspaceUri: fileUri };
                }
                return { fileUri };
            }
            // Remote path
            else if (uri.authority === network_1.Schemas.vscodeRemote) {
                // Example conversion:
                // From: vscode://vscode-remote/wsl+ubuntu/mnt/c/GitDevelopment/monaco
                //   To: vscode-remote://wsl+ubuntu/mnt/c/GitDevelopment/monaco
                const secondSlash = uri.path.indexOf(path_1.posix.sep, 1 /* skip over the leading slash */);
                if (secondSlash !== -1) {
                    const authority = uri.path.substring(1, secondSlash);
                    const path = uri.path.substring(secondSlash);
                    let query = uri.query;
                    const params = new URLSearchParams(uri.query);
                    if (params.get('windowId') === '_blank') {
                        // Make sure to unset any `windowId=_blank` here
                        // https://github.com/microsoft/vscode/issues/191902
                        params.delete('windowId');
                        query = params.toString();
                    }
                    const remoteUri = uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, authority, path, query, fragment: uri.fragment });
                    if ((0, workspace_1.hasWorkspaceFileExtension)(path)) {
                        return { workspaceUri: remoteUri };
                    }
                    if (/:[\d]+$/.test(path)) {
                        // path with :line:column syntax
                        return { fileUri: remoteUri };
                    }
                    return { folderUri: remoteUri };
                }
            }
            return undefined;
        }
        async handleProtocolUrl(windowsMainService, dialogMainService, urlService, uri, options) {
            this.logService.trace('app#handleProtocolUrl():', uri.toString(true), options);
            // Support 'workspace' URLs (https://github.com/microsoft/vscode/issues/124263)
            if (uri.scheme === this.productService.urlProtocol && uri.path === 'workspace') {
                uri = uri.with({
                    authority: 'file',
                    path: uri_1.URI.parse(uri.query).path,
                    query: ''
                });
            }
            let shouldOpenInNewWindow = false;
            // We should handle the URI in a new window if the URL contains `windowId=_blank`
            const params = new URLSearchParams(uri.query);
            if (params.get('windowId') === '_blank') {
                this.logService.trace(`app#handleProtocolUrl() found 'windowId=_blank' as parameter, setting shouldOpenInNewWindow=true:`, uri.toString(true));
                params.delete('windowId');
                uri = uri.with({ query: params.toString() });
                shouldOpenInNewWindow = true;
            }
            // or if no window is open (macOS only)
            else if (platform_1.isMacintosh && windowsMainService.getWindowCount() === 0) {
                this.logService.trace(`app#handleProtocolUrl() running on macOS with no window open, setting shouldOpenInNewWindow=true:`, uri.toString(true));
                shouldOpenInNewWindow = true;
            }
            // Pass along whether the application is being opened via a Continue On flow
            const continueOn = params.get('continueOn');
            if (continueOn !== null) {
                this.logService.trace(`app#handleProtocolUrl() found 'continueOn' as parameter:`, uri.toString(true));
                params.delete('continueOn');
                uri = uri.with({ query: params.toString() });
                this.environmentMainService.continueOn = continueOn ?? undefined;
            }
            // Check if the protocol URL is a window openable to open...
            const windowOpenableFromProtocolUrl = this.getWindowOpenableFromProtocolUrl(uri);
            if (windowOpenableFromProtocolUrl) {
                if (await this.shouldBlockOpenable(windowOpenableFromProtocolUrl, windowsMainService, dialogMainService)) {
                    this.logService.trace('app#handleProtocolUrl() protocol url was blocked:', uri.toString(true));
                    return true; // If openable should be blocked, behave as if it's handled
                }
                else {
                    this.logService.trace('app#handleProtocolUrl() opening protocol url as window:', windowOpenableFromProtocolUrl, uri.toString(true));
                    const window = (0, arrays_1.firstOrDefault)(await windowsMainService.open({
                        context: 5 /* OpenContext.API */,
                        cli: { ...this.environmentMainService.args },
                        urisToOpen: [windowOpenableFromProtocolUrl],
                        forceNewWindow: shouldOpenInNewWindow,
                        gotoLineMode: true
                        // remoteAuthority: will be determined based on windowOpenableFromProtocolUrl
                    }));
                    window?.focus(); // this should help ensuring that the right window gets focus when multiple are opened
                    return true;
                }
            }
            // ...or if we should open in a new window and then handle it within that window
            if (shouldOpenInNewWindow) {
                this.logService.trace('app#handleProtocolUrl() opening empty window and passing in protocol url:', uri.toString(true));
                const window = (0, arrays_1.firstOrDefault)(await windowsMainService.open({
                    context: 5 /* OpenContext.API */,
                    cli: { ...this.environmentMainService.args },
                    forceNewWindow: true,
                    forceEmpty: true,
                    gotoLineMode: true,
                    remoteAuthority: (0, remoteHosts_1.getRemoteAuthority)(uri)
                }));
                await window?.ready();
                return urlService.open(uri, options);
            }
            this.logService.trace('app#handleProtocolUrl(): not handled', uri.toString(true), options);
            return false;
        }
        setupSharedProcess(machineId, sqmId) {
            const sharedProcess = this._register(this.mainInstantiationService.createInstance(sharedProcess_1.SharedProcess, machineId, sqmId));
            const sharedProcessClient = (async () => {
                this.logService.trace('Main->SharedProcess#connect');
                const port = await sharedProcess.connect();
                this.logService.trace('Main->SharedProcess#connect: connection established');
                return new ipc_mp_1.Client(port, 'main');
            })();
            const sharedProcessReady = (async () => {
                await sharedProcess.whenReady();
                return sharedProcessClient;
            })();
            return { sharedProcessReady, sharedProcessClient };
        }
        async initServices(machineId, sqmId, sharedProcessReady) {
            const services = new serviceCollection_1.ServiceCollection();
            // Update
            switch (process.platform) {
                case 'win32':
                    services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_win32_1.Win32UpdateService));
                    break;
                case 'linux':
                    if (platform_1.isLinuxSnap) {
                        services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_snap_1.SnapUpdateService, [process.env['SNAP'], process.env['SNAP_REVISION']]));
                    }
                    else {
                        services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_linux_1.LinuxUpdateService));
                    }
                    break;
                case 'darwin':
                    services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_darwin_1.DarwinUpdateService));
                    break;
            }
            // Windows
            services.set(windows_1.IWindowsMainService, new descriptors_1.SyncDescriptor(windowsMainService_1.WindowsMainService, [machineId, sqmId, this.userEnv], false));
            services.set(auxiliaryWindows_1.IAuxiliaryWindowsMainService, new descriptors_1.SyncDescriptor(auxiliaryWindowsMainService_1.AuxiliaryWindowsMainService, undefined, false));
            // Dialogs
            const dialogMainService = new dialogMainService_1.DialogMainService(this.logService, this.productService);
            services.set(dialogMainService_1.IDialogMainService, dialogMainService);
            // Launch
            services.set(launchMainService_1.ILaunchMainService, new descriptors_1.SyncDescriptor(launchMainService_1.LaunchMainService, undefined, false /* proxied to other processes */));
            // Diagnostics
            services.set(diagnosticsMainService_1.IDiagnosticsMainService, new descriptors_1.SyncDescriptor(diagnosticsMainService_1.DiagnosticsMainService, undefined, false /* proxied to other processes */));
            services.set(diagnostics_1.IDiagnosticsService, ipc_1.ProxyChannel.toService((0, ipc_1.getDelayedChannel)(sharedProcessReady.then(client => client.getChannel('diagnostics')))));
            // Issues
            services.set(issue_1.IIssueMainService, new descriptors_1.SyncDescriptor(issueMainService_1.IssueMainService, [this.userEnv]));
            // Encryption
            services.set(encryptionService_1.IEncryptionMainService, new descriptors_1.SyncDescriptor(encryptionMainService_1.EncryptionMainService));
            // Keyboard Layout
            services.set(keyboardLayoutMainService_1.IKeyboardLayoutMainService, new descriptors_1.SyncDescriptor(keyboardLayoutMainService_1.KeyboardLayoutMainService));
            // Native Host
            services.set(nativeHostMainService_1.INativeHostMainService, new descriptors_1.SyncDescriptor(nativeHostMainService_1.NativeHostMainService, undefined, false /* proxied to other processes */));
            // Webview Manager
            services.set(webviewManagerService_1.IWebviewManagerService, new descriptors_1.SyncDescriptor(webviewMainService_1.WebviewMainService));
            // Menubar
            services.set(menubarMainService_1.IMenubarMainService, new descriptors_1.SyncDescriptor(menubarMainService_1.MenubarMainService));
            // Extension Host Starter
            services.set(extensionHostStarter_1.IExtensionHostStarter, new descriptors_1.SyncDescriptor(extensionHostStarter_2.ExtensionHostStarter));
            // Storage
            services.set(storageMainService_1.IStorageMainService, new descriptors_1.SyncDescriptor(storageMainService_1.StorageMainService));
            services.set(storageMainService_1.IApplicationStorageMainService, new descriptors_1.SyncDescriptor(storageMainService_1.ApplicationStorageMainService));
            // Terminal
            const ptyHostStarter = new electronPtyHostStarter_1.ElectronPtyHostStarter({
                graceTime: 60000 /* LocalReconnectConstants.GraceTime */,
                shortGraceTime: 6000 /* LocalReconnectConstants.ShortGraceTime */,
                scrollback: this.configurationService.getValue("terminal.integrated.persistentSessionScrollback" /* TerminalSettingId.PersistentSessionScrollback */) ?? 100
            }, this.configurationService, this.environmentMainService, this.lifecycleMainService, this.logService);
            const ptyHostService = new ptyHostService_1.PtyHostService(ptyHostStarter, this.configurationService, this.logService, this.loggerService);
            services.set(terminal_1.ILocalPtyService, ptyHostService);
            // External terminal
            if (platform_1.isWindows) {
                services.set(externalTerminal_1.IExternalTerminalMainService, new descriptors_1.SyncDescriptor(externalTerminalService_1.WindowsExternalTerminalService));
            }
            else if (platform_1.isMacintosh) {
                services.set(externalTerminal_1.IExternalTerminalMainService, new descriptors_1.SyncDescriptor(externalTerminalService_1.MacExternalTerminalService));
            }
            else if (platform_1.isLinux) {
                services.set(externalTerminal_1.IExternalTerminalMainService, new descriptors_1.SyncDescriptor(externalTerminalService_1.LinuxExternalTerminalService));
            }
            // Backups
            const backupMainService = new backupMainService_1.BackupMainService(this.environmentMainService, this.configurationService, this.logService, this.stateService);
            services.set(backup_1.IBackupMainService, backupMainService);
            // Workspaces
            const workspacesManagementMainService = new workspacesManagementMainService_1.WorkspacesManagementMainService(this.environmentMainService, this.logService, this.userDataProfilesMainService, backupMainService, dialogMainService);
            services.set(workspacesManagementMainService_1.IWorkspacesManagementMainService, workspacesManagementMainService);
            services.set(workspaces_1.IWorkspacesService, new descriptors_1.SyncDescriptor(workspacesMainService_1.WorkspacesMainService, undefined, false /* proxied to other processes */));
            services.set(workspacesHistoryMainService_1.IWorkspacesHistoryMainService, new descriptors_1.SyncDescriptor(workspacesHistoryMainService_1.WorkspacesHistoryMainService, undefined, false));
            // URL handling
            services.set(url_1.IURLService, new descriptors_1.SyncDescriptor(urlService_1.NativeURLService, undefined, false /* proxied to other processes */));
            // Telemetry
            if ((0, telemetryUtils_1.supportsTelemetry)(this.productService, this.environmentMainService)) {
                const isInternal = (0, telemetryUtils_1.isInternalTelemetry)(this.productService, this.configurationService);
                const channel = (0, ipc_1.getDelayedChannel)(sharedProcessReady.then(client => client.getChannel('telemetryAppender')));
                const appender = new telemetryIpc_1.TelemetryAppenderClient(channel);
                const commonProperties = (0, commonProperties_1.resolveCommonProperties)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, this.productService.commit, this.productService.version, machineId, sqmId, isInternal);
                const piiPaths = (0, telemetryUtils_1.getPiiPathsFromEnvironment)(this.environmentMainService);
                const config = { appenders: [appender], commonProperties, piiPaths, sendErrorTelemetry: true };
                services.set(telemetry_1.ITelemetryService, new descriptors_1.SyncDescriptor(telemetryService_1.TelemetryService, [config], false));
            }
            else {
                services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            }
            // Default Extensions Profile Init
            services.set(extensionsProfileScannerService_1.IExtensionsProfileScannerService, new descriptors_1.SyncDescriptor(extensionsProfileScannerService_2.ExtensionsProfileScannerService, undefined, true));
            services.set(extensionsScannerService_1.IExtensionsScannerService, new descriptors_1.SyncDescriptor(extensionsScannerService_2.ExtensionsScannerService, undefined, true));
            // Utility Process Worker
            services.set(utilityProcessWorkerMainService_1.IUtilityProcessWorkerMainService, new descriptors_1.SyncDescriptor(utilityProcessWorkerMainService_1.UtilityProcessWorkerMainService, undefined, true));
            // Init services that require it
            await async_1.Promises.settled([
                backupMainService.initialize(),
                workspacesManagementMainService.initialize()
            ]);
            return this.mainInstantiationService.createChild(services);
        }
        initChannels(accessor, mainProcessElectronServer, sharedProcessClient) {
            // Channels registered to node.js are exposed to second instances
            // launching because that is the only way the second instance
            // can talk to the first instance. Electron IPC does not work
            // across apps until `requestSingleInstance` APIs are adopted.
            const disposables = this._register(new lifecycle_1.DisposableStore());
            const launchChannel = ipc_1.ProxyChannel.fromService(accessor.get(launchMainService_1.ILaunchMainService), disposables, { disableMarshalling: true });
            this.mainProcessNodeIpcServer.registerChannel('launch', launchChannel);
            const diagnosticsChannel = ipc_1.ProxyChannel.fromService(accessor.get(diagnosticsMainService_1.IDiagnosticsMainService), disposables, { disableMarshalling: true });
            this.mainProcessNodeIpcServer.registerChannel('diagnostics', diagnosticsChannel);
            // Policies (main & shared process)
            const policyChannel = new policyIpc_1.PolicyChannel(accessor.get(policy_1.IPolicyService));
            mainProcessElectronServer.registerChannel('policy', policyChannel);
            sharedProcessClient.then(client => client.registerChannel('policy', policyChannel));
            // Local Files
            const diskFileSystemProvider = this.fileService.getProvider(network_1.Schemas.file);
            (0, types_1.assertType)(diskFileSystemProvider instanceof diskFileSystemProvider_1.DiskFileSystemProvider);
            const fileSystemProviderChannel = new diskFileSystemProviderServer_1.DiskFileSystemProviderChannel(diskFileSystemProvider, this.logService, this.environmentMainService);
            mainProcessElectronServer.registerChannel(diskFileSystemProviderClient_1.LOCAL_FILE_SYSTEM_CHANNEL_NAME, fileSystemProviderChannel);
            sharedProcessClient.then(client => client.registerChannel(diskFileSystemProviderClient_1.LOCAL_FILE_SYSTEM_CHANNEL_NAME, fileSystemProviderChannel));
            // User Data Profiles
            const userDataProfilesService = ipc_1.ProxyChannel.fromService(accessor.get(userDataProfile_1.IUserDataProfilesMainService), disposables);
            mainProcessElectronServer.registerChannel('userDataProfiles', userDataProfilesService);
            sharedProcessClient.then(client => client.registerChannel('userDataProfiles', userDataProfilesService));
            // Request
            const requestService = new requestIpc_1.RequestChannel(accessor.get(request_1.IRequestService));
            sharedProcessClient.then(client => client.registerChannel('request', requestService));
            // Update
            const updateChannel = new updateIpc_1.UpdateChannel(accessor.get(update_1.IUpdateService));
            mainProcessElectronServer.registerChannel('update', updateChannel);
            // Issues
            const issueChannel = ipc_1.ProxyChannel.fromService(accessor.get(issue_1.IIssueMainService), disposables);
            mainProcessElectronServer.registerChannel('issue', issueChannel);
            // Encryption
            const encryptionChannel = ipc_1.ProxyChannel.fromService(accessor.get(encryptionService_1.IEncryptionMainService), disposables);
            mainProcessElectronServer.registerChannel('encryption', encryptionChannel);
            // Signing
            const signChannel = ipc_1.ProxyChannel.fromService(accessor.get(sign_1.ISignService), disposables);
            mainProcessElectronServer.registerChannel('sign', signChannel);
            // Keyboard Layout
            const keyboardLayoutChannel = ipc_1.ProxyChannel.fromService(accessor.get(keyboardLayoutMainService_1.IKeyboardLayoutMainService), disposables);
            mainProcessElectronServer.registerChannel('keyboardLayout', keyboardLayoutChannel);
            // Native host (main & shared process)
            this.nativeHostMainService = accessor.get(nativeHostMainService_1.INativeHostMainService);
            const nativeHostChannel = ipc_1.ProxyChannel.fromService(this.nativeHostMainService, disposables);
            mainProcessElectronServer.registerChannel('nativeHost', nativeHostChannel);
            sharedProcessClient.then(client => client.registerChannel('nativeHost', nativeHostChannel));
            // Workspaces
            const workspacesChannel = ipc_1.ProxyChannel.fromService(accessor.get(workspaces_1.IWorkspacesService), disposables);
            mainProcessElectronServer.registerChannel('workspaces', workspacesChannel);
            // Menubar
            const menubarChannel = ipc_1.ProxyChannel.fromService(accessor.get(menubarMainService_1.IMenubarMainService), disposables);
            mainProcessElectronServer.registerChannel('menubar', menubarChannel);
            // URL handling
            const urlChannel = ipc_1.ProxyChannel.fromService(accessor.get(url_1.IURLService), disposables);
            mainProcessElectronServer.registerChannel('url', urlChannel);
            // Webview Manager
            const webviewChannel = ipc_1.ProxyChannel.fromService(accessor.get(webviewManagerService_1.IWebviewManagerService), disposables);
            mainProcessElectronServer.registerChannel('webview', webviewChannel);
            // Storage (main & shared process)
            const storageChannel = this._register(new storageIpc_1.StorageDatabaseChannel(this.logService, accessor.get(storageMainService_1.IStorageMainService)));
            mainProcessElectronServer.registerChannel('storage', storageChannel);
            sharedProcessClient.then(client => client.registerChannel('storage', storageChannel));
            // Profile Storage Changes Listener (shared process)
            const profileStorageListener = this._register(new userDataProfileStorageIpc_1.ProfileStorageChangesListenerChannel(accessor.get(storageMainService_1.IStorageMainService), accessor.get(userDataProfile_1.IUserDataProfilesMainService), this.logService));
            sharedProcessClient.then(client => client.registerChannel('profileStorageListener', profileStorageListener));
            // Terminal
            const ptyHostChannel = ipc_1.ProxyChannel.fromService(accessor.get(terminal_1.ILocalPtyService), disposables);
            mainProcessElectronServer.registerChannel(terminal_1.TerminalIpcChannels.LocalPty, ptyHostChannel);
            // External Terminal
            const externalTerminalChannel = ipc_1.ProxyChannel.fromService(accessor.get(externalTerminal_1.IExternalTerminalMainService), disposables);
            mainProcessElectronServer.registerChannel('externalTerminal', externalTerminalChannel);
            // Logger
            const loggerChannel = new logIpc_1.LoggerChannel(accessor.get(loggerService_1.ILoggerMainService));
            mainProcessElectronServer.registerChannel('logger', loggerChannel);
            sharedProcessClient.then(client => client.registerChannel('logger', loggerChannel));
            // Extension Host Debug Broadcasting
            const electronExtensionHostDebugBroadcastChannel = new extensionHostDebugIpc_1.ElectronExtensionHostDebugBroadcastChannel(accessor.get(windows_1.IWindowsMainService));
            mainProcessElectronServer.registerChannel('extensionhostdebugservice', electronExtensionHostDebugBroadcastChannel);
            // Extension Host Starter
            const extensionHostStarterChannel = ipc_1.ProxyChannel.fromService(accessor.get(extensionHostStarter_1.IExtensionHostStarter), disposables);
            mainProcessElectronServer.registerChannel(extensionHostStarter_1.ipcExtensionHostStarterChannelName, extensionHostStarterChannel);
            // Utility Process Worker
            const utilityProcessWorkerChannel = ipc_1.ProxyChannel.fromService(accessor.get(utilityProcessWorkerMainService_1.IUtilityProcessWorkerMainService), disposables);
            mainProcessElectronServer.registerChannel(utilityProcessWorkerService_1.ipcUtilityProcessWorkerChannelName, utilityProcessWorkerChannel);
        }
        async openFirstWindow(accessor, initialProtocolUrls) {
            const windowsMainService = this.windowsMainService = accessor.get(windows_1.IWindowsMainService);
            this.auxiliaryWindowsMainService = accessor.get(auxiliaryWindows_1.IAuxiliaryWindowsMainService);
            const context = (0, argvHelper_1.isLaunchedFromCli)(process.env) ? 0 /* OpenContext.CLI */ : 4 /* OpenContext.DESKTOP */;
            const args = this.environmentMainService.args;
            // First check for windows from protocol links to open
            if (initialProtocolUrls) {
                // Openables can open as windows directly
                if (initialProtocolUrls.openables.length > 0) {
                    return windowsMainService.open({
                        context,
                        cli: args,
                        urisToOpen: initialProtocolUrls.openables,
                        gotoLineMode: true,
                        initialStartup: true
                        // remoteAuthority: will be determined based on openables
                    });
                }
                // Protocol links with `windowId=_blank` on startup
                // should be handled in a special way:
                // We take the first one of these and open an empty
                // window for it. This ensures we are not restoring
                // all windows of the previous session.
                // If there are any more URLs like these, they will
                // be handled from the URL listeners installed later.
                if (initialProtocolUrls.urls.length > 0) {
                    for (const protocolUrl of initialProtocolUrls.urls) {
                        const params = new URLSearchParams(protocolUrl.uri.query);
                        if (params.get('windowId') === '_blank') {
                            // It is important here that we remove `windowId=_blank` from
                            // this URL because here we open an empty window for it.
                            params.delete('windowId');
                            protocolUrl.originalUrl = protocolUrl.uri.toString(true);
                            protocolUrl.uri = protocolUrl.uri.with({ query: params.toString() });
                            return windowsMainService.open({
                                context,
                                cli: args,
                                forceNewWindow: true,
                                forceEmpty: true,
                                gotoLineMode: true,
                                initialStartup: true
                                // remoteAuthority: will be determined based on openables
                            });
                        }
                    }
                }
            }
            const macOpenFiles = global.macOpenFiles;
            const hasCliArgs = args._.length;
            const hasFolderURIs = !!args['folder-uri'];
            const hasFileURIs = !!args['file-uri'];
            const noRecentEntry = args['skip-add-to-recently-opened'] === true;
            const waitMarkerFileURI = args.wait && args.waitMarkerFilePath ? uri_1.URI.file(args.waitMarkerFilePath) : undefined;
            const remoteAuthority = args.remote || undefined;
            const forceProfile = args.profile;
            const forceTempProfile = args['profile-temp'];
            // Started without file/folder arguments
            if (!hasCliArgs && !hasFolderURIs && !hasFileURIs) {
                // Force new window
                if (args['new-window'] || forceProfile || forceTempProfile) {
                    return windowsMainService.open({
                        context,
                        cli: args,
                        forceNewWindow: true,
                        forceEmpty: true,
                        noRecentEntry,
                        waitMarkerFileURI,
                        initialStartup: true,
                        remoteAuthority,
                        forceProfile,
                        forceTempProfile
                    });
                }
                // mac: open-file event received on startup
                if (macOpenFiles.length) {
                    return windowsMainService.open({
                        context: 1 /* OpenContext.DOCK */,
                        cli: args,
                        urisToOpen: macOpenFiles.map(path => ((0, workspace_1.hasWorkspaceFileExtension)(path) ? { workspaceUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) })),
                        noRecentEntry,
                        waitMarkerFileURI,
                        initialStartup: true,
                        // remoteAuthority: will be determined based on macOpenFiles
                    });
                }
            }
            // default: read paths from cli
            return windowsMainService.open({
                context,
                cli: args,
                forceNewWindow: args['new-window'] || (!hasCliArgs && args['unity-launch']),
                diffMode: args.diff,
                mergeMode: args.merge,
                noRecentEntry,
                waitMarkerFileURI,
                gotoLineMode: args.goto,
                initialStartup: true,
                remoteAuthority,
                forceProfile,
                forceTempProfile
            });
        }
        afterWindowOpen() {
            // Windows: mutex
            this.installMutex();
            // Remote Authorities
            electron_1.protocol.registerHttpProtocol(network_1.Schemas.vscodeRemoteResource, (request, callback) => {
                callback({
                    url: request.url.replace(/^vscode-remote-resource:/, 'http:'),
                    method: request.method
                });
            });
            // Start to fetch shell environment (if needed) after window has opened
            // Since this operation can take a long time, we want to warm it up while
            // the window is opening.
            // We also show an error to the user in case this fails.
            this.resolveShellEnvironment(this.environmentMainService.args, process.env, true);
            // Crash reporter
            this.updateCrashReporterEnablement();
            if (platform_1.isMacintosh && electron_1.app.runningUnderARM64Translation) {
                this.windowsMainService?.sendToFocused('vscode:showTranslatedBuildWarning');
            }
        }
        async installMutex() {
            const win32MutexName = this.productService.win32MutexName;
            if (platform_1.isWindows && win32MutexName) {
                try {
                    const WindowsMutex = await new Promise((resolve_1, reject_1) => { require(['@vscode/windows-mutex'], resolve_1, reject_1); });
                    const mutex = new WindowsMutex.Mutex(win32MutexName);
                    event_1.Event.once(this.lifecycleMainService.onWillShutdown)(() => mutex.release());
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
        async resolveShellEnvironment(args, env, notifyOnError) {
            try {
                return await (0, shellEnv_1.getResolvedShellEnv)(this.configurationService, this.logService, args, env);
            }
            catch (error) {
                const errorMessage = (0, errorMessage_1.toErrorMessage)(error);
                if (notifyOnError) {
                    this.windowsMainService?.sendToFocused('vscode:showResolveShellEnvError', errorMessage);
                }
                else {
                    this.logService.error(errorMessage);
                }
            }
            return {};
        }
        async updateCrashReporterEnablement() {
            // If enable-crash-reporter argv is undefined then this is a fresh start,
            // based on `telemetry.enableCrashreporter` settings, generate a UUID which
            // will be used as crash reporter id and also update the json file.
            try {
                const argvContent = await this.fileService.readFile(this.environmentMainService.argvResource);
                const argvString = argvContent.value.toString();
                const argvJSON = JSON.parse((0, json_1.stripComments)(argvString));
                const telemetryLevel = (0, telemetryUtils_1.getTelemetryLevel)(this.configurationService);
                const enableCrashReporter = telemetryLevel >= 1 /* TelemetryLevel.CRASH */;
                // Initial startup
                if (argvJSON['enable-crash-reporter'] === undefined) {
                    const additionalArgvContent = [
                        '',
                        '	// Allows to disable crash reporting.',
                        '	// Should restart the app if the value is changed.',
                        `	"enable-crash-reporter": ${enableCrashReporter},`,
                        '',
                        '	// Unique id used for correlating crash reports sent from this instance.',
                        '	// Do not edit this value.',
                        `	"crash-reporter-id": "${(0, uuid_1.generateUuid)()}"`,
                        '}'
                    ];
                    const newArgvString = argvString.substring(0, argvString.length - 2).concat(',\n', additionalArgvContent.join('\n'));
                    await this.fileService.writeFile(this.environmentMainService.argvResource, buffer_1.VSBuffer.fromString(newArgvString));
                }
                // Subsequent startup: update crash reporter value if changed
                else {
                    const newArgvString = argvString.replace(/"enable-crash-reporter": .*,/, `"enable-crash-reporter": ${enableCrashReporter},`);
                    if (newArgvString !== argvString) {
                        await this.fileService.writeFile(this.environmentMainService.argvResource, buffer_1.VSBuffer.fromString(newArgvString));
                    }
                }
            }
            catch (error) {
                this.logService.error(error);
            }
        }
    };
    exports.CodeApplication = CodeApplication;
    exports.CodeApplication = CodeApplication = CodeApplication_1 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, log_1.ILogService),
        __param(4, log_1.ILoggerService),
        __param(5, environmentMainService_1.IEnvironmentMainService),
        __param(6, lifecycleMainService_1.ILifecycleMainService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, state_1.IStateService),
        __param(9, files_1.IFileService),
        __param(10, productService_1.IProductService),
        __param(11, userDataProfile_1.IUserDataProfilesMainService)
    ], CodeApplication);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9jb2RlL2VsZWN0cm9uLW1haW4vYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF3SGhHOzs7T0FHRztJQUNJLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsc0JBQVU7O2lCQUV0Qix3REFBbUQsR0FBRztZQUM3RSxDQUFDLGlCQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsNkNBQXNEO1lBQ3RFLENBQUMsaUJBQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSw4Q0FBdUQ7U0FDL0UsQUFIMEUsQ0FHekU7UUFNRixZQUNrQix3QkFBdUMsRUFDdkMsT0FBNEIsRUFDTCx3QkFBK0MsRUFDekQsVUFBdUIsRUFDcEIsYUFBNkIsRUFDcEIsc0JBQStDLEVBQ2pELG9CQUEyQyxFQUMzQyxvQkFBMkMsRUFDbkQsWUFBMkIsRUFDNUIsV0FBeUIsRUFDdEIsY0FBK0IsRUFDbEIsMkJBQXlEO1lBRXhHLEtBQUssRUFBRSxDQUFDO1lBYlMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUFlO1lBQ3ZDLFlBQU8sR0FBUCxPQUFPLENBQXFCO1lBQ0wsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUF1QjtZQUN6RCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3BCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUNwQiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQ2pELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNuRCxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUN0QixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDbEIsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE4QjtZQUl4RyxJQUFJ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
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
define(["require", "exports", "electron", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "os", "vs/platform/backup/electron-main/backup", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argvHelper", "vs/platform/files/common/files", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/protocol/electron-main/protocol", "vs/platform/externalServices/common/marketplace", "vs/platform/storage/electron-main/storageMainService", "vs/platform/telemetry/common/telemetry", "vs/base/common/themables", "vs/platform/theme/electron-main/themeMainService", "vs/platform/window/common/window", "vs/platform/windows/electron-main/windows", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/window/electron-main/window", "vs/platform/policy/common/policy", "vs/platform/state/node/state", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/log/electron-main/loggerService", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation"], function (require, exports, electron_1, async_1, cancellation_1, errorMessage_1, event_1, lifecycle_1, network_1, performance_1, platform_1, uri_1, nls_1, os_1, backup_1, configuration_1, dialogMainService_1, environmentMainService_1, argvHelper_1, files_1, lifecycleMainService_1, log_1, productService_1, protocol_1, marketplace_1, storageMainService_1, telemetry_1, themables_1, themeMainService_1, window_1, windows_1, workspace_1, workspacesManagementMainService_1, window_2, policy_1, state_1, userDataProfile_1, loggerService_1, arrays_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeWindow = exports.BaseWindow = void 0;
    var ReadyState;
    (function (ReadyState) {
        /**
         * This window has not loaded anything yet
         * and this is the initial state of every
         * window.
         */
        ReadyState[ReadyState["NONE"] = 0] = "NONE";
        /**
         * This window is navigating, either for the
         * first time or subsequent times.
         */
        ReadyState[ReadyState["NAVIGATING"] = 1] = "NAVIGATING";
        /**
         * This window has finished loading and is ready
         * to forward IPC requests to the web contents.
         */
        ReadyState[ReadyState["READY"] = 2] = "READY";
    })(ReadyState || (ReadyState = {}));
    class BaseWindow extends lifecycle_1.Disposable {
        get lastFocusTime() { return this._lastFocusTime; }
        get win() { return this._win; }
        setWin(win) {
            this._win = win;
            // Window Events
            this._register(event_1.Event.fromNodeEventEmitter(win, 'maximize')(() => this._onDidMaximize.fire()));
            this._register(event_1.Event.fromNodeEventEmitter(win, 'unmaximize')(() => this._onDidUnmaximize.fire()));
            this._register(event_1.Event.fromNodeEventEmitter(win, 'closed')(() => {
                this._onDidClose.fire();
                this.dispose();
            }));
            this._register(event_1.Event.fromNodeEventEmitter(win, 'focus')(() => {
                this._lastFocusTime = Date.now();
            }));
            this._register(event_1.Event.fromNodeEventEmitter(this._win, 'enter-full-screen')(() => this._onDidEnterFullScreen.fire()));
            this._register(event_1.Event.fromNodeEventEmitter(this._win, 'leave-full-screen')(() => this._onDidLeaveFullScreen.fire()));
            // Sheet Offsets
            const useCustomTitleStyle = !(0, window_1.hasNativeTitlebar)(this.configurationService);
            if (platform_1.isMacintosh && useCustomTitleStyle) {
                win.setSheetOffset((0, platform_1.isBigSurOrNewer)((0, os_1.release)()) ? 28 : 22); // offset dialogs by the height of the custom title bar if we have any
            }
            // Update the window controls immediately based on cached values
            if (useCustomTitleStyle && ((platform_1.isWindows && (0, window_1.useWindowControlsOverlay)(this.configurationService)) || platform_1.isMacintosh)) {
                const cachedWindowControlHeight = this.stateService.getItem((BaseWindow.windowControlHeightStateStorageKey));
                if (cachedWindowControlHeight) {
                    this.updateWindowControls({ height: cachedWindowControlHeight });
                }
            }
            // Windows Custom System Context Menu
            // See https://github.com/electron/electron/issues/24893
            //
            // The purpose of this is to allow for the context menu in the Windows Title Bar
            //
            // Currently, all mouse events in the title bar are captured by the OS
            // thus we need to capture them here with a window hook specific to Windows
            // and then forward them to the correct window.
            if (platform_1.isWindows && useCustomTitleStyle) {
                const WM_INITMENU = 0x0116; // https://docs.microsoft.com/en-us/windows/win32/menurc/wm-initmenu
                // This sets up a listener for the window hook. This is a Windows-only API provided by electron.
                win.hookWindowMessage(WM_INITMENU, () => {
                    const [x, y] = win.getPosition();
                    const cursorPos = electron_1.screen.getCursorScreenPoint();
                    const cx = cursorPos.x - x;
                    const cy = cursorPos.y - y;
                    // In some cases, show the default system context menu
                    // 1) The mouse position is not within the title bar
                    // 2) The mouse position is within the title bar, but over the app icon
                    // We do not know the exact title bar height but we make an estimate based on window height
                    const shouldTriggerDefaultSystemContextMenu = () => {
                        // Use the custom context menu when over the title bar, but not over the app icon
                        // The app icon is estimated to be 30px wide
                        // The title bar is estimated to be the max of 35px and 15% of the window height
                        if (cx > 30 && cy >= 0 && cy <= Math.max(win.getBounds().height * 0.15, 35)) {
                            return false;
                        }
                        return true;
                    };
                    if (!shouldTriggerDefaultSystemContextMenu()) {
                        // This is necessary to make sure the native system context menu does not show up.
                        win.setEnabled(false);
                        win.setEnabled(true);
                        this._onDidTriggerSystemContextMenu.fire({ x: cx, y: cy });
                    }
                    return 0;
                });
            }
            // Open devtools if instructed from command line args
            if (this.environmentMainService.args['open-devtools'] === true) {
                win.webContents.openDevTools();
            }
        }
        constructor(configurationService, stateService, environmentMainService) {
            super();
            this.configurationService = configurationService;
            this.stateService = stateService;
            this.environmentMainService = environmentMainService;
            //#region Events
            this._onDidClose = this._register(new event_1.Emitter());
            this.onDidClose = this._onDidClose.event;
            this._onDidMaximize = this._register(new event_1.Emitter());
            this.onDidMaximize = this._onDidMaximize.event;
            this._onDidUnmaximize = this._register(new event_1.Emitter());
            this.onDidUnmaximize = this._onDidUnmaximize.event;
            this._onDidTriggerSystemContextMenu = this._register(new event_1.Emitter());
            this.onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
            this._onDidEnterFullScreen = this._register(new event_1.Emitter());
            this.onDidEnterFullScreen = this._onDidEnterFullScreen.event;
            this._onDidLeaveFullScreen = this._register(new event_1.Emitter());
            this.onDidLeaveFullScreen = this._onDidLeaveFullScreen.event;
            this._lastFocusTime = Date.now(); // window is shown on creation so take current time
            this._win = null;
            this.hasWindowControlOverlay = (0, window_1.useWindowControlsOverlay)(this.configurationService);
            //#endregion
            //#region Fullscreen
            // TODO@electron workaround for https://github.com/electron/electron/issues/35360
            // where on macOS the window will report a wrong state for `isFullScreen()` while
            // transitioning into and out of native full screen.
            this.transientIsNativeFullScreen = undefined;
            this.joinNativeFullScreenTransition = undefined;
        }
        setRepresentedFilename(filename) {
            if (platform_1.isMacintosh) {
                this.win?.setRepresentedFilename(filename);
            }
            else {
                this.representedFilename = filename;
            }
        }
        getRepresentedFilename() {
            if (platform_1.isMacintosh) {
                return this.win?.getRepresentedFilename();
            }
            return this.representedFilename;
        }
        setDocumentEdited(edited) {
            if (platform_1.isMacintosh) {
                this.win?.setDocumentEdited(edited);
            }
            this.documentEdited = edited;
        }
        isDocumentEdited() {
            if (platform_1.isMacintosh) {
                return Boolean(this.win?.isDocumentEdited());
            }
            return !!this.documentEdited;
        }
        focus(options) {
            if (platform_1.isMacintosh && options?.force) {
                electron_1.app.focus({ steal: true });
            }
            const win = this.win;
            if (!win) {
                return;
            }
            if (win.isMinimized()) {
                win.restore();
            }
            win.focus();
        }
        handleTitleDoubleClick() {
            const win = this.win;
            if (!win) {
                return;
            }
            // Respect system settings on mac with regards to title click on windows title
            if (platform_1.isMacintosh) {
                const action = electron_1.systemPreferences.getUserDefault('AppleActionOnDoubleClick', 'string');
                switch (action) {
                    case 'Minimize':
                        win.minimize();
                        break;
                    case 'None':
                        break;
                    case 'Maximize':
                    default:
                        if (win.isMaximized()) {
                            win.unmaximize();
                        }
                        else {
                            win.maximize();
                        }
                }
            }
            // Linux/Windows: just toggle maximize/minimized state
            else {
                if (win.isMaximized()) {
                    win.unmaximize();
                }
                else {
                    win.maximize();
                }
            }
        }
        //#region WCO
        static { this.windowControlHeightStateStorageKey = 'windowControlHeight'; }
        updateWindowControls(options) {
            const win = this.win;
            if (!win) {
                return;
            }
            // Cache the height for speeds lookups on startup
            if (options.height) {
                this.stateService.setItem((CodeWindow.windowControlHeightStateStorageKey), options.height);
            }
            // Windows: window control overlay (WCO)
            if (platform_1.isWindows && this.hasWindowControlOverlay) {
                win.setTitleBarOverlay({
                    color: options.backgroundColor?.trim() === '' ? undefined : options.backgroundColor,
                    symbolColor: options.foregroundColor?.trim() === '' ? undefined : options.foregroundColor,
                    height: options.height ? options.height - 1 : undefined // account for window border
                });
            }
            // macOS: traffic lights
            else if (platform_1.isMacintosh && options.height !== undefined) {
                const verticalOffset = (options.height - 15) / 2; // 15px is the height of the traffic lights
                if (!verticalOffset) {
                    win.setWindowButtonPosition(null);
                }
                else {
                    win.setWindowButtonPosition({ x: verticalOffset, y: verticalOffset });
                }
            }
        }
        toggleFullScreen() {
            this.setFullScreen(!this.isFullScreen);
        }
        setFullScreen(fullscreen) {
            // Set fullscreen state
            if ((0, window_1.useNativeFullScreen)(this.configurationService)) {
                this.setNativeFullScreen(fullscreen);
            }
            else {
                this.setSimpleFullScreen(fullscreen);
            }
        }
        get isFullScreen() {
            if (platform_1.isMacintosh && typeof this.transientIsNativeFullScreen === 'boolean') {
                return this.transientIsNativeFullScreen;
            }
            const win = this.win;
            const isFullScreen = win?.isFullScreen();
            const isSimpleFullScreen = win?.isSimpleFullScreen();
            return Boolean(isFullScreen || isSimpleFullScreen);
        }
        setNativeFullScreen(fullscreen) {
            const win = this.win;
            if (win?.isSimpleFullScreen()) {
                win?.setSimpleFullScreen(false);
            }
            this.doSetNativeFullScreen(fullscreen);
        }
        doSetNativeFullScreen(fullscreen) {
            if (platform_1.isMacintosh) {
                this.transientIsNativeFullScreen = fullscreen;
                this.joinNativeFullScreenTransition = new async_1.DeferredPromise();
                Promise.race([
                    this.joinNativeFullScreenTransition.p,
                    // still timeout after some time in case the transition is unusually slow
                    // this can easily happen for an OS update where macOS tries to reopen
                    // previous applications and that can take multiple seconds, probably due
                    // to security checks. its worth noting that if this takes more than
                    // 10 seconds, users would see a window that is not-fullscreen but without
                    // custom titlebar...
                    (0, async_1.timeout)(10000)
                ]).finally(() => {
                    this.transientIsNativeFullScreen = undefined;
                });
            }
            const win = this.win;
            win?.setFullScreen(fullscreen);
        }
        setSimpleFullScreen(fullscreen) {
            const win = this.win;
            if (win?.isFullScreen()) {
                this.doSetNativeFullScreen(false);
            }
            win?.setSimpleFullScreen(fullscreen);
            win?.webContents.focus(); // workaround issue where focus is not going into window
        }
        //#endregion
        dispose() {
            super.dispose();
            this._win = null; // Important to dereference the window object to allow for GC
        }
    }
    exports.BaseWindow = BaseWindow;
    let CodeWindow = class CodeWindow extends BaseWindow {
        get id() { return this._id; }
        get backupPath() { return this._config?.backupPath; }
        get openedWorkspace() { return this._config?.workspace; }
        get profile() {
            if (!this.config) {
                return undefined;
            }
            const profile = this.userDataProfilesService.profiles.find(profile => profile.id === this.config?.profiles.profile.id);
            if (this.isExtensionDevelopmentHost && profile) {
                return profile;
            }
            return this.userDataProfilesService.getProfileForWorkspace(this.config.workspace ?? (0, workspace_1.toWorkspaceIdentifier)(this.backupPath, this.isExtensionDevelopmentHost)) ?? this.userDataProfilesService.defaultProfile;
        }
        get remoteAuthority() { return this._config?.remoteAuthority; }
        get config() { return this._config; }
        get isExtensionDevelopmentHost() { return !!(this._config?.extensionDevelopmentPath); }
        get isExtensionTestHost() { return !!(this._config?.extensionTestsPath); }
        get isExtensionDevelopmentTestFromCli() { return this.isExtensionDevelopmentHost && this.isExtensionTestHost && !this._config?.debugId; }
        constructor(config, logService, loggerMainService, environmentMainService, policyService, userDataProfilesService, fileService, applicationStorageMainService, storageMainService, configurationService, themeMainService, workspacesManagementMainService, backupMainService, telemetryService, dialogMainService, lifecycleMainService, productService, protocolMainService, windowsMainService, stateService, instantiationService) {
            super(configurationService, stateService, environmentMainService);
            this.logService = logService;
            this.loggerMainService = loggerMainService;
            this.policyService = policyService;
            this.userDataProfilesService = userDataProfilesService;
            this.fileService = fileService;
            this.applicationStorageMainService = applicationStorageMainService;
            this.storageMainService = storageMainService;
            this.themeMainService = themeMainService;
            this.workspacesManagementMainService = workspacesManagementMainService;
            this.backupMainService = backupMainService;
            this.telemetryService = telemetryService;
            this.dialogMainService = dialogMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.productService = productService;
            this.protocolMainService = protocolMainService;
            this.windowsMainService = windowsMainService;
            //#region Events
            this._onWillLoad = this._register(new event_1.Emitter());
            this.onWillLoad = this._onWillLoad.event;
            this._onDidSignalReady = this._register(new event_1.Emitter());
            this.onDidSignalReady = this._onDidSignalReady.event;
            this._onDidDestroy = this._register(new event_1.Emitter());
            this.onDidDestroy = this._onDidDestroy.event;
            this.whenReadyCallbacks = [];
            this.touchBarGroups = [];
            this.currentHttpProxy = undefined;
            this.currentNoProxy = undefined;
            this.customZoomLevel = undefined;
            this.configObjectUrl = this._register(this.protocolMainService.createIPCObjectUrl());
            this.wasLoaded = false;
            this.readyState = 0 /* ReadyState.NONE */;
            //#region create browser window
            {
                // Load window state
                const [state, hasMultipleDisplays] = this.restoreWindowState(config.state);
                this.windowState = state;
                this.logService.trace('window#ctor: using window state', state);
                // In case we are maximized or fullscreen, only show later
                // after the call to maximize/fullscreen (see below)
                const isFullscreenOrMaximized = (this.windowState.mode === 0 /* WindowMode.Maximized */ || this.windowState.mode === 3 /* WindowMode.Fullscreen */);
                const options = instantiationService.invokeFunction(windows_1.defaultBrowserWindowOptions, this.windowState, {
                    show: !isFullscreenOrMaximized, // reduce flicker by showing later
                    webPreferences: {
                        preload: network_1.FileAccess.asFileUri('vs/base/parts/sandbox/electron-sandbox/preload.js').fsPath,
                        additionalArguments: [`--vscode-window-config=${this.configObjectUrl.resource.toString()}`],
                        v8CacheOptions: this.environmentMainService.useCodeCache ? 'bypassHeatCheck' : 'none',
                    }
                });
                // Create the browser window
                (0, performance_1.mark)('code/willCreateCodeBrowserWindow');
                this._win = new electron_1.BrowserWindow(options);
                (0, performance_1.mark)('code/didCreateCodeBrowserWindow');
                this._id = this._win.id;
                this.setWin(this._win);
                // TODO@electron (Electron 4 regression): when running on multiple displays where the target display
                // to open the window has a larger resolution than the primary display, the window will not size
                // correctly unless we set the bounds again (https://github.com/microsoft/vscode/issues/74872)
                //
                // Extended to cover Windows as well as Mac (https://github.com/microsoft/vscode/issues/146499)
                //
                // However, when running with native tabs with multiple windows we cannot use this workaround
                // because there is a potential that the new window will be added as native tab instead of being
                // a window on its own. In that case calling setBounds() would cause https://github.com/microsoft/vscode/issues/75830
                const windowSettings = this.configurationService.getValue('window');
                const useNativeTabs = platform_1.isMacintosh && windowSettings?.nativeTabs === true;
                if ((platform_1.isMacintosh || platform_1.isWindows) && hasMultipleDisplays && (!useNativeTabs || electron_1.BrowserWindow.getAllWindows().length === 1)) {
                    if ([this.windowState.width, this.windowState.height, this.windowState.x, this.windowState.y].every(value => typeof value === 'number')) {
                        this._win.setBounds({
                            width: this.windowState.width,
                            height: this.windowState.height,
                            x: this.windowState.x,
                            y: this.windowState.y
                        });
                    }
                }
                if (isFullscreenOrMaximized) {
                    (0, performance_1.mark)('code/willMaximizeCodeWindow');
                    // this call may or may not show the window, depends
                    // on the platform: currently on Windows and Linux will
                    // show the window as active. To be on the safe side,
                    // we show the window at the end of this block.
                    this._win.maximize();
                    if (this.windowState.mode === 3 /* WindowMode.Fullscreen */) {
                        this.setFullScreen(true);
                    }
                    // to reduce flicker from the default window size
                    // to maximize or fullscreen, we only show after
                    this._win.show();
                    (0, performance_1.mark)('code/didMaximizeCodeWindow');
                }
                this._lastFocusTime = Date.now(); // since we show directly, we need to set the last focus time too
            }
            //#endregion
            // respect configured menu bar visibility
            this.onConfigurationUpdated();
            // macOS: touch bar support
            this.createTouchBar();
            // Eventing
            this.registerListeners();
        }
        setReady() {
            this.logService.trace(`window#load: window reported ready (id: ${this._id})`);
            this.readyState = 2 /* ReadyState.READY */;
            // inform all waiting promises that we are ready now
            while (this.whenReadyCallbacks.length) {
                this.whenReadyCallbacks.pop()(this);
            }
            // Events
            this._onDidSignalReady.fire();
        }
        ready() {
            return new Promise(resolve => {
                if (this.isReady) {
                    return resolve(this);
                }
                // otherwise keep and call later when we are ready
                this.whenReadyCallbacks.push(resolve);
            });
        }
        get isReady() {
            return this.readyState === 2 /* ReadyState.READY */;
        }
        get whenClosedOrLoaded() {
            return new Promise(resolve => {
                function handle() {
                    closeListener.dispose();
                    loadListener.dispose();
                    resolve();
                }
                const closeListener = this.onDidClose(() => handle());
                const loadListener = this.onWillLoad(() => handle());
            });
        }
        registerListeners() {
            // Window error conditions to handle
            this._win.on('unresponsive', () => this.onWindowError(1 /* WindowError.UNRESPONSIVE */));
            this._win.webContents.on('render-process-gone', (event, details) => this.onWindowError(2 /* WindowError.PROCESS_GONE */, { ...details }));
            this._win.webContents.on('did-fail-load', (event, exitCode, reason) => this.onWindowError(3 /* WindowError.LOAD */, { reason, exitCode }));
            // Prevent windows/iframes from blocking the unload
            // through DOM events. We have our own logic for
            // unloading a window that should not be confused
            // with the DOM way.
            // (https://github.com/microsoft/vscode/issues/122736)
            this._win.webContents.on('will-prevent-unload', event => {
                event.preventDefault();
            });
            // Remember that we loaded
            this._win.webContents.on('did-finish-load', () => {
                // Associate properties from the load request if provided
                if (this.pendingLoadConfig) {
                    this._config = this.pendingLoadConfig;
                    this.pendingLoadConfig = undefined;
                }
            });
            // Window (Un)Maximize
            this._register(this.onDidMaximize(() => {
                if (this._config) {
                    this._config.maximized = true;
                }
            }));
            this._register(this.onDidUnmaximize(() => {
                if (this._config) {
                    this._config.maximized = false;
                }
            }));
            // Window Fullscreen
            this._register(this.onDidEnterFullScreen(() => {
                this.sendWhenReady('vscode:enterFullScreen', cancellation_1.CancellationToken.None);
                this.joinNativeFullScreenTransition?.complete();
                this.joinNativeFullScreenTransition = undefined;
            }));
            this._register(this.onDidLeaveFullScreen(() => {
                this.sendWhenReady('vscode:leaveFullScreen', cancellation_1.CancellationToken.None);
                this.joinNativeFullScreenTransition?.complete();
                this.joinNativeFullScreenTransition = undefined;
            }));
            // Handle configuration changes
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            // Handle Workspace events
            this._register(this.workspacesManagementMainService.onDidDeleteUntitledWorkspace(e => this.onDidDeleteUntitledWorkspace(e)));
            // Inject headers when requests are incoming
            const urls = ['https://marketplace.visualstudio.com/*', 'https://*.vsassets.io/*'];
            this._win.webContents.session.webRequest.onBeforeSendHeaders({ urls }, async (details, cb) => {
                const headers = await this.getMarketplaceHeaders();
                cb({ cancel: false, requestHeaders: Object.assign(details.requestHeaders, headers) });
            });
        }
        getMarketplaceHeaders() {
            if (!this.marketplaceHeadersPromise) {
                this.marketplaceHeadersPromise = (0, marketplace_1.resolveMarketplaceHeaders)(this.productService.version, this.productService, this.environmentMainService, this.configurationService, this.fileService, this.applicationStorageMainService, this.telemetryService);
            }
            return this.marketplaceHeadersPromise;
        }
        async onWindowError(type, details) {
            switch (type) {
                case 2 /* WindowError.PROCESS_GONE */:
                    this.logService.error(`CodeWindow: renderer process gone (reason: ${details?.reason || '<unknown>'}, code: ${details?.exitCode || '<unknown>'})`);
                    break;
                case 1 /* WindowError.UNRESPONSIVE */:
                    this.logService.error('CodeWindow: detected unresponsive');
                    break;
                case 3 /* WindowError.LOAD */:
                    this.logService.error(`CodeWindow: failed to load (reason: ${details?.reason || '<unknown>'}, code: ${details?.exitCode || '<unknown>'})`);
                    break;
            }
            this.telemetryService.publicLog2('windowerror', {
                type,
                reason: details?.reason,
                code: details?.exitCode
            });
            // Inform User if non-recoverable
            switch (type) {
                case 1 /* WindowError.UNRESPONSIVE */:
                case 2 /* WindowError.PROCESS_GONE */:
                    // If we run extension tests from CLI, we want to signal
                    // back this state to the test runner by exiting with a
                    // non-zero exit code.
                    if (this.isExtensionDevelopmentTestFromCli) {
                        this.lifecycleMainService.kill(1);
                        return;
                    }
                    // If we run smoke tests, want to proceed with an orderly
                    // shutdown as much as possible by destroying the window
                    // and then calling the normal `quit` routine.
                    if (this.environmentMainService.args['enable-smoke-test-driver']) {
                        await this.destroyWindow(false, false);
                        this.lifecycleMainService.quit(); // still allow for an orderly shutdown
                        return;
                    }
                    // Unresponsive
                    if (type === 1 /* WindowError.UNRESPONSIVE */) {
                        if (this.isExtensionDevelopmentHost || this.isExtensionTestHost || (this._win && this._win.webContents && this._win.webContents.isDevToolsOpened())) {
                            // TODO@electron Workaround for https://github.com/microsoft/vscode/issues/56994
                            // In certain cases the window can report unresponsiveness because a breakpoint was hit
                            // and the process is stopped executing. The most typical cases are:
                            // - devtools are opened and debugging happens
                            // - window is an extensions development host that is being debugged
                            // - window is an extension test development host that is being debugged
                            return;
                        }
                        // Show Dialog
                        const { response, checkboxChecked } = await this.dialogMainService.showMessageBox({
                            type: 'warning',
                            buttons: [
                                (0, nls_1.localize)({ key: 'reopen', comment: ['&& denotes a mnemonic'] }, "&&Reopen"),
                                (0, nls_1.localize)({ key: 'close', comment: ['&& denotes a mnemonic'] }, "&&Close"),
                                (0, nls_1.localize)({ key: 'wait', comment: ['&& denotes a mnemonic'] }, "&&Keep Waiting")
                            ],
                            message: (0, nls_1.localize)('appStalled', "The window is not responding"),
                            detail: (0, nls_1.localize)('appStalledDetail', "You can reopen or close the window or keep waiting."),
                            checkboxLabel: this._config?.workspace ? (0, nls_1.localize)('doNotRestoreEditors', "Don't restore editors") : undefined
                        }, this._win);
                        // Handle choice
                        if (response !== 2 /* keep waiting */) {
                            const reopen = response === 0;
                            await this.destroyWindow(reopen, checkboxChecked);
                        }
                    }
                    // Process gone
                    else if (type === 2 /* WindowError.PROCESS_GONE */) {
                        let message;
                        if (!details) {
                            message = (0, nls_1.localize)('appGone', "The window terminated unexpectedly");
                        }
                        else {
                            message = (0, nls_1.localize)('appGoneDetails', "The window terminated unexpectedly (reason: '{0}', code: '{1}')", details.reason, details.exitCode ?? '<unknown>');
                        }
                        // Show Dialog
                        const { response, checkboxChecked } = await this.dialogMainService.showMessageBox({
                            type: 'warning',
                            buttons: [
                                this._config?.workspace ? (0, nls_1.localize)({ key: 'reopen', comment: ['&& denotes a mnemonic'] }, "&&Reopen") : (0, nls_1.localize)({ key: 'newWindow', comment: ['&& denotes a mnemonic'] }, "&&New Window"),
                                (0, nls_1.localize)({ key: 'close', comment: ['&& denotes a mnemonic'] }, "&&Close")
                            ],
                            message,
                            detail: this._config?.workspace ?
                                (0, nls_1.localize)('appGoneDetailWorkspace', "We are sorry for the inconvenience. You can reopen the window to continue where you left off.") :
                                (0, nls_1.localize)('appGoneDetailEmptyWindow', "We are sorry for the inconvenience. You can open a new empty window to start again."),
                            checkboxLabel: this._config?.workspace ? (0, nls_1.localize)('doNotRestoreEditors', "Don't restore editors") : undefined
                        }, this._win);
                        // Handle choice
                        const reopen = response === 0;
                        await this.destroyWindow(reopen, checkboxChecked);
                    }
                    break;
            }
        }
        async destroyWindow(reopen, skipRestoreEditors) {
            const workspace = this._config?.workspace;
            // check to discard editor state first
            if (skipRestoreEditors && workspace) {
                try {
                    const workspaceStorage = this.storageMainService.workspaceStorage(workspace);
                    await workspaceStorage.init();
                    workspaceStorage.delete('memento/workbench.parts.editor');
                    await workspaceStorage.close();
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            // 'close' event will not be fired on destroy(), so signal crash via explicit event
            this._onDidDestroy.fire();
            try {
                // ask the windows service to open a new fresh window if specified
                if (reopen && this._config) {
                    // We have to reconstruct a openable from the current workspace
                    let uriToOpen = undefined;
                    let forceEmpty = undefined;
                    if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspace)) {
                        uriToOpen = { folderUri: workspace.uri };
                    }
                    else if ((0, workspace_1.isWorkspaceIdentifier)(workspace)) {
                        uriToOpen = { workspaceUri: workspace.configPath };
                    }
                    else {
                        forceEmpty = true;
                    }
                    // Delegate to windows service
                    const window = (0, arrays_1.firstOrDefault)(await this.windowsMainService.open({
                        context: 5 /* OpenContext.API */,
                        userEnv: this._config.userEnv,
                        cli: {
                            ...this.environmentMainService.args,
                            _: [] // we pass in the workspace to open explicitly via `urisToOpen`
                        },
                        urisToOpen: uriToOpen ? [uriToOpen] : undefined,
                        forceEmpty,
                        forceNewWindow: true,
                        remoteAuthority: this.remoteAuthority
                    }));
                    window?.focus();
                }
            }
            finally {
                // make sure to destroy the window as its renderer process is gone. do this
                // after the code for reopening the window, to prevent the entire application
                // from quitting when the last window closes as a result.
                this._win?.destroy();
            }
        }
        onDidDeleteUntitledWorkspace(workspace) {
            // Make sure to update our workspace config if we detect that it
            // was deleted
            if (this._config?.workspace?.id === workspace.id) {
                this._config.workspace = undefined;
            }
        }
        onConfigurationUpdated(e) {
            // Menubar
            if (!e || e.affectsConfiguration('window.menuBarVisibility')) {
                const newMenuBarVisibility = this.getMenuBarVisibility();
                if (newMenuBarVisibility !== this.currentMenuBarVisibility) {
                    this.currentMenuBarVisibility = newMenuBarVisibility;
                    this.setMenuBarVisibility(newMenuBarVisibility);
                }
            }
            // Proxy
            if (!e || e.affectsConfiguration('http.proxy')) {
                let newHttpProxy = (this.configurationService.getValue('http.proxy') || '').trim()
                    || (process.env['https_proxy'] || process.env['HTTPS_PROXY'] || process.env['http_proxy'] || process.env['HTTP_PROXY'] || '').trim() // Not standardized.
                    || undefined;
                if (newHttpProxy?.endsWith('/')) {
                    newHttpProxy = newHttpProxy.substr(0, newHttpProxy.length - 1);
                }
                const newNoProxy = (process.env['no_proxy'] || process.env['NO_PROXY'] || '').trim() || undefined; // Not standardized.
                if ((newHttpProxy || '').indexOf('@') === -1 && (newHttpProxy !== this.currentHttpProxy || newNoProxy !== this.currentNoProxy)) {
                    this.currentHttpProxy = newHttpProxy;
                    this.currentNoProxy = newNoProxy;
                    const proxyRules = newHttpProxy || '';
                    const proxyBypassRules = newNoProxy ? `${newNoProxy},<local>` : '<local>';
                    this.logService.trace(`Setting proxy to '${proxyRules}', bypassing '${proxyBypassRules}'`);
                    this._win.webContents.session.setProxy({ proxyRules, proxyBypassRules, pacScript: '' });
                }
            }
        }
        addTabbedWindow(window) {
            if (platform_1.isMacintosh && window.win) {
                this._win.addTabbedWindow(window.win);
            }
        }
        load(configuration, options = Object.create(null)) {
            this.logService.trace(`window#load: attempt to load window (id: ${this._id})`);
            // Clear Document Edited if needed
            if (this.isDocumentEdited()) {
                if (!options.isReload || !this.backupMainService.isHotExitEnabled()) {
                    this.setDocumentEdited(false);
                }
            }
            // Clear Title and Filename if needed
            if (!options.isReload) {
                if (this.getRepresentedFilename()) {
                    this.setRepresentedFilename('');
                }
                this._win.setTitle(this.productService.nameLong);
            }
            // Update configuration values based on our window context
            // and set it into the config object URL for usage.
            this.updateConfiguration(configuration, options);
            // If this is the first time the window is loaded, we associate the paths
            // directly with the window because we assume the loading will just work
            if (this.readyState === 0 /* ReadyState.NONE */) {
                this._config = configuration;
            }
            // Otherwise, the window is currently showing a folder and if there is an
            // unload handler preventing the load, we cannot just associate the paths
            // because the loading might be vetoed. Instead we associate it later when
            // the window load event has fired.
            else {
                this.pendingLoadConfig = configuration;
            }
            // Indicate we are navigting now
            this.readyState = 1 /* ReadyState.NAVIGATING */;
            // Load URL
            this._win.loadURL(network_1.FileAccess.asBrowserUri(`vs/code/electron-sandbox/workbench/workbench${this.environmentMainService.isBuilt ? '' : '-dev'}.html`).toString(true));
            // Remember that we did load
            const wasLoaded = this.wasLoaded;
            this.wasLoaded = true;
            // Make window visible if it did not open in N seconds because this indicates an error
            // Only do this when running out of sources and not when running tests
            if (!this.environmentMainService.isBuilt && !this.environmentMainService.extensionTestsLocationURI) {
                this._register(new async_1.RunOnceScheduler(() => {
                    if (this._win && !this._win.isVisible() && !this._win.isMinimized()) {
                        this._win.show();
                        this.focus({ force: true });
                        this._win.webContents.openDevTools();
                    }
                }, 10000)).schedule();
            }
            // Event
            this._onWillLoad.fire({ workspace: configuration.workspace, reason: options.isReload ? 3 /* LoadReason.RELOAD */ : wasLoaded ? 2 /* LoadReason.LOAD */ : 1 /* LoadReason.INITIAL */ });
        }
        updateConfiguration(configuration, options) {
            // If this window was loaded before from the command line
            // (as indicated by VSCODE_CLI environment), make sure to
            // preserve that user environment in subsequent loads,
            // unless the new configuration context was also a CLI
            // (for https://github.com/microsoft/vscode/issues/108571)
            // Also, preserve the environment if we're loading from an
            // extension development host that had its environment set
            // (for https://github.com/microsoft/vscode/issues/123508)
            const currentUserEnv = (this._config ?? this.pendingLoadConfig)?.userEnv;
            if (currentUserEnv) {
                const shouldPreserveLaunchCliEnvironment = (0, argvHelper_1.isLaunchedFromCli)(currentUserEnv) && !(0, argvHelper_1.isLaunchedFromCli)(configuration.userEnv);
                const shouldPreserveDebugEnvironmnet = this.isExtensionDevelopmentHost;
                if (shouldPreserveLaunchCliEnvironment || shouldPreserveDebugEnvironmnet) {
                    configuration.userEnv = { ...currentUserEnv, ...configuration.userEnv }; // still allow to override certain environment as passed in
                }
            }
            // If named pipe was instantiated for the crashpad_handler process, reuse the same
            // pipe for new app instances connecting to the original app instance.
            // Ref: https://github.com/microsoft/vscode/issues/115874
            if (process.env['CHROME_CRASHPAD_PIPE_NAME']) {
                Object.assign(configuration.userEnv, {
                    CHROME_CRASHPAD_PIPE_NAME: process.env['CHROME_CRASHPAD_PIPE_NAME']
                });
            }
            // Add disable-extensions to the config, but do not preserve it on currentConfig or
            // pendingLoadConfig so that it is applied only on this load
            if (options.disableExtensions !== undefined) {
                configuration['disable-extensions'] = options.disableExtensions;
            }
            // Update window related properties
            configuration.fullscreen = this.isFullScreen;
            configuration.maximized = this._win.isMaximized();
            configuration.partsSplash = this.themeMainService.getWindowSplash();
            configuration.zoomLevel = this.getZoomLevel();
            configuration.isCustomZoomLevel = typeof this.customZoomLevel === 'number';
            if (configuration.isCustomZoomLevel && configuration.partsSplash) {
                configuration.partsSplash.zoomLevel = configuration.zoomLevel;
            }
            // Update with latest perf marks
            (0, performance_1.mark)('code/willOpenNewWindow');
            configuration.perfMarks = (0, performance_1.getMarks)();
            // Update in config object URL for usage in renderer
            this.configObjectUrl.update(configuration);
        }
        async reload(cli) {
            // Copy our current config for reuse
            const configuration = Object.assign({}, this._config);
            // Validate workspace
            configuration.workspace = await this.validateWorkspaceBeforeReload(configuration);
            // Delete some properties we do not want during reload
            delete configuration.filesToOpenOrCreate;
            delete configuration.filesToDiff;
            delete configuration.filesToMerge;
            delete configuration.filesToWait;
            // Some configuration things get inherited if the window is being reloaded and we are
            // in extension development mode. These options are all development related.
            if (this.isExtensionDevelopmentHost && cli) {
                configuration.verbose = cli.verbose;
                configuration.debugId = cli.debugId;
                configuration.extensionEnvironment = cli.extensionEnvironment;
                configuration['inspect-extensions'] = cli['inspect-extensions'];
                configuration['inspect-brk-extensions'] = cli['inspect-brk-extensions'];
                configuration['extensions-dir'] = cli['extensions-dir'];
            }
            configuration.accessibilitySupport = electron_1.app.isAccessibilitySupportEnabled();
            configuration.isInitialStartup = false; // since this is a reload
            configuration.policiesData = this.policyService.serialize(); // set policies data again
            configuration.continueOn = this.environmentMainService.continueOn;
            configuration.profiles = {
                all: this.userDataProfilesService.profiles,
                profile: this.profile || this.userDataProfilesService.defaultProfile,
                home: this.userDataProfilesService.profilesHome
            };
            configuration.logLevel = this.loggerMainService.getLogLevel();
            configuration.loggers = {
                window: this.loggerMainService.getRegisteredLoggers(this.id),
                global: this.loggerMainService.getRegisteredLoggers()
            };
            // Load config
            this.load(configuration, { isReload: true, disableExtensions: cli?.['disable-extensions'] });
        }
        async validateWorkspaceBeforeReload(configuration) {
            // Multi folder
            if ((0, workspace_1.isWorkspaceIdentifier)(configuration.workspace)) {
                const configPath = configuration.workspace.configPath;
                if (configPath.scheme === network_1.Schemas.file) {
                    const workspaceExists = await this.fileService.exists(configPath);
                    if (!workspaceExists) {
                        return undefined;
                    }
                }
            }
            // Single folder
            else if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(configuration.workspace)) {
                const uri = configuration.workspace.uri;
                if (uri.scheme === network_1.Schemas.file) {
                    const folderExists = await this.fileService.exists(uri);
                    if (!folderExists) {
                        return undefined;
                    }
                }
            }
            // Workspace is valid
            return configuration.workspace;
        }
        serializeWindowState() {
            if (!this._win) {
                return (0, window_2.defaultWindowState)();
            }
            // fullscreen gets special treatment
            if (this.isFullScreen) {
                let display;
                try {
                    display = electron_1.screen.getDisplayMatching(this.getBounds());
                }
                catch (error) {
                    // Electron has weird conditions under which it throws errors
                    // e.g. https://github.com/microsoft/vscode/issues/100334 when
                    // large numbers are passed in
                }
                const defaultState = (0, window_2.defaultWindowState)();
                return {
                    mode: 3 /* WindowMode.Fullscreen */,
                    display: display ? display.id : undefined,
                    // Still carry over window dimensions from previous sessions
                    // if we can compute it in fullscreen state.
                    // does not seem possible in all cases on Linux for example
                    // (https://github.com/microsoft/vscode/issues/58218) so we
                    // fallback to the defaults in that case.
                    width: this.windowState.width || defaultState.width,
                    height: this.windowState.height || defaultState.height,
                    x: this.windowState.x || 0,
                    y: this.windowState.y || 0,
                    zoomLevel: this.customZoomLevel
                };
            }
            const state = Object.create(null);
            let mode;
            // get window mode
            if (!platform_1.isMacintosh && this._win.isMaximized()) {
                mode = 0 /* WindowMode.Maximized */;
            }
            else {
                mode = 1 /* WindowMode.Normal */;
            }
            // we don't want to save minimized state, only maximized or normal
            if (mode === 0 /* WindowMode.Maximized */) {
                state.mode = 0 /* WindowMode.Maximized */;
            }
            else {
                state.mode = 1 /* WindowMode.Normal */;
            }
            // only consider non-minimized window states
            if (mode === 1 /* WindowMode.Normal */ || mode === 0 /* WindowMode.Maximized */) {
                let bounds;
                if (mode === 1 /* WindowMode.Normal */) {
                    bounds = this.getBounds();
                }
                else {
                    bounds = this._win.getNormalBounds(); // make sure to persist the normal bounds when maximized to be able to restore them
                }
                state.x = bounds.x;
                state.y = bounds.y;
                state.width = bounds.width;
                state.height = bounds.height;
            }
            state.zoomLevel = this.customZoomLevel;
            return state;
        }
        restoreWindowState(state) {
            (0, performance_1.mark)('code/willRestoreCodeWindowState');
            let hasMultipleDisplays = false;
            if (state) {
                // Window zoom
                this.customZoomLevel = state.zoomLevel;
                // Window dimensions
                try {
                    const displays = electron_1.screen.getAllDisplays();
                    hasMultipleDisplays = displays.length > 1;
                    state = this.validateWindowState(state, displays);
                }
                catch (err) {
                    this.logService.warn(`Unexpected error validating window state: ${err}\n${err.stack}`); // somehow display API can be picky about the state to validate
                }
            }
            (0, performance_1.mark)('code/didRestoreCodeWindowState');
            return [state || (0, window_2.defaultWindowState)(), hasMultipleDisplays];
        }
        validateWindowState(state, displays) {
            this.logService.trace(`window#validateWindowState: validating window state on ${displays.length} display(s)`, state);
            if (typeof state.x !== 'number' ||
                typeof state.y !== 'number' ||
                typeof state.width !== 'number' ||
                typeof state.height !== 'number') {
                this.logService.trace('window#validateWindowState: unexpected type of state values');
                return undefined;
            }
            if (state.width <= 0 || state.height <= 0) {
                this.logService.trace('window#validateWindowState: unexpected negative values');
                return undefined;
            }
            // Single Monitor: be strict about x/y positioning
            // macOS & Linux: these OS seem to be pretty good in ensuring that a window is never outside of it's bounds.
            // Windows: it is possible to have a window with a size that makes it fall out of the window. our strategy
            //          is to try as much as possible to keep the window in the monitor bounds. we are not as strict as
            //          macOS and Linux and allow the window to exceed the monitor bounds as long as the window is still
            //          some pixels (128) visible on the screen for the user to drag it back.
            if (displays.length === 1) {
                const displayWorkingArea = this.getWorkingArea(displays[0]);
                if (displayWorkingArea) {
                    this.logService.trace('window#validateWindowState: 1 monitor working area', displayWorkingArea);
                    function ensureStateInDisplayWorkingArea() {
                        if (!state || typeof state.x !== 'number' || typeof state.y !== 'number' || !displayWorkingArea) {
                            return;
                        }
                        if (state.x < displayWorkingArea.x) {
                            // prevent window from falling out of the screen to the left
                            state.x = displayWorkingArea.x;
                        }
                        if (state.y < displayWorkingArea.y) {
                            // prevent window from falling out of the screen to the top
                            state.y = displayWorkingArea.y;
                        }
                    }
                    // ensure state is not outside display working area (top, left)
                    ensureStateInDisplayWorkingArea();
                    if (state.width > displayWorkingArea.width) {
                        // prevent window from exceeding display bounds width
                        state.width = displayWorkingArea.width;
                    }
                    if (state.height > displayWorkingArea.height) {
                        // prevent window from exceeding display bounds height
                        state.height = displayWorkingArea.height;
                    }
                    if (state.x > (displayWorkingArea.x + displayWorkingArea.width - 128)) {
                        // prevent window from falling out of the screen to the right with
                        // 128px margin by positioning the window to the far right edge of
                        // the screen
                        state.x = displayWorkingArea.x + displayWorkingArea.width - state.width;
                    }
                    if (state.y > (displayWorkingArea.y + displayWorkingArea.height - 128)) {
                        // prevent window from falling out of the screen to the bottom with
                        // 128px margin by positioning the window to the far bottom edge of
                        // the screen
                        state.y = displayWorkingArea.y + displayWorkingArea.height - state.height;
                    }
                    // again ensure state is not outside display working area
                    // (it may have changed from the previous validation step)
                    ensureStateInDisplayWorkingArea();
                }
                return state;
            }
            // Multi Montior (fullscreen): try to find the previously used display
            if (state.display && state.mode === 3 /* WindowMode.Fullscreen */) {
                const display = displays.find(d => d.id === state.display);
                if (display && typeof display.bounds?.x === 'number' && typeof display.bounds?.y === 'number') {
                    this.logService.trace('window#validateWindowState: restoring fullscreen to previous display');
                    const defaults = (0, window_2.defaultWindowState)(3 /* WindowMode.Fullscreen */); // make sure we have good values when the user restores the window
                    defaults.x = display.bounds.x; // carefull to use displays x/y position so that the window ends up on the correct monitor
                    defaults.y = display.bounds.y;
                    return defaults;
                }
            }
            // Multi Monitor (non-fullscreen): ensure window is within display bounds
            let display;
            let displayWorkingArea;
            try {
                display = electron_1.screen.getDisplayMatching({ x: state.x, y: state.y, width: state.width, height: state.height });
                displayWorkingArea = this.getWorkingArea(display);
            }
            catch (error) {
                // Electron has weird conditions under which it throws errors
                // e.g. https://github.com/microsoft/vscode/issues/100334 when
                // large numbers are passed in
            }
            if (display && // we have a display matching the desired bounds
                displayWorkingArea && // we have valid working area bounds
                state.x + state.width > displayWorkingArea.x && // prevent window from falling out of the screen to the left
                state.y + state.height > displayWorkingArea.y && // prevent window from falling out of the screen to the top
                state.x < displayWorkingArea.x + displayWorkingArea.width && // prevent window from falling out of the screen to the right
                state.y < displayWorkingArea.y + displayWorkingArea.height // prevent window from falling out of the screen to the bottom
            ) {
                this.logService.trace('window#validateWindowState: multi-monitor working area', displayWorkingArea);
                return state;
            }
            return undefined;
        }
        getWorkingArea(display) {
            // Prefer the working area of the display to account for taskbars on the
            // desktop being positioned somewhere (https://github.com/microsoft/vscode/issues/50830).
            //
            // Linux X11 sessions sometimes report wrong display bounds, so we validate
            // the reported sizes are positive.
            if (display.workArea.width > 0 && display.workArea.height > 0) {
                return display.workArea;
            }
            if (display.bounds.width > 0 && display.bounds.height > 0) {
                return display.bounds;
            }
            return undefined;
        }
        getBounds() {
            const [x, y] = this._win.getPosition();
            const [width, height] = this._win.getSize();
            return { x, y, width, height };
        }
        setFullScreen(fullscreen) {
            super.setFullScreen(fullscreen);
            // Events
            this.sendWhenReady(fullscreen ? 'vscode:enterFullScreen' : 'vscode:leaveFullScreen', cancellation_1.CancellationToken.None);
            // Respect configured menu bar visibility or default to toggle if not set
            if (this.currentMenuBarVisibility) {
                this.setMenuBarVisibility(this.currentMenuBarVisibility, false);
            }
        }
        getMenuBarVisibility() {
            let menuBarVisibility = (0, window_1.getMenuBarVisibility)(this.configurationService);
            if (['visible', 'toggle', 'hidden'].indexOf(menuBarVisibility) < 0) {
                menuBarVisibility = 'classic';
            }
            return menuBarVisibility;
        }
        setMenuBarVisibility(visibility, notify = true) {
            if (platform_1.isMacintosh) {
                return; // ignore for macOS platform
            }
            if (visibility === 'toggle') {
                if (notify) {
                    this.send('vscode:showInfoMessage', (0, nls_1.localize)('hiddenMenuBar', "You can still access the menu bar by pressing the Alt-key."));
                }
            }
            if (visibility === 'hidden') {
                // for some weird reason that I have no explanation for, the menu bar is not hiding when calling
                // this without timeout (see https://github.com/microsoft/vscode/issues/19777). there seems to be
                // a timing issue with us opening the first window and the menu bar getting created. somehow the
                // fact that we want to hide the menu without being able to bring it back via Alt key makes Electron
                // still show the menu. Unable to reproduce from a simple Hello World application though...
                setTimeout(() => {
                    this.doSetMenuBarVisibility(visibility);
                });
            }
            else {
                this.doSetMenuBarVisibility(visibility);
            }
        }
        doSetMenuBarVisibility(visibility) {
            const isFullscreen = this.isFullScreen;
            switch (visibility) {
                case ('classic'):
                    this._win.setMenuBarVisibility(!isFullscreen);
                    this._win.autoHideMenuBar = isFullscreen;
                    break;
                case ('visible'):
                    this._win.setMenuBarVisibility(true);
                    this._win.autoHideMenuBar = false;
                    break;
                case ('toggle'):
                    this._win.setMenuBarVisibility(false);
                    this._win.autoHideMenuBar = true;
                    break;
                case ('hidden'):
                    this._win.setMenuBarVisibility(false);
                    this._win.autoHideMenuBar = false;
                    break;
            }
        }
        notifyZoomLevel(zoomLevel) {
            this.customZoomLevel = zoomLevel;
        }
        getZoomLevel() {
            if (typeof this.customZoomLevel === 'number') {
                return this.customZoomLevel;
            }
            const windowSettings = this.configurationService.getValue('window');
            return windowSettings?.zoomLevel;
        }
        close() {
            this._win?.close();
        }
        sendWhenReady(channel, token, ...args) {
            if (this.isReady) {
                this.send(channel, ...args);
            }
            else {
                this.ready().then(() => {
                    if (!token.isCancellationRequested) {
                        this.send(channel, ...args);
                    }
                });
            }
        }
        send(channel, ...args) {
            if (this._win) {
                if (this._win.isDestroyed() || this._win.webContents.isDestroyed()) {
                    this.logService.warn(`Sending IPC message to channel '${channel}' for window that is destroyed`);
                    return;
                }
                try {
                    this._win.webContents.send(channel, ...args);
                }
                catch (error) {
                    this.logService.warn(`Error sending IPC message to channel '${channel}' of window ${this._id}: ${(0, errorMessage_1.toErrorMessage)(error)}`);
                }
            }
        }
        updateTouchBar(groups) {
            if (!platform_1.isMacintosh) {
                return; // only supported on macOS
            }
            // Update segments for all groups. Setting the segments property
            // of the group directly prevents ugly flickering from happening
            this.touchBarGroups.forEach((touchBarGroup, index) => {
                const commands = groups[index];
                touchBarGroup.segments = this.createTouchBarGroupSegments(commands);
            });
        }
        createTouchBar() {
            if (!platform_1.isMacintosh) {
                return; // only supported on macOS
            }
            // To avoid flickering, we try to reuse the touch bar group
            // as much as possible by creating a large number of groups
            // for reusing later.
            for (let i = 0; i < 10; i++) {
                const groupTouchBar = this.createTouchBarGroup();
                this.touchBarGroups.push(groupTouchBar);
            }
            this._win.setTouchBar(new electron_1.TouchBar({ items: this.touchBarGroups }));
        }
        createTouchBarGroup(items = []) {
            // Group Segments
            const segments = this.createTouchBarGroupSegments(items);
            // Group Control
            const control = new electron_1.TouchBar.TouchBarSegmentedControl({
                segments,
                mode: 'buttons',
                segmentStyle: 'automatic',
                change: (selectedIndex) => {
                    this.sendWhenReady('vscode:runAction', cancellation_1.CancellationToken.None, { id: control.segments[selectedIndex].id, from: 'touchbar' });
                }
            });
            return control;
        }
        createTouchBarGroupSegments(items = []) {
            const segments = items.map(item => {
                let icon;
                if (item.icon && !themables_1.ThemeIcon.isThemeIcon(item.icon) && item.icon?.dark?.scheme === network_1.Schemas.file) {
                    icon = electron_1.nativeImage.createFromPath(uri_1.URI.revive(item.icon.dark).fsPath);
                    if (icon.isEmpty()) {
                        icon = undefined;
                    }
                }
                let title;
                if (typeof item.title === 'string') {
                    title = item.title;
                }
                else {
                    title = item.title.value;
                }
                return {
                    id: item.id,
                    label: !icon ? title : undefined,
                    icon
                };
            });
            return segments;
        }
        dispose() {
            super.dispose();
            // Deregister the loggers for this window
            this.loggerMainService.deregisterLoggers(this.id);
        }
    };
    exports.CodeWindow = CodeWindow;
    exports.CodeWindow = CodeWindow = __decorate([
        __param(1, log_1.ILogService),
        __param(2, loggerService_1.ILoggerMainService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, policy_1.IPolicyService),
        __param(5, userDataProfile_1.IUserDataProfilesMainService),
        __param(6, files_1.IFileService),
        __param(7, storageMainService_1.IApplicationStorageMainService),
        __param(8, storageMainService_1.IStorageMainService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, themeMainService_1.IThemeMainService),
        __param(11, workspacesManagementMainService_1.IWorkspacesManagementMainService),
        __param(12, backup_1.IBackupMainService),
        __param(13, telemetry_1.ITelemetryService),
        __param(14, dialogMainService_1.IDialogMainService),
        __param(15, lifecycleMainService_1.ILifecycleMainService),
        __param(16, productService_1.IProductService),
        __param(17, protocol_1.IProtocolMainService),
        __param(18, windows_1.IWindowsMainService),
        __param(19, state_1.IStateService),
        __param(20, instantiation_1.IInstantiationService)
    ], CodeWindow);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93SW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93cy9lbGVjdHJvbi1tYWluL3dpbmRvd0ltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkRoRyxJQUFXLFVBb0JWO0lBcEJELFdBQVcsVUFBVTtRQUVwQjs7OztXQUlHO1FBQ0gsMkNBQUksQ0FBQTtRQUVKOzs7V0FHRztRQUNILHVEQUFVLENBQUE7UUFFVjs7O1dBR0c7UUFDSCw2Q0FBSyxDQUFBO0lBQ04sQ0FBQyxFQXBCVSxVQUFVLEtBQVYsVUFBVSxRQW9CcEI7SUFFRCxNQUFzQixVQUFXLFNBQVEsc0JBQVU7UUEyQmxELElBQUksYUFBYSxLQUFhLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFHM0QsSUFBSSxHQUFHLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsR0FBa0I7WUFDbEMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7WUFFaEIsZ0JBQWdCO1lBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUs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
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
define(["require", "exports", "child_process", "electron", "os", "util", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/extpath", "vs/base/node/id", "vs/base/node/pfs", "vs/base/node/ports", "vs/nls", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/theme/electron-main/themeMainService", "vs/platform/windows/electron-main/windows", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/base/common/buffer", "vs/platform/remote/node/wsl", "vs/platform/profiling/electron-main/windowProfiling", "vs/platform/auxiliaryWindow/electron-main/auxiliaryWindows", "vs/base/common/errors"], function (require, exports, child_process_1, electron_1, os_1, util_1, decorators_1, event_1, lifecycle_1, network_1, path_1, platform_1, uri_1, extpath_1, id_1, pfs_1, ports_1, nls_1, dialogMainService_1, environmentMainService_1, instantiation_1, lifecycleMainService_1, log_1, productService_1, themeMainService_1, windows_1, workspace_1, workspacesManagementMainService_1, buffer_1, wsl_1, windowProfiling_1, auxiliaryWindows_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeHostMainService = exports.INativeHostMainService = void 0;
    exports.INativeHostMainService = (0, instantiation_1.createDecorator)('nativeHostMainService');
    let NativeHostMainService = class NativeHostMainService extends lifecycle_1.Disposable {
        constructor(windowsMainService, auxiliaryWindowsMainService, dialogMainService, lifecycleMainService, environmentMainService, logService, productService, themeMainService, workspacesManagementMainService, instantiationService) {
            super();
            this.windowsMainService = windowsMainService;
            this.auxiliaryWindowsMainService = auxiliaryWindowsMainService;
            this.dialogMainService = dialogMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.environmentMainService = environmentMainService;
            this.logService = logService;
            this.productService = productService;
            this.themeMainService = themeMainService;
            this.workspacesManagementMainService = workspacesManagementMainService;
            this.instantiationService = instantiationService;
            //#endregion
            //#region Events
            this.onDidOpenMainWindow = event_1.Event.map(this.windowsMainService.onDidOpenWindow, window => window.id);
            this.onDidTriggerWindowSystemContextMenu = event_1.Event.any(event_1.Event.filter(event_1.Event.map(this.windowsMainService.onDidTriggerSystemContextMenu, ({ window, x, y }) => { return { windowId: window.id, x, y }; }), ({ windowId }) => !!this.windowsMainService.getWindowById(windowId)), event_1.Event.filter(event_1.Event.map(this.auxiliaryWindowsMainService.onDidTriggerSystemContextMenu, ({ window, x, y }) => { return { windowId: window.id, x, y }; }), ({ windowId }) => !!this.auxiliaryWindowsMainService.getWindowById(windowId)));
            this.onDidMaximizeWindow = event_1.Event.any(event_1.Event.filter(event_1.Event.map(this.windowsMainService.onDidMaximizeWindow, window => window.id), windowId => !!this.windowsMainService.getWindowById(windowId)), event_1.Event.filter(event_1.Event.map(this.auxiliaryWindowsMainService.onDidMaximizeWindow, window => window.id), windowId => !!this.auxiliaryWindowsMainService.getWindowById(windowId)));
            this.onDidUnmaximizeWindow = event_1.Event.any(event_1.Event.filter(event_1.Event.map(this.windowsMainService.onDidUnmaximizeWindow, window => window.id), windowId => !!this.windowsMainService.getWindowById(windowId)), event_1.Event.filter(event_1.Event.map(this.auxiliaryWindowsMainService.onDidUnmaximizeWindow, window => window.id), windowId => !!this.auxiliaryWindowsMainService.getWindowById(windowId)));
            this.onDidChangeWindowFullScreen = event_1.Event.any(event_1.Event.map(this.windowsMainService.onDidChangeFullScreen, e => ({ windowId: e.window.id, fullscreen: e.fullscreen })), event_1.Event.map(this.auxiliaryWindowsMainService.onDidChangeFullScreen, e => ({ windowId: e.window.id, fullscreen: e.fullscreen })));
            this.onDidBlurMainWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-blur', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onDidFocusMainWindow = event_1.Event.any(event_1.Event.map(event_1.Event.filter(event_1.Event.map(this.windowsMainService.onDidChangeWindowsCount, () => this.windowsMainService.getLastActiveWindow()), window => !!window), window => window.id), event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-focus', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId)));
            this.onDidBlurMainOrAuxiliaryWindow = event_1.Event.any(this.onDidBlurMainWindow, event_1.Event.map(event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-blur', (event, window) => window), window => (0, auxiliaryWindows_1.isAuxiliaryWindow)(window.webContents)), window => window.id));
            this.onDidFocusMainOrAuxiliaryWindow = event_1.Event.any(this.onDidFocusMainWindow, event_1.Event.map(event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-focus', (event, window) => window), window => (0, auxiliaryWindows_1.isAuxiliaryWindow)(window.webContents)), window => window.id));
            this.onDidResumeOS = event_1.Event.fromNodeEventEmitter(electron_1.powerMonitor, 'resume');
            this.onDidChangeColorScheme = this.themeMainService.onDidChangeColorScheme;
            this._onDidChangePassword = this._register(new event_1.Emitter());
            this.onDidChangePassword = this._onDidChangePassword.event;
            this.onDidChangeDisplay = event_1.Event.debounce(event_1.Event.any(event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.screen, 'display-metrics-changed', (event, display, changedMetrics) => changedMetrics), changedMetrics => {
                // Electron will emit 'display-metrics-changed' events even when actually
                // going fullscreen, because the dock hides. However, we do not want to
                // react on this event as there is no change in display bounds.
                return !(Array.isArray(changedMetrics) && changedMetrics.length === 1 && changedMetrics[0] === 'workArea');
            }), event_1.Event.fromNodeEventEmitter(electron_1.screen, 'display-added'), event_1.Event.fromNodeEventEmitter(electron_1.screen, 'display-removed')), () => { }, 100);
        }
        //#region Properties
        get windowId() { throw new Error('Not implemented in electron-main'); }
        async getWindows(windowId, options) {
            const mainWindows = this.windowsMainService.getWindows().map(window => ({
                id: window.id,
                workspace: window.openedWorkspace ?? (0, workspace_1.toWorkspaceIdentifier)(window.backupPath, window.isExtensionDevelopmentHost),
                title: window.win?.getTitle() ?? '',
                filename: window.getRepresentedFilename(),
                dirty: window.isDocumentEdited()
            }));
            const auxiliaryWindows = [];
            if (options.includeAuxiliaryWindows) {
                auxiliaryWindows.push(...this.auxiliaryWindowsMainService.getWindows().map(window => ({
                    id: window.id,
                    parentId: window.parentId,
                    title: window.win?.getTitle() ?? '',
                    filename: window.getRepresentedFilename()
                })));
            }
            return [...mainWindows, ...auxiliaryWindows];
        }
        async getWindowCount(windowId) {
            return this.windowsMainService.getWindowCount();
        }
        async getActiveWindowId(windowId) {
            const activeWindow = this.windowsMainService.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
            if (activeWindow) {
                return activeWindow.id;
            }
            return undefined;
        }
        openWindow(windowId, arg1, arg2) {
            if (Array.isArray(arg1)) {
                return this.doOpenWindow(windowId, arg1, arg2);
            }
            return this.doOpenEmptyWindow(windowId, arg1);
        }
        async doOpenWindow(windowId, toOpen, options = Object.create(null)) {
            if (toOpen.length > 0) {
                await this.windowsMainService.open({
                    context: 5 /* OpenContext.API */,
                    contextWindowId: windowId,
                    urisToOpen: toOpen,
                    cli: this.environmentMainService.args,
                    forceNewWindow: options.forceNewWindow,
                    forceReuseWindow: options.forceReuseWindow,
                    preferNewWindow: options.preferNewWindow,
                    diffMode: options.diffMode,
                    mergeMode: options.mergeMode,
                    addMode: options.addMode,
                    gotoLineMode: options.gotoLineMode,
                    noRecentEntry: options.noRecentEntry,
                    waitMarkerFileURI: options.waitMarkerFileURI,
                    remoteAuthority: options.remoteAuthority || undefined,
                    forceProfile: options.forceProfile,
                    forceTempProfile: options.forceTempProfile,
                });
            }
        }
        async doOpenEmptyWindow(windowId, options) {
            await this.windowsMainService.openEmptyWindow({
                context: 5 /* OpenContext.API */,
                contextWindowId: windowId
            }, options);
        }
        async toggleFullScreen(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.toggleFullScreen();
        }
        async handleTitleDoubleClick(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.handleTitleDoubleClick();
        }
        async getCursorScreenPoint(windowId) {
            const point = electron_1.screen.getCursorScreenPoint();
            const display = electron_1.screen.getDisplayNearestPoint(point);
            return { point, display: display.bounds };
        }
        async isMaximized(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            return window?.win?.isMaximized() ?? false;
        }
        async maximizeWindow(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.win?.maximize();
        }
        async unmaximizeWindow(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.win?.unmaximize();
        }
        async minimizeWindow(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.win?.minimize();
        }
        async moveWindowTop(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.win?.moveTop();
        }
        async positionWindow(windowId, position, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            if (window?.win) {
                if (window.win.isFullScreen()) {
                    const fullscreenLeftFuture = event_1.Event.toPromise(event_1.Event.once(event_1.Event.fromNodeEventEmitter(window.win, 'leave-full-screen')));
                    window.win.setFullScreen(false);
                    await fullscreenLeftFuture;
                }
                window.win.setBounds(position);
            }
        }
        async updateWindowControls(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.updateWindowControls(options);
        }
        async focusWindow(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.focus({ force: options?.force ?? false });
        }
        async setMinimumSize(windowId, width, height) {
            const window = this.codeWindowById(windowId);
            if (window?.win) {
                const [windowWidth, windowHeight] = window.win.getSize();
                const [minWindowWidth, minWindowHeight] = window.win.getMinimumSize();
                const [newMinWindowWidth, newMinWindowHeight] = [width ?? minWindowWidth, height ?? minWindowHeight];
                const [newWindowWidth, newWindowHeight] = [Math.max(windowWidth, newMinWindowWidth), Math.max(windowHeight, newMinWindowHeight)];
                if (minWindowWidth !== newMinWindowWidth || minWindowHeight !== newMinWindowHeight) {
                    window.win.setMinimumSize(newMinWindowWidth, newMinWindowHeight);
                }
                if (windowWidth !== newWindowWidth || windowHeight !== newWindowHeight) {
                    window.win.setSize(newWindowWidth, newWindowHeight);
                }
            }
        }
        async saveWindowSplash(windowId, splash) {
            this.themeMainService.saveWindowSplash(windowId, splash);
        }
        //#endregion
        //#region macOS Shell Command
        async installShellCommand(windowId) {
            const { source, target } = await this.getShellCommandLink();
            // Only install unless already existing
            try {
                const { symbolicLink } = await pfs_1.SymlinkSupport.stat(source);
                if (symbolicLink && !symbolicLink.dangling) {
                    const linkTargetRealPath = await (0, extpath_1.realpath)(source);
                    if (target === linkTargetRealPath) {
                        return;
                    }
                }
                // Different source, delete it first
                await pfs_1.Promises.unlink(source);
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error; // throw on any error but file not found
                }
            }
            try {
                await pfs_1.Promises.symlink(target, source);
            }
            catch (error) {
                if (error.code !== 'EACCES' && error.code !== 'ENOENT') {
                    throw error;
                }
                const { response } = await this.showMessageBox(windowId, {
                    type: 'info',
                    message: (0, nls_1.localize)('warnEscalation', "{0} will now prompt with 'osascript' for Administrator privileges to install the shell command.", this.productService.nameShort),
                    buttons: [
                        (0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                        (0, nls_1.localize)('cancel', "Cancel")
                    ]
                });
                if (response === 1 /* Cancel */) {
                    throw new errors_1.CancellationError();
                }
                try {
                    const command = `osascript -e "do shell script \\"mkdir -p /usr/local/bin && ln -sf \'${target}\' \'${source}\'\\" with administrator privileges"`;
                    await (0, util_1.promisify)(child_process_1.exec)(command);
                }
                catch (error) {
                    throw new Error((0, nls_1.localize)('cantCreateBinFolder', "Unable to install the shell command '{0}'.", source));
                }
            }
        }
        async uninstallShellCommand(windowId) {
            const { source } = await this.getShellCommandLink();
            try {
                await pfs_1.Promises.unlink(source);
            }
            catch (error) {
                switch (error.code) {
                    case 'EACCES': {
                        const { response } = await this.showMessageBox(windowId, {
                            type: 'info',
                            message: (0, nls_1.localize)('warnEscalationUninstall', "{0} will now prompt with 'osascript' for Administrator privileges to uninstall the shell command.", this.productService.nameShort),
                            buttons: [
                                (0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                                (0, nls_1.localize)('cancel', "Cancel")
                            ]
                        });
                        if (response === 1 /* Cancel */) {
                            throw new errors_1.CancellationError();
                        }
                        try {
                            const command = `osascript -e "do shell script \\"rm \'${source}\'\\" with administrator privileges"`;
                            await (0, util_1.promisify)(child_process_1.exec)(command);
                        }
                        catch (error) {
                            throw new Error((0, nls_1.localize)('cantUninstall', "Unable to uninstall the shell command '{0}'.", source));
                        }
                        break;
                    }
                    case 'ENOENT':
                        break; // ignore file not found
                    default:
                        throw error;
                }
            }
        }
        async getShellCommandLink() {
            const target = (0, path_1.resolve)(this.environmentMainService.appRoot, 'bin', 'code');
            const source = `/usr/local/bin/${this.productService.applicationName}`;
            // Ensure source exists
            const sourceExists = await pfs_1.Promises.exists(target);
            if (!sourceExists) {
                throw new Error((0, nls_1.localize)('sourceMissing', "Unable to find shell script in '{0}'", target));
            }
            return { source, target };
        }
        //#endregion
        //#region Dialog
        async showMessageBox(windowId, options) {
            const window = this.getTargetWindow(windowId);
            return this.dialogMainService.showMessageBox(options, window?.win ?? undefined);
        }
        async showSaveDialog(windowId, options) {
            const window = this.getTargetWindow(windowId);
            return this.dialogMainService.showSaveDialog(options, window?.win ?? undefined);
        }
        async showOpenDialog(windowId, options) {
            const window = this.getTargetWindow(windowId);
            return this.dialogMainService.showOpenDialog(options, window?.win ?? undefined);
        }
        async pickFileFolderAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickFileFolder(options);
            if (paths) {
                await this.doOpenPicked(await Promise.all(paths.map(async (path) => (await pfs_1.SymlinkSupport.existsDirectory(path)) ? { folderUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickFolderAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickFolder(options);
            if (paths) {
                await this.doOpenPicked(paths.map(path => ({ folderUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickFileAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickFile(options);
            if (paths) {
                await this.doOpenPicked(paths.map(path => ({ fileUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickWorkspaceAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickWorkspace(options);
            if (paths) {
                await this.doOpenPicked(paths.map(path => ({ workspaceUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async doOpenPicked(openable, options, windowId) {
            await this.windowsMainService.open({
                context: 3 /* OpenContext.DIALOG */,
                contextWindowId: windowId,
                cli: this.environmentMainService.args,
                urisToOpen: openable,
                forceNewWindow: options.forceNewWindow,
                /* remoteAuthority will be determined based on openable */
            });
        }
        //#endregion
        //#region OS
        async showItemInFolder(windowId, path) {
            electron_1.shell.showItemInFolder(path);
        }
        async setRepresentedFilename(windowId, path, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.setRepresentedFilename(path);
        }
        async setDocumentEdited(windowId, edited, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            window?.setDocumentEdited(edited);
        }
        async openExternal(windowId, url) {
            this.environmentMainService.unsetSnapExportedVariables();
            electron_1.shell.openExternal(url);
            this.environmentMainService.restoreSnapExportedVariables();
            return true;
        }
        moveItemToTrash(windowId, fullPath) {
            return electron_1.shell.trashItem(fullPath);
        }
        async isAdmin() {
            let isAdmin;
            if (platform_1.isWindows) {
                isAdmin = (await new Promise((resolve_1, reject_1) => { require(['native-is-elevated'], resolve_1, reject_1); }))();
            }
            else {
                isAdmin = process.getuid?.() === 0;
            }
            return isAdmin;
        }
        async writeElevated(windowId, source, target, options) {
            const sudoPrompt = await new Promise((resolve_2, reject_2) => { require(['@vscode/sudo-prompt'], resolve_2, reject_2); });
            return new Promise((resolve, reject) => {
                const sudoCommand = [`"${this.cliPath}"`];
                if (options?.unlock) {
                    sudoCommand.push('--file-chmod');
                }
                sudoCommand.push('--file-write', `"${source.fsPath}"`, `"${target.fsPath}"`);
                const promptOptions = {
                    name: this.productService.nameLong.replace('-', ''),
                    icns: (platform_1.isMacintosh && this.environmentMainService.isBuilt) ? (0, path_1.join)((0, path_1.dirname)(this.environmentMainService.appRoot), `${this.productService.nameShort}.icns`) : undefined
                };
                sudoPrompt.exec(sudoCommand.join(' '), promptOptions, (error, stdout, stderr) => {
                    if (stdout) {
                        this.logService.trace(`[sudo-prompt] received stdout: ${stdout}`);
                    }
                    if (stderr) {
                        this.logService.trace(`[sudo-prompt] received stderr: ${stderr}`);
                    }
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        }
        async isRunningUnderARM64Translation() {
            if (platform_1.isLinux || platform_1.isWindows) {
                return false;
            }
            return electron_1.app.runningUnderARM64Translation;
        }
        get cliPath() {
            // Windows
            if (platform_1.isWindows) {
                if (this.environmentMainService.isBuilt) {
                    return (0, path_1.join)((0, path_1.dirname)(process.execPath), 'bin', `${this.productService.applicationName}.cmd`);
                }
                return (0, path_1.join)(this.environmentMainService.appRoot, 'scripts', 'code-cli.bat');
            }
            // Linux
            if (platform_1.isLinux) {
                if (this.environmentMainService.isBuilt) {
                    return (0, path_1.join)((0, path_1.dirname)(process.execPath), 'bin', `${this.productService.applicationName}`);
                }
                return (0, path_1.join)(this.environmentMainService.appRoot, 'scripts', 'code-cli.sh');
            }
            // macOS
            if (this.environmentMainService.isBuilt) {
                return (0, path_1.join)(this.environmentMainService.appRoot, 'bin', 'code');
            }
            return (0, path_1.join)(this.environmentMainService.appRoot, 'scripts', 'code-cli.sh');
        }
        async getOSStatistics() {
            return {
                totalmem: (0, os_1.totalmem)(),
                freemem: (0, os_1.freemem)(),
                loadavg: (0, os_1.loadavg)()
            };
        }
        async getOSProperties() {
            return {
                arch: (0, os_1.arch)(),
                platform: (0, os_1.platform)(),
                release: (0, os_1.release)(),
                type: (0, os_1.type)(),
                cpus: (0, os_1.cpus)()
            };
        }
        async getOSVirtualMachineHint() {
            return id_1.virtualMachineHint.value();
        }
        async getOSColorScheme() {
            return this.themeMainService.getColorScheme();
        }
        // WSL
        async hasWSLFeatureInstalled() {
            return platform_1.isWindows && (0, wsl_1.hasWSLFeatureInstalled)();
        }
        //#endregion
        //#region Process
        async killProcess(windowId, pid, code) {
            process.kill(pid, code);
        }
        //#endregion
        //#region Clipboard
        async readClipboardText(windowId, type) {
            return electron_1.clipboard.readText(type);
        }
        async writeClipboardText(windowId, text, type) {
            return electron_1.clipboard.writeText(text, type);
        }
        async readClipboardFindText(windowId) {
            return electron_1.clipboard.readFindText();
        }
        async writeClipboardFindText(windowId, text) {
            return electron_1.clipboard.writeFindText(text);
        }
        async writeClipboardBuffer(windowId, format, buffer, type) {
            return electron_1.clipboard.writeBuffer(format, Buffer.from(buffer.buffer), type);
        }
        async readClipboardBuffer(windowId, format) {
            return buffer_1.VSBuffer.wrap(electron_1.clipboard.readBuffer(format));
        }
        async hasClipboard(windowId, format, type) {
            return electron_1.clipboard.has(format, type);
        }
        //#endregion
        //#region macOS Touchbar
        async newWindowTab() {
            await this.windowsMainService.open({
                context: 5 /* OpenContext.API */,
                cli: this.environmentMainService.args,
                forceNewTabbedWindow: true,
                forceEmpty: true,
                remoteAuthority: this.environmentMainService.args.remote || undefined
            });
        }
        async showPreviousWindowTab() {
            electron_1.Menu.sendActionToFirstResponder('selectPreviousTab:');
        }
        async showNextWindowTab() {
            electron_1.Menu.sendActionToFirstResponder('selectNextTab:');
        }
        async moveWindowTabToNewWindow() {
            electron_1.Menu.sendActionToFirstResponder('moveTabToNewWindow:');
        }
        async mergeAllWindowTabs() {
            electron_1.Menu.sendActionToFirstResponder('mergeAllWindows:');
        }
        async toggleWindowTabsBar() {
            electron_1.Menu.sendActionToFirstResponder('toggleTabBar:');
        }
        async updateTouchBar(windowId, items) {
            const window = this.codeWindowById(windowId);
            window?.updateTouchBar(items);
        }
        //#endregion
        //#region Lifecycle
        async notifyReady(windowId) {
            const window = this.codeWindowById(windowId);
            window?.setReady();
        }
        async relaunch(windowId, options) {
            return this.lifecycleMainService.relaunch(options);
        }
        async reload(windowId, options) {
            const window = this.codeWindowById(windowId);
            if (window) {
                // Special case: support `transient` workspaces by preventing
                // the reload and rather go back to an empty window. Transient
                // workspaces should never restore, even when the user wants
                // to reload.
                // For: https://github.com/microsoft/vscode/issues/119695
                if ((0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace)) {
                    const configPath = window.openedWorkspace.configPath;
                    if (configPath.scheme === network_1.Schemas.file) {
                        const workspace = await this.workspacesManagementMainService.resolveLocalWorkspace(configPath);
                        if (workspace?.transient) {
                            return this.openWindow(window.id, { forceReuseWindow: true });
                        }
                    }
                }
                // Proceed normally to reload the window
                return this.lifecycleMainService.reload(window, options?.disableExtensions !== undefined ? { _: [], 'disable-extensions': options.disableExtensions } : undefined);
            }
        }
        async closeWindow(windowId, options) {
            const window = this.windowById(options?.targetWindowId, windowId);
            return window?.win?.close();
        }
        async quit(windowId) {
            // If the user selected to exit from an extension development host window, do not quit, but just
            // close the window unless this is the last window that is opened.
            const window = this.windowsMainService.getLastActiveWindow();
            if (window?.isExtensionDevelopmentHost && this.windowsMainService.getWindowCount() > 1 && window.win) {
                window.win.close();
            }
            // Otherwise: normal quit
            else {
                this.lifecycleMainService.quit();
            }
        }
        async exit(windowId, code) {
            await this.lifecycleMainService.kill(code);
        }
        //#endregion
        //#region Connectivity
        async resolveProxy(windowId, url) {
            const window = this.codeWindowById(windowId);
            const session = window?.win?.webContents?.session;
            return session?.resolveProxy(url);
        }
        async loadCertificates(_windowId) {
            const proxyAgent = await new Promise((resolve_3, reject_3) => { require(['@vscode/proxy-agent'], resolve_3, reject_3); });
            return proxyAgent.loadSystemCertificates({ log: this.logService });
        }
        findFreePort(windowId, startPort, giveUpAfter, timeout, stride = 1) {
            return (0, ports_1.findFreePort)(startPort, giveUpAfter, timeout, stride);
        }
        //#endregion
        //#region Development
        async openDevTools(windowId, options) {
            const window = this.getTargetWindow(windowId);
            window?.win?.webContents.openDevTools(options);
        }
        async toggleDevTools(windowId) {
            const window = this.getTargetWindow(windowId);
            window?.win?.webContents.toggleDevTools();
        }
        //#endregion
        // #region Performance
        async profileRenderer(windowId, session, duration) {
            const window = this.codeWindowById(windowId);
            if (!window || !window.win) {
                throw new Error();
            }
            const profiler = new windowProfiling_1.WindowProfiler(window.win, session, this.logService);
            const result = await profiler.inspect(duration);
            return result;
        }
        // #endregion
        //#region Registry (windows)
        async windowsGetStringRegKey(windowId, hive, path, name) {
            if (!platform_1.isWindows) {
                return undefined;
            }
            const Registry = await new Promise((resolve_4, reject_4) => { require(['@vscode/windows-registry'], resolve_4, reject_4); });
            try {
                return Registry.GetStringRegKey(hive, path, name);
            }
            catch {
                return undefined;
            }
        }
        //#endregion
        windowById(windowId, fallbackCodeWindowId) {
            return this.codeWindowById(windowId) ?? this.auxiliaryWindowById(windowId) ?? this.codeWindowById(fallbackCodeWindowId);
        }
        codeWindowById(windowId) {
            if (typeof windowId !== 'number') {
                return undefined;
            }
            return this.windowsMainService.getWindowById(windowId);
        }
        auxiliaryWindowById(windowId) {
            if (typeof windowId !== 'number') {
                return undefined;
            }
            return this.auxiliaryWindowsMainService.getWindowById(windowId);
        }
        getTargetWindow(fallbackWindowId) {
            let window = this.instantiationService.invokeFunction(windows_1.getFocusedOrLastActiveWindow);
            if (!window) {
                window = this.windowById(fallbackWindowId);
            }
            return window;
        }
    };
    exports.NativeHostMainService = NativeHostMainService;
    __decorate([
        decorators_1.memoize
    ], NativeHostMainService.prototype, "cliPath", null);
    exports.NativeHostMainService = NativeHostMainService = __decorate([
        __param(0, windows_1.IWindowsMainService),
        __param(1, auxiliaryWindows_1.IAuxiliaryWindowsMainService),
        __param(2, dialogMainService_1.IDialogMainService),
        __param(3, lifecycleMainService_1.ILifecycleMainService),
        __param(4, environmentMainService_1.IEnvironmentMainService),
        __param(5, log_1.ILogService),
        __param(6, productService_1.IProductService),
        __param(7, themeMainService_1.IThemeMainService),
        __param(8, workspacesManagementMainService_1.IWorkspacesManagementMainService),
        __param(9, instantiation_1.IInstantiationService)
    ], NativeHostMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlSG9zdE1haW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9uYXRpdmUvZWxlY3Ryb24tbWFpbi9uYXRpdmVIb3N0TWFpblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNkNuRixRQUFBLHNCQUFzQixHQUFHLElBQUEsK0JBQWUsRUFBeUIsdUJBQXVCLENBQUMsQ0FBQztJQUVoRyxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHNCQUFVO1FBSXBELFlBQ3NCLGtCQUF3RCxFQUMvQywyQkFBMEUsRUFDcEYsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUMxRCxzQkFBZ0UsRUFDNUUsVUFBd0MsRUFDcEMsY0FBZ0QsRUFDOUMsZ0JBQW9ELEVBQ3JDLCtCQUFrRixFQUM3RixvQkFBNEQ7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFYOEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM5QixnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQThCO1lBQ25FLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUN6QywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQzNELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDbkIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDcEIsb0NBQStCLEdBQS9CLCtCQUErQixDQUFrQztZQUM1RSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBVXBGLFlBQVk7WUFHWixnQkFBZ0I7WUFFUCx3QkFBbUIsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLEVB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
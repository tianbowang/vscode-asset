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
define(["require", "exports", "electron", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/parts/ipc/electron-main/ipcMain", "vs/platform/auxiliaryWindow/electron-main/auxiliaryWindow", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/windows/electron-main/windows"], function (require, exports, electron_1, event_1, lifecycle_1, network_1, ipcMain_1, auxiliaryWindow_1, instantiation_1, log_1, windows_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuxiliaryWindowsMainService = void 0;
    let AuxiliaryWindowsMainService = class AuxiliaryWindowsMainService extends lifecycle_1.Disposable {
        constructor(instantiationService, logService) {
            super();
            this.instantiationService = instantiationService;
            this.logService = logService;
            this._onDidMaximizeWindow = this._register(new event_1.Emitter());
            this.onDidMaximizeWindow = this._onDidMaximizeWindow.event;
            this._onDidUnmaximizeWindow = this._register(new event_1.Emitter());
            this.onDidUnmaximizeWindow = this._onDidUnmaximizeWindow.event;
            this._onDidChangeFullScreen = this._register(new event_1.Emitter());
            this.onDidChangeFullScreen = this._onDidChangeFullScreen.event;
            this._onDidTriggerSystemContextMenu = this._register(new event_1.Emitter());
            this.onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
            this.windows = new Map();
            this.registerListeners();
        }
        registerListeners() {
            // We have to ensure that an auxiliary window gets to know its
            // containing `BrowserWindow` so that it can apply listeners to it
            // Unfortunately we cannot rely on static `BrowserWindow` methods
            // because we might call the methods too early before the window
            // is created.
            electron_1.app.on('browser-window-created', (_event, browserWindow) => {
                const auxiliaryWindow = this.getWindowById(browserWindow.id);
                if (auxiliaryWindow) {
                    this.logService.trace('[aux window] app.on("browser-window-created"): Trying to claim auxiliary window');
                    auxiliaryWindow.tryClaimWindow();
                }
            });
            ipcMain_1.validatedIpcMain.handle('vscode:registerAuxiliaryWindow', async (event, mainWindowId) => {
                const auxiliaryWindow = this.getWindowById(event.sender.id);
                if (auxiliaryWindow) {
                    this.logService.trace('[aux window] vscode:registerAuxiliaryWindow: Registering auxiliary window to main window');
                    auxiliaryWindow.parentId = mainWindowId;
                }
                return event.sender.id;
            });
        }
        createWindow() {
            return this.instantiationService.invokeFunction(windows_1.defaultBrowserWindowOptions, undefined, {
                webPreferences: {
                    preload: network_1.FileAccess.asFileUri('vs/base/parts/sandbox/electron-sandbox/preload-aux.js').fsPath
                }
            });
        }
        registerWindow(webContents) {
            const disposables = new lifecycle_1.DisposableStore();
            const auxiliaryWindow = this.instantiationService.createInstance(auxiliaryWindow_1.AuxiliaryWindow, webContents);
            this.windows.set(auxiliaryWindow.id, auxiliaryWindow);
            disposables.add((0, lifecycle_1.toDisposable)(() => this.windows.delete(auxiliaryWindow.id)));
            disposables.add(auxiliaryWindow.onDidMaximize(() => this._onDidMaximizeWindow.fire(auxiliaryWindow)));
            disposables.add(auxiliaryWindow.onDidUnmaximize(() => this._onDidUnmaximizeWindow.fire(auxiliaryWindow)));
            disposables.add(auxiliaryWindow.onDidEnterFullScreen(() => this._onDidChangeFullScreen.fire({ window: auxiliaryWindow, fullscreen: true })));
            disposables.add(auxiliaryWindow.onDidLeaveFullScreen(() => this._onDidChangeFullScreen.fire({ window: auxiliaryWindow, fullscreen: false })));
            disposables.add(auxiliaryWindow.onDidTriggerSystemContextMenu(({ x, y }) => this._onDidTriggerSystemContextMenu.fire({ window: auxiliaryWindow, x, y })));
            event_1.Event.once(auxiliaryWindow.onDidClose)(() => disposables.dispose());
        }
        getWindowById(windowId) {
            return this.windows.get(windowId);
        }
        getFocusedWindow() {
            const window = electron_1.BrowserWindow.getFocusedWindow();
            if (window) {
                return this.getWindowById(window.id);
            }
            return undefined;
        }
        getLastActiveWindow() {
            return (0, windows_1.getLastFocused)(Array.from(this.windows.values()));
        }
        getWindows() {
            return Array.from(this.windows.values());
        }
    };
    exports.AuxiliaryWindowsMainService = AuxiliaryWindowsMainService;
    exports.AuxiliaryWindowsMainService = AuxiliaryWindowsMainService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, log_1.ILogService)
    ], AuxiliaryWindowsMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV4aWxpYXJ5V2luZG93c01haW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hdXhpbGlhcnlXaW5kb3cvZWxlY3Ryb24tbWFpbi9hdXhpbGlhcnlXaW5kb3dzTWFpblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7UUFrQjFELFlBQ3dCLG9CQUE0RCxFQUN0RSxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQUhnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3JELGVBQVUsR0FBVixVQUFVLENBQWE7WUFoQnJDLHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW9CLENBQUMsQ0FBQztZQUMvRSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBRTlDLDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW9CLENBQUMsQ0FBQztZQUNqRiwwQkFBcUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBRWxELDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFELENBQUMsQ0FBQztZQUNsSCwwQkFBcUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBRWxELG1DQUE4QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXNELENBQUMsQ0FBQztZQUMzSCxrQ0FBNkIsR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDO1lBRWxFLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztZ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
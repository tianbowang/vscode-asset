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
define(["require", "exports", "electron", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/state/node/state", "vs/platform/windows/electron-main/windows", "vs/platform/window/electron-main/window", "vs/platform/workspace/common/workspace"], function (require, exports, electron_1, lifecycle_1, platform_1, resources_1, uri_1, configuration_1, lifecycleMainService_1, log_1, state_1, windows_1, window_1, workspace_1) {
    "use strict";
    var WindowsStateHandler_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWindowsStateStoreData = exports.restoreWindowsState = exports.WindowsStateHandler = void 0;
    let WindowsStateHandler = class WindowsStateHandler extends lifecycle_1.Disposable {
        static { WindowsStateHandler_1 = this; }
        static { this.windowsStateStorageKey = 'windowsState'; }
        get state() { return this._state; }
        constructor(windowsMainService, stateService, lifecycleMainService, logService, configurationService) {
            super();
            this.windowsMainService = windowsMainService;
            this.stateService = stateService;
            this.lifecycleMainService = lifecycleMainService;
            this.logService = logService;
            this.configurationService = configurationService;
            this._state = restoreWindowsState(this.stateService.getItem(WindowsStateHandler_1.windowsStateStorageKey));
            this.lastClosedState = undefined;
            this.shuttingDown = false;
            this.registerListeners();
        }
        registerListeners() {
            // When a window looses focus, save all windows state. This allows to
            // prevent loss of window-state data when OS is restarted without properly
            // shutting down the application (https://github.com/microsoft/vscode/issues/87171)
            electron_1.app.on('browser-window-blur', () => {
                if (!this.shuttingDown) {
                    this.saveWindowsState();
                }
            });
            // Handle various lifecycle events around windows
            this.lifecycleMainService.onBeforeCloseWindow(window => this.onBeforeCloseWindow(window));
            this.lifecycleMainService.onBeforeShutdown(() => this.onBeforeShutdown());
            this.windowsMainService.onDidChangeWindowsCount(e => {
                if (e.newCount - e.oldCount > 0) {
                    // clear last closed window state when a new window opens. this helps on macOS where
                    // otherwise closing the last window, opening a new window and then quitting would
                    // use the state of the previously closed window when restarting.
                    this.lastClosedState = undefined;
                }
            });
            // try to save state before destroy because close will not fire
            this.windowsMainService.onDidDestroyWindow(window => this.onBeforeCloseWindow(window));
        }
        // Note that onBeforeShutdown() and onBeforeCloseWindow() are fired in different order depending on the OS:
        // - macOS: since the app will not quit when closing the last window, you will always first get
        //          the onBeforeShutdown() event followed by N onBeforeCloseWindow() events for each window
        // - other: on other OS, closing the last window will quit the app so the order depends on the
        //          user interaction: closing the last window will first trigger onBeforeCloseWindow()
        //          and then onBeforeShutdown(). Using the quit action however will first issue onBeforeShutdown()
        //          and then onBeforeCloseWindow().
        //
        // Here is the behavior on different OS depending on action taken (Electron 1.7.x):
        //
        // Legend
        // -  quit(N): quit application with N windows opened
        // - close(1): close one window via the window close button
        // - closeAll: close all windows via the taskbar command
        // - onBeforeShutdown(N): number of windows reported in this event handler
        // - onBeforeCloseWindow(N, M): number of windows reported and quitRequested boolean in this event handler
        //
        // macOS
        // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
        // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
        // 	-     quit(0): onBeforeShutdown(0)
        // 	-    close(1): onBeforeCloseWindow(1, false)
        //
        // Windows
        // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
        // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
        // 	-    close(1): onBeforeCloseWindow(2, false)[not last window]
        // 	-    close(1): onBeforeCloseWindow(1, false), onBeforeShutdown(0)[last window]
        // 	- closeAll(2): onBeforeCloseWindow(2, false), onBeforeCloseWindow(2, false), onBeforeShutdown(0)
        //
        // Linux
        // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
        // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
        // 	-    close(1): onBeforeCloseWindow(2, false)[not last window]
        // 	-    close(1): onBeforeCloseWindow(1, false), onBeforeShutdown(0)[last window]
        // 	- closeAll(2): onBeforeCloseWindow(2, false), onBeforeCloseWindow(2, false), onBeforeShutdown(0)
        //
        onBeforeShutdown() {
            this.shuttingDown = true;
            this.saveWindowsState();
        }
        saveWindowsState() {
            // TODO@electron workaround for Electron not being able to restore
            // multiple (native) fullscreen windows on the same display at once
            // on macOS.
            // https://github.com/electron/electron/issues/34367
            const displaysWithFullScreenWindow = new Set();
            const currentWindowsState = {
                openedWindows: [],
                lastPluginDevelopmentHostWindow: this._state.lastPluginDevelopmentHostWindow,
                lastActiveWindow: this.lastClosedState
            };
            // 1.) Find a last active window (pick any other first window otherwise)
            if (!currentWindowsState.lastActiveWindow) {
                let activeWindow = this.windowsMainService.getLastActiveWindow();
                if (!activeWindow || activeWindow.isExtensionDevelopmentHost) {
                    activeWindow = this.windowsMainService.getWindows().find(window => !window.isExtensionDevelopmentHost);
                }
                if (activeWindow) {
                    currentWindowsState.lastActiveWindow = this.toWindowState(activeWindow);
                    if (currentWindowsState.lastActiveWindow.uiState.mode === 3 /* WindowMode.Fullscreen */) {
                        displaysWithFullScreenWindow.add(currentWindowsState.lastActiveWindow.uiState.display); // always allow fullscreen for active window
                    }
                }
            }
            // 2.) Find extension host window
            const extensionHostWindow = this.windowsMainService.getWindows().find(window => window.isExtensionDevelopmentHost && !window.isExtensionTestHost);
            if (extensionHostWindow) {
                currentWindowsState.lastPluginDevelopmentHostWindow = this.toWindowState(extensionHostWindow);
                if (currentWindowsState.lastPluginDevelopmentHostWindow.uiState.mode === 3 /* WindowMode.Fullscreen */) {
                    if (displaysWithFullScreenWindow.has(currentWindowsState.lastPluginDevelopmentHostWindow.uiState.display)) {
                        if (platform_1.isMacintosh && !extensionHostWindow.win?.isSimpleFullScreen()) {
                            currentWindowsState.lastPluginDevelopmentHostWindow.uiState.mode = 1 /* WindowMode.Normal */;
                        }
                    }
                    else {
                        displaysWithFullScreenWindow.add(currentWindowsState.lastPluginDevelopmentHostWindow.uiState.display);
                    }
                }
            }
            // 3.) All windows (except extension host) for N >= 2 to support `restoreWindows: all` or for auto update
            //
            // Careful here: asking a window for its window state after it has been closed returns bogus values (width: 0, height: 0)
            // so if we ever want to persist the UI state of the last closed window (window count === 1), it has
            // to come from the stored lastClosedWindowState on Win/Linux at least
            if (this.windowsMainService.getWindowCount() > 1) {
                currentWindowsState.openedWindows = this.windowsMainService.getWindows().filter(window => !window.isExtensionDevelopmentHost).map(window => {
                    const windowState = this.toWindowState(window);
                    if (windowState.uiState.mode === 3 /* WindowMode.Fullscreen */) {
                        if (displaysWithFullScreenWindow.has(windowState.uiState.display)) {
                            if (platform_1.isMacintosh && windowState.windowId !== currentWindowsState.lastActiveWindow?.windowId && !window.win?.isSimpleFullScreen()) {
                                windowState.uiState.mode = 1 /* WindowMode.Normal */;
                            }
                        }
                        else {
                            displaysWithFullScreenWindow.add(windowState.uiState.display);
                        }
                    }
                    return windowState;
                });
            }
            // Persist
            const state = getWindowsStateStoreData(currentWindowsState);
            this.stateService.setItem(WindowsStateHandler_1.windowsStateStorageKey, state);
            if (this.shuttingDown) {
                this.logService.trace('[WindowsStateHandler] onBeforeShutdown', state);
            }
        }
        // See note on #onBeforeShutdown() for details how these events are flowing
        onBeforeCloseWindow(window) {
            if (this.lifecycleMainService.quitRequested) {
                return; // during quit, many windows close in parallel so let it be handled in the before-quit handler
            }
            // On Window close, update our stored UI state of this window
            const state = this.toWindowState(window);
            if (window.isExtensionDevelopmentHost && !window.isExtensionTestHost) {
                this._state.lastPluginDevelopmentHostWindow = state; // do not let test run window state overwrite our extension development state
            }
            // Any non extension host window with same workspace or folder
            else if (!window.isExtensionDevelopmentHost && window.openedWorkspace) {
                this._state.openedWindows.forEach(openedWindow => {
                    const sameWorkspace = (0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace) && openedWindow.workspace?.id === window.openedWorkspace.id;
                    const sameFolder = (0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.openedWorkspace) && openedWindow.folderUri && resources_1.extUriBiasedIgnorePathCase.isEqual(openedWindow.folderUri, window.openedWorkspace.uri);
                    if (sameWorkspace || sameFolder) {
                        openedWindow.uiState = state.uiState;
                    }
                });
            }
            // On Windows and Linux closing the last window will trigger quit. Since we are storing all UI state
            // before quitting, we need to remember the UI state of this window to be able to persist it.
            // On macOS we keep the last closed window state ready in case the user wants to quit right after or
            // wants to open another window, in which case we use this state over the persisted one.
            if (this.windowsMainService.getWindowCount() === 1) {
                this.lastClosedState = state;
            }
        }
        toWindowState(window) {
            return {
                windowId: window.id,
                workspace: (0, workspace_1.isWorkspaceIdentifier)(window.openedWorkspace) ? window.openedWorkspace : undefined,
                folderUri: (0, workspace_1.isSingleFolderWorkspaceIdentifier)(window.openedWorkspace) ? window.openedWorkspace.uri : undefined,
                backupPath: window.backupPath,
                remoteAuthority: window.remoteAuthority,
                uiState: window.serializeWindowState()
            };
        }
        getNewWindowState(configuration) {
            const state = this.doGetNewWindowState(configuration);
            const windowConfig = this.configurationService.getValue('window');
            // Fullscreen state gets special treatment
            if (state.mode === 3 /* WindowMode.Fullscreen */) {
                // Window state is not from a previous session: only allow fullscreen if we inherit it or user wants fullscreen
                let allowFullscreen;
                if (state.hasDefaultState) {
                    allowFullscreen = !!(windowConfig?.newWindowDimensions && ['fullscreen', 'inherit', 'offset'].indexOf(windowConfig.newWindowDimensions) >= 0);
                }
                // Window state is from a previous session: only allow fullscreen when we got updated or user wants to restore
                else {
                    allowFullscreen = !!(this.lifecycleMainService.wasRestarted || windowConfig?.restoreFullscreen);
                }
                if (!allowFullscreen) {
                    state.mode = 1 /* WindowMode.Normal */;
                }
            }
            return state;
        }
        doGetNewWindowState(configuration) {
            const lastActive = this.windowsMainService.getLastActiveWindow();
            // Restore state unless we are running extension tests
            if (!configuration.extensionTestsPath) {
                // extension development host Window - load from stored settings if any
                if (!!configuration.extensionDevelopmentPath && this.state.lastPluginDevelopmentHostWindow) {
                    return this.state.lastPluginDevelopmentHostWindow.uiState;
                }
                // Known Workspace - load from stored settings
                const workspace = configuration.workspace;
                if ((0, workspace_1.isWorkspaceIdentifier)(workspace)) {
                    const stateForWorkspace = this.state.openedWindows.filter(openedWindow => openedWindow.workspace && openedWindow.workspace.id === workspace.id).map(openedWindow => openedWindow.uiState);
                    if (stateForWorkspace.length) {
                        return stateForWorkspace[0];
                    }
                }
                // Known Folder - load from stored settings
                if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspace)) {
                    const stateForFolder = this.state.openedWindows.filter(openedWindow => openedWindow.folderUri && resources_1.extUriBiasedIgnorePathCase.isEqual(openedWindow.folderUri, workspace.uri)).map(openedWindow => openedWindow.uiState);
                    if (stateForFolder.length) {
                        return stateForFolder[0];
                    }
                }
                // Empty windows with backups
                else if (configuration.backupPath) {
                    const stateForEmptyWindow = this.state.openedWindows.filter(openedWindow => openedWindow.backupPath === configuration.backupPath).map(openedWindow => openedWindow.uiState);
                    if (stateForEmptyWindow.length) {
                        return stateForEmptyWindow[0];
                    }
                }
                // First Window
                const lastActiveState = this.lastClosedState || this.state.lastActiveWindow;
                if (!lastActive && lastActiveState) {
                    return lastActiveState.uiState;
                }
            }
            //
            // In any other case, we do not have any stored settings for the window state, so we come up with something smart
            //
            // We want the new window to open on the same display that the last active one is in
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
                if (!displayToUse && lastActive) {
                    displayToUse = electron_1.screen.getDisplayMatching(lastActive.getBounds());
                }
                // fallback to primary display or first display
                if (!displayToUse) {
                    displayToUse = electron_1.screen.getPrimaryDisplay() || displays[0];
                }
            }
            // Compute x/y based on display bounds
            // Note: important to use Math.round() because Electron does not seem to be too happy about
            // display coordinates that are not absolute numbers.
            let state = (0, window_1.defaultWindowState)();
            state.x = Math.round(displayToUse.bounds.x + (displayToUse.bounds.width / 2) - (state.width / 2));
            state.y = Math.round(displayToUse.bounds.y + (displayToUse.bounds.height / 2) - (state.height / 2));
            // Check for newWindowDimensions setting and adjust accordingly
            const windowConfig = this.configurationService.getValue('window');
            let ensureNoOverlap = true;
            if (windowConfig?.newWindowDimensions) {
                if (windowConfig.newWindowDimensions === 'maximized') {
                    state.mode = 0 /* WindowMode.Maximized */;
                    ensureNoOverlap = false;
                }
                else if (windowConfig.newWindowDimensions === 'fullscreen') {
                    state.mode = 3 /* WindowMode.Fullscreen */;
                    ensureNoOverlap = false;
                }
                else if ((windowConfig.newWindowDimensions === 'inherit' || windowConfig.newWindowDimensions === 'offset') && lastActive) {
                    const lastActiveState = lastActive.serializeWindowState();
                    if (lastActiveState.mode === 3 /* WindowMode.Fullscreen */) {
                        state.mode = 3 /* WindowMode.Fullscreen */; // only take mode (fixes https://github.com/microsoft/vscode/issues/19331)
                    }
                    else {
                        state = {
                            ...lastActiveState,
                            zoomLevel: undefined // do not inherit zoom level
                        };
                    }
                    ensureNoOverlap = state.mode !== 3 /* WindowMode.Fullscreen */ && windowConfig.newWindowDimensions === 'offset';
                }
            }
            if (ensureNoOverlap) {
                state = this.ensureNoOverlap(state);
            }
            state.hasDefaultState = true; // flag as default state
            return state;
        }
        ensureNoOverlap(state) {
            if (this.windowsMainService.getWindows().length === 0) {
                return state;
            }
            state.x = typeof state.x === 'number' ? state.x : 0;
            state.y = typeof state.y === 'number' ? state.y : 0;
            const existingWindowBounds = this.windowsMainService.getWindows().map(window => window.getBounds());
            while (existingWindowBounds.some(bounds => bounds.x === state.x || bounds.y === state.y)) {
                state.x += 30;
                state.y += 30;
            }
            return state;
        }
    };
    exports.WindowsStateHandler = WindowsStateHandler;
    exports.WindowsStateHandler = WindowsStateHandler = WindowsStateHandler_1 = __decorate([
        __param(0, windows_1.IWindowsMainService),
        __param(1, state_1.IStateService),
        __param(2, lifecycleMainService_1.ILifecycleMainService),
        __param(3, log_1.ILogService),
        __param(4, configuration_1.IConfigurationService)
    ], WindowsStateHandler);
    function restoreWindowsState(data) {
        const result = { openedWindows: [] };
        const windowsState = data || { openedWindows: [] };
        if (windowsState.lastActiveWindow) {
            result.lastActiveWindow = restoreWindowState(windowsState.lastActiveWindow);
        }
        if (windowsState.lastPluginDevelopmentHostWindow) {
            result.lastPluginDevelopmentHostWindow = restoreWindowState(windowsState.lastPluginDevelopmentHostWindow);
        }
        if (Array.isArray(windowsState.openedWindows)) {
            result.openedWindows = windowsState.openedWindows.map(windowState => restoreWindowState(windowState));
        }
        return result;
    }
    exports.restoreWindowsState = restoreWindowsState;
    function restoreWindowState(windowState) {
        const result = { uiState: windowState.uiState };
        if (windowState.backupPath) {
            result.backupPath = windowState.backupPath;
        }
        if (windowState.remoteAuthority) {
            result.remoteAuthority = windowState.remoteAuthority;
        }
        if (windowState.folder) {
            result.folderUri = uri_1.URI.parse(windowState.folder);
        }
        if (windowState.workspaceIdentifier) {
            result.workspace = { id: windowState.workspaceIdentifier.id, configPath: uri_1.URI.parse(windowState.workspaceIdentifier.configURIPath) };
        }
        return result;
    }
    function getWindowsStateStoreData(windowsState) {
        return {
            lastActiveWindow: windowsState.lastActiveWindow && serializeWindowState(windowsState.lastActiveWindow),
            lastPluginDevelopmentHostWindow: windowsState.lastPluginDevelopmentHostWindow && serializeWindowState(windowsState.lastPluginDevelopmentHostWindow),
            openedWindows: windowsState.openedWindows.map(ws => serializeWindowState(ws))
        };
    }
    exports.getWindowsStateStoreData = getWindowsStateStoreData;
    function serializeWindowState(windowState) {
        return {
            workspaceIdentifier: windowState.workspace && { id: windowState.workspace.id, configURIPath: windowState.workspace.configPath.toString() },
            folder: windowState.folderUri && windowState.folderUri.toString(),
            backupPath: windowState.backupPath,
            remoteAuthority: windowState.remoteAuthority,
            uiState: windowState.uiState
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c1N0YXRlSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93cy9lbGVjdHJvbi1tYWluL3dpbmRvd3NTdGF0ZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWlEekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTs7aUJBRTFCLDJCQUFzQixHQUFHLGNBQWMsQUFBakIsQ0FBa0I7UUFFaEUsSUFBSSxLQUFLLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQU9uQyxZQUNzQixrQkFBd0QsRUFDOUQsWUFBNEMsRUFDcEMsb0JBQTRELEVBQ3RFLFVBQXdDLEVBQzlCLG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQU44Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQzdDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ25CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDckQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNiLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFYbkUsV0FBTSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUEwQixxQkFBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7WUFFdEksb0JBQWUsR0FBNkIsU0FBUyxDQUFDO1lBRXRELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1lBVzVCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIscUVBQXFFO1lBQ3JFLDBFQUEwRTtZQUMxRSxtRkFBbUY7WUFDbkYsY0FBRyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2xD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
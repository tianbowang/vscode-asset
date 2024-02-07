/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/window/common/window", "vs/platform/theme/electron-main/themeMainService", "vs/platform/product/common/productService", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/base/common/path", "vs/platform/auxiliaryWindow/electron-main/auxiliaryWindows", "vs/base/common/color"], function (require, exports, platform_1, instantiation_1, window_1, themeMainService_1, productService_1, configuration_1, environmentMainService_1, path_1, auxiliaryWindows_1, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLastFocused = exports.getFocusedOrLastActiveWindow = exports.defaultBrowserWindowOptions = exports.OpenContext = exports.IWindowsMainService = void 0;
    exports.IWindowsMainService = (0, instantiation_1.createDecorator)('windowsMainService');
    var OpenContext;
    (function (OpenContext) {
        // opening when running from the command line
        OpenContext[OpenContext["CLI"] = 0] = "CLI";
        // macOS only: opening from the dock (also when opening files to a running instance from desktop)
        OpenContext[OpenContext["DOCK"] = 1] = "DOCK";
        // opening from the main application window
        OpenContext[OpenContext["MENU"] = 2] = "MENU";
        // opening from a file or folder dialog
        OpenContext[OpenContext["DIALOG"] = 3] = "DIALOG";
        // opening from the OS's UI
        OpenContext[OpenContext["DESKTOP"] = 4] = "DESKTOP";
        // opening through the API
        OpenContext[OpenContext["API"] = 5] = "API";
    })(OpenContext || (exports.OpenContext = OpenContext = {}));
    function defaultBrowserWindowOptions(accessor, windowState, overrides) {
        const themeMainService = accessor.get(themeMainService_1.IThemeMainService);
        const productService = accessor.get(productService_1.IProductService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const environmentMainService = accessor.get(environmentMainService_1.IEnvironmentMainService);
        const windowSettings = configurationService.getValue('window');
        const options = {
            backgroundColor: themeMainService.getBackgroundColor(),
            minWidth: window_1.WindowMinimumSize.WIDTH,
            minHeight: window_1.WindowMinimumSize.HEIGHT,
            title: productService.nameLong,
            ...overrides,
            webPreferences: {
                enableWebSQL: false,
                spellcheck: false,
                zoomFactor: (0, window_1.zoomLevelToZoomFactor)(windowState?.zoomLevel ?? windowSettings?.zoomLevel),
                autoplayPolicy: 'user-gesture-required',
                // Enable experimental css highlight api https://chromestatus.com/feature/5436441440026624
                // Refs https://github.com/microsoft/vscode/issues/140098
                enableBlinkFeatures: 'HighlightAPI',
                ...overrides?.webPreferences,
                sandbox: true
            },
            experimentalDarkMode: true
        };
        if (windowState) {
            options.x = windowState.x;
            options.y = windowState.y;
            options.width = windowState.width;
            options.height = windowState.height;
        }
        if (platform_1.isLinux) {
            options.icon = (0, path_1.join)(environmentMainService.appRoot, 'resources/linux/code.png'); // always on Linux
        }
        else if (platform_1.isWindows && !environmentMainService.isBuilt) {
            options.icon = (0, path_1.join)(environmentMainService.appRoot, 'resources/win32/code_150x150.png'); // only when running out of sources on Windows
        }
        if (platform_1.isMacintosh) {
            options.acceptFirstMouse = true; // enabled by default
            if (windowSettings?.clickThroughInactive === false) {
                options.acceptFirstMouse = false;
            }
        }
        if (platform_1.isMacintosh && !(0, window_1.useNativeFullScreen)(configurationService)) {
            options.fullscreenable = false; // enables simple fullscreen mode
        }
        const useNativeTabs = platform_1.isMacintosh && windowSettings?.nativeTabs === true;
        if (useNativeTabs) {
            options.tabbingIdentifier = productService.nameShort; // this opts in to sierra tabs
        }
        const hideNativeTitleBar = !(0, window_1.hasNativeTitlebar)(configurationService);
        if (hideNativeTitleBar) {
            options.titleBarStyle = 'hidden';
            if (!platform_1.isMacintosh) {
                options.frame = false;
            }
            if ((0, window_1.useWindowControlsOverlay)(configurationService)) {
                // This logic will not perfectly guess the right colors
                // to use on initialization, but prefer to keep things
                // simple as it is temporary and not noticeable
                const titleBarColor = themeMainService.getWindowSplash()?.colorInfo.titleBarBackground ?? themeMainService.getBackgroundColor();
                const symbolColor = color_1.Color.fromHex(titleBarColor).isDarker() ? '#FFFFFF' : '#000000';
                options.titleBarOverlay = {
                    height: 29, // the smallest size of the title bar on windows accounting for the border on windows 11
                    color: titleBarColor,
                    symbolColor
                };
            }
        }
        return options;
    }
    exports.defaultBrowserWindowOptions = defaultBrowserWindowOptions;
    function getFocusedOrLastActiveWindow(accessor) {
        const windowsMainService = accessor.get(exports.IWindowsMainService);
        const auxiliaryWindowsMainService = accessor.get(auxiliaryWindows_1.IAuxiliaryWindowsMainService);
        // By: Electron focused window
        const focusedWindow = windowsMainService.getFocusedWindow() ?? auxiliaryWindowsMainService.getFocusedWindow();
        if (focusedWindow) {
            return focusedWindow;
        }
        // By: Last active window
        const mainLastActiveWindow = windowsMainService.getLastActiveWindow();
        const auxiliaryLastActiveWindow = auxiliaryWindowsMainService.getLastActiveWindow();
        if (mainLastActiveWindow && auxiliaryLastActiveWindow) {
            return mainLastActiveWindow.lastFocusTime < auxiliaryLastActiveWindow.lastFocusTime ? auxiliaryLastActiveWindow : mainLastActiveWindow;
        }
        return mainLastActiveWindow ?? auxiliaryLastActiveWindow;
    }
    exports.getFocusedOrLastActiveWindow = getFocusedOrLastActiveWindow;
    function getLastFocused(windows) {
        let lastFocusedWindow = undefined;
        let maxLastFocusTime = Number.MIN_VALUE;
        for (const window of windows) {
            if (window.lastFocusTime > maxLastFocusTime) {
                maxLastFocusTime = window.lastFocusTime;
                lastFocusedWindow = window;
            }
        }
        return lastFocusedWindow;
    }
    exports.getLastFocused = getLastFocused;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93cy9lbGVjdHJvbi1tYWluL3dpbmRvd3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJuRixRQUFBLG1CQUFtQixHQUFHLElBQUEsK0JBQWUsRUFBc0Isb0JBQW9CLENBQUMsQ0FBQztJQXlDOUYsSUFBa0IsV0FtQmpCO0lBbkJELFdBQWtCLFdBQVc7UUFFNUIsNkNBQTZDO1FBQzdDLDJDQUFHLENBQUE7UUFFSCxpR0FBaUc7UUFDakcsNkNBQUksQ0FBQTtRQUVKLDJDQUEyQztRQUMzQyw2Q0FBSSxDQUFBO1FBRUosdUNBQXVDO1FBQ3ZDLGlEQUFNLENBQUE7UUFFTiwyQkFBMkI7UUFDM0IsbURBQU8sQ0FBQTtRQUVQLDBCQUEwQjtRQUMxQiwyQ0FBRyxDQUFBO0lBQ0osQ0FBQyxFQW5CaUIsV0FBVywyQkFBWCxXQUFXLFFBbUI1QjtJQW1DRCxTQUFnQiwyQkFBMkIsQ0FBQyxRQUEwQixFQUFFLFdBQTBCLEVBQUUsU0FBMkM7UUFDOUksTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7UUFDekQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZSxDQUFDLENBQUM7UUFDckQsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7UUFDakUsTUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGdEQUF1QixDQUFDLENBQUM7UUFFckUsTUFBTSxjQUFjLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUE4QixRQUFRLENBQUMsQ0FBQztRQUU1RixNQUFNLE9BQU8sR0FBd0U7WUFDcEYsZUFBZSxFQUFFLGdCQUFnQixDQUFDLGtC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
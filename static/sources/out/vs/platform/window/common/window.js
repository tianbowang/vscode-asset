/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.zoomLevelToZoomFactor = exports.useNativeFullScreen = exports.useWindowControlsOverlay = exports.getTitleBarStyle = exports.hasNativeTitlebar = exports.hasCustomTitlebar = exports.CustomTitleBarVisibility = exports.TitlebarStyle = exports.TitleBarSetting = exports.getMenuBarVisibility = exports.isFileToOpen = exports.isFolderToOpen = exports.isWorkspaceToOpen = exports.isOpenedAuxiliaryWindow = exports.WindowMinimumSize = void 0;
    exports.WindowMinimumSize = {
        WIDTH: 400,
        WIDTH_WITH_VERTICAL_PANEL: 600,
        HEIGHT: 270
    };
    function isOpenedAuxiliaryWindow(candidate) {
        return typeof candidate.parentId === 'number';
    }
    exports.isOpenedAuxiliaryWindow = isOpenedAuxiliaryWindow;
    function isWorkspaceToOpen(uriToOpen) {
        return !!uriToOpen.workspaceUri;
    }
    exports.isWorkspaceToOpen = isWorkspaceToOpen;
    function isFolderToOpen(uriToOpen) {
        return !!uriToOpen.folderUri;
    }
    exports.isFolderToOpen = isFolderToOpen;
    function isFileToOpen(uriToOpen) {
        return !!uriToOpen.fileUri;
    }
    exports.isFileToOpen = isFileToOpen;
    function getMenuBarVisibility(configurationService) {
        const nativeTitleBarEnabled = hasNativeTitlebar(configurationService);
        const menuBarVisibility = configurationService.getValue('window.menuBarVisibility');
        if (menuBarVisibility === 'default' || (nativeTitleBarEnabled && menuBarVisibility === 'compact') || (platform_1.isMacintosh && platform_1.isNative)) {
            return 'classic';
        }
        else {
            return menuBarVisibility;
        }
    }
    exports.getMenuBarVisibility = getMenuBarVisibility;
    var TitleBarSetting;
    (function (TitleBarSetting) {
        TitleBarSetting["TITLE_BAR_STYLE"] = "window.titleBarStyle";
        TitleBarSetting["CUSTOM_TITLE_BAR_VISIBILITY"] = "window.customTitleBarVisibility";
    })(TitleBarSetting || (exports.TitleBarSetting = TitleBarSetting = {}));
    var TitlebarStyle;
    (function (TitlebarStyle) {
        TitlebarStyle["NATIVE"] = "native";
        TitlebarStyle["CUSTOM"] = "custom";
    })(TitlebarStyle || (exports.TitlebarStyle = TitlebarStyle = {}));
    var CustomTitleBarVisibility;
    (function (CustomTitleBarVisibility) {
        CustomTitleBarVisibility["AUTO"] = "auto";
        CustomTitleBarVisibility["WINDOWED"] = "windowed";
        CustomTitleBarVisibility["NEVER"] = "never";
    })(CustomTitleBarVisibility || (exports.CustomTitleBarVisibility = CustomTitleBarVisibility = {}));
    function hasCustomTitlebar(configurationService, titleBarStyle) {
        // Returns if it possible to have a custom title bar in the curren session
        // Does not imply that the title bar is visible
        return true;
    }
    exports.hasCustomTitlebar = hasCustomTitlebar;
    function hasNativeTitlebar(configurationService, titleBarStyle) {
        if (!titleBarStyle) {
            titleBarStyle = getTitleBarStyle(configurationService);
        }
        return titleBarStyle === "native" /* TitlebarStyle.NATIVE */;
    }
    exports.hasNativeTitlebar = hasNativeTitlebar;
    function getTitleBarStyle(configurationService) {
        if (platform_1.isWeb) {
            return "custom" /* TitlebarStyle.CUSTOM */;
        }
        const configuration = configurationService.getValue('window');
        if (configuration) {
            const useNativeTabs = platform_1.isMacintosh && configuration.nativeTabs === true;
            if (useNativeTabs) {
                return "native" /* TitlebarStyle.NATIVE */; // native tabs on sierra do not work with custom title style
            }
            const useSimpleFullScreen = platform_1.isMacintosh && configuration.nativeFullScreen === false;
            if (useSimpleFullScreen) {
                return "native" /* TitlebarStyle.NATIVE */; // simple fullscreen does not work well with custom title style (https://github.com/microsoft/vscode/issues/63291)
            }
            const style = configuration.titleBarStyle;
            if (style === "native" /* TitlebarStyle.NATIVE */ || style === "custom" /* TitlebarStyle.CUSTOM */) {
                return style;
            }
        }
        return platform_1.isLinux ? "native" /* TitlebarStyle.NATIVE */ : "custom" /* TitlebarStyle.CUSTOM */; // default to custom on all macOS and Windows
    }
    exports.getTitleBarStyle = getTitleBarStyle;
    function useWindowControlsOverlay(configurationService) {
        if (!platform_1.isWindows || platform_1.isWeb) {
            return false; // only supported on a desktop Windows instance
        }
        if (hasNativeTitlebar(configurationService)) {
            return false; // only supported when title bar is custom
        }
        // Default to true.
        return true;
    }
    exports.useWindowControlsOverlay = useWindowControlsOverlay;
    function useNativeFullScreen(configurationService) {
        const windowConfig = configurationService.getValue('window');
        if (!windowConfig || typeof windowConfig.nativeFullScreen !== 'boolean') {
            return true; // default
        }
        if (windowConfig.nativeTabs) {
            return true; // https://github.com/electron/electron/issues/16142
        }
        return windowConfig.nativeFullScreen !== false;
    }
    exports.useNativeFullScreen = useNativeFullScreen;
    /**
     * According to Electron docs: `scale := 1.2 ^ level`.
     * https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssetzoomlevellevel
     */
    function zoomLevelToZoomFactor(zoomLevel = 0) {
        return Math.pow(1.2, zoomLevel);
    }
    exports.zoomLevelToZoomFactor = zoomLevelToZoomFactor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS93aW5kb3cvY29tbW9uL3dpbmRvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQm5GLFFBQUEsaUJBQWlCLEdBQUc7UUFDaEMsS0FBSyxFQUFFLEdBQUc7UUFDVix5QkFBeUIsRUFBRSxHQUFHO1FBQzlCLE1BQU0sRUFBRSxHQUFHO0tBQ1gsQ0FBQztJQWtFRixTQUFnQix1QkFBdUIsQ0FBQyxTQUFxRDtRQUM1RixPQUFPLE9BQVEsU0FBb0MsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDO0lBQzNFLENBQUM7SUFGRCwwREFFQztJQXNCRCxTQUFnQixpQkFBaUIsQ0FBQyxTQUEwQjtRQUMzRCxPQUFPLENBQUMsQ0FBRSxTQUE4QixDQUFDLFlBQVksQ0FBQztJQUN2RCxDQUFDO0lBRkQsOENBRUM7SUFFRCxTQUFnQixjQUFjLENBQUMsU0FBMEI7UUFDeEQsT0FBTyxDQUFDLENBQUUsU0FBMkIsQ0FBQyxTQUFTLENBQUM7SUFDakQsQ0FBQztJQUZELHdDQUVDO0lBRUQsU0FBZ0IsWUFBWSxDQUFDLFNBQTBCO1FBQ3RELE9BQU8sQ0FBQyxDQUFFLFNBQXlCLENBQUMsT0FBTyxDQUFDO0lBQzdDLENBQUM7SUFGRCxvQ0FFQztJQUlELFNBQWdCLG9CQUFvQixDQUFDLG9CQUEyQztRQUMvRSxNQUFNLHFCQUFxQixHQUFHLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDdEUsTUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQWdDLDBCQUEwQixDQUFDLENBQUM7UUFFbkgsSUFBSSxpQkFBaUIsS0FBSyxTQUFTLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxpQkFBaUIsS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFXLElBQUksbUJBQVEsQ0FB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
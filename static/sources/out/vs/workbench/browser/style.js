/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/base/common/platform", "vs/base/browser/dom", "vs/base/browser/browser", "vs/platform/theme/common/colorRegistry", "vs/base/browser/window", "vs/css!./media/style"], function (require, exports, themeService_1, theme_1, platform_1, dom_1, browser_1, colorRegistry_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_FONT_FAMILY = void 0;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        // Background (helps for subpixel-antialiasing on Windows)
        const workbenchBackground = (0, theme_1.WORKBENCH_BACKGROUND)(theme);
        collector.addRule(`.monaco-workbench { background-color: ${workbenchBackground}; }`);
        // Selection (do NOT remove - https://github.com/microsoft/vscode/issues/169662)
        const windowSelectionBackground = theme.getColor(colorRegistry_1.selectionBackground);
        if (windowSelectionBackground) {
            collector.addRule(`.monaco-workbench ::selection { background-color: ${windowSelectionBackground}; }`);
        }
        // Update <meta name="theme-color" content=""> based on selected theme
        if (platform_1.isWeb) {
            const titleBackground = theme.getColor(theme_1.TITLE_BAR_ACTIVE_BACKGROUND);
            if (titleBackground) {
                const metaElementId = 'monaco-workbench-meta-theme-color';
                let metaElement = window_1.mainWindow.document.getElementById(metaElementId);
                if (!metaElement) {
                    metaElement = (0, dom_1.createMetaElement)();
                    metaElement.name = 'theme-color';
                    metaElement.id = metaElementId;
                }
                metaElement.content = titleBackground.toString();
            }
        }
        // We disable user select on the root element, however on Safari this seems
        // to prevent any text selection in the monaco editor. As a workaround we
        // allow to select text in monaco editor instances.
        if (browser_1.isSafari) {
            collector.addRule(`
			body.web {
				touch-action: none;
			}
			.monaco-workbench .monaco-editor .view-lines {
				user-select: text;
				-webkit-user-select: text;
			}
		`);
        }
        // Update body background color to ensure the home indicator area looks similar to the workbench
        if (platform_1.isIOS && (0, browser_1.isStandalone)()) {
            collector.addRule(`body { background-color: ${workbenchBackground}; }`);
        }
    });
    /**
     * The best font-family to be used in CSS based on the platform:
     * - Windows: Segoe preferred, fallback to sans-serif
     * - macOS: standard system font, fallback to sans-serif
     * - Linux: standard system font preferred, fallback to Ubuntu fonts
     *
     * Note: this currently does not adjust for different locales.
     */
    exports.DEFAULT_FONT_FAMILY = platform_1.isWindows ? '"Segoe WPC", "Segoe UI", sans-serif' : platform_1.isMacintosh ? '-apple-system, BlinkMacSystemFont, sans-serif' : 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3N0eWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxJQUFBLHlDQUEwQixFQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFO1FBRS9DLDBEQUEwRDtRQUMxRCxNQUFNLG1CQUFtQixHQUFHLElBQUEsNEJBQW9CLEVBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEQsU0FBUyxDQUFDLE9BQU8sQ0FBQyx5Q0FBeUMsbUJBQW1CLEtBQUssQ0FBQyxDQUFDO1FBRXJGLGdGQUFnRjtRQUNoRixNQUFNLHlCQUF5QixHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsbUNBQW1CLENBQUMsQ0FBQztRQUN0RSxJQUFJLHlCQUF5QixFQUFFLENBQUM7WUFDL0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxxREFBcUQseUJBQXlCLEtBQUssQ0FBQyxDQUFDO1FBQ3hHLENBQUM7UUFFRCxzRUFBc0U7UUFDdEUsSUFBSSxnQkFBSyxFQUFFLENBQUM7WUFDWCxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLG1DQUEyQixDQUFDLENBQUM7WUFDcEUsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxhQUFhLEdBQUcsbUNBQW1DLENBQUM7Z0JBQzFELElBQUksV0FBVyxHQUFHLG1CQUFVLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQTJCLENBQUM7Z0JBQzlGLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDbEIsV0FBVyxHQUFHLElBQUEsdUJBQWlCLEdBQUUsQ0FBQztvQkFDbEMsV0FBVyxDQUFDLElBQUksR0FBRyxhQUFhLENBQUM7b0JBQ2pDLFdBQVcsQ0FBQyxFQUFFLEdBQUcsYUFBYSxDQUFDO2dCQUNoQyxDQUFDO2dCQUVELFdBQVcsQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2xELENBQUM7UUFDRixDQUFDO1FBRUQsMkVBQTJFO1FBQzNFLHlFQUF5RTtRQUN6RSxtREFBbUQ7UUFDbkQsSUFBSSxrQkFBUSxFQUFFLENBQUM7WUFDZCxTQUFTLENBQUMsT0FBTyxDQUFDOzs7Ozs7OztHQVFqQixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsZ0dBQWdHO1FBQ2hHLElBQUksZ0JBQUssSUFBSSxJQUFBLHNCQUFZLEdBQUUsRUFBRSxDQUFDO1lBQzdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLG1CQUFtQixLQUFLLENBQUMsQ0FBQztRQUN6RSxDQUFDO0lBQ0YsQ0FBQyxDQUFDLENBQUM7SUFFSDs7Ozs7OztPQU9HO0lBQ1UsUUFBQSxtQkFBbUIsR0FBRyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLENBQUMsc0JBQVcsQ0FBQyxDQUFDLENBQUMsK0NBQStDLENBQUMsQ0FBQyxDQUFDLCtDQUErQyxDQUFDIn0=
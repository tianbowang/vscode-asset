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
define(["require", "exports", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/debug/common/debug", "vs/platform/workspace/common/workspace", "vs/workbench/common/theme", "vs/base/common/lifecycle", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/configuration/common/configuration", "vs/platform/layout/browser/layoutService"], function (require, exports, nls_1, colorRegistry_1, debug_1, workspace_1, theme_1, lifecycle_1, statusbar_1, configuration_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isStatusbarInDebugMode = exports.StatusBarColorProvider = exports.COMMAND_CENTER_DEBUGGING_BACKGROUND = exports.STATUS_BAR_DEBUGGING_BORDER = exports.STATUS_BAR_DEBUGGING_FOREGROUND = exports.STATUS_BAR_DEBUGGING_BACKGROUND = void 0;
    // colors for theming
    exports.STATUS_BAR_DEBUGGING_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBar.debuggingBackground', {
        dark: '#CC6633',
        light: '#CC6633',
        hcDark: '#BA592C',
        hcLight: '#B5200D'
    }, (0, nls_1.localize)('statusBarDebuggingBackground', "Status bar background color when a program is being debugged. The status bar is shown in the bottom of the window"));
    exports.STATUS_BAR_DEBUGGING_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBar.debuggingForeground', {
        dark: theme_1.STATUS_BAR_FOREGROUND,
        light: theme_1.STATUS_BAR_FOREGROUND,
        hcDark: theme_1.STATUS_BAR_FOREGROUND,
        hcLight: '#FFFFFF'
    }, (0, nls_1.localize)('statusBarDebuggingForeground', "Status bar foreground color when a program is being debugged. The status bar is shown in the bottom of the window"));
    exports.STATUS_BAR_DEBUGGING_BORDER = (0, colorRegistry_1.registerColor)('statusBar.debuggingBorder', {
        dark: theme_1.STATUS_BAR_BORDER,
        light: theme_1.STATUS_BAR_BORDER,
        hcDark: theme_1.STATUS_BAR_BORDER,
        hcLight: theme_1.STATUS_BAR_BORDER
    }, (0, nls_1.localize)('statusBarDebuggingBorder', "Status bar border color separating to the sidebar and editor when a program is being debugged. The status bar is shown in the bottom of the window"));
    exports.COMMAND_CENTER_DEBUGGING_BACKGROUND = (0, colorRegistry_1.registerColor)('commandCenter.debuggingBackground', {
        dark: { value: exports.STATUS_BAR_DEBUGGING_BACKGROUND, op: 2 /* ColorTransformType.Transparent */, factor: 0.258 },
        hcDark: { value: exports.STATUS_BAR_DEBUGGING_BACKGROUND, op: 2 /* ColorTransformType.Transparent */, factor: 0.258 },
        light: { value: exports.STATUS_BAR_DEBUGGING_BACKGROUND, op: 2 /* ColorTransformType.Transparent */, factor: 0.258 },
        hcLight: { value: exports.STATUS_BAR_DEBUGGING_BACKGROUND, op: 2 /* ColorTransformType.Transparent */, factor: 0.258 }
    }, (0, nls_1.localize)('commandCenter-activeBackground', "Command center background color when a program is being debugged"), true);
    let StatusBarColorProvider = class StatusBarColorProvider {
        set enabled(enabled) {
            if (enabled === !!this.disposable) {
                return;
            }
            if (enabled) {
                this.disposable = this.statusbarService.overrideStyle({
                    priority: 10,
                    foreground: exports.STATUS_BAR_DEBUGGING_FOREGROUND,
                    background: exports.STATUS_BAR_DEBUGGING_BACKGROUND,
                    border: exports.STATUS_BAR_DEBUGGING_BORDER,
                });
            }
            else {
                this.disposable.dispose();
                this.disposable = undefined;
            }
        }
        constructor(debugService, contextService, statusbarService, layoutService, configurationService) {
            this.debugService = debugService;
            this.contextService = contextService;
            this.statusbarService = statusbarService;
            this.layoutService = layoutService;
            this.configurationService = configurationService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.debugService.onDidChangeState(this.update, this, this.disposables);
            this.contextService.onDidChangeWorkbenchState(this.update, this, this.disposables);
            this.configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('debug.enableStatusBarColor') || e.affectsConfiguration('debug.toolBarLocation')) {
                    this.update();
                }
            });
            this.update();
        }
        update() {
            const debugConfig = this.configurationService.getValue('debug');
            const isInDebugMode = isStatusbarInDebugMode(this.debugService.state, this.debugService.getModel().getSessions());
            if (!debugConfig.enableStatusBarColor) {
                this.enabled = false;
            }
            else {
                this.enabled = isInDebugMode;
            }
            const isInCommandCenter = debugConfig.toolBarLocation === 'commandCenter';
            this.layoutService.mainContainer.style.setProperty((0, colorRegistry_1.asCssVariableName)(theme_1.COMMAND_CENTER_BACKGROUND), isInCommandCenter && isInDebugMode
                ? (0, colorRegistry_1.asCssVariable)(exports.COMMAND_CENTER_DEBUGGING_BACKGROUND)
                : '');
        }
        dispose() {
            this.disposable?.dispose();
            this.disposables.dispose();
        }
    };
    exports.StatusBarColorProvider = StatusBarColorProvider;
    exports.StatusBarColorProvider = StatusBarColorProvider = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, statusbar_1.IStatusbarService),
        __param(3, layoutService_1.ILayoutService),
        __param(4, configuration_1.IConfigurationService)
    ], StatusBarColorProvider);
    function isStatusbarInDebugMode(state, sessions) {
        if (state === 0 /* State.Inactive */ || state === 1 /* State.Initializing */ || sessions.every(s => s.suppressDebugStatusbar || s.configuration?.noDebug)) {
            return false;
        }
        return true;
    }
    exports.isStatusbarInDebugMode = isStatusbarInDebugMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFyQ29sb3JQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9zdGF0dXNiYXJDb2xvclByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWNoRyxxQkFBcUI7SUFFUixRQUFBLCtCQUErQixHQUFHLElBQUEsNkJBQWEsRUFBQywrQkFBK0IsRUFBRTtRQUM3RixJQUFJLEVBQUUsU0FBUztRQUNmLEtBQUssRUFBRSxTQUFTO1FBQ2hCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE9BQU8sRUFBRSxTQUFTO0tBQ2xCLEVBQUUsSUFBQSxjQUFRLEVBQUMsOEJBQThCLEVBQUUsbUhBQW1ILENBQUMsQ0FBQyxDQUFDO0lBRXJKLFFBQUEsK0JBQStCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLCtCQUErQixFQUFFO1FBQzdGLElBQUksRUFBRSw2QkFBcUI7UUFDM0IsS0FBSyxFQUFFLDZCQUFxQjtRQUM1QixNQUFNLEVBQUUsNkJBQXFCO1FBQzdCLE9BQU8sRUFBRSxTQUFTO0tBQ2xCLEVBQUUsSUFBQSxjQUFRLEVBQUMsOEJBQThCLEVBQUUsbUhBQW1ILENBQUMsQ0FBQyxDQUFDO0lBRXJKLFFBQUEsMkJBQTJCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLDJCQUEyQixFQUFFO1FBQ3JGLElBQUksRUFBRSx5QkFBaUI7UUFDdkIsS0FBSyxFQUFFLHlCQUFpQjtRQUN4QixNQUFNLEVBQUUseUJBQWlCO1FBQ3pCLE9BQU8sRUFBRSx5QkFBaUI7S0FDMUIsRUFBRSxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSxvSkFBb0osQ0FBQyxDQUFDLENBQUM7SUFFbEwsUUFBQSxtQ0FBbUMsR0FBRyxJQUFBLDZCQUFhLEVBQy9ELG1DQUFtQyxFQUNuQztRQUNDLElB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
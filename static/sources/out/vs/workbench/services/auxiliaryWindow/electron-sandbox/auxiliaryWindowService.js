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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService", "vs/platform/configuration/common/configuration", "vs/platform/native/common/native", "vs/platform/dialogs/common/dialogs", "vs/base/common/performance", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/common/environment", "vs/workbench/services/host/browser/host", "vs/platform/window/electron-sandbox/window", "vs/base/browser/browser", "vs/base/browser/dom"], function (require, exports, extensions_1, layoutService_1, auxiliaryWindowService_1, configuration_1, native_1, dialogs_1, performance_1, instantiation_1, telemetry_1, environment_1, host_1, window_1, browser_1, dom_1) {
    "use strict";
    var NativeAuxiliaryWindow_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeAuxiliaryWindowService = exports.NativeAuxiliaryWindow = void 0;
    let NativeAuxiliaryWindow = NativeAuxiliaryWindow_1 = class NativeAuxiliaryWindow extends auxiliaryWindowService_1.AuxiliaryWindow {
        constructor(window, container, stylesHaveLoaded, configurationService, nativeHostService, instantiationService, hostService) {
            super(window, container, stylesHaveLoaded, configurationService, hostService);
            this.nativeHostService = nativeHostService;
            this.instantiationService = instantiationService;
            this.skipUnloadConfirmation = false;
        }
        async confirmBeforeClose(e) {
            if (this.skipUnloadConfirmation) {
                return;
            }
            e.preventDefault();
            e.returnValue = true;
            const confirmed = await this.instantiationService.invokeFunction(accessor => NativeAuxiliaryWindow_1.confirmOnShutdown(accessor, 1 /* ShutdownReason.CLOSE */));
            if (confirmed) {
                this.skipUnloadConfirmation = true;
                this.nativeHostService.closeWindow({ targetWindowId: this.window.vscodeWindowId });
            }
        }
    };
    exports.NativeAuxiliaryWindow = NativeAuxiliaryWindow;
    exports.NativeAuxiliaryWindow = NativeAuxiliaryWindow = NativeAuxiliaryWindow_1 = __decorate([
        __param(3, configuration_1.IConfigurationService),
        __param(4, native_1.INativeHostService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, host_1.IHostService)
    ], NativeAuxiliaryWindow);
    let NativeAuxiliaryWindowService = class NativeAuxiliaryWindowService extends auxiliaryWindowService_1.BrowserAuxiliaryWindowService {
        constructor(layoutService, configurationService, nativeHostService, dialogService, instantiationService, telemetryService, environmentService, hostService) {
            super(layoutService, dialogService, configurationService, telemetryService, hostService);
            this.nativeHostService = nativeHostService;
            this.instantiationService = instantiationService;
            this.environmentService = environmentService;
        }
        async resolveWindowId(auxiliaryWindow) {
            (0, performance_1.mark)('code/auxiliaryWindow/willResolveWindowId');
            const windowId = await auxiliaryWindow.vscode.ipcRenderer.invoke('vscode:registerAuxiliaryWindow', this.nativeHostService.windowId);
            (0, performance_1.mark)('code/auxiliaryWindow/didResolveWindowId');
            return windowId;
        }
        createContainer(auxiliaryWindow, disposables, options) {
            // Zoom level (either explicitly provided or inherited from main window)
            let windowZoomLevel;
            if (typeof options?.zoomLevel === 'number') {
                windowZoomLevel = options.zoomLevel;
            }
            else {
                windowZoomLevel = (0, browser_1.getZoomLevel)((0, dom_1.getActiveWindow)());
            }
            (0, window_1.applyZoom)(windowZoomLevel, auxiliaryWindow);
            return super.createContainer(auxiliaryWindow, disposables);
        }
        patchMethods(auxiliaryWindow) {
            super.patchMethods(auxiliaryWindow);
            // Enable `window.focus()` to work in Electron by
            // asking the main process to focus the window.
            // https://github.com/electron/electron/issues/25578
            const that = this;
            const originalWindowFocus = auxiliaryWindow.focus.bind(auxiliaryWindow);
            auxiliaryWindow.focus = function () {
                if (that.environmentService.extensionTestsLocationURI) {
                    return; // no focus when we are running tests from CLI
                }
                originalWindowFocus();
                if (!auxiliaryWindow.document.hasFocus()) {
                    that.nativeHostService.focusWindow({ targetWindowId: auxiliaryWindow.vscodeWindowId });
                }
            };
        }
        createAuxiliaryWindow(targetWindow, container, stylesHaveLoaded) {
            return new NativeAuxiliaryWindow(targetWindow, container, stylesHaveLoaded, this.configurationService, this.nativeHostService, this.instantiationService, this.hostService);
        }
    };
    exports.NativeAuxiliaryWindowService = NativeAuxiliaryWindowService;
    exports.NativeAuxiliaryWindowService = NativeAuxiliaryWindowService = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, native_1.INativeHostService),
        __param(3, dialogs_1.IDialogService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, environment_1.IEnvironmentService),
        __param(7, host_1.IHostService)
    ], NativeAuxiliaryWindowService);
    (0, extensions_1.registerSingleton)(auxiliaryWindowService_1.IAuxiliaryWindowService, NativeAuxiliaryWindowService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV4aWxpYXJ5V2luZG93U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2F1eGlsaWFyeVdpbmRvdy9lbGVjdHJvbi1zYW5kYm94L2F1eGlsaWFyeVdpbmRvd1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBCekYsSUFBTSxxQkFBcUIsNkJBQTNCLE1BQU0scUJBQXNCLFNBQVEsd0NBQWU7UUFJekQsWUFDQyxNQUFrQixFQUNsQixTQUFzQixFQUN0QixnQkFBeUIsRUFDRixvQkFBMkMsRUFDOUMsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUNyRSxXQUF5QjtZQUV2QyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUp6QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ2xDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFSNUUsMkJBQXNCLEdBQUcsS0FBSyxDQUFDO1FBWXZDLENBQUM7UUFFa0IsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQW9CO1lBQy9ELElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0JBQ2pDLE9BQU87WUFDUixDQUFDO1lBRUQsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBRXJCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHVCQUFxQixDQUFDLGlCQUFpQixDQUFDLFFBQVEsK0JBQXVCLENBQUMsQ0FBQztZQUN0SixJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUNmLElBQUksQ0FBQyxzQkFB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
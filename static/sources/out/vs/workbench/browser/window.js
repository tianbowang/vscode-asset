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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/deviceAccess", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/host/browser/host", "vs/workbench/services/driver/browser/driver", "vs/base/browser/window", "vs/base/common/functional", "vs/platform/configuration/common/configuration"], function (require, exports, browser_1, dom_1, event_1, deviceAccess_1, async_1, event_2, lifecycle_1, network_1, platform_1, severity_1, uri_1, nls_1, commands_1, dialogs_1, instantiation_1, label_1, opener_1, productService_1, environmentService_1, layoutService_1, lifecycle_2, host_1, driver_1, window_1, functional_1, configuration_1) {
    "use strict";
    var BaseWindow_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserWindow = exports.BaseWindow = void 0;
    let BaseWindow = class BaseWindow extends lifecycle_1.Disposable {
        static { BaseWindow_1 = this; }
        static { this.TIMEOUT_HANDLES = Number.MIN_SAFE_INTEGER; } // try to not compete with the IDs of native `setTimeout`
        static { this.TIMEOUT_DISPOSABLES = new Map(); }
        constructor(targetWindow, dom = { getWindowsCount: dom_1.getWindowsCount, getWindows: dom_1.getWindows }, hostService) {
            super();
            this.hostService = hostService;
            this.enableWindowFocusOnElementFocus(targetWindow);
            this.enableMultiWindowAwareTimeout(targetWindow, dom);
            this.registerFullScreenListeners(targetWindow.vscodeWindowId);
        }
        //#region focus handling in multi-window applications
        enableWindowFocusOnElementFocus(targetWindow) {
            const originalFocus = HTMLElement.prototype.focus;
            targetWindow.HTMLElement.prototype.focus = function (options) {
                // If the active focused window is not the same as the
                // window of the element to focus, make sure to focus
                // that window first before focusing the element.
                const activeWindow = (0, dom_1.getActiveWindow)();
                if (activeWindow.document.hasFocus()) {
                    const elementWindow = (0, dom_1.getWindow)(this);
                    if (activeWindow !== elementWindow) {
                        elementWindow.focus();
                    }
                }
                // Pass to original focus() method
                originalFocus.apply(this, [options]);
            };
        }
        //#endregion
        //#region timeout handling in multi-window applications
        enableMultiWindowAwareTimeout(targetWindow, dom = { getWindowsCount: dom_1.getWindowsCount, getWindows: dom_1.getWindows }) {
            // Override `setTimeout` and `clearTimeout` on the provided window to make
            // sure timeouts are dispatched to all opened windows. Some browsers may decide
            // to throttle timeouts in minimized windows, so with this we can ensure the
            // timeout is scheduled without being throttled (unless all windows are minimized).
            const originalSetTimeout = targetWindow.setTimeout;
            Object.defineProperty(targetWindow, 'vscodeOriginalSetTimeout', { get: () => originalSetTimeout });
            const originalClearTimeout = targetWindow.clearTimeout;
            Object.defineProperty(targetWindow, 'vscodeOriginalClearTimeout', { get: () => originalClearTimeout });
            targetWindow.setTimeout = function (handler, timeout = 0, ...args) {
                if (dom.getWindowsCount() === 1 || typeof handler === 'string' || timeout === 0 /* immediates are never throttled */) {
                    return originalSetTimeout.apply(this, [handler, timeout, ...args]);
                }
                const timeoutDisposables = new Set();
                const timeoutHandle = BaseWindow_1.TIMEOUT_HANDLES++;
                BaseWindow_1.TIMEOUT_DISPOSABLES.set(timeoutHandle, timeoutDisposables);
                const handlerFn = (0, functional_1.createSingleCallFunction)(handler, () => {
                    (0, lifecycle_1.dispose)(timeoutDisposables);
                    BaseWindow_1.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
                });
                for (const { window, disposables } of dom.getWindows()) {
                    if ((0, window_1.isAuxiliaryWindow)(window) && window.document.visibilityState === 'hidden') {
                        continue; // skip over hidden windows (but never over main window)
                    }
                    const handle = window.vscodeOriginalSetTimeout.apply(this, [handlerFn, timeout, ...args]);
                    const timeoutDisposable = (0, lifecycle_1.toDisposable)(() => {
                        window.vscodeOriginalClearTimeout(handle);
                        timeoutDisposables.delete(timeoutDisposable);
                    });
                    disposables.add(timeoutDisposable);
                    timeoutDisposables.add(timeoutDisposable);
                }
                return timeoutHandle;
            };
            targetWindow.clearTimeout = function (timeoutHandle) {
                const timeoutDisposables = typeof timeoutHandle === 'number' ? BaseWindow_1.TIMEOUT_DISPOSABLES.get(timeoutHandle) : undefined;
                if (timeoutDisposables) {
                    (0, lifecycle_1.dispose)(timeoutDisposables);
                    BaseWindow_1.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
                }
                else {
                    originalClearTimeout.apply(this, [timeoutHandle]);
                }
            };
        }
        //#endregion
        registerFullScreenListeners(targetWindowId) {
            this._register(this.hostService.onDidChangeFullScreen(({ windowId, fullscreen }) => {
                if (windowId === targetWindowId) {
                    const targetWindow = (0, dom_1.getWindowById)(targetWindowId);
                    if (targetWindow) {
                        (0, browser_1.setFullscreen)(fullscreen, targetWindow.window);
                    }
                }
            }));
        }
        //#region Confirm on Shutdown
        static async confirmOnShutdown(accessor, reason) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const message = reason === 2 /* ShutdownReason.QUIT */ ?
                (platform_1.isMacintosh ? (0, nls_1.localize)('quitMessageMac', "Are you sure you want to quit?") : (0, nls_1.localize)('quitMessage', "Are you sure you want to exit?")) :
                (0, nls_1.localize)('closeWindowMessage', "Are you sure you want to close the window?");
            const primaryButton = reason === 2 /* ShutdownReason.QUIT */ ?
                (platform_1.isMacintosh ? (0, nls_1.localize)({ key: 'quitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Quit") : (0, nls_1.localize)({ key: 'exitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Exit")) :
                (0, nls_1.localize)({ key: 'closeWindowButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Close Window");
            const res = await dialogService.confirm({
                message,
                primaryButton,
                checkbox: {
                    label: (0, nls_1.localize)('doNotAskAgain', "Do not ask me again")
                }
            });
            // Update setting if checkbox checked
            if (res.confirmed && res.checkboxChecked) {
                await configurationService.updateValue('window.confirmBeforeClose', 'never');
            }
            return res.confirmed;
        }
    };
    exports.BaseWindow = BaseWindow;
    exports.BaseWindow = BaseWindow = BaseWindow_1 = __decorate([
        __param(2, host_1.IHostService)
    ], BaseWindow);
    let BrowserWindow = class BrowserWindow extends BaseWindow {
        constructor(openerService, lifecycleService, dialogService, labelService, productService, environmentService, layoutService, instantiationService, hostService) {
            super(window_1.mainWindow, undefined, hostService);
            this.openerService = openerService;
            this.lifecycleService = lifecycleService;
            this.dialogService = dialogService;
            this.labelService = labelService;
            this.productService = productService;
            this.environmentService = environmentService;
            this.layoutService = layoutService;
            this.instantiationService = instantiationService;
            this.registerListeners();
            this.create();
        }
        registerListeners() {
            // Lifecycle
            this._register(this.lifecycleService.onWillShutdown(() => this.onWillShutdown()));
            // Layout
            const viewport = platform_1.isIOS && window_1.mainWindow.visualViewport ? window_1.mainWindow.visualViewport /** Visual viewport */ : window_1.mainWindow /** Layout viewport */;
            this._register((0, dom_1.addDisposableListener)(viewport, dom_1.EventType.RESIZE, () => {
                this.layoutService.layout();
                // Sometimes the keyboard appearing scrolls the whole workbench out of view, as a workaround scroll back into view #121206
                if (platform_1.isIOS) {
                    window_1.mainWindow.scrollTo(0, 0);
                }
            }));
            // Prevent the back/forward gestures in macOS
            this._register((0, dom_1.addDisposableListener)(this.layoutService.mainContainer, dom_1.EventType.WHEEL, e => e.preventDefault(), { passive: false }));
            // Prevent native context menus in web
            this._register((0, dom_1.addDisposableListener)(this.layoutService.mainContainer, dom_1.EventType.CONTEXT_MENU, e => dom_1.EventHelper.stop(e, true)));
            // Prevent default navigation on drop
            this._register((0, dom_1.addDisposableListener)(this.layoutService.mainContainer, dom_1.EventType.DROP, e => dom_1.EventHelper.stop(e, true)));
        }
        onWillShutdown() {
            // Try to detect some user interaction with the workbench
            // when shutdown has happened to not show the dialog e.g.
            // when navigation takes a longer time.
            event_2.Event.toPromise(event_2.Event.any(event_2.Event.once(new event_1.DomEmitter(window_1.mainWindow.document.body, dom_1.EventType.KEY_DOWN, true).event), event_2.Event.once(new event_1.DomEmitter(window_1.mainWindow.document.body, dom_1.EventType.MOUSE_DOWN, true).event))).then(async () => {
                // Delay the dialog in case the user interacted
                // with the page before it transitioned away
                await (0, async_1.timeout)(3000);
                // This should normally not happen, but if for some reason
                // the workbench was shutdown while the page is still there,
                // inform the user that only a reload can bring back a working
                // state.
                await this.dialogService.prompt({
                    type: severity_1.default.Error,
                    message: (0, nls_1.localize)('shutdownError', "An unexpected error occurred that requires a reload of this page."),
                    detail: (0, nls_1.localize)('shutdownErrorDetail', "The workbench was unexpectedly disposed while running."),
                    buttons: [
                        {
                            label: (0, nls_1.localize)({ key: 'reload', comment: ['&& denotes a mnemonic'] }, "&&Reload"),
                            run: () => window_1.mainWindow.location.reload() // do not use any services at this point since they are likely not functional at this point
                        }
                    ]
                });
            });
        }
        create() {
            // Handle open calls
            this.setupOpenHandlers();
            // Label formatting
            this.registerLabelFormatters();
            // Commands
            this.registerCommands();
            // Smoke Test Driver
            this.setupDriver();
        }
        setupDriver() {
            if (this.environmentService.enableSmokeTestDriver) {
                (0, driver_1.registerWindowDriver)(this.instantiationService);
            }
        }
        setupOpenHandlers() {
            // We need to ignore the `beforeunload` event while
            // we handle external links to open specifically for
            // the case of application protocols that e.g. invoke
            // vscode itself. We do not want to open these links
            // in a new window because that would leave a blank
            // window to the user, but using `window.location.href`
            // will trigger the `beforeunload`.
            this.openerService.setDefaultExternalOpener({
                openExternal: async (href) => {
                    let isAllowedOpener = false;
                    if (this.environmentService.options?.openerAllowedExternalUrlPrefixes) {
                        for (const trustedPopupPrefix of this.environmentService.options.openerAllowedExternalUrlPrefixes) {
                            if (href.startsWith(trustedPopupPrefix)) {
                                isAllowedOpener = true;
                                break;
                            }
                        }
                    }
                    // HTTP(s): open in new window and deal with potential popup blockers
                    if ((0, network_1.matchesScheme)(href, network_1.Schemas.http) || (0, network_1.matchesScheme)(href, network_1.Schemas.https)) {
                        if (browser_1.isSafari) {
                            const opened = (0, dom_1.windowOpenWithSuccess)(href, !isAllowedOpener);
                            if (!opened) {
                                await this.dialogService.prompt({
                                    type: severity_1.default.Warning,
                                    message: (0, nls_1.localize)('unableToOpenExternal', "The browser interrupted the opening of a new tab or window. Press 'Open' to open it anyway."),
                                    detail: href,
                                    buttons: [
                                        {
                                            label: (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open"),
                                            run: () => isAllowedOpener ? (0, dom_1.windowOpenPopup)(href) : (0, dom_1.windowOpenNoOpener)(href)
                                        },
                                        {
                                            label: (0, nls_1.localize)({ key: 'learnMore', comment: ['&& denotes a mnemonic'] }, "&&Learn More"),
                                            run: () => this.openerService.open(uri_1.URI.parse('https://aka.ms/allow-vscode-popup'))
                                        }
                                    ],
                                    cancelButton: true
                                });
                            }
                        }
                        else {
                            isAllowedOpener
                                ? (0, dom_1.windowOpenPopup)(href)
                                : (0, dom_1.windowOpenNoOpener)(href);
                        }
                    }
                    // Anything else: set location to trigger protocol handler in the browser
                    // but make sure to signal this as an expected unload and disable unload
                    // handling explicitly to prevent the workbench from going down.
                    else {
                        const invokeProtocolHandler = () => {
                            this.lifecycleService.withExpectedShutdown({ disableShutdownHandling: true }, () => window_1.mainWindow.location.href = href);
                        };
                        invokeProtocolHandler();
                        const showProtocolUrlOpenedDialog = async () => {
                            const { downloadUrl } = this.productService;
                            let detail;
                            const buttons = [
                                {
                                    label: (0, nls_1.localize)({ key: 'openExternalDialogButtonRetry.v2', comment: ['&& denotes a mnemonic'] }, "&&Try Again"),
                                    run: () => invokeProtocolHandler()
                                }
                            ];
                            if (downloadUrl !== undefined) {
                                detail = (0, nls_1.localize)('openExternalDialogDetail.v2', "We launched {0} on your computer.\n\nIf {1} did not launch, try again or install it below.", this.productService.nameLong, this.productService.nameLong);
                                buttons.push({
                                    label: (0, nls_1.localize)({ key: 'openExternalDialogButtonInstall.v3', comment: ['&& denotes a mnemonic'] }, "&&Install"),
                                    run: async () => {
                                        await this.openerService.open(uri_1.URI.parse(downloadUrl));
                                        // Re-show the dialog so that the user can come back after installing and try again
                                        showProtocolUrlOpenedDialog();
                                    }
                                });
                            }
                            else {
                                detail = (0, nls_1.localize)('openExternalDialogDetailNoInstall', "We launched {0} on your computer.\n\nIf {1} did not launch, try again below.", this.productService.nameLong, this.productService.nameLong);
                            }
                            // While this dialog shows, closing the tab will not display a confirmation dialog
                            // to avoid showing the user two dialogs at once
                            await this.hostService.withExpectedShutdown(() => this.dialogService.prompt({
                                type: severity_1.default.Info,
                                message: (0, nls_1.localize)('openExternalDialogTitle', "All done. You can close this tab now."),
                                detail,
                                buttons,
                                cancelButton: true
                            }));
                        };
                        // We cannot know whether the protocol handler succeeded.
                        // Display guidance in case it did not, e.g. the app is not installed locally.
                        if ((0, network_1.matchesScheme)(href, this.productService.urlProtocol)) {
                            await showProtocolUrlOpenedDialog();
                        }
                    }
                    return true;
                }
            });
        }
        registerLabelFormatters() {
            this._register(this.labelService.registerFormatter({
                scheme: network_1.Schemas.vscodeUserData,
                priority: true,
                formatting: {
                    label: '(Settings) ${path}',
                    separator: '/',
                }
            }));
        }
        registerCommands() {
            // Allow extensions to request USB devices in Web
            commands_1.CommandsRegistry.registerCommand('workbench.experimental.requestUsbDevice', async (_accessor, options) => {
                return (0, deviceAccess_1.requestUsbDevice)(options);
            });
            // Allow extensions to request Serial devices in Web
            commands_1.CommandsRegistry.registerCommand('workbench.experimental.requestSerialPort', async (_accessor, options) => {
                return (0, deviceAccess_1.requestSerialPort)(options);
            });
            // Allow extensions to request HID devices in Web
            commands_1.CommandsRegistry.registerCommand('workbench.experimental.requestHidDevice', async (_accessor, options) => {
                return (0, deviceAccess_1.requestHidDevice)(options);
            });
        }
    };
    exports.BrowserWindow = BrowserWindow;
    exports.BrowserWindow = BrowserWindow = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, lifecycle_2.ILifecycleService),
        __param(2, dialogs_1.IDialogService),
        __param(3, label_1.ILabelService),
        __param(4, productService_1.IProductService),
        __param(5, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(6, layoutService_1.IWorkbenchLayoutService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, host_1.IHostService)
    ], BrowserWindow);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci93aW5kb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThCekYsSUFBZSxVQUFVLEdBQXpCLE1BQWUsVUFBVyxTQUFRLHNCQUFVOztpQkFFbkMsb0JBQWUsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLEFBQTFCLENBQTJCLEdBQUMseURBQXlEO2lCQUMzRix3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQUFBdEMsQ0FBdUM7UUFFbEYsWUFDQyxZQUF3QixFQUN4QixHQUFHLEdBQUcsRUFBRSxlQUFlLEVBQWYscUJBQWUsRUFBRSxVQUFVLEVBQVYsZ0JBQVUsRUFBRSxFQUNKLFdBQXlCO1lBRTFELEtBQUssRUFBRSxDQUFDO1lBRnlCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBSTFELElBQUksQ0FBQywrQkFBK0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsNkJBQTZCLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRXRELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELHFEQUFxRDtRQUUzQywrQkFBK0IsQ0FBQyxZQUF3QjtZQUNqRSxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUVsRCxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBNkIsT0FBa0M7Z0JBRXpHLHNEQUFzRDtnQkFDdEQscURBQXFEO2dCQUNyRCxpREFBaUQ7Z0JBQ2pELE1BQU0sWUFBWSxHQUFHLElBQUEscUJBQWUsR0FBRSxDQUFDO2dCQUN2QyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztvQkFDdEMsTUFBTSxhQUFhLEdBQUcsSUFBQSxlQUFTLEVBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3RDLElBQUksWUFBWSxLQUFLLGFBQWEsRUFBRSxDQUFDO3dCQUNwQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3ZCLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxrQ0FBa0M7Z0JBQ2xDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUM7UUFDSCxDQUFDO1FBRUQsWUFBWTtRQUVaLHVEQUF1RDtRQUUvQyw2QkFBNkIsQ0FBQyxZQUFvQixFQUFFLEdBQUcsR0FBRyxFQUFFLGVBQWUsRUFBZixxQkFBZSxFQUFFLFVBQVUsRUFBVixnQkFBVSxFQUFFO1lBRWhHLDBFQUEwRTtZQUMxRSwrRUFBK0U7WUFDL0UsNEVBQTRFO1lBQzVFLG1GQUFtRjtZQUVuRixNQUFNLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUM7WUFDbkQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsMEJBQTBCLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1lBRW5HLE1BQU0sb0JBQW9CLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQztZQUN2RCxNQUFNLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSw0QkFBNEIsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7WUFFdkcsWUFBWSxDQUFDLFVBQVUsR0FBRyxVQUF5QixPQUFxQixFQUFFLE9BQU8sR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFlO2dCQUN4RyxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsb0NBQW9DLEVBQUUsQ0FBQztvQkFDdEgsT0FBTyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BFLENBQUM7Z0JBRUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO2dCQUNsRCxNQUFNLGFBQWEsR0FBRyxZQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ25ELFlBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBRXRFLE1BQU0sU0FBUyxHQUFHLElBQUEscUNBQXdCLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDeEQsSUFBQSxtQkFBTyxFQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQzVCLFlBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3RELENBQUMsQ0FBQyxDQUFDO2dCQUVILEtBQUssTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQztvQkFDeEQsSUFBSSxJQUFBLDBCQUFpQixFQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxLQUFLLFFBQVEsRUFBRSxDQUFDO3dCQUMvRSxTQUFTLENBQUMsd0RBQXdEO29CQUNuRSxDQUFDO29CQUVELE1BQU0sTUFBTSxHQUFJLE1BQWMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRW5HLE1BQU0saUJBQWlCLEdBQUcsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTt3QkFDMUMsTUFBYyxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNuRCxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDOUMsQ0FBQyxDQUFDLENBQUM7b0JBRUgsV0FBVyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUNuQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDM0MsQ0FBQztnQkFFRCxPQUFPLGFBQWEsQ0FBQztZQUN0QixDQUFDLENBQUM7WUFFRixZQUFZLENBQUMsWUFBWSxHQUFHLFVBQXlCLGFBQWlDO2dCQUNyRixNQUFNLGtCQUFrQixHQUFHLE9BQU8sYUFBYSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBVSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM3SCxJQUFJLGtCQUFrQixFQUFFLENBQUM7b0JBQ3hCLElBQUEsbUJBQU8sRUFBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUM1QixZQUFVLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLGFBQWMsQ0FBQyxDQUFDO2dCQUN2RCxDQUFDO3FCQUFNLENBQUM7b0JBQ1Asb0JBQW9CLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELENBQUM7WUFDRixDQUFDLENBQUM7UUFDSCxDQUFDO1FBRUQsWUFBWTtRQUVKLDJCQUEyQixDQUFDLGNBQXNCO1lBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUU7Z0JBQ2xGLElBQUksUUFBUSxLQUFLLGNBQWMsRUFBRSxDQUFDO29CQUNqQyxNQUFNLFlBQVksR0FBRyxJQUFBLG1CQUFhLEVBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ25ELElBQUksWUFBWSxFQUFFLENBQUM7d0JBQ2xCLElBQUEsdUJBQWEsRUFBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNoRCxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELDZCQUE2QjtRQUU3QixNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQTBCLEVBQUUsTUFBc0I7WUFDaEYsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUM7WUFFakUsTUFBTSxPQUFPLEdBQUcsTUFBTSxnQ0FBd0IsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDLHNCQUFXLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUksSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsNENBQTRDLENBQUMsQ0FBQztZQUM5RSxNQUFNLGFBQWEsR0FBRyxNQUFNLGdDQUF3QixDQUFDLENBQUM7Z0JBQ3JELENBQUMsc0JBQVcsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6TCxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSx3QkFBd0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUVuRyxNQUFNLEdBQUcsR0FBRyxNQUFNLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3ZDLE9BQU87Z0JBQ1AsYUFBYTtnQkFDYixRQUFRLEVBQUU7b0JBQ1QsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQztpQkFDdkQ7YUFDRCxDQUFDLENBQUM7WUFFSCxxQ0FBcUM7WUFDckMsSUFBSSxHQUFHLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsMkJBQTJCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUUsQ0FBQztZQUVELE9BQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUN0QixDQUFDOztJQTlJb0IsZ0NBQVU7eUJBQVYsVUFBVTtRQVE3QixXQUFBLG1CQUFZLENBQUE7T0FSTyxVQUFVLENBaUovQjtJQUVNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxVQUFVO1FBRTVDLFlBQ2tDLGFBQTZCLEVBQzFCLGdCQUF5QyxFQUM1QyxhQUE2QixFQUM5QixZQUEyQixFQUN6QixjQUErQixFQUNYLGtCQUF1RCxFQUNuRSxhQUFzQyxFQUN4QyxvQkFBMkMsRUFDckUsV0FBeUI7WUFFdkMsS0FBSyxDQUFDLG1CQUFVLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBVlQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBeUI7WUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzlCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3pCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNYLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUM7WUFDbkUsa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBQ3hDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFLbkYsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QixZQUFZO1lBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbEYsU0FBUztZQUNULE1BQU0sUUFBUSxHQUFHLGdCQUFLLElBQUksbUJBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLG1CQUFVLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLHNCQUFzQixDQUFDO1lBQzNJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxRQUFRLEVBQUUsZUFBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQ3JFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBRTVCLDBIQUEwSDtnQkFDMUgsSUFBSSxnQkFBSyxFQUFFLENBQUM7b0JBQ1gsbUJBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLDZDQUE2QztZQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsZUFBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdEksc0NBQXNDO1lBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxlQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVoSSxxQ0FBcUM7WUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLGVBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pILENBQUM7UUFFTyxjQUFjO1lBRXJCLHlEQUF5RDtZQUN6RCx5REFBeUQ7WUFDekQsdUNBQXVDO1lBQ3ZDLGFBQUssQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLEdBQUcsQ0FDeEIsYUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLGtCQUFVLENBQUMsbUJBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGVBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQ3BGLGFBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxrQkFBVSxDQUFDLG1CQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxlQUFTLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUN0RixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUVsQiwrQ0FBK0M7Z0JBQy9DLDRDQUE0QztnQkFDNUMsTUFBTSxJQUFBLGVBQU8sRUFBQyxJQUFJLENBQUMsQ0FBQztnQkFFcEIsMERBQTBEO2dCQUMxRCw0REFBNEQ7Z0JBQzVELDhEQUE4RDtnQkFDOUQsU0FBUztnQkFDVCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO29CQUMvQixJQUFJLEVBQUUsa0JBQVEsQ0FBQyxLQUFLO29CQUNwQixPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLG1FQUFtRSxDQUFDO29CQUN2RyxNQUFNLEVBQUUsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUsd0RBQXdELENBQUM7b0JBQ2pHLE9BQU8sRUFBRTt3QkFDUjs0QkFDQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUM7NEJBQ2xGLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxtQkFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQywyRkFBMkY7eUJBQ25JO3FCQUNEO2lCQUNELENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLE1BQU07WUFFYixvQkFBb0I7WUFDcEIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFekIsbUJBQW1CO1lBQ25CLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBRS9CLFdBQVc7WUFDWCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUV4QixvQkFBb0I7WUFDcEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFFTyxXQUFXO1lBQ2xCLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ25ELElBQUEsNkJBQW9CLEVBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDakQsQ0FBQztRQUNGLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIsbURBQW1EO1lBQ25ELG9EQUFvRDtZQUNwRCxxREFBcUQ7WUFDckQsb0RBQW9EO1lBQ3BELG1EQUFtRDtZQUNuRCx1REFBdUQ7WUFDdkQsbUNBQW1DO1lBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUM7Z0JBQzNDLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBWSxFQUFFLEVBQUU7b0JBQ3BDLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztvQkFDNUIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLENBQUM7d0JBQ3ZFLEtBQUssTUFBTSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLGdDQUFnQyxFQUFFLENBQUM7NEJBQ25HLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7Z0NBQ3pDLGVBQWUsR0FBRyxJQUFJLENBQUM7Z0NBQ3ZCLE1BQU07NEJBQ1AsQ0FBQzt3QkFDRixDQUFDO29CQUNGLENBQUM7b0JBRUQscUVBQXFFO29CQUNyRSxJQUFJLElBQUEsdUJBQWEsRUFBQyxJQUFJLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFBLHVCQUFhLEVBQUMsSUFBSSxFQUFFLGlCQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDN0UsSUFBSSxrQkFBUSxFQUFFLENBQUM7NEJBQ2QsTUFBTSxNQUFNLEdBQUcsSUFBQSwyQkFBcUIsRUFBQyxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQzs0QkFDN0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dDQUNiLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7b0NBQy9CLElBQUksRUFBRSxrQkFBUSxDQUFDLE9BQU87b0NBQ3RCLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSw2RkFBNkYsQ0FBQztvQ0FDeEksTUFBTSxFQUFFLElBQUk7b0NBQ1osT0FBTyxFQUFFO3dDQUNSOzRDQUNDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQzs0Q0FDOUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBQSxxQkFBZSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLHdCQUFrQixFQUFDLElBQUksQ0FBQzt5Q0FDN0U7d0NBQ0Q7NENBQ0MsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDOzRDQUN6RixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO3lDQUNsRjtxQ0FDRDtvQ0FDRCxZQUFZLEVBQUUsSUFBSTtpQ0FDbEIsQ0FBQyxDQUFDOzRCQUNKLENBQUM7d0JBQ0YsQ0FBQzs2QkFBTSxDQUFDOzRCQUNQLGVBQWU7Z0NBQ2QsQ0FBQyxDQUFDLElBQUEscUJBQWUsRUFBQyxJQUFJLENBQUM7Z0NBQ3ZCLENBQUMsQ0FBQyxJQUFBLHdCQUFrQixFQUFDLElBQUksQ0FBQyxDQUFDO3dCQUM3QixDQUFDO29CQUNGLENBQUM7b0JBRUQseUVBQXlFO29CQUN6RSx3RUFBd0U7b0JBQ3hFLGdFQUFnRTt5QkFDM0QsQ0FBQzt3QkFDTCxNQUFNLHFCQUFxQixHQUFHLEdBQUcsRUFBRTs0QkFDbEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO3dCQUN0SCxDQUFDLENBQUM7d0JBRUYscUJBQXFCLEVBQUUsQ0FBQzt3QkFFeEIsTUFBTSwyQkFBMkIsR0FBRyxLQUFLLElBQUksRUFBRTs0QkFDOUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7NEJBQzVDLElBQUksTUFBYyxDQUFDOzRCQUVuQixNQUFNLE9BQU8sR0FBMEI7Z0NBQ3RDO29DQUNDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxrQ0FBa0MsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDO29DQUMvRyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUU7aUNBQ2xDOzZCQUNELENBQUM7NEJBRUYsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFLENBQUM7Z0NBQy9CLE1BQU0sR0FBRyxJQUFBLGNBQVEsRUFDaEIsNkJBQTZCLEVBQzdCLDRGQUE0RixFQUM1RixJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFDNUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQzVCLENBQUM7Z0NBRUYsT0FBTyxDQUFDLElBQUksQ0FBQztvQ0FDWixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsb0NBQW9DLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQztvQ0FDL0csR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFO3dDQUNmLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO3dDQUV0RCxtRkFBbUY7d0NBQ25GLDJCQUEyQixFQUFFLENBQUM7b0NBQy9CLENBQUM7aUNBQ0QsQ0FBQyxDQUFDOzRCQUNKLENBQUM7aUNBQU0sQ0FBQztnQ0FDUCxNQUFNLEdBQUcsSUFBQSxjQUFRLEVBQ2hCLG1DQUFtQyxFQUNuQyw4RUFBOEUsRUFDOUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUM1QixDQUFDOzRCQUNILENBQUM7NEJBRUQsa0ZBQWtGOzRCQUNsRixnREFBZ0Q7NEJBQ2hELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztnQ0FDM0UsSUFBSSxFQUFFLGtCQUFRLENBQUMsSUFBSTtnQ0FDbkIsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLHVDQUF1QyxDQUFDO2dDQUNyRixNQUFNO2dDQUNOLE9BQU87Z0NBQ1AsWUFBWSxFQUFFLElBQUk7NkJBQ2xCLENBQUMsQ0FBQyxDQUFDO3dCQUNMLENBQUMsQ0FBQzt3QkFFRix5REFBeUQ7d0JBQ3pELDhFQUE4RTt3QkFDOUUsSUFBSSxJQUFBLHVCQUFhLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQzs0QkFDMUQsTUFBTSwyQkFBMkIsRUFBRSxDQUFDO3dCQUNyQyxDQUFDO29CQUNGLENBQUM7b0JBRUQsT0FBTyxJQUFJLENBQUM7Z0JBQ2IsQ0FBQzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyx1QkFBdUI7WUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO2dCQUNsRCxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxjQUFjO2dCQUM5QixRQUFRLEVBQUUsSUFBSTtnQkFDZCxVQUFVLEVBQUU7b0JBQ1gsS0FBSyxFQUFFLG9CQUFvQjtvQkFDM0IsU0FBUyxFQUFFLEdBQUc7aUJBQ2Q7YUFDRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyxnQkFBZ0I7WUFFdkIsaURBQWlEO1lBQ2pELDJCQUFnQixDQUFDLGVBQWUsQ0FBQyx5Q0FBeUMsRUFBRSxLQUFLLEVBQUUsU0FBMkIsRUFBRSxPQUFpQyxFQUFzQyxFQUFFO2dCQUN4TCxPQUFPLElBQUEsK0JBQWdCLEVBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxvREFBb0Q7WUFDcEQsMkJBQWdCLENBQUMsZUFBZSxDQUFDLDBDQUEwQyxFQUFFLEtBQUssRUFBRSxTQUEyQixFQUFFLE9BQWlDLEVBQXVDLEVBQUU7Z0JBQzFMLE9BQU8sSUFBQSxnQ0FBaUIsRUFBQyxPQUFPLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUVILGlEQUFpRDtZQUNqRCwyQkFBZ0IsQ0FBQyxlQUFlLENBQUMseUNBQXlDLEVBQUUsS0FBSyxFQUFFLFNBQTJCLEVBQUUsT0FBaUMsRUFBc0MsRUFBRTtnQkFDeEwsT0FBTyxJQUFBLCtCQUFnQixFQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUE7SUF0UFksc0NBQWE7NEJBQWIsYUFBYTtRQUd2QixXQUFBLHVCQUFjLENBQUE7UUFDZCxXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsd0JBQWMsQ0FBQTtRQUNkLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsZ0NBQWUsQ0FBQTtRQUNmLFdBQUEsd0RBQW1DLENBQUE7UUFDbkMsV0FBQSx1Q0FBdUIsQ0FBQTtRQUN2QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsbUJBQVksQ0FBQTtPQVhGLGFBQWEsQ0FzUHpCIn0=
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
define(["require", "exports", "vs/nls", "vs/base/common/performance", "vs/base/common/event", "vs/base/browser/dom", "vs/base/browser/window", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/errors", "vs/base/common/platform", "vs/platform/window/common/window", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/workbench/browser/window", "vs/platform/configuration/common/configuration", "vs/platform/telemetry/common/telemetry", "vs/base/common/async", "vs/workbench/services/host/browser/host"], function (require, exports, nls_1, performance_1, event_1, dom_1, window_1, lifecycle_1, extensions_1, instantiation_1, layoutService_1, errors_1, platform_1, window_2, dialogs_1, severity_1, window_3, configuration_1, telemetry_1, async_1, host_1) {
    "use strict";
    var BrowserAuxiliaryWindowService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserAuxiliaryWindowService = exports.AuxiliaryWindow = exports.IAuxiliaryWindowService = void 0;
    exports.IAuxiliaryWindowService = (0, instantiation_1.createDecorator)('auxiliaryWindowService');
    let AuxiliaryWindow = class AuxiliaryWindow extends window_3.BaseWindow {
        constructor(window, container, stylesHaveLoaded, configurationService, hostService) {
            super(window, undefined, hostService);
            this.window = window;
            this.container = container;
            this.configurationService = configurationService;
            this._onDidLayout = this._register(new event_1.Emitter());
            this.onDidLayout = this._onDidLayout.event;
            this._onBeforeUnload = this._register(new event_1.Emitter());
            this.onBeforeUnload = this._onBeforeUnload.event;
            this._onUnload = this._register(new event_1.Emitter());
            this.onUnload = this._onUnload.event;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.whenStylesHaveLoaded = stylesHaveLoaded.wait().then(() => { });
            this.registerListeners();
        }
        registerListeners() {
            this._register((0, dom_1.addDisposableListener)(this.window, dom_1.EventType.BEFORE_UNLOAD, (e) => this.handleBeforeUnload(e)));
            this._register((0, dom_1.addDisposableListener)(this.window, dom_1.EventType.UNLOAD, () => this.handleUnload()));
            this._register((0, dom_1.addDisposableListener)(this.window, 'unhandledrejection', e => {
                (0, errors_1.onUnexpectedError)(e.reason);
                e.preventDefault();
            }));
            this._register((0, dom_1.addDisposableListener)(this.window, dom_1.EventType.RESIZE, () => this.layout()));
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.SCROLL, () => this.container.scrollTop = 0)); // Prevent container from scrolling (#55456)
            if (platform_1.isWeb) {
                this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.DROP, e => dom_1.EventHelper.stop(e, true))); // Prevent default navigation on drop
                this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.WHEEL, e => e.preventDefault(), { passive: false })); // Prevent the back/forward gestures in macOS
                this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.CONTEXT_MENU, e => dom_1.EventHelper.stop(e, true))); // Prevent native context menus in web
            }
            else {
                this._register((0, dom_1.addDisposableListener)(this.window.document.body, dom_1.EventType.DRAG_OVER, (e) => dom_1.EventHelper.stop(e))); // Prevent drag feedback on <body>
                this._register((0, dom_1.addDisposableListener)(this.window.document.body, dom_1.EventType.DROP, (e) => dom_1.EventHelper.stop(e))); // Prevent default navigation on drop
            }
        }
        handleBeforeUnload(e) {
            // Event
            this._onBeforeUnload.fire();
            // Check for confirm before close setting
            const confirmBeforeCloseSetting = this.configurationService.getValue('window.confirmBeforeClose');
            const confirmBeforeClose = confirmBeforeCloseSetting === 'always' || (confirmBeforeCloseSetting === 'keyboardOnly' && dom_1.ModifierKeyEmitter.getInstance().isModifierPressed);
            if (confirmBeforeClose) {
                this.confirmBeforeClose(e);
            }
        }
        confirmBeforeClose(e) {
            e.preventDefault();
            e.returnValue = (0, nls_1.localize)('lifecycleVeto', "Changes that you made may not be saved. Please check press 'Cancel' and try again.");
        }
        handleUnload() {
            // Event
            this._onUnload.fire();
        }
        layout() {
            const dimension = (0, dom_1.getClientArea)(this.window.document.body, this.container);
            (0, dom_1.position)(this.container, 0, 0, 0, 0, 'relative');
            (0, dom_1.size)(this.container, dimension.width, dimension.height);
            this._onDidLayout.fire(dimension);
        }
        dispose() {
            if (this._store.isDisposed) {
                return;
            }
            this._onWillDispose.fire();
            super.dispose();
        }
    };
    exports.AuxiliaryWindow = AuxiliaryWindow;
    exports.AuxiliaryWindow = AuxiliaryWindow = __decorate([
        __param(3, configuration_1.IConfigurationService),
        __param(4, host_1.IHostService)
    ], AuxiliaryWindow);
    let BrowserAuxiliaryWindowService = class BrowserAuxiliaryWindowService extends lifecycle_1.Disposable {
        static { BrowserAuxiliaryWindowService_1 = this; }
        static { this.DEFAULT_SIZE = { width: 800, height: 600 }; }
        static { this.WINDOW_IDS = (0, dom_1.getWindowId)(window_1.mainWindow) + 1; } // start from the main window ID + 1
        constructor(layoutService, dialogService, configurationService, telemetryService, hostService) {
            super();
            this.layoutService = layoutService;
            this.dialogService = dialogService;
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.hostService = hostService;
            this._onDidOpenAuxiliaryWindow = this._register(new event_1.Emitter());
            this.onDidOpenAuxiliaryWindow = this._onDidOpenAuxiliaryWindow.event;
            this.windows = new Map();
        }
        async open(options) {
            (0, performance_1.mark)('code/auxiliaryWindow/willOpen');
            const targetWindow = await this.openWindow(options);
            if (!targetWindow) {
                throw new Error((0, nls_1.localize)('unableToOpenWindowError', "Unable to open a new window."));
            }
            // Add a `vscodeWindowId` property to identify auxiliary windows
            const resolvedWindowId = await this.resolveWindowId(targetWindow);
            (0, window_1.ensureCodeWindow)(targetWindow, resolvedWindowId);
            const containerDisposables = new lifecycle_1.DisposableStore();
            const { container, stylesLoaded } = this.createContainer(targetWindow, containerDisposables, options);
            const auxiliaryWindow = this.createAuxiliaryWindow(targetWindow, container, stylesLoaded);
            const registryDisposables = new lifecycle_1.DisposableStore();
            this.windows.set(targetWindow.vscodeWindowId, auxiliaryWindow);
            registryDisposables.add((0, lifecycle_1.toDisposable)(() => this.windows.delete(targetWindow.vscodeWindowId)));
            const eventDisposables = new lifecycle_1.DisposableStore();
            event_1.Event.once(auxiliaryWindow.onWillDispose)(() => {
                targetWindow.close();
                containerDisposables.dispose();
                registryDisposables.dispose();
                eventDisposables.dispose();
            });
            registryDisposables.add((0, dom_1.registerWindow)(targetWindow));
            this._onDidOpenAuxiliaryWindow.fire({ window: auxiliaryWindow, disposables: eventDisposables });
            (0, performance_1.mark)('code/auxiliaryWindow/didOpen');
            this.telemetryService.publicLog2('auxiliaryWindowOpen', { bounds: !!options?.bounds });
            return auxiliaryWindow;
        }
        createAuxiliaryWindow(targetWindow, container, stylesLoaded) {
            return new AuxiliaryWindow(targetWindow, container, stylesLoaded, this.configurationService, this.hostService);
        }
        async openWindow(options) {
            const activeWindow = (0, dom_1.getActiveWindow)();
            const activeWindowBounds = {
                x: activeWindow.screenX,
                y: activeWindow.screenY,
                width: activeWindow.outerWidth,
                height: activeWindow.outerHeight
            };
            const width = Math.max(options?.bounds?.width ?? BrowserAuxiliaryWindowService_1.DEFAULT_SIZE.width, window_2.WindowMinimumSize.WIDTH);
            const height = Math.max(options?.bounds?.height ?? BrowserAuxiliaryWindowService_1.DEFAULT_SIZE.height, window_2.WindowMinimumSize.HEIGHT);
            let newWindowBounds = {
                x: options?.bounds?.x ?? Math.max(activeWindowBounds.x + activeWindowBounds.width / 2 - width / 2, 0),
                y: options?.bounds?.y ?? Math.max(activeWindowBounds.y + activeWindowBounds.height / 2 - height / 2, 0),
                width,
                height
            };
            if (newWindowBounds.x === activeWindowBounds.x && newWindowBounds.y === activeWindowBounds.y) {
                // Offset the new window a bit so that it does not overlap
                // with the active window
                newWindowBounds = {
                    ...newWindowBounds,
                    x: newWindowBounds.x + 30,
                    y: newWindowBounds.y + 30
                };
            }
            const auxiliaryWindow = window_1.mainWindow.open('about:blank', undefined, `popup=yes,left=${newWindowBounds.x},top=${newWindowBounds.y},width=${newWindowBounds.width},height=${newWindowBounds.height}`);
            if (!auxiliaryWindow && platform_1.isWeb) {
                return (await this.dialogService.prompt({
                    type: severity_1.default.Warning,
                    message: (0, nls_1.localize)('unableToOpenWindow', "The browser interrupted the opening of a new window. Press 'Retry' to try again."),
                    detail: (0, nls_1.localize)('unableToOpenWindowDetail', "To avoid this problem in the future, please ensure to allow popups for this website."),
                    buttons: [
                        {
                            label: (0, nls_1.localize)({ key: 'retry', comment: ['&& denotes a mnemonic'] }, "&&Retry"),
                            run: () => this.openWindow(options)
                        }
                    ],
                    cancelButton: true
                })).result;
            }
            return auxiliaryWindow?.window;
        }
        async resolveWindowId(auxiliaryWindow) {
            return BrowserAuxiliaryWindowService_1.WINDOW_IDS++;
        }
        createContainer(auxiliaryWindow, disposables, options) {
            this.patchMethods(auxiliaryWindow);
            this.applyMeta(auxiliaryWindow);
            const { stylesLoaded } = this.applyCSS(auxiliaryWindow, disposables);
            const container = this.applyHTML(auxiliaryWindow, disposables);
            return { stylesLoaded, container };
        }
        patchMethods(auxiliaryWindow) {
            // Disallow `createElement` because it would create
            // HTML Elements in the "wrong" context and break
            // code that does "instanceof HTMLElement" etc.
            auxiliaryWindow.document.createElement = function () {
                throw new Error('Not allowed to create elements in child window JavaScript context. Always use the main window so that "xyz instanceof HTMLElement" continues to work.');
            };
        }
        applyMeta(auxiliaryWindow) {
            for (const metaTag of ['meta[charset="utf-8"]', 'meta[http-equiv="Content-Security-Policy"]', 'meta[name="viewport"]', 'meta[name="theme-color"]']) {
                const metaElement = window_1.mainWindow.document.querySelector(metaTag);
                if (metaElement) {
                    const clonedMetaElement = (0, dom_1.createMetaElement)(auxiliaryWindow.document.head);
                    (0, dom_1.copyAttributes)(metaElement, clonedMetaElement);
                    if (metaTag === 'meta[http-equiv="Content-Security-Policy"]') {
                        const content = clonedMetaElement.getAttribute('content');
                        if (content) {
                            clonedMetaElement.setAttribute('content', content.replace(/(script-src[^\;]*)/, `script-src 'none'`));
                        }
                    }
                }
            }
            const originalIconLinkTag = window_1.mainWindow.document.querySelector('link[rel="icon"]');
            if (originalIconLinkTag) {
                const icon = (0, dom_1.createLinkElement)(auxiliaryWindow.document.head);
                (0, dom_1.copyAttributes)(originalIconLinkTag, icon);
            }
        }
        applyCSS(auxiliaryWindow, disposables) {
            (0, performance_1.mark)('code/auxiliaryWindow/willApplyCSS');
            const mapOriginalToClone = new Map();
            const stylesLoaded = new async_1.Barrier();
            stylesLoaded.wait().then(() => (0, performance_1.mark)('code/auxiliaryWindow/didLoadCSSStyles'));
            let pendingLinkSettles = 0;
            function onLinkSettled(_event) {
                // network errors from loading stylesheets will be written to the console
                // already, we probably don't need to log them manually.
                if (!--pendingLinkSettles) {
                    stylesLoaded.open();
                }
            }
            function cloneNode(originalNode) {
                if ((0, dom_1.isGlobalStylesheet)(originalNode)) {
                    return; // global stylesheets are handled by `cloneGlobalStylesheets` below
                }
                const clonedNode = auxiliaryWindow.document.head.appendChild(originalNode.cloneNode(true));
                if (originalNode.tagName === 'LINK') {
                    pendingLinkSettles++;
                    disposables.add((0, dom_1.addDisposableListener)(clonedNode, 'load', onLinkSettled));
                    disposables.add((0, dom_1.addDisposableListener)(clonedNode, 'error', onLinkSettled));
                }
                mapOriginalToClone.set(originalNode, clonedNode);
            }
            // Clone all style elements and stylesheet links from the window to the child window
            pendingLinkSettles++; // outer increment handles cases where there's nothing to load, and ensures it can't settle prematurely
            for (const originalNode of window_1.mainWindow.document.head.querySelectorAll('link[rel="stylesheet"], style')) {
                cloneNode(originalNode);
            }
            onLinkSettled();
            // Global stylesheets in <head> are cloned in a special way because the mutation
            // observer is not firing for changes done via `style.sheet` API. Only text changes
            // can be observed.
            disposables.add((0, dom_1.cloneGlobalStylesheets)(auxiliaryWindow));
            // Listen to new stylesheets as they are being added or removed in the main window
            // and apply to child window (including changes to existing stylesheets elements)
            disposables.add(dom_1.sharedMutationObserver.observe(window_1.mainWindow.document.head, disposables, { childList: true, subtree: true })(mutations => {
                for (const mutation of mutations) {
                    if (mutation.type !== 'childList' || // only interested in added/removed nodes
                        mutation.target.nodeName.toLowerCase() === 'title' || // skip over title changes that happen frequently
                        mutation.target.nodeName.toLowerCase() === 'script' || // block <script> changes that are unsupported anyway
                        mutation.target.nodeName.toLowerCase() === 'meta' // do not observe <meta> elements for now
                    ) {
                        continue;
                    }
                    for (const node of mutation.addedNodes) {
                        // <style>/<link> element was added
                        if (node instanceof HTMLElement && (node.tagName.toLowerCase() === 'style' || node.tagName.toLowerCase() === 'link')) {
                            cloneNode(node);
                        }
                        // text-node was changed, try to apply to our clones
                        else if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
                            const clonedNode = mapOriginalToClone.get(node.parentNode);
                            if (clonedNode) {
                                clonedNode.textContent = node.textContent;
                            }
                        }
                    }
                    for (const node of mutation.removedNodes) {
                        const clonedNode = mapOriginalToClone.get(node);
                        if (clonedNode) {
                            clonedNode.parentNode?.removeChild(clonedNode);
                            mapOriginalToClone.delete(node);
                        }
                    }
                }
            }));
            (0, performance_1.mark)('code/auxiliaryWindow/didApplyCSS');
            return { stylesLoaded };
        }
        applyHTML(auxiliaryWindow, disposables) {
            (0, performance_1.mark)('code/auxiliaryWindow/willApplyHTML');
            // Create workbench container and apply classes
            const container = document.createElement('div');
            auxiliaryWindow.document.body.append(container);
            // Track attributes
            disposables.add((0, dom_1.trackAttributes)(window_1.mainWindow.document.documentElement, auxiliaryWindow.document.documentElement));
            disposables.add((0, dom_1.trackAttributes)(window_1.mainWindow.document.body, auxiliaryWindow.document.body));
            disposables.add((0, dom_1.trackAttributes)(this.layoutService.mainContainer, container, ['class'])); // only class attribute
            (0, performance_1.mark)('code/auxiliaryWindow/didApplyHTML');
            return container;
        }
    };
    exports.BrowserAuxiliaryWindowService = BrowserAuxiliaryWindowService;
    exports.BrowserAuxiliaryWindowService = BrowserAuxiliaryWindowService = BrowserAuxiliaryWindowService_1 = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, dialogs_1.IDialogService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, host_1.IHostService)
    ], BrowserAuxiliaryWindowService);
    (0, extensions_1.registerSingleton)(exports.IAuxiliaryWindowService, BrowserAuxiliaryWindowService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV4aWxpYXJ5V2luZG93U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2F1eGlsaWFyeVdpbmRvdy9icm93c2VyL2F1eGlsaWFyeVdpbmRvd1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXNCbkYsUUFBQSx1QkFBdUIsR0FBRyxJQUFBLCtCQUFlLEVBQTBCLHdCQUF3QixDQUFDLENBQUM7SUFvQ25HLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsbUJBQVU7UUFnQjlDLFlBQ1UsTUFBa0IsRUFDbEIsU0FBc0IsRUFDL0IsZ0JBQXlCLEVBQ0Ysb0JBQTRELEVBQ3JFLFdBQXlCO1lBRXZDLEtBQUssQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBTjdCLFdBQU0sR0FBTixNQUFNLENBQVk7WUFDbEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUVTLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFsQm5FLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBYSxDQUFDLENBQUM7WUFDaEUsZ0JBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUU5QixvQkFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzlELG1CQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7WUFFcEMsY0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3hELGFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUV4QixtQkFBYyxHQUFHLElBQUksQ0FBQyxT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
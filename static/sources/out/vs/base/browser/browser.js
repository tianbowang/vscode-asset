/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/window", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, window_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isWCOEnabled = exports.isStandalone = exports.isAndroid = exports.isElectron = exports.isWebkitWebView = exports.isSafari = exports.isChrome = exports.isWebKit = exports.isFirefox = exports.onDidChangeFullscreen = exports.isFullscreen = exports.setFullscreen = exports.setZoomFactor = exports.getZoomFactor = exports.onDidChangeZoomLevel = exports.getZoomLevel = exports.setZoomLevel = exports.PixelRatio = exports.addMatchMediaChangeListener = void 0;
    class WindowManager {
        constructor() {
            // --- Zoom Level
            this.mapWindowIdToZoomLevel = new Map();
            this._onDidChangeZoomLevel = new event_1.Emitter();
            this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
            // --- Zoom Factor
            this.mapWindowIdToZoomFactor = new Map();
            // --- Fullscreen
            this._onDidChangeFullscreen = new event_1.Emitter();
            this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
            this.mapWindowIdToFullScreen = new Map();
        }
        static { this.INSTANCE = new WindowManager(); }
        getZoomLevel(targetWindow) {
            return this.mapWindowIdToZoomLevel.get(this.getWindowId(targetWindow)) ?? 0;
        }
        setZoomLevel(zoomLevel, targetWindow) {
            if (this.getZoomLevel(targetWindow) === zoomLevel) {
                return;
            }
            const targetWindowId = this.getWindowId(targetWindow);
            this.mapWindowIdToZoomLevel.set(targetWindowId, zoomLevel);
            this._onDidChangeZoomLevel.fire(targetWindowId);
        }
        getZoomFactor(targetWindow) {
            return this.mapWindowIdToZoomFactor.get(this.getWindowId(targetWindow)) ?? 1;
        }
        setZoomFactor(zoomFactor, targetWindow) {
            this.mapWindowIdToZoomFactor.set(this.getWindowId(targetWindow), zoomFactor);
        }
        setFullscreen(fullscreen, targetWindow) {
            if (this.isFullscreen(targetWindow) === fullscreen) {
                return;
            }
            const windowId = this.getWindowId(targetWindow);
            this.mapWindowIdToFullScreen.set(windowId, fullscreen);
            this._onDidChangeFullscreen.fire(windowId);
        }
        isFullscreen(targetWindow) {
            return !!this.mapWindowIdToFullScreen.get(this.getWindowId(targetWindow));
        }
        getWindowId(targetWindow) {
            return targetWindow.vscodeWindowId;
        }
    }
    /**
     * See https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes
     */
    class DevicePixelRatioMonitor extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._listener = () => this._handleChange(true);
            this._mediaQueryList = null;
            this._handleChange(false);
        }
        _handleChange(fireEvent) {
            this._mediaQueryList?.removeEventListener('change', this._listener);
            this._mediaQueryList = window_1.$window.matchMedia(`(resolution: ${window_1.$window.devicePixelRatio}dppx)`);
            this._mediaQueryList.addEventListener('change', this._listener);
            if (fireEvent) {
                this._onDidChange.fire();
            }
        }
    }
    class PixelRatioImpl extends lifecycle_1.Disposable {
        get value() {
            return this._value;
        }
        constructor() {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._value = this._getPixelRatio();
            const dprMonitor = this._register(new DevicePixelRatioMonitor());
            this._register(dprMonitor.onDidChange(() => {
                this._value = this._getPixelRatio();
                this._onDidChange.fire(this._value);
            }));
        }
        _getPixelRatio() {
            const ctx = document.createElement('canvas').getContext('2d');
            const dpr = window_1.$window.devicePixelRatio || 1;
            const bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
            return dpr / bsr;
        }
    }
    class PixelRatioFacade {
        constructor() {
            this._pixelRatioMonitor = null;
        }
        _getOrCreatePixelRatioMonitor() {
            if (!this._pixelRatioMonitor) {
                this._pixelRatioMonitor = (0, lifecycle_1.markAsSingleton)(new PixelRatioImpl());
            }
            return this._pixelRatioMonitor;
        }
        /**
         * Get the current value.
         */
        get value() {
            return this._getOrCreatePixelRatioMonitor().value;
        }
        /**
         * Listen for changes.
         */
        get onDidChange() {
            return this._getOrCreatePixelRatioMonitor().onDidChange;
        }
    }
    function addMatchMediaChangeListener(targetWindow, query, callback) {
        if (typeof query === 'string') {
            query = targetWindow.matchMedia(query);
        }
        query.addEventListener('change', callback);
    }
    exports.addMatchMediaChangeListener = addMatchMediaChangeListener;
    /**
     * Returns the pixel ratio.
     *
     * This is useful for rendering <canvas> elements at native screen resolution or for being used as
     * a cache key when storing font measurements. Fonts might render differently depending on resolution
     * and any measurements need to be discarded for example when a window is moved from a monitor to another.
     */
    exports.PixelRatio = new PixelRatioFacade();
    /** A zoom index, e.g. 1, 2, 3 */
    function setZoomLevel(zoomLevel, targetWindow) {
        WindowManager.INSTANCE.setZoomLevel(zoomLevel, targetWindow);
    }
    exports.setZoomLevel = setZoomLevel;
    function getZoomLevel(targetWindow) {
        return WindowManager.INSTANCE.getZoomLevel(targetWindow);
    }
    exports.getZoomLevel = getZoomLevel;
    exports.onDidChangeZoomLevel = WindowManager.INSTANCE.onDidChangeZoomLevel;
    /** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
    function getZoomFactor(targetWindow) {
        return WindowManager.INSTANCE.getZoomFactor(targetWindow);
    }
    exports.getZoomFactor = getZoomFactor;
    function setZoomFactor(zoomFactor, targetWindow) {
        WindowManager.INSTANCE.setZoomFactor(zoomFactor, targetWindow);
    }
    exports.setZoomFactor = setZoomFactor;
    function setFullscreen(fullscreen, targetWindow) {
        WindowManager.INSTANCE.setFullscreen(fullscreen, targetWindow);
    }
    exports.setFullscreen = setFullscreen;
    function isFullscreen(targetWindow) {
        return WindowManager.INSTANCE.isFullscreen(targetWindow);
    }
    exports.isFullscreen = isFullscreen;
    exports.onDidChangeFullscreen = WindowManager.INSTANCE.onDidChangeFullscreen;
    const userAgent = navigator.userAgent;
    exports.isFirefox = (userAgent.indexOf('Firefox') >= 0);
    exports.isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
    exports.isChrome = (userAgent.indexOf('Chrome') >= 0);
    exports.isSafari = (!exports.isChrome && (userAgent.indexOf('Safari') >= 0));
    exports.isWebkitWebView = (!exports.isChrome && !exports.isSafari && exports.isWebKit);
    exports.isElectron = (userAgent.indexOf('Electron/') >= 0);
    exports.isAndroid = (userAgent.indexOf('Android') >= 0);
    let standalone = false;
    if (typeof window_1.mainWindow.matchMedia === 'function') {
        const standaloneMatchMedia = window_1.mainWindow.matchMedia('(display-mode: standalone) or (display-mode: window-controls-overlay)');
        const fullScreenMatchMedia = window_1.mainWindow.matchMedia('(display-mode: fullscreen)');
        standalone = standaloneMatchMedia.matches;
        addMatchMediaChangeListener(window_1.mainWindow, standaloneMatchMedia, ({ matches }) => {
            // entering fullscreen would change standaloneMatchMedia.matches to false
            // if standalone is true (running as PWA) and entering fullscreen, skip this change
            if (standalone && fullScreenMatchMedia.matches) {
                return;
            }
            // otherwise update standalone (browser to PWA or PWA to browser)
            standalone = matches;
        });
    }
    function isStandalone() {
        return standalone;
    }
    exports.isStandalone = isStandalone;
    // Visible means that the feature is enabled, not necessarily being rendered
    // e.g. visible is true even in fullscreen mode where the controls are hidden
    // See docs at https://developer.mozilla.org/en-US/docs/Web/API/WindowControlsOverlay/visible
    function isWCOEnabled() {
        return navigator?.windowControlsOverlay?.visible;
    }
    exports.isWCOEnabled = isWCOEnabled;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2Jyb3dzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQU0sYUFBYTtRQUFuQjtZQUlDLGlCQUFpQjtZQUVBLDJCQUFzQixHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBRW5ELDBCQUFxQixHQUFHLElBQUksZUFBTyxFQUFVLENBQUM7WUFDdEQseUJBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztZQWVqRSxrQkFBa0I7WUFFRCw0QkFBdUIsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQVNyRSxpQkFBaUI7WUFFQSwyQkFBc0IsR0FBRyxJQUFJLGVBQU8sRUFBVSxDQUFDO1lBQ3ZELDBCQUFxQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFFbEQsNEJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFrQnZFLENBQUM7aUJBeERnQixhQUFRLEdBQUcsSUFBSSxhQUFhLEVBQUUsQUFBdEIsQ0FBdUI7UUFTL0MsWUFBWSxDQUFDLFlBQW9CO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFDRCxZQUFZLENBQUMsU0FBaUIsRUFBRSxZQUFvQjtZQUNuRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ25ELE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsc0JBQXNCLENB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
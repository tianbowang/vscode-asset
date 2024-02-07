/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/browser/dompurify/dompurify", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/hash", "vs/base/browser/window"], function (require, exports, browser, canIUse_1, keyboardEvent_1, mouseEvent_1, async_1, errors_1, event, dompurify, lifecycle_1, network_1, platform, uri_1, hash_1, window_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.trackAttributes = exports.copyAttributes = exports.h = exports.DragAndDropObserver = exports.getCookieValue = exports.ModifierKeyEmitter = exports.multibyteAwareBtoa = exports.safeInnerHtml = exports.basicMarkupHtmlTags = exports.hookDomPurifyHrefAndSrcSanitizer = exports.detectFullscreen = exports.DetectedFullscreenMode = exports.triggerUpload = exports.triggerDownload = exports.asCssValueWithDefault = exports.asCSSPropertyValue = exports.asCSSUrl = exports.animate = exports.windowOpenWithSuccess = exports.windowOpenPopup = exports.windowOpenNoOpener = exports.computeScreenAwareSize = exports.domContentLoaded = exports.finalHandler = exports.removeTabIndexAndUpdateFocus = exports.hide = exports.show = exports.setVisibility = exports.join = exports.$ = exports.Namespace = exports.reset = exports.prepend = exports.append = exports.after = exports.trackFocus = exports.restoreParentsScrollTop = exports.saveParentsScrollTop = exports.EventHelper = exports.isEventLike = exports.EventType = exports.isDragEvent = exports.isPointerEvent = exports.isKeyboardEvent = exports.isMouseEvent = exports.removeCSSRulesContainingSelector = exports.createCSSRule = exports.createLinkElement = exports.createMetaElement = exports.sharedMutationObserver = exports.cloneGlobalStylesheets = exports.createStyleSheet = exports.createStyleSheet2 = exports.isGlobalStylesheet = exports.focusWindow = exports.getActiveWindow = exports.getActiveDocument = exports.isActiveDocument = exports.isAncestorOfActiveElement = exports.isActiveElement = exports.getActiveElement = exports.getShadowRoot = exports.isInShadowDOM = exports.isShadowRoot = exports.hasParentWithClass = exports.findParentWithClass = exports.isAncestorUsingFlowTo = exports.setParentFlowTo = exports.isAncestor = exports.getLargestChildWidth = exports.getTotalHeight = exports.getContentHeight = exports.getTotalScrollWidth = exports.getContentWidth = exports.getTotalWidth = exports.getDomNodeZoomLevel = exports.getDomNodePagePosition = exports.position = exports.size = exports.getTopLeftOffset = exports.Dimension = exports.getClientArea = exports.getComputedStyle = exports.addDisposableThrottledListener = exports.modify = exports.measure = exports.WindowIntervalTimer = exports.disposableWindowInterval = exports.scheduleAtNextAnimationFrame = exports.runAtThisOrScheduleAtNextAnimationFrame = exports.WindowIdleValue = exports.runWhenWindowIdle = exports.addDisposableGenericMouseUpListener = exports.addDisposableGenericMouseMoveListener = exports.addDisposableGenericMouseDownListener = exports.addStandardDisposableGenericMouseUpListener = exports.addStandardDisposableGenericMouseDownListener = exports.addStandardDisposableListener = exports.addDisposableListener = exports.clearNode = exports.onDidUnregisterWindow = exports.onWillUnregisterWindow = exports.onDidRegisterWindow = exports.hasWindow = exports.getWindowById = exports.getWindowId = exports.getWindowsCount = exports.getWindows = exports.getDocument = exports.getWindow = exports.registerWindow = void 0;
    //# region Multi-Window Support Utilities
    _a = (function () {
        const windows = new Map();
        (0, window_1.ensureCodeWindow)(window_1.mainWindow, 1);
        windows.set(window_1.mainWindow.vscodeWindowId, { window: window_1.mainWindow, disposables: new lifecycle_1.DisposableStore() });
        const onDidRegisterWindow = new event.Emitter();
        const onDidUnregisterWindow = new event.Emitter();
        const onWillUnregisterWindow = new event.Emitter();
        return {
            onDidRegisterWindow: onDidRegisterWindow.event,
            onWillUnregisterWindow: onWillUnregisterWindow.event,
            onDidUnregisterWindow: onDidUnregisterWindow.event,
            registerWindow(window) {
                if (windows.has(window.vscodeWindowId)) {
                    return lifecycle_1.Disposable.None;
                }
                const disposables = new lifecycle_1.DisposableStore();
                const registeredWindow = {
                    window,
                    disposables: disposables.add(new lifecycle_1.DisposableStore())
                };
                windows.set(window.vscodeWindowId, registeredWindow);
                disposables.add((0, lifecycle_1.toDisposable)(() => {
                    windows.delete(window.vscodeWindowId);
                    onDidUnregisterWindow.fire(window);
                }));
                disposables.add(addDisposableListener(window, exports.EventType.BEFORE_UNLOAD, () => {
                    onWillUnregisterWindow.fire(window);
                }));
                onDidRegisterWindow.fire(registeredWindow);
                return disposables;
            },
            getWindows() {
                return windows.values();
            },
            getWindowsCount() {
                return windows.size;
            },
            getWindowId(targetWindow) {
                return targetWindow.vscodeWindowId;
            },
            hasWindow(windowId) {
                return windows.has(windowId);
            },
            getWindowById(windowId) {
                return windows.get(windowId);
            },
            getWindow(e) {
                const candidateNode = e;
                if (candidateNode?.ownerDocument?.defaultView) {
                    return candidateNode.ownerDocument.defaultView.window;
                }
                const candidateEvent = e;
                if (candidateEvent?.view) {
                    return candidateEvent.view.window;
                }
                return window_1.mainWindow;
            },
            getDocument(e) {
                const candidateNode = e;
                return (0, exports.getWindow)(candidateNode).document;
            }
        };
    })(), exports.registerWindow = _a.registerWindow, exports.getWindow = _a.getWindow, exports.getDocument = _a.getDocument, exports.getWindows = _a.getWindows, exports.getWindowsCount = _a.getWindowsCount, exports.getWindowId = _a.getWindowId, exports.getWindowById = _a.getWindowById, exports.hasWindow = _a.hasWindow, exports.onDidRegisterWindow = _a.onDidRegisterWindow, exports.onWillUnregisterWindow = _a.onWillUnregisterWindow, exports.onDidUnregisterWindow = _a.onDidUnregisterWindow;
    //#endregion
    function clearNode(node) {
        while (node.firstChild) {
            node.firstChild.remove();
        }
    }
    exports.clearNode = clearNode;
    class DomListener {
        constructor(node, type, handler, options) {
            this._node = node;
            this._type = type;
            this._handler = handler;
            this._options = (options || false);
            this._node.addEventListener(this._type, this._handler, this._options);
        }
        dispose() {
            if (!this._handler) {
                // Already disposed
                return;
            }
            this._node.removeEventListener(this._type, this._handler, this._options);
            // Prevent leakers from holding on to the dom or handler func
            this._node = null;
            this._handler = null;
        }
    }
    function addDisposableListener(node, type, handler, useCaptureOrOptions) {
        return new DomListener(node, type, handler, useCaptureOrOptions);
    }
    exports.addDisposableListener = addDisposableListener;
    function _wrapAsStandardMouseEvent(targetWindow, handler) {
        return function (e) {
            return handler(new mouseEvent_1.StandardMouseEvent(targetWindow, e));
        };
    }
    function _wrapAsStandardKeyboardEvent(handler) {
        return function (e) {
            return handler(new keyboardEvent_1.StandardKeyboardEvent(e));
        };
    }
    const addStandardDisposableListener = function addStandardDisposableListener(node, type, handler, useCapture) {
        let wrapHandler = handler;
        if (type === 'click' || type === 'mousedown') {
            wrapHandler = _wrapAsStandardMouseEvent((0, exports.getWindow)(node), handler);
        }
        else if (type === 'keydown' || type === 'keypress' || type === 'keyup') {
            wrapHandler = _wrapAsStandardKeyboardEvent(handler);
        }
        return addDisposableListener(node, type, wrapHandler, useCapture);
    };
    exports.addStandardDisposableListener = addStandardDisposableListener;
    const addStandardDisposableGenericMouseDownListener = function addStandardDisposableListener(node, handler, useCapture) {
        const wrapHandler = _wrapAsStandardMouseEvent((0, exports.getWindow)(node), handler);
        return addDisposableGenericMouseDownListener(node, wrapHandler, useCapture);
    };
    exports.addStandardDisposableGenericMouseDownListener = addStandardDisposableGenericMouseDownListener;
    const addStandardDisposableGenericMouseUpListener = function addStandardDisposableListener(node, handler, useCapture) {
        const wrapHandler = _wrapAsStandardMouseEvent((0, exports.getWindow)(node), handler);
        return addDisposableGenericMouseUpListener(node, wrapHandler, useCapture);
    };
    exports.addStandardDisposableGenericMouseUpListener = addStandardDisposableGenericMouseUpListener;
    function addDisposableGenericMouseDownListener(node, handler, useCapture) {
        return addDisposableListener(node, platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents ? exports.EventType.POINTER_DOWN : exports.EventType.MOUSE_DOWN, handler, useCapture);
    }
    exports.addDisposableGenericMouseDownListener = addDisposableGenericMouseDownListener;
    function addDisposableGenericMouseMoveListener(node, handler, useCapture) {
        return addDisposableListener(node, platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents ? exports.EventType.POINTER_MOVE : exports.EventType.MOUSE_MOVE, handler, useCapture);
    }
    exports.addDisposableGenericMouseMoveListener = addDisposableGenericMouseMoveListener;
    function addDisposableGenericMouseUpListener(node, handler, useCapture) {
        return addDisposableListener(node, platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents ? exports.EventType.POINTER_UP : exports.EventType.MOUSE_UP, handler, useCapture);
    }
    exports.addDisposableGenericMouseUpListener = addDisposableGenericMouseUpListener;
    /**
     * Execute the callback the next time the browser is idle, returning an
     * {@link IDisposable} that will cancel the callback when disposed. This wraps
     * [requestIdleCallback] so it will fallback to [setTimeout] if the environment
     * doesn't support it.
     *
     * @param targetWindow The window for which to run the idle callback
     * @param callback The callback to run when idle, this includes an
     * [IdleDeadline] that provides the time alloted for the idle callback by the
     * browser. Not respecting this deadline will result in a degraded user
     * experience.
     * @param timeout A timeout at which point to queue no longer wait for an idle
     * callback but queue it on the regular event loop (like setTimeout). Typically
     * this should not be used.
     *
     * [IdleDeadline]: https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline
     * [requestIdleCallback]: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
     * [setTimeout]: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
     */
    function runWhenWindowIdle(targetWindow, callback, timeout) {
        return (0, async_1._runWhenIdle)(targetWindow, callback, timeout);
    }
    exports.runWhenWindowIdle = runWhenWindowIdle;
    /**
     * An implementation of the "idle-until-urgent"-strategy as introduced
     * here: https://philipwalton.com/articles/idle-until-urgent/
     */
    class WindowIdleValue extends async_1.AbstractIdleValue {
        constructor(targetWindow, executor) {
            super(targetWindow, executor);
        }
    }
    exports.WindowIdleValue = WindowIdleValue;
    function disposableWindowInterval(targetWindow, handler, interval, iterations) {
        let iteration = 0;
        const timer = targetWindow.setInterval(() => {
            iteration++;
            if ((typeof iterations === 'number' && iteration >= iterations) || handler() === true) {
                disposable.dispose();
            }
        }, interval);
        const disposable = (0, lifecycle_1.toDisposable)(() => {
            targetWindow.clearInterval(timer);
        });
        return disposable;
    }
    exports.disposableWindowInterval = disposableWindowInterval;
    class WindowIntervalTimer extends async_1.IntervalTimer {
        /**
         *
         * @param node The optional node from which the target window is determined
         */
        constructor(node) {
            super();
            this.defaultTarget = node && (0, exports.getWindow)(node);
        }
        cancelAndSet(runner, interval, targetWindow) {
            return super.cancelAndSet(runner, interval, targetWindow ?? this.defaultTarget);
        }
    }
    exports.WindowIntervalTimer = WindowIntervalTimer;
    class AnimationFrameQueueItem {
        constructor(runner, priority = 0) {
            this._runner = runner;
            this.priority = priority;
            this._canceled = false;
        }
        dispose() {
            this._canceled = true;
        }
        execute() {
            if (this._canceled) {
                return;
            }
            try {
                this._runner();
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
        }
        // Sort by priority (largest to lowest)
        static sort(a, b) {
            return b.priority - a.priority;
        }
    }
    (function () {
        /**
         * The runners scheduled at the next animation frame
         */
        const NEXT_QUEUE = new Map();
        /**
         * The runners scheduled at the current animation frame
         */
        const CURRENT_QUEUE = new Map();
        /**
         * A flag to keep track if the native requestAnimationFrame was already called
         */
        const animFrameRequested = new Map();
        /**
         * A flag to indicate if currently handling a native requestAnimationFrame callback
         */
        const inAnimationFrameRunner = new Map();
        const animationFrameRunner = (targetWindowId) => {
            animFrameRequested.set(targetWindowId, false);
            const currentQueue = NEXT_QUEUE.get(targetWindowId) ?? [];
            CURRENT_QUEUE.set(targetWindowId, currentQueue);
            NEXT_QUEUE.set(targetWindowId, []);
            inAnimationFrameRunner.set(targetWindowId, true);
            while (currentQueue.length > 0) {
                currentQueue.sort(AnimationFrameQueueItem.sort);
                const top = currentQueue.shift();
                top.execute();
            }
            inAnimationFrameRunner.set(targetWindowId, false);
        };
        exports.scheduleAtNextAnimationFrame = (targetWindow, runner, priority = 0) => {
            const targetWindowId = (0, exports.getWindowId)(targetWindow);
            const item = new AnimationFrameQueueItem(runner, priority);
            let nextQueue = NEXT_QUEUE.get(targetWindowId);
            if (!nextQueue) {
                nextQueue = [];
                NEXT_QUEUE.set(targetWindowId, nextQueue);
            }
            nextQueue.push(item);
            if (!animFrameRequested.get(targetWindowId)) {
                animFrameRequested.set(targetWindowId, true);
                targetWindow.requestAnimationFrame(() => animationFrameRunner(targetWindowId));
            }
            return item;
        };
        exports.runAtThisOrScheduleAtNextAnimationFrame = (targetWindow, runner, priority) => {
            const targetWindowId = (0, exports.getWindowId)(targetWindow);
            if (inAnimationFrameRunner.get(targetWindowId)) {
                const item = new AnimationFrameQueueItem(runner, priority);
                let currentQueue = CURRENT_QUEUE.get(targetWindowId);
                if (!currentQueue) {
                    currentQueue = [];
                    CURRENT_QUEUE.set(targetWindowId, currentQueue);
                }
                currentQueue.push(item);
                return item;
            }
            else {
                return (0, exports.scheduleAtNextAnimationFrame)(targetWindow, runner, priority);
            }
        };
    })();
    function measure(targetWindow, callback) {
        return (0, exports.scheduleAtNextAnimationFrame)(targetWindow, callback, 10000 /* must be early */);
    }
    exports.measure = measure;
    function modify(targetWindow, callback) {
        return (0, exports.scheduleAtNextAnimationFrame)(targetWindow, callback, -10000 /* must be late */);
    }
    exports.modify = modify;
    const MINIMUM_TIME_MS = 8;
    const DEFAULT_EVENT_MERGER = function (lastEvent, currentEvent) {
        return currentEvent;
    };
    class TimeoutThrottledDomListener extends lifecycle_1.Disposable {
        constructor(node, type, handler, eventMerger = DEFAULT_EVENT_MERGER, minimumTimeMs = MINIMUM_TIME_MS) {
            super();
            let lastEvent = null;
            let lastHandlerTime = 0;
            const timeout = this._register(new async_1.TimeoutTimer());
            const invokeHandler = () => {
                lastHandlerTime = (new Date()).getTime();
                handler(lastEvent);
                lastEvent = null;
            };
            this._register(addDisposableListener(node, type, (e) => {
                lastEvent = eventMerger(lastEvent, e);
                const elapsedTime = (new Date()).getTime() - lastHandlerTime;
                if (elapsedTime >= minimumTimeMs) {
                    timeout.cancel();
                    invokeHandler();
                }
                else {
                    timeout.setIfNotSet(invokeHandler, minimumTimeMs - elapsedTime);
                }
            }));
        }
    }
    function addDisposableThrottledListener(node, type, handler, eventMerger, minimumTimeMs) {
        return new TimeoutThrottledDomListener(node, type, handler, eventMerger, minimumTimeMs);
    }
    exports.addDisposableThrottledListener = addDisposableThrottledListener;
    function getComputedStyle(el) {
        return (0, exports.getWindow)(el).getComputedStyle(el, null);
    }
    exports.getComputedStyle = getComputedStyle;
    function getClientArea(element, fallback) {
        const elWindow = (0, exports.getWindow)(element);
        const elDocument = elWindow.document;
        // Try with DOM clientWidth / clientHeight
        if (element !== elDocument.body) {
            return new Dimension(element.clientWidth, element.clientHeight);
        }
        // If visual view port exits and it's on mobile, it should be used instead of window innerWidth / innerHeight, or document.body.clientWidth / document.body.clientHeight
        if (platform.isIOS && elWindow?.visualViewport) {
            return new Dimension(elWindow.visualViewport.width, elWindow.visualViewport.height);
        }
        // Try innerWidth / innerHeight
        if (elWindow?.innerWidth && elWindow.innerHeight) {
            return new Dimension(elWindow.innerWidth, elWindow.innerHeight);
        }
        // Try with document.body.clientWidth / document.body.clientHeight
        if (elDocument.body && elDocument.body.clientWidth && elDocument.body.clientHeight) {
            return new Dimension(elDocument.body.clientWidth, elDocument.body.clientHeight);
        }
        // Try with document.documentElement.clientWidth / document.documentElement.clientHeight
        if (elDocument.documentElement && elDocument.documentElement.clientWidth && elDocument.documentElement.clientHeight) {
            return new Dimension(elDocument.documentElement.clientWidth, elDocument.documentElement.clientHeight);
        }
        if (fallback) {
            return getClientArea(fallback);
        }
        throw new Error('Unable to figure out browser width and height');
    }
    exports.getClientArea = getClientArea;
    class SizeUtils {
        // Adapted from WinJS
        // Converts a CSS positioning string for the specified element to pixels.
        static convertToPixels(element, value) {
            return parseFloat(value) || 0;
        }
        static getDimension(element, cssPropertyName, jsPropertyName) {
            const computedStyle = getComputedStyle(element);
            const value = computedStyle ? computedStyle.getPropertyValue(cssPropertyName) : '0';
            return SizeUtils.convertToPixels(element, value);
        }
        static getBorderLeftWidth(element) {
            return SizeUtils.getDimension(element, 'border-left-width', 'borderLeftWidth');
        }
        static getBorderRightWidth(element) {
            return SizeUtils.getDimension(element, 'border-right-width', 'borderRightWidth');
        }
        static getBorderTopWidth(element) {
            return SizeUtils.getDimension(element, 'border-top-width', 'borderTopWidth');
        }
        static getBorderBottomWidth(element) {
            return SizeUtils.getDimension(element, 'border-bottom-width', 'borderBottomWidth');
        }
        static getPaddingLeft(element) {
            return SizeUtils.getDimension(element, 'padding-left', 'paddingLeft');
        }
        static getPaddingRight(element) {
            return SizeUtils.getDimension(element, 'padding-right', 'paddingRight');
        }
        static getPaddingTop(element) {
            return SizeUtils.getDimension(element, 'padding-top', 'paddingTop');
        }
        static getPaddingBottom(element) {
            return SizeUtils.getDimension(element, 'padding-bottom', 'paddingBottom');
        }
        static getMarginLeft(element) {
            return SizeUtils.getDimension(element, 'margin-left', 'marginLeft');
        }
        static getMarginTop(element) {
            return SizeUtils.getDimension(element, 'margin-top', 'marginTop');
        }
        static getMarginRight(element) {
            return SizeUtils.getDimension(element, 'margin-right', 'marginRight');
        }
        static getMarginBottom(element) {
            return SizeUtils.getDimension(element, 'margin-bottom', 'marginBottom');
        }
    }
    class Dimension {
        static { this.None = new Dimension(0, 0); }
        constructor(width, height) {
            this.width = width;
            this.height = height;
        }
        with(width = this.width, height = this.height) {
            if (width !== this.width || height !== this.height) {
                return new Dimension(width, height);
            }
            else {
                return this;
            }
        }
        static is(obj) {
            return typeof obj === 'object' && typeof obj.height === 'number' && typeof obj.width === 'number';
        }
        static lift(obj) {
            if (obj instanceof Dimension) {
                return obj;
            }
            else {
                return new Dimension(obj.width, obj.height);
            }
        }
        static equals(a, b) {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.width === b.width && a.height === b.height;
        }
    }
    exports.Dimension = Dimension;
    function getTopLeftOffset(element) {
        // Adapted from WinJS.Utilities.getPosition
        // and added borders to the mix
        let offsetParent = element.offsetParent;
        let top = element.offsetTop;
        let left = element.offsetLeft;
        while ((element = element.parentNode) !== null
            && element !== element.ownerDocument.body
            && element !== element.ownerDocument.documentElement) {
            top -= element.scrollTop;
            const c = isShadowRoot(element) ? null : getComputedStyle(element);
            if (c) {
                left -= c.direction !== 'rtl' ? element.scrollLeft : -element.scrollLeft;
            }
            if (element === offsetParent) {
                left += SizeUtils.getBorderLeftWidth(element);
                top += SizeUtils.getBorderTopWidth(element);
                top += element.offsetTop;
                left += element.offsetLeft;
                offsetParent = element.offsetParent;
            }
        }
        return {
            left: left,
            top: top
        };
    }
    exports.getTopLeftOffset = getTopLeftOffset;
    function size(element, width, height) {
        if (typeof width === 'number') {
            element.style.width = `${width}px`;
        }
        if (typeof height === 'number') {
            element.style.height = `${height}px`;
        }
    }
    exports.size = size;
    function position(element, top, right, bottom, left, position = 'absolute') {
        if (typeof top === 'number') {
            element.style.top = `${top}px`;
        }
        if (typeof right === 'number') {
            element.style.right = `${right}px`;
        }
        if (typeof bottom === 'number') {
            element.style.bottom = `${bottom}px`;
        }
        if (typeof left === 'number') {
            element.style.left = `${left}px`;
        }
        element.style.position = position;
    }
    exports.position = position;
    /**
     * Returns the position of a dom node relative to the entire page.
     */
    function getDomNodePagePosition(domNode) {
        const bb = domNode.getBoundingClientRect();
        const window = (0, exports.getWindow)(domNode);
        return {
            left: bb.left + window.scrollX,
            top: bb.top + window.scrollY,
            width: bb.width,
            height: bb.height
        };
    }
    exports.getDomNodePagePosition = getDomNodePagePosition;
    /**
     * Returns the effective zoom on a given element before window zoom level is applied
     */
    function getDomNodeZoomLevel(domNode) {
        let testElement = domNode;
        let zoom = 1.0;
        do {
            const elementZoomLevel = getComputedStyle(testElement).zoom;
            if (elementZoomLevel !== null && elementZoomLevel !== undefined && elementZoomLevel !== '1') {
                zoom *= elementZoomLevel;
            }
            testElement = testElement.parentElement;
        } while (testElement !== null && testElement !== testElement.ownerDocument.documentElement);
        return zoom;
    }
    exports.getDomNodeZoomLevel = getDomNodeZoomLevel;
    // Adapted from WinJS
    // Gets the width of the element, including margins.
    function getTotalWidth(element) {
        const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
        return element.offsetWidth + margin;
    }
    exports.getTotalWidth = getTotalWidth;
    function getContentWidth(element) {
        const border = SizeUtils.getBorderLeftWidth(element) + SizeUtils.getBorderRightWidth(element);
        const padding = SizeUtils.getPaddingLeft(element) + SizeUtils.getPaddingRight(element);
        return element.offsetWidth - border - padding;
    }
    exports.getContentWidth = getContentWidth;
    function getTotalScrollWidth(element) {
        const margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
        return element.scrollWidth + margin;
    }
    exports.getTotalScrollWidth = getTotalScrollWidth;
    // Adapted from WinJS
    // Gets the height of the content of the specified element. The content height does not include borders or padding.
    function getContentHeight(element) {
        const border = SizeUtils.getBorderTopWidth(element) + SizeUtils.getBorderBottomWidth(element);
        const padding = SizeUtils.getPaddingTop(element) + SizeUtils.getPaddingBottom(element);
        return element.offsetHeight - border - padding;
    }
    exports.getContentHeight = getContentHeight;
    // Adapted from WinJS
    // Gets the height of the element, including its margins.
    function getTotalHeight(element) {
        const margin = SizeUtils.getMarginTop(element) + SizeUtils.getMarginBottom(element);
        return element.offsetHeight + margin;
    }
    exports.getTotalHeight = getTotalHeight;
    // Gets the left coordinate of the specified element relative to the specified parent.
    function getRelativeLeft(element, parent) {
        if (element === null) {
            return 0;
        }
        const elementPosition = getTopLeftOffset(element);
        const parentPosition = getTopLeftOffset(parent);
        return elementPosition.left - parentPosition.left;
    }
    function getLargestChildWidth(parent, children) {
        const childWidths = children.map((child) => {
            return Math.max(getTotalScrollWidth(child), getTotalWidth(child)) + getRelativeLeft(child, parent) || 0;
        });
        const maxWidth = Math.max(...childWidths);
        return maxWidth;
    }
    exports.getLargestChildWidth = getLargestChildWidth;
    // ----------------------------------------------------------------------------------------
    function isAncestor(testChild, testAncestor) {
        return Boolean(testAncestor?.contains(testChild));
    }
    exports.isAncestor = isAncestor;
    const parentFlowToDataKey = 'parentFlowToElementId';
    /**
     * Set an explicit parent to use for nodes that are not part of the
     * regular dom structure.
     */
    function setParentFlowTo(fromChildElement, toParentElement) {
        fromChildElement.dataset[parentFlowToDataKey] = toParentElement.id;
    }
    exports.setParentFlowTo = setParentFlowTo;
    function getParentFlowToElement(node) {
        const flowToParentId = node.dataset[parentFlowToDataKey];
        if (typeof flowToParentId === 'string') {
            return node.ownerDocument.getElementById(flowToParentId);
        }
        return null;
    }
    /**
     * Check if `testAncestor` is an ancestor of `testChild`, observing the explicit
     * parents set by `setParentFlowTo`.
     */
    function isAncestorUsingFlowTo(testChild, testAncestor) {
        let node = testChild;
        while (node) {
            if (node === testAncestor) {
                return true;
            }
            if (node instanceof HTMLElement) {
                const flowToParentElement = getParentFlowToElement(node);
                if (flowToParentElement) {
                    node = flowToParentElement;
                    continue;
                }
            }
            node = node.parentNode;
        }
        return false;
    }
    exports.isAncestorUsingFlowTo = isAncestorUsingFlowTo;
    function findParentWithClass(node, clazz, stopAtClazzOrNode) {
        while (node && node.nodeType === node.ELEMENT_NODE) {
            if (node.classList.contains(clazz)) {
                return node;
            }
            if (stopAtClazzOrNode) {
                if (typeof stopAtClazzOrNode === 'string') {
                    if (node.classList.contains(stopAtClazzOrNode)) {
                        return null;
                    }
                }
                else {
                    if (node === stopAtClazzOrNode) {
                        return null;
                    }
                }
            }
            node = node.parentNode;
        }
        return null;
    }
    exports.findParentWithClass = findParentWithClass;
    function hasParentWithClass(node, clazz, stopAtClazzOrNode) {
        return !!findParentWithClass(node, clazz, stopAtClazzOrNode);
    }
    exports.hasParentWithClass = hasParentWithClass;
    function isShadowRoot(node) {
        return (node && !!node.host && !!node.mode);
    }
    exports.isShadowRoot = isShadowRoot;
    function isInShadowDOM(domNode) {
        return !!getShadowRoot(domNode);
    }
    exports.isInShadowDOM = isInShadowDOM;
    function getShadowRoot(domNode) {
        while (domNode.parentNode) {
            if (domNode === domNode.ownerDocument?.body) {
                // reached the body
                return null;
            }
            domNode = domNode.parentNode;
        }
        return isShadowRoot(domNode) ? domNode : null;
    }
    exports.getShadowRoot = getShadowRoot;
    /**
     * Returns the active element across all child windows
     * based on document focus. Falls back to the main
     * window if no window has focus.
     */
    function getActiveElement() {
        let result = getActiveDocument().activeElement;
        while (result?.shadowRoot) {
            result = result.shadowRoot.activeElement;
        }
        return result;
    }
    exports.getActiveElement = getActiveElement;
    /**
     * Returns true if the focused window active element matches
     * the provided element. Falls back to the main window if no
     * window has focus.
     */
    function isActiveElement(element) {
        return getActiveElement() === element;
    }
    exports.isActiveElement = isActiveElement;
    /**
     * Returns true if the focused window active element is contained in
     * `ancestor`. Falls back to the main window if no window has focus.
     */
    function isAncestorOfActiveElement(ancestor) {
        return isAncestor(getActiveElement(), ancestor);
    }
    exports.isAncestorOfActiveElement = isAncestorOfActiveElement;
    /**
     * Returns whether the element is in the active `document`. The active
     * document has focus or will be the main windows document.
     */
    function isActiveDocument(element) {
        return element.ownerDocument === getActiveDocument();
    }
    exports.isActiveDocument = isActiveDocument;
    /**
     * Returns the active document across main and child windows.
     * Prefers the window with focus, otherwise falls back to
     * the main windows document.
     */
    function getActiveDocument() {
        if ((0, exports.getWindowsCount)() <= 1) {
            return window_1.mainWindow.document;
        }
        const documents = Array.from((0, exports.getWindows)()).map(({ window }) => window.document);
        return documents.find(doc => doc.hasFocus()) ?? window_1.mainWindow.document;
    }
    exports.getActiveDocument = getActiveDocument;
    /**
     * Returns the active window across main and child windows.
     * Prefers the window with focus, otherwise falls back to
     * the main window.
     */
    function getActiveWindow() {
        const document = getActiveDocument();
        return (document.defaultView?.window ?? window_1.mainWindow);
    }
    exports.getActiveWindow = getActiveWindow;
    function focusWindow(element) {
        const window = (0, exports.getWindow)(element);
        if (!window.document.hasFocus()) {
            window.focus();
        }
    }
    exports.focusWindow = focusWindow;
    const globalStylesheets = new Map();
    function isGlobalStylesheet(node) {
        return globalStylesheets.has(node);
    }
    exports.isGlobalStylesheet = isGlobalStylesheet;
    /**
     * A version of createStyleSheet which has a unified API to initialize/set the style content.
     */
    function createStyleSheet2() {
        return new WrappedStyleElement();
    }
    exports.createStyleSheet2 = createStyleSheet2;
    class WrappedStyleElement {
        constructor() {
            this._currentCssStyle = '';
            this._styleSheet = undefined;
        }
        setStyle(cssStyle) {
            if (cssStyle === this._currentCssStyle) {
                return;
            }
            this._currentCssStyle = cssStyle;
            if (!this._styleSheet) {
                this._styleSheet = createStyleSheet(window_1.mainWindow.document.head, (s) => s.innerText = cssStyle);
            }
            else {
                this._styleSheet.innerText = cssStyle;
            }
        }
        dispose() {
            if (this._styleSheet) {
                clearNode(this._styleSheet);
                this._styleSheet = undefined;
            }
        }
    }
    function createStyleSheet(container = window_1.mainWindow.document.head, beforeAppend, disposableStore) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.media = 'screen';
        beforeAppend?.(style);
        container.appendChild(style);
        if (disposableStore) {
            disposableStore.add((0, lifecycle_1.toDisposable)(() => container.removeChild(style)));
        }
        // With <head> as container, the stylesheet becomes global and is tracked
        // to support auxiliary windows to clone the stylesheet.
        if (container === window_1.mainWindow.document.head) {
            const globalStylesheetClones = new Set();
            globalStylesheets.set(style, globalStylesheetClones);
            for (const { window: targetWindow, disposables } of (0, exports.getWindows)()) {
                if (targetWindow === window_1.mainWindow) {
                    continue; // main window is already tracked
                }
                const cloneDisposable = disposables.add(cloneGlobalStyleSheet(style, globalStylesheetClones, targetWindow));
                disposableStore?.add(cloneDisposable);
            }
        }
        return style;
    }
    exports.createStyleSheet = createStyleSheet;
    function cloneGlobalStylesheets(targetWindow) {
        const disposables = new lifecycle_1.DisposableStore();
        for (const [globalStylesheet, clonedGlobalStylesheets] of globalStylesheets) {
            disposables.add(cloneGlobalStyleSheet(globalStylesheet, clonedGlobalStylesheets, targetWindow));
        }
        return disposables;
    }
    exports.cloneGlobalStylesheets = cloneGlobalStylesheets;
    function cloneGlobalStyleSheet(globalStylesheet, globalStylesheetClones, targetWindow) {
        const disposables = new lifecycle_1.DisposableStore();
        const clone = globalStylesheet.cloneNode(true);
        targetWindow.document.head.appendChild(clone);
        disposables.add((0, lifecycle_1.toDisposable)(() => targetWindow.document.head.removeChild(clone)));
        for (const rule of getDynamicStyleSheetRules(globalStylesheet)) {
            clone.sheet?.insertRule(rule.cssText, clone.sheet?.cssRules.length);
        }
        disposables.add(exports.sharedMutationObserver.observe(globalStylesheet, disposables, { childList: true })(() => {
            clone.textContent = globalStylesheet.textContent;
        }));
        globalStylesheetClones.add(clone);
        disposables.add((0, lifecycle_1.toDisposable)(() => globalStylesheetClones.delete(clone)));
        return disposables;
    }
    exports.sharedMutationObserver = new class {
        constructor() {
            this.mutationObservers = new Map();
        }
        observe(target, disposables, options) {
            let mutationObserversPerTarget = this.mutationObservers.get(target);
            if (!mutationObserversPerTarget) {
                mutationObserversPerTarget = new Map();
                this.mutationObservers.set(target, mutationObserversPerTarget);
            }
            const optionsHash = (0, hash_1.hash)(options);
            let mutationObserverPerOptions = mutationObserversPerTarget.get(optionsHash);
            if (!mutationObserverPerOptions) {
                const onDidMutate = new event.Emitter();
                const observer = new MutationObserver(mutations => onDidMutate.fire(mutations));
                observer.observe(target, options);
                const resolvedMutationObserverPerOptions = mutationObserverPerOptions = {
                    users: 1,
                    observer,
                    onDidMutate: onDidMutate.event
                };
                disposables.add((0, lifecycle_1.toDisposable)(() => {
                    resolvedMutationObserverPerOptions.users -= 1;
                    if (resolvedMutationObserverPerOptions.users === 0) {
                        onDidMutate.dispose();
                        observer.disconnect();
                        mutationObserversPerTarget?.delete(optionsHash);
                        if (mutationObserversPerTarget?.size === 0) {
                            this.mutationObservers.delete(target);
                        }
                    }
                }));
                mutationObserversPerTarget.set(optionsHash, mutationObserverPerOptions);
            }
            else {
                mutationObserverPerOptions.users += 1;
            }
            return mutationObserverPerOptions.onDidMutate;
        }
    };
    function createMetaElement(container = window_1.mainWindow.document.head) {
        return createHeadElement('meta', container);
    }
    exports.createMetaElement = createMetaElement;
    function createLinkElement(container = window_1.mainWindow.document.head) {
        return createHeadElement('link', container);
    }
    exports.createLinkElement = createLinkElement;
    function createHeadElement(tagName, container = window_1.mainWindow.document.head) {
        const element = document.createElement(tagName);
        container.appendChild(element);
        return element;
    }
    let _sharedStyleSheet = null;
    function getSharedStyleSheet() {
        if (!_sharedStyleSheet) {
            _sharedStyleSheet = createStyleSheet();
        }
        return _sharedStyleSheet;
    }
    function getDynamicStyleSheetRules(style) {
        if (style?.sheet?.rules) {
            // Chrome, IE
            return style.sheet.rules;
        }
        if (style?.sheet?.cssRules) {
            // FF
            return style.sheet.cssRules;
        }
        return [];
    }
    function createCSSRule(selector, cssText, style = getSharedStyleSheet()) {
        if (!style || !cssText) {
            return;
        }
        style.sheet?.insertRule(`${selector} {${cssText}}`, 0);
        // Apply rule also to all cloned global stylesheets
        for (const clonedGlobalStylesheet of globalStylesheets.get(style) ?? []) {
            createCSSRule(selector, cssText, clonedGlobalStylesheet);
        }
    }
    exports.createCSSRule = createCSSRule;
    function removeCSSRulesContainingSelector(ruleName, style = getSharedStyleSheet()) {
        if (!style) {
            return;
        }
        const rules = getDynamicStyleSheetRules(style);
        const toDelete = [];
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (isCSSStyleRule(rule) && rule.selectorText.indexOf(ruleName) !== -1) {
                toDelete.push(i);
            }
        }
        for (let i = toDelete.length - 1; i >= 0; i--) {
            style.sheet?.deleteRule(toDelete[i]);
        }
        // Remove rules also from all cloned global stylesheets
        for (const clonedGlobalStylesheet of globalStylesheets.get(style) ?? []) {
            removeCSSRulesContainingSelector(ruleName, clonedGlobalStylesheet);
        }
    }
    exports.removeCSSRulesContainingSelector = removeCSSRulesContainingSelector;
    function isCSSStyleRule(rule) {
        return typeof rule.selectorText === 'string';
    }
    function isMouseEvent(e) {
        // eslint-disable-next-line no-restricted-syntax
        return e instanceof MouseEvent || e instanceof (0, exports.getWindow)(e).MouseEvent;
    }
    exports.isMouseEvent = isMouseEvent;
    function isKeyboardEvent(e) {
        // eslint-disable-next-line no-restricted-syntax
        return e instanceof KeyboardEvent || e instanceof (0, exports.getWindow)(e).KeyboardEvent;
    }
    exports.isKeyboardEvent = isKeyboardEvent;
    function isPointerEvent(e) {
        // eslint-disable-next-line no-restricted-syntax
        return e instanceof PointerEvent || e instanceof (0, exports.getWindow)(e).PointerEvent;
    }
    exports.isPointerEvent = isPointerEvent;
    function isDragEvent(e) {
        // eslint-disable-next-line no-restricted-syntax
        return e instanceof DragEvent || e instanceof (0, exports.getWindow)(e).DragEvent;
    }
    exports.isDragEvent = isDragEvent;
    exports.EventType = {
        // Mouse
        CLICK: 'click',
        AUXCLICK: 'auxclick',
        DBLCLICK: 'dblclick',
        MOUSE_UP: 'mouseup',
        MOUSE_DOWN: 'mousedown',
        MOUSE_OVER: 'mouseover',
        MOUSE_MOVE: 'mousemove',
        MOUSE_OUT: 'mouseout',
        MOUSE_ENTER: 'mouseenter',
        MOUSE_LEAVE: 'mouseleave',
        MOUSE_WHEEL: 'wheel',
        POINTER_UP: 'pointerup',
        POINTER_DOWN: 'pointerdown',
        POINTER_MOVE: 'pointermove',
        POINTER_LEAVE: 'pointerleave',
        CONTEXT_MENU: 'contextmenu',
        WHEEL: 'wheel',
        // Keyboard
        KEY_DOWN: 'keydown',
        KEY_PRESS: 'keypress',
        KEY_UP: 'keyup',
        // HTML Document
        LOAD: 'load',
        BEFORE_UNLOAD: 'beforeunload',
        UNLOAD: 'unload',
        PAGE_SHOW: 'pageshow',
        PAGE_HIDE: 'pagehide',
        PASTE: 'paste',
        ABORT: 'abort',
        ERROR: 'error',
        RESIZE: 'resize',
        SCROLL: 'scroll',
        FULLSCREEN_CHANGE: 'fullscreenchange',
        WK_FULLSCREEN_CHANGE: 'webkitfullscreenchange',
        // Form
        SELECT: 'select',
        CHANGE: 'change',
        SUBMIT: 'submit',
        RESET: 'reset',
        FOCUS: 'focus',
        FOCUS_IN: 'focusin',
        FOCUS_OUT: 'focusout',
        BLUR: 'blur',
        INPUT: 'input',
        // Local Storage
        STORAGE: 'storage',
        // Drag
        DRAG_START: 'dragstart',
        DRAG: 'drag',
        DRAG_ENTER: 'dragenter',
        DRAG_LEAVE: 'dragleave',
        DRAG_OVER: 'dragover',
        DROP: 'drop',
        DRAG_END: 'dragend',
        // Animation
        ANIMATION_START: browser.isWebKit ? 'webkitAnimationStart' : 'animationstart',
        ANIMATION_END: browser.isWebKit ? 'webkitAnimationEnd' : 'animationend',
        ANIMATION_ITERATION: browser.isWebKit ? 'webkitAnimationIteration' : 'animationiteration'
    };
    function isEventLike(obj) {
        const candidate = obj;
        return !!(candidate && typeof candidate.preventDefault === 'function' && typeof candidate.stopPropagation === 'function');
    }
    exports.isEventLike = isEventLike;
    exports.EventHelper = {
        stop: (e, cancelBubble) => {
            e.preventDefault();
            if (cancelBubble) {
                e.stopPropagation();
            }
            return e;
        }
    };
    function saveParentsScrollTop(node) {
        const r = [];
        for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
            r[i] = node.scrollTop;
            node = node.parentNode;
        }
        return r;
    }
    exports.saveParentsScrollTop = saveParentsScrollTop;
    function restoreParentsScrollTop(node, state) {
        for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
            if (node.scrollTop !== state[i]) {
                node.scrollTop = state[i];
            }
            node = node.parentNode;
        }
    }
    exports.restoreParentsScrollTop = restoreParentsScrollTop;
    class FocusTracker extends lifecycle_1.Disposable {
        static hasFocusWithin(element) {
            if (element instanceof HTMLElement) {
                const shadowRoot = getShadowRoot(element);
                const activeElement = (shadowRoot ? shadowRoot.activeElement : element.ownerDocument.activeElement);
                return isAncestor(activeElement, element);
            }
            else {
                const window = element;
                return isAncestor(window.document.activeElement, window.document);
            }
        }
        constructor(element) {
            super();
            this._onDidFocus = this._register(new event.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            let hasFocus = FocusTracker.hasFocusWithin(element);
            let loosingFocus = false;
            const onFocus = () => {
                loosingFocus = false;
                if (!hasFocus) {
                    hasFocus = true;
                    this._onDidFocus.fire();
                }
            };
            const onBlur = () => {
                if (hasFocus) {
                    loosingFocus = true;
                    (element instanceof HTMLElement ? (0, exports.getWindow)(element) : element).setTimeout(() => {
                        if (loosingFocus) {
                            loosingFocus = false;
                            hasFocus = false;
                            this._onDidBlur.fire();
                        }
                    }, 0);
                }
            };
            this._refreshStateHandler = () => {
                const currentNodeHasFocus = FocusTracker.hasFocusWithin(element);
                if (currentNodeHasFocus !== hasFocus) {
                    if (hasFocus) {
                        onBlur();
                    }
                    else {
                        onFocus();
                    }
                }
            };
            this._register(addDisposableListener(element, exports.EventType.FOCUS, onFocus, true));
            this._register(addDisposableListener(element, exports.EventType.BLUR, onBlur, true));
            if (element instanceof HTMLElement) {
                this._register(addDisposableListener(element, exports.EventType.FOCUS_IN, () => this._refreshStateHandler()));
                this._register(addDisposableListener(element, exports.EventType.FOCUS_OUT, () => this._refreshStateHandler()));
            }
        }
        refreshState() {
            this._refreshStateHandler();
        }
    }
    /**
     * Creates a new `IFocusTracker` instance that tracks focus changes on the given `element` and its descendants.
     *
     * @param element The `HTMLElement` or `Window` to track focus changes on.
     * @returns An `IFocusTracker` instance.
     */
    function trackFocus(element) {
        return new FocusTracker(element);
    }
    exports.trackFocus = trackFocus;
    function after(sibling, child) {
        sibling.after(child);
        return child;
    }
    exports.after = after;
    function append(parent, ...children) {
        parent.append(...children);
        if (children.length === 1 && typeof children[0] !== 'string') {
            return children[0];
        }
    }
    exports.append = append;
    function prepend(parent, child) {
        parent.insertBefore(child, parent.firstChild);
        return child;
    }
    exports.prepend = prepend;
    /**
     * Removes all children from `parent` and appends `children`
     */
    function reset(parent, ...children) {
        parent.innerText = '';
        append(parent, ...children);
    }
    exports.reset = reset;
    const SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;
    var Namespace;
    (function (Namespace) {
        Namespace["HTML"] = "http://www.w3.org/1999/xhtml";
        Namespace["SVG"] = "http://www.w3.org/2000/svg";
    })(Namespace || (exports.Namespace = Namespace = {}));
    function _$(namespace, description, attrs, ...children) {
        const match = SELECTOR_REGEX.exec(description);
        if (!match) {
            throw new Error('Bad use of emmet');
        }
        const tagName = match[1] || 'div';
        let result;
        if (namespace !== Namespace.HTML) {
            result = document.createElementNS(namespace, tagName);
        }
        else {
            result = document.createElement(tagName);
        }
        if (match[3]) {
            result.id = match[3];
        }
        if (match[4]) {
            result.className = match[4].replace(/\./g, ' ').trim();
        }
        if (attrs) {
            Object.entries(attrs).forEach(([name, value]) => {
                if (typeof value === 'undefined') {
                    return;
                }
                if (/^on\w+$/.test(name)) {
                    result[name] = value;
                }
                else if (name === 'selected') {
                    if (value) {
                        result.setAttribute(name, 'true');
                    }
                }
                else {
                    result.setAttribute(name, value);
                }
            });
        }
        result.append(...children);
        return result;
    }
    function $(description, attrs, ...children) {
        return _$(Namespace.HTML, description, attrs, ...children);
    }
    exports.$ = $;
    $.SVG = function (description, attrs, ...children) {
        return _$(Namespace.SVG, description, attrs, ...children);
    };
    function join(nodes, separator) {
        const result = [];
        nodes.forEach((node, index) => {
            if (index > 0) {
                if (separator instanceof Node) {
                    result.push(separator.cloneNode());
                }
                else {
                    result.push(document.createTextNode(separator));
                }
            }
            result.push(node);
        });
        return result;
    }
    exports.join = join;
    function setVisibility(visible, ...elements) {
        if (visible) {
            show(...elements);
        }
        else {
            hide(...elements);
        }
    }
    exports.setVisibility = setVisibility;
    function show(...elements) {
        for (const element of elements) {
            element.style.display = '';
            element.removeAttribute('aria-hidden');
        }
    }
    exports.show = show;
    function hide(...elements) {
        for (const element of elements) {
            element.style.display = 'none';
            element.setAttribute('aria-hidden', 'true');
        }
    }
    exports.hide = hide;
    function findParentWithAttribute(node, attribute) {
        while (node && node.nodeType === node.ELEMENT_NODE) {
            if (node instanceof HTMLElement && node.hasAttribute(attribute)) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }
    function removeTabIndexAndUpdateFocus(node) {
        if (!node || !node.hasAttribute('tabIndex')) {
            return;
        }
        // If we are the currently focused element and tabIndex is removed,
        // standard DOM behavior is to move focus to the <body> element. We
        // typically never want that, rather put focus to the closest element
        // in the hierarchy of the parent DOM nodes.
        if (node.ownerDocument.activeElement === node) {
            const parentFocusable = findParentWithAttribute(node.parentElement, 'tabIndex');
            parentFocusable?.focus();
        }
        node.removeAttribute('tabindex');
    }
    exports.removeTabIndexAndUpdateFocus = removeTabIndexAndUpdateFocus;
    function finalHandler(fn) {
        return e => {
            e.preventDefault();
            e.stopPropagation();
            fn(e);
        };
    }
    exports.finalHandler = finalHandler;
    function domContentLoaded(targetWindow) {
        return new Promise(resolve => {
            const readyState = targetWindow.document.readyState;
            if (readyState === 'complete' || (targetWindow.document && targetWindow.document.body !== null)) {
                resolve(undefined);
            }
            else {
                const listener = () => {
                    targetWindow.window.removeEventListener('DOMContentLoaded', listener, false);
                    resolve();
                };
                targetWindow.window.addEventListener('DOMContentLoaded', listener, false);
            }
        });
    }
    exports.domContentLoaded = domContentLoaded;
    /**
     * Find a value usable for a dom node size such that the likelihood that it would be
     * displayed with constant screen pixels size is as high as possible.
     *
     * e.g. We would desire for the cursors to be 2px (CSS px) wide. Under a devicePixelRatio
     * of 1.25, the cursor will be 2.5 screen pixels wide. Depending on how the dom node aligns/"snaps"
     * with the screen pixels, it will sometimes be rendered with 2 screen pixels, and sometimes with 3 screen pixels.
     */
    function computeScreenAwareSize(window, cssPx) {
        const screenPx = window.devicePixelRatio * cssPx;
        return Math.max(1, Math.floor(screenPx)) / window.devicePixelRatio;
    }
    exports.computeScreenAwareSize = computeScreenAwareSize;
    /**
     * Open safely a new window. This is the best way to do so, but you cannot tell
     * if the window was opened or if it was blocked by the browser's popup blocker.
     * If you want to tell if the browser blocked the new window, use {@link windowOpenWithSuccess}.
     *
     * See https://github.com/microsoft/monaco-editor/issues/601
     * To protect against malicious code in the linked site, particularly phishing attempts,
     * the window.opener should be set to null to prevent the linked site from having access
     * to change the location of the current page.
     * See https://mathiasbynens.github.io/rel-noopener/
     */
    function windowOpenNoOpener(url) {
        // By using 'noopener' in the `windowFeatures` argument, the newly created window will
        // not be able to use `window.opener` to reach back to the current page.
        // See https://stackoverflow.com/a/46958731
        // See https://developer.mozilla.org/en-US/docs/Web/API/Window/open#noopener
        // However, this also doesn't allow us to realize if the browser blocked
        // the creation of the window.
        window_1.mainWindow.open(url, '_blank', 'noopener');
    }
    exports.windowOpenNoOpener = windowOpenNoOpener;
    /**
     * Open a new window in a popup. This is the best way to do so, but you cannot tell
     * if the window was opened or if it was blocked by the browser's popup blocker.
     * If you want to tell if the browser blocked the new window, use {@link windowOpenWithSuccess}.
     *
     * Note: this does not set {@link window.opener} to null. This is to allow the opened popup to
     * be able to use {@link window.close} to close itself. Because of this, you should only use
     * this function on urls that you trust.
     *
     * In otherwords, you should almost always use {@link windowOpenNoOpener} instead of this function.
     */
    const popupWidth = 780, popupHeight = 640;
    function windowOpenPopup(url) {
        const left = Math.floor(window_1.mainWindow.screenLeft + window_1.mainWindow.innerWidth / 2 - popupWidth / 2);
        const top = Math.floor(window_1.mainWindow.screenTop + window_1.mainWindow.innerHeight / 2 - popupHeight / 2);
        window_1.mainWindow.open(url, '_blank', `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`);
    }
    exports.windowOpenPopup = windowOpenPopup;
    /**
     * Attempts to open a window and returns whether it succeeded. This technique is
     * not appropriate in certain contexts, like for example when the JS context is
     * executing inside a sandboxed iframe. If it is not necessary to know if the
     * browser blocked the new window, use {@link windowOpenNoOpener}.
     *
     * See https://github.com/microsoft/monaco-editor/issues/601
     * See https://github.com/microsoft/monaco-editor/issues/2474
     * See https://mathiasbynens.github.io/rel-noopener/
     *
     * @param url the url to open
     * @param noOpener whether or not to set the {@link window.opener} to null. You should leave the default
     * (true) unless you trust the url that is being opened.
     * @returns boolean indicating if the {@link window.open} call succeeded
     */
    function windowOpenWithSuccess(url, noOpener = true) {
        const newTab = window_1.mainWindow.open();
        if (newTab) {
            if (noOpener) {
                // see `windowOpenNoOpener` for details on why this is important
                newTab.opener = null;
            }
            newTab.location.href = url;
            return true;
        }
        return false;
    }
    exports.windowOpenWithSuccess = windowOpenWithSuccess;
    function animate(targetWindow, fn) {
        const step = () => {
            fn();
            stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(targetWindow, step);
        };
        let stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(targetWindow, step);
        return (0, lifecycle_1.toDisposable)(() => stepDisposable.dispose());
    }
    exports.animate = animate;
    network_1.RemoteAuthorities.setPreferredWebSchema(/^https:/.test(window_1.mainWindow.location.href) ? 'https' : 'http');
    /**
     * returns url('...')
     */
    function asCSSUrl(uri) {
        if (!uri) {
            return `url('')`;
        }
        return `url('${network_1.FileAccess.uriToBrowserUri(uri).toString(true).replace(/'/g, '%27')}')`;
    }
    exports.asCSSUrl = asCSSUrl;
    function asCSSPropertyValue(value) {
        return `'${value.replace(/'/g, '%27')}'`;
    }
    exports.asCSSPropertyValue = asCSSPropertyValue;
    function asCssValueWithDefault(cssPropertyValue, dflt) {
        if (cssPropertyValue !== undefined) {
            const variableMatch = cssPropertyValue.match(/^\s*var\((.+)\)$/);
            if (variableMatch) {
                const varArguments = variableMatch[1].split(',', 2);
                if (varArguments.length === 2) {
                    dflt = asCssValueWithDefault(varArguments[1].trim(), dflt);
                }
                return `var(${varArguments[0]}, ${dflt})`;
            }
            return cssPropertyValue;
        }
        return dflt;
    }
    exports.asCssValueWithDefault = asCssValueWithDefault;
    function triggerDownload(dataOrUri, name) {
        // If the data is provided as Buffer, we create a
        // blob URL out of it to produce a valid link
        let url;
        if (uri_1.URI.isUri(dataOrUri)) {
            url = dataOrUri.toString(true);
        }
        else {
            const blob = new Blob([dataOrUri]);
            url = URL.createObjectURL(blob);
            // Ensure to free the data from DOM eventually
            setTimeout(() => URL.revokeObjectURL(url));
        }
        // In order to download from the browser, the only way seems
        // to be creating a <a> element with download attribute that
        // points to the file to download.
        // See also https://developers.google.com/web/updates/2011/08/Downloading-resources-in-HTML5-a-download
        const activeWindow = getActiveWindow();
        const anchor = document.createElement('a');
        activeWindow.document.body.appendChild(anchor);
        anchor.download = name;
        anchor.href = url;
        anchor.click();
        // Ensure to remove the element from DOM eventually
        setTimeout(() => activeWindow.document.body.removeChild(anchor));
    }
    exports.triggerDownload = triggerDownload;
    function triggerUpload() {
        return new Promise(resolve => {
            // In order to upload to the browser, create a
            // input element of type `file` and click it
            // to gather the selected files
            const activeWindow = getActiveWindow();
            const input = document.createElement('input');
            activeWindow.document.body.appendChild(input);
            input.type = 'file';
            input.multiple = true;
            // Resolve once the input event has fired once
            event.Event.once(event.Event.fromDOMEventEmitter(input, 'input'))(() => {
                resolve(input.files ?? undefined);
            });
            input.click();
            // Ensure to remove the element from DOM eventually
            setTimeout(() => activeWindow.document.body.removeChild(input));
        });
    }
    exports.triggerUpload = triggerUpload;
    var DetectedFullscreenMode;
    (function (DetectedFullscreenMode) {
        /**
         * The document is fullscreen, e.g. because an element
         * in the document requested to be fullscreen.
         */
        DetectedFullscreenMode[DetectedFullscreenMode["DOCUMENT"] = 1] = "DOCUMENT";
        /**
         * The browser is fullscreen, e.g. because the user enabled
         * native window fullscreen for it.
         */
        DetectedFullscreenMode[DetectedFullscreenMode["BROWSER"] = 2] = "BROWSER";
    })(DetectedFullscreenMode || (exports.DetectedFullscreenMode = DetectedFullscreenMode = {}));
    function detectFullscreen(targetWindow) {
        // Browser fullscreen: use DOM APIs to detect
        if (targetWindow.document.fullscreenElement || targetWindow.document.webkitFullscreenElement || targetWindow.document.webkitIsFullScreen) {
            return { mode: DetectedFullscreenMode.DOCUMENT, guess: false };
        }
        // There is no standard way to figure out if the browser
        // is using native fullscreen. Via checking on screen
        // height and comparing that to window height, we can guess
        // it though.
        if (targetWindow.innerHeight === targetWindow.screen.height) {
            // if the height of the window matches the screen height, we can
            // safely assume that the browser is fullscreen because no browser
            // chrome is taking height away (e.g. like toolbars).
            return { mode: DetectedFullscreenMode.BROWSER, guess: false };
        }
        if (platform.isMacintosh || platform.isLinux) {
            // macOS and Linux do not properly report `innerHeight`, only Windows does
            if (targetWindow.outerHeight === targetWindow.screen.height && targetWindow.outerWidth === targetWindow.screen.width) {
                // if the height of the browser matches the screen height, we can
                // only guess that we are in fullscreen. It is also possible that
                // the user has turned off taskbars in the OS and the browser is
                // simply able to span the entire size of the screen.
                return { mode: DetectedFullscreenMode.BROWSER, guess: true };
            }
        }
        // Not in fullscreen
        return null;
    }
    exports.detectFullscreen = detectFullscreen;
    // -- sanitize and trusted html
    /**
     * Hooks dompurify using `afterSanitizeAttributes` to check that all `href` and `src`
     * attributes are valid.
     */
    function hookDomPurifyHrefAndSrcSanitizer(allowedProtocols, allowDataImages = false) {
        // https://github.com/cure53/DOMPurify/blob/main/demos/hooks-scheme-allowlist.html
        // build an anchor to map URLs to
        const anchor = document.createElement('a');
        dompurify.addHook('afterSanitizeAttributes', (node) => {
            // check all href/src attributes for validity
            for (const attr of ['href', 'src']) {
                if (node.hasAttribute(attr)) {
                    const attrValue = node.getAttribute(attr);
                    if (attr === 'href' && attrValue.startsWith('#')) {
                        // Allow fragment links
                        continue;
                    }
                    anchor.href = attrValue;
                    if (!allowedProtocols.includes(anchor.protocol.replace(/:$/, ''))) {
                        if (allowDataImages && attr === 'src' && anchor.href.startsWith('data:')) {
                            continue;
                        }
                        node.removeAttribute(attr);
                    }
                }
            }
        });
        return (0, lifecycle_1.toDisposable)(() => {
            dompurify.removeHook('afterSanitizeAttributes');
        });
    }
    exports.hookDomPurifyHrefAndSrcSanitizer = hookDomPurifyHrefAndSrcSanitizer;
    const defaultSafeProtocols = [
        network_1.Schemas.http,
        network_1.Schemas.https,
        network_1.Schemas.command,
    ];
    /**
     * List of safe, non-input html tags.
     */
    exports.basicMarkupHtmlTags = Object.freeze([
        'a',
        'abbr',
        'b',
        'bdo',
        'blockquote',
        'br',
        'caption',
        'cite',
        'code',
        'col',
        'colgroup',
        'dd',
        'del',
        'details',
        'dfn',
        'div',
        'dl',
        'dt',
        'em',
        'figcaption',
        'figure',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'hr',
        'i',
        'img',
        'input',
        'ins',
        'kbd',
        'label',
        'li',
        'mark',
        'ol',
        'p',
        'pre',
        'q',
        'rp',
        'rt',
        'ruby',
        'samp',
        'small',
        'small',
        'source',
        'span',
        'strike',
        'strong',
        'sub',
        'summary',
        'sup',
        'table',
        'tbody',
        'td',
        'tfoot',
        'th',
        'thead',
        'time',
        'tr',
        'tt',
        'u',
        'ul',
        'var',
        'video',
        'wbr',
    ]);
    const defaultDomPurifyConfig = Object.freeze({
        ALLOWED_TAGS: ['a', 'button', 'blockquote', 'code', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'input', 'label', 'li', 'p', 'pre', 'select', 'small', 'span', 'strong', 'textarea', 'ul', 'ol'],
        ALLOWED_ATTR: ['href', 'data-href', 'data-command', 'target', 'title', 'name', 'src', 'alt', 'class', 'id', 'role', 'tabindex', 'style', 'data-code', 'width', 'height', 'align', 'x-dispatch', 'required', 'checked', 'placeholder', 'type', 'start'],
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: true
    });
    /**
     * Sanitizes the given `value` and reset the given `node` with it.
     */
    function safeInnerHtml(node, value) {
        const hook = hookDomPurifyHrefAndSrcSanitizer(defaultSafeProtocols);
        try {
            const html = dompurify.sanitize(value, defaultDomPurifyConfig);
            node.innerHTML = html;
        }
        finally {
            hook.dispose();
        }
    }
    exports.safeInnerHtml = safeInnerHtml;
    /**
     * Convert a Unicode string to a string in which each 16-bit unit occupies only one byte
     *
     * From https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
     */
    function toBinary(str) {
        const codeUnits = new Uint16Array(str.length);
        for (let i = 0; i < codeUnits.length; i++) {
            codeUnits[i] = str.charCodeAt(i);
        }
        let binary = '';
        const uint8array = new Uint8Array(codeUnits.buffer);
        for (let i = 0; i < uint8array.length; i++) {
            binary += String.fromCharCode(uint8array[i]);
        }
        return binary;
    }
    /**
     * Version of the global `btoa` function that handles multi-byte characters instead
     * of throwing an exception.
     */
    function multibyteAwareBtoa(str) {
        return btoa(toBinary(str));
    }
    exports.multibyteAwareBtoa = multibyteAwareBtoa;
    class ModifierKeyEmitter extends event.Emitter {
        constructor() {
            super();
            this._subscriptions = new lifecycle_1.DisposableStore();
            this._keyStatus = {
                altKey: false,
                shiftKey: false,
                ctrlKey: false,
                metaKey: false
            };
            this._subscriptions.add(event.Event.runAndSubscribe(exports.onDidRegisterWindow, ({ window, disposables }) => this.registerListeners(window, disposables), { window: window_1.mainWindow, disposables: this._subscriptions }));
        }
        registerListeners(window, disposables) {
            disposables.add(addDisposableListener(window, 'keydown', e => {
                if (e.defaultPrevented) {
                    return;
                }
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                // If Alt-key keydown event is repeated, ignore it #112347
                // Only known to be necessary for Alt-Key at the moment #115810
                if (event.keyCode === 6 /* KeyCode.Alt */ && e.repeat) {
                    return;
                }
                if (e.altKey && !this._keyStatus.altKey) {
                    this._keyStatus.lastKeyPressed = 'alt';
                }
                else if (e.ctrlKey && !this._keyStatus.ctrlKey) {
                    this._keyStatus.lastKeyPressed = 'ctrl';
                }
                else if (e.metaKey && !this._keyStatus.metaKey) {
                    this._keyStatus.lastKeyPressed = 'meta';
                }
                else if (e.shiftKey && !this._keyStatus.shiftKey) {
                    this._keyStatus.lastKeyPressed = 'shift';
                }
                else if (event.keyCode !== 6 /* KeyCode.Alt */) {
                    this._keyStatus.lastKeyPressed = undefined;
                }
                else {
                    return;
                }
                this._keyStatus.altKey = e.altKey;
                this._keyStatus.ctrlKey = e.ctrlKey;
                this._keyStatus.metaKey = e.metaKey;
                this._keyStatus.shiftKey = e.shiftKey;
                if (this._keyStatus.lastKeyPressed) {
                    this._keyStatus.event = e;
                    this.fire(this._keyStatus);
                }
            }, true));
            disposables.add(addDisposableListener(window, 'keyup', e => {
                if (e.defaultPrevented) {
                    return;
                }
                if (!e.altKey && this._keyStatus.altKey) {
                    this._keyStatus.lastKeyReleased = 'alt';
                }
                else if (!e.ctrlKey && this._keyStatus.ctrlKey) {
                    this._keyStatus.lastKeyReleased = 'ctrl';
                }
                else if (!e.metaKey && this._keyStatus.metaKey) {
                    this._keyStatus.lastKeyReleased = 'meta';
                }
                else if (!e.shiftKey && this._keyStatus.shiftKey) {
                    this._keyStatus.lastKeyReleased = 'shift';
                }
                else {
                    this._keyStatus.lastKeyReleased = undefined;
                }
                if (this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased) {
                    this._keyStatus.lastKeyPressed = undefined;
                }
                this._keyStatus.altKey = e.altKey;
                this._keyStatus.ctrlKey = e.ctrlKey;
                this._keyStatus.metaKey = e.metaKey;
                this._keyStatus.shiftKey = e.shiftKey;
                if (this._keyStatus.lastKeyReleased) {
                    this._keyStatus.event = e;
                    this.fire(this._keyStatus);
                }
            }, true));
            disposables.add(addDisposableListener(window.document.body, 'mousedown', () => {
                this._keyStatus.lastKeyPressed = undefined;
            }, true));
            disposables.add(addDisposableListener(window.document.body, 'mouseup', () => {
                this._keyStatus.lastKeyPressed = undefined;
            }, true));
            disposables.add(addDisposableListener(window.document.body, 'mousemove', e => {
                if (e.buttons) {
                    this._keyStatus.lastKeyPressed = undefined;
                }
            }, true));
            disposables.add(addDisposableListener(window, 'blur', () => {
                this.resetKeyStatus();
            }));
        }
        get keyStatus() {
            return this._keyStatus;
        }
        get isModifierPressed() {
            return this._keyStatus.altKey || this._keyStatus.ctrlKey || this._keyStatus.metaKey || this._keyStatus.shiftKey;
        }
        /**
         * Allows to explicitly reset the key status based on more knowledge (#109062)
         */
        resetKeyStatus() {
            this.doResetKeyStatus();
            this.fire(this._keyStatus);
        }
        doResetKeyStatus() {
            this._keyStatus = {
                altKey: false,
                shiftKey: false,
                ctrlKey: false,
                metaKey: false
            };
        }
        static getInstance() {
            if (!ModifierKeyEmitter.instance) {
                ModifierKeyEmitter.instance = new ModifierKeyEmitter();
            }
            return ModifierKeyEmitter.instance;
        }
        dispose() {
            super.dispose();
            this._subscriptions.dispose();
        }
    }
    exports.ModifierKeyEmitter = ModifierKeyEmitter;
    function getCookieValue(name) {
        const match = document.cookie.match('(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)'); // See https://stackoverflow.com/a/25490531
        return match ? match.pop() : undefined;
    }
    exports.getCookieValue = getCookieValue;
    class DragAndDropObserver extends lifecycle_1.Disposable {
        constructor(element, callbacks) {
            super();
            this.element = element;
            this.callbacks = callbacks;
            // A helper to fix issues with repeated DRAG_ENTER / DRAG_LEAVE
            // calls see https://github.com/microsoft/vscode/issues/14470
            // when the element has child elements where the events are fired
            // repeadedly.
            this.counter = 0;
            // Allows to measure the duration of the drag operation.
            this.dragStartTime = 0;
            this.registerListeners();
        }
        registerListeners() {
            if (this.callbacks.onDragStart) {
                this._register(addDisposableListener(this.element, exports.EventType.DRAG_START, (e) => {
                    this.callbacks.onDragStart?.(e);
                }));
            }
            if (this.callbacks.onDrag) {
                this._register(addDisposableListener(this.element, exports.EventType.DRAG, (e) => {
                    this.callbacks.onDrag?.(e);
                }));
            }
            this._register(addDisposableListener(this.element, exports.EventType.DRAG_ENTER, (e) => {
                this.counter++;
                this.dragStartTime = e.timeStamp;
                this.callbacks.onDragEnter?.(e);
            }));
            this._register(addDisposableListener(this.element, exports.EventType.DRAG_OVER, (e) => {
                e.preventDefault(); // needed so that the drop event fires (https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome)
                this.callbacks.onDragOver?.(e, e.timeStamp - this.dragStartTime);
            }));
            this._register(addDisposableListener(this.element, exports.EventType.DRAG_LEAVE, (e) => {
                this.counter--;
                if (this.counter === 0) {
                    this.dragStartTime = 0;
                    this.callbacks.onDragLeave?.(e);
                }
            }));
            this._register(addDisposableListener(this.element, exports.EventType.DRAG_END, (e) => {
                this.counter = 0;
                this.dragStartTime = 0;
                this.callbacks.onDragEnd?.(e);
            }));
            this._register(addDisposableListener(this.element, exports.EventType.DROP, (e) => {
                this.counter = 0;
                this.dragStartTime = 0;
                this.callbacks.onDrop?.(e);
            }));
        }
    }
    exports.DragAndDropObserver = DragAndDropObserver;
    const H_REGEX = /(?<tag>[\w\-]+)?(?:#(?<id>[\w\-]+))?(?<class>(?:\.(?:[\w\-]+))*)(?:@(?<name>(?:[\w\_])+))?/;
    function h(tag, ...args) {
        let attributes;
        let children;
        if (Array.isArray(args[0])) {
            attributes = {};
            children = args[0];
        }
        else {
            attributes = args[0] || {};
            children = args[1];
        }
        const match = H_REGEX.exec(tag);
        if (!match || !match.groups) {
            throw new Error('Bad use of h');
        }
        const tagName = match.groups['tag'] || 'div';
        const el = document.createElement(tagName);
        if (match.groups['id']) {
            el.id = match.groups['id'];
        }
        const classNames = [];
        if (match.groups['class']) {
            for (const className of match.groups['class'].split('.')) {
                if (className !== '') {
                    classNames.push(className);
                }
            }
        }
        if (attributes.className !== undefined) {
            for (const className of attributes.className.split('.')) {
                if (className !== '') {
                    classNames.push(className);
                }
            }
        }
        if (classNames.length > 0) {
            el.className = classNames.join(' ');
        }
        const result = {};
        if (match.groups['name']) {
            result[match.groups['name']] = el;
        }
        if (children) {
            for (const c of children) {
                if (c instanceof HTMLElement) {
                    el.appendChild(c);
                }
                else if (typeof c === 'string') {
                    el.append(c);
                }
                else if ('root' in c) {
                    Object.assign(result, c);
                    el.appendChild(c.root);
                }
            }
        }
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                continue;
            }
            else if (key === 'style') {
                for (const [cssKey, cssValue] of Object.entries(value)) {
                    el.style.setProperty(camelCaseToHyphenCase(cssKey), typeof cssValue === 'number' ? cssValue + 'px' : '' + cssValue);
                }
            }
            else if (key === 'tabIndex') {
                el.tabIndex = value;
            }
            else {
                el.setAttribute(camelCaseToHyphenCase(key), value.toString());
            }
        }
        result['root'] = el;
        return result;
    }
    exports.h = h;
    function camelCaseToHyphenCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    function copyAttributes(from, to, filter) {
        for (const { name, value } of from.attributes) {
            if (!filter || filter.includes(name)) {
                to.setAttribute(name, value);
            }
        }
    }
    exports.copyAttributes = copyAttributes;
    function copyAttribute(from, to, name) {
        const value = from.getAttribute(name);
        if (value) {
            to.setAttribute(name, value);
        }
        else {
            to.removeAttribute(name);
        }
    }
    function trackAttributes(from, to, filter) {
        copyAttributes(from, to, filter);
        const disposables = new lifecycle_1.DisposableStore();
        disposables.add(exports.sharedMutationObserver.observe(from, disposables, { attributes: true, attributeFilter: filter })(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName) {
                    copyAttribute(from, to, mutation.attributeName);
                }
            }
        }));
        return disposables;
    }
    exports.trackAttributes = trackAttributes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvZG9tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7SUF1QmhHLHlDQUF5QztJQUU1QixLQVlULENBQUM7UUFDSixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztRQUV6RCxJQUFBLHlCQUFnQixFQUFDLG1CQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFLE1BQU0sRUFBRSxtQkFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLDJCQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFbkcsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQXlCLENBQUM7UUFDdkUsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQWMsQ0FBQztRQUM5RCxNQUFNLHNCQUFzQixHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBYyxDQUFDO1FBRS9ELE9BQU87WUFDTixtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQyxLQUFLO1lBQzlDLHNCQUFzQixFQUFFLHNCQUFzQixDQUFDLEtBQUs7WUFDcEQscUJBQXFCLEVBQUUscUJBQXFCLENBQUMsS0FBSztZQUNsRCxjQUFjLENBQUMsTUFBa0I7Z0JBQ2hDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztvQkFDeEMsT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQztnQkFDeEIsQ0FBQztnQkFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztnQkFFMUMsTUFBTSxnQkFBZ0IsR0FBRztvQkFDeEIsTUFBTTtvQkFDTixXQUFXLEVBQUUsV0FB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
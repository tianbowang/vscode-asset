/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/mouseEvent", "vs/base/browser/ui/scrollbar/horizontalScrollbar", "vs/base/browser/ui/scrollbar/verticalScrollbar", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/scrollable", "vs/css!./media/scrollbars"], function (require, exports, browser_1, dom, fastDomNode_1, mouseEvent_1, horizontalScrollbar_1, verticalScrollbar_1, widget_1, async_1, event_1, lifecycle_1, platform, scrollable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DomScrollableElement = exports.SmoothScrollableElement = exports.ScrollableElement = exports.AbstractScrollableElement = exports.MouseWheelClassifier = void 0;
    const HIDE_TIMEOUT = 500;
    const SCROLL_WHEEL_SENSITIVITY = 50;
    const SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED = true;
    class MouseWheelClassifierItem {
        constructor(timestamp, deltaX, deltaY) {
            this.timestamp = timestamp;
            this.deltaX = deltaX;
            this.deltaY = deltaY;
            this.score = 0;
        }
    }
    class MouseWheelClassifier {
        static { this.INSTANCE = new MouseWheelClassifier(); }
        constructor() {
            this._capacity = 5;
            this._memory = [];
            this._front = -1;
            this._rear = -1;
        }
        isPhysicalMouseWheel() {
            if (this._front === -1 && this._rear === -1) {
                // no elements
                return false;
            }
            // 0.5 * last + 0.25 * 2nd last + 0.125 * 3rd last + ...
            let remainingInfluence = 1;
            let score = 0;
            let iteration = 1;
            let index = this._rear;
            do {
                const influence = (index === this._front ? remainingInfluence : Math.pow(2, -iteration));
                remainingInfluence -= influence;
                score += this._memory[index].score * influence;
                if (index === this._front) {
                    break;
                }
                index = (this._capacity + index - 1) % this._capacity;
                iteration++;
            } while (true);
            return (score <= 0.5);
        }
        acceptStandardWheelEvent(e) {
            const targetWindow = dom.getWindow(e.browserEvent);
            const osZoomFactor = targetWindow.devicePixelRatio / (0, browser_1.getZoomFactor)(targetWindow);
            if (platform.isWindows || platform.isLinux) {
                // On Windows and Linux, the incoming delta events are multiplied with the OS zoom factor.
                // The OS zoom factor can be reverse engineered by using the device pixel ratio and the configured zoom factor into account.
                this.accept(Date.now(), e.deltaX / osZoomFactor, e.deltaY / osZoomFactor);
            }
            else {
                this.accept(Date.now(), e.deltaX, e.deltaY);
            }
        }
        accept(timestamp, deltaX, deltaY) {
            const item = new MouseWheelClassifierItem(timestamp, deltaX, deltaY);
            item.score = this._computeScore(item);
            if (this._front === -1 && this._rear === -1) {
                this._memory[0] = item;
                this._front = 0;
                this._rear = 0;
            }
            else {
                this._rear = (this._rear + 1) % this._capacity;
                if (this._rear === this._front) {
                    // Drop oldest
                    this._front = (this._front + 1) % this._capacity;
                }
                this._memory[this._rear] = item;
            }
        }
        /**
         * A score between 0 and 1 for `item`.
         *  - a score towards 0 indicates that the source appears to be a physical mouse wheel
         *  - a score towards 1 indicates that the source appears to be a touchpad or magic mouse, etc.
         */
        _computeScore(item) {
            if (Math.abs(item.deltaX) > 0 && Math.abs(item.deltaY) > 0) {
                // both axes exercised => definitely not a physical mouse wheel
                return 1;
            }
            let score = 0.5;
            const prev = (this._front === -1 && this._rear === -1 ? null : this._memory[this._rear]);
            if (prev) {
                // const deltaT = item.timestamp - prev.timestamp;
                // if (deltaT < 1000 / 30) {
                // 	// sooner than X times per second => indicator that this is not a physical mouse wheel
                // 	score += 0.25;
                // }
                // if (item.deltaX === prev.deltaX && item.deltaY === prev.deltaY) {
                // 	// equal amplitude => indicator that this is a physical mouse wheel
                // 	score -= 0.25;
                // }
            }
            if (!this._isAlmostInt(item.deltaX) || !this._isAlmostInt(item.deltaY)) {
                // non-integer deltas => indicator that this is not a physical mouse wheel
                score += 0.25;
            }
            return Math.min(Math.max(score, 0), 1);
        }
        _isAlmostInt(value) {
            const delta = Math.abs(Math.round(value) - value);
            return (delta < 0.01);
        }
    }
    exports.MouseWheelClassifier = MouseWheelClassifier;
    class AbstractScrollableElement extends widget_1.Widget {
        get options() {
            return this._options;
        }
        constructor(element, options, scrollable) {
            super();
            this._onScroll = this._register(new event_1.Emitter());
            this.onScroll = this._onScroll.event;
            this._onWillScroll = this._register(new event_1.Emitter());
            this.onWillScroll = this._onWillScroll.event;
            element.style.overflow = 'hidden';
            this._options = resolveOptions(options);
            this._scrollable = scrollable;
            this._register(this._scrollable.onScroll((e) => {
                this._onWillScroll.fire(e);
                this._onDidScroll(e);
                this._onScroll.fire(e);
            }));
            const scrollbarHost = {
                onMouseWheel: (mouseWheelEvent) => this._onMouseWheel(mouseWheelEvent),
                onDragStart: () => this._onDragStart(),
                onDragEnd: () => this._onDragEnd(),
            };
            this._verticalScrollbar = this._register(new verticalScrollbar_1.VerticalScrollbar(this._scrollable, this._options, scrollbarHost));
            this._horizontalScrollbar = this._register(new horizontalScrollbar_1.HorizontalScrollbar(this._scrollable, this._options, scrollbarHost));
            this._domNode = document.createElement('div');
            this._domNode.className = 'monaco-scrollable-element ' + this._options.className;
            this._domNode.setAttribute('role', 'presentation');
            this._domNode.style.position = 'relative';
            this._domNode.style.overflow = 'hidden';
            this._domNode.appendChild(element);
            this._domNode.appendChild(this._horizontalScrollbar.domNode.domNode);
            this._domNode.appendChild(this._verticalScrollbar.domNode.domNode);
            if (this._options.useShadows) {
                this._leftShadowDomNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
                this._leftShadowDomNode.setClassName('shadow');
                this._domNode.appendChild(this._leftShadowDomNode.domNode);
                this._topShadowDomNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
                this._topShadowDomNode.setClassName('shadow');
                this._domNode.appendChild(this._topShadowDomNode.domNode);
                this._topLeftShadowDomNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
                this._topLeftShadowDomNode.setClassName('shadow');
                this._domNode.appendChild(this._topLeftShadowDomNode.domNode);
            }
            else {
                this._leftShadowDomNode = null;
                this._topShadowDomNode = null;
                this._topLeftShadowDomNode = null;
            }
            this._listenOnDomNode = this._options.listenOnDomNode || this._domNode;
            this._mouseWheelToDispose = [];
            this._setListeningToMouseWheel(this._options.handleMouseWheel);
            this.onmouseover(this._listenOnDomNode, (e) => this._onMouseOver(e));
            this.onmouseleave(this._listenOnDomNode, (e) => this._onMouseLeave(e));
            this._hideTimeout = this._register(new async_1.TimeoutTimer());
            this._isDragging = false;
            this._mouseIsOver = false;
            this._shouldRender = true;
            this._revealOnScroll = true;
        }
        dispose() {
            this._mouseWheelToDispose = (0, lifecycle_1.dispose)(this._mouseWheelToDispose);
            super.dispose();
        }
        /**
         * Get the generated 'scrollable' dom node
         */
        getDomNode() {
            return this._domNode;
        }
        getOverviewRulerLayoutInfo() {
            return {
                parent: this._domNode,
                insertBefore: this._verticalScrollbar.domNode.domNode,
            };
        }
        /**
         * Delegate a pointer down event to the vertical scrollbar.
         * This is to help with clicking somewhere else and having the scrollbar react.
         */
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this._verticalScrollbar.delegatePointerDown(browserEvent);
        }
        getScrollDimensions() {
            return this._scrollable.getScrollDimensions();
        }
        setScrollDimensions(dimensions) {
            this._scrollable.setScrollDimensions(dimensions, false);
        }
        /**
         * Update the class name of the scrollable element.
         */
        updateClassName(newClassName) {
            this._options.className = newClassName;
            // Defaults are different on Macs
            if (platform.isMacintosh) {
                this._options.className += ' mac';
            }
            this._domNode.className = 'monaco-scrollable-element ' + this._options.className;
        }
        /**
         * Update configuration options for the scrollbar.
         */
        updateOptions(newOptions) {
            if (typeof newOptions.handleMouseWheel !== 'undefined') {
                this._options.handleMouseWheel = newOptions.handleMouseWheel;
                this._setListeningToMouseWheel(this._options.handleMouseWheel);
            }
            if (typeof newOptions.mouseWheelScrollSensitivity !== 'undefined') {
                this._options.mouseWheelScrollSensitivity = newOptions.mouseWheelScrollSensitivity;
            }
            if (typeof newOptions.fastScrollSensitivity !== 'undefined') {
                this._options.fastScrollSensitivity = newOptions.fastScrollSensitivity;
            }
            if (typeof newOptions.scrollPredominantAxis !== 'undefined') {
                this._options.scrollPredominantAxis = newOptions.scrollPredominantAxis;
            }
            if (typeof newOptions.horizontal !== 'undefined') {
                this._options.horizontal = newOptions.horizontal;
            }
            if (typeof newOptions.vertical !== 'undefined') {
                this._options.vertical = newOptions.vertical;
            }
            if (typeof newOptions.horizontalScrollbarSize !== 'undefined') {
                this._options.horizontalScrollbarSize = newOptions.horizontalScrollbarSize;
            }
            if (typeof newOptions.verticalScrollbarSize !== 'undefined') {
                this._options.verticalScrollbarSize = newOptions.verticalScrollbarSize;
            }
            if (typeof newOptions.scrollByPage !== 'undefined') {
                this._options.scrollByPage = newOptions.scrollByPage;
            }
            this._horizontalScrollbar.updateOptions(this._options);
            this._verticalScrollbar.updateOptions(this._options);
            if (!this._options.lazyRender) {
                this._render();
            }
        }
        setRevealOnScroll(value) {
            this._revealOnScroll = value;
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this._onMouseWheel(new mouseEvent_1.StandardWheelEvent(browserEvent));
        }
        // -------------------- mouse wheel scrolling --------------------
        _setListeningToMouseWheel(shouldListen) {
            const isListening = (this._mouseWheelToDispose.length > 0);
            if (isListening === shouldListen) {
                // No change
                return;
            }
            // Stop listening (if necessary)
            this._mouseWheelToDispose = (0, lifecycle_1.dispose)(this._mouseWheelToDispose);
            // Start listening (if necessary)
            if (shouldListen) {
                const onMouseWheel = (browserEvent) => {
                    this._onMouseWheel(new mouseEvent_1.StandardWheelEvent(browserEvent));
                };
                this._mouseWheelToDispose.push(dom.addDisposableListener(this._listenOnDomNode, dom.EventType.MOUSE_WHEEL, onMouseWheel, { passive: false }));
            }
        }
        _onMouseWheel(e) {
            if (e.browserEvent?.defaultPrevented) {
                return;
            }
            const classifier = MouseWheelClassifier.INSTANCE;
            if (SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED) {
                classifier.acceptStandardWheelEvent(e);
            }
            // console.log(`${Date.now()}, ${e.deltaY}, ${e.deltaX}`);
            let didScroll = false;
            if (e.deltaY || e.deltaX) {
                let deltaY = e.deltaY * this._options.mouseWheelScrollSensitivity;
                let deltaX = e.deltaX * this._options.mouseWheelScrollSensitivity;
                if (this._options.scrollPredominantAxis) {
                    if (this._options.scrollYToX && deltaX + deltaY === 0) {
                        // when configured to map Y to X and we both see
                        // no dominant axis and X and Y are competing with
                        // identical values into opposite directions, we
                        // ignore the delta as we cannot make a decision then
                        deltaX = deltaY = 0;
                    }
                    else if (Math.abs(deltaY) >= Math.abs(deltaX)) {
                        deltaX = 0;
                    }
                    else {
                        deltaY = 0;
                    }
                }
                if (this._options.flipAxes) {
                    [deltaY, deltaX] = [deltaX, deltaY];
                }
                // Convert vertical scrolling to horizontal if shift is held, this
                // is handled at a higher level on Mac
                const shiftConvert = !platform.isMacintosh && e.browserEvent && e.browserEvent.shiftKey;
                if ((this._options.scrollYToX || shiftConvert) && !deltaX) {
                    deltaX = deltaY;
                    deltaY = 0;
                }
                if (e.browserEvent && e.browserEvent.altKey) {
                    // fastScrolling
                    deltaX = deltaX * this._options.fastScrollSensitivity;
                    deltaY = deltaY * this._options.fastScrollSensitivity;
                }
                const futureScrollPosition = this._scrollable.getFutureScrollPosition();
                let desiredScrollPosition = {};
                if (deltaY) {
                    const deltaScrollTop = SCROLL_WHEEL_SENSITIVITY * deltaY;
                    // Here we convert values such as -0.3 to -1 or 0.3 to 1, otherwise low speed scrolling will never scroll
                    const desiredScrollTop = futureScrollPosition.scrollTop - (deltaScrollTop < 0 ? Math.floor(deltaScrollTop) : Math.ceil(deltaScrollTop));
                    this._verticalScrollbar.writeScrollPosition(desiredScrollPosition, desiredScrollTop);
                }
                if (deltaX) {
                    const deltaScrollLeft = SCROLL_WHEEL_SENSITIVITY * deltaX;
                    // Here we convert values such as -0.3 to -1 or 0.3 to 1, otherwise low speed scrolling will never scroll
                    const desiredScrollLeft = futureScrollPosition.scrollLeft - (deltaScrollLeft < 0 ? Math.floor(deltaScrollLeft) : Math.ceil(deltaScrollLeft));
                    this._horizontalScrollbar.writeScrollPosition(desiredScrollPosition, desiredScrollLeft);
                }
                // Check that we are scrolling towards a location which is valid
                desiredScrollPosition = this._scrollable.validateScrollPosition(desiredScrollPosition);
                if (futureScrollPosition.scrollLeft !== desiredScrollPosition.scrollLeft || futureScrollPosition.scrollTop !== desiredScrollPosition.scrollTop) {
                    const canPerformSmoothScroll = (SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED
                        && this._options.mouseWheelSmoothScroll
                        && classifier.isPhysicalMouseWheel());
                    if (canPerformSmoothScroll) {
                        this._scrollable.setScrollPositionSmooth(desiredScrollPosition);
                    }
                    else {
                        this._scrollable.setScrollPositionNow(desiredScrollPosition);
                    }
                    didScroll = true;
                }
            }
            let consumeMouseWheel = didScroll;
            if (!consumeMouseWheel && this._options.alwaysConsumeMouseWheel) {
                consumeMouseWheel = true;
            }
            if (!consumeMouseWheel && this._options.consumeMouseWheelIfScrollbarIsNeeded && (this._verticalScrollbar.isNeeded() || this._horizontalScrollbar.isNeeded())) {
                consumeMouseWheel = true;
            }
            if (consumeMouseWheel) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        _onDidScroll(e) {
            this._shouldRender = this._horizontalScrollbar.onDidScroll(e) || this._shouldRender;
            this._shouldRender = this._verticalScrollbar.onDidScroll(e) || this._shouldRender;
            if (this._options.useShadows) {
                this._shouldRender = true;
            }
            if (this._revealOnScroll) {
                this._reveal();
            }
            if (!this._options.lazyRender) {
                this._render();
            }
        }
        /**
         * Render / mutate the DOM now.
         * Should be used together with the ctor option `lazyRender`.
         */
        renderNow() {
            if (!this._options.lazyRender) {
                throw new Error('Please use `lazyRender` together with `renderNow`!');
            }
            this._render();
        }
        _render() {
            if (!this._shouldRender) {
                return;
            }
            this._shouldRender = false;
            this._horizontalScrollbar.render();
            this._verticalScrollbar.render();
            if (this._options.useShadows) {
                const scrollState = this._scrollable.getCurrentScrollPosition();
                const enableTop = scrollState.scrollTop > 0;
                const enableLeft = scrollState.scrollLeft > 0;
                const leftClassName = (enableLeft ? ' left' : '');
                const topClassName = (enableTop ? ' top' : '');
                const topLeftClassName = (enableLeft || enableTop ? ' top-left-corner' : '');
                this._leftShadowDomNode.setClassName(`shadow${leftClassName}`);
                this._topShadowDomNode.setClassName(`shadow${topClassName}`);
                this._topLeftShadowDomNode.setClassName(`shadow${topLeftClassName}${topClassName}${leftClassName}`);
            }
        }
        // -------------------- fade in / fade out --------------------
        _onDragStart() {
            this._isDragging = true;
            this._reveal();
        }
        _onDragEnd() {
            this._isDragging = false;
            this._hide();
        }
        _onMouseLeave(e) {
            this._mouseIsOver = false;
            this._hide();
        }
        _onMouseOver(e) {
            this._mouseIsOver = true;
            this._reveal();
        }
        _reveal() {
            this._verticalScrollbar.beginReveal();
            this._horizontalScrollbar.beginReveal();
            this._scheduleHide();
        }
        _hide() {
            if (!this._mouseIsOver && !this._isDragging) {
                this._verticalScrollbar.beginHide();
                this._horizontalScrollbar.beginHide();
            }
        }
        _scheduleHide() {
            if (!this._mouseIsOver && !this._isDragging) {
                this._hideTimeout.cancelAndSet(() => this._hide(), HIDE_TIMEOUT);
            }
        }
    }
    exports.AbstractScrollableElement = AbstractScrollableElement;
    class ScrollableElement extends AbstractScrollableElement {
        constructor(element, options) {
            options = options || {};
            options.mouseWheelSmoothScroll = false;
            const scrollable = new scrollable_1.Scrollable({
                forceIntegerValues: true,
                smoothScrollDuration: 0,
                scheduleAtNextAnimationFrame: (callback) => dom.scheduleAtNextAnimationFrame(dom.getWindow(element), callback)
            });
            super(element, options, scrollable);
            this._register(scrollable);
        }
        setScrollPosition(update) {
            this._scrollable.setScrollPositionNow(update);
        }
        getScrollPosition() {
            return this._scrollable.getCurrentScrollPosition();
        }
    }
    exports.ScrollableElement = ScrollableElement;
    class SmoothScrollableElement extends AbstractScrollableElement {
        constructor(element, options, scrollable) {
            super(element, options, scrollable);
        }
        setScrollPosition(update) {
            if (update.reuseAnimation) {
                this._scrollable.setScrollPositionSmooth(update, update.reuseAnimation);
            }
            else {
                this._scrollable.setScrollPositionNow(update);
            }
        }
        getScrollPosition() {
            return this._scrollable.getCurrentScrollPosition();
        }
    }
    exports.SmoothScrollableElement = SmoothScrollableElement;
    class DomScrollableElement extends AbstractScrollableElement {
        constructor(element, options) {
            options = options || {};
            options.mouseWheelSmoothScroll = false;
            const scrollable = new scrollable_1.Scrollable({
                forceIntegerValues: false, // See https://github.com/microsoft/vscode/issues/139877
                smoothScrollDuration: 0,
                scheduleAtNextAnimationFrame: (callback) => dom.scheduleAtNextAnimationFrame(dom.getWindow(element), callback)
            });
            super(element, options, scrollable);
            this._register(scrollable);
            this._element = element;
            this._register(this.onScroll((e) => {
                if (e.scrollTopChanged) {
                    this._element.scrollTop = e.scrollTop;
                }
                if (e.scrollLeftChanged) {
                    this._element.scrollLeft = e.scrollLeft;
                }
            }));
            this.scanDomNode();
        }
        setScrollPosition(update) {
            this._scrollable.setScrollPositionNow(update);
        }
        getScrollPosition() {
            return this._scrollable.getCurrentScrollPosition();
        }
        scanDomNode() {
            // width, scrollLeft, scrollWidth, height, scrollTop, scrollHeight
            this.setScrollDimensions({
                width: this._element.clientWidth,
                scrollWidth: this._element.scrollWidth,
                height: this._element.clientHeight,
                scrollHeight: this._element.scrollHeight
            });
            this.setScrollPosition({
                scrollLeft: this._element.scrollLeft,
                scrollTop: this._element.scrollTop,
            });
        }
    }
    exports.DomScrollableElement = DomScrollableElement;
    function resolveOptions(opts) {
        const result = {
            lazyRender: (typeof opts.lazyRender !== 'undefined' ? opts.lazyRender : false),
            className: (typeof opts.className !== 'undefined' ? opts.className : ''),
            useShadows: (typeof opts.useShadows !== 'undefined' ? opts.useShadows : true),
            handleMouseWheel: (typeof opts.handleMouseWheel !== 'undefined' ? opts.handleMouseWheel : true),
            flipAxes: (typeof opts.flipAxes !== 'undefined' ? opts.flipAxes : false),
            consumeMouseWheelIfScrollbarIsNeeded: (typeof opts.consumeMouseWheelIfScrollbarIsNeeded !== 'undefined' ? opts.consumeMouseWheelIfScrollbarIsNeeded : false),
            alwaysConsumeMouseWheel: (typeof opts.alwaysConsumeMouseWheel !== 'undefined' ? opts.alwaysConsumeMouseWheel : false),
            scrollYToX: (typeof opts.scrollYToX !== 'undefined' ? opts.scrollYToX : false),
            mouseWheelScrollSensitivity: (typeof opts.mouseWheelScrollSensitivity !== 'undefined' ? opts.mouseWheelScrollSensitivity : 1),
            fastScrollSensitivity: (typeof opts.fastScrollSensitivity !== 'undefined' ? opts.fastScrollSensitivity : 5),
            scrollPredominantAxis: (typeof opts.scrollPredominantAxis !== 'undefined' ? opts.scrollPredominantAxis : true),
            mouseWheelSmoothScroll: (typeof opts.mouseWheelSmoothScroll !== 'undefined' ? opts.mouseWheelSmoothScroll : true),
            arrowSize: (typeof opts.arrowSize !== 'undefined' ? opts.arrowSize : 11),
            listenOnDomNode: (typeof opts.listenOnDomNode !== 'undefined' ? opts.listenOnDomNode : null),
            horizontal: (typeof opts.horizontal !== 'undefined' ? opts.horizontal : 1 /* ScrollbarVisibility.Auto */),
            horizontalScrollbarSize: (typeof opts.horizontalScrollbarSize !== 'undefined' ? opts.horizontalScrollbarSize : 10),
            horizontalSliderSize: (typeof opts.horizontalSliderSize !== 'undefined' ? opts.horizontalSliderSize : 0),
            horizontalHasArrows: (typeof opts.horizontalHasArrows !== 'undefined' ? opts.horizontalHasArrows : false),
            vertical: (typeof opts.vertical !== 'undefined' ? opts.vertical : 1 /* ScrollbarVisibility.Auto */),
            verticalScrollbarSize: (typeof opts.verticalScrollbarSize !== 'undefined' ? opts.verticalScrollbarSize : 10),
            verticalHasArrows: (typeof opts.verticalHasArrows !== 'undefined' ? opts.verticalHasArrows : false),
            verticalSliderSize: (typeof opts.verticalSliderSize !== 'undefined' ? opts.verticalSliderSize : 0),
            scrollByPage: (typeof opts.scrollByPage !== 'undefined' ? opts.scrollByPage : false)
        };
        result.horizontalSliderSize = (typeof opts.horizontalSliderSize !== 'undefined' ? opts.horizontalSliderSize : result.horizontalScrollbarSize);
        result.verticalSliderSize = (typeof opts.verticalSliderSize !== 'undefined' ? opts.verticalSliderSize : result.verticalScrollbarSize);
        // Defaults are different on Macs
        if (platform.isMacintosh) {
            result.className += ' mac';
        }
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsYWJsZUVsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9zY3JvbGxiYXIvc2Nyb2xsYWJsZUVsZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7SUFDekIsTUFBTSx3QkFBd0IsR0FBRyxFQUFFLENBQUM7SUFDcEMsTUFBTSxrQ0FBa0MsR0FBRyxJQUFJLENBQUM7SUFPaEQsTUFBTSx3QkFBd0I7UUFNN0IsWUFBWSxTQUFpQixFQUFFLE1BQWMsRUFBRSxNQUFjO1lBQzVELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLENBQUM7S0FDRDtJQUVELE1BQWEsb0JBQW9CO2lCQUVULGFBQVEsR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUM7UUFPN0Q7WUFDQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakIsQ0FBQztRQUVNLG9CQUFvQjtZQUMxQixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM3QyxjQUFjO2dCQUNkLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELHdEQUF3RDtZQUN4RCxJQUFJLGtCQUFrQixHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFFbEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN2QixHQUFHLENBQUM7Z0JBQ0gsTUFBTSxTQUFTLEdBQUcsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDekYsa0JBQWtCLElBQUksU0FBUyxDQUFDO2dCQUNoQyxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO2dCQUUvQyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzNCLE1BQU07Z0JBQ1AsQ0FBQztnQkFFRCxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUN0RCxTQUFTLEVBQUUsQ0FBQztZQUNiLENBQUMsUUFBUSxJQUFJLEVBQUU7WUFFZixPQUFPLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSx3QkFBd0IsQ0FBQyxDQUFxQjtZQUNwRCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNuRCxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsZ0JBQWdCLEdBQUcsSUFBQSx1QkFBYSxFQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2pGLElBQUksUUFBUSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzVDLDBGQUEwRjtnQkFDMUYsNEhBQTRIO2dCQUM1SCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLFlBQVksRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxDQUFDO1lBQzNFLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxDQUFDO1FBQ0YsQ0FBQztRQUVNLE1BQU0sQ0FBQyxTQUFpQixFQUFFLE1BQWMsRUFBRSxNQUFjO1lBQzlELE1BQU0sSUFBSSxHQUFHLElBQUksd0JBQXdCLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNoQixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDL0MsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDaEMsY0FBYztvQkFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNsRCxDQUFDO2dCQUNELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNqQyxDQUFDO1FBQ0YsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSyxhQUFhLENBQUMsSUFBOEI7WUFFbkQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzVELCtEQUErRDtnQkFDL0QsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDO1lBRUQsSUFBSSxLQUFLLEdBQVcsR0FBRyxDQUFDO1lBQ3hCLE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDekYsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDVixrREFBa0Q7Z0JBQ2xELDRCQUE0QjtnQkFDNUIsMEZBQTBGO2dCQUMxRixrQkFBa0I7Z0JBQ2xCLElBQUk7Z0JBRUosb0VBQW9FO2dCQUNwRSx1RUFBdUU7Z0JBQ3ZFLGtCQUFrQjtnQkFDbEIsSUFBSTtZQUNMLENBQUM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUN4RSwwRUFBMEU7Z0JBQzFFLEtBQUssSUFBSSxJQUFJLENBQUM7WUFDZixDQUFDO1lBRUQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFTyxZQUFZLENBQUMsS0FBYTtZQUNqQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDbEQsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN2QixDQUFDOztJQWhIRixvREFpSEM7SUFFRCxNQUFzQix5QkFBMEIsU0FBUSxlQUFNO1FBOEI3RCxJQUFXLE9BQU87WUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxZQUFzQixPQUFvQixFQUFFLE9BQXlDLEVBQUUsVUFBc0I7WUFDNUcsS0FBSyxFQUFFLENBQUM7WUFYUSxjQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDeEQsYUFBUSxHQUF1QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUVuRCxrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWUsQ0FBQyxDQUFDO1lBQzVELGlCQUFZLEdBQXVCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBUTNFLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUU5QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxhQUFhLEdBQWtCO2dCQUNwQyxZQUFZLEVBQUUsQ0FBQyxlQUFtQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQztnQkFDMUYsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3RDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2FBQ2xDLENBQUM7WUFDRixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHFDQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2hILElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUNBQW1CLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFFcEgsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLDRCQUE0QixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1lBQ2pGLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1lBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRW5FLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUEsK0JBQWlCLEVBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUMzRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRTNELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFBLCtCQUFpQixFQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDMUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUUxRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBQSwrQkFBaUIsRUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztnQkFDL0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFDOUIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztZQUNuQyxDQUFDO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7WUFFdkUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRS9ELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV2RSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxvQkFBWSxFQUFFLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUN6QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUUxQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUUxQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQy9ELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxVQUFVO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBRU0sMEJBQTBCO1lBQ2hDLE9BQU87Z0JBQ04sTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUNyQixZQUFZLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxPQUFPO2FBQ3JELENBQUM7UUFDSCxDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksb0NBQW9DLENBQUMsWUFBMEI7WUFDckUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFTSxtQkFBbUI7WUFDekIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDL0MsQ0FBQztRQUVNLG1CQUFtQixDQUFDLFVBQWdDO1lBQzFELElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRDs7V0FFRztRQUNJLGVBQWUsQ0FBQyxZQUFvQjtZQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7WUFDdkMsaUNBQWlDO1lBQ2pDLElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUM7WUFDbkMsQ0FBQztZQUNELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLDRCQUE0QixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBQ2xGLENBQUM7UUFFRDs7V0FFRztRQUNJLGFBQWEsQ0FBQyxVQUEwQztZQUM5RCxJQUFJLE9BQU8sVUFBVSxDQUFDLGdCQUFnQixLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNoRSxDQUFDO1lBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQywyQkFBMkIsS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsR0FBRyxVQUFVLENBQUMsMkJBQTJCLENBQUM7WUFDcEYsQ0FBQztZQUNELElBQUksT0FBTyxVQUFVLENBQUMscUJBQXFCLEtBQUssV0FBVyxFQUFFLENBQUM7Z0JBQzdELElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLEdBQUcsVUFBVSxDQUFDLHFCQUFxQixDQUFDO1lBQ3hFLENBQUM7WUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLHFCQUFxQixLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUM3RCxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixHQUFHLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQztZQUN4RSxDQUFDO1lBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxVQUFVLEtBQUssV0FBVyxFQUFFLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7WUFDbEQsQ0FBQztZQUNELElBQUksT0FBTyxVQUFVLENBQUMsUUFBUSxLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUNoRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1lBQzlDLENBQUM7WUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLHVCQUF1QixLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUMvRCxJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixHQUFHLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQztZQUM1RSxDQUFDO1lBQ0QsSUFBSSxPQUFPLFVBQVUsQ0FBQyxxQkFBcUIsS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUM7WUFDeEUsQ0FBQztZQUNELElBQUksT0FBTyxVQUFVLENBQUMsWUFBWSxLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDO1lBQ3RELENBQUM7WUFDRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVyRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLENBQUM7UUFDRixDQUFDO1FBRU0saUJBQWlCLENBQUMsS0FBYztZQUN0QyxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztRQUM5QixDQUFDO1FBRU0saUNBQWlDLENBQUMsWUFBOEI7WUFDdEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLCtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVELGtFQUFrRTtRQUUxRCx5QkFBeUIsQ0FBQyxZQUFxQjtZQUN0RCxNQUFNLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFM0QsSUFBSSxXQUFXLEtBQUssWUFBWSxFQUFFLENBQUM7Z0JBQ2xDLFlBQVk7Z0JBQ1osT0FBTztZQUNSLENBQUM7WUFFRCxnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUEsbUJBQU8sRUFBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUUvRCxpQ0FBaUM7WUFDakMsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDbEIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxZQUE4QixFQUFFLEVBQUU7b0JBQ3ZELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSwrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDLENBQUM7Z0JBRUYsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0ksQ0FBQztRQUNGLENBQUM7UUFFTyxhQUFhLENBQUMsQ0FBcUI7WUFDMUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3RDLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFDO1lBQ2pELElBQUksa0NBQWtDLEVBQUUsQ0FBQztnQkFDeEMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7WUFFRCwwREFBMEQ7WUFFMUQsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXRCLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzFCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQztnQkFDbEUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDO2dCQUVsRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQztvQkFDekMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsSUFBSSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO3dCQUN2RCxnREFBZ0Q7d0JBQ2hELGtEQUFrRDt3QkFDbEQsZ0RBQWdEO3dCQUNoRCxxREFBcUQ7d0JBQ3JELE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUNyQixDQUFDO3lCQUFNLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7d0JBQ2pELE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ1osQ0FBQzt5QkFBTSxDQUFDO3dCQUNQLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ1osQ0FBQztnQkFDRixDQUFDO2dCQUVELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDNUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7Z0JBRUQsa0VBQWtFO2dCQUNsRSxzQ0FBc0M7Z0JBQ3RDLE1BQU0sWUFBWSxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO2dCQUN4RixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDM0QsTUFBTSxHQUFHLE1BQU0sQ0FBQztvQkFDaEIsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDWixDQUFDO2dCQUVELElBQUksQ0FBQyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUM3QyxnQkFBZ0I7b0JBQ2hCLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDdEQsTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDO2dCQUN2RCxDQUFDO2dCQUVELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUV4RSxJQUFJLHFCQUFxQixHQUF1QixFQUFFLENBQUM7Z0JBQ25ELElBQUksTUFBTSxFQUFFLENBQUM7b0JBQ1osTUFBTSxjQUFjLEdBQUcsd0JBQXdCLEdBQUcsTUFBTSxDQUFDO29CQUN6RCx5R0FBeUc7b0JBQ3pHLE1BQU0sZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUMsU0FBUyxHQUFHLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUN4SSxJQUFJLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLENBQUMscUJBQXFCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFDdEYsQ0FBQztnQkFDRCxJQUFJLE1BQU0sRUFBRSxDQUFDO29CQUNaLE1BQU0sZUFBZSxHQUFHLHdCQUF3QixHQUFHLE1BQU0sQ0FBQztvQkFDMUQseUdBQXlHO29CQUN6RyxNQUFNLGlCQUFpQixHQUFHLG9CQUFvQixDQUFDLFVBQVUsR0FBRyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztvQkFDN0ksSUFBSSxDQUFDLG9CQUFvQixDQUFDLG1CQUFtQixDQUFDLHFCQUFxQixFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3pGLENBQUM7Z0JBRUQsZ0VBQWdFO2dCQUNoRSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBRXZGLElBQUksb0JBQW9CLENBQUMsVUFBVSxLQUFLLHFCQUFxQixDQUFDLFVBQVUsSUFBSSxvQkFBb0IsQ0FBQyxTQUFTLEtBQUsscUJBQXFCLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBRWhKLE1BQU0sc0JBQXNCLEdBQUcsQ0FDOUIsa0NBQWtDOzJCQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQjsyQkFDcEMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQ3BDLENBQUM7b0JBRUYsSUFBSSxzQkFBc0IsRUFBRSxDQUFDO3dCQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQ2pFLENBQUM7eUJBQU0sQ0FBQzt3QkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQzlELENBQUM7b0JBRUQsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDbEIsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztZQUNsQyxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUNqRSxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDMUIsQ0FBQztZQUNELElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLG9DQUFvQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQzlKLGlCQUFpQixHQUFHLElBQUksQ0FBQztZQUMxQixDQUFDO1lBRUQsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUN2QixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNyQixDQUFDO1FBQ0YsQ0FBQztRQUVPLFlBQVksQ0FBQyxDQUFjO1lBQ2xDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3BGLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDO1lBRWxGLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDM0IsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEIsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEIsQ0FBQztRQUNGLENBQUM7UUFFRDs7O1dBR0c7UUFDSSxTQUFTO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztZQUN2RSxDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxPQUFPO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDekIsT0FBTztZQUNSLENBQUM7WUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUUzQixJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRWpDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2dCQUNoRSxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7Z0JBRTlDLE1BQU0sYUFBYSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRCxNQUFNLFlBQVksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFVBQVUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLGtCQUFtQixDQUFDLFlBQVksQ0FBQyxTQUFTLGFBQWEsRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxpQkFBa0IsQ0FBQyxZQUFZLENBQUMsU0FBUyxZQUFZLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLENBQUMscUJBQXNCLENBQUMsWUFBWSxDQUFDLFNBQVMsZ0JBQWdCLEdBQUcsWUFBWSxHQUFHLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDdEcsQ0FBQztRQUNGLENBQUM7UUFFRCwrREFBK0Q7UUFFdkQsWUFBWTtZQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUVPLFVBQVU7WUFDakIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUVPLGFBQWEsQ0FBQyxDQUFjO1lBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFTyxZQUFZLENBQUMsQ0FBYztZQUNsQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUVPLE9BQU87WUFDZCxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRU8sS0FBSztZQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM3QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN2QyxDQUFDO1FBQ0YsQ0FBQztRQUVPLGFBQWE7WUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNsRSxDQUFDO1FBQ0YsQ0FBQztLQUNEO0lBMVpELDhEQTBaQztJQUVELE1BQWEsaUJBQWtCLFNBQVEseUJBQXlCO1FBRS9ELFlBQVksT0FBb0IsRUFBRSxPQUF5QztZQUMxRSxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztZQUN4QixPQUFPLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO1lBQ3ZDLE1BQU0sVUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQztnQkFDakMsa0JBQWtCLEVBQUUsSUFBSTtnQkFDeEIsb0JBQW9CLEVBQUUsQ0FBQztnQkFDdkIsNEJBQTRCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQzthQUM5RyxDQUFDLENBQUM7WUFDSCxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxNQUEwQjtZQUNsRCxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDcEQsQ0FBQztLQUNEO0lBckJELDhDQXFCQztJQUVELE1BQWEsdUJBQXdCLFNBQVEseUJBQXlCO1FBRXJFLFlBQVksT0FBb0IsRUFBRSxPQUF5QyxFQUFFLFVBQXNCO1lBQ2xHLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxNQUF5RDtZQUNqRixJQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3pFLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLENBQUM7UUFDRixDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ3BELENBQUM7S0FFRDtJQWxCRCwwREFrQkM7SUFFRCxNQUFhLG9CQUFxQixTQUFRLHlCQUF5QjtRQUlsRSxZQUFZLE9BQW9CLEVBQUUsT0FBeUM7WUFDMUUsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7WUFDeEIsT0FBTyxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQztZQUN2QyxNQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUM7Z0JBQ2pDLGtCQUFrQixFQUFFLEtBQUssRUFBRSx3REFBd0Q7Z0JBQ25GLG9CQUFvQixFQUFFLENBQUM7Z0JBQ3ZCLDRCQUE0QixFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUM7YUFDOUcsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDdkMsQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO29CQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUN6QyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRU0saUJBQWlCLENBQUMsTUFBMEI7WUFDbEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ3BELENBQUM7UUFFTSxXQUFXO1lBQ2pCLGtFQUFrRTtZQUNsRSxJQUFJLENBQUMsbUJBQW1CLENBQUM7Z0JBQ3hCLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVc7Z0JBQ2hDLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVc7Z0JBQ3RDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVk7Z0JBQ2xDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVk7YUFDeEMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGlCQUFpQixDQUFDO2dCQUN0QixVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVO2dCQUNwQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTO2FBQ2xDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQS9DRCxvREErQ0M7SUFFRCxTQUFTLGNBQWMsQ0FBQyxJQUFzQztRQUM3RCxNQUFNLE1BQU0sR0FBcUM7WUFDaEQsVUFBVSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzlFLFNBQVMsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUN4RSxVQUFVLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxVQUFVLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDN0UsZ0JBQWdCLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQy9GLFFBQVEsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUN4RSxvQ0FBb0MsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLG9DQUFvQyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDNUosdUJBQXVCLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3JILFVBQVUsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUM5RSwyQkFBMkIsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0gscUJBQXFCLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNHLHFCQUFxQixFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMscUJBQXFCLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM5RyxzQkFBc0IsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDakgsU0FBUyxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRXhFLGVBQWUsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLGVBQWUsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUU1RixVQUFVLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxVQUFVLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsaUNBQXlCLENBQUM7WUFDakcsdUJBQXVCLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2xILG9CQUFvQixFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RyxtQkFBbUIsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFFekcsUUFBUSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGlDQUF5QixDQUFDO1lBQzNGLHFCQUFxQixFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMscUJBQXFCLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM1RyxpQkFBaUIsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDbkcsa0JBQWtCLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxHLFlBQVksRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLFlBQVksS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNwRixDQUFDO1FBRUYsTUFBTSxDQUFDLG9CQUFvQixHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQzlJLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUV0SSxpQ0FBaUM7UUFDakMsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDMUIsTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUM7UUFDNUIsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQyJ9
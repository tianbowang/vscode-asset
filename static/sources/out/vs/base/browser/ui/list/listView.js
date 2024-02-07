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
define(["require", "exports", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/touch", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/range", "vs/base/common/scrollable", "vs/base/browser/ui/list/rangeMap", "vs/base/browser/ui/list/rowCache", "vs/base/common/errors"], function (require, exports, dnd_1, dom_1, event_1, touch_1, scrollableElement_1, arrays_1, async_1, decorators_1, event_2, lifecycle_1, range_1, scrollable_1, rangeMap_1, rowCache_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListView = exports.NativeDragAndDropData = exports.ExternalElementsDragAndDropData = exports.ElementsDragAndDropData = exports.ListViewTargetSector = void 0;
    const StaticDND = {
        CurrentDragAndDropData: undefined
    };
    var ListViewTargetSector;
    (function (ListViewTargetSector) {
        // drop position relative to the top of the item
        ListViewTargetSector[ListViewTargetSector["TOP"] = 0] = "TOP";
        ListViewTargetSector[ListViewTargetSector["CENTER_TOP"] = 1] = "CENTER_TOP";
        ListViewTargetSector[ListViewTargetSector["CENTER_BOTTOM"] = 2] = "CENTER_BOTTOM";
        ListViewTargetSector[ListViewTargetSector["BOTTOM"] = 3] = "BOTTOM"; // [75%-100%)
    })(ListViewTargetSector || (exports.ListViewTargetSector = ListViewTargetSector = {}));
    const DefaultOptions = {
        useShadows: true,
        verticalScrollMode: 1 /* ScrollbarVisibility.Auto */,
        setRowLineHeight: true,
        setRowHeight: true,
        supportDynamicHeights: false,
        dnd: {
            getDragElements(e) { return [e]; },
            getDragURI() { return null; },
            onDragStart() { },
            onDragOver() { return false; },
            drop() { },
            dispose() { }
        },
        horizontalScrolling: false,
        transformOptimization: true,
        alwaysConsumeMouseWheel: true,
    };
    class ElementsDragAndDropData {
        get context() {
            return this._context;
        }
        set context(value) {
            this._context = value;
        }
        constructor(elements) {
            this.elements = elements;
        }
        update() { }
        getData() {
            return this.elements;
        }
    }
    exports.ElementsDragAndDropData = ElementsDragAndDropData;
    class ExternalElementsDragAndDropData {
        constructor(elements) {
            this.elements = elements;
        }
        update() { }
        getData() {
            return this.elements;
        }
    }
    exports.ExternalElementsDragAndDropData = ExternalElementsDragAndDropData;
    class NativeDragAndDropData {
        constructor() {
            this.types = [];
            this.files = [];
        }
        update(dataTransfer) {
            if (dataTransfer.types) {
                this.types.splice(0, this.types.length, ...dataTransfer.types);
            }
            if (dataTransfer.files) {
                this.files.splice(0, this.files.length);
                for (let i = 0; i < dataTransfer.files.length; i++) {
                    const file = dataTransfer.files.item(i);
                    if (file && (file.size || file.type)) {
                        this.files.push(file);
                    }
                }
            }
        }
        getData() {
            return {
                types: this.types,
                files: this.files
            };
        }
    }
    exports.NativeDragAndDropData = NativeDragAndDropData;
    function equalsDragFeedback(f1, f2) {
        if (Array.isArray(f1) && Array.isArray(f2)) {
            return (0, arrays_1.equals)(f1, f2);
        }
        return f1 === f2;
    }
    class ListViewAccessibilityProvider {
        constructor(accessibilityProvider) {
            if (accessibilityProvider?.getSetSize) {
                this.getSetSize = accessibilityProvider.getSetSize.bind(accessibilityProvider);
            }
            else {
                this.getSetSize = (e, i, l) => l;
            }
            if (accessibilityProvider?.getPosInSet) {
                this.getPosInSet = accessibilityProvider.getPosInSet.bind(accessibilityProvider);
            }
            else {
                this.getPosInSet = (e, i) => i + 1;
            }
            if (accessibilityProvider?.getRole) {
                this.getRole = accessibilityProvider.getRole.bind(accessibilityProvider);
            }
            else {
                this.getRole = _ => 'listitem';
            }
            if (accessibilityProvider?.isChecked) {
                this.isChecked = accessibilityProvider.isChecked.bind(accessibilityProvider);
            }
            else {
                this.isChecked = _ => undefined;
            }
        }
    }
    /**
     * The {@link ListView} is a virtual scrolling engine.
     *
     * Given that it only renders elements within its viewport, it can hold large
     * collections of elements and stay very performant. The performance bottleneck
     * usually lies within the user's rendering code for each element.
     *
     * @remarks It is a low-level widget, not meant to be used directly. Refer to the
     * List widget instead.
     */
    class ListView {
        static { this.InstanceCount = 0; }
        get contentHeight() { return this.rangeMap.size; }
        get contentWidth() { return this.scrollWidth ?? 0; }
        get onDidScroll() { return this.scrollableElement.onScroll; }
        get onWillScroll() { return this.scrollableElement.onWillScroll; }
        get containerDomNode() { return this.rowsContainer; }
        get scrollableElementDomNode() { return this.scrollableElement.getDomNode(); }
        get horizontalScrolling() { return this._horizontalScrolling; }
        set horizontalScrolling(value) {
            if (value === this._horizontalScrolling) {
                return;
            }
            if (value && this.supportDynamicHeights) {
                throw new Error('Horizontal scrolling and dynamic heights not supported simultaneously');
            }
            this._horizontalScrolling = value;
            this.domNode.classList.toggle('horizontal-scrolling', this._horizontalScrolling);
            if (this._horizontalScrolling) {
                for (const item of this.items) {
                    this.measureItemWidth(item);
                }
                this.updateScrollWidth();
                this.scrollableElement.setScrollDimensions({ width: (0, dom_1.getContentWidth)(this.domNode) });
                this.rowsContainer.style.width = `${Math.max(this.scrollWidth || 0, this.renderWidth)}px`;
            }
            else {
                this.scrollableElementWidthDelayer.cancel();
                this.scrollableElement.setScrollDimensions({ width: this.renderWidth, scrollWidth: this.renderWidth });
                this.rowsContainer.style.width = '';
            }
        }
        constructor(container, virtualDelegate, renderers, options = DefaultOptions) {
            this.virtualDelegate = virtualDelegate;
            this.domId = `list_id_${++ListView.InstanceCount}`;
            this.renderers = new Map();
            this.renderWidth = 0;
            this._scrollHeight = 0;
            this.scrollableElementUpdateDisposable = null;
            this.scrollableElementWidthDelayer = new async_1.Delayer(50);
            this.splicing = false;
            this.dragOverAnimationStopDisposable = lifecycle_1.Disposable.None;
            this.dragOverMouseY = 0;
            this.canDrop = false;
            this.currentDragFeedbackDisposable = lifecycle_1.Disposable.None;
            this.onDragLeaveTimeout = lifecycle_1.Disposable.None;
            this.disposables = new lifecycle_1.DisposableStore();
            this._onDidChangeContentHeight = new event_2.Emitter();
            this._onDidChangeContentWidth = new event_2.Emitter();
            this.onDidChangeContentHeight = event_2.Event.latch(this._onDidChangeContentHeight.event, undefined, this.disposables);
            this.onDidChangeContentWidth = event_2.Event.latch(this._onDidChangeContentWidth.event, undefined, this.disposables);
            this._horizontalScrolling = false;
            if (options.horizontalScrolling && options.supportDynamicHeights) {
                throw new Error('Horizontal scrolling and dynamic heights not supported simultaneously');
            }
            this.items = [];
            this.itemId = 0;
            this.rangeMap = new rangeMap_1.RangeMap(options.paddingTop ?? 0);
            for (const renderer of renderers) {
                this.renderers.set(renderer.templateId, renderer);
            }
            this.cache = this.disposables.add(new rowCache_1.RowCache(this.renderers));
            this.lastRenderTop = 0;
            this.lastRenderHeight = 0;
            this.domNode = document.createElement('div');
            this.domNode.className = 'monaco-list';
            this.domNode.classList.add(this.domId);
            this.domNode.tabIndex = 0;
            this.domNode.classList.toggle('mouse-support', typeof options.mouseSupport === 'boolean' ? options.mouseSupport : true);
            this._horizontalScrolling = options.horizontalScrolling ?? DefaultOptions.horizontalScrolling;
            this.domNode.classList.toggle('horizontal-scrolling', this._horizontalScrolling);
            this.paddingBottom = typeof options.paddingBottom === 'undefined' ? 0 : options.paddingBottom;
            this.accessibilityProvider = new ListViewAccessibilityProvider(options.accessibilityProvider);
            this.rowsContainer = document.createElement('div');
            this.rowsContainer.className = 'monaco-list-rows';
            const transformOptimization = options.transformOptimization ?? DefaultOptions.transformOptimization;
            if (transformOptimization) {
                this.rowsContainer.style.transform = 'translate3d(0px, 0px, 0px)';
                this.rowsContainer.style.overflow = 'hidden';
                this.rowsContainer.style.contain = 'strict';
            }
            this.disposables.add(touch_1.Gesture.addTarget(this.rowsContainer));
            this.scrollable = this.disposables.add(new scrollable_1.Scrollable({
                forceIntegerValues: true,
                smoothScrollDuration: (options.smoothScrolling ?? false) ? 125 : 0,
                scheduleAtNextAnimationFrame: cb => (0, dom_1.scheduleAtNextAnimationFrame)((0, dom_1.getWindow)(this.domNode), cb)
            }));
            this.scrollableElement = this.disposables.add(new scrollableElement_1.SmoothScrollableElement(this.rowsContainer, {
                alwaysConsumeMouseWheel: options.alwaysConsumeMouseWheel ?? DefaultOptions.alwaysConsumeMouseWheel,
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                vertical: options.verticalScrollMode ?? DefaultOptions.verticalScrollMode,
                useShadows: options.useShadows ?? DefaultOptions.useShadows,
                mouseWheelScrollSensitivity: options.mouseWheelScrollSensitivity,
                fastScrollSensitivity: options.fastScrollSensitivity,
                scrollByPage: options.scrollByPage
            }, this.scrollable));
            this.domNode.appendChild(this.scrollableElement.getDomNode());
            container.appendChild(this.domNode);
            this.scrollableElement.onScroll(this.onScroll, this, this.disposables);
            this.disposables.add((0, dom_1.addDisposableListener)(this.rowsContainer, touch_1.EventType.Change, e => this.onTouchChange(e)));
            // Prevent the monaco-scrollable-element from scrolling
            // https://github.com/microsoft/vscode/issues/44181
            this.disposables.add((0, dom_1.addDisposableListener)(this.scrollableElement.getDomNode(), 'scroll', e => e.target.scrollTop = 0));
            this.disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'dragover', e => this.onDragOver(this.toDragEvent(e))));
            this.disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'drop', e => this.onDrop(this.toDragEvent(e))));
            this.disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'dragleave', e => this.onDragLeave(this.toDragEvent(e))));
            this.disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'dragend', e => this.onDragEnd(e)));
            this.setRowLineHeight = options.setRowLineHeight ?? DefaultOptions.setRowLineHeight;
            this.setRowHeight = options.setRowHeight ?? DefaultOptions.setRowHeight;
            this.supportDynamicHeights = options.supportDynamicHeights ?? DefaultOptions.supportDynamicHeights;
            this.dnd = options.dnd ?? this.disposables.add(DefaultOptions.dnd);
            this.layout(options.initialSize?.height, options.initialSize?.width);
        }
        updateOptions(options) {
            if (options.paddingBottom !== undefined) {
                this.paddingBottom = options.paddingBottom;
                this.scrollableElement.setScrollDimensions({ scrollHeight: this.scrollHeight });
            }
            if (options.smoothScrolling !== undefined) {
                this.scrollable.setSmoothScrollDuration(options.smoothScrolling ? 125 : 0);
            }
            if (options.horizontalScrolling !== undefined) {
                this.horizontalScrolling = options.horizontalScrolling;
            }
            let scrollableOptions;
            if (options.scrollByPage !== undefined) {
                scrollableOptions = { ...(scrollableOptions ?? {}), scrollByPage: options.scrollByPage };
            }
            if (options.mouseWheelScrollSensitivity !== undefined) {
                scrollableOptions = { ...(scrollableOptions ?? {}), mouseWheelScrollSensitivity: options.mouseWheelScrollSensitivity };
            }
            if (options.fastScrollSensitivity !== undefined) {
                scrollableOptions = { ...(scrollableOptions ?? {}), fastScrollSensitivity: options.fastScrollSensitivity };
            }
            if (scrollableOptions) {
                this.scrollableElement.updateOptions(scrollableOptions);
            }
            if (options.paddingTop !== undefined && options.paddingTop !== this.rangeMap.paddingTop) {
                // trigger a rerender
                const lastRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
                const offset = options.paddingTop - this.rangeMap.paddingTop;
                this.rangeMap.paddingTop = options.paddingTop;
                this.render(lastRenderRange, Math.max(0, this.lastRenderTop + offset), this.lastRenderHeight, undefined, undefined, true);
                this.setScrollTop(this.lastRenderTop);
                this.eventuallyUpdateScrollDimensions();
                if (this.supportDynamicHeights) {
                    this._rerender(this.lastRenderTop, this.lastRenderHeight);
                }
            }
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this.scrollableElement.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.scrollableElement.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        updateElementHeight(index, size, anchorIndex) {
            if (index < 0 || index >= this.items.length) {
                return;
            }
            const originalSize = this.items[index].size;
            if (typeof size === 'undefined') {
                if (!this.supportDynamicHeights) {
                    console.warn('Dynamic heights not supported');
                    return;
                }
                this.items[index].lastDynamicHeightWidth = undefined;
                size = originalSize + this.probeDynamicHeight(index);
            }
            if (originalSize === size) {
                return;
            }
            const lastRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            let heightDiff = 0;
            if (index < lastRenderRange.start) {
                // do not scroll the viewport if resized element is out of viewport
                heightDiff = size - originalSize;
            }
            else {
                if (anchorIndex !== null && anchorIndex > index && anchorIndex < lastRenderRange.end) {
                    // anchor in viewport
                    // resized element in viewport and above the anchor
                    heightDiff = size - originalSize;
                }
                else {
                    heightDiff = 0;
                }
            }
            this.rangeMap.splice(index, 1, [{ size: size }]);
            this.items[index].size = size;
            this.render(lastRenderRange, Math.max(0, this.lastRenderTop + heightDiff), this.lastRenderHeight, undefined, undefined, true);
            this.setScrollTop(this.lastRenderTop);
            this.eventuallyUpdateScrollDimensions();
            if (this.supportDynamicHeights) {
                this._rerender(this.lastRenderTop, this.lastRenderHeight);
            }
        }
        splice(start, deleteCount, elements = []) {
            if (this.splicing) {
                throw new Error('Can\'t run recursive splices.');
            }
            this.splicing = true;
            try {
                return this._splice(start, deleteCount, elements);
            }
            finally {
                this.splicing = false;
                this._onDidChangeContentHeight.fire(this.contentHeight);
            }
        }
        _splice(start, deleteCount, elements = []) {
            const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            const deleteRange = { start, end: start + deleteCount };
            const removeRange = range_1.Range.intersect(previousRenderRange, deleteRange);
            // try to reuse rows, avoid removing them from DOM
            const rowsToDispose = new Map();
            for (let i = removeRange.end - 1; i >= removeRange.start; i--) {
                const item = this.items[i];
                item.dragStartDisposable.dispose();
                item.checkedDisposable.dispose();
                if (item.row) {
                    let rows = rowsToDispose.get(item.templateId);
                    if (!rows) {
                        rows = [];
                        rowsToDispose.set(item.templateId, rows);
                    }
                    const renderer = this.renderers.get(item.templateId);
                    if (renderer && renderer.disposeElement) {
                        renderer.disposeElement(item.element, i, item.row.templateData, item.size);
                    }
                    rows.push(item.row);
                }
                item.row = null;
            }
            const previousRestRange = { start: start + deleteCount, end: this.items.length };
            const previousRenderedRestRange = range_1.Range.intersect(previousRestRange, previousRenderRange);
            const previousUnrenderedRestRanges = range_1.Range.relativeComplement(previousRestRange, previousRenderRange);
            const inserted = elements.map(element => ({
                id: String(this.itemId++),
                element,
                templateId: this.virtualDelegate.getTemplateId(element),
                size: this.virtualDelegate.getHeight(element),
                width: undefined,
                hasDynamicHeight: !!this.virtualDelegate.hasDynamicHeight && this.virtualDelegate.hasDynamicHeight(element),
                lastDynamicHeightWidth: undefined,
                row: null,
                uri: undefined,
                dropTarget: false,
                dragStartDisposable: lifecycle_1.Disposable.None,
                checkedDisposable: lifecycle_1.Disposable.None
            }));
            let deleted;
            // TODO@joao: improve this optimization to catch even more cases
            if (start === 0 && deleteCount >= this.items.length) {
                this.rangeMap = new rangeMap_1.RangeMap(this.rangeMap.paddingTop);
                this.rangeMap.splice(0, 0, inserted);
                deleted = this.items;
                this.items = inserted;
            }
            else {
                this.rangeMap.splice(start, deleteCount, inserted);
                deleted = this.items.splice(start, deleteCount, ...inserted);
            }
            const delta = elements.length - deleteCount;
            const renderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            const renderedRestRange = (0, rangeMap_1.shift)(previousRenderedRestRange, delta);
            const updateRange = range_1.Range.intersect(renderRange, renderedRestRange);
            for (let i = updateRange.start; i < updateRange.end; i++) {
                this.updateItemInDOM(this.items[i], i);
            }
            const removeRanges = range_1.Range.relativeComplement(renderedRestRange, renderRange);
            for (const range of removeRanges) {
                for (let i = range.start; i < range.end; i++) {
                    this.removeItemFromDOM(i);
                }
            }
            const unrenderedRestRanges = previousUnrenderedRestRanges.map(r => (0, rangeMap_1.shift)(r, delta));
            const elementsRange = { start, end: start + elements.length };
            const insertRanges = [elementsRange, ...unrenderedRestRanges].map(r => range_1.Range.intersect(renderRange, r));
            const beforeElement = this.getNextToLastElement(insertRanges);
            for (const range of insertRanges) {
                for (let i = range.start; i < range.end; i++) {
                    const item = this.items[i];
                    const rows = rowsToDispose.get(item.templateId);
                    const row = rows?.pop();
                    this.insertItemInDOM(i, beforeElement, row);
                }
            }
            for (const rows of rowsToDispose.values()) {
                for (const row of rows) {
                    this.cache.release(row);
                }
            }
            this.eventuallyUpdateScrollDimensions();
            if (this.supportDynamicHeights) {
                this._rerender(this.scrollTop, this.renderHeight);
            }
            return deleted.map(i => i.element);
        }
        eventuallyUpdateScrollDimensions() {
            this._scrollHeight = this.contentHeight;
            this.rowsContainer.style.height = `${this._scrollHeight}px`;
            if (!this.scrollableElementUpdateDisposable) {
                this.scrollableElementUpdateDisposable = (0, dom_1.scheduleAtNextAnimationFrame)((0, dom_1.getWindow)(this.domNode), () => {
                    this.scrollableElement.setScrollDimensions({ scrollHeight: this.scrollHeight });
                    this.updateScrollWidth();
                    this.scrollableElementUpdateDisposable = null;
                });
            }
        }
        eventuallyUpdateScrollWidth() {
            if (!this.horizontalScrolling) {
                this.scrollableElementWidthDelayer.cancel();
                return;
            }
            this.scrollableElementWidthDelayer.trigger(() => this.updateScrollWidth());
        }
        updateScrollWidth() {
            if (!this.horizontalScrolling) {
                return;
            }
            let scrollWidth = 0;
            for (const item of this.items) {
                if (typeof item.width !== 'undefined') {
                    scrollWidth = Math.max(scrollWidth, item.width);
                }
            }
            this.scrollWidth = scrollWidth;
            this.scrollableElement.setScrollDimensions({ scrollWidth: scrollWidth === 0 ? 0 : (scrollWidth + 10) });
            this._onDidChangeContentWidth.fire(this.scrollWidth);
        }
        updateWidth(index) {
            if (!this.horizontalScrolling || typeof this.scrollWidth === 'undefined') {
                return;
            }
            const item = this.items[index];
            this.measureItemWidth(item);
            if (typeof item.width !== 'undefined' && item.width > this.scrollWidth) {
                this.scrollWidth = item.width;
                this.scrollableElement.setScrollDimensions({ scrollWidth: this.scrollWidth + 10 });
                this._onDidChangeContentWidth.fire(this.scrollWidth);
            }
        }
        rerender() {
            if (!this.supportDynamicHeights) {
                return;
            }
            for (const item of this.items) {
                item.lastDynamicHeightWidth = undefined;
            }
            this._rerender(this.lastRenderTop, this.lastRenderHeight);
        }
        get length() {
            return this.items.length;
        }
        get renderHeight() {
            const scrollDimensions = this.scrollableElement.getScrollDimensions();
            return scrollDimensions.height;
        }
        get firstVisibleIndex() {
            const range = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            return range.start;
        }
        get firstMostlyVisibleIndex() {
            const firstVisibleIndex = this.firstVisibleIndex;
            const firstElTop = this.rangeMap.positionAt(firstVisibleIndex);
            const nextElTop = this.rangeMap.positionAt(firstVisibleIndex + 1);
            if (nextElTop !== -1) {
                const firstElMidpoint = (nextElTop - firstElTop) / 2 + firstElTop;
                if (firstElMidpoint < this.scrollTop) {
                    return firstVisibleIndex + 1;
                }
            }
            return firstVisibleIndex;
        }
        get lastVisibleIndex() {
            const range = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            return range.end - 1;
        }
        element(index) {
            return this.items[index].element;
        }
        indexOf(element) {
            return this.items.findIndex(item => item.element === element);
        }
        domElement(index) {
            const row = this.items[index].row;
            return row && row.domNode;
        }
        elementHeight(index) {
            return this.items[index].size;
        }
        elementTop(index) {
            return this.rangeMap.positionAt(index);
        }
        indexAt(position) {
            return this.rangeMap.indexAt(position);
        }
        indexAfter(position) {
            return this.rangeMap.indexAfter(position);
        }
        layout(height, width) {
            const scrollDimensions = {
                height: typeof height === 'number' ? height : (0, dom_1.getContentHeight)(this.domNode)
            };
            if (this.scrollableElementUpdateDisposable) {
                this.scrollableElementUpdateDisposable.dispose();
                this.scrollableElementUpdateDisposable = null;
                scrollDimensions.scrollHeight = this.scrollHeight;
            }
            this.scrollableElement.setScrollDimensions(scrollDimensions);
            if (typeof width !== 'undefined') {
                this.renderWidth = width;
                if (this.supportDynamicHeights) {
                    this._rerender(this.scrollTop, this.renderHeight);
                }
            }
            if (this.horizontalScrolling) {
                this.scrollableElement.setScrollDimensions({
                    width: typeof width === 'number' ? width : (0, dom_1.getContentWidth)(this.domNode)
                });
            }
        }
        // Render
        render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM = false) {
            const renderRange = this.getRenderRange(renderTop, renderHeight);
            const rangesToInsert = range_1.Range.relativeComplement(renderRange, previousRenderRange);
            const rangesToRemove = range_1.Range.relativeComplement(previousRenderRange, renderRange);
            const beforeElement = this.getNextToLastElement(rangesToInsert);
            if (updateItemsInDOM) {
                const rangesToUpdate = range_1.Range.intersect(previousRenderRange, renderRange);
                for (let i = rangesToUpdate.start; i < rangesToUpdate.end; i++) {
                    this.updateItemInDOM(this.items[i], i);
                }
            }
            this.cache.transact(() => {
                for (const range of rangesToRemove) {
                    for (let i = range.start; i < range.end; i++) {
                        this.removeItemFromDOM(i);
                    }
                }
                for (const range of rangesToInsert) {
                    for (let i = range.start; i < range.end; i++) {
                        this.insertItemInDOM(i, beforeElement);
                    }
                }
            });
            if (renderLeft !== undefined) {
                this.rowsContainer.style.left = `-${renderLeft}px`;
            }
            this.rowsContainer.style.top = `-${renderTop}px`;
            if (this.horizontalScrolling && scrollWidth !== undefined) {
                this.rowsContainer.style.width = `${Math.max(scrollWidth, this.renderWidth)}px`;
            }
            this.lastRenderTop = renderTop;
            this.lastRenderHeight = renderHeight;
        }
        // DOM operations
        insertItemInDOM(index, beforeElement, row) {
            const item = this.items[index];
            let isStale = false;
            if (!item.row) {
                if (row) {
                    item.row = row;
                }
                else {
                    const result = this.cache.alloc(item.templateId);
                    item.row = result.row;
                    isStale = result.isReusingConnectedDomNode;
                }
            }
            const role = this.accessibilityProvider.getRole(item.element) || 'listitem';
            item.row.domNode.setAttribute('role', role);
            const checked = this.accessibilityProvider.isChecked(item.element);
            if (typeof checked === 'boolean') {
                item.row.domNode.setAttribute('aria-checked', String(!!checked));
            }
            else if (checked) {
                const update = (checked) => item.row.domNode.setAttribute('aria-checked', String(!!checked));
                update(checked.value);
                item.checkedDisposable = checked.onDidChange(update);
            }
            if (isStale || !item.row.domNode.parentElement) {
                if (beforeElement) {
                    this.rowsContainer.insertBefore(item.row.domNode, beforeElement);
                }
                else {
                    this.rowsContainer.appendChild(item.row.domNode);
                }
            }
            this.updateItemInDOM(item, index);
            const renderer = this.renderers.get(item.templateId);
            if (!renderer) {
                throw new Error(`No renderer found for template id ${item.templateId}`);
            }
            renderer?.renderElement(item.element, index, item.row.templateData, item.size);
            const uri = this.dnd.getDragURI(item.element);
            item.dragStartDisposable.dispose();
            item.row.domNode.draggable = !!uri;
            if (uri) {
                item.dragStartDisposable = (0, dom_1.addDisposableListener)(item.row.domNode, 'dragstart', event => this.onDragStart(item.element, uri, event));
            }
            if (this.horizontalScrolling) {
                this.measureItemWidth(item);
                this.eventuallyUpdateScrollWidth();
            }
        }
        measureItemWidth(item) {
            if (!item.row || !item.row.domNode) {
                return;
            }
            item.row.domNode.style.width = 'fit-content';
            item.width = (0, dom_1.getContentWidth)(item.row.domNode);
            const style = (0, dom_1.getWindow)(item.row.domNode).getComputedStyle(item.row.domNode);
            if (style.paddingLeft) {
                item.width += parseFloat(style.paddingLeft);
            }
            if (style.paddingRight) {
                item.width += parseFloat(style.paddingRight);
            }
            item.row.domNode.style.width = '';
        }
        updateItemInDOM(item, index) {
            item.row.domNode.style.top = `${this.elementTop(index)}px`;
            if (this.setRowHeight) {
                item.row.domNode.style.height = `${item.size}px`;
            }
            if (this.setRowLineHeight) {
                item.row.domNode.style.lineHeight = `${item.size}px`;
            }
            item.row.domNode.setAttribute('data-index', `${index}`);
            item.row.domNode.setAttribute('data-last-element', index === this.length - 1 ? 'true' : 'false');
            item.row.domNode.setAttribute('data-parity', index % 2 === 0 ? 'even' : 'odd');
            item.row.domNode.setAttribute('aria-setsize', String(this.accessibilityProvider.getSetSize(item.element, index, this.length)));
            item.row.domNode.setAttribute('aria-posinset', String(this.accessibilityProvider.getPosInSet(item.element, index)));
            item.row.domNode.setAttribute('id', this.getElementDomId(index));
            item.row.domNode.classList.toggle('drop-target', item.dropTarget);
        }
        removeItemFromDOM(index) {
            const item = this.items[index];
            item.dragStartDisposable.dispose();
            item.checkedDisposable.dispose();
            if (item.row) {
                const renderer = this.renderers.get(item.templateId);
                if (renderer && renderer.disposeElement) {
                    renderer.disposeElement(item.element, index, item.row.templateData, item.size);
                }
                this.cache.release(item.row);
                item.row = null;
            }
            if (this.horizontalScrolling) {
                this.eventuallyUpdateScrollWidth();
            }
        }
        getScrollTop() {
            const scrollPosition = this.scrollableElement.getScrollPosition();
            return scrollPosition.scrollTop;
        }
        setScrollTop(scrollTop, reuseAnimation) {
            if (this.scrollableElementUpdateDisposable) {
                this.scrollableElementUpdateDisposable.dispose();
                this.scrollableElementUpdateDisposable = null;
                this.scrollableElement.setScrollDimensions({ scrollHeight: this.scrollHeight });
            }
            this.scrollableElement.setScrollPosition({ scrollTop, reuseAnimation });
        }
        getScrollLeft() {
            const scrollPosition = this.scrollableElement.getScrollPosition();
            return scrollPosition.scrollLeft;
        }
        setScrollLeft(scrollLeft) {
            if (this.scrollableElementUpdateDisposable) {
                this.scrollableElementUpdateDisposable.dispose();
                this.scrollableElementUpdateDisposable = null;
                this.scrollableElement.setScrollDimensions({ scrollWidth: this.scrollWidth });
            }
            this.scrollableElement.setScrollPosition({ scrollLeft });
        }
        get scrollTop() {
            return this.getScrollTop();
        }
        set scrollTop(scrollTop) {
            this.setScrollTop(scrollTop);
        }
        get scrollHeight() {
            return this._scrollHeight + (this.horizontalScrolling ? 10 : 0) + this.paddingBottom;
        }
        // Events
        get onMouseClick() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'click')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseDblClick() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'dblclick')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseMiddleClick() { return event_2.Event.filter(event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'auxclick')).event, e => this.toMouseEvent(e), this.disposables), e => e.browserEvent.button === 1, this.disposables); }
        get onMouseUp() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mouseup')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseDown() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mousedown')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseOver() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mouseover')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseMove() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mousemove')).event, e => this.toMouseEvent(e), this.disposables); }
        get onMouseOut() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'mouseout')).event, e => this.toMouseEvent(e), this.disposables); }
        get onContextMenu() { return event_2.Event.any(event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'contextmenu')).event, e => this.toMouseEvent(e), this.disposables), event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, touch_1.EventType.Contextmenu)).event, e => this.toGestureEvent(e), this.disposables)); }
        get onTouchStart() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.domNode, 'touchstart')).event, e => this.toTouchEvent(e), this.disposables); }
        get onTap() { return event_2.Event.map(this.disposables.add(new event_1.DomEmitter(this.rowsContainer, touch_1.EventType.Tap)).event, e => this.toGestureEvent(e), this.disposables); }
        toMouseEvent(browserEvent) {
            const index = this.getItemIndexFromEventTarget(browserEvent.target || null);
            const item = typeof index === 'undefined' ? undefined : this.items[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        toTouchEvent(browserEvent) {
            const index = this.getItemIndexFromEventTarget(browserEvent.target || null);
            const item = typeof index === 'undefined' ? undefined : this.items[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        toGestureEvent(browserEvent) {
            const index = this.getItemIndexFromEventTarget(browserEvent.initialTarget || null);
            const item = typeof index === 'undefined' ? undefined : this.items[index];
            const element = item && item.element;
            return { browserEvent, index, element };
        }
        toDragEvent(browserEvent) {
            const index = this.getItemIndexFromEventTarget(browserEvent.target || null);
            const item = typeof index === 'undefined' ? undefined : this.items[index];
            const element = item && item.element;
            const sector = this.getTargetSector(browserEvent, index);
            return { browserEvent, index, element, sector };
        }
        onScroll(e) {
            try {
                const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
                this.render(previousRenderRange, e.scrollTop, e.height, e.scrollLeft, e.scrollWidth);
                if (this.supportDynamicHeights) {
                    this._rerender(e.scrollTop, e.height, e.inSmoothScrolling);
                }
            }
            catch (err) {
                console.error('Got bad scroll event:', e);
                throw err;
            }
        }
        onTouchChange(event) {
            event.preventDefault();
            event.stopPropagation();
            this.scrollTop -= event.translationY;
        }
        // DND
        onDragStart(element, uri, event) {
            if (!event.dataTransfer) {
                return;
            }
            const elements = this.dnd.getDragElements(element);
            event.dataTransfer.effectAllowed = 'copyMove';
            event.dataTransfer.setData(dnd_1.DataTransfers.TEXT, uri);
            if (event.dataTransfer.setDragImage) {
                let label;
                if (this.dnd.getDragLabel) {
                    label = this.dnd.getDragLabel(elements, event);
                }
                if (typeof label === 'undefined') {
                    label = String(elements.length);
                }
                const dragImage = (0, dom_1.$)('.monaco-drag-image');
                dragImage.textContent = label;
                const getDragImageContainer = (e) => {
                    while (e && !e.classList.contains('monaco-workbench')) {
                        e = e.parentElement;
                    }
                    return e || this.domNode.ownerDocument;
                };
                const container = getDragImageContainer(this.domNode);
                container.appendChild(dragImage);
                event.dataTransfer.setDragImage(dragImage, -10, -10);
                setTimeout(() => container.removeChild(dragImage), 0);
            }
            this.domNode.classList.add('dragging');
            this.currentDragData = new ElementsDragAndDropData(elements);
            StaticDND.CurrentDragAndDropData = new ExternalElementsDragAndDropData(elements);
            this.dnd.onDragStart?.(this.currentDragData, event);
        }
        onDragOver(event) {
            event.browserEvent.preventDefault(); // needed so that the drop event fires (https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome)
            this.onDragLeaveTimeout.dispose();
            if (StaticDND.CurrentDragAndDropData && StaticDND.CurrentDragAndDropData.getData() === 'vscode-ui') {
                return false;
            }
            this.setupDragAndDropScrollTopAnimation(event.browserEvent);
            if (!event.browserEvent.dataTransfer) {
                return false;
            }
            // Drag over from outside
            if (!this.currentDragData) {
                if (StaticDND.CurrentDragAndDropData) {
                    // Drag over from another list
                    this.currentDragData = StaticDND.CurrentDragAndDropData;
                }
                else {
                    // Drag over from the desktop
                    if (!event.browserEvent.dataTransfer.types) {
                        return false;
                    }
                    this.currentDragData = new NativeDragAndDropData();
                }
            }
            const result = this.dnd.onDragOver(this.currentDragData, event.element, event.index, event.sector, event.browserEvent);
            this.canDrop = typeof result === 'boolean' ? result : result.accept;
            if (!this.canDrop) {
                this.currentDragFeedback = undefined;
                this.currentDragFeedbackDisposable.dispose();
                return false;
            }
            event.browserEvent.dataTransfer.dropEffect = (typeof result !== 'boolean' && result.effect?.type === 0 /* ListDragOverEffectType.Copy */) ? 'copy' : 'move';
            let feedback;
            if (typeof result !== 'boolean' && result.feedback) {
                feedback = result.feedback;
            }
            else {
                if (typeof event.index === 'undefined') {
                    feedback = [-1];
                }
                else {
                    feedback = [event.index];
                }
            }
            // sanitize feedback list
            feedback = (0, arrays_1.distinct)(feedback).filter(i => i >= -1 && i < this.length).sort((a, b) => a - b);
            feedback = feedback[0] === -1 ? [-1] : feedback;
            let dragOverEffectPosition = typeof result !== 'boolean' && result.effect && result.effect.position ? result.effect.position : "drop-target" /* ListDragOverEffectPosition.Over */;
            if (equalsDragFeedback(this.currentDragFeedback, feedback) && this.currentDragFeedbackPosition === dragOverEffectPosition) {
                return true;
            }
            this.currentDragFeedback = feedback;
            this.currentDragFeedbackPosition = dragOverEffectPosition;
            this.currentDragFeedbackDisposable.dispose();
            if (feedback[0] === -1) { // entire list feedback
                this.domNode.classList.add(dragOverEffectPosition);
                this.rowsContainer.classList.add(dragOverEffectPosition);
                this.currentDragFeedbackDisposable = (0, lifecycle_1.toDisposable)(() => {
                    this.domNode.classList.remove(dragOverEffectPosition);
                    this.rowsContainer.classList.remove(dragOverEffectPosition);
                });
            }
            else {
                if (feedback.length > 1 && dragOverEffectPosition !== "drop-target" /* ListDragOverEffectPosition.Over */) {
                    throw new Error('Can\'t use multiple feedbacks with position different than \'over\'');
                }
                // Make sure there is no flicker when moving between two items
                // Always use the before feedback if possible
                if (dragOverEffectPosition === "drop-target-after" /* ListDragOverEffectPosition.After */) {
                    if (feedback[0] < this.length - 1) {
                        feedback[0] += 1;
                        dragOverEffectPosition = "drop-target-before" /* ListDragOverEffectPosition.Before */;
                    }
                }
                for (const index of feedback) {
                    const item = this.items[index];
                    item.dropTarget = true;
                    item.row?.domNode.classList.add(dragOverEffectPosition);
                }
                this.currentDragFeedbackDisposable = (0, lifecycle_1.toDisposable)(() => {
                    for (const index of feedback) {
                        const item = this.items[index];
                        item.dropTarget = false;
                        item.row?.domNode.classList.remove(dragOverEffectPosition);
                    }
                });
            }
            return true;
        }
        onDragLeave(event) {
            this.onDragLeaveTimeout.dispose();
            this.onDragLeaveTimeout = (0, async_1.disposableTimeout)(() => this.clearDragOverFeedback(), 100, this.disposables);
            if (this.currentDragData) {
                this.dnd.onDragLeave?.(this.currentDragData, event.element, event.index, event.browserEvent);
            }
        }
        onDrop(event) {
            if (!this.canDrop) {
                return;
            }
            const dragData = this.currentDragData;
            this.teardownDragAndDropScrollTopAnimation();
            this.clearDragOverFeedback();
            this.domNode.classList.remove('dragging');
            this.currentDragData = undefined;
            StaticDND.CurrentDragAndDropData = undefined;
            if (!dragData || !event.browserEvent.dataTransfer) {
                return;
            }
            event.browserEvent.preventDefault();
            dragData.update(event.browserEvent.dataTransfer);
            this.dnd.drop(dragData, event.element, event.index, event.sector, event.browserEvent);
        }
        onDragEnd(event) {
            this.canDrop = false;
            this.teardownDragAndDropScrollTopAnimation();
            this.clearDragOverFeedback();
            this.domNode.classList.remove('dragging');
            this.currentDragData = undefined;
            StaticDND.CurrentDragAndDropData = undefined;
            this.dnd.onDragEnd?.(event);
        }
        clearDragOverFeedback() {
            this.currentDragFeedback = undefined;
            this.currentDragFeedbackPosition = undefined;
            this.currentDragFeedbackDisposable.dispose();
            this.currentDragFeedbackDisposable = lifecycle_1.Disposable.None;
        }
        // DND scroll top animation
        setupDragAndDropScrollTopAnimation(event) {
            if (!this.dragOverAnimationDisposable) {
                const viewTop = (0, dom_1.getTopLeftOffset)(this.domNode).top;
                this.dragOverAnimationDisposable = (0, dom_1.animate)((0, dom_1.getWindow)(this.domNode), this.animateDragAndDropScrollTop.bind(this, viewTop));
            }
            this.dragOverAnimationStopDisposable.dispose();
            this.dragOverAnimationStopDisposable = (0, async_1.disposableTimeout)(() => {
                if (this.dragOverAnimationDisposable) {
                    this.dragOverAnimationDisposable.dispose();
                    this.dragOverAnimationDisposable = undefined;
                }
            }, 1000, this.disposables);
            this.dragOverMouseY = event.pageY;
        }
        animateDragAndDropScrollTop(viewTop) {
            if (this.dragOverMouseY === undefined) {
                return;
            }
            const diff = this.dragOverMouseY - viewTop;
            const upperLimit = this.renderHeight - 35;
            if (diff < 35) {
                this.scrollTop += Math.max(-14, Math.floor(0.3 * (diff - 35)));
            }
            else if (diff > upperLimit) {
                this.scrollTop += Math.min(14, Math.floor(0.3 * (diff - upperLimit)));
            }
        }
        teardownDragAndDropScrollTopAnimation() {
            this.dragOverAnimationStopDisposable.dispose();
            if (this.dragOverAnimationDisposable) {
                this.dragOverAnimationDisposable.dispose();
                this.dragOverAnimationDisposable = undefined;
            }
        }
        // Util
        getTargetSector(browserEvent, targetIndex) {
            if (targetIndex === undefined) {
                return undefined;
            }
            const relativePosition = browserEvent.offsetY / this.items[targetIndex].size;
            return Math.floor(relativePosition / 0.25);
        }
        getItemIndexFromEventTarget(target) {
            const scrollableElement = this.scrollableElement.getDomNode();
            let element = target;
            while (element instanceof HTMLElement && element !== this.rowsContainer && scrollableElement.contains(element)) {
                const rawIndex = element.getAttribute('data-index');
                if (rawIndex) {
                    const index = Number(rawIndex);
                    if (!isNaN(index)) {
                        return index;
                    }
                }
                element = element.parentElement;
            }
            return undefined;
        }
        getRenderRange(renderTop, renderHeight) {
            return {
                start: this.rangeMap.indexAt(renderTop),
                end: this.rangeMap.indexAfter(renderTop + renderHeight - 1)
            };
        }
        /**
         * Given a stable rendered state, checks every rendered element whether it needs
         * to be probed for dynamic height. Adjusts scroll height and top if necessary.
         */
        _rerender(renderTop, renderHeight, inSmoothScrolling) {
            const previousRenderRange = this.getRenderRange(renderTop, renderHeight);
            // Let's remember the second element's position, this helps in scrolling up
            // and preserving a linear upwards scroll movement
            let anchorElementIndex;
            let anchorElementTopDelta;
            if (renderTop === this.elementTop(previousRenderRange.start)) {
                anchorElementIndex = previousRenderRange.start;
                anchorElementTopDelta = 0;
            }
            else if (previousRenderRange.end - previousRenderRange.start > 1) {
                anchorElementIndex = previousRenderRange.start + 1;
                anchorElementTopDelta = this.elementTop(anchorElementIndex) - renderTop;
            }
            let heightDiff = 0;
            while (true) {
                const renderRange = this.getRenderRange(renderTop, renderHeight);
                let didChange = false;
                for (let i = renderRange.start; i < renderRange.end; i++) {
                    const diff = this.probeDynamicHeight(i);
                    if (diff !== 0) {
                        this.rangeMap.splice(i, 1, [this.items[i]]);
                    }
                    heightDiff += diff;
                    didChange = didChange || diff !== 0;
                }
                if (!didChange) {
                    if (heightDiff !== 0) {
                        this.eventuallyUpdateScrollDimensions();
                    }
                    const unrenderRanges = range_1.Range.relativeComplement(previousRenderRange, renderRange);
                    for (const range of unrenderRanges) {
                        for (let i = range.start; i < range.end; i++) {
                            if (this.items[i].row) {
                                this.removeItemFromDOM(i);
                            }
                        }
                    }
                    const renderRanges = range_1.Range.relativeComplement(renderRange, previousRenderRange);
                    for (const range of renderRanges) {
                        for (let i = range.start; i < range.end; i++) {
                            const afterIndex = i + 1;
                            const beforeRow = afterIndex < this.items.length ? this.items[afterIndex].row : null;
                            const beforeElement = beforeRow ? beforeRow.domNode : null;
                            this.insertItemInDOM(i, beforeElement);
                        }
                    }
                    for (let i = renderRange.start; i < renderRange.end; i++) {
                        if (this.items[i].row) {
                            this.updateItemInDOM(this.items[i], i);
                        }
                    }
                    if (typeof anchorElementIndex === 'number') {
                        // To compute a destination scroll top, we need to take into account the current smooth scrolling
                        // animation, and then reuse it with a new target (to avoid prolonging the scroll)
                        // See https://github.com/microsoft/vscode/issues/104144
                        // See https://github.com/microsoft/vscode/pull/104284
                        // See https://github.com/microsoft/vscode/issues/107704
                        const deltaScrollTop = this.scrollable.getFutureScrollPosition().scrollTop - renderTop;
                        const newScrollTop = this.elementTop(anchorElementIndex) - anchorElementTopDelta + deltaScrollTop;
                        this.setScrollTop(newScrollTop, inSmoothScrolling);
                    }
                    this._onDidChangeContentHeight.fire(this.contentHeight);
                    return;
                }
            }
        }
        probeDynamicHeight(index) {
            const item = this.items[index];
            if (!!this.virtualDelegate.getDynamicHeight) {
                const newSize = this.virtualDelegate.getDynamicHeight(item.element);
                if (newSize !== null) {
                    const size = item.size;
                    item.size = newSize;
                    item.lastDynamicHeightWidth = this.renderWidth;
                    return newSize - size;
                }
            }
            if (!item.hasDynamicHeight || item.lastDynamicHeightWidth === this.renderWidth) {
                return 0;
            }
            if (!!this.virtualDelegate.hasDynamicHeight && !this.virtualDelegate.hasDynamicHeight(item.element)) {
                return 0;
            }
            const size = item.size;
            if (item.row) {
                item.row.domNode.style.height = '';
                item.size = item.row.domNode.offsetHeight;
                item.lastDynamicHeightWidth = this.renderWidth;
                return item.size - size;
            }
            const { row } = this.cache.alloc(item.templateId);
            row.domNode.style.height = '';
            this.rowsContainer.appendChild(row.domNode);
            const renderer = this.renderers.get(item.templateId);
            if (!renderer) {
                throw new errors_1.BugIndicatingError('Missing renderer for templateId: ' + item.templateId);
            }
            renderer.renderElement(item.element, index, row.templateData, undefined);
            item.size = row.domNode.offsetHeight;
            renderer.disposeElement?.(item.element, index, row.templateData, undefined);
            this.virtualDelegate.setDynamicHeight?.(item.element, item.size);
            item.lastDynamicHeightWidth = this.renderWidth;
            this.rowsContainer.removeChild(row.domNode);
            this.cache.release(row);
            return item.size - size;
        }
        getNextToLastElement(ranges) {
            const lastRange = ranges[ranges.length - 1];
            if (!lastRange) {
                return null;
            }
            const nextToLastItem = this.items[lastRange.end];
            if (!nextToLastItem) {
                return null;
            }
            if (!nextToLastItem.row) {
                return null;
            }
            return nextToLastItem.row.domNode;
        }
        getElementDomId(index) {
            return `${this.domId}_${index}`;
        }
        // Dispose
        dispose() {
            for (const item of this.items) {
                item.dragStartDisposable.dispose();
                item.checkedDisposable.dispose();
                if (item.row) {
                    const renderer = this.renderers.get(item.row.templateId);
                    if (renderer) {
                        renderer.disposeElement?.(item.element, -1, item.row.templateData, undefined);
                        renderer.disposeTemplate(item.row.templateData);
                    }
                }
            }
            this.items = [];
            if (this.domNode && this.domNode.parentNode) {
                this.domNode.parentNode.removeChild(this.domNode);
            }
            this.dragOverAnimationDisposable?.dispose();
            this.disposables.dispose();
        }
    }
    exports.ListView = ListView;
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseClick", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseDblClick", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseMiddleClick", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseUp", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseDown", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseOver", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseMove", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onMouseOut", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onContextMenu", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onTouchStart", null);
    __decorate([
        decorators_1.memoize
    ], ListView.prototype, "onTap", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9saXN0L2xpc3RWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQXVDaEcsTUFBTSxTQUFTLEdBQUc7UUFDakIsc0JBQXNCLEVBQUUsU0FBeUM7S0FDakUsQ0FBQztJQU1GLElBQWtCLG9CQU1qQjtJQU5ELFdBQWtCLG9CQUFvQjtRQUNyQyxnREFBZ0Q7UUFDaEQsNkRBQU8sQ0FBQTtRQUNQLDJFQUFjLENBQUE7UUFDZCxpRkFBaUIsQ0FBQTtRQUNqQixtRUFBVSxDQUFBLENBQUksYUFBYTtJQUM1QixDQUFDLEVBTmlCLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBTXJDO0lBaUNELE1BQU0sY0FBYyxHQUFHO1FBQ3RCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLGtCQUFrQixrQ0FBMEI7UUFDNUMsZ0JBQWdCLEVBQUUsSUFBSTtRQUN0QixZQUFZLEVBQUUsSUFBSTtRQUNsQixxQkFBcUIsRUFBRSxLQUFLO1FBQzVCLEdBQUcsRUFBRTtZQUNKLGVBQWUsQ0FBSSxDQUFJLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdCLFdBQVcsS0FBVyxDQUFDO1lBQ3ZCLFVBQVUsS0FBSyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxLQUFLLENBQUM7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNiO1FBQ0QsbUJBQW1CLEVBQUUsS0FBSztRQUMxQixxQkFBcUIsRUFBRSxJQUFJO1FBQzNCLHVCQUF1QixFQUFFLElBQUk7S0FDN0IsQ0FBQztJQUVGLE1BQWEsdUJBQXVCO1FBS25DLElBQVcsT0FBTztZQUNqQixPQUFPLElBQUksQ0FB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
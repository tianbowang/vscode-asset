/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/globalPointerMoveMonitor", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/browser/view/viewLayer", "vs/editor/browser/view/viewPart", "vs/editor/common/config/editorOptions", "vs/editor/common/core/range", "vs/editor/common/core/rgba", "vs/editor/common/viewModel/minimapTokensColorTracker", "vs/editor/common/viewModel", "vs/platform/theme/common/colorRegistry", "vs/editor/common/core/selection", "vs/base/browser/touch", "vs/editor/browser/viewParts/minimap/minimapCharRendererFactory", "vs/editor/common/model", "vs/base/common/functional", "vs/css!./minimap"], function (require, exports, dom, fastDomNode_1, globalPointerMoveMonitor_1, lifecycle_1, platform, strings, viewLayer_1, viewPart_1, editorOptions_1, range_1, rgba_1, minimapTokensColorTracker_1, viewModel_1, colorRegistry_1, selection_1, touch_1, minimapCharRendererFactory_1, model_1, functional_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Minimap = void 0;
    /**
     * The orthogonal distance to the slider at which dragging "resets". This implements "snapping"
     */
    const POINTER_DRAG_RESET_DISTANCE = 140;
    const GUTTER_DECORATION_WIDTH = 2;
    class MinimapOptions {
        constructor(configuration, theme, tokensColorTracker) {
            const options = configuration.options;
            const pixelRatio = options.get(141 /* EditorOption.pixelRatio */);
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const minimapLayout = layoutInfo.minimap;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const minimapOpts = options.get(72 /* EditorOption.minimap */);
            this.renderMinimap = minimapLayout.renderMinimap;
            this.size = minimapOpts.size;
            this.minimapHeightIsEditorHeight = minimapLayout.minimapHeightIsEditorHeight;
            this.scrollBeyondLastLine = options.get(104 /* EditorOption.scrollBeyondLastLine */);
            this.paddingTop = options.get(83 /* EditorOption.padding */).top;
            this.paddingBottom = options.get(83 /* EditorOption.padding */).bottom;
            this.showSlider = minimapOpts.showSlider;
            this.autohide = minimapOpts.autohide;
            this.pixelRatio = pixelRatio;
            this.typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
            this.lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this.minimapLeft = minimapLayout.minimapLeft;
            this.minimapWidth = minimapLayout.minimapWidth;
            this.minimapHeight = layoutInfo.height;
            this.canvasInnerWidth = minimapLayout.minimapCanvasInnerWidth;
            this.canvasInnerHeight = minimapLayout.minimapCanvasInnerHeight;
            this.canvasOuterWidth = minimapLayout.minimapCanvasOuterWidth;
            this.canvasOuterHeight = minimapLayout.minimapCanvasOuterHeight;
            this.isSampling = minimapLayout.minimapIsSampling;
            this.editorHeight = layoutInfo.height;
            this.fontScale = minimapLayout.minimapScale;
            this.minimapLineHeight = minimapLayout.minimapLineHeight;
            this.minimapCharWidth = 1 /* Constants.BASE_CHAR_WIDTH */ * this.fontScale;
            this.charRenderer = (0, functional_1.createSingleCallFunction)(() => minimapCharRendererFactory_1.MinimapCharRendererFactory.create(this.fontScale, fontInfo.fontFamily));
            this.defaultBackgroundColor = tokensColorTracker.getColor(2 /* ColorId.DefaultBackground */);
            this.backgroundColor = MinimapOptions._getMinimapBackground(theme, this.defaultBackgroundColor);
            this.foregroundAlpha = MinimapOptions._getMinimapForegroundOpacity(theme);
        }
        static _getMinimapBackground(theme, defaultBackgroundColor) {
            const themeColor = theme.getColor(colorRegistry_1.minimapBackground);
            if (themeColor) {
                return new rgba_1.RGBA8(themeColor.rgba.r, themeColor.rgba.g, themeColor.rgba.b, Math.round(255 * themeColor.rgba.a));
            }
            return defaultBackgroundColor;
        }
        static _getMinimapForegroundOpacity(theme) {
            const themeColor = theme.getColor(colorRegistry_1.minimapForegroundOpacity);
            if (themeColor) {
                return rgba_1.RGBA8._clamp(Math.round(255 * themeColor.rgba.a));
            }
            return 255;
        }
        equals(other) {
            return (this.renderMinimap === other.renderMinimap
                && this.size === other.size
                && this.minimapHeightIsEditorHeight === other.minimapHeightIsEditorHeight
                && this.scrollBeyondLastLine === other.scrollBeyondLastLine
                && this.paddingTop === other.paddingTop
                && this.paddingBottom === other.paddingBottom
                && this.showSlider === other.showSlider
                && this.autohide === other.autohide
                && this.pixelRatio === other.pixelRatio
                && this.typicalHalfwidthCharacterWidth === other.typicalHalfwidthCharacterWidth
                && this.lineHeight === other.lineHeight
                && this.minimapLeft === other.minimapLeft
                && this.minimapWidth === other.minimapWidth
                && this.minimapHeight === other.minimapHeight
                && this.canvasInnerWidth === other.canvasInnerWidth
                && this.canvasInnerHeight === other.canvasInnerHeight
                && this.canvasOuterWidth === other.canvasOuterWidth
                && this.canvasOuterHeight === other.canvasOuterHeight
                && this.isSampling === other.isSampling
                && this.editorHeight === other.editorHeight
                && this.fontScale === other.fontScale
                && this.minimapLineHeight === other.minimapLineHeight
                && this.minimapCharWidth === other.minimapCharWidth
                && this.defaultBackgroundColor && this.defaultBackgroundColor.equals(other.defaultBackgroundColor)
                && this.backgroundColor && this.backgroundColor.equals(other.backgroundColor)
                && this.foregroundAlpha === other.foregroundAlpha);
        }
    }
    class MinimapLayout {
        constructor(
        /**
         * The given editor scrollTop (input).
         */
        scrollTop, 
        /**
         * The given editor scrollHeight (input).
         */
        scrollHeight, sliderNeeded, _computedSliderRatio, 
        /**
         * slider dom node top (in CSS px)
         */
        sliderTop, 
        /**
         * slider dom node height (in CSS px)
         */
        sliderHeight, 
        /**
         * empty lines to reserve at the top of the minimap.
         */
        topPaddingLineCount, 
        /**
         * minimap render start line number.
         */
        startLineNumber, 
        /**
         * minimap render end line number.
         */
        endLineNumber) {
            this.scrollTop = scrollTop;
            this.scrollHeight = scrollHeight;
            this.sliderNeeded = sliderNeeded;
            this._computedSliderRatio = _computedSliderRatio;
            this.sliderTop = sliderTop;
            this.sliderHeight = sliderHeight;
            this.topPaddingLineCount = topPaddingLineCount;
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
        }
        /**
         * Compute a desired `scrollPosition` such that the slider moves by `delta`.
         */
        getDesiredScrollTopFromDelta(delta) {
            return Math.round(this.scrollTop + delta / this._computedSliderRatio);
        }
        getDesiredScrollTopFromTouchLocation(pageY) {
            return Math.round((pageY - this.sliderHeight / 2) / this._computedSliderRatio);
        }
        /**
         * Intersect a line range with `this.startLineNumber` and `this.endLineNumber`.
         */
        intersectWithViewport(range) {
            const startLineNumber = Math.max(this.startLineNumber, range.startLineNumber);
            const endLineNumber = Math.min(this.endLineNumber, range.endLineNumber);
            if (startLineNumber > endLineNumber) {
                // entirely outside minimap's viewport
                return null;
            }
            return [startLineNumber, endLineNumber];
        }
        /**
         * Get the inner minimap y coordinate for a line number.
         */
        getYForLineNumber(lineNumber, minimapLineHeight) {
            return +(lineNumber - this.startLineNumber + this.topPaddingLineCount) * minimapLineHeight;
        }
        static create(options, viewportStartLineNumber, viewportEndLineNumber, viewportStartLineNumberVerticalOffset, viewportHeight, viewportContainsWhitespaceGaps, lineCount, realLineCount, scrollTop, scrollHeight, previousLayout) {
            const pixelRatio = options.pixelRatio;
            const minimapLineHeight = options.minimapLineHeight;
            const minimapLinesFitting = Math.floor(options.canvasInnerHeight / minimapLineHeight);
            const lineHeight = options.lineHeight;
            if (options.minimapHeightIsEditorHeight) {
                let logicalScrollHeight = (realLineCount * options.lineHeight
                    + options.paddingTop
                    + options.paddingBottom);
                if (options.scrollBeyondLastLine) {
                    logicalScrollHeight += Math.max(0, viewportHeight - options.lineHeight - options.paddingBottom);
                }
                const sliderHeight = Math.max(1, Math.floor(viewportHeight * viewportHeight / logicalScrollHeight));
                const maxMinimapSliderTop = Math.max(0, options.minimapHeight - sliderHeight);
                // The slider can move from 0 to `maxMinimapSliderTop`
                // in the same way `scrollTop` can move from 0 to `scrollHeight` - `viewportHeight`.
                const computedSliderRatio = (maxMinimapSliderTop) / (scrollHeight - viewportHeight);
                const sliderTop = (scrollTop * computedSliderRatio);
                const sliderNeeded = (maxMinimapSliderTop > 0);
                const maxLinesFitting = Math.floor(options.canvasInnerHeight / options.minimapLineHeight);
                const topPaddingLineCount = Math.floor(options.paddingTop / options.lineHeight);
                return new MinimapLayout(scrollTop, scrollHeight, sliderNeeded, computedSliderRatio, sliderTop, sliderHeight, topPaddingLineCount, 1, Math.min(lineCount, maxLinesFitting));
            }
            // The visible line count in a viewport can change due to a number of reasons:
            //  a) with the same viewport width, different scroll positions can result in partial lines being visible:
            //    e.g. for a line height of 20, and a viewport height of 600
            //          * scrollTop = 0  => visible lines are [1, 30]
            //          * scrollTop = 10 => visible lines are [1, 31] (with lines 1 and 31 partially visible)
            //          * scrollTop = 20 => visible lines are [2, 31]
            //  b) whitespace gaps might make their way in the viewport (which results in a decrease in the visible line count)
            //  c) we could be in the scroll beyond last line case (which also results in a decrease in the visible line count, down to possibly only one line being visible)
            // We must first establish a desirable slider height.
            let sliderHeight;
            if (viewportContainsWhitespaceGaps && viewportEndLineNumber !== lineCount) {
                // case b) from above: there are whitespace gaps in the viewport.
                // In this case, the height of the slider directly reflects the visible line count.
                const viewportLineCount = viewportEndLineNumber - viewportStartLineNumber + 1;
                sliderHeight = Math.floor(viewportLineCount * minimapLineHeight / pixelRatio);
            }
            else {
                // The slider has a stable height
                const expectedViewportLineCount = viewportHeight / lineHeight;
                sliderHeight = Math.floor(expectedViewportLineCount * minimapLineHeight / pixelRatio);
            }
            const extraLinesAtTheTop = Math.floor(options.paddingTop / lineHeight);
            let extraLinesAtTheBottom = Math.floor(options.paddingBottom / lineHeight);
            if (options.scrollBeyondLastLine) {
                const expectedViewportLineCount = viewportHeight / lineHeight;
                extraLinesAtTheBottom = Math.max(extraLinesAtTheBottom, expectedViewportLineCount - 1);
            }
            let maxMinimapSliderTop;
            if (extraLinesAtTheBottom > 0) {
                const expectedViewportLineCount = viewportHeight / lineHeight;
                // The minimap slider, when dragged all the way down, will contain the last line at its top
                maxMinimapSliderTop = (extraLinesAtTheTop + lineCount + extraLinesAtTheBottom - expectedViewportLineCount - 1) * minimapLineHeight / pixelRatio;
            }
            else {
                // The minimap slider, when dragged all the way down, will contain the last line at its bottom
                maxMinimapSliderTop = Math.max(0, (extraLinesAtTheTop + lineCount) * minimapLineHeight / pixelRatio - sliderHeight);
            }
            maxMinimapSliderTop = Math.min(options.minimapHeight - sliderHeight, maxMinimapSliderTop);
            // The slider can move from 0 to `maxMinimapSliderTop`
            // in the same way `scrollTop` can move from 0 to `scrollHeight` - `viewportHeight`.
            const computedSliderRatio = (maxMinimapSliderTop) / (scrollHeight - viewportHeight);
            const sliderTop = (scrollTop * computedSliderRatio);
            if (minimapLinesFitting >= extraLinesAtTheTop + lineCount + extraLinesAtTheBottom) {
                // All lines fit in the minimap
                const sliderNeeded = (maxMinimapSliderTop > 0);
                return new MinimapLayout(scrollTop, scrollHeight, sliderNeeded, computedSliderRatio, sliderTop, sliderHeight, extraLinesAtTheTop, 1, lineCount);
            }
            else {
                let consideringStartLineNumber;
                if (viewportStartLineNumber > 1) {
                    consideringStartLineNumber = viewportStartLineNumber + extraLinesAtTheTop;
                }
                else {
                    consideringStartLineNumber = Math.max(1, scrollTop / lineHeight);
                }
                let topPaddingLineCount;
                let startLineNumber = Math.max(1, Math.floor(consideringStartLineNumber - sliderTop * pixelRatio / minimapLineHeight));
                if (startLineNumber < extraLinesAtTheTop) {
                    topPaddingLineCount = extraLinesAtTheTop - startLineNumber + 1;
                    startLineNumber = 1;
                }
                else {
                    topPaddingLineCount = 0;
                    startLineNumber = Math.max(1, startLineNumber - extraLinesAtTheTop);
                }
                // Avoid flickering caused by a partial viewport start line
                // by being consistent w.r.t. the previous layout decision
                if (previousLayout && previousLayout.scrollHeight === scrollHeight) {
                    if (previousLayout.scrollTop > scrollTop) {
                        // Scrolling up => never increase `startLineNumber`
                        startLineNumber = Math.min(startLineNumber, previousLayout.startLineNumber);
                        topPaddingLineCount = Math.max(topPaddingLineCount, previousLayout.topPaddingLineCount);
                    }
                    if (previousLayout.scrollTop < scrollTop) {
                        // Scrolling down => never decrease `startLineNumber`
                        startLineNumber = Math.max(startLineNumber, previousLayout.startLineNumber);
                        topPaddingLineCount = Math.min(topPaddingLineCount, previousLayout.topPaddingLineCount);
                    }
                }
                const endLineNumber = Math.min(lineCount, startLineNumber - topPaddingLineCount + minimapLinesFitting - 1);
                const partialLine = (scrollTop - viewportStartLineNumberVerticalOffset) / lineHeight;
                let sliderTopAligned;
                if (scrollTop >= options.paddingTop) {
                    sliderTopAligned = (viewportStartLineNumber - startLineNumber + topPaddingLineCount + partialLine) * minimapLineHeight / pixelRatio;
                }
                else {
                    sliderTopAligned = (scrollTop / options.paddingTop) * (topPaddingLineCount + partialLine) * minimapLineHeight / pixelRatio;
                }
                return new MinimapLayout(scrollTop, scrollHeight, true, computedSliderRatio, sliderTopAligned, sliderHeight, topPaddingLineCount, startLineNumber, endLineNumber);
            }
        }
    }
    class MinimapLine {
        static { this.INVALID = new MinimapLine(-1); }
        constructor(dy) {
            this.dy = dy;
        }
        onContentChanged() {
            this.dy = -1;
        }
        onTokensChanged() {
            this.dy = -1;
        }
    }
    class RenderData {
        constructor(renderedLayout, imageData, lines) {
            this.renderedLayout = renderedLayout;
            this._imageData = imageData;
            this._renderedLines = new viewLayer_1.RenderedLinesCollection(() => MinimapLine.INVALID);
            this._renderedLines._set(renderedLayout.startLineNumber, lines);
        }
        /**
         * Check if the current RenderData matches accurately the new desired layout and no painting is needed.
         */
        linesEquals(layout) {
            if (!this.scrollEquals(layout)) {
                return false;
            }
            const tmp = this._renderedLines._get();
            const lines = tmp.lines;
            for (let i = 0, len = lines.length; i < len; i++) {
                if (lines[i].dy === -1) {
                    // This line is invalid
                    return false;
                }
            }
            return true;
        }
        /**
         * Check if the current RenderData matches the new layout's scroll position
         */
        scrollEquals(layout) {
            return this.renderedLayout.startLineNumber === layout.startLineNumber
                && this.renderedLayout.endLineNumber === layout.endLineNumber;
        }
        _get() {
            const tmp = this._renderedLines._get();
            return {
                imageData: this._imageData,
                rendLineNumberStart: tmp.rendLineNumberStart,
                lines: tmp.lines
            };
        }
        onLinesChanged(changeFromLineNumber, changeCount) {
            return this._renderedLines.onLinesChanged(changeFromLineNumber, changeCount);
        }
        onLinesDeleted(deleteFromLineNumber, deleteToLineNumber) {
            this._renderedLines.onLinesDeleted(deleteFromLineNumber, deleteToLineNumber);
        }
        onLinesInserted(insertFromLineNumber, insertToLineNumber) {
            this._renderedLines.onLinesInserted(insertFromLineNumber, insertToLineNumber);
        }
        onTokensChanged(ranges) {
            return this._renderedLines.onTokensChanged(ranges);
        }
    }
    /**
     * Some sort of double buffering.
     *
     * Keeps two buffers around that will be rotated for painting.
     * Always gives a buffer that is filled with the background color.
     */
    class MinimapBuffers {
        constructor(ctx, WIDTH, HEIGHT, background) {
            this._backgroundFillData = MinimapBuffers._createBackgroundFillData(WIDTH, HEIGHT, background);
            this._buffers = [
                ctx.createImageData(WIDTH, HEIGHT),
                ctx.createImageData(WIDTH, HEIGHT)
            ];
            this._lastUsedBuffer = 0;
        }
        getBuffer() {
            // rotate buffers
            this._lastUsedBuffer = 1 - this._lastUsedBuffer;
            const result = this._buffers[this._lastUsedBuffer];
            // fill with background color
            result.data.set(this._backgroundFillData);
            return result;
        }
        static _createBackgroundFillData(WIDTH, HEIGHT, background) {
            const backgroundR = background.r;
            const backgroundG = background.g;
            const backgroundB = background.b;
            const backgroundA = background.a;
            const result = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
            let offset = 0;
            for (let i = 0; i < HEIGHT; i++) {
                for (let j = 0; j < WIDTH; j++) {
                    result[offset] = backgroundR;
                    result[offset + 1] = backgroundG;
                    result[offset + 2] = backgroundB;
                    result[offset + 3] = backgroundA;
                    offset += 4;
                }
            }
            return result;
        }
    }
    class MinimapSamplingState {
        static compute(options, viewLineCount, oldSamplingState) {
            if (options.renderMinimap === 0 /* RenderMinimap.None */ || !options.isSampling) {
                return [null, []];
            }
            // ratio is intentionally not part of the layout to avoid the layout changing all the time
            // so we need to recompute it again...
            const { minimapLineCount } = editorOptions_1.EditorLayoutInfoComputer.computeContainedMinimapLineCount({
                viewLineCount: viewLineCount,
                scrollBeyondLastLine: options.scrollBeyondLastLine,
                paddingTop: options.paddingTop,
                paddingBottom: options.paddingBottom,
                height: options.editorHeight,
                lineHeight: options.lineHeight,
                pixelRatio: options.pixelRatio
            });
            const ratio = viewLineCount / minimapLineCount;
            const halfRatio = ratio / 2;
            if (!oldSamplingState || oldSamplingState.minimapLines.length === 0) {
                const result = [];
                result[0] = 1;
                if (minimapLineCount > 1) {
                    for (let i = 0, lastIndex = minimapLineCount - 1; i < lastIndex; i++) {
                        result[i] = Math.round(i * ratio + halfRatio);
                    }
                    result[minimapLineCount - 1] = viewLineCount;
                }
                return [new MinimapSamplingState(ratio, result), []];
            }
            const oldMinimapLines = oldSamplingState.minimapLines;
            const oldLength = oldMinimapLines.length;
            const result = [];
            let oldIndex = 0;
            let oldDeltaLineCount = 0;
            let minViewLineNumber = 1;
            const MAX_EVENT_COUNT = 10; // generate at most 10 events, if there are more than 10 changes, just flush all previous data
            let events = [];
            let lastEvent = null;
            for (let i = 0; i < minimapLineCount; i++) {
                const fromViewLineNumber = Math.max(minViewLineNumber, Math.round(i * ratio));
                const toViewLineNumber = Math.max(fromViewLineNumber, Math.round((i + 1) * ratio));
                while (oldIndex < oldLength && oldMinimapLines[oldIndex] < fromViewLineNumber) {
                    if (events.length < MAX_EVENT_COUNT) {
                        const oldMinimapLineNumber = oldIndex + 1 + oldDeltaLineCount;
                        if (lastEvent && lastEvent.type === 'deleted' && lastEvent._oldIndex === oldIndex - 1) {
                            lastEvent.deleteToLineNumber++;
                        }
                        else {
                            lastEvent = { type: 'deleted', _oldIndex: oldIndex, deleteFromLineNumber: oldMinimapLineNumber, deleteToLineNumber: oldMinimapLineNumber };
                            events.push(lastEvent);
                        }
                        oldDeltaLineCount--;
                    }
                    oldIndex++;
                }
                let selectedViewLineNumber;
                if (oldIndex < oldLength && oldMinimapLines[oldIndex] <= toViewLineNumber) {
                    // reuse the old sampled line
                    selectedViewLineNumber = oldMinimapLines[oldIndex];
                    oldIndex++;
                }
                else {
                    if (i === 0) {
                        selectedViewLineNumber = 1;
                    }
                    else if (i + 1 === minimapLineCount) {
                        selectedViewLineNumber = viewLineCount;
                    }
                    else {
                        selectedViewLineNumber = Math.round(i * ratio + halfRatio);
                    }
                    if (events.length < MAX_EVENT_COUNT) {
                        const oldMinimapLineNumber = oldIndex + 1 + oldDeltaLineCount;
                        if (lastEvent && lastEvent.type === 'inserted' && lastEvent._i === i - 1) {
                            lastEvent.insertToLineNumber++;
                        }
                        else {
                            lastEvent = { type: 'inserted', _i: i, insertFromLineNumber: oldMinimapLineNumber, insertToLineNumber: oldMinimapLineNumber };
                            events.push(lastEvent);
                        }
                        oldDeltaLineCount++;
                    }
                }
                result[i] = selectedViewLineNumber;
                minViewLineNumber = selectedViewLineNumber;
            }
            if (events.length < MAX_EVENT_COUNT) {
                while (oldIndex < oldLength) {
                    const oldMinimapLineNumber = oldIndex + 1 + oldDeltaLineCount;
                    if (lastEvent && lastEvent.type === 'deleted' && lastEvent._oldIndex === oldIndex - 1) {
                        lastEvent.deleteToLineNumber++;
                    }
                    else {
                        lastEvent = { type: 'deleted', _oldIndex: oldIndex, deleteFromLineNumber: oldMinimapLineNumber, deleteToLineNumber: oldMinimapLineNumber };
                        events.push(lastEvent);
                    }
                    oldDeltaLineCount--;
                    oldIndex++;
                }
            }
            else {
                // too many events, just give up
                events = [{ type: 'flush' }];
            }
            return [new MinimapSamplingState(ratio, result), events];
        }
        constructor(samplingRatio, minimapLines) {
            this.samplingRatio = samplingRatio;
            this.minimapLines = minimapLines;
        }
        modelLineToMinimapLine(lineNumber) {
            return Math.min(this.minimapLines.length, Math.max(1, Math.round(lineNumber / this.samplingRatio)));
        }
        /**
         * Will return null if the model line ranges are not intersecting with a sampled model line.
         */
        modelLineRangeToMinimapLineRange(fromLineNumber, toLineNumber) {
            let fromLineIndex = this.modelLineToMinimapLine(fromLineNumber) - 1;
            while (fromLineIndex > 0 && this.minimapLines[fromLineIndex - 1] >= fromLineNumber) {
                fromLineIndex--;
            }
            let toLineIndex = this.modelLineToMinimapLine(toLineNumber) - 1;
            while (toLineIndex + 1 < this.minimapLines.length && this.minimapLines[toLineIndex + 1] <= toLineNumber) {
                toLineIndex++;
            }
            if (fromLineIndex === toLineIndex) {
                const sampledLineNumber = this.minimapLines[fromLineIndex];
                if (sampledLineNumber < fromLineNumber || sampledLineNumber > toLineNumber) {
                    // This line is not part of the sampled lines ==> nothing to do
                    return null;
                }
            }
            return [fromLineIndex + 1, toLineIndex + 1];
        }
        /**
         * Will always return a range, even if it is not intersecting with a sampled model line.
         */
        decorationLineRangeToMinimapLineRange(startLineNumber, endLineNumber) {
            let minimapLineStart = this.modelLineToMinimapLine(startLineNumber);
            let minimapLineEnd = this.modelLineToMinimapLine(endLineNumber);
            if (startLineNumber !== endLineNumber && minimapLineEnd === minimapLineStart) {
                if (minimapLineEnd === this.minimapLines.length) {
                    if (minimapLineStart > 1) {
                        minimapLineStart--;
                    }
                }
                else {
                    minimapLineEnd++;
                }
            }
            return [minimapLineStart, minimapLineEnd];
        }
        onLinesDeleted(e) {
            // have the mapping be sticky
            const deletedLineCount = e.toLineNumber - e.fromLineNumber + 1;
            let changeStartIndex = this.minimapLines.length;
            let changeEndIndex = 0;
            for (let i = this.minimapLines.length - 1; i >= 0; i--) {
                if (this.minimapLines[i] < e.fromLineNumber) {
                    break;
                }
                if (this.minimapLines[i] <= e.toLineNumber) {
                    // this line got deleted => move to previous available
                    this.minimapLines[i] = Math.max(1, e.fromLineNumber - 1);
                    changeStartIndex = Math.min(changeStartIndex, i);
                    changeEndIndex = Math.max(changeEndIndex, i);
                }
                else {
                    this.minimapLines[i] -= deletedLineCount;
                }
            }
            return [changeStartIndex, changeEndIndex];
        }
        onLinesInserted(e) {
            // have the mapping be sticky
            const insertedLineCount = e.toLineNumber - e.fromLineNumber + 1;
            for (let i = this.minimapLines.length - 1; i >= 0; i--) {
                if (this.minimapLines[i] < e.fromLineNumber) {
                    break;
                }
                this.minimapLines[i] += insertedLineCount;
            }
        }
    }
    class Minimap extends viewPart_1.ViewPart {
        constructor(context) {
            super(context);
            this.tokensColorTracker = minimapTokensColorTracker_1.MinimapTokensColorTracker.getInstance();
            this._selections = [];
            this._minimapSelections = null;
            this.options = new MinimapOptions(this._context.configuration, this._context.theme, this.tokensColorTracker);
            const [samplingState,] = MinimapSamplingState.compute(this.options, this._context.viewModel.getLineCount(), null);
            this._samplingState = samplingState;
            this._shouldCheckSampling = false;
            this._actual = new InnerMinimap(context.theme, this);
        }
        dispose() {
            this._actual.dispose();
            super.dispose();
        }
        getDomNode() {
            return this._actual.getDomNode();
        }
        _onOptionsMaybeChanged() {
            const opts = new MinimapOptions(this._context.configuration, this._context.theme, this.tokensColorTracker);
            if (this.options.equals(opts)) {
                return false;
            }
            this.options = opts;
            this._recreateLineSampling();
            this._actual.onDidChangeOptions();
            return true;
        }
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            return this._onOptionsMaybeChanged();
        }
        onCursorStateChanged(e) {
            this._selections = e.selections;
            this._minimapSelections = null;
            return this._actual.onSelectionChanged();
        }
        onDecorationsChanged(e) {
            if (e.affectsMinimap) {
                return this._actual.onDecorationsChanged();
            }
            return false;
        }
        onFlushed(e) {
            if (this._samplingState) {
                this._shouldCheckSampling = true;
            }
            return this._actual.onFlushed();
        }
        onLinesChanged(e) {
            if (this._samplingState) {
                const minimapLineRange = this._samplingState.modelLineRangeToMinimapLineRange(e.fromLineNumber, e.fromLineNumber + e.count - 1);
                if (minimapLineRange) {
                    return this._actual.onLinesChanged(minimapLineRange[0], minimapLineRange[1] - minimapLineRange[0] + 1);
                }
                else {
                    return false;
                }
            }
            else {
                return this._actual.onLinesChanged(e.fromLineNumber, e.count);
            }
        }
        onLinesDeleted(e) {
            if (this._samplingState) {
                const [changeStartIndex, changeEndIndex] = this._samplingState.onLinesDeleted(e);
                if (changeStartIndex <= changeEndIndex) {
                    this._actual.onLinesChanged(changeStartIndex + 1, changeEndIndex - changeStartIndex + 1);
                }
                this._shouldCheckSampling = true;
                return true;
            }
            else {
                return this._actual.onLinesDeleted(e.fromLineNumber, e.toLineNumber);
            }
        }
        onLinesInserted(e) {
            if (this._samplingState) {
                this._samplingState.onLinesInserted(e);
                this._shouldCheckSampling = true;
                return true;
            }
            else {
                return this._actual.onLinesInserted(e.fromLineNumber, e.toLineNumber);
            }
        }
        onScrollChanged(e) {
            return this._actual.onScrollChanged();
        }
        onThemeChanged(e) {
            this._actual.onThemeChanged();
            this._onOptionsMaybeChanged();
            return true;
        }
        onTokensChanged(e) {
            if (this._samplingState) {
                const ranges = [];
                for (const range of e.ranges) {
                    const minimapLineRange = this._samplingState.modelLineRangeToMinimapLineRange(range.fromLineNumber, range.toLineNumber);
                    if (minimapLineRange) {
                        ranges.push({ fromLineNumber: minimapLineRange[0], toLineNumber: minimapLineRange[1] });
                    }
                }
                if (ranges.length) {
                    return this._actual.onTokensChanged(ranges);
                }
                else {
                    return false;
                }
            }
            else {
                return this._actual.onTokensChanged(e.ranges);
            }
        }
        onTokensColorsChanged(e) {
            this._onOptionsMaybeChanged();
            return this._actual.onTokensColorsChanged();
        }
        onZonesChanged(e) {
            return this._actual.onZonesChanged();
        }
        // --- end event handlers
        prepareRender(ctx) {
            if (this._shouldCheckSampling) {
                this._shouldCheckSampling = false;
                this._recreateLineSampling();
            }
        }
        render(ctx) {
            let viewportStartLineNumber = ctx.visibleRange.startLineNumber;
            let viewportEndLineNumber = ctx.visibleRange.endLineNumber;
            if (this._samplingState) {
                viewportStartLineNumber = this._samplingState.modelLineToMinimapLine(viewportStartLineNumber);
                viewportEndLineNumber = this._samplingState.modelLineToMinimapLine(viewportEndLineNumber);
            }
            const minimapCtx = {
                viewportContainsWhitespaceGaps: (ctx.viewportData.whitespaceViewportData.length > 0),
                scrollWidth: ctx.scrollWidth,
                scrollHeight: ctx.scrollHeight,
                viewportStartLineNumber: viewportStartLineNumber,
                viewportEndLineNumber: viewportEndLineNumber,
                viewportStartLineNumberVerticalOffset: ctx.getVerticalOffsetForLineNumber(viewportStartLineNumber),
                scrollTop: ctx.scrollTop,
                scrollLeft: ctx.scrollLeft,
                viewportWidth: ctx.viewportWidth,
                viewportHeight: ctx.viewportHeight,
            };
            this._actual.render(minimapCtx);
        }
        //#region IMinimapModel
        _recreateLineSampling() {
            this._minimapSelections = null;
            const wasSampling = Boolean(this._samplingState);
            const [samplingState, events] = MinimapSamplingState.compute(this.options, this._context.viewModel.getLineCount(), this._samplingState);
            this._samplingState = samplingState;
            if (wasSampling && this._samplingState) {
                // was sampling, is sampling
                for (const event of events) {
                    switch (event.type) {
                        case 'deleted':
                            this._actual.onLinesDeleted(event.deleteFromLineNumber, event.deleteToLineNumber);
                            break;
                        case 'inserted':
                            this._actual.onLinesInserted(event.insertFromLineNumber, event.insertToLineNumber);
                            break;
                        case 'flush':
                            this._actual.onFlushed();
                            break;
                    }
                }
            }
        }
        getLineCount() {
            if (this._samplingState) {
                return this._samplingState.minimapLines.length;
            }
            return this._context.viewModel.getLineCount();
        }
        getRealLineCount() {
            return this._context.viewModel.getLineCount();
        }
        getLineContent(lineNumber) {
            if (this._samplingState) {
                return this._context.viewModel.getLineContent(this._samplingState.minimapLines[lineNumber - 1]);
            }
            return this._context.viewModel.getLineContent(lineNumber);
        }
        getLineMaxColumn(lineNumber) {
            if (this._samplingState) {
                return this._context.viewModel.getLineMaxColumn(this._samplingState.minimapLines[lineNumber - 1]);
            }
            return this._context.viewModel.getLineMaxColumn(lineNumber);
        }
        getMinimapLinesRenderingData(startLineNumber, endLineNumber, needed) {
            if (this._samplingState) {
                const result = [];
                for (let lineIndex = 0, lineCount = endLineNumber - startLineNumber + 1; lineIndex < lineCount; lineIndex++) {
                    if (needed[lineIndex]) {
                        result[lineIndex] = this._context.viewModel.getViewLineData(this._samplingState.minimapLines[startLineNumber + lineIndex - 1]);
                    }
                    else {
                        result[lineIndex] = null;
                    }
                }
                return result;
            }
            return this._context.viewModel.getMinimapLinesRenderingData(startLineNumber, endLineNumber, needed).data;
        }
        getSelections() {
            if (this._minimapSelections === null) {
                if (this._samplingState) {
                    this._minimapSelections = [];
                    for (const selection of this._selections) {
                        const [minimapLineStart, minimapLineEnd] = this._samplingState.decorationLineRangeToMinimapLineRange(selection.startLineNumber, selection.endLineNumber);
                        this._minimapSelections.push(new selection_1.Selection(minimapLineStart, selection.startColumn, minimapLineEnd, selection.endColumn));
                    }
                }
                else {
                    this._minimapSelections = this._selections;
                }
            }
            return this._minimapSelections;
        }
        getMinimapDecorationsInViewport(startLineNumber, endLineNumber) {
            let visibleRange;
            if (this._samplingState) {
                const modelStartLineNumber = this._samplingState.minimapLines[startLineNumber - 1];
                const modelEndLineNumber = this._samplingState.minimapLines[endLineNumber - 1];
                visibleRange = new range_1.Range(modelStartLineNumber, 1, modelEndLineNumber, this._context.viewModel.getLineMaxColumn(modelEndLineNumber));
            }
            else {
                visibleRange = new range_1.Range(startLineNumber, 1, endLineNumber, this._context.viewModel.getLineMaxColumn(endLineNumber));
            }
            const decorations = this._context.viewModel.getMinimapDecorationsInRange(visibleRange);
            if (this._samplingState) {
                const result = [];
                for (const decoration of decorations) {
                    if (!decoration.options.minimap) {
                        continue;
                    }
                    const range = decoration.range;
                    const minimapStartLineNumber = this._samplingState.modelLineToMinimapLine(range.startLineNumber);
                    const minimapEndLineNumber = this._samplingState.modelLineToMinimapLine(range.endLineNumber);
                    result.push(new viewModel_1.ViewModelDecoration(new range_1.Range(minimapStartLineNumber, range.startColumn, minimapEndLineNumber, range.endColumn), decoration.options));
                }
                return result;
            }
            return decorations;
        }
        getOptions() {
            return this._context.viewModel.model.getOptions();
        }
        revealLineNumber(lineNumber) {
            if (this._samplingState) {
                lineNumber = this._samplingState.minimapLines[lineNumber - 1];
            }
            this._context.viewModel.revealRange('mouse', false, new range_1.Range(lineNumber, 1, lineNumber, 1), 1 /* viewEvents.VerticalRevealType.Center */, 0 /* ScrollType.Smooth */);
        }
        setScrollTop(scrollTop) {
            this._context.viewModel.viewLayout.setScrollPosition({
                scrollTop: scrollTop
            }, 1 /* ScrollType.Immediate */);
        }
    }
    exports.Minimap = Minimap;
    class InnerMinimap extends lifecycle_1.Disposable {
        constructor(theme, model) {
            super();
            this._renderDecorations = false;
            this._gestureInProgress = false;
            this._theme = theme;
            this._model = model;
            this._lastRenderData = null;
            this._buffers = null;
            this._selectionColor = this._theme.getColor(colorRegistry_1.minimapSelection);
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            viewPart_1.PartFingerprints.write(this._domNode, 9 /* PartFingerprint.Minimap */);
            this._domNode.setClassName(this._getMinimapDomNodeClassName());
            this._domNode.setPosition('absolute');
            this._domNode.setAttribute('role', 'presentation');
            this._domNode.setAttribute('aria-hidden', 'true');
            this._shadow = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._shadow.setClassName('minimap-shadow-hidden');
            this._domNode.appendChild(this._shadow);
            this._canvas = (0, fastDomNode_1.createFastDomNode)(document.createElement('canvas'));
            this._canvas.setPosition('absolute');
            this._canvas.setLeft(0);
            this._domNode.appendChild(this._canvas);
            this._decorationsCanvas = (0, fastDomNode_1.createFastDomNode)(document.createElement('canvas'));
            this._decorationsCanvas.setPosition('absolute');
            this._decorationsCanvas.setClassName('minimap-decorations-layer');
            this._decorationsCanvas.setLeft(0);
            this._domNode.appendChild(this._decorationsCanvas);
            this._slider = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._slider.setPosition('absolute');
            this._slider.setClassName('minimap-slider');
            this._slider.setLayerHinting(true);
            this._slider.setContain('strict');
            this._domNode.appendChild(this._slider);
            this._sliderHorizontal = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._sliderHorizontal.setPosition('absolute');
            this._sliderHorizontal.setClassName('minimap-slider-horizontal');
            this._slider.appendChild(this._sliderHorizontal);
            this._applyLayout();
            this._pointerDownListener = dom.addStandardDisposableListener(this._domNode.domNode, dom.EventType.POINTER_DOWN, (e) => {
                e.preventDefault();
                const renderMinimap = this._model.options.renderMinimap;
                if (renderMinimap === 0 /* RenderMinimap.None */) {
                    return;
                }
                if (!this._lastRenderData) {
                    return;
                }
                if (this._model.options.size !== 'proportional') {
                    if (e.button === 0 && this._lastRenderData) {
                        // pretend the click occurred in the center of the slider
                        const position = dom.getDomNodePagePosition(this._slider.domNode);
                        const initialPosY = position.top + position.height / 2;
                        this._startSliderDragging(e, initialPosY, this._lastRenderData.renderedLayout);
                    }
                    return;
                }
                const minimapLineHeight = this._model.options.minimapLineHeight;
                const internalOffsetY = (this._model.options.canvasInnerHeight / this._model.options.canvasOuterHeight) * e.offsetY;
                const lineIndex = Math.floor(internalOffsetY / minimapLineHeight);
                let lineNumber = lineIndex + this._lastRenderData.renderedLayout.startLineNumber - this._lastRenderData.renderedLayout.topPaddingLineCount;
                lineNumber = Math.min(lineNumber, this._model.getLineCount());
                this._model.revealLineNumber(lineNumber);
            });
            this._sliderPointerMoveMonitor = new globalPointerMoveMonitor_1.GlobalPointerMoveMonitor();
            this._sliderPointerDownListener = dom.addStandardDisposableListener(this._slider.domNode, dom.EventType.POINTER_DOWN, (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.button === 0 && this._lastRenderData) {
                    this._startSliderDragging(e, e.pageY, this._lastRenderData.renderedLayout);
                }
            });
            this._gestureDisposable = touch_1.Gesture.addTarget(this._domNode.domNode);
            this._sliderTouchStartListener = dom.addDisposableListener(this._domNode.domNode, touch_1.EventType.Start, (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this._lastRenderData) {
                    this._slider.toggleClassName('active', true);
                    this._gestureInProgress = true;
                    this.scrollDueToTouchEvent(e);
                }
            }, { passive: false });
            this._sliderTouchMoveListener = dom.addDisposableListener(this._domNode.domNode, touch_1.EventType.Change, (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this._lastRenderData && this._gestureInProgress) {
                    this.scrollDueToTouchEvent(e);
                }
            }, { passive: false });
            this._sliderTouchEndListener = dom.addStandardDisposableListener(this._domNode.domNode, touch_1.EventType.End, (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._gestureInProgress = false;
                this._slider.toggleClassName('active', false);
            });
        }
        _startSliderDragging(e, initialPosY, initialSliderState) {
            if (!e.target || !(e.target instanceof Element)) {
                return;
            }
            const initialPosX = e.pageX;
            this._slider.toggleClassName('active', true);
            const handlePointerMove = (posy, posx) => {
                const minimapPosition = dom.getDomNodePagePosition(this._domNode.domNode);
                const pointerOrthogonalDelta = Math.min(Math.abs(posx - initialPosX), Math.abs(posx - minimapPosition.left), Math.abs(posx - minimapPosition.left - minimapPosition.width));
                if (platform.isWindows && pointerOrthogonalDelta > POINTER_DRAG_RESET_DISTANCE) {
                    // The pointer has wondered away from the scrollbar => reset dragging
                    this._model.setScrollTop(initialSliderState.scrollTop);
                    return;
                }
                const pointerDelta = posy - initialPosY;
                this._model.setScrollTop(initialSliderState.getDesiredScrollTopFromDelta(pointerDelta));
            };
            if (e.pageY !== initialPosY) {
                handlePointerMove(e.pageY, initialPosX);
            }
            this._sliderPointerMoveMonitor.startMonitoring(e.target, e.pointerId, e.buttons, pointerMoveData => handlePointerMove(pointerMoveData.pageY, pointerMoveData.pageX), () => {
                this._slider.toggleClassName('active', false);
            });
        }
        scrollDueToTouchEvent(touch) {
            const startY = this._domNode.domNode.getBoundingClientRect().top;
            const scrollTop = this._lastRenderData.renderedLayout.getDesiredScrollTopFromTouchLocation(touch.pageY - startY);
            this._model.setScrollTop(scrollTop);
        }
        dispose() {
            this._pointerDownListener.dispose();
            this._sliderPointerMoveMonitor.dispose();
            this._sliderPointerDownListener.dispose();
            this._gestureDisposable.dispose();
            this._sliderTouchStartListener.dispose();
            this._sliderTouchMoveListener.dispose();
            this._sliderTouchEndListener.dispose();
            super.dispose();
        }
        _getMinimapDomNodeClassName() {
            const class_ = ['minimap'];
            if (this._model.options.showSlider === 'always') {
                class_.push('slider-always');
            }
            else {
                class_.push('slider-mouseover');
            }
            if (this._model.options.autohide) {
                class_.push('autohide');
            }
            return class_.join(' ');
        }
        getDomNode() {
            return this._domNode;
        }
        _applyLayout() {
            this._domNode.setLeft(this._model.options.minimapLeft);
            this._domNode.setWidth(this._model.options.minimapWidth);
            this._domNode.setHeight(this._model.options.minimapHeight);
            this._shadow.setHeight(this._model.options.minimapHeight);
            this._canvas.setWidth(this._model.options.canvasOuterWidth);
            this._canvas.setHeight(this._model.options.canvasOuterHeight);
            this._canvas.domNode.width = this._model.options.canvasInnerWidth;
            this._canvas.domNode.height = this._model.options.canvasInnerHeight;
            this._decorationsCanvas.setWidth(this._model.options.canvasOuterWidth);
            this._decorationsCanvas.setHeight(this._model.options.canvasOuterHeight);
            this._decorationsCanvas.domNode.width = this._model.options.canvasInnerWidth;
            this._decorationsCanvas.domNode.height = this._model.options.canvasInnerHeight;
            this._slider.setWidth(this._model.options.minimapWidth);
        }
        _getBuffer() {
            if (!this._buffers) {
                if (this._model.options.canvasInnerWidth > 0 && this._model.options.canvasInnerHeight > 0) {
                    this._buffers = new MinimapBuffers(this._canvas.domNode.getContext('2d'), this._model.options.canvasInnerWidth, this._model.options.canvasInnerHeight, this._model.options.backgroundColor);
                }
            }
            return this._buffers ? this._buffers.getBuffer() : null;
        }
        // ---- begin view event handlers
        onDidChangeOptions() {
            this._lastRenderData = null;
            this._buffers = null;
            this._applyLayout();
            this._domNode.setClassName(this._getMinimapDomNodeClassName());
        }
        onSelectionChanged() {
            this._renderDecorations = true;
            return true;
        }
        onDecorationsChanged() {
            this._renderDecorations = true;
            return true;
        }
        onFlushed() {
            this._lastRenderData = null;
            return true;
        }
        onLinesChanged(changeFromLineNumber, changeCount) {
            if (this._lastRenderData) {
                return this._lastRenderData.onLinesChanged(changeFromLineNumber, changeCount);
            }
            return false;
        }
        onLinesDeleted(deleteFromLineNumber, deleteToLineNumber) {
            this._lastRenderData?.onLinesDeleted(deleteFromLineNumber, deleteToLineNumber);
            return true;
        }
        onLinesInserted(insertFromLineNumber, insertToLineNumber) {
            this._lastRenderData?.onLinesInserted(insertFromLineNumber, insertToLineNumber);
            return true;
        }
        onScrollChanged() {
            this._renderDecorations = true;
            return true;
        }
        onThemeChanged() {
            this._selectionColor = this._theme.getColor(colorRegistry_1.minimapSelection);
            this._renderDecorations = true;
            return true;
        }
        onTokensChanged(ranges) {
            if (this._lastRenderData) {
                return this._lastRenderData.onTokensChanged(ranges);
            }
            return false;
        }
        onTokensColorsChanged() {
            this._lastRenderData = null;
            this._buffers = null;
            return true;
        }
        onZonesChanged() {
            this._lastRenderData = null;
            return true;
        }
        // --- end event handlers
        render(renderingCtx) {
            const renderMinimap = this._model.options.renderMinimap;
            if (renderMinimap === 0 /* RenderMinimap.None */) {
                this._shadow.setClassName('minimap-shadow-hidden');
                this._sliderHorizontal.setWidth(0);
                this._sliderHorizontal.setHeight(0);
                return;
            }
            if (renderingCtx.scrollLeft + renderingCtx.viewportWidth >= renderingCtx.scrollWidth) {
                this._shadow.setClassName('minimap-shadow-hidden');
            }
            else {
                this._shadow.setClassName('minimap-shadow-visible');
            }
            const layout = MinimapLayout.create(this._model.options, renderingCtx.viewportStartLineNumber, renderingCtx.viewportEndLineNumber, renderingCtx.viewportStartLineNumberVerticalOffset, renderingCtx.viewportHeight, renderingCtx.viewportContainsWhitespaceGaps, this._model.getLineCount(), this._model.getRealLineCount(), renderingCtx.scrollTop, renderingCtx.scrollHeight, this._lastRenderData ? this._lastRenderData.renderedLayout : null);
            this._slider.setDisplay(layout.sliderNeeded ? 'block' : 'none');
            this._slider.setTop(layout.sliderTop);
            this._slider.setHeight(layout.sliderHeight);
            // Compute horizontal slider coordinates
            this._sliderHorizontal.setLeft(0);
            this._sliderHorizontal.setWidth(this._model.options.minimapWidth);
            this._sliderHorizontal.setTop(0);
            this._sliderHorizontal.setHeight(layout.sliderHeight);
            this.renderDecorations(layout);
            this._lastRenderData = this.renderLines(layout);
        }
        renderDecorations(layout) {
            if (this._renderDecorations) {
                this._renderDecorations = false;
                const selections = this._model.getSelections();
                selections.sort(range_1.Range.compareRangesUsingStarts);
                const decorations = this._model.getMinimapDecorationsInViewport(layout.startLineNumber, layout.endLineNumber);
                decorations.sort((a, b) => (a.options.zIndex || 0) - (b.options.zIndex || 0));
                const { canvasInnerWidth, canvasInnerHeight } = this._model.options;
                const minimapLineHeight = this._model.options.minimapLineHeight;
                const minimapCharWidth = this._model.options.minimapCharWidth;
                const tabSize = this._model.getOptions().tabSize;
                const canvasContext = this._decorationsCanvas.domNode.getContext('2d');
                canvasContext.clearRect(0, 0, canvasInnerWidth, canvasInnerHeight);
                // We first need to render line highlights and then render decorations on top of those.
                // But we need to pick a single color for each line, and use that as a line highlight.
                // This needs to be the color of the decoration with the highest `zIndex`, but priority
                // is given to the selection.
                const highlightedLines = new ContiguousLineMap(layout.startLineNumber, layout.endLineNumber, false);
                this._renderSelectionLineHighlights(canvasContext, selections, highlightedLines, layout, minimapLineHeight);
                this._renderDecorationsLineHighlights(canvasContext, decorations, highlightedLines, layout, minimapLineHeight);
                const lineOffsetMap = new ContiguousLineMap(layout.startLineNumber, layout.endLineNumber, null);
                this._renderSelectionsHighlights(canvasContext, selections, lineOffsetMap, layout, minimapLineHeight, tabSize, minimapCharWidth, canvasInnerWidth);
                this._renderDecorationsHighlights(canvasContext, decorations, lineOffsetMap, layout, minimapLineHeight, tabSize, minimapCharWidth, canvasInnerWidth);
            }
        }
        _renderSelectionLineHighlights(canvasContext, selections, highlightedLines, layout, minimapLineHeight) {
            if (!this._selectionColor || this._selectionColor.isTransparent()) {
                return;
            }
            canvasContext.fillStyle = this._selectionColor.transparent(0.5).toString();
            let y1 = 0;
            let y2 = 0;
            for (const selection of selections) {
                const intersection = layout.intersectWithViewport(selection);
                if (!intersection) {
                    // entirely outside minimap's viewport
                    continue;
                }
                const [startLineNumber, endLineNumber] = intersection;
                for (let line = startLineNumber; line <= endLineNumber; line++) {
                    highlightedLines.set(line, true);
                }
                const yy1 = layout.getYForLineNumber(startLineNumber, minimapLineHeight);
                const yy2 = layout.getYForLineNumber(endLineNumber, minimapLineHeight);
                if (y2 >= yy1) {
                    // merge into previous
                    y2 = yy2;
                }
                else {
                    if (y2 > y1) {
                        // flush
                        canvasContext.fillRect(editorOptions_1.MINIMAP_GUTTER_WIDTH, y1, canvasContext.canvas.width, y2 - y1);
                    }
                    y1 = yy1;
                    y2 = yy2;
                }
            }
            if (y2 > y1) {
                // flush
                canvasContext.fillRect(editorOptions_1.MINIMAP_GUTTER_WIDTH, y1, canvasContext.canvas.width, y2 - y1);
            }
        }
        _renderDecorationsLineHighlights(canvasContext, decorations, highlightedLines, layout, minimapLineHeight) {
            const highlightColors = new Map();
            // Loop backwards to hit first decorations with higher `zIndex`
            for (let i = decorations.length - 1; i >= 0; i--) {
                const decoration = decorations[i];
                const minimapOptions = decoration.options.minimap;
                if (!minimapOptions || minimapOptions.position !== model_1.MinimapPosition.Inline) {
                    continue;
                }
                const intersection = layout.intersectWithViewport(decoration.range);
                if (!intersection) {
                    // entirely outside minimap's viewport
                    continue;
                }
                const [startLineNumber, endLineNumber] = intersection;
                const decorationColor = minimapOptions.getColor(this._theme.value);
                if (!decorationColor || decorationColor.isTransparent()) {
                    continue;
                }
                let highlightColor = highlightColors.get(decorationColor.toString());
                if (!highlightColor) {
                    highlightColor = decorationColor.transparent(0.5).toString();
                    highlightColors.set(decorationColor.toString(), highlightColor);
                }
                canvasContext.fillStyle = highlightColor;
                for (let line = startLineNumber; line <= endLineNumber; line++) {
                    if (highlightedLines.has(line)) {
                        continue;
                    }
                    highlightedLines.set(line, true);
                    const y = layout.getYForLineNumber(startLineNumber, minimapLineHeight);
                    canvasContext.fillRect(editorOptions_1.MINIMAP_GUTTER_WIDTH, y, canvasContext.canvas.width, minimapLineHeight);
                }
            }
        }
        _renderSelectionsHighlights(canvasContext, selections, lineOffsetMap, layout, lineHeight, tabSize, characterWidth, canvasInnerWidth) {
            if (!this._selectionColor || this._selectionColor.isTransparent()) {
                return;
            }
            for (const selection of selections) {
                const intersection = layout.intersectWithViewport(selection);
                if (!intersection) {
                    // entirely outside minimap's viewport
                    continue;
                }
                const [startLineNumber, endLineNumber] = intersection;
                for (let line = startLineNumber; line <= endLineNumber; line++) {
                    this.renderDecorationOnLine(canvasContext, lineOffsetMap, selection, this._selectionColor, layout, line, lineHeight, lineHeight, tabSize, characterWidth, canvasInnerWidth);
                }
            }
        }
        _renderDecorationsHighlights(canvasContext, decorations, lineOffsetMap, layout, minimapLineHeight, tabSize, characterWidth, canvasInnerWidth) {
            // Loop forwards to hit first decorations with lower `zIndex`
            for (const decoration of decorations) {
                const minimapOptions = decoration.options.minimap;
                if (!minimapOptions) {
                    continue;
                }
                const intersection = layout.intersectWithViewport(decoration.range);
                if (!intersection) {
                    // entirely outside minimap's viewport
                    continue;
                }
                const [startLineNumber, endLineNumber] = intersection;
                const decorationColor = minimapOptions.getColor(this._theme.value);
                if (!decorationColor || decorationColor.isTransparent()) {
                    continue;
                }
                for (let line = startLineNumber; line <= endLineNumber; line++) {
                    switch (minimapOptions.position) {
                        case model_1.MinimapPosition.Inline:
                            this.renderDecorationOnLine(canvasContext, lineOffsetMap, decoration.range, decorationColor, layout, line, minimapLineHeight, minimapLineHeight, tabSize, characterWidth, canvasInnerWidth);
                            continue;
                        case model_1.MinimapPosition.Gutter: {
                            const y = layout.getYForLineNumber(line, minimapLineHeight);
                            const x = 2;
                            this.renderDecoration(canvasContext, decorationColor, x, y, GUTTER_DECORATION_WIDTH, minimapLineHeight);
                            continue;
                        }
                    }
                }
            }
        }
        renderDecorationOnLine(canvasContext, lineOffsetMap, decorationRange, decorationColor, layout, lineNumber, height, minimapLineHeight, tabSize, charWidth, canvasInnerWidth) {
            const y = layout.getYForLineNumber(lineNumber, minimapLineHeight);
            // Skip rendering the line if it's vertically outside our viewport
            if (y + height < 0 || y > this._model.options.canvasInnerHeight) {
                return;
            }
            const { startLineNumber, endLineNumber } = decorationRange;
            const startColumn = (startLineNumber === lineNumber ? decorationRange.startColumn : 1);
            const endColumn = (endLineNumber === lineNumber ? decorationRange.endColumn : this._model.getLineMaxColumn(lineNumber));
            const x1 = this.getXOffsetForPosition(lineOffsetMap, lineNumber, startColumn, tabSize, charWidth, canvasInnerWidth);
            const x2 = this.getXOffsetForPosition(lineOffsetMap, lineNumber, endColumn, tabSize, charWidth, canvasInnerWidth);
            this.renderDecoration(canvasContext, decorationColor, x1, y, x2 - x1, height);
        }
        getXOffsetForPosition(lineOffsetMap, lineNumber, column, tabSize, charWidth, canvasInnerWidth) {
            if (column === 1) {
                return editorOptions_1.MINIMAP_GUTTER_WIDTH;
            }
            const minimumXOffset = (column - 1) * charWidth;
            if (minimumXOffset >= canvasInnerWidth) {
                // there is no need to look at actual characters,
                // as this column is certainly after the minimap width
                return canvasInnerWidth;
            }
            // Cache line offset data so that it is only read once per line
            let lineIndexToXOffset = lineOffsetMap.get(lineNumber);
            if (!lineIndexToXOffset) {
                const lineData = this._model.getLineContent(lineNumber);
                lineIndexToXOffset = [editorOptions_1.MINIMAP_GUTTER_WIDTH];
                let prevx = editorOptions_1.MINIMAP_GUTTER_WIDTH;
                for (let i = 1; i < lineData.length + 1; i++) {
                    const charCode = lineData.charCodeAt(i - 1);
                    const dx = charCode === 9 /* CharCode.Tab */
                        ? tabSize * charWidth
                        : strings.isFullWidthCharacter(charCode)
                            ? 2 * charWidth
                            : charWidth;
                    const x = prevx + dx;
                    if (x >= canvasInnerWidth) {
                        // no need to keep on going, as we've hit the canvas width
                        lineIndexToXOffset[i] = canvasInnerWidth;
                        break;
                    }
                    lineIndexToXOffset[i] = x;
                    prevx = x;
                }
                lineOffsetMap.set(lineNumber, lineIndexToXOffset);
            }
            if (column - 1 < lineIndexToXOffset.length) {
                return lineIndexToXOffset[column - 1];
            }
            // goes over the canvas width
            return canvasInnerWidth;
        }
        renderDecoration(canvasContext, decorationColor, x, y, width, height) {
            canvasContext.fillStyle = decorationColor && decorationColor.toString() || '';
            canvasContext.fillRect(x, y, width, height);
        }
        renderLines(layout) {
            const startLineNumber = layout.startLineNumber;
            const endLineNumber = layout.endLineNumber;
            const minimapLineHeight = this._model.options.minimapLineHeight;
            // Check if nothing changed w.r.t. lines from last frame
            if (this._lastRenderData && this._lastRenderData.linesEquals(layout)) {
                const _lastData = this._lastRenderData._get();
                // Nice!! Nothing changed from last frame
                return new RenderData(layout, _lastData.imageData, _lastData.lines);
            }
            // Oh well!! We need to repaint some lines...
            const imageData = this._getBuffer();
            if (!imageData) {
                // 0 width or 0 height canvas, nothing to do
                return null;
            }
            // Render untouched lines by using last rendered data.
            const [_dirtyY1, _dirtyY2, needed] = InnerMinimap._renderUntouchedLines(imageData, layout.topPaddingLineCount, startLineNumber, endLineNumber, minimapLineHeight, this._lastRenderData);
            // Fetch rendering info from view model for rest of lines that need rendering.
            const lineInfo = this._model.getMinimapLinesRenderingData(startLineNumber, endLineNumber, needed);
            const tabSize = this._model.getOptions().tabSize;
            const defaultBackground = this._model.options.defaultBackgroundColor;
            const background = this._model.options.backgroundColor;
            const foregroundAlpha = this._model.options.foregroundAlpha;
            const tokensColorTracker = this._model.tokensColorTracker;
            const useLighterFont = tokensColorTracker.backgroundIsLight();
            const renderMinimap = this._model.options.renderMinimap;
            const charRenderer = this._model.options.charRenderer();
            const fontScale = this._model.options.fontScale;
            const minimapCharWidth = this._model.options.minimapCharWidth;
            const baseCharHeight = (renderMinimap === 1 /* RenderMinimap.Text */ ? 2 /* Constants.BASE_CHAR_HEIGHT */ : 2 /* Constants.BASE_CHAR_HEIGHT */ + 1);
            const renderMinimapLineHeight = baseCharHeight * fontScale;
            const innerLinePadding = (minimapLineHeight > renderMinimapLineHeight ? Math.floor((minimapLineHeight - renderMinimapLineHeight) / 2) : 0);
            // Render the rest of lines
            const backgroundA = background.a / 255;
            const renderBackground = new rgba_1.RGBA8(Math.round((background.r - defaultBackground.r) * backgroundA + defaultBackground.r), Math.round((background.g - defaultBackground.g) * backgroundA + defaultBackground.g), Math.round((background.b - defaultBackground.b) * backgroundA + defaultBackground.b), 255);
            let dy = layout.topPaddingLineCount * minimapLineHeight;
            const renderedLines = [];
            for (let lineIndex = 0, lineCount = endLineNumber - startLineNumber + 1; lineIndex < lineCount; lineIndex++) {
                if (needed[lineIndex]) {
                    InnerMinimap._renderLine(imageData, renderBackground, background.a, useLighterFont, renderMinimap, minimapCharWidth, tokensColorTracker, foregroundAlpha, charRenderer, dy, innerLinePadding, tabSize, lineInfo[lineIndex], fontScale, minimapLineHeight);
                }
                renderedLines[lineIndex] = new MinimapLine(dy);
                dy += minimapLineHeight;
            }
            const dirtyY1 = (_dirtyY1 === -1 ? 0 : _dirtyY1);
            const dirtyY2 = (_dirtyY2 === -1 ? imageData.height : _dirtyY2);
            const dirtyHeight = dirtyY2 - dirtyY1;
            // Finally, paint to the canvas
            const ctx = this._canvas.domNode.getContext('2d');
            ctx.putImageData(imageData, 0, 0, 0, dirtyY1, imageData.width, dirtyHeight);
            // Save rendered data for reuse on next frame if possible
            return new RenderData(layout, imageData, renderedLines);
        }
        static _renderUntouchedLines(target, topPaddingLineCount, startLineNumber, endLineNumber, minimapLineHeight, lastRenderData) {
            const needed = [];
            if (!lastRenderData) {
                for (let i = 0, len = endLineNumber - startLineNumber + 1; i < len; i++) {
                    needed[i] = true;
                }
                return [-1, -1, needed];
            }
            const _lastData = lastRenderData._get();
            const lastTargetData = _lastData.imageData.data;
            const lastStartLineNumber = _lastData.rendLineNumberStart;
            const lastLines = _lastData.lines;
            const lastLinesLength = lastLines.length;
            const WIDTH = target.width;
            const targetData = target.data;
            const maxDestPixel = (endLineNumber - startLineNumber + 1) * minimapLineHeight * WIDTH * 4;
            let dirtyPixel1 = -1; // the pixel offset up to which all the data is equal to the prev frame
            let dirtyPixel2 = -1; // the pixel offset after which all the data is equal to the prev frame
            let copySourceStart = -1;
            let copySourceEnd = -1;
            let copyDestStart = -1;
            let copyDestEnd = -1;
            let dest_dy = topPaddingLineCount * minimapLineHeight;
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const lineIndex = lineNumber - startLineNumber;
                const lastLineIndex = lineNumber - lastStartLineNumber;
                const source_dy = (lastLineIndex >= 0 && lastLineIndex < lastLinesLength ? lastLines[lastLineIndex].dy : -1);
                if (source_dy === -1) {
                    needed[lineIndex] = true;
                    dest_dy += minimapLineHeight;
                    continue;
                }
                const sourceStart = source_dy * WIDTH * 4;
                const sourceEnd = (source_dy + minimapLineHeight) * WIDTH * 4;
                const destStart = dest_dy * WIDTH * 4;
                const destEnd = (dest_dy + minimapLineHeight) * WIDTH * 4;
                if (copySourceEnd === sourceStart && copyDestEnd === destStart) {
                    // contiguous zone => extend copy request
                    copySourceEnd = sourceEnd;
                    copyDestEnd = destEnd;
                }
                else {
                    if (copySourceStart !== -1) {
                        // flush existing copy request
                        targetData.set(lastTargetData.subarray(copySourceStart, copySourceEnd), copyDestStart);
                        if (dirtyPixel1 === -1 && copySourceStart === 0 && copySourceStart === copyDestStart) {
                            dirtyPixel1 = copySourceEnd;
                        }
                        if (dirtyPixel2 === -1 && copySourceEnd === maxDestPixel && copySourceStart === copyDestStart) {
                            dirtyPixel2 = copySourceStart;
                        }
                    }
                    copySourceStart = sourceStart;
                    copySourceEnd = sourceEnd;
                    copyDestStart = destStart;
                    copyDestEnd = destEnd;
                }
                needed[lineIndex] = false;
                dest_dy += minimapLineHeight;
            }
            if (copySourceStart !== -1) {
                // flush existing copy request
                targetData.set(lastTargetData.subarray(copySourceStart, copySourceEnd), copyDestStart);
                if (dirtyPixel1 === -1 && copySourceStart === 0 && copySourceStart === copyDestStart) {
                    dirtyPixel1 = copySourceEnd;
                }
                if (dirtyPixel2 === -1 && copySourceEnd === maxDestPixel && copySourceStart === copyDestStart) {
                    dirtyPixel2 = copySourceStart;
                }
            }
            const dirtyY1 = (dirtyPixel1 === -1 ? -1 : dirtyPixel1 / (WIDTH * 4));
            const dirtyY2 = (dirtyPixel2 === -1 ? -1 : dirtyPixel2 / (WIDTH * 4));
            return [dirtyY1, dirtyY2, needed];
        }
        static _renderLine(target, backgroundColor, backgroundAlpha, useLighterFont, renderMinimap, charWidth, colorTracker, foregroundAlpha, minimapCharRenderer, dy, innerLinePadding, tabSize, lineData, fontScale, minimapLineHeight) {
            const content = lineData.content;
            const tokens = lineData.tokens;
            const maxDx = target.width - charWidth;
            const force1pxHeight = (minimapLineHeight === 1);
            let dx = editorOptions_1.MINIMAP_GUTTER_WIDTH;
            let charIndex = 0;
            let tabsCharDelta = 0;
            for (let tokenIndex = 0, tokensLen = tokens.getCount(); tokenIndex < tokensLen; tokenIndex++) {
                const tokenEndIndex = tokens.getEndOffset(tokenIndex);
                const tokenColorId = tokens.getForeground(tokenIndex);
                const tokenColor = colorTracker.getColor(tokenColorId);
                for (; charIndex < tokenEndIndex; charIndex++) {
                    if (dx > maxDx) {
                        // hit edge of minimap
                        return;
                    }
                    const charCode = content.charCodeAt(charIndex);
                    if (charCode === 9 /* CharCode.Tab */) {
                        const insertSpacesCount = tabSize - (charIndex + tabsCharDelta) % tabSize;
                        tabsCharDelta += insertSpacesCount - 1;
                        // No need to render anything since tab is invisible
                        dx += insertSpacesCount * charWidth;
                    }
                    else if (charCode === 32 /* CharCode.Space */) {
                        // No need to render anything since space is invisible
                        dx += charWidth;
                    }
                    else {
                        // Render twice for a full width character
                        const count = strings.isFullWidthCharacter(charCode) ? 2 : 1;
                        for (let i = 0; i < count; i++) {
                            if (renderMinimap === 2 /* RenderMinimap.Blocks */) {
                                minimapCharRenderer.blockRenderChar(target, dx, dy + innerLinePadding, tokenColor, foregroundAlpha, backgroundColor, backgroundAlpha, force1pxHeight);
                            }
                            else { // RenderMinimap.Text
                                minimapCharRenderer.renderChar(target, dx, dy + innerLinePadding, charCode, tokenColor, foregroundAlpha, backgroundColor, backgroundAlpha, fontScale, useLighterFont, force1pxHeight);
                            }
                            dx += charWidth;
                            if (dx > maxDx) {
                                // hit edge of minimap
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
    class ContiguousLineMap {
        constructor(startLineNumber, endLineNumber, defaultValue) {
            this._startLineNumber = startLineNumber;
            this._endLineNumber = endLineNumber;
            this._defaultValue = defaultValue;
            this._values = [];
            for (let i = 0, count = this._endLineNumber - this._startLineNumber + 1; i < count; i++) {
                this._values[i] = defaultValue;
            }
        }
        has(lineNumber) {
            return (this.get(lineNumber) !== this._defaultValue);
        }
        set(lineNumber, value) {
            if (lineNumber < this._startLineNumber || lineNumber > this._endLineNumber) {
                return;
            }
            this._values[lineNumber - this._startLineNumber] = value;
        }
        get(lineNumber) {
            if (lineNumber < this._startLineNumber || lineNumber > this._endLineNumber) {
                return this._defaultValue;
            }
            return this._values[lineNumber - this._startLineNumber];
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaW1hcC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlld1BhcnRzL21pbmltYXAvbWluaW1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQ2hHOztPQUVHO0lBQ0gsTUFBTSwyQkFBMkIsR0FBRyxHQUFHLENBQUM7SUFFeEMsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLENBQUM7SUFFbEMsTUFBTSxjQUFjO1FBd0RuQixZQUFZLGFBQW1DLEVBQUUsS0FBa0IsRUFBRSxrQkFBNkM7WUFDakgsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUN0QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxtQ0FBeUIsQ0FBQztZQUN4RCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxtQ0FBeUIsQ0FBQztZQUN4RCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1lBQ3pDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLGdDQUF1QixDQUFDO1lBQ3BELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLCtCQUFzQixDQUFDO1lBRXRELElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQztZQUNqRCxJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLDJCQUEyQixHQUFHLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQztZQUM3RSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsT0FBTyxDQUFDLEdBQUcsNkNBQW1DLENBQUM7WUFDM0UsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRywrQkFBc0IsQ0FBQyxHQUFHLENBQUM7WUFDeEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FB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
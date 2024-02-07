/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/browser/view/renderingContext", "vs/editor/common/core/range", "vs/css!./decorations"], function (require, exports, dynamicViewOverlay_1, renderingContext_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecorationsOverlay = void 0;
    class DecorationsOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        constructor(context) {
            super();
            this._context = context;
            const options = this._context.configuration.options;
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._typicalHalfwidthCharacterWidth = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            this._renderResult = null;
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            this._renderResult = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._typicalHalfwidthCharacterWidth = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            return true;
        }
        onDecorationsChanged(e) {
            return true;
        }
        onFlushed(e) {
            return true;
        }
        onLinesChanged(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollTopChanged || e.scrollWidthChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            const _decorations = ctx.getDecorationsInViewport();
            // Keep only decorations with `className`
            let decorations = [];
            let decorationsLen = 0;
            for (let i = 0, len = _decorations.length; i < len; i++) {
                const d = _decorations[i];
                if (d.options.className) {
                    decorations[decorationsLen++] = d;
                }
            }
            // Sort decorations for consistent render output
            decorations = decorations.sort((a, b) => {
                if (a.options.zIndex < b.options.zIndex) {
                    return -1;
                }
                if (a.options.zIndex > b.options.zIndex) {
                    return 1;
                }
                const aClassName = a.options.className;
                const bClassName = b.options.className;
                if (aClassName < bClassName) {
                    return -1;
                }
                if (aClassName > bClassName) {
                    return 1;
                }
                return range_1.Range.compareRangesUsingStarts(a.range, b.range);
            });
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                output[lineIndex] = '';
            }
            // Render first whole line decorations and then regular decorations
            this._renderWholeLineDecorations(ctx, decorations, output);
            this._renderNormalDecorations(ctx, decorations, output);
            this._renderResult = output;
        }
        _renderWholeLineDecorations(ctx, decorations, output) {
            const lineHeight = String(this._lineHeight);
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            for (let i = 0, lenI = decorations.length; i < lenI; i++) {
                const d = decorations[i];
                if (!d.options.isWholeLine) {
                    continue;
                }
                const decorationOutput = ('<div class="cdr '
                    + d.options.className
                    + '" style="left:0;width:100%;height:'
                    + lineHeight
                    + 'px;"></div>');
                const startLineNumber = Math.max(d.range.startLineNumber, visibleStartLineNumber);
                const endLineNumber = Math.min(d.range.endLineNumber, visibleEndLineNumber);
                for (let j = startLineNumber; j <= endLineNumber; j++) {
                    const lineIndex = j - visibleStartLineNumber;
                    output[lineIndex] += decorationOutput;
                }
            }
        }
        _renderNormalDecorations(ctx, decorations, output) {
            const lineHeight = String(this._lineHeight);
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            let prevClassName = null;
            let prevShowIfCollapsed = false;
            let prevRange = null;
            let prevShouldFillLineOnLineBreak = false;
            for (let i = 0, lenI = decorations.length; i < lenI; i++) {
                const d = decorations[i];
                if (d.options.isWholeLine) {
                    continue;
                }
                const className = d.options.className;
                const showIfCollapsed = Boolean(d.options.showIfCollapsed);
                let range = d.range;
                if (showIfCollapsed && range.endColumn === 1 && range.endLineNumber !== range.startLineNumber) {
                    range = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber - 1, this._context.viewModel.getLineMaxColumn(range.endLineNumber - 1));
                }
                if (prevClassName === className && prevShowIfCollapsed === showIfCollapsed && range_1.Range.areIntersectingOrTouching(prevRange, range)) {
                    // merge into previous decoration
                    prevRange = range_1.Range.plusRange(prevRange, range);
                    continue;
                }
                // flush previous decoration
                if (prevClassName !== null) {
                    this._renderNormalDecoration(ctx, prevRange, prevClassName, prevShouldFillLineOnLineBreak, prevShowIfCollapsed, lineHeight, visibleStartLineNumber, output);
                }
                prevClassName = className;
                prevShowIfCollapsed = showIfCollapsed;
                prevRange = range;
                prevShouldFillLineOnLineBreak = d.options.shouldFillLineOnLineBreak ?? false;
            }
            if (prevClassName !== null) {
                this._renderNormalDecoration(ctx, prevRange, prevClassName, prevShouldFillLineOnLineBreak, prevShowIfCollapsed, lineHeight, visibleStartLineNumber, output);
            }
        }
        _renderNormalDecoration(ctx, range, className, shouldFillLineOnLineBreak, showIfCollapsed, lineHeight, visibleStartLineNumber, output) {
            const linesVisibleRanges = ctx.linesVisibleRangesForRange(range, /*TODO@Alex*/ className === 'findMatch');
            if (!linesVisibleRanges) {
                return;
            }
            for (let j = 0, lenJ = linesVisibleRanges.length; j < lenJ; j++) {
                const lineVisibleRanges = linesVisibleRanges[j];
                if (lineVisibleRanges.outsideRenderedLine) {
                    continue;
                }
                const lineIndex = lineVisibleRanges.lineNumber - visibleStartLineNumber;
                if (showIfCollapsed && lineVisibleRanges.ranges.length === 1) {
                    const singleVisibleRange = lineVisibleRanges.ranges[0];
                    if (singleVisibleRange.width < this._typicalHalfwidthCharacterWidth) {
                        // collapsed/very small range case => make the decoration visible by expanding its width
                        // expand its size on both sides (both to the left and to the right, keeping it centered)
                        const center = Math.round(singleVisibleRange.left + singleVisibleRange.width / 2);
                        const left = Math.max(0, Math.round(center - this._typicalHalfwidthCharacterWidth / 2));
                        lineVisibleRanges.ranges[0] = new renderingContext_1.HorizontalRange(left, this._typicalHalfwidthCharacterWidth);
                    }
                }
                for (let k = 0, lenK = lineVisibleRanges.ranges.length; k < lenK; k++) {
                    const expandToLeft = shouldFillLineOnLineBreak && lineVisibleRanges.continuesOnNextLine && lenK === 1;
                    const visibleRange = lineVisibleRanges.ranges[k];
                    const decorationOutput = ('<div class="cdr '
                        + className
                        + '" style="left:'
                        + String(visibleRange.left)
                        + (expandToLeft ?
                            'px;width:100%;height:' :
                            ('px;width:' + String(visibleRange.width) + 'px;height:'))
                        + lineHeight
                        + 'px;"></div>');
                    output[lineIndex] += decorationOutput;
                }
            }
        }
        render(startLineNumber, lineNumber) {
            if (!this._renderResult) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
                return '';
            }
            return this._renderResult[lineIndex];
        }
    }
    exports.DecorationsOverlay = DecorationsOverlay;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy9kZWNvcmF0aW9ucy9kZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBYSxrQkFBbUIsU0FBUSx1Q0FBa0I7UUFPekQsWUFBWSxPQUFvQjtZQUMvQixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUNwRCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO1lBQ3hELElBQUksQ0FBQywrQkFBK0IsR0FBRyxPQUFPLENBQUMsR0FBRyxnQ0FBdUIsQ0FBQyw4QkFBOEIsQ0FBQztZQUN6RyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUUxQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQzFCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRUQsMkJBQTJCO1FBRVgsc0JBQXNCLENBQUMsQ0FBMkM7WUFDakYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3BELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsa0NBQXlCLENBQUM7WUFDeEQsSUFBSSxDQUFDLCtCQUErQixH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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/platform/theme/common/themeService", "vs/editor/common/core/editorColorRegistry", "vs/css!./lineNumbers"], function (require, exports, platform, dynamicViewOverlay_1, position_1, range_1, themeService_1, editorColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineNumbersOverlay = void 0;
    class LineNumbersOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        static { this.CLASS_NAME = 'line-numbers'; }
        constructor(context) {
            super();
            this._context = context;
            this._readConfig();
            this._lastCursorModelPosition = new position_1.Position(1, 1);
            this._renderResult = null;
            this._activeLineNumber = 1;
            this._context.addEventHandler(this);
        }
        _readConfig() {
            const options = this._context.configuration.options;
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            const lineNumbers = options.get(67 /* EditorOption.lineNumbers */);
            this._renderLineNumbers = lineNumbers.renderType;
            this._renderCustomLineNumbers = lineNumbers.renderFn;
            this._renderFinalNewline = options.get(94 /* EditorOption.renderFinalNewline */);
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._lineNumbersLeft = layoutInfo.lineNumbersLeft;
            this._lineNumbersWidth = layoutInfo.lineNumbersWidth;
        }
        dispose() {
            this._context.removeEventHandler(this);
            this._renderResult = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            this._readConfig();
            return true;
        }
        onCursorStateChanged(e) {
            const primaryViewPosition = e.selections[0].getPosition();
            this._lastCursorModelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(primaryViewPosition);
            let shouldRender = false;
            if (this._activeLineNumber !== primaryViewPosition.lineNumber) {
                this._activeLineNumber = primaryViewPosition.lineNumber;
                shouldRender = true;
            }
            if (this._renderLineNumbers === 2 /* RenderLineNumbersType.Relative */ || this._renderLineNumbers === 3 /* RenderLineNumbersType.Interval */) {
                shouldRender = true;
            }
            return shouldRender;
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
            return e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        onDecorationsChanged(e) {
            return e.affectsLineNumber;
        }
        // --- end event handlers
        _getLineRenderLineNumber(viewLineNumber) {
            const modelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(viewLineNumber, 1));
            if (modelPosition.column !== 1) {
                return '';
            }
            const modelLineNumber = modelPosition.lineNumber;
            if (this._renderCustomLineNumbers) {
                return this._renderCustomLineNumbers(modelLineNumber);
            }
            if (this._renderLineNumbers === 2 /* RenderLineNumbersType.Relative */) {
                const diff = Math.abs(this._lastCursorModelPosition.lineNumber - modelLineNumber);
                if (diff === 0) {
                    return '<span class="relative-current-line-number">' + modelLineNumber + '</span>';
                }
                return String(diff);
            }
            if (this._renderLineNumbers === 3 /* RenderLineNumbersType.Interval */) {
                if (this._lastCursorModelPosition.lineNumber === modelLineNumber) {
                    return String(modelLineNumber);
                }
                if (modelLineNumber % 10 === 0) {
                    return String(modelLineNumber);
                }
                return '';
            }
            return String(modelLineNumber);
        }
        prepareRender(ctx) {
            if (this._renderLineNumbers === 0 /* RenderLineNumbersType.Off */) {
                this._renderResult = null;
                return;
            }
            const lineHeightClassName = (platform.isLinux ? (this._lineHeight % 2 === 0 ? ' lh-even' : ' lh-odd') : '');
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const lineNoDecorations = this._context.viewModel.getDecorationsInViewport(ctx.visibleRange).filter(d => !!d.options.lineNumberClassName);
            lineNoDecorations.sort((a, b) => range_1.Range.compareRangesUsingEnds(a.range, b.range));
            let decorationStartIndex = 0;
            const lineCount = this._context.viewModel.getLineCount();
            const output = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                let renderLineNumber = this._getLineRenderLineNumber(lineNumber);
                let extraClassNames = '';
                // skip decorations whose end positions we've already passed
                while (decorationStartIndex < lineNoDecorations.length && lineNoDecorations[decorationStartIndex].range.endLineNumber < lineNumber) {
                    decorationStartIndex++;
                }
                for (let i = decorationStartIndex; i < lineNoDecorations.length; i++) {
                    const { range, options } = lineNoDecorations[i];
                    if (range.startLineNumber <= lineNumber) {
                        extraClassNames += ' ' + options.lineNumberClassName;
                    }
                }
                if (!renderLineNumber && !extraClassNames) {
                    output[lineIndex] = '';
                    continue;
                }
                if (lineNumber === lineCount && this._context.viewModel.getLineLength(lineNumber) === 0) {
                    // this is the last line
                    if (this._renderFinalNewline === 'off') {
                        renderLineNumber = '';
                    }
                    if (this._renderFinalNewline === 'dimmed') {
                        extraClassNames += ' dimmed-line-number';
                    }
                }
                if (lineNumber === this._activeLineNumber) {
                    extraClassNames += ' active-line-number';
                }
                output[lineIndex] = (`<div class="${LineNumbersOverlay.CLASS_NAME}${lineHeightClassName}${extraClassNames}" style="left:${this._lineNumbersLeft}px;width:${this._lineNumbersWidth}px;">${renderLineNumber}</div>`);
            }
            this._renderResult = output;
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
    exports.LineNumbersOverlay = LineNumbersOverlay;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const editorLineNumbersColor = theme.getColor(editorColorRegistry_1.editorLineNumbers);
        const editorDimmedLineNumberColor = theme.getColor(editorColorRegistry_1.editorDimmedLineNumber);
        if (editorDimmedLineNumberColor) {
            collector.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${editorDimmedLineNumberColor}; }`);
        }
        else if (editorLineNumbersColor) {
            collector.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${editorLineNumbersColor.transparent(0.4)}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZU51bWJlcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy9saW5lTnVtYmVycy9saW5lTnVtYmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBYSxrQkFBbUIsU0FBUSx1Q0FBa0I7aUJBRWxDLGVBQVUsR0FBRyxjQUFjLENBQUM7UUFjbkQsWUFBWSxPQUFvQjtZQUMvQixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBRXhCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUVuQixJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUMxQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTyxXQUFXO1lBQ2xCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUNwRCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO1lBQ3hELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLG1DQUEwQixDQUFDO1lBQzFELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDO1lBQ2pELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQ3JELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsR0FBRywwQ0FBaUMsQ0FBQztZQUN4RSxN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
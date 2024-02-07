/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/core/editorColorRegistry", "vs/base/common/arrays", "vs/platform/theme/common/themeService", "vs/editor/common/core/selection", "vs/platform/theme/common/theme", "vs/editor/common/core/position", "vs/css!./currentLineHighlight"], function (require, exports, dynamicViewOverlay_1, editorColorRegistry_1, arrays, themeService_1, selection_1, theme_1, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CurrentLineMarginHighlightOverlay = exports.CurrentLineHighlightOverlay = exports.AbstractLineHighlightOverlay = void 0;
    class AbstractLineHighlightOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        constructor(context) {
            super();
            this._context = context;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._renderLineHighlight = options.get(95 /* EditorOption.renderLineHighlight */);
            this._renderLineHighlightOnlyWhenFocus = options.get(96 /* EditorOption.renderLineHighlightOnlyWhenFocus */);
            this._wordWrap = layoutInfo.isViewportWrapping;
            this._contentLeft = layoutInfo.contentLeft;
            this._contentWidth = layoutInfo.contentWidth;
            this._selectionIsEmpty = true;
            this._focused = false;
            this._cursorLineNumbers = [1];
            this._selections = [new selection_1.Selection(1, 1, 1, 1)];
            this._renderData = null;
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            super.dispose();
        }
        _readFromSelections() {
            let hasChanged = false;
            const lineNumbers = new Set();
            for (const selection of this._selections) {
                lineNumbers.add(selection.positionLineNumber);
            }
            const cursorsLineNumbers = Array.from(lineNumbers);
            cursorsLineNumbers.sort((a, b) => a - b);
            if (!arrays.equals(this._cursorLineNumbers, cursorsLineNumbers)) {
                this._cursorLineNumbers = cursorsLineNumbers;
                hasChanged = true;
            }
            const selectionIsEmpty = this._selections.every(s => s.isEmpty());
            if (this._selectionIsEmpty !== selectionIsEmpty) {
                this._selectionIsEmpty = selectionIsEmpty;
                hasChanged = true;
            }
            return hasChanged;
        }
        // --- begin event handlers
        onThemeChanged(e) {
            return this._readFromSelections();
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._renderLineHighlight = options.get(95 /* EditorOption.renderLineHighlight */);
            this._renderLineHighlightOnlyWhenFocus = options.get(96 /* EditorOption.renderLineHighlightOnlyWhenFocus */);
            this._wordWrap = layoutInfo.isViewportWrapping;
            this._contentLeft = layoutInfo.contentLeft;
            this._contentWidth = layoutInfo.contentWidth;
            return true;
        }
        onCursorStateChanged(e) {
            this._selections = e.selections;
            return this._readFromSelections();
        }
        onFlushed(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollWidthChanged || e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        onFocusChanged(e) {
            if (!this._renderLineHighlightOnlyWhenFocus) {
                return false;
            }
            this._focused = e.isFocused;
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            if (!this._shouldRenderThis()) {
                this._renderData = null;
                return;
            }
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            // initialize renderData
            const renderData = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                renderData[lineIndex] = '';
            }
            if (this._wordWrap) {
                // do a first pass to render wrapped lines
                const renderedLineWrapped = this._renderOne(ctx, false);
                for (const cursorLineNumber of this._cursorLineNumbers) {
                    const coordinatesConverter = this._context.viewModel.coordinatesConverter;
                    const modelLineNumber = coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(cursorLineNumber, 1)).lineNumber;
                    const firstViewLineNumber = coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelLineNumber, 1)).lineNumber;
                    const lastViewLineNumber = coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelLineNumber, this._context.viewModel.model.getLineMaxColumn(modelLineNumber))).lineNumber;
                    const firstLine = Math.max(firstViewLineNumber, visibleStartLineNumber);
                    const lastLine = Math.min(lastViewLineNumber, visibleEndLineNumber);
                    for (let lineNumber = firstLine; lineNumber <= lastLine; lineNumber++) {
                        const lineIndex = lineNumber - visibleStartLineNumber;
                        renderData[lineIndex] = renderedLineWrapped;
                    }
                }
            }
            // do a second pass to render exact lines
            const renderedLineExact = this._renderOne(ctx, true);
            for (const cursorLineNumber of this._cursorLineNumbers) {
                if (cursorLineNumber < visibleStartLineNumber || cursorLineNumber > visibleEndLineNumber) {
                    continue;
                }
                const lineIndex = cursorLineNumber - visibleStartLineNumber;
                renderData[lineIndex] = renderedLineExact;
            }
            this._renderData = renderData;
        }
        render(startLineNumber, lineNumber) {
            if (!this._renderData) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex >= this._renderData.length) {
                return '';
            }
            return this._renderData[lineIndex];
        }
        _shouldRenderInMargin() {
            return ((this._renderLineHighlight === 'gutter' || this._renderLineHighlight === 'all')
                && (!this._renderLineHighlightOnlyWhenFocus || this._focused));
        }
        _shouldRenderInContent() {
            return ((this._renderLineHighlight === 'line' || this._renderLineHighlight === 'all')
                && this._selectionIsEmpty
                && (!this._renderLineHighlightOnlyWhenFocus || this._focused));
        }
    }
    exports.AbstractLineHighlightOverlay = AbstractLineHighlightOverlay;
    class CurrentLineHighlightOverlay extends AbstractLineHighlightOverlay {
        _renderOne(ctx, exact) {
            const className = 'current-line' + (this._shouldRenderInMargin() ? ' current-line-both' : '') + (exact ? ' current-line-exact' : '');
            return `<div class="${className}" style="width:${Math.max(ctx.scrollWidth, this._contentWidth)}px; height:${this._lineHeight}px;"></div>`;
        }
        _shouldRenderThis() {
            return this._shouldRenderInContent();
        }
        _shouldRenderOther() {
            return this._shouldRenderInMargin();
        }
    }
    exports.CurrentLineHighlightOverlay = CurrentLineHighlightOverlay;
    class CurrentLineMarginHighlightOverlay extends AbstractLineHighlightOverlay {
        _renderOne(ctx, exact) {
            const className = 'current-line' + (this._shouldRenderInMargin() ? ' current-line-margin' : '') + (this._shouldRenderOther() ? ' current-line-margin-both' : '') + (this._shouldRenderInMargin() && exact ? ' current-line-exact-margin' : '');
            return `<div class="${className}" style="width:${this._contentLeft}px; height:${this._lineHeight}px;"></div>`;
        }
        _shouldRenderThis() {
            return true;
        }
        _shouldRenderOther() {
            return this._shouldRenderInContent();
        }
    }
    exports.CurrentLineMarginHighlightOverlay = CurrentLineMarginHighlightOverlay;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const lineHighlight = theme.getColor(editorColorRegistry_1.editorLineHighlight);
        if (lineHighlight) {
            collector.addRule(`.monaco-editor .view-overlays .current-line { background-color: ${lineHighlight}; }`);
            collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { background-color: ${lineHighlight}; border: none; }`);
        }
        if (!lineHighlight || lineHighlight.isTransparent() || theme.defines(editorColorRegistry_1.editorLineHighlightBorder)) {
            const lineHighlightBorder = theme.getColor(editorColorRegistry_1.editorLineHighlightBorder);
            if (lineHighlightBorder) {
                collector.addRule(`.monaco-editor .view-overlays .current-line-exact { border: 2px solid ${lineHighlightBorder}; }`);
                collector.addRule(`.monaco-editor .margin-view-overlays .current-line-exact-margin { border: 2px solid ${lineHighlightBorder}; }`);
                if ((0, theme_1.isHighContrast)(theme.type)) {
                    collector.addRule(`.monaco-editor .view-overlays .current-line-exact { border-width: 1px; }`);
                    collector.addRule(`.monaco-editor .margin-view-overlays .current-line-exact-margin { border-width: 1px; }`);
                }
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VycmVudExpbmVIaWdobGlnaHQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy9jdXJyZW50TGluZUhpZ2hsaWdodC9jdXJyZW50TGluZUhpZ2hsaWdodC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBc0IsNEJBQTZCLFNBQVEsdUNBQWtCO1FBaUI1RSxZQUFZLE9BQW9CO1lBQy9CLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFFeEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3BELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLG1DQUF5QixDQUFDO1lBQ3hELElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsa0NBQXlCLENBQUM7WUFDeEQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxHQUFHLDJDQUFrQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxpQ0FBaUMsR0FBRyxPQUFPLENBQUMsR0FBRyx3REFBK0MsQ0FBQztZQUNwRyxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQztZQUMvQyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7WUFDM0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDO1lBQzdDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFD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
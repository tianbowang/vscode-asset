/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/async", "vs/editor/browser/view/viewPart", "vs/editor/browser/viewParts/viewCursors/viewCursor", "vs/editor/common/config/editorOptions", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/platform/theme/common/theme", "vs/base/browser/dom", "vs/css!./viewCursors"], function (require, exports, fastDomNode_1, async_1, viewPart_1, viewCursor_1, editorOptions_1, editorColorRegistry_1, themeService_1, theme_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewCursors = void 0;
    class ViewCursors extends viewPart_1.ViewPart {
        static { this.BLINK_INTERVAL = 500; }
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            this._readOnly = options.get(90 /* EditorOption.readOnly */);
            this._cursorBlinking = options.get(26 /* EditorOption.cursorBlinking */);
            this._cursorStyle = options.get(28 /* EditorOption.cursorStyle */);
            this._cursorSmoothCaretAnimation = options.get(27 /* EditorOption.cursorSmoothCaretAnimation */);
            this._selectionIsEmpty = true;
            this._isComposingInput = false;
            this._isVisible = false;
            this._primaryCursor = new viewCursor_1.ViewCursor(this._context);
            this._secondaryCursors = [];
            this._renderData = [];
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._domNode.setAttribute('role', 'presentation');
            this._domNode.setAttribute('aria-hidden', 'true');
            this._updateDomClassName();
            this._domNode.appendChild(this._primaryCursor.getDomNode());
            this._startCursorBlinkAnimation = new async_1.TimeoutTimer();
            this._cursorFlatBlinkInterval = new dom_1.WindowIntervalTimer();
            this._blinkingEnabled = false;
            this._editorHasFocus = false;
            this._updateBlinking();
        }
        dispose() {
            super.dispose();
            this._startCursorBlinkAnimation.dispose();
            this._cursorFlatBlinkInterval.dispose();
        }
        getDomNode() {
            return this._domNode;
        }
        // --- begin event handlers
        onCompositionStart(e) {
            this._isComposingInput = true;
            this._updateBlinking();
            return true;
        }
        onCompositionEnd(e) {
            this._isComposingInput = false;
            this._updateBlinking();
            return true;
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            this._readOnly = options.get(90 /* EditorOption.readOnly */);
            this._cursorBlinking = options.get(26 /* EditorOption.cursorBlinking */);
            this._cursorStyle = options.get(28 /* EditorOption.cursorStyle */);
            this._cursorSmoothCaretAnimation = options.get(27 /* EditorOption.cursorSmoothCaretAnimation */);
            this._updateBlinking();
            this._updateDomClassName();
            this._primaryCursor.onConfigurationChanged(e);
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].onConfigurationChanged(e);
            }
            return true;
        }
        _onCursorPositionChanged(position, secondaryPositions, reason) {
            const pauseAnimation = (this._secondaryCursors.length !== secondaryPositions.length
                || (this._cursorSmoothCaretAnimation === 'explicit' && reason !== 3 /* CursorChangeReason.Explicit */));
            this._primaryCursor.onCursorPositionChanged(position, pauseAnimation);
            this._updateBlinking();
            if (this._secondaryCursors.length < secondaryPositions.length) {
                // Create new cursors
                const addCnt = secondaryPositions.length - this._secondaryCursors.length;
                for (let i = 0; i < addCnt; i++) {
                    const newCursor = new viewCursor_1.ViewCursor(this._context);
                    this._domNode.domNode.insertBefore(newCursor.getDomNode().domNode, this._primaryCursor.getDomNode().domNode.nextSibling);
                    this._secondaryCursors.push(newCursor);
                }
            }
            else if (this._secondaryCursors.length > secondaryPositions.length) {
                // Remove some cursors
                const removeCnt = this._secondaryCursors.length - secondaryPositions.length;
                for (let i = 0; i < removeCnt; i++) {
                    this._domNode.removeChild(this._secondaryCursors[0].getDomNode());
                    this._secondaryCursors.splice(0, 1);
                }
            }
            for (let i = 0; i < secondaryPositions.length; i++) {
                this._secondaryCursors[i].onCursorPositionChanged(secondaryPositions[i], pauseAnimation);
            }
        }
        onCursorStateChanged(e) {
            const positions = [];
            for (let i = 0, len = e.selections.length; i < len; i++) {
                positions[i] = e.selections[i].getPosition();
            }
            this._onCursorPositionChanged(positions[0], positions.slice(1), e.reason);
            const selectionIsEmpty = e.selections[0].isEmpty();
            if (this._selectionIsEmpty !== selectionIsEmpty) {
                this._selectionIsEmpty = selectionIsEmpty;
                this._updateDomClassName();
            }
            return true;
        }
        onDecorationsChanged(e) {
            // true for inline decorations that can end up relayouting text
            return true;
        }
        onFlushed(e) {
            return true;
        }
        onFocusChanged(e) {
            this._editorHasFocus = e.isFocused;
            this._updateBlinking();
            return false;
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
            return true;
        }
        onTokensChanged(e) {
            const shouldRender = (position) => {
                for (let i = 0, len = e.ranges.length; i < len; i++) {
                    if (e.ranges[i].fromLineNumber <= position.lineNumber && position.lineNumber <= e.ranges[i].toLineNumber) {
                        return true;
                    }
                }
                return false;
            };
            if (shouldRender(this._primaryCursor.getPosition())) {
                return true;
            }
            for (const secondaryCursor of this._secondaryCursors) {
                if (shouldRender(secondaryCursor.getPosition())) {
                    return true;
                }
            }
            return false;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        // ---- blinking logic
        _getCursorBlinking() {
            if (this._isComposingInput) {
                // avoid double cursors
                return 0 /* TextEditorCursorBlinkingStyle.Hidden */;
            }
            if (!this._editorHasFocus) {
                return 0 /* TextEditorCursorBlinkingStyle.Hidden */;
            }
            if (this._readOnly) {
                return 5 /* TextEditorCursorBlinkingStyle.Solid */;
            }
            return this._cursorBlinking;
        }
        _updateBlinking() {
            this._startCursorBlinkAnimation.cancel();
            this._cursorFlatBlinkInterval.cancel();
            const blinkingStyle = this._getCursorBlinking();
            // hidden and solid are special as they involve no animations
            const isHidden = (blinkingStyle === 0 /* TextEditorCursorBlinkingStyle.Hidden */);
            const isSolid = (blinkingStyle === 5 /* TextEditorCursorBlinkingStyle.Solid */);
            if (isHidden) {
                this._hide();
            }
            else {
                this._show();
            }
            this._blinkingEnabled = false;
            this._updateDomClassName();
            if (!isHidden && !isSolid) {
                if (blinkingStyle === 1 /* TextEditorCursorBlinkingStyle.Blink */) {
                    // flat blinking is handled by JavaScript to save battery life due to Chromium step timing issue https://bugs.chromium.org/p/chromium/issues/detail?id=361587
                    this._cursorFlatBlinkInterval.cancelAndSet(() => {
                        if (this._isVisible) {
                            this._hide();
                        }
                        else {
                            this._show();
                        }
                    }, ViewCursors.BLINK_INTERVAL, (0, dom_1.getWindow)(this._domNode.domNode));
                }
                else {
                    this._startCursorBlinkAnimation.setIfNotSet(() => {
                        this._blinkingEnabled = true;
                        this._updateDomClassName();
                    }, ViewCursors.BLINK_INTERVAL);
                }
            }
        }
        // --- end blinking logic
        _updateDomClassName() {
            this._domNode.setClassName(this._getClassName());
        }
        _getClassName() {
            let result = 'cursors-layer';
            if (!this._selectionIsEmpty) {
                result += ' has-selection';
            }
            switch (this._cursorStyle) {
                case editorOptions_1.TextEditorCursorStyle.Line:
                    result += ' cursor-line-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.Block:
                    result += ' cursor-block-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.Underline:
                    result += ' cursor-underline-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.LineThin:
                    result += ' cursor-line-thin-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.BlockOutline:
                    result += ' cursor-block-outline-style';
                    break;
                case editorOptions_1.TextEditorCursorStyle.UnderlineThin:
                    result += ' cursor-underline-thin-style';
                    break;
                default:
                    result += ' cursor-line-style';
            }
            if (this._blinkingEnabled) {
                switch (this._getCursorBlinking()) {
                    case 1 /* TextEditorCursorBlinkingStyle.Blink */:
                        result += ' cursor-blink';
                        break;
                    case 2 /* TextEditorCursorBlinkingStyle.Smooth */:
                        result += ' cursor-smooth';
                        break;
                    case 3 /* TextEditorCursorBlinkingStyle.Phase */:
                        result += ' cursor-phase';
                        break;
                    case 4 /* TextEditorCursorBlinkingStyle.Expand */:
                        result += ' cursor-expand';
                        break;
                    case 5 /* TextEditorCursorBlinkingStyle.Solid */:
                        result += ' cursor-solid';
                        break;
                    default:
                        result += ' cursor-solid';
                }
            }
            else {
                result += ' cursor-solid';
            }
            if (this._cursorSmoothCaretAnimation === 'on' || this._cursorSmoothCaretAnimation === 'explicit') {
                result += ' cursor-smooth-caret-animation';
            }
            return result;
        }
        _show() {
            this._primaryCursor.show();
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].show();
            }
            this._isVisible = true;
        }
        _hide() {
            this._primaryCursor.hide();
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].hide();
            }
            this._isVisible = false;
        }
        // ---- IViewPart implementation
        prepareRender(ctx) {
            this._primaryCursor.prepareRender(ctx);
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                this._secondaryCursors[i].prepareRender(ctx);
            }
        }
        render(ctx) {
            const renderData = [];
            let renderDataLen = 0;
            const primaryRenderData = this._primaryCursor.render(ctx);
            if (primaryRenderData) {
                renderData[renderDataLen++] = primaryRenderData;
            }
            for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
                const secondaryRenderData = this._secondaryCursors[i].render(ctx);
                if (secondaryRenderData) {
                    renderData[renderDataLen++] = secondaryRenderData;
                }
            }
            this._renderData = renderData;
        }
        getLastRenderData() {
            return this._renderData;
        }
    }
    exports.ViewCursors = ViewCursors;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const caret = theme.getColor(editorColorRegistry_1.editorCursorForeground);
        if (caret) {
            let caretBackground = theme.getColor(editorColorRegistry_1.editorCursorBackground);
            if (!caretBackground) {
                caretBackground = caret.opposite();
            }
            collector.addRule(`.monaco-editor .cursors-layer .cursor { background-color: ${caret}; border-color: ${caret}; color: ${caretBackground}; }`);
            if ((0, theme_1.isHighContrast)(theme.type)) {
                collector.addRule(`.monaco-editor .cursors-layer.has-selection .cursor { border-left: 1px solid ${caretBackground}; border-right: 1px solid ${caretBackground}; }`);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0N1cnNvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy92aWV3Q3Vyc29ycy92aWV3Q3Vyc29ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLE1BQWEsV0FBWSxTQUFRLG1CQUFRO2lCQUV4QixtQkFBYyxHQUFHLEdBQUcsQ0FBQztRQXVCckMsWUFBWSxPQUFvQjtZQUMvQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFZixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDcEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxnQ0FBdUIsQ0FBQztZQUNwRCxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxHQUFHLHNDQUE2QixDQUFDO1lBQ2hFLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsbUNBQTBCLENBQUM7WUFDMUQsSUFBSSxDQUFDLDJCQUEyQixHQUFHLE9BQU8sQ0FBQyxHQUFHLGtEQUF5QyxDQUFDO1lBQ3hGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUUvQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUV4QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksdUJBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUV0QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUEsK0JBQWlCLEVBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxL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
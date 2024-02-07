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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures", "./stickyScrollWidget", "./stickyScrollProvider", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture", "vs/editor/common/core/range", "vs/editor/contrib/gotoSymbol/browser/goToSymbol", "vs/editor/contrib/inlayHints/browser/inlayHintsLocations", "vs/editor/common/core/position", "vs/base/common/cancellation", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatureDebounce", "vs/base/browser/dom", "vs/editor/contrib/stickyScroll/browser/stickyScrollElement", "vs/base/browser/mouseEvent", "vs/editor/contrib/folding/browser/folding", "vs/editor/contrib/folding/browser/foldingModel"], function (require, exports, lifecycle_1, languageFeatures_1, stickyScrollWidget_1, stickyScrollProvider_1, instantiation_1, contextView_1, actions_1, contextkey_1, editorContextKeys_1, clickLinkGesture_1, range_1, goToSymbol_1, inlayHintsLocations_1, position_1, cancellation_1, languageConfigurationRegistry_1, languageFeatureDebounce_1, dom, stickyScrollElement_1, mouseEvent_1, folding_1, foldingModel_1) {
    "use strict";
    var StickyScrollController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StickyScrollController = void 0;
    let StickyScrollController = class StickyScrollController extends lifecycle_1.Disposable {
        static { StickyScrollController_1 = this; }
        static { this.ID = 'store.contrib.stickyScrollController'; }
        constructor(_editor, _contextMenuService, _languageFeaturesService, _instaService, _languageConfigurationService, _languageFeatureDebounceService, _contextKeyService) {
            super();
            this._editor = _editor;
            this._contextMenuService = _contextMenuService;
            this._languageFeaturesService = _languageFeaturesService;
            this._instaService = _instaService;
            this._contextKeyService = _contextKeyService;
            this._sessionStore = new lifecycle_1.DisposableStore();
            this._foldingModel = null;
            this._maxStickyLines = Number.MAX_SAFE_INTEGER;
            this._candidateDefinitionsLength = -1;
            this._focusedStickyElementIndex = -1;
            this._enabled = false;
            this._focused = false;
            this._positionRevealed = false;
            this._onMouseDown = false;
            this._endLineNumbers = [];
            this._showEndForLine = null;
            this._stickyScrollWidget = new stickyScrollWidget_1.StickyScrollWidget(this._editor);
            this._stickyLineCandidateProvider = new stickyScrollProvider_1.StickyLineCandidateProvider(this._editor, _languageFeaturesService, _languageConfigurationService);
            this._register(this._stickyScrollWidget);
            this._register(this._stickyLineCandidateProvider);
            this._widgetState = new stickyScrollWidget_1.StickyScrollWidgetState([], [], 0);
            this._readConfiguration();
            const stickyScrollDomNode = this._stickyScrollWidget.getDomNode();
            this._register(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(114 /* EditorOption.stickyScroll */)
                    || e.hasChanged(72 /* EditorOption.minimap */)
                    || e.hasChanged(66 /* EditorOption.lineHeight */)
                    || e.hasChanged(109 /* EditorOption.showFoldingControls */)) {
                    this._readConfiguration();
                }
            }));
            this._register(dom.addDisposableListener(stickyScrollDomNode, dom.EventType.CONTEXT_MENU, async (event) => {
                this._onContextMenu(dom.getWindow(stickyScrollDomNode), event);
            }));
            this._stickyScrollFocusedContextKey = editorContextKeys_1.EditorContextKeys.stickyScrollFocused.bindTo(this._contextKeyService);
            this._stickyScrollVisibleContextKey = editorContextKeys_1.EditorContextKeys.stickyScrollVisible.bindTo(this._contextKeyService);
            const focusTracker = this._register(dom.trackFocus(stickyScrollDomNode));
            this._register(focusTracker.onDidBlur(_ => {
                // Suppose that the blurring is caused by scrolling, then keep the focus on the sticky scroll
                // This is determined by the fact that the height of the widget has become zero and there has been no position revealing
                if (this._positionRevealed === false && stickyScrollDomNode.clientHeight === 0) {
                    this._focusedStickyElementIndex = -1;
                    this.focus();
                }
                // In all other casees, dispose the focus on the sticky scroll
                else {
                    this._disposeFocusStickyScrollStore();
                }
            }));
            this._register(focusTracker.onDidFocus(_ => {
                this.focus();
            }));
            this._registerMouseListeners();
            // Suppose that mouse down on the sticky scroll, then do not focus on the sticky scroll because this will be followed by the revealing of a position
            this._register(dom.addDisposableListener(stickyScrollDomNode, dom.EventType.MOUSE_DOWN, (e) => {
                this._onMouseDown = true;
            }));
        }
        get stickyScrollCandidateProvider() {
            return this._stickyLineCandidateProvider;
        }
        get stickyScrollWidgetState() {
            return this._widgetState;
        }
        static get(editor) {
            return editor.getContribution(StickyScrollController_1.ID);
        }
        _disposeFocusStickyScrollStore() {
            this._stickyScrollFocusedContextKey.set(false);
            this._focusDisposableStore?.dispose();
            this._focused = false;
            this._positionRevealed = false;
            this._onMouseDown = false;
        }
        focus() {
            // If the mouse is down, do not focus on the sticky scroll
            if (this._onMouseDown) {
                this._onMouseDown = false;
                this._editor.focus();
                return;
            }
            const focusState = this._stickyScrollFocusedContextKey.get();
            if (focusState === true) {
                return;
            }
            this._focused = true;
            this._focusDisposableStore = new lifecycle_1.DisposableStore();
            this._stickyScrollFocusedContextKey.set(true);
            this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumbers.length - 1;
            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
        }
        focusNext() {
            if (this._focusedStickyElementIndex < this._stickyScrollWidget.lineNumberCount - 1) {
                this._focusNav(true);
            }
        }
        focusPrevious() {
            if (this._focusedStickyElementIndex > 0) {
                this._focusNav(false);
            }
        }
        selectEditor() {
            this._editor.focus();
        }
        // True is next, false is previous
        _focusNav(direction) {
            this._focusedStickyElementIndex = direction ? this._focusedStickyElementIndex + 1 : this._focusedStickyElementIndex - 1;
            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
        }
        goToFocused() {
            const lineNumbers = this._stickyScrollWidget.lineNumbers;
            this._disposeFocusStickyScrollStore();
            this._revealPosition({ lineNumber: lineNumbers[this._focusedStickyElementIndex], column: 1 });
        }
        _revealPosition(position) {
            this._reveaInEditor(position, () => this._editor.revealPosition(position));
        }
        _revealLineInCenterIfOutsideViewport(position) {
            this._reveaInEditor(position, () => this._editor.revealLineInCenterIfOutsideViewport(position.lineNumber, 0 /* ScrollType.Smooth */));
        }
        _reveaInEditor(position, revealFunction) {
            if (this._focused) {
                this._disposeFocusStickyScrollStore();
            }
            this._positionRevealed = true;
            revealFunction();
            this._editor.setSelection(range_1.Range.fromPositions(position));
            this._editor.focus();
        }
        _registerMouseListeners() {
            const sessionStore = this._register(new lifecycle_1.DisposableStore());
            const gesture = this._register(new clickLinkGesture_1.ClickLinkGesture(this._editor, {
                extractLineNumberFromMouseEvent: (e) => {
                    const position = this._stickyScrollWidget.getEditorPositionFromNode(e.target.element);
                    return position ? position.lineNumber : 0;
                }
            }));
            const getMouseEventTarget = (mouseEvent) => {
                if (!this._editor.hasModel()) {
                    return null;
                }
                if (mouseEvent.target.type !== 12 /* MouseTargetType.OVERLAY_WIDGET */ || mouseEvent.target.detail !== this._stickyScrollWidget.getId()) {
                    // not hovering over our widget
                    return null;
                }
                const mouseTargetElement = mouseEvent.target.element;
                if (!mouseTargetElement || mouseTargetElement.innerText !== mouseTargetElement.innerHTML) {
                    // not on a span element rendering text
                    return null;
                }
                const position = this._stickyScrollWidget.getEditorPositionFromNode(mouseTargetElement);
                if (!position) {
                    // not hovering a sticky scroll line
                    return null;
                }
                return {
                    range: new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + mouseTargetElement.innerText.length),
                    textElement: mouseTargetElement
                };
            };
            const stickyScrollWidgetDomNode = this._stickyScrollWidget.getDomNode();
            this._register(dom.addStandardDisposableListener(stickyScrollWidgetDomNode, dom.EventType.CLICK, (mouseEvent) => {
                if (mouseEvent.ctrlKey || mouseEvent.altKey || mouseEvent.metaKey) {
                    // modifier pressed
                    return;
                }
                if (!mouseEvent.leftButton) {
                    // not left click
                    return;
                }
                if (mouseEvent.shiftKey) {
                    // shift click
                    const lineIndex = this._stickyScrollWidget.getLineIndexFromChildDomNode(mouseEvent.target);
                    if (lineIndex === null) {
                        return;
                    }
                    const position = new position_1.Position(this._endLineNumbers[lineIndex], 1);
                    this._revealLineInCenterIfOutsideViewport(position);
                    return;
                }
                const isInFoldingIconDomNode = this._stickyScrollWidget.isInFoldingIconDomNode(mouseEvent.target);
                if (isInFoldingIconDomNode) {
                    // clicked on folding icon
                    const lineNumber = this._stickyScrollWidget.getLineNumberFromChildDomNode(mouseEvent.target);
                    this._toggleFoldingRegionForLine(lineNumber);
                    return;
                }
                const isInStickyLine = this._stickyScrollWidget.isInStickyLine(mouseEvent.target);
                if (!isInStickyLine) {
                    return;
                }
                // normal click
                let position = this._stickyScrollWidget.getEditorPositionFromNode(mouseEvent.target);
                if (!position) {
                    const lineNumber = this._stickyScrollWidget.getLineNumberFromChildDomNode(mouseEvent.target);
                    if (lineNumber === null) {
                        // not hovering a sticky scroll line
                        return;
                    }
                    position = new position_1.Position(lineNumber, 1);
                }
                this._revealPosition(position);
            }));
            this._register(dom.addStandardDisposableListener(stickyScrollWidgetDomNode, dom.EventType.MOUSE_MOVE, (mouseEvent) => {
                if (mouseEvent.shiftKey) {
                    const currentEndForLineIndex = this._stickyScrollWidget.getLineIndexFromChildDomNode(mouseEvent.target);
                    if (currentEndForLineIndex === null || this._showEndForLine !== null && this._showEndForLine === currentEndForLineIndex) {
                        return;
                    }
                    this._showEndForLine = currentEndForLineIndex;
                    this._renderStickyScroll();
                    return;
                }
                if (this._showEndForLine !== null) {
                    this._showEndForLine = null;
                    this._renderStickyScroll();
                }
            }));
            this._register(dom.addDisposableListener(stickyScrollWidgetDomNode, dom.EventType.MOUSE_LEAVE, (e) => {
                if (this._showEndForLine !== null) {
                    this._showEndForLine = null;
                    this._renderStickyScroll();
                }
            }));
            this._register(gesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, _keyboardEvent]) => {
                const mouseTarget = getMouseEventTarget(mouseEvent);
                if (!mouseTarget || !mouseEvent.hasTriggerModifier || !this._editor.hasModel()) {
                    sessionStore.clear();
                    return;
                }
                const { range, textElement } = mouseTarget;
                if (!range.equalsRange(this._stickyRangeProjectedOnEditor)) {
                    this._stickyRangeProjectedOnEditor = range;
                    sessionStore.clear();
                }
                else if (textElement.style.textDecoration === 'underline') {
                    return;
                }
                const cancellationToken = new cancellation_1.CancellationTokenSource();
                sessionStore.add((0, lifecycle_1.toDisposable)(() => cancellationToken.dispose(true)));
                let currentHTMLChild;
                (0, goToSymbol_1.getDefinitionsAtPosition)(this._languageFeaturesService.definitionProvider, this._editor.getModel(), new position_1.Position(range.startLineNumber, range.startColumn + 1), cancellationToken.token).then((candidateDefinitions => {
                    if (cancellationToken.token.isCancellationRequested) {
                        return;
                    }
                    if (candidateDefinitions.length !== 0) {
                        this._candidateDefinitionsLength = candidateDefinitions.length;
                        const childHTML = textElement;
                        if (currentHTMLChild !== childHTML) {
                            sessionStore.clear();
                            currentHTMLChild = childHTML;
                            currentHTMLChild.style.textDecoration = 'underline';
                            sessionStore.add((0, lifecycle_1.toDisposable)(() => {
                                currentHTMLChild.style.textDecoration = 'none';
                            }));
                        }
                        else if (!currentHTMLChild) {
                            currentHTMLChild = childHTML;
                            currentHTMLChild.style.textDecoration = 'underline';
                            sessionStore.add((0, lifecycle_1.toDisposable)(() => {
                                currentHTMLChild.style.textDecoration = 'none';
                            }));
                        }
                    }
                    else {
                        sessionStore.clear();
                    }
                }));
            }));
            this._register(gesture.onCancel(() => {
                sessionStore.clear();
            }));
            this._register(gesture.onExecute(async (e) => {
                if (e.target.type !== 12 /* MouseTargetType.OVERLAY_WIDGET */ || e.target.detail !== this._stickyScrollWidget.getId()) {
                    // not hovering over our widget
                    return;
                }
                const position = this._stickyScrollWidget.getEditorPositionFromNode(e.target.element);
                if (!position) {
                    // not hovering a sticky scroll line
                    return;
                }
                if (!this._editor.hasModel() || !this._stickyRangeProjectedOnEditor) {
                    return;
                }
                if (this._candidateDefinitionsLength > 1) {
                    if (this._focused) {
                        this._disposeFocusStickyScrollStore();
                    }
                    this._revealPosition({ lineNumber: position.lineNumber, column: 1 });
                }
                this._instaService.invokeFunction(inlayHintsLocations_1.goToDefinitionWithLocation, e, this._editor, { uri: this._editor.getModel().uri, range: this._stickyRangeProjectedOnEditor });
            }));
        }
        _onContextMenu(targetWindow, e) {
            const event = new mouseEvent_1.StandardMouseEvent(targetWindow, e);
            this._contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.StickyScrollContext,
                getAnchor: () => event,
            });
        }
        _toggleFoldingRegionForLine(line) {
            if (!this._foldingModel || line === null) {
                return;
            }
            const stickyLine = this._stickyScrollWidget.getRenderedStickyLine(line);
            const foldingIcon = stickyLine?.foldingIcon;
            if (!foldingIcon) {
                return;
            }
            (0, foldingModel_1.toggleCollapseState)(this._foldingModel, Number.MAX_VALUE, [line]);
            foldingIcon.isCollapsed = !foldingIcon.isCollapsed;
            const scrollTop = (foldingIcon.isCollapsed ?
                this._editor.getTopForLineNumber(foldingIcon.foldingEndLine)
                : this._editor.getTopForLineNumber(foldingIcon.foldingStartLine))
                - this._editor.getOption(66 /* EditorOption.lineHeight */) * stickyLine.index + 1;
            this._editor.setScrollTop(scrollTop);
            this._renderStickyScroll(line);
        }
        _readConfiguration() {
            const options = this._editor.getOption(114 /* EditorOption.stickyScroll */);
            if (options.enabled === false) {
                this._editor.removeOverlayWidget(this._stickyScrollWidget);
                this._sessionStore.clear();
                this._enabled = false;
                return;
            }
            else if (options.enabled && !this._enabled) {
                // When sticky scroll was just enabled, add the listeners on the sticky scroll
                this._editor.addOverlayWidget(this._stickyScrollWidget);
                this._sessionStore.add(this._editor.onDidScrollChange((e) => {
                    if (e.scrollTopChanged) {
                        this._showEndForLine = null;
                        this._renderStickyScroll();
                    }
                }));
                this._sessionStore.add(this._editor.onDidLayoutChange(() => this._onDidResize()));
                this._sessionStore.add(this._editor.onDidChangeModelTokens((e) => this._onTokensChange(e)));
                this._sessionStore.add(this._stickyLineCandidateProvider.onDidChangeStickyScroll(() => {
                    this._showEndForLine = null;
                    this._renderStickyScroll();
                }));
                this._enabled = true;
            }
            const lineNumberOption = this._editor.getOption(67 /* EditorOption.lineNumbers */);
            if (lineNumberOption.renderType === 2 /* RenderLineNumbersType.Relative */) {
                this._sessionStore.add(this._editor.onDidChangeCursorPosition(() => {
                    this._showEndForLine = null;
                    this._renderStickyScroll(0);
                }));
            }
        }
        _needsUpdate(event) {
            const stickyLineNumbers = this._stickyScrollWidget.getCurrentLines();
            for (const stickyLineNumber of stickyLineNumbers) {
                for (const range of event.ranges) {
                    if (stickyLineNumber >= range.fromLineNumber && stickyLineNumber <= range.toLineNumber) {
                        return true;
                    }
                }
            }
            return false;
        }
        _onTokensChange(event) {
            if (this._needsUpdate(event)) {
                // Rebuilding the whole widget from line 0
                this._renderStickyScroll(0);
            }
        }
        _onDidResize() {
            const layoutInfo = this._editor.getLayoutInfo();
            // Make sure sticky scroll doesn't take up more than 25% of the editor
            const theoreticalLines = layoutInfo.height / this._editor.getOption(66 /* EditorOption.lineHeight */);
            this._maxStickyLines = Math.round(theoreticalLines * .25);
        }
        async _renderStickyScroll(rebuildFromLine) {
            const model = this._editor.getModel();
            if (!model || model.isTooLargeForTokenization()) {
                this._foldingModel = null;
                this._stickyScrollWidget.setState(undefined, null);
                return;
            }
            const stickyLineVersion = this._stickyLineCandidateProvider.getVersionId();
            if (stickyLineVersion === undefined || stickyLineVersion === model.getVersionId()) {
                this._foldingModel = await folding_1.FoldingController.get(this._editor)?.getFoldingModel() ?? null;
                this._widgetState = this.findScrollWidgetState();
                this._stickyScrollVisibleContextKey.set(!(this._widgetState.startLineNumbers.length === 0));
                if (!this._focused) {
                    this._stickyScrollWidget.setState(this._widgetState, this._foldingModel, rebuildFromLine);
                }
                else {
                    // Suppose that previously the sticky scroll widget had height 0, then if there are visible lines, set the last line as focused
                    if (this._focusedStickyElementIndex === -1) {
                        this._stickyScrollWidget.setState(this._widgetState, this._foldingModel, rebuildFromLine);
                        this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumberCount - 1;
                        if (this._focusedStickyElementIndex !== -1) {
                            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
                        }
                    }
                    else {
                        const focusedStickyElementLineNumber = this._stickyScrollWidget.lineNumbers[this._focusedStickyElementIndex];
                        this._stickyScrollWidget.setState(this._widgetState, this._foldingModel, rebuildFromLine);
                        // Suppose that after setting the state, there are no sticky lines, set the focused index to -1
                        if (this._stickyScrollWidget.lineNumberCount === 0) {
                            this._focusedStickyElementIndex = -1;
                        }
                        else {
                            const previousFocusedLineNumberExists = this._stickyScrollWidget.lineNumbers.includes(focusedStickyElementLineNumber);
                            // If the line number is still there, do not change anything
                            // If the line number is not there, set the new focused line to be the last line
                            if (!previousFocusedLineNumberExists) {
                                this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumberCount - 1;
                            }
                            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
                        }
                    }
                }
            }
        }
        findScrollWidgetState() {
            const lineHeight = this._editor.getOption(66 /* EditorOption.lineHeight */);
            const maxNumberStickyLines = Math.min(this._maxStickyLines, this._editor.getOption(114 /* EditorOption.stickyScroll */).maxLineCount);
            const scrollTop = this._editor.getScrollTop();
            let lastLineRelativePosition = 0;
            const startLineNumbers = [];
            const endLineNumbers = [];
            const arrayVisibleRanges = this._editor.getVisibleRanges();
            if (arrayVisibleRanges.length !== 0) {
                const fullVisibleRange = new stickyScrollElement_1.StickyRange(arrayVisibleRanges[0].startLineNumber, arrayVisibleRanges[arrayVisibleRanges.length - 1].endLineNumber);
                const candidateRanges = this._stickyLineCandidateProvider.getCandidateStickyLinesIntersecting(fullVisibleRange);
                for (const range of candidateRanges) {
                    const start = range.startLineNumber;
                    const end = range.endLineNumber;
                    const depth = range.nestingDepth;
                    if (end - start > 0) {
                        const topOfElementAtDepth = (depth - 1) * lineHeight;
                        const bottomOfElementAtDepth = depth * lineHeight;
                        const bottomOfBeginningLine = this._editor.getBottomForLineNumber(start) - scrollTop;
                        const topOfEndLine = this._editor.getTopForLineNumber(end) - scrollTop;
                        const bottomOfEndLine = this._editor.getBottomForLineNumber(end) - scrollTop;
                        if (topOfElementAtDepth > topOfEndLine && topOfElementAtDepth <= bottomOfEndLine) {
                            startLineNumbers.push(start);
                            endLineNumbers.push(end + 1);
                            lastLineRelativePosition = bottomOfEndLine - bottomOfElementAtDepth;
                            break;
                        }
                        else if (bottomOfElementAtDepth > bottomOfBeginningLine && bottomOfElementAtDepth <= bottomOfEndLine) {
                            startLineNumbers.push(start);
                            endLineNumbers.push(end + 1);
                        }
                        if (startLineNumbers.length === maxNumberStickyLines) {
                            break;
                        }
                    }
                }
            }
            this._endLineNumbers = endLineNumbers;
            return new stickyScrollWidget_1.StickyScrollWidgetState(startLineNumbers, endLineNumbers, lastLineRelativePosition, this._showEndForLine);
        }
        dispose() {
            super.dispose();
            this._sessionStore.dispose();
        }
    };
    exports.StickyScrollController = StickyScrollController;
    exports.StickyScrollController = StickyScrollController = StickyScrollController_1 = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, languageFeatures_1.ILanguageFeaturesService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(5, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(6, contextkey_1.IContextKeyService)
    ], StickyScrollController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3RpY2t5U2Nyb2xsL2Jyb3dzZXIvc3RpY2t5U2Nyb2xsQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUN6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVOztpQkFFckMsT0FBRSxHQUFHLHNDQUFzQyxBQUF6QyxDQUEwQztRQXlCNUQsWUFDa0IsT0FBb0IsRUFDaEIsbUJBQXlELEVBQ3BELHdCQUFtRSxFQUN0RSxhQUFxRCxFQUM3Qyw2QkFBNEQsRUFDMUQsK0JBQWdFLEVBQzdFLGtCQUF1RDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQVJTLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQ25DLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDckQsa0JBQWEsR0FBYixhQUFhLENBQXVCO1lBR3ZDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUE1QjNELGtCQUFhLEdBQW9CLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBR2hFLGtCQUFhLEdBQXdCLElBQUksQ0FBQztZQUMxQyxvQkFBZSxHQUFXLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUdsRCxnQ0FBMkIsR0FBVyxDQUFDLENBQUMsQ0FBQztZQU16QywrQkFBMEIsR0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QyxhQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ2pCLGFBQVEsR0FBRyxLQUFLLENBQUM7WUFDakIsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQzFCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLG9CQUFlLEdBQWEsRUFBRSxDQUFDO1lBQy9CLG9C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
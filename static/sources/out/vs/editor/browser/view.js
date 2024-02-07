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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/performance", "vs/base/common/errors", "vs/editor/browser/controller/mouseTarget", "vs/editor/browser/controller/pointerHandler", "vs/editor/browser/controller/textAreaHandler", "vs/editor/browser/view/renderingContext", "vs/editor/browser/view/viewController", "vs/editor/browser/view/viewOverlays", "vs/editor/browser/view/viewPart", "vs/editor/browser/view/viewUserInputEvents", "vs/editor/browser/viewParts/blockDecorations/blockDecorations", "vs/editor/browser/viewParts/contentWidgets/contentWidgets", "vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight", "vs/editor/browser/viewParts/decorations/decorations", "vs/editor/browser/viewParts/editorScrollbar/editorScrollbar", "vs/editor/browser/viewParts/glyphMargin/glyphMargin", "vs/editor/browser/viewParts/indentGuides/indentGuides", "vs/editor/browser/viewParts/lineNumbers/lineNumbers", "vs/editor/browser/viewParts/lines/viewLines", "vs/editor/browser/viewParts/linesDecorations/linesDecorations", "vs/editor/browser/viewParts/margin/margin", "vs/editor/browser/viewParts/marginDecorations/marginDecorations", "vs/editor/browser/viewParts/minimap/minimap", "vs/editor/browser/viewParts/overlayWidgets/overlayWidgets", "vs/editor/browser/viewParts/overviewRuler/decorationsOverviewRuler", "vs/editor/browser/viewParts/overviewRuler/overviewRuler", "vs/editor/browser/viewParts/rulers/rulers", "vs/editor/browser/viewParts/scrollDecoration/scrollDecoration", "vs/editor/browser/viewParts/selections/selections", "vs/editor/browser/viewParts/viewCursors/viewCursors", "vs/editor/browser/viewParts/viewZones/viewZones", "vs/editor/browser/viewParts/whitespace/whitespace", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model", "vs/editor/common/viewEventHandler", "vs/editor/common/viewLayout/viewLinesViewportData", "vs/editor/common/viewModel/viewContext", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService"], function (require, exports, dom, fastDomNode_1, performance_1, errors_1, mouseTarget_1, pointerHandler_1, textAreaHandler_1, renderingContext_1, viewController_1, viewOverlays_1, viewPart_1, viewUserInputEvents_1, blockDecorations_1, contentWidgets_1, currentLineHighlight_1, decorations_1, editorScrollbar_1, glyphMargin_1, indentGuides_1, lineNumbers_1, viewLines_1, linesDecorations_1, margin_1, marginDecorations_1, minimap_1, overlayWidgets_1, decorationsOverviewRuler_1, overviewRuler_1, rulers_1, scrollDecoration_1, selections_1, viewCursors_1, viewZones_1, whitespace_1, position_1, range_1, selection_1, model_1, viewEventHandler_1, viewLinesViewportData_1, viewContext_1, instantiation_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.View = void 0;
    let View = class View extends viewEventHandler_1.ViewEventHandler {
        constructor(commandDelegate, configuration, colorTheme, model, userInputEvents, overflowWidgetsDomNode, _instantiationService) {
            super();
            this._instantiationService = _instantiationService;
            // Actual mutable state
            this._shouldRecomputeGlyphMarginLanes = false;
            this._selections = [new selection_1.Selection(1, 1, 1, 1)];
            this._renderAnimationFrame = null;
            const viewController = new viewController_1.ViewController(configuration, model, userInputEvents, commandDelegate);
            // The view context is passed on to most classes (basically to reduce param. counts in ctors)
            this._context = new viewContext_1.ViewContext(configuration, colorTheme, model);
            // Ensure the view is the first event handler in order to update the layout
            this._context.addEventHandler(this);
            this._viewParts = [];
            // Keyboard handler
            this._textAreaHandler = this._instantiationService.createInstance(textAreaHandler_1.TextAreaHandler, this._context, viewController, this._createTextAreaHandlerHelper());
            this._viewParts.push(this._textAreaHandler);
            // These two dom nodes must be constructed up front, since references are needed in the layout provider (scrolling & co.)
            this._linesContent = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._linesContent.setClassName('lines-content' + ' monaco-editor-background');
            this._linesContent.setPosition('absolute');
            this.domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this.domNode.setClassName(this._getEditorClassName());
            // Set role 'code' for better screen reader support https://github.com/microsoft/vscode/issues/93438
            this.domNode.setAttribute('role', 'code');
            this._overflowGuardContainer = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            viewPart_1.PartFingerprints.write(this._overflowGuardContainer, 3 /* PartFingerprint.OverflowGuard */);
            this._overflowGuardContainer.setClassName('overflow-guard');
            this._scrollbar = new editorScrollbar_1.EditorScrollbar(this._context, this._linesContent, this.domNode, this._overflowGuardContainer);
            this._viewParts.push(this._scrollbar);
            // View Lines
            this._viewLines = new viewLines_1.ViewLines(this._context, this._linesContent);
            // View Zones
            this._viewZones = new viewZones_1.ViewZones(this._context);
            this._viewParts.push(this._viewZones);
            // Decorations overview ruler
            const decorationsOverviewRuler = new decorationsOverviewRuler_1.DecorationsOverviewRuler(this._context);
            this._viewParts.push(decorationsOverviewRuler);
            const scrollDecoration = new scrollDecoration_1.ScrollDecorationViewPart(this._context);
            this._viewParts.push(scrollDecoration);
            const contentViewOverlays = new viewOverlays_1.ContentViewOverlays(this._context);
            this._viewParts.push(contentViewOverlays);
            contentViewOverlays.addDynamicOverlay(new currentLineHighlight_1.CurrentLineHighlightOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new selections_1.SelectionsOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new indentGuides_1.IndentGuidesOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new decorations_1.DecorationsOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new whitespace_1.WhitespaceOverlay(this._context));
            const marginViewOverlays = new viewOverlays_1.MarginViewOverlays(this._context);
            this._viewParts.push(marginViewOverlays);
            marginViewOverlays.addDynamicOverlay(new currentLineHighlight_1.CurrentLineMarginHighlightOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new marginDecorations_1.MarginViewLineDecorationsOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new linesDecorations_1.LinesDecorationsOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new lineNumbers_1.LineNumbersOverlay(this._context));
            // Glyph margin widgets
            this._glyphMarginWidgets = new glyphMargin_1.GlyphMarginWidgets(this._context);
            this._viewParts.push(this._glyphMarginWidgets);
            const margin = new margin_1.Margin(this._context);
            margin.getDomNode().appendChild(this._viewZones.marginDomNode);
            margin.getDomNode().appendChild(marginViewOverlays.getDomNode());
            margin.getDomNode().appendChild(this._glyphMarginWidgets.domNode);
            this._viewParts.push(margin);
            // Content widgets
            this._contentWidgets = new contentWidgets_1.ViewContentWidgets(this._context, this.domNode);
            this._viewParts.push(this._contentWidgets);
            this._viewCursors = new viewCursors_1.ViewCursors(this._context);
            this._viewParts.push(this._viewCursors);
            // Overlay widgets
            this._overlayWidgets = new overlayWidgets_1.ViewOverlayWidgets(this._context, this.domNode);
            this._viewParts.push(this._overlayWidgets);
            const rulers = new rulers_1.Rulers(this._context);
            this._viewParts.push(rulers);
            const blockOutline = new blockDecorations_1.BlockDecorations(this._context);
            this._viewParts.push(blockOutline);
            const minimap = new minimap_1.Minimap(this._context);
            this._viewParts.push(minimap);
            // -------------- Wire dom nodes up
            if (decorationsOverviewRuler) {
                const overviewRulerData = this._scrollbar.getOverviewRulerLayoutInfo();
                overviewRulerData.parent.insertBefore(decorationsOverviewRuler.getDomNode(), overviewRulerData.insertBefore);
            }
            this._linesContent.appendChild(contentViewOverlays.getDomNode());
            this._linesContent.appendChild(rulers.domNode);
            this._linesContent.appendChild(this._viewZones.domNode);
            this._linesContent.appendChild(this._viewLines.getDomNode());
            this._linesContent.appendChild(this._contentWidgets.domNode);
            this._linesContent.appendChild(this._viewCursors.getDomNode());
            this._overflowGuardContainer.appendChild(margin.getDomNode());
            this._overflowGuardContainer.appendChild(this._scrollbar.getDomNode());
            this._overflowGuardContainer.appendChild(scrollDecoration.getDomNode());
            this._overflowGuardContainer.appendChild(this._textAreaHandler.textArea);
            this._overflowGuardContainer.appendChild(this._textAreaHandler.textAreaCover);
            this._overflowGuardContainer.appendChild(this._overlayWidgets.getDomNode());
            this._overflowGuardContainer.appendChild(minimap.getDomNode());
            this._overflowGuardContainer.appendChild(blockOutline.domNode);
            this.domNode.appendChild(this._overflowGuardContainer);
            if (overflowWidgetsDomNode) {
                overflowWidgetsDomNode.appendChild(this._contentWidgets.overflowingContentWidgetsDomNode.domNode);
                overflowWidgetsDomNode.appendChild(this._overlayWidgets.overflowingOverlayWidgetsDomNode.domNode);
            }
            else {
                this.domNode.appendChild(this._contentWidgets.overflowingContentWidgetsDomNode);
                this.domNode.appendChild(this._overlayWidgets.overflowingOverlayWidgetsDomNode);
            }
            this._applyLayout();
            // Pointer handler
            this._pointerHandler = this._register(new pointerHandler_1.PointerHandler(this._context, viewController, this._createPointerHandlerHelper()));
        }
        _computeGlyphMarginLanes() {
            const model = this._context.viewModel.model;
            const laneModel = this._context.viewModel.glyphLanes;
            let glyphs = [];
            let maxLineNumber = 0;
            // Add all margin decorations
            glyphs = glyphs.concat(model.getAllMarginDecorations().map((decoration) => {
                const lane = decoration.options.glyphMargin?.position ?? model_1.GlyphMarginLane.Center;
                maxLineNumber = Math.max(maxLineNumber, decoration.range.endLineNumber);
                return { range: decoration.range, lane, persist: decoration.options.glyphMargin?.persistLane };
            }));
            // Add all glyph margin widgets
            glyphs = glyphs.concat(this._glyphMarginWidgets.getWidgets().map((widget) => {
                const range = model.validateRange(widget.preference.range);
                maxLineNumber = Math.max(maxLineNumber, range.endLineNumber);
                return { range, lane: widget.preference.lane };
            }));
            // Sorted by their start position
            glyphs.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.range, b.range));
            laneModel.reset(maxLineNumber);
            for (const glyph of glyphs) {
                laneModel.push(glyph.lane, glyph.range, glyph.persist);
            }
            return laneModel;
        }
        _createPointerHandlerHelper() {
            return {
                viewDomNode: this.domNode.domNode,
                linesContentDomNode: this._linesContent.domNode,
                viewLinesDomNode: this._viewLines.getDomNode().domNode,
                focusTextArea: () => {
                    this.focus();
                },
                dispatchTextAreaEvent: (event) => {
                    this._textAreaHandler.textArea.domNode.dispatchEvent(event);
                },
                getLastRenderData: () => {
                    const lastViewCursorsRenderData = this._viewCursors.getLastRenderData() || [];
                    const lastTextareaPosition = this._textAreaHandler.getLastRenderData();
                    return new mouseTarget_1.PointerHandlerLastRenderData(lastViewCursorsRenderData, lastTextareaPosition);
                },
                renderNow: () => {
                    this.render(true, false);
                },
                shouldSuppressMouseDownOnViewZone: (viewZoneId) => {
                    return this._viewZones.shouldSuppressMouseDownOnViewZone(viewZoneId);
                },
                shouldSuppressMouseDownOnWidget: (widgetId) => {
                    return this._contentWidgets.shouldSuppressMouseDownOnWidget(widgetId);
                },
                getPositionFromDOMInfo: (spanNode, offset) => {
                    this._flushAccumulatedAndRenderNow();
                    return this._viewLines.getPositionFromDOMInfo(spanNode, offset);
                },
                visibleRangeForPosition: (lineNumber, column) => {
                    this._flushAccumulatedAndRenderNow();
                    return this._viewLines.visibleRangeForPosition(new position_1.Position(lineNumber, column));
                },
                getLineWidth: (lineNumber) => {
                    this._flushAccumulatedAndRenderNow();
                    return this._viewLines.getLineWidth(lineNumber);
                }
            };
        }
        _createTextAreaHandlerHelper() {
            return {
                visibleRangeForPosition: (position) => {
                    this._flushAccumulatedAndRenderNow();
                    return this._viewLines.visibleRangeForPosition(position);
                }
            };
        }
        _applyLayout() {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.domNode.setWidth(layoutInfo.width);
            this.domNode.setHeight(layoutInfo.height);
            this._overflowGuardContainer.setWidth(layoutInfo.width);
            this._overflowGuardContainer.setHeight(layoutInfo.height);
            this._linesContent.setWidth(1000000);
            this._linesContent.setHeight(1000000);
        }
        _getEditorClassName() {
            const focused = this._textAreaHandler.isFocused() ? ' focused' : '';
            return this._context.configuration.options.get(140 /* EditorOption.editorClassName */) + ' ' + (0, themeService_1.getThemeTypeSelector)(this._context.theme.type) + focused;
        }
        // --- begin event handlers
        handleEvents(events) {
            super.handleEvents(events);
            this._scheduleRender();
        }
        onConfigurationChanged(e) {
            this.domNode.setClassName(this._getEditorClassName());
            this._applyLayout();
            return false;
        }
        onCursorStateChanged(e) {
            this._selections = e.selections;
            return false;
        }
        onDecorationsChanged(e) {
            if (e.affectsGlyphMargin) {
                this._shouldRecomputeGlyphMarginLanes = true;
            }
            return false;
        }
        onFocusChanged(e) {
            this.domNode.setClassName(this._getEditorClassName());
            return false;
        }
        onThemeChanged(e) {
            this._context.theme.update(e.theme);
            this.domNode.setClassName(this._getEditorClassName());
            return false;
        }
        // --- end event handlers
        dispose() {
            if (this._renderAnimationFrame !== null) {
                this._renderAnimationFrame.dispose();
                this._renderAnimationFrame = null;
            }
            this._contentWidgets.overflowingContentWidgetsDomNode.domNode.remove();
            this._context.removeEventHandler(this);
            this._viewLines.dispose();
            // Destroy view parts
            for (const viewPart of this._viewParts) {
                viewPart.dispose();
            }
            super.dispose();
        }
        _scheduleRender() {
            if (this._store.isDisposed) {
                throw new errors_1.BugIndicatingError();
            }
            if (this._renderAnimationFrame === null) {
                const rendering = this._createCoordinatedRendering();
                this._renderAnimationFrame = EditorRenderingCoordinator.INSTANCE.scheduleCoordinatedRendering({
                    window: dom.getWindow(this.domNode.domNode),
                    prepareRenderText: () => {
                        if (this._store.isDisposed) {
                            throw new errors_1.BugIndicatingError();
                        }
                        try {
                            return rendering.prepareRenderText();
                        }
                        finally {
                            this._renderAnimationFrame = null;
                        }
                    },
                    renderText: () => {
                        if (this._store.isDisposed) {
                            throw new errors_1.BugIndicatingError();
                        }
                        return rendering.renderText();
                    },
                    prepareRender: (viewParts, ctx) => {
                        if (this._store.isDisposed) {
                            throw new errors_1.BugIndicatingError();
                        }
                        return rendering.prepareRender(viewParts, ctx);
                    },
                    render: (viewParts, ctx) => {
                        if (this._store.isDisposed) {
                            throw new errors_1.BugIndicatingError();
                        }
                        return rendering.render(viewParts, ctx);
                    }
                });
            }
        }
        _flushAccumulatedAndRenderNow() {
            const rendering = this._createCoordinatedRendering();
            safeInvokeNoArg(() => rendering.prepareRenderText());
            const data = safeInvokeNoArg(() => rendering.renderText());
            if (data) {
                const [viewParts, ctx] = data;
                safeInvokeNoArg(() => rendering.prepareRender(viewParts, ctx));
                safeInvokeNoArg(() => rendering.render(viewParts, ctx));
            }
        }
        _getViewPartsToRender() {
            const result = [];
            let resultLen = 0;
            for (const viewPart of this._viewParts) {
                if (viewPart.shouldRender()) {
                    result[resultLen++] = viewPart;
                }
            }
            return result;
        }
        _createCoordinatedRendering() {
            return {
                prepareRenderText: () => {
                    if (this._shouldRecomputeGlyphMarginLanes) {
                        this._shouldRecomputeGlyphMarginLanes = false;
                        const model = this._computeGlyphMarginLanes();
                        this._context.configuration.setGlyphMarginDecorationLaneCount(model.requiredLanes);
                    }
                    performance_1.inputLatency.onRenderStart();
                },
                renderText: () => {
                    if (!this.domNode.domNode.isConnected) {
                        return null;
                    }
                    let viewPartsToRender = this._getViewPartsToRender();
                    if (!this._viewLines.shouldRender() && viewPartsToRender.length === 0) {
                        // Nothing to render
                        return null;
                    }
                    const partialViewportData = this._context.viewLayout.getLinesViewportData();
                    this._context.viewModel.setViewport(partialViewportData.startLineNumber, partialViewportData.endLineNumber, partialViewportData.centeredLineNumber);
                    const viewportData = new viewLinesViewportData_1.ViewportData(this._selections, partialViewportData, this._context.viewLayout.getWhitespaceViewportData(), this._context.viewModel);
                    if (this._contentWidgets.shouldRender()) {
                        // Give the content widgets a chance to set their max width before a possible synchronous layout
                        this._contentWidgets.onBeforeRender(viewportData);
                    }
                    if (this._viewLines.shouldRender()) {
                        this._viewLines.renderText(viewportData);
                        this._viewLines.onDidRender();
                        // Rendering of viewLines might cause scroll events to occur, so collect view parts to render again
                        viewPartsToRender = this._getViewPartsToRender();
                    }
                    return [viewPartsToRender, new renderingContext_1.RenderingContext(this._context.viewLayout, viewportData, this._viewLines)];
                },
                prepareRender: (viewPartsToRender, ctx) => {
                    for (const viewPart of viewPartsToRender) {
                        viewPart.prepareRender(ctx);
                    }
                },
                render: (viewPartsToRender, ctx) => {
                    for (const viewPart of viewPartsToRender) {
                        viewPart.render(ctx);
                        viewPart.onDidRender();
                    }
                }
            };
        }
        // --- BEGIN CodeEditor helpers
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this._scrollbar.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this._scrollbar.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        restoreState(scrollPosition) {
            this._context.viewModel.viewLayout.setScrollPosition({
                scrollTop: scrollPosition.scrollTop,
                scrollLeft: scrollPosition.scrollLeft
            }, 1 /* ScrollType.Immediate */);
            this._context.viewModel.visibleLinesStabilized();
        }
        getOffsetForColumn(modelLineNumber, modelColumn) {
            const modelPosition = this._context.viewModel.model.validatePosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            const viewPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            this._flushAccumulatedAndRenderNow();
            const visibleRange = this._viewLines.visibleRangeForPosition(new position_1.Position(viewPosition.lineNumber, viewPosition.column));
            if (!visibleRange) {
                return -1;
            }
            return visibleRange.left;
        }
        getTargetAtClientPoint(clientX, clientY) {
            const mouseTarget = this._pointerHandler.getTargetAtClientPoint(clientX, clientY);
            if (!mouseTarget) {
                return null;
            }
            return viewUserInputEvents_1.ViewUserInputEvents.convertViewToModelMouseTarget(mouseTarget, this._context.viewModel.coordinatesConverter);
        }
        createOverviewRuler(cssClassName) {
            return new overviewRuler_1.OverviewRuler(this._context, cssClassName);
        }
        change(callback) {
            this._viewZones.changeViewZones(callback);
            this._scheduleRender();
        }
        render(now, everything) {
            if (everything) {
                // Force everything to render...
                this._viewLines.forceShouldRender();
                for (const viewPart of this._viewParts) {
                    viewPart.forceShouldRender();
                }
            }
            if (now) {
                this._flushAccumulatedAndRenderNow();
            }
            else {
                this._scheduleRender();
            }
        }
        writeScreenReaderContent(reason) {
            this._textAreaHandler.writeScreenReaderContent(reason);
        }
        focus() {
            this._textAreaHandler.focusTextArea();
        }
        isFocused() {
            return this._textAreaHandler.isFocused();
        }
        refreshFocusState() {
            this._textAreaHandler.refreshFocusState();
        }
        setAriaOptions(options) {
            this._textAreaHandler.setAriaOptions(options);
        }
        addContentWidget(widgetData) {
            this._contentWidgets.addWidget(widgetData.widget);
            this.layoutContentWidget(widgetData);
            this._scheduleRender();
        }
        layoutContentWidget(widgetData) {
            this._contentWidgets.setWidgetPosition(widgetData.widget, widgetData.position?.position ?? null, widgetData.position?.secondaryPosition ?? null, widgetData.position?.preference ?? null, widgetData.position?.positionAffinity ?? null);
            this._scheduleRender();
        }
        removeContentWidget(widgetData) {
            this._contentWidgets.removeWidget(widgetData.widget);
            this._scheduleRender();
        }
        addOverlayWidget(widgetData) {
            this._overlayWidgets.addWidget(widgetData.widget);
            this.layoutOverlayWidget(widgetData);
            this._scheduleRender();
        }
        layoutOverlayWidget(widgetData) {
            const newPreference = widgetData.position ? widgetData.position.preference : null;
            const shouldRender = this._overlayWidgets.setWidgetPosition(widgetData.widget, newPreference);
            if (shouldRender) {
                this._scheduleRender();
            }
        }
        removeOverlayWidget(widgetData) {
            this._overlayWidgets.removeWidget(widgetData.widget);
            this._scheduleRender();
        }
        addGlyphMarginWidget(widgetData) {
            this._glyphMarginWidgets.addWidget(widgetData.widget);
            this._shouldRecomputeGlyphMarginLanes = true;
            this._scheduleRender();
        }
        layoutGlyphMarginWidget(widgetData) {
            const newPreference = widgetData.position;
            const shouldRender = this._glyphMarginWidgets.setWidgetPosition(widgetData.widget, newPreference);
            if (shouldRender) {
                this._shouldRecomputeGlyphMarginLanes = true;
                this._scheduleRender();
            }
        }
        removeGlyphMarginWidget(widgetData) {
            this._glyphMarginWidgets.removeWidget(widgetData.widget);
            this._shouldRecomputeGlyphMarginLanes = true;
            this._scheduleRender();
        }
    };
    exports.View = View;
    exports.View = View = __decorate([
        __param(6, instantiation_1.IInstantiationService)
    ], View);
    function safeInvokeNoArg(func) {
        try {
            return func();
        }
        catch (e) {
            (0, errors_1.onUnexpectedError)(e);
            return null;
        }
    }
    class EditorRenderingCoordinator {
        static { this.INSTANCE = new EditorRenderingCoordinator(); }
        constructor() {
            this._coordinatedRenderings = [];
            this._animationFrameRunners = new Map();
        }
        scheduleCoordinatedRendering(rendering) {
            this._coordinatedRenderings.push(rendering);
            this._scheduleRender(rendering.window);
            return {
                dispose: () => {
                    const renderingIndex = this._coordinatedRenderings.indexOf(rendering);
                    if (renderingIndex === -1) {
                        return;
                    }
                    this._coordinatedRenderings.splice(renderingIndex, 1);
                    if (this._coordinatedRenderings.length === 0) {
                        // There are no more renderings to coordinate => cancel animation frames
                        for (const [_, disposable] of this._animationFrameRunners) {
                            disposable.dispose();
                        }
                        this._animationFrameRunners.clear();
                    }
                }
            };
        }
        _scheduleRender(window) {
            if (!this._animationFrameRunners.has(window)) {
                const runner = () => {
                    this._animationFrameRunners.delete(window);
                    this._onRenderScheduled();
                };
                this._animationFrameRunners.set(window, dom.runAtThisOrScheduleAtNextAnimationFrame(window, runner, 100));
            }
        }
        _onRenderScheduled() {
            const coordinatedRenderings = this._coordinatedRenderings.slice(0);
            this._coordinatedRenderings = [];
            for (const rendering of coordinatedRenderings) {
                safeInvokeNoArg(() => rendering.prepareRenderText());
            }
            const datas = [];
            for (let i = 0, len = coordinatedRenderings.length; i < len; i++) {
                const rendering = coordinatedRenderings[i];
                datas[i] = safeInvokeNoArg(() => rendering.renderText());
            }
            for (let i = 0, len = coordinatedRenderings.length; i < len; i++) {
                const rendering = coordinatedRenderings[i];
                const data = datas[i];
                if (!data) {
                    continue;
                }
                const [viewParts, ctx] = data;
                safeInvokeNoArg(() => rendering.prepareRender(viewParts, ctx));
            }
            for (let i = 0, len = coordinatedRenderings.length; i < len; i++) {
                const rendering = coordinatedRenderings[i];
                const data = datas[i];
                if (!data) {
                    continue;
                }
                const [viewParts, ctx] = data;
                safeInvokeNoArg(() => rendering.render(viewParts, ctx));
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3RXpGLElBQU0sSUFBSSxHQUFWLE1BQU0sSUFBSyxTQUFRLG1DQUFnQjtRQTZCekMsWUFDQyxlQUFpQyxFQUNqQyxhQUFtQyxFQUNuQyxVQUF1QixFQUN2QixLQUFpQixFQUNqQixlQUFvQyxFQUNwQyxzQkFBK0MsRUFDeEIscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBRmdDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFYckYsdUJBQXVCO1lBQ2YscUNBQWdDLEdBQVksS0FBSyxDQUFDO1lBYXpELElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1lBRWxDLE1BQU0sY0FBYyxHQUFHLElBQUksK0JBQWMsQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUVsRyw2RkFBNkY7WUFDN0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHlCQUFXLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVsRSwyRUFBMkU7WUFDM0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFckIsbUJBQW1CO1lBQ25CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLGlDQUFlLEVBQUUsSUFB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
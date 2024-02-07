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
define(["require", "exports", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/contrib/comments/browser/commentGlyphWidget", "vs/workbench/contrib/comments/browser/commentService", "vs/editor/common/config/editorOptions", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/contrib/comments/browser/commentThreadWidget", "vs/workbench/contrib/comments/browser/commentColors", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/configuration/common/configuration", "vs/editor/browser/stableEditorScroll"], function (require, exports, color_1, event_1, lifecycle_1, range_1, languages, zoneWidget_1, contextkey_1, instantiation_1, themeService_1, commentGlyphWidget_1, commentService_1, editorOptions_1, serviceCollection_1, commentThreadWidget_1, commentColors_1, peekView_1, configuration_1, stableEditorScroll_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReviewZoneWidget = exports.isMouseUpEventMatchMouseDown = exports.isMouseUpEventDragFromMouseDown = exports.parseMouseDownInfoFromEvent = void 0;
    function getCommentThreadWidgetStateColor(thread, theme) {
        return (0, commentColors_1.getCommentThreadStateBorderColor)(thread, theme) ?? theme.getColor(peekView_1.peekViewBorder);
    }
    function parseMouseDownInfoFromEvent(e) {
        const range = e.target.range;
        if (!range) {
            return null;
        }
        if (!e.event.leftButton) {
            return null;
        }
        if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
            return null;
        }
        const data = e.target.detail;
        const gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth - data.glyphMarginLeft;
        // don't collide with folding and git decorations
        if (gutterOffsetX > 20) {
            return null;
        }
        return { lineNumber: range.startLineNumber };
    }
    exports.parseMouseDownInfoFromEvent = parseMouseDownInfoFromEvent;
    function isMouseUpEventDragFromMouseDown(mouseDownInfo, e) {
        if (!mouseDownInfo) {
            return null;
        }
        const { lineNumber } = mouseDownInfo;
        const range = e.target.range;
        if (!range) {
            return null;
        }
        return lineNumber;
    }
    exports.isMouseUpEventDragFromMouseDown = isMouseUpEventDragFromMouseDown;
    function isMouseUpEventMatchMouseDown(mouseDownInfo, e) {
        if (!mouseDownInfo) {
            return null;
        }
        const { lineNumber } = mouseDownInfo;
        const range = e.target.range;
        if (!range || range.startLineNumber !== lineNumber) {
            return null;
        }
        if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
            return null;
        }
        return lineNumber;
    }
    exports.isMouseUpEventMatchMouseDown = isMouseUpEventMatchMouseDown;
    let ReviewZoneWidget = class ReviewZoneWidget extends zoneWidget_1.ZoneWidget {
        get owner() {
            return this._owner;
        }
        get commentThread() {
            return this._commentThread;
        }
        get expanded() {
            return this._isExpanded;
        }
        constructor(editor, _owner, _commentThread, _pendingComment, _pendingEdits, instantiationService, themeService, commentService, contextKeyService, configurationService) {
            super(editor, { keepEditorSelection: true, isAccessible: true });
            this._owner = _owner;
            this._commentThread = _commentThread;
            this._pendingComment = _pendingComment;
            this._pendingEdits = _pendingEdits;
            this.themeService = themeService;
            this.commentService = commentService;
            this.configurationService = configurationService;
            this._onDidClose = new event_1.Emitter();
            this._onDidCreateThread = new event_1.Emitter();
            this._globalToDispose = new lifecycle_1.DisposableStore();
            this._commentThreadDisposables = [];
            this._contextKeyService = contextKeyService.createScoped(this.domNode);
            this._scopedInstantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this._contextKeyService]));
            const controller = this.commentService.getCommentController(this._owner);
            if (controller) {
                this._commentOptions = controller.options;
            }
            this._initialCollapsibleState = _pendingComment ? languages.CommentThreadCollapsibleState.Expanded : _commentThread.initialCollapsibleState;
            _commentThread.initialCollapsibleState = this._initialCollapsibleState;
            this._isExpanded = this._initialCollapsibleState === languages.CommentThreadCollapsibleState.Expanded;
            this._commentThreadDisposables = [];
            this.create();
            this._globalToDispose.add(this.themeService.onDidColorThemeChange(this._applyTheme, this));
            this._globalToDispose.add(this.editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this._applyTheme(this.themeService.getColorTheme());
                }
            }));
            this._applyTheme(this.themeService.getColorTheme());
        }
        get onDidClose() {
            return this._onDidClose.event;
        }
        get onDidCreateThread() {
            return this._onDidCreateThread.event;
        }
        getPosition() {
            if (this.position) {
                return this.position;
            }
            if (this._commentGlyph) {
                return this._commentGlyph.getPosition().position ?? undefined;
            }
            return undefined;
        }
        revealRange() {
            // we don't do anything here as we always do the reveal ourselves.
        }
        reveal(commentUniqueId, focus = false) {
            if (!this._isExpanded) {
                this.show(this.arrowPosition(this._commentThread.range), 2);
            }
            if (commentUniqueId !== undefined) {
                const height = this.editor.getLayoutInfo().height;
                const coords = this._commentThreadWidget.getCommentCoords(commentUniqueId);
                if (coords) {
                    let scrollTop = 1;
                    if (this._commentThread.range) {
                        const commentThreadCoords = coords.thread;
                        const commentCoords = coords.comment;
                        scrollTop = this.editor.getTopForLineNumber(this._commentThread.range.startLineNumber) - height / 2 + commentCoords.top - commentThreadCoords.top;
                    }
                    this.editor.setScrollTop(scrollTop);
                    if (focus) {
                        this._commentThreadWidget.focus();
                    }
                    return;
                }
            }
            this.editor.revealRangeInCenter(this._commentThread.range ?? new range_1.Range(1, 1, 1, 1));
            if (focus) {
                this._commentThreadWidget.focus();
            }
        }
        getPendingComments() {
            return {
                newComment: this._commentThreadWidget.getPendingComment(),
                edits: this._commentThreadWidget.getPendingEdits()
            };
        }
        setPendingComment(comment) {
            this._pendingComment = comment;
            this.expand();
            this._commentThreadWidget.setPendingComment(comment);
        }
        _fillContainer(container) {
            this.setCssClass('review-widget');
            this._commentThreadWidget = this._scopedInstantiationService.createInstance(commentThreadWidget_1.CommentThreadWidget, container, this.editor, this._owner, this.editor.getModel().uri, this._contextKeyService, this._scopedInstantiationService, this._commentThread, this._pendingComment, this._pendingEdits, { editor: this.editor, codeBlockFontSize: '', codeBlockFontFamily: this.configurationService.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily }, this._commentOptions, {
                actionRunner: async () => {
                    if (!this._commentThread.comments || !this._commentThread.comments.length) {
                        const newPosition = this.getPosition();
                        if (newPosition) {
                            const originalRange = this._commentThread.range;
                            if (!originalRange) {
                                return;
                            }
                            let range;
                            if (newPosition.lineNumber !== originalRange.endLineNumber) {
                                // The widget could have moved as a result of editor changes.
                                // We need to try to calculate the new, more correct, range for the comment.
                                const distance = newPosition.lineNumber - originalRange.endLineNumber;
                                range = new range_1.Range(originalRange.startLineNumber + distance, originalRange.startColumn, originalRange.endLineNumber + distance, originalRange.endColumn);
                            }
                            else {
                                range = new range_1.Range(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.endColumn);
                            }
                            await this.commentService.updateCommentThreadTemplate(this.owner, this._commentThread.commentThreadHandle, range);
                        }
                    }
                },
                collapse: () => {
                    this.collapse();
                }
            });
            this._disposables.add(this._commentThreadWidget);
        }
        arrowPosition(range) {
            if (!range) {
                return undefined;
            }
            // Arrow on top edge of zone widget will be at the start of the line if range is multi-line, else at midpoint of range (rounding rightwards)
            return { lineNumber: range.endLineNumber, column: range.endLineNumber === range.startLineNumber ? (range.startColumn + range.endColumn + 1) / 2 : 1 };
        }
        deleteCommentThread() {
            this.dispose();
            this.commentService.disposeCommentThread(this.owner, this._commentThread.threadId);
        }
        collapse() {
            this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
        }
        expand() {
            this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
        }
        getGlyphPosition() {
            if (this._commentGlyph) {
                return this._commentGlyph.getPosition().position.lineNumber;
            }
            return 0;
        }
        toggleExpand() {
            if (this._isExpanded) {
                this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
            }
            else {
                this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
            }
        }
        async update(commentThread) {
            if (this._commentThread !== commentThread) {
                this._commentThreadDisposables.forEach(disposable => disposable.dispose());
                this._commentThread = commentThread;
                this._commentThreadDisposables = [];
                this.bindCommentThreadListeners();
            }
            this._commentThreadWidget.updateCommentThread(commentThread);
            // Move comment glyph widget and show position if the line has changed.
            const lineNumber = this._commentThread.range?.endLineNumber ?? 1;
            let shouldMoveWidget = false;
            if (this._commentGlyph) {
                this._commentGlyph.setThreadState(commentThread.state);
                if (this._commentGlyph.getPosition().position.lineNumber !== lineNumber) {
                    shouldMoveWidget = true;
                    this._commentGlyph.setLineNumber(lineNumber);
                }
            }
            if ((shouldMoveWidget && this._isExpanded) || (this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded && !this._isExpanded)) {
                this.show(this.arrowPosition(this._commentThread.range), 2);
            }
            else if (this._commentThread.collapsibleState !== languages.CommentThreadCollapsibleState.Expanded) {
                this.hide();
            }
        }
        _onWidth(widthInPixel) {
            this._commentThreadWidget.layout(widthInPixel);
        }
        _doLayout(heightInPixel, widthInPixel) {
            this._commentThreadWidget.layout(widthInPixel);
        }
        display(range) {
            if (range) {
                this._commentGlyph = new commentGlyphWidget_1.CommentGlyphWidget(this.editor, range?.endLineNumber ?? -1);
                this._commentGlyph.setThreadState(this._commentThread.state);
            }
            this._commentThreadWidget.display(this.editor.getOption(66 /* EditorOption.lineHeight */));
            this._disposables.add(this._commentThreadWidget.onDidResize(dimension => {
                this._refresh(dimension);
            }));
            if ((this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) || (range === undefined)) {
                this.show(this.arrowPosition(range), 2);
            }
            // If this is a new comment thread awaiting user input then we need to reveal it.
            if (this._commentThread.canReply && this._commentThread.isTemplate && (!this._commentThread.comments || (this._commentThread.comments.length === 0))) {
                this.reveal();
            }
            this.bindCommentThreadListeners();
        }
        bindCommentThreadListeners() {
            this._commentThreadDisposables.push(this._commentThread.onDidChangeComments(async (_) => {
                await this.update(this._commentThread);
            }));
            this._commentThreadDisposables.push(this._commentThread.onDidChangeRange(range => {
                // Move comment glyph widget and show position if the line has changed.
                const lineNumber = this._commentThread.range?.startLineNumber ?? 1;
                let shouldMoveWidget = false;
                if (this._commentGlyph) {
                    if (this._commentGlyph.getPosition().position.lineNumber !== lineNumber) {
                        shouldMoveWidget = true;
                        this._commentGlyph.setLineNumber(lineNumber);
                    }
                }
                if (shouldMoveWidget && this._isExpanded) {
                    this.show(this.arrowPosition(this._commentThread.range), 2);
                }
            }));
            this._commentThreadDisposables.push(this._commentThread.onDidChangeCollapsibleState(state => {
                if (state === languages.CommentThreadCollapsibleState.Expanded && !this._isExpanded) {
                    this.show(this.arrowPosition(this._commentThread.range), 2);
                    return;
                }
                if (state === languages.CommentThreadCollapsibleState.Collapsed && this._isExpanded) {
                    this.hide();
                    return;
                }
            }));
            if (this._initialCollapsibleState === undefined) {
                const onDidChangeInitialCollapsibleState = this._commentThread.onDidChangeInitialCollapsibleState(state => {
                    // File comments always start expanded
                    this._initialCollapsibleState = state;
                    this._commentThread.collapsibleState = this._initialCollapsibleState;
                    onDidChangeInitialCollapsibleState.dispose();
                });
                this._commentThreadDisposables.push(onDidChangeInitialCollapsibleState);
            }
            this._commentThreadDisposables.push(this._commentThread.onDidChangeState(() => {
                const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || color_1.Color.transparent;
                this.style({
                    frameColor: borderColor,
                    arrowColor: borderColor,
                });
                this.container?.style.setProperty(commentColors_1.commentThreadStateColorVar, `${borderColor}`);
                this.container?.style.setProperty(commentColors_1.commentThreadStateBackgroundColorVar, `${borderColor.transparent(.1)}`);
            }));
        }
        async submitComment() {
            return this._commentThreadWidget.submitComment();
        }
        _refresh(dimensions) {
            if (dimensions.height === 0 && dimensions.width === 0) {
                this.commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
                return;
            }
            if (this._isExpanded) {
                this._commentThreadWidget.layout();
                const headHeight = Math.ceil(this.editor.getOption(66 /* EditorOption.lineHeight */) * 1.2);
                const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
                const arrowHeight = Math.round(lineHeight / 3);
                const frameThickness = Math.round(lineHeight / 9) * 2;
                const computedLinesNumber = Math.ceil((headHeight + dimensions.height + arrowHeight + frameThickness + 8 /** margin bottom to avoid margin collapse */) / lineHeight);
                if (this._viewZone?.heightInLines === computedLinesNumber) {
                    return;
                }
                const currentPosition = this.getPosition();
                if (this._viewZone && currentPosition && currentPosition.lineNumber !== this._viewZone.afterLineNumber && this._viewZone.afterLineNumber !== 0) {
                    this._viewZone.afterLineNumber = currentPosition.lineNumber;
                }
                if (!this._commentThread.comments || !this._commentThread.comments.length) {
                    this._commentThreadWidget.focusCommentEditor();
                }
                const capture = stableEditorScroll_1.StableEditorScrollState.capture(this.editor);
                this._relayout(computedLinesNumber);
                capture.restore(this.editor);
            }
        }
        _applyTheme(theme) {
            const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || color_1.Color.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor
            });
            const fontInfo = this.editor.getOption(50 /* EditorOption.fontInfo */);
            // Editor decorations should also be responsive to theme changes
            this._commentThreadWidget.applyTheme(theme, fontInfo);
        }
        show(rangeOrPos, heightInLines) {
            const glyphPosition = this._commentGlyph?.getPosition();
            let range = range_1.Range.isIRange(rangeOrPos) ? rangeOrPos : (rangeOrPos ? range_1.Range.fromPositions(rangeOrPos) : undefined);
            if (glyphPosition?.position && range && glyphPosition.position.lineNumber !== range.endLineNumber) {
                // The widget could have moved as a result of editor changes.
                // We need to try to calculate the new, more correct, range for the comment.
                const distance = glyphPosition.position.lineNumber - range.endLineNumber;
                range = new range_1.Range(range.startLineNumber + distance, range.startColumn, range.endLineNumber + distance, range.endColumn);
            }
            this._isExpanded = true;
            super.show(range ?? new range_1.Range(0, 0, 0, 0), heightInLines);
            this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
            this._refresh(this._commentThreadWidget.getDimensions());
        }
        hide() {
            if (this._isExpanded) {
                this._isExpanded = false;
                // Focus the container so that the comment editor will be blurred before it is hidden
                if (this.editor.hasWidgetFocus()) {
                    this.editor.focus();
                }
                if (!this._commentThread.comments || !this._commentThread.comments.length) {
                    this.deleteCommentThread();
                }
            }
            super.hide();
        }
        dispose() {
            super.dispose();
            if (this._commentGlyph) {
                this._commentGlyph.dispose();
                this._commentGlyph = undefined;
            }
            this._globalToDispose.dispose();
            this._commentThreadDisposables.forEach(global => global.dispose());
            this._onDidClose.fire(undefined);
        }
    };
    exports.ReviewZoneWidget = ReviewZoneWidget;
    exports.ReviewZoneWidget = ReviewZoneWidget = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, commentService_1.ICommentService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, configuration_1.IConfigurationService)
    ], ReviewZoneWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFRocmVhZFpvbmVXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbW1lbnRzL2Jyb3dzZXIvY29tbWVudFRocmVhZFpvbmVXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEJoRyxTQUFTLGdDQUFnQyxDQUFDLE1BQWdELEVBQUUsS0FBa0I7UUFDN0csT0FBTyxJQUFBLGdEQUFnQyxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLHlCQUFjLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRUQsU0FBZ0IsMkJBQTJCLENBQUMsQ0FBb0I7UUFDL0QsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFN0IsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ1osT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDekIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksb0RBQTRDLEVBQUUsQ0FBQztZQUMvRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM3QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUUxRyxpREFBaUQ7UUFDakQsSUFBSSxhQUFhLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDeEIsT0FBTyxJQUFJ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
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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/editorCommon", "vs/editor/common/model/textModel", "vs/editor/common/languages", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/comments/browser/commentGlyphWidget", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/commentThreadZoneWidget", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/workbench/contrib/comments/browser/commentReply", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/comments/browser/commentThreadRangeDecorator", "vs/base/browser/ui/aria/aria", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/platform/keybinding/common/keybinding", "vs/platform/accessibility/common/accessibility", "vs/css!./media/review"], function (require, exports, actions_1, arrays_1, arraysFind_1, async_1, errors_1, lifecycle_1, codeEditorService_1, range_1, editorCommon_1, textModel_1, languages, nls, contextView_1, instantiation_1, quickInput_1, commentGlyphWidget_1, commentService_1, commentThreadZoneWidget_1, editorService_1, embeddedCodeEditorWidget_1, viewsService_1, commentsTreeViewer_1, configuration_1, commentsConfiguration_1, commentReply_1, event_1, contextkey_1, commentThreadRangeDecorator_1, aria_1, commentContextKeys_1, keybinding_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentController = exports.ID = void 0;
    exports.ID = 'editor.contrib.review';
    class CommentingRangeDecoration {
        get id() {
            return this._decorationId;
        }
        set id(id) {
            this._decorationId = id;
        }
        get range() {
            return {
                startLineNumber: this._startLineNumber, startColumn: 1,
                endLineNumber: this._endLineNumber, endColumn: 1
            };
        }
        constructor(_editor, _ownerId, _extensionId, _label, _range, options, commentingRangesInfo, isHover = false) {
            this._editor = _editor;
            this._ownerId = _ownerId;
            this._extensionId = _extensionId;
            this._label = _label;
            this._range = _range;
            this.options = options;
            this.commentingRangesInfo = commentingRangesInfo;
            this.isHover = isHover;
            this._startLineNumber = _range.startLineNumber;
            this._endLineNumber = _range.endLineNumber;
        }
        getCommentAction() {
            return {
                extensionId: this._extensionId,
                label: this._label,
                ownerId: this._ownerId,
                commentingRangesInfo: this.commentingRangesInfo
            };
        }
        getOriginalRange() {
            return this._range;
        }
        getActiveRange() {
            return this.id ? this._editor.getModel().getDecorationRange(this.id) : undefined;
        }
    }
    class CommentingRangeDecorator {
        static { this.description = 'commenting-range-decorator'; }
        constructor() {
            this.commentingRangeDecorations = [];
            this.decorationIds = [];
            this._lastHover = -1;
            this._onDidChangeDecorationsCount = new event_1.Emitter();
            this.onDidChangeDecorationsCount = this._onDidChangeDecorationsCount.event;
            const decorationOptions = {
                description: CommentingRangeDecorator.description,
                isWholeLine: true,
                linesDecorationsClassName: 'comment-range-glyph comment-diff-added'
            };
            this.decorationOptions = textModel_1.ModelDecorationOptions.createDynamic(decorationOptions);
            const hoverDecorationOptions = {
                description: CommentingRangeDecorator.description,
                isWholeLine: true,
                linesDecorationsClassName: `comment-range-glyph line-hover`
            };
            this.hoverDecorationOptions = textModel_1.ModelDecorationOptions.createDynamic(hoverDecorationOptions);
            const multilineDecorationOptions = {
                description: CommentingRangeDecorator.description,
                isWholeLine: true,
                linesDecorationsClassName: `comment-range-glyph multiline-add`
            };
            this.multilineDecorationOptions = textModel_1.ModelDecorationOptions.createDynamic(multilineDecorationOptions);
        }
        updateHover(hoverLine) {
            if (this._editor && this._infos && (hoverLine !== this._lastHover)) {
                this._doUpdate(this._editor, this._infos, hoverLine);
            }
            this._lastHover = hoverLine ?? -1;
        }
        updateSelection(cursorLine, range = new range_1.Range(0, 0, 0, 0)) {
            this._lastSelection = range.isEmpty() ? undefined : range;
            this._lastSelectionCursor = range.isEmpty() ? undefined : cursorLine;
            // Some scenarios:
            // Selection is made. Emphasis should show on the drag/selection end location.
            // Selection is made, then user clicks elsewhere. We should still show the decoration.
            if (this._editor && this._infos) {
                this._doUpdate(this._editor, this._infos, cursorLine, range);
            }
        }
        update(editor, commentInfos, cursorLine, range) {
            if (editor) {
                this._editor = editor;
                this._infos = commentInfos;
                this._doUpdate(editor, commentInfos, cursorLine, range);
            }
        }
        _lineHasThread(editor, lineRange) {
            return editor.getDecorationsInRange(lineRange)?.find(decoration => decoration.options.description === commentGlyphWidget_1.CommentGlyphWidget.description);
        }
        _doUpdate(editor, commentInfos, emphasisLine = -1, selectionRange = this._lastSelection) {
            const model = editor.getModel();
            if (!model) {
                return;
            }
            // If there's still a selection, use that.
            emphasisLine = this._lastSelectionCursor ?? emphasisLine;
            const commentingRangeDecorations = [];
            for (const info of commentInfos) {
                info.commentingRanges.ranges.forEach(range => {
                    const rangeObject = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                    let intersectingSelectionRange = selectionRange ? rangeObject.intersectRanges(selectionRange) : undefined;
                    if ((selectionRange && (emphasisLine >= 0) && intersectingSelectionRange)
                        // If there's only one selection line, then just drop into the else if and show an emphasis line.
                        && !((intersectingSelectionRange.startLineNumber === intersectingSelectionRange.endLineNumber)
                            && (emphasisLine === intersectingSelectionRange.startLineNumber))) {
                        // The emphasisLine should be within the commenting range, even if the selection range stretches
                        // outside of the commenting range.
                        // Clip the emphasis and selection ranges to the commenting range
                        let intersectingEmphasisRange;
                        if (emphasisLine <= intersectingSelectionRange.startLineNumber) {
                            intersectingEmphasisRange = intersectingSelectionRange.collapseToStart();
                            intersectingSelectionRange = new range_1.Range(intersectingSelectionRange.startLineNumber + 1, 1, intersectingSelectionRange.endLineNumber, 1);
                        }
                        else {
                            intersectingEmphasisRange = new range_1.Range(intersectingSelectionRange.endLineNumber, 1, intersectingSelectionRange.endLineNumber, 1);
                            intersectingSelectionRange = new range_1.Range(intersectingSelectionRange.startLineNumber, 1, intersectingSelectionRange.endLineNumber - 1, 1);
                        }
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, intersectingSelectionRange, this.multilineDecorationOptions, info.commentingRanges, true));
                        if (!this._lineHasThread(editor, intersectingEmphasisRange)) {
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, intersectingEmphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
                        }
                        const beforeRangeEndLine = Math.min(intersectingEmphasisRange.startLineNumber, intersectingSelectionRange.startLineNumber) - 1;
                        const hasBeforeRange = rangeObject.startLineNumber <= beforeRangeEndLine;
                        const afterRangeStartLine = Math.max(intersectingEmphasisRange.endLineNumber, intersectingSelectionRange.endLineNumber) + 1;
                        const hasAfterRange = rangeObject.endLineNumber >= afterRangeStartLine;
                        if (hasBeforeRange) {
                            const beforeRange = new range_1.Range(range.startLineNumber, 1, beforeRangeEndLine, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
                        }
                        if (hasAfterRange) {
                            const afterRange = new range_1.Range(afterRangeStartLine, 1, range.endLineNumber, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
                        }
                    }
                    else if ((rangeObject.startLineNumber <= emphasisLine) && (emphasisLine <= rangeObject.endLineNumber)) {
                        if (rangeObject.startLineNumber < emphasisLine) {
                            const beforeRange = new range_1.Range(range.startLineNumber, 1, emphasisLine - 1, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
                        }
                        const emphasisRange = new range_1.Range(emphasisLine, 1, emphasisLine, 1);
                        if (!this._lineHasThread(editor, emphasisRange)) {
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, emphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
                        }
                        if (emphasisLine < rangeObject.endLineNumber) {
                            const afterRange = new range_1.Range(emphasisLine + 1, 1, range.endLineNumber, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
                        }
                    }
                    else {
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, range, this.decorationOptions, info.commentingRanges));
                    }
                });
            }
            editor.changeDecorations((accessor) => {
                this.decorationIds = accessor.deltaDecorations(this.decorationIds, commentingRangeDecorations);
                commentingRangeDecorations.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
            });
            const rangesDifference = this.commentingRangeDecorations.length - commentingRangeDecorations.length;
            this.commentingRangeDecorations = commentingRangeDecorations;
            if (rangesDifference) {
                this._onDidChangeDecorationsCount.fire(this.commentingRangeDecorations.length);
            }
        }
        areRangesIntersectingOrTouchingByLine(a, b) {
            // Check if `a` is before `b`
            if (a.endLineNumber < (b.startLineNumber - 1)) {
                return false;
            }
            // Check if `b` is before `a`
            if ((b.endLineNumber + 1) < a.startLineNumber) {
                return false;
            }
            // These ranges must intersect
            return true;
        }
        getMatchedCommentAction(commentRange) {
            if (commentRange === undefined) {
                const foundInfos = this._infos?.filter(info => info.commentingRanges.fileComments);
                if (foundInfos) {
                    return foundInfos.map(foundInfo => {
                        return {
                            action: {
                                ownerId: foundInfo.owner,
                                extensionId: foundInfo.extensionId,
                                label: foundInfo.label,
                                commentingRangesInfo: foundInfo.commentingRanges
                            }
                        };
                    });
                }
                return [];
            }
            // keys is ownerId
            const foundHoverActions = new Map();
            for (const decoration of this.commentingRangeDecorations) {
                const range = decoration.getActiveRange();
                if (range && this.areRangesIntersectingOrTouchingByLine(range, commentRange)) {
                    // We can have several commenting ranges that match from the same owner because of how
                    // the line hover and selection decoration is done.
                    // The ranges must be merged so that we can see if the new commentRange fits within them.
                    const action = decoration.getCommentAction();
                    const alreadyFoundInfo = foundHoverActions.get(action.ownerId);
                    if (alreadyFoundInfo?.action.commentingRangesInfo === action.commentingRangesInfo) {
                        // Merge ranges.
                        const newRange = new range_1.Range(range.startLineNumber < alreadyFoundInfo.range.startLineNumber ? range.startLineNumber : alreadyFoundInfo.range.startLineNumber, range.startColumn < alreadyFoundInfo.range.startColumn ? range.startColumn : alreadyFoundInfo.range.startColumn, range.endLineNumber > alreadyFoundInfo.range.endLineNumber ? range.endLineNumber : alreadyFoundInfo.range.endLineNumber, range.endColumn > alreadyFoundInfo.range.endColumn ? range.endColumn : alreadyFoundInfo.range.endColumn);
                        foundHoverActions.set(action.ownerId, { range: newRange, action });
                    }
                    else {
                        foundHoverActions.set(action.ownerId, { range, action });
                    }
                }
            }
            const seenOwners = new Set();
            return Array.from(foundHoverActions.values()).filter(action => {
                if (seenOwners.has(action.action.ownerId)) {
                    return false;
                }
                else {
                    seenOwners.add(action.action.ownerId);
                    return true;
                }
            });
        }
        getNearestCommentingRange(findPosition, reverse) {
            let findPositionContainedWithin;
            let decorations;
            if (reverse) {
                decorations = [];
                for (let i = this.commentingRangeDecorations.length - 1; i >= 0; i--) {
                    decorations.push(this.commentingRangeDecorations[i]);
                }
            }
            else {
                decorations = this.commentingRangeDecorations;
            }
            for (const decoration of decorations) {
                const range = decoration.getActiveRange();
                if (!range) {
                    continue;
                }
                if (findPositionContainedWithin && this.areRangesIntersectingOrTouchingByLine(range, findPositionContainedWithin)) {
                    findPositionContainedWithin = range_1.Range.plusRange(findPositionContainedWithin, range);
                    continue;
                }
                if (range.startLineNumber <= findPosition.lineNumber && findPosition.lineNumber <= range.endLineNumber) {
                    findPositionContainedWithin = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                    continue;
                }
                if (!reverse && range.endLineNumber < findPosition.lineNumber) {
                    continue;
                }
                if (reverse && range.startLineNumber > findPosition.lineNumber) {
                    continue;
                }
                return range;
            }
            return (decorations.length > 0 ? (decorations[0].getActiveRange() ?? undefined) : undefined);
        }
        dispose() {
            this.commentingRangeDecorations = [];
        }
    }
    let CommentController = class CommentController {
        constructor(editor, commentService, instantiationService, codeEditorService, contextMenuService, quickInputService, viewsService, configurationService, contextKeyService, editorService, keybindingService, accessibilityService) {
            this.commentService = commentService;
            this.instantiationService = instantiationService;
            this.codeEditorService = codeEditorService;
            this.contextMenuService = contextMenuService;
            this.quickInputService = quickInputService;
            this.viewsService = viewsService;
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.keybindingService = keybindingService;
            this.accessibilityService = accessibilityService;
            this.globalToDispose = new lifecycle_1.DisposableStore();
            this.localToDispose = new lifecycle_1.DisposableStore();
            this.mouseDownInfo = null;
            this._commentingRangeSpaceReserved = false;
            this._emptyThreadsToAddQueue = [];
            this._inProcessContinueOnComments = new Map();
            this._editorDisposables = [];
            this._hasRespondedToEditorChange = false;
            this._commentInfos = [];
            this._commentWidgets = [];
            this._pendingNewCommentCache = {};
            this._pendingEditsCache = {};
            this._computePromise = null;
            this._activeCursorHasCommentingRange = commentContextKeys_1.CommentContextKeys.activeCursorHasCommentingRange.bindTo(contextKeyService);
            this._activeEditorHasCommentingRange = commentContextKeys_1.CommentContextKeys.activeEditorHasCommentingRange.bindTo(contextKeyService);
            if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
                return;
            }
            this.editor = editor;
            this._commentingRangeDecorator = new CommentingRangeDecorator();
            this.globalToDispose.add(this._commentingRangeDecorator.onDidChangeDecorationsCount(count => {
                if (count === 0) {
                    this.clearEditorListeners();
                }
                else if (this._editorDisposables.length === 0) {
                    this.registerEditorListeners();
                }
            }));
            this.globalToDispose.add(this._commentThreadRangeDecorator = new commentThreadRangeDecorator_1.CommentThreadRangeDecorator(this.commentService));
            this.globalToDispose.add(this.commentService.onDidDeleteDataProvider(ownerId => {
                if (ownerId) {
                    delete this._pendingNewCommentCache[ownerId];
                    delete this._pendingEditsCache[ownerId];
                }
                else {
                    this._pendingNewCommentCache = {};
                    this._pendingEditsCache = {};
                }
                this.beginCompute();
            }));
            this.globalToDispose.add(this.commentService.onDidSetDataProvider(_ => this.beginComputeAndHandleEditorChange()));
            this.globalToDispose.add(this.commentService.onDidUpdateCommentingRanges(_ => this.beginComputeAndHandleEditorChange()));
            this.globalToDispose.add(this.commentService.onDidSetResourceCommentInfos(e => {
                const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                if (editorURI && editorURI.toString() === e.resource.toString()) {
                    this.setComments(e.commentInfos.filter(commentInfo => commentInfo !== null));
                }
            }));
            this.globalToDispose.add(this.commentService.onDidChangeCommentingEnabled(e => {
                if (e) {
                    this.registerEditorListeners();
                    this.beginCompute();
                }
                else {
                    this.tryUpdateReservedSpace();
                    this.clearEditorListeners();
                    this._commentingRangeDecorator.update(this.editor, []);
                    this._commentThreadRangeDecorator.update(this.editor, []);
                    (0, lifecycle_1.dispose)(this._commentWidgets);
                    this._commentWidgets = [];
                }
            }));
            this.globalToDispose.add(this.editor.onDidChangeModel(_ => this.onModelChanged()));
            this.globalToDispose.add(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('diffEditor.renderSideBySide')) {
                    this.beginCompute();
                }
            }));
            this.onModelChanged();
            this.codeEditorService.registerDecorationType('comment-controller', commentReply_1.COMMENTEDITOR_DECORATION_KEY, {});
            this.globalToDispose.add(this.commentService.registerContinueOnCommentProvider({
                provideContinueOnComments: () => {
                    const pendingComments = [];
                    if (this._commentWidgets) {
                        for (const zone of this._commentWidgets) {
                            const zonePendingComments = zone.getPendingComments();
                            const pendingNewComment = zonePendingComments.newComment;
                            if (!pendingNewComment) {
                                continue;
                            }
                            let lastCommentBody;
                            if (zone.commentThread.comments && zone.commentThread.comments.length) {
                                const lastComment = zone.commentThread.comments[zone.commentThread.comments.length - 1];
                                if (typeof lastComment.body === 'string') {
                                    lastCommentBody = lastComment.body;
                                }
                                else {
                                    lastCommentBody = lastComment.body.value;
                                }
                            }
                            if (pendingNewComment !== lastCommentBody) {
                                pendingComments.push({
                                    owner: zone.owner,
                                    uri: zone.editor.getModel().uri,
                                    range: zone.commentThread.range,
                                    body: pendingNewComment,
                                    isReply: (zone.commentThread.comments !== undefined) && (zone.commentThread.comments.length > 0)
                                });
                            }
                        }
                    }
                    return pendingComments;
                }
            }));
        }
        registerEditorListeners() {
            this._editorDisposables = [];
            if (!this.editor) {
                return;
            }
            this._editorDisposables.push(this.editor.onMouseMove(e => this.onEditorMouseMove(e)));
            this._editorDisposables.push(this.editor.onMouseLeave(() => this.onEditorMouseLeave()));
            this._editorDisposables.push(this.editor.onDidChangeCursorPosition(e => this.onEditorChangeCursorPosition(e.position)));
            this._editorDisposables.push(this.editor.onDidFocusEditorWidget(() => this.onEditorChangeCursorPosition(this.editor?.getPosition() ?? null)));
            this._editorDisposables.push(this.editor.onDidChangeCursorSelection(e => this.onEditorChangeCursorSelection(e)));
            this._editorDisposables.push(this.editor.onDidBlurEditorWidget(() => this.onEditorChangeCursorSelection()));
        }
        clearEditorListeners() {
            (0, lifecycle_1.dispose)(this._editorDisposables);
            this._editorDisposables = [];
        }
        onEditorMouseLeave() {
            this._commentingRangeDecorator.updateHover();
        }
        onEditorMouseMove(e) {
            const position = e.target.position?.lineNumber;
            if (e.event.leftButton.valueOf() && position && this.mouseDownInfo) {
                this._commentingRangeDecorator.updateSelection(position, new range_1.Range(this.mouseDownInfo.lineNumber, 1, position, 1));
            }
            else {
                this._commentingRangeDecorator.updateHover(position);
            }
        }
        onEditorChangeCursorSelection(e) {
            const position = this.editor?.getPosition()?.lineNumber;
            if (position) {
                this._commentingRangeDecorator.updateSelection(position, e?.selection);
            }
        }
        onEditorChangeCursorPosition(e) {
            const decorations = e ? this.editor?.getDecorationsInRange(range_1.Range.fromPositions(e, { column: -1, lineNumber: e.lineNumber })) : undefined;
            let hasCommentingRange = false;
            if (decorations) {
                for (const decoration of decorations) {
                    if (decoration.options.description === commentGlyphWidget_1.CommentGlyphWidget.description) {
                        // We don't allow multiple comments on the same line.
                        hasCommentingRange = false;
                        break;
                    }
                    else if (decoration.options.description === CommentingRangeDecorator.description) {
                        hasCommentingRange = true;
                    }
                }
            }
            this._activeCursorHasCommentingRange.set(hasCommentingRange);
        }
        isEditorInlineOriginal(testEditor) {
            if (this.configurationService.getValue('diffEditor.renderSideBySide')) {
                return false;
            }
            const foundEditor = this.editorService.visibleTextEditorControls.find(editor => {
                if (editor.getEditorType() === editorCommon_1.EditorType.IDiffEditor) {
                    const diffEditor = editor;
                    return diffEditor.getOriginalEditor() === testEditor;
                }
                return false;
            });
            return !!foundEditor;
        }
        beginCompute() {
            this._computePromise = (0, async_1.createCancelablePromise)(token => {
                const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                if (editorURI) {
                    return this.commentService.getDocumentComments(editorURI);
                }
                return Promise.resolve([]);
            });
            return this._computePromise.then(commentInfos => {
                this.setComments((0, arrays_1.coalesce)(commentInfos));
                this._computePromise = null;
            }, error => console.log(error));
        }
        beginComputeCommentingRanges() {
            if (this._computeCommentingRangeScheduler) {
                if (this._computeCommentingRangePromise) {
                    this._computeCommentingRangePromise.cancel();
                    this._computeCommentingRangePromise = null;
                }
                this._computeCommentingRangeScheduler.trigger(() => {
                    const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                    if (editorURI) {
                        return this.commentService.getDocumentComments(editorURI);
                    }
                    return Promise.resolve([]);
                }).then(commentInfos => {
                    if (this.commentService.isCommentingEnabled) {
                        const meaningfulCommentInfos = (0, arrays_1.coalesce)(commentInfos);
                        this._commentingRangeDecorator.update(this.editor, meaningfulCommentInfos, this.editor?.getPosition()?.lineNumber, this.editor?.getSelection() ?? undefined);
                    }
                }, (err) => {
                    (0, errors_1.onUnexpectedError)(err);
                    return null;
                });
            }
        }
        static get(editor) {
            return editor.getContribution(exports.ID);
        }
        revealCommentThread(threadId, commentUniqueId, fetchOnceIfNotExist, focus) {
            const commentThreadWidget = this._commentWidgets.filter(widget => widget.commentThread.threadId === threadId);
            if (commentThreadWidget.length === 1) {
                commentThreadWidget[0].reveal(commentUniqueId, focus);
            }
            else if (fetchOnceIfNotExist) {
                if (this._computePromise) {
                    this._computePromise.then(_ => {
                        this.revealCommentThread(threadId, commentUniqueId, false, focus);
                    });
                }
                else {
                    this.beginCompute().then(_ => {
                        this.revealCommentThread(threadId, commentUniqueId, false, focus);
                    });
                }
            }
        }
        collapseAll() {
            for (const widget of this._commentWidgets) {
                widget.collapse();
            }
        }
        expandAll() {
            for (const widget of this._commentWidgets) {
                widget.expand();
            }
        }
        expandUnresolved() {
            for (const widget of this._commentWidgets) {
                if (widget.commentThread.state === languages.CommentThreadState.Unresolved) {
                    widget.expand();
                }
            }
        }
        nextCommentThread() {
            this._findNearestCommentThread();
        }
        _findNearestCommentThread(reverse) {
            if (!this._commentWidgets.length || !this.editor?.hasModel()) {
                return;
            }
            const after = this.editor.getSelection().getEndPosition();
            const sortedWidgets = this._commentWidgets.sort((a, b) => {
                if (reverse) {
                    const temp = a;
                    a = b;
                    b = temp;
                }
                if (a.commentThread.range === undefined) {
                    return -1;
                }
                if (b.commentThread.range === undefined) {
                    return 1;
                }
                if (a.commentThread.range.startLineNumber < b.commentThread.range.startLineNumber) {
                    return -1;
                }
                if (a.commentThread.range.startLineNumber > b.commentThread.range.startLineNumber) {
                    return 1;
                }
                if (a.commentThread.range.startColumn < b.commentThread.range.startColumn) {
                    return -1;
                }
                if (a.commentThread.range.startColumn > b.commentThread.range.startColumn) {
                    return 1;
                }
                return 0;
            });
            const idx = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(sortedWidgets, widget => {
                const lineValueOne = reverse ? after.lineNumber : (widget.commentThread.range?.startLineNumber ?? 0);
                const lineValueTwo = reverse ? (widget.commentThread.range?.startLineNumber ?? 0) : after.lineNumber;
                const columnValueOne = reverse ? after.column : (widget.commentThread.range?.startColumn ?? 0);
                const columnValueTwo = reverse ? (widget.commentThread.range?.startColumn ?? 0) : after.column;
                if (lineValueOne > lineValueTwo) {
                    return true;
                }
                if (lineValueOne < lineValueTwo) {
                    return false;
                }
                if (columnValueOne > columnValueTwo) {
                    return true;
                }
                return false;
            });
            let nextWidget;
            if (idx === this._commentWidgets.length) {
                nextWidget = this._commentWidgets[0];
            }
            else {
                nextWidget = sortedWidgets[idx];
            }
            this.editor.setSelection(nextWidget.commentThread.range ?? new range_1.Range(1, 1, 1, 1));
            nextWidget.reveal(undefined, true);
        }
        previousCommentThread() {
            this._findNearestCommentThread(true);
        }
        _findNearestCommentingRange(reverse) {
            if (!this.editor?.hasModel()) {
                return;
            }
            const after = this.editor.getSelection().getEndPosition();
            const range = this._commentingRangeDecorator.getNearestCommentingRange(after, reverse);
            if (range) {
                const position = reverse ? range.getEndPosition() : range.getStartPosition();
                this.editor.setPosition(position);
                this.editor.revealLineInCenterIfOutsideViewport(position.lineNumber);
            }
            if (this.accessibilityService.isScreenReaderOptimized()) {
                const commentRangeStart = range?.getStartPosition().lineNumber;
                const commentRangeEnd = range?.getEndPosition().lineNumber;
                if (commentRangeStart && commentRangeEnd) {
                    const oneLine = commentRangeStart === commentRangeEnd;
                    oneLine ? (0, aria_1.status)(nls.localize('commentRange', "Line {0}", commentRangeStart)) : (0, aria_1.status)(nls.localize('commentRangeStart', "Lines {0} to {1}", commentRangeStart, commentRangeEnd));
                }
            }
        }
        nextCommentingRange() {
            this._findNearestCommentingRange();
        }
        previousCommentingRange() {
            this._findNearestCommentingRange(true);
        }
        dispose() {
            this.globalToDispose.dispose();
            this.localToDispose.dispose();
            (0, lifecycle_1.dispose)(this._editorDisposables);
            (0, lifecycle_1.dispose)(this._commentWidgets);
            this.editor = null; // Strict null override - nulling out in dispose
        }
        onModelChanged() {
            this.localToDispose.clear();
            this.removeCommentWidgetsAndStoreCache();
            if (!this.editor) {
                return;
            }
            this._hasRespondedToEditorChange = false;
            this.localToDispose.add(this.editor.onMouseDown(e => this.onEditorMouseDown(e)));
            this.localToDispose.add(this.editor.onMouseUp(e => this.onEditorMouseUp(e)));
            if (this._editorDisposables.length) {
                this.clearEditorListeners();
                this.registerEditorListeners();
            }
            this._computeCommentingRangeScheduler = new async_1.Delayer(200);
            this.localToDispose.add({
                dispose: () => {
                    this._computeCommentingRangeScheduler?.cancel();
                    this._computeCommentingRangeScheduler = null;
                }
            });
            this.localToDispose.add(this.editor.onDidChangeModelContent(async () => {
                this.beginComputeCommentingRanges();
            }));
            this.localToDispose.add(this.commentService.onDidUpdateCommentThreads(async (e) => {
                const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                if (!editorURI || !this.commentService.isCommentingEnabled) {
                    return;
                }
                if (this._computePromise) {
                    await this._computePromise;
                }
                const commentInfo = this._commentInfos.filter(info => info.owner === e.owner);
                if (!commentInfo || !commentInfo.length) {
                    return;
                }
                const added = e.added.filter(thread => thread.resource && thread.resource === editorURI.toString());
                const removed = e.removed.filter(thread => thread.resource && thread.resource === editorURI.toString());
                const changed = e.changed.filter(thread => thread.resource && thread.resource === editorURI.toString());
                const pending = e.pending.filter(pending => pending.uri.toString() === editorURI.toString());
                removed.forEach(thread => {
                    const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId && zoneWidget.commentThread.threadId !== '');
                    if (matchedZones.length) {
                        const matchedZone = matchedZones[0];
                        const index = this._commentWidgets.indexOf(matchedZone);
                        this._commentWidgets.splice(index, 1);
                        matchedZone.dispose();
                    }
                    const infosThreads = this._commentInfos.filter(info => info.owner === e.owner)[0].threads;
                    for (let i = 0; i < infosThreads.length; i++) {
                        if (infosThreads[i] === thread) {
                            infosThreads.splice(i, 1);
                            i--;
                        }
                    }
                });
                changed.forEach(thread => {
                    const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId);
                    if (matchedZones.length) {
                        const matchedZone = matchedZones[0];
                        matchedZone.update(thread);
                        this.openCommentsView(thread);
                    }
                });
                for (const thread of added) {
                    const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId);
                    if (matchedZones.length) {
                        return;
                    }
                    const matchedNewCommentThreadZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.commentThreadHandle === -1 && range_1.Range.equalsRange(zoneWidget.commentThread.range, thread.range));
                    if (matchedNewCommentThreadZones.length) {
                        matchedNewCommentThreadZones[0].update(thread);
                        return;
                    }
                    const continueOnCommentIndex = this._inProcessContinueOnComments.get(e.owner)?.findIndex(pending => {
                        if (pending.range === undefined) {
                            return thread.range === undefined;
                        }
                        else {
                            return range_1.Range.lift(pending.range).equalsRange(thread.range);
                        }
                    });
                    let continueOnCommentText;
                    if ((continueOnCommentIndex !== undefined) && continueOnCommentIndex >= 0) {
                        continueOnCommentText = this._inProcessContinueOnComments.get(e.owner)?.splice(continueOnCommentIndex, 1)[0].body;
                    }
                    const pendingCommentText = (this._pendingNewCommentCache[e.owner] && this._pendingNewCommentCache[e.owner][thread.threadId])
                        ?? continueOnCommentText;
                    const pendingEdits = this._pendingEditsCache[e.owner] && this._pendingEditsCache[e.owner][thread.threadId];
                    this.displayCommentThread(e.owner, thread, pendingCommentText, pendingEdits);
                    this._commentInfos.filter(info => info.owner === e.owner)[0].threads.push(thread);
                    this.tryUpdateReservedSpace();
                }
                for (const thread of pending) {
                    await this.resumePendingComment(editorURI, thread);
                }
                this._commentThreadRangeDecorator.update(this.editor, commentInfo);
            }));
            this.beginComputeAndHandleEditorChange();
        }
        async resumePendingComment(editorURI, thread) {
            const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === thread.owner && range_1.Range.lift(zoneWidget.commentThread.range)?.equalsRange(thread.range));
            if (thread.isReply && matchedZones.length) {
                this.commentService.removeContinueOnComment({ owner: thread.owner, uri: editorURI, range: thread.range, isReply: true });
                matchedZones[0].setPendingComment(thread.body);
            }
            else if (matchedZones.length) {
                this.commentService.removeContinueOnComment({ owner: thread.owner, uri: editorURI, range: thread.range, isReply: false });
                const existingPendingComment = matchedZones[0].getPendingComments().newComment;
                // We need to try to reconcile the existing pending comment with the incoming pending comment
                let pendingComment;
                if (!existingPendingComment || thread.body.includes(existingPendingComment)) {
                    pendingComment = thread.body;
                }
                else if (existingPendingComment.includes(thread.body)) {
                    pendingComment = existingPendingComment;
                }
                else {
                    pendingComment = `${existingPendingComment}\n${thread.body}`;
                }
                matchedZones[0].setPendingComment(pendingComment);
            }
            else if (!thread.isReply) {
                const threadStillAvailable = this.commentService.removeContinueOnComment({ owner: thread.owner, uri: editorURI, range: thread.range, isReply: false });
                if (!threadStillAvailable) {
                    return;
                }
                if (!this._inProcessContinueOnComments.has(thread.owner)) {
                    this._inProcessContinueOnComments.set(thread.owner, []);
                }
                this._inProcessContinueOnComments.get(thread.owner)?.push(thread);
                await this.commentService.createCommentThreadTemplate(thread.owner, thread.uri, thread.range ? range_1.Range.lift(thread.range) : undefined);
            }
        }
        beginComputeAndHandleEditorChange() {
            this.beginCompute().then(() => {
                if (!this._hasRespondedToEditorChange) {
                    if (this._commentInfos.some(commentInfo => commentInfo.commentingRanges.ranges.length > 0 || commentInfo.commentingRanges.fileComments)) {
                        this._hasRespondedToEditorChange = true;
                        const verbose = this.configurationService.getValue("accessibility.verbosity.comments" /* AccessibilityVerbositySettingId.Comments */);
                        if (verbose) {
                            const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getAriaLabel();
                            if (keybinding) {
                                (0, aria_1.status)(nls.localize('hasCommentRangesKb', "Editor has commenting ranges, run the command Open Accessibility Help ({0}), for more information.", keybinding));
                            }
                            else {
                                (0, aria_1.status)(nls.localize('hasCommentRangesNoKb', "Editor has commenting ranges, run the command Open Accessibility Help, which is currently not triggerable via keybinding, for more information."));
                            }
                        }
                        else {
                            (0, aria_1.status)(nls.localize('hasCommentRanges', "Editor has commenting ranges."));
                        }
                    }
                }
            });
        }
        async openCommentsView(thread) {
            if (thread.comments && (thread.comments.length > 0)) {
                const openViewState = this.configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION).openView;
                if (openViewState === 'file') {
                    return this.viewsService.openView(commentsTreeViewer_1.COMMENTS_VIEW_ID);
                }
                else if (openViewState === 'firstFile' || (openViewState === 'firstFileUnresolved' && thread.state === languages.CommentThreadState.Unresolved)) {
                    const hasShownView = this.viewsService.getViewWithId(commentsTreeViewer_1.COMMENTS_VIEW_ID)?.hasRendered;
                    if (!hasShownView) {
                        return this.viewsService.openView(commentsTreeViewer_1.COMMENTS_VIEW_ID);
                    }
                }
            }
            return undefined;
        }
        displayCommentThread(owner, thread, pendingComment, pendingEdits) {
            const editor = this.editor?.getModel();
            if (!editor) {
                return;
            }
            if (!this.editor || this.isEditorInlineOriginal(this.editor)) {
                return;
            }
            let continueOnCommentReply;
            if (thread.range && !pendingComment) {
                continueOnCommentReply = this.commentService.removeContinueOnComment({ owner, uri: editor.uri, range: thread.range, isReply: true });
            }
            const zoneWidget = this.instantiationService.createInstance(commentThreadZoneWidget_1.ReviewZoneWidget, this.editor, owner, thread, pendingComment ?? continueOnCommentReply?.body, pendingEdits);
            zoneWidget.display(thread.range);
            this._commentWidgets.push(zoneWidget);
            this.openCommentsView(thread);
        }
        onEditorMouseDown(e) {
            this.mouseDownInfo = (0, commentThreadZoneWidget_1.parseMouseDownInfoFromEvent)(e);
        }
        onEditorMouseUp(e) {
            const matchedLineNumber = (0, commentThreadZoneWidget_1.isMouseUpEventDragFromMouseDown)(this.mouseDownInfo, e);
            this.mouseDownInfo = null;
            if (!this.editor || matchedLineNumber === null || !e.target.element) {
                return;
            }
            const mouseUpIsOnDecorator = (e.target.element.className.indexOf('comment-range-glyph') >= 0);
            const lineNumber = e.target.position.lineNumber;
            let range;
            let selection;
            // Check for drag along gutter decoration
            if ((matchedLineNumber !== lineNumber)) {
                if (matchedLineNumber > lineNumber) {
                    selection = new range_1.Range(matchedLineNumber, this.editor.getModel().getLineLength(matchedLineNumber) + 1, lineNumber, 1);
                }
                else {
                    selection = new range_1.Range(matchedLineNumber, 1, lineNumber, this.editor.getModel().getLineLength(lineNumber) + 1);
                }
            }
            else if (mouseUpIsOnDecorator) {
                selection = this.editor.getSelection();
            }
            // Check for selection at line number.
            if (selection && (selection.startLineNumber <= lineNumber) && (lineNumber <= selection.endLineNumber)) {
                range = selection;
                this.editor.setSelection(new range_1.Range(selection.endLineNumber, 1, selection.endLineNumber, 1));
            }
            else if (mouseUpIsOnDecorator) {
                range = new range_1.Range(lineNumber, 1, lineNumber, 1);
            }
            if (range) {
                this.addOrToggleCommentAtLine(range, e);
            }
        }
        async addOrToggleCommentAtLine(commentRange, e) {
            // If an add is already in progress, queue the next add and process it after the current one finishes to
            // prevent empty comment threads from being added to the same line.
            if (!this._addInProgress) {
                this._addInProgress = true;
                // The widget's position is undefined until the widget has been displayed, so rely on the glyph position instead
                const existingCommentsAtLine = this._commentWidgets.filter(widget => widget.getGlyphPosition() === (commentRange ? commentRange.endLineNumber : 0));
                if (existingCommentsAtLine.length) {
                    const allExpanded = existingCommentsAtLine.every(widget => widget.expanded);
                    existingCommentsAtLine.forEach(allExpanded ? widget => widget.collapse() : widget => widget.expand());
                    this.processNextThreadToAdd();
                    return;
                }
                else {
                    this.addCommentAtLine(commentRange, e);
                }
            }
            else {
                this._emptyThreadsToAddQueue.push([commentRange, e]);
            }
        }
        processNextThreadToAdd() {
            this._addInProgress = false;
            const info = this._emptyThreadsToAddQueue.shift();
            if (info) {
                this.addOrToggleCommentAtLine(info[0], info[1]);
            }
        }
        clipUserRangeToCommentRange(userRange, commentRange) {
            if (userRange.startLineNumber < commentRange.startLineNumber) {
                userRange = new range_1.Range(commentRange.startLineNumber, commentRange.startColumn, userRange.endLineNumber, userRange.endColumn);
            }
            if (userRange.endLineNumber > commentRange.endLineNumber) {
                userRange = new range_1.Range(userRange.startLineNumber, userRange.startColumn, commentRange.endLineNumber, commentRange.endColumn);
            }
            return userRange;
        }
        addCommentAtLine(range, e) {
            const newCommentInfos = this._commentingRangeDecorator.getMatchedCommentAction(range);
            if (!newCommentInfos.length || !this.editor?.hasModel()) {
                this._addInProgress = false;
                if (!newCommentInfos.length) {
                    throw new Error('There are no commenting ranges at the current position.');
                }
                return Promise.resolve();
            }
            if (newCommentInfos.length > 1) {
                if (e && range) {
                    this.contextMenuService.showContextMenu({
                        getAnchor: () => e.event,
                        getActions: () => this.getContextMenuActions(newCommentInfos, range),
                        getActionsContext: () => newCommentInfos.length ? newCommentInfos[0] : undefined,
                        onHide: () => { this._addInProgress = false; }
                    });
                    return Promise.resolve();
                }
                else {
                    const picks = this.getCommentProvidersQuickPicks(newCommentInfos);
                    return this.quickInputService.pick(picks, { placeHolder: nls.localize('pickCommentService', "Select Comment Provider"), matchOnDescription: true }).then(pick => {
                        if (!pick) {
                            return;
                        }
                        const commentInfos = newCommentInfos.filter(info => info.action.ownerId === pick.id);
                        if (commentInfos.length) {
                            const { ownerId } = commentInfos[0].action;
                            const clippedRange = range && commentInfos[0].range ? this.clipUserRangeToCommentRange(range, commentInfos[0].range) : range;
                            this.addCommentAtLine2(clippedRange, ownerId);
                        }
                    }).then(() => {
                        this._addInProgress = false;
                    });
                }
            }
            else {
                const { ownerId } = newCommentInfos[0].action;
                const clippedRange = range && newCommentInfos[0].range ? this.clipUserRangeToCommentRange(range, newCommentInfos[0].range) : range;
                this.addCommentAtLine2(clippedRange, ownerId);
            }
            return Promise.resolve();
        }
        getCommentProvidersQuickPicks(commentInfos) {
            const picks = commentInfos.map((commentInfo) => {
                const { ownerId, extensionId, label } = commentInfo.action;
                return {
                    label: label || extensionId,
                    id: ownerId
                };
            });
            return picks;
        }
        getContextMenuActions(commentInfos, commentRange) {
            const actions = [];
            commentInfos.forEach(commentInfo => {
                const { ownerId, extensionId, label } = commentInfo.action;
                actions.push(new actions_1.Action('addCommentThread', `${label || extensionId}`, undefined, true, () => {
                    const clippedRange = commentInfo.range ? this.clipUserRangeToCommentRange(commentRange, commentInfo.range) : commentRange;
                    this.addCommentAtLine2(clippedRange, ownerId);
                    return Promise.resolve();
                }));
            });
            return actions;
        }
        addCommentAtLine2(range, ownerId) {
            if (!this.editor) {
                return;
            }
            this.commentService.createCommentThreadTemplate(ownerId, this.editor.getModel().uri, range);
            this.processNextThreadToAdd();
            return;
        }
        getExistingCommentEditorOptions(editor) {
            const lineDecorationsWidth = editor.getOption(65 /* EditorOption.lineDecorationsWidth */);
            let extraEditorClassName = [];
            const configuredExtraClassName = editor.getRawOptions().extraEditorClassName;
            if (configuredExtraClassName) {
                extraEditorClassName = configuredExtraClassName.split(' ');
            }
            return { lineDecorationsWidth, extraEditorClassName };
        }
        getWithoutCommentsEditorOptions(editor, extraEditorClassName, startingLineDecorationsWidth) {
            let lineDecorationsWidth = startingLineDecorationsWidth;
            const inlineCommentPos = extraEditorClassName.findIndex(name => name === 'inline-comment');
            if (inlineCommentPos >= 0) {
                extraEditorClassName.splice(inlineCommentPos, 1);
            }
            const options = editor.getOptions();
            if (options.get(43 /* EditorOption.folding */) && options.get(109 /* EditorOption.showFoldingControls */) !== 'never') {
                lineDecorationsWidth += 11; // 11 comes from https://github.com/microsoft/vscode/blob/94ee5f58619d59170983f453fe78f156c0cc73a3/src/vs/workbench/contrib/comments/browser/media/review.css#L485
            }
            lineDecorationsWidth -= 24;
            return { extraEditorClassName, lineDecorationsWidth };
        }
        getWithCommentsEditorOptions(editor, extraEditorClassName, startingLineDecorationsWidth) {
            let lineDecorationsWidth = startingLineDecorationsWidth;
            const options = editor.getOptions();
            if (options.get(43 /* EditorOption.folding */) && options.get(109 /* EditorOption.showFoldingControls */) !== 'never') {
                lineDecorationsWidth -= 11;
            }
            lineDecorationsWidth += 24;
            extraEditorClassName.push('inline-comment');
            return { lineDecorationsWidth, extraEditorClassName };
        }
        updateEditorLayoutOptions(editor, extraEditorClassName, lineDecorationsWidth) {
            editor.updateOptions({
                extraEditorClassName: extraEditorClassName.join(' '),
                lineDecorationsWidth: lineDecorationsWidth
            });
        }
        tryUpdateReservedSpace() {
            if (!this.editor) {
                return;
            }
            const hasCommentsOrRanges = this._commentInfos.some(info => {
                const hasRanges = Boolean(info.commentingRanges && (Array.isArray(info.commentingRanges) ? info.commentingRanges : info.commentingRanges.ranges).length);
                return hasRanges || (info.threads.length > 0);
            });
            if (hasCommentsOrRanges && !this._commentingRangeSpaceReserved && this.commentService.isCommentingEnabled) {
                this._commentingRangeSpaceReserved = true;
                const { lineDecorationsWidth, extraEditorClassName } = this.getExistingCommentEditorOptions(this.editor);
                const newOptions = this.getWithCommentsEditorOptions(this.editor, extraEditorClassName, lineDecorationsWidth);
                this.updateEditorLayoutOptions(this.editor, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
            }
            else if ((!hasCommentsOrRanges || !this.commentService.isCommentingEnabled) && this._commentingRangeSpaceReserved) {
                this._commentingRangeSpaceReserved = false;
                const { lineDecorationsWidth, extraEditorClassName } = this.getExistingCommentEditorOptions(this.editor);
                const newOptions = this.getWithoutCommentsEditorOptions(this.editor, extraEditorClassName, lineDecorationsWidth);
                this.updateEditorLayoutOptions(this.editor, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
            }
        }
        setComments(commentInfos) {
            if (!this.editor || !this.commentService.isCommentingEnabled) {
                return;
            }
            this._commentInfos = commentInfos;
            this.tryUpdateReservedSpace();
            // create viewzones
            this.removeCommentWidgetsAndStoreCache();
            let hasCommentingRanges = false;
            this._commentInfos.forEach(info => {
                if (!hasCommentingRanges && (info.commentingRanges.ranges.length > 0 || info.commentingRanges.fileComments)) {
                    hasCommentingRanges = true;
                }
                const providerCacheStore = this._pendingNewCommentCache[info.owner];
                const providerEditsCacheStore = this._pendingEditsCache[info.owner];
                info.threads = info.threads.filter(thread => !thread.isDisposed);
                info.threads.forEach(thread => {
                    let pendingComment = undefined;
                    if (providerCacheStore) {
                        pendingComment = providerCacheStore[thread.threadId];
                    }
                    let pendingEdits = undefined;
                    if (providerEditsCacheStore) {
                        pendingEdits = providerEditsCacheStore[thread.threadId];
                    }
                    this.displayCommentThread(info.owner, thread, pendingComment, pendingEdits);
                });
                for (const thread of info.pendingCommentThreads ?? []) {
                    this.resumePendingComment(this.editor.getModel().uri, thread);
                }
            });
            this._commentingRangeDecorator.update(this.editor, this._commentInfos);
            this._commentThreadRangeDecorator.update(this.editor, this._commentInfos);
            if (hasCommentingRanges) {
                this._activeEditorHasCommentingRange.set(true);
            }
            else {
                this._activeEditorHasCommentingRange.set(false);
            }
        }
        closeWidget() {
            this._commentWidgets?.forEach(widget => widget.hide());
            if (this.editor) {
                this.editor.focus();
                this.editor.revealRangeInCenter(this.editor.getSelection());
            }
        }
        removeCommentWidgetsAndStoreCache() {
            if (this._commentWidgets) {
                this._commentWidgets.forEach(zone => {
                    const pendingComments = zone.getPendingComments();
                    const pendingNewComment = pendingComments.newComment;
                    const providerNewCommentCacheStore = this._pendingNewCommentCache[zone.owner];
                    let lastCommentBody;
                    if (zone.commentThread.comments && zone.commentThread.comments.length) {
                        const lastComment = zone.commentThread.comments[zone.commentThread.comments.length - 1];
                        if (typeof lastComment.body === 'string') {
                            lastCommentBody = lastComment.body;
                        }
                        else {
                            lastCommentBody = lastComment.body.value;
                        }
                    }
                    if (pendingNewComment && (pendingNewComment !== lastCommentBody)) {
                        if (!providerNewCommentCacheStore) {
                            this._pendingNewCommentCache[zone.owner] = {};
                        }
                        this._pendingNewCommentCache[zone.owner][zone.commentThread.threadId] = pendingNewComment;
                    }
                    else {
                        if (providerNewCommentCacheStore) {
                            delete providerNewCommentCacheStore[zone.commentThread.threadId];
                        }
                    }
                    const pendingEdits = pendingComments.edits;
                    const providerEditsCacheStore = this._pendingEditsCache[zone.owner];
                    if (Object.keys(pendingEdits).length > 0) {
                        if (!providerEditsCacheStore) {
                            this._pendingEditsCache[zone.owner] = {};
                        }
                        this._pendingEditsCache[zone.owner][zone.commentThread.threadId] = pendingEdits;
                    }
                    else if (providerEditsCacheStore) {
                        delete providerEditsCacheStore[zone.commentThread.threadId];
                    }
                    zone.dispose();
                });
            }
            this._commentWidgets = [];
        }
    };
    exports.CommentController = CommentController;
    exports.CommentController = CommentController = __decorate([
        __param(1, commentService_1.ICommentService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, viewsService_1.IViewsService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, editorService_1.IEditorService),
        __param(10, keybinding_1.IKeybindingService),
        __param(11, accessibility_1.IAccessibilityService)
    ], CommentController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRzQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2Q25GLFFBQUEsRUFBRSxHQUFHLHVCQUF1QixDQUFDO0lBYzFDLE1BQU0seUJBQXlCO1FBSzlCLElBQVcsRUFBRTtZQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBVyxFQUFFLENBQUMsRUFBc0I7WUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVELElBQVcsS0FBSztZQUNmLE9BQU87Z0JBQ04sZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsQ0FBQztnQkFDdEQsYUFBYSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsU0FBUyxFQUFFLENBQUM7YUFDaEQsQ0FBQztRQUNILENBQUM7UUFFRCxZQUFvQixPQUFvQixFQUFVLFFBQWdCLEVBQVUsWUFBZ0MsRUFBVSxNQUEwQixFQUFVLE1BQWMsRUFBa0IsT0FBK0IsRUFBVSxvQkFBZ0QsRUFBa0IsVUFBbUIsS0FBSztZQUF6UyxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFvQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQW9CO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUFrQixZQUFPLEdBQVAsT0FBTyxDQUF3QjtZQUFVLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBNEI7WUFBa0IsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7WUFDNVQsSUFBSSxDQUFDLGdCQUFnQixHQUFH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
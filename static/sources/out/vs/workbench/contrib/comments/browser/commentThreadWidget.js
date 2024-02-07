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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/languages", "vs/workbench/contrib/comments/browser/commentReply", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/commentThreadBody", "vs/workbench/contrib/comments/browser/commentThreadHeader", "vs/workbench/contrib/comments/browser/commentThreadAdditionalActions", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/contrib/comments/browser/commentColors", "vs/platform/contextview/browser/contextView", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/nls", "vs/platform/keybinding/common/keybinding", "vs/css!./media/review"], function (require, exports, dom, event_1, lifecycle_1, languages, commentReply_1, commentService_1, commentThreadBody_1, commentThreadHeader_1, commentThreadAdditionalActions_1, commentContextKeys_1, colorRegistry_1, theme_1, commentColors_1, contextView_1, widgetNavigationCommands_1, configuration_1, commentsConfiguration_1, nls_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentThreadWidget = exports.COMMENTEDITOR_DECORATION_KEY = void 0;
    exports.COMMENTEDITOR_DECORATION_KEY = 'commenteditordecoration';
    let CommentThreadWidget = class CommentThreadWidget extends lifecycle_1.Disposable {
        get commentThread() {
            return this._commentThread;
        }
        constructor(container, _parentEditor, _owner, _parentResourceUri, _contextKeyService, _scopedInstantiationService, _commentThread, _pendingComment, _pendingEdits, _markdownOptions, _commentOptions, _containerDelegate, commentService, contextMenuService, configurationService, _keybindingService) {
            super();
            this.container = container;
            this._parentEditor = _parentEditor;
            this._owner = _owner;
            this._parentResourceUri = _parentResourceUri;
            this._contextKeyService = _contextKeyService;
            this._scopedInstantiationService = _scopedInstantiationService;
            this._commentThread = _commentThread;
            this._pendingComment = _pendingComment;
            this._pendingEdits = _pendingEdits;
            this._markdownOptions = _markdownOptions;
            this._commentOptions = _commentOptions;
            this._containerDelegate = _containerDelegate;
            this.commentService = commentService;
            this.configurationService = configurationService;
            this._keybindingService = _keybindingService;
            this._commentThreadDisposables = [];
            this._onDidResize = new event_1.Emitter();
            this.onDidResize = this._onDidResize.event;
            this._threadIsEmpty = commentContextKeys_1.CommentContextKeys.commentThreadIsEmpty.bindTo(this._contextKeyService);
            this._threadIsEmpty.set(!_commentThread.comments || !_commentThread.comments.length);
            this._focusedContextKey = commentContextKeys_1.CommentContextKeys.commentFocused.bindTo(this._contextKeyService);
            this._commentMenus = this.commentService.getCommentMenus(this._owner);
            this._header = new commentThreadHeader_1.CommentThreadHeader(container, {
                collapse: this.collapse.bind(this)
            }, this._commentMenus, this._commentThread, this._contextKeyService, this._scopedInstantiationService, contextMenuService);
            this._header.updateCommentThread(this._commentThread);
            const bodyElement = dom.$('.body');
            container.appendChild(bodyElement);
            const tracker = this._register(dom.trackFocus(bodyElement));
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [tracker],
                focusNextWidget: () => {
                    if (!this._commentReply?.isCommentEditorFocused()) {
                        this._commentReply?.expandReplyAreaAndFocusCommentEditor();
                    }
                },
                focusPreviousWidget: () => {
                    if (this._commentReply?.isCommentEditorFocused() && this._commentThread.comments?.length) {
                        this._body.focus();
                    }
                }
            }));
            this._register(tracker.onDidFocus(() => this._focusedContextKey.set(true)));
            this._register(tracker.onDidBlur(() => this._focusedContextKey.reset()));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.comments" /* AccessibilityVerbositySettingId.Comments */)) {
                    this._setAriaLabel();
                }
            }));
            this._body = this._scopedInstantiationService.createInstance(commentThreadBody_1.CommentThreadBody, this._parentEditor, this._owner, this._parentResourceUri, bodyElement, this._markdownOptions, this._commentThread, this._pendingEdits, this._scopedInstantiationService, this);
            this._register(this._body);
            this._setAriaLabel();
            this._styleElement = dom.createStyleSheet(this.container);
            this._commentThreadContextValue = commentContextKeys_1.CommentContextKeys.commentThreadContext.bindTo(this._contextKeyService);
            this._commentThreadContextValue.set(_commentThread.contextValue);
            const commentControllerKey = commentContextKeys_1.CommentContextKeys.commentControllerContext.bindTo(this._contextKeyService);
            const controller = this.commentService.getCommentController(this._owner);
            if (controller?.contextValue) {
                commentControllerKey.set(controller.contextValue);
            }
            this.currentThreadListeners();
        }
        _setAriaLabel() {
            let ariaLabel = (0, nls_1.localize)('commentLabel', "Comment");
            let keybinding;
            const verbose = this.configurationService.getValue("accessibility.verbosity.comments" /* AccessibilityVerbositySettingId.Comments */);
            if (verbose) {
                keybinding = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */, this._contextKeyService)?.getLabel() ?? undefined;
            }
            if (keybinding) {
                ariaLabel = (0, nls_1.localize)('commentLabelWithKeybinding', "{0}, use ({1}) for accessibility help", ariaLabel, keybinding);
            }
            else {
                ariaLabel = (0, nls_1.localize)('commentLabelWithKeybindingNoKeybinding', "{0}, run the command Open Accessibility Help which is currently not triggerable via keybinding.", ariaLabel);
            }
            this._body.container.ariaLabel = ariaLabel;
        }
        updateCurrentThread(hasMouse, hasFocus) {
            if (hasMouse || hasFocus) {
                this.commentService.setCurrentCommentThread(this.commentThread);
            }
            else {
                this.commentService.setCurrentCommentThread(undefined);
            }
        }
        currentThreadListeners() {
            let hasMouse = false;
            let hasFocus = false;
            this._register(dom.addDisposableListener(this.container, dom.EventType.MOUSE_ENTER, (e) => {
                if (e.toElement === this.container) {
                    hasMouse = true;
                    this.updateCurrentThread(hasMouse, hasFocus);
                }
            }, true));
            this._register(dom.addDisposableListener(this.container, dom.EventType.MOUSE_LEAVE, (e) => {
                if (e.fromElement === this.container) {
                    hasMouse = false;
                    this.updateCurrentThread(hasMouse, hasFocus);
                }
            }, true));
            this._register(dom.addDisposableListener(this.container, dom.EventType.FOCUS_IN, () => {
                hasFocus = true;
                this.updateCurrentThread(hasMouse, hasFocus);
            }, true));
            this._register(dom.addDisposableListener(this.container, dom.EventType.FOCUS_OUT, () => {
                hasFocus = false;
                this.updateCurrentThread(hasMouse, hasFocus);
            }, true));
        }
        updateCommentThread(commentThread) {
            const shouldCollapse = (this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) && (this._commentThreadState === languages.CommentThreadState.Unresolved)
                && (commentThread.state === languages.CommentThreadState.Resolved);
            this._commentThreadState = commentThread.state;
            this._commentThread = commentThread;
            (0, lifecycle_1.dispose)(this._commentThreadDisposables);
            this._commentThreadDisposables = [];
            this._bindCommentThreadListeners();
            this._body.updateCommentThread(commentThread, this._commentReply?.isCommentEditorFocused() ?? false);
            this._threadIsEmpty.set(!this._body.length);
            this._header.updateCommentThread(commentThread);
            this._commentReply?.updateCommentThread(commentThread);
            if (this._commentThread.contextValue) {
                this._commentThreadContextValue.set(this._commentThread.contextValue);
            }
            else {
                this._commentThreadContextValue.reset();
            }
            if (shouldCollapse && this.configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION).collapseOnResolve) {
                this.collapse();
            }
        }
        display(lineHeight) {
            const headHeight = Math.max(23, Math.ceil(lineHeight * 1.2)); // 23 is the value of `Math.ceil(lineHeight * 1.2)` with the default editor font size
            this._header.updateHeight(headHeight);
            this._body.display();
            // create comment thread only when it supports reply
            if (this._commentThread.canReply) {
                this._createCommentForm();
            }
            this._createAdditionalActions();
            this._register(this._body.onDidResize(dimension => {
                this._refresh(dimension);
            }));
            // If there are no existing comments, place focus on the text area. This must be done after show, which also moves focus.
            // if this._commentThread.comments is undefined, it doesn't finish initialization yet, so we don't focus the editor immediately.
            if (this._commentThread.canReply && this._commentReply) {
                this._commentReply.focusIfNeeded();
            }
            this._bindCommentThreadListeners();
        }
        _refresh(dimension) {
            this._body.layout();
            this._onDidResize.fire(dimension);
        }
        dispose() {
            super.dispose();
            this.updateCurrentThread(false, false);
        }
        _bindCommentThreadListeners() {
            this._commentThreadDisposables.push(this._commentThread.onDidChangeCanReply(() => {
                if (this._commentReply) {
                    this._commentReply.updateCanReply();
                }
                else {
                    if (this._commentThread.canReply) {
                        this._createCommentForm();
                    }
                }
            }));
            this._commentThreadDisposables.push(this._commentThread.onDidChangeComments(async (_) => {
                await this.updateCommentThread(this._commentThread);
            }));
            this._commentThreadDisposables.push(this._commentThread.onDidChangeLabel(_ => {
                this._header.createThreadLabel();
            }));
        }
        _createCommentForm() {
            this._commentReply = this._scopedInstantiationService.createInstance(commentReply_1.CommentReply, this._owner, this._body.container, this._parentEditor, this._commentThread, this._scopedInstantiationService, this._contextKeyService, this._commentMenus, this._commentOptions, this._pendingComment, this, this._containerDelegate.actionRunner);
            this._register(this._commentReply);
        }
        _createAdditionalActions() {
            this._additionalActions = this._scopedInstantiationService.createInstance(commentThreadAdditionalActions_1.CommentThreadAdditionalActions, this._body.container, this._commentThread, this._contextKeyService, this._commentMenus, this._containerDelegate.actionRunner);
            this._register(this._additionalActions);
        }
        getCommentCoords(commentUniqueId) {
            return this._body.getCommentCoords(commentUniqueId);
        }
        getPendingEdits() {
            return this._body.getPendingEdits();
        }
        getPendingComment() {
            if (this._commentReply) {
                return this._commentReply.getPendingComment();
            }
            return undefined;
        }
        setPendingComment(comment) {
            this._pendingComment = comment;
            this._commentReply?.setPendingComment(comment);
        }
        getDimensions() {
            return this._body.getDimensions();
        }
        layout(widthInPixel) {
            this._body.layout(widthInPixel);
            if (widthInPixel !== undefined) {
                this._commentReply?.layout(widthInPixel);
            }
        }
        focusCommentEditor() {
            this._commentReply?.focusCommentEditor();
        }
        focus() {
            this._body.focus();
        }
        async submitComment() {
            const activeComment = this._body.activeComment;
            if (activeComment) {
                return activeComment.submitComment();
            }
            else if ((this._commentReply?.getPendingComment()?.length ?? 0) > 0) {
                return this._commentReply?.submitComment();
            }
        }
        collapse() {
            this._containerDelegate.collapse();
        }
        applyTheme(theme, fontInfo) {
            const content = [];
            content.push(`.monaco-editor .review-widget > .body { border-top: 1px solid var(${commentColors_1.commentThreadStateColorVar}) }`);
            content.push(`.monaco-editor .review-widget > .head { background-color: var(${commentColors_1.commentThreadStateBackgroundColorVar}) }`);
            const linkColor = theme.getColor(colorRegistry_1.textLinkForeground);
            if (linkColor) {
                content.push(`.review-widget .body .comment-body a { color: ${linkColor} }`);
            }
            const linkActiveColor = theme.getColor(colorRegistry_1.textLinkActiveForeground);
            if (linkActiveColor) {
                content.push(`.review-widget .body .comment-body a:hover, a:active { color: ${linkActiveColor} }`);
            }
            const focusColor = theme.getColor(colorRegistry_1.focusBorder);
            if (focusColor) {
                content.push(`.review-widget .body .comment-body a:focus { outline: 1px solid ${focusColor}; }`);
                content.push(`.review-widget .body .monaco-editor.focused { outline: 1px solid ${focusColor}; }`);
            }
            const blockQuoteBackground = theme.getColor(colorRegistry_1.textBlockQuoteBackground);
            if (blockQuoteBackground) {
                content.push(`.review-widget .body .review-comment blockquote { background: ${blockQuoteBackground}; }`);
            }
            const blockQuoteBOrder = theme.getColor(colorRegistry_1.textBlockQuoteBorder);
            if (blockQuoteBOrder) {
                content.push(`.review-widget .body .review-comment blockquote { border-color: ${blockQuoteBOrder}; }`);
            }
            const border = theme.getColor(theme_1.PANEL_BORDER);
            if (border) {
                content.push(`.review-widget .body .review-comment .review-comment-contents .comment-reactions .action-item a.action-label { border-color: ${border}; }`);
            }
            const hcBorder = theme.getColor(colorRegistry_1.contrastBorder);
            if (hcBorder) {
                content.push(`.review-widget .body .comment-form .review-thread-reply-button { outline-color: ${hcBorder}; }`);
                content.push(`.review-widget .body .monaco-editor { outline: 1px solid ${hcBorder}; }`);
            }
            const errorBorder = theme.getColor(colorRegistry_1.inputValidationErrorBorder);
            if (errorBorder) {
                content.push(`.review-widget .validation-error { border: 1px solid ${errorBorder}; }`);
            }
            const errorBackground = theme.getColor(colorRegistry_1.inputValidationErrorBackground);
            if (errorBackground) {
                content.push(`.review-widget .validation-error { background: ${errorBackground}; }`);
            }
            const errorForeground = theme.getColor(colorRegistry_1.inputValidationErrorForeground);
            if (errorForeground) {
                content.push(`.review-widget .body .comment-form .validation-error { color: ${errorForeground}; }`);
            }
            const fontFamilyVar = '--comment-thread-editor-font-family';
            const fontSizeVar = '--comment-thread-editor-font-size';
            const fontWeightVar = '--comment-thread-editor-font-weight';
            this.container?.style.setProperty(fontFamilyVar, fontInfo.fontFamily);
            this.container?.style.setProperty(fontSizeVar, `${fontInfo.fontSize}px`);
            this.container?.style.setProperty(fontWeightVar, fontInfo.fontWeight);
            content.push(`.review-widget .body code {
			font-family: var(${fontFamilyVar});
			font-weight: var(${fontWeightVar});
		}`);
            this._styleElement.textContent = content.join('\n');
            this._commentReply?.setCommentEditorDecorations();
        }
    };
    exports.CommentThreadWidget = CommentThreadWidget;
    exports.CommentThreadWidget = CommentThreadWidget = __decorate([
        __param(12, commentService_1.ICommentService),
        __param(13, contextView_1.IContextMenuService),
        __param(14, configuration_1.IConfigurationService),
        __param(15, keybinding_1.IKeybindingService)
    ], CommentThreadWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFRocmVhZFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50VGhyZWFkV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9DbkYsUUFBQSw0QkFBNEIsR0FBRyx5QkFBeUIsQ0FBQztJQUcvRCxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUE0RCxTQUFRLHNCQUFVO1FBZ0IxRixJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzVCLENBQUM7UUFDRCxZQUNVLFNBQXNCLEVBQ3RCLGFBQStCLEVBQ2hDLE1BQWMsRUFDZCxrQkFBdUIsRUFDdkIsa0JBQXNDLEVBQ3RDLDJCQUFrRCxFQUNsRCxjQUEwQyxFQUMxQyxlQUFtQyxFQUNuQyxhQUFvRCxFQUNwRCxnQkFBMEMsRUFDMUMsZUFBcUQsRUFDckQsa0JBR1AsRUFDZ0IsY0FBdUMsRUFDbkMsa0JBQXVDLEVBQ3JDLG9CQUFtRCxFQUN0RCxrQkFBOEM7WUFFbEUsS0FBSyxFQUFFLENBQUM7WUFwQkMsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUN0QixrQkFBYSxHQUFiLGFBQWEsQ0FBa0I7WUFDaEMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNkLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBSztZQUN2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3RDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBdUI7WUFDbEQsbUJBQWMsR0FBZCxjQUFjLENBQTRCO1lBQzFDLG9CQUFlLEdBQWYsZUFBZSxDQUFvQjtZQUNuQyxrQkFBYSxHQUFiLGFBQWEsQ0FBdUM7WUFDcEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUEwQjtZQUMxQyxvQkFBZSxHQUFmLGVB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
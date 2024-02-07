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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/editor/common/languages", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/simpleCommentEditor", "vs/editor/common/core/selection", "vs/base/common/event", "vs/platform/notification/common/notification", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/contextview/browser/contextView", "./reactionsAction", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/comments/browser/commentFormActions", "vs/base/browser/ui/mouseCursor/mouseCursor", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/contrib/comments/browser/timestamp", "vs/platform/configuration/common/configuration", "vs/base/common/scrollable", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/event", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/base/common/network", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/base/browser/mouseEvent", "vs/platform/accessibility/common/accessibility"], function (require, exports, nls, dom, languages, actionbar_1, actions_1, lifecycle_1, uri_1, model_1, language_1, instantiation_1, commentService_1, simpleCommentEditor_1, selection_1, event_1, notification_1, toolbar_1, contextView_1, reactionsAction_1, actions_2, menuEntryActionViewItem_1, contextkey_1, commentFormActions_1, mouseCursor_1, actionViewItems_1, dropdownActionViewItem_1, codicons_1, themables_1, timestamp_1, configuration_1, scrollable_1, scrollableElement_1, event_2, commentContextKeys_1, network_1, commentsConfiguration_1, mouseEvent_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentNode = void 0;
    class CommentsActionRunner extends actions_1.ActionRunner {
        async runAction(action, context) {
            await action.run(...context);
        }
    }
    let CommentNode = class CommentNode extends lifecycle_1.Disposable {
        get domNode() {
            return this._domNode;
        }
        constructor(parentEditor, commentThread, comment, pendingEdit, owner, resource, parentThread, markdownRenderer, instantiationService, commentService, modelService, languageService, notificationService, contextMenuService, contextKeyService, configurationService, accessibilityService) {
            super();
            this.parentEditor = parentEditor;
            this.commentThread = commentThread;
            this.comment = comment;
            this.pendingEdit = pendingEdit;
            this.owner = owner;
            this.resource = resource;
            this.parentThread = parentThread;
            this.markdownRenderer = markdownRenderer;
            this.instantiationService = instantiationService;
            this.commentService = commentService;
            this.modelService = modelService;
            this.languageService = languageService;
            this.notificationService = notificationService;
            this.contextMenuService = contextMenuService;
            this.configurationService = configurationService;
            this.accessibilityService = accessibilityService;
            this._editAction = null;
            this._commentEditContainer = null;
            this._commentEditor = null;
            this._commentEditorDisposables = [];
            this._commentEditorModel = null;
            this._editorHeight = simpleCommentEditor_1.MIN_EDITOR_HEIGHT;
            this._commentFormActions = null;
            this._commentEditorActions = null;
            this._onDidClick = new event_1.Emitter();
            this.isEditing = false;
            this._domNode = dom.$('div.review-comment');
            this._contextKeyService = contextKeyService.createScoped(this._domNode);
            this._commentContextValue = commentContextKeys_1.CommentContextKeys.commentContext.bindTo(this._contextKeyService);
            if (this.comment.contextValue) {
                this._commentContextValue.set(this.comment.contextValue);
            }
            this._commentMenus = this.commentService.getCommentMenus(this.owner);
            this._domNode.tabIndex = -1;
            const avatar = dom.append(this._domNode, dom.$('div.avatar-container'));
            if (comment.userIconPath) {
                const img = dom.append(avatar, dom.$('img.avatar'));
                img.src = network_1.FileAccess.uriToBrowserUri(uri_1.URI.revive(comment.userIconPath)).toString(true);
                img.onerror = _ => img.remove();
            }
            this._commentDetailsContainer = dom.append(this._domNode, dom.$('.review-comment-contents'));
            this.createHeader(this._commentDetailsContainer);
            this._body = document.createElement(`div`);
            this._body.classList.add('comment-body', mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME);
            if (configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION)?.maxHeight !== false) {
                this._body.classList.add('comment-body-max-height');
            }
            this.createScroll(this._commentDetailsContainer, this._body);
            this.updateCommentBody(this.comment.body);
            if (this.comment.commentReactions && this.comment.commentReactions.length && this.comment.commentReactions.filter(reaction => !!reaction.count).length) {
                this.createReactionsContainer(this._commentDetailsContainer);
            }
            this._domNode.setAttribute('aria-label', `${comment.userName}, ${this.commentBodyValue}`);
            this._domNode.setAttribute('role', 'treeitem');
            this._clearTimeout = null;
            this._register(dom.addDisposableListener(this._domNode, dom.EventType.CLICK, () => this.isEditing || this._onDidClick.fire(this)));
            this._register(dom.addDisposableListener(this._domNode, dom.EventType.CONTEXT_MENU, e => {
                return this.onContextMenu(e);
            }));
            if (pendingEdit) {
                this.switchToEditMode();
            }
            this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => {
                this.toggleToolbarHidden(true);
            }));
        }
        createScroll(container, body) {
            this._scrollable = new scrollable_1.Scrollable({
                forceIntegerValues: true,
                smoothScrollDuration: 125,
                scheduleAtNextAnimationFrame: cb => dom.scheduleAtNextAnimationFrame(dom.getWindow(container), cb)
            });
            this._scrollableElement = this._register(new scrollableElement_1.SmoothScrollableElement(body, {
                horizontal: 3 /* ScrollbarVisibility.Visible */,
                vertical: 3 /* ScrollbarVisibility.Visible */
            }, this._scrollable));
            this._register(this._scrollableElement.onScroll(e => {
                if (e.scrollLeftChanged) {
                    body.scrollLeft = e.scrollLeft;
                }
                if (e.scrollTopChanged) {
                    body.scrollTop = e.scrollTop;
                }
            }));
            const onDidScrollViewContainer = this._register(new event_2.DomEmitter(body, 'scroll')).event;
            this._register(onDidScrollViewContainer(_ => {
                const position = this._scrollableElement.getScrollPosition();
                const scrollLeft = Math.abs(body.scrollLeft - position.scrollLeft) <= 1 ? undefined : body.scrollLeft;
                const scrollTop = Math.abs(body.scrollTop - position.scrollTop) <= 1 ? undefined : body.scrollTop;
                if (scrollLeft !== undefined || scrollTop !== undefined) {
                    this._scrollableElement.setScrollPosition({ scrollLeft, scrollTop });
                }
            }));
            container.appendChild(this._scrollableElement.getDomNode());
        }
        updateCommentBody(body) {
            this._body.innerText = '';
            this._md = undefined;
            this._plainText = undefined;
            if (typeof body === 'string') {
                this._plainText = dom.append(this._body, dom.$('.comment-body-plainstring'));
                this._plainText.innerText = body;
            }
            else {
                this._md = this.markdownRenderer.render(body).element;
                this._body.appendChild(this._md);
            }
        }
        get onDidClick() {
            return this._onDidClick.event;
        }
        createTimestamp(container) {
            this._timestamp = dom.append(container, dom.$('span.timestamp-container'));
            this.updateTimestamp(this.comment.timestamp);
        }
        updateTimestamp(raw) {
            if (!this._timestamp) {
                return;
            }
            const timestamp = raw !== undefined ? new Date(raw) : undefined;
            if (!timestamp) {
                this._timestampWidget?.dispose();
            }
            else {
                if (!this._timestampWidget) {
                    this._timestampWidget = new timestamp_1.TimestampWidget(this.configurationService, this._timestamp, timestamp);
                    this._register(this._timestampWidget);
                }
                else {
                    this._timestampWidget.setTimestamp(timestamp);
                }
            }
        }
        createHeader(commentDetailsContainer) {
            const header = dom.append(commentDetailsContainer, dom.$(`div.comment-title.${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
            const infoContainer = dom.append(header, dom.$('comment-header-info'));
            const author = dom.append(infoContainer, dom.$('strong.author'));
            author.innerText = this.comment.userName;
            this.createTimestamp(infoContainer);
            this._isPendingLabel = dom.append(infoContainer, dom.$('span.isPending'));
            if (this.comment.label) {
                this._isPendingLabel.innerText = this.comment.label;
            }
            else {
                this._isPendingLabel.innerText = '';
            }
            this._actionsToolbarContainer = dom.append(header, dom.$('.comment-actions'));
            this.toggleToolbarHidden(true);
            this.createActionsToolbar();
        }
        toggleToolbarHidden(hidden) {
            if (hidden && !this.accessibilityService.isScreenReaderOptimized()) {
                this._actionsToolbarContainer.classList.add('hidden');
            }
            else {
                this._actionsToolbarContainer.classList.remove('hidden');
            }
        }
        getToolbarActions(menu) {
            const contributedActions = menu.getActions({ shouldForwardArgs: true });
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            fillInActions(contributedActions, result, false, g => /^inline/.test(g));
            return result;
        }
        get commentNodeContext() {
            return [{
                    thread: this.commentThread,
                    commentUniqueId: this.comment.uniqueIdInThread,
                    $mid: 10 /* MarshalledId.CommentNode */
                },
                {
                    commentControlHandle: this.commentThread.controllerHandle,
                    commentThreadHandle: this.commentThread.commentThreadHandle,
                    $mid: 7 /* MarshalledId.CommentThread */
                }];
        }
        createToolbar() {
            this.toolbar = new toolbar_1.ToolBar(this._actionsToolbarContainer, this.contextMenuService, {
                actionViewItemProvider: action => {
                    if (action.id === reactionsAction_1.ToggleReactionsAction.ID) {
                        return new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, action.menuActions, this.contextMenuService, {
                            actionViewItemProvider: action => this.actionViewItemProvider(action),
                            actionRunner: this.actionRunner,
                            classNames: ['toolbar-toggle-pickReactions', ...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.reactions)],
                            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
                        });
                    }
                    return this.actionViewItemProvider(action);
                },
                orientation: 0 /* ActionsOrientation.HORIZONTAL */
            });
            this.toolbar.context = this.commentNodeContext;
            this.toolbar.actionRunner = new CommentsActionRunner();
            this.registerActionBarListeners(this._actionsToolbarContainer);
            this._register(this.toolbar);
        }
        createActionsToolbar() {
            const actions = [];
            const hasReactionHandler = this.commentService.hasReactionHandler(this.owner);
            if (hasReactionHandler) {
                const toggleReactionAction = this.createReactionPicker(this.comment.commentReactions || []);
                actions.push(toggleReactionAction);
            }
            const menu = this._commentMenus.getCommentTitleActions(this.comment, this._contextKeyService);
            this._register(menu);
            this._register(menu.onDidChange(e => {
                const { primary, secondary } = this.getToolbarActions(menu);
                if (!this.toolbar && (primary.length || secondary.length)) {
                    this.createToolbar();
                }
                this.toolbar.setActions(primary, secondary);
            }));
            const { primary, secondary } = this.getToolbarActions(menu);
            actions.push(...primary);
            if (actions.length || secondary.length) {
                this.createToolbar();
                this.toolbar.setActions(actions, secondary);
            }
        }
        actionViewItemProvider(action) {
            let options = {};
            if (action.id === reactionsAction_1.ToggleReactionsAction.ID) {
                options = { label: false, icon: true };
            }
            else {
                options = { label: false, icon: true };
            }
            if (action.id === reactionsAction_1.ReactionAction.ID) {
                const item = new reactionsAction_1.ReactionActionViewItem(action);
                return item;
            }
            else if (action instanceof actions_2.MenuItemAction) {
                return this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined);
            }
            else if (action instanceof actions_2.SubmenuItemAction) {
                return this.instantiationService.createInstance(menuEntryActionViewItem_1.SubmenuEntryActionViewItem, action, undefined);
            }
            else {
                const item = new actionViewItems_1.ActionViewItem({}, action, options);
                return item;
            }
        }
        async submitComment() {
            if (this._commentEditor && this._commentFormActions) {
                await this._commentFormActions.triggerDefaultAction();
                this.pendingEdit = undefined;
            }
        }
        createReactionPicker(reactionGroup) {
            const toggleReactionAction = this._register(new reactionsAction_1.ToggleReactionsAction(() => {
                toggleReactionActionViewItem?.show();
            }, nls.localize('commentToggleReaction', "Toggle Reaction")));
            let reactionMenuActions = [];
            if (reactionGroup && reactionGroup.length) {
                reactionMenuActions = reactionGroup.map((reaction) => {
                    return new actions_1.Action(`reaction.command.${reaction.label}`, `${reaction.label}`, '', true, async () => {
                        try {
                            await this.commentService.toggleReaction(this.owner, this.resource, this.commentThread, this.comment, reaction);
                        }
                        catch (e) {
                            const error = e.message
                                ? nls.localize('commentToggleReactionError', "Toggling the comment reaction failed: {0}.", e.message)
                                : nls.localize('commentToggleReactionDefaultError', "Toggling the comment reaction failed");
                            this.notificationService.error(error);
                        }
                    });
                });
            }
            toggleReactionAction.menuActions = reactionMenuActions;
            const toggleReactionActionViewItem = new dropdownActionViewItem_1.DropdownMenuActionViewItem(toggleReactionAction, toggleReactionAction.menuActions, this.contextMenuService, {
                actionViewItemProvider: action => {
                    if (action.id === reactionsAction_1.ToggleReactionsAction.ID) {
                        return toggleReactionActionViewItem;
                    }
                    return this.actionViewItemProvider(action);
                },
                actionRunner: this.actionRunner,
                classNames: 'toolbar-toggle-pickReactions',
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
            });
            return toggleReactionAction;
        }
        createReactionsContainer(commentDetailsContainer) {
            this._reactionActionsContainer = dom.append(commentDetailsContainer, dom.$('div.comment-reactions'));
            this._reactionsActionBar = new actionbar_1.ActionBar(this._reactionActionsContainer, {
                actionViewItemProvider: action => {
                    if (action.id === reactionsAction_1.ToggleReactionsAction.ID) {
                        return new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, action.menuActions, this.contextMenuService, {
                            actionViewItemProvider: action => this.actionViewItemProvider(action),
                            actionRunner: this.actionRunner,
                            classNames: ['toolbar-toggle-pickReactions', ...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.reactions)],
                            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
                        });
                    }
                    return this.actionViewItemProvider(action);
                }
            });
            this._register(this._reactionsActionBar);
            const hasReactionHandler = this.commentService.hasReactionHandler(this.owner);
            this.comment.commentReactions.filter(reaction => !!reaction.count).map(reaction => {
                const action = new reactionsAction_1.ReactionAction(`reaction.${reaction.label}`, `${reaction.label}`, reaction.hasReacted && (reaction.canEdit || hasReactionHandler) ? 'active' : '', (reaction.canEdit || hasReactionHandler), async () => {
                    try {
                        await this.commentService.toggleReaction(this.owner, this.resource, this.commentThread, this.comment, reaction);
                    }
                    catch (e) {
                        let error;
                        if (reaction.hasReacted) {
                            error = e.message
                                ? nls.localize('commentDeleteReactionError', "Deleting the comment reaction failed: {0}.", e.message)
                                : nls.localize('commentDeleteReactionDefaultError', "Deleting the comment reaction failed");
                        }
                        else {
                            error = e.message
                                ? nls.localize('commentAddReactionError', "Deleting the comment reaction failed: {0}.", e.message)
                                : nls.localize('commentAddReactionDefaultError', "Deleting the comment reaction failed");
                        }
                        this.notificationService.error(error);
                    }
                }, reaction.reactors, reaction.iconPath, reaction.count);
                this._reactionsActionBar?.push(action, { label: true, icon: true });
            });
            if (hasReactionHandler) {
                const toggleReactionAction = this.createReactionPicker(this.comment.commentReactions || []);
                this._reactionsActionBar.push(toggleReactionAction, { label: false, icon: true });
            }
        }
        get commentBodyValue() {
            return (typeof this.comment.body === 'string') ? this.comment.body : this.comment.body.value;
        }
        createCommentEditor(editContainer) {
            const container = dom.append(editContainer, dom.$('.edit-textarea'));
            this._commentEditor = this.instantiationService.createInstance(simpleCommentEditor_1.SimpleCommentEditor, container, simpleCommentEditor_1.SimpleCommentEditor.getEditorOptions(this.configurationService), this._contextKeyService, this.parentThread);
            const resource = uri_1.URI.parse(`comment:commentinput-${this.comment.uniqueIdInThread}-${Date.now()}.md`);
            this._commentEditorModel = this.modelService.createModel('', this.languageService.createByFilepathOrFirstLine(resource), resource, false);
            this._commentEditor.setModel(this._commentEditorModel);
            this._commentEditor.setValue(this.pendingEdit ?? this.commentBodyValue);
            this.pendingEdit = undefined;
            this._commentEditor.layout({ width: container.clientWidth - 14, height: this._editorHeight });
            this._commentEditor.focus();
            dom.scheduleAtNextAnimationFrame(dom.getWindow(editContainer), () => {
                this._commentEditor.layout({ width: container.clientWidth - 14, height: this._editorHeight });
                this._commentEditor.focus();
            });
            const lastLine = this._commentEditorModel.getLineCount();
            const lastColumn = this._commentEditorModel.getLineLength(lastLine) + 1;
            this._commentEditor.setSelection(new selection_1.Selection(lastLine, lastColumn, lastLine, lastColumn));
            const commentThread = this.commentThread;
            commentThread.input = {
                uri: this._commentEditor.getModel().uri,
                value: this.commentBodyValue
            };
            this.commentService.setActiveCommentThread(commentThread);
            this._commentEditorDisposables.push(this._commentEditor.onDidFocusEditorWidget(() => {
                commentThread.input = {
                    uri: this._commentEditor.getModel().uri,
                    value: this.commentBodyValue
                };
                this.commentService.setActiveCommentThread(commentThread);
            }));
            this._commentEditorDisposables.push(this._commentEditor.onDidChangeModelContent(e => {
                if (commentThread.input && this._commentEditor && this._commentEditor.getModel().uri === commentThread.input.uri) {
                    const newVal = this._commentEditor.getValue();
                    if (newVal !== commentThread.input.value) {
                        const input = commentThread.input;
                        input.value = newVal;
                        commentThread.input = input;
                        this.commentService.setActiveCommentThread(commentThread);
                    }
                }
            }));
            this.calculateEditorHeight();
            this._register((this._commentEditorModel.onDidChangeContent(() => {
                if (this._commentEditor && this.calculateEditorHeight()) {
                    this._commentEditor.layout({ height: this._editorHeight, width: this._commentEditor.getLayoutInfo().width });
                    this._commentEditor.render(true);
                }
            })));
            this._register(this._commentEditor);
            this._register(this._commentEditorModel);
        }
        calculateEditorHeight() {
            if (this._commentEditor) {
                const newEditorHeight = (0, simpleCommentEditor_1.calculateEditorHeight)(this.parentEditor, this._commentEditor, this._editorHeight);
                if (newEditorHeight !== this._editorHeight) {
                    this._editorHeight = newEditorHeight;
                    return true;
                }
            }
            return false;
        }
        getPendingEdit() {
            const model = this._commentEditor?.getModel();
            if (model && model.getValueLength() > 0) {
                return model.getValue();
            }
            return undefined;
        }
        removeCommentEditor() {
            this.isEditing = false;
            if (this._editAction) {
                this._editAction.enabled = true;
            }
            this._body.classList.remove('hidden');
            this._commentEditorModel?.dispose();
            this._commentEditorDisposables.forEach(dispose => dispose.dispose());
            this._commentEditorDisposables = [];
            if (this._commentEditor) {
                this._commentEditor.dispose();
                this._commentEditor = null;
            }
            this._commentEditContainer.remove();
        }
        layout(widthInPixel) {
            const editorWidth = widthInPixel !== undefined ? widthInPixel - 72 /* - margin and scrollbar*/ : (this._commentEditor?.getLayoutInfo().width ?? 0);
            this._commentEditor?.layout({ width: editorWidth, height: this._editorHeight });
            const scrollWidth = this._body.scrollWidth;
            const width = dom.getContentWidth(this._body);
            const scrollHeight = this._body.scrollHeight;
            const height = dom.getContentHeight(this._body) + 4;
            this._scrollableElement.setScrollDimensions({ width, scrollWidth, height, scrollHeight });
        }
        switchToEditMode() {
            if (this.isEditing) {
                return;
            }
            this.isEditing = true;
            this._body.classList.add('hidden');
            this._commentEditContainer = dom.append(this._commentDetailsContainer, dom.$('.edit-container'));
            this.createCommentEditor(this._commentEditContainer);
            const formActions = dom.append(this._commentEditContainer, dom.$('.form-actions'));
            const otherActions = dom.append(formActions, dom.$('.other-actions'));
            this.createCommentWidgetFormActions(otherActions);
            const editorActions = dom.append(formActions, dom.$('.editor-actions'));
            this.createCommentWidgetEditorActions(editorActions);
        }
        createCommentWidgetFormActions(container) {
            const menus = this.commentService.getCommentMenus(this.owner);
            const menu = menus.getCommentActions(this.comment, this._contextKeyService);
            this._register(menu);
            this._register(menu.onDidChange(() => {
                this._commentFormActions?.setActions(menu);
            }));
            this._commentFormActions = new commentFormActions_1.CommentFormActions(container, (action) => {
                const text = this._commentEditor.getValue();
                action.run({
                    thread: this.commentThread,
                    commentUniqueId: this.comment.uniqueIdInThread,
                    text: text,
                    $mid: 11 /* MarshalledId.CommentThreadNode */
                });
                this.removeCommentEditor();
            });
            this._register(this._commentFormActions);
            this._commentFormActions.setActions(menu);
        }
        createCommentWidgetEditorActions(container) {
            const menus = this.commentService.getCommentMenus(this.owner);
            const menu = menus.getCommentEditorActions(this._contextKeyService);
            this._register(menu);
            this._register(menu.onDidChange(() => {
                this._commentEditorActions?.setActions(menu);
            }));
            this._commentEditorActions = new commentFormActions_1.CommentFormActions(container, (action) => {
                const text = this._commentEditor.getValue();
                action.run({
                    thread: this.commentThread,
                    commentUniqueId: this.comment.uniqueIdInThread,
                    text: text,
                    $mid: 11 /* MarshalledId.CommentThreadNode */
                });
                this._commentEditor?.focus();
            });
            this._register(this._commentEditorActions);
            this._commentEditorActions.setActions(menu, true);
        }
        setFocus(focused, visible = false) {
            if (focused) {
                this._domNode.focus();
                this.toggleToolbarHidden(false);
                this._actionsToolbarContainer.classList.add('tabfocused');
                this._domNode.tabIndex = 0;
                if (this.comment.mode === languages.CommentMode.Editing) {
                    this._commentEditor?.focus();
                }
            }
            else {
                if (this._actionsToolbarContainer.classList.contains('tabfocused') && !this._actionsToolbarContainer.classList.contains('mouseover')) {
                    this.toggleToolbarHidden(true);
                    this._domNode.tabIndex = -1;
                }
                this._actionsToolbarContainer.classList.remove('tabfocused');
            }
        }
        registerActionBarListeners(actionsContainer) {
            this._register(dom.addDisposableListener(this._domNode, 'mouseenter', () => {
                this.toggleToolbarHidden(false);
                actionsContainer.classList.add('mouseover');
            }));
            this._register(dom.addDisposableListener(this._domNode, 'mouseleave', () => {
                if (actionsContainer.classList.contains('mouseover') && !actionsContainer.classList.contains('tabfocused')) {
                    this.toggleToolbarHidden(true);
                }
                actionsContainer.classList.remove('mouseover');
            }));
        }
        update(newComment) {
            if (newComment.body !== this.comment.body) {
                this.updateCommentBody(newComment.body);
            }
            const isChangingMode = newComment.mode !== undefined && newComment.mode !== this.comment.mode;
            this.comment = newComment;
            if (isChangingMode) {
                if (newComment.mode === languages.CommentMode.Editing) {
                    this.switchToEditMode();
                }
                else {
                    this.removeCommentEditor();
                }
            }
            if (newComment.label) {
                this._isPendingLabel.innerText = newComment.label;
            }
            else {
                this._isPendingLabel.innerText = '';
            }
            // update comment reactions
            this._reactionActionsContainer?.remove();
            this._reactionsActionBar?.clear();
            if (this.comment.commentReactions && this.comment.commentReactions.some(reaction => !!reaction.count)) {
                this.createReactionsContainer(this._commentDetailsContainer);
            }
            if (this.comment.contextValue) {
                this._commentContextValue.set(this.comment.contextValue);
            }
            else {
                this._commentContextValue.reset();
            }
            if (this.comment.timestamp) {
                this.updateTimestamp(this.comment.timestamp);
            }
        }
        onContextMenu(e) {
            const event = new mouseEvent_1.StandardMouseEvent(dom.getWindow(this._domNode), e);
            this.contextMenuService.showContextMenu({
                getAnchor: () => event,
                menuId: actions_2.MenuId.CommentThreadCommentContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: this._contextKeyService,
                actionRunner: new CommentsActionRunner(),
                getActionsContext: () => {
                    return this.commentNodeContext;
                },
            });
        }
        focus() {
            this.domNode.focus();
            if (!this._clearTimeout) {
                this.domNode.classList.add('focus');
                this._clearTimeout = setTimeout(() => {
                    this.domNode.classList.remove('focus');
                }, 3000);
            }
        }
    };
    exports.CommentNode = CommentNode;
    exports.CommentNode = CommentNode = __decorate([
        __param(8, instantiation_1.IInstantiationService),
        __param(9, commentService_1.ICommentService),
        __param(10, model_1.IModelService),
        __param(11, language_1.ILanguageService),
        __param(12, notification_1.INotificationService),
        __param(13, contextView_1.IContextMenuService),
        __param(14, contextkey_1.IContextKeyService),
        __param(15, configuration_1.IConfigurationService),
        __param(16, accessibility_1.IAccessibilityService)
    ], CommentNode);
    function fillInActions(groups, target, useAlternativeActions, isPrimaryGroup = group => group === 'navigation') {
        for (const tuple of groups) {
            let [group, actions] = tuple;
            if (useAlternativeActions) {
                actions = actions.map(a => (a instanceof actions_2.MenuItemAction) && !!a.alt ? a.alt : a);
            }
            if (isPrimaryGroup(group)) {
                const to = Array.isArray(target) ? target : target.primary;
                to.unshift(...actions);
            }
            else {
                const to = Array.isArray(target) ? target : target.secondary;
                if (to.length > 0) {
                    to.push(new actions_1.Separator());
                }
                to.push(...actions);
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudE5vZGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbW1lbnRzL2Jyb3dzZXIvY29tbWVudE5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaURoRyxNQUFNLG9CQUFxQixTQUFRLHNCQUFZO1FBQzNCLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBZSxFQUFFLE9BQWM7WUFDakUsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDOUIsQ0FBQztLQUNEO0lBRU0sSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBMkMsU0FBUSxzQkFBVTtRQW1DekUsSUFBVyxPQUFPO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBSUQsWUFDa0IsWUFBOEIsRUFDdkMsYUFBeUMsRUFDMUMsT0FBMEIsRUFDekIsV0FBK0IsRUFDL0IsS0FBYSxFQUNiLFFBQWEsRUFDYixZQUFrQyxFQUNsQyxnQkFBa0MsRUFDbkIsb0JBQW1ELEVBQ3pELGNBQXVDLEVBQ3pDLFlBQW1DLEVBQ2hDLGVBQXlDLEVBQ3JDLG1CQUFpRCxFQUNsRCxrQkFBK0MsRUFDaEQsaUJBQXFDLEVBQ2xDLG9CQUFtRCxFQUNuRCxvQkFBbUQ7WUFFMUUsS0FBSyxFQUFFLENBQUM7WUFsQlMsaUJBQVksR0FBWixZQUFZLENBQWtCO1lBQ3ZDLGtCQUFhLEdBQWIsYUFBYSxDQUE0QjtZQUMxQyxZQUFPLEdBQVAsT0FBTyxDQUFtQjtZQUN6QixnQkFBVyxHQUFYLFdBQVcsQ0FBb0I7WUFDL0IsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLGFBQVEsR0FBUixRQUFRLENBQUs7WUFDYixpQkFBWSxHQUFaLFlBQVksQ0FBc0I7WUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNYLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDakQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2pDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3hCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUM3Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQzFDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFFckMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBbkRuRSxnQkFBVyxHQUFrQixJQUFJLENBQUM7WUFDbEMsMEJBQXFCLEdBQXVCLElBQUksQ0FBQztZQUtqRCxtQkFBYyxHQUErQixJQUFJLENBQUM7WUFDbEQsOEJBQXlCLEdBQWtCLEVBQUUsQ0FBQztZQUM5Qyx3QkFBbUIsR0FBc0IsSUFBSSxDQUFDO1lBQzlDLGtCQUFhLEdBQUcsdUNBQWlCLENBQUM7WUFjbEMsd0JBQW1CLEdBQThCLElBQUksQ0FBQztZQUN0RCwwQkFBcUIsR0FBOEIsSUFBSSxDQUFDO1lBRS9DLGdCQUFXLEdBQUcsSUFBSSxlQUFPLEVBQWtCLENBQUM7WUFNdEQsY0FBUyxHQUFZLEtBQUssQ0FBQztZQXVCakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLHVDQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDOUYsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUQsQ0FBQztZQUNELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXJFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxHQUFHLEdBQXFCLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDdEUsR0FBRyxDQUFDLEdBQUcsR0FBRyxvQkFBVSxDQUFDLGVBQWUsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEYsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztZQUU3RixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLDhDQUFnQyxDQUFDLENBQUM7WUFDM0UsSUFBSSxvQkFBb0IsQ0FBQyxRQUFRLENBQXFDLHdDQUFnQixDQUFDLEVBQUUsU0FBUyxLQUFLLEtBQUssRUFBRSxDQUFDO2dCQUM5RyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3hKLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQzFGLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUUxQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25JLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZGLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDekIsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGdDQUFnQyxDQUFDLEdBQUcsRUFBRTtnQkFDOUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sWUFBWSxDQUFDLFNBQXNCLEVBQUUsSUFBaUI7WUFDN0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHVCQUFVLENBQUM7Z0JBQ2pDLGtCQUFrQixFQUFFLElBQUk7Z0JBQ3hCLG9CQUFvQixFQUFFLEdBQUc7Z0JBQ3pCLDRCQUE0QixFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQ2xHLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkNBQXVCLENBQUMsSUFBSSxFQUFFO2dCQUMxRSxVQUFVLHFDQUE2QjtnQkFDdkMsUUFBUSxxQ0FBNkI7YUFDckMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUV0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ25ELElBQUksQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQUM7b0JBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztnQkFDaEMsQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQzlCLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSx3QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksa0JBQVUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDdEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDM0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQzdELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQ3RHLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBRWxHLElBQUksVUFBVSxLQUFLLFNBQVMsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7b0JBQ3pELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RSxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVPLGlCQUFpQixDQUFDLElBQThCO1lBQ3ZELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztZQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUM1QixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDO2dCQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEMsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFXLFVBQVU7WUFDcEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUMvQixDQUFDO1FBRU8sZUFBZSxDQUFDLFNBQXNCO1lBQzdDLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFTyxlQUFlLENBQUMsR0FBWTtZQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN0QixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUFHLEdBQUcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDaEUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNoQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDbEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksMkJBQWUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDbkcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztxQkFBTSxDQUFDO29CQUNQLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQy9DLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVPLFlBQVksQ0FBQyx1QkFBb0M7WUFDeEQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLHFCQUFxQiw4Q0FBZ0MsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuSCxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztZQUN2RSxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDakUsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUN6QyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFFMUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUNyRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3JDLENBQUM7WUFFRCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxNQUFlO1lBQzFDLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixFQUFFLEVBQUUsQ0FBQztnQkFDcEUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkQsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFELENBQUM7UUFDRixDQUFDO1FBRU8saUJBQWlCLENBQUMsSUFBVztZQUNwQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sT0FBTyxHQUFjLEVBQUUsQ0FBQztZQUM5QixNQUFNLFNBQVMsR0FBYyxFQUFFLENBQUM7WUFDaEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDdEMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekUsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsSUFBWSxrQkFBa0I7WUFDN0IsT0FBTyxDQUFDO29CQUNQLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYTtvQkFDMUIsZUFBZSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCO29CQUM5QyxJQUFJLG1DQUEwQjtpQkFDOUI7Z0JBQ0Q7b0JBQ0Msb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0I7b0JBQ3pELG1CQUFtQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CO29CQUMzRCxJQUFJLG9DQUE0QjtpQkFDaEMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLGFBQWE7WUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDbEYsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLEVBQUU7b0JBQ2hDLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyx1Q0FBcUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDNUMsT0FBTyxJQUFJLG1EQUEwQixDQUNwQyxNQUFNLEVBQ2tCLE1BQU8sQ0FBQyxXQUFXLEVBQzNDLElBQUksQ0FBQyxrQkFBa0IsRUFDdkI7NEJBQ0Msc0JBQXNCLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBZ0IsQ0FBQzs0QkFDL0UsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZOzRCQUMvQixVQUFVLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLHFCQUFTLENBQUMsZ0JBQWdCLENBQUMsa0JBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDOUYsdUJBQXVCLEVBQUUsR0FBRyxFQUFFLDhCQUFzQjt5QkFDcEQsQ0FDRCxDQUFDO29CQUNILENBQUM7b0JBQ0QsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBZ0IsQ0FBQyxDQUFDO2dCQUN0RCxDQUFDO2dCQUNELFdBQVcsdUNBQStCO2FBQzFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztZQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUM7WUFFdkQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFTyxvQkFBb0I7WUFDM0IsTUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO1lBRTlCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUUsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO2dCQUN4QixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUM1RixPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDcEMsQ0FBQztZQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM5RixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkMsTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN0QixDQUFDO2dCQUVELElBQUksQ0FBQyxPQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1lBRXpCLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLE9BQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDRixDQUFDO1FBRUQsc0JBQXNCLENBQUMsTUFBYztZQUNwQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDakIsSUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLLHVDQUFxQixDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM1QyxPQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUN4QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFDeEMsQ0FBQztZQUVELElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyxnQ0FBYyxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNyQyxNQUFNLElBQUksR0FBRyxJQUFJLHdDQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7aUJBQU0sSUFBSSxNQUFNLFlBQVksd0JBQWMsRUFBRSxDQUFDO2dCQUM3QyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaURBQXVCLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzdGLENBQUM7aUJBQU0sSUFBSSxNQUFNLFlBQVksMkJBQWlCLEVBQUUsQ0FBQztnQkFDaEQsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG9EQUEwQixFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNoRyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxJQUFJLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3JELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsYUFBYTtZQUNsQixJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3JELE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1lBQzlCLENBQUM7UUFDRixDQUFDO1FBRU8sb0JBQW9CLENBQUMsYUFBMEM7WUFDdEUsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUNBQXFCLENBQUMsR0FBRyxFQUFFO2dCQUMxRSw0QkFBNEIsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUN0QyxDQUFDLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5RCxJQUFJLG1CQUFtQixHQUFhLEVBQUUsQ0FBQztZQUN2QyxJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzNDLG1CQUFtQixHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDcEQsT0FBTyxJQUFJLGdCQUFNLENBQUMsb0JBQW9CLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFO3dCQUNqRyxJQUFJLENBQUM7NEJBQ0osTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUNqSCxDQUFDO3dCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7NEJBQ1osTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU87Z0NBQ3RCLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLDRDQUE0QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0NBQ3JHLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG1DQUFtQyxFQUFFLHNDQUFzQyxDQUFDLENBQUM7NEJBQzdGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3ZDLENBQUM7b0JBQ0YsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsb0JBQW9CLENBQUMsV0FBVyxHQUFHLG1CQUFtQixDQUFDO1lBRXZELE1BQU0sNEJBQTRCLEdBQStCLElBQUksbURBQTBCLENBQzlGLG9CQUFvQixFQUNJLG9CQUFxQixDQUFDLFdBQVcsRUFDekQsSUFBSSxDQUFDLGtCQUFrQixFQUN2QjtnQkFDQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsRUFBRTtvQkFDaEMsSUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLLHVDQUFxQixDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM1QyxPQUFPLDRCQUE0QixDQUFDO29CQUNyQyxDQUFDO29CQUNELE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQWdCLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztnQkFDRCxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7Z0JBQy9CLFVBQVUsRUFBRSw4QkFBOEI7Z0JBQzFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRSw4QkFBc0I7YUFDcEQsQ0FDRCxDQUFDO1lBRUYsT0FBTyxvQkFBb0IsQ0FBQztRQUM3QixDQUFDO1FBRU8sd0JBQXdCLENBQUMsdUJBQW9DO1lBQ3BFLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1lBQ3JHLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFO2dCQUN4RSxzQkFBc0IsRUFBRSxNQUFNLENBQUMsRUFBRTtvQkFDaEMsSUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLLHVDQUFxQixDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM1QyxPQUFPLElBQUksbURBQTBCLENBQ3BDLE1BQU0sRUFDa0IsTUFBTyxDQUFDLFdBQVcsRUFDM0MsSUFBSSxDQUFDLGtCQUFrQixFQUN2Qjs0QkFDQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFnQixDQUFDOzRCQUMvRSxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7NEJBQy9CLFVBQVUsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEdBQUcscUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUM5Rix1QkFBdUIsRUFBRSxHQUFHLEVBQUUsOEJBQXNCO3lCQUNwRCxDQUNELENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFnQixDQUFDLENBQUM7Z0JBQ3RELENBQUM7YUFDRCxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBRXpDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLFlBQVksUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLFFBQVEsQ0FBQyxVQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUMxTixJQUFJLENBQUM7d0JBQ0osTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNqSCxDQUFDO29CQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7d0JBQ1osSUFBSSxLQUFhLENBQUM7d0JBRWxCLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDOzRCQUN6QixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU87Z0NBQ2hCLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLDRDQUE0QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0NBQ3JHLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG1DQUFtQyxFQUFFLHNDQUFzQyxDQUFDLENBQUM7d0JBQzlGLENBQUM7NkJBQU0sQ0FBQzs0QkFDUCxLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU87Z0NBQ2hCLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLDRDQUE0QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0NBQ2xHLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLHNDQUFzQyxDQUFDLENBQUM7d0JBQzNGLENBQUM7d0JBQ0QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDdkMsQ0FBQztnQkFDRixDQUFDLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFekQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO2dCQUN4QixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUM1RixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNuRixDQUFDO1FBQ0YsQ0FBQztRQUVELElBQUksZ0JBQWdCO1lBQ25CLE9BQU8sQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzlGLENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxhQUEwQjtZQUNyRCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUNBQW1CLEVBQUUsU0FBUyxFQUFFLHlDQUFtQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDNU0sTUFBTSxRQUFRLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JHLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFMUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztZQUM3QixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsV0FBVyxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUU1QixHQUFHLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ25FLElBQUksQ0FBQyxjQUFlLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFDL0YsSUFBSSxDQUFDLGNBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN6RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLHFCQUFTLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUU1RixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3pDLGFBQWEsQ0FBQyxLQUFLLEdBQUc7Z0JBQ3JCLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRyxDQUFDLEdBQUc7Z0JBQ3hDLEtBQUssRUFBRSxJQUFJLENBQUMsZ0JBQWdCO2FBQzVCLENBQUM7WUFDRixJQUFJLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRTFELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ25GLGFBQWEsQ0FBQyxLQUFLLEdBQUc7b0JBQ3JCLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBZSxDQUFDLFFBQVEsRUFBRyxDQUFDLEdBQUc7b0JBQ3pDLEtBQUssRUFBRSxJQUFJLENBQUMsZ0JBQWdCO2lCQUM1QixDQUFDO2dCQUNGLElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkYsSUFBSSxhQUFhLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUcsQ0FBQyxHQUFHLEtBQUssYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDbkgsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDOUMsSUFBSSxNQUFNLEtBQUssYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzt3QkFDMUMsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQzt3QkFDbEMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7d0JBQ3JCLGFBQWEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO3dCQUM1QixJQUFJLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUMzRCxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hFLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDO29CQUN6RCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQzdHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUwsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRU8scUJBQXFCO1lBQzVCLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QixNQUFNLGVBQWUsR0FBRyxJQUFBLDJDQUFxQixFQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzFHLElBQUksZUFBZSxLQUFLLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDNUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxlQUFlLENBQUM7b0JBQ3JDLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7WUFDRixDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsY0FBYztZQUNiLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDOUMsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN6QyxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6QixDQUFDO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVPLG1CQUFtQjtZQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ2pDLENBQUM7WUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxDQUFDO1lBRXBDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMseUJBQXlCLEdBQUcsRUFBRSxDQUFDO1lBQ3BDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM5QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUM1QixDQUFDO1lBRUQsSUFBSSxDQUFDLHFCQUFzQixDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFFRCxNQUFNLENBQUMsWUFBcUI7WUFDM0IsTUFBTSxXQUFXLEdBQUcsWUFBWSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuSixJQUFJLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO1lBQzNDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO1lBQzdDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUVNLGdCQUFnQjtZQUN0QixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDcEIsT0FBTztZQUNSLENBQUM7WUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ2pHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUVyRCxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDbkYsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLDhCQUE4QixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xELE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV0RCxDQUFDO1FBRU8sOEJBQThCLENBQUMsU0FBc0I7WUFDNUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRTVFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksdUNBQWtCLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBZSxFQUFRLEVBQUU7Z0JBQ3RGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBRTdDLE1BQU0sQ0FBQyxHQUFHLENBQUM7b0JBQ1YsTUFBTSxFQUFFLElBQUksQ0FBQyxhQUFhO29CQUMxQixlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0I7b0JBQzlDLElBQUksRUFBRSxJQUFJO29CQUNWLElBQUkseUNBQWdDO2lCQUNwQyxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVPLGdDQUFnQyxDQUFDLFNBQXNCO1lBQzlELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5RCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNwQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFlLEVBQVEsRUFBRTtnQkFDeEYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFFN0MsTUFBTSxDQUFDLEdBQUcsQ0FBQztvQkFDVixNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWE7b0JBQzFCLGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQjtvQkFDOUMsSUFBSSxFQUFFLElBQUk7b0JBQ1YsSUFBSSx5Q0FBZ0M7aUJBQ3BDLENBQUMsQ0FBQztnQkFFSCxJQUFJLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQsUUFBUSxDQUFDLE9BQWdCLEVBQUUsVUFBbUIsS0FBSztZQUNsRCxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN6RCxJQUFJLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUM5QixDQUFDO1lBQ0YsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO29CQUN0SSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixDQUFDO2dCQUNELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzlELENBQUM7UUFDRixDQUFDO1FBRU8sMEJBQTBCLENBQUMsZ0JBQTZCO1lBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtnQkFDMUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUU7Z0JBQzFFLElBQUksZ0JBQWdCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztvQkFDNUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO2dCQUNELGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLENBQUMsVUFBNkI7WUFFbkMsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekMsQ0FBQztZQUVELE1BQU0sY0FBYyxHQUFZLFVBQVUsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFFdkcsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7WUFFMUIsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3ZELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN6QixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQzVCLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDbkQsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBRUQsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUV6QyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFFbEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN2RyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDOUQsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFELENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkMsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDRixDQUFDO1FBR08sYUFBYSxDQUFDLENBQWE7WUFDbEMsTUFBTSxLQUFLLEdBQUcsSUFBSSwrQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO2dCQUN2QyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSztnQkFDdEIsTUFBTSxFQUFFLGdCQUFNLENBQUMsMkJBQTJCO2dCQUMxQyxpQkFBaUIsRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRTtnQkFDOUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtnQkFDMUMsWUFBWSxFQUFFLElBQUksb0JBQW9CLEVBQUU7Z0JBQ3hDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtvQkFDdkIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7Z0JBQ2hDLENBQUM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ1YsQ0FBQztRQUNGLENBQUM7S0FDRCxDQUFBO0lBenJCWSxrQ0FBVzswQkFBWCxXQUFXO1FBa0RyQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsZ0NBQWUsQ0FBQTtRQUNmLFlBQUEscUJBQWEsQ0FBQTtRQUNiLFlBQUEsMkJBQWdCLENBQUE7UUFDaEIsWUFBQSxtQ0FBb0IsQ0FBQTtRQUNwQixZQUFBLGlDQUFtQixDQUFBO1FBQ25CLFlBQUEsK0JBQWtCLENBQUE7UUFDbEIsWUFBQSxxQ0FBcUIsQ0FBQTtRQUNyQixZQUFBLHFDQUFxQixDQUFBO09BMURYLFdBQVcsQ0F5ckJ2QjtJQUVELFNBQVMsYUFBYSxDQUFDLE1BQTZELEVBQUUsTUFBZ0UsRUFBRSxxQkFBOEIsRUFBRSxpQkFBNkMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEtBQUssWUFBWTtRQUNuUSxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUkscUJBQXFCLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSx3QkFBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLENBQUM7WUFFRCxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUMzQixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBRTNELEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztZQUN4QixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUU3RCxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ25CLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxFQUFFLENBQUMsQ0FBQztnQkFDMUIsQ0FBQztnQkFFRCxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDckIsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDIn0=
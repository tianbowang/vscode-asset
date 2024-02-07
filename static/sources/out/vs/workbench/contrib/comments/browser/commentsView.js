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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/resources", "vs/editor/browser/editorBrowser", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/contrib/comments/common/commentModel", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/services/editor/common/editorService", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/labels", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/common/model/textModel", "vs/workbench/contrib/comments/browser/comments", "vs/workbench/contrib/comments/browser/commentsViewActions", "vs/workbench/common/memento", "vs/platform/storage/common/storage", "vs/workbench/contrib/comments/browser/commentsFilterOptions", "vs/editor/common/languages", "vs/base/common/iterator", "vs/workbench/contrib/comments/browser/commentsController", "vs/editor/common/core/range", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/workbench/contrib/comments/browser/commentsModel", "vs/css!./media/panel"], function (require, exports, nls, dom, resources_1, editorBrowser_1, instantiation_1, themeService_1, commentModel_1, commentService_1, editorService_1, colorRegistry_1, labels_1, commentsTreeViewer_1, viewPane_1, views_1, configuration_1, contextkey_1, contextView_1, keybinding_1, opener_1, telemetry_1, uriIdentity_1, textModel_1, comments_1, commentsViewActions_1, memento_1, storage_1, commentsFilterOptions_1, languages_1, iterator_1, commentsController_1, range_1, widgetNavigationCommands_1, commentsModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentsPanel = exports.CONTEXT_KEY_SOME_COMMENTS_EXPANDED = exports.CONTEXT_KEY_HAS_COMMENTS = void 0;
    exports.CONTEXT_KEY_HAS_COMMENTS = new contextkey_1.RawContextKey('commentsView.hasComments', false);
    exports.CONTEXT_KEY_SOME_COMMENTS_EXPANDED = new contextkey_1.RawContextKey('commentsView.someCommentsExpanded', false);
    const VIEW_STORAGE_ID = 'commentsViewState';
    function createResourceCommentsIterator(model) {
        return iterator_1.Iterable.map(model.resourceCommentThreads, m => {
            const CommentNodeIt = iterator_1.Iterable.from(m.commentThreads);
            const children = iterator_1.Iterable.map(CommentNodeIt, r => ({ element: r }));
            return { element: m, children };
        });
    }
    let CommentsPanel = class CommentsPanel extends viewPane_1.FilterViewPane {
        constructor(options, instantiationService, viewDescriptorService, editorService, configurationService, contextKeyService, contextMenuService, keybindingService, openerService, themeService, commentService, telemetryService, uriIdentityService, storageService) {
            const stateMemento = new memento_1.Memento(VIEW_STORAGE_ID, storageService);
            const viewState = stateMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            super({
                ...options,
                filterOptions: {
                    placeholder: nls.localize('comments.filter.placeholder', "Filter (e.g. text, author)"),
                    ariaLabel: nls.localize('comments.filter.ariaLabel', "Filter comments"),
                    history: viewState['filterHistory'] || [],
                    text: viewState['filter'] || '',
                    focusContextKey: comments_1.CommentsViewFilterFocusContextKey.key
                }
            }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.editorService = editorService;
            this.commentService = commentService;
            this.uriIdentityService = uriIdentityService;
            this.totalComments = 0;
            this.currentHeight = 0;
            this.currentWidth = 0;
            this.cachedFilterStats = undefined;
            this.onDidChangeVisibility = this.onDidChangeBodyVisibility;
            this.hasCommentsContextKey = exports.CONTEXT_KEY_HAS_COMMENTS.bindTo(contextKeyService);
            this.someCommentsExpandedContextKey = exports.CONTEXT_KEY_SOME_COMMENTS_EXPANDED.bindTo(contextKeyService);
            this.stateMemento = stateMemento;
            this.viewState = viewState;
            this.filters = this._register(new commentsViewActions_1.CommentsFilters({
                showResolved: this.viewState['showResolved'] !== false,
                showUnresolved: this.viewState['showUnresolved'] !== false,
            }, this.contextKeyService));
            this.filter = new commentsTreeViewer_1.Filter(new commentsFilterOptions_1.FilterOptions(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved));
            this._register(this.filters.onDidChange((event) => {
                if (event.showResolved || event.showUnresolved) {
                    this.updateFilter();
                }
            }));
            this._register(this.filterWidget.onDidChangeFilterText(() => this.updateFilter()));
        }
        saveState() {
            this.viewState['filter'] = this.filterWidget.getFilterText();
            this.viewState['filterHistory'] = this.filterWidget.getHistory();
            this.viewState['showResolved'] = this.filters.showResolved;
            this.viewState['showUnresolved'] = this.filters.showUnresolved;
            this.stateMemento.saveMemento();
            super.saveState();
        }
        render() {
            super.render();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [this, this.filterWidget],
                focusNextWidget: () => {
                    if (this.filterWidget.hasFocus()) {
                        this.focus();
                    }
                },
                focusPreviousWidget: () => {
                    if (!this.filterWidget.hasFocus()) {
                        this.focusFilter();
                    }
                }
            }));
        }
        focusFilter() {
            this.filterWidget.focus();
        }
        clearFilterText() {
            this.filterWidget.setFilterText('');
        }
        getFilterStats() {
            if (!this.cachedFilterStats) {
                this.cachedFilterStats = {
                    total: this.totalComments,
                    filtered: this.tree?.getVisibleItemCount() ?? 0
                };
            }
            return this.cachedFilterStats;
        }
        updateFilter() {
            this.filter.options = new commentsFilterOptions_1.FilterOptions(this.filterWidget.getFilterText(), this.filters.showResolved, this.filters.showUnresolved);
            this.tree?.filterComments();
            this.cachedFilterStats = undefined;
            const { total, filtered } = this.getFilterStats();
            this.filterWidget.updateBadge(total === filtered || total === 0 ? undefined : nls.localize('showing filtered results', "Showing {0} of {1}", filtered, total));
            this.filterWidget.checkMoreFilters(!this.filters.showResolved || !this.filters.showUnresolved);
        }
        renderBody(container) {
            super.renderBody(container);
            container.classList.add('comments-panel');
            const domContainer = dom.append(container, dom.$('.comments-panel-container'));
            this.treeContainer = dom.append(domContainer, dom.$('.tree-container'));
            this.treeContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
            this.cachedFilterStats = undefined;
            this.createTree();
            this.createMessageBox(domContainer);
            this._register(this.commentService.onDidSetAllCommentThreads(this.onAllCommentsChanged, this));
            this._register(this.commentService.onDidUpdateCommentThreads(this.onCommentsUpdated, this));
            this._register(this.commentService.onDidDeleteDataProvider(this.onDataProviderDeleted, this));
            const styleElement = dom.createStyleSheet(container);
            this.applyStyles(styleElement);
            this._register(this.themeService.onDidColorThemeChange(_ => this.applyStyles(styleElement)));
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible) {
                    this.refresh();
                }
            }));
            this.renderComments();
        }
        focus() {
            super.focus();
            const element = this.tree?.getHTMLElement();
            if (element && dom.isActiveElement(element)) {
                return;
            }
            if (!this.commentService.commentsModel.hasCommentThreads() && this.messageBoxContainer) {
                this.messageBoxContainer.focus();
            }
            else if (this.tree) {
                this.tree.domFocus();
            }
        }
        applyStyles(styleElement) {
            const content = [];
            const theme = this.themeService.getColorTheme();
            const linkColor = theme.getColor(colorRegistry_1.textLinkForeground);
            if (linkColor) {
                content.push(`.comments-panel .comments-panel-container a { color: ${linkColor}; }`);
            }
            const linkActiveColor = theme.getColor(colorRegistry_1.textLinkActiveForeground);
            if (linkActiveColor) {
                content.push(`.comments-panel .comments-panel-container a:hover, a:active { color: ${linkActiveColor}; }`);
            }
            const focusColor = theme.getColor(colorRegistry_1.focusBorder);
            if (focusColor) {
                content.push(`.comments-panel .comments-panel-container a:focus { outline-color: ${focusColor}; }`);
            }
            const codeTextForegroundColor = theme.getColor(colorRegistry_1.textPreformatForeground);
            if (codeTextForegroundColor) {
                content.push(`.comments-panel .comments-panel-container .text code { color: ${codeTextForegroundColor}; }`);
            }
            styleElement.textContent = content.join('\n');
        }
        async renderComments() {
            this.treeContainer.classList.toggle('hidden', !this.commentService.commentsModel.hasCommentThreads());
            this.renderMessage();
            await this.tree?.setChildren(null, createResourceCommentsIterator(this.commentService.commentsModel));
        }
        collapseAll() {
            if (this.tree) {
                this.tree.collapseAll();
                this.tree.setSelection([]);
                this.tree.setFocus([]);
                this.tree.domFocus();
                this.tree.focusFirst();
            }
        }
        expandAll() {
            if (this.tree) {
                this.tree.expandAll();
                this.tree.setSelection([]);
                this.tree.setFocus([]);
                this.tree.domFocus();
                this.tree.focusFirst();
            }
        }
        get hasRendered() {
            return !!this.tree;
        }
        layoutBodyContent(height = this.currentHeight, width = this.currentWidth) {
            if (this.messageBoxContainer) {
                this.messageBoxContainer.style.height = `${height}px`;
            }
            this.tree?.layout(height, width);
            this.currentHeight = height;
            this.currentWidth = width;
        }
        createMessageBox(parent) {
            this.messageBoxContainer = dom.append(parent, dom.$('.message-box-container'));
            this.messageBoxContainer.setAttribute('tabIndex', '0');
        }
        renderMessage() {
            this.messageBoxContainer.textContent = this.commentService.commentsModel.getMessage();
            this.messageBoxContainer.classList.toggle('hidden', this.commentService.commentsModel.hasCommentThreads());
        }
        createTree() {
            this.treeLabels = this._register(this.instantiationService.createInstance(labels_1.ResourceLabels, this));
            this.tree = this._register(this.instantiationService.createInstance(commentsTreeViewer_1.CommentsList, this.treeLabels, this.treeContainer, {
                overrideStyles: { listBackground: this.getBackgroundColor() },
                selectionNavigation: true,
                filter: this.filter,
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (item) => {
                        return undefined;
                    }
                },
                accessibilityProvider: {
                    getAriaLabel(element) {
                        if (element instanceof commentsModel_1.CommentsModel) {
                            return nls.localize('rootCommentsLabel', "Comments for current workspace");
                        }
                        if (element instanceof commentModel_1.ResourceWithCommentThreads) {
                            return nls.localize('resourceWithCommentThreadsLabel', "Comments in {0}, full path {1}", (0, resources_1.basename)(element.resource), element.resource.fsPath);
                        }
                        if (element instanceof commentModel_1.CommentNode) {
                            if (element.range) {
                                return nls.localize('resourceWithCommentLabel', "Comment from ${0} at line {1} column {2} in {3}, source: {4}", element.comment.userName, element.range.startLineNumber, element.range.startColumn, (0, resources_1.basename)(element.resource), (typeof element.comment.body === 'string') ? element.comment.body : element.comment.body.value);
                            }
                            else {
                                return nls.localize('resourceWithCommentLabelFile', "Comment from ${0} in {1}, source: {2}", element.comment.userName, (0, resources_1.basename)(element.resource), (typeof element.comment.body === 'string') ? element.comment.body : element.comment.body.value);
                            }
                        }
                        return '';
                    },
                    getWidgetAriaLabel() {
                        return commentsTreeViewer_1.COMMENTS_VIEW_TITLE.value;
                    }
                }
            }));
            this._register(this.tree.onDidOpen(e => {
                this.openFile(e.element, e.editorOptions.pinned, e.editorOptions.preserveFocus, e.sideBySide);
            }));
            this._register(this.tree.onDidChangeModel(() => {
                this.updateSomeCommentsExpanded();
            }));
            this._register(this.tree.onDidChangeCollapseState(() => {
                this.updateSomeCommentsExpanded();
            }));
        }
        openFile(element, pinned, preserveFocus, sideBySide) {
            if (!element) {
                return false;
            }
            if (!(element instanceof commentModel_1.ResourceWithCommentThreads || element instanceof commentModel_1.CommentNode)) {
                return false;
            }
            if (!this.commentService.isCommentingEnabled) {
                this.commentService.enableCommenting(true);
            }
            const range = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].range : element.range;
            const activeEditor = this.editorService.activeTextEditorControl;
            // If the active editor is a diff editor where one of the sides has the comment,
            // then we try to reveal the comment in the diff editor.
            const currentActiveResources = (0, editorBrowser_1.isDiffEditor)(activeEditor) ? [activeEditor.getOriginalEditor(), activeEditor.getModifiedEditor()]
                : (activeEditor ? [activeEditor] : []);
            for (const editor of currentActiveResources) {
                const model = editor.getModel();
                if ((model instanceof textModel_1.TextModel) && this.uriIdentityService.extUri.isEqual(element.resource, model.uri)) {
                    const threadToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].threadId : element.threadId;
                    const commentToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].comment.uniqueIdInThread : element.comment.uniqueIdInThread;
                    if (threadToReveal && (0, editorBrowser_1.isCodeEditor)(editor)) {
                        const controller = commentsController_1.CommentController.get(editor);
                        controller?.revealCommentThread(threadToReveal, commentToReveal, true, !preserveFocus);
                    }
                    return true;
                }
            }
            const threadToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].threadId : element.threadId;
            const commentToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].comment : element.comment;
            this.editorService.openEditor({
                resource: element.resource,
                options: {
                    pinned: pinned,
                    preserveFocus: preserveFocus,
                    selection: range ?? new range_1.Range(1, 1, 1, 1)
                }
            }, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP).then(editor => {
                if (editor) {
                    const control = editor.getControl();
                    if (threadToReveal && (0, editorBrowser_1.isCodeEditor)(control)) {
                        const controller = commentsController_1.CommentController.get(control);
                        controller?.revealCommentThread(threadToReveal, commentToReveal.uniqueIdInThread, true, !preserveFocus);
                    }
                }
            });
            return true;
        }
        async refresh() {
            if (!this.tree) {
                return;
            }
            if (this.isVisible()) {
                this.hasCommentsContextKey.set(this.commentService.commentsModel.hasCommentThreads());
                this.treeContainer.classList.toggle('hidden', !this.commentService.commentsModel.hasCommentThreads());
                this.cachedFilterStats = undefined;
                this.renderMessage();
                this.tree?.setChildren(null, createResourceCommentsIterator(this.commentService.commentsModel));
                if (this.tree.getSelection().length === 0 && this.commentService.commentsModel.hasCommentThreads()) {
                    const firstComment = this.commentService.commentsModel.resourceCommentThreads[0].commentThreads[0];
                    if (firstComment) {
                        this.tree.setFocus([firstComment]);
                        this.tree.setSelection([firstComment]);
                    }
                }
            }
        }
        onAllCommentsChanged(e) {
            this.cachedFilterStats = undefined;
            this.totalComments += e.commentThreads.length;
            let unresolved = 0;
            for (const thread of e.commentThreads) {
                if (thread.state === languages_1.CommentThreadState.Unresolved) {
                    unresolved++;
                }
            }
            this.refresh();
        }
        onCommentsUpdated(e) {
            this.cachedFilterStats = undefined;
            this.totalComments += e.added.length;
            this.totalComments -= e.removed.length;
            let unresolved = 0;
            for (const resource of this.commentService.commentsModel.resourceCommentThreads) {
                for (const thread of resource.commentThreads) {
                    if (thread.threadState === languages_1.CommentThreadState.Unresolved) {
                        unresolved++;
                    }
                }
            }
            this.refresh();
        }
        onDataProviderDeleted(owner) {
            this.cachedFilterStats = undefined;
            this.totalComments = 0;
            this.refresh();
        }
        updateSomeCommentsExpanded() {
            this.someCommentsExpandedContextKey.set(this.isSomeCommentsExpanded());
        }
        areAllCommentsExpanded() {
            if (!this.tree) {
                return false;
            }
            const navigator = this.tree.navigate();
            while (navigator.next()) {
                if (this.tree.isCollapsed(navigator.current())) {
                    return false;
                }
            }
            return true;
        }
        isSomeCommentsExpanded() {
            if (!this.tree) {
                return false;
            }
            const navigator = this.tree.navigate();
            while (navigator.next()) {
                if (!this.tree.isCollapsed(navigator.current())) {
                    return true;
                }
            }
            return false;
        }
    };
    exports.CommentsPanel = CommentsPanel;
    exports.CommentsPanel = CommentsPanel = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, views_1.IViewDescriptorService),
        __param(3, editorService_1.IEditorService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, commentService_1.ICommentService),
        __param(11, telemetry_1.ITelemetryService),
        __param(12, uriIdentity_1.IUriIdentityService),
        __param(13, storage_1.IStorageService)
    ], CommentsPanel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRzVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1Q25GLFFBQUEsd0JBQXdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pGLFFBQUEsa0NBQWtDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG1DQUFtQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pILE1BQU0sZUFBZSxHQUFHLG1CQUFtQixDQUFDO0lBRTVDLFNBQVMsOEJBQThCLENBQUMsS0FBcUI7UUFDNUQsT0FBTyxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDckQsTUFBTSxhQUFhLEdBQUcsbUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sUUFBUSxHQUFHLG1CQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXBFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSx5QkFBYztRQW1CaEQsWUFDQyxPQUF5QixFQUNGLG9CQUEyQyxFQUMxQyxxQkFBNkMsRUFDckQsYUFBOEMsRUFDdkMsb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUNwQyxrQkFBdUMsRUFDeEMsaUJBQXFDLEVBQ3pDLGFB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
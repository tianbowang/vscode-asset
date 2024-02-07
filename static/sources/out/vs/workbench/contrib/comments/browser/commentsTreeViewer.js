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
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/base/browser/markdownRenderer", "vs/base/common/lifecycle", "vs/platform/opener/common/opener", "vs/workbench/contrib/comments/common/commentModel", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/list/browser/listService", "vs/platform/theme/common/themeService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/comments/browser/timestamp", "vs/base/common/codicons", "vs/base/common/themables", "vs/workbench/contrib/comments/browser/commentColors", "vs/editor/common/languages", "vs/workbench/contrib/comments/browser/commentsFilterOptions", "vs/base/common/resources", "vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer", "vs/workbench/contrib/comments/browser/commentsModel"], function (require, exports, dom, nls, markdownRenderer_1, lifecycle_1, opener_1, commentModel_1, configuration_1, contextkey_1, listService_1, themeService_1, instantiation_1, timestamp_1, codicons_1, themables_1, commentColors_1, languages_1, commentsFilterOptions_1, resources_1, markdownRenderer_2, commentsModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentsList = exports.Filter = exports.CommentNodeRenderer = exports.ResourceWithCommentsRenderer = exports.COMMENTS_VIEW_TITLE = exports.COMMENTS_VIEW_STORAGE_ID = exports.COMMENTS_VIEW_ID = void 0;
    exports.COMMENTS_VIEW_ID = 'workbench.panel.comments';
    exports.COMMENTS_VIEW_STORAGE_ID = 'Comments';
    exports.COMMENTS_VIEW_TITLE = nls.localize2('comments.view.title', "Comments");
    class CommentsModelVirualDelegate {
        static { this.RESOURCE_ID = 'resource-with-comments'; }
        static { this.COMMENT_ID = 'comment-node'; }
        getHeight(element) {
            if ((element instanceof commentModel_1.CommentNode) && element.hasReply()) {
                return 44;
            }
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof commentModel_1.ResourceWithCommentThreads) {
                return CommentsModelVirualDelegate.RESOURCE_ID;
            }
            if (element instanceof commentModel_1.CommentNode) {
                return CommentsModelVirualDelegate.COMMENT_ID;
            }
            return '';
        }
    }
    class ResourceWithCommentsRenderer {
        constructor(labels) {
            this.labels = labels;
            this.templateId = 'resource-with-comments';
        }
        renderTemplate(container) {
            const labelContainer = dom.append(container, dom.$('.resource-container'));
            const resourceLabel = this.labels.create(labelContainer);
            const separator = dom.append(labelContainer, dom.$('.separator'));
            const owner = labelContainer.appendChild(dom.$('.owner'));
            return { resourceLabel, owner, separator };
        }
        renderElement(node, index, templateData, height) {
            templateData.resourceLabel.setFile(node.element.resource);
            templateData.separator.innerText = '\u00b7';
            if (node.element.ownerLabel) {
                templateData.owner.innerText = node.element.ownerLabel;
                templateData.separator.style.display = 'inline';
            }
            else {
                templateData.owner.innerText = '';
                templateData.separator.style.display = 'none';
            }
        }
        disposeTemplate(templateData) {
            templateData.resourceLabel.dispose();
        }
    }
    exports.ResourceWithCommentsRenderer = ResourceWithCommentsRenderer;
    let CommentNodeRenderer = class CommentNodeRenderer {
        constructor(openerService, configurationService, themeService) {
            this.openerService = openerService;
            this.configurationService = configurationService;
            this.themeService = themeService;
            this.templateId = 'comment-node';
        }
        renderTemplate(container) {
            const threadContainer = dom.append(container, dom.$('.comment-thread-container'));
            const metadataContainer = dom.append(threadContainer, dom.$('.comment-metadata-container'));
            const threadMetadata = {
                icon: dom.append(metadataContainer, dom.$('.icon')),
                userNames: dom.append(metadataContainer, dom.$('.user')),
                timestamp: new timestamp_1.TimestampWidget(this.configurationService, dom.append(metadataContainer, dom.$('.timestamp-container'))),
                separator: dom.append(metadataContainer, dom.$('.separator')),
                commentPreview: dom.append(metadataContainer, dom.$('.text')),
                range: dom.append(metadataContainer, dom.$('.range'))
            };
            threadMetadata.separator.innerText = '\u00b7';
            const snippetContainer = dom.append(threadContainer, dom.$('.comment-snippet-container'));
            const repliesMetadata = {
                container: snippetContainer,
                icon: dom.append(snippetContainer, dom.$('.icon')),
                count: dom.append(snippetContainer, dom.$('.count')),
                lastReplyDetail: dom.append(snippetContainer, dom.$('.reply-detail')),
                separator: dom.append(snippetContainer, dom.$('.separator')),
                timestamp: new timestamp_1.TimestampWidget(this.configurationService, dom.append(snippetContainer, dom.$('.timestamp-container'))),
            };
            repliesMetadata.separator.innerText = '\u00b7';
            repliesMetadata.icon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.indent));
            const disposables = [threadMetadata.timestamp, repliesMetadata.timestamp];
            return { threadMetadata, repliesMetadata, disposables };
        }
        getCountString(commentCount) {
            if (commentCount > 1) {
                return nls.localize('commentsCount', "{0} comments", commentCount);
            }
            else {
                return nls.localize('commentCount', "1 comment");
            }
        }
        getRenderedComment(commentBody, disposables) {
            const renderedComment = (0, markdownRenderer_1.renderMarkdown)(commentBody, {
                inline: true,
                actionHandler: {
                    callback: (link) => (0, markdownRenderer_2.openLinkFromMarkdown)(this.openerService, link, commentBody.isTrusted),
                    disposables: disposables
                }
            });
            const images = renderedComment.element.getElementsByTagName('img');
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const textDescription = dom.$('');
                textDescription.textContent = image.alt ? nls.localize('imageWithLabel', "Image: {0}", image.alt) : nls.localize('image', "Image");
                image.parentNode.replaceChild(textDescription, image);
            }
            return renderedComment;
        }
        getIcon(threadState) {
            if (threadState === languages_1.CommentThreadState.Unresolved) {
                return codicons_1.Codicon.commentUnresolved;
            }
            else {
                return codicons_1.Codicon.comment;
            }
        }
        renderElement(node, index, templateData, height) {
            const commentCount = node.element.replies.length + 1;
            templateData.threadMetadata.icon.classList.remove(...Array.from(templateData.threadMetadata.icon.classList.values())
                .filter(value => value.startsWith('codicon')));
            templateData.threadMetadata.icon.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.getIcon(node.element.threadState)));
            if (node.element.threadState !== undefined) {
                const color = this.getCommentThreadWidgetStateColor(node.element.threadState, this.themeService.getColorTheme());
                templateData.threadMetadata.icon.style.setProperty(commentColors_1.commentViewThreadStateColorVar, `${color}`);
                templateData.threadMetadata.icon.style.color = `var(${commentColors_1.commentViewThreadStateColorVar})`;
            }
            templateData.threadMetadata.userNames.textContent = node.element.comment.userName;
            templateData.threadMetadata.timestamp.setTimestamp(node.element.comment.timestamp ? new Date(node.element.comment.timestamp) : undefined);
            const originalComment = node.element;
            templateData.threadMetadata.commentPreview.innerText = '';
            templateData.threadMetadata.commentPreview.style.height = '22px';
            if (typeof originalComment.comment.body === 'string') {
                templateData.threadMetadata.commentPreview.innerText = originalComment.comment.body;
            }
            else {
                const disposables = new lifecycle_1.DisposableStore();
                templateData.disposables.push(disposables);
                const renderedComment = this.getRenderedComment(originalComment.comment.body, disposables);
                templateData.disposables.push(renderedComment);
                templateData.threadMetadata.commentPreview.appendChild(renderedComment.element.firstElementChild ?? renderedComment.element);
                templateData.threadMetadata.commentPreview.title = renderedComment.element.textContent ?? '';
            }
            if (node.element.range) {
                if (node.element.range.startLineNumber === node.element.range.endLineNumber) {
                    templateData.threadMetadata.range.textContent = nls.localize('commentLine', "[Ln {0}]", node.element.range.startLineNumber);
                }
                else {
                    templateData.threadMetadata.range.textContent = nls.localize('commentRange', "[Ln {0}-{1}]", node.element.range.startLineNumber, node.element.range.endLineNumber);
                }
            }
            if (!node.element.hasReply()) {
                templateData.repliesMetadata.container.style.display = 'none';
                return;
            }
            templateData.repliesMetadata.container.style.display = '';
            templateData.repliesMetadata.count.textContent = this.getCountString(commentCount);
            const lastComment = node.element.replies[node.element.replies.length - 1].comment;
            templateData.repliesMetadata.lastReplyDetail.textContent = nls.localize('lastReplyFrom', "Last reply from {0}", lastComment.userName);
            templateData.repliesMetadata.timestamp.setTimestamp(lastComment.timestamp ? new Date(lastComment.timestamp) : undefined);
        }
        getCommentThreadWidgetStateColor(state, theme) {
            return (state !== undefined) ? (0, commentColors_1.getCommentThreadStateIconColor)(state, theme) : undefined;
        }
        disposeTemplate(templateData) {
            templateData.disposables.forEach(disposeable => disposeable.dispose());
        }
    };
    exports.CommentNodeRenderer = CommentNodeRenderer;
    exports.CommentNodeRenderer = CommentNodeRenderer = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, themeService_1.IThemeService)
    ], CommentNodeRenderer);
    var FilterDataType;
    (function (FilterDataType) {
        FilterDataType[FilterDataType["Resource"] = 0] = "Resource";
        FilterDataType[FilterDataType["Comment"] = 1] = "Comment";
    })(FilterDataType || (FilterDataType = {}));
    class Filter {
        constructor(options) {
            this.options = options;
        }
        filter(element, parentVisibility) {
            if (this.options.filter === '' && this.options.showResolved && this.options.showUnresolved) {
                return 1 /* TreeVisibility.Visible */;
            }
            if (element instanceof commentModel_1.ResourceWithCommentThreads) {
                return this.filterResourceMarkers(element);
            }
            else {
                return this.filterCommentNode(element, parentVisibility);
            }
        }
        filterResourceMarkers(resourceMarkers) {
            // Filter by text. Do not apply negated filters on resources instead use exclude patterns
            if (this.options.textFilter.text && !this.options.textFilter.negate) {
                const uriMatches = commentsFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, (0, resources_1.basename)(resourceMarkers.resource));
                if (uriMatches) {
                    return { visibility: true, data: { type: 0 /* FilterDataType.Resource */, uriMatches: uriMatches || [] } };
                }
            }
            return 2 /* TreeVisibility.Recurse */;
        }
        filterCommentNode(comment, parentVisibility) {
            const matchesResolvedState = (comment.threadState === undefined) || (this.options.showResolved && languages_1.CommentThreadState.Resolved === comment.threadState) ||
                (this.options.showUnresolved && languages_1.CommentThreadState.Unresolved === comment.threadState);
            if (!matchesResolvedState) {
                return false;
            }
            if (!this.options.textFilter.text) {
                return true;
            }
            const textMatches = 
            // Check body of comment for value
            commentsFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, typeof comment.comment.body === 'string' ? comment.comment.body : comment.comment.body.value)
                // Check first user for value
                || commentsFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, comment.comment.userName)
                // Check all replies for value
                || comment.replies.map(reply => {
                    // Check user for value
                    return commentsFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, reply.comment.userName)
                        // Check body of reply for value
                        || commentsFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, typeof reply.comment.body === 'string' ? reply.comment.body : reply.comment.body.value);
                }).filter(value => !!value).flat();
            // Matched and not negated
            if (textMatches.length && !this.options.textFilter.negate) {
                return { visibility: true, data: { type: 1 /* FilterDataType.Comment */, textMatches } };
            }
            // Matched and negated - exclude it only if parent visibility is not set
            if (textMatches.length && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return false;
            }
            // Not matched and negated - include it only if parent visibility is not set
            if ((textMatches.length === 0) && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return true;
            }
            return parentVisibility;
        }
    }
    exports.Filter = Filter;
    let CommentsList = class CommentsList extends listService_1.WorkbenchObjectTree {
        constructor(labels, container, options, contextKeyService, listService, instantiationService, configurationService) {
            const delegate = new CommentsModelVirualDelegate();
            const renderers = [
                instantiationService.createInstance(ResourceWithCommentsRenderer, labels),
                instantiationService.createInstance(CommentNodeRenderer)
            ];
            super('CommentsTree', container, delegate, renderers, {
                accessibilityProvider: options.accessibilityProvider,
                identityProvider: {
                    getId: (element) => {
                        if (element instanceof commentsModel_1.CommentsModel) {
                            return 'root';
                        }
                        if (element instanceof commentModel_1.ResourceWithCommentThreads) {
                            return `${element.owner}-${element.id}`;
                        }
                        if (element instanceof commentModel_1.CommentNode) {
                            return `${element.owner}-${element.resource.toString()}-${element.threadId}-${element.comment.uniqueIdInThread}` + (element.isRoot ? '-root' : '');
                        }
                        return '';
                    }
                },
                expandOnlyOnTwistieClick: true,
                collapseByDefault: false,
                overrideStyles: options.overrideStyles,
                filter: options.filter,
                findWidgetEnabled: false
            }, instantiationService, contextKeyService, listService, configurationService);
        }
        filterComments() {
            this.refilter();
        }
        getVisibleItemCount() {
            let filtered = 0;
            const root = this.getNode();
            for (const resourceNode of root.children) {
                for (const commentNode of resourceNode.children) {
                    if (commentNode.visible && resourceNode.visible) {
                        filtered++;
                    }
                }
            }
            return filtered;
        }
    };
    exports.CommentsList = CommentsList;
    exports.CommentsList = CommentsList = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, listService_1.IListService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, configuration_1.IConfigurationService)
    ], CommentsList);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNUcmVlVmlld2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRzVHJlZVZpZXdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQ25GLFFBQUEsZ0JBQWdCLEdBQUcsMEJBQTBCLENBQUM7SUFDOUMsUUFBQSx3QkFBd0IsR0FBRyxVQUFVLENBQUM7SUFDdEMsUUFBQSxtQkFBbUIsR0FBcUIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxVQUFVLENBQUMsQ0FBQztJQTRCdEcsTUFBTSwyQkFBMkI7aUJBQ1IsZ0JBQVcsR0FBRyx3QkFBd0IsQ0FBQztpQkFDdkMsZUFBVSxHQUFHLGNBQWMsQ0FBQztRQUdwRCxTQUFTLENBQUMsT0FBWTtZQUNyQixJQUFJLENBQUMsT0FBTyxZQUFZLDBCQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztnQkFDNUQsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDO1lBQ0QsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQVk7WUFDaEMsSUFBSSxPQUFPLFlBQVkseUNBQTBCLEVBQUUsQ0FBQztnQkFDbkQsT0FBTywyQkFBMkIsQ0FBQyxXQUFXLENBQUM7WUFDaEQsQ0FBQztZQUNELElBQUksT0FBTyxZQUFZLDBCQUFXLEVBQUUsQ0FBQztnQkFDcEMsT0FBTywyQkFBMkIsQ0FBQyxVQUFVLENBQUM7WUFDL0MsQ0FBQztZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQzs7SUFHRixNQUFhLDRCQUE0QjtRQUd4QyxZQUNTLE1BQXNCO1lBQXRCLFdBQU0sR0FBTixNQUFNLENBQWdCO1lBSC9CLGVBQVUsR0FBVyx3QkFBd0IsQ0FBQztR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
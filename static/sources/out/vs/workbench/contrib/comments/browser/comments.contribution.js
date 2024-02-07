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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/contrib/comments/browser/commentService", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/contributions", "vs/workbench/services/activity/common/activity", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/editor/common/languages", "vs/platform/actions/common/actions", "vs/workbench/contrib/comments/browser/commentsView", "vs/workbench/browser/parts/views/viewPane", "vs/base/common/codicons", "vs/workbench/contrib/comments/browser/commentsEditorContribution"], function (require, exports, nls, extensions_1, platform_1, commentService_1, configurationRegistry_1, lifecycle_1, contextkey_1, contributions_1, activity_1, commentsTreeViewer_1, languages_1, actions_1, commentsView_1, viewPane_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UnresolvedCommentsBadge = void 0;
    (0, actions_1.registerAction2)(class Collapse extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: commentsTreeViewer_1.COMMENTS_VIEW_ID,
                id: 'comments.collapse',
                title: nls.localize('collapseAll', "Collapse All"),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', commentsTreeViewer_1.COMMENTS_VIEW_ID), commentsView_1.CONTEXT_KEY_HAS_COMMENTS), commentsView_1.CONTEXT_KEY_SOME_COMMENTS_EXPANDED),
                    order: 100
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    (0, actions_1.registerAction2)(class Expand extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: commentsTreeViewer_1.COMMENTS_VIEW_ID,
                id: 'comments.expand',
                title: nls.localize('expandAll', "Expand All"),
                f1: false,
                icon: codicons_1.Codicon.expandAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', commentsTreeViewer_1.COMMENTS_VIEW_ID), commentsView_1.CONTEXT_KEY_HAS_COMMENTS), contextkey_1.ContextKeyExpr.not(commentsView_1.CONTEXT_KEY_SOME_COMMENTS_EXPANDED.key)),
                    order: 100
                }
            });
        }
        runInView(_accessor, view) {
            view.expandAll();
        }
    });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'comments',
        order: 20,
        title: nls.localize('commentsConfigurationTitle', "Comments"),
        type: 'object',
        properties: {
            'comments.openPanel': {
                enum: ['neverOpen', 'openOnSessionStart', 'openOnSessionStartWithComments'],
                default: 'openOnSessionStartWithComments',
                description: nls.localize('openComments', "Controls when the comments panel should open."),
                restricted: false,
                markdownDeprecationMessage: nls.localize('comments.openPanel.deprecated', "This setting is deprecated in favor of `comments.openView`.")
            },
            'comments.openView': {
                enum: ['never', 'file', 'firstFile', 'firstFileUnresolved'],
                enumDescriptions: [nls.localize('comments.openView.never', "The comments view will never be opened."), nls.localize('comments.openView.file', "The comments view will open when a file with comments is active."), nls.localize('comments.openView.firstFile', "If the comments view has not been opened yet during this session it will open the first time during a session that a file with comments is active."), nls.localize('comments.openView.firstFileUnresolved', "If the comments view has not been opened yet during this session and the comment is not resolved, it will open the first time during a session that a file with comments is active.")],
                default: 'firstFile',
                description: nls.localize('comments.openView', "Controls when the comments view should open."),
                restricted: false
            },
            'comments.useRelativeTime': {
                type: 'boolean',
                default: true,
                description: nls.localize('useRelativeTime', "Determines if relative time will be used in comment timestamps (ex. '1 day ago').")
            },
            'comments.visible': {
                type: 'boolean',
                default: true,
                description: nls.localize('comments.visible', "Controls the visibility of the comments bar and comment threads in editors that have commenting ranges and comments. Comments are still accessible via the Comments view and will cause commenting to be toggled on in the same way running the command \"Comments: Toggle Editor Commenting\" toggles comments.")
            },
            'comments.maxHeight': {
                type: 'boolean',
                default: true,
                description: nls.localize('comments.maxHeight', "Controls whether the comments widget scrolls or expands.")
            },
            'comments.collapseOnResolve': {
                type: 'boolean',
                default: true,
                description: nls.localize('collapseOnResolve', "Controls whether the comment thread should collapse when the thread is resolved.")
            }
        }
    });
    (0, extensions_1.registerSingleton)(commentService_1.ICommentService, commentService_1.CommentService, 1 /* InstantiationType.Delayed */);
    let UnresolvedCommentsBadge = class UnresolvedCommentsBadge extends lifecycle_1.Disposable {
        constructor(_commentService, activityService) {
            super();
            this._commentService = _commentService;
            this.activityService = activityService;
            this.activity = this._register(new lifecycle_1.MutableDisposable());
            this.totalUnresolved = 0;
            this._register(this._commentService.onDidSetAllCommentThreads(this.onAllCommentsChanged, this));
            this._register(this._commentService.onDidUpdateCommentThreads(this.onCommentsUpdated, this));
        }
        onAllCommentsChanged(e) {
            let unresolved = 0;
            for (const thread of e.commentThreads) {
                if (thread.state === languages_1.CommentThreadState.Unresolved) {
                    unresolved++;
                }
            }
            this.updateBadge(unresolved);
        }
        onCommentsUpdated() {
            let unresolved = 0;
            for (const resource of this._commentService.commentsModel.resourceCommentThreads) {
                for (const thread of resource.commentThreads) {
                    if (thread.threadState === languages_1.CommentThreadState.Unresolved) {
                        unresolved++;
                    }
                }
            }
            this.updateBadge(unresolved);
        }
        updateBadge(unresolved) {
            if (unresolved === this.totalUnresolved) {
                return;
            }
            this.totalUnresolved = unresolved;
            const message = nls.localize('totalUnresolvedComments', '{0} Unresolved Comments', this.totalUnresolved);
            this.activity.value = this.activityService.showViewActivity(commentsTreeViewer_1.COMMENTS_VIEW_ID, { badge: new activity_1.NumberBadge(this.totalUnresolved, () => message) });
        }
    };
    exports.UnresolvedCommentsBadge = UnresolvedCommentsBadge;
    exports.UnresolvedCommentsBadge = UnresolvedCommentsBadge = __decorate([
        __param(0, commentService_1.ICommentService),
        __param(1, activity_1.IActivityService)
    ], UnresolvedCommentsBadge);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(UnresolvedCommentsBadge, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRzLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQmhHLElBQUEseUJBQWUsRUFBQyxNQUFNLFFBQVMsU0FBUSxxQkFBeUI7UUFDL0Q7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsTUFBTSxFQUFFLHFDQUFnQjtnQkFDeEIsRUFBRSxFQUFFLG1CQUFtQjtnQkFDdkIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQztnQkFDbEQsRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsSUFBSSxFQUFFLGtCQUFPLENBQUMsV0FBVztnQkFDekIsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7b0JBQ3BCLEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLHFDQUFnQixDQUFDLEVBQUUsdUNBQXdCLENBQUMsRUFBRSxpREFBa0MsQ0FBQztvQkFDM0osS0FBSyxFQUFFLEdBQUc7aUJBQ1Y7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsU0FBUyxDQUFDLFNBQTJCLEVBQUUsSUFBbUI7WUFDekQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BCLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxNQUFPLFNBQVEscUJBQXlCO1FBQzdEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLE1BQU0sRUFBRSxxQ0FBZ0I7Z0JBQ3hCLEVB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
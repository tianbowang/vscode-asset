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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/workbench/contrib/comments/browser/commentMenus", "vs/workbench/services/layout/browser/layoutService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/platform/log/common/log", "vs/workbench/contrib/comments/browser/commentsModel"], function (require, exports, instantiation_1, event_1, lifecycle_1, range_1, cancellation_1, commentMenus_1, layoutService_1, configuration_1, commentsConfiguration_1, contextkey_1, storage_1, commentContextKeys_1, log_1, commentsModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentService = exports.ICommentService = void 0;
    exports.ICommentService = (0, instantiation_1.createDecorator)('commentService');
    const CONTINUE_ON_COMMENTS = 'comments.continueOnComments';
    let CommentService = class CommentService extends lifecycle_1.Disposable {
        constructor(instantiationService, layoutService, configurationService, contextKeyService, storageService, logService) {
            super();
            this.instantiationService = instantiationService;
            this.layoutService = layoutService;
            this.configurationService = configurationService;
            this.storageService = storageService;
            this.logService = logService;
            this._onDidSetDataProvider = this._register(new event_1.Emitter());
            this.onDidSetDataProvider = this._onDidSetDataProvider.event;
            this._onDidDeleteDataProvider = this._register(new event_1.Emitter());
            this.onDidDeleteDataProvider = this._onDidDeleteDataProvider.event;
            this._onDidSetResourceCommentInfos = this._register(new event_1.Emitter());
            this.onDidSetResourceCommentInfos = this._onDidSetResourceCommentInfos.event;
            this._onDidSetAllCommentThreads = this._register(new event_1.Emitter());
            this.onDidSetAllCommentThreads = this._onDidSetAllCommentThreads.event;
            this._onDidUpdateCommentThreads = this._register(new event_1.Emitter());
            this.onDidUpdateCommentThreads = this._onDidUpdateCommentThreads.event;
            this._onDidUpdateNotebookCommentThreads = this._register(new event_1.Emitter());
            this.onDidUpdateNotebookCommentThreads = this._onDidUpdateNotebookCommentThreads.event;
            this._onDidUpdateCommentingRanges = this._register(new event_1.Emitter());
            this.onDidUpdateCommentingRanges = this._onDidUpdateCommentingRanges.event;
            this._onDidChangeActiveCommentThread = this._register(new event_1.Emitter());
            this.onDidChangeActiveCommentThread = this._onDidChangeActiveCommentThread.event;
            this._onDidChangeCurrentCommentThread = this._register(new event_1.Emitter());
            this.onDidChangeCurrentCommentThread = this._onDidChangeCurrentCommentThread.event;
            this._onDidChangeCommentingEnabled = this._register(new event_1.Emitter());
            this.onDidChangeCommentingEnabled = this._onDidChangeCommentingEnabled.event;
            this._onDidChangeActiveCommentingRange = this._register(new event_1.Emitter());
            this.onDidChangeActiveCommentingRange = this._onDidChangeActiveCommentingRange.event;
            this._commentControls = new Map();
            this._commentMenus = new Map();
            this._isCommentingEnabled = true;
            this._continueOnComments = new Map(); // owner -> PendingCommentThread[]
            this._continueOnCommentProviders = new Set();
            this._commentsModel = this._register(new commentsModel_1.CommentsModel());
            this.commentsModel = this._commentsModel;
            this._handleConfiguration();
            this._handleZenMode();
            this._workspaceHasCommenting = commentContextKeys_1.CommentContextKeys.WorkspaceHasCommenting.bindTo(contextKeyService);
            const storageListener = this._register(new lifecycle_1.DisposableStore());
            const storageEvent = event_1.Event.debounce(this.storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, CONTINUE_ON_COMMENTS, storageListener), (last, event) => last?.external ? last : event, 500);
            storageListener.add(storageEvent(v => {
                if (!v.external) {
                    return;
                }
                const commentsToRestore = this.storageService.getObject(CONTINUE_ON_COMMENTS, 1 /* StorageScope.WORKSPACE */);
                if (!commentsToRestore) {
                    return;
                }
                this.logService.debug(`Comments: URIs of continue on comments from storage ${commentsToRestore.map(thread => thread.uri.toString()).join(', ')}.`);
                const changedOwners = this._addContinueOnComments(commentsToRestore, this._continueOnComments);
                for (const owner of changedOwners) {
                    const control = this._commentControls.get(owner);
                    if (!control) {
                        continue;
                    }
                    const evt = {
                        owner,
                        ownerLabel: control.label,
                        pending: this._continueOnComments.get(owner) || [],
                        added: [],
                        removed: [],
                        changed: []
                    };
                    this.updateModelThreads(evt);
                }
            }));
            this._register(storageService.onWillSaveState(() => {
                const map = new Map();
                for (const provider of this._continueOnCommentProviders) {
                    const pendingComments = provider.provideContinueOnComments();
                    this._addContinueOnComments(pendingComments, map);
                }
                this._saveContinueOnComments(map);
            }));
        }
        _handleConfiguration() {
            this._isCommentingEnabled = this._defaultCommentingEnablement;
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('comments.visible')) {
                    this.enableCommenting(this._defaultCommentingEnablement);
                }
            }));
        }
        _handleZenMode() {
            let preZenModeValue = this._isCommentingEnabled;
            this._register(this.layoutService.onDidChangeZenMode(e => {
                if (e) {
                    preZenModeValue = this._isCommentingEnabled;
                    this.enableCommenting(false);
                }
                else {
                    this.enableCommenting(preZenModeValue);
                }
            }));
        }
        get _defaultCommentingEnablement() {
            return !!this.configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION)?.visible;
        }
        get isCommentingEnabled() {
            return this._isCommentingEnabled;
        }
        enableCommenting(enable) {
            if (enable !== this._isCommentingEnabled) {
                this._isCommentingEnabled = enable;
                this._onDidChangeCommentingEnabled.fire(enable);
            }
        }
        /**
         * The current comment thread is the thread that has focus or is being hovered.
         * @param commentThread
         */
        setCurrentCommentThread(commentThread) {
            this._onDidChangeCurrentCommentThread.fire(commentThread);
        }
        /**
         * The active comment thread is the the thread that is currently being edited.
         * @param commentThread
         */
        setActiveCommentThread(commentThread) {
            this._onDidChangeActiveCommentThread.fire(commentThread);
        }
        setDocumentComments(resource, commentInfos) {
            if (commentInfos.length) {
                this._workspaceHasCommenting.set(true);
            }
            this._onDidSetResourceCommentInfos.fire({ resource, commentInfos });
        }
        setModelThreads(ownerId, ownerLabel, commentThreads) {
            this._commentsModel.setCommentThreads(ownerId, ownerLabel, commentThreads);
            this._onDidSetAllCommentThreads.fire({ ownerId, ownerLabel, commentThreads });
        }
        updateModelThreads(event) {
            this._commentsModel.updateCommentThreads(event);
            this._onDidUpdateCommentThreads.fire(event);
        }
        setWorkspaceComments(owner, commentsByResource) {
            if (commentsByResource.length) {
                this._workspaceHasCommenting.set(true);
            }
            const control = this._commentControls.get(owner);
            if (control) {
                this.setModelThreads(owner, control.label, commentsByResource);
            }
        }
        removeWorkspaceComments(owner) {
            const control = this._commentControls.get(owner);
            if (control) {
                this.setModelThreads(owner, control.label, []);
            }
        }
        registerCommentController(owner, commentControl) {
            this._commentControls.set(owner, commentControl);
            this._onDidSetDataProvider.fire();
        }
        unregisterCommentController(owner) {
            if (owner) {
                this._commentControls.delete(owner);
            }
            else {
                this._commentControls.clear();
            }
            this._commentsModel.deleteCommentsByOwner(owner);
            this._onDidDeleteDataProvider.fire(owner);
        }
        getCommentController(owner) {
            return this._commentControls.get(owner);
        }
        async createCommentThreadTemplate(owner, resource, range) {
            const commentController = this._commentControls.get(owner);
            if (!commentController) {
                return;
            }
            return commentController.createCommentThreadTemplate(resource, range);
        }
        async updateCommentThreadTemplate(owner, threadHandle, range) {
            const commentController = this._commentControls.get(owner);
            if (!commentController) {
                return;
            }
            await commentController.updateCommentThreadTemplate(threadHandle, range);
        }
        disposeCommentThread(owner, threadId) {
            const controller = this.getCommentController(owner);
            controller?.deleteCommentThreadMain(threadId);
        }
        getCommentMenus(owner) {
            if (this._commentMenus.get(owner)) {
                return this._commentMenus.get(owner);
            }
            const menu = this.instantiationService.createInstance(commentMenus_1.CommentMenus);
            this._commentMenus.set(owner, menu);
            return menu;
        }
        updateComments(ownerId, event) {
            const control = this._commentControls.get(ownerId);
            if (control) {
                const evt = Object.assign({}, event, { owner: ownerId, ownerLabel: control.label });
                this.updateModelThreads(evt);
            }
        }
        updateNotebookComments(ownerId, event) {
            const evt = Object.assign({}, event, { owner: ownerId });
            this._onDidUpdateNotebookCommentThreads.fire(evt);
        }
        updateCommentingRanges(ownerId) {
            this._workspaceHasCommenting.set(true);
            this._onDidUpdateCommentingRanges.fire({ owner: ownerId });
        }
        async toggleReaction(owner, resource, thread, comment, reaction) {
            const commentController = this._commentControls.get(owner);
            if (commentController) {
                return commentController.toggleReaction(resource, thread, comment, reaction, cancellation_1.CancellationToken.None);
            }
            else {
                throw new Error('Not supported');
            }
        }
        hasReactionHandler(owner) {
            const commentProvider = this._commentControls.get(owner);
            if (commentProvider) {
                return !!commentProvider.features.reactionHandler;
            }
            return false;
        }
        async getDocumentComments(resource) {
            const commentControlResult = [];
            for (const control of this._commentControls.values()) {
                commentControlResult.push(control.getDocumentComments(resource, cancellation_1.CancellationToken.None)
                    .then(documentComments => {
                    // Check that there aren't any continue on comments in the provided comments
                    // This can happen because continue on comments are stored separately from local un-submitted comments.
                    for (const documentCommentThread of documentComments.threads) {
                        if (documentCommentThread.comments?.length === 0 && documentCommentThread.range) {
                            this.removeContinueOnComment({ range: documentCommentThread.range, uri: resource, owner: documentComments.owner });
                        }
                    }
                    const pendingComments = this._continueOnComments.get(documentComments.owner);
                    documentComments.pendingCommentThreads = pendingComments?.filter(pendingComment => pendingComment.uri.toString() === resource.toString());
                    return documentComments;
                })
                    .catch(_ => {
                    return null;
                }));
            }
            return Promise.all(commentControlResult);
        }
        async getNotebookComments(resource) {
            const commentControlResult = [];
            this._commentControls.forEach(control => {
                commentControlResult.push(control.getNotebookComments(resource, cancellation_1.CancellationToken.None)
                    .catch(_ => {
                    return null;
                }));
            });
            return Promise.all(commentControlResult);
        }
        registerContinueOnCommentProvider(provider) {
            this._continueOnCommentProviders.add(provider);
            return {
                dispose: () => {
                    this._continueOnCommentProviders.delete(provider);
                }
            };
        }
        _saveContinueOnComments(map) {
            const commentsToSave = [];
            for (const pendingComments of map.values()) {
                commentsToSave.push(...pendingComments);
            }
            this.logService.debug(`Comments: URIs of continue on comments to add to storage ${commentsToSave.map(thread => thread.uri.toString()).join(', ')}.`);
            this.storageService.store(CONTINUE_ON_COMMENTS, commentsToSave, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        removeContinueOnComment(pendingComment) {
            const pendingComments = this._continueOnComments.get(pendingComment.owner);
            if (pendingComments) {
                const commentIndex = pendingComments.findIndex(comment => comment.uri.toString() === pendingComment.uri.toString() && range_1.Range.equalsRange(comment.range, pendingComment.range) && (pendingComment.isReply === undefined || comment.isReply === pendingComment.isReply));
                if (commentIndex > -1) {
                    return pendingComments.splice(commentIndex, 1)[0];
                }
            }
            return undefined;
        }
        _addContinueOnComments(pendingComments, map) {
            const changedOwners = new Set();
            for (const pendingComment of pendingComments) {
                if (!map.has(pendingComment.owner)) {
                    map.set(pendingComment.owner, [pendingComment]);
                    changedOwners.add(pendingComment.owner);
                }
                else {
                    const commentsForOwner = map.get(pendingComment.owner);
                    if (commentsForOwner.every(comment => (comment.uri.toString() !== pendingComment.uri.toString()) || !range_1.Range.equalsRange(comment.range, pendingComment.range))) {
                        commentsForOwner.push(pendingComment);
                        changedOwners.add(pendingComment.owner);
                    }
                }
            }
            return changedOwners;
        }
    };
    exports.CommentService = CommentService;
    exports.CommentService = CommentService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, layoutService_1.IWorkbenchLayoutService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, storage_1.IStorageService),
        __param(5, log_1.ILogService)
    ], CommentService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbW1lbnRzL2Jyb3dzZXIvY29tbWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJuRixRQUFBLGVBQWUsR0FBRyxJQUFBLCtCQUFlLEVBQWtCLGdCQUFnQixDQUFDLENBQUM7SUEwRmxGLE1BQU0sb0JBQW9CLEdBQUcsNkJBQTZCLENBQUM7SUFFcEQsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHNCQUFVO1FBcUQ3QyxZQUN3QixvQkFBOEQsRUFDNUQsYUFBdUQsRUFDekQsb0JBQTRELEVBQy9ELGlCQUFxQyxFQUN4QyxjQUFnRCxFQUNwRCxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQVBrQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUN4Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBRWpELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNuQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBeERyQywwQkFBcUIsR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDbkYseUJBQW9CLEdBQWdCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7WUFFN0QsNkJBQXdCLEdBQWdDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXNCLENBQUMsQ0FBQztZQUNsSCw0QkFBdUIsR0FBOEIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQztZQUVqRixrQ0FBNkIsR0FBeUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBK0IsQ0FBQyxDQUFDO1lBQ3pJLGlDQUE0QixHQUF1QyxJQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDO1lBRXBHLCtCQUEwQixHQUEyQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFpQyxDQUFDLENBQUM7WUFDMUksOEJBQXlCLEdBQXlDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7WUFFaEcsK0JBQTBCLEdBQXdDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQThCLENBQUMsQ0FBQztZQUNwSSw4QkFBeUIsR0FBc0MsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQztZQUU3Rix1Q0FBa0MsR0FBZ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBc0MsQ0FBQyxDQUFDO1lBQzVKLHNDQUFpQyxHQUE4QyxJQUFJLENBQUMsa0NBQWtDLENBQUMsS0FBSyxDQUFDO1lBRXJILGlDQUE0QixHQUErQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFxQixDQUFDLENBQUM7WUFDcEgsZ0NBQTJCLEdBQTZCLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUM7WUFFeEYsb0NBQStCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBd0IsQ0FBQyxDQUFDO1lBQzlGLG1DQUE4QixHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxLQUFLLENBQUM7WUFFcEUscUNBQWdDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBNkIsQ0FBQyxDQUFDO1lBQ3BHLG9DQUErQixHQUFHLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUM7WUFFdEUsa0NBQTZCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVyxDQUFDLENBQUM7WUFDL0UsaUNBQTRCLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssQ0FBQztZQUVoRSxzQ0FBaUMsR0FHN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFHM0IsQ0FBQyxDQUFDO1lBQ0cscUNBQWdDLEdBQW9FLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxLQUFLLENBQUM7WUFFbEoscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7WUFDekQsa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztZQUNoRCx5QkFBb0IsR0FBWSxJQUFJLENBQUM7WUFHckMsd0JBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQWtDLENBQUMsQ0FBQyxrQ0FBa0M7WUFDbkcsZ0NBQTJCLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7WUFFM0QsbUJBQWMsR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLGtCQUFhLEdBQW1CLElBQUksQ0FBQyxjQUFjLENBQUM7WUFXbkUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyx1QkFBdUIsR0FBRyx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNuRyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFFOUQsTUFBTSxZQUFZLEdBQUcsYUFBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixpQ0FBeUIsb0JBQW9CLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM5TCxlQUFlLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDakIsT0FBTztnQkFDUixDQUFDO2dCQUNELE1BQU0saUJBQWlCLEdBQXVDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLG9CQUFvQixpQ0FBeUIsQ0FBQztnQkFDMUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7b0JBQ3hCLE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyx1REFBdUQsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25KLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDL0YsS0FBSyxNQUFNLEtBQUssSUFBSSxhQUFhLEVBQUUsQ0FBQztvQkFDbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUNkLFNBQVM7b0JBQ1YsQ0FBQztvQkFDRCxNQUFNLEdBQUcsR0FBK0I7d0JBQ3ZDLEtBQUs7d0JBQ0wsVUFBVSxFQUFFLE9BQU8sQ0FBQyxLQUFLO3dCQUN6QixPQUFPLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO3dCQUNsRCxLQUFLLEVBQUUsRUFBRTt3QkFDVCxPQUFPLEVBQUUsRUFBRTt3QkFDWCxPQUFPLEVBQUUsRUFBRTtxQkFDWCxDQUFDO29CQUNGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDOUIsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFO2dCQUNsRCxNQUFNLEdBQUcsR0FBd0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDM0QsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztvQkFDekQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLHlCQUF5QixFQUFFLENBQUM7b0JBQzdELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ25ELENBQUM7Z0JBQ0QsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sb0JBQW9CO1lBQzNCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUM7WUFDOUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JFLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztvQkFDaEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyxjQUFjO1lBQ3JCLElBQUksZUFBZSxHQUFZLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztZQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3hELElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ1AsZUFBZSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztvQkFDNUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN4QyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFZLDRCQUE0QjtZQUN2QyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFxQyx3Q0FBZ0IsQ0FBQyxFQUFFLE9BQU8sQ0FBQztRQUM1RyxDQUFDO1FBRUQsSUFBSSxtQkFBbUI7WUFDdEIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7UUFDbEMsQ0FBQztRQUVELGdCQUFnQixDQUFDLE1BQWU7WUFDL0IsSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxNQUFNLENBQUM7Z0JBQ25DLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakQsQ0FBQztRQUNGLENBQUM7UUFFRDs7O1dBR0c7UUFDSCx1QkFBdUIsQ0FBQyxhQUF3QztZQUMvRCxJQUFJLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRDs7O1dBR0c7UUFDSCxzQkFBc0IsQ0FBQyxhQUFtQztZQUN6RCxJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxRQUFhLEVBQUUsWUFBNEI7WUFDOUQsSUFBSSxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUNELElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRU8sZUFBZSxDQUFDLE9BQWUsRUFBRSxVQUFrQixFQUFFLGNBQXVDO1lBQ25HLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxLQUFpQztZQUMzRCxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELG9CQUFvQixDQUFDLEtBQWEsRUFBRSxrQkFBbUM7WUFFdEUsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqRCxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNoRSxDQUFDO1FBQ0YsQ0FBQztRQUVELHVCQUF1QixDQUFDLEtBQWE7WUFDcEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqRCxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDaEQsQ0FBQztRQUNGLENBQUM7UUFFRCx5QkFBeUIsQ0FBQyxLQUFhLEVBQUUsY0FBa0M7WUFDMUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFRCwyQkFBMkIsQ0FBQyxLQUFjO1lBQ3pDLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQy9CLENBQUM7WUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELG9CQUFvQixDQUFDLEtBQWE7WUFDakMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFRCxLQUFLLENBQUMsMkJBQTJCLENBQUMsS0FBYSxFQUFFLFFBQWEsRUFBRSxLQUF3QjtZQUN2RixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFM0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3hCLE9BQU87WUFDUixDQUFDO1lBRUQsT0FBTyxpQkFBaUIsQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVELEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxLQUFhLEVBQUUsWUFBb0IsRUFBRSxLQUFZO1lBQ2xGLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUzRCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDeEIsT0FBTztZQUNSLENBQUM7WUFFRCxNQUFNLGlCQUFpQixDQUFDLDJCQUEyQixDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRUQsb0JBQW9CLENBQUMsS0FBYSxFQUFFLFFBQWdCO1lBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwRCxVQUFVLEVBQUUsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVELGVBQWUsQ0FBQyxLQUFhO1lBQzVCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUUsQ0FBQztZQUN2QyxDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQkFBWSxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELGNBQWMsQ0FBQyxPQUFlLEVBQUUsS0FBd0M7WUFDdkUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuRCxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLE1BQU0sR0FBRyxHQUErQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDaEgsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLENBQUM7UUFDRixDQUFDO1FBRUQsc0JBQXNCLENBQUMsT0FBZSxFQUFFLEtBQTRDO1lBQ25GLE1BQU0sR0FBRyxHQUF1QyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUM3RixJQUFJLENBQUMsa0NBQWtDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxzQkFBc0IsQ0FBQyxPQUFlO1lBQ3JDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQWEsRUFBRSxRQUFhLEVBQUUsTUFBcUIsRUFBRSxPQUFnQixFQUFFLFFBQXlCO1lBQ3BILE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUzRCxJQUFJLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3ZCLE9BQU8saUJBQWlCLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNsQyxDQUFDO1FBQ0YsQ0FBQztRQUVELGtCQUFrQixDQUFDLEtBQWE7WUFDL0IsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV6RCxJQUFJLGVBQWUsRUFBRSxDQUFDO2dCQUNyQixPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQztZQUNuRCxDQUFDO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFFBQWE7WUFDdEMsTUFBTSxvQkFBb0IsR0FBbUMsRUFBRSxDQUFDO1lBRWhFLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ3RELG9CQUFvQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQztxQkFDckYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7b0JBQ3hCLDRFQUE0RTtvQkFDNUUsdUdBQXVHO29CQUN2RyxLQUFLLE1BQU0scUJBQXFCLElBQUksZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQzlELElBQUkscUJBQXFCLENBQUMsUUFBUSxFQUFFLE1BQU0sS0FBSyxDQUFDLElBQUkscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUM7NEJBQ2pGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEtBQUssRUFBRSxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzt3QkFDcEgsQ0FBQztvQkFDRixDQUFDO29CQUNELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzdFLGdCQUFnQixDQUFDLHFCQUFxQixHQUFHLGVBQWUsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO29CQUMxSSxPQUFPLGdCQUFnQixDQUFDO2dCQUN6QixDQUFDLENBQUM7cUJBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNWLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDTixDQUFDO1lBRUQsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxRQUFhO1lBQ3RDLE1BQU0sb0JBQW9CLEdBQTJDLEVBQUUsQ0FBQztZQUV4RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN2QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUM7cUJBQ3JGLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDVixPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ04sQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQsaUNBQWlDLENBQUMsUUFBb0M7WUFDckUsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxPQUFPO2dCQUNOLE9BQU8sRUFBRSxHQUFHLEVBQUU7b0JBQ2IsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbkQsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBRU8sdUJBQXVCLENBQUMsR0FBd0M7WUFDdkUsTUFBTSxjQUFjLEdBQTJCLEVBQUUsQ0FBQztZQUNsRCxLQUFLLE1BQU0sZUFBZSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUM1QyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUM7WUFDekMsQ0FBQztZQUNELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLDREQUE0RCxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckosSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsY0FBYyw2REFBNkMsQ0FBQztRQUM3RyxDQUFDO1FBRUQsdUJBQXVCLENBQUMsY0FBNkU7WUFDcEcsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0UsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxhQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDdFEsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDdkIsT0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztZQUNGLENBQUM7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU8sc0JBQXNCLENBQUMsZUFBdUMsRUFBRSxHQUF3QztZQUMvRyxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQ3hDLEtBQUssTUFBTSxjQUFjLElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNwQyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUNoRCxhQUFhLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDekMsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFFLENBQUM7b0JBQ3hELElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUM5SixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQ3RDLGFBQWEsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN6QyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1lBQ0QsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztLQUNELENBQUE7SUE5V1ksd0NBQWM7NkJBQWQsY0FBYztRQXNEeEIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHVDQUF1QixDQUFBO1FBQ3ZCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLGlCQUFXLENBQUE7T0EzREQsY0FBYyxDQThXMUIifQ==
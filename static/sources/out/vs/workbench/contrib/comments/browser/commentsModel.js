/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/uri", "vs/nls", "vs/workbench/contrib/comments/common/commentModel", "vs/base/common/lifecycle"], function (require, exports, arrays_1, uri_1, nls_1, commentModel_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentsModel = void 0;
    class CommentsModel extends lifecycle_1.Disposable {
        get resourceCommentThreads() { return this._resourceCommentThreads; }
        constructor() {
            super();
            this._resourceCommentThreads = [];
            this.commentThreadsMap = new Map();
        }
        updateResourceCommentThreads() {
            const includeLabel = this.commentThreadsMap.size > 1;
            this._resourceCommentThreads = [...this.commentThreadsMap.values()].map(value => {
                return value.resourceWithCommentThreads.map(resource => {
                    resource.ownerLabel = includeLabel ? value.ownerLabel : undefined;
                    return resource;
                }).flat();
            }).flat();
            this._resourceCommentThreads.sort((a, b) => {
                return a.resource.toString() > b.resource.toString() ? 1 : -1;
            });
        }
        setCommentThreads(owner, ownerLabel, commentThreads) {
            this.commentThreadsMap.set(owner, { ownerLabel, resourceWithCommentThreads: this.groupByResource(owner, commentThreads) });
            this.updateResourceCommentThreads();
        }
        deleteCommentsByOwner(owner) {
            if (owner) {
                const existingOwner = this.commentThreadsMap.get(owner);
                this.commentThreadsMap.set(owner, { ownerLabel: existingOwner?.ownerLabel, resourceWithCommentThreads: [] });
            }
            else {
                this.commentThreadsMap.clear();
            }
            this.updateResourceCommentThreads();
        }
        updateCommentThreads(event) {
            const { owner, ownerLabel, removed, changed, added } = event;
            const threadsForOwner = this.commentThreadsMap.get(owner)?.resourceWithCommentThreads || [];
            removed.forEach(thread => {
                // Find resource that has the comment thread
                const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
                const matchingResourceData = matchingResourceIndex >= 0 ? threadsForOwner[matchingResourceIndex] : undefined;
                // Find comment node on resource that is that thread and remove it
                const index = matchingResourceData?.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId) ?? 0;
                if (index >= 0) {
                    matchingResourceData?.commentThreads.splice(index, 1);
                }
                // If the comment thread was the last thread for a resource, remove that resource from the list
                if (matchingResourceData?.commentThreads.length === 0) {
                    threadsForOwner.splice(matchingResourceIndex, 1);
                }
            });
            changed.forEach(thread => {
                // Find resource that has the comment thread
                const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
                const matchingResourceData = matchingResourceIndex >= 0 ? threadsForOwner[matchingResourceIndex] : undefined;
                if (!matchingResourceData) {
                    return;
                }
                // Find comment node on resource that is that thread and replace it
                const index = matchingResourceData.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId);
                if (index >= 0) {
                    matchingResourceData.commentThreads[index] = commentModel_1.ResourceWithCommentThreads.createCommentNode(owner, uri_1.URI.parse(matchingResourceData.id), thread);
                }
                else if (thread.comments && thread.comments.length) {
                    matchingResourceData.commentThreads.push(commentModel_1.ResourceWithCommentThreads.createCommentNode(owner, uri_1.URI.parse(matchingResourceData.id), thread));
                }
            });
            added.forEach(thread => {
                const existingResource = threadsForOwner.filter(resourceWithThreads => resourceWithThreads.resource.toString() === thread.resource);
                if (existingResource.length) {
                    const resource = existingResource[0];
                    if (thread.comments && thread.comments.length) {
                        resource.commentThreads.push(commentModel_1.ResourceWithCommentThreads.createCommentNode(owner, resource.resource, thread));
                    }
                }
                else {
                    threadsForOwner.push(new commentModel_1.ResourceWithCommentThreads(owner, uri_1.URI.parse(thread.resource), [thread]));
                }
            });
            this.commentThreadsMap.set(owner, { ownerLabel, resourceWithCommentThreads: threadsForOwner });
            this.updateResourceCommentThreads();
            return removed.length > 0 || changed.length > 0 || added.length > 0;
        }
        hasCommentThreads() {
            return !!this._resourceCommentThreads.length;
        }
        getMessage() {
            if (!this._resourceCommentThreads.length) {
                return (0, nls_1.localize)('noComments', "There are no comments in this workspace yet.");
            }
            else {
                return '';
            }
        }
        groupByResource(owner, commentThreads) {
            const resourceCommentThreads = [];
            const commentThreadsByResource = new Map();
            for (const group of (0, arrays_1.groupBy)(commentThreads, CommentsModel._compareURIs)) {
                commentThreadsByResource.set(group[0].resource, new commentModel_1.ResourceWithCommentThreads(owner, uri_1.URI.parse(group[0].resource), group));
            }
            commentThreadsByResource.forEach((v, i, m) => {
                resourceCommentThreads.push(v);
            });
            return resourceCommentThreads;
        }
        static _compareURIs(a, b) {
            const resourceA = a.resource.toString();
            const resourceB = b.resource.toString();
            if (resourceA < resourceB) {
                return -1;
            }
            else if (resourceA > resourceB) {
                return 1;
            }
            else {
                return 0;
            }
        }
    }
    exports.CommentsModel = CommentsModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50c01vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdCaEcsTUFBYSxhQUFjLFNBQVEsc0JBQVU7UUFHNUMsSUFBSSxzQkFBc0IsS0FBbUMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1FBR25HO1lBRUMsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBNEYsQ0FBQztRQUM5SCxDQUFDO1FBRU8sNEJBQTRCO1lBQ25DLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMvRSxPQUFPLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ3RELFFBQVEsQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQ2xFLE9BQU8sUUFBUSxDQUFDO2dCQUNqQixDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUs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
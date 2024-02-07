/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResourceWithCommentThreads = exports.CommentNode = void 0;
    class CommentNode {
        constructor(owner, threadId, resource, comment, range, threadState) {
            this.replies = [];
            this.owner = owner;
            this.threadId = threadId;
            this.comment = comment;
            this.resource = resource;
            this.range = range;
            this.isRoot = false;
            this.threadState = threadState;
        }
        hasReply() {
            return this.replies && this.replies.length !== 0;
        }
    }
    exports.CommentNode = CommentNode;
    class ResourceWithCommentThreads {
        constructor(owner, resource, commentThreads) {
            this.owner = owner;
            this.id = resource.toString();
            this.resource = resource;
            this.commentThreads = commentThreads.filter(thread => thread.comments && thread.comments.length).map(thread => ResourceWithCommentThreads.createCommentNode(owner, resource, thread));
        }
        static createCommentNode(owner, resource, commentThread) {
            const { threadId, comments, range } = commentThread;
            const commentNodes = comments.map(comment => new CommentNode(owner, threadId, resource, comment, range, commentThread.state));
            if (commentNodes.length > 1) {
                commentNodes[0].replies = commentNodes.slice(1, commentNodes.length);
            }
            commentNodes[0].isRoot = true;
            return commentNodes[0];
        }
    }
    exports.ResourceWithCommentThreads = ResourceWithCommentThreads;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9jb21tb24vY29tbWVudE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFhLFdBQVc7UUFVdkIsWUFBWSxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxRQUFhLEVBQUUsT0FBZ0IsRUFBRSxLQUF5QixFQUFFLFdBQTJDO1lBTHBKLFlBQU8sR0FBa0IsRUFBRSxDQUFDO1lBTTNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxRQUFRO1lBQ1AsT0FBTyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBQ0Q7SUF2QkQsa0NBdUJDO0lBRUQsTUFBYSwwQkFBMEI7UUFPdEMsWUFBWSxLQUFhLEVBQUUsUUFBYSxFQUFFLGNBQStCO1lBQ3hFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdkwsQ0FBQztRQUVNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFhLEVBQUUsUUFBYSxFQUFFLGFBQTRCO1lBQ3pGLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLGFBQWEsQ0FBQztZQUNwRCxNQUFNLFlBQVksR0FBa0IsUUFBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRSxRQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0ksSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM3QixZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0RSxDQUFDO1lBRUQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFFOUIsT0FBTyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsQ0FBQztLQUNEO0lBekJELGdFQXlCQyJ9
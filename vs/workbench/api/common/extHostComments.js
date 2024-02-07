(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/languages", "vs/platform/extensions/common/extensions", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "./extHost.protocol", "vs/workbench/services/extensions/common/extensions"], function (require, exports, async_1, decorators_1, event_1, lifecycle_1, uri_1, languages, extensions_1, extHostTypeConverter, types, extHost_protocol_1, extensions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createExtHostComments = void 0;
    function createExtHostComments(mainContext, commands, documents) {
        const proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadComments);
        class ExtHostCommentsImpl {
            static { this.handlePool = 0; }
            constructor() {
                this._commentControllers = new Map();
                this._commentControllersByExtension = new extensions_1.ExtensionIdentifierMap();
                commands.registerArgumentProcessor({
                    processArgument: arg => {
                        if (arg && arg.$mid === 6 /* MarshalledId.CommentController */) {
                            const commentController = this._commentControllers.get(arg.handle);
                            if (!commentController) {
                                return arg;
                            }
                            return commentController.value;
                        }
                        else if (arg && arg.$mid === 7 /* MarshalledId.CommentThread */) {
                            const commentController = this._commentControllers.get(arg.commentControlHandle);
                            if (!commentController) {
                                return arg;
                            }
                            const commentThread = commentController.getCommentThread(arg.commentThreadHandle);
                            if (!commentThread) {
                                return arg;
                            }
                            return commentThread.value;
                        }
                        else if (arg && (arg.$mid === 9 /* MarshalledId.CommentThreadReply */ || arg.$mid === 8 /* MarshalledId.CommentThreadInstance */)) {
                            const commentController = this._commentControllers.get(arg.thread.commentControlHandle);
                            if (!commentController) {
                                return arg;
                            }
                            const commentThread = commentController.getCommentThread(arg.thread.commentThreadHandle);
                            if (!commentThread) {
                                return arg;
                            }
                            if (arg.$mid === 8 /* MarshalledId.CommentThreadInstance */) {
                                return commentThread.value;
                            }
                            return {
                                thread: commentThread.value,
                                text: arg.text
                            };
                        }
                        else if (arg && arg.$mid === 10 /* MarshalledId.CommentNode */) {
                            const commentController = this._commentControllers.get(arg.thread.commentControlHandle);
                            if (!commentController) {
                                return arg;
                            }
                            const commentThread = commentController.getCommentThread(arg.thread.commentThreadHandle);
                            if (!commentThread) {
                                return arg;
                            }
                            const commentUniqueId = arg.commentUniqueId;
                            const comment = commentThread.getCommentByUniqueId(commentUniqueId);
                            if (!comment) {
                                return arg;
                            }
                            return comment;
                        }
                        else if (arg && arg.$mid === 11 /* MarshalledId.CommentThreadNode */) {
                            const commentController = this._commentControllers.get(arg.thread.commentControlHandle);
                            if (!commentController) {
                                return arg;
                            }
                            const commentThread = commentController.getCommentThread(arg.thread.commentThreadHandle);
                            if (!commentThread) {
                                return arg;
                            }
                            const body = arg.text;
                            const commentUniqueId = arg.commentUniqueId;
                            const comment = commentThread.getCommentByUniqueId(commentUniqueId);
                            if (!comment) {
                                return arg;
                            }
                            // If the old comment body was a markdown string, use a markdown string here too.
                            if (typeof comment.body === 'string') {
                                comment.body = body;
                            }
                            else {
                                comment.body = new types.MarkdownString(body);
                            }
                            return comment;
                        }
                        return arg;
                    }
                });
            }
            createCommentController(extension, id, label) {
                const handle = ExtHostCommentsImpl.handlePool++;
                const commentController = new ExtHostCommentController(extension, handle, id, label);
                this._commentControllers.set(commentController.handle, commentController);
                const commentControllers = this._commentControllersByExtension.get(extension.identifier) || [];
                commentControllers.push(commentController);
                this._commentControllersByExtension.set(extension.identifier, commentControllers);
                return commentController.value;
            }
            async $createCommentThreadTemplate(commentControllerHandle, uriComponents, range) {
                const commentController = this._commentControllers.get(commentControllerHandle);
                if (!commentController) {
                    return;
                }
                commentController.$createCommentThreadTemplate(uriComponents, range);
            }
            async $updateCommentThreadTemplate(commentControllerHandle, threadHandle, range) {
                const commentController = this._commentControllers.get(commentControllerHandle);
                if (!commentController) {
                    return;
                }
                commentController.$updateCommentThreadTemplate(threadHandle, range);
            }
            $deleteCommentThread(commentControllerHandle, commentThreadHandle) {
                const commentController = this._commentControllers.get(commentControllerHandle);
                commentController?.$deleteCommentThread(commentThreadHandle);
            }
            $provideCommentingRanges(commentControllerHandle, uriComponents, token) {
                const commentController = this._commentControllers.get(commentControllerHandle);
                if (!commentController || !commentController.commentingRangeProvider) {
                    return Promise.resolve(undefined);
                }
                const document = documents.getDocument(uri_1.URI.revive(uriComponents));
                return (0, async_1.asPromise)(async () => {
                    const rangesResult = await commentController.commentingRangeProvider.provideCommentingRanges(document, token);
                    let ranges;
                    if (Array.isArray(rangesResult)) {
                        ranges = {
                            ranges: rangesResult,
                            fileComments: false
                        };
                    }
                    else if (rangesResult) {
                        ranges = {
                            ranges: rangesResult.ranges || [],
                            fileComments: rangesResult.fileComments || false
                        };
                    }
                    else {
                        ranges = rangesResult ?? undefined;
                    }
                    return ranges;
                }).then(ranges => {
                    let convertedResult = undefined;
                    if (ranges) {
                        convertedResult = {
                            ranges: ranges.ranges.map(x => extHostTypeConverter.Range.from(x)),
                            fileComments: ranges.fileComments
                        };
                    }
                    return convertedResult;
                });
            }
            $toggleReaction(commentControllerHandle, threadHandle, uri, comment, reaction) {
                const commentController = this._commentControllers.get(commentControllerHandle);
                if (!commentController || !commentController.reactionHandler) {
                    return Promise.resolve(undefined);
                }
                return (0, async_1.asPromise)(() => {
                    const commentThread = commentController.getCommentThread(threadHandle);
                    if (commentThread) {
                        const vscodeComment = commentThread.getCommentByUniqueId(comment.uniqueIdInThread);
                        if (commentController !== undefined && vscodeComment) {
                            if (commentController.reactionHandler) {
                                return commentController.reactionHandler(vscodeComment, convertFromReaction(reaction));
                            }
                        }
                    }
                    return Promise.resolve(undefined);
                });
            }
        }
        class ExtHostCommentThread {
            static { this._handlePool = 0; }
            set threadId(id) {
                this._id = id;
            }
            get threadId() {
                return this._id;
            }
            get id() {
                return this._id;
            }
            get resource() {
                return this._uri;
            }
            get uri() {
                return this._uri;
            }
            set range(range) {
                if (((range === undefined) !== (this._range === undefined)) || (!range || !this._range || !range.isEqual(this._range))) {
                    this._range = range;
                    this.modifications.range = range;
                    this._onDidUpdateCommentThread.fire();
                }
            }
            get range() {
                return this._range;
            }
            set canReply(state) {
                if (this._canReply !== state) {
                    this._canReply = state;
                    this.modifications.canReply = state;
                    this._onDidUpdateCommentThread.fire();
                }
            }
            get canReply() {
                return this._canReply;
            }
            get label() {
                return this._label;
            }
            set label(label) {
                this._label = label;
                this.modifications.label = label;
                this._onDidUpdateCommentThread.fire();
            }
            get contextValue() {
                return this._contextValue;
            }
            set contextValue(context) {
                this._contextValue = context;
                this.modifications.contextValue = context;
                this._onDidUpdateCommentThread.fire();
            }
            get comments() {
                return this._comments;
            }
            set comments(newComments) {
                this._comments = newComments;
                this.modifications.comments = newComments;
                this._onDidUpdateCommentThread.fire();
            }
            get collapsibleState() {
                return this._collapseState;
            }
            set collapsibleState(newState) {
                this._collapseState = newState;
                this.modifications.collapsibleState = newState;
                this._onDidUpdateCommentThread.fire();
            }
            get state() {
                return this._state;
            }
            set state(newState) {
                this._state = newState;
                this.modifications.state = newState;
                this._onDidUpdateCommentThread.fire();
            }
            get isDisposed() {
                return this._isDiposed;
            }
            constructor(commentControllerId, _commentControllerHandle, _id, _uri, _range, _comments, extensionDescription, _isTemplate) {
                this._commentControllerHandle = _commentControllerHandle;
                this._id = _id;
                this._uri = _uri;
                this._range = _range;
                this._comments = _comments;
                this.extensionDescription = extensionDescription;
                this._isTemplate = _isTemplate;
                this.handle = ExtHostCommentThread._handlePool++;
                this.commentHandle = 0;
                this.modifications = Object.create(null);
                this._onDidUpdateCommentThread = new event_1.Emitter();
                this.onDidUpdateCommentThread = this._onDidUpdateCommentThread.event;
                this._canReply = true;
                this._commentsMap = new Map();
                this._acceptInputDisposables = new lifecycle_1.MutableDisposable();
                this._acceptInputDisposables.value = new lifecycle_1.DisposableStore();
                if (this._id === undefined) {
                    this._id = `${commentControllerId}.${this.handle}`;
                }
                proxy.$createCommentThread(_commentControllerHandle, this.handle, this._id, this._uri, extHostTypeConverter.Range.from(this._range), extensionDescription.identifier, this._isTemplate);
                this._localDisposables = [];
                this._isDiposed = false;
                this._localDisposables.push(this.onDidUpdateCommentThread(() => {
                    this.eventuallyUpdateCommentThread();
                }));
                // set up comments after ctor to batch update events.
                this.comments = _comments;
                this._localDisposables.push({
                    dispose: () => {
                        proxy.$deleteCommentThread(_commentControllerHandle, this.handle);
                    }
                });
                const that = this;
                this.value = {
                    get uri() { return that.uri; },
                    get range() { return that.range; },
                    set range(value) { that.range = value; },
                    get comments() { return that.comments; },
                    set comments(value) { that.comments = value; },
                    get collapsibleState() { return that.collapsibleState; },
                    set collapsibleState(value) { that.collapsibleState = value; },
                    get canReply() { return that.canReply; },
                    set canReply(state) { that.canReply = state; },
                    get contextValue() { return that.contextValue; },
                    set contextValue(value) { that.contextValue = value; },
                    get label() { return that.label; },
                    set label(value) { that.label = value; },
                    get state() { return that.state; },
                    set state(value) { that.state = value; },
                    dispose: () => {
                        that.dispose();
                    }
                };
            }
            updateIsTemplate() {
                if (this._isTemplate) {
                    this._isTemplate = false;
                    this.modifications.isTemplate = false;
                }
            }
            eventuallyUpdateCommentThread() {
                if (this._isDiposed) {
                    return;
                }
                this.updateIsTemplate();
                if (!this._acceptInputDisposables.value) {
                    this._acceptInputDisposables.value = new lifecycle_1.DisposableStore();
                }
                const modified = (value) => Object.prototype.hasOwnProperty.call(this.modifications, value);
                const formattedModifications = {};
                if (modified('range')) {
                    formattedModifications.range = extHostTypeConverter.Range.from(this._range);
                }
                if (modified('label')) {
                    formattedModifications.label = this.label;
                }
                if (modified('contextValue')) {
                    /*
                     * null -> cleared contextValue
                     * undefined -> no change
                     */
                    formattedModifications.contextValue = this.contextValue ?? null;
                }
                if (modified('comments')) {
                    formattedModifications.comments =
                        this._comments.map(cmt => convertToDTOComment(this, cmt, this._commentsMap, this.extensionDescription));
                }
                if (modified('collapsibleState')) {
                    formattedModifications.collapseState = convertToCollapsibleState(this._collapseState);
                }
                if (modified('canReply')) {
                    formattedModifications.canReply = this.canReply;
                }
                if (modified('state')) {
                    formattedModifications.state = convertToState(this._state);
                }
                if (modified('isTemplate')) {
                    formattedModifications.isTemplate = this._isTemplate;
                }
                this.modifications = {};
                proxy.$updateCommentThread(this._commentControllerHandle, this.handle, this._id, this._uri, formattedModifications);
            }
            getCommentByUniqueId(uniqueId) {
                for (const key of this._commentsMap) {
                    const comment = key[0];
                    const id = key[1];
                    if (uniqueId === id) {
                        return comment;
                    }
                }
                return;
            }
            dispose() {
                this._isDiposed = true;
                this._acceptInputDisposables.dispose();
                this._localDisposables.forEach(disposable => disposable.dispose());
            }
        }
        __decorate([
            (0, decorators_1.debounce)(100)
        ], ExtHostCommentThread.prototype, "eventuallyUpdateCommentThread", null);
        class ExtHostCommentController {
            get id() {
                return this._id;
            }
            get label() {
                return this._label;
            }
            get handle() {
                return this._handle;
            }
            get commentingRangeProvider() {
                return this._commentingRangeProvider;
            }
            set commentingRangeProvider(provider) {
                this._commentingRangeProvider = provider;
                proxy.$updateCommentingRanges(this.handle);
            }
            get reactionHandler() {
                return this._reactionHandler;
            }
            set reactionHandler(handler) {
                this._reactionHandler = handler;
                proxy.$updateCommentControllerFeatures(this.handle, { reactionHandler: !!handler });
            }
            get options() {
                return this._options;
            }
            set options(options) {
                this._options = options;
                proxy.$updateCommentControllerFeatures(this.handle, { options: this._options });
            }
            constructor(_extension, _handle, _id, _label) {
                this._extension = _extension;
                this._handle = _handle;
                this._id = _id;
                this._label = _label;
                this._threads = new Map();
                proxy.$registerCommentController(this.handle, _id, _label, this._extension.identifier.value);
                const that = this;
                this.value = Object.freeze({
                    id: that.id,
                    label: that.label,
                    get options() { return that.options; },
                    set options(options) { that.options = options; },
                    get commentingRangeProvider() { return that.commentingRangeProvider; },
                    set commentingRangeProvider(commentingRangeProvider) { that.commentingRangeProvider = commentingRangeProvider; },
                    get reactionHandler() { return that.reactionHandler; },
                    set reactionHandler(handler) { that.reactionHandler = handler; },
                    createCommentThread(uri, range, comments) {
                        return that.createCommentThread(uri, range, comments).value;
                    },
                    dispose: () => { that.dispose(); },
                }); // TODO @alexr00 remove this cast when the proposed API is stable
                this._localDisposables = [];
                this._localDisposables.push({
                    dispose: () => {
                        proxy.$unregisterCommentController(this.handle);
                    }
                });
            }
            createCommentThread(resource, range, comments) {
                if (range === undefined) {
                    (0, extensions_2.checkProposedApiEnabled)(this._extension, 'fileComments');
                }
                const commentThread = new ExtHostCommentThread(this.id, this.handle, undefined, resource, range, comments, this._extension, false);
                this._threads.set(commentThread.handle, commentThread);
                return commentThread;
            }
            $createCommentThreadTemplate(uriComponents, range) {
                const commentThread = new ExtHostCommentThread(this.id, this.handle, undefined, uri_1.URI.revive(uriComponents), extHostTypeConverter.Range.to(range), [], this._extension, true);
                commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
                this._threads.set(commentThread.handle, commentThread);
                return commentThread;
            }
            $updateCommentThreadTemplate(threadHandle, range) {
                const thread = this._threads.get(threadHandle);
                if (thread) {
                    thread.range = extHostTypeConverter.Range.to(range);
                }
            }
            $deleteCommentThread(threadHandle) {
                const thread = this._threads.get(threadHandle);
                thread?.dispose();
                this._threads.delete(threadHandle);
            }
            getCommentThread(handle) {
                return this._threads.get(handle);
            }
            dispose() {
                this._threads.forEach(value => {
                    value.dispose();
                });
                this._localDisposables.forEach(disposable => disposable.dispose());
            }
        }
        function convertToDTOComment(thread, vscodeComment, commentsMap, extension) {
            let commentUniqueId = commentsMap.get(vscodeComment);
            if (!commentUniqueId) {
                commentUniqueId = ++thread.commentHandle;
                commentsMap.set(vscodeComment, commentUniqueId);
            }
            if (vscodeComment.state !== undefined) {
                (0, extensions_2.checkProposedApiEnabled)(extension, 'commentsDraftState');
            }
            if (vscodeComment.reactions?.some(reaction => reaction.reactors !== undefined)) {
                (0, extensions_2.checkProposedApiEnabled)(extension, 'commentReactor');
            }
            return {
                mode: vscodeComment.mode,
                contextValue: vscodeComment.contextValue,
                uniqueIdInThread: commentUniqueId,
                body: (typeof vscodeComment.body === 'string') ? vscodeComment.body : extHostTypeConverter.MarkdownString.from(vscodeComment.body),
                userName: vscodeComment.author.name,
                userIconPath: vscodeComment.author.iconPath,
                label: vscodeComment.label,
                commentReactions: vscodeComment.reactions ? vscodeComment.reactions.map(reaction => convertToReaction(reaction)) : undefined,
                state: vscodeComment.state,
                timestamp: vscodeComment.timestamp?.toJSON()
            };
        }
        function convertToReaction(reaction) {
            return {
                label: reaction.label,
                iconPath: reaction.iconPath ? extHostTypeConverter.pathOrURIToURI(reaction.iconPath) : undefined,
                count: reaction.count,
                hasReacted: reaction.authorHasReacted,
                reactors: ((reaction.reactors && (reaction.reactors.length > 0) && (typeof reaction.reactors[0] !== 'string')) ? reaction.reactors.map(reactor => reactor.name) : reaction.reactors)
            };
        }
        function convertFromReaction(reaction) {
            return {
                label: reaction.label || '',
                count: reaction.count || 0,
                iconPath: reaction.iconPath ? uri_1.URI.revive(reaction.iconPath) : '',
                authorHasReacted: reaction.hasReacted || false,
                reactors: reaction.reactors?.map(reactor => ({ name: reactor }))
            };
        }
        function convertToCollapsibleState(kind) {
            if (kind !== undefined) {
                switch (kind) {
                    case types.CommentThreadCollapsibleState.Expanded:
                        return languages.CommentThreadCollapsibleState.Expanded;
                    case types.CommentThreadCollapsibleState.Collapsed:
                        return languages.CommentThreadCollapsibleState.Collapsed;
                }
            }
            return languages.CommentThreadCollapsibleState.Collapsed;
        }
        function convertToState(kind) {
            if (kind !== undefined) {
                switch (kind) {
                    case types.CommentThreadState.Unresolved:
                        return languages.CommentThreadState.Unresolved;
                    case types.CommentThreadState.Resolved:
                        return languages.CommentThreadState.Resolved;
                }
            }
            return languages.CommentThreadState.Unresolved;
        }
        return new ExtHostCommentsImpl();
    }
    exports.createExtHostComments = createExtHostComments;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENvbW1lbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Q29tbWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7O0lBMEJoRyxTQUFnQixxQkFBcUIsQ0FBQyxXQUF5QixFQUFFLFFBQXlCLEVBQUUsU0FBMkI7UUFDdEgsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFbkUsTUFBTSxtQkFBbUI7cUJBRVQsZUFBVSxHQUFHLENBQUMsQUFBSixDQUFLO1lBUTlCO2dCQUxRLHdCQUFtQixHQUFrRCxJQUFJLEdBQUcsRUFBNEMsQ0FBQztnQkFFekgsbUNBQThCLEdBQXVELElBQUksbUNBQXNCLEVBQThCLENBQUM7Z0JBS3JKLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQztvQkFDbEMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUFFO3dCQUN0QixJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSwyQ0FBbUMsRUFBRSxDQUFDOzRCQUN4RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUVuRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQ0FDeEIsT0FBTyxHQUFHLENBQUM7NEJBQ1osQ0FBQzs0QkFFRCxPQUFPLGlCQUFpQixDQUFDLEtBQUssQ0FBQzt3QkFDaEMsQ0FBQzs2QkFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSx1Q0FBK0IsRUFBRSxDQUFDOzRCQUMzRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFD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
//# sourceURL=../../../vs/workbench/api/common/extHostComments.js
})
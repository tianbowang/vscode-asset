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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/core/offsetRange", "vs/platform/log/common/log", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/workbench/contrib/chat/common/chatService"], function (require, exports, arrays_1, async_1, event_1, htmlContent_1, lifecycle_1, marshalling_1, resources_1, uri_1, uuid_1, offsetRange_1, log_1, chatAgents_1, chatParserTypes_1, chatService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatWelcomeMessageModel = exports.ChatModel = exports.ChatModelInitState = exports.isSerializableSessionData = exports.isExportableSessionData = exports.ChatResponseModel = exports.Response = exports.ChatRequestModel = void 0;
    class ChatRequestModel {
        static { this.nextId = 0; }
        get id() {
            return this._id;
        }
        get username() {
            return this.session.requesterUsername;
        }
        get avatarIconUri() {
            return this.session.requesterAvatarIconUri;
        }
        constructor(session, message, variableData) {
            this.session = session;
            this.message = message;
            this.variableData = variableData;
            this._id = 'request_' + ChatRequestModel.nextId++;
        }
    }
    exports.ChatRequestModel = ChatRequestModel;
    class Response {
        get onDidChangeValue() {
            return this._onDidChangeValue.event;
        }
        get value() {
            return this._responseParts;
        }
        constructor(value) {
            this._onDidChangeValue = new event_1.Emitter();
            this._responseParts = (0, arrays_1.asArray)(value).map((v) => ((0, htmlContent_1.isMarkdownString)(v) ?
                { content: v, kind: 'markdownContent' } :
                'kind' in v ? v : { kind: 'treeData', treeData: v }));
            this._updateRepr(true);
        }
        asString() {
            return this._responseRepr;
        }
        clear() {
            this._responseParts = [];
            this._updateRepr(true);
        }
        updateContent(progress, quiet) {
            if (progress.kind === 'content' || progress.kind === 'markdownContent') {
                const responsePartLength = this._responseParts.length - 1;
                const lastResponsePart = this._responseParts[responsePartLength];
                if (!lastResponsePart || lastResponsePart.kind !== 'markdownContent') {
                    // The last part can't be merged with
                    if (progress.kind === 'content') {
                        this._responseParts.push({ content: new htmlContent_1.MarkdownString(progress.content), kind: 'markdownContent' });
                    }
                    else {
                        this._responseParts.push(progress);
                    }
                }
                else if (progress.kind === 'markdownContent') {
                    // Merge all enabled commands
                    const lastPartEnabledCommands = typeof lastResponsePart.content.isTrusted === 'object' ?
                        lastResponsePart.content.isTrusted.enabledCommands :
                        [];
                    const thisPartEnabledCommands = typeof progress.content.isTrusted === 'object' ?
                        progress.content.isTrusted.enabledCommands :
                        [];
                    const enabledCommands = [...lastPartEnabledCommands, ...thisPartEnabledCommands];
                    this._responseParts[responsePartLength] = { content: new htmlContent_1.MarkdownString(lastResponsePart.content.value + progress.content.value, { isTrusted: { enabledCommands } }), kind: 'markdownContent' };
                }
                else {
                    this._responseParts[responsePartLength] = { content: new htmlContent_1.MarkdownString(lastResponsePart.content.value + progress.content, lastResponsePart.content), kind: 'markdownContent' };
                }
                this._updateRepr(quiet);
            }
            else if (progress.kind === 'treeData' || progress.kind === 'inlineReference' || progress.kind === 'markdownVuln' || progress.kind === 'progressMessage') {
                this._responseParts.push(progress);
                this._updateRepr(quiet);
            }
        }
        _updateRepr(quiet) {
            this._responseRepr = this._responseParts.map(part => {
                if (part.kind === 'treeData') {
                    return '';
                }
                else if (part.kind === 'inlineReference') {
                    return (0, resources_1.basename)('uri' in part.inlineReference ? part.inlineReference.uri : part.inlineReference);
                }
                else {
                    return part.content.value;
                }
            }).join('\n\n');
            if (!quiet) {
                this._onDidChangeValue.fire();
            }
        }
    }
    exports.Response = Response;
    class ChatResponseModel extends lifecycle_1.Disposable {
        static { this.nextId = 0; }
        get id() {
            return this._id;
        }
        get isComplete() {
            return this._isComplete;
        }
        get isCanceled() {
            return this._isCanceled;
        }
        get vote() {
            return this._vote;
        }
        get followups() {
            return this._followups;
        }
        get response() {
            return this._response;
        }
        get errorDetails() {
            return this._errorDetails;
        }
        get providerId() {
            return this.session.providerId;
        }
        get username() {
            return this.session.responderUsername;
        }
        get avatarIconUri() {
            return this.session.responderAvatarIconUri;
        }
        get agent() {
            return this._agent;
        }
        get slashCommand() {
            return this._slashCommand;
        }
        get usedContext() {
            return this._usedContext;
        }
        get contentReferences() {
            return this._contentReferences;
        }
        get progressMessages() {
            return this._progressMessages;
        }
        constructor(_response, session, _agent, _slashCommand, requestId, _isComplete = false, _isCanceled = false, _vote, _errorDetails, followups) {
            super();
            this.session = session;
            this._agent = _agent;
            this._slashCommand = _slashCommand;
            this.requestId = requestId;
            this._isComplete = _isComplete;
            this._isCanceled = _isCanceled;
            this._vote = _vote;
            this._errorDetails = _errorDetails;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._contentReferences = [];
            this._progressMessages = [];
            this._followups = followups ? [...followups] : undefined;
            this._response = new Response(_response);
            this._register(this._response.onDidChangeValue(() => this._onDidChange.fire()));
            this._id = 'response_' + ChatResponseModel.nextId++;
        }
        /**
         * Apply a progress update to the actual response content.
         */
        updateContent(responsePart, quiet) {
            this._response.updateContent(responsePart, quiet);
        }
        /**
         * Apply one of the progress updates that are not part of the actual response content.
         */
        applyReference(progress) {
            if (progress.kind === 'usedContext') {
                this._usedContext = progress;
            }
            else if (progress.kind === 'reference') {
                this._contentReferences.push(progress);
                this._onDidChange.fire();
            }
        }
        setAgent(agent, slashCommand) {
            this._agent = agent;
            this._slashCommand = slashCommand;
            this._onDidChange.fire();
        }
        setErrorDetails(errorDetails) {
            this._errorDetails = errorDetails;
            this._onDidChange.fire();
        }
        complete(errorDetails) {
            if (errorDetails?.responseIsRedacted) {
                this._response.clear();
            }
            this._isComplete = true;
            this._onDidChange.fire();
        }
        cancel() {
            this._isComplete = true;
            this._isCanceled = true;
            this._onDidChange.fire();
        }
        setFollowups(followups) {
            this._followups = followups;
            this._onDidChange.fire(); // Fire so that command followups get rendered on the row
        }
        setVote(vote) {
            this._vote = vote;
            this._onDidChange.fire();
        }
    }
    exports.ChatResponseModel = ChatResponseModel;
    function isExportableSessionData(obj) {
        const data = obj;
        return typeof data === 'object' &&
            typeof data.providerId === 'string' &&
            typeof data.requesterUsername === 'string' &&
            typeof data.responderUsername === 'string';
    }
    exports.isExportableSessionData = isExportableSessionData;
    function isSerializableSessionData(obj) {
        const data = obj;
        return isExportableSessionData(obj) &&
            typeof data.creationDate === 'number' &&
            typeof data.sessionId === 'string' &&
            obj.requests.every((request) => !request.usedContext /* for backward compat allow missing usedContext */ || (0, chatService_1.isIUsedContext)(request.usedContext));
    }
    exports.isSerializableSessionData = isSerializableSessionData;
    var ChatModelInitState;
    (function (ChatModelInitState) {
        ChatModelInitState[ChatModelInitState["Created"] = 0] = "Created";
        ChatModelInitState[ChatModelInitState["Initializing"] = 1] = "Initializing";
        ChatModelInitState[ChatModelInitState["Initialized"] = 2] = "Initialized";
    })(ChatModelInitState || (exports.ChatModelInitState = ChatModelInitState = {}));
    let ChatModel = class ChatModel extends lifecycle_1.Disposable {
        get session() {
            return this._session;
        }
        get welcomeMessage() {
            return this._welcomeMessage;
        }
        get sessionId() {
            return this._sessionId;
        }
        get inputPlaceholder() {
            return this._session?.inputPlaceholder;
        }
        get requestInProgress() {
            const lastRequest = this._requests[this._requests.length - 1];
            return !!lastRequest && !!lastRequest.response && !lastRequest.response.isComplete;
        }
        get creationDate() {
            return this._creationDate;
        }
        get requesterUsername() {
            return this._session?.requesterUsername ?? this.initialData?.requesterUsername ?? '';
        }
        get responderUsername() {
            return this._session?.responderUsername ?? this.initialData?.responderUsername ?? '';
        }
        get requesterAvatarIconUri() {
            return this._session ? this._session.requesterAvatarIconUri : this._initialRequesterAvatarIconUri;
        }
        get responderAvatarIconUri() {
            return this._session ? this._session.responderAvatarIconUri : this._initialResponderAvatarIconUri;
        }
        get initState() {
            return this._initState;
        }
        get isImported() {
            return this._isImported;
        }
        get title() {
            const firstRequestMessage = (0, arrays_1.firstOrDefault)(this._requests)?.message;
            const message = firstRequestMessage?.text ?? '';
            return message.split('\n')[0].substring(0, 50);
        }
        constructor(providerId, initialData, logService, chatAgentService) {
            super();
            this.providerId = providerId;
            this.initialData = initialData;
            this.logService = logService;
            this.chatAgentService = chatAgentService;
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._initState = ChatModelInitState.Created;
            this._isInitializedDeferred = new async_1.DeferredPromise();
            this._isImported = false;
            this._isImported = (!!initialData && !isSerializableSessionData(initialData)) || (initialData?.isImported ?? false);
            this._sessionId = (isSerializableSessionData(initialData) && initialData.sessionId) || (0, uuid_1.generateUuid)();
            this._requests = initialData ? this._deserialize(initialData) : [];
            this._creationDate = (isSerializableSessionData(initialData) && initialData.creationDate) || Date.now();
            this._initialRequesterAvatarIconUri = initialData?.requesterAvatarIconUri && uri_1.URI.revive(initialData.requesterAvatarIconUri);
            this._initialResponderAvatarIconUri = initialData?.responderAvatarIconUri && uri_1.URI.revive(initialData.responderAvatarIconUri);
        }
        _deserialize(obj) {
            const requests = obj.requests;
            if (!Array.isArray(requests)) {
                this.logService.error(`Ignoring malformed session data: ${JSON.stringify(obj)}`);
                return [];
            }
            if (obj.welcomeMessage) {
                const content = obj.welcomeMessage.map(item => typeof item === 'string' ? new htmlContent_1.MarkdownString(item) : item);
                this._welcomeMessage = new ChatWelcomeMessageModel(this, content, []);
            }
            try {
                return requests.map((raw) => {
                    const parsedRequest = typeof raw.message === 'string'
                        ? this.getParsedRequestFromString(raw.message)
                        : (0, chatParserTypes_1.reviveParsedChatRequest)(raw.message);
                    // Only old messages don't have variableData
                    const variableData = raw.variableData ?? { message: parsedRequest.text, variables: {} };
                    const request = new ChatRequestModel(this, parsedRequest, variableData);
                    if (raw.response || raw.responseErrorDetails) {
                        const agent = (raw.agent && 'metadata' in raw.agent) ? // Check for the new format, ignore entries in the old format
                            (0, marshalling_1.revive)(raw.agent) : undefined;
                        request.response = new ChatResponseModel(raw.response ?? [new htmlContent_1.MarkdownString(raw.response)], this, agent, raw.slashCommand, request.id, true, raw.isCanceled, raw.vote, raw.responseErrorDetails, raw.followups);
                        if (raw.usedContext) { // @ulugbekna: if this's a new vscode sessions, doc versions are incorrect anyway?
                            request.response.applyReference((0, marshalling_1.revive)(raw.usedContext));
                        }
                        if (raw.contentReferences) {
                            raw.contentReferences.forEach(r => request.response.applyReference((0, marshalling_1.revive)(r)));
                        }
                    }
                    return request;
                });
            }
            catch (error) {
                this.logService.error('Failed to parse chat data', error);
                return [];
            }
        }
        getParsedRequestFromString(message) {
            // TODO These offsets won't be used, but chat replies need to go through the parser as well
            const parts = [new chatParserTypes_1.ChatRequestTextPart(new offsetRange_1.OffsetRange(0, message.length), { startColumn: 1, startLineNumber: 1, endColumn: 1, endLineNumber: 1 }, message)];
            return {
                text: message,
                parts
            };
        }
        startInitialize() {
            if (this.initState !== ChatModelInitState.Created) {
                throw new Error(`ChatModel is in the wrong state for startInitialize: ${ChatModelInitState[this.initState]}`);
            }
            this._initState = ChatModelInitState.Initializing;
        }
        deinitialize() {
            this._session = undefined;
            this._initState = ChatModelInitState.Created;
            this._isInitializedDeferred = new async_1.DeferredPromise();
        }
        initialize(session, welcomeMessage) {
            if (this.initState !== ChatModelInitState.Initializing) {
                // Must call startInitialize before initialize, and only call it once
                throw new Error(`ChatModel is in the wrong state for initialize: ${ChatModelInitState[this.initState]}`);
            }
            this._initState = ChatModelInitState.Initialized;
            this._session = session;
            if (!this._welcomeMessage) {
                // Could also have loaded the welcome message from persisted data
                this._welcomeMessage = welcomeMessage;
            }
            this._isInitializedDeferred.complete();
            this._onDidChange.fire({ kind: 'initialize' });
        }
        setInitializationError(error) {
            if (this.initState !== ChatModelInitState.Initializing) {
                throw new Error(`ChatModel is in the wrong state for setInitializationError: ${ChatModelInitState[this.initState]}`);
            }
            if (!this._isInitializedDeferred.isSettled) {
                this._isInitializedDeferred.error(error);
            }
        }
        waitForInitialization() {
            return this._isInitializedDeferred.p;
        }
        getRequests() {
            return this._requests;
        }
        addRequest(message, variableData, chatAgent, slashCommand) {
            if (!this._session) {
                throw new Error('addRequest: No session');
            }
            const request = new ChatRequestModel(this, message, variableData);
            request.response = new ChatResponseModel([], this, chatAgent, slashCommand, request.id);
            this._requests.push(request);
            this._onDidChange.fire({ kind: 'addRequest', request });
            return request;
        }
        acceptResponseProgress(request, progress, quiet) {
            if (!this._session) {
                throw new Error('acceptResponseProgress: No session');
            }
            if (!request.response) {
                request.response = new ChatResponseModel([], this, undefined, undefined, request.id);
            }
            if (request.response.isComplete) {
                throw new Error('acceptResponseProgress: Adding progress to a completed response');
            }
            if (progress.kind === 'vulnerability') {
                request.response.updateContent({ kind: 'markdownVuln', content: { value: progress.content }, vulnerabilities: progress.vulnerabilities }, quiet);
            }
            else if (progress.kind === 'content' || progress.kind === 'markdownContent' || progress.kind === 'treeData' || progress.kind === 'inlineReference' || progress.kind === 'markdownVuln' || progress.kind === 'progressMessage') {
                request.response.updateContent(progress, quiet);
            }
            else if (progress.kind === 'usedContext' || progress.kind === 'reference') {
                request.response.applyReference(progress);
            }
            else if (progress.kind === 'agentDetection') {
                const agent = this.chatAgentService.getAgent(progress.agentName);
                if (agent) {
                    request.response.setAgent(agent, progress.command);
                }
            }
            else {
                this.logService.error(`Couldn't handle progress: ${JSON.stringify(progress)}`);
            }
        }
        removeRequest(id) {
            const index = this._requests.findIndex(request => request.id === id);
            const request = this._requests[index];
            if (index !== -1) {
                this._onDidChange.fire({ kind: 'removeRequest', requestId: request.id, responseId: request.response?.id });
                this._requests.splice(index, 1);
                request.response?.dispose();
            }
        }
        cancelRequest(request) {
            if (request.response) {
                request.response.cancel();
            }
        }
        setResponse(request, rawResponse) {
            if (!this._session) {
                throw new Error('completeResponse: No session');
            }
            if (!request.response) {
                request.response = new ChatResponseModel([], this, undefined, undefined, request.id);
            }
            request.response.setErrorDetails(rawResponse.errorDetails);
        }
        completeResponse(request, errorDetails) {
            if (!request.response) {
                throw new Error('Call setResponse before completeResponse');
            }
            request.response.complete(errorDetails);
        }
        setFollowups(request, followups) {
            if (!request.response) {
                // Maybe something went wrong?
                return;
            }
            request.response.setFollowups(followups);
        }
        setResponseModel(request, response) {
            request.response = response;
            this._onDidChange.fire({ kind: 'addResponse', response });
        }
        toExport() {
            return {
                requesterUsername: this.requesterUsername,
                requesterAvatarIconUri: this.requesterAvatarIconUri,
                responderUsername: this.responderUsername,
                responderAvatarIconUri: this.responderAvatarIconUri,
                welcomeMessage: this._welcomeMessage?.content.map(c => {
                    if (Array.isArray(c)) {
                        return c;
                    }
                    else {
                        return c.value;
                    }
                }),
                requests: this._requests.map((r) => {
                    return {
                        message: r.message,
                        variableData: r.variableData,
                        response: r.response ?
                            r.response.response.value.map(item => {
                                // Keeping the shape of the persisted data the same for back compat
                                if (item.kind === 'treeData') {
                                    return item.treeData;
                                }
                                else if (item.kind === 'markdownContent') {
                                    return item.content;
                                }
                                else {
                                    return item; // TODO
                                }
                            })
                            : undefined,
                        responseErrorDetails: r.response?.errorDetails,
                        followups: r.response?.followups,
                        isCanceled: r.response?.isCanceled,
                        vote: r.response?.vote,
                        agent: r.response?.agent ? { id: r.response.agent.id, metadata: r.response.agent.metadata } : undefined, // May actually be the full IChatAgent instance, just take the data props
                        slashCommand: r.response?.slashCommand,
                        usedContext: r.response?.usedContext,
                        contentReferences: r.response?.contentReferences
                    };
                }),
                providerId: this.providerId,
            };
        }
        toJSON() {
            return {
                ...this.toExport(),
                sessionId: this.sessionId,
                creationDate: this._creationDate,
                isImported: this._isImported
            };
        }
        dispose() {
            this._session?.dispose?.();
            this._requests.forEach(r => r.response?.dispose());
            this._onDidDispose.fire();
            super.dispose();
        }
    };
    exports.ChatModel = ChatModel;
    exports.ChatModel = ChatModel = __decorate([
        __param(2, log_1.ILogService),
        __param(3, chatAgents_1.IChatAgentService)
    ], ChatModel);
    class ChatWelcomeMessageModel {
        static { this.nextId = 0; }
        get id() {
            return this._id;
        }
        constructor(session, content, sampleQuestions) {
            this.session = session;
            this.content = content;
            this.sampleQuestions = sampleQuestions;
            this._id = 'welcome_' + ChatWelcomeMessageModel.nextId++;
        }
        get username() {
            return this.session.responderUsername;
        }
        get avatarIconUri() {
            return this.session.responderAvatarIconUri;
        }
    }
    exports.ChatWelcomeMessageModel = ChatWelcomeMessageModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2NvbW1vbi9jaGF0TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUVoRyxNQUFhLGdCQUFnQjtpQkFDYixXQUFNLEdBQUcsQ0FBQyxDQUFDO1FBSzFCLElBQVcsRUFBRTtZQUNaLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNqQixDQUFDO1FBRUQsSUFBVyxRQUFRO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztRQUN2QyxDQUFDO1FBRUQsSUFBVyxhQUFhO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztRQUM1QyxDQUFDO1FBRUQsWUFDaUIsT0FBa0IsRUFDbEIsT0FBMkIsRUFDM0IsWUFBc0M7WUFGdEMsWUFBTyxHQUFQLE9BQU8sQ0FBVztZQUNsQixZQUFPLEdBQVAsT0FBTyxDQUFvQjtZQUMzQixpQkFBWSxHQUFaLFlBQVksQ0FBMEI7WUFDdEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkQsQ0FBQzs7SUF2QkYsNENBd0JDO0lBRUQsTUFBYSxRQUFRO1FBRXBCLElBQVcsZ0JBQWdCO1lBQzFCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztRQUNyQyxDQUFDO1FBT0QsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzVCLENBQUM7UUFFRCxZQUFZLEtBQXNLO1lBZDFLLHNCQUFpQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFlL0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFBLGdCQUFPLEVBQUMsS0FBSyxDQUFD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
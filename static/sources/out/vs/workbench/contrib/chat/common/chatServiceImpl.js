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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatContextKeys", "vs/workbench/contrib/chat/common/chatModel", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/workbench/contrib/chat/common/chatRequestParser", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/services/extensions/common/extensions"], function (require, exports, cancellation_1, event_1, htmlContent_1, iterator_1, lifecycle_1, marshalling_1, stopwatch_1, uri_1, nls_1, commands_1, contextkey_1, instantiation_1, log_1, progress_1, storage_1, telemetry_1, workspace_1, chatAgents_1, chatContextKeys_1, chatModel_1, chatParserTypes_1, chatRequestParser_1, chatService_1, chatSlashCommands_1, chatVariables_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatService = void 0;
    const serializedChatKey = 'interactive.sessions';
    const globalChatKey = 'chat.workspaceTransfer';
    const SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS = 1000 * 60;
    const maxPersistedSessions = 25;
    let ChatService = class ChatService extends lifecycle_1.Disposable {
        get transferredSessionData() {
            return this._transferredSessionData;
        }
        constructor(storageService, logService, extensionService, instantiationService, telemetryService, contextKeyService, workspaceContextService, chatSlashCommandService, chatVariablesService, chatAgentService) {
            super();
            this.storageService = storageService;
            this.logService = logService;
            this.extensionService = extensionService;
            this.instantiationService = instantiationService;
            this.telemetryService = telemetryService;
            this.contextKeyService = contextKeyService;
            this.workspaceContextService = workspaceContextService;
            this.chatSlashCommandService = chatSlashCommandService;
            this.chatVariablesService = chatVariablesService;
            this.chatAgentService = chatAgentService;
            this._providers = new Map();
            this._sessionModels = this._register(new lifecycle_1.DisposableMap());
            this._pendingRequests = this._register(new lifecycle_1.DisposableMap());
            this._onDidPerformUserAction = this._register(new event_1.Emitter());
            this.onDidPerformUserAction = this._onDidPerformUserAction.event;
            this._onDidSubmitAgent = this._register(new event_1.Emitter());
            this.onDidSubmitAgent = this._onDidSubmitAgent.event;
            this._onDidDisposeSession = this._register(new event_1.Emitter());
            this.onDidDisposeSession = this._onDidDisposeSession.event;
            this._onDidRegisterProvider = this._register(new event_1.Emitter());
            this.onDidRegisterProvider = this._onDidRegisterProvider.event;
            this._hasProvider = chatContextKeys_1.CONTEXT_PROVIDER_EXISTS.bindTo(this.contextKeyService);
            const sessionData = storageService.get(serializedChatKey, 1 /* StorageScope.WORKSPACE */, '');
            if (sessionData) {
                this._persistedSessions = this.deserializeChats(sessionData);
                const countsForLog = Object.keys(this._persistedSessions).length;
                if (countsForLog > 0) {
                    this.trace('constructor', `Restored ${countsForLog} persisted sessions`);
                }
            }
            else {
                this._persistedSessions = {};
            }
            const transferredData = this.getTransferredSessionData();
            const transferredChat = transferredData?.chat;
            if (transferredChat) {
                this.trace('constructor', `Transferred session ${transferredChat.sessionId}`);
                this._persistedSessions[transferredChat.sessionId] = transferredChat;
                this._transferredSessionData = { sessionId: transferredChat.sessionId, inputValue: transferredData.inputValue };
            }
            this._register(storageService.onWillSaveState(() => this.saveState()));
        }
        saveState() {
            let allSessions = Array.from(this._sessionModels.values())
                .filter(session => session.getRequests().length > 0);
            allSessions = allSessions.concat(Object.values(this._persistedSessions)
                .filter(session => !this._sessionModels.has(session.sessionId))
                .filter(session => session.requests.length));
            allSessions.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
            allSessions = allSessions.slice(0, maxPersistedSessions);
            if (allSessions.length) {
                this.trace('onWillSaveState', `Persisting ${allSessions.length} sessions`);
            }
            const serialized = JSON.stringify(allSessions);
            if (allSessions.length) {
                this.trace('onWillSaveState', `Persisting ${serialized.length} chars`);
            }
            this.storageService.store(serializedChatKey, serialized, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        notifyUserAction(action) {
            if (action.action.kind === 'vote') {
                this.telemetryService.publicLog2('interactiveSessionVote', {
                    providerId: action.providerId,
                    direction: action.action.direction === chatService_1.InteractiveSessionVoteDirection.Up ? 'up' : 'down'
                });
            }
            else if (action.action.kind === 'copy') {
                this.telemetryService.publicLog2('interactiveSessionCopy', {
                    providerId: action.providerId,
                    copyKind: action.action.copyKind === chatService_1.ChatAgentCopyKind.Action ? 'action' : 'toolbar'
                });
            }
            else if (action.action.kind === 'insert') {
                this.telemetryService.publicLog2('interactiveSessionInsert', {
                    providerId: action.providerId,
                    newFile: !!action.action.newFile
                });
            }
            else if (action.action.kind === 'command') {
                const command = commands_1.CommandsRegistry.getCommand(action.action.command.commandId);
                const commandId = command ? action.action.command.commandId : 'INVALID';
                this.telemetryService.publicLog2('interactiveSessionCommand', {
                    providerId: action.providerId,
                    commandId
                });
            }
            else if (action.action.kind === 'runInTerminal') {
                this.telemetryService.publicLog2('interactiveSessionRunInTerminal', {
                    providerId: action.providerId,
                    languageId: action.action.languageId ?? ''
                });
            }
            this._onDidPerformUserAction.fire(action);
        }
        trace(method, message) {
            this.logService.trace(`ChatService#${method}: ${message}`);
        }
        error(method, message) {
            this.logService.error(`ChatService#${method} ${message}`);
        }
        deserializeChats(sessionData) {
            try {
                const arrayOfSessions = (0, marshalling_1.revive)(JSON.parse(sessionData)); // Revive serialized URIs in session data
                if (!Array.isArray(arrayOfSessions)) {
                    throw new Error('Expected array');
                }
                const sessions = arrayOfSessions.reduce((acc, session) => {
                    // Revive serialized markdown strings in response data
                    for (const request of session.requests) {
                        if (Array.isArray(request.response)) {
                            request.response = request.response.map((response) => {
                                if (typeof response === 'string') {
                                    return new htmlContent_1.MarkdownString(response);
                                }
                                return response;
                            });
                        }
                        else if (typeof request.response === 'string') {
                            request.response = [new htmlContent_1.MarkdownString(request.response)];
                        }
                    }
                    acc[session.sessionId] = session;
                    return acc;
                }, {});
                return sessions;
            }
            catch (err) {
                this.error('deserializeChats', `Malformed session data: ${err}. [${sessionData.substring(0, 20)}${sessionData.length > 20 ? '...' : ''}]`);
                return {};
            }
        }
        getTransferredSessionData() {
            const data = this.storageService.getObject(globalChatKey, 0 /* StorageScope.PROFILE */, []);
            const workspaceUri = this.workspaceContextService.getWorkspace().folders[0]?.uri;
            if (!workspaceUri) {
                return;
            }
            const thisWorkspace = workspaceUri.toString();
            const currentTime = Date.now();
            // Only use transferred data if it was created recently
            const transferred = data.find(item => uri_1.URI.revive(item.toWorkspace).toString() === thisWorkspace && (currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS));
            // Keep data that isn't for the current workspace and that hasn't expired yet
            const filtered = data.filter(item => uri_1.URI.revive(item.toWorkspace).toString() !== thisWorkspace && (currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS));
            this.storageService.store(globalChatKey, JSON.stringify(filtered), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            return transferred;
        }
        /**
         * Returns an array of chat details for all persisted chat sessions that have at least one request.
         * The array is sorted by creation date in descending order.
         * Chat sessions that have already been loaded into the chat view are excluded from the result.
         * Imported chat sessions are also excluded from the result.
         */
        getHistory() {
            const sessions = Object.values(this._persistedSessions)
                .filter(session => session.requests.length > 0);
            sessions.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
            return sessions
                .filter(session => !this._sessionModels.has(session.sessionId))
                .filter(session => !session.isImported)
                .map(item => {
                const firstRequestMessage = item.requests[0]?.message;
                return {
                    sessionId: item.sessionId,
                    title: (typeof firstRequestMessage === 'string' ? firstRequestMessage :
                        firstRequestMessage?.text) ?? '',
                };
            });
        }
        removeHistoryEntry(sessionId) {
            delete this._persistedSessions[sessionId];
            this.saveState();
        }
        clearAllHistoryEntries() {
            this._persistedSessions = {};
            this.saveState();
        }
        startSession(providerId, token) {
            this.trace('startSession', `providerId=${providerId}`);
            return this._startSession(providerId, undefined, token);
        }
        _startSession(providerId, someSessionHistory, token) {
            this.trace('_startSession', `providerId=${providerId}`);
            const model = this.instantiationService.createInstance(chatModel_1.ChatModel, providerId, someSessionHistory);
            this._sessionModels.set(model.sessionId, model);
            this.initializeSession(model, token);
            return model;
        }
        reinitializeModel(model) {
            this.trace('reinitializeModel', `Start reinit`);
            this.initializeSession(model, cancellation_1.CancellationToken.None);
        }
        async initializeSession(model, token) {
            try {
                this.trace('initializeSession', `Initialize session ${model.sessionId}`);
                model.startInitialize();
                await this.extensionService.activateByEvent(`onInteractiveSession:${model.providerId}`);
                const provider = this._providers.get(model.providerId);
                if (!provider) {
                    throw new Error(`Unknown provider: ${model.providerId}`);
                }
                let session;
                try {
                    session = await provider.prepareSession(token) ?? undefined;
                }
                catch (err) {
                    this.trace('initializeSession', `Provider initializeSession threw: ${err}`);
                }
                if (!session) {
                    throw new Error('Provider returned no session');
                }
                this.trace('startSession', `Provider returned session`);
                const welcomeMessage = model.welcomeMessage ? undefined : await provider.provideWelcomeMessage?.(token) ?? undefined;
                const welcomeModel = welcomeMessage && new chatModel_1.ChatWelcomeMessageModel(model, welcomeMessage.map(item => typeof item === 'string' ? new htmlContent_1.MarkdownString(item) : item), await provider.provideSampleQuestions?.(token) ?? []);
                model.initialize(session, welcomeModel);
            }
            catch (err) {
                this.trace('startSession', `initializeSession failed: ${err}`);
                model.setInitializationError(err);
                this._sessionModels.deleteAndDispose(model.sessionId);
                this._onDidDisposeSession.fire({ sessionId: model.sessionId, providerId: model.providerId, reason: 'initializationFailed' });
            }
        }
        getSession(sessionId) {
            return this._sessionModels.get(sessionId);
        }
        getSessionId(sessionProviderId) {
            return iterator_1.Iterable.find(this._sessionModels.values(), model => model.session?.id === sessionProviderId)?.sessionId;
        }
        getOrRestoreSession(sessionId) {
            this.trace('getOrRestoreSession', `sessionId: ${sessionId}`);
            const model = this._sessionModels.get(sessionId);
            if (model) {
                return model;
            }
            const sessionData = this._persistedSessions[sessionId];
            if (!sessionData) {
                return undefined;
            }
            if (sessionId === this.transferredSessionData?.sessionId) {
                this._transferredSessionData = undefined;
            }
            return this._startSession(sessionData.providerId, sessionData, cancellation_1.CancellationToken.None);
        }
        loadSessionFromContent(data) {
            return this._startSession(data.providerId, data, cancellation_1.CancellationToken.None);
        }
        async sendRequest(sessionId, request) {
            this.trace('sendRequest', `sessionId: ${sessionId}, message: ${request.substring(0, 20)}${request.length > 20 ? '[...]' : ''}}`);
            if (!request.trim()) {
                this.trace('sendRequest', 'Rejected empty message');
                return;
            }
            const model = this._sessionModels.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const provider = this._providers.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            if (this._pendingRequests.has(sessionId)) {
                this.trace('sendRequest', `Session ${sessionId} already has a pending request`);
                return;
            }
            // This method is only returning whether the request was accepted - don't block on the actual request
            return { responseCompletePromise: this._sendRequestAsync(model, sessionId, provider, request) };
        }
        async _sendRequestAsync(model, sessionId, provider, message) {
            const parsedRequest = await this.instantiationService.createInstance(chatRequestParser_1.ChatRequestParser).parseChatRequest(sessionId, message);
            let request;
            const agentPart = 'kind' in parsedRequest ? undefined : parsedRequest.parts.find((r) => r instanceof chatParserTypes_1.ChatRequestAgentPart);
            const agentSlashCommandPart = 'kind' in parsedRequest ? undefined : parsedRequest.parts.find((r) => r instanceof chatParserTypes_1.ChatRequestAgentSubcommandPart);
            const commandPart = 'kind' in parsedRequest ? undefined : parsedRequest.parts.find((r) => r instanceof chatParserTypes_1.ChatRequestSlashCommandPart);
            let gotProgress = false;
            const requestType = commandPart ? 'slashCommand' : 'string';
            const source = new cancellation_1.CancellationTokenSource();
            const token = source.token;
            const sendRequestInternal = async () => {
                const progressCallback = (progress) => {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    gotProgress = true;
                    if (progress.kind === 'content' || progress.kind === 'markdownContent') {
                        this.trace('sendRequest', `Provider returned progress for session ${model.sessionId}, ${typeof progress.content === 'string' ? progress.content.length : progress.content.value.length} chars`);
                    }
                    else {
                        this.trace('sendRequest', `Provider returned progress: ${JSON.stringify(progress)}`);
                    }
                    model.acceptResponseProgress(request, progress);
                };
                const stopWatch = new stopwatch_1.StopWatch(false);
                const listener = token.onCancellationRequested(() => {
                    this.trace('sendRequest', `Request for session ${model.sessionId} was cancelled`);
                    this.telemetryService.publicLog2('interactiveSessionProviderInvoked', {
                        providerId: provider.id,
                        timeToFirstProgress: undefined,
                        // Normally timings happen inside the EH around the actual provider. For cancellation we can measure how long the user waited before cancelling
                        totalTime: stopWatch.elapsed(),
                        result: 'cancelled',
                        requestType,
                        agent: agentPart?.agent.id ?? '',
                        slashCommand: agentSlashCommandPart ? agentSlashCommandPart.command.name : commandPart?.slashCommand.command,
                        chatSessionId: model.sessionId
                    });
                    model.cancelRequest(request);
                });
                try {
                    if (agentPart && agentSlashCommandPart?.command) {
                        this._onDidSubmitAgent.fire({ agent: agentPart.agent, slashCommand: agentSlashCommandPart.command, sessionId: model.sessionId });
                    }
                    let rawResponse;
                    let agentOrCommandFollowups = undefined;
                    const defaultAgent = this.chatAgentService.getDefaultAgent();
                    if (agentPart || (defaultAgent && !commandPart)) {
                        const agent = (agentPart?.agent ?? defaultAgent);
                        const history = [];
                        for (const request of model.getRequests()) {
                            if (!request.response) {
                                continue;
                            }
                            const historyRequest = {
                                sessionId,
                                requestId: request.id,
                                agentId: request.response.agent?.id ?? '',
                                message: request.variableData.message,
                                variables: request.variableData.variables,
                                command: request.response.slashCommand?.name
                            };
                            history.push({ request: historyRequest, response: request.response.response.value, result: { errorDetails: request.response.errorDetails } });
                        }
                        const variableData = await this.chatVariablesService.resolveVariables(parsedRequest, model, token);
                        request = model.addRequest(parsedRequest, variableData, agent, agentSlashCommandPart?.command);
                        const requestProps = {
                            sessionId,
                            requestId: request.id,
                            agentId: agent.id,
                            message: variableData.message,
                            variables: variableData.variables,
                            command: agentSlashCommandPart?.command.name ?? '',
                        };
                        const agentResult = await this.chatAgentService.invokeAgent(agent.id, requestProps, progressCallback, history, token);
                        rawResponse = {
                            session: model.session,
                            errorDetails: agentResult.errorDetails,
                            timings: agentResult.timings
                        };
                        agentOrCommandFollowups = agentResult?.followUp ? Promise.resolve(agentResult.followUp) :
                            this.chatAgentService.getFollowups(agent.id, sessionId, cancellation_1.CancellationToken.None);
                    }
                    else if (commandPart && this.chatSlashCommandService.hasCommand(commandPart.slashCommand.command)) {
                        request = model.addRequest(parsedRequest, { message, variables: {} });
                        // contributed slash commands
                        // TODO: spell this out in the UI
                        const history = [];
                        for (const request of model.getRequests()) {
                            if (!request.response) {
                                continue;
                            }
                            history.push({ role: 1 /* ChatMessageRole.User */, content: request.message.text });
                            history.push({ role: 2 /* ChatMessageRole.Assistant */, content: request.response.response.asString() });
                        }
                        const commandResult = await this.chatSlashCommandService.executeCommand(commandPart.slashCommand.command, message.substring(commandPart.slashCommand.command.length + 1).trimStart(), new progress_1.Progress(p => {
                            progressCallback(p);
                        }), history, token);
                        agentOrCommandFollowups = Promise.resolve(commandResult?.followUp);
                        rawResponse = { session: model.session };
                    }
                    else {
                        throw new Error(`Cannot handle request`);
                    }
                    if (token.isCancellationRequested) {
                        return;
                    }
                    else {
                        if (!rawResponse) {
                            this.trace('sendRequest', `Provider returned no response for session ${model.sessionId}`);
                            rawResponse = { session: model.session, errorDetails: { message: (0, nls_1.localize)('emptyResponse', "Provider returned null response") } };
                        }
                        const result = rawResponse.errorDetails?.responseIsFiltered ? 'filtered' :
                            rawResponse.errorDetails && gotProgress ? 'errorWithOutput' :
                                rawResponse.errorDetails ? 'error' :
                                    'success';
                        this.telemetryService.publicLog2('interactiveSessionProviderInvoked', {
                            providerId: provider.id,
                            timeToFirstProgress: rawResponse.timings?.firstProgress,
                            totalTime: rawResponse.timings?.totalElapsed,
                            result,
                            requestType,
                            agent: agentPart?.agent.id ?? '',
                            slashCommand: agentSlashCommandPart ? agentSlashCommandPart.command.name : commandPart?.slashCommand.command,
                            chatSessionId: model.sessionId
                        });
                        model.setResponse(request, rawResponse);
                        this.trace('sendRequest', `Provider returned response for session ${model.sessionId}`);
                        // TODO refactor this or rethink the API https://github.com/microsoft/vscode-copilot/issues/593
                        if (agentOrCommandFollowups) {
                            agentOrCommandFollowups.then(followups => {
                                model.setFollowups(request, followups);
                                model.completeResponse(request, rawResponse?.errorDetails);
                            });
                        }
                        else {
                            model.completeResponse(request, rawResponse?.errorDetails);
                        }
                    }
                }
                finally {
                    listener.dispose();
                }
            };
            const rawResponsePromise = sendRequestInternal();
            this._pendingRequests.set(model.sessionId, source);
            rawResponsePromise.finally(() => {
                this._pendingRequests.deleteAndDispose(model.sessionId);
            });
            return rawResponsePromise;
        }
        async removeRequest(sessionId, requestId) {
            const model = this._sessionModels.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const provider = this._providers.get(model.providerId);
            if (!provider) {
                throw new Error(`Unknown provider: ${model.providerId}`);
            }
            model.removeRequest(requestId);
        }
        async sendRequestToProvider(sessionId, message) {
            this.trace('sendRequestToProvider', `sessionId: ${sessionId}`);
            return await this.sendRequest(sessionId, message.message);
        }
        getProviders() {
            return Array.from(this._providers.keys());
        }
        async addCompleteRequest(sessionId, message, variableData, response) {
            this.trace('addCompleteRequest', `message: ${message}`);
            const model = this._sessionModels.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            await model.waitForInitialization();
            const parsedRequest = typeof message === 'string' ?
                await this.instantiationService.createInstance(chatRequestParser_1.ChatRequestParser).parseChatRequest(sessionId, message) :
                message;
            const request = model.addRequest(parsedRequest, variableData || { message: parsedRequest.text, variables: {} });
            if (typeof response.message === 'string') {
                model.acceptResponseProgress(request, { content: response.message, kind: 'content' });
            }
            else {
                for (const part of response.message) {
                    model.acceptResponseProgress(request, part, true);
                }
            }
            model.setResponse(request, {
                session: model.session,
                errorDetails: response.errorDetails,
            });
            if (response.followups !== undefined) {
                model.setFollowups(request, response.followups);
            }
            model.completeResponse(request, response.errorDetails);
        }
        cancelCurrentRequestForSession(sessionId) {
            this.trace('cancelCurrentRequestForSession', `sessionId: ${sessionId}`);
            this._pendingRequests.get(sessionId)?.cancel();
            this._pendingRequests.deleteAndDispose(sessionId);
        }
        clearSession(sessionId) {
            this.trace('clearSession', `sessionId: ${sessionId}`);
            const model = this._sessionModels.get(sessionId);
            if (!model) {
                throw new Error(`Unknown session: ${sessionId}`);
            }
            this._persistedSessions[sessionId] = model.toJSON();
            this._sessionModels.deleteAndDispose(sessionId);
            this._pendingRequests.get(sessionId)?.cancel();
            this._pendingRequests.deleteAndDispose(sessionId);
            this._onDidDisposeSession.fire({ sessionId, providerId: model.providerId, reason: 'cleared' });
        }
        registerProvider(provider) {
            this.trace('registerProvider', `Adding new chat provider`);
            if (this._providers.has(provider.id)) {
                throw new Error(`Provider ${provider.id} already registered`);
            }
            this._providers.set(provider.id, provider);
            this._hasProvider.set(true);
            this._onDidRegisterProvider.fire({ providerId: provider.id });
            Array.from(this._sessionModels.values())
                .filter(model => model.providerId === provider.id)
                // The provider may have been registered in the process of initializing this model. Only grab models that were deinitialized when the provider was unregistered
                .filter(model => model.initState === chatModel_1.ChatModelInitState.Created)
                .forEach(model => this.reinitializeModel(model));
            return (0, lifecycle_1.toDisposable)(() => {
                this.trace('registerProvider', `Disposing chat provider`);
                this._providers.delete(provider.id);
                this._hasProvider.set(this._providers.size > 0);
                Array.from(this._sessionModels.values())
                    .filter(model => model.providerId === provider.id)
                    .forEach(model => model.deinitialize());
            });
        }
        hasSessions(providerId) {
            return !!Object.values(this._persistedSessions).find((session) => session.providerId === providerId);
        }
        getProviderInfos() {
            return Array.from(this._providers.values()).map(provider => {
                return {
                    id: provider.id,
                    displayName: provider.displayName
                };
            });
        }
        transferChatSession(transferredSessionData, toWorkspace) {
            const model = iterator_1.Iterable.find(this._sessionModels.values(), model => model.sessionId === transferredSessionData.sessionId);
            if (!model) {
                throw new Error(`Failed to transfer session. Unknown session ID: ${transferredSessionData.sessionId}`);
            }
            const existingRaw = this.storageService.getObject(globalChatKey, 0 /* StorageScope.PROFILE */, []);
            existingRaw.push({
                chat: model.toJSON(),
                timestampInMilliseconds: Date.now(),
                toWorkspace: toWorkspace,
                inputValue: transferredSessionData.inputValue,
            });
            this.storageService.store(globalChatKey, JSON.stringify(existingRaw), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            this.trace('transferChatSession', `Transferred session ${model.sessionId} to workspace ${toWorkspace.toString()}`);
        }
    };
    exports.ChatService = ChatService;
    exports.ChatService = ChatService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, log_1.ILogService),
        __param(2, extensions_1.IExtensionService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, workspace_1.IWorkspaceContextService),
        __param(7, chatSlashCommands_1.IChatSlashCommandService),
        __param(8, chatVariables_1.IChatVariablesService),
        __param(9, chatAgents_1.IChatAgentService)
    ], ChatService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFNlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2NvbW1vbi9jaGF0U2VydmljZUltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEJoRyxNQUFNLGlCQUFpQixHQUFHLHNCQUFzQixDQUFDO0lBRWpELE1BQU0sYUFBYSxHQUFHLHdCQUF3QixDQUFDO0lBTy9DLE1BQU0sMkNBQTJDLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQXNGOUQsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7SUFFekIsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLHNCQUFVO1FBVzFDLElBQVcsc0JBQXNCO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDO1FBQ3JDLENBQUM7UUFjRCxZQUNrQixjQUFnRCxFQUNwRCxVQUF3QyxFQUNsQyxnQkFBb0QsRUFDaEQsb0JBQTRELEVBQ2hFLGdCQUFvRCxFQUNuRCxpQkFBc0QsRUFDaEQsdUJBQWtFLEVBQ2xFLHVCQUFrRSxFQUNyRSxvQkFBNEQsRUFDaEUsZ0JBQW9EO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBWDBCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNuQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2pCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDL0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMvQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ2xDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDL0IsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUNqRCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ3BELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFD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
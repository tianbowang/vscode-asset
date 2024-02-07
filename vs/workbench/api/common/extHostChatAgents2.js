(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/stopwatch", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/progress/common/progress", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, arrays_1, async_1, cancellation_1, errorMessage_1, event_1, stopwatch_1, types_1, uri_1, nls_1, progress_1, extHost_protocol_1, typeConvert, extHostTypes, chatService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostChatAgents2 = void 0;
    class ExtHostChatAgents2 {
        static { this._idPool = 0; }
        constructor(mainContext, _extHostChatProvider, _logService) {
            this._extHostChatProvider = _extHostChatProvider;
            this._logService = _logService;
            this._agents = new Map();
            this._previousResultMap = new Map();
            this._resultsBySessionAndRequestId = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadChatAgents2);
        }
        createChatAgent(extension, name, handler) {
            const handle = ExtHostChatAgents2._idPool++;
            const agent = new ExtHostChatAgent(extension, name, this._proxy, handle, handler);
            this._agents.set(handle, agent);
            this._proxy.$registerAgent(handle, name, {});
            return agent.apiAgent;
        }
        async $invokeAgent(handle, request, context, token) {
            // Clear the previous result so that $acceptFeedback or $acceptAction during a request will be ignored.
            // We may want to support sending those during a request.
            this._previousResultMap.delete(request.sessionId);
            const agent = this._agents.get(handle);
            if (!agent) {
                throw new Error(`[CHAT](${handle}) CANNOT invoke agent because the agent is not registered`);
            }
            let done = false;
            function throwIfDone() {
                if (done) {
                    throw new Error('Only valid while executing the command');
                }
            }
            const commandExecution = new async_1.DeferredPromise();
            token.onCancellationRequested(() => commandExecution.complete());
            this._extHostChatProvider.allowListExtensionWhile(agent.extension.identifier, commandExecution.p);
            const slashCommand = request.command
                ? await agent.validateSlashCommand(request.command)
                : undefined;
            const stopWatch = stopwatch_1.StopWatch.create(false);
            let firstProgress;
            try {
                const convertedHistory = await this.prepareHistory(agent, request, context);
                const task = agent.invoke(typeConvert.ChatAgentRequest.to(request, slashCommand), { history: convertedHistory }, new progress_1.Progress(progress => {
                    throwIfDone();
                    // Measure the time to the first progress update with real markdown content
                    if (typeof firstProgress === 'undefined' && 'content' in progress) {
                        firstProgress = stopWatch.elapsed();
                    }
                    const convertedProgress = typeConvert.ChatResponseProgress.from(agent.extension, progress);
                    if (!convertedProgress) {
                        this._logService.error('Unknown progress type: ' + JSON.stringify(progress));
                        return;
                    }
                    if ('placeholder' in progress && 'resolvedContent' in progress) {
                        // Ignore for now, this is the deleted Task type
                    }
                    else {
                        this._proxy.$handleProgressChunk(request.requestId, convertedProgress);
                    }
                }), token);
                return await (0, async_1.raceCancellation)(Promise.resolve(task).then((result) => {
                    if (result) {
                        this._previousResultMap.set(request.sessionId, result);
                        let sessionResults = this._resultsBySessionAndRequestId.get(request.sessionId);
                        if (!sessionResults) {
                            sessionResults = new Map();
                            this._resultsBySessionAndRequestId.set(request.sessionId, sessionResults);
                        }
                        sessionResults.set(request.requestId, result);
                        const timings = { firstProgress: firstProgress, totalElapsed: stopWatch.elapsed() };
                        return { errorDetails: result.errorDetails, timings };
                    }
                    else {
                        this._previousResultMap.delete(request.sessionId);
                    }
                    return undefined;
                }), token);
            }
            catch (e) {
                this._logService.error(e, agent.extension);
                return { errorDetails: { message: (0, nls_1.localize)('errorResponse', "Error from provider: {0}", (0, errorMessage_1.toErrorMessage)(e)), responseIsIncomplete: true } };
            }
            finally {
                done = true;
                commandExecution.complete();
            }
        }
        async prepareHistory(agent, request, context) {
            return (0, arrays_1.coalesce)(await Promise.all(context.history
                .map(async (h) => {
                const result = request.agentId === h.request.agentId && this._resultsBySessionAndRequestId.get(request.sessionId)?.get(h.request.requestId)
                    || h.result;
                return {
                    request: typeConvert.ChatAgentRequest.to(h.request, undefined),
                    response: (0, arrays_1.coalesce)(h.response.map(r => typeConvert.ChatResponseProgress.toProgressContent(r))),
                    result
                };
            })));
        }
        $releaseSession(sessionId) {
            this._previousResultMap.delete(sessionId);
            this._resultsBySessionAndRequestId.delete(sessionId);
        }
        async $provideSlashCommands(handle, token) {
            const agent = this._agents.get(handle);
            if (!agent) {
                // this is OK, the agent might have disposed while the request was in flight
                return [];
            }
            return agent.provideSlashCommand(token);
        }
        $provideFollowups(handle, sessionId, token) {
            const agent = this._agents.get(handle);
            if (!agent) {
                return Promise.resolve([]);
            }
            const result = this._previousResultMap.get(sessionId);
            if (!result) {
                return Promise.resolve([]);
            }
            return agent.provideFollowups(result, token);
        }
        $acceptFeedback(handle, sessionId, requestId, vote, reportIssue) {
            const agent = this._agents.get(handle);
            if (!agent) {
                return;
            }
            const result = this._resultsBySessionAndRequestId.get(sessionId)?.get(requestId);
            if (!result) {
                return;
            }
            let kind;
            switch (vote) {
                case chatService_1.InteractiveSessionVoteDirection.Down:
                    kind = extHostTypes.ChatAgentResultFeedbackKind.Unhelpful;
                    break;
                case chatService_1.InteractiveSessionVoteDirection.Up:
                    kind = extHostTypes.ChatAgentResultFeedbackKind.Helpful;
                    break;
            }
            agent.acceptFeedback(reportIssue ? Object.freeze({ result, kind, reportIssue }) : Object.freeze({ result, kind }));
        }
        $acceptAction(handle, sessionId, requestId, action) {
            const agent = this._agents.get(handle);
            if (!agent) {
                return;
            }
            const result = this._resultsBySessionAndRequestId.get(sessionId)?.get(requestId);
            if (!result) {
                return;
            }
            if (action.action.kind === 'vote') {
                // handled by $acceptFeedback
                return;
            }
            agent.acceptAction(Object.freeze({ action: action.action, result }));
        }
        async $invokeCompletionProvider(handle, query, token) {
            const agent = this._agents.get(handle);
            if (!agent) {
                return [];
            }
            const items = await agent.invokeCompletionProvider(query, token);
            return items.map(typeConvert.ChatAgentCompletionItem.from);
        }
    }
    exports.ExtHostChatAgents2 = ExtHostChatAgents2;
    class ExtHostChatAgent {
        constructor(extension, id, _proxy, _handle, _callback) {
            this.extension = extension;
            this.id = id;
            this._proxy = _proxy;
            this._handle = _handle;
            this._callback = _callback;
            this._onDidReceiveFeedback = new event_1.Emitter();
            this._onDidPerformAction = new event_1.Emitter();
        }
        acceptFeedback(feedback) {
            this._onDidReceiveFeedback.fire(feedback);
        }
        acceptAction(event) {
            this._onDidPerformAction.fire(event);
        }
        async invokeCompletionProvider(query, token) {
            if (!this._agentVariableProvider) {
                return [];
            }
            return await this._agentVariableProvider.provider.provideCompletionItems(query, token) ?? [];
        }
        async validateSlashCommand(command) {
            if (!this._lastSlashCommands) {
                await this.provideSlashCommand(cancellation_1.CancellationToken.None);
                (0, types_1.assertType)(this._lastSlashCommands);
            }
            const result = this._lastSlashCommands.find(candidate => candidate.name === command);
            if (!result) {
                throw new Error(`Unknown slashCommand: ${command}`);
            }
            return result;
        }
        async provideSlashCommand(token) {
            if (!this._slashCommandProvider) {
                return [];
            }
            const result = await this._slashCommandProvider.provideSubCommands(token);
            if (!result) {
                return [];
            }
            this._lastSlashCommands = result;
            return result
                .map(c => ({
                name: c.name,
                description: c.description,
                followupPlaceholder: c.followupPlaceholder,
                shouldRepopulate: c.shouldRepopulate,
                sampleRequest: c.sampleRequest
            }));
        }
        async provideFollowups(result, token) {
            if (!this._followupProvider) {
                return [];
            }
            const followups = await this._followupProvider.provideFollowups(result, token);
            if (!followups) {
                return [];
            }
            return followups.map(f => typeConvert.ChatFollowup.from(f));
        }
        get apiAgent() {
            let disposed = false;
            let updateScheduled = false;
            const updateMetadataSoon = () => {
                if (disposed) {
                    return;
                }
                if (updateScheduled) {
                    return;
                }
                updateScheduled = true;
                queueMicrotask(() => {
                    this._proxy.$updateAgent(this._handle, {
                        description: this._description ?? '',
                        fullName: this._fullName,
                        icon: !this._iconPath ? undefined :
                            this._iconPath instanceof uri_1.URI ? this._iconPath :
                                'light' in this._iconPath ? this._iconPath.light :
                                    undefined,
                        iconDark: !this._iconPath ? undefined :
                            'dark' in this._iconPath ? this._iconPath.dark :
                                undefined,
                        themeIcon: this._iconPath instanceof extHostTypes.ThemeIcon ? this._iconPath : undefined,
                        hasSlashCommands: this._slashCommandProvider !== undefined,
                        hasFollowups: this._followupProvider !== undefined,
                        isDefault: this._isDefault,
                        isSecondary: this._isSecondary,
                        helpTextPrefix: (!this._helpTextPrefix || typeof this._helpTextPrefix === 'string') ? this._helpTextPrefix : typeConvert.MarkdownString.from(this._helpTextPrefix),
                        helpTextPostfix: (!this._helpTextPostfix || typeof this._helpTextPostfix === 'string') ? this._helpTextPostfix : typeConvert.MarkdownString.from(this._helpTextPostfix),
                        sampleRequest: this._sampleRequest,
                        supportIssueReporting: this._supportIssueReporting
                    });
                    updateScheduled = false;
                });
            };
            const that = this;
            return {
                get name() {
                    return that.id;
                },
                get description() {
                    return that._description ?? '';
                },
                set description(v) {
                    that._description = v;
                    updateMetadataSoon();
                },
                get fullName() {
                    return that._fullName ?? that.extension.displayName ?? that.extension.name;
                },
                set fullName(v) {
                    that._fullName = v;
                    updateMetadataSoon();
                },
                get iconPath() {
                    return that._iconPath;
                },
                set iconPath(v) {
                    that._iconPath = v;
                    updateMetadataSoon();
                },
                get subCommandProvider() {
                    return that._slashCommandProvider;
                },
                set subCommandProvider(v) {
                    that._slashCommandProvider = v;
                    updateMetadataSoon();
                },
                get followupProvider() {
                    return that._followupProvider;
                },
                set followupProvider(v) {
                    that._followupProvider = v;
                    updateMetadataSoon();
                },
                get isDefault() {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'defaultChatAgent');
                    return that._isDefault;
                },
                set isDefault(v) {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'defaultChatAgent');
                    that._isDefault = v;
                    updateMetadataSoon();
                },
                get helpTextPrefix() {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'defaultChatAgent');
                    return that._helpTextPrefix;
                },
                set helpTextPrefix(v) {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'defaultChatAgent');
                    if (!that._isDefault) {
                        throw new Error('helpTextPrefix is only available on the default chat agent');
                    }
                    that._helpTextPrefix = v;
                    updateMetadataSoon();
                },
                get helpTextPostfix() {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'defaultChatAgent');
                    return that._helpTextPostfix;
                },
                set helpTextPostfix(v) {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'defaultChatAgent');
                    if (!that._isDefault) {
                        throw new Error('helpTextPostfix is only available on the default chat agent');
                    }
                    that._helpTextPostfix = v;
                    updateMetadataSoon();
                },
                get isSecondary() {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'defaultChatAgent');
                    return that._isSecondary;
                },
                set isSecondary(v) {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'defaultChatAgent');
                    that._isSecondary = v;
                    updateMetadataSoon();
                },
                get sampleRequest() {
                    return that._sampleRequest;
                },
                set sampleRequest(v) {
                    that._sampleRequest = v;
                    updateMetadataSoon();
                },
                get supportIssueReporting() {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'chatAgents2Additions');
                    return that._supportIssueReporting;
                },
                set supportIssueReporting(v) {
                    (0, extensions_1.checkProposedApiEnabled)(that.extension, 'chatAgents2Additions');
                    that._supportIssueReporting = v;
                    updateMetadataSoon();
                },
                get onDidReceiveFeedback() {
                    return that._onDidReceiveFeedback.event;
                },
                set agentVariableProvider(v) {
                    that._agentVariableProvider = v;
                    if (v) {
                        if (!v.triggerCharacters.length) {
                            throw new Error('triggerCharacters are required');
                        }
                        that._proxy.$registerAgentCompletionsProvider(that._handle, v.triggerCharacters);
                    }
                    else {
                        that._proxy.$unregisterAgentCompletionsProvider(that._handle);
                    }
                },
                get agentVariableProvider() {
                    return that._agentVariableProvider;
                },
                onDidPerformAction: !(0, extensions_1.isProposedApiEnabled)(this.extension, 'chatAgents2Additions')
                    ? undefined
                    : this._onDidPerformAction.event,
                dispose() {
                    disposed = true;
                    that._slashCommandProvider = undefined;
                    that._followupProvider = undefined;
                    that._onDidReceiveFeedback.dispose();
                    that._proxy.$unregisterAgent(that._handle);
                },
            };
        }
        invoke(request, context, progress, token) {
            return this._callback(request, context, progress, token);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENoYXRBZ2VudHMyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Q2hhdEFnZW50czIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUJoRyxNQUFhLGtCQUFrQjtpQkFFZixZQUFPLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFRM0IsWUFDQyxXQUF5QixFQUNSLG9CQUF5QyxFQUN6QyxXQUF3QjtZQUR4Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXFCO1lBQ3pDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBVHpCLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztZQUduRCx1QkFBa0IsR0FBeUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNyRSxrQ0FBNkIsR0FBc0QsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQU83RyxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxlQUFlLENBQTBDLFNBQWdDLEVBQUUsSUFBWSxFQUFFLE9BQXdDO1lBQ2hKLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksZ0JBQWdCLENBQVUsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3QyxPQUFPLEtBQUssQ0FBQyxR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
//# sourceURL=../../../vs/workbench/api/common/extHostChatAgents2.js
})
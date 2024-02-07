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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/common/core/wordHelper", "vs/editor/common/services/languageFeatures", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatInputPart", "vs/workbench/contrib/chat/browser/contrib/chatDynamicVariables", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatParserTypes", "vs/workbench/contrib/chat/common/chatRequestParser", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, marshalling_1, strings_1, range_1, wordHelper_1, languageFeatures_1, instantiation_1, extHost_protocol_1, chat_1, chatInputPart_1, chatDynamicVariables_1, chatAgents_1, chatParserTypes_1, chatRequestParser_1, chatService_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadChatAgents2 = void 0;
    let MainThreadChatAgents2 = class MainThreadChatAgents2 extends lifecycle_1.Disposable {
        constructor(extHostContext, _chatAgentService, _chatService, _languageFeaturesService, _chatWidgetService, _instantiationService) {
            super();
            this._chatAgentService = _chatAgentService;
            this._chatService = _chatService;
            this._languageFeaturesService = _languageFeaturesService;
            this._chatWidgetService = _chatWidgetService;
            this._instantiationService = _instantiationService;
            this._agents = this._register(new lifecycle_1.DisposableMap());
            this._agentCompletionProviders = this._register(new lifecycle_1.DisposableMap());
            this._pendingProgress = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostChatAgents2);
            this._register(this._chatService.onDidDisposeSession(e => {
                this._proxy.$releaseSession(e.sessionId);
            }));
            this._register(this._chatService.onDidPerformUserAction(e => {
                if (typeof e.agentId === 'string') {
                    for (const [handle, agent] of this._agents) {
                        if (agent.name === e.agentId) {
                            if (e.action.kind === 'vote') {
                                this._proxy.$acceptFeedback(handle, e.sessionId, e.requestId, e.action.direction);
                            }
                            else {
                                this._proxy.$acceptAction(handle, e.sessionId, e.requestId, e);
                            }
                            break;
                        }
                    }
                }
            }));
        }
        $unregisterAgent(handle) {
            this._agents.deleteAndDispose(handle);
        }
        $registerAgent(handle, name, metadata) {
            const d = this._chatAgentService.registerAgent({
                id: name,
                metadata: (0, marshalling_1.revive)(metadata),
                invoke: async (request, progress, history, token) => {
                    this._pendingProgress.set(request.requestId, progress);
                    try {
                        return await this._proxy.$invokeAgent(handle, request, { history }, token) ?? {};
                    }
                    finally {
                        this._pendingProgress.delete(request.requestId);
                    }
                },
                provideFollowups: async (sessionId, token) => {
                    if (!this._agents.get(handle)?.hasFollowups) {
                        return [];
                    }
                    return this._proxy.$provideFollowups(handle, sessionId, token);
                },
                provideSlashCommands: async (token) => {
                    if (!this._agents.get(handle)?.hasSlashCommands) {
                        return []; // save an IPC call
                    }
                    return this._proxy.$provideSlashCommands(handle, token);
                }
            });
            this._agents.set(handle, {
                name,
                dispose: d.dispose,
                hasSlashCommands: metadata.hasSlashCommands,
                hasFollowups: metadata.hasFollowups
            });
        }
        $updateAgent(handle, metadataUpdate) {
            const data = this._agents.get(handle);
            if (!data) {
                throw new Error(`No agent with handle ${handle} registered`);
            }
            data.hasSlashCommands = metadataUpdate.hasSlashCommands;
            data.hasFollowups = metadataUpdate.hasFollowups;
            this._chatAgentService.updateAgent(data.name, (0, marshalling_1.revive)(metadataUpdate));
        }
        async $handleProgressChunk(requestId, progress) {
            const revivedProgress = (0, marshalling_1.revive)(progress);
            this._pendingProgress.get(requestId)?.(revivedProgress);
        }
        $registerAgentCompletionsProvider(handle, triggerCharacters) {
            this._agentCompletionProviders.set(handle, this._languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgentCompletions:' + handle,
                triggerCharacters,
                provideCompletionItems: async (model, position, _context, token) => {
                    const widget = this._chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget || !widget.viewModel) {
                        return;
                    }
                    const triggerCharsPart = triggerCharacters.map(c => (0, strings_1.escapeRegExpCharacters)(c)).join('');
                    const wordRegex = new RegExp(`[${triggerCharsPart}]\\S*`, 'g');
                    const query = (0, wordHelper_1.getWordAtText)(position.column, wordRegex, model.getLineContent(position.lineNumber), 0)?.word ?? '';
                    if (query && !triggerCharacters.some(c => query.startsWith(c))) {
                        return;
                    }
                    const parsedRequest = (await this._instantiationService.createInstance(chatRequestParser_1.ChatRequestParser).parseChatRequest(widget.viewModel.sessionId, model.getValue())).parts;
                    const agentPart = parsedRequest.find((part) => part instanceof chatParserTypes_1.ChatRequestAgentPart);
                    const thisAgentName = this._agents.get(handle)?.name;
                    if (agentPart?.agent.id !== thisAgentName) {
                        return;
                    }
                    const range = computeCompletionRanges(model, position, wordRegex);
                    if (!range) {
                        return null;
                    }
                    const result = await this._proxy.$invokeCompletionProvider(handle, query, token);
                    const variableItems = result.map(v => {
                        const insertText = v.insertText ?? (typeof v.label === 'string' ? v.label : v.label.label);
                        const rangeAfterInsert = new range_1.Range(range.insert.startLineNumber, range.insert.startColumn, range.insert.endLineNumber, range.insert.startColumn + insertText.length);
                        return {
                            label: v.label,
                            range,
                            insertText: insertText + ' ',
                            kind: 18 /* CompletionItemKind.Text */,
                            detail: v.detail,
                            documentation: v.documentation,
                            command: { id: chatDynamicVariables_1.AddDynamicVariableAction.ID, title: '', arguments: [{ widget, range: rangeAfterInsert, variableData: (0, marshalling_1.revive)(v.values) }] }
                        };
                    });
                    return {
                        suggestions: variableItems
                    };
                }
            }));
        }
        $unregisterAgentCompletionsProvider(handle) {
            this._agentCompletionProviders.deleteAndDispose(handle);
        }
    };
    exports.MainThreadChatAgents2 = MainThreadChatAgents2;
    exports.MainThreadChatAgents2 = MainThreadChatAgents2 = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadChatAgents2),
        __param(1, chatAgents_1.IChatAgentService),
        __param(2, chatService_1.IChatService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, chat_1.IChatWidgetService),
        __param(5, instantiation_1.IInstantiationService)
    ], MainThreadChatAgents2);
    function computeCompletionRanges(model, position, reg) {
        const varWord = (0, wordHelper_1.getWordAtText)(position.column, reg, model.getLineContent(position.lineNumber), 0);
        if (!varWord && model.getWordUntilPosition(position).word) {
            // inside a "normal" word
            return;
        }
        let insert;
        let replace;
        if (!varWord) {
            insert = replace = range_1.Range.fromPositions(position);
        }
        else {
            insert = new range_1.Range(position.lineNumber, varWord.startColumn, position.lineNumber, position.column);
            replace = new range_1.Range(position.lineNumber, varWord.startColumn, position.lineNumber, varWord.endColumn);
        }
        return { insert, replace };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENoYXRBZ2VudHMyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZENoYXRBZ2VudHMyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQStCekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBVTtRQVFwRCxZQUNDLGNBQStCLEVBQ1osaUJBQXFELEVBQzFELFlBQTJDLEVBQy9CLHdCQUFtRSxFQUN6RSxrQkFBdUQsRUFDcEQscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBTjRCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDekMsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDZCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3hELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDbkMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQVpwRSxZQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlCQUFhLEVBQXFCLENBQUMsQ0FBQztZQUNqRSw4QkFBeUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBdUIsQ0FBQyxDQUFDO1lBRXJGLHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUF5QyxDQUFDO1lBWXBGLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN4RCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFD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
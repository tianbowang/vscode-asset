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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, event_1, lifecycle_1, uri_1, extHost_protocol_1, chat_1, chatContributionService_1, chatService_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadChat = void 0;
    let MainThreadChat = class MainThreadChat extends lifecycle_1.Disposable {
        constructor(extHostContext, _chatService, _chatWidgetService, chatContribService) {
            super();
            this._chatService = _chatService;
            this._chatWidgetService = _chatWidgetService;
            this.chatContribService = chatContribService;
            this._providerRegistrations = this._register(new lifecycle_1.DisposableMap());
            this._stateEmitters = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostChat);
        }
        $transferChatSession(sessionId, toWorkspace) {
            const sessionIdStr = this._chatService.getSessionId(sessionId);
            if (!sessionIdStr) {
                throw new Error(`Failed to transfer session. Unknown session provider ID: ${sessionId}`);
            }
            const widget = this._chatWidgetService.getWidgetBySessionId(sessionIdStr);
            const inputValue = widget?.inputEditor.getValue() ?? '';
            this._chatService.transferChatSession({ sessionId: sessionIdStr, inputValue: inputValue }, uri_1.URI.revive(toWorkspace));
        }
        async $registerChatProvider(handle, id) {
            const registration = this.chatContribService.registeredProviders.find(staticProvider => staticProvider.id === id);
            if (!registration) {
                throw new Error(`Provider ${id} must be declared in the package.json.`);
            }
            const unreg = this._chatService.registerProvider({
                id,
                displayName: registration.label,
                prepareSession: async (token) => {
                    const session = await this._proxy.$prepareChat(handle, token);
                    if (!session) {
                        return undefined;
                    }
                    const responderAvatarIconUri = session.responderAvatarIconUri &&
                        uri_1.URI.revive(session.responderAvatarIconUri);
                    const emitter = new event_1.Emitter();
                    this._stateEmitters.set(session.id, emitter);
                    return {
                        id: session.id,
                        requesterUsername: session.requesterUsername,
                        requesterAvatarIconUri: uri_1.URI.revive(session.requesterAvatarIconUri),
                        responderUsername: session.responderUsername,
                        responderAvatarIconUri,
                        inputPlaceholder: session.inputPlaceholder,
                        dispose: () => {
                            emitter.dispose();
                            this._stateEmitters.delete(session.id);
                            this._proxy.$releaseSession(session.id);
                        }
                    };
                },
                provideWelcomeMessage: (token) => {
                    return this._proxy.$provideWelcomeMessage(handle, token);
                },
                provideSampleQuestions: (token) => {
                    return this._proxy.$provideSampleQuestions(handle, token);
                },
            });
            this._providerRegistrations.set(handle, unreg);
        }
        async $acceptChatState(sessionId, state) {
            this._stateEmitters.get(sessionId)?.fire(state);
        }
        async $sendRequestToProvider(providerId, message) {
            const widget = await this._chatWidgetService.revealViewForProvider(providerId);
            if (widget && widget.viewModel) {
                this._chatService.sendRequestToProvider(widget.viewModel.sessionId, message);
            }
        }
        async $unregisterChatProvider(handle) {
            this._providerRegistrations.deleteAndDispose(handle);
        }
    };
    exports.MainThreadChat = MainThreadChat;
    exports.MainThreadChat = MainThreadChat = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadChat),
        __param(1, chatService_1.IChatService),
        __param(2, chat_1.IChatWidgetService),
        __param(3, chatContributionService_1.IChatContributionService)
    ], MainThreadChat);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENoYXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkQ2hhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZekYsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHNCQUFVO1FBTzdDLFlBQ0MsY0FBK0IsRUFDakIsWUFBMkMsRUFDckMsa0JBQXVELEVBQ2pELGtCQUE2RDtZQUV2RixLQUFLLEVBQUUsQ0FBQztZQUp1QixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUNwQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ2hDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBMEI7WUFUdkUsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlCQUFhLEVBQVUsQ0FBQyxDQUFDO1lBQ3JFLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7WUFXakUsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELG9CQUFvQixDQUFDLFNBQWlCLEVBQUUsV0FBMEI7WUFDakUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLDREQUE0RCxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQzFGLENBQUM7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUUsTUFBTSxVQUFVLEdBQUcsTUFBTSxFQUFFLFdBQVcs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
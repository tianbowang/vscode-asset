(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, iterator_1, lifecycle_1, extHost_protocol_1, typeConvert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostChat = void 0;
    class ChatProviderWrapper {
        static { this._pool = 0; }
        constructor(extension, provider) {
            this.extension = extension;
            this.provider = provider;
            this.handle = ChatProviderWrapper._pool++;
        }
    }
    class ExtHostChat {
        static { this._nextId = 0; }
        constructor(mainContext) {
            this._chatProvider = new Map();
            this._chatSessions = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadChat);
        }
        //#region interactive session
        registerChatProvider(extension, id, provider) {
            const wrapper = new ChatProviderWrapper(extension, provider);
            this._chatProvider.set(wrapper.handle, wrapper);
            this._proxy.$registerChatProvider(wrapper.handle, id);
            return (0, lifecycle_1.toDisposable)(() => {
                this._proxy.$unregisterChatProvider(wrapper.handle);
                this._chatProvider.delete(wrapper.handle);
            });
        }
        transferChatSession(session, newWorkspace) {
            const sessionId = iterator_1.Iterable.find(this._chatSessions.keys(), key => this._chatSessions.get(key) === session) ?? 0;
            if (typeof sessionId !== 'number') {
                return;
            }
            this._proxy.$transferChatSession(sessionId, newWorkspace);
        }
        sendInteractiveRequestToProvider(providerId, message) {
            this._proxy.$sendRequestToProvider(providerId, message);
        }
        async $prepareChat(handle, token) {
            const entry = this._chatProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            const session = await entry.provider.prepareSession(token);
            if (!session) {
                return undefined;
            }
            const id = ExtHostChat._nextId++;
            this._chatSessions.set(id, session);
            return {
                id,
                requesterUsername: session.requester?.name,
                requesterAvatarIconUri: session.requester?.icon,
                responderUsername: session.responder?.name,
                responderAvatarIconUri: session.responder?.icon,
                inputPlaceholder: session.inputPlaceholder,
            };
        }
        async $provideWelcomeMessage(handle, token) {
            const entry = this._chatProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            if (!entry.provider.provideWelcomeMessage) {
                return undefined;
            }
            const content = await entry.provider.provideWelcomeMessage(token);
            if (!content) {
                return undefined;
            }
            return content.map(item => {
                if (typeof item === 'string') {
                    return item;
                }
                else if (Array.isArray(item)) {
                    return item.map(f => typeConvert.ChatReplyFollowup.from(f));
                }
                else {
                    return typeConvert.MarkdownString.from(item);
                }
            });
        }
        async $provideSampleQuestions(handle, token) {
            const entry = this._chatProvider.get(handle);
            if (!entry) {
                return undefined;
            }
            if (!entry.provider.provideSampleQuestions) {
                return undefined;
            }
            const rawFollowups = await entry.provider.provideSampleQuestions(token);
            if (!rawFollowups) {
                return undefined;
            }
            return rawFollowups?.map(f => typeConvert.ChatReplyFollowup.from(f));
        }
        $releaseSession(sessionId) {
            this._chatSessions.delete(sessionId);
        }
    }
    exports.ExtHostChat = ExtHostChat;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENoYXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RDaGF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFNLG1CQUFtQjtpQkFFVCxVQUFLLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFJekIsWUFDVSxTQUFpRCxFQUNqRCxRQUFXO1lBRFgsY0FBUyxHQUFULFNBQVMsQ0FBd0M7WUFDakQsYUFBUSxHQUFSLFFBQVEsQ0FBRztZQUpaLFdBQU0sR0FBVyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUtsRCxDQUFDOztJQUdOLE1BQWEsV0FBVztpQkFDUixZQUFPLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFRM0IsWUFDQyxXQUF5QjtZQVBULGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQWtFLENBQUM7WUFFMUYsa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztZQU83RSxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRUQsNkJBQTZCO1FBRTdCLG9CQUFvQixDQUFDLFNBQWlELEVBQUUsRUFBVSxFQUFFLFFBQTJDO1lBQzlILE1BQU0sT0FBTyxHQUFHLElBQUksbUJBQW1CLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDeEIs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
//# sourceURL=../../../vs/workbench/api/common/extHostChat.js
})
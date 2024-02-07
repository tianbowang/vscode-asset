/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, iterator_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatAgentService = exports.IChatAgentService = void 0;
    exports.IChatAgentService = (0, instantiation_1.createDecorator)('chatAgentService');
    class ChatAgentService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._agents = new Map();
            this._onDidChangeAgents = this._register(new event_1.Emitter());
            this.onDidChangeAgents = this._onDidChangeAgents.event;
        }
        static { this.AGENT_LEADER = '@'; }
        dispose() {
            super.dispose();
            this._agents.clear();
        }
        registerAgent(agent) {
            if (this._agents.has(agent.id)) {
                throw new Error(`Already registered an agent with id ${agent.id}`);
            }
            this._agents.set(agent.id, { agent });
            this._onDidChangeAgents.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._agents.delete(agent.id)) {
                    this._onDidChangeAgents.fire();
                }
            });
        }
        updateAgent(id, updateMetadata) {
            const data = this._agents.get(id);
            if (!data) {
                throw new Error(`No agent with id ${id} registered`);
            }
            data.agent.metadata = { ...data.agent.metadata, ...updateMetadata };
            this._onDidChangeAgents.fire();
        }
        getDefaultAgent() {
            return iterator_1.Iterable.find(this._agents.values(), a => !!a.agent.metadata.isDefault)?.agent;
        }
        getSecondaryAgent() {
            return iterator_1.Iterable.find(this._agents.values(), a => !!a.agent.metadata.isSecondary)?.agent;
        }
        getAgents() {
            return Array.from(this._agents.values(), v => v.agent);
        }
        hasAgent(id) {
            return this._agents.has(id);
        }
        getAgent(id) {
            const data = this._agents.get(id);
            return data?.agent;
        }
        async invokeAgent(id, request, progress, history, token) {
            const data = this._agents.get(id);
            if (!data) {
                throw new Error(`No agent with id ${id}`);
            }
            return await data.agent.invoke(request, progress, history, token);
        }
        async getFollowups(id, sessionId, token) {
            const data = this._agents.get(id);
            if (!data) {
                throw new Error(`No agent with id ${id}`);
            }
            if (!data.agent.provideFollowups) {
                return [];
            }
            return data.agent.provideFollowups(sessionId, token);
        }
    }
    exports.ChatAgentService = ChatAgentService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEFnZW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9jb21tb24vY2hhdEFnZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE2Rm5GLFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwrQkFBZSxFQUFvQixrQkFBa0IsQ0FBQyxDQUFDO0lBZ0J4RixNQUFhLGdCQUFpQixTQUFRLHNCQUFVO1FBQWhEOztZQU1rQixZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7WUFFbkQsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDakUsc0JBQWlCLEdBQWdCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7UUF3RXpFLENBQUM7aUJBL0V1QixpQkFBWSxHQUFHLEdBQUcsQUFBTixDQUFPO1FBU2pDLE9BQU87WUFDZixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRUQsYUFBYSxDQUFDLEtBQWlCO1lBQzlCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLENBQUM7WUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFL0IsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FB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
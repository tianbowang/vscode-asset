/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatProviderService = exports.IChatProviderService = exports.ChatMessageRole = void 0;
    var ChatMessageRole;
    (function (ChatMessageRole) {
        ChatMessageRole[ChatMessageRole["System"] = 0] = "System";
        ChatMessageRole[ChatMessageRole["User"] = 1] = "User";
        ChatMessageRole[ChatMessageRole["Assistant"] = 2] = "Assistant";
        ChatMessageRole[ChatMessageRole["Function"] = 3] = "Function";
    })(ChatMessageRole || (exports.ChatMessageRole = ChatMessageRole = {}));
    exports.IChatProviderService = (0, instantiation_1.createDecorator)('chatProviderService');
    class ChatProviderService {
        constructor() {
            this._providers = new Map();
        }
        lookupChatResponseProvider(identifier) {
            return this._providers.get(identifier)?.metadata;
        }
        registerChatResponseProvider(identifier, provider) {
            if (this._providers.has(identifier)) {
                throw new Error(`Chat response provider with identifier ${identifier} is already registered.`);
            }
            this._providers.set(identifier, provider);
            return (0, lifecycle_1.toDisposable)(() => this._providers.delete(identifier));
        }
        fetchChatResponse(identifier, messages, options, progress, token) {
            const provider = this._providers.get(identifier);
            if (!provider) {
                throw new Error(`Chat response provider with identifier ${identifier} is not registered.`);
            }
            return provider.provideChatResponse(messages, options, progress, token);
        }
    }
    exports.ChatProviderService = ChatProviderService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2NvbW1vbi9jaGF0UHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLElBQWtCLGVBS2pCO0lBTEQsV0FBa0IsZUFBZTtRQUNoQyx5REFBTSxDQUFBO1FBQ04scURBQUksQ0FBQTtRQUNKLCtEQUFTLENBQUE7UUFDVCw2REFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUxpQixlQUFlLCtCQUFmLGVBQWUsUUFLaEM7SUF3QlksUUFBQSxvQkFBb0IsR0FBRyxJQUFBLCtCQUFlLEVBQXVCLHFCQUFxQixDQUFDLENBQUM7SUFhakcsTUFBYSxtQkFBbUI7UUFBaEM7WUFHa0IsZUFBVSxHQUF1QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBcUI3RSxDQUFDO1FBbkJBLDBCQUEwQixDQUFDLFVBQWtCO1lBQzVDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxDQUFDO1FBQ2xELENBQUM7UUFFRCw0QkFBNEIsQ0FBQyxVQUFrQixFQUFFLFFBQStCO1lBQy9FLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsVUFBVSx5QkFBeUIsQ0FBQyxDQUFDO1lBQ2hHLENBQUM7WUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDMUMsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsaUJBQWlCLENBQUMsVUFBa0IsRUFBRSxRQUF3QixFQUFFLE9BQWdDLEVBQUUsUUFBMEMsRUFBRSxLQUF3QjtZQUNySyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsVUFBVSxxQkFBcUIsQ0FBQyxDQUFDO1lBQzVGLENBQUM7WUFDRCxPQUFPLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RSxDQUFDO0tBQ0Q7SUF4QkQsa0RBd0JDIn0=
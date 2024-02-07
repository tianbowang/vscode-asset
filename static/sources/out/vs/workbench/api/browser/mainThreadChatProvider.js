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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/common/chatProvider", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, log_1, progress_1, extHost_protocol_1, chatProvider_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadChatProvider = void 0;
    let MainThreadChatProvider = class MainThreadChatProvider {
        constructor(extHostContext, _chatProviderService, _logService) {
            this._chatProviderService = _chatProviderService;
            this._logService = _logService;
            this._providerRegistrations = new lifecycle_1.DisposableMap();
            this._pendingProgress = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostChatProvider);
        }
        dispose() {
            this._providerRegistrations.dispose();
        }
        $registerProvider(handle, identifier, metadata) {
            const registration = this._chatProviderService.registerChatResponseProvider(identifier, {
                metadata,
                provideChatResponse: async (messages, options, progress, token) => {
                    const requestId = (Math.random() * 1e6) | 0;
                    this._pendingProgress.set(requestId, progress);
                    try {
                        await this._proxy.$provideChatResponse(handle, requestId, messages, options, token);
                    }
                    finally {
                        this._pendingProgress.delete(requestId);
                    }
                }
            });
            this._providerRegistrations.set(handle, registration);
        }
        async $handleProgressChunk(requestId, chunk) {
            this._pendingProgress.get(requestId)?.report(chunk);
        }
        $unregisterProvider(handle) {
            this._providerRegistrations.deleteAndDispose(handle);
        }
        async $prepareChatAccess(providerId) {
            return this._chatProviderService.lookupChatResponseProvider(providerId);
        }
        async $fetchResponse(extension, providerId, requestId, messages, options, token) {
            this._logService.debug('[CHAT] extension request STARTED', extension.value, requestId);
            const task = this._chatProviderService.fetchChatResponse(providerId, messages, options, new progress_1.Progress(value => {
                this._proxy.$handleResponseFragment(requestId, value);
            }), token);
            task.catch(err => {
                this._logService.error('[CHAT] extension request ERRORED', err, extension.value, requestId);
            }).finally(() => {
                this._logService.debug('[CHAT] extension request DONE', extension.value, requestId);
            });
            return task;
        }
    };
    exports.MainThreadChatProvider = MainThreadChatProvider;
    exports.MainThreadChatProvider = MainThreadChatProvider = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadChatProvider),
        __param(1, chatProvider_1.IChatProviderService),
        __param(2, log_1.ILogService)
    ], MainThreadChatProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENoYXRQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRDaGF0UHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBWXpGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXNCO1FBTWxDLFlBQ0MsY0FBK0IsRUFDVCxvQkFBMkQsRUFDcEUsV0FBeUM7WUFEZix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ25ELGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBTnRDLDJCQUFzQixHQUFHLElBQUkseUJBQWEsRUFBVSxDQUFDO1lBQ3JELHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUE0QyxDQUFDO1lBT3ZGLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUVELGlCQUFpQixDQUFDLE1BQWMsRUFBRSxVQUFrQixFQUFFLFFBQXVDO1lBQzVGLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZGLFFBQVE7Z0JBQ1IsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNqRSxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUM7d0JBQ0osTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDckYsQ0FBQzs0QkFBUyxDQUFDO3dCQUNWLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3pDLENBQUM7Z0JBQ0YsQ0FBQzthQUNELENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxLQUFLLENBQUMsb0JBQW9CLENBQUMsU0FBaUIsRUFBRSxLQUE0QjtZQUN6RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsbUJBQW1CLENBQUMsTUFBYztZQUNqQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxVQUFrQjtZQUMxQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUE4QixFQUFFLFVBQWtCLEVBQUUsU0FBaUIsRUFBRSxRQUF3QixFQUFFLE9BQVcsRUFBRSxLQUF3QjtZQUMxSixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXZGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLG1CQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzVHLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRVgsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDN0YsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDZixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3JGLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO0tBQ0QsQ0FBQTtJQTdEWSx3REFBc0I7cUNBQXRCLHNCQUFzQjtRQURsQyxJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMsc0JBQXNCLENBQUM7UUFTdEQsV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLGlCQUFXLENBQUE7T0FURCxzQkFBc0IsQ0E2RGxDIn0=
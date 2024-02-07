(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/platform/progress/common/progress", "vs/platform/extensions/common/extensions", "vs/base/common/async", "vs/base/common/event"], function (require, exports, cancellation_1, lifecycle_1, extHost_protocol_1, typeConvert, progress_1, extensions_1, async_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostChatProvider = void 0;
    class ChatResponseStream {
        constructor(option, stream) {
            this.stream = new async_1.AsyncIterableSource();
            this.stream = stream ?? new async_1.AsyncIterableSource();
            const that = this;
            this.apiObj = {
                option: option,
                response: that.stream.asyncIterable
            };
        }
    }
    class ChatRequest {
        constructor(promise, cts) {
            this._onDidStart = new event_1.Emitter();
            this._responseStreams = new Map();
            this._defaultStream = new async_1.AsyncIterableSource();
            this._isDone = false;
            const that = this;
            this.apiObject = {
                result: promise,
                response: that._defaultStream.asyncIterable,
                onDidStartResponseStream: that._onDidStart.event,
                cancel() { cts.cancel(); },
            };
            promise.finally(() => {
                this._isDone = true;
                if (this._responseStreams.size > 0) {
                    for (const [, value] of this._responseStreams) {
                        value.stream.resolve();
                    }
                }
                else {
                    this._defaultStream.resolve();
                }
            });
        }
        handleFragment(fragment) {
            if (this._isDone) {
                return;
            }
            let res = this._responseStreams.get(fragment.index);
            if (!res) {
                if (this._responseStreams.size === 0) {
                    // the first response claims the default response
                    res = new ChatResponseStream(fragment.index, this._defaultStream);
                }
                else {
                    res = new ChatResponseStream(fragment.index);
                }
                this._responseStreams.set(fragment.index, res);
                this._onDidStart.fire(res.apiObj);
            }
            res.stream.emitOne(fragment.part);
        }
    }
    class ExtHostChatProvider {
        static { this._idPool = 1; }
        constructor(mainContext, _logService) {
            this._logService = _logService;
            this._providers = new Map();
            //#region --- making request
            this._pendingRequest = new Map();
            this._chatAccessAllowList = new extensions_1.ExtensionIdentifierMap();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadChatProvider);
        }
        registerProvider(extension, identifier, provider, metadata) {
            const handle = ExtHostChatProvider._idPool++;
            this._providers.set(handle, { extension, provider });
            this._proxy.$registerProvider(handle, identifier, { extension, model: metadata.name ?? '' });
            return (0, lifecycle_1.toDisposable)(() => {
                this._proxy.$unregisterProvider(handle);
                this._providers.delete(handle);
            });
        }
        async $provideChatResponse(handle, requestId, messages, options, token) {
            const data = this._providers.get(handle);
            if (!data) {
                return;
            }
            const progress = new progress_1.Progress(async (fragment) => {
                if (token.isCancellationRequested) {
                    this._logService.warn(`[CHAT](${data.extension.value}) CANNOT send progress because the REQUEST IS CANCELLED`);
                    return;
                }
                this._proxy.$handleProgressChunk(requestId, { index: fragment.index, part: fragment.part });
            });
            return data.provider.provideChatResponse(messages.map(typeConvert.ChatMessage.to), options, progress, token);
        }
        allowListExtensionWhile(extension, promise) {
            this._chatAccessAllowList.set(extension, promise);
            promise.finally(() => this._chatAccessAllowList.delete(extension));
        }
        async requestChatResponseProvider(from, identifier) {
            // check if a UI command is running/active
            if (!this._chatAccessAllowList.has(from)) {
                throw new Error('Extension is NOT allowed to make chat requests');
            }
            const metadata = await this._proxy.$prepareChatAccess(identifier);
            if (!metadata) {
                throw new Error(`ChatAccess '${identifier}' NOT found`);
            }
            const that = this;
            return {
                get model() {
                    return metadata.model;
                },
                get isRevoked() {
                    return !that._chatAccessAllowList.has(from);
                },
                makeRequest(messages, options, token) {
                    if (!that._chatAccessAllowList.has(from)) {
                        throw new Error('Access to chat has been revoked');
                    }
                    const cts = new cancellation_1.CancellationTokenSource(token);
                    const requestId = (Math.random() * 1e6) | 0;
                    const requestPromise = that._proxy.$fetchResponse(from, identifier, requestId, messages.map(typeConvert.ChatMessage.from), options ?? {}, cts.token);
                    const res = new ChatRequest(requestPromise, cts);
                    that._pendingRequest.set(requestId, { res });
                    requestPromise.finally(() => {
                        that._pendingRequest.delete(requestId);
                    });
                    return res.apiObject;
                },
            };
        }
        async $handleResponseFragment(requestId, chunk) {
            const data = this._pendingRequest.get(requestId); //.report(chunk);
            if (data) {
                data.res.handleFragment(chunk);
            }
        }
    }
    exports.ExtHostChatProvider = ExtHostChatProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENoYXRQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdENoYXRQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQmhHLE1BQU0sa0JBQWtCO1FBS3ZCLFlBQVksTUFBYyxFQUFFLE1BQW9DO1lBRnZELFdBQU0sR0FBRyxJQUFJLDJCQUFtQixFQUFVLENBQUM7WUFHbkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksSUFBSSwyQkFBbUIsRUFBVSxDQUFDO1lBQzFELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHO2dCQUNiLE1BQU0sRUFBRSxNQUFNO2dCQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWE7YUFDbkMsQ0FBQztRQUNILENBQUM7S0FDRDtJQUVELE1BQU0sV0FBVztRQVNoQixZQUNDLE9BQXFCLEVBQ3JCLEdBQTRCO1lBUFosZ0JBQVcsR0FBRyxJQUFJLGVBQU8sRUFBNkIsQ0FBQztZQUN2RCxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztZQUN6RCxtQkFBYyxHQUFHLElBQUksMkJBQW1CLEVBQVUsQ0FBQztZQUM1RCxZQUFPLEdBQVksS0FBSyxDQUFDO1lBTWhDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHO2dCQUNoQixNQUFNLEVBQUUsT0FBTztnQkFDZixRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhO2dCQUMzQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUs7Z0JBQ2hELE1BQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzFCLENB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
//# sourceURL=../../../vs/workbench/api/common/extHostChatProvider.js
})
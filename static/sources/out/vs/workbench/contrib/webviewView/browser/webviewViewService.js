/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, cancellation_1, event_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewViewService = exports.IWebviewViewService = void 0;
    exports.IWebviewViewService = (0, instantiation_1.createDecorator)('webviewViewService');
    class WebviewViewService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._resolvers = new Map();
            this._awaitingRevival = new Map();
            this._onNewResolverRegistered = this._register(new event_1.Emitter());
            this.onNewResolverRegistered = this._onNewResolverRegistered.event;
        }
        register(viewType, resolver) {
            if (this._resolvers.has(viewType)) {
                throw new Error(`View resolver already registered for ${viewType}`);
            }
            this._resolvers.set(viewType, resolver);
            this._onNewResolverRegistered.fire({ viewType: viewType });
            const pending = this._awaitingRevival.get(viewType);
            if (pending) {
                resolver.resolve(pending.webview, cancellation_1.CancellationToken.None).then(() => {
                    this._awaitingRevival.delete(viewType);
                    pending.resolve();
                });
            }
            return (0, lifecycle_1.toDisposable)(() => {
                this._resolvers.delete(viewType);
            });
        }
        resolve(viewType, webview, cancellation) {
            const resolver = this._resolvers.get(viewType);
            if (!resolver) {
                if (this._awaitingRevival.has(viewType)) {
                    throw new Error('View already awaiting revival');
                }
                let resolve;
                const p = new Promise(r => resolve = r);
                this._awaitingRevival.set(viewType, { webview, resolve: resolve });
                return p;
            }
            return resolver.resolve(webview, cancellation);
        }
    }
    exports.WebviewViewService = WebviewViewService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1ZpZXdTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3Vmlldy9icm93c2VyL3dlYnZpZXdWaWV3U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtRW5GLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSwrQkFBZSxFQUFzQixvQkFBb0IsQ0FBQyxDQUFDO0lBdUI5RixNQUFhLGtCQUFtQixTQUFRLHNCQUFVO1FBQWxEOztZQUlrQixlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWdDLENBQUM7WUFFckQscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQTJFLENBQUM7WUFFdEcsNkJBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBaUMsQ0FBQyxDQUFDO1lBQ3pGLDRCQUF1QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUM7UUFzQy9FLENBQUM7UUFwQ0EsUUFBUSxDQUFDLFFBQWdCLEVBQUUsUUFBOEI7WUFDeEQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7WUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRTNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEQsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDYixRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDbkUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdkMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU8sQ0FBQyxRQUFnQixFQUFFLE9BQW9CLEVBQUUsWUFBK0I7WUFDOUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNmLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO29CQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7Z0JBQ2xELENBQUM7Z0JBRUQsSUFBSSxPQUFtQixDQUFDO2dCQUN4QixNQUFNLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3BFLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztZQUVELE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDaEQsQ0FBQztLQUNEO0lBL0NELGdEQStDQyJ9
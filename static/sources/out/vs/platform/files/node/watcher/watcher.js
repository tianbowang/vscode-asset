/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/files/node/watcher/parcel/parcelWatcher", "vs/platform/files/node/watcher/nodejs/nodejsWatcher", "vs/base/common/async"], function (require, exports, lifecycle_1, event_1, parcelWatcher_1, nodejsWatcher_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UniversalWatcher = void 0;
    class UniversalWatcher extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.recursiveWatcher = this._register(new parcelWatcher_1.ParcelWatcher());
            this.nonRecursiveWatcher = this._register(new nodejsWatcher_1.NodeJSWatcher());
            this.onDidChangeFile = event_1.Event.any(this.recursiveWatcher.onDidChangeFile, this.nonRecursiveWatcher.onDidChangeFile);
            this.onDidLogMessage = event_1.Event.any(this.recursiveWatcher.onDidLogMessage, this.nonRecursiveWatcher.onDidLogMessage);
            this.onDidError = event_1.Event.any(this.recursiveWatcher.onDidError, this.nonRecursiveWatcher.onDidError);
        }
        async watch(requests) {
            const recursiveWatchRequests = [];
            const nonRecursiveWatchRequests = [];
            for (const request of requests) {
                if (request.recursive) {
                    recursiveWatchRequests.push(request);
                }
                else {
                    nonRecursiveWatchRequests.push(request);
                }
            }
            await async_1.Promises.settled([
                this.recursiveWatcher.watch(recursiveWatchRequests),
                this.nonRecursiveWatcher.watch(nonRecursiveWatchRequests)
            ]);
        }
        async setVerboseLogging(enabled) {
            await async_1.Promises.settled([
                this.recursiveWatcher.setVerboseLogging(enabled),
                this.nonRecursiveWatcher.setVerboseLogging(enabled)
            ]);
        }
        async stop() {
            await async_1.Promises.settled([
                this.recursiveWatcher.stop(),
                this.nonRecursiveWatcher.stop()
            ]);
        }
    }
    exports.UniversalWatcher = UniversalWatcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZmlsZXMvbm9kZS93YXRjaGVyL3dhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEsZ0JBQWlCLFNBQVEsc0JBQVU7UUFBaEQ7O1lBRWtCLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBYSxFQUFFLENBQUMsQ0FBQztZQUN2RCx3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWEsRUFBRSxDQUFDLENBQUM7WUFFbEUsb0JBQWUsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdHLG9CQUFlLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3RyxlQUFVLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQWlDeEcsQ0FBQztRQS9CQSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQWtDO1lBQzdDLE1BQU0sc0JBQXNCLEdBQTZCLEVBQUUsQ0FBQztZQUM1RCxNQUFNLHlCQUF5QixHQUFnQyxFQUFFLENBQUM7WUFFbEUsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ3ZCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztxQkFBTSxDQUFDO29CQUNQLHlCQUF5QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekMsQ0FBQztZQUNGLENBQUM7WUFFRCxNQUFNLGdCQUFRLENBQUMsT0FBTyxDQUFDO2dCQUN0QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDO2dCQUNuRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDO2FBQ3pELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsT0FBZ0I7WUFDdkMsTUFBTSxnQkFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDdEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztnQkFDaEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQzthQUNuRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUk7WUFDVCxNQUFNLGdCQUFRLENBQUMsT0FBTyxDQUFDO2dCQUN0QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFO2dCQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFO2FBQy9CLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQXhDRCw0Q0F3Q0MifQ==
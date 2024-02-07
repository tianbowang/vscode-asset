/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/files/node/watcher/nodejs/nodejsWatcherLib"], function (require, exports, event_1, glob_1, lifecycle_1, platform_1, nodejsWatcherLib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeJSWatcher = void 0;
    class NodeJSWatcher extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._onDidLogMessage = this._register(new event_1.Emitter());
            this.onDidLogMessage = this._onDidLogMessage.event;
            this.onDidError = event_1.Event.None;
            this.watchers = new Map();
            this.verboseLogging = false;
        }
        async watch(requests) {
            // Figure out duplicates to remove from the requests
            const normalizedRequests = this.normalizeRequests(requests);
            // Gather paths that we should start watching
            const requestsToStartWatching = normalizedRequests.filter(request => {
                const watcher = this.watchers.get(request.path);
                if (!watcher) {
                    return true; // not yet watching that path
                }
                // Re-watch path if excludes or includes have changed
                return !(0, glob_1.patternsEquals)(watcher.request.excludes, request.excludes) || !(0, glob_1.patternsEquals)(watcher.request.includes, request.includes);
            });
            // Gather paths that we should stop watching
            const pathsToStopWatching = Array.from(this.watchers.values()).filter(({ request }) => {
                return !normalizedRequests.find(normalizedRequest => normalizedRequest.path === request.path && (0, glob_1.patternsEquals)(normalizedRequest.excludes, request.excludes) && (0, glob_1.patternsEquals)(normalizedRequest.includes, request.includes));
            }).map(({ request }) => request.path);
            // Logging
            if (requestsToStartWatching.length) {
                this.trace(`Request to start watching: ${requestsToStartWatching.map(request => `${request.path} (excludes: ${request.excludes.length > 0 ? request.excludes : '<none>'}, includes: ${request.includes && request.includes.length > 0 ? JSON.stringify(request.includes) : '<all>'}, correlationId: ${typeof request.correlationId === 'number' ? request.correlationId : '<none>'})`).join(',')}`);
            }
            if (pathsToStopWatching.length) {
                this.trace(`Request to stop watching: ${pathsToStopWatching.join(',')}`);
            }
            // Stop watching as instructed
            for (const pathToStopWatching of pathsToStopWatching) {
                this.stopWatching(pathToStopWatching);
            }
            // Start watching as instructed
            for (const request of requestsToStartWatching) {
                this.startWatching(request);
            }
        }
        startWatching(request) {
            // Start via node.js lib
            const instance = new nodejsWatcherLib_1.NodeJSFileWatcherLibrary(request, changes => this._onDidChangeFile.fire(changes), msg => this._onDidLogMessage.fire(msg), this.verboseLogging);
            // Remember as watcher instance
            const watcher = { request, instance };
            this.watchers.set(request.path, watcher);
        }
        async stop() {
            for (const [path] of this.watchers) {
                this.stopWatching(path);
            }
            this.watchers.clear();
        }
        stopWatching(path) {
            const watcher = this.watchers.get(path);
            if (watcher) {
                this.watchers.delete(path);
                watcher.instance.dispose();
            }
        }
        normalizeRequests(requests) {
            const mapCorrelationtoRequests = new Map();
            // Ignore requests for the same paths that have the same correlation
            for (const request of requests) {
                const path = platform_1.isLinux ? request.path : request.path.toLowerCase(); // adjust for case sensitivity
                let requestsForCorrelation = mapCorrelationtoRequests.get(request.correlationId);
                if (!requestsForCorrelation) {
                    requestsForCorrelation = new Map();
                    mapCorrelationtoRequests.set(request.correlationId, requestsForCorrelation);
                }
                requestsForCorrelation.set(path, request);
            }
            return Array.from(mapCorrelationtoRequests.values()).map(requests => Array.from(requests.values())).flat();
        }
        async setVerboseLogging(enabled) {
            this.verboseLogging = enabled;
            for (const [, watcher] of this.watchers) {
                watcher.instance.setVerboseLogging(enabled);
            }
        }
        trace(message) {
            if (this.verboseLogging) {
                this._onDidLogMessage.fire({ type: 'trace', message: this.toMessage(message) });
            }
        }
        toMessage(message, watcher) {
            return watcher ? `[File Watcher (node.js)] ${message} (path: ${watcher.request.path})` : `[File Watcher (node.js)] ${message}`;
        }
    }
    exports.NodeJSWatcher = NodeJSWatcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZWpzV2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZmlsZXMvbm9kZS93YXRjaGVyL25vZGVqcy9ub2RlanNXYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXVCaEcsTUFBYSxhQUFjLFNBQVEsc0JBQVU7UUFBN0M7O1lBRWtCLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWlCLENBQUMsQ0FBQztZQUN4RSxvQkFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7WUFFdEMscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDdEUsb0JBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1lBRTlDLGVBQVUsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBRWQsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO1lBRWhFLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1FBMkdoQyxDQUFDO1FBekdBLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBcUM7WUFFaEQsb0RBQW9EO1lBQ3BELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTVELDZDQUE2QztZQUM3QyxNQUFNLHVCQUF1QixHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDbkUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2QsT0FBTyxJQUFJLENBQUMsQ0FBQyw2QkFBNkI7Z0JB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
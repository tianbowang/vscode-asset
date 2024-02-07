/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "@parcel/watcher", "fs", "os", "vs/base/common/uri", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/extpath", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/ternarySearchTree", "vs/base/common/normalization", "vs/base/common/path", "vs/base/common/platform", "vs/base/node/extpath", "vs/platform/files/node/watcher/nodejs/nodejsWatcherLib", "vs/platform/files/common/watcher"], function (require, exports, parcelWatcher, fs_1, os_1, uri_1, async_1, cancellation_1, errorMessage_1, event_1, extpath_1, glob_1, lifecycle_1, ternarySearchTree_1, normalization_1, path_1, platform_1, extpath_2, nodejsWatcherLib_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ParcelWatcher = void 0;
    class ParcelWatcher extends lifecycle_1.Disposable {
        static { this.MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE = new Map([
            ['create', 1 /* FileChangeType.ADDED */],
            ['update', 0 /* FileChangeType.UPDATED */],
            ['delete', 2 /* FileChangeType.DELETED */]
        ]); }
        static { this.PARCEL_WATCHER_BACKEND = platform_1.isWindows ? 'windows' : platform_1.isLinux ? 'inotify' : 'fs-events'; }
        // A delay for collecting file changes from Parcel
        // before collecting them for coalescing and emitting.
        // Parcel internally uses 50ms as delay, so we use 75ms,
        // to schedule sufficiently after Parcel.
        //
        // Note: since Parcel 2.0.7, the very first event is
        // emitted without delay if no events occured over a
        // duration of 500ms. But we always want to aggregate
        // events to apply our coleasing logic.
        //
        static { this.FILE_CHANGES_HANDLER_DELAY = 75; }
        constructor() {
            super();
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._onDidLogMessage = this._register(new event_1.Emitter());
            this.onDidLogMessage = this._onDidLogMessage.event;
            this._onDidError = this._register(new event_1.Emitter());
            this.onDidError = this._onDidError.event;
            this.watchers = new Map();
            // Reduce likelyhood of spam from file events via throttling.
            // (https://github.com/microsoft/vscode/issues/124723)
            this.throttledFileChangesEmitter = this._register(new async_1.ThrottledWorker({
                maxWorkChunkSize: 500, // only process up to 500 changes at once before...
                throttleDelay: 200, // ...resting for 200ms until we process events again...
                maxBufferedWork: 30000 // ...but never buffering more than 30000 events in memory
            }, events => this._onDidChangeFile.fire(events)));
            this.verboseLogging = false;
            this.enospcErrorLogged = false;
            this.registerListeners();
        }
        registerListeners() {
            // Error handling on process
            process.on('uncaughtException', error => this.onUnexpectedError(error));
            process.on('unhandledRejection', error => this.onUnexpectedError(error));
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
                // Re-watch path if excludes/includes have changed or polling interval
                return !(0, glob_1.patternsEquals)(watcher.request.excludes, request.excludes) || !(0, glob_1.patternsEquals)(watcher.request.includes, request.includes) || watcher.request.pollingInterval !== request.pollingInterval;
            });
            // Gather paths that we should stop watching
            const pathsToStopWatching = Array.from(this.watchers.values()).filter(({ request }) => {
                return !normalizedRequests.find(normalizedRequest => {
                    return normalizedRequest.path === request.path &&
                        (0, glob_1.patternsEquals)(normalizedRequest.excludes, request.excludes) &&
                        (0, glob_1.patternsEquals)(normalizedRequest.includes, request.includes) &&
                        normalizedRequest.pollingInterval === request.pollingInterval;
                });
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
                await this.stopWatching(pathToStopWatching);
            }
            // Start watching as instructed
            for (const request of requestsToStartWatching) {
                if (request.pollingInterval) {
                    this.startPolling(request, request.pollingInterval);
                }
                else {
                    this.startWatching(request);
                }
            }
        }
        startPolling(request, pollingInterval, restarts = 0) {
            const cts = new cancellation_1.CancellationTokenSource();
            const instance = new async_1.DeferredPromise();
            const snapshotFile = (0, extpath_1.randomPath)((0, os_1.tmpdir)(), 'vscode-watcher-snapshot');
            // Remember as watcher instance
            const watcher = {
                request,
                ready: instance.p,
                restarts,
                token: cts.token,
                worker: new async_1.RunOnceWorker(events => this.handleParcelEvents(events, watcher), ParcelWatcher.FILE_CHANGES_HANDLER_DELAY),
                stop: async () => {
                    cts.dispose(true);
                    watcher.worker.flush();
                    watcher.worker.dispose();
                    pollingWatcher.dispose();
                    (0, fs_1.unlinkSync)(snapshotFile);
                }
            };
            this.watchers.set(request.path, watcher);
            // Path checks for symbolic links / wrong casing
            const { realPath, realPathDiffers, realPathLength } = this.normalizePath(request);
            // Warm up include patterns for usage
            const includePatterns = request.includes ? (0, watcher_1.parseWatcherPatterns)(request.path, request.includes) : undefined;
            this.trace(`Started watching: '${realPath}' with polling interval '${pollingInterval}'`);
            let counter = 0;
            const pollingWatcher = new async_1.RunOnceScheduler(async () => {
                counter++;
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // We already ran before, check for events since
                if (counter > 1) {
                    const parcelEvents = await parcelWatcher.getEventsSince(realPath, snapshotFile, { ignore: request.excludes, backend: ParcelWatcher.PARCEL_WATCHER_BACKEND });
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    // Handle & emit events
                    this.onParcelEvents(parcelEvents, watcher, includePatterns, realPathDiffers, realPathLength);
                }
                // Store a snapshot of files to the snapshot file
                await parcelWatcher.writeSnapshot(realPath, snapshotFile, { ignore: request.excludes, backend: ParcelWatcher.PARCEL_WATCHER_BACKEND });
                // Signal we are ready now when the first snapshot was written
                if (counter === 1) {
                    instance.complete();
                }
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Schedule again at the next interval
                pollingWatcher.schedule();
            }, pollingInterval);
            pollingWatcher.schedule(0);
        }
        startWatching(request, restarts = 0) {
            const cts = new cancellation_1.CancellationTokenSource();
            const instance = new async_1.DeferredPromise();
            // Remember as watcher instance
            const watcher = {
                request,
                ready: instance.p,
                restarts,
                token: cts.token,
                worker: new async_1.RunOnceWorker(events => this.handleParcelEvents(events, watcher), ParcelWatcher.FILE_CHANGES_HANDLER_DELAY),
                stop: async () => {
                    cts.dispose(true);
                    watcher.worker.flush();
                    watcher.worker.dispose();
                    const watcherInstance = await instance.p;
                    await watcherInstance?.unsubscribe();
                }
            };
            this.watchers.set(request.path, watcher);
            // Path checks for symbolic links / wrong casing
            const { realPath, realPathDiffers, realPathLength } = this.normalizePath(request);
            // Warm up include patterns for usage
            const includePatterns = request.includes ? (0, watcher_1.parseWatcherPatterns)(request.path, request.includes) : undefined;
            parcelWatcher.subscribe(realPath, (error, parcelEvents) => {
                if (watcher.token.isCancellationRequested) {
                    return; // return early when disposed
                }
                // In any case of an error, treat this like a unhandled exception
                // that might require the watcher to restart. We do not really know
                // the state of parcel at this point and as such will try to restart
                // up to our maximum of restarts.
                if (error) {
                    this.onUnexpectedError(error, watcher);
                }
                // Handle & emit events
                this.onParcelEvents(parcelEvents, watcher, includePatterns, realPathDiffers, realPathLength);
            }, {
                backend: ParcelWatcher.PARCEL_WATCHER_BACKEND,
                ignore: watcher.request.excludes
            }).then(parcelWatcher => {
                this.trace(`Started watching: '${realPath}' with backend '${ParcelWatcher.PARCEL_WATCHER_BACKEND}'`);
                instance.complete(parcelWatcher);
            }).catch(error => {
                this.onUnexpectedError(error, watcher);
                instance.complete(undefined);
            });
        }
        onParcelEvents(parcelEvents, watcher, includes, realPathDiffers, realPathLength) {
            if (parcelEvents.length === 0) {
                return;
            }
            // Normalize events: handle NFC normalization and symlinks
            // It is important to do this before checking for includes
            // to check on the original path.
            this.normalizeEvents(parcelEvents, watcher.request, realPathDiffers, realPathLength);
            // Check for includes
            const includedEvents = this.handleIncludes(watcher, parcelEvents, includes);
            // Add to event aggregator for later processing
            for (const includedEvent of includedEvents) {
                watcher.worker.work(includedEvent);
            }
        }
        handleIncludes(watcher, parcelEvents, includes) {
            const events = [];
            for (const { path, type: parcelEventType } of parcelEvents) {
                const type = ParcelWatcher.MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE.get(parcelEventType);
                if (this.verboseLogging) {
                    this.trace(`${type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${path}`);
                }
                // Apply include filter if any
                if (includes && includes.length > 0 && !includes.some(include => include(path))) {
                    if (this.verboseLogging) {
                        this.trace(` >> ignored (not included) ${path}`);
                    }
                }
                else {
                    events.push({ type, resource: uri_1.URI.file(path), cId: watcher.request.correlationId });
                }
            }
            return events;
        }
        handleParcelEvents(parcelEvents, watcher) {
            // Coalesce events: merge events of same kind
            const coalescedEvents = (0, watcher_1.coalesceEvents)(parcelEvents);
            // Filter events: check for specific events we want to exclude
            const { events: filteredEvents, rootDeleted } = this.filterEvents(coalescedEvents, watcher);
            // Broadcast to clients
            this.emitEvents(filteredEvents, watcher);
            // Handle root path deletes
            if (rootDeleted) {
                this.onWatchedPathDeleted(watcher);
            }
        }
        emitEvents(events, watcher) {
            if (events.length === 0) {
                return;
            }
            // Logging
            if (this.verboseLogging) {
                for (const event of events) {
                    const traceMsg = ` >> normalized ${event.type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : event.type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${event.resource.fsPath}`;
                    this.trace(typeof watcher.request.correlationId === 'number' ? `${traceMsg} (correlationId: ${watcher.request.correlationId})` : traceMsg);
                }
            }
            // Broadcast to clients via throttler
            const worked = this.throttledFileChangesEmitter.work(events);
            // Logging
            if (!worked) {
                this.warn(`started ignoring events due to too many file change events at once (incoming: ${events.length}, most recent change: ${events[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
            }
            else {
                if (this.throttledFileChangesEmitter.pending > 0) {
                    this.trace(`started throttling events due to large amount of file change events at once (pending: ${this.throttledFileChangesEmitter.pending}, most recent change: ${events[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
                }
            }
        }
        normalizePath(request) {
            let realPath = request.path;
            let realPathDiffers = false;
            let realPathLength = request.path.length;
            try {
                // First check for symbolic link
                realPath = (0, extpath_2.realpathSync)(request.path);
                // Second check for casing difference
                // Note: this will be a no-op on Linux platforms
                if (request.path === realPath) {
                    realPath = (0, extpath_2.realcaseSync)(request.path) ?? request.path;
                }
                // Correct watch path as needed
                if (request.path !== realPath) {
                    realPathLength = realPath.length;
                    realPathDiffers = true;
                    this.trace(`correcting a path to watch that seems to be a symbolic link or wrong casing (original: ${request.path}, real: ${realPath})`);
                }
            }
            catch (error) {
                // ignore
            }
            return { realPath, realPathDiffers, realPathLength };
        }
        normalizeEvents(events, request, realPathDiffers, realPathLength) {
            for (const event of events) {
                // Mac uses NFD unicode form on disk, but we want NFC
                if (platform_1.isMacintosh) {
                    event.path = (0, normalization_1.normalizeNFC)(event.path);
                }
                // Workaround for https://github.com/parcel-bundler/watcher/issues/68
                // where watching root drive letter adds extra backslashes.
                if (platform_1.isWindows) {
                    if (request.path.length <= 3) { // for ex. c:, C:\
                        event.path = (0, path_1.normalize)(event.path);
                    }
                }
                // Convert paths back to original form in case it differs
                if (realPathDiffers) {
                    event.path = request.path + event.path.substr(realPathLength);
                }
            }
        }
        filterEvents(events, watcher) {
            const filteredEvents = [];
            let rootDeleted = false;
            for (const event of events) {
                if (event.type === 2 /* FileChangeType.DELETED */ && event.resource.fsPath === watcher.request.path) {
                    // Explicitly exclude changes to root if we have any
                    // to avoid VS Code closing all opened editors which
                    // can happen e.g. in case of network connectivity
                    // issues
                    // (https://github.com/microsoft/vscode/issues/136673)
                    rootDeleted = true;
                }
                else {
                    filteredEvents.push(event);
                }
            }
            return { events: filteredEvents, rootDeleted };
        }
        onWatchedPathDeleted(watcher) {
            this.warn('Watcher shutdown because watched path got deleted', watcher);
            const parentPath = (0, path_1.dirname)(watcher.request.path);
            if ((0, fs_1.existsSync)(parentPath)) {
                const nodeWatcher = new nodejsWatcherLib_1.NodeJSFileWatcherLibrary({ path: parentPath, excludes: [], recursive: false, correlationId: watcher.request.correlationId }, changes => {
                    if (watcher.token.isCancellationRequested) {
                        return; // return early when disposed
                    }
                    // Watcher path came back! Restart watching...
                    for (const { resource, type } of changes) {
                        if (resource.fsPath === watcher.request.path && (type === 1 /* FileChangeType.ADDED */ || type === 0 /* FileChangeType.UPDATED */)) {
                            this.warn('Watcher restarts because watched path got created again', watcher);
                            // Stop watching that parent folder
                            nodeWatcher.dispose();
                            // Restart the file watching
                            this.restartWatching(watcher);
                            break;
                        }
                    }
                }, msg => this._onDidLogMessage.fire(msg), this.verboseLogging);
                // Make sure to stop watching when the watcher is disposed
                watcher.token.onCancellationRequested(() => nodeWatcher.dispose());
            }
        }
        onUnexpectedError(error, watcher) {
            const msg = (0, errorMessage_1.toErrorMessage)(error);
            // Specially handle ENOSPC errors that can happen when
            // the watcher consumes so many file descriptors that
            // we are running into a limit. We only want to warn
            // once in this case to avoid log spam.
            // See https://github.com/microsoft/vscode/issues/7950
            if (msg.indexOf('No space left on device') !== -1) {
                if (!this.enospcErrorLogged) {
                    this.error('Inotify limit reached (ENOSPC)', watcher);
                    this.enospcErrorLogged = true;
                }
            }
            // Any other error is unexpected and we should try to
            // restart the watcher as a result to get into healthy
            // state again if possible and if not attempted too much
            else {
                this.error(`Unexpected error: ${msg} (EUNKNOWN)`, watcher);
                this._onDidError.fire(msg);
            }
        }
        async stop() {
            for (const [path] of this.watchers) {
                await this.stopWatching(path);
            }
            this.watchers.clear();
        }
        restartWatching(watcher, delay = 800) {
            // Restart watcher delayed to accomodate for
            // changes on disk that have triggered the
            // need for a restart in the first place.
            const scheduler = new async_1.RunOnceScheduler(async () => {
                if (watcher.token.isCancellationRequested) {
                    return; // return early when disposed
                }
                // Await the watcher having stopped, as this is
                // needed to properly re-watch the same path
                await this.stopWatching(watcher.request.path);
                // Start watcher again counting the restarts
                if (watcher.request.pollingInterval) {
                    this.startPolling(watcher.request, watcher.request.pollingInterval, watcher.restarts + 1);
                }
                else {
                    this.startWatching(watcher.request, watcher.restarts + 1);
                }
            }, delay);
            scheduler.schedule();
            watcher.token.onCancellationRequested(() => scheduler.dispose());
        }
        async stopWatching(path) {
            const watcher = this.watchers.get(path);
            if (watcher) {
                this.trace(`stopping file watcher on ${watcher.request.path}`);
                this.watchers.delete(path);
                try {
                    await watcher.stop();
                }
                catch (error) {
                    this.error(`Unexpected error stopping watcher: ${(0, errorMessage_1.toErrorMessage)(error)}`, watcher);
                }
            }
        }
        normalizeRequests(requests, validatePaths = true) {
            // Sort requests by path length to have shortest first
            // to have a way to prevent children to be watched if
            // parents exist.
            requests.sort((requestA, requestB) => requestA.path.length - requestB.path.length);
            // Map request paths to correlation and ignore identical paths
            const mapCorrelationtoRequests = new Map();
            for (const request of requests) {
                if (request.excludes.includes(glob_1.GLOBSTAR)) {
                    continue; // path is ignored entirely (via `**` glob exclude)
                }
                const path = platform_1.isLinux ? request.path : request.path.toLowerCase(); // adjust for case sensitivity
                let requestsForCorrelation = mapCorrelationtoRequests.get(request.correlationId);
                if (!requestsForCorrelation) {
                    requestsForCorrelation = new Map();
                    mapCorrelationtoRequests.set(request.correlationId, requestsForCorrelation);
                }
                requestsForCorrelation.set(path, request);
            }
            const normalizedRequests = [];
            for (const requestsForCorrelation of mapCorrelationtoRequests.values()) {
                // Only consider requests for watching that are not
                // a child of an existing request path to prevent
                // duplication. In addition, drop any request where
                // everything is excluded (via `**` glob).
                //
                // However, allow explicit requests to watch folders
                // that are symbolic links because the Parcel watcher
                // does not allow to recursively watch symbolic links.
                const requestTrie = ternarySearchTree_1.TernarySearchTree.forPaths(!platform_1.isLinux);
                for (const request of requestsForCorrelation.values()) {
                    // Check for overlapping requests
                    if (requestTrie.findSubstr(request.path)) {
                        try {
                            const realpath = (0, extpath_2.realpathSync)(request.path);
                            if (realpath === request.path) {
                                this.trace(`ignoring a path for watching who's parent is already watched: ${request.path}`);
                                continue;
                            }
                        }
                        catch (error) {
                            this.trace(`ignoring a path for watching who's realpath failed to resolve: ${request.path} (error: ${error})`);
                            continue;
                        }
                    }
                    // Check for invalid paths
                    if (validatePaths) {
                        try {
                            const stat = (0, fs_1.statSync)(request.path);
                            if (!stat.isDirectory()) {
                                this.trace(`ignoring a path for watching that is a file and not a folder: ${request.path}`);
                                continue;
                            }
                        }
                        catch (error) {
                            this.trace(`ignoring a path for watching who's stat info failed to resolve: ${request.path} (error: ${error})`);
                            continue;
                        }
                    }
                    requestTrie.set(request.path, request);
                }
                normalizedRequests.push(...Array.from(requestTrie).map(([, request]) => request));
            }
            return normalizedRequests;
        }
        async setVerboseLogging(enabled) {
            this.verboseLogging = enabled;
        }
        trace(message) {
            if (this.verboseLogging) {
                this._onDidLogMessage.fire({ type: 'trace', message: this.toMessage(message) });
            }
        }
        warn(message, watcher) {
            this._onDidLogMessage.fire({ type: 'warn', message: this.toMessage(message, watcher) });
        }
        error(message, watcher) {
            this._onDidLogMessage.fire({ type: 'error', message: this.toMessage(message, watcher) });
        }
        toMessage(message, watcher) {
            return watcher ? `[File Watcher (parcel)] ${message} (path: ${watcher.request.path})` : `[File Watcher (parcel)] ${message}`;
        }
    }
    exports.ParcelWatcher = ParcelWatcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyY2VsV2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZmlsZXMvbm9kZS93YXRjaGVyL3BhcmNlbC9wYXJjZWxXYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlEaEcsTUFBYSxhQUFjLFNBQVEsc0JBQVU7aUJBRXBCLDZDQUF3QyxHQUFHLElBQUksR0FBRyxDQUN6RTtZQUNDLENBQUMsUUFBUSwrQkFBdUI7WUFDaEMsQ0FBQyxRQUFRLGlDQUF5QjtZQUNsQyxDQUFDLFFBQVEsaUNBQXlCO1NBQ2xDLENBQ0QsQUFOK0QsQ0FNOUQ7aUJBRXNCLDJCQUFzQixHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsa0JBQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLEFBQTVELENBQTZEO1FBYTNHLGtEQUFrRDtRQUNsRCxzREFBc0Q7UUFDdEQsd0RBQXdEO1FBQ3hELHlDQUF5QztRQUN6QyxFQUFFO1FBQ0Ysb0RBQW9EO1FBQ3BELG9EQUFvRDtRQUNwRCxxREFBcUQ7UUFDckQsdUNBQXVDO1FBQ3ZDLEVBQUU7aUJBQ3NCLCtCQUEwQixHQUFHLEVBQUUsQUFBTCxDQUFNO1FBZ0J4RDtZQUNDLEtBQUssRUFBRSxDQUFDO1lBdENRLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWlCLENBQUMsQ0FBQztZQUN4RSxvQkFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7WUFFdEMscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDdEUsb0JBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1lBRXRDLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVSxDQUFDLENBQUM7WUFDNUQsZUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1lBRTFCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztZQWN4RSw2REFBNkQ7WUFDN0Qsc0RBQXNEO1lBQ3JDLGdDQUEyQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx1QkFBZSxDQUNoRjtnQkFDQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsbURBQW1EO2dCQUMxRSxhQUFhLEVBQUUsR0FBRyxFQUFLLHdEQUF3RDtnQkFDL0UsZUFBZSxFQUFFLEtBQUssQ0FBRSwwREFBMEQ7YUFDbEYsRUFDRCxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQzVDLENBQUMsQ0FBQztZQUVLLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQUtqQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBRXhCLDRCQUE0QjtZQUM1QixPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDeEUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQWtDO1lBRTdDLG9EQUFvRDtZQUNwRCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU1RCw2Q0FBNkM7WUFDN0MsTUFBTSx1QkFBdUIsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25FLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNkLE9BQU8sSUFBSSxDQUFDLENBQUMsNkJBQTZCO2dCQUMzQyxDQUFDO2dCQUVELHNFQUFzRTtnQkFDdEUsT0FBTyxDQUFDLElBQUEscUJBQWMsRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFBLHFCQUFjLEVBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsZUFBZSxLQUFLLE9BQU8sQ0FBQyxlQUFlLENBQUM7WUFDbE0sQ0FBQyxDQUFDLENBQUM7WUFFSCw0Q0FBNEM7WUFDNUMsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUU7Z0JBQ3JGLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTtvQkFDbkQsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLElBQUk7d0JBQzdDLElBQUEscUJBQWMsRUFBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQzt3QkFDNUQsSUFBQSxxQkFBYyxFQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDO3dCQUM1RCxpQkFBaUIsQ0FBQyxlQUFlLEtBQUssT0FBTyxDQUFDLGVBQWUsQ0FBQztnQkFFaEUsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEMsVUFBVTtZQUVWLElBQUksdUJBQXVCLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsOEJBQThCLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksZUFBZSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsZUFBZSxPQUFPLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sb0JBQW9CLE9BQU8sT0FBTyxDQUFDLGFBQWEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNyWSxDQUFDO1lBRUQsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxRSxDQUFDO1lBRUQsOEJBQThCO1lBQzlCLEtBQUssTUFBTSxrQkFBa0IsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO2dCQUN0RCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBRUQsK0JBQStCO1lBQy9CLEtBQUssTUFBTSxPQUFPLElBQUksdUJBQXVCLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQzdCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDckQsQ0FBQztxQkFBTSxDQUFDO29CQUNQLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzdCLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVPLFlBQVksQ0FBQyxPQUErQixFQUFFLGVBQXVCLEVBQUUsUUFBUSxHQUFHLENBQUM7WUFDMUYsTUFBTSxHQUFHLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1lBRTFDLE1BQU0sUUFBUSxHQUFHLElBQUksdUJBQWUsRUFBUSxDQUFDO1lBRTdDLE1BQU0sWUFBWSxHQUFHLElBQUEsb0JBQVUsRUFBQyxJQUFBLFdBQU0sR0FBRSxFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFFckUsK0JBQStCO1lBQy9CLE1BQU0sT0FBTyxHQUEyQjtnQkFDdkMsT0FBTztnQkFDUCxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2pCLFFBQVE7Z0JBQ1IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO2dCQUNoQixNQUFNLEVBQUUsSUFBSSxxQkFBYSxDQUFjLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBRSxhQUFhLENBQUMsMEJBQTBCLENBQUM7Z0JBQ3BJLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDaEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFbEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDdkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFFekIsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN6QixJQUFBLGVBQVUsRUFBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUIsQ0FBQzthQUNELENBQUM7WUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLGdEQUFnRDtZQUNoRCxNQUFNLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWxGLHFDQUFxQztZQUNyQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFBLDhCQUFvQixFQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFFNUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsUUFBUSw0QkFBNEIsZUFBZSxHQUFHLENBQUMsQ0FBQztZQUV6RixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFFaEIsTUFBTSxjQUFjLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDdEQsT0FBTyxFQUFFLENBQUM7Z0JBRVYsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7b0JBQ3ZDLE9BQU87Z0JBQ1IsQ0FBQztnQkFFRCxnREFBZ0Q7Z0JBQ2hELElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNqQixNQUFNLFlBQVksR0FBRyxNQUFNLGFBQWEsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO29CQUU3SixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQzt3QkFDdkMsT0FBTztvQkFDUixDQUFDO29CQUVELHVCQUF1QjtvQkFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQzlGLENBQUM7Z0JBRUQsaURBQWlEO2dCQUNqRCxNQUFNLGFBQWEsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO2dCQUV2SSw4REFBOEQ7Z0JBQzlELElBQUksT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNuQixRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3JCLENBQUM7Z0JBRUQsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7b0JBQ3ZDLE9BQU87Z0JBQ1IsQ0FBQztnQkFFRCxzQ0FBc0M7Z0JBQ3RDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMzQixDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDcEIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRU8sYUFBYSxDQUFDLE9BQStCLEVBQUUsUUFBUSxHQUFHLENBQUM7WUFDbEUsTUFBTSxHQUFHLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1lBRTFDLE1BQU0sUUFBUSxHQUFHLElBQUksdUJBQWUsRUFBK0MsQ0FBQztZQUVwRiwrQkFBK0I7WUFDL0IsTUFBTSxPQUFPLEdBQTJCO2dCQUN2QyxPQUFPO2dCQUNQLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDakIsUUFBUTtnQkFDUixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7Z0JBQ2hCLE1BQU0sRUFBRSxJQUFJLHFCQUFhLENBQWMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQztnQkFDcEksSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUNoQixHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVsQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUN2QixPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUV6QixNQUFNLGVBQWUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLE1BQU0sZUFBZSxFQUFFLFdBQVcsRUFBRSxDQUFDO2dCQUN0QyxDQUFDO2FBQ0QsQ0FBQztZQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFekMsZ0RBQWdEO1lBQ2hELE1BQU0sRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbEYscUNBQXFDO1lBQ3JDLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUEsOEJBQW9CLEVBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUU1RyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFBRTtnQkFDekQsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7b0JBQzNDLE9BQU8sQ0FBQyw2QkFBNkI7Z0JBQ3RDLENBQUM7Z0JBRUQsaUVBQWlFO2dCQUNqRSxtRUFBbUU7Z0JBQ25FLG9FQUFvRTtnQkFDcEUsaUNBQWlDO2dCQUNqQyxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNYLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3hDLENBQUM7Z0JBRUQsdUJBQXVCO2dCQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUM5RixDQUFDLEVBQUU7Z0JBQ0YsT0FBTyxFQUFFLGFBQWEsQ0FBQyxzQkFBc0I7Z0JBQzdDLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVE7YUFDaEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsUUFBUSxtQkFBbUIsYUFBYSxDQUFDLHNCQUFzQixHQUFHLENBQUMsQ0FBQztnQkFFckcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRXZDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sY0FBYyxDQUFDLFlBQW1DLEVBQUUsT0FBK0IsRUFBRSxRQUFxQyxFQUFFLGVBQXdCLEVBQUUsY0FBc0I7WUFDbkwsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUMvQixPQUFPO1lBQ1IsQ0FBQztZQUVELDBEQUEwRDtZQUMxRCwwREFBMEQ7WUFDMUQsaUNBQWlDO1lBQ2pDLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRXJGLHFCQUFxQjtZQUNyQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFNUUsK0NBQStDO1lBQy9DLEtBQUssTUFBTSxhQUFhLElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQzVDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7UUFDRixDQUFDO1FBRU8sY0FBYyxDQUFDLE9BQStCLEVBQUUsWUFBbUMsRUFBRSxRQUFxQztZQUNqSSxNQUFNLE1BQU0sR0FBa0IsRUFBRSxDQUFDO1lBRWpDLEtBQUssTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksWUFBWSxFQUFFLENBQUM7Z0JBQzVELE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyx3Q0FBd0MsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFFLENBQUM7Z0JBQzFGLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxpQ0FBeUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNsSSxDQUFDO2dCQUVELDhCQUE4QjtnQkFDOUIsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDakYsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsOEJBQThCLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ2xELENBQUM7Z0JBQ0YsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFDckYsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxZQUEyQixFQUFFLE9BQStCO1lBRXRGLDZDQUE2QztZQUM3QyxNQUFNLGVBQWUsR0FBRyxJQUFBLHdCQUFjLEVBQUMsWUFBWSxDQUFDLENBQUM7WUFFckQsOERBQThEO1lBQzlELE1BQU0sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRTVGLHVCQUF1QjtZQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV6QywyQkFBMkI7WUFDM0IsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLENBQUM7UUFDRixDQUFDO1FBRU8sVUFBVSxDQUFDLE1BQXFCLEVBQUUsT0FBK0I7WUFDeEUsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN6QixPQUFPO1lBQ1IsQ0FBQztZQUVELFVBQVU7WUFDVixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDekIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztvQkFDNUIsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLEtBQUssQ0FBQyxJQUFJLGlDQUF5QixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNsTCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsb0JBQW9CLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1SSxDQUFDO1lBQ0YsQ0FBQztZQUVELHFDQUFxQztZQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTdELFVBQVU7WUFDVixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxpRkFBaUYsTUFBTSxDQUFDLE1BQU0seUJBQXlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxpSEFBaUgsQ0FBQyxDQUFDO1lBQzlRLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMseUZBQXlGLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLHlCQUF5QixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0saUhBQWlILENBQUMsQ0FBQztnQkFDbFQsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRU8sYUFBYSxDQUFDLE9BQStCO1lBQ3BELElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDNUIsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzVCLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRXpDLElBQUksQ0FBQztnQkFFSixnQ0FBZ0M7Z0JBQ2hDLFFBQVEsR0FBRyxJQUFBLHNCQUFZLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV0QyxxQ0FBcUM7Z0JBQ3JDLGdEQUFnRDtnQkFDaEQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUMvQixRQUFRLEdBQUcsSUFBQSxzQkFBWSxFQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUN2RCxDQUFDO2dCQUVELCtCQUErQjtnQkFDL0IsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUMvQixjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDakMsZUFBZSxHQUFHLElBQUksQ0FBQztvQkFFdkIsSUFBSSxDQUFDLEtBQUssQ0FBQywwRkFBMEYsT0FBTyxDQUFDLElBQUksV0FBVyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUMxSSxDQUFDO1lBQ0YsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2hCLFNBQVM7WUFDVixDQUFDO1lBRUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLENBQUM7UUFDdEQsQ0FBQztRQUVPLGVBQWUsQ0FBQyxNQUE2QixFQUFFLE9BQStCLEVBQUUsZUFBd0IsRUFBRSxjQUFzQjtZQUN2SSxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUU1QixxREFBcUQ7Z0JBQ3JELElBQUksc0JBQVcsRUFBRSxDQUFDO29CQUNqQixLQUFLLENBQUMsSUFBSSxHQUFHLElBQUEsNEJBQVksRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBRUQscUVBQXFFO2dCQUNyRSwyREFBMkQ7Z0JBQzNELElBQUksb0JBQVMsRUFBRSxDQUFDO29CQUNmLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxrQkFBa0I7d0JBQ2pELEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBQSxnQkFBUyxFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEMsQ0FBQztnQkFDRixDQUFDO2dCQUVELHlEQUF5RDtnQkFDekQsSUFBSSxlQUFlLEVBQUUsQ0FBQztvQkFDckIsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMvRCxDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFTyxZQUFZLENBQUMsTUFBcUIsRUFBRSxPQUErQjtZQUMxRSxNQUFNLGNBQWMsR0FBa0IsRUFBRSxDQUFDO1lBQ3pDLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztZQUV4QixLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUM1QixJQUFJLEtBQUssQ0FBQyxJQUFJLG1DQUEyQixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRTdGLG9EQUFvRDtvQkFDcEQsb0RBQW9EO29CQUNwRCxrREFBa0Q7b0JBQ2xELFNBQVM7b0JBQ1Qsc0RBQXNEO29CQUV0RCxXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUIsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRU8sb0JBQW9CLENBQUMsT0FBK0I7WUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxtREFBbUQsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV4RSxNQUFNLFVBQVUsR0FBRyxJQUFBLGNBQU8sRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pELElBQUksSUFBQSxlQUFVLEVBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQ0FBd0IsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFO29CQUM5SixJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQzt3QkFDM0MsT0FBTyxDQUFDLDZCQUE2QjtvQkFDdEMsQ0FBQztvQkFFRCw4Q0FBOEM7b0JBQzlDLEtBQUssTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxPQUFPLEVBQUUsQ0FBQzt3QkFDMUMsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxpQ0FBeUIsSUFBSSxJQUFJLG1DQUEyQixDQUFDLEVBQUUsQ0FBQzs0QkFDcEgsSUFBSSxDQUFDLElBQUksQ0FBQyx5REFBeUQsRUFBRSxPQUFPLENBQUMsQ0FBQzs0QkFFOUUsbUNBQW1DOzRCQUNuQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBRXRCLDRCQUE0Qjs0QkFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFFOUIsTUFBTTt3QkFDUCxDQUFDO29CQUNGLENBQUM7Z0JBQ0YsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRWhFLDBEQUEwRDtnQkFDMUQsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNwRSxDQUFDO1FBQ0YsQ0FBQztRQUVPLGlCQUFpQixDQUFDLEtBQWMsRUFBRSxPQUFnQztZQUN6RSxNQUFNLEdBQUcsR0FBRyxJQUFBLDZCQUFjLEVBQUMsS0FBSyxDQUFDLENBQUM7WUFFbEMsc0RBQXNEO1lBQ3RELHFEQUFxRDtZQUNyRCxvREFBb0Q7WUFDcEQsdUNBQXVDO1lBQ3ZDLHNEQUFzRDtZQUN0RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7b0JBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBRXRELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7Z0JBQy9CLENBQUM7WUFDRixDQUFDO1lBRUQscURBQXFEO1lBQ3JELHNEQUFzRDtZQUN0RCx3REFBd0Q7aUJBQ25ELENBQUM7Z0JBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRTNELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLENBQUM7UUFDRixDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUk7WUFDVCxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3BDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRVMsZUFBZSxDQUFDLE9BQStCLEVBQUUsS0FBSyxHQUFHLEdBQUc7WUFFckUsNENBQTRDO1lBQzVDLDBDQUEwQztZQUMxQyx5Q0FBeUM7WUFDekMsTUFBTSxTQUFTLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDakQsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7b0JBQzNDLE9BQU8sQ0FBQyw2QkFBNkI7Z0JBQ3RDLENBQUM7Z0JBRUQsK0NBQStDO2dCQUMvQyw0Q0FBNEM7Z0JBQzVDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU5Qyw0Q0FBNEM7Z0JBQzVDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzNGLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDM0QsQ0FBQztZQUNGLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVWLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQVk7WUFDdEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDYixJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBRS9ELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUUzQixJQUFJLENBQUM7b0JBQ0osTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3RCLENBQUM7Z0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsSUFBQSw2QkFBYyxFQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3BGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVTLGlCQUFpQixDQUFDLFFBQWtDLEVBQUUsYUFBYSxHQUFHLElBQUk7WUFFbkYsc0RBQXNEO1lBQ3RELHFEQUFxRDtZQUNyRCxpQkFBaUI7WUFDakIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFbkYsOERBQThEO1lBQzlELE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxHQUFHLEVBQTZFLENBQUM7WUFDdEgsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxlQUFRLENBQUMsRUFBRSxDQUFDO29CQUN6QyxTQUFTLENBQUMsbURBQW1EO2dCQUM5RCxDQUFDO2dCQUVELE1BQU0sSUFBSSxHQUFHLGtCQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyw4QkFBOEI7Z0JBRWhHLElBQUksc0JBQXNCLEdBQUcsd0JBQXdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDakYsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7b0JBQzdCLHNCQUFzQixHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO29CQUNuRSx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO2dCQUM3RSxDQUFDO2dCQUVELHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0MsQ0FBQztZQUVELE1BQU0sa0JBQWtCLEdBQTZCLEVBQUUsQ0FBQztZQUV4RCxLQUFLLE1BQU0sc0JBQXNCLElBQUksd0JBQXdCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFFeEUsbURBQW1EO2dCQUNuRCxpREFBaUQ7Z0JBQ2pELG1EQUFtRDtnQkFDbkQsMENBQTBDO2dCQUMxQyxFQUFFO2dCQUNGLG9EQUFvRDtnQkFDcEQscURBQXFEO2dCQUNyRCxzREFBc0Q7Z0JBRXRELE1BQU0sV0FBVyxHQUFHLHFDQUFpQixDQUFDLFFBQVEsQ0FBeUIsQ0FBQyxrQkFBTyxDQUFDLENBQUM7Z0JBRWpGLEtBQUssTUFBTSxPQUFPLElBQUksc0JBQXNCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztvQkFFdkQsaUNBQWlDO29CQUNqQyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQzs0QkFDSixNQUFNLFFBQVEsR0FBRyxJQUFBLHNCQUFZLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUM1QyxJQUFJLFFBQVEsS0FBSyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Z0NBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsaUVBQWlFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dDQUU1RixTQUFTOzRCQUNWLENBQUM7d0JBQ0YsQ0FBQzt3QkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDOzRCQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLGtFQUFrRSxPQUFPLENBQUMsSUFBSSxZQUFZLEtBQUssR0FBRyxDQUFDLENBQUM7NEJBRS9HLFNBQVM7d0JBQ1YsQ0FBQztvQkFDRixDQUFDO29CQUVELDBCQUEwQjtvQkFDMUIsSUFBSSxhQUFhLEVBQUUsQ0FBQzt3QkFDbkIsSUFBSSxDQUFDOzRCQUNKLE1BQU0sSUFBSSxHQUFHLElBQUEsYUFBUSxFQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO2dDQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLGlFQUFpRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQ0FFNUYsU0FBUzs0QkFDVixDQUFDO3dCQUNGLENBQUM7d0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQzs0QkFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxtRUFBbUUsT0FBTyxDQUFDLElBQUksWUFBWSxLQUFLLEdBQUcsQ0FBQyxDQUFDOzRCQUVoSCxTQUFTO3dCQUNWLENBQUM7b0JBQ0YsQ0FBQztvQkFFRCxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3hDLENBQUM7Z0JBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDbkYsQ0FBQztZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxPQUFnQjtZQUN2QyxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztRQUMvQixDQUFDO1FBRU8sS0FBSyxDQUFDLE9BQWU7WUFDNUIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqRixDQUFDO1FBQ0YsQ0FBQztRQUVPLElBQUksQ0FBQyxPQUFlLEVBQUUsT0FBZ0M7WUFDN0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBRU8sS0FBSyxDQUFDLE9BQWUsRUFBRSxPQUEyQztZQUN6RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFTyxTQUFTLENBQUMsT0FBZSxFQUFFLE9BQWdDO1lBQ2xFLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsT0FBTyxXQUFXLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixPQUFPLEVBQUUsQ0FBQztRQUM5SCxDQUFDOztJQXRtQkYsc0NBdW1CQyJ9
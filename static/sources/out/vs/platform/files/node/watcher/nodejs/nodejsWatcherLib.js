/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/extpath", "vs/base/common/lifecycle", "vs/base/common/normalization", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/node/extpath", "vs/base/node/pfs", "vs/platform/files/common/watcher"], function (require, exports, fs_1, async_1, cancellation_1, extpath_1, lifecycle_1, normalization_1, path_1, platform_1, resources_1, uri_1, extpath_2, pfs_1, watcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.watchFileContents = exports.NodeJSFileWatcherLibrary = void 0;
    class NodeJSFileWatcherLibrary extends lifecycle_1.Disposable {
        // A delay in reacting to file deletes to support
        // atomic save operations where a tool may chose
        // to delete a file before creating it again for
        // an update.
        static { this.FILE_DELETE_HANDLER_DELAY = 100; }
        // A delay for collecting file changes from node.js
        // before collecting them for coalescing and emitting
        // Same delay as used for the recursive watcher.
        static { this.FILE_CHANGES_HANDLER_DELAY = 75; }
        constructor(request, onDidFilesChange, onLogMessage, verboseLogging) {
            super();
            this.request = request;
            this.onDidFilesChange = onDidFilesChange;
            this.onLogMessage = onLogMessage;
            this.verboseLogging = verboseLogging;
            // Reduce likelyhood of spam from file events via throttling.
            // These numbers are a bit more aggressive compared to the
            // recursive watcher because we can have many individual
            // node.js watchers per request.
            // (https://github.com/microsoft/vscode/issues/124723)
            this.throttledFileChangesEmitter = this._register(new async_1.ThrottledWorker({
                maxWorkChunkSize: 100, // only process up to 100 changes at once before...
                throttleDelay: 200, // ...resting for 200ms until we process events again...
                maxBufferedWork: 10000 // ...but never buffering more than 10000 events in memory
            }, events => this.onDidFilesChange(events)));
            // Aggregate file changes over FILE_CHANGES_HANDLER_DELAY
            // to coalesce events and reduce spam.
            this.fileChangesAggregator = this._register(new async_1.RunOnceWorker(events => this.handleFileChanges(events), NodeJSFileWatcherLibrary.FILE_CHANGES_HANDLER_DELAY));
            this.excludes = (0, watcher_1.parseWatcherPatterns)(this.request.path, this.request.excludes);
            this.includes = this.request.includes ? (0, watcher_1.parseWatcherPatterns)(this.request.path, this.request.includes) : undefined;
            this.cts = new cancellation_1.CancellationTokenSource();
            this.ready = this.watch();
        }
        async watch() {
            try {
                const realPath = await this.normalizePath(this.request);
                if (this.cts.token.isCancellationRequested) {
                    return;
                }
                // Watch via node.js
                const stat = await pfs_1.Promises.stat(realPath);
                this._register(await this.doWatch(realPath, stat.isDirectory()));
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    this.error(error);
                }
                else {
                    this.trace(error);
                }
            }
        }
        async normalizePath(request) {
            let realPath = request.path;
            try {
                // First check for symbolic link
                realPath = await pfs_1.Promises.realpath(request.path);
                // Second check for casing difference
                // Note: this will be a no-op on Linux platforms
                if (request.path === realPath) {
                    realPath = await (0, extpath_2.realcase)(request.path) ?? request.path;
                }
                // Correct watch path as needed
                if (request.path !== realPath) {
                    this.trace(`correcting a path to watch that seems to be a symbolic link or wrong casing (original: ${request.path}, real: ${realPath})`);
                }
            }
            catch (error) {
                // ignore
            }
            return realPath;
        }
        async doWatch(path, isDirectory) {
            // macOS: watching samba shares can crash VSCode so we do
            // a simple check for the file path pointing to /Volumes
            // (https://github.com/microsoft/vscode/issues/106879)
            // TODO@electron this needs a revisit when the crash is
            // fixed or mitigated upstream.
            if (platform_1.isMacintosh && (0, extpath_1.isEqualOrParent)(path, '/Volumes/', true)) {
                this.error(`Refusing to watch ${path} for changes using fs.watch() for possibly being a network share where watching is unreliable and unstable.`);
                return lifecycle_1.Disposable.None;
            }
            const cts = new cancellation_1.CancellationTokenSource(this.cts.token);
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const requestResource = uri_1.URI.file(this.request.path);
                const pathBasename = (0, path_1.basename)(path);
                // Creating watcher can fail with an exception
                const watcher = (0, fs_1.watch)(path);
                disposables.add((0, lifecycle_1.toDisposable)(() => {
                    watcher.removeAllListeners();
                    watcher.close();
                }));
                this.trace(`Started watching: '${path}'`);
                // Folder: resolve children to emit proper events
                const folderChildren = new Set();
                if (isDirectory) {
                    try {
                        for (const child of await pfs_1.Promises.readdir(path)) {
                            folderChildren.add(child);
                        }
                    }
                    catch (error) {
                        this.error(error);
                    }
                }
                const mapPathToStatDisposable = new Map();
                disposables.add((0, lifecycle_1.toDisposable)(() => {
                    for (const [, disposable] of mapPathToStatDisposable) {
                        disposable.dispose();
                    }
                    mapPathToStatDisposable.clear();
                }));
                watcher.on('error', (code, signal) => {
                    this.error(`Failed to watch ${path} for changes using fs.watch() (${code}, ${signal})`);
                    // The watcher is no longer functional reliably
                    // so we go ahead and dispose it
                    this.dispose();
                });
                watcher.on('change', (type, raw) => {
                    if (cts.token.isCancellationRequested) {
                        return; // ignore if already disposed
                    }
                    this.trace(`[raw] ["${type}"] ${raw}`);
                    // Normalize file name
                    let changedFileName = '';
                    if (raw) { // https://github.com/microsoft/vscode/issues/38191
                        changedFileName = raw.toString();
                        if (platform_1.isMacintosh) {
                            // Mac: uses NFD unicode form on disk, but we want NFC
                            // See also https://github.com/nodejs/node/issues/2165
                            changedFileName = (0, normalization_1.normalizeNFC)(changedFileName);
                        }
                    }
                    if (!changedFileName || (type !== 'change' && type !== 'rename')) {
                        return; // ignore unexpected events
                    }
                    // Folder
                    if (isDirectory) {
                        // Folder child added/deleted
                        if (type === 'rename') {
                            // Cancel any previous stats for this file if existing
                            mapPathToStatDisposable.get(changedFileName)?.dispose();
                            // Wait a bit and try see if the file still exists on disk
                            // to decide on the resulting event
                            const timeoutHandle = setTimeout(async () => {
                                mapPathToStatDisposable.delete(changedFileName);
                                // Depending on the OS the watcher runs on, there
                                // is different behaviour for when the watched
                                // folder path is being deleted:
                                //
                                // -   macOS: not reported but events continue to
                                //            work even when the folder is brought
                                //            back, though it seems every change
                                //            to a file is reported as "rename"
                                // -   Linux: "rename" event is reported with the
                                //            name of the folder and events stop
                                //            working
                                // - Windows: an EPERM error is thrown that we
                                //            handle from the `on('error')` event
                                //
                                // We do not re-attach the watcher after timeout
                                // though as we do for file watches because for
                                // file watching specifically we want to handle
                                // the atomic-write cases where the file is being
                                // deleted and recreated with different contents.
                                //
                                // Same as with recursive watching, we do not
                                // emit a delete event in this case.
                                if (changedFileName === pathBasename && !await pfs_1.Promises.exists(path)) {
                                    this.warn('Watcher shutdown because watched path got deleted');
                                    // The watcher is no longer functional reliably
                                    // so we go ahead and dispose it
                                    this.dispose();
                                    return;
                                }
                                // In order to properly detect renames on a case-insensitive
                                // file system, we need to use `existsChildStrictCase` helper
                                // because otherwise we would wrongly assume a file exists
                                // when it was renamed to same name but different case.
                                const fileExists = await this.existsChildStrictCase((0, path_1.join)(path, changedFileName));
                                if (cts.token.isCancellationRequested) {
                                    return; // ignore if disposed by now
                                }
                                // Figure out the correct event type:
                                // File Exists: either 'added' or 'updated' if known before
                                // File Does not Exist: always 'deleted'
                                let type;
                                if (fileExists) {
                                    if (folderChildren.has(changedFileName)) {
                                        type = 0 /* FileChangeType.UPDATED */;
                                    }
                                    else {
                                        type = 1 /* FileChangeType.ADDED */;
                                        folderChildren.add(changedFileName);
                                    }
                                }
                                else {
                                    folderChildren.delete(changedFileName);
                                    type = 2 /* FileChangeType.DELETED */;
                                }
                                this.onFileChange({ resource: (0, resources_1.joinPath)(requestResource, changedFileName), type, cId: this.request.correlationId });
                            }, NodeJSFileWatcherLibrary.FILE_DELETE_HANDLER_DELAY);
                            mapPathToStatDisposable.set(changedFileName, (0, lifecycle_1.toDisposable)(() => clearTimeout(timeoutHandle)));
                        }
                        // Folder child changed
                        else {
                            // Figure out the correct event type: if this is the
                            // first time we see this child, it can only be added
                            let type;
                            if (folderChildren.has(changedFileName)) {
                                type = 0 /* FileChangeType.UPDATED */;
                            }
                            else {
                                type = 1 /* FileChangeType.ADDED */;
                                folderChildren.add(changedFileName);
                            }
                            this.onFileChange({ resource: (0, resources_1.joinPath)(requestResource, changedFileName), type, cId: this.request.correlationId });
                        }
                    }
                    // File
                    else {
                        // File added/deleted
                        if (type === 'rename' || changedFileName !== pathBasename) {
                            // Depending on the OS the watcher runs on, there
                            // is different behaviour for when the watched
                            // file path is being deleted:
                            //
                            // -   macOS: "rename" event is reported and events
                            //            stop working
                            // -   Linux: "rename" event is reported and events
                            //            stop working
                            // - Windows: "rename" event is reported and events
                            //            continue to work when file is restored
                            //
                            // As opposed to folder watching, we re-attach the
                            // watcher after brief timeout to support "atomic save"
                            // operations where a tool may decide to delete a file
                            // and then create it with the updated contents.
                            //
                            // Different to folder watching, we emit a delete event
                            // though we never detect when the file is brought back
                            // because the watcher is disposed then.
                            const timeoutHandle = setTimeout(async () => {
                                const fileExists = await pfs_1.Promises.exists(path);
                                if (cts.token.isCancellationRequested) {
                                    return; // ignore if disposed by now
                                }
                                // File still exists, so emit as change event and reapply the watcher
                                if (fileExists) {
                                    this.onFileChange({ resource: requestResource, type: 0 /* FileChangeType.UPDATED */, cId: this.request.correlationId }, true /* skip excludes/includes (file is explicitly watched) */);
                                    disposables.add(await this.doWatch(path, false));
                                }
                                // File seems to be really gone, so emit a deleted event and dispose
                                else {
                                    this.onFileChange({ resource: requestResource, type: 2 /* FileChangeType.DELETED */, cId: this.request.correlationId }, true /* skip excludes/includes (file is explicitly watched) */);
                                    // Important to flush the event delivery
                                    // before disposing the watcher, otherwise
                                    // we will loose this event.
                                    this.fileChangesAggregator.flush();
                                    this.dispose();
                                }
                            }, NodeJSFileWatcherLibrary.FILE_DELETE_HANDLER_DELAY);
                            // Very important to dispose the watcher which now points to a stale inode
                            // and wire in a new disposable that tracks our timeout that is installed
                            disposables.clear();
                            disposables.add((0, lifecycle_1.toDisposable)(() => clearTimeout(timeoutHandle)));
                        }
                        // File changed
                        else {
                            this.onFileChange({ resource: requestResource, type: 0 /* FileChangeType.UPDATED */, cId: this.request.correlationId }, true /* skip excludes/includes (file is explicitly watched) */);
                        }
                    }
                });
            }
            catch (error) {
                if (await pfs_1.Promises.exists(path) && !cts.token.isCancellationRequested) {
                    this.error(`Failed to watch ${path} for changes using fs.watch() (${error.toString()})`);
                }
            }
            return (0, lifecycle_1.toDisposable)(() => {
                cts.dispose(true);
                disposables.dispose();
            });
        }
        onFileChange(event, skipIncludeExcludeChecks = false) {
            if (this.cts.token.isCancellationRequested) {
                return;
            }
            // Logging
            if (this.verboseLogging) {
                this.trace(`${event.type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : event.type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${event.resource.fsPath}`);
            }
            // Add to aggregator unless excluded or not included (not if explicitly disabled)
            if (!skipIncludeExcludeChecks && this.excludes.some(exclude => exclude(event.resource.fsPath))) {
                if (this.verboseLogging) {
                    this.trace(` >> ignored (excluded) ${event.resource.fsPath}`);
                }
            }
            else if (!skipIncludeExcludeChecks && this.includes && this.includes.length > 0 && !this.includes.some(include => include(event.resource.fsPath))) {
                if (this.verboseLogging) {
                    this.trace(` >> ignored (not included) ${event.resource.fsPath}`);
                }
            }
            else {
                this.fileChangesAggregator.work(event);
            }
        }
        handleFileChanges(fileChanges) {
            // Coalesce events: merge events of same kind
            const coalescedFileChanges = (0, watcher_1.coalesceEvents)(fileChanges);
            if (coalescedFileChanges.length > 0) {
                // Logging
                if (this.verboseLogging) {
                    for (const event of coalescedFileChanges) {
                        this.trace(` >> normalized ${event.type === 1 /* FileChangeType.ADDED */ ? '[ADDED]' : event.type === 2 /* FileChangeType.DELETED */ ? '[DELETED]' : '[CHANGED]'} ${event.resource.fsPath}`);
                    }
                }
                // Broadcast to clients via throttled emitter
                const worked = this.throttledFileChangesEmitter.work(coalescedFileChanges);
                // Logging
                if (!worked) {
                    this.warn(`started ignoring events due to too many file change events at once (incoming: ${coalescedFileChanges.length}, most recent change: ${coalescedFileChanges[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
                }
                else {
                    if (this.throttledFileChangesEmitter.pending > 0) {
                        this.trace(`started throttling events due to large amount of file change events at once (pending: ${this.throttledFileChangesEmitter.pending}, most recent change: ${coalescedFileChanges[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`);
                    }
                }
            }
        }
        async existsChildStrictCase(path) {
            if (platform_1.isLinux) {
                return pfs_1.Promises.exists(path);
            }
            try {
                const pathBasename = (0, path_1.basename)(path);
                const children = await pfs_1.Promises.readdir((0, path_1.dirname)(path));
                return children.some(child => child === pathBasename);
            }
            catch (error) {
                this.trace(error);
                return false;
            }
        }
        setVerboseLogging(verboseLogging) {
            this.verboseLogging = verboseLogging;
        }
        error(error) {
            if (!this.cts.token.isCancellationRequested) {
                this.onLogMessage?.({ type: 'error', message: `[File Watcher (node.js)] ${error}` });
            }
        }
        warn(message) {
            if (!this.cts.token.isCancellationRequested) {
                this.onLogMessage?.({ type: 'warn', message: `[File Watcher (node.js)] ${message}` });
            }
        }
        trace(message) {
            if (!this.cts.token.isCancellationRequested && this.verboseLogging) {
                this.onLogMessage?.({ type: 'trace', message: `[File Watcher (node.js)] ${message}` });
            }
        }
        dispose() {
            this.trace(`stopping file watcher on ${this.request.path}`);
            this.cts.dispose(true);
            super.dispose();
        }
    }
    exports.NodeJSFileWatcherLibrary = NodeJSFileWatcherLibrary;
    /**
     * Watch the provided `path` for changes and return
     * the data in chunks of `Uint8Array` for further use.
     */
    async function watchFileContents(path, onData, onReady, token, bufferSize = 512) {
        const handle = await pfs_1.Promises.open(path, 'r');
        const buffer = Buffer.allocUnsafe(bufferSize);
        const cts = new cancellation_1.CancellationTokenSource(token);
        let error = undefined;
        let isReading = false;
        const request = { path, excludes: [], recursive: false };
        const watcher = new NodeJSFileWatcherLibrary(request, changes => {
            (async () => {
                for (const { type } of changes) {
                    if (type === 0 /* FileChangeType.UPDATED */) {
                        if (isReading) {
                            return; // return early if we are already reading the output
                        }
                        isReading = true;
                        try {
                            // Consume the new contents of the file until finished
                            // everytime there is a change event signalling a change
                            while (!cts.token.isCancellationRequested) {
                                const { bytesRead } = await pfs_1.Promises.read(handle, buffer, 0, bufferSize, null);
                                if (!bytesRead || cts.token.isCancellationRequested) {
                                    break;
                                }
                                onData(buffer.slice(0, bytesRead));
                            }
                        }
                        catch (err) {
                            error = new Error(err);
                            cts.dispose(true);
                        }
                        finally {
                            isReading = false;
                        }
                    }
                }
            })();
        });
        await watcher.ready;
        onReady();
        return new Promise((resolve, reject) => {
            cts.token.onCancellationRequested(async () => {
                watcher.dispose();
                try {
                    await pfs_1.Promises.close(handle);
                }
                catch (err) {
                    error = new Error(err);
                }
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    exports.watchFileContents = watchFileContents;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZWpzV2F0Y2hlckxpYi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZmlsZXMvbm9kZS93YXRjaGVyL25vZGVqcy9ub2RlanNXYXRjaGVyTGliLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBYSx3QkFBeUIsU0FBUSxzQkFBVTtRQUV2RCxpREFBaUQ7UUFDakQsZ0RBQWdEO1FBQ2hELGdEQUFnRDtRQUNoRCxhQUFhO2lCQUNXLDhCQUF5QixHQUFHLEdBQUcsQUFBTixDQUFPO1FBRXhELG1EQUFtRDtRQUNuRCxxREFBcUQ7UUFDckQsZ0RBQWdEO2lCQUN4QiwrQkFBMEIsR0FBRyxFQUFFLEFBQUwsQ0FBTTtRQTJCeEQsWUFDUyxPQUFrQyxFQUNsQyxnQkFBa0QsRUFDbEQsWUFBeUMsRUFDekMsY0FBd0I7WUFFaEMsS0FBSyxFQUFFLENBQUM7WUFMQSxZQUFPLEdBQVAsT0FBTyxDQUEyQjtZQUNsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtDO1lBQ2xELGlCQUFZLEdBQVosWUFBWSxDQUE2QjtZQUN6QyxtQkFBYyxHQUFkLGNBQWMsQ0FBVTtZQTdCakMsNkRBQTZEO1lBQzdELDBEQUEwRDtZQUMxRCx3REFBd0Q7WUFDeEQsZ0NBQWdDO1lBQ2hDLHNEQUFzRDtZQUNyQyxnQ0FBMkIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUJBQWUsQ0FDaEY7Z0JBQ0MsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLG1EQUFtRDtnQkFDMUUsYUFBYSxFQUFFLEdBQUcsRUFBSyx3REFBd0Q7Z0JBQy9FLGVBQWUsRUFBRSxLQUFLLENBQUUsMERBQTBEO2FBQ2xGLEVBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQ3ZDLENBQUMsQ0FBQztZQUVILHlEQUF5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
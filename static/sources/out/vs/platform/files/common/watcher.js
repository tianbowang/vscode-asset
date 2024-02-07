/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/files/common/files"], function (require, exports, glob_1, lifecycle_1, path_1, platform_1, uri_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseWatcherPatterns = exports.normalizeWatcherPattern = exports.coalesceEvents = exports.reviveFileChanges = exports.AbstractUniversalWatcherClient = exports.AbstractNonRecursiveWatcherClient = exports.AbstractWatcherClient = exports.isRecursiveWatchRequest = void 0;
    function isRecursiveWatchRequest(request) {
        return request.recursive === true;
    }
    exports.isRecursiveWatchRequest = isRecursiveWatchRequest;
    class AbstractWatcherClient extends lifecycle_1.Disposable {
        static { this.MAX_RESTARTS = 5; }
        constructor(onFileChanges, onLogMessage, verboseLogging, options) {
            super();
            this.onFileChanges = onFileChanges;
            this.onLogMessage = onLogMessage;
            this.verboseLogging = verboseLogging;
            this.options = options;
            this.watcherDisposables = this._register(new lifecycle_1.MutableDisposable());
            this.requests = undefined;
            this.restartCounter = 0;
        }
        init() {
            // Associate disposables to the watcher
            const disposables = new lifecycle_1.DisposableStore();
            this.watcherDisposables.value = disposables;
            // Ask implementors to create the watcher
            this.watcher = this.createWatcher(disposables);
            this.watcher.setVerboseLogging(this.verboseLogging);
            // Wire in event handlers
            disposables.add(this.watcher.onDidChangeFile(changes => this.onFileChanges(changes)));
            disposables.add(this.watcher.onDidLogMessage(msg => this.onLogMessage(msg)));
            disposables.add(this.watcher.onDidError(error => this.onError(error)));
        }
        onError(error) {
            // Restart on error (up to N times, if enabled)
            if (this.options.restartOnError) {
                if (this.restartCounter < AbstractWatcherClient.MAX_RESTARTS && this.requests) {
                    this.error(`restarting watcher after error: ${error}`);
                    this.restart(this.requests);
                }
                else {
                    this.error(`gave up attempting to restart watcher after error: ${error}`);
                }
            }
            // Do not attempt to restart if not enabled
            else {
                this.error(error);
            }
        }
        restart(requests) {
            this.restartCounter++;
            this.init();
            this.watch(requests);
        }
        async watch(requests) {
            this.requests = requests;
            await this.watcher?.watch(requests);
        }
        async setVerboseLogging(verboseLogging) {
            this.verboseLogging = verboseLogging;
            await this.watcher?.setVerboseLogging(verboseLogging);
        }
        error(message) {
            this.onLogMessage({ type: 'error', message: `[File Watcher (${this.options.type})] ${message}` });
        }
        trace(message) {
            this.onLogMessage({ type: 'trace', message: `[File Watcher (${this.options.type})] ${message}` });
        }
        dispose() {
            // Render the watcher invalid from here
            this.watcher = undefined;
            return super.dispose();
        }
    }
    exports.AbstractWatcherClient = AbstractWatcherClient;
    class AbstractNonRecursiveWatcherClient extends AbstractWatcherClient {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging, { type: 'node.js', restartOnError: false });
        }
    }
    exports.AbstractNonRecursiveWatcherClient = AbstractNonRecursiveWatcherClient;
    class AbstractUniversalWatcherClient extends AbstractWatcherClient {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging, { type: 'universal', restartOnError: true });
        }
    }
    exports.AbstractUniversalWatcherClient = AbstractUniversalWatcherClient;
    function reviveFileChanges(changes) {
        return changes.map(change => ({
            type: change.type,
            resource: uri_1.URI.revive(change.resource),
            cId: change.cId
        }));
    }
    exports.reviveFileChanges = reviveFileChanges;
    function coalesceEvents(changes) {
        // Build deltas
        const coalescer = new EventCoalescer();
        for (const event of changes) {
            coalescer.processEvent(event);
        }
        return coalescer.coalesce();
    }
    exports.coalesceEvents = coalesceEvents;
    function normalizeWatcherPattern(path, pattern) {
        // Patterns are always matched on the full absolute path
        // of the event. As such, if the pattern is not absolute
        // and is a string and does not start with a leading
        // `**`, we have to convert it to a relative pattern with
        // the given `base`
        if (typeof pattern === 'string' && !pattern.startsWith(glob_1.GLOBSTAR) && !(0, path_1.isAbsolute)(pattern)) {
            return { base: path, pattern };
        }
        return pattern;
    }
    exports.normalizeWatcherPattern = normalizeWatcherPattern;
    function parseWatcherPatterns(path, patterns) {
        const parsedPatterns = [];
        for (const pattern of patterns) {
            parsedPatterns.push((0, glob_1.parse)(normalizeWatcherPattern(path, pattern)));
        }
        return parsedPatterns;
    }
    exports.parseWatcherPatterns = parseWatcherPatterns;
    class EventCoalescer {
        constructor() {
            this.coalesced = new Set();
            this.mapPathToChange = new Map();
        }
        toKey(event) {
            if (platform_1.isLinux) {
                return event.resource.fsPath;
            }
            return event.resource.fsPath.toLowerCase(); // normalise to file system case sensitivity
        }
        processEvent(event) {
            const existingEvent = this.mapPathToChange.get(this.toKey(event));
            let keepEvent = false;
            // Event path already exists
            if (existingEvent) {
                const currentChangeType = existingEvent.type;
                const newChangeType = event.type;
                // macOS/Windows: track renames to different case
                // by keeping both CREATE and DELETE events
                if (existingEvent.resource.fsPath !== event.resource.fsPath && (event.type === 2 /* FileChangeType.DELETED */ || event.type === 1 /* FileChangeType.ADDED */)) {
                    keepEvent = true;
                }
                // Ignore CREATE followed by DELETE in one go
                else if (currentChangeType === 1 /* FileChangeType.ADDED */ && newChangeType === 2 /* FileChangeType.DELETED */) {
                    this.mapPathToChange.delete(this.toKey(event));
                    this.coalesced.delete(existingEvent);
                }
                // Flatten DELETE followed by CREATE into CHANGE
                else if (currentChangeType === 2 /* FileChangeType.DELETED */ && newChangeType === 1 /* FileChangeType.ADDED */) {
                    existingEvent.type = 0 /* FileChangeType.UPDATED */;
                }
                // Do nothing. Keep the created event
                else if (currentChangeType === 1 /* FileChangeType.ADDED */ && newChangeType === 0 /* FileChangeType.UPDATED */) { }
                // Otherwise apply change type
                else {
                    existingEvent.type = newChangeType;
                }
            }
            // Otherwise keep
            else {
                keepEvent = true;
            }
            if (keepEvent) {
                this.coalesced.add(event);
                this.mapPathToChange.set(this.toKey(event), event);
            }
        }
        coalesce() {
            const addOrChangeEvents = [];
            const deletedPaths = [];
            // This algorithm will remove all DELETE events up to the root folder
            // that got deleted if any. This ensures that we are not producing
            // DELETE events for each file inside a folder that gets deleted.
            //
            // 1.) split ADD/CHANGE and DELETED events
            // 2.) sort short deleted paths to the top
            // 3.) for each DELETE, check if there is a deleted parent and ignore the event in that case
            return Array.from(this.coalesced).filter(e => {
                if (e.type !== 2 /* FileChangeType.DELETED */) {
                    addOrChangeEvents.push(e);
                    return false; // remove ADD / CHANGE
                }
                return true; // keep DELETE
            }).sort((e1, e2) => {
                return e1.resource.fsPath.length - e2.resource.fsPath.length; // shortest path first
            }).filter(e => {
                if (deletedPaths.some(deletedPath => (0, files_1.isParent)(e.resource.fsPath, deletedPath, !platform_1.isLinux /* ignorecase */))) {
                    return false; // DELETE is ignored if parent is deleted already
                }
                // otherwise mark as deleted
                deletedPaths.push(e.resource.fsPath);
                return true;
            }).concat(addOrChangeEvents);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZmlsZXMvY29tbW9uL3dhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0VoRyxTQUFnQix1QkFBdUIsQ0FBQyxPQUFzQjtRQUM3RCxPQUFPLE9BQU8sQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDO0lBQ25DLENBQUM7SUFGRCwwREFFQztJQTRFRCxNQUFzQixxQkFBc0IsU0FBUSxzQkFBVTtpQkFFckMsaUJBQVksR0FBRyxDQUFDLEFBQUosQ0FBSztRQVN6QyxZQUNrQixhQUErQyxFQUMvQyxZQUF3QyxFQUNqRCxjQUF1QixFQUN2QixPQUdQO1lBRUQsS0FBSyxFQUFFLENBQUM7WUFSUyxrQkFBYSxHQUFiLGFBQWEsQ0FBa0M7WUFDL0MsaUJBQVksR0FBWixZQUFZLENBQTRCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFTO1lBQ3ZCLFlBQU8sR0FBUCxPQUFPLENBR2Q7WUFiZSx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRXRFLGFBQVEsR0FBZ0MsU0FBUyxDQUFDO1lBRWxELG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1FBWTNCLENBQUM7UUFJUyxJQUFJO1lBRWIsdUNBQXVDO1lBQ3ZDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1lBRTVDLHlDQUF5QztZQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFcEQseUJBQXlCO1lBQ3pCLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0UsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFUyxPQUFPLENBQUMsS0FBYTtZQUU5QiwrQ0FBK0M7WUFDL0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLElBQUksQ0FBQyxjQUFjLEdBQUcscUJBQXFCLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDL0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsS0FBSyxFQUFFLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzdCLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFJLENBQUMsS0FBSyxDQUFDLHNEQUFzRCxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRSxDQUFDO1lBQ0YsQ0FBQztZQUVELDJDQUEyQztpQkFDdEMsQ0FBQztnQkFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLENBQUM7UUFDRixDQUFDO1FBRU8sT0FBTyxDQUFDLFFBQWtDO1lBQ2pELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUV0QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQWtDO1lBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBRXpCLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxjQUF1QjtZQUM5QyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztZQUVyQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVPLEtBQUssQ0FBQyxPQUFlO1lBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLENBQUM7UUFFUyxLQUFLLENBQUMsT0FBZTtZQUM5QixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsa0JBQWtCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRyxDQUFDO1FBRVEsT0FBTztZQUVmLHVDQUF1QztZQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUV6QixPQUFPLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QixDQUFDOztJQTVGRixzREE2RkM7SUFFRCxNQUFzQixpQ0FBa0MsU0FBUSxxQkFBcUI7UUFFcEYsWUFDQyxhQUErQyxFQUMvQyxZQUF3QyxFQUN4QyxjQUF1QjtZQUV2QixLQUFLLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7S0FHRDtJQVhELDhFQVdDO0lBRUQsTUFBc0IsOEJBQStCLFNBQVEscUJBQXFCO1FBRWpGLFlBQ0MsYUFBK0MsRUFDL0MsWUFBd0MsRUFDeEMsY0FBdUI7WUFFdkIsS0FBSyxDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRyxDQUFDO0tBR0Q7SUFYRCx3RUFXQztJQU9ELFNBQWdCLGlCQUFpQixDQUFDLE9BQXNCO1FBQ3ZELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLFFBQVEsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDckMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO1NBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBTkQsOENBTUM7SUFFRCxTQUFnQixjQUFjLENBQUMsT0FBc0I7UUFFcEQsZUFBZTtRQUNmLE1BQU0sU0FBUyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDdkMsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUM3QixTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBVEQsd0NBU0M7SUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxJQUFZLEVBQUUsT0FBa0M7UUFFdkYsd0RBQXdEO1FBQ3hELHdEQUF3RDtRQUN4RCxvREFBb0Q7UUFDcEQseURBQXlEO1FBQ3pELG1CQUFtQjtRQUVuQixJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBUSxDQUFDLElBQUksQ0FBQyxJQUFBLGlCQUFVLEVBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUMxRixPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQWJELDBEQWFDO0lBRUQsU0FBZ0Isb0JBQW9CLENBQUMsSUFBWSxFQUFFLFFBQTBDO1FBQzVGLE1BQU0sY0FBYyxHQUFvQixFQUFFLENBQUM7UUFFM0MsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNoQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUEsWUFBSyxFQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVELE9BQU8sY0FBYyxDQUFDO0lBQ3ZCLENBQUM7SUFSRCxvREFRQztJQUVELE1BQU0sY0FBYztRQUFwQjtZQUVrQixjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztZQUNuQyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1FBeUZuRSxDQUFDO1FBdkZRLEtBQUssQ0FBQyxLQUFrQjtZQUMvQixJQUFJLGtCQUFPLEVBQUUsQ0FBQztnQkFDYixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzlCLENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsNENBQTRDO1FBQ3pGLENBQUM7UUFFRCxZQUFZLENBQUMsS0FBa0I7WUFDOUIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRWxFLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztZQUV0Qiw0QkFBNEI7WUFDNUIsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDbkIsTUFBTSxpQkFBaUIsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDO2dCQUM3QyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUVqQyxpREFBaUQ7Z0JBQ2pELDJDQUEyQztnQkFDM0MsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLG1DQUEyQixJQUFJLEtBQUssQ0FBQyxJQUFJLGlDQUF5QixDQUFDLEVBQUUsQ0FBQztvQkFDL0ksU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDbEIsQ0FBQztnQkFFRCw2Q0FBNkM7cUJBQ3hDLElBQUksaUJBQWlCLGlDQUF5QixJQUFJLGFBQWEsbUNBQTJCLEVBQUUsQ0FBQztvQkFDakcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztnQkFFRCxnREFBZ0Q7cUJBQzNDLElBQUksaUJBQWlCLG1DQUEyQixJQUFJLGFBQWEsaUNBQXlCLEVBQUUsQ0FBQztvQkFDakcsYUFBYSxDQUFDLElBQUksaUNBQXlCLENBQUM7Z0JBQzdDLENBQUM7Z0JBRUQscUNBQXFDO3FCQUNoQyxJQUFJLGlCQUFpQixpQ0FBeUIsSUFBSSxhQUFhLG1DQUEyQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUVwRyw4QkFBOEI7cUJBQ3pCLENBQUM7b0JBQ0wsYUFBYSxDQUFDLElBQUksR0FBRyxhQUFhLENBQUM7Z0JBQ3BDLENBQUM7WUFDRixDQUFDO1lBRUQsaUJBQWlCO2lCQUNaLENBQUM7Z0JBQ0wsU0FBUyxHQUFHLElBQUksQ0FBQztZQUNsQixDQUFDO1lBRUQsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDZixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRCxDQUFDO1FBQ0YsQ0FBQztRQUVELFFBQVE7WUFDUCxNQUFNLGlCQUFpQixHQUFrQixFQUFFLENBQUM7WUFDNUMsTUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO1lBRWxDLHFFQUFxRTtZQUNyRSxrRUFBa0U7WUFDbEUsaUVBQWlFO1lBQ2pFLEVBQUU7WUFDRiwwQ0FBMEM7WUFDMUMsMENBQTBDO1lBQzFDLDRGQUE0RjtZQUM1RixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDNUMsSUFBSSxDQUFDLENBQUMsSUFBSSxtQ0FBMkIsRUFBRSxDQUFDO29CQUN2QyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRTFCLE9BQU8sS0FBSyxDQUFDLENBQUMsc0JBQXNCO2dCQUNyQyxDQUFDO2dCQUVELE9BQU8sSUFBSSxDQUFDLENBQUMsY0FBYztZQUM1QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7Z0JBQ2xCLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLHNCQUFzQjtZQUNyRixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2IsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBQSxnQkFBUSxFQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLGtCQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQzNHLE9BQU8sS0FBSyxDQUFDLENBQUMsaURBQWlEO2dCQUNoRSxDQUFDO2dCQUVELDRCQUE0QjtnQkFDNUIsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVyQyxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzlCLENBQUM7S0FDRCJ9
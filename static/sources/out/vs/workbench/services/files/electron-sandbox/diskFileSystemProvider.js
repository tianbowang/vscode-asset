/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/platform/files/common/diskFileSystemProvider", "vs/platform/files/common/diskFileSystemProviderClient", "vs/workbench/services/files/electron-sandbox/watcherClient"], function (require, exports, platform_1, diskFileSystemProvider_1, diskFileSystemProviderClient_1, watcherClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiskFileSystemProvider = void 0;
    /**
     * A sandbox ready disk file system provider that delegates almost all calls
     * to the main process via `DiskFileSystemProviderServer` except for recursive
     * file watching that is done via shared process workers due to CPU intensity.
     */
    class DiskFileSystemProvider extends diskFileSystemProvider_1.AbstractDiskFileSystemProvider {
        constructor(mainProcessService, utilityProcessWorkerWorkbenchService, logService) {
            super(logService, { watcher: { forceUniversal: true /* send all requests to universal watcher process */ } });
            this.mainProcessService = mainProcessService;
            this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
            this.provider = this._register(new diskFileSystemProviderClient_1.DiskFileSystemProviderClient(this.mainProcessService.getChannel(diskFileSystemProviderClient_1.LOCAL_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: platform_1.isLinux, trash: true }));
            this.registerListeners();
        }
        registerListeners() {
            // Forward events from the embedded provider
            this.provider.onDidChangeFile(changes => this._onDidChangeFile.fire(changes));
            this.provider.onDidWatchError(error => this._onDidWatchError.fire(error));
        }
        //#region File Capabilities
        get onDidChangeCapabilities() { return this.provider.onDidChangeCapabilities; }
        get capabilities() { return this.provider.capabilities; }
        //#endregion
        //#region File Metadata Resolving
        stat(resource) {
            return this.provider.stat(resource);
        }
        readdir(resource) {
            return this.provider.readdir(resource);
        }
        //#endregion
        //#region File Reading/Writing
        readFile(resource, opts) {
            return this.provider.readFile(resource, opts);
        }
        readFileStream(resource, opts, token) {
            return this.provider.readFileStream(resource, opts, token);
        }
        writeFile(resource, content, opts) {
            return this.provider.writeFile(resource, content, opts);
        }
        open(resource, opts) {
            return this.provider.open(resource, opts);
        }
        close(fd) {
            return this.provider.close(fd);
        }
        read(fd, pos, data, offset, length) {
            return this.provider.read(fd, pos, data, offset, length);
        }
        write(fd, pos, data, offset, length) {
            return this.provider.write(fd, pos, data, offset, length);
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        mkdir(resource) {
            return this.provider.mkdir(resource);
        }
        delete(resource, opts) {
            return this.provider.delete(resource, opts);
        }
        rename(from, to, opts) {
            return this.provider.rename(from, to, opts);
        }
        copy(from, to, opts) {
            return this.provider.copy(from, to, opts);
        }
        //#endregion
        //#region Clone File
        cloneFile(from, to) {
            return this.provider.cloneFile(from, to);
        }
        //#endregion
        //#region File Watching
        createUniversalWatcher(onChange, onLogMessage, verboseLogging) {
            return new watcherClient_1.UniversalWatcherClient(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging, this.utilityProcessWorkerWorkbenchService);
        }
        createNonRecursiveWatcher() {
            throw new Error('Method not implemented in sandbox.'); // we never expect this to be called given we set `forceUniversal: true`
        }
    }
    exports.DiskFileSystemProvider = DiskFileSystemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlza0ZpbGVTeXN0ZW1Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2ZpbGVzL2VsZWN0cm9uLXNhbmRib3gvZGlza0ZpbGVTeXN0ZW1Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHOzs7O09BSUc7SUFDSCxNQUFhLHNCQUF1QixTQUFRLHVEQUE4QjtRQVV6RSxZQUNrQixrQkFBdUMsRUFDdkMsb0NBQTJFLEVBQzVGLFVBQXVCO1lBRXZCLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLG9EQUFvRCxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBSjdGLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDdkMseUNBQW9DLEdBQXBDLG9DQUFvQyxDQUF1QztZQUo1RSxhQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJEQUE0QixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsNkRBQThCLENBQUMsRUFBRSxFQUFFLGlCQUFpQixFQUFFLGtCQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQVM3TCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBRXhCLDRDQUE0QztZQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM5RSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJ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
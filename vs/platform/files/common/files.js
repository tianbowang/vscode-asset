(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/ternarySearchTree", "vs/base/common/path", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/base/common/platform", "vs/base/common/network", "vs/base/common/lazy"], function (require, exports, ternarySearchTree_1, path_1, strings_1, types_1, uri_1, nls_1, instantiation_1, platform_1, network_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLargeFileConfirmationLimit = exports.ByteSize = exports.whenProviderRegistered = exports.etag = exports.ETAG_DISABLED = exports.FileKind = exports.FILES_READONLY_FROM_PERMISSIONS_CONFIG = exports.FILES_READONLY_EXCLUDE_CONFIG = exports.FILES_READONLY_INCLUDE_CONFIG = exports.FILES_EXCLUDE_CONFIG = exports.FILES_ASSOCIATIONS_CONFIG = exports.HotExitConfiguration = exports.AutoSaveConfiguration = exports.FileOperationResult = exports.NotModifiedSinceFileOperationError = exports.TooLargeFileOperationError = exports.FileOperationError = exports.isParent = exports.FileChangesEvent = exports.FileChangeType = exports.FileOperationEvent = exports.FileOperation = exports.toFileOperationResult = exports.toFileSystemProviderErrorCode = exports.markAsFileSystemProviderError = exports.ensureFileSystemProviderError = exports.createFileSystemProviderError = exports.FileSystemProviderError = exports.FileSystemProviderErrorCode = exports.hasReadonlyCapability = exports.hasFileAtomicDeleteCapability = exports.hasFileAtomicWriteCapability = exports.hasFileAtomicReadCapability = exports.hasFileReadStreamCapability = exports.hasOpenReadWriteCloseCapability = exports.hasFileCloneCapability = exports.hasFileFolderCopyCapability = exports.hasReadWriteCapability = exports.FileSystemProviderCapabilities = exports.isFileSystemWatcher = exports.FilePermission = exports.FileType = exports.isFileOpenForWriteOptions = exports.IFileService = void 0;
    //#region file service & providers
    exports.IFileService = (0, instantiation_1.createDecorator)('fileService');
    function isFileOpenForWriteOptions(options) {
        return options.create === true;
    }
    exports.isFileOpenForWriteOptions = isFileOpenForWriteOptions;
    var FileType;
    (function (FileType) {
        /**
         * File is unknown (neither file, directory nor symbolic link).
         */
        FileType[FileType["Unknown"] = 0] = "Unknown";
        /**
         * File is a normal file.
         */
        FileType[FileType["File"] = 1] = "File";
        /**
         * File is a directory.
         */
        FileType[FileType["Directory"] = 2] = "Directory";
        /**
         * File is a symbolic link.
         *
         * Note: even when the file is a symbolic link, you can test for
         * `FileType.File` and `FileType.Directory` to know the type of
         * the target the link points to.
         */
        FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
    })(FileType || (exports.FileType = FileType = {}));
    var FilePermission;
    (function (FilePermission) {
        /**
         * File is readonly. Components like editors should not
         * offer to edit the contents.
         */
        FilePermission[FilePermission["Readonly"] = 1] = "Readonly";
        /**
         * File is locked. Components like editors should offer
         * to edit the contents and ask the user upon saving to
         * remove the lock.
         */
        FilePermission[FilePermission["Locked"] = 2] = "Locked";
    })(FilePermission || (exports.FilePermission = FilePermission = {}));
    function isFileSystemWatcher(thing) {
        const candidate = thing;
        return !!candidate && typeof candidate.onDidChange === 'function';
    }
    exports.isFileSystemWatcher = isFileSystemWatcher;
    var FileSystemProviderCapabilities;
    (function (FileSystemProviderCapabilities) {
        /**
         * No capabilities.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["None"] = 0] = "None";
        /**
         * Provider supports unbuffered read/write.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileReadWrite"] = 2] = "FileReadWrite";
        /**
         * Provider supports open/read/write/close low level file operations.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileOpenReadWriteClose"] = 4] = "FileOpenReadWriteClose";
        /**
         * Provider supports stream based reading.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileReadStream"] = 16] = "FileReadStream";
        /**
         * Provider supports copy operation.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileFolderCopy"] = 8] = "FileFolderCopy";
        /**
         * Provider is path case sensitive.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["PathCaseSensitive"] = 1024] = "PathCaseSensitive";
        /**
         * All files of the provider are readonly.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["Readonly"] = 2048] = "Readonly";
        /**
         * Provider supports to delete via trash.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["Trash"] = 4096] = "Trash";
        /**
         * Provider support to unlock files for writing.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileWriteUnlock"] = 8192] = "FileWriteUnlock";
        /**
         * Provider support to read files atomically. This implies the
         * provider provides the `FileReadWrite` capability too.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileAtomicRead"] = 16384] = "FileAtomicRead";
        /**
         * Provider support to write files atomically. This implies the
         * provider provides the `FileReadWrite` capability too.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileAtomicWrite"] = 32768] = "FileAtomicWrite";
        /**
         * Provider support to delete atomically.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileAtomicDelete"] = 65536] = "FileAtomicDelete";
        /**
         * Provider support to clone files atomically.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileClone"] = 131072] = "FileClone";
    })(FileSystemProviderCapabilities || (exports.FileSystemProviderCapabilities = FileSystemProviderCapabilities = {}));
    function hasReadWriteCapability(provider) {
        return !!(provider.capabilities & 2 /* FileSystemProviderCapabilities.FileReadWrite */);
    }
    exports.hasReadWriteCapability = hasReadWriteCapability;
    function hasFileFolderCopyCapability(provider) {
        return !!(provider.capabilities & 8 /* FileSystemProviderCapabilities.FileFolderCopy */);
    }
    exports.hasFileFolderCopyCapability = hasFileFolderCopyCapability;
    function hasFileCloneCapability(provider) {
        return !!(provider.capabilities & 131072 /* FileSystemProviderCapabilities.FileClone */);
    }
    exports.hasFileCloneCapability = hasFileCloneCapability;
    function hasOpenReadWriteCloseCapability(provider) {
        return !!(provider.capabilities & 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
    }
    exports.hasOpenReadWriteCloseCapability = hasOpenReadWriteCloseCapability;
    function hasFileReadStreamCapability(provider) {
        return !!(provider.capabilities & 16 /* FileSystemProviderCapabilities.FileReadStream */);
    }
    exports.hasFileReadStreamCapability = hasFileReadStreamCapability;
    function hasFileAtomicReadCapability(provider) {
        if (!hasReadWriteCapability(provider)) {
            return false; // we require the `FileReadWrite` capability too
        }
        return !!(provider.capabilities & 16384 /* FileSystemProviderCapabilities.FileAtomicRead */);
    }
    exports.hasFileAtomicReadCapability = hasFileAtomicReadCapability;
    function hasFileAtomicWriteCapability(provider) {
        if (!hasReadWriteCapability(provider)) {
            return false; // we require the `FileReadWrite` capability too
        }
        return !!(provider.capabilities & 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */);
    }
    exports.hasFileAtomicWriteCapability = hasFileAtomicWriteCapability;
    function hasFileAtomicDeleteCapability(provider) {
        return !!(provider.capabilities & 65536 /* FileSystemProviderCapabilities.FileAtomicDelete */);
    }
    exports.hasFileAtomicDeleteCapability = hasFileAtomicDeleteCapability;
    function hasReadonlyCapability(provider) {
        return !!(provider.capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */);
    }
    exports.hasReadonlyCapability = hasReadonlyCapability;
    var FileSystemProviderErrorCode;
    (function (FileSystemProviderErrorCode) {
        FileSystemProviderErrorCode["FileExists"] = "EntryExists";
        FileSystemProviderErrorCode["FileNotFound"] = "EntryNotFound";
        FileSystemProviderErrorCode["FileNotADirectory"] = "EntryNotADirectory";
        FileSystemProviderErrorCode["FileIsADirectory"] = "EntryIsADirectory";
        FileSystemProviderErrorCode["FileExceedsStorageQuota"] = "EntryExceedsStorageQuota";
        FileSystemProviderErrorCode["FileTooLarge"] = "EntryTooLarge";
        FileSystemProviderErrorCode["FileWriteLocked"] = "EntryWriteLocked";
        FileSystemProviderErrorCode["NoPermissions"] = "NoPermissions";
        FileSystemProviderErrorCode["Unavailable"] = "Unavailable";
        FileSystemProviderErrorCode["Unknown"] = "Unknown";
    })(FileSystemProviderErrorCode || (exports.FileSystemProviderErrorCode = FileSystemProviderErrorCode = {}));
    class FileSystemProviderError extends Error {
        static create(error, code) {
            const providerError = new FileSystemProviderError(error.toString(), code);
            markAsFileSystemProviderError(providerError, code);
            return providerError;
        }
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.FileSystemProviderError = FileSystemProviderError;
    function createFileSystemProviderError(error, code) {
        return FileSystemProviderError.create(error, code);
    }
    exports.createFileSystemProviderError = createFileSystemProviderError;
    function ensureFileSystemProviderError(error) {
        if (!error) {
            return createFileSystemProviderError((0, nls_1.localize)('unknownError', "Unknown Error"), FileSystemProviderErrorCode.Unknown); // https://github.com/microsoft/vscode/issues/72798
        }
        return error;
    }
    exports.ensureFileSystemProviderError = ensureFileSystemProviderError;
    function markAsFileSystemProviderError(error, code) {
        error.name = code ? `${code} (FileSystemError)` : `FileSystemError`;
        return error;
    }
    exports.markAsFileSystemProviderError = markAsFileSystemProviderError;
    function toFileSystemProviderErrorCode(error) {
        // Guard against abuse
        if (!error) {
            return FileSystemProviderErrorCode.Unknown;
        }
        // FileSystemProviderError comes with the code
        if (error instanceof FileSystemProviderError) {
            return error.code;
        }
        // Any other error, check for name match by assuming that the error
        // went through the markAsFileSystemProviderError() method
        const match = /^(.+) \(FileSystemError\)$/.exec(error.name);
        if (!match) {
            return FileSystemProviderErrorCode.Unknown;
        }
        switch (match[1]) {
            case FileSystemProviderErrorCode.FileExists: return FileSystemProviderErrorCode.FileExists;
            case FileSystemProviderErrorCode.FileIsADirectory: return FileSystemProviderErrorCode.FileIsADirectory;
            case FileSystemProviderErrorCode.FileNotADirectory: return FileSystemProviderErrorCode.FileNotADirectory;
            case FileSystemProviderErrorCode.FileNotFound: return FileSystemProviderErrorCode.FileNotFound;
            case FileSystemProviderErrorCode.FileTooLarge: return FileSystemProviderErrorCode.FileTooLarge;
            case FileSystemProviderErrorCode.FileWriteLocked: return FileSystemProviderErrorCode.FileWriteLocked;
            case FileSystemProviderErrorCode.NoPermissions: return FileSystemProviderErrorCode.NoPermissions;
            case FileSystemProviderErrorCode.Unavailable: return FileSystemProviderErrorCode.Unavailable;
        }
        return FileSystemProviderErrorCode.Unknown;
    }
    exports.toFileSystemProviderErrorCode = toFileSystemProviderErrorCode;
    function toFileOperationResult(error) {
        // FileSystemProviderError comes with the result already
        if (error instanceof FileOperationError) {
            return error.fileOperationResult;
        }
        // Otherwise try to find from code
        switch (toFileSystemProviderErrorCode(error)) {
            case FileSystemProviderErrorCode.FileNotFound:
                return 1 /* FileOperationResult.FILE_NOT_FOUND */;
            case FileSystemProviderErrorCode.FileIsADirectory:
                return 0 /* FileOperationResult.FILE_IS_DIRECTORY */;
            case FileSystemProviderErrorCode.FileNotADirectory:
                return 9 /* FileOperationResult.FILE_NOT_DIRECTORY */;
            case FileSystemProviderErrorCode.FileWriteLocked:
                return 5 /* FileOperationResult.FILE_WRITE_LOCKED */;
            case FileSystemProviderErrorCode.NoPermissions:
                return 6 /* FileOperationResult.FILE_PERMISSION_DENIED */;
            case FileSystemProviderErrorCode.FileExists:
                return 4 /* FileOperationResult.FILE_MOVE_CONFLICT */;
            case FileSystemProviderErrorCode.FileTooLarge:
                return 7 /* FileOperationResult.FILE_TOO_LARGE */;
            default:
                return 10 /* FileOperationResult.FILE_OTHER_ERROR */;
        }
    }
    exports.toFileOperationResult = toFileOperationResult;
    var FileOperation;
    (function (FileOperation) {
        FileOperation[FileOperation["CREATE"] = 0] = "CREATE";
        FileOperation[FileOperation["DELETE"] = 1] = "DELETE";
        FileOperation[FileOperation["MOVE"] = 2] = "MOVE";
        FileOperation[FileOperation["COPY"] = 3] = "COPY";
        FileOperation[FileOperation["WRITE"] = 4] = "WRITE";
    })(FileOperation || (exports.FileOperation = FileOperation = {}));
    class FileOperationEvent {
        constructor(resource, operation, target) {
            this.resource = resource;
            this.operation = operation;
            this.target = target;
        }
        isOperation(operation) {
            return this.operation === operation;
        }
    }
    exports.FileOperationEvent = FileOperationEvent;
    /**
     * Possible changes that can occur to a file.
     */
    var FileChangeType;
    (function (FileChangeType) {
        FileChangeType[FileChangeType["UPDATED"] = 0] = "UPDATED";
        FileChangeType[FileChangeType["ADDED"] = 1] = "ADDED";
        FileChangeType[FileChangeType["DELETED"] = 2] = "DELETED";
    })(FileChangeType || (exports.FileChangeType = FileChangeType = {}));
    class FileChangesEvent {
        static { this.MIXED_CORRELATION = null; }
        constructor(changes, ignorePathCasing) {
            this.ignorePathCasing = ignorePathCasing;
            this.correlationId = undefined;
            this.added = new lazy_1.Lazy(() => {
                const added = ternarySearchTree_1.TernarySearchTree.forUris(() => this.ignorePathCasing);
                added.fill(this.rawAdded.map(resource => [resource, true]));
                return added;
            });
            this.updated = new lazy_1.Lazy(() => {
                const updated = ternarySearchTree_1.TernarySearchTree.forUris(() => this.ignorePathCasing);
                updated.fill(this.rawUpdated.map(resource => [resource, true]));
                return updated;
            });
            this.deleted = new lazy_1.Lazy(() => {
                const deleted = ternarySearchTree_1.TernarySearchTree.forUris(() => this.ignorePathCasing);
                deleted.fill(this.rawDeleted.map(resource => [resource, true]));
                return deleted;
            });
            /**
             * @deprecated use the `contains` or `affects` method to efficiently find
             * out if the event relates to a given resource. these methods ensure:
             * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
             * - correctly handles `FileChangeType.DELETED` events
             */
            this.rawAdded = [];
            /**
            * @deprecated use the `contains` or `affects` method to efficiently find
            * out if the event relates to a given resource. these methods ensure:
            * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
            * - correctly handles `FileChangeType.DELETED` events
            */
            this.rawUpdated = [];
            /**
            * @deprecated use the `contains` or `affects` method to efficiently find
            * out if the event relates to a given resource. these methods ensure:
            * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
            * - correctly handles `FileChangeType.DELETED` events
            */
            this.rawDeleted = [];
            for (const change of changes) {
                // Split by type
                switch (change.type) {
                    case 1 /* FileChangeType.ADDED */:
                        this.rawAdded.push(change.resource);
                        break;
                    case 0 /* FileChangeType.UPDATED */:
                        this.rawUpdated.push(change.resource);
                        break;
                    case 2 /* FileChangeType.DELETED */:
                        this.rawDeleted.push(change.resource);
                        break;
                }
                // Figure out events correlation
                if (this.correlationId !== FileChangesEvent.MIXED_CORRELATION) {
                    if (typeof change.cId === 'number') {
                        if (this.correlationId === undefined) {
                            this.correlationId = change.cId; // correlation not yet set, just take it
                        }
                        else if (this.correlationId !== change.cId) {
                            this.correlationId = FileChangesEvent.MIXED_CORRELATION; // correlation mismatch, we have mixed correlation
                        }
                    }
                    else {
                        if (this.correlationId !== undefined) {
                            this.correlationId = FileChangesEvent.MIXED_CORRELATION; // correlation mismatch, we have mixed correlation
                        }
                    }
                }
            }
        }
        /**
         * Find out if the file change events match the provided resource.
         *
         * Note: when passing `FileChangeType.DELETED`, we consider a match
         * also when the parent of the resource got deleted.
         */
        contains(resource, ...types) {
            return this.doContains(resource, { includeChildren: false }, ...types);
        }
        /**
         * Find out if the file change events either match the provided
         * resource, or contain a child of this resource.
         */
        affects(resource, ...types) {
            return this.doContains(resource, { includeChildren: true }, ...types);
        }
        doContains(resource, options, ...types) {
            if (!resource) {
                return false;
            }
            const hasTypesFilter = types.length > 0;
            // Added
            if (!hasTypesFilter || types.includes(1 /* FileChangeType.ADDED */)) {
                if (this.added.value.get(resource)) {
                    return true;
                }
                if (options.includeChildren && this.added.value.findSuperstr(resource)) {
                    return true;
                }
            }
            // Updated
            if (!hasTypesFilter || types.includes(0 /* FileChangeType.UPDATED */)) {
                if (this.updated.value.get(resource)) {
                    return true;
                }
                if (options.includeChildren && this.updated.value.findSuperstr(resource)) {
                    return true;
                }
            }
            // Deleted
            if (!hasTypesFilter || types.includes(2 /* FileChangeType.DELETED */)) {
                if (this.deleted.value.findSubstr(resource) /* deleted also considers parent folders */) {
                    return true;
                }
                if (options.includeChildren && this.deleted.value.findSuperstr(resource)) {
                    return true;
                }
            }
            return false;
        }
        /**
         * Returns if this event contains added files.
         */
        gotAdded() {
            return this.rawAdded.length > 0;
        }
        /**
         * Returns if this event contains deleted files.
         */
        gotDeleted() {
            return this.rawDeleted.length > 0;
        }
        /**
         * Returns if this event contains updated files.
         */
        gotUpdated() {
            return this.rawUpdated.length > 0;
        }
        /**
         * Returns if this event contains changes that correlate to the
         * provided `correlationId`.
         *
         * File change event correlation is an advanced watch feature that
         * allows to  identify from which watch request the events originate
         * from. This correlation allows to route events specifically
         * only to the requestor and not emit them to all listeners.
         */
        correlates(correlationId) {
            return this.correlationId === correlationId;
        }
        /**
         * Figure out if the event contains changes that correlate to one
         * correlation identifier.
         *
         * File change event correlation is an advanced watch feature that
         * allows to  identify from which watch request the events originate
         * from. This correlation allows to route events specifically
         * only to the requestor and not emit them to all listeners.
         */
        hasCorrelation() {
            return typeof this.correlationId === 'number';
        }
    }
    exports.FileChangesEvent = FileChangesEvent;
    function isParent(path, candidate, ignoreCase) {
        if (!path || !candidate || path === candidate) {
            return false;
        }
        if (candidate.length > path.length) {
            return false;
        }
        if (candidate.charAt(candidate.length - 1) !== path_1.sep) {
            candidate += path_1.sep;
        }
        if (ignoreCase) {
            return (0, strings_1.startsWithIgnoreCase)(path, candidate);
        }
        return path.indexOf(candidate) === 0;
    }
    exports.isParent = isParent;
    class FileOperationError extends Error {
        constructor(message, fileOperationResult, options) {
            super(message);
            this.fileOperationResult = fileOperationResult;
            this.options = options;
        }
    }
    exports.FileOperationError = FileOperationError;
    class TooLargeFileOperationError extends FileOperationError {
        constructor(message, fileOperationResult, size, options) {
            super(message, fileOperationResult, options);
            this.fileOperationResult = fileOperationResult;
            this.size = size;
        }
    }
    exports.TooLargeFileOperationError = TooLargeFileOperationError;
    class NotModifiedSinceFileOperationError extends FileOperationError {
        constructor(message, stat, options) {
            super(message, 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */, options);
            this.stat = stat;
        }
    }
    exports.NotModifiedSinceFileOperationError = NotModifiedSinceFileOperationError;
    var FileOperationResult;
    (function (FileOperationResult) {
        FileOperationResult[FileOperationResult["FILE_IS_DIRECTORY"] = 0] = "FILE_IS_DIRECTORY";
        FileOperationResult[FileOperationResult["FILE_NOT_FOUND"] = 1] = "FILE_NOT_FOUND";
        FileOperationResult[FileOperationResult["FILE_NOT_MODIFIED_SINCE"] = 2] = "FILE_NOT_MODIFIED_SINCE";
        FileOperationResult[FileOperationResult["FILE_MODIFIED_SINCE"] = 3] = "FILE_MODIFIED_SINCE";
        FileOperationResult[FileOperationResult["FILE_MOVE_CONFLICT"] = 4] = "FILE_MOVE_CONFLICT";
        FileOperationResult[FileOperationResult["FILE_WRITE_LOCKED"] = 5] = "FILE_WRITE_LOCKED";
        FileOperationResult[FileOperationResult["FILE_PERMISSION_DENIED"] = 6] = "FILE_PERMISSION_DENIED";
        FileOperationResult[FileOperationResult["FILE_TOO_LARGE"] = 7] = "FILE_TOO_LARGE";
        FileOperationResult[FileOperationResult["FILE_INVALID_PATH"] = 8] = "FILE_INVALID_PATH";
        FileOperationResult[FileOperationResult["FILE_NOT_DIRECTORY"] = 9] = "FILE_NOT_DIRECTORY";
        FileOperationResult[FileOperationResult["FILE_OTHER_ERROR"] = 10] = "FILE_OTHER_ERROR";
    })(FileOperationResult || (exports.FileOperationResult = FileOperationResult = {}));
    //#endregion
    //#region Settings
    exports.AutoSaveConfiguration = {
        OFF: 'off',
        AFTER_DELAY: 'afterDelay',
        ON_FOCUS_CHANGE: 'onFocusChange',
        ON_WINDOW_CHANGE: 'onWindowChange'
    };
    exports.HotExitConfiguration = {
        OFF: 'off',
        ON_EXIT: 'onExit',
        ON_EXIT_AND_WINDOW_CLOSE: 'onExitAndWindowClose'
    };
    exports.FILES_ASSOCIATIONS_CONFIG = 'files.associations';
    exports.FILES_EXCLUDE_CONFIG = 'files.exclude';
    exports.FILES_READONLY_INCLUDE_CONFIG = 'files.readonlyInclude';
    exports.FILES_READONLY_EXCLUDE_CONFIG = 'files.readonlyExclude';
    exports.FILES_READONLY_FROM_PERMISSIONS_CONFIG = 'files.readonlyFromPermissions';
    //#endregion
    //#region Utilities
    var FileKind;
    (function (FileKind) {
        FileKind[FileKind["FILE"] = 0] = "FILE";
        FileKind[FileKind["FOLDER"] = 1] = "FOLDER";
        FileKind[FileKind["ROOT_FOLDER"] = 2] = "ROOT_FOLDER";
    })(FileKind || (exports.FileKind = FileKind = {}));
    /**
     * A hint to disable etag checking for reading/writing.
     */
    exports.ETAG_DISABLED = '';
    function etag(stat) {
        if (typeof stat.size !== 'number' || typeof stat.mtime !== 'number') {
            return undefined;
        }
        return stat.mtime.toString(29) + stat.size.toString(31);
    }
    exports.etag = etag;
    async function whenProviderRegistered(file, fileService) {
        if (fileService.hasProvider(uri_1.URI.from({ scheme: file.scheme }))) {
            return;
        }
        return new Promise(resolve => {
            const disposable = fileService.onDidChangeFileSystemProviderRegistrations(e => {
                if (e.scheme === file.scheme && e.added) {
                    disposable.dispose();
                    resolve();
                }
            });
        });
    }
    exports.whenProviderRegistered = whenProviderRegistered;
    /**
     * Helper to format a raw byte size into a human readable label.
     */
    class ByteSize {
        static { this.KB = 1024; }
        static { this.MB = ByteSize.KB * ByteSize.KB; }
        static { this.GB = ByteSize.MB * ByteSize.KB; }
        static { this.TB = ByteSize.GB * ByteSize.KB; }
        static formatSize(size) {
            if (!(0, types_1.isNumber)(size)) {
                size = 0;
            }
            if (size < ByteSize.KB) {
                return (0, nls_1.localize)('sizeB', "{0}B", size.toFixed(0));
            }
            if (size < ByteSize.MB) {
                return (0, nls_1.localize)('sizeKB', "{0}KB", (size / ByteSize.KB).toFixed(2));
            }
            if (size < ByteSize.GB) {
                return (0, nls_1.localize)('sizeMB', "{0}MB", (size / ByteSize.MB).toFixed(2));
            }
            if (size < ByteSize.TB) {
                return (0, nls_1.localize)('sizeGB', "{0}GB", (size / ByteSize.GB).toFixed(2));
            }
            return (0, nls_1.localize)('sizeTB', "{0}TB", (size / ByteSize.TB).toFixed(2));
        }
    }
    exports.ByteSize = ByteSize;
    function getLargeFileConfirmationLimit(arg) {
        const isRemote = typeof arg === 'string' || arg?.scheme === network_1.Schemas.vscodeRemote;
        const isLocal = typeof arg !== 'string' && arg?.scheme === network_1.Schemas.file;
        if (isLocal) {
            // Local almost has no limit in file size
            return 1024 * ByteSize.MB;
        }
        if (isRemote) {
            // With a remote, pick a low limit to avoid
            // potentially costly file transfers
            return 10 * ByteSize.MB;
        }
        if (platform_1.isWeb) {
            // Web: we cannot know for sure if a cost
            // is associated with the file transfer
            // so we pick a reasonably small limit
            return 50 * ByteSize.MB;
        }
        // Local desktop: almost no limit in file size
        return 1024 * ByteSize.MB;
    }
    exports.getLargeFileConfirmationLimit = getLargeFileConfirmationLimit;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL2NvbW1vbi9maWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQmhHLGtDQUFrQztJQUVyQixRQUFBLFlBQVksR0FBRyxJQUFBLCtCQUFlLEVBQWUsYUFBYSxDQUFDLENBQUM7SUF3V3pFLFNBQWdCLHlCQUF5QixDQUFDLE9BQXlCO1FBQ2xFLE9BQU8sT0FBTyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUZELDhEQUVDO0lBOENELElBQVksUUF5Qlg7SUF6QkQsV0FBWSxRQUFRO1FBRW5COztXQUVHO1FBQ0gsNkNBQVcsQ0FBQTtRQUVYOztXQUVHO1FBQ0gsdUNBQVEsQ0FBQTtRQUVSOztXQUVHO1FBQ0gsaURBQWEsQ0FBQTtRQUViOzs7Ozs7V0FNRztRQUNILHdEQUFpQixDQUFBO0lBQ2xCLENBQUMsRUF6QlcsUUFBUSx3QkFBUixRQUFRLFFBeUJuQjtJQUVELElBQVksY0FjWDtJQWRELFdBQVksY0FBYztRQUV6Qjs7O1dBR0c7UUFDSCwyREFBWSxDQUFBO1FBRVo7Ozs7V0FJRztRQUNILHVEQUFVLENBQUE7SUFDWCxDQUFDLEVBZFcsY0FBYyw4QkFBZCxjQUFjLFFBY3pCO0lBaUZELFNBQWdCLG1CQUFtQixDQUFDLEtBQWM7UUFDakQsTUFBTSxTQUFTLEdBQUcsS0FBdUMsQ0FBQztRQUUxRCxPQUFPLENBQUMsQ0FBQyxTQUFTLElBQUksT0FBTyxTQUFTLENBQUMsV0FBVyxLQUFLLFVBQVUsQ0FBQztJQUNuRSxDQUFDO0lBSkQsa0RBSUM7SUFFRCxJQUFrQiw4QkFvRWpCO0lBcEVELFdBQWtCLDhCQUE4QjtRQUUvQzs7V0FFRztRQUNILG1GQUFRLENBQUE7UUFFUjs7V0FFRztRQUNILHFHQUFzQixDQUFBO1FBRXRCOztX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
//# sourceURL=../../../vs/platform/files/common/files.js
})
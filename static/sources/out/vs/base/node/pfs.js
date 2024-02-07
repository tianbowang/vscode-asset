/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "os", "util", "vs/base/common/async", "vs/base/common/extpath", "vs/base/common/normalization", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri"], function (require, exports, fs, os_1, util_1, async_1, extpath_1, normalization_1, path_1, platform_1, resources_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Promises = exports.writeFileSync = exports.configureFlushOnWrite = exports.SymlinkSupport = exports.whenDeleted = exports.readdirSync = exports.rimrafSync = exports.RimRafMode = void 0;
    //#region rimraf
    var RimRafMode;
    (function (RimRafMode) {
        /**
         * Slow version that unlinks each file and folder.
         */
        RimRafMode[RimRafMode["UNLINK"] = 0] = "UNLINK";
        /**
         * Fast version that first moves the file/folder
         * into a temp directory and then deletes that
         * without waiting for it.
         */
        RimRafMode[RimRafMode["MOVE"] = 1] = "MOVE";
    })(RimRafMode || (exports.RimRafMode = RimRafMode = {}));
    async function rimraf(path, mode = RimRafMode.UNLINK, moveToPath) {
        if ((0, extpath_1.isRootOrDriveLetter)(path)) {
            throw new Error('rimraf - will refuse to recursively delete root');
        }
        // delete: via rm
        if (mode === RimRafMode.UNLINK) {
            return rimrafUnlink(path);
        }
        // delete: via move
        return rimrafMove(path, moveToPath);
    }
    async function rimrafMove(path, moveToPath = (0, extpath_1.randomPath)((0, os_1.tmpdir)())) {
        try {
            try {
                // Intentionally using `fs.promises` here to skip
                // the patched graceful-fs method that can result
                // in very long running `rename` calls when the
                // folder is locked by a file watcher. We do not
                // really want to slow down this operation more
                // than necessary and we have a fallback to delete
                // via unlink.
                // https://github.com/microsoft/vscode/issues/139908
                await fs.promises.rename(path, moveToPath);
            }
            catch (error) {
                if (error.code === 'ENOENT') {
                    return; // ignore - path to delete did not exist
                }
                return rimrafUnlink(path); // otherwise fallback to unlink
            }
            // Delete but do not return as promise
            rimrafUnlink(moveToPath).catch(error => { });
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
    async function rimrafUnlink(path) {
        return (0, util_1.promisify)(fs.rm)(path, { recursive: true, force: true, maxRetries: 3 });
    }
    function rimrafSync(path) {
        if ((0, extpath_1.isRootOrDriveLetter)(path)) {
            throw new Error('rimraf - will refuse to recursively delete root');
        }
        fs.rmSync(path, { recursive: true, force: true, maxRetries: 3 });
    }
    exports.rimrafSync = rimrafSync;
    async function readdir(path, options) {
        return handleDirectoryChildren(await (options ? safeReaddirWithFileTypes(path) : (0, util_1.promisify)(fs.readdir)(path)));
    }
    async function safeReaddirWithFileTypes(path) {
        try {
            return await (0, util_1.promisify)(fs.readdir)(path, { withFileTypes: true });
        }
        catch (error) {
            console.warn('[node.js fs] readdir with filetypes failed with error: ', error);
        }
        // Fallback to manually reading and resolving each
        // children of the folder in case we hit an error
        // previously.
        // This can only really happen on exotic file systems
        // such as explained in #115645 where we get entries
        // from `readdir` that we can later not `lstat`.
        const result = [];
        const children = await readdir(path);
        for (const child of children) {
            let isFile = false;
            let isDirectory = false;
            let isSymbolicLink = false;
            try {
                const lstat = await exports.Promises.lstat((0, path_1.join)(path, child));
                isFile = lstat.isFile();
                isDirectory = lstat.isDirectory();
                isSymbolicLink = lstat.isSymbolicLink();
            }
            catch (error) {
                console.warn('[node.js fs] unexpected error from lstat after readdir: ', error);
            }
            result.push({
                name: child,
                isFile: () => isFile,
                isDirectory: () => isDirectory,
                isSymbolicLink: () => isSymbolicLink
            });
        }
        return result;
    }
    /**
     * Drop-in replacement of `fs.readdirSync` with support
     * for converting from macOS NFD unicon form to NFC
     * (https://github.com/nodejs/node/issues/2165)
     */
    function readdirSync(path) {
        return handleDirectoryChildren(fs.readdirSync(path));
    }
    exports.readdirSync = readdirSync;
    function handleDirectoryChildren(children) {
        return children.map(child => {
            // Mac: uses NFD unicode form on disk, but we want NFC
            // See also https://github.com/nodejs/node/issues/2165
            if (typeof child === 'string') {
                return platform_1.isMacintosh ? (0, normalization_1.normalizeNFC)(child) : child;
            }
            child.name = platform_1.isMacintosh ? (0, normalization_1.normalizeNFC)(child.name) : child.name;
            return child;
        });
    }
    /**
     * A convenience method to read all children of a path that
     * are directories.
     */
    async function readDirsInDir(dirPath) {
        const children = await readdir(dirPath);
        const directories = [];
        for (const child of children) {
            if (await SymlinkSupport.existsDirectory((0, path_1.join)(dirPath, child))) {
                directories.push(child);
            }
        }
        return directories;
    }
    //#endregion
    //#region whenDeleted()
    /**
     * A `Promise` that resolves when the provided `path`
     * is deleted from disk.
     */
    function whenDeleted(path, intervalMs = 1000) {
        return new Promise(resolve => {
            let running = false;
            const interval = setInterval(() => {
                if (!running) {
                    running = true;
                    fs.access(path, err => {
                        running = false;
                        if (err) {
                            clearInterval(interval);
                            resolve(undefined);
                        }
                    });
                }
            }, intervalMs);
        });
    }
    exports.whenDeleted = whenDeleted;
    //#endregion
    //#region Methods with symbolic links support
    var SymlinkSupport;
    (function (SymlinkSupport) {
        /**
         * Resolves the `fs.Stats` of the provided path. If the path is a
         * symbolic link, the `fs.Stats` will be from the target it points
         * to. If the target does not exist, `dangling: true` will be returned
         * as `symbolicLink` value.
         */
        async function stat(path) {
            // First stat the link
            let lstats;
            try {
                lstats = await exports.Promises.lstat(path);
                // Return early if the stat is not a symbolic link at all
                if (!lstats.isSymbolicLink()) {
                    return { stat: lstats };
                }
            }
            catch (error) {
                /* ignore - use stat() instead */
            }
            // If the stat is a symbolic link or failed to stat, use fs.stat()
            // which for symbolic links will stat the target they point to
            try {
                const stats = await exports.Promises.stat(path);
                return { stat: stats, symbolicLink: lstats?.isSymbolicLink() ? { dangling: false } : undefined };
            }
            catch (error) {
                // If the link points to a nonexistent file we still want
                // to return it as result while setting dangling: true flag
                if (error.code === 'ENOENT' && lstats) {
                    return { stat: lstats, symbolicLink: { dangling: true } };
                }
                // Windows: workaround a node.js bug where reparse points
                // are not supported (https://github.com/nodejs/node/issues/36790)
                if (platform_1.isWindows && error.code === 'EACCES') {
                    try {
                        const stats = await exports.Promises.stat(await exports.Promises.readlink(path));
                        return { stat: stats, symbolicLink: { dangling: false } };
                    }
                    catch (error) {
                        // If the link points to a nonexistent file we still want
                        // to return it as result while setting dangling: true flag
                        if (error.code === 'ENOENT' && lstats) {
                            return { stat: lstats, symbolicLink: { dangling: true } };
                        }
                        throw error;
                    }
                }
                throw error;
            }
        }
        SymlinkSupport.stat = stat;
        /**
         * Figures out if the `path` exists and is a file with support
         * for symlinks.
         *
         * Note: this will return `false` for a symlink that exists on
         * disk but is dangling (pointing to a nonexistent path).
         *
         * Use `exists` if you only care about the path existing on disk
         * or not without support for symbolic links.
         */
        async function existsFile(path) {
            try {
                const { stat, symbolicLink } = await SymlinkSupport.stat(path);
                return stat.isFile() && symbolicLink?.dangling !== true;
            }
            catch (error) {
                // Ignore, path might not exist
            }
            return false;
        }
        SymlinkSupport.existsFile = existsFile;
        /**
         * Figures out if the `path` exists and is a directory with support for
         * symlinks.
         *
         * Note: this will return `false` for a symlink that exists on
         * disk but is dangling (pointing to a nonexistent path).
         *
         * Use `exists` if you only care about the path existing on disk
         * or not without support for symbolic links.
         */
        async function existsDirectory(path) {
            try {
                const { stat, symbolicLink } = await SymlinkSupport.stat(path);
                return stat.isDirectory() && symbolicLink?.dangling !== true;
            }
            catch (error) {
                // Ignore, path might not exist
            }
            return false;
        }
        SymlinkSupport.existsDirectory = existsDirectory;
    })(SymlinkSupport || (exports.SymlinkSupport = SymlinkSupport = {}));
    //#endregion
    //#region Write File
    // According to node.js docs (https://nodejs.org/docs/v14.16.0/api/fs.html#fs_fs_writefile_file_data_options_callback)
    // it is not safe to call writeFile() on the same path multiple times without waiting for the callback to return.
    // Therefor we use a Queue on the path that is given to us to sequentialize calls to the same path properly.
    const writeQueues = new async_1.ResourceQueue();
    function writeFile(path, data, options) {
        return writeQueues.queueFor(uri_1.URI.file(path), () => {
            const ensuredOptions = ensureWriteOptions(options);
            return new Promise((resolve, reject) => doWriteFileAndFlush(path, data, ensuredOptions, error => error ? reject(error) : resolve()));
        }, resources_1.extUriBiasedIgnorePathCase);
    }
    let canFlush = true;
    function configureFlushOnWrite(enabled) {
        canFlush = enabled;
    }
    exports.configureFlushOnWrite = configureFlushOnWrite;
    // Calls fs.writeFile() followed by a fs.sync() call to flush the changes to disk
    // We do this in cases where we want to make sure the data is really on disk and
    // not in some cache.
    //
    // See https://github.com/nodejs/node/blob/v5.10.0/lib/fs.js#L1194
    function doWriteFileAndFlush(path, data, options, callback) {
        if (!canFlush) {
            return fs.writeFile(path, data, { mode: options.mode, flag: options.flag }, callback);
        }
        // Open the file with same flags and mode as fs.writeFile()
        fs.open(path, options.flag, options.mode, (openError, fd) => {
            if (openError) {
                return callback(openError);
            }
            // It is valid to pass a fd handle to fs.writeFile() and this will keep the handle open!
            fs.writeFile(fd, data, writeError => {
                if (writeError) {
                    return fs.close(fd, () => callback(writeError)); // still need to close the handle on error!
                }
                // Flush contents (not metadata) of the file to disk
                // https://github.com/microsoft/vscode/issues/9589
                fs.fdatasync(fd, (syncError) => {
                    // In some exotic setups it is well possible that node fails to sync
                    // In that case we disable flushing and warn to the console
                    if (syncError) {
                        console.warn('[node.js fs] fdatasync is now disabled for this session because it failed: ', syncError);
                        configureFlushOnWrite(false);
                    }
                    return fs.close(fd, closeError => callback(closeError));
                });
            });
        });
    }
    /**
     * Same as `fs.writeFileSync` but with an additional call to
     * `fs.fdatasyncSync` after writing to ensure changes are
     * flushed to disk.
     */
    function writeFileSync(path, data, options) {
        const ensuredOptions = ensureWriteOptions(options);
        if (!canFlush) {
            return fs.writeFileSync(path, data, { mode: ensuredOptions.mode, flag: ensuredOptions.flag });
        }
        // Open the file with same flags and mode as fs.writeFile()
        const fd = fs.openSync(path, ensuredOptions.flag, ensuredOptions.mode);
        try {
            // It is valid to pass a fd handle to fs.writeFile() and this will keep the handle open!
            fs.writeFileSync(fd, data);
            // Flush contents (not metadata) of the file to disk
            try {
                fs.fdatasyncSync(fd); // https://github.com/microsoft/vscode/issues/9589
            }
            catch (syncError) {
                console.warn('[node.js fs] fdatasyncSync is now disabled for this session because it failed: ', syncError);
                configureFlushOnWrite(false);
            }
        }
        finally {
            fs.closeSync(fd);
        }
    }
    exports.writeFileSync = writeFileSync;
    function ensureWriteOptions(options) {
        if (!options) {
            return { mode: 0o666 /* default node.js mode for files */, flag: 'w' };
        }
        return {
            mode: typeof options.mode === 'number' ? options.mode : 0o666 /* default node.js mode for files */,
            flag: typeof options.flag === 'string' ? options.flag : 'w'
        };
    }
    //#endregion
    //#region Move / Copy
    /**
     * A drop-in replacement for `fs.rename` that:
     * - allows to move across multiple disks
     * - attempts to retry the operation for certain error codes on Windows
     */
    async function rename(source, target, windowsRetryTimeout = 60000 /* matches graceful-fs */) {
        if (source === target) {
            return; // simulate node.js behaviour here and do a no-op if paths match
        }
        try {
            if (platform_1.isWindows && typeof windowsRetryTimeout === 'number') {
                // On Windows, a rename can fail when either source or target
                // is locked by AV software. We do leverage graceful-fs to iron
                // out these issues, however in case the target file exists,
                // graceful-fs will immediately return without retry for fs.rename().
                await renameWithRetry(source, target, Date.now(), windowsRetryTimeout);
            }
            else {
                await (0, util_1.promisify)(fs.rename)(source, target);
            }
        }
        catch (error) {
            // In two cases we fallback to classic copy and delete:
            //
            // 1.) The EXDEV error indicates that source and target are on different devices
            // In this case, fallback to using a copy() operation as there is no way to
            // rename() between different devices.
            //
            // 2.) The user tries to rename a file/folder that ends with a dot. This is not
            // really possible to move then, at least on UNC devices.
            if (source.toLowerCase() !== target.toLowerCase() && error.code === 'EXDEV' || source.endsWith('.')) {
                await copy(source, target, { preserveSymlinks: false /* copying to another device */ });
                await rimraf(source, RimRafMode.MOVE);
            }
            else {
                throw error;
            }
        }
    }
    async function renameWithRetry(source, target, startTime, retryTimeout, attempt = 0) {
        try {
            return await (0, util_1.promisify)(fs.rename)(source, target);
        }
        catch (error) {
            if (error.code !== 'EACCES' && error.code !== 'EPERM' && error.code !== 'EBUSY') {
                throw error; // only for errors we think are temporary
            }
            if (Date.now() - startTime >= retryTimeout) {
                console.error(`[node.js fs] rename failed after ${attempt} retries with error: ${error}`);
                throw error; // give up after configurable timeout
            }
            if (attempt === 0) {
                let abortRetry = false;
                try {
                    const { stat } = await SymlinkSupport.stat(target);
                    if (!stat.isFile()) {
                        abortRetry = true; // if target is not a file, EPERM error may be raised and we should not attempt to retry
                    }
                }
                catch (error) {
                    // Ignore
                }
                if (abortRetry) {
                    throw error;
                }
            }
            // Delay with incremental backoff up to 100ms
            await (0, async_1.timeout)(Math.min(100, attempt * 10));
            // Attempt again
            return renameWithRetry(source, target, startTime, retryTimeout, attempt + 1);
        }
    }
    /**
     * Recursively copies all of `source` to `target`.
     *
     * The options `preserveSymlinks` configures how symbolic
     * links should be handled when encountered. Set to
     * `false` to not preserve them and `true` otherwise.
     */
    async function copy(source, target, options) {
        return doCopy(source, target, { root: { source, target }, options, handledSourcePaths: new Set() });
    }
    // When copying a file or folder, we want to preserve the mode
    // it had and as such provide it when creating. However, modes
    // can go beyond what we expect (see link below), so we mask it.
    // (https://github.com/nodejs/node-v0.x-archive/issues/3045#issuecomment-4862588)
    const COPY_MODE_MASK = 0o777;
    async function doCopy(source, target, payload) {
        // Keep track of paths already copied to prevent
        // cycles from symbolic links to cause issues
        if (payload.handledSourcePaths.has(source)) {
            return;
        }
        else {
            payload.handledSourcePaths.add(source);
        }
        const { stat, symbolicLink } = await SymlinkSupport.stat(source);
        // Symlink
        if (symbolicLink) {
            // Try to re-create the symlink unless `preserveSymlinks: false`
            if (payload.options.preserveSymlinks) {
                try {
                    return await doCopySymlink(source, target, payload);
                }
                catch (error) {
                    // in any case of an error fallback to normal copy via dereferencing
                }
            }
            if (symbolicLink.dangling) {
                return; // skip dangling symbolic links from here on (https://github.com/microsoft/vscode/issues/111621)
            }
        }
        // Folder
        if (stat.isDirectory()) {
            return doCopyDirectory(source, target, stat.mode & COPY_MODE_MASK, payload);
        }
        // File or file-like
        else {
            return doCopyFile(source, target, stat.mode & COPY_MODE_MASK);
        }
    }
    async function doCopyDirectory(source, target, mode, payload) {
        // Create folder
        await exports.Promises.mkdir(target, { recursive: true, mode });
        // Copy each file recursively
        const files = await readdir(source);
        for (const file of files) {
            await doCopy((0, path_1.join)(source, file), (0, path_1.join)(target, file), payload);
        }
    }
    async function doCopyFile(source, target, mode) {
        // Copy file
        await exports.Promises.copyFile(source, target);
        // restore mode (https://github.com/nodejs/node/issues/1104)
        await exports.Promises.chmod(target, mode);
    }
    async function doCopySymlink(source, target, payload) {
        // Figure out link target
        let linkTarget = await exports.Promises.readlink(source);
        // Special case: the symlink points to a target that is
        // actually within the path that is being copied. In that
        // case we want the symlink to point to the target and
        // not the source
        if ((0, extpath_1.isEqualOrParent)(linkTarget, payload.root.source, !platform_1.isLinux)) {
            linkTarget = (0, path_1.join)(payload.root.target, linkTarget.substr(payload.root.source.length + 1));
        }
        // Create symlink
        await exports.Promises.symlink(linkTarget, target);
    }
    //#endregion
    //#region Promise based fs methods
    /**
     * Prefer this helper class over the `fs.promises` API to
     * enable `graceful-fs` to function properly. Given issue
     * https://github.com/isaacs/node-graceful-fs/issues/160 it
     * is evident that the module only takes care of the non-promise
     * based fs methods.
     *
     * Another reason is `realpath` being entirely different in
     * the promise based implementation compared to the other
     * one (https://github.com/microsoft/vscode/issues/118562)
     *
     * Note: using getters for a reason, since `graceful-fs`
     * patching might kick in later after modules have been
     * loaded we need to defer access to fs methods.
     * (https://github.com/microsoft/vscode/issues/124176)
     */
    exports.Promises = new class {
        //#region Implemented by node.js
        get access() { return (0, util_1.promisify)(fs.access); }
        get stat() { return (0, util_1.promisify)(fs.stat); }
        get lstat() { return (0, util_1.promisify)(fs.lstat); }
        get utimes() { return (0, util_1.promisify)(fs.utimes); }
        get read() {
            // Not using `promisify` here for a reason: the return
            // type is not an object as indicated by TypeScript but
            // just the bytes read, so we create our own wrapper.
            return (fd, buffer, offset, length, position) => {
                return new Promise((resolve, reject) => {
                    fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve({ bytesRead, buffer });
                    });
                });
            };
        }
        get readFile() { return (0, util_1.promisify)(fs.readFile); }
        get write() {
            // Not using `promisify` here for a reason: the return
            // type is not an object as indicated by TypeScript but
            // just the bytes written, so we create our own wrapper.
            return (fd, buffer, offset, length, position) => {
                return new Promise((resolve, reject) => {
                    fs.write(fd, buffer, offset, length, position, (err, bytesWritten, buffer) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve({ bytesWritten, buffer });
                    });
                });
            };
        }
        get appendFile() { return (0, util_1.promisify)(fs.appendFile); }
        get fdatasync() { return (0, util_1.promisify)(fs.fdatasync); }
        get truncate() { return (0, util_1.promisify)(fs.truncate); }
        get copyFile() { return (0, util_1.promisify)(fs.copyFile); }
        get open() { return (0, util_1.promisify)(fs.open); }
        get close() { return (0, util_1.promisify)(fs.close); }
        get symlink() { return (0, util_1.promisify)(fs.symlink); }
        get readlink() { return (0, util_1.promisify)(fs.readlink); }
        get chmod() { return (0, util_1.promisify)(fs.chmod); }
        get mkdir() { return (0, util_1.promisify)(fs.mkdir); }
        get unlink() { return (0, util_1.promisify)(fs.unlink); }
        get rmdir() { return (0, util_1.promisify)(fs.rmdir); }
        get realpath() { return (0, util_1.promisify)(fs.realpath); }
        //#endregion
        //#region Implemented by us
        async exists(path) {
            try {
                await exports.Promises.access(path);
                return true;
            }
            catch {
                return false;
            }
        }
        get readdir() { return readdir; }
        get readDirsInDir() { return readDirsInDir; }
        get writeFile() { return writeFile; }
        get rm() { return rimraf; }
        get rename() { return rename; }
        get copy() { return copy; }
    };
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGZzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL25vZGUvcGZzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxnQkFBZ0I7SUFFaEIsSUFBWSxVQWFYO0lBYkQsV0FBWSxVQUFVO1FBRXJCOztXQUVHO1FBQ0gsK0NBQU0sQ0FBQTtRQUVOOzs7O1dBSUc7UUFDSCwyQ0FBSSxDQUFBO0lBQ0wsQ0FBQyxFQWJXLFVBQVUsMEJBQVYsVUFBVSxRQWFyQjtJQWNELEtBQUssVUFBVSxNQUFNLENBQUMsSUFBWSxFQUFFLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLFVBQW1CO1FBQ2hGLElBQUksSUFBQSw2QkFBbUIsRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRUQsaUJBQWlCO1FBQ2pCLElBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQyxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQsbUJBQW1CO1FBQ25CLE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsS0FBSyxVQUFVLFVBQVUsQ0FBQyxJQUFZLEVBQUUsVUFBVSxHQUFHLElBQUEsb0JBQVUsRUFBQyxJQUFBLFdBQU0sR0FBRSxDQUFDO1FBQ3hFLElBQUksQ0FBQztZQUNKLElBQUksQ0FBQztnQkFDSixpREFBaUQ7Z0JBQ2pELGlEQUFpRDtnQkFDakQsK0NBQStDO2dCQUMvQyxnREFBZ0Q7Z0JBQ2hELCtDQUErQztnQkFDL0Msa0RBQWtEO2dCQUNsRCxjQUFjO2dCQUNkLG9EQUFvRDtnQkFDcEQsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLE1B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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings", "vs/base/node/pfs"], function (require, exports, fs, path_1, platform_1, strings_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.realpathSync = exports.realpath = exports.realcase = exports.realcaseSync = void 0;
    /**
     * Copied from: https://github.com/microsoft/vscode-node-debug/blob/master/src/node/pathUtilities.ts#L83
     *
     * Given an absolute, normalized, and existing file path 'realcase' returns the exact path that the file has on disk.
     * On a case insensitive file system, the returned path might differ from the original path by character casing.
     * On a case sensitive file system, the returned path will always be identical to the original path.
     * In case of errors, null is returned. But you cannot use this function to verify that a path exists.
     * realcaseSync does not handle '..' or '.' path segments and it does not take the locale into account.
     */
    function realcaseSync(path) {
        if (platform_1.isLinux) {
            // This method is unsupported on OS that have case sensitive
            // file system where the same path can exist in different forms
            // (see also https://github.com/microsoft/vscode/issues/139709)
            return path;
        }
        const dir = (0, path_1.dirname)(path);
        if (path === dir) { // end recursion
            return path;
        }
        const name = ((0, path_1.basename)(path) /* can be '' for windows drive letters */ || path).toLowerCase();
        try {
            const entries = (0, pfs_1.readdirSync)(dir);
            const found = entries.filter(e => e.toLowerCase() === name); // use a case insensitive search
            if (found.length === 1) {
                // on a case sensitive filesystem we cannot determine here, whether the file exists or not, hence we need the 'file exists' precondition
                const prefix = realcaseSync(dir); // recurse
                if (prefix) {
                    return (0, path_1.join)(prefix, found[0]);
                }
            }
            else if (found.length > 1) {
                // must be a case sensitive $filesystem
                const ix = found.indexOf(name);
                if (ix >= 0) { // case sensitive
                    const prefix = realcaseSync(dir); // recurse
                    if (prefix) {
                        return (0, path_1.join)(prefix, found[ix]);
                    }
                }
            }
        }
        catch (error) {
            // silently ignore error
        }
        return null;
    }
    exports.realcaseSync = realcaseSync;
    async function realcase(path) {
        if (platform_1.isLinux) {
            // This method is unsupported on OS that have case sensitive
            // file system where the same path can exist in different forms
            // (see also https://github.com/microsoft/vscode/issues/139709)
            return path;
        }
        const dir = (0, path_1.dirname)(path);
        if (path === dir) { // end recursion
            return path;
        }
        const name = ((0, path_1.basename)(path) /* can be '' for windows drive letters */ || path).toLowerCase();
        try {
            const entries = await pfs_1.Promises.readdir(dir);
            const found = entries.filter(e => e.toLowerCase() === name); // use a case insensitive search
            if (found.length === 1) {
                // on a case sensitive filesystem we cannot determine here, whether the file exists or not, hence we need the 'file exists' precondition
                const prefix = await realcase(dir); // recurse
                if (prefix) {
                    return (0, path_1.join)(prefix, found[0]);
                }
            }
            else if (found.length > 1) {
                // must be a case sensitive $filesystem
                const ix = found.indexOf(name);
                if (ix >= 0) { // case sensitive
                    const prefix = await realcase(dir); // recurse
                    if (prefix) {
                        return (0, path_1.join)(prefix, found[ix]);
                    }
                }
            }
        }
        catch (error) {
            // silently ignore error
        }
        return null;
    }
    exports.realcase = realcase;
    async function realpath(path) {
        try {
            // DO NOT USE `fs.promises.realpath` here as it internally
            // calls `fs.native.realpath` which will result in subst
            // drives to be resolved to their target on Windows
            // https://github.com/microsoft/vscode/issues/118562
            return await pfs_1.Promises.realpath(path);
        }
        catch (error) {
            // We hit an error calling fs.realpath(). Since fs.realpath() is doing some path normalization
            // we now do a similar normalization and then try again if we can access the path with read
            // permissions at least. If that succeeds, we return that path.
            // fs.realpath() is resolving symlinks and that can fail in certain cases. The workaround is
            // to not resolve links but to simply see if the path is read accessible or not.
            const normalizedPath = normalizePath(path);
            await pfs_1.Promises.access(normalizedPath, fs.constants.R_OK);
            return normalizedPath;
        }
    }
    exports.realpath = realpath;
    function realpathSync(path) {
        try {
            return fs.realpathSync(path);
        }
        catch (error) {
            // We hit an error calling fs.realpathSync(). Since fs.realpathSync() is doing some path normalization
            // we now do a similar normalization and then try again if we can access the path with read
            // permissions at least. If that succeeds, we return that path.
            // fs.realpath() is resolving symlinks and that can fail in certain cases. The workaround is
            // to not resolve links but to simply see if the path is read accessible or not.
            const normalizedPath = normalizePath(path);
            fs.accessSync(normalizedPath, fs.constants.R_OK); // throws in case of an error
            return normalizedPath;
        }
    }
    exports.realpathSync = realpathSync;
    function normalizePath(path) {
        return (0, strings_1.rtrim)((0, path_1.normalize)(path), path_1.sep);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cGF0aC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9ub2RlL2V4dHBhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHOzs7Ozs7OztPQVFHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFDLElBQVk7UUFDeEMsSUFBSSxrQkFBTyxFQUFFLENBQUM7WUFDYiw0REFBNEQ7WUFDNUQsK0RBQStEO1lBQy9ELCtEQUErRDtZQUMvRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixJQUFJLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQjtZQUNuQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxDQUFDLElBQUEsZUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDLHlDQUF5QyxJQUFJLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlGLElBQUksQ0FBQztZQUNKLE1BQU0sT0FBTyxHQUFHLElBQUEsaUJBQVcsRUFBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsZ0NBQWdDO1lBQzdGLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsd0lBQXdJO2dCQUN4SSxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBRyxVQUFVO2dCQUM5QyxJQUFJLE1BQU0sRUFBRSxDQUFDO29CQUNaLE9BQU8sSUFBQSxXQUFJLEVBQUMsTUFBTSxFQUFFLEtBQUss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
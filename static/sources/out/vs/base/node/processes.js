/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/processes", "vs/base/common/types", "vs/base/node/pfs"], function (require, exports, path, Platform, process, processes_1, Types, pfs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.win32 = exports.createQueuedSender = exports.getWindowsShell = exports.TerminateResponseCode = exports.Source = void 0;
    Object.defineProperty(exports, "Source", { enumerable: true, get: function () { return processes_1.Source; } });
    Object.defineProperty(exports, "TerminateResponseCode", { enumerable: true, get: function () { return processes_1.TerminateResponseCode; } });
    function getWindowsShell(env = process.env) {
        return env['comspec'] || 'cmd.exe';
    }
    exports.getWindowsShell = getWindowsShell;
    // Wrapper around process.send() that will queue any messages if the internal node.js
    // queue is filled with messages and only continue sending messages when the internal
    // queue is free again to consume messages.
    // On Windows we always wait for the send() method to return before sending the next message
    // to workaround https://github.com/nodejs/node/issues/7657 (IPC can freeze process)
    function createQueuedSender(childProcess) {
        let msgQueue = [];
        let useQueue = false;
        const send = function (msg) {
            if (useQueue) {
                msgQueue.push(msg); // add to the queue if the process cannot handle more messages
                return;
            }
            const result = childProcess.send(msg, (error) => {
                if (error) {
                    console.error(error); // unlikely to happen, best we can do is log this error
                }
                useQueue = false; // we are good again to send directly without queue
                // now send all the messages that we have in our queue and did not send yet
                if (msgQueue.length > 0) {
                    const msgQueueCopy = msgQueue.slice(0);
                    msgQueue = [];
                    msgQueueCopy.forEach(entry => send(entry));
                }
            });
            if (!result || Platform.isWindows /* workaround https://github.com/nodejs/node/issues/7657 */) {
                useQueue = true;
            }
        };
        return { send };
    }
    exports.createQueuedSender = createQueuedSender;
    var win32;
    (function (win32) {
        async function findExecutable(command, cwd, paths) {
            // If we have an absolute path then we take it.
            if (path.isAbsolute(command)) {
                return command;
            }
            if (cwd === undefined) {
                cwd = process.cwd();
            }
            const dir = path.dirname(command);
            if (dir !== '.') {
                // We have a directory and the directory is relative (see above). Make the path absolute
                // to the current working directory.
                return path.join(cwd, command);
            }
            if (paths === undefined && Types.isString(process.env['PATH'])) {
                paths = process.env['PATH'].split(path.delimiter);
            }
            // No PATH environment. Make path absolute to the cwd.
            if (paths === undefined || paths.length === 0) {
                return path.join(cwd, command);
            }
            async function fileExists(path) {
                if (await pfs.Promises.exists(path)) {
                    let statValue;
                    try {
                        statValue = await pfs.Promises.stat(path);
                    }
                    catch (e) {
                        if (e.message.startsWith('EACCES')) {
                            // it might be symlink
                            statValue = await pfs.Promises.lstat(path);
                        }
                    }
                    return statValue ? !statValue.isDirectory() : false;
                }
                return false;
            }
            // We have a simple file name. We get the path variable from the env
            // and try to find the executable on the path.
            for (const pathEntry of paths) {
                // The path entry is absolute.
                let fullPath;
                if (path.isAbsolute(pathEntry)) {
                    fullPath = path.join(pathEntry, command);
                }
                else {
                    fullPath = path.join(cwd, pathEntry, command);
                }
                if (await fileExists(fullPath)) {
                    return fullPath;
                }
                let withExtension = fullPath + '.com';
                if (await fileExists(withExtension)) {
                    return withExtension;
                }
                withExtension = fullPath + '.exe';
                if (await fileExists(withExtension)) {
                    return withExtension;
                }
            }
            return path.join(cwd, command);
        }
        win32.findExecutable = findExecutable;
    })(win32 || (exports.win32 = win32 = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL25vZGUvcHJvY2Vzc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVU3Qyx1RkFIYixrQkFBTSxPQUdhO0lBQXFCLHNHQUhBLGlDQUFxQixPQUdBO0lBT25HLFNBQWdCLGVBQWUsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFtQztRQUNoRixPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUM7SUFDcEMsQ0FBQztJQUZELDBDQUVDO0lBTUQscUZBQXFGO0lBQ3JGLHFGQUFxRjtJQUNyRiwyQ0FBMkM7SUFDM0MsNEZBQTRGO0lBQzVGLG9GQUFvRjtJQUNwRixTQUFnQixrQkFBa0IsQ0FBQyxZQUE2QjtRQUMvRCxJQUFJLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFDNUIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRXJCLE1BQU0sSUFBSSxHQUFHLFVBQVUsR0FBUTtZQUM5QixJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNkLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyw4REFBOEQ7Z0JBQ2xGLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFtQixFQUFFLEVBQUU7Z0JBQzdELElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLHVEQUF1RDtnQkFDOUUsQ0FBQztnQkFFRCxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsbURBQW1EO2dCQUVyRSwyRUFBMkU7Z0JBQzNFLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDekIsTUFBTSxZQUFZLEdB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
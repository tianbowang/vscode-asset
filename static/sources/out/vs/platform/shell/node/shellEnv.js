/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/path", "vs/nls", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/uuid", "vs/base/node/shell", "vs/platform/environment/node/argvHelper", "vs/base/common/async", "vs/base/common/numbers"], function (require, exports, child_process_1, path_1, nls_1, cancellation_1, errorMessage_1, errors_1, platform_1, uuid_1, shell_1, argvHelper_1, async_1, numbers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getResolvedShellEnv = void 0;
    let unixShellEnvPromise = undefined;
    /**
     * Resolves the shell environment by spawning a shell. This call will cache
     * the shell spawning so that subsequent invocations use that cached result.
     *
     * Will throw an error if:
     * - we hit a timeout of `MAX_SHELL_RESOLVE_TIME`
     * - any other error from spawning a shell to figure out the environment
     */
    async function getResolvedShellEnv(configurationService, logService, args, env) {
        // Skip if --force-disable-user-env
        if (args['force-disable-user-env']) {
            logService.trace('resolveShellEnv(): skipped (--force-disable-user-env)');
            return {};
        }
        // Skip on windows
        else if (platform_1.isWindows) {
            logService.trace('resolveShellEnv(): skipped (Windows)');
            return {};
        }
        // Skip if running from CLI already
        else if ((0, argvHelper_1.isLaunchedFromCli)(env) && !args['force-user-env']) {
            logService.trace('resolveShellEnv(): skipped (VSCODE_CLI is set)');
            return {};
        }
        // Otherwise resolve (macOS, Linux)
        else {
            if ((0, argvHelper_1.isLaunchedFromCli)(env)) {
                logService.trace('resolveShellEnv(): running (--force-user-env)');
            }
            else {
                logService.trace('resolveShellEnv(): running (macOS/Linux)');
            }
            // Call this only once and cache the promise for
            // subsequent calls since this operation can be
            // expensive (spawns a process).
            if (!unixShellEnvPromise) {
                unixShellEnvPromise = async_1.Promises.withAsyncBody(async (resolve, reject) => {
                    const cts = new cancellation_1.CancellationTokenSource();
                    let timeoutValue = 10000; // default to 10 seconds
                    const configuredTimeoutValue = configurationService.getValue('application.shellEnvironmentResolutionTimeout');
                    if (typeof configuredTimeoutValue === 'number') {
                        timeoutValue = (0, numbers_1.clamp)(configuredTimeoutValue, 1, 120) * 1000 /* convert from seconds */;
                    }
                    // Give up resolving shell env after some time
                    const timeout = setTimeout(() => {
                        cts.dispose(true);
                        reject(new Error((0, nls_1.localize)('resolveShellEnvTimeout', "Unable to resolve your shell environment in a reasonable time. Please review your shell configuration and restart.")));
                    }, timeoutValue);
                    // Resolve shell env and handle errors
                    try {
                        resolve(await doResolveUnixShellEnv(logService, cts.token));
                    }
                    catch (error) {
                        if (!(0, errors_1.isCancellationError)(error) && !cts.token.isCancellationRequested) {
                            reject(new Error((0, nls_1.localize)('resolveShellEnvError', "Unable to resolve your shell environment: {0}", (0, errorMessage_1.toErrorMessage)(error))));
                        }
                        else {
                            resolve({});
                        }
                    }
                    finally {
                        clearTimeout(timeout);
                        cts.dispose();
                    }
                });
            }
            return unixShellEnvPromise;
        }
    }
    exports.getResolvedShellEnv = getResolvedShellEnv;
    async function doResolveUnixShellEnv(logService, token) {
        const runAsNode = process.env['ELECTRON_RUN_AS_NODE'];
        logService.trace('getUnixShellEnvironment#runAsNode', runAsNode);
        const noAttach = process.env['ELECTRON_NO_ATTACH_CONSOLE'];
        logService.trace('getUnixShellEnvironment#noAttach', noAttach);
        const mark = (0, uuid_1.generateUuid)().replace(/-/g, '').substr(0, 12);
        const regex = new RegExp(mark + '({.*})' + mark);
        const env = {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1',
            ELECTRON_NO_ATTACH_CONSOLE: '1',
            VSCODE_RESOLVING_ENVIRONMENT: '1'
        };
        logService.trace('getUnixShellEnvironment#env', env);
        const systemShellUnix = await (0, shell_1.getSystemShell)(platform_1.OS, env);
        logService.trace('getUnixShellEnvironment#shell', systemShellUnix);
        return new Promise((resolve, reject) => {
            if (token.isCancellationRequested) {
                return reject(new errors_1.CancellationError());
            }
            // handle popular non-POSIX shells
            const name = (0, path_1.basename)(systemShellUnix);
            let command, shellArgs;
            const extraArgs = '';
            if (/^pwsh(-preview)?$/.test(name)) {
                // Older versions of PowerShell removes double quotes sometimes so we use "double single quotes" which is how
                // you escape single quotes inside of a single quoted string.
                command = `& '${process.execPath}' ${extraArgs} -p '''${mark}'' + JSON.stringify(process.env) + ''${mark}'''`;
                shellArgs = ['-Login', '-Command'];
            }
            else if (name === 'nu') { // nushell requires ^ before quoted path to treat it as a command
                command = `^'${process.execPath}' ${extraArgs} -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`;
                shellArgs = ['-i', '-l', '-c'];
            }
            else if (name === 'xonsh') { // #200374: native implementation is shorter
                command = `import os, json; print("${mark}", json.dumps(dict(os.environ)), "${mark}")`;
                shellArgs = ['-i', '-l', '-c'];
            }
            else {
                command = `'${process.execPath}' ${extraArgs} -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`;
                if (name === 'tcsh' || name === 'csh') {
                    shellArgs = ['-ic'];
                }
                else {
                    shellArgs = ['-i', '-l', '-c'];
                }
            }
            logService.trace('getUnixShellEnvironment#spawn', JSON.stringify(shellArgs), command);
            const child = (0, child_process_1.spawn)(systemShellUnix, [...shellArgs, command], {
                detached: true,
                stdio: ['ignore', 'pipe', 'pipe'],
                env
            });
            token.onCancellationRequested(() => {
                child.kill();
                return reject(new errors_1.CancellationError());
            });
            child.on('error', err => {
                logService.error('getUnixShellEnvironment#errorChildProcess', (0, errorMessage_1.toErrorMessage)(err));
                reject(err);
            });
            const buffers = [];
            child.stdout.on('data', b => buffers.push(b));
            const stderr = [];
            child.stderr.on('data', b => stderr.push(b));
            child.on('close', (code, signal) => {
                const raw = Buffer.concat(buffers).toString('utf8');
                logService.trace('getUnixShellEnvironment#raw', raw);
                const stderrStr = Buffer.concat(stderr).toString('utf8');
                if (stderrStr.trim()) {
                    logService.trace('getUnixShellEnvironment#stderr', stderrStr);
                }
                if (code || signal) {
                    return reject(new Error((0, nls_1.localize)('resolveShellEnvExitError', "Unexpected exit code from spawned shell (code {0}, signal {1})", code, signal)));
                }
                const match = regex.exec(raw);
                const rawStripped = match ? match[1] : '{}';
                try {
                    const env = JSON.parse(rawStripped);
                    if (runAsNode) {
                        env['ELECTRON_RUN_AS_NODE'] = runAsNode;
                    }
                    else {
                        delete env['ELECTRON_RUN_AS_NODE'];
                    }
                    if (noAttach) {
                        env['ELECTRON_NO_ATTACH_CONSOLE'] = noAttach;
                    }
                    else {
                        delete env['ELECTRON_NO_ATTACH_CONSOLE'];
                    }
                    delete env['VSCODE_RESOLVING_ENVIRONMENT'];
                    // https://github.com/microsoft/vscode/issues/22593#issuecomment-336050758
                    delete env['XDG_RUNTIME_DIR'];
                    logService.trace('getUnixShellEnvironment#result', env);
                    resolve(env);
                }
                catch (err) {
                    logService.error('getUnixShellEnvironment#errorCaught', (0, errorMessage_1.toErrorMessage)(err));
                    reject(err);
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGxFbnYuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3NoZWxsL25vZGUvc2hlbGxFbnYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxJQUFJLG1CQUFtQixHQUE0QyxTQUFTLENBQUM7SUFFN0U7Ozs7Ozs7T0FPRztJQUNJLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxvQkFBMkMsRUFBRSxVQUF1QixFQUFFLElBQXNCLEVBQUUsR0FBd0I7UUFFL0osbUNBQW1DO1FBQ25DLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQztZQUNwQyxVQUFVLENBQUMsS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7WUFFMUUsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsa0JBQWtCO2FBQ2IsSUFBSSxvQkFBUyxFQUFFLENBQUM7WUFDcEIsVUFBVSxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBRXpELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVELG1DQUFtQzthQUM5QixJQUFJLElBQUEsOEJBQWlCLEVBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1lBQzVELFVBQVUsQ0FBQyxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUVuRSxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFRCxtQ0FBbUM7YUFDOUIsQ0FBQztZQUNMLElBQUksSUFBQSw4QkFBaUIsRUFBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM1QixVQUFVLENBQUMsS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7WUFDbkUsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFVBQVUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lB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
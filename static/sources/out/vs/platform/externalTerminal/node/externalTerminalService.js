/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "child_process", "vs/base/common/decorators", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/processes", "vs/base/node/pfs", "vs/base/node/processes", "vs/nls", "vs/platform/externalTerminal/common/externalTerminal"], function (require, exports, cp, decorators_1, network_1, path, env, processes_1, pfs, processes, nls, externalTerminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinuxExternalTerminalService = exports.MacExternalTerminalService = exports.WindowsExternalTerminalService = void 0;
    const TERMINAL_TITLE = nls.localize('console.title', "VS Code Console");
    class ExternalTerminalService {
        async getDefaultTerminalForPlatforms() {
            return {
                windows: WindowsExternalTerminalService.getDefaultTerminalWindows(),
                linux: await LinuxExternalTerminalService.getDefaultTerminalLinuxReady(),
                osx: 'xterm'
            };
        }
    }
    class WindowsExternalTerminalService extends ExternalTerminalService {
        static { this.CMD = 'cmd.exe'; }
        openTerminal(configuration, cwd) {
            return this.spawnTerminal(cp, configuration, processes.getWindowsShell(), cwd);
        }
        spawnTerminal(spawner, configuration, command, cwd) {
            const exec = configuration.windowsExec || WindowsExternalTerminalService.getDefaultTerminalWindows();
            // Make the drive letter uppercase on Windows (see #9448)
            if (cwd && cwd[1] === ':') {
                cwd = cwd[0].toUpperCase() + cwd.substr(1);
            }
            // cmder ignores the environment cwd and instead opts to always open in %USERPROFILE%
            // unless otherwise specified
            const basename = path.basename(exec, '.exe').toLowerCase();
            if (basename === 'cmder') {
                spawner.spawn(exec, cwd ? [cwd] : undefined);
                return Promise.resolve(undefined);
            }
            const cmdArgs = ['/c', 'start', '/wait'];
            if (exec.indexOf(' ') >= 0) {
                // The "" argument is the window title. Without this, exec doesn't work when the path
                // contains spaces
                cmdArgs.push('""');
            }
            cmdArgs.push(exec);
            // Add starting directory parameter for Windows Terminal (see #90734)
            if (basename === 'wt') {
                cmdArgs.push('-d .');
            }
            return new Promise((c, e) => {
                const env = getSanitizedEnvironment(process);
                const child = spawner.spawn(command, cmdArgs, { cwd, env, detached: true });
                child.on('error', e);
                child.on('exit', () => c());
            });
        }
        async runInTerminal(title, dir, args, envVars, settings) {
            const exec = 'windowsExec' in settings && settings.windowsExec ? settings.windowsExec : WindowsExternalTerminalService.getDefaultTerminalWindows();
            const wt = await WindowsExternalTerminalService.getWtExePath();
            return new Promise((resolve, reject) => {
                const title = `"${dir} - ${TERMINAL_TITLE}"`;
                const command = `""${args.join('" "')}" & pause"`; // use '|' to only pause on non-zero exit code
                // merge environment variables into a copy of the process.env
                const env = Object.assign({}, getSanitizedEnvironment(process), envVars);
                // delete environment variables that have a null value
                Object.keys(env).filter(v => env[v] === null).forEach(key => delete env[key]);
                const options = {
                    cwd: dir,
                    env: env,
                    windowsVerbatimArguments: true
                };
                let spawnExec;
                let cmdArgs;
                if (path.basename(exec, '.exe') === 'wt') {
                    // Handle Windows Terminal specially; -d to set the cwd and run a cmd.exe instance
                    // inside it
                    spawnExec = exec;
                    cmdArgs = ['-d', '.', WindowsExternalTerminalService.CMD, '/c', command];
                }
                else if (wt) {
                    // prefer to use the window terminal to spawn if it's available instead
                    // of start, since that allows ctrl+c handling (#81322)
                    spawnExec = wt;
                    cmdArgs = ['-d', dir, exec, '/c', command];
                }
                else {
                    spawnExec = WindowsExternalTerminalService.CMD;
                    cmdArgs = ['/c', 'start', title, '/wait', exec, '/c', command];
                }
                const cmd = cp.spawn(spawnExec, cmdArgs, options);
                cmd.on('error', err => {
                    reject(improveError(err));
                });
                resolve(undefined);
            });
        }
        static getDefaultTerminalWindows() {
            if (!WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS) {
                const isWoW64 = !!process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
                WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS = `${process.env.windir ? process.env.windir : 'C:\\Windows'}\\${isWoW64 ? 'Sysnative' : 'System32'}\\cmd.exe`;
            }
            return WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS;
        }
        static async getWtExePath() {
            try {
                const wtPath = await processes.win32.findExecutable('wt');
                return await pfs.Promises.exists(wtPath) ? wtPath : undefined;
            }
            catch {
                return undefined;
            }
        }
    }
    exports.WindowsExternalTerminalService = WindowsExternalTerminalService;
    __decorate([
        decorators_1.memoize
    ], WindowsExternalTerminalService, "getWtExePath", null);
    class MacExternalTerminalService extends ExternalTerminalService {
        static { this.OSASCRIPT = '/usr/bin/osascript'; } // osascript is the AppleScript interpreter on OS X
        openTerminal(configuration, cwd) {
            return this.spawnTerminal(cp, configuration, cwd);
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const terminalApp = settings.osxExec || externalTerminal_1.DEFAULT_TERMINAL_OSX;
            return new Promise((resolve, reject) => {
                if (terminalApp === externalTerminal_1.DEFAULT_TERMINAL_OSX || terminalApp === 'iTerm.app') {
                    // On OS X we launch an AppleScript that creates (or reuses) a Terminal window
                    // and then launches the program inside that window.
                    const script = terminalApp === externalTerminal_1.DEFAULT_TERMINAL_OSX ? 'TerminalHelper' : 'iTermHelper';
                    const scriptpath = network_1.FileAccess.asFileUri(`vs/workbench/contrib/externalTerminal/node/${script}.scpt`).fsPath;
                    const osaArgs = [
                        scriptpath,
                        '-t', title || TERMINAL_TITLE,
                        '-w', dir,
                    ];
                    for (const a of args) {
                        osaArgs.push('-a');
                        osaArgs.push(a);
                    }
                    if (envVars) {
                        // merge environment variables into a copy of the process.env
                        const env = Object.assign({}, getSanitizedEnvironment(process), envVars);
                        for (const key in env) {
                            const value = env[key];
                            if (value === null) {
                                osaArgs.push('-u');
                                osaArgs.push(key);
                            }
                            else {
                                osaArgs.push('-e');
                                osaArgs.push(`${key}=${value}`);
                            }
                        }
                    }
                    let stderr = '';
                    const osa = cp.spawn(MacExternalTerminalService.OSASCRIPT, osaArgs);
                    osa.on('error', err => {
                        reject(improveError(err));
                    });
                    osa.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });
                    osa.on('exit', (code) => {
                        if (code === 0) { // OK
                            resolve(undefined);
                        }
                        else {
                            if (stderr) {
                                const lines = stderr.split('\n', 1);
                                reject(new Error(lines[0]));
                            }
                            else {
                                reject(new Error(nls.localize('mac.terminal.script.failed', "Script '{0}' failed with exit code {1}", script, code)));
                            }
                        }
                    });
                }
                else {
                    reject(new Error(nls.localize('mac.terminal.type.not.supported', "'{0}' not supported", terminalApp)));
                }
            });
        }
        spawnTerminal(spawner, configuration, cwd) {
            const terminalApp = configuration.osxExec || externalTerminal_1.DEFAULT_TERMINAL_OSX;
            return new Promise((c, e) => {
                const args = ['-a', terminalApp];
                if (cwd) {
                    args.push(cwd);
                }
                const env = getSanitizedEnvironment(process);
                const child = spawner.spawn('/usr/bin/open', args, { cwd, env });
                child.on('error', e);
                child.on('exit', () => c());
            });
        }
    }
    exports.MacExternalTerminalService = MacExternalTerminalService;
    class LinuxExternalTerminalService extends ExternalTerminalService {
        static { this.WAIT_MESSAGE = nls.localize('press.any.key', "Press any key to continue..."); }
        openTerminal(configuration, cwd) {
            return this.spawnTerminal(cp, configuration, cwd);
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const execPromise = settings.linuxExec ? Promise.resolve(settings.linuxExec) : LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
            return new Promise((resolve, reject) => {
                const termArgs = [];
                //termArgs.push('--title');
                //termArgs.push(`"${TERMINAL_TITLE}"`);
                execPromise.then(exec => {
                    if (exec.indexOf('gnome-terminal') >= 0) {
                        termArgs.push('-x');
                    }
                    else {
                        termArgs.push('-e');
                    }
                    termArgs.push('bash');
                    termArgs.push('-c');
                    const bashCommand = `${quote(args)}; echo; read -p "${LinuxExternalTerminalService.WAIT_MESSAGE}" -n1;`;
                    termArgs.push(`''${bashCommand}''`); // wrapping argument in two sets of ' because node is so "friendly" that it removes one set...
                    // merge environment variables into a copy of the process.env
                    const env = Object.assign({}, getSanitizedEnvironment(process), envVars);
                    // delete environment variables that have a null value
                    Object.keys(env).filter(v => env[v] === null).forEach(key => delete env[key]);
                    const options = {
                        cwd: dir,
                        env: env
                    };
                    let stderr = '';
                    const cmd = cp.spawn(exec, termArgs, options);
                    cmd.on('error', err => {
                        reject(improveError(err));
                    });
                    cmd.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });
                    cmd.on('exit', (code) => {
                        if (code === 0) { // OK
                            resolve(undefined);
                        }
                        else {
                            if (stderr) {
                                const lines = stderr.split('\n', 1);
                                reject(new Error(lines[0]));
                            }
                            else {
                                reject(new Error(nls.localize('linux.term.failed', "'{0}' failed with exit code {1}", exec, code)));
                            }
                        }
                    });
                });
            });
        }
        static async getDefaultTerminalLinuxReady() {
            if (!LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY) {
                if (!env.isLinux) {
                    LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = Promise.resolve('xterm');
                }
                else {
                    const isDebian = await pfs.Promises.exists('/etc/debian_version');
                    LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = new Promise(r => {
                        if (isDebian) {
                            r('x-terminal-emulator');
                        }
                        else if (process.env.DESKTOP_SESSION === 'gnome' || process.env.DESKTOP_SESSION === 'gnome-classic') {
                            r('gnome-terminal');
                        }
                        else if (process.env.DESKTOP_SESSION === 'kde-plasma') {
                            r('konsole');
                        }
                        else if (process.env.COLORTERM) {
                            r(process.env.COLORTERM);
                        }
                        else if (process.env.TERM) {
                            r(process.env.TERM);
                        }
                        else {
                            r('xterm');
                        }
                    });
                }
            }
            return LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY;
        }
        spawnTerminal(spawner, configuration, cwd) {
            const execPromise = configuration.linuxExec ? Promise.resolve(configuration.linuxExec) : LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
            return new Promise((c, e) => {
                execPromise.then(exec => {
                    const env = getSanitizedEnvironment(process);
                    const child = spawner.spawn(exec, [], { cwd, env });
                    child.on('error', e);
                    child.on('exit', () => c());
                });
            });
        }
    }
    exports.LinuxExternalTerminalService = LinuxExternalTerminalService;
    function getSanitizedEnvironment(process) {
        const env = { ...process.env };
        (0, processes_1.sanitizeProcessEnvironment)(env);
        return env;
    }
    /**
     * tries to turn OS errors into more meaningful error messages
     */
    function improveError(err) {
        if ('errno' in err && err['errno'] === 'ENOENT' && 'path' in err && typeof err['path'] === 'string') {
            return new Error(nls.localize('ext.term.app.not.found', "can't find terminal application '{0}'", err['path']));
        }
        return err;
    }
    /**
     * Quote args if necessary and combine into a space separated string.
     */
    function quote(args) {
        let r = '';
        for (const a of args) {
            if (a.indexOf(' ') >= 0) {
                r += '"' + a + '"';
            }
            else {
                r += a;
            }
            r += ' ';
        }
        return r;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxUZXJtaW5hbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVybmFsVGVybWluYWwvbm9kZS9leHRlcm5hbFRlcm1pbmFsU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7SUFjaEcsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUV4RSxNQUFlLHVCQUF1QjtRQUdyQyxLQUFLLENBQUMsOEJBQThCO1lBQ25DLE9BQU87Z0JBQ04sT0FBTyxFQUFFLDhCQUE4QixDQUFDLHlCQUF5QixFQUFFO2dCQUNuRSxLQUFLLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQyw0QkFBNEIsRUFBRTtnQkFDeEUsR0FBRyxFQUFFLE9BQU87YUFDWixDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBRUQsTUFBYSw4QkFBK0IsU0FBUSx1QkFBdUI7aUJBQ2xELFFBQUcsR0FBRyxTQUFTLENBQUM7UUFHakMsWUFBWSxDQUFDLGFBQXdDLEVBQUUsR0FBWTtZQUN6RSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsZUFBZSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUVNLGFBQWEsQ0FBQyxPQUFrQixFQUFFLGFBQXdDLEVBQUUsT0FBZSxFQUFFLEdBQVk7WUFDL0csTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLFdBQVcsSUFBSSw4QkFBOEIsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBRXJHLHlEQUF5RDtZQUN6RCxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQzNCLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxD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
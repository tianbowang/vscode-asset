/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/extpath", "vs/base/common/platform"], function (require, exports, cp, extpath_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prepareCommand = exports.hasChildProcesses = void 0;
    function spawnAsPromised(command, args) {
        return new Promise((resolve, reject) => {
            let stdout = '';
            const child = cp.spawn(command, args);
            if (child.pid) {
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
            }
            child.on('error', err => {
                reject(err);
            });
            child.on('close', code => {
                resolve(stdout);
            });
        });
    }
    async function hasChildProcesses(processId) {
        if (processId) {
            // if shell has at least one child process, assume that shell is busy
            if (platform.isWindows) {
                const windowsProcessTree = await new Promise((resolve_1, reject_1) => { require(['@vscode/windows-process-tree'], resolve_1, reject_1); });
                return new Promise(resolve => {
                    windowsProcessTree.getProcessTree(processId, processTree => {
                        resolve(!!processTree && processTree.children.length > 0);
                    });
                });
            }
            else {
                return spawnAsPromised('/usr/bin/pgrep', ['-lP', String(processId)]).then(stdout => {
                    const r = stdout.trim();
                    if (r.length === 0 || r.indexOf(' tmux') >= 0) { // ignore 'tmux'; see #43683
                        return false;
                    }
                    else {
                        return true;
                    }
                }, error => {
                    return true;
                });
            }
        }
        // fall back to safe side
        return Promise.resolve(true);
    }
    exports.hasChildProcesses = hasChildProcesses;
    var ShellType;
    (function (ShellType) {
        ShellType[ShellType["cmd"] = 0] = "cmd";
        ShellType[ShellType["powershell"] = 1] = "powershell";
        ShellType[ShellType["bash"] = 2] = "bash";
    })(ShellType || (ShellType = {}));
    function prepareCommand(shell, args, argsCanBeInterpretedByShell, cwd, env) {
        shell = shell.trim().toLowerCase();
        // try to determine the shell type
        let shellType;
        if (shell.indexOf('powershell') >= 0 || shell.indexOf('pwsh') >= 0) {
            shellType = 1 /* ShellType.powershell */;
        }
        else if (shell.indexOf('cmd.exe') >= 0) {
            shellType = 0 /* ShellType.cmd */;
        }
        else if (shell.indexOf('bash') >= 0) {
            shellType = 2 /* ShellType.bash */;
        }
        else if (platform.isWindows) {
            shellType = 0 /* ShellType.cmd */; // pick a good default for Windows
        }
        else {
            shellType = 2 /* ShellType.bash */; // pick a good default for anything else
        }
        let quote;
        // begin command with a space to avoid polluting shell history
        let command = ' ';
        switch (shellType) {
            case 1 /* ShellType.powershell */:
                quote = (s) => {
                    s = s.replace(/\'/g, '\'\'');
                    if (s.length > 0 && s.charAt(s.length - 1) === '\\') {
                        return `'${s}\\'`;
                    }
                    return `'${s}'`;
                };
                if (cwd) {
                    const driveLetter = (0, extpath_1.getDriveLetter)(cwd);
                    if (driveLetter) {
                        command += `${driveLetter}:; `;
                    }
                    command += `cd ${quote(cwd)}; `;
                }
                if (env) {
                    for (const key in env) {
                        const value = env[key];
                        if (value === null) {
                            command += `Remove-Item env:${key}; `;
                        }
                        else {
                            command += `\${env:${key}}='${value}'; `;
                        }
                    }
                }
                if (args.length > 0) {
                    const arg = args.shift();
                    const cmd = argsCanBeInterpretedByShell ? arg : quote(arg);
                    command += (cmd[0] === '\'') ? `& ${cmd} ` : `${cmd} `;
                    for (const a of args) {
                        command += (a === '<' || a === '>' || argsCanBeInterpretedByShell) ? a : quote(a);
                        command += ' ';
                    }
                }
                break;
            case 0 /* ShellType.cmd */:
                quote = (s) => {
                    // Note: Wrapping in cmd /C "..." complicates the escaping.
                    // cmd /C "node -e "console.log(process.argv)" """A^>0"""" # prints "A>0"
                    // cmd /C "node -e "console.log(process.argv)" "foo^> bar"" # prints foo> bar
                    // Outside of the cmd /C, it could be a simple quoting, but here, the ^ is needed too
                    s = s.replace(/\"/g, '""');
                    s = s.replace(/([><!^&|])/g, '^$1');
                    return (' "'.split('').some(char => s.includes(char)) || s.length === 0) ? `"${s}"` : s;
                };
                if (cwd) {
                    const driveLetter = (0, extpath_1.getDriveLetter)(cwd);
                    if (driveLetter) {
                        command += `${driveLetter}: && `;
                    }
                    command += `cd ${quote(cwd)} && `;
                }
                if (env) {
                    command += 'cmd /C "';
                    for (const key in env) {
                        let value = env[key];
                        if (value === null) {
                            command += `set "${key}=" && `;
                        }
                        else {
                            value = value.replace(/[&^|<>]/g, s => `^${s}`);
                            command += `set "${key}=${value}" && `;
                        }
                    }
                }
                for (const a of args) {
                    command += (a === '<' || a === '>' || argsCanBeInterpretedByShell) ? a : quote(a);
                    command += ' ';
                }
                if (env) {
                    command += '"';
                }
                break;
            case 2 /* ShellType.bash */: {
                quote = (s) => {
                    s = s.replace(/(["'\\\$!><#()\[\]*&^| ;{}`])/g, '\\$1');
                    return s.length === 0 ? `""` : s;
                };
                const hardQuote = (s) => {
                    return /[^\w@%\/+=,.:^-]/.test(s) ? `'${s.replace(/'/g, '\'\\\'\'')}'` : s;
                };
                if (cwd) {
                    command += `cd ${quote(cwd)} ; `;
                }
                if (env) {
                    command += '/usr/bin/env';
                    for (const key in env) {
                        const value = env[key];
                        if (value === null) {
                            command += ` -u ${hardQuote(key)}`;
                        }
                        else {
                            command += ` ${hardQuote(`${key}=${value}`)}`;
                        }
                    }
                    command += ' ';
                }
                for (const a of args) {
                    command += (a === '<' || a === '>' || argsCanBeInterpretedByShell) ? a : quote(a);
                    command += ' ';
                }
                break;
            }
        }
        return command;
    }
    exports.prepareCommand = prepareCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9ub2RlL3Rlcm1pbmFscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsU0FBUyxlQUFlLENBQUMsT0FBZSxFQUFFLElBQWM7UUFDdkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN0QyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDaEIsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdEMsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2YsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7b0JBQ3hDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUNELEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQztZQUNILEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUN4QixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFTSxLQUFLLFVBQVUsaUJBQWlCLENBQUMsU0FBNkI7UUFDcEUsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUVmLHFFQUFxRTtZQUNyRSxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztn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
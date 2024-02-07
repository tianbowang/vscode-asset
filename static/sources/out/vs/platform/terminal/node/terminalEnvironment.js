/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/strings", "vs/base/common/types", "vs/base/node/pfs", "vs/platform/terminal/common/environmentVariable", "vs/platform/terminal/common/environmentVariableShared", "vs/platform/terminal/common/environmentVariableCollection"], function (require, exports, os, network_1, objects_1, path, platform_1, process, strings_1, types_1, pfs, environmentVariable_1, environmentVariableShared_1, environmentVariableCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getShellIntegrationInjection = exports.findExecutable = exports.getWindowsBuildNumber = void 0;
    function getWindowsBuildNumber() {
        const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(os.release());
        let buildNumber = 0;
        if (osVersion && osVersion.length === 4) {
            buildNumber = parseInt(osVersion[3]);
        }
        return buildNumber;
    }
    exports.getWindowsBuildNumber = getWindowsBuildNumber;
    async function findExecutable(command, cwd, paths, env = process.env, exists = pfs.Promises.exists) {
        // If we have an absolute path then we take it.
        if (path.isAbsolute(command)) {
            return await exists(command) ? command : undefined;
        }
        if (cwd === undefined) {
            cwd = process.cwd();
        }
        const dir = path.dirname(command);
        if (dir !== '.') {
            // We have a directory and the directory is relative (see above). Make the path absolute
            // to the current working directory.
            const fullPath = path.join(cwd, command);
            return await exists(fullPath) ? fullPath : undefined;
        }
        const envPath = (0, objects_1.getCaseInsensitive)(env, 'PATH');
        if (paths === undefined && (0, types_1.isString)(envPath)) {
            paths = envPath.split(path.delimiter);
        }
        // No PATH environment. Make path absolute to the cwd.
        if (paths === undefined || paths.length === 0) {
            const fullPath = path.join(cwd, command);
            return await exists(fullPath) ? fullPath : undefined;
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
            if (await exists(fullPath)) {
                return fullPath;
            }
            if (platform_1.isWindows) {
                let withExtension = fullPath + '.com';
                if (await exists(withExtension)) {
                    return withExtension;
                }
                withExtension = fullPath + '.exe';
                if (await exists(withExtension)) {
                    return withExtension;
                }
            }
        }
        const fullPath = path.join(cwd, command);
        return await exists(fullPath) ? fullPath : undefined;
    }
    exports.findExecutable = findExecutable;
    /**
     * For a given shell launch config, returns arguments to replace and an optional environment to
     * mixin to the SLC's environment to enable shell integration. This must be run within the context
     * that creates the process to ensure accuracy. Returns undefined if shell integration cannot be
     * enabled.
     */
    function getShellIntegrationInjection(shellLaunchConfig, options, env, logService, productService) {
        // Shell integration arg injection is disabled when:
        // - The global setting is disabled
        // - There is no executable (not sure what script to run)
        // - The terminal is used by a feature like tasks or debugging
        const useWinpty = platform_1.isWindows && (!options.windowsEnableConpty || getWindowsBuildNumber() < 18309);
        if (!options.shellIntegration.enabled || !shellLaunchConfig.executable || shellLaunchConfig.isFeatureTerminal || shellLaunchConfig.hideFromUser || shellLaunchConfig.ignoreShellIntegration || useWinpty) {
            return undefined;
        }
        const originalArgs = shellLaunchConfig.args;
        const shell = process.platform === 'win32' ? path.basename(shellLaunchConfig.executable).toLowerCase() : path.basename(shellLaunchConfig.executable);
        const appRoot = path.dirname(network_1.FileAccess.asFileUri('').fsPath);
        let newArgs;
        const envMixin = {
            'VSCODE_INJECTION': '1'
        };
        if (options.shellIntegration.nonce) {
            envMixin['VSCODE_NONCE'] = options.shellIntegration.nonce;
        }
        // Windows
        if (platform_1.isWindows) {
            if (shell === 'pwsh.exe' || shell === 'powershell.exe') {
                if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.WindowsPwsh);
                }
                else if (arePwshLoginArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.WindowsPwshLogin);
                }
                if (!newArgs) {
                    return undefined;
                }
                newArgs = [...newArgs]; // Shallow clone the array to avoid setting the default array
                newArgs[newArgs.length - 1] = (0, strings_1.format)(newArgs[newArgs.length - 1], appRoot, '');
                if (options.shellIntegration.suggestEnabled) {
                    envMixin['VSCODE_SUGGEST'] = '1';
                }
                return { newArgs, envMixin };
            }
            logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
            return undefined;
        }
        // Linux & macOS
        switch (shell) {
            case 'bash': {
                if (!originalArgs || originalArgs.length === 0) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Bash);
                }
                else if (areZshBashLoginArgs(originalArgs)) {
                    envMixin['VSCODE_SHELL_LOGIN'] = '1';
                    addEnvMixinPathPrefix(options, envMixin);
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Bash);
                }
                if (!newArgs) {
                    return undefined;
                }
                newArgs = [...newArgs]; // Shallow clone the array to avoid setting the default array
                newArgs[newArgs.length - 1] = (0, strings_1.format)(newArgs[newArgs.length - 1], appRoot);
                return { newArgs, envMixin };
            }
            case 'fish': {
                // The injection mechanism used for fish is to add a custom dir to $XDG_DATA_DIRS which
                // is similar to $ZDOTDIR in zsh but contains a list of directories to run from.
                const oldDataDirs = env?.XDG_DATA_DIRS ?? '/usr/local/share:/usr/share';
                const newDataDir = path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/fish_xdg_data');
                envMixin['XDG_DATA_DIRS'] = `${oldDataDirs}:${newDataDir}`;
                addEnvMixinPathPrefix(options, envMixin);
                return { newArgs: undefined, envMixin };
            }
            case 'pwsh': {
                if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Pwsh);
                }
                else if (arePwshLoginArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.PwshLogin);
                }
                if (!newArgs) {
                    return undefined;
                }
                if (options.shellIntegration.suggestEnabled) {
                    envMixin['VSCODE_SUGGEST'] = '1';
                }
                newArgs = [...newArgs]; // Shallow clone the array to avoid setting the default array
                newArgs[newArgs.length - 1] = (0, strings_1.format)(newArgs[newArgs.length - 1], appRoot, '');
                return { newArgs, envMixin };
            }
            case 'zsh': {
                if (!originalArgs || originalArgs.length === 0) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Zsh);
                }
                else if (areZshBashLoginArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.ZshLogin);
                    addEnvMixinPathPrefix(options, envMixin);
                }
                else if (originalArgs === shellIntegrationArgs.get(ShellIntegrationExecutable.Zsh) || originalArgs === shellIntegrationArgs.get(ShellIntegrationExecutable.ZshLogin)) {
                    newArgs = originalArgs;
                }
                if (!newArgs) {
                    return undefined;
                }
                newArgs = [...newArgs]; // Shallow clone the array to avoid setting the default array
                newArgs[newArgs.length - 1] = (0, strings_1.format)(newArgs[newArgs.length - 1], appRoot);
                // Move .zshrc into $ZDOTDIR as the way to activate the script
                let username;
                try {
                    username = os.userInfo().username;
                }
                catch {
                    username = 'unknown';
                }
                const zdotdir = path.join(os.tmpdir(), `${username}-${productService.applicationName}-zsh`);
                envMixin['ZDOTDIR'] = zdotdir;
                const userZdotdir = env?.ZDOTDIR ?? os.homedir() ?? `~`;
                envMixin['USER_ZDOTDIR'] = userZdotdir;
                const filesToCopy = [];
                filesToCopy.push({
                    source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-rc.zsh'),
                    dest: path.join(zdotdir, '.zshrc')
                });
                filesToCopy.push({
                    source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-profile.zsh'),
                    dest: path.join(zdotdir, '.zprofile')
                });
                filesToCopy.push({
                    source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-env.zsh'),
                    dest: path.join(zdotdir, '.zshenv')
                });
                filesToCopy.push({
                    source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-login.zsh'),
                    dest: path.join(zdotdir, '.zlogin')
                });
                return { newArgs, envMixin, filesToCopy };
            }
        }
        logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
        return undefined;
    }
    exports.getShellIntegrationInjection = getShellIntegrationInjection;
    /**
     * On macOS the profile calls path_helper which adds a bunch of standard bin directories to the
     * beginning of the PATH. This causes significant problems for the environment variable
     * collection API as the custom paths added to the end will now be somewhere in the middle of
     * the PATH. To combat this, VSCODE_PATH_PREFIX is used to re-apply any prefix after the profile
     * has run. This will cause duplication in the PATH but should fix the issue.
     *
     * See #99878 for more information.
     */
    function addEnvMixinPathPrefix(options, envMixin) {
        if (platform_1.isMacintosh && options.environmentVariableCollections) {
            // Deserialize and merge
            const deserialized = (0, environmentVariableShared_1.deserializeEnvironmentVariableCollections)(options.environmentVariableCollections);
            const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(deserialized);
            // Get all prepend PATH entries
            const pathEntry = merged.getVariableMap({ workspaceFolder: options.workspaceFolder }).get('PATH');
            const prependToPath = [];
            if (pathEntry) {
                for (const mutator of pathEntry) {
                    if (mutator.type === environmentVariable_1.EnvironmentVariableMutatorType.Prepend) {
                        prependToPath.push(mutator.value);
                    }
                }
            }
            // Add to the environment mixin to be applied in the shell integration script
            if (prependToPath.length > 0) {
                envMixin['VSCODE_PATH_PREFIX'] = prependToPath.join('');
            }
        }
    }
    var ShellIntegrationExecutable;
    (function (ShellIntegrationExecutable) {
        ShellIntegrationExecutable["WindowsPwsh"] = "windows-pwsh";
        ShellIntegrationExecutable["WindowsPwshLogin"] = "windows-pwsh-login";
        ShellIntegrationExecutable["Pwsh"] = "pwsh";
        ShellIntegrationExecutable["PwshLogin"] = "pwsh-login";
        ShellIntegrationExecutable["Zsh"] = "zsh";
        ShellIntegrationExecutable["ZshLogin"] = "zsh-login";
        ShellIntegrationExecutable["Bash"] = "bash";
    })(ShellIntegrationExecutable || (ShellIntegrationExecutable = {}));
    const shellIntegrationArgs = new Map();
    // The try catch swallows execution policy errors in the case of the archive distributable
    shellIntegrationArgs.set(ShellIntegrationExecutable.WindowsPwsh, ['-noexit', '-command', 'try { . \"{0}\\out\\vs\\workbench\\contrib\\terminal\\browser\\media\\shellIntegration.ps1\" } catch {}{1}']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.WindowsPwshLogin, ['-l', '-noexit', '-command', 'try { . \"{0}\\out\\vs\\workbench\\contrib\\terminal\\browser\\media\\shellIntegration.ps1\" } catch {}{1}']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.Pwsh, ['-noexit', '-command', '. "{0}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration.ps1"{1}']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.PwshLogin, ['-l', '-noexit', '-command', '. "{0}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration.ps1"']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.Zsh, ['-i']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.ZshLogin, ['-il']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.Bash, ['--init-file', '{0}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration-bash.sh']);
    const loginArgs = ['-login', '-l'];
    const pwshImpliedArgs = ['-nol', '-nologo'];
    function arePwshLoginArgs(originalArgs) {
        if (typeof originalArgs === 'string') {
            return loginArgs.includes(originalArgs.toLowerCase());
        }
        else {
            return originalArgs.length === 1 && loginArgs.includes(originalArgs[0].toLowerCase()) ||
                (originalArgs.length === 2 &&
                    (((loginArgs.includes(originalArgs[0].toLowerCase())) || loginArgs.includes(originalArgs[1].toLowerCase())))
                    && ((pwshImpliedArgs.includes(originalArgs[0].toLowerCase())) || pwshImpliedArgs.includes(originalArgs[1].toLowerCase())));
        }
    }
    function arePwshImpliedArgs(originalArgs) {
        if (typeof originalArgs === 'string') {
            return pwshImpliedArgs.includes(originalArgs.toLowerCase());
        }
        else {
            return originalArgs.length === 0 || originalArgs?.length === 1 && pwshImpliedArgs.includes(originalArgs[0].toLowerCase());
        }
    }
    function areZshBashLoginArgs(originalArgs) {
        return originalArgs === 'string' && loginArgs.includes(originalArgs.toLowerCase())
            || typeof originalArgs !== 'string' && originalArgs.length === 1 && loginArgs.includes(originalArgs[0].toLowerCase());
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbnZpcm9ubWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvbm9kZS90ZXJtaW5hbEVudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsU0FBZ0IscUJBQXFCO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDOUQsSUFBSSxXQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQzVCLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDekMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQVBELHNEQU9DO0lBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxPQUFlLEVBQUUsR0FBWSxFQUFFLEtBQWdCLEVBQUUsTUFBMkIsT0FBTyxDQUFDLEdBQTBCLEVBQUUsU0FBNkMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNO1FBQ3BOLCtDQUErQztRQUMvQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM5QixPQUFPLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNwRCxDQUFDO1FBQ0QsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdkIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNqQix3RkFBd0Y7WUFDeEYsb0NBQW9DO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3RELENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxJQUFBLDRCQUFrQixFQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRCxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksSUFBQSxnQkFBUSxFQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDOUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxzREFBc0Q7UUFDdEQsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDL0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekMsT0FBTyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDdEQsQ0FBQztRQUNELG9FQUFvRTtRQUNwRSw4Q0FBOEM7UUFDOUMsS0FBSyxNQUFNLFNBQVMsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUMvQiw4QkFBOEI7WUFDOUIsSUFBSSxRQUFnQixDQUFDO1lBQ3JCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDMUMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0MsQ0FBQztZQUVELElBQUksTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxRQUFRLENBQUM7WUFDakIsQ0FBQztZQUNELElBQUksb0JBQVMsRUFBRSxDQUFDO2dCQUNmLElBQUksYUFBYSxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUM7Z0JBQ3RDLElBQUksTUFBTSxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztvQkFDakMsT0FBTyxhQUFhLENBQUM7Z0JBQ3RCLENBQUM7Z0JBQ0QsYUFBYSxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUM7Z0JBQ2xDLElBQUksTUFBTSxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztvQkFDakMsT0FBTyxhQUFhLENBQUM7Z0JBQ3RCLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3RELENBQUM7SUFuREQsd0NBbURDO0lBb0JEOzs7OztPQUtHO0lBQ0gsU0FBZ0IsNEJBQTRCLENBQzNDLGlCQUFxQyxFQUNyQyxPQUFnQyxFQUNoQyxHQUFxQyxFQUNyQyxVQUF1QixFQUN2QixjQUErQjtRQUUvQixvREFBb0Q7UUFDcEQsbUNBQW1DO1FBQ25DLHlEQUF5RDtRQUN6RCw4REFBOEQ7UUFDOUQsTUFBTSxTQUFTLEdBQUcsb0JBQVMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixJQUFJLHFCQUFxQixFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDakcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLElBQUksaUJBQWlCLENBQUMsaUJBQWlCLElBQUksaUJBQWlCLENBQUMsWUFBWSxJQUFJLGlCQUFpQixDQUFDLHNCQUFzQixJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQzFNLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7UUFDNUMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckosTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5RCxJQUFJLE9BQTZCLENBQUM7UUFDbEMsTUFBTSxRQUFRLEdBQXdCO1lBQ3JDLGtCQUFrQixFQUFFLEdBQUc7U0FDdkIsQ0FBQztRQUVGLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BDLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1FBQzNELENBQUM7UUFFRCxVQUFVO1FBQ1YsSUFBSSxvQkFBUyxFQUFFLENBQUM7WUFDZixJQUFJLEtBQUssS0FBSyxVQUFVLElBQUksS0FBSyxLQUFLLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxZQUFZLElBQUksa0JBQWtCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztvQkFDdkQsT0FBTyxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDNUUsQ0FBQztxQkFBTSxJQUFJLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7b0JBQzNDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDakYsQ0FBQztnQkFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2QsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUM7Z0JBQ0QsT0FBTyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLDZEQUE2RDtnQkFDckYsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBQSxnQkFBTSxFQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDL0UsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQzdDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDbEMsQ0FBQztnQkFDRCxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQzlCLENBQUM7WUFDRCxVQUFVLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxpQkFBaUIsQ0FBQyxVQUFVLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6SSxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsZ0JBQWdCO1FBQ2hCLFFBQVEsS0FBSyxFQUFFLENBQUM7WUFDZixLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNoRCxPQUFPLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyRSxDQUFDO3FCQUFNLElBQUksbUJBQW1CLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztvQkFDOUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsR0FBRyxDQUFDO29CQUNyQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ3pDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNkLE9BQU8sU0FBUyxDQUFDO2dCQUNsQixDQUFDO2dCQUNELE9BQU8sR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyw2REFBNkQ7Z0JBQ3JGLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUEsZ0JBQU0sRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDM0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUM5QixDQUFDO1lBQ0QsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNiLHVGQUF1RjtnQkFDdkYsZ0ZBQWdGO2dCQUNoRixNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUUsYUFBYSxJQUFJLDZCQUE2QixDQUFDO2dCQUN4RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSwrREFBK0QsQ0FBQyxDQUFDO2dCQUN2RyxRQUFRLENBQUMsZUFBZSxDQUFDLEdBQUcsR0FBRyxXQUFXLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQzNELHFCQUFxQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDekMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDekMsQ0FBQztZQUNELEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDYixJQUFJLENBQUMsWUFBWSxJQUFJLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7b0JBQ3ZELE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLENBQUM7cUJBQU0sSUFBSSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO29CQUMzQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMxRSxDQUFDO2dCQUNELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDZCxPQUFPLFNBQVMsQ0FBQztnQkFDbEIsQ0FBQztnQkFDRCxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDN0MsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsR0FBRyxDQUFDO2dCQUNsQyxDQUFDO2dCQUNELE9BQU8sR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyw2REFBNkQ7Z0JBQ3JGLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUEsZ0JBQU0sRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQy9FLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDOUIsQ0FBQztZQUNELEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDWixJQUFJLENBQUMsWUFBWSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ2hELE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BFLENBQUM7cUJBQU0sSUFBSSxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO29CQUM5QyxPQUFPLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN4RSxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzFDLENBQUM7cUJBQU0sSUFBSSxZQUFZLEtBQUssb0JBQW9CLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxJQUFJLFlBQVksS0FBSyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDeEssT0FBTyxHQUFHLFlBQVksQ0FBQztnQkFDeEIsQ0FBQztnQkFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2QsT0FBTyxTQUFTLENBQUM7Z0JBQ2xCLENBQUM7Z0JBQ0QsT0FBTyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLDZEQUE2RDtnQkFDckYsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBQSxnQkFBTSxFQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUUzRSw4REFBOEQ7Z0JBQzlELElBQUksUUFBZ0IsQ0FBQztnQkFDckIsSUFBSSxDQUFDO29CQUNKLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQUNuQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztvQkFDUixRQUFRLEdBQUcsU0FBUyxDQUFDO2dCQUN0QixDQUFDO2dCQUNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsUUFBUSxJQUFJLGNBQWMsQ0FBQyxlQUFlLE1BQU0sQ0FBQyxDQUFDO2dCQUM1RixRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDO2dCQUM5QixNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLENBQUM7Z0JBQ3hELFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxXQUFXLENBQUM7Z0JBQ3ZDLE1BQU0sV0FBVyxHQUFvRCxFQUFFLENBQUM7Z0JBQ3hFLFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx5RUFBeUUsQ0FBQztvQkFDckcsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztpQkFDbEMsQ0FBQyxDQUFDO2dCQUNILFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSw4RUFBOEUsQ0FBQztvQkFDMUcsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztpQkFDckMsQ0FBQyxDQUFDO2dCQUNILFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSwwRUFBMEUsQ0FBQztvQkFDdEcsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztpQkFDbkMsQ0FBQyxDQUFDO2dCQUNILFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSw0RUFBNEUsQ0FBQztvQkFDeEcsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztpQkFDbkMsQ0FBQyxDQUFDO2dCQUNILE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQzNDLENBQUM7UUFDRixDQUFDO1FBQ0QsVUFBVSxDQUFDLElBQUksQ0FBQyx1REFBdUQsaUJBQWlCLENBQUMsVUFBVSxZQUFZLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekksT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQTVJRCxvRUE0SUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILFNBQVMscUJBQXFCLENBQUMsT0FBZ0MsRUFBRSxRQUE2QjtRQUM3RixJQUFJLHNCQUFXLElBQUksT0FBTyxDQUFDLDhCQUE4QixFQUFFLENBQUM7WUFDM0Qsd0JBQXdCO1lBQ3hCLE1BQU0sWUFBWSxHQUFHLElBQUEscUVBQXlDLEVBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDdkcsTUFBTSxNQUFNLEdBQUcsSUFBSSxtRUFBbUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVyRSwrQkFBK0I7WUFDL0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEcsTUFBTSxhQUFhLEdBQWEsRUFBRSxDQUFDO1lBQ25DLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ2YsS0FBSyxNQUFNLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztvQkFDakMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLG9EQUE4QixDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM3RCxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDbkMsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVELDZFQUE2RTtZQUM3RSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzlCLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekQsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBRUQsSUFBSywwQkFRSjtJQVJELFdBQUssMEJBQTBCO1FBQzlCLDBEQUE0QixDQUFBO1FBQzVCLHFFQUF1QyxDQUFBO1FBQ3ZDLDJDQUFhLENBQUE7UUFDYixzREFBd0IsQ0FBQTtRQUN4Qix5Q0FBVyxDQUFBO1FBQ1gsb0RBQXNCLENBQUE7UUFDdEIsMkNBQWEsQ0FBQTtJQUNkLENBQUMsRUFSSSwwQkFBMEIsS0FBMUIsMEJBQTBCLFFBUTlCO0lBRUQsTUFBTSxvQkFBb0IsR0FBOEMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNsRiwwRkFBMEY7SUFDMUYsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsNEdBQTRHLENBQUMsQ0FBQyxDQUFDO0lBQ3hNLG9CQUFvQixDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLDRHQUE0RyxDQUFDLENBQUMsQ0FBQztJQUNuTixvQkFBb0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxpRkFBaUYsQ0FBQyxDQUFDLENBQUM7SUFDdEssb0JBQW9CLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLDhFQUE4RSxDQUFDLENBQUMsQ0FBQztJQUM5SyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2RSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLENBQUMsYUFBYSxFQUFFLDhFQUE4RSxDQUFDLENBQUMsQ0FBQztJQUMzSixNQUFNLFNBQVMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuQyxNQUFNLGVBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUU1QyxTQUFTLGdCQUFnQixDQUFDLFlBQStCO1FBQ3hELElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdEMsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7YUFBTSxDQUFDO1lBQ1AsT0FBTyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDcEYsQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUM7b0JBQ3pCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7dUJBQ3pHLENBQUMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUgsQ0FBQztJQUNGLENBQUM7SUFFRCxTQUFTLGtCQUFrQixDQUFDLFlBQStCO1FBQzFELElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdEMsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzdELENBQUM7YUFBTSxDQUFDO1lBQ1AsT0FBTyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxZQUFZLEVBQUUsTUFBTSxLQUFLLENBQUMsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzNILENBQUM7SUFDRixDQUFDO0lBRUQsU0FBUyxtQkFBbUIsQ0FBQyxZQUErQjtRQUMzRCxPQUFPLFlBQVksS0FBSyxRQUFRLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7ZUFDOUUsT0FBTyxZQUFZLEtBQUssUUFBUSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDeEgsQ0FBQyJ9
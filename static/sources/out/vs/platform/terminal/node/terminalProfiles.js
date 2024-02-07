/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/codicons", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/types", "vs/base/node/pfs", "vs/base/node/powershell", "vs/platform/terminal/node/terminalEnvironment", "path"], function (require, exports, cp, codicons_1, path_1, platform_1, types_1, pfs, powershell_1, terminalEnvironment_1, path_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.detectAvailableProfiles = void 0;
    var Constants;
    (function (Constants) {
        Constants["UnixShellsPath"] = "/etc/shells";
    })(Constants || (Constants = {}));
    let profileSources;
    let logIfWslNotInstalled = true;
    function detectAvailableProfiles(profiles, defaultProfile, includeDetectedProfiles, configurationService, shellEnv = process.env, fsProvider, logService, variableResolver, testPwshSourcePaths) {
        fsProvider = fsProvider || {
            existsFile: pfs.SymlinkSupport.existsFile,
            readFile: pfs.Promises.readFile
        };
        if (platform_1.isWindows) {
            return detectAvailableWindowsProfiles(includeDetectedProfiles, fsProvider, shellEnv, logService, configurationService.getValue("terminal.integrated.useWslProfiles" /* TerminalSettingId.UseWslProfiles */) !== false, profiles && typeof profiles === 'object' ? { ...profiles } : configurationService.getValue("terminal.integrated.profiles.windows" /* TerminalSettingId.ProfilesWindows */), typeof defaultProfile === 'string' ? defaultProfile : configurationService.getValue("terminal.integrated.defaultProfile.windows" /* TerminalSettingId.DefaultProfileWindows */), testPwshSourcePaths, variableResolver);
        }
        return detectAvailableUnixProfiles(fsProvider, logService, includeDetectedProfiles, profiles && typeof profiles === 'object' ? { ...profiles } : configurationService.getValue(platform_1.isLinux ? "terminal.integrated.profiles.linux" /* TerminalSettingId.ProfilesLinux */ : "terminal.integrated.profiles.osx" /* TerminalSettingId.ProfilesMacOs */), typeof defaultProfile === 'string' ? defaultProfile : configurationService.getValue(platform_1.isLinux ? "terminal.integrated.defaultProfile.linux" /* TerminalSettingId.DefaultProfileLinux */ : "terminal.integrated.defaultProfile.osx" /* TerminalSettingId.DefaultProfileMacOs */), testPwshSourcePaths, variableResolver, shellEnv);
    }
    exports.detectAvailableProfiles = detectAvailableProfiles;
    async function detectAvailableWindowsProfiles(includeDetectedProfiles, fsProvider, shellEnv, logService, useWslProfiles, configProfiles, defaultProfileName, testPwshSourcePaths, variableResolver) {
        // Determine the correct System32 path. We want to point to Sysnative
        // when the 32-bit version of VS Code is running on a 64-bit machine.
        // The reason for this is because PowerShell's important PSReadline
        // module doesn't work if this is not the case. See #27915.
        const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
        const system32Path = `${process.env['windir']}\\${is32ProcessOn64Windows ? 'Sysnative' : 'System32'}`;
        let useWSLexe = false;
        if ((0, terminalEnvironment_1.getWindowsBuildNumber)() >= 16299) {
            useWSLexe = true;
        }
        await initializeWindowsProfiles(testPwshSourcePaths);
        const detectedProfiles = new Map();
        // Add auto detected profiles
        if (includeDetectedProfiles) {
            detectedProfiles.set('PowerShell', {
                source: "PowerShell" /* ProfileSource.Pwsh */,
                icon: codicons_1.Codicon.terminalPowershell,
                isAutoDetected: true
            });
            detectedProfiles.set('Windows PowerShell', {
                path: `${system32Path}\\WindowsPowerShell\\v1.0\\powershell.exe`,
                icon: codicons_1.Codicon.terminalPowershell,
                isAutoDetected: true
            });
            detectedProfiles.set('Git Bash', {
                source: "Git Bash" /* ProfileSource.GitBash */,
                isAutoDetected: true
            });
            detectedProfiles.set('Command Prompt', {
                path: `${system32Path}\\cmd.exe`,
                icon: codicons_1.Codicon.terminalCmd,
                isAutoDetected: true
            });
            detectedProfiles.set('Cygwin', {
                path: [
                    { path: `${process.env['HOMEDRIVE']}\\cygwin64\\bin\\bash.exe`, isUnsafe: true },
                    { path: `${process.env['HOMEDRIVE']}\\cygwin\\bin\\bash.exe`, isUnsafe: true }
                ],
                args: ['--login'],
                isAutoDetected: true
            });
            detectedProfiles.set('bash (MSYS2)', {
                path: [
                    { path: `${process.env['HOMEDRIVE']}\\msys64\\usr\\bin\\bash.exe`, isUnsafe: true },
                ],
                args: ['--login', '-i'],
                icon: codicons_1.Codicon.terminalBash,
                isAutoDetected: true
            });
            const cmderPath = `${process.env['CMDER_ROOT'] || `${process.env['HOMEDRIVE']}\\cmder`}\\vendor\\bin\\vscode_init.cmd`;
            detectedProfiles.set('Cmder', {
                path: `${system32Path}\\cmd.exe`,
                args: ['/K', cmderPath],
                // The path is safe if it was derived from CMDER_ROOT
                requiresPath: process.env['CMDER_ROOT'] ? cmderPath : { path: cmderPath, isUnsafe: true },
                isAutoDetected: true
            });
        }
        applyConfigProfilesToMap(configProfiles, detectedProfiles);
        const resultProfiles = await transformToTerminalProfiles(detectedProfiles.entries(), defaultProfileName, fsProvider, shellEnv, logService, variableResolver);
        if (includeDetectedProfiles && useWslProfiles) {
            try {
                const result = await getWslProfiles(`${system32Path}\\${useWSLexe ? 'wsl' : 'bash'}.exe`, defaultProfileName);
                for (const wslProfile of result) {
                    if (!configProfiles || !(wslProfile.profileName in configProfiles)) {
                        resultProfiles.push(wslProfile);
                    }
                }
            }
            catch (e) {
                if (logIfWslNotInstalled) {
                    logService?.info('WSL is not installed, so could not detect WSL profiles');
                    logIfWslNotInstalled = false;
                }
            }
        }
        return resultProfiles;
    }
    async function transformToTerminalProfiles(entries, defaultProfileName, fsProvider, shellEnv = process.env, logService, variableResolver) {
        const promises = [];
        for (const [profileName, profile] of entries) {
            promises.push(getValidatedProfile(profileName, profile, defaultProfileName, fsProvider, shellEnv, logService, variableResolver));
        }
        return (await Promise.all(promises)).filter(e => !!e);
    }
    async function getValidatedProfile(profileName, profile, defaultProfileName, fsProvider, shellEnv = process.env, logService, variableResolver) {
        if (profile === null) {
            return undefined;
        }
        let originalPaths;
        let args;
        let icon = undefined;
        // use calculated values if path is not specified
        if ('source' in profile && !('path' in profile)) {
            const source = profileSources?.get(profile.source);
            if (!source) {
                return undefined;
            }
            originalPaths = source.paths;
            // if there are configured args, override the default ones
            args = profile.args || source.args;
            if (profile.icon) {
                icon = validateIcon(profile.icon);
            }
            else if (source.icon) {
                icon = source.icon;
            }
        }
        else {
            originalPaths = Array.isArray(profile.path) ? profile.path : [profile.path];
            args = platform_1.isWindows ? profile.args : Array.isArray(profile.args) ? profile.args : undefined;
            icon = validateIcon(profile.icon);
        }
        let paths;
        if (variableResolver) {
            // Convert to string[] for resolve
            const mapped = originalPaths.map(e => typeof e === 'string' ? e : e.path);
            const resolved = await variableResolver(mapped);
            // Convert resolved back to (T | string)[]
            paths = new Array(originalPaths.length);
            for (let i = 0; i < originalPaths.length; i++) {
                if (typeof originalPaths[i] === 'string') {
                    paths[i] = resolved[i];
                }
                else {
                    paths[i] = {
                        path: resolved[i],
                        isUnsafe: true
                    };
                }
            }
        }
        else {
            paths = originalPaths.slice();
        }
        let requiresUnsafePath;
        if (profile.requiresPath) {
            // Validate requiresPath exists
            let actualRequiredPath;
            if ((0, types_1.isString)(profile.requiresPath)) {
                actualRequiredPath = profile.requiresPath;
            }
            else {
                actualRequiredPath = profile.requiresPath.path;
                if (profile.requiresPath.isUnsafe) {
                    requiresUnsafePath = actualRequiredPath;
                }
            }
            const result = await fsProvider.existsFile(actualRequiredPath);
            if (!result) {
                return;
            }
        }
        const validatedProfile = await validateProfilePaths(profileName, defaultProfileName, paths, fsProvider, shellEnv, args, profile.env, profile.overrideName, profile.isAutoDetected, requiresUnsafePath);
        if (!validatedProfile) {
            logService?.debug('Terminal profile not validated', profileName, originalPaths);
            return undefined;
        }
        validatedProfile.isAutoDetected = profile.isAutoDetected;
        validatedProfile.icon = icon;
        validatedProfile.color = profile.color;
        return validatedProfile;
    }
    function validateIcon(icon) {
        if (typeof icon === 'string') {
            return { id: icon };
        }
        return icon;
    }
    async function initializeWindowsProfiles(testPwshSourcePaths) {
        if (profileSources && !testPwshSourcePaths) {
            return;
        }
        const [gitBashPaths, pwshPaths] = await Promise.all([getGitBashPaths(), testPwshSourcePaths || getPowershellPaths()]);
        profileSources = new Map();
        profileSources.set("Git Bash" /* ProfileSource.GitBash */, {
            profileName: 'Git Bash',
            paths: gitBashPaths,
            args: ['--login', '-i']
        });
        profileSources.set("PowerShell" /* ProfileSource.Pwsh */, {
            profileName: 'PowerShell',
            paths: pwshPaths,
            icon: codicons_1.Codicon.terminalPowershell
        });
    }
    async function getGitBashPaths() {
        const gitDirs = new Set();
        // Look for git.exe on the PATH and use that if found. git.exe is located at
        // `<installdir>/cmd/git.exe`. This is not an unsafe location because the git executable is
        // located on the PATH which is only controlled by the user/admin.
        const gitExePath = await (0, terminalEnvironment_1.findExecutable)('git.exe');
        if (gitExePath) {
            const gitExeDir = (0, path_2.dirname)(gitExePath);
            gitDirs.add((0, path_2.resolve)(gitExeDir, '../..'));
        }
        function addTruthy(set, value) {
            if (value) {
                set.add(value);
            }
        }
        // Add common git install locations
        addTruthy(gitDirs, process.env['ProgramW6432']);
        addTruthy(gitDirs, process.env['ProgramFiles']);
        addTruthy(gitDirs, process.env['ProgramFiles(X86)']);
        addTruthy(gitDirs, `${process.env['LocalAppData']}\\Program`);
        const gitBashPaths = [];
        for (const gitDir of gitDirs) {
            gitBashPaths.push(`${gitDir}\\Git\\bin\\bash.exe`, `${gitDir}\\Git\\usr\\bin\\bash.exe`, `${gitDir}\\usr\\bin\\bash.exe` // using Git for Windows SDK
            );
        }
        // Add special installs that don't follow the standard directory structure
        gitBashPaths.push(`${process.env['UserProfile']}\\scoop\\apps\\git\\current\\bin\\bash.exe`);
        gitBashPaths.push(`${process.env['UserProfile']}\\scoop\\apps\\git-with-openssh\\current\\bin\\bash.exe`);
        return gitBashPaths;
    }
    async function getPowershellPaths() {
        const paths = [];
        // Add all of the different kinds of PowerShells
        for await (const pwshExe of (0, powershell_1.enumeratePowerShellInstallations)()) {
            paths.push(pwshExe.exePath);
        }
        return paths;
    }
    async function getWslProfiles(wslPath, defaultProfileName) {
        const profiles = [];
        const distroOutput = await new Promise((resolve, reject) => {
            // wsl.exe output is encoded in utf16le (ie. A -> 0x4100)
            cp.exec('wsl.exe -l -q', { encoding: 'utf16le', timeout: 1000 }, (err, stdout) => {
                if (err) {
                    return reject('Problem occurred when getting wsl distros');
                }
                resolve(stdout);
            });
        });
        if (!distroOutput) {
            return [];
        }
        const regex = new RegExp(/[\r?\n]/);
        const distroNames = distroOutput.split(regex).filter(t => t.trim().length > 0 && t !== '');
        for (const distroName of distroNames) {
            // Skip empty lines
            if (distroName === '') {
                continue;
            }
            // docker-desktop and docker-desktop-data are treated as implementation details of
            // Docker Desktop for Windows and therefore not exposed
            if (distroName.startsWith('docker-desktop')) {
                continue;
            }
            // Create the profile, adding the icon depending on the distro
            const profileName = `${distroName} (WSL)`;
            const profile = {
                profileName,
                path: wslPath,
                args: [`-d`, `${distroName}`],
                isDefault: profileName === defaultProfileName,
                icon: getWslIcon(distroName),
                isAutoDetected: false
            };
            // Add the profile
            profiles.push(profile);
        }
        return profiles;
    }
    function getWslIcon(distroName) {
        if (distroName.includes('Ubuntu')) {
            return codicons_1.Codicon.terminalUbuntu;
        }
        else if (distroName.includes('Debian')) {
            return codicons_1.Codicon.terminalDebian;
        }
        else {
            return codicons_1.Codicon.terminalLinux;
        }
    }
    async function detectAvailableUnixProfiles(fsProvider, logService, includeDetectedProfiles, configProfiles, defaultProfileName, testPaths, variableResolver, shellEnv) {
        const detectedProfiles = new Map();
        // Add non-quick launch profiles
        if (includeDetectedProfiles && await fsProvider.existsFile("/etc/shells" /* Constants.UnixShellsPath */)) {
            const contents = (await fsProvider.readFile("/etc/shells" /* Constants.UnixShellsPath */)).toString();
            const profiles = ((testPaths || contents.split('\n'))
                .map(e => {
                const index = e.indexOf('#');
                return index === -1 ? e : e.substring(0, index);
            })
                .filter(e => e.trim().length > 0));
            const counts = new Map();
            for (const profile of profiles) {
                let profileName = (0, path_1.basename)(profile);
                let count = counts.get(profileName) || 0;
                count++;
                if (count > 1) {
                    profileName = `${profileName} (${count})`;
                }
                counts.set(profileName, count);
                detectedProfiles.set(profileName, { path: profile, isAutoDetected: true });
            }
        }
        applyConfigProfilesToMap(configProfiles, detectedProfiles);
        return await transformToTerminalProfiles(detectedProfiles.entries(), defaultProfileName, fsProvider, shellEnv, logService, variableResolver);
    }
    function applyConfigProfilesToMap(configProfiles, profilesMap) {
        if (!configProfiles) {
            return;
        }
        for (const [profileName, value] of Object.entries(configProfiles)) {
            if (value === null || typeof value !== 'object' || (!('path' in value) && !('source' in value))) {
                profilesMap.delete(profileName);
            }
            else {
                value.icon = value.icon || profilesMap.get(profileName)?.icon;
                profilesMap.set(profileName, value);
            }
        }
    }
    async function validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected, requiresUnsafePath) {
        if (potentialPaths.length === 0) {
            return Promise.resolve(undefined);
        }
        const path = potentialPaths.shift();
        if (path === '') {
            return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected);
        }
        const isUnsafePath = typeof path !== 'string' && path.isUnsafe;
        const actualPath = typeof path === 'string' ? path : path.path;
        const profile = {
            profileName,
            path: actualPath,
            args,
            env,
            overrideName,
            isAutoDetected,
            isDefault: profileName === defaultProfileName,
            isUnsafePath,
            requiresUnsafePath
        };
        // For non-absolute paths, check if it's available on $PATH
        if ((0, path_1.basename)(actualPath) === actualPath) {
            // The executable isn't an absolute path, try find it on the PATH
            const envPaths = shellEnv.PATH ? shellEnv.PATH.split(path_1.delimiter) : undefined;
            const executable = await (0, terminalEnvironment_1.findExecutable)(actualPath, undefined, envPaths, undefined, fsProvider.existsFile);
            if (!executable) {
                return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args);
            }
            profile.path = executable;
            profile.isFromPath = true;
            return profile;
        }
        const result = await fsProvider.existsFile((0, path_1.normalize)(actualPath));
        if (result) {
            return profile;
        }
        return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvbm9kZS90ZXJtaW5hbFByb2ZpbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsSUFBVyxTQUVWO0lBRkQsV0FBVyxTQUFTO1FBQ25CLDJDQUE4QixDQUFBO0lBQy9CLENBQUMsRUFGVSxTQUFTLEtBQVQsU0FBUyxRQUVuQjtJQUVELElBQUksY0FBa0UsQ0FBQztJQUN2RSxJQUFJLG9CQUFvQixHQUFZLElBQUksQ0FBQztJQUV6QyxTQUFnQix1QkFBdUIsQ0FDdEMsUUFBaUIsRUFDakIsY0FBdUIsRUFDdkIsdUJBQWdDLEVBQ2hDLG9CQUEyQyxFQUMzQyxXQUErQixPQUFPLENBQUMsR0FBRyxFQUMxQyxVQUF3QixFQUN4QixVQUF3QixFQUN4QixnQkFBd0QsRUFDeEQsbUJBQThCO1FBRTlCLFVBQVUsR0FBRyxVQUFVLElBQUk7WUFDMUIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBVTtZQUN6QyxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRO1NBQy9CLENBQUM7UUFDRixJQUFJLG9CQUFTLEVBQUUsQ0FBQztZQUNmLE9BQU8sOEJBQThCLENBQ3BDLHVCQUF1QixFQUN2QixVQUFVLEVBQ1YsUUFBUSxFQUNSLFVBQVUsRUFDVixvQkFBb0IsQ0FBQyxRQUFRLDZFQUFrQyxLQUFLLEtBQUssRUFDekUsUUFBUSxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLGdGQUFrRixFQUM1SyxPQUFPLGNBQWMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENB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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/platform", "vs/base/node/powershell", "vs/base/node/processes"], function (require, exports, os_1, platform, powershell_1, processes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSystemShell = void 0;
    /**
     * Gets the detected default shell for the _system_, not to be confused with VS Code's _default_
     * shell that the terminal uses by default.
     * @param os The platform to detect the shell of.
     */
    async function getSystemShell(os, env) {
        if (os === 1 /* platform.OperatingSystem.Windows */) {
            if (platform.isWindows) {
                return getSystemShellWindows();
            }
            // Don't detect Windows shell when not on Windows
            return processes.getWindowsShell(env);
        }
        return getSystemShellUnixLike(os, env);
    }
    exports.getSystemShell = getSystemShell;
    let _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = null;
    function getSystemShellUnixLike(os, env) {
        // Only use $SHELL for the current OS
        if (platform.isLinux && os === 2 /* platform.OperatingSystem.Macintosh */ || platform.isMacintosh && os === 3 /* platform.OperatingSystem.Linux */) {
            return '/bin/bash';
        }
        if (!_TERMINAL_DEFAULT_SHELL_UNIX_LIKE) {
            let unixLikeTerminal;
            if (platform.isWindows) {
                unixLikeTerminal = '/bin/bash'; // for WSL
            }
            else {
                unixLikeTerminal = env['SHELL'];
                if (!unixLikeTerminal) {
                    try {
                        // It's possible for $SHELL to be unset, this API reads /etc/passwd. See https://github.com/github/codespaces/issues/1639
                        // Node docs: "Throws a SystemError if a user has no username or homedir."
                        unixLikeTerminal = (0, os_1.userInfo)().shell;
                    }
                    catch (err) { }
                }
                if (!unixLikeTerminal) {
                    unixLikeTerminal = 'sh';
                }
                // Some systems have $SHELL set to /bin/false which breaks the terminal
                if (unixLikeTerminal === '/bin/false') {
                    unixLikeTerminal = '/bin/bash';
                }
            }
            _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = unixLikeTerminal;
        }
        return _TERMINAL_DEFAULT_SHELL_UNIX_LIKE;
    }
    let _TERMINAL_DEFAULT_SHELL_WINDOWS = null;
    async function getSystemShellWindows() {
        if (!_TERMINAL_DEFAULT_SHELL_WINDOWS) {
            _TERMINAL_DEFAULT_SHELL_WINDOWS = (await (0, powershell_1.getFirstAvailablePowerShellInstallation)()).exePath;
        }
        return _TERMINAL_DEFAULT_SHELL_WINDOWS;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2Uvbm9kZS9zaGVsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEc7Ozs7T0FJRztJQUNJLEtBQUssVUFBVSxjQUFjLENBQUMsRUFBNEIsRUFBRSxHQUFpQztRQUNuRyxJQUFJLEVBQUUsNkNBQXFDLEVBQUUsQ0FBQztZQUM3QyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxxQkFBcUIsRUFBRSxDQUFDO1lBQ2hDLENBQUM7WUFDRCxpREFBaUQ7WUFDakQsT0FBTyxTQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxPQUFPLHNCQUFzQixDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBVkQsd0NBVUM7SUFFRCxJQUFJLGlDQUFpQyxHQUFrQixJQUFJLENBQUM7SUFDNUQsU0FBUyxzQkFBc0IsQ0FBQyxFQUE0QixFQUFFLEdBQWlDO1FBQzlGLHFDQUFxQztRQUNyQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRSwrQ0FBdUMsSUFBSSxRQUFRLENBQUMsV0FBVyxJQUFJLEVBQUUsMkNBQW1DLEVBQUUsQ0FBQztZQUNwSSxPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO1FBRUQsSUFBSSxDQUFDLGlDQUFpQyxFQUFFLENBQUM7WUFDeEMsSUFBSSxnQkFBb0MsQ0FBQztZQUN6QyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDeEIsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLENBQUMsVUFBVTtZQUMzQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUVoQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDdkIsSUFBSSxDQUFDO3dCQUNKLHlIQUF5SDt3QkFDekgsMEVBQTBFO3dCQUMxRSxnQkFBZ0IsR0FBRyxJQUFBLGFBQVEsR0FBRSxDQUFDLEtBQUssQ0FBQztvQkFDckMsQ0FBQztvQkFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbEIsQ0FBQztnQkFFRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDdkIsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixDQUFDO2dCQUVELHVFQUF1RTtnQkFDdkUsSUFBSSxnQkFBZ0IsS0FBSyxZQUFZLEVBQUUsQ0FBQztvQkFDdkMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO2dCQUNoQyxDQUFDO1lBQ0YsQ0FBQztZQUNELGlDQUFpQyxHQUFHLGdCQUFnQixDQUFDO1FBQ3RELENBQUM7UUFDRCxPQUFPLGlDQUFpQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxJQUFJLCtCQUErQixHQUFrQixJQUFJLENBQUM7SUFDMUQsS0FBSyxVQUFVLHFCQUFxQjtRQUNuQyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztZQUN0QywrQkFBK0IsR0FBRyxDQUFDLE1BQU0sSUFBQSxvREFBdUMsR0FBRSxDQUFFLENBQUMsT0FBTyxDQUFDO1FBQzlGLENBQUM7UUFDRCxPQUFPLCtCQUErQixDQUFDO0lBQ3hDLENBQUMifQ==
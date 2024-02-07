/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "child_process", "vs/base/node/pfs", "path"], function (require, exports, os, cp, pfs_1, path) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasWSLFeatureInstalled = void 0;
    let hasWSLFeaturePromise;
    async function hasWSLFeatureInstalled(refresh = false) {
        if (hasWSLFeaturePromise === undefined || refresh) {
            hasWSLFeaturePromise = testWSLFeatureInstalled();
        }
        return hasWSLFeaturePromise;
    }
    exports.hasWSLFeatureInstalled = hasWSLFeatureInstalled;
    async function testWSLFeatureInstalled() {
        const windowsBuildNumber = getWindowsBuildNumber();
        if (windowsBuildNumber === undefined) {
            return false;
        }
        if (windowsBuildNumber >= 22000) {
            const wslExePath = getWSLExecutablePath();
            if (wslExePath) {
                return new Promise(s => {
                    cp.execFile(wslExePath, ['--status'], err => s(!err));
                });
            }
        }
        else {
            const dllPath = getLxssManagerDllPath();
            if (dllPath) {
                try {
                    if ((await pfs_1.Promises.stat(dllPath)).isFile()) {
                        return true;
                    }
                }
                catch (e) {
                }
            }
        }
        return false;
    }
    function getWindowsBuildNumber() {
        const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(os.release());
        if (osVersion) {
            return parseInt(osVersion[3]);
        }
        return undefined;
    }
    function getSystem32Path(subPath) {
        const systemRoot = process.env['SystemRoot'];
        if (systemRoot) {
            const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
            return path.join(systemRoot, is32ProcessOn64Windows ? 'Sysnative' : 'System32', subPath);
        }
        return undefined;
    }
    function getWSLExecutablePath() {
        return getSystem32Path('wsl.exe');
    }
    /**
     * In builds < 22000 this dll inidcates that WSL is installed
     */
    function getLxssManagerDllPath() {
        return getSystem32Path('lxss\\LxssManager.dll');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3NsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZW1vdGUvbm9kZS93c2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLElBQUksb0JBQWtELENBQUM7SUFFaEQsS0FBSyxVQUFVLHNCQUFzQixDQUFDLE9BQU8sR0FBRyxLQUFLO1FBQzNELElBQUksb0JBQW9CLEtBQUssU0FBUyxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ25ELG9CQUFvQixHQUFHLHVCQUF1QixFQUFFLENBQUM7UUFDbEQsQ0FBQztRQUNELE9BQU8sb0JBQW9CLENBQUM7SUFDN0IsQ0FBQztJQUxELHdEQUtDO0lBRUQsS0FBSyxVQUFVLHVCQUF1QjtRQUNyQyxNQUFNLGtCQUFrQixHQUFHLHFCQUFxQixFQUFFLENBQUM7UUFDbkQsSUFBSSxrQkFBa0IsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN0QyxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLGtCQUFrQixJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ2pDLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixFQUFFLENBQUM7WUFDMUMsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxJQUFJLE9BQU8sQ0FBVSxDQUFDLENBQUMsRUFBRTtvQkFDL0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztRQUNGLENBQUM7YUFBTSxDQUFDO1lBQ1AsTUFBTSxPQUFPLEdBQUcscUJBQXFCLEVBQUUsQ0FBQztZQUN4QyxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNiLElBQUksQ0FBQztvQkFDSixJQUFJLENBQUMsTUFBTSxjQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQzt3QkFDN0MsT0FBTyxJQUFJLENBQUM7b0JBQ2IsQ0FBQztnQkFDRixDQUFDO2dCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ2IsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyxxQkFBcUI7UUFDN0IsTUFBTSxTQUFTLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM5RCxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2YsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FBQyxPQUFlO1FBQ3ZDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0MsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNoQixNQUFNLHNCQUFzQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDcEYsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxTQUFTLG9CQUFvQjtRQUM1QixPQUFPLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLHFCQUFxQjtRQUM3QixPQUFPLGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ2pELENBQUMifQ==
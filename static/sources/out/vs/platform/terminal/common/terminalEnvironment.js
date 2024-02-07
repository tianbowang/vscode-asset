/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sanitizeCwd = exports.collapseTildePath = exports.escapeNonWindowsPath = void 0;
    /**
     * Aggressively escape non-windows paths to prepare for being sent to a shell. This will do some
     * escaping inaccurately to be careful about possible script injection via the file path. For
     * example, we're trying to prevent this sort of attack: `/foo/file$(echo evil)`.
     */
    function escapeNonWindowsPath(path) {
        let newPath = path;
        if (newPath.includes('\\')) {
            newPath = newPath.replace(/\\/g, '\\\\');
        }
        const bannedChars = /[\`\$\|\&\>\~\#\!\^\*\;\<\"\']/g;
        newPath = newPath.replace(bannedChars, '');
        return `'${newPath}'`;
    }
    exports.escapeNonWindowsPath = escapeNonWindowsPath;
    /**
     * Collapses the user's home directory into `~` if it exists within the path, this gives a shorter
     * path that is more suitable within the context of a terminal.
     */
    function collapseTildePath(path, userHome, separator) {
        if (!path) {
            return '';
        }
        if (!userHome) {
            return path;
        }
        // Trim the trailing separator from the end if it exists
        if (userHome.match(/[\/\\]$/)) {
            userHome = userHome.slice(0, userHome.length - 1);
        }
        const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
        const normalizedUserHome = userHome.replace(/\\/g, '/').toLowerCase();
        if (!normalizedPath.includes(normalizedUserHome)) {
            return path;
        }
        return `~${separator}${path.slice(userHome.length + 1)}`;
    }
    exports.collapseTildePath = collapseTildePath;
    /**
     * Sanitizes a cwd string, removing any wrapping quotes and making the Windows drive letter
     * uppercase.
     * @param cwd The directory to sanitize.
     */
    function sanitizeCwd(cwd) {
        // Sanity check that the cwd is not wrapped in quotes (see #160109)
        if (cwd.match(/^['"].*['"]$/)) {
            cwd = cwd.substring(1, cwd.length - 1);
        }
        // Make the drive letter uppercase on Windows (see #9448)
        if (platform_1.OS === 1 /* OperatingSystem.Windows */ && cwd && cwd[1] === ':') {
            return cwd[0].toUpperCase() + cwd.substring(1);
        }
        return cwd;
    }
    exports.sanitizeCwd = sanitizeCwd;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbnZpcm9ubWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsRW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHOzs7O09BSUc7SUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxJQUFZO1FBQ2hELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUM1QixPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELE1BQU0sV0FBVyxHQUFHLGlDQUFpQyxDQUFDO1FBQ3RELE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQyxPQUFPLElBQUksT0FBTyxHQUFHLENBQUM7SUFDdkIsQ0FBQztJQVJELG9EQVFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsSUFBd0IsRUFBRSxRQUE0QixFQUFFLFNBQWlCO1FBQzFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNYLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUNELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNmLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELHdEQUF3RDtRQUN4RCxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUMvQixRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDOUQsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0RSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7WUFDbEQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsT0FBTyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUMxRCxDQUFDO0lBakJELDhDQWlCQztJQUVEOzs7O09BSUc7SUFDSCxTQUFnQixXQUFXLENBQUMsR0FBVztRQUN0QyxtRUFBbUU7UUFDbkUsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7WUFDL0IsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUNELHlEQUF5RDtRQUN6RCxJQUFJLGFBQUUsb0NBQTRCLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUM3RCxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFWRCxrQ0FVQyJ9
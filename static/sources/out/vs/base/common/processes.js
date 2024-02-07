/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeDangerousEnvVariables = exports.sanitizeProcessEnvironment = exports.TerminateResponseCode = exports.Source = void 0;
    var Source;
    (function (Source) {
        Source[Source["stdout"] = 0] = "stdout";
        Source[Source["stderr"] = 1] = "stderr";
    })(Source || (exports.Source = Source = {}));
    var TerminateResponseCode;
    (function (TerminateResponseCode) {
        TerminateResponseCode[TerminateResponseCode["Success"] = 0] = "Success";
        TerminateResponseCode[TerminateResponseCode["Unknown"] = 1] = "Unknown";
        TerminateResponseCode[TerminateResponseCode["AccessDenied"] = 2] = "AccessDenied";
        TerminateResponseCode[TerminateResponseCode["ProcessNotFound"] = 3] = "ProcessNotFound";
    })(TerminateResponseCode || (exports.TerminateResponseCode = TerminateResponseCode = {}));
    /**
     * Sanitizes a VS Code process environment by removing all Electron/VS Code-related values.
     */
    function sanitizeProcessEnvironment(env, ...preserve) {
        const set = preserve.reduce((set, key) => {
            set[key] = true;
            return set;
        }, {});
        const keysToRemove = [
            /^ELECTRON_.+$/,
            /^VSCODE_(?!(PORTABLE|SHELL_LOGIN|ENV_REPLACE|ENV_APPEND|ENV_PREPEND)).+$/,
            /^SNAP(|_.*)$/,
            /^GDK_PIXBUF_.+$/,
        ];
        const envKeys = Object.keys(env);
        envKeys
            .filter(key => !set[key])
            .forEach(envKey => {
            for (let i = 0; i < keysToRemove.length; i++) {
                if (envKey.search(keysToRemove[i]) !== -1) {
                    delete env[envKey];
                    break;
                }
            }
        });
    }
    exports.sanitizeProcessEnvironment = sanitizeProcessEnvironment;
    /**
     * Remove dangerous environment variables that have caused crashes
     * in forked processes (i.e. in ELECTRON_RUN_AS_NODE processes)
     *
     * @param env The env object to change
     */
    function removeDangerousEnvVariables(env) {
        if (!env) {
            return;
        }
        // Unset `DEBUG`, as an invalid value might lead to process crashes
        // See https://github.com/microsoft/vscode/issues/130072
        delete env['DEBUG'];
        if (platform_1.isMacintosh) {
            // Unset `DYLD_LIBRARY_PATH`, as it leads to process crashes
            // See https://github.com/microsoft/vscode/issues/104525
            // See https://github.com/microsoft/vscode/issues/105848
            delete env['DYLD_LIBRARY_PATH'];
        }
        if (platform_1.isLinux) {
            // Unset `LD_PRELOAD`, as it might lead to process crashes
            // See https://github.com/microsoft/vscode/issues/134177
            delete env['LD_PRELOAD'];
        }
    }
    exports.removeDangerousEnvVariables = removeDangerousEnvVariables;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9wcm9jZXNzZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaURoRyxJQUFrQixNQUdqQjtJQUhELFdBQWtCLE1BQU07UUFDdkIsdUNBQU0sQ0FBQTtRQUNOLHVDQUFNLENBQUE7SUFDUCxDQUFDLEVBSGlCLE1BQU0sc0JBQU4sTUFBTSxRQUd2QjtJQTJCRCxJQUFrQixxQkFLakI7SUFMRCxXQUFrQixxQkFBcUI7UUFDdEMsdUVBQVcsQ0FBQTtRQUNYLHVFQUFXLENBQUE7UUFDWCxpRkFBZ0IsQ0FBQTtRQUNoQix1RkFBbUIsQ0FBQTtJQUNwQixDQUFDLEVBTGlCLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBS3RDO0lBYUQ7O09BRUc7SUFDSCxTQUFnQiwwQkFBMEIsQ0FBQyxHQUF3QixFQUFFLEdBQUcsUUFBa0I7UUFDekYsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUN4QyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQyxFQUFFLEVBQTZCLENBQUMsQ0FBQztRQUNsQyxNQUFNLFlBQVksR0FBRztZQUNwQixlQUFlO1lBQ2YsMEVBQTBFO1lBQzFFLGNBQWM7WUFDZCxpQkFBaUI7U0FDakIsQ0FBQztRQUNGLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsT0FBTzthQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDM0MsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ25CLE1BQU07Z0JBQ1AsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUF0QkQsZ0VBc0JDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQiwyQkFBMkIsQ0FBQyxHQUFvQztRQUMvRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDVixPQUFPO1FBQ1IsQ0FBQztRQUVELG1FQUFtRTtRQUNuRSx3REFBd0Q7UUFDeEQsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFcEIsSUFBSSxzQkFBVyxFQUFFLENBQUM7WUFDakIsNERBQTREO1lBQzVELHdEQUF3RDtZQUN4RCx3REFBd0Q7WUFDeEQsT0FBTyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRUQsSUFBSSxrQkFBTyxFQUFFLENBQUM7WUFDYiwwREFBMEQ7WUFDMUQsd0RBQXdEO1lBQ3hELE9BQU8sR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFCLENBQUM7SUFDRixDQUFDO0lBckJELGtFQXFCQyJ9
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/nls", "vs/platform/environment/node/argv"], function (require, exports, assert, nls_1, argv_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLaunchedFromCli = exports.addArg = exports.parseCLIProcessArgv = exports.parseMainProcessArgv = void 0;
    function parseAndValidate(cmdLineArgs, reportWarnings) {
        const onMultipleValues = (id, val) => {
            console.warn((0, nls_1.localize)('multipleValues', "Option '{0}' is defined more than once. Using value '{1}'.", id, val));
        };
        const onEmptyValue = (id) => {
            console.warn((0, nls_1.localize)('emptyValue', "Option '{0}' requires a non empty value. Ignoring the option.", id));
        };
        const onDeprecatedOption = (deprecatedOption, message) => {
            console.warn((0, nls_1.localize)('deprecatedArgument', "Option '{0}' is deprecated: {1}", deprecatedOption, message));
        };
        const getSubcommandReporter = (command) => ({
            onUnknownOption: (id) => {
                if (!argv_1.NATIVE_CLI_COMMANDS.includes(command)) {
                    console.warn((0, nls_1.localize)('unknownSubCommandOption', "Warning: '{0}' is not in the list of known options for subcommand '{1}'", id, command));
                }
            },
            onMultipleValues,
            onEmptyValue,
            onDeprecatedOption,
            getSubcommandReporter: argv_1.NATIVE_CLI_COMMANDS.includes(command) ? getSubcommandReporter : undefined
        });
        const errorReporter = {
            onUnknownOption: (id) => {
                console.warn((0, nls_1.localize)('unknownOption', "Warning: '{0}' is not in the list of known options, but still passed to Electron/Chromium.", id));
            },
            onMultipleValues,
            onEmptyValue,
            onDeprecatedOption,
            getSubcommandReporter
        };
        const args = (0, argv_1.parseArgs)(cmdLineArgs, argv_1.OPTIONS, reportWarnings ? errorReporter : undefined);
        if (args.goto) {
            args._.forEach(arg => assert(/^(\w:)?[^:]+(:\d*){0,2}:?$/.test(arg), (0, nls_1.localize)('gotoValidation', "Arguments in `--goto` mode should be in the format of `FILE(:LINE(:CHARACTER))`.")));
        }
        return args;
    }
    function stripAppPath(argv) {
        const index = argv.findIndex(a => !/^-/.test(a));
        if (index > -1) {
            return [...argv.slice(0, index), ...argv.slice(index + 1)];
        }
        return undefined;
    }
    /**
     * Use this to parse raw code process.argv such as: `Electron . --verbose --wait`
     */
    function parseMainProcessArgv(processArgv) {
        let [, ...args] = processArgv;
        // If dev, remove the first non-option argument: it's the app location
        if (process.env['VSCODE_DEV']) {
            args = stripAppPath(args) || [];
        }
        // If called from CLI, don't report warnings as they are already reported.
        const reportWarnings = !isLaunchedFromCli(process.env);
        return parseAndValidate(args, reportWarnings);
    }
    exports.parseMainProcessArgv = parseMainProcessArgv;
    /**
     * Use this to parse raw code CLI process.argv such as: `Electron cli.js . --verbose --wait`
     */
    function parseCLIProcessArgv(processArgv) {
        let [, , ...args] = processArgv; // remove the first non-option argument: it's always the app location
        // If dev, remove the first non-option argument: it's the app location
        if (process.env['VSCODE_DEV']) {
            args = stripAppPath(args) || [];
        }
        return parseAndValidate(args, true);
    }
    exports.parseCLIProcessArgv = parseCLIProcessArgv;
    function addArg(argv, ...args) {
        const endOfArgsMarkerIndex = argv.indexOf('--');
        if (endOfArgsMarkerIndex === -1) {
            argv.push(...args);
        }
        else {
            // if the we have an argument "--" (end of argument marker)
            // we cannot add arguments at the end. rather, we add
            // arguments before the "--" marker.
            argv.splice(endOfArgsMarkerIndex, 0, ...args);
        }
        return argv;
    }
    exports.addArg = addArg;
    function isLaunchedFromCli(env) {
        return env['VSCODE_CLI'] === '1';
    }
    exports.isLaunchedFromCli = isLaunchedFromCli;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZW52aXJvbm1lbnQvbm9kZS9hcmd2SGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxTQUFTLGdCQUFnQixDQUFDLFdBQXFCLEVBQUUsY0FBdUI7UUFDdkUsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLEVBQVUsRUFBRSxHQUFXLEVBQUUsRUFBRTtZQUNwRCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLDREQUE0RCxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pILENBQUMsQ0FBQztRQUNGLE1BQU0sWUFBWSxHQUFHLENBQUMsRUFBVSxFQUFFLEVBQUU7WUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsK0RBQStELEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRyxDQUFDLENBQUM7UUFDRixNQUFNLGtCQUFrQixHQUFHLENBQUMsZ0JBQXdCLEVBQUUsT0FBZSxFQUFFLEVBQUU7WUFDeEUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxpQ0FBaUMsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUMsQ0FBQztRQUNGLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkQsZUFBZSxFQUFFLENBQUMsRUFBVSxFQUFFLEVBQUU7Z0JBQy9CLElBQUksQ0FBRSwwQkFBeUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDbkUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFB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
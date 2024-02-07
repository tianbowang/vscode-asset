/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix"], function (require, exports, uri_1, nls_1, quickFix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pwshUnixCommandNotFoundError = exports.pwshGeneralError = exports.gitCreatePr = exports.gitPushSetUpstream = exports.freePort = exports.gitTwoDashes = exports.gitPull = exports.gitSimilar = exports.QuickFixSource = exports.PwshUnixCommandNotFoundErrorOutputRegex = exports.PwshGeneralErrorOutputRegex = exports.GitCreatePrOutputRegex = exports.GitPushOutputRegex = exports.FreePortOutputRegex = exports.GitSimilarOutputRegex = exports.GitTwoDashesRegex = exports.GitPushCommandLineRegex = exports.GitPullOutputRegex = exports.GitCommandLineRegex = void 0;
    exports.GitCommandLineRegex = /git/;
    exports.GitPullOutputRegex = /and can be fast-forwarded/;
    exports.GitPushCommandLineRegex = /git\s+push/;
    exports.GitTwoDashesRegex = /error: did you mean `--(.+)` \(with two dashes\)\?/;
    exports.GitSimilarOutputRegex = /(?:(most similar commands? (is|are)))/;
    exports.FreePortOutputRegex = /(?:address already in use (?:0\.0\.0\.0|127\.0\.0\.1|localhost|::):|Unable to bind [^ ]*:|can't listen on port |listen EADDRINUSE [^ ]*:)(?<portNumber>\d{4,5})/;
    exports.GitPushOutputRegex = /git push --set-upstream origin (?<branchName>[^\s]+)/;
    // The previous line starts with "Create a pull request for \'([^\s]+)\' on GitHub by visiting:\s*"
    // it's safe to assume it's a github pull request if the URL includes `/pull/`
    exports.GitCreatePrOutputRegex = /remote:\s*(?<link>https:\/\/github\.com\/.+\/.+\/pull\/new\/.+)/;
    exports.PwshGeneralErrorOutputRegex = /Suggestion \[General\]:/;
    exports.PwshUnixCommandNotFoundErrorOutputRegex = /Suggestion \[cmd-not-found\]:/;
    var QuickFixSource;
    (function (QuickFixSource) {
        QuickFixSource["Builtin"] = "builtin";
    })(QuickFixSource || (exports.QuickFixSource = QuickFixSource = {}));
    function gitSimilar() {
        return {
            id: 'Git Similar',
            type: 'internal',
            commandLineMatcher: exports.GitCommandLineRegex,
            outputMatcher: {
                lineMatcher: exports.GitSimilarOutputRegex,
                anchor: 'bottom',
                offset: 0,
                length: 10
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const regexMatch = matchResult.outputMatch?.regexMatch[0];
                if (!regexMatch || !matchResult.outputMatch) {
                    return;
                }
                const actions = [];
                const startIndex = matchResult.outputMatch.outputLines.findIndex(l => l.includes(regexMatch)) + 1;
                const results = matchResult.outputMatch.outputLines.map(r => r.trim());
                for (let i = startIndex; i < results.length; i++) {
                    const fixedCommand = results[i];
                    if (fixedCommand) {
                        actions.push({
                            id: 'Git Similar',
                            type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                            terminalCommand: matchResult.commandLine.replace(/git\s+[^\s]+/, () => `git ${fixedCommand}`),
                            shouldExecute: true,
                            source: "builtin" /* QuickFixSource.Builtin */
                        });
                    }
                }
                return actions;
            }
        };
    }
    exports.gitSimilar = gitSimilar;
    function gitPull() {
        return {
            id: 'Git Pull',
            type: 'internal',
            commandLineMatcher: exports.GitCommandLineRegex,
            outputMatcher: {
                lineMatcher: exports.GitPullOutputRegex,
                anchor: 'bottom',
                offset: 0,
                length: 8
            },
            commandExitResult: 'success',
            getQuickFixes: (matchResult) => {
                return {
                    type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                    id: 'Git Pull',
                    terminalCommand: `git pull`,
                    shouldExecute: true,
                    source: "builtin" /* QuickFixSource.Builtin */
                };
            }
        };
    }
    exports.gitPull = gitPull;
    function gitTwoDashes() {
        return {
            id: 'Git Two Dashes',
            type: 'internal',
            commandLineMatcher: exports.GitCommandLineRegex,
            outputMatcher: {
                lineMatcher: exports.GitTwoDashesRegex,
                anchor: 'bottom',
                offset: 0,
                length: 2
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const problemArg = matchResult?.outputMatch?.regexMatch?.[1];
                if (!problemArg) {
                    return;
                }
                return {
                    type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                    id: 'Git Two Dashes',
                    terminalCommand: matchResult.commandLine.replace(` -${problemArg}`, () => ` --${problemArg}`),
                    shouldExecute: true,
                    source: "builtin" /* QuickFixSource.Builtin */
                };
            }
        };
    }
    exports.gitTwoDashes = gitTwoDashes;
    function freePort(runCallback) {
        return {
            id: 'Free Port',
            type: 'internal',
            commandLineMatcher: /.+/,
            outputMatcher: {
                lineMatcher: exports.FreePortOutputRegex,
                anchor: 'bottom',
                offset: 0,
                length: 30
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const port = matchResult?.outputMatch?.regexMatch?.groups?.portNumber;
                if (!port) {
                    return;
                }
                const label = (0, nls_1.localize)("terminal.freePort", "Free port {0}", port);
                return {
                    type: quickFix_1.TerminalQuickFixType.Port,
                    class: undefined,
                    tooltip: label,
                    id: 'Free Port',
                    label,
                    enabled: true,
                    source: "builtin" /* QuickFixSource.Builtin */,
                    run: () => runCallback(port, matchResult.commandLine)
                };
            }
        };
    }
    exports.freePort = freePort;
    function gitPushSetUpstream() {
        return {
            id: 'Git Push Set Upstream',
            type: 'internal',
            commandLineMatcher: exports.GitPushCommandLineRegex,
            /**
                Example output on Windows:
                8: PS C:\Users\merogge\repos\xterm.js> git push
                7: fatal: The current branch sdjfskdjfdslkjf has no upstream branch.
                6: To push the current branch and set the remote as upstream, use
                5:
                4:	git push --set-upstream origin sdjfskdjfdslkjf
                3:
                2: To have this happen automatically for branches without a tracking
                1: upstream, see 'push.autoSetupRemote' in 'git help config'.
                0:
    
                Example output on macOS:
                5: meganrogge@Megans-MacBook-Pro xterm.js % git push
                4: fatal: The current branch merogge/asjdkfsjdkfsdjf has no upstream branch.
                3: To push the current branch and set the remote as upstream, use
                2:
                1:	git push --set-upstream origin merogge/asjdkfsjdkfsdjf
                0:
             */
            outputMatcher: {
                lineMatcher: exports.GitPushOutputRegex,
                anchor: 'bottom',
                offset: 0,
                length: 8
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const matches = matchResult.outputMatch;
                const commandToRun = 'git push --set-upstream origin ${group:branchName}';
                if (!matches) {
                    return;
                }
                const groups = matches.regexMatch.groups;
                if (!groups) {
                    return;
                }
                const actions = [];
                let fixedCommand = commandToRun;
                for (const [key, value] of Object.entries(groups)) {
                    const varToResolve = '${group:' + `${key}` + '}';
                    if (!commandToRun.includes(varToResolve)) {
                        return [];
                    }
                    fixedCommand = fixedCommand.replaceAll(varToResolve, () => value);
                }
                if (fixedCommand) {
                    actions.push({
                        type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                        id: 'Git Push Set Upstream',
                        terminalCommand: fixedCommand,
                        shouldExecute: true,
                        source: "builtin" /* QuickFixSource.Builtin */
                    });
                    return actions;
                }
                return;
            }
        };
    }
    exports.gitPushSetUpstream = gitPushSetUpstream;
    function gitCreatePr() {
        return {
            id: 'Git Create Pr',
            type: 'internal',
            commandLineMatcher: exports.GitPushCommandLineRegex,
            // Example output:
            // ...
            // 10: remote:
            // 9:  remote: Create a pull request for 'my_branch' on GitHub by visiting:
            // 8:  remote:      https://github.com/microsoft/vscode/pull/new/my_branch
            // 7:  remote:
            // 6:  remote: GitHub found x vulnerabilities on microsoft/vscode's default branch (...). To find out more, visit:
            // 5:  remote:      https://github.com/microsoft/vscode/security/dependabot
            // 4:  remote:
            // 3:  To https://github.com/microsoft/vscode
            // 2:  * [new branch]              my_branch -> my_branch
            // 1:  Branch 'my_branch' set up to track remote branch 'my_branch' from 'origin'.
            // 0:
            outputMatcher: {
                lineMatcher: exports.GitCreatePrOutputRegex,
                anchor: 'bottom',
                offset: 4,
                // ~6 should only be needed here for security alerts, but the git provider can customize
                // the text, so use 12 to be safe.
                length: 12
            },
            commandExitResult: 'success',
            getQuickFixes: (matchResult) => {
                const link = matchResult?.outputMatch?.regexMatch?.groups?.link;
                if (!link) {
                    return;
                }
                const label = (0, nls_1.localize)("terminal.createPR", "Create PR {0}", link);
                return {
                    id: 'Git Create Pr',
                    label,
                    enabled: true,
                    type: quickFix_1.TerminalQuickFixType.Opener,
                    uri: uri_1.URI.parse(link),
                    source: "builtin" /* QuickFixSource.Builtin */
                };
            }
        };
    }
    exports.gitCreatePr = gitCreatePr;
    function pwshGeneralError() {
        return {
            id: 'Pwsh General Error',
            type: 'internal',
            commandLineMatcher: /.+/,
            outputMatcher: {
                lineMatcher: exports.PwshGeneralErrorOutputRegex,
                anchor: 'bottom',
                offset: 0,
                length: 10
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const lines = matchResult.outputMatch?.regexMatch.input?.split('\n');
                if (!lines) {
                    return;
                }
                // Find the start
                let i = 0;
                let inFeedbackProvider = false;
                for (; i < lines.length; i++) {
                    if (lines[i].match(exports.PwshGeneralErrorOutputRegex)) {
                        inFeedbackProvider = true;
                        break;
                    }
                }
                if (!inFeedbackProvider) {
                    return;
                }
                const suggestions = lines[i + 1].match(/The most similar commands are: (?<values>.+)./)?.groups?.values?.split(', ');
                if (!suggestions) {
                    return;
                }
                const result = [];
                for (const suggestion of suggestions) {
                    result.push({
                        id: 'Pwsh General Error',
                        type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                        terminalCommand: suggestion,
                        source: "builtin" /* QuickFixSource.Builtin */
                    });
                }
                return result;
            }
        };
    }
    exports.pwshGeneralError = pwshGeneralError;
    function pwshUnixCommandNotFoundError() {
        return {
            id: 'Unix Command Not Found',
            type: 'internal',
            commandLineMatcher: /.+/,
            outputMatcher: {
                lineMatcher: exports.PwshUnixCommandNotFoundErrorOutputRegex,
                anchor: 'bottom',
                offset: 0,
                length: 10
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const lines = matchResult.outputMatch?.regexMatch.input?.split('\n');
                if (!lines) {
                    return;
                }
                // Find the start
                let i = 0;
                let inFeedbackProvider = false;
                for (; i < lines.length; i++) {
                    if (lines[i].match(exports.PwshUnixCommandNotFoundErrorOutputRegex)) {
                        inFeedbackProvider = true;
                        break;
                    }
                }
                if (!inFeedbackProvider) {
                    return;
                }
                // Always remove the first element as it's the "Suggestion [cmd-not-found]"" line
                const result = [];
                let inSuggestions = false;
                for (; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.length === 0) {
                        break;
                    }
                    const installCommand = line.match(/You also have .+ installed, you can run '(?<command>.+)' instead./)?.groups?.command;
                    if (installCommand) {
                        result.push({
                            id: 'Pwsh Unix Command Not Found Error',
                            type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                            terminalCommand: installCommand,
                            source: "builtin" /* QuickFixSource.Builtin */
                        });
                        inSuggestions = false;
                        continue;
                    }
                    if (line.match(/Command '.+' not found, but can be installed with:/)) {
                        inSuggestions = true;
                        continue;
                    }
                    if (inSuggestions) {
                        result.push({
                            id: 'Pwsh Unix Command Not Found Error',
                            type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                            terminalCommand: line.trim(),
                            source: "builtin" /* QuickFixSource.Builtin */
                        });
                    }
                }
                return result;
            }
        };
    }
    exports.pwshUnixCommandNotFoundError = pwshUnixCommandNotFoundError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxRdWlja0ZpeEJ1aWx0aW5BY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvcXVpY2tGaXgvYnJvd3Nlci90ZXJtaW5hbFF1aWNrRml4QnVpbHRpbkFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTW5GLFFBQUEsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO0lBQzVCLFFBQUEsa0JBQWtCLEdBQUcsMkJBQTJCLENBQUM7SUFDakQsUUFBQSx1QkFBdUIsR0FBRyxZQUFZLENBQUM7SUFDdkMsUUFBQSxpQkFBaUIsR0FBRyxvREFBb0QsQ0FBQztJQUN6RSxRQUFBLHFCQUFxQixHQUFHLHVDQUF1QyxDQUFDO0lBQ2hFLFFBQUEsbUJBQW1CLEdBQUcsaUtBQWlLLENBQUM7SUFDeEwsUUFBQSxrQkFBa0IsR0FBRyxzREFBc0QsQ0FBQztJQUN6RixtR0FBbUc7SUFDbkcsOEVBQThFO0lBQ2pFLFFBQUEsc0JBQXNCLEdBQUcsaUVBQWlFLENBQUM7SUFDM0YsUUFBQSwyQkFBMkIsR0FBRyx5QkFBeUIsQ0FBQztJQUN4RCxRQUFBLHVDQUF1QyxHQUFHLCtCQUErQixDQUFDO0lBRXZGLElBQWtCLGNBRWpCO0lBRkQsV0FBa0IsY0FBYztRQUMvQixxQ0FBbUIsQ0FBQTtJQUNwQixDQUFDLEVBRmlCLGNBQWMsOEJBQWQsY0FBYyxRQUUvQjtJQUVELFNBQWdCLFVBQVU7UUFDekIsT0FBTztZQUNOLEVBQUUsRUFBRSxhQUFhO1lBQ2pCLElBQUksRUFBRSxVQUFVO1lBQ2hCLGtCQUFrQixFQUFFLDJCQUFtQjtZQUN2QyxhQUFhLEVBQUU7Z0JBQ2QsV0FBVyxFQUFFLDZCQUFxQjtnQkFDbEMsTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLE1BQU0sRUFBRSxDQUFDO2dCQUNU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
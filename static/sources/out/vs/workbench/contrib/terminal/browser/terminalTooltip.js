/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/htmlContent"], function (require, exports, nls_1, arrays_1, htmlContent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getShellProcessTooltip = exports.getShellIntegrationTooltip = exports.getInstanceHoverInfo = void 0;
    function getInstanceHoverInfo(instance) {
        let statusString = '';
        const statuses = instance.statusList.statuses;
        const actions = [];
        for (const status of statuses) {
            statusString += `\n\n---\n\n${status.icon ? `$(${status.icon?.id}) ` : ''}${status.tooltip || status.id}`;
            if (status.hoverActions) {
                actions.push(...status.hoverActions);
            }
        }
        const shellProcessString = getShellProcessTooltip(instance, true);
        const shellIntegrationString = getShellIntegrationTooltip(instance, true);
        const content = new htmlContent_1.MarkdownString(instance.title + shellProcessString + shellIntegrationString + statusString, { supportThemeIcons: true });
        return { content, actions };
    }
    exports.getInstanceHoverInfo = getInstanceHoverInfo;
    function getShellIntegrationTooltip(instance, markdown) {
        const shellIntegrationCapabilities = [];
        if (instance.capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
            shellIntegrationCapabilities.push(2 /* TerminalCapability.CommandDetection */);
        }
        if (instance.capabilities.has(0 /* TerminalCapability.CwdDetection */)) {
            shellIntegrationCapabilities.push(0 /* TerminalCapability.CwdDetection */);
        }
        let shellIntegrationString = '';
        if (shellIntegrationCapabilities.length > 0) {
            shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'}${(0, nls_1.localize)('shellIntegration.enabled', "Shell integration activated")}`;
        }
        else {
            if (instance.shellLaunchConfig.ignoreShellIntegration) {
                shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'}${(0, nls_1.localize)('launchFailed.exitCodeOnlyShellIntegration', "The terminal process failed to launch. Disabling shell integration with terminal.integrated.shellIntegration.enabled might help.")}`;
            }
            else {
                if (instance.usedShellIntegrationInjection) {
                    shellIntegrationString += `${markdown ? '\n\n---\n\n' : '\n\n'}${(0, nls_1.localize)('shellIntegration.activationFailed', "Shell integration failed to activate")}`;
                }
            }
        }
        return shellIntegrationString;
    }
    exports.getShellIntegrationTooltip = getShellIntegrationTooltip;
    function getShellProcessTooltip(instance, markdown) {
        const lines = [];
        if (instance.processId) {
            lines.push((0, nls_1.localize)({ key: 'shellProcessTooltip.processId', comment: ['The first arg is "PID" which shouldn\'t be translated'] }, "Process ID ({0}): {1}", 'PID', instance.processId) + '\n');
        }
        if (instance.shellLaunchConfig.executable) {
            let commandLine = instance.shellLaunchConfig.executable;
            const args = (0, arrays_1.asArray)(instance.injectedArgs || instance.shellLaunchConfig.args || []).map(x => `'${x}'`).join(' ');
            if (args) {
                commandLine += ` ${args}`;
            }
            lines.push((0, nls_1.localize)('shellProcessTooltip.commandLine', 'Command line: {0}', commandLine));
        }
        return lines.length ? `${markdown ? '\n\n---\n\n' : '\n\n'}${lines.join('\n')}` : '';
    }
    exports.getShellProcessTooltip = getShellProcessTooltip;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxUb29sdGlwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsVG9vbHRpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsU0FBZ0Isb0JBQW9CLENBQUMsUUFBMkI7UUFDL0QsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNuQixLQUFLLE1BQU0sTUFBTSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQy9CLFlBQVksSUFBSSxjQUFjLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFHLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDRixDQUFDO1FBRUQsTUFBTSxrQkFBa0IsR0FBRyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEUsTUFBTSxzQkFBc0IsR0FBRywwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUUsTUFBTSxPQUFPLEdBQUcsSUFBSSw0QkFBYyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLEdBQUcsc0JBQXNCLEdBQUcsWUFBWSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFF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
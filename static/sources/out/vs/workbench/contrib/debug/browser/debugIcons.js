/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.debugInspectMemory = exports.debugConsoleEvaluationPrompt = exports.debugConsoleEvaluationInput = exports.breakpointsActivate = exports.breakpointsRemoveAll = exports.watchExpressionsAddFuncBreakpoint = exports.watchExpressionsAdd = exports.watchExpressionRemove = exports.watchExpressionsRemoveAll = exports.debugConsoleClearAll = exports.callstackViewSession = exports.debugCollapseAll = exports.debugRemoveConfig = exports.debugConsole = exports.debugConfigure = exports.debugStart = exports.debugRun = exports.debugReverseContinue = exports.debugContinue = exports.debugPause = exports.debugStepBack = exports.debugStepOut = exports.debugStepInto = exports.debugStepOver = exports.debugRestart = exports.debugDisconnect = exports.debugStop = exports.debugRestartFrame = exports.debugGripper = exports.debugStackframeFocused = exports.debugStackframe = exports.allBreakpoints = exports.debugBreakpointUnsupported = exports.debugBreakpointHint = exports.logBreakpoint = exports.dataBreakpoint = exports.conditionalBreakpoint = exports.functionBreakpoint = exports.breakpoint = exports.loadedScriptsViewIcon = exports.breakpointsViewIcon = exports.callStackViewIcon = exports.watchViewIcon = exports.variablesViewIcon = exports.runViewIcon = exports.debugConsoleViewIcon = void 0;
    exports.debugConsoleViewIcon = (0, iconRegistry_1.registerIcon)('debug-console-view-icon', codicons_1.Codicon.debugConsole, (0, nls_1.localize)('debugConsoleViewIcon', 'View icon of the debug console view.'));
    exports.runViewIcon = (0, iconRegistry_1.registerIcon)('run-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)('runViewIcon', 'View icon of the run view.'));
    exports.variablesViewIcon = (0, iconRegistry_1.registerIcon)('variables-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)('variablesViewIcon', 'View icon of the variables view.'));
    exports.watchViewIcon = (0, iconRegistry_1.registerIcon)('watch-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)('watchViewIcon', 'View icon of the watch view.'));
    exports.callStackViewIcon = (0, iconRegistry_1.registerIcon)('callstack-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)('callStackViewIcon', 'View icon of the call stack view.'));
    exports.breakpointsViewIcon = (0, iconRegistry_1.registerIcon)('breakpoints-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)('breakpointsViewIcon', 'View icon of the breakpoints view.'));
    exports.loadedScriptsViewIcon = (0, iconRegistry_1.registerIcon)('loaded-scripts-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)('loadedScriptsViewIcon', 'View icon of the loaded scripts view.'));
    exports.breakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint', codicons_1.Codicon.debugBreakpoint, (0, nls_1.localize)('debugBreakpoint', 'Icon for breakpoints.')),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-disabled', codicons_1.Codicon.debugBreakpointDisabled, (0, nls_1.localize)('debugBreakpointDisabled', 'Icon for disabled breakpoints.')),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-unverified', codicons_1.Codicon.debugBreakpointUnverified, (0, nls_1.localize)('debugBreakpointUnverified', 'Icon for unverified breakpoints.')),
        pending: (0, iconRegistry_1.registerIcon)('debug-breakpoint-pending', codicons_1.Codicon.debugBreakpointPending, (0, nls_1.localize)('debugBreakpointPendingOnTrigger', 'Icon for breakpoints waiting on another breakpoint.')),
    };
    exports.functionBreakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint-function', codicons_1.Codicon.debugBreakpointFunction, (0, nls_1.localize)('debugBreakpointFunction', 'Icon for function breakpoints.')),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-function-disabled', codicons_1.Codicon.debugBreakpointFunctionDisabled, (0, nls_1.localize)('debugBreakpointFunctionDisabled', 'Icon for disabled function breakpoints.')),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-function-unverified', codicons_1.Codicon.debugBreakpointFunctionUnverified, (0, nls_1.localize)('debugBreakpointFunctionUnverified', 'Icon for unverified function breakpoints.'))
    };
    exports.conditionalBreakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint-conditional', codicons_1.Codicon.debugBreakpointConditional, (0, nls_1.localize)('debugBreakpointConditional', 'Icon for conditional breakpoints.')),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-conditional-disabled', codicons_1.Codicon.debugBreakpointConditionalDisabled, (0, nls_1.localize)('debugBreakpointConditionalDisabled', 'Icon for disabled conditional breakpoints.')),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-conditional-unverified', codicons_1.Codicon.debugBreakpointConditionalUnverified, (0, nls_1.localize)('debugBreakpointConditionalUnverified', 'Icon for unverified conditional breakpoints.'))
    };
    exports.dataBreakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint-data', codicons_1.Codicon.debugBreakpointData, (0, nls_1.localize)('debugBreakpointData', 'Icon for data breakpoints.')),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-data-disabled', codicons_1.Codicon.debugBreakpointDataDisabled, (0, nls_1.localize)('debugBreakpointDataDisabled', 'Icon for disabled data breakpoints.')),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-data-unverified', codicons_1.Codicon.debugBreakpointDataUnverified, (0, nls_1.localize)('debugBreakpointDataUnverified', 'Icon for unverified data breakpoints.')),
    };
    exports.logBreakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint-log', codicons_1.Codicon.debugBreakpointLog, (0, nls_1.localize)('debugBreakpointLog', 'Icon for log breakpoints.')),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-log-disabled', codicons_1.Codicon.debugBreakpointLogDisabled, (0, nls_1.localize)('debugBreakpointLogDisabled', 'Icon for disabled log breakpoint.')),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-log-unverified', codicons_1.Codicon.debugBreakpointLogUnverified, (0, nls_1.localize)('debugBreakpointLogUnverified', 'Icon for unverified log breakpoints.')),
    };
    exports.debugBreakpointHint = (0, iconRegistry_1.registerIcon)('debug-hint', codicons_1.Codicon.debugHint, (0, nls_1.localize)('debugBreakpointHint', 'Icon for breakpoint hints shown on hover in editor glyph margin.'));
    exports.debugBreakpointUnsupported = (0, iconRegistry_1.registerIcon)('debug-breakpoint-unsupported', codicons_1.Codicon.debugBreakpointUnsupported, (0, nls_1.localize)('debugBreakpointUnsupported', 'Icon for unsupported breakpoints.'));
    exports.allBreakpoints = [exports.breakpoint, exports.functionBreakpoint, exports.conditionalBreakpoint, exports.dataBreakpoint, exports.logBreakpoint];
    exports.debugStackframe = (0, iconRegistry_1.registerIcon)('debug-stackframe', codicons_1.Codicon.debugStackframe, (0, nls_1.localize)('debugStackframe', 'Icon for a stackframe shown in the editor glyph margin.'));
    exports.debugStackframeFocused = (0, iconRegistry_1.registerIcon)('debug-stackframe-focused', codicons_1.Codicon.debugStackframeFocused, (0, nls_1.localize)('debugStackframeFocused', 'Icon for a focused stackframe  shown in the editor glyph margin.'));
    exports.debugGripper = (0, iconRegistry_1.registerIcon)('debug-gripper', codicons_1.Codicon.gripper, (0, nls_1.localize)('debugGripper', 'Icon for the debug bar gripper.'));
    exports.debugRestartFrame = (0, iconRegistry_1.registerIcon)('debug-restart-frame', codicons_1.Codicon.debugRestartFrame, (0, nls_1.localize)('debugRestartFrame', 'Icon for the debug restart frame action.'));
    exports.debugStop = (0, iconRegistry_1.registerIcon)('debug-stop', codicons_1.Codicon.debugStop, (0, nls_1.localize)('debugStop', 'Icon for the debug stop action.'));
    exports.debugDisconnect = (0, iconRegistry_1.registerIcon)('debug-disconnect', codicons_1.Codicon.debugDisconnect, (0, nls_1.localize)('debugDisconnect', 'Icon for the debug disconnect action.'));
    exports.debugRestart = (0, iconRegistry_1.registerIcon)('debug-restart', codicons_1.Codicon.debugRestart, (0, nls_1.localize)('debugRestart', 'Icon for the debug restart action.'));
    exports.debugStepOver = (0, iconRegistry_1.registerIcon)('debug-step-over', codicons_1.Codicon.debugStepOver, (0, nls_1.localize)('debugStepOver', 'Icon for the debug step over action.'));
    exports.debugStepInto = (0, iconRegistry_1.registerIcon)('debug-step-into', codicons_1.Codicon.debugStepInto, (0, nls_1.localize)('debugStepInto', 'Icon for the debug step into action.'));
    exports.debugStepOut = (0, iconRegistry_1.registerIcon)('debug-step-out', codicons_1.Codicon.debugStepOut, (0, nls_1.localize)('debugStepOut', 'Icon for the debug step out action.'));
    exports.debugStepBack = (0, iconRegistry_1.registerIcon)('debug-step-back', codicons_1.Codicon.debugStepBack, (0, nls_1.localize)('debugStepBack', 'Icon for the debug step back action.'));
    exports.debugPause = (0, iconRegistry_1.registerIcon)('debug-pause', codicons_1.Codicon.debugPause, (0, nls_1.localize)('debugPause', 'Icon for the debug pause action.'));
    exports.debugContinue = (0, iconRegistry_1.registerIcon)('debug-continue', codicons_1.Codicon.debugContinue, (0, nls_1.localize)('debugContinue', 'Icon for the debug continue action.'));
    exports.debugReverseContinue = (0, iconRegistry_1.registerIcon)('debug-reverse-continue', codicons_1.Codicon.debugReverseContinue, (0, nls_1.localize)('debugReverseContinue', 'Icon for the debug reverse continue action.'));
    exports.debugRun = (0, iconRegistry_1.registerIcon)('debug-run', codicons_1.Codicon.run, (0, nls_1.localize)('debugRun', 'Icon for the run or debug action.'));
    exports.debugStart = (0, iconRegistry_1.registerIcon)('debug-start', codicons_1.Codicon.debugStart, (0, nls_1.localize)('debugStart', 'Icon for the debug start action.'));
    exports.debugConfigure = (0, iconRegistry_1.registerIcon)('debug-configure', codicons_1.Codicon.gear, (0, nls_1.localize)('debugConfigure', 'Icon for the debug configure action.'));
    exports.debugConsole = (0, iconRegistry_1.registerIcon)('debug-console', codicons_1.Codicon.gear, (0, nls_1.localize)('debugConsole', 'Icon for the debug console open action.'));
    exports.debugRemoveConfig = (0, iconRegistry_1.registerIcon)('debug-remove-config', codicons_1.Codicon.trash, (0, nls_1.localize)('debugRemoveConfig', 'Icon for removing debug configurations.'));
    exports.debugCollapseAll = (0, iconRegistry_1.registerIcon)('debug-collapse-all', codicons_1.Codicon.collapseAll, (0, nls_1.localize)('debugCollapseAll', 'Icon for the collapse all action in the debug views.'));
    exports.callstackViewSession = (0, iconRegistry_1.registerIcon)('callstack-view-session', codicons_1.Codicon.bug, (0, nls_1.localize)('callstackViewSession', 'Icon for the session icon in the call stack view.'));
    exports.debugConsoleClearAll = (0, iconRegistry_1.registerIcon)('debug-console-clear-all', codicons_1.Codicon.clearAll, (0, nls_1.localize)('debugConsoleClearAll', 'Icon for the clear all action in the debug console.'));
    exports.watchExpressionsRemoveAll = (0, iconRegistry_1.registerIcon)('watch-expressions-remove-all', codicons_1.Codicon.closeAll, (0, nls_1.localize)('watchExpressionsRemoveAll', 'Icon for the Remove All action in the watch view.'));
    exports.watchExpressionRemove = (0, iconRegistry_1.registerIcon)('watch-expression-remove', codicons_1.Codicon.removeClose, (0, nls_1.localize)('watchExpressionRemove', 'Icon for the Remove action in the watch view.'));
    exports.watchExpressionsAdd = (0, iconRegistry_1.registerIcon)('watch-expressions-add', codicons_1.Codicon.add, (0, nls_1.localize)('watchExpressionsAdd', 'Icon for the add action in the watch view.'));
    exports.watchExpressionsAddFuncBreakpoint = (0, iconRegistry_1.registerIcon)('watch-expressions-add-function-breakpoint', codicons_1.Codicon.add, (0, nls_1.localize)('watchExpressionsAddFuncBreakpoint', 'Icon for the add function breakpoint action in the watch view.'));
    exports.breakpointsRemoveAll = (0, iconRegistry_1.registerIcon)('breakpoints-remove-all', codicons_1.Codicon.closeAll, (0, nls_1.localize)('breakpointsRemoveAll', 'Icon for the Remove All action in the breakpoints view.'));
    exports.breakpointsActivate = (0, iconRegistry_1.registerIcon)('breakpoints-activate', codicons_1.Codicon.activateBreakpoints, (0, nls_1.localize)('breakpointsActivate', 'Icon for the activate action in the breakpoints view.'));
    exports.debugConsoleEvaluationInput = (0, iconRegistry_1.registerIcon)('debug-console-evaluation-input', codicons_1.Codicon.arrowSmallRight, (0, nls_1.localize)('debugConsoleEvaluationInput', 'Icon for the debug evaluation input marker.'));
    exports.debugConsoleEvaluationPrompt = (0, iconRegistry_1.registerIcon)('debug-console-evaluation-prompt', codicons_1.Codicon.chevronRight, (0, nls_1.localize)('debugConsoleEvaluationPrompt', 'Icon for the debug evaluation prompt.'));
    exports.debugInspectMemory = (0, iconRegistry_1.registerIcon)('debug-inspect-memory', codicons_1.Codicon.fileBinary, (0, nls_1.localize)('debugInspectMemory', 'Icon for the inspect memory action.'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdJY29ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Z0ljb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1uRixRQUFBLG9CQUFvQixHQUFHLElBQUEsMkJBQVksRUFBQyx5QkFBeUIsRUFBRSxrQkFBTyxDQUFDLFlBQVksRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDLENBQUM7SUFDL0osUUFBQSxXQUFXLEdBQUcsSUFBQSwyQkFBWSxFQUFDLGVBQWUsRUFBRSxrQkFBTyxDQUFDLFFBQVEsRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO0lBQ3JILFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwyQkFBWSxFQUFDLHFCQUFxQixFQUFFLGtCQUFPLENBQUMsUUFBUSxFQUFFLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztJQUM3SSxRQUFBLGFBQWEsR0FBRyxJQUFBLDJCQUFZLEVBQUMsaUJBQWlCLEVBQUUsa0JBQU8sQ0FBQyxRQUFRLEVBQUUsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLDhCQUE4QixDQUFDLENBQUMsQ0FBQztJQUM3SCxRQUFBLGlCQUFpQixHQUFHLElBQUEsMkJBQVksRUFBQyxxQkFBcUIsRUFBRSxrQkFBTyxDQUFDLFFBQVEsRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7SUFDOUksUUFBQSxtQkFBbUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsdUJBQXVCLEVBQUUsa0JBQU8sQ0FBQyxRQUFRLEVBQUUsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUsb0NBQW9DLENB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
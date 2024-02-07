/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/audioCues/browser/commands", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/audioCues/browser/audioCueService", "vs/workbench/contrib/audioCues/browser/audioCueDebuggerContribution", "vs/workbench/contrib/audioCues/browser/audioCueLineFeatureContribution"], function (require, exports, commands_1, nls_1, actions_1, configurationRegistry_1, extensions_1, platform_1, contributions_1, audioCueService_1, audioCueDebuggerContribution_1, audioCueLineFeatureContribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(audioCueService_1.IAudioCueService, audioCueService_1.AudioCueService, 1 /* InstantiationType.Delayed */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(audioCueLineFeatureContribution_1.AudioCueLineFeatureContribution, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(audioCueDebuggerContribution_1.AudioCueLineDebuggerContribution, 3 /* LifecyclePhase.Restored */);
    const audioCueFeatureBase = {
        'type': 'string',
        'enum': ['auto', 'on', 'off'],
        'default': 'auto',
        'enumDescriptions': [
            (0, nls_1.localize)('audioCues.enabled.auto', "Enable audio cue when a screen reader is attached."),
            (0, nls_1.localize)('audioCues.enabled.on', "Enable audio cue."),
            (0, nls_1.localize)('audioCues.enabled.off', "Disable audio cue.")
        ],
        tags: ['accessibility']
    };
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'properties': {
            'audioCues.enabled': {
                markdownDeprecationMessage: 'Deprecated. Use the specific setting for each audio cue instead (`audioCues.*`).',
                tags: ['accessibility']
            },
            'audioCues.volume': {
                'description': (0, nls_1.localize)('audioCues.volume', "The volume of the audio cues in percent (0-100)."),
                'type': 'number',
                'minimum': 0,
                'maximum': 100,
                'default': 70,
                tags: ['accessibility']
            },
            'audioCues.debouncePositionChanges': {
                'description': (0, nls_1.localize)('audioCues.debouncePositionChanges', "Whether or not position changes should be debounced"),
                'type': 'boolean',
                'default': false,
                tags: ['accessibility']
            },
            'audioCues.lineHasBreakpoint': {
                'description': (0, nls_1.localize)('audioCues.lineHasBreakpoint', "Plays a sound when the active line has a breakpoint."),
                ...audioCueFeatureBase
            },
            'audioCues.lineHasInlineSuggestion': {
                'description': (0, nls_1.localize)('audioCues.lineHasInlineSuggestion', "Plays a sound when the active line has an inline suggestion."),
                ...audioCueFeatureBase
            },
            'audioCues.lineHasError': {
                'description': (0, nls_1.localize)('audioCues.lineHasError', "Plays a sound when the active line has an error."),
                ...audioCueFeatureBase,
            },
            'audioCues.lineHasFoldedArea': {
                'description': (0, nls_1.localize)('audioCues.lineHasFoldedArea', "Plays a sound when the active line has a folded area that can be unfolded."),
                ...audioCueFeatureBase,
            },
            'audioCues.lineHasWarning': {
                'description': (0, nls_1.localize)('audioCues.lineHasWarning', "Plays a sound when the active line has a warning."),
                ...audioCueFeatureBase,
                default: 'off',
            },
            'audioCues.onDebugBreak': {
                'description': (0, nls_1.localize)('audioCues.onDebugBreak', "Plays a sound when the debugger stopped on a breakpoint."),
                ...audioCueFeatureBase,
            },
            'audioCues.noInlayHints': {
                'description': (0, nls_1.localize)('audioCues.noInlayHints', "Plays a sound when trying to read a line with inlay hints that has no inlay hints."),
                ...audioCueFeatureBase,
            },
            'audioCues.taskCompleted': {
                'description': (0, nls_1.localize)('audioCues.taskCompleted', "Plays a sound when a task is completed."),
                ...audioCueFeatureBase,
            },
            'audioCues.taskFailed': {
                'description': (0, nls_1.localize)('audioCues.taskFailed', "Plays a sound when a task fails (non-zero exit code)."),
                ...audioCueFeatureBase,
            },
            'audioCues.terminalCommandFailed': {
                'description': (0, nls_1.localize)('audioCues.terminalCommandFailed', "Plays a sound when a terminal command fails (non-zero exit code)."),
                ...audioCueFeatureBase,
            },
            'audioCues.terminalQuickFix': {
                'description': (0, nls_1.localize)('audioCues.terminalQuickFix', "Plays a sound when terminal Quick Fixes are available."),
                ...audioCueFeatureBase,
            },
            'audioCues.diffLineInserted': {
                'description': (0, nls_1.localize)('audioCues.diffLineInserted', "Plays a sound when the focus moves to an inserted line in Accessible Diff Viewer mode or to the next/previous change."),
                ...audioCueFeatureBase,
            },
            'audioCues.diffLineDeleted': {
                'description': (0, nls_1.localize)('audioCues.diffLineDeleted', "Plays a sound when the focus moves to a deleted line in Accessible Diff Viewer mode or to the next/previous change."),
                ...audioCueFeatureBase,
            },
            'audioCues.diffLineModified': {
                'description': (0, nls_1.localize)('audioCues.diffLineModified', "Plays a sound when the focus moves to a modified line in Accessible Diff Viewer mode or to the next/previous change."),
                ...audioCueFeatureBase,
            },
            'audioCues.notebookCellCompleted': {
                'description': (0, nls_1.localize)('audioCues.notebookCellCompleted', "Plays a sound when a notebook cell execution is successfully completed."),
                ...audioCueFeatureBase,
            },
            'audioCues.notebookCellFailed': {
                'description': (0, nls_1.localize)('audioCues.notebookCellFailed', "Plays a sound when a notebook cell execution fails."),
                ...audioCueFeatureBase,
            },
            'audioCues.chatRequestSent': {
                'description': (0, nls_1.localize)('audioCues.chatRequestSent', "Plays a sound when a chat request is made."),
                ...audioCueFeatureBase,
                default: 'off'
            },
            'audioCues.chatResponsePending': {
                'description': (0, nls_1.localize)('audioCues.chatResponsePending', "Plays a sound on loop while the response is pending."),
                ...audioCueFeatureBase,
                default: 'auto'
            },
            'audioCues.chatResponseReceived': {
                'description': (0, nls_1.localize)('audioCues.chatResponseReceived', "Plays a sound on loop while the response has been received."),
                ...audioCueFeatureBase,
                default: 'off'
            },
            'audioCues.clear': {
                'description': (0, nls_1.localize)('audioCues.clear', "Plays a sound when a feature is cleared (for example, the terminal, Debug Console, or Output channel). When this is disabled, an ARIA alert will announce 'Cleared'."),
                ...audioCueFeatureBase,
                default: 'off'
            },
            'audioCues.save': {
                'markdownDescription': (0, nls_1.localize)('audioCues.save', "Plays a sound when a file is saved. Also see {0}", '`#accessibility.alert.save#`'),
                'type': 'string',
                'enum': ['userGesture', 'always', 'never'],
                'default': 'never',
                'enumDescriptions': [
                    (0, nls_1.localize)('audioCues.save.userGesture', "Plays the audio cue when a user explicitly saves a file."),
                    (0, nls_1.localize)('audioCues.save.always', "Plays the audio cue whenever a file is saved, including auto save."),
                    (0, nls_1.localize)('audioCues.save.never', "Never plays the audio cue.")
                ],
                tags: ['accessibility']
            },
            'audioCues.format': {
                'markdownDescription': (0, nls_1.localize)('audioCues.format', "Plays a sound when a file or notebook is formatted. Also see {0}", '`#accessibility.alert.format#`'),
                'type': 'string',
                'enum': ['userGesture', 'always', 'never'],
                'default': 'never',
                'enumDescriptions': [
                    (0, nls_1.localize)('audioCues.format.userGesture', "Plays the audio cue when a user explicitly formats a file."),
                    (0, nls_1.localize)('audioCues.format.always', "Plays the audio cue whenever a file is formatted, including if it is set to format on save, type, or, paste, or run of a cell."),
                    (0, nls_1.localize)('audioCues.format.never', "Never plays the audio cue.")
                ],
                tags: ['accessibility']
            },
        },
    });
    (0, actions_1.registerAction2)(commands_1.ShowAudioCueHelp);
    (0, actions_1.registerAction2)(commands_1.ShowAccessibilityAlertHelp);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW9DdWVzLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYXVkaW9DdWVzL2Jyb3dzZXIvYXVkaW9DdWVzLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWNoRyxJQUFBLDhCQUFpQixFQUFDLGtDQUFnQixFQUFFLGlDQUFlLG9DQUE0QixDQUFDO0lBRWhGLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxpRUFBK0Isa0NBQTBCLENBQUM7SUFDcEssbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLCtEQUFnQyxrQ0FBMEIsQ0FBQztJQUVySyxNQUFNLG1CQUFtQixHQUFpQztRQUN6RCxNQUFNLEVBQUUsUUFBUTtRQUNoQixNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQztRQUM3QixTQUFTLEVBQUUsTUFBTTtRQUNqQixrQkFBa0IsRUFBRTtZQUNuQixJQUFBLGNBQVEsRUFBQyx3QkFBd0IsRUFBRSxvREFBb0QsQ0FBQztZQUN4RixJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxtQkFBbUIsQ0FBQztZQUNyRCxJQUFBLGNBQVEsRUFBQyx1QkFBdUIsRUFBRSxvQkFBb0IsQ0FBQztTQUN2RDtRQUNELElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBQztLQUN2QixDQUFDO0lBRUYsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQ2hHLFlBQVksRUFBRTtZQUNiLG1CQUFtQixFQUFFO2dCQUNwQiwwQkFBMEIsRUFBRSxrRkFBa0Y7Z0JBQzlHLElB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
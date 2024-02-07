/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/themables", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/audioCues/browser/audioCueService", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/preferences/common/preferences"], function (require, exports, codicons_1, themables_1, nls_1, accessibility_1, actions_1, audioCueService_1, quickInput_1, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowAccessibilityAlertHelp = exports.ShowAudioCueHelp = void 0;
    class ShowAudioCueHelp extends actions_1.Action2 {
        static { this.ID = 'audioCues.help'; }
        constructor() {
            super({
                id: ShowAudioCueHelp.ID,
                title: {
                    value: (0, nls_1.localize)('audioCues.help', "Help: List Audio Cues"),
                    original: 'Help: List Audio Cues'
                },
                f1: true,
            });
        }
        async run(accessor) {
            const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
            const quickPickService = accessor.get(quickInput_1.IQuickInputService);
            const preferencesService = accessor.get(preferences_1.IPreferencesService);
            const accessibilityService = accessor.get(accessibility_1.IAccessibilityService);
            const items = audioCueService_1.AudioCue.allAudioCues.map((cue, idx) => ({
                label: accessibilityService.isScreenReaderOptimized() ?
                    `${cue.name}${audioCueService.isCueEnabled(cue) ? '' : ' (' + (0, nls_1.localize)('disabled', "Disabled") + ')'}`
                    : `${audioCueService.isCueEnabled(cue) ? '$(check)' : '     '} ${cue.name}`,
                audioCue: cue,
                buttons: [{
                        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.settingsGear),
                        tooltip: (0, nls_1.localize)('audioCues.help.settings', 'Enable/Disable Audio Cue'),
                    }],
            }));
            const quickPick = quickPickService.pick(items, {
                activeItem: items[0],
                onDidFocus: (item) => {
                    audioCueService.playSound(item.audioCue.sound.getSound(true), true);
                },
                onDidTriggerItemButton: (context) => {
                    preferencesService.openSettings({ query: context.item.audioCue.settingsKey });
                },
                placeHolder: (0, nls_1.localize)('audioCues.help.placeholder', 'Select an audio cue to play'),
            });
            await quickPick;
        }
    }
    exports.ShowAudioCueHelp = ShowAudioCueHelp;
    class ShowAccessibilityAlertHelp extends actions_1.Action2 {
        static { this.ID = 'accessibility.alert.help'; }
        constructor() {
            super({
                id: ShowAccessibilityAlertHelp.ID,
                title: {
                    value: (0, nls_1.localize)('accessibility.alert.help', "Help: List Alerts"),
                    original: 'Help: List Alerts'
                },
                f1: true,
            });
        }
        async run(accessor) {
            const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
            const quickPickService = accessor.get(quickInput_1.IQuickInputService);
            const preferencesService = accessor.get(preferences_1.IPreferencesService);
            const accessibilityService = accessor.get(accessibility_1.IAccessibilityService);
            const items = audioCueService_1.AudioCue.allAudioCues.filter(c => !!c.alertMessage).map((cue, idx) => ({
                label: accessibilityService.isScreenReaderOptimized() ?
                    `${cue.name}${audioCueService.isAlertEnabled(cue) ? '' : ' (' + (0, nls_1.localize)('disabled', "Disabled") + ')'}`
                    : `${audioCueService.isAlertEnabled(cue) ? '$(check)' : '     '} ${cue.name}`,
                audioCue: cue,
                buttons: [{
                        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.settingsGear),
                        tooltip: (0, nls_1.localize)('alerts.help.settings', 'Enable/Disable Audio Cue'),
                    }],
            }));
            const quickPick = quickPickService.pick(items, {
                activeItem: items[0],
                onDidTriggerItemButton: (context) => {
                    preferencesService.openSettings({ query: context.item.audioCue.alertSettingsKey });
                },
                placeHolder: (0, nls_1.localize)('alerts.help.placeholder', 'Inspect and configure the status of an alert'),
            });
            await quickPick;
        }
    }
    exports.ShowAccessibilityAlertHelp = ShowAccessibilityAlertHelp;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2F1ZGlvQ3Vlcy9icm93c2VyL2NvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLGdCQUFpQixTQUFRLGlCQUFPO2lCQUM1QixPQUFFLEdBQUcsZ0JBQWdCLENBQUM7UUFFdEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ3ZCLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsdUJBQXVCLENBQUM7b0JBQzFELFFBQVEsRUFBRSx1QkFBdUI7aUJBQ2pDO2dCQUNELEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDNUMsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQ0FBZ0IsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBQzFELE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQ0FBbUIsQ0FBQyxDQUFDO1lBQzdELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1lBRWpFLE1BQU0sS0FBSyxHQUFnRCwwQkFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRyxLQUFLLEVBQUUsb0JBQW9CLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO29CQUN0RCxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdB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
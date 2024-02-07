/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/nls", "vs/base/common/observable", "vs/platform/telemetry/common/telemetry"], function (require, exports, lifecycle_1, network_1, accessibility_1, configuration_1, instantiation_1, event_1, nls_1, observable_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AudioCue = exports.AccessibilityAlertSettingId = exports.SoundSource = exports.Sound = exports.AudioCueService = exports.IAudioCueService = void 0;
    exports.IAudioCueService = (0, instantiation_1.createDecorator)('audioCue');
    let AudioCueService = class AudioCueService extends lifecycle_1.Disposable {
        constructor(configurationService, accessibilityService, telemetryService) {
            super();
            this.configurationService = configurationService;
            this.accessibilityService = accessibilityService;
            this.telemetryService = telemetryService;
            this.sounds = new Map();
            this.screenReaderAttached = (0, observable_1.observableFromEvent)(this.accessibilityService.onDidChangeScreenReaderOptimized, () => /** @description accessibilityService.onDidChangeScreenReaderOptimized */ this.accessibilityService.isScreenReaderOptimized());
            this.sentTelemetry = new Set();
            this.playingSounds = new Set();
            this.obsoleteAudioCuesEnabled = (0, observable_1.observableFromEvent)(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration('audioCues.enabled')), () => /** @description config: audioCues.enabled */ this.configurationService.getValue('audioCues.enabled'));
            this.isCueEnabledCache = new Cache((event) => {
                const settingObservable = (0, observable_1.observableFromEvent)(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(event.cue.settingsKey)), () => this.configurationService.getValue(event.cue.settingsKey));
                return (0, observable_1.derived)(reader => {
                    /** @description audio cue enabled */
                    const setting = settingObservable.read(reader);
                    if (setting === 'on' ||
                        (setting === 'auto' && this.screenReaderAttached.read(reader))) {
                        return true;
                    }
                    else if (setting === 'always' || setting === 'userGesture' && event.userGesture) {
                        return true;
                    }
                    const obsoleteSetting = this.obsoleteAudioCuesEnabled.read(reader);
                    if (obsoleteSetting === 'on' ||
                        (obsoleteSetting === 'auto' && this.screenReaderAttached.read(reader))) {
                        return true;
                    }
                    return false;
                });
            }, JSON.stringify);
            this.isAlertEnabledCache = new Cache((event) => {
                const settingObservable = (0, observable_1.observableFromEvent)(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(event.cue.settingsKey)), () => event.cue.alertSettingsKey ? this.configurationService.getValue(event.cue.alertSettingsKey) : false);
                return (0, observable_1.derived)(reader => {
                    /** @description audio cue enabled */
                    const setting = settingObservable.read(reader);
                    if (!this.screenReaderAttached.read(reader)) {
                        return false;
                    }
                    return setting === true || setting === 'always' || setting === 'userGesture' && event.userGesture;
                });
            }, JSON.stringify);
        }
        async playAudioCue(cue, options = {}) {
            const alertMessage = cue.alertMessage;
            if (this.isAlertEnabled(cue, options.userGesture) && alertMessage) {
                this.accessibilityService.status(alertMessage);
            }
            if (this.isCueEnabled(cue, options.userGesture)) {
                this.sendAudioCueTelemetry(cue, options.source);
                await this.playSound(cue.sound.getSound(), options.allowManyInParallel);
            }
        }
        async playAudioCues(cues) {
            for (const cue of cues) {
                this.sendAudioCueTelemetry('cue' in cue ? cue.cue : cue, 'source' in cue ? cue.source : undefined);
            }
            const cueArray = cues.map(c => 'cue' in c ? c.cue : c);
            const alerts = cueArray.filter(cue => this.isAlertEnabled(cue)).map(c => c.alertMessage);
            if (alerts.length) {
                this.accessibilityService.status(alerts.join(', '));
            }
            // Some audio cues might reuse sounds. Don't play the same sound twice.
            const sounds = new Set(cueArray.filter(cue => this.isCueEnabled(cue)).map(cue => cue.sound.getSound()));
            await Promise.all(Array.from(sounds).map(sound => this.playSound(sound, true)));
        }
        sendAudioCueTelemetry(cue, source) {
            const isScreenReaderOptimized = this.accessibilityService.isScreenReaderOptimized();
            const key = cue.name + (source ? `::${source}` : '') + (isScreenReaderOptimized ? '{screenReaderOptimized}' : '');
            // Only send once per user session
            if (this.sentTelemetry.has(key) || this.getVolumeInPercent() === 0) {
                return;
            }
            this.sentTelemetry.add(key);
            this.telemetryService.publicLog2('audioCue.played', {
                audioCue: cue.name,
                source: source ?? '',
                isScreenReaderOptimized,
            });
        }
        getVolumeInPercent() {
            const volume = this.configurationService.getValue('audioCues.volume');
            if (typeof volume !== 'number') {
                return 50;
            }
            return Math.max(Math.min(volume, 100), 0);
        }
        async playSound(sound, allowManyInParallel = false) {
            if (!allowManyInParallel && this.playingSounds.has(sound)) {
                return;
            }
            this.playingSounds.add(sound);
            const url = network_1.FileAccess.asBrowserUri(`vs/platform/audioCues/browser/media/${sound.fileName}`).toString(true);
            try {
                const sound = this.sounds.get(url);
                if (sound) {
                    sound.volume = this.getVolumeInPercent() / 100;
                    sound.currentTime = 0;
                    await sound.play();
                }
                else {
                    const playedSound = await playAudio(url, this.getVolumeInPercent() / 100);
                    this.sounds.set(url, playedSound);
                }
            }
            catch (e) {
                if (!e.message.includes('play() can only be initiated by a user gesture')) {
                    // tracking this issue in #178642, no need to spam the console
                    console.error('Error while playing sound', e);
                }
            }
            finally {
                this.playingSounds.delete(sound);
            }
        }
        playAudioCueLoop(cue, milliseconds) {
            let playing = true;
            const playSound = () => {
                if (playing) {
                    this.playAudioCue(cue, { allowManyInParallel: true }).finally(() => {
                        setTimeout(() => {
                            if (playing) {
                                playSound();
                            }
                        }, milliseconds);
                    });
                }
            };
            playSound();
            return (0, lifecycle_1.toDisposable)(() => playing = false);
        }
        isAlertEnabled(cue, userGesture) {
            return this.isAlertEnabledCache.get({ cue, userGesture }).get() ?? false;
        }
        isCueEnabled(cue, userGesture) {
            return this.isCueEnabledCache.get({ cue, userGesture }).get() ?? false;
        }
        onEnabledChanged(cue) {
            return event_1.Event.fromObservableLight(this.isCueEnabledCache.get({ cue }));
        }
        onAlertEnabledChanged(cue) {
            return event_1.Event.fromObservableLight(this.isAlertEnabledCache.get({ cue }));
        }
    };
    exports.AudioCueService = AudioCueService;
    exports.AudioCueService = AudioCueService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, accessibility_1.IAccessibilityService),
        __param(2, telemetry_1.ITelemetryService)
    ], AudioCueService);
    /**
     * Play the given audio url.
     * @volume value between 0 and 1
     */
    function playAudio(url, volume) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            audio.volume = volume;
            audio.addEventListener('ended', () => {
                resolve(audio);
            });
            audio.addEventListener('error', (e) => {
                // When the error event fires, ended might not be called
                reject(e.error);
            });
            audio.play().catch(e => {
                // When play fails, the error event is not fired.
                reject(e);
            });
        });
    }
    class Cache {
        constructor(getValue, getKey) {
            this.getValue = getValue;
            this.getKey = getKey;
            this.map = new Map();
        }
        get(arg) {
            if (this.map.has(arg)) {
                return this.map.get(arg);
            }
            const value = this.getValue(arg);
            const key = this.getKey(arg);
            this.map.set(key, value);
            return value;
        }
    }
    /**
     * Corresponds to the audio files in ./media.
    */
    class Sound {
        static register(options) {
            const sound = new Sound(options.fileName);
            return sound;
        }
        static { this.error = Sound.register({ fileName: 'error.mp3' }); }
        static { this.warning = Sound.register({ fileName: 'warning.mp3' }); }
        static { this.foldedArea = Sound.register({ fileName: 'foldedAreas.mp3' }); }
        static { this.break = Sound.register({ fileName: 'break.mp3' }); }
        static { this.quickFixes = Sound.register({ fileName: 'quickFixes.mp3' }); }
        static { this.taskCompleted = Sound.register({ fileName: 'taskCompleted.mp3' }); }
        static { this.taskFailed = Sound.register({ fileName: 'taskFailed.mp3' }); }
        static { this.terminalBell = Sound.register({ fileName: 'terminalBell.mp3' }); }
        static { this.diffLineInserted = Sound.register({ fileName: 'diffLineInserted.mp3' }); }
        static { this.diffLineDeleted = Sound.register({ fileName: 'diffLineDeleted.mp3' }); }
        static { this.diffLineModified = Sound.register({ fileName: 'diffLineModified.mp3' }); }
        static { this.chatRequestSent = Sound.register({ fileName: 'chatRequestSent.mp3' }); }
        static { this.chatResponsePending = Sound.register({ fileName: 'chatResponsePending.mp3' }); }
        static { this.chatResponseReceived1 = Sound.register({ fileName: 'chatResponseReceived1.mp3' }); }
        static { this.chatResponseReceived2 = Sound.register({ fileName: 'chatResponseReceived2.mp3' }); }
        static { this.chatResponseReceived3 = Sound.register({ fileName: 'chatResponseReceived3.mp3' }); }
        static { this.chatResponseReceived4 = Sound.register({ fileName: 'chatResponseReceived4.mp3' }); }
        static { this.clear = Sound.register({ fileName: 'clear.mp3' }); }
        static { this.save = Sound.register({ fileName: 'save.mp3' }); }
        static { this.format = Sound.register({ fileName: 'format.mp3' }); }
        constructor(fileName) {
            this.fileName = fileName;
        }
    }
    exports.Sound = Sound;
    class SoundSource {
        constructor(randomOneOf) {
            this.randomOneOf = randomOneOf;
        }
        getSound(deterministic = false) {
            if (deterministic || this.randomOneOf.length === 1) {
                return this.randomOneOf[0];
            }
            else {
                const index = Math.floor(Math.random() * this.randomOneOf.length);
                return this.randomOneOf[index];
            }
        }
    }
    exports.SoundSource = SoundSource;
    var AccessibilityAlertSettingId;
    (function (AccessibilityAlertSettingId) {
        AccessibilityAlertSettingId["Save"] = "accessibility.alert.save";
        AccessibilityAlertSettingId["Format"] = "accessibility.alert.format";
        AccessibilityAlertSettingId["Clear"] = "accessibility.alert.clear";
        AccessibilityAlertSettingId["Breakpoint"] = "accessibility.alert.breakpoint";
        AccessibilityAlertSettingId["Error"] = "accessibility.alert.error";
        AccessibilityAlertSettingId["Warning"] = "accessibility.alert.warning";
        AccessibilityAlertSettingId["FoldedArea"] = "accessibility.alert.foldedArea";
        AccessibilityAlertSettingId["TerminalQuickFix"] = "accessibility.alert.terminalQuickFix";
        AccessibilityAlertSettingId["TerminalBell"] = "accessibility.alert.terminalBell";
        AccessibilityAlertSettingId["TerminalCommandFailed"] = "accessibility.alert.terminalCommandFailed";
        AccessibilityAlertSettingId["TaskCompleted"] = "accessibility.alert.taskCompleted";
        AccessibilityAlertSettingId["TaskFailed"] = "accessibility.alert.taskFailed";
        AccessibilityAlertSettingId["ChatRequestSent"] = "accessibility.alert.chatRequestSent";
        AccessibilityAlertSettingId["NotebookCellCompleted"] = "accessibility.alert.notebookCellCompleted";
        AccessibilityAlertSettingId["NotebookCellFailed"] = "accessibility.alert.notebookCellFailed";
        AccessibilityAlertSettingId["OnDebugBreak"] = "accessibility.alert.onDebugBreak";
        AccessibilityAlertSettingId["NoInlayHints"] = "accessibility.alert.noInlayHints";
        AccessibilityAlertSettingId["LineHasBreakpoint"] = "accessibility.alert.lineHasBreakpoint";
        AccessibilityAlertSettingId["ChatResponsePending"] = "accessibility.alert.chatResponsePending";
    })(AccessibilityAlertSettingId || (exports.AccessibilityAlertSettingId = AccessibilityAlertSettingId = {}));
    class AudioCue {
        static { this._audioCues = new Set(); }
        static register(options) {
            const soundSource = new SoundSource('randomOneOf' in options.sound ? options.sound.randomOneOf : [options.sound]);
            const audioCue = new AudioCue(soundSource, options.name, options.settingsKey, options.alertSettingsKey, options.alertMessage);
            AudioCue._audioCues.add(audioCue);
            return audioCue;
        }
        static get allAudioCues() {
            return [...this._audioCues];
        }
        static { this.error = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasError.name', 'Error on Line'),
            sound: Sound.error,
            settingsKey: 'audioCues.lineHasError',
            alertSettingsKey: "accessibility.alert.error" /* AccessibilityAlertSettingId.Error */,
            alertMessage: (0, nls_1.localize)('audioCues.lineHasError.alertMessage', 'Error')
        }); }
        static { this.warning = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasWarning.name', 'Warning on Line'),
            sound: Sound.warning,
            settingsKey: 'audioCues.lineHasWarning',
            alertSettingsKey: "accessibility.alert.warning" /* AccessibilityAlertSettingId.Warning */,
            alertMessage: (0, nls_1.localize)('audioCues.lineHasWarning.alertMessage', 'Warning')
        }); }
        static { this.foldedArea = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasFoldedArea.name', 'Folded Area on Line'),
            sound: Sound.foldedArea,
            settingsKey: 'audioCues.lineHasFoldedArea',
            alertSettingsKey: "accessibility.alert.foldedArea" /* AccessibilityAlertSettingId.FoldedArea */,
            alertMessage: (0, nls_1.localize)('audioCues.lineHasFoldedArea.alertMessage', 'Folded')
        }); }
        static { this.break = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasBreakpoint.name', 'Breakpoint on Line'),
            sound: Sound.break,
            settingsKey: 'audioCues.lineHasBreakpoint',
            alertSettingsKey: "accessibility.alert.breakpoint" /* AccessibilityAlertSettingId.Breakpoint */,
            alertMessage: (0, nls_1.localize)('audioCues.lineHasBreakpoint.alertMessage', 'Breakpoint')
        }); }
        static { this.inlineSuggestion = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasInlineSuggestion.name', 'Inline Suggestion on Line'),
            sound: Sound.quickFixes,
            settingsKey: 'audioCues.lineHasInlineSuggestion',
        }); }
        static { this.terminalQuickFix = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.terminalQuickFix.name', 'Terminal Quick Fix'),
            sound: Sound.quickFixes,
            settingsKey: 'audioCues.terminalQuickFix',
            alertSettingsKey: "accessibility.alert.terminalQuickFix" /* AccessibilityAlertSettingId.TerminalQuickFix */,
            alertMessage: (0, nls_1.localize)('audioCues.terminalQuickFix.alertMessage', 'Quick Fix')
        }); }
        static { this.onDebugBreak = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.onDebugBreak.name', 'Debugger Stopped on Breakpoint'),
            sound: Sound.break,
            settingsKey: 'audioCues.onDebugBreak',
            alertSettingsKey: "accessibility.alert.onDebugBreak" /* AccessibilityAlertSettingId.OnDebugBreak */,
            alertMessage: (0, nls_1.localize)('audioCues.onDebugBreak.alertMessage', 'Breakpoint')
        }); }
        static { this.noInlayHints = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.noInlayHints', 'No Inlay Hints on Line'),
            sound: Sound.error,
            settingsKey: 'audioCues.noInlayHints',
            alertSettingsKey: "accessibility.alert.noInlayHints" /* AccessibilityAlertSettingId.NoInlayHints */,
            alertMessage: (0, nls_1.localize)('audioCues.noInlayHints.alertMessage', 'No Inlay Hints')
        }); }
        static { this.taskCompleted = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.taskCompleted', 'Task Completed'),
            sound: Sound.taskCompleted,
            settingsKey: 'audioCues.taskCompleted',
            alertSettingsKey: "accessibility.alert.taskCompleted" /* AccessibilityAlertSettingId.TaskCompleted */,
            alertMessage: (0, nls_1.localize)('audioCues.taskCompleted.alertMessage', 'Task Completed')
        }); }
        static { this.taskFailed = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.taskFailed', 'Task Failed'),
            sound: Sound.taskFailed,
            settingsKey: 'audioCues.taskFailed',
            alertSettingsKey: "accessibility.alert.taskFailed" /* AccessibilityAlertSettingId.TaskFailed */,
            alertMessage: (0, nls_1.localize)('audioCues.taskFailed.alertMessage', 'Task Failed')
        }); }
        static { this.terminalCommandFailed = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.terminalCommandFailed', 'Terminal Command Failed'),
            sound: Sound.error,
            settingsKey: 'audioCues.terminalCommandFailed',
            alertSettingsKey: "accessibility.alert.terminalCommandFailed" /* AccessibilityAlertSettingId.TerminalCommandFailed */,
            alertMessage: (0, nls_1.localize)('audioCues.terminalCommandFailed.alertMessage', 'Command Failed')
        }); }
        static { this.terminalBell = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.terminalBell', 'Terminal Bell'),
            sound: Sound.terminalBell,
            settingsKey: 'audioCues.terminalBell',
            alertSettingsKey: "accessibility.alert.terminalBell" /* AccessibilityAlertSettingId.TerminalBell */,
            alertMessage: (0, nls_1.localize)('audioCues.terminalBell.alertMessage', 'Terminal Bell')
        }); }
        static { this.notebookCellCompleted = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.notebookCellCompleted', 'Notebook Cell Completed'),
            sound: Sound.taskCompleted,
            settingsKey: 'audioCues.notebookCellCompleted',
            alertSettingsKey: "accessibility.alert.notebookCellCompleted" /* AccessibilityAlertSettingId.NotebookCellCompleted */,
            alertMessage: (0, nls_1.localize)('audioCues.notebookCellCompleted.alertMessage', 'Notebook Cell Completed')
        }); }
        static { this.notebookCellFailed = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.notebookCellFailed', 'Notebook Cell Failed'),
            sound: Sound.taskFailed,
            settingsKey: 'audioCues.notebookCellFailed',
            alertSettingsKey: "accessibility.alert.notebookCellFailed" /* AccessibilityAlertSettingId.NotebookCellFailed */,
            alertMessage: (0, nls_1.localize)('audioCues.notebookCellFailed.alertMessage', 'Notebook Cell Failed')
        }); }
        static { this.diffLineInserted = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.diffLineInserted', 'Diff Line Inserted'),
            sound: Sound.diffLineInserted,
            settingsKey: 'audioCues.diffLineInserted',
        }); }
        static { this.diffLineDeleted = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.diffLineDeleted', 'Diff Line Deleted'),
            sound: Sound.diffLineDeleted,
            settingsKey: 'audioCues.diffLineDeleted',
        }); }
        static { this.diffLineModified = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.diffLineModified', 'Diff Line Modified'),
            sound: Sound.diffLineModified,
            settingsKey: 'audioCues.diffLineModified',
        }); }
        static { this.chatRequestSent = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.chatRequestSent', 'Chat Request Sent'),
            sound: Sound.chatRequestSent,
            settingsKey: 'audioCues.chatRequestSent',
            alertSettingsKey: "accessibility.alert.chatRequestSent" /* AccessibilityAlertSettingId.ChatRequestSent */,
            alertMessage: (0, nls_1.localize)('audioCues.chatRequestSent.alertMessage', 'Chat Request Sent')
        }); }
        static { this.chatResponseReceived = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.chatResponseReceived', 'Chat Response Received'),
            settingsKey: 'audioCues.chatResponseReceived',
            sound: {
                randomOneOf: [
                    Sound.chatResponseReceived1,
                    Sound.chatResponseReceived2,
                    Sound.chatResponseReceived3,
                    Sound.chatResponseReceived4
                ]
            },
        }); }
        static { this.chatResponsePending = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.chatResponsePending', 'Chat Response Pending'),
            sound: Sound.chatResponsePending,
            settingsKey: 'audioCues.chatResponsePending',
            alertSettingsKey: "accessibility.alert.chatResponsePending" /* AccessibilityAlertSettingId.ChatResponsePending */,
            alertMessage: (0, nls_1.localize)('audioCues.chatResponsePending.alertMessage', 'Chat Response Pending')
        }); }
        static { this.clear = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.clear', 'Clear'),
            sound: Sound.clear,
            settingsKey: 'audioCues.clear',
            alertSettingsKey: "accessibility.alert.clear" /* AccessibilityAlertSettingId.Clear */,
            alertMessage: (0, nls_1.localize)('audioCues.clear.alertMessage', 'Clear')
        }); }
        static { this.save = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.save', 'Save'),
            sound: Sound.save,
            settingsKey: 'audioCues.save',
            alertSettingsKey: "accessibility.alert.save" /* AccessibilityAlertSettingId.Save */,
            alertMessage: (0, nls_1.localize)('audioCues.save.alertMessage', 'Save')
        }); }
        static { this.format = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.format', 'Format'),
            sound: Sound.format,
            settingsKey: 'audioCues.format',
            alertSettingsKey: "accessibility.alert.format" /* AccessibilityAlertSettingId.Format */,
            alertMessage: (0, nls_1.localize)('audioCues.format.alertMessage', 'Format')
        }); }
        constructor(sound, name, settingsKey, alertSettingsKey, alertMessage) {
            this.sound = sound;
            this.name = name;
            this.settingsKey = settingsKey;
            this.alertSettingsKey = alertSettingsKey;
            this.alertMessage = alertMessage;
        }
    }
    exports.AudioCue = AudioCue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW9DdWVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hdWRpb0N1ZXMvYnJvd3Nlci9hdWRpb0N1ZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBWW5GLFFBQUEsZ0JBQWdCLEdBQUcsSUFBQSwrQkFBZSxFQUFtQixVQUFVLENBQUMsQ0FBQztJQTBCdkUsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSxzQkFBVTtRQVM5QyxZQUN3QixvQkFBNEQsRUFDNUQsb0JBQTRELEVBQ2hFLGdCQUFvRDtZQUV2RSxLQUFLLEVBQUUsQ0FBQztZQUpnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQVZ2RCxXQUFNLEdBQWtDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDbEQseUJBQW9CLEdBQUcsSUFBQSxnQ0FBbUIsRUFDMUQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGdDQUFnQyxFQUMxRCxHQUFHLEVBQUUsQ0FBQyx5RUFBeUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsdUJBQXVCLEVBQUUsQ0FDbkksQ0FBQztZQUNlLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQTRFbEMsa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBUyxDQUFDO1lBOENqQyw2QkFBd0IsR0FBRyxJQUFBLGdDQUFtQixFQUM5RCxhQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQ3RFLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUMzQyxFQUNELEdBQUcsRUFBRSxD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
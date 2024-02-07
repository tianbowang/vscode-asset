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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/speech/common/speechService", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/types", "vs/base/common/themables", "vs/base/common/codicons", "vs/base/browser/ui/aria/aria", "vs/nls"], function (require, exports, async_1, cancellation_1, lifecycle_1, configuration_1, instantiation_1, accessibilityConfiguration_1, speechService_1, terminal_1, types_1, themables_1, codicons_1, aria_1, nls_1) {
    "use strict";
    var TerminalVoiceSession_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalVoiceSession = void 0;
    const symbolMap = {
        'Ampersand': '&',
        'ampersand': '&',
        'Dollar': '$',
        'dollar': '$',
        'Percent': '%',
        'percent': '%',
        'Asterisk': '*',
        'asterisk': '*',
        'Plus': '+',
        'plus': '+',
        'Equals': '=',
        'equals': '=',
        'Exclamation': '!',
        'exclamation': '!',
        'Slash': '/',
        'slash': '/',
        'Backslash': '\\',
        'backslash': '\\',
        'Dot': '.',
        'dot': '.',
        'Period': '.',
        'period': '.',
        'Quote': '\'',
        'quote': '\'',
        'double quote': '"',
        'Double quote': '"',
    };
    let TerminalVoiceSession = class TerminalVoiceSession extends lifecycle_1.Disposable {
        static { TerminalVoiceSession_1 = this; }
        static { this._instance = undefined; }
        static getInstance(instantiationService) {
            if (!TerminalVoiceSession_1._instance) {
                TerminalVoiceSession_1._instance = instantiationService.createInstance(TerminalVoiceSession_1);
            }
            return TerminalVoiceSession_1._instance;
        }
        constructor(_speechService, _terminalService, configurationService, _instantationService) {
            super();
            this._speechService = _speechService;
            this._terminalService = _terminalService;
            this.configurationService = configurationService;
            this._instantationService = _instantationService;
            this._input = '';
            this._register(this._terminalService.onDidChangeActiveInstance(() => this.stop()));
            this._register(this._terminalService.onDidDisposeInstance(() => this.stop()));
            this._disposables = this._register(new lifecycle_1.DisposableStore());
        }
        start() {
            this.stop();
            let voiceTimeout = this.configurationService.getValue("accessibility.voice.speechTimeout" /* AccessibilityVoiceSettingId.SpeechTimeout */);
            if (!(0, types_1.isNumber)(voiceTimeout) || voiceTimeout < 0) {
                voiceTimeout = accessibilityConfiguration_1.SpeechTimeoutDefault;
            }
            this._acceptTranscriptionScheduler = this._disposables.add(new async_1.RunOnceScheduler(() => {
                this._sendText();
                this.stop();
            }, voiceTimeout));
            this._cancellationTokenSource = this._register(new cancellation_1.CancellationTokenSource());
            const session = this._disposables.add(this._speechService.createSpeechToTextSession(this._cancellationTokenSource.token));
            this._disposables.add(session.onDidChange((e) => {
                if (this._cancellationTokenSource?.token.isCancellationRequested) {
                    return;
                }
                switch (e.status) {
                    case speechService_1.SpeechToTextStatus.Started:
                        // TODO: play start audio cue
                        if (!this._decoration) {
                            this._createDecoration();
                        }
                        break;
                    case speechService_1.SpeechToTextStatus.Recognizing: {
                        this._updateInput(e);
                        this._renderGhostText(e);
                        if (voiceTimeout > 0) {
                            this._acceptTranscriptionScheduler.cancel();
                        }
                        break;
                    }
                    case speechService_1.SpeechToTextStatus.Recognized:
                        this._updateInput(e);
                        if (voiceTimeout > 0) {
                            this._acceptTranscriptionScheduler.schedule();
                        }
                        break;
                    case speechService_1.SpeechToTextStatus.Stopped:
                        // TODO: play stop audio cue
                        this.stop();
                        break;
                }
            }));
        }
        stop(send) {
            this._setInactive();
            if (send) {
                this._acceptTranscriptionScheduler.cancel();
                this._sendText();
            }
            this._marker?.dispose();
            this._ghostTextMarker?.dispose();
            this._ghostText?.dispose();
            this._ghostText = undefined;
            this._decoration?.dispose();
            this._decoration = undefined;
            this._cancellationTokenSource?.cancel();
            this._disposables.clear();
            this._input = '';
        }
        _sendText() {
            this._terminalService.activeInstance?.sendText(this._input, false);
            (0, aria_1.alert)((0, nls_1.localize)('terminalVoiceTextInserted', '{0} inserted', this._input));
        }
        _updateInput(e) {
            if (e.text) {
                let input = e.text.replaceAll(/[.,?;!]/g, '');
                for (const symbol of Object.entries(symbolMap)) {
                    input = input.replace(new RegExp('\\b' + symbol[0] + '\\b'), symbol[1]);
                }
                this._input = ' ' + input;
            }
        }
        _createDecoration() {
            const activeInstance = this._terminalService.activeInstance;
            const xterm = activeInstance?.xterm?.raw;
            if (!xterm) {
                return;
            }
            const onFirstLine = xterm.buffer.active.cursorY === 0;
            this._marker = activeInstance.registerMarker(onFirstLine ? 0 : -1);
            if (!this._marker) {
                return;
            }
            this._decoration = xterm.registerDecoration({
                marker: this._marker,
                layer: 'top',
                x: xterm.buffer.active.cursorX ?? 0,
            });
            this._decoration?.onRender((e) => {
                e.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.micFilled), 'terminal-voice', 'recording');
                e.style.transform = onFirstLine ? 'translate(10px, -2px)' : 'translate(-6px, -5px)';
            });
        }
        _setInactive() {
            this._decoration?.element?.classList.remove('recording');
        }
        _renderGhostText(e) {
            this._ghostText?.dispose();
            const text = e.text;
            if (!text) {
                return;
            }
            const activeInstance = this._terminalService.activeInstance;
            const xterm = activeInstance?.xterm?.raw;
            if (!xterm) {
                return;
            }
            this._ghostTextMarker = activeInstance.registerMarker();
            if (!this._ghostTextMarker) {
                return;
            }
            const onFirstLine = xterm.buffer.active.cursorY === 0;
            this._ghostText = xterm.registerDecoration({
                marker: this._ghostTextMarker,
                layer: 'top',
                x: onFirstLine ? xterm.buffer.active.cursorX + 4 : xterm.buffer.active.cursorX + 1 ?? 0,
            });
            this._ghostText?.onRender((e) => {
                e.classList.add('terminal-voice-progress-text');
                e.textContent = text;
                e.style.width = (xterm.cols - xterm.buffer.active.cursorX) / xterm.cols * 100 + '%';
            });
        }
    };
    exports.TerminalVoiceSession = TerminalVoiceSession;
    exports.TerminalVoiceSession = TerminalVoiceSession = TerminalVoiceSession_1 = __decorate([
        __param(0, speechService_1.ISpeechService),
        __param(1, terminal_1.ITerminalService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, instantiation_1.IInstantiationService)
    ], TerminalVoiceSession);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxWb2ljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbFZvaWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLE1BQU0sU0FBUyxHQUE4QjtRQUM1QyxXQUFXLEVBQUUsR0FBRztRQUNoQixXQUFXLEVBQUUsR0FBRztRQUNoQixRQUFRLEVBQUUsR0FBRztRQUNiLFFBQVEsRUFBRSxHQUFHO1FBQ2IsU0FBUyxFQUFFLEdBQUc7UUFDZCxTQUFTLEVBQUUsR0FBRztRQUNkLFVBQVUsRUFBRSxHQUFHO1FBQ2YsVUFBVSxFQUFFLEdBQUc7UUFDZixNQUFNLEVBQUUsR0FBRztRQUNYLE1BQU0sRUFBRSxHQUFHO1FBQ1gsUUFBUSxFQUFFLEdBQUc7UUFDYixRQUFRLEVBQUUsR0FBRztRQUNiLGFBQWEsRUFBRSxHQUFHO1FBQ2xCLGFBQWEsRUFBRSxHQUFHO1FBQ2xCLE9BQU8sRUFBRSxHQUFHO1FBQ1osT0FBTyxFQUFFLEdBQUc7UUFDWixXQUFXLEVBQUUsSUFBSTtRQUNqQixXQUFXLEVBQUUsSUFBSTtRQUNqQixLQUFLLEVBQUUsR0FBRztRQUNWLEtBQUssRUFBRSxHQUFHO1FBQ1YsUUFBUSxFQUFFLEdBQUc7UUFDYixRQUFRLEVBQUUsR0FBRztRQUNiLE9BQU8sRUFBRSxJQUFJO1FBQ2IsT0FBTyxFQUFFLElBQUk7UUFDYixjQUFjLEVBQUUsR0FBRztRQUNuQixjQUFjLEVBQUUsR0FBRztLQUNuQixDQUFDO0lBRUssSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBVTs7aUJBTXBDLGNBQVMsR0FBcUMsU0FBUyxBQUE5QyxDQUErQztRQUV2RSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUEyQztZQUM3RCxJ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
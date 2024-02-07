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
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log"], function (require, exports, nls_1, arrays_1, event_1, lifecycle_1, contextkey_1, instantiation_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeechService = exports.KeywordRecognitionStatus = exports.SpeechToTextStatus = exports.SpeechToTextInProgress = exports.HasSpeechProvider = exports.ISpeechService = void 0;
    exports.ISpeechService = (0, instantiation_1.createDecorator)('speechService');
    exports.HasSpeechProvider = new contextkey_1.RawContextKey('hasSpeechProvider', false, { type: 'string', description: (0, nls_1.localize)('hasSpeechProvider', "A speech provider is registered to the speech service.") });
    exports.SpeechToTextInProgress = new contextkey_1.RawContextKey('speechToTextInProgress', false, { type: 'string', description: (0, nls_1.localize)('speechToTextInProgress', "A speech-to-text session is in progress.") });
    var SpeechToTextStatus;
    (function (SpeechToTextStatus) {
        SpeechToTextStatus[SpeechToTextStatus["Started"] = 1] = "Started";
        SpeechToTextStatus[SpeechToTextStatus["Recognizing"] = 2] = "Recognizing";
        SpeechToTextStatus[SpeechToTextStatus["Recognized"] = 3] = "Recognized";
        SpeechToTextStatus[SpeechToTextStatus["Stopped"] = 4] = "Stopped";
    })(SpeechToTextStatus || (exports.SpeechToTextStatus = SpeechToTextStatus = {}));
    var KeywordRecognitionStatus;
    (function (KeywordRecognitionStatus) {
        KeywordRecognitionStatus[KeywordRecognitionStatus["Recognized"] = 1] = "Recognized";
        KeywordRecognitionStatus[KeywordRecognitionStatus["Stopped"] = 2] = "Stopped";
    })(KeywordRecognitionStatus || (exports.KeywordRecognitionStatus = KeywordRecognitionStatus = {}));
    let SpeechService = class SpeechService extends lifecycle_1.Disposable {
        get hasSpeechProvider() { return this.providers.size > 0; }
        constructor(logService, contextKeyService) {
            super();
            this.logService = logService;
            this.contextKeyService = contextKeyService;
            this._onDidRegisterSpeechProvider = this._register(new event_1.Emitter());
            this.onDidRegisterSpeechProvider = this._onDidRegisterSpeechProvider.event;
            this._onDidUnregisterSpeechProvider = this._register(new event_1.Emitter());
            this.onDidUnregisterSpeechProvider = this._onDidUnregisterSpeechProvider.event;
            this.providers = new Map();
            this.hasSpeechProviderContext = exports.HasSpeechProvider.bindTo(this.contextKeyService);
            this._onDidStartSpeechToTextSession = this._register(new event_1.Emitter());
            this.onDidStartSpeechToTextSession = this._onDidStartSpeechToTextSession.event;
            this._onDidEndSpeechToTextSession = this._register(new event_1.Emitter());
            this.onDidEndSpeechToTextSession = this._onDidEndSpeechToTextSession.event;
            this._activeSpeechToTextSession = undefined;
            this.speechToTextInProgress = exports.SpeechToTextInProgress.bindTo(this.contextKeyService);
            this._onDidStartKeywordRecognition = this._register(new event_1.Emitter());
            this.onDidStartKeywordRecognition = this._onDidStartKeywordRecognition.event;
            this._onDidEndKeywordRecognition = this._register(new event_1.Emitter());
            this.onDidEndKeywordRecognition = this._onDidEndKeywordRecognition.event;
            this._activeKeywordRecognitionSession = undefined;
        }
        registerSpeechProvider(identifier, provider) {
            if (this.providers.has(identifier)) {
                throw new Error(`Speech provider with identifier ${identifier} is already registered.`);
            }
            this.providers.set(identifier, provider);
            this.hasSpeechProviderContext.set(true);
            this._onDidRegisterSpeechProvider.fire(provider);
            return (0, lifecycle_1.toDisposable)(() => {
                this.providers.delete(identifier);
                this._onDidUnregisterSpeechProvider.fire(provider);
                if (this.providers.size === 0) {
                    this.hasSpeechProviderContext.set(false);
                }
            });
        }
        get hasActiveSpeechToTextSession() { return !!this._activeSpeechToTextSession; }
        createSpeechToTextSession(token) {
            const provider = (0, arrays_1.firstOrDefault)(Array.from(this.providers.values()));
            if (!provider) {
                throw new Error(`No Speech provider is registered.`);
            }
            else if (this.providers.size > 1) {
                this.logService.warn(`Multiple speech providers registered. Picking first one: ${provider.metadata.displayName}`);
            }
            const session = this._activeSpeechToTextSession = provider.createSpeechToTextSession(token);
            const disposables = new lifecycle_1.DisposableStore();
            const onSessionStoppedOrCanceled = () => {
                if (session === this._activeSpeechToTextSession) {
                    this._activeSpeechToTextSession = undefined;
                    this.speechToTextInProgress.reset();
                    this._onDidEndSpeechToTextSession.fire();
                }
                disposables.dispose();
            };
            disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled()));
            if (token.isCancellationRequested) {
                onSessionStoppedOrCanceled();
            }
            disposables.add(session.onDidChange(e => {
                switch (e.status) {
                    case SpeechToTextStatus.Started:
                        if (session === this._activeSpeechToTextSession) {
                            this.speechToTextInProgress.set(true);
                            this._onDidStartSpeechToTextSession.fire();
                        }
                        break;
                    case SpeechToTextStatus.Stopped:
                        onSessionStoppedOrCanceled();
                        break;
                }
            }));
            return session;
        }
        get hasActiveKeywordRecognition() { return !!this._activeKeywordRecognitionSession; }
        async recognizeKeyword(token) {
            const provider = (0, arrays_1.firstOrDefault)(Array.from(this.providers.values()));
            if (!provider) {
                throw new Error(`No Speech provider is registered.`);
            }
            else if (this.providers.size > 1) {
                this.logService.warn(`Multiple speech providers registered. Picking first one: ${provider.metadata.displayName}`);
            }
            const session = this._activeKeywordRecognitionSession = provider.createKeywordRecognitionSession(token);
            this._onDidStartKeywordRecognition.fire();
            const disposables = new lifecycle_1.DisposableStore();
            const onSessionStoppedOrCanceled = () => {
                if (session === this._activeKeywordRecognitionSession) {
                    this._activeKeywordRecognitionSession = undefined;
                    this._onDidEndKeywordRecognition.fire();
                }
                disposables.dispose();
            };
            disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled()));
            if (token.isCancellationRequested) {
                onSessionStoppedOrCanceled();
            }
            disposables.add(session.onDidChange(e => {
                if (e.status === KeywordRecognitionStatus.Stopped) {
                    onSessionStoppedOrCanceled();
                }
            }));
            try {
                return (await event_1.Event.toPromise(session.onDidChange)).status;
            }
            finally {
                onSessionStoppedOrCanceled();
            }
        }
    };
    exports.SpeechService = SpeechService;
    exports.SpeechService = SpeechService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, contextkey_1.IContextKeyService)
    ], SpeechService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlZWNoU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc3BlZWNoL2NvbW1vbi9zcGVlY2hTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVluRixRQUFBLGNBQWMsR0FBRyxJQUFBLCtCQUFlLEVBQWlCLGVBQWUsQ0FBQyxDQUFDO0lBRWxFLFFBQUEsaUJBQWlCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG1CQUFtQixFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLHdEQUF3RCxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JNLFFBQUEsc0JBQXNCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHdCQUF3QixFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHdCQUF3QixFQUFFLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBT25OLElBQVksa0JBS1g7SUFMRCxXQUFZLGtCQUFrQjtRQUM3QixpRUFBVyxDQUFBO1FBQ1gseUVBQWUsQ0FBQTtRQUNmLHVFQUFjLENBQUE7UUFDZCxpRUFBVyxDQUFBO0lBQ1osQ0FBQyxFQUxXLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBSzdCO0lBV0QsSUFBWSx3QkFHWDtJQUhELFdBQVksd0JBQXdCO1FBQ25DLG1GQUFjLENBQUE7UUFDZCw2RUFBVyxDQUFBO0lBQ1osQ0FBQyxFQUhXLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBR25DO0lBcURNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxzQkFBVTtRQVU1QyxJQUFJLGlCQUFpQixLQUFLLE9BQU8sSUFBSSxDQUFDLFNBQVMs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
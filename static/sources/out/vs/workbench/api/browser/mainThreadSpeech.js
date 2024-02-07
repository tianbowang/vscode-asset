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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/speech/common/speechService", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, cancellation_1, event_1, lifecycle_1, log_1, extHost_protocol_1, speechService_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadSpeech = void 0;
    let MainThreadSpeech = class MainThreadSpeech {
        constructor(extHostContext, speechService, logService) {
            this.speechService = speechService;
            this.logService = logService;
            this.providerRegistrations = new Map();
            this.speechToTextSessions = new Map();
            this.keywordRecognitionSessions = new Map();
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostSpeech);
        }
        $registerProvider(handle, identifier, metadata) {
            this.logService.trace('[Speech] extension registered provider', metadata.extension.value);
            const registration = this.speechService.registerSpeechProvider(identifier, {
                metadata,
                createSpeechToTextSession: token => {
                    const disposables = new lifecycle_1.DisposableStore();
                    const cts = new cancellation_1.CancellationTokenSource(token);
                    const session = Math.random();
                    this.proxy.$createSpeechToTextSession(handle, session);
                    disposables.add(token.onCancellationRequested(() => this.proxy.$cancelSpeechToTextSession(session)));
                    const onDidChange = disposables.add(new event_1.Emitter());
                    this.speechToTextSessions.set(session, { onDidChange });
                    return {
                        onDidChange: onDidChange.event,
                        dispose: () => {
                            cts.dispose(true);
                            this.speechToTextSessions.delete(session);
                            disposables.dispose();
                        }
                    };
                },
                createKeywordRecognitionSession: token => {
                    const disposables = new lifecycle_1.DisposableStore();
                    const cts = new cancellation_1.CancellationTokenSource(token);
                    const session = Math.random();
                    this.proxy.$createKeywordRecognitionSession(handle, session);
                    disposables.add(token.onCancellationRequested(() => this.proxy.$cancelKeywordRecognitionSession(session)));
                    const onDidChange = disposables.add(new event_1.Emitter());
                    this.keywordRecognitionSessions.set(session, { onDidChange });
                    return {
                        onDidChange: onDidChange.event,
                        dispose: () => {
                            cts.dispose(true);
                            this.keywordRecognitionSessions.delete(session);
                            disposables.dispose();
                        }
                    };
                }
            });
            this.providerRegistrations.set(handle, {
                dispose: () => {
                    registration.dispose();
                }
            });
        }
        $unregisterProvider(handle) {
            const registration = this.providerRegistrations.get(handle);
            if (registration) {
                registration.dispose();
                this.providerRegistrations.delete(handle);
            }
        }
        $emitSpeechToTextEvent(session, event) {
            const providerSession = this.speechToTextSessions.get(session);
            providerSession?.onDidChange.fire(event);
        }
        $emitKeywordRecognitionEvent(session, event) {
            const providerSession = this.keywordRecognitionSessions.get(session);
            providerSession?.onDidChange.fire(event);
        }
        dispose() {
            this.providerRegistrations.forEach(disposable => disposable.dispose());
            this.providerRegistrations.clear();
            this.speechToTextSessions.forEach(session => session.onDidChange.dispose());
            this.speechToTextSessions.clear();
            this.keywordRecognitionSessions.forEach(session => session.onDidChange.dispose());
            this.keywordRecognitionSessions.clear();
        }
    };
    exports.MainThreadSpeech = MainThreadSpeech;
    exports.MainThreadSpeech = MainThreadSpeech = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadSpeech),
        __param(1, speechService_1.ISpeechService),
        __param(2, log_1.ILogService)
    ], MainThreadSpeech);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFNwZWVjaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRTcGVlY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFnQjtRQVM1QixZQUNDLGNBQStCLEVBQ2YsYUFBOEMsRUFDakQsVUFBd0M7WUFEcEIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ2hDLGVBQVUsR0FBVixVQUFVLENBQWE7WUFSckMsMEJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7WUFFdkQseUJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQStCLENBQUM7WUFDOUQsK0JBQTBCLEdBQUcsSUFBSSxHQUFHLEVBQXFDLENBQUM7WUFPMUYsSUFBSSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVELGlCQUFpQixDQUFDLE1BQWMsRUFBRSxVQUFrQixFQUFFLFFBQWlDO1lBQ3RGLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFMUYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUU7Z0JBQzFFLFFBQVE7Z0JBQ1IseUJBQXlCLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ2xDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO29CQUMxQyxNQUFNLEdBQUcsR0FBRyxJQUFJLHNDQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMvQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENB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
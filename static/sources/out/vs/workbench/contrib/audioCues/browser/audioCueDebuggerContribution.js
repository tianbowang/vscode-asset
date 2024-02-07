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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/platform/audioCues/browser/audioCueService", "vs/workbench/contrib/debug/common/debug"], function (require, exports, lifecycle_1, observable_1, audioCueService_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AudioCueLineDebuggerContribution = void 0;
    let AudioCueLineDebuggerContribution = class AudioCueLineDebuggerContribution extends lifecycle_1.Disposable {
        constructor(debugService, audioCueService) {
            super();
            this.audioCueService = audioCueService;
            const isEnabled = (0, observable_1.observableFromEvent)(audioCueService.onEnabledChanged(audioCueService_1.AudioCue.onDebugBreak), () => audioCueService.isCueEnabled(audioCueService_1.AudioCue.onDebugBreak));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description subscribe to debug sessions */
                if (!isEnabled.read(reader)) {
                    return;
                }
                const sessionDisposables = new Map();
                store.add((0, lifecycle_1.toDisposable)(() => {
                    sessionDisposables.forEach(d => d.dispose());
                    sessionDisposables.clear();
                }));
                store.add(debugService.onDidNewSession((session) => sessionDisposables.set(session, this.handleSession(session))));
                store.add(debugService.onDidEndSession(({ session }) => {
                    sessionDisposables.get(session)?.dispose();
                    sessionDisposables.delete(session);
                }));
                debugService
                    .getModel()
                    .getSessions()
                    .forEach((session) => sessionDisposables.set(session, this.handleSession(session)));
            }));
        }
        handleSession(session) {
            return session.onDidChangeState(e => {
                const stoppedDetails = session.getStoppedDetails();
                const BREAKPOINT_STOP_REASON = 'breakpoint';
                if (stoppedDetails && stoppedDetails.reason === BREAKPOINT_STOP_REASON) {
                    this.audioCueService.playAudioCue(audioCueService_1.AudioCue.onDebugBreak);
                }
            });
        }
    };
    exports.AudioCueLineDebuggerContribution = AudioCueLineDebuggerContribution;
    exports.AudioCueLineDebuggerContribution = AudioCueLineDebuggerContribution = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, audioCueService_1.IAudioCueService)
    ], AudioCueLineDebuggerContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW9DdWVEZWJ1Z2dlckNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYXVkaW9DdWVzL2Jyb3dzZXIvYXVkaW9DdWVEZWJ1Z2dlckNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRekYsSUFBTSxnQ0FBZ0MsR0FBdEMsTUFBTSxnQ0FDWixTQUFRLHNCQUFVO1FBR2xCLFlBQ2dCLFlBQTJCLEVBQ1AsZUFBZ0M7WUFFbkUsS0FBSyxFQUFFLENBQUM7WUFGMkIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBSW5FLE1BQU0sU0FBUyxHQUFHLElBQUEsZ0NBQW1CLEVBQ3BDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQywwQkFBUSxDQUFDLFlBQVksQ0FBQyxFQUN2RCxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLDBCQUFRLENBQUMsWUFBWSxDQUFDLENBQ3pELENBQUM7WUFDRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsNkJBQWdCLEVBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ2pELCtDQUErQztnQkFDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDN0IsT0FBTztnQkFDUixDQUFDO2dCQUVELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQThCLENBQUM7Z0JBQ2pFLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtvQkFDM0Isa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQzdDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLEtBQUssQ0FBQyxHQUFHLENBQ1IsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQ3hDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUM1RCxDQUNELENBQUM7Z0JBRUYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO29CQUN0RCxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUM7b0JBQzNDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFSixZQUFZO3FCQUNWLFFBQVEsRUFBRTtxQkFDVixXQUFXLEVBQUU7cUJBQ2IsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FDcEIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQzVELENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLGFBQWEsQ0FBQyxPQUFzQjtZQUMzQyxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ25ELE1BQU0sc0JBQXNCLEdBQUcsWUFBWSxDQUFDO2dCQUM1QyxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsTUFBTSxLQUFLLHNCQUFzQixFQUFFLENBQUM7b0JBQ3hFLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLDBCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzFELENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUVKLENBQUM7S0FDRCxDQUFBO0lBeERZLDRFQUFnQzsrQ0FBaEMsZ0NBQWdDO1FBSzFDLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsa0NBQWdCLENBQUE7T0FOTixnQ0FBZ0MsQ0F3RDVDIn0=
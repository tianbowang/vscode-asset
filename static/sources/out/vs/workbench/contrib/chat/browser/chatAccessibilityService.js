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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/audioCues/browser/audioCueService", "vs/platform/instantiation/common/instantiation"], function (require, exports, aria_1, async_1, lifecycle_1, audioCueService_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatAccessibilityService = void 0;
    let ChatAccessibilityService = class ChatAccessibilityService extends lifecycle_1.Disposable {
        constructor(_audioCueService, _instantiationService) {
            super();
            this._audioCueService = _audioCueService;
            this._instantiationService = _instantiationService;
            this._pendingCueMap = this._register(new lifecycle_1.DisposableMap());
            this._requestId = 0;
        }
        acceptRequest() {
            this._requestId++;
            this._audioCueService.playAudioCue(audioCueService_1.AudioCue.chatRequestSent, { allowManyInParallel: true });
            this._pendingCueMap.set(this._requestId, this._instantiationService.createInstance(AudioCueScheduler));
            return this._requestId;
        }
        acceptResponse(response, requestId) {
            this._pendingCueMap.deleteAndDispose(requestId);
            const isPanelChat = typeof response !== 'string';
            const responseContent = typeof response === 'string' ? response : response?.response.asString();
            this._audioCueService.playAudioCue(audioCueService_1.AudioCue.chatResponseReceived, { allowManyInParallel: true });
            if (!response) {
                return;
            }
            const errorDetails = isPanelChat && response.errorDetails ? ` ${response.errorDetails.message}` : '';
            (0, aria_1.status)(responseContent + errorDetails);
        }
    };
    exports.ChatAccessibilityService = ChatAccessibilityService;
    exports.ChatAccessibilityService = ChatAccessibilityService = __decorate([
        __param(0, audioCueService_1.IAudioCueService),
        __param(1, instantiation_1.IInstantiationService)
    ], ChatAccessibilityService);
    const CHAT_RESPONSE_PENDING_AUDIO_CUE_LOOP_MS = 5000;
    const CHAT_RESPONSE_PENDING_ALLOWANCE_MS = 4000;
    /**
     * Schedules an audio cue to play when a chat response is pending for too long.
     */
    let AudioCueScheduler = class AudioCueScheduler extends lifecycle_1.Disposable {
        constructor(_audioCueService) {
            super();
            this._audioCueService = _audioCueService;
            this._scheduler = new async_1.RunOnceScheduler(() => {
                this._audioCueLoop = this._audioCueService.playAudioCueLoop(audioCueService_1.AudioCue.chatResponsePending, CHAT_RESPONSE_PENDING_AUDIO_CUE_LOOP_MS);
            }, CHAT_RESPONSE_PENDING_ALLOWANCE_MS);
            this._scheduler.schedule();
        }
        dispose() {
            super.dispose();
            this._audioCueLoop?.dispose();
            this._scheduler.cancel();
            this._scheduler.dispose();
        }
    };
    AudioCueScheduler = __decorate([
        __param(0, audioCueService_1.IAudioCueService)
    ], AudioCueScheduler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEFjY2Vzc2liaWxpdHlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2Jyb3dzZXIvY2hhdEFjY2Vzc2liaWxpdHlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVV6RixJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLHNCQUFVO1FBUXZELFlBQThCLGdCQUFtRCxFQUF5QixxQkFBNkQ7WUFDdEssS0FBSyxFQUFFLENBQUM7WUFEc0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUEwQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBSi9KLG1CQUFjLEdBQTZDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx5QkFBYSxFQUFFLENBQUMsQ0FBQztZQUUvRixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBSS9CLENBQUM7UUFDRCxhQUFhO1lBQ1osSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsMEJBQVEsQ0FBQyxlQUFlLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDdkcsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxjQUFjLENBQUMsUUFBcUQsRUFBRSxTQUFpQjtZQUN0RixJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sV0FBVyxHQUFHLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQztZQUNqRCxNQUFNLGVBQWUsR0FBRyxPQUFPLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLDBCQUFRLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2pHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDZixPQUFPO1lBQ1IsQ0FBQztZQUNELE1BQU0sWUFBWSxHQUFHLFdBQVcsSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNyRyxJQUFBLGFBQU0sRUFBQyxlQUFlLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUNELENBQUE7SUE1QlksNERBQXdCO3VDQUF4Qix3QkFBd0I7UUFRdkIsV0FBQSxrQ0FBZ0IsQ0FBQTtRQUF1RCxXQUFBLHFDQUFxQixDQUFBO09BUjdGLHdCQUF3QixDQTRCcEM7SUFFRCxNQUFNLHVDQUF1QyxHQUFHLElBQUksQ0FBQztJQUNyRCxNQUFNLGtDQUFrQyxHQUFHLElBQUksQ0FBQztJQUNoRDs7T0FFRztJQUNILElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsc0JBQVU7UUFHekMsWUFBK0MsZ0JBQWtDO1lBQ2hGLEtBQUssRUFBRSxDQUFDO1lBRHNDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFFaEYsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsMEJBQVEsQ0FBQyxtQkFBbUIsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO1lBQ3BJLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUNRLE9BQU87WUFDZixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0IsQ0FBQztLQUNELENBQUE7SUFoQkssaUJBQWlCO1FBR1QsV0FBQSxrQ0FBZ0IsQ0FBQTtPQUh4QixpQkFBaUIsQ0FnQnRCIn0=
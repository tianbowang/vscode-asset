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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/audioCues/browser/audioCueService", "vs/workbench/services/workingCopy/common/workingCopyService"], function (require, exports, lifecycle_1, audioCueService_1, workingCopyService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SaveAudioCueContribution = void 0;
    let SaveAudioCueContribution = class SaveAudioCueContribution extends lifecycle_1.Disposable {
        constructor(_audioCueService, _workingCopyService) {
            super();
            this._audioCueService = _audioCueService;
            this._workingCopyService = _workingCopyService;
            this._register(this._workingCopyService.onDidSave((e) => {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.save, { userGesture: e.reason === 1 /* SaveReason.EXPLICIT */ });
            }));
        }
    };
    exports.SaveAudioCueContribution = SaveAudioCueContribution;
    exports.SaveAudioCueContribution = SaveAudioCueContribution = __decorate([
        __param(0, audioCueService_1.IAudioCueService),
        __param(1, workingCopyService_1.IWorkingCopyService)
    ], SaveAudioCueContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZUF1ZGlvQ3VlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9hY2Nlc3NpYmlsaXR5L2Jyb3dzZXIvc2F2ZUF1ZGlvQ3VlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVF6RixJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLHNCQUFVO1FBQ3ZELFlBQ29DLGdCQUFrQyxFQUMvQixtQkFBd0M7WUFFOUUsS0FBSyxFQUFFLENBQUM7WUFIMkIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUMvQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBRzlFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUN2RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLDBCQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNLGdDQUF3QixFQUFFLENBQUMsQ0FBQztZQUN0RyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNELENBQUE7SUFWWSw0REFBd0I7dUNBQXhCLHdCQUF3QjtRQUVsQyxXQUFBLGtDQUFnQixDQUFBO1FBQ2hCLFdBQUEsd0NBQW1CLENBQUE7T0FIVCx3QkFBd0IsQ0FVcEMifQ==
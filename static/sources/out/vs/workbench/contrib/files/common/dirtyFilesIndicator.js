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
define(["require", "exports", "vs/nls", "vs/workbench/contrib/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/lifecycle", "vs/workbench/services/activity/common/activity", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, nls, files_1, lifecycle_1, lifecycle_2, activity_1, workingCopyService_1, filesConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DirtyFilesIndicator = void 0;
    let DirtyFilesIndicator = class DirtyFilesIndicator extends lifecycle_2.Disposable {
        constructor(lifecycleService, activityService, workingCopyService, filesConfigurationService) {
            super();
            this.lifecycleService = lifecycleService;
            this.activityService = activityService;
            this.workingCopyService = workingCopyService;
            this.filesConfigurationService = filesConfigurationService;
            this.badgeHandle = this._register(new lifecycle_2.MutableDisposable());
            this.lastKnownDirtyCount = 0;
            this.updateActivityBadge();
            this.registerListeners();
        }
        registerListeners() {
            // Working copy dirty indicator
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onWorkingCopyDidChangeDirty(workingCopy)));
            // Lifecycle
            this.lifecycleService.onDidShutdown(() => this.dispose());
        }
        onWorkingCopyDidChangeDirty(workingCopy) {
            const gotDirty = workingCopy.isDirty();
            if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.filesConfigurationService.hasShortAutoSaveDelay(workingCopy.resource)) {
                return; // do not indicate dirty of working copies that are auto saved after short delay
            }
            if (gotDirty || this.lastKnownDirtyCount > 0) {
                this.updateActivityBadge();
            }
        }
        updateActivityBadge() {
            const dirtyCount = this.lastKnownDirtyCount = this.workingCopyService.dirtyCount;
            // Indicate dirty count in badge if any
            if (dirtyCount > 0) {
                this.badgeHandle.value = this.activityService.showViewContainerActivity(files_1.VIEWLET_ID, {
                    badge: new activity_1.NumberBadge(dirtyCount, num => num === 1 ? nls.localize('dirtyFile', "1 unsaved file") : nls.localize('dirtyFiles', "{0} unsaved files", dirtyCount)),
                });
            }
            else {
                this.badgeHandle.clear();
            }
        }
    };
    exports.DirtyFilesIndicator = DirtyFilesIndicator;
    exports.DirtyFilesIndicator = DirtyFilesIndicator = __decorate([
        __param(0, lifecycle_1.ILifecycleService),
        __param(1, activity_1.IActivityService),
        __param(2, workingCopyService_1.IWorkingCopyService),
        __param(3, filesConfigurationService_1.IFilesConfigurationService)
    ], DirtyFilesIndicator);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlydHlGaWxlc0luZGljYXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvY29tbW9uL2RpcnR5RmlsZXNJbmRpY2F0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBWXpGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7UUFLbEQsWUFDb0IsZ0JBQW9ELEVBQ3JELGVBQWtELEVBQy9DLGtCQUF3RCxFQUNqRCx5QkFBc0U7WUFFbEcsS0FBSyxFQUFFLENBQUM7WUFMNEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNwQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDOUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUNoQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTRCO1lBUmxGLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztZQUUvRCx3QkFBbUIsR0FBRyxDQUFDLENBQUM7WUFVL0IsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFFM0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QiwrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZILFlBQVk7WUFDWixJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFTywyQkFBMkIsQ0FBQyxXQUF5QjtZQUM1RCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkMsSUFBSSxRQUFRLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLDJDQUFtQyxDQUFDLElBQUksSUFBSSxDQUFDLHlCQUF5QixDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUM5SixPQUFPLENBQUMsZ0ZBQWdGO1lBQ3pGLENBQUM7WUFFRCxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzVCLENBQUM7UUFDRixDQUFDO1FBRU8sbUJBQW1CO1lBQzFCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO1lBRWpGLHVDQUF1QztZQUN2QyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyx5QkFBeUIsQ0FDdEUsa0JBQVUsRUFDVjtvQkFDQyxLQUFLLEVBQUUsSUFBSSxzQkFBVyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUNoSyxDQUNELENBQUM7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQixDQUFDO1FBQ0YsQ0FBQztLQUNELENBQUE7SUFyRFksa0RBQW1CO2tDQUFuQixtQkFBbUI7UUFNN0IsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsd0NBQW1CLENBQUE7UUFDbkIsV0FBQSxzREFBMEIsQ0FBQTtPQVRoQixtQkFBbUIsQ0FxRC9CIn0=
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
define(["require", "exports", "vs/base/common/event", "vs/workbench/contrib/debug/common/debug", "vs/platform/progress/common/progress", "vs/base/common/lifecycle", "vs/workbench/services/views/common/viewsService", "vs/platform/notification/common/notification"], function (require, exports, event_1, debug_1, progress_1, lifecycle_1, viewsService_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugProgressContribution = void 0;
    let DebugProgressContribution = class DebugProgressContribution {
        constructor(debugService, progressService, viewsService) {
            this.toDispose = [];
            let progressListener;
            const listenOnProgress = (session) => {
                if (progressListener) {
                    progressListener.dispose();
                    progressListener = undefined;
                }
                if (session) {
                    progressListener = session.onDidProgressStart(async (progressStartEvent) => {
                        const promise = new Promise(r => {
                            // Show progress until a progress end event comes or the session ends
                            const listener = event_1.Event.any(event_1.Event.filter(session.onDidProgressEnd, e => e.body.progressId === progressStartEvent.body.progressId), session.onDidEndAdapter)(() => {
                                listener.dispose();
                                r();
                            });
                        });
                        if (viewsService.isViewContainerVisible(debug_1.VIEWLET_ID)) {
                            progressService.withProgress({ location: debug_1.VIEWLET_ID }, () => promise);
                        }
                        const source = debugService.getAdapterManager().getDebuggerLabel(session.configuration.type);
                        progressService.withProgress({
                            location: 15 /* ProgressLocation.Notification */,
                            title: progressStartEvent.body.title,
                            cancellable: progressStartEvent.body.cancellable,
                            priority: notification_1.NotificationPriority.SILENT,
                            source,
                            delay: 500
                        }, progressStep => {
                            let total = 0;
                            const reportProgress = (progress) => {
                                let increment = undefined;
                                if (typeof progress.percentage === 'number') {
                                    increment = progress.percentage - total;
                                    total += increment;
                                }
                                progressStep.report({
                                    message: progress.message,
                                    increment,
                                    total: typeof increment === 'number' ? 100 : undefined,
                                });
                            };
                            if (progressStartEvent.body.message) {
                                reportProgress(progressStartEvent.body);
                            }
                            const progressUpdateListener = session.onDidProgressUpdate(e => {
                                if (e.body.progressId === progressStartEvent.body.progressId) {
                                    reportProgress(e.body);
                                }
                            });
                            return promise.then(() => progressUpdateListener.dispose());
                        }, () => session.cancel(progressStartEvent.body.progressId));
                    });
                }
            };
            this.toDispose.push(debugService.getViewModel().onDidFocusSession(listenOnProgress));
            listenOnProgress(debugService.getViewModel().focusedSession);
            this.toDispose.push(debugService.onWillNewSession(session => {
                if (!progressListener) {
                    listenOnProgress(session);
                }
            }));
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    };
    exports.DebugProgressContribution = DebugProgressContribution;
    exports.DebugProgressContribution = DebugProgressContribution = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, progress_1.IProgressService),
        __param(2, viewsService_1.IViewsService)
    ], DebugProgressContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdQcm9ncmVzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Z1Byb2dyZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVV6RixJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUF5QjtRQUlyQyxZQUNnQixZQUEyQixFQUN4QixlQUFpQyxFQUNwQyxZQUEyQjtZQUxuQyxjQUFTLEdBQWtCLEVBQUUsQ0FBQztZQU9yQyxJQUFJLGdCQUF5QyxDQUFDO1lBQzlDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxPQUFrQyxFQUFFLEVBQUU7Z0JBQy9ELElBQUksZ0JBQWdCLEVBQUUsQ0FBQztvQkFDdEIsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzNCLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztnQkFDOUIsQ0FBQztnQkFDRCxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUNiLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUMsa0JBQWtCLEVBQUMsRUFBRTt3QkFDeEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQU8sQ0FBQyxDQUFDLEVBQUU7NEJBQ3JDLHFFQUFxRTs0QkFDckUsTUFBTSxRQUFRLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFDL0gsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQ0FDN0IsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dDQUNuQixDQUFDLEVB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
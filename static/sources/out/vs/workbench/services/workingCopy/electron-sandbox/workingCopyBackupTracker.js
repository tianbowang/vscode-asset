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
define(["require", "exports", "vs/nls", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/platform/files/common/files", "vs/platform/native/common/native", "vs/workbench/services/workingCopy/common/workingCopyBackupTracker", "vs/platform/log/common/log", "vs/workbench/services/editor/common/editorService", "vs/platform/environment/common/environment", "vs/base/common/cancellation", "vs/platform/progress/common/progress", "vs/base/common/async", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, nls_1, workingCopyBackup_1, filesConfigurationService_1, workingCopyService_1, lifecycle_1, dialogs_1, workspace_1, platform_1, files_1, native_1, workingCopyBackupTracker_1, log_1, editorService_1, environment_1, cancellation_1, progress_1, async_1, workingCopyEditorService_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWorkingCopyBackupTracker = void 0;
    let NativeWorkingCopyBackupTracker = class NativeWorkingCopyBackupTracker extends workingCopyBackupTracker_1.WorkingCopyBackupTracker {
        constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, environmentService, progressService, workingCopyEditorService, editorService, editorGroupService) {
            super(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService);
            this.fileDialogService = fileDialogService;
            this.dialogService = dialogService;
            this.contextService = contextService;
            this.nativeHostService = nativeHostService;
            this.environmentService = environmentService;
            this.progressService = progressService;
        }
        async onFinalBeforeShutdown(reason) {
            // Important: we are about to shutdown and handle modified working copies
            // and backups. We do not want any pending backup ops to interfer with
            // this because there is a risk of a backup being scheduled after we have
            // acknowledged to shutdown and then might end up with partial backups
            // written to disk, or even empty backups or deletes after writes.
            // (https://github.com/microsoft/vscode/issues/138055)
            this.cancelBackupOperations();
            // For the duration of the shutdown handling, suspend backup operations
            // and only resume after we have handled backups. Similar to above, we
            // do not want to trigger backup tracking during our shutdown handling
            // but we must resume, in case of a veto afterwards.
            const { resume } = this.suspendBackupOperations();
            try {
                // Modified working copies need treatment on shutdown
                const modifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
                if (modifiedWorkingCopies.length) {
                    return await this.onBeforeShutdownWithModified(reason, modifiedWorkingCopies);
                }
                // No modified working copies
                else {
                    return await this.onBeforeShutdownWithoutModified();
                }
            }
            finally {
                resume();
            }
        }
        async onBeforeShutdownWithModified(reason, modifiedWorkingCopies) {
            // If auto save is enabled, save all non-untitled working copies
            // and then check again for modified copies
            const workingCopiesToAutoSave = modifiedWorkingCopies.filter(wc => !(wc.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.filesConfigurationService.getAutoSaveMode(wc.resource).mode !== 0 /* AutoSaveMode.OFF */);
            if (workingCopiesToAutoSave.length > 0) {
                // Save all modified working copies that can be auto-saved
                try {
                    await this.doSaveAllBeforeShutdown(workingCopiesToAutoSave, 2 /* SaveReason.AUTO */);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error saving modified working copies: ${error}`); // guard against misbehaving saves, we handle remaining modified below
                }
                // If we still have modified working copies, we either have untitled ones or working copies that cannot be saved
                const remainingModifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
                if (remainingModifiedWorkingCopies.length) {
                    return this.handleModifiedBeforeShutdown(remainingModifiedWorkingCopies, reason);
                }
                return this.noVeto([...modifiedWorkingCopies]); // no veto (modified auto-saved)
            }
            // Auto save is not enabled
            return this.handleModifiedBeforeShutdown(modifiedWorkingCopies, reason);
        }
        async handleModifiedBeforeShutdown(modifiedWorkingCopies, reason) {
            // Trigger backup if configured and enabled for shutdown reason
            let backups = [];
            let backupError = undefined;
            const modifiedWorkingCopiesToBackup = await this.shouldBackupBeforeShutdown(reason, modifiedWorkingCopies);
            if (modifiedWorkingCopiesToBackup.length > 0) {
                try {
                    const backupResult = await this.backupBeforeShutdown(modifiedWorkingCopiesToBackup);
                    backups = backupResult.backups;
                    backupError = backupResult.error;
                    if (backups.length === modifiedWorkingCopies.length) {
                        return false; // no veto (backup was successful for all working copies)
                    }
                }
                catch (error) {
                    backupError = error;
                }
            }
            const remainingModifiedWorkingCopies = modifiedWorkingCopies.filter(workingCopy => !backups.includes(workingCopy));
            // We ran a backup but received an error that we show to the user
            if (backupError) {
                if (this.environmentService.isExtensionDevelopment) {
                    this.logService.error(`[backup tracker] error creating backups: ${backupError}`);
                    return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
                }
                this.showErrorDialog((0, nls_1.localize)('backupTrackerBackupFailed', "The following editors with unsaved changes could not be saved to the back up location."), remainingModifiedWorkingCopies, backupError);
                return true; // veto (the backup failed)
            }
            // Since a backup did not happen, we have to confirm for
            // the working copies that did not successfully backup
            try {
                return await this.confirmBeforeShutdown(remainingModifiedWorkingCopies);
            }
            catch (error) {
                if (this.environmentService.isExtensionDevelopment) {
                    this.logService.error(`[backup tracker] error saving or reverting modified working copies: ${error}`);
                    return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
                }
                this.showErrorDialog((0, nls_1.localize)('backupTrackerConfirmFailed', "The following editors with unsaved changes could not be saved or reverted."), remainingModifiedWorkingCopies, error);
                return true; // veto (save or revert failed)
            }
        }
        async shouldBackupBeforeShutdown(reason, modifiedWorkingCopies) {
            if (!this.filesConfigurationService.isHotExitEnabled) {
                return []; // never backup when hot exit is disabled via settings
            }
            if (this.environmentService.isExtensionDevelopment) {
                return modifiedWorkingCopies; // always backup closing extension development window without asking to speed up debugging
            }
            switch (reason) {
                // Window Close
                case 1 /* ShutdownReason.CLOSE */:
                    if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && this.filesConfigurationService.hotExitConfiguration === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                        return modifiedWorkingCopies; // backup if a workspace/folder is open and onExitAndWindowClose is configured
                    }
                    if (platform_1.isMacintosh || await this.nativeHostService.getWindowCount() > 1) {
                        if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                            return modifiedWorkingCopies.filter(modifiedWorkingCopy => modifiedWorkingCopy.capabilities & 4 /* WorkingCopyCapabilities.Scratchpad */); // backup scratchpads automatically to avoid user confirmation
                        }
                        return []; // do not backup if a window is closed that does not cause quitting of the application
                    }
                    return modifiedWorkingCopies; // backup if last window is closed on win/linux where the application quits right after
                // Application Quit
                case 2 /* ShutdownReason.QUIT */:
                    return modifiedWorkingCopies; // backup because next start we restore all backups
                // Window Reload
                case 3 /* ShutdownReason.RELOAD */:
                    return modifiedWorkingCopies; // backup because after window reload, backups restore
                // Workspace Change
                case 4 /* ShutdownReason.LOAD */:
                    if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                        if (this.filesConfigurationService.hotExitConfiguration === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                            return modifiedWorkingCopies; // backup if a workspace/folder is open and onExitAndWindowClose is configured
                        }
                        return modifiedWorkingCopies.filter(modifiedWorkingCopy => modifiedWorkingCopy.capabilities & 4 /* WorkingCopyCapabilities.Scratchpad */); // backup scratchpads automatically to avoid user confirmation
                    }
                    return []; // do not backup because we are switching contexts with no workspace/folder open
            }
        }
        showErrorDialog(msg, workingCopies, error) {
            const modifiedWorkingCopies = workingCopies.filter(workingCopy => workingCopy.isModified());
            const advice = (0, nls_1.localize)('backupErrorDetails', "Try saving or reverting the editors with unsaved changes first and then try again.");
            const detail = modifiedWorkingCopies.length
                ? (0, dialogs_1.getFileNamesMessage)(modifiedWorkingCopies.map(x => x.name)) + '\n' + advice
                : advice;
            this.dialogService.error(msg, detail);
            this.logService.error(error ? `[backup tracker] ${msg}: ${error}` : `[backup tracker] ${msg}`);
        }
        async backupBeforeShutdown(modifiedWorkingCopies) {
            const backups = [];
            let error = undefined;
            await this.withProgressAndCancellation(async (token) => {
                // Perform a backup of all modified working copies unless a backup already exists
                try {
                    await async_1.Promises.settled(modifiedWorkingCopies.map(async (workingCopy) => {
                        // Backup exists
                        const contentVersion = this.getContentVersion(workingCopy);
                        if (this.workingCopyBackupService.hasBackupSync(workingCopy, contentVersion)) {
                            backups.push(workingCopy);
                        }
                        // Backup does not exist
                        else {
                            const backup = await workingCopy.backup(token);
                            if (token.isCancellationRequested) {
                                return;
                            }
                            await this.workingCopyBackupService.backup(workingCopy, backup.content, contentVersion, backup.meta, token);
                            if (token.isCancellationRequested) {
                                return;
                            }
                            backups.push(workingCopy);
                        }
                    }));
                }
                catch (backupError) {
                    error = backupError;
                }
            }, (0, nls_1.localize)('backupBeforeShutdownMessage', "Backing up editors with unsaved changes is taking a bit longer..."), (0, nls_1.localize)('backupBeforeShutdownDetail', "Click 'Cancel' to stop waiting and to save or revert editors with unsaved changes."));
            return { backups, error };
        }
        async confirmBeforeShutdown(modifiedWorkingCopies) {
            // Save
            const confirm = await this.fileDialogService.showSaveConfirm(modifiedWorkingCopies.map(workingCopy => workingCopy.name));
            if (confirm === 0 /* ConfirmResult.SAVE */) {
                const modifiedCountBeforeSave = this.workingCopyService.modifiedCount;
                try {
                    await this.doSaveAllBeforeShutdown(modifiedWorkingCopies, 1 /* SaveReason.EXPLICIT */);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error saving modified working copies: ${error}`); // guard against misbehaving saves, we handle remaining modified below
                }
                const savedWorkingCopies = modifiedCountBeforeSave - this.workingCopyService.modifiedCount;
                if (savedWorkingCopies < modifiedWorkingCopies.length) {
                    return true; // veto (save failed or was canceled)
                }
                return this.noVeto(modifiedWorkingCopies); // no veto (modified saved)
            }
            // Don't Save
            else if (confirm === 1 /* ConfirmResult.DONT_SAVE */) {
                try {
                    await this.doRevertAllBeforeShutdown(modifiedWorkingCopies);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error reverting modified working copies: ${error}`); // do not block the shutdown on errors from revert
                }
                return this.noVeto(modifiedWorkingCopies); // no veto (modified reverted)
            }
            // Cancel
            return true; // veto (user canceled)
        }
        doSaveAllBeforeShutdown(workingCopies, reason) {
            return this.withProgressAndCancellation(async () => {
                // Skip save participants on shutdown for performance reasons
                const saveOptions = { skipSaveParticipants: true, reason };
                // First save through the editor service if we save all to benefit
                // from some extras like switching to untitled modified editors before saving.
                let result = undefined;
                if (workingCopies.length === this.workingCopyService.modifiedCount) {
                    result = (await this.editorService.saveAll({
                        includeUntitled: { includeScratchpad: true },
                        ...saveOptions
                    })).success;
                }
                // If we still have modified working copies, save those directly
                // unless the save was not successful (e.g. cancelled)
                if (result !== false) {
                    await async_1.Promises.settled(workingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.save(saveOptions) : Promise.resolve(true)));
                }
            }, (0, nls_1.localize)('saveBeforeShutdown', "Saving editors with unsaved changes is taking a bit longer..."));
        }
        doRevertAllBeforeShutdown(modifiedWorkingCopies) {
            return this.withProgressAndCancellation(async () => {
                // Soft revert is good enough on shutdown
                const revertOptions = { soft: true };
                // First revert through the editor service if we revert all
                if (modifiedWorkingCopies.length === this.workingCopyService.modifiedCount) {
                    await this.editorService.revertAll(revertOptions);
                }
                // If we still have modified working copies, revert those directly
                await async_1.Promises.settled(modifiedWorkingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.revert(revertOptions) : Promise.resolve()));
            }, (0, nls_1.localize)('revertBeforeShutdown', "Reverting editors with unsaved changes is taking a bit longer..."));
        }
        onBeforeShutdownWithoutModified() {
            // We are about to shutdown without modified editors
            // and will discard any backups that are still
            // around that have not been handled depending
            // on the window state.
            //
            // Empty window: discard even unrestored backups to
            // prevent empty windows from restoring that cannot
            // be closed (workaround for not having implemented
            // https://github.com/microsoft/vscode/issues/127163
            // and a fix for what users have reported in issue
            // https://github.com/microsoft/vscode/issues/126725)
            //
            // Workspace/Folder window: do not discard unrestored
            // backups to give a chance to restore them in the
            // future. Since we do not restore workspace/folder
            // windows with backups, this is fine.
            return this.noVeto({ except: this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? [] : Array.from(this.unrestoredBackups) });
        }
        async noVeto(arg1) {
            // Discard backups from working copies the
            // user either saved or reverted
            await this.discardBackupsBeforeShutdown(arg1);
            return false; // no veto (no modified)
        }
        async discardBackupsBeforeShutdown(arg1) {
            // We never discard any backups before we are ready
            // and have resolved all backups that exist. This
            // is important to not loose backups that have not
            // been handled.
            if (!this.isReady) {
                return;
            }
            await this.withProgressAndCancellation(async () => {
                // When we shutdown either with no modified working copies left
                // or with some handled, we start to discard these backups
                // to free them up. This helps to get rid of stale backups
                // as reported in https://github.com/microsoft/vscode/issues/92962
                //
                // However, we never want to discard backups that we know
                // were not restored in the session.
                try {
                    if (Array.isArray(arg1)) {
                        await async_1.Promises.settled(arg1.map(workingCopy => this.workingCopyBackupService.discardBackup(workingCopy)));
                    }
                    else {
                        await this.workingCopyBackupService.discardBackups(arg1);
                    }
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error discarding backups: ${error}`);
                }
            }, (0, nls_1.localize)('discardBackupsBeforeShutdown', "Discarding backups is taking a bit longer..."));
        }
        withProgressAndCancellation(promiseFactory, title, detail) {
            const cts = new cancellation_1.CancellationTokenSource();
            return this.progressService.withProgress({
                location: 20 /* ProgressLocation.Dialog */, // use a dialog to prevent the user from making any more changes now (https://github.com/microsoft/vscode/issues/122774)
                cancellable: true, // allow to cancel (https://github.com/microsoft/vscode/issues/112278)
                delay: 800, // delay so that it only appears when operation takes a long time
                title,
                detail
            }, () => (0, async_1.raceCancellation)(promiseFactory(cts.token), cts.token), () => cts.dispose(true));
        }
    };
    exports.NativeWorkingCopyBackupTracker = NativeWorkingCopyBackupTracker;
    exports.NativeWorkingCopyBackupTracker = NativeWorkingCopyBackupTracker = __decorate([
        __param(0, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(1, filesConfigurationService_1.IFilesConfigurationService),
        __param(2, workingCopyService_1.IWorkingCopyService),
        __param(3, lifecycle_1.ILifecycleService),
        __param(4, dialogs_1.IFileDialogService),
        __param(5, dialogs_1.IDialogService),
        __param(6, workspace_1.IWorkspaceContextService),
        __param(7, native_1.INativeHostService),
        __param(8, log_1.ILogService),
        __param(9, environment_1.IEnvironmentService),
        __param(10, progress_1.IProgressService),
        __param(11, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(12, editorService_1.IEditorService),
        __param(13, editorGroupsService_1.IEditorGroupsService)
    ], NativeWorkingCopyBackupTracker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBUcmFja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya2luZ0NvcHkvZWxlY3Ryb24tc2FuZGJveC93b3JraW5nQ29weUJhY2t1cFRyYWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJ6RixJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUErQixTQUFRLG1EQUF3QjtRQUUzRSxZQUM0Qix3QkFBbUQsRUFDbEQseUJBQXFELEVBQzVELGtCQUF1QyxFQUN6QyxnQkFBbUMsRUFDakIsaUJBQXFDLEVBQ3pDLGFBQTZCLEVBQ25CLGNBQXdDLEVBQzlDLGlCQUFxQyxFQUM3RCxVQUF1QixFQUNFLGtCQUF1QyxFQUMxQyxlQUFpQyxFQUN6Qyx3QkFBbUQsRUFDOUQsYUFBNkIsRUFDdkIsa0JBQXdDO1lBRTlELEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUseUJBQXlCLEVBQUUsd0JBQXdCLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFYckksc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN6QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDbkIsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFFcEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUMxQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFNckUsQ0FBQztRQUVTLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxNQUFzQjtZQUUzRCx5RUFBeUU7WUFDekUsc0VBQXNFO1lBQ3RFLHlFQUF5RTtZQUN6RSxzRUFBc0U7WUFDdEUsa0VBQWtFO1lBQ2xFLHNEQUFzRDtZQUV0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
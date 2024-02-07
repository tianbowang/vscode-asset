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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/cancellation", "vs/platform/files/common/files", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/async", "vs/platform/log/common/log", "vs/base/common/types", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/notification/common/notification", "vs/base/common/hash", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/base/common/platform", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/workingCopy/common/resourceWorkingCopy"], function (require, exports, nls_1, event_1, cancellation_1, files_1, workingCopyService_1, async_1, log_1, types_1, workingCopyFileService_1, filesConfigurationService_1, workingCopyBackup_1, notification_1, hash_1, errorMessage_1, actions_1, platform_1, workingCopyEditorService_1, editorService_1, elevatedFileService_1, resourceWorkingCopy_1) {
    "use strict";
    var StoredFileWorkingCopy_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StoredFileWorkingCopy = exports.isStoredFileWorkingCopySaveEvent = exports.StoredFileWorkingCopyState = void 0;
    /**
     * States the stored file working copy can be in.
     */
    var StoredFileWorkingCopyState;
    (function (StoredFileWorkingCopyState) {
        /**
         * A stored file working copy is saved.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["SAVED"] = 0] = "SAVED";
        /**
         * A stored file working copy is dirty.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["DIRTY"] = 1] = "DIRTY";
        /**
         * A stored file working copy is currently being saved but
         * this operation has not completed yet.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["PENDING_SAVE"] = 2] = "PENDING_SAVE";
        /**
         * A stored file working copy is in conflict mode when changes
         * cannot be saved because the underlying file has changed.
         * Stored file working copies in conflict mode are always dirty.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["CONFLICT"] = 3] = "CONFLICT";
        /**
         * A stored file working copy is in orphan state when the underlying
         * file has been deleted.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["ORPHAN"] = 4] = "ORPHAN";
        /**
         * Any error that happens during a save that is not causing
         * the `StoredFileWorkingCopyState.CONFLICT` state.
         * Stored file working copies in error mode are always dirty.
         */
        StoredFileWorkingCopyState[StoredFileWorkingCopyState["ERROR"] = 5] = "ERROR";
    })(StoredFileWorkingCopyState || (exports.StoredFileWorkingCopyState = StoredFileWorkingCopyState = {}));
    function isStoredFileWorkingCopySaveEvent(e) {
        const candidate = e;
        return !!candidate.stat;
    }
    exports.isStoredFileWorkingCopySaveEvent = isStoredFileWorkingCopySaveEvent;
    let StoredFileWorkingCopy = class StoredFileWorkingCopy extends resourceWorkingCopy_1.ResourceWorkingCopy {
        static { StoredFileWorkingCopy_1 = this; }
        get model() { return this._model; }
        //#endregion
        constructor(typeId, resource, name, modelFactory, externalResolver, fileService, logService, workingCopyFileService, filesConfigurationService, workingCopyBackupService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService) {
            super(resource, fileService);
            this.typeId = typeId;
            this.name = name;
            this.modelFactory = modelFactory;
            this.externalResolver = externalResolver;
            this.logService = logService;
            this.workingCopyFileService = workingCopyFileService;
            this.filesConfigurationService = filesConfigurationService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.notificationService = notificationService;
            this.workingCopyEditorService = workingCopyEditorService;
            this.editorService = editorService;
            this.elevatedFileService = elevatedFileService;
            this.capabilities = 0 /* WorkingCopyCapabilities.None */;
            this._model = undefined;
            //#region events
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidResolve = this._register(new event_1.Emitter());
            this.onDidResolve = this._onDidResolve.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidSaveError = this._register(new event_1.Emitter());
            this.onDidSaveError = this._onDidSaveError.event;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this._onDidRevert = this._register(new event_1.Emitter());
            this.onDidRevert = this._onDidRevert.event;
            this._onDidChangeReadonly = this._register(new event_1.Emitter());
            this.onDidChangeReadonly = this._onDidChangeReadonly.event;
            //#region Dirty
            this.dirty = false;
            this.ignoreDirtyOnModelContentChange = false;
            //#endregion
            //#region Save
            this.versionId = 0;
            this.lastContentChangeFromUndoRedo = undefined;
            this.saveSequentializer = new async_1.TaskSequentializer();
            this.ignoreSaveFromSaveParticipants = false;
            //#endregion
            //#region State
            this.inConflictMode = false;
            this.inErrorMode = false;
            // Make known to working copy service
            this._register(workingCopyService.registerWorkingCopy(this));
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
        }
        isDirty() {
            return this.dirty;
        }
        markModified() {
            this.setDirty(true); // stored file working copy tracks modified via dirty
        }
        setDirty(dirty) {
            if (!this.isResolved()) {
                return; // only resolved working copies can be marked dirty
            }
            // Track dirty state and version id
            const wasDirty = this.dirty;
            this.doSetDirty(dirty);
            // Emit as Event if dirty changed
            if (dirty !== wasDirty) {
                this._onDidChangeDirty.fire();
            }
        }
        doSetDirty(dirty) {
            const wasDirty = this.dirty;
            const wasInConflictMode = this.inConflictMode;
            const wasInErrorMode = this.inErrorMode;
            const oldSavedVersionId = this.savedVersionId;
            if (!dirty) {
                this.dirty = false;
                this.inConflictMode = false;
                this.inErrorMode = false;
                // we remember the models alternate version id to remember when the version
                // of the model matches with the saved version on disk. we need to keep this
                // in order to find out if the model changed back to a saved version (e.g.
                // when undoing long enough to reach to a version that is saved and then to
                // clear the dirty flag)
                if (this.isResolved()) {
                    this.savedVersionId = this.model.versionId;
                }
            }
            else {
                this.dirty = true;
            }
            // Return function to revert this call
            return () => {
                this.dirty = wasDirty;
                this.inConflictMode = wasInConflictMode;
                this.inErrorMode = wasInErrorMode;
                this.savedVersionId = oldSavedVersionId;
            };
        }
        isResolved() {
            return !!this.model;
        }
        async resolve(options) {
            this.trace('resolve() - enter');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.trace('resolve() - exit - without resolving because file working copy is disposed');
                return;
            }
            // Unless there are explicit contents provided, it is important that we do not
            // resolve a working copy that is dirty or is in the process of saving to prevent
            // data loss.
            if (!options?.contents && (this.dirty || this.saveSequentializer.isRunning())) {
                this.trace('resolve() - exit - without resolving because file working copy is dirty or being saved');
                return;
            }
            return this.doResolve(options);
        }
        async doResolve(options) {
            // First check if we have contents to use for the working copy
            if (options?.contents) {
                return this.resolveFromBuffer(options.contents);
            }
            // Second, check if we have a backup to resolve from (only for new working copies)
            const isNew = !this.isResolved();
            if (isNew) {
                const resolvedFromBackup = await this.resolveFromBackup();
                if (resolvedFromBackup) {
                    return;
                }
            }
            // Finally, resolve from file resource
            return this.resolveFromFile(options);
        }
        async resolveFromBuffer(buffer) {
            this.trace('resolveFromBuffer()');
            // Try to resolve metdata from disk
            let mtime;
            let ctime;
            let size;
            let etag;
            try {
                const metadata = await this.fileService.stat(this.resource);
                mtime = metadata.mtime;
                ctime = metadata.ctime;
                size = metadata.size;
                etag = metadata.etag;
                // Clear orphaned state when resolving was successful
                this.setOrphaned(false);
            }
            catch (error) {
                // Put some fallback values in error case
                mtime = Date.now();
                ctime = Date.now();
                size = 0;
                etag = files_1.ETAG_DISABLED;
                // Apply orphaned state based on error code
                this.setOrphaned(error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */);
            }
            // Resolve with buffer
            return this.resolveFromContent({
                resource: this.resource,
                name: this.name,
                mtime,
                ctime,
                size,
                etag,
                value: buffer,
                readonly: false,
                locked: false
            }, true /* dirty (resolved from buffer) */);
        }
        async resolveFromBackup() {
            // Resolve backup if any
            const backup = await this.workingCopyBackupService.resolve(this);
            // Abort if someone else managed to resolve the working copy by now
            const isNew = !this.isResolved();
            if (!isNew) {
                this.trace('resolveFromBackup() - exit - withoutresolving because previously new file working copy got created meanwhile');
                return true; // imply that resolving has happened in another operation
            }
            // Try to resolve from backup if we have any
            if (backup) {
                await this.doResolveFromBackup(backup);
                return true;
            }
            // Otherwise signal back that resolving did not happen
            return false;
        }
        async doResolveFromBackup(backup) {
            this.trace('doResolveFromBackup()');
            // Resolve with backup
            await this.resolveFromContent({
                resource: this.resource,
                name: this.name,
                mtime: backup.meta ? backup.meta.mtime : Date.now(),
                ctime: backup.meta ? backup.meta.ctime : Date.now(),
                size: backup.meta ? backup.meta.size : 0,
                etag: backup.meta ? backup.meta.etag : files_1.ETAG_DISABLED, // etag disabled if unknown!
                value: backup.value,
                readonly: false,
                locked: false
            }, true /* dirty (resolved from backup) */);
            // Restore orphaned flag based on state
            if (backup.meta && backup.meta.orphaned) {
                this.setOrphaned(true);
            }
        }
        async resolveFromFile(options) {
            this.trace('resolveFromFile()');
            const forceReadFromFile = options?.forceReadFromFile;
            // Decide on etag
            let etag;
            if (forceReadFromFile) {
                etag = files_1.ETAG_DISABLED; // disable ETag if we enforce to read from disk
            }
            else if (this.lastResolvedFileStat) {
                etag = this.lastResolvedFileStat.etag; // otherwise respect etag to support caching
            }
            // Remember current version before doing any long running operation
            // to ensure we are not changing a working copy that was changed
            // meanwhile
            const currentVersionId = this.versionId;
            // Resolve Content
            try {
                const content = await this.fileService.readFileStream(this.resource, {
                    etag,
                    limits: options?.limits
                });
                // Clear orphaned state when resolving was successful
                this.setOrphaned(false);
                // Return early if the working copy content has changed
                // meanwhile to prevent loosing any changes
                if (currentVersionId !== this.versionId) {
                    this.trace('resolveFromFile() - exit - without resolving because file working copy content changed');
                    return;
                }
                await this.resolveFromContent(content, false /* not dirty (resolved from file) */);
            }
            catch (error) {
                const result = error.fileOperationResult;
                // Apply orphaned state based on error code
                this.setOrphaned(result === 1 /* FileOperationResult.FILE_NOT_FOUND */);
                // NotModified status is expected and can be handled gracefully
                // if we are resolved. We still want to update our last resolved
                // stat to e.g. detect changes to the file's readonly state
                if (this.isResolved() && result === 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */) {
                    if (error instanceof files_1.NotModifiedSinceFileOperationError) {
                        this.updateLastResolvedFileStat(error.stat);
                    }
                    return;
                }
                // Unless we are forced to read from the file, ignore when a working copy has
                // been resolved once and the file was deleted meanwhile. Since we already have
                // the working copy resolved, we can return to this state and update the orphaned
                // flag to indicate that this working copy has no version on disk anymore.
                if (this.isResolved() && result === 1 /* FileOperationResult.FILE_NOT_FOUND */ && !forceReadFromFile) {
                    return;
                }
                // Otherwise bubble up the error
                throw error;
            }
        }
        async resolveFromContent(content, dirty) {
            this.trace('resolveFromContent() - enter');
            // Return early if we are disposed
            if (this.isDisposed()) {
                this.trace('resolveFromContent() - exit - because working copy is disposed');
                return;
            }
            // Update our resolved disk stat
            this.updateLastResolvedFileStat({
                resource: this.resource,
                name: content.name,
                mtime: content.mtime,
                ctime: content.ctime,
                size: content.size,
                etag: content.etag,
                readonly: content.readonly,
                locked: content.locked,
                isFile: true,
                isDirectory: false,
                isSymbolicLink: false,
                children: undefined
            });
            // Update existing model if we had been resolved
            if (this.isResolved()) {
                await this.doUpdateModel(content.value);
            }
            // Create new model otherwise
            else {
                await this.doCreateModel(content.value);
            }
            // Update working copy dirty flag. This is very important to call
            // in both cases of dirty or not because it conditionally updates
            // the `savedVersionId` to determine the version when to consider
            // the working copy as saved again (e.g. when undoing back to the
            // saved state)
            this.setDirty(!!dirty);
            // Emit as event
            this._onDidResolve.fire();
        }
        async doCreateModel(contents) {
            this.trace('doCreateModel()');
            // Create model and dispose it when we get disposed
            this._model = this._register(await this.modelFactory.createModel(this.resource, contents, cancellation_1.CancellationToken.None));
            // Model listeners
            this.installModelListeners(this._model);
        }
        async doUpdateModel(contents) {
            this.trace('doUpdateModel()');
            // Update model value in a block that ignores content change events for dirty tracking
            this.ignoreDirtyOnModelContentChange = true;
            try {
                await this.model?.update(contents, cancellation_1.CancellationToken.None);
            }
            finally {
                this.ignoreDirtyOnModelContentChange = false;
            }
        }
        installModelListeners(model) {
            // See https://github.com/microsoft/vscode/issues/30189
            // This code has been extracted to a different method because it caused a memory leak
            // where `value` was captured in the content change listener closure scope.
            // Content Change
            this._register(model.onDidChangeContent(e => this.onModelContentChanged(model, e.isUndoing || e.isRedoing)));
            // Lifecycle
            this._register(model.onWillDispose(() => this.dispose()));
        }
        onModelContentChanged(model, isUndoingOrRedoing) {
            this.trace(`onModelContentChanged() - enter`);
            // In any case increment the version id because it tracks the content state of the model at all times
            this.versionId++;
            this.trace(`onModelContentChanged() - new versionId ${this.versionId}`);
            // Remember when the user changed the model through a undo/redo operation.
            // We need this information to throttle save participants to fix
            // https://github.com/microsoft/vscode/issues/102542
            if (isUndoingOrRedoing) {
                this.lastContentChangeFromUndoRedo = Date.now();
            }
            // We mark check for a dirty-state change upon model content change, unless:
            // - explicitly instructed to ignore it (e.g. from model.resolve())
            // - the model is readonly (in that case we never assume the change was done by the user)
            if (!this.ignoreDirtyOnModelContentChange && !this.isReadonly()) {
                // The contents changed as a matter of Undo and the version reached matches the saved one
                // In this case we clear the dirty flag and emit a SAVED event to indicate this state.
                if (model.versionId === this.savedVersionId) {
                    this.trace('onModelContentChanged() - model content changed back to last saved version');
                    // Clear flags
                    const wasDirty = this.dirty;
                    this.setDirty(false);
                    // Emit revert event if we were dirty
                    if (wasDirty) {
                        this._onDidRevert.fire();
                    }
                }
                // Otherwise the content has changed and we signal this as becoming dirty
                else {
                    this.trace('onModelContentChanged() - model content changed and marked as dirty');
                    // Mark as dirty
                    this.setDirty(true);
                }
            }
            // Emit as event
            this._onDidChangeContent.fire();
        }
        async forceResolveFromFile() {
            if (this.isDisposed()) {
                return; // return early when the working copy is invalid
            }
            // We go through the resolver to make
            // sure this kind of `resolve` is properly
            // running in sequence with any other running
            // `resolve` if any, including subsequent runs
            // that are triggered right after.
            await this.externalResolver({
                forceReadFromFile: true
            });
        }
        //#endregion
        //#region Backup
        get backupDelay() {
            return this.model?.configuration?.backupDelay;
        }
        async backup(token) {
            // Fill in metadata if we are resolved
            let meta = undefined;
            if (this.lastResolvedFileStat) {
                meta = {
                    mtime: this.lastResolvedFileStat.mtime,
                    ctime: this.lastResolvedFileStat.ctime,
                    size: this.lastResolvedFileStat.size,
                    etag: this.lastResolvedFileStat.etag,
                    orphaned: this.isOrphaned()
                };
            }
            // Fill in content if we are resolved
            let content = undefined;
            if (this.isResolved()) {
                content = await (0, async_1.raceCancellation)(this.model.snapshot(token), token);
            }
            return { meta, content };
        }
        static { this.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD = 500; }
        async save(options = Object.create(null)) {
            if (!this.isResolved()) {
                return false;
            }
            if (this.isReadonly()) {
                this.trace('save() - ignoring request for readonly resource');
                return false; // if working copy is readonly we do not attempt to save at all
            }
            if ((this.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */) || this.hasState(5 /* StoredFileWorkingCopyState.ERROR */)) &&
                (options.reason === 2 /* SaveReason.AUTO */ || options.reason === 3 /* SaveReason.FOCUS_CHANGE */ || options.reason === 4 /* SaveReason.WINDOW_CHANGE */)) {
                this.trace('save() - ignoring auto save request for file working copy that is in conflict or error');
                return false; // if working copy is in save conflict or error, do not save unless save reason is explicit
            }
            // Actually do save
            this.trace('save() - enter');
            await this.doSave(options);
            this.trace('save() - exit');
            return this.hasState(0 /* StoredFileWorkingCopyState.SAVED */);
        }
        async doSave(options) {
            if (typeof options.reason !== 'number') {
                options.reason = 1 /* SaveReason.EXPLICIT */;
            }
            let versionId = this.versionId;
            this.trace(`doSave(${versionId}) - enter with versionId ${versionId}`);
            // Return early if saved from within save participant to break recursion
            //
            // Scenario: a save participant triggers a save() on the working copy
            if (this.ignoreSaveFromSaveParticipants) {
                this.trace(`doSave(${versionId}) - exit - refusing to save() recursively from save participant`);
                return;
            }
            // Lookup any running save for this versionId and return it if found
            //
            // Scenario: user invoked the save action multiple times quickly for the same contents
            //           while the save was not yet finished to disk
            //
            if (this.saveSequentializer.isRunning(versionId)) {
                this.trace(`doSave(${versionId}) - exit - found a running save for versionId ${versionId}`);
                return this.saveSequentializer.running;
            }
            // Return early if not dirty (unless forced)
            //
            // Scenario: user invoked save action even though the working copy is not dirty
            if (!options.force && !this.dirty) {
                this.trace(`doSave(${versionId}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.dirty}, this.versionId: ${this.versionId})`);
                return;
            }
            // Return if currently saving by storing this save request as the next save that should happen.
            // Never ever must 2 saves execute at the same time because this can lead to dirty writes and race conditions.
            //
            // Scenario A: auto save was triggered and is currently busy saving to disk. this takes long enough that another auto save
            //             kicks in.
            // Scenario B: save is very slow (e.g. network share) and the user manages to change the working copy and trigger another save
            //             while the first save has not returned yet.
            //
            if (this.saveSequentializer.isRunning()) {
                this.trace(`doSave(${versionId}) - exit - because busy saving`);
                // Indicate to the save sequentializer that we want to
                // cancel the running operation so that ours can run
                // before the running one finishes.
                // Currently this will try to cancel running save
                // participants and running snapshots from the
                // save operation, but not the actual save which does
                // not support cancellation yet.
                this.saveSequentializer.cancelRunning();
                // Queue this as the upcoming save and return
                return this.saveSequentializer.queue(() => this.doSave(options));
            }
            // Push all edit operations to the undo stack so that the user has a chance to
            // Ctrl+Z back to the saved version.
            if (this.isResolved()) {
                this.model.pushStackElement();
            }
            const saveCancellation = new cancellation_1.CancellationTokenSource();
            return this.saveSequentializer.run(versionId, (async () => {
                // A save participant can still change the working copy now
                // and since we are so close to saving we do not want to trigger
                // another auto save or similar, so we block this
                // In addition we update our version right after in case it changed
                // because of a working copy change
                // Save participants can also be skipped through API.
                if (this.isResolved() && !options.skipSaveParticipants && this.workingCopyFileService.hasSaveParticipants) {
                    try {
                        // Measure the time it took from the last undo/redo operation to this save. If this
                        // time is below `UNDO_REDO_SAVE_PARTICIPANTS_THROTTLE_THRESHOLD`, we make sure to
                        // delay the save participant for the remaining time if the reason is auto save.
                        //
                        // This fixes the following issue:
                        // - the user has configured auto save with delay of 100ms or shorter
                        // - the user has a save participant enabled that modifies the file on each save
                        // - the user types into the file and the file gets saved
                        // - the user triggers undo operation
                        // - this will undo the save participant change but trigger the save participant right after
                        // - the user has no chance to undo over the save participant
                        //
                        // Reported as: https://github.com/microsoft/vscode/issues/102542
                        if (options.reason === 2 /* SaveReason.AUTO */ && typeof this.lastContentChangeFromUndoRedo === 'number') {
                            const timeFromUndoRedoToSave = Date.now() - this.lastContentChangeFromUndoRedo;
                            if (timeFromUndoRedoToSave < StoredFileWorkingCopy_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD) {
                                await (0, async_1.timeout)(StoredFileWorkingCopy_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD - timeFromUndoRedoToSave);
                            }
                        }
                        // Run save participants unless save was cancelled meanwhile
                        if (!saveCancellation.token.isCancellationRequested) {
                            this.ignoreSaveFromSaveParticipants = true;
                            try {
                                await this.workingCopyFileService.runSaveParticipants(this, { reason: options.reason ?? 1 /* SaveReason.EXPLICIT */ }, saveCancellation.token);
                            }
                            finally {
                                this.ignoreSaveFromSaveParticipants = false;
                            }
                        }
                    }
                    catch (error) {
                        this.logService.error(`[stored file working copy] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`, this.resource.toString(), this.typeId);
                    }
                }
                // It is possible that a subsequent save is cancelling this
                // running save. As such we return early when we detect that.
                if (saveCancellation.token.isCancellationRequested) {
                    return;
                }
                // We have to protect against being disposed at this point. It could be that the save() operation
                // was triggerd followed by a dispose() operation right after without waiting. Typically we cannot
                // be disposed if we are dirty, but if we are not dirty, save() and dispose() can still be triggered
                // one after the other without waiting for the save() to complete. If we are disposed(), we risk
                // saving contents to disk that are stale (see https://github.com/microsoft/vscode/issues/50942).
                // To fix this issue, we will not store the contents to disk when we got disposed.
                if (this.isDisposed()) {
                    return;
                }
                // We require a resolved working copy from this point on, since we are about to write data to disk.
                if (!this.isResolved()) {
                    return;
                }
                // update versionId with its new value (if pre-save changes happened)
                versionId = this.versionId;
                // Clear error flag since we are trying to save again
                this.inErrorMode = false;
                // Save to Disk. We mark the save operation as currently running with
                // the latest versionId because it might have changed from a save
                // participant triggering
                this.trace(`doSave(${versionId}) - before write()`);
                const lastResolvedFileStat = (0, types_1.assertIsDefined)(this.lastResolvedFileStat);
                const resolvedFileWorkingCopy = this;
                return this.saveSequentializer.run(versionId, (async () => {
                    try {
                        const writeFileOptions = {
                            mtime: lastResolvedFileStat.mtime,
                            etag: (options.ignoreModifiedSince || !this.filesConfigurationService.preventSaveConflicts(lastResolvedFileStat.resource)) ? files_1.ETAG_DISABLED : lastResolvedFileStat.etag,
                            unlock: options.writeUnlock
                        };
                        let stat;
                        // Delegate to working copy model save method if any
                        if (typeof resolvedFileWorkingCopy.model.save === 'function') {
                            stat = await resolvedFileWorkingCopy.model.save(writeFileOptions, saveCancellation.token);
                        }
                        // Otherwise ask for a snapshot and save via file services
                        else {
                            // Snapshot working copy model contents
                            const snapshot = await (0, async_1.raceCancellation)(resolvedFileWorkingCopy.model.snapshot(saveCancellation.token), saveCancellation.token);
                            // It is possible that a subsequent save is cancelling this
                            // running save. As such we return early when we detect that
                            // However, we do not pass the token into the file service
                            // because that is an atomic operation currently without
                            // cancellation support, so we dispose the cancellation if
                            // it was not cancelled yet.
                            if (saveCancellation.token.isCancellationRequested) {
                                return;
                            }
                            else {
                                saveCancellation.dispose();
                            }
                            // Write them to disk
                            if (options?.writeElevated && this.elevatedFileService.isSupported(lastResolvedFileStat.resource)) {
                                stat = await this.elevatedFileService.writeFileElevated(lastResolvedFileStat.resource, (0, types_1.assertIsDefined)(snapshot), writeFileOptions);
                            }
                            else {
                                stat = await this.fileService.writeFile(lastResolvedFileStat.resource, (0, types_1.assertIsDefined)(snapshot), writeFileOptions);
                            }
                        }
                        this.handleSaveSuccess(stat, versionId, options);
                    }
                    catch (error) {
                        this.handleSaveError(error, versionId, options);
                    }
                })(), () => saveCancellation.cancel());
            })(), () => saveCancellation.cancel());
        }
        handleSaveSuccess(stat, versionId, options) {
            // Updated resolved stat with updated stat
            this.updateLastResolvedFileStat(stat);
            // Update dirty state unless working copy has changed meanwhile
            if (versionId === this.versionId) {
                this.trace(`handleSaveSuccess(${versionId}) - setting dirty to false because versionId did not change`);
                this.setDirty(false);
            }
            else {
                this.trace(`handleSaveSuccess(${versionId}) - not setting dirty to false because versionId did change meanwhile`);
            }
            // Update orphan state given save was successful
            this.setOrphaned(false);
            // Emit Save Event
            this._onDidSave.fire({ reason: options.reason, stat, source: options.source });
        }
        handleSaveError(error, versionId, options) {
            (options.ignoreErrorHandler ? this.logService.trace : this.logService.error).apply(this.logService, [`[stored file working copy] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`, this.resource.toString(), this.typeId]);
            // Return early if the save() call was made asking to
            // handle the save error itself.
            if (options.ignoreErrorHandler) {
                throw error;
            }
            // In any case of an error, we mark the working copy as dirty to prevent data loss
            // It could be possible that the write corrupted the file on disk (e.g. when
            // an error happened after truncating the file) and as such we want to preserve
            // the working copy contents to prevent data loss.
            this.setDirty(true);
            // Flag as error state
            this.inErrorMode = true;
            // Look out for a save conflict
            if (error.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                this.inConflictMode = true;
            }
            // Show save error to user for handling
            this.doHandleSaveError(error);
            // Emit as event
            this._onDidSaveError.fire();
        }
        doHandleSaveError(error) {
            const fileOperationError = error;
            const primaryActions = [];
            let message;
            // Dirty write prevention
            if (fileOperationError.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                message = (0, nls_1.localize)('staleSaveError', "Failed to save '{0}': The content of the file is newer. Do you want to overwrite the file with your changes?", this.name);
                primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.overwrite', label: (0, nls_1.localize)('overwrite', "Overwrite"), run: () => this.save({ ignoreModifiedSince: true }) }));
                primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.revert', label: (0, nls_1.localize)('discard', "Discard"), run: () => this.revert() }));
            }
            // Any other save error
            else {
                const isWriteLocked = fileOperationError.fileOperationResult === 5 /* FileOperationResult.FILE_WRITE_LOCKED */;
                const triedToUnlock = isWriteLocked && fileOperationError.options?.unlock;
                const isPermissionDenied = fileOperationError.fileOperationResult === 6 /* FileOperationResult.FILE_PERMISSION_DENIED */;
                const canSaveElevated = this.elevatedFileService.isSupported(this.resource);
                // Error with Actions
                if ((0, errorMessage_1.isErrorWithActions)(error)) {
                    primaryActions.push(...error.actions);
                }
                // Save Elevated
                if (canSaveElevated && (isPermissionDenied || triedToUnlock)) {
                    primaryActions.push((0, actions_1.toAction)({
                        id: 'fileWorkingCopy.saveElevated',
                        label: triedToUnlock ?
                            platform_1.isWindows ? (0, nls_1.localize)('overwriteElevated', "Overwrite as Admin...") : (0, nls_1.localize)('overwriteElevatedSudo', "Overwrite as Sudo...") :
                            platform_1.isWindows ? (0, nls_1.localize)('saveElevated', "Retry as Admin...") : (0, nls_1.localize)('saveElevatedSudo', "Retry as Sudo..."),
                        run: () => {
                            this.save({ writeElevated: true, writeUnlock: triedToUnlock, reason: 1 /* SaveReason.EXPLICIT */ });
                        }
                    }));
                }
                // Unlock
                else if (isWriteLocked) {
                    primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.unlock', label: (0, nls_1.localize)('overwrite', "Overwrite"), run: () => this.save({ writeUnlock: true, reason: 1 /* SaveReason.EXPLICIT */ }) }));
                }
                // Retry
                else {
                    primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.retry', label: (0, nls_1.localize)('retry', "Retry"), run: () => this.save({ reason: 1 /* SaveReason.EXPLICIT */ }) }));
                }
                // Save As
                primaryActions.push((0, actions_1.toAction)({
                    id: 'fileWorkingCopy.saveAs',
                    label: (0, nls_1.localize)('saveAs', "Save As..."),
                    run: async () => {
                        const editor = this.workingCopyEditorService.findEditor(this);
                        if (editor) {
                            const result = await this.editorService.save(editor, { saveAs: true, reason: 1 /* SaveReason.EXPLICIT */ });
                            if (!result.success) {
                                this.doHandleSaveError(error); // show error again given the operation failed
                            }
                        }
                    }
                }));
                // Discard
                primaryActions.push((0, actions_1.toAction)({ id: 'fileWorkingCopy.revert', label: (0, nls_1.localize)('discard', "Discard"), run: () => this.revert() }));
                // Message
                if (isWriteLocked) {
                    if (triedToUnlock && canSaveElevated) {
                        message = platform_1.isWindows ?
                            (0, nls_1.localize)('readonlySaveErrorAdmin', "Failed to save '{0}': File is read-only. Select 'Overwrite as Admin' to retry as administrator.", this.name) :
                            (0, nls_1.localize)('readonlySaveErrorSudo', "Failed to save '{0}': File is read-only. Select 'Overwrite as Sudo' to retry as superuser.", this.name);
                    }
                    else {
                        message = (0, nls_1.localize)('readonlySaveError', "Failed to save '{0}': File is read-only. Select 'Overwrite' to attempt to make it writeable.", this.name);
                    }
                }
                else if (canSaveElevated && isPermissionDenied) {
                    message = platform_1.isWindows ?
                        (0, nls_1.localize)('permissionDeniedSaveError', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Admin' to retry as administrator.", this.name) :
                        (0, nls_1.localize)('permissionDeniedSaveErrorSudo', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Sudo' to retry as superuser.", this.name);
                }
                else {
                    message = (0, nls_1.localize)({ key: 'genericSaveError', comment: ['{0} is the resource that failed to save and {1} the error message'] }, "Failed to save '{0}': {1}", this.name, (0, errorMessage_1.toErrorMessage)(error, false));
                }
            }
            // Show to the user as notification
            const handle = this.notificationService.notify({ id: `${(0, hash_1.hash)(this.resource.toString())}`, severity: notification_1.Severity.Error, message, actions: { primary: primaryActions } });
            // Remove automatically when we get saved/reverted
            const listener = this._register(event_1.Event.once(event_1.Event.any(this.onDidSave, this.onDidRevert))(() => handle.close()));
            this._register(event_1.Event.once(handle.onDidClose)(() => listener.dispose()));
        }
        updateLastResolvedFileStat(newFileStat) {
            const oldReadonly = this.isReadonly();
            // First resolve - just take
            if (!this.lastResolvedFileStat) {
                this.lastResolvedFileStat = newFileStat;
            }
            // Subsequent resolve - make sure that we only assign it if the mtime
            // is equal or has advanced.
            // This prevents race conditions from resolving and saving. If a save
            // comes in late after a revert was called, the mtime could be out of
            // sync.
            else if (this.lastResolvedFileStat.mtime <= newFileStat.mtime) {
                this.lastResolvedFileStat = newFileStat;
            }
            // Signal that the readonly state changed
            if (this.isReadonly() !== oldReadonly) {
                this._onDidChangeReadonly.fire();
            }
        }
        //#endregion
        //#region Revert
        async revert(options) {
            if (!this.isResolved() || (!this.dirty && !options?.force)) {
                return; // ignore if not resolved or not dirty and not enforced
            }
            this.trace('revert()');
            // Unset flags
            const wasDirty = this.dirty;
            const undoSetDirty = this.doSetDirty(false);
            // Force read from disk unless reverting soft
            const softUndo = options?.soft;
            if (!softUndo) {
                try {
                    await this.forceResolveFromFile();
                }
                catch (error) {
                    // FileNotFound means the file got deleted meanwhile, so ignore it
                    if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                        // Set flags back to previous values, we are still dirty if revert failed
                        undoSetDirty();
                        throw error;
                    }
                }
            }
            // Emit file change event
            this._onDidRevert.fire();
            // Emit dirty change event
            if (wasDirty) {
                this._onDidChangeDirty.fire();
            }
        }
        hasState(state) {
            switch (state) {
                case 3 /* StoredFileWorkingCopyState.CONFLICT */:
                    return this.inConflictMode;
                case 1 /* StoredFileWorkingCopyState.DIRTY */:
                    return this.dirty;
                case 5 /* StoredFileWorkingCopyState.ERROR */:
                    return this.inErrorMode;
                case 4 /* StoredFileWorkingCopyState.ORPHAN */:
                    return this.isOrphaned();
                case 2 /* StoredFileWorkingCopyState.PENDING_SAVE */:
                    return this.saveSequentializer.isRunning();
                case 0 /* StoredFileWorkingCopyState.SAVED */:
                    return !this.dirty;
            }
        }
        async joinState(state) {
            return this.saveSequentializer.running;
        }
        //#endregion
        //#region Utilities
        isReadonly() {
            return this.filesConfigurationService.isReadonly(this.resource, this.lastResolvedFileStat);
        }
        trace(msg) {
            this.logService.trace(`[stored file working copy] ${msg}`, this.resource.toString(), this.typeId);
        }
        //#endregion
        //#region Dispose
        dispose() {
            this.trace('dispose()');
            // State
            this.inConflictMode = false;
            this.inErrorMode = false;
            // Free up model for GC
            this._model = undefined;
            super.dispose();
        }
    };
    exports.StoredFileWorkingCopy = StoredFileWorkingCopy;
    exports.StoredFileWorkingCopy = StoredFileWorkingCopy = StoredFileWorkingCopy_1 = __decorate([
        __param(5, files_1.IFileService),
        __param(6, log_1.ILogService),
        __param(7, workingCopyFileService_1.IWorkingCopyFileService),
        __param(8, filesConfigurationService_1.IFilesConfigurationService),
        __param(9, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(10, workingCopyService_1.IWorkingCopyService),
        __param(11, notification_1.INotificationService),
        __param(12, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(13, editorService_1.IEditorService),
        __param(14, elevatedFileService_1.IElevatedFileService)
    ], StoredFileWorkingCopy);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVkRmlsZVdvcmtpbmdDb3B5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya2luZ0NvcHkvY29tbW9uL3N0b3JlZEZpbGVXb3JraW5nQ29weS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUtoRzs7T0FFRztJQUNILElBQWtCLDBCQXFDakI7SUFyQ0QsV0FBa0IsMEJBQTBCO1FBRTNDOztXQUVHO1FBQ0gsNkVBQUssQ0FBQTtRQUVMOztXQUVHO1FBQ0gsNkVBQUssQ0FBQTtRQUVMOzs7V0FHRztRQUNILDJGQUFZLENBQUE7UUFFWjs7OztXQUlHO1FBQ0gsbUZBQVEsQ0FBQTtRQUVSOzs7V0FHRztRQUNILCtFQUFNLENBQUE7UUFFTjs7OztXQUlHO1FBQ0gsNkVBQUssQ0FBQTtJQUNOLENBQUMsRUFyQ2lCLDBCQUEwQiwwQ0FBMUIsMEJBQTBCLFFBcUMzQztJQW1GRCxTQUFnQixnQ0FBZ0MsQ0FBQyxDQUF3QjtRQUN4RSxNQUFNLFNBQVMsR0FBRyxDQUFvQyxDQUFDO1FBRXZELE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUpELDRFQUlDO0lBRU0sSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBNkQsU0FBUSx5Q0FBbUI7O1FBS3BHLElBQUksS0FBSyxLQUFvQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBeUJsRCxZQUFZO1FBRVosWUFDVSxNQUFjLEVBQ3ZCLFFBQWEsRUFDSixJQUFZLEVBQ0osWUFBbUQsRUFDbkQsZ0JBQWdELEVBQ25ELFdBQXlCLEVBQzFCLFVBQXdDLEVBQzVCLHNCQUFnRSxFQUM3RCx5QkFBc0UsRUFDdkUsd0JBQW9FLEVBQzFFLGtCQUF1QyxFQUN0QyxtQkFBMEQsRUFDckQsd0JB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
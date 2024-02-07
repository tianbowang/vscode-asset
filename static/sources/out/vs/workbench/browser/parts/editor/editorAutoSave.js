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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/host/browser/host", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/log/common/log", "vs/platform/markers/common/markers", "vs/base/common/map", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, lifecycle_1, filesConfigurationService_1, host_1, editorService_1, editorGroupsService_1, workingCopyService_1, log_1, markers_1, map_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorAutoSave = void 0;
    let EditorAutoSave = class EditorAutoSave extends lifecycle_1.Disposable {
        constructor(filesConfigurationService, hostService, editorService, editorGroupService, workingCopyService, logService, markerService, uriIdentityService) {
            super();
            this.filesConfigurationService = filesConfigurationService;
            this.hostService = hostService;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.workingCopyService = workingCopyService;
            this.logService = logService;
            this.markerService = markerService;
            this.uriIdentityService = uriIdentityService;
            // Auto save: after delay
            this.scheduledAutoSavesAfterDelay = new Map();
            // Auto save: focus change & window change
            this.lastActiveEditor = undefined;
            this.lastActiveGroupId = undefined;
            this.lastActiveEditorControlDisposable = this._register(new lifecycle_1.DisposableStore());
            // Auto save: waiting on specific condition
            this.waitingOnConditionAutoSaveWorkingCopies = new map_1.ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
            this.waitingOnConditionAutoSaveEditors = new map_1.ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
            // Fill in initial dirty working copies
            for (const dirtyWorkingCopy of this.workingCopyService.dirtyWorkingCopies) {
                this.onDidRegister(dirtyWorkingCopy);
            }
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.hostService.onDidChangeFocus(focused => this.onWindowFocusChange(focused)));
            this._register(this.hostService.onDidChangeActiveWindow(() => this.onActiveWindowChange()));
            this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
            this._register(this.filesConfigurationService.onDidChangeAutoSaveConfiguration(() => this.onDidChangeAutoSaveConfiguration()));
            // Working Copy events
            this._register(this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy)));
            this._register(this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy)));
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy)));
            this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
            // Condition changes
            this._register(this.markerService.onMarkerChanged(e => this.onConditionChanged(e, 3 /* AutoSaveDisabledReason.ERRORS */)));
            this._register(this.filesConfigurationService.onDidChangeAutoSaveDisabled(resource => this.onConditionChanged([resource], 4 /* AutoSaveDisabledReason.DISABLED */)));
        }
        onConditionChanged(resources, condition) {
            for (const resource of resources) {
                // Waiting working copies
                const workingCopyResult = this.waitingOnConditionAutoSaveWorkingCopies.get(resource);
                if (workingCopyResult?.condition === condition) {
                    if (workingCopyResult.workingCopy.isDirty() &&
                        this.filesConfigurationService.getAutoSaveMode(workingCopyResult.workingCopy.resource).mode !== 0 /* AutoSaveMode.OFF */) {
                        this.discardAutoSave(workingCopyResult.workingCopy);
                        this.logService.info(`[editor auto save] running auto save from condition change event`, workingCopyResult.workingCopy.resource.toString(), workingCopyResult.workingCopy.typeId);
                        workingCopyResult.workingCopy.save({ reason: workingCopyResult.reason });
                    }
                }
                // Waiting editors
                else {
                    const editorResult = this.waitingOnConditionAutoSaveEditors.get(resource);
                    if (editorResult?.condition === condition &&
                        !editorResult.editor.editor.isDisposed() &&
                        editorResult.editor.editor.isDirty() &&
                        this.filesConfigurationService.getAutoSaveMode(editorResult.editor.editor).mode !== 0 /* AutoSaveMode.OFF */) {
                        this.waitingOnConditionAutoSaveEditors.delete(resource);
                        this.logService.info(`[editor auto save] running auto save from condition change event with reason ${editorResult.reason}`);
                        this.editorService.save(editorResult.editor, { reason: editorResult.reason });
                    }
                }
            }
        }
        onWindowFocusChange(focused) {
            if (!focused) {
                this.maybeTriggerAutoSave(4 /* SaveReason.WINDOW_CHANGE */);
            }
        }
        onActiveWindowChange() {
            this.maybeTriggerAutoSave(4 /* SaveReason.WINDOW_CHANGE */);
        }
        onDidActiveEditorChange() {
            // Treat editor change like a focus change for our last active editor if any
            if (this.lastActiveEditor && typeof this.lastActiveGroupId === 'number') {
                this.maybeTriggerAutoSave(3 /* SaveReason.FOCUS_CHANGE */, { groupId: this.lastActiveGroupId, editor: this.lastActiveEditor });
            }
            // Remember as last active
            const activeGroup = this.editorGroupService.activeGroup;
            const activeEditor = this.lastActiveEditor = activeGroup.activeEditor ?? undefined;
            this.lastActiveGroupId = activeGroup.id;
            // Dispose previous active control listeners
            this.lastActiveEditorControlDisposable.clear();
            // Listen to focus changes on control for auto save
            const activeEditorPane = this.editorService.activeEditorPane;
            if (activeEditor && activeEditorPane) {
                this.lastActiveEditorControlDisposable.add(activeEditorPane.onDidBlur(() => {
                    this.maybeTriggerAutoSave(3 /* SaveReason.FOCUS_CHANGE */, { groupId: activeGroup.id, editor: activeEditor });
                }));
            }
        }
        maybeTriggerAutoSave(reason, editorIdentifier) {
            if (editorIdentifier) {
                if (!editorIdentifier.editor.isDirty() ||
                    editorIdentifier.editor.isReadonly() ||
                    editorIdentifier.editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                    return; // no auto save for non-dirty, readonly or untitled editors
                }
                const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(editorIdentifier.editor);
                if (autoSaveMode.mode !== 0 /* AutoSaveMode.OFF */) {
                    // Determine if we need to save all. In case of a window focus change we also save if
                    // auto save mode is configured to be ON_FOCUS_CHANGE (editor focus change)
                    if ((reason === 4 /* SaveReason.WINDOW_CHANGE */ && (autoSaveMode.mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */ || autoSaveMode.mode === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */)) ||
                        (reason === 3 /* SaveReason.FOCUS_CHANGE */ && autoSaveMode.mode === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */)) {
                        this.logService.trace(`[editor auto save] triggering auto save with reason ${reason}`);
                        this.editorService.save(editorIdentifier, { reason });
                    }
                }
                else if (editorIdentifier.editor.resource && (autoSaveMode.reason === 3 /* AutoSaveDisabledReason.ERRORS */ || autoSaveMode.reason === 4 /* AutoSaveDisabledReason.DISABLED */)) {
                    this.waitingOnConditionAutoSaveEditors.set(editorIdentifier.editor.resource, { editor: editorIdentifier, reason, condition: autoSaveMode.reason });
                }
            }
            else {
                this.saveAllDirtyAutoSaveables(reason);
            }
        }
        onDidChangeAutoSaveConfiguration() {
            // Trigger a save-all when auto save is enabled
            let reason = undefined;
            switch (this.filesConfigurationService.getAutoSaveMode(undefined).mode) {
                case 3 /* AutoSaveMode.ON_FOCUS_CHANGE */:
                    reason = 3 /* SaveReason.FOCUS_CHANGE */;
                    break;
                case 4 /* AutoSaveMode.ON_WINDOW_CHANGE */:
                    reason = 4 /* SaveReason.WINDOW_CHANGE */;
                    break;
                case 1 /* AutoSaveMode.AFTER_SHORT_DELAY */:
                case 2 /* AutoSaveMode.AFTER_LONG_DELAY */:
                    reason = 2 /* SaveReason.AUTO */;
                    break;
            }
            if (reason) {
                this.saveAllDirtyAutoSaveables(reason);
            }
        }
        saveAllDirtyAutoSaveables(reason) {
            for (const workingCopy of this.workingCopyService.dirtyWorkingCopies) {
                if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
                    continue; // we never auto save untitled working copies
                }
                const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource);
                if (autoSaveMode.mode !== 0 /* AutoSaveMode.OFF */) {
                    workingCopy.save({ reason });
                }
                else if (autoSaveMode.reason === 3 /* AutoSaveDisabledReason.ERRORS */ || autoSaveMode.reason === 4 /* AutoSaveDisabledReason.DISABLED */) {
                    this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, { workingCopy, reason, condition: autoSaveMode.reason });
                }
            }
        }
        onDidRegister(workingCopy) {
            if (workingCopy.isDirty()) {
                this.scheduleAutoSave(workingCopy);
            }
        }
        onDidUnregister(workingCopy) {
            this.discardAutoSave(workingCopy);
        }
        onDidChangeDirty(workingCopy) {
            if (workingCopy.isDirty()) {
                this.scheduleAutoSave(workingCopy);
            }
            else {
                this.discardAutoSave(workingCopy);
            }
        }
        onDidChangeContent(workingCopy) {
            if (workingCopy.isDirty()) {
                // this listener will make sure that the auto save is
                // pushed out for as long as the user is still changing
                // the content of the working copy.
                this.scheduleAutoSave(workingCopy);
            }
        }
        scheduleAutoSave(workingCopy) {
            if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
                return; // we never auto save untitled working copies
            }
            const autoSaveAfterDelay = this.filesConfigurationService.getAutoSaveConfiguration(workingCopy.resource).autoSaveDelay;
            if (typeof autoSaveAfterDelay !== 'number') {
                return; // auto save after delay must be enabled
            }
            // Clear any running auto save operation
            this.discardAutoSave(workingCopy);
            this.logService.trace(`[editor auto save] scheduling auto save after ${autoSaveAfterDelay}ms`, workingCopy.resource.toString(), workingCopy.typeId);
            // Schedule new auto save
            const handle = setTimeout(() => {
                // Clear pending
                this.discardAutoSave(workingCopy);
                // Save if dirty and unless prevented by other conditions such as error markers
                if (workingCopy.isDirty()) {
                    const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource);
                    if (autoSaveMode.mode !== 0 /* AutoSaveMode.OFF */) {
                        this.logService.trace(`[editor auto save] running auto save`, workingCopy.resource.toString(), workingCopy.typeId);
                        workingCopy.save({ reason: 2 /* SaveReason.AUTO */ });
                    }
                    else if (autoSaveMode.reason === 3 /* AutoSaveDisabledReason.ERRORS */ || autoSaveMode.reason === 4 /* AutoSaveDisabledReason.DISABLED */) {
                        this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, { workingCopy, reason: 2 /* SaveReason.AUTO */, condition: autoSaveMode.reason });
                    }
                }
            }, autoSaveAfterDelay);
            // Keep in map for disposal as needed
            this.scheduledAutoSavesAfterDelay.set(workingCopy, (0, lifecycle_1.toDisposable)(() => {
                this.logService.trace(`[editor auto save] clearing pending auto save`, workingCopy.resource.toString(), workingCopy.typeId);
                clearTimeout(handle);
            }));
        }
        discardAutoSave(workingCopy) {
            (0, lifecycle_1.dispose)(this.scheduledAutoSavesAfterDelay.get(workingCopy));
            this.scheduledAutoSavesAfterDelay.delete(workingCopy);
            this.waitingOnConditionAutoSaveWorkingCopies.delete(workingCopy.resource);
            this.waitingOnConditionAutoSaveEditors.delete(workingCopy.resource);
        }
    };
    exports.EditorAutoSave = EditorAutoSave;
    exports.EditorAutoSave = EditorAutoSave = __decorate([
        __param(0, filesConfigurationService_1.IFilesConfigurationService),
        __param(1, host_1.IHostService),
        __param(2, editorService_1.IEditorService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, workingCopyService_1.IWorkingCopyService),
        __param(5, log_1.ILogService),
        __param(6, markers_1.IMarkerService),
        __param(7, uriIdentity_1.IUriIdentityService)
    ], EditorAutoSave);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQXV0b1NhdmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JBdXRvU2F2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQnpGLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTtRQWM3QyxZQUM2Qix5QkFBc0UsRUFDcEYsV0FBMEMsRUFDeEMsYUFBOEMsRUFDeEMsa0JBQXlELEVBQzFELGtCQUF3RCxFQUNoRSxVQUF3QyxFQUNyQyxhQUE4QyxFQUN6QyxrQkFBd0Q7WUFFN0UsS0FBSyxFQUFFLENBQUM7WUFUcUMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUE0QjtZQUNuRSxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUN2QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQUN6Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQy9DLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDcEIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ3hCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFwQjlFLHlCQUF5QjtZQUNSLGlDQUE0QixHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1lBRXJGLDBDQUEwQztZQUNsQyxxQkFBZ0IsR0FBNEIsU0FBUyxDQUFDO1lBQ3RELHNCQUFpQixHQUFnQyxTQUFTLENBQUM7WUFDM0Qsc0NBQWlDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBRWxGLDJDQUEyQztZQUMxQiw0Q0FBdUMsR0FBRyxJQUFJLGlCQUFXLENBQXlHLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1B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
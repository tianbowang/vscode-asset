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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/types", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor/editorModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, buffer_1, errors_1, event_1, lifecycle_1, network_1, objects_1, types_1, configuration_1, editorModel_1, notebookCommon_1, notebookService_1, filesConfigurationService_1) {
    "use strict";
    var SimpleNotebookEditorModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookFileWorkingCopyModelFactory = exports.NotebookFileWorkingCopyModel = exports.SimpleNotebookEditorModel = void 0;
    //#region --- simple content provider
    let SimpleNotebookEditorModel = SimpleNotebookEditorModel_1 = class SimpleNotebookEditorModel extends editorModel_1.EditorModel {
        constructor(resource, _hasAssociatedFilePath, viewType, _workingCopyManager, _filesConfigurationService) {
            super();
            this.resource = resource;
            this._hasAssociatedFilePath = _hasAssociatedFilePath;
            this.viewType = viewType;
            this._workingCopyManager = _workingCopyManager;
            this._filesConfigurationService = _filesConfigurationService;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this._onDidSave = this._register(new event_1.Emitter());
            this._onDidChangeOrphaned = this._register(new event_1.Emitter());
            this._onDidChangeReadonly = this._register(new event_1.Emitter());
            this._onDidRevertUntitled = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this.onDidSave = this._onDidSave.event;
            this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
            this.onDidChangeReadonly = this._onDidChangeReadonly.event;
            this.onDidRevertUntitled = this._onDidRevertUntitled.event;
            this._workingCopyListeners = this._register(new lifecycle_1.DisposableStore());
            this.scratchPad = viewType === 'interactive';
        }
        dispose() {
            this._workingCopy?.dispose();
            super.dispose();
        }
        get notebook() {
            return this._workingCopy?.model?.notebookModel;
        }
        isResolved() {
            return Boolean(this._workingCopy?.model?.notebookModel);
        }
        async canDispose() {
            if (!this._workingCopy) {
                return true;
            }
            if (SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy)) {
                return this._workingCopyManager.stored.canDispose(this._workingCopy);
            }
            else {
                return true;
            }
        }
        isDirty() {
            return this._workingCopy?.isDirty() ?? false;
        }
        isModified() {
            return this._workingCopy?.isModified() ?? false;
        }
        isOrphaned() {
            return SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy) && this._workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */);
        }
        hasAssociatedFilePath() {
            return !SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy) && !!this._workingCopy?.hasAssociatedFilePath;
        }
        isReadonly() {
            if (SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy)) {
                return this._workingCopy?.isReadonly();
            }
            else {
                return this._filesConfigurationService.isReadonly(this.resource);
            }
        }
        get hasErrorState() {
            if (this._workingCopy && 'hasState' in this._workingCopy) {
                return this._workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */);
            }
            return false;
        }
        revert(options) {
            (0, types_1.assertType)(this.isResolved());
            return this._workingCopy.revert(options);
        }
        save(options) {
            (0, types_1.assertType)(this.isResolved());
            return this._workingCopy.save(options);
        }
        async load(options) {
            if (!this._workingCopy || !this._workingCopy.model) {
                if (this.resource.scheme === network_1.Schemas.untitled) {
                    if (this._hasAssociatedFilePath) {
                        this._workingCopy = await this._workingCopyManager.resolve({ associatedResource: this.resource });
                    }
                    else {
                        this._workingCopy = await this._workingCopyManager.resolve({ untitledResource: this.resource, isScratchpad: this.scratchPad });
                    }
                    this._workingCopy.onDidRevert(() => this._onDidRevertUntitled.fire());
                }
                else {
                    this._workingCopy = await this._workingCopyManager.resolve(this.resource, {
                        limits: options?.limits,
                        reload: options?.forceReadFromFile ? { async: false, force: true } : undefined
                    });
                    this._workingCopyListeners.add(this._workingCopy.onDidSave(e => this._onDidSave.fire(e)));
                    this._workingCopyListeners.add(this._workingCopy.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
                    this._workingCopyListeners.add(this._workingCopy.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
                }
                this._workingCopyListeners.add(this._workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(), undefined));
                this._workingCopyListeners.add(this._workingCopy.onWillDispose(() => {
                    this._workingCopyListeners.clear();
                    this._workingCopy?.model?.dispose();
                }));
            }
            else {
                await this._workingCopyManager.resolve(this.resource, {
                    reload: {
                        async: !options?.forceReadFromFile,
                        force: options?.forceReadFromFile
                    },
                    limits: options?.limits
                });
            }
            (0, types_1.assertType)(this.isResolved());
            return this;
        }
        async saveAs(target) {
            const newWorkingCopy = await this._workingCopyManager.saveAs(this.resource, target);
            if (!newWorkingCopy) {
                return undefined;
            }
            // this is a little hacky because we leave the new working copy alone. BUT
            // the newly created editor input will pick it up and claim ownership of it.
            return { resource: newWorkingCopy.resource };
        }
        static _isStoredFileWorkingCopy(candidate) {
            const isUntitled = candidate && candidate.capabilities & 2 /* WorkingCopyCapabilities.Untitled */;
            return !isUntitled;
        }
    };
    exports.SimpleNotebookEditorModel = SimpleNotebookEditorModel;
    exports.SimpleNotebookEditorModel = SimpleNotebookEditorModel = SimpleNotebookEditorModel_1 = __decorate([
        __param(4, filesConfigurationService_1.IFilesConfigurationService)
    ], SimpleNotebookEditorModel);
    class NotebookFileWorkingCopyModel extends lifecycle_1.Disposable {
        constructor(_notebookModel, _notebookService, _configurationService) {
            super();
            this._notebookModel = _notebookModel;
            this._notebookService = _notebookService;
            this._configurationService = _configurationService;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this.configuration = undefined;
            this.onWillDispose = _notebookModel.onWillDispose.bind(_notebookModel);
            this._register(_notebookModel.onDidChangeContent(e => {
                for (const rawEvent of e.rawEvents) {
                    if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.Initialize) {
                        continue;
                    }
                    if (rawEvent.transient) {
                        continue;
                    }
                    this._onDidChangeContent.fire({
                        isRedoing: false, //todo@rebornix forward this information from notebook model
                        isUndoing: false,
                        isInitial: false, //_notebookModel.cells.length === 0 // todo@jrieken non transient metadata?
                    });
                    break;
                }
            }));
            if (_notebookModel.uri.scheme === network_1.Schemas.vscodeRemote) {
                this.configuration = {
                    // Intentionally pick a larger delay for triggering backups when
                    // we are connected to a remote. This saves us repeated roundtrips
                    // to the remote server when the content changes because the
                    // remote hosts the extension of the notebook with the contents truth
                    backupDelay: 10000
                };
                // Override save behavior to avoid transferring the buffer across the wire 3 times
                if (this._configurationService.getValue(notebookCommon_1.NotebookSetting.remoteSaving)) {
                    this.save = async (options, token) => {
                        const serializer = await this.getNotebookSerializer();
                        if (token.isCancellationRequested) {
                            throw new errors_1.CancellationError();
                        }
                        const stat = await serializer.save(this._notebookModel.uri, this._notebookModel.versionId, options, token);
                        return stat;
                    };
                }
            }
        }
        dispose() {
            this._notebookModel.dispose();
            super.dispose();
        }
        get notebookModel() {
            return this._notebookModel;
        }
        async snapshot(token) {
            const serializer = await this.getNotebookSerializer();
            const data = {
                metadata: (0, objects_1.filter)(this._notebookModel.metadata, key => !serializer.options.transientDocumentMetadata[key]),
                cells: [],
            };
            for (const cell of this._notebookModel.cells) {
                const cellData = {
                    cellKind: cell.cellKind,
                    language: cell.language,
                    mime: cell.mime,
                    source: cell.getValue(),
                    outputs: [],
                    internalMetadata: cell.internalMetadata
                };
                cellData.outputs = !serializer.options.transientOutputs ? cell.outputs : [];
                cellData.metadata = (0, objects_1.filter)(cell.metadata, key => !serializer.options.transientCellMetadata[key]);
                data.cells.push(cellData);
            }
            const bytes = await serializer.notebookToData(data);
            if (token.isCancellationRequested) {
                throw new errors_1.CancellationError();
            }
            return (0, buffer_1.bufferToStream)(bytes);
        }
        async update(stream, token) {
            const serializer = await this.getNotebookSerializer();
            const bytes = await (0, buffer_1.streamToBuffer)(stream);
            const data = await serializer.dataToNotebook(bytes);
            if (token.isCancellationRequested) {
                throw new errors_1.CancellationError();
            }
            this._notebookModel.reset(data.cells, data.metadata, serializer.options);
        }
        async getNotebookSerializer() {
            const info = await this._notebookService.withNotebookDataProvider(this.notebookModel.viewType);
            if (!(info instanceof notebookService_1.SimpleNotebookProviderInfo)) {
                throw new Error('CANNOT open file notebook with this provider');
            }
            return info.serializer;
        }
        get versionId() {
            return this._notebookModel.alternativeVersionId;
        }
        pushStackElement() {
            this._notebookModel.pushStackElement('save', undefined, undefined);
        }
    }
    exports.NotebookFileWorkingCopyModel = NotebookFileWorkingCopyModel;
    let NotebookFileWorkingCopyModelFactory = class NotebookFileWorkingCopyModelFactory {
        constructor(_viewType, _notebookService, _configurationService) {
            this._viewType = _viewType;
            this._notebookService = _notebookService;
            this._configurationService = _configurationService;
        }
        async createModel(resource, stream, token) {
            const info = await this._notebookService.withNotebookDataProvider(this._viewType);
            if (!(info instanceof notebookService_1.SimpleNotebookProviderInfo)) {
                throw new Error('CANNOT open file notebook with this provider');
            }
            const bytes = await (0, buffer_1.streamToBuffer)(stream);
            const data = await info.serializer.dataToNotebook(bytes);
            if (token.isCancellationRequested) {
                throw new errors_1.CancellationError();
            }
            const notebookModel = this._notebookService.createNotebookTextModel(info.viewType, resource, data, info.serializer.options);
            return new NotebookFileWorkingCopyModel(notebookModel, this._notebookService, this._configurationService);
        }
    };
    exports.NotebookFileWorkingCopyModelFactory = NotebookFileWorkingCopyModelFactory;
    exports.NotebookFileWorkingCopyModelFactory = NotebookFileWorkingCopyModelFactory = __decorate([
        __param(1, notebookService_1.INotebookService),
        __param(2, configuration_1.IConfigurationService)
    ], NotebookFileWorkingCopyModelFactory);
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svY29tbW9uL25vdGVib29rRWRpdG9yTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBCaEcscUNBQXFDO0lBRTlCLElBQU0seUJBQXlCLGlDQUEvQixNQUFNLHlCQUEwQixTQUFRLHlCQUFXO1FBa0J6RCxZQUNVLFFBQWEsRUFDTCxzQkFBK0IsRUFDdkMsUUFBZ0IsRUFDUixtQkFBd0csRUFDN0YsMEJBQXVFO1lBRW5HLEtBQUssRUFBRSxDQUFDO1lBTkMsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUNMLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBUztZQUN2QyxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQ1Isd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxRjtZQUM1RSwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTRCO1lBckJuRixzQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUN4RCxlQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBbUMsQ0FBQyxDQUFDO1lBQzVFLHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzNELHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzNELHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBRW5FLHFCQUFnQixHQUFnQixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBQzdELGNBQVMsR0FBMkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDMUUsd0JBQW1CLEdBQWdCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFDbkUsd0JBQW1CLEdBQWdCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFDbkUsd0JBQW1CLEdBQWdCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFHM0QsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBWTlFLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxLQUFLLGFBQWEsQ0FBQztRQUM5QyxDQUFDO1FBRVEsT0FBTztZQUNmLElBQUksQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDN0IsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQztRQUNoRCxDQUFDO1FBRVEsVUFBVTtZQUNsQixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsS0FBSyxDQUFDLFVBQVU7WUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxJQUFJLDJCQUF5QixDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO2dCQUMzRSxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0RSxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU87WUFDTixPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLElBQUksS0FBSyxDQUFDO1FBQzlDLENBQUM7UUFFRCxVQUFVO1lBQ1QsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxJQUFJLEtBQUssQ0FBQztRQUNqRCxDQUFDO1FBRUQsVUFBVTtZQUNULE9BQU8sMkJBQXlCLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSwyQ0FBbUMsQ0FBQztRQUMvSSxDQUFDO1FBRUQscUJBQXFCO1lBQ3BCLE9BQU8sQ0FBQywyQkFBeUIsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUscUJBQXFCLENBQUM7UUFDN0gsQ0FBQztRQUVELFVBQVU7WUFDVCxJQUFJLDJCQUF5QixDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO2dCQUMzRSxPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLENBQUM7WUFDeEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEUsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFJLGFBQWE7WUFDaEIsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLFVBQVUsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQzFELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLDBDQUFrQyxDQUFDO1lBQ3JFLENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBd0I7WUFDOUIsSUFBQSxrQkFBVSxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQzlCLE9BQU8sSUFBSSxDQUFDLFlBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFzQjtZQUMxQixJQUFBLGtCQUFVLEVBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDOUIsT0FBTyxJQUFJLENBQUMsWUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUE4QjtZQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3BELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDL0MsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzt3QkFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDbkcsQ0FBQzt5QkFBTSxDQUFDO3dCQUNQLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ2hJLENBQUM7b0JBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3ZFLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO3dCQUN6RSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU07d0JBQ3ZCLE1BQU0sRUFBRSxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7cUJBQzlFLENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxRixJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDOUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9HLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUVuSCxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRTtvQkFDbkUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNuQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztnQkFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDckQsTUFBTSxFQUFFO3dCQUNQLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxpQkFBaUI7d0JBQ2xDLEtBQUssRUFBRSxPQUFPLEVBQUUsaUJBQWlCO3FCQUNqQztvQkFDRCxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU07aUJBQ3ZCLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxJQUFBLGtCQUFVLEVBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDOUIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFXO1lBQ3ZCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDckIsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUNELDBFQUEwRTtZQUMxRSw0RUFBNEU7WUFDNUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVPLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxTQUF5SDtZQUNoSyxNQUFNLFVBQVUsR0FBRyxTQUFTLElBQUksU0FBUyxDQUFDLFlBQVksMkNBQW1DLENBQUM7WUFFMUYsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUNwQixDQUFDO0tBQ0QsQ0FBQTtJQXRKWSw4REFBeUI7d0NBQXpCLHlCQUF5QjtRQXVCbkMsV0FBQSxzREFBMEIsQ0FBQTtPQXZCaEIseUJBQXlCLENBc0pyQztJQUVELE1BQWEsNEJBQTZCLFNBQVEsc0JBQVU7UUFVM0QsWUFDa0IsY0FBaUMsRUFDakMsZ0JBQWtDLEVBQ2xDLHFCQUE0QztZQUU3RCxLQUFLLEVBQUUsQ0FBQztZQUpTLG1CQUFjLEdBQWQsY0FBYyxDQUFtQjtZQUNqQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ2xDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFYN0Msd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBcUcsQ0FBQyxDQUFDO1lBQy9KLHVCQUFrQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFJcEQsa0JBQWEsR0FBbUQsU0FBUyxDQUFDO1lBVWxGLElBQUksQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFdkUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BELEtBQUssTUFBTSxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNwQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssd0NBQXVCLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBQzFELFNBQVM7b0JBQ1YsQ0FBQztvQkFDRCxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDeEIsU0FBUztvQkFDVixDQUFDO29CQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7d0JBQzdCLFNBQVMsRUFBRSxLQUFLLEVBQUUsNERBQTREO3dCQUM5RSxTQUFTLEVBQUUsS0FBSzt3QkFDaEIsU0FBUyxFQUFFLEtBQUssRUFBRSwyRUFBMkU7cUJBQzdGLENBQUMsQ0FBQztvQkFDSCxNQUFNO2dCQUNQLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN4RCxJQUFJLENBQUMsYUFBYSxHQUFHO29CQUNwQixnRUFBZ0U7b0JBQ2hFLGtFQUFrRTtvQkFDbEUsNERBQTREO29CQUM1RCxxRUFBcUU7b0JBQ3JFLFdBQVcsRUFBRSxLQUFLO2lCQUNsQixDQUFDO2dCQUVGLGtGQUFrRjtnQkFDbEYsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLGdDQUFlLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztvQkFDdkUsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLEVBQUUsT0FBMEIsRUFBRSxLQUF3QixFQUFFLEVBQUU7d0JBQzFFLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7d0JBRXRELElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7NEJBQ25DLE1BQU0sSUFBSSwwQkFBaUIsRUFBRSxDQUFDO3dCQUMvQixDQUFDO3dCQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQzNHLE9BQU8sSUFBSSxDQUFDO29CQUNiLENBQUMsQ0FBQztnQkFDSCxDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM5QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDNUIsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBd0I7WUFDdEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUV0RCxNQUFNLElBQUksR0FBaUI7Z0JBQzFCLFFBQVEsRUFBRSxJQUFBLGdCQUFNLEVBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3pHLEtBQUssRUFBRSxFQUFFO2FBQ1QsQ0FBQztZQUVGLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDOUMsTUFBTSxRQUFRLEdBQWM7b0JBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO29CQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2YsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQ3ZCLE9BQU8sRUFBRSxFQUFFO29CQUNYLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7aUJBQ3ZDLENBQUM7Z0JBRUYsUUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDNUUsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFBLGdCQUFNLEVBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUVqRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQixDQUFDO1lBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BELElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25DLE1BQU0sSUFBSSwwQkFBaUIsRUFBRSxDQUFDO1lBQy9CLENBQUM7WUFDRCxPQUFPLElBQUEsdUJBQWMsRUFBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUE4QixFQUFFLEtBQXdCO1lBQ3BFLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFdEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLHVCQUFjLEVBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxVQUFVLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBELElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25DLE1BQU0sSUFBSSwwQkFBaUIsRUFBRSxDQUFDO1lBQy9CLENBQUM7WUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFRCxLQUFLLENBQUMscUJBQXFCO1lBQzFCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0YsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLDRDQUEwQixDQUFDLEVBQUUsQ0FBQztnQkFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1lBQ2pFLENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQUksU0FBUztZQUNaLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqRCxDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7S0FDRDtJQWpJRCxvRUFpSUM7SUFFTSxJQUFNLG1DQUFtQyxHQUF6QyxNQUFNLG1DQUFtQztRQUUvQyxZQUNrQixTQUFpQixFQUNDLGdCQUFrQyxFQUM3QixxQkFBNEM7WUFGbkUsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDN0IsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUNqRixDQUFDO1FBRUwsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFhLEVBQUUsTUFBOEIsRUFBRSxLQUF3QjtZQUV4RixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLDRDQUEwQixDQUFDLEVBQUUsQ0FBQztnQkFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1lBQ2pFLENBQUM7WUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsdUJBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXpELElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25DLE1BQU0sSUFBSSwwQkFBaUIsRUFBRSxDQUFDO1lBQy9CLENBQUM7WUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUgsT0FBTyxJQUFJLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDM0csQ0FBQztLQUNELENBQUE7SUF6Qlksa0ZBQW1DO2tEQUFuQyxtQ0FBbUM7UUFJN0MsV0FBQSxrQ0FBZ0IsQ0FBQTtRQUNoQixXQUFBLHFDQUFxQixDQUFBO09BTFgsbUNBQW1DLENBeUIvQzs7QUFFRCxZQUFZIn0=
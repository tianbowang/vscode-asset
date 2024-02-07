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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModel", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookService", "vs/platform/log/common/log", "vs/base/common/event", "vs/workbench/services/extensions/common/extensions", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/map", "vs/workbench/services/workingCopy/common/fileWorkingCopyManager", "vs/base/common/network", "vs/workbench/contrib/notebook/common/notebookProvider", "vs/base/common/types", "vs/base/common/cancellation", "vs/platform/configuration/common/configuration"], function (require, exports, instantiation_1, uri_1, notebookCommon_1, notebookEditorModel_1, lifecycle_1, notebookService_1, log_1, event_1, extensions_1, uriIdentity_1, map_1, fileWorkingCopyManager_1, network_1, notebookProvider_1, types_1, cancellation_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookModelResolverServiceImpl = void 0;
    let NotebookModelReferenceCollection = class NotebookModelReferenceCollection extends lifecycle_1.ReferenceCollection {
        constructor(_instantiationService, _notebookService, _logService, _configurationService) {
            super();
            this._instantiationService = _instantiationService;
            this._notebookService = _notebookService;
            this._logService = _logService;
            this._configurationService = _configurationService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._workingCopyManagers = new Map();
            this._modelListener = new Map();
            this._onDidSaveNotebook = new event_1.Emitter();
            this.onDidSaveNotebook = this._onDidSaveNotebook.event;
            this._onDidChangeDirty = new event_1.Emitter();
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._dirtyStates = new map_1.ResourceMap();
            this.modelsToDispose = new Set();
        }
        dispose() {
            this._disposables.dispose();
            this._onDidSaveNotebook.dispose();
            this._onDidChangeDirty.dispose();
            (0, lifecycle_1.dispose)(this._modelListener.values());
            (0, lifecycle_1.dispose)(this._workingCopyManagers.values());
        }
        isDirty(resource) {
            return this._dirtyStates.get(resource) ?? false;
        }
        async createReferencedObject(key, viewType, hasAssociatedFilePath, limits) {
            // Untrack as being disposed
            this.modelsToDispose.delete(key);
            const uri = uri_1.URI.parse(key);
            const workingCopyTypeId = notebookCommon_1.NotebookWorkingCopyTypeIdentifier.create(viewType);
            let workingCopyManager = this._workingCopyManagers.get(workingCopyTypeId);
            if (!workingCopyManager) {
                const factory = new notebookEditorModel_1.NotebookFileWorkingCopyModelFactory(viewType, this._notebookService, this._configurationService);
                workingCopyManager = this._instantiationService.createInstance(fileWorkingCopyManager_1.FileWorkingCopyManager, workingCopyTypeId, factory, factory);
                this._workingCopyManagers.set(workingCopyTypeId, workingCopyManager);
            }
            const model = this._instantiationService.createInstance(notebookEditorModel_1.SimpleNotebookEditorModel, uri, hasAssociatedFilePath, viewType, workingCopyManager);
            const result = await model.load({ limits });
            // Whenever a notebook model is dirty we automatically reference it so that
            // we can ensure that at least one reference exists. That guarantees that
            // a model with unsaved changes is never disposed.
            let onDirtyAutoReference;
            this._modelListener.set(result, (0, lifecycle_1.combinedDisposable)(result.onDidSave(() => this._onDidSaveNotebook.fire(result.resource)), result.onDidChangeDirty(() => {
                const isDirty = result.isDirty();
                this._dirtyStates.set(result.resource, isDirty);
                // isDirty -> add reference
                // !isDirty -> free reference
                if (isDirty && !onDirtyAutoReference) {
                    onDirtyAutoReference = this.acquire(key, viewType);
                }
                else if (onDirtyAutoReference) {
                    onDirtyAutoReference.dispose();
                    onDirtyAutoReference = undefined;
                }
                this._onDidChangeDirty.fire(result);
            }), (0, lifecycle_1.toDisposable)(() => onDirtyAutoReference?.dispose())));
            return result;
        }
        destroyReferencedObject(key, object) {
            this.modelsToDispose.add(key);
            (async () => {
                try {
                    const model = await object;
                    if (!this.modelsToDispose.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    if (model instanceof notebookEditorModel_1.SimpleNotebookEditorModel) {
                        await model.canDispose();
                    }
                    if (!this.modelsToDispose.has(key)) {
                        // return if model has been acquired again meanwhile
                        return;
                    }
                    // Finally we can dispose the model
                    this._modelListener.get(model)?.dispose();
                    this._modelListener.delete(model);
                    model.dispose();
                }
                catch (err) {
                    this._logService.error('FAILED to destory notebook', err);
                }
                finally {
                    this.modelsToDispose.delete(key); // Untrack as being disposed
                }
            })();
        }
    };
    NotebookModelReferenceCollection = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notebookService_1.INotebookService),
        __param(2, log_1.ILogService),
        __param(3, configuration_1.IConfigurationService)
    ], NotebookModelReferenceCollection);
    let NotebookModelResolverServiceImpl = class NotebookModelResolverServiceImpl {
        constructor(instantiationService, _notebookService, _extensionService, _uriIdentService) {
            this._notebookService = _notebookService;
            this._extensionService = _extensionService;
            this._uriIdentService = _uriIdentService;
            this._onWillFailWithConflict = new event_1.AsyncEmitter();
            this.onWillFailWithConflict = this._onWillFailWithConflict.event;
            this._data = instantiationService.createInstance(NotebookModelReferenceCollection);
            this.onDidSaveNotebook = this._data.onDidSaveNotebook;
            this.onDidChangeDirty = this._data.onDidChangeDirty;
        }
        dispose() {
            this._data.dispose();
        }
        isDirty(resource) {
            return this._data.isDirty(resource);
        }
        async resolve(arg0, viewType, limits) {
            let resource;
            let hasAssociatedFilePath = false;
            if (uri_1.URI.isUri(arg0)) {
                resource = arg0;
            }
            else {
                if (!arg0.untitledResource) {
                    const info = this._notebookService.getContributedNotebookType((0, types_1.assertIsDefined)(viewType));
                    if (!info) {
                        throw new Error('UNKNOWN view type: ' + viewType);
                    }
                    const suffix = notebookProvider_1.NotebookProviderInfo.possibleFileEnding(info.selectors) ?? '';
                    for (let counter = 1;; counter++) {
                        const candidate = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: `Untitled-${counter}${suffix}`, query: viewType });
                        if (!this._notebookService.getNotebookTextModel(candidate)) {
                            resource = candidate;
                            break;
                        }
                    }
                }
                else if (arg0.untitledResource.scheme === network_1.Schemas.untitled) {
                    resource = arg0.untitledResource;
                }
                else {
                    resource = arg0.untitledResource.with({ scheme: network_1.Schemas.untitled });
                    hasAssociatedFilePath = true;
                }
            }
            if (resource.scheme === notebookCommon_1.CellUri.scheme) {
                throw new Error(`CANNOT open a cell-uri as notebook. Tried with ${resource.toString()}`);
            }
            resource = this._uriIdentService.asCanonicalUri(resource);
            const existingViewType = this._notebookService.getNotebookTextModel(resource)?.viewType;
            if (!viewType) {
                if (existingViewType) {
                    viewType = existingViewType;
                }
                else {
                    await this._extensionService.whenInstalledExtensionsRegistered();
                    const providers = this._notebookService.getContributedNotebookTypes(resource);
                    const exclusiveProvider = providers.find(provider => provider.exclusive);
                    viewType = exclusiveProvider?.id || providers[0]?.id;
                }
            }
            if (!viewType) {
                throw new Error(`Missing viewType for '${resource}'`);
            }
            if (existingViewType && existingViewType !== viewType) {
                await this._onWillFailWithConflict.fireAsync({ resource, viewType }, cancellation_1.CancellationToken.None);
                // check again, listener should have done cleanup
                const existingViewType2 = this._notebookService.getNotebookTextModel(resource)?.viewType;
                if (existingViewType2 && existingViewType2 !== viewType) {
                    throw new Error(`A notebook with view type '${existingViewType2}' already exists for '${resource}', CANNOT create another notebook with view type ${viewType}`);
                }
            }
            const reference = this._data.acquire(resource.toString(), viewType, hasAssociatedFilePath, limits);
            try {
                const model = await reference.object;
                return {
                    object: model,
                    dispose() { reference.dispose(); }
                };
            }
            catch (err) {
                reference.dispose();
                throw err;
            }
        }
    };
    exports.NotebookModelResolverServiceImpl = NotebookModelResolverServiceImpl;
    exports.NotebookModelResolverServiceImpl = NotebookModelResolverServiceImpl = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notebookService_1.INotebookService),
        __param(2, extensions_1.IExtensionService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], NotebookModelResolverServiceImpl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JNb2RlbFJlc29sdmVyU2VydmljZUltcGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2NvbW1vbi9ub3RlYm9va0VkaXRvck1vZGVsUmVzb2x2ZXJTZXJ2aWNlSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWlDLFNBQVEsK0JBQTBEO1FBZXhHLFlBQ3dCLHFCQUE2RCxFQUNsRSxnQkFBbUQsRUFDeEQsV0FBeUMsRUFDL0IscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBTGdDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDakQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUN2QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNkLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFqQnBFLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDckMseUJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQStGLENBQUM7WUFDOUgsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBNkMsQ0FBQztZQUV0RSx1QkFBa0IsR0FBRyxJQUFJLGVBQU8sRUFBTyxDQUFDO1lBQ2hELHNCQUFpQixHQUFlLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7WUFFdEQsc0JBQWlCLEdBQUcsSUFBSSxlQUFPLEVBQWdDLENBQUM7WUFDeEUscUJBQWdCLEdBQXdDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7WUFFN0UsaUJBQVksR0FBRyxJQUFJLGlCQUFXLEVBQVcsQ0FBQztZQUUxQyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFRckQsQ0FBQztRQUVELE9B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
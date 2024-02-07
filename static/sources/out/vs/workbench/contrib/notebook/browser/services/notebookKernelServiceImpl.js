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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/storage/common/storage", "vs/base/common/uri", "vs/workbench/contrib/notebook/common/notebookService", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/network", "vs/base/browser/window", "vs/base/browser/dom"], function (require, exports, event_1, lifecycle_1, map_1, storage_1, uri_1, notebookService_1, actions_1, contextkey_1, network_1, window_1, dom_1) {
    "use strict";
    var NotebookKernelService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookKernelService = void 0;
    class KernelInfo {
        static { this._logicClock = 0; }
        constructor(kernel) {
            this.notebookPriorities = new map_1.ResourceMap();
            this.kernel = kernel;
            this.score = -1;
            this.time = KernelInfo._logicClock++;
        }
    }
    class NotebookTextModelLikeId {
        static str(k) {
            return `${k.viewType}/${k.uri.toString()}`;
        }
        static obj(s) {
            const idx = s.indexOf('/');
            return {
                viewType: s.substring(0, idx),
                uri: uri_1.URI.parse(s.substring(idx + 1))
            };
        }
    }
    class SourceAction extends lifecycle_1.Disposable {
        constructor(action, model, isPrimary) {
            super();
            this.action = action;
            this.model = model;
            this.isPrimary = isPrimary;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
        }
        async runAction() {
            if (this.execution) {
                return this.execution;
            }
            this.execution = this._runAction();
            this._onDidChangeState.fire();
            await this.execution;
            this.execution = undefined;
            this._onDidChangeState.fire();
        }
        async _runAction() {
            try {
                await this.action.run({
                    uri: this.model.uri,
                    $mid: 14 /* MarshalledId.NotebookActionContext */
                });
            }
            catch (error) {
                console.warn(`Kernel source command failed: ${error}`);
            }
        }
    }
    let NotebookKernelService = class NotebookKernelService extends lifecycle_1.Disposable {
        static { NotebookKernelService_1 = this; }
        static { this._storageNotebookBinding = 'notebook.controller2NotebookBindings'; }
        constructor(_notebookService, _storageService, _menuService, _contextKeyService) {
            super();
            this._notebookService = _notebookService;
            this._storageService = _storageService;
            this._menuService = _menuService;
            this._contextKeyService = _contextKeyService;
            this._kernels = new Map();
            this._notebookBindings = new map_1.LRUCache(1000, 0.7);
            this._onDidChangeNotebookKernelBinding = this._register(new event_1.Emitter());
            this._onDidAddKernel = this._register(new event_1.Emitter());
            this._onDidRemoveKernel = this._register(new event_1.Emitter());
            this._onDidChangeNotebookAffinity = this._register(new event_1.Emitter());
            this._onDidChangeSourceActions = this._register(new event_1.Emitter());
            this._onDidNotebookVariablesChange = this._register(new event_1.Emitter());
            this._kernelSources = new Map();
            this._kernelSourceActionsUpdates = new Map();
            this._kernelDetectionTasks = new Map();
            this._onDidChangeKernelDetectionTasks = this._register(new event_1.Emitter());
            this._kernelSourceActionProviders = new Map();
            this.onDidChangeSelectedNotebooks = this._onDidChangeNotebookKernelBinding.event;
            this.onDidAddKernel = this._onDidAddKernel.event;
            this.onDidRemoveKernel = this._onDidRemoveKernel.event;
            this.onDidChangeNotebookAffinity = this._onDidChangeNotebookAffinity.event;
            this.onDidChangeSourceActions = this._onDidChangeSourceActions.event;
            this.onDidChangeKernelDetectionTasks = this._onDidChangeKernelDetectionTasks.event;
            this.onDidNotebookVariablesUpdate = this._onDidNotebookVariablesChange.event;
            // auto associate kernels to new notebook documents, also emit event when
            // a notebook has been closed (but don't update the memento)
            this._register(_notebookService.onDidAddNotebookDocument(this._tryAutoBindNotebook, this));
            this._register(_notebookService.onWillRemoveNotebookDocument(notebook => {
                const id = NotebookTextModelLikeId.str(notebook);
                const kernelId = this._notebookBindings.get(id);
                if (kernelId && notebook.uri.scheme === network_1.Schemas.untitled) {
                    this.selectKernelForNotebook(undefined, notebook);
                }
                this._kernelSourceActionsUpdates.get(id)?.dispose();
                this._kernelSourceActionsUpdates.delete(id);
            }));
            // restore from storage
            try {
                const data = JSON.parse(this._storageService.get(NotebookKernelService_1._storageNotebookBinding, 1 /* StorageScope.WORKSPACE */, '[]'));
                this._notebookBindings.fromJSON(data);
            }
            catch {
                // ignore
            }
        }
        dispose() {
            this._kernels.clear();
            this._kernelSources.forEach(v => {
                v.menu.dispose();
                v.actions.forEach(a => a[1].dispose());
            });
            this._kernelSourceActionsUpdates.forEach(v => {
                v.dispose();
            });
            this._kernelSourceActionsUpdates.clear();
            super.dispose();
        }
        _persistMementos() {
            this._persistSoonHandle?.dispose();
            this._persistSoonHandle = (0, dom_1.runWhenWindowIdle)(window_1.$window, () => {
                this._storageService.store(NotebookKernelService_1._storageNotebookBinding, JSON.stringify(this._notebookBindings), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }, 100);
        }
        static _score(kernel, notebook) {
            if (kernel.viewType === '*') {
                return 5;
            }
            else if (kernel.viewType === notebook.viewType) {
                return 10;
            }
            else {
                return 0;
            }
        }
        _tryAutoBindNotebook(notebook, onlyThisKernel) {
            const id = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
            if (!id) {
                // no kernel associated
                return;
            }
            const existingKernel = this._kernels.get(id);
            if (!existingKernel || !NotebookKernelService_1._score(existingKernel.kernel, notebook)) {
                // associated kernel not known, not matching
                return;
            }
            if (!onlyThisKernel || existingKernel.kernel === onlyThisKernel) {
                this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel: undefined, newKernel: existingKernel.kernel.id });
            }
        }
        notifyVariablesChange(notebookUri) {
            this._onDidNotebookVariablesChange.fire(notebookUri);
        }
        registerKernel(kernel) {
            if (this._kernels.has(kernel.id)) {
                throw new Error(`NOTEBOOK CONTROLLER with id '${kernel.id}' already exists`);
            }
            this._kernels.set(kernel.id, new KernelInfo(kernel));
            this._onDidAddKernel.fire(kernel);
            // auto associate the new kernel to existing notebooks it was
            // associated to in the past.
            for (const notebook of this._notebookService.getNotebookTextModels()) {
                this._tryAutoBindNotebook(notebook, kernel);
            }
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._kernels.delete(kernel.id)) {
                    this._onDidRemoveKernel.fire(kernel);
                }
                for (const [key, candidate] of Array.from(this._notebookBindings)) {
                    if (candidate === kernel.id) {
                        this._onDidChangeNotebookKernelBinding.fire({ notebook: NotebookTextModelLikeId.obj(key).uri, oldKernel: kernel.id, newKernel: undefined });
                    }
                }
            });
        }
        getMatchingKernel(notebook) {
            // all applicable kernels
            const kernels = [];
            for (const info of this._kernels.values()) {
                const score = NotebookKernelService_1._score(info.kernel, notebook);
                if (score) {
                    kernels.push({
                        score,
                        kernel: info.kernel,
                        instanceAffinity: info.notebookPriorities.get(notebook.uri) ?? 1 /* vscode.NotebookControllerPriority.Default */,
                    });
                }
            }
            kernels
                .sort((a, b) => b.instanceAffinity - a.instanceAffinity || a.score - b.score || a.kernel.label.localeCompare(b.kernel.label));
            const all = kernels.map(obj => obj.kernel);
            // bound kernel
            const selectedId = this._notebookBindings.get(NotebookTextModelLikeId.str(notebook));
            const selected = selectedId ? this._kernels.get(selectedId)?.kernel : undefined;
            const suggestions = kernels.filter(item => item.instanceAffinity > 1).map(item => item.kernel);
            const hidden = kernels.filter(item => item.instanceAffinity < 0).map(item => item.kernel);
            return { all, selected, suggestions, hidden };
        }
        getSelectedOrSuggestedKernel(notebook) {
            const info = this.getMatchingKernel(notebook);
            if (info.selected) {
                return info.selected;
            }
            const preferred = info.all.filter(kernel => this._kernels.get(kernel.id)?.notebookPriorities.get(notebook.uri) === 2 /* vscode.NotebookControllerPriority.Preferred */);
            if (preferred.length === 1) {
                return preferred[0];
            }
            return info.all.length === 1 ? info.all[0] : undefined;
        }
        // a notebook has one kernel, a kernel has N notebooks
        // notebook <-1----N-> kernel
        selectKernelForNotebook(kernel, notebook) {
            const key = NotebookTextModelLikeId.str(notebook);
            const oldKernel = this._notebookBindings.get(key);
            if (oldKernel !== kernel?.id) {
                if (kernel) {
                    this._notebookBindings.set(key, kernel.id);
                }
                else {
                    this._notebookBindings.delete(key);
                }
                this._onDidChangeNotebookKernelBinding.fire({ notebook: notebook.uri, oldKernel, newKernel: kernel?.id });
                this._persistMementos();
            }
        }
        preselectKernelForNotebook(kernel, notebook) {
            const key = NotebookTextModelLikeId.str(notebook);
            const oldKernel = this._notebookBindings.get(key);
            if (oldKernel !== kernel?.id) {
                this._notebookBindings.set(key, kernel.id);
                this._persistMementos();
            }
        }
        updateKernelNotebookAffinity(kernel, notebook, preference) {
            const info = this._kernels.get(kernel.id);
            if (!info) {
                throw new Error(`UNKNOWN kernel '${kernel.id}'`);
            }
            if (preference === undefined) {
                info.notebookPriorities.delete(notebook);
            }
            else {
                info.notebookPriorities.set(notebook, preference);
            }
            this._onDidChangeNotebookAffinity.fire();
        }
        getRunningSourceActions(notebook) {
            const id = NotebookTextModelLikeId.str(notebook);
            const existingInfo = this._kernelSources.get(id);
            if (existingInfo) {
                return existingInfo.actions.filter(action => action[0].execution).map(action => action[0]);
            }
            return [];
        }
        getSourceActions(notebook, contextKeyService) {
            contextKeyService = contextKeyService ?? this._contextKeyService;
            const id = NotebookTextModelLikeId.str(notebook);
            const existingInfo = this._kernelSources.get(id);
            if (existingInfo) {
                return existingInfo.actions.map(a => a[0]);
            }
            const sourceMenu = this._register(this._menuService.createMenu(actions_1.MenuId.NotebookKernelSource, contextKeyService));
            const info = { menu: sourceMenu, actions: [] };
            const loadActionsFromMenu = (menu, document) => {
                const groups = menu.getActions({ shouldForwardArgs: true });
                const sourceActions = [];
                groups.forEach(group => {
                    const isPrimary = /^primary/.test(group[0]);
                    group[1].forEach(action => {
                        const sourceAction = new SourceAction(action, document, isPrimary);
                        const stateChangeListener = sourceAction.onDidChangeState(() => {
                            this._onDidChangeSourceActions.fire({
                                notebook: document.uri,
                                viewType: document.viewType,
                            });
                        });
                        sourceActions.push([sourceAction, stateChangeListener]);
                    });
                });
                info.actions = sourceActions;
                this._kernelSources.set(id, info);
                this._onDidChangeSourceActions.fire({ notebook: document.uri, viewType: document.viewType });
            };
            this._kernelSourceActionsUpdates.get(id)?.dispose();
            this._kernelSourceActionsUpdates.set(id, sourceMenu.onDidChange(() => {
                loadActionsFromMenu(sourceMenu, notebook);
            }));
            loadActionsFromMenu(sourceMenu, notebook);
            return info.actions.map(a => a[0]);
        }
        registerNotebookKernelDetectionTask(task) {
            const notebookType = task.notebookType;
            const all = this._kernelDetectionTasks.get(notebookType) ?? [];
            all.push(task);
            this._kernelDetectionTasks.set(notebookType, all);
            this._onDidChangeKernelDetectionTasks.fire(notebookType);
            return (0, lifecycle_1.toDisposable)(() => {
                const all = this._kernelDetectionTasks.get(notebookType) ?? [];
                const idx = all.indexOf(task);
                if (idx >= 0) {
                    all.splice(idx, 1);
                    this._kernelDetectionTasks.set(notebookType, all);
                    this._onDidChangeKernelDetectionTasks.fire(notebookType);
                }
            });
        }
        getKernelDetectionTasks(notebook) {
            return this._kernelDetectionTasks.get(notebook.viewType) ?? [];
        }
        registerKernelSourceActionProvider(viewType, provider) {
            const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
            providers.push(provider);
            this._kernelSourceActionProviders.set(viewType, providers);
            this._onDidChangeSourceActions.fire({ viewType: viewType });
            const eventEmitterDisposable = provider.onDidChangeSourceActions?.(() => {
                this._onDidChangeSourceActions.fire({ viewType: viewType });
            });
            return (0, lifecycle_1.toDisposable)(() => {
                const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
                const idx = providers.indexOf(provider);
                if (idx >= 0) {
                    providers.splice(idx, 1);
                    this._kernelSourceActionProviders.set(viewType, providers);
                }
                eventEmitterDisposable?.dispose();
            });
        }
        /**
         * Get kernel source actions from providers
         */
        getKernelSourceActions2(notebook) {
            const viewType = notebook.viewType;
            const providers = this._kernelSourceActionProviders.get(viewType) ?? [];
            const promises = providers.map(provider => provider.provideKernelSourceActions());
            return Promise.all(promises).then(actions => {
                return actions.reduce((a, b) => a.concat(b), []);
            });
        }
    };
    exports.NotebookKernelService = NotebookKernelService;
    exports.NotebookKernelService = NotebookKernelService = NotebookKernelService_1 = __decorate([
        __param(0, notebookService_1.INotebookService),
        __param(1, storage_1.IStorageService),
        __param(2, actions_1.IMenuService),
        __param(3, contextkey_1.IContextKeyService)
    ], NotebookKernelService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tLZXJuZWxTZXJ2aWNlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9zZXJ2aWNlcy9ub3RlYm9va0tlcm5lbFNlcnZpY2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLE1BQU0sVUFBVTtpQkFFQSxnQkFBVyxHQUFHLENBQUMsQUFBSixDQUFLO1FBUS9CLFlBQVksTUFBdUI7WUFGMUIsdUJBQWtCLEdBQUcsSUFBSSxpQkFBVyxFQUFVLENBQUM7WUFHdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0QyxDQUFDOztJQUdGLE1BQU0sdUJBQXVCO1FBQzVCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBeUI7WUFDbkMsT0FBTyxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO1FBQzVDLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQVM7WUFDbkIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQixPQUFPO2dCQUNOLFFBQVEsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7Z0JBQzdCLEdBQUcsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3BDLENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFFRCxNQUFN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
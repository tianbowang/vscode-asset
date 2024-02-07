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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/platform/markers/common/markers", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineEntryFactory"], function (require, exports, event_1, lifecycle_1, resources_1, configuration_1, markers_1, themeService_1, notebookCommon_1, notebookExecutionStateService_1, outlineModel_1, notebookOutlineEntryFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellOutlineProvider = void 0;
    let NotebookCellOutlineProvider = class NotebookCellOutlineProvider {
        get entries() {
            return this._entries;
        }
        get activeElement() {
            return this._activeEntry;
        }
        constructor(_editor, _target, themeService, notebookExecutionStateService, _outlineModelService, _markerService, _configurationService) {
            this._editor = _editor;
            this._target = _target;
            this._outlineModelService = _outlineModelService;
            this._markerService = _markerService;
            this._configurationService = _configurationService;
            this._dispoables = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._entries = [];
            this._entriesDisposables = new lifecycle_1.DisposableStore();
            this.outlineKind = 'notebookCells';
            this._outlineEntryFactory = new notebookOutlineEntryFactory_1.NotebookOutlineEntryFactory(notebookExecutionStateService);
            const selectionListener = new lifecycle_1.MutableDisposable();
            this._dispoables.add(selectionListener);
            selectionListener.value = (0, lifecycle_1.combinedDisposable)(event_1.Event.debounce(_editor.onDidChangeSelection, (last, _current) => last, 200)(this._recomputeActive, this), event_1.Event.debounce(_editor.onDidChangeViewCells, (last, _current) => last ?? _current, 200)(this._recomputeState, this));
            this._dispoables.add(_configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('notebook.outline.showCodeCells')) {
                    this._recomputeState();
                }
            }));
            this._dispoables.add(themeService.onDidFileIconThemeChange(() => {
                this._onDidChange.fire({});
            }));
            this._dispoables.add(notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && !!this._editor.textModel && e.affectsNotebook(this._editor.textModel?.uri)) {
                    this._recomputeState();
                }
            }));
            this._recomputeState();
        }
        dispose() {
            this._entries.length = 0;
            this._activeEntry = undefined;
            this._entriesDisposables.dispose();
            this._dispoables.dispose();
        }
        init() {
            this._recomputeState();
        }
        async setFullSymbols(cancelToken) {
            const notebookEditorWidget = this._editor;
            const notebookCells = notebookEditorWidget?.getViewModel()?.viewCells.filter((cell) => cell.cellKind === notebookCommon_1.CellKind.Code);
            this._entries.length = 0;
            if (notebookCells) {
                const promises = [];
                // limit the number of cells so that we don't resolve an excessive amount of text models
                for (const cell of notebookCells.slice(0, 100)) {
                    // gather all symbols asynchronously
                    promises.push(this._outlineEntryFactory.cacheSymbols(cell, this._outlineModelService, cancelToken));
                }
                await Promise.allSettled(promises);
            }
            this._recomputeState();
        }
        _recomputeState() {
            this._entriesDisposables.clear();
            this._activeEntry = undefined;
            this._uri = undefined;
            if (!this._editor.hasModel()) {
                return;
            }
            this._uri = this._editor.textModel.uri;
            const notebookEditorWidget = this._editor;
            if (notebookEditorWidget.getLength() === 0) {
                return;
            }
            let includeCodeCells = true;
            if (this._target === 1 /* OutlineTarget.OutlinePane */) {
                includeCodeCells = this._configurationService.getValue('notebook.outline.showCodeCells');
            }
            else if (this._target === 2 /* OutlineTarget.Breadcrumbs */) {
                includeCodeCells = this._configurationService.getValue('notebook.breadcrumbs.showCodeCells');
            }
            const notebookCells = notebookEditorWidget.getViewModel().viewCells.filter((cell) => cell.cellKind === notebookCommon_1.CellKind.Markup || includeCodeCells);
            const entries = [];
            for (const cell of notebookCells) {
                entries.push(...this._outlineEntryFactory.getOutlineEntries(cell, entries.length));
                // send an event whenever any of the cells change
                this._entriesDisposables.add(cell.model.onDidChangeContent(() => {
                    this._recomputeState();
                    this._onDidChange.fire({});
                }));
            }
            // build a tree from the list of entries
            if (entries.length > 0) {
                const result = [entries[0]];
                const parentStack = [entries[0]];
                for (let i = 1; i < entries.length; i++) {
                    const entry = entries[i];
                    while (true) {
                        const len = parentStack.length;
                        if (len === 0) {
                            // root node
                            result.push(entry);
                            parentStack.push(entry);
                            break;
                        }
                        else {
                            const parentCandidate = parentStack[len - 1];
                            if (parentCandidate.level < entry.level) {
                                parentCandidate.addChild(entry);
                                parentStack.push(entry);
                                break;
                            }
                            else {
                                parentStack.pop();
                            }
                        }
                    }
                }
                this._entries = result;
            }
            // feature: show markers with each cell
            const markerServiceListener = new lifecycle_1.MutableDisposable();
            this._entriesDisposables.add(markerServiceListener);
            const updateMarkerUpdater = () => {
                if (notebookEditorWidget.isDisposed) {
                    return;
                }
                const doUpdateMarker = (clear) => {
                    for (const entry of this._entries) {
                        if (clear) {
                            entry.clearMarkers();
                        }
                        else {
                            entry.updateMarkers(this._markerService);
                        }
                    }
                };
                const problem = this._configurationService.getValue('problems.visibility');
                if (problem === undefined) {
                    return;
                }
                const config = this._configurationService.getValue("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */);
                if (problem && config) {
                    markerServiceListener.value = this._markerService.onMarkerChanged(e => {
                        if (notebookEditorWidget.isDisposed) {
                            console.error('notebook editor is disposed');
                            return;
                        }
                        if (e.some(uri => notebookEditorWidget.getCellsInRange().some(cell => (0, resources_1.isEqual)(cell.uri, uri)))) {
                            doUpdateMarker(false);
                            this._onDidChange.fire({});
                        }
                    });
                    doUpdateMarker(false);
                }
                else {
                    markerServiceListener.clear();
                    doUpdateMarker(true);
                }
            };
            updateMarkerUpdater();
            this._entriesDisposables.add(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('problems.visibility') || e.affectsConfiguration("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                    updateMarkerUpdater();
                    this._onDidChange.fire({});
                }
            }));
            this._recomputeActive();
            this._onDidChange.fire({});
        }
        _recomputeActive() {
            let newActive;
            const notebookEditorWidget = this._editor;
            if (notebookEditorWidget) { //TODO don't check for widget, only here if we do have
                if (notebookEditorWidget.hasModel() && notebookEditorWidget.getLength() > 0) {
                    const cell = notebookEditorWidget.cellAt(notebookEditorWidget.getFocus().start);
                    if (cell) {
                        for (const entry of this._entries) {
                            newActive = entry.find(cell, []);
                            if (newActive) {
                                break;
                            }
                        }
                    }
                }
            }
            if (newActive !== this._activeEntry) {
                this._activeEntry = newActive;
                this._onDidChange.fire({ affectOnlyActiveElement: true });
            }
        }
        get isEmpty() {
            return this._entries.length === 0;
        }
        get uri() {
            return this._uri;
        }
    };
    exports.NotebookCellOutlineProvider = NotebookCellOutlineProvider;
    exports.NotebookCellOutlineProvider = NotebookCellOutlineProvider = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(4, outlineModel_1.IOutlineModelService),
        __param(5, markers_1.IMarkerService),
        __param(6, configuration_1.IConfigurationService)
    ], NotebookCellOutlineProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdXRsaW5lUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlld01vZGVsL25vdGVib29rT3V0bGluZVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBMkI7UUFRdkMsSUFBSSxPQUFPO1lBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFPRCxJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzFCLENBQUM7UUFJRCxZQUNrQixPQUF3QixFQUN4QixPQUFzQixFQUN4QixZQUEyQixFQUNWLDZCQUE2RCxFQUN2RSxvQkFBMkQsRUFDakUsY0FBK0MsRUFDeEMscUJBQTZEO1lBTm5FLFlBQU8sR0FBUCxPQUFPLENBQWlCO1lBQ3hCLFlBQU8sR0FBUCxPQUFPLENBQWU7WUFHQSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2hELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUN2QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBN0JwRSxnQkFBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3BDLGlCQUFZLEdBQUcsSUFBSSxlQUFPLEVBQXNCLENBQUM7WUFFekQsZ0JBQVcsR0FBOEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFHbEUsYUFBUSxHQUFtQixFQUFFLENBQUM7WUFNckIsd0JBQW1CLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFcEQsZ0JBQVcsR0FBRyxlQUFlLENBQUM7WUFpQnRDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLHlEQUEyQixDQUFDLDZCQUE2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
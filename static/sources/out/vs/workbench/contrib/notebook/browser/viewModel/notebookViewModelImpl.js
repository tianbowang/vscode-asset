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
define(["require", "exports", "vs/base/common/collections", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/strings", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/model/editStack", "vs/editor/common/model/intervalTree", "vs/editor/common/model/textModel", "vs/editor/common/services/resolverService", "vs/platform/instantiation/common/instantiation", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/cellSelectionCollection", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/browser/notebookViewEvents", "vs/workbench/contrib/notebook/browser/contrib/find/findModel", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, collections_1, errors_1, event_1, lifecycle_1, numbers_1, strings, bulkEditService_1, range_1, editStack_1, intervalTree_1, textModel_1, resolverService_1, instantiation_1, undoRedo_1, notebookBrowser_1, cellSelectionCollection_1, codeCellViewModel_1, markupCellViewModel_1, notebookCommon_1, notebookRange_1, notebookViewEvents_1, findModel_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createCellViewModel = exports.NotebookViewModel = void 0;
    const invalidFunc = () => { throw new Error(`Invalid change accessor`); };
    class DecorationsTree {
        constructor() {
            this._decorationsTree = new intervalTree_1.IntervalTree();
        }
        intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations = false) {
            const r1 = this._decorationsTree.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
            return r1;
        }
        search(filterOwnerId, filterOutValidation, overviewRulerOnly, cachedVersionId, onlyMarginDecorations) {
            return this._decorationsTree.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
        }
        collectNodesFromOwner(ownerId) {
            const r1 = this._decorationsTree.collectNodesFromOwner(ownerId);
            return r1;
        }
        collectNodesPostOrder() {
            const r1 = this._decorationsTree.collectNodesPostOrder();
            return r1;
        }
        insert(node) {
            this._decorationsTree.insert(node);
        }
        delete(node) {
            this._decorationsTree.delete(node);
        }
        resolveNode(node, cachedVersionId) {
            this._decorationsTree.resolveNode(node, cachedVersionId);
        }
        acceptReplace(offset, length, textLength, forceMoveMarkers) {
            this._decorationsTree.acceptReplace(offset, length, textLength, forceMoveMarkers);
        }
    }
    const TRACKED_RANGE_OPTIONS = [
        textModel_1.ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-always-grows-when-typing-at-edges', stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */ }),
        textModel_1.ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-never-grows-when-typing-at-edges', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */ }),
        textModel_1.ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-grows-only-when-typing-before', stickiness: 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */ }),
        textModel_1.ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-grows-only-when-typing-after', stickiness: 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */ }),
    ];
    function _normalizeOptions(options) {
        if (options instanceof textModel_1.ModelDecorationOptions) {
            return options;
        }
        return textModel_1.ModelDecorationOptions.createDynamic(options);
    }
    let MODEL_ID = 0;
    let NotebookViewModel = class NotebookViewModel extends lifecycle_1.Disposable {
        get options() { return this._options; }
        get onDidChangeOptions() { return this._onDidChangeOptions.event; }
        get viewCells() {
            return this._viewCells;
        }
        set viewCells(_) {
            throw new Error('NotebookViewModel.viewCells is readonly');
        }
        get length() {
            return this._viewCells.length;
        }
        get notebookDocument() {
            return this._notebook;
        }
        get uri() {
            return this._notebook.uri;
        }
        get metadata() {
            return this._notebook.metadata;
        }
        get onDidChangeViewCells() { return this._onDidChangeViewCells.event; }
        get lastNotebookEditResource() {
            if (this._lastNotebookEditResource.length) {
                return this._lastNotebookEditResource[this._lastNotebookEditResource.length - 1];
            }
            return null;
        }
        get layoutInfo() {
            return this._layoutInfo;
        }
        get onDidChangeSelection() { return this._onDidChangeSelection.event; }
        get selectionHandles() {
            const handlesSet = new Set();
            const handles = [];
            (0, notebookRange_1.cellRangesToIndexes)(this._selectionCollection.selections).map(index => index < this.length ? this.cellAt(index) : undefined).forEach(cell => {
                if (cell && !handlesSet.has(cell.handle)) {
                    handles.push(cell.handle);
                }
            });
            return handles;
        }
        set selectionHandles(selectionHandles) {
            const indexes = selectionHandles.map(handle => this._viewCells.findIndex(cell => cell.handle === handle));
            this._selectionCollection.setSelections((0, notebookRange_1.cellIndexesToRanges)(indexes), true, 'model');
        }
        get focused() {
            return this._focused;
        }
        constructor(viewType, _notebook, _viewContext, _layoutInfo, _options, _instantiationService, _bulkEditService, _undoService, _textModelService, notebookExecutionStateService) {
            super();
            this.viewType = viewType;
            this._notebook = _notebook;
            this._viewContext = _viewContext;
            this._layoutInfo = _layoutInfo;
            this._options = _options;
            this._instantiationService = _instantiationService;
            this._bulkEditService = _bulkEditService;
            this._undoService = _undoService;
            this._textModelService = _textModelService;
            this._localStore = this._register(new lifecycle_1.DisposableStore());
            this._handleToViewCellMapping = new Map();
            this._onDidChangeOptions = this._register(new event_1.Emitter());
            this._viewCells = [];
            this._onDidChangeViewCells = this._register(new event_1.Emitter());
            this._lastNotebookEditResource = [];
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this._selectionCollection = this._register(new cellSelectionCollection_1.NotebookCellSelectionCollection());
            this._decorationsTree = new DecorationsTree();
            this._decorations = Object.create(null);
            this._lastDecorationId = 0;
            this._foldingRanges = null;
            this._hiddenRanges = [];
            this._focused = true;
            this._decorationIdToCellMap = new Map();
            this._statusBarItemIdToCellMap = new Map();
            MODEL_ID++;
            this.id = '$notebookViewModel' + MODEL_ID;
            this._instanceId = strings.singleLetterHash(MODEL_ID);
            const compute = (changes, synchronous) => {
                const diffs = changes.map(splice => {
                    return [splice[0], splice[1], splice[2].map(cell => {
                            return createCellViewModel(this._instantiationService, this, cell, this._viewContext);
                        })];
                });
                diffs.reverse().forEach(diff => {
                    const deletedCells = this._viewCells.splice(diff[0], diff[1], ...diff[2]);
                    this._decorationsTree.acceptReplace(diff[0], diff[1], diff[2].length, true);
                    deletedCells.forEach(cell => {
                        this._handleToViewCellMapping.delete(cell.handle);
                        // dispose the cell to release ref to the cell text document
                        cell.dispose();
                    });
                    diff[2].forEach(cell => {
                        this._handleToViewCellMapping.set(cell.handle, cell);
                        this._localStore.add(cell);
                    });
                });
                const selectionHandles = this.selectionHandles;
                this._onDidChangeViewCells.fire({
                    synchronous: synchronous,
                    splices: diffs
                });
                let endSelectionHandles = [];
                if (selectionHandles.length) {
                    const primaryHandle = selectionHandles[0];
                    const primarySelectionIndex = this._viewCells.indexOf(this.getCellByHandle(primaryHandle));
                    endSelectionHandles = [primaryHandle];
                    let delta = 0;
                    for (let i = 0; i < diffs.length; i++) {
                        const diff = diffs[0];
                        if (diff[0] + diff[1] <= primarySelectionIndex) {
                            delta += diff[2].length - diff[1];
                            continue;
                        }
                        if (diff[0] > primarySelectionIndex) {
                            endSelectionHandles = [primaryHandle];
                            break;
                        }
                        if (diff[0] + diff[1] > primarySelectionIndex) {
                            endSelectionHandles = [this._viewCells[diff[0] + delta].handle];
                            break;
                        }
                    }
                }
                // TODO@rebornix
                const selectionIndexes = endSelectionHandles.map(handle => this._viewCells.findIndex(cell => cell.handle === handle));
                this._selectionCollection.setState((0, notebookRange_1.cellIndexesToRanges)([selectionIndexes[0]])[0], (0, notebookRange_1.cellIndexesToRanges)(selectionIndexes), true, 'model');
            };
            this._register(this._notebook.onDidChangeContent(e => {
                for (let i = 0; i < e.rawEvents.length; i++) {
                    const change = e.rawEvents[i];
                    let changes = [];
                    const synchronous = e.synchronous ?? true;
                    if (change.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange || change.kind === notebookCommon_1.NotebookCellsChangeType.Initialize) {
                        changes = change.changes;
                        compute(changes, synchronous);
                        continue;
                    }
                    else if (change.kind === notebookCommon_1.NotebookCellsChangeType.Move) {
                        compute([[change.index, change.length, []]], synchronous);
                        compute([[change.newIdx, 0, change.cells]], synchronous);
                    }
                    else {
                        continue;
                    }
                }
            }));
            this._register(this._notebook.onDidChangeContent(contentChanges => {
                contentChanges.rawEvents.forEach(e => {
                    if (e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata) {
                        this._viewContext.eventDispatcher.emit([new notebookViewEvents_1.NotebookMetadataChangedEvent(this._notebook.metadata)]);
                    }
                });
                if (contentChanges.endSelectionState) {
                    this.updateSelectionsState(contentChanges.endSelectionState);
                }
            }));
            this._register(this._viewContext.eventDispatcher.onDidChangeLayout((e) => {
                this._layoutInfo = e.value;
                this._viewCells.forEach(cell => {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        if (e.source.width || e.source.fontInfo) {
                            cell.layoutChange({ outerWidth: e.value.width, font: e.value.fontInfo });
                        }
                    }
                    else {
                        if (e.source.width !== undefined) {
                            cell.layoutChange({ outerWidth: e.value.width, font: e.value.fontInfo });
                        }
                    }
                });
            }));
            this._register(this._viewContext.notebookOptions.onDidChangeOptions(e => {
                for (let i = 0; i < this.length; i++) {
                    const cell = this._viewCells[i];
                    cell.updateOptions(e);
                }
            }));
            this._register(notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type !== notebookExecutionStateService_1.NotebookExecutionType.cell) {
                    return;
                }
                const cell = this.getCellByHandle(e.cellHandle);
                if (cell instanceof codeCellViewModel_1.CodeCellViewModel) {
                    cell.updateExecutionState(e);
                }
            }));
            this._register(this._selectionCollection.onDidChangeSelection(e => {
                this._onDidChangeSelection.fire(e);
            }));
            this._viewCells = this._notebook.cells.map(cell => {
                return createCellViewModel(this._instantiationService, this, cell, this._viewContext);
            });
            this._viewCells.forEach(cell => {
                this._handleToViewCellMapping.set(cell.handle, cell);
            });
        }
        updateOptions(newOptions) {
            this._options = { ...this._options, ...newOptions };
            this._onDidChangeOptions.fire();
        }
        getFocus() {
            return this._selectionCollection.focus;
        }
        getSelections() {
            return this._selectionCollection.selections;
        }
        setEditorFocus(focused) {
            this._focused = focused;
        }
        /**
         * Empty selection will be turned to `null`
         */
        validateRange(cellRange) {
            if (!cellRange) {
                return null;
            }
            const start = (0, numbers_1.clamp)(cellRange.start, 0, this.length);
            const end = (0, numbers_1.clamp)(cellRange.end, 0, this.length);
            if (start === end) {
                return null;
            }
            if (start < end) {
                return { start, end };
            }
            else {
                return { start: end, end: start };
            }
        }
        // selection change from list view's `setFocus` and `setSelection` should always use `source: view` to prevent events breaking the list view focus/selection change transaction
        updateSelectionsState(state, source = 'model') {
            if (this._focused || source === 'model') {
                if (state.kind === notebookCommon_1.SelectionStateType.Handle) {
                    const primaryIndex = state.primary !== null ? this.getCellIndexByHandle(state.primary) : null;
                    const primarySelection = primaryIndex !== null ? this.validateRange({ start: primaryIndex, end: primaryIndex + 1 }) : null;
                    const selections = (0, notebookRange_1.cellIndexesToRanges)(state.selections.map(sel => this.getCellIndexByHandle(sel)))
                        .map(range => this.validateRange(range))
                        .filter(range => range !== null);
                    this._selectionCollection.setState(primarySelection, (0, notebookRange_1.reduceCellRanges)(selections), true, source);
                }
                else {
                    const primarySelection = this.validateRange(state.focus);
                    const selections = state.selections
                        .map(range => this.validateRange(range))
                        .filter(range => range !== null);
                    this._selectionCollection.setState(primarySelection, (0, notebookRange_1.reduceCellRanges)(selections), true, source);
                }
            }
        }
        getFoldingStartIndex(index) {
            if (!this._foldingRanges) {
                return -1;
            }
            const range = this._foldingRanges.findRange(index + 1);
            const startIndex = this._foldingRanges.getStartLineNumber(range) - 1;
            return startIndex;
        }
        getFoldingState(index) {
            if (!this._foldingRanges) {
                return 0 /* CellFoldingState.None */;
            }
            const range = this._foldingRanges.findRange(index + 1);
            const startIndex = this._foldingRanges.getStartLineNumber(range) - 1;
            if (startIndex !== index) {
                return 0 /* CellFoldingState.None */;
            }
            return this._foldingRanges.isCollapsed(range) ? 2 /* CellFoldingState.Collapsed */ : 1 /* CellFoldingState.Expanded */;
        }
        getFoldedLength(index) {
            if (!this._foldingRanges) {
                return 0;
            }
            const range = this._foldingRanges.findRange(index + 1);
            const startIndex = this._foldingRanges.getStartLineNumber(range) - 1;
            const endIndex = this._foldingRanges.getEndLineNumber(range) - 1;
            return endIndex - startIndex;
        }
        updateFoldingRanges(ranges) {
            this._foldingRanges = ranges;
            let updateHiddenAreas = false;
            const newHiddenAreas = [];
            let i = 0; // index into hidden
            let k = 0;
            let lastCollapsedStart = Number.MAX_VALUE;
            let lastCollapsedEnd = -1;
            for (; i < ranges.length; i++) {
                if (!ranges.isCollapsed(i)) {
                    continue;
                }
                const startLineNumber = ranges.getStartLineNumber(i) + 1; // the first line is not hidden
                const endLineNumber = ranges.getEndLineNumber(i);
                if (lastCollapsedStart <= startLineNumber && endLineNumber <= lastCollapsedEnd) {
                    // ignore ranges contained in collapsed regions
                    continue;
                }
                if (!updateHiddenAreas && k < this._hiddenRanges.length && this._hiddenRanges[k].start + 1 === startLineNumber && (this._hiddenRanges[k].end + 1) === endLineNumber) {
                    // reuse the old ranges
                    newHiddenAreas.push(this._hiddenRanges[k]);
                    k++;
                }
                else {
                    updateHiddenAreas = true;
                    newHiddenAreas.push({ start: startLineNumber - 1, end: endLineNumber - 1 });
                }
                lastCollapsedStart = startLineNumber;
                lastCollapsedEnd = endLineNumber;
            }
            if (updateHiddenAreas || k < this._hiddenRanges.length) {
                this._hiddenRanges = newHiddenAreas;
            }
            this._viewCells.forEach(cell => {
                if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                    cell.triggerFoldingStateChange();
                }
            });
        }
        getHiddenRanges() {
            return this._hiddenRanges;
        }
        getCellByHandle(handle) {
            return this._handleToViewCellMapping.get(handle);
        }
        getCellIndexByHandle(handle) {
            return this._viewCells.findIndex(cell => cell.handle === handle);
        }
        getCellIndex(cell) {
            return this._viewCells.indexOf(cell);
        }
        cellAt(index) {
            // if (index < 0 || index >= this.length) {
            // 	throw new Error(`Invalid index ${index}`);
            // }
            return this._viewCells[index];
        }
        getCellsInRange(range) {
            if (!range) {
                return this._viewCells.slice(0);
            }
            const validatedRange = this.validateRange(range);
            if (validatedRange) {
                const result = [];
                for (let i = validatedRange.start; i < validatedRange.end; i++) {
                    result.push(this._viewCells[i]);
                }
                return result;
            }
            return [];
        }
        /**
         * If this._viewCells[index] is visible then return index
         */
        getNearestVisibleCellIndexUpwards(index) {
            for (let i = this._hiddenRanges.length - 1; i >= 0; i--) {
                const cellRange = this._hiddenRanges[i];
                const foldStart = cellRange.start - 1;
                const foldEnd = cellRange.end;
                if (foldStart > index) {
                    continue;
                }
                if (foldStart <= index && foldEnd >= index) {
                    return index;
                }
                // foldStart <= index, foldEnd < index
                break;
            }
            return index;
        }
        getNextVisibleCellIndex(index) {
            for (let i = 0; i < this._hiddenRanges.length; i++) {
                const cellRange = this._hiddenRanges[i];
                const foldStart = cellRange.start - 1;
                const foldEnd = cellRange.end;
                if (foldEnd < index) {
                    continue;
                }
                // foldEnd >= index
                if (foldStart <= index) {
                    return foldEnd + 1;
                }
                break;
            }
            return index + 1;
        }
        getPreviousVisibleCellIndex(index) {
            for (let i = this._hiddenRanges.length - 1; i >= 0; i--) {
                const cellRange = this._hiddenRanges[i];
                const foldStart = cellRange.start - 1;
                const foldEnd = cellRange.end;
                if (foldEnd < index) {
                    return index;
                }
                if (foldStart <= index) {
                    return foldStart;
                }
            }
            return index;
        }
        hasCell(cell) {
            return this._handleToViewCellMapping.has(cell.handle);
        }
        getVersionId() {
            return this._notebook.versionId;
        }
        getAlternativeId() {
            return this._notebook.alternativeVersionId;
        }
        getTrackedRange(id) {
            return this._getDecorationRange(id);
        }
        _getDecorationRange(decorationId) {
            const node = this._decorations[decorationId];
            if (!node) {
                return null;
            }
            const versionId = this.getVersionId();
            if (node.cachedVersionId !== versionId) {
                this._decorationsTree.resolveNode(node, versionId);
            }
            if (node.range === null) {
                return { start: node.cachedAbsoluteStart - 1, end: node.cachedAbsoluteEnd - 1 };
            }
            return { start: node.range.startLineNumber - 1, end: node.range.endLineNumber - 1 };
        }
        setTrackedRange(id, newRange, newStickiness) {
            const node = (id ? this._decorations[id] : null);
            if (!node) {
                if (!newRange) {
                    return null;
                }
                return this._deltaCellDecorationsImpl(0, [], [{ range: new range_1.Range(newRange.start + 1, 1, newRange.end + 1, 1), options: TRACKED_RANGE_OPTIONS[newStickiness] }])[0];
            }
            if (!newRange) {
                // node exists, the request is to delete => delete node
                this._decorationsTree.delete(node);
                delete this._decorations[node.id];
                return null;
            }
            this._decorationsTree.delete(node);
            node.reset(this.getVersionId(), newRange.start, newRange.end + 1, new range_1.Range(newRange.start + 1, 1, newRange.end + 1, 1));
            node.setOptions(TRACKED_RANGE_OPTIONS[newStickiness]);
            this._decorationsTree.insert(node);
            return node.id;
        }
        _deltaCellDecorationsImpl(ownerId, oldDecorationsIds, newDecorations) {
            const versionId = this.getVersionId();
            const oldDecorationsLen = oldDecorationsIds.length;
            let oldDecorationIndex = 0;
            const newDecorationsLen = newDecorations.length;
            let newDecorationIndex = 0;
            const result = new Array(newDecorationsLen);
            while (oldDecorationIndex < oldDecorationsLen || newDecorationIndex < newDecorationsLen) {
                let node = null;
                if (oldDecorationIndex < oldDecorationsLen) {
                    // (1) get ourselves an old node
                    do {
                        node = this._decorations[oldDecorationsIds[oldDecorationIndex++]];
                    } while (!node && oldDecorationIndex < oldDecorationsLen);
                    // (2) remove the node from the tree (if it exists)
                    if (node) {
                        this._decorationsTree.delete(node);
                    }
                }
                if (newDecorationIndex < newDecorationsLen) {
                    // (3) create a new node if necessary
                    if (!node) {
                        const internalDecorationId = (++this._lastDecorationId);
                        const decorationId = `${this._instanceId};${internalDecorationId}`;
                        node = new intervalTree_1.IntervalNode(decorationId, 0, 0);
                        this._decorations[decorationId] = node;
                    }
                    // (4) initialize node
                    const newDecoration = newDecorations[newDecorationIndex];
                    const range = newDecoration.range;
                    const options = _normalizeOptions(newDecoration.options);
                    node.ownerId = ownerId;
                    node.reset(versionId, range.startLineNumber, range.endLineNumber, range_1.Range.lift(range));
                    node.setOptions(options);
                    this._decorationsTree.insert(node);
                    result[newDecorationIndex] = node.id;
                    newDecorationIndex++;
                }
                else {
                    if (node) {
                        delete this._decorations[node.id];
                    }
                }
            }
            return result;
        }
        deltaCellDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                const handle = this._decorationIdToCellMap.get(id);
                if (handle !== undefined) {
                    const cell = this.getCellByHandle(handle);
                    cell?.deltaCellDecorations([id], []);
                    this._decorationIdToCellMap.delete(id);
                }
            });
            const result = [];
            newDecorations.forEach(decoration => {
                const cell = this.getCellByHandle(decoration.handle);
                const ret = cell?.deltaCellDecorations([], [decoration.options]) || [];
                ret.forEach(id => {
                    this._decorationIdToCellMap.set(id, decoration.handle);
                });
                result.push(...ret);
            });
            return result;
        }
        deltaCellStatusBarItems(oldItems, newItems) {
            const deletesByHandle = (0, collections_1.groupBy)(oldItems, id => this._statusBarItemIdToCellMap.get(id) ?? -1);
            const result = [];
            newItems.forEach(itemDelta => {
                const cell = this.getCellByHandle(itemDelta.handle);
                const deleted = deletesByHandle[itemDelta.handle] ?? [];
                delete deletesByHandle[itemDelta.handle];
                deleted.forEach(id => this._statusBarItemIdToCellMap.delete(id));
                const ret = cell?.deltaCellStatusBarItems(deleted, itemDelta.items) || [];
                ret.forEach(id => {
                    this._statusBarItemIdToCellMap.set(id, itemDelta.handle);
                });
                result.push(...ret);
            });
            for (const _handle in deletesByHandle) {
                const handle = parseInt(_handle);
                const ids = deletesByHandle[handle];
                const cell = this.getCellByHandle(handle);
                cell?.deltaCellStatusBarItems(ids, []);
                ids.forEach(id => this._statusBarItemIdToCellMap.delete(id));
            }
            return result;
        }
        nearestCodeCellIndex(index /* exclusive */) {
            const nearest = this.viewCells.slice(0, index).reverse().findIndex(cell => cell.cellKind === notebookCommon_1.CellKind.Code);
            if (nearest > -1) {
                return index - nearest - 1;
            }
            else {
                const nearestCellTheOtherDirection = this.viewCells.slice(index + 1).findIndex(cell => cell.cellKind === notebookCommon_1.CellKind.Code);
                if (nearestCellTheOtherDirection > -1) {
                    return index + 1 + nearestCellTheOtherDirection;
                }
                return -1;
            }
        }
        getEditorViewState() {
            const editingCells = {};
            const collapsedInputCells = {};
            const collapsedOutputCells = {};
            const cellLineNumberStates = {};
            this._viewCells.forEach((cell, i) => {
                if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                    editingCells[i] = true;
                }
                if (cell.isInputCollapsed) {
                    collapsedInputCells[i] = true;
                }
                if (cell instanceof codeCellViewModel_1.CodeCellViewModel && cell.isOutputCollapsed) {
                    collapsedOutputCells[i] = true;
                }
                if (cell.lineNumbers !== 'inherit') {
                    cellLineNumberStates[i] = cell.lineNumbers;
                }
            });
            const editorViewStates = {};
            this._viewCells.map(cell => ({ handle: cell.model.handle, state: cell.saveEditorViewState() })).forEach((viewState, i) => {
                if (viewState.state) {
                    editorViewStates[i] = viewState.state;
                }
            });
            return {
                editingCells,
                editorViewStates,
                cellLineNumberStates,
                collapsedInputCells,
                collapsedOutputCells
            };
        }
        restoreEditorViewState(viewState) {
            if (!viewState) {
                return;
            }
            this._viewCells.forEach((cell, index) => {
                const isEditing = viewState.editingCells && viewState.editingCells[index];
                const editorViewState = viewState.editorViewStates && viewState.editorViewStates[index];
                cell.updateEditState(isEditing ? notebookBrowser_1.CellEditState.Editing : notebookBrowser_1.CellEditState.Preview, 'viewState');
                const cellHeight = viewState.cellTotalHeights ? viewState.cellTotalHeights[index] : undefined;
                cell.restoreEditorViewState(editorViewState, cellHeight);
                if (viewState.collapsedInputCells && viewState.collapsedInputCells[index]) {
                    cell.isInputCollapsed = true;
                }
                if (viewState.collapsedOutputCells && viewState.collapsedOutputCells[index] && cell instanceof codeCellViewModel_1.CodeCellViewModel) {
                    cell.isOutputCollapsed = true;
                }
                if (viewState.cellLineNumberStates && viewState.cellLineNumberStates[index]) {
                    cell.lineNumbers = viewState.cellLineNumberStates[index];
                }
            });
        }
        /**
         * Editor decorations across cells. For example, find decorations for multiple code cells
         * The reason that we can't completely delegate this to CodeEditorWidget is most of the time, the editors for cells are not created yet but we already have decorations for them.
         */
        changeModelDecorations(callback) {
            const changeAccessor = {
                deltaDecorations: (oldDecorations, newDecorations) => {
                    return this._deltaModelDecorationsImpl(oldDecorations, newDecorations);
                }
            };
            let result = null;
            try {
                result = callback(changeAccessor);
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
            changeAccessor.deltaDecorations = invalidFunc;
            return result;
        }
        _deltaModelDecorationsImpl(oldDecorations, newDecorations) {
            const mapping = new Map();
            oldDecorations.forEach(oldDecoration => {
                const ownerId = oldDecoration.ownerId;
                if (!mapping.has(ownerId)) {
                    const cell = this._viewCells.find(cell => cell.handle === ownerId);
                    if (cell) {
                        mapping.set(ownerId, { cell: cell, oldDecorations: [], newDecorations: [] });
                    }
                }
                const data = mapping.get(ownerId);
                if (data) {
                    data.oldDecorations = oldDecoration.decorations;
                }
            });
            newDecorations.forEach(newDecoration => {
                const ownerId = newDecoration.ownerId;
                if (!mapping.has(ownerId)) {
                    const cell = this._viewCells.find(cell => cell.handle === ownerId);
                    if (cell) {
                        mapping.set(ownerId, { cell: cell, oldDecorations: [], newDecorations: [] });
                    }
                }
                const data = mapping.get(ownerId);
                if (data) {
                    data.newDecorations = newDecoration.decorations;
                }
            });
            const ret = [];
            mapping.forEach((value, ownerId) => {
                const cellRet = value.cell.deltaModelDecorations(value.oldDecorations, value.newDecorations);
                ret.push({
                    ownerId: ownerId,
                    decorations: cellRet
                });
            });
            return ret;
        }
        //#region Find
        find(value, options) {
            const matches = [];
            this._viewCells.forEach((cell, index) => {
                const cellMatches = cell.startFind(value, options);
                if (cellMatches) {
                    matches.push(new findModel_1.CellFindMatchModel(cellMatches.cell, index, cellMatches.contentMatches, []));
                }
            });
            // filter based on options and editing state
            return matches.filter(match => {
                if (match.cell.cellKind === notebookCommon_1.CellKind.Code) {
                    // code cell, we only include its match if include input is enabled
                    return options.includeCodeInput;
                }
                // markup cell, it depends on the editing state
                if (match.cell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                    // editing, even if we includeMarkupPreview
                    return options.includeMarkupInput;
                }
                else {
                    // cell in preview mode, we should only include it if includeMarkupPreview is false but includeMarkupInput is true
                    // if includeMarkupPreview is true, then we should include the webview match result other than this
                    return !options.includeMarkupPreview && options.includeMarkupInput;
                }
            });
        }
        replaceOne(cell, range, text) {
            const viewCell = cell;
            this._lastNotebookEditResource.push(viewCell.uri);
            return viewCell.resolveTextModel().then(() => {
                this._bulkEditService.apply([new bulkEditService_1.ResourceTextEdit(cell.uri, { range, text })], { quotableLabel: 'Notebook Replace' });
            });
        }
        async replaceAll(matches, texts) {
            if (!matches.length) {
                return;
            }
            const textEdits = [];
            this._lastNotebookEditResource.push(matches[0].cell.uri);
            matches.forEach(match => {
                match.contentMatches.forEach((singleMatch, index) => {
                    textEdits.push({
                        versionId: undefined,
                        textEdit: { range: singleMatch.range, text: texts[index] },
                        resource: match.cell.uri
                    });
                });
            });
            return Promise.all(matches.map(match => {
                return match.cell.resolveTextModel();
            })).then(async () => {
                this._bulkEditService.apply({ edits: textEdits }, { quotableLabel: 'Notebook Replace All' });
                return;
            });
        }
        //#endregion
        //#region Undo/Redo
        async _withElement(element, callback) {
            const viewCells = this._viewCells.filter(cell => element.matchesResource(cell.uri));
            const refs = await Promise.all(viewCells.map(cell => this._textModelService.createModelReference(cell.uri)));
            await callback();
            refs.forEach(ref => ref.dispose());
        }
        async undo() {
            const editStack = this._undoService.getElements(this.uri);
            const element = editStack.past.length ? editStack.past[editStack.past.length - 1] : undefined;
            if (element && element instanceof editStack_1.SingleModelEditStackElement || element instanceof editStack_1.MultiModelEditStackElement) {
                await this._withElement(element, async () => {
                    await this._undoService.undo(this.uri);
                });
                return (element instanceof editStack_1.SingleModelEditStackElement) ? [element.resource] : element.resources;
            }
            await this._undoService.undo(this.uri);
            return [];
        }
        async redo() {
            const editStack = this._undoService.getElements(this.uri);
            const element = editStack.future[0];
            if (element && element instanceof editStack_1.SingleModelEditStackElement || element instanceof editStack_1.MultiModelEditStackElement) {
                await this._withElement(element, async () => {
                    await this._undoService.redo(this.uri);
                });
                return (element instanceof editStack_1.SingleModelEditStackElement) ? [element.resource] : element.resources;
            }
            await this._undoService.redo(this.uri);
            return [];
        }
        //#endregion
        equal(notebook) {
            return this._notebook === notebook;
        }
        dispose() {
            this._localStore.clear();
            this._viewCells.forEach(cell => {
                cell.dispose();
            });
            super.dispose();
        }
    };
    exports.NotebookViewModel = NotebookViewModel;
    exports.NotebookViewModel = NotebookViewModel = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, bulkEditService_1.IBulkEditService),
        __param(7, undoRedo_1.IUndoRedoService),
        __param(8, resolverService_1.ITextModelService),
        __param(9, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], NotebookViewModel);
    function createCellViewModel(instantiationService, notebookViewModel, cell, viewContext) {
        if (cell.cellKind === notebookCommon_1.CellKind.Code) {
            return instantiationService.createInstance(codeCellViewModel_1.CodeCellViewModel, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, viewContext);
        }
        else {
            return instantiationService.createInstance(markupCellViewModel_1.MarkupCellViewModel, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, notebookViewModel, viewContext);
        }
    }
    exports.createCellViewModel = createCellViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tWaWV3TW9kZWxJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdNb2RlbC9ub3RlYm9va1ZpZXdNb2RlbEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRyxNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUUsR0FBRyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFMUUsTUFBTSxlQUFlO1FBR3BCO1lBQ0MsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksMkJBQVksRUFBRSxDQUFDO1FBQzVDLENBQUM7UUFFTSxjQUFjLENBQUMsS0FBYSxFQUFFLEdBQVcsRUFBRSxhQUFxQixFQUFFLG1CQUE0QixFQUFFLGVBQXVCLEVBQUUsd0JBQWlDLEtBQUs7WUFDckssTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxtQkFBbUIsRUFBRSxlQUFlLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUN4SSxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFTSxNQUFNLENBQUMsYUFBcUIsRUFBRSxtQkFBNEIsRUFBRSxpQkFBMEIsRUFBRSxlQUF1QixFQUFFLHFCQUE4QjtZQUNySixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLG1CQUFtQixFQUFFLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBRWpILENBQUM7UUFFTSxxQkFBcUIsQ0FBQyxPQUFlO1lBQzNDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENB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
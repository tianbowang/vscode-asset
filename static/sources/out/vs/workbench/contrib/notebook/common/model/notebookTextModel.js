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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/common/model/cellEdit", "vs/base/common/diff/diff", "vs/base/common/hash", "vs/workbench/contrib/notebook/common/model/notebookCellOutputTextModel", "vs/editor/common/services/model", "vs/base/common/network", "vs/base/common/resources", "vs/editor/common/languages/language", "vs/editor/common/model/textModel", "vs/base/common/types"], function (require, exports, event_1, lifecycle_1, notebookCellTextModel_1, notebookCommon_1, undoRedo_1, cellEdit_1, diff_1, hash_1, notebookCellOutputTextModel_1, model_1, network_1, resources_1, language_1, textModel_1, types_1) {
    "use strict";
    var NotebookTextModel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookTextModel = void 0;
    class StackOperation {
        constructor(textModel, label, undoRedoGroup, _pauseableEmitter, _postUndoRedo, selectionState, beginAlternativeVersionId) {
            this.textModel = textModel;
            this.label = label;
            this.undoRedoGroup = undoRedoGroup;
            this._pauseableEmitter = _pauseableEmitter;
            this._postUndoRedo = _postUndoRedo;
            this.code = 'undoredo.notebooks.stackOperation';
            this._operations = [];
            this._beginSelectionState = undefined;
            this._resultSelectionState = undefined;
            this.type = 1 /* UndoRedoElementType.Workspace */;
            this._beginSelectionState = selectionState;
            this._beginAlternativeVersionId = beginAlternativeVersionId;
            this._resultAlternativeVersionId = beginAlternativeVersionId;
        }
        get resources() {
            return [this.textModel.uri];
        }
        get isEmpty() {
            return this._operations.length === 0;
        }
        pushEndState(alternativeVersionId, selectionState) {
            this._resultAlternativeVersionId = alternativeVersionId;
            this._resultSelectionState = selectionState;
        }
        pushEditOperation(element, beginSelectionState, resultSelectionState) {
            if (this._operations.length === 0) {
                this._beginSelectionState = this._beginSelectionState ?? beginSelectionState;
            }
            this._operations.push(element);
            this._resultSelectionState = resultSelectionState;
        }
        async undo() {
            this._pauseableEmitter.pause();
            for (let i = this._operations.length - 1; i >= 0; i--) {
                await this._operations[i].undo();
            }
            this._postUndoRedo(this._beginAlternativeVersionId);
            this._pauseableEmitter.fire({
                rawEvents: [],
                synchronous: undefined,
                versionId: this.textModel.versionId,
                endSelectionState: this._beginSelectionState
            });
            this._pauseableEmitter.resume();
        }
        async redo() {
            this._pauseableEmitter.pause();
            for (let i = 0; i < this._operations.length; i++) {
                await this._operations[i].redo();
            }
            this._postUndoRedo(this._resultAlternativeVersionId);
            this._pauseableEmitter.fire({
                rawEvents: [],
                synchronous: undefined,
                versionId: this.textModel.versionId,
                endSelectionState: this._resultSelectionState
            });
            this._pauseableEmitter.resume();
        }
    }
    class NotebookOperationManager {
        constructor(_textModel, _undoService, _pauseableEmitter, _postUndoRedo) {
            this._textModel = _textModel;
            this._undoService = _undoService;
            this._pauseableEmitter = _pauseableEmitter;
            this._postUndoRedo = _postUndoRedo;
            this._pendingStackOperation = null;
        }
        isUndoStackEmpty() {
            return this._pendingStackOperation === null || this._pendingStackOperation.isEmpty;
        }
        pushStackElement(label, selectionState, undoRedoGroup, alternativeVersionId) {
            if (this._pendingStackOperation) {
                this._pendingStackOperation.pushEndState(alternativeVersionId, selectionState);
                if (!this._pendingStackOperation.isEmpty) {
                    this._undoService.pushElement(this._pendingStackOperation, this._pendingStackOperation.undoRedoGroup);
                }
                this._pendingStackOperation = null;
                return;
            }
            this._pendingStackOperation = new StackOperation(this._textModel, label, undoRedoGroup, this._pauseableEmitter, this._postUndoRedo, selectionState, alternativeVersionId);
        }
        pushEditOperation(element, beginSelectionState, resultSelectionState) {
            if (this._pendingStackOperation) {
                this._pendingStackOperation.pushEditOperation(element, beginSelectionState, resultSelectionState);
                return;
            }
            this._undoService.pushElement(element);
        }
    }
    class NotebookEventEmitter extends event_1.PauseableEmitter {
        isDirtyEvent() {
            for (const e of this._eventQueue) {
                for (let i = 0; i < e.rawEvents.length; i++) {
                    if (!e.rawEvents[i].transient) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    let NotebookTextModel = NotebookTextModel_1 = class NotebookTextModel extends lifecycle_1.Disposable {
        get length() {
            return this._cells.length;
        }
        get cells() {
            return this._cells;
        }
        get versionId() {
            return this._versionId;
        }
        get alternativeVersionId() {
            return this._alternativeVersionId;
        }
        constructor(viewType, uri, cells, metadata, options, _undoService, _modelService, _languageService) {
            super();
            this.viewType = viewType;
            this.uri = uri;
            this._undoService = _undoService;
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._isDisposed = false;
            this._onWillDispose = this._register(new event_1.Emitter());
            this._onWillAddRemoveCells = this._register(new event_1.Emitter());
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.onWillAddRemoveCells = this._onWillAddRemoveCells.event;
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._cellhandlePool = 0;
            this._cellListeners = new Map();
            this._cells = [];
            this.metadata = {};
            this.transientOptions = { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} };
            this._versionId = 0;
            /**
             * This alternative id is only for non-cell-content changes.
             */
            this._notebookSpecificAlternativeId = 0;
            /**
             * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
             */
            this._alternativeVersionId = '1';
            this.transientOptions = options;
            this.metadata = metadata;
            this._initialize(cells);
            const maybeUpdateCellTextModel = (textModel) => {
                if (textModel.uri.scheme === network_1.Schemas.vscodeNotebookCell && textModel instanceof textModel_1.TextModel) {
                    const cellUri = notebookCommon_1.CellUri.parse(textModel.uri);
                    if (cellUri && (0, resources_1.isEqual)(cellUri.notebook, this.uri)) {
                        const cellIdx = this._getCellIndexByHandle(cellUri.handle);
                        if (cellIdx >= 0) {
                            const cell = this.cells[cellIdx];
                            if (cell) {
                                cell.textModel = textModel;
                            }
                        }
                    }
                }
            };
            this._register(_modelService.onModelAdded(e => maybeUpdateCellTextModel(e)));
            this._pauseableEmitter = new NotebookEventEmitter({
                merge: (events) => {
                    const first = events[0];
                    const rawEvents = first.rawEvents;
                    let versionId = first.versionId;
                    let endSelectionState = first.endSelectionState;
                    let synchronous = first.synchronous;
                    for (let i = 1; i < events.length; i++) {
                        rawEvents.push(...events[i].rawEvents);
                        versionId = events[i].versionId;
                        endSelectionState = events[i].endSelectionState !== undefined ? events[i].endSelectionState : endSelectionState;
                        synchronous = events[i].synchronous !== undefined ? events[i].synchronous : synchronous;
                    }
                    return { rawEvents, versionId, endSelectionState, synchronous };
                }
            });
            this._register(this._pauseableEmitter.event(e => {
                if (e.rawEvents.length) {
                    this._onDidChangeContent.fire(e);
                }
            }));
            this._operationManager = new NotebookOperationManager(this, this._undoService, this._pauseableEmitter, (alternativeVersionId) => {
                this._increaseVersionId(true);
                this._overwriteAlternativeVersionId(alternativeVersionId);
            });
        }
        setCellCollapseDefault(collapseConfig) {
            this._defaultCollapseConfig = collapseConfig;
        }
        _initialize(cells, triggerDirty) {
            this._cells = [];
            this._versionId = 0;
            this._notebookSpecificAlternativeId = 0;
            const mainCells = cells.map(cell => {
                const cellHandle = this._cellhandlePool++;
                const cellUri = notebookCommon_1.CellUri.generate(this.uri, cellHandle);
                const collapseState = this._getDefaultCollapseState(cell);
                return new notebookCellTextModel_1.NotebookCellTextModel(cellUri, cellHandle, cell.source, cell.language, cell.mime, cell.cellKind, cell.outputs, cell.metadata, cell.internalMetadata, collapseState, this.transientOptions, this._languageService);
            });
            for (let i = 0; i < mainCells.length; i++) {
                const dirtyStateListener = mainCells[i].onDidChangeContent((e) => {
                    this._bindCellContentHandler(mainCells[i], e);
                });
                this._cellListeners.set(mainCells[i].handle, dirtyStateListener);
                this._register(mainCells[i]);
            }
            this._cells.splice(0, 0, ...mainCells);
            this._alternativeVersionId = this._generateAlternativeId();
            if (triggerDirty) {
                this._pauseableEmitter.fire({
                    rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.Unknown, transient: false }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
            }
        }
        _bindCellContentHandler(cell, e) {
            this._increaseVersionId(e === 'content');
            switch (e) {
                case 'content':
                    this._pauseableEmitter.fire({
                        rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellContent, index: this._getCellIndexByHandle(cell.handle), transient: false }],
                        versionId: this.versionId,
                        synchronous: true,
                        endSelectionState: undefined
                    });
                    break;
                case 'language':
                    this._pauseableEmitter.fire({
                        rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage, index: this._getCellIndexByHandle(cell.handle), language: cell.language, transient: false }],
                        versionId: this.versionId,
                        synchronous: true,
                        endSelectionState: undefined
                    });
                    break;
                case 'mime':
                    this._pauseableEmitter.fire({
                        rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMime, index: this._getCellIndexByHandle(cell.handle), mime: cell.mime, transient: false }],
                        versionId: this.versionId,
                        synchronous: true,
                        endSelectionState: undefined
                    });
                    break;
            }
        }
        _generateAlternativeId() {
            return `${this._notebookSpecificAlternativeId}_` + this.cells.map(cell => cell.handle + ',' + cell.alternativeId).join(';');
        }
        dispose() {
            if (this._isDisposed) {
                // NotebookEditorModel can be disposed twice, don't fire onWillDispose again
                return;
            }
            this._isDisposed = true;
            this._onWillDispose.fire();
            this._undoService.removeElements(this.uri);
            (0, lifecycle_1.dispose)(this._cellListeners.values());
            this._cellListeners.clear();
            (0, lifecycle_1.dispose)(this._cells);
            this._cells = [];
            super.dispose();
        }
        pushStackElement(label, selectionState, undoRedoGroup) {
            this._operationManager.pushStackElement(label, selectionState, undoRedoGroup, this.alternativeVersionId);
        }
        _getCellIndexByHandle(handle) {
            return this.cells.findIndex(c => c.handle === handle);
        }
        _getCellIndexWithOutputIdHandleFromEdits(outputId, rawEdits) {
            const edit = rawEdits.find(e => 'outputs' in e && e.outputs.some(o => o.outputId === outputId));
            if (edit) {
                if ('index' in edit) {
                    return edit.index;
                }
                else if ('handle' in edit) {
                    const cellIndex = this._getCellIndexByHandle(edit.handle);
                    this._assertIndex(cellIndex);
                    return cellIndex;
                }
            }
            return -1;
        }
        _getCellIndexWithOutputIdHandle(outputId) {
            return this.cells.findIndex(c => !!c.outputs.find(o => o.outputId === outputId));
        }
        reset(cells, metadata, transientOptions) {
            this.transientOptions = transientOptions;
            const edits = NotebookTextModel_1.computeEdits(this, cells);
            this.applyEdits([
                ...edits,
                { editType: 5 /* CellEditType.DocumentMetadata */, metadata }
            ], true, undefined, () => undefined, undefined, false);
        }
        static computeEdits(model, cells) {
            const edits = [];
            const commonPrefix = this._commonPrefix(model.cells, model.cells.length, 0, cells, cells.length, 0);
            if (commonPrefix > 0) {
                for (let i = 0; i < commonPrefix; i++) {
                    edits.push({
                        editType: 3 /* CellEditType.Metadata */,
                        index: i,
                        metadata: cells[i].metadata ?? {}
                    }, ...this._computeOutputEdit(i, model.cells[i].outputs, cells[i].outputs));
                }
            }
            if (model.cells.length === cells.length && commonPrefix === model.cells.length) {
                return edits;
            }
            const commonSuffix = this._commonSuffix(model.cells, model.cells.length - commonPrefix, commonPrefix, cells, cells.length - commonPrefix, commonPrefix);
            if (commonSuffix > 0) {
                edits.push({ editType: 1 /* CellEditType.Replace */, index: commonPrefix, count: model.cells.length - commonPrefix - commonSuffix, cells: cells.slice(commonPrefix, cells.length - commonSuffix) });
            }
            else if (commonPrefix > 0) {
                edits.push({ editType: 1 /* CellEditType.Replace */, index: commonPrefix, count: model.cells.length - commonPrefix, cells: cells.slice(commonPrefix) });
            }
            else {
                edits.push({ editType: 1 /* CellEditType.Replace */, index: 0, count: model.cells.length, cells });
            }
            if (commonSuffix > 0) {
                // has same suffix
                for (let i = commonSuffix; i > 0; i--) {
                    edits.push({
                        editType: 3 /* CellEditType.Metadata */,
                        index: model.cells.length - i,
                        metadata: cells[cells.length - i].metadata ?? {}
                    }, ...this._computeOutputEdit(model.cells.length - i, model.cells[model.cells.length - i].outputs, cells[cells.length - i].outputs));
                }
            }
            return edits;
        }
        static _computeOutputEdit(index, a, b) {
            if (a.length !== b.length) {
                return [
                    {
                        editType: 2 /* CellEditType.Output */,
                        index: index,
                        outputs: b,
                        append: false
                    }
                ];
            }
            if (a.length === 0) {
                // no output
                return [];
            }
            // same length
            return b.map((output, i) => {
                return {
                    editType: 7 /* CellEditType.OutputItems */,
                    outputId: a[i].outputId,
                    items: output.outputs,
                    append: false
                };
            });
        }
        static _commonPrefix(a, aLen, aDelta, b, bLen, bDelta) {
            const maxResult = Math.min(aLen, bLen);
            let result = 0;
            for (let i = 0; i < maxResult && a[aDelta + i].fastEqual(b[bDelta + i]); i++) {
                result++;
            }
            return result;
        }
        static _commonSuffix(a, aLen, aDelta, b, bLen, bDelta) {
            const maxResult = Math.min(aLen, bLen);
            let result = 0;
            for (let i = 0; i < maxResult && a[aDelta + aLen - i - 1].fastEqual(b[bDelta + bLen - i - 1]); i++) {
                result++;
            }
            return result;
        }
        applyEdits(rawEdits, synchronous, beginSelectionState, endSelectionsComputer, undoRedoGroup, computeUndoRedo) {
            this._pauseableEmitter.pause();
            this.pushStackElement('edit', beginSelectionState, undoRedoGroup);
            try {
                this._doApplyEdits(rawEdits, synchronous, computeUndoRedo);
                return true;
            }
            finally {
                // Update selection and versionId after applying edits.
                const endSelections = endSelectionsComputer();
                this._increaseVersionId(this._operationManager.isUndoStackEmpty() && !this._pauseableEmitter.isDirtyEvent());
                // Finalize undo element
                this.pushStackElement('edit', endSelections, undefined);
                // Broadcast changes
                this._pauseableEmitter.fire({ rawEvents: [], versionId: this.versionId, synchronous: synchronous, endSelectionState: endSelections });
                this._pauseableEmitter.resume();
            }
        }
        _doApplyEdits(rawEdits, synchronous, computeUndoRedo) {
            const editsWithDetails = rawEdits.map((edit, index) => {
                let cellIndex = -1;
                if ('index' in edit) {
                    cellIndex = edit.index;
                }
                else if ('handle' in edit) {
                    cellIndex = this._getCellIndexByHandle(edit.handle);
                    this._assertIndex(cellIndex);
                }
                else if ('outputId' in edit) {
                    cellIndex = this._getCellIndexWithOutputIdHandle(edit.outputId);
                    if (this._indexIsInvalid(cellIndex)) {
                        // The referenced output may have been created in this batch of edits
                        cellIndex = this._getCellIndexWithOutputIdHandleFromEdits(edit.outputId, rawEdits.slice(0, index));
                    }
                    if (this._indexIsInvalid(cellIndex)) {
                        // It's possible for an edit to refer to an output which was just cleared, ignore it without throwing
                        return null;
                    }
                }
                else if (edit.editType !== 5 /* CellEditType.DocumentMetadata */) {
                    throw new Error('Invalid cell edit');
                }
                return {
                    edit,
                    cellIndex,
                    end: (edit.editType === 5 /* CellEditType.DocumentMetadata */)
                        ? undefined
                        : (edit.editType === 1 /* CellEditType.Replace */ ? edit.index + edit.count : cellIndex),
                    originalIndex: index
                };
            }).filter(types_1.isDefined);
            // compress all edits which have no side effects on cell index
            const edits = this._mergeCellEdits(editsWithDetails)
                .sort((a, b) => {
                if (a.end === undefined) {
                    return -1;
                }
                if (b.end === undefined) {
                    return -1;
                }
                return b.end - a.end || b.originalIndex - a.originalIndex;
            }).reduce((prev, curr) => {
                if (!prev.length) {
                    // empty
                    prev.push([curr]);
                }
                else {
                    const last = prev[prev.length - 1];
                    const index = last[0].cellIndex;
                    if (curr.cellIndex === index) {
                        last.push(curr);
                    }
                    else {
                        prev.push([curr]);
                    }
                }
                return prev;
            }, []).map(editsOnSameIndex => {
                const replaceEdits = [];
                const otherEdits = [];
                editsOnSameIndex.forEach(edit => {
                    if (edit.edit.editType === 1 /* CellEditType.Replace */) {
                        replaceEdits.push(edit);
                    }
                    else {
                        otherEdits.push(edit);
                    }
                });
                return [...otherEdits.reverse(), ...replaceEdits];
            });
            const flattenEdits = edits.flat();
            for (const { edit, cellIndex } of flattenEdits) {
                switch (edit.editType) {
                    case 1 /* CellEditType.Replace */:
                        this._replaceCells(edit.index, edit.count, edit.cells, synchronous, computeUndoRedo);
                        break;
                    case 2 /* CellEditType.Output */: {
                        this._assertIndex(cellIndex);
                        const cell = this._cells[cellIndex];
                        if (edit.append) {
                            this._spliceNotebookCellOutputs(cell, { start: cell.outputs.length, deleteCount: 0, newOutputs: edit.outputs.map(op => new notebookCellOutputTextModel_1.NotebookCellOutputTextModel(op)) }, true, computeUndoRedo);
                        }
                        else {
                            this._spliceNotebookCellOutputs2(cell, edit.outputs, computeUndoRedo);
                        }
                        break;
                    }
                    case 7 /* CellEditType.OutputItems */:
                        {
                            this._assertIndex(cellIndex);
                            const cell = this._cells[cellIndex];
                            if (edit.append) {
                                this._appendNotebookCellOutputItems(cell, edit.outputId, edit.items);
                            }
                            else {
                                this._replaceNotebookCellOutputItems(cell, edit.outputId, edit.items);
                            }
                        }
                        break;
                    case 3 /* CellEditType.Metadata */:
                        this._assertIndex(edit.index);
                        this._changeCellMetadata(this._cells[edit.index], edit.metadata, computeUndoRedo);
                        break;
                    case 8 /* CellEditType.PartialMetadata */:
                        this._assertIndex(cellIndex);
                        this._changeCellMetadataPartial(this._cells[cellIndex], edit.metadata, computeUndoRedo);
                        break;
                    case 9 /* CellEditType.PartialInternalMetadata */:
                        this._assertIndex(cellIndex);
                        this._changeCellInternalMetadataPartial(this._cells[cellIndex], edit.internalMetadata);
                        break;
                    case 4 /* CellEditType.CellLanguage */:
                        this._assertIndex(edit.index);
                        this._changeCellLanguage(this._cells[edit.index], edit.language, computeUndoRedo);
                        break;
                    case 5 /* CellEditType.DocumentMetadata */:
                        this._updateNotebookMetadata(edit.metadata, computeUndoRedo);
                        break;
                    case 6 /* CellEditType.Move */:
                        this._moveCellToIdx(edit.index, edit.length, edit.newIdx, synchronous, computeUndoRedo, undefined, undefined);
                        break;
                }
            }
        }
        _mergeCellEdits(rawEdits) {
            const mergedEdits = [];
            rawEdits.forEach(edit => {
                if (mergedEdits.length) {
                    const last = mergedEdits[mergedEdits.length - 1];
                    if (last.edit.editType === 2 /* CellEditType.Output */
                        && last.edit.append
                        && edit.edit.editType === 2 /* CellEditType.Output */
                        && edit.edit.append
                        && last.cellIndex === edit.cellIndex) {
                        last.edit.outputs = [...last.edit.outputs, ...edit.edit.outputs];
                    }
                    else if (last.edit.editType === 2 /* CellEditType.Output */
                        && !last.edit.append // last cell is not append
                        && last.edit.outputs.length === 0 // last cell is clear outputs
                        && edit.edit.editType === 2 /* CellEditType.Output */
                        && edit.edit.append
                        && last.cellIndex === edit.cellIndex) {
                        last.edit.append = false;
                        last.edit.outputs = edit.edit.outputs;
                    }
                    else {
                        mergedEdits.push(edit);
                    }
                }
                else {
                    mergedEdits.push(edit);
                }
            });
            return mergedEdits;
        }
        _getDefaultCollapseState(cellDto) {
            const defaultConfig = cellDto.cellKind === notebookCommon_1.CellKind.Code ? this._defaultCollapseConfig?.codeCell : this._defaultCollapseConfig?.markupCell;
            return cellDto.collapseState ?? (defaultConfig ?? undefined);
        }
        _replaceCells(index, count, cellDtos, synchronous, computeUndoRedo) {
            if (count === 0 && cellDtos.length === 0) {
                return;
            }
            const oldViewCells = this._cells.slice(0);
            const oldSet = new Set();
            oldViewCells.forEach(cell => {
                oldSet.add(cell.handle);
            });
            // prepare remove
            for (let i = index; i < Math.min(index + count, this._cells.length); i++) {
                const cell = this._cells[i];
                this._cellListeners.get(cell.handle)?.dispose();
                this._cellListeners.delete(cell.handle);
            }
            // prepare add
            const cells = cellDtos.map(cellDto => {
                const cellHandle = this._cellhandlePool++;
                const cellUri = notebookCommon_1.CellUri.generate(this.uri, cellHandle);
                const collapseState = this._getDefaultCollapseState(cellDto);
                const cell = new notebookCellTextModel_1.NotebookCellTextModel(cellUri, cellHandle, cellDto.source, cellDto.language, cellDto.mime, cellDto.cellKind, cellDto.outputs || [], cellDto.metadata, cellDto.internalMetadata, collapseState, this.transientOptions, this._languageService);
                const textModel = this._modelService.getModel(cellUri);
                if (textModel && textModel instanceof textModel_1.TextModel) {
                    cell.textModel = textModel;
                    cell.language = cellDto.language;
                    cell.textModel.setValue(cellDto.source);
                    cell.resetTextBuffer(cell.textModel.getTextBuffer());
                }
                const dirtyStateListener = cell.onDidChangeContent((e) => {
                    this._bindCellContentHandler(cell, e);
                });
                this._cellListeners.set(cell.handle, dirtyStateListener);
                this._register(cell);
                return cell;
            });
            // compute change
            const cellsCopy = this._cells.slice(0);
            cellsCopy.splice(index, count, ...cells);
            const diffs = (0, notebookCommon_1.diff)(this._cells, cellsCopy, cell => {
                return oldSet.has(cell.handle);
            }).map(diff => {
                return [diff.start, diff.deleteCount, diff.toInsert];
            });
            this._onWillAddRemoveCells.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes: diffs } });
            // make change
            this._cells = cellsCopy;
            const undoDiff = diffs.map(diff => {
                const deletedCells = oldViewCells.slice(diff[0], diff[0] + diff[1]);
                return [diff[0], deletedCells, diff[2]];
            });
            if (computeUndoRedo) {
                this._operationManager.pushEditOperation(new cellEdit_1.SpliceCellsEdit(this.uri, undoDiff, {
                    insertCell: (index, cell, endSelections) => { this._insertNewCell(index, [cell], true, endSelections); },
                    deleteCell: (index, endSelections) => { this._removeCell(index, 1, true, endSelections); },
                    replaceCell: (index, count, cells, endSelections) => { this._replaceNewCells(index, count, cells, true, endSelections); },
                }, undefined, undefined), undefined, undefined);
            }
            // should be deferred
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes: diffs, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: undefined
            });
        }
        _increaseVersionId(transient) {
            this._versionId = this._versionId + 1;
            if (!transient) {
                this._notebookSpecificAlternativeId = this._versionId;
            }
            this._alternativeVersionId = this._generateAlternativeId();
        }
        _overwriteAlternativeVersionId(newAlternativeVersionId) {
            this._alternativeVersionId = newAlternativeVersionId;
            this._notebookSpecificAlternativeId = Number(newAlternativeVersionId.substring(0, newAlternativeVersionId.indexOf('_')));
        }
        _updateNotebookMetadata(metadata, computeUndoRedo) {
            const oldMetadata = this.metadata;
            const triggerDirtyChange = this._isDocumentMetadataChanged(this.metadata, metadata);
            if (triggerDirtyChange) {
                if (computeUndoRedo) {
                    const that = this;
                    this._operationManager.pushEditOperation(new class {
                        constructor() {
                            this.type = 0 /* UndoRedoElementType.Resource */;
                            this.label = 'Update Notebook Metadata';
                            this.code = 'undoredo.notebooks.updateCellMetadata';
                        }
                        get resource() {
                            return that.uri;
                        }
                        undo() {
                            that._updateNotebookMetadata(oldMetadata, false);
                        }
                        redo() {
                            that._updateNotebookMetadata(metadata, false);
                        }
                    }(), undefined, undefined);
                }
            }
            this.metadata = metadata;
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata, metadata: this.metadata, transient: !triggerDirtyChange }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _insertNewCell(index, cells, synchronous, endSelections) {
            for (let i = 0; i < cells.length; i++) {
                const dirtyStateListener = cells[i].onDidChangeContent((e) => {
                    this._bindCellContentHandler(cells[i], e);
                });
                this._cellListeners.set(cells[i].handle, dirtyStateListener);
            }
            const changes = [[index, 0, cells]];
            this._onWillAddRemoveCells.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes } });
            this._cells.splice(index, 0, ...cells);
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
            return;
        }
        _removeCell(index, count, synchronous, endSelections) {
            for (let i = index; i < index + count; i++) {
                const cell = this._cells[i];
                this._cellListeners.get(cell.handle)?.dispose();
                this._cellListeners.delete(cell.handle);
            }
            const changes = [[index, count, []]];
            this._onWillAddRemoveCells.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes } });
            this._cells.splice(index, count);
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
        }
        _replaceNewCells(index, count, cells, synchronous, endSelections) {
            for (let i = index; i < index + count; i++) {
                const cell = this._cells[i];
                this._cellListeners.get(cell.handle)?.dispose();
                this._cellListeners.delete(cell.handle);
            }
            for (let i = 0; i < cells.length; i++) {
                const dirtyStateListener = cells[i].onDidChangeContent((e) => {
                    this._bindCellContentHandler(cells[i], e);
                });
                this._cellListeners.set(cells[i].handle, dirtyStateListener);
            }
            const changes = [[index, count, cells]];
            this._onWillAddRemoveCells.fire({ rawEvent: { kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes } });
            this._cells.splice(index, count, ...cells);
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
        }
        _isDocumentMetadataChanged(a, b) {
            const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
            for (const key of keys) {
                if (key === 'custom') {
                    if (!this._customMetadataEqual(a[key], b[key])
                        &&
                            !(this.transientOptions.transientDocumentMetadata[key])) {
                        return true;
                    }
                }
                else if ((a[key] !== b[key])
                    &&
                        !(this.transientOptions.transientDocumentMetadata[key])) {
                    return true;
                }
            }
            return false;
        }
        _isCellMetadataChanged(a, b) {
            const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
            for (const key of keys) {
                if ((a[key] !== b[key])
                    &&
                        !(this.transientOptions.transientCellMetadata[key])) {
                    return true;
                }
            }
            return false;
        }
        _customMetadataEqual(a, b) {
            if (!a && !b) {
                // both of them are nullish or undefined
                return true;
            }
            if (!a || !b) {
                return false;
            }
            const aProps = Object.getOwnPropertyNames(a);
            const bProps = Object.getOwnPropertyNames(b);
            if (aProps.length !== bProps.length) {
                return false;
            }
            for (let i = 0; i < aProps.length; i++) {
                const propName = aProps[i];
                if (a[propName] !== b[propName]) {
                    return false;
                }
            }
            return true;
        }
        _changeCellMetadataPartial(cell, metadata, computeUndoRedo) {
            const newMetadata = {
                ...cell.metadata
            };
            let k;
            for (k in metadata) {
                const value = metadata[k] ?? undefined;
                newMetadata[k] = value;
            }
            return this._changeCellMetadata(cell, newMetadata, computeUndoRedo);
        }
        _changeCellMetadata(cell, metadata, computeUndoRedo) {
            const triggerDirtyChange = this._isCellMetadataChanged(cell.metadata, metadata);
            if (triggerDirtyChange) {
                if (computeUndoRedo) {
                    const index = this._cells.indexOf(cell);
                    this._operationManager.pushEditOperation(new cellEdit_1.CellMetadataEdit(this.uri, index, Object.freeze(cell.metadata), Object.freeze(metadata), {
                        updateCellMetadata: (index, newMetadata) => {
                            const cell = this._cells[index];
                            if (!cell) {
                                return;
                            }
                            this._changeCellMetadata(cell, newMetadata, false);
                        }
                    }), undefined, undefined);
                }
            }
            // should be deferred
            cell.metadata = metadata;
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata, index: this._cells.indexOf(cell), metadata: cell.metadata, transient: !triggerDirtyChange }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _changeCellInternalMetadataPartial(cell, internalMetadata) {
            const newInternalMetadata = {
                ...cell.internalMetadata
            };
            let k;
            for (k in internalMetadata) {
                const value = internalMetadata[k] ?? undefined;
                newInternalMetadata[k] = value;
            }
            cell.internalMetadata = newInternalMetadata;
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellInternalMetadata, index: this._cells.indexOf(cell), internalMetadata: cell.internalMetadata, transient: true }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _changeCellLanguage(cell, languageId, computeUndoRedo) {
            if (cell.language === languageId) {
                return;
            }
            const oldLanguage = cell.language;
            cell.language = languageId;
            if (computeUndoRedo) {
                const that = this;
                this._operationManager.pushEditOperation(new class {
                    constructor() {
                        this.type = 0 /* UndoRedoElementType.Resource */;
                        this.label = 'Update Cell Language';
                        this.code = 'undoredo.notebooks.updateCellLanguage';
                    }
                    get resource() {
                        return that.uri;
                    }
                    undo() {
                        that._changeCellLanguage(cell, oldLanguage, false);
                    }
                    redo() {
                        that._changeCellLanguage(cell, languageId, false);
                    }
                }(), undefined, undefined);
            }
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellLanguage, index: this._cells.indexOf(cell), language: languageId, transient: false }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _spliceNotebookCellOutputs2(cell, outputs, computeUndoRedo) {
            if (outputs.length === 0 && cell.outputs.length === 0) {
                return;
            }
            if (outputs.length <= 1) {
                this._spliceNotebookCellOutputs(cell, { start: 0, deleteCount: cell.outputs.length, newOutputs: outputs.map(op => new notebookCellOutputTextModel_1.NotebookCellOutputTextModel(op)) }, false, computeUndoRedo);
                return;
            }
            const diff = new diff_1.LcsDiff(new OutputSequence(cell.outputs), new OutputSequence(outputs));
            const diffResult = diff.ComputeDiff(false);
            const splices = diffResult.changes.map(change => ({
                start: change.originalStart,
                deleteCount: change.originalLength,
                // create cell output text model only when it's inserted into the notebook document
                newOutputs: outputs.slice(change.modifiedStart, change.modifiedStart + change.modifiedLength).map(op => new notebookCellOutputTextModel_1.NotebookCellOutputTextModel(op))
            }));
            splices.reverse().forEach(splice => {
                this._spliceNotebookCellOutputs(cell, splice, false, computeUndoRedo);
            });
        }
        _spliceNotebookCellOutputs(cell, splice, append, computeUndoRedo) {
            cell.spliceNotebookCellOutputs(splice);
            this._pauseableEmitter.fire({
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.Output,
                        index: this._cells.indexOf(cell),
                        outputs: cell.outputs.map(output => output.asDto()) ?? [],
                        append,
                        transient: this.transientOptions.transientOutputs,
                    }],
                versionId: this.versionId,
                synchronous: true,
                endSelectionState: undefined
            });
        }
        _appendNotebookCellOutputItems(cell, outputId, items) {
            if (cell.changeOutputItems(outputId, true, items)) {
                this._pauseableEmitter.fire({
                    rawEvents: [{
                            kind: notebookCommon_1.NotebookCellsChangeType.OutputItem,
                            index: this._cells.indexOf(cell),
                            outputId: outputId,
                            outputItems: items,
                            append: true,
                            transient: this.transientOptions.transientOutputs
                        }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
            }
        }
        _replaceNotebookCellOutputItems(cell, outputId, items) {
            if (cell.changeOutputItems(outputId, false, items)) {
                this._pauseableEmitter.fire({
                    rawEvents: [{
                            kind: notebookCommon_1.NotebookCellsChangeType.OutputItem,
                            index: this._cells.indexOf(cell),
                            outputId: outputId,
                            outputItems: items,
                            append: false,
                            transient: this.transientOptions.transientOutputs
                        }],
                    versionId: this.versionId,
                    synchronous: true,
                    endSelectionState: undefined
                });
            }
        }
        _moveCellToIdx(index, length, newIdx, synchronous, pushedToUndoStack, beforeSelections, endSelections) {
            if (pushedToUndoStack) {
                this._operationManager.pushEditOperation(new cellEdit_1.MoveCellEdit(this.uri, index, length, newIdx, {
                    moveCell: (fromIndex, length, toIndex, beforeSelections, endSelections) => {
                        this._moveCellToIdx(fromIndex, length, toIndex, true, false, beforeSelections, endSelections);
                    },
                }, beforeSelections, endSelections), beforeSelections, endSelections);
            }
            this._assertIndex(index);
            this._assertIndex(newIdx);
            const cells = this._cells.splice(index, length);
            this._cells.splice(newIdx, 0, ...cells);
            this._pauseableEmitter.fire({
                rawEvents: [{ kind: notebookCommon_1.NotebookCellsChangeType.Move, index, length, newIdx, cells, transient: false }],
                versionId: this.versionId,
                synchronous: synchronous,
                endSelectionState: endSelections
            });
            return true;
        }
        _assertIndex(index) {
            if (this._indexIsInvalid(index)) {
                throw new Error(`model index out of range ${index}`);
            }
        }
        _indexIsInvalid(index) {
            return index < 0 || index >= this._cells.length;
        }
    };
    exports.NotebookTextModel = NotebookTextModel;
    exports.NotebookTextModel = NotebookTextModel = NotebookTextModel_1 = __decorate([
        __param(5, undoRedo_1.IUndoRedoService),
        __param(6, model_1.IModelService),
        __param(7, language_1.ILanguageService)
    ], NotebookTextModel);
    class OutputSequence {
        constructor(outputs) {
            this.outputs = outputs;
        }
        getElements() {
            return this.outputs.map(output => {
                return (0, hash_1.hash)(output.outputs.map(output => ({
                    mime: output.mime,
                    data: output.data
                })));
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tUZXh0TW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2NvbW1vbi9tb2RlbC9ub3RlYm9va1RleHRNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUJoRyxNQUFNLGNBQWM7UUFXbkIsWUFDVSxTQUE0QixFQUM1QixLQUFhLEVBQ2IsYUFBd0MsRUFDekMsaUJBQWtFLEVBQ2xFLGFBQXFELEVBQzdELGNBQTJDLEVBQzNDLHlCQUFpQztZQU54QixjQUFTLEdBQVQsU0FBUyxDQUFtQjtZQUM1QixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2Isa0JBQWEsR0FBYixhQUFhLENBQTJCO1lBQ3pDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBaUQ7WUFDbEUsa0JBQWEsR0FBYixhQUFhLENBQXdDO1lBYnJELFNBQUksR0FBRyxtQ0FBbUMsQ0FBQztZQUU1QyxnQkFBVyxHQUF1QixFQUFFLENBQUM7WUFDckMseUJBQW9CLEdBQWdDLFNBQVMsQ0FBQztZQUM5RCwwQkFBcUIsR0FBZ0MsU0FBUyxDQUFDO1lBYXRFLElBQUksQ0FBQyxJQUFJLHdDQUFnQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxjQUFjLENBQUM7WUFDM0MsSUFBSSxDQUFDLDBCQUEwQixHQUFHLHlCQUF5QixDQUFDO1lBQzVELElBQUksQ0FBQywyQkFBMkIsR0FBRyx5QkFBeUIsQ0FBQztRQUM5RCxDQUFDO1FBQ0QsSUFBSSxTQUFTO1lBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENB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
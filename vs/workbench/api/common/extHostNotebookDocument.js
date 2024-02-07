(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, network_1, uri_1, extHostTypeConverters, extHostTypes_1, notebookCommon) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookDocument = exports.ExtHostCell = void 0;
    class RawContentChangeEvent {
        constructor(start, deletedCount, deletedItems, items) {
            this.start = start;
            this.deletedCount = deletedCount;
            this.deletedItems = deletedItems;
            this.items = items;
        }
        asApiEvent() {
            return {
                range: new extHostTypes_1.NotebookRange(this.start, this.start + this.deletedCount),
                addedCells: this.items.map(cell => cell.apiCell),
                removedCells: this.deletedItems,
            };
        }
    }
    class ExtHostCell {
        static asModelAddData(notebook, cell) {
            return {
                EOL: cell.eol,
                lines: cell.source,
                languageId: cell.language,
                uri: cell.uri,
                isDirty: false,
                versionId: 1,
                notebook
            };
        }
        constructor(notebook, _extHostDocument, _cellData) {
            this.notebook = notebook;
            this._extHostDocument = _extHostDocument;
            this._cellData = _cellData;
            this.handle = _cellData.handle;
            this.uri = uri_1.URI.revive(_cellData.uri);
            this.cellKind = _cellData.cellKind;
            this._outputs = _cellData.outputs.map(extHostTypeConverters.NotebookCellOutput.to);
            this._internalMetadata = _cellData.internalMetadata ?? {};
            this._metadata = Object.freeze(_cellData.metadata ?? {});
            this._previousResult = Object.freeze(extHostTypeConverters.NotebookCellExecutionSummary.to(_cellData.internalMetadata ?? {}));
        }
        get internalMetadata() {
            return this._internalMetadata;
        }
        get apiCell() {
            if (!this._apiCell) {
                const that = this;
                const data = this._extHostDocument.getDocument(this.uri);
                if (!data) {
                    throw new Error(`MISSING extHostDocument for notebook cell: ${this.uri}`);
                }
                const apiCell = {
                    get index() { return that.notebook.getCellIndex(that); },
                    notebook: that.notebook.apiNotebook,
                    kind: extHostTypeConverters.NotebookCellKind.to(this._cellData.cellKind),
                    document: data.document,
                    get mime() { return that._mime; },
                    set mime(value) { that._mime = value; },
                    get outputs() { return that._outputs.slice(0); },
                    get metadata() { return that._metadata; },
                    get executionSummary() { return that._previousResult; }
                };
                this._apiCell = Object.freeze(apiCell);
            }
            return this._apiCell;
        }
        setOutputs(newOutputs) {
            this._outputs = newOutputs.map(extHostTypeConverters.NotebookCellOutput.to);
        }
        setOutputItems(outputId, append, newOutputItems) {
            const newItems = newOutputItems.map(extHostTypeConverters.NotebookCellOutputItem.to);
            const output = this._outputs.find(op => op.id === outputId);
            if (output) {
                if (!append) {
                    output.items.length = 0;
                }
                output.items.push(...newItems);
                if (output.items.length > 1 && output.items.every(item => notebookCommon.isTextStreamMime(item.mime))) {
                    // Look for the mimes in the items, and keep track of their order.
                    // Merge the streams into one output item, per mime type.
                    const mimeOutputs = new Map();
                    const mimeTypes = [];
                    output.items.forEach(item => {
                        let items;
                        if (mimeOutputs.has(item.mime)) {
                            items = mimeOutputs.get(item.mime);
                        }
                        else {
                            items = [];
                            mimeOutputs.set(item.mime, items);
                            mimeTypes.push(item.mime);
                        }
                        items.push(item.data);
                    });
                    output.items.length = 0;
                    mimeTypes.forEach(mime => {
                        const compressed = notebookCommon.compressOutputItemStreams(mimeOutputs.get(mime));
                        output.items.push({
                            mime,
                            data: compressed.data.buffer
                        });
                    });
                }
            }
        }
        setMetadata(newMetadata) {
            this._metadata = Object.freeze(newMetadata);
        }
        setInternalMetadata(newInternalMetadata) {
            this._internalMetadata = newInternalMetadata;
            this._previousResult = Object.freeze(extHostTypeConverters.NotebookCellExecutionSummary.to(newInternalMetadata));
        }
        setMime(newMime) {
        }
    }
    exports.ExtHostCell = ExtHostCell;
    class ExtHostNotebookDocument {
        static { this._handlePool = 0; }
        constructor(_proxy, _textDocumentsAndEditors, _textDocuments, uri, data) {
            this._proxy = _proxy;
            this._textDocumentsAndEditors = _textDocumentsAndEditors;
            this._textDocuments = _textDocuments;
            this.uri = uri;
            this.handle = ExtHostNotebookDocument._handlePool++;
            this._cells = [];
            this._versionId = 0;
            this._isDirty = false;
            this._disposed = false;
            this._notebookType = data.viewType;
            this._metadata = Object.freeze(data.metadata ?? Object.create(null));
            this._spliceNotebookCells([[0, 0, data.cells]], true /* init -> no event*/, undefined);
            this._versionId = data.versionId;
        }
        dispose() {
            this._disposed = true;
        }
        get versionId() {
            return this._versionId;
        }
        get apiNotebook() {
            if (!this._notebook) {
                const that = this;
                const apiObject = {
                    get uri() { return that.uri; },
                    get version() { return that._versionId; },
                    get notebookType() { return that._notebookType; },
                    get isDirty() { return that._isDirty; },
                    get isUntitled() { return that.uri.scheme === network_1.Schemas.untitled; },
                    get isClosed() { return that._disposed; },
                    get metadata() { return that._metadata; },
                    get cellCount() { return that._cells.length; },
                    cellAt(index) {
                        index = that._validateIndex(index);
                        return that._cells[index].apiCell;
                    },
                    getCells(range) {
                        const cells = range ? that._getCells(range) : that._cells;
                        return cells.map(cell => cell.apiCell);
                    },
                    save() {
                        return that._save();
                    }
                };
                this._notebook = Object.freeze(apiObject);
            }
            return this._notebook;
        }
        acceptDocumentPropertiesChanged(data) {
            if (data.metadata) {
                this._metadata = Object.freeze({ ...this._metadata, ...data.metadata });
            }
        }
        acceptDirty(isDirty) {
            this._isDirty = isDirty;
        }
        acceptModelChanged(event, isDirty, newMetadata) {
            this._versionId = event.versionId;
            this._isDirty = isDirty;
            this.acceptDocumentPropertiesChanged({ metadata: newMetadata });
            const result = {
                notebook: this.apiNotebook,
                metadata: newMetadata,
                cellChanges: [],
                contentChanges: [],
            };
            const relaxedCellChanges = [];
            // -- apply change and populate content changes
            for (const rawEvent of event.rawEvents) {
                if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ModelChange) {
                    this._spliceNotebookCells(rawEvent.changes, false, result.contentChanges);
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.Move) {
                    this._moveCells(rawEvent.index, rawEvent.length, rawEvent.newIdx, result.contentChanges);
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.Output) {
                    this._setCellOutputs(rawEvent.index, rawEvent.outputs);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, outputs: this._cells[rawEvent.index].apiCell.outputs });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.OutputItem) {
                    this._setCellOutputItems(rawEvent.index, rawEvent.outputId, rawEvent.append, rawEvent.outputItems);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, outputs: this._cells[rawEvent.index].apiCell.outputs });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellLanguage) {
                    this._changeCellLanguage(rawEvent.index, rawEvent.language);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, document: this._cells[rawEvent.index].apiCell.document });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellContent) {
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, document: this._cells[rawEvent.index].apiCell.document });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellMime) {
                    this._changeCellMime(rawEvent.index, rawEvent.mime);
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellMetadata) {
                    this._changeCellMetadata(rawEvent.index, rawEvent.metadata);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, metadata: this._cells[rawEvent.index].apiCell.metadata });
                }
                else if (rawEvent.kind === notebookCommon.NotebookCellsChangeType.ChangeCellInternalMetadata) {
                    this._changeCellInternalMetadata(rawEvent.index, rawEvent.internalMetadata);
                    relaxedCellChanges.push({ cell: this._cells[rawEvent.index].apiCell, executionSummary: this._cells[rawEvent.index].apiCell.executionSummary });
                }
            }
            // -- compact cellChanges
            const map = new Map();
            for (let i = 0; i < relaxedCellChanges.length; i++) {
                const relaxedCellChange = relaxedCellChanges[i];
                const existing = map.get(relaxedCellChange.cell);
                if (existing === undefined) {
                    const newLen = result.cellChanges.push({
                        document: undefined,
                        executionSummary: undefined,
                        metadata: undefined,
                        outputs: undefined,
                        ...relaxedCellChange,
                    });
                    map.set(relaxedCellChange.cell, newLen - 1);
                }
                else {
                    result.cellChanges[existing] = {
                        ...result.cellChanges[existing],
                        ...relaxedCellChange
                    };
                }
            }
            // Freeze event properties so handlers cannot accidentally modify them
            Object.freeze(result);
            Object.freeze(result.cellChanges);
            Object.freeze(result.contentChanges);
            return result;
        }
        _validateIndex(index) {
            index = index | 0;
            if (index < 0) {
                return 0;
            }
            else if (index >= this._cells.length) {
                return this._cells.length - 1;
            }
            else {
                return index;
            }
        }
        _validateRange(range) {
            let start = range.start | 0;
            let end = range.end | 0;
            if (start < 0) {
                start = 0;
            }
            if (end > this._cells.length) {
                end = this._cells.length;
            }
            return range.with({ start, end });
        }
        _getCells(range) {
            range = this._validateRange(range);
            const result = [];
            for (let i = range.start; i < range.end; i++) {
                result.push(this._cells[i]);
            }
            return result;
        }
        async _save() {
            if (this._disposed) {
                return Promise.reject(new Error('Notebook has been closed'));
            }
            return this._proxy.$trySaveNotebook(this.uri);
        }
        _spliceNotebookCells(splices, initialization, bucket) {
            if (this._disposed) {
                return;
            }
            const contentChangeEvents = [];
            const addedCellDocuments = [];
            const removedCellDocuments = [];
            splices.reverse().forEach(splice => {
                const cellDtos = splice[2];
                const newCells = cellDtos.map(cell => {
                    const extCell = new ExtHostCell(this, this._textDocumentsAndEditors, cell);
                    if (!initialization) {
                        addedCellDocuments.push(ExtHostCell.asModelAddData(this.apiNotebook, cell));
                    }
                    return extCell;
                });
                const changeEvent = new RawContentChangeEvent(splice[0], splice[1], [], newCells);
                const deletedItems = this._cells.splice(splice[0], splice[1], ...newCells);
                for (const cell of deletedItems) {
                    removedCellDocuments.push(cell.uri);
                    changeEvent.deletedItems.push(cell.apiCell);
                }
                contentChangeEvents.push(changeEvent);
            });
            this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
                addedDocuments: addedCellDocuments,
                removedDocuments: removedCellDocuments
            });
            if (bucket) {
                for (const changeEvent of contentChangeEvents) {
                    bucket.push(changeEvent.asApiEvent());
                }
            }
        }
        _moveCells(index, length, newIdx, bucket) {
            const cells = this._cells.splice(index, length);
            this._cells.splice(newIdx, 0, ...cells);
            const changes = [
                new RawContentChangeEvent(index, length, cells.map(c => c.apiCell), []),
                new RawContentChangeEvent(newIdx, 0, [], cells)
            ];
            for (const change of changes) {
                bucket.push(change.asApiEvent());
            }
        }
        _setCellOutputs(index, outputs) {
            const cell = this._cells[index];
            cell.setOutputs(outputs);
        }
        _setCellOutputItems(index, outputId, append, outputItems) {
            const cell = this._cells[index];
            cell.setOutputItems(outputId, append, outputItems);
        }
        _changeCellLanguage(index, newLanguageId) {
            const cell = this._cells[index];
            if (cell.apiCell.document.languageId !== newLanguageId) {
                this._textDocuments.$acceptModelLanguageChanged(cell.uri, newLanguageId);
            }
        }
        _changeCellMime(index, newMime) {
            const cell = this._cells[index];
            cell.apiCell.mime = newMime;
        }
        _changeCellMetadata(index, newMetadata) {
            const cell = this._cells[index];
            cell.setMetadata(newMetadata);
        }
        _changeCellInternalMetadata(index, newInternalMetadata) {
            const cell = this._cells[index];
            cell.setInternalMetadata(newInternalMetadata);
        }
        getCellFromApiCell(apiCell) {
            return this._cells.find(cell => cell.apiCell === apiCell);
        }
        getCellFromIndex(index) {
            return this._cells[index];
        }
        getCell(cellHandle) {
            return this._cells.find(cell => cell.handle === cellHandle);
        }
        getCellIndex(cell) {
            return this._cells.indexOf(cell);
        }
    }
    exports.ExtHostNotebookDocument = ExtHostNotebookDocument;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rRG9jdW1lbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3ROb3RlYm9va0RvY3VtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFNLHFCQUFxQjtRQUUxQixZQUNVLEtBQWEsRUFDYixZQUFvQixFQUNwQixZQUFtQyxFQUNuQyxLQUFvQjtZQUhwQixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsaUJBQVksR0FBWixZQUFZLENBQVE7WUFDcEIsaUJBQVksR0FBWixZQUFZLENBQXVCO1lBQ25DLFVBQUssR0FBTCxLQUFLLENBQWU7UUFDMUIsQ0FBQztRQUVMLFVBQVU7WUFDVCxPQUFPO2dCQUNOLEtBQUssRUFBRSxJQUFJLDRCQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ3BFLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQ2hELFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTthQUMvQixDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBRUQsTUFBYSxXQUFXO1FBRXZCLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBaUMsRUFBRSxJQUFxQztZQUM3RixPQUFPO2dCQUNOLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztnQkFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ2xCLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDekIsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO2dCQUNiLE9BQU8sRUFBRSxLQUFLO2dCQUNkLFNBQVMsRUFBRSxDQUFDO2dCQUNaLFFB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
//# sourceURL=../../../vs/workbench/api/common/extHostNotebookDocument.js
})
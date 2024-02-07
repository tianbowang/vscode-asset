/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/editor/common/core/selection", "vs/base/common/uri", "vs/editor/common/core/textChange", "vs/base/common/buffer", "vs/base/common/resources"], function (require, exports, nls, errors_1, selection_1, uri_1, textChange_1, buffer, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditStack = exports.isEditStackElement = exports.MultiModelEditStackElement = exports.SingleModelEditStackElement = exports.SingleModelEditStackData = void 0;
    function uriGetComparisonKey(resource) {
        return resource.toString();
    }
    class SingleModelEditStackData {
        static create(model, beforeCursorState) {
            const alternativeVersionId = model.getAlternativeVersionId();
            const eol = getModelEOL(model);
            return new SingleModelEditStackData(alternativeVersionId, alternativeVersionId, eol, eol, beforeCursorState, beforeCursorState, []);
        }
        constructor(beforeVersionId, afterVersionId, beforeEOL, afterEOL, beforeCursorState, afterCursorState, changes) {
            this.beforeVersionId = beforeVersionId;
            this.afterVersionId = afterVersionId;
            this.beforeEOL = beforeEOL;
            this.afterEOL = afterEOL;
            this.beforeCursorState = beforeCursorState;
            this.afterCursorState = afterCursorState;
            this.changes = changes;
        }
        append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
            if (textChanges.length > 0) {
                this.changes = (0, textChange_1.compressConsecutiveTextChanges)(this.changes, textChanges);
            }
            this.afterEOL = afterEOL;
            this.afterVersionId = afterVersionId;
            this.afterCursorState = afterCursorState;
        }
        static _writeSelectionsSize(selections) {
            return 4 + 4 * 4 * (selections ? selections.length : 0);
        }
        static _writeSelections(b, selections, offset) {
            buffer.writeUInt32BE(b, (selections ? selections.length : 0), offset);
            offset += 4;
            if (selections) {
                for (const selection of selections) {
                    buffer.writeUInt32BE(b, selection.selectionStartLineNumber, offset);
                    offset += 4;
                    buffer.writeUInt32BE(b, selection.selectionStartColumn, offset);
                    offset += 4;
                    buffer.writeUInt32BE(b, selection.positionLineNumber, offset);
                    offset += 4;
                    buffer.writeUInt32BE(b, selection.positionColumn, offset);
                    offset += 4;
                }
            }
            return offset;
        }
        static _readSelections(b, offset, dest) {
            const count = buffer.readUInt32BE(b, offset);
            offset += 4;
            for (let i = 0; i < count; i++) {
                const selectionStartLineNumber = buffer.readUInt32BE(b, offset);
                offset += 4;
                const selectionStartColumn = buffer.readUInt32BE(b, offset);
                offset += 4;
                const positionLineNumber = buffer.readUInt32BE(b, offset);
                offset += 4;
                const positionColumn = buffer.readUInt32BE(b, offset);
                offset += 4;
                dest.push(new selection_1.Selection(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn));
            }
            return offset;
        }
        serialize() {
            let necessarySize = (+4 // beforeVersionId
                + 4 // afterVersionId
                + 1 // beforeEOL
                + 1 // afterEOL
                + SingleModelEditStackData._writeSelectionsSize(this.beforeCursorState)
                + SingleModelEditStackData._writeSelectionsSize(this.afterCursorState)
                + 4 // change count
            );
            for (const change of this.changes) {
                necessarySize += change.writeSize();
            }
            const b = new Uint8Array(necessarySize);
            let offset = 0;
            buffer.writeUInt32BE(b, this.beforeVersionId, offset);
            offset += 4;
            buffer.writeUInt32BE(b, this.afterVersionId, offset);
            offset += 4;
            buffer.writeUInt8(b, this.beforeEOL, offset);
            offset += 1;
            buffer.writeUInt8(b, this.afterEOL, offset);
            offset += 1;
            offset = SingleModelEditStackData._writeSelections(b, this.beforeCursorState, offset);
            offset = SingleModelEditStackData._writeSelections(b, this.afterCursorState, offset);
            buffer.writeUInt32BE(b, this.changes.length, offset);
            offset += 4;
            for (const change of this.changes) {
                offset = change.write(b, offset);
            }
            return b.buffer;
        }
        static deserialize(source) {
            const b = new Uint8Array(source);
            let offset = 0;
            const beforeVersionId = buffer.readUInt32BE(b, offset);
            offset += 4;
            const afterVersionId = buffer.readUInt32BE(b, offset);
            offset += 4;
            const beforeEOL = buffer.readUInt8(b, offset);
            offset += 1;
            const afterEOL = buffer.readUInt8(b, offset);
            offset += 1;
            const beforeCursorState = [];
            offset = SingleModelEditStackData._readSelections(b, offset, beforeCursorState);
            const afterCursorState = [];
            offset = SingleModelEditStackData._readSelections(b, offset, afterCursorState);
            const changeCount = buffer.readUInt32BE(b, offset);
            offset += 4;
            const changes = [];
            for (let i = 0; i < changeCount; i++) {
                offset = textChange_1.TextChange.read(b, offset, changes);
            }
            return new SingleModelEditStackData(beforeVersionId, afterVersionId, beforeEOL, afterEOL, beforeCursorState, afterCursorState, changes);
        }
    }
    exports.SingleModelEditStackData = SingleModelEditStackData;
    class SingleModelEditStackElement {
        get type() {
            return 0 /* UndoRedoElementType.Resource */;
        }
        get resource() {
            if (uri_1.URI.isUri(this.model)) {
                return this.model;
            }
            return this.model.uri;
        }
        constructor(label, code, model, beforeCursorState) {
            this.label = label;
            this.code = code;
            this.model = model;
            this._data = SingleModelEditStackData.create(model, beforeCursorState);
        }
        toString() {
            const data = (this._data instanceof SingleModelEditStackData ? this._data : SingleModelEditStackData.deserialize(this._data));
            return data.changes.map(change => change.toString()).join(', ');
        }
        matchesResource(resource) {
            const uri = (uri_1.URI.isUri(this.model) ? this.model : this.model.uri);
            return (uri.toString() === resource.toString());
        }
        setModel(model) {
            this.model = model;
        }
        canAppend(model) {
            return (this.model === model && this._data instanceof SingleModelEditStackData);
        }
        append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
            if (this._data instanceof SingleModelEditStackData) {
                this._data.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
            }
        }
        close() {
            if (this._data instanceof SingleModelEditStackData) {
                this._data = this._data.serialize();
            }
        }
        open() {
            if (!(this._data instanceof SingleModelEditStackData)) {
                this._data = SingleModelEditStackData.deserialize(this._data);
            }
        }
        undo() {
            if (uri_1.URI.isUri(this.model)) {
                // don't have a model
                throw new Error(`Invalid SingleModelEditStackElement`);
            }
            if (this._data instanceof SingleModelEditStackData) {
                this._data = this._data.serialize();
            }
            const data = SingleModelEditStackData.deserialize(this._data);
            this.model._applyUndo(data.changes, data.beforeEOL, data.beforeVersionId, data.beforeCursorState);
        }
        redo() {
            if (uri_1.URI.isUri(this.model)) {
                // don't have a model
                throw new Error(`Invalid SingleModelEditStackElement`);
            }
            if (this._data instanceof SingleModelEditStackData) {
                this._data = this._data.serialize();
            }
            const data = SingleModelEditStackData.deserialize(this._data);
            this.model._applyRedo(data.changes, data.afterEOL, data.afterVersionId, data.afterCursorState);
        }
        heapSize() {
            if (this._data instanceof SingleModelEditStackData) {
                this._data = this._data.serialize();
            }
            return this._data.byteLength + 168 /*heap overhead*/;
        }
    }
    exports.SingleModelEditStackElement = SingleModelEditStackElement;
    class MultiModelEditStackElement {
        get resources() {
            return this._editStackElementsArr.map(editStackElement => editStackElement.resource);
        }
        constructor(label, code, editStackElements) {
            this.label = label;
            this.code = code;
            this.type = 1 /* UndoRedoElementType.Workspace */;
            this._isOpen = true;
            this._editStackElementsArr = editStackElements.slice(0);
            this._editStackElementsMap = new Map();
            for (const editStackElement of this._editStackElementsArr) {
                const key = uriGetComparisonKey(editStackElement.resource);
                this._editStackElementsMap.set(key, editStackElement);
            }
            this._delegate = null;
        }
        setDelegate(delegate) {
            this._delegate = delegate;
        }
        prepareUndoRedo() {
            if (this._delegate) {
                return this._delegate.prepareUndoRedo(this);
            }
        }
        getMissingModels() {
            const result = [];
            for (const editStackElement of this._editStackElementsArr) {
                if (uri_1.URI.isUri(editStackElement.model)) {
                    result.push(editStackElement.model);
                }
            }
            return result;
        }
        matchesResource(resource) {
            const key = uriGetComparisonKey(resource);
            return (this._editStackElementsMap.has(key));
        }
        setModel(model) {
            const key = uriGetComparisonKey(uri_1.URI.isUri(model) ? model : model.uri);
            if (this._editStackElementsMap.has(key)) {
                this._editStackElementsMap.get(key).setModel(model);
            }
        }
        canAppend(model) {
            if (!this._isOpen) {
                return false;
            }
            const key = uriGetComparisonKey(model.uri);
            if (this._editStackElementsMap.has(key)) {
                const editStackElement = this._editStackElementsMap.get(key);
                return editStackElement.canAppend(model);
            }
            return false;
        }
        append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
            const key = uriGetComparisonKey(model.uri);
            const editStackElement = this._editStackElementsMap.get(key);
            editStackElement.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
        }
        close() {
            this._isOpen = false;
        }
        open() {
            // cannot reopen
        }
        undo() {
            this._isOpen = false;
            for (const editStackElement of this._editStackElementsArr) {
                editStackElement.undo();
            }
        }
        redo() {
            for (const editStackElement of this._editStackElementsArr) {
                editStackElement.redo();
            }
        }
        heapSize(resource) {
            const key = uriGetComparisonKey(resource);
            if (this._editStackElementsMap.has(key)) {
                const editStackElement = this._editStackElementsMap.get(key);
                return editStackElement.heapSize();
            }
            return 0;
        }
        split() {
            return this._editStackElementsArr;
        }
        toString() {
            const result = [];
            for (const editStackElement of this._editStackElementsArr) {
                result.push(`${(0, resources_1.basename)(editStackElement.resource)}: ${editStackElement}`);
            }
            return `{${result.join(', ')}}`;
        }
    }
    exports.MultiModelEditStackElement = MultiModelEditStackElement;
    function getModelEOL(model) {
        const eol = model.getEOL();
        if (eol === '\n') {
            return 0 /* EndOfLineSequence.LF */;
        }
        else {
            return 1 /* EndOfLineSequence.CRLF */;
        }
    }
    function isEditStackElement(element) {
        if (!element) {
            return false;
        }
        return ((element instanceof SingleModelEditStackElement) || (element instanceof MultiModelEditStackElement));
    }
    exports.isEditStackElement = isEditStackElement;
    class EditStack {
        constructor(model, undoRedoService) {
            this._model = model;
            this._undoRedoService = undoRedoService;
        }
        pushStackElement() {
            const lastElement = this._undoRedoService.getLastElement(this._model.uri);
            if (isEditStackElement(lastElement)) {
                lastElement.close();
            }
        }
        popStackElement() {
            const lastElement = this._undoRedoService.getLastElement(this._model.uri);
            if (isEditStackElement(lastElement)) {
                lastElement.open();
            }
        }
        clear() {
            this._undoRedoService.removeElements(this._model.uri);
        }
        _getOrCreateEditStackElement(beforeCursorState, group) {
            const lastElement = this._undoRedoService.getLastElement(this._model.uri);
            if (isEditStackElement(lastElement) && lastElement.canAppend(this._model)) {
                return lastElement;
            }
            const newElement = new SingleModelEditStackElement(nls.localize('edit', "Typing"), 'undoredo.textBufferEdit', this._model, beforeCursorState);
            this._undoRedoService.pushElement(newElement, group);
            return newElement;
        }
        pushEOL(eol) {
            const editStackElement = this._getOrCreateEditStackElement(null, undefined);
            this._model.setEOL(eol);
            editStackElement.append(this._model, [], getModelEOL(this._model), this._model.getAlternativeVersionId(), null);
        }
        pushEditOperation(beforeCursorState, editOperations, cursorStateComputer, group) {
            const editStackElement = this._getOrCreateEditStackElement(beforeCursorState, group);
            const inverseEditOperations = this._model.applyEdits(editOperations, true);
            const afterCursorState = EditStack._computeCursorState(cursorStateComputer, inverseEditOperations);
            const textChanges = inverseEditOperations.map((op, index) => ({ index: index, textChange: op.textChange }));
            textChanges.sort((a, b) => {
                if (a.textChange.oldPosition === b.textChange.oldPosition) {
                    return a.index - b.index;
                }
                return a.textChange.oldPosition - b.textChange.oldPosition;
            });
            editStackElement.append(this._model, textChanges.map(op => op.textChange), getModelEOL(this._model), this._model.getAlternativeVersionId(), afterCursorState);
            return afterCursorState;
        }
        static _computeCursorState(cursorStateComputer, inverseEditOperations) {
            try {
                return cursorStateComputer ? cursorStateComputer(inverseEditOperations) : null;
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                return null;
            }
        }
    }
    exports.EditStack = EditStack;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFN0YWNrLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL2VkaXRTdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsU0FBUyxtQkFBbUIsQ0FBQyxRQUFhO1FBQ3pDLE9BQU8sUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxNQUFhLHdCQUF3QjtRQUU3QixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWlCLEVBQUUsaUJBQXFDO1lBQzVFLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDN0QsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLE9BQU8sSUFBSSx3QkFBd0IsQ0FDbEMsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixHQUFHLEVBQ0gsR0FBRyxFQUNILGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsRUFBRSxDQUNGLENBQUM7UUFDSCxDQUFDO1FBRUQsWUFDaUIsZUFBdUIsRUFDaEMsY0FBc0IsRUFDYixTQUE0QixFQUNyQyxRQUEyQixFQUNsQixpQkFBcUMsRUFDOUMsZ0JBQW9DLEVBQ3BDLE9BQXFCO1lBTlosb0JBQWUsR0FBZixlQUFlLENBQVE7WUFDaEMsbUJBQWMsR0FBZCxjQUFjLENBQVE7WUFDYixjQUFTLEdBQVQsU0FBUyxDQUFtQjtZQUNyQyxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUNsQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQzlDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBb0I7WUFDcEMsWUFBTyxHQUFQLE9BQU8sQ0FBYztRQUN6QixDQUFDO1FBRUUsTUFBTSxDQUFDLEtBQWlCLEVBQUUsV0FBeUIsRUFBRSxRQUEyQixFQUFFLGNBQXNCLEVBQUUsZ0JB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
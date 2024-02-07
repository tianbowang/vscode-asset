/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model/textModelSearch", "vs/workbench/contrib/codeEditor/browser/toggleWordWrap", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookOptions"], function (require, exports, event_1, lifecycle_1, mime_1, range_1, selection_1, textModelSearch_1, toggleWordWrap_1, notebookBrowser_1, notebookOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseCellViewModel = void 0;
    class BaseCellViewModel extends lifecycle_1.Disposable {
        get handle() {
            return this.model.handle;
        }
        get uri() {
            return this.model.uri;
        }
        get lineCount() {
            return this.model.textBuffer.getLineCount();
        }
        get metadata() {
            return this.model.metadata;
        }
        get internalMetadata() {
            return this.model.internalMetadata;
        }
        get language() {
            return this.model.language;
        }
        get mime() {
            if (typeof this.model.mime === 'string') {
                return this.model.mime;
            }
            switch (this.language) {
                case 'markdown':
                    return mime_1.Mimes.markdown;
                default:
                    return mime_1.Mimes.text;
            }
        }
        get lineNumbers() {
            return this._lineNumbers;
        }
        set lineNumbers(lineNumbers) {
            if (lineNumbers === this._lineNumbers) {
                return;
            }
            this._lineNumbers = lineNumbers;
            this._onDidChangeState.fire({ cellLineNumberChanged: true });
        }
        get focusMode() {
            return this._focusMode;
        }
        set focusMode(newMode) {
            if (this._focusMode !== newMode) {
                this._focusMode = newMode;
                this._onDidChangeState.fire({ focusModeChanged: true });
            }
        }
        get editorAttached() {
            return !!this._textEditor;
        }
        get textModel() {
            return this.model.textModel;
        }
        hasModel() {
            return !!this.textModel;
        }
        get dragging() {
            return this._dragging;
        }
        set dragging(v) {
            this._dragging = v;
            this._onDidChangeState.fire({ dragStateChanged: true });
        }
        get isInputCollapsed() {
            return this._inputCollapsed;
        }
        set isInputCollapsed(v) {
            this._inputCollapsed = v;
            this._onDidChangeState.fire({ inputCollapsedChanged: true });
        }
        get isOutputCollapsed() {
            return this._outputCollapsed;
        }
        set isOutputCollapsed(v) {
            this._outputCollapsed = v;
            this._onDidChangeState.fire({ outputCollapsedChanged: true });
        }
        constructor(viewType, model, id, _viewContext, _configurationService, _modelService, _undoRedoService, _codeEditorService) {
            super();
            this.viewType = viewType;
            this.model = model;
            this.id = id;
            this._viewContext = _viewContext;
            this._configurationService = _configurationService;
            this._modelService = _modelService;
            this._undoRedoService = _undoRedoService;
            this._codeEditorService = _codeEditorService;
            this._onDidChangeEditorAttachState = this._register(new event_1.Emitter());
            // Do not merge this event with `onDidChangeState` as we are using `Event.once(onDidChangeEditorAttachState)` elsewhere.
            this.onDidChangeEditorAttachState = this._onDidChangeEditorAttachState.event;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
            this._editState = notebookBrowser_1.CellEditState.Preview;
            this._lineNumbers = 'inherit';
            this._focusMode = notebookBrowser_1.CellFocusMode.Container;
            this._editorListeners = [];
            this._editorViewStates = null;
            this._editorTransientState = null;
            this._resolvedCellDecorations = new Map();
            this._cellDecorationsChanged = this._register(new event_1.Emitter());
            this.onCellDecorationsChanged = this._cellDecorationsChanged.event;
            this._resolvedDecorations = new Map();
            this._lastDecorationId = 0;
            this._cellStatusBarItems = new Map();
            this._onDidChangeCellStatusBarItems = this._register(new event_1.Emitter());
            this.onDidChangeCellStatusBarItems = this._onDidChangeCellStatusBarItems.event;
            this._lastStatusBarId = 0;
            this._dragging = false;
            this._inputCollapsed = false;
            this._outputCollapsed = false;
            this._isDisposed = false;
            this._editStateSource = '';
            this._register(model.onDidChangeMetadata(() => {
                this._onDidChangeState.fire({ metadataChanged: true });
            }));
            this._register(model.onDidChangeInternalMetadata(e => {
                this._onDidChangeState.fire({ internalMetadataChanged: true });
                if (e.lastRunSuccessChanged) {
                    // Statusbar visibility may change
                    this.layoutChange({});
                }
            }));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('notebook.lineNumbers')) {
                    this.lineNumbers = 'inherit';
                }
            }));
            if (this.model.collapseState?.inputCollapsed) {
                this._inputCollapsed = true;
            }
            if (this.model.collapseState?.outputCollapsed) {
                this._outputCollapsed = true;
            }
        }
        assertTextModelAttached() {
            if (this.textModel && this._textEditor && this._textEditor.getModel() === this.textModel) {
                return true;
            }
            return false;
        }
        // private handleKeyDown(e: IKeyboardEvent) {
        // 	if (this.viewType === IPYNB_VIEW_TYPE && isWindows && e.ctrlKey && e.keyCode === KeyCode.Enter) {
        // 		this._keymapService.promptKeymapRecommendation();
        // 	}
        // }
        attachTextEditor(editor, estimatedHasHorizontalScrolling) {
            if (!editor.hasModel()) {
                throw new Error('Invalid editor: model is missing');
            }
            if (this._textEditor === editor) {
                if (this._editorListeners.length === 0) {
                    this._editorListeners.push(this._textEditor.onDidChangeCursorSelection(() => { this._onDidChangeState.fire({ selectionChanged: true }); }));
                    // this._editorListeners.push(this._textEditor.onKeyDown(e => this.handleKeyDown(e)));
                    this._onDidChangeState.fire({ selectionChanged: true });
                }
                return;
            }
            this._textEditor = editor;
            if (this._editorViewStates) {
                this._restoreViewState(this._editorViewStates);
            }
            else {
                // If no real editor view state was persisted, restore a default state.
                // This forces the editor to measure its content width immediately.
                if (estimatedHasHorizontalScrolling) {
                    this._restoreViewState({
                        contributionsState: {},
                        cursorState: [],
                        viewState: {
                            scrollLeft: 0,
                            firstPosition: { lineNumber: 1, column: 1 },
                            firstPositionDeltaTop: (0, notebookOptions_1.getEditorTopPadding)()
                        }
                    });
                }
            }
            if (this._editorTransientState) {
                (0, toggleWordWrap_1.writeTransientState)(editor.getModel(), this._editorTransientState, this._codeEditorService);
            }
            this._textEditor?.changeDecorations((accessor) => {
                this._resolvedDecorations.forEach((value, key) => {
                    if (key.startsWith('_lazy_')) {
                        // lazy ones
                        const ret = accessor.addDecoration(value.options.range, value.options.options);
                        this._resolvedDecorations.get(key).id = ret;
                    }
                    else {
                        const ret = accessor.addDecoration(value.options.range, value.options.options);
                        this._resolvedDecorations.get(key).id = ret;
                    }
                });
            });
            this._editorListeners.push(this._textEditor.onDidChangeCursorSelection(() => { this._onDidChangeState.fire({ selectionChanged: true }); }));
            // this._editorListeners.push(this._textEditor.onKeyDown(e => this.handleKeyDown(e)));
            this._onDidChangeState.fire({ selectionChanged: true });
            this._onDidChangeEditorAttachState.fire();
        }
        detachTextEditor() {
            this.saveViewState();
            this.saveTransientState();
            // decorations need to be cleared first as editors can be resued.
            this._textEditor?.changeDecorations((accessor) => {
                this._resolvedDecorations.forEach(value => {
                    const resolvedid = value.id;
                    if (resolvedid) {
                        accessor.removeDecoration(resolvedid);
                    }
                });
            });
            this._textEditor = undefined;
            (0, lifecycle_1.dispose)(this._editorListeners);
            this._editorListeners = [];
            this._onDidChangeEditorAttachState.fire();
            if (this._textModelRef) {
                this._textModelRef.dispose();
                this._textModelRef = undefined;
            }
        }
        getText() {
            return this.model.getValue();
        }
        getTextLength() {
            return this.model.getTextLength();
        }
        saveViewState() {
            if (!this._textEditor) {
                return;
            }
            this._editorViewStates = this._textEditor.saveViewState();
        }
        saveTransientState() {
            if (!this._textEditor || !this._textEditor.hasModel()) {
                return;
            }
            this._editorTransientState = (0, toggleWordWrap_1.readTransientState)(this._textEditor.getModel(), this._codeEditorService);
        }
        saveEditorViewState() {
            if (this._textEditor) {
                this._editorViewStates = this._textEditor.saveViewState();
            }
            return this._editorViewStates;
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            this._editorViewStates = editorViewStates;
        }
        _restoreViewState(state) {
            if (state) {
                this._textEditor?.restoreViewState(state);
            }
        }
        addModelDecoration(decoration) {
            if (!this._textEditor) {
                const id = ++this._lastDecorationId;
                const decorationId = `_lazy_${this.id};${id}`;
                this._resolvedDecorations.set(decorationId, { options: decoration });
                return decorationId;
            }
            let id;
            this._textEditor.changeDecorations((accessor) => {
                id = accessor.addDecoration(decoration.range, decoration.options);
                this._resolvedDecorations.set(id, { id, options: decoration });
            });
            return id;
        }
        removeModelDecoration(decorationId) {
            const realDecorationId = this._resolvedDecorations.get(decorationId);
            if (this._textEditor && realDecorationId && realDecorationId.id !== undefined) {
                this._textEditor.changeDecorations((accessor) => {
                    accessor.removeDecoration(realDecorationId.id);
                });
            }
            // lastly, remove all the cache
            this._resolvedDecorations.delete(decorationId);
        }
        deltaModelDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                this.removeModelDecoration(id);
            });
            const ret = newDecorations.map(option => {
                return this.addModelDecoration(option);
            });
            return ret;
        }
        _removeCellDecoration(decorationId) {
            const options = this._resolvedCellDecorations.get(decorationId);
            this._resolvedCellDecorations.delete(decorationId);
            if (options) {
                for (const existingOptions of this._resolvedCellDecorations.values()) {
                    // don't remove decorations that are applied from other entries
                    if (options.className === existingOptions.className) {
                        options.className = undefined;
                    }
                    if (options.outputClassName === existingOptions.outputClassName) {
                        options.outputClassName = undefined;
                    }
                    if (options.gutterClassName === existingOptions.gutterClassName) {
                        options.gutterClassName = undefined;
                    }
                    if (options.topClassName === existingOptions.topClassName) {
                        options.topClassName = undefined;
                    }
                }
                this._cellDecorationsChanged.fire({ added: [], removed: [options] });
            }
        }
        _addCellDecoration(options) {
            const id = ++this._lastDecorationId;
            const decorationId = `_cell_${this.id};${id}`;
            this._resolvedCellDecorations.set(decorationId, options);
            this._cellDecorationsChanged.fire({ added: [options], removed: [] });
            return decorationId;
        }
        getCellDecorations() {
            return [...this._resolvedCellDecorations.values()];
        }
        getCellDecorationRange(decorationId) {
            if (this._textEditor) {
                // (this._textEditor as CodeEditorWidget).decora
                return this._textEditor.getModel()?.getDecorationRange(decorationId) ?? null;
            }
            return null;
        }
        deltaCellDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                this._removeCellDecoration(id);
            });
            const ret = newDecorations.map(option => {
                return this._addCellDecoration(option);
            });
            return ret;
        }
        deltaCellStatusBarItems(oldItems, newItems) {
            oldItems.forEach(id => {
                const item = this._cellStatusBarItems.get(id);
                if (item) {
                    this._cellStatusBarItems.delete(id);
                }
            });
            const newIds = newItems.map(item => {
                const id = ++this._lastStatusBarId;
                const itemId = `_cell_${this.id};${id}`;
                this._cellStatusBarItems.set(itemId, item);
                return itemId;
            });
            this._onDidChangeCellStatusBarItems.fire();
            return newIds;
        }
        getCellStatusBarItems() {
            return Array.from(this._cellStatusBarItems.values());
        }
        revealRangeInCenter(range) {
            this._textEditor?.revealRangeInCenter(range, 1 /* editorCommon.ScrollType.Immediate */);
        }
        setSelection(range) {
            this._textEditor?.setSelection(range);
        }
        setSelections(selections) {
            if (selections.length) {
                this._textEditor?.setSelections(selections);
            }
        }
        getSelections() {
            return this._textEditor?.getSelections() || [];
        }
        getSelectionsStartPosition() {
            if (this._textEditor) {
                const selections = this._textEditor.getSelections();
                return selections?.map(s => s.getStartPosition());
            }
            else {
                const selections = this._editorViewStates?.cursorState;
                return selections?.map(s => s.selectionStart);
            }
        }
        getLineScrollTopOffset(line) {
            if (!this._textEditor) {
                return 0;
            }
            const editorPadding = this._viewContext.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
            return this._textEditor.getTopForLineNumber(line) + editorPadding.top;
        }
        getPositionScrollTopOffset(range) {
            if (!this._textEditor) {
                return 0;
            }
            const position = range instanceof selection_1.Selection ? range.getPosition() : range.getStartPosition();
            const editorPadding = this._viewContext.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
            return this._textEditor.getTopForPosition(position.lineNumber, position.column) + editorPadding.top;
        }
        cursorAtLineBoundary() {
            if (!this._textEditor || !this.textModel || !this._textEditor.hasTextFocus()) {
                return notebookBrowser_1.CursorAtLineBoundary.None;
            }
            const selection = this._textEditor.getSelection();
            if (!selection || !selection.isEmpty()) {
                return notebookBrowser_1.CursorAtLineBoundary.None;
            }
            const currentLineLength = this.textModel.getLineLength(selection.startLineNumber);
            if (currentLineLength === 0) {
                return notebookBrowser_1.CursorAtLineBoundary.Both;
            }
            switch (selection.startColumn) {
                case 1:
                    return notebookBrowser_1.CursorAtLineBoundary.Start;
                case currentLineLength + 1:
                    return notebookBrowser_1.CursorAtLineBoundary.End;
                default:
                    return notebookBrowser_1.CursorAtLineBoundary.None;
            }
        }
        cursorAtBoundary() {
            if (!this._textEditor) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            if (!this.textModel) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            // only validate primary cursor
            const selection = this._textEditor.getSelection();
            // only validate empty cursor
            if (!selection || !selection.isEmpty()) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            const firstViewLineTop = this._textEditor.getTopForPosition(1, 1);
            const lastViewLineTop = this._textEditor.getTopForPosition(this.textModel.getLineCount(), this.textModel.getLineLength(this.textModel.getLineCount()));
            const selectionTop = this._textEditor.getTopForPosition(selection.startLineNumber, selection.startColumn);
            if (selectionTop === lastViewLineTop) {
                if (selectionTop === firstViewLineTop) {
                    return notebookBrowser_1.CursorAtBoundary.Both;
                }
                else {
                    return notebookBrowser_1.CursorAtBoundary.Bottom;
                }
            }
            else {
                if (selectionTop === firstViewLineTop) {
                    return notebookBrowser_1.CursorAtBoundary.Top;
                }
                else {
                    return notebookBrowser_1.CursorAtBoundary.None;
                }
            }
        }
        get editStateSource() {
            return this._editStateSource;
        }
        updateEditState(newState, source) {
            this._editStateSource = source;
            if (newState === this._editState) {
                return;
            }
            this._editState = newState;
            this._onDidChangeState.fire({ editStateChanged: true });
            if (this._editState === notebookBrowser_1.CellEditState.Preview) {
                this.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
        }
        getEditState() {
            return this._editState;
        }
        get textBuffer() {
            return this.model.textBuffer;
        }
        /**
         * Text model is used for editing.
         */
        async resolveTextModel() {
            if (!this._textModelRef || !this.textModel) {
                this._textModelRef = await this._modelService.createModelReference(this.uri);
                if (this._isDisposed) {
                    return this.textModel;
                }
                if (!this._textModelRef) {
                    throw new Error(`Cannot resolve text model for ${this.uri}`);
                }
                this._register(this.textModel.onDidChangeContent(() => this.onDidChangeTextModelContent()));
            }
            return this.textModel;
        }
        cellStartFind(value, options) {
            let cellMatches = [];
            if (this.assertTextModelAttached()) {
                cellMatches = this.textModel.findMatches(value, false, options.regex || false, options.caseSensitive || false, options.wholeWord ? options.wordSeparators || null : null, options.regex || false);
            }
            else {
                const lineCount = this.textBuffer.getLineCount();
                const fullRange = new range_1.Range(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
                const searchParams = new textModelSearch_1.SearchParams(value, options.regex || false, options.caseSensitive || false, options.wholeWord ? options.wordSeparators || null : null);
                const searchData = searchParams.parseSearchRequest();
                if (!searchData) {
                    return null;
                }
                cellMatches = this.textBuffer.findMatchesLineByLine(fullRange, searchData, options.regex || false, 1000);
            }
            return cellMatches;
        }
        dispose() {
            this._isDisposed = true;
            super.dispose();
            (0, lifecycle_1.dispose)(this._editorListeners);
            // Only remove the undo redo stack if we map this cell uri to itself
            // If we are not in perCell mode, it will map to the full NotebookDocument and
            // we don't want to remove that entire document undo / redo stack when a cell is deleted
            if (this._undoRedoService.getUriComparisonKey(this.uri) === this.uri.toString()) {
                this._undoRedoService.removeElements(this.uri);
            }
            this._textModelRef?.dispose();
        }
        toJSON() {
            return {
                handle: this.handle
            };
        }
    }
    exports.BaseCellViewModel = BaseCellViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUNlbGxWaWV3TW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlld01vZGVsL2Jhc2VDZWxsVmlld01vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXdCaEcsTUFBc0IsaUJBQWtCLFNBQVEsc0JBQVU7UUFRekQsSUFBSSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMxQixDQUFDO1FBQ0QsSUFBSSxHQUFHO1lBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxTQUFTO1lBQ1osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBQ0QsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUM1QixDQUFDO1FBQ0QsSUFBSSxnQkFBZ0I7WUFDbkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDO1FBQ3BDLENBQUM7UUFDRCxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFJLElBQUk7WUFDUCxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ3pDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDeEIsQ0FBQztZQUVELFFBQVEsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN2QixLQUFLLFVBQVU7b0JBQ2QsT0FBTyxZQUFLLENBQUMsUUFBUSxDQUFDO2dCQUV2QjtvQkFDQyxPQUFP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
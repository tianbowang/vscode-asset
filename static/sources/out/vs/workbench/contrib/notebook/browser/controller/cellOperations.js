/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages/modesRegistry", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/nls"], function (require, exports, bulkEditService_1, position_1, range_1, modesRegistry_1, bulkCellEdits_1, notebookBrowser_1, notebookCellTextModel_1, notebookCommon_1, notebookRange_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.insertCellAtIndex = exports.insertCell = exports.computeCellLinesContents = exports.joinCellsWithSurrounds = exports.joinNotebookCells = exports.joinSelectedCells = exports.copyCellRange = exports.moveCellRange = exports.runDeleteAction = exports.changeCellToKind = void 0;
    async function changeCellToKind(kind, context, language, mime) {
        const { notebookEditor } = context;
        if (!notebookEditor.hasModel()) {
            return;
        }
        if (notebookEditor.isReadOnly) {
            return;
        }
        if (context.ui && context.cell) {
            // action from UI
            const { cell } = context;
            if (cell.cellKind === kind) {
                return;
            }
            const text = cell.getText();
            const idx = notebookEditor.getCellIndex(cell);
            if (language === undefined) {
                const availableLanguages = notebookEditor.activeKernel?.supportedLanguages ?? [];
                language = availableLanguages[0] ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
            }
            notebookEditor.textModel.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: idx,
                    count: 1,
                    cells: [{
                            cellKind: kind,
                            source: text,
                            language: language,
                            mime: mime ?? cell.mime,
                            outputs: cell.model.outputs,
                            metadata: cell.metadata,
                        }]
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: notebookEditor.getFocus(),
                selections: notebookEditor.getSelections()
            }, () => {
                return {
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: notebookEditor.getFocus(),
                    selections: notebookEditor.getSelections()
                };
            }, undefined, true);
            const newCell = notebookEditor.cellAt(idx);
            await notebookEditor.focusNotebookCell(newCell, cell.getEditState() === notebookBrowser_1.CellEditState.Editing ? 'editor' : 'container');
        }
        else if (context.selectedCells) {
            const selectedCells = context.selectedCells;
            const rawEdits = [];
            selectedCells.forEach(cell => {
                if (cell.cellKind === kind) {
                    return;
                }
                const text = cell.getText();
                const idx = notebookEditor.getCellIndex(cell);
                if (language === undefined) {
                    const availableLanguages = notebookEditor.activeKernel?.supportedLanguages ?? [];
                    language = availableLanguages[0] ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
                }
                rawEdits.push({
                    editType: 1 /* CellEditType.Replace */,
                    index: idx,
                    count: 1,
                    cells: [{
                            cellKind: kind,
                            source: text,
                            language: language,
                            mime: mime ?? cell.mime,
                            outputs: cell.model.outputs,
                            metadata: cell.metadata,
                        }]
                });
            });
            notebookEditor.textModel.applyEdits(rawEdits, true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: notebookEditor.getFocus(),
                selections: notebookEditor.getSelections()
            }, () => {
                return {
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: notebookEditor.getFocus(),
                    selections: notebookEditor.getSelections()
                };
            }, undefined, true);
        }
    }
    exports.changeCellToKind = changeCellToKind;
    function runDeleteAction(editor, cell) {
        const textModel = editor.textModel;
        const selections = editor.getSelections();
        const targetCellIndex = editor.getCellIndex(cell);
        const containingSelection = selections.find(selection => selection.start <= targetCellIndex && targetCellIndex < selection.end);
        const computeUndoRedo = !editor.isReadOnly || textModel.viewType === 'interactive';
        if (containingSelection) {
            const edits = selections.reverse().map(selection => ({
                editType: 1 /* CellEditType.Replace */, index: selection.start, count: selection.end - selection.start, cells: []
            }));
            const nextCellAfterContainingSelection = containingSelection.end >= editor.getLength() ? undefined : editor.cellAt(containingSelection.end);
            textModel.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: editor.getSelections() }, () => {
                if (nextCellAfterContainingSelection) {
                    const cellIndex = textModel.cells.findIndex(cell => cell.handle === nextCellAfterContainingSelection.handle);
                    return { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: cellIndex, end: cellIndex + 1 }, selections: [{ start: cellIndex, end: cellIndex + 1 }] };
                }
                else {
                    if (textModel.length) {
                        const lastCellIndex = textModel.length - 1;
                        return { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: lastCellIndex, end: lastCellIndex + 1 }, selections: [{ start: lastCellIndex, end: lastCellIndex + 1 }] };
                    }
                    else {
                        return { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 0 }, selections: [{ start: 0, end: 0 }] };
                    }
                }
            }, undefined, computeUndoRedo);
        }
        else {
            const focus = editor.getFocus();
            const edits = [{
                    editType: 1 /* CellEditType.Replace */, index: targetCellIndex, count: 1, cells: []
                }];
            const finalSelections = [];
            for (let i = 0; i < selections.length; i++) {
                const selection = selections[i];
                if (selection.end <= targetCellIndex) {
                    finalSelections.push(selection);
                }
                else if (selection.start > targetCellIndex) {
                    finalSelections.push({ start: selection.start - 1, end: selection.end - 1 });
                }
                else {
                    finalSelections.push({ start: targetCellIndex, end: targetCellIndex + 1 });
                }
            }
            if (editor.cellAt(focus.start) === cell) {
                // focus is the target, focus is also not part of any selection
                const newFocus = focus.end === textModel.length ? { start: focus.start - 1, end: focus.end - 1 } : focus;
                textModel.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: editor.getSelections() }, () => ({
                    kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: finalSelections
                }), undefined, computeUndoRedo);
            }
            else {
                // users decide to delete a cell out of current focus/selection
                const newFocus = focus.start > targetCellIndex ? { start: focus.start - 1, end: focus.end - 1 } : focus;
                textModel.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: editor.getSelections() }, () => ({
                    kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: finalSelections
                }), undefined, computeUndoRedo);
            }
        }
    }
    exports.runDeleteAction = runDeleteAction;
    async function moveCellRange(context, direction) {
        if (!context.notebookEditor.hasModel()) {
            return;
        }
        const editor = context.notebookEditor;
        const textModel = editor.textModel;
        if (editor.isReadOnly) {
            return;
        }
        const selections = editor.getSelections();
        const modelRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(editor, selections);
        const range = modelRanges[0];
        if (!range || range.start === range.end) {
            return;
        }
        if (direction === 'up') {
            if (range.start === 0) {
                return;
            }
            const indexAbove = range.start - 1;
            const finalSelection = { start: range.start - 1, end: range.end - 1 };
            const focus = context.notebookEditor.getFocus();
            const newFocus = (0, notebookRange_1.cellRangeContains)(range, focus) ? { start: focus.start - 1, end: focus.end - 1 } : { start: range.start - 1, end: range.start };
            textModel.applyEdits([
                {
                    editType: 6 /* CellEditType.Move */,
                    index: indexAbove,
                    length: 1,
                    newIdx: range.end - 1
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: editor.getFocus(),
                selections: editor.getSelections()
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: [finalSelection] }), undefined, true);
            const focusRange = editor.getSelections()[0] ?? editor.getFocus();
            editor.revealCellRangeInView(focusRange);
        }
        else {
            if (range.end >= textModel.length) {
                return;
            }
            const indexBelow = range.end;
            const finalSelection = { start: range.start + 1, end: range.end + 1 };
            const focus = editor.getFocus();
            const newFocus = (0, notebookRange_1.cellRangeContains)(range, focus) ? { start: focus.start + 1, end: focus.end + 1 } : { start: range.start + 1, end: range.start + 2 };
            textModel.applyEdits([
                {
                    editType: 6 /* CellEditType.Move */,
                    index: indexBelow,
                    length: 1,
                    newIdx: range.start
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: editor.getFocus(),
                selections: editor.getSelections()
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: [finalSelection] }), undefined, true);
            const focusRange = editor.getSelections()[0] ?? editor.getFocus();
            editor.revealCellRangeInView(focusRange);
        }
    }
    exports.moveCellRange = moveCellRange;
    async function copyCellRange(context, direction) {
        const editor = context.notebookEditor;
        if (!editor.hasModel()) {
            return;
        }
        const textModel = editor.textModel;
        if (editor.isReadOnly) {
            return;
        }
        let range = undefined;
        if (context.ui) {
            const targetCell = context.cell;
            const targetCellIndex = editor.getCellIndex(targetCell);
            range = { start: targetCellIndex, end: targetCellIndex + 1 };
        }
        else {
            const selections = editor.getSelections();
            const modelRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(editor, selections);
            range = modelRanges[0];
        }
        if (!range || range.start === range.end) {
            return;
        }
        if (direction === 'up') {
            // insert up, without changing focus and selections
            const focus = editor.getFocus();
            const selections = editor.getSelections();
            textModel.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: range.end,
                    count: 0,
                    cells: (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(editor.cellAt(index).model))
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: focus, selections: selections }), undefined, true);
        }
        else {
            // insert down, move selections
            const focus = editor.getFocus();
            const selections = editor.getSelections();
            const newCells = (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(editor.cellAt(index).model));
            const countDelta = newCells.length;
            const newFocus = context.ui ? focus : { start: focus.start + countDelta, end: focus.end + countDelta };
            const newSelections = context.ui ? selections : [{ start: range.start + countDelta, end: range.end + countDelta }];
            textModel.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: range.end,
                    count: 0,
                    cells: (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(editor.cellAt(index).model))
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: newSelections }), undefined, true);
            const focusRange = editor.getSelections()[0] ?? editor.getFocus();
            editor.revealCellRangeInView(focusRange);
        }
    }
    exports.copyCellRange = copyCellRange;
    async function joinSelectedCells(bulkEditService, notificationService, context) {
        const editor = context.notebookEditor;
        if (editor.isReadOnly) {
            return;
        }
        const edits = [];
        const cells = [];
        for (const selection of editor.getSelections()) {
            cells.push(...editor.getCellsInRange(selection));
        }
        if (cells.length <= 1) {
            return;
        }
        // check if all cells are of the same kind
        const cellKind = cells[0].cellKind;
        const isSameKind = cells.every(cell => cell.cellKind === cellKind);
        if (!isSameKind) {
            // cannot join cells of different kinds
            // show warning and quit
            const message = (0, nls_1.localize)('notebookActions.joinSelectedCells', "Cannot join cells of different kinds");
            return notificationService.warn(message);
        }
        // merge all cells content into first cell
        const firstCell = cells[0];
        const insertContent = cells.map(cell => cell.getText()).join(firstCell.textBuffer.getEOL());
        const firstSelection = editor.getSelections()[0];
        edits.push(new bulkCellEdits_1.ResourceNotebookCellEdit(editor.textModel.uri, {
            editType: 1 /* CellEditType.Replace */,
            index: firstSelection.start,
            count: firstSelection.end - firstSelection.start,
            cells: [{
                    cellKind: firstCell.cellKind,
                    source: insertContent,
                    language: firstCell.language,
                    mime: firstCell.mime,
                    outputs: firstCell.model.outputs,
                    metadata: firstCell.metadata,
                }]
        }));
        for (const selection of editor.getSelections().slice(1)) {
            edits.push(new bulkCellEdits_1.ResourceNotebookCellEdit(editor.textModel.uri, {
                editType: 1 /* CellEditType.Replace */,
                index: selection.start,
                count: selection.end - selection.start,
                cells: []
            }));
        }
        if (edits.length) {
            await bulkEditService.apply(edits, { quotableLabel: (0, nls_1.localize)('notebookActions.joinSelectedCells.label', "Join Notebook Cells") });
        }
    }
    exports.joinSelectedCells = joinSelectedCells;
    async function joinNotebookCells(editor, range, direction, constraint) {
        if (editor.isReadOnly) {
            return null;
        }
        const textModel = editor.textModel;
        const cells = editor.getCellsInRange(range);
        if (!cells.length) {
            return null;
        }
        if (range.start === 0 && direction === 'above') {
            return null;
        }
        if (range.end === textModel.length && direction === 'below') {
            return null;
        }
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (constraint && cell.cellKind !== constraint) {
                return null;
            }
        }
        if (direction === 'above') {
            const above = editor.cellAt(range.start - 1);
            if (constraint && above.cellKind !== constraint) {
                return null;
            }
            const insertContent = cells.map(cell => (cell.textBuffer.getEOL() ?? '') + cell.getText()).join('');
            const aboveCellLineCount = above.textBuffer.getLineCount();
            const aboveCellLastLineEndColumn = above.textBuffer.getLineLength(aboveCellLineCount);
            return {
                edits: [
                    new bulkEditService_1.ResourceTextEdit(above.uri, { range: new range_1.Range(aboveCellLineCount, aboveCellLastLineEndColumn + 1, aboveCellLineCount, aboveCellLastLineEndColumn + 1), text: insertContent }),
                    new bulkCellEdits_1.ResourceNotebookCellEdit(textModel.uri, {
                        editType: 1 /* CellEditType.Replace */,
                        index: range.start,
                        count: range.end - range.start,
                        cells: []
                    })
                ],
                cell: above,
                endFocus: { start: range.start - 1, end: range.start },
                endSelections: [{ start: range.start - 1, end: range.start }]
            };
        }
        else {
            const below = editor.cellAt(range.end);
            if (constraint && below.cellKind !== constraint) {
                return null;
            }
            const cell = cells[0];
            const restCells = [...cells.slice(1), below];
            const insertContent = restCells.map(cl => (cl.textBuffer.getEOL() ?? '') + cl.getText()).join('');
            const cellLineCount = cell.textBuffer.getLineCount();
            const cellLastLineEndColumn = cell.textBuffer.getLineLength(cellLineCount);
            return {
                edits: [
                    new bulkEditService_1.ResourceTextEdit(cell.uri, { range: new range_1.Range(cellLineCount, cellLastLineEndColumn + 1, cellLineCount, cellLastLineEndColumn + 1), text: insertContent }),
                    new bulkCellEdits_1.ResourceNotebookCellEdit(textModel.uri, {
                        editType: 1 /* CellEditType.Replace */,
                        index: range.start + 1,
                        count: range.end - range.start,
                        cells: []
                    })
                ],
                cell,
                endFocus: { start: range.start, end: range.start + 1 },
                endSelections: [{ start: range.start, end: range.start + 1 }]
            };
        }
    }
    exports.joinNotebookCells = joinNotebookCells;
    async function joinCellsWithSurrounds(bulkEditService, context, direction) {
        const editor = context.notebookEditor;
        const textModel = editor.textModel;
        const viewModel = editor.getViewModel();
        let ret = null;
        if (context.ui) {
            const focusMode = context.cell.focusMode;
            const cellIndex = editor.getCellIndex(context.cell);
            ret = await joinNotebookCells(editor, { start: cellIndex, end: cellIndex + 1 }, direction);
            if (!ret) {
                return;
            }
            await bulkEditService.apply(ret?.edits, { quotableLabel: 'Join Notebook Cells' });
            viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: ret.endFocus, selections: ret.endSelections });
            ret.cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'joinCellsWithSurrounds');
            editor.revealCellRangeInView(editor.getFocus());
            if (focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                ret.cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
            }
        }
        else {
            const selections = editor.getSelections();
            if (!selections.length) {
                return;
            }
            const focus = editor.getFocus();
            const focusMode = editor.cellAt(focus.start)?.focusMode;
            const edits = [];
            let cell = null;
            const cells = [];
            for (let i = selections.length - 1; i >= 0; i--) {
                const selection = selections[i];
                const containFocus = (0, notebookRange_1.cellRangeContains)(selection, focus);
                if (selection.end >= textModel.length && direction === 'below'
                    || selection.start === 0 && direction === 'above') {
                    if (containFocus) {
                        cell = editor.cellAt(focus.start);
                    }
                    cells.push(...editor.getCellsInRange(selection));
                    continue;
                }
                const singleRet = await joinNotebookCells(editor, selection, direction);
                if (!singleRet) {
                    return;
                }
                edits.push(...singleRet.edits);
                cells.push(singleRet.cell);
                if (containFocus) {
                    cell = singleRet.cell;
                }
            }
            if (!edits.length) {
                return;
            }
            if (!cell || !cells.length) {
                return;
            }
            await bulkEditService.apply(edits, { quotableLabel: 'Join Notebook Cells' });
            cells.forEach(cell => {
                cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'joinCellsWithSurrounds');
            });
            viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Handle, primary: cell.handle, selections: cells.map(cell => cell.handle) });
            editor.revealCellRangeInView(editor.getFocus());
            const newFocusedCell = editor.cellAt(editor.getFocus().start);
            if (focusMode === notebookBrowser_1.CellFocusMode.Editor && newFocusedCell) {
                newFocusedCell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
            }
        }
    }
    exports.joinCellsWithSurrounds = joinCellsWithSurrounds;
    function _splitPointsToBoundaries(splitPoints, textBuffer) {
        const boundaries = [];
        const lineCnt = textBuffer.getLineCount();
        const getLineLen = (lineNumber) => {
            return textBuffer.getLineLength(lineNumber);
        };
        // split points need to be sorted
        splitPoints = splitPoints.sort((l, r) => {
            const lineDiff = l.lineNumber - r.lineNumber;
            const columnDiff = l.column - r.column;
            return lineDiff !== 0 ? lineDiff : columnDiff;
        });
        for (let sp of splitPoints) {
            if (getLineLen(sp.lineNumber) + 1 === sp.column && sp.column !== 1 /** empty line */ && sp.lineNumber < lineCnt) {
                sp = new position_1.Position(sp.lineNumber + 1, 1);
            }
            _pushIfAbsent(boundaries, sp);
        }
        if (boundaries.length === 0) {
            return null;
        }
        // boundaries already sorted and not empty
        const modelStart = new position_1.Position(1, 1);
        const modelEnd = new position_1.Position(lineCnt, getLineLen(lineCnt) + 1);
        return [modelStart, ...boundaries, modelEnd];
    }
    function _pushIfAbsent(positions, p) {
        const last = positions.length > 0 ? positions[positions.length - 1] : undefined;
        if (!last || last.lineNumber !== p.lineNumber || last.column !== p.column) {
            positions.push(p);
        }
    }
    function computeCellLinesContents(cell, splitPoints) {
        const rangeBoundaries = _splitPointsToBoundaries(splitPoints, cell.textBuffer);
        if (!rangeBoundaries) {
            return null;
        }
        const newLineModels = [];
        for (let i = 1; i < rangeBoundaries.length; i++) {
            const start = rangeBoundaries[i - 1];
            const end = rangeBoundaries[i];
            newLineModels.push(cell.textBuffer.getValueInRange(new range_1.Range(start.lineNumber, start.column, end.lineNumber, end.column), 0 /* EndOfLinePreference.TextDefined */));
        }
        return newLineModels;
    }
    exports.computeCellLinesContents = computeCellLinesContents;
    function insertCell(languageService, editor, index, type, direction = 'above', initialText = '', ui = false) {
        const viewModel = editor.getViewModel();
        const activeKernel = editor.activeKernel;
        if (viewModel.options.isReadOnly) {
            return null;
        }
        const cell = editor.cellAt(index);
        const nextIndex = ui ? viewModel.getNextVisibleCellIndex(index) : index + 1;
        let language;
        if (type === notebookCommon_1.CellKind.Code) {
            const supportedLanguages = activeKernel?.supportedLanguages ?? languageService.getRegisteredLanguageIds();
            const defaultLanguage = supportedLanguages[0] || modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
            if (cell?.cellKind === notebookCommon_1.CellKind.Code) {
                language = cell.language;
            }
            else if (cell?.cellKind === notebookCommon_1.CellKind.Markup) {
                const nearestCodeCellIndex = viewModel.nearestCodeCellIndex(index);
                if (nearestCodeCellIndex > -1) {
                    language = viewModel.cellAt(nearestCodeCellIndex).language;
                }
                else {
                    language = defaultLanguage;
                }
            }
            else {
                if (cell === undefined && direction === 'above') {
                    // insert cell at the very top
                    language = viewModel.viewCells.find(cell => cell.cellKind === notebookCommon_1.CellKind.Code)?.language || defaultLanguage;
                }
                else {
                    language = defaultLanguage;
                }
            }
            if (!supportedLanguages.includes(language)) {
                // the language no longer exists
                language = defaultLanguage;
            }
        }
        else {
            language = 'markdown';
        }
        const insertIndex = cell ?
            (direction === 'above' ? index : nextIndex) :
            index;
        return insertCellAtIndex(viewModel, insertIndex, initialText, language, type, undefined, [], true, true);
    }
    exports.insertCell = insertCell;
    function insertCellAtIndex(viewModel, index, source, language, type, metadata, outputs, synchronous, pushUndoStop) {
        const endSelections = { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: index, end: index + 1 }, selections: [{ start: index, end: index + 1 }] };
        viewModel.notebookDocument.applyEdits([
            {
                editType: 1 /* CellEditType.Replace */,
                index,
                count: 0,
                cells: [
                    {
                        cellKind: type,
                        language: language,
                        mime: undefined,
                        outputs: outputs,
                        metadata: metadata,
                        source: source
                    }
                ]
            }
        ], synchronous, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: viewModel.getSelections() }, () => endSelections, undefined, pushUndoStop && !viewModel.options.isReadOnly);
        return viewModel.cellAt(index);
    }
    exports.insertCellAtIndex = insertCellAtIndex;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbE9wZXJhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJvbGxlci9jZWxsT3BlcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQnpGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxJQUFjLEVBQUUsT0FBK0IsRUFBRSxRQUFpQixFQUFFLElBQWE7UUFDdkgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7WUFDaEMsT0FBTztRQUNSLENBQUM7UUFFRCxJQUFJLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMvQixPQUFPO1FBQ1IsQ0FBQztRQUVELElBQUksT0FBTyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEMsaUJBQWlCO1lBQ2pCLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUM7WUFFekIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUM1QixPQUFPO1lBQ1IsQ0FBQztZQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixNQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTlDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUM1QixNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLElBQUksRUFBRSxDQUFDO2dCQUNqRixRQUFRLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLElBQUkscUNBQXFCLENBQUM7WUFDM0QsQ0FBQztZQUVE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
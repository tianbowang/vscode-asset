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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/list", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/common/model/prefixSumComputer", "vs/platform/configuration/common/configuration", "vs/platform/list/browser/listService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/base/common/numbers", "vs/base/browser/fastDomNode", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/view/notebookCellListView", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/browser/view/notebookCellAnchor"], function (require, exports, DOM, list_1, event_1, lifecycle_1, platform_1, prefixSumComputer_1, configuration_1, listService_1, notebookBrowser_1, notebookCommon_1, notebookRange_1, notebookContextKeys_1, numbers_1, fastDomNode_1, markupCellViewModel_1, instantiation_1, notebookCellListView_1, notebookExecutionStateService_1, notebookCellAnchor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListViewInfoAccessor = exports.NotebookCellList = exports.NOTEBOOK_WEBVIEW_BOUNDARY = void 0;
    var CellRevealPosition;
    (function (CellRevealPosition) {
        CellRevealPosition[CellRevealPosition["Top"] = 0] = "Top";
        CellRevealPosition[CellRevealPosition["Center"] = 1] = "Center";
        CellRevealPosition[CellRevealPosition["Bottom"] = 2] = "Bottom";
        CellRevealPosition[CellRevealPosition["NearTop"] = 3] = "NearTop";
    })(CellRevealPosition || (CellRevealPosition = {}));
    function getVisibleCells(cells, hiddenRanges) {
        if (!hiddenRanges.length) {
            return cells;
        }
        let start = 0;
        let hiddenRangeIndex = 0;
        const result = [];
        while (start < cells.length && hiddenRangeIndex < hiddenRanges.length) {
            if (start < hiddenRanges[hiddenRangeIndex].start) {
                result.push(...cells.slice(start, hiddenRanges[hiddenRangeIndex].start));
            }
            start = hiddenRanges[hiddenRangeIndex].end + 1;
            hiddenRangeIndex++;
        }
        if (start < cells.length) {
            result.push(...cells.slice(start));
        }
        return result;
    }
    exports.NOTEBOOK_WEBVIEW_BOUNDARY = 5000;
    function validateWebviewBoundary(element) {
        const webviewTop = 0 - (parseInt(element.style.top, 10) || 0);
        return webviewTop >= 0 && webviewTop <= exports.NOTEBOOK_WEBVIEW_BOUNDARY * 2;
    }
    let NotebookCellList = class NotebookCellList extends listService_1.WorkbenchList {
        get onWillScroll() { return this.view.onWillScroll; }
        get rowsContainer() {
            return this.view.containerDomNode;
        }
        get scrollableElement() {
            return this.view.scrollableElementDomNode;
        }
        get viewModel() {
            return this._viewModel;
        }
        get visibleRanges() {
            return this._visibleRanges;
        }
        set visibleRanges(ranges) {
            if ((0, notebookRange_1.cellRangesEqual)(this._visibleRanges, ranges)) {
                return;
            }
            this._visibleRanges = ranges;
            this._onDidChangeVisibleRanges.fire();
        }
        get isDisposed() {
            return this._isDisposed;
        }
        get webviewElement() {
            return this._webviewElement;
        }
        get inRenderingTransaction() {
            return this.view.inRenderingTransaction;
        }
        constructor(listUser, container, notebookOptions, delegate, renderers, contextKeyService, options, listService, configurationService, instantiationService, notebookExecutionStateService) {
            super(listUser, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService);
            this.listUser = listUser;
            this.notebookOptions = notebookOptions;
            this._previousFocusedElements = [];
            this._localDisposableStore = new lifecycle_1.DisposableStore();
            this._viewModelStore = new lifecycle_1.DisposableStore();
            this._onDidRemoveOutputs = this._localDisposableStore.add(new event_1.Emitter());
            this.onDidRemoveOutputs = this._onDidRemoveOutputs.event;
            this._onDidHideOutputs = this._localDisposableStore.add(new event_1.Emitter());
            this.onDidHideOutputs = this._onDidHideOutputs.event;
            this._onDidRemoveCellsFromView = this._localDisposableStore.add(new event_1.Emitter());
            this.onDidRemoveCellsFromView = this._onDidRemoveCellsFromView.event;
            this._viewModel = null;
            this._hiddenRangeIds = [];
            this.hiddenRangesPrefixSum = null;
            this._onDidChangeVisibleRanges = this._localDisposableStore.add(new event_1.Emitter());
            this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
            this._visibleRanges = [];
            this._isDisposed = false;
            this._isInLayout = false;
            this._webviewElement = null;
            notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED.bindTo(this.contextKeyService).set(true);
            this._previousFocusedElements = this.getFocusedElements();
            this._localDisposableStore.add(this.onDidChangeFocus((e) => {
                this._previousFocusedElements.forEach(element => {
                    if (e.elements.indexOf(element) < 0) {
                        element.onDeselect();
                    }
                });
                this._previousFocusedElements = e.elements;
            }));
            const notebookEditorCursorAtBoundaryContext = notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.bindTo(contextKeyService);
            notebookEditorCursorAtBoundaryContext.set('none');
            const notebookEditorCursorAtLineBoundaryContext = notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY.bindTo(contextKeyService);
            notebookEditorCursorAtLineBoundaryContext.set('none');
            const cursorSelectionListener = this._localDisposableStore.add(new lifecycle_1.MutableDisposable());
            const textEditorAttachListener = this._localDisposableStore.add(new lifecycle_1.MutableDisposable());
            this._notebookCellAnchor = new notebookCellAnchor_1.NotebookCellAnchor(notebookExecutionStateService, configurationService, this.onDidScroll);
            const recomputeContext = (element) => {
                switch (element.cursorAtBoundary()) {
                    case notebookBrowser_1.CursorAtBoundary.Both:
                        notebookEditorCursorAtBoundaryContext.set('both');
                        break;
                    case notebookBrowser_1.CursorAtBoundary.Top:
                        notebookEditorCursorAtBoundaryContext.set('top');
                        break;
                    case notebookBrowser_1.CursorAtBoundary.Bottom:
                        notebookEditorCursorAtBoundaryContext.set('bottom');
                        break;
                    default:
                        notebookEditorCursorAtBoundaryContext.set('none');
                        break;
                }
                switch (element.cursorAtLineBoundary()) {
                    case notebookBrowser_1.CursorAtLineBoundary.Both:
                        notebookEditorCursorAtLineBoundaryContext.set('both');
                        break;
                    case notebookBrowser_1.CursorAtLineBoundary.Start:
                        notebookEditorCursorAtLineBoundaryContext.set('start');
                        break;
                    case notebookBrowser_1.CursorAtLineBoundary.End:
                        notebookEditorCursorAtLineBoundaryContext.set('end');
                        break;
                    default:
                        notebookEditorCursorAtLineBoundaryContext.set('none');
                        break;
                }
                return;
            };
            // Cursor Boundary context
            this._localDisposableStore.add(this.onDidChangeFocus((e) => {
                if (e.elements.length) {
                    // we only validate the first focused element
                    const focusedElement = e.elements[0];
                    cursorSelectionListener.value = focusedElement.onDidChangeState((e) => {
                        if (e.selectionChanged) {
                            recomputeContext(focusedElement);
                        }
                    });
                    textEditorAttachListener.value = focusedElement.onDidChangeEditorAttachState(() => {
                        if (focusedElement.editorAttached) {
                            recomputeContext(focusedElement);
                        }
                    });
                    recomputeContext(focusedElement);
                    return;
                }
                // reset context
                notebookEditorCursorAtBoundaryContext.set('none');
            }));
            this._localDisposableStore.add(this.view.onMouseDblClick(() => {
                const focus = this.getFocusedElements()[0];
                if (focus && focus.cellKind === notebookCommon_1.CellKind.Markup && !focus.isInputCollapsed && !this._viewModel?.options.isReadOnly) {
                    // scroll the cell into view if out of viewport
                    const focusedCellIndex = this._getViewIndexUpperBound(focus);
                    if (focusedCellIndex >= 0) {
                        this._revealInViewWithMinimalScrolling(focusedCellIndex);
                    }
                    focus.updateEditState(notebookBrowser_1.CellEditState.Editing, 'dbclick');
                    focus.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                }
            }));
            // update visibleRanges
            const updateVisibleRanges = () => {
                if (!this.view.length) {
                    return;
                }
                const top = this.getViewScrollTop();
                const bottom = this.getViewScrollBottom();
                if (top >= bottom) {
                    return;
                }
                const topViewIndex = (0, numbers_1.clamp)(this.view.indexAt(top), 0, this.view.length - 1);
                const topElement = this.view.element(topViewIndex);
                const topModelIndex = this._viewModel.getCellIndex(topElement);
                const bottomViewIndex = (0, numbers_1.clamp)(this.view.indexAt(bottom), 0, this.view.length - 1);
                const bottomElement = this.view.element(bottomViewIndex);
                const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
                if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                    this.visibleRanges = [{ start: topModelIndex, end: bottomModelIndex + 1 }];
                }
                else {
                    this.visibleRanges = this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
                }
            };
            this._localDisposableStore.add(this.view.onDidChangeContentHeight(() => {
                if (this._isInLayout) {
                    DOM.scheduleAtNextAnimationFrame(DOM.getWindow(container), () => {
                        updateVisibleRanges();
                    });
                }
                updateVisibleRanges();
            }));
            this._localDisposableStore.add(this.view.onDidScroll(() => {
                if (this._isInLayout) {
                    DOM.scheduleAtNextAnimationFrame(DOM.getWindow(container), () => {
                        updateVisibleRanges();
                    });
                }
                updateVisibleRanges();
            }));
        }
        createListView(container, virtualDelegate, renderers, viewOptions) {
            return new notebookCellListView_1.NotebookCellListView(container, virtualDelegate, renderers, viewOptions);
        }
        attachWebview(element) {
            element.style.top = `-${exports.NOTEBOOK_WEBVIEW_BOUNDARY}px`;
            this.rowsContainer.insertAdjacentElement('afterbegin', element);
            this._webviewElement = new fastDomNode_1.FastDomNode(element);
        }
        elementAt(position) {
            if (!this.view.length) {
                return undefined;
            }
            const idx = this.view.indexAt(position);
            const clamped = (0, numbers_1.clamp)(idx, 0, this.view.length - 1);
            return this.element(clamped);
        }
        elementHeight(element) {
            const index = this._getViewIndexUpperBound(element);
            if (index === undefined || index < 0 || index >= this.length) {
                this._getViewIndexUpperBound(element);
                throw new list_1.ListError(this.listUser, `Invalid index ${index}`);
            }
            return this.view.elementHeight(index);
        }
        detachViewModel() {
            this._viewModelStore.clear();
            this._viewModel = null;
            this.hiddenRangesPrefixSum = null;
        }
        attachViewModel(model) {
            this._viewModel = model;
            this._viewModelStore.add(model.onDidChangeViewCells((e) => {
                if (this._isDisposed) {
                    return;
                }
                const currentRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
                const newVisibleViewCells = getVisibleCells(this._viewModel.viewCells, currentRanges);
                const oldVisibleViewCells = [];
                const oldViewCellMapping = new Set();
                for (let i = 0; i < this.length; i++) {
                    oldVisibleViewCells.push(this.element(i));
                    oldViewCellMapping.add(this.element(i).uri.toString());
                }
                const viewDiffs = (0, notebookCommon_1.diff)(oldVisibleViewCells, newVisibleViewCells, a => {
                    return oldViewCellMapping.has(a.uri.toString());
                });
                if (e.synchronous) {
                    this._updateElementsInWebview(viewDiffs);
                }
                else {
                    this._viewModelStore.add(DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this.rowsContainer), () => {
                        if (this._isDisposed) {
                            return;
                        }
                        this._updateElementsInWebview(viewDiffs);
                    }));
                }
            }));
            this._viewModelStore.add(model.onDidChangeSelection((e) => {
                if (e === 'view') {
                    return;
                }
                // convert model selections to view selections
                const viewSelections = (0, notebookRange_1.cellRangesToIndexes)(model.getSelections()).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
                this.setSelection(viewSelections, undefined, true);
                const primary = (0, notebookRange_1.cellRangesToIndexes)([model.getFocus()]).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
                if (primary.length) {
                    this.setFocus(primary, undefined, true);
                }
            }));
            const hiddenRanges = model.getHiddenRanges();
            this.setHiddenAreas(hiddenRanges, false);
            const newRanges = (0, notebookRange_1.reduceCellRanges)(hiddenRanges);
            const viewCells = model.viewCells.slice(0);
            newRanges.reverse().forEach(range => {
                const removedCells = viewCells.splice(range.start, range.end - range.start + 1);
                this._onDidRemoveCellsFromView.fire(removedCells);
            });
            this.splice2(0, 0, viewCells);
        }
        _updateElementsInWebview(viewDiffs) {
            viewDiffs.reverse().forEach((diff) => {
                const hiddenOutputs = [];
                const deletedOutputs = [];
                const removedMarkdownCells = [];
                for (let i = diff.start; i < diff.start + diff.deleteCount; i++) {
                    const cell = this.element(i);
                    if (cell.cellKind === notebookCommon_1.CellKind.Code) {
                        if (this._viewModel.hasCell(cell)) {
                            hiddenOutputs.push(...cell?.outputsViewModels);
                        }
                        else {
                            deletedOutputs.push(...cell?.outputsViewModels);
                        }
                    }
                    else {
                        removedMarkdownCells.push(cell);
                    }
                }
                this.splice2(diff.start, diff.deleteCount, diff.toInsert);
                this._onDidHideOutputs.fire(hiddenOutputs);
                this._onDidRemoveOutputs.fire(deletedOutputs);
                this._onDidRemoveCellsFromView.fire(removedMarkdownCells);
            });
        }
        clear() {
            super.splice(0, this.length);
        }
        setHiddenAreas(_ranges, triggerViewUpdate) {
            if (!this._viewModel) {
                return false;
            }
            const newRanges = (0, notebookRange_1.reduceCellRanges)(_ranges);
            // delete old tracking ranges
            const oldRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
            if (newRanges.length === oldRanges.length) {
                let hasDifference = false;
                for (let i = 0; i < newRanges.length; i++) {
                    if (!(newRanges[i].start === oldRanges[i].start && newRanges[i].end === oldRanges[i].end)) {
                        hasDifference = true;
                        break;
                    }
                }
                if (!hasDifference) {
                    // they call 'setHiddenAreas' for a reason, even if the ranges are still the same, it's possible that the hiddenRangeSum is not update to date
                    this._updateHiddenRangePrefixSum(newRanges);
                    return false;
                }
            }
            this._hiddenRangeIds.forEach(id => this._viewModel.setTrackedRange(id, null, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */));
            const hiddenAreaIds = newRanges.map(range => this._viewModel.setTrackedRange(null, range, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */)).filter(id => id !== null);
            this._hiddenRangeIds = hiddenAreaIds;
            // set hidden ranges prefix sum
            this._updateHiddenRangePrefixSum(newRanges);
            if (triggerViewUpdate) {
                this.updateHiddenAreasInView(oldRanges, newRanges);
            }
            return true;
        }
        _updateHiddenRangePrefixSum(newRanges) {
            let start = 0;
            let index = 0;
            const ret = [];
            while (index < newRanges.length) {
                for (let j = start; j < newRanges[index].start - 1; j++) {
                    ret.push(1);
                }
                ret.push(newRanges[index].end - newRanges[index].start + 1 + 1);
                start = newRanges[index].end + 1;
                index++;
            }
            for (let i = start; i < this._viewModel.length; i++) {
                ret.push(1);
            }
            const values = new Uint32Array(ret.length);
            for (let i = 0; i < ret.length; i++) {
                values[i] = ret[i];
            }
            this.hiddenRangesPrefixSum = new prefixSumComputer_1.PrefixSumComputer(values);
        }
        /**
         * oldRanges and newRanges are all reduced and sorted.
         */
        updateHiddenAreasInView(oldRanges, newRanges) {
            const oldViewCellEntries = getVisibleCells(this._viewModel.viewCells, oldRanges);
            const oldViewCellMapping = new Set();
            oldViewCellEntries.forEach(cell => {
                oldViewCellMapping.add(cell.uri.toString());
            });
            const newViewCellEntries = getVisibleCells(this._viewModel.viewCells, newRanges);
            const viewDiffs = (0, notebookCommon_1.diff)(oldViewCellEntries, newViewCellEntries, a => {
                return oldViewCellMapping.has(a.uri.toString());
            });
            this._updateElementsInWebview(viewDiffs);
        }
        splice2(start, deleteCount, elements = []) {
            // we need to convert start and delete count based on hidden ranges
            if (start < 0 || start > this.view.length) {
                return;
            }
            const focusInside = DOM.isAncestorOfActiveElement(this.rowsContainer);
            super.splice(start, deleteCount, elements);
            if (focusInside) {
                this.domFocus();
            }
            const selectionsLeft = [];
            this.getSelectedElements().forEach(el => {
                if (this._viewModel.hasCell(el)) {
                    selectionsLeft.push(el.handle);
                }
            });
            if (!selectionsLeft.length && this._viewModel.viewCells.length) {
                // after splice, the selected cells are deleted
                this._viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
            }
        }
        getModelIndex(cell) {
            const viewIndex = this.indexOf(cell);
            return this.getModelIndex2(viewIndex);
        }
        getModelIndex2(viewIndex) {
            if (!this.hiddenRangesPrefixSum) {
                return viewIndex;
            }
            const modelIndex = this.hiddenRangesPrefixSum.getPrefixSum(viewIndex - 1);
            return modelIndex;
        }
        getViewIndex(cell) {
            const modelIndex = this._viewModel.getCellIndex(cell);
            return this.getViewIndex2(modelIndex);
        }
        getViewIndex2(modelIndex) {
            if (!this.hiddenRangesPrefixSum) {
                return modelIndex;
            }
            const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                    // it's already after the last hidden range
                    return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
                }
                return undefined;
            }
            else {
                return viewIndexInfo.index;
            }
        }
        _getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex) {
            const stack = [];
            const ranges = [];
            // there are hidden ranges
            let index = topViewIndex;
            let modelIndex = topModelIndex;
            while (index <= bottomViewIndex) {
                const accu = this.hiddenRangesPrefixSum.getPrefixSum(index);
                if (accu === modelIndex + 1) {
                    // no hidden area after it
                    if (stack.length) {
                        if (stack[stack.length - 1] === modelIndex - 1) {
                            ranges.push({ start: stack[stack.length - 1], end: modelIndex + 1 });
                        }
                        else {
                            ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
                        }
                    }
                    stack.push(modelIndex);
                    index++;
                    modelIndex++;
                }
                else {
                    // there are hidden ranges after it
                    if (stack.length) {
                        if (stack[stack.length - 1] === modelIndex - 1) {
                            ranges.push({ start: stack[stack.length - 1], end: modelIndex + 1 });
                        }
                        else {
                            ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
                        }
                    }
                    stack.push(modelIndex);
                    index++;
                    modelIndex = accu;
                }
            }
            if (stack.length) {
                ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
            }
            return (0, notebookRange_1.reduceCellRanges)(ranges);
        }
        getVisibleRangesPlusViewportAboveAndBelow() {
            if (this.view.length <= 0) {
                return [];
            }
            const top = Math.max(this.getViewScrollTop() - this.renderHeight, 0);
            const topViewIndex = this.view.indexAt(top);
            const topElement = this.view.element(topViewIndex);
            const topModelIndex = this._viewModel.getCellIndex(topElement);
            const bottom = (0, numbers_1.clamp)(this.getViewScrollBottom() + this.renderHeight, 0, this.scrollHeight);
            const bottomViewIndex = (0, numbers_1.clamp)(this.view.indexAt(bottom), 0, this.view.length - 1);
            const bottomElement = this.view.element(bottomViewIndex);
            const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
            if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                return [{ start: topModelIndex, end: bottomModelIndex }];
            }
            else {
                return this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
            }
        }
        _getViewIndexUpperBound(cell) {
            if (!this._viewModel) {
                return -1;
            }
            const modelIndex = this._viewModel.getCellIndex(cell);
            if (modelIndex === -1) {
                return -1;
            }
            if (!this.hiddenRangesPrefixSum) {
                return modelIndex;
            }
            const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                    return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
                }
            }
            return viewIndexInfo.index;
        }
        _getViewIndexUpperBound2(modelIndex) {
            if (!this.hiddenRangesPrefixSum) {
                return modelIndex;
            }
            const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                    return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
                }
            }
            return viewIndexInfo.index;
        }
        focusElement(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0 && this._viewModel) {
                // update view model first, which will update both `focus` and `selection` in a single transaction
                const focusedElementHandle = this.element(index).handle;
                this._viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Handle,
                    primary: focusedElementHandle,
                    selections: [focusedElementHandle]
                }, 'view');
                // update the view as previous model update will not trigger event
                this.setFocus([index], undefined, false);
            }
        }
        selectElements(elements) {
            const indices = elements.map(cell => this._getViewIndexUpperBound(cell)).filter(index => index >= 0);
            this.setSelection(indices);
        }
        getCellViewScrollTop(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index === undefined || index < 0 || index >= this.length) {
                throw new list_1.ListError(this.listUser, `Invalid index ${index}`);
            }
            return this.view.elementTop(index);
        }
        getCellViewScrollBottom(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index === undefined || index < 0 || index >= this.length) {
                throw new list_1.ListError(this.listUser, `Invalid index ${index}`);
            }
            const top = this.view.elementTop(index);
            const height = this.view.elementHeight(index);
            return top + height;
        }
        setFocus(indexes, browserEvent, ignoreTextModelUpdate) {
            if (ignoreTextModelUpdate) {
                super.setFocus(indexes, browserEvent);
                return;
            }
            if (!indexes.length) {
                if (this._viewModel) {
                    if (this.length) {
                        // Don't allow clearing focus, #121129
                        return;
                    }
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: null,
                        selections: []
                    }, 'view');
                }
            }
            else {
                if (this._viewModel) {
                    const focusedElementHandle = this.element(indexes[0]).handle;
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: focusedElementHandle,
                        selections: this.getSelection().map(selection => this.element(selection).handle)
                    }, 'view');
                }
            }
            super.setFocus(indexes, browserEvent);
        }
        setSelection(indexes, browserEvent, ignoreTextModelUpdate) {
            if (ignoreTextModelUpdate) {
                super.setSelection(indexes, browserEvent);
                return;
            }
            if (!indexes.length) {
                if (this._viewModel) {
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: this.getFocusedElements()[0]?.handle ?? null,
                        selections: []
                    }, 'view');
                }
            }
            else {
                if (this._viewModel) {
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: this.getFocusedElements()[0]?.handle ?? null,
                        selections: indexes.map(index => this.element(index)).map(cell => cell.handle)
                    }, 'view');
                }
            }
            super.setSelection(indexes, browserEvent);
        }
        /**
         * The range will be revealed with as little scrolling as possible.
         */
        revealCells(range) {
            const startIndex = this._getViewIndexUpperBound2(range.start);
            if (startIndex < 0) {
                return;
            }
            const endIndex = this._getViewIndexUpperBound2(range.end - 1);
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(startIndex);
            if (elementTop >= scrollTop
                && elementTop < wrapperBottom) {
                // start element is visible
                // check end
                const endElementTop = this.view.elementTop(endIndex);
                const endElementHeight = this.view.elementHeight(endIndex);
                if (endElementTop + endElementHeight <= wrapperBottom) {
                    // fully visible
                    return;
                }
                if (endElementTop >= wrapperBottom) {
                    return this._revealInternal(endIndex, false, 2 /* CellRevealPosition.Bottom */);
                }
                if (endElementTop < wrapperBottom) {
                    // end element partially visible
                    if (endElementTop + endElementHeight - wrapperBottom < elementTop - scrollTop) {
                        // there is enough space to just scroll up a little bit to make the end element visible
                        return this.view.setScrollTop(scrollTop + endElementTop + endElementHeight - wrapperBottom);
                    }
                    else {
                        // don't even try it
                        return this._revealInternal(startIndex, false, 0 /* CellRevealPosition.Top */);
                    }
                }
            }
            this._revealInViewWithMinimalScrolling(startIndex);
        }
        _revealInViewWithMinimalScrolling(viewIndex, firstLine) {
            const firstIndex = this.view.firstMostlyVisibleIndex;
            const elementHeight = this.view.elementHeight(viewIndex);
            if (viewIndex <= firstIndex || (!firstLine && elementHeight >= this.view.renderHeight)) {
                this._revealInternal(viewIndex, true, 0 /* CellRevealPosition.Top */);
            }
            else {
                this._revealInternal(viewIndex, true, 2 /* CellRevealPosition.Bottom */, firstLine);
            }
        }
        scrollToBottom() {
            const scrollHeight = this.view.scrollHeight;
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            this.view.setScrollTop(scrollHeight - (wrapperBottom - scrollTop));
        }
        /**
         * Reveals the given cell in the notebook cell list. The cell will come into view syncronously
         * but the cell's editor will be attached asyncronously if it was previously out of view.
         * @returns The promise to await for the cell editor to be attached
         */
        async revealCell(cell, revealType) {
            const index = this._getViewIndexUpperBound(cell);
            if (index < 0) {
                return;
            }
            switch (revealType) {
                case 2 /* CellRevealType.Top */:
                    this._revealInternal(index, false, 0 /* CellRevealPosition.Top */);
                    break;
                case 3 /* CellRevealType.Center */:
                    this._revealInternal(index, false, 1 /* CellRevealPosition.Center */);
                    break;
                case 4 /* CellRevealType.CenterIfOutsideViewport */:
                    this._revealInternal(index, true, 1 /* CellRevealPosition.Center */);
                    break;
                case 5 /* CellRevealType.NearTopIfOutsideViewport */:
                    this._revealInternal(index, true, 3 /* CellRevealPosition.NearTop */);
                    break;
                case 6 /* CellRevealType.FirstLineIfOutsideViewport */:
                    this._revealInViewWithMinimalScrolling(index, true);
                    break;
                case 1 /* CellRevealType.Default */:
                    this._revealInViewWithMinimalScrolling(index);
                    break;
            }
            // wait for the editor to be created only if the cell is in editing mode (meaning it has an editor and will focus the editor)
            if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && !cell.editorAttached) {
                return getEditorAttachedPromise(cell);
            }
            return;
        }
        _revealInternal(viewIndex, ignoreIfInsideViewport, revealPosition, firstLine) {
            if (viewIndex >= this.view.length) {
                return;
            }
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(viewIndex);
            const elementBottom = this.view.elementHeight(viewIndex) + elementTop;
            if (ignoreIfInsideViewport) {
                if (elementTop >= scrollTop && elementBottom < wrapperBottom) {
                    // element is already fully visible
                    return;
                }
            }
            switch (revealPosition) {
                case 0 /* CellRevealPosition.Top */:
                    this.view.setScrollTop(elementTop);
                    this.view.setScrollTop(this.view.elementTop(viewIndex));
                    break;
                case 1 /* CellRevealPosition.Center */:
                case 3 /* CellRevealPosition.NearTop */:
                    {
                        // reveal the cell top in the viewport center initially
                        this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                        // cell rendered already, we now have a more accurate cell height
                        const newElementTop = this.view.elementTop(viewIndex);
                        const newElementHeight = this.view.elementHeight(viewIndex);
                        const renderHeight = this.getViewScrollBottom() - this.getViewScrollTop();
                        if (newElementHeight >= renderHeight) {
                            // cell is larger than viewport, reveal top
                            this.view.setScrollTop(newElementTop);
                        }
                        else if (revealPosition === 1 /* CellRevealPosition.Center */) {
                            this.view.setScrollTop(newElementTop + (newElementHeight / 2) - (renderHeight / 2));
                        }
                        else if (revealPosition === 3 /* CellRevealPosition.NearTop */) {
                            this.view.setScrollTop(newElementTop - (renderHeight / 5));
                        }
                    }
                    break;
                case 2 /* CellRevealPosition.Bottom */:
                    if (firstLine) {
                        const lineHeight = this.viewModel?.layoutInfo?.fontInfo.lineHeight ?? 15;
                        const padding = this.notebookOptions.getLayoutConfiguration().cellTopMargin + this.notebookOptions.getLayoutConfiguration().editorTopPadding;
                        const firstLineLocation = elementTop + lineHeight + padding;
                        if (firstLineLocation < wrapperBottom) {
                            // first line is already visible
                            return;
                        }
                        this.view.setScrollTop(this.scrollTop + (firstLineLocation - wrapperBottom));
                        break;
                    }
                    this.view.setScrollTop(this.scrollTop + (elementBottom - wrapperBottom));
                    this.view.setScrollTop(this.scrollTop + (this.view.elementTop(viewIndex) + this.view.elementHeight(viewIndex) - this.getViewScrollBottom()));
                    break;
                default:
                    break;
            }
        }
        //#region Reveal Cell Editor Range asynchronously
        async revealRangeInCell(cell, range, revealType) {
            const index = this._getViewIndexUpperBound(cell);
            if (index < 0) {
                return;
            }
            switch (revealType) {
                case notebookBrowser_1.CellRevealRangeType.Default:
                    return this._revealRangeInternalAsync(index, range);
                case notebookBrowser_1.CellRevealRangeType.Center:
                    return this._revealRangeInCenterInternalAsync(index, range);
                case notebookBrowser_1.CellRevealRangeType.CenterIfOutsideViewport:
                    return this._revealRangeInCenterIfOutsideViewportInternalAsync(index, range);
            }
        }
        // List items have real dynamic heights, which means after we set `scrollTop` based on the `elementTop(index)`, the element at `index` might still be removed from the view once all relayouting tasks are done.
        // For example, we scroll item 10 into the view upwards, in the first round, items 7, 8, 9, 10 are all in the viewport. Then item 7 and 8 resize themselves to be larger and finally item 10 is removed from the view.
        // To ensure that item 10 is always there, we need to scroll item 10 to the top edge of the viewport.
        async _revealRangeInternalAsync(viewIndex, range) {
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(viewIndex);
            const element = this.view.element(viewIndex);
            if (element.editorAttached) {
                this._revealRangeCommon(viewIndex, range, false, false);
            }
            else {
                const elementHeight = this.view.elementHeight(viewIndex);
                let upwards = false;
                if (elementTop + elementHeight <= scrollTop) {
                    // scroll downwards
                    this.view.setScrollTop(elementTop);
                    upwards = false;
                }
                else if (elementTop >= wrapperBottom) {
                    // scroll upwards
                    this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                    upwards = true;
                }
                const editorAttachedPromise = new Promise((resolve, reject) => {
                    element.onDidChangeEditorAttachState(() => {
                        element.editorAttached ? resolve() : reject();
                    });
                });
                return editorAttachedPromise.then(() => {
                    this._revealRangeCommon(viewIndex, range, true, upwards);
                });
            }
        }
        async _revealRangeInCenterInternalAsync(viewIndex, range) {
            const reveal = (viewIndex, range) => {
                const element = this.view.element(viewIndex);
                const positionOffset = element.getPositionScrollTopOffset(range);
                const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
                this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
                element.revealRangeInCenter(range);
            };
            const elementTop = this.view.elementTop(viewIndex);
            const viewItemOffset = elementTop;
            this.view.setScrollTop(viewItemOffset - this.view.renderHeight / 2);
            const element = this.view.element(viewIndex);
            if (!element.editorAttached) {
                return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range));
            }
            else {
                reveal(viewIndex, range);
            }
        }
        async _revealRangeInCenterIfOutsideViewportInternalAsync(viewIndex, range) {
            const reveal = (viewIndex, range) => {
                const element = this.view.element(viewIndex);
                const positionOffset = element.getPositionScrollTopOffset(range);
                const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
                this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
                element.revealRangeInCenter(range);
            };
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(viewIndex);
            const viewItemOffset = elementTop;
            const element = this.view.element(viewIndex);
            const positionOffset = viewItemOffset + element.getPositionScrollTopOffset(range);
            if (positionOffset < scrollTop || positionOffset > wrapperBottom) {
                // let it render
                this.view.setScrollTop(positionOffset - this.view.renderHeight / 2);
                // after rendering, it might be pushed down due to markdown cell dynamic height
                const newPositionOffset = this.view.elementTop(viewIndex) + element.getPositionScrollTopOffset(range);
                this.view.setScrollTop(newPositionOffset - this.view.renderHeight / 2);
                // reveal editor
                if (!element.editorAttached) {
                    return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range));
                }
                else {
                    // for example markdown
                }
            }
            else {
                if (element.editorAttached) {
                    element.revealRangeInCenter(range);
                }
                else {
                    // for example, markdown cell in preview mode
                    return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range));
                }
            }
        }
        _revealRangeCommon(viewIndex, range, newlyCreated, alignToBottom) {
            const element = this.view.element(viewIndex);
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const positionOffset = element.getPositionScrollTopOffset(range);
            const elementOriginalHeight = this.view.elementHeight(viewIndex);
            if (positionOffset >= elementOriginalHeight) {
                // we are revealing a range that is beyond current element height
                // if we don't update the element height now, and directly `setTop` to reveal the range
                // the element might be scrolled out of view
                // next frame, when we update the element height, the element will never be scrolled back into view
                const newTotalHeight = element.layoutInfo.totalHeight;
                this.updateElementHeight(viewIndex, newTotalHeight);
            }
            const elementTop = this.view.elementTop(viewIndex);
            const positionTop = elementTop + positionOffset;
            // TODO@rebornix 30 ---> line height * 1.5
            if (positionTop < scrollTop) {
                this.view.setScrollTop(positionTop - 30);
            }
            else if (positionTop > wrapperBottom) {
                this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
            }
            else if (newlyCreated) {
                // newly scrolled into view
                if (alignToBottom) {
                    // align to the bottom
                    this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
                }
                else {
                    // align to to top
                    this.view.setScrollTop(positionTop - 30);
                }
            }
            element.revealRangeInCenter(range);
        }
        //#endregion
        /**
         * Reveals the specified offset of the given cell in the center of the viewport.
         * This enables revealing locations in the output as well as the input.
         */
        revealCellOffsetInCenter(cell, offset) {
            const viewIndex = this._getViewIndexUpperBound(cell);
            if (viewIndex >= 0) {
                const element = this.view.element(viewIndex);
                const elementTop = this.view.elementTop(viewIndex);
                if (element instanceof markupCellViewModel_1.MarkupCellViewModel) {
                    return this._revealInCenterIfOutsideViewport(viewIndex);
                }
                else {
                    const rangeOffset = element.layoutInfo.outputContainerOffset + Math.min(offset, element.layoutInfo.outputTotalHeight);
                    this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                    this.view.setScrollTop(elementTop + rangeOffset - this.view.renderHeight / 2);
                }
            }
        }
        _revealInCenterIfOutsideViewport(viewIndex) {
            this._revealInternal(viewIndex, true, 1 /* CellRevealPosition.Center */);
        }
        domElementOfElement(element) {
            const index = this._getViewIndexUpperBound(element);
            if (index >= 0) {
                return this.view.domElement(index);
            }
            return null;
        }
        focusView() {
            this.view.domNode.focus();
        }
        triggerScrollFromMouseWheelEvent(browserEvent) {
            this.view.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.view.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        isElementAboveViewport(index) {
            const elementTop = this.view.elementTop(index);
            const elementBottom = elementTop + this.view.elementHeight(index);
            return elementBottom < this.scrollTop;
        }
        updateElementHeight2(element, size, anchorElementIndex = null) {
            const index = this._getViewIndexUpperBound(element);
            if (index === undefined || index < 0 || index >= this.length) {
                return;
            }
            if (this.isElementAboveViewport(index)) {
                // update element above viewport
                const oldHeight = this.elementHeight(element);
                const delta = oldHeight - size;
                if (this._webviewElement) {
                    event_1.Event.once(this.view.onWillScroll)(() => {
                        const webviewTop = parseInt(this._webviewElement.domNode.style.top, 10);
                        if (validateWebviewBoundary(this._webviewElement.domNode)) {
                            this._webviewElement.setTop(webviewTop - delta);
                        }
                        else {
                            // When the webview top boundary is below the list view scrollable element top boundary, then we can't insert a markdown cell at the top
                            // or when its bottom boundary is above the list view bottom boundary, then we can't insert a markdown cell at the end
                            // thus we have to revert the webview element position to initial state `-NOTEBOOK_WEBVIEW_BOUNDARY`.
                            // this will trigger one visual flicker (as we need to update element offsets in the webview)
                            // but as long as NOTEBOOK_WEBVIEW_BOUNDARY is large enough, it will happen less often
                            this._webviewElement.setTop(-exports.NOTEBOOK_WEBVIEW_BOUNDARY);
                        }
                    });
                }
                this.view.updateElementHeight(index, size, anchorElementIndex);
                return;
            }
            if (anchorElementIndex !== null) {
                return this.view.updateElementHeight(index, size, anchorElementIndex);
            }
            const focused = this.getFocus();
            const focus = focused.length ? focused[0] : null;
            if (focus) {
                // If the cell is growing, we should favor anchoring to the focused cell
                const heightDelta = size - this.view.elementHeight(index);
                if (this._notebookCellAnchor.shouldAnchor(this.view, focus, heightDelta, this.element(index))) {
                    return this.view.updateElementHeight(index, size, focus);
                }
            }
            return this.view.updateElementHeight(index, size, null);
        }
        // override
        domFocus() {
            const focused = this.getFocusedElements()[0];
            const focusedDomElement = focused && this.domElementOfElement(focused);
            if (this.view.domNode.ownerDocument.activeElement && focusedDomElement && focusedDomElement.contains(this.view.domNode.ownerDocument.activeElement)) {
                // for example, when focus goes into monaco editor, if we refocus the list view, the editor will lose focus.
                return;
            }
            if (!platform_1.isMacintosh && this.view.domNode.ownerDocument.activeElement && !!DOM.findParentWithClass(this.view.domNode.ownerDocument.activeElement, 'context-view')) {
                return;
            }
            super.domFocus();
        }
        focusContainer() {
            super.domFocus();
        }
        getViewScrollTop() {
            return this.view.getScrollTop();
        }
        getViewScrollBottom() {
            return this.getViewScrollTop() + this.view.renderHeight;
        }
        setCellEditorSelection(cell, range) {
            const element = cell;
            if (element.editorAttached) {
                element.setSelection(range);
            }
            else {
                getEditorAttachedPromise(element).then(() => { element.setSelection(range); });
            }
        }
        style(styles) {
            const selectorSuffix = this.view.domId;
            if (!this.styleElement) {
                this.styleElement = DOM.createStyleSheet(this.view.domNode);
            }
            const suffix = selectorSuffix && `.${selectorSuffix}`;
            const content = [];
            if (styles.listBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows { background: ${styles.listBackground}; }`);
            }
            if (styles.listFocusBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listFocusForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
            }
            if (styles.listActiveSelectionBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listActiveSelectionForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
            }
            if (styles.listFocusAndSelectionBackground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
            }
            if (styles.listFocusAndSelectionForeground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
            }
            if (styles.listInactiveFocusBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
            }
            if (styles.listHoverBackground) {
                content.push(`.monaco-list${suffix}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${styles.listHoverBackground}; }`);
            }
            if (styles.listHoverForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
            }
            if (styles.listSelectionOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
            }
            if (styles.listFocusOutline) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
            }
            if (styles.listInactiveFocusOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
            }
            if (styles.listHoverOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
            }
            if (styles.listDropOverBackground) {
                content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${styles.listDropOverBackground} !important; color: inherit !important; }
			`);
            }
            const newStyles = content.join('\n');
            if (newStyles !== this.styleElement.textContent) {
                this.styleElement.textContent = newStyles;
            }
        }
        getRenderHeight() {
            return this.view.renderHeight;
        }
        getScrollHeight() {
            return this.view.scrollHeight;
        }
        layout(height, width) {
            this._isInLayout = true;
            super.layout(height, width);
            if (this.renderHeight === 0) {
                this.view.domNode.style.visibility = 'hidden';
            }
            else {
                this.view.domNode.style.visibility = 'initial';
            }
            this._isInLayout = false;
        }
        dispose() {
            this._isDisposed = true;
            this._viewModelStore.dispose();
            this._localDisposableStore.dispose();
            this._notebookCellAnchor.dispose();
            super.dispose();
            // un-ref
            this._previousFocusedElements = [];
            this._viewModel = null;
            this._hiddenRangeIds = [];
            this.hiddenRangesPrefixSum = null;
            this._visibleRanges = [];
        }
    };
    exports.NotebookCellList = NotebookCellList;
    exports.NotebookCellList = NotebookCellList = __decorate([
        __param(7, listService_1.IListService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], NotebookCellList);
    class ListViewInfoAccessor extends lifecycle_1.Disposable {
        constructor(list) {
            super();
            this.list = list;
        }
        getViewIndex(cell) {
            return this.list.getViewIndex(cell) ?? -1;
        }
        getViewHeight(cell) {
            if (!this.list.viewModel) {
                return -1;
            }
            return this.list.elementHeight(cell);
        }
        getCellRangeFromViewRange(startIndex, endIndex) {
            if (!this.list.viewModel) {
                return undefined;
            }
            const modelIndex = this.list.getModelIndex2(startIndex);
            if (modelIndex === undefined) {
                throw new Error(`startIndex ${startIndex} out of boundary`);
            }
            if (endIndex >= this.list.length) {
                // it's the end
                const endModelIndex = this.list.viewModel.length;
                return { start: modelIndex, end: endModelIndex };
            }
            else {
                const endModelIndex = this.list.getModelIndex2(endIndex);
                if (endModelIndex === undefined) {
                    throw new Error(`endIndex ${endIndex} out of boundary`);
                }
                return { start: modelIndex, end: endModelIndex };
            }
        }
        getCellsFromViewRange(startIndex, endIndex) {
            if (!this.list.viewModel) {
                return [];
            }
            const range = this.getCellRangeFromViewRange(startIndex, endIndex);
            if (!range) {
                return [];
            }
            return this.list.viewModel.getCellsInRange(range);
        }
        getCellsInRange(range) {
            return this.list.viewModel?.getCellsInRange(range) ?? [];
        }
        getVisibleRangesPlusViewportAboveAndBelow() {
            return this.list?.getVisibleRangesPlusViewportAboveAndBelow() ?? [];
        }
    }
    exports.ListViewInfoAccessor = ListViewInfoAccessor;
    function getEditorAttachedPromise(element) {
        return new Promise((resolve, reject) => {
            event_1.Event.once(element.onDidChangeEditorAttachState)(() => element.editorAttached ? resolve() : reject());
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDZWxsTGlzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L25vdGVib29rQ2VsbExpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRyxJQUFXLGtCQUtWO0lBTEQsV0FBVyxrQkFBa0I7UUFDNUIseURBQUcsQ0FBQTtRQUNILCtEQUFNLENBQUE7UUFDTiwrREFBTSxDQUFBO1FBQ04saUVBQU8sQ0FBQTtJQUNSLENBQUMsRUFMVSxrQkFBa0IsS0FBbEIsa0JBQWtCLFFBSzVCO0lBRUQsU0FBUyxlQUFlLENBQUMsS0FBc0IsRUFBRSxZQUEwQjtRQUMxRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzFCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sTUFBTSxHQUFvQixFQUFFLENBQUM7UUFFbkMsT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkUsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzFFLENBQUM7WUFFRCxLQUFLLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUMvQyxn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
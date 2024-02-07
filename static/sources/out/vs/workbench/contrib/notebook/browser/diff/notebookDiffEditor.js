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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/arraysFind", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/base/common/cancellation", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/diff/notebookDiffList", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/notebook/common/services/notebookWorkerService", "vs/platform/configuration/common/configuration", "vs/editor/common/config/fontInfo", "vs/base/browser/browser", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/async", "vs/base/common/uuid", "vs/workbench/contrib/notebook/browser/diff/diffNestedCellViewModel", "vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView", "vs/workbench/contrib/notebook/browser/diff/eventDispatcher", "vs/editor/browser/config/fontMeasurements", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/browser/diff/notebookDiffOverviewRuler", "vs/platform/layout/browser/zIndexRegistry"], function (require, exports, nls, DOM, arraysFind_1, storage_1, telemetry_1, themeService_1, notebookEditorWidget_1, cancellation_1, diffElementViewModel_1, instantiation_1, notebookDiffList_1, contextkey_1, colorRegistry_1, notebookWorkerService_1, configuration_1, fontInfo_1, browser_1, notebookDiffEditorBrowser_1, event_1, lifecycle_1, editorPane_1, notebookCommon_1, async_1, uuid_1, diffNestedCellViewModel_1, backLayerWebView_1, eventDispatcher_1, fontMeasurements_1, notebookOptions_1, notebookExecutionStateService_1, notebookRange_1, notebookDiffOverviewRuler_1, zIndexRegistry_1) {
    "use strict";
    var NotebookTextDiffEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookTextDiffEditor = void 0;
    const $ = DOM.$;
    class NotebookDiffEditorSelection {
        constructor(selections) {
            this.selections = selections;
        }
        compare(other) {
            if (!(other instanceof NotebookDiffEditorSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            if (this.selections.length !== other.selections.length) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            for (let i = 0; i < this.selections.length; i++) {
                if (this.selections[i] !== other.selections[i]) {
                    return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
                }
            }
            return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
        }
        restore(options) {
            const notebookOptions = {
                cellSelections: (0, notebookRange_1.cellIndexesToRanges)(this.selections)
            };
            Object.assign(notebookOptions, options);
            return notebookOptions;
        }
    }
    let NotebookTextDiffEditor = class NotebookTextDiffEditor extends editorPane_1.EditorPane {
        static { NotebookTextDiffEditor_1 = this; }
        static { this.ENTIRE_DIFF_OVERVIEW_WIDTH = 30; }
        static { this.ID = notebookCommon_1.NOTEBOOK_DIFF_EDITOR_ID; }
        get textModel() {
            return this._model?.modified.notebook;
        }
        get notebookOptions() {
            return this._notebookOptions;
        }
        get isDisposed() {
            return this._isDisposed;
        }
        constructor(instantiationService, themeService, contextKeyService, notebookEditorWorkerService, configurationService, telemetryService, storageService, notebookExecutionStateService) {
            super(NotebookTextDiffEditor_1.ID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.notebookEditorWorkerService = notebookEditorWorkerService;
            this.configurationService = configurationService;
            this.creationOptions = (0, notebookEditorWidget_1.getDefaultNotebookCreationOptions)();
            this._dimension = null;
            this._diffElementViewModels = [];
            this._modifiedWebview = null;
            this._originalWebview = null;
            this._webviewTransparentCover = null;
            this._onMouseUp = this._register(new event_1.Emitter());
            this.onMouseUp = this._onMouseUp.event;
            this._onDidScroll = this._register(new event_1.Emitter());
            this.onDidScroll = this._onDidScroll.event;
            this._model = null;
            this._modifiedResourceDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._insetModifyQueueByOutputId = new async_1.SequencerByKey();
            this._onDidDynamicOutputRendered = this._register(new event_1.Emitter());
            this.onDidDynamicOutputRendered = this._onDidDynamicOutputRendered.event;
            this._localStore = this._register(new lifecycle_1.DisposableStore());
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._isDisposed = false;
            this.pendingLayouts = new WeakMap();
            this._notebookOptions = new notebookOptions_1.NotebookOptions(this.configurationService, notebookExecutionStateService, false);
            this._register(this._notebookOptions);
            const editorOptions = this.configurationService.getValue('editor');
            this._fontInfo = fontMeasurements_1.FontMeasurements.readFontInfo(fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, browser_1.PixelRatio.value));
            this._revealFirst = true;
        }
        isOverviewRulerEnabled() {
            return this.configurationService.getValue(notebookCommon_1.NotebookSetting.diffOverviewRuler) ?? false;
        }
        getSelection() {
            const selections = this._list.getFocus();
            return new NotebookDiffEditorSelection(selections);
        }
        toggleNotebookCellSelection(cell) {
            // throw new Error('Method not implemented.');
        }
        updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
            // throw new Error('Method not implemented.');
        }
        async focusNotebookCell(cell, focus) {
            // throw new Error('Method not implemented.');
        }
        async focusNextNotebookCell(cell, focus) {
            // throw new Error('Method not implemented.');
        }
        didFocusOutputInputChange(inputFocused) {
            // noop
        }
        getScrollTop() {
            return this._list?.scrollTop ?? 0;
        }
        getScrollHeight() {
            return this._list?.scrollHeight ?? 0;
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this._list?.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        updateOutputHeight(cellInfo, output, outputHeight, isInit) {
            const diffElement = cellInfo.diffElement;
            const cell = this.getCellByInfo(cellInfo);
            const outputIndex = cell.outputsViewModels.indexOf(output);
            if (diffElement instanceof diffElementViewModel_1.SideBySideDiffElementViewModel) {
                const info = notebookCommon_1.CellUri.parse(cellInfo.cellUri);
                if (!info) {
                    return;
                }
                diffElement.updateOutputHeight(info.notebook.toString() === this._model?.original.resource.toString() ? notebookDiffEditorBrowser_1.DiffSide.Original : notebookDiffEditorBrowser_1.DiffSide.Modified, outputIndex, outputHeight);
            }
            else {
                diffElement.updateOutputHeight(diffElement.type === 'insert' ? notebookDiffEditorBrowser_1.DiffSide.Modified : notebookDiffEditorBrowser_1.DiffSide.Original, outputIndex, outputHeight);
            }
            if (isInit) {
                this._onDidDynamicOutputRendered.fire({ cell, output });
            }
        }
        setMarkupCellEditState(cellId, editState) {
            // throw new Error('Method not implemented.');
        }
        didStartDragMarkupCell(cellId, event) {
            // throw new Error('Method not implemented.');
        }
        didDragMarkupCell(cellId, event) {
            // throw new Error('Method not implemented.');
        }
        didEndDragMarkupCell(cellId) {
            // throw new Error('Method not implemented.');
        }
        didDropMarkupCell(cellId) {
            // throw new Error('Method not implemented.');
        }
        didResizeOutput(cellId) {
            // throw new Error('Method not implemented.');
        }
        createEditor(parent) {
            this._rootElement = DOM.append(parent, DOM.$('.notebook-text-diff-editor'));
            this._overflowContainer = document.createElement('div');
            this._overflowContainer.classList.add('notebook-overflow-widget-container', 'monaco-editor');
            DOM.append(parent, this._overflowContainer);
            const renderers = [
                this.instantiationService.createInstance(notebookDiffList_1.CellDiffSingleSideRenderer, this),
                this.instantiationService.createInstance(notebookDiffList_1.CellDiffSideBySideRenderer, this),
            ];
            this._listViewContainer = DOM.append(this._rootElement, DOM.$('.notebook-diff-list-view'));
            this._list = this.instantiationService.createInstance(notebookDiffList_1.NotebookTextDiffList, 'NotebookTextDiff', this._listViewContainer, this.instantiationService.createInstance(notebookDiffList_1.NotebookCellTextDiffListDelegate), renderers, this.contextKeyService, {
                setRowLineHeight: false,
                setRowHeight: false,
                supportDynamicHeights: true,
                horizontalScrolling: false,
                keyboardSupport: false,
                mouseSupport: true,
                multipleSelectionSupport: false,
                typeNavigationEnabled: true,
                paddingBottom: 0,
                // transformOptimization: (isMacintosh && isNative) || getTitleBarStyle(this.configurationService, this.environmentService) === 'native',
                styleController: (_suffix) => { return this._list; },
                overrideStyles: {
                    listBackground: colorRegistry_1.editorBackground,
                    listActiveSelectionBackground: colorRegistry_1.editorBackground,
                    listActiveSelectionForeground: colorRegistry_1.foreground,
                    listFocusAndSelectionBackground: colorRegistry_1.editorBackground,
                    listFocusAndSelectionForeground: colorRegistry_1.foreground,
                    listFocusBackground: colorRegistry_1.editorBackground,
                    listFocusForeground: colorRegistry_1.foreground,
                    listHoverForeground: colorRegistry_1.foreground,
                    listHoverBackground: colorRegistry_1.editorBackground,
                    listHoverOutline: colorRegistry_1.focusBorder,
                    listFocusOutline: colorRegistry_1.focusBorder,
                    listInactiveSelectionBackground: colorRegistry_1.editorBackground,
                    listInactiveSelectionForeground: colorRegistry_1.foreground,
                    listInactiveFocusBackground: colorRegistry_1.editorBackground,
                    listInactiveFocusOutline: colorRegistry_1.editorBackground,
                },
                accessibilityProvider: {
                    getAriaLabel() { return null; },
                    getWidgetAriaLabel() {
                        return nls.localize('notebookTreeAriaLabel', "Notebook Text Diff");
                    }
                },
                // focusNextPreviousDelegate: {
                // 	onFocusNext: (applyFocusNext: () => void) => this._updateForCursorNavigationMode(applyFocusNext),
                // 	onFocusPrevious: (applyFocusPrevious: () => void) => this._updateForCursorNavigationMode(applyFocusPrevious),
                // }
            });
            this._register(this._list);
            this._register(this._list.onMouseUp(e => {
                if (e.element) {
                    this._onMouseUp.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this._register(this._list.onDidScroll(() => {
                this._onDidScroll.fire();
            }));
            this._register(this._list.onDidChangeFocus(() => this._onDidChangeSelection.fire({ reason: 2 /* EditorPaneSelectionChangeReason.USER */ })));
            this._overviewRulerContainer = document.createElement('div');
            this._overviewRulerContainer.classList.add('notebook-overview-ruler-container');
            this._rootElement.appendChild(this._overviewRulerContainer);
            this._registerOverviewRuler();
            // transparent cover
            this._webviewTransparentCover = DOM.append(this._list.rowsContainer, $('.webview-cover'));
            this._webviewTransparentCover.style.display = 'none';
            this._register(DOM.addStandardDisposableGenericMouseDownListener(this._overflowContainer, (e) => {
                if (e.target.classList.contains('slider') && this._webviewTransparentCover) {
                    this._webviewTransparentCover.style.display = 'block';
                }
            }));
            this._register(DOM.addStandardDisposableGenericMouseUpListener(this._overflowContainer, () => {
                if (this._webviewTransparentCover) {
                    // no matter when
                    this._webviewTransparentCover.style.display = 'none';
                }
            }));
            this._register(this._list.onDidScroll(e => {
                this._webviewTransparentCover.style.top = `${e.scrollTop}px`;
            }));
        }
        _registerOverviewRuler() {
            this._overviewRuler = this._register(this.instantiationService.createInstance(notebookDiffOverviewRuler_1.NotebookDiffOverviewRuler, this, NotebookTextDiffEditor_1.ENTIRE_DIFF_OVERVIEW_WIDTH, this._overviewRulerContainer));
        }
        _updateOutputsOffsetsInWebview(scrollTop, scrollHeight, activeWebview, getActiveNestedCell, diffSide) {
            activeWebview.element.style.height = `${scrollHeight}px`;
            if (activeWebview.insetMapping) {
                const updateItems = [];
                const removedItems = [];
                activeWebview.insetMapping.forEach((value, key) => {
                    const cell = getActiveNestedCell(value.cellInfo.diffElement);
                    if (!cell) {
                        return;
                    }
                    const viewIndex = this._list.indexOf(value.cellInfo.diffElement);
                    if (viewIndex === undefined) {
                        return;
                    }
                    if (cell.outputsViewModels.indexOf(key) < 0) {
                        // output is already gone
                        removedItems.push(key);
                    }
                    else {
                        const cellTop = this._list.getCellViewScrollTop(value.cellInfo.diffElement);
                        const outputIndex = cell.outputsViewModels.indexOf(key);
                        const outputOffset = value.cellInfo.diffElement.getOutputOffsetInCell(diffSide, outputIndex);
                        updateItems.push({
                            cell,
                            output: key,
                            cellTop: cellTop,
                            outputOffset: outputOffset,
                            forceDisplay: false
                        });
                    }
                });
                activeWebview.removeInsets(removedItems);
                if (updateItems.length) {
                    activeWebview.updateScrollTops(updateItems, []);
                }
            }
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            const model = await input.resolve();
            if (this._model !== model) {
                this._detachModel();
                this._model = model;
                this._attachModel();
            }
            this._model = model;
            if (this._model === null) {
                return;
            }
            this._revealFirst = true;
            this._modifiedResourceDisposableStore.clear();
            this._layoutCancellationTokenSource = new cancellation_1.CancellationTokenSource();
            this._modifiedResourceDisposableStore.add(event_1.Event.any(this._model.original.notebook.onDidChangeContent, this._model.modified.notebook.onDidChangeContent)(e => {
                if (this._model !== null) {
                    this._layoutCancellationTokenSource?.dispose();
                    this._layoutCancellationTokenSource = new cancellation_1.CancellationTokenSource();
                    this.updateLayout(this._layoutCancellationTokenSource.token);
                }
            }));
            await this._createOriginalWebview((0, uuid_1.generateUuid)(), this._model.original.viewType, this._model.original.resource);
            if (this._originalWebview) {
                this._modifiedResourceDisposableStore.add(this._originalWebview);
            }
            await this._createModifiedWebview((0, uuid_1.generateUuid)(), this._model.modified.viewType, this._model.modified.resource);
            if (this._modifiedWebview) {
                this._modifiedResourceDisposableStore.add(this._modifiedWebview);
            }
            await this.updateLayout(this._layoutCancellationTokenSource.token, options?.cellSelections ? (0, notebookRange_1.cellRangesToIndexes)(options.cellSelections) : undefined);
        }
        _detachModel() {
            this._localStore.clear();
            this._originalWebview?.dispose();
            this._originalWebview?.element.remove();
            this._originalWebview = null;
            this._modifiedWebview?.dispose();
            this._modifiedWebview?.element.remove();
            this._modifiedWebview = null;
            this._modifiedResourceDisposableStore.clear();
            this._list.clear();
        }
        _attachModel() {
            this._eventDispatcher = new eventDispatcher_1.NotebookDiffEditorEventDispatcher();
            const updateInsets = () => {
                DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this._listViewContainer), () => {
                    if (this._isDisposed) {
                        return;
                    }
                    if (this._modifiedWebview) {
                        this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._modifiedWebview, (diffElement) => {
                            return diffElement.modified;
                        }, notebookDiffEditorBrowser_1.DiffSide.Modified);
                    }
                    if (this._originalWebview) {
                        this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._originalWebview, (diffElement) => {
                            return diffElement.original;
                        }, notebookDiffEditorBrowser_1.DiffSide.Original);
                    }
                });
            };
            this._localStore.add(this._list.onDidChangeContentHeight(() => {
                updateInsets();
            }));
            this._localStore.add(this._eventDispatcher.onDidChangeCellLayout(() => {
                updateInsets();
            }));
        }
        async _createModifiedWebview(id, viewType, resource) {
            this._modifiedWebview?.dispose();
            this._modifiedWebview = this.instantiationService.createInstance(backLayerWebView_1.BackLayerWebView, this, id, viewType, resource, {
                ...this._notebookOptions.computeDiffWebviewOptions(),
                fontFamily: this._generateFontFamily()
            }, undefined);
            // attach the webview container to the DOM tree first
            this._list.rowsContainer.insertAdjacentElement('afterbegin', this._modifiedWebview.element);
            this._modifiedWebview.createWebview(DOM.getActiveWindow());
            this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
            this._modifiedWebview.element.style.left = `calc(50%)`;
        }
        _generateFontFamily() {
            return this._fontInfo?.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
        }
        async _createOriginalWebview(id, viewType, resource) {
            this._originalWebview?.dispose();
            this._originalWebview = this.instantiationService.createInstance(backLayerWebView_1.BackLayerWebView, this, id, viewType, resource, {
                ...this._notebookOptions.computeDiffWebviewOptions(),
                fontFamily: this._generateFontFamily()
            }, undefined);
            // attach the webview container to the DOM tree first
            this._list.rowsContainer.insertAdjacentElement('afterbegin', this._originalWebview.element);
            this._originalWebview.createWebview(DOM.getActiveWindow());
            this._originalWebview.element.style.width = `calc(50% - 16px)`;
            this._originalWebview.element.style.left = `16px`;
        }
        setOptions(options) {
            const selections = options?.cellSelections ? (0, notebookRange_1.cellRangesToIndexes)(options.cellSelections) : undefined;
            if (selections) {
                this._list.setFocus(selections);
            }
        }
        async updateLayout(token, selections) {
            if (!this._model) {
                return;
            }
            const diffResult = await this.notebookEditorWorkerService.computeDiff(this._model.original.resource, this._model.modified.resource);
            if (token.isCancellationRequested) {
                // after await the editor might be disposed.
                return;
            }
            NotebookTextDiffEditor_1.prettyChanges(this._model, diffResult.cellsDiff);
            const { viewModels, firstChangeIndex } = NotebookTextDiffEditor_1.computeDiff(this.instantiationService, this.configurationService, this._model, this._eventDispatcher, diffResult, this._fontInfo);
            const isSame = this._isViewModelTheSame(viewModels);
            if (!isSame) {
                this._originalWebview?.removeInsets([...this._originalWebview?.insetMapping.keys()]);
                this._modifiedWebview?.removeInsets([...this._modifiedWebview?.insetMapping.keys()]);
                this._setViewModel(viewModels);
            }
            // this._diffElementViewModels = viewModels;
            // this._list.splice(0, this._list.length, this._diffElementViewModels);
            if (this._revealFirst && firstChangeIndex !== -1 && firstChangeIndex < this._list.length) {
                this._revealFirst = false;
                this._list.setFocus([firstChangeIndex]);
                this._list.reveal(firstChangeIndex, 0.3);
            }
            if (selections) {
                this._list.setFocus(selections);
            }
        }
        _isViewModelTheSame(viewModels) {
            let isSame = true;
            if (this._diffElementViewModels.length === viewModels.length) {
                for (let i = 0; i < viewModels.length; i++) {
                    const a = this._diffElementViewModels[i];
                    const b = viewModels[i];
                    if (a.original?.textModel.getHashValue() !== b.original?.textModel.getHashValue()
                        || a.modified?.textModel.getHashValue() !== b.modified?.textModel.getHashValue()) {
                        isSame = false;
                        break;
                    }
                }
            }
            else {
                isSame = false;
            }
            return isSame;
        }
        _setViewModel(viewModels) {
            this._diffElementViewModels = viewModels;
            this._list.splice(0, this._list.length, this._diffElementViewModels);
            if (this.isOverviewRulerEnabled()) {
                this._overviewRuler.updateViewModels(this._diffElementViewModels, this._eventDispatcher);
            }
        }
        /**
         * making sure that swapping cells are always translated to `insert+delete`.
         */
        static prettyChanges(model, diffResult) {
            const changes = diffResult.changes;
            for (let i = 0; i < diffResult.changes.length - 1; i++) {
                // then we know there is another change after current one
                const curr = changes[i];
                const next = changes[i + 1];
                const x = curr.originalStart;
                const y = curr.modifiedStart;
                if (curr.originalLength === 1
                    && curr.modifiedLength === 0
                    && next.originalStart === x + 2
                    && next.originalLength === 0
                    && next.modifiedStart === y + 1
                    && next.modifiedLength === 1
                    && model.original.notebook.cells[x].getHashValue() === model.modified.notebook.cells[y + 1].getHashValue()
                    && model.original.notebook.cells[x + 1].getHashValue() === model.modified.notebook.cells[y].getHashValue()) {
                    // this is a swap
                    curr.originalStart = x;
                    curr.originalLength = 0;
                    curr.modifiedStart = y;
                    curr.modifiedLength = 1;
                    next.originalStart = x + 1;
                    next.originalLength = 1;
                    next.modifiedStart = y + 2;
                    next.modifiedLength = 0;
                    i++;
                }
            }
        }
        static computeDiff(instantiationService, configurationService, model, eventDispatcher, diffResult, fontInfo) {
            const cellChanges = diffResult.cellsDiff.changes;
            const diffElementViewModels = [];
            const originalModel = model.original.notebook;
            const modifiedModel = model.modified.notebook;
            let originalCellIndex = 0;
            let modifiedCellIndex = 0;
            let firstChangeIndex = -1;
            const initData = {
                metadataStatusHeight: configurationService.getValue('notebook.diff.ignoreMetadata') ? 0 : 25,
                outputStatusHeight: configurationService.getValue('notebook.diff.ignoreOutputs') || !!(modifiedModel.transientOptions.transientOutputs) ? 0 : 25,
                fontInfo
            };
            for (let i = 0; i < cellChanges.length; i++) {
                const change = cellChanges[i];
                // common cells
                for (let j = 0; j < change.originalStart - originalCellIndex; j++) {
                    const originalCell = originalModel.cells[originalCellIndex + j];
                    const modifiedCell = modifiedModel.cells[modifiedCellIndex + j];
                    if (originalCell.getHashValue() === modifiedCell.getHashValue()) {
                        diffElementViewModels.push(new diffElementViewModel_1.SideBySideDiffElementViewModel(model.modified.notebook, model.original.notebook, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalCell), instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedCell), 'unchanged', eventDispatcher, initData));
                    }
                    else {
                        if (firstChangeIndex === -1) {
                            firstChangeIndex = diffElementViewModels.length;
                        }
                        diffElementViewModels.push(new diffElementViewModel_1.SideBySideDiffElementViewModel(model.modified.notebook, model.original.notebook, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalCell), instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedCell), 'modified', eventDispatcher, initData));
                    }
                }
                const modifiedLCS = NotebookTextDiffEditor_1.computeModifiedLCS(instantiationService, change, originalModel, modifiedModel, eventDispatcher, initData);
                if (modifiedLCS.length && firstChangeIndex === -1) {
                    firstChangeIndex = diffElementViewModels.length;
                }
                diffElementViewModels.push(...modifiedLCS);
                originalCellIndex = change.originalStart + change.originalLength;
                modifiedCellIndex = change.modifiedStart + change.modifiedLength;
            }
            for (let i = originalCellIndex; i < originalModel.cells.length; i++) {
                diffElementViewModels.push(new diffElementViewModel_1.SideBySideDiffElementViewModel(model.modified.notebook, model.original.notebook, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalModel.cells[i]), instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedModel.cells[i - originalCellIndex + modifiedCellIndex]), 'unchanged', eventDispatcher, initData));
            }
            return {
                viewModels: diffElementViewModels,
                firstChangeIndex
            };
        }
        static computeModifiedLCS(instantiationService, change, originalModel, modifiedModel, eventDispatcher, initData) {
            const result = [];
            // modified cells
            const modifiedLen = Math.min(change.originalLength, change.modifiedLength);
            for (let j = 0; j < modifiedLen; j++) {
                const isTheSame = originalModel.cells[change.originalStart + j].equal(modifiedModel.cells[change.modifiedStart + j]);
                result.push(new diffElementViewModel_1.SideBySideDiffElementViewModel(modifiedModel, originalModel, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalModel.cells[change.originalStart + j]), instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedModel.cells[change.modifiedStart + j]), isTheSame ? 'unchanged' : 'modified', eventDispatcher, initData));
            }
            for (let j = modifiedLen; j < change.originalLength; j++) {
                // deletion
                result.push(new diffElementViewModel_1.SingleSideDiffElementViewModel(originalModel, modifiedModel, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, originalModel.cells[change.originalStart + j]), undefined, 'delete', eventDispatcher, initData));
            }
            for (let j = modifiedLen; j < change.modifiedLength; j++) {
                // insertion
                result.push(new diffElementViewModel_1.SingleSideDiffElementViewModel(modifiedModel, originalModel, undefined, instantiationService.createInstance(diffNestedCellViewModel_1.DiffNestedCellViewModel, modifiedModel.cells[change.modifiedStart + j]), 'insert', eventDispatcher, initData));
            }
            return result;
        }
        scheduleOutputHeightAck(cellInfo, outputId, height) {
            const diffElement = cellInfo.diffElement;
            // const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            let diffSide = notebookDiffEditorBrowser_1.DiffSide.Original;
            if (diffElement instanceof diffElementViewModel_1.SideBySideDiffElementViewModel) {
                const info = notebookCommon_1.CellUri.parse(cellInfo.cellUri);
                if (!info) {
                    return;
                }
                diffSide = info.notebook.toString() === this._model?.original.resource.toString() ? notebookDiffEditorBrowser_1.DiffSide.Original : notebookDiffEditorBrowser_1.DiffSide.Modified;
            }
            else {
                diffSide = diffElement.type === 'insert' ? notebookDiffEditorBrowser_1.DiffSide.Modified : notebookDiffEditorBrowser_1.DiffSide.Original;
            }
            const webview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this._listViewContainer), () => {
                webview?.ackHeight([{ cellId: cellInfo.cellId, outputId, height }]);
            }, 10);
        }
        layoutNotebookCell(cell, height) {
            const relayout = (cell, height) => {
                this._list.updateElementHeight2(cell, height);
            };
            if (this.pendingLayouts.has(cell)) {
                this.pendingLayouts.get(cell).dispose();
            }
            let r;
            const layoutDisposable = DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this._listViewContainer), () => {
                this.pendingLayouts.delete(cell);
                relayout(cell, height);
                r();
            });
            this.pendingLayouts.set(cell, (0, lifecycle_1.toDisposable)(() => {
                layoutDisposable.dispose();
                r();
            }));
            return new Promise(resolve => { r = resolve; });
        }
        setScrollTop(scrollTop) {
            this._list.scrollTop = scrollTop;
        }
        triggerScroll(event) {
            this._list.triggerScrollFromMouseWheelEvent(event);
        }
        previousChange() {
            let currFocus = this._list.getFocus()[0];
            if (isNaN(currFocus) || currFocus < 0) {
                currFocus = 0;
            }
            // find the index of previous change
            let prevChangeIndex = currFocus - 1;
            while (prevChangeIndex >= 0) {
                const vm = this._diffElementViewModels[prevChangeIndex];
                if (vm.type !== 'unchanged') {
                    break;
                }
                prevChangeIndex--;
            }
            if (prevChangeIndex >= 0) {
                this._list.setFocus([prevChangeIndex]);
                this._list.reveal(prevChangeIndex);
            }
            else {
                // go to the last one
                const index = (0, arraysFind_1.findLastIdx)(this._diffElementViewModels, vm => vm.type !== 'unchanged');
                if (index >= 0) {
                    this._list.setFocus([index]);
                    this._list.reveal(index);
                }
            }
        }
        nextChange() {
            let currFocus = this._list.getFocus()[0];
            if (isNaN(currFocus) || currFocus < 0) {
                currFocus = 0;
            }
            // find the index of next change
            let nextChangeIndex = currFocus + 1;
            while (nextChangeIndex < this._diffElementViewModels.length) {
                const vm = this._diffElementViewModels[nextChangeIndex];
                if (vm.type !== 'unchanged') {
                    break;
                }
                nextChangeIndex++;
            }
            if (nextChangeIndex < this._diffElementViewModels.length) {
                this._list.setFocus([nextChangeIndex]);
                this._list.reveal(nextChangeIndex);
            }
            else {
                // go to the first one
                const index = this._diffElementViewModels.findIndex(vm => vm.type !== 'unchanged');
                if (index >= 0) {
                    this._list.setFocus([index]);
                    this._list.reveal(index);
                }
            }
        }
        createOutput(cellDiffViewModel, cellViewModel, output, getOffset, diffSide) {
            this._insetModifyQueueByOutputId.queue(output.source.model.outputId + (diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? '-right' : 'left'), async () => {
                const activeWebview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
                if (!activeWebview) {
                    return;
                }
                if (!activeWebview.insetMapping.has(output.source)) {
                    const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
                    await activeWebview.createOutput({ diffElement: cellDiffViewModel, cellHandle: cellViewModel.handle, cellId: cellViewModel.id, cellUri: cellViewModel.uri }, output, cellTop, getOffset());
                }
                else {
                    const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
                    const outputIndex = cellViewModel.outputsViewModels.indexOf(output.source);
                    const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
                    activeWebview.updateScrollTops([{
                            cell: cellViewModel,
                            output: output.source,
                            cellTop,
                            outputOffset,
                            forceDisplay: true
                        }], []);
                }
            });
        }
        updateMarkupCellHeight() {
            // TODO
        }
        getCellByInfo(cellInfo) {
            return cellInfo.diffElement.getCellByUri(cellInfo.cellUri);
        }
        getCellById(cellId) {
            throw new Error('Not implemented');
        }
        removeInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
            this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? '-right' : 'left'), async () => {
                const activeWebview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
                if (!activeWebview) {
                    return;
                }
                if (!activeWebview.insetMapping.has(displayOutput)) {
                    return;
                }
                activeWebview.removeInsets([displayOutput]);
            });
        }
        showInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
            this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? '-right' : 'left'), async () => {
                const activeWebview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
                if (!activeWebview) {
                    return;
                }
                if (!activeWebview.insetMapping.has(displayOutput)) {
                    return;
                }
                const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
                const outputIndex = cellViewModel.outputsViewModels.indexOf(displayOutput);
                const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
                activeWebview.updateScrollTops([{
                        cell: cellViewModel,
                        output: displayOutput,
                        cellTop,
                        outputOffset,
                        forceDisplay: true,
                    }], []);
            });
        }
        hideInset(cellDiffViewModel, cellViewModel, output) {
            this._modifiedWebview?.hideInset(output);
            this._originalWebview?.hideInset(output);
        }
        // private async _resolveWebview(rightEditor: boolean): Promise<BackLayerWebView | null> {
        // 	if (rightEditor) {
        // 	}
        // }
        getDomNode() {
            return this._rootElement;
        }
        getOverflowContainerDomNode() {
            return this._overflowContainer;
        }
        getControl() {
            return this;
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
        }
        clearInput() {
            super.clearInput();
            this._modifiedResourceDisposableStore.clear();
            this._list?.splice(0, this._list?.length || 0);
            this._model = null;
            this._diffElementViewModels.forEach(vm => vm.dispose());
            this._diffElementViewModels = [];
        }
        deltaCellOutputContainerClassNames(diffSide, cellId, added, removed) {
            if (diffSide === notebookDiffEditorBrowser_1.DiffSide.Original) {
                this._originalWebview?.deltaCellContainerClassNames(cellId, added, removed);
            }
            else {
                this._modifiedWebview?.deltaCellContainerClassNames(cellId, added, removed);
            }
        }
        getLayoutInfo() {
            if (!this._list) {
                throw new Error('Editor is not initalized successfully');
            }
            return {
                width: this._dimension.width,
                height: this._dimension.height,
                fontInfo: this._fontInfo,
                scrollHeight: this._list?.getScrollHeight() ?? 0,
                stickyHeight: 0,
            };
        }
        getCellOutputLayoutInfo(nestedCell) {
            if (!this._model) {
                throw new Error('Editor is not attached to model yet');
            }
            const documentModel = notebookCommon_1.CellUri.parse(nestedCell.uri);
            if (!documentModel) {
                throw new Error('Nested cell in the diff editor has wrong Uri');
            }
            const belongToOriginalDocument = this._model.original.notebook.uri.toString() === documentModel.notebook.toString();
            const viewModel = this._diffElementViewModels.find(element => {
                const textModel = belongToOriginalDocument ? element.original : element.modified;
                if (!textModel) {
                    return false;
                }
                if (textModel.uri.toString() === nestedCell.uri.toString()) {
                    return true;
                }
                return false;
            });
            if (!viewModel) {
                throw new Error('Nested cell in the diff editor does not match any diff element');
            }
            if (viewModel.type === 'unchanged') {
                return this.getLayoutInfo();
            }
            if (viewModel.type === 'insert' || viewModel.type === 'delete') {
                return {
                    width: this._dimension.width / 2,
                    height: this._dimension.height / 2,
                    fontInfo: this._fontInfo
                };
            }
            if (viewModel.checkIfOutputsModified()) {
                return {
                    width: this._dimension.width / 2,
                    height: this._dimension.height / 2,
                    fontInfo: this._fontInfo
                };
            }
            else {
                return this.getLayoutInfo();
            }
        }
        layout(dimension, _position) {
            this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
            const overviewRulerEnabled = this.isOverviewRulerEnabled();
            this._dimension = dimension.with(dimension.width - (overviewRulerEnabled ? NotebookTextDiffEditor_1.ENTIRE_DIFF_OVERVIEW_WIDTH : 0));
            this._listViewContainer.style.height = `${dimension.height}px`;
            this._listViewContainer.style.width = `${this._dimension.width}px`;
            this._list?.layout(this._dimension.height, this._dimension.width);
            if (this._modifiedWebview) {
                this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
                this._modifiedWebview.element.style.left = `calc(50%)`;
            }
            if (this._originalWebview) {
                this._originalWebview.element.style.width = `calc(50% - 16px)`;
                this._originalWebview.element.style.left = `16px`;
            }
            if (this._webviewTransparentCover) {
                this._webviewTransparentCover.style.height = `${this._dimension.height}px`;
                this._webviewTransparentCover.style.width = `${this._dimension.width}px`;
            }
            if (overviewRulerEnabled) {
                this._overviewRuler.layout();
            }
            this._eventDispatcher?.emit([new eventDispatcher_1.NotebookDiffLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
        }
        dispose() {
            this._isDisposed = true;
            this._layoutCancellationTokenSource?.dispose();
            this._detachModel();
            super.dispose();
        }
    };
    exports.NotebookTextDiffEditor = NotebookTextDiffEditor;
    exports.NotebookTextDiffEditor = NotebookTextDiffEditor = NotebookTextDiffEditor_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, themeService_1.IThemeService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, notebookWorkerService_1.INotebookEditorWorkerService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, storage_1.IStorageService),
        __param(7, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], NotebookTextDiffEditor);
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 10, 'notebook-diff-view-viewport-slider');
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const diffDiagonalFillColor = theme.getColor(colorRegistry_1.diffDiagonalFill);
        collector.addRule(`
	.notebook-text-diff-editor .diagonal-fill {
		background-image: linear-gradient(
			-45deg,
			${diffDiagonalFillColor} 12.5%,
			#0000 12.5%, #0000 50%,
			${diffDiagonalFillColor} 50%, ${diffDiagonalFillColor} 62.5%,
			#0000 62.5%, #0000 100%
		);
		background-size: 8px 8px;
	}
	`);
        collector.addRule(`.notebook-text-diff-editor .cell-body { margin: ${notebookDiffEditorBrowser_1.DIFF_CELL_MARGIN}px; }`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEaWZmRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2RpZmYvbm90ZWJvb2tEaWZmRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErQ2hHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsTUFBTSwyQkFBMkI7UUFFaEMsWUFDa0IsVUFBb0I7WUFBcEIsZUFBVSxHQUFWLFVBQVUsQ0FBVTtRQUNsQyxDQUFDO1FBRUwsT0FBTyxDQUFDLEtBQTJCO1lBQ2xDLElBQUksQ0FBQyxDQUFDLEtBQUssWUFBWSwyQkFBMkIsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JELDBEQUFrRDtZQUNuRCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN4RCwwREFBa0Q7WUFDbkQsQ0FBQztZQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNqRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNoRCwwREFBa0Q7Z0JBQ25ELENBQUM7WUFDRixDQUFDO1lBRUQsMERBQWtEO1FBQ25ELENBQUM7UUFFRCxPQUFPLENBQUMsT0FBdUI7WUFDOUIsTUFBTSxlQUFlLEdBQTJCO2dCQUMvQyxjQUFjLEVBQUUsSUFBQSxtQ0FBbUIsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2FBQ3BELENBQUM7WUFFRixN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
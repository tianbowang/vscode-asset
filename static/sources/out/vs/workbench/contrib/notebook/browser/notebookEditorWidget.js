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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/window", "vs/base/common/async", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uuid", "vs/editor/browser/config/fontMeasurements", "vs/editor/common/config/fontInfo", "vs/editor/common/core/range", "vs/editor/contrib/suggest/browser/suggestController", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/layout/browser/layoutService", "vs/platform/layout/browser/zIndexRegistry", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/browser/notebookLogger", "vs/workbench/contrib/notebook/browser/notebookViewEvents", "vs/workbench/contrib/notebook/browser/view/cellParts/cellContextKeys", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDnd", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView", "vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl", "vs/workbench/contrib/notebook/browser/viewModel/viewContext", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorToolbar", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorWidgetContextKeys", "vs/workbench/contrib/notebook/browser/viewParts/notebookOverviewRuler", "vs/workbench/contrib/notebook/browser/viewParts/notebookTopCellToolbar", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/common/notebookRendererMessagingService", "vs/workbench/contrib/notebook/common/notebookService", "vs/editor/browser/editorExtensions", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/notebook/browser/viewModel/cellEditorOptions", "vs/workbench/browser/codeeditor", "vs/workbench/contrib/notebook/browser/contrib/find/findModel", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/base/common/network", "vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController", "vs/editor/contrib/dropOrPasteInto/browser/copyPasteController", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorStickyScroll", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineProvider", "vs/platform/keybinding/common/keybinding", "vs/css!./media/notebook", "vs/css!./media/notebookCellChat", "vs/css!./media/notebookCellEditorHint", "vs/css!./media/notebookCellInsertToolbar", "vs/css!./media/notebookCellStatusBar", "vs/css!./media/notebookCellTitleToolbar", "vs/css!./media/notebookFocusIndicator", "vs/css!./media/notebookToolbar", "vs/css!./media/notebookDnd", "vs/css!./media/notebookFolding", "vs/css!./media/notebookCellOutput", "vs/css!./media/notebookEditorStickyScroll", "vs/css!./media/notebookKernelActionViewItem", "vs/css!./media/notebookOutline"], function (require, exports, browser_1, DOM, window_1, async_1, color_1, errors_1, event_1, lifecycle_1, platform_1, resources_1, uuid_1, fontMeasurements_1, fontInfo_1, range_1, suggestController_1, nls, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, layoutService_1, zIndexRegistry_1, progress_1, telemetry_1, colorRegistry_1, theme_1, debugColors_1, notebookBrowser_1, notebookEditorExtensions_1, notebookEditorService_1, notebookLogger_1, notebookViewEvents_1, cellContextKeys_1, cellDnd_1, notebookCellList_1, backLayerWebView_1, cellRenderer_1, codeCellViewModel_1, eventDispatcher_1, markupCellViewModel_1, notebookViewModelImpl_1, viewContext_1, notebookEditorToolbar_1, notebookEditorWidgetContextKeys_1, notebookOverviewRuler_1, notebookTopCellToolbar_1, notebookCommon_1, notebookContextKeys_1, notebookExecutionService_1, notebookExecutionStateService_1, notebookKernelService_1, notebookOptions_1, notebookRendererMessagingService_1, notebookService_1, editorExtensions_1, editorGroupsService_1, cellEditorOptions_1, codeeditor_1, findModel_1, notebookLoggingService_1, network_1, dropIntoEditorController_1, copyPasteController_1, notebookEditorStickyScroll_1, notebookOutlineProvider_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cellEditorBackground = exports.cellSymbolHighlight = exports.listScrollbarSliderActiveBackground = exports.listScrollbarSliderHoverBackground = exports.listScrollbarSliderBackground = exports.cellInsertionIndicator = exports.cellStatusBarItemHover = exports.inactiveFocusedCellBorder = exports.focusedCellBorder = exports.inactiveSelectedCellBorder = exports.selectedCellBorder = exports.cellHoverBackground = exports.selectedCellBackground = exports.focusedCellBackground = exports.CELL_TOOLBAR_SEPERATOR = exports.notebookOutputContainerColor = exports.notebookOutputContainerBorderColor = exports.cellStatusIconRunning = exports.cellStatusIconError = exports.runningCellRulerDecorationColor = exports.cellStatusIconSuccess = exports.focusedEditorBorderColor = exports.notebookCellBorder = exports.NotebookEditorWidget = exports.getDefaultNotebookCreationOptions = void 0;
    const $ = DOM.$;
    function getDefaultNotebookCreationOptions() {
        // We inlined the id to avoid loading comment contrib in tests
        const skipContributions = [
            'editor.contrib.review',
            codeeditor_1.FloatingEditorClickMenu.ID,
            'editor.contrib.dirtydiff',
            'editor.contrib.testingOutputPeek',
            'editor.contrib.testingDecorations',
            'store.contrib.stickyScrollController',
            'editor.contrib.findController',
            'editor.contrib.emptyTextEditorHint'
        ];
        const contributions = editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => skipContributions.indexOf(c.id) === -1);
        return {
            menuIds: {
                notebookToolbar: actions_1.MenuId.NotebookToolbar,
                cellTitleToolbar: actions_1.MenuId.NotebookCellTitle,
                cellDeleteToolbar: actions_1.MenuId.NotebookCellDelete,
                cellInsertToolbar: actions_1.MenuId.NotebookCellBetween,
                cellTopInsertToolbar: actions_1.MenuId.NotebookCellListTop,
                cellExecuteToolbar: actions_1.MenuId.NotebookCellExecute,
                cellExecutePrimary: actions_1.MenuId.NotebookCellExecutePrimary,
            },
            cellEditorContributions: contributions
        };
    }
    exports.getDefaultNotebookCreationOptions = getDefaultNotebookCreationOptions;
    let NotebookEditorWidget = class NotebookEditorWidget extends lifecycle_1.Disposable {
        get isVisible() {
            return this._isVisible;
        }
        get isDisposed() {
            return this._isDisposed;
        }
        set viewModel(newModel) {
            this._onWillChangeModel.fire(this._notebookViewModel?.notebookDocument);
            this._notebookViewModel = newModel;
            this._onDidChangeModel.fire(newModel?.notebookDocument);
        }
        get viewModel() {
            return this._notebookViewModel;
        }
        get textModel() {
            return this._notebookViewModel?.notebookDocument;
        }
        get isReadOnly() {
            return this._notebookViewModel?.options.isReadOnly ?? false;
        }
        get activeCodeEditor() {
            if (this._isDisposed) {
                return;
            }
            const [focused] = this._list.getFocusedElements();
            return this._renderedEditors.get(focused);
        }
        get codeEditors() {
            return [...this._renderedEditors];
        }
        get visibleRanges() {
            return this._list.visibleRanges || [];
        }
        get notebookOptions() {
            return this._notebookOptions;
        }
        constructor(creationOptions, dimension, instantiationService, editorGroupsService, notebookRendererMessaging, notebookEditorService, notebookKernelService, _notebookService, configurationService, contextKeyService, layoutService, contextMenuService, telemetryService, notebookExecutionService, notebookExecutionStateService, editorProgressService, logService, keybindingService) {
            super();
            this.creationOptions = creationOptions;
            this.notebookRendererMessaging = notebookRendererMessaging;
            this.notebookEditorService = notebookEditorService;
            this.notebookKernelService = notebookKernelService;
            this._notebookService = _notebookService;
            this.configurationService = configurationService;
            this.layoutService = layoutService;
            this.contextMenuService = contextMenuService;
            this.telemetryService = telemetryService;
            this.notebookExecutionService = notebookExecutionService;
            this.editorProgressService = editorProgressService;
            this.logService = logService;
            this.keybindingService = keybindingService;
            //#region Eventing
            this._onDidChangeCellState = this._register(new event_1.Emitter());
            this.onDidChangeCellState = this._onDidChangeCellState.event;
            this._onDidChangeViewCells = this._register(new event_1.Emitter());
            this.onDidChangeViewCells = this._onDidChangeViewCells.event;
            this._onWillChangeModel = this._register(new event_1.Emitter());
            this.onWillChangeModel = this._onWillChangeModel.event;
            this._onDidChangeModel = this._register(new event_1.Emitter());
            this.onDidChangeModel = this._onDidChangeModel.event;
            this._onDidAttachViewModel = this._register(new event_1.Emitter());
            this.onDidAttachViewModel = this._onDidAttachViewModel.event;
            this._onDidChangeOptions = this._register(new event_1.Emitter());
            this.onDidChangeOptions = this._onDidChangeOptions.event;
            this._onDidChangeDecorations = this._register(new event_1.Emitter());
            this.onDidChangeDecorations = this._onDidChangeDecorations.event;
            this._onDidScroll = this._register(new event_1.Emitter());
            this.onDidScroll = this._onDidScroll.event;
            this._onDidChangeActiveCell = this._register(new event_1.Emitter());
            this.onDidChangeActiveCell = this._onDidChangeActiveCell.event;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._onDidChangeVisibleRanges = this._register(new event_1.Emitter());
            this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
            this._onDidFocusEmitter = this._register(new event_1.Emitter());
            this.onDidFocusWidget = this._onDidFocusEmitter.event;
            this._onDidBlurEmitter = this._register(new event_1.Emitter());
            this.onDidBlurWidget = this._onDidBlurEmitter.event;
            this._onDidChangeActiveEditor = this._register(new event_1.Emitter());
            this.onDidChangeActiveEditor = this._onDidChangeActiveEditor.event;
            this._onDidChangeActiveKernel = this._register(new event_1.Emitter());
            this.onDidChangeActiveKernel = this._onDidChangeActiveKernel.event;
            this._onMouseUp = this._register(new event_1.Emitter());
            this.onMouseUp = this._onMouseUp.event;
            this._onMouseDown = this._register(new event_1.Emitter());
            this.onMouseDown = this._onMouseDown.event;
            this._onDidReceiveMessage = this._register(new event_1.Emitter());
            this.onDidReceiveMessage = this._onDidReceiveMessage.event;
            this._onDidRenderOutput = this._register(new event_1.Emitter());
            this.onDidRenderOutput = this._onDidRenderOutput.event;
            this._onDidRemoveOutput = this._register(new event_1.Emitter());
            this.onDidRemoveOutput = this._onDidRemoveOutput.event;
            this._onDidResizeOutputEmitter = this._register(new event_1.Emitter());
            this.onDidResizeOutput = this._onDidResizeOutputEmitter.event;
            this._webview = null;
            this._webviewResolvePromise = null;
            this._webviewTransparentCover = null;
            this._listDelegate = null;
            this._dndController = null;
            this._listTopCellToolbar = null;
            this._renderedEditors = new Map();
            this._localStore = this._register(new lifecycle_1.DisposableStore());
            this._localCellStateListeners = [];
            this._shadowElementViewInfo = null;
            this._contributions = new Map();
            this._insetModifyQueueByOutputId = new async_1.SequencerByKey();
            this._cellContextKeyManager = null;
            this._uuid = (0, uuid_1.generateUuid)();
            this._webviewFocused = false;
            this._isVisible = false;
            this._isDisposed = false;
            this._baseCellEditorOptions = new Map();
            this._debugFlag = false;
            this._backgroundMarkdownRenderRunning = false;
            this._lastCellWithEditorFocus = null;
            //#endregion
            //#region Cell operations/layout API
            this._pendingLayouts = new WeakMap();
            this._pendingOutputHeightAcks = new Map();
            this._dimension = dimension;
            this.isEmbedded = creationOptions.isEmbedded ?? false;
            this._readOnly = creationOptions.isReadOnly ?? false;
            this._notebookOptions = creationOptions.options ?? new notebookOptions_1.NotebookOptions(this.configurationService, notebookExecutionStateService, this._readOnly);
            this._register(this._notebookOptions);
            this._viewContext = new viewContext_1.ViewContext(this._notebookOptions, new eventDispatcher_1.NotebookEventDispatcher(), language => this.getBaseCellEditorOptions(language));
            this._register(this._viewContext.eventDispatcher.onDidChangeCellState(e => {
                this._onDidChangeCellState.fire(e);
            }));
            this._overlayContainer = document.createElement('div');
            this.scopedContextKeyService = contextKeyService.createScoped(this._overlayContainer);
            this.instantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
            this._register(_notebookService.onDidChangeOutputRenderers(() => {
                this._updateOutputRenderers();
            }));
            this._register(this.instantiationService.createInstance(notebookEditorWidgetContextKeys_1.NotebookEditorContextKeys, this));
            this._notebookOutline = this._register(this.instantiationService.createInstance(notebookOutlineProvider_1.NotebookCellOutlineProvider, this, 4 /* OutlineTarget.QuickPick */));
            this._register(notebookKernelService.onDidChangeSelectedNotebooks(e => {
                if ((0, resources_1.isEqual)(e.notebook, this.viewModel?.uri)) {
                    this._loadKernelPreloads();
                    this._onDidChangeActiveKernel.fire();
                }
            }));
            this._scrollBeyondLastLine = this.configurationService.getValue('editor.scrollBeyondLastLine');
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.scrollBeyondLastLine')) {
                    this._scrollBeyondLastLine = this.configurationService.getValue('editor.scrollBeyondLastLine');
                    if (this._dimension && this._isVisible) {
                        this.layout(this._dimension);
                    }
                }
            }));
            this._register(this._notebookOptions.onDidChangeOptions(e => {
                if (e.cellStatusBarVisibility || e.cellToolbarLocation || e.cellToolbarInteraction) {
                    this._updateForNotebookConfiguration();
                }
                if (e.fontFamily) {
                    this._generateFontInfo();
                }
                if (e.compactView
                    || e.focusIndicator
                    || e.insertToolbarPosition
                    || e.cellToolbarLocation
                    || e.dragAndDropEnabled
                    || e.fontSize
                    || e.markupFontSize
                    || e.fontFamily
                    || e.insertToolbarAlignment
                    || e.outputFontSize
                    || e.outputLineHeight
                    || e.outputFontFamily
                    || e.outputWordWrap
                    || e.outputScrolling
                    || e.outputLinkifyFilePaths) {
                    this._styleElement?.remove();
                    this._createLayoutStyles();
                    this._webview?.updateOptions({
                        ...this.notebookOptions.computeWebviewOptions(),
                        fontFamily: this._generateFontFamily()
                    });
                }
                if (this._dimension && this._isVisible) {
                    this.layout(this._dimension);
                }
            }));
            this._register(editorGroupsService.activePart.onDidScroll(e => {
                if (!this._shadowElement || !this._isVisible) {
                    return;
                }
                this.updateShadowElement(this._shadowElement, this._dimension);
                this.layoutContainerOverShadowElement(this._dimension, this._position);
            }));
            this.notebookEditorService.addNotebookEditor(this);
            const id = (0, uuid_1.generateUuid)();
            this._overlayContainer.id = `notebook-${id}`;
            this._overlayContainer.className = 'notebookOverlay';
            this._overlayContainer.classList.add('notebook-editor');
            this._overlayContainer.style.visibility = 'hidden';
            if (creationOptions.codeWindow) {
                this.layoutService.getContainer(creationOptions.codeWindow).appendChild(this._overlayContainer);
            }
            else {
                this.layoutService.mainContainer.appendChild(this._overlayContainer);
            }
            this._createBody(this._overlayContainer);
            this._generateFontInfo();
            this._isVisible = true;
            this._editorFocus = notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED.bindTo(this.scopedContextKeyService);
            this._outputFocus = notebookContextKeys_1.NOTEBOOK_OUTPUT_FOCUSED.bindTo(this.scopedContextKeyService);
            this._outputInputFocus = notebookContextKeys_1.NOTEBOOK_OUPTUT_INPUT_FOCUSED.bindTo(this.scopedContextKeyService);
            this._editorEditable = notebookContextKeys_1.NOTEBOOK_EDITOR_EDITABLE.bindTo(this.scopedContextKeyService);
            this._cursorNavMode = notebookContextKeys_1.NOTEBOOK_CURSOR_NAVIGATION_MODE.bindTo(this.scopedContextKeyService);
            this._editorEditable.set(!creationOptions.isReadOnly);
            let contributions;
            if (Array.isArray(this.creationOptions.contributions)) {
                contributions = this.creationOptions.contributions;
            }
            else {
                contributions = notebookEditorExtensions_1.NotebookEditorExtensionsRegistry.getEditorContributions();
            }
            for (const desc of contributions) {
                let contribution;
                try {
                    contribution = this.instantiationService.createInstance(desc.ctor, this);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
                if (contribution) {
                    if (!this._contributions.has(desc.id)) {
                        this._contributions.set(desc.id, contribution);
                    }
                    else {
                        contribution.dispose();
                        throw new Error(`DUPLICATE notebook editor contribution: '${desc.id}'`);
                    }
                }
            }
            this._updateForNotebookConfiguration();
        }
        _debug(...args) {
            if (!this._debugFlag) {
                return;
            }
            (0, notebookLogger_1.notebookDebug)(...args);
        }
        /**
         * EditorId
         */
        getId() {
            return this._uuid;
        }
        getViewModel() {
            return this.viewModel;
        }
        getLength() {
            return this.viewModel?.length ?? 0;
        }
        getSelections() {
            return this.viewModel?.getSelections() ?? [];
        }
        setSelections(selections) {
            if (!this.viewModel) {
                return;
            }
            const focus = this.viewModel.getFocus();
            this.viewModel.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            });
        }
        getFocus() {
            return this.viewModel?.getFocus() ?? { start: 0, end: 0 };
        }
        setFocus(focus) {
            if (!this.viewModel) {
                return;
            }
            const selections = this.viewModel.getSelections();
            this.viewModel.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            });
        }
        getSelectionViewModels() {
            if (!this.viewModel) {
                return [];
            }
            const cellsSet = new Set();
            return this.viewModel.getSelections().map(range => this.viewModel.viewCells.slice(range.start, range.end)).reduce((a, b) => {
                b.forEach(cell => {
                    if (!cellsSet.has(cell.handle)) {
                        cellsSet.add(cell.handle);
                        a.push(cell);
                    }
                });
                return a;
            }, []);
        }
        hasModel() {
            return !!this._notebookViewModel;
        }
        showProgress() {
            this._currentProgress = this.editorProgressService.show(true);
        }
        hideProgress() {
            if (this._currentProgress) {
                this._currentProgress.done();
                this._currentProgress = undefined;
            }
        }
        //#region Editor Core
        getBaseCellEditorOptions(language) {
            const existingOptions = this._baseCellEditorOptions.get(language);
            if (existingOptions) {
                return existingOptions;
            }
            else {
                const options = new cellEditorOptions_1.BaseCellEditorOptions(this, this.notebookOptions, this.configurationService, language);
                this._baseCellEditorOptions.set(language, options);
                return options;
            }
        }
        _updateForNotebookConfiguration() {
            if (!this._overlayContainer) {
                return;
            }
            this._overlayContainer.classList.remove('cell-title-toolbar-left');
            this._overlayContainer.classList.remove('cell-title-toolbar-right');
            this._overlayContainer.classList.remove('cell-title-toolbar-hidden');
            const cellToolbarLocation = this._notebookOptions.computeCellToolbarLocation(this.viewModel?.viewType);
            this._overlayContainer.classList.add(`cell-title-toolbar-${cellToolbarLocation}`);
            const cellToolbarInteraction = this._notebookOptions.getDisplayOptions().cellToolbarInteraction;
            let cellToolbarInteractionState = 'hover';
            this._overlayContainer.classList.remove('cell-toolbar-hover');
            this._overlayContainer.classList.remove('cell-toolbar-click');
            if (cellToolbarInteraction === 'hover' || cellToolbarInteraction === 'click') {
                cellToolbarInteractionState = cellToolbarInteraction;
            }
            this._overlayContainer.classList.add(`cell-toolbar-${cellToolbarInteractionState}`);
        }
        _generateFontInfo() {
            const editorOptions = this.configurationService.getValue('editor');
            this._fontInfo = fontMeasurements_1.FontMeasurements.readFontInfo(fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, browser_1.PixelRatio.value));
        }
        _createBody(parent) {
            this._notebookTopToolbarContainer = document.createElement('div');
            this._notebookTopToolbarContainer.classList.add('notebook-toolbar-container');
            this._notebookTopToolbarContainer.style.display = 'none';
            DOM.append(parent, this._notebookTopToolbarContainer);
            this._notebookStickyScrollContainer = document.createElement('div');
            this._notebookStickyScrollContainer.classList.add('notebook-sticky-scroll-container');
            DOM.append(parent, this._notebookStickyScrollContainer);
            this._body = document.createElement('div');
            DOM.append(parent, this._body);
            this._body.classList.add('cell-list-container');
            this._createLayoutStyles();
            this._createCellList();
            this._notebookOverviewRulerContainer = document.createElement('div');
            this._notebookOverviewRulerContainer.classList.add('notebook-overview-ruler-container');
            this._list.scrollableElement.appendChild(this._notebookOverviewRulerContainer);
            this._registerNotebookOverviewRuler();
            this._overflowContainer = document.createElement('div');
            this._overflowContainer.classList.add('notebook-overflow-widget-container', 'monaco-editor');
            DOM.append(parent, this._overflowContainer);
        }
        _generateFontFamily() {
            return this._fontInfo?.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
        }
        _createLayoutStyles() {
            this._styleElement = DOM.createStyleSheet(this._body);
            const { cellRightMargin, cellTopMargin, cellRunGutter, cellBottomMargin, codeCellLeftMargin, markdownCellGutter, markdownCellLeftMargin, markdownCellBottomMargin, markdownCellTopMargin, collapsedIndicatorHeight, focusIndicator, insertToolbarPosition, outputFontSize, focusIndicatorLeftMargin, focusIndicatorGap } = this._notebookOptions.getLayoutConfiguration();
            const { insertToolbarAlignment, compactView, fontSize } = this._notebookOptions.getDisplayOptions();
            const getCellEditorContainerLeftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
            const { bottomToolbarGap, bottomToolbarHeight } = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
            const styleSheets = [];
            if (!this._fontInfo) {
                this._generateFontInfo();
            }
            const fontFamily = this._generateFontFamily();
            styleSheets.push(`
		.notebook-editor {
			--notebook-cell-output-font-size: ${outputFontSize}px;
			--notebook-cell-input-preview-font-size: ${fontSize}px;
			--notebook-cell-input-preview-font-family: ${fontFamily};
		}
		`);
            if (compactView) {
                styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${getCellEditorContainerLeftMargin}px; }`);
            }
            else {
                styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${codeCellLeftMargin}px; }`);
            }
            // focus indicator
            if (focusIndicator === 'border') {
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:after {
				content: "";
				position: absolute;
				width: 100%;
				height: 1px;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				content: "";
				position: absolute;
				width: 1px;
				height: 100%;
				z-index: 10;
			}

			/* top border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before {
				border-top: 1px solid transparent;
			}

			/* left border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before {
				border-left: 1px solid transparent;
			}

			/* bottom border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before {
				border-bottom: 1px solid transparent;
			}

			/* right border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				border-right: 1px solid transparent;
			}
			`);
                // left and right border margins
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-right:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-right:before {
				top: -${cellTopMargin}px; height: calc(100% + ${cellTopMargin + cellBottomMargin}px)
			}`);
            }
            else {
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-left: 3px solid transparent;
				border-radius: 4px;
				width: 0px;
				margin-left: ${focusIndicatorLeftMargin}px;
				border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-output-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .markdown-cell-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row:hover .cell-focus-indicator-left .codeOutput-focus-indicator-container {
				display: block;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator-container:hover .codeOutput-focus-indicator {
				border-left: 5px solid transparent;
				margin-left: ${focusIndicatorLeftMargin - 1}px;
			}
			`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-inner-container.cell-output-focus .cell-focus-indicator-left .codeOutput-focus-indicator,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-inner-container .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-color: var(--vscode-notebook-focusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-inner-container .cell-focus-indicator-left .output-focus-indicator {
				margin-top: ${focusIndicatorGap}px;
			}
			`);
            }
            // between cell insert toolbar
            if (insertToolbarPosition === 'betweenCells' || insertToolbarPosition === 'both') {
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: flex; }`);
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container { display: flex; }`);
            }
            else {
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: none; }`);
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container { display: none; }`);
            }
            if (insertToolbarAlignment === 'left') {
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .action-item:first-child {
				margin-right: 0px !important;
			}`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar .action-label {
				padding: 0px !important;
				justify-content: center;
				border-radius: 4px;
			}`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container {
				align-items: flex-start;
				justify-content: left;
				margin: 0 16px 0 ${8 + codeCellLeftMargin}px;
			}`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.notebookOverlay .cell-bottom-toolbar-container .action-item {
				border: 0px;
			}`);
            }
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .code-cell-row div.cell.code { margin-left: ${getCellEditorContainerLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell { margin-right: ${cellRightMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row > .cell-inner-container { padding-top: ${cellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container.webview-backed-markdown-cell { padding: 0; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .webview-backed-markdown-cell.markdown-cell-edit-mode .cell.code { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .output { margin: 0px ${cellRightMargin}px 0px ${getCellEditorContainerLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay .output { width: calc(100% - ${getCellEditorContainerLeftMargin + cellRightMargin}px); }`);
            // comment
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { left: ${getCellEditorContainerLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { width: calc(100% - ${getCellEditorContainerLeftMargin + cellRightMargin}px); }`);
            // output collapse button
            styleSheets.push(`.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton { left: -${cellRunGutter}px; }`);
            styleSheets.push(`.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton {
			position: absolute;
			width: ${cellRunGutter}px;
			padding: 6px 0px;
		}`);
            // show more container
            styleSheets.push(`.notebookOverlay .output-show-more-container { margin: 0px ${cellRightMargin}px 0px ${getCellEditorContainerLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay .output-show-more-container { width: calc(100% - ${getCellEditorContainerLeftMargin + cellRightMargin}px); }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell.markdown { padding-left: ${cellRunGutter}px; }`);
            styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container .notebook-folding-indicator { left: ${(markdownCellGutter - 20) / 2 + markdownCellLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay > .cell-list-container .notebook-folded-hint { left: ${markdownCellGutter + markdownCellLeftMargin + 8}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row :not(.webview-backed-markdown-cell) .cell-focus-indicator-top { height: ${cellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-side { bottom: ${bottomToolbarGap}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row.code-cell-row .cell-focus-indicator-left { width: ${getCellEditorContainerLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row .cell-focus-indicator-left { width: ${codeCellLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator.cell-focus-indicator-right { width: ${cellRightMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom { height: ${cellBottomMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-shadow-container-bottom { top: ${cellBottomMargin}px; }`);
            styleSheets.push(`
			.notebookOverlay .monaco-list .monaco-list-row:has(+ .monaco-list-row.selected) .cell-focus-indicator-bottom {
				height: ${bottomToolbarGap + cellBottomMargin}px;
			}
		`);
            styleSheets.push(`
			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview {
				line-height: ${collapsedIndicatorHeight}px;
			}

			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview .monaco-tokenized-source {
				max-height: ${collapsedIndicatorHeight}px;
			}
		`);
            styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`);
            styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`);
            // cell toolbar
            styleSheets.push(`.monaco-workbench .notebookOverlay.cell-title-toolbar-right > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			right: ${cellRightMargin + 26}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-left > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			left: ${getCellEditorContainerLeftMargin + 16}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-hidden > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			display: none;
		}`);
            // cell output innert container
            styleSheets.push(`
		.monaco-workbench .notebookOverlay .output > div.foreground.output-inner-container {
			padding: ${notebookOptions_1.OutputInnerContainerTopPadding}px 8px;
		}
		.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .output-collapse-container {
			padding: ${notebookOptions_1.OutputInnerContainerTopPadding}px 8px;
		}
		`);
            // chat
            styleSheets.push(`
		.monaco-workbench .notebookOverlay .cell-chat-part {
			margin: 0 ${cellRightMargin}px 6px 4px;
		}
		`);
            this._styleElement.textContent = styleSheets.join('\n');
        }
        _createCellList() {
            this._body.classList.add('cell-list-container');
            this._dndController = this._register(new cellDnd_1.CellDragAndDropController(this, this._body));
            const getScopedContextKeyService = (container) => this._list.contextKeyService.createScoped(container);
            const renderers = [
                this.instantiationService.createInstance(cellRenderer_1.CodeCellRenderer, this, this._renderedEditors, this._dndController, getScopedContextKeyService),
                this.instantiationService.createInstance(cellRenderer_1.MarkupCellRenderer, this, this._dndController, this._renderedEditors, getScopedContextKeyService),
            ];
            renderers.forEach(renderer => {
                this._register(renderer);
            });
            this._listDelegate = this.instantiationService.createInstance(cellRenderer_1.NotebookCellListDelegate);
            this._register(this._listDelegate);
            const createNotebookAriaLabel = () => {
                const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                if (this.configurationService.getValue("accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */)) {
                    return keybinding
                        ? nls.localize('notebookTreeAriaLabelHelp', "Notebook\nUse {0} for accessibility help", keybinding)
                        : nls.localize('notebookTreeAriaLabelHelpNoKb', "Notebook\nRun the Open Accessibility Help command for more information", keybinding);
                }
                return nls.localize('notebookTreeAriaLabel', "Notebook");
            };
            this._list = this.instantiationService.createInstance(notebookCellList_1.NotebookCellList, 'NotebookCellList', this._body, this._viewContext.notebookOptions, this._listDelegate, renderers, this.scopedContextKeyService, {
                setRowLineHeight: false,
                setRowHeight: false,
                supportDynamicHeights: true,
                horizontalScrolling: false,
                keyboardSupport: false,
                mouseSupport: true,
                multipleSelectionSupport: true,
                selectionNavigation: true,
                typeNavigationEnabled: true,
                paddingTop: this._notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType),
                paddingBottom: 0,
                transformOptimization: false, //(isMacintosh && isNative) || getTitleBarStyle(this.configurationService, this.environmentService) === 'native',
                initialSize: this._dimension,
                styleController: (_suffix) => { return this._list; },
                overrideStyles: {
                    listBackground: notebookEditorBackground,
                    listActiveSelectionBackground: notebookEditorBackground,
                    listActiveSelectionForeground: colorRegistry_1.foreground,
                    listFocusAndSelectionBackground: notebookEditorBackground,
                    listFocusAndSelectionForeground: colorRegistry_1.foreground,
                    listFocusBackground: notebookEditorBackground,
                    listFocusForeground: colorRegistry_1.foreground,
                    listHoverForeground: colorRegistry_1.foreground,
                    listHoverBackground: notebookEditorBackground,
                    listHoverOutline: colorRegistry_1.focusBorder,
                    listFocusOutline: colorRegistry_1.focusBorder,
                    listInactiveSelectionBackground: notebookEditorBackground,
                    listInactiveSelectionForeground: colorRegistry_1.foreground,
                    listInactiveFocusBackground: notebookEditorBackground,
                    listInactiveFocusOutline: notebookEditorBackground,
                },
                accessibilityProvider: {
                    getAriaLabel: (element) => {
                        if (!this.viewModel) {
                            return '';
                        }
                        const index = this.viewModel.getCellIndex(element);
                        if (index >= 0) {
                            return `Cell ${index}, ${element.cellKind === notebookCommon_1.CellKind.Markup ? 'markdown' : 'code'}  cell`;
                        }
                        return '';
                    },
                    getWidgetAriaLabel: createNotebookAriaLabel
                },
            });
            this._dndController.setList(this._list);
            // create Webview
            this._register(this._list);
            this._listViewInfoAccessor = new notebookCellList_1.ListViewInfoAccessor(this._list);
            this._register(this._listViewInfoAccessor);
            this._register((0, lifecycle_1.combinedDisposable)(...renderers));
            // top cell toolbar
            this._listTopCellToolbar = this._register(this.instantiationService.createInstance(notebookTopCellToolbar_1.ListTopCellToolbar, this, this.scopedContextKeyService, this._list.rowsContainer));
            // transparent cover
            this._webviewTransparentCover = DOM.append(this._list.rowsContainer, $('.webview-cover'));
            this._webviewTransparentCover.style.display = 'none';
            this._register(DOM.addStandardDisposableGenericMouseDownListener(this._overlayContainer, (e) => {
                if (e.target.classList.contains('slider') && this._webviewTransparentCover) {
                    this._webviewTransparentCover.style.display = 'block';
                }
            }));
            this._register(DOM.addStandardDisposableGenericMouseUpListener(this._overlayContainer, () => {
                if (this._webviewTransparentCover) {
                    // no matter when
                    this._webviewTransparentCover.style.display = 'none';
                }
            }));
            this._register(this._list.onMouseDown(e => {
                if (e.element) {
                    this._onMouseDown.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this._register(this._list.onMouseUp(e => {
                if (e.element) {
                    this._onMouseUp.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this._register(this._list.onDidChangeFocus(_e => {
                this._onDidChangeActiveEditor.fire(this);
                this._onDidChangeActiveCell.fire();
                this._cursorNavMode.set(false);
            }));
            this._register(this._list.onContextMenu(e => {
                this.showListContextMenu(e);
            }));
            this._register(this._list.onDidChangeVisibleRanges(() => {
                this._onDidChangeVisibleRanges.fire();
            }));
            this._register(this._list.onDidScroll((e) => {
                this._onDidScroll.fire();
                if (e.scrollTop !== e.oldScrollTop) {
                    this.clearActiveCellWidgets();
                }
            }));
            this._focusTracker = this._register(DOM.trackFocus(this.getDomNode()));
            this._register(this._focusTracker.onDidBlur(() => {
                this._editorFocus.set(false);
                this.viewModel?.setEditorFocus(false);
                this._onDidBlurEmitter.fire();
            }));
            this._register(this._focusTracker.onDidFocus(() => {
                this._editorFocus.set(true);
                this.viewModel?.setEditorFocus(true);
                this._onDidFocusEmitter.fire();
            }));
            this._registerNotebookActionsToolbar();
            this._registerNotebookStickyScroll();
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */)) {
                    this._list.ariaLabel = createNotebookAriaLabel();
                }
            }));
        }
        showListContextMenu(e) {
            this.contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.NotebookCellTitle,
                contextKeyService: this.scopedContextKeyService,
                getAnchor: () => e.anchor
            });
        }
        _registerNotebookOverviewRuler() {
            this._notebookOverviewRuler = this._register(this.instantiationService.createInstance(notebookOverviewRuler_1.NotebookOverviewRuler, this, this._notebookOverviewRulerContainer));
        }
        _registerNotebookActionsToolbar() {
            this._notebookTopToolbar = this._register(this.instantiationService.createInstance(notebookEditorToolbar_1.NotebookEditorWorkbenchToolbar, this, this.scopedContextKeyService, this._notebookOptions, this._notebookTopToolbarContainer));
            this._register(this._notebookTopToolbar.onDidChangeVisibility(() => {
                if (this._dimension && this._isVisible) {
                    this.layout(this._dimension);
                }
            }));
        }
        _registerNotebookStickyScroll() {
            this._notebookStickyScroll = this._register(this.instantiationService.createInstance(notebookEditorStickyScroll_1.NotebookStickyScroll, this._notebookStickyScrollContainer, this, this._notebookOutline, this._list));
            const localDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._register(this._notebookStickyScroll.onDidChangeNotebookStickyScroll((sizeDelta) => {
                const d = localDisposableStore.add(DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this.getDomNode()), () => {
                    if (this.isDisposed) {
                        return;
                    }
                    if (this._dimension && this._isVisible) {
                        if (sizeDelta > 0) { // delta > 0 ==> sticky is growing, cell list shrinking
                            this.layout(this._dimension);
                            this.setScrollTop(this.scrollTop + sizeDelta);
                        }
                        else if (sizeDelta < 0) { // delta < 0 ==> sticky is shrinking, cell list growing
                            this.setScrollTop(this.scrollTop + sizeDelta);
                            this.layout(this._dimension);
                        }
                    }
                    localDisposableStore.delete(d);
                }));
            }));
        }
        _updateOutputRenderers() {
            if (!this.viewModel || !this._webview) {
                return;
            }
            this._webview.updateOutputRenderers();
            this.viewModel.viewCells.forEach(cell => {
                cell.outputsViewModels.forEach(output => {
                    if (output.pickedMimeType?.rendererId === notebookCommon_1.RENDERER_NOT_AVAILABLE) {
                        output.resetRenderer();
                    }
                });
            });
        }
        getDomNode() {
            return this._overlayContainer;
        }
        getOverflowContainerDomNode() {
            return this._overflowContainer;
        }
        getInnerWebview() {
            return this._webview?.webview;
        }
        setEditorProgressService(editorProgressService) {
            this.editorProgressService = editorProgressService;
        }
        setParentContextKeyService(parentContextKeyService) {
            this.scopedContextKeyService.updateParent(parentContextKeyService);
        }
        async setModel(textModel, viewState, perf) {
            if (this.viewModel === undefined || !this.viewModel.equal(textModel)) {
                const oldTopInsertToolbarHeight = this._notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType);
                const oldBottomToolbarDimensions = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
                this._detachModel();
                await this._attachModel(textModel, viewState, perf);
                const newTopInsertToolbarHeight = this._notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType);
                const newBottomToolbarDimensions = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
                if (oldTopInsertToolbarHeight !== newTopInsertToolbarHeight
                    || oldBottomToolbarDimensions.bottomToolbarGap !== newBottomToolbarDimensions.bottomToolbarGap
                    || oldBottomToolbarDimensions.bottomToolbarHeight !== newBottomToolbarDimensions.bottomToolbarHeight) {
                    this._styleElement?.remove();
                    this._createLayoutStyles();
                    this._webview?.updateOptions({
                        ...this.notebookOptions.computeWebviewOptions(),
                        fontFamily: this._generateFontFamily()
                    });
                }
                this.telemetryService.publicLog2('notebook/editorOpened', {
                    scheme: textModel.uri.scheme,
                    ext: (0, resources_1.extname)(textModel.uri),
                    viewType: textModel.viewType
                });
            }
            else {
                this.restoreListViewState(viewState);
            }
            this._restoreSelectedKernel(viewState);
            // load preloads for matching kernel
            this._loadKernelPreloads();
            // clear state
            this._dndController?.clearGlobalDragState();
            this._localStore.add(this._list.onDidChangeFocus(() => {
                this.updateContextKeysOnFocusChange();
            }));
            this.updateContextKeysOnFocusChange();
            // render markdown top down on idle
            this._backgroundMarkdownRendering();
        }
        _backgroundMarkdownRendering() {
            if (this._backgroundMarkdownRenderRunning) {
                return;
            }
            this._backgroundMarkdownRenderRunning = true;
            DOM.runWhenWindowIdle(DOM.getWindow(this.getDomNode()), (deadline) => {
                this._backgroundMarkdownRenderingWithDeadline(deadline);
            });
        }
        _backgroundMarkdownRenderingWithDeadline(deadline) {
            const endTime = Date.now() + deadline.timeRemaining();
            const execute = () => {
                try {
                    this._backgroundMarkdownRenderRunning = true;
                    if (this._isDisposed) {
                        return;
                    }
                    if (!this.viewModel) {
                        return;
                    }
                    const firstMarkupCell = this.viewModel.viewCells.find(cell => cell.cellKind === notebookCommon_1.CellKind.Markup && !this._webview?.markupPreviewMapping.has(cell.id) && !this.cellIsHidden(cell));
                    if (!firstMarkupCell) {
                        return;
                    }
                    this.createMarkupPreview(firstMarkupCell);
                }
                finally {
                    this._backgroundMarkdownRenderRunning = false;
                }
                if (Date.now() < endTime) {
                    (0, platform_1.setTimeout0)(execute);
                }
                else {
                    this._backgroundMarkdownRendering();
                }
            };
            execute();
        }
        updateContextKeysOnFocusChange() {
            if (!this.viewModel) {
                return;
            }
            const focused = this._list.getFocusedElements()[0];
            if (focused) {
                if (!this._cellContextKeyManager) {
                    this._cellContextKeyManager = this._localStore.add(this.instantiationService.createInstance(cellContextKeys_1.CellContextKeyManager, this, focused));
                }
                this._cellContextKeyManager.updateForElement(focused);
            }
        }
        async setOptions(options) {
            if (options?.isReadOnly !== undefined) {
                this._readOnly = options?.isReadOnly;
            }
            if (!this.viewModel) {
                return;
            }
            this.viewModel.updateOptions({ isReadOnly: this._readOnly });
            this.notebookOptions.updateOptions(this._readOnly);
            // reveal cell if editor options tell to do so
            const cellOptions = options?.cellOptions ?? this._parseIndexedCellOptions(options);
            if (cellOptions) {
                const cell = this.viewModel.viewCells.find(cell => cell.uri.toString() === cellOptions.resource.toString());
                if (cell) {
                    this.focusElement(cell);
                    const selection = cellOptions.options?.selection;
                    if (selection) {
                        cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'setOptions');
                        cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                        await this.revealRangeInCenterIfOutsideViewportAsync(cell, new range_1.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber || selection.startLineNumber, selection.endColumn || selection.startColumn));
                    }
                    else {
                        this._list.revealCell(cell, options?.cellRevealType ?? 4 /* CellRevealType.CenterIfOutsideViewport */);
                    }
                    const editor = this._renderedEditors.get(cell);
                    if (editor) {
                        if (cellOptions.options?.selection) {
                            const { selection } = cellOptions.options;
                            const editorSelection = new range_1.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber || selection.startLineNumber, selection.endColumn || selection.startColumn);
                            editor.setSelection(editorSelection);
                            editor.revealPositionInCenterIfOutsideViewport({
                                lineNumber: selection.startLineNumber,
                                column: selection.startColumn
                            });
                            await this.revealRangeInCenterIfOutsideViewportAsync(cell, editorSelection);
                        }
                        if (!cellOptions.options?.preserveFocus) {
                            editor.focus();
                        }
                    }
                }
            }
            // select cells if options tell to do so
            // todo@rebornix https://github.com/microsoft/vscode/issues/118108 support selections not just focus
            // todo@rebornix support multipe selections
            if (options?.cellSelections) {
                const focusCellIndex = options.cellSelections[0].start;
                const focusedCell = this.viewModel.cellAt(focusCellIndex);
                if (focusedCell) {
                    this.viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Index,
                        focus: { start: focusCellIndex, end: focusCellIndex + 1 },
                        selections: options.cellSelections
                    });
                    this.revealInCenterIfOutsideViewport(focusedCell);
                }
            }
            this._updateForOptions();
            this._onDidChangeOptions.fire();
        }
        _parseIndexedCellOptions(options) {
            if (options?.indexedCellOptions) {
                // convert index based selections
                const cell = this.cellAt(options.indexedCellOptions.index);
                if (cell) {
                    return {
                        resource: cell.uri,
                        options: {
                            selection: options.indexedCellOptions.selection,
                            preserveFocus: false
                        }
                    };
                }
            }
            return undefined;
        }
        _detachModel() {
            this._localStore.clear();
            (0, lifecycle_1.dispose)(this._localCellStateListeners);
            this._list.detachViewModel();
            this.viewModel?.dispose();
            // avoid event
            this.viewModel = undefined;
            this._webview?.dispose();
            this._webview?.element.remove();
            this._webview = null;
            this._list.clear();
        }
        _updateForOptions() {
            if (!this.viewModel) {
                return;
            }
            this._editorEditable.set(!this.viewModel.options.isReadOnly);
            this._overflowContainer.classList.toggle('notebook-editor-editable', !this.viewModel.options.isReadOnly);
            this.getDomNode().classList.toggle('notebook-editor-editable', !this.viewModel.options.isReadOnly);
        }
        async _resolveWebview() {
            if (!this.textModel) {
                return null;
            }
            if (this._webviewResolvePromise) {
                return this._webviewResolvePromise;
            }
            if (!this._webview) {
                this._ensureWebview(this.getId(), this.textModel.viewType, this.textModel.uri);
            }
            this._webviewResolvePromise = (async () => {
                if (!this._webview) {
                    throw new Error('Notebook output webview object is not created successfully.');
                }
                await this._webview.createWebview(this.creationOptions.codeWindow ?? window_1.mainWindow);
                if (!this._webview.webview) {
                    throw new Error('Notebook output webview element was not created successfully.');
                }
                this._localStore.add(this._webview.webview.onDidBlur(() => {
                    this._outputFocus.set(false);
                    this._webviewFocused = false;
                    this.updateEditorFocus();
                    this.updateCellFocusMode();
                }));
                this._localStore.add(this._webview.webview.onDidFocus(() => {
                    this._outputFocus.set(true);
                    this.updateEditorFocus();
                    this._webviewFocused = true;
                }));
                this._localStore.add(this._webview.onMessage(e => {
                    this._onDidReceiveMessage.fire(e);
                }));
                return this._webview;
            })();
            return this._webviewResolvePromise;
        }
        _ensureWebview(id, viewType, resource) {
            if (this._webview) {
                return;
            }
            const that = this;
            this._webview = this.instantiationService.createInstance(backLayerWebView_1.BackLayerWebView, {
                get creationOptions() { return that.creationOptions; },
                setScrollTop(scrollTop) { that._list.scrollTop = scrollTop; },
                triggerScroll(event) { that._list.triggerScrollFromMouseWheelEvent(event); },
                getCellByInfo: that.getCellByInfo.bind(that),
                getCellById: that._getCellById.bind(that),
                toggleNotebookCellSelection: that._toggleNotebookCellSelection.bind(that),
                focusNotebookCell: that.focusNotebookCell.bind(that),
                focusNextNotebookCell: that.focusNextNotebookCell.bind(that),
                updateOutputHeight: that._updateOutputHeight.bind(that),
                scheduleOutputHeightAck: that._scheduleOutputHeightAck.bind(that),
                updateMarkupCellHeight: that._updateMarkupCellHeight.bind(that),
                setMarkupCellEditState: that._setMarkupCellEditState.bind(that),
                didStartDragMarkupCell: that._didStartDragMarkupCell.bind(that),
                didDragMarkupCell: that._didDragMarkupCell.bind(that),
                didDropMarkupCell: that._didDropMarkupCell.bind(that),
                didEndDragMarkupCell: that._didEndDragMarkupCell.bind(that),
                didResizeOutput: that._didResizeOutput.bind(that),
                updatePerformanceMetadata: that._updatePerformanceMetadata.bind(that),
                didFocusOutputInputChange: that._didFocusOutputInputChange.bind(that),
            }, id, viewType, resource, {
                ...this._notebookOptions.computeWebviewOptions(),
                fontFamily: this._generateFontFamily()
            }, this.notebookRendererMessaging.getScoped(this._uuid));
            this._webview.element.style.width = '100%';
            // attach the webview container to the DOM tree first
            this._list.attachWebview(this._webview.element);
        }
        async _attachModel(textModel, viewState, perf) {
            this._ensureWebview(this.getId(), textModel.viewType, textModel.uri);
            this.viewModel = this.instantiationService.createInstance(notebookViewModelImpl_1.NotebookViewModel, textModel.viewType, textModel, this._viewContext, this.getLayoutInfo(), { isReadOnly: this._readOnly });
            this._viewContext.eventDispatcher.emit([new notebookViewEvents_1.NotebookLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
            this.notebookOptions.updateOptions(this._readOnly);
            this._updateForOptions();
            this._updateForNotebookConfiguration();
            // restore view states, including contributions
            {
                // restore view state
                this.viewModel.restoreEditorViewState(viewState);
                // contribution state restore
                const contributionsState = viewState?.contributionsState || {};
                for (const [id, contribution] of this._contributions) {
                    if (typeof contribution.restoreViewState === 'function') {
                        contribution.restoreViewState(contributionsState[id]);
                    }
                }
            }
            this._localStore.add(this.viewModel.onDidChangeViewCells(e => {
                this._onDidChangeViewCells.fire(e);
            }));
            this._localStore.add(this.viewModel.onDidChangeSelection(() => {
                this._onDidChangeSelection.fire();
                this.updateSelectedMarkdownPreviews();
            }));
            this._localStore.add(this._list.onWillScroll(e => {
                if (this._webview?.isResolved()) {
                    this._webviewTransparentCover.style.transform = `translateY(${e.scrollTop})`;
                }
            }));
            let hasPendingChangeContentHeight = false;
            this._localStore.add(this._list.onDidChangeContentHeight(() => {
                if (hasPendingChangeContentHeight) {
                    return;
                }
                hasPendingChangeContentHeight = true;
                this._localStore.add(DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this.getDomNode()), () => {
                    hasPendingChangeContentHeight = false;
                    this._updateScrollHeight();
                }, 100));
            }));
            this._localStore.add(this._list.onDidRemoveOutputs(outputs => {
                outputs.forEach(output => this.removeInset(output));
            }));
            this._localStore.add(this._list.onDidHideOutputs(outputs => {
                outputs.forEach(output => this.hideInset(output));
            }));
            this._localStore.add(this._list.onDidRemoveCellsFromView(cells => {
                const hiddenCells = [];
                const deletedCells = [];
                for (const cell of cells) {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        const mdCell = cell;
                        if (this.viewModel?.viewCells.find(cell => cell.handle === mdCell.handle)) {
                            // Cell has been folded but is still in model
                            hiddenCells.push(mdCell);
                        }
                        else {
                            // Cell was deleted
                            deletedCells.push(mdCell);
                        }
                    }
                }
                this.hideMarkupPreviews(hiddenCells);
                this.deleteMarkupPreviews(deletedCells);
            }));
            // init rendering
            await this._warmupWithMarkdownRenderer(this.viewModel, viewState);
            perf?.mark('customMarkdownLoaded');
            // model attached
            this._localCellStateListeners = this.viewModel.viewCells.map(cell => this._bindCellListener(cell));
            this._lastCellWithEditorFocus = this.viewModel.viewCells.find(viewCell => this.getActiveCell() === viewCell && viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor) ?? null;
            this._localStore.add(this.viewModel.onDidChangeViewCells((e) => {
                if (this._isDisposed) {
                    return;
                }
                // update cell listener
                [...e.splices].reverse().forEach(splice => {
                    const [start, deleted, newCells] = splice;
                    const deletedCells = this._localCellStateListeners.splice(start, deleted, ...newCells.map(cell => this._bindCellListener(cell)));
                    (0, lifecycle_1.dispose)(deletedCells);
                });
                if (e.splices.some(s => s[2].some(cell => cell.cellKind === notebookCommon_1.CellKind.Markup))) {
                    this._backgroundMarkdownRendering();
                }
            }));
            if (this._dimension) {
                this._list.layout(this.getBodyHeight(this._dimension.height), this._dimension.width);
            }
            else {
                this._list.layout();
            }
            this._dndController?.clearGlobalDragState();
            // restore list state at last, it must be after list layout
            this.restoreListViewState(viewState);
        }
        _bindCellListener(cell) {
            const store = new lifecycle_1.DisposableStore();
            store.add(cell.onDidChangeLayout(e => {
                // e.totalHeight will be false it's not changed
                if (e.totalHeight || e.outerWidth) {
                    this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight, e.context);
                }
            }));
            if (cell.cellKind === notebookCommon_1.CellKind.Code) {
                store.add(cell.onDidRemoveOutputs((outputs) => {
                    outputs.forEach(output => this.removeInset(output));
                }));
            }
            store.add(cell.onDidChangeState(e => {
                if (e.inputCollapsedChanged && cell.isInputCollapsed && cell.cellKind === notebookCommon_1.CellKind.Markup) {
                    this.hideMarkupPreviews([cell]);
                }
                if (e.outputCollapsedChanged && cell.isOutputCollapsed && cell.cellKind === notebookCommon_1.CellKind.Code) {
                    cell.outputsViewModels.forEach(output => this.hideInset(output));
                }
                if (e.focusModeChanged) {
                    this._validateCellFocusMode(cell);
                }
            }));
            return store;
        }
        _validateCellFocusMode(cell) {
            if (cell.focusMode !== notebookBrowser_1.CellFocusMode.Editor) {
                return;
            }
            if (this._lastCellWithEditorFocus && this._lastCellWithEditorFocus !== cell) {
                this._lastCellWithEditorFocus.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
            this._lastCellWithEditorFocus = cell;
        }
        async _warmupWithMarkdownRenderer(viewModel, viewState) {
            this.logService.debug('NotebookEditorWidget', 'warmup ' + this.viewModel?.uri.toString());
            await this._resolveWebview();
            this.logService.debug('NotebookEditorWidget', 'warmup - webview resolved');
            // make sure that the webview is not visible otherwise users will see pre-rendered markdown cells in wrong position as the list view doesn't have a correct `top` offset yet
            this._webview.element.style.visibility = 'hidden';
            // warm up can take around 200ms to load markdown libraries, etc.
            await this._warmupViewportMarkdownCells(viewModel, viewState);
            this.logService.debug('NotebookEditorWidget', 'warmup - viewport warmed up');
            // todo@rebornix @mjbvz, is this too complicated?
            /* now the webview is ready, and requests to render markdown are fast enough
             * we can start rendering the list view
             * render
             *   - markdown cell -> request to webview to (10ms, basically just latency between UI and iframe)
             *   - code cell -> render in place
             */
            this._list.layout(0, 0);
            this._list.attachViewModel(viewModel);
            // now the list widget has a correct contentHeight/scrollHeight
            // setting scrollTop will work properly
            // after setting scroll top, the list view will update `top` of the scrollable element, e.g. `top: -584px`
            this._list.scrollTop = viewState?.scrollPosition?.top ?? 0;
            this._debug('finish initial viewport warmup and view state restore.');
            this._webview.element.style.visibility = 'visible';
            this.logService.debug('NotebookEditorWidget', 'warmup - list view model attached, set to visible');
            this._onDidAttachViewModel.fire();
        }
        async _warmupViewportMarkdownCells(viewModel, viewState) {
            if (viewState && viewState.cellTotalHeights) {
                const totalHeightCache = viewState.cellTotalHeights;
                const scrollTop = viewState.scrollPosition?.top ?? 0;
                const scrollBottom = scrollTop + Math.max(this._dimension?.height ?? 0, 1080);
                let offset = 0;
                const requests = [];
                for (let i = 0; i < viewModel.length; i++) {
                    const cell = viewModel.cellAt(i);
                    const cellHeight = totalHeightCache[i] ?? 0;
                    if (offset + cellHeight < scrollTop) {
                        offset += cellHeight;
                        continue;
                    }
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        requests.push([cell, offset]);
                    }
                    offset += cellHeight;
                    if (offset > scrollBottom) {
                        break;
                    }
                }
                await this._webview.initializeMarkup(requests.map(([model, offset]) => this.createMarkupCellInitialization(model, offset)));
            }
            else {
                const initRequests = viewModel.viewCells
                    .filter(cell => cell.cellKind === notebookCommon_1.CellKind.Markup)
                    .slice(0, 5)
                    .map(cell => this.createMarkupCellInitialization(cell, -10000));
                await this._webview.initializeMarkup(initRequests);
                // no cached view state so we are rendering the first viewport
                // after above async call, we already get init height for markdown cells, we can update their offset
                let offset = 0;
                const offsetUpdateRequests = [];
                const scrollBottom = Math.max(this._dimension?.height ?? 0, 1080);
                for (const cell of viewModel.viewCells) {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        offsetUpdateRequests.push({ id: cell.id, top: offset });
                    }
                    offset += cell.getHeight(this.getLayoutInfo().fontInfo.lineHeight);
                    if (offset > scrollBottom) {
                        break;
                    }
                }
                this._webview?.updateScrollTops([], offsetUpdateRequests);
            }
        }
        createMarkupCellInitialization(model, offset) {
            return ({
                mime: model.mime,
                cellId: model.id,
                cellHandle: model.handle,
                content: model.getText(),
                offset: offset,
                visible: false,
                metadata: model.metadata,
            });
        }
        restoreListViewState(viewState) {
            if (!this.viewModel) {
                return;
            }
            if (viewState?.scrollPosition !== undefined) {
                this._list.scrollTop = viewState.scrollPosition.top;
                this._list.scrollLeft = viewState.scrollPosition.left;
            }
            else {
                this._list.scrollTop = 0;
                this._list.scrollLeft = 0;
            }
            const focusIdx = typeof viewState?.focus === 'number' ? viewState.focus : 0;
            if (focusIdx < this.viewModel.length) {
                const element = this.viewModel.cellAt(focusIdx);
                if (element) {
                    this.viewModel?.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: element.handle,
                        selections: [element.handle]
                    });
                }
            }
            else if (this._list.length > 0) {
                this.viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: { start: 0, end: 1 },
                    selections: [{ start: 0, end: 1 }]
                });
            }
            if (viewState?.editorFocused) {
                const cell = this.viewModel.cellAt(focusIdx);
                if (cell) {
                    cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                }
            }
        }
        _restoreSelectedKernel(viewState) {
            if (viewState?.selectedKernelId && this.textModel) {
                const matching = this.notebookKernelService.getMatchingKernel(this.textModel);
                const kernel = matching.all.find(k => k.id === viewState.selectedKernelId);
                // Selected kernel may have already been picked prior to the view state loading
                // If so, don't overwrite it with the saved kernel.
                if (kernel && !matching.selected) {
                    this.notebookKernelService.selectKernelForNotebook(kernel, this.textModel);
                }
            }
        }
        getEditorViewState() {
            const state = this.viewModel?.getEditorViewState();
            if (!state) {
                return {
                    editingCells: {},
                    cellLineNumberStates: {},
                    editorViewStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                };
            }
            if (this._list) {
                state.scrollPosition = { left: this._list.scrollLeft, top: this._list.scrollTop };
                const cellHeights = {};
                for (let i = 0; i < this.viewModel.length; i++) {
                    const elm = this.viewModel.cellAt(i);
                    cellHeights[i] = elm.layoutInfo.totalHeight;
                }
                state.cellTotalHeights = cellHeights;
                if (this.viewModel) {
                    const focusRange = this.viewModel.getFocus();
                    const element = this.viewModel.cellAt(focusRange.start);
                    if (element) {
                        const itemDOM = this._list.domElementOfElement(element);
                        const editorFocused = element.getEditState() === notebookBrowser_1.CellEditState.Editing && !!(itemDOM && itemDOM.ownerDocument.activeElement && itemDOM.contains(itemDOM.ownerDocument.activeElement));
                        state.editorFocused = editorFocused;
                        state.focus = focusRange.start;
                    }
                }
            }
            // Save contribution view states
            const contributionsState = {};
            for (const [id, contribution] of this._contributions) {
                if (typeof contribution.saveViewState === 'function') {
                    contributionsState[id] = contribution.saveViewState();
                }
            }
            state.contributionsState = contributionsState;
            if (this.textModel?.uri.scheme === network_1.Schemas.untitled) {
                state.selectedKernelId = this.activeKernel?.id;
            }
            return state;
        }
        _allowScrollBeyondLastLine() {
            return this._scrollBeyondLastLine && !this.isEmbedded;
        }
        getBodyHeight(dimensionHeight) {
            return Math.max(dimensionHeight - (this._notebookTopToolbar?.useGlobalToolbar ? /** Toolbar height */ 26 : 0), 0);
        }
        layout(dimension, shadowElement, position) {
            if (!shadowElement && this._shadowElementViewInfo === null) {
                this._dimension = dimension;
                this._position = position;
                return;
            }
            if (dimension.width <= 0 || dimension.height <= 0) {
                this.onWillHide();
                return;
            }
            if (shadowElement) {
                this.updateShadowElement(shadowElement, dimension, position);
            }
            if (this._shadowElementViewInfo && this._shadowElementViewInfo.width <= 0 && this._shadowElementViewInfo.height <= 0) {
                this.onWillHide();
                return;
            }
            this._dimension = dimension;
            this._position = position;
            const newBodyHeight = this.getBodyHeight(dimension.height) - this.getLayoutInfo().stickyHeight;
            DOM.size(this._body, dimension.width, newBodyHeight);
            const topInserToolbarHeight = this._notebookOptions.computeTopInsertToolbarHeight(this.viewModel?.viewType);
            const newCellListHeight = newBodyHeight;
            if (this._list.getRenderHeight() < newCellListHeight) {
                // the new dimension is larger than the list viewport, update its additional height first, otherwise the list view will move down a bit (as the `scrollBottom` will move down)
                this._list.updateOptions({ paddingBottom: this._allowScrollBeyondLastLine() ? Math.max(0, (newCellListHeight - 50)) : 0, paddingTop: topInserToolbarHeight });
                this._list.layout(newCellListHeight, dimension.width);
            }
            else {
                // the new dimension is smaller than the list viewport, if we update the additional height, the `scrollBottom` will move up, which moves the whole list view upwards a bit. So we run a layout first.
                this._list.layout(newCellListHeight, dimension.width);
                this._list.updateOptions({ paddingBottom: this._allowScrollBeyondLastLine() ? Math.max(0, (newCellListHeight - 50)) : 0, paddingTop: topInserToolbarHeight });
            }
            this._overlayContainer.style.visibility = 'visible';
            this._overlayContainer.style.display = 'block';
            this._overlayContainer.style.position = 'absolute';
            this._overlayContainer.style.overflow = 'hidden';
            this.layoutContainerOverShadowElement(dimension, position);
            if (this._webviewTransparentCover) {
                this._webviewTransparentCover.style.height = `${dimension.height}px`;
                this._webviewTransparentCover.style.width = `${dimension.width}px`;
            }
            this._notebookTopToolbar.layout(this._dimension);
            this._notebookOverviewRuler.layout();
            this._viewContext?.eventDispatcher.emit([new notebookViewEvents_1.NotebookLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
        }
        updateShadowElement(shadowElement, dimension, position) {
            this._shadowElement = shadowElement;
            if (dimension && position) {
                this._shadowElementViewInfo = {
                    height: dimension.height,
                    width: dimension.width,
                    top: position.top,
                    left: position.left,
                };
            }
            else {
                // We have to recompute position and size ourselves (which is slow)
                const containerRect = shadowElement.getBoundingClientRect();
                this._shadowElementViewInfo = {
                    height: containerRect.height,
                    width: containerRect.width,
                    top: containerRect.top,
                    left: containerRect.left
                };
            }
        }
        layoutContainerOverShadowElement(dimension, position) {
            if (dimension && position) {
                this._overlayContainer.style.top = `${position.top}px`;
                this._overlayContainer.style.left = `${position.left}px`;
                this._overlayContainer.style.width = `${dimension.width}px`;
                this._overlayContainer.style.height = `${dimension.height}px`;
                return;
            }
            if (!this._shadowElementViewInfo) {
                return;
            }
            const elementContainerRect = this._overlayContainer.parentElement?.getBoundingClientRect();
            this._overlayContainer.style.top = `${this._shadowElementViewInfo.top - (elementContainerRect?.top || 0)}px`;
            this._overlayContainer.style.left = `${this._shadowElementViewInfo.left - (elementContainerRect?.left || 0)}px`;
            this._overlayContainer.style.width = `${dimension ? dimension.width : this._shadowElementViewInfo.width}px`;
            this._overlayContainer.style.height = `${dimension ? dimension.height : this._shadowElementViewInfo.height}px`;
        }
        //#endregion
        //#region Focus tracker
        focus() {
            this._isVisible = true;
            this._editorFocus.set(true);
            if (this._webviewFocused) {
                this._webview?.focusWebview();
            }
            else {
                if (this.viewModel) {
                    const focusRange = this.viewModel.getFocus();
                    const element = this.viewModel.cellAt(focusRange.start);
                    // The notebook editor doesn't have focus yet
                    if (!this.hasEditorFocus()) {
                        this.focusContainer();
                        // trigger editor to update as FocusTracker might not emit focus change event
                        this.updateEditorFocus();
                    }
                    if (element && element.focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                        element.updateEditState(notebookBrowser_1.CellEditState.Editing, 'editorWidget.focus');
                        element.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                        this.focusEditor(element);
                        return;
                    }
                }
                this._list.domFocus();
            }
            if (this._currentProgress) {
                // The editor forces progress to hide when switching editors. So if progress should be visible, force it to show when the editor is focused.
                this.showProgress();
            }
        }
        onShow() {
            this._isVisible = true;
        }
        focusEditor(activeElement) {
            for (const [element, editor] of this._renderedEditors.entries()) {
                if (element === activeElement) {
                    editor.focus();
                    return;
                }
            }
        }
        focusContainer() {
            if (this._webviewFocused) {
                this._webview?.focusWebview();
            }
            else {
                this._list.focusContainer();
            }
        }
        onWillHide() {
            this._isVisible = false;
            this._editorFocus.set(false);
            this._overlayContainer.style.visibility = 'hidden';
            this._overlayContainer.style.left = '-50000px';
            this._notebookTopToolbarContainer.style.display = 'none';
            this.clearActiveCellWidgets();
        }
        clearActiveCellWidgets() {
            this._renderedEditors.forEach((editor, cell) => {
                if (this.getActiveCell() === cell && editor) {
                    suggestController_1.SuggestController.get(editor)?.cancelSuggestWidget();
                    dropIntoEditorController_1.DropIntoEditorController.get(editor)?.clearWidgets();
                    copyPasteController_1.CopyPasteController.get(editor)?.clearWidgets();
                }
            });
        }
        editorHasDomFocus() {
            return DOM.isAncestorOfActiveElement(this.getDomNode());
        }
        updateEditorFocus() {
            // Note - focus going to the webview will fire 'blur', but the webview element will be
            // a descendent of the notebook editor root.
            this._focusTracker.refreshState();
            const focused = this.editorHasDomFocus();
            this._editorFocus.set(focused);
            this.viewModel?.setEditorFocus(focused);
        }
        updateCellFocusMode() {
            const activeCell = this.getActiveCell();
            if (activeCell?.focusMode === notebookBrowser_1.CellFocusMode.Output && !this._webviewFocused) {
                // output previously has focus, but now it's blurred.
                activeCell.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
        }
        hasEditorFocus() {
            // _editorFocus is driven by the FocusTracker, which is only guaranteed to _eventually_ fire blur.
            // If we need to know whether we have focus at this instant, we need to check the DOM manually.
            this.updateEditorFocus();
            return this.editorHasDomFocus();
        }
        hasWebviewFocus() {
            return this._webviewFocused;
        }
        hasOutputTextSelection() {
            if (!this.hasEditorFocus()) {
                return false;
            }
            const windowSelection = DOM.getWindow(this.getDomNode()).getSelection();
            if (windowSelection?.rangeCount !== 1) {
                return false;
            }
            const activeSelection = windowSelection.getRangeAt(0);
            if (activeSelection.startContainer === activeSelection.endContainer && activeSelection.endOffset - activeSelection.startOffset === 0) {
                return false;
            }
            let container = activeSelection.commonAncestorContainer;
            if (!this._body.contains(container)) {
                return false;
            }
            while (container
                &&
                    container !== this._body) {
                if (container.classList && container.classList.contains('output')) {
                    return true;
                }
                container = container.parentNode;
            }
            return false;
        }
        _didFocusOutputInputChange(hasFocus) {
            this._outputInputFocus.set(hasFocus);
        }
        //#endregion
        //#region Editor Features
        focusElement(cell) {
            this.viewModel?.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Handle,
                primary: cell.handle,
                selections: [cell.handle]
            });
        }
        get scrollTop() {
            return this._list.scrollTop;
        }
        getAbsoluteTopOfElement(cell) {
            return this._list.getCellViewScrollTop(cell);
        }
        scrollToBottom() {
            this._list.scrollToBottom();
        }
        setScrollTop(scrollTop) {
            this._list.scrollTop = scrollTop;
        }
        revealCellRangeInView(range) {
            return this._list.revealCells(range);
        }
        revealInView(cell) {
            return this._list.revealCell(cell, 1 /* CellRevealType.Default */);
        }
        revealInViewAtTop(cell) {
            this._list.revealCell(cell, 2 /* CellRevealType.Top */);
        }
        revealInCenter(cell) {
            this._list.revealCell(cell, 3 /* CellRevealType.Center */);
        }
        async revealInCenterIfOutsideViewport(cell) {
            await this._list.revealCell(cell, 4 /* CellRevealType.CenterIfOutsideViewport */);
        }
        revealFirstLineIfOutsideViewport(cell) {
            this._list.revealCell(cell, 6 /* CellRevealType.FirstLineIfOutsideViewport */);
        }
        async revealLineInViewAsync(cell, line) {
            return this._list.revealRangeInCell(cell, new range_1.Range(line, 1, line, 1), notebookBrowser_1.CellRevealRangeType.Default);
        }
        async revealLineInCenterAsync(cell, line) {
            return this._list.revealRangeInCell(cell, new range_1.Range(line, 1, line, 1), notebookBrowser_1.CellRevealRangeType.Center);
        }
        async revealLineInCenterIfOutsideViewportAsync(cell, line) {
            return this._list.revealRangeInCell(cell, new range_1.Range(line, 1, line, 1), notebookBrowser_1.CellRevealRangeType.CenterIfOutsideViewport);
        }
        async revealRangeInViewAsync(cell, range) {
            return this._list.revealRangeInCell(cell, range, notebookBrowser_1.CellRevealRangeType.Default);
        }
        async revealRangeInCenterAsync(cell, range) {
            return this._list.revealRangeInCell(cell, range, notebookBrowser_1.CellRevealRangeType.Center);
        }
        async revealRangeInCenterIfOutsideViewportAsync(cell, range) {
            return this._list.revealRangeInCell(cell, range, notebookBrowser_1.CellRevealRangeType.CenterIfOutsideViewport);
        }
        revealCellOffsetInCenter(cell, offset) {
            return this._list.revealCellOffsetInCenter(cell, offset);
        }
        getViewIndexByModelIndex(index) {
            if (!this._listViewInfoAccessor) {
                return -1;
            }
            const cell = this.viewModel?.viewCells[index];
            if (!cell) {
                return -1;
            }
            return this._listViewInfoAccessor.getViewIndex(cell);
        }
        getViewHeight(cell) {
            if (!this._listViewInfoAccessor) {
                return -1;
            }
            return this._listViewInfoAccessor.getViewHeight(cell);
        }
        getCellRangeFromViewRange(startIndex, endIndex) {
            return this._listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex);
        }
        getCellsInRange(range) {
            return this._listViewInfoAccessor.getCellsInRange(range);
        }
        setCellEditorSelection(cell, range) {
            this._list.setCellEditorSelection(cell, range);
        }
        setHiddenAreas(_ranges) {
            return this._list.setHiddenAreas(_ranges, true);
        }
        getVisibleRangesPlusViewportAboveAndBelow() {
            return this._listViewInfoAccessor.getVisibleRangesPlusViewportAboveAndBelow();
        }
        //#endregion
        //#region Decorations
        deltaCellDecorations(oldDecorations, newDecorations) {
            const ret = this.viewModel?.deltaCellDecorations(oldDecorations, newDecorations) || [];
            this._onDidChangeDecorations.fire();
            return ret;
        }
        deltaCellContainerClassNames(cellId, added, removed) {
            this._webview?.deltaCellContainerClassNames(cellId, added, removed);
        }
        changeModelDecorations(callback) {
            return this.viewModel?.changeModelDecorations(callback) || null;
        }
        //#endregion
        //#region Kernel/Execution
        async _loadKernelPreloads() {
            if (!this.hasModel()) {
                return;
            }
            const { selected } = this.notebookKernelService.getMatchingKernel(this.textModel);
            if (!this._webview?.isResolved()) {
                await this._resolveWebview();
            }
            this._webview?.updateKernelPreloads(selected);
        }
        get activeKernel() {
            return this.textModel && this.notebookKernelService.getSelectedOrSuggestedKernel(this.textModel);
        }
        async cancelNotebookCells(cells) {
            if (!this.viewModel || !this.hasModel()) {
                return;
            }
            if (!cells) {
                cells = this.viewModel.viewCells;
            }
            return this.notebookExecutionService.cancelNotebookCellHandles(this.textModel, Array.from(cells).map(cell => cell.handle));
        }
        async executeNotebookCells(cells) {
            if (!this.viewModel || !this.hasModel()) {
                this.logService.info('notebookEditorWidget', 'No NotebookViewModel, cannot execute cells');
                return;
            }
            if (!cells) {
                cells = this.viewModel.viewCells;
            }
            return this.notebookExecutionService.executeNotebookCells(this.textModel, Array.from(cells).map(c => c.model), this.scopedContextKeyService);
        }
        async layoutNotebookCell(cell, height, context) {
            this._debug('layout cell', cell.handle, height);
            const viewIndex = this._list.getViewIndex(cell);
            if (viewIndex === undefined) {
                // the cell is hidden
                return;
            }
            if (this._pendingLayouts?.has(cell)) {
                this._pendingLayouts?.get(cell).dispose();
            }
            const deferred = new async_1.DeferredPromise();
            const doLayout = () => {
                if (this._isDisposed) {
                    return;
                }
                if (!this.viewModel?.hasCell(cell)) {
                    // Cell removed in the meantime?
                    return;
                }
                if (this._list.getViewIndex(cell) === undefined) {
                    // Cell can be hidden
                    return;
                }
                if (this._list.elementHeight(cell) === height) {
                    return;
                }
                this._pendingLayouts?.delete(cell);
                if (!this.hasEditorFocus()) {
                    // Do not scroll inactive notebook
                    // https://github.com/microsoft/vscode/issues/145340
                    const cellIndex = this.viewModel?.getCellIndex(cell);
                    const visibleRanges = this.visibleRanges;
                    if (cellIndex !== undefined
                        && visibleRanges && visibleRanges.length && visibleRanges[0].start === cellIndex
                        // cell is partially visible
                        && this._list.scrollTop > this.getAbsoluteTopOfElement(cell)) {
                        return this._list.updateElementHeight2(cell, height, Math.min(cellIndex + 1, this.getLength() - 1));
                    }
                }
                this._list.updateElementHeight2(cell, height);
                deferred.complete(undefined);
            };
            if (this._list.inRenderingTransaction) {
                const layoutDisposable = DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this.getDomNode()), doLayout);
                this._pendingLayouts?.set(cell, (0, lifecycle_1.toDisposable)(() => {
                    layoutDisposable.dispose();
                    deferred.complete(undefined);
                }));
            }
            else {
                doLayout();
            }
            return deferred.p;
        }
        getActiveCell() {
            const elements = this._list.getFocusedElements();
            if (elements && elements.length) {
                return elements[0];
            }
            return undefined;
        }
        _toggleNotebookCellSelection(selectedCell, selectFromPrevious) {
            const currentSelections = this._list.getSelectedElements();
            const isSelected = currentSelections.includes(selectedCell);
            const previousSelection = selectFromPrevious ? currentSelections[currentSelections.length - 1] ?? selectedCell : selectedCell;
            const selectedIndex = this._list.getViewIndex(selectedCell);
            const previousIndex = this._list.getViewIndex(previousSelection);
            const cellsInSelectionRange = this.getCellsInViewRange(selectedIndex, previousIndex);
            if (isSelected) {
                // Deselect
                this._list.selectElements(currentSelections.filter(current => !cellsInSelectionRange.includes(current)));
            }
            else {
                // Add to selection
                this.focusElement(selectedCell);
                this._list.selectElements([...currentSelections.filter(current => !cellsInSelectionRange.includes(current)), ...cellsInSelectionRange]);
            }
        }
        getCellsInViewRange(fromInclusive, toInclusive) {
            const selectedCellsInRange = [];
            for (let index = 0; index < this._list.length; ++index) {
                const cell = this._list.element(index);
                if (cell) {
                    if ((index >= fromInclusive && index <= toInclusive) || (index >= toInclusive && index <= fromInclusive)) {
                        selectedCellsInRange.push(cell);
                    }
                }
            }
            return selectedCellsInRange;
        }
        async focusNotebookCell(cell, focusItem, options) {
            if (this._isDisposed) {
                return;
            }
            if (focusItem === 'editor') {
                this.focusElement(cell);
                this._list.focusView();
                cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                if (!options?.skipReveal) {
                    if (typeof options?.focusEditorLine === 'number') {
                        this._cursorNavMode.set(true);
                        await this.revealLineInViewAsync(cell, options.focusEditorLine);
                        const editor = this._renderedEditors.get(cell);
                        const focusEditorLine = options.focusEditorLine;
                        editor?.setSelection({
                            startLineNumber: focusEditorLine,
                            startColumn: 1,
                            endLineNumber: focusEditorLine,
                            endColumn: 1
                        });
                    }
                    else {
                        const selectionsStartPosition = cell.getSelectionsStartPosition();
                        if (selectionsStartPosition?.length) {
                            const firstSelectionPosition = selectionsStartPosition[0];
                            await this.revealRangeInViewAsync(cell, range_1.Range.fromPositions(firstSelectionPosition, firstSelectionPosition));
                        }
                        else {
                            await this.revealInView(cell);
                        }
                    }
                }
            }
            else if (focusItem === 'output') {
                this.focusElement(cell);
                if (!this.hasEditorFocus()) {
                    this._list.focusView();
                }
                if (!this._webview) {
                    return;
                }
                const focusElementId = options?.outputId ?? cell.id;
                this._webview.focusOutput(focusElementId, options?.altOutputId, options?.outputWebviewFocused || this._webviewFocused);
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Output;
                if (!options?.skipReveal) {
                    this.revealInCenterIfOutsideViewport(cell);
                }
            }
            else {
                // focus container
                const itemDOM = this._list.domElementOfElement(cell);
                if (itemDOM && itemDOM.ownerDocument.activeElement && itemDOM.contains(itemDOM.ownerDocument.activeElement)) {
                    itemDOM.ownerDocument.activeElement.blur();
                }
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Container;
                this.focusElement(cell);
                if (!options?.skipReveal) {
                    if (typeof options?.focusEditorLine === 'number') {
                        this._cursorNavMode.set(true);
                        await this.revealInView(cell);
                    }
                    else if (options?.revealBehavior === notebookBrowser_1.ScrollToRevealBehavior.firstLine) {
                        this.revealFirstLineIfOutsideViewport(cell);
                    }
                    else if (options?.revealBehavior === notebookBrowser_1.ScrollToRevealBehavior.fullCell) {
                        await this.revealInView(cell);
                    }
                    else {
                        await this.revealInCenterIfOutsideViewport(cell);
                    }
                }
                this._list.focusView();
                this.updateEditorFocus();
            }
        }
        async focusNextNotebookCell(cell, focusItem) {
            const idx = this.viewModel?.getCellIndex(cell);
            if (typeof idx !== 'number') {
                return;
            }
            const newCell = this.viewModel?.cellAt(idx + 1);
            if (!newCell) {
                return;
            }
            await this.focusNotebookCell(newCell, focusItem);
        }
        //#endregion
        //#region Find
        async _warmupCell(viewCell) {
            if (viewCell.isOutputCollapsed) {
                return;
            }
            const outputs = viewCell.outputsViewModels;
            for (const output of outputs.slice(0, codeCellViewModel_1.outputDisplayLimit)) {
                const [mimeTypes, pick] = output.resolveMimeTypes(this.textModel, undefined);
                if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                    continue;
                }
                const pickedMimeTypeRenderer = mimeTypes[pick];
                if (!pickedMimeTypeRenderer) {
                    return;
                }
                const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                if (!renderer) {
                    return;
                }
                const result = { type: 1 /* RenderOutputType.Extension */, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
                const inset = this._webview?.insetMapping.get(result.source);
                if (!inset || !inset.initialized) {
                    const p = new Promise(resolve => {
                        this._register(event_1.Event.any(this.onDidRenderOutput, this.onDidRemoveOutput)(e => {
                            if (e.model === result.source.model) {
                                resolve();
                            }
                        }));
                    });
                    this.createOutput(viewCell, result, 0, false);
                    await p;
                }
                else {
                    // request to update its visibility
                    this.createOutput(viewCell, result, 0, false);
                }
                return;
            }
        }
        async _warmupAll(includeOutput) {
            if (!this.hasModel() || !this.viewModel) {
                return;
            }
            const cells = this.viewModel.viewCells;
            const requests = [];
            for (let i = 0; i < cells.length; i++) {
                if (cells[i].cellKind === notebookCommon_1.CellKind.Markup && !this._webview.markupPreviewMapping.has(cells[i].id)) {
                    requests.push(this.createMarkupPreview(cells[i]));
                }
            }
            if (includeOutput && this._list) {
                for (let i = 0; i < this._list.length; i++) {
                    const cell = this._list.element(i);
                    if (cell?.cellKind === notebookCommon_1.CellKind.Code) {
                        requests.push(this._warmupCell(cell));
                    }
                }
            }
            return Promise.all(requests);
        }
        async find(query, options, token, skipWarmup = false, shouldGetSearchPreviewInfo = false, ownerID) {
            if (!this._notebookViewModel) {
                return [];
            }
            if (!ownerID) {
                ownerID = this.getId();
            }
            const findMatches = this._notebookViewModel.find(query, options).filter(match => match.length > 0);
            if (!options.includeMarkupPreview && !options.includeOutput) {
                this._webview?.findStop(ownerID);
                return findMatches;
            }
            // search in webview enabled
            const matchMap = {};
            findMatches.forEach(match => {
                matchMap[match.cell.id] = match;
            });
            if (this._webview) {
                // request all outputs to be rendered
                // measure perf
                const start = Date.now();
                await this._warmupAll(!!options.includeOutput);
                const end = Date.now();
                this.logService.debug('Find', `Warmup time: ${end - start}ms`);
                if (token.isCancellationRequested) {
                    return [];
                }
                const webviewMatches = await this._webview.find(query, { caseSensitive: options.caseSensitive, wholeWord: options.wholeWord, includeMarkup: !!options.includeMarkupPreview, includeOutput: !!options.includeOutput, shouldGetSearchPreviewInfo, ownerID });
                if (token.isCancellationRequested) {
                    return [];
                }
                // attach webview matches to model find matches
                webviewMatches.forEach(match => {
                    const cell = this._notebookViewModel.viewCells.find(cell => cell.id === match.cellId);
                    if (!cell) {
                        return;
                    }
                    if (match.type === 'preview') {
                        // markup preview
                        if (cell.getEditState() === notebookBrowser_1.CellEditState.Preview && !options.includeMarkupPreview) {
                            return;
                        }
                        if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && options.includeMarkupInput) {
                            return;
                        }
                    }
                    else {
                        if (!options.includeOutput) {
                            // skip outputs if not included
                            return;
                        }
                    }
                    const exisitingMatch = matchMap[match.cellId];
                    if (exisitingMatch) {
                        exisitingMatch.webviewMatches.push(match);
                    }
                    else {
                        matchMap[match.cellId] = new findModel_1.CellFindMatchModel(this._notebookViewModel.viewCells.find(cell => cell.id === match.cellId), this._notebookViewModel.viewCells.findIndex(cell => cell.id === match.cellId), [], [match]);
                    }
                });
            }
            const ret = [];
            this._notebookViewModel.viewCells.forEach((cell, index) => {
                if (matchMap[cell.id]) {
                    ret.push(new findModel_1.CellFindMatchModel(cell, index, matchMap[cell.id].contentMatches, matchMap[cell.id].webviewMatches));
                }
            });
            return ret;
        }
        async findHighlightCurrent(matchIndex, ownerID) {
            if (!this._webview) {
                return 0;
            }
            return this._webview?.findHighlightCurrent(matchIndex, ownerID ?? this.getId());
        }
        async findUnHighlightCurrent(matchIndex, ownerID) {
            if (!this._webview) {
                return;
            }
            return this._webview?.findUnHighlightCurrent(matchIndex, ownerID ?? this.getId());
        }
        findStop(ownerID) {
            this._webview?.findStop(ownerID ?? this.getId());
        }
        //#endregion
        //#region MISC
        getLayoutInfo() {
            if (!this._list) {
                throw new Error('Editor is not initalized successfully');
            }
            if (!this._fontInfo) {
                this._generateFontInfo();
            }
            return {
                width: this._dimension?.width ?? 0,
                height: this._dimension?.height ?? 0,
                scrollHeight: this._list?.getScrollHeight() ?? 0,
                fontInfo: this._fontInfo,
                stickyHeight: this._notebookStickyScroll?.getCurrentStickyHeight() ?? 0
            };
        }
        async createMarkupPreview(cell) {
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            if (!this._webview || !this._list.webviewElement) {
                return;
            }
            if (!this.viewModel || !this._list.viewModel) {
                return;
            }
            if (this.viewModel.getCellIndex(cell) === -1) {
                return;
            }
            if (this.cellIsHidden(cell)) {
                return;
            }
            const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
            const top = !!webviewTop ? (0 - webviewTop) : 0;
            const cellTop = this._list.getCellViewScrollTop(cell);
            await this._webview.showMarkupPreview({
                mime: cell.mime,
                cellHandle: cell.handle,
                cellId: cell.id,
                content: cell.getText(),
                offset: cellTop + top,
                visible: true,
                metadata: cell.metadata,
            });
        }
        cellIsHidden(cell) {
            const modelIndex = this.viewModel.getCellIndex(cell);
            const foldedRanges = this.viewModel.getHiddenRanges();
            return foldedRanges.some(range => modelIndex >= range.start && modelIndex <= range.end);
        }
        async unhideMarkupPreviews(cells) {
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            await this._webview?.unhideMarkupPreviews(cells.map(cell => cell.id));
        }
        async hideMarkupPreviews(cells) {
            if (!this._webview || !cells.length) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            await this._webview?.hideMarkupPreviews(cells.map(cell => cell.id));
        }
        async deleteMarkupPreviews(cells) {
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            await this._webview?.deleteMarkupPreviews(cells.map(cell => cell.id));
        }
        async updateSelectedMarkdownPreviews() {
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            const selectedCells = this.getSelectionViewModels().map(cell => cell.id);
            // Only show selection when there is more than 1 cell selected
            await this._webview?.updateMarkupPreviewSelections(selectedCells.length > 1 ? selectedCells : []);
        }
        async createOutput(cell, output, offset, createWhenIdle) {
            this._insetModifyQueueByOutputId.queue(output.source.model.outputId, async () => {
                if (this._isDisposed || !this._webview) {
                    return;
                }
                if (!this._webview.isResolved()) {
                    await this._resolveWebview();
                }
                if (!this._webview) {
                    return;
                }
                if (!this._list.webviewElement) {
                    return;
                }
                if (output.type === 1 /* RenderOutputType.Extension */) {
                    this.notebookRendererMessaging.prepare(output.renderer.id);
                }
                const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
                const top = !!webviewTop ? (0 - webviewTop) : 0;
                const cellTop = this._list.getCellViewScrollTop(cell) + top;
                const existingOutput = this._webview.insetMapping.get(output.source);
                if (!existingOutput
                    || (!existingOutput.renderer && output.type === 1 /* RenderOutputType.Extension */)) {
                    if (createWhenIdle) {
                        this._webview.requestCreateOutputWhenWebviewIdle({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
                    }
                    else {
                        this._webview.createOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
                    }
                }
                else if (existingOutput.renderer
                    && output.type === 1 /* RenderOutputType.Extension */
                    && existingOutput.renderer.id !== output.renderer.id) {
                    // switch mimetype
                    this._webview.removeInsets([output.source]);
                    this._webview.createOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri }, output, cellTop, offset);
                }
                else if (existingOutput.versionId !== output.source.model.versionId) {
                    this._webview.updateOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
                }
                else {
                    const outputIndex = cell.outputsViewModels.indexOf(output.source);
                    const outputOffset = cell.getOutputOffset(outputIndex);
                    this._webview.updateScrollTops([{
                            cell,
                            output: output.source,
                            cellTop,
                            outputOffset,
                            forceDisplay: !cell.isOutputCollapsed,
                        }], []);
                }
            });
        }
        async updateOutput(cell, output, offset) {
            this._insetModifyQueueByOutputId.queue(output.source.model.outputId, async () => {
                if (this._isDisposed || !this._webview) {
                    return;
                }
                if (!this._webview.isResolved()) {
                    await this._resolveWebview();
                }
                if (!this._webview || !this._list.webviewElement) {
                    return;
                }
                if (!this._webview.insetMapping.has(output.source)) {
                    return this.createOutput(cell, output, offset, false);
                }
                if (output.type === 1 /* RenderOutputType.Extension */) {
                    this.notebookRendererMessaging.prepare(output.renderer.id);
                }
                const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
                const top = !!webviewTop ? (0 - webviewTop) : 0;
                const cellTop = this._list.getCellViewScrollTop(cell) + top;
                this._webview.updateOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri }, output, cellTop, offset);
            });
        }
        async copyOutputImage(cellOutput) {
            this._webview?.copyImage(cellOutput);
        }
        removeInset(output) {
            this._insetModifyQueueByOutputId.queue(output.model.outputId, async () => {
                if (this._isDisposed || !this._webview) {
                    return;
                }
                if (this._webview?.isResolved()) {
                    this._webview.removeInsets([output]);
                }
                this._onDidRemoveOutput.fire(output);
            });
        }
        hideInset(output) {
            this._insetModifyQueueByOutputId.queue(output.model.outputId, async () => {
                if (this._isDisposed || !this._webview) {
                    return;
                }
                if (this._webview?.isResolved()) {
                    this._webview.hideInset(output);
                }
            });
        }
        //#region --- webview IPC ----
        postMessage(message) {
            if (this._webview?.isResolved()) {
                this._webview.postKernelMessage(message);
            }
        }
        //#endregion
        addClassName(className) {
            this._overlayContainer.classList.add(className);
        }
        removeClassName(className) {
            this._overlayContainer.classList.remove(className);
        }
        cellAt(index) {
            return this.viewModel?.cellAt(index);
        }
        getCellByInfo(cellInfo) {
            const { cellHandle } = cellInfo;
            return this.viewModel?.viewCells.find(vc => vc.handle === cellHandle);
        }
        getCellByHandle(handle) {
            return this.viewModel?.getCellByHandle(handle);
        }
        getCellIndex(cell) {
            return this.viewModel?.getCellIndexByHandle(cell.handle);
        }
        getNextVisibleCellIndex(index) {
            return this.viewModel?.getNextVisibleCellIndex(index);
        }
        getPreviousVisibleCellIndex(index) {
            return this.viewModel?.getPreviousVisibleCellIndex(index);
        }
        _updateScrollHeight() {
            if (this._isDisposed || !this._webview?.isResolved()) {
                return;
            }
            if (!this._list.webviewElement) {
                return;
            }
            const scrollHeight = this._list.scrollHeight;
            this._webview.element.style.height = `${scrollHeight + notebookCellList_1.NOTEBOOK_WEBVIEW_BOUNDARY * 2}px`;
            const webviewTop = parseInt(this._list.webviewElement.domNode.style.top, 10);
            const top = !!webviewTop ? (0 - webviewTop) : 0;
            const updateItems = [];
            const removedItems = [];
            this._webview?.insetMapping.forEach((value, key) => {
                const cell = this.viewModel?.getCellByHandle(value.cellInfo.cellHandle);
                if (!cell || !(cell instanceof codeCellViewModel_1.CodeCellViewModel)) {
                    return;
                }
                this.viewModel?.viewCells.find(cell => cell.handle === value.cellInfo.cellHandle);
                const viewIndex = this._list.getViewIndex(cell);
                if (viewIndex === undefined) {
                    return;
                }
                if (cell.outputsViewModels.indexOf(key) < 0) {
                    // output is already gone
                    removedItems.push(key);
                }
                const cellTop = this._list.getCellViewScrollTop(cell);
                const outputIndex = cell.outputsViewModels.indexOf(key);
                const outputOffset = cell.getOutputOffset(outputIndex);
                updateItems.push({
                    cell,
                    output: key,
                    cellTop: cellTop + top,
                    outputOffset,
                    forceDisplay: false,
                });
            });
            this._webview.removeInsets(removedItems);
            const markdownUpdateItems = [];
            for (const cellId of this._webview.markupPreviewMapping.keys()) {
                const cell = this.viewModel?.viewCells.find(cell => cell.id === cellId);
                if (cell) {
                    const cellTop = this._list.getCellViewScrollTop(cell);
                    // markdownUpdateItems.push({ id: cellId, top: cellTop });
                    markdownUpdateItems.push({ id: cellId, top: cellTop + top });
                }
            }
            if (markdownUpdateItems.length || updateItems.length) {
                this._debug('_list.onDidChangeContentHeight/markdown', markdownUpdateItems);
                this._webview?.updateScrollTops(updateItems, markdownUpdateItems);
            }
        }
        //#endregion
        //#region BacklayerWebview delegate
        _updateOutputHeight(cellInfo, output, outputHeight, isInit, source) {
            const cell = this.viewModel?.viewCells.find(vc => vc.handle === cellInfo.cellHandle);
            if (cell && cell instanceof codeCellViewModel_1.CodeCellViewModel) {
                const outputIndex = cell.outputsViewModels.indexOf(output);
                this._debug('update cell output', cell.handle, outputHeight);
                cell.updateOutputHeight(outputIndex, outputHeight, source);
                this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight);
                if (isInit) {
                    this._onDidRenderOutput.fire(output);
                }
            }
        }
        _scheduleOutputHeightAck(cellInfo, outputId, height) {
            const wasEmpty = this._pendingOutputHeightAcks.size === 0;
            this._pendingOutputHeightAcks.set(outputId, { cellId: cellInfo.cellId, outputId, height });
            if (wasEmpty) {
                DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this.getDomNode()), () => {
                    this._debug('ack height');
                    this._updateScrollHeight();
                    this._webview?.ackHeight([...this._pendingOutputHeightAcks.values()]);
                    this._pendingOutputHeightAcks.clear();
                }, -1); // -1 priority because this depends on calls to layoutNotebookCell, and that may be called multiple times before this runs
            }
        }
        _getCellById(cellId) {
            return this.viewModel?.viewCells.find(vc => vc.id === cellId);
        }
        _updateMarkupCellHeight(cellId, height, isInit) {
            const cell = this._getCellById(cellId);
            if (cell && cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                const { bottomToolbarGap } = this._notebookOptions.computeBottomToolbarDimensions(this.viewModel?.viewType);
                this._debug('updateMarkdownCellHeight', cell.handle, height + bottomToolbarGap, isInit);
                cell.renderedMarkdownHeight = height;
            }
        }
        _setMarkupCellEditState(cellId, editState) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this.revealInView(cell);
                cell.updateEditState(editState, 'setMarkdownCellEditState');
            }
        }
        _didStartDragMarkupCell(cellId, event) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                const webviewOffset = this._list.webviewElement ? -parseInt(this._list.webviewElement.domNode.style.top, 10) : 0;
                this._dndController?.startExplicitDrag(cell, event.dragOffsetY - webviewOffset);
            }
        }
        _didDragMarkupCell(cellId, event) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                const webviewOffset = this._list.webviewElement ? -parseInt(this._list.webviewElement.domNode.style.top, 10) : 0;
                this._dndController?.explicitDrag(cell, event.dragOffsetY - webviewOffset);
            }
        }
        _didDropMarkupCell(cellId, event) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                const webviewOffset = this._list.webviewElement ? -parseInt(this._list.webviewElement.domNode.style.top, 10) : 0;
                event.dragOffsetY -= webviewOffset;
                this._dndController?.explicitDrop(cell, event);
            }
        }
        _didEndDragMarkupCell(cellId) {
            const cell = this._getCellById(cellId);
            if (cell instanceof markupCellViewModel_1.MarkupCellViewModel) {
                this._dndController?.endExplicitDrag(cell);
            }
        }
        _didResizeOutput(cellId) {
            const cell = this._getCellById(cellId);
            if (cell) {
                this._onDidResizeOutputEmitter.fire(cell);
            }
        }
        _updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
            if (!this.hasModel()) {
                return;
            }
            const cell = this._getCellById(cellId);
            const cellIndex = !cell ? undefined : this.getCellIndex(cell);
            if (cell?.internalMetadata.executionId === executionId && cellIndex !== undefined) {
                const renderDurationMap = cell.internalMetadata.renderDuration || {};
                renderDurationMap[rendererId] = (renderDurationMap[rendererId] ?? 0) + duration;
                this.textModel.applyEdits([
                    {
                        editType: 9 /* CellEditType.PartialInternalMetadata */,
                        index: cellIndex,
                        internalMetadata: {
                            executionId: executionId,
                            renderDuration: renderDurationMap
                        }
                    }
                ], true, undefined, () => undefined, undefined, false);
            }
        }
        //#endregion
        //#region Editor Contributions
        getContribution(id) {
            return (this._contributions.get(id) || null);
        }
        //#endregion
        dispose() {
            this._isDisposed = true;
            // dispose webview first
            this._webview?.dispose();
            this._webview = null;
            this.notebookEditorService.removeNotebookEditor(this);
            (0, lifecycle_1.dispose)(this._contributions.values());
            this._contributions.clear();
            this._localStore.clear();
            (0, lifecycle_1.dispose)(this._localCellStateListeners);
            this._list.dispose();
            this._listTopCellToolbar?.dispose();
            this._overlayContainer.remove();
            this.viewModel?.dispose();
            this._renderedEditors.clear();
            this._baseCellEditorOptions.forEach(v => v.dispose());
            this._baseCellEditorOptions.clear();
            this._notebookOverviewRulerContainer.remove();
            super.dispose();
            // unref
            this._webview = null;
            this._webviewResolvePromise = null;
            this._webviewTransparentCover = null;
            this._dndController = null;
            this._listTopCellToolbar = null;
            this._notebookViewModel = undefined;
            this._cellContextKeyManager = null;
            this._notebookTopToolbar = null;
            this._list = null;
            this._listViewInfoAccessor = null;
            this._pendingLayouts = null;
            this._listDelegate = null;
        }
        toJSON() {
            return {
                notebookUri: this.viewModel?.uri,
            };
        }
    };
    exports.NotebookEditorWidget = NotebookEditorWidget;
    exports.NotebookEditorWidget = NotebookEditorWidget = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, notebookRendererMessagingService_1.INotebookRendererMessagingService),
        __param(5, notebookEditorService_1.INotebookEditorService),
        __param(6, notebookKernelService_1.INotebookKernelService),
        __param(7, notebookService_1.INotebookService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, layoutService_1.ILayoutService),
        __param(11, contextView_1.IContextMenuService),
        __param(12, telemetry_1.ITelemetryService),
        __param(13, notebookExecutionService_1.INotebookExecutionService),
        __param(14, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(15, progress_1.IEditorProgressService),
        __param(16, notebookLoggingService_1.INotebookLoggingService),
        __param(17, keybinding_1.IKeybindingService)
    ], NotebookEditorWidget);
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 5, 'notebook-progress-bar');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 10, 'notebook-list-insertion-indicator');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 20, 'notebook-cell-editor-outline');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 25, 'notebook-scrollbar');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 26, 'notebook-cell-status');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 26, 'notebook-folding-indicator');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 27, 'notebook-output');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 28, 'notebook-cell-bottom-toolbar-container');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 29, 'notebook-run-button-container');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 29, 'notebook-input-collapse-condicon');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Base, 30, 'notebook-cell-output-toolbar');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Sash, 1, 'notebook-cell-expand-part-button');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Sash, 2, 'notebook-cell-toolbar');
    (0, zIndexRegistry_1.registerZIndex)(zIndexRegistry_1.ZIndex.Sash, 3, 'notebook-cell-toolbar-dropdown-active');
    exports.notebookCellBorder = (0, colorRegistry_1.registerColor)('notebook.cellBorderColor', {
        dark: (0, colorRegistry_1.transparent)(colorRegistry_1.listInactiveSelectionBackground, 1),
        light: (0, colorRegistry_1.transparent)(colorRegistry_1.listInactiveSelectionBackground, 1),
        hcDark: theme_1.PANEL_BORDER,
        hcLight: theme_1.PANEL_BORDER
    }, nls.localize('notebook.cellBorderColor', "The border color for notebook cells."));
    exports.focusedEditorBorderColor = (0, colorRegistry_1.registerColor)('notebook.focusedEditorBorder', {
        light: colorRegistry_1.focusBorder,
        dark: colorRegistry_1.focusBorder,
        hcDark: colorRegistry_1.focusBorder,
        hcLight: colorRegistry_1.focusBorder
    }, nls.localize('notebook.focusedEditorBorder', "The color of the notebook cell editor border."));
    exports.cellStatusIconSuccess = (0, colorRegistry_1.registerColor)('notebookStatusSuccessIcon.foreground', {
        light: debugColors_1.debugIconStartForeground,
        dark: debugColors_1.debugIconStartForeground,
        hcDark: debugColors_1.debugIconStartForeground,
        hcLight: debugColors_1.debugIconStartForeground
    }, nls.localize('notebookStatusSuccessIcon.foreground', "The error icon color of notebook cells in the cell status bar."));
    exports.runningCellRulerDecorationColor = (0, colorRegistry_1.registerColor)('notebookEditorOverviewRuler.runningCellForeground', {
        light: debugColors_1.debugIconStartForeground,
        dark: debugColors_1.debugIconStartForeground,
        hcDark: debugColors_1.debugIconStartForeground,
        hcLight: debugColors_1.debugIconStartForeground
    }, nls.localize('notebookEditorOverviewRuler.runningCellForeground', "The color of the running cell decoration in the notebook editor overview ruler."));
    exports.cellStatusIconError = (0, colorRegistry_1.registerColor)('notebookStatusErrorIcon.foreground', {
        light: colorRegistry_1.errorForeground,
        dark: colorRegistry_1.errorForeground,
        hcDark: colorRegistry_1.errorForeground,
        hcLight: colorRegistry_1.errorForeground
    }, nls.localize('notebookStatusErrorIcon.foreground', "The error icon color of notebook cells in the cell status bar."));
    exports.cellStatusIconRunning = (0, colorRegistry_1.registerColor)('notebookStatusRunningIcon.foreground', {
        light: colorRegistry_1.foreground,
        dark: colorRegistry_1.foreground,
        hcDark: colorRegistry_1.foreground,
        hcLight: colorRegistry_1.foreground
    }, nls.localize('notebookStatusRunningIcon.foreground', "The running icon color of notebook cells in the cell status bar."));
    exports.notebookOutputContainerBorderColor = (0, colorRegistry_1.registerColor)('notebook.outputContainerBorderColor', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.outputContainerBorderColor', "The border color of the notebook output container."));
    exports.notebookOutputContainerColor = (0, colorRegistry_1.registerColor)('notebook.outputContainerBackgroundColor', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.outputContainerBackgroundColor', "The color of the notebook output container background."));
    // TODO@rebornix currently also used for toolbar border, if we keep all of this, pick a generic name
    exports.CELL_TOOLBAR_SEPERATOR = (0, colorRegistry_1.registerColor)('notebook.cellToolbarSeparator', {
        dark: color_1.Color.fromHex('#808080').transparent(0.35),
        light: color_1.Color.fromHex('#808080').transparent(0.35),
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, nls.localize('notebook.cellToolbarSeparator', "The color of the separator in the cell bottom toolbar"));
    exports.focusedCellBackground = (0, colorRegistry_1.registerColor)('notebook.focusedCellBackground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, nls.localize('focusedCellBackground', "The background color of a cell when the cell is focused."));
    exports.selectedCellBackground = (0, colorRegistry_1.registerColor)('notebook.selectedCellBackground', {
        dark: colorRegistry_1.listInactiveSelectionBackground,
        light: colorRegistry_1.listInactiveSelectionBackground,
        hcDark: null,
        hcLight: null
    }, nls.localize('selectedCellBackground', "The background color of a cell when the cell is selected."));
    exports.cellHoverBackground = (0, colorRegistry_1.registerColor)('notebook.cellHoverBackground', {
        dark: (0, colorRegistry_1.transparent)(exports.focusedCellBackground, .5),
        light: (0, colorRegistry_1.transparent)(exports.focusedCellBackground, .7),
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.cellHoverBackground', "The background color of a cell when the cell is hovered."));
    exports.selectedCellBorder = (0, colorRegistry_1.registerColor)('notebook.selectedCellBorder', {
        dark: exports.notebookCellBorder,
        light: exports.notebookCellBorder,
        hcDark: colorRegistry_1.contrastBorder,
        hcLight: colorRegistry_1.contrastBorder
    }, nls.localize('notebook.selectedCellBorder', "The color of the cell's top and bottom border when the cell is selected but not focused."));
    exports.inactiveSelectedCellBorder = (0, colorRegistry_1.registerColor)('notebook.inactiveSelectedCellBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.focusBorder,
        hcLight: colorRegistry_1.focusBorder
    }, nls.localize('notebook.inactiveSelectedCellBorder', "The color of the cell's borders when multiple cells are selected."));
    exports.focusedCellBorder = (0, colorRegistry_1.registerColor)('notebook.focusedCellBorder', {
        dark: colorRegistry_1.focusBorder,
        light: colorRegistry_1.focusBorder,
        hcDark: colorRegistry_1.focusBorder,
        hcLight: colorRegistry_1.focusBorder
    }, nls.localize('notebook.focusedCellBorder', "The color of the cell's focus indicator borders when the cell is focused."));
    exports.inactiveFocusedCellBorder = (0, colorRegistry_1.registerColor)('notebook.inactiveFocusedCellBorder', {
        dark: exports.notebookCellBorder,
        light: exports.notebookCellBorder,
        hcDark: exports.notebookCellBorder,
        hcLight: exports.notebookCellBorder
    }, nls.localize('notebook.inactiveFocusedCellBorder', "The color of the cell's top and bottom border when a cell is focused while the primary focus is outside of the editor."));
    exports.cellStatusBarItemHover = (0, colorRegistry_1.registerColor)('notebook.cellStatusBarItemHoverBackground', {
        light: new color_1.Color(new color_1.RGBA(0, 0, 0, 0.08)),
        dark: new color_1.Color(new color_1.RGBA(255, 255, 255, 0.15)),
        hcDark: new color_1.Color(new color_1.RGBA(255, 255, 255, 0.15)),
        hcLight: new color_1.Color(new color_1.RGBA(0, 0, 0, 0.08)),
    }, nls.localize('notebook.cellStatusBarItemHoverBackground', "The background color of notebook cell status bar items."));
    exports.cellInsertionIndicator = (0, colorRegistry_1.registerColor)('notebook.cellInsertionIndicator', {
        light: colorRegistry_1.focusBorder,
        dark: colorRegistry_1.focusBorder,
        hcDark: colorRegistry_1.focusBorder,
        hcLight: colorRegistry_1.focusBorder
    }, nls.localize('notebook.cellInsertionIndicator', "The color of the notebook cell insertion indicator."));
    exports.listScrollbarSliderBackground = (0, colorRegistry_1.registerColor)('notebookScrollbarSlider.background', {
        dark: colorRegistry_1.scrollbarSliderBackground,
        light: colorRegistry_1.scrollbarSliderBackground,
        hcDark: colorRegistry_1.scrollbarSliderBackground,
        hcLight: colorRegistry_1.scrollbarSliderBackground
    }, nls.localize('notebookScrollbarSliderBackground', "Notebook scrollbar slider background color."));
    exports.listScrollbarSliderHoverBackground = (0, colorRegistry_1.registerColor)('notebookScrollbarSlider.hoverBackground', {
        dark: colorRegistry_1.scrollbarSliderHoverBackground,
        light: colorRegistry_1.scrollbarSliderHoverBackground,
        hcDark: colorRegistry_1.scrollbarSliderHoverBackground,
        hcLight: colorRegistry_1.scrollbarSliderHoverBackground
    }, nls.localize('notebookScrollbarSliderHoverBackground', "Notebook scrollbar slider background color when hovering."));
    exports.listScrollbarSliderActiveBackground = (0, colorRegistry_1.registerColor)('notebookScrollbarSlider.activeBackground', {
        dark: colorRegistry_1.scrollbarSliderActiveBackground,
        light: colorRegistry_1.scrollbarSliderActiveBackground,
        hcDark: colorRegistry_1.scrollbarSliderActiveBackground,
        hcLight: colorRegistry_1.scrollbarSliderActiveBackground
    }, nls.localize('notebookScrollbarSliderActiveBackground', "Notebook scrollbar slider background color when clicked on."));
    exports.cellSymbolHighlight = (0, colorRegistry_1.registerColor)('notebook.symbolHighlightBackground', {
        dark: color_1.Color.fromHex('#ffffff0b'),
        light: color_1.Color.fromHex('#fdff0033'),
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.symbolHighlightBackground', "Background color of highlighted cell"));
    exports.cellEditorBackground = (0, colorRegistry_1.registerColor)('notebook.cellEditorBackground', {
        light: theme_1.SIDE_BAR_BACKGROUND,
        dark: theme_1.SIDE_BAR_BACKGROUND,
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.cellEditorBackground', "Cell editor background color."));
    const notebookEditorBackground = (0, colorRegistry_1.registerColor)('notebook.editorBackground', {
        light: theme_1.EDITOR_PANE_BACKGROUND,
        dark: theme_1.EDITOR_PANE_BACKGROUND,
        hcDark: null,
        hcLight: null
    }, nls.localize('notebook.editorBackground', "Notebook background color."));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvbm90ZWJvb2tFZGl0b3JXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0doRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLFNBQWdCLGlDQUFpQztRQUNoRCw4REFBOEQ7UUFDOUQsTUFBTSxpQkFBaUIsR0FBRztZQUN6Qix1QkFBdUI7WUFDdkIsb0NBQXVCLENBQUMsRUFBRTtZQUMxQiwwQkFBMEI7WUFDMUIsa0NBQWtDO1lBQ2xDLG1DQUFtQztZQUNuQyxzQ0FBc0M7WUFDdEMsK0JBQStCO1lBQy9CLG9DQUFvQztTQUNwQyxDQUFDO1FBQ0YsTUFBTSxhQUFhLEdBQUcsMkNBQXdCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUgsT0FBTztZQUNOLE9BQU8sRUFBRTtnQkFDUixlQUFlLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO2dCQUN2QyxnQkFBZ0IsRUFBRSxnQkFBTSxDQUFDLGlCQUFpQjtnQkFDMUMsaUJBQWlCLEVBQUUsZ0JBQU0sQ0FBQyxrQkFBa0I7Z0JBQzVDLGlCQUFpQixFQUFFLGdCQUFNLENBQUMsbUJBQW1CO2dCQUM3QyxvQkFBb0IsRUFBRSxnQkFBTSxDQUFDLG1CQUFtQjtnQkFDaEQsa0JBQWtCLEVBQUUsZ0JBQU0sQ0FBQyxtQkFBbUI7Z0JBQzlDLGtCQUFrQixFQUFFLGdCQUFNLENBQUMsMEJBQTBCO2FBQ3JEO1lBQ0QsdUJBQXVCLEVBQUUs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
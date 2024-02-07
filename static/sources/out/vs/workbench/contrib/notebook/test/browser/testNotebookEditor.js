/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/mime", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/timeTravelScheduler", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageService", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/common/services/resolverService", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/clipboard/common/clipboardService", "vs/platform/clipboard/test/common/testClipboardService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/layout/browser/layoutService", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/editor/editorModel", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl", "vs/workbench/contrib/notebook/browser/viewModel/viewContext", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/editor/common/config/fontInfo", "vs/editor/common/config/editorOptions"], function (require, exports, DOM, buffer_1, errors_1, event_1, lifecycle_1, map_1, mime_1, uri_1, mock_1, timeTravelScheduler_1, language_1, languageConfigurationRegistry_1, languageService_1, model_1, modelService_1, resolverService_1, testLanguageConfigurationService_1, clipboardService_1, testClipboardService_1, configuration_1, testConfigurationService_1, contextKeyService_1, contextkey_1, instantiationServiceMock_1, keybinding_1, mockKeybindingService_1, layoutService_1, listService_1, log_1, storage_1, themeService_1, testThemeService_1, undoRedo_1, undoRedoService_1, workspaceTrust_1, editorModel_1, notebookBrowser_1, notebookCellStatusBarServiceImpl_1, notebookCellList_1, eventDispatcher_1, notebookViewModelImpl_1, viewContext_1, notebookCellTextModel_1, notebookTextModel_1, notebookCellStatusBarService_1, notebookCommon_1, notebookExecutionStateService_1, notebookOptions_1, textModelResolverService_1, workbenchTestServices_1, workbenchTestServices_2, fontInfo_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.valueBytesFromString = exports.createNotebookCellList = exports.withTestNotebook = exports.withTestNotebookDiffModel = exports.createTestNotebookEditor = exports.setupInstantiationService = exports.NotebookEditorTestModel = exports.TestCell = void 0;
    class TestCell extends notebookCellTextModel_1.NotebookCellTextModel {
        constructor(viewType, handle, source, language, cellKind, outputs, languageService) {
            super(notebookCommon_1.CellUri.generate(uri_1.URI.parse('test:///fake/notebook'), handle), handle, source, language, mime_1.Mimes.text, cellKind, outputs, undefined, undefined, undefined, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} }, languageService);
            this.viewType = viewType;
            this.source = source;
        }
    }
    exports.TestCell = TestCell;
    class NotebookEditorTestModel extends editorModel_1.EditorModel {
        get viewType() {
            return this._notebook.viewType;
        }
        get resource() {
            return this._notebook.uri;
        }
        get notebook() {
            return this._notebook;
        }
        constructor(_notebook) {
            super();
            this._notebook = _notebook;
            this._dirty = false;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this.onDidChangeOrphaned = event_1.Event.None;
            this.onDidChangeReadonly = event_1.Event.None;
            this.onDidRevertUntitled = event_1.Event.None;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            if (_notebook && _notebook.onDidChangeContent) {
                this._register(_notebook.onDidChangeContent(() => {
                    this._dirty = true;
                    this._onDidChangeDirty.fire();
                    this._onDidChangeContent.fire();
                }));
            }
        }
        isReadonly() {
            return false;
        }
        isOrphaned() {
            return false;
        }
        hasAssociatedFilePath() {
            return false;
        }
        isDirty() {
            return this._dirty;
        }
        get hasErrorState() {
            return false;
        }
        isModified() {
            return this._dirty;
        }
        getNotebook() {
            return this._notebook;
        }
        async load() {
            return this;
        }
        async save() {
            if (this._notebook) {
                this._dirty = false;
                this._onDidChangeDirty.fire();
                this._onDidSave.fire({});
                // todo, flush all states
                return true;
            }
            return false;
        }
        saveAs() {
            throw new errors_1.NotImplementedError();
        }
        revert() {
            throw new errors_1.NotImplementedError();
        }
    }
    exports.NotebookEditorTestModel = NotebookEditorTestModel;
    function setupInstantiationService(disposables) {
        const instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService());
        instantiationService.stub(language_1.ILanguageService, disposables.add(new languageService_1.LanguageService()));
        instantiationService.stub(undoRedo_1.IUndoRedoService, instantiationService.createInstance(undoRedoService_1.UndoRedoService));
        instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
        instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
        instantiationService.stub(languageConfigurationRegistry_1.ILanguageConfigurationService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
        instantiationService.stub(model_1.IModelService, disposables.add(instantiationService.createInstance(modelService_1.ModelService)));
        instantiationService.stub(resolverService_1.ITextModelService, disposables.add(instantiationService.createInstance(textModelResolverService_1.TextModelResolverService)));
        instantiationService.stub(contextkey_1.IContextKeyService, disposables.add(instantiationService.createInstance(contextKeyService_1.ContextKeyService)));
        instantiationService.stub(listService_1.IListService, disposables.add(instantiationService.createInstance(listService_1.ListService)));
        instantiationService.stub(layoutService_1.ILayoutService, new workbenchTestServices_1.TestLayoutService());
        instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
        instantiationService.stub(clipboardService_1.IClipboardService, testClipboardService_1.TestClipboardService);
        instantiationService.stub(storage_1.IStorageService, disposables.add(new workbenchTestServices_2.TestStorageService()));
        instantiationService.stub(workspaceTrust_1.IWorkspaceTrustRequestService, disposables.add(new workbenchTestServices_2.TestWorkspaceTrustRequestService(true)));
        instantiationService.stub(notebookExecutionStateService_1.INotebookExecutionStateService, new TestNotebookExecutionStateService());
        instantiationService.stub(keybinding_1.IKeybindingService, new mockKeybindingService_1.MockKeybindingService());
        instantiationService.stub(notebookCellStatusBarService_1.INotebookCellStatusBarService, disposables.add(new notebookCellStatusBarServiceImpl_1.NotebookCellStatusBarService()));
        return instantiationService;
    }
    exports.setupInstantiationService = setupInstantiationService;
    function _createTestNotebookEditor(instantiationService, disposables, cells) {
        const viewType = 'notebook';
        const notebook = disposables.add(instantiationService.createInstance(notebookTextModel_1.NotebookTextModel, viewType, uri_1.URI.parse('test'), cells.map((cell) => {
            return {
                source: cell[0],
                mime: undefined,
                language: cell[1],
                cellKind: cell[2],
                outputs: cell[3] ?? [],
                metadata: cell[4]
            };
        }), {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false }));
        const model = disposables.add(new NotebookEditorTestModel(notebook));
        const notebookOptions = disposables.add(new notebookOptions_1.NotebookOptions(instantiationService.get(configuration_1.IConfigurationService), instantiationService.get(notebookExecutionStateService_1.INotebookExecutionStateService), false));
        const viewContext = new viewContext_1.ViewContext(notebookOptions, disposables.add(new eventDispatcher_1.NotebookEventDispatcher()), () => ({}));
        const viewModel = disposables.add(instantiationService.createInstance(notebookViewModelImpl_1.NotebookViewModel, viewType, model.notebook, viewContext, null, { isReadOnly: false }));
        const cellList = disposables.add(createNotebookCellList(instantiationService, disposables, viewContext));
        cellList.attachViewModel(viewModel);
        const listViewInfoAccessor = disposables.add(new notebookCellList_1.ListViewInfoAccessor(cellList));
        let visibleRanges = [{ start: 0, end: 100 }];
        const notebookEditor = new class extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.notebookOptions = notebookOptions;
                this.onDidChangeModel = new event_1.Emitter().event;
                this.onDidChangeCellState = new event_1.Emitter().event;
                this.textModel = viewModel.notebookDocument;
                this.onDidChangeVisibleRanges = event_1.Event.None;
            }
            // eslint-disable-next-line local/code-must-use-super-dispose
            dispose() {
                viewModel.dispose();
            }
            getViewModel() {
                return viewModel;
            }
            hasModel() {
                return !!viewModel;
            }
            getLength() { return viewModel.length; }
            getFocus() { return viewModel.getFocus(); }
            getSelections() { return viewModel.getSelections(); }
            setFocus(focus) {
                viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: focus,
                    selections: viewModel.getSelections()
                });
            }
            setSelections(selections) {
                viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: viewModel.getFocus(),
                    selections: selections
                });
            }
            getViewIndexByModelIndex(index) { return listViewInfoAccessor.getViewIndex(viewModel.viewCells[index]); }
            getCellRangeFromViewRange(startIndex, endIndex) { return listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex); }
            revealCellRangeInView() { }
            setHiddenAreas(_ranges) {
                return cellList.setHiddenAreas(_ranges, true);
            }
            getActiveCell() {
                const elements = cellList.getFocusedElements();
                if (elements && elements.length) {
                    return elements[0];
                }
                return undefined;
            }
            hasOutputTextSelection() {
                return false;
            }
            changeModelDecorations() { return null; }
            focusElement() { }
            setCellEditorSelection() { }
            async revealRangeInCenterIfOutsideViewportAsync() { }
            async layoutNotebookCell() { }
            async removeInset() { }
            async focusNotebookCell(cell, focusItem) {
                cell.focusMode = focusItem === 'editor' ? notebookBrowser_1.CellFocusMode.Editor
                    : focusItem === 'output' ? notebookBrowser_1.CellFocusMode.Output
                        : notebookBrowser_1.CellFocusMode.Container;
            }
            cellAt(index) { return viewModel.cellAt(index); }
            getCellIndex(cell) { return viewModel.getCellIndex(cell); }
            getCellsInRange(range) { return viewModel.getCellsInRange(range); }
            getCellByHandle(handle) { return viewModel.getCellByHandle(handle); }
            getNextVisibleCellIndex(index) { return viewModel.getNextVisibleCellIndex(index); }
            getControl() { return this; }
            get onDidChangeSelection() { return viewModel.onDidChangeSelection; }
            get onDidChangeOptions() { return viewModel.onDidChangeOptions; }
            get onDidChangeViewCells() { return viewModel.onDidChangeViewCells; }
            async find(query, options) {
                const findMatches = viewModel.find(query, options).filter(match => match.length > 0);
                return findMatches;
            }
            deltaCellDecorations() { return []; }
            get visibleRanges() {
                return visibleRanges;
            }
            set visibleRanges(_ranges) {
                visibleRanges = _ranges;
            }
            getId() { return ''; }
            setScrollTop(scrollTop) {
                cellList.scrollTop = scrollTop;
            }
            get scrollTop() {
                return cellList.scrollTop;
            }
            getLayoutInfo() {
                return {
                    width: 0,
                    height: 0,
                    scrollHeight: cellList.getScrollHeight(),
                    fontInfo: new fontInfo_1.FontInfo({
                        pixelRatio: 1,
                        fontFamily: 'mockFont',
                        fontWeight: 'normal',
                        fontSize: 14,
                        fontFeatureSettings: editorOptions_1.EditorFontLigatures.OFF,
                        fontVariationSettings: editorOptions_1.EditorFontVariations.OFF,
                        lineHeight: 19,
                        letterSpacing: 1.5,
                        isMonospace: true,
                        typicalHalfwidthCharacterWidth: 10,
                        typicalFullwidthCharacterWidth: 20,
                        canUseHalfwidthRightwardsArrow: true,
                        spaceWidth: 10,
                        middotWidth: 10,
                        wsmiddotWidth: 10,
                        maxDigitWidth: 10,
                    }, true),
                    stickyHeight: 0
                };
            }
        };
        return { editor: notebookEditor, viewModel };
    }
    function createTestNotebookEditor(instantiationService, disposables, cells) {
        return _createTestNotebookEditor(instantiationService, disposables, cells);
    }
    exports.createTestNotebookEditor = createTestNotebookEditor;
    async function withTestNotebookDiffModel(originalCells, modifiedCells, callback) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = setupInstantiationService(disposables);
        const originalNotebook = createTestNotebookEditor(instantiationService, disposables, originalCells);
        const modifiedNotebook = createTestNotebookEditor(instantiationService, disposables, modifiedCells);
        const originalResource = new class extends (0, mock_1.mock)() {
            get notebook() {
                return originalNotebook.viewModel.notebookDocument;
            }
        };
        const modifiedResource = new class extends (0, mock_1.mock)() {
            get notebook() {
                return modifiedNotebook.viewModel.notebookDocument;
            }
        };
        const model = new class extends (0, mock_1.mock)() {
            get original() {
                return originalResource;
            }
            get modified() {
                return modifiedResource;
            }
        };
        const res = await callback(model, disposables, instantiationService);
        if (res instanceof Promise) {
            res.finally(() => {
                originalNotebook.editor.dispose();
                originalNotebook.viewModel.dispose();
                modifiedNotebook.editor.dispose();
                modifiedNotebook.viewModel.dispose();
                disposables.dispose();
            });
        }
        else {
            originalNotebook.editor.dispose();
            originalNotebook.viewModel.dispose();
            modifiedNotebook.editor.dispose();
            modifiedNotebook.viewModel.dispose();
            disposables.dispose();
        }
        return res;
    }
    exports.withTestNotebookDiffModel = withTestNotebookDiffModel;
    async function withTestNotebook(cells, callback, accessor) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = accessor ?? setupInstantiationService(disposables);
        const notebookEditor = _createTestNotebookEditor(instantiationService, disposables, cells);
        return (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
            const res = await callback(notebookEditor.editor, notebookEditor.viewModel, disposables, instantiationService);
            if (res instanceof Promise) {
                res.finally(() => {
                    notebookEditor.editor.dispose();
                    notebookEditor.viewModel.dispose();
                    notebookEditor.editor.textModel.dispose();
                    disposables.dispose();
                });
            }
            else {
                notebookEditor.editor.dispose();
                notebookEditor.viewModel.dispose();
                notebookEditor.editor.textModel.dispose();
                disposables.dispose();
            }
            return res;
        });
    }
    exports.withTestNotebook = withTestNotebook;
    function createNotebookCellList(instantiationService, disposables, viewContext) {
        const delegate = {
            getHeight(element) { return element.getHeight(17); },
            getTemplateId() { return 'template'; }
        };
        const renderer = {
            templateId: 'template',
            renderTemplate() { return {}; },
            renderElement() { },
            disposeTemplate() { }
        };
        const notebookOptions = !!viewContext ? viewContext.notebookOptions
            : disposables.add(new notebookOptions_1.NotebookOptions(instantiationService.get(configuration_1.IConfigurationService), instantiationService.get(notebookExecutionStateService_1.INotebookExecutionStateService), false));
        const cellList = disposables.add(instantiationService.createInstance(notebookCellList_1.NotebookCellList, 'NotebookCellList', DOM.$('container'), notebookOptions, delegate, [renderer], instantiationService.get(contextkey_1.IContextKeyService), {
            supportDynamicHeights: true,
            multipleSelectionSupport: true,
        }));
        return cellList;
    }
    exports.createNotebookCellList = createNotebookCellList;
    function valueBytesFromString(value) {
        return buffer_1.VSBuffer.fromString(value);
    }
    exports.valueBytesFromString = valueBytesFromString;
    class TestCellExecution {
        constructor(notebook, cellHandle, onComplete) {
            this.notebook = notebook;
            this.cellHandle = cellHandle;
            this.onComplete = onComplete;
            this.state = notebookCommon_1.NotebookCellExecutionState.Unconfirmed;
            this.didPause = false;
            this.isPaused = false;
        }
        confirm() {
        }
        update(updates) {
        }
        complete(complete) {
            this.onComplete();
        }
    }
    class TestNotebookExecutionStateService {
        constructor() {
            this._executions = new map_1.ResourceMap();
            this.onDidChangeExecution = new event_1.Emitter().event;
            this.onDidChangeLastRunFailState = new event_1.Emitter().event;
        }
        forceCancelNotebookExecutions(notebookUri) {
        }
        getCellExecutionsForNotebook(notebook) {
            return [];
        }
        getCellExecution(cellUri) {
            return this._executions.get(cellUri);
        }
        createCellExecution(notebook, cellHandle) {
            const onComplete = () => this._executions.delete(notebookCommon_1.CellUri.generate(notebook, cellHandle));
            const exe = new TestCellExecution(notebook, cellHandle, onComplete);
            this._executions.set(notebookCommon_1.CellUri.generate(notebook, cellHandle), exe);
            return exe;
        }
        getCellExecutionsByHandleForNotebook(notebook) {
            return;
        }
        getLastFailedCellForNotebook(notebook) {
            return;
        }
        getExecution(notebook) {
            return;
        }
        createExecution(notebook) {
            throw new Error('Method not implemented.');
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdE5vdGVib29rRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay90ZXN0L2Jyb3dzZXIvdGVzdE5vdGVib29rRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQThEaEcsTUFBYSxRQUFTLFNBQVEsNkNBQXFCO1FBQ2xELFlBQ1EsUUFBZ0IsRUFDdkIsTUFBYyxFQUNQLE1BQWMsRUFDckIsUUFBZ0IsRUFDaEIsUUFBa0IsRUFDbEIsT0FBcUIsRUFDckIsZUFBaUM7WUFFakMsS0FBSyxDQUFDLHdCQUFPLENBQUMsUUFBUSxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxZQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxFQUFFLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQVJ4UixhQUFRLEdBQVIsUUFBUSxDQUFRO1lBRWhCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFPdEIsQ0FBQztLQUNEO0lBWkQsNEJBWUM7SUFFRCxNQUFhLHVCQUF3QixTQUFRLHlCQUFXO1FBaUJ2RCxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxP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
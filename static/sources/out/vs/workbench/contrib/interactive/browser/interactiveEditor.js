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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/workbench/contrib/interactive/browser/interactiveEditorInput", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/language", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/interactive/browser/interactiveCommon", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/contextview/browser/contextView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/editor/browser/editorExtensions", "vs/editor/contrib/parameterHints/browser/parameterHints", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/snippet/browser/snippetController2", "vs/workbench/contrib/snippets/browser/tabCompletion", "vs/editor/contrib/hover/browser/hover", "vs/editor/contrib/gotoError/browser/gotoError", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/services/extensions/common/extensions", "vs/base/common/resources", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/objects", "vs/base/browser/window", "vs/css!./media/interactive", "vs/css!./interactiveEditor"], function (require, exports, nls, DOM, event_1, lifecycle_1, codeEditorService_1, codeEditorWidget_1, contextkey_1, instantiation_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, editorPane_1, simpleEditorOptions_1, interactiveEditorInput_1, notebookEditorExtensions_1, notebookEditorService_1, editorGroupsService_1, executionStatusBarItemController_1, notebookKernelService_1, modesRegistry_1, language_1, actions_1, keybinding_1, interactiveCommon_1, configuration_1, notebookOptions_1, toolbar_1, contextView_1, menuEntryActionViewItem_1, editorExtensions_1, parameterHints_1, menuPreventer_1, selectionClipboard_1, contextmenu_1, suggestController_1, snippetController2_1, tabCompletion_1, hover_1, gotoError_1, textResourceConfiguration_1, notebookExecutionStateService_1, notebookContextKeys_1, extensions_1, resources_1, notebookFindWidget_1, notebookCommon_1, objects_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InteractiveEditor = void 0;
    const DECORATION_KEY = 'interactiveInputDecoration';
    const INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'InteractiveEditorViewState';
    const INPUT_CELL_VERTICAL_PADDING = 8;
    const INPUT_CELL_HORIZONTAL_PADDING_RIGHT = 10;
    const INPUT_EDITOR_PADDING = 8;
    let InteractiveEditor = class InteractiveEditor extends editorPane_1.EditorPane {
        get onDidFocus() { return this._onDidFocusWidget.event; }
        constructor(telemetryService, themeService, storageService, instantiationService, notebookWidgetService, contextKeyService, codeEditorService, notebookKernelService, languageService, keybindingService, configurationService, menuService, contextMenuService, editorGroupService, textResourceConfigurationService, notebookExecutionStateService, extensionService) {
            super(notebookCommon_1.INTERACTIVE_WINDOW_EDITOR_ID, telemetryService, themeService, storageService);
            this._notebookWidget = { value: undefined };
            this._widgetDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._groupListener = this._register(new lifecycle_1.DisposableStore());
            this._onDidFocusWidget = this._register(new event_1.Emitter());
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._instantiationService = instantiationService;
            this._notebookWidgetService = notebookWidgetService;
            this._contextKeyService = contextKeyService;
            this._configurationService = configurationService;
            this._notebookKernelService = notebookKernelService;
            this._languageService = languageService;
            this._keybindingService = keybindingService;
            this._menuService = menuService;
            this._contextMenuService = contextMenuService;
            this._editorGroupService = editorGroupService;
            this._notebookExecutionStateService = notebookExecutionStateService;
            this._extensionService = extensionService;
            this._editorOptions = this._computeEditorOptions();
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor') || e.affectsConfiguration('notebook')) {
                    this._editorOptions = this._computeEditorOptions();
                }
            }));
            this._notebookOptions = new notebookOptions_1.NotebookOptions(configurationService, notebookExecutionStateService, true, { cellToolbarInteraction: 'hover', globalToolbar: true, stickyScrollEnabled: false, dragAndDropEnabled: false });
            this._editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY);
            codeEditorService.registerDecorationType('interactive-decoration', DECORATION_KEY, {});
            this._register(this._keybindingService.onDidUpdateKeybindings(this._updateInputDecoration, this));
            this._register(this._notebookExecutionStateService.onDidChangeExecution((e) => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && (0, resources_1.isEqual)(e.notebook, this._notebookWidget.value?.viewModel?.notebookDocument.uri)) {
                    const cell = this._notebookWidget.value?.getCellByHandle(e.cellHandle);
                    if (cell && e.changed?.state) {
                        this._scrollIfNecessary(cell);
                    }
                }
            }));
        }
        get inputCellContainerHeight() {
            return 19 + 2 + INPUT_CELL_VERTICAL_PADDING * 2 + INPUT_EDITOR_PADDING * 2;
        }
        get inputCellEditorHeight() {
            return 19 + INPUT_EDITOR_PADDING * 2;
        }
        createEditor(parent) {
            this._rootElement = DOM.append(parent, DOM.$('.interactive-editor'));
            this._rootElement.style.position = 'relative';
            this._notebookEditorContainer = DOM.append(this._rootElement, DOM.$('.notebook-editor-container'));
            this._inputCellContainer = DOM.append(this._rootElement, DOM.$('.input-cell-container'));
            this._inputCellContainer.style.position = 'absolute';
            this._inputCellContainer.style.height = `${this.inputCellContainerHeight}px`;
            this._inputFocusIndicator = DOM.append(this._inputCellContainer, DOM.$('.input-focus-indicator'));
            this._inputRunButtonContainer = DOM.append(this._inputCellContainer, DOM.$('.run-button-container'));
            this._setupRunButtonToolbar(this._inputRunButtonContainer);
            this._inputEditorContainer = DOM.append(this._inputCellContainer, DOM.$('.input-editor-container'));
            this._createLayoutStyles();
        }
        _setupRunButtonToolbar(runButtonContainer) {
            const menu = this._register(this._menuService.createMenu(actions_1.MenuId.InteractiveInputExecute, this._contextKeyService));
            this._runbuttonToolbar = this._register(new toolbar_1.ToolBar(runButtonContainer, this._contextMenuService, {
                getKeyBinding: action => this._keybindingService.lookupKeybinding(action.id),
                actionViewItemProvider: action => {
                    return (0, menuEntryActionViewItem_1.createActionViewItem)(this._instantiationService, action);
                },
                renderDropdownAsChildElement: true
            }));
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, result);
            this._runbuttonToolbar.setActions([...primary, ...secondary]);
        }
        _createLayoutStyles() {
            this._styleElement = DOM.createStyleSheet(this._rootElement);
            const styleSheets = [];
            const { codeCellLeftMargin, cellRunGutter } = this._notebookOptions.getLayoutConfiguration();
            const { focusIndicator } = this._notebookOptions.getDisplayOptions();
            const leftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
            styleSheets.push(`
			.interactive-editor .input-cell-container {
				padding: ${INPUT_CELL_VERTICAL_PADDING}px ${INPUT_CELL_HORIZONTAL_PADDING_RIGHT}px ${INPUT_CELL_VERTICAL_PADDING}px ${leftMargin}px;
			}
		`);
            if (focusIndicator === 'gutter') {
                styleSheets.push(`
				.interactive-editor .input-cell-container:focus-within .input-focus-indicator::before {
					border-color: var(--vscode-notebook-focusedCellBorder) !important;
				}
				.interactive-editor .input-focus-indicator::before {
					border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: block;
					top: ${INPUT_CELL_VERTICAL_PADDING}px;
				}
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
			`);
            }
            else {
                // border
                styleSheets.push(`
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: none;
				}
			`);
            }
            styleSheets.push(`
			.interactive-editor .input-cell-container .run-button-container {
				width: ${cellRunGutter}px;
				left: ${codeCellLeftMargin}px;
				margin-top: ${INPUT_EDITOR_PADDING - 2}px;
			}
		`);
            this._styleElement.textContent = styleSheets.join('\n');
        }
        _computeEditorOptions() {
            let overrideIdentifier = undefined;
            if (this._codeEditorWidget) {
                overrideIdentifier = this._codeEditorWidget.getModel()?.getLanguageId();
            }
            const editorOptions = (0, objects_1.deepClone)(this._configurationService.getValue('editor', { overrideIdentifier }));
            const editorOptionsOverride = (0, simpleEditorOptions_1.getSimpleEditorOptions)(this._configurationService);
            const computed = Object.freeze({
                ...editorOptions,
                ...editorOptionsOverride,
                ...{
                    glyphMargin: true,
                    padding: {
                        top: INPUT_EDITOR_PADDING,
                        bottom: INPUT_EDITOR_PADDING
                    },
                    hover: {
                        enabled: true
                    }
                }
            });
            return computed;
        }
        saveState() {
            this._saveEditorViewState(this.input);
            super.saveState();
        }
        getViewState() {
            const input = this.input;
            if (!(input instanceof interactiveEditorInput_1.InteractiveEditorInput)) {
                return undefined;
            }
            this._saveEditorViewState(input);
            return this._loadNotebookEditorViewState(input);
        }
        _saveEditorViewState(input) {
            if (this.group && this._notebookWidget.value && input instanceof interactiveEditorInput_1.InteractiveEditorInput) {
                if (this._notebookWidget.value.isDisposed) {
                    return;
                }
                const state = this._notebookWidget.value.getEditorViewState();
                const editorState = this._codeEditorWidget.saveViewState();
                this._editorMemento.saveEditorState(this.group, input.notebookEditorInput.resource, {
                    notebook: state,
                    input: editorState
                });
            }
        }
        _loadNotebookEditorViewState(input) {
            let result;
            if (this.group) {
                result = this._editorMemento.loadEditorState(this.group, input.notebookEditorInput.resource);
            }
            if (result) {
                return result;
            }
            // when we don't have a view state for the group/input-tuple then we try to use an existing
            // editor for the same resource.
            for (const group of this._editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (group.activeEditorPane !== this && group.activeEditorPane === this && group.activeEditor?.matches(input)) {
                    const notebook = this._notebookWidget.value?.getEditorViewState();
                    const input = this._codeEditorWidget.saveViewState();
                    return {
                        notebook,
                        input
                    };
                }
            }
            return;
        }
        async setInput(input, options, context, token) {
            const group = this.group;
            const notebookInput = input.notebookEditorInput;
            // there currently is a widget which we still own so
            // we need to hide it before getting a new widget
            this._notebookWidget.value?.onWillHide();
            this._codeEditorWidget?.dispose();
            this._widgetDisposableStore.clear();
            this._notebookWidget = this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget, group, notebookInput, {
                isEmbedded: true,
                isReadOnly: true,
                contributions: notebookEditorExtensions_1.NotebookEditorExtensionsRegistry.getSomeEditorContributions([
                    executionStatusBarItemController_1.ExecutionStateCellStatusBarContrib.id,
                    executionStatusBarItemController_1.TimerCellStatusBarContrib.id,
                    notebookFindWidget_1.NotebookFindContrib.id
                ]),
                menuIds: {
                    notebookToolbar: actions_1.MenuId.InteractiveToolbar,
                    cellTitleToolbar: actions_1.MenuId.InteractiveCellTitle,
                    cellDeleteToolbar: actions_1.MenuId.InteractiveCellDelete,
                    cellInsertToolbar: actions_1.MenuId.NotebookCellBetween,
                    cellTopInsertToolbar: actions_1.MenuId.NotebookCellListTop,
                    cellExecuteToolbar: actions_1.MenuId.InteractiveCellExecute,
                    cellExecutePrimary: undefined
                },
                cellEditorContributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    selectionClipboard_1.SelectionClipboardContributionID,
                    contextmenu_1.ContextMenuController.ID,
                    hover_1.HoverController.ID,
                    gotoError_1.MarkerController.ID
                ]),
                options: this._notebookOptions
            }, undefined, this._rootElement ? DOM.getWindow(this._rootElement) : window_1.mainWindow);
            this._codeEditorWidget = this._instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this._inputEditorContainer, this._editorOptions, {
                ...{
                    isSimpleWidget: false,
                    contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                        menuPreventer_1.MenuPreventer.ID,
                        selectionClipboard_1.SelectionClipboardContributionID,
                        contextmenu_1.ContextMenuController.ID,
                        suggestController_1.SuggestController.ID,
                        parameterHints_1.ParameterHintsController.ID,
                        snippetController2_1.SnippetController2.ID,
                        tabCompletion_1.TabCompletionController.ID,
                        hover_1.HoverController.ID,
                        gotoError_1.MarkerController.ID
                    ])
                }
            });
            if (this._lastLayoutDimensions) {
                this._notebookEditorContainer.style.height = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
                this._notebookWidget.value.layout(new DOM.Dimension(this._lastLayoutDimensions.dimension.width, this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight), this._notebookEditorContainer);
                const leftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
                const maxHeight = Math.min(this._lastLayoutDimensions.dimension.height / 2, this.inputCellEditorHeight);
                this._codeEditorWidget.layout(this._validateDimension(this._lastLayoutDimensions.dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT, maxHeight));
                this._inputFocusIndicator.style.height = `${this.inputCellEditorHeight}px`;
                this._inputCellContainer.style.top = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
                this._inputCellContainer.style.width = `${this._lastLayoutDimensions.dimension.width}px`;
            }
            await super.setInput(input, options, context, token);
            const model = await input.resolve();
            if (this._runbuttonToolbar) {
                this._runbuttonToolbar.context = input.resource;
            }
            if (model === null) {
                throw new Error('The Interactive Window model could not be resolved');
            }
            this._notebookWidget.value?.setParentContextKeyService(this._contextKeyService);
            const viewState = options?.viewState ?? this._loadNotebookEditorViewState(input);
            await this._extensionService.whenInstalledExtensionsRegistered();
            await this._notebookWidget.value.setModel(model.notebook, viewState?.notebook);
            model.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault());
            this._notebookWidget.value.setOptions({
                isReadOnly: true
            });
            this._widgetDisposableStore.add(this._notebookWidget.value.onDidResizeOutput((cvm) => {
                this._scrollIfNecessary(cvm);
            }));
            this._widgetDisposableStore.add(this._notebookWidget.value.onDidFocusWidget(() => this._onDidFocusWidget.fire()));
            this._widgetDisposableStore.add(this._notebookOptions.onDidChangeOptions(e => {
                if (e.compactView || e.focusIndicator) {
                    // update the styling
                    this._styleElement?.remove();
                    this._createLayoutStyles();
                }
                if (this._lastLayoutDimensions && this.isVisible()) {
                    this.layout(this._lastLayoutDimensions.dimension, this._lastLayoutDimensions.position);
                }
                if (e.interactiveWindowCollapseCodeCells) {
                    model.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault());
                }
            }));
            const languageId = this._notebookWidget.value?.activeKernel?.supportedLanguages[0] ?? input.language ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
            const editorModel = await input.resolveInput(languageId);
            editorModel.setLanguage(languageId);
            this._codeEditorWidget.setModel(editorModel);
            if (viewState?.input) {
                this._codeEditorWidget.restoreViewState(viewState.input);
            }
            this._editorOptions = this._computeEditorOptions();
            this._codeEditorWidget.updateOptions(this._editorOptions);
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidFocusEditorWidget(() => this._onDidFocusWidget.fire()));
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidContentSizeChange(e => {
                if (!e.contentHeightChanged) {
                    return;
                }
                if (this._lastLayoutDimensions) {
                    this._layoutWidgets(this._lastLayoutDimensions.dimension, this._lastLayoutDimensions.position);
                }
            }));
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition(e => this._onDidChangeSelection.fire({ reason: this._toEditorPaneSelectionChangeReason(e) })));
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
            this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeNotebookAffinity(this._syncWithKernel, this));
            this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeSelectedNotebooks(this._syncWithKernel, this));
            this._widgetDisposableStore.add(this.themeService.onDidColorThemeChange(() => {
                if (this.isVisible()) {
                    this._updateInputDecoration();
                }
            }));
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(() => {
                if (this.isVisible()) {
                    this._updateInputDecoration();
                }
            }));
            const cursorAtBoundaryContext = interactiveCommon_1.INTERACTIVE_INPUT_CURSOR_BOUNDARY.bindTo(this._contextKeyService);
            if (input.resource && input.historyService.has(input.resource)) {
                cursorAtBoundaryContext.set('top');
            }
            else {
                cursorAtBoundaryContext.set('none');
            }
            this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition(({ position }) => {
                const viewModel = this._codeEditorWidget._getViewModel();
                const lastLineNumber = viewModel.getLineCount();
                const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
                const firstLine = viewPosition.lineNumber === 1 && viewPosition.column === 1;
                const lastLine = viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol;
                if (firstLine) {
                    if (lastLine) {
                        cursorAtBoundaryContext.set('both');
                    }
                    else {
                        cursorAtBoundaryContext.set('top');
                    }
                }
                else {
                    if (lastLine) {
                        cursorAtBoundaryContext.set('bottom');
                    }
                    else {
                        cursorAtBoundaryContext.set('none');
                    }
                }
            }));
            this._widgetDisposableStore.add(editorModel.onDidChangeContent(() => {
                const value = editorModel.getValue();
                if (this.input?.resource && value !== '') {
                    this.input.historyService.replaceLast(this.input.resource, value);
                }
            }));
            this._syncWithKernel();
        }
        setOptions(options) {
            this._notebookWidget.value?.setOptions(options);
            super.setOptions(options);
        }
        _toEditorPaneSelectionChangeReason(e) {
            switch (e.source) {
                case "api" /* TextEditorSelectionSource.PROGRAMMATIC */: return 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */;
                case "code.navigation" /* TextEditorSelectionSource.NAVIGATION */: return 4 /* EditorPaneSelectionChangeReason.NAVIGATION */;
                case "code.jump" /* TextEditorSelectionSource.JUMP */: return 5 /* EditorPaneSelectionChangeReason.JUMP */;
                default: return 2 /* EditorPaneSelectionChangeReason.USER */;
            }
        }
        _cellAtBottom(cell) {
            const visibleRanges = this._notebookWidget.value?.visibleRanges || [];
            const cellIndex = this._notebookWidget.value?.getCellIndex(cell);
            if (cellIndex === Math.max(...visibleRanges.map(range => range.end - 1))) {
                return true;
            }
            return false;
        }
        _scrollIfNecessary(cvm) {
            const index = this._notebookWidget.value.getCellIndex(cvm);
            if (index === this._notebookWidget.value.getLength() - 1) {
                // If we're already at the bottom or auto scroll is enabled, scroll to the bottom
                if (this._configurationService.getValue(interactiveCommon_1.InteractiveWindowSetting.interactiveWindowAlwaysScrollOnNewCell) || this._cellAtBottom(cvm)) {
                    this._notebookWidget.value.scrollToBottom();
                }
            }
        }
        _syncWithKernel() {
            const notebook = this._notebookWidget.value?.textModel;
            const textModel = this._codeEditorWidget.getModel();
            if (notebook && textModel) {
                const info = this._notebookKernelService.getMatchingKernel(notebook);
                const selectedOrSuggested = info.selected
                    ?? (info.suggestions.length === 1 ? info.suggestions[0] : undefined)
                    ?? (info.all.length === 1 ? info.all[0] : undefined);
                if (selectedOrSuggested) {
                    const language = selectedOrSuggested.supportedLanguages[0];
                    // All kernels will initially list plaintext as the supported language before they properly initialized.
                    if (language && language !== 'plaintext') {
                        const newMode = this._languageService.createById(language).languageId;
                        textModel.setLanguage(newMode);
                    }
                    notebookContextKeys_1.NOTEBOOK_KERNEL.bindTo(this._contextKeyService).set(selectedOrSuggested.id);
                }
            }
            this._updateInputDecoration();
        }
        layout(dimension, position) {
            this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
            const editorHeightChanged = dimension.height !== this._lastLayoutDimensions?.dimension.height;
            this._lastLayoutDimensions = { dimension, position };
            if (!this._notebookWidget.value) {
                return;
            }
            if (editorHeightChanged && this._codeEditorWidget) {
                suggestController_1.SuggestController.get(this._codeEditorWidget)?.cancelSuggestWidget();
            }
            this._notebookEditorContainer.style.height = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
            this._layoutWidgets(dimension, position);
        }
        _layoutWidgets(dimension, position) {
            const contentHeight = this._codeEditorWidget.hasModel() ? this._codeEditorWidget.getContentHeight() : this.inputCellEditorHeight;
            const maxHeight = Math.min(dimension.height / 2, contentHeight);
            const leftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
            const inputCellContainerHeight = maxHeight + INPUT_CELL_VERTICAL_PADDING * 2;
            this._notebookEditorContainer.style.height = `${dimension.height - inputCellContainerHeight}px`;
            this._notebookWidget.value.layout(dimension.with(dimension.width, dimension.height - inputCellContainerHeight), this._notebookEditorContainer, position);
            this._codeEditorWidget.layout(this._validateDimension(dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT, maxHeight));
            this._inputFocusIndicator.style.height = `${contentHeight}px`;
            this._inputCellContainer.style.top = `${dimension.height - inputCellContainerHeight}px`;
            this._inputCellContainer.style.width = `${dimension.width}px`;
        }
        _validateDimension(width, height) {
            return new DOM.Dimension(Math.max(0, width), Math.max(0, height));
        }
        _updateInputDecoration() {
            if (!this._codeEditorWidget) {
                return;
            }
            if (!this._codeEditorWidget.hasModel()) {
                return;
            }
            const model = this._codeEditorWidget.getModel();
            const decorations = [];
            if (model?.getValueLength() === 0) {
                const transparentForeground = (0, colorRegistry_1.resolveColorValue)(colorRegistry_1.editorForeground, this.themeService.getColorTheme())?.transparent(0.4);
                const languageId = model.getLanguageId();
                const keybinding = this._keybindingService.lookupKeybinding('interactive.execute', this._contextKeyService)?.getLabel();
                const text = nls.localize('interactiveInputPlaceHolder', "Type '{0}' code here and press {1} to run", languageId, keybinding ?? 'ctrl+enter');
                decorations.push({
                    range: {
                        startLineNumber: 0,
                        endLineNumber: 0,
                        startColumn: 0,
                        endColumn: 1
                    },
                    renderOptions: {
                        after: {
                            contentText: text,
                            color: transparentForeground ? transparentForeground.toString() : undefined
                        }
                    }
                });
            }
            this._codeEditorWidget.setDecorationsByType('interactive-decoration', DECORATION_KEY, decorations);
        }
        focus() {
            super.focus();
            this._notebookWidget.value?.onShow();
            this._codeEditorWidget.focus();
        }
        focusHistory() {
            this._notebookWidget.value.focus();
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (group) {
                this._groupListener.clear();
                this._groupListener.add(group.onWillCloseEditor(e => this._saveEditorViewState(e.editor)));
            }
            if (!visible) {
                this._saveEditorViewState(this.input);
                if (this.input && this._notebookWidget.value) {
                    this._notebookWidget.value.onWillHide();
                }
            }
        }
        clearInput() {
            if (this._notebookWidget.value) {
                this._saveEditorViewState(this.input);
                this._notebookWidget.value.onWillHide();
            }
            this._codeEditorWidget?.dispose();
            this._notebookWidget = { value: undefined };
            this._widgetDisposableStore.clear();
            super.clearInput();
        }
        getControl() {
            return {
                notebookEditor: this._notebookWidget.value,
                codeEditor: this._codeEditorWidget
            };
        }
    };
    exports.InteractiveEditor = InteractiveEditor;
    exports.InteractiveEditor = InteractiveEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, notebookEditorService_1.INotebookEditorService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, codeEditorService_1.ICodeEditorService),
        __param(7, notebookKernelService_1.INotebookKernelService),
        __param(8, language_1.ILanguageService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, actions_1.IMenuService),
        __param(12, contextView_1.IContextMenuService),
        __param(13, editorGroupsService_1.IEditorGroupsService),
        __param(14, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(15, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(16, extensions_1.IExtensionService)
    ], InteractiveEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3RpdmVFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ludGVyYWN0aXZlL2Jyb3dzZXIvaW50ZXJhY3RpdmVFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0VoRyxNQUFNLGNBQWMsR0FBRyw0QkFBNEIsQ0FBQztJQUNwRCxNQUFNLDRDQUE0QyxHQUFHLDRCQUE0QixDQUFDO0lBRWxGLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sbUNBQW1DLEdBQUcsRUFBRSxDQUFDO0lBQy9DLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO0lBV3hCLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsdUJBQVU7UUErQmhELElBQWEsVUFBVSxLQUFrQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBSS9FLFlBQ29CLGdCQUFtQyxFQUN2QyxZQUEyQixFQUN6QixjQUErQixFQUN6QixvQkFBMkMsRUFDMUMscUJBQTZDLEVBQ2pELGlCQUFxQyxFQUNyQyxpQkFBcUMsRUFDakMscUJBQTZDLEVBQ25ELGVBQWlDLEVBQy9CLGlCQUFxQyxFQUNsQyxvQkFBMkMsRUFDcEQsV0FBeUIsRUFDbEIsa0JBQXVDLEVBQ3RDLGtCQUF3QyxFQUMzQixnQ0FBbUUsRUFDdEUsNkJBQTZELEVBQzFFLGdCQUFtQztZQUV0RCxLQUFLLENBQ0osNkNBQTRCLEVBQzVCLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osY0FBYyxDQUNkLENBQUM7WUF2REssb0JBQWUsR0FBdUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFrQjNFLDJCQUFzQixHQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUs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
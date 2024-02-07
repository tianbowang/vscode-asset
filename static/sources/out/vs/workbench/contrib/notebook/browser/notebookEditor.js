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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/window", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uuid", "vs/editor/common/services/textResourceConfiguration", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookPerformance", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/progress/common/progress", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/workbench/contrib/notebook/common/services/notebookWorkerService", "vs/workbench/services/preferences/common/preferences"], function (require, exports, DOM, window_1, actions_1, async_1, event_1, lifecycle_1, resources_1, uuid_1, textResourceConfiguration_1, nls_1, contextkey_1, files_1, instantiation_1, storage_1, telemetry_1, themeService_1, editorPane_1, editor_1, coreActions_1, notebookEditorService_1, notebookKernelView_1, notebookCommon_1, notebookEditorInput_1, notebookPerformance_1, editorGroupsService_1, editorService_1, progress_1, extensionsActions_1, notebookService_1, extensions_1, workingCopyBackup_1, buffer_1, log_1, notebookWorkerService_1, preferences_1) {
    "use strict";
    var NotebookEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditor = void 0;
    const NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'NotebookEditorViewState';
    let NotebookEditor = class NotebookEditor extends editorPane_1.EditorPane {
        static { NotebookEditor_1 = this; }
        static { this.ID = notebookCommon_1.NOTEBOOK_EDITOR_ID; }
        get onDidFocus() { return this._onDidFocusWidget.event; }
        get onDidBlur() { return this._onDidBlurWidget.event; }
        constructor(telemetryService, themeService, _instantiationService, storageService, _editorService, _editorGroupService, _notebookWidgetService, _contextKeyService, _fileService, configurationService, _editorProgressService, _notebookService, _extensionsWorkbenchService, _workingCopyBackupService, logService, _notebookEditorWorkerService, _preferencesService) {
            super(NotebookEditor_1.ID, telemetryService, themeService, storageService);
            this._instantiationService = _instantiationService;
            this._editorService = _editorService;
            this._editorGroupService = _editorGroupService;
            this._notebookWidgetService = _notebookWidgetService;
            this._contextKeyService = _contextKeyService;
            this._fileService = _fileService;
            this._editorProgressService = _editorProgressService;
            this._notebookService = _notebookService;
            this._extensionsWorkbenchService = _extensionsWorkbenchService;
            this._workingCopyBackupService = _workingCopyBackupService;
            this.logService = logService;
            this._notebookEditorWorkerService = _notebookEditorWorkerService;
            this._preferencesService = _preferencesService;
            this._groupListener = this._register(new lifecycle_1.DisposableStore());
            this._widgetDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._widget = { value: undefined };
            this._inputListener = this._register(new lifecycle_1.MutableDisposable());
            // override onDidFocus and onDidBlur to be based on the NotebookEditorWidget element
            this._onDidFocusWidget = this._register(new event_1.Emitter());
            this._onDidBlurWidget = this._register(new event_1.Emitter());
            this._onDidChangeModel = this._register(new event_1.Emitter());
            this.onDidChangeModel = this._onDidChangeModel.event;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._editorMemento = this.getEditorMemento(_editorGroupService, configurationService, NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY);
            this._register(this._fileService.onDidChangeFileSystemProviderCapabilities(e => this._onDidChangeFileSystemProvider(e.scheme)));
            this._register(this._fileService.onDidChangeFileSystemProviderRegistrations(e => this._onDidChangeFileSystemProvider(e.scheme)));
        }
        _onDidChangeFileSystemProvider(scheme) {
            if (this.input instanceof notebookEditorInput_1.NotebookEditorInput && this.input.resource?.scheme === scheme) {
                this._updateReadonly(this.input);
            }
        }
        _onDidChangeInputCapabilities(input) {
            if (this.input === input) {
                this._updateReadonly(input);
            }
        }
        _updateReadonly(input) {
            this._widget.value?.setOptions({ isReadOnly: !!input.isReadonly() });
        }
        get textModel() {
            return this._widget.value?.textModel;
        }
        get minimumWidth() { return 220; }
        get maximumWidth() { return Number.POSITIVE_INFINITY; }
        // these setters need to exist because this extends from EditorPane
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        //#region Editor Core
        get scopedContextKeyService() {
            return this._widget.value?.scopedContextKeyService;
        }
        createEditor(parent) {
            this._rootElement = DOM.append(parent, DOM.$('.notebook-editor'));
            this._rootElement.id = `notebook-editor-element-${(0, uuid_1.generateUuid)()}`;
        }
        getActionViewItem(action) {
            if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                // this is being disposed by the consumer
                return this._instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this);
            }
            return undefined;
        }
        getControl() {
            return this._widget.value;
        }
        setVisible(visible, group) {
            super.setVisible(visible, group);
            if (!visible) {
                this._widget.value?.onWillHide();
            }
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (group) {
                this._groupListener.clear();
                this._groupListener.add(group.onWillCloseEditor(e => this._saveEditorViewState(e.editor)));
                this._groupListener.add(group.onDidModelChange(() => {
                    if (this._editorGroupService.activeGroup !== group) {
                        this._widget?.value?.updateEditorFocus();
                    }
                }));
            }
            if (!visible) {
                this._saveEditorViewState(this.input);
                if (this.input && this._widget.value) {
                    // the widget is not transfered to other editor inputs
                    this._widget.value.onWillHide();
                }
            }
        }
        focus() {
            super.focus();
            this._widget.value?.focus();
        }
        hasFocus() {
            const value = this._widget.value;
            if (!value) {
                return false;
            }
            return !!value && (DOM.isAncestorOfActiveElement(value.getDomNode() || DOM.isAncestorOfActiveElement(value.getOverflowContainerDomNode())));
        }
        async setInput(input, options, context, token, noRetry) {
            try {
                let perfMarksCaptured = false;
                const fileOpenMonitor = (0, async_1.timeout)(10000);
                fileOpenMonitor.then(() => {
                    perfMarksCaptured = true;
                    this._handlePerfMark(perf, input);
                });
                const perf = new notebookPerformance_1.NotebookPerfMarks();
                perf.mark('startTime');
                const group = this.group;
                this._inputListener.value = input.onDidChangeCapabilities(() => this._onDidChangeInputCapabilities(input));
                this._widgetDisposableStore.clear();
                // there currently is a widget which we still own so
                // we need to hide it before getting a new widget
                this._widget.value?.onWillHide();
                this._widget = this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget, group, input, undefined, this._pagePosition?.dimension, DOM.getWindowById(group.windowId)?.window ?? window_1.mainWindow);
                if (this._rootElement && this._widget.value.getDomNode()) {
                    this._rootElement.setAttribute('aria-flowto', this._widget.value.getDomNode().id || '');
                    DOM.setParentFlowTo(this._widget.value.getDomNode(), this._rootElement);
                }
                this._widgetDisposableStore.add(this._widget.value.onDidChangeModel(() => this._onDidChangeModel.fire()));
                this._widgetDisposableStore.add(this._widget.value.onDidChangeActiveCell(() => this._onDidChangeSelection.fire({ reason: 2 /* EditorPaneSelectionChangeReason.USER */ })));
                if (this._pagePosition) {
                    this._widget.value.layout(this._pagePosition.dimension, this._rootElement, this._pagePosition.position);
                }
                // only now `setInput` and yield/await. this is AFTER the actual widget is ready. This is very important
                // so that others synchronously receive a notebook editor with the correct widget being set
                await super.setInput(input, options, context, token);
                const model = await input.resolve(options, perf);
                perf.mark('inputLoaded');
                // Check for cancellation
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // The widget has been taken away again. This can happen when the tab has been closed while
                // loading was in progress, in particular when open the same resource as different view type.
                // When this happen, retry once
                if (!this._widget.value) {
                    if (noRetry) {
                        return undefined;
                    }
                    return this.setInput(input, options, context, token, true);
                }
                if (model === null) {
                    const knownProvider = this._notebookService.getViewTypeProvider(input.viewType);
                    if (!knownProvider) {
                        throw new Error((0, nls_1.localize)('fail.noEditor', "Cannot open resource with notebook editor type '{0}', please check if you have the right extension installed and enabled.", input.viewType));
                    }
                    await this._extensionsWorkbenchService.whenInitialized;
                    const extensionInfo = this._extensionsWorkbenchService.local.find(e => e.identifier.id === knownProvider);
                    throw (0, editor_1.createEditorOpenError)(new Error((0, nls_1.localize)('fail.noEditor.extensionMissing', "Cannot open resource with notebook editor type '{0}', please check if you have the right extension installed and enabled.", input.viewType)), [
                        (0, actions_1.toAction)({
                            id: 'workbench.notebook.action.installOrEnableMissing', label: extensionInfo
                                ? (0, nls_1.localize)('notebookOpenEnableMissingViewType', "Enable extension for '{0}'", input.viewType)
                                : (0, nls_1.localize)('notebookOpenInstallMissingViewType', "Install extension for '{0}'", input.viewType),
                            run: async () => {
                                const d = this._notebookService.onAddViewType(viewType => {
                                    if (viewType === input.viewType) {
                                        // serializer is registered, try to open again
                                        this._editorService.openEditor({ resource: input.resource });
                                        d.dispose();
                                    }
                                });
                                const extensionInfo = this._extensionsWorkbenchService.local.find(e => e.identifier.id === knownProvider);
                                try {
                                    if (extensionInfo) {
                                        await this._extensionsWorkbenchService.setEnablement(extensionInfo, extensionInfo.enablementState === 7 /* EnablementState.DisabledWorkspace */ ? 9 /* EnablementState.EnabledWorkspace */ : 8 /* EnablementState.EnabledGlobally */);
                                    }
                                    else {
                                        await this._instantiationService.createInstance(extensionsActions_1.InstallRecommendedExtensionAction, knownProvider).run();
                                    }
                                }
                                catch (ex) {
                                    this.logService.error(`Failed to install or enable extension ${knownProvider}`, ex);
                                    d.dispose();
                                }
                            }
                        }),
                        (0, actions_1.toAction)({
                            id: 'workbench.notebook.action.openAsText', label: (0, nls_1.localize)('notebookOpenAsText', "Open As Text"), run: async () => {
                                const backup = await this._workingCopyBackupService.resolve({ resource: input.resource, typeId: notebookCommon_1.NotebookWorkingCopyTypeIdentifier.create(input.viewType) });
                                if (backup) {
                                    // with a backup present, we must resort to opening the backup contents
                                    // as untitled text file to not show the wrong data to the user
                                    const contents = await (0, buffer_1.streamToBuffer)(backup.value);
                                    this._editorService.openEditor({ resource: undefined, contents: contents.toString() });
                                }
                                else {
                                    // without a backup present, we can open the original resource
                                    this._editorService.openEditor({ resource: input.resource, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id, pinned: true } });
                                }
                            }
                        })
                    ], { allowDialog: true });
                }
                this._widgetDisposableStore.add(model.notebook.onDidChangeContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
                const viewState = options?.viewState ?? this._loadNotebookEditorViewState(input);
                // We might be moving the notebook widget between groups, and these services are tied to the group
                this._widget.value.setParentContextKeyService(this._contextKeyService);
                this._widget.value.setEditorProgressService(this._editorProgressService);
                await this._widget.value.setModel(model.notebook, viewState, perf);
                const isReadOnly = !!input.isReadonly();
                await this._widget.value.setOptions({ ...options, isReadOnly });
                this._widgetDisposableStore.add(this._widget.value.onDidFocusWidget(() => this._onDidFocusWidget.fire()));
                this._widgetDisposableStore.add(this._widget.value.onDidBlurWidget(() => this._onDidBlurWidget.fire()));
                this._widgetDisposableStore.add(this._editorGroupService.createEditorDropTarget(this._widget.value.getDomNode(), {
                    containsGroup: (group) => this.group?.id === group.id
                }));
                perf.mark('editorLoaded');
                fileOpenMonitor.cancel();
                if (perfMarksCaptured) {
                    return;
                }
                this._handlePerfMark(perf, input);
                this._handlePromptRecommendations(model.notebook);
            }
            catch (e) {
                this.logService.warn('NotebookEditorWidget#setInput failed', e);
                if ((0, editor_1.isEditorOpenError)(e)) {
                    throw e;
                }
                // Handle case where a file is too large to open without confirmation
                if (e.fileOperationResult === 7 /* FileOperationResult.FILE_TOO_LARGE */ && this.group) {
                    let message;
                    if (e instanceof files_1.TooLargeFileOperationError) {
                        message = (0, nls_1.localize)('notebookTooLargeForHeapErrorWithSize', "The notebook is not displayed in the notebook editor because it is very large ({0}).", files_1.ByteSize.formatSize(e.size));
                    }
                    else {
                        message = (0, nls_1.localize)('notebookTooLargeForHeapErrorWithoutSize', "The notebook is not displayed in the notebook editor because it is very large.");
                    }
                    throw (0, editor_1.createTooLargeFileError)(this.group, input, options, message, this._preferencesService);
                }
                const error = (0, editor_1.createEditorOpenError)(e instanceof Error ? e : new Error((e ? e.message : '')), [
                    (0, actions_1.toAction)({
                        id: 'workbench.notebook.action.openInTextEditor', label: (0, nls_1.localize)('notebookOpenInTextEditor', "Open in Text Editor"), run: async () => {
                            const activeEditorPane = this._editorService.activeEditorPane;
                            if (!activeEditorPane) {
                                return;
                            }
                            const activeEditorResource = editor_1.EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
                            if (!activeEditorResource) {
                                return;
                            }
                            if (activeEditorResource.toString() === input.resource?.toString()) {
                                // Replace the current editor with the text editor
                                return this._editorService.openEditor({
                                    resource: activeEditorResource,
                                    options: {
                                        override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id,
                                        pinned: true // new file gets pinned by default
                                    }
                                });
                            }
                            return;
                        }
                    })
                ], { allowDialog: true });
                throw error;
            }
        }
        _handlePerfMark(perf, input) {
            const perfMarks = perf.value;
            const startTime = perfMarks['startTime'];
            const extensionActivated = perfMarks['extensionActivated'];
            const inputLoaded = perfMarks['inputLoaded'];
            const customMarkdownLoaded = perfMarks['customMarkdownLoaded'];
            const editorLoaded = perfMarks['editorLoaded'];
            let extensionActivationTimespan = -1;
            let inputLoadingTimespan = -1;
            let webviewCommLoadingTimespan = -1;
            let customMarkdownLoadingTimespan = -1;
            let editorLoadingTimespan = -1;
            if (startTime !== undefined && extensionActivated !== undefined) {
                extensionActivationTimespan = extensionActivated - startTime;
                if (inputLoaded !== undefined) {
                    inputLoadingTimespan = inputLoaded - extensionActivated;
                    webviewCommLoadingTimespan = inputLoaded - extensionActivated; // TODO@rebornix, we don't track webview comm anymore
                }
                if (customMarkdownLoaded !== undefined) {
                    customMarkdownLoadingTimespan = customMarkdownLoaded - startTime;
                }
                if (editorLoaded !== undefined) {
                    editorLoadingTimespan = editorLoaded - startTime;
                }
            }
            this.telemetryService.publicLog2('notebook/editorOpenPerf', {
                scheme: input.resource.scheme,
                ext: (0, resources_1.extname)(input.resource),
                viewType: input.viewType,
                extensionActivated: extensionActivationTimespan,
                inputLoaded: inputLoadingTimespan,
                webviewCommLoaded: webviewCommLoadingTimespan,
                customMarkdownLoaded: customMarkdownLoadingTimespan,
                editorLoaded: editorLoadingTimespan
            });
        }
        _handlePromptRecommendations(model) {
            this._notebookEditorWorkerService.canPromptRecommendation(model.uri).then(shouldPrompt => {
                this.telemetryService.publicLog2('notebook/shouldPromptRecommendation', {
                    shouldPrompt: shouldPrompt
                });
            });
        }
        clearInput() {
            this._inputListener.clear();
            if (this._widget.value) {
                this._saveEditorViewState(this.input);
                this._widget.value.onWillHide();
            }
            super.clearInput();
        }
        setOptions(options) {
            this._widget.value?.setOptions(options);
            super.setOptions(options);
        }
        saveState() {
            this._saveEditorViewState(this.input);
            super.saveState();
        }
        getViewState() {
            const input = this.input;
            if (!(input instanceof notebookEditorInput_1.NotebookEditorInput)) {
                return undefined;
            }
            this._saveEditorViewState(input);
            return this._loadNotebookEditorViewState(input);
        }
        getSelection() {
            if (this._widget.value) {
                const activeCell = this._widget.value.getActiveCell();
                if (activeCell) {
                    const cellUri = activeCell.uri;
                    return new NotebookEditorSelection(cellUri, activeCell.getSelections());
                }
            }
            return undefined;
        }
        _saveEditorViewState(input) {
            if (this.group && this._widget.value && input instanceof notebookEditorInput_1.NotebookEditorInput) {
                if (this._widget.value.isDisposed) {
                    return;
                }
                const state = this._widget.value.getEditorViewState();
                this._editorMemento.saveEditorState(this.group, input.resource, state);
            }
        }
        _loadNotebookEditorViewState(input) {
            let result;
            if (this.group) {
                result = this._editorMemento.loadEditorState(this.group, input.resource);
            }
            if (result) {
                return result;
            }
            // when we don't have a view state for the group/input-tuple then we try to use an existing
            // editor for the same resource.
            for (const group of this._editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (group.activeEditorPane !== this && group.activeEditorPane instanceof NotebookEditor_1 && group.activeEditor?.matches(input)) {
                    return group.activeEditorPane._widget.value?.getEditorViewState();
                }
            }
            return;
        }
        layout(dimension, position) {
            this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
            this._pagePosition = { dimension, position };
            if (!this._widget.value || !(this._input instanceof notebookEditorInput_1.NotebookEditorInput)) {
                return;
            }
            if (this._input.resource.toString() !== this.textModel?.uri.toString() && this._widget.value?.hasModel()) {
                // input and widget mismatch
                // this happens when
                // 1. open document A, pin the document
                // 2. open document B
                // 3. close document B
                // 4. a layout is triggered
                return;
            }
            if (this.isVisible()) {
                this._widget.value.layout(dimension, this._rootElement, position);
            }
        }
    };
    exports.NotebookEditor = NotebookEditor;
    exports.NotebookEditor = NotebookEditor = NotebookEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, editorService_1.IEditorService),
        __param(5, editorGroupsService_1.IEditorGroupsService),
        __param(6, notebookEditorService_1.INotebookEditorService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, files_1.IFileService),
        __param(9, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(10, progress_1.IEditorProgressService),
        __param(11, notebookService_1.INotebookService),
        __param(12, extensions_1.IExtensionsWorkbenchService),
        __param(13, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(14, log_1.ILogService),
        __param(15, notebookWorkerService_1.INotebookEditorWorkerService),
        __param(16, preferences_1.IPreferencesService)
    ], NotebookEditor);
    class NotebookEditorSelection {
        constructor(cellUri, selections) {
            this.cellUri = cellUri;
            this.selections = selections;
        }
        compare(other) {
            if (!(other instanceof NotebookEditorSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            if ((0, resources_1.isEqual)(this.cellUri, other.cellUri)) {
                return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
            }
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        restore(options) {
            const notebookOptions = {
                cellOptions: {
                    resource: this.cellUri,
                    options: {
                        selection: this.selections[0]
                    }
                }
            };
            Object.assign(notebookOptions, options);
            return notebookOptions;
        }
        log() {
            return this.cellUri.fragment;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvbm90ZWJvb2tFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdEaEcsTUFBTSx5Q0FBeUMsR0FBRyx5QkFBeUIsQ0FBQztJQUVyRSxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsdUJBQVU7O2lCQUM3QixPQUFFLEdBQVcsbUNBQWtCLEFBQTdCLENBQThCO1FBYWhELElBQWEsVUFBVSxLQUFrQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRS9FLElBQWEsU0FBUyxLQUFrQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBUTdFLFlBQ29CLGdCQUFtQyxFQUN2QyxZQUEyQixFQUNuQixxQkFBNkQsRUFDbkUsY0FBK0IsRUFDaEMsY0FBK0MsRUFDekMsbUJBQTBELEVBQ3hELHNCQUErRCxFQUNuRSxrQkFBdUQsRUFDN0QsWUFBMkMsRUFDdEIsb0JBQXVELEVBQ2xFLHNCQUErRCxFQUNyRSxnQkFBbUQsRUFDeEMsMkJBQXlFLEVBQzNFLHlCQUFxRSxFQUNuRixVQUF3QyxFQUN2Qiw0QkFBMkUsRUFDcEYsbUJBQXlEO1lBRTlFLEtBQUssQ0FBQyxnQkFBYyxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFoQmpDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFFbkQsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3hCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDdkMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtZQUNsRCx1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
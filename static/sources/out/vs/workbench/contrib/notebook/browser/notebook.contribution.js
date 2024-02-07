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
define(["require", "exports", "vs/base/common/network", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/jsonFormatter", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/notebook/browser/services/notebookServiceImpl", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/editor/common/editorService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/workbench/contrib/notebook/common/notebookDiffEditorInput", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor", "vs/workbench/contrib/notebook/common/services/notebookWorkerService", "vs/workbench/contrib/notebook/browser/services/notebookWorkerServiceImpl", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/base/common/event", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverServiceImpl", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/services/notebookKernelServiceImpl", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/platform/configuration/common/configuration", "vs/platform/label/common/label", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/notebook/browser/services/notebookRendererMessagingServiceImpl", "vs/workbench/contrib/notebook/common/notebookRendererMessagingService", "vs/editor/common/config/editorOptions", "vs/workbench/contrib/notebook/browser/services/notebookExecutionStateServiceImpl", "vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookKeymapService", "vs/workbench/contrib/notebook/browser/services/notebookKeymapServiceImpl", "vs/editor/common/languages/modesRegistry", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/editor/common/services/languageFeatures", "vs/workbench/contrib/comments/browser/commentReply", "vs/editor/browser/services/codeEditorService", "vs/workbench/contrib/notebook/browser/services/notebookKernelHistoryServiceImpl", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/workbench/contrib/notebook/browser/services/notebookLoggingServiceImpl", "vs/platform/product/common/product", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookAccessibility", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariables", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/controller/insertCellActions", "vs/workbench/contrib/notebook/browser/controller/executeActions", "vs/workbench/contrib/notebook/browser/controller/layoutActions", "vs/workbench/contrib/notebook/browser/controller/editActions", "vs/workbench/contrib/notebook/browser/controller/cellOutputActions", "vs/workbench/contrib/notebook/browser/controller/apiActions", "vs/workbench/contrib/notebook/browser/controller/foldingController", "vs/workbench/contrib/notebook/browser/contrib/editorHint/emptyCellEditorHint", "vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFind", "vs/workbench/contrib/notebook/browser/contrib/format/formatting", "vs/workbench/contrib/notebook/browser/contrib/saveParticipants/saveParticipants", "vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted", "vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions", "vs/workbench/contrib/notebook/browser/contrib/marker/markerProvider", "vs/workbench/contrib/notebook/browser/contrib/navigation/arrow", "vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline", "vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/statusBarProviders", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController", "vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar", "vs/workbench/contrib/notebook/browser/contrib/undoRedo/notebookUndoRedo", "vs/workbench/contrib/notebook/browser/contrib/cellCommands/cellCommands", "vs/workbench/contrib/notebook/browser/contrib/viewportWarmup/viewportWarmup", "vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout", "vs/workbench/contrib/notebook/browser/contrib/debug/notebookBreakpoints", "vs/workbench/contrib/notebook/browser/contrib/debug/notebookCellPausing", "vs/workbench/contrib/notebook/browser/contrib/debug/notebookDebugDecorations", "vs/workbench/contrib/notebook/browser/contrib/execute/executionEditorProgress", "vs/workbench/contrib/notebook/browser/contrib/kernelDetection/notebookKernelDetection", "vs/workbench/contrib/notebook/browser/diff/notebookDiffActions"], function (require, exports, network_1, lifecycle_1, marshalling_1, resources_1, types_1, uri_1, jsonFormatter_1, model_1, language_1, resolverService_1, nls, configurationRegistry_1, descriptors_1, extensions_1, instantiation_1, platform_1, editor_1, contributions_1, editor_2, notebookEditor_1, notebookEditorInput_1, notebookService_1, notebookServiceImpl_1, notebookCommon_1, editorService_1, undoRedo_1, notebookEditorModelResolverService_1, notebookDiffEditorInput_1, notebookDiffEditor_1, notebookWorkerService_1, notebookWorkerServiceImpl_1, notebookCellStatusBarService_1, notebookCellStatusBarServiceImpl_1, notebookEditorService_1, notebookEditorServiceImpl_1, jsonContributionRegistry_1, event_1, diffElementViewModel_1, notebookEditorModelResolverServiceImpl_1, notebookKernelService_1, notebookKernelServiceImpl_1, extensions_2, workingCopyEditorService_1, configuration_1, label_1, editorGroupsService_1, notebookRendererMessagingServiceImpl_1, notebookRendererMessagingService_1, editorOptions_1, notebookExecutionStateServiceImpl_1, notebookExecutionServiceImpl_1, notebookExecutionService_1, notebookKeymapService_1, notebookKeymapServiceImpl_1, modesRegistry_1, notebookExecutionStateService_1, languageFeatures_1, commentReply_1, codeEditorService_1, notebookKernelHistoryServiceImpl_1, notebookLoggingService_1, notebookLoggingServiceImpl_1, product_1, notebookContextKeys_1, notebookAccessibility_1, accessibleView_1, contextkey_1, accessibleViewActions_1, notebookVariables_1) {
    "use strict";
    var NotebookContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookContribution = void 0;
    /*--------------------------------------------------------------------------------------------- */
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(notebookEditor_1.NotebookEditor, notebookEditor_1.NotebookEditor.ID, 'Notebook Editor'), [
        new descriptors_1.SyncDescriptor(notebookEditorInput_1.NotebookEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(notebookDiffEditor_1.NotebookTextDiffEditor, notebookDiffEditor_1.NotebookTextDiffEditor.ID, 'Notebook Diff Editor'), [
        new descriptors_1.SyncDescriptor(notebookDiffEditorInput_1.NotebookDiffEditorInput)
    ]);
    class NotebookDiffEditorSerializer {
        canSerialize() {
            return true;
        }
        serialize(input) {
            (0, types_1.assertType)(input instanceof notebookDiffEditorInput_1.NotebookDiffEditorInput);
            return JSON.stringify({
                resource: input.resource,
                originalResource: input.original.resource,
                name: input.getName(),
                originalName: input.original.getName(),
                textDiffName: input.getName(),
                viewType: input.viewType,
            });
        }
        deserialize(instantiationService, raw) {
            const data = (0, marshalling_1.parse)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, originalResource, name, viewType } = data;
            if (!data || !uri_1.URI.isUri(resource) || !uri_1.URI.isUri(originalResource) || typeof name !== 'string' || typeof viewType !== 'string') {
                return undefined;
            }
            const input = notebookDiffEditorInput_1.NotebookDiffEditorInput.create(instantiationService, resource, name, undefined, originalResource, viewType);
            return input;
        }
        static canResolveBackup(editorInput, backupResource) {
            return false;
        }
    }
    class NotebookEditorSerializer {
        canSerialize() {
            return true;
        }
        serialize(input) {
            (0, types_1.assertType)(input instanceof notebookEditorInput_1.NotebookEditorInput);
            const data = {
                resource: input.resource,
                preferredResource: input.preferredResource,
                viewType: input.viewType,
                options: input.options
            };
            return JSON.stringify(data);
        }
        deserialize(instantiationService, raw) {
            const data = (0, marshalling_1.parse)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, preferredResource, viewType, options } = data;
            if (!data || !uri_1.URI.isUri(resource) || typeof viewType !== 'string') {
                return undefined;
            }
            const input = notebookEditorInput_1.NotebookEditorInput.getOrCreate(instantiationService, resource, preferredResource, viewType, options);
            return input;
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(notebookEditorInput_1.NotebookEditorInput.ID, NotebookEditorSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorFactory).registerEditorSerializer(notebookDiffEditorInput_1.NotebookDiffEditorInput.ID, NotebookDiffEditorSerializer);
    let NotebookContribution = NotebookContribution_1 = class NotebookContribution extends lifecycle_1.Disposable {
        constructor(undoRedoService, configurationService, codeEditorService) {
            super();
            this.codeEditorService = codeEditorService;
            this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
            // Watch for changes to undoRedoPerCell setting
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(notebookCommon_1.NotebookSetting.undoRedoPerCell)) {
                    this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
                }
            }));
            // register comment decoration
            this.codeEditorService.registerDecorationType('comment-controller', commentReply_1.COMMENTEDITOR_DECORATION_KEY, {});
        }
        // Add or remove the cell undo redo comparison key based on the user setting
        updateCellUndoRedoComparisonKey(configurationService, undoRedoService) {
            const undoRedoPerCell = configurationService.getValue(notebookCommon_1.NotebookSetting.undoRedoPerCell);
            if (!undoRedoPerCell) {
                // Add comparison key to map cell => main document
                if (!this._uriComparisonKeyComputer) {
                    this._uriComparisonKeyComputer = undoRedoService.registerUriComparisonKeyComputer(notebookCommon_1.CellUri.scheme, {
                        getComparisonKey: (uri) => {
                            if (undoRedoPerCell) {
                                return uri.toString();
                            }
                            return NotebookContribution_1._getCellUndoRedoComparisonKey(uri);
                        }
                    });
                }
            }
            else {
                // Dispose comparison key
                this._uriComparisonKeyComputer?.dispose();
                this._uriComparisonKeyComputer = undefined;
            }
        }
        static _getCellUndoRedoComparisonKey(uri) {
            const data = notebookCommon_1.CellUri.parse(uri);
            if (!data) {
                return uri.toString();
            }
            return data.notebook.toString();
        }
        dispose() {
            super.dispose();
            this._uriComparisonKeyComputer?.dispose();
        }
    };
    exports.NotebookContribution = NotebookContribution;
    exports.NotebookContribution = NotebookContribution = NotebookContribution_1 = __decorate([
        __param(0, undoRedo_1.IUndoRedoService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, codeEditorService_1.ICodeEditorService)
    ], NotebookContribution);
    let CellContentProvider = class CellContentProvider {
        constructor(textModelService, _modelService, _languageService, _notebookModelResolverService) {
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._notebookModelResolverService = _notebookModelResolverService;
            this._registration = textModelService.registerTextModelContentProvider(notebookCommon_1.CellUri.scheme, this);
        }
        dispose() {
            this._registration.dispose();
        }
        async provideTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parse(resource);
            // const data = parseCellUri(resource);
            if (!data) {
                return null;
            }
            const ref = await this._notebookModelResolverService.resolve(data.notebook);
            let result = null;
            if (!ref.object.isResolved()) {
                return null;
            }
            for (const cell of ref.object.notebook.cells) {
                if (cell.uri.toString() === resource.toString()) {
                    const bufferFactory = {
                        create: (defaultEOL) => {
                            const newEOL = (defaultEOL === 2 /* DefaultEndOfLine.CRLF */ ? '\r\n' : '\n');
                            cell.textBuffer.setEOL(newEOL);
                            return { textBuffer: cell.textBuffer, disposable: lifecycle_1.Disposable.None };
                        },
                        getFirstLineText: (limit) => {
                            return cell.textBuffer.getLineContent(1).substring(0, limit);
                        }
                    };
                    const languageId = this._languageService.getLanguageIdByLanguageName(cell.language);
                    const languageSelection = languageId ? this._languageService.createById(languageId) : (cell.cellKind === notebookCommon_1.CellKind.Markup ? this._languageService.createById('markdown') : this._languageService.createByFilepathOrFirstLine(resource, cell.textBuffer.getLineContent(1)));
                    result = this._modelService.createModel(bufferFactory, languageSelection, resource);
                    break;
                }
            }
            if (!result) {
                ref.dispose();
                return null;
            }
            const once = event_1.Event.any(result.onWillDispose, ref.object.notebook.onWillDispose)(() => {
                once.dispose();
                ref.dispose();
            });
            return result;
        }
    };
    CellContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService),
        __param(3, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], CellContentProvider);
    let CellInfoContentProvider = class CellInfoContentProvider {
        constructor(textModelService, _modelService, _languageService, _labelService, _notebookModelResolverService) {
            this._modelService = _modelService;
            this._languageService = _languageService;
            this._labelService = _labelService;
            this._notebookModelResolverService = _notebookModelResolverService;
            this._disposables = [];
            this._disposables.push(textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeNotebookCellMetadata, {
                provideTextContent: this.provideMetadataTextContent.bind(this)
            }));
            this._disposables.push(textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeNotebookCellOutput, {
                provideTextContent: this.provideOutputTextContent.bind(this)
            }));
            this._disposables.push(this._labelService.registerFormatter({
                scheme: network_1.Schemas.vscodeNotebookCellMetadata,
                formatting: {
                    label: '${path} (metadata)',
                    separator: '/'
                }
            }));
            this._disposables.push(this._labelService.registerFormatter({
                scheme: network_1.Schemas.vscodeNotebookCellOutput,
                formatting: {
                    label: '${path} (output)',
                    separator: '/'
                }
            }));
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._disposables);
        }
        async provideMetadataTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parseCellPropertyUri(resource, network_1.Schemas.vscodeNotebookCellMetadata);
            if (!data) {
                return null;
            }
            const ref = await this._notebookModelResolverService.resolve(data.notebook);
            let result = null;
            const mode = this._languageService.createById('json');
            for (const cell of ref.object.notebook.cells) {
                if (cell.handle === data.handle) {
                    const metadataSource = (0, diffElementViewModel_1.getFormattedMetadataJSON)(ref.object.notebook, cell.metadata, cell.language);
                    result = this._modelService.createModel(metadataSource, mode, resource);
                    break;
                }
            }
            if (!result) {
                ref.dispose();
                return null;
            }
            const once = result.onWillDispose(() => {
                once.dispose();
                ref.dispose();
            });
            return result;
        }
        parseStreamOutput(op) {
            if (!op) {
                return;
            }
            const streamOutputData = (0, diffElementViewModel_1.getStreamOutputData)(op.outputs);
            if (streamOutputData) {
                return {
                    content: streamOutputData,
                    mode: this._languageService.createById(modesRegistry_1.PLAINTEXT_LANGUAGE_ID)
                };
            }
            return;
        }
        _getResult(data, cell) {
            let result = undefined;
            const mode = this._languageService.createById('json');
            const op = cell.outputs.find(op => op.outputId === data.outputId || op.alternativeOutputId === data.outputId);
            const streamOutputData = this.parseStreamOutput(op);
            if (streamOutputData) {
                result = streamOutputData;
                return result;
            }
            const obj = cell.outputs.map(output => ({
                metadata: output.metadata,
                outputItems: output.outputs.map(opit => ({
                    mimeType: opit.mime,
                    data: opit.data.toString()
                }))
            }));
            const outputSource = (0, jsonFormatter_1.toFormattedString)(obj, {});
            result = {
                content: outputSource,
                mode
            };
            return result;
        }
        async provideOutputTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parseCellOutputUri(resource);
            if (!data) {
                return null;
            }
            const ref = await this._notebookModelResolverService.resolve(data.notebook);
            const cell = ref.object.notebook.cells.find(cell => !!cell.outputs.find(op => op.outputId === data.outputId || op.alternativeOutputId === data.outputId));
            if (!cell) {
                ref.dispose();
                return null;
            }
            const result = this._getResult(data, cell);
            if (!result) {
                ref.dispose();
                return null;
            }
            const model = this._modelService.createModel(result.content, result.mode, resource);
            const cellModelListener = event_1.Event.any(cell.onDidChangeOutputs ?? event_1.Event.None, cell.onDidChangeOutputItems ?? event_1.Event.None)(() => {
                const newResult = this._getResult(data, cell);
                if (!newResult) {
                    return;
                }
                model.setValue(newResult.content);
                model.setLanguage(newResult.mode.languageId);
            });
            const once = model.onWillDispose(() => {
                once.dispose();
                cellModelListener.dispose();
                ref.dispose();
            });
            return model;
        }
    };
    CellInfoContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, model_1.IModelService),
        __param(2, language_1.ILanguageService),
        __param(3, label_1.ILabelService),
        __param(4, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], CellInfoContentProvider);
    class RegisterSchemasContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this.registerMetadataSchemas();
        }
        registerMetadataSchemas() {
            const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
            const metadataSchema = {
                properties: {
                    ['language']: {
                        type: 'string',
                        description: 'The language for the cell'
                    }
                },
                // patternProperties: allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            jsonRegistry.registerSchema('vscode://schemas/notebook/cellmetadata', metadataSchema);
        }
    }
    let NotebookEditorManager = class NotebookEditorManager {
        constructor(_editorService, _notebookEditorModelService, editorGroups) {
            this._editorService = _editorService;
            this._notebookEditorModelService = _notebookEditorModelService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._disposables.add(event_1.Event.debounce(this._notebookEditorModelService.onDidChangeDirty, (last, current) => !last ? [current] : [...last, current], 100)(this._openMissingDirtyNotebookEditors, this));
            // CLOSE editors when we are about to open conflicting notebooks
            this._disposables.add(_notebookEditorModelService.onWillFailWithConflict(e => {
                for (const group of editorGroups.groups) {
                    const conflictInputs = group.editors.filter(input => input instanceof notebookEditorInput_1.NotebookEditorInput && input.viewType !== e.viewType && (0, resources_1.isEqual)(input.resource, e.resource));
                    const p = group.closeEditors(conflictInputs);
                    e.waitUntil(p);
                }
            }));
        }
        dispose() {
            this._disposables.dispose();
        }
        _openMissingDirtyNotebookEditors(models) {
            const result = [];
            for (const model of models) {
                if (model.isDirty() && !this._editorService.isOpened({ resource: model.resource, typeId: notebookEditorInput_1.NotebookEditorInput.ID, editorId: model.viewType }) && (0, resources_1.extname)(model.resource) !== '.interactive') {
                    result.push({
                        resource: model.resource,
                        options: { inactive: true, preserveFocus: true, pinned: true, override: model.viewType }
                    });
                }
            }
            if (result.length > 0) {
                this._editorService.openEditors(result);
            }
        }
    };
    NotebookEditorManager = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, notebookEditorModelResolverService_1.INotebookEditorModelResolverService),
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], NotebookEditorManager);
    let SimpleNotebookWorkingCopyEditorHandler = class SimpleNotebookWorkingCopyEditorHandler extends lifecycle_1.Disposable {
        constructor(_instantiationService, _workingCopyEditorService, _extensionService, _notebookService) {
            super();
            this._instantiationService = _instantiationService;
            this._workingCopyEditorService = _workingCopyEditorService;
            this._extensionService = _extensionService;
            this._notebookService = _notebookService;
            this._installHandler();
        }
        async handles(workingCopy) {
            const viewType = this.handlesSync(workingCopy);
            if (!viewType) {
                return false;
            }
            return this._notebookService.canResolve(viewType);
        }
        handlesSync(workingCopy) {
            const viewType = this._getViewType(workingCopy);
            if (!viewType || viewType === 'interactive') {
                return undefined;
            }
            return viewType;
        }
        isOpen(workingCopy, editor) {
            if (!this.handlesSync(workingCopy)) {
                return false;
            }
            return editor instanceof notebookEditorInput_1.NotebookEditorInput && editor.viewType === this._getViewType(workingCopy) && (0, resources_1.isEqual)(workingCopy.resource, editor.resource);
        }
        createEditor(workingCopy) {
            return notebookEditorInput_1.NotebookEditorInput.getOrCreate(this._instantiationService, workingCopy.resource, undefined, this._getViewType(workingCopy));
        }
        async _installHandler() {
            await this._extensionService.whenInstalledExtensionsRegistered();
            this._register(this._workingCopyEditorService.registerHandler(this));
        }
        _getViewType(workingCopy) {
            return notebookCommon_1.NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId);
        }
    };
    SimpleNotebookWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(2, extensions_2.IExtensionService),
        __param(3, notebookService_1.INotebookService)
    ], SimpleNotebookWorkingCopyEditorHandler);
    let NotebookLanguageSelectorScoreRefine = class NotebookLanguageSelectorScoreRefine {
        constructor(_notebookService, languageFeaturesService) {
            this._notebookService = _notebookService;
            languageFeaturesService.setNotebookTypeResolver(this._getNotebookInfo.bind(this));
        }
        _getNotebookInfo(uri) {
            const cellUri = notebookCommon_1.CellUri.parse(uri);
            if (!cellUri) {
                return undefined;
            }
            const notebook = this._notebookService.getNotebookTextModel(cellUri.notebook);
            if (!notebook) {
                return undefined;
            }
            return {
                uri: notebook.uri,
                type: notebook.viewType
            };
        }
    };
    NotebookLanguageSelectorScoreRefine = __decorate([
        __param(0, notebookService_1.INotebookService),
        __param(1, languageFeatures_1.ILanguageFeaturesService)
    ], NotebookLanguageSelectorScoreRefine);
    class NotebookAccessibilityHelpContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(105, 'notebook', async (accessor) => {
                const activeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getActiveCodeEditor()
                    || accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor()
                    || accessor.get(editorService_1.IEditorService).activeEditorPane;
                if (activeEditor) {
                    (0, notebookAccessibility_1.runAccessibilityHelpAction)(accessor, activeEditor);
                }
            }, notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR));
        }
    }
    class NotebookAccessibleViewContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(100, 'notebook', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const editorService = accessor.get(editorService_1.IEditorService);
                return (0, notebookAccessibility_1.showAccessibleOutput)(accessibleViewService, editorService);
            }, contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_OUTPUT_FOCUSED, contextkey_1.ContextKeyExpr.equals('resourceExtname', '.ipynb'))));
        }
    }
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(CellContentProvider, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(CellInfoContentProvider, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RegisterSchemasContribution, 1 /* LifecyclePhase.Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookEditorManager, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookLanguageSelectorScoreRefine, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(SimpleNotebookWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookAccessibilityHelpContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(notebookVariables_1.NotebookVariables, 4 /* LifecyclePhase.Eventually */);
    (0, extensions_1.registerSingleton)(notebookService_1.INotebookService, notebookServiceImpl_1.NotebookService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookWorkerService_1.INotebookEditorWorkerService, notebookWorkerServiceImpl_1.NotebookEditorWorkerServiceImpl, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookEditorModelResolverService_1.INotebookEditorModelResolverService, notebookEditorModelResolverServiceImpl_1.NotebookModelResolverServiceImpl, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookCellStatusBarService_1.INotebookCellStatusBarService, notebookCellStatusBarServiceImpl_1.NotebookCellStatusBarService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookEditorService_1.INotebookEditorService, notebookEditorServiceImpl_1.NotebookEditorWidgetService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookKernelService_1.INotebookKernelService, notebookKernelServiceImpl_1.NotebookKernelService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookKernelService_1.INotebookKernelHistoryService, notebookKernelHistoryServiceImpl_1.NotebookKernelHistoryService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookExecutionService_1.INotebookExecutionService, notebookExecutionServiceImpl_1.NotebookExecutionService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookExecutionStateService_1.INotebookExecutionStateService, notebookExecutionStateServiceImpl_1.NotebookExecutionStateService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookRendererMessagingService_1.INotebookRendererMessagingService, notebookRendererMessagingServiceImpl_1.NotebookRendererMessagingService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookKeymapService_1.INotebookKeymapService, notebookKeymapServiceImpl_1.NotebookKeymapService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(notebookLoggingService_1.INotebookLoggingService, notebookLoggingServiceImpl_1.NotebookLoggingService, 1 /* InstantiationType.Delayed */);
    const schemas = {};
    function isConfigurationPropertySchema(x) {
        return (typeof x.type !== 'undefined' || typeof x.anyOf !== 'undefined');
    }
    for (const editorOption of editorOptions_1.editorOptionsRegistry) {
        const schema = editorOption.schema;
        if (schema) {
            if (isConfigurationPropertySchema(schema)) {
                schemas[`editor.${editorOption.name}`] = schema;
            }
            else {
                for (const key in schema) {
                    if (Object.hasOwnProperty.call(schema, key)) {
                        schemas[key] = schema[key];
                    }
                }
            }
        }
    }
    const editorOptionsCustomizationSchema = {
        description: nls.localize('notebook.editorOptions.experimentalCustomization', 'Settings for code editors used in notebooks. This can be used to customize most editor.* settings.'),
        default: {},
        allOf: [
            {
                properties: schemas,
            }
            // , {
            // 	patternProperties: {
            // 		'^\\[.*\\]$': {
            // 			type: 'object',
            // 			default: {},
            // 			properties: schemas
            // 		}
            // 	}
            // }
        ],
        tags: ['notebookLayout']
    };
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'notebook',
        order: 100,
        title: nls.localize('notebookConfigurationTitle', "Notebook"),
        type: 'object',
        properties: {
            [notebookCommon_1.NotebookSetting.displayOrder]: {
                description: nls.localize('notebook.displayOrder.description', "Priority list for output mime types"),
                type: 'array',
                items: {
                    type: 'string'
                },
                default: []
            },
            [notebookCommon_1.NotebookSetting.cellToolbarLocation]: {
                description: nls.localize('notebook.cellToolbarLocation.description', "Where the cell toolbar should be shown, or whether it should be hidden."),
                type: 'object',
                additionalProperties: {
                    markdownDescription: nls.localize('notebook.cellToolbarLocation.viewType', "Configure the cell toolbar position for for specific file types"),
                    type: 'string',
                    enum: ['left', 'right', 'hidden']
                },
                default: {
                    'default': 'right'
                },
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.showCellStatusBar]: {
                description: nls.localize('notebook.showCellStatusbar.description', "Whether the cell status bar should be shown."),
                type: 'string',
                enum: ['hidden', 'visible', 'visibleAfterExecute'],
                enumDescriptions: [
                    nls.localize('notebook.showCellStatusbar.hidden.description', "The cell Status bar is always hidden."),
                    nls.localize('notebook.showCellStatusbar.visible.description', "The cell Status bar is always visible."),
                    nls.localize('notebook.showCellStatusbar.visibleAfterExecute.description', "The cell Status bar is hidden until the cell has executed. Then it becomes visible to show the execution status.")
                ],
                default: 'visible',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.textDiffEditorPreview]: {
                description: nls.localize('notebook.diff.enablePreview.description', "Whether to use the enhanced text diff editor for notebook."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.diffOverviewRuler]: {
                description: nls.localize('notebook.diff.enableOverviewRuler.description', "Whether to render the overview ruler in the diff editor for notebook."),
                type: 'boolean',
                default: false,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.cellToolbarVisibility]: {
                markdownDescription: nls.localize('notebook.cellToolbarVisibility.description', "Whether the cell toolbar should appear on hover or click."),
                type: 'string',
                enum: ['hover', 'click'],
                default: 'click',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.undoRedoPerCell]: {
                description: nls.localize('notebook.undoRedoPerCell.description', "Whether to use separate undo/redo stack for each cell."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.compactView]: {
                description: nls.localize('notebook.compactView.description', "Control whether the notebook editor should be rendered in a compact form. For example, when turned on, it will decrease the left margin width."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.focusIndicator]: {
                description: nls.localize('notebook.focusIndicator.description', "Controls where the focus indicator is rendered, either along the cell borders or on the left gutter."),
                type: 'string',
                enum: ['border', 'gutter'],
                default: 'gutter',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.insertToolbarLocation]: {
                description: nls.localize('notebook.insertToolbarPosition.description', "Control where the insert cell actions should appear."),
                type: 'string',
                enum: ['betweenCells', 'notebookToolbar', 'both', 'hidden'],
                enumDescriptions: [
                    nls.localize('insertToolbarLocation.betweenCells', "A toolbar that appears on hover between cells."),
                    nls.localize('insertToolbarLocation.notebookToolbar', "The toolbar at the top of the notebook editor."),
                    nls.localize('insertToolbarLocation.both', "Both toolbars."),
                    nls.localize('insertToolbarLocation.hidden', "The insert actions don't appear anywhere."),
                ],
                default: 'both',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.globalToolbar]: {
                description: nls.localize('notebook.globalToolbar.description', "Control whether to render a global toolbar inside the notebook editor."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.stickyScrollEnabled]: {
                description: nls.localize('notebook.stickyScrollEnabled.description', "Experimental. Control whether to render notebook Sticky Scroll headers in the notebook editor."),
                type: 'boolean',
                default: false,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.stickyScrollMode]: {
                description: nls.localize('notebook.stickyScrollMode.description', "Control whether nested sticky lines appear to stack flat or indented."),
                type: 'string',
                enum: ['flat', 'indented'],
                enumDescriptions: [
                    nls.localize('notebook.stickyScrollMode.flat', "Nested sticky lines appear flat."),
                    nls.localize('notebook.stickyScrollMode.indented', "Nested sticky lines appear indented."),
                ],
                default: 'indented',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.consolidatedOutputButton]: {
                description: nls.localize('notebook.consolidatedOutputButton.description', "Control whether outputs action should be rendered in the output toolbar."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.showFoldingControls]: {
                description: nls.localize('notebook.showFoldingControls.description', "Controls when the Markdown header folding arrow is shown."),
                type: 'string',
                enum: ['always', 'never', 'mouseover'],
                enumDescriptions: [
                    nls.localize('showFoldingControls.always', "The folding controls are always visible."),
                    nls.localize('showFoldingControls.never', "Never show the folding controls and reduce the gutter size."),
                    nls.localize('showFoldingControls.mouseover', "The folding controls are visible only on mouseover."),
                ],
                default: 'mouseover',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.dragAndDropEnabled]: {
                description: nls.localize('notebook.dragAndDrop.description', "Control whether the notebook editor should allow moving cells through drag and drop."),
                type: 'boolean',
                default: true,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.consolidatedRunButton]: {
                description: nls.localize('notebook.consolidatedRunButton.description', "Control whether extra actions are shown in a dropdown next to the run button."),
                type: 'boolean',
                default: false,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.globalToolbarShowLabel]: {
                description: nls.localize('notebook.globalToolbarShowLabel', "Control whether the actions on the notebook toolbar should render label or not."),
                type: 'string',
                enum: ['always', 'never', 'dynamic'],
                default: 'always',
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.textOutputLineLimit]: {
                markdownDescription: nls.localize('notebook.textOutputLineLimit', "Controls how many lines of text are displayed in a text output. If {0} is enabled, this setting is used to determine the scroll height of the output.", '`#notebook.output.scrolling#`'),
                type: 'number',
                default: 30,
                tags: ['notebookLayout', 'notebookOutputLayout'],
                minimum: 1,
            },
            [notebookCommon_1.NotebookSetting.LinkifyOutputFilePaths]: {
                description: nls.localize('notebook.disableOutputFilePathLinks', "Control whether to disable filepath links in the output of notebook cells."),
                type: 'boolean',
                default: true,
                tags: ['notebookOutputLayout']
            },
            [notebookCommon_1.NotebookSetting.markupFontSize]: {
                markdownDescription: nls.localize('notebook.markup.fontSize', "Controls the font size in pixels of rendered markup in notebooks. When set to {0}, 120% of {1} is used.", '`0`', '`#editor.fontSize#`'),
                type: 'number',
                default: 0,
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.cellEditorOptionsCustomizations]: editorOptionsCustomizationSchema,
            [notebookCommon_1.NotebookSetting.interactiveWindowCollapseCodeCells]: {
                markdownDescription: nls.localize('notebook.interactiveWindow.collapseCodeCells', "Controls whether code cells in the interactive window are collapsed by default."),
                type: 'string',
                enum: ['always', 'never', 'fromEditor'],
                default: 'fromEditor'
            },
            [notebookCommon_1.NotebookSetting.outputLineHeight]: {
                markdownDescription: nls.localize('notebook.outputLineHeight', "Line height of the output text within notebook cells.\n - When set to 0, editor line height is used.\n - Values between 0 and 8 will be used as a multiplier with the font size.\n - Values greater than or equal to 8 will be used as effective values."),
                type: 'number',
                default: 0,
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.NotebookSetting.outputFontSize]: {
                markdownDescription: nls.localize('notebook.outputFontSize', "Font size for the output text within notebook cells. When set to 0, {0} is used.", '`#editor.fontSize#`'),
                type: 'number',
                default: 0,
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.NotebookSetting.outputFontFamily]: {
                markdownDescription: nls.localize('notebook.outputFontFamily', "The font family of the output text within notebook cells. When set to empty, the {0} is used.", '`#editor.fontFamily#`'),
                type: 'string',
                tags: ['notebookLayout', 'notebookOutputLayout']
            },
            [notebookCommon_1.NotebookSetting.outputScrolling]: {
                markdownDescription: nls.localize('notebook.outputScrolling', "Initially render notebook outputs in a scrollable region when longer than the limit."),
                type: 'boolean',
                tags: ['notebookLayout', 'notebookOutputLayout'],
                default: typeof product_1.default.quality === 'string' && product_1.default.quality !== 'stable' // only enable as default in insiders
            },
            [notebookCommon_1.NotebookSetting.outputWordWrap]: {
                markdownDescription: nls.localize('notebook.outputWordWrap', "Controls whether the lines in output should wrap."),
                type: 'boolean',
                tags: ['notebookLayout', 'notebookOutputLayout'],
                default: false
            },
            [notebookCommon_1.NotebookSetting.formatOnSave]: {
                markdownDescription: nls.localize('notebook.formatOnSave', "Format a notebook on save. A formatter must be available, the file must not be saved after delay, and the editor must not be shutting down."),
                type: 'boolean',
                tags: ['notebookLayout'],
                default: false
            },
            [notebookCommon_1.NotebookSetting.insertFinalNewline]: {
                markdownDescription: nls.localize('notebook.insertFinalNewline', "When enabled, insert a final new line into the end of code cells when saving a notebook."),
                type: 'boolean',
                tags: ['notebookLayout'],
                default: false
            },
            [notebookCommon_1.NotebookSetting.codeActionsOnSave]: {
                markdownDescription: nls.localize('notebook.codeActionsOnSave', 'Run a series of Code Actions for a notebook on save. Code Actions must be specified, the file must not be saved after delay, and the editor must not be shutting down. Example: `"notebook.source.organizeImports": "explicit"`'),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'boolean'],
                    enum: ['explicit', 'never', true, false],
                    // enum: ['explicit', 'always', 'never'], -- autosave support needs to be built first
                    // nls.localize('always', 'Always triggers Code Actions on save, including autosave, focus, and window change events.'),
                    enumDescriptions: [nls.localize('explicit', 'Triggers Code Actions only when explicitly saved.'), nls.localize('never', 'Never triggers Code Actions on save.'), nls.localize('explicitBoolean', 'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "explicit".'), nls.localize('neverBoolean', 'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "never".')],
                },
                default: {}
            },
            [notebookCommon_1.NotebookSetting.formatOnCellExecution]: {
                markdownDescription: nls.localize('notebook.formatOnCellExecution', "Format a notebook cell upon execution. A formatter must be available."),
                type: 'boolean',
                default: false
            },
            [notebookCommon_1.NotebookSetting.confirmDeleteRunningCell]: {
                markdownDescription: nls.localize('notebook.confirmDeleteRunningCell', "Control whether a confirmation prompt is required to delete a running cell."),
                type: 'boolean',
                default: true
            },
            [notebookCommon_1.NotebookSetting.findScope]: {
                markdownDescription: nls.localize('notebook.findScope', "Customize the Find Widget behavior for searching within notebook cells. When both markup source and markup preview are enabled, the Find Widget will search either the source code or preview based on the current state of the cell."),
                type: 'object',
                properties: {
                    markupSource: {
                        type: 'boolean',
                        default: true
                    },
                    markupPreview: {
                        type: 'boolean',
                        default: true
                    },
                    codeSource: {
                        type: 'boolean',
                        default: true
                    },
                    codeOutput: {
                        type: 'boolean',
                        default: true
                    }
                },
                default: {
                    markupSource: true,
                    markupPreview: true,
                    codeSource: true,
                    codeOutput: true
                },
                tags: ['notebookLayout']
            },
            [notebookCommon_1.NotebookSetting.remoteSaving]: {
                markdownDescription: nls.localize('notebook.remoteSaving', "Enables the incremental saving of notebooks in Remote environment. When enabled, only the changes to the notebook are sent to the extension host, improving performance for large notebooks and slow network connections."),
                type: 'boolean',
                default: typeof product_1.default.quality === 'string' && product_1.default.quality !== 'stable' // only enable as default in insiders
            },
            [notebookCommon_1.NotebookSetting.scrollToRevealCell]: {
                markdownDescription: nls.localize('notebook.scrolling.revealNextCellOnExecute.description', "How far to scroll when revealing the next cell upon running {0}.", 'notebook.cell.executeAndSelectBelow'),
                type: 'string',
                enum: ['fullCell', 'firstLine', 'none'],
                markdownEnumDescriptions: [
                    nls.localize('notebook.scrolling.revealNextCellOnExecute.fullCell.description', 'Scroll to fully reveal the next cell.'),
                    nls.localize('notebook.scrolling.revealNextCellOnExecute.firstLine.description', 'Scroll to reveal the first line of the next cell.'),
                    nls.localize('notebook.scrolling.revealNextCellOnExecute.none.description', 'Do not scroll.'),
                ],
                default: 'fullCell'
            },
            [notebookCommon_1.NotebookSetting.anchorToFocusedCell]: {
                markdownDescription: nls.localize('notebook.scrolling.anchorToFocusedCell.description', "Experimental. Keep the focused cell steady while surrounding cells change size."),
                type: 'string',
                enum: ['auto', 'on', 'off'],
                markdownEnumDescriptions: [
                    nls.localize('notebook.scrolling.anchorToFocusedCell.auto.description', "Anchor the viewport to the focused cell depending on context unless {0} is set to {1}.", 'notebook.scrolling.revealCellBehavior', 'none'),
                    nls.localize('notebook.scrolling.anchorToFocusedCell.on.description', "Always anchor the viewport to the focused cell."),
                    nls.localize('notebook.scrolling.anchorToFocusedCell.off.description', "The focused cell may shift around as cells resize.")
                ],
                default: 'auto'
            },
            [notebookCommon_1.NotebookSetting.cellChat]: {
                markdownDescription: nls.localize('notebook.cellChat', "Enable experimental cell chat for notebooks."),
                type: 'boolean',
                default: false
            },
            [notebookCommon_1.NotebookSetting.notebookVariablesView]: {
                markdownDescription: nls.localize('notebook.VariablesView.description', "Enable the experimental notebook variables view within the debug panel."),
                type: 'boolean',
                default: false
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2suY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL25vdGVib29rLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBd0hoRyxrR0FBa0c7SUFFbEcsbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQzFCLCtCQUFjLEVBQ2QsK0JBQWMsQ0FBQyxFQUFFLEVBQ2pCLGlCQUFpQixDQUNqQixFQUNEO1FBQ0MsSUFBSSw0QkFBYyxDQUFDLHlDQUFtQixDQUFDO0tBQ3ZDLENBQ0QsQ0FBQztJQUVGLG1CQUFRLENBQUMsRUFBRSxDQUFzQix5QkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxrQkFBa0IsQ0FDL0UsNkJBQW9CLENBQUMsTUFBTSxDQUMxQiwyQ0FBc0IsRUFDdEIsMkNBQXNCLENBQUMsRUFBRSxFQUN6QixzQkFBc0IsQ0FDdEIsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyxpREFBdUIsQ0FBQztLQUMzQyxDQUNELENBQUM7SUFFRixNQUFNLDRCQUE0QjtRQUNqQyxZQUFZO1lBQ1gsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsU0FBUyxDQUFDLEtBQWtCO1lBQzNCLElBQUEsa0JBQVUsRUFBQyxLQUFLLFlBQVksaURBQXVCLENBQUMsQ0FBQztZQUNyRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3JCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtnQkFDeEIsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRO2dCQUN6QyxJQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFB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
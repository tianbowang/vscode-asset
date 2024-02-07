(function anonymous() { /*---------------------------------------------------------------------------------------------
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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/webview/common/webview", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/proxyIdentifier", "vs/workbench/contrib/notebook/common/notebookKernelService"], function (require, exports, arrays_1, async_1, cancellation_1, event_1, lifecycle_1, map_1, uri_1, extensions_1, log_1, extHost_protocol_1, extHostCommands_1, extHostTypeConverters, extHostTypes_1, webview_1, notebookExecutionService_1, extensions_2, proxyIdentifier_1, notebookKernelService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createKernelId = exports.ExtHostNotebookKernels = void 0;
    let ExtHostNotebookKernels = class ExtHostNotebookKernels {
        constructor(mainContext, _initData, _extHostNotebook, _commands, _logService) {
            this._initData = _initData;
            this._extHostNotebook = _extHostNotebook;
            this._commands = _commands;
            this._logService = _logService;
            this._activeExecutions = new map_1.ResourceMap();
            this._activeNotebookExecutions = new map_1.ResourceMap();
            this._kernelDetectionTask = new Map();
            this._kernelDetectionTaskHandlePool = 0;
            this._kernelSourceActionProviders = new Map();
            this._kernelSourceActionProviderHandlePool = 0;
            this._kernelData = new Map();
            this._handlePool = 0;
            this._onDidChangeCellExecutionState = new event_1.Emitter();
            this.onDidChangeNotebookCellExecutionState = this._onDidChangeCellExecutionState.event;
            this.id = 0;
            this.variableStore = {};
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebookKernels);
            // todo@rebornix @joyceerhl: move to APICommands once stabilized.
            const selectKernelApiCommand = new extHostCommands_1.ApiCommand('notebook.selectKernel', '_notebook.selectKernel', 'Trigger kernel picker for specified notebook editor widget', [
                new extHostCommands_1.ApiCommandArgument('options', 'Select kernel options', v => true, (v) => {
                    if (v && 'notebookEditor' in v && 'id' in v) {
                        const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
                        return {
                            id: v.id, extension: v.extension, notebookEditorId
                        };
                    }
                    else if (v && 'notebookEditor' in v) {
                        const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
                        if (notebookEditorId === undefined) {
                            throw new Error(`Cannot invoke 'notebook.selectKernel' for unrecognized notebook editor ${v.notebookEditor.notebook.uri.toString()}`);
                        }
                        return { notebookEditorId };
                    }
                    return v;
                })
            ], extHostCommands_1.ApiCommandResult.Void);
            this._commands.registerApiCommand(selectKernelApiCommand);
        }
        createNotebookController(extension, id, viewType, label, handler, preloads) {
            for (const data of this._kernelData.values()) {
                if (data.controller.id === id && extensions_1.ExtensionIdentifier.equals(extension.identifier, data.extensionId)) {
                    throw new Error(`notebook controller with id '${id}' ALREADY exist`);
                }
            }
            const handle = this._handlePool++;
            const that = this;
            this._logService.trace(`NotebookController[${handle}], CREATED by ${extension.identifier.value}, ${id}`);
            const _defaultExecutHandler = () => console.warn(`NO execute handler from notebook controller '${data.id}' of extension: '${extension.identifier}'`);
            let isDisposed = false;
            const onDidChangeSelection = new event_1.Emitter();
            const onDidReceiveMessage = new event_1.Emitter();
            const data = {
                id: createKernelId(extension.identifier, id),
                notebookType: viewType,
                extensionId: extension.identifier,
                extensionLocation: extension.extensionLocation,
                label: label || extension.identifier.value,
                preloads: preloads ? preloads.map(extHostTypeConverters.NotebookRendererScript.from) : []
            };
            //
            let _executeHandler = handler ?? _defaultExecutHandler;
            let _interruptHandler;
            let _variableProvider;
            this._proxy.$addKernel(handle, data).catch(err => {
                // this can happen when a kernel with that ID is already registered
                console.log(err);
                isDisposed = true;
            });
            // update: all setters write directly into the dto object
            // and trigger an update. the actual update will only happen
            // once per event loop execution
            let tokenPool = 0;
            const _update = () => {
                if (isDisposed) {
                    return;
                }
                const myToken = ++tokenPool;
                Promise.resolve().then(() => {
                    if (myToken === tokenPool) {
                        this._proxy.$updateKernel(handle, data);
                    }
                });
            };
            // notebook documents that are associated to this controller
            const associatedNotebooks = new map_1.ResourceMap();
            const controller = {
                get id() { return id; },
                get notebookType() { return data.notebookType; },
                onDidChangeSelectedNotebooks: onDidChangeSelection.event,
                get label() {
                    return data.label;
                },
                set label(value) {
                    data.label = value ?? extension.displayName ?? extension.name;
                    _update();
                },
                get detail() {
                    return data.detail ?? '';
                },
                set detail(value) {
                    data.detail = value;
                    _update();
                },
                get description() {
                    return data.description ?? '';
                },
                set description(value) {
                    data.description = value;
                    _update();
                },
                get supportedLanguages() {
                    return data.supportedLanguages;
                },
                set supportedLanguages(value) {
                    data.supportedLanguages = value;
                    _update();
                },
                get supportsExecutionOrder() {
                    return data.supportsExecutionOrder ?? false;
                },
                set supportsExecutionOrder(value) {
                    data.supportsExecutionOrder = value;
                    _update();
                },
                get rendererScripts() {
                    return data.preloads ? data.preloads.map(extHostTypeConverters.NotebookRendererScript.to) : [];
                },
                get executeHandler() {
                    return _executeHandler;
                },
                set executeHandler(value) {
                    _executeHandler = value ?? _defaultExecutHandler;
                },
                get interruptHandler() {
                    return _interruptHandler;
                },
                set interruptHandler(value) {
                    _interruptHandler = value;
                    data.supportsInterrupt = Boolean(value);
                    _update();
                },
                set variableProvider(value) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookVariableProvider');
                    _variableProvider = value;
                    data.hasVariableProvider = !!value;
                    value?.onDidChangeVariables(e => that._proxy.$variablesUpdated(e.uri));
                    _update();
                },
                get variableProvider() {
                    return _variableProvider;
                },
                createNotebookCellExecution(cell) {
                    if (isDisposed) {
                        throw new Error('notebook controller is DISPOSED');
                    }
                    if (!associatedNotebooks.has(cell.notebook.uri)) {
                        that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map(u => u.toString()));
                        throw new Error(`notebook controller is NOT associated to notebook: ${cell.notebook.uri.toString()}`);
                    }
                    return that._createNotebookCellExecution(cell, createKernelId(extension.identifier, this.id));
                },
                createNotebookExecution(notebook) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookExecution');
                    if (isDisposed) {
                        throw new Error('notebook controller is DISPOSED');
                    }
                    if (!associatedNotebooks.has(notebook.uri)) {
                        that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map(u => u.toString()));
                        throw new Error(`notebook controller is NOT associated to notebook: ${notebook.uri.toString()}`);
                    }
                    return that._createNotebookExecution(notebook, createKernelId(extension.identifier, this.id));
                },
                dispose: () => {
                    if (!isDisposed) {
                        this._logService.trace(`NotebookController[${handle}], DISPOSED`);
                        isDisposed = true;
                        this._kernelData.delete(handle);
                        onDidChangeSelection.dispose();
                        onDidReceiveMessage.dispose();
                        this._proxy.$removeKernel(handle);
                    }
                },
                // --- priority
                updateNotebookAffinity(notebook, priority) {
                    if (priority === extHostTypes_1.NotebookControllerAffinity2.Hidden) {
                        // This api only adds an extra enum value, the function is the same, so just gate on the new value being passed
                        // for proposedAPI check.
                        (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookControllerAffinityHidden');
                    }
                    that._proxy.$updateNotebookPriority(handle, notebook.uri, priority);
                },
                // --- ipc
                onDidReceiveMessage: onDidReceiveMessage.event,
                postMessage(message, editor) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookMessaging');
                    return that._proxy.$postMessage(handle, editor && that._extHostNotebook.getIdByEditor(editor), message);
                },
                asWebviewUri(uri) {
                    (0, extensions_2.checkProposedApiEnabled)(extension, 'notebookMessaging');
                    return (0, webview_1.asWebviewUri)(uri, that._initData.remote);
                },
            };
            this._kernelData.set(handle, {
                extensionId: extension.identifier,
                controller,
                onDidReceiveMessage,
                onDidChangeSelection,
                associatedNotebooks
            });
            return controller;
        }
        getIdByController(controller) {
            for (const [_, candidate] of this._kernelData) {
                if (candidate.controller === controller) {
                    return createKernelId(candidate.extensionId, controller.id);
                }
            }
            return null;
        }
        createNotebookControllerDetectionTask(extension, viewType) {
            const handle = this._kernelDetectionTaskHandlePool++;
            const that = this;
            this._logService.trace(`NotebookControllerDetectionTask[${handle}], CREATED by ${extension.identifier.value}`);
            this._proxy.$addKernelDetectionTask(handle, viewType);
            const detectionTask = {
                dispose: () => {
                    this._kernelDetectionTask.delete(handle);
                    that._proxy.$removeKernelDetectionTask(handle);
                }
            };
            this._kernelDetectionTask.set(handle, detectionTask);
            return detectionTask;
        }
        registerKernelSourceActionProvider(extension, viewType, provider) {
            const handle = this._kernelSourceActionProviderHandlePool++;
            const eventHandle = typeof provider.onDidChangeNotebookKernelSourceActions === 'function' ? handle : undefined;
            const that = this;
            this._kernelSourceActionProviders.set(handle, provider);
            this._logService.trace(`NotebookKernelSourceActionProvider[${handle}], CREATED by ${extension.identifier.value}`);
            this._proxy.$addKernelSourceActionProvider(handle, handle, viewType);
            let subscription;
            if (eventHandle !== undefined) {
                subscription = provider.onDidChangeNotebookKernelSourceActions(_ => this._proxy.$emitNotebookKernelSourceActionsChangeEvent(eventHandle));
            }
            return {
                dispose: () => {
                    this._kernelSourceActionProviders.delete(handle);
                    that._proxy.$removeKernelSourceActionProvider(handle, handle);
                    subscription?.dispose();
                }
            };
        }
        async $provideKernelSourceActions(handle, token) {
            const provider = this._kernelSourceActionProviders.get(handle);
            if (provider) {
                const disposables = new lifecycle_1.DisposableStore();
                const ret = await provider.provideNotebookKernelSourceActions(token);
                return (ret ?? []).map(item => extHostTypeConverters.NotebookKernelSourceAction.from(item, this._commands.converter, disposables));
            }
            return [];
        }
        $acceptNotebookAssociation(handle, uri, value) {
            const obj = this._kernelData.get(handle);
            if (obj) {
                // update data structure
                const notebook = this._extHostNotebook.getNotebookDocument(uri_1.URI.revive(uri));
                if (value) {
                    obj.associatedNotebooks.set(notebook.uri, true);
                }
                else {
                    obj.associatedNotebooks.delete(notebook.uri);
                }
                this._logService.trace(`NotebookController[${handle}] ASSOCIATE notebook`, notebook.uri.toString(), value);
                // send event
                obj.onDidChangeSelection.fire({
                    selected: value,
                    notebook: notebook.apiNotebook
                });
            }
        }
        async $executeCells(handle, uri, handles) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            const document = this._extHostNotebook.getNotebookDocument(uri_1.URI.revive(uri));
            const cells = [];
            for (const cellHandle of handles) {
                const cell = document.getCell(cellHandle);
                if (cell) {
                    cells.push(cell.apiCell);
                }
            }
            try {
                this._logService.trace(`NotebookController[${handle}] EXECUTE cells`, document.uri.toString(), cells.length);
                await obj.controller.executeHandler.call(obj.controller, cells, document.apiNotebook, obj.controller);
            }
            catch (err) {
                //
                this._logService.error(`NotebookController[${handle}] execute cells FAILED`, err);
                console.error(err);
            }
        }
        async $cancelCells(handle, uri, handles) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            // cancel or interrupt depends on the controller. When an interrupt handler is used we
            // don't trigger the cancelation token of executions.
            const document = this._extHostNotebook.getNotebookDocument(uri_1.URI.revive(uri));
            if (obj.controller.interruptHandler) {
                await obj.controller.interruptHandler.call(obj.controller, document.apiNotebook);
            }
            else {
                for (const cellHandle of handles) {
                    const cell = document.getCell(cellHandle);
                    if (cell) {
                        this._activeExecutions.get(cell.uri)?.cancel();
                    }
                }
            }
            if (obj.controller.interruptHandler) {
                // If we're interrupting all cells, we also need to cancel the notebook level execution.
                const items = this._activeNotebookExecutions.get(document.uri);
                if (handles.length && Array.isArray(items) && items.length) {
                    items.forEach(d => d.dispose());
                }
            }
        }
        async $provideVariables(handle, requestId, notebookUri, parentId, kind, start, token) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                return;
            }
            const document = this._extHostNotebook.getNotebookDocument(uri_1.URI.revive(notebookUri));
            const variableProvider = obj.controller.variableProvider;
            if (!variableProvider) {
                return;
            }
            let parent = undefined;
            if (parentId !== undefined) {
                parent = this.variableStore[parentId];
                if (!parent) {
                    // request for unknown parent
                    return;
                }
            }
            else {
                // root request, clear store
                this.variableStore = {};
            }
            const requestKind = kind === 'named' ? extHostTypes_1.NotebookVariablesRequestKind.Named : extHostTypes_1.NotebookVariablesRequestKind.Indexed;
            const variableResults = variableProvider.provideVariables(document.apiNotebook, parent, requestKind, start, token);
            let resultCount = 0;
            for await (const result of variableResults) {
                if (token.isCancellationRequested) {
                    return;
                }
                const variable = {
                    id: this.id++,
                    name: result.variable.name,
                    value: result.variable.value,
                    type: result.variable.type,
                    hasNamedChildren: result.hasNamedChildren,
                    indexedChildrenCount: result.indexedChildrenCount
                };
                this.variableStore[variable.id] = result.variable;
                this._proxy.$receiveVariable(requestId, variable);
                if (resultCount++ >= notebookKernelService_1.variablePageSize) {
                    return;
                }
            }
        }
        $acceptKernelMessageFromRenderer(handle, editorId, message) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            const editor = this._extHostNotebook.getEditorById(editorId);
            obj.onDidReceiveMessage.fire(Object.freeze({ editor: editor.apiEditor, message }));
        }
        $cellExecutionChanged(uri, cellHandle, state) {
            const document = this._extHostNotebook.getNotebookDocument(uri_1.URI.revive(uri));
            const cell = document.getCell(cellHandle);
            if (cell) {
                const newState = state ? extHostTypeConverters.NotebookCellExecutionState.to(state) : extHostTypes_1.NotebookCellExecutionState.Idle;
                if (newState !== undefined) {
                    this._onDidChangeCellExecutionState.fire({
                        cell: cell.apiCell,
                        state: newState
                    });
                }
            }
        }
        // ---
        _createNotebookCellExecution(cell, controllerId) {
            if (cell.index < 0) {
                throw new Error('CANNOT execute cell that has been REMOVED from notebook');
            }
            const notebook = this._extHostNotebook.getNotebookDocument(cell.notebook.uri);
            const cellObj = notebook.getCellFromApiCell(cell);
            if (!cellObj) {
                throw new Error('invalid cell');
            }
            if (this._activeExecutions.has(cellObj.uri)) {
                throw new Error(`duplicate execution for ${cellObj.uri}`);
            }
            const execution = new NotebookCellExecutionTask(controllerId, cellObj, this._proxy);
            this._activeExecutions.set(cellObj.uri, execution);
            const listener = execution.onDidChangeState(() => {
                if (execution.state === NotebookCellExecutionTaskState.Resolved) {
                    execution.dispose();
                    listener.dispose();
                    this._activeExecutions.delete(cellObj.uri);
                }
            });
            return execution.asApiObject();
        }
        // ---
        _createNotebookExecution(nb, controllerId) {
            const notebook = this._extHostNotebook.getNotebookDocument(nb.uri);
            const runningCell = nb.getCells().find(cell => {
                const apiCell = notebook.getCellFromApiCell(cell);
                return apiCell && this._activeExecutions.has(apiCell.uri);
            });
            if (runningCell) {
                throw new Error(`duplicate cell execution for ${runningCell.document.uri}`);
            }
            if (this._activeNotebookExecutions.has(notebook.uri)) {
                throw new Error(`duplicate notebook execution for ${notebook.uri}`);
            }
            const execution = new NotebookExecutionTask(controllerId, notebook, this._proxy);
            const listener = execution.onDidChangeState(() => {
                if (execution.state === NotebookExecutionTaskState.Resolved) {
                    execution.dispose();
                    listener.dispose();
                    this._activeNotebookExecutions.delete(notebook.uri);
                }
            });
            this._activeNotebookExecutions.set(notebook.uri, [execution, listener]);
            return execution.asApiObject();
        }
    };
    exports.ExtHostNotebookKernels = ExtHostNotebookKernels;
    exports.ExtHostNotebookKernels = ExtHostNotebookKernels = __decorate([
        __param(4, log_1.ILogService)
    ], ExtHostNotebookKernels);
    var NotebookCellExecutionTaskState;
    (function (NotebookCellExecutionTaskState) {
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Init"] = 0] = "Init";
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Started"] = 1] = "Started";
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Resolved"] = 2] = "Resolved";
    })(NotebookCellExecutionTaskState || (NotebookCellExecutionTaskState = {}));
    class NotebookCellExecutionTask extends lifecycle_1.Disposable {
        static { this.HANDLE = 0; }
        get state() { return this._state; }
        constructor(controllerId, _cell, _proxy) {
            super();
            this._cell = _cell;
            this._proxy = _proxy;
            this._handle = NotebookCellExecutionTask.HANDLE++;
            this._onDidChangeState = new event_1.Emitter();
            this.onDidChangeState = this._onDidChangeState.event;
            this._state = NotebookCellExecutionTaskState.Init;
            this._tokenSource = this._register(new cancellation_1.CancellationTokenSource());
            this._collector = new TimeoutBasedCollector(10, updates => this.update(updates));
            this._executionOrder = _cell.internalMetadata.executionOrder;
            this._proxy.$createExecution(this._handle, controllerId, this._cell.notebook.uri, this._cell.handle);
        }
        cancel() {
            this._tokenSource.cancel();
        }
        async updateSoon(update) {
            await this._collector.addItem(update);
        }
        async update(update) {
            const updates = Array.isArray(update) ? update : [update];
            return this._proxy.$updateExecution(this._handle, new proxyIdentifier_1.SerializableObjectWithBuffers(updates));
        }
        verifyStateForOutput() {
            if (this._state === NotebookCellExecutionTaskState.Init) {
                throw new Error('Must call start before modifying cell output');
            }
            if (this._state === NotebookCellExecutionTaskState.Resolved) {
                throw new Error('Cannot modify cell output after calling resolve');
            }
        }
        cellIndexToHandle(cellOrCellIndex) {
            let cell = this._cell;
            if (cellOrCellIndex) {
                cell = this._cell.notebook.getCellFromApiCell(cellOrCellIndex);
            }
            if (!cell) {
                throw new Error('INVALID cell');
            }
            return cell.handle;
        }
        validateAndConvertOutputs(items) {
            return items.map(output => {
                const newOutput = extHostTypes_1.NotebookCellOutput.ensureUniqueMimeTypes(output.items, true);
                if (newOutput === output.items) {
                    return extHostTypeConverters.NotebookCellOutput.from(output);
                }
                return extHostTypeConverters.NotebookCellOutput.from({
                    items: newOutput,
                    id: output.id,
                    metadata: output.metadata
                });
            });
        }
        async updateOutputs(outputs, cell, append) {
            const handle = this.cellIndexToHandle(cell);
            const outputDtos = this.validateAndConvertOutputs((0, arrays_1.asArray)(outputs));
            return this.updateSoon({
                editType: notebookExecutionService_1.CellExecutionUpdateType.Output,
                cellHandle: handle,
                append,
                outputs: outputDtos
            });
        }
        async updateOutputItems(items, output, append) {
            items = extHostTypes_1.NotebookCellOutput.ensureUniqueMimeTypes((0, arrays_1.asArray)(items), true);
            return this.updateSoon({
                editType: notebookExecutionService_1.CellExecutionUpdateType.OutputItems,
                items: items.map(extHostTypeConverters.NotebookCellOutputItem.from),
                outputId: output.id,
                append
            });
        }
        asApiObject() {
            const that = this;
            const result = {
                get token() { return that._tokenSource.token; },
                get cell() { return that._cell.apiCell; },
                get executionOrder() { return that._executionOrder; },
                set executionOrder(v) {
                    that._executionOrder = v;
                    that.update([{
                            editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState,
                            executionOrder: that._executionOrder
                        }]);
                },
                start(startTime) {
                    if (that._state === NotebookCellExecutionTaskState.Resolved || that._state === NotebookCellExecutionTaskState.Started) {
                        throw new Error('Cannot call start again');
                    }
                    that._state = NotebookCellExecutionTaskState.Started;
                    that._onDidChangeState.fire();
                    that.update({
                        editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState,
                        runStartTime: startTime
                    });
                },
                end(success, endTime) {
                    if (that._state === NotebookCellExecutionTaskState.Resolved) {
                        throw new Error('Cannot call resolve twice');
                    }
                    that._state = NotebookCellExecutionTaskState.Resolved;
                    that._onDidChangeState.fire();
                    // The last update needs to be ordered correctly and applied immediately,
                    // so we use updateSoon and immediately flush.
                    that._collector.flush();
                    that._proxy.$completeExecution(that._handle, new proxyIdentifier_1.SerializableObjectWithBuffers({
                        runEndTime: endTime,
                        lastRunSuccess: success
                    }));
                },
                clearOutput(cell) {
                    that.verifyStateForOutput();
                    return that.updateOutputs([], cell, false);
                },
                appendOutput(outputs, cell) {
                    that.verifyStateForOutput();
                    return that.updateOutputs(outputs, cell, true);
                },
                replaceOutput(outputs, cell) {
                    that.verifyStateForOutput();
                    return that.updateOutputs(outputs, cell, false);
                },
                appendOutputItems(items, output) {
                    that.verifyStateForOutput();
                    return that.updateOutputItems(items, output, true);
                },
                replaceOutputItems(items, output) {
                    that.verifyStateForOutput();
                    return that.updateOutputItems(items, output, false);
                }
            };
            return Object.freeze(result);
        }
    }
    var NotebookExecutionTaskState;
    (function (NotebookExecutionTaskState) {
        NotebookExecutionTaskState[NotebookExecutionTaskState["Init"] = 0] = "Init";
        NotebookExecutionTaskState[NotebookExecutionTaskState["Started"] = 1] = "Started";
        NotebookExecutionTaskState[NotebookExecutionTaskState["Resolved"] = 2] = "Resolved";
    })(NotebookExecutionTaskState || (NotebookExecutionTaskState = {}));
    class NotebookExecutionTask extends lifecycle_1.Disposable {
        static { this.HANDLE = 0; }
        get state() { return this._state; }
        constructor(controllerId, _notebook, _proxy) {
            super();
            this._notebook = _notebook;
            this._proxy = _proxy;
            this._handle = NotebookExecutionTask.HANDLE++;
            this._onDidChangeState = new event_1.Emitter();
            this.onDidChangeState = this._onDidChangeState.event;
            this._state = NotebookExecutionTaskState.Init;
            this._tokenSource = this._register(new cancellation_1.CancellationTokenSource());
            this._proxy.$createNotebookExecution(this._handle, controllerId, this._notebook.uri);
        }
        cancel() {
            this._tokenSource.cancel();
        }
        asApiObject() {
            const result = {
                start: () => {
                    if (this._state === NotebookExecutionTaskState.Resolved || this._state === NotebookExecutionTaskState.Started) {
                        throw new Error('Cannot call start again');
                    }
                    this._state = NotebookExecutionTaskState.Started;
                    this._onDidChangeState.fire();
                    this._proxy.$beginNotebookExecution(this._handle);
                },
                end: () => {
                    if (this._state === NotebookExecutionTaskState.Resolved) {
                        throw new Error('Cannot call resolve twice');
                    }
                    this._state = NotebookExecutionTaskState.Resolved;
                    this._onDidChangeState.fire();
                    this._proxy.$completeNotebookExecution(this._handle);
                },
            };
            return Object.freeze(result);
        }
    }
    class TimeoutBasedCollector {
        constructor(delay, callback) {
            this.delay = delay;
            this.callback = callback;
            this.batch = [];
            this.startedTimer = Date.now();
        }
        addItem(item) {
            this.batch.push(item);
            if (!this.currentDeferred) {
                this.currentDeferred = new async_1.DeferredPromise();
                this.startedTimer = Date.now();
                (0, async_1.timeout)(this.delay).then(() => {
                    return this.flush();
                });
            }
            // This can be called by the extension repeatedly for a long time before the timeout is able to run.
            // Force a flush after the delay.
            if (Date.now() - this.startedTimer > this.delay) {
                return this.flush();
            }
            return this.currentDeferred.p;
        }
        flush() {
            if (this.batch.length === 0 || !this.currentDeferred) {
                return Promise.resolve();
            }
            const deferred = this.currentDeferred;
            this.currentDeferred = undefined;
            const batch = this.batch;
            this.batch = [];
            return this.callback(batch)
                .finally(() => deferred.complete());
        }
    }
    function createKernelId(extensionIdentifier, id) {
        return `${extensionIdentifier.value}/${id}`;
    }
    exports.createKernelId = createKernelId;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rS2VybmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdE5vdGVib29rS2VybmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1Q3pGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXNCO1FBa0JsQyxZQUNDLFdBQXlCLEVBQ1IsU0FBa0MsRUFDbEMsZ0JBQTJDLEVBQ3BELFNBQTBCLEVBQ3JCLFdBQXlDO1lBSHJDLGNBQVMsR0FBVCxTQUFTLENBQXlCO1lBQ2xDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBMkI7WUFDcEQsY0FBUyxHQUFULFNBQVMsQ0FBaUI7WUFDSixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQXBCdEMsc0JBQWlCLEdBQUcsSUFBSSxpQkFBVyxFQUE2QixDQUFDO1lBQ2pFLDhCQUF5QixHQUFHLElBQUksaUJBQVcsRUFBd0MsQ0FBQztZQUU3Rix5QkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBa0QsQ0FBQztZQUNqRixtQ0FBOEIsR0FBVyxDQUFDLENBQUM7WUFFM0MsaUNBQTRCLEdBQUcsSUFBSSxHQUFHLEVBQXFELENBQUM7WUFDNUYsMENBQXFDLEdBQVcsQ0FBQyxDQUFDO1lBRXpDLGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7WUFDdEQsZ0JBQVcsR0FBVyxDQUFDLENBQUM7WUFFZixtQ0FBOEIsR0FBRyxJQUFJLGVBQU8sRUFBZ0QsQ0FBQztZQUNyRywwQ0FBcUMsR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDO1lBd1duRixPQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1Asa0JBQWEsR0FBb0MsRUFBRSxDQUFDO1lBaFczRCxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENB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
//# sourceURL=../../../vs/workbench/api/common/extHostNotebookKernels.js
})
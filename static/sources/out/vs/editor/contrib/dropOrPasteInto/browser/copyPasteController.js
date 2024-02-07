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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/dataTransfer", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/platform", "vs/base/common/uuid", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/dnd", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/dropOrPasteInto/browser/edit", "vs/editor/contrib/editorState/browser/editorState", "vs/editor/contrib/inlineProgress/browser/inlineProgress", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "./postEditWidget", "vs/editor/contrib/message/browser/messageController"], function (require, exports, dom_1, arrays_1, async_1, dataTransfer_1, lifecycle_1, mime_1, platform, uuid_1, textAreaInput_1, dnd_1, bulkEditService_1, range_1, languageFeatures_1, edit_1, editorState_1, inlineProgress_1, nls_1, clipboardService_1, contextkey_1, instantiation_1, progress_1, quickInput_1, postEditWidget_1, messageController_1) {
    "use strict";
    var CopyPasteController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CopyPasteController = exports.pasteWidgetVisibleCtx = exports.changePasteTypeCommandId = void 0;
    exports.changePasteTypeCommandId = 'editor.changePasteType';
    exports.pasteWidgetVisibleCtx = new contextkey_1.RawContextKey('pasteWidgetVisible', false, (0, nls_1.localize)('pasteWidgetVisible', "Whether the paste widget is showing"));
    const vscodeClipboardMime = 'application/vnd.code.copyMetadata';
    let CopyPasteController = class CopyPasteController extends lifecycle_1.Disposable {
        static { CopyPasteController_1 = this; }
        static { this.ID = 'editor.contrib.copyPasteActionController'; }
        static get(editor) {
            return editor.getContribution(CopyPasteController_1.ID);
        }
        constructor(editor, instantiationService, _bulkEditService, _clipboardService, _languageFeaturesService, _quickInputService, _progressService) {
            super();
            this._bulkEditService = _bulkEditService;
            this._clipboardService = _clipboardService;
            this._languageFeaturesService = _languageFeaturesService;
            this._quickInputService = _quickInputService;
            this._progressService = _progressService;
            this._editor = editor;
            const container = editor.getContainerDomNode();
            this._register((0, dom_1.addDisposableListener)(container, 'copy', e => this.handleCopy(e)));
            this._register((0, dom_1.addDisposableListener)(container, 'cut', e => this.handleCopy(e)));
            this._register((0, dom_1.addDisposableListener)(container, 'paste', e => this.handlePaste(e), true));
            this._pasteProgressManager = this._register(new inlineProgress_1.InlineProgressManager('pasteIntoEditor', editor, instantiationService));
            this._postPasteWidgetManager = this._register(instantiationService.createInstance(postEditWidget_1.PostEditWidgetManager, 'pasteIntoEditor', editor, exports.pasteWidgetVisibleCtx, { id: exports.changePasteTypeCommandId, label: (0, nls_1.localize)('postPasteWidgetTitle', "Show paste options...") }));
        }
        changePasteType() {
            this._postPasteWidgetManager.tryShowSelector();
        }
        pasteAs(preferredId) {
            this._editor.focus();
            try {
                this._pasteAsActionContext = { preferredId };
                (0, dom_1.getActiveDocument)().execCommand('paste');
            }
            finally {
                this._pasteAsActionContext = undefined;
            }
        }
        clearWidgets() {
            this._postPasteWidgetManager.clear();
        }
        isPasteAsEnabled() {
            return this._editor.getOption(84 /* EditorOption.pasteAs */).enabled
                && !this._editor.getOption(90 /* EditorOption.readOnly */);
        }
        async finishedPaste() {
            await this._currentPasteOperation;
        }
        handleCopy(e) {
            if (!this._editor.hasTextFocus()) {
                return;
            }
            if (platform.isWeb) {
                // Explicitly clear the web resources clipboard.
                // This is needed because on web, the browser clipboard is faked out using an in-memory store.
                // This means the resources clipboard is not properly updated when copying from the editor.
                this._clipboardService.writeResources([]);
            }
            if (!e.clipboardData || !this.isPasteAsEnabled()) {
                return;
            }
            const model = this._editor.getModel();
            const selections = this._editor.getSelections();
            if (!model || !selections?.length) {
                return;
            }
            const enableEmptySelectionClipboard = this._editor.getOption(37 /* EditorOption.emptySelectionClipboard */);
            let ranges = selections;
            const wasFromEmptySelection = selections.length === 1 && selections[0].isEmpty();
            if (wasFromEmptySelection) {
                if (!enableEmptySelectionClipboard) {
                    return;
                }
                ranges = [new range_1.Range(ranges[0].startLineNumber, 1, ranges[0].startLineNumber, 1 + model.getLineLength(ranges[0].startLineNumber))];
            }
            const toCopy = this._editor._getViewModel()?.getPlainTextToCopy(selections, enableEmptySelectionClipboard, platform.isWindows);
            const multicursorText = Array.isArray(toCopy) ? toCopy : null;
            const defaultPastePayload = {
                multicursorText,
                pasteOnNewLine: wasFromEmptySelection,
                mode: null
            };
            const providers = this._languageFeaturesService.documentPasteEditProvider
                .ordered(model)
                .filter(x => !!x.prepareDocumentPaste);
            if (!providers.length) {
                this.setCopyMetadata(e.clipboardData, { defaultPastePayload });
                return;
            }
            const dataTransfer = (0, dnd_1.toVSDataTransfer)(e.clipboardData);
            const providerCopyMimeTypes = providers.flatMap(x => x.copyMimeTypes ?? []);
            // Save off a handle pointing to data that VS Code maintains.
            const handle = (0, uuid_1.generateUuid)();
            this.setCopyMetadata(e.clipboardData, {
                id: handle,
                providerCopyMimeTypes,
                defaultPastePayload
            });
            const promise = (0, async_1.createCancelablePromise)(async (token) => {
                const results = (0, arrays_1.coalesce)(await Promise.all(providers.map(async (provider) => {
                    try {
                        return await provider.prepareDocumentPaste(model, ranges, dataTransfer, token);
                    }
                    catch (err) {
                        console.error(err);
                        return undefined;
                    }
                })));
                // Values from higher priority providers should overwrite values from lower priority ones.
                // Reverse the array to so that the calls to `replace` below will do this
                results.reverse();
                for (const result of results) {
                    for (const [mime, value] of result) {
                        dataTransfer.replace(mime, value);
                    }
                }
                return dataTransfer;
            });
            this._currentCopyOperation?.dataTransferPromise.cancel();
            this._currentCopyOperation = { handle: handle, dataTransferPromise: promise };
        }
        async handlePaste(e) {
            if (!e.clipboardData || !this._editor.hasTextFocus()) {
                return;
            }
            messageController_1.MessageController.get(this._editor)?.closeMessage();
            this._currentPasteOperation?.cancel();
            this._currentPasteOperation = undefined;
            const model = this._editor.getModel();
            const selections = this._editor.getSelections();
            if (!selections?.length || !model) {
                return;
            }
            if (!this.isPasteAsEnabled()
                && !this._pasteAsActionContext // Still enable if paste as was explicitly requested
            ) {
                return;
            }
            const metadata = this.fetchCopyMetadata(e);
            const dataTransfer = (0, dnd_1.toExternalVSDataTransfer)(e.clipboardData);
            dataTransfer.delete(vscodeClipboardMime);
            const allPotentialMimeTypes = [
                ...e.clipboardData.types,
                ...metadata?.providerCopyMimeTypes ?? [],
                // TODO: always adds `uri-list` because this get set if there are resources in the system clipboard.
                // However we can only check the system clipboard async. For this early check, just add it in.
                // We filter providers again once we have the final dataTransfer we will use.
                mime_1.Mimes.uriList,
            ];
            const allProviders = this._languageFeaturesService.documentPasteEditProvider
                .ordered(model)
                .filter(provider => {
                if (this._pasteAsActionContext?.preferredId) {
                    if (this._pasteAsActionContext.preferredId !== provider.id) {
                        return false;
                    }
                }
                return provider.pasteMimeTypes?.some(type => (0, dataTransfer_1.matchesMimeType)(type, allPotentialMimeTypes));
            });
            if (!allProviders.length) {
                if (this._pasteAsActionContext?.preferredId) {
                    this.showPasteAsNoEditMessage(selections, this._pasteAsActionContext?.preferredId);
                }
                return;
            }
            // Prevent the editor's default paste handler from running.
            // Note that after this point, we are fully responsible for handling paste.
            // If we can't provider a paste for any reason, we need to explicitly delegate pasting back to the editor.
            e.preventDefault();
            e.stopImmediatePropagation();
            if (this._pasteAsActionContext) {
                this.showPasteAsPick(this._pasteAsActionContext.preferredId, allProviders, selections, dataTransfer, metadata, { trigger: 'explicit', only: this._pasteAsActionContext.preferredId });
            }
            else {
                this.doPasteInline(allProviders, selections, dataTransfer, metadata, { trigger: 'implicit' });
            }
        }
        showPasteAsNoEditMessage(selections, editId) {
            messageController_1.MessageController.get(this._editor)?.showMessage((0, nls_1.localize)('pasteAsError', "No paste edits for '{0}' found", editId), selections[0].getStartPosition());
        }
        doPasteInline(allProviders, selections, dataTransfer, metadata, context) {
            const p = (0, async_1.createCancelablePromise)(async (token) => {
                const editor = this._editor;
                if (!editor.hasModel()) {
                    return;
                }
                const model = editor.getModel();
                const tokenSource = new editorState_1.EditorStateCancellationTokenSource(editor, 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */, undefined, token);
                try {
                    await this.mergeInDataFromCopy(dataTransfer, metadata, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    // Filter out any providers the don't match the full data transfer we will send them.
                    const supportedProviders = allProviders.filter(provider => isSupportedPasteProvider(provider, dataTransfer));
                    if (!supportedProviders.length
                        || (supportedProviders.length === 1 && supportedProviders[0].id === 'text') // Only our default text provider is active
                    ) {
                        await this.applyDefaultPasteHandler(dataTransfer, metadata, tokenSource.token);
                        return;
                    }
                    const providerEdits = await this.getPasteEdits(supportedProviders, dataTransfer, model, selections, context, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    // If the only edit returned is a text edit, use the default paste handler
                    if (providerEdits.length === 1 && providerEdits[0].providerId === 'text') {
                        await this.applyDefaultPasteHandler(dataTransfer, metadata, tokenSource.token);
                        return;
                    }
                    if (providerEdits.length) {
                        const canShowWidget = editor.getOption(84 /* EditorOption.pasteAs */).showPasteSelector === 'afterPaste';
                        return this._postPasteWidgetManager.applyEditAndShowIfNeeded(selections, { activeEditIndex: 0, allEdits: providerEdits }, canShowWidget, tokenSource.token);
                    }
                    await this.applyDefaultPasteHandler(dataTransfer, metadata, tokenSource.token);
                }
                finally {
                    tokenSource.dispose();
                    if (this._currentPasteOperation === p) {
                        this._currentPasteOperation = undefined;
                    }
                }
            });
            this._pasteProgressManager.showWhile(selections[0].getEndPosition(), (0, nls_1.localize)('pasteIntoEditorProgress', "Running paste handlers. Click to cancel"), p);
            this._currentPasteOperation = p;
        }
        showPasteAsPick(preferredId, allProviders, selections, dataTransfer, metadata, context) {
            const p = (0, async_1.createCancelablePromise)(async (token) => {
                const editor = this._editor;
                if (!editor.hasModel()) {
                    return;
                }
                const model = editor.getModel();
                const tokenSource = new editorState_1.EditorStateCancellationTokenSource(editor, 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */, undefined, token);
                try {
                    await this.mergeInDataFromCopy(dataTransfer, metadata, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    // Filter out any providers the don't match the full data transfer we will send them.
                    let supportedProviders = allProviders.filter(provider => isSupportedPasteProvider(provider, dataTransfer));
                    if (preferredId) {
                        // We are looking for a specific edit
                        supportedProviders = supportedProviders.filter(edit => edit.id === preferredId);
                    }
                    const providerEdits = await this.getPasteEdits(supportedProviders, dataTransfer, model, selections, context, tokenSource.token);
                    if (tokenSource.token.isCancellationRequested) {
                        return;
                    }
                    if (!providerEdits.length) {
                        if (context.only) {
                            this.showPasteAsNoEditMessage(selections, context.only);
                        }
                        return;
                    }
                    let pickedEdit;
                    if (preferredId) {
                        pickedEdit = providerEdits.at(0);
                    }
                    else {
                        const selected = await this._quickInputService.pick(providerEdits.map((edit) => ({
                            label: edit.label,
                            description: edit.providerId,
                            detail: edit.detail,
                            edit,
                        })), {
                            placeHolder: (0, nls_1.localize)('pasteAsPickerPlaceholder', "Select Paste Action"),
                        });
                        pickedEdit = selected?.edit;
                    }
                    if (!pickedEdit) {
                        return;
                    }
                    const combinedWorkspaceEdit = (0, edit_1.createCombinedWorkspaceEdit)(model.uri, selections, pickedEdit);
                    await this._bulkEditService.apply(combinedWorkspaceEdit, { editor: this._editor });
                }
                finally {
                    tokenSource.dispose();
                    if (this._currentPasteOperation === p) {
                        this._currentPasteOperation = undefined;
                    }
                }
            });
            this._progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                title: (0, nls_1.localize)('pasteAsProgress', "Running paste handlers"),
            }, () => p);
        }
        setCopyMetadata(dataTransfer, metadata) {
            dataTransfer.setData(vscodeClipboardMime, JSON.stringify(metadata));
        }
        fetchCopyMetadata(e) {
            if (!e.clipboardData) {
                return;
            }
            // Prefer using the clipboard data we saved off
            const rawMetadata = e.clipboardData.getData(vscodeClipboardMime);
            if (rawMetadata) {
                try {
                    return JSON.parse(rawMetadata);
                }
                catch {
                    return undefined;
                }
            }
            // Otherwise try to extract the generic text editor metadata
            const [_, metadata] = textAreaInput_1.ClipboardEventUtils.getTextData(e.clipboardData);
            if (metadata) {
                return {
                    defaultPastePayload: {
                        mode: metadata.mode,
                        multicursorText: metadata.multicursorText ?? null,
                        pasteOnNewLine: !!metadata.isFromEmptySelection,
                    },
                };
            }
            return undefined;
        }
        async mergeInDataFromCopy(dataTransfer, metadata, token) {
            if (metadata?.id && this._currentCopyOperation?.handle === metadata.id) {
                const toMergeDataTransfer = await this._currentCopyOperation.dataTransferPromise;
                if (token.isCancellationRequested) {
                    return;
                }
                for (const [key, value] of toMergeDataTransfer) {
                    dataTransfer.replace(key, value);
                }
            }
            if (!dataTransfer.has(mime_1.Mimes.uriList)) {
                const resources = await this._clipboardService.readResources();
                if (token.isCancellationRequested) {
                    return;
                }
                if (resources.length) {
                    dataTransfer.append(mime_1.Mimes.uriList, (0, dataTransfer_1.createStringDataTransferItem)(dataTransfer_1.UriList.create(resources)));
                }
            }
        }
        async getPasteEdits(providers, dataTransfer, model, selections, context, token) {
            const results = await (0, async_1.raceCancellation)(Promise.all(providers.map(async (provider) => {
                try {
                    const edit = await provider.provideDocumentPasteEdits?.(model, selections, dataTransfer, context, token);
                    if (edit) {
                        return { ...edit, providerId: provider.id };
                    }
                }
                catch (err) {
                    console.error(err);
                }
                return undefined;
            })), token);
            const edits = (0, arrays_1.coalesce)(results ?? []);
            return (0, edit_1.sortEditsByYieldTo)(edits);
        }
        async applyDefaultPasteHandler(dataTransfer, metadata, token) {
            const textDataTransfer = dataTransfer.get(mime_1.Mimes.text) ?? dataTransfer.get('text');
            if (!textDataTransfer) {
                return;
            }
            const text = await textDataTransfer.asString();
            if (token.isCancellationRequested) {
                return;
            }
            const payload = {
                text,
                pasteOnNewLine: metadata?.defaultPastePayload.pasteOnNewLine ?? false,
                multicursorText: metadata?.defaultPastePayload.multicursorText ?? null,
                mode: null,
            };
            this._editor.trigger('keyboard', "paste" /* Handler.Paste */, payload);
        }
    };
    exports.CopyPasteController = CopyPasteController;
    exports.CopyPasteController = CopyPasteController = CopyPasteController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, bulkEditService_1.IBulkEditService),
        __param(3, clipboardService_1.IClipboardService),
        __param(4, languageFeatures_1.ILanguageFeaturesService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, progress_1.IProgressService)
    ], CopyPasteController);
    function isSupportedPasteProvider(provider, dataTransfer) {
        return Boolean(provider.pasteMimeTypes?.some(type => dataTransfer.matches(type)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weVBhc3RlQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZHJvcE9yUGFzdGVJbnRvL2Jyb3dzZXIvY29weVBhc3RlQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0NuRixRQUFBLHdCQUF3QixHQUFHLHdCQUF3QixDQUFDO0lBRXBELFFBQUEscUJBQXFCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG9CQUFvQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDLENBQUM7SUFFcEssTUFBTSxtQkFBbUIsR0FBRyxtQ0FBbUMsQ0FBQztJQVN6RCxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVOztpQkFFM0IsT0FBRSxHQUFHLDBDQUEwQyxBQUE3QyxDQUE4QztRQUVoRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQ3BDLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBc0IscUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQWVELFlBQ0MsTUFBbUIsRUFDSSxvQkFBMkMsRUFDL0IsZ0JBQWtDLEVBQ2pDLGlCQUFvQyxFQUM3Qix3QkFBa0QsRUFDeEQsa0JBQXNDLEVBQ3hDLGdCQUFrQztZQUVyRSxLQUFLLEVBQUUsQ0FBQztZQU4yQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ2pDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDN0IsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQUN4RCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3hDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFJckUsSUFBSSxDQUFDLE9BQU8sR0FBRyxN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
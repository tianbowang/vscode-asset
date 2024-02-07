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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/base/common/themables", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/notebook/browser/controller/cellOutputActions", "vs/workbench/contrib/notebook/browser/controller/editActions", "vs/workbench/contrib/notebook/browser/contrib/clipboard/cellOutputClipboard"], function (require, exports, DOM, markdownRenderer_1, actions_1, lifecycle_1, nls, menuEntryActionViewItem_1, toolbar_1, actions_2, contextkey_1, instantiation_1, opener_1, quickInput_1, themables_1, extensions_1, notebookBrowser_1, notebookIcons_1, cellPart_1, notebookCommon_1, notebookExecutionStateService_1, notebookService_1, panecomposite_1, cellOutputActions_1, editActions_1, cellOutputClipboard_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellOutputContainer = void 0;
    // DOM structure
    //
    //  #output
    //  |
    //  |  #output-inner-container
    //  |                        |  #cell-output-toolbar
    //  |                        |  #output-element
    //  |                        |  #output-element
    //  |                        |  #output-element
    //  |  #output-inner-container
    //  |                        |  #cell-output-toolbar
    //  |                        |  #output-element
    //  |  #output-inner-container
    //  |                        |  #cell-output-toolbar
    //  |                        |  #output-element
    let CellOutputElement = class CellOutputElement extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell, cellOutputContainer, outputContainer, output, notebookService, quickInputService, parentContextKeyService, menuService, paneCompositeService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.cellOutputContainer = cellOutputContainer;
            this.outputContainer = outputContainer;
            this.output = output;
            this.notebookService = notebookService;
            this.quickInputService = quickInputService;
            this.menuService = menuService;
            this.paneCompositeService = paneCompositeService;
            this.instantiationService = instantiationService;
            this._renderDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._outputHeightTimer = null;
            this.contextKeyService = parentContextKeyService;
            this._register(this.output.model.onDidChangeData(() => {
                this.rerender();
            }));
            this._register(this.output.onDidResetRenderer(() => {
                this.rerender();
            }));
        }
        detach() {
            this.renderedOutputContainer?.parentElement?.removeChild(this.renderedOutputContainer);
            let count = 0;
            if (this.innerContainer) {
                for (let i = 0; i < this.innerContainer.childNodes.length; i++) {
                    if (this.innerContainer.childNodes[i].className === 'rendered-output') {
                        count++;
                    }
                    if (count > 1) {
                        break;
                    }
                }
                if (count === 0) {
                    this.innerContainer.parentElement?.removeChild(this.innerContainer);
                }
            }
            this.notebookEditor.removeInset(this.output);
        }
        updateDOMTop(top) {
            if (this.innerContainer) {
                this.innerContainer.style.top = `${top}px`;
            }
        }
        rerender() {
            if (this.notebookEditor.hasModel() &&
                this.innerContainer &&
                this.renderResult &&
                this.renderResult.type === 1 /* RenderOutputType.Extension */) {
                // Output rendered by extension renderer got an update
                const [mimeTypes, pick] = this.output.resolveMimeTypes(this.notebookEditor.textModel, this.notebookEditor.activeKernel?.preloadProvides);
                const pickedMimeType = mimeTypes[pick];
                if (pickedMimeType.mimeType === this.renderResult.mimeType && pickedMimeType.rendererId === this.renderResult.renderer.id) {
                    // Same mimetype, same renderer, call the extension renderer to update
                    const index = this.viewCell.outputsViewModels.indexOf(this.output);
                    this.notebookEditor.updateOutput(this.viewCell, this.renderResult, this.viewCell.getOutputOffset(index));
                    return;
                }
            }
            if (!this.innerContainer) {
                // init rendering didn't happen
                const currOutputIndex = this.cellOutputContainer.renderedOutputEntries.findIndex(entry => entry.element === this);
                const previousSibling = currOutputIndex > 0 && !!(this.cellOutputContainer.renderedOutputEntries[currOutputIndex - 1].element.innerContainer?.parentElement)
                    ? this.cellOutputContainer.renderedOutputEntries[currOutputIndex - 1].element.innerContainer
                    : undefined;
                this.render(previousSibling);
            }
            else {
                // Another mimetype or renderer is picked, we need to clear the current output and re-render
                const nextElement = this.innerContainer.nextElementSibling;
                this._renderDisposableStore.clear();
                const element = this.innerContainer;
                if (element) {
                    element.parentElement?.removeChild(element);
                    this.notebookEditor.removeInset(this.output);
                }
                this.render(nextElement);
            }
            this._relayoutCell();
        }
        // insert after previousSibling
        _generateInnerOutputContainer(previousSibling, pickedMimeTypeRenderer) {
            this.innerContainer = DOM.$('.output-inner-container');
            if (previousSibling && previousSibling.nextElementSibling) {
                this.outputContainer.domNode.insertBefore(this.innerContainer, previousSibling.nextElementSibling);
            }
            else {
                this.outputContainer.domNode.appendChild(this.innerContainer);
            }
            this.innerContainer.setAttribute('output-mime-type', pickedMimeTypeRenderer.mimeType);
            return this.innerContainer;
        }
        render(previousSibling) {
            const index = this.viewCell.outputsViewModels.indexOf(this.output);
            if (this.viewCell.isOutputCollapsed || !this.notebookEditor.hasModel()) {
                return undefined;
            }
            const notebookUri = notebookCommon_1.CellUri.parse(this.viewCell.uri)?.notebook;
            if (!notebookUri) {
                return undefined;
            }
            const notebookTextModel = this.notebookEditor.textModel;
            const [mimeTypes, pick] = this.output.resolveMimeTypes(notebookTextModel, this.notebookEditor.activeKernel?.preloadProvides);
            if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                this.viewCell.updateOutputHeight(index, 0, 'CellOutputElement#noMimeType');
                return undefined;
            }
            const pickedMimeTypeRenderer = mimeTypes[pick];
            const innerContainer = this._generateInnerOutputContainer(previousSibling, pickedMimeTypeRenderer);
            this._attachToolbar(innerContainer, notebookTextModel, this.notebookEditor.activeKernel, index, mimeTypes);
            this.renderedOutputContainer = DOM.append(innerContainer, DOM.$('.rendered-output'));
            const renderer = this.notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
            this.renderResult = renderer
                ? { type: 1 /* RenderOutputType.Extension */, renderer, source: this.output, mimeType: pickedMimeTypeRenderer.mimeType }
                : this._renderMissingRenderer(this.output, pickedMimeTypeRenderer.mimeType);
            this.output.pickedMimeType = pickedMimeTypeRenderer;
            if (!this.renderResult) {
                this.viewCell.updateOutputHeight(index, 0, 'CellOutputElement#renderResultUndefined');
                return undefined;
            }
            this.notebookEditor.createOutput(this.viewCell, this.renderResult, this.viewCell.getOutputOffset(index), false);
            innerContainer.classList.add('background');
            return { initRenderIsSynchronous: false };
        }
        _renderMissingRenderer(viewModel, preferredMimeType) {
            if (!viewModel.model.outputs.length) {
                return this._renderMessage(viewModel, nls.localize('empty', "Cell has no output"));
            }
            if (!preferredMimeType) {
                const mimeTypes = viewModel.model.outputs.map(op => op.mime);
                const mimeTypesMessage = mimeTypes.join(', ');
                return this._renderMessage(viewModel, nls.localize('noRenderer.2', "No renderer could be found for output. It has the following mimetypes: {0}", mimeTypesMessage));
            }
            return this._renderSearchForMimetype(viewModel, preferredMimeType);
        }
        _renderSearchForMimetype(viewModel, mimeType) {
            const query = `@tag:notebookRenderer ${mimeType}`;
            const p = DOM.$('p', undefined, `No renderer could be found for mimetype "${mimeType}", but one might be available on the Marketplace.`);
            const a = DOM.$('a', { href: `command:workbench.extensions.search?%22${query}%22`, class: 'monaco-button monaco-text-button', tabindex: 0, role: 'button', style: 'padding: 8px; text-decoration: none; color: rgb(255, 255, 255); background-color: rgb(14, 99, 156); max-width: 200px;' }, `Search Marketplace`);
            return {
                type: 0 /* RenderOutputType.Html */,
                source: viewModel,
                htmlContent: p.outerHTML + a.outerHTML
            };
        }
        _renderMessage(viewModel, message) {
            const el = DOM.$('p', undefined, message);
            return { type: 0 /* RenderOutputType.Html */, source: viewModel, htmlContent: el.outerHTML };
        }
        shouldEnableCopy(mimeTypes) {
            if (!mimeTypes.find(mimeType => cellOutputClipboard_1.TEXT_BASED_MIMETYPES.indexOf(mimeType.mimeType) || mimeType.mimeType.startsWith('image/'))) {
                return false;
            }
            if ((0, notebookCommon_1.isTextStreamMime)(mimeTypes[0].mimeType)) {
                const cellViewModel = this.output.cellViewModel;
                const index = cellViewModel.outputsViewModels.indexOf(this.output);
                if (index > 0) {
                    const previousOutput = cellViewModel.model.outputs[index - 1];
                    // if the previous output was also a stream, the copy command will be in that output instead
                    return !(0, notebookCommon_1.isTextStreamMime)(previousOutput.outputs[0].mime);
                }
            }
            return true;
        }
        async _attachToolbar(outputItemDiv, notebookTextModel, kernel, index, mimeTypes) {
            const hasMultipleMimeTypes = mimeTypes.filter(mimeType => mimeType.isTrusted).length > 1;
            const isCopyEnabled = this.shouldEnableCopy(mimeTypes);
            if (index > 0 && !hasMultipleMimeTypes && !isCopyEnabled) {
                // nothing to put in the toolbar
                return;
            }
            if (!this.notebookEditor.hasModel()) {
                return;
            }
            const useConsolidatedButton = this.notebookEditor.notebookOptions.getDisplayOptions().consolidatedOutputButton;
            outputItemDiv.style.position = 'relative';
            const mimeTypePicker = DOM.$('.cell-output-toolbar');
            outputItemDiv.appendChild(mimeTypePicker);
            const toolbar = this._renderDisposableStore.add(this.instantiationService.createInstance(toolbar_1.WorkbenchToolBar, mimeTypePicker, {
                renderDropdownAsChildElement: false
            }));
            toolbar.context = {
                ui: true,
                cell: this.output.cellViewModel,
                outputViewModel: this.output,
                notebookEditor: this.notebookEditor,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            };
            // TODO: This could probably be a real registered action, but it has to talk to this output element
            const pickAction = new actions_1.Action('notebook.output.pickMimetype', nls.localize('pickMimeType', "Change Presentation"), themables_1.ThemeIcon.asClassName(notebookIcons_1.mimetypeIcon), undefined, async (_context) => this._pickActiveMimeTypeRenderer(outputItemDiv, notebookTextModel, kernel, this.output));
            const menu = this._renderDisposableStore.add(this.menuService.createMenu(actions_2.MenuId.NotebookOutputToolbar, this.contextKeyService));
            const updateMenuToolbar = () => {
                const primary = [];
                let secondary = [];
                const result = { primary, secondary };
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, result, () => false);
                if (index > 0 || !useConsolidatedButton) {
                    // clear outputs should only appear in the first output item's menu
                    secondary = secondary.filter((action) => action.id !== editActions_1.CLEAR_CELL_OUTPUTS_COMMAND_ID);
                }
                if (!isCopyEnabled) {
                    secondary = secondary.filter((action) => action.id !== cellOutputActions_1.COPY_OUTPUT_COMMAND_ID);
                }
                if (hasMultipleMimeTypes) {
                    secondary = [pickAction, ...secondary];
                }
                toolbar.setActions([], secondary);
            };
            updateMenuToolbar();
            this._renderDisposableStore.add(menu.onDidChange(updateMenuToolbar));
        }
        async _pickActiveMimeTypeRenderer(outputItemDiv, notebookTextModel, kernel, viewModel) {
            const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(notebookTextModel, kernel?.preloadProvides);
            const items = [];
            const unsupportedItems = [];
            mimeTypes.forEach((mimeType, index) => {
                if (mimeType.isTrusted) {
                    const arr = mimeType.rendererId === notebookCommon_1.RENDERER_NOT_AVAILABLE ?
                        unsupportedItems :
                        items;
                    arr.push({
                        label: mimeType.mimeType,
                        id: mimeType.mimeType,
                        index: index,
                        picked: index === currIndex,
                        detail: this._generateRendererInfo(mimeType.rendererId),
                        description: index === currIndex ? nls.localize('curruentActiveMimeType', "Currently Active") : undefined
                    });
                }
            });
            if (unsupportedItems.some(m => JUPYTER_RENDERER_MIMETYPES.includes(m.id))) {
                unsupportedItems.push({
                    label: nls.localize('installJupyterPrompt', "Install additional renderers from the marketplace"),
                    id: 'installRenderers',
                    index: mimeTypes.length
                });
            }
            const picker = this.quickInputService.createQuickPick();
            picker.items = [
                ...items,
                { type: 'separator' },
                ...unsupportedItems
            ];
            picker.activeItems = items.filter(item => !!item.picked);
            picker.placeholder = items.length !== mimeTypes.length
                ? nls.localize('promptChooseMimeTypeInSecure.placeHolder', "Select mimetype to render for current output")
                : nls.localize('promptChooseMimeType.placeHolder', "Select mimetype to render for current output");
            const pick = await new Promise(resolve => {
                picker.onDidAccept(() => {
                    resolve(picker.selectedItems.length === 1 ? picker.selectedItems[0] : undefined);
                    picker.dispose();
                });
                picker.show();
            });
            if (pick === undefined || pick.index === currIndex) {
                return;
            }
            if (pick.id === 'installRenderers') {
                this._showJupyterExtension();
                return;
            }
            // user chooses another mimetype
            const nextElement = outputItemDiv.nextElementSibling;
            this._renderDisposableStore.clear();
            const element = this.innerContainer;
            if (element) {
                element.parentElement?.removeChild(element);
                this.notebookEditor.removeInset(viewModel);
            }
            viewModel.pickedMimeType = mimeTypes[pick.index];
            this.viewCell.updateOutputMinHeight(this.viewCell.layoutInfo.outputTotalHeight);
            const { mimeType, rendererId } = mimeTypes[pick.index];
            this.notebookService.updateMimePreferredRenderer(notebookTextModel.viewType, mimeType, rendererId, mimeTypes.map(m => m.mimeType));
            this.render(nextElement);
            this._validateFinalOutputHeight(false);
            this._relayoutCell();
        }
        async _showJupyterExtension() {
            const viewlet = await this.paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            const view = viewlet?.getViewPaneContainer();
            view?.search(`@id:${notebookBrowser_1.JUPYTER_EXTENSION_ID}`);
        }
        _generateRendererInfo(renderId) {
            const renderInfo = this.notebookService.getRendererInfo(renderId);
            if (renderInfo) {
                const displayName = renderInfo.displayName !== '' ? renderInfo.displayName : renderInfo.id;
                return `${displayName} (${renderInfo.extensionId.value})`;
            }
            return nls.localize('unavailableRenderInfo', "renderer not available");
        }
        _validateFinalOutputHeight(synchronous) {
            if (this._outputHeightTimer !== null) {
                clearTimeout(this._outputHeightTimer);
            }
            if (synchronous) {
                this.viewCell.unlockOutputHeight();
            }
            else {
                this._outputHeightTimer = setTimeout(() => {
                    this.viewCell.unlockOutputHeight();
                }, 1000);
            }
        }
        _relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
        dispose() {
            if (this._outputHeightTimer) {
                this.viewCell.unlockOutputHeight();
                clearTimeout(this._outputHeightTimer);
            }
            super.dispose();
        }
    };
    CellOutputElement = __decorate([
        __param(5, notebookService_1.INotebookService),
        __param(6, quickInput_1.IQuickInputService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, actions_2.IMenuService),
        __param(9, panecomposite_1.IPaneCompositePartService),
        __param(10, instantiation_1.IInstantiationService)
    ], CellOutputElement);
    class OutputEntryViewHandler {
        constructor(model, element) {
            this.model = model;
            this.element = element;
        }
    }
    var CellOutputUpdateContext;
    (function (CellOutputUpdateContext) {
        CellOutputUpdateContext[CellOutputUpdateContext["Execution"] = 1] = "Execution";
        CellOutputUpdateContext[CellOutputUpdateContext["Other"] = 2] = "Other";
    })(CellOutputUpdateContext || (CellOutputUpdateContext = {}));
    let CellOutputContainer = class CellOutputContainer extends cellPart_1.CellContentPart {
        get renderedOutputEntries() {
            return this._outputEntries;
        }
        constructor(notebookEditor, viewCell, templateData, options, openerService, _notebookExecutionStateService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.templateData = templateData;
            this.options = options;
            this.openerService = openerService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this.instantiationService = instantiationService;
            this._outputEntries = [];
            this._outputHeightTimer = null;
            this._register(viewCell.onDidStartExecution(() => {
                viewCell.updateOutputMinHeight(viewCell.layoutInfo.outputTotalHeight);
            }));
            this._register(viewCell.onDidStopExecution(() => {
                this._validateFinalOutputHeight(false);
            }));
            this._register(viewCell.onDidChangeOutputs(splice => {
                const executionState = this._notebookExecutionStateService.getCellExecution(viewCell.uri);
                const context = executionState ? 1 /* CellOutputUpdateContext.Execution */ : 2 /* CellOutputUpdateContext.Other */;
                this._updateOutputs(splice, context);
            }));
            this._register(viewCell.onDidChangeLayout(() => {
                this.updateInternalLayoutNow(viewCell);
            }));
        }
        updateInternalLayoutNow(viewCell) {
            this.templateData.outputContainer.setTop(viewCell.layoutInfo.outputContainerOffset);
            this.templateData.outputShowMoreContainer.setTop(viewCell.layoutInfo.outputShowMoreContainerOffset);
            this._outputEntries.forEach(entry => {
                const index = this.viewCell.outputsViewModels.indexOf(entry.model);
                if (index >= 0) {
                    const top = this.viewCell.getOutputOffsetInContainer(index);
                    entry.element.updateDOMTop(top);
                }
            });
        }
        render() {
            try {
                this._doRender();
            }
            finally {
                // TODO@rebornix, this is probably not necessary at all as cell layout change would send the update request.
                this._relayoutCell();
            }
        }
        _doRender() {
            if (this.viewCell.outputsViewModels.length > 0) {
                if (this.viewCell.layoutInfo.outputTotalHeight !== 0) {
                    this.viewCell.updateOutputMinHeight(this.viewCell.layoutInfo.outputTotalHeight);
                }
                DOM.show(this.templateData.outputContainer.domNode);
                for (let index = 0; index < Math.min(this.options.limit, this.viewCell.outputsViewModels.length); index++) {
                    const currOutput = this.viewCell.outputsViewModels[index];
                    const entry = this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, currOutput);
                    this._outputEntries.push(new OutputEntryViewHandler(currOutput, entry));
                    entry.render(undefined);
                }
                if (this.viewCell.outputsViewModels.length > this.options.limit) {
                    DOM.show(this.templateData.outputShowMoreContainer.domNode);
                    this.viewCell.updateOutputShowMoreContainerHeight(46);
                }
                this._validateFinalOutputHeight(false);
            }
            else {
                // noop
                DOM.hide(this.templateData.outputContainer.domNode);
            }
            this.templateData.outputShowMoreContainer.domNode.innerText = '';
            if (this.viewCell.outputsViewModels.length > this.options.limit) {
                this.templateData.outputShowMoreContainer.domNode.appendChild(this._generateShowMoreElement(this.templateData.templateDisposables));
            }
            else {
                DOM.hide(this.templateData.outputShowMoreContainer.domNode);
                this.viewCell.updateOutputShowMoreContainerHeight(0);
            }
        }
        viewUpdateShowOutputs(initRendering) {
            for (let index = 0; index < this._outputEntries.length; index++) {
                const viewHandler = this._outputEntries[index];
                const outputEntry = viewHandler.element;
                if (outputEntry.renderResult) {
                    this.notebookEditor.createOutput(this.viewCell, outputEntry.renderResult, this.viewCell.getOutputOffset(index), false);
                }
                else {
                    outputEntry.render(undefined);
                }
            }
            this._relayoutCell();
        }
        viewUpdateHideOuputs() {
            for (let index = 0; index < this._outputEntries.length; index++) {
                this.notebookEditor.hideInset(this._outputEntries[index].model);
            }
        }
        _validateFinalOutputHeight(synchronous) {
            if (this._outputHeightTimer !== null) {
                clearTimeout(this._outputHeightTimer);
            }
            const executionState = this._notebookExecutionStateService.getCellExecution(this.viewCell.uri);
            if (synchronous) {
                this.viewCell.unlockOutputHeight();
            }
            else if (executionState?.state !== notebookCommon_1.NotebookCellExecutionState.Executing) {
                this._outputHeightTimer = setTimeout(() => {
                    this.viewCell.unlockOutputHeight();
                }, 200);
            }
        }
        _updateOutputs(splice, context = 2 /* CellOutputUpdateContext.Other */) {
            const previousOutputHeight = this.viewCell.layoutInfo.outputTotalHeight;
            // for cell output update, we make sure the cell does not shrink before the new outputs are rendered.
            this.viewCell.updateOutputMinHeight(previousOutputHeight);
            if (this.viewCell.outputsViewModels.length) {
                DOM.show(this.templateData.outputContainer.domNode);
            }
            else {
                DOM.hide(this.templateData.outputContainer.domNode);
            }
            this.viewCell.spliceOutputHeights(splice.start, splice.deleteCount, splice.newOutputs.map(_ => 0));
            this._renderNow(splice, context);
        }
        _renderNow(splice, context) {
            if (splice.start >= this.options.limit) {
                // splice items out of limit
                return;
            }
            const firstGroupEntries = this._outputEntries.slice(0, splice.start);
            const deletedEntries = this._outputEntries.slice(splice.start, splice.start + splice.deleteCount);
            const secondGroupEntries = this._outputEntries.slice(splice.start + splice.deleteCount);
            let newlyInserted = this.viewCell.outputsViewModels.slice(splice.start, splice.start + splice.newOutputs.length);
            // [...firstGroup, ...deletedEntries, ...secondGroupEntries]  [...restInModel]
            // [...firstGroup, ...newlyInserted, ...secondGroupEntries, restInModel]
            if (firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length > this.options.limit) {
                // exceeds limit again
                if (firstGroupEntries.length + newlyInserted.length > this.options.limit) {
                    [...deletedEntries, ...secondGroupEntries].forEach(entry => {
                        entry.element.detach();
                        entry.element.dispose();
                    });
                    newlyInserted = newlyInserted.slice(0, this.options.limit - firstGroupEntries.length);
                    const newlyInsertedEntries = newlyInserted.map(insert => {
                        return new OutputEntryViewHandler(insert, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, insert));
                    });
                    this._outputEntries = [...firstGroupEntries, ...newlyInsertedEntries];
                    // render newly inserted outputs
                    for (let i = firstGroupEntries.length; i < this._outputEntries.length; i++) {
                        this._outputEntries[i].element.render(undefined);
                    }
                }
                else {
                    // part of secondGroupEntries are pushed out of view
                    // now we have to be creative as secondGroupEntries might not use dedicated containers
                    const elementsPushedOutOfView = secondGroupEntries.slice(this.options.limit - firstGroupEntries.length - newlyInserted.length);
                    [...deletedEntries, ...elementsPushedOutOfView].forEach(entry => {
                        entry.element.detach();
                        entry.element.dispose();
                    });
                    // exclusive
                    const reRenderRightBoundary = firstGroupEntries.length + newlyInserted.length;
                    const newlyInsertedEntries = newlyInserted.map(insert => {
                        return new OutputEntryViewHandler(insert, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, insert));
                    });
                    this._outputEntries = [...firstGroupEntries, ...newlyInsertedEntries, ...secondGroupEntries.slice(0, this.options.limit - firstGroupEntries.length - newlyInserted.length)];
                    for (let i = firstGroupEntries.length; i < reRenderRightBoundary; i++) {
                        const previousSibling = i - 1 >= 0 && this._outputEntries[i - 1] && !!(this._outputEntries[i - 1].element.innerContainer?.parentElement) ? this._outputEntries[i - 1].element.innerContainer : undefined;
                        this._outputEntries[i].element.render(previousSibling);
                    }
                }
            }
            else {
                // after splice, it doesn't exceed
                deletedEntries.forEach(entry => {
                    entry.element.detach();
                    entry.element.dispose();
                });
                const reRenderRightBoundary = firstGroupEntries.length + newlyInserted.length;
                const newlyInsertedEntries = newlyInserted.map(insert => {
                    return new OutputEntryViewHandler(insert, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, insert));
                });
                let outputsNewlyAvailable = [];
                if (firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length < this.viewCell.outputsViewModels.length) {
                    const last = Math.min(this.options.limit, this.viewCell.outputsViewModels.length);
                    outputsNewlyAvailable = this.viewCell.outputsViewModels.slice(firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length, last).map(output => {
                        return new OutputEntryViewHandler(output, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, output));
                    });
                }
                this._outputEntries = [...firstGroupEntries, ...newlyInsertedEntries, ...secondGroupEntries, ...outputsNewlyAvailable];
                for (let i = firstGroupEntries.length; i < reRenderRightBoundary; i++) {
                    const previousSibling = i - 1 >= 0 && this._outputEntries[i - 1] && !!(this._outputEntries[i - 1].element.innerContainer?.parentElement) ? this._outputEntries[i - 1].element.innerContainer : undefined;
                    this._outputEntries[i].element.render(previousSibling);
                }
                for (let i = 0; i < outputsNewlyAvailable.length; i++) {
                    this._outputEntries[firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length + i].element.render(undefined);
                }
            }
            if (this.viewCell.outputsViewModels.length > this.options.limit) {
                DOM.show(this.templateData.outputShowMoreContainer.domNode);
                if (!this.templateData.outputShowMoreContainer.domNode.hasChildNodes()) {
                    this.templateData.outputShowMoreContainer.domNode.appendChild(this._generateShowMoreElement(this.templateData.templateDisposables));
                }
                this.viewCell.updateOutputShowMoreContainerHeight(46);
            }
            else {
                DOM.hide(this.templateData.outputShowMoreContainer.domNode);
            }
            this._relayoutCell();
            // if it's clearing all outputs, or outputs are all rendered synchronously
            // shrink immediately as the final output height will be zero.
            // if it's rerun, then the output clearing might be temporary, so we don't shrink immediately
            this._validateFinalOutputHeight(context === 2 /* CellOutputUpdateContext.Other */ && this.viewCell.outputsViewModels.length === 0);
        }
        _generateShowMoreElement(disposables) {
            const md = {
                value: `There are more than ${this.options.limit} outputs, [show more (open the raw output data in a text editor) ...](command:workbench.action.openLargeOutput)`,
                isTrusted: true,
                supportThemeIcons: true
            };
            const rendered = (0, markdownRenderer_1.renderMarkdown)(md, {
                actionHandler: {
                    callback: (content) => {
                        if (content === 'command:workbench.action.openLargeOutput') {
                            this.openerService.open(notebookCommon_1.CellUri.generateCellOutputUri(this.notebookEditor.textModel.uri));
                        }
                        return;
                    },
                    disposables
                }
            });
            disposables.add(rendered);
            rendered.element.classList.add('output-show-more');
            return rendered.element;
        }
        _relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
        dispose() {
            this.viewCell.updateOutputMinHeight(0);
            if (this._outputHeightTimer) {
                clearTimeout(this._outputHeightTimer);
            }
            this._outputEntries.forEach(entry => {
                entry.element.dispose();
            });
            super.dispose();
        }
    };
    exports.CellOutputContainer = CellOutputContainer;
    exports.CellOutputContainer = CellOutputContainer = __decorate([
        __param(4, opener_1.IOpenerService),
        __param(5, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(6, instantiation_1.IInstantiationService)
    ], CellOutputContainer);
    const JUPYTER_RENDERER_MIMETYPES = [
        'application/geo+json',
        'application/vdom.v1+json',
        'application/vnd.dataresource+json',
        'application/vnd.plotly.v1+json',
        'application/vnd.vega.v2+json',
        'application/vnd.vega.v3+json',
        'application/vnd.vega.v4+json',
        'application/vnd.vega.v5+json',
        'application/vnd.vegalite.v1+json',
        'application/vnd.vegalite.v2+json',
        'application/vnd.vegalite.v3+json',
        'application/vnd.vegalite.v4+json',
        'application/x-nteract-model-debug+json',
        'image/svg+xml',
        'text/latex',
        'text/vnd.plotly.v1+html',
        'application/vnd.jupyter.widget-view+json',
        'application/vnd.code.notebook.error'
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbE91dHB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jZWxsT3V0cHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTRDaEcsZ0JBQWdCO0lBQ2hCLEVBQUU7SUFDRixXQUFXO0lBQ1gsS0FBSztJQUNMLDhCQUE4QjtJQUM5QixvREFBb0Q7SUFDcEQsK0NBQStDO0lBQy9DLCtDQUErQztJQUMvQywrQ0FBK0M7SUFDL0MsOEJBQThCO0lBQzlCLG9EQUFvRDtJQUNwRCwrQ0FBK0M7SUFDL0MsOEJBQThCO0lBQzlCLG9EQUFvRDtJQUNwRCwrQ0FBK0M7SUFDL0MsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxzQkFBVTtRQVN6QyxZQUNTLGNBQXVDLEVBQ3ZDLFFBQTJCLEVBQzNCLG1CQUF3QyxFQUN4QyxlQUF5QyxFQUN4QyxNQUE0QixFQUNuQixlQUFrRCxFQUNoRCxpQkFBc0QsRUFDdEQsdUJBQTJDLEVBQ2pELFdBQTBDLEVBQzdCLG9CQUFnRSxFQUNwRSxvQkFBNEQ7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFaQSxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7WUFDdkMsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFDM0Isd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUN4QyxvQkFBZSxHQUFmLGVBQWUsQ0FBMEI7WUFDeEMsV0FBTSxHQUFOLE1BQU0sQ0FBc0I7WUFDRixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDL0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUUzQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNaLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBMkI7WUFDbkQseUJBQW9CLEdBQXBCLG9C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
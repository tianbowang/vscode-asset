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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/lifecycle", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/editor/common/languages/textToHtmlTokenizer", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/view/cellParts/cellEditorOptions", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter"], function (require, exports, DOM, iconLabels_1, async_1, cancellation_1, codicons_1, themables_1, lifecycle_1, codeEditorWidget_1, editorContextKeys_1, language_1, textToHtmlTokenizer_1, nls_1, accessibility_1, configuration_1, contextkey_1, instantiation_1, serviceCollection_1, keybinding_1, notebookBrowser_1, notebookIcons_1, cellEditorOptions_1, wordHighlighter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkupCell = void 0;
    let MarkupCell = class MarkupCell extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell, templateData, renderedEditors, accessibilityService, contextKeyService, instantiationService, languageService, configurationService, keybindingService) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.templateData = templateData;
            this.renderedEditors = renderedEditors;
            this.accessibilityService = accessibilityService;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this.languageService = languageService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.editor = null;
            this.localDisposables = this._register(new lifecycle_1.DisposableStore());
            this.focusSwitchDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.editorDisposables = this._register(new lifecycle_1.DisposableStore());
            this.constructDOM();
            this.editorPart = templateData.editorPart;
            this.cellEditorOptions = this._register(new cellEditorOptions_1.CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(viewCell.language), this.notebookEditor.notebookOptions, this.configurationService));
            this.cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
            this.editorOptions = this.cellEditorOptions.getValue(this.viewCell.internalMetadata, this.viewCell.uri);
            this._register((0, lifecycle_1.toDisposable)(() => renderedEditors.delete(this.viewCell)));
            this.registerListeners();
            // update for init state
            this.templateData.cellParts.scheduleRenderCell(this.viewCell);
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.templateData.cellParts.unrenderCell(this.viewCell);
            }));
            this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => {
                this.viewUpdate();
            }));
            this.updateForHover();
            this.updateForFocusModeChange();
            this.foldingState = viewCell.foldingState;
            this.layoutFoldingIndicator();
            this.updateFoldingIconShowClass();
            // the markdown preview's height might already be updated after the renderer calls `element.getHeight()`
            if (this.viewCell.layoutInfo.totalHeight > 0) {
                this.relayoutCell();
            }
            this.applyDecorations();
            this.viewUpdate();
            this.layoutCellParts();
            this._register(this.viewCell.onDidChangeLayout(() => {
                this.layoutCellParts();
            }));
        }
        layoutCellParts() {
            this.templateData.cellParts.updateInternalLayoutNow(this.viewCell);
        }
        constructDOM() {
            // Create an element that is only used to announce markup cell content to screen readers
            const id = `aria-markup-cell-${this.viewCell.id}`;
            this.markdownAccessibilityContainer = this.templateData.cellContainer;
            this.markdownAccessibilityContainer.id = id;
            // Hide the element from non-screen readers
            this.markdownAccessibilityContainer.style.height = '1px';
            this.markdownAccessibilityContainer.style.overflow = 'hidden';
            this.markdownAccessibilityContainer.style.position = 'absolute';
            this.markdownAccessibilityContainer.style.top = '100000px';
            this.markdownAccessibilityContainer.style.left = '10000px';
            this.markdownAccessibilityContainer.ariaHidden = 'false';
            this.templateData.rootContainer.setAttribute('aria-describedby', id);
            this.templateData.container.classList.toggle('webview-backed-markdown-cell', true);
        }
        registerListeners() {
            this._register(this.viewCell.onDidChangeState(e => {
                this.templateData.cellParts.updateState(this.viewCell, e);
            }));
            this._register(this.viewCell.model.onDidChangeMetadata(() => {
                this.viewUpdate();
            }));
            this._register(this.viewCell.onDidChangeState((e) => {
                if (e.editStateChanged || e.contentChanged) {
                    this.viewUpdate();
                }
                if (e.focusModeChanged) {
                    this.updateForFocusModeChange();
                }
                if (e.foldingStateChanged) {
                    const foldingState = this.viewCell.foldingState;
                    if (foldingState !== this.foldingState) {
                        this.foldingState = foldingState;
                        this.layoutFoldingIndicator();
                    }
                }
                if (e.cellIsHoveredChanged) {
                    this.updateForHover();
                }
                if (e.inputCollapsedChanged) {
                    this.updateCollapsedState();
                    this.viewUpdate();
                }
                if (e.cellLineNumberChanged) {
                    this.cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
                }
            }));
            this._register(this.notebookEditor.notebookOptions.onDidChangeOptions(e => {
                if (e.showFoldingControls) {
                    this.updateFoldingIconShowClass();
                }
            }));
            this._register(this.viewCell.onDidChangeLayout((e) => {
                const layoutInfo = this.editor?.getLayoutInfo();
                if (e.outerWidth && this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Editing && layoutInfo && layoutInfo.width !== this.viewCell.layoutInfo.editorWidth) {
                    this.onCellEditorWidthChange();
                }
            }));
            this._register(this.cellEditorOptions.onDidChange(() => {
                this.updateEditorOptions(this.cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
            }));
        }
        updateCollapsedState() {
            if (this.viewCell.isInputCollapsed) {
                this.notebookEditor.hideMarkupPreviews([this.viewCell]);
            }
            else {
                this.notebookEditor.unhideMarkupPreviews([this.viewCell]);
            }
        }
        updateForHover() {
            this.templateData.container.classList.toggle('markdown-cell-hover', this.viewCell.cellIsHovered);
        }
        updateForFocusModeChange() {
            if (this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                this.focusEditorIfNeeded();
            }
            this.templateData.container.classList.toggle('cell-editor-focus', this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor);
        }
        applyDecorations() {
            // apply decorations
            this._register(this.viewCell.onCellDecorationsChanged((e) => {
                e.added.forEach(options => {
                    if (options.className) {
                        this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [options.className], []);
                    }
                });
                e.removed.forEach(options => {
                    if (options.className) {
                        this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [], [options.className]);
                    }
                });
            }));
            this.viewCell.getCellDecorations().forEach(options => {
                if (options.className) {
                    this.notebookEditor.deltaCellContainerClassNames(this.viewCell.id, [options.className], []);
                }
            });
        }
        dispose() {
            // move focus back to the cell list otherwise the focus goes to body
            if (this.notebookEditor.getActiveCell() === this.viewCell && this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor && (this.notebookEditor.hasEditorFocus() || this.notebookEditor.getDomNode().ownerDocument.activeElement === this.notebookEditor.getDomNode().ownerDocument.body)) {
                this.notebookEditor.focusContainer();
            }
            this.viewCell.detachTextEditor();
            super.dispose();
        }
        updateFoldingIconShowClass() {
            const showFoldingIcon = this.notebookEditor.notebookOptions.getDisplayOptions().showFoldingControls;
            this.templateData.foldingIndicator.classList.remove('mouseover', 'always');
            this.templateData.foldingIndicator.classList.add(showFoldingIcon);
        }
        viewUpdate() {
            if (this.viewCell.isInputCollapsed) {
                this.viewUpdateCollapsed();
            }
            else if (this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                this.viewUpdateEditing();
            }
            else {
                this.viewUpdatePreview();
            }
        }
        viewUpdateCollapsed() {
            DOM.show(this.templateData.cellInputCollapsedContainer);
            DOM.hide(this.editorPart);
            this.templateData.cellInputCollapsedContainer.innerText = '';
            const markdownIcon = DOM.append(this.templateData.cellInputCollapsedContainer, DOM.$('span'));
            markdownIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.markdown));
            const element = DOM.$('div');
            element.classList.add('cell-collapse-preview');
            const richEditorText = this.getRichText(this.viewCell.textBuffer, this.viewCell.language);
            DOM.safeInnerHtml(element, richEditorText);
            this.templateData.cellInputCollapsedContainer.appendChild(element);
            const expandIcon = DOM.append(element, DOM.$('span.expandInputIcon'));
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.more));
            const keybinding = this.keybindingService.lookupKeybinding(notebookBrowser_1.EXPAND_CELL_INPUT_COMMAND_ID);
            if (keybinding) {
                element.title = (0, nls_1.localize)('cellExpandInputButtonLabelWithDoubleClick', "Double-click to expand cell input ({0})", keybinding.getLabel());
                expandIcon.title = (0, nls_1.localize)('cellExpandInputButtonLabel', "Expand Cell Input ({0})", keybinding.getLabel());
            }
            this.markdownAccessibilityContainer.ariaHidden = 'true';
            this.templateData.container.classList.toggle('input-collapsed', true);
            this.viewCell.renderedMarkdownHeight = 0;
            this.viewCell.layoutChange({});
        }
        getRichText(buffer, language) {
            return (0, textToHtmlTokenizer_1.tokenizeToStringSync)(this.languageService, buffer.getLineContent(1), language);
        }
        viewUpdateEditing() {
            // switch to editing mode
            let editorHeight;
            DOM.show(this.editorPart);
            this.markdownAccessibilityContainer.ariaHidden = 'true';
            DOM.hide(this.templateData.cellInputCollapsedContainer);
            this.notebookEditor.hideMarkupPreviews([this.viewCell]);
            this.templateData.container.classList.toggle('input-collapsed', false);
            this.templateData.container.classList.toggle('markdown-cell-edit-mode', true);
            if (this.editor && this.editor.hasModel()) {
                editorHeight = this.editor.getContentHeight();
                // not first time, we don't need to create editor
                this.viewCell.attachTextEditor(this.editor);
                this.focusEditorIfNeeded();
                this.bindEditorListeners(this.editor);
                this.editor.layout({
                    width: this.viewCell.layoutInfo.editorWidth,
                    height: editorHeight
                });
            }
            else {
                this.editorDisposables.clear();
                const width = this.notebookEditor.notebookOptions.computeMarkdownCellEditorWidth(this.notebookEditor.getLayoutInfo().width);
                const lineNum = this.viewCell.lineCount;
                const lineHeight = this.viewCell.layoutInfo.fontInfo?.lineHeight || 17;
                const editorPadding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
                editorHeight = Math.max(lineNum, 1) * lineHeight + editorPadding.top + editorPadding.bottom;
                this.templateData.editorContainer.innerText = '';
                // create a special context key service that set the inCompositeEditor-contextkey
                const editorContextKeyService = this.contextKeyService.createScoped(this.templateData.editorPart);
                editorContextKeys_1.EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
                const editorInstaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, editorContextKeyService]));
                this.editorDisposables.add(editorContextKeyService);
                this.editor = this.editorDisposables.add(editorInstaService.createInstance(codeEditorWidget_1.CodeEditorWidget, this.templateData.editorContainer, {
                    ...this.editorOptions,
                    dimension: {
                        width: width,
                        height: editorHeight
                    },
                    // overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode()
                }, {
                    contributions: this.notebookEditor.creationOptions.cellEditorContributions
                }));
                this.templateData.currentEditor = this.editor;
                this.editorDisposables.add(this.editor.onDidBlurEditorWidget(() => {
                    if (this.editor) {
                        wordHighlighter_1.WordHighlighterContribution.get(this.editor)?.stopHighlighting();
                    }
                }));
                this.editorDisposables.add(this.editor.onDidFocusEditorWidget(() => {
                    if (this.editor) {
                        wordHighlighter_1.WordHighlighterContribution.get(this.editor)?.restoreViewState(true);
                    }
                }));
                const cts = new cancellation_1.CancellationTokenSource();
                this.editorDisposables.add({ dispose() { cts.dispose(true); } });
                (0, async_1.raceCancellation)(this.viewCell.resolveTextModel(), cts.token).then(model => {
                    if (!model) {
                        return;
                    }
                    this.editor.setModel(model);
                    const realContentHeight = this.editor.getContentHeight();
                    if (realContentHeight !== editorHeight) {
                        this.editor.layout({
                            width: width,
                            height: realContentHeight
                        });
                        editorHeight = realContentHeight;
                    }
                    this.viewCell.attachTextEditor(this.editor);
                    if (this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                        this.focusEditorIfNeeded();
                    }
                    this.bindEditorListeners(this.editor);
                    this.viewCell.editorHeight = editorHeight;
                });
            }
            this.viewCell.editorHeight = editorHeight;
            this.focusEditorIfNeeded();
            this.renderedEditors.set(this.viewCell, this.editor);
        }
        viewUpdatePreview() {
            this.viewCell.detachTextEditor();
            DOM.hide(this.editorPart);
            DOM.hide(this.templateData.cellInputCollapsedContainer);
            this.markdownAccessibilityContainer.ariaHidden = 'false';
            this.templateData.container.classList.toggle('input-collapsed', false);
            this.templateData.container.classList.toggle('markdown-cell-edit-mode', false);
            this.renderedEditors.delete(this.viewCell);
            this.markdownAccessibilityContainer.innerText = '';
            if (this.viewCell.renderedHtml) {
                if (this.accessibilityService.isScreenReaderOptimized()) {
                    DOM.safeInnerHtml(this.markdownAccessibilityContainer, this.viewCell.renderedHtml);
                }
                else {
                    DOM.clearNode(this.markdownAccessibilityContainer);
                }
            }
            this.notebookEditor.createMarkupPreview(this.viewCell);
        }
        focusEditorIfNeeded() {
            if (this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor &&
                (this.notebookEditor.hasEditorFocus() || this.notebookEditor.getDomNode().ownerDocument.activeElement === this.notebookEditor.getDomNode().ownerDocument.body)) { // Don't steal focus from other workbench parts, but if body has focus, we can take it
                if (!this.editor) {
                    return;
                }
                this.editor.focus();
                const primarySelection = this.editor.getSelection();
                if (!primarySelection) {
                    return;
                }
                this.notebookEditor.revealRangeInViewAsync(this.viewCell, primarySelection);
            }
        }
        layoutEditor(dimension) {
            this.editor?.layout(dimension);
        }
        onCellEditorWidthChange() {
            const realContentHeight = this.editor.getContentHeight();
            this.layoutEditor({
                width: this.viewCell.layoutInfo.editorWidth,
                height: realContentHeight
            });
            // LET the content size observer to handle it
            // this.viewCell.editorHeight = realContentHeight;
            // this.relayoutCell();
        }
        relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
            this.layoutFoldingIndicator();
        }
        updateEditorOptions(newValue) {
            this.editorOptions = newValue;
            this.editor?.updateOptions(this.editorOptions);
        }
        layoutFoldingIndicator() {
            switch (this.foldingState) {
                case 0 /* CellFoldingState.None */:
                    this.templateData.foldingIndicator.style.display = 'none';
                    this.templateData.foldingIndicator.innerText = '';
                    break;
                case 2 /* CellFoldingState.Collapsed */:
                    this.templateData.foldingIndicator.style.display = '';
                    DOM.reset(this.templateData.foldingIndicator, (0, iconLabels_1.renderIcon)(notebookIcons_1.collapsedIcon));
                    break;
                case 1 /* CellFoldingState.Expanded */:
                    this.templateData.foldingIndicator.style.display = '';
                    DOM.reset(this.templateData.foldingIndicator, (0, iconLabels_1.renderIcon)(notebookIcons_1.expandedIcon));
                    break;
                default:
                    break;
            }
        }
        bindEditorListeners(editor) {
            this.localDisposables.clear();
            this.focusSwitchDisposable.clear();
            this.localDisposables.add(editor.onDidContentSizeChange(e => {
                if (e.contentHeightChanged) {
                    this.onCellEditorHeightChange(editor, e.contentHeight);
                }
            }));
            this.localDisposables.add(editor.onDidChangeCursorSelection((e) => {
                if (e.source === 'restoreState') {
                    // do not reveal the cell into view if this selection change was caused by restoring editors...
                    return;
                }
                const selections = editor.getSelections();
                if (selections?.length) {
                    const contentHeight = editor.getContentHeight();
                    const layoutContentHeight = this.viewCell.layoutInfo.editorHeight;
                    if (contentHeight !== layoutContentHeight) {
                        this.onCellEditorHeightChange(editor, contentHeight);
                    }
                    const lastSelection = selections[selections.length - 1];
                    this.notebookEditor.revealRangeInViewAsync(this.viewCell, lastSelection);
                }
            }));
            const updateFocusMode = () => this.viewCell.focusMode = editor.hasWidgetFocus() ? notebookBrowser_1.CellFocusMode.Editor : notebookBrowser_1.CellFocusMode.Container;
            this.localDisposables.add(editor.onDidFocusEditorWidget(() => {
                updateFocusMode();
            }));
            this.localDisposables.add(editor.onDidBlurEditorWidget(() => {
                // this is for a special case:
                // users click the status bar empty space, which we will then focus the editor
                // so we don't want to update the focus state too eagerly
                if (this.templateData.container.ownerDocument.activeElement?.contains(this.templateData.container)) {
                    this.focusSwitchDisposable.value = (0, async_1.disposableTimeout)(() => updateFocusMode(), 300);
                }
                else {
                    updateFocusMode();
                }
            }));
            updateFocusMode();
        }
        onCellEditorHeightChange(editor, newHeight) {
            const viewLayout = editor.getLayoutInfo();
            this.viewCell.editorHeight = newHeight;
            editor.layout({
                width: viewLayout.width,
                height: newHeight
            });
        }
    };
    exports.MarkupCell = MarkupCell;
    exports.MarkupCell = MarkupCell = __decorate([
        __param(4, accessibility_1.IAccessibilityService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, language_1.ILanguageService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, keybinding_1.IKeybindingService)
    ], MarkupCell);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya3VwQ2VsbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9tYXJrdXBDZWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQThCekYsSUFBTSxVQUFVLEdBQWhCLE1BQU0sVUFBVyxTQUFRLHNCQUFVO1FBY3pDLFlBQ2tCLGNBQTZDLEVBQzdDLFFBQTZCLEVBQzdCLFlBQXdDLEVBQ3hDLGVBQTZELEVBQ3ZELG9CQUE0RCxFQUMvRCxpQkFBc0QsRUFDbkQsb0JBQTRELEVBQ2pFLGVBQWtELEVBQzdDLG9CQUFtRCxFQUN0RCxpQkFBNkM7WUFFakUsS0FBSyxFQUFFLENBQUM7WUFYUyxtQkFBYyxHQUFkLGNBQWMsQ0FBK0I7WUFDN0MsYUFBUSxHQUFSLFFBQVEsQ0FBcUI7WUFDN0IsaUJBQVksR0FBWixZQUFZLENBQTRCO1lBQ3hDLG9CQUFlLEdBQWYsZUFBZSxDQUE4QztZQUN0Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzlDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNoRCxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDckMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM5QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBdEIxRCxXQUFNLEdBQTRCLElBQUksQ0FBQztZQUs5QixxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFDekQsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztZQUNoRSxzQkFBaUIsR0FBRyxJQUFJLENB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
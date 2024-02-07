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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/ui/button/button", "vs/base/common/codicons", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/config/editorOptions", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/model", "vs/editor/contrib/bracketMatching/browser/bracketMatching", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens", "vs/editor/contrib/smartSelect/browser/smartSelect", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/browser/toolbar", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/css!./codeBlockPart"], function (require, exports, dom, event_1, lifecycle_1, button_1, codicons_1, editorExtensions_1, codeEditorWidget_1, editorOptions_1, range_1, language_1, modesRegistry_1, model_1, bracketMatching_1, contextmenu_1, viewportSemanticTokens_1, smartSelect_1, wordHighlighter_1, nls_1, accessibility_1, toolbar_1, configuration_1, contextkey_1, instantiation_1, serviceCollection_1, chatViewModel_1, menuPreventer_1, selectionClipboard_1, simpleEditorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeBlockPart = void 0;
    const $ = dom.$;
    const defaultCodeblockPadding = 10;
    let CodeBlockPart = class CodeBlockPart extends lifecycle_1.Disposable {
        constructor(options, menuId, instantiationService, contextKeyService, languageService, modelService, configurationService, accessibilityService) {
            super();
            this.options = options;
            this.menuId = menuId;
            this.languageService = languageService;
            this.modelService = modelService;
            this.configurationService = configurationService;
            this.accessibilityService = accessibilityService;
            this._onDidChangeContentHeight = this._register(new event_1.Emitter());
            this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
            this.currentScrollWidth = 0;
            this.element = $('.interactive-result-code-block');
            this.contextKeyService = this._register(contextKeyService.createScoped(this.element));
            const scopedInstantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.contextKeyService]));
            const editorElement = dom.append(this.element, $('.interactive-result-editor'));
            this.editor = this._register(scopedInstantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, editorElement, {
                ...(0, simpleEditorOptions_1.getSimpleEditorOptions)(this.configurationService),
                readOnly: true,
                lineNumbers: 'off',
                selectOnLineNumbers: true,
                scrollBeyondLastLine: false,
                lineDecorationsWidth: 8,
                dragAndDrop: false,
                padding: { top: defaultCodeblockPadding, bottom: defaultCodeblockPadding },
                mouseWheelZoom: false,
                scrollbar: {
                    alwaysConsumeMouseWheel: false
                },
                ariaLabel: (0, nls_1.localize)('chat.codeBlockHelp', 'Code block'),
                ...this.getEditorOptionsFromConfig()
            }, {
                isSimpleWidget: true,
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    menuPreventer_1.MenuPreventer.ID,
                    selectionClipboard_1.SelectionClipboardContributionID,
                    contextmenu_1.ContextMenuController.ID,
                    wordHighlighter_1.WordHighlighterContribution.ID,
                    viewportSemanticTokens_1.ViewportSemanticTokensContribution.ID,
                    bracketMatching_1.BracketMatchingController.ID,
                    smartSelect_1.SmartSelectController.ID,
                ])
            }));
            const toolbarElement = dom.append(this.element, $('.interactive-result-code-block-toolbar'));
            const editorScopedService = this.editor.contextKeyService.createScoped(toolbarElement);
            const editorScopedInstantiationService = scopedInstantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, editorScopedService]));
            this.toolbar = this._register(editorScopedInstantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, toolbarElement, menuId, {
                menuOptions: {
                    shouldForwardArgs: true
                }
            }));
            const vulnsContainer = dom.append(this.element, $('.interactive-result-vulns'));
            const vulnsHeaderElement = dom.append(vulnsContainer, $('.interactive-result-vulns-header', undefined));
            this.vulnsButton = new button_1.Button(vulnsHeaderElement, {
                buttonBackground: undefined,
                buttonBorder: undefined,
                buttonForeground: undefined,
                buttonHoverBackground: undefined,
                buttonSecondaryBackground: undefined,
                buttonSecondaryForeground: undefined,
                buttonSecondaryHoverBackground: undefined,
                buttonSeparator: undefined,
                supportIcons: true
            });
            this.vulnsListElement = dom.append(vulnsContainer, $('ul.interactive-result-vulns-list'));
            this.vulnsButton.onDidClick(() => {
                const element = this.currentCodeBlockData.element;
                element.vulnerabilitiesListExpanded = !element.vulnerabilitiesListExpanded;
                this.vulnsButton.label = this.getVulnerabilitiesLabel();
                this.element.classList.toggle('chat-vulnerabilities-collapsed', !element.vulnerabilitiesListExpanded);
                this._onDidChangeContentHeight.fire();
                // this.updateAriaLabel(collapseButton.element, referencesLabel, element.usedReferencesExpanded);
            });
            this._register(this.toolbar.onDidChangeDropdownVisibility(e => {
                toolbarElement.classList.toggle('force-visibility', e);
            }));
            this._configureForScreenReader();
            this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => this._configureForScreenReader()));
            this._register(this.configurationService.onDidChangeConfiguration((e) => {
                if (e.affectedKeys.has("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */)) {
                    this._configureForScreenReader();
                }
            }));
            this._register(this.options.onDidChange(() => {
                this.editor.updateOptions(this.getEditorOptionsFromConfig());
            }));
            this._register(this.editor.onDidScrollChange(e => {
                this.currentScrollWidth = e.scrollWidth;
            }));
            this._register(this.editor.onDidContentSizeChange(e => {
                if (e.contentHeightChanged) {
                    this._onDidChangeContentHeight.fire();
                }
            }));
            this._register(this.editor.onDidBlurEditorWidget(() => {
                this.element.classList.remove('focused');
                wordHighlighter_1.WordHighlighterContribution.get(this.editor)?.stopHighlighting();
            }));
            this._register(this.editor.onDidFocusEditorWidget(() => {
                this.element.classList.add('focused');
                wordHighlighter_1.WordHighlighterContribution.get(this.editor)?.restoreViewState(true);
            }));
            this.textModel = this._register(this.modelService.createModel('', null, undefined, true));
            this.editor.setModel(this.textModel);
        }
        focus() {
            this.editor.focus();
        }
        updatePaddingForLayout() {
            // scrollWidth = "the width of the content that needs to be scrolled"
            // contentWidth = "the width of the area where content is displayed"
            const horizontalScrollbarVisible = this.currentScrollWidth > this.editor.getLayoutInfo().contentWidth;
            const scrollbarHeight = this.editor.getLayoutInfo().horizontalScrollbarHeight;
            const bottomPadding = horizontalScrollbarVisible ?
                Math.max(defaultCodeblockPadding - scrollbarHeight, 2) :
                defaultCodeblockPadding;
            this.editor.updateOptions({ padding: { top: defaultCodeblockPadding, bottom: bottomPadding } });
        }
        _configureForScreenReader() {
            const toolbarElt = this.toolbar.getElement();
            if (this.accessibilityService.isScreenReaderOptimized()) {
                toolbarElt.style.display = 'block';
                toolbarElt.ariaLabel = this.configurationService.getValue("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */) ? (0, nls_1.localize)('chat.codeBlock.toolbarVerbose', 'Toolbar for code block which can be reached via tab') : (0, nls_1.localize)('chat.codeBlock.toolbar', 'Code block toolbar');
            }
            else {
                toolbarElt.style.display = '';
            }
        }
        getEditorOptionsFromConfig() {
            return {
                wordWrap: this.options.configuration.resultEditor.wordWrap,
                fontLigatures: this.options.configuration.resultEditor.fontLigatures,
                bracketPairColorization: this.options.configuration.resultEditor.bracketPairColorization,
                fontFamily: this.options.configuration.resultEditor.fontFamily === 'default' ?
                    editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily :
                    this.options.configuration.resultEditor.fontFamily,
                fontSize: this.options.configuration.resultEditor.fontSize,
                fontWeight: this.options.configuration.resultEditor.fontWeight,
                lineHeight: this.options.configuration.resultEditor.lineHeight,
            };
        }
        layout(width) {
            const realContentHeight = this.editor.getContentHeight();
            const editorBorder = 2;
            this.editor.layout({ width: width - editorBorder, height: realContentHeight });
            this.updatePaddingForLayout();
        }
        render(data, width) {
            this.currentCodeBlockData = data;
            if (data.parentContextKeyService) {
                this.contextKeyService.updateParent(data.parentContextKeyService);
            }
            if (this.options.configuration.resultEditor.wordWrap === 'on') {
                // Intialize the editor with the new proper width so that getContentHeight
                // will be computed correctly in the next call to layout()
                this.layout(width);
            }
            const text = this.fixCodeText(data.text, data.languageId);
            this.setText(text);
            const vscodeLanguageId = this.languageService.getLanguageIdByLanguageName(data.languageId) ?? undefined;
            this.setLanguage(vscodeLanguageId);
            this.layout(width);
            this.editor.updateOptions({ ariaLabel: (0, nls_1.localize)('chat.codeBlockLabel', "Code block {0}", data.codeBlockIndex + 1) });
            this.toolbar.context = {
                code: data.text,
                codeBlockIndex: data.codeBlockIndex,
                element: data.element,
                languageId: vscodeLanguageId
            };
            if (data.hideToolbar) {
                dom.hide(this.toolbar.getElement());
            }
            else {
                dom.show(this.toolbar.getElement());
            }
            if (data.vulns?.length && (0, chatViewModel_1.isResponseVM)(data.element)) {
                dom.clearNode(this.vulnsListElement);
                this.element.classList.remove('no-vulns');
                this.element.classList.toggle('chat-vulnerabilities-collapsed', !data.element.vulnerabilitiesListExpanded);
                dom.append(this.vulnsListElement, ...data.vulns.map(v => $('li', undefined, $('span.chat-vuln-title', undefined, v.title), ' ' + v.description)));
                this.vulnsButton.label = this.getVulnerabilitiesLabel();
            }
            else {
                this.element.classList.add('no-vulns');
            }
        }
        getVulnerabilitiesLabel() {
            if (!this.currentCodeBlockData || !this.currentCodeBlockData.vulns) {
                return '';
            }
            const referencesLabel = this.currentCodeBlockData.vulns.length > 1 ?
                (0, nls_1.localize)('vulnerabilitiesPlural', "{0} vulnerabilities", this.currentCodeBlockData.vulns.length) :
                (0, nls_1.localize)('vulnerabilitiesSingular', "{0} vulnerability", 1);
            const icon = (element) => element.vulnerabilitiesListExpanded ? codicons_1.Codicon.chevronDown : codicons_1.Codicon.chevronRight;
            return `${referencesLabel} $(${icon(this.currentCodeBlockData.element).id})`;
        }
        fixCodeText(text, languageId) {
            if (languageId === 'php') {
                if (!text.trim().startsWith('<')) {
                    return `<?php\n${text}\n?>`;
                }
            }
            return text;
        }
        setText(newText) {
            const currentText = this.textModel.getValue(1 /* EndOfLinePreference.LF */);
            if (newText === currentText) {
                return;
            }
            if (newText.startsWith(currentText)) {
                const text = newText.slice(currentText.length);
                const lastLine = this.textModel.getLineCount();
                const lastCol = this.textModel.getLineMaxColumn(lastLine);
                this.textModel.applyEdits([{ range: new range_1.Range(lastLine, lastCol, lastLine, lastCol), text }]);
            }
            else {
                // console.log(`Failed to optimize setText`);
                this.textModel.setValue(newText);
            }
        }
        setLanguage(vscodeLanguageId) {
            this.textModel.setLanguage(vscodeLanguageId ?? modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
        }
    };
    exports.CodeBlockPart = CodeBlockPart;
    exports.CodeBlockPart = CodeBlockPart = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, language_1.ILanguageService),
        __param(5, model_1.IModelService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, accessibility_1.IAccessibilityService)
    ], CodeBlockPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUJsb2NrUGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NvZGVCbG9ja1BhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUNoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBOEJoQixNQUFNLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztJQUU1QixJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsc0JBQVU7UUFpQjVDLFlBQ2tCLE9BQTBCLEVBQ2xDLE1BQWMsRUFDQSxvQkFBMkMsRUFDOUMsaUJBQXFDLEVBQ3ZDLGVBQWtELEVBQ3JELFlBQTRDLEVBQ3BDLG9CQUE0RCxFQUM1RCxvQkFBNEQ7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFUUyxZQUFPLEdBQVAsT0FBTyxDQUFtQjtZQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBR1ksb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ3BDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ25CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQXhCbkUsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDakUsNkJBQXdCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQztZQWF4RSx1QkFBa0IsR0FBRyxDQUFDLENBQUM7WUFhOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztZQUVuRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFD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
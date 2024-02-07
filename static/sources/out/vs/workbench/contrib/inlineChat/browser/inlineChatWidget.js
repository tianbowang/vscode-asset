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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/base/browser/dom", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/common/services/model", "vs/base/common/uri", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/platform/actions/browser/toolbar", "vs/base/browser/ui/progressbar/progressbar", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/browser/style", "vs/workbench/browser/labels", "vs/platform/files/common/files", "vs/editor/common/services/languageFeatures", "vs/workbench/contrib/inlineChat/browser/utils", "vs/editor/common/core/lineRange", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/iconLabel/iconLabels", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/base/browser/ui/aria/aria", "vs/platform/actions/browser/buttonbar", "vs/workbench/contrib/chat/browser/chatSlashCommandContentWidget", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/base/common/types", "vs/base/browser/formattedTextRenderer", "vs/base/common/htmlContent", "vs/workbench/contrib/chat/browser/chatOptions", "vs/platform/theme/common/colorRegistry", "vs/base/common/lazy", "vs/editor/common/services/editorWorker", "vs/workbench/contrib/chat/common/chatViewModel", "vs/workbench/contrib/chat/common/chatModel", "vs/platform/log/common/log", "vs/workbench/contrib/chat/browser/chatListRenderer", "vs/editor/common/services/resolverService", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/browser/chatFollowups", "vs/css!./inlineChat"], function (require, exports, lifecycle_1, range_1, nls_1, contextkey_1, instantiation_1, zoneWidget_1, inlineChat_1, dom_1, event_1, editorExtensions_1, snippetController2_1, model_1, uri_1, embeddedCodeEditorWidget_1, toolbar_1, progressbar_1, suggestController_1, style_1, labels_1, files_1, languageFeatures_1, utils_1, lineRange_1, accessibility_1, configuration_1, keybinding_1, iconLabels_1, inlineChatSession_1, aria, buttonbar_1, chatSlashCommandContentWidget_1, accessibleView_1, types_1, formattedTextRenderer_1, htmlContent_1, chatOptions_1, colorRegistry_1, lazy_1, editorWorker_1, chatViewModel_1, chatModel_1, log_1, chatListRenderer_1, resolverService_1, chatAgents_1, chatFollowups_1) {
    "use strict";
    var InlineChatWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatZoneWidget = exports.InlineChatWidget = exports._inputEditorOptions = void 0;
    const defaultAriaLabel = (0, nls_1.localize)('aria-label', "Inline Chat Input");
    exports._inputEditorOptions = {
        padding: { top: 2, bottom: 2 },
        overviewRulerLanes: 0,
        glyphMargin: false,
        lineNumbers: 'off',
        folding: false,
        hideCursorInOverviewRuler: true,
        selectOnLineNumbers: false,
        selectionHighlight: false,
        scrollbar: {
            useShadows: false,
            vertical: 'hidden',
            horizontal: 'auto',
            alwaysConsumeMouseWheel: false
        },
        lineDecorationsWidth: 0,
        overviewRulerBorder: false,
        scrollBeyondLastLine: false,
        renderLineHighlight: 'none',
        fixedOverflowWidgets: true,
        dragAndDrop: false,
        revealHorizontalRightPadding: 5,
        minimap: { enabled: false },
        guides: { indentation: false },
        rulers: [],
        cursorWidth: 1,
        cursorStyle: 'line',
        cursorBlinking: 'blink',
        wrappingStrategy: 'advanced',
        wrappingIndent: 'none',
        renderWhitespace: 'none',
        dropIntoEditor: { enabled: true },
        quickSuggestions: false,
        suggest: {
            showIcons: false,
            showSnippets: false,
            showWords: true,
            showStatusBar: false,
        },
        wordWrap: 'on',
        ariaLabel: defaultAriaLabel,
        fontFamily: style_1.DEFAULT_FONT_FAMILY,
        fontSize: 13,
        lineHeight: 20
    };
    const _previewEditorEditorOptions = {
        scrollbar: { useShadows: false, alwaysConsumeMouseWheel: false, ignoreHorizontalScrollbarInContentHeight: true, },
        renderMarginRevertIcon: false,
        diffCodeLens: false,
        scrollBeyondLastLine: false,
        stickyScroll: { enabled: false },
        originalAriaLabel: (0, nls_1.localize)('original', 'Original'),
        modifiedAriaLabel: (0, nls_1.localize)('modified', 'Modified'),
        diffAlgorithm: 'advanced',
        readOnly: true,
        isInEmbeddedEditor: true
    };
    let InlineChatWidget = class InlineChatWidget {
        static { InlineChatWidget_1 = this; }
        static { this._modelPool = 1; }
        constructor(parentEditor, _options, _modelService, _contextKeyService, _languageFeaturesService, _keybindingService, _instantiationService, _accessibilityService, _configurationService, _accessibleViewService, _editorWorkerService, _logService, _textModelResolverService, _chatAgentService) {
            this.parentEditor = parentEditor;
            this._modelService = _modelService;
            this._contextKeyService = _contextKeyService;
            this._languageFeaturesService = _languageFeaturesService;
            this._keybindingService = _keybindingService;
            this._instantiationService = _instantiationService;
            this._accessibilityService = _accessibilityService;
            this._configurationService = _configurationService;
            this._accessibleViewService = _accessibleViewService;
            this._editorWorkerService = _editorWorkerService;
            this._logService = _logService;
            this._textModelResolverService = _textModelResolverService;
            this._chatAgentService = _chatAgentService;
            this._elements = (0, dom_1.h)('div.inline-chat@root', [
                (0, dom_1.h)('div.body', [
                    (0, dom_1.h)('div.content@content', [
                        (0, dom_1.h)('div.input@input', [
                            (0, dom_1.h)('div.editor-placeholder@placeholder'),
                            (0, dom_1.h)('div.editor-container@editor'),
                        ]),
                        (0, dom_1.h)('div.toolbar@editorToolbar'),
                    ]),
                    (0, dom_1.h)('div.widget-toolbar@widgetToolbar')
                ]),
                (0, dom_1.h)('div.progress@progress'),
                (0, dom_1.h)('div.detectedIntent.hidden@detectedIntent'),
                (0, dom_1.h)('div.previewDiff.hidden@previewDiff'),
                (0, dom_1.h)('div.previewCreateTitle.show-file-icons@previewCreateTitle'),
                (0, dom_1.h)('div.previewCreate.hidden@previewCreate'),
                (0, dom_1.h)('div.chatMessage.hidden@chatMessage', [
                    (0, dom_1.h)('div.chatMessageContent@chatMessageContent'),
                    (0, dom_1.h)('div.messageActions@messageActions')
                ]),
                (0, dom_1.h)('div.followUps.hidden@followUps'),
                (0, dom_1.h)('div.status@status', [
                    (0, dom_1.h)('div.label.info.hidden@infoLabel'),
                    (0, dom_1.h)('div.actions.hidden@statusToolbar'),
                    (0, dom_1.h)('div.label.status.hidden@statusLabel'),
                    (0, dom_1.h)('div.actions.hidden@feedbackToolbar'),
                ]),
            ]);
            this._store = new lifecycle_1.DisposableStore();
            this._slashCommands = this._store.add(new lifecycle_1.DisposableStore());
            this._previewDiffModel = this._store.add(new lifecycle_1.MutableDisposable());
            this._previewCreateDispoable = this._store.add(new lifecycle_1.MutableDisposable());
            this._onDidChangeHeight = this._store.add(new event_1.MicrotaskEmitter());
            this.onDidChangeHeight = event_1.Event.filter(this._onDidChangeHeight.event, _ => !this._isLayouting);
            this._onDidChangeLayout = this._store.add(new event_1.MicrotaskEmitter());
            this._onDidChangeInput = this._store.add(new event_1.Emitter());
            this.onDidChangeInput = this._onDidChangeInput.event;
            this._onRequestWithoutIntentDetection = this._store.add(new event_1.Emitter());
            this.onRequestWithoutIntentDetection = this._onRequestWithoutIntentDetection.event;
            this._isLayouting = false;
            this._expansionState = inlineChatSession_1.ExpansionState.NOT_CROPPED;
            this._slashCommandDetails = [];
            this._chatMessageDisposables = this._store.add(new lifecycle_1.DisposableStore());
            this._followUpDisposables = this._store.add(new lifecycle_1.DisposableStore());
            this._slashCommandUsedDisposables = this._store.add(new lifecycle_1.DisposableStore());
            // input editor logic
            const codeEditorWidgetOptions = {
                isSimpleWidget: true,
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    snippetController2_1.SnippetController2.ID,
                    suggestController_1.SuggestController.ID
                ])
            };
            this._inputEditor = this._instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, this._elements.editor, exports._inputEditorOptions, codeEditorWidgetOptions, this.parentEditor);
            this._updateAriaLabel();
            this._store.add(this._inputEditor);
            this._store.add(this._inputEditor.onDidChangeModelContent(() => this._onDidChangeInput.fire(this)));
            this._store.add(this._inputEditor.onDidLayoutChange(() => this._onDidChangeHeight.fire()));
            this._store.add(this._inputEditor.onDidContentSizeChange(() => this._onDidChangeHeight.fire()));
            this._store.add((0, dom_1.addDisposableListener)(this._elements.chatMessageContent, 'focus', () => this._ctxResponseFocused.set(true)));
            this._store.add((0, dom_1.addDisposableListener)(this._elements.chatMessageContent, 'blur', () => this._ctxResponseFocused.reset()));
            this._store.add(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */)) {
                    this._updateAriaLabel();
                }
            }));
            const uri = uri_1.URI.from({ scheme: 'vscode', authority: 'inline-chat', path: `/inline-chat/model${InlineChatWidget_1._modelPool++}.txt` });
            this._inputModel = this._store.add(this._modelService.getModel(uri) ?? this._modelService.createModel('', null, uri));
            this._inputEditor.setModel(this._inputModel);
            this._editorOptions = this._store.add(_instantiationService.createInstance(chatOptions_1.ChatEditorOptions, undefined, colorRegistry_1.editorForeground, colorRegistry_1.inputBackground, colorRegistry_1.editorBackground));
            // --- context keys
            this._ctxMessageCropState = inlineChat_1.CTX_INLINE_CHAT_MESSAGE_CROP_STATE.bindTo(this._contextKeyService);
            this._ctxInputEmpty = inlineChat_1.CTX_INLINE_CHAT_EMPTY.bindTo(this._contextKeyService);
            this._ctxInnerCursorFirst = inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_FIRST.bindTo(this._contextKeyService);
            this._ctxInnerCursorLast = inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_LAST.bindTo(this._contextKeyService);
            this._ctxInnerCursorStart = inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_START.bindTo(this._contextKeyService);
            this._ctxInnerCursorEnd = inlineChat_1.CTX_INLINE_CHAT_INNER_CURSOR_END.bindTo(this._contextKeyService);
            this._ctxInputEditorFocused = inlineChat_1.CTX_INLINE_CHAT_FOCUSED.bindTo(this._contextKeyService);
            this._ctxResponseFocused = inlineChat_1.CTX_INLINE_CHAT_RESPONSE_FOCUSED.bindTo(this._contextKeyService);
            // (1) inner cursor position (last/first line selected)
            const updateInnerCursorFirstLast = () => {
                const selection = this._inputEditor.getSelection();
                const fullRange = this._inputModel.getFullModelRange();
                let onFirst = false;
                let onLast = false;
                if (selection.isEmpty()) {
                    const selectionTop = this._inputEditor.getTopForPosition(selection.startLineNumber, selection.startColumn);
                    const firstViewLineTop = this._inputEditor.getTopForPosition(fullRange.startLineNumber, fullRange.startColumn);
                    const lastViewLineTop = this._inputEditor.getTopForPosition(fullRange.endLineNumber, fullRange.endColumn);
                    if (selectionTop === firstViewLineTop) {
                        onFirst = true;
                    }
                    if (selectionTop === lastViewLineTop) {
                        onLast = true;
                    }
                }
                this._ctxInnerCursorFirst.set(onFirst);
                this._ctxInnerCursorLast.set(onLast);
                this._ctxInnerCursorStart.set(fullRange.getStartPosition().equals(selection.getStartPosition()));
                this._ctxInnerCursorEnd.set(fullRange.getEndPosition().equals(selection.getEndPosition()));
            };
            this._store.add(this._inputEditor.onDidChangeCursorPosition(updateInnerCursorFirstLast));
            updateInnerCursorFirstLast();
            // (2) input editor focused or not
            const updateFocused = () => {
                const hasFocus = this._inputEditor.hasWidgetFocus();
                this._ctxInputEditorFocused.set(hasFocus);
                this._elements.content.classList.toggle('synthetic-focus', hasFocus);
                this.readPlaceholder();
            };
            this._store.add(this._inputEditor.onDidFocusEditorWidget(updateFocused));
            this._store.add(this._inputEditor.onDidBlurEditorWidget(updateFocused));
            this._store.add((0, lifecycle_1.toDisposable)(() => {
                this._ctxInnerCursorFirst.reset();
                this._ctxInnerCursorLast.reset();
                this._ctxInputEditorFocused.reset();
            }));
            updateFocused();
            // placeholder
            this._elements.placeholder.style.fontSize = `${this._inputEditor.getOption(52 /* EditorOption.fontSize */)}px`;
            this._elements.placeholder.style.lineHeight = `${this._inputEditor.getOption(66 /* EditorOption.lineHeight */)}px`;
            this._store.add((0, dom_1.addDisposableListener)(this._elements.placeholder, 'click', () => this._inputEditor.focus()));
            // show/hide placeholder depending on text model being empty
            // content height
            const currentContentHeight = 0;
            const togglePlaceholder = () => {
                const hasText = this._inputModel.getValueLength() > 0;
                this._elements.placeholder.classList.toggle('hidden', hasText);
                this._ctxInputEmpty.set(!hasText);
                this.readPlaceholder();
                const contentHeight = this._inputEditor.getContentHeight();
                if (contentHeight !== currentContentHeight && this._lastDim) {
                    this._lastDim = this._lastDim.with(undefined, contentHeight);
                    this._inputEditor.layout(this._lastDim);
                    this._onDidChangeHeight.fire();
                }
            };
            this._store.add(this._inputModel.onDidChangeContent(togglePlaceholder));
            togglePlaceholder();
            // slash command content widget
            this._slashCommandContentWidget = new chatSlashCommandContentWidget_1.SlashCommandContentWidget(this._inputEditor);
            this._store.add(this._slashCommandContentWidget);
            // toolbars
            this._store.add(this._instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this._elements.editorToolbar, _options.menuId, {
                telemetrySource: 'interactiveEditorWidget-toolbar',
                toolbarOptions: { primaryGroup: 'main' }
            }));
            this._progressBar = new progressbar_1.ProgressBar(this._elements.progress);
            this._store.add(this._progressBar);
            this._store.add(this._instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this._elements.widgetToolbar, _options.widgetMenuId, {
                telemetrySource: 'interactiveEditorWidget-toolbar',
                toolbarOptions: { primaryGroup: 'main' }
            }));
            const workbenchMenubarOptions = {
                telemetrySource: 'interactiveEditorWidget-toolbar',
                buttonConfigProvider: action => {
                    if (action.id === inlineChat_1.ACTION_REGENERATE_RESPONSE) {
                        return { showIcon: true, showLabel: false, isSecondary: true };
                    }
                    else if (action.id === inlineChat_1.ACTION_VIEW_IN_CHAT || action.id === inlineChat_1.ACTION_ACCEPT_CHANGES) {
                        return { isSecondary: false };
                    }
                    else {
                        return { isSecondary: true };
                    }
                }
            };
            const statusButtonBar = this._instantiationService.createInstance(buttonbar_1.MenuWorkbenchButtonBar, this._elements.statusToolbar, _options.statusMenuId, workbenchMenubarOptions);
            this._store.add(statusButtonBar.onDidChange(() => this._onDidChangeHeight.fire()));
            this._store.add(statusButtonBar);
            const workbenchToolbarOptions = {
                hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
                toolbarOptions: {
                    primaryGroup: () => true,
                    useSeparatorsInPrimaryActions: true
                }
            };
            const feedbackToolbar = this._instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this._elements.feedbackToolbar, _options.feedbackMenuId, { ...workbenchToolbarOptions, hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */ });
            this._store.add(feedbackToolbar.onDidChangeMenuItems(() => this._onDidChangeHeight.fire()));
            this._store.add(feedbackToolbar);
            // preview editors
            this._previewDiffEditor = new lazy_1.Lazy(() => this._store.add(_instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, this._elements.previewDiff, {
                useInlineViewWhenSpaceIsLimited: false,
                ..._previewEditorEditorOptions,
                onlyShowAccessibleDiffViewer: this._accessibilityService.isScreenReaderOptimized(),
            }, { modifiedEditor: codeEditorWidgetOptions, originalEditor: codeEditorWidgetOptions }, parentEditor)));
            this._previewCreateTitle = this._store.add(_instantiationService.createInstance(labels_1.ResourceLabel, this._elements.previewCreateTitle, { supportIcons: true }));
            this._previewCreateEditor = new lazy_1.Lazy(() => this._store.add(_instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, this._elements.previewCreate, _previewEditorEditorOptions, codeEditorWidgetOptions, parentEditor)));
            this._elements.chatMessageContent.tabIndex = 0;
            this._elements.chatMessageContent.ariaLabel = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */);
            this._elements.followUps.tabIndex = 0;
            this._elements.followUps.ariaLabel = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */);
            this._elements.statusLabel.tabIndex = 0;
            const markdownMessageToolbar = this._instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this._elements.messageActions, inlineChat_1.MENU_INLINE_CHAT_WIDGET_MARKDOWN_MESSAGE, workbenchToolbarOptions);
            this._store.add(markdownMessageToolbar.onDidChangeMenuItems(() => this._onDidChangeHeight.fire()));
            this._store.add(markdownMessageToolbar);
            this._store.add(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */)) {
                    this._elements.chatMessageContent.ariaLabel = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */);
                    this._elements.followUps.ariaLabel = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */);
                }
            }));
        }
        _updateAriaLabel() {
            if (!this._accessibilityService.isScreenReaderOptimized()) {
                return;
            }
            let label = defaultAriaLabel;
            if (this._configurationService.getValue("accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */)) {
                const kbLabel = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                label = kbLabel ? (0, nls_1.localize)('inlineChat.accessibilityHelp', "Inline Chat Input, Use {0} for Inline Chat Accessibility Help.", kbLabel) : (0, nls_1.localize)('inlineChat.accessibilityHelpNoKb', "Inline Chat Input, Run the Inline Chat Accessibility Help command for more information.");
            }
            exports._inputEditorOptions.ariaLabel = label;
            this._inputEditor.updateOptions({ ariaLabel: label });
        }
        dispose() {
            this._store.dispose();
            this._ctxInputEmpty.reset();
            this._ctxMessageCropState.reset();
        }
        get domNode() {
            return this._elements.root;
        }
        layout(_dim) {
            this._isLayouting = true;
            try {
                const widgetToolbarWidth = (0, dom_1.getTotalWidth)(this._elements.widgetToolbar);
                const editorToolbarWidth = (0, dom_1.getTotalWidth)(this._elements.editorToolbar) + 8 /* L/R-padding */;
                const innerEditorWidth = _dim.width - editorToolbarWidth - widgetToolbarWidth;
                const dim = new dom_1.Dimension(innerEditorWidth, _dim.height);
                if (!this._lastDim || !dom_1.Dimension.equals(this._lastDim, dim)) {
                    this._lastDim = dim;
                    this._inputEditor.layout(new dom_1.Dimension(innerEditorWidth, this._inputEditor.getContentHeight()));
                    this._elements.placeholder.style.width = `${innerEditorWidth /* input-padding*/}px`;
                    if (this._previewDiffEditor.hasValue) {
                        const previewDiffDim = new dom_1.Dimension(_dim.width - 12, Math.min(300, Math.max(0, this._previewDiffEditor.value.getContentHeight())));
                        this._elements.previewDiff.style.width = `${previewDiffDim.width}px`;
                        this._elements.previewDiff.style.height = `${previewDiffDim.height}px`;
                        this._previewDiffEditor.value.layout(previewDiffDim);
                    }
                    if (this._previewCreateEditor.hasValue) {
                        const previewCreateDim = new dom_1.Dimension(dim.width, Math.min(300, Math.max(0, this._previewCreateEditor.value.getContentHeight())));
                        this._previewCreateEditor.value.layout(previewCreateDim);
                        this._elements.previewCreate.style.height = `${previewCreateDim.height}px`;
                    }
                    const lineHeight = this.parentEditor.getOption(66 /* EditorOption.lineHeight */);
                    const editorHeight = this.parentEditor.getLayoutInfo().height;
                    const editorHeightInLines = Math.floor(editorHeight / lineHeight);
                    this._elements.root.style.setProperty('--vscode-inline-chat-cropped', String(Math.floor(editorHeightInLines / 5)));
                    this._elements.root.style.setProperty('--vscode-inline-chat-expanded', String(Math.floor(editorHeightInLines / 3)));
                    this._onDidChangeLayout.fire();
                }
            }
            finally {
                this._isLayouting = false;
            }
        }
        getHeight() {
            const base = (0, dom_1.getTotalHeight)(this._elements.progress) + (0, dom_1.getTotalHeight)(this._elements.status);
            const editorHeight = this._inputEditor.getContentHeight() + 12 /* padding and border */;
            const detectedIntentHeight = (0, dom_1.getTotalHeight)(this._elements.detectedIntent);
            const followUpsHeight = (0, dom_1.getTotalHeight)(this._elements.followUps);
            const chatResponseHeight = (0, dom_1.getTotalHeight)(this._elements.chatMessage);
            const previewDiffHeight = this._previewDiffEditor.hasValue && this._previewDiffEditor.value.getModel() ? 12 + Math.min(300, Math.max(0, this._previewDiffEditor.value.getContentHeight())) : 0;
            const previewCreateTitleHeight = (0, dom_1.getTotalHeight)(this._elements.previewCreateTitle);
            const previewCreateHeight = this._previewCreateEditor.hasValue && this._previewCreateEditor.value.getModel() ? 18 + Math.min(300, Math.max(0, this._previewCreateEditor.value.getContentHeight())) : 0;
            return base + editorHeight + detectedIntentHeight + followUpsHeight + chatResponseHeight + previewDiffHeight + previewCreateTitleHeight + previewCreateHeight + 18 /* padding */ + 8 /*shadow*/;
        }
        updateProgress(show) {
            if (show) {
                this._progressBar.show();
                this._progressBar.infinite();
            }
            else {
                this._progressBar.stop();
                this._progressBar.hide();
            }
        }
        get value() {
            return this._inputModel.getValue();
        }
        set value(value) {
            this._inputModel.setValue(value);
            this._inputEditor.setPosition(this._inputModel.getFullModelRange().getEndPosition());
        }
        selectAll(includeSlashCommand = true) {
            let selection = this._inputModel.getFullModelRange();
            if (!includeSlashCommand) {
                const firstLine = this._inputModel.getLineContent(1);
                const slashCommand = this._slashCommandDetails.find(c => firstLine.startsWith(`/${c.command} `));
                selection = slashCommand ? new range_1.Range(1, slashCommand.command.length + 3, selection.endLineNumber, selection.endColumn) : selection;
            }
            this._inputEditor.setSelection(selection);
        }
        set placeholder(value) {
            this._elements.placeholder.innerText = value;
        }
        readPlaceholder() {
            const slashCommand = this._slashCommandDetails.find(c => `${c.command} ` === this._inputModel.getValue().substring(1));
            const hasText = this._inputModel.getValueLength() > 0;
            if (!hasText) {
                aria.status(this._elements.placeholder.innerText);
            }
            else if (slashCommand) {
                aria.status(slashCommand.detail);
            }
        }
        updateToolbar(show) {
            this._elements.statusToolbar.classList.toggle('hidden', !show);
            this._elements.feedbackToolbar.classList.toggle('hidden', !show);
            this._elements.status.classList.toggle('actions', show);
            this._elements.infoLabel.classList.toggle('hidden', show);
            this._onDidChangeHeight.fire();
        }
        get expansionState() {
            return this._expansionState;
        }
        set preferredExpansionState(expansionState) {
            this._preferredExpansionState = expansionState;
        }
        get responseContent() {
            return this._chatMessage?.value;
        }
        updateChatMessage(message, isIncomplete) {
            let expansionState;
            this._chatMessageDisposables.clear();
            this._chatMessage = message ? new htmlContent_1.MarkdownString(message.message.value) : undefined;
            const hasMessage = message?.message.value;
            this._elements.chatMessage.classList.toggle('hidden', !hasMessage);
            (0, dom_1.reset)(this._elements.chatMessageContent);
            let resultingAppender;
            if (!hasMessage) {
                this._ctxMessageCropState.reset();
                expansionState = inlineChatSession_1.ExpansionState.NOT_CROPPED;
            }
            else {
                const sessionModel = this._chatMessageDisposables.add(new chatModel_1.ChatModel(message.providerId, undefined, this._logService, this._chatAgentService));
                const responseModel = this._chatMessageDisposables.add(new chatModel_1.ChatResponseModel(message.message, sessionModel, undefined, undefined, message.requestId, !isIncomplete, false, undefined));
                const viewModel = this._chatMessageDisposables.add(new chatViewModel_1.ChatResponseViewModel(responseModel, this._logService));
                const renderOptions = { renderStyle: 'compact', noHeader: true, noPadding: true };
                const chatRendererDelegate = { getListLength() { return 1; } };
                const renderer = this._chatMessageDisposables.add(this._instantiationService.createInstance(chatListRenderer_1.ChatListItemRenderer, this._editorOptions, renderOptions, chatRendererDelegate));
                renderer.layout(this._elements.chatMessageContent.clientWidth - 4); // 2 for the padding used for the tab index border
                this._chatMessageDisposables.add(this._onDidChangeLayout.event(() => {
                    renderer.layout(this._elements.chatMessageContent.clientWidth - 4);
                }));
                const template = renderer.renderTemplate(this._elements.chatMessageContent);
                this._chatMessageDisposables.add(template.elementDisposables);
                this._chatMessageDisposables.add(template.templateDisposables);
                renderer.renderChatTreeItem(viewModel, 0, template);
                this._chatMessageDisposables.add(renderer.onDidChangeItemHeight(() => this._onDidChangeHeight.fire()));
                if (this._preferredExpansionState) {
                    expansionState = this._preferredExpansionState;
                    this._preferredExpansionState = undefined;
                }
                else {
                    this._updateLineClamp(inlineChatSession_1.ExpansionState.CROPPED);
                    expansionState = template.value.scrollHeight > template.value.clientHeight ? inlineChatSession_1.ExpansionState.CROPPED : inlineChatSession_1.ExpansionState.NOT_CROPPED;
                }
                this._ctxMessageCropState.set(expansionState);
                this._updateLineClamp(expansionState);
                resultingAppender = isIncomplete ? {
                    cancel: () => responseModel.cancel(),
                    complete: () => responseModel.complete(),
                    appendContent: (fragment) => {
                        responseModel.updateContent({ kind: 'markdownContent', content: new htmlContent_1.MarkdownString(fragment) });
                        this._chatMessage?.appendMarkdown(fragment);
                    }
                } : undefined;
            }
            this._expansionState = expansionState;
            this._onDidChangeHeight.fire();
            return resultingAppender;
        }
        updateFollowUps(items, onFollowup) {
            this._followUpDisposables.clear();
            this._elements.followUps.classList.toggle('hidden', !items || items.length === 0);
            (0, dom_1.reset)(this._elements.followUps);
            if (items && items.length > 0 && onFollowup) {
                this._followUpDisposables.add(new chatFollowups_1.ChatFollowups(this._elements.followUps, items, undefined, onFollowup, this._contextKeyService));
            }
            this._onDidChangeHeight.fire();
        }
        updateChatMessageExpansionState(expansionState) {
            this._ctxMessageCropState.set(expansionState);
            const heightBefore = this._elements.chatMessageContent.scrollHeight;
            this._updateLineClamp(expansionState);
            const heightAfter = this._elements.chatMessageContent.scrollHeight;
            if (heightBefore === heightAfter) {
                this._ctxMessageCropState.set(inlineChatSession_1.ExpansionState.NOT_CROPPED);
            }
            this._onDidChangeHeight.fire();
        }
        _updateLineClamp(expansionState) {
            this._elements.chatMessageContent.setAttribute('state', expansionState);
        }
        updateSlashCommandUsed(command) {
            const details = this._slashCommandDetails.find(candidate => candidate.command === command);
            if (!details) {
                return;
            }
            this._elements.detectedIntent.classList.toggle('hidden', false);
            this._slashCommandUsedDisposables.clear();
            const label = (0, nls_1.localize)('slashCommandUsed', "Using {0} to generate response ([[re-run without]])", `\`\`/${details.command}\`\``);
            const usingSlashCommandText = (0, formattedTextRenderer_1.renderFormattedText)(label, {
                inline: true,
                renderCodeSegments: true,
                className: 'slash-command-pill',
                actionHandler: {
                    callback: (content) => {
                        if (content !== '0') {
                            return;
                        }
                        this._elements.detectedIntent.classList.toggle('hidden', true);
                        this._onRequestWithoutIntentDetection.fire();
                    },
                    disposables: this._slashCommandUsedDisposables,
                }
            });
            (0, dom_1.reset)(this._elements.detectedIntent, usingSlashCommandText);
            this._onDidChangeHeight.fire();
        }
        updateInfo(message) {
            this._elements.infoLabel.classList.toggle('hidden', !message);
            const renderedMessage = (0, iconLabels_1.renderLabelWithIcons)(message);
            (0, dom_1.reset)(this._elements.infoLabel, ...renderedMessage);
            this._onDidChangeHeight.fire();
        }
        updateStatus(message, ops = {}) {
            const isTempMessage = typeof ops.resetAfter === 'number';
            if (isTempMessage && !this._elements.statusLabel.dataset['state']) {
                const statusLabel = this._elements.statusLabel.innerText;
                const classes = Array.from(this._elements.statusLabel.classList.values());
                setTimeout(() => {
                    this.updateStatus(statusLabel, { classes, keepMessage: true });
                }, ops.resetAfter);
            }
            (0, dom_1.reset)(this._elements.statusLabel, message);
            this._elements.statusLabel.className = `label status ${(ops.classes ?? []).join(' ')}`;
            this._elements.statusLabel.classList.toggle('hidden', !message);
            if (isTempMessage) {
                this._elements.statusLabel.dataset['state'] = 'temp';
            }
            else {
                delete this._elements.statusLabel.dataset['state'];
            }
            this._onDidChangeHeight.fire();
        }
        reset() {
            this._ctxInputEmpty.reset();
            this._ctxInnerCursorFirst.reset();
            this._ctxInnerCursorLast.reset();
            this._ctxInputEditorFocused.reset();
            this.value = '';
            this.updateChatMessage(undefined);
            this.updateFollowUps(undefined);
            (0, dom_1.reset)(this._elements.statusLabel);
            this._elements.detectedIntent.classList.toggle('hidden', true);
            this._elements.statusLabel.classList.toggle('hidden', true);
            this._elements.statusToolbar.classList.add('hidden');
            this._elements.feedbackToolbar.classList.add('hidden');
            this.updateInfo('');
            this.hideCreatePreview();
            this.hideEditsPreview();
            this._onDidChangeHeight.fire();
        }
        focus() {
            this._inputEditor.focus();
        }
        hasFocus() {
            return this.domNode.contains((0, dom_1.getActiveElement)());
        }
        // --- preview
        async showEditsPreview(textModel0, textModelN) {
            this._elements.previewDiff.classList.remove('hidden');
            const diff = await this._editorWorkerService.computeDiff(textModel0.uri, textModelN.uri, { ignoreTrimWhitespace: false, maxComputationTimeMs: 5000, computeMoves: false }, 'advanced');
            if (!diff || diff.changes.length === 0) {
                this.hideEditsPreview();
                return;
            }
            this._previewDiffEditor.value.setModel({ original: textModel0, modified: textModelN });
            // joined ranges
            let originalLineRange = diff.changes[0].original;
            let modifiedLineRange = diff.changes[0].modified;
            for (let i = 1; i < diff.changes.length; i++) {
                originalLineRange = originalLineRange.join(diff.changes[i].original);
                modifiedLineRange = modifiedLineRange.join(diff.changes[i].modified);
            }
            // apply extra padding
            const pad = 3;
            const newStartLine = Math.max(1, originalLineRange.startLineNumber - pad);
            modifiedLineRange = new lineRange_1.LineRange(newStartLine, modifiedLineRange.endLineNumberExclusive);
            originalLineRange = new lineRange_1.LineRange(newStartLine, originalLineRange.endLineNumberExclusive);
            const newEndLineModified = Math.min(modifiedLineRange.endLineNumberExclusive + pad, textModelN.getLineCount());
            modifiedLineRange = new lineRange_1.LineRange(modifiedLineRange.startLineNumber, newEndLineModified);
            const newEndLineOriginal = Math.min(originalLineRange.endLineNumberExclusive + pad, textModel0.getLineCount());
            originalLineRange = new lineRange_1.LineRange(originalLineRange.startLineNumber, newEndLineOriginal);
            const hiddenOriginal = (0, utils_1.invertLineRange)(originalLineRange, textModel0);
            const hiddenModified = (0, utils_1.invertLineRange)(modifiedLineRange, textModelN);
            this._previewDiffEditor.value.getOriginalEditor().setHiddenAreas(hiddenOriginal.map(lr => (0, utils_1.asRange)(lr, textModel0)), 'diff-hidden');
            this._previewDiffEditor.value.getModifiedEditor().setHiddenAreas(hiddenModified.map(lr => (0, utils_1.asRange)(lr, textModelN)), 'diff-hidden');
            this._previewDiffEditor.value.revealLine(modifiedLineRange.startLineNumber, 1 /* ScrollType.Immediate */);
            this._onDidChangeHeight.fire();
        }
        hideEditsPreview() {
            this._elements.previewDiff.classList.add('hidden');
            if (this._previewDiffEditor.hasValue) {
                this._previewDiffEditor.value.setModel(null);
            }
            this._previewDiffModel.clear();
            this._onDidChangeHeight.fire();
        }
        async showCreatePreview(model) {
            this._elements.previewCreateTitle.classList.remove('hidden');
            this._elements.previewCreate.classList.remove('hidden');
            const ref = await this._textModelResolverService.createModelReference(model.resource);
            this._previewCreateDispoable.value = ref;
            this._previewCreateTitle.element.setFile(model.resource, { fileKind: files_1.FileKind.FILE });
            this._previewCreateEditor.value.setModel(ref.object.textEditorModel);
            this._onDidChangeHeight.fire();
        }
        hideCreatePreview() {
            this._elements.previewCreateTitle.classList.add('hidden');
            this._elements.previewCreate.classList.add('hidden');
            this._previewCreateEditor.rawValue?.setModel(null);
            this._previewCreateDispoable.clear();
            this._previewCreateTitle.element.clear();
            this._onDidChangeHeight.fire();
        }
        showsAnyPreview() {
            return !this._elements.previewDiff.classList.contains('hidden') ||
                !this._elements.previewCreate.classList.contains('hidden');
        }
        // --- slash commands
        updateSlashCommands(commands) {
            this._slashCommands.clear();
            if (commands.length === 0) {
                return;
            }
            this._slashCommandDetails = commands.filter(c => c.command && c.detail).map(c => { return { command: c.command, detail: c.detail }; });
            const selector = { scheme: this._inputModel.uri.scheme, pattern: this._inputModel.uri.path, language: this._inputModel.getLanguageId() };
            this._slashCommands.add(this._languageFeaturesService.completionProvider.register(selector, new class {
                constructor() {
                    this._debugDisplayName = 'InlineChatSlashCommandProvider';
                    this.triggerCharacters = ['/'];
                }
                provideCompletionItems(_model, position) {
                    if (position.lineNumber !== 1 && position.column !== 1) {
                        return undefined;
                    }
                    const suggestions = commands.map(command => {
                        const withSlash = `/${command.command}`;
                        return {
                            label: { label: withSlash, description: command.detail },
                            insertText: `${withSlash} $0`,
                            insertTextRules: 4 /* CompletionItemInsertTextRule.InsertAsSnippet */,
                            kind: 18 /* CompletionItemKind.Text */,
                            range: new range_1.Range(1, 1, 1, 1),
                            command: command.executeImmediately ? { id: 'inlineChat.accept', title: withSlash } : undefined
                        };
                    });
                    return { suggestions };
                }
            }));
            const decorations = this._inputEditor.createDecorationsCollection();
            const updateSlashDecorations = () => {
                this._slashCommandContentWidget.hide();
                this._elements.detectedIntent.classList.toggle('hidden', true);
                const newDecorations = [];
                for (const command of commands) {
                    const withSlash = `/${command.command}`;
                    const firstLine = this._inputModel.getLineContent(1);
                    if (firstLine.startsWith(withSlash)) {
                        newDecorations.push({
                            range: new range_1.Range(1, 1, 1, withSlash.length + 1),
                            options: {
                                description: 'inline-chat-slash-command',
                                inlineClassName: 'inline-chat-slash-command',
                                after: {
                                    // Force some space between slash command and placeholder
                                    content: ' '
                                }
                            }
                        });
                        this._slashCommandContentWidget.setCommandText(command.command);
                        this._slashCommandContentWidget.show();
                        // inject detail when otherwise empty
                        if (firstLine === `/${command.command}`) {
                            newDecorations.push({
                                range: new range_1.Range(1, withSlash.length + 1, 1, withSlash.length + 2),
                                options: {
                                    description: 'inline-chat-slash-command-detail',
                                    after: {
                                        content: `${command.detail}`,
                                        inlineClassName: 'inline-chat-slash-command-detail'
                                    }
                                }
                            });
                        }
                        break;
                    }
                }
                decorations.set(newDecorations);
            };
            this._slashCommands.add(this._inputEditor.onDidChangeModelContent(updateSlashDecorations));
            updateSlashDecorations();
        }
    };
    exports.InlineChatWidget = InlineChatWidget;
    exports.InlineChatWidget = InlineChatWidget = InlineChatWidget_1 = __decorate([
        __param(2, model_1.IModelService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, languageFeatures_1.ILanguageFeaturesService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, accessibility_1.IAccessibilityService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, accessibleView_1.IAccessibleViewService),
        __param(10, editorWorker_1.IEditorWorkerService),
        __param(11, log_1.ILogService),
        __param(12, resolverService_1.ITextModelService),
        __param(13, chatAgents_1.IChatAgentService)
    ], InlineChatWidget);
    let InlineChatZoneWidget = class InlineChatZoneWidget extends zoneWidget_1.ZoneWidget {
        constructor(editor, _instaService, contextKeyService) {
            super(editor, { showFrame: false, showArrow: false, isAccessible: true, className: 'inline-chat-widget', keepEditorSelection: true, showInHiddenAreas: true, ordinal: 10000 });
            this._instaService = _instaService;
            this._ctxVisible = inlineChat_1.CTX_INLINE_CHAT_VISIBLE.bindTo(contextKeyService);
            this._ctxCursorPosition = inlineChat_1.CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.bindTo(contextKeyService);
            this._disposables.add((0, lifecycle_1.toDisposable)(() => {
                this._ctxVisible.reset();
                this._ctxCursorPosition.reset();
            }));
            this.widget = this._instaService.createInstance(InlineChatWidget, this.editor, {
                menuId: inlineChat_1.MENU_INLINE_CHAT_INPUT,
                widgetMenuId: inlineChat_1.MENU_INLINE_CHAT_WIDGET,
                statusMenuId: inlineChat_1.MENU_INLINE_CHAT_WIDGET_STATUS,
                feedbackMenuId: inlineChat_1.MENU_INLINE_CHAT_WIDGET_FEEDBACK
            });
            this._disposables.add(this.widget.onDidChangeHeight(() => this._relayout()));
            this._disposables.add(this.widget);
            this.create();
            this._disposables.add((0, dom_1.addDisposableListener)(this.domNode, 'click', e => {
                if (!this.widget.hasFocus()) {
                    this.widget.focus();
                }
            }, true));
            // todo@jrieken listen ONLY when showing
            const updateCursorIsAboveContextKey = () => {
                if (!this.position || !this.editor.hasModel()) {
                    this._ctxCursorPosition.reset();
                }
                else if (this.position.lineNumber === this.editor.getPosition().lineNumber) {
                    this._ctxCursorPosition.set('above');
                }
                else if (this.position.lineNumber + 1 === this.editor.getPosition().lineNumber) {
                    this._ctxCursorPosition.set('below');
                }
                else {
                    this._ctxCursorPosition.reset();
                }
            };
            this._disposables.add(this.editor.onDidChangeCursorPosition(e => updateCursorIsAboveContextKey()));
            this._disposables.add(this.editor.onDidFocusEditorText(e => updateCursorIsAboveContextKey()));
            updateCursorIsAboveContextKey();
        }
        _fillContainer(container) {
            container.appendChild(this.widget.domNode);
        }
        _doLayout(heightInPixel) {
            const maxWidth = !this.widget.showsAnyPreview() ? 640 : Number.MAX_SAFE_INTEGER;
            const width = Math.min(maxWidth, this._availableSpaceGivenIndentation(this._indentationWidth));
            this._dimension = new dom_1.Dimension(width, heightInPixel);
            this.widget.domNode.style.width = `${width}px`;
            this.widget.layout(this._dimension);
        }
        _availableSpaceGivenIndentation(indentationWidth) {
            const info = this.editor.getLayoutInfo();
            return info.contentWidth - (info.glyphMarginWidth + info.decorationsWidth + (indentationWidth ?? 0));
        }
        _computeHeightInLines() {
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            return this.widget.getHeight() / lineHeight;
        }
        _relayout() {
            if (this._dimension) {
                this._doLayout(this._dimension.height);
            }
            super._relayout(this._computeHeightInLines());
        }
        show(position) {
            super.show(position, this._computeHeightInLines());
            this.widget.focus();
            this._ctxVisible.set(true);
        }
        _getWidth(info) {
            return info.width - info.minimap.minimapWidth;
        }
        updateBackgroundColor(newPosition, wholeRange) {
            (0, types_1.assertType)(this.container);
            const widgetLineNumber = newPosition.lineNumber;
            this.container.classList.toggle('inside-selection', widgetLineNumber > wholeRange.startLineNumber && widgetLineNumber < wholeRange.endLineNumber);
        }
        _calculateIndentationWidth(position) {
            const viewModel = this.editor._getViewModel();
            if (!viewModel) {
                return 0;
            }
            const visibleRange = viewModel.getCompletelyVisibleViewRange();
            const startLineVisibleRange = visibleRange.startLineNumber;
            const positionLine = position.lineNumber;
            let indentationLineNumber;
            let indentationLevel;
            for (let lineNumber = positionLine; lineNumber >= startLineVisibleRange; lineNumber--) {
                const currentIndentationLevel = viewModel.getLineFirstNonWhitespaceColumn(lineNumber);
                if (currentIndentationLevel !== 0) {
                    indentationLineNumber = lineNumber;
                    indentationLevel = currentIndentationLevel;
                    break;
                }
            }
            return this.editor.getOffsetForColumn(indentationLineNumber ?? positionLine, indentationLevel ?? viewModel.getLineFirstNonWhitespaceColumn(positionLine));
        }
        setContainerMargins() {
            (0, types_1.assertType)(this.container);
            const info = this.editor.getLayoutInfo();
            const marginWithoutIndentation = info.glyphMarginWidth + info.decorationsWidth + info.lineNumbersWidth;
            this.container.style.marginLeft = `${marginWithoutIndentation}px`;
        }
        setWidgetMargins(position) {
            const indentationWidth = this._calculateIndentationWidth(position);
            if (this._indentationWidth === indentationWidth) {
                return;
            }
            this._indentationWidth = this._availableSpaceGivenIndentation(indentationWidth) > 400 ? indentationWidth : 0;
            this.widget.domNode.style.marginLeft = `${this._indentationWidth}px`;
            this.widget.domNode.style.marginRight = `${this.editor.getLayoutInfo().minimap.minimapWidth}px`;
        }
        hide() {
            this.container.classList.remove('inside-selection');
            this._ctxVisible.reset();
            this._ctxCursorPosition.reset();
            this.widget.reset();
            super.hide();
            aria.status((0, nls_1.localize)('inlineChatClosed', 'Closed inline chat widget'));
        }
    };
    exports.InlineChatZoneWidget = InlineChatZoneWidget;
    exports.InlineChatZoneWidget = InlineChatZoneWidget = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextkey_1.IContextKeyService)
    ], InlineChatZoneWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvaW5saW5lQ2hhdC9icm93c2VyL2lubGluZUNoYXRXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdFaEcsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUV4RCxRQUFBLG1CQUFtQixHQUErQjtRQUM5RCxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7UUFDOUIsa0JBQWtCLEVBQUUsQ0FBQztRQUNyQixXQUFXLEVBQUUsS0FBSztRQUNsQixXQUFXLEVBQUUsS0FBSztRQUNsQixPQUFPLEVBQUUsS0FBSztRQUNkLHlCQUF5QixFQUFFLElBQUk7UUFDL0IsbUJBQW1CLEVBQUUsS0FBSztRQUMxQixrQkFBa0IsRUFBRSxLQUFLO1FBQ3pCLFNBQVMsRUFBRTtZQUNWLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFVBQVUsRUFBRSxNQUFNO1lBQ2xCLHVCQUF1QixFQUFFLEtBQUs7U0FDOUI7UUFDRCxvQkFBb0IsRUFBRSxDQUFDO1FBQ3ZCLG1CQUFtQixFQUFFLEtBQUs7UUFDMUIsb0JBQW9CLEVBQUUsS0FBSztRQUMzQixtQkFBbUIsRUFBRSxNQUFNO1FBQzNCLG9CQUFvQixFQUFFLElBQUk7UUFDMUIsV0FBVyxFQUFFLEtBQUs7UUFDbEIsNEJBQTRCLEVBQUUsQ0FBQztRQUMvQixPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO1FBQzNCLE1BQU0sRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUU7UUFDOUIsTUFBTSxFQUFFLEVBQUU7UUFD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
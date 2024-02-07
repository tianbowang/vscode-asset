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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/widget", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/editor/contrib/find/browser/findModel", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/themables", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/search/common/constants", "vs/platform/accessibility/common/accessibility", "vs/base/common/platform", "vs/base/browser/ui/toggle/toggle", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/searchEditor/browser/constants", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/notebook/browser/contrib/find/findFilters", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/search/browser/searchFindInput"], function (require, exports, dom, actionbar_1, button_1, inputBox_1, widget_1, actions_1, async_1, event_1, findModel_1, nls, clipboardService_1, configuration_1, contextkey_1, contextView_1, keybinding_1, keybindingsRegistry_1, themables_1, contextScopedHistoryWidget_1, searchActionsBase_1, Constants, accessibility_1, platform_1, toggle_1, viewsService_1, searchIcons_1, constants_1, historyWidgetKeybindingHint_1, defaultStyles_1, findFilters_1, instantiation_1, editorService_1, notebookEditorInput_1, searchFindInput_1) {
    "use strict";
    var SearchWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerContributions = exports.SearchWidget = void 0;
    /** Specified in searchview.css */
    const SingleLineInputHeight = 26;
    class ReplaceAllAction extends actions_1.Action {
        static { this.ID = 'search.action.replaceAll'; }
        constructor(_searchWidget) {
            super(ReplaceAllAction.ID, '', themables_1.ThemeIcon.asClassName(searchIcons_1.searchReplaceAllIcon), false);
            this._searchWidget = _searchWidget;
        }
        set searchWidget(searchWidget) {
            this._searchWidget = searchWidget;
        }
        run() {
            if (this._searchWidget) {
                return this._searchWidget.triggerReplaceAll();
            }
            return Promise.resolve(null);
        }
    }
    const ctrlKeyMod = (platform_1.isMacintosh ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */);
    function stopPropagationForMultiLineUpwards(event, value, textarea) {
        const isMultiline = !!value.match(/\n/);
        if (textarea && (isMultiline || textarea.clientHeight > SingleLineInputHeight) && textarea.selectionStart > 0) {
            event.stopPropagation();
            return;
        }
    }
    function stopPropagationForMultiLineDownwards(event, value, textarea) {
        const isMultiline = !!value.match(/\n/);
        if (textarea && (isMultiline || textarea.clientHeight > SingleLineInputHeight) && textarea.selectionEnd < textarea.value.length) {
            event.stopPropagation();
            return;
        }
    }
    let SearchWidget = class SearchWidget extends widget_1.Widget {
        static { SearchWidget_1 = this; }
        static { this.INPUT_MAX_HEIGHT = 134; }
        static { this.REPLACE_ALL_DISABLED_LABEL = nls.localize('search.action.replaceAll.disabled.label', "Replace All (Submit Search to Enable)"); }
        static { this.REPLACE_ALL_ENABLED_LABEL = (keyBindingService2) => {
            const kb = keyBindingService2.lookupKeybinding(ReplaceAllAction.ID);
            return (0, searchActionsBase_1.appendKeyBindingLabel)(nls.localize('search.action.replaceAll.enabled.label', "Replace All"), kb);
        }; }
        constructor(container, options, contextViewService, contextKeyService, keybindingService, clipboardServce, configurationService, accessibilityService, contextMenuService, instantiationService, editorService) {
            super();
            this.contextViewService = contextViewService;
            this.contextKeyService = contextKeyService;
            this.keybindingService = keybindingService;
            this.clipboardServce = clipboardServce;
            this.configurationService = configurationService;
            this.accessibilityService = accessibilityService;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.ignoreGlobalFindBufferOnNextFocus = false;
            this.previousGlobalFindBufferValue = null;
            this._onSearchSubmit = this._register(new event_1.Emitter());
            this.onSearchSubmit = this._onSearchSubmit.event;
            this._onSearchCancel = this._register(new event_1.Emitter());
            this.onSearchCancel = this._onSearchCancel.event;
            this._onReplaceToggled = this._register(new event_1.Emitter());
            this.onReplaceToggled = this._onReplaceToggled.event;
            this._onReplaceStateChange = this._register(new event_1.Emitter());
            this.onReplaceStateChange = this._onReplaceStateChange.event;
            this._onPreserveCaseChange = this._register(new event_1.Emitter());
            this.onPreserveCaseChange = this._onPreserveCaseChange.event;
            this._onReplaceValueChanged = this._register(new event_1.Emitter());
            this.onReplaceValueChanged = this._onReplaceValueChanged.event;
            this._onReplaceAll = this._register(new event_1.Emitter());
            this.onReplaceAll = this._onReplaceAll.event;
            this._onBlur = this._register(new event_1.Emitter());
            this.onBlur = this._onBlur.event;
            this._onDidHeightChange = this._register(new event_1.Emitter());
            this.onDidHeightChange = this._onDidHeightChange.event;
            this._onDidToggleContext = new event_1.Emitter();
            this.onDidToggleContext = this._onDidToggleContext.event;
            this.replaceActive = Constants.ReplaceActiveKey.bindTo(this.contextKeyService);
            this.searchInputBoxFocused = Constants.SearchInputBoxFocusedKey.bindTo(this.contextKeyService);
            this.replaceInputBoxFocused = Constants.ReplaceInputBoxFocusedKey.bindTo(this.contextKeyService);
            const notebookOptions = options.notebookOptions ??
                {
                    isInNotebookMarkdownInput: true,
                    isInNotebookMarkdownPreview: true,
                    isInNotebookCellInput: true,
                    isInNotebookCellOutput: true
                };
            this._notebookFilters = this._register(new findFilters_1.NotebookFindFilters(notebookOptions.isInNotebookMarkdownInput, notebookOptions.isInNotebookMarkdownPreview, notebookOptions.isInNotebookCellInput, notebookOptions.isInNotebookCellOutput));
            this._register(this._notebookFilters.onDidChange(() => {
                if (this.searchInput instanceof searchFindInput_1.SearchFindInput) {
                    this.searchInput.updateStyles();
                }
            }));
            this._register(this.editorService.onDidEditorsChange((e) => {
                if (this.searchInput instanceof searchFindInput_1.SearchFindInput &&
                    e.event.editor instanceof notebookEditorInput_1.NotebookEditorInput &&
                    (e.event.kind === 4 /* GroupModelChangeKind.EDITOR_OPEN */ || e.event.kind === 5 /* GroupModelChangeKind.EDITOR_CLOSE */)) {
                    this.searchInput.filterVisible = this._hasNotebookOpen();
                }
            }));
            this._replaceHistoryDelayer = new async_1.Delayer(500);
            this.render(container, options);
            this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.accessibilitySupport')) {
                    this.updateAccessibilitySupport();
                }
            });
            this.accessibilityService.onDidChangeScreenReaderOptimized(() => this.updateAccessibilitySupport());
            this.updateAccessibilitySupport();
        }
        _hasNotebookOpen() {
            const editors = this.editorService.editors;
            return editors.some(editor => editor instanceof notebookEditorInput_1.NotebookEditorInput);
        }
        getNotebookFilters() {
            return this._notebookFilters;
        }
        focus(select = true, focusReplace = false, suppressGlobalSearchBuffer = false) {
            this.ignoreGlobalFindBufferOnNextFocus = suppressGlobalSearchBuffer;
            if (focusReplace && this.isReplaceShown()) {
                if (this.replaceInput) {
                    this.replaceInput.focus();
                    if (select) {
                        this.replaceInput.select();
                    }
                }
            }
            else {
                if (this.searchInput) {
                    this.searchInput.focus();
                    if (select) {
                        this.searchInput.select();
                    }
                }
            }
        }
        setWidth(width) {
            this.searchInput?.inputBox.layout();
            if (this.replaceInput) {
                this.replaceInput.width = width - 28;
                this.replaceInput.inputBox.layout();
            }
        }
        clear() {
            this.searchInput?.clear();
            this.replaceInput?.setValue('');
            this.setReplaceAllActionState(false);
        }
        isReplaceShown() {
            return this.replaceContainer ? !this.replaceContainer.classList.contains('disabled') : false;
        }
        isReplaceActive() {
            return !!this.replaceActive.get();
        }
        getReplaceValue() {
            return this.replaceInput?.getValue() ?? '';
        }
        toggleReplace(show) {
            if (show === undefined || show !== this.isReplaceShown()) {
                this.onToggleReplaceButton();
            }
        }
        getSearchHistory() {
            return this.searchInput?.inputBox.getHistory() ?? [];
        }
        getReplaceHistory() {
            return this.replaceInput?.inputBox.getHistory() ?? [];
        }
        prependSearchHistory(history) {
            this.searchInput?.inputBox.prependHistory(history);
        }
        prependReplaceHistory(history) {
            this.replaceInput?.inputBox.prependHistory(history);
        }
        clearHistory() {
            this.searchInput?.inputBox.clearHistory();
            this.replaceInput?.inputBox.clearHistory();
        }
        showNextSearchTerm() {
            this.searchInput?.inputBox.showNextValue();
        }
        showPreviousSearchTerm() {
            this.searchInput?.inputBox.showPreviousValue();
        }
        showNextReplaceTerm() {
            this.replaceInput?.inputBox.showNextValue();
        }
        showPreviousReplaceTerm() {
            this.replaceInput?.inputBox.showPreviousValue();
        }
        searchInputHasFocus() {
            return !!this.searchInputBoxFocused.get();
        }
        replaceInputHasFocus() {
            return !!this.replaceInput?.inputBox.hasFocus();
        }
        focusReplaceAllAction() {
            this.replaceActionBar?.focus(true);
        }
        focusRegexAction() {
            this.searchInput?.focusOnRegex();
        }
        render(container, options) {
            this.domNode = dom.append(container, dom.$('.search-widget'));
            this.domNode.style.position = 'relative';
            if (!options._hideReplaceToggle) {
                this.renderToggleReplaceButton(this.domNode);
            }
            this.renderSearchInput(this.domNode, options);
            this.renderReplaceInput(this.domNode, options);
        }
        updateAccessibilitySupport() {
            this.searchInput?.setFocusInputOnOptionClick(!this.accessibilityService.isScreenReaderOptimized());
        }
        renderToggleReplaceButton(parent) {
            const opts = {
                buttonBackground: undefined,
                buttonBorder: undefined,
                buttonForeground: undefined,
                buttonHoverBackground: undefined,
                buttonSecondaryBackground: undefined,
                buttonSecondaryForeground: undefined,
                buttonSecondaryHoverBackground: undefined,
                buttonSeparator: undefined
            };
            this.toggleReplaceButton = this._register(new button_1.Button(parent, opts));
            this.toggleReplaceButton.element.setAttribute('aria-expanded', 'false');
            this.toggleReplaceButton.element.classList.add('toggle-replace-button');
            this.toggleReplaceButton.icon = searchIcons_1.searchHideReplaceIcon;
            // TODO@joao need to dispose this listener eventually
            this.toggleReplaceButton.onDidClick(() => this.onToggleReplaceButton());
            this.toggleReplaceButton.element.title = nls.localize('search.replace.toggle.button.title', "Toggle Replace");
        }
        renderSearchInput(parent, options) {
            const inputOptions = {
                label: nls.localize('label.Search', 'Search: Type Search Term and press Enter to search'),
                validation: (value) => this.validateSearchInput(value),
                placeholder: nls.localize('search.placeHolder', "Search"),
                appendCaseSensitiveLabel: (0, searchActionsBase_1.appendKeyBindingLabel)('', this.keybindingService.lookupKeybinding(Constants.ToggleCaseSensitiveCommandId)),
                appendWholeWordsLabel: (0, searchActionsBase_1.appendKeyBindingLabel)('', this.keybindingService.lookupKeybinding(Constants.ToggleWholeWordCommandId)),
                appendRegexLabel: (0, searchActionsBase_1.appendKeyBindingLabel)('', this.keybindingService.lookupKeybinding(Constants.ToggleRegexCommandId)),
                history: options.searchHistory,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this.keybindingService),
                flexibleHeight: true,
                flexibleMaxHeight: SearchWidget_1.INPUT_MAX_HEIGHT,
                showCommonFindToggles: true,
                inputBoxStyles: options.inputBoxStyles,
                toggleStyles: options.toggleStyles
            };
            const searchInputContainer = dom.append(parent, dom.$('.search-container.input-box'));
            this.searchInput = this._register(new searchFindInput_1.SearchFindInput(searchInputContainer, this.contextViewService, inputOptions, this.contextKeyService, this.contextMenuService, this.instantiationService, this._notebookFilters, this._hasNotebookOpen()));
            this.searchInput.onKeyDown((keyboardEvent) => this.onSearchInputKeyDown(keyboardEvent));
            this.searchInput.setValue(options.value || '');
            this.searchInput.setRegex(!!options.isRegex);
            this.searchInput.setCaseSensitive(!!options.isCaseSensitive);
            this.searchInput.setWholeWords(!!options.isWholeWords);
            this._register(this.searchInput.onCaseSensitiveKeyDown((keyboardEvent) => this.onCaseSensitiveKeyDown(keyboardEvent)));
            this._register(this.searchInput.onRegexKeyDown((keyboardEvent) => this.onRegexKeyDown(keyboardEvent)));
            this._register(this.searchInput.inputBox.onDidChange(() => this.onSearchInputChanged()));
            this._register(this.searchInput.inputBox.onDidHeightChange(() => this._onDidHeightChange.fire()));
            this._register(this.onReplaceValueChanged(() => {
                this._replaceHistoryDelayer.trigger(() => this.replaceInput?.inputBox.addToHistory());
            }));
            this.searchInputFocusTracker = this._register(dom.trackFocus(this.searchInput.inputBox.inputElement));
            this._register(this.searchInputFocusTracker.onDidFocus(async () => {
                this.searchInputBoxFocused.set(true);
                const useGlobalFindBuffer = this.searchConfiguration.globalFindClipboard;
                if (!this.ignoreGlobalFindBufferOnNextFocus && useGlobalFindBuffer) {
                    const globalBufferText = await this.clipboardServce.readFindText();
                    if (globalBufferText && this.previousGlobalFindBufferValue !== globalBufferText) {
                        this.searchInput?.inputBox.addToHistory();
                        this.searchInput?.setValue(globalBufferText);
                        this.searchInput?.select();
                    }
                    this.previousGlobalFindBufferValue = globalBufferText;
                }
                this.ignoreGlobalFindBufferOnNextFocus = false;
            }));
            this._register(this.searchInputFocusTracker.onDidBlur(() => this.searchInputBoxFocused.set(false)));
            this.showContextToggle = new toggle_1.Toggle({
                isChecked: false,
                title: (0, searchActionsBase_1.appendKeyBindingLabel)(nls.localize('showContext', "Toggle Context Lines"), this.keybindingService.lookupKeybinding(constants_1.ToggleSearchEditorContextLinesCommandId)),
                icon: searchIcons_1.searchShowContextIcon,
                ...defaultStyles_1.defaultToggleStyles
            });
            this._register(this.showContextToggle.onChange(() => this.onContextLinesChanged()));
            if (options.showContextToggle) {
                this.contextLinesInput = new inputBox_1.InputBox(searchInputContainer, this.contextViewService, { type: 'number', inputBoxStyles: defaultStyles_1.defaultInputBoxStyles });
                this.contextLinesInput.element.classList.add('context-lines-input');
                this.contextLinesInput.value = '' + (this.configurationService.getValue('search').searchEditor.defaultNumberOfContextLines ?? 1);
                this._register(this.contextLinesInput.onDidChange((value) => {
                    if (value !== '0') {
                        this.showContextToggle.checked = true;
                    }
                    this.onContextLinesChanged();
                }));
                dom.append(searchInputContainer, this.showContextToggle.domNode);
            }
        }
        onContextLinesChanged() {
            this._onDidToggleContext.fire();
            if (this.contextLinesInput.value.includes('-')) {
                this.contextLinesInput.value = '0';
            }
            this._onDidToggleContext.fire();
        }
        setContextLines(lines) {
            if (!this.contextLinesInput) {
                return;
            }
            if (lines === 0) {
                this.showContextToggle.checked = false;
            }
            else {
                this.showContextToggle.checked = true;
                this.contextLinesInput.value = '' + lines;
            }
        }
        renderReplaceInput(parent, options) {
            this.replaceContainer = dom.append(parent, dom.$('.replace-container.disabled'));
            const replaceBox = dom.append(this.replaceContainer, dom.$('.replace-input'));
            this.replaceInput = this._register(new contextScopedHistoryWidget_1.ContextScopedReplaceInput(replaceBox, this.contextViewService, {
                label: nls.localize('label.Replace', 'Replace: Type replace term and press Enter to preview'),
                placeholder: nls.localize('search.replace.placeHolder', "Replace"),
                appendPreserveCaseLabel: (0, searchActionsBase_1.appendKeyBindingLabel)('', this.keybindingService.lookupKeybinding(Constants.TogglePreserveCaseId)),
                history: options.replaceHistory,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this.keybindingService),
                flexibleHeight: true,
                flexibleMaxHeight: SearchWidget_1.INPUT_MAX_HEIGHT,
                inputBoxStyles: options.inputBoxStyles,
                toggleStyles: options.toggleStyles
            }, this.contextKeyService, true));
            this._register(this.replaceInput.onDidOptionChange(viaKeyboard => {
                if (!viaKeyboard) {
                    if (this.replaceInput) {
                        this._onPreserveCaseChange.fire(this.replaceInput.getPreserveCase());
                    }
                }
            }));
            this.replaceInput.onKeyDown((keyboardEvent) => this.onReplaceInputKeyDown(keyboardEvent));
            this.replaceInput.setValue(options.replaceValue || '');
            this._register(this.replaceInput.inputBox.onDidChange(() => this._onReplaceValueChanged.fire()));
            this._register(this.replaceInput.inputBox.onDidHeightChange(() => this._onDidHeightChange.fire()));
            this.replaceAllAction = new ReplaceAllAction(this);
            this.replaceAllAction.label = SearchWidget_1.REPLACE_ALL_DISABLED_LABEL;
            this.replaceActionBar = this._register(new actionbar_1.ActionBar(this.replaceContainer));
            this.replaceActionBar.push([this.replaceAllAction], { icon: true, label: false });
            this.onkeydown(this.replaceActionBar.domNode, (keyboardEvent) => this.onReplaceActionbarKeyDown(keyboardEvent));
            this.replaceInputFocusTracker = this._register(dom.trackFocus(this.replaceInput.inputBox.inputElement));
            this._register(this.replaceInputFocusTracker.onDidFocus(() => this.replaceInputBoxFocused.set(true)));
            this._register(this.replaceInputFocusTracker.onDidBlur(() => this.replaceInputBoxFocused.set(false)));
            this._register(this.replaceInput.onPreserveCaseKeyDown((keyboardEvent) => this.onPreserveCaseKeyDown(keyboardEvent)));
        }
        triggerReplaceAll() {
            this._onReplaceAll.fire();
            return Promise.resolve(null);
        }
        onToggleReplaceButton() {
            this.replaceContainer?.classList.toggle('disabled');
            if (this.isReplaceShown()) {
                this.toggleReplaceButton?.element.classList.remove(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.searchHideReplaceIcon));
                this.toggleReplaceButton?.element.classList.add(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.searchShowReplaceIcon));
            }
            else {
                this.toggleReplaceButton?.element.classList.remove(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.searchShowReplaceIcon));
                this.toggleReplaceButton?.element.classList.add(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.searchHideReplaceIcon));
            }
            this.toggleReplaceButton?.element.setAttribute('aria-expanded', this.isReplaceShown() ? 'true' : 'false');
            this.updateReplaceActiveState();
            this._onReplaceToggled.fire();
        }
        setValue(value) {
            this.searchInput?.setValue(value);
        }
        setReplaceAllActionState(enabled) {
            if (this.replaceAllAction && (this.replaceAllAction.enabled !== enabled)) {
                this.replaceAllAction.enabled = enabled;
                this.replaceAllAction.label = enabled ? SearchWidget_1.REPLACE_ALL_ENABLED_LABEL(this.keybindingService) : SearchWidget_1.REPLACE_ALL_DISABLED_LABEL;
                this.updateReplaceActiveState();
            }
        }
        updateReplaceActiveState() {
            const currentState = this.isReplaceActive();
            const newState = this.isReplaceShown() && !!this.replaceAllAction?.enabled;
            if (currentState !== newState) {
                this.replaceActive.set(newState);
                this._onReplaceStateChange.fire(newState);
                this.replaceInput?.inputBox.layout();
            }
        }
        validateSearchInput(value) {
            if (value.length === 0) {
                return null;
            }
            if (!(this.searchInput?.getRegex())) {
                return null;
            }
            try {
                new RegExp(value, 'u');
            }
            catch (e) {
                return { content: e.message };
            }
            return null;
        }
        onSearchInputChanged() {
            this.searchInput?.clearMessage();
            this.setReplaceAllActionState(false);
            if (this.searchConfiguration.searchOnType) {
                if (this.searchInput?.getRegex()) {
                    try {
                        const regex = new RegExp(this.searchInput.getValue(), 'ug');
                        const matchienessHeuristic = `
								~!@#$%^&*()_+
								\`1234567890-=
								qwertyuiop[]\\
								QWERTYUIOP{}|
								asdfghjkl;'
								ASDFGHJKL:"
								zxcvbnm,./
								ZXCVBNM<>? `.match(regex)?.length ?? 0;
                        const delayMultiplier = matchienessHeuristic < 50 ? 1 :
                            matchienessHeuristic < 100 ? 5 : // expressions like `.` or `\w`
                                10; // only things matching empty string
                        this.submitSearch(true, this.searchConfiguration.searchOnTypeDebouncePeriod * delayMultiplier);
                    }
                    catch {
                        // pass
                    }
                }
                else {
                    this.submitSearch(true, this.searchConfiguration.searchOnTypeDebouncePeriod);
                }
            }
        }
        onSearchInputKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                this.searchInput?.inputBox.insertAtCursor('\n');
                keyboardEvent.preventDefault();
            }
            if (keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                this.searchInput?.onSearchSubmit();
                this.submitSearch();
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
                this._onSearchCancel.fire({ focus: true });
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                if (this.isReplaceShown()) {
                    this.replaceInput?.focus();
                }
                else {
                    this.searchInput?.focusOnCaseSensitive();
                }
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(16 /* KeyCode.UpArrow */)) {
                stopPropagationForMultiLineUpwards(keyboardEvent, this.searchInput?.getValue() ?? '', this.searchInput?.domNode.querySelector('textarea') ?? null);
            }
            else if (keyboardEvent.equals(18 /* KeyCode.DownArrow */)) {
                stopPropagationForMultiLineDownwards(keyboardEvent, this.searchInput?.getValue() ?? '', this.searchInput?.domNode.querySelector('textarea') ?? null);
            }
        }
        onCaseSensitiveKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                if (this.isReplaceShown()) {
                    this.replaceInput?.focus();
                    keyboardEvent.preventDefault();
                }
            }
        }
        onRegexKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                if (this.isReplaceShown()) {
                    this.replaceInput?.focusOnPreserve();
                    keyboardEvent.preventDefault();
                }
            }
        }
        onPreserveCaseKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                if (this.isReplaceActive()) {
                    this.focusReplaceAllAction();
                }
                else {
                    this._onBlur.fire();
                }
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this.focusRegexAction();
                keyboardEvent.preventDefault();
            }
        }
        onReplaceInputKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                this.replaceInput?.inputBox.insertAtCursor('\n');
                keyboardEvent.preventDefault();
            }
            if (keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                this.submitSearch();
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                this.searchInput?.focusOnCaseSensitive();
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this.searchInput?.focus();
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(16 /* KeyCode.UpArrow */)) {
                stopPropagationForMultiLineUpwards(keyboardEvent, this.replaceInput?.getValue() ?? '', this.replaceInput?.domNode.querySelector('textarea') ?? null);
            }
            else if (keyboardEvent.equals(18 /* KeyCode.DownArrow */)) {
                stopPropagationForMultiLineDownwards(keyboardEvent, this.replaceInput?.getValue() ?? '', this.replaceInput?.domNode.querySelector('textarea') ?? null);
            }
        }
        onReplaceActionbarKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this.focusRegexAction();
                keyboardEvent.preventDefault();
            }
        }
        async submitSearch(triggeredOnType = false, delay = 0) {
            this.searchInput?.validate();
            if (!this.searchInput?.inputBox.isInputValid()) {
                return;
            }
            const value = this.searchInput.getValue();
            const useGlobalFindBuffer = this.searchConfiguration.globalFindClipboard;
            if (value && useGlobalFindBuffer) {
                await this.clipboardServce.writeFindText(value);
            }
            this._onSearchSubmit.fire({ triggeredOnType, delay });
        }
        getContextLines() {
            return this.showContextToggle.checked ? +this.contextLinesInput.value : 0;
        }
        modifyContextLines(increase) {
            const current = +this.contextLinesInput.value;
            const modified = current + (increase ? 1 : -1);
            this.showContextToggle.checked = modified !== 0;
            this.contextLinesInput.value = '' + modified;
        }
        toggleContextLines() {
            this.showContextToggle.checked = !this.showContextToggle.checked;
            this.onContextLinesChanged();
        }
        dispose() {
            this.setReplaceAllActionState(false);
            super.dispose();
        }
        get searchConfiguration() {
            return this.configurationService.getValue('search');
        }
    };
    exports.SearchWidget = SearchWidget;
    exports.SearchWidget = SearchWidget = SearchWidget_1 = __decorate([
        __param(2, contextView_1.IContextViewService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, clipboardService_1.IClipboardService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, accessibility_1.IAccessibilityService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, editorService_1.IEditorService)
    ], SearchWidget);
    function registerContributions() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: ReplaceAllAction.ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, findModel_1.CONTEXT_FIND_WIDGET_NOT_VISIBLE),
            primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
            handler: accessor => {
                const viewsService = accessor.get(viewsService_1.IViewsService);
                if ((0, searchActionsBase_1.isSearchViewFocused)(viewsService)) {
                    const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
                    if (searchView) {
                        new ReplaceAllAction(searchView.searchAndReplaceWidget).run();
                    }
                }
            }
        });
    }
    exports.registerContributions = registerContributions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9zZWFyY2hXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBDaEcsa0NBQWtDO0lBQ2xDLE1BQU0scUJBQXFCLEdBQUcsRUFBRSxDQUFDO0lBeUJqQyxNQUFNLGdCQUFpQixTQUFRLGdCQUFNO2lCQUVwQixPQUFFLEdBQVcsMEJBQTBCLENBQUM7UUFFeEQsWUFBb0IsYUFBMkI7WUFDOUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0NBQW9CLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQURoRSxrQkFBYSxHQUFiLGFBQWEsQ0FBYztRQUUvQyxDQUFDO1FBRUQsSUFBSSxZQUFZLENBQUMsWUFBMEI7WUFDMUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFDbkMsQ0FBQztRQUVRLEdBQUc7WUFDWCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDL0MsQ0FBQztZQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDOztJQUdGLE1BQU0sVUFBVSxHQUFHLENBQUMsc0JBQVcsQ0FBQyxDQUFDLDBCQUFnQixDQUFDLDBCQUFlLENBQUMsQ0FBQztJQUVuRSxTQUFTLGtDQUFrQyxDQUFDLEtBQXFCLEVBQUUsS0FBYSxFQUFFLFFBQW9DO1FBQ3JILE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hD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
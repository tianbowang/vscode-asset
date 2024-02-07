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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInput", "vs/base/browser/ui/progressbar/progressbar", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/editor/contrib/find/browser/findState", "vs/editor/contrib/find/browser/findWidget", "vs/nls", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/editor/contrib/find/browser/replacePattern", "vs/base/common/codicons", "vs/platform/configuration/common/configuration", "vs/base/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/workbench/contrib/notebook/browser/contrib/find/findFilters", "vs/base/common/platform", "vs/base/browser/ui/sash/sash", "vs/platform/theme/browser/defaultStyles", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/css!./notebookFindReplaceWidget"], function (require, exports, dom, findInput_1, progressbar_1, widget_1, async_1, findState_1, findWidget_1, nls, contextScopedHistoryWidget_1, contextkey_1, contextView_1, iconRegistry_1, themeService_1, themables_1, replacePattern_1, codicons_1, configuration_1, actions_1, instantiation_1, menuEntryActionViewItem_1, dropdownActionViewItem_1, actionbar_1, extensionsIcons_1, findFilters_1, platform_1, sash_1, defaultStyles_1, lifecycle_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleFindReplaceWidget = exports.NotebookFindInput = exports.NotebookFindInputFilterButton = exports.findFilterButton = void 0;
    const NLS_FIND_INPUT_LABEL = nls.localize('label.find', "Find");
    const NLS_FIND_INPUT_PLACEHOLDER = nls.localize('placeholder.find', "Find");
    const NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize('label.previousMatchButton', "Previous Match");
    // const NLS_FILTER_BTN_LABEL = nls.localize('label.findFilterButton', "Search in View");
    const NLS_NEXT_MATCH_BTN_LABEL = nls.localize('label.nextMatchButton', "Next Match");
    const NLS_CLOSE_BTN_LABEL = nls.localize('label.closeButton', "Close");
    const NLS_TOGGLE_REPLACE_MODE_BTN_LABEL = nls.localize('label.toggleReplaceButton', "Toggle Replace");
    const NLS_REPLACE_INPUT_LABEL = nls.localize('label.replace', "Replace");
    const NLS_REPLACE_INPUT_PLACEHOLDER = nls.localize('placeholder.replace', "Replace");
    const NLS_REPLACE_BTN_LABEL = nls.localize('label.replaceButton', "Replace");
    const NLS_REPLACE_ALL_BTN_LABEL = nls.localize('label.replaceAllButton', "Replace All");
    exports.findFilterButton = (0, iconRegistry_1.registerIcon)('find-filter', codicons_1.Codicon.filter, nls.localize('findFilterIcon', 'Icon for Find Filter in find widget.'));
    const NOTEBOOK_FIND_FILTERS = nls.localize('notebook.find.filter.filterAction', "Find Filters");
    const NOTEBOOK_FIND_IN_MARKUP_INPUT = nls.localize('notebook.find.filter.findInMarkupInput', "Markdown Source");
    const NOTEBOOK_FIND_IN_MARKUP_PREVIEW = nls.localize('notebook.find.filter.findInMarkupPreview', "Rendered Markdown");
    const NOTEBOOK_FIND_IN_CODE_INPUT = nls.localize('notebook.find.filter.findInCodeInput', "Code Cell Source");
    const NOTEBOOK_FIND_IN_CODE_OUTPUT = nls.localize('notebook.find.filter.findInCodeOutput', "Code Cell Output");
    const NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH = 318;
    const NOTEBOOK_FIND_WIDGET_INITIAL_HORIZONTAL_PADDING = 4;
    let NotebookFindFilterActionViewItem = class NotebookFindFilterActionViewItem extends dropdownActionViewItem_1.DropdownMenuActionViewItem {
        constructor(filters, action, actionRunner, contextMenuService) {
            super(action, { getActions: () => this.getActions() }, contextMenuService, {
                actionRunner,
                classNames: action.class,
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
            });
            this.filters = filters;
        }
        render(container) {
            super.render(container);
            this.updateChecked();
        }
        getActions() {
            const markdownInput = {
                checked: this.filters.markupInput,
                class: undefined,
                enabled: true,
                id: 'findInMarkdownInput',
                label: NOTEBOOK_FIND_IN_MARKUP_INPUT,
                run: async () => {
                    this.filters.markupInput = !this.filters.markupInput;
                },
                tooltip: ''
            };
            const markdownPreview = {
                checked: this.filters.markupPreview,
                class: undefined,
                enabled: true,
                id: 'findInMarkdownInput',
                label: NOTEBOOK_FIND_IN_MARKUP_PREVIEW,
                run: async () => {
                    this.filters.markupPreview = !this.filters.markupPreview;
                },
                tooltip: ''
            };
            const codeInput = {
                checked: this.filters.codeInput,
                class: undefined,
                enabled: true,
                id: 'findInCodeInput',
                label: NOTEBOOK_FIND_IN_CODE_INPUT,
                run: async () => {
                    this.filters.codeInput = !this.filters.codeInput;
                },
                tooltip: ''
            };
            const codeOutput = {
                checked: this.filters.codeOutput,
                class: undefined,
                enabled: true,
                id: 'findInCodeOutput',
                label: NOTEBOOK_FIND_IN_CODE_OUTPUT,
                run: async () => {
                    this.filters.codeOutput = !this.filters.codeOutput;
                },
                tooltip: '',
                dispose: () => null
            };
            if (platform_1.isSafari) {
                return [
                    markdownInput,
                    codeInput
                ];
            }
            else {
                return [
                    markdownInput,
                    markdownPreview,
                    new actions_1.Separator(),
                    codeInput,
                    codeOutput,
                ];
            }
        }
        updateChecked() {
            this.element.classList.toggle('checked', this._action.checked);
        }
    };
    NotebookFindFilterActionViewItem = __decorate([
        __param(3, contextView_1.IContextMenuService)
    ], NotebookFindFilterActionViewItem);
    class NotebookFindInputFilterButton extends lifecycle_1.Disposable {
        constructor(filters, contextMenuService, instantiationService, options, tooltip = NOTEBOOK_FIND_FILTERS) {
            super();
            this.filters = filters;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this._actionbar = null;
            this._toggleStyles = options.toggleStyles;
            this._filtersAction = new actions_1.Action('notebookFindFilterAction', tooltip, 'notebook-filters ' + themables_1.ThemeIcon.asClassName(extensionsIcons_1.filterIcon));
            this._filtersAction.checked = false;
            this._filterButtonContainer = dom.$('.find-filter-button');
            this._filterButtonContainer.classList.add('monaco-custom-toggle');
            this.createFilters(this._filterButtonContainer);
        }
        get container() {
            return this._filterButtonContainer;
        }
        get width() {
            return 2 /*margin left*/ + 2 /*border*/ + 2 /*padding*/ + 16 /* icon width */;
        }
        applyStyles(filterChecked) {
            const toggleStyles = this._toggleStyles;
            this._filterButtonContainer.style.border = '1px solid transparent';
            this._filterButtonContainer.style.borderRadius = '3px';
            this._filterButtonContainer.style.borderColor = (filterChecked && toggleStyles.inputActiveOptionBorder) || '';
            this._filterButtonContainer.style.color = (filterChecked && toggleStyles.inputActiveOptionForeground) || 'inherit';
            this._filterButtonContainer.style.backgroundColor = (filterChecked && toggleStyles.inputActiveOptionBackground) || '';
        }
        createFilters(container) {
            this._actionbar = this._register(new actionbar_1.ActionBar(container, {
                actionViewItemProvider: action => {
                    if (action.id === this._filtersAction.id) {
                        return this.instantiationService.createInstance(NotebookFindFilterActionViewItem, this.filters, action, new actions_1.ActionRunner());
                    }
                    return undefined;
                }
            }));
            this._actionbar.push(this._filtersAction, { icon: true, label: false });
        }
    }
    exports.NotebookFindInputFilterButton = NotebookFindInputFilterButton;
    class NotebookFindInput extends findInput_1.FindInput {
        constructor(filters, contextKeyService, contextMenuService, instantiationService, parent, contextViewProvider, options) {
            super(parent, contextViewProvider, options);
            this.filters = filters;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this._filterChecked = false;
            this._register((0, contextScopedHistoryWidget_1.registerAndCreateHistoryNavigationContext)(contextKeyService, this.inputBox));
            this._findFilter = this._register(new NotebookFindInputFilterButton(filters, contextMenuService, instantiationService, options));
            this.inputBox.paddingRight = (this.caseSensitive?.width() ?? 0) + (this.wholeWords?.width() ?? 0) + (this.regex?.width() ?? 0) + this._findFilter.width;
            this.controls.appendChild(this._findFilter.container);
        }
        setEnabled(enabled) {
            super.setEnabled(enabled);
            if (enabled && !this._filterChecked) {
                this.regex?.enable();
            }
            else {
                this.regex?.disable();
            }
        }
        updateFilterState(changed) {
            this._filterChecked = changed;
            if (this.regex) {
                if (this._filterChecked) {
                    this.regex.disable();
                    this.regex.domNode.tabIndex = -1;
                    this.regex.domNode.classList.toggle('disabled', true);
                }
                else {
                    this.regex.enable();
                    this.regex.domNode.tabIndex = 0;
                    this.regex.domNode.classList.toggle('disabled', false);
                }
            }
            this._findFilter.applyStyles(this._filterChecked);
        }
        getCellToolbarActions(menu) {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
            return result;
        }
    }
    exports.NotebookFindInput = NotebookFindInput;
    let SimpleFindReplaceWidget = class SimpleFindReplaceWidget extends widget_1.Widget {
        constructor(_contextViewService, contextKeyService, _configurationService, contextMenuService, instantiationService, _state = new findState_1.FindReplaceState(), _notebookEditor) {
            super();
            this._contextViewService = _contextViewService;
            this._configurationService = _configurationService;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this._state = _state;
            this._notebookEditor = _notebookEditor;
            this._resizeOriginalWidth = NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH;
            this._isVisible = false;
            this._isReplaceVisible = false;
            this.foundMatch = false;
            const findScope = this._configurationService.getValue(notebookCommon_1.NotebookSetting.findScope) ?? { markupSource: true, markupPreview: true, codeSource: true, codeOutput: true };
            this._filters = new findFilters_1.NotebookFindFilters(findScope.markupSource, findScope.markupPreview, findScope.codeSource, findScope.codeOutput);
            this._state.change({ filters: this._filters }, false);
            this._filters.onDidChange(() => {
                this._state.change({ filters: this._filters }, false);
            });
            this._domNode = document.createElement('div');
            this._domNode.classList.add('simple-fr-find-part-wrapper');
            this._register(this._state.onFindReplaceStateChange((e) => this._onStateChanged(e)));
            this._scopedContextKeyService = contextKeyService.createScoped(this._domNode);
            const progressContainer = dom.$('.find-replace-progress');
            this._progressBar = new progressbar_1.ProgressBar(progressContainer, defaultStyles_1.defaultProgressBarStyles);
            this._domNode.appendChild(progressContainer);
            const isInteractiveWindow = contextKeyService.getContextKeyValue('notebookType') === 'interactive';
            // Toggle replace button
            this._toggleReplaceBtn = this._register(new findWidget_1.SimpleButton({
                label: NLS_TOGGLE_REPLACE_MODE_BTN_LABEL,
                className: 'codicon toggle left',
                onTrigger: isInteractiveWindow ? () => { } :
                    () => {
                        this._isReplaceVisible = !this._isReplaceVisible;
                        this._state.change({ isReplaceRevealed: this._isReplaceVisible }, false);
                        this._updateReplaceViewDisplay();
                    }
            }));
            this._toggleReplaceBtn.setEnabled(!isInteractiveWindow);
            this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
            this._domNode.appendChild(this._toggleReplaceBtn.domNode);
            this._innerFindDomNode = document.createElement('div');
            this._innerFindDomNode.classList.add('simple-fr-find-part');
            this._findInput = this._register(new NotebookFindInput(this._filters, this._scopedContextKeyService, this.contextMenuService, this.instantiationService, null, this._contextViewService, {
                label: NLS_FIND_INPUT_LABEL,
                placeholder: NLS_FIND_INPUT_PLACEHOLDER,
                validation: (value) => {
                    if (value.length === 0 || !this._findInput.getRegex()) {
                        return null;
                    }
                    try {
                        new RegExp(value);
                        return null;
                    }
                    catch (e) {
                        this.foundMatch = false;
                        this.updateButtons(this.foundMatch);
                        return { content: e.message };
                    }
                },
                flexibleWidth: true,
                showCommonFindToggles: true,
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles,
                toggleStyles: defaultStyles_1.defaultToggleStyles
            }));
            // Find History with update delayer
            this._updateHistoryDelayer = new async_1.Delayer(500);
            this.oninput(this._findInput.domNode, (e) => {
                this.foundMatch = this.onInputChanged();
                this.updateButtons(this.foundMatch);
                this._delayedUpdateHistory();
            });
            this._register(this._findInput.inputBox.onDidChange(() => {
                this._state.change({ searchString: this._findInput.getValue() }, true);
            }));
            this._findInput.setRegex(!!this._state.isRegex);
            this._findInput.setCaseSensitive(!!this._state.matchCase);
            this._findInput.setWholeWords(!!this._state.wholeWord);
            this._register(this._findInput.onDidOptionChange(() => {
                this._state.change({
                    isRegex: this._findInput.getRegex(),
                    wholeWord: this._findInput.getWholeWords(),
                    matchCase: this._findInput.getCaseSensitive()
                }, true);
            }));
            this._register(this._state.onFindReplaceStateChange(() => {
                this._findInput.setRegex(this._state.isRegex);
                this._findInput.setWholeWords(this._state.wholeWord);
                this._findInput.setCaseSensitive(this._state.matchCase);
                this._replaceInput.setPreserveCase(this._state.preserveCase);
                this.findFirst();
            }));
            this._matchesCount = document.createElement('div');
            this._matchesCount.className = 'matchesCount';
            this._updateMatchesCount();
            this.prevBtn = this._register(new findWidget_1.SimpleButton({
                label: NLS_PREVIOUS_MATCH_BTN_LABEL,
                icon: findWidget_1.findPreviousMatchIcon,
                onTrigger: () => {
                    this.find(true);
                }
            }));
            this.nextBtn = this._register(new findWidget_1.SimpleButton({
                label: NLS_NEXT_MATCH_BTN_LABEL,
                icon: findWidget_1.findNextMatchIcon,
                onTrigger: () => {
                    this.find(false);
                }
            }));
            const closeBtn = this._register(new findWidget_1.SimpleButton({
                label: NLS_CLOSE_BTN_LABEL,
                icon: iconRegistry_1.widgetClose,
                onTrigger: () => {
                    this.hide();
                }
            }));
            this._innerFindDomNode.appendChild(this._findInput.domNode);
            this._innerFindDomNode.appendChild(this._matchesCount);
            this._innerFindDomNode.appendChild(this.prevBtn.domNode);
            this._innerFindDomNode.appendChild(this.nextBtn.domNode);
            this._innerFindDomNode.appendChild(closeBtn.domNode);
            // _domNode wraps _innerDomNode, ensuring that
            this._domNode.appendChild(this._innerFindDomNode);
            this.onkeyup(this._innerFindDomNode, e => {
                if (e.equals(9 /* KeyCode.Escape */)) {
                    this.hide();
                    e.preventDefault();
                    return;
                }
            });
            this._focusTracker = this._register(dom.trackFocus(this._domNode));
            this._register(this._focusTracker.onDidFocus(this.onFocusTrackerFocus.bind(this)));
            this._register(this._focusTracker.onDidBlur(this.onFocusTrackerBlur.bind(this)));
            this._findInputFocusTracker = this._register(dom.trackFocus(this._findInput.domNode));
            this._register(this._findInputFocusTracker.onDidFocus(this.onFindInputFocusTrackerFocus.bind(this)));
            this._register(this._findInputFocusTracker.onDidBlur(this.onFindInputFocusTrackerBlur.bind(this)));
            this._register(dom.addDisposableListener(this._innerFindDomNode, 'click', (event) => {
                event.stopPropagation();
            }));
            // Replace
            this._innerReplaceDomNode = document.createElement('div');
            this._innerReplaceDomNode.classList.add('simple-fr-replace-part');
            this._replaceInput = this._register(new contextScopedHistoryWidget_1.ContextScopedReplaceInput(null, undefined, {
                label: NLS_REPLACE_INPUT_LABEL,
                placeholder: NLS_REPLACE_INPUT_PLACEHOLDER,
                history: [],
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles,
                toggleStyles: defaultStyles_1.defaultToggleStyles
            }, contextKeyService, false));
            this._innerReplaceDomNode.appendChild(this._replaceInput.domNode);
            this._replaceInputFocusTracker = this._register(dom.trackFocus(this._replaceInput.domNode));
            this._register(this._replaceInputFocusTracker.onDidFocus(this.onReplaceInputFocusTrackerFocus.bind(this)));
            this._register(this._replaceInputFocusTracker.onDidBlur(this.onReplaceInputFocusTrackerBlur.bind(this)));
            this._register(this._replaceInput.inputBox.onDidChange(() => {
                this._state.change({ replaceString: this._replaceInput.getValue() }, true);
            }));
            this._domNode.appendChild(this._innerReplaceDomNode);
            this._updateReplaceViewDisplay();
            this._replaceBtn = this._register(new findWidget_1.SimpleButton({
                label: NLS_REPLACE_BTN_LABEL,
                icon: findWidget_1.findReplaceIcon,
                onTrigger: () => {
                    this.replaceOne();
                }
            }));
            // Replace all button
            this._replaceAllBtn = this._register(new findWidget_1.SimpleButton({
                label: NLS_REPLACE_ALL_BTN_LABEL,
                icon: findWidget_1.findReplaceAllIcon,
                onTrigger: () => {
                    this.replaceAll();
                }
            }));
            this._innerReplaceDomNode.appendChild(this._replaceBtn.domNode);
            this._innerReplaceDomNode.appendChild(this._replaceAllBtn.domNode);
            this._resizeSash = this._register(new sash_1.Sash(this._domNode, { getVerticalSashLeft: () => 0 }, { orientation: 0 /* Orientation.VERTICAL */, size: 2 }));
            this._register(this._resizeSash.onDidStart(() => {
                this._resizeOriginalWidth = this._getDomWidth();
            }));
            this._register(this._resizeSash.onDidChange((evt) => {
                let width = this._resizeOriginalWidth + evt.startX - evt.currentX;
                if (width < NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH) {
                    width = NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH;
                }
                const maxWidth = this._getMaxWidth();
                if (width > maxWidth) {
                    width = maxWidth;
                }
                this._domNode.style.width = `${width}px`;
                if (this._isReplaceVisible) {
                    this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
                }
                this._findInput.inputBox.layout();
            }));
            this._register(this._resizeSash.onDidReset(() => {
                // users double click on the sash
                // try to emulate what happens with editor findWidget
                const currentWidth = this._getDomWidth();
                let width = NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH;
                if (currentWidth <= NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH) {
                    width = this._getMaxWidth();
                }
                this._domNode.style.width = `${width}px`;
                if (this._isReplaceVisible) {
                    this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
                }
                this._findInput.inputBox.layout();
            }));
        }
        _getMaxWidth() {
            return this._notebookEditor.getLayoutInfo().width - 64;
        }
        _getDomWidth() {
            return dom.getTotalWidth(this._domNode) - (NOTEBOOK_FIND_WIDGET_INITIAL_HORIZONTAL_PADDING * 2);
        }
        getCellToolbarActions(menu) {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
            return result;
        }
        get inputValue() {
            return this._findInput.getValue();
        }
        get replaceValue() {
            return this._replaceInput.getValue();
        }
        get replacePattern() {
            if (this._state.isRegex) {
                return (0, replacePattern_1.parseReplaceString)(this.replaceValue);
            }
            return replacePattern_1.ReplacePattern.fromStaticValue(this.replaceValue);
        }
        get focusTracker() {
            return this._focusTracker;
        }
        _onStateChanged(e) {
            this._updateButtons();
            this._updateMatchesCount();
        }
        _updateButtons() {
            this._findInput.setEnabled(this._isVisible);
            this._replaceInput.setEnabled(this._isVisible && this._isReplaceVisible);
            const findInputIsNonEmpty = (this._state.searchString.length > 0);
            this._replaceBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
            this._replaceAllBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
            this._domNode.classList.toggle('replaceToggled', this._isReplaceVisible);
            this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
            this.foundMatch = this._state.matchesCount > 0;
            this.updateButtons(this.foundMatch);
        }
        _updateMatchesCount() {
        }
        dispose() {
            super.dispose();
            if (this._domNode && this._domNode.parentElement) {
                this._domNode.parentElement.removeChild(this._domNode);
            }
        }
        getDomNode() {
            return this._domNode;
        }
        reveal(initialInput) {
            if (initialInput) {
                this._findInput.setValue(initialInput);
            }
            if (this._isVisible) {
                this._findInput.select();
                return;
            }
            this._isVisible = true;
            this.updateButtons(this.foundMatch);
            setTimeout(() => {
                this._domNode.classList.add('visible', 'visible-transition');
                this._domNode.setAttribute('aria-hidden', 'false');
                this._findInput.select();
            }, 0);
        }
        focus() {
            this._findInput.focus();
        }
        show(initialInput, options) {
            if (initialInput) {
                this._findInput.setValue(initialInput);
            }
            this._isVisible = true;
            setTimeout(() => {
                this._domNode.classList.add('visible', 'visible-transition');
                this._domNode.setAttribute('aria-hidden', 'false');
                if (options?.focus ?? true) {
                    this.focus();
                }
            }, 0);
        }
        showWithReplace(initialInput, replaceInput) {
            if (initialInput) {
                this._findInput.setValue(initialInput);
            }
            if (replaceInput) {
                this._replaceInput.setValue(replaceInput);
            }
            this._isVisible = true;
            this._isReplaceVisible = true;
            this._state.change({ isReplaceRevealed: this._isReplaceVisible }, false);
            this._updateReplaceViewDisplay();
            setTimeout(() => {
                this._domNode.classList.add('visible', 'visible-transition');
                this._domNode.setAttribute('aria-hidden', 'false');
                this._updateButtons();
                this._replaceInput.focus();
            }, 0);
        }
        _updateReplaceViewDisplay() {
            if (this._isReplaceVisible) {
                this._innerReplaceDomNode.style.display = 'flex';
            }
            else {
                this._innerReplaceDomNode.style.display = 'none';
            }
            this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
        }
        hide() {
            if (this._isVisible) {
                this._domNode.classList.remove('visible-transition');
                this._domNode.setAttribute('aria-hidden', 'true');
                // Need to delay toggling visibility until after Transition, then visibility hidden - removes from tabIndex list
                setTimeout(() => {
                    this._isVisible = false;
                    this.updateButtons(this.foundMatch);
                    this._domNode.classList.remove('visible');
                }, 200);
            }
        }
        _delayedUpdateHistory() {
            this._updateHistoryDelayer.trigger(this._updateHistory.bind(this));
        }
        _updateHistory() {
            this._findInput.inputBox.addToHistory();
        }
        _getRegexValue() {
            return this._findInput.getRegex();
        }
        _getWholeWordValue() {
            return this._findInput.getWholeWords();
        }
        _getCaseSensitiveValue() {
            return this._findInput.getCaseSensitive();
        }
        updateButtons(foundMatch) {
            const hasInput = this.inputValue.length > 0;
            this.prevBtn.setEnabled(this._isVisible && hasInput && foundMatch);
            this.nextBtn.setEnabled(this._isVisible && hasInput && foundMatch);
        }
    };
    exports.SimpleFindReplaceWidget = SimpleFindReplaceWidget;
    exports.SimpleFindReplaceWidget = SimpleFindReplaceWidget = __decorate([
        __param(0, contextView_1.IContextViewService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, instantiation_1.IInstantiationService)
    ], SimpleFindReplaceWidget);
    // theming
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        collector.addRule(`
	.notebook-editor {
		--notebook-find-width: ${NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH}px;
		--notebook-find-horizontal-padding: ${NOTEBOOK_FIND_WIDGET_INITIAL_HORIZONTAL_PADDING}px;
	}
	`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tGaW5kUmVwbGFjZVdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2ZpbmQvbm90ZWJvb2tGaW5kUmVwbGFjZVdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3Q2hHLE1BQU0sb0JBQW9CLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEUsTUFBTSwwQkFBMEIsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzVFLE1BQU0sNEJBQTRCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pHLHlGQUF5RjtJQUN6RixNQUFNLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDckYsTUFBTSxtQkFBbUIsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0saUNBQWlDLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RHLE1BQU0sdUJBQXVCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDekUsTUFBTSw2QkFBNkIsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3JGLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3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
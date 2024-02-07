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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/aria/aria", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/marked/marked", "vs/base/common/platform", "vs/base/common/themables", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/core/position", "vs/editor/common/services/model", "vs/editor/common/standaloneStrings", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/layout/browser/layoutService", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions"], function (require, exports, dom_1, keyboardEvent_1, aria_1, codicons_1, lifecycle_1, marked_1, platform_1, themables_1, uri_1, editorExtensions_1, codeEditorWidget_1, position_1, model_1, standaloneStrings_1, codeActionController_1, nls_1, accessibility_1, menuEntryActionViewItem_1, toolbar_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, layoutService_1, opener_1, quickInput_1, accessibilityConfiguration_1, simpleEditorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibleViewService = exports.AccessibleView = exports.NavigationType = exports.AccessibleViewType = exports.IAccessibleViewService = void 0;
    var DIMENSIONS;
    (function (DIMENSIONS) {
        DIMENSIONS[DIMENSIONS["MAX_WIDTH"] = 600] = "MAX_WIDTH";
    })(DIMENSIONS || (DIMENSIONS = {}));
    exports.IAccessibleViewService = (0, instantiation_1.createDecorator)('accessibleViewService');
    var AccessibleViewType;
    (function (AccessibleViewType) {
        AccessibleViewType["Help"] = "help";
        AccessibleViewType["View"] = "view";
    })(AccessibleViewType || (exports.AccessibleViewType = AccessibleViewType = {}));
    var NavigationType;
    (function (NavigationType) {
        NavigationType["Previous"] = "previous";
        NavigationType["Next"] = "next";
    })(NavigationType || (exports.NavigationType = NavigationType = {}));
    let AccessibleView = class AccessibleView extends lifecycle_1.Disposable {
        get editorWidget() { return this._editorWidget; }
        constructor(_openerService, _instantiationService, _configurationService, _modelService, _contextViewService, _contextKeyService, _accessibilityService, _keybindingService, _layoutService, _menuService) {
            super();
            this._openerService = _openerService;
            this._instantiationService = _instantiationService;
            this._configurationService = _configurationService;
            this._modelService = _modelService;
            this._contextViewService = _contextViewService;
            this._contextKeyService = _contextKeyService;
            this._accessibilityService = _accessibilityService;
            this._keybindingService = _keybindingService;
            this._layoutService = _layoutService;
            this._menuService = _menuService;
            this._accessiblityHelpIsShown = accessibilityConfiguration_1.accessibilityHelpIsShown.bindTo(this._contextKeyService);
            this._accessibleViewIsShown = accessibilityConfiguration_1.accessibleViewIsShown.bindTo(this._contextKeyService);
            this._accessibleViewSupportsNavigation = accessibilityConfiguration_1.accessibleViewSupportsNavigation.bindTo(this._contextKeyService);
            this._accessibleViewVerbosityEnabled = accessibilityConfiguration_1.accessibleViewVerbosityEnabled.bindTo(this._contextKeyService);
            this._accessibleViewGoToSymbolSupported = accessibilityConfiguration_1.accessibleViewGoToSymbolSupported.bindTo(this._contextKeyService);
            this._accessibleViewCurrentProviderId = accessibilityConfiguration_1.accessibleViewCurrentProviderId.bindTo(this._contextKeyService);
            this._onLastLine = accessibilityConfiguration_1.accessibleViewOnLastLine.bindTo(this._contextKeyService);
            this._container = document.createElement('div');
            this._container.classList.add('accessible-view');
            if (this._configurationService.getValue("accessibility.hideAccessibleView" /* AccessibilityWorkbenchSettingId.HideAccessibleView */)) {
                this._container.classList.add('hide');
            }
            const codeEditorWidgetOptions = {
                contributions: editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => c.id !== codeActionController_1.CodeActionController.ID)
            };
            const titleBar = document.createElement('div');
            titleBar.classList.add('accessible-view-title-bar');
            this._title = document.createElement('div');
            this._title.classList.add('accessible-view-title');
            titleBar.appendChild(this._title);
            const actionBar = document.createElement('div');
            actionBar.classList.add('accessible-view-action-bar');
            titleBar.appendChild(actionBar);
            this._container.appendChild(titleBar);
            this._toolbar = this._register(_instantiationService.createInstance(toolbar_1.WorkbenchToolBar, actionBar, { orientation: 0 /* ActionsOrientation.HORIZONTAL */ }));
            this._toolbar.context = { viewId: 'accessibleView' };
            const toolbarElt = this._toolbar.getElement();
            toolbarElt.tabIndex = 0;
            const editorOptions = {
                ...(0, simpleEditorOptions_1.getSimpleEditorOptions)(this._configurationService),
                lineDecorationsWidth: 6,
                dragAndDrop: false,
                cursorWidth: 1,
                wrappingStrategy: 'advanced',
                wrappingIndent: 'none',
                padding: { top: 2, bottom: 2 },
                quickSuggestions: false,
                renderWhitespace: 'none',
                dropIntoEditor: { enabled: false },
                readOnly: true,
                fontFamily: 'var(--monaco-monospace-font)'
            };
            this._editorWidget = this._register(this._instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this._container, editorOptions, codeEditorWidgetOptions));
            this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => {
                if (this._currentProvider && this._accessiblityHelpIsShown.get()) {
                    this.show(this._currentProvider);
                }
            }));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (this._currentProvider && e.affectsConfiguration(this._currentProvider.verbositySettingKey)) {
                    if (this._accessiblityHelpIsShown.get()) {
                        this.show(this._currentProvider);
                    }
                    this._accessibleViewVerbosityEnabled.set(this._configurationService.getValue(this._currentProvider.verbositySettingKey));
                    this._updateToolbar(this._currentProvider.actions, this._currentProvider.options.type);
                }
                if (e.affectsConfiguration("accessibility.hideAccessibleView" /* AccessibilityWorkbenchSettingId.HideAccessibleView */)) {
                    this._container.classList.toggle('hide', this._configurationService.getValue("accessibility.hideAccessibleView" /* AccessibilityWorkbenchSettingId.HideAccessibleView */));
                }
            }));
            this._register(this._editorWidget.onDidDispose(() => this._resetContextKeys()));
            this._register(this._editorWidget.onDidChangeCursorPosition(() => {
                this._onLastLine.set(this._editorWidget.getPosition()?.lineNumber === this._editorWidget.getModel()?.getLineCount());
            }));
        }
        _resetContextKeys() {
            this._accessiblityHelpIsShown.reset();
            this._accessibleViewIsShown.reset();
            this._accessibleViewSupportsNavigation.reset();
            this._accessibleViewVerbosityEnabled.reset();
            this._accessibleViewGoToSymbolSupported.reset();
            this._accessibleViewCurrentProviderId.reset();
        }
        getPosition(id) {
            if (!id || !this._lastProvider || this._lastProvider.id !== id) {
                return undefined;
            }
            return this._editorWidget.getPosition() || undefined;
        }
        setPosition(position, reveal) {
            this._editorWidget.setPosition(position);
            if (reveal) {
                this._editorWidget.revealPosition(position);
            }
        }
        showLastProvider(id) {
            if (!this._lastProvider || this._lastProvider.options.id !== id) {
                return;
            }
            this.show(this._lastProvider);
        }
        show(provider, symbol, showAccessibleViewHelp, position) {
            provider = provider ?? this._currentProvider;
            if (!provider) {
                return;
            }
            const delegate = {
                getAnchor: () => { return { x: ((0, dom_1.getActiveWindow)().innerWidth / 2) - ((Math.min(this._layoutService.activeContainerDimension.width * 0.62 /* golden cut */, 600 /* DIMENSIONS.MAX_WIDTH */)) / 2), y: this._layoutService.activeContainerOffset.quickPickTop }; },
                render: (container) => {
                    container.classList.add('accessible-view-container');
                    return this._render(provider, container, showAccessibleViewHelp);
                },
                onHide: () => {
                    if (!showAccessibleViewHelp) {
                        this._updateLastProvider();
                        this._currentProvider = undefined;
                        this._resetContextKeys();
                    }
                }
            };
            this._contextViewService.showContextView(delegate);
            if (position) {
                // Context view takes time to show up, so we need to wait for it to show up before we can set the position
                setTimeout(() => {
                    this._editorWidget.revealLine(position.lineNumber);
                    this._editorWidget.setSelection({ startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber, endColumn: position.column });
                }, 10);
            }
            if (symbol && this._currentProvider) {
                this.showSymbol(this._currentProvider, symbol);
            }
            if (provider.onDidRequestClearLastProvider) {
                this._register(provider.onDidRequestClearLastProvider((id) => {
                    if (this._lastProvider?.options.id === id) {
                        this._lastProvider = undefined;
                    }
                }));
            }
            if (provider.options.id) {
                // only cache a provider with an ID so that it will eventually be cleared.
                this._lastProvider = provider;
            }
        }
        previous() {
            if (!this._currentProvider) {
                return;
            }
            this._currentProvider.previous?.();
        }
        next() {
            if (!this._currentProvider) {
                return;
            }
            this._currentProvider.next?.();
        }
        goToSymbol() {
            if (!this._currentProvider) {
                return;
            }
            this._instantiationService.createInstance(AccessibleViewSymbolQuickPick, this).show(this._currentProvider);
        }
        getSymbols() {
            if (!this._currentProvider || !this._currentContent) {
                return;
            }
            const symbols = this._currentProvider.getSymbols?.() || [];
            if (symbols?.length) {
                return symbols;
            }
            if (this._currentProvider.options.language && this._currentProvider.options.language !== 'markdown') {
                // Symbols haven't been provided and we cannot parse this language
                return;
            }
            const markdownTokens = marked_1.marked.lexer(this._currentContent);
            if (!markdownTokens) {
                return;
            }
            this._convertTokensToSymbols(markdownTokens, symbols);
            return symbols.length ? symbols : undefined;
        }
        _convertTokensToSymbols(tokens, symbols) {
            let firstListItem;
            for (const token of tokens) {
                let label = undefined;
                if ('type' in token) {
                    switch (token.type) {
                        case 'heading':
                        case 'paragraph':
                        case 'code':
                            label = token.text;
                            break;
                        case 'list': {
                            const firstItem = token.items?.[0];
                            if (!firstItem) {
                                break;
                            }
                            firstListItem = `- ${firstItem.text}`;
                            label = token.items?.map(i => i.text).join(', ');
                            break;
                        }
                    }
                }
                if (label) {
                    symbols.push({ markdownToParse: label, label: (0, nls_1.localize)('symbolLabel', "({0}) {1}", token.type, label), ariaLabel: (0, nls_1.localize)('symbolLabelAria', "({0}) {1}", token.type, label), firstListItem });
                    firstListItem = undefined;
                }
            }
        }
        showSymbol(provider, symbol) {
            if (!this._currentContent) {
                return;
            }
            let lineNumber = symbol.lineNumber;
            const markdownToParse = symbol.markdownToParse;
            if (lineNumber === undefined && markdownToParse === undefined) {
                // No symbols provided and we cannot parse this language
                return;
            }
            if (lineNumber === undefined && markdownToParse) {
                // Note that this scales poorly, thus isn't used for worst case scenarios like the terminal, for which a line number will always be provided.
                // Parse the markdown to find the line number
                const index = this._currentContent.split('\n').findIndex(line => line.includes(markdownToParse.split('\n')[0]) || (symbol.firstListItem && line.includes(symbol.firstListItem))) ?? -1;
                if (index >= 0) {
                    lineNumber = index + 1;
                }
            }
            if (lineNumber === undefined) {
                return;
            }
            this.show(provider, undefined, undefined, { lineNumber, column: 1 });
            this._updateContextKeys(provider, true);
        }
        disableHint() {
            if (!this._currentProvider) {
                return;
            }
            this._configurationService.updateValue(this._currentProvider?.verbositySettingKey, false);
            (0, aria_1.alert)((0, nls_1.localize)('disableAccessibilityHelp', '{0} accessibility verbosity is now disabled', this._currentProvider.verbositySettingKey));
        }
        _updateContextKeys(provider, shown) {
            if (provider.options.type === "help" /* AccessibleViewType.Help */) {
                this._accessiblityHelpIsShown.set(shown);
                this._accessibleViewIsShown.reset();
            }
            else {
                this._accessibleViewIsShown.set(shown);
                this._accessiblityHelpIsShown.reset();
            }
            if (provider.next && provider.previous) {
                this._accessibleViewSupportsNavigation.set(true);
            }
            else {
                this._accessibleViewSupportsNavigation.reset();
            }
            const verbosityEnabled = this._configurationService.getValue(provider.verbositySettingKey);
            this._accessibleViewVerbosityEnabled.set(verbosityEnabled);
            this._accessibleViewGoToSymbolSupported.set(this._goToSymbolsSupported() ? this.getSymbols()?.length > 0 : false);
        }
        _render(provider, container, showAccessibleViewHelp) {
            if (!showAccessibleViewHelp) {
                // don't overwrite the current provider
                this._currentProvider = provider;
                this._accessibleViewCurrentProviderId.set(provider.id);
            }
            const value = this._configurationService.getValue(provider.verbositySettingKey);
            const readMoreLink = provider.options.readMoreUrl ? (0, nls_1.localize)("openDoc", "\n\nOpen a browser window with more information related to accessibility (H).") : '';
            let disableHelpHint = '';
            if (provider.options.type === "help" /* AccessibleViewType.Help */ && !!value) {
                disableHelpHint = this._getDisableVerbosityHint(provider.verbositySettingKey);
            }
            const accessibilitySupport = this._accessibilityService.isScreenReaderOptimized();
            let message = '';
            if (provider.options.type === "help" /* AccessibleViewType.Help */) {
                const turnOnMessage = (platform_1.isMacintosh
                    ? standaloneStrings_1.AccessibilityHelpNLS.changeConfigToOnMac
                    : standaloneStrings_1.AccessibilityHelpNLS.changeConfigToOnWinLinux);
                if (accessibilitySupport && provider.verbositySettingKey === "accessibility.verbosity.editor" /* AccessibilityVerbositySettingId.Editor */) {
                    message = standaloneStrings_1.AccessibilityHelpNLS.auto_on;
                    message += '\n';
                }
                else if (!accessibilitySupport) {
                    message = standaloneStrings_1.AccessibilityHelpNLS.auto_off + '\n' + turnOnMessage;
                    message += '\n';
                }
            }
            const verbose = this._configurationService.getValue(provider.verbositySettingKey);
            const exitThisDialogHint = verbose && !provider.options.position ? (0, nls_1.localize)('exit', '\n\nExit this dialog (Escape).') : '';
            this._currentContent = message + provider.provideContent() + readMoreLink + disableHelpHint + exitThisDialogHint;
            this._updateContextKeys(provider, true);
            this._getTextModel(uri_1.URI.from({ path: `accessible-view-${provider.verbositySettingKey}`, scheme: 'accessible-view', fragment: this._currentContent })).then((model) => {
                if (!model) {
                    return;
                }
                this._editorWidget.setModel(model);
                const domNode = this._editorWidget.getDomNode();
                if (!domNode) {
                    return;
                }
                model.setLanguage(provider.options.language ?? 'markdown');
                container.appendChild(this._container);
                let actionsHint = '';
                const verbose = this._configurationService.getValue(provider.verbositySettingKey);
                const hasActions = this._accessibleViewSupportsNavigation.get() || this._accessibleViewVerbosityEnabled.get() || this._accessibleViewGoToSymbolSupported.get() || this._currentProvider?.actions;
                if (verbose && !showAccessibleViewHelp && hasActions) {
                    actionsHint = provider.options.position ? (0, nls_1.localize)('ariaAccessibleViewActionsBottom', 'Explore actions such as disabling this hint (Shift+Tab), use Escape to exit this dialog.') : (0, nls_1.localize)('ariaAccessibleViewActions', 'Explore actions such as disabling this hint (Shift+Tab).');
                }
                let ariaLabel = provider.options.type === "help" /* AccessibleViewType.Help */ ? (0, nls_1.localize)('accessibility-help', "Accessibility Help") : (0, nls_1.localize)('accessible-view', "Accessible View");
                this._title.textContent = ariaLabel;
                if (actionsHint && provider.options.type === "view" /* AccessibleViewType.View */) {
                    ariaLabel = (0, nls_1.localize)('accessible-view-hint', "Accessible View, {0}", actionsHint);
                }
                else if (actionsHint) {
                    ariaLabel = (0, nls_1.localize)('accessibility-help-hint', "Accessibility Help, {0}", actionsHint);
                }
                this._editorWidget.updateOptions({ ariaLabel });
                this._editorWidget.focus();
                if (this._currentProvider?.options.position) {
                    const position = this._editorWidget.getPosition();
                    const isDefaultPosition = position?.lineNumber === 1 && position.column === 1;
                    if (this._currentProvider.options.position === 'bottom' || this._currentProvider.options.position === 'initial-bottom' && isDefaultPosition) {
                        const lastLine = this.editorWidget.getModel()?.getLineCount();
                        const position = lastLine !== undefined && lastLine > 0 ? new position_1.Position(lastLine, 1) : undefined;
                        if (position) {
                            this._editorWidget.setPosition(position);
                            this._editorWidget.revealLine(position.lineNumber);
                        }
                    }
                }
            });
            this._updateToolbar(provider.actions, provider.options.type);
            const hide = (e) => {
                provider.onClose();
                e.stopPropagation();
                this._contextViewService.hideContextView();
                this._updateContextKeys(provider, false);
                this._lastProvider = undefined;
            };
            const disposableStore = new lifecycle_1.DisposableStore();
            disposableStore.add(this._editorWidget.onKeyDown((e) => {
                if (e.keyCode === 9 /* KeyCode.Escape */ || shouldHide(e.browserEvent, this._keybindingService, this._configurationService)) {
                    hide(e);
                }
                else if (e.keyCode === 38 /* KeyCode.KeyH */ && provider.options.readMoreUrl) {
                    const url = provider.options.readMoreUrl;
                    (0, aria_1.alert)(standaloneStrings_1.AccessibilityHelpNLS.openingDocs);
                    this._openerService.open(uri_1.URI.parse(url));
                    e.preventDefault();
                    e.stopPropagation();
                }
                provider.onKeyDown?.(e);
            }));
            disposableStore.add((0, dom_1.addDisposableListener)(this._toolbar.getElement(), dom_1.EventType.KEY_DOWN, (e) => {
                const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
                    hide(e);
                }
            }));
            disposableStore.add(this._editorWidget.onDidBlurEditorWidget(() => {
                if (!(0, dom_1.isActiveElement)(this._toolbar.getElement())) {
                    this._contextViewService.hideContextView();
                }
            }));
            disposableStore.add(this._editorWidget.onDidContentSizeChange(() => this._layout()));
            disposableStore.add(this._layoutService.onDidLayoutActiveContainer(() => this._layout()));
            return disposableStore;
        }
        _updateToolbar(providedActions, type) {
            this._toolbar.setAriaLabel(type === "help" /* AccessibleViewType.Help */ ? (0, nls_1.localize)('accessibleHelpToolbar', 'Accessibility Help') : (0, nls_1.localize)('accessibleViewToolbar', "Accessible View"));
            const menuActions = [];
            const toolbarMenu = this._register(this._menuService.createMenu(actions_1.MenuId.AccessibleView, this._contextKeyService));
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(toolbarMenu, {}, menuActions);
            if (providedActions) {
                for (const providedAction of providedActions) {
                    providedAction.class = providedAction.class || themables_1.ThemeIcon.asClassName(codicons_1.Codicon.primitiveSquare);
                    providedAction.checked = undefined;
                }
                this._toolbar.setActions([...providedActions, ...menuActions]);
            }
            else {
                this._toolbar.setActions(menuActions);
            }
        }
        _layout() {
            const dimension = this._layoutService.activeContainerDimension;
            const maxHeight = dimension.height && dimension.height * .4;
            const height = Math.min(maxHeight, this._editorWidget.getContentHeight());
            const width = Math.min(dimension.width * 0.62 /* golden cut */, 600 /* DIMENSIONS.MAX_WIDTH */);
            this._editorWidget.layout({ width, height });
        }
        async _getTextModel(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            return this._modelService.createModel(resource.fragment, null, resource, false);
        }
        _goToSymbolsSupported() {
            if (!this._currentProvider) {
                return false;
            }
            return this._currentProvider.options.type === "help" /* AccessibleViewType.Help */ || this._currentProvider.options.language === 'markdown' || this._currentProvider.options.language === undefined || !!this._currentProvider.getSymbols?.();
        }
        _updateLastProvider() {
            if (!this._currentProvider) {
                return;
            }
            const lastProvider = Object.assign({}, this._currentProvider);
            lastProvider.provideContent = this._currentProvider.provideContent.bind(lastProvider);
            lastProvider.options = Object.assign({}, this._currentProvider.options);
            lastProvider.verbositySettingKey = this._currentProvider.verbositySettingKey;
            return lastProvider;
        }
        showAccessibleViewHelp() {
            const lastProvider = this._updateLastProvider();
            if (!lastProvider) {
                return;
            }
            const accessibleViewHelpProvider = {
                id: lastProvider.id,
                provideContent: () => lastProvider.options.customHelp ? lastProvider?.options.customHelp() : this._getAccessibleViewHelpDialogContent(this._goToSymbolsSupported()),
                onClose: () => this.show(lastProvider),
                options: { type: "help" /* AccessibleViewType.Help */ },
                verbositySettingKey: lastProvider.verbositySettingKey
            };
            this._contextViewService.hideContextView();
            // HACK: Delay to allow the context view to hide #186514
            setTimeout(() => this.show(accessibleViewHelpProvider, undefined, true), 100);
        }
        _getAccessibleViewHelpDialogContent(providerHasSymbols) {
            const navigationHint = this._getNavigationHint();
            const goToSymbolHint = this._getGoToSymbolHint(providerHasSymbols);
            const toolbarHint = (0, nls_1.localize)('toolbar', "Navigate to the toolbar (Shift+Tab)).");
            let hint = (0, nls_1.localize)('intro', "In the accessible view, you can:\n");
            if (navigationHint) {
                hint += ' - ' + navigationHint + '\n';
            }
            if (goToSymbolHint) {
                hint += ' - ' + goToSymbolHint + '\n';
            }
            if (toolbarHint) {
                hint += ' - ' + toolbarHint + '\n';
            }
            return hint;
        }
        _getNavigationHint() {
            let hint = '';
            const nextKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleViewNext" /* AccessibilityCommandId.ShowNext */)?.getAriaLabel();
            const previousKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleViewPrevious" /* AccessibilityCommandId.ShowPrevious */)?.getAriaLabel();
            if (nextKeybinding && previousKeybinding) {
                hint = (0, nls_1.localize)('accessibleViewNextPreviousHint', "Show the next ({0}) or previous ({1}) item.", nextKeybinding, previousKeybinding);
            }
            else {
                hint = (0, nls_1.localize)('chatAccessibleViewNextPreviousHintNoKb', "Show the next or previous item by configuring keybindings for the Show Next & Previous in Accessible View commands.");
            }
            return hint;
        }
        _getDisableVerbosityHint(verbositySettingKey) {
            if (!this._configurationService.getValue(verbositySettingKey)) {
                return '';
            }
            let hint = '';
            const disableKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleViewDisableHint" /* AccessibilityCommandId.DisableVerbosityHint */, this._contextKeyService)?.getAriaLabel();
            if (disableKeybinding) {
                hint = (0, nls_1.localize)('acessibleViewDisableHint', "\n\nDisable accessibility verbosity for this feature ({0}).", disableKeybinding);
            }
            else {
                hint = (0, nls_1.localize)('accessibleViewDisableHintNoKb', "\n\nAdd a keybinding for the command Disable Accessible View Hint, which disables accessibility verbosity for this feature.s");
            }
            return hint;
        }
        _getGoToSymbolHint(providerHasSymbols) {
            const goToSymbolKb = this._keybindingService.lookupKeybinding("editor.action.accessibleViewGoToSymbol" /* AccessibilityCommandId.GoToSymbol */)?.getAriaLabel();
            let goToSymbolHint = '';
            if (providerHasSymbols) {
                if (goToSymbolKb) {
                    goToSymbolHint = (0, nls_1.localize)('goToSymbolHint', 'Go to a symbol ({0})', goToSymbolKb);
                }
                else {
                    goToSymbolHint = (0, nls_1.localize)('goToSymbolHintNoKb', 'To go to a symbol, configure a keybinding for the command Go To Symbol in Accessible View');
                }
            }
            return goToSymbolHint;
        }
    };
    exports.AccessibleView = AccessibleView;
    exports.AccessibleView = AccessibleView = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, model_1.IModelService),
        __param(4, contextView_1.IContextViewService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, accessibility_1.IAccessibilityService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, layoutService_1.ILayoutService),
        __param(9, actions_1.IMenuService)
    ], AccessibleView);
    let AccessibleViewService = class AccessibleViewService extends lifecycle_1.Disposable {
        constructor(_instantiationService, _configurationService, _keybindingService) {
            super();
            this._instantiationService = _instantiationService;
            this._configurationService = _configurationService;
            this._keybindingService = _keybindingService;
        }
        show(provider, position) {
            if (!this._accessibleView) {
                this._accessibleView = this._register(this._instantiationService.createInstance(AccessibleView));
            }
            this._accessibleView.show(provider, undefined, undefined, position);
        }
        showLastProvider(id) {
            this._accessibleView?.showLastProvider(id);
        }
        next() {
            this._accessibleView?.next();
        }
        previous() {
            this._accessibleView?.previous();
        }
        goToSymbol() {
            this._accessibleView?.goToSymbol();
        }
        getOpenAriaHint(verbositySettingKey) {
            if (!this._configurationService.getValue(verbositySettingKey)) {
                return null;
            }
            const keybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleView" /* AccessibilityCommandId.OpenAccessibleView */)?.getAriaLabel();
            let hint = null;
            if (keybinding) {
                hint = (0, nls_1.localize)('acessibleViewHint', "Inspect this in the accessible view with {0}", keybinding);
            }
            else {
                hint = (0, nls_1.localize)('acessibleViewHintNoKbEither', "Inspect this in the accessible view via the command Open Accessible View which is currently not triggerable via keybinding.");
            }
            return hint;
        }
        disableHint() {
            this._accessibleView?.disableHint();
        }
        showAccessibleViewHelp() {
            this._accessibleView?.showAccessibleViewHelp();
        }
        getPosition(id) {
            return this._accessibleView?.getPosition(id) ?? undefined;
        }
        getLastPosition() {
            const lastLine = this._accessibleView?.editorWidget.getModel()?.getLineCount();
            return lastLine !== undefined && lastLine > 0 ? new position_1.Position(lastLine, 1) : undefined;
        }
        setPosition(position, reveal) {
            const editorWidget = this._accessibleView?.editorWidget;
            editorWidget?.setPosition(position);
            if (reveal) {
                editorWidget?.revealLine(position.lineNumber);
            }
        }
    };
    exports.AccessibleViewService = AccessibleViewService;
    exports.AccessibleViewService = AccessibleViewService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, keybinding_1.IKeybindingService)
    ], AccessibleViewService);
    let AccessibleViewSymbolQuickPick = class AccessibleViewSymbolQuickPick {
        constructor(_accessibleView, _quickInputService) {
            this._accessibleView = _accessibleView;
            this._quickInputService = _quickInputService;
        }
        show(provider) {
            const quickPick = this._quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)('accessibleViewSymbolQuickPickPlaceholder', "Type to search symbols");
            quickPick.title = (0, nls_1.localize)('accessibleViewSymbolQuickPickTitle', "Go to Symbol Accessible View");
            const picks = [];
            const symbols = this._accessibleView.getSymbols();
            if (!symbols) {
                return;
            }
            for (const symbol of symbols) {
                picks.push({
                    label: symbol.label,
                    ariaLabel: symbol.ariaLabel
                });
            }
            quickPick.canSelectMany = false;
            quickPick.items = symbols;
            quickPick.show();
            quickPick.onDidAccept(() => {
                this._accessibleView.showSymbol(provider, quickPick.selectedItems[0]);
                quickPick.hide();
            });
            quickPick.onDidHide(() => {
                if (quickPick.selectedItems.length === 0) {
                    // this was escaped, so refocus the accessible view
                    this._accessibleView.show(provider);
                }
            });
        }
    };
    AccessibleViewSymbolQuickPick = __decorate([
        __param(1, quickInput_1.IQuickInputService)
    ], AccessibleViewSymbolQuickPick);
    function shouldHide(event, keybindingService, configurationService) {
        if (!configurationService.getValue("accessibility.accessibleView.closeOnKeyPress" /* AccessibilityWorkbenchSettingId.AccessibleViewCloseOnKeyPress */)) {
            return false;
        }
        const standardKeyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(event);
        const resolveResult = keybindingService.softDispatch(standardKeyboardEvent, standardKeyboardEvent.target);
        const isValidChord = resolveResult.kind === 1 /* ResultKind.MoreChordsNeeded */;
        if (keybindingService.inChordMode || isValidChord) {
            return false;
        }
        return shouldHandleKey(event) && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey;
    }
    function shouldHandleKey(event) {
        return !!event.code.match(/^(Key[A-Z]|Digit[0-9]|Equal|Comma|Period|Slash|Quote|Backquote|Backslash|Minus|Semicolon|Space|Enter)$/);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJsZVZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2FjY2Vzc2liaWxpdHkvYnJvd3Nlci9hY2Nlc3NpYmxlVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwQ2hHLElBQVcsVUFFVjtJQUZELFdBQVcsVUFBVTtRQUNwQix1REFBZSxDQUFBO0lBQ2hCLENBQUMsRUFGVSxVQUFVLEtBQVYsVUFBVSxRQUVwQjtJQTBCWSxRQUFBLHNCQUFzQixHQUFHLElBQUEsK0JBQWUsRUFBeUIsdUJBQXVCLENBQUMsQ0FBQztJQXFCdkcsSUFBa0Isa0JBR2pCO0lBSEQsV0FBa0Isa0JBQWtCO1FBQ25DLG1DQUFhLENBQUE7UUFDYixtQ0FBYSxDQUFBO0lBQ2QsQ0FBQyxFQUhpQixrQkFBa0Isa0NBQWxCLGtCQUFrQixRQUduQztJQUVELElBQWtCLGNBR2pCO0lBSEQsV0FBa0IsY0FBYztRQUMvQix1Q0FBcUIsQ0FBQTtRQUNyQiwrQkFBYSxDQUFBO0lBQ2QsQ0FBQyxFQUhpQixjQUFjLDhCQUFkLGNBQWMsUUFHL0I7SUEwQk0sSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHNCQUFVO1FBVzdDLElBQUksWUFBWSxLQUFLLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFVakQsWUFDa0MsY0FBOEIsRUFDdkIscUJBQTRDLEVBQzVDLHFCQUE0QyxFQUNwRCxhQUE0QixFQUN0QixtQkFBd0MsRUFDekMsa0JBQXNDLEVBQ25DLHFCQUE0QyxFQUMvQyxrQkFBc0MsRUFDMUMsY0FBOEIsRUFDaEMsWUFBMEI7WUFFekQsS0FBSyxFQUFFLENBQUM7WUFYeUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3ZCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFD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
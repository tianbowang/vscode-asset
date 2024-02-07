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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/preferences/browser/keybindingsEditorModel", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/preferences/browser/keybindingWidgets", "vs/workbench/contrib/preferences/common/preferences", "vs/platform/contextview/browser/contextView", "vs/workbench/services/keybinding/common/keybindingEditing", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/editorExtensions", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/base/common/event", "vs/platform/actions/common/actions", "vs/workbench/common/theme", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/extensions/common/extensions", "vs/base/browser/keyboardEvent", "vs/base/common/types", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/platform/configuration/common/configuration", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/keybindingsEditor"], function (require, exports, nls_1, async_1, DOM, platform_1, lifecycle_1, toggle_1, highlightedLabel_1, keybindingLabel_1, actions_1, actionbar_1, editorPane_1, telemetry_1, clipboardService_1, keybindingsEditorModel_1, instantiation_1, keybinding_1, keybindingWidgets_1, preferences_1, contextView_1, keybindingEditing_1, themeService_1, themables_1, contextkey_1, colorRegistry_1, editorService_1, editorExtensions_1, listService_1, notification_1, storage_1, event_1, actions_2, theme_1, preferencesIcons_1, toolbar_1, defaultStyles_1, extensions_1, keyboardEvent_1, types_1, suggestEnabledInput_1, settingsEditorColorRegistry_1, configuration_1, widgetNavigationCommands_1) {
    "use strict";
    var KeybindingsEditor_1, ActionsColumnRenderer_1, SourceColumnRenderer_1, WhenColumnRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingsEditor = void 0;
    const $ = DOM.$;
    let KeybindingsEditor = class KeybindingsEditor extends editorPane_1.EditorPane {
        static { KeybindingsEditor_1 = this; }
        static { this.ID = 'workbench.editor.keybindings'; }
        constructor(telemetryService, themeService, keybindingsService, contextMenuService, keybindingEditingService, contextKeyService, notificationService, clipboardService, instantiationService, editorService, storageService, configurationService) {
            super(KeybindingsEditor_1.ID, telemetryService, themeService, storageService);
            this.keybindingsService = keybindingsService;
            this.contextMenuService = contextMenuService;
            this.keybindingEditingService = keybindingEditingService;
            this.contextKeyService = contextKeyService;
            this.notificationService = notificationService;
            this.clipboardService = clipboardService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this._onDefineWhenExpression = this._register(new event_1.Emitter());
            this.onDefineWhenExpression = this._onDefineWhenExpression.event;
            this._onRejectWhenExpression = this._register(new event_1.Emitter());
            this.onRejectWhenExpression = this._onRejectWhenExpression.event;
            this._onAcceptWhenExpression = this._register(new event_1.Emitter());
            this.onAcceptWhenExpression = this._onAcceptWhenExpression.event;
            this._onLayout = this._register(new event_1.Emitter());
            this.onLayout = this._onLayout.event;
            this.keybindingsEditorModel = null;
            this.unAssignedKeybindingItemToRevealAndFocus = null;
            this.tableEntries = [];
            this.dimension = null;
            this.latestEmptyFilters = [];
            this.delayedFiltering = new async_1.Delayer(300);
            this._register(keybindingsService.onDidUpdateKeybindings(() => this.render(!!this.keybindingFocusContextKey.get())));
            this.keybindingsEditorContextKey = preferences_1.CONTEXT_KEYBINDINGS_EDITOR.bindTo(this.contextKeyService);
            this.searchFocusContextKey = preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS.bindTo(this.contextKeyService);
            this.keybindingFocusContextKey = preferences_1.CONTEXT_KEYBINDING_FOCUS.bindTo(this.contextKeyService);
            this.searchHistoryDelayer = new async_1.Delayer(500);
            this.recordKeysAction = new actions_1.Action(preferences_1.KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS, (0, nls_1.localize)('recordKeysLabel', "Record Keys"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.keybindingsRecordKeysIcon));
            this.recordKeysAction.checked = false;
            this.sortByPrecedenceAction = new actions_1.Action(preferences_1.KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE, (0, nls_1.localize)('sortByPrecedeneLabel', "Sort by Precedence (Highest first)"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.keybindingsSortIcon));
            this.sortByPrecedenceAction.checked = false;
            this.overflowWidgetsDomNode = $('.keybindings-overflow-widgets-container.monaco-editor');
        }
        create(parent) {
            super.create(parent);
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [this],
                focusNextWidget: () => {
                    if (this.searchWidget.hasFocus()) {
                        this.focusKeybindings();
                    }
                },
                focusPreviousWidget: () => {
                    if (!this.searchWidget.hasFocus()) {
                        this.focusSearch();
                    }
                }
            }));
        }
        createEditor(parent) {
            const keybindingsEditorElement = DOM.append(parent, $('div', { class: 'keybindings-editor' }));
            this.createAriaLabelElement(keybindingsEditorElement);
            this.createOverlayContainer(keybindingsEditorElement);
            this.createHeader(keybindingsEditorElement);
            this.createBody(keybindingsEditorElement);
        }
        setInput(input, options, context, token) {
            this.keybindingsEditorContextKey.set(true);
            return super.setInput(input, options, context, token)
                .then(() => this.render(!!(options && options.preserveFocus)));
        }
        clearInput() {
            super.clearInput();
            this.keybindingsEditorContextKey.reset();
            this.keybindingFocusContextKey.reset();
        }
        layout(dimension) {
            this.dimension = dimension;
            this.layoutSearchWidget(dimension);
            this.overlayContainer.style.width = dimension.width + 'px';
            this.overlayContainer.style.height = dimension.height + 'px';
            this.defineKeybindingWidget.layout(this.dimension);
            this.layoutKeybindingsTable();
            this._onLayout.fire();
        }
        focus() {
            super.focus();
            const activeKeybindingEntry = this.activeKeybindingEntry;
            if (activeKeybindingEntry) {
                this.selectEntry(activeKeybindingEntry);
            }
            else if (!platform_1.isIOS) {
                this.searchWidget.focus();
            }
        }
        get activeKeybindingEntry() {
            const focusedElement = this.keybindingsTable.getFocusedElements()[0];
            return focusedElement && focusedElement.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID ? focusedElement : null;
        }
        async defineKeybinding(keybindingEntry, add) {
            this.selectEntry(keybindingEntry);
            this.showOverlayContainer();
            try {
                const key = await this.defineKeybindingWidget.define();
                if (key) {
                    await this.updateKeybinding(keybindingEntry, key, keybindingEntry.keybindingItem.when, add);
                }
            }
            catch (error) {
                this.onKeybindingEditingError(error);
            }
            finally {
                this.hideOverlayContainer();
                this.selectEntry(keybindingEntry);
            }
        }
        defineWhenExpression(keybindingEntry) {
            if (keybindingEntry.keybindingItem.keybinding) {
                this.selectEntry(keybindingEntry);
                this._onDefineWhenExpression.fire(keybindingEntry);
            }
        }
        rejectWhenExpression(keybindingEntry) {
            this._onRejectWhenExpression.fire(keybindingEntry);
        }
        acceptWhenExpression(keybindingEntry) {
            this._onAcceptWhenExpression.fire(keybindingEntry);
        }
        async updateKeybinding(keybindingEntry, key, when, add) {
            const currentKey = keybindingEntry.keybindingItem.keybinding ? keybindingEntry.keybindingItem.keybinding.getUserSettingsLabel() : '';
            if (currentKey !== key || keybindingEntry.keybindingItem.when !== when) {
                if (add) {
                    await this.keybindingEditingService.addKeybinding(keybindingEntry.keybindingItem.keybindingItem, key, when || undefined);
                }
                else {
                    await this.keybindingEditingService.editKeybinding(keybindingEntry.keybindingItem.keybindingItem, key, when || undefined);
                }
                if (!keybindingEntry.keybindingItem.keybinding) { // reveal only if keybinding was added to unassinged. Because the entry will be placed in different position after rendering
                    this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
                }
            }
        }
        async removeKeybinding(keybindingEntry) {
            this.selectEntry(keybindingEntry);
            if (keybindingEntry.keybindingItem.keybinding) { // This should be a pre-condition
                try {
                    await this.keybindingEditingService.removeKeybinding(keybindingEntry.keybindingItem.keybindingItem);
                    this.focus();
                }
                catch (error) {
                    this.onKeybindingEditingError(error);
                    this.selectEntry(keybindingEntry);
                }
            }
        }
        async resetKeybinding(keybindingEntry) {
            this.selectEntry(keybindingEntry);
            try {
                await this.keybindingEditingService.resetKeybinding(keybindingEntry.keybindingItem.keybindingItem);
                if (!keybindingEntry.keybindingItem.keybinding) { // reveal only if keybinding was added to unassinged. Because the entry will be placed in different position after rendering
                    this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
                }
                this.selectEntry(keybindingEntry);
            }
            catch (error) {
                this.onKeybindingEditingError(error);
                this.selectEntry(keybindingEntry);
            }
        }
        async copyKeybinding(keybinding) {
            this.selectEntry(keybinding);
            const userFriendlyKeybinding = {
                key: keybinding.keybindingItem.keybinding ? keybinding.keybindingItem.keybinding.getUserSettingsLabel() || '' : '',
                command: keybinding.keybindingItem.command
            };
            if (keybinding.keybindingItem.when) {
                userFriendlyKeybinding.when = keybinding.keybindingItem.when;
            }
            await this.clipboardService.writeText(JSON.stringify(userFriendlyKeybinding, null, '  '));
        }
        async copyKeybindingCommand(keybinding) {
            this.selectEntry(keybinding);
            await this.clipboardService.writeText(keybinding.keybindingItem.command);
        }
        async copyKeybindingCommandTitle(keybinding) {
            this.selectEntry(keybinding);
            await this.clipboardService.writeText(keybinding.keybindingItem.commandLabel);
        }
        focusSearch() {
            this.searchWidget.focus();
        }
        search(filter) {
            this.focusSearch();
            this.searchWidget.setValue(filter);
            this.selectEntry(0);
        }
        clearSearchResults() {
            this.searchWidget.clear();
        }
        showSimilarKeybindings(keybindingEntry) {
            const value = `"${keybindingEntry.keybindingItem.keybinding.getAriaLabel()}"`;
            if (value !== this.searchWidget.getValue()) {
                this.searchWidget.setValue(value);
            }
        }
        createAriaLabelElement(parent) {
            this.ariaLabelElement = DOM.append(parent, DOM.$(''));
            this.ariaLabelElement.setAttribute('id', 'keybindings-editor-aria-label-element');
            this.ariaLabelElement.setAttribute('aria-live', 'assertive');
        }
        createOverlayContainer(parent) {
            this.overlayContainer = DOM.append(parent, $('.overlay-container'));
            this.overlayContainer.style.position = 'absolute';
            this.overlayContainer.style.zIndex = '40'; // has to greater than sash z-index which is 35
            this.defineKeybindingWidget = this._register(this.instantiationService.createInstance(keybindingWidgets_1.DefineKeybindingWidget, this.overlayContainer));
            this._register(this.defineKeybindingWidget.onDidChange(keybindingStr => this.defineKeybindingWidget.printExisting(this.keybindingsEditorModel.fetch(`"${keybindingStr}"`).length)));
            this._register(this.defineKeybindingWidget.onShowExistingKeybidings(keybindingStr => this.searchWidget.setValue(`"${keybindingStr}"`)));
            this.hideOverlayContainer();
        }
        showOverlayContainer() {
            this.overlayContainer.style.display = 'block';
        }
        hideOverlayContainer() {
            this.overlayContainer.style.display = 'none';
        }
        createHeader(parent) {
            this.headerContainer = DOM.append(parent, $('.keybindings-header'));
            const fullTextSearchPlaceholder = (0, nls_1.localize)('SearchKeybindings.FullTextSearchPlaceholder', "Type to search in keybindings");
            const keybindingsSearchPlaceholder = (0, nls_1.localize)('SearchKeybindings.KeybindingsSearchPlaceholder', "Recording Keys. Press Escape to exit");
            const clearInputAction = new actions_1.Action(preferences_1.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, (0, nls_1.localize)('clearInput', "Clear Keybindings Search Input"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.preferencesClearInputIcon), false, async () => this.clearSearchResults());
            const searchContainer = DOM.append(this.headerContainer, $('.search-container'));
            this.searchWidget = this._register(this.instantiationService.createInstance(keybindingWidgets_1.KeybindingsSearchWidget, searchContainer, {
                ariaLabel: fullTextSearchPlaceholder,
                placeholder: fullTextSearchPlaceholder,
                focusKey: this.searchFocusContextKey,
                ariaLabelledBy: 'keybindings-editor-aria-label-element',
                recordEnter: true,
                quoteRecordedKeys: true,
                history: this.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)['searchHistory'] || [],
                inputBoxStyles: (0, defaultStyles_1.getInputBoxStyle)({
                    inputBorder: settingsEditorColorRegistry_1.settingsTextInputBorder
                })
            }));
            this._register(this.searchWidget.onDidChange(searchValue => {
                clearInputAction.enabled = !!searchValue;
                this.delayedFiltering.trigger(() => this.filterKeybindings());
                this.updateSearchOptions();
            }));
            this._register(this.searchWidget.onEscape(() => this.recordKeysAction.checked = false));
            this.actionsContainer = DOM.append(searchContainer, DOM.$('.keybindings-search-actions-container'));
            const recordingBadge = this.createRecordingBadge(this.actionsContainer);
            this._register(this.sortByPrecedenceAction.onDidChange(e => {
                if (e.checked !== undefined) {
                    this.renderKeybindingsEntries(false);
                }
                this.updateSearchOptions();
            }));
            this._register(this.recordKeysAction.onDidChange(e => {
                if (e.checked !== undefined) {
                    recordingBadge.classList.toggle('disabled', !e.checked);
                    if (e.checked) {
                        this.searchWidget.inputBox.setPlaceHolder(keybindingsSearchPlaceholder);
                        this.searchWidget.inputBox.setAriaLabel(keybindingsSearchPlaceholder);
                        this.searchWidget.startRecordingKeys();
                        this.searchWidget.focus();
                    }
                    else {
                        this.searchWidget.inputBox.setPlaceHolder(fullTextSearchPlaceholder);
                        this.searchWidget.inputBox.setAriaLabel(fullTextSearchPlaceholder);
                        this.searchWidget.stopRecordingKeys();
                        this.searchWidget.focus();
                    }
                    this.updateSearchOptions();
                }
            }));
            const actions = [this.recordKeysAction, this.sortByPrecedenceAction, clearInputAction];
            const toolBar = this._register(new toolbar_1.ToolBar(this.actionsContainer, this.contextMenuService, {
                actionViewItemProvider: (action) => {
                    if (action.id === this.sortByPrecedenceAction.id || action.id === this.recordKeysAction.id) {
                        return new toggle_1.ToggleActionViewItem(null, action, { keybinding: this.keybindingsService.lookupKeybinding(action.id)?.getLabel(), toggleStyles: defaultStyles_1.defaultToggleStyles });
                    }
                    return undefined;
                },
                getKeyBinding: action => this.keybindingsService.lookupKeybinding(action.id)
            }));
            toolBar.setActions(actions);
            this._register(this.keybindingsService.onDidUpdateKeybindings(() => toolBar.setActions(actions)));
        }
        updateSearchOptions() {
            const keybindingsEditorInput = this.input;
            if (keybindingsEditorInput) {
                keybindingsEditorInput.searchOptions = {
                    searchValue: this.searchWidget.getValue(),
                    recordKeybindings: !!this.recordKeysAction.checked,
                    sortByPrecedence: !!this.sortByPrecedenceAction.checked
                };
            }
        }
        createRecordingBadge(container) {
            const recordingBadge = DOM.append(container, DOM.$('.recording-badge.monaco-count-badge.long.disabled'));
            recordingBadge.textContent = (0, nls_1.localize)('recording', "Recording Keys");
            recordingBadge.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeBackground);
            recordingBadge.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeForeground);
            recordingBadge.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder)}`;
            return recordingBadge;
        }
        layoutSearchWidget(dimension) {
            this.searchWidget.layout(dimension);
            this.headerContainer.classList.toggle('small', dimension.width < 400);
            this.searchWidget.inputBox.inputElement.style.paddingRight = `${DOM.getTotalWidth(this.actionsContainer) + 12}px`;
        }
        createBody(parent) {
            const bodyContainer = DOM.append(parent, $('.keybindings-body'));
            this.createTable(bodyContainer);
        }
        createTable(parent) {
            this.keybindingsTableContainer = DOM.append(parent, $('.keybindings-table-container'));
            this.keybindingsTable = this._register(this.instantiationService.createInstance(listService_1.WorkbenchTable, 'KeybindingsEditor', this.keybindingsTableContainer, new Delegate(), [
                {
                    label: '',
                    tooltip: '',
                    weight: 0,
                    minimumWidth: 40,
                    maximumWidth: 40,
                    templateId: ActionsColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('command', "Command"),
                    tooltip: '',
                    weight: 0.3,
                    templateId: CommandColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('keybinding', "Keybinding"),
                    tooltip: '',
                    weight: 0.2,
                    templateId: KeybindingColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('when', "When"),
                    tooltip: '',
                    weight: 0.35,
                    templateId: WhenColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
                {
                    label: (0, nls_1.localize)('source', "Source"),
                    tooltip: '',
                    weight: 0.15,
                    templateId: SourceColumnRenderer.TEMPLATE_ID,
                    project(row) { return row; }
                },
            ], [
                this.instantiationService.createInstance(ActionsColumnRenderer, this),
                this.instantiationService.createInstance(CommandColumnRenderer),
                this.instantiationService.createInstance(KeybindingColumnRenderer),
                this.instantiationService.createInstance(WhenColumnRenderer, this),
                this.instantiationService.createInstance(SourceColumnRenderer),
            ], {
                identityProvider: { getId: (e) => e.id },
                horizontalScrolling: false,
                accessibilityProvider: new AccessibilityProvider(this.configurationService),
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.keybindingItem.commandLabel || e.keybindingItem.command },
                overrideStyles: {
                    listBackground: colorRegistry_1.editorBackground
                },
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                openOnSingleClick: false,
                transformOptimization: false // disable transform optimization as it causes the editor overflow widgets to be mispositioned
            }));
            this._register(this.keybindingsTable.onContextMenu(e => this.onContextMenu(e)));
            this._register(this.keybindingsTable.onDidChangeFocus(e => this.onFocusChange()));
            this._register(this.keybindingsTable.onDidFocus(() => {
                this.keybindingsTable.getHTMLElement().classList.add('focused');
                this.onFocusChange();
            }));
            this._register(this.keybindingsTable.onDidBlur(() => {
                this.keybindingsTable.getHTMLElement().classList.remove('focused');
                this.keybindingFocusContextKey.reset();
            }));
            this._register(this.keybindingsTable.onDidOpen((e) => {
                // stop double click action on the input #148493
                if (e.browserEvent?.defaultPrevented) {
                    return;
                }
                const activeKeybindingEntry = this.activeKeybindingEntry;
                if (activeKeybindingEntry) {
                    this.defineKeybinding(activeKeybindingEntry, false);
                }
            }));
            DOM.append(this.keybindingsTableContainer, this.overflowWidgetsDomNode);
        }
        async render(preserveFocus) {
            if (this.input) {
                const input = this.input;
                this.keybindingsEditorModel = await input.resolve();
                await this.keybindingsEditorModel.resolve(this.getActionsLabels());
                this.renderKeybindingsEntries(false, preserveFocus);
                if (input.searchOptions) {
                    this.recordKeysAction.checked = input.searchOptions.recordKeybindings;
                    this.sortByPrecedenceAction.checked = input.searchOptions.sortByPrecedence;
                    this.searchWidget.setValue(input.searchOptions.searchValue);
                }
                else {
                    this.updateSearchOptions();
                }
            }
        }
        getActionsLabels() {
            const actionsLabels = new Map();
            for (const editorAction of editorExtensions_1.EditorExtensionsRegistry.getEditorActions()) {
                actionsLabels.set(editorAction.id, editorAction.label);
            }
            for (const menuItem of actions_2.MenuRegistry.getMenuItems(actions_2.MenuId.CommandPalette)) {
                if ((0, actions_2.isIMenuItem)(menuItem)) {
                    const title = typeof menuItem.command.title === 'string' ? menuItem.command.title : menuItem.command.title.value;
                    const category = menuItem.command.category ? typeof menuItem.command.category === 'string' ? menuItem.command.category : menuItem.command.category.value : undefined;
                    actionsLabels.set(menuItem.command.id, category ? `${category}: ${title}` : title);
                }
            }
            return actionsLabels;
        }
        filterKeybindings() {
            this.renderKeybindingsEntries(this.searchWidget.hasFocus());
            this.searchHistoryDelayer.trigger(() => {
                this.searchWidget.inputBox.addToHistory();
                this.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)['searchHistory'] = this.searchWidget.inputBox.getHistory();
                this.saveState();
            });
        }
        clearKeyboardShortcutSearchHistory() {
            this.searchWidget.inputBox.clearHistory();
            this.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)['searchHistory'] = this.searchWidget.inputBox.getHistory();
            this.saveState();
        }
        renderKeybindingsEntries(reset, preserveFocus) {
            if (this.keybindingsEditorModel) {
                const filter = this.searchWidget.getValue();
                const keybindingsEntries = this.keybindingsEditorModel.fetch(filter, this.sortByPrecedenceAction.checked);
                this.ariaLabelElement.setAttribute('aria-label', this.getAriaLabel(keybindingsEntries));
                if (keybindingsEntries.length === 0) {
                    this.latestEmptyFilters.push(filter);
                }
                const currentSelectedIndex = this.keybindingsTable.getSelection()[0];
                this.tableEntries = keybindingsEntries;
                this.keybindingsTable.splice(0, this.keybindingsTable.length, this.tableEntries);
                this.layoutKeybindingsTable();
                if (reset) {
                    this.keybindingsTable.setSelection([]);
                    this.keybindingsTable.setFocus([]);
                }
                else {
                    if (this.unAssignedKeybindingItemToRevealAndFocus) {
                        const index = this.getNewIndexOfUnassignedKeybinding(this.unAssignedKeybindingItemToRevealAndFocus);
                        if (index !== -1) {
                            this.keybindingsTable.reveal(index, 0.2);
                            this.selectEntry(index);
                        }
                        this.unAssignedKeybindingItemToRevealAndFocus = null;
                    }
                    else if (currentSelectedIndex !== -1 && currentSelectedIndex < this.tableEntries.length) {
                        this.selectEntry(currentSelectedIndex, preserveFocus);
                    }
                    else if (this.editorService.activeEditorPane === this && !preserveFocus) {
                        this.focus();
                    }
                }
            }
        }
        getAriaLabel(keybindingsEntries) {
            if (this.sortByPrecedenceAction.checked) {
                return (0, nls_1.localize)('show sorted keybindings', "Showing {0} Keybindings in precedence order", keybindingsEntries.length);
            }
            else {
                return (0, nls_1.localize)('show keybindings', "Showing {0} Keybindings in alphabetical order", keybindingsEntries.length);
            }
        }
        layoutKeybindingsTable() {
            if (!this.dimension) {
                return;
            }
            const tableHeight = this.dimension.height - (DOM.getDomNodePagePosition(this.headerContainer).height + 12 /*padding*/);
            this.keybindingsTableContainer.style.height = `${tableHeight}px`;
            this.keybindingsTable.layout(tableHeight);
        }
        getIndexOf(listEntry) {
            const index = this.tableEntries.indexOf(listEntry);
            if (index === -1) {
                for (let i = 0; i < this.tableEntries.length; i++) {
                    if (this.tableEntries[i].id === listEntry.id) {
                        return i;
                    }
                }
            }
            return index;
        }
        getNewIndexOfUnassignedKeybinding(unassignedKeybinding) {
            for (let index = 0; index < this.tableEntries.length; index++) {
                const entry = this.tableEntries[index];
                if (entry.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                    const keybindingItemEntry = entry;
                    if (keybindingItemEntry.keybindingItem.command === unassignedKeybinding.keybindingItem.command) {
                        return index;
                    }
                }
            }
            return -1;
        }
        selectEntry(keybindingItemEntry, focus = true) {
            const index = typeof keybindingItemEntry === 'number' ? keybindingItemEntry : this.getIndexOf(keybindingItemEntry);
            if (index !== -1 && index < this.keybindingsTable.length) {
                if (focus) {
                    this.keybindingsTable.domFocus();
                    this.keybindingsTable.setFocus([index]);
                }
                this.keybindingsTable.setSelection([index]);
            }
        }
        focusKeybindings() {
            this.keybindingsTable.domFocus();
            const currentFocusIndices = this.keybindingsTable.getFocus();
            this.keybindingsTable.setFocus([currentFocusIndices.length ? currentFocusIndices[0] : 0]);
        }
        selectKeybinding(keybindingItemEntry) {
            this.selectEntry(keybindingItemEntry);
        }
        recordSearchKeys() {
            this.recordKeysAction.checked = true;
        }
        toggleSortByPrecedence() {
            this.sortByPrecedenceAction.checked = !this.sortByPrecedenceAction.checked;
        }
        onContextMenu(e) {
            if (!e.element) {
                return;
            }
            if (e.element.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                const keybindingItemEntry = e.element;
                this.selectEntry(keybindingItemEntry);
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => [
                        this.createCopyAction(keybindingItemEntry),
                        this.createCopyCommandAction(keybindingItemEntry),
                        this.createCopyCommandTitleAction(keybindingItemEntry),
                        new actions_1.Separator(),
                        ...(keybindingItemEntry.keybindingItem.keybinding
                            ? [this.createDefineKeybindingAction(keybindingItemEntry), this.createAddKeybindingAction(keybindingItemEntry)]
                            : [this.createDefineKeybindingAction(keybindingItemEntry)]),
                        new actions_1.Separator(),
                        this.createRemoveAction(keybindingItemEntry),
                        this.createResetAction(keybindingItemEntry),
                        new actions_1.Separator(),
                        this.createDefineWhenExpressionAction(keybindingItemEntry),
                        new actions_1.Separator(),
                        this.createShowConflictsAction(keybindingItemEntry)
                    ]
                });
            }
        }
        onFocusChange() {
            this.keybindingFocusContextKey.reset();
            const element = this.keybindingsTable.getFocusedElements()[0];
            if (!element) {
                return;
            }
            if (element.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                this.keybindingFocusContextKey.set(true);
            }
        }
        createDefineKeybindingAction(keybindingItemEntry) {
            return {
                label: keybindingItemEntry.keybindingItem.keybinding ? (0, nls_1.localize)('changeLabel', "Change Keybinding...") : (0, nls_1.localize)('addLabel', "Add Keybinding..."),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE,
                run: () => this.defineKeybinding(keybindingItemEntry, false)
            };
        }
        createAddKeybindingAction(keybindingItemEntry) {
            return {
                label: (0, nls_1.localize)('addLabel', "Add Keybinding..."),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_ADD,
                run: () => this.defineKeybinding(keybindingItemEntry, true)
            };
        }
        createDefineWhenExpressionAction(keybindingItemEntry) {
            return {
                label: (0, nls_1.localize)('editWhen', "Change When Expression"),
                enabled: !!keybindingItemEntry.keybindingItem.keybinding,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
                run: () => this.defineWhenExpression(keybindingItemEntry)
            };
        }
        createRemoveAction(keybindingItem) {
            return {
                label: (0, nls_1.localize)('removeLabel', "Remove Keybinding"),
                enabled: !!keybindingItem.keybindingItem.keybinding,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_REMOVE,
                run: () => this.removeKeybinding(keybindingItem)
            };
        }
        createResetAction(keybindingItem) {
            return {
                label: (0, nls_1.localize)('resetLabel', "Reset Keybinding"),
                enabled: !keybindingItem.keybindingItem.keybindingItem.isDefault,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RESET,
                run: () => this.resetKeybinding(keybindingItem)
            };
        }
        createShowConflictsAction(keybindingItem) {
            return {
                label: (0, nls_1.localize)('showSameKeybindings', "Show Same Keybindings"),
                enabled: !!keybindingItem.keybindingItem.keybinding,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
                run: () => this.showSimilarKeybindings(keybindingItem)
            };
        }
        createCopyAction(keybindingItem) {
            return {
                label: (0, nls_1.localize)('copyLabel', "Copy"),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY,
                run: () => this.copyKeybinding(keybindingItem)
            };
        }
        createCopyCommandAction(keybinding) {
            return {
                label: (0, nls_1.localize)('copyCommandLabel', "Copy Command ID"),
                enabled: true,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
                run: () => this.copyKeybindingCommand(keybinding)
            };
        }
        createCopyCommandTitleAction(keybinding) {
            return {
                label: (0, nls_1.localize)('copyCommandTitleLabel', "Copy Command Title"),
                enabled: !!keybinding.keybindingItem.commandLabel,
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
                run: () => this.copyKeybindingCommandTitle(keybinding)
            };
        }
        onKeybindingEditingError(error) {
            this.notificationService.error(typeof error === 'string' ? error : (0, nls_1.localize)('error', "Error '{0}' while editing the keybinding. Please open 'keybindings.json' file and check for errors.", `${error}`));
        }
    };
    exports.KeybindingsEditor = KeybindingsEditor;
    exports.KeybindingsEditor = KeybindingsEditor = KeybindingsEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, keybindingEditing_1.IKeybindingEditingService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, notification_1.INotificationService),
        __param(7, clipboardService_1.IClipboardService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, editorService_1.IEditorService),
        __param(10, storage_1.IStorageService),
        __param(11, configuration_1.IConfigurationService)
    ], KeybindingsEditor);
    class Delegate {
        constructor() {
            this.headerRowHeight = 30;
        }
        getHeight(element) {
            if (element.templateId === keybindingsEditorModel_1.KEYBINDING_ENTRY_TEMPLATE_ID) {
                const commandIdMatched = element.keybindingItem.commandLabel && element.commandIdMatches;
                const commandDefaultLabelMatched = !!element.commandDefaultLabelMatches;
                const extensionIdMatched = !!element.extensionIdMatches;
                if (commandIdMatched && commandDefaultLabelMatched) {
                    return 60;
                }
                if (extensionIdMatched || commandIdMatched || commandDefaultLabelMatched) {
                    return 40;
                }
            }
            return 24;
        }
    }
    let ActionsColumnRenderer = class ActionsColumnRenderer {
        static { ActionsColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'actions'; }
        constructor(keybindingsEditor, keybindingsService) {
            this.keybindingsEditor = keybindingsEditor;
            this.keybindingsService = keybindingsService;
            this.templateId = ActionsColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = DOM.append(container, $('.actions'));
            const actionBar = new actionbar_1.ActionBar(element, { animated: false });
            return { actionBar };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            templateData.actionBar.clear();
            const actions = [];
            if (keybindingItemEntry.keybindingItem.keybinding) {
                actions.push(this.createEditAction(keybindingItemEntry));
            }
            else {
                actions.push(this.createAddAction(keybindingItemEntry));
            }
            templateData.actionBar.push(actions, { icon: true });
        }
        createEditAction(keybindingItemEntry) {
            const keybinding = this.keybindingsService.lookupKeybinding(preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE);
            return {
                class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.keybindingsEditIcon),
                enabled: true,
                id: 'editKeybinding',
                tooltip: keybinding ? (0, nls_1.localize)('editKeybindingLabelWithKey', "Change Keybinding {0}", `(${keybinding.getLabel()})`) : (0, nls_1.localize)('editKeybindingLabel', "Change Keybinding"),
                run: () => this.keybindingsEditor.defineKeybinding(keybindingItemEntry, false)
            };
        }
        createAddAction(keybindingItemEntry) {
            const keybinding = this.keybindingsService.lookupKeybinding(preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE);
            return {
                class: themables_1.ThemeIcon.asClassName(preferencesIcons_1.keybindingsAddIcon),
                enabled: true,
                id: 'addKeybinding',
                tooltip: keybinding ? (0, nls_1.localize)('addKeybindingLabelWithKey', "Add Keybinding {0}", `(${keybinding.getLabel()})`) : (0, nls_1.localize)('addKeybindingLabel', "Add Keybinding"),
                run: () => this.keybindingsEditor.defineKeybinding(keybindingItemEntry, false)
            };
        }
        disposeTemplate(templateData) {
            templateData.actionBar.dispose();
        }
    };
    ActionsColumnRenderer = ActionsColumnRenderer_1 = __decorate([
        __param(1, keybinding_1.IKeybindingService)
    ], ActionsColumnRenderer);
    class CommandColumnRenderer {
        constructor() {
            this.templateId = CommandColumnRenderer.TEMPLATE_ID;
        }
        static { this.TEMPLATE_ID = 'commands'; }
        renderTemplate(container) {
            const commandColumn = DOM.append(container, $('.command'));
            const commandLabelContainer = DOM.append(commandColumn, $('.command-label'));
            const commandLabel = new highlightedLabel_1.HighlightedLabel(commandLabelContainer);
            const commandDefaultLabelContainer = DOM.append(commandColumn, $('.command-default-label'));
            const commandDefaultLabel = new highlightedLabel_1.HighlightedLabel(commandDefaultLabelContainer);
            const commandIdLabelContainer = DOM.append(commandColumn, $('.command-id.code'));
            const commandIdLabel = new highlightedLabel_1.HighlightedLabel(commandIdLabelContainer);
            return { commandColumn, commandLabelContainer, commandLabel, commandDefaultLabelContainer, commandDefaultLabel, commandIdLabelContainer, commandIdLabel };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            const keybindingItem = keybindingItemEntry.keybindingItem;
            const commandIdMatched = !!(keybindingItem.commandLabel && keybindingItemEntry.commandIdMatches);
            const commandDefaultLabelMatched = !!keybindingItemEntry.commandDefaultLabelMatches;
            templateData.commandColumn.classList.toggle('vertical-align-column', commandIdMatched || commandDefaultLabelMatched);
            templateData.commandColumn.title = keybindingItem.commandLabel ? (0, nls_1.localize)('title', "{0} ({1})", keybindingItem.commandLabel, keybindingItem.command) : keybindingItem.command;
            if (keybindingItem.commandLabel) {
                templateData.commandLabelContainer.classList.remove('hide');
                templateData.commandLabel.set(keybindingItem.commandLabel, keybindingItemEntry.commandLabelMatches);
            }
            else {
                templateData.commandLabelContainer.classList.add('hide');
                templateData.commandLabel.set(undefined);
            }
            if (keybindingItemEntry.commandDefaultLabelMatches) {
                templateData.commandDefaultLabelContainer.classList.remove('hide');
                templateData.commandDefaultLabel.set(keybindingItem.commandDefaultLabel, keybindingItemEntry.commandDefaultLabelMatches);
            }
            else {
                templateData.commandDefaultLabelContainer.classList.add('hide');
                templateData.commandDefaultLabel.set(undefined);
            }
            if (keybindingItemEntry.commandIdMatches || !keybindingItem.commandLabel) {
                templateData.commandIdLabelContainer.classList.remove('hide');
                templateData.commandIdLabel.set(keybindingItem.command, keybindingItemEntry.commandIdMatches);
            }
            else {
                templateData.commandIdLabelContainer.classList.add('hide');
                templateData.commandIdLabel.set(undefined);
            }
        }
        disposeTemplate(templateData) { }
    }
    class KeybindingColumnRenderer {
        static { this.TEMPLATE_ID = 'keybindings'; }
        constructor() {
            this.templateId = KeybindingColumnRenderer.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = DOM.append(container, $('.keybinding'));
            const keybindingLabel = new keybindingLabel_1.KeybindingLabel(DOM.append(element, $('div.keybinding-label')), platform_1.OS, defaultStyles_1.defaultKeybindingLabelStyles);
            return { keybindingLabel };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            if (keybindingItemEntry.keybindingItem.keybinding) {
                templateData.keybindingLabel.set(keybindingItemEntry.keybindingItem.keybinding, keybindingItemEntry.keybindingMatches);
            }
            else {
                templateData.keybindingLabel.set(undefined, undefined);
            }
        }
        disposeTemplate(templateData) {
        }
    }
    function onClick(element, callback) {
        const disposables = new lifecycle_1.DisposableStore();
        disposables.add(DOM.addDisposableListener(element, DOM.EventType.CLICK, DOM.finalHandler(callback)));
        disposables.add(DOM.addDisposableListener(element, DOM.EventType.KEY_UP, e => {
            const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
            if (keyboardEvent.equals(10 /* KeyCode.Space */) || keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                e.preventDefault();
                e.stopPropagation();
                callback();
            }
        }));
        return disposables;
    }
    let SourceColumnRenderer = class SourceColumnRenderer {
        static { SourceColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'source'; }
        constructor(extensionsWorkbenchService) {
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.templateId = SourceColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const sourceColumn = DOM.append(container, $('.source'));
            const sourceLabel = new highlightedLabel_1.HighlightedLabel(DOM.append(sourceColumn, $('.source-label')));
            const extensionContainer = DOM.append(sourceColumn, $('.extension-container'));
            const extensionLabel = DOM.append(extensionContainer, $('a.extension-label', { tabindex: 0 }));
            const extensionId = new highlightedLabel_1.HighlightedLabel(DOM.append(extensionContainer, $('.extension-id-container.code')));
            return { sourceColumn, sourceLabel, extensionLabel, extensionContainer, extensionId, disposables: new lifecycle_1.DisposableStore() };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            if ((0, types_1.isString)(keybindingItemEntry.keybindingItem.source)) {
                templateData.extensionContainer.classList.add('hide');
                templateData.sourceLabel.element.classList.remove('hide');
                templateData.sourceColumn.title = '';
                templateData.sourceLabel.set(keybindingItemEntry.keybindingItem.source || '-', keybindingItemEntry.sourceMatches);
            }
            else {
                templateData.extensionContainer.classList.remove('hide');
                templateData.sourceLabel.element.classList.add('hide');
                const extension = keybindingItemEntry.keybindingItem.source;
                const extensionLabel = extension.displayName ?? extension.identifier.value;
                templateData.sourceColumn.title = (0, nls_1.localize)('extension label', "Extension ({0})", extensionLabel);
                templateData.extensionLabel.textContent = extensionLabel;
                templateData.disposables.add(onClick(templateData.extensionLabel, () => {
                    this.extensionsWorkbenchService.open(extension.identifier.value);
                }));
                if (keybindingItemEntry.extensionIdMatches) {
                    templateData.extensionId.element.classList.remove('hide');
                    templateData.extensionId.set(extension.identifier.value, keybindingItemEntry.extensionIdMatches);
                }
                else {
                    templateData.extensionId.element.classList.add('hide');
                    templateData.extensionId.set(undefined);
                }
            }
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    SourceColumnRenderer = SourceColumnRenderer_1 = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], SourceColumnRenderer);
    let WhenInputWidget = class WhenInputWidget extends lifecycle_1.Disposable {
        constructor(parent, keybindingsEditor, instantiationService, contextKeyService) {
            super();
            this._onDidAccept = this._register(new event_1.Emitter());
            this.onDidAccept = this._onDidAccept.event;
            this._onDidReject = this._register(new event_1.Emitter());
            this.onDidReject = this._onDidReject.event;
            const focusContextKey = preferences_1.CONTEXT_WHEN_FOCUS.bindTo(contextKeyService);
            this.input = this._register(instantiationService.createInstance(suggestEnabledInput_1.SuggestEnabledInput, 'keyboardshortcutseditor#wheninput', parent, {
                provideResults: () => {
                    const result = [];
                    for (const contextKey of contextkey_1.RawContextKey.all()) {
                        result.push({ label: contextKey.key, documentation: contextKey.description, detail: contextKey.type, kind: 14 /* CompletionItemKind.Constant */ });
                    }
                    return result;
                },
                triggerCharacters: ['!', ' '],
                wordDefinition: /[a-zA-Z.]+/,
                alwaysShowSuggestions: true,
            }, '', `keyboardshortcutseditor#wheninput`, { focusContextKey, overflowWidgetsDomNode: keybindingsEditor.overflowWidgetsDomNode }));
            this._register((DOM.addDisposableListener(this.input.element, DOM.EventType.DBLCLICK, e => DOM.EventHelper.stop(e))));
            this._register((0, lifecycle_1.toDisposable)(() => focusContextKey.reset()));
            this._register(keybindingsEditor.onAcceptWhenExpression(() => this._onDidAccept.fire(this.input.getValue())));
            this._register(event_1.Event.any(keybindingsEditor.onRejectWhenExpression, this.input.onDidBlur)(() => this._onDidReject.fire()));
        }
        layout(dimension) {
            this.input.layout(dimension);
        }
        show(value) {
            this.input.setValue(value);
            this.input.focus(true);
        }
    };
    WhenInputWidget = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextkey_1.IContextKeyService)
    ], WhenInputWidget);
    let WhenColumnRenderer = class WhenColumnRenderer {
        static { WhenColumnRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'when'; }
        constructor(keybindingsEditor, instantiationService) {
            this.keybindingsEditor = keybindingsEditor;
            this.instantiationService = instantiationService;
            this.templateId = WhenColumnRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const element = DOM.append(container, $('.when'));
            const whenLabelContainer = DOM.append(element, $('div.when-label'));
            const whenLabel = new highlightedLabel_1.HighlightedLabel(whenLabelContainer);
            const whenInputContainer = DOM.append(element, $('div.when-input-container'));
            return {
                element,
                whenLabelContainer,
                whenLabel,
                whenInputContainer,
                disposables: new lifecycle_1.DisposableStore(),
            };
        }
        renderElement(keybindingItemEntry, index, templateData, height) {
            templateData.disposables.clear();
            const whenInputDisposables = templateData.disposables.add(new lifecycle_1.DisposableStore());
            templateData.disposables.add(this.keybindingsEditor.onDefineWhenExpression(e => {
                if (keybindingItemEntry === e) {
                    templateData.element.classList.add('input-mode');
                    const inputWidget = whenInputDisposables.add(this.instantiationService.createInstance(WhenInputWidget, templateData.whenInputContainer, this.keybindingsEditor));
                    inputWidget.layout(new DOM.Dimension(templateData.element.parentElement.clientWidth, 18));
                    inputWidget.show(keybindingItemEntry.keybindingItem.when || '');
                    const hideInputWidget = () => {
                        whenInputDisposables.clear();
                        templateData.element.classList.remove('input-mode');
                        templateData.element.parentElement.style.paddingLeft = '10px';
                        DOM.clearNode(templateData.whenInputContainer);
                    };
                    whenInputDisposables.add(inputWidget.onDidAccept(value => {
                        hideInputWidget();
                        this.keybindingsEditor.updateKeybinding(keybindingItemEntry, keybindingItemEntry.keybindingItem.keybinding ? keybindingItemEntry.keybindingItem.keybinding.getUserSettingsLabel() || '' : '', value);
                        this.keybindingsEditor.selectKeybinding(keybindingItemEntry);
                    }));
                    whenInputDisposables.add(inputWidget.onDidReject(() => {
                        hideInputWidget();
                        this.keybindingsEditor.selectKeybinding(keybindingItemEntry);
                    }));
                    templateData.element.parentElement.style.paddingLeft = '0px';
                }
            }));
            templateData.whenLabelContainer.classList.toggle('code', !!keybindingItemEntry.keybindingItem.when);
            templateData.whenLabelContainer.classList.toggle('empty', !keybindingItemEntry.keybindingItem.when);
            if (keybindingItemEntry.keybindingItem.when) {
                templateData.whenLabel.set(keybindingItemEntry.keybindingItem.when, keybindingItemEntry.whenMatches);
                templateData.whenLabel.element.title = keybindingItemEntry.keybindingItem.when;
                templateData.element.title = keybindingItemEntry.keybindingItem.when;
            }
            else {
                templateData.whenLabel.set('-');
                templateData.whenLabel.element.title = '';
                templateData.element.title = '';
            }
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    WhenColumnRenderer = WhenColumnRenderer_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], WhenColumnRenderer);
    class AccessibilityProvider {
        constructor(configurationService) {
            this.configurationService = configurationService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('keybindingsLabel', "Keybindings");
        }
        getAriaLabel({ keybindingItem }) {
            const ariaLabel = [
                keybindingItem.commandLabel ? keybindingItem.commandLabel : keybindingItem.command,
                keybindingItem.keybinding?.getAriaLabel() || (0, nls_1.localize)('noKeybinding', "No keybinding assigned"),
                keybindingItem.when ? keybindingItem.when : (0, nls_1.localize)('noWhen', "No when context"),
                (0, types_1.isString)(keybindingItem.source) ? keybindingItem.source : keybindingItem.source.description ?? keybindingItem.source.identifier.value,
            ];
            if (this.configurationService.getValue("accessibility.verbosity.keybindingsEditor" /* AccessibilityVerbositySettingId.KeybindingsEditor */)) {
                const kbEditorAriaLabel = (0, nls_1.localize)('keyboard shortcuts aria label', "use space or enter to change the keybinding.");
                ariaLabel.push(kbEditorAriaLabel);
            }
            return ariaLabel.join(', ');
        }
    }
    (0, colorRegistry_1.registerColor)('keybindingTable.headerBackground', { dark: colorRegistry_1.tableOddRowsBackgroundColor, light: colorRegistry_1.tableOddRowsBackgroundColor, hcDark: colorRegistry_1.tableOddRowsBackgroundColor, hcLight: colorRegistry_1.tableOddRowsBackgroundColor }, 'Background color for the keyboard shortcuts table header.');
    (0, colorRegistry_1.registerColor)('keybindingTable.rowsBackground', { light: colorRegistry_1.tableOddRowsBackgroundColor, dark: colorRegistry_1.tableOddRowsBackgroundColor, hcDark: colorRegistry_1.tableOddRowsBackgroundColor, hcLight: colorRegistry_1.tableOddRowsBackgroundColor }, 'Background color for the keyboard shortcuts table alternating rows.');
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const foregroundColor = theme.getColor(colorRegistry_1.foreground);
        if (foregroundColor) {
            const whenForegroundColor = foregroundColor.transparent(.8).makeOpaque((0, theme_1.WORKBENCH_BACKGROUND)(theme));
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listActiveSelectionForegroundColor = theme.getColor(colorRegistry_1.listActiveSelectionForeground);
        const listActiveSelectionBackgroundColor = theme.getColor(colorRegistry_1.listActiveSelectionBackground);
        if (listActiveSelectionForegroundColor && listActiveSelectionBackgroundColor) {
            const whenForegroundColor = listActiveSelectionForegroundColor.transparent(.8).makeOpaque(listActiveSelectionBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listInactiveSelectionForegroundColor = theme.getColor(colorRegistry_1.listInactiveSelectionForeground);
        const listInactiveSelectionBackgroundColor = theme.getColor(colorRegistry_1.listInactiveSelectionBackground);
        if (listInactiveSelectionForegroundColor && listInactiveSelectionBackgroundColor) {
            const whenForegroundColor = listInactiveSelectionForegroundColor.transparent(.8).makeOpaque(listInactiveSelectionBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listFocusForegroundColor = theme.getColor(colorRegistry_1.listFocusForeground);
        const listFocusBackgroundColor = theme.getColor(colorRegistry_1.listFocusBackground);
        if (listFocusForegroundColor && listFocusBackgroundColor) {
            const whenForegroundColor = listFocusForegroundColor.transparent(.8).makeOpaque(listFocusBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.focused .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
        const listHoverForegroundColor = theme.getColor(colorRegistry_1.listHoverForeground);
        const listHoverBackgroundColor = theme.getColor(colorRegistry_1.listHoverBackground);
        if (listHoverForegroundColor && listHoverBackgroundColor) {
            const whenForegroundColor = listHoverForegroundColor.transparent(.8).makeOpaque(listHoverBackgroundColor);
            collector.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row:hover:not(.focused):not(.selected) .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3NFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3ByZWZlcmVuY2VzL2Jyb3dzZXIva2V5YmluZGluZ3NFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXlEaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVULElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsdUJBQVU7O2lCQUVoQyxPQUFFLEdBQVcsOEJBQThCLEFBQXpDLENBQTBDO1FBMEM1RCxZQUNvQixnQkFBbUMsRUFDdkMsWUFBMkIsRUFDdEIsa0JBQXVELEVBQ3RELGtCQUF3RCxFQUNsRCx3QkFBb0UsRUFDM0UsaUJBQXNELEVBQ3BELG1CQUEwRCxFQUM3RCxnQkFBb0QsRUFDaEQsb0JBQTRELEVBQ25FLGFBQThDLEVBQzdDLGNBQStCLEVBQ3pCLG9CQUE0RDtZQUVuRixLQUFLLENBQUMsbUJBQWlCLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztZQVh2Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3JDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDakMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEyQjtZQUMxRCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ25DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUMvQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2xELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUV0Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBcEQ1RSw0QkFBdUIsR0FBa0MsSUFBSSxDQUFD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
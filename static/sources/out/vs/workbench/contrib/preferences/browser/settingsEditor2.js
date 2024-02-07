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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/date", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/workbench/contrib/preferences/browser/settingsLayout", "vs/workbench/contrib/preferences/browser/settingsTree", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/browser/tocTree", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesModels", "vs/workbench/services/userDataSync/common/userDataSync", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/configuration/common/configuration", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/extensions/common/extensions", "vs/base/browser/ui/splitview/splitview", "vs/base/common/color", "vs/editor/common/languages/language", "vs/workbench/contrib/preferences/browser/settingsSearchMenu", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/theme/browser/defaultStyles", "vs/platform/product/common/productService", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/platform/progress/common/progress", "vs/css!./media/settingsEditor2"], function (require, exports, DOM, aria, keyboardEvent_1, actionbar_1, button_1, actions_1, async_1, cancellation_1, date_1, errors_1, event_1, iterator_1, lifecycle_1, platform, uri_1, nls_1, commands_1, contextkey_1, instantiation_1, log_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, userDataSync_1, editorPane_1, suggestEnabledInput_1, preferencesWidgets_1, settingsLayout_1, settingsTree_1, settingsTreeModels_1, tocTree_1, preferences_1, settingsEditorColorRegistry_1, editorGroupsService_1, preferences_2, preferencesModels_1, userDataSync_2, preferencesIcons_1, workspaceTrust_1, configuration_1, textResourceConfiguration_1, extensions_1, splitview_1, color_1, language_1, settingsSearchMenu_1, extensionManagement_1, configurationRegistry_1, platform_1, defaultStyles_1, productService_1, widgetNavigationCommands_1, progress_1) {
    "use strict";
    var SettingsEditor2_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsEditor2 = exports.createGroupIterator = exports.SettingsFocusContext = void 0;
    var SettingsFocusContext;
    (function (SettingsFocusContext) {
        SettingsFocusContext[SettingsFocusContext["Search"] = 0] = "Search";
        SettingsFocusContext[SettingsFocusContext["TableOfContents"] = 1] = "TableOfContents";
        SettingsFocusContext[SettingsFocusContext["SettingTree"] = 2] = "SettingTree";
        SettingsFocusContext[SettingsFocusContext["SettingControl"] = 3] = "SettingControl";
    })(SettingsFocusContext || (exports.SettingsFocusContext = SettingsFocusContext = {}));
    function createGroupIterator(group) {
        return iterator_1.Iterable.map(group.children, g => {
            return {
                element: g,
                children: g instanceof settingsTreeModels_1.SettingsTreeGroupElement ?
                    createGroupIterator(g) :
                    undefined
            };
        });
    }
    exports.createGroupIterator = createGroupIterator;
    const $ = DOM.$;
    const searchBoxLabel = (0, nls_1.localize)('SearchSettings.AriaLabel', "Search settings");
    const SEARCH_TOC_BEHAVIOR_KEY = 'workbench.settings.settingsSearchTocBehavior';
    const SETTINGS_EDITOR_STATE_KEY = 'settingsEditorState';
    let SettingsEditor2 = class SettingsEditor2 extends editorPane_1.EditorPane {
        static { SettingsEditor2_1 = this; }
        static { this.ID = 'workbench.editor.settings2'; }
        static { this.NUM_INSTANCES = 0; }
        static { this.SEARCH_DEBOUNCE = 200; }
        static { this.SETTING_UPDATE_FAST_DEBOUNCE = 200; }
        static { this.SETTING_UPDATE_SLOW_DEBOUNCE = 1000; }
        static { this.CONFIG_SCHEMA_UPDATE_DELAYER = 500; }
        static { this.TOC_MIN_WIDTH = 100; }
        static { this.TOC_RESET_WIDTH = 200; }
        static { this.EDITOR_MIN_WIDTH = 500; }
        // Below NARROW_TOTAL_WIDTH, we only render the editor rather than the ToC.
        static { this.NARROW_TOTAL_WIDTH = SettingsEditor2_1.TOC_RESET_WIDTH + SettingsEditor2_1.EDITOR_MIN_WIDTH; }
        static { this.SUGGESTIONS = [
            `@${preferences_1.MODIFIED_SETTING_TAG}`,
            '@tag:notebookLayout',
            '@tag:notebookOutputLayout',
            `@tag:${preferences_1.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}`,
            `@tag:${preferences_1.WORKSPACE_TRUST_SETTING_TAG}`,
            '@tag:sync',
            '@tag:usesOnlineServices',
            '@tag:telemetry',
            '@tag:accessibility',
            `@${preferences_1.ID_SETTING_TAG}`,
            `@${preferences_1.EXTENSION_SETTING_TAG}`,
            `@${preferences_1.FEATURE_SETTING_TAG}scm`,
            `@${preferences_1.FEATURE_SETTING_TAG}explorer`,
            `@${preferences_1.FEATURE_SETTING_TAG}search`,
            `@${preferences_1.FEATURE_SETTING_TAG}debug`,
            `@${preferences_1.FEATURE_SETTING_TAG}extensions`,
            `@${preferences_1.FEATURE_SETTING_TAG}terminal`,
            `@${preferences_1.FEATURE_SETTING_TAG}task`,
            `@${preferences_1.FEATURE_SETTING_TAG}problems`,
            `@${preferences_1.FEATURE_SETTING_TAG}output`,
            `@${preferences_1.FEATURE_SETTING_TAG}comments`,
            `@${preferences_1.FEATURE_SETTING_TAG}remote`,
            `@${preferences_1.FEATURE_SETTING_TAG}timeline`,
            `@${preferences_1.FEATURE_SETTING_TAG}notebook`,
            `@${preferences_1.POLICY_SETTING_TAG}`
        ]; }
        static shouldSettingUpdateFast(type) {
            if (Array.isArray(type)) {
                // nullable integer/number or complex
                return false;
            }
            return type === preferences_2.SettingValueType.Enum ||
                type === preferences_2.SettingValueType.Array ||
                type === preferences_2.SettingValueType.BooleanObject ||
                type === preferences_2.SettingValueType.Object ||
                type === preferences_2.SettingValueType.Complex ||
                type === preferences_2.SettingValueType.Boolean ||
                type === preferences_2.SettingValueType.Exclude ||
                type === preferences_2.SettingValueType.Include;
        }
        constructor(telemetryService, configurationService, textResourceConfigurationService, themeService, preferencesService, instantiationService, preferencesSearchService, logService, contextKeyService, storageService, editorGroupService, userDataSyncWorkbenchService, userDataSyncEnablementService, workspaceTrustManagementService, extensionService, languageService, extensionManagementService, productService, extensionGalleryService, editorProgressService) {
            super(SettingsEditor2_1.ID, telemetryService, themeService, storageService);
            this.configurationService = configurationService;
            this.preferencesService = preferencesService;
            this.instantiationService = instantiationService;
            this.preferencesSearchService = preferencesSearchService;
            this.logService = logService;
            this.storageService = storageService;
            this.editorGroupService = editorGroupService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.extensionService = extensionService;
            this.languageService = languageService;
            this.extensionManagementService = extensionManagementService;
            this.productService = productService;
            this.extensionGalleryService = extensionGalleryService;
            this.editorProgressService = editorProgressService;
            this.searchInProgress = null;
            this.pendingSettingUpdate = null;
            this._searchResultModel = null;
            this.searchResultLabel = null;
            this.lastSyncedLabel = null;
            this.settingsOrderByTocIndex = null;
            this._currentFocusContext = 0 /* SettingsFocusContext.Search */;
            /** Don't spam warnings */
            this.hasWarnedMissingSettings = false;
            this.tocTreeDisposed = false;
            this.tocFocusedElement = null;
            this.treeFocusedElement = null;
            this.settingsTreeScrollTop = 0;
            this.installedExtensionIds = [];
            this.delayedFilterLogging = new async_1.Delayer(1000);
            this.localSearchDelayer = new async_1.Delayer(300);
            this.remoteSearchThrottle = new async_1.ThrottledDelayer(200);
            this.viewState = { settingsTarget: 3 /* ConfigurationTarget.USER_LOCAL */ };
            this.settingFastUpdateDelayer = new async_1.Delayer(SettingsEditor2_1.SETTING_UPDATE_FAST_DEBOUNCE);
            this.settingSlowUpdateDelayer = new async_1.Delayer(SettingsEditor2_1.SETTING_UPDATE_SLOW_DEBOUNCE);
            this.searchInputDelayer = new async_1.Delayer(SettingsEditor2_1.SEARCH_DEBOUNCE);
            this.updatedConfigSchemaDelayer = new async_1.Delayer(SettingsEditor2_1.CONFIG_SCHEMA_UPDATE_DELAYER);
            this.inSettingsEditorContextKey = preferences_1.CONTEXT_SETTINGS_EDITOR.bindTo(contextKeyService);
            this.searchFocusContextKey = preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS.bindTo(contextKeyService);
            this.tocRowFocused = preferences_1.CONTEXT_TOC_ROW_FOCUS.bindTo(contextKeyService);
            this.settingRowFocused = preferences_1.CONTEXT_SETTINGS_ROW_FOCUS.bindTo(contextKeyService);
            this.scheduledRefreshes = new Map();
            this.editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, SETTINGS_EDITOR_STATE_KEY);
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.source !== 7 /* ConfigurationTarget.DEFAULT */) {
                    this.onConfigUpdate(e.affectedKeys);
                }
            }));
            this._register(workspaceTrustManagementService.onDidChangeTrust(() => {
                this.searchResultModel?.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
                if (this.settingsTreeModel) {
                    this.settingsTreeModel.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
                    this.renderTree();
                }
            }));
            this._register(configurationService.onDidChangeRestrictedSettings(e => {
                if (e.default.length && this.currentSettingsModel) {
                    this.updateElementsByKey(new Set(e.default));
                }
            }));
            this.modelDisposables = this._register(new lifecycle_1.DisposableStore());
            if (preferences_1.ENABLE_LANGUAGE_FILTER && !SettingsEditor2_1.SUGGESTIONS.includes(`@${preferences_1.LANGUAGE_SETTING_TAG}`)) {
                SettingsEditor2_1.SUGGESTIONS.push(`@${preferences_1.LANGUAGE_SETTING_TAG}`);
            }
        }
        get minimumWidth() { return SettingsEditor2_1.EDITOR_MIN_WIDTH; }
        get maximumWidth() { return Number.POSITIVE_INFINITY; }
        get minimumHeight() { return 180; }
        // these setters need to exist because this extends from EditorPane
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        get currentSettingsModel() {
            return this.searchResultModel || this.settingsTreeModel;
        }
        get searchResultModel() {
            return this._searchResultModel;
        }
        set searchResultModel(value) {
            this._searchResultModel = value;
            this.rootElement.classList.toggle('search-mode', !!this._searchResultModel);
        }
        get focusedSettingDOMElement() {
            const focused = this.settingsTree.getFocus()[0];
            if (!(focused instanceof settingsTreeModels_1.SettingsTreeSettingElement)) {
                return;
            }
            return this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), focused.setting.key)[0];
        }
        get currentFocusContext() {
            return this._currentFocusContext;
        }
        createEditor(parent) {
            parent.setAttribute('tabindex', '-1');
            this.rootElement = DOM.append(parent, $('.settings-editor', { tabindex: '-1' }));
            this.createHeader(this.rootElement);
            this.createBody(this.rootElement);
            this.addCtrlAInterceptor(this.rootElement);
            this.updateStyles();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [this],
                focusNextWidget: () => {
                    if (this.searchWidget.inputWidget.hasWidgetFocus()) {
                        this.focusTOC();
                    }
                },
                focusPreviousWidget: () => {
                    if (!this.searchWidget.inputWidget.hasWidgetFocus()) {
                        this.focusSearch();
                    }
                }
            }));
        }
        async setInput(input, options, context, token) {
            this.inSettingsEditorContextKey.set(true);
            await super.setInput(input, options, context, token);
            if (!this.input) {
                return;
            }
            const model = await this.input.resolve(options);
            if (token.isCancellationRequested || !(model instanceof preferencesModels_1.Settings2EditorModel)) {
                return;
            }
            this.modelDisposables.clear();
            this.modelDisposables.add(model.onDidChangeGroups(() => {
                this.updatedConfigSchemaDelayer.trigger(() => {
                    this.onConfigUpdate(undefined, false, true);
                });
            }));
            this.defaultSettingsEditorModel = model;
            options = options || (0, preferences_2.validateSettingsEditorOptions)({});
            if (!this.viewState.settingsTarget || !this.settingsTargetsWidget.settingsTarget) {
                const optionsHasViewStateTarget = options.viewState && options.viewState.settingsTarget;
                if (!options.target && !optionsHasViewStateTarget) {
                    options.target = 3 /* ConfigurationTarget.USER_LOCAL */;
                }
            }
            this._setOptions(options);
            // Don't block setInput on render (which can trigger an async search)
            this.onConfigUpdate(undefined, true).then(() => {
                this._register(input.onWillDispose(() => {
                    this.searchWidget.setValue('');
                }));
                // Init TOC selection
                this.updateTreeScrollSync();
            });
            await this.refreshInstalledExtensionsList();
        }
        async refreshInstalledExtensionsList() {
            const installedExtensions = await this.extensionManagementService.getInstalled();
            this.installedExtensionIds = installedExtensions
                .filter(ext => ext.manifest && ext.manifest.contributes && ext.manifest.contributes.configuration)
                .map(ext => ext.identifier.id);
        }
        restoreCachedState() {
            const cachedState = this.group && this.input && this.editorMemento.loadEditorState(this.group, this.input);
            if (cachedState && typeof cachedState.target === 'object') {
                cachedState.target = uri_1.URI.revive(cachedState.target);
            }
            if (cachedState) {
                const settingsTarget = cachedState.target;
                this.settingsTargetsWidget.settingsTarget = settingsTarget;
                this.viewState.settingsTarget = settingsTarget;
                if (!this.searchWidget.getValue()) {
                    this.searchWidget.setValue(cachedState.searchQuery);
                }
            }
            if (this.input) {
                this.editorMemento.clearEditorState(this.input, this.group);
            }
            return cachedState ?? null;
        }
        getViewState() {
            return this.viewState;
        }
        setOptions(options) {
            super.setOptions(options);
            if (options) {
                this._setOptions(options);
            }
        }
        _setOptions(options) {
            if (options.focusSearch && !platform.isIOS) {
                // isIOS - #122044
                this.focusSearch();
            }
            const recoveredViewState = options.viewState ?
                options.viewState : undefined;
            const query = recoveredViewState?.query ?? options.query;
            if (query !== undefined) {
                this.searchWidget.setValue(query);
                this.viewState.query = query;
            }
            const target = options.folderUri ?? recoveredViewState?.settingsTarget ?? options.target;
            if (target) {
                this.settingsTargetsWidget.settingsTarget = target;
                this.viewState.settingsTarget = target;
            }
        }
        clearInput() {
            this.inSettingsEditorContextKey.set(false);
            super.clearInput();
        }
        layout(dimension) {
            this.dimension = dimension;
            if (!this.isVisible()) {
                return;
            }
            this.layoutSplitView(dimension);
            const innerWidth = Math.min(this.headerContainer.clientWidth, dimension.width) - 24 * 2; // 24px padding on left and right;
            // minus padding inside inputbox, countElement width, controls width, extra padding before countElement
            const monacoWidth = innerWidth - 10 - this.countElement.clientWidth - this.controlsElement.clientWidth - 12;
            this.searchWidget.layout(new DOM.Dimension(monacoWidth, 20));
            this.rootElement.classList.toggle('narrow-width', dimension.width < SettingsEditor2_1.NARROW_TOTAL_WIDTH);
        }
        focus() {
            super.focus();
            if (this._currentFocusContext === 0 /* SettingsFocusContext.Search */) {
                if (!platform.isIOS) {
                    // #122044
                    this.focusSearch();
                }
            }
            else if (this._currentFocusContext === 3 /* SettingsFocusContext.SettingControl */) {
                const element = this.focusedSettingDOMElement;
                if (element) {
                    const control = element.querySelector(settingsTree_1.AbstractSettingRenderer.CONTROL_SELECTOR);
                    if (control) {
                        control.focus();
                        return;
                    }
                }
            }
            else if (this._currentFocusContext === 2 /* SettingsFocusContext.SettingTree */) {
                this.settingsTree.domFocus();
            }
            else if (this._currentFocusContext === 1 /* SettingsFocusContext.TableOfContents */) {
                this.tocTree.domFocus();
            }
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (!visible) {
                // Wait for editor to be removed from DOM #106303
                setTimeout(() => {
                    this.searchWidget.onHide();
                }, 0);
            }
        }
        focusSettings(focusSettingInput = false) {
            const focused = this.settingsTree.getFocus();
            if (!focused.length) {
                this.settingsTree.focusFirst();
            }
            this.settingsTree.domFocus();
            if (focusSettingInput) {
                const controlInFocusedRow = this.settingsTree.getHTMLElement().querySelector(`.focused ${settingsTree_1.AbstractSettingRenderer.CONTROL_SELECTOR}`);
                if (controlInFocusedRow) {
                    controlInFocusedRow.focus();
                }
            }
        }
        focusTOC() {
            this.tocTree.domFocus();
        }
        showContextMenu() {
            const focused = this.settingsTree.getFocus()[0];
            const rowElement = this.focusedSettingDOMElement;
            if (rowElement && focused instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                this.settingRenderers.showContextMenu(focused, rowElement);
            }
        }
        focusSearch(filter, selectAll = true) {
            if (filter && this.searchWidget) {
                this.searchWidget.setValue(filter);
            }
            this.searchWidget.focus(selectAll);
        }
        clearSearchResults() {
            this.searchWidget.setValue('');
            this.focusSearch();
        }
        clearSearchFilters() {
            const query = this.searchWidget.getValue();
            const splitQuery = query.split(' ').filter(word => {
                return word.length && !SettingsEditor2_1.SUGGESTIONS.some(suggestion => word.startsWith(suggestion));
            });
            this.searchWidget.setValue(splitQuery.join(' '));
        }
        updateInputAriaLabel() {
            let label = searchBoxLabel;
            if (this.searchResultLabel) {
                label += `. ${this.searchResultLabel}`;
            }
            if (this.lastSyncedLabel) {
                label += `. ${this.lastSyncedLabel}`;
            }
            this.searchWidget.updateAriaLabel(label);
        }
        /**
         * Render the header of the Settings editor, which includes the content above the splitview.
         */
        createHeader(parent) {
            this.headerContainer = DOM.append(parent, $('.settings-header'));
            const searchContainer = DOM.append(this.headerContainer, $('.search-container'));
            const clearInputAction = new actions_1.Action(preferences_1.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, (0, nls_1.localize)('clearInput', "Clear Settings Search Input"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.preferencesClearInputIcon), false, async () => this.clearSearchResults());
            const filterAction = new actions_1.Action(preferences_1.SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS, (0, nls_1.localize)('filterInput', "Filter Settings"), themables_1.ThemeIcon.asClassName(preferencesIcons_1.preferencesFilterIcon));
            this.searchWidget = this._register(this.instantiationService.createInstance(suggestEnabledInput_1.SuggestEnabledInput, `${SettingsEditor2_1.ID}.searchbox`, searchContainer, {
                triggerCharacters: ['@', ':'],
                provideResults: (query) => {
                    // Based on testing, the trigger character is always at the end of the query.
                    // for the ':' trigger, only return suggestions if there was a '@' before it in the same word.
                    const queryParts = query.split(/\s/g);
                    if (queryParts[queryParts.length - 1].startsWith(`@${preferences_1.LANGUAGE_SETTING_TAG}`)) {
                        const sortedLanguages = this.languageService.getRegisteredLanguageIds().map(languageId => {
                            return `@${preferences_1.LANGUAGE_SETTING_TAG}${languageId} `;
                        }).sort();
                        return sortedLanguages.filter(langFilter => !query.includes(langFilter));
                    }
                    else if (queryParts[queryParts.length - 1].startsWith(`@${preferences_1.EXTENSION_SETTING_TAG}`)) {
                        const installedExtensionsTags = this.installedExtensionIds.map(extensionId => {
                            return `@${preferences_1.EXTENSION_SETTING_TAG}${extensionId} `;
                        }).sort();
                        return installedExtensionsTags.filter(extFilter => !query.includes(extFilter));
                    }
                    else if (queryParts[queryParts.length - 1].startsWith('@')) {
                        return SettingsEditor2_1.SUGGESTIONS.filter(tag => !query.includes(tag)).map(tag => tag.endsWith(':') ? tag : tag + ' ');
                    }
                    return [];
                }
            }, searchBoxLabel, 'settingseditor:searchinput' + SettingsEditor2_1.NUM_INSTANCES++, {
                placeholderText: searchBoxLabel,
                focusContextKey: this.searchFocusContextKey,
                styleOverrides: {
                    inputBorder: settingsEditorColorRegistry_1.settingsTextInputBorder
                }
                // TODO: Aria-live
            }));
            this._register(this.searchWidget.onDidFocus(() => {
                this._currentFocusContext = 0 /* SettingsFocusContext.Search */;
            }));
            this.countElement = DOM.append(searchContainer, DOM.$('.settings-count-widget.monaco-count-badge.long'));
            this.countElement.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeBackground);
            this.countElement.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeForeground);
            this.countElement.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder)}`;
            this._register(this.searchWidget.onInputDidChange(() => {
                const searchVal = this.searchWidget.getValue();
                clearInputAction.enabled = !!searchVal;
                this.searchInputDelayer.trigger(() => this.onSearchInputChanged());
            }));
            const headerControlsContainer = DOM.append(this.headerContainer, $('.settings-header-controls'));
            headerControlsContainer.style.borderColor = (0, colorRegistry_1.asCssVariable)(settingsEditorColorRegistry_1.settingsHeaderBorder);
            const targetWidgetContainer = DOM.append(headerControlsContainer, $('.settings-target-container'));
            this.settingsTargetsWidget = this._register(this.instantiationService.createInstance(preferencesWidgets_1.SettingsTargetsWidget, targetWidgetContainer, { enableRemoteSettings: true }));
            this.settingsTargetsWidget.settingsTarget = 3 /* ConfigurationTarget.USER_LOCAL */;
            this.settingsTargetsWidget.onDidTargetChange(target => this.onDidSettingsTargetChange(target));
            this._register(DOM.addDisposableListener(targetWidgetContainer, DOM.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.keyCode === 18 /* KeyCode.DownArrow */) {
                    this.focusSettings();
                }
            }));
            if (this.userDataSyncWorkbenchService.enabled && this.userDataSyncEnablementService.canToggleEnablement()) {
                const syncControls = this._register(this.instantiationService.createInstance(SyncControls, headerControlsContainer));
                this._register(syncControls.onDidChangeLastSyncedLabel(lastSyncedLabel => {
                    this.lastSyncedLabel = lastSyncedLabel;
                    this.updateInputAriaLabel();
                }));
            }
            this.controlsElement = DOM.append(searchContainer, DOM.$('.settings-clear-widget'));
            const actionBar = this._register(new actionbar_1.ActionBar(this.controlsElement, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action.id === filterAction.id) {
                        return this.instantiationService.createInstance(settingsSearchMenu_1.SettingsSearchFilterDropdownMenuActionViewItem, action, this.actionRunner, this.searchWidget);
                    }
                    return undefined;
                }
            }));
            actionBar.push([clearInputAction, filterAction], { label: false, icon: true });
        }
        onDidSettingsTargetChange(target) {
            this.viewState.settingsTarget = target;
            // TODO Instead of rebuilding the whole model, refresh and uncache the inspected setting value
            this.onConfigUpdate(undefined, true);
        }
        onDidClickSetting(evt, recursed) {
            const targetElement = this.currentSettingsModel.getElementsByName(evt.targetKey)?.[0];
            let revealFailed = false;
            if (targetElement) {
                let sourceTop = 0.5;
                try {
                    const _sourceTop = this.settingsTree.getRelativeTop(evt.source);
                    if (_sourceTop !== null) {
                        sourceTop = _sourceTop;
                    }
                }
                catch {
                    // e.g. clicked a searched element, now the search has been cleared
                }
                // If we search for something and focus on a category, the settings tree
                // only renders settings in that category.
                // If the target display category is different than the source's, unfocus the category
                // so that we can render all found settings again.
                // Then, the reveal call will correctly find the target setting.
                if (this.viewState.filterToCategory && evt.source.displayCategory !== targetElement.displayCategory) {
                    this.tocTree.setFocus([]);
                }
                try {
                    this.settingsTree.reveal(targetElement, sourceTop);
                }
                catch (_) {
                    // The listwidget couldn't find the setting to reveal,
                    // even though it's in the model, meaning there might be a filter
                    // preventing it from showing up.
                    revealFailed = true;
                }
                if (!revealFailed) {
                    // We need to shift focus from the setting that contains the link to the setting that's
                    // linked. Clicking on the link sets focus on the setting that contains the link,
                    // which is why we need the setTimeout.
                    setTimeout(() => {
                        this.settingsTree.setFocus([targetElement]);
                    }, 50);
                    const domElements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), evt.targetKey);
                    if (domElements && domElements[0]) {
                        const control = domElements[0].querySelector(settingsTree_1.AbstractSettingRenderer.CONTROL_SELECTOR);
                        if (control) {
                            control.focus();
                        }
                    }
                }
            }
            if (!recursed && (!targetElement || revealFailed)) {
                // We'll call this event handler again after clearing the search query,
                // so that more settings show up in the list.
                const p = this.triggerSearch('');
                p.then(() => {
                    this.searchWidget.setValue('');
                    this.onDidClickSetting(evt, true);
                });
            }
        }
        switchToSettingsFile() {
            const query = (0, settingsTreeModels_1.parseQuery)(this.searchWidget.getValue()).query;
            return this.openSettingsFile({ query });
        }
        async openSettingsFile(options) {
            const currentSettingsTarget = this.settingsTargetsWidget.settingsTarget;
            const openOptions = { jsonEditor: true, ...options };
            if (currentSettingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */) {
                if (options?.revealSetting) {
                    const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
                    const configurationScope = configurationProperties[options?.revealSetting.key]?.scope;
                    if (configurationScope === 1 /* ConfigurationScope.APPLICATION */) {
                        return this.preferencesService.openApplicationSettings(openOptions);
                    }
                }
                return this.preferencesService.openUserSettings(openOptions);
            }
            else if (currentSettingsTarget === 4 /* ConfigurationTarget.USER_REMOTE */) {
                return this.preferencesService.openRemoteSettings(openOptions);
            }
            else if (currentSettingsTarget === 5 /* ConfigurationTarget.WORKSPACE */) {
                return this.preferencesService.openWorkspaceSettings(openOptions);
            }
            else if (uri_1.URI.isUri(currentSettingsTarget)) {
                return this.preferencesService.openFolderSettings({ folderUri: currentSettingsTarget, ...openOptions });
            }
            return undefined;
        }
        createBody(parent) {
            this.bodyContainer = DOM.append(parent, $('.settings-body'));
            this.noResultsMessage = DOM.append(this.bodyContainer, $('.no-results-message'));
            this.noResultsMessage.innerText = (0, nls_1.localize)('noResults', "No Settings Found");
            this.clearFilterLinkContainer = $('span.clear-search-filters');
            this.clearFilterLinkContainer.textContent = ' - ';
            const clearFilterLink = DOM.append(this.clearFilterLinkContainer, $('a.pointer.prominent', { tabindex: 0 }, (0, nls_1.localize)('clearSearchFilters', 'Clear Filters')));
            this._register(DOM.addDisposableListener(clearFilterLink, DOM.EventType.CLICK, (e) => {
                DOM.EventHelper.stop(e, false);
                this.clearSearchFilters();
            }));
            DOM.append(this.noResultsMessage, this.clearFilterLinkContainer);
            this.noResultsMessage.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorForeground);
            this.tocTreeContainer = $('.settings-toc-container');
            this.settingsTreeContainer = $('.settings-tree-container');
            this.createTOC(this.tocTreeContainer);
            this.createSettingsTree(this.settingsTreeContainer);
            this.splitView = new splitview_1.SplitView(this.bodyContainer, {
                orientation: 1 /* Orientation.HORIZONTAL */,
                proportionalLayout: true
            });
            const startingWidth = this.storageService.getNumber('settingsEditor2.splitViewWidth', 0 /* StorageScope.PROFILE */, SettingsEditor2_1.TOC_RESET_WIDTH);
            this.splitView.addView({
                onDidChange: event_1.Event.None,
                element: this.tocTreeContainer,
                minimumSize: SettingsEditor2_1.TOC_MIN_WIDTH,
                maximumSize: Number.POSITIVE_INFINITY,
                layout: (width, _, height) => {
                    this.tocTreeContainer.style.width = `${width}px`;
                    this.tocTree.layout(height, width);
                }
            }, startingWidth, undefined, true);
            this.splitView.addView({
                onDidChange: event_1.Event.None,
                element: this.settingsTreeContainer,
                minimumSize: SettingsEditor2_1.EDITOR_MIN_WIDTH,
                maximumSize: Number.POSITIVE_INFINITY,
                layout: (width, _, height) => {
                    this.settingsTreeContainer.style.width = `${width}px`;
                    this.settingsTree.layout(height, width);
                }
            }, splitview_1.Sizing.Distribute, undefined, true);
            this._register(this.splitView.onDidSashReset(() => {
                const totalSize = this.splitView.getViewSize(0) + this.splitView.getViewSize(1);
                this.splitView.resizeView(0, SettingsEditor2_1.TOC_RESET_WIDTH);
                this.splitView.resizeView(1, totalSize - SettingsEditor2_1.TOC_RESET_WIDTH);
            }));
            this._register(this.splitView.onDidSashChange(() => {
                const width = this.splitView.getViewSize(0);
                this.storageService.store('settingsEditor2.splitViewWidth', width, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }));
            const borderColor = this.theme.getColor(settingsEditorColorRegistry_1.settingsSashBorder);
            this.splitView.style({ separatorBorder: borderColor });
        }
        addCtrlAInterceptor(container) {
            this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_DOWN, (e) => {
                if (e.keyCode === 31 /* KeyCode.KeyA */ &&
                    (platform.isMacintosh ? e.metaKey : e.ctrlKey) &&
                    e.target.tagName !== 'TEXTAREA' &&
                    e.target.tagName !== 'INPUT') {
                    // Avoid browser ctrl+a
                    e.browserEvent.stopPropagation();
                    e.browserEvent.preventDefault();
                }
            }));
        }
        createTOC(container) {
            this.tocTreeModel = this.instantiationService.createInstance(tocTree_1.TOCTreeModel, this.viewState);
            this.tocTree = this._register(this.instantiationService.createInstance(tocTree_1.TOCTree, DOM.append(container, $('.settings-toc-wrapper', {
                'role': 'navigation',
                'aria-label': (0, nls_1.localize)('settings', "Settings"),
            })), this.viewState));
            this.tocTreeDisposed = false;
            this._register(this.tocTree.onDidFocus(() => {
                this._currentFocusContext = 1 /* SettingsFocusContext.TableOfContents */;
            }));
            this._register(this.tocTree.onDidChangeFocus(e => {
                const element = e.elements?.[0] ?? null;
                if (this.tocFocusedElement === element) {
                    return;
                }
                this.tocFocusedElement = element;
                this.tocTree.setSelection(element ? [element] : []);
                if (this.searchResultModel) {
                    if (this.viewState.filterToCategory !== element) {
                        this.viewState.filterToCategory = element ?? undefined;
                        // Force render in this case, because
                        // onDidClickSetting relies on the updated view.
                        this.renderTree(undefined, true);
                        this.settingsTree.scrollTop = 0;
                    }
                }
                else if (element && (!e.browserEvent || !e.browserEvent.fromScroll)) {
                    this.settingsTree.reveal(element, 0);
                    this.settingsTree.setFocus([element]);
                }
            }));
            this._register(this.tocTree.onDidFocus(() => {
                this.tocRowFocused.set(true);
            }));
            this._register(this.tocTree.onDidBlur(() => {
                this.tocRowFocused.set(false);
            }));
            this._register(this.tocTree.onDidDispose(() => {
                this.tocTreeDisposed = true;
            }));
        }
        applyFilter(filter) {
            if (this.searchWidget && !this.searchWidget.getValue().includes(filter)) {
                // Prepend the filter to the query.
                const newQuery = `${filter} ${this.searchWidget.getValue().trimStart()}`;
                this.focusSearch(newQuery, false);
            }
        }
        removeLanguageFilters() {
            if (this.searchWidget && this.searchWidget.getValue().includes(`@${preferences_1.LANGUAGE_SETTING_TAG}`)) {
                const query = this.searchWidget.getValue().split(' ');
                const newQuery = query.filter(word => !word.startsWith(`@${preferences_1.LANGUAGE_SETTING_TAG}`)).join(' ');
                this.focusSearch(newQuery, false);
            }
        }
        createSettingsTree(container) {
            this.settingRenderers = this.instantiationService.createInstance(settingsTree_1.SettingTreeRenderers);
            this._register(this.settingRenderers.onDidChangeSetting(e => this.onDidChangeSetting(e.key, e.value, e.type, e.manualReset, e.scope)));
            this._register(this.settingRenderers.onDidOpenSettings(settingKey => {
                this.openSettingsFile({ revealSetting: { key: settingKey, edit: true } });
            }));
            this._register(this.settingRenderers.onDidClickSettingLink(settingName => this.onDidClickSetting(settingName)));
            this._register(this.settingRenderers.onDidFocusSetting(element => {
                this.settingsTree.setFocus([element]);
                this._currentFocusContext = 3 /* SettingsFocusContext.SettingControl */;
                this.settingRowFocused.set(false);
            }));
            this._register(this.settingRenderers.onDidChangeSettingHeight((params) => {
                const { element, height } = params;
                try {
                    this.settingsTree.updateElementHeight(element, height);
                }
                catch (e) {
                    // the element was not found
                }
            }));
            this._register(this.settingRenderers.onApplyFilter((filter) => this.applyFilter(filter)));
            this._register(this.settingRenderers.onDidClickOverrideElement((element) => {
                this.removeLanguageFilters();
                if (element.language) {
                    this.applyFilter(`@${preferences_1.LANGUAGE_SETTING_TAG}${element.language}`);
                }
                if (element.scope === 'workspace') {
                    this.settingsTargetsWidget.updateTarget(5 /* ConfigurationTarget.WORKSPACE */);
                }
                else if (element.scope === 'user') {
                    this.settingsTargetsWidget.updateTarget(3 /* ConfigurationTarget.USER_LOCAL */);
                }
                else if (element.scope === 'remote') {
                    this.settingsTargetsWidget.updateTarget(4 /* ConfigurationTarget.USER_REMOTE */);
                }
                this.applyFilter(`@${preferences_1.ID_SETTING_TAG}${element.settingKey}`);
            }));
            this.settingsTree = this._register(this.instantiationService.createInstance(settingsTree_1.SettingsTree, container, this.viewState, this.settingRenderers.allRenderers));
            this._register(this.settingsTree.onDidScroll(() => {
                if (this.settingsTree.scrollTop === this.settingsTreeScrollTop) {
                    return;
                }
                this.settingsTreeScrollTop = this.settingsTree.scrollTop;
                // setTimeout because calling setChildren on the settingsTree can trigger onDidScroll, so it fires when
                // setChildren has called on the settings tree but not the toc tree yet, so their rendered elements are out of sync
                setTimeout(() => {
                    this.updateTreeScrollSync();
                }, 0);
            }));
            this._register(this.settingsTree.onDidFocus(() => {
                const classList = container.ownerDocument.activeElement?.classList;
                if (classList && classList.contains('monaco-list') && classList.contains('settings-editor-tree')) {
                    this._currentFocusContext = 2 /* SettingsFocusContext.SettingTree */;
                    this.settingRowFocused.set(true);
                    this.treeFocusedElement ??= this.settingsTree.firstVisibleElement ?? null;
                    if (this.treeFocusedElement) {
                        this.treeFocusedElement.tabbable = true;
                    }
                }
            }));
            this._register(this.settingsTree.onDidBlur(() => {
                this.settingRowFocused.set(false);
                // Clear out the focused element, otherwise it could be
                // out of date during the next onDidFocus event.
                this.treeFocusedElement = null;
            }));
            // There is no different select state in the settings tree
            this._register(this.settingsTree.onDidChangeFocus(e => {
                const element = e.elements[0];
                if (this.treeFocusedElement === element) {
                    return;
                }
                if (this.treeFocusedElement) {
                    this.treeFocusedElement.tabbable = false;
                }
                this.treeFocusedElement = element;
                if (this.treeFocusedElement) {
                    this.treeFocusedElement.tabbable = true;
                }
                this.settingsTree.setSelection(element ? [element] : []);
            }));
        }
        onDidChangeSetting(key, value, type, manualReset, scope) {
            const parsedQuery = (0, settingsTreeModels_1.parseQuery)(this.searchWidget.getValue());
            const languageFilter = parsedQuery.languageFilter;
            if (manualReset || (this.pendingSettingUpdate && this.pendingSettingUpdate.key !== key)) {
                this.updateChangedSetting(key, value, manualReset, languageFilter, scope);
            }
            this.pendingSettingUpdate = { key, value, languageFilter };
            if (SettingsEditor2_1.shouldSettingUpdateFast(type)) {
                this.settingFastUpdateDelayer.trigger(() => this.updateChangedSetting(key, value, manualReset, languageFilter, scope));
            }
            else {
                this.settingSlowUpdateDelayer.trigger(() => this.updateChangedSetting(key, value, manualReset, languageFilter, scope));
            }
        }
        updateTreeScrollSync() {
            this.settingRenderers.cancelSuggesters();
            if (this.searchResultModel) {
                return;
            }
            if (!this.tocTreeModel) {
                return;
            }
            const elementToSync = this.settingsTree.firstVisibleElement;
            const element = elementToSync instanceof settingsTreeModels_1.SettingsTreeSettingElement ? elementToSync.parent :
                elementToSync instanceof settingsTreeModels_1.SettingsTreeGroupElement ? elementToSync :
                    null;
            // It's possible for this to be called when the TOC and settings tree are out of sync - e.g. when the settings tree has deferred a refresh because
            // it is focused. So, bail if element doesn't exist in the TOC.
            let nodeExists = true;
            try {
                this.tocTree.getNode(element);
            }
            catch (e) {
                nodeExists = false;
            }
            if (!nodeExists) {
                return;
            }
            if (element && this.tocTree.getSelection()[0] !== element) {
                const ancestors = this.getAncestors(element);
                ancestors.forEach(e => this.tocTree.expand(e));
                this.tocTree.reveal(element);
                const elementTop = this.tocTree.getRelativeTop(element);
                if (typeof elementTop !== 'number') {
                    return;
                }
                this.tocTree.collapseAll();
                ancestors.forEach(e => this.tocTree.expand(e));
                if (elementTop < 0 || elementTop > 1) {
                    this.tocTree.reveal(element);
                }
                else {
                    this.tocTree.reveal(element, elementTop);
                }
                this.tocTree.expand(element);
                this.tocTree.setSelection([element]);
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                fakeKeyboardEvent.fromScroll = true;
                this.tocTree.setFocus([element], fakeKeyboardEvent);
            }
        }
        getAncestors(element) {
            const ancestors = [];
            while (element.parent) {
                if (element.parent.id !== 'root') {
                    ancestors.push(element.parent);
                }
                element = element.parent;
            }
            return ancestors.reverse();
        }
        updateChangedSetting(key, value, manualReset, languageFilter, scope) {
            // ConfigurationService displays the error if this fails.
            // Force a render afterwards because onDidConfigurationUpdate doesn't fire if the update doesn't result in an effective setting value change.
            const settingsTarget = this.settingsTargetsWidget.settingsTarget;
            const resource = uri_1.URI.isUri(settingsTarget) ? settingsTarget : undefined;
            const configurationTarget = (resource ? 6 /* ConfigurationTarget.WORKSPACE_FOLDER */ : settingsTarget) ?? 3 /* ConfigurationTarget.USER_LOCAL */;
            const overrides = { resource, overrideIdentifiers: languageFilter ? [languageFilter] : undefined };
            const configurationTargetIsWorkspace = configurationTarget === 5 /* ConfigurationTarget.WORKSPACE */ || configurationTarget === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
            const userPassedInManualReset = configurationTargetIsWorkspace || !!languageFilter;
            const isManualReset = userPassedInManualReset ? manualReset : value === undefined;
            // If the user is changing the value back to the default, and we're not targeting a workspace scope, do a 'reset' instead
            const inspected = this.configurationService.inspect(key, overrides);
            if (!userPassedInManualReset && inspected.defaultValue === value) {
                value = undefined;
            }
            return this.configurationService.updateValue(key, value, overrides, configurationTarget, { handleDirtyFile: 'save' })
                .then(() => {
                const query = this.searchWidget.getValue();
                if (query.includes(`@${preferences_1.MODIFIED_SETTING_TAG}`)) {
                    // The user might have reset a setting.
                    this.refreshTOCTree();
                }
                this.renderTree(key, isManualReset);
                const reportModifiedProps = {
                    key,
                    query,
                    searchResults: this.searchResultModel?.getUniqueResults() ?? null,
                    rawResults: this.searchResultModel?.getRawResults() ?? null,
                    showConfiguredOnly: !!this.viewState.tagFilters && this.viewState.tagFilters.has(preferences_1.MODIFIED_SETTING_TAG),
                    isReset: typeof value === 'undefined',
                    settingsTarget: this.settingsTargetsWidget.settingsTarget
                };
                this.pendingSettingUpdate = null;
                return this.reportModifiedSetting(reportModifiedProps);
            });
        }
        reportModifiedSetting(props) {
            let groupId = undefined;
            let nlpIndex = undefined;
            let displayIndex = undefined;
            if (props.searchResults) {
                displayIndex = props.searchResults.filterMatches.findIndex(m => m.setting.key === props.key);
                if (this.searchResultModel) {
                    const rawResults = this.searchResultModel.getRawResults();
                    if (rawResults[0 /* SearchResultIdx.Local */] && displayIndex >= 0) {
                        const settingInLocalResults = rawResults[0 /* SearchResultIdx.Local */].filterMatches.some(m => m.setting.key === props.key);
                        groupId = settingInLocalResults ? 'local' : 'remote';
                    }
                    if (rawResults[1 /* SearchResultIdx.Remote */]) {
                        const _nlpIndex = rawResults[1 /* SearchResultIdx.Remote */].filterMatches.findIndex(m => m.setting.key === props.key);
                        nlpIndex = _nlpIndex >= 0 ? _nlpIndex : undefined;
                    }
                }
            }
            const reportedTarget = props.settingsTarget === 3 /* ConfigurationTarget.USER_LOCAL */ ? 'user' :
                props.settingsTarget === 4 /* ConfigurationTarget.USER_REMOTE */ ? 'user_remote' :
                    props.settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */ ? 'workspace' :
                        'folder';
            const data = {
                key: props.key,
                groupId,
                nlpIndex,
                displayIndex,
                showConfiguredOnly: props.showConfiguredOnly,
                isReset: props.isReset,
                target: reportedTarget
            };
            this.telemetryService.publicLog2('settingsEditor.settingModified', data);
        }
        scheduleRefresh(element, key = '') {
            if (key && this.scheduledRefreshes.has(key)) {
                return;
            }
            if (!key) {
                (0, lifecycle_1.dispose)(this.scheduledRefreshes.values());
                this.scheduledRefreshes.clear();
            }
            const scheduledRefreshTracker = DOM.trackFocus(element);
            this.scheduledRefreshes.set(key, scheduledRefreshTracker);
            scheduledRefreshTracker.onDidBlur(() => {
                scheduledRefreshTracker.dispose();
                this.scheduledRefreshes.delete(key);
                this.onConfigUpdate(new Set([key]));
            });
        }
        addOrRemoveManageExtensionSetting(setting, extension, groups) {
            const matchingGroups = groups.filter(g => {
                const lowerCaseId = g.extensionInfo?.id.toLowerCase();
                return (lowerCaseId === setting.stableExtensionId.toLowerCase() ||
                    lowerCaseId === setting.prereleaseExtensionId.toLowerCase());
            });
            const extensionId = setting.displayExtensionId;
            const extensionInstalled = this.installedExtensionIds.includes(extensionId);
            if (!matchingGroups.length && !extensionInstalled) {
                // Only show the recommendation when the extension hasn't been installed.
                const newGroup = {
                    sections: [{
                            settings: [setting],
                        }],
                    id: extensionId,
                    title: setting.extensionGroupTitle,
                    titleRange: preferencesModels_1.nullRange,
                    range: preferencesModels_1.nullRange,
                    extensionInfo: {
                        id: extensionId,
                        displayName: extension?.displayName,
                    }
                };
                groups.push(newGroup);
                return newGroup;
            }
            else if (matchingGroups.length >= 2 || extensionInstalled) {
                // Remove the group with the manage extension setting.
                const matchingGroupIndex = matchingGroups.findIndex(group => group.sections.length === 1 && group.sections[0].settings.length === 1 && group.sections[0].settings[0].displayExtensionId);
                if (matchingGroupIndex !== -1) {
                    groups.splice(matchingGroupIndex, 1);
                }
            }
            return undefined;
        }
        createSettingsOrderByTocIndex(resolvedSettingsRoot) {
            const index = new Map();
            function indexSettings(resolvedSettingsRoot, counter = 0) {
                if (resolvedSettingsRoot.settings) {
                    for (const setting of resolvedSettingsRoot.settings) {
                        if (!index.has(setting.key)) {
                            index.set(setting.key, counter++);
                        }
                    }
                }
                if (resolvedSettingsRoot.children) {
                    for (const child of resolvedSettingsRoot.children) {
                        counter = indexSettings(child, counter);
                    }
                }
                return counter;
            }
            indexSettings(resolvedSettingsRoot);
            return index;
        }
        refreshModels(resolvedSettingsRoot) {
            this.settingsTreeModel.update(resolvedSettingsRoot);
            this.tocTreeModel.settingsTreeRoot = this.settingsTreeModel.root;
            this.settingsOrderByTocIndex = this.createSettingsOrderByTocIndex(resolvedSettingsRoot);
        }
        async onConfigUpdate(keys, forceRefresh = false, schemaChange = false) {
            if (keys && this.settingsTreeModel) {
                return this.updateElementsByKey(keys);
            }
            if (!this.defaultSettingsEditorModel) {
                return;
            }
            const groups = this.defaultSettingsEditorModel.settingsGroups.slice(1); // Without commonlyUsed
            const coreSettings = groups.filter(g => !g.extensionInfo);
            const settingsResult = (0, settingsTree_1.resolveSettingsTree)(settingsLayout_1.tocData, coreSettings, this.logService);
            const resolvedSettingsRoot = settingsResult.tree;
            // Warn for settings not included in layout
            if (settingsResult.leftoverSettings.size && !this.hasWarnedMissingSettings) {
                const settingKeyList = [];
                settingsResult.leftoverSettings.forEach(s => {
                    settingKeyList.push(s.key);
                });
                this.logService.warn(`SettingsEditor2: Settings not included in settingsLayout.ts: ${settingKeyList.join(', ')}`);
                this.hasWarnedMissingSettings = true;
            }
            const additionalGroups = [];
            const toggleData = await (0, preferences_1.getExperimentalExtensionToggleData)(this.extensionGalleryService, this.productService);
            if (toggleData && groups.filter(g => g.extensionInfo).length) {
                for (const key in toggleData.settingsEditorRecommendedExtensions) {
                    const extension = toggleData.recommendedExtensionsGalleryInfo[key];
                    let manifest = null;
                    try {
                        manifest = await this.extensionGalleryService.getManifest(extension, cancellation_1.CancellationToken.None);
                    }
                    catch (e) {
                        // Likely a networking issue.
                        // Skip adding a button for this extension to the Settings editor.
                        continue;
                    }
                    const contributesConfiguration = manifest?.contributes?.configuration;
                    let groupTitle;
                    if (!Array.isArray(contributesConfiguration)) {
                        groupTitle = contributesConfiguration?.title;
                    }
                    else if (contributesConfiguration.length === 1) {
                        groupTitle = contributesConfiguration[0].title;
                    }
                    const extensionName = extension?.displayName ?? extension?.name ?? extension.identifier.id;
                    const settingKey = `${key}.manageExtension`;
                    const setting = {
                        range: preferencesModels_1.nullRange,
                        key: settingKey,
                        keyRange: preferencesModels_1.nullRange,
                        value: null,
                        valueRange: preferencesModels_1.nullRange,
                        description: [extension?.description || ''],
                        descriptionIsMarkdown: false,
                        descriptionRanges: [],
                        title: extensionName,
                        scope: 3 /* ConfigurationScope.WINDOW */,
                        type: 'null',
                        displayExtensionId: extension.identifier.id,
                        prereleaseExtensionId: key,
                        stableExtensionId: key,
                        extensionGroupTitle: groupTitle ?? extensionName
                    };
                    const additionalGroup = this.addOrRemoveManageExtensionSetting(setting, extension, groups);
                    if (additionalGroup) {
                        additionalGroups.push(additionalGroup);
                    }
                }
            }
            resolvedSettingsRoot.children.push(await (0, settingsTree_1.createTocTreeForExtensionSettings)(this.extensionService, groups.filter(g => g.extensionInfo)));
            const commonlyUsedDataToUse = (0, settingsLayout_1.getCommonlyUsedData)(toggleData);
            const commonlyUsed = (0, settingsTree_1.resolveSettingsTree)(commonlyUsedDataToUse, groups, this.logService);
            resolvedSettingsRoot.children.unshift(commonlyUsed.tree);
            if (toggleData) {
                // Add the additional groups to the model to help with searching.
                this.defaultSettingsEditorModel.setAdditionalGroups(additionalGroups);
            }
            if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && (this.viewState.settingsTarget instanceof uri_1.URI || this.viewState.settingsTarget === 5 /* ConfigurationTarget.WORKSPACE */)) {
                const configuredUntrustedWorkspaceSettings = (0, settingsTree_1.resolveConfiguredUntrustedSettings)(groups, this.viewState.settingsTarget, this.viewState.languageFilter, this.configurationService);
                if (configuredUntrustedWorkspaceSettings.length) {
                    resolvedSettingsRoot.children.unshift({
                        id: 'workspaceTrust',
                        label: (0, nls_1.localize)('settings require trust', "Workspace Trust"),
                        settings: configuredUntrustedWorkspaceSettings
                    });
                }
            }
            this.searchResultModel?.updateChildren();
            if (this.settingsTreeModel) {
                this.refreshModels(resolvedSettingsRoot);
                if (schemaChange && !!this.searchResultModel) {
                    // If an extension's settings were just loaded and a search is active, retrigger the search so it shows up
                    return await this.onSearchInputChanged();
                }
                this.refreshTOCTree();
                this.renderTree(undefined, forceRefresh);
            }
            else {
                this.settingsTreeModel = this.instantiationService.createInstance(settingsTreeModels_1.SettingsTreeModel, this.viewState, this.workspaceTrustManagementService.isWorkspaceTrusted());
                this.refreshModels(resolvedSettingsRoot);
                // Don't restore the cached state if we already have a query value from calling _setOptions().
                const cachedState = !this.viewState.query ? this.restoreCachedState() : undefined;
                if (cachedState?.searchQuery || this.searchWidget.getValue()) {
                    await this.onSearchInputChanged();
                }
                else {
                    this.refreshTOCTree();
                    this.refreshTree();
                    this.tocTree.collapseAll();
                }
            }
        }
        updateElementsByKey(keys) {
            if (keys.size) {
                if (this.searchResultModel) {
                    keys.forEach(key => this.searchResultModel.updateElementsByName(key));
                }
                if (this.settingsTreeModel) {
                    keys.forEach(key => this.settingsTreeModel.updateElementsByName(key));
                }
                // Attempt to render the tree once rather than
                // once for each key to avoid redundant calls to this.refreshTree()
                this.renderTree();
            }
            else {
                this.renderTree();
            }
        }
        getActiveControlInSettingsTree() {
            const element = this.settingsTree.getHTMLElement();
            const activeElement = element.ownerDocument.activeElement;
            return (activeElement && DOM.isAncestorOfActiveElement(element)) ?
                activeElement :
                null;
        }
        renderTree(key, force = false) {
            if (!force && key && this.scheduledRefreshes.has(key)) {
                this.updateModifiedLabelForKey(key);
                return;
            }
            // If the context view is focused, delay rendering settings
            if (this.contextViewFocused()) {
                const element = DOM.getWindow(this.settingsTree.getHTMLElement()).document.querySelector('.context-view');
                if (element) {
                    this.scheduleRefresh(element, key);
                }
                return;
            }
            // If a setting control is currently focused, schedule a refresh for later
            const activeElement = this.getActiveControlInSettingsTree();
            const focusedSetting = activeElement && this.settingRenderers.getSettingDOMElementForDOMElement(activeElement);
            if (focusedSetting && !force) {
                // If a single setting is being refreshed, it's ok to refresh now if that is not the focused setting
                if (key) {
                    const focusedKey = focusedSetting.getAttribute(settingsTree_1.AbstractSettingRenderer.SETTING_KEY_ATTR);
                    if (focusedKey === key &&
                        // update `list`s live, as they have a separate "submit edit" step built in before this
                        (focusedSetting.parentElement && !focusedSetting.parentElement.classList.contains('setting-item-list'))) {
                        this.updateModifiedLabelForKey(key);
                        this.scheduleRefresh(focusedSetting, key);
                        return;
                    }
                }
                else {
                    this.scheduleRefresh(focusedSetting);
                    return;
                }
            }
            this.renderResultCountMessages();
            if (key) {
                const elements = this.currentSettingsModel.getElementsByName(key);
                if (elements && elements.length) {
                    // TODO https://github.com/microsoft/vscode/issues/57360
                    this.refreshTree();
                }
                else {
                    // Refresh requested for a key that we don't know about
                    return;
                }
            }
            else {
                this.refreshTree();
            }
            return;
        }
        contextViewFocused() {
            return !!DOM.findParentWithClass(this.rootElement.ownerDocument.activeElement, 'context-view');
        }
        refreshTree() {
            if (this.isVisible()) {
                this.settingsTree.setChildren(null, createGroupIterator(this.currentSettingsModel.root));
            }
        }
        refreshTOCTree() {
            if (this.isVisible()) {
                this.tocTreeModel.update();
                this.tocTree.setChildren(null, (0, tocTree_1.createTOCIterator)(this.tocTreeModel, this.tocTree));
            }
        }
        updateModifiedLabelForKey(key) {
            const dataElements = this.currentSettingsModel.getElementsByName(key);
            const isModified = dataElements && dataElements[0] && dataElements[0].isConfigured; // all elements are either configured or not
            const elements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), key);
            if (elements && elements[0]) {
                elements[0].classList.toggle('is-configured', !!isModified);
            }
        }
        async onSearchInputChanged() {
            if (!this.currentSettingsModel) {
                // Initializing search widget value
                return;
            }
            const query = this.searchWidget.getValue().trim();
            this.viewState.query = query;
            this.delayedFilterLogging.cancel();
            await this.triggerSearch(query.replace(/\u203A/g, ' '));
            if (query && this.searchResultModel) {
                this.delayedFilterLogging.trigger(() => this.reportFilteringUsed(this.searchResultModel));
            }
        }
        parseSettingFromJSON(query) {
            const match = query.match(/"([a-zA-Z.]+)": /);
            return match && match[1];
        }
        /**
         * Toggles the visibility of the Settings editor table of contents during a search
         * depending on the behavior.
         */
        toggleTocBySearchBehaviorType() {
            const tocBehavior = this.configurationService.getValue(SEARCH_TOC_BEHAVIOR_KEY);
            const hideToc = tocBehavior === 'hide';
            if (hideToc) {
                this.splitView.setViewVisible(0, false);
                this.splitView.style({
                    separatorBorder: color_1.Color.transparent
                });
            }
            else {
                this.splitView.setViewVisible(0, true);
                this.splitView.style({
                    separatorBorder: this.theme.getColor(settingsEditorColorRegistry_1.settingsSashBorder)
                });
            }
        }
        async triggerSearch(query) {
            const progressRunner = this.editorProgressService.show(true);
            this.viewState.tagFilters = new Set();
            this.viewState.extensionFilters = new Set();
            this.viewState.featureFilters = new Set();
            this.viewState.idFilters = new Set();
            this.viewState.languageFilter = undefined;
            if (query) {
                const parsedQuery = (0, settingsTreeModels_1.parseQuery)(query);
                query = parsedQuery.query;
                parsedQuery.tags.forEach(tag => this.viewState.tagFilters.add(tag));
                parsedQuery.extensionFilters.forEach(extensionId => this.viewState.extensionFilters.add(extensionId));
                parsedQuery.featureFilters.forEach(feature => this.viewState.featureFilters.add(feature));
                parsedQuery.idFilters.forEach(id => this.viewState.idFilters.add(id));
                this.viewState.languageFilter = parsedQuery.languageFilter;
            }
            this.settingsTargetsWidget.updateLanguageFilterIndicators(this.viewState.languageFilter);
            if (query && query !== '@') {
                query = this.parseSettingFromJSON(query) || query;
                await this.triggerFilterPreferences(query);
                this.toggleTocBySearchBehaviorType();
            }
            else {
                if (this.viewState.tagFilters.size || this.viewState.extensionFilters.size || this.viewState.featureFilters.size || this.viewState.idFilters.size || this.viewState.languageFilter) {
                    this.searchResultModel = this.createFilterModel();
                }
                else {
                    this.searchResultModel = null;
                }
                this.localSearchDelayer.cancel();
                this.remoteSearchThrottle.cancel();
                if (this.searchInProgress) {
                    this.searchInProgress.cancel();
                    this.searchInProgress.dispose();
                    this.searchInProgress = null;
                }
                this.tocTree.setFocus([]);
                this.viewState.filterToCategory = undefined;
                this.tocTreeModel.currentSearchModel = this.searchResultModel;
                if (this.searchResultModel) {
                    // Added a filter model
                    this.tocTree.setSelection([]);
                    this.tocTree.expandAll();
                    this.refreshTOCTree();
                    this.renderResultCountMessages();
                    this.refreshTree();
                    this.toggleTocBySearchBehaviorType();
                }
                else if (!this.tocTreeDisposed) {
                    // Leaving search mode
                    this.tocTree.collapseAll();
                    this.refreshTOCTree();
                    this.renderResultCountMessages();
                    this.refreshTree();
                    // Always show the ToC when leaving search mode
                    this.splitView.setViewVisible(0, true);
                }
            }
            progressRunner.done();
        }
        /**
         * Return a fake SearchResultModel which can hold a flat list of all settings, to be filtered (@modified etc)
         */
        createFilterModel() {
            const filterModel = this.instantiationService.createInstance(settingsTreeModels_1.SearchResultModel, this.viewState, this.settingsOrderByTocIndex, this.workspaceTrustManagementService.isWorkspaceTrusted());
            const fullResult = {
                filterMatches: []
            };
            for (const g of this.defaultSettingsEditorModel.settingsGroups.slice(1)) {
                for (const sect of g.sections) {
                    for (const setting of sect.settings) {
                        fullResult.filterMatches.push({ setting, matches: [], matchType: preferences_2.SettingMatchType.None, score: 0 });
                    }
                }
            }
            filterModel.setResult(0, fullResult);
            return filterModel;
        }
        reportFilteringUsed(searchResultModel) {
            if (!searchResultModel) {
                return;
            }
            // Count unique results
            const counts = {};
            const rawResults = searchResultModel.getRawResults();
            const filterResult = rawResults[0 /* SearchResultIdx.Local */];
            if (filterResult) {
                counts['filterResult'] = filterResult.filterMatches.length;
            }
            const nlpResult = rawResults[1 /* SearchResultIdx.Remote */];
            if (nlpResult) {
                counts['nlpResult'] = nlpResult.filterMatches.length;
            }
            const uniqueResults = searchResultModel.getUniqueResults();
            const data = {
                'counts.nlpResult': counts['nlpResult'],
                'counts.filterResult': counts['filterResult'],
                'counts.uniqueResultsCount': uniqueResults?.filterMatches.length
            };
            this.telemetryService.publicLog2('settingsEditor.filter', data);
        }
        triggerFilterPreferences(query) {
            if (this.searchInProgress) {
                this.searchInProgress.cancel();
                this.searchInProgress = null;
            }
            // Trigger the local search. If it didn't find an exact match, trigger the remote search.
            const searchInProgress = this.searchInProgress = new cancellation_1.CancellationTokenSource();
            return this.localSearchDelayer.trigger(async () => {
                if (searchInProgress && !searchInProgress.token.isCancellationRequested) {
                    const result = await this.localFilterPreferences(query);
                    if (result && !result.exactMatch) {
                        this.remoteSearchThrottle.trigger(async () => {
                            if (searchInProgress && !searchInProgress.token.isCancellationRequested) {
                                await this.remoteSearchPreferences(query, this.searchInProgress?.token);
                            }
                        });
                    }
                }
            });
        }
        localFilterPreferences(query, token) {
            const localSearchProvider = this.preferencesSearchService.getLocalSearchProvider(query);
            return this.filterOrSearchPreferences(query, 0 /* SearchResultIdx.Local */, localSearchProvider, token);
        }
        remoteSearchPreferences(query, token) {
            const remoteSearchProvider = this.preferencesSearchService.getRemoteSearchProvider(query);
            const newExtSearchProvider = this.preferencesSearchService.getRemoteSearchProvider(query, true);
            return Promise.all([
                this.filterOrSearchPreferences(query, 1 /* SearchResultIdx.Remote */, remoteSearchProvider, token),
                this.filterOrSearchPreferences(query, 2 /* SearchResultIdx.NewExtensions */, newExtSearchProvider, token)
            ]).then(() => { });
        }
        async filterOrSearchPreferences(query, type, searchProvider, token) {
            const result = await this._filterOrSearchPreferencesModel(query, this.defaultSettingsEditorModel, searchProvider, token);
            if (token?.isCancellationRequested) {
                // Handle cancellation like this because cancellation is lost inside the search provider due to async/await
                return null;
            }
            if (!this.searchResultModel) {
                this.searchResultModel = this.instantiationService.createInstance(settingsTreeModels_1.SearchResultModel, this.viewState, this.settingsOrderByTocIndex, this.workspaceTrustManagementService.isWorkspaceTrusted());
                // Must be called before this.renderTree()
                // to make sure the search results count is set.
                this.searchResultModel.setResult(type, result);
                this.tocTreeModel.currentSearchModel = this.searchResultModel;
            }
            else {
                this.searchResultModel.setResult(type, result);
                this.tocTreeModel.update();
            }
            if (type === 0 /* SearchResultIdx.Local */) {
                this.tocTree.setFocus([]);
                this.viewState.filterToCategory = undefined;
                this.tocTree.expandAll();
            }
            this.settingsTree.scrollTop = 0;
            this.refreshTOCTree();
            this.renderTree(undefined, true);
            return result;
        }
        renderResultCountMessages() {
            if (!this.currentSettingsModel) {
                return;
            }
            this.clearFilterLinkContainer.style.display = this.viewState.tagFilters && this.viewState.tagFilters.size > 0
                ? 'initial'
                : 'none';
            if (!this.searchResultModel) {
                if (this.countElement.style.display !== 'none') {
                    this.searchResultLabel = null;
                    this.updateInputAriaLabel();
                    this.countElement.style.display = 'none';
                    this.countElement.innerText = '';
                    this.layout(this.dimension);
                }
                this.rootElement.classList.remove('no-results');
                this.splitView.el.style.visibility = 'visible';
                return;
            }
            else {
                const count = this.searchResultModel.getUniqueResultsCount();
                let resultString;
                switch (count) {
                    case 0:
                        resultString = (0, nls_1.localize)('noResults', "No Settings Found");
                        break;
                    case 1:
                        resultString = (0, nls_1.localize)('oneResult', "1 Setting Found");
                        break;
                    default: resultString = (0, nls_1.localize)('moreThanOneResult', "{0} Settings Found", count);
                }
                this.searchResultLabel = resultString;
                this.updateInputAriaLabel();
                this.countElement.innerText = resultString;
                aria.status(resultString);
                if (this.countElement.style.display !== 'block') {
                    this.countElement.style.display = 'block';
                    this.layout(this.dimension);
                }
                this.rootElement.classList.toggle('no-results', count === 0);
                this.splitView.el.style.visibility = count === 0 ? 'hidden' : 'visible';
            }
        }
        _filterOrSearchPreferencesModel(filter, model, provider, token) {
            const searchP = provider ? provider.searchModel(model, token) : Promise.resolve(null);
            return searchP
                .then(undefined, err => {
                if ((0, errors_1.isCancellationError)(err)) {
                    return Promise.reject(err);
                }
                else {
                    // type SettingsSearchErrorEvent = {
                    // 	'message': string;
                    // };
                    // type SettingsSearchErrorClassification = {
                    // 	owner: 'rzhao271';
                    // 	comment: 'Helps understand when settings search errors out';
                    // 	'message': { 'classification': 'CallstackOrException'; 'purpose': 'FeatureInsight'; 'owner': 'rzhao271'; 'comment': 'The error message of the search error.' };
                    // };
                    // const message = getErrorMessage(err).trim();
                    // if (message && message !== 'Error') {
                    // 	// "Error" = any generic network error
                    // 	this.telemetryService.publicLogError2<SettingsSearchErrorEvent, SettingsSearchErrorClassification>('settingsEditor.searchError', { message });
                    // 	this.logService.info('Setting search error: ' + message);
                    // }
                    return null;
                }
            });
        }
        layoutSplitView(dimension) {
            const listHeight = dimension.height - (72 + 11 + 14 /* header height + editor padding */);
            this.splitView.el.style.height = `${listHeight}px`;
            // We call layout first so the splitView has an idea of how much
            // space it has, otherwise setViewVisible results in the first panel
            // showing up at the minimum size whenever the Settings editor
            // opens for the first time.
            this.splitView.layout(this.bodyContainer.clientWidth, listHeight);
            const tocBehavior = this.configurationService.getValue(SEARCH_TOC_BEHAVIOR_KEY);
            const hideTocForSearch = tocBehavior === 'hide' && this.searchResultModel;
            if (!hideTocForSearch) {
                const firstViewWasVisible = this.splitView.isViewVisible(0);
                const firstViewVisible = this.bodyContainer.clientWidth >= SettingsEditor2_1.NARROW_TOTAL_WIDTH;
                this.splitView.setViewVisible(0, firstViewVisible);
                // If the first view is again visible, and we have enough space, immediately set the
                // editor to use the reset width rather than the cached min width
                if (!firstViewWasVisible && firstViewVisible && this.bodyContainer.clientWidth >= SettingsEditor2_1.EDITOR_MIN_WIDTH + SettingsEditor2_1.TOC_RESET_WIDTH) {
                    this.splitView.resizeView(0, SettingsEditor2_1.TOC_RESET_WIDTH);
                }
                this.splitView.style({
                    separatorBorder: firstViewVisible ? this.theme.getColor(settingsEditorColorRegistry_1.settingsSashBorder) : color_1.Color.transparent
                });
            }
        }
        saveState() {
            if (this.isVisible()) {
                const searchQuery = this.searchWidget.getValue().trim();
                const target = this.settingsTargetsWidget.settingsTarget;
                if (this.group && this.input) {
                    this.editorMemento.saveEditorState(this.group, this.input, { searchQuery, target });
                }
            }
            else if (this.group && this.input) {
                this.editorMemento.clearEditorState(this.input, this.group);
            }
            super.saveState();
        }
    };
    exports.SettingsEditor2 = SettingsEditor2;
    exports.SettingsEditor2 = SettingsEditor2 = SettingsEditor2_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, configuration_1.IWorkbenchConfigurationService),
        __param(2, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(3, themeService_1.IThemeService),
        __param(4, preferences_2.IPreferencesService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, preferences_1.IPreferencesSearchService),
        __param(7, log_1.ILogService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, storage_1.IStorageService),
        __param(10, editorGroupsService_1.IEditorGroupsService),
        __param(11, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(12, userDataSync_1.IUserDataSyncEnablementService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(14, extensions_1.IExtensionService),
        __param(15, language_1.ILanguageService),
        __param(16, extensionManagement_1.IExtensionManagementService),
        __param(17, productService_1.IProductService),
        __param(18, extensionManagement_1.IExtensionGalleryService),
        __param(19, progress_1.IEditorProgressService)
    ], SettingsEditor2);
    let SyncControls = class SyncControls extends lifecycle_1.Disposable {
        constructor(container, commandService, userDataSyncService, userDataSyncEnablementService, telemetryService) {
            super();
            this.commandService = commandService;
            this.userDataSyncService = userDataSyncService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this._onDidChangeLastSyncedLabel = this._register(new event_1.Emitter());
            this.onDidChangeLastSyncedLabel = this._onDidChangeLastSyncedLabel.event;
            const headerRightControlsContainer = DOM.append(container, $('.settings-right-controls'));
            const turnOnSyncButtonContainer = DOM.append(headerRightControlsContainer, $('.turn-on-sync'));
            this.turnOnSyncButton = this._register(new button_1.Button(turnOnSyncButtonContainer, { title: true, ...defaultStyles_1.defaultButtonStyles }));
            this.lastSyncedLabel = DOM.append(headerRightControlsContainer, $('.last-synced-label'));
            DOM.hide(this.lastSyncedLabel);
            this.turnOnSyncButton.enabled = true;
            this.turnOnSyncButton.label = (0, nls_1.localize)('turnOnSyncButton', "Backup and Sync Settings");
            DOM.hide(this.turnOnSyncButton.element);
            this._register(this.turnOnSyncButton.onDidClick(async () => {
                telemetryService.publicLog2('sync/turnOnSyncFromSettings');
                await this.commandService.executeCommand('workbench.userDataSync.actions.turnOn');
            }));
            this.updateLastSyncedTime();
            this._register(this.userDataSyncService.onDidChangeLastSyncTime(() => {
                this.updateLastSyncedTime();
            }));
            const updateLastSyncedTimer = this._register(new DOM.WindowIntervalTimer());
            updateLastSyncedTimer.cancelAndSet(() => this.updateLastSyncedTime(), 60 * 1000, DOM.getWindow(container));
            this.update();
            this._register(this.userDataSyncService.onDidChangeStatus(() => {
                this.update();
            }));
            this._register(this.userDataSyncEnablementService.onDidChangeEnablement(() => {
                this.update();
            }));
        }
        updateLastSyncedTime() {
            const last = this.userDataSyncService.lastSyncTime;
            let label;
            if (typeof last === 'number') {
                const d = (0, date_1.fromNow)(last, true, undefined, true);
                label = (0, nls_1.localize)('lastSyncedLabel', "Last synced: {0}", d);
            }
            else {
                label = '';
            }
            this.lastSyncedLabel.textContent = label;
            this._onDidChangeLastSyncedLabel.fire(label);
        }
        update() {
            if (this.userDataSyncService.status === "uninitialized" /* SyncStatus.Uninitialized */) {
                return;
            }
            if (this.userDataSyncEnablementService.isEnabled() || this.userDataSyncService.status !== "idle" /* SyncStatus.Idle */) {
                DOM.show(this.lastSyncedLabel);
                DOM.hide(this.turnOnSyncButton.element);
            }
            else {
                DOM.hide(this.lastSyncedLabel);
                DOM.show(this.turnOnSyncButton.element);
            }
        }
    };
    SyncControls = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, userDataSync_1.IUserDataSyncService),
        __param(3, userDataSync_1.IUserDataSyncEnablementService),
        __param(4, telemetry_1.ITelemetryService)
    ], SyncControls);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NFZGl0b3IyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3NldHRpbmdzRWRpdG9yMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUVoRyxJQUFrQixvQkFLakI7SUFMRCxXQUFrQixvQkFBb0I7UUFDckMsbUVBQU0sQ0FBQTtRQUNOLHFGQUFlLENBQUE7UUFDZiw2RUFBVyxDQUFBO1FBQ1gsbUZBQWMsQ0FBQTtJQUNmLENBQUMsRUFMaUIsb0JBQW9CLG9DQUFwQixvQkFBb0IsUUFLckM7SUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxLQUErQjtRQUNsRSxPQUFPLG1CQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDdkMsT0FBTztnQkFDTixPQUFPLEVBQUUsQ0FBQztnQkFDVixRQUFRLEVBQUUsQ0FBQyxZQUFZLDZDQUF3QixDQUFDLENBQUM7b0JBQ2hELG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hCLFNBQVM7YUFDVixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBVEQsa0RBU0M7SUFFRCxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBTWhCLE1BQU0sY0FBYyxHQUFHLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDL0UsTUFBTSx1QkFBdUIsR0FBRyw4Q0FBOEMsQ0FBQztJQUUvRSxNQUFNLHlCQUF5QixHQUFHLHFCQUFxQixDQUFDO0lBQ2pELElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsdUJBQVU7O2lCQUU5QixPQUFFLEdBQVcsNEJBQTRCLEFBQXZDLENBQXdDO2lC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
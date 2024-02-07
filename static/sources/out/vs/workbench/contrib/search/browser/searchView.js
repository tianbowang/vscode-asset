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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/tree/tree", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/network", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/selection", "vs/editor/contrib/find/browser/findController", "vs/editor/contrib/multicursor/browser/multicursor", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/browser/dnd", "vs/workbench/browser/labels", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/memento", "vs/workbench/common/views", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/search/browser/patternInputWidget", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/browser/searchMessage", "vs/workbench/contrib/search/browser/searchResultsView", "vs/workbench/contrib/search/browser/searchWidget", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/common/searchHistoryService", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/searchEditor/browser/searchEditorActions", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/search/common/search", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/contrib/notebook/common/notebookService", "vs/platform/log/common/log", "vs/platform/audioCues/browser/audioCueService", "vs/css!./media/searchview"], function (require, exports, dom, keyboardEvent_1, aria, tree_1, async_1, errors, event_1, iterator_1, lifecycle_1, env, strings, uri_1, network, editorBrowser_1, codeEditorService_1, embeddedCodeEditorWidget_1, selection_1, findController_1, multicursor_1, nls, accessibility_1, actions_1, commands_1, configuration_1, contextkey_1, contextView_1, dialogs_1, files_1, instantiation_1, serviceCollection_1, keybinding_1, listService_1, notification_1, opener_1, progress_1, storage_1, telemetry_1, defaultStyles_1, themeService_1, themables_1, workspace_1, workspaceActions_1, dnd_1, labels_1, viewPane_1, memento_1, views_1, notebookEditor_1, patternInputWidget_1, searchActionsBase_1, searchIcons_1, searchMessage_1, searchResultsView_1, searchWidget_1, Constants, replace_1, search_1, searchHistoryService_1, searchModel_1, searchEditorActions_1, editorService_1, preferences_1, queryBuilder_1, search_2, textfiles_1, notebookService_1, log_1, audioCueService_1) {
    "use strict";
    var SearchView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSelectionTextFromEditor = exports.getEditorSelectionFromMatch = exports.SearchView = exports.SearchViewPosition = void 0;
    const $ = dom.$;
    var SearchViewPosition;
    (function (SearchViewPosition) {
        SearchViewPosition[SearchViewPosition["SideBar"] = 0] = "SideBar";
        SearchViewPosition[SearchViewPosition["Panel"] = 1] = "Panel";
    })(SearchViewPosition || (exports.SearchViewPosition = SearchViewPosition = {}));
    const SEARCH_CANCELLED_MESSAGE = nls.localize('searchCanceled', "Search was canceled before any results could be found - ");
    const DEBOUNCE_DELAY = 75;
    let SearchView = class SearchView extends viewPane_1.ViewPane {
        static { SearchView_1 = this; }
        static { this.ACTIONS_RIGHT_CLASS_NAME = 'actions-right'; }
        constructor(options, fileService, editorService, codeEditorService, progressService, notificationService, dialogService, commandService, contextViewService, instantiationService, viewDescriptorService, configurationService, contextService, searchViewModelWorkbenchService, contextKeyService, replaceService, textFileService, preferencesService, themeService, searchHistoryService, contextMenuService, accessibilityService, keybindingService, storageService, openerService, telemetryService, notebookService, logService, audioCueService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.fileService = fileService;
            this.editorService = editorService;
            this.codeEditorService = codeEditorService;
            this.progressService = progressService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.commandService = commandService;
            this.contextViewService = contextViewService;
            this.contextService = contextService;
            this.searchViewModelWorkbenchService = searchViewModelWorkbenchService;
            this.replaceService = replaceService;
            this.textFileService = textFileService;
            this.preferencesService = preferencesService;
            this.searchHistoryService = searchHistoryService;
            this.accessibilityService = accessibilityService;
            this.storageService = storageService;
            this.notebookService = notebookService;
            this.logService = logService;
            this.audioCueService = audioCueService;
            this.isDisposed = false;
            this.lastFocusState = 'input';
            this.messageDisposables = new lifecycle_1.DisposableStore();
            this.changedWhileHidden = false;
            this.currentSearchQ = Promise.resolve();
            this.pauseSearching = false;
            this._visibleMatches = 0;
            this.container = dom.$('.search-view');
            // globals
            this.viewletVisible = Constants.SearchViewVisibleKey.bindTo(this.contextKeyService);
            this.firstMatchFocused = Constants.FirstMatchFocusKey.bindTo(this.contextKeyService);
            this.fileMatchOrMatchFocused = Constants.FileMatchOrMatchFocusKey.bindTo(this.contextKeyService);
            this.fileMatchOrFolderMatchFocus = Constants.FileMatchOrFolderMatchFocusKey.bindTo(this.contextKeyService);
            this.fileMatchOrFolderMatchWithResourceFocus = Constants.FileMatchOrFolderMatchWithResourceFocusKey.bindTo(this.contextKeyService);
            this.fileMatchFocused = Constants.FileFocusKey.bindTo(this.contextKeyService);
            this.folderMatchFocused = Constants.FolderFocusKey.bindTo(this.contextKeyService);
            this.folderMatchWithResourceFocused = Constants.ResourceFolderFocusKey.bindTo(this.contextKeyService);
            this.hasSearchResultsKey = Constants.HasSearchResults.bindTo(this.contextKeyService);
            this.matchFocused = Constants.MatchFocusKey.bindTo(this.contextKeyService);
            this.searchStateKey = search_1.SearchStateKey.bindTo(this.contextKeyService);
            this.hasSearchPatternKey = Constants.ViewHasSearchPatternKey.bindTo(this.contextKeyService);
            this.hasReplacePatternKey = Constants.ViewHasReplacePatternKey.bindTo(this.contextKeyService);
            this.hasFilePatternKey = Constants.ViewHasFilePatternKey.bindTo(this.contextKeyService);
            this.hasSomeCollapsibleResultKey = Constants.ViewHasSomeCollapsibleKey.bindTo(this.contextKeyService);
            this.treeViewKey = Constants.InTreeViewKey.bindTo(this.contextKeyService);
            // scoped
            this.contextKeyService = this._register(this.contextKeyService.createScoped(this.container));
            Constants.SearchViewFocusedKey.bindTo(this.contextKeyService).set(true);
            this.inputBoxFocused = Constants.InputBoxFocusedKey.bindTo(this.contextKeyService);
            this.inputPatternIncludesFocused = Constants.PatternIncludesFocusedKey.bindTo(this.contextKeyService);
            this.inputPatternExclusionsFocused = Constants.PatternExcludesFocusedKey.bindTo(this.contextKeyService);
            this.isEditableItem = Constants.IsEditableItemKey.bindTo(this.contextKeyService);
            this.instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.contextKeyService]));
            this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('search.sortOrder')) {
                    if (this.searchConfig.sortOrder === "modified" /* SearchSortOrder.Modified */) {
                        // If changing away from modified, remove all fileStats
                        // so that updated files are re-retrieved next time.
                        this.removeFileStats();
                    }
                    this.refreshTree();
                }
            });
            this.viewModel = this._register(this.searchViewModelWorkbenchService.searchModel);
            this.queryBuilder = this.instantiationService.createInstance(queryBuilder_1.QueryBuilder);
            this.memento = new memento_1.Memento(this.id, storageService);
            this.viewletState = this.memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this._register(this.fileService.onDidFilesChange(e => this.onFilesChanged(e)));
            this._register(this.textFileService.untitled.onWillDispose(model => this.onUntitledDidDispose(model.resource)));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));
            this._register(this.searchHistoryService.onDidClearHistory(() => this.clearHistory()));
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            this.delayedRefresh = this._register(new async_1.Delayer(250));
            this.addToSearchHistoryDelayer = this._register(new async_1.Delayer(2000));
            this.toggleCollapseStateDelayer = this._register(new async_1.Delayer(100));
            this.triggerQueryDelayer = this._register(new async_1.Delayer(0));
            this.treeAccessibilityProvider = this.instantiationService.createInstance(searchResultsView_1.SearchAccessibilityProvider, this);
            this.isTreeLayoutViewVisible = this.viewletState['view.treeLayout'] ?? (this.searchConfig.defaultViewMode === "tree" /* ViewMode.Tree */);
            this._refreshResultsScheduler = this._register(new async_1.RunOnceScheduler(this._updateResults.bind(this), 80));
            // storage service listener for for roaming changes
            this._register(this.storageService.onWillSaveState(() => {
                this._saveSearchHistoryService();
            }));
            this._register(this.storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, searchHistoryService_1.SearchHistoryService.SEARCH_HISTORY_KEY, this._register(new lifecycle_1.DisposableStore()))(() => {
                const restoredHistory = this.searchHistoryService.load();
                if (restoredHistory.include) {
                    this.inputPatternIncludes.prependHistory(restoredHistory.include);
                }
                if (restoredHistory.exclude) {
                    this.inputPatternExcludes.prependHistory(restoredHistory.exclude);
                }
                if (restoredHistory.search) {
                    this.searchWidget.prependSearchHistory(restoredHistory.search);
                }
                if (restoredHistory.replace) {
                    this.searchWidget.prependReplaceHistory(restoredHistory.replace);
                }
            }));
        }
        get isTreeLayoutViewVisible() {
            return this.treeViewKey.get() ?? false;
        }
        set isTreeLayoutViewVisible(visible) {
            this.treeViewKey.set(visible);
        }
        setTreeView(visible) {
            if (visible === this.isTreeLayoutViewVisible) {
                return;
            }
            this.isTreeLayoutViewVisible = visible;
            this.updateIndentStyles(this.themeService.getFileIconTheme());
            this.refreshTree();
        }
        get state() {
            return this.searchStateKey.get() ?? search_1.SearchUIState.Idle;
        }
        set state(v) {
            this.searchStateKey.set(v);
        }
        getContainer() {
            return this.container;
        }
        get searchResult() {
            return this.viewModel && this.viewModel.searchResult;
        }
        get model() {
            return this.viewModel;
        }
        onDidChangeWorkbenchState() {
            if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && this.searchWithoutFolderMessageElement) {
                dom.hide(this.searchWithoutFolderMessageElement);
            }
        }
        refreshInputs() {
            this.pauseSearching = true;
            this.searchWidget.setValue(this.viewModel.searchResult.query?.contentPattern.pattern ?? '');
            this.searchWidget.setReplaceAllActionState(false);
            this.searchWidget.toggleReplace(true);
            this.inputPatternIncludes.setOnlySearchInOpenEditors(this.viewModel.searchResult.query?.onlyOpenEditors || false);
            this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(!this.viewModel.searchResult.query?.userDisabledExcludesAndIgnoreFiles || true);
            this.searchIncludePattern.setValue('');
            this.searchExcludePattern.setValue('');
            this.pauseSearching = false;
        }
        async replaceSearchModel(searchModel, asyncResults) {
            let progressComplete;
            this.progressService.withProgress({ location: this.getProgressLocation(), delay: 0 }, _progress => {
                return new Promise(resolve => progressComplete = resolve);
            });
            const slowTimer = setTimeout(() => {
                this.state = search_1.SearchUIState.SlowSearch;
            }, 2000);
            this._refreshResultsScheduler.schedule();
            // remove old model and use the new searchModel
            searchModel.location = searchModel_1.SearchModelLocation.PANEL;
            searchModel.replaceActive = this.viewModel.isReplaceActive();
            searchModel.replaceString = this.searchWidget.getReplaceValue();
            this._onSearchResultChangedDisposable?.dispose();
            this._onSearchResultChangedDisposable = this._register(searchModel.onSearchResultChanged((event) => this.onSearchResultsChanged(event)));
            // this call will also dispose of the old model
            this.searchViewModelWorkbenchService.searchModel = searchModel;
            this.viewModel = searchModel;
            this.onSearchResultsChanged();
            this.refreshInputs();
            asyncResults.then((complete) => {
                clearTimeout(slowTimer);
                this.onSearchComplete(progressComplete, undefined, undefined, complete);
            }, (e) => {
                clearTimeout(slowTimer);
                this.onSearchError(e, progressComplete, undefined, undefined);
            });
            const collapseResults = this.searchConfig.collapseResults;
            if (collapseResults !== 'alwaysCollapse' && this.viewModel.searchResult.matches().length === 1) {
                const onlyMatch = this.viewModel.searchResult.matches()[0];
                if (onlyMatch.count() < 50) {
                    this.tree.expand(onlyMatch);
                }
            }
        }
        renderBody(parent) {
            super.renderBody(parent);
            this.container = dom.append(parent, dom.$('.search-view'));
            this.searchWidgetsContainerElement = dom.append(this.container, $('.search-widgets-container'));
            this.createSearchWidget(this.searchWidgetsContainerElement);
            const history = this.searchHistoryService.load();
            const filePatterns = this.viewletState['query.filePatterns'] || '';
            const patternExclusions = this.viewletState['query.folderExclusions'] || '';
            const patternExclusionsHistory = history.exclude || [];
            const patternIncludes = this.viewletState['query.folderIncludes'] || '';
            const patternIncludesHistory = history.include || [];
            const onlyOpenEditors = this.viewletState['query.onlyOpenEditors'] || false;
            const queryDetailsExpanded = this.viewletState['query.queryDetailsExpanded'] || '';
            const useExcludesAndIgnoreFiles = typeof this.viewletState['query.useExcludesAndIgnoreFiles'] === 'boolean' ?
                this.viewletState['query.useExcludesAndIgnoreFiles'] : true;
            this.queryDetails = dom.append(this.searchWidgetsContainerElement, $('.query-details'));
            // Toggle query details button
            this.toggleQueryDetailsButton = dom.append(this.queryDetails, $('.more' + themables_1.ThemeIcon.asCSSSelector(searchIcons_1.searchDetailsIcon), { tabindex: 0, role: 'button', title: nls.localize('moreSearch', "Toggle Search Details") }));
            this._register(dom.addDisposableListener(this.toggleQueryDetailsButton, dom.EventType.CLICK, e => {
                dom.EventHelper.stop(e);
                this.toggleQueryDetails(!this.accessibilityService.isScreenReaderOptimized());
            }));
            this._register(dom.addDisposableListener(this.toggleQueryDetailsButton, dom.EventType.KEY_UP, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    dom.EventHelper.stop(e);
                    this.toggleQueryDetails(false);
                }
            }));
            this._register(dom.addDisposableListener(this.toggleQueryDetailsButton, dom.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                    if (this.searchWidget.isReplaceActive()) {
                        this.searchWidget.focusReplaceAllAction();
                    }
                    else {
                        this.searchWidget.isReplaceShown() ? this.searchWidget.replaceInput?.focusOnPreserve() : this.searchWidget.focusRegexAction();
                    }
                    dom.EventHelper.stop(e);
                }
            }));
            // folder includes list
            const folderIncludesList = dom.append(this.queryDetails, $('.file-types.includes'));
            const filesToIncludeTitle = nls.localize('searchScope.includes', "files to include");
            dom.append(folderIncludesList, $('h4', undefined, filesToIncludeTitle));
            this.inputPatternIncludes = this._register(this.instantiationService.createInstance(patternInputWidget_1.IncludePatternInputWidget, folderIncludesList, this.contextViewService, {
                ariaLabel: filesToIncludeTitle,
                placeholder: nls.localize('placeholder.includes', "e.g. *.ts, src/**/include"),
                showPlaceholderOnFocus: true,
                history: patternIncludesHistory,
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles
            }));
            this.inputPatternIncludes.setValue(patternIncludes);
            this.inputPatternIncludes.setOnlySearchInOpenEditors(onlyOpenEditors);
            this._register(this.inputPatternIncludes.onCancel(() => this.cancelSearch(false)));
            this._register(this.inputPatternIncludes.onChangeSearchInEditorsBox(() => this.triggerQueryChange()));
            this.trackInputBox(this.inputPatternIncludes.inputFocusTracker, this.inputPatternIncludesFocused);
            // excludes list
            const excludesList = dom.append(this.queryDetails, $('.file-types.excludes'));
            const excludesTitle = nls.localize('searchScope.excludes', "files to exclude");
            dom.append(excludesList, $('h4', undefined, excludesTitle));
            this.inputPatternExcludes = this._register(this.instantiationService.createInstance(patternInputWidget_1.ExcludePatternInputWidget, excludesList, this.contextViewService, {
                ariaLabel: excludesTitle,
                placeholder: nls.localize('placeholder.excludes', "e.g. *.ts, src/**/exclude"),
                showPlaceholderOnFocus: true,
                history: patternExclusionsHistory,
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles
            }));
            this.inputPatternExcludes.setValue(patternExclusions);
            this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(useExcludesAndIgnoreFiles);
            this._register(this.inputPatternExcludes.onCancel(() => this.cancelSearch(false)));
            this._register(this.inputPatternExcludes.onChangeIgnoreBox(() => this.triggerQueryChange()));
            this.trackInputBox(this.inputPatternExcludes.inputFocusTracker, this.inputPatternExclusionsFocused);
            const updateHasFilePatternKey = () => this.hasFilePatternKey.set(this.inputPatternIncludes.getValue().length > 0 || this.inputPatternExcludes.getValue().length > 0);
            updateHasFilePatternKey();
            const onFilePatternSubmit = (triggeredOnType) => {
                this.triggerQueryChange({ triggeredOnType, delay: this.searchConfig.searchOnTypeDebouncePeriod });
                if (triggeredOnType) {
                    updateHasFilePatternKey();
                }
            };
            this._register(this.inputPatternIncludes.onSubmit(onFilePatternSubmit));
            this._register(this.inputPatternExcludes.onSubmit(onFilePatternSubmit));
            this.messagesElement = dom.append(this.container, $('.messages.text-search-provider-messages'));
            if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                this.showSearchWithoutFolderMessage();
            }
            this.createSearchResultsView(this.container);
            if (filePatterns !== '' || patternExclusions !== '' || patternIncludes !== '' || queryDetailsExpanded !== '' || !useExcludesAndIgnoreFiles) {
                this.toggleQueryDetails(true, true, true);
            }
            this._onSearchResultChangedDisposable = this._register(this.viewModel.onSearchResultChanged((event) => this.onSearchResultsChanged(event)));
            this._register(this.onDidChangeBodyVisibility(visible => this.onVisibilityChanged(visible)));
            this.updateIndentStyles(this.themeService.getFileIconTheme());
            this._register(this.themeService.onDidFileIconThemeChange(this.updateIndentStyles, this));
        }
        updateIndentStyles(theme) {
            this.resultsElement.classList.toggle('hide-arrows', this.isTreeLayoutViewVisible && theme.hidesExplorerArrows);
        }
        onVisibilityChanged(visible) {
            this.viewletVisible.set(visible);
            if (visible) {
                if (this.changedWhileHidden) {
                    // Render if results changed while viewlet was hidden - #37818
                    this.refreshAndUpdateCount();
                    this.changedWhileHidden = false;
                }
            }
            else {
                // Reset last focus to input to preserve opening the viewlet always focusing the query editor.
                this.lastFocusState = 'input';
            }
            // Enable highlights if there are searchresults
            this.viewModel?.searchResult.toggleHighlights(visible);
        }
        get searchAndReplaceWidget() {
            return this.searchWidget;
        }
        get searchIncludePattern() {
            return this.inputPatternIncludes;
        }
        get searchExcludePattern() {
            return this.inputPatternExcludes;
        }
        createSearchWidget(container) {
            const contentPattern = this.viewletState['query.contentPattern'] || '';
            const replaceText = this.viewletState['query.replaceText'] || '';
            const isRegex = this.viewletState['query.regex'] === true;
            const isWholeWords = this.viewletState['query.wholeWords'] === true;
            const isCaseSensitive = this.viewletState['query.caseSensitive'] === true;
            const history = this.searchHistoryService.load();
            const searchHistory = history.search || this.viewletState['query.searchHistory'] || [];
            const replaceHistory = history.replace || this.viewletState['query.replaceHistory'] || [];
            const showReplace = typeof this.viewletState['view.showReplace'] === 'boolean' ? this.viewletState['view.showReplace'] : true;
            const preserveCase = this.viewletState['query.preserveCase'] === true;
            const isInNotebookMarkdownInput = this.viewletState['query.isInNotebookMarkdownInput'] ?? true;
            const isInNotebookMarkdownPreview = this.viewletState['query.isInNotebookMarkdownPreview'] ?? true;
            const isInNotebookCellInput = this.viewletState['query.isInNotebookCellInput'] ?? true;
            const isInNotebookCellOutput = this.viewletState['query.isInNotebookCellOutput'] ?? true;
            this.searchWidget = this._register(this.instantiationService.createInstance(searchWidget_1.SearchWidget, container, {
                value: contentPattern,
                replaceValue: replaceText,
                isRegex: isRegex,
                isCaseSensitive: isCaseSensitive,
                isWholeWords: isWholeWords,
                searchHistory: searchHistory,
                replaceHistory: replaceHistory,
                preserveCase: preserveCase,
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles,
                toggleStyles: defaultStyles_1.defaultToggleStyles,
                notebookOptions: {
                    isInNotebookMarkdownInput,
                    isInNotebookMarkdownPreview,
                    isInNotebookCellInput,
                    isInNotebookCellOutput,
                }
            }));
            if (!this.searchWidget.searchInput || !this.searchWidget.replaceInput) {
                this.logService.warn(`Cannot fully create search widget. Search or replace input undefined. SearchInput: ${this.searchWidget.searchInput}, ReplaceInput: ${this.searchWidget.replaceInput}`);
                return;
            }
            if (showReplace) {
                this.searchWidget.toggleReplace(true);
            }
            this._register(this.searchWidget.onSearchSubmit(options => this.triggerQueryChange(options)));
            this._register(this.searchWidget.onSearchCancel(({ focus }) => this.cancelSearch(focus)));
            this._register(this.searchWidget.searchInput.onDidOptionChange(() => this.triggerQueryChange()));
            this._register(this.searchWidget.getNotebookFilters().onDidChange(() => this.triggerQueryChange()));
            const updateHasPatternKey = () => this.hasSearchPatternKey.set(this.searchWidget.searchInput ? (this.searchWidget.searchInput.getValue().length > 0) : false);
            updateHasPatternKey();
            this._register(this.searchWidget.searchInput.onDidChange(() => updateHasPatternKey()));
            const updateHasReplacePatternKey = () => this.hasReplacePatternKey.set(this.searchWidget.getReplaceValue().length > 0);
            updateHasReplacePatternKey();
            this._register(this.searchWidget.replaceInput.inputBox.onDidChange(() => updateHasReplacePatternKey()));
            this._register(this.searchWidget.onDidHeightChange(() => this.reLayout()));
            this._register(this.searchWidget.onReplaceToggled(() => this.reLayout()));
            this._register(this.searchWidget.onReplaceStateChange((state) => {
                this.viewModel.replaceActive = state;
                this.refreshTree();
            }));
            this._register(this.searchWidget.onPreserveCaseChange((state) => {
                this.viewModel.preserveCase = state;
                this.refreshTree();
            }));
            this._register(this.searchWidget.onReplaceValueChanged(() => {
                this.viewModel.replaceString = this.searchWidget.getReplaceValue();
                this.delayedRefresh.trigger(() => this.refreshTree());
            }));
            this._register(this.searchWidget.onBlur(() => {
                this.toggleQueryDetailsButton.focus();
            }));
            this._register(this.searchWidget.onReplaceAll(() => this.replaceAll()));
            this.trackInputBox(this.searchWidget.searchInputFocusTracker);
            this.trackInputBox(this.searchWidget.replaceInputFocusTracker);
        }
        onConfigurationUpdated(event) {
            if (event && (event.affectsConfiguration('search.decorations.colors') || event.affectsConfiguration('search.decorations.badges'))) {
                this.refreshTree();
            }
        }
        trackInputBox(inputFocusTracker, contextKey) {
            if (!inputFocusTracker) {
                return;
            }
            this._register(inputFocusTracker.onDidFocus(() => {
                this.lastFocusState = 'input';
                this.inputBoxFocused.set(true);
                contextKey?.set(true);
            }));
            this._register(inputFocusTracker.onDidBlur(() => {
                this.inputBoxFocused.set(this.searchWidget.searchInputHasFocus()
                    || this.searchWidget.replaceInputHasFocus()
                    || this.inputPatternIncludes.inputHasFocus()
                    || this.inputPatternExcludes.inputHasFocus());
                contextKey?.set(false);
            }));
        }
        onSearchResultsChanged(event) {
            if (this.isVisible()) {
                return this.refreshAndUpdateCount(event);
            }
            else {
                this.changedWhileHidden = true;
            }
        }
        refreshAndUpdateCount(event) {
            this.searchWidget.setReplaceAllActionState(!this.viewModel.searchResult.isEmpty());
            this.updateSearchResultCount(this.viewModel.searchResult.query.userDisabledExcludesAndIgnoreFiles, this.viewModel.searchResult.query?.onlyOpenEditors, event?.clearingAll);
            return this.refreshTree(event);
        }
        refreshTree(event) {
            const collapseResults = this.searchConfig.collapseResults;
            if (!event || event.added || event.removed) {
                // Refresh whole tree
                if (this.searchConfig.sortOrder === "modified" /* SearchSortOrder.Modified */) {
                    // Ensure all matches have retrieved their file stat
                    this.retrieveFileStats()
                        .then(() => this.tree.setChildren(null, this.createResultIterator(collapseResults)));
                }
                else {
                    this.tree.setChildren(null, this.createResultIterator(collapseResults));
                }
            }
            else {
                // If updated counts affect our search order, re-sort the view.
                if (this.searchConfig.sortOrder === "countAscending" /* SearchSortOrder.CountAscending */ ||
                    this.searchConfig.sortOrder === "countDescending" /* SearchSortOrder.CountDescending */) {
                    this.tree.setChildren(null, this.createResultIterator(collapseResults));
                }
                else {
                    // FileMatch modified, refresh those elements
                    event.elements.forEach(element => {
                        this.tree.setChildren(element, this.createIterator(element, collapseResults));
                        this.tree.rerender(element);
                    });
                }
            }
        }
        createResultIterator(collapseResults) {
            const folderMatches = this.searchResult.folderMatches()
                .filter(fm => !fm.isEmpty())
                .sort(searchModel_1.searchMatchComparer);
            if (folderMatches.length === 1) {
                return this.createFolderIterator(folderMatches[0], collapseResults, true);
            }
            return iterator_1.Iterable.map(folderMatches, folderMatch => {
                const children = this.createFolderIterator(folderMatch, collapseResults, true);
                return { element: folderMatch, children, incompressible: true }; // roots should always be incompressible
            });
        }
        createFolderIterator(folderMatch, collapseResults, childFolderIncompressible) {
            const sortOrder = this.searchConfig.sortOrder;
            const matchArray = this.isTreeLayoutViewVisible ? folderMatch.matches() : folderMatch.allDownstreamFileMatches();
            const matches = matchArray.sort((a, b) => (0, searchModel_1.searchMatchComparer)(a, b, sortOrder));
            return iterator_1.Iterable.map(matches, match => {
                let children;
                if (match instanceof searchModel_1.FileMatch) {
                    children = this.createFileIterator(match);
                }
                else {
                    children = this.createFolderIterator(match, collapseResults, false);
                }
                const collapsed = (collapseResults === 'alwaysCollapse' || (match.count() > 10 && collapseResults !== 'alwaysExpand')) ? tree_1.ObjectTreeElementCollapseState.PreserveOrCollapsed : tree_1.ObjectTreeElementCollapseState.PreserveOrExpanded;
                return { element: match, children, collapsed, incompressible: (match instanceof searchModel_1.FileMatch) ? true : childFolderIncompressible };
            });
        }
        createFileIterator(fileMatch) {
            const matches = fileMatch.matches().sort(searchModel_1.searchMatchComparer);
            return iterator_1.Iterable.map(matches, r => ({ element: r, incompressible: true }));
        }
        createIterator(match, collapseResults) {
            return match instanceof searchModel_1.SearchResult ? this.createResultIterator(collapseResults) :
                match instanceof searchModel_1.FolderMatch ? this.createFolderIterator(match, collapseResults, false) :
                    this.createFileIterator(match);
        }
        replaceAll() {
            if (this.viewModel.searchResult.count() === 0) {
                return;
            }
            const occurrences = this.viewModel.searchResult.count();
            const fileCount = this.viewModel.searchResult.fileCount();
            const replaceValue = this.searchWidget.getReplaceValue() || '';
            const afterReplaceAllMessage = this.buildAfterReplaceAllMessage(occurrences, fileCount, replaceValue);
            let progressComplete;
            let progressReporter;
            this.progressService.withProgress({ location: this.getProgressLocation(), delay: 100, total: occurrences }, p => {
                progressReporter = p;
                return new Promise(resolve => progressComplete = resolve);
            });
            const confirmation = {
                title: nls.localize('replaceAll.confirmation.title', "Replace All"),
                message: this.buildReplaceAllConfirmationMessage(occurrences, fileCount, replaceValue),
                primaryButton: nls.localize({ key: 'replaceAll.confirm.button', comment: ['&& denotes a mnemonic'] }, "&&Replace")
            };
            this.dialogService.confirm(confirmation).then(res => {
                if (res.confirmed) {
                    this.searchWidget.setReplaceAllActionState(false);
                    this.viewModel.searchResult.replaceAll(progressReporter).then(() => {
                        progressComplete();
                        const messageEl = this.clearMessage();
                        dom.append(messageEl, afterReplaceAllMessage);
                        this.reLayout();
                    }, (error) => {
                        progressComplete();
                        errors.isCancellationError(error);
                        this.notificationService.error(error);
                    });
                }
                else {
                    progressComplete();
                }
            });
        }
        buildAfterReplaceAllMessage(occurrences, fileCount, replaceValue) {
            if (occurrences === 1) {
                if (fileCount === 1) {
                    if (replaceValue) {
                        return nls.localize('replaceAll.occurrence.file.message', "Replaced {0} occurrence across {1} file with '{2}'.", occurrences, fileCount, replaceValue);
                    }
                    return nls.localize('removeAll.occurrence.file.message', "Replaced {0} occurrence across {1} file.", occurrences, fileCount);
                }
                if (replaceValue) {
                    return nls.localize('replaceAll.occurrence.files.message', "Replaced {0} occurrence across {1} files with '{2}'.", occurrences, fileCount, replaceValue);
                }
                return nls.localize('removeAll.occurrence.files.message', "Replaced {0} occurrence across {1} files.", occurrences, fileCount);
            }
            if (fileCount === 1) {
                if (replaceValue) {
                    return nls.localize('replaceAll.occurrences.file.message', "Replaced {0} occurrences across {1} file with '{2}'.", occurrences, fileCount, replaceValue);
                }
                return nls.localize('removeAll.occurrences.file.message', "Replaced {0} occurrences across {1} file.", occurrences, fileCount);
            }
            if (replaceValue) {
                return nls.localize('replaceAll.occurrences.files.message', "Replaced {0} occurrences across {1} files with '{2}'.", occurrences, fileCount, replaceValue);
            }
            return nls.localize('removeAll.occurrences.files.message', "Replaced {0} occurrences across {1} files.", occurrences, fileCount);
        }
        buildReplaceAllConfirmationMessage(occurrences, fileCount, replaceValue) {
            if (occurrences === 1) {
                if (fileCount === 1) {
                    if (replaceValue) {
                        return nls.localize('removeAll.occurrence.file.confirmation.message', "Replace {0} occurrence across {1} file with '{2}'?", occurrences, fileCount, replaceValue);
                    }
                    return nls.localize('replaceAll.occurrence.file.confirmation.message', "Replace {0} occurrence across {1} file?", occurrences, fileCount);
                }
                if (replaceValue) {
                    return nls.localize('removeAll.occurrence.files.confirmation.message', "Replace {0} occurrence across {1} files with '{2}'?", occurrences, fileCount, replaceValue);
                }
                return nls.localize('replaceAll.occurrence.files.confirmation.message', "Replace {0} occurrence across {1} files?", occurrences, fileCount);
            }
            if (fileCount === 1) {
                if (replaceValue) {
                    return nls.localize('removeAll.occurrences.file.confirmation.message', "Replace {0} occurrences across {1} file with '{2}'?", occurrences, fileCount, replaceValue);
                }
                return nls.localize('replaceAll.occurrences.file.confirmation.message', "Replace {0} occurrences across {1} file?", occurrences, fileCount);
            }
            if (replaceValue) {
                return nls.localize('removeAll.occurrences.files.confirmation.message', "Replace {0} occurrences across {1} files with '{2}'?", occurrences, fileCount, replaceValue);
            }
            return nls.localize('replaceAll.occurrences.files.confirmation.message', "Replace {0} occurrences across {1} files?", occurrences, fileCount);
        }
        clearMessage() {
            this.searchWithoutFolderMessageElement = undefined;
            const wasHidden = this.messagesElement.style.display === 'none';
            dom.clearNode(this.messagesElement);
            dom.show(this.messagesElement);
            this.messageDisposables.clear();
            const newMessage = dom.append(this.messagesElement, $('.message'));
            if (wasHidden) {
                this.reLayout();
            }
            return newMessage;
        }
        createSearchResultsView(container) {
            this.resultsElement = dom.append(container, $('.results.show-file-icons.file-icon-themable-tree'));
            const delegate = this.instantiationService.createInstance(searchResultsView_1.SearchDelegate);
            const identityProvider = {
                getId(element) {
                    return element.id();
                }
            };
            this.treeLabels = this._register(this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility }));
            this.tree = this._register(this.instantiationService.createInstance(listService_1.WorkbenchCompressibleObjectTree, 'SearchView', this.resultsElement, delegate, [
                this._register(this.instantiationService.createInstance(searchResultsView_1.FolderMatchRenderer, this, this.treeLabels)),
                this._register(this.instantiationService.createInstance(searchResultsView_1.FileMatchRenderer, this, this.treeLabels)),
                this._register(this.instantiationService.createInstance(searchResultsView_1.MatchRenderer, this)),
            ], {
                identityProvider,
                accessibilityProvider: this.treeAccessibilityProvider,
                dnd: this.instantiationService.createInstance(dnd_1.ResourceListDnDHandler, element => {
                    if (element instanceof searchModel_1.FileMatch) {
                        return element.resource;
                    }
                    if (element instanceof searchModel_1.Match) {
                        return (0, opener_1.withSelection)(element.parent().resource, element.range());
                    }
                    return null;
                }),
                multipleSelectionSupport: true,
                selectionNavigation: true,
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                },
                paddingBottom: searchResultsView_1.SearchDelegate.ITEM_HEIGHT
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            const updateHasSomeCollapsible = () => this.toggleCollapseStateDelayer.trigger(() => this.hasSomeCollapsibleResultKey.set(this.hasSomeCollapsible()));
            updateHasSomeCollapsible();
            this._register(this.tree.onDidChangeCollapseState(() => updateHasSomeCollapsible()));
            this._register(event_1.Event.debounce(this.tree.onDidOpen, (last, event) => event, DEBOUNCE_DELAY, true)(options => {
                if (options.element instanceof searchModel_1.Match) {
                    const selectedMatch = options.element;
                    this.currentSelectedFileMatch?.setSelectedMatch(null);
                    this.currentSelectedFileMatch = selectedMatch.parent();
                    this.currentSelectedFileMatch.setSelectedMatch(selectedMatch);
                    this.onFocus(selectedMatch, options.editorOptions.preserveFocus, options.sideBySide, options.editorOptions.pinned);
                }
            }));
            this._register(event_1.Event.debounce(this.tree.onDidChangeFocus, (last, event) => event, DEBOUNCE_DELAY, true)(() => {
                const selection = this.tree.getSelection();
                const focus = this.tree.getFocus()[0];
                if (selection.length > 1 && focus instanceof searchModel_1.Match) {
                    this.onFocus(focus, true);
                }
            }));
            this._register(event_1.Event.any(this.tree.onDidFocus, this.tree.onDidChangeFocus)(() => {
                const focus = this.tree.getFocus()[0];
                if (this.tree.isDOMFocused()) {
                    this.firstMatchFocused.set(this.tree.navigate().first() === focus);
                    this.fileMatchOrMatchFocused.set(!!focus);
                    this.fileMatchFocused.set(focus instanceof searchModel_1.FileMatch);
                    this.folderMatchFocused.set(focus instanceof searchModel_1.FolderMatch);
                    this.matchFocused.set(focus instanceof searchModel_1.Match);
                    this.fileMatchOrFolderMatchFocus.set(focus instanceof searchModel_1.FileMatch || focus instanceof searchModel_1.FolderMatch);
                    this.fileMatchOrFolderMatchWithResourceFocus.set(focus instanceof searchModel_1.FileMatch || focus instanceof searchModel_1.FolderMatchWithResource);
                    this.folderMatchWithResourceFocused.set(focus instanceof searchModel_1.FolderMatchWithResource);
                    this.lastFocusState = 'tree';
                }
                let editable = false;
                if (focus instanceof searchModel_1.Match) {
                    editable = (focus instanceof searchModel_1.MatchInNotebook) ? !focus.isReadonly() : true;
                }
                else if (focus instanceof searchModel_1.FileMatch) {
                    editable = !focus.hasOnlyReadOnlyMatches();
                }
                else if (focus instanceof searchModel_1.FolderMatch) {
                    editable = !focus.hasOnlyReadOnlyMatches();
                }
                this.isEditableItem.set(editable);
            }));
            this._register(this.tree.onDidBlur(() => {
                this.firstMatchFocused.reset();
                this.fileMatchOrMatchFocused.reset();
                this.fileMatchFocused.reset();
                this.folderMatchFocused.reset();
                this.matchFocused.reset();
                this.fileMatchOrFolderMatchFocus.reset();
                this.fileMatchOrFolderMatchWithResourceFocus.reset();
                this.folderMatchWithResourceFocused.reset();
                this.isEditableItem.reset();
            }));
        }
        onContextMenu(e) {
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            this.contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.SearchContext,
                menuActionOptions: { shouldForwardArgs: true },
                contextKeyService: this.contextKeyService,
                getAnchor: () => e.anchor,
                getActionsContext: () => e.element,
            });
        }
        hasSomeCollapsible() {
            const viewer = this.getControl();
            const navigator = viewer.navigate();
            let node = navigator.first();
            do {
                if (!viewer.isCollapsed(node)) {
                    return true;
                }
            } while (node = navigator.next());
            return false;
        }
        selectNextMatch() {
            if (!this.hasSearchResults()) {
                return;
            }
            const [selected] = this.tree.getSelection();
            // Expand the initial selected node, if needed
            if (selected && !(selected instanceof searchModel_1.Match)) {
                if (this.tree.isCollapsed(selected)) {
                    this.tree.expand(selected);
                }
            }
            const navigator = this.tree.navigate(selected);
            let next = navigator.next();
            if (!next) {
                next = navigator.first();
            }
            // Expand until first child is a Match
            while (next && !(next instanceof searchModel_1.Match)) {
                if (this.tree.isCollapsed(next)) {
                    this.tree.expand(next);
                }
                // Select the first child
                next = navigator.next();
            }
            // Reveal the newly selected element
            if (next) {
                if (next === selected) {
                    this.tree.setFocus([]);
                }
                const event = (0, listService_1.getSelectionKeyboardEvent)(undefined, false, false);
                this.tree.setFocus([next], event);
                this.tree.setSelection([next], event);
                this.tree.reveal(next);
                const ariaLabel = this.treeAccessibilityProvider.getAriaLabel(next);
                if (ariaLabel) {
                    aria.status(ariaLabel);
                }
            }
        }
        selectPreviousMatch() {
            if (!this.hasSearchResults()) {
                return;
            }
            const [selected] = this.tree.getSelection();
            let navigator = this.tree.navigate(selected);
            let prev = navigator.previous();
            // Select previous until find a Match or a collapsed item
            while (!prev || (!(prev instanceof searchModel_1.Match) && !this.tree.isCollapsed(prev))) {
                const nextPrev = prev ? navigator.previous() : navigator.last();
                if (!prev && !nextPrev) {
                    return;
                }
                prev = nextPrev;
            }
            // Expand until last child is a Match
            while (!(prev instanceof searchModel_1.Match)) {
                const nextItem = navigator.next();
                this.tree.expand(prev);
                navigator = this.tree.navigate(nextItem); // recreate navigator because modifying the tree can invalidate it
                prev = nextItem ? navigator.previous() : navigator.last(); // select last child
            }
            // Reveal the newly selected element
            if (prev) {
                if (prev === selected) {
                    this.tree.setFocus([]);
                }
                const event = (0, listService_1.getSelectionKeyboardEvent)(undefined, false, false);
                this.tree.setFocus([prev], event);
                this.tree.setSelection([prev], event);
                this.tree.reveal(prev);
                const ariaLabel = this.treeAccessibilityProvider.getAriaLabel(prev);
                if (ariaLabel) {
                    aria.status(ariaLabel);
                }
            }
        }
        moveFocusToResults() {
            this.tree.domFocus();
        }
        focus() {
            super.focus();
            if (this.lastFocusState === 'input' || !this.hasSearchResults()) {
                const updatedText = this.searchConfig.seedOnFocus ? this.updateTextFromSelection({ allowSearchOnType: false }) : false;
                this.searchWidget.focus(undefined, undefined, updatedText);
            }
            else {
                this.tree.domFocus();
            }
        }
        updateTextFromFindWidgetOrSelection({ allowUnselectedWord = true, allowSearchOnType = true }) {
            let activeEditor = this.editorService.activeTextEditorControl;
            if ((0, editorBrowser_1.isCodeEditor)(activeEditor) && !activeEditor?.hasTextFocus()) {
                const controller = findController_1.CommonFindController.get(activeEditor);
                if (controller && controller.isFindInputFocused()) {
                    return this.updateTextFromFindWidget(controller, { allowSearchOnType });
                }
                const editors = this.codeEditorService.listCodeEditors();
                activeEditor = editors.find(editor => editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget && editor.getParentEditor() === activeEditor && editor.hasTextFocus())
                    ?? activeEditor;
            }
            return this.updateTextFromSelection({ allowUnselectedWord, allowSearchOnType }, activeEditor);
        }
        updateTextFromFindWidget(controller, { allowSearchOnType = true }) {
            if (!this.searchConfig.seedWithNearestWord && (dom.getActiveWindow().getSelection()?.toString() ?? '') === '') {
                return false;
            }
            const searchString = controller.getState().searchString;
            if (searchString === '') {
                return false;
            }
            this.searchWidget.searchInput?.setCaseSensitive(controller.getState().matchCase);
            this.searchWidget.searchInput?.setWholeWords(controller.getState().wholeWord);
            this.searchWidget.searchInput?.setRegex(controller.getState().isRegex);
            this.updateText(searchString, allowSearchOnType);
            return true;
        }
        updateTextFromSelection({ allowUnselectedWord = true, allowSearchOnType = true }, editor) {
            const seedSearchStringFromSelection = this.configurationService.getValue('editor').find.seedSearchStringFromSelection;
            if (!seedSearchStringFromSelection) {
                return false;
            }
            let selectedText = this.getSearchTextFromEditor(allowUnselectedWord, editor);
            if (selectedText === null) {
                return false;
            }
            if (this.searchWidget.searchInput?.getRegex()) {
                selectedText = strings.escapeRegExpCharacters(selectedText);
            }
            this.updateText(selectedText, allowSearchOnType);
            return true;
        }
        updateText(text, allowSearchOnType = true) {
            if (allowSearchOnType && !this.viewModel.searchResult.isDirty) {
                this.searchWidget.setValue(text);
            }
            else {
                this.pauseSearching = true;
                this.searchWidget.setValue(text);
                this.pauseSearching = false;
            }
        }
        focusNextInputBox() {
            if (this.searchWidget.searchInputHasFocus()) {
                if (this.searchWidget.isReplaceShown()) {
                    this.searchWidget.focus(true, true);
                }
                else {
                    this.moveFocusFromSearchOrReplace();
                }
                return;
            }
            if (this.searchWidget.replaceInputHasFocus()) {
                this.moveFocusFromSearchOrReplace();
                return;
            }
            if (this.inputPatternIncludes.inputHasFocus()) {
                this.inputPatternExcludes.focus();
                this.inputPatternExcludes.select();
                return;
            }
            if (this.inputPatternExcludes.inputHasFocus()) {
                this.selectTreeIfNotSelected();
                return;
            }
        }
        moveFocusFromSearchOrReplace() {
            if (this.showsFileTypes()) {
                this.toggleQueryDetails(true, this.showsFileTypes());
            }
            else {
                this.selectTreeIfNotSelected();
            }
        }
        focusPreviousInputBox() {
            if (this.searchWidget.searchInputHasFocus()) {
                return;
            }
            if (this.searchWidget.replaceInputHasFocus()) {
                this.searchWidget.focus(true);
                return;
            }
            if (this.inputPatternIncludes.inputHasFocus()) {
                this.searchWidget.focus(true, true);
                return;
            }
            if (this.inputPatternExcludes.inputHasFocus()) {
                this.inputPatternIncludes.focus();
                this.inputPatternIncludes.select();
                return;
            }
            if (this.tree.isDOMFocused()) {
                this.moveFocusFromResults();
                return;
            }
        }
        moveFocusFromResults() {
            if (this.showsFileTypes()) {
                this.toggleQueryDetails(true, true, false, true);
            }
            else {
                this.searchWidget.focus(true, true);
            }
        }
        reLayout() {
            if (this.isDisposed || !this.size) {
                return;
            }
            const actionsPosition = this.searchConfig.actionsPosition;
            this.getContainer().classList.toggle(SearchView_1.ACTIONS_RIGHT_CLASS_NAME, actionsPosition === 'right');
            this.searchWidget.setWidth(this.size.width - 28 /* container margin */);
            this.inputPatternExcludes.setWidth(this.size.width - 28 /* container margin */);
            this.inputPatternIncludes.setWidth(this.size.width - 28 /* container margin */);
            const widgetHeight = dom.getTotalHeight(this.searchWidgetsContainerElement);
            const messagesHeight = dom.getTotalHeight(this.messagesElement);
            this.tree.layout(this.size.height - widgetHeight - messagesHeight, this.size.width - 28);
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.size = new dom.Dimension(width, height);
            this.reLayout();
        }
        getControl() {
            return this.tree;
        }
        allSearchFieldsClear() {
            return this.searchWidget.getReplaceValue() === '' &&
                (!this.searchWidget.searchInput || this.searchWidget.searchInput.getValue() === '');
        }
        allFilePatternFieldsClear() {
            return this.searchExcludePattern.getValue() === '' &&
                this.searchIncludePattern.getValue() === '';
        }
        hasSearchResults() {
            return !this.viewModel.searchResult.isEmpty();
        }
        clearSearchResults(clearInput = true) {
            this.viewModel.searchResult.clear();
            this.showEmptyStage(true);
            if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                this.showSearchWithoutFolderMessage();
            }
            if (clearInput) {
                if (this.allSearchFieldsClear()) {
                    this.clearFilePatternFields();
                }
                this.searchWidget.clear();
            }
            this.viewModel.cancelSearch();
            this.tree.ariaLabel = nls.localize('emptySearch', "Empty Search");
            this.audioCueService.playAudioCue(audioCueService_1.AudioCue.clear);
            this.reLayout();
        }
        clearFilePatternFields() {
            this.searchExcludePattern.clear();
            this.searchIncludePattern.clear();
        }
        cancelSearch(focus = true) {
            if (this.viewModel.cancelSearch()) {
                if (focus) {
                    this.searchWidget.focus();
                }
                return true;
            }
            return false;
        }
        selectTreeIfNotSelected() {
            if (this.tree.getNode(null)) {
                this.tree.domFocus();
                const selection = this.tree.getSelection();
                if (selection.length === 0) {
                    const event = (0, listService_1.getSelectionKeyboardEvent)();
                    this.tree.focusNext(undefined, undefined, event);
                    this.tree.setSelection(this.tree.getFocus(), event);
                }
            }
        }
        getSearchTextFromEditor(allowUnselectedWord, editor) {
            if (dom.isAncestorOfActiveElement(this.getContainer())) {
                return null;
            }
            editor = editor ?? this.editorService.activeTextEditorControl;
            if (!editor) {
                return null;
            }
            const allowUnselected = this.searchConfig.seedWithNearestWord && allowUnselectedWord;
            return getSelectionTextFromEditor(allowUnselected, editor);
        }
        showsFileTypes() {
            return this.queryDetails.classList.contains('more');
        }
        toggleCaseSensitive() {
            this.searchWidget.searchInput?.setCaseSensitive(!this.searchWidget.searchInput.getCaseSensitive());
            this.triggerQueryChange();
        }
        toggleWholeWords() {
            this.searchWidget.searchInput?.setWholeWords(!this.searchWidget.searchInput.getWholeWords());
            this.triggerQueryChange();
        }
        toggleRegex() {
            this.searchWidget.searchInput?.setRegex(!this.searchWidget.searchInput.getRegex());
            this.triggerQueryChange();
        }
        togglePreserveCase() {
            this.searchWidget.replaceInput?.setPreserveCase(!this.searchWidget.replaceInput.getPreserveCase());
            this.triggerQueryChange();
        }
        setSearchParameters(args = {}) {
            if (typeof args.isCaseSensitive === 'boolean') {
                this.searchWidget.searchInput?.setCaseSensitive(args.isCaseSensitive);
            }
            if (typeof args.matchWholeWord === 'boolean') {
                this.searchWidget.searchInput?.setWholeWords(args.matchWholeWord);
            }
            if (typeof args.isRegex === 'boolean') {
                this.searchWidget.searchInput?.setRegex(args.isRegex);
            }
            if (typeof args.filesToInclude === 'string') {
                this.searchIncludePattern.setValue(String(args.filesToInclude));
            }
            if (typeof args.filesToExclude === 'string') {
                this.searchExcludePattern.setValue(String(args.filesToExclude));
            }
            if (typeof args.query === 'string') {
                this.searchWidget.searchInput?.setValue(args.query);
            }
            if (typeof args.replace === 'string') {
                this.searchWidget.replaceInput?.setValue(args.replace);
            }
            else {
                if (this.searchWidget.replaceInput && this.searchWidget.replaceInput.getValue() !== '') {
                    this.searchWidget.replaceInput.setValue('');
                }
            }
            if (typeof args.triggerSearch === 'boolean' && args.triggerSearch) {
                this.triggerQueryChange();
            }
            if (typeof args.preserveCase === 'boolean') {
                this.searchWidget.replaceInput?.setPreserveCase(args.preserveCase);
            }
            if (typeof args.useExcludeSettingsAndIgnoreFiles === 'boolean') {
                this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(args.useExcludeSettingsAndIgnoreFiles);
            }
            if (typeof args.onlyOpenEditors === 'boolean') {
                this.searchIncludePattern.setOnlySearchInOpenEditors(args.onlyOpenEditors);
            }
        }
        toggleQueryDetails(moveFocus = true, show, skipLayout, reverse) {
            const cls = 'more';
            show = typeof show === 'undefined' ? !this.queryDetails.classList.contains(cls) : Boolean(show);
            this.viewletState['query.queryDetailsExpanded'] = show;
            skipLayout = Boolean(skipLayout);
            if (show) {
                this.toggleQueryDetailsButton.setAttribute('aria-expanded', 'true');
                this.queryDetails.classList.add(cls);
                if (moveFocus) {
                    if (reverse) {
                        this.inputPatternExcludes.focus();
                        this.inputPatternExcludes.select();
                    }
                    else {
                        this.inputPatternIncludes.focus();
                        this.inputPatternIncludes.select();
                    }
                }
            }
            else {
                this.toggleQueryDetailsButton.setAttribute('aria-expanded', 'false');
                this.queryDetails.classList.remove(cls);
                if (moveFocus) {
                    this.searchWidget.focus();
                }
            }
            if (!skipLayout && this.size) {
                this.reLayout();
            }
        }
        searchInFolders(folderPaths = []) {
            this._searchWithIncludeOrExclude(true, folderPaths);
        }
        searchOutsideOfFolders(folderPaths = []) {
            this._searchWithIncludeOrExclude(false, folderPaths);
        }
        _searchWithIncludeOrExclude(include, folderPaths) {
            if (!folderPaths.length || folderPaths.some(folderPath => folderPath === '.')) {
                this.inputPatternIncludes.setValue('');
                this.searchWidget.focus();
                return;
            }
            // Show 'files to include' box
            if (!this.showsFileTypes()) {
                this.toggleQueryDetails(true, true);
            }
            (include ? this.inputPatternIncludes : this.inputPatternExcludes).setValue(folderPaths.join(', '));
            this.searchWidget.focus(false);
        }
        triggerQueryChange(_options) {
            const options = { preserveFocus: true, triggeredOnType: false, delay: 0, ..._options };
            if (options.triggeredOnType && !this.searchConfig.searchOnType) {
                return;
            }
            if (!this.pauseSearching) {
                const delay = options.triggeredOnType ? options.delay : 0;
                this.triggerQueryDelayer.trigger(() => {
                    this._onQueryChanged(options.preserveFocus, options.triggeredOnType);
                }, delay);
            }
        }
        _onQueryChanged(preserveFocus, triggeredOnType = false) {
            if (!(this.searchWidget.searchInput?.inputBox.isInputValid())) {
                return;
            }
            const isRegex = this.searchWidget.searchInput.getRegex();
            const isInNotebookMarkdownInput = this.searchWidget.getNotebookFilters().markupInput;
            const isInNotebookMarkdownPreview = this.searchWidget.getNotebookFilters().markupPreview;
            const isInNotebookCellInput = this.searchWidget.getNotebookFilters().codeInput;
            const isInNotebookCellOutput = this.searchWidget.getNotebookFilters().codeOutput;
            const isWholeWords = this.searchWidget.searchInput.getWholeWords();
            const isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
            const contentPattern = this.searchWidget.searchInput.getValue();
            const excludePatternText = this.inputPatternExcludes.getValue().trim();
            const includePatternText = this.inputPatternIncludes.getValue().trim();
            const useExcludesAndIgnoreFiles = this.inputPatternExcludes.useExcludesAndIgnoreFiles();
            const onlySearchInOpenEditors = this.inputPatternIncludes.onlySearchInOpenEditors();
            if (contentPattern.length === 0) {
                this.clearSearchResults(false);
                this.clearMessage();
                return;
            }
            const content = {
                pattern: contentPattern,
                isRegExp: isRegex,
                isCaseSensitive: isCaseSensitive,
                isWordMatch: isWholeWords,
                notebookInfo: {
                    isInNotebookMarkdownInput,
                    isInNotebookMarkdownPreview,
                    isInNotebookCellInput,
                    isInNotebookCellOutput
                }
            };
            const excludePattern = this.inputPatternExcludes.getValue();
            const includePattern = this.inputPatternIncludes.getValue();
            // Need the full match line to correctly calculate replace text, if this is a search/replace with regex group references ($1, $2, ...).
            // 10000 chars is enough to avoid sending huge amounts of text around, if you do a replace with a longer match, it may or may not resolve the group refs correctly.
            // https://github.com/microsoft/vscode/issues/58374
            const charsPerLine = content.isRegExp ? 10000 : 1000;
            const options = {
                _reason: 'searchView',
                extraFileResources: this.instantiationService.invokeFunction(search_1.getOutOfWorkspaceEditorResources),
                maxResults: this.searchConfig.maxResults ?? undefined,
                disregardIgnoreFiles: !useExcludesAndIgnoreFiles || undefined,
                disregardExcludeSettings: !useExcludesAndIgnoreFiles || undefined,
                onlyOpenEditors: onlySearchInOpenEditors,
                excludePattern,
                includePattern,
                previewOptions: {
                    matchLines: 1,
                    charsPerLine
                },
                isSmartCase: this.searchConfig.smartCase,
                expandPatterns: true
            };
            const folderResources = this.contextService.getWorkspace().folders;
            const onQueryValidationError = (err) => {
                this.searchWidget.searchInput?.showMessage({ content: err.message, type: 3 /* MessageType.ERROR */ });
                this.viewModel.searchResult.clear();
            };
            let query;
            try {
                query = this.queryBuilder.text(content, folderResources.map(folder => folder.uri), options);
            }
            catch (err) {
                onQueryValidationError(err);
                return;
            }
            this.validateQuery(query).then(() => {
                this.onQueryTriggered(query, options, excludePatternText, includePatternText, triggeredOnType);
                if (!preserveFocus) {
                    this.searchWidget.focus(false, undefined, true); // focus back to input field
                }
            }, onQueryValidationError);
        }
        validateQuery(query) {
            // Validate folderQueries
            const folderQueriesExistP = query.folderQueries.map(fq => {
                return this.fileService.exists(fq.folder).catch(() => false);
            });
            return Promise.all(folderQueriesExistP).then(existResults => {
                // If no folders exist, show an error message about the first one
                const existingFolderQueries = query.folderQueries.filter((folderQuery, i) => existResults[i]);
                if (!query.folderQueries.length || existingFolderQueries.length) {
                    query.folderQueries = existingFolderQueries;
                }
                else {
                    const nonExistantPath = query.folderQueries[0].folder.fsPath;
                    const searchPathNotFoundError = nls.localize('searchPathNotFoundError', "Search path not found: {0}", nonExistantPath);
                    return Promise.reject(new Error(searchPathNotFoundError));
                }
                return undefined;
            });
        }
        onQueryTriggered(query, options, excludePatternText, includePatternText, triggeredOnType) {
            this.addToSearchHistoryDelayer.trigger(() => {
                this.searchWidget.searchInput?.onSearchSubmit();
                this.inputPatternExcludes.onSearchSubmit();
                this.inputPatternIncludes.onSearchSubmit();
            });
            this.viewModel.cancelSearch(true);
            this.currentSearchQ = this.currentSearchQ
                .then(() => this.doSearch(query, excludePatternText, includePatternText, triggeredOnType))
                .then(() => undefined, () => undefined);
        }
        _updateResults() {
            if (this.state === search_1.SearchUIState.Idle) {
                return;
            }
            try {
                // Search result tree update
                const fileCount = this.viewModel.searchResult.fileCount();
                if (this._visibleMatches !== fileCount) {
                    this._visibleMatches = fileCount;
                    this.refreshAndUpdateCount();
                }
            }
            finally {
                // show frequent progress and results by scheduling updates 80 ms after the last one
                this._refreshResultsScheduler.schedule();
            }
        }
        onSearchComplete(progressComplete, excludePatternText, includePatternText, completed) {
            this.state = search_1.SearchUIState.Idle;
            // Complete up to 100% as needed
            progressComplete();
            // Do final render, then expand if just 1 file with less than 50 matches
            this.onSearchResultsChanged();
            const collapseResults = this.searchConfig.collapseResults;
            if (collapseResults !== 'alwaysCollapse' && this.viewModel.searchResult.matches().length === 1) {
                const onlyMatch = this.viewModel.searchResult.matches()[0];
                if (onlyMatch.count() < 50) {
                    this.tree.expand(onlyMatch);
                }
            }
            const hasResults = !this.viewModel.searchResult.isEmpty();
            if (completed?.exit === 1 /* SearchCompletionExitCode.NewSearchStarted */) {
                return;
            }
            if (!hasResults) {
                const hasExcludes = !!excludePatternText;
                const hasIncludes = !!includePatternText;
                let message;
                if (!completed) {
                    message = SEARCH_CANCELLED_MESSAGE;
                }
                else if (this.inputPatternIncludes.onlySearchInOpenEditors()) {
                    if (hasIncludes && hasExcludes) {
                        message = nls.localize('noOpenEditorResultsIncludesExcludes', "No results found in open editors matching '{0}' excluding '{1}' - ", includePatternText, excludePatternText);
                    }
                    else if (hasIncludes) {
                        message = nls.localize('noOpenEditorResultsIncludes', "No results found in open editors matching '{0}' - ", includePatternText);
                    }
                    else if (hasExcludes) {
                        message = nls.localize('noOpenEditorResultsExcludes', "No results found in open editors excluding '{0}' - ", excludePatternText);
                    }
                    else {
                        message = nls.localize('noOpenEditorResultsFound', "No results found in open editors. Review your settings for configured exclusions and check your gitignore files - ");
                    }
                }
                else {
                    if (hasIncludes && hasExcludes) {
                        message = nls.localize('noResultsIncludesExcludes', "No results found in '{0}' excluding '{1}' - ", includePatternText, excludePatternText);
                    }
                    else if (hasIncludes) {
                        message = nls.localize('noResultsIncludes', "No results found in '{0}' - ", includePatternText);
                    }
                    else if (hasExcludes) {
                        message = nls.localize('noResultsExcludes', "No results found excluding '{0}' - ", excludePatternText);
                    }
                    else {
                        message = nls.localize('noResultsFound', "No results found. Review your settings for configured exclusions and check your gitignore files - ");
                    }
                }
                // Indicate as status to ARIA
                aria.status(message);
                const messageEl = this.clearMessage();
                dom.append(messageEl, message);
                if (!completed) {
                    const searchAgainButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('rerunSearch.message', "Search again"), () => this.triggerQueryChange({ preserveFocus: false })));
                    dom.append(messageEl, searchAgainButton.element);
                }
                else if (hasIncludes || hasExcludes) {
                    const searchAgainButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('rerunSearchInAll.message', "Search again in all files"), this.onSearchAgain.bind(this)));
                    dom.append(messageEl, searchAgainButton.element);
                }
                else {
                    const openSettingsButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openSettings.message', "Open Settings"), this.onOpenSettings.bind(this)));
                    dom.append(messageEl, openSettingsButton.element);
                }
                if (completed) {
                    dom.append(messageEl, $('span', undefined, ' - '));
                    const learnMoreButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openSettings.learnMore', "Learn More"), this.onLearnMore.bind(this)));
                    dom.append(messageEl, learnMoreButton.element);
                }
                if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                    this.showSearchWithoutFolderMessage();
                }
                this.reLayout();
            }
            else {
                this.viewModel.searchResult.toggleHighlights(this.isVisible()); // show highlights
                // Indicate final search result count for ARIA
                aria.status(nls.localize('ariaSearchResultsStatus', "Search returned {0} results in {1} files", this.viewModel.searchResult.count(), this.viewModel.searchResult.fileCount()));
            }
            if (completed && completed.limitHit) {
                completed.messages.push({ type: search_2.TextSearchCompleteMessageType.Warning, text: nls.localize('searchMaxResultsWarning', "The result set only contains a subset of all matches. Be more specific in your search to narrow down the results.") });
            }
            if (completed && completed.messages) {
                for (const message of completed.messages) {
                    this.addMessage(message);
                }
            }
            this.reLayout();
        }
        onSearchError(e, progressComplete, excludePatternText, includePatternText, completed) {
            this.state = search_1.SearchUIState.Idle;
            if (errors.isCancellationError(e)) {
                return this.onSearchComplete(progressComplete, excludePatternText, includePatternText, completed);
            }
            else {
                progressComplete();
                this.searchWidget.searchInput?.showMessage({ content: e.message, type: 3 /* MessageType.ERROR */ });
                this.viewModel.searchResult.clear();
                return Promise.resolve();
            }
        }
        doSearch(query, excludePatternText, includePatternText, triggeredOnType) {
            let progressComplete;
            this.progressService.withProgress({ location: this.getProgressLocation(), delay: triggeredOnType ? 300 : 0 }, _progress => {
                return new Promise(resolve => progressComplete = resolve);
            });
            this.searchWidget.searchInput?.clearMessage();
            this.state = search_1.SearchUIState.Searching;
            this.showEmptyStage();
            const slowTimer = setTimeout(() => {
                this.state = search_1.SearchUIState.SlowSearch;
            }, 2000);
            this._visibleMatches = 0;
            this._refreshResultsScheduler.schedule();
            this.searchWidget.setReplaceAllActionState(false);
            this.tree.setSelection([]);
            this.tree.setFocus([]);
            this.viewModel.replaceString = this.searchWidget.getReplaceValue();
            const result = this.viewModel.search(query);
            return result.asyncResults.then((complete) => {
                clearTimeout(slowTimer);
                this.onSearchComplete(progressComplete, excludePatternText, includePatternText, complete);
            }, (e) => {
                clearTimeout(slowTimer);
                this.onSearchError(e, progressComplete, excludePatternText, includePatternText);
            });
        }
        onOpenSettings(e) {
            dom.EventHelper.stop(e, false);
            this.openSettings('@id:files.exclude,search.exclude,search.useParentIgnoreFiles,search.useGlobalIgnoreFiles,search.useIgnoreFiles');
        }
        openSettings(query) {
            const options = { query };
            return this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ?
                this.preferencesService.openWorkspaceSettings(options) :
                this.preferencesService.openUserSettings(options);
        }
        onLearnMore() {
            this.openerService.open(uri_1.URI.parse('https://go.microsoft.com/fwlink/?linkid=853977'));
        }
        onSearchAgain() {
            this.inputPatternExcludes.setValue('');
            this.inputPatternIncludes.setValue('');
            this.inputPatternIncludes.setOnlySearchInOpenEditors(false);
            this.triggerQueryChange({ preserveFocus: false });
        }
        onEnableExcludes() {
            this.toggleQueryDetails(false, true);
            this.searchExcludePattern.setUseExcludesAndIgnoreFiles(true);
        }
        onDisableSearchInOpenEditors() {
            this.toggleQueryDetails(false, true);
            this.inputPatternIncludes.setOnlySearchInOpenEditors(false);
        }
        updateSearchResultCount(disregardExcludesAndIgnores, onlyOpenEditors, clear = false) {
            const fileCount = this.viewModel.searchResult.fileCount();
            this.hasSearchResultsKey.set(fileCount > 0);
            const msgWasHidden = this.messagesElement.style.display === 'none';
            const messageEl = this.clearMessage();
            const resultMsg = clear ? '' : this.buildResultCountMessage(this.viewModel.searchResult.count(), fileCount);
            this.tree.ariaLabel = resultMsg + nls.localize('forTerm', " - Search: {0}", this.searchResult.query?.contentPattern.pattern ?? '');
            dom.append(messageEl, resultMsg);
            if (fileCount > 0) {
                if (disregardExcludesAndIgnores) {
                    const excludesDisabledMessage = ' - ' + nls.localize('useIgnoresAndExcludesDisabled', "exclude settings and ignore files are disabled") + ' ';
                    const enableExcludesButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('excludes.enable', "enable"), this.onEnableExcludes.bind(this), nls.localize('useExcludesAndIgnoreFilesDescription', "Use Exclude Settings and Ignore Files")));
                    dom.append(messageEl, $('span', undefined, excludesDisabledMessage, '(', enableExcludesButton.element, ')'));
                }
                if (onlyOpenEditors) {
                    const searchingInOpenMessage = ' - ' + nls.localize('onlyOpenEditors', "searching only in open files") + ' ';
                    const disableOpenEditorsButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openEditors.disable', "disable"), this.onDisableSearchInOpenEditors.bind(this), nls.localize('disableOpenEditors', "Search in entire workspace")));
                    dom.append(messageEl, $('span', undefined, searchingInOpenMessage, '(', disableOpenEditorsButton.element, ')'));
                }
                dom.append(messageEl, ' - ');
                const openInEditorTooltip = (0, searchActionsBase_1.appendKeyBindingLabel)(nls.localize('openInEditor.tooltip', "Copy current search results to an editor"), this.keybindingService.lookupKeybinding(Constants.OpenInEditorCommandId));
                const openInEditorButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openInEditor.message', "Open in editor"), () => this.instantiationService.invokeFunction(searchEditorActions_1.createEditorFromSearchResult, this.searchResult, this.searchIncludePattern.getValue(), this.searchExcludePattern.getValue(), this.searchIncludePattern.onlySearchInOpenEditors()), openInEditorTooltip));
                dom.append(messageEl, openInEditorButton.element);
                this.reLayout();
            }
            else if (!msgWasHidden) {
                dom.hide(this.messagesElement);
            }
        }
        addMessage(message) {
            const messageBox = this.messagesElement.firstChild;
            if (!messageBox) {
                return;
            }
            dom.append(messageBox, (0, searchMessage_1.renderSearchMessage)(message, this.instantiationService, this.notificationService, this.openerService, this.commandService, this.messageDisposables, () => this.triggerQueryChange()));
        }
        buildResultCountMessage(resultCount, fileCount) {
            if (resultCount === 1 && fileCount === 1) {
                return nls.localize('search.file.result', "{0} result in {1} file", resultCount, fileCount);
            }
            else if (resultCount === 1) {
                return nls.localize('search.files.result', "{0} result in {1} files", resultCount, fileCount);
            }
            else if (fileCount === 1) {
                return nls.localize('search.file.results', "{0} results in {1} file", resultCount, fileCount);
            }
            else {
                return nls.localize('search.files.results', "{0} results in {1} files", resultCount, fileCount);
            }
        }
        showSearchWithoutFolderMessage() {
            this.searchWithoutFolderMessageElement = this.clearMessage();
            const textEl = dom.append(this.searchWithoutFolderMessageElement, $('p', undefined, nls.localize('searchWithoutFolder', "You have not opened or specified a folder. Only open files are currently searched - ")));
            const openFolderButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openFolder', "Open Folder"), () => {
                this.commandService.executeCommand(env.isMacintosh && env.isNative ? workspaceActions_1.OpenFileFolderAction.ID : workspaceActions_1.OpenFolderAction.ID).catch(err => errors.onUnexpectedError(err));
            }));
            dom.append(textEl, openFolderButton.element);
        }
        showEmptyStage(forceHideMessages = false) {
            const showingCancelled = (this.messagesElement.firstChild?.textContent?.indexOf(SEARCH_CANCELLED_MESSAGE) ?? -1) > -1;
            // clean up ui
            // this.replaceService.disposeAllReplacePreviews();
            if (showingCancelled || forceHideMessages || !this.configurationService.getValue().search.searchOnType) {
                // when in search to type, don't preemptively hide, as it causes flickering and shifting of the live results
                dom.hide(this.messagesElement);
            }
            dom.show(this.resultsElement);
            this.currentSelectedFileMatch = undefined;
        }
        shouldOpenInNotebookEditor(match, uri) {
            // Untitled files will return a false positive for getContributedNotebookTypes.
            // Since untitled files are already open, then untitled notebooks should return NotebookMatch results.
            return match instanceof searchModel_1.MatchInNotebook || (uri.scheme !== network.Schemas.untitled && this.notebookService.getContributedNotebookTypes(uri).length > 0);
        }
        onFocus(lineMatch, preserveFocus, sideBySide, pinned) {
            const useReplacePreview = this.configurationService.getValue().search.useReplacePreview;
            const resource = lineMatch instanceof searchModel_1.Match ? lineMatch.parent().resource : lineMatch.resource;
            return (useReplacePreview && this.viewModel.isReplaceActive() && !!this.viewModel.replaceString && !(this.shouldOpenInNotebookEditor(lineMatch, resource))) ?
                this.replaceService.openReplacePreview(lineMatch, preserveFocus, sideBySide, pinned) :
                this.open(lineMatch, preserveFocus, sideBySide, pinned, resource);
        }
        async open(element, preserveFocus, sideBySide, pinned, resourceInput) {
            const selection = getEditorSelectionFromMatch(element, this.viewModel);
            const oldParentMatches = element instanceof searchModel_1.Match ? element.parent().matches() : [];
            const resource = resourceInput ?? (element instanceof searchModel_1.Match ? element.parent().resource : element.resource);
            let editor;
            const options = {
                preserveFocus,
                pinned,
                selection,
                revealIfVisible: true,
            };
            try {
                editor = await this.editorService.openEditor({
                    resource: resource,
                    options,
                }, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
                const editorControl = editor?.getControl();
                if (element instanceof searchModel_1.Match && preserveFocus && (0, editorBrowser_1.isCodeEditor)(editorControl)) {
                    this.viewModel.searchResult.rangeHighlightDecorations.highlightRange(editorControl.getModel(), element.range());
                }
                else {
                    this.viewModel.searchResult.rangeHighlightDecorations.removeHighlightRange();
                }
            }
            catch (err) {
                errors.onUnexpectedError(err);
                return;
            }
            if (editor instanceof notebookEditor_1.NotebookEditor) {
                const elemParent = element.parent();
                if (element instanceof searchModel_1.Match) {
                    if (element instanceof searchModel_1.MatchInNotebook) {
                        element.parent().showMatch(element);
                    }
                    else {
                        const editorWidget = editor.getControl();
                        if (editorWidget) {
                            // Ensure that the editor widget is binded. If if is, then this should return immediately.
                            // Otherwise, it will bind the widget.
                            elemParent.bindNotebookEditorWidget(editorWidget);
                            await elemParent.updateMatchesForEditorWidget();
                            const matchIndex = oldParentMatches.findIndex(e => e.id() === element.id());
                            const matches = elemParent.matches();
                            const match = matchIndex >= matches.length ? matches[matches.length - 1] : matches[matchIndex];
                            if (match instanceof searchModel_1.MatchInNotebook) {
                                elemParent.showMatch(match);
                                if (!this.tree.getFocus().includes(match) || !this.tree.getSelection().includes(match)) {
                                    this.tree.setSelection([match], (0, listService_1.getSelectionKeyboardEvent)());
                                    this.tree.setFocus([match]);
                                }
                            }
                        }
                    }
                }
            }
        }
        openEditorWithMultiCursor(element) {
            const resource = element instanceof searchModel_1.Match ? element.parent().resource : element.resource;
            return this.editorService.openEditor({
                resource: resource,
                options: {
                    preserveFocus: false,
                    pinned: true,
                    revealIfVisible: true
                }
            }).then(editor => {
                if (editor) {
                    let fileMatch = null;
                    if (element instanceof searchModel_1.FileMatch) {
                        fileMatch = element;
                    }
                    else if (element instanceof searchModel_1.Match) {
                        fileMatch = element.parent();
                    }
                    if (fileMatch) {
                        const selections = fileMatch.matches().map(m => new selection_1.Selection(m.range().startLineNumber, m.range().startColumn, m.range().endLineNumber, m.range().endColumn));
                        const codeEditor = (0, editorBrowser_1.getCodeEditor)(editor.getControl());
                        if (codeEditor) {
                            const multiCursorController = multicursor_1.MultiCursorSelectionController.get(codeEditor);
                            multiCursorController?.selectAllUsingSelections(selections);
                        }
                    }
                }
                this.viewModel.searchResult.rangeHighlightDecorations.removeHighlightRange();
            }, errors.onUnexpectedError);
        }
        onUntitledDidDispose(resource) {
            if (!this.viewModel) {
                return;
            }
            // remove search results from this resource as it got disposed
            const matches = this.viewModel.searchResult.matches();
            for (let i = 0, len = matches.length; i < len; i++) {
                if (resource.toString() === matches[i].resource.toString()) {
                    this.viewModel.searchResult.remove(matches[i]);
                }
            }
        }
        onFilesChanged(e) {
            if (!this.viewModel || (this.searchConfig.sortOrder !== "modified" /* SearchSortOrder.Modified */ && !e.gotDeleted())) {
                return;
            }
            const matches = this.viewModel.searchResult.matches();
            if (e.gotDeleted()) {
                const deletedMatches = matches.filter(m => e.contains(m.resource, 2 /* FileChangeType.DELETED */));
                this.viewModel.searchResult.remove(deletedMatches);
            }
            else {
                // Check if the changed file contained matches
                const changedMatches = matches.filter(m => e.contains(m.resource));
                if (changedMatches.length && this.searchConfig.sortOrder === "modified" /* SearchSortOrder.Modified */) {
                    // No matches need to be removed, but modified files need to have their file stat updated.
                    this.updateFileStats(changedMatches).then(() => this.refreshTree());
                }
            }
        }
        get searchConfig() {
            return this.configurationService.getValue('search');
        }
        clearHistory() {
            this.searchWidget.clearHistory();
            this.inputPatternExcludes.clearHistory();
            this.inputPatternIncludes.clearHistory();
        }
        saveState() {
            // This can be called before renderBody() method gets called for the first time
            // if we move the searchView inside another viewPaneContainer
            if (!this.searchWidget) {
                return;
            }
            const patternExcludes = this.inputPatternExcludes?.getValue().trim() ?? '';
            const patternIncludes = this.inputPatternIncludes?.getValue().trim() ?? '';
            const onlyOpenEditors = this.inputPatternIncludes?.onlySearchInOpenEditors() ?? false;
            const useExcludesAndIgnoreFiles = this.inputPatternExcludes?.useExcludesAndIgnoreFiles() ?? true;
            const preserveCase = this.viewModel.preserveCase;
            if (this.searchWidget.searchInput) {
                const isRegex = this.searchWidget.searchInput.getRegex();
                const isWholeWords = this.searchWidget.searchInput.getWholeWords();
                const isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
                const contentPattern = this.searchWidget.searchInput.getValue();
                const isInNotebookCellInput = this.searchWidget.getNotebookFilters().codeInput;
                const isInNotebookCellOutput = this.searchWidget.getNotebookFilters().codeOutput;
                const isInNotebookMarkdownInput = this.searchWidget.getNotebookFilters().markupInput;
                const isInNotebookMarkdownPreview = this.searchWidget.getNotebookFilters().markupPreview;
                this.viewletState['query.contentPattern'] = contentPattern;
                this.viewletState['query.regex'] = isRegex;
                this.viewletState['query.wholeWords'] = isWholeWords;
                this.viewletState['query.caseSensitive'] = isCaseSensitive;
                this.viewletState['query.isInNotebookMarkdownInput'] = isInNotebookMarkdownInput;
                this.viewletState['query.isInNotebookMarkdownPreview'] = isInNotebookMarkdownPreview;
                this.viewletState['query.isInNotebookCellInput'] = isInNotebookCellInput;
                this.viewletState['query.isInNotebookCellOutput'] = isInNotebookCellOutput;
            }
            this.viewletState['query.folderExclusions'] = patternExcludes;
            this.viewletState['query.folderIncludes'] = patternIncludes;
            this.viewletState['query.useExcludesAndIgnoreFiles'] = useExcludesAndIgnoreFiles;
            this.viewletState['query.preserveCase'] = preserveCase;
            this.viewletState['query.onlyOpenEditors'] = onlyOpenEditors;
            const isReplaceShown = this.searchAndReplaceWidget.isReplaceShown();
            this.viewletState['view.showReplace'] = isReplaceShown;
            this.viewletState['view.treeLayout'] = this.isTreeLayoutViewVisible;
            this.viewletState['query.replaceText'] = isReplaceShown && this.searchWidget.getReplaceValue();
            this._saveSearchHistoryService();
            this.memento.saveMemento();
            super.saveState();
        }
        _saveSearchHistoryService() {
            if (this.searchWidget === undefined) {
                return;
            }
            const history = Object.create(null);
            const searchHistory = this.searchWidget.getSearchHistory();
            if (searchHistory && searchHistory.length) {
                history.search = searchHistory;
            }
            const replaceHistory = this.searchWidget.getReplaceHistory();
            if (replaceHistory && replaceHistory.length) {
                history.replace = replaceHistory;
            }
            const patternExcludesHistory = this.inputPatternExcludes.getHistory();
            if (patternExcludesHistory && patternExcludesHistory.length) {
                history.exclude = patternExcludesHistory;
            }
            const patternIncludesHistory = this.inputPatternIncludes.getHistory();
            if (patternIncludesHistory && patternIncludesHistory.length) {
                history.include = patternIncludesHistory;
            }
            this.searchHistoryService.save(history);
        }
        async retrieveFileStats() {
            const files = this.searchResult.matches().filter(f => !f.fileStat).map(f => f.resolveFileStat(this.fileService));
            await Promise.all(files);
        }
        async updateFileStats(elements) {
            const files = elements.map(f => f.resolveFileStat(this.fileService));
            await Promise.all(files);
        }
        removeFileStats() {
            for (const fileMatch of this.searchResult.matches()) {
                fileMatch.fileStat = undefined;
            }
        }
        dispose() {
            this.isDisposed = true;
            this.saveState();
            super.dispose();
        }
    };
    exports.SearchView = SearchView;
    exports.SearchView = SearchView = SearchView_1 = __decorate([
        __param(1, files_1.IFileService),
        __param(2, editorService_1.IEditorService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, progress_1.IProgressService),
        __param(5, notification_1.INotificationService),
        __param(6, dialogs_1.IDialogService),
        __param(7, commands_1.ICommandService),
        __param(8, contextView_1.IContextViewService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, views_1.IViewDescriptorService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, workspace_1.IWorkspaceContextService),
        __param(13, searchModel_1.ISearchViewModelWorkbenchService),
        __param(14, contextkey_1.IContextKeyService),
        __param(15, replace_1.IReplaceService),
        __param(16, textfiles_1.ITextFileService),
        __param(17, preferences_1.IPreferencesService),
        __param(18, themeService_1.IThemeService),
        __param(19, searchHistoryService_1.ISearchHistoryService),
        __param(20, contextView_1.IContextMenuService),
        __param(21, accessibility_1.IAccessibilityService),
        __param(22, keybinding_1.IKeybindingService),
        __param(23, storage_1.IStorageService),
        __param(24, opener_1.IOpenerService),
        __param(25, telemetry_1.ITelemetryService),
        __param(26, notebookService_1.INotebookService),
        __param(27, log_1.ILogService),
        __param(28, audioCueService_1.IAudioCueService)
    ], SearchView);
    class SearchLinkButton extends lifecycle_1.Disposable {
        constructor(label, handler, tooltip) {
            super();
            this.element = $('a.pointer', { tabindex: 0, title: tooltip }, label);
            this.addEventHandlers(handler);
        }
        addEventHandlers(handler) {
            const wrappedHandler = (e) => {
                dom.EventHelper.stop(e, false);
                handler(e);
            };
            this._register(dom.addDisposableListener(this.element, dom.EventType.CLICK, wrappedHandler));
            this._register(dom.addDisposableListener(this.element, dom.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                    wrappedHandler(e);
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
        }
    }
    function getEditorSelectionFromMatch(element, viewModel) {
        let match = null;
        if (element instanceof searchModel_1.Match) {
            match = element;
        }
        if (element instanceof searchModel_1.FileMatch && element.count() > 0) {
            match = element.matches()[element.matches().length - 1];
        }
        if (match) {
            const range = match.range();
            if (viewModel.isReplaceActive() && !!viewModel.replaceString) {
                const replaceString = match.replaceString;
                return {
                    startLineNumber: range.startLineNumber,
                    startColumn: range.startColumn,
                    endLineNumber: range.startLineNumber,
                    endColumn: range.startColumn + replaceString.length
                };
            }
            return range;
        }
        return undefined;
    }
    exports.getEditorSelectionFromMatch = getEditorSelectionFromMatch;
    function getSelectionTextFromEditor(allowUnselectedWord, activeEditor) {
        let editor = activeEditor;
        if ((0, editorBrowser_1.isDiffEditor)(editor)) {
            if (editor.getOriginalEditor().hasTextFocus()) {
                editor = editor.getOriginalEditor();
            }
            else {
                editor = editor.getModifiedEditor();
            }
        }
        if (!(0, editorBrowser_1.isCodeEditor)(editor) || !editor.hasModel()) {
            return null;
        }
        const range = editor.getSelection();
        if (!range) {
            return null;
        }
        if (range.isEmpty()) {
            if (allowUnselectedWord) {
                const wordAtPosition = editor.getModel().getWordAtPosition(range.getStartPosition());
                return wordAtPosition?.word ?? null;
            }
            else {
                return null;
            }
        }
        let searchText = '';
        for (let i = range.startLineNumber; i <= range.endLineNumber; i++) {
            let lineText = editor.getModel().getLineContent(i);
            if (i === range.endLineNumber) {
                lineText = lineText.substring(0, range.endColumn - 1);
            }
            if (i === range.startLineNumber) {
                lineText = lineText.substring(range.startColumn - 1);
            }
            if (i !== range.startLineNumber) {
                lineText = '\n' + lineText;
            }
            searchText += lineText;
        }
        return searchText;
    }
    exports.getSelectionTextFromEditor = getSelectionTextFromEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvc2VhcmNoVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBaUZoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLElBQVksa0JBR1g7SUFIRCxXQUFZLGtCQUFrQjtRQUM3QixpRUFBTyxDQUFBO1FBQ1AsNkRBQUssQ0FBQTtJQUNOLENBQUMsRUFIVyxrQkFBa0Isa0NBQWxCLGtCQUFrQixRQUc3QjtJQUVELE1BQU0sd0JBQXdCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSwwREFBMEQsQ0FBQyxDQUFDO0lBQzVILE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUNuQixJQUFNLFVBQVUsR0FBaEIsTUFBTSxVQUFXLFNBQVEsbUJBQVE7O2lCQUVmLDZCQUF3QixHQUFHLGVBQWUsQUFBbEIsQ0FBbUI7UUFzRW5FLFlBQ0MsT0FBeUIsRUFDWCxXQUEwQyxFQUN4QyxhQUE4QyxFQUMxQyxpQkFBc0QsRUFDeEQsZUFBa0QsRUFDOUMsbUJBQTBELEVBQ2hFLGFBQThDLEVBQzdDLGNBQWdELEVBQzVDLGtCQUF3RCxFQUN0RCxvQkFBMkMsRUFDMUMscUJBQTZDLEVBQzlDLG9CQUEyQyxFQUN4QyxjQUF5RCxFQUNqRCwrQkFBa0YsRUFDaEcsaUJBQXFDLEVBQ3hDLGNBQWdELEVBQy9DLGVBQWtELEVBQy9DLGtCQUF3RCxFQUM5RCxZQUEyQixFQUNuQixvQkFBNEQsRUFDOUQsa0JBQXVDLEVBQ3JDLG9CQUE0RCxFQUMvRCxpQkFBcUMsRUFDeEMsY0FBZ0QsRUFDakQsYUFBNkIsRUFDMUIsZ0JBQW1DLEVBQ3BDLGVBQWtELEVBQ3ZELFVBQXdDLEVBQ25D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
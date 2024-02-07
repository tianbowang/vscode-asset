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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/model", "vs/editor/common/services/textResourceConfiguration", "vs/editor/contrib/gotoSymbol/browser/peek/referencesController", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/label/common/label", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/editor/textCodeEditor", "vs/workbench/contrib/search/browser/patternInputWidget", "vs/workbench/contrib/search/browser/searchWidget", "vs/workbench/contrib/search/common/constants", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/search/browser/searchIcons", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/notification/common/notification", "vs/workbench/contrib/search/browser/searchMessage", "vs/editor/browser/editorExtensions", "vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators", "vs/platform/theme/browser/defaultStyles", "vs/platform/log/common/log", "vs/css!./media/searchEditor"], function (require, exports, DOM, keyboardEvent_1, aria_1, async_1, lifecycle_1, types_1, position_1, range_1, selection_1, model_1, textResourceConfiguration_1, referencesController_1, nls_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, label_1, progress_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, workspace_1, textCodeEditor_1, patternInputWidget_1, searchWidget_1, constants_1, queryBuilder_1, search_1, searchModel_1, constants_2, searchEditorSerialization_1, editorGroupsService_1, editorService_1, searchIcons_1, files_1, opener_1, notification_1, searchMessage_1, editorExtensions_1, unusualLineTerminators_1, defaultStyles_1, log_1) {
    "use strict";
    var SearchEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchEditor = void 0;
    const RESULT_LINE_REGEX = /^(\s+)(\d+)(: |  )(\s*)(.*)$/;
    const FILE_LINE_REGEX = /^(\S.*):$/;
    let SearchEditor = class SearchEditor extends textCodeEditor_1.AbstractTextCodeEditor {
        static { SearchEditor_1 = this; }
        static { this.ID = constants_2.SearchEditorID; }
        static { this.SEARCH_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'searchEditorViewState'; }
        get searchResultEditor() { return this.editorControl; }
        constructor(telemetryService, themeService, storageService, modelService, contextService, labelService, instantiationService, contextViewService, commandService, openerService, notificationService, progressService, textResourceService, editorGroupService, editorService, configurationService, fileService, logService) {
            super(SearchEditor_1.ID, telemetryService, instantiationService, storageService, textResourceService, themeService, editorService, editorGroupService, fileService);
            this.modelService = modelService;
            this.contextService = contextService;
            this.labelService = labelService;
            this.contextViewService = contextViewService;
            this.commandService = commandService;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this.configurationService = configurationService;
            this.logService = logService;
            this.runSearchDelayer = new async_1.Delayer(0);
            this.pauseSearching = false;
            this.showingIncludesExcludes = false;
            this.ongoingOperations = 0;
            this.updatingModelForSearch = false;
            this.container = DOM.$('.search-editor');
            this.searchOperation = this._register(new progress_1.LongRunningOperation(progressService));
            this._register(this.messageDisposables = new lifecycle_1.DisposableStore());
            this.searchHistoryDelayer = new async_1.Delayer(2000);
            this.searchModel = this._register(this.instantiationService.createInstance(searchModel_1.SearchModel));
        }
        createEditor(parent) {
            DOM.append(parent, this.container);
            this.queryEditorContainer = DOM.append(this.container, DOM.$('.query-container'));
            const searchResultContainer = DOM.append(this.container, DOM.$('.search-results'));
            super.createEditor(searchResultContainer);
            this.registerEditorListeners();
            const scopedContextKeyService = (0, types_1.assertIsDefined)(this.scopedContextKeyService);
            constants_2.InSearchEditor.bindTo(scopedContextKeyService).set(true);
            this.createQueryEditor(this.queryEditorContainer, this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, scopedContextKeyService])), constants_1.InputBoxFocusedKey.bindTo(scopedContextKeyService));
        }
        createQueryEditor(container, scopedInstantiationService, inputBoxFocusedContextKey) {
            const searchEditorInputboxStyles = (0, defaultStyles_1.getInputBoxStyle)({ inputBorder: searchEditorTextInputBorder });
            this.queryEditorWidget = this._register(scopedInstantiationService.createInstance(searchWidget_1.SearchWidget, container, { _hideReplaceToggle: true, showContextToggle: true, inputBoxStyles: searchEditorInputboxStyles, toggleStyles: defaultStyles_1.defaultToggleStyles }));
            this._register(this.queryEditorWidget.onReplaceToggled(() => this.reLayout()));
            this._register(this.queryEditorWidget.onDidHeightChange(() => this.reLayout()));
            this._register(this.queryEditorWidget.onSearchSubmit(({ delay }) => this.triggerSearch({ delay })));
            if (this.queryEditorWidget.searchInput) {
                this._register(this.queryEditorWidget.searchInput.onDidOptionChange(() => this.triggerSearch({ resetCursor: false })));
            }
            else {
                this.logService.warn('SearchEditor: SearchWidget.searchInput is undefined, cannot register onDidOptionChange listener');
            }
            this._register(this.queryEditorWidget.onDidToggleContext(() => this.triggerSearch({ resetCursor: false })));
            // Includes/Excludes Dropdown
            this.includesExcludesContainer = DOM.append(container, DOM.$('.includes-excludes'));
            // Toggle query details button
            this.toggleQueryDetailsButton = DOM.append(this.includesExcludesContainer, DOM.$('.expand' + themables_1.ThemeIcon.asCSSSelector(searchIcons_1.searchDetailsIcon), { tabindex: 0, role: 'button', title: (0, nls_1.localize)('moreSearch', "Toggle Search Details") }));
            this._register(DOM.addDisposableListener(this.toggleQueryDetailsButton, DOM.EventType.CLICK, e => {
                DOM.EventHelper.stop(e);
                this.toggleIncludesExcludes();
            }));
            this._register(DOM.addDisposableListener(this.toggleQueryDetailsButton, DOM.EventType.KEY_UP, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    DOM.EventHelper.stop(e);
                    this.toggleIncludesExcludes();
                }
            }));
            this._register(DOM.addDisposableListener(this.toggleQueryDetailsButton, DOM.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                    if (this.queryEditorWidget.isReplaceActive()) {
                        this.queryEditorWidget.focusReplaceAllAction();
                    }
                    else {
                        this.queryEditorWidget.isReplaceShown() ? this.queryEditorWidget.replaceInput?.focusOnPreserve() : this.queryEditorWidget.focusRegexAction();
                    }
                    DOM.EventHelper.stop(e);
                }
            }));
            // Includes
            const folderIncludesList = DOM.append(this.includesExcludesContainer, DOM.$('.file-types.includes'));
            const filesToIncludeTitle = (0, nls_1.localize)('searchScope.includes', "files to include");
            DOM.append(folderIncludesList, DOM.$('h4', undefined, filesToIncludeTitle));
            this.inputPatternIncludes = this._register(scopedInstantiationService.createInstance(patternInputWidget_1.IncludePatternInputWidget, folderIncludesList, this.contextViewService, {
                ariaLabel: (0, nls_1.localize)('label.includes', 'Search Include Patterns'),
                inputBoxStyles: searchEditorInputboxStyles
            }));
            this.inputPatternIncludes.onSubmit(triggeredOnType => this.triggerSearch({ resetCursor: false, delay: triggeredOnType ? this.searchConfig.searchOnTypeDebouncePeriod : 0 }));
            this._register(this.inputPatternIncludes.onChangeSearchInEditorsBox(() => this.triggerSearch()));
            // Excludes
            const excludesList = DOM.append(this.includesExcludesContainer, DOM.$('.file-types.excludes'));
            const excludesTitle = (0, nls_1.localize)('searchScope.excludes', "files to exclude");
            DOM.append(excludesList, DOM.$('h4', undefined, excludesTitle));
            this.inputPatternExcludes = this._register(scopedInstantiationService.createInstance(patternInputWidget_1.ExcludePatternInputWidget, excludesList, this.contextViewService, {
                ariaLabel: (0, nls_1.localize)('label.excludes', 'Search Exclude Patterns'),
                inputBoxStyles: searchEditorInputboxStyles
            }));
            this.inputPatternExcludes.onSubmit(triggeredOnType => this.triggerSearch({ resetCursor: false, delay: triggeredOnType ? this.searchConfig.searchOnTypeDebouncePeriod : 0 }));
            this._register(this.inputPatternExcludes.onChangeIgnoreBox(() => this.triggerSearch()));
            // Messages
            this.messageBox = DOM.append(container, DOM.$('.messages.text-search-provider-messages'));
            [this.queryEditorWidget.searchInputFocusTracker, this.queryEditorWidget.replaceInputFocusTracker, this.inputPatternExcludes.inputFocusTracker, this.inputPatternIncludes.inputFocusTracker]
                .forEach(tracker => {
                if (!tracker) {
                    return;
                }
                this._register(tracker.onDidFocus(() => setTimeout(() => inputBoxFocusedContextKey.set(true), 0)));
                this._register(tracker.onDidBlur(() => inputBoxFocusedContextKey.set(false)));
            });
        }
        toggleRunAgainMessage(show) {
            DOM.clearNode(this.messageBox);
            this.messageDisposables.clear();
            if (show) {
                const runAgainLink = DOM.append(this.messageBox, DOM.$('a.pointer.prominent.message', {}, (0, nls_1.localize)('runSearch', "Run Search")));
                this.messageDisposables.add(DOM.addDisposableListener(runAgainLink, DOM.EventType.CLICK, async () => {
                    await this.triggerSearch();
                    this.searchResultEditor.focus();
                }));
            }
        }
        _getContributions() {
            const skipContributions = [unusualLineTerminators_1.UnusualLineTerminatorsDetector.ID];
            return editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => skipContributions.indexOf(c.id) === -1);
        }
        getCodeEditorWidgetOptions() {
            return { contributions: this._getContributions() };
        }
        registerEditorListeners() {
            this.searchResultEditor.onMouseUp(e => {
                if (e.event.detail === 2) {
                    const behaviour = this.searchConfig.searchEditor.doubleClickBehaviour;
                    const position = e.target.position;
                    if (position && behaviour !== 'selectWord') {
                        const line = this.searchResultEditor.getModel()?.getLineContent(position.lineNumber) ?? '';
                        if (line.match(RESULT_LINE_REGEX)) {
                            this.searchResultEditor.setSelection(range_1.Range.fromPositions(position));
                            this.commandService.executeCommand(behaviour === 'goToLocation' ? 'editor.action.goToDeclaration' : 'editor.action.openDeclarationToTheSide');
                        }
                        else if (line.match(FILE_LINE_REGEX)) {
                            this.searchResultEditor.setSelection(range_1.Range.fromPositions(position));
                            this.commandService.executeCommand('editor.action.peekDefinition');
                        }
                    }
                }
            });
            this._register(this.searchResultEditor.onDidChangeModelContent(() => {
                if (!this.updatingModelForSearch) {
                    this.getInput()?.setDirty(true);
                }
            }));
        }
        getControl() {
            return this.searchResultEditor;
        }
        focus() {
            super.focus();
            const viewState = this.loadEditorViewState(this.getInput());
            if (viewState && viewState.focused === 'editor') {
                this.searchResultEditor.focus();
            }
            else {
                this.queryEditorWidget.focus();
            }
        }
        focusSearchInput() {
            this.queryEditorWidget.searchInput?.focus();
        }
        focusFilesToIncludeInput() {
            if (!this.showingIncludesExcludes) {
                this.toggleIncludesExcludes(true);
            }
            this.inputPatternIncludes.focus();
        }
        focusFilesToExcludeInput() {
            if (!this.showingIncludesExcludes) {
                this.toggleIncludesExcludes(true);
            }
            this.inputPatternExcludes.focus();
        }
        focusNextInput() {
            if (this.queryEditorWidget.searchInputHasFocus()) {
                if (this.showingIncludesExcludes) {
                    this.inputPatternIncludes.focus();
                }
                else {
                    this.searchResultEditor.focus();
                }
            }
            else if (this.inputPatternIncludes.inputHasFocus()) {
                this.inputPatternExcludes.focus();
            }
            else if (this.inputPatternExcludes.inputHasFocus()) {
                this.searchResultEditor.focus();
            }
            else if (this.searchResultEditor.hasWidgetFocus()) {
                // pass
            }
        }
        focusPrevInput() {
            if (this.queryEditorWidget.searchInputHasFocus()) {
                this.searchResultEditor.focus(); // wrap
            }
            else if (this.inputPatternIncludes.inputHasFocus()) {
                this.queryEditorWidget.searchInput?.focus();
            }
            else if (this.inputPatternExcludes.inputHasFocus()) {
                this.inputPatternIncludes.focus();
            }
            else if (this.searchResultEditor.hasWidgetFocus()) {
                // unreachable.
            }
        }
        setQuery(query) {
            this.queryEditorWidget.searchInput?.setValue(query);
        }
        selectQuery() {
            this.queryEditorWidget.searchInput?.select();
        }
        toggleWholeWords() {
            this.queryEditorWidget.searchInput?.setWholeWords(!this.queryEditorWidget.searchInput.getWholeWords());
            this.triggerSearch({ resetCursor: false });
        }
        toggleRegex() {
            this.queryEditorWidget.searchInput?.setRegex(!this.queryEditorWidget.searchInput.getRegex());
            this.triggerSearch({ resetCursor: false });
        }
        toggleCaseSensitive() {
            this.queryEditorWidget.searchInput?.setCaseSensitive(!this.queryEditorWidget.searchInput.getCaseSensitive());
            this.triggerSearch({ resetCursor: false });
        }
        toggleContextLines() {
            this.queryEditorWidget.toggleContextLines();
        }
        modifyContextLines(increase) {
            this.queryEditorWidget.modifyContextLines(increase);
        }
        toggleQueryDetails(shouldShow) {
            this.toggleIncludesExcludes(shouldShow);
        }
        deleteResultBlock() {
            const linesToDelete = new Set();
            const selections = this.searchResultEditor.getSelections();
            const model = this.searchResultEditor.getModel();
            if (!(selections && model)) {
                return;
            }
            const maxLine = model.getLineCount();
            const minLine = 1;
            const deleteUp = (start) => {
                for (let cursor = start; cursor >= minLine; cursor--) {
                    const line = model.getLineContent(cursor);
                    linesToDelete.add(cursor);
                    if (line[0] !== undefined && line[0] !== ' ') {
                        break;
                    }
                }
            };
            const deleteDown = (start) => {
                linesToDelete.add(start);
                for (let cursor = start + 1; cursor <= maxLine; cursor++) {
                    const line = model.getLineContent(cursor);
                    if (line[0] !== undefined && line[0] !== ' ') {
                        return cursor;
                    }
                    linesToDelete.add(cursor);
                }
                return;
            };
            const endingCursorLines = [];
            for (const selection of selections) {
                const lineNumber = selection.startLineNumber;
                endingCursorLines.push(deleteDown(lineNumber));
                deleteUp(lineNumber);
                for (let inner = selection.startLineNumber; inner <= selection.endLineNumber; inner++) {
                    linesToDelete.add(inner);
                }
            }
            if (endingCursorLines.length === 0) {
                endingCursorLines.push(1);
            }
            const isDefined = (x) => x !== undefined;
            model.pushEditOperations(this.searchResultEditor.getSelections(), [...linesToDelete].map(line => ({ range: new range_1.Range(line, 1, line + 1, 1), text: '' })), () => endingCursorLines.filter(isDefined).map(line => new selection_1.Selection(line, 1, line, 1)));
        }
        cleanState() {
            this.getInput()?.setDirty(false);
        }
        get searchConfig() {
            return this.configurationService.getValue('search');
        }
        iterateThroughMatches(reverse) {
            const model = this.searchResultEditor.getModel();
            if (!model) {
                return;
            }
            const lastLine = model.getLineCount() ?? 1;
            const lastColumn = model.getLineLength(lastLine);
            const fallbackStart = reverse ? new position_1.Position(lastLine, lastColumn) : new position_1.Position(1, 1);
            const currentPosition = this.searchResultEditor.getSelection()?.getStartPosition() ?? fallbackStart;
            const matchRanges = this.getInput()?.getMatchRanges();
            if (!matchRanges) {
                return;
            }
            const matchRange = (reverse ? findPrevRange : findNextRange)(matchRanges, currentPosition);
            this.searchResultEditor.setSelection(matchRange);
            this.searchResultEditor.revealLineInCenterIfOutsideViewport(matchRange.startLineNumber);
            this.searchResultEditor.focus();
            const matchLineText = model.getLineContent(matchRange.startLineNumber);
            const matchText = model.getValueInRange(matchRange);
            let file = '';
            for (let line = matchRange.startLineNumber; line >= 1; line--) {
                const lineText = model.getValueInRange(new range_1.Range(line, 1, line, 2));
                if (lineText !== ' ') {
                    file = model.getLineContent(line);
                    break;
                }
            }
            (0, aria_1.alert)((0, nls_1.localize)('searchResultItem', "Matched {0} at {1} in file {2}", matchText, matchLineText, file.slice(0, file.length - 1)));
        }
        focusNextResult() {
            this.iterateThroughMatches(false);
        }
        focusPreviousResult() {
            this.iterateThroughMatches(true);
        }
        focusAllResults() {
            this.searchResultEditor
                .setSelections((this.getInput()?.getMatchRanges() ?? []).map(range => new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)));
            this.searchResultEditor.focus();
        }
        async triggerSearch(_options) {
            const options = { resetCursor: true, delay: 0, ..._options };
            if (!this.pauseSearching) {
                await this.runSearchDelayer.trigger(async () => {
                    this.toggleRunAgainMessage(false);
                    await this.doRunSearch();
                    if (options.resetCursor) {
                        this.searchResultEditor.setPosition(new position_1.Position(1, 1));
                        this.searchResultEditor.setScrollPosition({ scrollTop: 0, scrollLeft: 0 });
                    }
                    if (options.focusResults) {
                        this.searchResultEditor.focus();
                    }
                }, options.delay);
            }
        }
        readConfigFromWidget() {
            return {
                isCaseSensitive: this.queryEditorWidget.searchInput?.getCaseSensitive() ?? false,
                contextLines: this.queryEditorWidget.getContextLines(),
                filesToExclude: this.inputPatternExcludes.getValue(),
                filesToInclude: this.inputPatternIncludes.getValue(),
                query: this.queryEditorWidget.searchInput?.getValue() ?? '',
                isRegexp: this.queryEditorWidget.searchInput?.getRegex() ?? false,
                matchWholeWord: this.queryEditorWidget.searchInput?.getWholeWords() ?? false,
                useExcludeSettingsAndIgnoreFiles: this.inputPatternExcludes.useExcludesAndIgnoreFiles(),
                onlyOpenEditors: this.inputPatternIncludes.onlySearchInOpenEditors(),
                showIncludesExcludes: this.showingIncludesExcludes,
                notebookSearchConfig: {
                    includeMarkupInput: this.queryEditorWidget.getNotebookFilters().markupInput,
                    includeMarkupPreview: this.queryEditorWidget.getNotebookFilters().markupPreview,
                    includeCodeInput: this.queryEditorWidget.getNotebookFilters().codeInput,
                    includeOutput: this.queryEditorWidget.getNotebookFilters().codeOutput,
                }
            };
        }
        async doRunSearch() {
            this.searchModel.cancelSearch(true);
            const startInput = this.getInput();
            if (!startInput) {
                return;
            }
            this.searchHistoryDelayer.trigger(() => {
                this.queryEditorWidget.searchInput?.onSearchSubmit();
                this.inputPatternExcludes.onSearchSubmit();
                this.inputPatternIncludes.onSearchSubmit();
            });
            const config = this.readConfigFromWidget();
            if (!config.query) {
                return;
            }
            const content = {
                pattern: config.query,
                isRegExp: config.isRegexp,
                isCaseSensitive: config.isCaseSensitive,
                isWordMatch: config.matchWholeWord,
            };
            const options = {
                _reason: 'searchEditor',
                extraFileResources: this.instantiationService.invokeFunction(search_1.getOutOfWorkspaceEditorResources),
                maxResults: this.searchConfig.maxResults ?? undefined,
                disregardIgnoreFiles: !config.useExcludeSettingsAndIgnoreFiles || undefined,
                disregardExcludeSettings: !config.useExcludeSettingsAndIgnoreFiles || undefined,
                excludePattern: config.filesToExclude,
                includePattern: config.filesToInclude,
                onlyOpenEditors: config.onlyOpenEditors,
                previewOptions: {
                    matchLines: 1,
                    charsPerLine: 1000
                },
                afterContext: config.contextLines,
                beforeContext: config.contextLines,
                isSmartCase: this.searchConfig.smartCase,
                expandPatterns: true,
                notebookSearchConfig: {
                    includeMarkupInput: config.notebookSearchConfig.includeMarkupInput,
                    includeMarkupPreview: config.notebookSearchConfig.includeMarkupPreview,
                    includeCodeInput: config.notebookSearchConfig.includeCodeInput,
                    includeOutput: config.notebookSearchConfig.includeOutput,
                }
            };
            const folderResources = this.contextService.getWorkspace().folders;
            let query;
            try {
                const queryBuilder = this.instantiationService.createInstance(queryBuilder_1.QueryBuilder);
                query = queryBuilder.text(content, folderResources.map(folder => folder.uri), options);
            }
            catch (err) {
                return;
            }
            this.searchOperation.start(500);
            this.ongoingOperations++;
            const { configurationModel } = await startInput.resolveModels();
            configurationModel.updateConfig(config);
            const result = this.searchModel.search(query);
            startInput.ongoingSearchOperation = result.asyncResults.finally(() => {
                this.ongoingOperations--;
                if (this.ongoingOperations === 0) {
                    this.searchOperation.stop();
                }
            });
            const searchOperation = await startInput.ongoingSearchOperation;
            await this.onSearchComplete(searchOperation, config, startInput);
        }
        async onSearchComplete(searchOperation, startConfig, startInput) {
            const input = this.getInput();
            if (!input ||
                input !== startInput ||
                JSON.stringify(startConfig) !== JSON.stringify(this.readConfigFromWidget())) {
                return;
            }
            input.ongoingSearchOperation = undefined;
            const sortOrder = this.searchConfig.sortOrder;
            if (sortOrder === "modified" /* SearchSortOrder.Modified */) {
                await this.retrieveFileStats(this.searchModel.searchResult);
            }
            const controller = referencesController_1.ReferencesController.get(this.searchResultEditor);
            controller?.closeWidget(false);
            const labelFormatter = (uri) => this.labelService.getUriLabel(uri, { relative: true });
            const results = (0, searchEditorSerialization_1.serializeSearchResultForEditor)(this.searchModel.searchResult, startConfig.filesToInclude, startConfig.filesToExclude, startConfig.contextLines, labelFormatter, sortOrder, searchOperation?.limitHit);
            const { resultsModel } = await input.resolveModels();
            this.updatingModelForSearch = true;
            this.modelService.updateModel(resultsModel, results.text);
            this.updatingModelForSearch = false;
            if (searchOperation && searchOperation.messages) {
                for (const message of searchOperation.messages) {
                    this.addMessage(message);
                }
            }
            this.reLayout();
            input.setDirty(!input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            input.setMatchRanges(results.matchRanges);
        }
        addMessage(message) {
            let messageBox;
            if (this.messageBox.firstChild) {
                messageBox = this.messageBox.firstChild;
            }
            else {
                messageBox = DOM.append(this.messageBox, DOM.$('.message'));
            }
            DOM.append(messageBox, (0, searchMessage_1.renderSearchMessage)(message, this.instantiationService, this.notificationService, this.openerService, this.commandService, this.messageDisposables, () => this.triggerSearch()));
        }
        async retrieveFileStats(searchResult) {
            const files = searchResult.matches().filter(f => !f.fileStat).map(f => f.resolveFileStat(this.fileService));
            await Promise.all(files);
        }
        layout(dimension) {
            this.dimension = dimension;
            this.reLayout();
        }
        getSelected() {
            const selection = this.searchResultEditor.getSelection();
            if (selection) {
                return this.searchResultEditor.getModel()?.getValueInRange(selection) ?? '';
            }
            return '';
        }
        reLayout() {
            if (this.dimension) {
                this.queryEditorWidget.setWidth(this.dimension.width - 28 /* container margin */);
                this.searchResultEditor.layout({ height: this.dimension.height - DOM.getTotalHeight(this.queryEditorContainer), width: this.dimension.width });
                this.inputPatternExcludes.setWidth(this.dimension.width - 28 /* container margin */);
                this.inputPatternIncludes.setWidth(this.dimension.width - 28 /* container margin */);
            }
        }
        getInput() {
            return this._input;
        }
        setSearchConfig(config) {
            this.priorConfig = config;
            if (config.query !== undefined) {
                this.queryEditorWidget.setValue(config.query);
            }
            if (config.isCaseSensitive !== undefined) {
                this.queryEditorWidget.searchInput?.setCaseSensitive(config.isCaseSensitive);
            }
            if (config.isRegexp !== undefined) {
                this.queryEditorWidget.searchInput?.setRegex(config.isRegexp);
            }
            if (config.matchWholeWord !== undefined) {
                this.queryEditorWidget.searchInput?.setWholeWords(config.matchWholeWord);
            }
            if (config.contextLines !== undefined) {
                this.queryEditorWidget.setContextLines(config.contextLines);
            }
            if (config.filesToExclude !== undefined) {
                this.inputPatternExcludes.setValue(config.filesToExclude);
            }
            if (config.filesToInclude !== undefined) {
                this.inputPatternIncludes.setValue(config.filesToInclude);
            }
            if (config.onlyOpenEditors !== undefined) {
                this.inputPatternIncludes.setOnlySearchInOpenEditors(config.onlyOpenEditors);
            }
            if (config.useExcludeSettingsAndIgnoreFiles !== undefined) {
                this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(config.useExcludeSettingsAndIgnoreFiles);
            }
            if (config.showIncludesExcludes !== undefined) {
                this.toggleIncludesExcludes(config.showIncludesExcludes);
            }
        }
        async setInput(newInput, options, context, token) {
            await super.setInput(newInput, options, context, token);
            if (token.isCancellationRequested) {
                return;
            }
            const { configurationModel, resultsModel } = await newInput.resolveModels();
            if (token.isCancellationRequested) {
                return;
            }
            this.searchResultEditor.setModel(resultsModel);
            this.pauseSearching = true;
            this.toggleRunAgainMessage(!newInput.ongoingSearchOperation && resultsModel.getLineCount() === 1 && resultsModel.getValueLength() === 0 && configurationModel.config.query !== '');
            this.setSearchConfig(configurationModel.config);
            this._register(configurationModel.onConfigDidUpdate(newConfig => {
                if (newConfig !== this.priorConfig) {
                    this.pauseSearching = true;
                    this.setSearchConfig(newConfig);
                    this.pauseSearching = false;
                }
            }));
            this.restoreViewState(context);
            if (!options?.preserveFocus) {
                this.focus();
            }
            this.pauseSearching = false;
            if (newInput.ongoingSearchOperation) {
                const existingConfig = this.readConfigFromWidget();
                newInput.ongoingSearchOperation.then(complete => {
                    this.onSearchComplete(complete, existingConfig, newInput);
                });
            }
        }
        toggleIncludesExcludes(_shouldShow) {
            const cls = 'expanded';
            const shouldShow = _shouldShow ?? !this.includesExcludesContainer.classList.contains(cls);
            if (shouldShow) {
                this.toggleQueryDetailsButton.setAttribute('aria-expanded', 'true');
                this.includesExcludesContainer.classList.add(cls);
            }
            else {
                this.toggleQueryDetailsButton.setAttribute('aria-expanded', 'false');
                this.includesExcludesContainer.classList.remove(cls);
            }
            this.showingIncludesExcludes = this.includesExcludesContainer.classList.contains(cls);
            this.reLayout();
        }
        toEditorViewStateResource(input) {
            if (input.typeId === constants_2.SearchEditorInputTypeId) {
                return input.modelUri;
            }
            return undefined;
        }
        computeEditorViewState(resource) {
            const control = this.getControl();
            const editorViewState = control.saveViewState();
            if (!editorViewState) {
                return undefined;
            }
            if (resource.toString() !== this.getInput()?.modelUri.toString()) {
                return undefined;
            }
            return { ...editorViewState, focused: this.searchResultEditor.hasWidgetFocus() ? 'editor' : 'input' };
        }
        tracksEditorViewState(input) {
            return input.typeId === constants_2.SearchEditorInputTypeId;
        }
        restoreViewState(context) {
            const viewState = this.loadEditorViewState(this.getInput(), context);
            if (viewState) {
                this.searchResultEditor.restoreViewState(viewState);
            }
        }
        getAriaLabel() {
            return this.getInput()?.getName() ?? (0, nls_1.localize)('searchEditor', "Search");
        }
    };
    exports.SearchEditor = SearchEditor;
    exports.SearchEditor = SearchEditor = SearchEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, model_1.IModelService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, label_1.ILabelService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextView_1.IContextViewService),
        __param(8, commands_1.ICommandService),
        __param(9, opener_1.IOpenerService),
        __param(10, notification_1.INotificationService),
        __param(11, progress_1.IEditorProgressService),
        __param(12, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(13, editorGroupsService_1.IEditorGroupsService),
        __param(14, editorService_1.IEditorService),
        __param(15, configuration_1.IConfigurationService),
        __param(16, files_1.IFileService),
        __param(17, log_1.ILogService)
    ], SearchEditor);
    const searchEditorTextInputBorder = (0, colorRegistry_1.registerColor)('searchEditor.textInputBorder', { dark: colorRegistry_1.inputBorder, light: colorRegistry_1.inputBorder, hcDark: colorRegistry_1.inputBorder, hcLight: colorRegistry_1.inputBorder }, (0, nls_1.localize)('textInputBoxBorder', "Search editor text input box border."));
    function findNextRange(matchRanges, currentPosition) {
        for (const matchRange of matchRanges) {
            if (position_1.Position.isBefore(currentPosition, matchRange.getStartPosition())) {
                return matchRange;
            }
        }
        return matchRanges[0];
    }
    function findPrevRange(matchRanges, currentPosition) {
        for (let i = matchRanges.length - 1; i >= 0; i--) {
            const matchRange = matchRanges[i];
            if (position_1.Position.isBefore(matchRange.getStartPosition(), currentPosition)) {
                {
                    return matchRange;
                }
            }
        }
        return matchRanges[matchRanges.length - 1];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2hFZGl0b3IvYnJvd3Nlci9zZWFyY2hFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThEaEcsTUFBTSxpQkFBaUIsR0FBRyw4QkFBOEIsQ0FBQztJQUN6RCxNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFJN0IsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBYSxTQUFRLHVDQUE2Qzs7aUJBQzlELE9BQUUsR0FBVywwQkFBYyxBQUF6QixDQUEwQjtpQkFFNUIsNENBQXVDLEdBQUcsdUJBQXVCLEFBQTFCLENBQTJCO1FBR2xGLElBQVksa0JBQWtCLEtBQUssT0FBTyxJQUFJLENBQUMsYUFBYyxDQUFDLENBQUMsQ0FBQztRQW9CaEUsWUFDb0IsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQ3pCLGNBQStCLEVBQ2pDLFlBQTRDLEVBQ2pDLGNBQXlELEVBQ3BFLFlBQTRDLEVBQ3BDLG9CQUEyQyxFQUM3QyxrQkFBd0QsRUFDNUQsY0FBZ0QsRUFDakQsYUFBOEMsRUFDeEMsbUJBQTBELEVBQ3hELGVBQXVDLEVBQzVCLG1CQUFzRCxFQUNuRSxrQkFBd0MsRUFDOUMsYUFBNkIsRUFDdEIsb0JBQXFELEVBQzlELFdBQXlCLEVBQzFCLFVBQXdDO1lBRXJELEtBQUssQ0FBQyxjQUFZLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBaEJsSSxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNoQixtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDbkQsaUJBQVksR0FBWixZQUFZLENB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
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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/comparers", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/strings", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/notebook/browser/contrib/find/findMatchDecorationModel", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/browser/notebookSearch/searchNotebookHelpers", "vs/workbench/contrib/search/common/notebookSearch", "vs/workbench/contrib/search/common/searchNotebookHelpers", "vs/workbench/services/search/common/replace", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchHelpers", "vs/workbench/contrib/search/common/cellSearchModel"], function (require, exports, async_1, cancellation_1, comparers_1, decorators_1, errors, event_1, lazy_1, lifecycle_1, map_1, network_1, strings_1, ternarySearchTree_1, uri_1, range_1, model_1, textModel_1, model_2, configuration_1, instantiation_1, label_1, log_1, telemetry_1, colorRegistry_1, themeService_1, uriIdentity_1, findMatchDecorationModel_1, notebookEditorWidget_1, notebookEditorService_1, notebookCommon_1, replace_1, searchNotebookHelpers_1, notebookSearch_1, searchNotebookHelpers_2, replace_2, search_1, searchHelpers_1, cellSearchModel_1) {
    "use strict";
    var FileMatch_1, FolderMatch_1, RangeHighlightDecorations_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.arrayContainsElementOrParent = exports.textSearchMatchesToNotebookMatches = exports.RangeHighlightDecorations = exports.ISearchViewModelWorkbenchService = exports.SearchViewModelWorkbenchService = exports.SearchModel = exports.SearchModelLocation = exports.SearchResult = exports.searchComparer = exports.compareNotebookPos = exports.searchMatchComparer = exports.FolderMatchNoRoot = exports.FolderMatchWorkspaceRoot = exports.FolderMatchWithResource = exports.FolderMatch = exports.FileMatch = exports.MatchInNotebook = exports.CellMatch = exports.Match = void 0;
    class Match {
        static { this.MAX_PREVIEW_CHARS = 250; }
        constructor(_parent, _fullPreviewLines, _fullPreviewRange, _documentRange) {
            this._parent = _parent;
            this._fullPreviewLines = _fullPreviewLines;
            this._oneLinePreviewText = _fullPreviewLines[_fullPreviewRange.startLineNumber];
            const adjustedEndCol = _fullPreviewRange.startLineNumber === _fullPreviewRange.endLineNumber ?
                _fullPreviewRange.endColumn :
                this._oneLinePreviewText.length;
            this._rangeInPreviewText = new search_1.OneLineRange(1, _fullPreviewRange.startColumn + 1, adjustedEndCol + 1);
            this._range = new range_1.Range(_documentRange.startLineNumber + 1, _documentRange.startColumn + 1, _documentRange.endLineNumber + 1, _documentRange.endColumn + 1);
            this._fullPreviewRange = _fullPreviewRange;
            this._id = this._parent.id() + '>' + this._range + this.getMatchString();
        }
        id() {
            return this._id;
        }
        parent() {
            return this._parent;
        }
        text() {
            return this._oneLinePreviewText;
        }
        range() {
            return this._range;
        }
        preview() {
            const fullBefore = this._oneLinePreviewText.substring(0, this._rangeInPreviewText.startColumn - 1), before = (0, strings_1.lcut)(fullBefore, 26, '…');
            let inside = this.getMatchString(), after = this._oneLinePreviewText.substring(this._rangeInPreviewText.endColumn - 1);
            let charsRemaining = Match.MAX_PREVIEW_CHARS - before.length;
            inside = inside.substr(0, charsRemaining);
            charsRemaining -= inside.length;
            after = after.substr(0, charsRemaining);
            return {
                before,
                fullBefore,
                inside,
                after,
            };
        }
        get replaceString() {
            const searchModel = this.parent().parent().searchModel;
            if (!searchModel.replacePattern) {
                throw new Error('searchModel.replacePattern must be set before accessing replaceString');
            }
            const fullMatchText = this.fullMatchText();
            let replaceString = searchModel.replacePattern.getReplaceString(fullMatchText, searchModel.preserveCase);
            if (replaceString !== null) {
                return replaceString;
            }
            // Search/find normalize line endings - check whether \r prevents regex from matching
            const fullMatchTextWithoutCR = fullMatchText.replace(/\r\n/g, '\n');
            if (fullMatchTextWithoutCR !== fullMatchText) {
                replaceString = searchModel.replacePattern.getReplaceString(fullMatchTextWithoutCR, searchModel.preserveCase);
                if (replaceString !== null) {
                    return replaceString;
                }
            }
            // If match string is not matching then regex pattern has a lookahead expression
            const contextMatchTextWithSurroundingContent = this.fullMatchText(true);
            replaceString = searchModel.replacePattern.getReplaceString(contextMatchTextWithSurroundingContent, searchModel.preserveCase);
            if (replaceString !== null) {
                return replaceString;
            }
            // Search/find normalize line endings, this time in full context
            const contextMatchTextWithoutCR = contextMatchTextWithSurroundingContent.replace(/\r\n/g, '\n');
            if (contextMatchTextWithoutCR !== contextMatchTextWithSurroundingContent) {
                replaceString = searchModel.replacePattern.getReplaceString(contextMatchTextWithoutCR, searchModel.preserveCase);
                if (replaceString !== null) {
                    return replaceString;
                }
            }
            // Match string is still not matching. Could be unsupported matches (multi-line).
            return searchModel.replacePattern.pattern;
        }
        fullMatchText(includeSurrounding = false) {
            let thisMatchPreviewLines;
            if (includeSurrounding) {
                thisMatchPreviewLines = this._fullPreviewLines;
            }
            else {
                thisMatchPreviewLines = this._fullPreviewLines.slice(this._fullPreviewRange.startLineNumber, this._fullPreviewRange.endLineNumber + 1);
                thisMatchPreviewLines[thisMatchPreviewLines.length - 1] = thisMatchPreviewLines[thisMatchPreviewLines.length - 1].slice(0, this._fullPreviewRange.endColumn);
                thisMatchPreviewLines[0] = thisMatchPreviewLines[0].slice(this._fullPreviewRange.startColumn);
            }
            return thisMatchPreviewLines.join('\n');
        }
        rangeInPreview() {
            // convert to editor's base 1 positions.
            return {
                ...this._fullPreviewRange,
                startColumn: this._fullPreviewRange.startColumn + 1,
                endColumn: this._fullPreviewRange.endColumn + 1
            };
        }
        fullPreviewLines() {
            return this._fullPreviewLines.slice(this._fullPreviewRange.startLineNumber, this._fullPreviewRange.endLineNumber + 1);
        }
        getMatchString() {
            return this._oneLinePreviewText.substring(this._rangeInPreviewText.startColumn - 1, this._rangeInPreviewText.endColumn - 1);
        }
    }
    exports.Match = Match;
    __decorate([
        decorators_1.memoize
    ], Match.prototype, "preview", null);
    class CellMatch {
        constructor(_parent, _cell, _cellIndex) {
            this._parent = _parent;
            this._cell = _cell;
            this._cellIndex = _cellIndex;
            this._contentMatches = new Map();
            this._webviewMatches = new Map();
            this._context = new Map();
        }
        hasCellViewModel() {
            return !(this._cell instanceof cellSearchModel_1.CellSearchModel);
        }
        get context() {
            return new Map(this._context);
        }
        matches() {
            return [...this._contentMatches.values(), ...this._webviewMatches.values()];
        }
        get contentMatches() {
            return Array.from(this._contentMatches.values());
        }
        get webviewMatches() {
            return Array.from(this._webviewMatches.values());
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            for (const match of matches) {
                this._contentMatches.delete(match.id());
                this._webviewMatches.delete(match.id());
            }
        }
        clearAllMatches() {
            this._contentMatches.clear();
            this._webviewMatches.clear();
        }
        addContentMatches(textSearchMatches) {
            const contentMatches = textSearchMatchesToNotebookMatches(textSearchMatches, this);
            contentMatches.forEach((match) => {
                this._contentMatches.set(match.id(), match);
            });
            this.addContext(textSearchMatches);
        }
        addContext(textSearchMatches) {
            if (!this.cell) {
                // todo: get closed notebook results in search editor
                return;
            }
            this.cell.resolveTextModel().then((textModel) => {
                const textResultsWithContext = (0, searchHelpers_1.getTextSearchMatchWithModelContext)(textSearchMatches, textModel, this.parent.parent().query);
                const contexts = textResultsWithContext.filter((result => !(0, search_1.resultIsMatch)(result)));
                contexts.map(context => ({ ...context, lineNumber: context.lineNumber + 1 }))
                    .forEach((context) => { this._context.set(context.lineNumber, context.text); });
            });
        }
        addWebviewMatches(textSearchMatches) {
            const webviewMatches = textSearchMatchesToNotebookMatches(textSearchMatches, this);
            webviewMatches.forEach((match) => {
                this._webviewMatches.set(match.id(), match);
            });
            // TODO: add webview results to context
        }
        setCellModel(cell) {
            this._cell = cell;
        }
        get parent() {
            return this._parent;
        }
        get id() {
            return this._cell?.id ?? `${searchNotebookHelpers_2.rawCellPrefix}${this.cellIndex}`;
        }
        get cellIndex() {
            return this._cellIndex;
        }
        get cell() {
            return this._cell;
        }
    }
    exports.CellMatch = CellMatch;
    class MatchInNotebook extends Match {
        constructor(_cellParent, _fullPreviewLines, _fullPreviewRange, _documentRange, webviewIndex) {
            super(_cellParent.parent, _fullPreviewLines, _fullPreviewRange, _documentRange);
            this._cellParent = _cellParent;
            this._id = this._parent.id() + '>' + this._cellParent.cellIndex + (webviewIndex ? '_' + webviewIndex : '') + '_' + this.notebookMatchTypeString() + this._range + this.getMatchString();
            this._webviewIndex = webviewIndex;
        }
        parent() {
            return this._cellParent.parent;
        }
        get cellParent() {
            return this._cellParent;
        }
        notebookMatchTypeString() {
            return this.isWebviewMatch() ? 'webview' : 'content';
        }
        isWebviewMatch() {
            return this._webviewIndex !== undefined;
        }
        isReadonly() {
            return (!this._cellParent.hasCellViewModel()) || this.isWebviewMatch();
        }
        get cellIndex() {
            return this._cellParent.cellIndex;
        }
        get webviewIndex() {
            return this._webviewIndex;
        }
        get cell() {
            return this._cellParent.cell;
        }
    }
    exports.MatchInNotebook = MatchInNotebook;
    let FileMatch = class FileMatch extends lifecycle_1.Disposable {
        static { FileMatch_1 = this; }
        static { this._CURRENT_FIND_MATCH = textModel_1.ModelDecorationOptions.register({
            description: 'search-current-find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            zIndex: 13,
            className: 'currentFindMatch',
            overviewRuler: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.overviewRulerFindMatchForeground),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapFindMatch),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static { this._FIND_MATCH = textModel_1.ModelDecorationOptions.register({
            description: 'search-find-match',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'findMatch',
            overviewRuler: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.overviewRulerFindMatchForeground),
                position: model_1.OverviewRulerLane.Center
            },
            minimap: {
                color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapFindMatch),
                position: model_1.MinimapPosition.Inline
            }
        }); }
        static getDecorationOption(selected) {
            return (selected ? FileMatch_1._CURRENT_FIND_MATCH : FileMatch_1._FIND_MATCH);
        }
        get context() {
            return new Map(this._context);
        }
        get cellContext() {
            const cellContext = new Map();
            this._cellMatches.forEach(cellMatch => {
                cellContext.set(cellMatch.id, cellMatch.context);
            });
            return cellContext;
        }
        // #endregion
        constructor(_query, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, searchInstanceID, modelService, replaceService, labelService, notebookEditorService) {
            super();
            this._query = _query;
            this._previewOptions = _previewOptions;
            this._maxResults = _maxResults;
            this._parent = _parent;
            this.rawMatch = rawMatch;
            this._closestRoot = _closestRoot;
            this.searchInstanceID = searchInstanceID;
            this.modelService = modelService;
            this.replaceService = replaceService;
            this.labelService = labelService;
            this.notebookEditorService = notebookEditorService;
            this._onChange = this._register(new event_1.Emitter());
            this.onChange = this._onChange.event;
            this._onDispose = this._register(new event_1.Emitter());
            this.onDispose = this._onDispose.event;
            this._model = null;
            this._modelListener = null;
            this._selectedMatch = null;
            this._modelDecorations = [];
            this._context = new Map();
            // #region notebook fields
            this._notebookEditorWidget = null;
            this._editorWidgetListener = null;
            this.replaceQ = Promise.resolve();
            this._resource = this.rawMatch.resource;
            this._textMatches = new Map();
            this._removedTextMatches = new Set();
            this._updateScheduler = new async_1.RunOnceScheduler(this.updateMatchesForModel.bind(this), 250);
            this._name = new lazy_1.Lazy(() => labelService.getUriBasenameLabel(this.resource));
            this._cellMatches = new Map();
            this._notebookUpdateScheduler = new async_1.RunOnceScheduler(this.updateMatchesForEditorWidget.bind(this), 250);
            this.createMatches();
        }
        addWebviewMatchesToCell(cellID, webviewMatches) {
            const cellMatch = this.getCellMatch(cellID);
            if (cellMatch !== undefined) {
                cellMatch.addWebviewMatches(webviewMatches);
            }
        }
        addContentMatchesToCell(cellID, contentMatches) {
            const cellMatch = this.getCellMatch(cellID);
            if (cellMatch !== undefined) {
                cellMatch.addContentMatches(contentMatches);
            }
        }
        getCellMatch(cellID) {
            return this._cellMatches.get(cellID);
        }
        addCellMatch(rawCell) {
            const cellMatch = new CellMatch(this, (0, searchNotebookHelpers_1.isINotebookCellMatchWithModel)(rawCell) ? rawCell.cell : undefined, rawCell.index);
            this._cellMatches.set(cellMatch.id, cellMatch);
            this.addWebviewMatchesToCell(cellMatch.id, rawCell.webviewResults);
            this.addContentMatchesToCell(cellMatch.id, rawCell.contentResults);
        }
        get closestRoot() {
            return this._closestRoot;
        }
        hasReadonlyMatches() {
            return this.matches().some(m => m instanceof MatchInNotebook && m.isReadonly());
        }
        createMatches() {
            const model = this.modelService.getModel(this._resource);
            if (model) {
                this.bindModel(model);
                this.updateMatchesForModel();
            }
            else {
                const notebookEditorWidgetBorrow = this.notebookEditorService.retrieveExistingWidgetFromURI(this.resource);
                if (notebookEditorWidgetBorrow?.value) {
                    this.bindNotebookEditorWidget(notebookEditorWidgetBorrow.value);
                }
                if (this.rawMatch.results) {
                    this.rawMatch.results
                        .filter(search_1.resultIsMatch)
                        .forEach(rawMatch => {
                        textSearchResultToMatches(rawMatch, this)
                            .forEach(m => this.add(m));
                    });
                }
                if ((0, searchNotebookHelpers_1.isINotebookFileMatchWithModel)(this.rawMatch) || (0, searchNotebookHelpers_2.isINotebookFileMatchNoModel)(this.rawMatch)) {
                    this.rawMatch.cellResults?.forEach(cell => this.addCellMatch(cell));
                    this.setNotebookFindMatchDecorationsUsingCellMatches(this.cellMatches());
                    this._onChange.fire({ forceUpdateModel: true });
                }
                this.addContext(this.rawMatch.results);
            }
        }
        bindModel(model) {
            this._model = model;
            this._modelListener = this._model.onDidChangeContent(() => {
                this._updateScheduler.schedule();
            });
            this._model.onWillDispose(() => this.onModelWillDispose());
            this.updateHighlights();
        }
        onModelWillDispose() {
            // Update matches because model might have some dirty changes
            this.updateMatchesForModel();
            this.unbindModel();
        }
        unbindModel() {
            if (this._model) {
                this._updateScheduler.cancel();
                this._model.changeDecorations((accessor) => {
                    this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, []);
                });
                this._model = null;
                this._modelListener.dispose();
            }
        }
        updateMatchesForModel() {
            // this is called from a timeout and might fire
            // after the model has been disposed
            if (!this._model) {
                return;
            }
            this._textMatches = new Map();
            const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
            const matches = this._model
                .findMatches(this._query.pattern, this._model.getFullModelRange(), !!this._query.isRegExp, !!this._query.isCaseSensitive, wordSeparators, false, this._maxResults ?? Number.MAX_SAFE_INTEGER);
            this.updateMatches(matches, true, this._model);
        }
        async updatesMatchesForLineAfterReplace(lineNumber, modelChange) {
            if (!this._model) {
                return;
            }
            const range = {
                startLineNumber: lineNumber,
                startColumn: this._model.getLineMinColumn(lineNumber),
                endLineNumber: lineNumber,
                endColumn: this._model.getLineMaxColumn(lineNumber)
            };
            const oldMatches = Array.from(this._textMatches.values()).filter(match => match.range().startLineNumber === lineNumber);
            oldMatches.forEach(match => this._textMatches.delete(match.id()));
            const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
            const matches = this._model.findMatches(this._query.pattern, range, !!this._query.isRegExp, !!this._query.isCaseSensitive, wordSeparators, false, this._maxResults ?? Number.MAX_SAFE_INTEGER);
            this.updateMatches(matches, modelChange, this._model);
            // await this.updateMatchesForEditorWidget();
        }
        updateMatches(matches, modelChange, model) {
            const textSearchResults = (0, searchHelpers_1.editorMatchesToTextSearchResults)(matches, model, this._previewOptions);
            textSearchResults.forEach(textSearchResult => {
                textSearchResultToMatches(textSearchResult, this).forEach(match => {
                    if (!this._removedTextMatches.has(match.id())) {
                        this.add(match);
                        if (this.isMatchSelected(match)) {
                            this._selectedMatch = match;
                        }
                    }
                });
            });
            this.addContext((0, searchHelpers_1.getTextSearchMatchWithModelContext)(textSearchResults, model, this.parent().parent().query));
            this._onChange.fire({ forceUpdateModel: modelChange });
            this.updateHighlights();
        }
        updateHighlights() {
            if (!this._model) {
                return;
            }
            this._model.changeDecorations((accessor) => {
                const newDecorations = (this.parent().showHighlights
                    ? this.matches().map(match => ({
                        range: match.range(),
                        options: FileMatch_1.getDecorationOption(this.isMatchSelected(match))
                    }))
                    : []);
                this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, newDecorations);
            });
        }
        id() {
            return this.resource.toString();
        }
        parent() {
            return this._parent;
        }
        matches() {
            const cellMatches = Array.from(this._cellMatches.values()).flatMap((e) => e.matches());
            return [...this._textMatches.values(), ...cellMatches];
        }
        textMatches() {
            return Array.from(this._textMatches.values());
        }
        cellMatches() {
            return Array.from(this._cellMatches.values());
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            for (const match of matches) {
                this.removeMatch(match);
                this._removedTextMatches.add(match.id());
            }
            this._onChange.fire({ didRemove: true });
        }
        async replace(toReplace) {
            return this.replaceQ = this.replaceQ.finally(async () => {
                await this.replaceService.replace(toReplace);
                await this.updatesMatchesForLineAfterReplace(toReplace.range().startLineNumber, false);
            });
        }
        setSelectedMatch(match) {
            if (match) {
                if (!this.isMatchSelected(match) && match instanceof MatchInNotebook) {
                    this._selectedMatch = match;
                    return;
                }
                if (!this._textMatches.has(match.id())) {
                    return;
                }
                if (this.isMatchSelected(match)) {
                    return;
                }
            }
            this._selectedMatch = match;
            this.updateHighlights();
        }
        getSelectedMatch() {
            return this._selectedMatch;
        }
        isMatchSelected(match) {
            return !!this._selectedMatch && this._selectedMatch.id() === match.id();
        }
        count() {
            return this.matches().length;
        }
        get resource() {
            return this._resource;
        }
        name() {
            return this._name.value;
        }
        addContext(results) {
            if (!results) {
                return;
            }
            const contexts = results
                .filter((result => !(0, search_1.resultIsMatch)(result)));
            return contexts.forEach(context => this._context.set(context.lineNumber, context.text));
        }
        add(match, trigger) {
            this._textMatches.set(match.id(), match);
            if (trigger) {
                this._onChange.fire({ forceUpdateModel: true });
            }
        }
        removeMatch(match) {
            if (match instanceof MatchInNotebook) {
                match.cellParent.remove(match);
                if (match.cellParent.matches().length === 0) {
                    this._cellMatches.delete(match.cellParent.id);
                }
            }
            else {
                this._textMatches.delete(match.id());
            }
            if (this.isMatchSelected(match)) {
                this.setSelectedMatch(null);
                this._findMatchDecorationModel?.clearCurrentFindMatchDecoration();
            }
            else {
                this.updateHighlights();
            }
            if (match instanceof MatchInNotebook) {
                this.setNotebookFindMatchDecorationsUsingCellMatches(this.cellMatches());
            }
        }
        async resolveFileStat(fileService) {
            this._fileStat = await fileService.stat(this.resource).catch(() => undefined);
        }
        get fileStat() {
            return this._fileStat;
        }
        set fileStat(stat) {
            this._fileStat = stat;
        }
        dispose() {
            this.setSelectedMatch(null);
            this.unbindModel();
            this.unbindNotebookEditorWidget();
            this._onDispose.fire();
            super.dispose();
        }
        hasOnlyReadOnlyMatches() {
            return this.matches().every(match => (match instanceof MatchInNotebook && match.isReadonly()));
        }
        // #region strictly notebook methods
        bindNotebookEditorWidget(widget) {
            if (this._notebookEditorWidget === widget) {
                return;
            }
            this._notebookEditorWidget = widget;
            this._editorWidgetListener = this._notebookEditorWidget.textModel?.onDidChangeContent((e) => {
                if (!e.rawEvents.some(event => event.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellContent || event.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange)) {
                    return;
                }
                this._notebookUpdateScheduler.schedule();
            }) ?? null;
            this._addNotebookHighlights();
        }
        unbindNotebookEditorWidget(widget) {
            if (widget && this._notebookEditorWidget !== widget) {
                return;
            }
            if (this._notebookEditorWidget) {
                this._notebookUpdateScheduler.cancel();
                this._editorWidgetListener?.dispose();
            }
            this._removeNotebookHighlights();
            this._notebookEditorWidget = null;
        }
        updateNotebookHighlights() {
            if (this.parent().showHighlights) {
                this._addNotebookHighlights();
                this.setNotebookFindMatchDecorationsUsingCellMatches(Array.from(this._cellMatches.values()));
            }
            else {
                this._removeNotebookHighlights();
            }
        }
        _addNotebookHighlights() {
            if (!this._notebookEditorWidget) {
                return;
            }
            this._findMatchDecorationModel?.stopWebviewFind();
            this._findMatchDecorationModel?.dispose();
            this._findMatchDecorationModel = new findMatchDecorationModel_1.FindMatchDecorationModel(this._notebookEditorWidget, this.searchInstanceID);
            if (this._selectedMatch instanceof MatchInNotebook) {
                this.highlightCurrentFindMatchDecoration(this._selectedMatch);
            }
        }
        _removeNotebookHighlights() {
            if (this._findMatchDecorationModel) {
                this._findMatchDecorationModel?.stopWebviewFind();
                this._findMatchDecorationModel?.dispose();
                this._findMatchDecorationModel = undefined;
            }
        }
        updateNotebookMatches(matches, modelChange) {
            if (!this._notebookEditorWidget) {
                return;
            }
            const oldCellMatches = new Map(this._cellMatches);
            if (this._notebookEditorWidget.getId() !== this._lastEditorWidgetIdForUpdate) {
                this._cellMatches.clear();
                this._lastEditorWidgetIdForUpdate = this._notebookEditorWidget.getId();
            }
            matches.forEach(match => {
                let existingCell = this._cellMatches.get(match.cell.id);
                if (this._notebookEditorWidget && !existingCell) {
                    const index = this._notebookEditorWidget.getCellIndex(match.cell);
                    const existingRawCell = oldCellMatches.get(`${searchNotebookHelpers_2.rawCellPrefix}${index}`);
                    if (existingRawCell) {
                        existingRawCell.setCellModel(match.cell);
                        existingRawCell.clearAllMatches();
                        existingCell = existingRawCell;
                    }
                }
                existingCell?.clearAllMatches();
                const cell = existingCell ?? new CellMatch(this, match.cell, match.index);
                cell.addContentMatches((0, searchNotebookHelpers_1.contentMatchesToTextSearchMatches)(match.contentMatches, match.cell));
                cell.addWebviewMatches((0, searchNotebookHelpers_1.webviewMatchesToTextSearchMatches)(match.webviewMatches));
                this._cellMatches.set(cell.id, cell);
            });
            this._findMatchDecorationModel?.setAllFindMatchesDecorations(matches);
            if (this._selectedMatch instanceof MatchInNotebook) {
                this.highlightCurrentFindMatchDecoration(this._selectedMatch);
            }
            this._onChange.fire({ forceUpdateModel: modelChange });
        }
        setNotebookFindMatchDecorationsUsingCellMatches(cells) {
            if (!this._findMatchDecorationModel) {
                return;
            }
            const cellFindMatch = cells.map((cell) => {
                const webviewMatches = cell.webviewMatches.map(match => {
                    return {
                        index: match.webviewIndex,
                    };
                });
                const findMatches = cell.contentMatches.map(match => {
                    return new model_1.FindMatch(match.range(), [match.text()]);
                });
                return {
                    cell: cell.cell,
                    index: cell.cellIndex,
                    contentMatches: findMatches,
                    webviewMatches: webviewMatches
                };
            });
            try {
                this._findMatchDecorationModel.setAllFindMatchesDecorations(cellFindMatch);
            }
            catch (e) {
                // no op, might happen due to bugs related to cell output regex search
            }
        }
        async updateMatchesForEditorWidget() {
            if (!this._notebookEditorWidget) {
                return;
            }
            this._textMatches = new Map();
            const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
            const allMatches = await this._notebookEditorWidget
                .find(this._query.pattern, {
                regex: this._query.isRegExp,
                wholeWord: this._query.isWordMatch,
                caseSensitive: this._query.isCaseSensitive,
                wordSeparators: wordSeparators ?? undefined,
                includeMarkupInput: this._query.notebookInfo?.isInNotebookMarkdownInput,
                includeMarkupPreview: this._query.notebookInfo?.isInNotebookMarkdownPreview,
                includeCodeInput: this._query.notebookInfo?.isInNotebookCellInput,
                includeOutput: this._query.notebookInfo?.isInNotebookCellOutput,
            }, cancellation_1.CancellationToken.None, false, true, this.searchInstanceID);
            this.updateNotebookMatches(allMatches, true);
        }
        async showMatch(match) {
            const offset = await this.highlightCurrentFindMatchDecoration(match);
            this.setSelectedMatch(match);
            this.revealCellRange(match, offset);
        }
        async highlightCurrentFindMatchDecoration(match) {
            if (!this._findMatchDecorationModel || !match.cell) {
                // match cell should never be a CellSearchModel if the notebook is open
                return null;
            }
            if (match.webviewIndex === undefined) {
                return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInCell(match.cell, match.range());
            }
            else {
                return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInWebview(match.cell, match.webviewIndex);
            }
        }
        revealCellRange(match, outputOffset) {
            if (!this._notebookEditorWidget || !match.cell) {
                // match cell should never be a CellSearchModel if the notebook is open
                return;
            }
            if (match.webviewIndex !== undefined) {
                const index = this._notebookEditorWidget.getCellIndex(match.cell);
                if (index !== undefined) {
                    this._notebookEditorWidget.revealCellOffsetInCenter(match.cell, outputOffset ?? 0);
                }
            }
            else {
                match.cell.updateEditState(match.cell.getEditState(), 'focusNotebookCell');
                this._notebookEditorWidget.setCellEditorSelection(match.cell, match.range());
                this._notebookEditorWidget.revealRangeInCenterIfOutsideViewportAsync(match.cell, match.range());
            }
        }
    };
    exports.FileMatch = FileMatch;
    exports.FileMatch = FileMatch = FileMatch_1 = __decorate([
        __param(7, model_2.IModelService),
        __param(8, replace_1.IReplaceService),
        __param(9, label_1.ILabelService),
        __param(10, notebookEditorService_1.INotebookEditorService)
    ], FileMatch);
    let FolderMatch = FolderMatch_1 = class FolderMatch extends lifecycle_1.Disposable {
        constructor(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
            super();
            this._resource = _resource;
            this._id = _id;
            this._index = _index;
            this._query = _query;
            this._parent = _parent;
            this._searchResult = _searchResult;
            this._closestRoot = _closestRoot;
            this.replaceService = replaceService;
            this.instantiationService = instantiationService;
            this.uriIdentityService = uriIdentityService;
            this._onChange = this._register(new event_1.Emitter());
            this.onChange = this._onChange.event;
            this._onDispose = this._register(new event_1.Emitter());
            this.onDispose = this._onDispose.event;
            this._replacingAll = false;
            this._fileMatches = new map_1.ResourceMap();
            this._folderMatches = new map_1.ResourceMap();
            this._folderMatchesMap = ternarySearchTree_1.TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
            this._unDisposedFileMatches = new map_1.ResourceMap();
            this._unDisposedFolderMatches = new map_1.ResourceMap();
            this._name = new lazy_1.Lazy(() => this.resource ? labelService.getUriBasenameLabel(this.resource) : '');
        }
        get searchModel() {
            return this._searchResult.searchModel;
        }
        get showHighlights() {
            return this._parent.showHighlights;
        }
        get closestRoot() {
            return this._closestRoot;
        }
        set replacingAll(b) {
            this._replacingAll = b;
        }
        id() {
            return this._id;
        }
        get resource() {
            return this._resource;
        }
        index() {
            return this._index;
        }
        name() {
            return this._name.value;
        }
        parent() {
            return this._parent;
        }
        bindModel(model) {
            const fileMatch = this._fileMatches.get(model.uri);
            if (fileMatch) {
                fileMatch.bindModel(model);
            }
            else {
                const folderMatch = this.getFolderMatch(model.uri);
                const match = folderMatch?.getDownstreamFileMatch(model.uri);
                match?.bindModel(model);
            }
        }
        async bindNotebookEditorWidget(editor, resource) {
            const fileMatch = this._fileMatches.get(resource);
            if (fileMatch) {
                fileMatch.bindNotebookEditorWidget(editor);
                await fileMatch.updateMatchesForEditorWidget();
            }
            else {
                const folderMatches = this.folderMatchesIterator();
                for (const elem of folderMatches) {
                    await elem.bindNotebookEditorWidget(editor, resource);
                }
            }
        }
        unbindNotebookEditorWidget(editor, resource) {
            const fileMatch = this._fileMatches.get(resource);
            if (fileMatch) {
                fileMatch.unbindNotebookEditorWidget(editor);
            }
            else {
                const folderMatches = this.folderMatchesIterator();
                for (const elem of folderMatches) {
                    elem.unbindNotebookEditorWidget(editor, resource);
                }
            }
        }
        createIntermediateFolderMatch(resource, id, index, query, baseWorkspaceFolder) {
            const folderMatch = this._register(this.instantiationService.createInstance(FolderMatchWithResource, resource, id, index, query, this, this._searchResult, baseWorkspaceFolder));
            this.configureIntermediateMatch(folderMatch);
            this.doAddFolder(folderMatch);
            return folderMatch;
        }
        configureIntermediateMatch(folderMatch) {
            const disposable = folderMatch.onChange((event) => this.onFolderChange(folderMatch, event));
            this._register(folderMatch.onDispose(() => disposable.dispose()));
        }
        clear(clearingAll = false) {
            const changed = this.allDownstreamFileMatches();
            this.disposeMatches();
            this._onChange.fire({ elements: changed, removed: true, added: false, clearingAll });
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            const allMatches = getFileMatches(matches);
            this.doRemoveFile(allMatches);
        }
        async replace(match) {
            return this.replaceService.replace([match]).then(() => {
                this.doRemoveFile([match], true, true, true);
            });
        }
        replaceAll() {
            const matches = this.matches();
            return this.batchReplace(matches);
        }
        matches() {
            return [...this.fileMatchesIterator(), ...this.folderMatchesIterator()];
        }
        fileMatchesIterator() {
            return this._fileMatches.values();
        }
        folderMatchesIterator() {
            return this._folderMatches.values();
        }
        isEmpty() {
            return (this.fileCount() + this.folderCount()) === 0;
        }
        getDownstreamFileMatch(uri) {
            const directChildFileMatch = this._fileMatches.get(uri);
            if (directChildFileMatch) {
                return directChildFileMatch;
            }
            const folderMatch = this.getFolderMatch(uri);
            const match = folderMatch?.getDownstreamFileMatch(uri);
            if (match) {
                return match;
            }
            return null;
        }
        allDownstreamFileMatches() {
            let recursiveChildren = [];
            const iterator = this.folderMatchesIterator();
            for (const elem of iterator) {
                recursiveChildren = recursiveChildren.concat(elem.allDownstreamFileMatches());
            }
            return [...this.fileMatchesIterator(), ...recursiveChildren];
        }
        fileCount() {
            return this._fileMatches.size;
        }
        folderCount() {
            return this._folderMatches.size;
        }
        count() {
            return this.fileCount() + this.folderCount();
        }
        recursiveFileCount() {
            return this.allDownstreamFileMatches().length;
        }
        recursiveMatchCount() {
            return this.allDownstreamFileMatches().reduce((prev, match) => prev + match.count(), 0);
        }
        get query() {
            return this._query;
        }
        addFileMatch(raw, silent, searchInstanceID) {
            // when adding a fileMatch that has intermediate directories
            const added = [];
            const updated = [];
            raw.forEach(rawFileMatch => {
                const existingFileMatch = this.getDownstreamFileMatch(rawFileMatch.resource);
                if (existingFileMatch) {
                    if (rawFileMatch.results) {
                        rawFileMatch
                            .results
                            .filter(search_1.resultIsMatch)
                            .forEach(m => {
                            textSearchResultToMatches(m, existingFileMatch)
                                .forEach(m => existingFileMatch.add(m));
                        });
                    }
                    // add cell matches
                    if ((0, searchNotebookHelpers_1.isINotebookFileMatchWithModel)(rawFileMatch) || (0, searchNotebookHelpers_2.isINotebookFileMatchNoModel)(rawFileMatch)) {
                        rawFileMatch.cellResults?.forEach(rawCellMatch => {
                            const existingCellMatch = existingFileMatch.getCellMatch((0, searchNotebookHelpers_1.getIDFromINotebookCellMatch)(rawCellMatch));
                            if (existingCellMatch) {
                                existingCellMatch.addContentMatches(rawCellMatch.contentResults);
                                existingCellMatch.addWebviewMatches(rawCellMatch.webviewResults);
                            }
                            else {
                                existingFileMatch.addCellMatch(rawCellMatch);
                            }
                        });
                    }
                    updated.push(existingFileMatch);
                    if (rawFileMatch.results && rawFileMatch.results.length > 0) {
                        existingFileMatch.addContext(rawFileMatch.results);
                    }
                }
                else {
                    if (this instanceof FolderMatchWorkspaceRoot || this instanceof FolderMatchNoRoot) {
                        const fileMatch = this.createAndConfigureFileMatch(rawFileMatch, searchInstanceID);
                        added.push(fileMatch);
                    }
                }
            });
            const elements = [...added, ...updated];
            if (!silent && elements.length) {
                this._onChange.fire({ elements, added: !!added.length });
            }
        }
        doAddFile(fileMatch) {
            this._fileMatches.set(fileMatch.resource, fileMatch);
            if (this._unDisposedFileMatches.has(fileMatch.resource)) {
                this._unDisposedFileMatches.delete(fileMatch.resource);
            }
        }
        hasOnlyReadOnlyMatches() {
            return Array.from(this._fileMatches.values()).every(fm => fm.hasOnlyReadOnlyMatches());
        }
        uriHasParent(parent, child) {
            return this.uriIdentityService.extUri.isEqualOrParent(child, parent) && !this.uriIdentityService.extUri.isEqual(child, parent);
        }
        isInParentChain(folderMatch) {
            let matchItem = this;
            while (matchItem instanceof FolderMatch_1) {
                if (matchItem.id() === folderMatch.id()) {
                    return true;
                }
                matchItem = matchItem.parent();
            }
            return false;
        }
        getFolderMatch(resource) {
            const folderMatch = this._folderMatchesMap.findSubstr(resource);
            return folderMatch;
        }
        doAddFolder(folderMatch) {
            if (this instanceof FolderMatchWithResource && !this.uriHasParent(this.resource, folderMatch.resource)) {
                throw Error(`${folderMatch.resource} does not belong as a child of ${this.resource}`);
            }
            else if (this.isInParentChain(folderMatch)) {
                throw Error(`${folderMatch.resource} is a parent of ${this.resource}`);
            }
            this._folderMatches.set(folderMatch.resource, folderMatch);
            this._folderMatchesMap.set(folderMatch.resource, folderMatch);
            if (this._unDisposedFolderMatches.has(folderMatch.resource)) {
                this._unDisposedFolderMatches.delete(folderMatch.resource);
            }
        }
        async batchReplace(matches) {
            const allMatches = getFileMatches(matches);
            await this.replaceService.replace(allMatches);
            this.doRemoveFile(allMatches, true, true, true);
        }
        onFileChange(fileMatch, removed = false) {
            let added = false;
            if (!this._fileMatches.has(fileMatch.resource)) {
                this.doAddFile(fileMatch);
                added = true;
            }
            if (fileMatch.count() === 0) {
                this.doRemoveFile([fileMatch], false, false);
                added = false;
                removed = true;
            }
            if (!this._replacingAll) {
                this._onChange.fire({ elements: [fileMatch], added: added, removed: removed });
            }
        }
        onFolderChange(folderMatch, event) {
            if (!this._folderMatches.has(folderMatch.resource)) {
                this.doAddFolder(folderMatch);
            }
            if (folderMatch.isEmpty()) {
                this._folderMatches.delete(folderMatch.resource);
                folderMatch.dispose();
            }
            this._onChange.fire(event);
        }
        doRemoveFile(fileMatches, dispose = true, trigger = true, keepReadonly = false) {
            const removed = [];
            for (const match of fileMatches) {
                if (this._fileMatches.get(match.resource)) {
                    if (keepReadonly && match.hasReadonlyMatches()) {
                        continue;
                    }
                    this._fileMatches.delete(match.resource);
                    if (dispose) {
                        match.dispose();
                    }
                    else {
                        this._unDisposedFileMatches.set(match.resource, match);
                    }
                    removed.push(match);
                }
                else {
                    const folder = this.getFolderMatch(match.resource);
                    if (folder) {
                        folder.doRemoveFile([match], dispose, trigger);
                    }
                    else {
                        throw Error(`FileMatch ${match.resource} is not located within FolderMatch ${this.resource}`);
                    }
                }
            }
            if (trigger) {
                this._onChange.fire({ elements: removed, removed: true });
            }
        }
        disposeMatches() {
            [...this._fileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
            [...this._folderMatches.values()].forEach((folderMatch) => folderMatch.disposeMatches());
            [...this._unDisposedFileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
            [...this._unDisposedFolderMatches.values()].forEach((folderMatch) => folderMatch.disposeMatches());
            this._fileMatches.clear();
            this._folderMatches.clear();
            this._unDisposedFileMatches.clear();
            this._unDisposedFolderMatches.clear();
        }
        dispose() {
            this.disposeMatches();
            this._onDispose.fire();
            super.dispose();
        }
    };
    exports.FolderMatch = FolderMatch;
    exports.FolderMatch = FolderMatch = FolderMatch_1 = __decorate([
        __param(7, replace_1.IReplaceService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, label_1.ILabelService),
        __param(10, uriIdentity_1.IUriIdentityService)
    ], FolderMatch);
    let FolderMatchWithResource = class FolderMatchWithResource extends FolderMatch {
        constructor(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
            super(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService);
            this._normalizedResource = new lazy_1.Lazy(() => this.uriIdentityService.extUri.removeTrailingPathSeparator(this.uriIdentityService.extUri.normalizePath(this.resource)));
        }
        get resource() {
            return this._resource;
        }
        get normalizedResource() {
            return this._normalizedResource.value;
        }
    };
    exports.FolderMatchWithResource = FolderMatchWithResource;
    exports.FolderMatchWithResource = FolderMatchWithResource = __decorate([
        __param(7, replace_1.IReplaceService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, label_1.ILabelService),
        __param(10, uriIdentity_1.IUriIdentityService)
    ], FolderMatchWithResource);
    /**
     * FolderMatchWorkspaceRoot => folder for workspace root
     */
    let FolderMatchWorkspaceRoot = class FolderMatchWorkspaceRoot extends FolderMatchWithResource {
        constructor(_resource, _id, _index, _query, _parent, replaceService, instantiationService, labelService, uriIdentityService) {
            super(_resource, _id, _index, _query, _parent, _parent, null, replaceService, instantiationService, labelService, uriIdentityService);
        }
        normalizedUriParent(uri) {
            return this.uriIdentityService.extUri.normalizePath(this.uriIdentityService.extUri.dirname(uri));
        }
        uriEquals(uri1, ur2) {
            return this.uriIdentityService.extUri.isEqual(uri1, ur2);
        }
        createFileMatch(query, previewOptions, maxResults, parent, rawFileMatch, closestRoot, searchInstanceID) {
            const fileMatch = this.instantiationService.createInstance(FileMatch, query, previewOptions, maxResults, parent, rawFileMatch, closestRoot, searchInstanceID);
            parent.doAddFile(fileMatch);
            const disposable = fileMatch.onChange(({ didRemove }) => parent.onFileChange(fileMatch, didRemove));
            this._register(fileMatch.onDispose(() => disposable.dispose()));
            return fileMatch;
        }
        createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
            if (!this.uriHasParent(this.resource, rawFileMatch.resource)) {
                throw Error(`${rawFileMatch.resource} is not a descendant of ${this.resource}`);
            }
            const fileMatchParentParts = [];
            let uri = this.normalizedUriParent(rawFileMatch.resource);
            while (!this.uriEquals(this.normalizedResource, uri)) {
                fileMatchParentParts.unshift(uri);
                const prevUri = uri;
                uri = this.uriIdentityService.extUri.removeTrailingPathSeparator(this.normalizedUriParent(uri));
                if (this.uriEquals(prevUri, uri)) {
                    throw Error(`${rawFileMatch.resource} is not correctly configured as a child of ${this.normalizedResource}`);
                }
            }
            const root = this.closestRoot ?? this;
            let parent = this;
            for (let i = 0; i < fileMatchParentParts.length; i++) {
                let folderMatch = parent.getFolderMatch(fileMatchParentParts[i]);
                if (!folderMatch) {
                    folderMatch = parent.createIntermediateFolderMatch(fileMatchParentParts[i], fileMatchParentParts[i].toString(), -1, this._query, root);
                }
                parent = folderMatch;
            }
            return this.createFileMatch(this._query.contentPattern, this._query.previewOptions, this._query.maxResults, parent, rawFileMatch, root, searchInstanceID);
        }
    };
    exports.FolderMatchWorkspaceRoot = FolderMatchWorkspaceRoot;
    exports.FolderMatchWorkspaceRoot = FolderMatchWorkspaceRoot = __decorate([
        __param(5, replace_1.IReplaceService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, label_1.ILabelService),
        __param(8, uriIdentity_1.IUriIdentityService)
    ], FolderMatchWorkspaceRoot);
    /**
     * BaseFolderMatch => optional resource ("other files" node)
     * FolderMatch => required resource (normal folder node)
     */
    let FolderMatchNoRoot = class FolderMatchNoRoot extends FolderMatch {
        constructor(_id, _index, _query, _parent, replaceService, instantiationService, labelService, uriIdentityService) {
            super(null, _id, _index, _query, _parent, _parent, null, replaceService, instantiationService, labelService, uriIdentityService);
        }
        createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
            const fileMatch = this._register(this.instantiationService.createInstance(FileMatch, this._query.contentPattern, this._query.previewOptions, this._query.maxResults, this, rawFileMatch, null, searchInstanceID));
            this.doAddFile(fileMatch);
            const disposable = fileMatch.onChange(({ didRemove }) => this.onFileChange(fileMatch, didRemove));
            this._register(fileMatch.onDispose(() => disposable.dispose()));
            return fileMatch;
        }
    };
    exports.FolderMatchNoRoot = FolderMatchNoRoot;
    exports.FolderMatchNoRoot = FolderMatchNoRoot = __decorate([
        __param(4, replace_1.IReplaceService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, label_1.ILabelService),
        __param(7, uriIdentity_1.IUriIdentityService)
    ], FolderMatchNoRoot);
    let elemAIndex = -1;
    let elemBIndex = -1;
    /**
     * Compares instances of the same match type. Different match types should not be siblings
     * and their sort order is undefined.
     */
    function searchMatchComparer(elementA, elementB, sortOrder = "default" /* SearchSortOrder.Default */) {
        if (elementA instanceof FileMatch && elementB instanceof FolderMatch) {
            return 1;
        }
        if (elementB instanceof FileMatch && elementA instanceof FolderMatch) {
            return -1;
        }
        if (elementA instanceof FolderMatch && elementB instanceof FolderMatch) {
            elemAIndex = elementA.index();
            elemBIndex = elementB.index();
            if (elemAIndex !== -1 && elemBIndex !== -1) {
                return elemAIndex - elemBIndex;
            }
            switch (sortOrder) {
                case "countDescending" /* SearchSortOrder.CountDescending */:
                    return elementB.count() - elementA.count();
                case "countAscending" /* SearchSortOrder.CountAscending */:
                    return elementA.count() - elementB.count();
                case "type" /* SearchSortOrder.Type */:
                    return (0, comparers_1.compareFileExtensions)(elementA.name(), elementB.name());
                case "fileNames" /* SearchSortOrder.FileNames */:
                    return (0, comparers_1.compareFileNames)(elementA.name(), elementB.name());
                // Fall through otherwise
                default:
                    if (!elementA.resource || !elementB.resource) {
                        return 0;
                    }
                    return (0, comparers_1.comparePaths)(elementA.resource.fsPath, elementB.resource.fsPath) || (0, comparers_1.compareFileNames)(elementA.name(), elementB.name());
            }
        }
        if (elementA instanceof FileMatch && elementB instanceof FileMatch) {
            switch (sortOrder) {
                case "countDescending" /* SearchSortOrder.CountDescending */:
                    return elementB.count() - elementA.count();
                case "countAscending" /* SearchSortOrder.CountAscending */:
                    return elementA.count() - elementB.count();
                case "type" /* SearchSortOrder.Type */:
                    return (0, comparers_1.compareFileExtensions)(elementA.name(), elementB.name());
                case "fileNames" /* SearchSortOrder.FileNames */:
                    return (0, comparers_1.compareFileNames)(elementA.name(), elementB.name());
                case "modified" /* SearchSortOrder.Modified */: {
                    const fileStatA = elementA.fileStat;
                    const fileStatB = elementB.fileStat;
                    if (fileStatA && fileStatB) {
                        return fileStatB.mtime - fileStatA.mtime;
                    }
                }
                // Fall through otherwise
                default:
                    return (0, comparers_1.comparePaths)(elementA.resource.fsPath, elementB.resource.fsPath) || (0, comparers_1.compareFileNames)(elementA.name(), elementB.name());
            }
        }
        if (elementA instanceof MatchInNotebook && elementB instanceof MatchInNotebook) {
            return compareNotebookPos(elementA, elementB);
        }
        if (elementA instanceof Match && elementB instanceof Match) {
            return range_1.Range.compareRangesUsingStarts(elementA.range(), elementB.range());
        }
        return 0;
    }
    exports.searchMatchComparer = searchMatchComparer;
    function compareNotebookPos(match1, match2) {
        if (match1.cellIndex === match2.cellIndex) {
            if (match1.webviewIndex !== undefined && match2.webviewIndex !== undefined) {
                return match1.webviewIndex - match2.webviewIndex;
            }
            else if (match1.webviewIndex === undefined && match2.webviewIndex === undefined) {
                return range_1.Range.compareRangesUsingStarts(match1.range(), match2.range());
            }
            else {
                // webview matches should always be after content matches
                if (match1.webviewIndex !== undefined) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
        }
        else if (match1.cellIndex < match2.cellIndex) {
            return -1;
        }
        else {
            return 1;
        }
    }
    exports.compareNotebookPos = compareNotebookPos;
    function searchComparer(elementA, elementB, sortOrder = "default" /* SearchSortOrder.Default */) {
        const elemAParents = createParentList(elementA);
        const elemBParents = createParentList(elementB);
        let i = elemAParents.length - 1;
        let j = elemBParents.length - 1;
        while (i >= 0 && j >= 0) {
            if (elemAParents[i].id() !== elemBParents[j].id()) {
                return searchMatchComparer(elemAParents[i], elemBParents[j], sortOrder);
            }
            i--;
            j--;
        }
        const elemAAtEnd = i === 0;
        const elemBAtEnd = j === 0;
        if (elemAAtEnd && !elemBAtEnd) {
            return 1;
        }
        else if (!elemAAtEnd && elemBAtEnd) {
            return -1;
        }
        return 0;
    }
    exports.searchComparer = searchComparer;
    function createParentList(element) {
        const parentArray = [];
        let currElement = element;
        while (!(currElement instanceof SearchResult)) {
            parentArray.push(currElement);
            currElement = currElement.parent();
        }
        return parentArray;
    }
    let SearchResult = class SearchResult extends lifecycle_1.Disposable {
        constructor(searchModel, replaceService, instantiationService, modelService, uriIdentityService, notebookEditorService) {
            super();
            this.searchModel = searchModel;
            this.replaceService = replaceService;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.uriIdentityService = uriIdentityService;
            this.notebookEditorService = notebookEditorService;
            this._onChange = this._register(new event_1.PauseableEmitter({
                merge: mergeSearchResultEvents
            }));
            this.onChange = this._onChange.event;
            this._folderMatches = [];
            this._otherFilesMatch = null;
            this._folderMatchesMap = ternarySearchTree_1.TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
            this._showHighlights = false;
            this._query = null;
            this.disposePastResults = () => Promise.resolve();
            this._isDirty = false;
            this._rangeHighlightDecorations = this.instantiationService.createInstance(RangeHighlightDecorations);
            this.modelService.getModels().forEach(model => this.onModelAdded(model));
            this._register(this.modelService.onModelAdded(model => this.onModelAdded(model)));
            this._register(this.notebookEditorService.onDidAddNotebookEditor(widget => {
                if (widget instanceof notebookEditorWidget_1.NotebookEditorWidget) {
                    this.onDidAddNotebookEditorWidget(widget);
                }
            }));
            this._register(this.onChange(e => {
                if (e.removed) {
                    this._isDirty = !this.isEmpty();
                }
            }));
        }
        async batchReplace(elementsToReplace) {
            try {
                this._onChange.pause();
                await Promise.all(elementsToReplace.map(async (elem) => {
                    const parent = elem.parent();
                    if ((parent instanceof FolderMatch || parent instanceof FileMatch) && arrayContainsElementOrParent(parent, elementsToReplace)) {
                        // skip any children who have parents in the array
                        return;
                    }
                    if (elem instanceof FileMatch) {
                        await elem.parent().replace(elem);
                    }
                    else if (elem instanceof Match) {
                        await elem.parent().replace(elem);
                    }
                    else if (elem instanceof FolderMatch) {
                        await elem.replaceAll();
                    }
                }));
            }
            finally {
                this._onChange.resume();
            }
        }
        batchRemove(elementsToRemove) {
            // need to check that we aren't trying to remove elements twice
            const removedElems = [];
            try {
                this._onChange.pause();
                elementsToRemove.forEach((currentElement) => {
                    if (!arrayContainsElementOrParent(currentElement, removedElems)) {
                        currentElement.parent().remove(currentElement);
                        removedElems.push(currentElement);
                    }
                });
            }
            finally {
                this._onChange.resume();
            }
        }
        get isDirty() {
            return this._isDirty;
        }
        get query() {
            return this._query;
        }
        set query(query) {
            // When updating the query we could change the roots, so keep a reference to them to clean up when we trigger `disposePastResults`
            const oldFolderMatches = this.folderMatches();
            this.disposePastResults = async () => {
                oldFolderMatches.forEach(match => match.clear());
                oldFolderMatches.forEach(match => match.dispose());
                this._isDirty = false;
            };
            this._rangeHighlightDecorations.removeHighlightRange();
            this._folderMatchesMap = ternarySearchTree_1.TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
            if (!query) {
                return;
            }
            this._folderMatches = (query && query.folderQueries || [])
                .map(fq => fq.folder)
                .map((resource, index) => this._createBaseFolderMatch(resource, resource.toString(), index, query));
            this._folderMatches.forEach(fm => this._folderMatchesMap.set(fm.resource, fm));
            this._otherFilesMatch = this._createBaseFolderMatch(null, 'otherFiles', this._folderMatches.length + 1, query);
            this._query = query;
        }
        onDidAddNotebookEditorWidget(widget) {
            this._onWillChangeModelListener?.dispose();
            this._onWillChangeModelListener = widget.onWillChangeModel((model) => {
                if (model) {
                    this.onNotebookEditorWidgetRemoved(widget, model?.uri);
                }
            });
            this._onDidChangeModelListener?.dispose();
            // listen to view model change as we are searching on both inputs and outputs
            this._onDidChangeModelListener = widget.onDidAttachViewModel(() => {
                if (widget.hasModel()) {
                    this.onNotebookEditorWidgetAdded(widget, widget.textModel.uri);
                }
            });
        }
        onModelAdded(model) {
            const folderMatch = this._folderMatchesMap.findSubstr(model.uri);
            folderMatch?.bindModel(model);
        }
        async onNotebookEditorWidgetAdded(editor, resource) {
            const folderMatch = this._folderMatchesMap.findSubstr(resource);
            await folderMatch?.bindNotebookEditorWidget(editor, resource);
        }
        onNotebookEditorWidgetRemoved(editor, resource) {
            const folderMatch = this._folderMatchesMap.findSubstr(resource);
            folderMatch?.unbindNotebookEditorWidget(editor, resource);
        }
        _createBaseFolderMatch(resource, id, index, query) {
            let folderMatch;
            if (resource) {
                folderMatch = this._register(this.instantiationService.createInstance(FolderMatchWorkspaceRoot, resource, id, index, query, this));
            }
            else {
                folderMatch = this._register(this.instantiationService.createInstance(FolderMatchNoRoot, id, index, query, this));
            }
            const disposable = folderMatch.onChange((event) => this._onChange.fire(event));
            this._register(folderMatch.onDispose(() => disposable.dispose()));
            return folderMatch;
        }
        add(allRaw, searchInstanceID, silent = false) {
            // Split up raw into a list per folder so we can do a batch add per folder.
            const { byFolder, other } = this.groupFilesByFolder(allRaw);
            byFolder.forEach(raw => {
                if (!raw.length) {
                    return;
                }
                const folderMatch = this.getFolderMatch(raw[0].resource);
                folderMatch?.addFileMatch(raw, silent, searchInstanceID);
            });
            this._otherFilesMatch?.addFileMatch(other, silent, searchInstanceID);
            this.disposePastResults();
        }
        clear() {
            this.folderMatches().forEach((folderMatch) => folderMatch.clear(true));
            this.disposeMatches();
            this._folderMatches = [];
            this._otherFilesMatch = null;
        }
        remove(matches) {
            if (!Array.isArray(matches)) {
                matches = [matches];
            }
            matches.forEach(m => {
                if (m instanceof FolderMatch) {
                    m.clear();
                }
            });
            const fileMatches = matches.filter(m => m instanceof FileMatch);
            const { byFolder, other } = this.groupFilesByFolder(fileMatches);
            byFolder.forEach(matches => {
                if (!matches.length) {
                    return;
                }
                this.getFolderMatch(matches[0].resource).remove(matches);
            });
            if (other.length) {
                this.getFolderMatch(other[0].resource).remove(other);
            }
        }
        replace(match) {
            return this.getFolderMatch(match.resource).replace(match);
        }
        replaceAll(progress) {
            this.replacingAll = true;
            const promise = this.replaceService.replace(this.matches(), progress);
            return promise.then(() => {
                this.replacingAll = false;
                this.clear();
            }, () => {
                this.replacingAll = false;
            });
        }
        folderMatches() {
            return this._otherFilesMatch ?
                [
                    ...this._folderMatches,
                    this._otherFilesMatch
                ] :
                [
                    ...this._folderMatches
                ];
        }
        matches() {
            const matches = [];
            this.folderMatches().forEach(folderMatch => {
                matches.push(folderMatch.allDownstreamFileMatches());
            });
            return [].concat(...matches);
        }
        isEmpty() {
            return this.folderMatches().every((folderMatch) => folderMatch.isEmpty());
        }
        fileCount() {
            return this.folderMatches().reduce((prev, match) => prev + match.recursiveFileCount(), 0);
        }
        count() {
            return this.matches().reduce((prev, match) => prev + match.count(), 0);
        }
        get showHighlights() {
            return this._showHighlights;
        }
        toggleHighlights(value) {
            if (this._showHighlights === value) {
                return;
            }
            this._showHighlights = value;
            let selectedMatch = null;
            this.matches().forEach((fileMatch) => {
                fileMatch.updateHighlights();
                fileMatch.updateNotebookHighlights();
                if (!selectedMatch) {
                    selectedMatch = fileMatch.getSelectedMatch();
                }
            });
            if (this._showHighlights && selectedMatch) {
                // TS?
                this._rangeHighlightDecorations.highlightRange(selectedMatch.parent().resource, selectedMatch.range());
            }
            else {
                this._rangeHighlightDecorations.removeHighlightRange();
            }
        }
        get rangeHighlightDecorations() {
            return this._rangeHighlightDecorations;
        }
        getFolderMatch(resource) {
            const folderMatch = this._folderMatchesMap.findSubstr(resource);
            return folderMatch ? folderMatch : this._otherFilesMatch;
        }
        set replacingAll(running) {
            this.folderMatches().forEach((folderMatch) => {
                folderMatch.replacingAll = running;
            });
        }
        groupFilesByFolder(fileMatches) {
            const rawPerFolder = new map_1.ResourceMap();
            const otherFileMatches = [];
            this._folderMatches.forEach(fm => rawPerFolder.set(fm.resource, []));
            fileMatches.forEach(rawFileMatch => {
                const folderMatch = this.getFolderMatch(rawFileMatch.resource);
                if (!folderMatch) {
                    // foldermatch was previously removed by user or disposed for some reason
                    return;
                }
                const resource = folderMatch.resource;
                if (resource) {
                    rawPerFolder.get(resource).push(rawFileMatch);
                }
                else {
                    otherFileMatches.push(rawFileMatch);
                }
            });
            return {
                byFolder: rawPerFolder,
                other: otherFileMatches
            };
        }
        disposeMatches() {
            this.folderMatches().forEach(folderMatch => folderMatch.dispose());
            this._folderMatches = [];
            this._folderMatchesMap = ternarySearchTree_1.TernarySearchTree.forUris(key => this.uriIdentityService.extUri.ignorePathCasing(key));
            this._rangeHighlightDecorations.removeHighlightRange();
        }
        async dispose() {
            this._onWillChangeModelListener?.dispose();
            this._onDidChangeModelListener?.dispose();
            this._rangeHighlightDecorations.dispose();
            this.disposeMatches();
            super.dispose();
            await this.disposePastResults();
        }
    };
    exports.SearchResult = SearchResult;
    exports.SearchResult = SearchResult = __decorate([
        __param(1, replace_1.IReplaceService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, model_2.IModelService),
        __param(4, uriIdentity_1.IUriIdentityService),
        __param(5, notebookEditorService_1.INotebookEditorService)
    ], SearchResult);
    var SearchModelLocation;
    (function (SearchModelLocation) {
        SearchModelLocation[SearchModelLocation["PANEL"] = 0] = "PANEL";
        SearchModelLocation[SearchModelLocation["QUICK_ACCESS"] = 1] = "QUICK_ACCESS";
    })(SearchModelLocation || (exports.SearchModelLocation = SearchModelLocation = {}));
    let SearchModel = class SearchModel extends lifecycle_1.Disposable {
        constructor(searchService, telemetryService, configurationService, instantiationService, logService, notebookSearchService) {
            super();
            this.searchService = searchService;
            this.telemetryService = telemetryService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.notebookSearchService = notebookSearchService;
            this._searchQuery = null;
            this._replaceActive = false;
            this._replaceString = null;
            this._replacePattern = null;
            this._preserveCase = false;
            this._startStreamDelay = Promise.resolve();
            this._resultQueue = [];
            this._onReplaceTermChanged = this._register(new event_1.Emitter());
            this.onReplaceTermChanged = this._onReplaceTermChanged.event;
            this._onSearchResultChanged = this._register(new event_1.PauseableEmitter({
                merge: mergeSearchResultEvents
            }));
            this.onSearchResultChanged = this._onSearchResultChanged.event;
            this.currentCancelTokenSource = null;
            this.searchCancelledForNewSearch = false;
            this.location = SearchModelLocation.PANEL;
            this._searchResult = this.instantiationService.createInstance(SearchResult, this);
            this._register(this._searchResult.onChange((e) => this._onSearchResultChanged.fire(e)));
        }
        isReplaceActive() {
            return this._replaceActive;
        }
        set replaceActive(replaceActive) {
            this._replaceActive = replaceActive;
        }
        get replacePattern() {
            return this._replacePattern;
        }
        get replaceString() {
            return this._replaceString || '';
        }
        set preserveCase(value) {
            this._preserveCase = value;
        }
        get preserveCase() {
            return this._preserveCase;
        }
        set replaceString(replaceString) {
            this._replaceString = replaceString;
            if (this._searchQuery) {
                this._replacePattern = new replace_2.ReplacePattern(replaceString, this._searchQuery.contentPattern);
            }
            this._onReplaceTermChanged.fire();
        }
        get searchResult() {
            return this._searchResult;
        }
        doSearch(query, progressEmitter, searchQuery, searchInstanceID, onProgress, callerToken) {
            const asyncGenerateOnProgress = async (p) => {
                progressEmitter.fire();
                this.onSearchProgress(p, searchInstanceID, false);
                onProgress?.(p);
            };
            const syncGenerateOnProgress = (p) => {
                progressEmitter.fire();
                this.onSearchProgress(p, searchInstanceID, true);
                onProgress?.(p);
            };
            const tokenSource = this.currentCancelTokenSource = new cancellation_1.CancellationTokenSource(callerToken);
            const notebookResult = this.notebookSearchService.notebookSearch(query, tokenSource.token, searchInstanceID, asyncGenerateOnProgress);
            const textResult = this.searchService.textSearchSplitSyncAsync(searchQuery, this.currentCancelTokenSource.token, asyncGenerateOnProgress, notebookResult.openFilesToScan, notebookResult.allScannedFiles);
            const syncResults = textResult.syncResults.results;
            syncResults.forEach(p => { if (p) {
                syncGenerateOnProgress(p);
            } });
            const getAsyncResults = async () => {
                const searchStart = Date.now();
                // resolve async parts of search
                const allClosedEditorResults = await textResult.asyncResults;
                const resolvedNotebookResults = await notebookResult.completeData;
                tokenSource.dispose();
                const searchLength = Date.now() - searchStart;
                const resolvedResult = {
                    results: [...allClosedEditorResults.results, ...resolvedNotebookResults.results],
                    messages: [...allClosedEditorResults.messages, ...resolvedNotebookResults.messages],
                    limitHit: allClosedEditorResults.limitHit || resolvedNotebookResults.limitHit,
                    exit: allClosedEditorResults.exit,
                    stats: allClosedEditorResults.stats,
                };
                this.logService.trace(`whole search time | ${searchLength}ms`);
                return resolvedResult;
            };
            return {
                asyncResults: getAsyncResults(),
                syncResults
            };
        }
        search(query, onProgress, callerToken) {
            this.cancelSearch(true);
            this._searchQuery = query;
            if (!this.searchConfig.searchOnType) {
                this.searchResult.clear();
            }
            const searchInstanceID = Date.now().toString();
            this._searchResult.query = this._searchQuery;
            const progressEmitter = this._register(new event_1.Emitter());
            this._replacePattern = new replace_2.ReplacePattern(this.replaceString, this._searchQuery.contentPattern);
            // In search on type case, delay the streaming of results just a bit, so that we don't flash the only "local results" fast path
            this._startStreamDelay = new Promise(resolve => setTimeout(resolve, this.searchConfig.searchOnType ? 150 : 0));
            const req = this.doSearch(query, progressEmitter, this._searchQuery, searchInstanceID, onProgress, callerToken);
            const asyncResults = req.asyncResults;
            const syncResults = req.syncResults;
            if (onProgress) {
                syncResults.forEach(p => {
                    if (p) {
                        onProgress(p);
                    }
                });
            }
            const start = Date.now();
            let event;
            const progressEmitterPromise = new Promise(resolve => {
                event = event_1.Event.once(progressEmitter.event)(resolve);
                return event;
            });
            Promise.race([asyncResults, progressEmitterPromise]).finally(() => {
                /* __GDPR__
                    "searchResultsFirstRender" : {
                        "owner": "roblourens",
                        "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true }
                    }
                */
                event?.dispose();
                this.telemetryService.publicLog('searchResultsFirstRender', { duration: Date.now() - start });
            });
            try {
                return {
                    asyncResults: asyncResults.then(value => {
                        this.onSearchCompleted(value, Date.now() - start, searchInstanceID);
                        return value;
                    }, e => {
                        this.onSearchError(e, Date.now() - start);
                        throw e;
                    }),
                    syncResults
                };
            }
            finally {
                /* __GDPR__
                    "searchResultsFinished" : {
                        "owner": "roblourens",
                        "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true }
                    }
                */
                this.telemetryService.publicLog('searchResultsFinished', { duration: Date.now() - start });
            }
        }
        onSearchCompleted(completed, duration, searchInstanceID) {
            if (!this._searchQuery) {
                throw new Error('onSearchCompleted must be called after a search is started');
            }
            this._searchResult.add(this._resultQueue, searchInstanceID);
            this._resultQueue.length = 0;
            const options = Object.assign({}, this._searchQuery.contentPattern);
            delete options.pattern;
            const stats = completed && completed.stats;
            const fileSchemeOnly = this._searchQuery.folderQueries.every(fq => fq.folder.scheme === network_1.Schemas.file);
            const otherSchemeOnly = this._searchQuery.folderQueries.every(fq => fq.folder.scheme !== network_1.Schemas.file);
            const scheme = fileSchemeOnly ? network_1.Schemas.file :
                otherSchemeOnly ? 'other' :
                    'mixed';
            /* __GDPR__
                "searchResultsShown" : {
                    "owner": "roblourens",
                    "count" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "fileCount": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "options": { "${inline}": [ "${IPatternInfo}" ] },
                    "duration": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "type" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "scheme" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "searchOnTypeEnabled" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('searchResultsShown', {
                count: this._searchResult.count(),
                fileCount: this._searchResult.fileCount(),
                options,
                duration,
                type: stats && stats.type,
                scheme,
                searchOnTypeEnabled: this.searchConfig.searchOnType
            });
            return completed;
        }
        onSearchError(e, duration) {
            if (errors.isCancellationError(e)) {
                this.onSearchCompleted(this.searchCancelledForNewSearch
                    ? { exit: 1 /* SearchCompletionExitCode.NewSearchStarted */, results: [], messages: [] }
                    : undefined, duration, '');
                this.searchCancelledForNewSearch = false;
            }
        }
        onSearchProgress(p, searchInstanceID, sync = true) {
            if (p.resource) {
                this._resultQueue.push(p);
                if (sync) {
                    if (this._resultQueue.length) {
                        this._searchResult.add(this._resultQueue, searchInstanceID, true);
                        this._resultQueue.length = 0;
                    }
                }
                else {
                    this._startStreamDelay.then(() => {
                        if (this._resultQueue.length) {
                            this._searchResult.add(this._resultQueue, searchInstanceID, true);
                            this._resultQueue.length = 0;
                        }
                    });
                }
            }
        }
        get searchConfig() {
            return this.configurationService.getValue('search');
        }
        cancelSearch(cancelledForNewSearch = false) {
            if (this.currentCancelTokenSource) {
                this.searchCancelledForNewSearch = cancelledForNewSearch;
                this.currentCancelTokenSource.cancel();
                return true;
            }
            return false;
        }
        dispose() {
            this.cancelSearch();
            this.searchResult.dispose();
            super.dispose();
        }
    };
    exports.SearchModel = SearchModel;
    exports.SearchModel = SearchModel = __decorate([
        __param(0, search_1.ISearchService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, log_1.ILogService),
        __param(5, notebookSearch_1.INotebookSearchService)
    ], SearchModel);
    let SearchViewModelWorkbenchService = class SearchViewModelWorkbenchService {
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
            this._searchModel = null;
        }
        get searchModel() {
            if (!this._searchModel) {
                this._searchModel = this.instantiationService.createInstance(SearchModel);
            }
            return this._searchModel;
        }
        set searchModel(searchModel) {
            this._searchModel?.dispose();
            this._searchModel = searchModel;
        }
    };
    exports.SearchViewModelWorkbenchService = SearchViewModelWorkbenchService;
    exports.SearchViewModelWorkbenchService = SearchViewModelWorkbenchService = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], SearchViewModelWorkbenchService);
    exports.ISearchViewModelWorkbenchService = (0, instantiation_1.createDecorator)('searchViewModelWorkbenchService');
    /**
     * Can add a range highlight decoration to a model.
     * It will automatically remove it when the model has its decorations changed.
     */
    let RangeHighlightDecorations = class RangeHighlightDecorations {
        static { RangeHighlightDecorations_1 = this; }
        constructor(_modelService) {
            this._modelService = _modelService;
            this._decorationId = null;
            this._model = null;
            this._modelDisposables = new lifecycle_1.DisposableStore();
        }
        removeHighlightRange() {
            if (this._model && this._decorationId) {
                const decorationId = this._decorationId;
                this._model.changeDecorations((accessor) => {
                    accessor.removeDecoration(decorationId);
                });
            }
            this._decorationId = null;
        }
        highlightRange(resource, range, ownerId = 0) {
            let model;
            if (uri_1.URI.isUri(resource)) {
                model = this._modelService.getModel(resource);
            }
            else {
                model = resource;
            }
            if (model) {
                this.doHighlightRange(model, range);
            }
        }
        doHighlightRange(model, range) {
            this.removeHighlightRange();
            model.changeDecorations((accessor) => {
                this._decorationId = accessor.addDecoration(range, RangeHighlightDecorations_1._RANGE_HIGHLIGHT_DECORATION);
            });
            this.setModel(model);
        }
        setModel(model) {
            if (this._model !== model) {
                this.clearModelListeners();
                this._model = model;
                this._modelDisposables.add(this._model.onDidChangeDecorations((e) => {
                    this.clearModelListeners();
                    this.removeHighlightRange();
                    this._model = null;
                }));
                this._modelDisposables.add(this._model.onWillDispose(() => {
                    this.clearModelListeners();
                    this.removeHighlightRange();
                    this._model = null;
                }));
            }
        }
        clearModelListeners() {
            this._modelDisposables.clear();
        }
        dispose() {
            if (this._model) {
                this.removeHighlightRange();
                this._model = null;
            }
            this._modelDisposables.dispose();
        }
        static { this._RANGE_HIGHLIGHT_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'search-range-highlight',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'rangeHighlight',
            isWholeLine: true
        }); }
    };
    exports.RangeHighlightDecorations = RangeHighlightDecorations;
    exports.RangeHighlightDecorations = RangeHighlightDecorations = RangeHighlightDecorations_1 = __decorate([
        __param(0, model_2.IModelService)
    ], RangeHighlightDecorations);
    function textSearchResultToMatches(rawMatch, fileMatch) {
        const previewLines = rawMatch.preview.text.split('\n');
        if (Array.isArray(rawMatch.ranges)) {
            return rawMatch.ranges.map((r, i) => {
                const previewRange = rawMatch.preview.matches[i];
                return new Match(fileMatch, previewLines, previewRange, r);
            });
        }
        else {
            const previewRange = rawMatch.preview.matches;
            const match = new Match(fileMatch, previewLines, previewRange, rawMatch.ranges);
            return [match];
        }
    }
    // text search to notebook matches
    function textSearchMatchesToNotebookMatches(textSearchMatches, cell) {
        const notebookMatches = [];
        textSearchMatches.map((textSearchMatch) => {
            const previewLines = textSearchMatch.preview.text.split('\n');
            if (Array.isArray(textSearchMatch.ranges)) {
                textSearchMatch.ranges.forEach((r, i) => {
                    const previewRange = textSearchMatch.preview.matches[i];
                    const match = new MatchInNotebook(cell, previewLines, previewRange, r, textSearchMatch.webviewIndex);
                    notebookMatches.push(match);
                });
            }
            else {
                const previewRange = textSearchMatch.preview.matches;
                const match = new MatchInNotebook(cell, previewLines, previewRange, textSearchMatch.ranges, textSearchMatch.webviewIndex);
                notebookMatches.push(match);
            }
        });
        return notebookMatches;
    }
    exports.textSearchMatchesToNotebookMatches = textSearchMatchesToNotebookMatches;
    function arrayContainsElementOrParent(element, testArray) {
        do {
            if (testArray.includes(element)) {
                return true;
            }
        } while (!(element.parent() instanceof SearchResult) && (element = element.parent()));
        return false;
    }
    exports.arrayContainsElementOrParent = arrayContainsElementOrParent;
    function getFileMatches(matches) {
        const folderMatches = [];
        const fileMatches = [];
        matches.forEach((e) => {
            if (e instanceof FileMatch) {
                fileMatches.push(e);
            }
            else {
                folderMatches.push(e);
            }
        });
        return fileMatches.concat(folderMatches.map(e => e.allDownstreamFileMatches()).flat());
    }
    function mergeSearchResultEvents(events) {
        const retEvent = {
            elements: [],
            added: false,
            removed: false,
        };
        events.forEach((e) => {
            if (e.added) {
                retEvent.added = true;
            }
            if (e.removed) {
                retEvent.removed = true;
            }
            retEvent.elements = retEvent.elements.concat(e.elements);
        });
        return retEvent;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0Q2hHLE1BQWEsS0FBSztpQkFFTyxzQkFBaUIsR0FBRyxHQUFHLENBQUM7UUFRaEQsWUFBc0IsT0FBa0IsRUFBVSxpQkFBMkIsRUFBRSxpQkFBK0IsRUFBRSxjQUE0QjtZQUF0SCxZQUFPLEdBQVAsT0FBTyxDQUFXO1lBQVUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFVO1lBQzVFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNoRixNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLEtBQUssaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzdGLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXRHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxhQUFLLENBQ3RCLGNBQWMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUNsQyxjQUFjLENBQUMsV0FBVyxHQUFHLENBQUMsRUFDOUIsY0FBYyxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQ2hDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFL0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO1lBRTND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
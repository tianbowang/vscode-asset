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
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages", "vs/editor/common/model", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/wordHighlighter/browser/highlightDecorations", "vs/platform/contextkey/common/contextkey", "vs/base/common/network", "vs/base/common/map", "vs/editor/common/languageSelector"], function (require, exports, nls, arrays, aria_1, async_1, cancellation_1, errors_1, lifecycle_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, range_1, editorContextKeys_1, languages_1, model_1, languageFeatures_1, highlightDecorations_1, contextkey_1, network_1, map_1, languageSelector_1) {
    "use strict";
    var WordHighlighter_1, WordHighlighterContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WordHighlighterContribution = exports.getOccurrencesAcrossMultipleModels = exports.getOccurrencesAtPosition = void 0;
    // import { TextualMultiDocumentHighlightFeature } from 'vs/editor/contrib/wordHighlighter/browser/textualHighlightProvider';
    // import { registerEditorFeature } from 'vs/editor/common/editorFeatures';
    const ctxHasWordHighlights = new contextkey_1.RawContextKey('hasWordHighlights', false);
    function getOccurrencesAtPosition(registry, model, position, token) {
        const orderedByScore = registry.ordered(model);
        // in order of score ask the occurrences provider
        // until someone response with a good result
        // (good = none empty array)
        return (0, async_1.first)(orderedByScore.map(provider => () => {
            return Promise.resolve(provider.provideDocumentHighlights(model, position, token))
                .then(undefined, errors_1.onUnexpectedExternalError);
        }), arrays.isNonEmptyArray).then(result => {
            if (result) {
                const map = new map_1.ResourceMap();
                map.set(model.uri, result);
                return map;
            }
            return new map_1.ResourceMap();
        });
    }
    exports.getOccurrencesAtPosition = getOccurrencesAtPosition;
    function getOccurrencesAcrossMultipleModels(registry, model, position, wordSeparators, token, otherModels) {
        const orderedByScore = registry.ordered(model);
        // in order of score ask the occurrences provider
        // until someone response with a good result
        // (good = none empty array)
        return (0, async_1.first)(orderedByScore.map(provider => () => {
            const filteredModels = otherModels.filter(otherModel => {
                return (0, model_1.shouldSynchronizeModel)(otherModel);
            }).filter(otherModel => {
                return (0, languageSelector_1.score)(provider.selector, otherModel.uri, otherModel.getLanguageId(), true, undefined, undefined) > 0;
            });
            return Promise.resolve(provider.provideMultiDocumentHighlights(model, position, filteredModels, token))
                .then(undefined, errors_1.onUnexpectedExternalError);
        }), (t) => t instanceof map_1.ResourceMap && t.size > 0);
    }
    exports.getOccurrencesAcrossMultipleModels = getOccurrencesAcrossMultipleModels;
    class OccurenceAtPositionRequest {
        constructor(_model, _selection, _wordSeparators) {
            this._model = _model;
            this._selection = _selection;
            this._wordSeparators = _wordSeparators;
            this._wordRange = this._getCurrentWordRange(_model, _selection);
            this._result = null;
        }
        get result() {
            if (!this._result) {
                this._result = (0, async_1.createCancelablePromise)(token => this._compute(this._model, this._selection, this._wordSeparators, token));
            }
            return this._result;
        }
        _getCurrentWordRange(model, selection) {
            const word = model.getWordAtPosition(selection.getPosition());
            if (word) {
                return new range_1.Range(selection.startLineNumber, word.startColumn, selection.startLineNumber, word.endColumn);
            }
            return null;
        }
        isValid(model, selection, decorations) {
            const lineNumber = selection.startLineNumber;
            const startColumn = selection.startColumn;
            const endColumn = selection.endColumn;
            const currentWordRange = this._getCurrentWordRange(model, selection);
            let requestIsValid = Boolean(this._wordRange && this._wordRange.equalsRange(currentWordRange));
            // Even if we are on a different word, if that word is in the decorations ranges, the request is still valid
            // (Same symbol)
            for (let i = 0, len = decorations.length; !requestIsValid && i < len; i++) {
                const range = decorations.getRange(i);
                if (range && range.startLineNumber === lineNumber) {
                    if (range.startColumn <= startColumn && range.endColumn >= endColumn) {
                        requestIsValid = true;
                    }
                }
            }
            return requestIsValid;
        }
        cancel() {
            this.result.cancel();
        }
    }
    class SemanticOccurenceAtPositionRequest extends OccurenceAtPositionRequest {
        constructor(model, selection, wordSeparators, providers) {
            super(model, selection, wordSeparators);
            this._providers = providers;
        }
        _compute(model, selection, wordSeparators, token) {
            return getOccurrencesAtPosition(this._providers, model, selection.getPosition(), token).then(value => {
                if (!value) {
                    return new map_1.ResourceMap();
                }
                return value;
            });
        }
    }
    class MultiModelOccurenceRequest extends OccurenceAtPositionRequest {
        constructor(model, selection, wordSeparators, providers, otherModels) {
            super(model, selection, wordSeparators);
            this._providers = providers;
            this._otherModels = otherModels;
        }
        _compute(model, selection, wordSeparators, token) {
            return getOccurrencesAcrossMultipleModels(this._providers, model, selection.getPosition(), wordSeparators, token, this._otherModels).then(value => {
                if (!value) {
                    return new map_1.ResourceMap();
                }
                return value;
            });
        }
    }
    class TextualOccurenceRequest extends OccurenceAtPositionRequest {
        constructor(model, selection, word, wordSeparators, otherModels) {
            super(model, selection, wordSeparators);
            this._otherModels = otherModels;
            this._selectionIsEmpty = selection.isEmpty();
            this._word = word;
        }
        _compute(model, selection, wordSeparators, token) {
            return (0, async_1.timeout)(250, token).then(() => {
                const result = new map_1.ResourceMap();
                let wordResult;
                if (this._word) {
                    wordResult = this._word;
                }
                else {
                    wordResult = model.getWordAtPosition(selection.getPosition());
                }
                if (!wordResult) {
                    return new map_1.ResourceMap();
                }
                const allModels = [model, ...this._otherModels];
                for (const otherModel of allModels) {
                    if (otherModel.isDisposed()) {
                        continue;
                    }
                    const matches = otherModel.findMatches(wordResult.word, true, false, true, wordSeparators, false);
                    const highlights = matches.map(m => ({
                        range: m.range,
                        kind: languages_1.DocumentHighlightKind.Text
                    }));
                    if (highlights) {
                        result.set(otherModel.uri, highlights);
                    }
                }
                return result;
            });
        }
        isValid(model, selection, decorations) {
            const currentSelectionIsEmpty = selection.isEmpty();
            if (this._selectionIsEmpty !== currentSelectionIsEmpty) {
                return false;
            }
            return super.isValid(model, selection, decorations);
        }
    }
    function computeOccurencesAtPosition(registry, model, selection, word, wordSeparators) {
        if (registry.has(model)) {
            return new SemanticOccurenceAtPositionRequest(model, selection, wordSeparators, registry);
        }
        return new TextualOccurenceRequest(model, selection, word, wordSeparators, []);
    }
    function computeOccurencesMultiModel(registry, model, selection, word, wordSeparators, otherModels) {
        if (registry.has(model)) {
            return new MultiModelOccurenceRequest(model, selection, wordSeparators, registry, otherModels);
        }
        return new TextualOccurenceRequest(model, selection, word, wordSeparators, otherModels);
    }
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executeDocumentHighlights', async (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const map = await getOccurrencesAtPosition(languageFeaturesService.documentHighlightProvider, model, position, cancellation_1.CancellationToken.None);
        return map?.get(model.uri);
    });
    let WordHighlighter = class WordHighlighter {
        static { WordHighlighter_1 = this; }
        static { this.storedDecorations = new map_1.ResourceMap(); }
        static { this.query = null; }
        constructor(editor, providers, multiProviders, contextKeyService, codeEditorService) {
            this.toUnhook = new lifecycle_1.DisposableStore();
            this.workerRequestTokenId = 0;
            this.workerRequestCompleted = false;
            this.workerRequestValue = new map_1.ResourceMap();
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
            this.editor = editor;
            this.providers = providers;
            this.multiDocumentProviders = multiProviders;
            this.codeEditorService = codeEditorService;
            this._hasWordHighlights = ctxHasWordHighlights.bindTo(contextKeyService);
            this._ignorePositionChangeEvent = false;
            this.occurrencesHighlight = this.editor.getOption(80 /* EditorOption.occurrencesHighlight */);
            this.model = this.editor.getModel();
            this.toUnhook.add(editor.onDidChangeCursorPosition((e) => {
                if (this._ignorePositionChangeEvent) {
                    // We are changing the position => ignore this event
                    return;
                }
                if (this.occurrencesHighlight === 'off') {
                    // Early exit if nothing needs to be done!
                    // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                    return;
                }
                this._onPositionChanged(e);
            }));
            this.toUnhook.add(editor.onDidChangeModelContent((e) => {
                this._stopAll();
            }));
            this.toUnhook.add(editor.onDidChangeModel((e) => {
                if (!e.newModelUrl && e.oldModelUrl) {
                    this._stopSingular();
                }
                else {
                    if (WordHighlighter_1.query) {
                        this._run();
                    }
                }
            }));
            this.toUnhook.add(editor.onDidChangeConfiguration((e) => {
                const newValue = this.editor.getOption(80 /* EditorOption.occurrencesHighlight */);
                if (this.occurrencesHighlight !== newValue) {
                    this.occurrencesHighlight = newValue;
                    this._stopAll();
                }
            }));
            this.decorations = this.editor.createDecorationsCollection();
            this.workerRequestTokenId = 0;
            this.workerRequest = null;
            this.workerRequestCompleted = false;
            this.lastCursorPositionChangeTime = 0;
            this.renderDecorationsTimer = -1;
            // if there is a query already, highlight off that query
            if (WordHighlighter_1.query) {
                this._run();
            }
        }
        hasDecorations() {
            return (this.decorations.length > 0);
        }
        restore() {
            if (this.occurrencesHighlight === 'off') {
                return;
            }
            this._run();
        }
        stop() {
            if (this.occurrencesHighlight === 'off') {
                return;
            }
            this._stopAll();
        }
        _getSortedHighlights() {
            return (this.decorations.getRanges()
                .sort(range_1.Range.compareRangesUsingStarts));
        }
        moveNext() {
            const highlights = this._getSortedHighlights();
            const index = highlights.findIndex((range) => range.containsPosition(this.editor.getPosition()));
            const newIndex = ((index + 1) % highlights.length);
            const dest = highlights[newIndex];
            try {
                this._ignorePositionChangeEvent = true;
                this.editor.setPosition(dest.getStartPosition());
                this.editor.revealRangeInCenterIfOutsideViewport(dest);
                const word = this._getWord();
                if (word) {
                    const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
                    (0, aria_1.alert)(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
                }
            }
            finally {
                this._ignorePositionChangeEvent = false;
            }
        }
        moveBack() {
            const highlights = this._getSortedHighlights();
            const index = highlights.findIndex((range) => range.containsPosition(this.editor.getPosition()));
            const newIndex = ((index - 1 + highlights.length) % highlights.length);
            const dest = highlights[newIndex];
            try {
                this._ignorePositionChangeEvent = true;
                this.editor.setPosition(dest.getStartPosition());
                this.editor.revealRangeInCenterIfOutsideViewport(dest);
                const word = this._getWord();
                if (word) {
                    const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
                    (0, aria_1.alert)(`${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`);
                }
            }
            finally {
                this._ignorePositionChangeEvent = false;
            }
        }
        _removeSingleDecorations() {
            // return if no model
            if (!this.editor.hasModel()) {
                return;
            }
            const currentDecorationIDs = WordHighlighter_1.storedDecorations.get(this.editor.getModel().uri);
            if (!currentDecorationIDs) {
                return;
            }
            this.editor.removeDecorations(currentDecorationIDs);
            WordHighlighter_1.storedDecorations.delete(this.editor.getModel().uri);
            if (this.decorations.length > 0) {
                this.decorations.clear();
                this._hasWordHighlights.set(false);
            }
        }
        _removeAllDecorations() {
            const currentEditors = this.codeEditorService.listCodeEditors();
            // iterate over editors and store models in currentModels
            for (const editor of currentEditors) {
                if (!editor.hasModel()) {
                    continue;
                }
                const currentDecorationIDs = WordHighlighter_1.storedDecorations.get(editor.getModel().uri);
                if (!currentDecorationIDs) {
                    continue;
                }
                editor.removeDecorations(currentDecorationIDs);
                WordHighlighter_1.storedDecorations.delete(editor.getModel().uri);
                const editorHighlighterContrib = WordHighlighterContribution.get(editor);
                if (!editorHighlighterContrib?.wordHighlighter) {
                    continue;
                }
                if (editorHighlighterContrib.wordHighlighter.decorations.length > 0) {
                    editorHighlighterContrib.wordHighlighter.decorations.clear();
                    editorHighlighterContrib.wordHighlighter._hasWordHighlights.set(false);
                }
            }
        }
        _stopSingular() {
            // Remove any existing decorations + a possible query, and re - run to update decorations
            this._removeSingleDecorations();
            if (this.editor.hasWidgetFocus()) {
                if (this.editor.getModel()?.uri.scheme !== network_1.Schemas.vscodeNotebookCell && WordHighlighter_1.query?.modelInfo?.model.uri.scheme !== network_1.Schemas.vscodeNotebookCell) { // clear query if focused non-nb editor
                    WordHighlighter_1.query = null;
                    this._run();
                }
                else { // remove modelInfo to account for nb cell being disposed
                    if (WordHighlighter_1.query?.modelInfo) {
                        WordHighlighter_1.query.modelInfo = null;
                    }
                }
            }
            // Cancel any renderDecorationsTimer
            if (this.renderDecorationsTimer !== -1) {
                clearTimeout(this.renderDecorationsTimer);
                this.renderDecorationsTimer = -1;
            }
            // Cancel any worker request
            if (this.workerRequest !== null) {
                this.workerRequest.cancel();
                this.workerRequest = null;
            }
            // Invalidate any worker request callback
            if (!this.workerRequestCompleted) {
                this.workerRequestTokenId++;
                this.workerRequestCompleted = true;
            }
        }
        _stopAll() {
            // Remove any existing decorations
            this._removeAllDecorations();
            // Cancel any renderDecorationsTimer
            if (this.renderDecorationsTimer !== -1) {
                clearTimeout(this.renderDecorationsTimer);
                this.renderDecorationsTimer = -1;
            }
            // Cancel any worker request
            if (this.workerRequest !== null) {
                this.workerRequest.cancel();
                this.workerRequest = null;
            }
            // Invalidate any worker request callback
            if (!this.workerRequestCompleted) {
                this.workerRequestTokenId++;
                this.workerRequestCompleted = true;
            }
        }
        _onPositionChanged(e) {
            // disabled
            if (this.occurrencesHighlight === 'off') {
                this._stopAll();
                return;
            }
            // ignore typing & other
            // need to check if the model is a notebook cell, should not stop if nb
            if (e.reason !== 3 /* CursorChangeReason.Explicit */ && this.editor.getModel()?.uri.scheme !== network_1.Schemas.vscodeNotebookCell) {
                this._stopAll();
                return;
            }
            this._run();
        }
        _getWord() {
            const editorSelection = this.editor.getSelection();
            const lineNumber = editorSelection.startLineNumber;
            const startColumn = editorSelection.startColumn;
            if (this.model.isDisposed()) {
                return null;
            }
            return this.model.getWordAtPosition({
                lineNumber: lineNumber,
                column: startColumn
            });
        }
        getOtherModelsToHighlight(model) {
            if (!model) {
                return [];
            }
            // notebook case
            const isNotebookEditor = model.uri.scheme === network_1.Schemas.vscodeNotebookCell;
            if (isNotebookEditor) {
                const currentModels = [];
                const currentEditors = this.codeEditorService.listCodeEditors();
                for (const editor of currentEditors) {
                    const tempModel = editor.getModel();
                    if (tempModel && tempModel !== model && tempModel.uri.scheme === network_1.Schemas.vscodeNotebookCell) {
                        currentModels.push(tempModel);
                    }
                }
                return currentModels;
            }
            // inline case
            // ? current works when highlighting outside of an inline diff, highlighting in.
            // ? broken when highlighting within a diff editor. highlighting the main editor does not work
            // ? editor group service could be useful here
            const currentModels = [];
            const currentEditors = this.codeEditorService.listCodeEditors();
            for (const editor of currentEditors) {
                if (!(0, editorBrowser_1.isDiffEditor)(editor)) {
                    continue;
                }
                const diffModel = editor.getModel();
                if (!diffModel) {
                    continue;
                }
                if (model === diffModel.modified) { // embedded inline chat diff would pass this, allowing highlights
                    //? currentModels.push(diffModel.original);
                    currentModels.push(diffModel.modified);
                }
            }
            if (currentModels.length) { // no matching editors have been found
                return currentModels;
            }
            // multi-doc OFF
            if (this.occurrencesHighlight === 'singleFile') {
                return [];
            }
            // multi-doc ON
            for (const editor of currentEditors) {
                const tempModel = editor.getModel();
                const isValidModel = tempModel && tempModel !== model;
                if (isValidModel) {
                    currentModels.push(tempModel);
                }
            }
            return currentModels;
        }
        _run() {
            let workerRequestIsValid;
            if (!this.editor.hasWidgetFocus()) { // no focus (new nb cell, etc)
                if (WordHighlighter_1.query === null) {
                    // no previous query, nothing to highlight
                    return;
                }
            }
            else {
                const editorSelection = this.editor.getSelection();
                // ignore multiline selection
                if (!editorSelection || editorSelection.startLineNumber !== editorSelection.endLineNumber) {
                    this._stopAll();
                    return;
                }
                const startColumn = editorSelection.startColumn;
                const endColumn = editorSelection.endColumn;
                const word = this._getWord();
                // The selection must be inside a word or surround one word at most
                if (!word || word.startColumn > startColumn || word.endColumn < endColumn) {
                    // no previous query, nothing to highlight
                    WordHighlighter_1.query = null;
                    this._stopAll();
                    return;
                }
                // All the effort below is trying to achieve this:
                // - when cursor is moved to a word, trigger immediately a findOccurrences request
                // - 250ms later after the last cursor move event, render the occurrences
                // - no flickering!
                workerRequestIsValid = (this.workerRequest && this.workerRequest.isValid(this.model, editorSelection, this.decorations));
                WordHighlighter_1.query = {
                    modelInfo: {
                        model: this.model,
                        selection: editorSelection,
                    },
                    word: word
                };
            }
            // There are 4 cases:
            // a) old workerRequest is valid & completed, renderDecorationsTimer fired
            // b) old workerRequest is valid & completed, renderDecorationsTimer not fired
            // c) old workerRequest is valid, but not completed
            // d) old workerRequest is not valid
            // For a) no action is needed
            // For c), member 'lastCursorPositionChangeTime' will be used when installing the timer so no action is needed
            this.lastCursorPositionChangeTime = (new Date()).getTime();
            if (workerRequestIsValid) {
                if (this.workerRequestCompleted && this.renderDecorationsTimer !== -1) {
                    // case b)
                    // Delay the firing of renderDecorationsTimer by an extra 250 ms
                    clearTimeout(this.renderDecorationsTimer);
                    this.renderDecorationsTimer = -1;
                    this._beginRenderDecorations();
                }
            }
            else {
                // case d)
                // Stop all previous actions and start fresh
                this._stopAll();
                const myRequestId = ++this.workerRequestTokenId;
                this.workerRequestCompleted = false;
                const otherModelsToHighlight = this.getOtherModelsToHighlight(this.editor.getModel());
                // 2 cases where we want to send the word
                // a) there is no stored query model, but there is a word. This signals the editor that drove the highlight is disposed (cell out of viewport, etc)
                // b) the queried model is not the current model. This signals that the editor that drove the highlight is still in the viewport, but we are highlighting a different cell
                // otherwise, we send null in place of the word, and the model and selection are used to compute the word
                const sendWord = (!WordHighlighter_1.query.modelInfo && WordHighlighter_1.query.word) ||
                    (WordHighlighter_1.query.modelInfo?.model.uri !== this.model.uri)
                    ? true : false;
                if (!WordHighlighter_1.query.modelInfo || (WordHighlighter_1.query.modelInfo.model.uri !== this.model.uri)) { // use this.model
                    this.workerRequest = this.computeWithModel(this.model, this.editor.getSelection(), sendWord ? WordHighlighter_1.query.word : null, otherModelsToHighlight);
                }
                else { // use stored query model + selection
                    this.workerRequest = this.computeWithModel(WordHighlighter_1.query.modelInfo.model, WordHighlighter_1.query.modelInfo.selection, WordHighlighter_1.query.word, otherModelsToHighlight);
                }
                this.workerRequest?.result.then(data => {
                    if (myRequestId === this.workerRequestTokenId) {
                        this.workerRequestCompleted = true;
                        this.workerRequestValue = data || [];
                        this._beginRenderDecorations();
                    }
                }, errors_1.onUnexpectedError);
            }
        }
        computeWithModel(model, selection, word, otherModels) {
            if (!otherModels.length) {
                return computeOccurencesAtPosition(this.providers, model, selection, word, this.editor.getOption(129 /* EditorOption.wordSeparators */));
            }
            else {
                return computeOccurencesMultiModel(this.multiDocumentProviders, model, selection, word, this.editor.getOption(129 /* EditorOption.wordSeparators */), otherModels);
            }
        }
        _beginRenderDecorations() {
            const currentTime = (new Date()).getTime();
            const minimumRenderTime = this.lastCursorPositionChangeTime + 250;
            if (currentTime >= minimumRenderTime) {
                // Synchronous
                this.renderDecorationsTimer = -1;
                this.renderDecorations();
            }
            else {
                // Asynchronous
                this.renderDecorationsTimer = setTimeout(() => {
                    this.renderDecorations();
                }, (minimumRenderTime - currentTime));
            }
        }
        renderDecorations() {
            this.renderDecorationsTimer = -1;
            // create new loop, iterate over current editors using this.codeEditorService.listCodeEditors(),
            // if the URI of that codeEditor is in the map, then add the decorations to the decorations array
            // then set the decorations for the editor
            const currentEditors = this.codeEditorService.listCodeEditors();
            for (const editor of currentEditors) {
                const editorHighlighterContrib = WordHighlighterContribution.get(editor);
                if (!editorHighlighterContrib) {
                    continue;
                }
                const newDecorations = [];
                const uri = editor.getModel()?.uri;
                if (uri && this.workerRequestValue.has(uri)) {
                    const oldDecorationIDs = WordHighlighter_1.storedDecorations.get(uri);
                    const newDocumentHighlights = this.workerRequestValue.get(uri);
                    if (newDocumentHighlights) {
                        for (const highlight of newDocumentHighlights) {
                            newDecorations.push({
                                range: highlight.range,
                                options: (0, highlightDecorations_1.getHighlightDecorationOptions)(highlight.kind)
                            });
                        }
                    }
                    let newDecorationIDs = [];
                    editor.changeDecorations((changeAccessor) => {
                        newDecorationIDs = changeAccessor.deltaDecorations(oldDecorationIDs ?? [], newDecorations);
                    });
                    WordHighlighter_1.storedDecorations = WordHighlighter_1.storedDecorations.set(uri, newDecorationIDs);
                    if (newDecorations.length > 0) {
                        editorHighlighterContrib.wordHighlighter?.decorations.set(newDecorations);
                        editorHighlighterContrib.wordHighlighter?._hasWordHighlights.set(true);
                    }
                }
            }
        }
        dispose() {
            this._stopSingular();
            this.toUnhook.dispose();
        }
    };
    WordHighlighter = WordHighlighter_1 = __decorate([
        __param(4, codeEditorService_1.ICodeEditorService)
    ], WordHighlighter);
    let WordHighlighterContribution = class WordHighlighterContribution extends lifecycle_1.Disposable {
        static { WordHighlighterContribution_1 = this; }
        static { this.ID = 'editor.contrib.wordHighlighter'; }
        static get(editor) {
            return editor.getContribution(WordHighlighterContribution_1.ID);
        }
        constructor(editor, contextKeyService, languageFeaturesService, codeEditorService) {
            super();
            this._wordHighlighter = null;
            const createWordHighlighterIfPossible = () => {
                if (editor.hasModel() && !editor.getModel().isTooLargeForTokenization()) {
                    this._wordHighlighter = new WordHighlighter(editor, languageFeaturesService.documentHighlightProvider, languageFeaturesService.multiDocumentHighlightProvider, contextKeyService, codeEditorService);
                }
            };
            this._register(editor.onDidChangeModel((e) => {
                if (this._wordHighlighter) {
                    this._wordHighlighter.dispose();
                    this._wordHighlighter = null;
                }
                createWordHighlighterIfPossible();
            }));
            createWordHighlighterIfPossible();
        }
        get wordHighlighter() {
            return this._wordHighlighter;
        }
        saveViewState() {
            if (this._wordHighlighter && this._wordHighlighter.hasDecorations()) {
                return true;
            }
            return false;
        }
        moveNext() {
            this._wordHighlighter?.moveNext();
        }
        moveBack() {
            this._wordHighlighter?.moveBack();
        }
        restoreViewState(state) {
            if (this._wordHighlighter && state) {
                this._wordHighlighter.restore();
            }
        }
        stopHighlighting() {
            this._wordHighlighter?.stop();
        }
        dispose() {
            if (this._wordHighlighter) {
                this._wordHighlighter.dispose();
                this._wordHighlighter = null;
            }
            super.dispose();
        }
    };
    exports.WordHighlighterContribution = WordHighlighterContribution;
    exports.WordHighlighterContribution = WordHighlighterContribution = WordHighlighterContribution_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, languageFeatures_1.ILanguageFeaturesService),
        __param(3, codeEditorService_1.ICodeEditorService)
    ], WordHighlighterContribution);
    class WordHighlightNavigationAction extends editorExtensions_1.EditorAction {
        constructor(next, opts) {
            super(opts);
            this._isNext = next;
        }
        run(accessor, editor) {
            const controller = WordHighlighterContribution.get(editor);
            if (!controller) {
                return;
            }
            if (this._isNext) {
                controller.moveNext();
            }
            else {
                controller.moveBack();
            }
        }
    }
    class NextWordHighlightAction extends WordHighlightNavigationAction {
        constructor() {
            super(true, {
                id: 'editor.action.wordHighlight.next',
                label: nls.localize('wordHighlight.next.label', "Go to Next Symbol Highlight"),
                alias: 'Go to Next Symbol Highlight',
                precondition: ctxHasWordHighlights,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    class PrevWordHighlightAction extends WordHighlightNavigationAction {
        constructor() {
            super(false, {
                id: 'editor.action.wordHighlight.prev',
                label: nls.localize('wordHighlight.previous.label', "Go to Previous Symbol Highlight"),
                alias: 'Go to Previous Symbol Highlight',
                precondition: ctxHasWordHighlights,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 65 /* KeyCode.F7 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
    }
    class TriggerWordHighlightAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.wordHighlight.trigger',
                label: nls.localize('wordHighlight.trigger.label', "Trigger Symbol Highlight"),
                alias: 'Trigger Symbol Highlight',
                precondition: ctxHasWordHighlights.toNegated(),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 0,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor, args) {
            const controller = WordHighlighterContribution.get(editor);
            if (!controller) {
                return;
            }
            controller.restoreViewState(true);
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(WordHighlighterContribution.ID, WordHighlighterContribution, 0 /* EditorContributionInstantiation.Eager */); // eager because it uses `saveViewState`/`restoreViewState`
    (0, editorExtensions_1.registerEditorAction)(NextWordHighlightAction);
    (0, editorExtensions_1.registerEditorAction)(PrevWordHighlightAction);
    (0, editorExtensions_1.registerEditorAction)(TriggerWordHighlightAction);
});
// registerEditorFeature(TextualMultiDocumentHighlightFeature);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZEhpZ2hsaWdodGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi93b3JkSGlnaGxpZ2h0ZXIvYnJvd3Nlci93b3JkSGlnaGxpZ2h0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWdDaEcsNkhBQTZIO0lBQzdILDJFQUEyRTtJQUUzRSxNQUFNLG9CQUFvQixHQUFHLElBQUksMEJBQWEsQ0FBVSxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVwRixTQUFnQix3QkFBd0IsQ0FBQyxRQUE0RCxFQUFFLEtBQWlCLEVBQUUsUUFBa0IsRUFBRSxLQUF3QjtRQUNySyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRS9DLGlEQUFpRDtRQUNqRCw0Q0FBNEM7UUFDNUMsNEJBQTRCO1FBQzVCLE9BQU8sSUFBQSxhQUFLLEVBQXlDLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7WUFDeEYsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNoRixJQUFJLENBQUMsU0FBUyxFQUFFLGtDQUF5QixDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNaLE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQVcsRUFBdUIsQ0FBQztnQkFDbkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQixPQUFPLEdB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
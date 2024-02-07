/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/diff/diff", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/mirrorTextModel", "vs/editor/common/core/wordHelper", "vs/editor/common/languages/linkComputer", "vs/editor/common/languages/supports/inplaceReplaceSupport", "vs/editor/common/services/editorBaseApi", "vs/base/common/stopwatch", "vs/editor/common/services/unicodeTextModelHighlighter", "vs/editor/common/diff/legacyLinesDiffComputer", "vs/editor/common/diff/linesDiffComputers", "vs/base/common/objects", "vs/base/common/errors", "vs/editor/common/languages/defaultDocumentColorsComputer"], function (require, exports, diff_1, uri_1, position_1, range_1, mirrorTextModel_1, wordHelper_1, linkComputer_1, inplaceReplaceSupport_1, editorBaseApi_1, stopwatch_1, unicodeTextModelHighlighter_1, legacyLinesDiffComputer_1, linesDiffComputers_1, objects_1, errors_1, defaultDocumentColorsComputer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = exports.EditorSimpleWorker = void 0;
    /**
     * @internal
     */
    class MirrorModel extends mirrorTextModel_1.MirrorTextModel {
        get uri() {
            return this._uri;
        }
        get eol() {
            return this._eol;
        }
        getValue() {
            return this.getText();
        }
        findMatches(regex) {
            const matches = [];
            for (let i = 0; i < this._lines.length; i++) {
                const line = this._lines[i];
                const offsetToAdd = this.offsetAt(new position_1.Position(i + 1, 1));
                const iteratorOverMatches = line.matchAll(regex);
                for (const match of iteratorOverMatches) {
                    if (match.index || match.index === 0) {
                        match.index = match.index + offsetToAdd;
                    }
                    matches.push(match);
                }
            }
            return matches;
        }
        getLinesContent() {
            return this._lines.slice(0);
        }
        getLineCount() {
            return this._lines.length;
        }
        getLineContent(lineNumber) {
            return this._lines[lineNumber - 1];
        }
        getWordAtPosition(position, wordDefinition) {
            const wordAtText = (0, wordHelper_1.getWordAtText)(position.column, (0, wordHelper_1.ensureValidWordDefinition)(wordDefinition), this._lines[position.lineNumber - 1], 0);
            if (wordAtText) {
                return new range_1.Range(position.lineNumber, wordAtText.startColumn, position.lineNumber, wordAtText.endColumn);
            }
            return null;
        }
        getWordUntilPosition(position, wordDefinition) {
            const wordAtPosition = this.getWordAtPosition(position, wordDefinition);
            if (!wordAtPosition) {
                return {
                    word: '',
                    startColumn: position.column,
                    endColumn: position.column
                };
            }
            return {
                word: this._lines[position.lineNumber - 1].substring(wordAtPosition.startColumn - 1, position.column - 1),
                startColumn: wordAtPosition.startColumn,
                endColumn: position.column
            };
        }
        words(wordDefinition) {
            const lines = this._lines;
            const wordenize = this._wordenize.bind(this);
            let lineNumber = 0;
            let lineText = '';
            let wordRangesIdx = 0;
            let wordRanges = [];
            return {
                *[Symbol.iterator]() {
                    while (true) {
                        if (wordRangesIdx < wordRanges.length) {
                            const value = lineText.substring(wordRanges[wordRangesIdx].start, wordRanges[wordRangesIdx].end);
                            wordRangesIdx += 1;
                            yield value;
                        }
                        else {
                            if (lineNumber < lines.length) {
                                lineText = lines[lineNumber];
                                wordRanges = wordenize(lineText, wordDefinition);
                                wordRangesIdx = 0;
                                lineNumber += 1;
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
            };
        }
        getLineWords(lineNumber, wordDefinition) {
            const content = this._lines[lineNumber - 1];
            const ranges = this._wordenize(content, wordDefinition);
            const words = [];
            for (const range of ranges) {
                words.push({
                    word: content.substring(range.start, range.end),
                    startColumn: range.start + 1,
                    endColumn: range.end + 1
                });
            }
            return words;
        }
        _wordenize(content, wordDefinition) {
            const result = [];
            let match;
            wordDefinition.lastIndex = 0; // reset lastIndex just to be sure
            while (match = wordDefinition.exec(content)) {
                if (match[0].length === 0) {
                    // it did match the empty string
                    break;
                }
                result.push({ start: match.index, end: match.index + match[0].length });
            }
            return result;
        }
        getValueInRange(range) {
            range = this._validateRange(range);
            if (range.startLineNumber === range.endLineNumber) {
                return this._lines[range.startLineNumber - 1].substring(range.startColumn - 1, range.endColumn - 1);
            }
            const lineEnding = this._eol;
            const startLineIndex = range.startLineNumber - 1;
            const endLineIndex = range.endLineNumber - 1;
            const resultLines = [];
            resultLines.push(this._lines[startLineIndex].substring(range.startColumn - 1));
            for (let i = startLineIndex + 1; i < endLineIndex; i++) {
                resultLines.push(this._lines[i]);
            }
            resultLines.push(this._lines[endLineIndex].substring(0, range.endColumn - 1));
            return resultLines.join(lineEnding);
        }
        offsetAt(position) {
            position = this._validatePosition(position);
            this._ensureLineStarts();
            return this._lineStarts.getPrefixSum(position.lineNumber - 2) + (position.column - 1);
        }
        positionAt(offset) {
            offset = Math.floor(offset);
            offset = Math.max(0, offset);
            this._ensureLineStarts();
            const out = this._lineStarts.getIndexOf(offset);
            const lineLength = this._lines[out.index].length;
            // Ensure we return a valid position
            return {
                lineNumber: 1 + out.index,
                column: 1 + Math.min(out.remainder, lineLength)
            };
        }
        _validateRange(range) {
            const start = this._validatePosition({ lineNumber: range.startLineNumber, column: range.startColumn });
            const end = this._validatePosition({ lineNumber: range.endLineNumber, column: range.endColumn });
            if (start.lineNumber !== range.startLineNumber
                || start.column !== range.startColumn
                || end.lineNumber !== range.endLineNumber
                || end.column !== range.endColumn) {
                return {
                    startLineNumber: start.lineNumber,
                    startColumn: start.column,
                    endLineNumber: end.lineNumber,
                    endColumn: end.column
                };
            }
            return range;
        }
        _validatePosition(position) {
            if (!position_1.Position.isIPosition(position)) {
                throw new Error('bad position');
            }
            let { lineNumber, column } = position;
            let hasChanged = false;
            if (lineNumber < 1) {
                lineNumber = 1;
                column = 1;
                hasChanged = true;
            }
            else if (lineNumber > this._lines.length) {
                lineNumber = this._lines.length;
                column = this._lines[lineNumber - 1].length + 1;
                hasChanged = true;
            }
            else {
                const maxCharacter = this._lines[lineNumber - 1].length + 1;
                if (column < 1) {
                    column = 1;
                    hasChanged = true;
                }
                else if (column > maxCharacter) {
                    column = maxCharacter;
                    hasChanged = true;
                }
            }
            if (!hasChanged) {
                return position;
            }
            else {
                return { lineNumber, column };
            }
        }
    }
    /**
     * @internal
     */
    class EditorSimpleWorker {
        constructor(host, foreignModuleFactory) {
            this._host = host;
            this._models = Object.create(null);
            this._foreignModuleFactory = foreignModuleFactory;
            this._foreignModule = null;
        }
        dispose() {
            this._models = Object.create(null);
        }
        _getModel(uri) {
            return this._models[uri];
        }
        _getModels() {
            const all = [];
            Object.keys(this._models).forEach((key) => all.push(this._models[key]));
            return all;
        }
        acceptNewModel(data) {
            this._models[data.url] = new MirrorModel(uri_1.URI.parse(data.url), data.lines, data.EOL, data.versionId);
        }
        acceptModelChanged(strURL, e) {
            if (!this._models[strURL]) {
                return;
            }
            const model = this._models[strURL];
            model.onEvents(e);
        }
        acceptRemovedModel(strURL) {
            if (!this._models[strURL]) {
                return;
            }
            delete this._models[strURL];
        }
        async computeUnicodeHighlights(url, options, range) {
            const model = this._getModel(url);
            if (!model) {
                return { ranges: [], hasMore: false, ambiguousCharacterCount: 0, invisibleCharacterCount: 0, nonBasicAsciiCharacterCount: 0 };
            }
            return unicodeTextModelHighlighter_1.UnicodeTextModelHighlighter.computeUnicodeHighlights(model, options, range);
        }
        // ---- BEGIN diff --------------------------------------------------------------------------
        async computeDiff(originalUrl, modifiedUrl, options, algorithm) {
            const original = this._getModel(originalUrl);
            const modified = this._getModel(modifiedUrl);
            if (!original || !modified) {
                return null;
            }
            const result = EditorSimpleWorker.computeDiff(original, modified, options, algorithm);
            return result;
        }
        static computeDiff(originalTextModel, modifiedTextModel, options, algorithm) {
            const diffAlgorithm = algorithm === 'advanced' ? linesDiffComputers_1.linesDiffComputers.getDefault() : linesDiffComputers_1.linesDiffComputers.getLegacy();
            const originalLines = originalTextModel.getLinesContent();
            const modifiedLines = modifiedTextModel.getLinesContent();
            const result = diffAlgorithm.computeDiff(originalLines, modifiedLines, options);
            const identical = (result.changes.length > 0 ? false : this._modelsAreIdentical(originalTextModel, modifiedTextModel));
            function getLineChanges(changes) {
                return changes.map(m => ([m.original.startLineNumber, m.original.endLineNumberExclusive, m.modified.startLineNumber, m.modified.endLineNumberExclusive, m.innerChanges?.map(m => [
                        m.originalRange.startLineNumber,
                        m.originalRange.startColumn,
                        m.originalRange.endLineNumber,
                        m.originalRange.endColumn,
                        m.modifiedRange.startLineNumber,
                        m.modifiedRange.startColumn,
                        m.modifiedRange.endLineNumber,
                        m.modifiedRange.endColumn,
                    ])]));
            }
            return {
                identical,
                quitEarly: result.hitTimeout,
                changes: getLineChanges(result.changes),
                moves: result.moves.map(m => ([
                    m.lineRangeMapping.original.startLineNumber,
                    m.lineRangeMapping.original.endLineNumberExclusive,
                    m.lineRangeMapping.modified.startLineNumber,
                    m.lineRangeMapping.modified.endLineNumberExclusive,
                    getLineChanges(m.changes)
                ])),
            };
        }
        static _modelsAreIdentical(original, modified) {
            const originalLineCount = original.getLineCount();
            const modifiedLineCount = modified.getLineCount();
            if (originalLineCount !== modifiedLineCount) {
                return false;
            }
            for (let line = 1; line <= originalLineCount; line++) {
                const originalLine = original.getLineContent(line);
                const modifiedLine = modified.getLineContent(line);
                if (originalLine !== modifiedLine) {
                    return false;
                }
            }
            return true;
        }
        async computeDirtyDiff(originalUrl, modifiedUrl, ignoreTrimWhitespace) {
            const original = this._getModel(originalUrl);
            const modified = this._getModel(modifiedUrl);
            if (!original || !modified) {
                return null;
            }
            const originalLines = original.getLinesContent();
            const modifiedLines = modified.getLinesContent();
            const diffComputer = new legacyLinesDiffComputer_1.DiffComputer(originalLines, modifiedLines, {
                shouldComputeCharChanges: false,
                shouldPostProcessCharChanges: false,
                shouldIgnoreTrimWhitespace: ignoreTrimWhitespace,
                shouldMakePrettyDiff: true,
                maxComputationTime: 1000
            });
            return diffComputer.computeDiff().changes;
        }
        // ---- END diff --------------------------------------------------------------------------
        // ---- BEGIN minimal edits ---------------------------------------------------------------
        static { this._diffLimit = 100000; }
        async computeMoreMinimalEdits(modelUrl, edits, pretty) {
            const model = this._getModel(modelUrl);
            if (!model) {
                return edits;
            }
            const result = [];
            let lastEol = undefined;
            edits = edits.slice(0).sort((a, b) => {
                if (a.range && b.range) {
                    return range_1.Range.compareRangesUsingStarts(a.range, b.range);
                }
                // eol only changes should go to the end
                const aRng = a.range ? 0 : 1;
                const bRng = b.range ? 0 : 1;
                return aRng - bRng;
            });
            // merge adjacent edits
            let writeIndex = 0;
            for (let readIndex = 1; readIndex < edits.length; readIndex++) {
                if (range_1.Range.getEndPosition(edits[writeIndex].range).equals(range_1.Range.getStartPosition(edits[readIndex].range))) {
                    edits[writeIndex].range = range_1.Range.fromPositions(range_1.Range.getStartPosition(edits[writeIndex].range), range_1.Range.getEndPosition(edits[readIndex].range));
                    edits[writeIndex].text += edits[readIndex].text;
                }
                else {
                    writeIndex++;
                    edits[writeIndex] = edits[readIndex];
                }
            }
            edits.length = writeIndex + 1;
            for (let { range, text, eol } of edits) {
                if (typeof eol === 'number') {
                    lastEol = eol;
                }
                if (range_1.Range.isEmpty(range) && !text) {
                    // empty change
                    continue;
                }
                const original = model.getValueInRange(range);
                text = text.replace(/\r\n|\n|\r/g, model.eol);
                if (original === text) {
                    // noop
                    continue;
                }
                // make sure diff won't take too long
                if (Math.max(text.length, original.length) > EditorSimpleWorker._diffLimit) {
                    result.push({ range, text });
                    continue;
                }
                // compute diff between original and edit.text
                const changes = (0, diff_1.stringDiff)(original, text, pretty);
                const editOffset = model.offsetAt(range_1.Range.lift(range).getStartPosition());
                for (const change of changes) {
                    const start = model.positionAt(editOffset + change.originalStart);
                    const end = model.positionAt(editOffset + change.originalStart + change.originalLength);
                    const newEdit = {
                        text: text.substr(change.modifiedStart, change.modifiedLength),
                        range: { startLineNumber: start.lineNumber, startColumn: start.column, endLineNumber: end.lineNumber, endColumn: end.column }
                    };
                    if (model.getValueInRange(newEdit.range) !== newEdit.text) {
                        result.push(newEdit);
                    }
                }
            }
            if (typeof lastEol === 'number') {
                result.push({ eol: lastEol, text: '', range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
            }
            return result;
        }
        computeHumanReadableDiff(modelUrl, edits, options) {
            const model = this._getModel(modelUrl);
            if (!model) {
                return edits;
            }
            const result = [];
            let lastEol = undefined;
            edits = edits.slice(0).sort((a, b) => {
                if (a.range && b.range) {
                    return range_1.Range.compareRangesUsingStarts(a.range, b.range);
                }
                // eol only changes should go to the end
                const aRng = a.range ? 0 : 1;
                const bRng = b.range ? 0 : 1;
                return aRng - bRng;
            });
            for (let { range, text, eol } of edits) {
                if (typeof eol === 'number') {
                    lastEol = eol;
                }
                if (range_1.Range.isEmpty(range) && !text) {
                    // empty change
                    continue;
                }
                const original = model.getValueInRange(range);
                text = text.replace(/\r\n|\n|\r/g, model.eol);
                if (original === text) {
                    // noop
                    continue;
                }
                // make sure diff won't take too long
                if (Math.max(text.length, original.length) > EditorSimpleWorker._diffLimit) {
                    result.push({ range, text });
                    continue;
                }
                // compute diff between original and edit.text
                const originalLines = original.split(/\r\n|\n|\r/);
                const modifiedLines = text.split(/\r\n|\n|\r/);
                const diff = linesDiffComputers_1.linesDiffComputers.getDefault().computeDiff(originalLines, modifiedLines, options);
                const start = range_1.Range.lift(range).getStartPosition();
                function addPositions(pos1, pos2) {
                    return new position_1.Position(pos1.lineNumber + pos2.lineNumber - 1, pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column);
                }
                function getText(lines, range) {
                    const result = [];
                    for (let i = range.startLineNumber; i <= range.endLineNumber; i++) {
                        const line = lines[i - 1];
                        if (i === range.startLineNumber && i === range.endLineNumber) {
                            result.push(line.substring(range.startColumn - 1, range.endColumn - 1));
                        }
                        else if (i === range.startLineNumber) {
                            result.push(line.substring(range.startColumn - 1));
                        }
                        else if (i === range.endLineNumber) {
                            result.push(line.substring(0, range.endColumn - 1));
                        }
                        else {
                            result.push(line);
                        }
                    }
                    return result;
                }
                for (const c of diff.changes) {
                    if (c.innerChanges) {
                        for (const x of c.innerChanges) {
                            result.push({
                                range: range_1.Range.fromPositions(addPositions(start, x.originalRange.getStartPosition()), addPositions(start, x.originalRange.getEndPosition())),
                                text: getText(modifiedLines, x.modifiedRange).join(model.eol)
                            });
                        }
                    }
                    else {
                        throw new errors_1.BugIndicatingError('The experimental diff algorithm always produces inner changes');
                    }
                }
            }
            if (typeof lastEol === 'number') {
                result.push({ eol: lastEol, text: '', range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
            }
            return result;
        }
        // ---- END minimal edits ---------------------------------------------------------------
        async computeLinks(modelUrl) {
            const model = this._getModel(modelUrl);
            if (!model) {
                return null;
            }
            return (0, linkComputer_1.computeLinks)(model);
        }
        // --- BEGIN default document colors -----------------------------------------------------------
        async computeDefaultDocumentColors(modelUrl) {
            const model = this._getModel(modelUrl);
            if (!model) {
                return null;
            }
            return (0, defaultDocumentColorsComputer_1.computeDefaultDocumentColors)(model);
        }
        // ---- BEGIN suggest --------------------------------------------------------------------------
        static { this._suggestionsLimit = 10000; }
        async textualSuggest(modelUrls, leadingWord, wordDef, wordDefFlags) {
            const sw = new stopwatch_1.StopWatch();
            const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
            const seen = new Set();
            outer: for (const url of modelUrls) {
                const model = this._getModel(url);
                if (!model) {
                    continue;
                }
                for (const word of model.words(wordDefRegExp)) {
                    if (word === leadingWord || !isNaN(Number(word))) {
                        continue;
                    }
                    seen.add(word);
                    if (seen.size > EditorSimpleWorker._suggestionsLimit) {
                        break outer;
                    }
                }
            }
            return { words: Array.from(seen), duration: sw.elapsed() };
        }
        // ---- END suggest --------------------------------------------------------------------------
        //#region -- word ranges --
        async computeWordRanges(modelUrl, range, wordDef, wordDefFlags) {
            const model = this._getModel(modelUrl);
            if (!model) {
                return Object.create(null);
            }
            const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
            const result = Object.create(null);
            for (let line = range.startLineNumber; line < range.endLineNumber; line++) {
                const words = model.getLineWords(line, wordDefRegExp);
                for (const word of words) {
                    if (!isNaN(Number(word.word))) {
                        continue;
                    }
                    let array = result[word.word];
                    if (!array) {
                        array = [];
                        result[word.word] = array;
                    }
                    array.push({
                        startLineNumber: line,
                        startColumn: word.startColumn,
                        endLineNumber: line,
                        endColumn: word.endColumn
                    });
                }
            }
            return result;
        }
        //#endregion
        async navigateValueSet(modelUrl, range, up, wordDef, wordDefFlags) {
            const model = this._getModel(modelUrl);
            if (!model) {
                return null;
            }
            const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
            if (range.startColumn === range.endColumn) {
                range = {
                    startLineNumber: range.startLineNumber,
                    startColumn: range.startColumn,
                    endLineNumber: range.endLineNumber,
                    endColumn: range.endColumn + 1
                };
            }
            const selectionText = model.getValueInRange(range);
            const wordRange = model.getWordAtPosition({ lineNumber: range.startLineNumber, column: range.startColumn }, wordDefRegExp);
            if (!wordRange) {
                return null;
            }
            const word = model.getValueInRange(wordRange);
            const result = inplaceReplaceSupport_1.BasicInplaceReplace.INSTANCE.navigateValueSet(range, selectionText, wordRange, word, up);
            return result;
        }
        // ---- BEGIN foreign module support --------------------------------------------------------------------------
        loadForeignModule(moduleId, createData, foreignHostMethods) {
            const proxyMethodRequest = (method, args) => {
                return this._host.fhr(method, args);
            };
            const foreignHost = (0, objects_1.createProxyObject)(foreignHostMethods, proxyMethodRequest);
            const ctx = {
                host: foreignHost,
                getMirrorModels: () => {
                    return this._getModels();
                }
            };
            if (this._foreignModuleFactory) {
                this._foreignModule = this._foreignModuleFactory(ctx, createData);
                // static foreing module
                return Promise.resolve((0, objects_1.getAllMethodNames)(this._foreignModule));
            }
            // ESM-comment-begin
            return new Promise((resolve, reject) => {
                require([moduleId], (foreignModule) => {
                    this._foreignModule = foreignModule.create(ctx, createData);
                    resolve((0, objects_1.getAllMethodNames)(this._foreignModule));
                }, reject);
            });
            // ESM-comment-end
            // ESM-uncomment-begin
            // return Promise.reject(new Error(`Unexpected usage`));
            // ESM-uncomment-end
        }
        // foreign method request
        fmr(method, args) {
            if (!this._foreignModule || typeof this._foreignModule[method] !== 'function') {
                return Promise.reject(new Error('Missing requestHandler or method: ' + method));
            }
            try {
                return Promise.resolve(this._foreignModule[method].apply(this._foreignModule, args));
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
    }
    exports.EditorSimpleWorker = EditorSimpleWorker;
    /**
     * Called on the worker side
     * @internal
     */
    function create(host) {
        return new EditorSimpleWorker(host, null);
    }
    exports.create = create;
    if (typeof importScripts === 'function') {
        // Running in a web worker
        globalThis.monaco = (0, editorBaseApi_1.createMonacoBaseAPI)();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU2ltcGxlV29ya2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3NlcnZpY2VzL2VkaXRvclNpbXBsZVdvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE0RmhHOztPQUVHO0lBQ0gsTUFBTSxXQUFZLFNBQVEsaUNBQWU7UUFFeEMsSUFBVyxHQUFHO1lBQ2IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxJQUFXLEdBQUc7WUFDYixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQztRQUVNLFFBQVE7WUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRU0sV0FBVyxDQUFDLEtBQWE7WUFDL0IsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakQsS0FBSyxNQUFNLEtBQUssSUFBSSxtQkFBbUIsRUFBRSxDQUFDO29CQUN6QyxJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDdEMsS0FBSyxDQUFD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
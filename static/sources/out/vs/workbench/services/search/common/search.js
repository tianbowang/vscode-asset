/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/glob", "vs/base/common/objects", "vs/base/common/extpath", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/base/common/path", "vs/base/common/errors", "vs/workbench/services/search/common/searchExtTypes", "vs/base/common/async"], function (require, exports, arrays_1, glob, objects, extpath, strings_1, instantiation_1, paths, errors_1, searchExtTypes_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasSiblingFn = exports.hasSiblingPromiseFn = exports.QueryGlobTester = exports.resolvePatternsForProvider = exports.SerializableFileMatch = exports.isFilePatternMatch = exports.isSerializedFileMatch = exports.isSerializedSearchSuccess = exports.isSerializedSearchComplete = exports.serializeSearchError = exports.deserializeSearchError = exports.SearchError = exports.SearchErrorCode = exports.pathIncludedInQuery = exports.getExcludes = exports.SearchSortOrder = exports.ViewMode = exports.OneLineRange = exports.SearchRange = exports.TextSearchMatch = exports.FileMatch = exports.SearchCompletionExitCode = exports.isProgressMessage = exports.isFileMatch = exports.resultIsMatch = exports.QueryType = exports.SearchProviderType = exports.ISearchService = exports.SEARCH_EXCLUDE_CONFIG = exports.SEARCH_RESULT_LANGUAGE_ID = exports.VIEW_ID = exports.PANEL_ID = exports.VIEWLET_ID = exports.TextSearchCompleteMessageType = void 0;
    Object.defineProperty(exports, "TextSearchCompleteMessageType", { enumerable: true, get: function () { return searchExtTypes_1.TextSearchCompleteMessageType; } });
    exports.VIEWLET_ID = 'workbench.view.search';
    exports.PANEL_ID = 'workbench.panel.search';
    exports.VIEW_ID = 'workbench.view.search';
    exports.SEARCH_RESULT_LANGUAGE_ID = 'search-result';
    exports.SEARCH_EXCLUDE_CONFIG = 'search.exclude';
    // Warning: this pattern is used in the search editor to detect offsets. If you
    // change this, also change the search-result built-in extension
    const SEARCH_ELIDED_PREFIX = '⟪ ';
    const SEARCH_ELIDED_SUFFIX = ' characters skipped ⟫';
    const SEARCH_ELIDED_MIN_LEN = (SEARCH_ELIDED_PREFIX.length + SEARCH_ELIDED_SUFFIX.length + 5) * 2;
    exports.ISearchService = (0, instantiation_1.createDecorator)('searchService');
    /**
     * TODO@roblou - split text from file search entirely, or share code in a more natural way.
     */
    var SearchProviderType;
    (function (SearchProviderType) {
        SearchProviderType[SearchProviderType["file"] = 0] = "file";
        SearchProviderType[SearchProviderType["text"] = 1] = "text";
    })(SearchProviderType || (exports.SearchProviderType = SearchProviderType = {}));
    var QueryType;
    (function (QueryType) {
        QueryType[QueryType["File"] = 1] = "File";
        QueryType[QueryType["Text"] = 2] = "Text";
    })(QueryType || (exports.QueryType = QueryType = {}));
    function resultIsMatch(result) {
        return !!result.preview;
    }
    exports.resultIsMatch = resultIsMatch;
    function isFileMatch(p) {
        return !!p.resource;
    }
    exports.isFileMatch = isFileMatch;
    function isProgressMessage(p) {
        return !!p.message;
    }
    exports.isProgressMessage = isProgressMessage;
    var SearchCompletionExitCode;
    (function (SearchCompletionExitCode) {
        SearchCompletionExitCode[SearchCompletionExitCode["Normal"] = 0] = "Normal";
        SearchCompletionExitCode[SearchCompletionExitCode["NewSearchStarted"] = 1] = "NewSearchStarted";
    })(SearchCompletionExitCode || (exports.SearchCompletionExitCode = SearchCompletionExitCode = {}));
    class FileMatch {
        constructor(resource) {
            this.resource = resource;
            this.results = [];
            // empty
        }
    }
    exports.FileMatch = FileMatch;
    class TextSearchMatch {
        constructor(text, range, previewOptions, webviewIndex) {
            this.ranges = range;
            this.webviewIndex = webviewIndex;
            // Trim preview if this is one match and a single-line match with a preview requested.
            // Otherwise send the full text, like for replace or for showing multiple previews.
            // TODO this is fishy.
            const ranges = Array.isArray(range) ? range : [range];
            if (previewOptions && previewOptions.matchLines === 1 && isSingleLineRangeList(ranges)) {
                // 1 line preview requested
                text = (0, strings_1.getNLines)(text, previewOptions.matchLines);
                let result = '';
                let shift = 0;
                let lastEnd = 0;
                const leadingChars = Math.floor(previewOptions.charsPerLine / 5);
                const matches = [];
                for (const range of ranges) {
                    const previewStart = Math.max(range.startColumn - leadingChars, 0);
                    const previewEnd = range.startColumn + previewOptions.charsPerLine;
                    if (previewStart > lastEnd + leadingChars + SEARCH_ELIDED_MIN_LEN) {
                        const elision = SEARCH_ELIDED_PREFIX + (previewStart - lastEnd) + SEARCH_ELIDED_SUFFIX;
                        result += elision + text.slice(previewStart, previewEnd);
                        shift += previewStart - (lastEnd + elision.length);
                    }
                    else {
                        result += text.slice(lastEnd, previewEnd);
                    }
                    matches.push(new OneLineRange(0, range.startColumn - shift, range.endColumn - shift));
                    lastEnd = previewEnd;
                }
                this.preview = { text: result, matches: Array.isArray(this.ranges) ? matches : matches[0] };
            }
            else {
                const firstMatchLine = Array.isArray(range) ? range[0].startLineNumber : range.startLineNumber;
                this.preview = {
                    text,
                    matches: (0, arrays_1.mapArrayOrNot)(range, r => new SearchRange(r.startLineNumber - firstMatchLine, r.startColumn, r.endLineNumber - firstMatchLine, r.endColumn))
                };
            }
        }
    }
    exports.TextSearchMatch = TextSearchMatch;
    function isSingleLineRangeList(ranges) {
        const line = ranges[0].startLineNumber;
        for (const r of ranges) {
            if (r.startLineNumber !== line || r.endLineNumber !== line) {
                return false;
            }
        }
        return true;
    }
    class SearchRange {
        constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
            this.startLineNumber = startLineNumber;
            this.startColumn = startColumn;
            this.endLineNumber = endLineNumber;
            this.endColumn = endColumn;
        }
    }
    exports.SearchRange = SearchRange;
    class OneLineRange extends SearchRange {
        constructor(lineNumber, startColumn, endColumn) {
            super(lineNumber, startColumn, lineNumber, endColumn);
        }
    }
    exports.OneLineRange = OneLineRange;
    var ViewMode;
    (function (ViewMode) {
        ViewMode["List"] = "list";
        ViewMode["Tree"] = "tree";
    })(ViewMode || (exports.ViewMode = ViewMode = {}));
    var SearchSortOrder;
    (function (SearchSortOrder) {
        SearchSortOrder["Default"] = "default";
        SearchSortOrder["FileNames"] = "fileNames";
        SearchSortOrder["Type"] = "type";
        SearchSortOrder["Modified"] = "modified";
        SearchSortOrder["CountDescending"] = "countDescending";
        SearchSortOrder["CountAscending"] = "countAscending";
    })(SearchSortOrder || (exports.SearchSortOrder = SearchSortOrder = {}));
    function getExcludes(configuration, includeSearchExcludes = true) {
        const fileExcludes = configuration && configuration.files && configuration.files.exclude;
        const searchExcludes = includeSearchExcludes && configuration && configuration.search && configuration.search.exclude;
        if (!fileExcludes && !searchExcludes) {
            return undefined;
        }
        if (!fileExcludes || !searchExcludes) {
            return fileExcludes || searchExcludes;
        }
        let allExcludes = Object.create(null);
        // clone the config as it could be frozen
        allExcludes = objects.mixin(allExcludes, objects.deepClone(fileExcludes));
        allExcludes = objects.mixin(allExcludes, objects.deepClone(searchExcludes), true);
        return allExcludes;
    }
    exports.getExcludes = getExcludes;
    function pathIncludedInQuery(queryProps, fsPath) {
        if (queryProps.excludePattern && glob.match(queryProps.excludePattern, fsPath)) {
            return false;
        }
        if (queryProps.includePattern || queryProps.usingSearchPaths) {
            if (queryProps.includePattern && glob.match(queryProps.includePattern, fsPath)) {
                return true;
            }
            // If searchPaths are being used, the extra file must be in a subfolder and match the pattern, if present
            if (queryProps.usingSearchPaths) {
                return !!queryProps.folderQueries && queryProps.folderQueries.some(fq => {
                    const searchPath = fq.folder.fsPath;
                    if (extpath.isEqualOrParent(fsPath, searchPath)) {
                        const relPath = paths.relative(searchPath, fsPath);
                        return !fq.includePattern || !!glob.match(fq.includePattern, relPath);
                    }
                    else {
                        return false;
                    }
                });
            }
            return false;
        }
        return true;
    }
    exports.pathIncludedInQuery = pathIncludedInQuery;
    var SearchErrorCode;
    (function (SearchErrorCode) {
        SearchErrorCode[SearchErrorCode["unknownEncoding"] = 1] = "unknownEncoding";
        SearchErrorCode[SearchErrorCode["regexParseError"] = 2] = "regexParseError";
        SearchErrorCode[SearchErrorCode["globParseError"] = 3] = "globParseError";
        SearchErrorCode[SearchErrorCode["invalidLiteral"] = 4] = "invalidLiteral";
        SearchErrorCode[SearchErrorCode["rgProcessError"] = 5] = "rgProcessError";
        SearchErrorCode[SearchErrorCode["other"] = 6] = "other";
        SearchErrorCode[SearchErrorCode["canceled"] = 7] = "canceled";
    })(SearchErrorCode || (exports.SearchErrorCode = SearchErrorCode = {}));
    class SearchError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.SearchError = SearchError;
    function deserializeSearchError(error) {
        const errorMsg = error.message;
        if ((0, errors_1.isCancellationError)(error)) {
            return new SearchError(errorMsg, SearchErrorCode.canceled);
        }
        try {
            const details = JSON.parse(errorMsg);
            return new SearchError(details.message, details.code);
        }
        catch (e) {
            return new SearchError(errorMsg, SearchErrorCode.other);
        }
    }
    exports.deserializeSearchError = deserializeSearchError;
    function serializeSearchError(searchError) {
        const details = { message: searchError.message, code: searchError.code };
        return new Error(JSON.stringify(details));
    }
    exports.serializeSearchError = serializeSearchError;
    function isSerializedSearchComplete(arg) {
        if (arg.type === 'error') {
            return true;
        }
        else if (arg.type === 'success') {
            return true;
        }
        else {
            return false;
        }
    }
    exports.isSerializedSearchComplete = isSerializedSearchComplete;
    function isSerializedSearchSuccess(arg) {
        return arg.type === 'success';
    }
    exports.isSerializedSearchSuccess = isSerializedSearchSuccess;
    function isSerializedFileMatch(arg) {
        return !!arg.path;
    }
    exports.isSerializedFileMatch = isSerializedFileMatch;
    function isFilePatternMatch(candidate, normalizedFilePatternLowercase) {
        const pathToMatch = candidate.searchPath ? candidate.searchPath : candidate.relativePath;
        return (0, strings_1.fuzzyContains)(pathToMatch, normalizedFilePatternLowercase);
    }
    exports.isFilePatternMatch = isFilePatternMatch;
    class SerializableFileMatch {
        constructor(path) {
            this.path = path;
            this.results = [];
        }
        addMatch(match) {
            this.results.push(match);
        }
        serialize() {
            return {
                path: this.path,
                results: this.results,
                numMatches: this.results.length
            };
        }
    }
    exports.SerializableFileMatch = SerializableFileMatch;
    /**
     *  Computes the patterns that the provider handles. Discards sibling clauses and 'false' patterns
     */
    function resolvePatternsForProvider(globalPattern, folderPattern) {
        const merged = {
            ...(globalPattern || {}),
            ...(folderPattern || {})
        };
        return Object.keys(merged)
            .filter(key => {
            const value = merged[key];
            return typeof value === 'boolean' && value;
        });
    }
    exports.resolvePatternsForProvider = resolvePatternsForProvider;
    class QueryGlobTester {
        constructor(config, folderQuery) {
            this._parsedIncludeExpression = null;
            this._excludeExpression = {
                ...(config.excludePattern || {}),
                ...(folderQuery.excludePattern || {})
            };
            this._parsedExcludeExpression = glob.parse(this._excludeExpression);
            // Empty includeExpression means include nothing, so no {} shortcuts
            let includeExpression = config.includePattern;
            if (folderQuery.includePattern) {
                if (includeExpression) {
                    includeExpression = {
                        ...includeExpression,
                        ...folderQuery.includePattern
                    };
                }
                else {
                    includeExpression = folderQuery.includePattern;
                }
            }
            if (includeExpression) {
                this._parsedIncludeExpression = glob.parse(includeExpression);
            }
        }
        matchesExcludesSync(testPath, basename, hasSibling) {
            if (this._parsedExcludeExpression && this._parsedExcludeExpression(testPath, basename, hasSibling)) {
                return true;
            }
            return false;
        }
        /**
         * Guaranteed sync - siblingsFn should not return a promise.
         */
        includedInQuerySync(testPath, basename, hasSibling) {
            if (this._parsedExcludeExpression && this._parsedExcludeExpression(testPath, basename, hasSibling)) {
                return false;
            }
            if (this._parsedIncludeExpression && !this._parsedIncludeExpression(testPath, basename, hasSibling)) {
                return false;
            }
            return true;
        }
        /**
         * Evaluating the exclude expression is only async if it includes sibling clauses. As an optimization, avoid doing anything with Promises
         * unless the expression is async.
         */
        includedInQuery(testPath, basename, hasSibling) {
            const excluded = this._parsedExcludeExpression(testPath, basename, hasSibling);
            const isIncluded = () => {
                return this._parsedIncludeExpression ?
                    !!(this._parsedIncludeExpression(testPath, basename, hasSibling)) :
                    true;
            };
            if ((0, async_1.isThenable)(excluded)) {
                return excluded.then(excluded => {
                    if (excluded) {
                        return false;
                    }
                    return isIncluded();
                });
            }
            return isIncluded();
        }
        hasSiblingExcludeClauses() {
            return hasSiblingClauses(this._excludeExpression);
        }
    }
    exports.QueryGlobTester = QueryGlobTester;
    function hasSiblingClauses(pattern) {
        for (const key in pattern) {
            if (typeof pattern[key] !== 'boolean') {
                return true;
            }
        }
        return false;
    }
    function hasSiblingPromiseFn(siblingsFn) {
        if (!siblingsFn) {
            return undefined;
        }
        let siblings;
        return (name) => {
            if (!siblings) {
                siblings = (siblingsFn() || Promise.resolve([]))
                    .then(list => list ? listToMap(list) : {});
            }
            return siblings.then(map => !!map[name]);
        };
    }
    exports.hasSiblingPromiseFn = hasSiblingPromiseFn;
    function hasSiblingFn(siblingsFn) {
        if (!siblingsFn) {
            return undefined;
        }
        let siblings;
        return (name) => {
            if (!siblings) {
                const list = siblingsFn();
                siblings = list ? listToMap(list) : {};
            }
            return !!siblings[name];
        };
    }
    exports.hasSiblingFn = hasSiblingFn;
    function listToMap(list) {
        const map = {};
        for (const key of list) {
            map[key] = true;
        }
        return map;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL2NvbW1vbi9zZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0J2Riw4R0FKQSw4Q0FBNkIsT0FJQTtJQUV6QixRQUFBLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQztJQUNyQyxRQUFBLFFBQVEsR0FBRyx3QkFBd0IsQ0FBQztJQUNwQyxRQUFBLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQztJQUNsQyxRQUFBLHlCQUF5QixHQUFHLGVBQWUsQ0FBQztJQUU1QyxRQUFBLHFCQUFxQixHQUFHLGdCQUFnQixDQUFDO0lBRXRELCtFQUErRTtJQUMvRSxnRUFBZ0U7SUFDaEUsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7SUFDbEMsTUFBTSxvQkFBb0IsR0FBRyx1QkFBdUIsQ0FBQztJQUNyRCxNQUFNLHFCQUFxQixHQUFHLENBQUMsb0JBQW9CLENBQUMsTUFBTSxHQUFHLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFckYsUUFBQSxjQUFjLEdBQUcsSUFBQSwrQkFBZSxFQUFpQixlQUFlLENBQUMsQ0FBQztJQWMvRTs7T0FFRztJQUNILElBQWtCLGtCQUdqQjtJQUhELFdBQWtCLGtCQUFrQjtRQUNuQywyREFBSSxDQUFBO1FBQ0osMkRBQUksQ0FBQTtJQUNMLENBQUMsRUFIaUIsa0JBQWtCLGtDQUFsQixrQkFBa0IsUUFHbkM7SUFxRUQsSUFBa0IsU0FHakI7SUFIRCxXQUFrQixTQUFTO1FBQzFCLHlDQUFRLENBQUE7UUFDUix5Q0FBUSxDQUFBO0lBQ1QsQ0FBQyxFQUhpQixTQUFTLHlCQUFULFNBQVMsUUFHMUI7SUEwRUQsU0FBZ0IsYUFBYSxDQUFDLE1BQXlCO1FBQ3RELE9BQU8sQ0FBQyxD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
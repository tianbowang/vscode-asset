/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/workbench/services/search/common/search"], function (require, exports, arrays_1, async_1, cancellation_1, errorMessage_1, network_1, path, resources, uri_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BatchedCollector = exports.extensionResultIsMatch = exports.TextSearchResultsCollector = exports.TextSearchManager = void 0;
    class TextSearchManager {
        constructor(query, provider, fileUtils, processType) {
            this.query = query;
            this.provider = provider;
            this.fileUtils = fileUtils;
            this.processType = processType;
            this.collector = null;
            this.isLimitHit = false;
            this.resultCount = 0;
        }
        search(onProgress, token) {
            const folderQueries = this.query.folderQueries || [];
            const tokenSource = new cancellation_1.CancellationTokenSource(token);
            return new Promise((resolve, reject) => {
                this.collector = new TextSearchResultsCollector(onProgress);
                let isCanceled = false;
                const onResult = (result, folderIdx) => {
                    if (isCanceled) {
                        return;
                    }
                    if (!this.isLimitHit) {
                        const resultSize = this.resultSize(result);
                        if (extensionResultIsMatch(result) && typeof this.query.maxResults === 'number' && this.resultCount + resultSize > this.query.maxResults) {
                            this.isLimitHit = true;
                            isCanceled = true;
                            tokenSource.cancel();
                            result = this.trimResultToSize(result, this.query.maxResults - this.resultCount);
                        }
                        const newResultSize = this.resultSize(result);
                        this.resultCount += newResultSize;
                        if (newResultSize > 0 || !extensionResultIsMatch(result)) {
                            this.collector.add(result, folderIdx);
                        }
                    }
                };
                // For each root folder
                Promise.all(folderQueries.map((fq, i) => {
                    return this.searchInFolder(fq, r => onResult(r, i), tokenSource.token);
                })).then(results => {
                    tokenSource.dispose();
                    this.collector.flush();
                    const someFolderHitLImit = results.some(result => !!result && !!result.limitHit);
                    resolve({
                        limitHit: this.isLimitHit || someFolderHitLImit,
                        messages: (0, arrays_1.flatten)(results.map(result => {
                            if (!result?.message) {
                                return [];
                            }
                            if (Array.isArray(result.message)) {
                                return result.message;
                            }
                            else {
                                return [result.message];
                            }
                        })),
                        stats: {
                            type: this.processType
                        }
                    });
                }, (err) => {
                    tokenSource.dispose();
                    const errMsg = (0, errorMessage_1.toErrorMessage)(err);
                    reject(new Error(errMsg));
                });
            });
        }
        resultSize(result) {
            if (extensionResultIsMatch(result)) {
                return Array.isArray(result.ranges) ?
                    result.ranges.length :
                    1;
            }
            else {
                // #104400 context lines shoudn't count towards result count
                return 0;
            }
        }
        trimResultToSize(result, size) {
            const rangesArr = Array.isArray(result.ranges) ? result.ranges : [result.ranges];
            const matchesArr = Array.isArray(result.preview.matches) ? result.preview.matches : [result.preview.matches];
            return {
                ranges: rangesArr.slice(0, size),
                preview: {
                    matches: matchesArr.slice(0, size),
                    text: result.preview.text
                },
                uri: result.uri
            };
        }
        async searchInFolder(folderQuery, onResult, token) {
            const queryTester = new search_1.QueryGlobTester(this.query, folderQuery);
            const testingPs = [];
            const progress = {
                report: (result) => {
                    if (!this.validateProviderResult(result)) {
                        return;
                    }
                    const hasSibling = folderQuery.folder.scheme === network_1.Schemas.file ?
                        (0, search_1.hasSiblingPromiseFn)(() => {
                            return this.fileUtils.readdir(resources.dirname(result.uri));
                        }) :
                        undefined;
                    const relativePath = resources.relativePath(folderQuery.folder, result.uri);
                    if (relativePath) {
                        // This method is only async when the exclude contains sibling clauses
                        const included = queryTester.includedInQuery(relativePath, path.basename(relativePath), hasSibling);
                        if ((0, async_1.isThenable)(included)) {
                            testingPs.push(included.then(isIncluded => {
                                if (isIncluded) {
                                    onResult(result);
                                }
                            }));
                        }
                        else if (included) {
                            onResult(result);
                        }
                    }
                }
            };
            const searchOptions = this.getSearchOptionsForFolder(folderQuery);
            const result = await this.provider.provideTextSearchResults(patternInfoToQuery(this.query.contentPattern), searchOptions, progress, token);
            if (testingPs.length) {
                await Promise.all(testingPs);
            }
            return result;
        }
        validateProviderResult(result) {
            if (extensionResultIsMatch(result)) {
                if (Array.isArray(result.ranges)) {
                    if (!Array.isArray(result.preview.matches)) {
                        console.warn('INVALID - A text search provider match\'s`ranges` and`matches` properties must have the same type.');
                        return false;
                    }
                    if (result.preview.matches.length !== result.ranges.length) {
                        console.warn('INVALID - A text search provider match\'s`ranges` and`matches` properties must have the same length.');
                        return false;
                    }
                }
                else {
                    if (Array.isArray(result.preview.matches)) {
                        console.warn('INVALID - A text search provider match\'s`ranges` and`matches` properties must have the same length.');
                        return false;
                    }
                }
            }
            return true;
        }
        getSearchOptionsForFolder(fq) {
            const includes = (0, search_1.resolvePatternsForProvider)(this.query.includePattern, fq.includePattern);
            const excludes = (0, search_1.resolvePatternsForProvider)(this.query.excludePattern, fq.excludePattern);
            const options = {
                folder: uri_1.URI.from(fq.folder),
                excludes,
                includes,
                useIgnoreFiles: !fq.disregardIgnoreFiles,
                useGlobalIgnoreFiles: !fq.disregardGlobalIgnoreFiles,
                useParentIgnoreFiles: !fq.disregardParentIgnoreFiles,
                followSymlinks: !fq.ignoreSymlinks,
                encoding: fq.fileEncoding && this.fileUtils.toCanonicalName(fq.fileEncoding),
                maxFileSize: this.query.maxFileSize,
                maxResults: this.query.maxResults,
                previewOptions: this.query.previewOptions,
                afterContext: this.query.afterContext,
                beforeContext: this.query.beforeContext
            };
            options.usePCRE2 = this.query.usePCRE2;
            return options;
        }
    }
    exports.TextSearchManager = TextSearchManager;
    function patternInfoToQuery(patternInfo) {
        return {
            isCaseSensitive: patternInfo.isCaseSensitive || false,
            isRegExp: patternInfo.isRegExp || false,
            isWordMatch: patternInfo.isWordMatch || false,
            isMultiline: patternInfo.isMultiline || false,
            pattern: patternInfo.pattern
        };
    }
    class TextSearchResultsCollector {
        constructor(_onResult) {
            this._onResult = _onResult;
            this._currentFolderIdx = -1;
            this._currentFileMatch = null;
            this._batchedCollector = new BatchedCollector(512, items => this.sendItems(items));
        }
        add(data, folderIdx) {
            // Collects TextSearchResults into IInternalFileMatches and collates using BatchedCollector.
            // This is efficient for ripgrep which sends results back one file at a time. It wouldn't be efficient for other search
            // providers that send results in random order. We could do this step afterwards instead.
            if (this._currentFileMatch && (this._currentFolderIdx !== folderIdx || !resources.isEqual(this._currentUri, data.uri))) {
                this.pushToCollector();
                this._currentFileMatch = null;
            }
            if (!this._currentFileMatch) {
                this._currentFolderIdx = folderIdx;
                this._currentFileMatch = {
                    resource: data.uri,
                    results: []
                };
            }
            this._currentFileMatch.results.push(extensionResultToFrontendResult(data));
        }
        pushToCollector() {
            const size = this._currentFileMatch && this._currentFileMatch.results ?
                this._currentFileMatch.results.length :
                0;
            this._batchedCollector.addItem(this._currentFileMatch, size);
        }
        flush() {
            this.pushToCollector();
            this._batchedCollector.flush();
        }
        sendItems(items) {
            this._onResult(items);
        }
    }
    exports.TextSearchResultsCollector = TextSearchResultsCollector;
    function extensionResultToFrontendResult(data) {
        // Warning: result from RipgrepTextSearchEH has fake Range. Don't depend on any other props beyond these...
        if (extensionResultIsMatch(data)) {
            return {
                preview: {
                    matches: (0, arrays_1.mapArrayOrNot)(data.preview.matches, m => ({
                        startLineNumber: m.start.line,
                        startColumn: m.start.character,
                        endLineNumber: m.end.line,
                        endColumn: m.end.character
                    })),
                    text: data.preview.text
                },
                ranges: (0, arrays_1.mapArrayOrNot)(data.ranges, r => ({
                    startLineNumber: r.start.line,
                    startColumn: r.start.character,
                    endLineNumber: r.end.line,
                    endColumn: r.end.character
                }))
            };
        }
        else {
            return {
                text: data.text,
                lineNumber: data.lineNumber
            };
        }
    }
    function extensionResultIsMatch(data) {
        return !!data.preview;
    }
    exports.extensionResultIsMatch = extensionResultIsMatch;
    /**
     * Collects items that have a size - before the cumulative size of collected items reaches START_BATCH_AFTER_COUNT, the callback is called for every
     * set of items collected.
     * But after that point, the callback is called with batches of maxBatchSize.
     * If the batch isn't filled within some time, the callback is also called.
     */
    class BatchedCollector {
        static { this.TIMEOUT = 4000; }
        // After START_BATCH_AFTER_COUNT items have been collected, stop flushing on timeout
        static { this.START_BATCH_AFTER_COUNT = 50; }
        constructor(maxBatchSize, cb) {
            this.maxBatchSize = maxBatchSize;
            this.cb = cb;
            this.totalNumberCompleted = 0;
            this.batch = [];
            this.batchSize = 0;
        }
        addItem(item, size) {
            if (!item) {
                return;
            }
            this.addItemToBatch(item, size);
        }
        addItems(items, size) {
            if (!items) {
                return;
            }
            this.addItemsToBatch(items, size);
        }
        addItemToBatch(item, size) {
            this.batch.push(item);
            this.batchSize += size;
            this.onUpdate();
        }
        addItemsToBatch(item, size) {
            this.batch = this.batch.concat(item);
            this.batchSize += size;
            this.onUpdate();
        }
        onUpdate() {
            if (this.totalNumberCompleted < BatchedCollector.START_BATCH_AFTER_COUNT) {
                // Flush because we aren't batching yet
                this.flush();
            }
            else if (this.batchSize >= this.maxBatchSize) {
                // Flush because the batch is full
                this.flush();
            }
            else if (!this.timeoutHandle) {
                // No timeout running, start a timeout to flush
                this.timeoutHandle = setTimeout(() => {
                    this.flush();
                }, BatchedCollector.TIMEOUT);
            }
        }
        flush() {
            if (this.batchSize) {
                this.totalNumberCompleted += this.batchSize;
                this.cb(this.batch);
                this.batch = [];
                this.batchSize = 0;
                if (this.timeoutHandle) {
                    clearTimeout(this.timeoutHandle);
                    this.timeoutHandle = 0;
                }
            }
        }
    }
    exports.BatchedCollector = BatchedCollector;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFNlYXJjaE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvY29tbW9uL3RleHRTZWFyY2hNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsTUFBYSxpQkFBaUI7UUFPN0IsWUFBb0IsS0FBaUIsRUFBVSxRQUE0QixFQUFVLFNBQXFCLEVBQVUsV0FBcUM7WUFBckksVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUFVLGFBQVEsR0FBUixRQUFRLENBQW9CO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBWTtZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUEwQjtZQUxqSixjQUFTLEdBQXNDLElBQUksQ0FBQztZQUVwRCxlQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ25CLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBRXFJLENBQUM7UUFFOUosTUFBTSxDQUFDLFVBQTJDLEVBQUUsS0FBd0I7WUFDM0UsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDO1lBQ3JELE1BQU0sV0FBVyxHQUFHLElBQUksc0NBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFdkQsT0FBTyxJQUFJLE9BQU8sQ0FBdUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSwwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFNUQsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUN2QixNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQXdCLEVBQUUsU0FBaUIsRUFBRSxFQUFFO29CQUNoRSxJQUFJLFVBQVUsRUFBRSxDQUFDO3dCQUNoQixPQUFPO29CQUNSLENBQUM7b0JBRUQsSUFBSSxDQUFDLElBQUksQ0FB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
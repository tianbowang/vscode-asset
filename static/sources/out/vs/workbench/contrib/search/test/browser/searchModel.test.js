define(["require", "exports", "assert", "sinon", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/services/search/common/search", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/contrib/search/browser/searchModel", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/label/common/label", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/contrib/search/test/browser/searchTestCommon", "vs/workbench/contrib/search/browser/notebookSearch/searchNotebookHelpers", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/editor/common/model", "vs/base/common/map", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/search/common/notebookSearch", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/services/editor/common/editorService", "vs/base/test/common/utils"], function (require, exports, assert, sinon, arrays, async_1, cancellation_1, uri_1, range_1, model_1, modelService_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, search_1, telemetry_1, telemetryUtils_1, searchModel_1, themeService_1, testThemeService_1, fileService_1, log_1, uriIdentity_1, uriIdentityService_1, label_1, notebookEditorService_1, editorGroupsService_1, workbenchTestServices_1, notebookEditorServiceImpl_1, searchTestCommon_1, searchNotebookHelpers_1, notebookCommon_1, model_2, map_1, notebookService_1, notebookSearch_1, contextkey_1, mockKeybindingService_1, editorService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const nullEvent = new class {
        constructor() {
            this.id = -1;
        }
        stop() {
            return;
        }
        timeTaken() {
            return -1;
        }
    };
    const lineOneRange = new search_1.OneLineRange(1, 0, 1);
    suite('SearchModel', () => {
        let instantiationService;
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const testSearchStats = {
            fromCache: false,
            resultCount: 1,
            type: 'searchProcess',
            detailStats: {
                fileWalkTime: 0,
                cmdTime: 0,
                cmdResultCount: 0,
                directoriesWalked: 2,
                filesWalked: 3
            }
        };
        const folderQueries = [
            { folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)() }
        ];
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(label_1.ILabelService, { getUriBasenameLabel: (uri) => '' });
            instantiationService.stub(notebookService_1.INotebookService, { getNotebookTextModels: () => [] });
            instantiationService.stub(model_1.IModelService, stubModelService(instantiationService));
            instantiationService.stub(notebookEditorService_1.INotebookEditorService, stubNotebookEditorService(instantiationService));
            instantiationService.stub(search_1.ISearchService, {});
            instantiationService.stub(search_1.ISearchService, 'textSearch', Promise.resolve({ results: [] }));
            const fileService = new fileService_1.FileService(new log_1.NullLogService());
            store.add(fileService);
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            store.add(uriIdentityService);
            instantiationService.stub(uriIdentity_1.IUriIdentityService, uriIdentityService);
            instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
        });
        teardown(() => sinon.restore());
        function searchServiceWithResults(results, complete = null) {
            return {
                textSearch(query, token, onProgress, notebookURIs) {
                    return new Promise(resolve => {
                        queueMicrotask(() => {
                            results.forEach(onProgress);
                            resolve(complete);
                        });
                    });
                },
                fileSearch(query, token) {
                    return new Promise(resolve => {
                        queueMicrotask(() => {
                            resolve({ results: results, messages: [] });
                        });
                    });
                },
                textSearchSplitSyncAsync(query, token, onProgress) {
                    return {
                        syncResults: {
                            results: [],
                            messages: []
                        },
                        asyncResults: new Promise(resolve => {
                            queueMicrotask(() => {
                                results.forEach(onProgress);
                                resolve(complete);
                            });
                        })
                    };
                }
            };
        }
        function searchServiceWithError(error) {
            return {
                textSearch(query, token, onProgress) {
                    return new Promise((resolve, reject) => {
                        reject(error);
                    });
                },
                fileSearch(query, token) {
                    return new Promise((resolve, reject) => {
                        queueMicrotask(() => {
                            reject(error);
                        });
                    });
                },
                textSearchSplitSyncAsync(query, token, onProgress) {
                    return {
                        syncResults: {
                            results: [],
                            messages: []
                        },
                        asyncResults: new Promise((resolve, reject) => {
                            reject(error);
                        })
                    };
                }
            };
        }
        function canceleableSearchService(tokenSource) {
            return {
                textSearch(query, token, onProgress) {
                    const disposable = token?.onCancellationRequested(() => tokenSource.cancel());
                    if (disposable) {
                        store.add(disposable);
                    }
                    return this.textSearchSplitSyncAsync(query, token, onProgress).asyncResults;
                },
                fileSearch(query, token) {
                    const disposable = token?.onCancellationRequested(() => tokenSource.cancel());
                    if (disposable) {
                        store.add(disposable);
                    }
                    return new Promise(resolve => {
                        queueMicrotask(() => {
                            resolve({});
                        });
                    });
                },
                textSearchSplitSyncAsync(query, token, onProgress) {
                    const disposable = token?.onCancellationRequested(() => tokenSource.cancel());
                    if (disposable) {
                        store.add(disposable);
                    }
                    return {
                        syncResults: {
                            results: [],
                            messages: []
                        },
                        asyncResults: new Promise(resolve => {
                            queueMicrotask(() => {
                                resolve({
                                    results: [],
                                    messages: []
                                });
                            });
                        })
                    };
                }
            };
        }
        function searchServiceWithDeferredPromise(p) {
            return {
                textSearchSplitSyncAsync(query, token, onProgress) {
                    return {
                        syncResults: {
                            results: [],
                            messages: []
                        },
                        asyncResults: p,
                    };
                }
            };
        }
        function notebookSearchServiceWithInfo(results, tokenSource) {
            return {
                _serviceBrand: undefined,
                notebookSearch(query, token, searchInstanceID, onProgress) {
                    const disposable = token?.onCancellationRequested(() => tokenSource?.cancel());
                    if (disposable) {
                        store.add(disposable);
                    }
                    const localResults = new map_1.ResourceMap(uri => uri.path);
                    results.forEach(r => {
                        localResults.set(r.resource, r);
                    });
                    if (onProgress) {
                        arrays.coalesce([...localResults.values()]).forEach(onProgress);
                    }
                    return {
                        openFilesToScan: new map_1.ResourceSet([...localResults.keys()]),
                        completeData: Promise.resolve({
                            messages: [],
                            results: arrays.coalesce([...localResults.values()]),
                            limitHit: false
                        }),
                        allScannedFiles: Promise.resolve(new map_1.ResourceSet()),
                    };
                }
            };
        }
        test('Search Model: Search adds to results', async () => {
            const results = [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)), new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11))),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ];
            instantiationService.stub(search_1.ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(testObject);
            await testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            const actual = testObject.searchResult.matches();
            assert.strictEqual(2, actual.length);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/1`).toString(), actual[0].resource.toString());
            let actuaMatches = actual[0].matches();
            assert.strictEqual(2, actuaMatches.length);
            assert.strictEqual('preview 1', actuaMatches[0].text());
            assert.ok(new range_1.Range(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
            assert.strictEqual('preview 1', actuaMatches[1].text());
            assert.ok(new range_1.Range(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
            actuaMatches = actual[1].matches();
            assert.strictEqual(1, actuaMatches.length);
            assert.strictEqual('preview 2', actuaMatches[0].text());
            assert.ok(new range_1.Range(2, 1, 2, 2).equalsRange(actuaMatches[0].range()));
        });
        test('Search Model: Search can return notebook results', async () => {
            const results = [
                aRawMatch('/2', new search_1.TextSearchMatch('test', new search_1.OneLineRange(1, 1, 5)), new search_1.TextSearchMatch('this is a test', new search_1.OneLineRange(1, 11, 15))),
                aRawMatch('/3', new search_1.TextSearchMatch('test', lineOneRange))
            ];
            instantiationService.stub(search_1.ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
            sinon.stub(searchModel_1.CellMatch.prototype, 'addContext');
            const mdInputCell = {
                cellKind: notebookCommon_1.CellKind.Markup, textBuffer: {
                    getLineContent(lineNumber) {
                        if (lineNumber === 1) {
                            return '# Test';
                        }
                        else {
                            return '';
                        }
                    }
                },
                id: 'mdInputCell'
            };
            const findMatchMds = [new model_2.FindMatch(new range_1.Range(1, 3, 1, 7), ['Test'])];
            const codeCell = {
                cellKind: notebookCommon_1.CellKind.Code, textBuffer: {
                    getLineContent(lineNumber) {
                        if (lineNumber === 1) {
                            return 'print("test! testing!!")';
                        }
                        else {
                            return '';
                        }
                    }
                },
                id: 'codeCell'
            };
            const findMatchCodeCells = [new model_2.FindMatch(new range_1.Range(1, 8, 1, 12), ['test']),
                new model_2.FindMatch(new range_1.Range(1, 14, 1, 18), ['test']),
            ];
            const webviewMatches = [{
                    index: 0,
                    searchPreviewInfo: {
                        line: 'test! testing!!',
                        range: {
                            start: 1,
                            end: 5
                        }
                    }
                },
                {
                    index: 1,
                    searchPreviewInfo: {
                        line: 'test! testing!!',
                        range: {
                            start: 7,
                            end: 11
                        }
                    }
                }
            ];
            const cellMatchMd = {
                cell: mdInputCell,
                index: 0,
                contentResults: (0, searchNotebookHelpers_1.contentMatchesToTextSearchMatches)(findMatchMds, mdInputCell),
                webviewResults: []
            };
            const cellMatchCode = {
                cell: codeCell,
                index: 1,
                contentResults: (0, searchNotebookHelpers_1.contentMatchesToTextSearchMatches)(findMatchCodeCells, codeCell),
                webviewResults: (0, searchNotebookHelpers_1.webviewMatchesToTextSearchMatches)(webviewMatches),
            };
            const notebookSearchService = instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([aRawMatchWithCells('/1', cellMatchMd, cellMatchCode)], undefined));
            const notebookSearch = sinon.spy(notebookSearchService, "notebookSearch");
            const model = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(model);
            await model.search({ contentPattern: { pattern: 'test' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            const actual = model.searchResult.matches();
            assert(notebookSearch.calledOnce);
            assert.strictEqual(3, actual.length);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/1`).toString(), actual[0].resource.toString());
            const notebookFileMatches = actual[0].matches();
            assert.ok(notebookFileMatches[0].range().equalsRange(new range_1.Range(1, 3, 1, 7)));
            assert.ok(notebookFileMatches[1].range().equalsRange(new range_1.Range(1, 8, 1, 12)));
            assert.ok(notebookFileMatches[2].range().equalsRange(new range_1.Range(1, 14, 1, 18)));
            assert.ok(notebookFileMatches[3].range().equalsRange(new range_1.Range(1, 2, 1, 6)));
            assert.ok(notebookFileMatches[4].range().equalsRange(new range_1.Range(1, 8, 1, 12)));
            notebookFileMatches.forEach(match => match instanceof searchModel_1.MatchInNotebook);
            assert(notebookFileMatches[0].cell?.id === 'mdInputCell');
            assert(notebookFileMatches[1].cell?.id === 'codeCell');
            assert(notebookFileMatches[2].cell?.id === 'codeCell');
            assert(notebookFileMatches[3].cell?.id === 'codeCell');
            assert(notebookFileMatches[4].cell?.id === 'codeCell');
            const mdCellMatchProcessed = notebookFileMatches[0].cellParent;
            const codeCellMatchProcessed = notebookFileMatches[1].cellParent;
            assert(mdCellMatchProcessed.contentMatches.length === 1);
            assert(codeCellMatchProcessed.contentMatches.length === 2);
            assert(codeCellMatchProcessed.webviewMatches.length === 2);
            assert(mdCellMatchProcessed.contentMatches[0] === notebookFileMatches[0]);
            assert(codeCellMatchProcessed.contentMatches[0] === notebookFileMatches[1]);
            assert(codeCellMatchProcessed.contentMatches[1] === notebookFileMatches[2]);
            assert(codeCellMatchProcessed.webviewMatches[0] === notebookFileMatches[3]);
            assert(codeCellMatchProcessed.webviewMatches[1] === notebookFileMatches[4]);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/2`).toString(), actual[1].resource.toString());
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/3`).toString(), actual[2].resource.toString());
        });
        test('Search Model: Search reports telemetry on search completed', async () => {
            const target = instantiationService.spy(telemetry_1.ITelemetryService, 'publicLog');
            const results = [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)), new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11))),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ];
            instantiationService.stub(search_1.ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(testObject);
            await testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            assert.ok(target.calledThrice);
            assert.ok(target.calledWith('searchResultsFirstRender'));
            assert.ok(target.calledWith('searchResultsFinished'));
        });
        test('Search Model: Search reports timed telemetry on search when progress is not called', () => {
            const target2 = sinon.spy();
            sinon.stub(nullEvent, 'stop').callsFake(target2);
            const target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.ITelemetryService, 'publicLog', target1);
            instantiationService.stub(search_1.ISearchService, searchServiceWithResults([], { limitHit: false, messages: [], results: [] }));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(testObject);
            const result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            return result.then(() => {
                return (0, async_1.timeout)(1).then(() => {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                });
            });
        });
        test('Search Model: Search reports timed telemetry on search when progress is called', () => {
            const target2 = sinon.spy();
            sinon.stub(nullEvent, 'stop').callsFake(target2);
            const target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.ITelemetryService, 'publicLog', target1);
            instantiationService.stub(search_1.ISearchService, searchServiceWithResults([aRawMatch('/1', new search_1.TextSearchMatch('some preview', lineOneRange))], { results: [], stats: testSearchStats, messages: [] }));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(testObject);
            const result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            return result.then(() => {
                return (0, async_1.timeout)(1).then(() => {
                    // timeout because promise handlers may run in a different order. We only care that these
                    // are fired at some point.
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                    // assert.strictEqual(1, target2.callCount);
                });
            });
        });
        test('Search Model: Search reports timed telemetry on search when error is called', () => {
            const target2 = sinon.spy();
            sinon.stub(nullEvent, 'stop').callsFake(target2);
            const target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.ITelemetryService, 'publicLog', target1);
            instantiationService.stub(search_1.ISearchService, searchServiceWithError(new Error('This error should be thrown by this test.')));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(testObject);
            const result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            return result.then(() => { }, () => {
                return (0, async_1.timeout)(1).then(() => {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                });
            });
        });
        test('Search Model: Search reports timed telemetry on search when error is cancelled error', () => {
            const target2 = sinon.spy();
            sinon.stub(nullEvent, 'stop').callsFake(target2);
            const target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.ITelemetryService, 'publicLog', target1);
            const deferredPromise = new async_1.DeferredPromise();
            instantiationService.stub(search_1.ISearchService, searchServiceWithDeferredPromise(deferredPromise.p));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(testObject);
            const result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            deferredPromise.cancel();
            return result.then(() => { }, async () => {
                return (0, async_1.timeout)(1).then(() => {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                    // assert.ok(target2.calledOnce);
                });
            });
        });
        test('Search Model: Search results are cleared during search', async () => {
            const results = [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)), new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11))),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ];
            instantiationService.stub(search_1.ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results: [] }));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(testObject);
            await testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            assert.ok(!testObject.searchResult.isEmpty());
            instantiationService.stub(search_1.ISearchService, searchServiceWithResults([]));
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries });
            assert.ok(testObject.searchResult.isEmpty());
        });
        test('Search Model: Previous search is cancelled when new search is called', async () => {
            const tokenSource = new cancellation_1.CancellationTokenSource();
            store.add(tokenSource);
            instantiationService.stub(search_1.ISearchService, canceleableSearchService(tokenSource));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], tokenSource));
            const testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(testObject);
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries });
            instantiationService.stub(search_1.ISearchService, searchServiceWithResults([]));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], undefined));
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 2 /* QueryType.Text */, folderQueries });
            assert.ok(tokenSource.token.isCancellationRequested);
        });
        test('getReplaceString returns proper replace string for regExpressions', async () => {
            const results = [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)), new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11)))
            ];
            instantiationService.stub(search_1.ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
            instantiationService.stub(notebookSearch_1.INotebookSearchService, notebookSearchServiceWithInfo([], undefined));
            const testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(testObject);
            await testObject.search({ contentPattern: { pattern: 're' }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            testObject.replaceString = 'hello';
            let match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('hello', match.replaceString);
            await testObject.search({ contentPattern: { pattern: 're', isRegExp: true }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('hello', match.replaceString);
            await testObject.search({ contentPattern: { pattern: 're(?:vi)', isRegExp: true }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('hello', match.replaceString);
            await testObject.search({ contentPattern: { pattern: 'r(e)(?:vi)', isRegExp: true }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('hello', match.replaceString);
            await testObject.search({ contentPattern: { pattern: 'r(e)(?:vi)', isRegExp: true }, type: 2 /* QueryType.Text */, folderQueries }).asyncResults;
            testObject.replaceString = 'hello$1';
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.strictEqual('helloe', match.replaceString);
        });
        function aRawMatch(resource, ...results) {
            return { resource: (0, searchTestCommon_1.createFileUriFromPathFromRoot)(resource), results };
        }
        function aRawMatchWithCells(resource, ...cells) {
            return { resource: (0, searchTestCommon_1.createFileUriFromPathFromRoot)(resource), cellResults: cells };
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
            const config = new testConfigurationService_1.TestConfigurationService();
            config.setUserConfiguration('search', { searchOnType: true });
            instantiationService.stub(configuration_1.IConfigurationService, config);
            const modelService = instantiationService.createInstance(modelService_1.ModelService);
            store.add(modelService);
            return modelService;
        }
        function stubNotebookEditorService(instantiationService) {
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, new workbenchTestServices_1.TestEditorGroupsService());
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            instantiationService.stub(editorService_1.IEditorService, store.add(new workbenchTestServices_1.TestEditorService()));
            const notebookEditorWidgetService = instantiationService.createInstance(notebookEditorServiceImpl_1.NotebookEditorWidgetService);
            store.add(notebookEditorWidgetService);
            return notebookEditorWidgetService;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoTW9kZWwudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL3Rlc3QvYnJvd3Nlci9zZWFyY2hNb2RlbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQTRDQSxNQUFNLFNBQVMsR0FBRyxJQUFJO1FBQUE7WUFDckIsT0FBRSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBZ0JqQixDQUFDO1FBUEEsSUFBSTtZQUNILE9BQU87UUFDUixDQUFDO1FBRUQsU0FBUztZQUNSLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO0tBQ0QsQ0FBQztJQUVGLE1BQU0sWUFBWSxHQUFHLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRS9DLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1FBRXpCLElBQUksb0JBQThDLENBQUM7UUFDbkQsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXhELE1BQU0sZUFBZSxHQUFxQjtZQUN6QyxTQUFTLEVBQUUsS0FBSztZQUNoQixXQUFXLEVBQUUsQ0FBQztZQUNkLElBQUksRUFBRSxlQUFlO1lBQ3JCLFdBQVcsRUFBRTtnQkFDWixZQUFZLEVBQUUsQ0FBQztnQkFDZixPQUFPLEVBQUUsQ0FBQztnQkFDVixjQUFjLEVBQUUsQ0FBQztnQkFDakIsaUJBQWlCLEVBQUUsQ0FBQztnQkFDcEIsV0FBVyxFQUFFLENBQUM7YUFDZDtTQUNELENBQUM7UUFFRixNQUFNLGFBQWEsR0FBbUI7WUFDckMsRUFBRSxNQUFNLEVBQUUsSUFBQSxnREFBNkIsR0FBRSxFQUFFO1NBQzNDLENBQUM7UUFFRixLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1Ysb0JBQW9CLEdBQUcsSUFBSSxtREFBd0IsRUFBRSxDQUFDO1lBQ3RELG9CQUFvQixDQUFDLElBQUksQ0FBQyw2QkFBaUIsRUFBRSxxQ0FBb0IsQ0FBQyxDQUFDO1lBQ25FLG9CQUFvQixDQUFDLElBQUksQ0FBQyxxQkFBYSxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxHQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGtDQUFnQixFQUFFLEVBQUUscUJBQXFCLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNqRixvQkFBb0IsQ0FBQyxJQUFJLENBQUMscUJBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDakYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDhDQUFzQixFQUFFLHlCQUF5QixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNuRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUJBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUJBQWMsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUYsTUFBTSxXQUFXLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUM7WUFDMUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2QixNQUFNLGtCQUFrQixHQUFHLElBQUksdUNBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzlCLG9CQUFvQixDQUFDLElBQUksQ0FBQyxpQ0FBbUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ25FLG9CQUFvQixDQUFDLElBQUksQ0FBQyxpQkFBVyxFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFaEMsU0FBUyx3QkFBd0IsQ0FBQyxPQUFxQixFQUFFLFdBQW1DLElBQUk7WUFDL0YsT0FBdUI7Z0JBQ3RCLFVBQVUsQ0FBQyxLQUFtQixFQUFFLEtBQXlCLEVBQUUsVUFBa0QsRUFBRSxZQUEwQjtvQkFDeEksT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDNUIsY0FBYyxDQUFDLEdBQUcsRUFBRTs0QkFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFXLENBQUMsQ0FBQzs0QkFDN0IsT0FBTyxDQUFDLFFBQVMsQ0FBQyxDQUFDO3dCQUNwQixDQUFDLENBQUMsQ0FBQztvQkFDSixDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDO2dCQUNELFVBQVUsQ0FBQyxLQUFpQixFQUFFLEtBQXlCO29CQUN0RCxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUM1QixjQUFjLENBQUMsR0FBRyxFQUFFOzRCQUNuQixPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUM3QyxDQUFDLENBQUMsQ0FBQztvQkFFSixDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDO2dCQUNELHdCQUF3QixDQUFDLEtBQWlCLEVBQUUsS0FBcUMsRUFBRSxVQUFnRTtvQkFDbEosT0FBTzt3QkFDTixXQUFXLEVBQUU7NEJBQ1osT0FBTyxFQUFFLEVBQUU7NEJBQ1gsUUFBUSxFQUFFLEVBQUU7eUJBQ1o7d0JBQ0QsWUFBWSxFQUFFLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUNuQyxjQUFjLENBQUMsR0FBRyxFQUFFO2dDQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVcsQ0FBQyxDQUFDO2dDQUM3QixPQUFPLENBQUMsUUFBUyxDQUFDLENBQUM7NEJBQ3BCLENBQUMsQ0FBQyxDQUFDO3dCQUNKLENBQUMsQ0FBQztxQkFDRixDQUFDO2dCQUNILENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztRQUVELFNBQVMsc0JBQXNCLENBQUMsS0FBWTtZQUMzQyxPQUF1QjtnQkFDdEIsVUFBVSxDQUFDLEtBQW1CLEVBQUUsS0FBeUIsRUFBRSxVQUFrRDtvQkFDNUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDdEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNmLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUM7Z0JBQ0QsVUFBVSxDQUFDLEtBQWlCLEVBQUUsS0FBeUI7b0JBQ3RELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQ3RDLGNBQWMsQ0FBQyxHQUFHLEVBQUU7NEJBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDZixDQUFDLENBQUMsQ0FBQztvQkFDSixDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDO2dCQUNELHdCQUF3QixDQUFDLEtBQWlCLEVBQUUsS0FBcUMsRUFBRSxVQUFnRTtvQkFDbEosT0FBTzt3QkFDTixXQUFXLEVBQUU7NEJBQ1osT0FBTyxFQUFFLEVBQUU7NEJBQ1gsUUFBUSxFQUFFLEVBQUU7eUJBQ1o7d0JBQ0QsWUFBWSxFQUFFLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFOzRCQUM3QyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2YsQ0FBQyxDQUFDO3FCQUNGLENBQUM7Z0JBQ0gsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBRUQsU0FBUyx3QkFBd0IsQ0FBQyxXQUFvQztZQUNyRSxPQUF1QjtnQkFDdEIsVUFBVSxDQUFDLEtBQWlCLEVBQUUsS0FBeUIsRUFBRSxVQUFrRDtvQkFDMUcsTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO29CQUM5RSxJQUFJLFVBQVUsRUFBRSxDQUFDO3dCQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN2QixDQUFDO29CQUVELE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsWUFBWSxDQUFDO2dCQUM3RSxDQUFDO2dCQUNELFVBQVUsQ0FBQyxLQUFpQixFQUFFLEtBQXlCO29CQUN0RCxNQUFNLFVBQVUsR0FBRyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7b0JBQzlFLElBQUksVUFBVSxFQUFFLENBQUM7d0JBQ2hCLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3ZCLENBQUM7b0JBQ0QsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDNUIsY0FBYyxDQUFDLEdBQUcsRUFBRTs0QkFDbkIsT0FBTyxDQUFNLEVBQUUsQ0FBQyxDQUFDO3dCQUNsQixDQUFDLENBQUMsQ0FBQztvQkFDSixDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDO2dCQUNELHdCQUF3QixDQUFDLEtBQWlCLEVBQUUsS0FBcUMsRUFBRSxVQUFnRTtvQkFDbEosTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO29CQUM5RSxJQUFJLFVBQVUsRUFBRSxDQUFDO3dCQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN2QixDQUFDO29CQUNELE9BQU87d0JBQ04sV0FBVyxFQUFFOzRCQUNaLE9BQU8sRUFBRSxFQUFFOzRCQUNYLFFBQVEsRUFBRSxFQUFFO3lCQUNaO3dCQUNELFlBQVksRUFBRSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTs0QkFDbkMsY0FBYyxDQUFDLEdBQUcsRUFBRTtnQ0FDbkIsT0FBTyxDQUFNO29DQUNaLE9BQU8sRUFBRSxFQUFFO29DQUNYLFFBQVEsRUFBRSxFQUFFO2lDQUNaLENBQUMsQ0FBQzs0QkFDSixDQUFDLENBQUMsQ0FBQzt3QkFDSixDQUFDLENBQUM7cUJBQ0YsQ0FBQztnQkFDSCxDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFFRCxTQUFTLGdDQUFnQyxDQUFDLENBQTJCO1lBQ3BFLE9BQXVCO2dCQUN0Qix3QkFBd0IsQ0FBQyxLQUFpQixFQUFFLEtBQXFDLEVBQUUsVUFBZ0U7b0JBQ2xKLE9BQU87d0JBQ04sV0FBVyxFQUFFOzRCQUNaLE9BQU8sRUFBRSxFQUFFOzRCQUNYLFFBQVEsRUFBRSxFQUFFO3lCQUNaO3dCQUNELFlBQVksRUFBRSxDQUFDO3FCQUNmLENBQUM7Z0JBQ0gsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBR0QsU0FBUyw2QkFBNkIsQ0FBQyxPQUFzQyxFQUFFLFdBQWdEO1lBQzlILE9BQStCO2dCQUM5QixhQUFhLEVBQUUsU0FBUztnQkFDeEIsY0FBYyxDQUFDLEtBQWlCLEVBQUUsS0FBb0MsRUFBRSxnQkFBd0IsRUFBRSxVQUFrRDtvQkFLbkosTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO29CQUMvRSxJQUFJLFVBQVUsRUFBRSxDQUFDO3dCQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN2QixDQUFDO29CQUNELE1BQU0sWUFBWSxHQUFHLElBQUksaUJBQVcsQ0FBcUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRTFGLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ25CLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUM7b0JBRUgsSUFBSSxVQUFVLEVBQUUsQ0FBQzt3QkFDaEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2pFLENBQUM7b0JBQ0QsT0FBTzt3QkFDTixlQUFlLEVBQUUsSUFBSSxpQkFBVyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDMUQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUM7NEJBQzdCLFFBQVEsRUFBRSxFQUFFOzRCQUNaLE9BQU8sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzs0QkFDcEQsUUFBUSxFQUFFLEtBQUs7eUJBQ2YsQ0FBQzt3QkFDRixlQUFlLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGlCQUFXLEVBQUUsQ0FBQztxQkFDbkQsQ0FBQztnQkFDSCxDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLENBQUMsc0NBQXNDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdkQsTUFBTSxPQUFPLEdBQUc7Z0JBQ2YsU0FBUyxDQUFDLElBQUksRUFDYixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQzNELElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDOUQsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQUMsQ0FBQztZQUNsRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUJBQWMsRUFBRSx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pILG9CQUFvQixDQUFDLElBQUksQ0FBQyx1Q0FBc0IsRUFBRSw2QkFBNkIsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVoRyxNQUFNLFVBQVUsR0FBZ0Isb0JBQW9CLENBQUMsY0FBYyxDQUFDLHlCQUFXLENBQUMsQ0FBQztZQUNqRixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDO1lBRXpILE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFakQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUEsOEJBQVcsR0FBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFN0YsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN4RCxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdkUsWUFBWSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNuQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDLENBQUMsQ0FBQztRQUdILElBQUksQ0FBQyxrREFBa0QsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNuRSxNQUFNLE9BQU8sR0FBRztnQkFDZixTQUFTLENBQUMsSUFBSSxFQUNiLElBQUksd0JBQWUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDdEQsSUFBSSx3QkFBZSxDQUFDLGdCQUFnQixFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSx3QkFBZSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQzthQUFDLENBQUM7WUFDN0Qsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHVCQUFjLEVBQUUsd0JBQXdCLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6SCxLQUFLLENBQUMsSUFBSSxDQUFDLHVCQUFTLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRTlDLE1BQU0sV0FBVyxHQUFHO2dCQUNuQixRQUFRLEVBQUUseUJBQVEsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUF1QjtvQkFDM0QsY0FBYyxDQUFDLFVBQWtCO3dCQUNoQyxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUUsQ0FBQzs0QkFDdEIsT0FBTyxRQUFRLENBQUM7d0JBQ2pCLENBQUM7NkJBQU0sQ0FBQzs0QkFDUCxPQUFPLEVBQUUsQ0FBQzt3QkFDWCxDQUFDO29CQUNGLENBQUM7aUJBQ0Q7Z0JBQ0QsRUFBRSxFQUFFLGFBQWE7YUFDQyxDQUFDO1lBRXBCLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBSSxpQkFBUyxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRFLE1BQU0sUUFBUSxHQUFHO2dCQUNoQixRQUFRLEVBQUUseUJBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUF1QjtvQkFDekQsY0FBYyxDQUFDLFVBQWtCO3dCQUNoQyxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUUsQ0FBQzs0QkFDdEIsT0FBTywwQkFBMEIsQ0FBQzt3QkFDbkMsQ0FBQzs2QkFBTSxDQUFDOzRCQUNQLE9BQU8sRUFBRSxDQUFDO3dCQUNYLENBQUM7b0JBQ0YsQ0FBQztpQkFDRDtnQkFDRCxFQUFFLEVBQUUsVUFBVTthQUNJLENBQUM7WUFFcEIsTUFBTSxrQkFBa0IsR0FDdkIsQ0FBQyxJQUFJLGlCQUFTLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxpQkFBUyxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDL0MsQ0FBQztZQUNILE1BQU0sY0FBYyxHQUFHLENBQUM7b0JBQ3ZCLEtBQUssRUFBRSxDQUFDO29CQUNSLGlCQUFpQixFQUFFO3dCQUNsQixJQUFJLEVBQUUsaUJBQWlCO3dCQUN2QixLQUFLLEVBQUU7NEJBQ04sS0FBSyxFQUFFLENBQUM7NEJBQ1IsR0FBRyxFQUFFLENBQUM7eUJBQ047cUJBQ0Q7aUJBQ0Q7Z0JBQ0Q7b0JBQ0MsS0FBSyxFQUFFLENBQUM7b0JBQ1IsaUJBQWlCLEVBQUU7d0JBQ2xCLElBQUksRUFBRSxpQkFBaUI7d0JBQ3ZCLEtBQUssRUFBRTs0QkFDTixLQUFLLEVBQUUsQ0FBQzs0QkFDUixHQUFHLEVBQUUsRUFBRTt5QkFDUDtxQkFDRDtpQkFDRDthQUNBLENBQUM7WUFDRixNQUFNLFdBQVcsR0FBZ0M7Z0JBQ2hELElBQUksRUFBRSxXQUFXO2dCQUNqQixLQUFLLEVBQUUsQ0FBQztnQkFDUixjQUFjLEVBQUUsSUFBQSx5REFBaUMsRUFBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO2dCQUM1RSxjQUFjLEVBQUUsRUFBRTthQUNsQixDQUFDO1lBRUYsTUFBTSxhQUFhLEdBQWdDO2dCQUNsRCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLEVBQUUsQ0FBQztnQkFDUixjQUFjLEVBQUUsSUFBQSx5REFBaUMsRUFBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUM7Z0JBQy9FLGNBQWMsRUFBRSxJQUFBLHlEQUFpQyxFQUFDLGNBQWMsQ0FBQzthQUNqRSxDQUFDO1lBRUYsTUFBTSxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUNBQXNCLEVBQUUsNkJBQTZCLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsTCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDMUUsTUFBTSxLQUFLLEdBQWdCLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx5QkFBVyxDQUFDLENBQUM7WUFDNUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQixNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSx3QkFBZ0IsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUM5RyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRTVDLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFbEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUEsOEJBQVcsR0FBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDN0YsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFaEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RSxNQUFNLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5RSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFlBQVksNkJBQWUsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQXFCLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxhQUFhLENBQUMsQ0FBQztZQUMvRSxNQUFNLENBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFxQixDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssVUFBVSxDQUFDLENBQUM7WUFDNUUsTUFBTSxDQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBcUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sQ0FBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQXFCLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxVQUFVLENBQUMsQ0FBQztZQUM1RSxNQUFNLENBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFxQixDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssVUFBVSxDQUFDLENBQUM7WUFFNUUsTUFBTSxvQkFBb0IsR0FBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQXFCLENBQUMsVUFBVSxDQUFDO1lBQ3BGLE1BQU0sc0JBQXNCLEdBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFxQixDQUFDLFVBQVUsQ0FBQztZQUV0RixNQUFNLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUzRCxNQUFNLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUUsTUFBTSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RSxNQUFNLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUUsTUFBTSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTVFLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUEsOEJBQVcsR0FBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDN0YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBQSw4QkFBVyxHQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM5RixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0REFBNEQsRUFBRSxLQUFLLElBQUksRUFBRTtZQUM3RSxNQUFNLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsNkJBQWlCLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDeEUsTUFBTSxPQUFPLEdBQUc7Z0JBQ2YsU0FBUyxDQUFDLElBQUksRUFDYixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQzNELElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDOUQsU0FBUyxDQUFDLElBQUksRUFDYixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQUMsQ0FBQztZQUNuRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUJBQWMsRUFBRSx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pILG9CQUFvQixDQUFDLElBQUksQ0FBQyx1Q0FBc0IsRUFBRSw2QkFBNkIsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVoRyxNQUFNLFVBQVUsR0FBZ0Isb0JBQW9CLENBQUMsY0FBYyxDQUFDLHlCQUFXLENBQUMsQ0FBQztZQUNqRixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDO1lBRXpILE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxvRkFBb0YsRUFBRSxHQUFHLEVBQUU7WUFDL0YsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzVCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELG9CQUFvQixDQUFDLElBQUksQ0FBQyw2QkFBaUIsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbkUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHVCQUFjLEVBQUUsd0JBQXdCLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEgsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHVDQUFzQixFQUFFLDZCQUE2QixDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRWhHLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx5QkFBVyxDQUFDLENBQUM7WUFDcEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0QixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsY0FBYyxFQUFFLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLElBQUksd0JBQWdCLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUM7WUFFbEksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDdkIsT0FBTyxJQUFBLGVBQU8sRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUMzQixNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO29CQUMxRCxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0ZBQWdGLEVBQUUsR0FBRyxFQUFFO1lBQzNGLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakQsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsNkJBQWlCLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRW5FLG9CQUFvQixDQUFDLElBQUksQ0FBQyx1QkFBYyxFQUFFLHdCQUF3QixDQUNqRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSx3QkFBZSxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ3BFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHVDQUFzQixFQUFFLDZCQUE2QixDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRWhHLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx5QkFBVyxDQUFDLENBQUM7WUFDcEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0QixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsY0FBYyxFQUFFLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLElBQUksd0JBQWdCLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUM7WUFFbEksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDdkIsT0FBTyxJQUFBLGVBQU8sRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUMzQix5RkFBeUY7b0JBQ3pGLDJCQUEyQjtvQkFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztvQkFDMUQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztvQkFDdkQsNENBQTRDO2dCQUM3QyxDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkVBQTZFLEVBQUUsR0FBRyxFQUFFO1lBQ3hGLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakQsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsNkJBQWlCLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRW5FLG9CQUFvQixDQUFDLElBQUksQ0FBQyx1QkFBYyxFQUFFLHNCQUFzQixDQUFDLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFILG9CQUFvQixDQUFDLElBQUksQ0FBQyx1Q0FBc0IsRUFBRSw2QkFBNkIsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVoRyxNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUJBQVcsQ0FBQyxDQUFDO1lBQ3BFLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEIsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDO1lBRWxJLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFO2dCQUNsQyxPQUFPLElBQUEsZUFBTyxFQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQzNCLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7b0JBQzFELE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxzRkFBc0YsRUFBRSxHQUFHLEVBQUU7WUFDakcsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzVCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELG9CQUFvQixDQUFDLElBQUksQ0FBQyw2QkFBaUIsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbkUsTUFBTSxlQUFlLEdBQUcsSUFBSSx1QkFBZSxFQUFtQixDQUFDO1lBRS9ELG9CQUFvQixDQUFDLElBQUksQ0FBQyx1QkFBYyxFQUFFLGdDQUFnQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9GLG9CQUFvQixDQUFDLElBQUksQ0FBQyx1Q0FBc0IsRUFBRSw2QkFBNkIsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVoRyxNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUJBQVcsQ0FBQyxDQUFDO1lBQ3BFLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEIsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDO1lBRWxJLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUV6QixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUN4QyxPQUFPLElBQUEsZUFBTyxFQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQzNCLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7b0JBQzFELE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZELGlDQUFpQztnQkFDbEMsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdEQUF3RCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3pFLE1BQU0sT0FBTyxHQUFHO2dCQUNmLFNBQVMsQ0FBQyxJQUFJLEVBQ2IsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUMzRCxJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzlELFNBQVMsQ0FBQyxJQUFJLEVBQ2IsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUFDLENBQUM7WUFDbkQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHVCQUFjLEVBQUUsd0JBQXdCLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0gsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHVDQUFzQixFQUFFLDZCQUE2QixDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2hHLE1BQU0sVUFBVSxHQUFnQixvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUJBQVcsQ0FBQyxDQUFDO1lBQ2pGLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEIsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsY0FBYyxFQUFFLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLElBQUksd0JBQWdCLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUM7WUFDekgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUU5QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUJBQWMsRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXhFLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUUsSUFBSSx3QkFBZ0IsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ3RHLE1BQU0sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHNFQUFzRSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3ZGLE1BQU0sV0FBVyxHQUFHLElBQUksc0NBQXVCLEVBQUUsQ0FBQztZQUNsRCxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZCLG9CQUFvQixDQUFDLElBQUksQ0FBQyx1QkFBYyxFQUFFLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDakYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHVDQUFzQixFQUFFLDZCQUE2QixDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2xHLE1BQU0sVUFBVSxHQUFnQixvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUJBQVcsQ0FBQyxDQUFDO1lBQ2pGLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDdEcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHVCQUFjLEVBQUUsd0JBQXdCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUNBQXNCLEVBQUUsNkJBQTZCLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDaEcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFFdEcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUVBQW1FLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDcEYsTUFBTSxPQUFPLEdBQUc7Z0JBQ2YsU0FBUyxDQUFDLElBQUksRUFDYixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQzNELElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUFDLENBQUM7WUFDakUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHVCQUFjLEVBQUUsd0JBQXdCLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6SCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUNBQXNCLEVBQUUsNkJBQTZCLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFaEcsTUFBTSxVQUFVLEdBQWdCLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx5QkFBVyxDQUFDLENBQUM7WUFDakYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0QixNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSx3QkFBZ0IsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUNqSCxVQUFVLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQztZQUNuQyxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVqRCxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQ2pJLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVqRCxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQ3ZJLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVqRCxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQ3pJLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVqRCxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLHdCQUFnQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQ3pJLFVBQVUsQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1lBQ3JDLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztRQUVILFNBQVMsU0FBUyxDQUFDLFFBQWdCLEVBQUUsR0FBRyxPQUEyQjtZQUNsRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUEsZ0RBQTZCLEVBQUMsUUFBUSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdkUsQ0FBQztRQUVELFNBQVMsa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxHQUFHLEtBQW9DO1lBQ3BGLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBQSxnREFBNkIsRUFBQyxRQUFRLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDbEYsQ0FBQztRQUVELFNBQVMsZ0JBQWdCLENBQUMsb0JBQThDO1lBQ3ZFLG9CQUFvQixDQUFDLElBQUksQ0FBQyw0QkFBYSxFQUFFLElBQUksbUNBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUM5QyxNQUFNLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDOUQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHFDQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pELE1BQU0sWUFBWSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQkFBWSxDQUFDLENBQUM7WUFDdkUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN4QixPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBRUQsU0FBUyx5QkFBeUIsQ0FBQyxvQkFBOEM7WUFDaEYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDBDQUFvQixFQUFFLElBQUksK0NBQXVCLEVBQUUsQ0FBQyxDQUFDO1lBQy9FLG9CQUFvQixDQUFDLElBQUksQ0FBQywrQkFBa0IsRUFBRSxJQUFJLDZDQUFxQixFQUFFLENBQUMsQ0FBQztZQUMzRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOEJBQWMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUkseUNBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUUsTUFBTSwyQkFBMkIsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsdURBQTJCLENBQUMsQ0FBQztZQUNyRyxLQUFLLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDdkMsT0FBTywyQkFBMkIsQ0FBQztRQUNwQyxDQUFDO0lBQ0YsQ0FBQyxDQUFDLENBQUMifQ==
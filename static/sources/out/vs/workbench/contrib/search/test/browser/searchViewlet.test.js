define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/files/common/fileService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/workspace/common/workspace", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/label/test/common/mockLabelService", "vs/workbench/services/search/common/search", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/search/test/browser/searchTestCommon", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, languageConfigurationRegistry_1, model_1, testLanguageConfigurationService_1, fileService_1, instantiationServiceMock_1, label_1, log_1, uriIdentity_1, uriIdentityService_1, workspace_1, testWorkspace_1, searchModel_1, mockLabelService_1, search_1, workbenchTestServices_1, notebookEditorService_1, searchTestCommon_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Search - Viewlet', () => {
        let instantiation;
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            instantiation = new instantiationServiceMock_1.TestInstantiationService();
            instantiation.stub(languageConfigurationRegistry_1.ILanguageConfigurationService, testLanguageConfigurationService_1.TestLanguageConfigurationService);
            instantiation.stub(model_1.IModelService, (0, searchTestCommon_1.stubModelService)(instantiation, (e) => store.add(e)));
            instantiation.stub(notebookEditorService_1.INotebookEditorService, (0, searchTestCommon_1.stubNotebookEditorService)(instantiation, (e) => store.add(e)));
            instantiation.set(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService(testWorkspace_1.TestWorkspace));
            const fileService = new fileService_1.FileService(new log_1.NullLogService());
            store.add(fileService);
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            store.add(uriIdentityService);
            instantiation.stub(uriIdentity_1.IUriIdentityService, uriIdentityService);
            instantiation.stub(label_1.ILabelService, new mockLabelService_1.MockLabelService());
            instantiation.stub(log_1.ILogService, new log_1.NullLogService());
        });
        teardown(() => {
            instantiation.dispose();
        });
        test('Data Source', function () {
            const result = aSearchResult();
            result.query = {
                type: 2 /* QueryType.Text */,
                contentPattern: { pattern: 'foo' },
                folderQueries: [{
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)()
                    }]
            };
            result.add([{
                    resource: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/foo'),
                    results: [{
                            preview: {
                                text: 'bar',
                                matches: {
                                    startLineNumber: 0,
                                    startColumn: 0,
                                    endLineNumber: 0,
                                    endColumn: 1
                                }
                            },
                            ranges: {
                                startLineNumber: 1,
                                startColumn: 0,
                                endLineNumber: 1,
                                endColumn: 1
                            }
                        }]
                }], '');
            const fileMatch = result.matches()[0];
            const lineMatch = fileMatch.matches()[0];
            assert.strictEqual(fileMatch.id(), uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/foo`).toString());
            assert.strictEqual(lineMatch.id(), `${uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/foo`).toString()}>[2,1 -> 2,2]b`);
        });
        test('Comparer', () => {
            const fileMatch1 = aFileMatch('/foo');
            const fileMatch2 = aFileMatch('/with/path');
            const fileMatch3 = aFileMatch('/with/path/foo');
            const lineMatch1 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(0, 1, 1));
            const lineMatch2 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
            const lineMatch3 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
            assert((0, searchModel_1.searchMatchComparer)(fileMatch1, fileMatch2) < 0);
            assert((0, searchModel_1.searchMatchComparer)(fileMatch2, fileMatch1) > 0);
            assert((0, searchModel_1.searchMatchComparer)(fileMatch1, fileMatch1) === 0);
            assert((0, searchModel_1.searchMatchComparer)(fileMatch2, fileMatch3) < 0);
            assert((0, searchModel_1.searchMatchComparer)(lineMatch1, lineMatch2) < 0);
            assert((0, searchModel_1.searchMatchComparer)(lineMatch2, lineMatch1) > 0);
            assert((0, searchModel_1.searchMatchComparer)(lineMatch2, lineMatch3) === 0);
        });
        test('Advanced Comparer', () => {
            const fileMatch1 = aFileMatch('/with/path/foo10');
            const fileMatch2 = aFileMatch('/with/path2/foo1');
            const fileMatch3 = aFileMatch('/with/path/bar.a');
            const fileMatch4 = aFileMatch('/with/path/bar.b');
            // By default, path < path2
            assert((0, searchModel_1.searchMatchComparer)(fileMatch1, fileMatch2) < 0);
            // By filenames, foo10 > foo1
            assert((0, searchModel_1.searchMatchComparer)(fileMatch1, fileMatch2, "fileNames" /* SearchSortOrder.FileNames */) > 0);
            // By type, bar.a < bar.b
            assert((0, searchModel_1.searchMatchComparer)(fileMatch3, fileMatch4, "type" /* SearchSortOrder.Type */) < 0);
        });
        test('Cross-type Comparer', () => {
            const searchResult = aSearchResult();
            const folderMatch1 = aFolderMatch('/voo', 0, searchResult);
            const folderMatch2 = aFolderMatch('/with', 1, searchResult);
            const fileMatch1 = aFileMatch('/voo/foo.a', folderMatch1);
            const fileMatch2 = aFileMatch('/with/path.c', folderMatch2);
            const fileMatch3 = aFileMatch('/with/path/bar.b', folderMatch2);
            const lineMatch1 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(0, 1, 1));
            const lineMatch2 = new searchModel_1.Match(fileMatch1, ['bar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
            const lineMatch3 = new searchModel_1.Match(fileMatch2, ['barfoo'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(0, 1, 1));
            const lineMatch4 = new searchModel_1.Match(fileMatch2, ['fooooo'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
            const lineMatch5 = new searchModel_1.Match(fileMatch3, ['foobar'], new search_1.OneLineRange(0, 1, 1), new search_1.OneLineRange(2, 1, 1));
            /***
             * Structure would take the following form:
             *
             *	folderMatch1 (voo)
             *		> fileMatch1 (/foo.a)
             *			>> lineMatch1
             *			>> lineMatch2
             *	folderMatch2 (with)
             *		> fileMatch2 (/path.c)
             *			>> lineMatch4
             *			>> lineMatch5
             *		> fileMatch3 (/path/bar.b)
             *			>> lineMatch3
             *
             */
            // for these, refer to diagram above
            assert((0, searchModel_1.searchComparer)(fileMatch1, fileMatch3) < 0);
            assert((0, searchModel_1.searchComparer)(fileMatch2, fileMatch3) < 0);
            assert((0, searchModel_1.searchComparer)(folderMatch2, fileMatch2) < 0);
            assert((0, searchModel_1.searchComparer)(lineMatch4, lineMatch5) < 0);
            assert((0, searchModel_1.searchComparer)(lineMatch1, lineMatch3) < 0);
            assert((0, searchModel_1.searchComparer)(lineMatch2, folderMatch2) < 0);
            // travel up hierarchy and order of folders take precedence. "voo < with" in indices
            assert((0, searchModel_1.searchComparer)(fileMatch1, fileMatch3, "fileNames" /* SearchSortOrder.FileNames */) < 0);
            // bar.b < path.c
            assert((0, searchModel_1.searchComparer)(fileMatch3, fileMatch2, "fileNames" /* SearchSortOrder.FileNames */) < 0);
            // lineMatch4's parent is fileMatch2, "bar.b < path.c"
            assert((0, searchModel_1.searchComparer)(fileMatch3, lineMatch4, "fileNames" /* SearchSortOrder.FileNames */) < 0);
            // bar.b < path.c
            assert((0, searchModel_1.searchComparer)(fileMatch3, fileMatch2, "type" /* SearchSortOrder.Type */) < 0);
            // lineMatch4's parent is fileMatch2, "bar.b < path.c"
            assert((0, searchModel_1.searchComparer)(fileMatch3, lineMatch4, "type" /* SearchSortOrder.Type */) < 0);
        });
        function aFileMatch(path, parentFolder, ...lineMatches) {
            const rawMatch = {
                resource: uri_1.URI.file('/' + path),
                results: lineMatches
            };
            const fileMatch = instantiation.createInstance(searchModel_1.FileMatch, {
                pattern: ''
            }, undefined, undefined, parentFolder ?? aFolderMatch('', 0), rawMatch, null, '');
            store.add(fileMatch);
            return fileMatch;
        }
        function aFolderMatch(path, index, parent) {
            const searchModel = instantiation.createInstance(searchModel_1.SearchModel);
            store.add(searchModel);
            const folderMatch = instantiation.createInstance(searchModel_1.FolderMatch, (0, searchTestCommon_1.createFileUriFromPathFromRoot)(path), path, index, {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)() }], contentPattern: {
                    pattern: ''
                }
            }, parent ?? aSearchResult().folderMatches()[0], searchModel.searchResult, null);
            store.add(folderMatch);
            return folderMatch;
        }
        function aSearchResult() {
            const searchModel = instantiation.createInstance(searchModel_1.SearchModel);
            store.add(searchModel);
            searchModel.searchResult.query = {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)() }], contentPattern: {
                    pattern: ''
                }
            };
            return searchModel.searchResult;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoVmlld2xldC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvdGVzdC9icm93c2VyL3NlYXJjaFZpZXdsZXQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUF5QkEsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUM5QixJQUFJLGFBQXVDLENBQUM7UUFDNUMsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXhELEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixhQUFhLEdBQUcsSUFBSSxtREFBd0IsRUFBRSxDQUFDO1lBQy9DLGFBQWEsQ0FBQyxJQUFJLENBQUMsNkRBQTZCLEVBQUUsbUVBQWdDLENBQUMsQ0FBQztZQUNwRixhQUFhLENBQUMsSUFBSSxDQUFDLHFCQUFhLEVBQUUsSUFBQSxtQ0FBZ0IsRUFBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLGFBQWEsQ0FBQyxJQUFJLENBQUMsOENBQXNCLEVBQUUsSUFBQSw0Q0FBeUIsRUFBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsb0NBQXdCLEVBQUUsSUFBSSwwQ0FBa0IsQ0FBQyw2QkFBYSxDQUFDLENBQUMsQ0FBQztZQUNuRixNQUFNLFdBQVcsR0FBRyxJQUFJLHlCQUFXLENBQUMsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQztZQUMxRCxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sa0JBQWtCLEdBQUcsSUFB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QUFDLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hHLE1BQU0sVUFBVSxHQUFHLElBQUksbUJBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhHLE1BQU0sVUFBVSxHQUFHLElBQUksbUJBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNHLE1BQU0sVUFBVSxHQUFHLElBQUksbUJBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTNHLE1BQU0sVUFBVSxHQUFHLElBQUksbUJBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTNHOzs7Ozs7Ozs7Ozs7OztlQWNHO1lBRUgsb0NBQW9DO1lBQ3BDLE1BQU0sQ0FBQyxJQUFBLDRCQUFjLEVBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxJQUFBLDRCQUFj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
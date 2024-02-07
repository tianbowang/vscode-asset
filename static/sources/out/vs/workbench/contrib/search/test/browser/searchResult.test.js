define(["require", "exports", "assert", "sinon", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/search/browser/searchModel", "vs/base/common/uri", "vs/workbench/services/search/common/search", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/core/range", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelService", "vs/editor/common/services/model", "vs/workbench/contrib/search/browser/replace", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/label/common/label", "vs/workbench/services/label/test/common/mockLabelService", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/search/test/browser/searchTestCommon", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/services/editor/common/editorService", "vs/base/test/common/utils"], function (require, exports, assert, sinon, instantiationServiceMock_1, searchModel_1, uri_1, search_1, telemetry_1, telemetryUtils_1, range_1, configuration_1, testConfigurationService_1, modelService_1, model_1, replace_1, themeService_1, testThemeService_1, uriIdentity_1, uriIdentityService_1, fileService_1, log_1, label_1, mockLabelService_1, notebookEditorService_1, editorGroupsService_1, workbenchTestServices_1, notebookEditorServiceImpl_1, notebookCommon_1, searchTestCommon_1, contextkey_1, mockKeybindingService_1, editorService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const lineOneRange = new search_1.OneLineRange(1, 0, 1);
    suite('SearchResult', () => {
        let instantiationService;
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(model_1.IModelService, stubModelService(instantiationService));
            instantiationService.stub(notebookEditorService_1.INotebookEditorService, stubNotebookEditorService(instantiationService));
            const fileService = new fileService_1.FileService(new log_1.NullLogService());
            store.add(fileService);
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            store.add(uriIdentityService);
            instantiationService.stub(uriIdentity_1.IUriIdentityService, uriIdentityService);
            instantiationService.stubPromise(replace_1.IReplaceService, {});
            instantiationService.stub(replace_1.IReplaceService, 'replace', () => Promise.resolve(null));
            instantiationService.stub(label_1.ILabelService, new mockLabelService_1.MockLabelService());
            instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
        });
        teardown(() => {
            instantiationService.dispose();
        });
        test('Line Match', function () {
            const fileMatch = aFileMatch('folder/file.txt', null);
            const lineMatch = new searchModel_1.Match(fileMatch, ['0 foo bar'], new search_1.OneLineRange(0, 2, 5), new search_1.OneLineRange(1, 0, 5));
            assert.strictEqual(lineMatch.text(), '0 foo bar');
            assert.strictEqual(lineMatch.range().startLineNumber, 2);
            assert.strictEqual(lineMatch.range().endLineNumber, 2);
            assert.strictEqual(lineMatch.range().startColumn, 1);
            assert.strictEqual(lineMatch.range().endColumn, 6);
            assert.strictEqual(lineMatch.id(), 'file:///folder/file.txt>[2,1 -> 2,6]foo');
            assert.strictEqual(lineMatch.fullMatchText(), 'foo');
            assert.strictEqual(lineMatch.fullMatchText(true), '0 foo bar');
        });
        test('Line Match - Remove', function () {
            const fileMatch = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo bar', new search_1.OneLineRange(1, 0, 3)));
            const lineMatch = fileMatch.matches()[0];
            fileMatch.remove(lineMatch);
            assert.strictEqual(fileMatch.matches().length, 0);
        });
        test('File Match', function () {
            let fileMatch = aFileMatch('folder/file.txt', aSearchResult());
            assert.strictEqual(fileMatch.matches().length, 0);
            assert.strictEqual(fileMatch.resource.toString(), 'file:///folder/file.txt');
            assert.strictEqual(fileMatch.name(), 'file.txt');
            fileMatch = aFileMatch('file.txt', aSearchResult());
            assert.strictEqual(fileMatch.matches().length, 0);
            assert.strictEqual(fileMatch.resource.toString(), 'file:///file.txt');
            assert.strictEqual(fileMatch.name(), 'file.txt');
        });
        test('File Match: Select an existing match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            testObject.setSelectedMatch(testObject.matches()[0]);
            assert.strictEqual(testObject.matches()[0], testObject.getSelectedMatch());
        });
        test('File Match: Select non existing match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            const target = testObject.matches()[0];
            testObject.remove(target);
            testObject.setSelectedMatch(target);
            assert.strictEqual(testObject.getSelectedMatch(), null);
        });
        test('File Match: isSelected return true for selected match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            const target = testObject.matches()[0];
            testObject.setSelectedMatch(target);
            assert.ok(testObject.isMatchSelected(target));
        });
        test('File Match: isSelected return false for un-selected match', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            testObject.setSelectedMatch(testObject.matches()[0]);
            assert.ok(!testObject.isMatchSelected(testObject.matches()[1]));
        });
        test('File Match: unselect', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            testObject.setSelectedMatch(testObject.matches()[0]);
            testObject.setSelectedMatch(null);
            assert.strictEqual(null, testObject.getSelectedMatch());
        });
        test('File Match: unselect when not selected', function () {
            const testObject = aFileMatch('folder/file.txt', aSearchResult(), new search_1.TextSearchMatch('foo', new search_1.OneLineRange(1, 0, 3)), new search_1.TextSearchMatch('bar', new search_1.OneLineRange(1, 5, 3)));
            testObject.setSelectedMatch(null);
            assert.strictEqual(null, testObject.getSelectedMatch());
        });
        test('Match -> FileMatch -> SearchResult hierarchy exists', function () {
            const searchModel = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(searchModel);
            const searchResult = instantiationService.createInstance(searchModel_1.SearchResult, searchModel);
            store.add(searchResult);
            const fileMatch = aFileMatch('far/boo', searchResult);
            const lineMatch = new searchModel_1.Match(fileMatch, ['foo bar'], new search_1.OneLineRange(0, 0, 3), new search_1.OneLineRange(1, 0, 3));
            assert(lineMatch.parent() === fileMatch);
            assert(fileMatch.parent() === searchResult.folderMatches()[0]);
        });
        test('Adding a raw match will add a file match with line matches', function () {
            const testObject = aSearchResult();
            const target = [aRawMatch('/1', new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)), new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11)), new search_1.TextSearchMatch('preview 2', lineOneRange))];
            (0, searchTestCommon_1.addToSearchResult)(testObject, target);
            assert.strictEqual(3, testObject.count());
            const actual = testObject.matches();
            assert.strictEqual(1, actual.length);
            assert.strictEqual(uri_1.URI.file(`${(0, searchTestCommon_1.getRootName)()}/1`).toString(), actual[0].resource.toString());
            const actuaMatches = actual[0].matches();
            assert.strictEqual(3, actuaMatches.length);
            assert.strictEqual('preview 1', actuaMatches[0].text());
            assert.ok(new range_1.Range(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
            assert.strictEqual('preview 1', actuaMatches[1].text());
            assert.ok(new range_1.Range(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
            assert.strictEqual('preview 2', actuaMatches[2].text());
            assert.ok(new range_1.Range(2, 1, 2, 2).equalsRange(actuaMatches[2].range()));
        });
        test('Adding multiple raw matches', function () {
            const testObject = aSearchResult();
            const target = [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)), new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11))),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ];
            (0, searchTestCommon_1.addToSearchResult)(testObject, target);
            assert.strictEqual(3, testObject.count());
            const actual = testObject.matches();
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
        test('Test that notebook matches get added correctly', function () {
            const testObject = aSearchResult();
            const cell1 = { cellKind: notebookCommon_1.CellKind.Code };
            const cell2 = { cellKind: notebookCommon_1.CellKind.Code };
            sinon.stub(searchModel_1.CellMatch.prototype, 'addContext');
            const addFileMatch = sinon.spy(searchModel_1.FolderMatch.prototype, "addFileMatch");
            const fileMatch1 = aRawFileMatchWithCells('/1', {
                cell: cell1,
                index: 0,
                contentResults: [
                    new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)),
                ],
                webviewResults: [
                    new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11)),
                    new search_1.TextSearchMatch('preview 2', lineOneRange)
                ]
            });
            const fileMatch2 = aRawFileMatchWithCells('/2', {
                cell: cell2,
                index: 0,
                contentResults: [
                    new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 1, 4)),
                ],
                webviewResults: [
                    new search_1.TextSearchMatch('preview 1', new search_1.OneLineRange(1, 4, 11)),
                    new search_1.TextSearchMatch('preview 2', lineOneRange)
                ]
            });
            const target = [fileMatch1, fileMatch2];
            (0, searchTestCommon_1.addToSearchResult)(testObject, target);
            assert.strictEqual(6, testObject.count());
            assert.deepStrictEqual(fileMatch1.cellResults[0].contentResults, addFileMatch.getCall(0).args[0][0].cellResults[0].contentResults);
            assert.deepStrictEqual(fileMatch1.cellResults[0].webviewResults, addFileMatch.getCall(0).args[0][0].cellResults[0].webviewResults);
            assert.deepStrictEqual(fileMatch2.cellResults[0].contentResults, addFileMatch.getCall(0).args[0][1].cellResults[0].contentResults);
            assert.deepStrictEqual(fileMatch2.cellResults[0].webviewResults, addFileMatch.getCall(0).args[0][1].cellResults[0].webviewResults);
        });
        test('Dispose disposes matches', function () {
            const target1 = sinon.spy();
            const target2 = sinon.spy();
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange)),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ]);
            store.add(testObject.matches()[0].onDispose(target1));
            store.add(testObject.matches()[1].onDispose(target2));
            testObject.dispose();
            assert.ok(testObject.isEmpty());
            assert.ok(target1.calledOnce);
            assert.ok(target2.calledOnce);
        });
        test('remove triggers change event', function () {
            const target = sinon.spy();
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange))
            ]);
            const objectToRemove = testObject.matches()[0];
            store.add(testObject.onChange(target));
            testObject.remove(objectToRemove);
            assert.ok(target.calledOnce);
            assert.deepStrictEqual([{ elements: [objectToRemove], removed: true }], target.args[0]);
        });
        test('remove array triggers change event', function () {
            const target = sinon.spy();
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange)),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ]);
            const arrayToRemove = testObject.matches();
            store.add(testObject.onChange(target));
            testObject.remove(arrayToRemove);
            assert.ok(target.calledOnce);
            assert.deepStrictEqual([{ elements: arrayToRemove, removed: true }], target.args[0]);
        });
        test('Removing all line matches and adding back will add file back to result', function () {
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange))
            ]);
            const target = testObject.matches()[0];
            const matchToRemove = target.matches()[0];
            target.remove(matchToRemove);
            assert.ok(testObject.isEmpty());
            target.add(matchToRemove, true);
            assert.strictEqual(1, testObject.fileCount());
            assert.strictEqual(target, testObject.matches()[0]);
        });
        test('replace should remove the file match', function () {
            const voidPromise = Promise.resolve(null);
            instantiationService.stub(replace_1.IReplaceService, 'replace', voidPromise);
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange))
            ]);
            testObject.replace(testObject.matches()[0]);
            return voidPromise.then(() => assert.ok(testObject.isEmpty()));
        });
        test('replace should trigger the change event', function () {
            const target = sinon.spy();
            const voidPromise = Promise.resolve(null);
            instantiationService.stub(replace_1.IReplaceService, 'replace', voidPromise);
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange))
            ]);
            store.add(testObject.onChange(target));
            const objectToRemove = testObject.matches()[0];
            testObject.replace(objectToRemove);
            return voidPromise.then(() => {
                assert.ok(target.calledOnce);
                assert.deepStrictEqual([{ elements: [objectToRemove], removed: true }], target.args[0]);
            });
        });
        test('replaceAll should remove all file matches', function () {
            const voidPromise = Promise.resolve(null);
            instantiationService.stubPromise(replace_1.IReplaceService, 'replace', voidPromise);
            const testObject = aSearchResult();
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/1', new search_1.TextSearchMatch('preview 1', lineOneRange)),
                aRawMatch('/2', new search_1.TextSearchMatch('preview 2', lineOneRange))
            ]);
            testObject.replaceAll(null);
            return voidPromise.then(() => assert.ok(testObject.isEmpty()));
        });
        test('batchRemove should trigger the onChange event correctly', function () {
            const target = sinon.spy();
            const testObject = getPopulatedSearchResult();
            const folderMatch = testObject.folderMatches()[0];
            const fileMatch = testObject.folderMatches()[1].allDownstreamFileMatches()[0];
            const match = testObject.folderMatches()[1].allDownstreamFileMatches()[1].matches()[0];
            const arrayToRemove = [folderMatch, fileMatch, match];
            const expectedArrayResult = folderMatch.allDownstreamFileMatches().concat([fileMatch, match.parent()]);
            store.add(testObject.onChange(target));
            testObject.batchRemove(arrayToRemove);
            assert.ok(target.calledOnce);
            assert.deepStrictEqual([{ elements: expectedArrayResult, removed: true, added: false }], target.args[0]);
        });
        test('batchReplace should trigger the onChange event correctly', async function () {
            const replaceSpy = sinon.spy();
            instantiationService.stub(replace_1.IReplaceService, 'replace', (arg) => {
                if (Array.isArray(arg)) {
                    replaceSpy(arg[0]);
                }
                else {
                    replaceSpy(arg);
                }
                return Promise.resolve();
            });
            const target = sinon.spy();
            const testObject = getPopulatedSearchResult();
            const folderMatch = testObject.folderMatches()[0];
            const fileMatch = testObject.folderMatches()[1].allDownstreamFileMatches()[0];
            const match = testObject.folderMatches()[1].allDownstreamFileMatches()[1].matches()[0];
            const firstExpectedMatch = folderMatch.allDownstreamFileMatches()[0];
            const arrayToRemove = [folderMatch, fileMatch, match];
            store.add(testObject.onChange(target));
            await testObject.batchReplace(arrayToRemove);
            assert.ok(target.calledOnce);
            sinon.assert.calledThrice(replaceSpy);
            sinon.assert.calledWith(replaceSpy.firstCall, firstExpectedMatch);
            sinon.assert.calledWith(replaceSpy.secondCall, fileMatch);
            sinon.assert.calledWith(replaceSpy.thirdCall, match);
        });
        test('Creating a model with nested folders should create the correct structure', function () {
            const testObject = getPopulatedSearchResultForTreeTesting();
            const root0 = testObject.folderMatches()[0];
            const root1 = testObject.folderMatches()[1];
            const root2 = testObject.folderMatches()[2];
            const root3 = testObject.folderMatches()[3];
            const root0DownstreamFiles = root0.allDownstreamFileMatches();
            assert.deepStrictEqual(root0DownstreamFiles, [...root0.fileMatchesIterator(), ...getFolderMatchAtIndex(root0, 0).fileMatchesIterator()]);
            assert.deepStrictEqual(getFolderMatchAtIndex(root0, 0).allDownstreamFileMatches(), Array.from(getFolderMatchAtIndex(root0, 0).fileMatchesIterator()));
            assert.deepStrictEqual(getFileMatchAtIndex(getFolderMatchAtIndex(root0, 0), 0).parent(), getFolderMatchAtIndex(root0, 0));
            assert.deepStrictEqual(getFolderMatchAtIndex(root0, 0).parent(), root0);
            assert.deepStrictEqual(getFolderMatchAtIndex(root0, 0).closestRoot, root0);
            root0DownstreamFiles.forEach((e) => {
                assert.deepStrictEqual(e.closestRoot, root0);
            });
            const root1DownstreamFiles = root1.allDownstreamFileMatches();
            assert.deepStrictEqual(root1.allDownstreamFileMatches(), [...root1.fileMatchesIterator(), ...getFolderMatchAtIndex(root1, 0).fileMatchesIterator()]); // excludes the matches from nested root
            assert.deepStrictEqual(getFileMatchAtIndex(getFolderMatchAtIndex(root1, 0), 0).parent(), getFolderMatchAtIndex(root1, 0));
            root1DownstreamFiles.forEach((e) => {
                assert.deepStrictEqual(e.closestRoot, root1);
            });
            const root2DownstreamFiles = root2.allDownstreamFileMatches();
            assert.deepStrictEqual(root2DownstreamFiles, Array.from(root2.fileMatchesIterator()));
            assert.deepStrictEqual(getFileMatchAtIndex(root2, 0).parent(), root2);
            assert.deepStrictEqual(getFileMatchAtIndex(root2, 0).closestRoot, root2);
            const root3DownstreamFiles = root3.allDownstreamFileMatches();
            const root3Level3Folder = getFolderMatchAtIndex(getFolderMatchAtIndex(root3, 0), 0);
            assert.deepStrictEqual(root3DownstreamFiles, [...root3.fileMatchesIterator(), ...getFolderMatchAtIndex(root3Level3Folder, 0).fileMatchesIterator(), ...getFolderMatchAtIndex(root3Level3Folder, 1).fileMatchesIterator()].flat());
            assert.deepStrictEqual(root3Level3Folder.allDownstreamFileMatches(), getFolderMatchAtIndex(root3, 0).allDownstreamFileMatches());
            assert.deepStrictEqual(getFileMatchAtIndex(getFolderMatchAtIndex(root3Level3Folder, 1), 0).parent(), getFolderMatchAtIndex(root3Level3Folder, 1));
            assert.deepStrictEqual(getFolderMatchAtIndex(root3Level3Folder, 1).parent(), root3Level3Folder);
            assert.deepStrictEqual(root3Level3Folder.parent(), getFolderMatchAtIndex(root3, 0));
            root3DownstreamFiles.forEach((e) => {
                assert.deepStrictEqual(e.closestRoot, root3);
            });
        });
        test('Removing an intermediate folder should call OnChange() on all downstream file matches', function () {
            const target = sinon.spy();
            const testObject = getPopulatedSearchResultForTreeTesting();
            const folderMatch = getFolderMatchAtIndex(getFolderMatchAtIndex(getFolderMatchAtIndex(testObject.folderMatches()[3], 0), 0), 0);
            const expectedArrayResult = folderMatch.allDownstreamFileMatches();
            store.add(testObject.onChange(target));
            testObject.remove(folderMatch);
            assert.ok(target.calledOnce);
            assert.deepStrictEqual([{ elements: expectedArrayResult, removed: true, added: false, clearingAll: false }], target.args[0]);
        });
        test('Replacing an intermediate folder should remove all downstream folders and file matches', async function () {
            const target = sinon.spy();
            const testObject = getPopulatedSearchResultForTreeTesting();
            const folderMatch = getFolderMatchAtIndex(testObject.folderMatches()[3], 0);
            const expectedArrayResult = folderMatch.allDownstreamFileMatches();
            store.add(testObject.onChange(target));
            await testObject.batchReplace([folderMatch]);
            assert.deepStrictEqual([{ elements: expectedArrayResult, removed: true, added: false }], target.args[0]);
        });
        function aFileMatch(path, searchResult, ...lineMatches) {
            if (!searchResult) {
                searchResult = aSearchResult();
            }
            const rawMatch = {
                resource: uri_1.URI.file('/' + path),
                results: lineMatches
            };
            const root = searchResult?.folderMatches()[0];
            const fileMatch = instantiationService.createInstance(searchModel_1.FileMatch, {
                pattern: ''
            }, undefined, undefined, root, rawMatch, null, '');
            store.add(fileMatch);
            return fileMatch;
        }
        function aSearchResult() {
            const searchModel = instantiationService.createInstance(searchModel_1.SearchModel);
            store.add(searchModel);
            searchModel.searchResult.query = {
                type: 2 /* QueryType.Text */, folderQueries: [{ folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)() }], contentPattern: {
                    pattern: ''
                }
            };
            return searchModel.searchResult;
        }
        function aRawMatch(resource, ...results) {
            return { resource: (0, searchTestCommon_1.createFileUriFromPathFromRoot)(resource), results };
        }
        function aRawFileMatchWithCells(resource, ...cellMatches) {
            return {
                resource: (0, searchTestCommon_1.createFileUriFromPathFromRoot)(resource),
                cellResults: cellMatches
            };
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
        function getPopulatedSearchResult() {
            const testObject = aSearchResult();
            testObject.query = {
                type: 2 /* QueryType.Text */,
                contentPattern: { pattern: 'foo' },
                folderQueries: [{
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/voo')
                    },
                    { folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/with') },
                ]
            };
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/voo/foo.a', new search_1.TextSearchMatch('preview 1', lineOneRange), new search_1.TextSearchMatch('preview 2', lineOneRange)),
                aRawMatch('/with/path/bar.b', new search_1.TextSearchMatch('preview 3', lineOneRange)),
                aRawMatch('/with/path.c', new search_1.TextSearchMatch('preview 4', lineOneRange), new search_1.TextSearchMatch('preview 5', lineOneRange)),
            ]);
            return testObject;
        }
        function getPopulatedSearchResultForTreeTesting() {
            const testObject = aSearchResult();
            testObject.query = {
                type: 2 /* QueryType.Text */,
                contentPattern: { pattern: 'foo' },
                folderQueries: [{
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/voo')
                    },
                    {
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/with')
                    },
                    {
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/with/test')
                    },
                    {
                        folder: (0, searchTestCommon_1.createFileUriFromPathFromRoot)('/eep')
                    },
                ]
            };
            /***
             * file structure looks like:
             * *voo/
             * |- foo.a
             * |- beep
             *    |- foo.c
             * 	  |- boop.c
             * *with/
             * |- path
             *    |- bar.b
             * |- path.c
             * |- *test/
             *    |- woo.c
             * eep/
             *    |- bar
             *       |- goo
             *           |- foo
             *              |- here.txt
             * 			 |- ooo
             *              |- there.txt
             *    |- eyy.y
             */
            (0, searchTestCommon_1.addToSearchResult)(testObject, [
                aRawMatch('/voo/foo.a', new search_1.TextSearchMatch('preview 1', lineOneRange), new search_1.TextSearchMatch('preview 2', lineOneRange)),
                aRawMatch('/voo/beep/foo.c', new search_1.TextSearchMatch('preview 1', lineOneRange), new search_1.TextSearchMatch('preview 2', lineOneRange)),
                aRawMatch('/voo/beep/boop.c', new search_1.TextSearchMatch('preview 3', lineOneRange)),
                aRawMatch('/with/path.c', new search_1.TextSearchMatch('preview 4', lineOneRange), new search_1.TextSearchMatch('preview 5', lineOneRange)),
                aRawMatch('/with/path/bar.b', new search_1.TextSearchMatch('preview 3', lineOneRange)),
                aRawMatch('/with/test/woo.c', new search_1.TextSearchMatch('preview 3', lineOneRange)),
                aRawMatch('/eep/bar/goo/foo/here.txt', new search_1.TextSearchMatch('preview 6', lineOneRange), new search_1.TextSearchMatch('preview 7', lineOneRange)),
                aRawMatch('/eep/bar/goo/ooo/there.txt', new search_1.TextSearchMatch('preview 6', lineOneRange), new search_1.TextSearchMatch('preview 7', lineOneRange)),
                aRawMatch('/eep/eyy.y', new search_1.TextSearchMatch('preview 6', lineOneRange), new search_1.TextSearchMatch('preview 7', lineOneRange))
            ]);
            return testObject;
        }
        function getFolderMatchAtIndex(parent, index) {
            return Array.from(parent.folderMatchesIterator())[index];
        }
        function getFileMatchAtIndex(parent, index) {
            return Array.from(parent.fileMatchesIterator())[index];
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoUmVzdWx0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC90ZXN0L2Jyb3dzZXIvc2VhcmNoUmVzdWx0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBdUNBLE1BQU0sWUFBWSxHQUFHLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRS9DLEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1FBRTFCLElBQUksb0JBQThDLENBQUM7UUFDbkQsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXhELEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7WUFDdEQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDZCQUFpQixFQUFFLHFDQUFvQixDQUFDLENBQUM7WUFDbkUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHFCQUFhLEVBQUUsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLG9CQUFvQixDQUFDLElBQUksQ0FBQyw4Q0FBc0IsRUFBRSx5QkFBeUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDbkcsTUFBTSxXQUFXLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksb0JBQWMsRUFBRSxDQUFDLENBQUM7WUFDMUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2QixNQUFNLGtCQUFrQixHQUFHLElBQUksdUNBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzlCLG9CQUFvQixDQUFDLElBQUksQ0FBQyxpQ0FBbUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ25FLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyx5QkFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELG9CQUFvQixDQUFDLElBQUksQ0FBQyx5QkFBZSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHFCQUFhLEVBQUUsSUFBSSxtQ0FBZ0IsRUFBRSxDQUFDLENBQUM7WUFDakUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFXLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbEIsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixFQUFFLElBQUssQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sU0FBUyxHQUFHLElBQUksbUJBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVHLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO1lBRTlFLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUMzQixNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLEVBQUUsSUFBSSx3QkFBZSxDQUFDLFNBQVMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUgsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNsQixJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFDN0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFakQsU0FBUyxHQUFHLFVBQVUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsc0NBQXNDLEVBQUU7WUFDNUMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUM1QixpQkFBaUIsRUFDakIsYUFBYSxFQUFFLEVBQ2YsSUFBSSx3QkFBZSxDQUFDLEtBQUssRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUNyRCxJQUFJLHdCQUFlLENBQUMsS0FBSyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4RCxVQUFVLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx1Q0FBdUMsRUFBRTtZQUM3QyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQzVCLGlCQUFpQixFQUNqQixhQUFhLEVBQUUsRUFDZixJQUFJLHdCQUFlLENBQUMsS0FBSyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ3JELElBQUksd0JBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTFCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVwQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHVEQUF1RCxFQUFFO1lBQzdELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FDNUIsaUJBQWlCLEVBQ2pCLGFBQWEsRUFBRSxFQUNmLElBQUksd0JBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDckQsSUFBSSx3QkFBZSxDQUFDLEtBQUssRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVwQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywyREFBMkQsRUFBRTtZQUNqRSxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsaUJBQWlCLEVBQzlDLGFBQWEsRUFBRSxFQUNmLElBQUksd0JBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDckQsSUFBSSx3QkFBZSxDQUFDLEtBQUssRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsc0JBQXNCLEVBQUU7WUFDNUIsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUM1QixpQkFBaUIsRUFDakIsYUFBYSxFQUFFLEVBQ2YsSUFBSSx3QkFBZSxDQUFDLEtBQUssRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUNyRCxJQUFJLHdCQUFlLENBQUMsS0FBSyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RCxVQUFVLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsVUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0NBQXdDLEVBQUU7WUFDOUMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUM1QixpQkFBaUIsRUFDakIsYUFBYSxFQUFFLEVBQ2YsSUFBSSx3QkFBZSxDQUFDLEtBQUssRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUNyRCxJQUFJLHdCQUFlLENBQUMsS0FBSyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RCxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxREFBcUQsRUFBRTtZQUUzRCxNQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUJBQVcsQ0FBQyxDQUFDO1lBQ3JFLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkIsTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDBCQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDcEYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN4QixNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksbUJBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssU0FBUyxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0REFBNEQsRUFBRTtZQUNsRSxNQUFNLFVBQVUsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUNuQyxNQUFNLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQzdCLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDM0QsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUM1RCxJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVsRCxJQUFBLG9DQUFpQixFQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV0QyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUUxQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUEsOEJBQVcsR0FBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFN0YsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUzQyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN4RCxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXRFLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdkUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw2QkFBNkIsRUFBRTtZQUNuQyxNQUFNLFVBQVUsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUNuQyxNQUFNLE1BQU0sR0FBRztnQkFDZCxTQUFTLENBQUMsSUFBSSxFQUNiLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDM0QsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxTQUFTLENBQUMsSUFBSSxFQUNiLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFBQyxDQUFDO1lBRW5ELElBQUEsb0NBQWlCLEVBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXRDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRTFDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBQSw4QkFBVyxHQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUU3RixJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV2RSxZQUFZLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN4RCxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdEQUFnRCxFQUFFO1lBQ3RELE1BQU0sVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFDO1lBQ25DLE1BQU0sS0FBSyxHQUFHLEVBQUUsUUFBUSxFQUFFLHlCQUFRLENBQUMsSUFBSSxFQUFvQixDQUFDO1lBQzVELE1BQU0sS0FBSyxHQUFHLEVBQUUsUUFBUSxFQUFFLHlCQUFRLENBQUMsSUFBSSxFQUFvQixDQUFDO1lBRTVELEtBQUssQ0FBQyxJQUFJLENBQUMsdUJBQVMsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFOUMsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyx5QkFBVyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUN0RSxNQUFNLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLEVBQzdDO2dCQUNDLElBQUksRUFBRSxLQUFLO2dCQUNYLEtBQUssRUFBRSxDQUFDO2dCQUNSLGNBQWMsRUFBRTtvQkFDZixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMzRDtnQkFDRCxjQUFjLEVBQUU7b0JBQ2YsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDNUQsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUM7aUJBQzlDO2FBQ0QsQ0FBRSxDQUFDO1lBQ0wsTUFBTSxVQUFVLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxFQUM3QztnQkFDQyxJQUFJLEVBQUUsS0FBSztnQkFDWCxLQUFLLEVBQUUsQ0FBQztnQkFDUixjQUFjLEVBQUU7b0JBQ2YsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxJQUFJLHFCQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDM0Q7Z0JBQ0QsY0FBYyxFQUFFO29CQUNmLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzVELElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDO2lCQUM5QzthQUNELENBQUMsQ0FBQztZQUNKLE1BQU0sTUFBTSxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXhDLElBQUEsb0NBQWlCLEVBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFpQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwSyxNQUFNLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBaUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDcEssTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQWlDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BLLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFpQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNySyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywwQkFBMEIsRUFBRTtZQUNoQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDNUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBRTVCLE1BQU0sVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFDO1lBQ25DLElBQUEsb0NBQWlCLEVBQUMsVUFBVSxFQUFFO2dCQUM3QixTQUFTLENBQUMsSUFBSSxFQUNiLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ2hELFNBQVMsQ0FBQyxJQUFJLEVBQ2IsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUFDLENBQUMsQ0FBQztZQUVwRCxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0RCxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUV0RCxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFckIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4QkFBOEIsRUFBRTtZQUNwQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDM0IsTUFBTSxVQUFVLEdBQUcsYUFBYSxFQUFFLENBQUM7WUFDbkMsSUFBQSxvQ0FBaUIsRUFBQyxVQUFVLEVBQUU7Z0JBQzdCLFNBQVMsQ0FBQyxJQUFJLEVBQ2IsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUFDLENBQUMsQ0FBQztZQUNwRCxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFdkMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUVsQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsb0NBQW9DLEVBQUU7WUFDMUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzNCLE1BQU0sVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFDO1lBQ25DLElBQUEsb0NBQWlCLEVBQUMsVUFBVSxFQUFFO2dCQUM3QixTQUFTLENBQUMsSUFBSSxFQUNiLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ2hELFNBQVMsQ0FBQyxJQUFJLEVBQ2IsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUFDLENBQUMsQ0FBQztZQUNwRCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFdkMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVqQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3RUFBd0UsRUFBRTtZQUM5RSxNQUFNLFVBQVUsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUNuQyxJQUFBLG9DQUFpQixFQUFDLFVBQVUsRUFBRTtnQkFDN0IsU0FBUyxDQUFDLElBQUksRUFDYixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQUMsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUU3QixNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWhDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHNDQUFzQyxFQUFFO1lBQzVDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHlCQUFlLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFDO1lBQ25DLElBQUEsb0NBQWlCLEVBQUMsVUFBVSxFQUFFO2dCQUM3QixTQUFTLENBQUMsSUFBSSxFQUNiLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFBQyxDQUFDLENBQUM7WUFFcEQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU1QyxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlDQUF5QyxFQUFFO1lBQy9DLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMzQixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyx5QkFBZSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNuRSxNQUFNLFVBQVUsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUNuQyxJQUFBLG9DQUFpQixFQUFDLFVBQVUsRUFBRTtnQkFDN0IsU0FBUyxDQUFDLElBQUksRUFDYixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQUMsQ0FBQyxDQUFDO1lBRXBELEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvQyxVQUFVLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRW5DLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQzVCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM3QixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekYsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywyQ0FBMkMsRUFBRTtZQUNqRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyx5QkFBZSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUMxRSxNQUFNLFVBQVUsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUNuQyxJQUFBLG9DQUFpQixFQUFDLFVBQVUsRUFBRTtnQkFDN0IsU0FBUyxDQUFDLElBQUksRUFDYixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUNoRCxTQUFTLENBQUMsSUFBSSxFQUNiLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFBQyxDQUFDLENBQUM7WUFFcEQsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFLLENBQUMsQ0FBQztZQUU3QixPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlEQUF5RCxFQUFFO1lBQy9ELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMzQixNQUFNLFVBQVUsR0FBRyx3QkFBd0IsRUFBRSxDQUFDO1lBRTlDLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RSxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV2RixNQUFNLGFBQWEsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEQsTUFBTSxtQkFBbUIsR0FBRyxXQUFXLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV2RyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN2QyxVQUFVLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXRDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywwREFBMEQsRUFBRSxLQUFLO1lBQ3JFLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMvQixvQkFBb0IsQ0FBQyxJQUFJLENBQUMseUJBQWUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDbEUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3hCLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsQ0FBQztxQkFBTSxDQUFDO29CQUNQLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakIsQ0FBQztnQkFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMzQixNQUFNLFVBQVUsR0FBRyx3QkFBd0IsRUFBRSxDQUFDO1lBRTlDLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RSxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV2RixNQUFNLGtCQUFrQixHQUFHLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXJFLE1BQU0sYUFBYSxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV0RCxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLFVBQVUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFN0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2xFLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDMUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywwRUFBMEUsRUFBRTtZQUNoRixNQUFNLFVBQVUsR0FBRyxzQ0FBc0MsRUFBRSxDQUFDO1lBRTVELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QyxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU1QyxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzlELE1BQU0sQ0FBQyxlQUFlLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEdBQUcscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pJLE1BQU0sQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEosTUFBTSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUgsTUFBTSxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDeEUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzNFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNsQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzlELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEdBQUcscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsd0NBQXdDO1lBQzlMLE1BQU0sQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLHFCQUFxQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFILG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNsQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzlELE1BQU0sQ0FBQyxlQUFlLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBR3pFLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDOUQsTUFBTSxpQkFBaUIsR0FBRyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEVBQUUsR0FBRyxxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEdBQUcscUJBQXFCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbE8sTUFBTSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLHFCQUFxQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7WUFFakksTUFBTSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xKLE1BQU0sQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNoRyxNQUFNLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxFQUFFLHFCQUFxQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXBGLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNsQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx1RkFBdUYsRUFBRTtZQUM3RixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDM0IsTUFBTSxVQUFVLEdBQUcsc0NBQXNDLEVBQUUsQ0FBQztZQUU1RCxNQUFNLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEksTUFBTSxtQkFBbUIsR0FBRyxXQUFXLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUVuRSxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN2QyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdGQUF3RixFQUFFLEtBQUs7WUFDbkcsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzNCLE1BQU0sVUFBVSxHQUFHLHNDQUFzQyxFQUFFLENBQUM7WUFFNUQsTUFBTSxXQUFXLEdBQUcscUJBQXFCLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTVFLE1BQU0sbUJBQW1CLEdBQUcsV0FBVyxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFFbkUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTSxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFMUcsQ0FBQyxDQUFDLENBQUM7UUFFSCxTQUFTLFVBQVUsQ0FBQyxJQUFZLEVBQUUsWUFBc0MsRUFBRSxHQUFHLFdBQStCO1lBQzNHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDbkIsWUFBWSxHQUFHLGFBQWEsRUFBRSxDQUFDO1lBQ2hDLENBQUM7WUFDRCxNQUFNLFFBQVEsR0FBZTtnQkFDNUIsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztnQkFDOUIsT0FBTyxFQUFFLFdBQVc7YUFDcEIsQ0FBQztZQUNGLE1BQU0sSUFBSSxHQUFHLFlBQVksRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxNQUFNLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsdUJBQVMsRUFBRTtnQkFDaEUsT0FBTyxFQUFFLEVBQUU7YUFDWCxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFbkQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsU0FBUyxhQUFhO1lBQ3JCLE1BQU0sV0FBVyxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx5QkFBVyxDQUFDLENBQUM7WUFDckUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2QixXQUFXLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRztnQkFDaEMsSUFBSSx3QkFBZ0IsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFBLGdEQUE2QixHQUFFLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRTtvQkFDbkcsT0FBTyxFQUFFLEVBQUU7aUJBQ1g7YUFDRCxDQUFDO1lBQ0YsT0FBTyxXQUFXLENBQUMsWUFBWSxDQUFDO1FBQ2pDLENBQUM7UUFFRCxTQUFTLFNBQVMsQ0FBQyxRQUFnQixFQUFFLEdBQUcsT0FBMkI7WUFDbEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFBLGdEQUE2QixFQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxTQUFTLHNCQUFzQixDQUFDLFFBQWdCLEVBQUUsR0FBRyxXQUEwQztZQUM5RixPQUFPO2dCQUNOLFFBQVEsRUFBRSxJQUFBLGdEQUE2QixFQUFDLFFBQVEsQ0FBQztnQkFDakQsV0FBVyxFQUFFLFdBQVc7YUFDeEIsQ0FBQztRQUNILENBQUM7UUFFRCxTQUFTLGdCQUFnQixDQUFDLG9CQUE4QztZQUN2RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsNEJBQWEsRUFBRSxJQUFJLG1DQUFnQixFQUFFLENBQUMsQ0FBQztZQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7WUFDOUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzlELG9CQUFvQixDQUFDLElBQUksQ0FBQyxxQ0FBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN6RCxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMkJBQVksQ0FBQyxDQUFDO1lBQ3ZFLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEIsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQztRQUVELFNBQVMseUJBQXlCLENBQUMsb0JBQThDO1lBQ2hGLG9CQUFvQixDQUFDLElBQUksQ0FBQywwQ0FBb0IsRUFBRSxJQUFJLCtDQUF1QixFQUFFLENBQUMsQ0FBQztZQUMvRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsK0JBQWtCLEVBQUUsSUFBSSw2Q0FBcUIsRUFBRSxDQUFDLENBQUM7WUFDM0Usb0JBQW9CLENBQUMsSUFBSSxDQUFDLDhCQUFjLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHlDQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sMkJBQTJCLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVEQUEyQixDQUFDLENBQUM7WUFDckcsS0FBSyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sMkJBQTJCLENBQUM7UUFDcEMsQ0FBQztRQUVELFNBQVMsd0JBQXdCO1lBQ2hDLE1BQU0sVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFDO1lBRW5DLFVBQVUsQ0FBQyxLQUFLLEdBQUc7Z0JBQ2xCLElBQUksd0JBQWdCO2dCQUNwQixjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO2dCQUNsQyxhQUFhLEVBQUUsQ0FBQzt3QkFDZixNQUFNLEVBQUUsSUFBQSxnREFBNkIsRUFBQyxNQUFNLENBQUM7cUJBQzdDO29CQUNELEVBQUUsTUFBTSxFQUFFLElBQUEsZ0RBQTZCLEVBQUMsT0FBTyxDQUFDLEVBQUU7aUJBQ2pEO2FBQ0QsQ0FBQztZQUVGLElBQUEsb0NBQWlCLEVBQUMsVUFBVSxFQUFFO2dCQUM3QixTQUFTLENBQUMsWUFBWSxFQUNyQixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ2hHLFNBQVMsQ0FBQyxrQkFBa0IsRUFDM0IsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDaEQsU0FBUyxDQUFDLGNBQWMsRUFDdkIsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRSxJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQ2hHLENBQUMsQ0FBQztZQUNILE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFFRCxTQUFTLHNDQUFzQztZQUM5QyxNQUFNLFVBQVUsR0FBRyxhQUFhLEVBQUUsQ0FBQztZQUVuQyxVQUFVLENBQUMsS0FBSyxHQUFHO2dCQUNsQixJQUFJLHdCQUFnQjtnQkFDcEIsY0FBYyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtnQkFDbEMsYUFBYSxFQUFFLENBQUM7d0JBQ2YsTUFBTSxFQUFFLElBQUEsZ0RBQTZCLEVBQUMsTUFBTSxDQUFDO3FCQUM3QztvQkFDRDt3QkFDQyxNQUFNLEVBQUUsSUFBQSxnREFBNkIsRUFBQyxPQUFPLENBQUM7cUJBQzlDO29CQUNEO3dCQUNDLE1BQU0sRUFBRSxJQUFBLGdEQUE2QixFQUFDLFlBQVksQ0FBQztxQkFDbkQ7b0JBQ0Q7d0JBQ0MsTUFBTSxFQUFFLElBQUEsZ0RBQTZCLEVBQUMsTUFBTSxDQUFDO3FCQUM3QztpQkFDQTthQUNELENBQUM7WUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBcUJHO1lBRUgsSUFBQSxvQ0FBaUIsRUFBQyxVQUFVLEVBQUU7Z0JBQzdCLFNBQVMsQ0FBQyxZQUFZLEVBQ3JCLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLEVBQUUsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDaEcsU0FBUyxDQUFDLGlCQUFpQixFQUMxQixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ2hHLFNBQVMsQ0FBQyxrQkFBa0IsRUFDM0IsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDaEQsU0FBUyxDQUFDLGNBQWMsRUFDdkIsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRSxJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUNoRyxTQUFTLENBQUMsa0JBQWtCLEVBQzNCLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ2hELFNBQVMsQ0FBQyxrQkFBa0IsRUFDM0IsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDaEQsU0FBUyxDQUFDLDJCQUEyQixFQUNwQyxJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ2hHLFNBQVMsQ0FBQyw0QkFBNEIsRUFDckMsSUFBSSx3QkFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRSxJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUNoRyxTQUFTLENBQUMsWUFBWSxFQUNyQixJQUFJLHdCQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFFLElBQUksd0JBQWUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDaEcsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztRQUVELFNBQVMscUJBQXFCLENBQUMsTUFBbUIsRUFBRSxLQUFhO1lBQ2hFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCxTQUFTLG1CQUFtQixDQUFDLE1BQW1CLEVBQUUsS0FBYTtZQUM5RCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4RCxDQUFDO0lBQ0YsQ0FBQyxDQUFDLENBQUMifQ==
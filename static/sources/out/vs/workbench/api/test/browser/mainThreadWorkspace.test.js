/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/workbench/api/browser/mainThreadWorkspace", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/services/search/common/search", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, cancellation_1, utils_1, configuration_1, mainThreadWorkspace_1, testRPCProtocol_1, search_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadWorkspace', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let configService;
        let instantiationService;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            configService = instantiationService.get(configuration_1.IConfigurationService);
            configService.setUserConfiguration('search', {});
        });
        test('simple', () => {
            instantiationService.stub(search_1.ISearchService, {
                fileSearch(query) {
                    assert.strictEqual(query.folderQueries.length, 1);
                    assert.strictEqual(query.folderQueries[0].disregardIgnoreFiles, true);
                    assert.deepStrictEqual({ ...query.includePattern }, { 'foo': true });
                    assert.strictEqual(query.maxResults, 10);
                    return Promise.resolve({ results: [], messages: [] });
                }
            });
            const mtw = disposables.add(instantiationService.createInstance(mainThreadWorkspace_1.MainThreadWorkspace, (0, testRPCProtocol_1.SingleProxyRPCProtocol)({ $initializeWorkspace: () => { } })));
            return mtw.$startFileSearch('foo', null, null, 10, new cancellation_1.CancellationTokenSource().token);
        });
        test('exclude defaults', () => {
            configService.setUserConfiguration('search', {
                'exclude': { 'searchExclude': true }
            });
            configService.setUserConfiguration('files', {
                'exclude': { 'filesExclude': true }
            });
            instantiationService.stub(search_1.ISearchService, {
                fileSearch(query) {
                    assert.strictEqual(query.folderQueries.length, 1);
                    assert.strictEqual(query.folderQueries[0].disregardIgnoreFiles, true);
                    assert.deepStrictEqual(query.folderQueries[0].excludePattern, { 'filesExclude': true });
                    return Promise.resolve({ results: [], messages: [] });
                }
            });
            const mtw = disposables.add(instantiationService.createInstance(mainThreadWorkspace_1.MainThreadWorkspace, (0, testRPCProtocol_1.SingleProxyRPCProtocol)({ $initializeWorkspace: () => { } })));
            return mtw.$startFileSearch('', null, null, 10, new cancellation_1.CancellationTokenSource().token);
        });
        test('disregard excludes', () => {
            configService.setUserConfiguration('search', {
                'exclude': { 'searchExclude': true }
            });
            configService.setUserConfiguration('files', {
                'exclude': { 'filesExclude': true }
            });
            instantiationService.stub(search_1.ISearchService, {
                fileSearch(query) {
                    assert.strictEqual(query.folderQueries[0].excludePattern, undefined);
                    assert.deepStrictEqual(query.excludePattern, undefined);
                    return Promise.resolve({ results: [], messages: [] });
                }
            });
            const mtw = disposables.add(instantiationService.createInstance(mainThreadWorkspace_1.MainThreadWorkspace, (0, testRPCProtocol_1.SingleProxyRPCProtocol)({ $initializeWorkspace: () => { } })));
            return mtw.$startFileSearch('', null, false, 10, new cancellation_1.CancellationTokenSource().token);
        });
        test('exclude string', () => {
            instantiationService.stub(search_1.ISearchService, {
                fileSearch(query) {
                    assert.strictEqual(query.folderQueries[0].excludePattern, undefined);
                    assert.deepStrictEqual({ ...query.excludePattern }, { 'exclude/**': true });
                    return Promise.resolve({ results: [], messages: [] });
                }
            });
            const mtw = disposables.add(instantiationService.createInstance(mainThreadWorkspace_1.MainThreadWorkspace, (0, testRPCProtocol_1.SingleProxyRPCProtocol)({ $initializeWorkspace: () => { } })));
            return mtw.$startFileSearch('', null, 'exclude/**', 10, new cancellation_1.CancellationTokenSource().token);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFdvcmtzcGFjZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9tYWluVGhyZWFkV29ya3NwYWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFhaEcsS0FBSyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtRQUNqQyxNQUFNLFdBQVcsR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFOUQsSUFBSSxhQUF1QyxDQUFDO1FBQzVDLElBQUksb0JBQThDLENBQUM7UUFFbkQsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLG9CQUFvQixHQUFHLElBQUEscURBQTZCLEVBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBNkIsQ0FBQztZQUV6RyxhQUFhLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUE2QixDQUFDO1lBQzVGLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUNuQixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUJBQWMsRUFBRTtnQkFDekMsVUFBVSxDQUFDLEtBQWlCO29CQUMzQixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBRXRFLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJ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
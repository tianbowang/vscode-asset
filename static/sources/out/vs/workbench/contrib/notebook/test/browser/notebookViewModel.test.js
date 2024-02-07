/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl", "vs/workbench/contrib/notebook/browser/viewModel/viewContext", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/base/test/common/utils"], function (require, exports, assert, lifecycle_1, uri_1, bulkEditService_1, model_1, language_1, resolverService_1, configuration_1, testConfigurationService_1, themeService_1, testThemeService_1, undoRedo_1, cellOperations_1, eventDispatcher_1, notebookViewModelImpl_1, viewContext_1, notebookTextModel_1, notebookCommon_1, notebookOptions_1, testNotebookEditor_1, notebookExecutionStateService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookViewModel', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let disposables;
        let instantiationService;
        let textModelService;
        let bulkEditService;
        let undoRedoService;
        let modelService;
        let languageService;
        let notebookExecutionStateService;
        suiteSetup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, testNotebookEditor_1.setupInstantiationService)(disposables);
            textModelService = instantiationService.get(resolverService_1.ITextModelService);
            bulkEditService = instantiationService.get(bulkEditService_1.IBulkEditService);
            undoRedoService = instantiationService.get(undoRedo_1.IUndoRedoService);
            modelService = instantiationService.get(model_1.IModelService);
            languageService = instantiationService.get(language_1.ILanguageService);
            notebookExecutionStateService = instantiationService.get(notebookExecutionStateService_1.INotebookExecutionStateService);
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
        });
        suiteTeardown(() => disposables.dispose());
        test('ctor', function () {
            const notebook = new notebookTextModel_1.NotebookTextModel('notebook', uri_1.URI.parse('test'), [], {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} }, undoRedoService, modelService, languageService);
            const model = new testNotebookEditor_1.NotebookEditorTestModel(notebook);
            const options = new notebookOptions_1.NotebookOptions(instantiationService.get(configuration_1.IConfigurationService), instantiationService.get(notebookExecutionStateService_1.INotebookExecutionStateService), false);
            const eventDispatcher = new eventDispatcher_1.NotebookEventDispatcher();
            const viewContext = new viewContext_1.ViewContext(options, eventDispatcher, () => ({}));
            const viewModel = new notebookViewModelImpl_1.NotebookViewModel('notebook', model.notebook, viewContext, null, { isReadOnly: false }, instantiationService, bulkEditService, undoRedoService, textModelService, notebookExecutionStateService);
            assert.strictEqual(viewModel.viewType, 'notebook');
            notebook.dispose();
            model.dispose();
            options.dispose();
            eventDispatcher.dispose();
            viewModel.dispose();
        });
        test('insert/delete', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel) => {
                const cell = (0, cellOperations_1.insertCellAtIndex)(viewModel, 1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.strictEqual(viewModel.length, 3);
                assert.strictEqual(viewModel.notebookDocument.cells.length, 3);
                assert.strictEqual(viewModel.getCellIndex(cell), 1);
                (0, cellOperations_1.runDeleteAction)(editor, viewModel.cellAt(1));
                assert.strictEqual(viewModel.length, 2);
                assert.strictEqual(viewModel.notebookDocument.cells.length, 2);
                assert.strictEqual(viewModel.getCellIndex(cell), -1);
                cell.dispose();
                cell.model.dispose();
            });
        });
        test('index', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel) => {
                const firstViewCell = viewModel.cellAt(0);
                const lastViewCell = viewModel.cellAt(viewModel.length - 1);
                const insertIndex = viewModel.getCellIndex(firstViewCell) + 1;
                const cell = (0, cellOperations_1.insertCellAtIndex)(viewModel, insertIndex, 'var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                const addedCellIndex = viewModel.getCellIndex(cell);
                (0, cellOperations_1.runDeleteAction)(editor, viewModel.cellAt(addedCellIndex));
                const secondInsertIndex = viewModel.getCellIndex(lastViewCell) + 1;
                const cell2 = (0, cellOperations_1.insertCellAtIndex)(viewModel, secondInsertIndex, 'var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.strictEqual(viewModel.length, 3);
                assert.strictEqual(viewModel.notebookDocument.cells.length, 3);
                assert.strictEqual(viewModel.getCellIndex(cell2), 2);
                cell.dispose();
                cell.model.dispose();
                cell2.dispose();
                cell2.model.dispose();
            });
        });
    });
    function getVisibleCells(cells, hiddenRanges) {
        if (!hiddenRanges.length) {
            return cells;
        }
        let start = 0;
        let hiddenRangeIndex = 0;
        const result = [];
        while (start < cells.length && hiddenRangeIndex < hiddenRanges.length) {
            if (start < hiddenRanges[hiddenRangeIndex].start) {
                result.push(...cells.slice(start, hiddenRanges[hiddenRangeIndex].start));
            }
            start = hiddenRanges[hiddenRangeIndex].end + 1;
            hiddenRangeIndex++;
        }
        if (start < cells.length) {
            result.push(...cells.slice(start));
        }
        return result;
    }
    suite('NotebookViewModel Decorations', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('tracking range', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor, viewModel) => {
                const trackedId = viewModel.setTrackedRange('test', { start: 1, end: 2 }, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 2,
                });
                const cell1 = (0, cellOperations_1.insertCellAtIndex)(viewModel, 0, 'var d = 6;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 2,
                    end: 3
                });
                (0, cellOperations_1.runDeleteAction)(editor, viewModel.cellAt(0));
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 2
                });
                const cell2 = (0, cellOperations_1.insertCellAtIndex)(viewModel, 3, 'var d = 7;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 3
                });
                (0, cellOperations_1.runDeleteAction)(editor, viewModel.cellAt(3));
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 2
                });
                (0, cellOperations_1.runDeleteAction)(editor, viewModel.cellAt(1));
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 0,
                    end: 1
                });
                cell1.dispose();
                cell1.model.dispose();
                cell2.dispose();
                cell2.model.dispose();
            });
        });
        test('tracking range 2', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor, viewModel) => {
                const trackedId = viewModel.setTrackedRange('test', { start: 1, end: 3 }, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 3
                });
                (0, cellOperations_1.insertCellAtIndex)(viewModel, 5, 'var d = 9;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 3
                });
                (0, cellOperations_1.insertCellAtIndex)(viewModel, 4, 'var d = 10;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 4
                });
            });
        });
        test('diff hidden ranges', async function () {
            assert.deepStrictEqual(getVisibleCells([1, 2, 3, 4, 5], []), [1, 2, 3, 4, 5]);
            assert.deepStrictEqual(getVisibleCells([1, 2, 3, 4, 5], [{ start: 1, end: 2 }]), [1, 4, 5]);
            assert.deepStrictEqual(getVisibleCells([1, 2, 3, 4, 5, 6, 7, 8, 9], [
                { start: 1, end: 2 },
                { start: 4, end: 5 }
            ]), [1, 4, 7, 8, 9]);
            const original = getVisibleCells([1, 2, 3, 4, 5, 6, 7, 8, 9], [
                { start: 1, end: 2 },
                { start: 4, end: 5 }
            ]);
            const modified = getVisibleCells([1, 2, 3, 4, 5, 6, 7, 8, 9], [
                { start: 2, end: 4 }
            ]);
            assert.deepStrictEqual((0, notebookCommon_1.diff)(original, modified, (a) => {
                return original.indexOf(a) >= 0;
            }), [{ start: 1, deleteCount: 1, toInsert: [2, 6] }]);
        });
    });
    suite('NotebookViewModel API', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('#115432, get nearest code cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['b = 2;', 'python', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header d', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 4;', 'TypeScript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header f', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], (editor, viewModel) => {
                assert.strictEqual(viewModel.nearestCodeCellIndex(0), 1);
                // find the nearest code cell from above
                assert.strictEqual(viewModel.nearestCodeCellIndex(2), 1);
                assert.strictEqual(viewModel.nearestCodeCellIndex(4), 3);
                assert.strictEqual(viewModel.nearestCodeCellIndex(5), 4);
                assert.strictEqual(viewModel.nearestCodeCellIndex(6), 4);
            });
        });
        test('#108464, get nearest code cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], (editor, viewModel) => {
                assert.strictEqual(viewModel.nearestCodeCellIndex(2), 1);
            });
        });
        test('getCells', async () => {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], (editor, viewModel) => {
                assert.strictEqual(viewModel.getCellsInRange().length, 3);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 0, end: 1 }).map(cell => cell.getText()), ['# header a']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 0, end: 2 }).map(cell => cell.getText()), ['# header a', 'var b = 1;']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 0, end: 3 }).map(cell => cell.getText()), ['# header a', 'var b = 1;', '# header b']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 0, end: 4 }).map(cell => cell.getText()), ['# header a', 'var b = 1;', '# header b']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 1, end: 4 }).map(cell => cell.getText()), ['var b = 1;', '# header b']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 2, end: 4 }).map(cell => cell.getText()), ['# header b']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 3, end: 4 }).map(cell => cell.getText()), []);
                // no one should use an invalid range but `getCells` should be able to handle that.
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: -1, end: 1 }).map(cell => cell.getText()), ['# header a']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 3, end: 0 }).map(cell => cell.getText()), ['# header a', 'var b = 1;', '# header b']);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tWaWV3TW9kZWwudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svdGVzdC9icm93c2VyL25vdGVib29rVmlld01vZGVsLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUE2QmhHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFDL0IsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLG9CQUE4QyxDQUFDO1FBQ25ELElBQUksZ0JBQW1DLENBQUM7UUFDeEMsSUFBSSxlQUFpQyxDQUFDO1FBQ3RDLElBQUksZUFBaUMsQ0FBQztRQUN0QyxJQUFJLFlBQTJCLENBQUM7UUFDaEMsSUFBSSxlQUFpQyxDQUFDO1FBQ3RDLElBQUksNkJBQTZELENBQUM7UUFFbEUsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNmLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNwQyxvQkFBb0IsR0FBRyxJQUFBLDhDQUF5QixFQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzlELGdCQUFnQixHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxtQ0FBaUIsQ0FBQyxDQUFDO1lBQy9ELGVBQWUsR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsa0NBQWdCLENBQUMsQ0FBQztZQUM3RCxlQUFlLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7WUFDN0QsWUFBWSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7WUFDdkQsZUFBZSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1lBQzdELDZCQUE2QixHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FB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QUMsQ0FBQztnQkFDbEksTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDaEosTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDaEosTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNsSSxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDcEgsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFeEcsbUZBQW1GO2dCQUNuRixNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNySCxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2pKLENBQUMsQ0FDRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9
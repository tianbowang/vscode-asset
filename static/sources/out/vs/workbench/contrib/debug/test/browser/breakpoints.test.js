/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/common/model", "vs/editor/common/services/languageService", "vs/editor/test/common/testTextModel", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/workbench/contrib/debug/browser/breakpointEditorContribution", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/test/browser/callStack.test", "vs/workbench/contrib/debug/test/browser/mockDebugModel", "vs/workbench/contrib/debug/test/common/mockDebug", "vs/workbench/services/label/test/common/mockLabelService", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, htmlContent_1, lifecycle_1, uri_1, utils_1, range_1, language_1, model_1, languageService_1, testTextModel_1, instantiationServiceMock_1, label_1, log_1, breakpointEditorContribution_1, breakpointsView_1, debug_1, debugModel_1, callStack_test_1, mockDebugModel_1, mockDebug_1, mockLabelService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function addBreakpointsAndCheckEvents(model, uri, data) {
        let eventCount = 0;
        const toDispose = model.onDidChangeBreakpoints(e => {
            assert.strictEqual(e?.sessionOnly, false);
            assert.strictEqual(e?.changed, undefined);
            assert.strictEqual(e?.removed, undefined);
            const added = e?.added;
            assert.notStrictEqual(added, undefined);
            assert.strictEqual(added.length, data.length);
            eventCount++;
            (0, lifecycle_1.dispose)(toDispose);
            for (let i = 0; i < data.length; i++) {
                assert.strictEqual(e.added[i] instanceof debugModel_1.Breakpoint, true);
                assert.strictEqual(e.added[i].lineNumber, data[i].lineNumber);
            }
        });
        const bps = model.addBreakpoints(uri, data);
        assert.strictEqual(eventCount, 1);
        return bps;
    }
    suite('Debug - Breakpoints', () => {
        let model;
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            model = (0, mockDebugModel_1.createMockDebugModel)(disposables);
        });
        // Breakpoints
        test('simple', () => {
            const modelUri = uri_1.URI.file('/myfolder/myfile.js');
            addBreakpointsAndCheckEvents(model, modelUri, [{ lineNumber: 5, enabled: true }, { lineNumber: 10, enabled: false }]);
            assert.strictEqual(model.areBreakpointsActivated(), true);
            assert.strictEqual(model.getBreakpoints().length, 2);
            let eventCount = 0;
            const toDispose = model.onDidChangeBreakpoints(e => {
                eventCount++;
                assert.strictEqual(e?.added, undefined);
                assert.strictEqual(e?.sessionOnly, false);
                assert.strictEqual(e?.removed?.length, 2);
                assert.strictEqual(e?.changed, undefined);
                (0, lifecycle_1.dispose)(toDispose);
            });
            model.removeBreakpoints(model.getBreakpoints());
            assert.strictEqual(eventCount, 1);
            assert.strictEqual(model.getBreakpoints().length, 0);
        });
        test('toggling', () => {
            const modelUri = uri_1.URI.file('/myfolder/myfile.js');
            addBreakpointsAndCheckEvents(model, modelUri, [{ lineNumber: 5, enabled: true }, { lineNumber: 10, enabled: false }]);
            addBreakpointsAndCheckEvents(model, modelUri, [{ lineNumber: 12, enabled: true, condition: 'fake condition' }]);
            assert.strictEqual(model.getBreakpoints().length, 3);
            const bp = model.getBreakpoints().pop();
            if (bp) {
                model.removeBreakpoints([bp]);
            }
            assert.strictEqual(model.getBreakpoints().length, 2);
            model.setBreakpointsActivated(false);
            assert.strictEqual(model.areBreakpointsActivated(), false);
            model.setBreakpointsActivated(true);
            assert.strictEqual(model.areBreakpointsActivated(), true);
        });
        test('two files', () => {
            const modelUri1 = uri_1.URI.file('/myfolder/my file first.js');
            const modelUri2 = uri_1.URI.file('/secondfolder/second/second file.js');
            addBreakpointsAndCheckEvents(model, modelUri1, [{ lineNumber: 5, enabled: true }, { lineNumber: 10, enabled: false }]);
            assert.strictEqual((0, breakpointsView_1.getExpandedBodySize)(model, undefined, 9), 44);
            addBreakpointsAndCheckEvents(model, modelUri2, [{ lineNumber: 1, enabled: true }, { lineNumber: 2, enabled: true }, { lineNumber: 3, enabled: false }]);
            assert.strictEqual((0, breakpointsView_1.getExpandedBodySize)(model, undefined, 9), 110);
            assert.strictEqual(model.getBreakpoints().length, 5);
            assert.strictEqual(model.getBreakpoints({ uri: modelUri1 }).length, 2);
            assert.strictEqual(model.getBreakpoints({ uri: modelUri2 }).length, 3);
            assert.strictEqual(model.getBreakpoints({ lineNumber: 5 }).length, 1);
            assert.strictEqual(model.getBreakpoints({ column: 5 }).length, 0);
            const bp = model.getBreakpoints()[0];
            const update = new Map();
            update.set(bp.getId(), { lineNumber: 100 });
            let eventFired = false;
            const toDispose = model.onDidChangeBreakpoints(e => {
                eventFired = true;
                assert.strictEqual(e?.added, undefined);
                assert.strictEqual(e?.removed, undefined);
                assert.strictEqual(e?.changed?.length, 1);
                (0, lifecycle_1.dispose)(toDispose);
            });
            model.updateBreakpoints(update);
            assert.strictEqual(eventFired, true);
            assert.strictEqual(bp.lineNumber, 100);
            assert.strictEqual(model.getBreakpoints({ enabledOnly: true }).length, 3);
            model.enableOrDisableAllBreakpoints(false);
            model.getBreakpoints().forEach(bp => {
                assert.strictEqual(bp.enabled, false);
            });
            assert.strictEqual(model.getBreakpoints({ enabledOnly: true }).length, 0);
            model.setEnablement(bp, true);
            assert.strictEqual(bp.enabled, true);
            model.removeBreakpoints(model.getBreakpoints({ uri: modelUri1 }));
            assert.strictEqual((0, breakpointsView_1.getExpandedBodySize)(model, undefined, 9), 66);
            assert.strictEqual(model.getBreakpoints().length, 3);
        });
        test('conditions', () => {
            const modelUri1 = uri_1.URI.file('/myfolder/my file first.js');
            addBreakpointsAndCheckEvents(model, modelUri1, [{ lineNumber: 5, condition: 'i < 5', hitCondition: '17' }, { lineNumber: 10, condition: 'j < 3' }]);
            const breakpoints = model.getBreakpoints();
            assert.strictEqual(breakpoints[0].condition, 'i < 5');
            assert.strictEqual(breakpoints[0].hitCondition, '17');
            assert.strictEqual(breakpoints[1].condition, 'j < 3');
            assert.strictEqual(!!breakpoints[1].hitCondition, false);
            assert.strictEqual(model.getBreakpoints().length, 2);
            model.removeBreakpoints(model.getBreakpoints());
            assert.strictEqual(model.getBreakpoints().length, 0);
        });
        test('function breakpoints', () => {
            model.addFunctionBreakpoint('foo', '1');
            model.addFunctionBreakpoint('bar', '2');
            model.updateFunctionBreakpoint('1', { name: 'fooUpdated' });
            model.updateFunctionBreakpoint('2', { name: 'barUpdated' });
            const functionBps = model.getFunctionBreakpoints();
            assert.strictEqual(functionBps[0].name, 'fooUpdated');
            assert.strictEqual(functionBps[1].name, 'barUpdated');
            model.removeFunctionBreakpoints();
            assert.strictEqual(model.getFunctionBreakpoints().length, 0);
        });
        test('multiple sessions', () => {
            const modelUri = uri_1.URI.file('/myfolder/myfile.js');
            addBreakpointsAndCheckEvents(model, modelUri, [{ lineNumber: 5, enabled: true, condition: 'x > 5' }, { lineNumber: 10, enabled: false }]);
            const breakpoints = model.getBreakpoints();
            const session = disposables.add((0, callStack_test_1.createTestSession)(model));
            const data = new Map();
            assert.strictEqual(breakpoints[0].lineNumber, 5);
            assert.strictEqual(breakpoints[1].lineNumber, 10);
            data.set(breakpoints[0].getId(), { verified: false, line: 10 });
            data.set(breakpoints[1].getId(), { verified: true, line: 50 });
            model.setBreakpointSessionData(session.getId(), {}, data);
            assert.strictEqual(breakpoints[0].lineNumber, 5);
            assert.strictEqual(breakpoints[1].lineNumber, 50);
            const session2 = disposables.add((0, callStack_test_1.createTestSession)(model));
            const data2 = new Map();
            data2.set(breakpoints[0].getId(), { verified: true, line: 100 });
            data2.set(breakpoints[1].getId(), { verified: true, line: 500 });
            model.setBreakpointSessionData(session2.getId(), {}, data2);
            // Breakpoint is verified only once, show that line
            assert.strictEqual(breakpoints[0].lineNumber, 100);
            // Breakpoint is verified two times, show the original line
            assert.strictEqual(breakpoints[1].lineNumber, 10);
            model.setBreakpointSessionData(session.getId(), {}, undefined);
            // No more double session verification
            assert.strictEqual(breakpoints[0].lineNumber, 100);
            assert.strictEqual(breakpoints[1].lineNumber, 500);
            assert.strictEqual(breakpoints[0].supported, false);
            const data3 = new Map();
            data3.set(breakpoints[0].getId(), { verified: true, line: 500 });
            model.setBreakpointSessionData(session2.getId(), { supportsConditionalBreakpoints: true }, data2);
            assert.strictEqual(breakpoints[0].supported, true);
        });
        test('exception breakpoints', () => {
            let eventCount = 0;
            disposables.add(model.onDidChangeBreakpoints(() => eventCount++));
            model.setExceptionBreakpointsForSession("session-id-1", [{ filter: 'uncaught', label: 'UNCAUGHT', default: true }]);
            assert.strictEqual(eventCount, 1);
            let exceptionBreakpoints = model.getExceptionBreakpointsForSession("session-id-1");
            assert.strictEqual(exceptionBreakpoints.length, 1);
            assert.strictEqual(exceptionBreakpoints[0].filter, 'uncaught');
            assert.strictEqual(exceptionBreakpoints[0].enabled, true);
            model.setExceptionBreakpointsForSession("session-id-2", [{ filter: 'uncaught', label: 'UNCAUGHT' }, { filter: 'caught', label: 'CAUGHT' }]);
            assert.strictEqual(eventCount, 2);
            exceptionBreakpoints = model.getExceptionBreakpointsForSession("session-id-2");
            assert.strictEqual(exceptionBreakpoints.length, 2);
            assert.strictEqual(exceptionBreakpoints[0].filter, 'uncaught');
            assert.strictEqual(exceptionBreakpoints[0].enabled, true);
            assert.strictEqual(exceptionBreakpoints[1].filter, 'caught');
            assert.strictEqual(exceptionBreakpoints[1].label, 'CAUGHT');
            assert.strictEqual(exceptionBreakpoints[1].enabled, false);
            model.setExceptionBreakpointsForSession("session-id-3", [{ filter: 'all', label: 'ALL' }]);
            assert.strictEqual(eventCount, 3);
            assert.strictEqual(model.getExceptionBreakpointsForSession("session-id-3").length, 1);
            exceptionBreakpoints = model.getExceptionBreakpoints();
            assert.strictEqual(exceptionBreakpoints[0].filter, 'uncaught');
            assert.strictEqual(exceptionBreakpoints[0].enabled, true);
            assert.strictEqual(exceptionBreakpoints[1].filter, 'caught');
            assert.strictEqual(exceptionBreakpoints[1].label, 'CAUGHT');
            assert.strictEqual(exceptionBreakpoints[1].enabled, false);
            assert.strictEqual(exceptionBreakpoints[2].filter, 'all');
            assert.strictEqual(exceptionBreakpoints[2].label, 'ALL');
        });
        test('exception breakpoints multiple sessions', () => {
            let eventCount = 0;
            disposables.add(model.onDidChangeBreakpoints(() => eventCount++));
            model.setExceptionBreakpointsForSession("session-id-4", [{ filter: 'uncaught', label: 'UNCAUGHT', default: true }, { filter: 'caught', label: 'CAUGHT' }]);
            model.setExceptionBreakpointFallbackSession("session-id-4");
            assert.strictEqual(eventCount, 1);
            let exceptionBreakpointsForSession = model.getExceptionBreakpointsForSession("session-id-4");
            assert.strictEqual(exceptionBreakpointsForSession.length, 2);
            assert.strictEqual(exceptionBreakpointsForSession[0].filter, 'uncaught');
            assert.strictEqual(exceptionBreakpointsForSession[1].filter, 'caught');
            model.setExceptionBreakpointsForSession("session-id-5", [{ filter: 'all', label: 'ALL' }, { filter: 'caught', label: 'CAUGHT' }]);
            assert.strictEqual(eventCount, 2);
            exceptionBreakpointsForSession = model.getExceptionBreakpointsForSession("session-id-5");
            let exceptionBreakpointsForUndefined = model.getExceptionBreakpointsForSession(undefined);
            assert.strictEqual(exceptionBreakpointsForSession.length, 2);
            assert.strictEqual(exceptionBreakpointsForSession[0].filter, 'caught');
            assert.strictEqual(exceptionBreakpointsForSession[1].filter, 'all');
            assert.strictEqual(exceptionBreakpointsForUndefined.length, 2);
            assert.strictEqual(exceptionBreakpointsForUndefined[0].filter, 'uncaught');
            assert.strictEqual(exceptionBreakpointsForUndefined[1].filter, 'caught');
            model.removeExceptionBreakpointsForSession("session-id-4");
            assert.strictEqual(eventCount, 2);
            exceptionBreakpointsForUndefined = model.getExceptionBreakpointsForSession(undefined);
            assert.strictEqual(exceptionBreakpointsForUndefined.length, 2);
            assert.strictEqual(exceptionBreakpointsForUndefined[0].filter, 'uncaught');
            assert.strictEqual(exceptionBreakpointsForUndefined[1].filter, 'caught');
            model.setExceptionBreakpointFallbackSession("session-id-5");
            assert.strictEqual(eventCount, 2);
            exceptionBreakpointsForUndefined = model.getExceptionBreakpointsForSession(undefined);
            assert.strictEqual(exceptionBreakpointsForUndefined.length, 2);
            assert.strictEqual(exceptionBreakpointsForUndefined[0].filter, 'caught');
            assert.strictEqual(exceptionBreakpointsForUndefined[1].filter, 'all');
            const exceptionBreakpoints = model.getExceptionBreakpoints();
            assert.strictEqual(exceptionBreakpoints.length, 3);
        });
        test('instruction breakpoints', () => {
            let eventCount = 0;
            disposables.add(model.onDidChangeBreakpoints(() => eventCount++));
            //address: string, offset: number, condition?: string, hitCondition?: string
            model.addInstructionBreakpoint('0xCCCCFFFF', 0, 0n);
            assert.strictEqual(eventCount, 1);
            let instructionBreakpoints = model.getInstructionBreakpoints();
            assert.strictEqual(instructionBreakpoints.length, 1);
            assert.strictEqual(instructionBreakpoints[0].instructionReference, '0xCCCCFFFF');
            assert.strictEqual(instructionBreakpoints[0].offset, 0);
            model.addInstructionBreakpoint('0xCCCCEEEE', 1, 0n);
            assert.strictEqual(eventCount, 2);
            instructionBreakpoints = model.getInstructionBreakpoints();
            assert.strictEqual(instructionBreakpoints.length, 2);
            assert.strictEqual(instructionBreakpoints[0].instructionReference, '0xCCCCFFFF');
            assert.strictEqual(instructionBreakpoints[0].offset, 0);
            assert.strictEqual(instructionBreakpoints[1].instructionReference, '0xCCCCEEEE');
            assert.strictEqual(instructionBreakpoints[1].offset, 1);
        });
        test('data breakpoints', () => {
            let eventCount = 0;
            disposables.add(model.onDidChangeBreakpoints(() => eventCount++));
            model.addDataBreakpoint('label', 'id', true, ['read'], 'read', '1');
            model.addDataBreakpoint('second', 'secondId', false, ['readWrite'], 'readWrite', '2');
            model.updateDataBreakpoint('1', { condition: 'aCondition' });
            model.updateDataBreakpoint('2', { hitCondition: '10' });
            const dataBreakpoints = model.getDataBreakpoints();
            assert.strictEqual(dataBreakpoints[0].canPersist, true);
            assert.strictEqual(dataBreakpoints[0].dataId, 'id');
            assert.strictEqual(dataBreakpoints[0].accessType, 'read');
            assert.strictEqual(dataBreakpoints[0].condition, 'aCondition');
            assert.strictEqual(dataBreakpoints[1].canPersist, false);
            assert.strictEqual(dataBreakpoints[1].description, 'second');
            assert.strictEqual(dataBreakpoints[1].accessType, 'readWrite');
            assert.strictEqual(dataBreakpoints[1].hitCondition, '10');
            assert.strictEqual(eventCount, 4);
            model.removeDataBreakpoints(dataBreakpoints[0].getId());
            assert.strictEqual(eventCount, 5);
            assert.strictEqual(model.getDataBreakpoints().length, 1);
            model.removeDataBreakpoints();
            assert.strictEqual(model.getDataBreakpoints().length, 0);
            assert.strictEqual(eventCount, 6);
        });
        test('message and class name', () => {
            const modelUri = uri_1.URI.file('/myfolder/my file first.js');
            addBreakpointsAndCheckEvents(model, modelUri, [
                { lineNumber: 5, enabled: true, condition: 'x > 5' },
                { lineNumber: 10, enabled: false },
                { lineNumber: 12, enabled: true, logMessage: 'hello' },
                { lineNumber: 15, enabled: true, hitCondition: '12' },
                { lineNumber: 500, enabled: true },
            ]);
            const breakpoints = model.getBreakpoints();
            const ls = new mockLabelService_1.MockLabelService();
            let result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, breakpoints[0], ls, model);
            assert.strictEqual(result.message, 'Condition: x > 5');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-conditional');
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, breakpoints[1], ls, model);
            assert.strictEqual(result.message, 'Disabled Breakpoint');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-disabled');
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, breakpoints[2], ls, model);
            assert.strictEqual(result.message, 'Log Message: hello');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-log');
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, breakpoints[3], ls, model);
            assert.strictEqual(result.message, 'Hit Count: 12');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-conditional');
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, breakpoints[4], ls, model);
            assert.strictEqual(result.message, ls.getUriLabel(breakpoints[4].uri));
            assert.strictEqual(result.icon.id, 'debug-breakpoint');
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, false, breakpoints[2], ls, model);
            assert.strictEqual(result.message, 'Disabled Logpoint');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-log-disabled');
            model.addDataBreakpoint('label', 'id', true, ['read'], 'read');
            const dataBreakpoints = model.getDataBreakpoints();
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, dataBreakpoints[0], ls, model);
            assert.strictEqual(result.message, 'Data Breakpoint');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-data');
            const functionBreakpoint = model.addFunctionBreakpoint('foo', '1');
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, functionBreakpoint, ls, model);
            assert.strictEqual(result.message, 'Function Breakpoint');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-function');
            const data = new Map();
            data.set(breakpoints[0].getId(), { verified: false, line: 10 });
            data.set(breakpoints[1].getId(), { verified: true, line: 50 });
            data.set(breakpoints[2].getId(), { verified: true, line: 50, message: 'world' });
            data.set(functionBreakpoint.getId(), { verified: true });
            model.setBreakpointSessionData('mocksessionid', { supportsFunctionBreakpoints: false, supportsDataBreakpoints: true, supportsLogPoints: true }, data);
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, breakpoints[0], ls, model);
            assert.strictEqual(result.message, 'Unverified Breakpoint');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-unverified');
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, functionBreakpoint, ls, model);
            assert.strictEqual(result.message, 'Function breakpoints not supported by this debug type');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-function-unverified');
            result = (0, breakpointsView_1.getBreakpointMessageAndIcon)(2 /* State.Stopped */, true, breakpoints[2], ls, model);
            assert.strictEqual(result.message, 'Log Message: hello, world');
            assert.strictEqual(result.icon.id, 'debug-breakpoint-log');
        });
        test('decorations', () => {
            const modelUri = uri_1.URI.file('/myfolder/my file first.js');
            const languageId = 'testMode';
            const textModel = (0, testTextModel_1.createTextModel)(['this is line one', 'this is line two', '    this is line three it has whitespace at start', 'this is line four', 'this is line five'].join('\n'), languageId);
            addBreakpointsAndCheckEvents(model, modelUri, [
                { lineNumber: 1, enabled: true, condition: 'x > 5' },
                { lineNumber: 2, column: 4, enabled: false },
                { lineNumber: 3, enabled: true, logMessage: 'hello' },
                { lineNumber: 500, enabled: true },
            ]);
            const breakpoints = model.getBreakpoints();
            const instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            const debugService = new mockDebug_1.MockDebugService();
            debugService.getModel = () => model;
            instantiationService.stub(debug_1.IDebugService, debugService);
            instantiationService.stub(label_1.ILabelService, new mockLabelService_1.MockLabelService());
            instantiationService.stub(language_1.ILanguageService, disposables.add(new languageService_1.LanguageService()));
            let decorations = instantiationService.invokeFunction(accessor => (0, breakpointEditorContribution_1.createBreakpointDecorations)(accessor, textModel, breakpoints, 3 /* State.Running */, true, true));
            assert.strictEqual(decorations.length, 3); // last breakpoint filtered out since it has a large line number
            assert.deepStrictEqual(decorations[0].range, new range_1.Range(1, 1, 1, 2));
            assert.deepStrictEqual(decorations[1].range, new range_1.Range(2, 4, 2, 5));
            assert.deepStrictEqual(decorations[2].range, new range_1.Range(3, 5, 3, 6));
            assert.strictEqual(decorations[0].options.beforeContentClassName, undefined);
            assert.strictEqual(decorations[1].options.before?.inlineClassName, `debug-breakpoint-placeholder`);
            assert.strictEqual(decorations[0].options.overviewRuler?.position, model_1.OverviewRulerLane.Left);
            const expected = new htmlContent_1.MarkdownString(undefined, { isTrusted: true, supportThemeIcons: true }).appendCodeblock(languageId, 'Condition: x > 5');
            assert.deepStrictEqual(decorations[0].options.glyphMarginHoverMessage, expected);
            decorations = instantiationService.invokeFunction(accessor => (0, breakpointEditorContribution_1.createBreakpointDecorations)(accessor, textModel, breakpoints, 3 /* State.Running */, true, false));
            assert.strictEqual(decorations[0].options.overviewRuler, null);
            textModel.dispose();
            instantiationService.dispose();
        });
        test('updates when storage changes', () => {
            const storage1 = disposables.add(new workbenchTestServices_1.TestStorageService());
            const debugStorage1 = disposables.add(new mockDebug_1.MockDebugStorage(storage1));
            const model1 = disposables.add(new debugModel_1.DebugModel(debugStorage1, { isDirty: (e) => false }, mockDebugModel_1.mockUriIdentityService, new log_1.NullLogService()));
            // 1. create breakpoints in the first model
            const modelUri = uri_1.URI.file('/myfolder/my file first.js');
            const first = [
                { lineNumber: 1, enabled: true, condition: 'x > 5' },
                { lineNumber: 2, column: 4, enabled: false },
            ];
            addBreakpointsAndCheckEvents(model1, modelUri, first);
            debugStorage1.storeBreakpoints(model1);
            const stored = storage1.get('debug.breakpoint', 1 /* StorageScope.WORKSPACE */);
            // 2. hydrate a new model and ensure external breakpoints get applied
            const storage2 = disposables.add(new workbenchTestServices_1.TestStorageService());
            const model2 = disposables.add(new debugModel_1.DebugModel(disposables.add(new mockDebug_1.MockDebugStorage(storage2)), { isDirty: (e) => false }, mockDebugModel_1.mockUriIdentityService, new log_1.NullLogService()));
            storage2.store('debug.breakpoint', stored, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */, /* external= */ true);
            assert.deepStrictEqual(model2.getBreakpoints().map(b => b.getId()), model1.getBreakpoints().map(b => b.getId()));
            // 3. ensure non-external changes are ignored
            storage2.store('debug.breakpoint', '[]', 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */, /* external= */ false);
            assert.deepStrictEqual(model2.getBreakpoints().map(b => b.getId()), model1.getBreakpoints().map(b => b.getId()));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludHMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvdGVzdC9icm93c2VyL2JyZWFrcG9pbnRzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUEwQmhHLFNBQVMsNEJBQTRCLENBQUMsS0FBaUIsRUFBRSxHQUFRLEVBQUUsSUFBdUI7UUFDekYsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMxQyxNQUFNLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0MsVUFBVSxFQUFFLENBQUM7WUFDYixJQUFBLG1CQUFPLEVBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFFLENBQUMsS0FBTSxDQUFDLENBQUMsQ0FBQyxZ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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/editor/browser/diff/testDiffProviderFactoryService", "vs/editor/browser/widget/diffEditor/diffProviderFactoryService", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/editor/test/browser/testCodeEditor", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/progress/common/progress", "vs/workbench/common/views", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "../../browser/inlineChatSavingService", "../../browser/inlineChatSessionServiceImpl", "../../browser/inlineChatSessionService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/workbench/contrib/inlineChat/common/inlineChatServiceImpl", "vs/workbench/test/browser/workbenchTestServices", "vs/editor/common/core/editOperation", "./testWorkerService", "vs/editor/common/services/editorWorker"], function (require, exports, assert, arrays_1, async_1, event_1, lifecycle_1, mock_1, timeTravelScheduler_1, utils_1, testDiffProviderFactoryService_1, diffProviderFactoryService_1, range_1, model_1, testCodeEditor_1, configuration_1, testConfigurationService_1, contextkey_1, descriptors_1, serviceCollection_1, mockKeybindingService_1, progress_1, views_1, accessibleView_1, chat_1, inlineChatController_1, inlineChatSavingService_1, inlineChatSessionServiceImpl_1, inlineChatSessionService_1, inlineChat_1, inlineChatServiceImpl_1, workbenchTestServices_1, editOperation_1, testWorkerService_1, editorWorker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('InteractiveChatController', function () {
        class TestController extends inlineChatController_1.InlineChatController {
            constructor() {
                super(...arguments);
                this._onDidChangeState = new event_1.Emitter();
                this.onDidChangeState = this._onDidChangeState.event;
                this.states = [];
            }
            static { this.INIT_SEQUENCE = ["CREATE_SESSION" /* State.CREATE_SESSION */, "INIT_UI" /* State.INIT_UI */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]; }
            static { this.INIT_SEQUENCE_AUTO_SEND = [...this.INIT_SEQUENCE, "MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]; }
            waitFor(states) {
                const actual = [];
                return new Promise((resolve, reject) => {
                    const d = this.onDidChangeState(state => {
                        actual.push(state);
                        if ((0, arrays_1.equals)(states, actual)) {
                            d.dispose();
                            resolve();
                        }
                    });
                    setTimeout(() => {
                        d.dispose();
                        reject(`timeout, \nWANTED ${states.join('>')}, \nGOT ${actual.join('>')}`);
                    }, 1000);
                });
            }
            async _nextState(state, options) {
                let nextState = state;
                while (nextState) {
                    this._onDidChangeState.fire(nextState);
                    this.states.push(nextState);
                    nextState = await this[nextState](options);
                }
            }
            dispose() {
                super.dispose();
                this._onDidChangeState.dispose();
            }
        }
        const store = new lifecycle_1.DisposableStore();
        let configurationService;
        let editor;
        let model;
        let ctrl;
        let contextKeyService;
        let inlineChatService;
        let inlineChatSessionService;
        let instaService;
        setup(function () {
            contextKeyService = new mockKeybindingService_1.MockContextKeyService();
            inlineChatService = new inlineChatServiceImpl_1.InlineChatServiceImpl(contextKeyService);
            configurationService = new testConfigurationService_1.TestConfigurationService();
            configurationService.setUserConfiguration('chat', { editor: { fontSize: 14, fontFamily: 'default' } });
            configurationService.setUserConfiguration('editor', {});
            const serviceCollection = new serviceCollection_1.ServiceCollection([editorWorker_1.IEditorWorkerService, new descriptors_1.SyncDescriptor(testWorkerService_1.TestWorkerService)], [contextkey_1.IContextKeyService, contextKeyService], [inlineChat_1.IInlineChatService, inlineChatService], [diffProviderFactoryService_1.IDiffProviderFactoryService, new descriptors_1.SyncDescriptor(testDiffProviderFactoryService_1.TestDiffProviderFactoryService)], [inlineChatSessionService_1.IInlineChatSessionService, new descriptors_1.SyncDescriptor(inlineChatSessionServiceImpl_1.InlineChatSessionServiceImpl)], [inlineChatSavingService_1.IInlineChatSavingService, new class extends (0, mock_1.mock)() {
                    markChanged(session) {
                        // noop
                    }
                }], [progress_1.IEditorProgressService, new class extends (0, mock_1.mock)() {
                    show(total, delay) {
                        return {
                            total() { },
                            worked(value) { },
                            done() { },
                        };
                    }
                }], [chat_1.IChatAccessibilityService, new class extends (0, mock_1.mock)() {
                    acceptResponse(response, requestId) { }
                    acceptRequest() { return -1; }
                }], [accessibleView_1.IAccessibleViewService, new class extends (0, mock_1.mock)() {
                    getOpenAriaHint(verbositySettingKey) {
                        return null;
                    }
                }], [configuration_1.IConfigurationService, configurationService], [views_1.IViewDescriptorService, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.onDidChangeLocation = event_1.Event.None;
                    }
                }]);
            instaService = store.add((0, workbenchTestServices_1.workbenchInstantiationService)(undefined, store).createChild(serviceCollection));
            inlineChatSessionService = store.add(instaService.get(inlineChatSessionService_1.IInlineChatSessionService));
            model = store.add(instaService.get(model_1.IModelService).createModel('Hello\nWorld\nHello Again\nHello World\n', null));
            editor = store.add((0, testCodeEditor_1.instantiateTestCodeEditor)(instaService, model));
            store.add(inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random()
                    };
                },
                provideResponse(session, request) {
                    return {
                        type: "editorEdit" /* InlineChatResponseType.EditorEdit */,
                        id: Math.random(),
                        edits: [{
                                range: new range_1.Range(1, 1, 1, 1),
                                text: request.prompt
                            }]
                    };
                }
            }));
        });
        teardown(function () {
            store.clear();
            ctrl?.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('creation, not showing anything', function () {
            ctrl = instaService.createInstance(TestController, editor);
            assert.ok(ctrl);
            assert.strictEqual(ctrl.getWidgetPosition(), undefined);
        });
        test('run (show/hide)', async function () {
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor(TestController.INIT_SEQUENCE_AUTO_SEND);
            const run = ctrl.run({ message: 'Hello', autoSend: true });
            await p;
            assert.ok(ctrl.getWidgetPosition() !== undefined);
            await ctrl.cancelSession();
            await run;
            assert.ok(ctrl.getWidgetPosition() === undefined);
        });
        test('wholeRange does not expand to whole lines, editor selection default', async function () {
            editor.setSelection(new range_1.Range(1, 1, 1, 3));
            ctrl = instaService.createInstance(TestController, editor);
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random()
                    };
                },
                provideResponse(session, request) {
                    throw new Error();
                }
            });
            ctrl.run({});
            await event_1.Event.toPromise(event_1.Event.filter(ctrl.onDidChangeState, e => e === "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */));
            const session = inlineChatSessionService.getSession(editor, editor.getModel().uri);
            assert.ok(session);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(1, 1, 1, 3));
            await ctrl.cancelSession();
            d.dispose();
        });
        test('wholeRange expands to whole lines, session provided', async function () {
            editor.setSelection(new range_1.Range(1, 1, 1, 1));
            ctrl = instaService.createInstance(TestController, editor);
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random(),
                        wholeRange: new range_1.Range(1, 1, 1, 3)
                    };
                },
                provideResponse(session, request) {
                    throw new Error();
                }
            });
            ctrl.run({});
            await event_1.Event.toPromise(event_1.Event.filter(ctrl.onDidChangeState, e => e === "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */));
            const session = inlineChatSessionService.getSession(editor, editor.getModel().uri);
            assert.ok(session);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(1, 1, 1, 3));
            await ctrl.cancelSession();
            d.dispose();
        });
        test('typing outside of wholeRange finishes session', async function () {
            configurationService.setUserConfiguration("inlineChat.finishOnType" /* InlineChatConfigKeys.FinishOnType */, true);
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor(TestController.INIT_SEQUENCE_AUTO_SEND);
            const r = ctrl.run({ message: 'Hello', autoSend: true });
            await p;
            const session = inlineChatSessionService.getSession(editor, editor.getModel().uri);
            assert.ok(session);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(1, 1, 1, 10 /* line length */));
            editor.setSelection(new range_1.Range(2, 1, 2, 1));
            editor.trigger('test', 'type', { text: 'a' });
            await ctrl.waitFor(["DONE" /* State.ACCEPT */]);
            await r;
        });
        test('\'whole range\' isn\'t updated for edits outside whole range #4346', async function () {
            editor.setSelection(new range_1.Range(3, 1, 3, 1));
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random(),
                        wholeRange: new range_1.Range(3, 1, 3, 3)
                    };
                },
                provideResponse(session, request) {
                    return {
                        type: "editorEdit" /* InlineChatResponseType.EditorEdit */,
                        id: Math.random(),
                        edits: [{
                                range: new range_1.Range(1, 1, 1, 1), // EDIT happens outside of whole range
                                text: `${request.prompt}\n${request.prompt}`
                            }]
                    };
                }
            });
            store.add(d);
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor(TestController.INIT_SEQUENCE);
            const r = ctrl.run({ message: 'GENGEN', autoSend: false });
            await p;
            const session = inlineChatSessionService.getSession(editor, editor.getModel().uri);
            assert.ok(session);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(3, 1, 3, 3)); // initial
            ctrl.acceptInput();
            await ctrl.waitFor(["MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]);
            assert.deepStrictEqual(session.wholeRange.value, new range_1.Range(1, 1, 4, 3));
            await ctrl.cancelSession();
            await r;
        });
        test('Stuck inline chat widget #211', async function () {
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random(),
                        wholeRange: new range_1.Range(3, 1, 3, 3)
                    };
                },
                provideResponse(session, request) {
                    return new Promise(() => { });
                }
            });
            store.add(d);
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor([...TestController.INIT_SEQUENCE, "MAKE_REQUEST" /* State.MAKE_REQUEST */]);
            const r = ctrl.run({ message: 'Hello', autoSend: true });
            await p;
            ctrl.acceptSession();
            await r;
            assert.strictEqual(ctrl.getWidgetPosition(), undefined);
        });
        test('[Bug] Inline Chat\'s streaming pushed broken iterations to the undo stack #2403', async function () {
            const d = inlineChatService.addProvider({
                debugName: 'Unit Test',
                label: 'Unit Test',
                prepareInlineChatSession() {
                    return {
                        id: Math.random(),
                        wholeRange: new range_1.Range(3, 1, 3, 3)
                    };
                },
                async provideResponse(session, request, progress) {
                    progress.report({ edits: [{ range: new range_1.Range(1, 1, 1, 1), text: 'hEllo1\n' }] });
                    progress.report({ edits: [{ range: new range_1.Range(2, 1, 2, 1), text: 'hEllo2\n' }] });
                    return {
                        id: Math.random(),
                        type: "editorEdit" /* InlineChatResponseType.EditorEdit */,
                        edits: [{ range: new range_1.Range(1, 1, 1000, 1), text: 'Hello1\nHello2\n' }]
                    };
                }
            });
            const valueThen = editor.getModel().getValue();
            store.add(d);
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor([...TestController.INIT_SEQUENCE, "MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]);
            const r = ctrl.run({ message: 'Hello', autoSend: true });
            await p;
            ctrl.acceptSession();
            await r;
            assert.strictEqual(editor.getModel().getValue(), 'Hello1\nHello2\n');
            editor.getModel().undo();
            assert.strictEqual(editor.getModel().getValue(), valueThen);
        });
        test('UI is streaming edits minutes after the response is finished #3345', async function () {
            configurationService.setUserConfiguration("inlineChat.mode" /* InlineChatConfigKeys.Mode */, "live" /* EditMode.Live */);
            return (0, timeTravelScheduler_1.runWithFakedTimers)({ maxTaskCount: Number.MAX_SAFE_INTEGER }, async () => {
                const d = inlineChatService.addProvider({
                    debugName: 'Unit Test',
                    label: 'Unit Test',
                    prepareInlineChatSession() {
                        return {
                            id: Math.random(),
                        };
                    },
                    async provideResponse(session, request, progress) {
                        const text = '${CSI}#a\n${CSI}#b\n${CSI}#c\n';
                        await (0, async_1.timeout)(10);
                        progress.report({ edits: [{ range: new range_1.Range(1, 1, 1, 1), text: text }] });
                        await (0, async_1.timeout)(10);
                        progress.report({ edits: [{ range: new range_1.Range(1, 1, 1, 1), text: text.repeat(1000) + 'DONE' }] });
                        throw new Error('Too long');
                    }
                });
                // let modelChangeCounter = 0;
                // store.add(editor.getModel().onDidChangeContent(() => { modelChangeCounter++; }));
                store.add(d);
                ctrl = instaService.createInstance(TestController, editor);
                const p = ctrl.waitFor([...TestController.INIT_SEQUENCE, "MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]);
                const r = ctrl.run({ message: 'Hello', autoSend: true });
                await p;
                // assert.ok(modelChangeCounter > 0, modelChangeCounter.toString()); // some changes have been made
                // const modelChangeCounterNow = modelChangeCounter;
                assert.ok(!editor.getModel().getValue().includes('DONE'));
                await (0, async_1.timeout)(10);
                // assert.strictEqual(modelChangeCounterNow, modelChangeCounter);
                assert.ok(!editor.getModel().getValue().includes('DONE'));
                await ctrl.cancelSession();
                await r;
            });
        });
        test('escape doesn\'t remove code added from inline editor chat #3523 1/2', async function () {
            // NO manual edits -> cancel
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor([...TestController.INIT_SEQUENCE, "MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]);
            const r = ctrl.run({ message: 'GENERATED', autoSend: true });
            await p;
            assert.ok(model.getValue().includes('GENERATED'));
            assert.strictEqual(contextKeyService.getContextKeyValue(inlineChat_1.CTX_INLINE_CHAT_USER_DID_EDIT.key), undefined);
            ctrl.cancelSession();
            await r;
            assert.ok(!model.getValue().includes('GENERATED'));
        });
        test('escape doesn\'t remove code added from inline editor chat #3523, 2/2', async function () {
            // manual edits -> finish
            ctrl = instaService.createInstance(TestController, editor);
            const p = ctrl.waitFor([...TestController.INIT_SEQUENCE, "MAKE_REQUEST" /* State.MAKE_REQUEST */, "APPLY_RESPONSE" /* State.APPLY_RESPONSE */, "SHOW_RESPONSE" /* State.SHOW_RESPONSE */, "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */]);
            const r = ctrl.run({ message: 'GENERATED', autoSend: true });
            await p;
            assert.ok(model.getValue().includes('GENERATED'));
            editor.executeEdits('test', [editOperation_1.EditOperation.insert(model.getFullModelRange().getEndPosition(), 'MANUAL')]);
            assert.strictEqual(contextKeyService.getContextKeyValue(inlineChat_1.CTX_INLINE_CHAT_USER_DID_EDIT.key), true);
            ctrl.finishExistingSession();
            await r;
            assert.ok(model.getValue().includes('GENERATED'));
            assert.ok(model.getValue().includes('MANUAL'));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdENvbnRyb2xsZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvaW5saW5lQ2hhdC90ZXN0L2Jyb3dzZXIvaW5saW5lQ2hhdENvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQTBDaEcsS0FBSyxDQUFDLDJCQUEyQixFQUFFO1FBQ2xDLE1BQU0sY0FBZSxTQUFRLDJDQUFvQjtZQUFqRDs7Z0JBS2tCLHNCQUFpQixHQUFHLElBQUksZUFBTyxFQUFTLENBQUM7Z0JBQ2pELHFCQUFnQixHQUFpQixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO2dCQUU5RCxXQUFNLEdBQXFCLEVBQUUsQ0FBQztZQWtDeEMsQ0FBQztxQkF4Q08sa0JBQWEsR0FBcUIseUhBQTJELEFBQWhGLENBQWlGO3FCQUM5Riw0QkFBdUIsR0FBcUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLCtLQUFzRixBQUFqSSxDQUFrSTtZQU9oSyxPQUFPLENBQUMsTUFBd0I7Z0JBQy9CLE1BQU0sTUFBTSxHQUFZLEVBQUUsQ0FBQztnQkFFM0IsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDNUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNuQixJQUFJLElBQUEsZUFBTSxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDOzRCQUM1QixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBQ1osT0FBTyxFQUFFLENBQUM7d0JBQ1gsQ0FBQztvQkFDRixDQUFDLENBQUMsQ0FBQztvQkFFSCxVQUFVLENB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QUFDLGtCQUFrQixDQUFDLDBDQUE2QixDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNyQixNQUFNLENBQUMsQ0FBQztZQUNSLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFcEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsc0VBQXNFLEVBQUUsS0FBSztZQUVqRix5QkFBeUI7WUFDekIsSUFBSSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxhQUFhLCtLQUFzRixDQUFDLENBQUM7WUFDL0ksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLENBQUM7WUFFUixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUVsRCxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLDZCQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLGNBQWMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRyxNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLDBDQUE2QixDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWxHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDO1lBQ1IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFaEQsQ0FBQyxDQUFDLENBQUM7SUFFSixDQUFDLENBQUMsQ0FBQyJ9
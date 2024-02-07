/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/editor/common/languageFeatureRegistry", "vs/editor/common/languages", "vs/editor/contrib/parameterHints/browser/parameterHintsModel", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/instantiation/common/serviceCollection", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, assert, lifecycle_1, uri_1, timeTravelScheduler_1, utils_1, languageFeatureRegistry_1, languages, parameterHintsModel_1, testCodeEditor_1, testTextModel_1, serviceCollection_1, storage_1, telemetry_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mockFile = uri_1.URI.parse('test:somefile.ttt');
    const mockFileSelector = { scheme: 'test' };
    const emptySigHelp = {
        signatures: [{
                label: 'none',
                parameters: []
            }],
        activeParameter: 0,
        activeSignature: 0
    };
    const emptySigHelpResult = {
        value: emptySigHelp,
        dispose: () => { }
    };
    suite('ParameterHintsModel', () => {
        const disposables = new lifecycle_1.DisposableStore();
        let registry;
        setup(() => {
            disposables.clear();
            registry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
        });
        teardown(() => {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function createMockEditor(fileContents) {
            const textModel = disposables.add((0, testTextModel_1.createTextModel)(fileContents, undefined, undefined, mockFile));
            const editor = disposables.add((0, testCodeEditor_1.createTestCodeEditor)(textModel, {
                serviceCollection: new serviceCollection_1.ServiceCollection([telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService], [storage_1.IStorageService, disposables.add(new storage_1.InMemoryStorageService())])
            }));
            return editor;
        }
        function getNextHint(model) {
            return new Promise(resolve => {
                const sub = disposables.add(model.onChangedHints(e => {
                    sub.dispose();
                    return resolve(e ? { value: e, dispose: () => { } } : undefined);
                }));
            });
        }
        test('Provider should get trigger character on type', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = '(';
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry));
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                    assert.strictEqual(context.triggerCharacter, triggerChar);
                    done();
                    return undefined;
                }
            }));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                await donePromise;
            });
        });
        test('Provider should be retriggered if already active', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = '(';
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    ++invokeCount;
                    try {
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            assert.strictEqual(context.isRetrigger, false);
                            assert.strictEqual(context.activeSignatureHelp, undefined);
                            // Retrigger
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar }), 0);
                        }
                        else {
                            assert.strictEqual(invokeCount, 2);
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.isRetrigger, true);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            assert.strictEqual(context.activeSignatureHelp, emptySigHelp);
                            done();
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                await donePromise;
            });
        });
        test('Provider should not be retriggered if previous help is canceled first', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = '(';
            const editor = createMockEditor('');
            const hintModel = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            assert.strictEqual(context.isRetrigger, false);
                            assert.strictEqual(context.activeSignatureHelp, undefined);
                            // Cancel and retrigger
                            hintModel.cancel();
                            editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                        }
                        else {
                            assert.strictEqual(invokeCount, 2);
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            assert.strictEqual(context.isRetrigger, true);
                            assert.strictEqual(context.activeSignatureHelp, undefined);
                            done();
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                return donePromise;
            });
        });
        test('Provider should get last trigger character when triggered multiple times and only be invoked once', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 5));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = ['a', 'b', 'c'];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                        assert.strictEqual(context.isRetrigger, false);
                        assert.strictEqual(context.triggerCharacter, 'c');
                        // Give some time to allow for later triggers
                        setTimeout(() => {
                            assert.strictEqual(invokeCount, 1);
                            done();
                        }, 50);
                        return undefined;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'a' });
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'b' });
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'c' });
                await donePromise;
            });
        });
        test('Provider should be retriggered if already active', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 5));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = ['a', 'b'];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, 'a');
                            // retrigger after delay for widget to show up
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'b' }), 50);
                        }
                        else if (invokeCount === 2) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.ok(context.isRetrigger);
                            assert.strictEqual(context.triggerCharacter, 'b');
                            done();
                        }
                        else {
                            assert.fail('Unexpected invoke');
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'a' });
                return donePromise;
            });
        });
        test('Should cancel existing request when new request comes in', async () => {
            const editor = createMockEditor('abc def');
            const hintsModel = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry));
            let didRequestCancellationOf = -1;
            let invokeCount = 0;
            const longRunningProvider = new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, token) {
                    try {
                        const count = invokeCount++;
                        disposables.add(token.onCancellationRequested(() => { didRequestCancellationOf = count; }));
                        // retrigger on first request
                        if (count === 0) {
                            hintsModel.trigger({ triggerKind: languages.SignatureHelpTriggerKind.Invoke }, 0);
                        }
                        return new Promise(resolve => {
                            setTimeout(() => {
                                resolve({
                                    value: {
                                        signatures: [{
                                                label: '' + count,
                                                parameters: []
                                            }],
                                        activeParameter: 0,
                                        activeSignature: 0
                                    },
                                    dispose: () => { }
                                });
                            }, 100);
                        });
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            };
            disposables.add(registry.register(mockFileSelector, longRunningProvider));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                hintsModel.trigger({ triggerKind: languages.SignatureHelpTriggerKind.Invoke }, 0);
                assert.strictEqual(-1, didRequestCancellationOf);
                return new Promise((resolve, reject) => disposables.add(hintsModel.onChangedHints(newParamterHints => {
                    try {
                        assert.strictEqual(0, didRequestCancellationOf);
                        assert.strictEqual('1', newParamterHints.signatures[0].label);
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                })));
            });
        });
        test('Provider should be retriggered by retrigger character', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const triggerChar = 'a';
            const retriggerChar = 'b';
            const editor = createMockEditor('');
            disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 5));
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [retriggerChar];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerChar);
                            // retrigger after delay for widget to show up
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: retriggerChar }), 50);
                        }
                        else if (invokeCount === 2) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.ok(context.isRetrigger);
                            assert.strictEqual(context.triggerCharacter, retriggerChar);
                            done();
                        }
                        else {
                            assert.fail('Unexpected invoke');
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                // This should not trigger anything
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: retriggerChar });
                // But a trigger character should
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                return donePromise;
            });
        });
        test('should use first result from multiple providers', async () => {
            const triggerChar = 'a';
            const firstProviderId = 'firstProvider';
            const secondProviderId = 'secondProvider';
            const paramterLabel = 'parameter';
            const editor = createMockEditor('');
            const model = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 5));
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                async provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        if (!context.isRetrigger) {
                            // retrigger after delay for widget to show up
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar }), 50);
                            return {
                                value: {
                                    activeParameter: 0,
                                    activeSignature: 0,
                                    signatures: [{
                                            label: firstProviderId,
                                            parameters: [
                                                { label: paramterLabel }
                                            ]
                                        }]
                                },
                                dispose: () => { }
                            };
                        }
                        return undefined;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerChar];
                    this.signatureHelpRetriggerCharacters = [];
                }
                async provideSignatureHelp(_model, _position, _token, context) {
                    if (context.isRetrigger) {
                        return {
                            value: {
                                activeParameter: 0,
                                activeSignature: context.activeSignatureHelp ? context.activeSignatureHelp.activeSignature + 1 : 0,
                                signatures: [{
                                        label: secondProviderId,
                                        parameters: context.activeSignatureHelp ? context.activeSignatureHelp.signatures[0].parameters : []
                                    }]
                            },
                            dispose: () => { }
                        };
                    }
                    return undefined;
                }
            }));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerChar });
                const firstHint = (await getNextHint(model)).value;
                assert.strictEqual(firstHint.signatures[0].label, firstProviderId);
                assert.strictEqual(firstHint.activeSignature, 0);
                assert.strictEqual(firstHint.signatures[0].parameters[0].label, paramterLabel);
                const secondHint = (await getNextHint(model)).value;
                assert.strictEqual(secondHint.signatures[0].label, secondProviderId);
                assert.strictEqual(secondHint.activeSignature, 1);
                assert.strictEqual(secondHint.signatures[0].parameters[0].label, paramterLabel);
            });
        });
        test('Quick typing should use the first trigger character', async () => {
            const editor = createMockEditor('');
            const model = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 50));
            const triggerCharacter = 'a';
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerCharacter];
                    this.signatureHelpRetriggerCharacters = [];
                }
                provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerCharacter);
                        }
                        else {
                            assert.fail('Unexpected invoke');
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerCharacter });
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'x' });
                await getNextHint(model);
            });
        });
        test('Retrigger while a pending resolve is still going on should preserve last active signature #96702', async () => {
            let done;
            const donePromise = new Promise(resolve => { done = resolve; });
            const editor = createMockEditor('');
            const model = disposables.add(new parameterHintsModel_1.ParameterHintsModel(editor, registry, 50));
            const triggerCharacter = 'a';
            const retriggerCharacter = 'b';
            let invokeCount = 0;
            disposables.add(registry.register(mockFileSelector, new class {
                constructor() {
                    this.signatureHelpTriggerCharacters = [triggerCharacter];
                    this.signatureHelpRetriggerCharacters = [retriggerCharacter];
                }
                async provideSignatureHelp(_model, _position, _token, context) {
                    try {
                        ++invokeCount;
                        if (invokeCount === 1) {
                            assert.strictEqual(context.triggerKind, languages.SignatureHelpTriggerKind.TriggerCharacter);
                            assert.strictEqual(context.triggerCharacter, triggerCharacter);
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: retriggerCharacter }), 50);
                        }
                        else if (invokeCount === 2) {
                            // Trigger again while we wait for resolve to take place
                            setTimeout(() => editor.trigger('keyboard', "type" /* Handler.Type */, { text: retriggerCharacter }), 50);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                        else if (invokeCount === 3) {
                            // Make sure that in a retrigger during a pending resolve, we still have the old active signature.
                            assert.strictEqual(context.activeSignatureHelp, emptySigHelp);
                            done();
                        }
                        else {
                            assert.fail('Unexpected invoke');
                        }
                        return emptySigHelpResult;
                    }
                    catch (err) {
                        console.error(err);
                        done(err);
                        throw err;
                    }
                }
            }));
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                editor.trigger('keyboard', "type" /* Handler.Type */, { text: triggerCharacter });
                await getNextHint(model);
                await getNextHint(model);
                await donePromise;
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVySGludHNNb2RlbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9wYXJhbWV0ZXJIaW50cy90ZXN0L2Jyb3dzZXIvcGFyYW1ldGVySGludHNNb2RlbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBcUJoRyxNQUFNLFFBQVEsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDaEQsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUc1QyxNQUFNLFlBQVksR0FBNEI7UUFDN0MsVUFBVSxFQUFFLENBQUM7Z0JBQ1osS0FBSyxFQUFFLE1BQU07Z0JBQ2IsVUFBVSxFQUFFLEVBQUU7YUFDZCxDQUFDO1FBQ0YsZUFBZSxFQUFFLENBQUM7UUFDbEIsZUFBZSxFQUFFLENBQUM7S0FDbEIsQ0FBQztJQUVGLE1BQU0sa0JBQWtCLEdBQWtDO1FBQ3pELEtBQUssRUFBRSxZQUFZO1FBQ25CLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ2xCLENBQUM7SUFFRixLQUFLLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1FBQ2pDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBQzFDLElBQUksUUFBa0UsQ0FBQztRQUV2RSxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BCLFFBQVEsR0FBRyxJQUFJLGlEQUF1QixFQUFtQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUs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
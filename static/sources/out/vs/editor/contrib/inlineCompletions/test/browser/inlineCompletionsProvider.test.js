/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/inlineCompletions/browser/singleTextEdit", "vs/editor/contrib/inlineCompletions/test/browser/utils", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/audioCues/browser/audioCueService", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, assert, async_1, lifecycle_1, timeTravelScheduler_1, utils_1, range_1, languageFeatures_1, languageFeaturesService_1, inlineCompletionsController_1, singleTextEdit_1, utils_2, testCodeEditor_1, testTextModel_1, audioCueService_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Inline Completions', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('inlineCompletionToGhostText', () => {
            function getOutput(text, suggestion) {
                const rangeStartOffset = text.indexOf('[');
                const rangeEndOffset = text.indexOf(']') - 1;
                const cleanedText = text.replace('[', '').replace(']', '');
                const tempModel = (0, testTextModel_1.createTextModel)(cleanedText);
                const range = range_1.Range.fromPositions(tempModel.getPositionAt(rangeStartOffset), tempModel.getPositionAt(rangeEndOffset));
                const options = ['prefix', 'subword'];
                const result = {};
                for (const option of options) {
                    result[option] = new singleTextEdit_1.SingleTextEdit(range, suggestion).computeGhostText(tempModel, option)?.render(cleanedText, true);
                }
                tempModel.dispose();
                if (new Set(Object.values(result)).size === 1) {
                    return Object.values(result)[0];
                }
                return result;
            }
            test('Basic', () => {
                assert.deepStrictEqual(getOutput('[foo]baz', 'foobar'), 'foo[bar]baz');
                assert.deepStrictEqual(getOutput('[aaa]aaa', 'aaaaaa'), 'aaa[aaa]aaa');
                assert.deepStrictEqual(getOutput('[foo]baz', 'boobar'), undefined);
                assert.deepStrictEqual(getOutput('[foo]foo', 'foofoo'), 'foo[foo]foo');
                assert.deepStrictEqual(getOutput('foo[]', 'bar\nhello'), 'foo[bar\nhello]');
            });
            test('Empty ghost text', () => {
                assert.deepStrictEqual(getOutput('[foo]', 'foo'), 'foo');
            });
            test('Whitespace (indentation)', () => {
                assert.deepStrictEqual(getOutput('[ foo]', 'foobar'), ' foo[bar]');
                assert.deepStrictEqual(getOutput('[\tfoo]', 'foobar'), '\tfoo[bar]');
                assert.deepStrictEqual(getOutput('[\t foo]', '\tfoobar'), '	 foo[bar]');
                assert.deepStrictEqual(getOutput('[\tfoo]', '\t\tfoobar'), { prefix: undefined, subword: '\t[\t]foo[bar]' });
                assert.deepStrictEqual(getOutput('[\t]', '\t\tfoobar'), '\t[\tfoobar]');
                assert.deepStrictEqual(getOutput('\t[]', '\t'), '\t[\t]');
                assert.deepStrictEqual(getOutput('\t[\t]', ''), '\t\t');
                assert.deepStrictEqual(getOutput('[ ]', 'return 1'), ' [return 1]');
            });
            test('Whitespace (outside of indentation)', () => {
                assert.deepStrictEqual(getOutput('bar[ foo]', 'foobar'), undefined);
                assert.deepStrictEqual(getOutput('bar[\tfoo]', 'foobar'), undefined);
            });
            test('Unsupported Case', () => {
                assert.deepStrictEqual(getOutput('fo[o\n]', 'x\nbar'), undefined);
            });
            test('New Line', () => {
                assert.deepStrictEqual(getOutput('fo[o\n]', 'o\nbar'), 'foo\n[bar]');
            });
            test('Multi Part Diffing', () => {
                assert.deepStrictEqual(getOutput('foo[()]', '(x);'), { prefix: undefined, subword: 'foo([x])[;]' });
                assert.deepStrictEqual(getOutput('[\tfoo]', '\t\tfoobar'), { prefix: undefined, subword: '\t[\t]foo[bar]' });
                assert.deepStrictEqual(getOutput('[(y ===)]', '(y === 1) { f(); }'), { prefix: undefined, subword: '(y ===[ 1])[ { f(); }]' });
                assert.deepStrictEqual(getOutput('[(y ==)]', '(y === 1) { f(); }'), { prefix: undefined, subword: '(y ==[= 1])[ { f(); }]' });
                assert.deepStrictEqual(getOutput('[(y ==)]', '(y === 1) { f(); }'), { prefix: undefined, subword: '(y ==[= 1])[ { f(); }]' });
            });
            test('Multi Part Diffing 1', () => {
                assert.deepStrictEqual(getOutput('[if () ()]', 'if (1 == f()) ()'), { prefix: undefined, subword: 'if ([1 == f()]) ()' });
            });
            test('Multi Part Diffing 2', () => {
                assert.deepStrictEqual(getOutput('[)]', '())'), ({ prefix: undefined, subword: "[(])[)]" }));
                assert.deepStrictEqual(getOutput('[))]', '(())'), ({ prefix: undefined, subword: "[((]))" }));
            });
            test('Parenthesis Matching', () => {
                assert.deepStrictEqual(getOutput('[console.log()]', 'console.log({ label: "(" })'), {
                    prefix: undefined,
                    subword: 'console.log([{ label: "(" }])'
                });
            });
        });
        test('Does not trigger automatically if disabled', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, inlineSuggest: { enabled: false } }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                await (0, async_1.timeout)(1000);
                // Provider is not called, no ghost text is shown.
                assert.deepStrictEqual(provider.getAndClearCallHistory(), []);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['']);
            });
        });
        test('Ghost text is shown after trigger', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.Range(1, 1, 1, 4) });
                model.triggerExplicitly();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 1, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]']);
            });
        });
        test('Ghost text is shown automatically when configured', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, inlineSuggest: { enabled: true } }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.Range(1, 1, 1, 4) });
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]']);
            });
        });
        test('Ghost text is updated automatically', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.Range(1, 1, 1, 4) });
                context.keyboardType('foo');
                model.triggerExplicitly();
                await (0, async_1.timeout)(1000);
                provider.setReturnValue({ insertText: 'foobizz', range: new range_1.Range(1, 1, 1, 6) });
                context.keyboardType('b');
                context.keyboardType('i');
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 1, },
                    { position: '(1,6)', text: 'foobi', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]', 'foob[ar]', 'foobi', 'foobi[zz]']);
            });
        });
        test('Unindent whitespace', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('  ');
                provider.setReturnValue({ insertText: 'foo', range: new range_1.Range(1, 2, 1, 3) });
                model.triggerExplicitly();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', '  [foo]']);
                model.accept(editor);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,3)', text: '  ', triggerKind: 1, },
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), [' foo']);
            });
        });
        test('Unindent tab', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('\t\t');
                provider.setReturnValue({ insertText: 'foo', range: new range_1.Range(1, 2, 1, 3) });
                model.triggerExplicitly();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', '\t\t[foo]']);
                model.accept(editor);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,3)', text: '\t\t', triggerKind: 1, },
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['\tfoo']);
            });
        });
        test('No unindent after indentation', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('buzz  ');
                provider.setReturnValue({ insertText: 'foo', range: new range_1.Range(1, 6, 1, 7) });
                model.triggerExplicitly();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['']);
                model.accept(editor);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,7)', text: 'buzz  ', triggerKind: 1, },
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), []);
            });
        });
        test('Next/previous', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                provider.setReturnValue({ insertText: 'foobar1', range: new range_1.Range(1, 1, 1, 4) });
                model.trigger();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar1]']);
                provider.setReturnValues([
                    { insertText: 'foobar1', range: new range_1.Range(1, 1, 1, 4) },
                    { insertText: 'foobizz2', range: new range_1.Range(1, 1, 1, 4) },
                    { insertText: 'foobuzz3', range: new range_1.Range(1, 1, 1, 4) }
                ]);
                model.next();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[bizz2]']);
                model.next();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[buzz3]']);
                model.next();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[bar1]']);
                model.previous();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[buzz3]']);
                model.previous();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[bizz2]']);
                model.previous();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[bar1]']);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 0, },
                    { position: '(1,4)', text: 'foo', triggerKind: 1, },
                ]);
            });
        });
        test('Calling the provider is debounced', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                model.trigger();
                context.keyboardType('f');
                await (0, async_1.timeout)(40);
                context.keyboardType('o');
                await (0, async_1.timeout)(40);
                context.keyboardType('o');
                await (0, async_1.timeout)(40);
                // The provider is not called
                assert.deepStrictEqual(provider.getAndClearCallHistory(), []);
                await (0, async_1.timeout)(400);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 0, }
                ]);
                provider.assertNotCalledTwiceWithin50ms();
            });
        });
        test('Backspace is debounced', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, inlineSuggest: { enabled: true } }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.Range(1, 1, 1, 4) });
                await (0, async_1.timeout)(1000);
                for (let j = 0; j < 2; j++) {
                    for (let i = 0; i < 3; i++) {
                        context.leftDelete();
                        await (0, async_1.timeout)(5);
                    }
                    context.keyboardType('bar');
                }
                await (0, async_1.timeout)(400);
                provider.assertNotCalledTwiceWithin50ms();
            });
        });
        test('Forward stability', async function () {
            // The user types the text as suggested and the provider is forward-stable
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.Range(1, 1, 1, 4) });
                context.keyboardType('foo');
                model.trigger();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]']);
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.Range(1, 1, 1, 5) });
                context.keyboardType('b');
                assert.deepStrictEqual(context.currentPrettyViewState, 'foob[ar]');
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,5)', text: 'foob', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foob[ar]']);
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.Range(1, 1, 1, 6) });
                context.keyboardType('a');
                assert.deepStrictEqual(context.currentPrettyViewState, 'fooba[r]');
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,6)', text: 'fooba', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['fooba[r]']);
            });
        });
        test('Support forward instability', async function () {
            // The user types the text as suggested and the provider reports a different suggestion.
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.Range(1, 1, 1, 4) });
                context.keyboardType('foo');
                model.triggerExplicitly();
                await (0, async_1.timeout)(100);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 1, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]']);
                provider.setReturnValue({ insertText: 'foobaz', range: new range_1.Range(1, 1, 1, 5) });
                context.keyboardType('b');
                assert.deepStrictEqual(context.currentPrettyViewState, 'foob[ar]');
                await (0, async_1.timeout)(100);
                // This behavior might change!
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,5)', text: 'foob', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foob[ar]', 'foob[az]']);
            });
        });
        test('Support backward instability', async function () {
            // The user deletes text and the suggestion changes
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('fooba');
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.Range(1, 1, 1, 6) });
                model.triggerExplicitly();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,6)', text: 'fooba', triggerKind: 1, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'fooba[r]']);
                provider.setReturnValue({ insertText: 'foobaz', range: new range_1.Range(1, 1, 1, 5) });
                context.leftDelete();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,5)', text: 'foob', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), [
                    'foob[ar]',
                    'foob[az]'
                ]);
            });
        });
        test('No race conditions', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('h');
                provider.setReturnValue({ insertText: 'helloworld', range: new range_1.Range(1, 1, 1, 2) }, 1000);
                model.triggerExplicitly();
                await (0, async_1.timeout)(1030);
                context.keyboardType('ello');
                provider.setReturnValue({ insertText: 'helloworld', range: new range_1.Range(1, 1, 1, 6) }, 1000);
                // after 20ms: Inline completion provider answers back
                // after 50ms: Debounce is triggered
                await (0, async_1.timeout)(2000);
                assert.deepStrictEqual(context.getAndClearViewStates(), [
                    '',
                    'hello[world]',
                ]);
            });
        });
        test('Do not reuse cache from previous session (#132516)', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, inlineSuggest: { enabled: true } }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('hello\n');
                context.cursorLeft();
                context.keyboardType('x');
                context.leftDelete();
                provider.setReturnValue({ insertText: 'helloworld', range: new range_1.Range(1, 1, 1, 6) }, 1000);
                await (0, async_1.timeout)(2000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    {
                        position: '(1,6)',
                        text: 'hello\n',
                        triggerKind: 0,
                    }
                ]);
                provider.setReturnValue({ insertText: 'helloworld', range: new range_1.Range(2, 1, 2, 6) }, 1000);
                context.cursorDown();
                context.keyboardType('hello');
                await (0, async_1.timeout)(40);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), []);
                // Update ghost text
                context.keyboardType('w');
                context.leftDelete();
                await (0, async_1.timeout)(2000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(2,6)', triggerKind: 0, text: 'hello\nhello' },
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), [
                    '',
                    'hello[world]\n',
                    'hello\n',
                    'hello\nhello[world]',
                ]);
            });
        });
        test('Additional Text Edits', async function () {
            const provider = new utils_2.MockInlineCompletionsProvider();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('buzz\nbaz');
                provider.setReturnValue({
                    insertText: 'bazz',
                    range: new range_1.Range(2, 1, 2, 4),
                    additionalTextEdits: [{
                            range: new range_1.Range(1, 1, 1, 5),
                            text: 'bla'
                        }],
                });
                model.triggerExplicitly();
                await (0, async_1.timeout)(1000);
                model.accept(editor);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), ([{ position: "(2,4)", triggerKind: 1, text: "buzz\nbaz" }]));
                assert.deepStrictEqual(context.getAndClearViewStates(), [
                    '',
                    'buzz\nbaz[z]',
                    'bla\nbazz',
                ]);
            });
        });
    });
    async function withAsyncTestCodeEditorAndInlineCompletionsModel(text, options, callback) {
        return await (0, timeTravelScheduler_1.runWithFakedTimers)({
            useFakeTimers: options.fakeClock,
        }, async () => {
            const disposableStore = new lifecycle_1.DisposableStore();
            try {
                if (options.provider) {
                    const languageFeaturesService = new languageFeaturesService_1.LanguageFeaturesService();
                    if (!options.serviceCollection) {
                        options.serviceCollection = new serviceCollection_1.ServiceCollection();
                    }
                    options.serviceCollection.set(languageFeatures_1.ILanguageFeaturesService, languageFeaturesService);
                    options.serviceCollection.set(audioCueService_1.IAudioCueService, {
                        playAudioCue: async () => { },
                        isEnabled(cue) { return false; },
                    });
                    const d = languageFeaturesService.inlineCompletionsProvider.register({ pattern: '**' }, options.provider);
                    disposableStore.add(d);
                }
                let result;
                await (0, testCodeEditor_1.withAsyncTestCodeEditor)(text, options, async (editor, editorViewModel, instantiationService) => {
                    const controller = instantiationService.createInstance(inlineCompletionsController_1.InlineCompletionsController, editor);
                    const model = controller.model.get();
                    const context = new utils_2.GhostTextContext(model, editor);
                    try {
                        result = await callback({ editor, editorViewModel, model, context });
                    }
                    finally {
                        context.dispose();
                        model.dispose();
                        controller.dispose();
                    }
                });
                if (options.provider instanceof utils_2.MockInlineCompletionsProvider) {
                    options.provider.assertNotCalledTwiceWithin50ms();
                }
                return result;
            }
            finally {
                disposableStore.dispose();
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnNQcm92aWRlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy90ZXN0L2Jyb3dzZXIvaW5saW5lQ29tcGxldGlvbnNQcm92aWRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBcUJoRyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBQ2hDLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1lBRXpDLFNBQVMsU0FBUyxDQUFDLElBQVksRUFBRSxVQUFrQjtnQkFDbEQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxTQUFTLEdBQUcsSUFBQSwrQkFBZSxFQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLEtBQUssR0FBRyxhQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RILE1BQU0sT0FBTyxHQUFHLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBVSxDQUFDO2dCQUMvQyxNQUFNLE1BQU0sR0FBRyxFQUFTLENBQUM7Z0JBQ3pCLEtBQUssTUFBTSxNQUFNLElB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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/path", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/modesRegistry", "vs/editor/common/core/range", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/stream", "vs/base/common/buffer", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/base/test/common/utils", "vs/base/common/async"], function (require, exports, assert, uri_1, path_1, workbenchTestServices_1, textfiles_1, modesRegistry_1, range_1, untitledTextEditorInput_1, cancellation_1, lifecycle_1, stream_1, buffer_1, languageDetectionWorkerService_1, utils_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Untitled text editors', () => {
        class TestUntitledTextEditorInput extends untitledTextEditorInput_1.UntitledTextEditorInput {
            getModel() { return this.model; }
        }
        const disposables = new lifecycle_1.DisposableStore();
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            disposables.add(accessor.untitledTextEditorService);
        });
        teardown(() => {
            disposables.clear();
        });
        test('basics', async () => {
            const service = accessor.untitledTextEditorService;
            const workingCopyService = accessor.workingCopyService;
            const events = [];
            disposables.add(service.onDidCreate(model => {
                events.push(model);
            }));
            const input1 = instantiationService.createInstance(TestUntitledTextEditorInput, service.create());
            await input1.resolve();
            assert.strictEqual(service.get(input1.resource), input1.getModel());
            assert.ok(!accessor.untitledTextEditorService.isUntitledWithAssociatedResource(input1.resource));
            assert.strictEqual(events.length, 1);
            assert.strictEqual(events[0].resource.toString(), input1.getModel().resource.toString());
            assert.ok(service.get(input1.resource));
            assert.ok(!service.get(uri_1.URI.file('testing')));
            assert.ok(input1.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            assert.ok(!input1.hasCapability(2 /* EditorInputCapabilities.Readonly */));
            assert.ok(!input1.isReadonly());
            assert.ok(!input1.hasCapability(8 /* EditorInputCapabilities.Singleton */));
            assert.ok(!input1.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */));
            assert.ok(!input1.hasCapability(512 /* EditorInputCapabilities.Scratchpad */));
            const input2 = instantiationService.createInstance(TestUntitledTextEditorInput, service.create());
            assert.strictEqual(service.get(input2.resource), input2.getModel());
            // toUntyped()
            const untypedInput = input1.toUntyped({ preserveViewState: 0 });
            assert.strictEqual(untypedInput.forceUntitled, true);
            // get()
            assert.strictEqual(service.get(input1.resource), input1.getModel());
            assert.strictEqual(service.get(input2.resource), input2.getModel());
            // revert()
            await input1.revert(0);
            assert.ok(input1.isDisposed());
            assert.ok(!service.get(input1.resource));
            // dirty
            const model = await input2.resolve();
            assert.strictEqual(await service.resolve({ untitledResource: input2.resource }), model);
            assert.ok(service.get(model.resource));
            assert.strictEqual(events.length, 2);
            assert.strictEqual(events[1].resource.toString(), input2.resource.toString());
            assert.ok(!input2.isDirty());
            const resourcePromise = awaitDidChangeDirty(accessor.untitledTextEditorService);
            model.textEditorModel?.setValue('foo bar');
            const resource = await resourcePromise;
            assert.strictEqual(resource.toString(), input2.resource.toString());
            assert.ok(input2.isDirty());
            const dirtyUntypedInput = input2.toUntyped({ preserveViewState: 0 });
            assert.strictEqual(dirtyUntypedInput.contents, 'foo bar');
            assert.strictEqual(dirtyUntypedInput.resource, undefined);
            const dirtyUntypedInputWithoutContent = input2.toUntyped();
            assert.strictEqual(dirtyUntypedInputWithoutContent.resource?.toString(), input2.resource.toString());
            assert.strictEqual(dirtyUntypedInputWithoutContent.contents, undefined);
            assert.ok(workingCopyService.isDirty(input2.resource));
            assert.strictEqual(workingCopyService.dirtyCount, 1);
            await input1.revert(0);
            await input2.revert(0);
            assert.ok(!service.get(input1.resource));
            assert.ok(!service.get(input2.resource));
            assert.ok(!input2.isDirty());
            assert.ok(!model.isDirty());
            assert.ok(!workingCopyService.isDirty(input2.resource));
            assert.strictEqual(workingCopyService.dirtyCount, 0);
            await input1.revert(0);
            assert.ok(input1.isDisposed());
            assert.ok(!service.get(input1.resource));
            input2.dispose();
            assert.ok(!service.get(input2.resource));
        });
        function awaitDidChangeDirty(service) {
            return new Promise(resolve => {
                const listener = service.onDidChangeDirty(async (model) => {
                    listener.dispose();
                    resolve(model.resource);
                });
            });
        }
        test('associated resource is dirty', async () => {
            const service = accessor.untitledTextEditorService;
            const file = uri_1.URI.file((0, path_1.join)('C:\\', '/foo/file.txt'));
            let onDidChangeDirtyModel = undefined;
            disposables.add(service.onDidChangeDirty(model => {
                onDidChangeDirtyModel = model;
            }));
            const model = disposables.add(service.create({ associatedResource: file }));
            assert.ok(accessor.untitledTextEditorService.isUntitledWithAssociatedResource(model.resource));
            const untitled = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, model));
            assert.ok(untitled.isDirty());
            assert.strictEqual(model, onDidChangeDirtyModel);
            const resolvedModel = await untitled.resolve();
            assert.ok(resolvedModel.hasAssociatedFilePath);
            assert.strictEqual(untitled.isDirty(), true);
        });
        test('no longer dirty when content gets empty (not with associated resource)', async () => {
            const service = accessor.untitledTextEditorService;
            const workingCopyService = accessor.workingCopyService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            // dirty
            const model = disposables.add(await input.resolve());
            model.textEditorModel?.setValue('foo bar');
            assert.ok(model.isDirty());
            assert.ok(workingCopyService.isDirty(model.resource, model.typeId));
            model.textEditorModel?.setValue('');
            assert.ok(!model.isDirty());
            assert.ok(!workingCopyService.isDirty(model.resource, model.typeId));
        });
        test('via create options', async () => {
            const service = accessor.untitledTextEditorService;
            const input1 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            const model1 = disposables.add(await input1.resolve());
            model1.textEditorModel.setValue('foo bar');
            assert.ok(model1.isDirty());
            model1.textEditorModel.setValue('');
            assert.ok(!model1.isDirty());
            const input2 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create({ initialValue: 'Hello World' })));
            const model2 = disposables.add(await input2.resolve());
            assert.strictEqual((0, textfiles_1.snapshotToString)(model2.createSnapshot()), 'Hello World');
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, disposables.add(service.create())));
            const input3 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create({ untitledResource: input.resource })));
            const model3 = disposables.add(await input3.resolve());
            assert.strictEqual(model3.resource.toString(), input.resource.toString());
            const file = uri_1.URI.file((0, path_1.join)('C:\\', '/foo/file44.txt'));
            const input4 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create({ associatedResource: file })));
            const model4 = disposables.add(await input4.resolve());
            assert.ok(model4.hasAssociatedFilePath);
            assert.ok(model4.isDirty());
        });
        test('associated path remains dirty when content gets empty', async () => {
            const service = accessor.untitledTextEditorService;
            const file = uri_1.URI.file((0, path_1.join)('C:\\', '/foo/file.txt'));
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create({ associatedResource: file })));
            // dirty
            const model = disposables.add(await input.resolve());
            model.textEditorModel?.setValue('foo bar');
            assert.ok(model.isDirty());
            model.textEditorModel?.setValue('');
            assert.ok(model.isDirty());
        });
        test('initial content is dirty', async () => {
            const service = accessor.untitledTextEditorService;
            const workingCopyService = accessor.workingCopyService;
            const untitled = disposables.add(instantiationService.createInstance(TestUntitledTextEditorInput, service.create({ initialValue: 'Hello World' })));
            assert.ok(untitled.isDirty());
            const backup = (await untitled.getModel().backup(cancellation_1.CancellationToken.None)).content;
            if ((0, stream_1.isReadableStream)(backup)) {
                const value = await (0, buffer_1.streamToBuffer)(backup);
                assert.strictEqual(value.toString(), 'Hello World');
            }
            else if ((0, stream_1.isReadable)(backup)) {
                const value = (0, buffer_1.readableToBuffer)(backup);
                assert.strictEqual(value.toString(), 'Hello World');
            }
            else {
                assert.fail('Missing untitled backup');
            }
            // dirty
            const model = disposables.add(await untitled.resolve());
            assert.ok(model.isDirty());
            assert.strictEqual(workingCopyService.dirtyCount, 1);
        });
        test('created with files.defaultLanguage setting', () => {
            const defaultLanguage = 'javascript';
            const config = accessor.testConfigurationService;
            config.setUserConfiguration('files', { 'defaultLanguage': defaultLanguage });
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(service.create());
            assert.strictEqual(input.getLanguageId(), defaultLanguage);
            config.setUserConfiguration('files', { 'defaultLanguage': undefined });
        });
        test('created with files.defaultLanguage setting (${activeEditorLanguage})', async () => {
            const config = accessor.testConfigurationService;
            config.setUserConfiguration('files', { 'defaultLanguage': '${activeEditorLanguage}' });
            accessor.editorService.activeTextEditorLanguageId = 'typescript';
            const service = accessor.untitledTextEditorService;
            const model = disposables.add(service.create());
            assert.strictEqual(model.getLanguageId(), 'typescript');
            config.setUserConfiguration('files', { 'defaultLanguage': undefined });
            accessor.editorService.activeTextEditorLanguageId = undefined;
        });
        test('created with language overrides files.defaultLanguage setting', () => {
            const language = 'typescript';
            const defaultLanguage = 'javascript';
            const config = accessor.testConfigurationService;
            config.setUserConfiguration('files', { 'defaultLanguage': defaultLanguage });
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(service.create({ languageId: language }));
            assert.strictEqual(input.getLanguageId(), language);
            config.setUserConfiguration('files', { 'defaultLanguage': undefined });
        });
        test('can change language afterwards', async () => {
            const languageId = 'untitled-input-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: languageId,
            }));
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create({ languageId: languageId })));
            assert.strictEqual(input.getLanguageId(), languageId);
            const model = disposables.add(await input.resolve());
            assert.strictEqual(model.getLanguageId(), languageId);
            input.setLanguageId(modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
            assert.strictEqual(input.getLanguageId(), modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
        });
        test('remembers that language was set explicitly', async () => {
            const language = 'untitled-input-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: language,
            }));
            const service = accessor.untitledTextEditorService;
            const model = disposables.add(service.create());
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, model));
            assert.ok(!input.hasLanguageSetExplicitly);
            input.setLanguageId(modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
            assert.ok(input.hasLanguageSetExplicitly);
            assert.strictEqual(input.getLanguageId(), modesRegistry_1.PLAINTEXT_LANGUAGE_ID);
        });
        // Issue #159202
        test('remembers that language was set explicitly if set by another source (i.e. ModelService)', async () => {
            const language = 'untitled-input-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: language,
            }));
            const service = accessor.untitledTextEditorService;
            const model = disposables.add(service.create());
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, model));
            disposables.add(await input.resolve());
            assert.ok(!input.hasLanguageSetExplicitly);
            model.textEditorModel.setLanguage(accessor.languageService.createById(language));
            assert.ok(input.hasLanguageSetExplicitly);
            assert.strictEqual(model.getLanguageId(), language);
        });
        test('Language is not set explicitly if set by language detection source', async () => {
            const language = 'untitled-input-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: language,
            }));
            const service = accessor.untitledTextEditorService;
            const model = disposables.add(service.create());
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, model));
            await input.resolve();
            assert.ok(!input.hasLanguageSetExplicitly);
            model.textEditorModel.setLanguage(accessor.languageService.createById(language), 
            // This is really what this is testing
            languageDetectionWorkerService_1.LanguageDetectionLanguageEventSource);
            assert.ok(!input.hasLanguageSetExplicitly);
            assert.strictEqual(model.getLanguageId(), language);
        });
        test('service#onDidChangeEncoding', async () => {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            let counter = 0;
            disposables.add(service.onDidChangeEncoding(model => {
                counter++;
                assert.strictEqual(model.resource.toString(), input.resource.toString());
            }));
            // encoding
            const model = disposables.add(await input.resolve());
            await model.setEncoding('utf16');
            assert.strictEqual(counter, 1);
        });
        test('service#onDidChangeLabel', async () => {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            let counter = 0;
            disposables.add(service.onDidChangeLabel(model => {
                counter++;
                assert.strictEqual(model.resource.toString(), input.resource.toString());
            }));
            // label
            const model = disposables.add(await input.resolve());
            model.textEditorModel?.setValue('Foo Bar');
            assert.strictEqual(counter, 1);
        });
        test('service#onWillDispose', async () => {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            let counter = 0;
            disposables.add(service.onWillDispose(model => {
                counter++;
                assert.strictEqual(model.resource.toString(), input.resource.toString());
            }));
            const model = disposables.add(await input.resolve());
            assert.strictEqual(counter, 0);
            model.dispose();
            assert.strictEqual(counter, 1);
        });
        test('service#getValue', async () => {
            const service = accessor.untitledTextEditorService;
            const input1 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            const model1 = disposables.add(await input1.resolve());
            model1.textEditorModel.setValue('foo bar');
            assert.strictEqual(service.getValue(model1.resource), 'foo bar');
            model1.dispose();
            // When a model doesn't exist, it should return undefined
            assert.strictEqual(service.getValue(uri_1.URI.parse('https://www.microsoft.com')), undefined);
        });
        test('model#onDidChangeContent', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            let counter = 0;
            const model = disposables.add(await input.resolve());
            disposables.add(model.onDidChangeContent(() => counter++));
            model.textEditorModel?.setValue('foo');
            assert.strictEqual(counter, 1, 'Dirty model should trigger event');
            model.textEditorModel?.setValue('bar');
            assert.strictEqual(counter, 2, 'Content change when dirty should trigger event');
            model.textEditorModel?.setValue('');
            assert.strictEqual(counter, 3, 'Manual revert should trigger event');
            model.textEditorModel?.setValue('foo');
            assert.strictEqual(counter, 4, 'Dirty model should trigger event');
        });
        test('model#onDidRevert and input disposed when reverted', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            let counter = 0;
            const model = disposables.add(await input.resolve());
            disposables.add(model.onDidRevert(() => counter++));
            model.textEditorModel?.setValue('foo');
            await model.revert();
            assert.ok(input.isDisposed());
            assert.ok(counter === 1);
        });
        test('model#onDidChangeName and input name', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            let counter = 0;
            let model = disposables.add(await input.resolve());
            disposables.add(model.onDidChangeName(() => counter++));
            model.textEditorModel?.setValue('foo');
            assert.strictEqual(input.getName(), 'foo');
            assert.strictEqual(model.name, 'foo');
            assert.strictEqual(counter, 1);
            model.textEditorModel?.setValue('bar');
            assert.strictEqual(input.getName(), 'bar');
            assert.strictEqual(model.name, 'bar');
            assert.strictEqual(counter, 2);
            model.textEditorModel?.setValue('');
            assert.strictEqual(input.getName(), 'Untitled-1');
            assert.strictEqual(model.name, 'Untitled-1');
            model.textEditorModel?.setValue('        ');
            assert.strictEqual(input.getName(), 'Untitled-1');
            assert.strictEqual(model.name, 'Untitled-1');
            model.textEditorModel?.setValue('([]}'); // require actual words
            assert.strictEqual(input.getName(), 'Untitled-1');
            assert.strictEqual(model.name, 'Untitled-1');
            model.textEditorModel?.setValue('([]}hello   '); // require actual words
            assert.strictEqual(input.getName(), '([]}hello');
            assert.strictEqual(model.name, '([]}hello');
            model.textEditorModel?.setValue('12345678901234567890123456789012345678901234567890'); // trimmed at 40chars max
            assert.strictEqual(input.getName(), '1234567890123456789012345678901234567890');
            assert.strictEqual(model.name, '1234567890123456789012345678901234567890');
            model.textEditorModel?.setValue('123456789012345678901234567890123456789🌞'); // do not break grapehems (#111235)
            assert.strictEqual(input.getName(), '123456789012345678901234567890123456789');
            assert.strictEqual(model.name, '123456789012345678901234567890123456789');
            model.textEditorModel?.setValue('hello\u202Eworld'); // do not allow RTL in names (#190133)
            assert.strictEqual(input.getName(), 'helloworld');
            assert.strictEqual(model.name, 'helloworld');
            assert.strictEqual(counter, 7);
            model.textEditorModel?.setValue('Hello\nWorld');
            assert.strictEqual(counter, 8);
            function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
                const range = new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn);
                return {
                    range,
                    text,
                    forceMoveMarkers: false
                };
            }
            model.textEditorModel?.applyEdits([createSingleEditOp('hello', 2, 2)]);
            assert.strictEqual(counter, 8); // change was not on first line
            input.dispose();
            model.dispose();
            const inputWithContents = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create({ initialValue: 'Foo' })));
            model = disposables.add(await inputWithContents.resolve());
            assert.strictEqual(inputWithContents.getName(), 'Foo');
        });
        test('model#onDidChangeDirty', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            let counter = 0;
            const model = disposables.add(await input.resolve());
            disposables.add(model.onDidChangeDirty(() => counter++));
            model.textEditorModel?.setValue('foo');
            assert.strictEqual(counter, 1, 'Dirty model should trigger event');
            model.textEditorModel?.setValue('bar');
            assert.strictEqual(counter, 1, 'Another change does not fire event');
        });
        test('model#onDidChangeEncoding', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            let counter = 0;
            const model = disposables.add(await input.resolve());
            disposables.add(model.onDidChangeEncoding(() => counter++));
            await model.setEncoding('utf16');
            assert.strictEqual(counter, 1, 'Dirty model should trigger event');
            await model.setEncoding('utf16');
            assert.strictEqual(counter, 1, 'Another change to same encoding does not fire event');
        });
        test('canDispose with dirty model', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create()));
            const model = disposables.add(await input.resolve());
            model.textEditorModel?.setValue('foo');
            const canDisposePromise = service.canDispose(model);
            assert.ok(canDisposePromise instanceof Promise);
            let canDispose = false;
            (async () => {
                canDispose = await canDisposePromise;
            })();
            assert.strictEqual(canDispose, false);
            model.revert({ soft: true });
            await (0, async_1.timeout)(0);
            assert.strictEqual(canDispose, true);
            const canDispose2 = service.canDispose(model);
            assert.strictEqual(canDispose2, true);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aXRsZWRUZXh0RWRpdG9yLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91bnRpdGxlZC90ZXN0L2Jyb3dzZXIvdW50aXRsZWRUZXh0RWRpdG9yLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUF1QmhHLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7UUFFbkMsTUFBTSwyQkFBNEIsU0FBUSxpREFBdUI7WUFDaEUsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDakM7UUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUMxQyxJQUFJLG9CQUEyQyxDQUFDO1FBQ2hELElBQUksUUFBNkIsQ0FBQztRQUVsQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1Ysb0JBQW9CLEdBQUcsSUFBQSxxREFBNkIsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDN0UsUUFBUSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQ0FBbUIsQ0FBQyxDQUFDO1lBQ3BFLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUFzRCxDQUFDLENBQUM7UUFDbEYsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN6QixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMseUJBQXlCLENBQUM7WUFDbkQsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUM7WUFFdkQsTUFBTSxNQUFNLEdBQStCLEVBQUUsQ0FBQztZQUM5QyxX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
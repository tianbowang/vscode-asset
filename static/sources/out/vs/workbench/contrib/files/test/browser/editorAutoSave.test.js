/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/test/common/utils", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/lifecycle", "vs/workbench/services/editor/browser/editorService", "vs/workbench/browser/parts/editor/editorAutoSave", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/common/editor", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/test/common/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, assert, event_1, utils_1, editorService_1, workbenchTestServices_1, editorGroupsService_1, lifecycle_1, editorService_2, editorAutoSave_1, configuration_1, testConfigurationService_1, filesConfigurationService_1, mockKeybindingService_1, editor_1, testWorkspace_1, workbenchTestServices_2, uriIdentityService_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorAutoSave', () => {
        const disposables = new lifecycle_1.DisposableStore();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
        });
        teardown(() => {
            disposables.clear();
        });
        async function createEditorAutoSave(autoSaveConfig) {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const configurationService = new testConfigurationService_1.TestConfigurationService();
            configurationService.setUserConfiguration('files', autoSaveConfig);
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(audioCueService_1.IAudioCueService, { playAudioCue: async () => { }, isEnabled(cue) { return false; } });
            instantiationService.stub(filesConfigurationService_1.IFilesConfigurationService, disposables.add(new workbenchTestServices_1.TestFilesConfigurationService(instantiationService.createInstance(mockKeybindingService_1.MockContextKeyService), configurationService, new workbenchTestServices_2.TestContextService(testWorkspace_1.TestWorkspace), workbenchTestServices_1.TestEnvironmentService, disposables.add(new uriIdentityService_1.UriIdentityService(disposables.add(new workbenchTestServices_1.TestFileService()))), disposables.add(new workbenchTestServices_1.TestFileService()), new workbenchTestServices_2.TestMarkerService(), new workbenchTestServices_1.TestTextResourceConfigurationService(configurationService))));
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.EditorService, undefined));
            instantiationService.stub(editorService_1.IEditorService, editorService);
            const accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            disposables.add(accessor.textFileService.files);
            disposables.add(instantiationService.createInstance(editorAutoSave_1.EditorAutoSave));
            return accessor;
        }
        test('editor auto saves after short delay if configured', async function () {
            const accessor = await createEditorAutoSave({ autoSave: 'afterDelay', autoSaveDelay: 1 });
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const model = disposables.add(await accessor.textFileService.files.resolve(resource));
            model.textEditorModel?.setValue('Super Good');
            assert.ok(model.isDirty());
            await awaitModelSaved(model);
            assert.strictEqual(model.isDirty(), false);
        });
        test('editor auto saves on focus change if configured', async function () {
            const accessor = await createEditorAutoSave({ autoSave: 'onFocusChange' });
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id } });
            const model = disposables.add(await accessor.textFileService.files.resolve(resource));
            model.textEditorModel?.setValue('Super Good');
            assert.ok(model.isDirty());
            const editorPane = await accessor.editorService.openEditor({ resource: utils_1.toResource.call(this, '/path/index_other.txt') });
            await awaitModelSaved(model);
            assert.strictEqual(model.isDirty(), false);
            await editorPane?.group?.closeAllEditors();
        });
        function awaitModelSaved(model) {
            return event_1.Event.toPromise(event_1.Event.once(model.onDidChangeDirty));
        }
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yQXV0b1NhdmUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvdGVzdC9icm93c2VyL2VkaXRvckF1dG9TYXZlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUF3QmhHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7UUFFNUIsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSw4Q0FBc0IsR0FBRSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxVQUFVLG9CQUFvQixDQUFDLGNBQXNCO1lBQ3pELE1BQU0sb0JBQW9CLEdBQUcsSUFBQSxxREFBNkIsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFbkYsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7WUFDNUQsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ25FLG9CQUFvQixDQUFDLElBQUksQ0FBQyxxQ0FBcUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3ZFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxrQ0FBZ0IsRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxTQUFTLENBQUMsR0FBWSxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFTLENBQUMsQ0FBQztZQUNqSSxvQkFBb0IsQ0FBQyxJQUFJLENB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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/browser/parts/editor/editorPlaceholder", "vs/workbench/common/editor", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor/textResourceEditorInput", "vs/platform/theme/test/common/testThemeService", "vs/base/common/uri", "vs/workbench/browser/editor", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/resources", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/editor/editorInput", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/test/common/utils"], function (require, exports, assert, editorPane_1, editorPlaceholder_1, editor_1, platform_1, descriptors_1, telemetry_1, telemetryUtils_1, workbenchTestServices_1, textResourceEditorInput_1, testThemeService_1, uri_1, editor_2, cancellation_1, lifecycle_1, workbenchTestServices_2, resources_1, editorService_1, editorService_2, editorGroupsService_1, workspaceTrust_1, editorInput_1, testConfigurationService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const NullThemeService = new testThemeService_1.TestThemeService();
    const editorRegistry = platform_1.Registry.as(editor_1.EditorExtensions.EditorPane);
    const editorInputRegistry = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory);
    class TestEditor extends editorPane_1.EditorPane {
        constructor() {
            const disposables = new lifecycle_1.DisposableStore();
            super('TestEditor', telemetryUtils_1.NullTelemetryService, NullThemeService, disposables.add(new workbenchTestServices_2.TestStorageService()));
            this._register(disposables);
        }
        getId() { return 'testEditor'; }
        layout() { }
        createEditor() { }
    }
    class OtherTestEditor extends editorPane_1.EditorPane {
        constructor() {
            const disposables = new lifecycle_1.DisposableStore();
            super('testOtherEditor', telemetryUtils_1.NullTelemetryService, NullThemeService, disposables.add(new workbenchTestServices_2.TestStorageService()));
            this._register(disposables);
        }
        getId() { return 'testOtherEditor'; }
        layout() { }
        createEditor() { }
    }
    class TestInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(input) {
            return input.toString();
        }
        deserialize(instantiationService, raw) {
            return {};
        }
    }
    class TestInput extends editorInput_1.EditorInput {
        constructor() {
            super(...arguments);
            this.resource = undefined;
        }
        prefersEditorPane(editors) {
            return editors[1];
        }
        get typeId() {
            return 'testInput';
        }
        resolve() {
            return null;
        }
    }
    class OtherTestInput extends editorInput_1.EditorInput {
        constructor() {
            super(...arguments);
            this.resource = undefined;
        }
        get typeId() {
            return 'otherTestInput';
        }
        resolve() {
            return null;
        }
    }
    class TestResourceEditorInput extends textResourceEditorInput_1.TextResourceEditorInput {
    }
    suite('EditorPane', () => {
        const disposables = new lifecycle_1.DisposableStore();
        teardown(() => {
            disposables.clear();
        });
        test('EditorPane API', async () => {
            const editor = new TestEditor();
            const input = disposables.add(new OtherTestInput());
            const options = {};
            assert(!editor.isVisible());
            assert(!editor.input);
            await editor.setInput(input, options, Object.create(null), cancellation_1.CancellationToken.None);
            assert.strictEqual(input, editor.input);
            const group = new workbenchTestServices_1.TestEditorGroupView(1);
            editor.setVisible(true, group);
            assert(editor.isVisible());
            assert.strictEqual(editor.group, group);
            editor.dispose();
            editor.clearInput();
            editor.setVisible(false, group);
            assert(!editor.isVisible());
            assert(!editor.input);
            assert(!editor.getControl());
        });
        test('EditorPaneDescriptor', () => {
            const editorDescriptor = editor_2.EditorPaneDescriptor.create(TestEditor, 'id', 'name');
            assert.strictEqual(editorDescriptor.typeId, 'id');
            assert.strictEqual(editorDescriptor.name, 'name');
        });
        test('Editor Pane Registration', function () {
            const editorDescriptor1 = editor_2.EditorPaneDescriptor.create(TestEditor, 'id1', 'name');
            const editorDescriptor2 = editor_2.EditorPaneDescriptor.create(OtherTestEditor, 'id2', 'name');
            const oldEditorsCnt = editorRegistry.getEditorPanes().length;
            const oldInputCnt = editorRegistry.getEditors().length;
            disposables.add(editorRegistry.registerEditorPane(editorDescriptor1, [new descriptors_1.SyncDescriptor(TestInput)]));
            disposables.add(editorRegistry.registerEditorPane(editorDescriptor2, [new descriptors_1.SyncDescriptor(TestInput), new descriptors_1.SyncDescriptor(OtherTestInput)]));
            assert.strictEqual(editorRegistry.getEditorPanes().length, oldEditorsCnt + 2);
            assert.strictEqual(editorRegistry.getEditors().length, oldInputCnt + 3);
            assert.strictEqual(editorRegistry.getEditorPane(disposables.add(new TestInput())), editorDescriptor2);
            assert.strictEqual(editorRegistry.getEditorPane(disposables.add(new OtherTestInput())), editorDescriptor2);
            assert.strictEqual(editorRegistry.getEditorPaneByType('id1'), editorDescriptor1);
            assert.strictEqual(editorRegistry.getEditorPaneByType('id2'), editorDescriptor2);
            assert(!editorRegistry.getEditorPaneByType('id3'));
        });
        test('Editor Pane Lookup favors specific class over superclass (match on specific class)', function () {
            const d1 = editor_2.EditorPaneDescriptor.create(TestEditor, 'id1', 'name');
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
            disposables.add(editorRegistry.registerEditorPane(d1, [new descriptors_1.SyncDescriptor(TestResourceEditorInput)]));
            const inst = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const editor = disposables.add(editorRegistry.getEditorPane(disposables.add(inst.createInstance(TestResourceEditorInput, uri_1.URI.file('/fake'), 'fake', '', undefined, undefined))).instantiate(inst));
            assert.strictEqual(editor.getId(), 'testEditor');
            const otherEditor = disposables.add(editorRegistry.getEditorPane(disposables.add(inst.createInstance(textResourceEditorInput_1.TextResourceEditorInput, uri_1.URI.file('/fake'), 'fake', '', undefined, undefined))).instantiate(inst));
            assert.strictEqual(otherEditor.getId(), 'workbench.editors.textResourceEditor');
        });
        test('Editor Pane Lookup favors specific class over superclass (match on super class)', function () {
            const inst = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
            const editor = disposables.add(editorRegistry.getEditorPane(disposables.add(inst.createInstance(TestResourceEditorInput, uri_1.URI.file('/fake'), 'fake', '', undefined, undefined))).instantiate(inst));
            assert.strictEqual('workbench.editors.textResourceEditor', editor.getId());
        });
        test('Editor Input Serializer', function () {
            const testInput = disposables.add(new workbenchTestServices_1.TestEditorInput(uri_1.URI.file('/fake'), 'testTypeId'));
            (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables).invokeFunction(accessor => editorInputRegistry.start(accessor));
            disposables.add(editorInputRegistry.registerEditorSerializer(testInput.typeId, TestInputSerializer));
            let factory = editorInputRegistry.getEditorSerializer('testTypeId');
            assert(factory);
            factory = editorInputRegistry.getEditorSerializer(testInput);
            assert(factory);
            // throws when registering serializer for same type
            assert.throws(() => editorInputRegistry.registerEditorSerializer(testInput.typeId, TestInputSerializer));
        });
        test('EditorMemento - basics', function () {
            const testGroup0 = new workbenchTestServices_1.TestEditorGroupView(0);
            const testGroup1 = new workbenchTestServices_1.TestEditorGroupView(1);
            const testGroup4 = new workbenchTestServices_1.TestEditorGroupView(4);
            const configurationService = new workbenchTestServices_1.TestTextResourceConfigurationService();
            const editorGroupService = new workbenchTestServices_1.TestEditorGroupsService([
                testGroup0,
                testGroup1,
                new workbenchTestServices_1.TestEditorGroupView(2)
            ]);
            const rawMemento = Object.create(null);
            let memento = disposables.add(new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, editorGroupService, configurationService));
            let res = memento.loadEditorState(testGroup0, uri_1.URI.file('/A'));
            assert.ok(!res);
            memento.saveEditorState(testGroup0, uri_1.URI.file('/A'), { line: 3 });
            res = memento.loadEditorState(testGroup0, uri_1.URI.file('/A'));
            assert.ok(res);
            assert.strictEqual(res.line, 3);
            memento.saveEditorState(testGroup1, uri_1.URI.file('/A'), { line: 5 });
            res = memento.loadEditorState(testGroup1, uri_1.URI.file('/A'));
            assert.ok(res);
            assert.strictEqual(res.line, 5);
            // Ensure capped at 3 elements
            memento.saveEditorState(testGroup0, uri_1.URI.file('/B'), { line: 1 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/C'), { line: 1 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/D'), { line: 1 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/E'), { line: 1 });
            assert.ok(!memento.loadEditorState(testGroup0, uri_1.URI.file('/A')));
            assert.ok(!memento.loadEditorState(testGroup0, uri_1.URI.file('/B')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/C')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/D')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/E')));
            // Save at an unknown group
            memento.saveEditorState(testGroup4, uri_1.URI.file('/E'), { line: 1 });
            assert.ok(memento.loadEditorState(testGroup4, uri_1.URI.file('/E'))); // only gets removed when memento is saved
            memento.saveEditorState(testGroup4, uri_1.URI.file('/C'), { line: 1 });
            assert.ok(memento.loadEditorState(testGroup4, uri_1.URI.file('/C'))); // only gets removed when memento is saved
            memento.saveState();
            memento = disposables.add(new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, editorGroupService, configurationService));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/C')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/D')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/E')));
            // Check on entries no longer there from invalid groups
            assert.ok(!memento.loadEditorState(testGroup4, uri_1.URI.file('/E')));
            assert.ok(!memento.loadEditorState(testGroup4, uri_1.URI.file('/C')));
            memento.clearEditorState(uri_1.URI.file('/C'), testGroup4);
            memento.clearEditorState(uri_1.URI.file('/E'));
            assert.ok(!memento.loadEditorState(testGroup4, uri_1.URI.file('/C')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/D')));
            assert.ok(!memento.loadEditorState(testGroup0, uri_1.URI.file('/E')));
        });
        test('EditorMemento - move', function () {
            const testGroup0 = new workbenchTestServices_1.TestEditorGroupView(0);
            const configurationService = new workbenchTestServices_1.TestTextResourceConfigurationService();
            const editorGroupService = new workbenchTestServices_1.TestEditorGroupsService([testGroup0]);
            const rawMemento = Object.create(null);
            const memento = disposables.add(new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, editorGroupService, configurationService));
            memento.saveEditorState(testGroup0, uri_1.URI.file('/some/folder/file-1.txt'), { line: 1 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/some/folder/file-2.txt'), { line: 2 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/some/other/file.txt'), { line: 3 });
            memento.moveEditorState(uri_1.URI.file('/some/folder/file-1.txt'), uri_1.URI.file('/some/folder/file-moved.txt'), resources_1.extUri);
            let res = memento.loadEditorState(testGroup0, uri_1.URI.file('/some/folder/file-1.txt'));
            assert.ok(!res);
            res = memento.loadEditorState(testGroup0, uri_1.URI.file('/some/folder/file-moved.txt'));
            assert.strictEqual(res?.line, 1);
            memento.moveEditorState(uri_1.URI.file('/some/folder'), uri_1.URI.file('/some/folder-moved'), resources_1.extUri);
            res = memento.loadEditorState(testGroup0, uri_1.URI.file('/some/folder-moved/file-moved.txt'));
            assert.strictEqual(res?.line, 1);
            res = memento.loadEditorState(testGroup0, uri_1.URI.file('/some/folder-moved/file-2.txt'));
            assert.strictEqual(res?.line, 2);
        });
        test('EditoMemento - use with editor input', function () {
            const testGroup0 = new workbenchTestServices_1.TestEditorGroupView(0);
            class TestEditorInput extends editorInput_1.EditorInput {
                constructor(resource, id = 'testEditorInputForMementoTest') {
                    super();
                    this.resource = resource;
                    this.id = id;
                }
                get typeId() { return 'testEditorInputForMementoTest'; }
                async resolve() { return null; }
                matches(other) {
                    return other && this.id === other.id && other instanceof TestEditorInput;
                }
            }
            const rawMemento = Object.create(null);
            const memento = disposables.add(new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, new workbenchTestServices_1.TestEditorGroupsService(), new workbenchTestServices_1.TestTextResourceConfigurationService()));
            const testInputA = disposables.add(new TestEditorInput(uri_1.URI.file('/A')));
            let res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(!res);
            memento.saveEditorState(testGroup0, testInputA, { line: 3 });
            res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(res);
            assert.strictEqual(res.line, 3);
            // State removed when input gets disposed
            testInputA.dispose();
            res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(!res);
        });
        test('EditoMemento - clear on editor dispose', function () {
            const testGroup0 = new workbenchTestServices_1.TestEditorGroupView(0);
            class TestEditorInput extends editorInput_1.EditorInput {
                constructor(resource, id = 'testEditorInputForMementoTest') {
                    super();
                    this.resource = resource;
                    this.id = id;
                }
                get typeId() { return 'testEditorInputForMementoTest'; }
                async resolve() { return null; }
                matches(other) {
                    return other && this.id === other.id && other instanceof TestEditorInput;
                }
            }
            const rawMemento = Object.create(null);
            const memento = disposables.add(new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, new workbenchTestServices_1.TestEditorGroupsService(), new workbenchTestServices_1.TestTextResourceConfigurationService()));
            const testInputA = disposables.add(new TestEditorInput(uri_1.URI.file('/A')));
            let res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(!res);
            memento.saveEditorState(testGroup0, testInputA.resource, { line: 3 });
            res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(res);
            assert.strictEqual(res.line, 3);
            // State not yet removed when input gets disposed
            // because we used resource
            testInputA.dispose();
            res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(res);
            const testInputB = disposables.add(new TestEditorInput(uri_1.URI.file('/B')));
            res = memento.loadEditorState(testGroup0, testInputB);
            assert.ok(!res);
            memento.saveEditorState(testGroup0, testInputB.resource, { line: 3 });
            res = memento.loadEditorState(testGroup0, testInputB);
            assert.ok(res);
            assert.strictEqual(res.line, 3);
            memento.clearEditorStateOnDispose(testInputB.resource, testInputB);
            // State removed when input gets disposed
            testInputB.dispose();
            res = memento.loadEditorState(testGroup0, testInputB);
            assert.ok(!res);
        });
        test('EditorMemento - workbench.editor.sharedViewState', function () {
            const testGroup0 = new workbenchTestServices_1.TestEditorGroupView(0);
            const testGroup1 = new workbenchTestServices_1.TestEditorGroupView(1);
            const configurationService = new workbenchTestServices_1.TestTextResourceConfigurationService(new testConfigurationService_1.TestConfigurationService({
                workbench: {
                    editor: {
                        sharedViewState: true
                    }
                }
            }));
            const editorGroupService = new workbenchTestServices_1.TestEditorGroupsService([testGroup0]);
            const rawMemento = Object.create(null);
            const memento = disposables.add(new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, editorGroupService, configurationService));
            const resource = uri_1.URI.file('/some/folder/file-1.txt');
            memento.saveEditorState(testGroup0, resource, { line: 1 });
            let res = memento.loadEditorState(testGroup0, resource);
            assert.strictEqual(res.line, 1);
            res = memento.loadEditorState(testGroup1, resource);
            assert.strictEqual(res.line, 1);
            memento.saveEditorState(testGroup0, resource, { line: 3 });
            res = memento.loadEditorState(testGroup1, resource);
            assert.strictEqual(res.line, 3);
            memento.saveEditorState(testGroup1, resource, { line: 1 });
            res = memento.loadEditorState(testGroup1, resource);
            assert.strictEqual(res.line, 1);
            memento.clearEditorState(resource, testGroup0);
            memento.clearEditorState(resource, testGroup1);
            res = memento.loadEditorState(testGroup1, resource);
            assert.strictEqual(res.line, 1);
            memento.clearEditorState(resource);
            res = memento.loadEditorState(testGroup1, resource);
            assert.ok(!res);
        });
        test('WorkspaceTrustRequiredEditor', async function () {
            let TrustRequiredTestEditor = class TrustRequiredTestEditor extends editorPane_1.EditorPane {
                constructor(telemetryService) {
                    super('TestEditor', telemetryUtils_1.NullTelemetryService, NullThemeService, disposables.add(new workbenchTestServices_2.TestStorageService()));
                }
                getId() { return 'trustRequiredTestEditor'; }
                layout() { }
                createEditor() { }
            };
            TrustRequiredTestEditor = __decorate([
                __param(0, telemetry_1.ITelemetryService)
            ], TrustRequiredTestEditor);
            class TrustRequiredTestInput extends editorInput_1.EditorInput {
                constructor() {
                    super(...arguments);
                    this.resource = undefined;
                }
                get typeId() {
                    return 'trustRequiredTestInput';
                }
                get capabilities() {
                    return 16 /* EditorInputCapabilities.RequiresTrust */;
                }
                resolve() {
                    return null;
                }
            }
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const workspaceTrustService = disposables.add(instantiationService.createInstance(workbenchTestServices_2.TestWorkspaceTrustManagementService));
            instantiationService.stub(workspaceTrust_1.IWorkspaceTrustManagementService, workspaceTrustService);
            workspaceTrustService.setWorkspaceTrust(false);
            const editorPart = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, editorPart);
            const editorService = disposables.add(instantiationService.createInstance(editorService_1.EditorService, undefined));
            instantiationService.stub(editorService_2.IEditorService, editorService);
            const group = editorPart.activeGroup;
            const editorDescriptor = editor_2.EditorPaneDescriptor.create(TrustRequiredTestEditor, 'id1', 'name');
            disposables.add(editorRegistry.registerEditorPane(editorDescriptor, [new descriptors_1.SyncDescriptor(TrustRequiredTestInput)]));
            const testInput = disposables.add(new TrustRequiredTestInput());
            await group.openEditor(testInput);
            assert.strictEqual(group.activeEditorPane?.getId(), editorPlaceholder_1.WorkspaceTrustRequiredPlaceholderEditor.ID);
            const getEditorPaneIdAsync = () => new Promise(resolve => {
                disposables.add(editorService.onDidActiveEditorChange(() => {
                    resolve(group.activeEditorPane?.getId());
                }));
            });
            workspaceTrustService.setWorkspaceTrust(true);
            assert.strictEqual(await getEditorPaneIdAsync(), 'trustRequiredTestEditor');
            workspaceTrustService.setWorkspaceTrust(false);
            assert.strictEqual(await getEditorPaneIdAsync(), editorPlaceholder_1.WorkspaceTrustRequiredPlaceholderEditor.ID);
            await group.closeAllEditors();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yUGFuZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvdGVzdC9icm93c2VyL3BhcnRzL2VkaXRvci9lZGl0b3JQYW5lLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUE0QmhHLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQ0FBZ0IsRUFBRSxDQUFDO0lBRWhELE1BQU0sY0FBYyxHQUF1QixtQkFBUSxDQUFDLEVBQUUsQ0FBQyx5QkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNwRixNQUFNLG1CQUFtQixHQUEyQixtQkFBUSxDQUFDLEVBQUUsQ0FBQyx5QkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVoRyxNQUFNLFVBQVcsU0FBUSx1QkFBVTtRQUVsQztZQUNDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzFDLEtBQUssQ0FBQyxZQUFZLEVBQUUscUNBQW9CLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLDBDQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXZHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVRLEtBQUssS0FBYSxPQUFPLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDakQsTUFBTSxLQUFXLENBQUM7UUFDUixZQUFZLEtBQVUsQ0FBQztLQUNqQztJQUVELE1BQU0sZUFBZ0IsU0FBUSx1QkFBVTtRQUV2QztZQUNDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQzFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxxQ0FBb0IsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksMENBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7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QyxDQUFDLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0QsMkJBQTJCO1lBQzNCLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQTBDO1lBQzFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQTBDO1lBRTFHLE9BQU8sQ0FBQyxTQUFTLEVB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
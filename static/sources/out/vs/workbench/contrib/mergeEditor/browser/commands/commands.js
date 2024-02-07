/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/resources", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/editor/common/editorService"], function (require, exports, codicons_1, resources_1, uri_1, nls_1, actions_1, contextkey_1, dialogs_1, opener_1, storage_1, mergeEditorInput_1, mergeEditor_1, mergeEditor_2, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AcceptMerge = exports.ResetCloseWithConflictsChoice = exports.ResetToBaseAndAutoMergeCommand = exports.AcceptAllInput2 = exports.AcceptAllInput1 = exports.OpenBaseFile = exports.CompareInput2WithBaseCommand = exports.CompareInput1WithBaseCommand = exports.ToggleActiveConflictInput2 = exports.ToggleActiveConflictInput1 = exports.GoToPreviousUnhandledConflict = exports.GoToNextUnhandledConflict = exports.OpenResultResource = exports.ShowHideCenterBase = exports.ShowHideTopBase = exports.ShowHideBase = exports.ShowNonConflictingChanges = exports.SetColumnLayout = exports.SetMixedLayout = exports.OpenMergeEditor = void 0;
    class MergeEditorAction extends actions_1.Action2 {
        constructor(desc) {
            super(desc);
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                const vm = activeEditorPane.viewModel.get();
                if (!vm) {
                    return;
                }
                this.runWithViewModel(vm, accessor);
            }
        }
    }
    class MergeEditorAction2 extends actions_1.Action2 {
        constructor(desc) {
            super(desc);
        }
        run(accessor, ...args) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                const vm = activeEditorPane.viewModel.get();
                if (!vm) {
                    return;
                }
                return this.runWithMergeEditor({
                    viewModel: vm,
                    inputModel: activeEditorPane.inputModel.get(),
                    input: activeEditorPane.input,
                    editorIdentifier: {
                        editor: activeEditorPane.input,
                        groupId: activeEditorPane.group.id,
                    }
                }, accessor, ...args);
            }
        }
    }
    class OpenMergeEditor extends actions_1.Action2 {
        constructor() {
            super({
                id: '_open.mergeEditor',
                title: (0, nls_1.localize2)('title', 'Open Merge Editor'),
            });
        }
        run(accessor, ...args) {
            const validatedArgs = IRelaxedOpenArgs.validate(args[0]);
            const input = {
                base: { resource: validatedArgs.base },
                input1: { resource: validatedArgs.input1.uri, label: validatedArgs.input1.title, description: validatedArgs.input1.description, detail: validatedArgs.input1.detail },
                input2: { resource: validatedArgs.input2.uri, label: validatedArgs.input2.title, description: validatedArgs.input2.description, detail: validatedArgs.input2.detail },
                result: { resource: validatedArgs.output },
                options: { preserveFocus: true }
            };
            accessor.get(editorService_1.IEditorService).openEditor(input);
        }
    }
    exports.OpenMergeEditor = OpenMergeEditor;
    var IRelaxedOpenArgs;
    (function (IRelaxedOpenArgs) {
        function validate(obj) {
            if (!obj || typeof obj !== 'object') {
                throw new TypeError('invalid argument');
            }
            const o = obj;
            const base = toUri(o.base);
            const output = toUri(o.output);
            const input1 = toInputData(o.input1);
            const input2 = toInputData(o.input2);
            return { base, input1, input2, output };
        }
        IRelaxedOpenArgs.validate = validate;
        function toInputData(obj) {
            if (typeof obj === 'string') {
                return new mergeEditorInput_1.MergeEditorInputData(uri_1.URI.parse(obj, true), undefined, undefined, undefined);
            }
            if (!obj || typeof obj !== 'object') {
                throw new TypeError('invalid argument');
            }
            if (isUriComponents(obj)) {
                return new mergeEditorInput_1.MergeEditorInputData(uri_1.URI.revive(obj), undefined, undefined, undefined);
            }
            const o = obj;
            const title = o.title;
            const uri = toUri(o.uri);
            const detail = o.detail;
            const description = o.description;
            return new mergeEditorInput_1.MergeEditorInputData(uri, title, detail, description);
        }
        function toUri(obj) {
            if (typeof obj === 'string') {
                return uri_1.URI.parse(obj, true);
            }
            else if (obj && typeof obj === 'object') {
                return uri_1.URI.revive(obj);
            }
            throw new TypeError('invalid argument');
        }
        function isUriComponents(obj) {
            if (!obj || typeof obj !== 'object') {
                return false;
            }
            const o = obj;
            return typeof o.scheme === 'string'
                && typeof o.authority === 'string'
                && typeof o.path === 'string'
                && typeof o.query === 'string'
                && typeof o.fragment === 'string';
        }
    })(IRelaxedOpenArgs || (IRelaxedOpenArgs = {}));
    class SetMixedLayout extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.mixedLayout',
                title: {
                    value: (0, nls_1.localize)('layout.mixed', 'Mixed Layout'),
                    original: 'Mixed Layout',
                },
                toggled: mergeEditor_2.ctxMergeEditorLayout.isEqualTo('mixed'),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: '1_merge',
                        order: 9,
                    },
                ],
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.setLayoutKind('mixed');
            }
        }
    }
    exports.SetMixedLayout = SetMixedLayout;
    class SetColumnLayout extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.columnLayout',
                title: (0, nls_1.localize2)('layout.column', 'Column Layout'),
                toggled: mergeEditor_2.ctxMergeEditorLayout.isEqualTo('columns'),
                menu: [{
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: '1_merge',
                        order: 10,
                    }],
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.setLayoutKind('columns');
            }
        }
    }
    exports.SetColumnLayout = SetColumnLayout;
    class ShowNonConflictingChanges extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.showNonConflictingChanges',
                title: {
                    value: (0, nls_1.localize)('showNonConflictingChanges', 'Show Non-Conflicting Changes'),
                    original: 'Show Non-Conflicting Changes',
                },
                toggled: mergeEditor_2.ctxMergeEditorShowNonConflictingChanges.isEqualTo(true),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: '3_merge',
                        order: 9,
                    },
                ],
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.toggleShowNonConflictingChanges();
            }
        }
    }
    exports.ShowNonConflictingChanges = ShowNonConflictingChanges;
    class ShowHideBase extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.showBase',
                title: {
                    value: (0, nls_1.localize)('layout.showBase', 'Show Base'),
                    original: 'Show Base',
                },
                toggled: mergeEditor_2.ctxMergeEditorShowBase.isEqualTo(true),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxIsMergeEditor, mergeEditor_2.ctxMergeEditorLayout.isEqualTo('columns')),
                        group: '2_merge',
                        order: 9,
                    },
                ]
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.toggleBase();
            }
        }
    }
    exports.ShowHideBase = ShowHideBase;
    class ShowHideTopBase extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.showBaseTop',
                title: {
                    value: (0, nls_1.localize)('layout.showBaseTop', 'Show Base Top'),
                    original: 'Show Base Top',
                },
                toggled: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxMergeEditorShowBase, mergeEditor_2.ctxMergeEditorShowBaseAtTop),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxIsMergeEditor, mergeEditor_2.ctxMergeEditorLayout.isEqualTo('mixed')),
                        group: '2_merge',
                        order: 10,
                    },
                ],
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.toggleShowBaseTop();
            }
        }
    }
    exports.ShowHideTopBase = ShowHideTopBase;
    class ShowHideCenterBase extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.showBaseCenter',
                title: {
                    value: (0, nls_1.localize)('layout.showBaseCenter', 'Show Base Center'),
                    original: 'Show Base Center',
                },
                toggled: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxMergeEditorShowBase, mergeEditor_2.ctxMergeEditorShowBaseAtTop.negate()),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxIsMergeEditor, mergeEditor_2.ctxMergeEditorLayout.isEqualTo('mixed')),
                        group: '2_merge',
                        order: 11,
                    },
                ],
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.toggleShowBaseCenter();
            }
        }
    }
    exports.ShowHideCenterBase = ShowHideCenterBase;
    const mergeEditorCategory = {
        value: (0, nls_1.localize)('mergeEditor', 'Merge Editor'),
        original: 'Merge Editor',
    };
    class OpenResultResource extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.openResult',
                icon: codicons_1.Codicon.goToFile,
                title: {
                    value: (0, nls_1.localize)('openfile', 'Open File'),
                    original: 'Open File',
                },
                category: mergeEditorCategory,
                menu: [{
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: 'navigation',
                        order: 1,
                    }],
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel, accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            editorService.openEditor({ resource: viewModel.model.resultTextModel.uri });
        }
    }
    exports.OpenResultResource = OpenResultResource;
    class GoToNextUnhandledConflict extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.goToNextUnhandledConflict',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.goToNextUnhandledConflict', 'Go to Next Unhandled Conflict'),
                    original: 'Go to Next Unhandled Conflict',
                },
                icon: codicons_1.Codicon.arrowDown,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: 'navigation',
                        order: 3
                    },
                ],
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.model.telemetry.reportNavigationToNextConflict();
            viewModel.goToNextModifiedBaseRange(r => !viewModel.model.isHandled(r).get());
        }
    }
    exports.GoToNextUnhandledConflict = GoToNextUnhandledConflict;
    class GoToPreviousUnhandledConflict extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.goToPreviousUnhandledConflict',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.goToPreviousUnhandledConflict', 'Go to Previous Unhandled Conflict'),
                    original: 'Go to Previous Unhandled Conflict',
                },
                icon: codicons_1.Codicon.arrowUp,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: 'navigation',
                        order: 2
                    },
                ],
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.model.telemetry.reportNavigationToPreviousConflict();
            viewModel.goToPreviousModifiedBaseRange(r => !viewModel.model.isHandled(r).get());
        }
    }
    exports.GoToPreviousUnhandledConflict = GoToPreviousUnhandledConflict;
    class ToggleActiveConflictInput1 extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.toggleActiveConflictInput1',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.toggleCurrentConflictFromLeft', 'Toggle Current Conflict from Left'),
                    original: 'Toggle Current Conflict from Left',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.toggleActiveConflict(1);
        }
    }
    exports.ToggleActiveConflictInput1 = ToggleActiveConflictInput1;
    class ToggleActiveConflictInput2 extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.toggleActiveConflictInput2',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.toggleCurrentConflictFromRight', 'Toggle Current Conflict from Right'),
                    original: 'Toggle Current Conflict from Right',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.toggleActiveConflict(2);
        }
    }
    exports.ToggleActiveConflictInput2 = ToggleActiveConflictInput2;
    class CompareInput1WithBaseCommand extends MergeEditorAction {
        constructor() {
            super({
                id: 'mergeEditor.compareInput1WithBase',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.compareInput1WithBase', 'Compare Input 1 With Base'),
                    original: 'Compare Input 1 With Base',
                },
                shortTitle: (0, nls_1.localize)('mergeEditor.compareWithBase', 'Compare With Base'),
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: { id: actions_1.MenuId.MergeInput1Toolbar, group: 'primary' },
                icon: codicons_1.Codicon.compareChanges,
            });
        }
        runWithViewModel(viewModel, accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            mergeEditorCompare(viewModel, editorService, 1);
        }
    }
    exports.CompareInput1WithBaseCommand = CompareInput1WithBaseCommand;
    class CompareInput2WithBaseCommand extends MergeEditorAction {
        constructor() {
            super({
                id: 'mergeEditor.compareInput2WithBase',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.compareInput2WithBase', 'Compare Input 2 With Base'),
                    original: 'Compare Input 2 With Base',
                },
                shortTitle: (0, nls_1.localize)('mergeEditor.compareWithBase', 'Compare With Base'),
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: { id: actions_1.MenuId.MergeInput2Toolbar, group: 'primary' },
                icon: codicons_1.Codicon.compareChanges,
            });
        }
        runWithViewModel(viewModel, accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            mergeEditorCompare(viewModel, editorService, 2);
        }
    }
    exports.CompareInput2WithBaseCommand = CompareInput2WithBaseCommand;
    async function mergeEditorCompare(viewModel, editorService, inputNumber) {
        editorService.openEditor(editorService.activeEditor, { pinned: true });
        const model = viewModel.model;
        const base = model.base;
        const input = inputNumber === 1 ? viewModel.inputCodeEditorView1.editor : viewModel.inputCodeEditorView2.editor;
        const lineNumber = input.getPosition().lineNumber;
        await editorService.openEditor({
            original: { resource: base.uri },
            modified: { resource: input.getModel().uri },
            options: {
                selection: {
                    startLineNumber: lineNumber,
                    startColumn: 1,
                },
                revealIfOpened: true,
                revealIfVisible: true,
            }
        });
    }
    class OpenBaseFile extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.openBaseEditor',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.openBaseEditor', 'Open Base File'),
                    original: 'Open Base File',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel, accessor) {
            const openerService = accessor.get(opener_1.IOpenerService);
            openerService.open(viewModel.model.base.uri);
        }
    }
    exports.OpenBaseFile = OpenBaseFile;
    class AcceptAllInput1 extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.acceptAllInput1',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.acceptAllInput1', 'Accept All Changes from Left'),
                    original: 'Accept All Changes from Left',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: { id: actions_1.MenuId.MergeInput1Toolbar, group: 'primary' },
                icon: codicons_1.Codicon.checkAll,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.acceptAll(1);
        }
    }
    exports.AcceptAllInput1 = AcceptAllInput1;
    class AcceptAllInput2 extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.acceptAllInput2',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.acceptAllInput2', 'Accept All Changes from Right'),
                    original: 'Accept All Changes from Right',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: { id: actions_1.MenuId.MergeInput2Toolbar, group: 'primary' },
                icon: codicons_1.Codicon.checkAll,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.acceptAll(2);
        }
    }
    exports.AcceptAllInput2 = AcceptAllInput2;
    class ResetToBaseAndAutoMergeCommand extends MergeEditorAction {
        constructor() {
            super({
                id: 'mergeEditor.resetResultToBaseAndAutoMerge',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.resetResultToBaseAndAutoMerge', 'Reset Result'),
                    original: 'Reset Result',
                },
                shortTitle: (0, nls_1.localize)('mergeEditor.resetResultToBaseAndAutoMerge.short', 'Reset'),
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: { id: actions_1.MenuId.MergeInputResultToolbar, group: 'primary' },
                icon: codicons_1.Codicon.discard,
            });
        }
        runWithViewModel(viewModel, accessor) {
            viewModel.model.reset();
        }
    }
    exports.ResetToBaseAndAutoMergeCommand = ResetToBaseAndAutoMergeCommand;
    class ResetCloseWithConflictsChoice extends actions_1.Action2 {
        constructor() {
            super({
                id: 'mergeEditor.resetCloseWithConflictsChoice',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.resetChoice', 'Reset Choice for \'Close with Conflicts\''),
                    original: 'Reset Choice for \'Close with Conflicts\'',
                },
                f1: true,
            });
        }
        run(accessor) {
            accessor.get(storage_1.IStorageService).remove(mergeEditor_2.StorageCloseWithConflicts, 0 /* StorageScope.PROFILE */);
        }
    }
    exports.ResetCloseWithConflictsChoice = ResetCloseWithConflictsChoice;
    // this is an API command
    class AcceptMerge extends MergeEditorAction2 {
        constructor() {
            super({
                id: 'mergeEditor.acceptMerge',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.acceptMerge', 'Complete Merge'),
                    original: 'Complete Merge',
                },
                f1: false,
                precondition: mergeEditor_2.ctxIsMergeEditor
            });
        }
        async runWithMergeEditor({ inputModel, editorIdentifier, viewModel }, accessor) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const editorService = accessor.get(editorService_1.IEditorService);
            if (viewModel.model.unhandledConflictsCount.get() > 0) {
                const { confirmed } = await dialogService.confirm({
                    message: (0, nls_1.localize)('mergeEditor.acceptMerge.unhandledConflicts.message', "Do you want to complete the merge of {0}?", (0, resources_1.basename)(inputModel.resultUri)),
                    detail: (0, nls_1.localize)('mergeEditor.acceptMerge.unhandledConflicts.detail', "The file contains unhandled conflicts."),
                    primaryButton: (0, nls_1.localize)({ key: 'mergeEditor.acceptMerge.unhandledConflicts.accept', comment: ['&& denotes a mnemonic'] }, "&&Complete with Conflicts")
                });
                if (!confirmed) {
                    return {
                        successful: false
                    };
                }
            }
            await inputModel.accept();
            await editorService.closeEditor(editorIdentifier);
            return {
                successful: true
            };
        }
    }
    exports.AcceptMerge = AcceptMerge;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvY29tbWFuZHMvY29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0JoRyxNQUFlLGlCQUFrQixTQUFRLGlCQUFPO1FBQy9DLFlBQVksSUFBK0I7WUFDMUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQjtZQUM3QixNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUMxRCxJQUFJLGdCQUFnQixZQUFZLHlCQUFXLEVBQUUsQ0FBQztnQkFDN0MsTUFBTSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1QsT0FBTztnQkFDUixDQUFDO2dCQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckMsQ0FBQztRQUNGLENBQUM7S0FHRDtJQVNELE1BQWUsa0JBQW1CLFNBQVEsaUJBQU87UUFDaEQsWUFBWSxJQUErQjtZQUMxQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDO1FBRVEsR0FBRyxDQUFDLFFBQTBCLEVBQUUsR0FBRyxJQUFXO1lBQ3RELE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQzFELElBQUksZ0JBQWdCLFlBQVkseUJBQVcsRUFBRSxDQUFDO2dCQUM3QyxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFF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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/codicons", "vs/base/common/extpath", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/workbench/services/editor/common/editorService"], function (require, exports, buffer_1, codicons_1, extpath_1, uri_1, language_1, nls_1, actions_1, clipboardService_1, environment_1, files_1, quickInput_1, mergeEditor_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenSelectionInTemporaryMergeEditor = exports.MergeEditorOpenContentsFromJSON = void 0;
    const MERGE_EDITOR_CATEGORY = (0, nls_1.localize2)('mergeEditor', 'Merge Editor (Dev)');
    class MergeEditorOpenContentsFromJSON extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.dev.openContentsJson',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.openState', 'Open Merge Editor State from JSON'),
                    original: 'Open Merge Editor State from JSON',
                },
                icon: codicons_1.Codicon.layoutCentered,
                f1: true,
            });
        }
        async run(accessor, args) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const languageService = accessor.get(language_1.ILanguageService);
            const env = accessor.get(environment_1.INativeEnvironmentService);
            const fileService = accessor.get(files_1.IFileService);
            if (!args) {
                args = {};
            }
            let content;
            if (!args.data) {
                const result = await quickInputService.input({
                    prompt: (0, nls_1.localize)('mergeEditor.enterJSON', 'Enter JSON'),
                    value: await clipboardService.readText(),
                });
                if (result === undefined) {
                    return;
                }
                content =
                    result !== ''
                        ? JSON.parse(result)
                        : { base: '', input1: '', input2: '', result: '', languageId: 'plaintext' };
            }
            else {
                content = args.data;
            }
            const targetDir = uri_1.URI.joinPath(env.tmpDir, (0, extpath_1.randomPath)());
            const extension = languageService.getExtensions(content.languageId)[0] || '';
            const baseUri = uri_1.URI.joinPath(targetDir, `/base${extension}`);
            const input1Uri = uri_1.URI.joinPath(targetDir, `/input1${extension}`);
            const input2Uri = uri_1.URI.joinPath(targetDir, `/input2${extension}`);
            const resultUri = uri_1.URI.joinPath(targetDir, `/result${extension}`);
            const initialResultUri = uri_1.URI.joinPath(targetDir, `/initialResult${extension}`);
            async function writeFile(uri, content) {
                await fileService.writeFile(uri, buffer_1.VSBuffer.fromString(content));
            }
            const shouldOpenInitial = await promptOpenInitial(quickInputService, args.resultState);
            await Promise.all([
                writeFile(baseUri, content.base),
                writeFile(input1Uri, content.input1),
                writeFile(input2Uri, content.input2),
                writeFile(resultUri, shouldOpenInitial ? (content.initialResult || '') : content.result),
                writeFile(initialResultUri, content.initialResult || ''),
            ]);
            const input = {
                base: { resource: baseUri },
                input1: { resource: input1Uri, label: 'Input 1', description: 'Input 1', detail: '(from JSON)' },
                input2: { resource: input2Uri, label: 'Input 2', description: 'Input 2', detail: '(from JSON)' },
                result: { resource: resultUri },
            };
            editorService.openEditor(input);
        }
    }
    exports.MergeEditorOpenContentsFromJSON = MergeEditorOpenContentsFromJSON;
    async function promptOpenInitial(quickInputService, resultStateOverride) {
        if (resultStateOverride) {
            return resultStateOverride === 'initial';
        }
        const result = await quickInputService.pick([{ label: 'result', result: false }, { label: 'initial result', result: true }], { canPickMany: false });
        return result?.result;
    }
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
    class OpenSelectionInTemporaryMergeEditor extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.dev.openSelectionInTemporaryMergeEditor',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.openSelectionInTemporaryMergeEditor', 'Open Selection In Temporary Merge Editor'),
                    original: 'Open Selection In Temporary Merge Editor',
                },
                icon: codicons_1.Codicon.layoutCentered,
                f1: true,
            });
        }
        async runWithViewModel(viewModel, accessor) {
            const rangesInBase = viewModel.selectionInBase.get()?.rangesInBase;
            if (!rangesInBase || rangesInBase.length === 0) {
                return;
            }
            const base = rangesInBase
                .map((r) => viewModel.model.base.getValueInRange(r))
                .join('\n');
            const input1 = rangesInBase
                .map((r) => viewModel.inputCodeEditorView1.editor.getModel().getValueInRange(viewModel.model.translateBaseRangeToInput(1, r)))
                .join('\n');
            const input2 = rangesInBase
                .map((r) => viewModel.inputCodeEditorView2.editor.getModel().getValueInRange(viewModel.model.translateBaseRangeToInput(2, r)))
                .join('\n');
            const result = rangesInBase
                .map((r) => viewModel.resultCodeEditorView.editor.getModel().getValueInRange(viewModel.model.translateBaseRangeToResult(r)))
                .join('\n');
            new MergeEditorOpenContentsFromJSON().run(accessor, {
                data: {
                    base,
                    input1,
                    input2,
                    result,
                    languageId: viewModel.resultCodeEditorView.editor.getModel().getLanguageId()
                }
            });
        }
    }
    exports.OpenSelectionInTemporaryMergeEditor = OpenSelectionInTemporaryMergeEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2Q29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2VsZWN0cm9uLXNhbmRib3gvZGV2Q29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFNLHFCQUFxQixHQUFxQixJQUFBLGVBQVMsRUFBQyxhQUFhLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUUvRixNQUFhLCtCQUFnQyxTQUFRLGlCQUFPO1FBQzNEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw0QkFBNEI7Z0JBQ2hDLFFBQVEsRUFBRSxxQkFBcUI7Z0JBQy9CLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQ2QscUJBQXFCLEVBQ3JCLG1DQUFtQyxDQUNuQztvQkFDRCxRQUFRLEVBQUUsbUNBQW1DO2lCQUM3QztnQkFDRCxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxjQUFjO2dCQUM1QixFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsSUFBMEU7WUFDL0csTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFDM0QsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7WUFDekQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUNBQXlCLENBQUMsQ0FBQztZQUNw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
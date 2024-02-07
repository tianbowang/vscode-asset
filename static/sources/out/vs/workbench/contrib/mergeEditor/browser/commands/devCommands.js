/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/codicons", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/editor/common/editorService"], function (require, exports, buffer_1, codicons_1, uri_1, language_1, nls_1, actions_1, clipboardService_1, dialogs_1, files_1, notification_1, quickInput_1, mergeEditor_1, mergeEditor_2, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeEditorLoadContentsFromFolder = exports.MergeEditorSaveContentsToFolder = exports.MergeEditorCopyContentsToJSON = void 0;
    const MERGE_EDITOR_CATEGORY = (0, nls_1.localize2)('mergeEditor', 'Merge Editor (Dev)');
    class MergeEditorCopyContentsToJSON extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.dev.copyContentsJson',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.copyState', 'Copy Merge Editor State as JSON'),
                    original: 'Copy Merge Editor State as JSON',
                },
                icon: codicons_1.Codicon.layoutCentered,
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const notificationService = accessor.get(notification_1.INotificationService);
            if (!(activeEditorPane instanceof mergeEditor_1.MergeEditor)) {
                notificationService.info({
                    name: (0, nls_1.localize)('mergeEditor.name', 'Merge Editor'),
                    message: (0, nls_1.localize)('mergeEditor.noActiveMergeEditor', "No active merge editor")
                });
                return;
            }
            const model = activeEditorPane.model;
            if (!model) {
                return;
            }
            const contents = {
                languageId: model.resultTextModel.getLanguageId(),
                base: model.base.getValue(),
                input1: model.input1.textModel.getValue(),
                input2: model.input2.textModel.getValue(),
                result: model.resultTextModel.getValue(),
                initialResult: model.getInitialResultValue(),
            };
            const jsonStr = JSON.stringify(contents, undefined, 4);
            clipboardService.writeText(jsonStr);
            notificationService.info({
                name: (0, nls_1.localize)('mergeEditor.name', 'Merge Editor'),
                message: (0, nls_1.localize)('mergeEditor.successfullyCopiedMergeEditorContents', "Successfully copied merge editor state"),
            });
        }
    }
    exports.MergeEditorCopyContentsToJSON = MergeEditorCopyContentsToJSON;
    class MergeEditorSaveContentsToFolder extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.dev.saveContentsToFolder',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.saveContentsToFolder', 'Save Merge Editor State to Folder'),
                    original: 'Save Merge Editor State to Folder',
                },
                icon: codicons_1.Codicon.layoutCentered,
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        async run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const dialogService = accessor.get(dialogs_1.IFileDialogService);
            const fileService = accessor.get(files_1.IFileService);
            const languageService = accessor.get(language_1.ILanguageService);
            if (!(activeEditorPane instanceof mergeEditor_1.MergeEditor)) {
                notificationService.info({
                    name: (0, nls_1.localize)('mergeEditor.name', 'Merge Editor'),
                    message: (0, nls_1.localize)('mergeEditor.noActiveMergeEditor', "No active merge editor")
                });
                return;
            }
            const model = activeEditorPane.model;
            if (!model) {
                return;
            }
            const result = await dialogService.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: (0, nls_1.localize)('mergeEditor.selectFolderToSaveTo', 'Select folder to save to')
            });
            if (!result) {
                return;
            }
            const targetDir = result[0];
            const extension = languageService.getExtensions(model.resultTextModel.getLanguageId())[0] || '';
            async function write(fileName, source) {
                await fileService.writeFile(uri_1.URI.joinPath(targetDir, fileName + extension), buffer_1.VSBuffer.fromString(source), {});
            }
            await Promise.all([
                write('base', model.base.getValue()),
                write('input1', model.input1.textModel.getValue()),
                write('input2', model.input2.textModel.getValue()),
                write('result', model.resultTextModel.getValue()),
                write('initialResult', model.getInitialResultValue()),
            ]);
            notificationService.info({
                name: (0, nls_1.localize)('mergeEditor.name', 'Merge Editor'),
                message: (0, nls_1.localize)('mergeEditor.successfullySavedMergeEditorContentsToFolder', "Successfully saved merge editor state to folder"),
            });
        }
    }
    exports.MergeEditorSaveContentsToFolder = MergeEditorSaveContentsToFolder;
    class MergeEditorLoadContentsFromFolder extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.dev.loadContentsFromFolder',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.loadContentsFromFolder', 'Load Merge Editor State from Folder'),
                    original: 'Load Merge Editor State from Folder',
                },
                icon: codicons_1.Codicon.layoutCentered,
                f1: true
            });
        }
        async run(accessor, args) {
            const dialogService = accessor.get(dialogs_1.IFileDialogService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const fileService = accessor.get(files_1.IFileService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            if (!args) {
                args = {};
            }
            let targetDir;
            if (!args.folderUri) {
                const result = await dialogService.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    title: (0, nls_1.localize)('mergeEditor.selectFolderToSaveTo', 'Select folder to save to')
                });
                if (!result) {
                    return;
                }
                targetDir = result[0];
            }
            else {
                targetDir = args.folderUri;
            }
            const targetDirInfo = await fileService.resolve(targetDir);
            function findFile(name) {
                return targetDirInfo.children.find(c => c.name.startsWith(name))?.resource;
            }
            const shouldOpenInitial = await promptOpenInitial(quickInputService, args.resultState);
            const baseUri = findFile('base');
            const input1Uri = findFile('input1');
            const input2Uri = findFile('input2');
            const resultUri = findFile(shouldOpenInitial ? 'initialResult' : 'result');
            const input = {
                base: { resource: baseUri },
                input1: { resource: input1Uri, label: 'Input 1', description: 'Input 1', detail: '(from file)' },
                input2: { resource: input2Uri, label: 'Input 2', description: 'Input 2', detail: '(from file)' },
                result: { resource: resultUri },
            };
            editorService.openEditor(input);
        }
    }
    exports.MergeEditorLoadContentsFromFolder = MergeEditorLoadContentsFromFolder;
    async function promptOpenInitial(quickInputService, resultStateOverride) {
        if (resultStateOverride) {
            return resultStateOverride === 'initial';
        }
        const result = await quickInputService.pick([{ label: 'result', result: false }, { label: 'initial result', result: true }], { canPickMany: false });
        return result?.result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2Q29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvY29tbWFuZHMvZGV2Q29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxNQUFNLHFCQUFxQixHQUFxQixJQUFBLGVBQVMsRUFBQyxhQUFhLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUUvRixNQUFhLDZCQUE4QixTQUFRLGlCQUFPO1FBQ3pEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw0QkFBNEI7Z0JBQ2hDLFFBQVEsRUFBRSxxQkFBcUI7Z0JBQy9CLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQ2QscUJBQXFCLEVBQ3JCLGlDQUFpQyxDQUNqQztvQkFDRCxRQUFRLEVBQUUsaUNBQWlDO2lCQUMzQztnQkFDRCxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxjQUFjO2dCQUM1QixFQUFFLEVBQUUsSUFBSTtnQkFDUixZQUFZLEVBQUUsOEJBQWdCO2FBQzlCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEI7WUFDN0IsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDMUQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7WUFDekQsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1DQUFvQixDQUFDLENBQUM7WUFFL0QsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLFlBQVkseUJBQVcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hELG1CQUFtQixDQUFDLElBQUksQ0FBQztvQkFDeEIsSUFBSSxFQUFFLElBQUEs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
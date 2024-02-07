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
define(["require", "exports", "vs/nls", "vs/base/common/performance", "vs/base/common/types", "vs/workbench/services/path/common/pathService", "vs/base/common/actions", "vs/workbench/contrib/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/browser/parts/editor/textCodeEditor", "vs/workbench/common/editor", "vs/workbench/common/editor/editorOptions", "vs/workbench/common/editor/binaryEditorModel", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/platform/files/common/files", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/editor/common/editor", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/files/browser/files", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/configuration/common/configuration", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/host/browser/host", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, nls_1, performance_1, types_1, pathService_1, actions_1, files_1, textfiles_1, textCodeEditor_1, editor_1, editorOptions_1, binaryEditorModel_1, fileEditorInput_1, files_2, telemetry_1, workspace_1, storage_1, textResourceConfiguration_1, instantiation_1, themeService_1, editorService_1, editorGroupsService_1, editor_2, uriIdentity_1, files_3, panecomposite_1, configuration_1, preferences_1, host_1, filesConfigurationService_1) {
    "use strict";
    var TextFileEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextFileEditor = void 0;
    /**
     * An implementation of editor for file system resources.
     */
    let TextFileEditor = class TextFileEditor extends textCodeEditor_1.AbstractTextCodeEditor {
        static { TextFileEditor_1 = this; }
        static { this.ID = files_1.TEXT_FILE_EDITOR_ID; }
        constructor(telemetryService, fileService, paneCompositeService, instantiationService, contextService, storageService, textResourceConfigurationService, editorService, themeService, editorGroupService, textFileService, explorerService, uriIdentityService, pathService, configurationService, preferencesService, hostService, filesConfigurationService) {
            super(TextFileEditor_1.ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
            this.paneCompositeService = paneCompositeService;
            this.contextService = contextService;
            this.textFileService = textFileService;
            this.explorerService = explorerService;
            this.uriIdentityService = uriIdentityService;
            this.pathService = pathService;
            this.configurationService = configurationService;
            this.preferencesService = preferencesService;
            this.hostService = hostService;
            this.filesConfigurationService = filesConfigurationService;
            // Clear view state for deleted files
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
            // Move view state for moved files
            this._register(this.fileService.onDidRunOperation(e => this.onDidRunOperation(e)));
        }
        onDidFilesChange(e) {
            for (const resource of e.rawDeleted) {
                this.clearEditorViewState(resource);
            }
        }
        onDidRunOperation(e) {
            if (e.operation === 2 /* FileOperation.MOVE */ && e.target) {
                this.moveEditorViewState(e.resource, e.target.resource, this.uriIdentityService.extUri);
            }
        }
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)('textFileEditor', "Text File Editor");
        }
        get input() {
            return this._input;
        }
        async setInput(input, options, context, token) {
            (0, performance_1.mark)('code/willSetInputToTextFileEditor');
            // Set input and resolve
            await super.setInput(input, options, context, token);
            try {
                const resolvedModel = await input.resolve(options);
                // Check for cancellation
                if (token.isCancellationRequested) {
                    return;
                }
                // There is a special case where the text editor has to handle binary
                // file editor input: if a binary file has been resolved and cached
                // before, it maybe an actual instance of BinaryEditorModel. In this
                // case our text editor has to open this model using the binary editor.
                // We return early in this case.
                if (resolvedModel instanceof binaryEditorModel_1.BinaryEditorModel) {
                    return this.openAsBinary(input, options);
                }
                const textFileModel = resolvedModel;
                // Editor
                const control = (0, types_1.assertIsDefined)(this.editorControl);
                control.setModel(textFileModel.textEditorModel);
                // Restore view state (unless provided by options)
                if (!(0, editor_1.isTextEditorViewState)(options?.viewState)) {
                    const editorViewState = this.loadEditorViewState(input, context);
                    if (editorViewState) {
                        if (options?.selection) {
                            editorViewState.cursorState = []; // prevent duplicate selections via options
                        }
                        control.restoreViewState(editorViewState);
                    }
                }
                // Apply options to editor if any
                if (options) {
                    (0, editorOptions_1.applyTextEditorOptions)(options, control, 1 /* ScrollType.Immediate */);
                }
                // Since the resolved model provides information about being readonly
                // or not, we apply it here to the editor even though the editor input
                // was already asked for being readonly or not. The rationale is that
                // a resolved model might have more specific information about being
                // readonly or not that the input did not have.
                control.updateOptions(this.getReadonlyConfiguration(textFileModel.isReadonly()));
                if (control.handleInitialized) {
                    control.handleInitialized();
                }
            }
            catch (error) {
                await this.handleSetInputError(error, input, options);
            }
            (0, performance_1.mark)('code/didSetInputToTextFileEditor');
        }
        async handleSetInputError(error, input, options) {
            // Handle case where content appears to be binary
            if (error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */) {
                return this.openAsBinary(input, options);
            }
            // Handle case where we were asked to open a folder
            if (error.fileOperationResult === 0 /* FileOperationResult.FILE_IS_DIRECTORY */) {
                const actions = [];
                actions.push((0, actions_1.toAction)({
                    id: 'workbench.files.action.openFolder', label: (0, nls_1.localize)('openFolder', "Open Folder"), run: async () => {
                        return this.hostService.openWindow([{ folderUri: input.resource }], { forceNewWindow: true });
                    }
                }));
                if (this.contextService.isInsideWorkspace(input.preferredResource)) {
                    actions.push((0, actions_1.toAction)({
                        id: 'workbench.files.action.reveal', label: (0, nls_1.localize)('reveal', "Reveal Folder"), run: async () => {
                            await this.paneCompositeService.openPaneComposite(files_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
                            return this.explorerService.select(input.preferredResource, true);
                        }
                    }));
                }
                throw (0, editor_1.createEditorOpenError)((0, nls_1.localize)('fileIsDirectory', "The file is not displayed in the text editor because it is a directory."), actions, { forceMessage: true });
            }
            // Handle case where a file is too large to open without confirmation
            if (error.fileOperationResult === 7 /* FileOperationResult.FILE_TOO_LARGE */ && this.group) {
                let message;
                if (error instanceof files_2.TooLargeFileOperationError) {
                    message = (0, nls_1.localize)('fileTooLargeForHeapErrorWithSize', "The file is not displayed in the text editor because it is very large ({0}).", files_2.ByteSize.formatSize(error.size));
                }
                else {
                    message = (0, nls_1.localize)('fileTooLargeForHeapErrorWithoutSize', "The file is not displayed in the text editor because it is very large.");
                }
                throw (0, editor_1.createTooLargeFileError)(this.group, input, options, message, this.preferencesService);
            }
            // Offer to create a file from the error if we have a file not found and the name is valid and not readonly
            if (error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */ &&
                !this.filesConfigurationService.isReadonly(input.preferredResource) &&
                await this.pathService.hasValidBasename(input.preferredResource)) {
                const fileNotFoundError = (0, editor_1.createEditorOpenError)(new files_2.FileOperationError((0, nls_1.localize)('unavailableResourceErrorEditorText', "The editor could not be opened because the file was not found."), 1 /* FileOperationResult.FILE_NOT_FOUND */), [
                    (0, actions_1.toAction)({
                        id: 'workbench.files.action.createMissingFile', label: (0, nls_1.localize)('createFile', "Create File"), run: async () => {
                            await this.textFileService.create([{ resource: input.preferredResource }]);
                            return this.editorService.openEditor({
                                resource: input.preferredResource,
                                options: {
                                    pinned: true // new file gets pinned by default
                                }
                            });
                        }
                    })
                ], {
                    // Support the flow of directly pressing `Enter` on the dialog to
                    // create the file on the go. This is nice when for example following
                    // a link to a file that does not exist to scaffold it quickly.
                    allowDialog: true
                });
                throw fileNotFoundError;
            }
            // Otherwise make sure the error bubbles up
            throw error;
        }
        openAsBinary(input, options) {
            const defaultBinaryEditor = this.configurationService.getValue('workbench.editor.defaultBinaryEditor');
            const group = this.group ?? this.editorGroupService.activeGroup;
            const editorOptions = {
                ...options,
                // Make sure to not steal away the currently active group
                // because we are triggering another openEditor() call
                // and do not control the initial intent that resulted
                // in us now opening as binary.
                activation: editor_2.EditorActivation.PRESERVE
            };
            // Check configuration and determine whether we open the binary
            // file input in a different editor or going through the same
            // editor.
            // Going through the same editor is debt, and a better solution
            // would be to introduce a real editor for the binary case
            // and avoid enforcing binary or text on the file editor input.
            if (defaultBinaryEditor && defaultBinaryEditor !== '' && defaultBinaryEditor !== editor_1.DEFAULT_EDITOR_ASSOCIATION.id) {
                this.doOpenAsBinaryInDifferentEditor(group, defaultBinaryEditor, input, editorOptions);
            }
            else {
                this.doOpenAsBinaryInSameEditor(group, defaultBinaryEditor, input, editorOptions);
            }
        }
        doOpenAsBinaryInDifferentEditor(group, editorId, editor, editorOptions) {
            this.editorService.replaceEditors([{
                    editor,
                    replacement: { resource: editor.resource, options: { ...editorOptions, override: editorId } }
                }], group);
        }
        doOpenAsBinaryInSameEditor(group, editorId, editor, editorOptions) {
            // Open binary as text
            if (editorId === editor_1.DEFAULT_EDITOR_ASSOCIATION.id) {
                editor.setForceOpenAsText();
                editor.setPreferredLanguageId(files_1.BINARY_TEXT_FILE_MODE); // https://github.com/microsoft/vscode/issues/131076
                editorOptions = { ...editorOptions, forceReload: true }; // Same pane and same input, must force reload to clear cached state
            }
            // Open as binary
            else {
                editor.setForceOpenAsBinary();
            }
            group.openEditor(editor, editorOptions);
        }
        clearInput() {
            super.clearInput();
            // Clear Model
            this.editorControl?.setModel(null);
        }
        createEditorControl(parent, initialOptions) {
            (0, performance_1.mark)('code/willCreateTextFileEditorControl');
            super.createEditorControl(parent, initialOptions);
            (0, performance_1.mark)('code/didCreateTextFileEditorControl');
        }
        tracksEditorViewState(input) {
            return input instanceof fileEditorInput_1.FileEditorInput;
        }
        tracksDisposedEditorViewState() {
            return true; // track view state even for disposed editors
        }
    };
    exports.TextFileEditor = TextFileEditor;
    exports.TextFileEditor = TextFileEditor = TextFileEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, files_2.IFileService),
        __param(2, panecomposite_1.IPaneCompositePartService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, storage_1.IStorageService),
        __param(6, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(7, editorService_1.IEditorService),
        __param(8, themeService_1.IThemeService),
        __param(9, editorGroupsService_1.IEditorGroupsService),
        __param(10, textfiles_1.ITextFileService),
        __param(11, files_3.IExplorerService),
        __param(12, uriIdentity_1.IUriIdentityService),
        __param(13, pathService_1.IPathService),
        __param(14, configuration_1.IConfigurationService),
        __param(15, preferences_1.IPreferencesService),
        __param(16, host_1.IHostService),
        __param(17, filesConfigurationService_1.IFilesConfigurationService)
    ], TextFileEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEZpbGVFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL2Jyb3dzZXIvZWRpdG9ycy90ZXh0RmlsZUVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUNoRzs7T0FFRztJQUNJLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSx1Q0FBNEM7O2lCQUUvRCxPQUFFLEdBQUcsMkJBQW1CLEFBQXRCLENBQXVCO1FBRXpDLFlBQ29CLGdCQUFtQyxFQUN4QyxXQUF5QixFQUNLLG9CQUErQyxFQUNwRSxvQkFBMkMsRUFDdkIsY0FBd0MsRUFDbEUsY0FBK0IsRUFDYixnQ0FBbUUsRUFDdEYsYUFBNkIsRUFDOUIsWUFBMkIsRUFDcEIsa0JBQXdDLEVBQzNCLGVBQWlDLEVBQ2pDLGVBQWlDLEVBQzlCLGtCQUF1QyxFQUM5QyxXQUF5QixFQUNoQixvQkFBMkMsRUFDM0Msa0JBQXVDLEVBQ2hELFdBQXlCLEVBQ1gseUJBQXFEO1lBRWxHLEtBQUssQ0FBQyxnQkFBYyxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsZ0NBQWdDLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLENBQUMsQ0FBQztZQWpCckkseUJBQW9CLEdBQXBCLG9CQUFvQixDQUEyQjtZQUVoRCxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFNaEQsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ2pDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUM5Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQzlDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2hCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MsdUJBQWtCLEdBQWxC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
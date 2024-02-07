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
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/base/common/types", "vs/workbench/browser/parts/editor/textEditor", "vs/workbench/common/editor", "vs/workbench/common/editor/editorOptions", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/editor/textDiffEditorModel", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/registry/common/platform", "vs/base/common/uri", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/editor/common/editor", "vs/platform/contextkey/common/contextkey", "vs/base/common/resources", "vs/base/browser/dom", "vs/platform/files/common/files", "vs/workbench/services/preferences/common/preferences", "vs/base/common/stopwatch", "vs/editor/browser/widget/diffEditor/diffEditorWidget"], function (require, exports, nls_1, objects_1, types_1, textEditor_1, editor_1, editorOptions_1, diffEditorInput_1, textDiffEditorModel_1, telemetry_1, storage_1, textResourceConfiguration_1, instantiation_1, themeService_1, platform_1, uri_1, editorGroupsService_1, editorService_1, editor_2, contextkey_1, resources_1, dom_1, files_1, preferences_1, stopwatch_1, diffEditorWidget_1) {
    "use strict";
    var TextDiffEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextDiffEditor = void 0;
    /**
     * The text editor that leverages the diff text editor for the editing experience.
     */
    let TextDiffEditor = class TextDiffEditor extends textEditor_1.AbstractTextEditor {
        static { TextDiffEditor_1 = this; }
        static { this.ID = editor_1.TEXT_DIFF_EDITOR_ID; }
        get scopedContextKeyService() {
            if (!this.diffEditorControl) {
                return undefined;
            }
            const originalEditor = this.diffEditorControl.getOriginalEditor();
            const modifiedEditor = this.diffEditorControl.getModifiedEditor();
            return (originalEditor.hasTextFocus() ? originalEditor : modifiedEditor).invokeWithinContext(accessor => accessor.get(contextkey_1.IContextKeyService));
        }
        constructor(telemetryService, instantiationService, storageService, configurationService, editorService, themeService, editorGroupService, fileService, preferencesService) {
            super(TextDiffEditor_1.ID, telemetryService, instantiationService, storageService, configurationService, themeService, editorService, editorGroupService, fileService);
            this.preferencesService = preferencesService;
            this.diffEditorControl = undefined;
            this.inputLifecycleStopWatch = undefined;
            this._previousViewModel = null;
        }
        getTitle() {
            if (this.input) {
                return this.input.getName();
            }
            return (0, nls_1.localize)('textDiffEditor', "Text Diff Editor");
        }
        createEditorControl(parent, configuration) {
            this.diffEditorControl = this._register(this.instantiationService.createInstance(diffEditorWidget_1.DiffEditorWidget, parent, configuration, {}));
        }
        updateEditorControlOptions(options) {
            this.diffEditorControl?.updateOptions(options);
        }
        getMainControl() {
            return this.diffEditorControl?.getModifiedEditor();
        }
        async setInput(input, options, context, token) {
            if (this._previousViewModel) {
                this._previousViewModel.dispose();
                this._previousViewModel = null;
            }
            // Cleanup previous things associated with the input
            this.inputLifecycleStopWatch = undefined;
            // Set input and resolve
            await super.setInput(input, options, context, token);
            try {
                const resolvedModel = await input.resolve(options);
                // Check for cancellation
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Fallback to open as binary if not text
                if (!(resolvedModel instanceof textDiffEditorModel_1.TextDiffEditorModel)) {
                    this.openAsBinary(input, options);
                    return undefined;
                }
                // Set Editor Model
                const control = (0, types_1.assertIsDefined)(this.diffEditorControl);
                const resolvedDiffEditorModel = resolvedModel;
                const vm = resolvedDiffEditorModel.textDiffEditorModel ? control.createViewModel(resolvedDiffEditorModel.textDiffEditorModel) : null;
                this._previousViewModel = vm;
                await vm?.waitForDiff();
                control.setModel(vm);
                // Restore view state (unless provided by options)
                let hasPreviousViewState = false;
                if (!(0, editor_1.isTextEditorViewState)(options?.viewState)) {
                    hasPreviousViewState = this.restoreTextDiffEditorViewState(input, options, context, control);
                }
                // Apply options to editor if any
                let optionsGotApplied = false;
                if (options) {
                    optionsGotApplied = (0, editorOptions_1.applyTextEditorOptions)(options, control, 1 /* ScrollType.Immediate */);
                }
                if (!optionsGotApplied && !hasPreviousViewState) {
                    control.revealFirstDiff();
                }
                // Since the resolved model provides information about being readonly
                // or not, we apply it here to the editor even though the editor input
                // was already asked for being readonly or not. The rationale is that
                // a resolved model might have more specific information about being
                // readonly or not that the input did not have.
                control.updateOptions({
                    ...this.getReadonlyConfiguration(resolvedDiffEditorModel.modifiedModel?.isReadonly()),
                    originalEditable: !resolvedDiffEditorModel.originalModel?.isReadonly()
                });
                control.handleInitialized();
                // Start to measure input lifecycle
                this.inputLifecycleStopWatch = new stopwatch_1.StopWatch(false);
            }
            catch (error) {
                await this.handleSetInputError(error, input, options);
            }
        }
        async handleSetInputError(error, input, options) {
            // Handle case where content appears to be binary
            if (this.isFileBinaryError(error)) {
                return this.openAsBinary(input, options);
            }
            // Handle case where a file is too large to open without confirmation
            if (error.fileOperationResult === 7 /* FileOperationResult.FILE_TOO_LARGE */ && this.group) {
                let message;
                if (error instanceof files_1.TooLargeFileOperationError) {
                    message = (0, nls_1.localize)('fileTooLargeForHeapErrorWithSize', "At least one file is not displayed in the text compare editor because it is very large ({0}).", files_1.ByteSize.formatSize(error.size));
                }
                else {
                    message = (0, nls_1.localize)('fileTooLargeForHeapErrorWithoutSize', "At least one file is not displayed in the text compare editor because it is very large.");
                }
                throw (0, editor_1.createTooLargeFileError)(this.group, input, options, message, this.preferencesService);
            }
            // Otherwise make sure the error bubbles up
            throw error;
        }
        restoreTextDiffEditorViewState(editor, options, context, control) {
            const editorViewState = this.loadEditorViewState(editor, context);
            if (editorViewState) {
                if (options?.selection && editorViewState.modified) {
                    editorViewState.modified.cursorState = []; // prevent duplicate selections via options
                }
                control.restoreViewState(editorViewState);
                return true;
            }
            return false;
        }
        openAsBinary(input, options) {
            const original = input.original;
            const modified = input.modified;
            const binaryDiffInput = this.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, input.getName(), input.getDescription(), original, modified, true);
            // Forward binary flag to input if supported
            const fileEditorFactory = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).getFileEditorFactory();
            if (fileEditorFactory.isFileEditor(original)) {
                original.setForceOpenAsBinary();
            }
            if (fileEditorFactory.isFileEditor(modified)) {
                modified.setForceOpenAsBinary();
            }
            // Replace this editor with the binary one
            (this.group ?? this.editorGroupService.activeGroup).replaceEditors([{
                    editor: input,
                    replacement: binaryDiffInput,
                    options: {
                        ...options,
                        // Make sure to not steal away the currently active group
                        // because we are triggering another openEditor() call
                        // and do not control the initial intent that resulted
                        // in us now opening as binary.
                        activation: editor_2.EditorActivation.PRESERVE,
                        pinned: this.group?.isPinned(input),
                        sticky: this.group?.isSticky(input)
                    }
                }]);
        }
        setOptions(options) {
            super.setOptions(options);
            if (options) {
                (0, editorOptions_1.applyTextEditorOptions)(options, (0, types_1.assertIsDefined)(this.diffEditorControl), 0 /* ScrollType.Smooth */);
            }
        }
        shouldHandleConfigurationChangeEvent(e, resource) {
            if (super.shouldHandleConfigurationChangeEvent(e, resource)) {
                return true;
            }
            return e.affectsConfiguration(resource, 'diffEditor') || e.affectsConfiguration(resource, 'accessibility.verbosity.diffEditor');
        }
        computeConfiguration(configuration) {
            const editorConfiguration = super.computeConfiguration(configuration);
            // Handle diff editor specially by merging in diffEditor configuration
            if ((0, types_1.isObject)(configuration.diffEditor)) {
                const diffEditorConfiguration = (0, objects_1.deepClone)(configuration.diffEditor);
                // User settings defines `diffEditor.codeLens`, but here we rename that to `diffEditor.diffCodeLens` to avoid collisions with `editor.codeLens`.
                diffEditorConfiguration.diffCodeLens = diffEditorConfiguration.codeLens;
                delete diffEditorConfiguration.codeLens;
                // User settings defines `diffEditor.wordWrap`, but here we rename that to `diffEditor.diffWordWrap` to avoid collisions with `editor.wordWrap`.
                diffEditorConfiguration.diffWordWrap = diffEditorConfiguration.wordWrap;
                delete diffEditorConfiguration.wordWrap;
                Object.assign(editorConfiguration, diffEditorConfiguration);
            }
            const verbose = configuration.accessibility?.verbosity?.diffEditor ?? false;
            editorConfiguration.accessibilityVerbose = verbose;
            return editorConfiguration;
        }
        getConfigurationOverrides(configuration) {
            return {
                ...super.getConfigurationOverrides(configuration),
                ...this.getReadonlyConfiguration(this.input?.isReadonly()),
                originalEditable: this.input instanceof diffEditorInput_1.DiffEditorInput && !this.input.original.isReadonly(),
                lineDecorationsWidth: '2ch'
            };
        }
        updateReadonly(input) {
            if (input instanceof diffEditorInput_1.DiffEditorInput) {
                this.diffEditorControl?.updateOptions({
                    ...this.getReadonlyConfiguration(input.isReadonly()),
                    originalEditable: !input.original.isReadonly(),
                });
            }
            else {
                super.updateReadonly(input);
            }
        }
        isFileBinaryError(error) {
            if (Array.isArray(error)) {
                const errors = error;
                return errors.some(error => this.isFileBinaryError(error));
            }
            return error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */;
        }
        clearInput() {
            if (this._previousViewModel) {
                this._previousViewModel.dispose();
                this._previousViewModel = null;
            }
            super.clearInput();
            // Log input lifecycle telemetry
            const inputLifecycleElapsed = this.inputLifecycleStopWatch?.elapsed();
            this.inputLifecycleStopWatch = undefined;
            if (typeof inputLifecycleElapsed === 'number') {
                this.logInputLifecycleTelemetry(inputLifecycleElapsed, this.getControl()?.getModel()?.modified?.getLanguageId());
            }
            // Clear Model
            this.diffEditorControl?.setModel(null);
        }
        logInputLifecycleTelemetry(duration, languageId) {
            let collapseUnchangedRegions = false;
            if (this.diffEditorControl instanceof diffEditorWidget_1.DiffEditorWidget) {
                collapseUnchangedRegions = this.diffEditorControl.collapseUnchangedRegions;
            }
            this.telemetryService.publicLog2('diffEditor.editorVisibleTime', {
                editorVisibleTimeMs: duration,
                languageId: languageId ?? '',
                collapseUnchangedRegions,
            });
        }
        getControl() {
            return this.diffEditorControl;
        }
        focus() {
            super.focus();
            this.diffEditorControl?.focus();
        }
        hasFocus() {
            return this.diffEditorControl?.hasTextFocus() || super.hasFocus();
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (visible) {
                this.diffEditorControl?.onVisible();
            }
            else {
                this.diffEditorControl?.onHide();
            }
        }
        layout(dimension) {
            this.diffEditorControl?.layout(dimension);
        }
        setBoundarySashes(sashes) {
            this.diffEditorControl?.setBoundarySashes(sashes);
        }
        tracksEditorViewState(input) {
            return input instanceof diffEditorInput_1.DiffEditorInput;
        }
        computeEditorViewState(resource) {
            if (!this.diffEditorControl) {
                return undefined;
            }
            const model = this.diffEditorControl.getModel();
            if (!model || !model.modified || !model.original) {
                return undefined; // view state always needs a model
            }
            const modelUri = this.toEditorViewStateResource(model);
            if (!modelUri) {
                return undefined; // model URI is needed to make sure we save the view state correctly
            }
            if (!(0, resources_1.isEqual)(modelUri, resource)) {
                return undefined; // prevent saving view state for a model that is not the expected one
            }
            return this.diffEditorControl.saveViewState() ?? undefined;
        }
        toEditorViewStateResource(modelOrInput) {
            let original;
            let modified;
            if (modelOrInput instanceof diffEditorInput_1.DiffEditorInput) {
                original = modelOrInput.original.resource;
                modified = modelOrInput.modified.resource;
            }
            else if (!(0, editor_1.isEditorInput)(modelOrInput)) {
                original = modelOrInput.original.uri;
                modified = modelOrInput.modified.uri;
            }
            if (!original || !modified) {
                return undefined;
            }
            // create a URI that is the Base64 concatenation of original + modified resource
            return uri_1.URI.from({ scheme: 'diff', path: `${(0, dom_1.multibyteAwareBtoa)(original.toString())}${(0, dom_1.multibyteAwareBtoa)(modified.toString())}` });
        }
    };
    exports.TextDiffEditor = TextDiffEditor;
    exports.TextDiffEditor = TextDiffEditor = TextDiffEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, storage_1.IStorageService),
        __param(3, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(4, editorService_1.IEditorService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, files_1.IFileService),
        __param(8, preferences_1.IPreferencesService)
    ], TextDiffEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dERpZmZFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2VkaXRvci90ZXh0RGlmZkVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUNoRzs7T0FFRztJQUNJLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSwrQkFBd0M7O2lCQUMzRCxPQUFFLEdBQUcsNEJBQW1CLEFBQXRCLENBQXVCO1FBTXpDLElBQWEsdUJBQXVCO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDN0IsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUVELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2xFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRWxFLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUM1SSxDQUFDO1FBRUQsWUFDb0IsZ0JBQW1DLEVBQy9CLG9CQUEyQyxFQUNqRCxjQUErQixFQUNiLG9CQUF1RCxFQUMxRSxhQUE2QixFQUM5QixZQUEyQixFQUNwQixrQkFBd0MsRUFDaEQsV0FBeUIsRUFDbEIsa0JBQXdEO1lBRTdFLEtBQUssQ0FBQyxnQkFBYyxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFF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
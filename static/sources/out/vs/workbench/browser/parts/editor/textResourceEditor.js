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
define(["require", "exports", "vs/base/common/types", "vs/workbench/common/editor", "vs/workbench/common/editor/editorOptions", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/common/editor/textEditorModel", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/browser/parts/editor/textCodeEditor", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/languages/modesRegistry", "vs/platform/files/common/files"], function (require, exports, types_1, editor_1, editorOptions_1, textResourceEditorInput_1, textEditorModel_1, untitledTextEditorInput_1, textCodeEditor_1, telemetry_1, storage_1, textResourceConfiguration_1, instantiation_1, themeService_1, editorGroupsService_1, editorService_1, model_1, language_1, modesRegistry_1, files_1) {
    "use strict";
    var TextResourceEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextResourceEditor = exports.AbstractTextResourceEditor = void 0;
    /**
     * An editor implementation that is capable of showing the contents of resource inputs. Uses
     * the TextEditor widget to show the contents.
     */
    let AbstractTextResourceEditor = class AbstractTextResourceEditor extends textCodeEditor_1.AbstractTextCodeEditor {
        constructor(id, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService) {
            super(id, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
        }
        async setInput(input, options, context, token) {
            // Set input and resolve
            await super.setInput(input, options, context, token);
            const resolvedModel = await input.resolve(options);
            // Check for cancellation
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Assert Model instance
            if (!(resolvedModel instanceof textEditorModel_1.BaseTextEditorModel)) {
                throw new Error('Unable to open file as text');
            }
            // Set Editor Model
            const control = (0, types_1.assertIsDefined)(this.editorControl);
            const textEditorModel = resolvedModel.textEditorModel;
            control.setModel(textEditorModel);
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
            control.updateOptions(this.getReadonlyConfiguration(resolvedModel.isReadonly()));
        }
        /**
         * Reveals the last line of this editor if it has a model set.
         */
        revealLastLine() {
            const control = this.editorControl;
            if (!control) {
                return;
            }
            const model = control.getModel();
            if (model) {
                const lastLine = model.getLineCount();
                control.revealPosition({ lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) }, 0 /* ScrollType.Smooth */);
            }
        }
        clearInput() {
            super.clearInput();
            // Clear Model
            this.editorControl?.setModel(null);
        }
        tracksEditorViewState(input) {
            // editor view state persistence is only enabled for untitled and resource inputs
            return input instanceof untitledTextEditorInput_1.UntitledTextEditorInput || input instanceof textResourceEditorInput_1.TextResourceEditorInput;
        }
    };
    exports.AbstractTextResourceEditor = AbstractTextResourceEditor;
    exports.AbstractTextResourceEditor = AbstractTextResourceEditor = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, editorService_1.IEditorService),
        __param(8, files_1.IFileService)
    ], AbstractTextResourceEditor);
    let TextResourceEditor = class TextResourceEditor extends AbstractTextResourceEditor {
        static { TextResourceEditor_1 = this; }
        static { this.ID = 'workbench.editors.textResourceEditor'; }
        constructor(telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, modelService, languageService, fileService) {
            super(TextResourceEditor_1.ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
            this.modelService = modelService;
            this.languageService = languageService;
        }
        createEditorControl(parent, configuration) {
            super.createEditorControl(parent, configuration);
            // Install a listener for paste to update this editors
            // language if the paste includes a specific language
            const control = this.editorControl;
            if (control) {
                this._register(control.onDidPaste(e => this.onDidEditorPaste(e, control)));
            }
        }
        onDidEditorPaste(e, codeEditor) {
            if (this.input instanceof untitledTextEditorInput_1.UntitledTextEditorInput && this.input.hasLanguageSetExplicitly) {
                return; // do not override language if it was set explicitly
            }
            if (e.range.startLineNumber !== 1 || e.range.startColumn !== 1) {
                return; // document had existing content before the pasted text, don't override.
            }
            if (codeEditor.getOption(90 /* EditorOption.readOnly */)) {
                return; // not for readonly editors
            }
            const textModel = codeEditor.getModel();
            if (!textModel) {
                return; // require a live model
            }
            const pasteIsWholeContents = textModel.getLineCount() === e.range.endLineNumber && textModel.getLineMaxColumn(e.range.endLineNumber) === e.range.endColumn;
            if (!pasteIsWholeContents) {
                return; // document had existing content after the pasted text, don't override.
            }
            const currentLanguageId = textModel.getLanguageId();
            if (currentLanguageId !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
                return; // require current languageId to be unspecific
            }
            let candidateLanguage = undefined;
            // A languageId is provided via the paste event so text was copied using
            // VSCode. As such we trust this languageId and use it if specific
            if (e.languageId) {
                candidateLanguage = { id: e.languageId, source: 'event' };
            }
            // A languageId was not provided, so the data comes from outside VSCode
            // We can still try to guess a good languageId from the first line if
            // the paste changed the first line
            else {
                const guess = this.languageService.guessLanguageIdByFilepathOrFirstLine(textModel.uri, textModel.getLineContent(1).substr(0, 1000 /* ModelConstants.FIRST_LINE_DETECTION_LENGTH_LIMIT */)) ?? undefined;
                if (guess) {
                    candidateLanguage = { id: guess, source: 'guess' };
                }
            }
            // Finally apply languageId to model if specified
            if (candidateLanguage && candidateLanguage.id !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
                if (this.input instanceof untitledTextEditorInput_1.UntitledTextEditorInput && candidateLanguage.source === 'event') {
                    // High confidence, set language id at TextEditorModel level to block future auto-detection
                    this.input.setLanguageId(candidateLanguage.id);
                }
                else {
                    textModel.setLanguage(this.languageService.createById(candidateLanguage.id));
                }
                const opts = this.modelService.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
                textModel.detectIndentation(opts.insertSpaces, opts.tabSize);
            }
        }
    };
    exports.TextResourceEditor = TextResourceEditor;
    exports.TextResourceEditor = TextResourceEditor = TextResourceEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, storage_1.IStorageService),
        __param(3, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(4, themeService_1.IThemeService),
        __param(5, editorService_1.IEditorService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, model_1.IModelService),
        __param(8, language_1.ILanguageService),
        __param(9, files_1.IFileService)
    ], TextResourceEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFJlc291cmNlRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvdGV4dFJlc291cmNlRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0QmhHOzs7T0FHRztJQUNJLElBQWUsMEJBQTBCLEdBQXpDLE1BQWUsMEJBQTJCLFNBQVEsdUNBQTRDO1FBRXBHLFlBQ0MsRUFBVSxFQUNTLGdCQUFtQyxFQUMvQixvQkFBMkMsRUFDakQsY0FBK0IsRUFDYixnQ0FBbUUsRUFDdkYsWUFBMkIsRUFDcEIsa0JBQXdDLEVBQzlDLGFBQTZCLEVBQy9CLFdBQXlCO1lBRXZDLEtBQUssQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsY0FBYyxFQUFFLGdDQUFnQyxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbkssQ0FBQztRQUVRLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBc0MsRUFBRSxPQUF1QyxFQUFFLE9BQTJCLEVBQUUsS0FBd0I7WUFFN0osd0JBQXdCO1lBQ3hCLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRCxNQUFNLGFBQWEsR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbkQseUJBQXlCO1lBQ3pCLElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25DLE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7WUFFRCx3QkFBd0I7WUFDeEIsSUFBSSxDQUFDLENBQUMsYUFBYSxZQUFZLHFDQUFtQixDQUFDLEVBQUUsQ0FBQztnQkFDckQsTUFB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
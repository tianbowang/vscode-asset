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
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/base/common/event", "vs/base/common/types", "vs/base/common/lifecycle", "vs/workbench/browser/editor", "vs/workbench/browser/parts/editor/editorWithViewState", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files"], function (require, exports, nls_1, objects_1, event_1, types_1, lifecycle_1, editor_1, editorWithViewState_1, storage_1, instantiation_1, telemetry_1, themeService_1, textResourceConfiguration_1, editorGroupsService_1, editorService_1, files_1) {
    "use strict";
    var AbstractTextEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextEditorPaneSelection = exports.AbstractTextEditor = void 0;
    /**
     * The base class of editors that leverage any kind of text editor for the editing experience.
     */
    let AbstractTextEditor = class AbstractTextEditor extends editorWithViewState_1.AbstractEditorWithViewState {
        static { AbstractTextEditor_1 = this; }
        static { this.VIEW_STATE_PREFERENCE_KEY = 'textEditorViewState'; }
        constructor(id, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService) {
            super(id, AbstractTextEditor_1.VIEW_STATE_PREFERENCE_KEY, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
            this.fileService = fileService;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this.inputListener = this._register(new lifecycle_1.MutableDisposable());
            // Listen to configuration changes
            this._register(this.textResourceConfigurationService.onDidChangeConfiguration(e => this.handleConfigurationChangeEvent(e)));
            // ARIA: if a group is added or removed, update the editor's ARIA
            // label so that it appears in the label for when there are > 1 groups
            this._register(event_1.Event.any(this.editorGroupService.onDidAddGroup, this.editorGroupService.onDidRemoveGroup)(() => {
                const ariaLabel = this.computeAriaLabel();
                this.editorContainer?.setAttribute('aria-label', ariaLabel);
                this.updateEditorControlOptions({ ariaLabel });
            }));
            // Listen to file system provider changes
            this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onDidChangeFileSystemProvider(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onDidChangeFileSystemProvider(e.scheme)));
        }
        handleConfigurationChangeEvent(e) {
            const resource = this.getActiveResource();
            if (!this.shouldHandleConfigurationChangeEvent(e, resource)) {
                return;
            }
            if (this.isVisible()) {
                this.updateEditorConfiguration(resource);
            }
            else {
                this.hasPendingConfigurationChange = true;
            }
        }
        shouldHandleConfigurationChangeEvent(e, resource) {
            return e.affectsConfiguration(resource, 'editor') || e.affectsConfiguration(resource, 'problems.visibility');
        }
        consumePendingConfigurationChangeEvent() {
            if (this.hasPendingConfigurationChange) {
                this.updateEditorConfiguration();
                this.hasPendingConfigurationChange = false;
            }
        }
        computeConfiguration(configuration) {
            // Specific editor options always overwrite user configuration
            const editorConfiguration = (0, types_1.isObject)(configuration.editor) ? (0, objects_1.deepClone)(configuration.editor) : Object.create(null);
            Object.assign(editorConfiguration, this.getConfigurationOverrides(configuration));
            // ARIA label
            editorConfiguration.ariaLabel = this.computeAriaLabel();
            return editorConfiguration;
        }
        computeAriaLabel() {
            return this._input ? (0, editor_1.computeEditorAriaLabel)(this._input, undefined, this.group, this.editorGroupService.count) : (0, nls_1.localize)('editor', "Editor");
        }
        onDidChangeFileSystemProvider(scheme) {
            if (!this.input) {
                return;
            }
            if (this.getActiveResource()?.scheme === scheme) {
                this.updateReadonly(this.input);
            }
        }
        onDidChangeInputCapabilities(input) {
            if (this.input === input) {
                this.updateReadonly(input);
            }
        }
        updateReadonly(input) {
            this.updateEditorControlOptions({ ...this.getReadonlyConfiguration(input.isReadonly()) });
        }
        getReadonlyConfiguration(isReadonly) {
            return {
                readOnly: !!isReadonly,
                readOnlyMessage: typeof isReadonly !== 'boolean' ? isReadonly : undefined
            };
        }
        getConfigurationOverrides(configuration) {
            return {
                overviewRulerLanes: 3,
                lineNumbersMinChars: 3,
                fixedOverflowWidgets: true,
                ...this.getReadonlyConfiguration(this.input?.isReadonly()),
                renderValidationDecorations: configuration.problems?.visibility !== false ? 'on' : 'off'
            };
        }
        createEditor(parent) {
            // Create editor control
            this.editorContainer = parent;
            this.createEditorControl(parent, this.computeConfiguration(this.textResourceConfigurationService.getValue(this.getActiveResource())));
            // Listeners
            this.registerCodeEditorListeners();
        }
        registerCodeEditorListeners() {
            const mainControl = this.getMainControl();
            if (mainControl) {
                this._register(mainControl.onDidChangeModelLanguage(() => this.updateEditorConfiguration()));
                this._register(mainControl.onDidChangeModel(() => this.updateEditorConfiguration()));
                this._register(mainControl.onDidChangeCursorPosition(e => this._onDidChangeSelection.fire({ reason: this.toEditorPaneSelectionChangeReason(e) })));
                this._register(mainControl.onDidChangeModelContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
            }
        }
        toEditorPaneSelectionChangeReason(e) {
            switch (e.source) {
                case "api" /* TextEditorSelectionSource.PROGRAMMATIC */: return 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */;
                case "code.navigation" /* TextEditorSelectionSource.NAVIGATION */: return 4 /* EditorPaneSelectionChangeReason.NAVIGATION */;
                case "code.jump" /* TextEditorSelectionSource.JUMP */: return 5 /* EditorPaneSelectionChangeReason.JUMP */;
                default: return 2 /* EditorPaneSelectionChangeReason.USER */;
            }
        }
        getSelection() {
            const mainControl = this.getMainControl();
            if (mainControl) {
                const selection = mainControl.getSelection();
                if (selection) {
                    return new TextEditorPaneSelection(selection);
                }
            }
            return undefined;
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            // Update our listener for input capabilities
            this.inputListener.value = input.onDidChangeCapabilities(() => this.onDidChangeInputCapabilities(input));
            // Update editor options after having set the input. We do this because there can be
            // editor input specific options (e.g. an ARIA label depending on the input showing)
            this.updateEditorConfiguration();
            // Update aria label on editor
            const editorContainer = (0, types_1.assertIsDefined)(this.editorContainer);
            editorContainer.setAttribute('aria-label', this.computeAriaLabel());
        }
        clearInput() {
            // Clear input listener
            this.inputListener.clear();
            super.clearInput();
        }
        setEditorVisible(visible, group) {
            if (visible) {
                this.consumePendingConfigurationChangeEvent();
            }
            super.setEditorVisible(visible, group);
        }
        toEditorViewStateResource(input) {
            return input.resource;
        }
        updateEditorConfiguration(resource = this.getActiveResource()) {
            let configuration = undefined;
            if (resource) {
                configuration = this.textResourceConfigurationService.getValue(resource);
            }
            if (!configuration) {
                return;
            }
            const editorConfiguration = this.computeConfiguration(configuration);
            // Try to figure out the actual editor options that changed from the last time we updated the editor.
            // We do this so that we are not overwriting some dynamic editor settings (e.g. word wrap) that might
            // have been applied to the editor directly.
            let editorSettingsToApply = editorConfiguration;
            if (this.lastAppliedEditorOptions) {
                editorSettingsToApply = (0, objects_1.distinct)(this.lastAppliedEditorOptions, editorSettingsToApply);
            }
            if (Object.keys(editorSettingsToApply).length > 0) {
                this.lastAppliedEditorOptions = editorConfiguration;
                this.updateEditorControlOptions(editorSettingsToApply);
            }
        }
        getActiveResource() {
            const mainControl = this.getMainControl();
            if (mainControl) {
                const model = mainControl.getModel();
                if (model) {
                    return model.uri;
                }
            }
            if (this.input) {
                return this.input.resource;
            }
            return undefined;
        }
        dispose() {
            this.lastAppliedEditorOptions = undefined;
            super.dispose();
        }
    };
    exports.AbstractTextEditor = AbstractTextEditor;
    exports.AbstractTextEditor = AbstractTextEditor = AbstractTextEditor_1 = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorService_1.IEditorService),
        __param(7, editorGroupsService_1.IEditorGroupsService),
        __param(8, files_1.IFileService)
    ], AbstractTextEditor);
    class TextEditorPaneSelection {
        static { this.TEXT_EDITOR_SELECTION_THRESHOLD = 10; } // number of lines to move in editor to justify for significant change
        constructor(textSelection) {
            this.textSelection = textSelection;
        }
        compare(other) {
            if (!(other instanceof TextEditorPaneSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            const thisLineNumber = Math.min(this.textSelection.selectionStartLineNumber, this.textSelection.positionLineNumber);
            const otherLineNumber = Math.min(other.textSelection.selectionStartLineNumber, other.textSelection.positionLineNumber);
            if (thisLineNumber === otherLineNumber) {
                return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
            }
            if (Math.abs(thisLineNumber - otherLineNumber) < TextEditorPaneSelection.TEXT_EDITOR_SELECTION_THRESHOLD) {
                return 2 /* EditorPaneSelectionCompareResult.SIMILAR */; // when in close proximity, treat selection as being similar
            }
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        restore(options) {
            const textEditorOptions = {
                ...options,
                selection: this.textSelection,
                selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */
            };
            return textEditorOptions;
        }
        log() {
            return `line: ${this.textSelection.startLineNumber}-${this.textSelection.endLineNumber}, col:  ${this.textSelection.startColumn}-${this.textSelection.endColumn}`;
        }
    }
    exports.TextEditorPaneSelection = TextEditorPaneSelection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL3RleHRFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBDaEc7O09BRUc7SUFDSSxJQUFlLGtCQUFrQixHQUFqQyxNQUFlLGtCQUErQyxTQUFRLGlEQUE4Qjs7aUJBRWxGLDhCQUF5QixHQUFHLHFCQUFxQixBQUF4QixDQUF5QjtRQVkxRSxZQUNDLEVBQVUsRUFDUyxnQkFBbUMsRUFDL0Isb0JBQTJDLEVBQ2pELGNBQStCLEVBQ2IsZ0NBQW1FLEVBQ3ZGLFlBQTJCLEVBQzFCLGFBQTZCLEVBQ3ZCLGtCQUF3QyxFQUNoRCxXQUE0QztZQUUxRCxLQUFLLENBQUMsRUFBRSxFQUFFLG9CQUFrQixDQUFDLHlCQUF5QixFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxnQ0FBZ0MsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFGbEssZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFuQnhDLDBCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQW1DLENBQUMsQ0FBQztZQUNqRyx5QkFBb0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDO1lBT2hELGtCQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztZQWV4RSxrQ0FBa0M7WUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lB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
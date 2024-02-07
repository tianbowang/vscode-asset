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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/services/textfile/common/textfiles", "vs/platform/label/common/label", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/editor/common/services/resolverService", "vs/base/common/lifecycle", "vs/editor/common/services/textResourceConfiguration"], function (require, exports, editor_1, textResourceEditorInput_1, textfiles_1, label_1, editorService_1, files_1, resources_1, environmentService_1, pathService_1, filesConfigurationService_1, resolverService_1, lifecycle_1, textResourceConfiguration_1) {
    "use strict";
    var UntitledTextEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UntitledTextEditorInput = void 0;
    /**
     * An editor input to be used for untitled text buffers.
     */
    let UntitledTextEditorInput = class UntitledTextEditorInput extends textResourceEditorInput_1.AbstractTextResourceEditorInput {
        static { UntitledTextEditorInput_1 = this; }
        static { this.ID = 'workbench.editors.untitledEditorInput'; }
        get typeId() {
            return UntitledTextEditorInput_1.ID;
        }
        get editorId() {
            return editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
        }
        constructor(model, textFileService, labelService, editorService, fileService, environmentService, pathService, filesConfigurationService, textModelService, textResourceConfigurationService) {
            super(model.resource, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService);
            this.model = model;
            this.environmentService = environmentService;
            this.pathService = pathService;
            this.textModelService = textModelService;
            this.modelResolve = undefined;
            this.modelDisposables = this._register(new lifecycle_1.DisposableStore());
            this.cachedUntitledTextEditorModelReference = undefined;
            this.registerModelListeners(model);
            this._register(this.textFileService.untitled.onDidCreate(model => this.onDidCreateUntitledModel(model)));
        }
        registerModelListeners(model) {
            this.modelDisposables.clear();
            // re-emit some events from the model
            this.modelDisposables.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            this.modelDisposables.add(model.onDidChangeName(() => this._onDidChangeLabel.fire()));
            // a reverted untitled text editor model renders this input disposed
            this.modelDisposables.add(model.onDidRevert(() => this.dispose()));
        }
        onDidCreateUntitledModel(model) {
            if ((0, resources_1.isEqual)(model.resource, this.model.resource) && model !== this.model) {
                // Ensure that we keep our model up to date with
                // the actual model from the service so that we
                // never get out of sync with the truth.
                this.model = model;
                this.registerModelListeners(model);
            }
        }
        getName() {
            return this.model.name;
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            // Without associated path: only use if name and description differ
            if (!this.model.hasAssociatedFilePath) {
                const descriptionCandidate = this.resource.path;
                if (descriptionCandidate !== this.getName()) {
                    return descriptionCandidate;
                }
                return undefined;
            }
            // With associated path: delegate to parent
            return super.getDescription(verbosity);
        }
        getTitle(verbosity) {
            // Without associated path: check if name and description differ to decide
            // if description should appear besides the name to distinguish better
            if (!this.model.hasAssociatedFilePath) {
                const name = this.getName();
                const description = this.getDescription();
                if (description && description !== name) {
                    return `${name} • ${description}`;
                }
                return name;
            }
            // With associated path: delegate to parent
            return super.getTitle(verbosity);
        }
        isDirty() {
            return this.model.isDirty();
        }
        getEncoding() {
            return this.model.getEncoding();
        }
        setEncoding(encoding, mode /* ignored, we only have Encode */) {
            return this.model.setEncoding(encoding);
        }
        get hasLanguageSetExplicitly() { return this.model.hasLanguageSetExplicitly; }
        get hasAssociatedFilePath() { return this.model.hasAssociatedFilePath; }
        setLanguageId(languageId, source) {
            this.model.setLanguageId(languageId, source);
        }
        getLanguageId() {
            return this.model.getLanguageId();
        }
        async resolve() {
            if (!this.modelResolve) {
                this.modelResolve = (async () => {
                    // Acquire a model reference
                    this.cachedUntitledTextEditorModelReference = await this.textModelService.createModelReference(this.resource);
                })();
            }
            await this.modelResolve;
            // It is possible that this input was disposed before the model
            // finished resolving. As such, we need to make sure to dispose
            // the model reference to not leak it.
            if (this.isDisposed()) {
                this.disposeModelReference();
            }
            return this.model;
        }
        toUntyped(options) {
            const untypedInput = {
                resource: this.model.hasAssociatedFilePath ? (0, resources_1.toLocalResource)(this.model.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme) : this.resource,
                forceUntitled: true,
                options: {
                    override: this.editorId
                }
            };
            if (typeof options?.preserveViewState === 'number') {
                untypedInput.encoding = this.getEncoding();
                untypedInput.languageId = this.getLanguageId();
                untypedInput.contents = this.model.isModified() ? this.model.textEditorModel?.getValue() : undefined;
                untypedInput.options.viewState = (0, editor_1.findViewStateForEditor)(this, options.preserveViewState, this.editorService);
                if (typeof untypedInput.contents === 'string' && !this.model.hasAssociatedFilePath) {
                    // Given how generic untitled resources in the system are, we
                    // need to be careful not to set our resource into the untyped
                    // editor if we want to transport contents too, because of
                    // issue https://github.com/microsoft/vscode/issues/140898
                    // The workaround is to simply remove the resource association
                    // if we have contents and no associated resource.
                    // In that case we can ensure that a new untitled resource is
                    // being created and the contents can be restored properly.
                    untypedInput.resource = undefined;
                }
            }
            return untypedInput;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof UntitledTextEditorInput_1) {
                return (0, resources_1.isEqual)(otherInput.resource, this.resource);
            }
            if ((0, editor_1.isUntitledResourceEditorInput)(otherInput)) {
                return super.matches(otherInput);
            }
            return false;
        }
        dispose() {
            // Model
            this.modelResolve = undefined;
            // Model reference
            this.disposeModelReference();
            super.dispose();
        }
        disposeModelReference() {
            (0, lifecycle_1.dispose)(this.cachedUntitledTextEditorModelReference);
            this.cachedUntitledTextEditorModelReference = undefined;
        }
    };
    exports.UntitledTextEditorInput = UntitledTextEditorInput;
    exports.UntitledTextEditorInput = UntitledTextEditorInput = UntitledTextEditorInput_1 = __decorate([
        __param(1, textfiles_1.ITextFileService),
        __param(2, label_1.ILabelService),
        __param(3, editorService_1.IEditorService),
        __param(4, files_1.IFileService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, pathService_1.IPathService),
        __param(7, filesConfigurationService_1.IFilesConfigurationService),
        __param(8, resolverService_1.ITextModelService),
        __param(9, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], UntitledTextEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aXRsZWRUZXh0RWRpdG9ySW5wdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91bnRpdGxlZC9jb21tb24vdW50aXRsZWRUZXh0RWRpdG9ySW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW9CaEc7O09BRUc7SUFDSSxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHlEQUErQjs7aUJBRTNELE9BQUUsR0FBVyx1Q0FBdUMsQUFBbEQsQ0FBbUQ7UUFFckUsSUFBYSxNQUFNO1lBQ2xCLE9BQU8seUJBQXVCLENBQUMsRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFRCxJQUFhLFFBQVE7WUFDcEIsT0FBTyxtQ0FBMEIsQ0FBQyxFQUFFLENBQUM7UUFDdEMsQ0FBQztRQU1ELFlBQ1csS0FBK0IsRUFDdkIsZUFBaUMsRUFDcEMsWUFBMkIsRUFDMUIsYUFBNkIsRUFDL0IsV0FBeUIsRUFDVCxrQkFBaUUsRUFDakYsV0FBMEMsRUFDNUIseUJBQXFELEVBQzlELGdCQUFvRCxFQUNwQyxnQ0FBbUU7WUFFdEcsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSx5QkFBeUIsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBWC9JLFVBQUssR0FBTCxLQUFLLENBQTBCO1lBS00sdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE4QjtZQUNoRSxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUVwQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBYmhFLGlCQUFZLEdBQThCLFNBQVMsQ0FBQztZQUMzQyxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENB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
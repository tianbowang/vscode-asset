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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/common/editor/resourceEditorInput", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/base/common/network", "vs/base/common/resources", "vs/editor/common/services/resolverService", "vs/workbench/common/editor/textResourceEditorModel", "vs/editor/common/model/textModel", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/editor/common/services/textResourceConfiguration"], function (require, exports, editor_1, resourceEditorInput_1, textfiles_1, editorService_1, files_1, label_1, network_1, resources_1, resolverService_1, textResourceEditorModel_1, textModel_1, filesConfigurationService_1, textResourceConfiguration_1) {
    "use strict";
    var TextResourceEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextResourceEditorInput = exports.AbstractTextResourceEditorInput = void 0;
    /**
     * The base class for all editor inputs that open in text editors.
     */
    let AbstractTextResourceEditorInput = class AbstractTextResourceEditorInput extends resourceEditorInput_1.AbstractResourceEditorInput {
        constructor(resource, preferredResource, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService) {
            super(resource, preferredResource, labelService, fileService, filesConfigurationService, textResourceConfigurationService);
            this.editorService = editorService;
            this.textFileService = textFileService;
        }
        save(group, options) {
            // If this is neither an `untitled` resource, nor a resource
            // we can handle with the file service, we can only "Save As..."
            if (this.resource.scheme !== network_1.Schemas.untitled && !this.fileService.hasProvider(this.resource)) {
                return this.saveAs(group, options);
            }
            // Normal save
            return this.doSave(options, false, group);
        }
        saveAs(group, options) {
            return this.doSave(options, true, group);
        }
        async doSave(options, saveAs, group) {
            // Save / Save As
            let target;
            if (saveAs) {
                target = await this.textFileService.saveAs(this.resource, undefined, { ...options, suggestedTarget: this.preferredResource });
            }
            else {
                target = await this.textFileService.save(this.resource, options);
            }
            if (!target) {
                return undefined; // save cancelled
            }
            return { resource: target };
        }
        async revert(group, options) {
            await this.textFileService.revert(this.resource, options);
        }
    };
    exports.AbstractTextResourceEditorInput = AbstractTextResourceEditorInput;
    exports.AbstractTextResourceEditorInput = AbstractTextResourceEditorInput = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, label_1.ILabelService),
        __param(5, files_1.IFileService),
        __param(6, filesConfigurationService_1.IFilesConfigurationService),
        __param(7, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], AbstractTextResourceEditorInput);
    /**
     * A read-only text editor input whos contents are made of the provided resource that points to an existing
     * code editor model.
     */
    let TextResourceEditorInput = class TextResourceEditorInput extends AbstractTextResourceEditorInput {
        static { TextResourceEditorInput_1 = this; }
        static { this.ID = 'workbench.editors.resourceEditorInput'; }
        get typeId() {
            return TextResourceEditorInput_1.ID;
        }
        get editorId() {
            return editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
        }
        constructor(resource, name, description, preferredLanguageId, preferredContents, textModelService, textFileService, editorService, fileService, labelService, filesConfigurationService, textResourceConfigurationService) {
            super(resource, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService);
            this.name = name;
            this.description = description;
            this.preferredLanguageId = preferredLanguageId;
            this.preferredContents = preferredContents;
            this.textModelService = textModelService;
            this.cachedModel = undefined;
            this.modelReference = undefined;
        }
        getName() {
            return this.name || super.getName();
        }
        setName(name) {
            if (this.name !== name) {
                this.name = name;
                this._onDidChangeLabel.fire();
            }
        }
        getDescription() {
            return this.description;
        }
        setDescription(description) {
            if (this.description !== description) {
                this.description = description;
                this._onDidChangeLabel.fire();
            }
        }
        setLanguageId(languageId, source) {
            this.setPreferredLanguageId(languageId);
            this.cachedModel?.setLanguageId(languageId, source);
        }
        setPreferredLanguageId(languageId) {
            this.preferredLanguageId = languageId;
        }
        setPreferredContents(contents) {
            this.preferredContents = contents;
        }
        async resolve() {
            // Unset preferred contents and language after resolving
            // once to prevent these properties to stick. We still
            // want the user to change the language in the editor
            // and want to show updated contents (if any) in future
            // `resolve` calls.
            const preferredContents = this.preferredContents;
            const preferredLanguageId = this.preferredLanguageId;
            this.preferredContents = undefined;
            this.preferredLanguageId = undefined;
            if (!this.modelReference) {
                this.modelReference = this.textModelService.createModelReference(this.resource);
            }
            const ref = await this.modelReference;
            // Ensure the resolved model is of expected type
            const model = ref.object;
            if (!(model instanceof textResourceEditorModel_1.TextResourceEditorModel)) {
                ref.dispose();
                this.modelReference = undefined;
                throw new Error(`Unexpected model for TextResourceEditorInput: ${this.resource}`);
            }
            this.cachedModel = model;
            // Set contents and language if preferred
            if (typeof preferredContents === 'string' || typeof preferredLanguageId === 'string') {
                model.updateTextEditorModel(typeof preferredContents === 'string' ? (0, textModel_1.createTextBufferFactory)(preferredContents) : undefined, preferredLanguageId);
            }
            return model;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof TextResourceEditorInput_1) {
                return (0, resources_1.isEqual)(otherInput.resource, this.resource);
            }
            if ((0, editor_1.isResourceEditorInput)(otherInput)) {
                return super.matches(otherInput);
            }
            return false;
        }
        dispose() {
            if (this.modelReference) {
                this.modelReference.then(ref => ref.dispose());
                this.modelReference = undefined;
            }
            this.cachedModel = undefined;
            super.dispose();
        }
    };
    exports.TextResourceEditorInput = TextResourceEditorInput;
    exports.TextResourceEditorInput = TextResourceEditorInput = TextResourceEditorInput_1 = __decorate([
        __param(5, resolverService_1.ITextModelService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, editorService_1.IEditorService),
        __param(8, files_1.IFileService),
        __param(9, label_1.ILabelService),
        __param(10, filesConfigurationService_1.IFilesConfigurationService),
        __param(11, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], TextResourceEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFJlc291cmNlRWRpdG9ySW5wdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vZWRpdG9yL3RleHRSZXNvdXJjZUVkaXRvcklucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQmhHOztPQUVHO0lBQ0ksSUFBZSwrQkFBK0IsR0FBOUMsTUFBZSwrQkFBZ0MsU0FBUSxpREFBMkI7UUFFeEYsWUFDQyxRQUFhLEVBQ2IsaUJBQWtDLEVBQ0MsYUFBNkIsRUFDM0IsZUFBaUMsRUFDdkQsWUFBMkIsRUFDNUIsV0FBeUIsRUFDWCx5QkFBcUQsRUFDOUMsZ0NBQW1FO1lBRXRHLEtBQUssQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSx5QkFBeUIsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBUHhGLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUMzQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFPdkUsQ0FBQztRQUVRLElBQUksQ0FBQyxLQUFzQixFQUFFLE9BQThCO1lBRW5FLDREQUE0RDtZQUM1RCxnRUFBZ0U7WUFDaEUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUMvRixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLENBQUM7WUFFRCxjQUFjO1lBQ2QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVRLE1BQU0sQ0FBQyxLQUFzQixF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
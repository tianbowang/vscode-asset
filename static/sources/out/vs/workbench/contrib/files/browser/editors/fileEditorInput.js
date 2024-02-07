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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/common/editor/binaryEditorModel", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/editor/common/services/resolverService", "vs/workbench/contrib/files/common/files", "vs/platform/label/common/label", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/editor/common/editorService", "vs/base/common/resources", "vs/base/common/event", "vs/base/common/network", "vs/editor/common/model/textModel", "vs/workbench/services/path/common/pathService", "vs/editor/common/services/textResourceConfiguration"], function (require, exports, editor_1, textResourceEditorInput_1, binaryEditorModel_1, files_1, textfiles_1, instantiation_1, lifecycle_1, resolverService_1, files_2, label_1, filesConfigurationService_1, editorService_1, resources_1, event_1, network_1, textModel_1, pathService_1, textResourceConfiguration_1) {
    "use strict";
    var FileEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileEditorInput = void 0;
    var ForceOpenAs;
    (function (ForceOpenAs) {
        ForceOpenAs[ForceOpenAs["None"] = 0] = "None";
        ForceOpenAs[ForceOpenAs["Text"] = 1] = "Text";
        ForceOpenAs[ForceOpenAs["Binary"] = 2] = "Binary";
    })(ForceOpenAs || (ForceOpenAs = {}));
    /**
     * A file editor input is the input type for the file editor of file system resources.
     */
    let FileEditorInput = FileEditorInput_1 = class FileEditorInput extends textResourceEditorInput_1.AbstractTextResourceEditorInput {
        get typeId() {
            return files_2.FILE_EDITOR_INPUT_ID;
        }
        get editorId() {
            return editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
        }
        get capabilities() {
            let capabilities = 32 /* EditorInputCapabilities.CanSplitInGroup */;
            if (this.model) {
                if (this.model.isReadonly()) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                if (this.fileService.hasProvider(this.resource)) {
                    if (this.filesConfigurationService.isReadonly(this.resource)) {
                        capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                    }
                }
                else {
                    capabilities |= 4 /* EditorInputCapabilities.Untitled */;
                }
            }
            if (!(capabilities & 2 /* EditorInputCapabilities.Readonly */)) {
                capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
            }
            return capabilities;
        }
        constructor(resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService, textFileService, textModelService, labelService, fileService, filesConfigurationService, editorService, pathService, textResourceConfigurationService) {
            super(resource, preferredResource, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService);
            this.instantiationService = instantiationService;
            this.textModelService = textModelService;
            this.pathService = pathService;
            this.forceOpenAs = 0 /* ForceOpenAs.None */;
            this.model = undefined;
            this.cachedTextFileModelReference = undefined;
            this.modelListeners = this._register(new lifecycle_1.DisposableStore());
            this.model = this.textFileService.files.get(resource);
            if (preferredName) {
                this.setPreferredName(preferredName);
            }
            if (preferredDescription) {
                this.setPreferredDescription(preferredDescription);
            }
            if (preferredEncoding) {
                this.setPreferredEncoding(preferredEncoding);
            }
            if (preferredLanguageId) {
                this.setPreferredLanguageId(preferredLanguageId);
            }
            if (typeof preferredContents === 'string') {
                this.setPreferredContents(preferredContents);
            }
            // Attach to model that matches our resource once created
            this._register(this.textFileService.files.onDidCreate(model => this.onDidCreateTextFileModel(model)));
            // If a file model already exists, make sure to wire it in
            if (this.model) {
                this.registerModelListeners(this.model);
            }
        }
        onDidCreateTextFileModel(model) {
            // Once the text file model is created, we keep it inside
            // the input to be able to implement some methods properly
            if ((0, resources_1.isEqual)(model.resource, this.resource)) {
                this.model = model;
                this.registerModelListeners(model);
            }
        }
        registerModelListeners(model) {
            // Clear any old
            this.modelListeners.clear();
            // re-emit some events from the model
            this.modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            this.modelListeners.add(model.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
            // important: treat save errors as potential dirty change because
            // a file that is in save conflict or error will report dirty even
            // if auto save is turned on.
            this.modelListeners.add(model.onDidSaveError(() => this._onDidChangeDirty.fire()));
            // remove model association once it gets disposed
            this.modelListeners.add(event_1.Event.once(model.onWillDispose)(() => {
                this.modelListeners.clear();
                this.model = undefined;
            }));
        }
        getName() {
            return this.preferredName || super.getName();
        }
        setPreferredName(name) {
            if (!this.allowLabelOverride()) {
                return; // block for specific schemes we consider to be owning
            }
            if (this.preferredName !== name) {
                this.preferredName = name;
                this._onDidChangeLabel.fire();
            }
        }
        allowLabelOverride() {
            return this.resource.scheme !== this.pathService.defaultUriScheme &&
                this.resource.scheme !== network_1.Schemas.vscodeUserData &&
                this.resource.scheme !== network_1.Schemas.file &&
                this.resource.scheme !== network_1.Schemas.vscodeRemote;
        }
        getPreferredName() {
            return this.preferredName;
        }
        isReadonly() {
            return this.model ? this.model.isReadonly() : this.filesConfigurationService.isReadonly(this.resource);
        }
        getDescription(verbosity) {
            return this.preferredDescription || super.getDescription(verbosity);
        }
        setPreferredDescription(description) {
            if (!this.allowLabelOverride()) {
                return; // block for specific schemes we consider to be owning
            }
            if (this.preferredDescription !== description) {
                this.preferredDescription = description;
                this._onDidChangeLabel.fire();
            }
        }
        getPreferredDescription() {
            return this.preferredDescription;
        }
        getTitle(verbosity) {
            let title = super.getTitle(verbosity);
            const preferredTitle = this.getPreferredTitle();
            if (preferredTitle) {
                title = `${preferredTitle} (${title})`;
            }
            return title;
        }
        getPreferredTitle() {
            if (this.preferredName && this.preferredDescription) {
                return `${this.preferredName} ${this.preferredDescription}`;
            }
            if (this.preferredName || this.preferredDescription) {
                return this.preferredName ?? this.preferredDescription;
            }
            return undefined;
        }
        getEncoding() {
            if (this.model) {
                return this.model.getEncoding();
            }
            return this.preferredEncoding;
        }
        getPreferredEncoding() {
            return this.preferredEncoding;
        }
        async setEncoding(encoding, mode) {
            this.setPreferredEncoding(encoding);
            return this.model?.setEncoding(encoding, mode);
        }
        setPreferredEncoding(encoding) {
            this.preferredEncoding = encoding;
            // encoding is a good hint to open the file as text
            this.setForceOpenAsText();
        }
        getLanguageId() {
            if (this.model) {
                return this.model.getLanguageId();
            }
            return this.preferredLanguageId;
        }
        getPreferredLanguageId() {
            return this.preferredLanguageId;
        }
        setLanguageId(languageId, source) {
            this.setPreferredLanguageId(languageId);
            this.model?.setLanguageId(languageId, source);
        }
        setPreferredLanguageId(languageId) {
            this.preferredLanguageId = languageId;
            // languages are a good hint to open the file as text
            this.setForceOpenAsText();
        }
        setPreferredContents(contents) {
            this.preferredContents = contents;
            // contents is a good hint to open the file as text
            this.setForceOpenAsText();
        }
        setForceOpenAsText() {
            this.forceOpenAs = 1 /* ForceOpenAs.Text */;
        }
        setForceOpenAsBinary() {
            this.forceOpenAs = 2 /* ForceOpenAs.Binary */;
        }
        isDirty() {
            return !!(this.model?.isDirty());
        }
        isSaving() {
            if (this.model?.hasState(0 /* TextFileEditorModelState.SAVED */) || this.model?.hasState(3 /* TextFileEditorModelState.CONFLICT */) || this.model?.hasState(5 /* TextFileEditorModelState.ERROR */)) {
                return false; // require the model to be dirty and not in conflict or error state
            }
            // Note: currently not checking for ModelState.PENDING_SAVE for a reason
            // because we currently miss an event for this state change on editors
            // and it could result in bad UX where an editor can be closed even though
            // it shows up as dirty and has not finished saving yet.
            if (this.filesConfigurationService.hasShortAutoSaveDelay(this)) {
                return true; // a short auto save is configured, treat this as being saved
            }
            return super.isSaving();
        }
        prefersEditorPane(editorPanes) {
            if (this.forceOpenAs === 2 /* ForceOpenAs.Binary */) {
                return editorPanes.find(editorPane => editorPane.typeId === files_2.BINARY_FILE_EDITOR_ID);
            }
            return editorPanes.find(editorPane => editorPane.typeId === files_2.TEXT_FILE_EDITOR_ID);
        }
        resolve(options) {
            // Resolve as binary
            if (this.forceOpenAs === 2 /* ForceOpenAs.Binary */) {
                return this.doResolveAsBinary();
            }
            // Resolve as text
            return this.doResolveAsText(options);
        }
        async doResolveAsText(options) {
            try {
                // Unset preferred contents after having applied it once
                // to prevent this property to stick. We still want future
                // `resolve` calls to fetch the contents from disk.
                const preferredContents = this.preferredContents;
                this.preferredContents = undefined;
                // Resolve resource via text file service and only allow
                // to open binary files if we are instructed so
                await this.textFileService.files.resolve(this.resource, {
                    languageId: this.preferredLanguageId,
                    encoding: this.preferredEncoding,
                    contents: typeof preferredContents === 'string' ? (0, textModel_1.createTextBufferFactory)(preferredContents) : undefined,
                    reload: { async: true }, // trigger a reload of the model if it exists already but do not wait to show the model
                    allowBinary: this.forceOpenAs === 1 /* ForceOpenAs.Text */,
                    reason: 1 /* TextFileResolveReason.EDITOR */,
                    limits: this.ensureLimits(options)
                });
                // This is a bit ugly, because we first resolve the model and then resolve a model reference. the reason being that binary
                // or very large files do not resolve to a text file model but should be opened as binary files without text. First calling into
                // resolve() ensures we are not creating model references for these kind of resources.
                // In addition we have a bit of payload to take into account (encoding, reload) that the text resolver does not handle yet.
                if (!this.cachedTextFileModelReference) {
                    this.cachedTextFileModelReference = await this.textModelService.createModelReference(this.resource);
                }
                const model = this.cachedTextFileModelReference.object;
                // It is possible that this input was disposed before the model
                // finished resolving. As such, we need to make sure to dispose
                // the model reference to not leak it.
                if (this.isDisposed()) {
                    this.disposeModelReference();
                }
                return model;
            }
            catch (error) {
                // Handle binary files with binary model
                if (error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */) {
                    return this.doResolveAsBinary();
                }
                // Bubble any other error up
                throw error;
            }
        }
        async doResolveAsBinary() {
            const model = this.instantiationService.createInstance(binaryEditorModel_1.BinaryEditorModel, this.preferredResource, this.getName());
            await model.resolve();
            return model;
        }
        isResolved() {
            return !!this.model;
        }
        async rename(group, target) {
            return {
                editor: {
                    resource: target,
                    encoding: this.getEncoding(),
                    options: {
                        viewState: (0, editor_1.findViewStateForEditor)(this, group, this.editorService)
                    }
                }
            };
        }
        toUntyped(options) {
            const untypedInput = {
                resource: this.preferredResource,
                forceFile: true,
                options: {
                    override: this.editorId
                }
            };
            if (typeof options?.preserveViewState === 'number') {
                untypedInput.encoding = this.getEncoding();
                untypedInput.languageId = this.getLanguageId();
                untypedInput.contents = (() => {
                    const model = this.textFileService.files.get(this.resource);
                    if (model?.isDirty() && !model.textEditorModel.isTooLargeForHeapOperation()) {
                        return model.textEditorModel.getValue(); // only if dirty and not too large
                    }
                    return undefined;
                })();
                untypedInput.options = {
                    ...untypedInput.options,
                    viewState: (0, editor_1.findViewStateForEditor)(this, options.preserveViewState, this.editorService)
                };
            }
            return untypedInput;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof FileEditorInput_1) {
                return (0, resources_1.isEqual)(otherInput.resource, this.resource);
            }
            if ((0, editor_1.isResourceEditorInput)(otherInput)) {
                return super.matches(otherInput);
            }
            return false;
        }
        dispose() {
            // Model
            this.model = undefined;
            // Model reference
            this.disposeModelReference();
            super.dispose();
        }
        disposeModelReference() {
            (0, lifecycle_1.dispose)(this.cachedTextFileModelReference);
            this.cachedTextFileModelReference = undefined;
        }
    };
    exports.FileEditorInput = FileEditorInput;
    exports.FileEditorInput = FileEditorInput = FileEditorInput_1 = __decorate([
        __param(7, instantiation_1.IInstantiationService),
        __param(8, textfiles_1.ITextFileService),
        __param(9, resolverService_1.ITextModelService),
        __param(10, label_1.ILabelService),
        __param(11, files_1.IFileService),
        __param(12, filesConfigurationService_1.IFilesConfigurationService),
        __param(13, editorService_1.IEditorService),
        __param(14, pathService_1.IPathService),
        __param(15, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], FileEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUVkaXRvcklucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9icm93c2VyL2VkaXRvcnMvZmlsZUVkaXRvcklucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUF5QmhHLElBQVcsV0FJVjtJQUpELFdBQVcsV0FBVztRQUNyQiw2Q0FBSSxDQUFBO1FBQ0osNkNBQUksQ0FBQTtRQUNKLGlEQUFNLENBQUE7SUFDUCxDQUFDLEVBSlUsV0FBVyxLQUFYLFdBQVcsUUFJckI7SUFFRDs7T0FFRztJQUNJLElBQU0sZUFBZSx1QkFBckIsTUFBTSxlQUFnQixTQUFRLHlEQUErQjtRQUVuRSxJQUFhLE1BQU07WUFDbEIsT0FBTyw0QkFBb0IsQ0FBQztRQUM3QixDQUFDO1FBRUQsSUFBYSxRQUFRO1lBQ3BCLE9BQU8sbUNBQTBCLENBQUMsRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFFRCxJQUFhLFlBQVk7WUFDeEIsSUFBSSxZQUFZLG1EQUEwQyxDQUFDO1lBRTNELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQztvQkFDN0IsWUFBWSw0Q0FBb0MsQ0FBQztnQkFDbEQsQ0FBQztZQUNGLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO29CQUNqRCxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7d0JBQzlELFlBQVksNENBQW9DLENBQUM7b0JBQ2xELENBQUM7Z0JBQ0YsQ0FBQztxQkFBTSxDQUFDO29C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
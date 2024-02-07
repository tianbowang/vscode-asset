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
define(["require", "exports", "vs/workbench/common/editor/editorInput", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/base/common/resources", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/configuration/common/configuration", "vs/editor/common/services/textResourceConfiguration"], function (require, exports, editorInput_1, files_1, label_1, resources_1, filesConfigurationService_1, configuration_1, textResourceConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractResourceEditorInput = void 0;
    /**
     * The base class for all editor inputs that open resources.
     */
    let AbstractResourceEditorInput = class AbstractResourceEditorInput extends editorInput_1.EditorInput {
        get capabilities() {
            let capabilities = 32 /* EditorInputCapabilities.CanSplitInGroup */;
            if (this.fileService.hasProvider(this.resource)) {
                if (this.filesConfigurationService.isReadonly(this.resource)) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            if (!(capabilities & 2 /* EditorInputCapabilities.Readonly */)) {
                capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
            }
            return capabilities;
        }
        get preferredResource() { return this._preferredResource; }
        constructor(resource, preferredResource, labelService, fileService, filesConfigurationService, textResourceConfigurationService) {
            super();
            this.resource = resource;
            this.labelService = labelService;
            this.fileService = fileService;
            this.filesConfigurationService = filesConfigurationService;
            this.textResourceConfigurationService = textResourceConfigurationService;
            this._name = undefined;
            this._shortDescription = undefined;
            this._mediumDescription = undefined;
            this._longDescription = undefined;
            this._shortTitle = undefined;
            this._mediumTitle = undefined;
            this._longTitle = undefined;
            this._preferredResource = preferredResource || resource;
            this.registerListeners();
        }
        registerListeners() {
            // Clear our labels on certain label related events
            this._register(this.labelService.onDidChangeFormatters(e => this.onLabelEvent(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onLabelEvent(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onLabelEvent(e.scheme)));
        }
        onLabelEvent(scheme) {
            if (scheme === this._preferredResource.scheme) {
                this.updateLabel();
            }
        }
        updateLabel() {
            // Clear any cached labels from before
            this._name = undefined;
            this._shortDescription = undefined;
            this._mediumDescription = undefined;
            this._longDescription = undefined;
            this._shortTitle = undefined;
            this._mediumTitle = undefined;
            this._longTitle = undefined;
            // Trigger recompute of label
            this._onDidChangeLabel.fire();
        }
        setPreferredResource(preferredResource) {
            if (!(0, resources_1.isEqual)(preferredResource, this._preferredResource)) {
                this._preferredResource = preferredResource;
                this.updateLabel();
            }
        }
        getName() {
            if (typeof this._name !== 'string') {
                this._name = this.labelService.getUriBasenameLabel(this._preferredResource);
            }
            return this._name;
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.shortDescription;
                case 2 /* Verbosity.LONG */:
                    return this.longDescription;
                case 1 /* Verbosity.MEDIUM */:
                default:
                    return this.mediumDescription;
            }
        }
        get shortDescription() {
            if (typeof this._shortDescription !== 'string') {
                this._shortDescription = this.labelService.getUriBasenameLabel((0, resources_1.dirname)(this._preferredResource));
            }
            return this._shortDescription;
        }
        get mediumDescription() {
            if (typeof this._mediumDescription !== 'string') {
                this._mediumDescription = this.labelService.getUriLabel((0, resources_1.dirname)(this._preferredResource), { relative: true });
            }
            return this._mediumDescription;
        }
        get longDescription() {
            if (typeof this._longDescription !== 'string') {
                this._longDescription = this.labelService.getUriLabel((0, resources_1.dirname)(this._preferredResource));
            }
            return this._longDescription;
        }
        get shortTitle() {
            if (typeof this._shortTitle !== 'string') {
                this._shortTitle = this.getName();
            }
            return this._shortTitle;
        }
        get mediumTitle() {
            if (typeof this._mediumTitle !== 'string') {
                this._mediumTitle = this.labelService.getUriLabel(this._preferredResource, { relative: true });
            }
            return this._mediumTitle;
        }
        get longTitle() {
            if (typeof this._longTitle !== 'string') {
                this._longTitle = this.labelService.getUriLabel(this._preferredResource);
            }
            return this._longTitle;
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* Verbosity.SHORT */:
                    return this.shortTitle;
                case 2 /* Verbosity.LONG */:
                    return this.longTitle;
                default:
                case 1 /* Verbosity.MEDIUM */:
                    return this.mediumTitle;
            }
        }
        isReadonly() {
            return this.filesConfigurationService.isReadonly(this.resource);
        }
        ensureLimits(options) {
            if (options?.limits) {
                return options.limits; // respect passed in limits if any
            }
            // We want to determine the large file configuration based on the best defaults
            // for the resource but also respecting user settings. We only apply user settings
            // if explicitly configured by the user. Otherwise we pick the best limit for the
            // resource scheme.
            const defaultSizeLimit = (0, files_1.getLargeFileConfirmationLimit)(this.resource);
            let configuredSizeLimit = undefined;
            const configuredSizeLimitMb = this.textResourceConfigurationService.inspect(this.resource, null, 'workbench.editorLargeFileConfirmation');
            if ((0, configuration_1.isConfigured)(configuredSizeLimitMb)) {
                configuredSizeLimit = configuredSizeLimitMb.value * files_1.ByteSize.MB; // normalize to MB
            }
            return {
                size: configuredSizeLimit ?? defaultSizeLimit
            };
        }
    };
    exports.AbstractResourceEditorInput = AbstractResourceEditorInput;
    exports.AbstractResourceEditorInput = AbstractResourceEditorInput = __decorate([
        __param(2, label_1.ILabelService),
        __param(3, files_1.IFileService),
        __param(4, filesConfigurationService_1.IFilesConfigurationService),
        __param(5, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], AbstractResourceEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VFZGl0b3JJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9lZGl0b3IvcmVzb3VyY2VFZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhaEc7O09BRUc7SUFDSSxJQUFlLDJCQUEyQixHQUExQyxNQUFlLDJCQUE0QixTQUFRLHlCQUFXO1FBRXBFLElBQWEsWUFBWTtZQUN4QixJQUFJLFlBQVksbURBQTBDLENBQUM7WUFFM0QsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO29CQUM5RCxZQUFZLDRDQUFvQyxDQUFDO2dCQUNsRCxDQUFDO1lBQ0YsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFlBQVksNENBQW9DLENBQUM7WUFDbEQsQ0FBQztZQUVELElBQUksQ0FBQyxDQUFDLFlBQVksMkNBQW1DLENBQUMsRUFBRSxDQUFDO2dCQUN4RCxZQUFZLHVEQUE2QyxDQUFDO1lBQzNELENBQUM7WUFFRCxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBR0QsSUFBSSxpQkFBaUIsS0FBVSxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFFaEUsWUFDVSxRQUFhLEVBQ3RCLGlCQUFrQyxFQUNuQixZQUE4QyxFQUMvQyxXQUE0QyxFQUM5Qix5QkFBd0UsRUFDakUsZ0NBQXNGO1lBRXpILEtBQUssRUFBRSxDQUFDO1lBUEMsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUVZLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQzVCLGdCQUFXLEdBQVgsV0FBVyxD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
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
define(["require", "exports", "vs/base/common/assert", "vs/base/common/observable", "vs/base/common/resources", "vs/base/common/types", "vs/editor/common/services/textResourceConfiguration", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/workbench/common/editor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel", "vs/workbench/contrib/mergeEditor/browser/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, assert_1, observable_1, resources_1, types_1, textResourceConfiguration_1, nls_1, configuration_1, files_1, instantiation_1, label_1, editor_1, textResourceEditorInput_1, mergeEditorInputModel_1, telemetry_1, editorService_1, filesConfigurationService_1, textfiles_1) {
    "use strict";
    var MergeEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeEditorInput = exports.MergeEditorInputData = void 0;
    class MergeEditorInputData {
        constructor(uri, title, detail, description) {
            this.uri = uri;
            this.title = title;
            this.detail = detail;
            this.description = description;
        }
    }
    exports.MergeEditorInputData = MergeEditorInputData;
    let MergeEditorInput = class MergeEditorInput extends textResourceEditorInput_1.AbstractTextResourceEditorInput {
        static { MergeEditorInput_1 = this; }
        static { this.ID = 'mergeEditor.Input'; }
        get useWorkingCopy() {
            return this.configurationService.getValue('mergeEditor.useWorkingCopy') ?? false;
        }
        constructor(base, input1, input2, result, _instaService, editorService, textFileService, labelService, fileService, configurationService, filesConfigurationService, textResourceConfigurationService) {
            super(result, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService);
            this.base = base;
            this.input1 = input1;
            this.input2 = input2;
            this.result = result;
            this._instaService = _instaService;
            this.configurationService = configurationService;
            this.closeHandler = {
                showConfirm: () => this._inputModel?.shouldConfirmClose() ?? false,
                confirm: async (editors) => {
                    (0, assert_1.assertFn)(() => editors.every(e => e.editor instanceof MergeEditorInput_1));
                    const inputModels = editors.map(e => e.editor._inputModel).filter(types_1.isDefined);
                    return await this._inputModel.confirmClose(inputModels);
                },
            };
            this.mergeEditorModeFactory = this._instaService.createInstance(this.useWorkingCopy
                ? mergeEditorInputModel_1.TempFileMergeEditorModeFactory
                : mergeEditorInputModel_1.WorkspaceMergeEditorModeFactory, this._instaService.createInstance(telemetry_1.MergeEditorTelemetry));
        }
        dispose() {
            super.dispose();
        }
        get typeId() {
            return MergeEditorInput_1.ID;
        }
        get editorId() {
            return editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
        }
        get capabilities() {
            let capabilities = super.capabilities | 256 /* EditorInputCapabilities.MultipleEditors */;
            if (this.useWorkingCopy) {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            return capabilities;
        }
        getName() {
            return (0, nls_1.localize)('name', "Merging: {0}", super.getName());
        }
        async resolve() {
            if (!this._inputModel) {
                const inputModel = this._register(await this.mergeEditorModeFactory.createInputModel({
                    base: this.base,
                    input1: this.input1,
                    input2: this.input2,
                    result: this.result,
                }));
                this._inputModel = inputModel;
                this._register((0, observable_1.autorun)(reader => {
                    /** @description fire dirty event */
                    inputModel.isDirty.read(reader);
                    this._onDidChangeDirty.fire();
                }));
                await this._inputModel.model.onInitialized;
            }
            return this._inputModel;
        }
        async accept() {
            await this._inputModel?.accept();
        }
        async save(group, options) {
            await this._inputModel?.save(options);
            return undefined;
        }
        toUntyped() {
            return {
                input1: { resource: this.input1.uri, label: this.input1.title, description: this.input1.description, detail: this.input1.detail },
                input2: { resource: this.input2.uri, label: this.input2.title, description: this.input2.description, detail: this.input2.detail },
                base: { resource: this.base },
                result: { resource: this.result },
                options: {
                    override: this.typeId
                }
            };
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof MergeEditorInput_1) {
                return (0, resources_1.isEqual)(this.base, otherInput.base)
                    && (0, resources_1.isEqual)(this.input1.uri, otherInput.input1.uri)
                    && (0, resources_1.isEqual)(this.input2.uri, otherInput.input2.uri)
                    && (0, resources_1.isEqual)(this.result, otherInput.result);
            }
            if ((0, editor_1.isResourceMergeEditorInput)(otherInput)) {
                return (this.editorId === otherInput.options?.override || otherInput.options?.override === undefined)
                    && (0, resources_1.isEqual)(this.base, otherInput.base.resource)
                    && (0, resources_1.isEqual)(this.input1.uri, otherInput.input1.resource)
                    && (0, resources_1.isEqual)(this.input2.uri, otherInput.input2.resource)
                    && (0, resources_1.isEqual)(this.result, otherInput.result.resource);
            }
            return false;
        }
        async revert(group, options) {
            return this._inputModel?.revert(options);
        }
        // ---- FileEditorInput
        isDirty() {
            return this._inputModel?.isDirty.get() ?? false;
        }
        setLanguageId(languageId, source) {
            this._inputModel?.model.setLanguageId(languageId, source);
        }
    };
    exports.MergeEditorInput = MergeEditorInput;
    exports.MergeEditorInput = MergeEditorInput = MergeEditorInput_1 = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, editorService_1.IEditorService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, label_1.ILabelService),
        __param(8, files_1.IFileService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, filesConfigurationService_1.IFilesConfigurationService),
        __param(11, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], MergeEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VFZGl0b3JJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci9tZXJnZUVkaXRvcklucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLE1BQWEsb0JBQW9CO1FBQ2hDLFlBQ1UsR0FBUSxFQUNSLEtBQXlCLEVBQ3pCLE1BQTBCLEVBQzFCLFdBQStCO1lBSC9CLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixVQUFLLEdBQUwsS0FBSyxDQUFvQjtZQUN6QixXQUFNLEdBQU4sTUFBTSxDQUFvQjtZQUMxQixnQkFBVyxHQUFYLFdBQVcsQ0FBb0I7UUFDckMsQ0FBQztLQUNMO0lBUEQsb0RBT0M7SUFFTSxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLHlEQUErQjs7aUJBQ3BELE9BQUUsR0FBRyxtQkFBbUIsQUFBdEIsQ0FBdUI7UUFhekMsSUFBWSxjQUFjO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUNsRixDQUFDO1FBRUQsWUFDaUIsSUFBUyxFQUNULE1BQTRCLEVBQzVCLE1BQTRCLEVBQzVCLE1BQVcsRUFDSixhQUFxRCxFQUM1RCxhQUE2QixFQUMzQixlQUFpQyxFQUNwQyxZQUEyQixFQUM1QixXQUF5QixFQUNoQixvQkFBNEQsRUFDdkQseUJBQXFELEVBQzlDLGdDQUFtRTtZQUV0RyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUseUJBQXlCLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQWJqSSxTQUFJLEdBQUosSUFBSSxDQUFLO1lBQ1QsV0FBTSxH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
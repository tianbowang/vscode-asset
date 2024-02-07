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
define(["require", "exports", "vs/nls", "vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/extensions", "vs/platform/files/common/files", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/model", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/common/languages/language", "vs/workbench/services/files/common/elevatedFileService", "vs/platform/log/common/log", "vs/base/common/async", "vs/workbench/services/decorations/common/decorations"], function (require, exports, nls_1, textFileService_1, textfiles_1, extensions_1, files_1, textResourceConfiguration_1, untitledTextEditorService_1, lifecycle_1, instantiation_1, model_1, environmentService_1, dialogs_1, filesConfigurationService_1, codeEditorService_1, pathService_1, workingCopyFileService_1, uriIdentity_1, language_1, elevatedFileService_1, log_1, async_1, decorations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeTextFileService = void 0;
    let NativeTextFileService = class NativeTextFileService extends textFileService_1.AbstractTextFileService {
        constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService) {
            super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService);
            this.environmentService = environmentService;
            this.registerListeners();
        }
        registerListeners() {
            // Lifecycle
            this.lifecycleService.onWillShutdown(event => event.join(this.onWillShutdown(), { id: 'join.textFiles', label: (0, nls_1.localize)('join.textFiles', "Saving text files") }));
        }
        async onWillShutdown() {
            let modelsPendingToSave;
            // As long as models are pending to be saved, we prolong the shutdown
            // until that has happened to ensure we are not shutting down in the
            // middle of writing to the file
            // (https://github.com/microsoft/vscode/issues/116600)
            while ((modelsPendingToSave = this.files.models.filter(model => model.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */))).length > 0) {
                await async_1.Promises.settled(modelsPendingToSave.map(model => model.joinState(2 /* TextFileEditorModelState.PENDING_SAVE */)));
            }
        }
        async read(resource, options) {
            // ensure platform limits are applied
            options = this.ensureLimits(options);
            return super.read(resource, options);
        }
        async readStream(resource, options) {
            // ensure platform limits are applied
            options = this.ensureLimits(options);
            return super.readStream(resource, options);
        }
        ensureLimits(options) {
            let ensuredOptions;
            if (!options) {
                ensuredOptions = Object.create(null);
            }
            else {
                ensuredOptions = options;
            }
            let ensuredLimits;
            if (!ensuredOptions.limits) {
                ensuredLimits = Object.create(null);
                ensuredOptions = {
                    ...ensuredOptions,
                    limits: ensuredLimits
                };
            }
            else {
                ensuredLimits = ensuredOptions.limits;
            }
            return ensuredOptions;
        }
    };
    exports.NativeTextFileService = NativeTextFileService;
    exports.NativeTextFileService = NativeTextFileService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, model_1.IModelService),
        __param(5, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(6, dialogs_1.IDialogService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(9, filesConfigurationService_1.IFilesConfigurationService),
        __param(10, codeEditorService_1.ICodeEditorService),
        __param(11, pathService_1.IPathService),
        __param(12, workingCopyFileService_1.IWorkingCopyFileService),
        __param(13, uriIdentity_1.IUriIdentityService),
        __param(14, language_1.ILanguageService),
        __param(15, elevatedFileService_1.IElevatedFileService),
        __param(16, log_1.ILogService),
        __param(17, decorations_1.IDecorationsService)
    ], NativeTextFileService);
    (0, extensions_1.registerSingleton)(textfiles_1.ITextFileService, NativeTextFileService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlVGV4dEZpbGVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dGZpbGUvZWxlY3Ryb24tc2FuZGJveC9uYXRpdmVUZXh0RmlsZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEJ6RixJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHlDQUF1QjtRQUlqRSxZQUNlLFdBQXlCLEVBQ1gseUJBQXFELEVBQzlELGdCQUFtQyxFQUMvQixvQkFBMkMsRUFDbkQsWUFBMkIsRUFDTixrQkFBc0QsRUFDMUUsYUFBNkIsRUFDekIsaUJBQXFDLEVBQ3RCLGdDQUFtRSxFQUMxRSx5QkFBcUQsRUFDN0QsaUJBQXFDLEVBQzNDLFdBQXlCLEVBQ2Qsc0JBQStDLEVBQ25ELGtCQUF1QyxFQUMxQyxlQUFpQyxFQUM3QixtQkFBeUMsRUFDbEQsVUFBdUIsRUFDZixrQkFBdUM7WUFFNUQsS0FBSyxDQUFDLFdBQVcsRUFBRSx5QkFBeUIsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixFQUFFLGdDQUFnQyxFQUFFLHlCQUF5QixFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxzQkFBc0IsRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFFelcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO1lBRTdDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIsWUFBWTtZQUNaLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVB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
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
define(["require", "exports", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editor", "vs/base/common/event", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/editor/common/services/resolverService", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/platform/workspace/common/workspace", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/serviceCollection", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/editor/common/services/languageService", "vs/editor/common/services/modelService", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/language", "vs/workbench/services/history/common/history", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/environment/common/environment", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/editor/common/services/textResourceConfiguration", "vs/editor/common/core/position", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/editor/common/core/range", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/services/extensions/common/extensions", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/decorations/common/decorations", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/services/codeEditorService", "vs/workbench/browser/editor", "vs/platform/log/common/log", "vs/platform/label/common/label", "vs/base/common/async", "vs/platform/storage/common/storage", "vs/base/common/platform", "vs/workbench/services/label/common/labelService", "vs/base/common/buffer", "vs/base/common/network", "vs/platform/product/common/product", "vs/workbench/services/host/browser/host", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/accessibility/common/accessibility", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/textfile/browser/browserTextFileService", "vs/workbench/services/environment/common/environmentService", "vs/editor/common/model/textModel", "vs/workbench/services/path/common/pathService", "vs/platform/progress/common/progress", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/editor/editorPane", "vs/base/common/cancellation", "vs/platform/instantiation/common/descriptors", "vs/platform/dialogs/test/common/testDialogService", "vs/workbench/services/editor/browser/codeEditorService", "vs/workbench/browser/parts/editor/editorPart", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/quickinput/browser/quickInputService", "vs/platform/list/browser/listService", "vs/base/common/path", "vs/workbench/test/common/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/stream", "vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/encoding", "vs/platform/theme/common/theme", "vs/base/common/iterator", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/workbench/services/workingCopy/browser/workingCopyBackupService", "vs/platform/files/common/fileService", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/editor/test/browser/testCodeEditor", "vs/workbench/contrib/files/browser/editors/textFileEditor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/types", "vs/workbench/services/editor/browser/editorResolverService", "vs/workbench/contrib/files/common/files", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/files/browser/elevatedFileService", "vs/editor/common/services/editorWorker", "vs/base/common/map", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/textfile/common/textEditorService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/base/common/process", "vs/base/common/extpath", "vs/platform/accessibility/test/common/testAccessibilityService", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/workbench/browser/parts/editor/textEditor", "vs/editor/common/core/selection", "vs/editor/test/common/services/testEditorWorkerService", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/codicons", "vs/platform/hover/browser/hover", "vs/platform/remote/common/remoteSocketFactoryService", "vs/workbench/browser/parts/editor/editorParts", "vs/base/browser/window", "vs/platform/markers/common/markers", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, fileEditorInput_1, instantiationServiceMock_1, resources_1, uri_1, telemetry_1, telemetryUtils_1, editorInput_1, editor_1, editor_2, event_1, workingCopyBackup_1, configuration_1, layoutService_1, textModelResolverService_1, resolverService_1, untitledTextEditorService_1, workspace_1, lifecycle_1, serviceCollection_1, files_1, model_1, languageService_1, modelService_1, textfiles_1, language_1, history_1, instantiation_1, testConfigurationService_1, testWorkspace_1, environment_1, themeService_1, testThemeService_1, textResourceConfiguration_1, position_1, actions_1, contextkey_1, mockKeybindingService_1, range_1, dialogs_1, notification_1, testNotificationService_1, extensions_1, keybinding_1, decorations_1, lifecycle_2, editorGroupsService_1, editorService_1, codeEditorService_1, editor_3, log_1, label_1, async_1, storage_1, platform_1, labelService_1, buffer_1, network_1, product_1, host_1, workingCopyService_1, filesConfigurationService_1, accessibility_1, environmentService_1, browserTextFileService_1, environmentService_2, textModel_1, pathService_1, progress_1, workingCopyFileService_1, undoRedoService_1, undoRedo_1, textFileEditorModel_1, platform_2, editorPane_1, cancellation_1, descriptors_1, testDialogService_1, codeEditorService_2, editorPart_1, quickInput_1, quickInputService_1, listService_1, path_1, workbenchTestServices_1, uriIdentity_1, uriIdentityService_1, inMemoryFilesystemProvider_1, stream_1, textFileService_1, encoding_1, theme_1, iterator_1, workingCopyBackupService_1, workingCopyBackupService_2, fileService_1, textResourceEditor_1, testCodeEditor_1, textFileEditor_1, textResourceEditorInput_1, untitledTextEditorInput_1, sideBySideEditor_1, workspaces_1, workspaceTrust_1, terminal_1, types_1, editorResolverService_1, files_2, editorResolverService_2, workingCopyEditorService_1, elevatedFileService_1, elevatedFileService_2, editorWorker_1, map_1, sideBySideEditorInput_1, textEditorService_1, panecomposite_1, languageConfigurationRegistry_1, testLanguageConfigurationService_1, process_1, extpath_1, testAccessibilityService_1, languageFeatureDebounce_1, languageFeatures_1, languageFeaturesService_1, textEditor_1, selection_1, testEditorWorkerService_1, remoteAgentService_1, languageDetectionWorkerService_1, userDataProfile_1, userDataProfileService_1, userDataProfile_2, codicons_1, hover_1, remoteSocketFactoryService_1, editorParts_1, window_1, markers_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.workbenchTeardown = exports.TestWebExtensionsScannerService = exports.TestUserDataProfileService = exports.TestWorkbenchExtensionManagementService = exports.TestWorkbenchExtensionEnablementService = exports.TestRemoteExtensionsScannerService = exports.TestRemoteAgentService = exports.TestQuickInputService = exports.TestTerminalProfileResolverService = exports.TestTerminalProfileService = exports.TestTerminalGroupService = exports.TestTerminalEditorService = exports.TestTerminalInstanceService = exports.TestWorkspacesService = exports.getLastResolvedFileStat = exports.TestPathService = exports.TestListService = exports.createEditorPart = exports.TestEditorPart = exports.TestSingletonFileEditorInput = exports.TestFileEditorInput = exports.registerTestSideBySideEditor = exports.registerTestResourceEditor = exports.registerTestFileEditor = exports.registerTestEditor = exports.TestEditorInput = exports.TestReadonlyTextFileEditorModel = exports.TestFilesConfigurationService = exports.TestHostService = exports.productService = exports.TestInMemoryFileSystemProvider = exports.RemoteFileSystemProvider = exports.TestTextResourceConfigurationService = exports.TestWillShutdownEvent = exports.TestBeforeShutdownEvent = exports.TestLifecycleService = exports.InMemoryTestWorkingCopyBackupService = exports.toTypedWorkingCopyId = exports.toUntypedWorkingCopyId = exports.TestWorkingCopyBackupService = exports.TestFileService = exports.TestEditorService = exports.TestEditorGroupAccessor = exports.TestEditorGroupView = exports.TestEditorGroupsService = exports.TestViewsService = exports.TestPanelPart = exports.TestSideBarPart = exports.TestPaneCompositeService = exports.TestLayoutService = exports.TestFileDialogService = exports.TestHistoryService = exports.TestMenuService = exports.TestDecorationsService = exports.TestProgressService = exports.TestEnvironmentService = exports.TestEncodingOracle = exports.TestBrowserTextFileServiceWithEncodingOverrides = exports.TestTextFileService = exports.TestServiceAccessor = exports.workbenchInstantiationService = exports.TestWorkingCopyService = exports.TestTextFileEditor = exports.TestTextResourceEditor = exports.createFileEditorInput = void 0;
    function createFileEditorInput(instantiationService, resource) {
        return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, undefined, undefined, undefined, undefined, undefined, undefined);
    }
    exports.createFileEditorInput = createFileEditorInput;
    platform_2.Registry.as(editor_1.EditorExtensions.EditorFactory).registerFileEditorFactory({
        typeId: files_2.FILE_EDITOR_INPUT_ID,
        createFileEditor: (resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService) => {
            return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents);
        },
        isFileEditor: (obj) => {
            return obj instanceof fileEditorInput_1.FileEditorInput;
        }
    });
    class TestTextResourceEditor extends textResourceEditor_1.TextResourceEditor {
        createEditorControl(parent, configuration) {
            this.editorControl = this._register(this.instantiationService.createInstance(testCodeEditor_1.TestCodeEditor, parent, configuration, {}));
        }
    }
    exports.TestTextResourceEditor = TestTextResourceEditor;
    class TestTextFileEditor extends textFileEditor_1.TextFileEditor {
        createEditorControl(parent, configuration) {
            this.editorControl = this._register(this.instantiationService.createInstance(testCodeEditor_1.TestCodeEditor, parent, configuration, { contributions: [] }));
        }
        setSelection(selection, reason) {
            this._options = selection ? { selection } : undefined;
            this._onDidChangeSelection.fire({ reason });
        }
        getSelection() {
            const options = this.options;
            if (!options) {
                return undefined;
            }
            const textSelection = options.selection;
            if (!textSelection) {
                return undefined;
            }
            return new textEditor_1.TextEditorPaneSelection(new selection_1.Selection(textSelection.startLineNumber, textSelection.startColumn, textSelection.endLineNumber ?? textSelection.startLineNumber, textSelection.endColumn ?? textSelection.startColumn));
        }
    }
    exports.TestTextFileEditor = TestTextFileEditor;
    class TestWorkingCopyService extends workingCopyService_1.WorkingCopyService {
        testUnregisterWorkingCopy(workingCopy) {
            return super.unregisterWorkingCopy(workingCopy);
        }
    }
    exports.TestWorkingCopyService = TestWorkingCopyService;
    function workbenchInstantiationService(overrides, disposables = new lifecycle_2.DisposableStore()) {
        const instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService(new serviceCollection_1.ServiceCollection([lifecycle_1.ILifecycleService, disposables.add(new TestLifecycleService())])));
        instantiationService.stub(editorWorker_1.IEditorWorkerService, new testEditorWorkerService_1.TestEditorWorkerService());
        instantiationService.stub(workingCopyService_1.IWorkingCopyService, disposables.add(new TestWorkingCopyService()));
        const environmentService = overrides?.environmentService ? overrides.environmentService(instantiationService) : exports.TestEnvironmentService;
        instantiationService.stub(environment_1.IEnvironmentService, environmentService);
        instantiationService.stub(environmentService_2.IWorkbenchEnvironmentService, environmentService);
        instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
        const contextKeyService = overrides?.contextKeyService ? overrides.contextKeyService(instantiationService) : instantiationService.createInstance(mockKeybindingService_1.MockContextKeyService);
        instantiationService.stub(contextkey_1.IContextKeyService, contextKeyService);
        instantiationService.stub(progress_1.IProgressService, new TestProgressService());
        const workspaceContextService = new workbenchTestServices_1.TestContextService(testWorkspace_1.TestWorkspace);
        instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceContextService);
        const configService = overrides?.configurationService ? overrides.configurationService(instantiationService) : new testConfigurationService_1.TestConfigurationService({
            files: {
                participants: {
                    timeout: 60000
                }
            }
        });
        instantiationService.stub(configuration_1.IConfigurationService, configService);
        const textResourceConfigurationService = new TestTextResourceConfigurationService(configService);
        instantiationService.stub(textResourceConfiguration_1.ITextResourceConfigurationService, textResourceConfigurationService);
        instantiationService.stub(untitledTextEditorService_1.IUntitledTextEditorService, disposables.add(instantiationService.createInstance(untitledTextEditorService_1.UntitledTextEditorService)));
        instantiationService.stub(storage_1.IStorageService, disposables.add(new workbenchTestServices_1.TestStorageService()));
        instantiationService.stub(remoteAgentService_1.IRemoteAgentService, new TestRemoteAgentService());
        instantiationService.stub(languageDetectionWorkerService_1.ILanguageDetectionService, new TestLanguageDetectionService());
        instantiationService.stub(pathService_1.IPathService, overrides?.pathService ? overrides.pathService(instantiationService) : new TestPathService());
        const layoutService = new TestLayoutService();
        instantiationService.stub(layoutService_1.IWorkbenchLayoutService, layoutService);
        instantiationService.stub(dialogs_1.IDialogService, new testDialogService_1.TestDialogService());
        const accessibilityService = new testAccessibilityService_1.TestAccessibilityService();
        instantiationService.stub(accessibility_1.IAccessibilityService, accessibilityService);
        instantiationService.stub(audioCueService_1.IAudioCueService, { playAudioCue: async () => { }, isEnabled(cue) { return false; } });
        instantiationService.stub(dialogs_1.IFileDialogService, instantiationService.createInstance(TestFileDialogService));
        instantiationService.stub(language_1.ILanguageService, disposables.add(instantiationService.createInstance(languageService_1.LanguageService)));
        instantiationService.stub(languageFeatures_1.ILanguageFeaturesService, new languageFeaturesService_1.LanguageFeaturesService());
        instantiationService.stub(languageFeatureDebounce_1.ILanguageFeatureDebounceService, instantiationService.createInstance(languageFeatureDebounce_1.LanguageFeatureDebounceService));
        instantiationService.stub(history_1.IHistoryService, new TestHistoryService());
        instantiationService.stub(textResourceConfiguration_1.ITextResourcePropertiesService, new workbenchTestServices_1.TestTextResourcePropertiesService(configService));
        instantiationService.stub(undoRedo_1.IUndoRedoService, instantiationService.createInstance(undoRedoService_1.UndoRedoService));
        const themeService = new testThemeService_1.TestThemeService();
        instantiationService.stub(themeService_1.IThemeService, themeService);
        instantiationService.stub(languageConfigurationRegistry_1.ILanguageConfigurationService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
        instantiationService.stub(model_1.IModelService, disposables.add(instantiationService.createInstance(modelService_1.ModelService)));
        const fileService = overrides?.fileService ? overrides.fileService(instantiationService) : disposables.add(new TestFileService());
        instantiationService.stub(files_1.IFileService, fileService);
        const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
        disposables.add(uriIdentityService);
        const markerService = new workbenchTestServices_1.TestMarkerService();
        instantiationService.stub(markers_1.IMarkerService, markerService);
        instantiationService.stub(filesConfigurationService_1.IFilesConfigurationService, disposables.add(new TestFilesConfigurationService(contextKeyService, configService, workspaceContextService, environmentService, uriIdentityService, fileService, markerService, textResourceConfigurationService)));
        instantiationService.stub(uriIdentity_1.IUriIdentityService, disposables.add(uriIdentityService));
        const userDataProfilesService = instantiationService.stub(userDataProfile_1.IUserDataProfilesService, disposables.add(new userDataProfile_1.UserDataProfilesService(environmentService, fileService, uriIdentityService, new log_1.NullLogService())));
        instantiationService.stub(userDataProfile_2.IUserDataProfileService, disposables.add(new userDataProfileService_1.UserDataProfileService(userDataProfilesService.defaultProfile)));
        instantiationService.stub(workingCopyBackup_1.IWorkingCopyBackupService, overrides?.workingCopyBackupService ? overrides?.workingCopyBackupService(instantiationService) : disposables.add(new TestWorkingCopyBackupService()));
        instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
        instantiationService.stub(notification_1.INotificationService, new testNotificationService_1.TestNotificationService());
        instantiationService.stub(untitledTextEditorService_1.IUntitledTextEditorService, disposables.add(instantiationService.createInstance(untitledTextEditorService_1.UntitledTextEditorService)));
        instantiationService.stub(actions_1.IMenuService, new TestMenuService());
        const keybindingService = new mockKeybindingService_1.MockKeybindingService();
        instantiationService.stub(keybinding_1.IKeybindingService, keybindingService);
        instantiationService.stub(decorations_1.IDecorationsService, new TestDecorationsService());
        instantiationService.stub(extensions_1.IExtensionService, new workbenchTestServices_1.TestExtensionService());
        instantiationService.stub(workingCopyFileService_1.IWorkingCopyFileService, disposables.add(instantiationService.createInstance(workingCopyFileService_1.WorkingCopyFileService)));
        instantiationService.stub(textfiles_1.ITextFileService, overrides?.textFileService ? overrides.textFileService(instantiationService) : disposables.add(instantiationService.createInstance(TestTextFileService)));
        instantiationService.stub(host_1.IHostService, instantiationService.createInstance(TestHostService));
        instantiationService.stub(resolverService_1.ITextModelService, disposables.add(instantiationService.createInstance(textModelResolverService_1.TextModelResolverService)));
        instantiationService.stub(log_1.ILoggerService, disposables.add(new workbenchTestServices_1.TestLoggerService(exports.TestEnvironmentService.logsHome)));
        const editorGroupService = new TestEditorGroupsService([new TestEditorGroupView(0)]);
        instantiationService.stub(editorGroupsService_1.IEditorGroupsService, editorGroupService);
        instantiationService.stub(label_1.ILabelService, disposables.add(instantiationService.createInstance(labelService_1.LabelService)));
        const editorService = overrides?.editorService ? overrides.editorService(instantiationService) : disposables.add(new TestEditorService(editorGroupService));
        instantiationService.stub(editorService_1.IEditorService, editorService);
        instantiationService.stub(workingCopyEditorService_1.IWorkingCopyEditorService, disposables.add(instantiationService.createInstance(workingCopyEditorService_1.WorkingCopyEditorService)));
        instantiationService.stub(editorResolverService_2.IEditorResolverService, disposables.add(instantiationService.createInstance(editorResolverService_1.EditorResolverService)));
        const textEditorService = overrides?.textEditorService ? overrides.textEditorService(instantiationService) : disposables.add(instantiationService.createInstance(textEditorService_1.TextEditorService));
        instantiationService.stub(textEditorService_1.ITextEditorService, textEditorService);
        instantiationService.stub(codeEditorService_1.ICodeEditorService, disposables.add(new codeEditorService_2.CodeEditorService(editorService, themeService, configService)));
        instantiationService.stub(panecomposite_1.IPaneCompositePartService, disposables.add(new TestPaneCompositeService()));
        instantiationService.stub(listService_1.IListService, new TestListService());
        const hoverService = instantiationService.stub(hover_1.IHoverService, instantiationService.createInstance(TestHoverService));
        instantiationService.stub(quickInput_1.IQuickInputService, disposables.add(new quickInputService_1.QuickInputService(configService, instantiationService, keybindingService, contextKeyService, themeService, layoutService, hoverService)));
        instantiationService.stub(workspaces_1.IWorkspacesService, new TestWorkspacesService());
        instantiationService.stub(workspaceTrust_1.IWorkspaceTrustManagementService, disposables.add(new workbenchTestServices_1.TestWorkspaceTrustManagementService()));
        instantiationService.stub(workspaceTrust_1.IWorkspaceTrustRequestService, disposables.add(new workbenchTestServices_1.TestWorkspaceTrustRequestService(false)));
        instantiationService.stub(terminal_1.ITerminalInstanceService, new TestTerminalInstanceService());
        instantiationService.stub(elevatedFileService_1.IElevatedFileService, new elevatedFileService_2.BrowserElevatedFileService());
        instantiationService.stub(remoteSocketFactoryService_1.IRemoteSocketFactoryService, new remoteSocketFactoryService_1.RemoteSocketFactoryService());
        return instantiationService;
    }
    exports.workbenchInstantiationService = workbenchInstantiationService;
    let TestServiceAccessor = class TestServiceAccessor {
        constructor(lifecycleService, textFileService, textEditorService, workingCopyFileService, filesConfigurationService, contextService, modelService, fileService, fileDialogService, dialogService, workingCopyService, editorService, environmentService, pathService, editorGroupService, editorResolverService, languageService, textModelResolverService, untitledTextEditorService, testConfigurationService, workingCopyBackupService, hostService, quickInputService, labelService, logService, uriIdentityService, instantitionService, notificationService, workingCopyEditorService, instantiationService, elevatedFileService, workspaceTrustRequestService, decorationsService) {
            this.lifecycleService = lifecycleService;
            this.textFileService = textFileService;
            this.textEditorService = textEditorService;
            this.workingCopyFileService = workingCopyFileService;
            this.filesConfigurationService = filesConfigurationService;
            this.contextService = contextService;
            this.modelService = modelService;
            this.fileService = fileService;
            this.fileDialogService = fileDialogService;
            this.dialogService = dialogService;
            this.workingCopyService = workingCopyService;
            this.editorService = editorService;
            this.environmentService = environmentService;
            this.pathService = pathService;
            this.editorGroupService = editorGroupService;
            this.editorResolverService = editorResolverService;
            this.languageService = languageService;
            this.textModelResolverService = textModelResolverService;
            this.untitledTextEditorService = untitledTextEditorService;
            this.testConfigurationService = testConfigurationService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.hostService = hostService;
            this.quickInputService = quickInputService;
            this.labelService = labelService;
            this.logService = logService;
            this.uriIdentityService = uriIdentityService;
            this.instantitionService = instantitionService;
            this.notificationService = notificationService;
            this.workingCopyEditorService = workingCopyEditorService;
            this.instantiationService = instantiationService;
            this.elevatedFileService = elevatedFileService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.decorationsService = decorationsService;
        }
    };
    exports.TestServiceAccessor = TestServiceAccessor;
    exports.TestServiceAccessor = TestServiceAccessor = __decorate([
        __param(0, lifecycle_1.ILifecycleService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, textEditorService_1.ITextEditorService),
        __param(3, workingCopyFileService_1.IWorkingCopyFileService),
        __param(4, filesConfigurationService_1.IFilesConfigurationService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, model_1.IModelService),
        __param(7, files_1.IFileService),
        __param(8, dialogs_1.IFileDialogService),
        __param(9, dialogs_1.IDialogService),
        __param(10, workingCopyService_1.IWorkingCopyService),
        __param(11, editorService_1.IEditorService),
        __param(12, environmentService_2.IWorkbenchEnvironmentService),
        __param(13, pathService_1.IPathService),
        __param(14, editorGroupsService_1.IEditorGroupsService),
        __param(15, editorResolverService_2.IEditorResolverService),
        __param(16, language_1.ILanguageService),
        __param(17, resolverService_1.ITextModelService),
        __param(18, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(19, configuration_1.IConfigurationService),
        __param(20, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(21, host_1.IHostService),
        __param(22, quickInput_1.IQuickInputService),
        __param(23, label_1.ILabelService),
        __param(24, log_1.ILogService),
        __param(25, uriIdentity_1.IUriIdentityService),
        __param(26, instantiation_1.IInstantiationService),
        __param(27, notification_1.INotificationService),
        __param(28, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(29, instantiation_1.IInstantiationService),
        __param(30, elevatedFileService_1.IElevatedFileService),
        __param(31, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(32, decorations_1.IDecorationsService)
    ], TestServiceAccessor);
    let TestTextFileService = class TestTextFileService extends browserTextFileService_1.BrowserTextFileService {
        constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService) {
            super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService);
            this.readStreamError = undefined;
            this.writeError = undefined;
        }
        setReadStreamErrorOnce(error) {
            this.readStreamError = error;
        }
        async readStream(resource, options) {
            if (this.readStreamError) {
                const error = this.readStreamError;
                this.readStreamError = undefined;
                throw error;
            }
            const content = await this.fileService.readFileStream(resource, options);
            return {
                resource: content.resource,
                name: content.name,
                mtime: content.mtime,
                ctime: content.ctime,
                etag: content.etag,
                encoding: 'utf8',
                value: await (0, textModel_1.createTextBufferFactoryFromStream)(content.value),
                size: 10,
                readonly: false,
                locked: false
            };
        }
        setWriteErrorOnce(error) {
            this.writeError = error;
        }
        async write(resource, value, options) {
            if (this.writeError) {
                const error = this.writeError;
                this.writeError = undefined;
                throw error;
            }
            return super.write(resource, value, options);
        }
    };
    exports.TestTextFileService = TestTextFileService;
    exports.TestTextFileService = TestTextFileService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, model_1.IModelService),
        __param(5, environmentService_2.IWorkbenchEnvironmentService),
        __param(6, dialogs_1.IDialogService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(9, filesConfigurationService_1.IFilesConfigurationService),
        __param(10, codeEditorService_1.ICodeEditorService),
        __param(11, pathService_1.IPathService),
        __param(12, workingCopyFileService_1.IWorkingCopyFileService),
        __param(13, uriIdentity_1.IUriIdentityService),
        __param(14, language_1.ILanguageService),
        __param(15, log_1.ILogService),
        __param(16, elevatedFileService_1.IElevatedFileService),
        __param(17, decorations_1.IDecorationsService)
    ], TestTextFileService);
    class TestBrowserTextFileServiceWithEncodingOverrides extends browserTextFileService_1.BrowserTextFileService {
        get encoding() {
            if (!this._testEncoding) {
                this._testEncoding = this._register(this.instantiationService.createInstance(TestEncodingOracle));
            }
            return this._testEncoding;
        }
    }
    exports.TestBrowserTextFileServiceWithEncodingOverrides = TestBrowserTextFileServiceWithEncodingOverrides;
    class TestEncodingOracle extends textFileService_1.EncodingOracle {
        get encodingOverrides() {
            return [
                { extension: 'utf16le', encoding: encoding_1.UTF16le },
                { extension: 'utf16be', encoding: encoding_1.UTF16be },
                { extension: 'utf8bom', encoding: encoding_1.UTF8_with_bom }
            ];
        }
        set encodingOverrides(overrides) { }
    }
    exports.TestEncodingOracle = TestEncodingOracle;
    class TestEnvironmentServiceWithArgs extends environmentService_1.BrowserWorkbenchEnvironmentService {
        constructor() {
            super(...arguments);
            this.args = [];
        }
    }
    exports.TestEnvironmentService = new TestEnvironmentServiceWithArgs('', uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), Object.create(null), workbenchTestServices_1.TestProductService);
    class TestProgressService {
        withProgress(options, task, onDidCancel) {
            return task(progress_1.Progress.None);
        }
    }
    exports.TestProgressService = TestProgressService;
    class TestDecorationsService {
        constructor() {
            this.onDidChangeDecorations = event_1.Event.None;
        }
        registerDecorationsProvider(_provider) { return lifecycle_2.Disposable.None; }
        getDecoration(_uri, _includeChildren, _overwrite) { return undefined; }
    }
    exports.TestDecorationsService = TestDecorationsService;
    class TestMenuService {
        createMenu(_id, _scopedKeybindingService) {
            return {
                onDidChange: event_1.Event.None,
                dispose: () => undefined,
                getActions: () => []
            };
        }
        resetHiddenStates() {
            // nothing
        }
    }
    exports.TestMenuService = TestMenuService;
    class TestHistoryService {
        constructor(root) {
            this.root = root;
        }
        async reopenLastClosedEditor() { }
        async goForward() { }
        async goBack() { }
        async goPrevious() { }
        async goLast() { }
        removeFromHistory(_input) { }
        clear() { }
        clearRecentlyOpened() { }
        getHistory() { return []; }
        async openNextRecentlyUsedEditor(group) { }
        async openPreviouslyUsedEditor(group) { }
        getLastActiveWorkspaceRoot(_schemeFilter) { return this.root; }
        getLastActiveFile(_schemeFilter) { return undefined; }
    }
    exports.TestHistoryService = TestHistoryService;
    let TestFileDialogService = class TestFileDialogService {
        constructor(pathService) {
            this.pathService = pathService;
        }
        async defaultFilePath(_schemeFilter) { return this.pathService.userHome(); }
        async defaultFolderPath(_schemeFilter) { return this.pathService.userHome(); }
        async defaultWorkspacePath(_schemeFilter) { return this.pathService.userHome(); }
        async preferredHome(_schemeFilter) { return this.pathService.userHome(); }
        pickFileFolderAndOpen(_options) { return Promise.resolve(0); }
        pickFileAndOpen(_options) { return Promise.resolve(0); }
        pickFolderAndOpen(_options) { return Promise.resolve(0); }
        pickWorkspaceAndOpen(_options) { return Promise.resolve(0); }
        setPickFileToSave(path) { this.fileToSave = path; }
        pickFileToSave(defaultUri, availableFileSystems) { return Promise.resolve(this.fileToSave); }
        showSaveDialog(_options) { return Promise.resolve(undefined); }
        showOpenDialog(_options) { return Promise.resolve(undefined); }
        setConfirmResult(result) { this.confirmResult = result; }
        showSaveConfirm(fileNamesOrResources) { return Promise.resolve(this.confirmResult); }
    };
    exports.TestFileDialogService = TestFileDialogService;
    exports.TestFileDialogService = TestFileDialogService = __decorate([
        __param(0, pathService_1.IPathService)
    ], TestFileDialogService);
    class TestLayoutService {
        constructor() {
            this.openedDefaultEditors = false;
            this.mainContainerDimension = { width: 800, height: 600 };
            this.activeContainerDimension = { width: 800, height: 600 };
            this.mainContainerOffset = { top: 0, quickPickTop: 0 };
            this.activeContainerOffset = { top: 0, quickPickTop: 0 };
            this.whenActiveContainerStylesLoaded = Promise.resolve();
            this.mainContainer = window_1.mainWindow.document.body;
            this.containers = [window_1.mainWindow.document.body];
            this.activeContainer = window_1.mainWindow.document.body;
            this.onDidChangeZenMode = event_1.Event.None;
            this.onDidChangeCenteredLayout = event_1.Event.None;
            this.onDidChangeWindowMaximized = event_1.Event.None;
            this.onDidChangePanelPosition = event_1.Event.None;
            this.onDidChangePanelAlignment = event_1.Event.None;
            this.onDidChangePartVisibility = event_1.Event.None;
            this.onDidLayoutMainContainer = event_1.Event.None;
            this.onDidLayoutActiveContainer = event_1.Event.None;
            this.onDidLayoutContainer = event_1.Event.None;
            this.onDidChangeNotificationsVisibility = event_1.Event.None;
            this.onDidAddContainer = event_1.Event.None;
            this.onDidChangeActiveContainer = event_1.Event.None;
            this.whenReady = Promise.resolve(undefined);
            this.whenRestored = Promise.resolve(undefined);
        }
        layout() { }
        isRestored() { return true; }
        hasFocus(_part) { return false; }
        focusPart(_part) { }
        hasMainWindowBorder() { return false; }
        getMainWindowBorderRadius() { return undefined; }
        isVisible(_part) { return true; }
        getContainer() { return null; }
        isTitleBarHidden() { return false; }
        isStatusBarHidden() { return false; }
        isActivityBarHidden() { return false; }
        setActivityBarHidden(_hidden) { }
        setBannerHidden(_hidden) { }
        isSideBarHidden() { return false; }
        async setEditorHidden(_hidden) { }
        async setSideBarHidden(_hidden) { }
        async setAuxiliaryBarHidden(_hidden) { }
        async setPartHidden(_hidden, part) { }
        isPanelHidden() { return false; }
        async setPanelHidden(_hidden) { }
        toggleMaximizedPanel() { }
        isPanelMaximized() { return false; }
        getMenubarVisibility() { throw new Error('not implemented'); }
        toggleMenuBar() { }
        getSideBarPosition() { return 0; }
        getPanelPosition() { return 0; }
        getPanelAlignment() { return 'center'; }
        async setPanelPosition(_position) { }
        async setPanelAlignment(_alignment) { }
        addClass(_clazz) { }
        removeClass(_clazz) { }
        getMaximumEditorDimensions() { throw new Error('not implemented'); }
        toggleZenMode() { }
        isMainEditorLayoutCentered() { return false; }
        centerMainEditorLayout(_active) { }
        resizePart(_part, _sizeChangeWidth, _sizeChangeHeight) { }
        registerPart(part) { }
        isWindowMaximized(targetWindow) { return false; }
        updateWindowMaximizedState(targetWindow, maximized) { }
        getVisibleNeighborPart(part, direction) { return undefined; }
        focus() { }
    }
    exports.TestLayoutService = TestLayoutService;
    const activeViewlet = {};
    class TestPaneCompositeService extends lifecycle_2.Disposable {
        constructor() {
            super();
            this.parts = new Map();
            this.parts.set(1 /* ViewContainerLocation.Panel */, new TestPanelPart());
            this.parts.set(0 /* ViewContainerLocation.Sidebar */, new TestSideBarPart());
            this.onDidPaneCompositeOpen = event_1.Event.any(...([1 /* ViewContainerLocation.Panel */, 0 /* ViewContainerLocation.Sidebar */].map(loc => event_1.Event.map(this.parts.get(loc).onDidPaneCompositeOpen, composite => { return { composite, viewContainerLocation: loc }; }))));
            this.onDidPaneCompositeClose = event_1.Event.any(...([1 /* ViewContainerLocation.Panel */, 0 /* ViewContainerLocation.Sidebar */].map(loc => event_1.Event.map(this.parts.get(loc).onDidPaneCompositeClose, composite => { return { composite, viewContainerLocation: loc }; }))));
        }
        openPaneComposite(id, viewContainerLocation, focus) {
            return this.getPartByLocation(viewContainerLocation).openPaneComposite(id, focus);
        }
        getActivePaneComposite(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getActivePaneComposite();
        }
        getPaneComposite(id, viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getPaneComposite(id);
        }
        getPaneComposites(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getPaneComposites();
        }
        getProgressIndicator(id, viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getProgressIndicator(id);
        }
        hideActivePaneComposite(viewContainerLocation) {
            this.getPartByLocation(viewContainerLocation).hideActivePaneComposite();
        }
        getLastActivePaneCompositeId(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getLastActivePaneCompositeId();
        }
        getPinnedPaneCompositeIds(viewContainerLocation) {
            throw new Error('Method not implemented.');
        }
        getVisiblePaneCompositeIds(viewContainerLocation) {
            throw new Error('Method not implemented.');
        }
        getPartByLocation(viewContainerLocation) {
            return (0, types_1.assertIsDefined)(this.parts.get(viewContainerLocation));
        }
    }
    exports.TestPaneCompositeService = TestPaneCompositeService;
    class TestSideBarPart {
        constructor() {
            this.onDidViewletRegisterEmitter = new event_1.Emitter();
            this.onDidViewletDeregisterEmitter = new event_1.Emitter();
            this.onDidViewletOpenEmitter = new event_1.Emitter();
            this.onDidViewletCloseEmitter = new event_1.Emitter();
            this.partId = "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */;
            this.element = undefined;
            this.minimumWidth = 0;
            this.maximumWidth = 0;
            this.minimumHeight = 0;
            this.maximumHeight = 0;
            this.onDidChange = event_1.Event.None;
            this.onDidPaneCompositeOpen = this.onDidViewletOpenEmitter.event;
            this.onDidPaneCompositeClose = this.onDidViewletCloseEmitter.event;
        }
        openPaneComposite(id, focus) { return Promise.resolve(undefined); }
        getPaneComposites() { return []; }
        getAllViewlets() { return []; }
        getActivePaneComposite() { return activeViewlet; }
        getDefaultViewletId() { return 'workbench.view.explorer'; }
        getPaneComposite(id) { return undefined; }
        getProgressIndicator(id) { return undefined; }
        hideActivePaneComposite() { }
        getLastActivePaneCompositeId() { return undefined; }
        dispose() { }
        getPinnedPaneCompositeIds() { return []; }
        getVisiblePaneCompositeIds() { return []; }
        layout(width, height, top, left) { }
    }
    exports.TestSideBarPart = TestSideBarPart;
    class TestHoverService {
        showHover(options, focus) {
            this.currentHover = new class {
                constructor() {
                    this._isDisposed = false;
                }
                get isDisposed() { return this._isDisposed; }
                dispose() {
                    this._isDisposed = true;
                }
            };
            return this.currentHover;
        }
        showAndFocusLastHover() { }
        hideHover() {
            this.currentHover?.dispose();
        }
    }
    class TestPanelPart {
        constructor() {
            this.element = undefined;
            this.minimumWidth = 0;
            this.maximumWidth = 0;
            this.minimumHeight = 0;
            this.maximumHeight = 0;
            this.onDidChange = event_1.Event.None;
            this.onDidPaneCompositeOpen = new event_1.Emitter().event;
            this.onDidPaneCompositeClose = new event_1.Emitter().event;
            this.partId = "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */;
        }
        async openPaneComposite(id, focus) { return undefined; }
        getPaneComposite(id) { return activeViewlet; }
        getPaneComposites() { return []; }
        getPinnedPaneCompositeIds() { return []; }
        getVisiblePaneCompositeIds() { return []; }
        getActivePaneComposite() { return activeViewlet; }
        setPanelEnablement(id, enabled) { }
        dispose() { }
        getProgressIndicator(id) { return null; }
        hideActivePaneComposite() { }
        getLastActivePaneCompositeId() { return undefined; }
        layout(width, height, top, left) { }
    }
    exports.TestPanelPart = TestPanelPart;
    class TestViewsService {
        constructor() {
            this.onDidChangeViewContainerVisibility = new event_1.Emitter().event;
            this.onDidChangeViewVisibilityEmitter = new event_1.Emitter();
            this.onDidChangeViewVisibility = this.onDidChangeViewVisibilityEmitter.event;
            this.onDidChangeFocusedViewEmitter = new event_1.Emitter();
            this.onDidChangeFocusedView = this.onDidChangeFocusedViewEmitter.event;
        }
        isViewContainerVisible(id) { return true; }
        getVisibleViewContainer() { return null; }
        openViewContainer(id, focus) { return Promise.resolve(null); }
        closeViewContainer(id) { }
        isViewVisible(id) { return true; }
        getActiveViewWithId(id) { return null; }
        getViewWithId(id) { return null; }
        openView(id, focus) { return Promise.resolve(null); }
        closeView(id) { }
        getViewProgressIndicator(id) { return null; }
        getActiveViewPaneContainerWithId(id) { return null; }
        getFocusedViewName() { return ''; }
    }
    exports.TestViewsService = TestViewsService;
    class TestEditorGroupsService {
        constructor(groups = []) {
            this.groups = groups;
            this.parts = [this];
            this.windowId = window_1.mainWindow.vscodeWindowId;
            this.onDidCreateAuxiliaryEditorPart = event_1.Event.None;
            this.onDidChangeActiveGroup = event_1.Event.None;
            this.onDidActivateGroup = event_1.Event.None;
            this.onDidAddGroup = event_1.Event.None;
            this.onDidRemoveGroup = event_1.Event.None;
            this.onDidMoveGroup = event_1.Event.None;
            this.onDidChangeGroupIndex = event_1.Event.None;
            this.onDidChangeGroupLabel = event_1.Event.None;
            this.onDidChangeGroupLocked = event_1.Event.None;
            this.onDidChangeGroupMaximized = event_1.Event.None;
            this.onDidLayout = event_1.Event.None;
            this.onDidChangeEditorPartOptions = event_1.Event.None;
            this.onDidScroll = event_1.Event.None;
            this.orientation = 0 /* GroupOrientation.HORIZONTAL */;
            this.isReady = true;
            this.whenReady = Promise.resolve(undefined);
            this.whenRestored = Promise.resolve(undefined);
            this.hasRestorableState = false;
            this.contentDimension = { width: 800, height: 600 };
            this.activePart = this;
            this.mainPart = this;
        }
        get activeGroup() { return this.groups[0]; }
        get sideGroup() { return this.groups[0]; }
        get count() { return this.groups.length; }
        getPart(group) { return this; }
        getGroups(_order) { return this.groups; }
        getGroup(identifier) { return this.groups.find(group => group.id === identifier); }
        getLabel(_identifier) { return 'Group 1'; }
        findGroup(_scope, _source, _wrap) { throw new Error('not implemented'); }
        activateGroup(_group) { throw new Error('not implemented'); }
        restoreGroup(_group) { throw new Error('not implemented'); }
        getSize(_group) { return { width: 100, height: 100 }; }
        setSize(_group, _size) { }
        arrangeGroups(_arrangement) { }
        toggleMaximizeGroup() { }
        hasMaximizedGroup() { throw new Error('not implemented'); }
        toggleExpandGroup() { }
        applyLayout(_layout) { }
        getLayout() { throw new Error('not implemented'); }
        setGroupOrientation(_orientation) { }
        addGroup(_location, _direction) { throw new Error('not implemented'); }
        removeGroup(_group) { }
        moveGroup(_group, _location, _direction) { throw new Error('not implemented'); }
        mergeGroup(_group, _target, _options) { throw new Error('not implemented'); }
        mergeAllGroups(_group) { throw new Error('not implemented'); }
        copyGroup(_group, _location, _direction) { throw new Error('not implemented'); }
        centerLayout(active) { }
        isLayoutCentered() { return false; }
        createEditorDropTarget(container, delegate) { return lifecycle_2.Disposable.None; }
        enforcePartOptions(options) { return lifecycle_2.Disposable.None; }
        registerEditorPart(part) { return lifecycle_2.Disposable.None; }
        createAuxiliaryEditorPart() { throw new Error('Method not implemented.'); }
    }
    exports.TestEditorGroupsService = TestEditorGroupsService;
    class TestEditorGroupView {
        constructor(id) {
            this.id = id;
            this.windowId = window_1.mainWindow.vscodeWindowId;
            this.groupsView = undefined;
            this.editors = [];
            this.whenRestored = Promise.resolve(undefined);
            this.isEmpty = true;
            this.onWillDispose = event_1.Event.None;
            this.onDidModelChange = event_1.Event.None;
            this.onWillCloseEditor = event_1.Event.None;
            this.onDidCloseEditor = event_1.Event.None;
            this.onDidOpenEditorFail = event_1.Event.None;
            this.onDidFocus = event_1.Event.None;
            this.onDidChange = event_1.Event.None;
            this.onWillMoveEditor = event_1.Event.None;
            this.onWillOpenEditor = event_1.Event.None;
            this.onDidActiveEditorChange = event_1.Event.None;
        }
        getEditors(_order) { return []; }
        findEditors(_resource) { return []; }
        getEditorByIndex(_index) { throw new Error('not implemented'); }
        getIndexOfEditor(_editor) { return -1; }
        isFirst(editor) { return false; }
        isLast(editor) { return false; }
        openEditor(_editor, _options) { throw new Error('not implemented'); }
        openEditors(_editors) { throw new Error('not implemented'); }
        isPinned(_editor) { return false; }
        isSticky(_editor) { return false; }
        isActive(_editor) { return false; }
        contains(candidate) { return false; }
        moveEditor(_editor, _target, _options) { }
        moveEditors(_editors, _target) { }
        copyEditor(_editor, _target, _options) { }
        copyEditors(_editors, _target) { }
        async closeEditor(_editor, options) { return true; }
        async closeEditors(_editors, options) { return true; }
        async closeAllEditors(options) { return true; }
        async replaceEditors(_editors) { }
        pinEditor(_editor) { }
        stickEditor(editor) { }
        unstickEditor(editor) { }
        lock(locked) { }
        focus() { }
        get scopedContextKeyService() { throw new Error('not implemented'); }
        setActive(_isActive) { }
        notifyIndexChanged(_index) { }
        notifyLabelChanged(_label) { }
        dispose() { }
        toJSON() { return Object.create(null); }
        layout(_width, _height) { }
        relayout() { }
        createEditorActions(_menuDisposable) { throw new Error('not implemented'); }
    }
    exports.TestEditorGroupView = TestEditorGroupView;
    class TestEditorGroupAccessor {
        constructor() {
            this.label = '';
            this.windowId = window_1.mainWindow.vscodeWindowId;
            this.groups = [];
            this.partOptions = { ...editor_2.DEFAULT_EDITOR_PART_OPTIONS };
            this.onDidChangeEditorPartOptions = event_1.Event.None;
            this.onDidVisibilityChange = event_1.Event.None;
        }
        getGroup(identifier) { throw new Error('Method not implemented.'); }
        getGroups(order) { throw new Error('Method not implemented.'); }
        activateGroup(identifier) { throw new Error('Method not implemented.'); }
        restoreGroup(identifier) { throw new Error('Method not implemented.'); }
        addGroup(location, direction) { throw new Error('Method not implemented.'); }
        mergeGroup(group, target, options) { throw new Error('Method not implemented.'); }
        moveGroup(group, location, direction) { throw new Error('Method not implemented.'); }
        copyGroup(group, location, direction) { throw new Error('Method not implemented.'); }
        removeGroup(group) { throw new Error('Method not implemented.'); }
        arrangeGroups(arrangement, target) { throw new Error('Method not implemented.'); }
        toggleMaximizeGroup(group) { throw new Error('Method not implemented.'); }
        toggleExpandGroup(group) { throw new Error('Method not implemented.'); }
    }
    exports.TestEditorGroupAccessor = TestEditorGroupAccessor;
    class TestEditorService extends lifecycle_2.Disposable {
        get activeTextEditorControl() { return this._activeTextEditorControl; }
        set activeTextEditorControl(value) { this._activeTextEditorControl = value; }
        get activeEditor() { return this._activeEditor; }
        set activeEditor(value) { this._activeEditor = value; }
        constructor(editorGroupService) {
            super();
            this.editorGroupService = editorGroupService;
            this.onDidActiveEditorChange = event_1.Event.None;
            this.onDidVisibleEditorsChange = event_1.Event.None;
            this.onDidEditorsChange = event_1.Event.None;
            this.onDidCloseEditor = event_1.Event.None;
            this.onDidOpenEditorFail = event_1.Event.None;
            this.onDidMostRecentlyActiveEditorsChange = event_1.Event.None;
            this.editors = [];
            this.mostRecentlyActiveEditors = [];
            this.visibleEditorPanes = [];
            this.visibleTextEditorControls = [];
            this.visibleEditors = [];
            this.count = this.editors.length;
        }
        createScoped(editorGroupsContainer) { return this; }
        getEditors() { return []; }
        findEditors() { return []; }
        async openEditor(editor, optionsOrGroup, group) {
            // openEditor takes ownership of the input, register it to the TestEditorService
            // so it's not marked as leaked during tests.
            if ('dispose' in editor) {
                this._register(editor);
            }
            return undefined;
        }
        async closeEditor(editor, options) { }
        async closeEditors(editors, options) { }
        doResolveEditorOpenRequest(editor) {
            if (!this.editorGroupService) {
                return undefined;
            }
            return [this.editorGroupService.activeGroup, editor, undefined];
        }
        openEditors(_editors, _group) { throw new Error('not implemented'); }
        isOpened(_editor) { return false; }
        isVisible(_editor) { return false; }
        replaceEditors(_editors, _group) { return Promise.resolve(undefined); }
        save(editors, options) { throw new Error('Method not implemented.'); }
        saveAll(options) { throw new Error('Method not implemented.'); }
        revert(editors, options) { throw new Error('Method not implemented.'); }
        revertAll(options) { throw new Error('Method not implemented.'); }
    }
    exports.TestEditorService = TestEditorService;
    class TestFileService {
        constructor() {
            this._onDidFilesChange = new event_1.Emitter();
            this._onDidRunOperation = new event_1.Emitter();
            this._onDidChangeFileSystemProviderCapabilities = new event_1.Emitter();
            this.onWillActivateFileSystemProvider = event_1.Event.None;
            this.onDidWatchError = event_1.Event.None;
            this.content = 'Hello Html';
            this.readonly = false;
            this.notExistsSet = new map_1.ResourceMap();
            this.readShouldThrowError = undefined;
            this.writeShouldThrowError = undefined;
            this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
            this.providers = new Map();
            this.watches = [];
        }
        get onDidFilesChange() { return this._onDidFilesChange.event; }
        fireFileChanges(event) { this._onDidFilesChange.fire(event); }
        get onDidRunOperation() { return this._onDidRunOperation.event; }
        fireAfterOperation(event) { this._onDidRunOperation.fire(event); }
        get onDidChangeFileSystemProviderCapabilities() { return this._onDidChangeFileSystemProviderCapabilities.event; }
        fireFileSystemProviderCapabilitiesChangeEvent(event) { this._onDidChangeFileSystemProviderCapabilities.fire(event); }
        setContent(content) { this.content = content; }
        getContent() { return this.content; }
        getLastReadFileUri() { return this.lastReadFileUri; }
        async resolve(resource, _options) {
            return (0, workbenchTestServices_1.createFileStat)(resource, this.readonly);
        }
        stat(resource) {
            return this.resolve(resource, { resolveMetadata: true });
        }
        async resolveAll(toResolve) {
            const stats = await Promise.all(toResolve.map(resourceAndOption => this.resolve(resourceAndOption.resource, resourceAndOption.options)));
            return stats.map(stat => ({ stat, success: true }));
        }
        async exists(_resource) { return !this.notExistsSet.has(_resource); }
        async readFile(resource, options) {
            if (this.readShouldThrowError) {
                throw this.readShouldThrowError;
            }
            this.lastReadFileUri = resource;
            return {
                ...(0, workbenchTestServices_1.createFileStat)(resource, this.readonly),
                value: buffer_1.VSBuffer.fromString(this.content)
            };
        }
        async readFileStream(resource, options) {
            if (this.readShouldThrowError) {
                throw this.readShouldThrowError;
            }
            this.lastReadFileUri = resource;
            return {
                ...(0, workbenchTestServices_1.createFileStat)(resource, this.readonly),
                value: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString(this.content))
            };
        }
        async writeFile(resource, bufferOrReadable, options) {
            await (0, async_1.timeout)(0);
            if (this.writeShouldThrowError) {
                throw this.writeShouldThrowError;
            }
            return (0, workbenchTestServices_1.createFileStat)(resource, this.readonly);
        }
        move(_source, _target, _overwrite) { return Promise.resolve(null); }
        copy(_source, _target, _overwrite) { return Promise.resolve(null); }
        async cloneFile(_source, _target) { }
        createFile(_resource, _content, _options) { return Promise.resolve(null); }
        createFolder(_resource) { return Promise.resolve(null); }
        registerProvider(scheme, provider) {
            this.providers.set(scheme, provider);
            return (0, lifecycle_2.toDisposable)(() => this.providers.delete(scheme));
        }
        getProvider(scheme) {
            return this.providers.get(scheme);
        }
        async activateProvider(_scheme) { return; }
        async canHandleResource(resource) { return this.hasProvider(resource); }
        hasProvider(resource) { return resource.scheme === network_1.Schemas.file || this.providers.has(resource.scheme); }
        listCapabilities() {
            return [
                { scheme: network_1.Schemas.file, capabilities: 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ },
                ...iterator_1.Iterable.map(this.providers, ([scheme, p]) => { return { scheme, capabilities: p.capabilities }; })
            ];
        }
        hasCapability(resource, capability) {
            if (capability === 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */ && platform_1.isLinux) {
                return true;
            }
            const provider = this.getProvider(resource.scheme);
            return !!(provider && (provider.capabilities & capability));
        }
        async del(_resource, _options) { }
        createWatcher(resource, options) {
            return {
                onDidChange: event_1.Event.None,
                dispose: () => { }
            };
        }
        watch(_resource) {
            this.watches.push(_resource);
            return (0, lifecycle_2.toDisposable)(() => this.watches.splice(this.watches.indexOf(_resource), 1));
        }
        getWriteEncoding(_resource) { return { encoding: 'utf8', hasBOM: false }; }
        dispose() { }
        async canCreateFile(source, options) { return true; }
        async canMove(source, target, overwrite) { return true; }
        async canCopy(source, target, overwrite) { return true; }
        async canDelete(resource, options) { return true; }
    }
    exports.TestFileService = TestFileService;
    class TestWorkingCopyBackupService extends workingCopyBackupService_1.InMemoryWorkingCopyBackupService {
        constructor() {
            super();
            this.resolved = new Set();
        }
        parseBackupContent(textBufferFactory) {
            const textBuffer = textBufferFactory.create(1 /* DefaultEndOfLine.LF */).textBuffer;
            const lineCount = textBuffer.getLineCount();
            const range = new range_1.Range(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
            return textBuffer.getValueInRange(range, 0 /* EndOfLinePreference.TextDefined */);
        }
        async resolve(identifier) {
            this.resolved.add(identifier);
            return super.resolve(identifier);
        }
    }
    exports.TestWorkingCopyBackupService = TestWorkingCopyBackupService;
    function toUntypedWorkingCopyId(resource) {
        return toTypedWorkingCopyId(resource, '');
    }
    exports.toUntypedWorkingCopyId = toUntypedWorkingCopyId;
    function toTypedWorkingCopyId(resource, typeId = 'testBackupTypeId') {
        return { typeId, resource };
    }
    exports.toTypedWorkingCopyId = toTypedWorkingCopyId;
    class InMemoryTestWorkingCopyBackupService extends workingCopyBackupService_2.BrowserWorkingCopyBackupService {
        constructor() {
            const disposables = new lifecycle_2.DisposableStore();
            const environmentService = exports.TestEnvironmentService;
            const logService = new log_1.NullLogService();
            const fileService = disposables.add(new fileService_1.FileService(logService));
            disposables.add(fileService.registerProvider(network_1.Schemas.file, disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider())));
            disposables.add(fileService.registerProvider(network_1.Schemas.vscodeUserData, disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider())));
            super(new workbenchTestServices_1.TestContextService(testWorkspace_1.TestWorkspace), environmentService, fileService, logService);
            this.backupResourceJoiners = [];
            this.discardBackupJoiners = [];
            this.discardedBackups = [];
            this._register(disposables);
        }
        testGetFileService() {
            return this.fileService;
        }
        joinBackupResource() {
            return new Promise(resolve => this.backupResourceJoiners.push(resolve));
        }
        joinDiscardBackup() {
            return new Promise(resolve => this.discardBackupJoiners.push(resolve));
        }
        async backup(identifier, content, versionId, meta, token) {
            await super.backup(identifier, content, versionId, meta, token);
            while (this.backupResourceJoiners.length) {
                this.backupResourceJoiners.pop()();
            }
        }
        async discardBackup(identifier) {
            await super.discardBackup(identifier);
            this.discardedBackups.push(identifier);
            while (this.discardBackupJoiners.length) {
                this.discardBackupJoiners.pop()();
            }
        }
        async getBackupContents(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const fileContents = await this.fileService.readFile(backupResource);
            return fileContents.value.toString();
        }
    }
    exports.InMemoryTestWorkingCopyBackupService = InMemoryTestWorkingCopyBackupService;
    class TestLifecycleService extends lifecycle_2.Disposable {
        constructor() {
            super(...arguments);
            this._onBeforeShutdown = this._register(new event_1.Emitter());
            this._onBeforeShutdownError = this._register(new event_1.Emitter());
            this._onShutdownVeto = this._register(new event_1.Emitter());
            this._onWillShutdown = this._register(new event_1.Emitter());
            this._onDidShutdown = this._register(new event_1.Emitter());
            this.shutdownJoiners = [];
        }
        get onBeforeShutdown() { return this._onBeforeShutdown.event; }
        get onBeforeShutdownError() { return this._onBeforeShutdownError.event; }
        get onShutdownVeto() { return this._onShutdownVeto.event; }
        get onWillShutdown() { return this._onWillShutdown.event; }
        get onDidShutdown() { return this._onDidShutdown.event; }
        async when() { }
        fireShutdown(reason = 2 /* ShutdownReason.QUIT */) {
            this.shutdownJoiners = [];
            this._onWillShutdown.fire({
                join: p => {
                    this.shutdownJoiners.push(p);
                },
                joiners: () => [],
                force: () => { },
                token: cancellation_1.CancellationToken.None,
                reason
            });
        }
        fireBeforeShutdown(event) { this._onBeforeShutdown.fire(event); }
        fireWillShutdown(event) { this._onWillShutdown.fire(event); }
        async shutdown() {
            this.fireShutdown();
        }
    }
    exports.TestLifecycleService = TestLifecycleService;
    class TestBeforeShutdownEvent {
        constructor() {
            this.reason = 1 /* ShutdownReason.CLOSE */;
        }
        veto(value) {
            this.value = value;
        }
        finalVeto(vetoFn) {
            this.value = vetoFn();
            this.finalValue = vetoFn;
        }
    }
    exports.TestBeforeShutdownEvent = TestBeforeShutdownEvent;
    class TestWillShutdownEvent {
        constructor() {
            this.value = [];
            this.joiners = () => [];
            this.reason = 1 /* ShutdownReason.CLOSE */;
            this.token = cancellation_1.CancellationToken.None;
        }
        join(promise, joiner) {
            this.value.push(promise);
        }
        force() { }
    }
    exports.TestWillShutdownEvent = TestWillShutdownEvent;
    class TestTextResourceConfigurationService {
        constructor(configurationService = new testConfigurationService_1.TestConfigurationService()) {
            this.configurationService = configurationService;
        }
        onDidChangeConfiguration() {
            return { dispose() { } };
        }
        getValue(resource, arg2, arg3) {
            const position = position_1.Position.isIPosition(arg2) ? arg2 : null;
            const section = position ? (typeof arg3 === 'string' ? arg3 : undefined) : (typeof arg2 === 'string' ? arg2 : undefined);
            return this.configurationService.getValue(section, { resource });
        }
        inspect(resource, position, section) {
            return this.configurationService.inspect(section, { resource });
        }
        updateValue(resource, key, value, configurationTarget) {
            return this.configurationService.updateValue(key, value);
        }
    }
    exports.TestTextResourceConfigurationService = TestTextResourceConfigurationService;
    class RemoteFileSystemProvider {
        constructor(wrappedFsp, remoteAuthority) {
            this.wrappedFsp = wrappedFsp;
            this.remoteAuthority = remoteAuthority;
            this.capabilities = this.wrappedFsp.capabilities;
            this.onDidChangeCapabilities = this.wrappedFsp.onDidChangeCapabilities;
            this.onDidChangeFile = event_1.Event.map(this.wrappedFsp.onDidChangeFile, changes => changes.map(c => {
                return {
                    type: c.type,
                    resource: c.resource.with({ scheme: network_1.Schemas.vscodeRemote, authority: this.remoteAuthority }),
                };
            }));
        }
        watch(resource, opts) { return this.wrappedFsp.watch(this.toFileResource(resource), opts); }
        stat(resource) { return this.wrappedFsp.stat(this.toFileResource(resource)); }
        mkdir(resource) { return this.wrappedFsp.mkdir(this.toFileResource(resource)); }
        readdir(resource) { return this.wrappedFsp.readdir(this.toFileResource(resource)); }
        delete(resource, opts) { return this.wrappedFsp.delete(this.toFileResource(resource), opts); }
        rename(from, to, opts) { return this.wrappedFsp.rename(this.toFileResource(from), this.toFileResource(to), opts); }
        copy(from, to, opts) { return this.wrappedFsp.copy(this.toFileResource(from), this.toFileResource(to), opts); }
        readFile(resource) { return this.wrappedFsp.readFile(this.toFileResource(resource)); }
        writeFile(resource, content, opts) { return this.wrappedFsp.writeFile(this.toFileResource(resource), content, opts); }
        open(resource, opts) { return this.wrappedFsp.open(this.toFileResource(resource), opts); }
        close(fd) { return this.wrappedFsp.close(fd); }
        read(fd, pos, data, offset, length) { return this.wrappedFsp.read(fd, pos, data, offset, length); }
        write(fd, pos, data, offset, length) { return this.wrappedFsp.write(fd, pos, data, offset, length); }
        readFileStream(resource, opts, token) { return this.wrappedFsp.readFileStream(this.toFileResource(resource), opts, token); }
        toFileResource(resource) { return resource.with({ scheme: network_1.Schemas.file, authority: '' }); }
    }
    exports.RemoteFileSystemProvider = RemoteFileSystemProvider;
    class TestInMemoryFileSystemProvider extends inMemoryFilesystemProvider_1.InMemoryFileSystemProvider {
        get capabilities() {
            return 2 /* FileSystemProviderCapabilities.FileReadWrite */
                | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */
                | 16 /* FileSystemProviderCapabilities.FileReadStream */;
        }
        readFileStream(resource) {
            const BUFFER_SIZE = 64 * 1024;
            const stream = (0, stream_1.newWriteableStream)(data => buffer_1.VSBuffer.concat(data.map(data => buffer_1.VSBuffer.wrap(data))).buffer);
            (async () => {
                try {
                    const data = await this.readFile(resource);
                    let offset = 0;
                    while (offset < data.length) {
                        await (0, async_1.timeout)(0);
                        await stream.write(data.subarray(offset, offset + BUFFER_SIZE));
                        offset += BUFFER_SIZE;
                    }
                    await (0, async_1.timeout)(0);
                    stream.end();
                }
                catch (error) {
                    stream.end(error);
                }
            })();
            return stream;
        }
    }
    exports.TestInMemoryFileSystemProvider = TestInMemoryFileSystemProvider;
    exports.productService = { _serviceBrand: undefined, ...product_1.default };
    class TestHostService {
        constructor() {
            this._hasFocus = true;
            this._onDidChangeFocus = new event_1.Emitter();
            this.onDidChangeFocus = this._onDidChangeFocus.event;
            this._onDidChangeWindow = new event_1.Emitter();
            this.onDidChangeActiveWindow = this._onDidChangeWindow.event;
            this.onDidChangeFullScreen = event_1.Event.None;
            this.colorScheme = theme_1.ColorScheme.DARK;
            this.onDidChangeColorScheme = event_1.Event.None;
        }
        get hasFocus() { return this._hasFocus; }
        async hadLastFocus() { return this._hasFocus; }
        setFocus(focus) {
            this._hasFocus = focus;
            this._onDidChangeFocus.fire(this._hasFocus);
        }
        async restart() { }
        async reload() { }
        async close() { }
        async withExpectedShutdown(expectedShutdownTask) {
            return await expectedShutdownTask();
        }
        async focus() { }
        async moveTop() { }
        async getCursorScreenPoint() { return undefined; }
        async openWindow(arg1, arg2) { }
        async toggleFullScreen() { }
    }
    exports.TestHostService = TestHostService;
    class TestFilesConfigurationService extends filesConfigurationService_1.FilesConfigurationService {
        testOnFilesConfigurationChange(configuration) {
            super.onFilesConfigurationChange(configuration, true);
        }
    }
    exports.TestFilesConfigurationService = TestFilesConfigurationService;
    class TestReadonlyTextFileEditorModel extends textFileEditorModel_1.TextFileEditorModel {
        isReadonly() {
            return true;
        }
    }
    exports.TestReadonlyTextFileEditorModel = TestReadonlyTextFileEditorModel;
    class TestEditorInput extends editorInput_1.EditorInput {
        constructor(resource, _typeId) {
            super();
            this.resource = resource;
            this._typeId = _typeId;
        }
        get typeId() {
            return this._typeId;
        }
        get editorId() {
            return this._typeId;
        }
        resolve() {
            return Promise.resolve(null);
        }
    }
    exports.TestEditorInput = TestEditorInput;
    function registerTestEditor(id, inputs, serializerInputId) {
        const disposables = new lifecycle_2.DisposableStore();
        class TestEditor extends editorPane_1.EditorPane {
            constructor() {
                super(id, telemetryUtils_1.NullTelemetryService, new testThemeService_1.TestThemeService(), disposables.add(new workbenchTestServices_1.TestStorageService()));
                this._scopedContextKeyService = new mockKeybindingService_1.MockContextKeyService();
            }
            async setInput(input, options, context, token) {
                super.setInput(input, options, context, token);
                await input.resolve();
            }
            getId() { return id; }
            layout() { }
            createEditor() { }
            get scopedContextKeyService() {
                return this._scopedContextKeyService;
            }
        }
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_3.EditorPaneDescriptor.create(TestEditor, id, 'Test Editor Control'), inputs));
        if (serializerInputId) {
            class EditorsObserverTestEditorInputSerializer {
                canSerialize(editorInput) {
                    return true;
                }
                serialize(editorInput) {
                    const testEditorInput = editorInput;
                    const testInput = {
                        resource: testEditorInput.resource.toString()
                    };
                    return JSON.stringify(testInput);
                }
                deserialize(instantiationService, serializedEditorInput) {
                    const testInput = JSON.parse(serializedEditorInput);
                    return new TestFileEditorInput(uri_1.URI.parse(testInput.resource), serializerInputId);
                }
            }
            disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer(serializerInputId, EditorsObserverTestEditorInputSerializer));
        }
        return disposables;
    }
    exports.registerTestEditor = registerTestEditor;
    function registerTestFileEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_3.EditorPaneDescriptor.create(TestTextFileEditor, TestTextFileEditor.ID, 'Text File Editor'), [new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)]));
        return disposables;
    }
    exports.registerTestFileEditor = registerTestFileEditor;
    function registerTestResourceEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_3.EditorPaneDescriptor.create(TestTextResourceEditor, TestTextResourceEditor.ID, 'Text Editor'), [
            new descriptors_1.SyncDescriptor(untitledTextEditorInput_1.UntitledTextEditorInput),
            new descriptors_1.SyncDescriptor(textResourceEditorInput_1.TextResourceEditorInput)
        ]));
        return disposables;
    }
    exports.registerTestResourceEditor = registerTestResourceEditor;
    function registerTestSideBySideEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_3.EditorPaneDescriptor.create(sideBySideEditor_1.SideBySideEditor, sideBySideEditor_1.SideBySideEditor.ID, 'Text Editor'), [
            new descriptors_1.SyncDescriptor(sideBySideEditorInput_1.SideBySideEditorInput)
        ]));
        return disposables;
    }
    exports.registerTestSideBySideEditor = registerTestSideBySideEditor;
    class TestFileEditorInput extends editorInput_1.EditorInput {
        constructor(resource, _typeId) {
            super();
            this.resource = resource;
            this._typeId = _typeId;
            this.preferredResource = this.resource;
            this.gotDisposed = false;
            this.gotSaved = false;
            this.gotSavedAs = false;
            this.gotReverted = false;
            this.dirty = false;
            this.fails = false;
            this.disableToUntyped = false;
            this._capabilities = 0 /* EditorInputCapabilities.None */;
            this.movedEditor = undefined;
        }
        get typeId() { return this._typeId; }
        get editorId() { return this._typeId; }
        get capabilities() { return this._capabilities; }
        set capabilities(capabilities) {
            if (this._capabilities !== capabilities) {
                this._capabilities = capabilities;
                this._onDidChangeCapabilities.fire();
            }
        }
        resolve() { return !this.fails ? Promise.resolve(null) : Promise.reject(new Error('fails')); }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            if (other instanceof editorInput_1.EditorInput) {
                return !!(other?.resource && this.resource.toString() === other.resource.toString() && other instanceof TestFileEditorInput && other.typeId === this.typeId);
            }
            return (0, resources_1.isEqual)(this.resource, other.resource) && (this.editorId === other.options?.override || other.options?.override === undefined);
        }
        setPreferredResource(resource) { }
        async setEncoding(encoding) { }
        getEncoding() { return undefined; }
        setPreferredName(name) { }
        setPreferredDescription(description) { }
        setPreferredEncoding(encoding) { }
        setPreferredContents(contents) { }
        setLanguageId(languageId, source) { }
        setPreferredLanguageId(languageId) { }
        setForceOpenAsBinary() { }
        setFailToOpen() {
            this.fails = true;
        }
        async save(groupId, options) {
            this.gotSaved = true;
            this.dirty = false;
            return this;
        }
        async saveAs(groupId, options) {
            this.gotSavedAs = true;
            return this;
        }
        async revert(group, options) {
            this.gotReverted = true;
            this.gotSaved = false;
            this.gotSavedAs = false;
            this.dirty = false;
        }
        toUntyped() {
            if (this.disableToUntyped) {
                return undefined;
            }
            return { resource: this.resource };
        }
        setModified() { this.modified = true; }
        isModified() {
            return this.modified === undefined ? this.dirty : this.modified;
        }
        setDirty() { this.dirty = true; }
        isDirty() {
            return this.dirty;
        }
        isResolved() { return false; }
        dispose() {
            super.dispose();
            this.gotDisposed = true;
        }
        async rename() { return this.movedEditor; }
    }
    exports.TestFileEditorInput = TestFileEditorInput;
    class TestSingletonFileEditorInput extends TestFileEditorInput {
        get capabilities() { return 8 /* EditorInputCapabilities.Singleton */; }
    }
    exports.TestSingletonFileEditorInput = TestSingletonFileEditorInput;
    class TestEditorPart extends editorPart_1.MainEditorPart {
        constructor() {
            super(...arguments);
            this.activePart = this;
            this.mainPart = this;
            this.parts = [this];
            this.onDidCreateAuxiliaryEditorPart = event_1.Event.None;
        }
        testSaveState() {
            return super.saveState();
        }
        clearState() {
            const workspaceMemento = this.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            for (const key of Object.keys(workspaceMemento)) {
                delete workspaceMemento[key];
            }
            const profileMemento = this.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            for (const key of Object.keys(profileMemento)) {
                delete profileMemento[key];
            }
        }
        registerEditorPart(part) {
            return lifecycle_2.Disposable.None;
        }
        createAuxiliaryEditorPart() {
            throw new Error('Method not implemented.');
        }
        getPart(group) { return this; }
    }
    exports.TestEditorPart = TestEditorPart;
    async function createEditorPart(instantiationService, disposables) {
        class TestEditorParts extends editorParts_1.EditorParts {
            createMainEditorPart() {
                this.testMainPart = instantiationService.createInstance(TestEditorPart, this);
                return this.testMainPart;
            }
        }
        const part = disposables.add(instantiationService.createInstance(TestEditorParts)).testMainPart;
        part.create(document.createElement('div'));
        part.layout(1080, 800, 0, 0);
        await part.whenReady;
        return part;
    }
    exports.createEditorPart = createEditorPart;
    class TestListService {
        constructor() {
            this.lastFocusedList = undefined;
        }
        register() {
            return lifecycle_2.Disposable.None;
        }
    }
    exports.TestListService = TestListService;
    class TestPathService {
        constructor(fallbackUserHome = uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/' }), defaultUriScheme = network_1.Schemas.file) {
            this.fallbackUserHome = fallbackUserHome;
            this.defaultUriScheme = defaultUriScheme;
        }
        hasValidBasename(resource, arg2, name) {
            if (typeof arg2 === 'string' || typeof arg2 === 'undefined') {
                return (0, extpath_1.isValidBasename)(arg2 ?? (0, resources_1.basename)(resource));
            }
            return (0, extpath_1.isValidBasename)(name ?? (0, resources_1.basename)(resource));
        }
        get path() { return Promise.resolve(platform_1.isWindows ? path_1.win32 : path_1.posix); }
        userHome(options) {
            return options?.preferLocal ? this.fallbackUserHome : Promise.resolve(this.fallbackUserHome);
        }
        get resolvedUserHome() { return this.fallbackUserHome; }
        async fileURI(path) {
            return uri_1.URI.file(path);
        }
    }
    exports.TestPathService = TestPathService;
    function getLastResolvedFileStat(model) {
        const candidate = model;
        return candidate?.lastResolvedFileStat;
    }
    exports.getLastResolvedFileStat = getLastResolvedFileStat;
    class TestWorkspacesService {
        constructor() {
            this.onDidChangeRecentlyOpened = event_1.Event.None;
        }
        async createUntitledWorkspace(folders, remoteAuthority) { throw new Error('Method not implemented.'); }
        async deleteUntitledWorkspace(workspace) { }
        async addRecentlyOpened(recents) { }
        async removeRecentlyOpened(workspaces) { }
        async clearRecentlyOpened() { }
        async getRecentlyOpened() { return { files: [], workspaces: [] }; }
        async getDirtyWorkspaces() { return []; }
        async enterWorkspace(path) { throw new Error('Method not implemented.'); }
        async getWorkspaceIdentifier(workspacePath) { throw new Error('Method not implemented.'); }
    }
    exports.TestWorkspacesService = TestWorkspacesService;
    class TestTerminalInstanceService {
        constructor() {
            this.onDidCreateInstance = event_1.Event.None;
        }
        convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd) { throw new Error('Method not implemented.'); }
        preparePathForTerminalAsync(path, executable, title, shellType, remoteAuthority) { throw new Error('Method not implemented.'); }
        createInstance(options, target) { throw new Error('Method not implemented.'); }
        async getBackend(remoteAuthority) { throw new Error('Method not implemented.'); }
        didRegisterBackend(remoteAuthority) { throw new Error('Method not implemented.'); }
        getRegisteredBackends() { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalInstanceService = TestTerminalInstanceService;
    class TestTerminalEditorService {
        constructor() {
            this.instances = [];
            this.onDidDisposeInstance = event_1.Event.None;
            this.onDidFocusInstance = event_1.Event.None;
            this.onDidChangeInstanceCapability = event_1.Event.None;
            this.onDidChangeActiveInstance = event_1.Event.None;
            this.onDidChangeInstances = event_1.Event.None;
        }
        openEditor(instance, editorOptions) { throw new Error('Method not implemented.'); }
        detachInstance(instance) { throw new Error('Method not implemented.'); }
        splitInstance(instanceToSplit, shellLaunchConfig) { throw new Error('Method not implemented.'); }
        revealActiveEditor(preserveFocus) { throw new Error('Method not implemented.'); }
        resolveResource(instance) { throw new Error('Method not implemented.'); }
        reviveInput(deserializedInput) { throw new Error('Method not implemented.'); }
        getInputFromResource(resource) { throw new Error('Method not implemented.'); }
        setActiveInstance(instance) { throw new Error('Method not implemented.'); }
        focusActiveInstance() { throw new Error('Method not implemented.'); }
        getInstanceFromResource(resource) { throw new Error('Method not implemented.'); }
        focusFindWidget() { throw new Error('Method not implemented.'); }
        hideFindWidget() { throw new Error('Method not implemented.'); }
        findNext() { throw new Error('Method not implemented.'); }
        findPrevious() { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalEditorService = TestTerminalEditorService;
    class TestTerminalGroupService {
        constructor() {
            this.instances = [];
            this.groups = [];
            this.activeGroupIndex = 0;
            this.lastAccessedMenu = 'inline-tab';
            this.onDidChangeActiveGroup = event_1.Event.None;
            this.onDidDisposeGroup = event_1.Event.None;
            this.onDidShow = event_1.Event.None;
            this.onDidChangeGroups = event_1.Event.None;
            this.onDidChangePanelOrientation = event_1.Event.None;
            this.onDidDisposeInstance = event_1.Event.None;
            this.onDidFocusInstance = event_1.Event.None;
            this.onDidChangeInstanceCapability = event_1.Event.None;
            this.onDidChangeActiveInstance = event_1.Event.None;
            this.onDidChangeInstances = event_1.Event.None;
        }
        createGroup(instance) { throw new Error('Method not implemented.'); }
        getGroupForInstance(instance) { throw new Error('Method not implemented.'); }
        moveGroup(source, target) { throw new Error('Method not implemented.'); }
        moveGroupToEnd(source) { throw new Error('Method not implemented.'); }
        moveInstance(source, target, side) { throw new Error('Method not implemented.'); }
        unsplitInstance(instance) { throw new Error('Method not implemented.'); }
        joinInstances(instances) { throw new Error('Method not implemented.'); }
        instanceIsSplit(instance) { throw new Error('Method not implemented.'); }
        getGroupLabels() { throw new Error('Method not implemented.'); }
        setActiveGroupByIndex(index) { throw new Error('Method not implemented.'); }
        setActiveGroupToNext() { throw new Error('Method not implemented.'); }
        setActiveGroupToPrevious() { throw new Error('Method not implemented.'); }
        setActiveInstanceByIndex(terminalIndex) { throw new Error('Method not implemented.'); }
        setContainer(container) { throw new Error('Method not implemented.'); }
        showPanel(focus) { throw new Error('Method not implemented.'); }
        hidePanel() { throw new Error('Method not implemented.'); }
        focusTabs() { throw new Error('Method not implemented.'); }
        focusHover() { throw new Error('Method not implemented.'); }
        setActiveInstance(instance) { throw new Error('Method not implemented.'); }
        focusActiveInstance() { throw new Error('Method not implemented.'); }
        getInstanceFromResource(resource) { throw new Error('Method not implemented.'); }
        focusFindWidget() { throw new Error('Method not implemented.'); }
        hideFindWidget() { throw new Error('Method not implemented.'); }
        findNext() { throw new Error('Method not implemented.'); }
        findPrevious() { throw new Error('Method not implemented.'); }
        updateVisibility() { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalGroupService = TestTerminalGroupService;
    class TestTerminalProfileService {
        constructor() {
            this.availableProfiles = [];
            this.contributedProfiles = [];
            this.profilesReady = Promise.resolve();
            this.onDidChangeAvailableProfiles = event_1.Event.None;
        }
        getPlatformKey() { throw new Error('Method not implemented.'); }
        refreshAvailableProfiles() { throw new Error('Method not implemented.'); }
        getDefaultProfileName() { throw new Error('Method not implemented.'); }
        getDefaultProfile() { throw new Error('Method not implemented.'); }
        getContributedDefaultProfile(shellLaunchConfig) { throw new Error('Method not implemented.'); }
        registerContributedProfile(args) { throw new Error('Method not implemented.'); }
        getContributedProfileProvider(extensionIdentifier, id) { throw new Error('Method not implemented.'); }
        registerTerminalProfileProvider(extensionIdentifier, id, profileProvider) { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalProfileService = TestTerminalProfileService;
    class TestTerminalProfileResolverService {
        constructor() {
            this.defaultProfileName = '';
        }
        resolveIcon(shellLaunchConfig) { }
        async resolveShellLaunchConfig(shellLaunchConfig, options) { }
        async getDefaultProfile(options) { return { path: '/default', profileName: 'Default', isDefault: true }; }
        async getDefaultShell(options) { return '/default'; }
        async getDefaultShellArgs(options) { return []; }
        getDefaultIcon() { return codicons_1.Codicon.terminal; }
        async getEnvironment() { return process_1.env; }
        getSafeConfigValue(key, os) { return undefined; }
        getSafeConfigValueFullKey(key) { return undefined; }
        createProfileFromShellAndShellArgs(shell, shellArgs) { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalProfileResolverService = TestTerminalProfileResolverService;
    class TestQuickInputService {
        constructor() {
            this.onShow = event_1.Event.None;
            this.onHide = event_1.Event.None;
            this.quickAccess = undefined;
        }
        async pick(picks, options, token) {
            if (Array.isArray(picks)) {
                return { label: 'selectedPick', description: 'pick description', value: 'selectedPick' };
            }
            else {
                return undefined;
            }
        }
        async input(options, token) { return options ? 'resolved' + options.prompt : 'resolved'; }
        createQuickPick() { throw new Error('not implemented.'); }
        createInputBox() { throw new Error('not implemented.'); }
        createQuickWidget() { throw new Error('Method not implemented.'); }
        focus() { throw new Error('not implemented.'); }
        toggle() { throw new Error('not implemented.'); }
        navigate(next, quickNavigate) { throw new Error('not implemented.'); }
        accept() { throw new Error('not implemented.'); }
        back() { throw new Error('not implemented.'); }
        cancel() { throw new Error('not implemented.'); }
    }
    exports.TestQuickInputService = TestQuickInputService;
    class TestLanguageDetectionService {
        isEnabledForLanguage(languageId) { return false; }
        async detectLanguage(resource, supportedLangs) { return undefined; }
    }
    class TestRemoteAgentService {
        getConnection() { return null; }
        async getEnvironment() { return null; }
        async getRawEnvironment() { return null; }
        async getExtensionHostExitInfo(reconnectionToken) { return null; }
        async getDiagnosticInfo(options) { return undefined; }
        async updateTelemetryLevel(telemetryLevel) { }
        async logTelemetry(eventName, data) { }
        async flushTelemetry() { }
        async getRoundTripTime() { return undefined; }
    }
    exports.TestRemoteAgentService = TestRemoteAgentService;
    class TestRemoteExtensionsScannerService {
        async whenExtensionsReady() { }
        scanExtensions() { throw new Error('Method not implemented.'); }
        scanSingleExtension() { throw new Error('Method not implemented.'); }
    }
    exports.TestRemoteExtensionsScannerService = TestRemoteExtensionsScannerService;
    class TestWorkbenchExtensionEnablementService {
        constructor() {
            this.onEnablementChanged = event_1.Event.None;
        }
        getEnablementState(extension) { return 8 /* EnablementState.EnabledGlobally */; }
        getEnablementStates(extensions, workspaceTypeOverrides) { return []; }
        getDependenciesEnablementStates(extension) { return []; }
        canChangeEnablement(extension) { return true; }
        canChangeWorkspaceEnablement(extension) { return true; }
        isEnabled(extension) { return true; }
        isEnabledEnablementState(enablementState) { return true; }
        isDisabledGlobally(extension) { return false; }
        async setEnablement(extensions, state) { return []; }
        async updateExtensionsEnablementsWhenWorkspaceTrustChanges() { }
    }
    exports.TestWorkbenchExtensionEnablementService = TestWorkbenchExtensionEnablementService;
    class TestWorkbenchExtensionManagementService {
        constructor() {
            this.onInstallExtension = event_1.Event.None;
            this.onDidInstallExtensions = event_1.Event.None;
            this.onUninstallExtension = event_1.Event.None;
            this.onDidUninstallExtension = event_1.Event.None;
            this.onDidUpdateExtensionMetadata = event_1.Event.None;
            this.onProfileAwareInstallExtension = event_1.Event.None;
            this.onProfileAwareDidInstallExtensions = event_1.Event.None;
            this.onProfileAwareUninstallExtension = event_1.Event.None;
            this.onProfileAwareDidUninstallExtension = event_1.Event.None;
            this.onDidChangeProfile = event_1.Event.None;
        }
        installVSIX(location, manifest, installOptions) {
            throw new Error('Method not implemented.');
        }
        installFromLocation(location) {
            throw new Error('Method not implemented.');
        }
        installGalleryExtensions(extensions) {
            throw new Error('Method not implemented.');
        }
        async updateFromGallery(gallery, extension, installOptions) { return extension; }
        zip(extension) {
            throw new Error('Method not implemented.');
        }
        unzip(zipLocation) {
            throw new Error('Method not implemented.');
        }
        getManifest(vsix) {
            throw new Error('Method not implemented.');
        }
        install(vsix, options) {
            throw new Error('Method not implemented.');
        }
        async canInstall(extension) { return false; }
        installFromGallery(extension, options) {
            throw new Error('Method not implemented.');
        }
        uninstall(extension, options) {
            throw new Error('Method not implemented.');
        }
        async reinstallFromGallery(extension) {
            throw new Error('Method not implemented.');
        }
        async getInstalled(type) { return []; }
        getExtensionsControlManifest() {
            throw new Error('Method not implemented.');
        }
        async updateMetadata(local, metadata) { return local; }
        registerParticipant(pariticipant) { }
        async getTargetPlatform() { return "undefined" /* TargetPlatform.UNDEFINED */; }
        async cleanUp() { }
        download() {
            throw new Error('Method not implemented.');
        }
        copyExtensions() { throw new Error('Not Supported'); }
        toggleAppliationScope() { throw new Error('Not Supported'); }
        installExtensionsFromProfile() { throw new Error('Not Supported'); }
        whenProfileChanged(from, to) { throw new Error('Not Supported'); }
    }
    exports.TestWorkbenchExtensionManagementService = TestWorkbenchExtensionManagementService;
    class TestUserDataProfileService {
        constructor() {
            this.onDidChangeCurrentProfile = event_1.Event.None;
            this.currentProfile = (0, userDataProfile_1.toUserDataProfile)('test', 'test', uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }));
        }
        async updateCurrentProfile() { }
        getShortName(profile) { return profile.shortName ?? profile.name; }
    }
    exports.TestUserDataProfileService = TestUserDataProfileService;
    class TestWebExtensionsScannerService {
        constructor() {
            this.onDidChangeProfile = event_1.Event.None;
        }
        async scanSystemExtensions() { return []; }
        async scanUserExtensions() { return []; }
        async scanExtensionsUnderDevelopment() { return []; }
        async copyExtensions() {
            throw new Error('Method not implemented.');
        }
        scanExistingExtension(extensionLocation, extensionType) {
            throw new Error('Method not implemented.');
        }
        addExtension(location, metadata) {
            throw new Error('Method not implemented.');
        }
        addExtensionFromGallery(galleryExtension, metadata) {
            throw new Error('Method not implemented.');
        }
        removeExtension() {
            throw new Error('Method not implemented.');
        }
        updateMetadata(extension, metaData, profileLocation) {
            throw new Error('Method not implemented.');
        }
        scanExtensionManifest(extensionLocation) {
            throw new Error('Method not implemented.');
        }
    }
    exports.TestWebExtensionsScannerService = TestWebExtensionsScannerService;
    async function workbenchTeardown(instantiationService) {
        return instantiationService.invokeFunction(async (accessor) => {
            const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            for (const workingCopy of workingCopyService.workingCopies) {
                await workingCopy.revert();
            }
            for (const group of editorGroupService.groups) {
                await group.closeAllEditors();
            }
            for (const group of editorGroupService.groups) {
                editorGroupService.removeGroup(group);
            }
        });
    }
    exports.workbenchTeardown = workbenchTeardown;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoVGVzdFNlcnZpY2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvdGVzdC9icm93c2VyL3dvcmtiZW5jaFRlc3RTZXJ2aWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEyS2hHLFNBQWdCLHFCQUFxQixDQUFDLG9CQUEyQyxFQUFFLFFBQWE7UUFDL0YsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUNBQWUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN6SSxDQUFDO0lBRkQsc0RBRUM7SUFFRCxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIseUJBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMseUJBQXlCLENBQUM7UUFFN0YsTUFBTSxFQUFFLDRCQUFvQjtRQUU1QixnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQW9CLEVBQUU7WUFDekwsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUNBQWUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDMUwsQ0FBQztRQUVELFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBMkIsRUFBRTtZQUM5QyxPQUFPLEdBQUcsWUFBWSxpQ0FBZSxDQUFDO1FBQ3ZDLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxNQUFhLHNCQUF1QixTQUFRLHVDQUFrQjtRQUUxQyxtQkFBbUIsQ0FBQyxNQUFtQixF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
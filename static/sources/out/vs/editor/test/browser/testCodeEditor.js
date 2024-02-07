/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/languageService", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/common/services/textResourceConfiguration", "vs/editor/test/browser/config/testConfiguration", "vs/editor/test/browser/editorTestServices", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/editor/test/common/services/testEditorWorkerService", "vs/editor/test/common/services/testTextResourcePropertiesService", "vs/editor/test/common/testTextModel", "vs/platform/accessibility/common/accessibility", "vs/platform/accessibility/test/common/testAccessibilityService", "vs/platform/clipboard/common/clipboardService", "vs/platform/clipboard/test/common/testClipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/opener/common/opener", "vs/platform/opener/test/common/nullOpenerService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService"], function (require, exports, lifecycle_1, mock_1, codeEditorService_1, codeEditorWidget_1, language_1, languageConfigurationRegistry_1, editorWorker_1, languageFeatureDebounce_1, languageFeatures_1, languageFeaturesService_1, languageService_1, model_1, modelService_1, textResourceConfiguration_1, testConfiguration_1, editorTestServices_1, testLanguageConfigurationService_1, testEditorWorkerService_1, testTextResourcePropertiesService_1, testTextModel_1, accessibility_1, testAccessibilityService_1, clipboardService_1, testClipboardService_1, commands_1, configuration_1, testConfigurationService_1, contextkey_1, dialogs_1, testDialogService_1, environment_1, descriptors_1, serviceCollection_1, instantiationServiceMock_1, keybinding_1, mockKeybindingService_1, log_1, notification_1, testNotificationService_1, opener_1, nullOpenerService_1, telemetry_1, telemetryUtils_1, themeService_1, testThemeService_1, undoRedo_1, undoRedoService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.instantiateTestCodeEditor = exports.createTestCodeEditor = exports.createCodeEditorServices = exports.withAsyncTestCodeEditor = exports.withTestCodeEditor = exports.TestCodeEditor = void 0;
    class TestCodeEditor extends codeEditorWidget_1.CodeEditorWidget {
        constructor() {
            super(...arguments);
            this._hasTextFocus = false;
        }
        //#region testing overrides
        _createConfiguration(isSimpleWidget, options) {
            return new testConfiguration_1.TestConfiguration(options);
        }
        _createView(viewModel) {
            // Never create a view
            return [null, false];
        }
        setHasTextFocus(hasTextFocus) {
            this._hasTextFocus = hasTextFocus;
        }
        hasTextFocus() {
            return this._hasTextFocus;
        }
        //#endregion
        //#region Testing utils
        getViewModel() {
            return this._modelData ? this._modelData.viewModel : undefined;
        }
        registerAndInstantiateContribution(id, ctor) {
            const r = this._instantiationService.createInstance(ctor, this);
            this._contributions.set(id, r);
            return r;
        }
        registerDisposable(disposable) {
            this._register(disposable);
        }
    }
    exports.TestCodeEditor = TestCodeEditor;
    class TestEditorDomElement {
        constructor() {
            this.parentElement = null;
            this.ownerDocument = document;
            this.document = document;
        }
        setAttribute(attr, value) { }
        removeAttribute(attr) { }
        hasAttribute(attr) { return false; }
        getAttribute(attr) { return undefined; }
        addEventListener(event) { }
        removeEventListener(event) { }
    }
    function withTestCodeEditor(text, options, callback) {
        return _withTestCodeEditor(text, options, callback);
    }
    exports.withTestCodeEditor = withTestCodeEditor;
    async function withAsyncTestCodeEditor(text, options, callback) {
        return _withTestCodeEditor(text, options, callback);
    }
    exports.withAsyncTestCodeEditor = withAsyncTestCodeEditor;
    function isTextModel(arg) {
        return Boolean(arg && arg.uri);
    }
    function _withTestCodeEditor(arg, options, callback) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = createCodeEditorServices(disposables, options.serviceCollection);
        delete options.serviceCollection;
        // create a model if necessary
        let model;
        if (isTextModel(arg)) {
            model = arg;
        }
        else {
            model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, Array.isArray(arg) ? arg.join('\n') : arg));
        }
        const editor = disposables.add(instantiateTestCodeEditor(instantiationService, model, options));
        const viewModel = editor.getViewModel();
        viewModel.setHasFocus(true);
        const result = callback(editor, editor.getViewModel(), instantiationService);
        if (result) {
            return result.then(() => disposables.dispose());
        }
        disposables.dispose();
    }
    function createCodeEditorServices(disposables, services = new serviceCollection_1.ServiceCollection()) {
        const serviceIdentifiers = [];
        const define = (id, ctor) => {
            if (!services.has(id)) {
                services.set(id, new descriptors_1.SyncDescriptor(ctor));
            }
            serviceIdentifiers.push(id);
        };
        const defineInstance = (id, instance) => {
            if (!services.has(id)) {
                services.set(id, instance);
            }
            serviceIdentifiers.push(id);
        };
        define(accessibility_1.IAccessibilityService, testAccessibilityService_1.TestAccessibilityService);
        define(keybinding_1.IKeybindingService, mockKeybindingService_1.MockKeybindingService);
        define(clipboardService_1.IClipboardService, testClipboardService_1.TestClipboardService);
        define(editorWorker_1.IEditorWorkerService, testEditorWorkerService_1.TestEditorWorkerService);
        defineInstance(opener_1.IOpenerService, nullOpenerService_1.NullOpenerService);
        define(notification_1.INotificationService, testNotificationService_1.TestNotificationService);
        define(dialogs_1.IDialogService, testDialogService_1.TestDialogService);
        define(undoRedo_1.IUndoRedoService, undoRedoService_1.UndoRedoService);
        define(language_1.ILanguageService, languageService_1.LanguageService);
        define(languageConfigurationRegistry_1.ILanguageConfigurationService, testLanguageConfigurationService_1.TestLanguageConfigurationService);
        define(configuration_1.IConfigurationService, testConfigurationService_1.TestConfigurationService);
        define(textResourceConfiguration_1.ITextResourcePropertiesService, testTextResourcePropertiesService_1.TestTextResourcePropertiesService);
        define(themeService_1.IThemeService, testThemeService_1.TestThemeService);
        define(log_1.ILogService, log_1.NullLogService);
        define(model_1.IModelService, modelService_1.ModelService);
        define(codeEditorService_1.ICodeEditorService, editorTestServices_1.TestCodeEditorService);
        define(contextkey_1.IContextKeyService, mockKeybindingService_1.MockContextKeyService);
        define(commands_1.ICommandService, editorTestServices_1.TestCommandService);
        define(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryServiceShape);
        define(environment_1.IEnvironmentService, class extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.isBuilt = true;
                this.isExtensionDevelopment = false;
            }
        });
        define(languageFeatureDebounce_1.ILanguageFeatureDebounceService, languageFeatureDebounce_1.LanguageFeatureDebounceService);
        define(languageFeatures_1.ILanguageFeaturesService, languageFeaturesService_1.LanguageFeaturesService);
        const instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService(services, true));
        disposables.add((0, lifecycle_1.toDisposable)(() => {
            for (const id of serviceIdentifiers) {
                const instanceOrDescriptor = services.get(id);
                if (typeof instanceOrDescriptor.dispose === 'function') {
                    instanceOrDescriptor.dispose();
                }
            }
        }));
        return instantiationService;
    }
    exports.createCodeEditorServices = createCodeEditorServices;
    function createTestCodeEditor(model, options = {}) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = createCodeEditorServices(disposables, options.serviceCollection);
        delete options.serviceCollection;
        const editor = instantiateTestCodeEditor(instantiationService, model || null, options);
        editor.registerDisposable(disposables);
        return editor;
    }
    exports.createTestCodeEditor = createTestCodeEditor;
    function instantiateTestCodeEditor(instantiationService, model, options = {}) {
        const codeEditorWidgetOptions = {
            contributions: []
        };
        const editor = instantiationService.createInstance(TestCodeEditor, new TestEditorDomElement(), options, codeEditorWidgetOptions);
        if (typeof options.hasTextFocus === 'undefined') {
            options.hasTextFocus = true;
        }
        editor.setHasTextFocus(options.hasTextFocus);
        editor.setModel(model);
        const viewModel = editor.getViewModel();
        viewModel?.setHasFocus(options.hasTextFocus);
        return editor;
    }
    exports.instantiateTestCodeEditor = instantiateTestCodeEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvZGVFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2Jyb3dzZXIvdGVzdENvZGVFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0VoRyxNQUFhLGNBQWUsU0FBUSxtQ0FBZ0I7UUFBcEQ7O1lBVVMsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFxQi9CLENBQUM7UUE3QkEsMkJBQTJCO1FBQ1Isb0JBQW9CLENBQUMsY0FBdUIsRUFBRSxPQUE2QztZQUM3RyxPQUFPLElBQUkscUNBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNrQixXQUFXLENBQUMsU0FBb0I7WUFDbEQsc0JBQXNCO1lBQ3RCLE9BQU8sQ0FBQyxJQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVNLGVBQWUsQ0FBQyxZQUFxQjtZQUMzQyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNuQyxDQUFDO1FBQ2UsWUFBWTtZQUMzQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUNELFlBQVk7UUFFWix1QkFBdUI7UUFDaEIsWUFBWTtZQUNsQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDaEUsQ0FBQztRQUNNLGtDQUFrQyxDQUFnQyxFQUFVLEVBQUUsSUFBbUU7WUFDdkosTUFBTSxDQUFDLEdBQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxD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
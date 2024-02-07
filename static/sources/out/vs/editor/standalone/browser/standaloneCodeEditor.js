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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/editorAction", "vs/editor/standalone/browser/standaloneServices", "vs/editor/standalone/common/standaloneTheme", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/platform/accessibility/common/accessibility", "vs/editor/common/standaloneStrings", "vs/platform/clipboard/common/clipboardService", "vs/platform/progress/common/progress", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/standalone/browser/standaloneCodeEditorService", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/platform/audioCues/browser/audioCueService", "vs/base/browser/window"], function (require, exports, aria, lifecycle_1, codeEditorService_1, codeEditorWidget_1, editorAction_1, standaloneServices_1, standaloneTheme_1, actions_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, themeService_1, accessibility_1, standaloneStrings_1, clipboardService_1, progress_1, model_1, language_1, standaloneCodeEditorService_1, modesRegistry_1, languageConfigurationRegistry_1, languageFeatures_1, diffEditorWidget_1, audioCueService_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTextModel = exports.StandaloneDiffEditor2 = exports.StandaloneEditor = exports.StandaloneCodeEditor = void 0;
    let LAST_GENERATED_COMMAND_ID = 0;
    let ariaDomNodeCreated = false;
    /**
     * Create ARIA dom node inside parent,
     * or only for the first editor instantiation inside document.body.
     * @param parent container element for ARIA dom node
     */
    function createAriaDomNode(parent) {
        if (!parent) {
            if (ariaDomNodeCreated) {
                return;
            }
            ariaDomNodeCreated = true;
        }
        aria.setARIAContainer(parent || window_1.mainWindow.document.body);
    }
    /**
     * A code editor to be used both by the standalone editor and the standalone diff editor.
     */
    let StandaloneCodeEditor = class StandaloneCodeEditor extends codeEditorWidget_1.CodeEditorWidget {
        constructor(domElement, _options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
            const options = { ..._options };
            options.ariaLabel = options.ariaLabel || standaloneStrings_1.StandaloneCodeEditorNLS.editorViewAccessibleLabel;
            options.ariaLabel = options.ariaLabel + ';' + (standaloneStrings_1.StandaloneCodeEditorNLS.accessibilityHelpMessage);
            super(domElement, options, {}, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
            if (keybindingService instanceof standaloneServices_1.StandaloneKeybindingService) {
                this._standaloneKeybindingService = keybindingService;
            }
            else {
                this._standaloneKeybindingService = null;
            }
            createAriaDomNode(options.ariaContainerElement);
        }
        addCommand(keybinding, handler, context) {
            if (!this._standaloneKeybindingService) {
                console.warn('Cannot add command because the editor is configured with an unrecognized KeybindingService');
                return null;
            }
            const commandId = 'DYNAMIC_' + (++LAST_GENERATED_COMMAND_ID);
            const whenExpression = contextkey_1.ContextKeyExpr.deserialize(context);
            this._standaloneKeybindingService.addDynamicKeybinding(commandId, keybinding, handler, whenExpression);
            return commandId;
        }
        createContextKey(key, defaultValue) {
            return this._contextKeyService.createKey(key, defaultValue);
        }
        addAction(_descriptor) {
            if ((typeof _descriptor.id !== 'string') || (typeof _descriptor.label !== 'string') || (typeof _descriptor.run !== 'function')) {
                throw new Error('Invalid action descriptor, `id`, `label` and `run` are required properties!');
            }
            if (!this._standaloneKeybindingService) {
                console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
                return lifecycle_1.Disposable.None;
            }
            // Read descriptor options
            const id = _descriptor.id;
            const label = _descriptor.label;
            const precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('editorId', this.getId()), contextkey_1.ContextKeyExpr.deserialize(_descriptor.precondition));
            const keybindings = _descriptor.keybindings;
            const keybindingsWhen = contextkey_1.ContextKeyExpr.and(precondition, contextkey_1.ContextKeyExpr.deserialize(_descriptor.keybindingContext));
            const contextMenuGroupId = _descriptor.contextMenuGroupId || null;
            const contextMenuOrder = _descriptor.contextMenuOrder || 0;
            const run = (_accessor, ...args) => {
                return Promise.resolve(_descriptor.run(this, ...args));
            };
            const toDispose = new lifecycle_1.DisposableStore();
            // Generate a unique id to allow the same descriptor.id across multiple editor instances
            const uniqueId = this.getId() + ':' + id;
            // Register the command
            toDispose.add(commands_1.CommandsRegistry.registerCommand(uniqueId, run));
            // Register the context menu item
            if (contextMenuGroupId) {
                const menuItem = {
                    command: {
                        id: uniqueId,
                        title: label
                    },
                    when: precondition,
                    group: contextMenuGroupId,
                    order: contextMenuOrder
                };
                toDispose.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, menuItem));
            }
            // Register the keybindings
            if (Array.isArray(keybindings)) {
                for (const kb of keybindings) {
                    toDispose.add(this._standaloneKeybindingService.addDynamicKeybinding(uniqueId, kb, run, keybindingsWhen));
                }
            }
            // Finally, register an internal editor action
            const internalAction = new editorAction_1.InternalEditorAction(uniqueId, label, label, undefined, precondition, (...args) => Promise.resolve(_descriptor.run(this, ...args)), this._contextKeyService);
            // Store it under the original id, such that trigger with the original id will work
            this._actions.set(id, internalAction);
            toDispose.add((0, lifecycle_1.toDisposable)(() => {
                this._actions.delete(id);
            }));
            return toDispose;
        }
        _triggerCommand(handlerId, payload) {
            if (this._codeEditorService instanceof standaloneCodeEditorService_1.StandaloneCodeEditorService) {
                // Help commands find this editor as the active editor
                try {
                    this._codeEditorService.setActiveCodeEditor(this);
                    super._triggerCommand(handlerId, payload);
                }
                finally {
                    this._codeEditorService.setActiveCodeEditor(null);
                }
            }
            else {
                super._triggerCommand(handlerId, payload);
            }
        }
    };
    exports.StandaloneCodeEditor = StandaloneCodeEditor;
    exports.StandaloneCodeEditor = StandaloneCodeEditor = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, commands_1.ICommandService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, themeService_1.IThemeService),
        __param(8, notification_1.INotificationService),
        __param(9, accessibility_1.IAccessibilityService),
        __param(10, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(11, languageFeatures_1.ILanguageFeaturesService)
    ], StandaloneCodeEditor);
    let StandaloneEditor = class StandaloneEditor extends StandaloneCodeEditor {
        constructor(domElement, _options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, configurationService, accessibilityService, modelService, languageService, languageConfigurationService, languageFeaturesService) {
            const options = { ..._options };
            (0, standaloneServices_1.updateConfigurationService)(configurationService, options, false);
            const themeDomRegistration = themeService.registerEditorContainer(domElement);
            if (typeof options.theme === 'string') {
                themeService.setTheme(options.theme);
            }
            if (typeof options.autoDetectHighContrast !== 'undefined') {
                themeService.setAutoDetectHighContrast(Boolean(options.autoDetectHighContrast));
            }
            const _model = options.model;
            delete options.model;
            super(domElement, options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
            this._configurationService = configurationService;
            this._standaloneThemeService = themeService;
            this._register(themeDomRegistration);
            let model;
            if (typeof _model === 'undefined') {
                const languageId = languageService.getLanguageIdByMimeType(options.language) || options.language || modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
                model = createTextModel(modelService, languageService, options.value || '', languageId, undefined);
                this._ownsModel = true;
            }
            else {
                model = _model;
                this._ownsModel = false;
            }
            this._attachModel(model);
            if (model) {
                const e = {
                    oldModelUrl: null,
                    newModelUrl: model.uri
                };
                this._onDidChangeModel.fire(e);
            }
        }
        dispose() {
            super.dispose();
        }
        updateOptions(newOptions) {
            (0, standaloneServices_1.updateConfigurationService)(this._configurationService, newOptions, false);
            if (typeof newOptions.theme === 'string') {
                this._standaloneThemeService.setTheme(newOptions.theme);
            }
            if (typeof newOptions.autoDetectHighContrast !== 'undefined') {
                this._standaloneThemeService.setAutoDetectHighContrast(Boolean(newOptions.autoDetectHighContrast));
            }
            super.updateOptions(newOptions);
        }
        _postDetachModelCleanup(detachedModel) {
            super._postDetachModelCleanup(detachedModel);
            if (detachedModel && this._ownsModel) {
                detachedModel.dispose();
                this._ownsModel = false;
            }
        }
    };
    exports.StandaloneEditor = StandaloneEditor;
    exports.StandaloneEditor = StandaloneEditor = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, commands_1.ICommandService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, standaloneTheme_1.IStandaloneThemeService),
        __param(8, notification_1.INotificationService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, accessibility_1.IAccessibilityService),
        __param(11, model_1.IModelService),
        __param(12, language_1.ILanguageService),
        __param(13, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(14, languageFeatures_1.ILanguageFeaturesService)
    ], StandaloneEditor);
    let StandaloneDiffEditor2 = class StandaloneDiffEditor2 extends diffEditorWidget_1.DiffEditorWidget {
        constructor(domElement, _options, instantiationService, contextKeyService, codeEditorService, themeService, notificationService, configurationService, contextMenuService, editorProgressService, clipboardService, audioCueService) {
            const options = { ..._options };
            (0, standaloneServices_1.updateConfigurationService)(configurationService, options, true);
            const themeDomRegistration = themeService.registerEditorContainer(domElement);
            if (typeof options.theme === 'string') {
                themeService.setTheme(options.theme);
            }
            if (typeof options.autoDetectHighContrast !== 'undefined') {
                themeService.setAutoDetectHighContrast(Boolean(options.autoDetectHighContrast));
            }
            super(domElement, options, {}, contextKeyService, instantiationService, codeEditorService, audioCueService, editorProgressService);
            this._configurationService = configurationService;
            this._standaloneThemeService = themeService;
            this._register(themeDomRegistration);
        }
        dispose() {
            super.dispose();
        }
        updateOptions(newOptions) {
            (0, standaloneServices_1.updateConfigurationService)(this._configurationService, newOptions, true);
            if (typeof newOptions.theme === 'string') {
                this._standaloneThemeService.setTheme(newOptions.theme);
            }
            if (typeof newOptions.autoDetectHighContrast !== 'undefined') {
                this._standaloneThemeService.setAutoDetectHighContrast(Boolean(newOptions.autoDetectHighContrast));
            }
            super.updateOptions(newOptions);
        }
        _createInnerEditor(instantiationService, container, options) {
            return instantiationService.createInstance(StandaloneCodeEditor, container, options);
        }
        getOriginalEditor() {
            return super.getOriginalEditor();
        }
        getModifiedEditor() {
            return super.getModifiedEditor();
        }
        addCommand(keybinding, handler, context) {
            return this.getModifiedEditor().addCommand(keybinding, handler, context);
        }
        createContextKey(key, defaultValue) {
            return this.getModifiedEditor().createContextKey(key, defaultValue);
        }
        addAction(descriptor) {
            return this.getModifiedEditor().addAction(descriptor);
        }
    };
    exports.StandaloneDiffEditor2 = StandaloneDiffEditor2;
    exports.StandaloneDiffEditor2 = StandaloneDiffEditor2 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, standaloneTheme_1.IStandaloneThemeService),
        __param(6, notification_1.INotificationService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, progress_1.IEditorProgressService),
        __param(10, clipboardService_1.IClipboardService),
        __param(11, audioCueService_1.IAudioCueService)
    ], StandaloneDiffEditor2);
    /**
     * @internal
     */
    function createTextModel(modelService, languageService, value, languageId, uri) {
        value = value || '';
        if (!languageId) {
            const firstLF = value.indexOf('\n');
            let firstLine = value;
            if (firstLF !== -1) {
                firstLine = value.substring(0, firstLF);
            }
            return doCreateModel(modelService, value, languageService.createByFilepathOrFirstLine(uri || null, firstLine), uri);
        }
        return doCreateModel(modelService, value, languageService.createById(languageId), uri);
    }
    exports.createTextModel = createTextModel;
    /**
     * @internal
     */
    function doCreateModel(modelService, value, languageSelection, uri) {
        return modelService.createModel(value, languageSelection, uri);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUNvZGVFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9zdGFuZGFsb25lL2Jyb3dzZXIvc3RhbmRhbG9uZUNvZGVFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNk9oRyxJQUFJLHlCQUF5QixHQUFHLENBQUMsQ0FBQztJQUVsQyxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUMvQjs7OztPQUlHO0lBQ0gsU0FBUyxpQkFBaUIsQ0FBQyxNQUErQjtRQUN6RCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDYixJQUFJLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3hCLE9BQU87WUFDUixDQUFDO1lBQ0Qsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQzNCLENBQUM7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxJQUFJLG1CQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRDs7T0FFRztJQUNJLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsbUNBQWdCO1FBSXpELFlBQ0MsVUFBdUIsRUFDdkIsUUFBd0QsRUFDakMsb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUN4QyxjQUErQixFQUM1QixpQkFBcUMsRUFDckMsaUJBQXFDLEVBQzFDLFlBQTJCLEVBQ3BCLG1CQUF5QyxFQUN4QyxvQkFBMkMsRUFDbkMsNEJBQTJELEVBQ2hFLHVCQUFpRDtZQUUzRSxNQUFNLE9BQU8sR0FBRyxFQUFFLEdBQUcsUUFBUSxFQUFFLENBQUM7WUFDaEMsT0FBTyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLDJDQUF1QixDQUFDLHlCQUF5QixDQUFDO1lBQzNGLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNB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
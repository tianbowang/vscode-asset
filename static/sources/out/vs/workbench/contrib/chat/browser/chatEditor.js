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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/memento", "vs/workbench/contrib/chat/browser/chatEditorInput", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/browser/actions/chatClear"], function (require, exports, contextkey_1, instantiation_1, serviceCollection_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, editorPane_1, memento_1, chatEditorInput_1, chatWidget_1, chatClear_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatEditor = void 0;
    let ChatEditor = class ChatEditor extends editorPane_1.EditorPane {
        get scopedContextKeyService() {
            return this._scopedContextKeyService;
        }
        constructor(telemetryService, themeService, instantiationService, storageService, contextKeyService) {
            super(chatEditorInput_1.ChatEditorInput.EditorID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.contextKeyService = contextKeyService;
        }
        async clear() {
            return this.instantiationService.invokeFunction(chatClear_1.clearChatEditor);
        }
        createEditor(parent) {
            this._scopedContextKeyService = this._register(this.contextKeyService.createScoped(parent));
            const scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
            this.widget = this._register(scopedInstantiationService.createInstance(chatWidget_1.ChatWidget, { resource: true }, { supportsFileReferences: true }, {
                listForeground: colorRegistry_1.editorForeground,
                listBackground: colorRegistry_1.editorBackground,
                inputEditorBackground: colorRegistry_1.inputBackground,
                resultEditorBackground: colorRegistry_1.editorBackground
            }));
            this._register(this.widget.onDidClear(() => this.clear()));
            this.widget.render(parent);
            this.widget.setVisible(true);
        }
        focus() {
            super.focus();
            this.widget?.focusInput();
        }
        clearInput() {
            this.saveState();
            super.clearInput();
        }
        async setInput(input, options, context, token) {
            super.setInput(input, options, context, token);
            const editorModel = await input.resolve();
            if (!editorModel) {
                throw new Error(`Failed to get model for chat editor. id: ${input.sessionId}`);
            }
            if (!this.widget) {
                throw new Error('ChatEditor lifecycle issue: no editor widget');
            }
            this.updateModel(editorModel.model);
        }
        updateModel(model) {
            this._memento = new memento_1.Memento('interactive-session-editor-' + model.sessionId, this.storageService);
            this._viewState = this._memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            this.widget.setModel(model, { ...this._viewState });
        }
        saveState() {
            this.widget?.saveState();
            if (this._memento && this._viewState) {
                const widgetViewState = this.widget.getViewState();
                this._viewState.inputValue = widgetViewState.inputValue;
                this._memento.saveMemento();
            }
        }
        layout(dimension, position) {
            if (this.widget) {
                this.widget.layout(dimension.height, dimension.width);
            }
        }
    };
    exports.ChatEditor = ChatEditor;
    exports.ChatEditor = ChatEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, contextkey_1.IContextKeyService)
    ], ChatEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0J6RixJQUFNLFVBQVUsR0FBaEIsTUFBTSxVQUFXLFNBQVEsdUJBQVU7UUFJekMsSUFBYSx1QkFBdUI7WUFDbkMsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUM7UUFDdEMsQ0FBQztRQUtELFlBQ29CLGdCQUFtQyxFQUN2QyxZQUEyQixFQUNGLG9CQUEyQyxFQUNqRCxjQUErQixFQUM1QixpQkFBcUM7WUFFMUUsS0FBSyxDQUFDLGlDQUFlLENBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUp4Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUM1QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1FBRzNFLENBQUM7UUFFTSxLQUFLLENBQUMsS0FBSztZQUNqQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMkJBQWUsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFa0IsWUFBWSxDQUFDLE1BQW1CO1lBQ2xELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1RixNQUFNLDBCQUEwQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxxQ0FBaUIsQ0FBQyxDQUFDLCtCQUFrQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVwSixJ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
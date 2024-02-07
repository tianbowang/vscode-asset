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
define(["require", "exports", "vs/editor/browser/widget/multiDiffEditorWidget/multiDiffEditorWidget", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/labels", "vs/workbench/browser/parts/editor/editorWithViewState", "vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, multiDiffEditorWidget_1, textResourceConfiguration_1, instantiation_1, storage_1, telemetry_1, themeService_1, labels_1, editorWithViewState_1, multiDiffEditorInput_1, editorGroupsService_1, editorService_1) {
    "use strict";
    var MultiDiffEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MultiDiffEditor = void 0;
    let MultiDiffEditor = class MultiDiffEditor extends editorWithViewState_1.AbstractEditorWithViewState {
        static { MultiDiffEditor_1 = this; }
        static { this.ID = 'multiDiffEditor'; }
        get viewModel() {
            return this._viewModel;
        }
        constructor(instantiationService, telemetryService, themeService, storageService, editorService, editorGroupService, textResourceConfigurationService) {
            super(MultiDiffEditor_1.ID, 'multiDiffEditor', telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
            this._multiDiffEditorWidget = undefined;
        }
        createEditor(parent) {
            this._multiDiffEditorWidget = this._register(this.instantiationService.createInstance(multiDiffEditorWidget_1.MultiDiffEditorWidget, parent, this.instantiationService.createInstance(WorkbenchUIElementFactory)));
            this._register(this._multiDiffEditorWidget.onDidChangeActiveControl(() => {
                this._onDidChangeControl.fire();
            }));
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            this._viewModel = await input.getViewModel();
            this._multiDiffEditorWidget.setViewModel(this._viewModel);
            const viewState = this.loadEditorViewState(input, context);
            if (viewState) {
                this._multiDiffEditorWidget.setViewState(viewState);
            }
        }
        async clearInput() {
            await super.clearInput();
            this._multiDiffEditorWidget.setViewModel(undefined);
        }
        layout(dimension) {
            this._multiDiffEditorWidget.layout(dimension);
        }
        getControl() {
            return this._multiDiffEditorWidget.getActiveControl();
        }
        computeEditorViewState(resource) {
            return this._multiDiffEditorWidget.getViewState();
        }
        tracksEditorViewState(input) {
            return input instanceof multiDiffEditorInput_1.MultiDiffEditorInput;
        }
        toEditorViewStateResource(input) {
            return input.resource;
        }
        tryGetCodeEditor(resource) {
            return this._multiDiffEditorWidget.tryGetCodeEditor(resource);
        }
    };
    exports.MultiDiffEditor = MultiDiffEditor;
    exports.MultiDiffEditor = MultiDiffEditor = MultiDiffEditor_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, themeService_1.IThemeService),
        __param(3, storage_1.IStorageService),
        __param(4, editorService_1.IEditorService),
        __param(5, editorGroupsService_1.IEditorGroupsService),
        __param(6, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], MultiDiffEditor);
    let WorkbenchUIElementFactory = class WorkbenchUIElementFactory {
        constructor(_instantiationService) {
            this._instantiationService = _instantiationService;
        }
        createResourceLabel(element) {
            const label = this._instantiationService.createInstance(labels_1.ResourceLabel, element, {});
            return {
                setUri(uri, options = {}) {
                    if (!uri) {
                        label.element.clear();
                    }
                    else {
                        label.element.setFile(uri, { strikethrough: options.strikethrough });
                    }
                },
                dispose() {
                    label.dispose();
                }
            };
        }
    };
    WorkbenchUIElementFactory = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], WorkbenchUIElementFactory);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlEaWZmRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tdWx0aURpZmZFZGl0b3IvYnJvd3Nlci9tdWx0aURpZmZFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTJCekYsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSxpREFBc0Q7O2lCQUMxRSxPQUFFLEdBQUcsaUJBQWlCLEFBQXBCLENBQXFCO1FBS3ZDLElBQVcsU0FBUztZQUNuQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUVELFlBQ3dCLG9CQUEwQyxFQUM5QyxnQkFBbUMsRUFDdkMsWUFBMkIsRUFDekIsY0FBK0IsRUFDaEMsYUFBNkIsRUFDdkIsa0JBQXdDLEVBQzNCLGdDQUFtRTtZQUV0RyxLQUFLLENBQ0osaUJBQWUsQ0FBQyxFQUFFLEVBQ2xCLGlCQUFpQixFQUNqQixnQkFBZ0IsRUFDaEIsb0JBQW9CLEVBQ3BCLGNBQWMsRUFDZCxnQ0FBZ0MsRUFDaEMsWUFBWSxFQUNaLGFBQWEsRUFDYixrQkFBa0IsQ0FDbEIsQ0FBQztZQTFCSywyQkFBc0IsR0FBc0MsU0FBUyxDQUFDO1FBMkI5RSxDQUFDO1FBRVMsWUFBWSxDQUFDLE1BQW1CO1lBQ3pDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQ3BGLDZDQUFxQixFQUNyQixNQUFNLEVBQ04sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUNuRSxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3hF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
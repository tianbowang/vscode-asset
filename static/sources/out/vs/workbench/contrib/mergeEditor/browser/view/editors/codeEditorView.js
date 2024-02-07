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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/editorExtensions", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/core/selection", "vs/editor/contrib/codelens/browser/codelensController", "vs/editor/contrib/folding/browser/folding", "vs/platform/actions/browser/toolbar", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/editor/editor", "vs/workbench/contrib/mergeEditor/browser/utils"], function (require, exports, dom_1, event_1, lifecycle_1, observable_1, editorExtensions_1, codeEditorWidget_1, selection_1, codelensController_1, folding_1, toolbar_1, instantiation_1, editor_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TitleMenu = exports.createSelectionsAutorun = exports.CodeEditorView = void 0;
    class CodeEditorView extends lifecycle_1.Disposable {
        updateOptions(newOptions) {
            this.editor.updateOptions(newOptions);
        }
        constructor(instantiationService, viewModel, configurationService) {
            super();
            this.instantiationService = instantiationService;
            this.viewModel = viewModel;
            this.configurationService = configurationService;
            this.model = this.viewModel.map(m => /** @description model */ m?.model);
            this.htmlElements = (0, dom_1.h)('div.code-view', [
                (0, dom_1.h)('div.header@header', [
                    (0, dom_1.h)('span.title@title'),
                    (0, dom_1.h)('span.description@description'),
                    (0, dom_1.h)('span.detail@detail'),
                    (0, dom_1.h)('span.toolbar@toolbar'),
                ]),
                (0, dom_1.h)('div.container', [
                    (0, dom_1.h)('div.gutter@gutterDiv'),
                    (0, dom_1.h)('div@editor'),
                ]),
            ]);
            this._onDidViewChange = new event_1.Emitter();
            this.view = {
                element: this.htmlElements.root,
                minimumWidth: editor_1.DEFAULT_EDITOR_MIN_DIMENSIONS.width,
                maximumWidth: editor_1.DEFAULT_EDITOR_MAX_DIMENSIONS.width,
                minimumHeight: editor_1.DEFAULT_EDITOR_MIN_DIMENSIONS.height,
                maximumHeight: editor_1.DEFAULT_EDITOR_MAX_DIMENSIONS.height,
                onDidChange: this._onDidViewChange.event,
                layout: (width, height, top, left) => {
                    (0, utils_1.setStyle)(this.htmlElements.root, { width, height, top, left });
                    this.editor.layout({
                        width: width - this.htmlElements.gutterDiv.clientWidth,
                        height: height - this.htmlElements.header.clientHeight,
                    });
                }
                // preferredWidth?: number | undefined;
                // preferredHeight?: number | undefined;
                // priority?: LayoutPriority | undefined;
                // snap?: boolean | undefined;
            };
            this.checkboxesVisible = (0, utils_1.observableConfigValue)('mergeEditor.showCheckboxes', false, this.configurationService);
            this.showDeletionMarkers = (0, utils_1.observableConfigValue)('mergeEditor.showDeletionMarkers', true, this.configurationService);
            this.useSimplifiedDecorations = (0, utils_1.observableConfigValue)('mergeEditor.useSimplifiedDecorations', false, this.configurationService);
            this.editor = this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, this.htmlElements.editor, {}, {
                contributions: this.getEditorContributions(),
            });
            this.isFocused = (0, observable_1.observableFromEvent)(event_1.Event.any(this.editor.onDidBlurEditorWidget, this.editor.onDidFocusEditorWidget), () => /** @description editor.hasWidgetFocus */ this.editor.hasWidgetFocus());
            this.cursorPosition = (0, observable_1.observableFromEvent)(this.editor.onDidChangeCursorPosition, () => /** @description editor.getPosition */ this.editor.getPosition());
            this.selection = (0, observable_1.observableFromEvent)(this.editor.onDidChangeCursorSelection, () => /** @description editor.getSelections */ this.editor.getSelections());
            this.cursorLineNumber = this.cursorPosition.map(p => /** @description cursorPosition.lineNumber */ p?.lineNumber);
        }
        getEditorContributions() {
            return editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => c.id !== folding_1.FoldingController.ID && c.id !== codelensController_1.CodeLensContribution.ID);
        }
    }
    exports.CodeEditorView = CodeEditorView;
    function createSelectionsAutorun(codeEditorView, translateRange) {
        const selections = (0, observable_1.derived)(reader => {
            /** @description selections */
            const viewModel = codeEditorView.viewModel.read(reader);
            if (!viewModel) {
                return [];
            }
            const baseRange = viewModel.selectionInBase.read(reader);
            if (!baseRange || baseRange.sourceEditor === codeEditorView) {
                return [];
            }
            return baseRange.rangesInBase.map(r => translateRange(r, viewModel));
        });
        return (0, observable_1.autorun)(reader => {
            /** @description set selections */
            const ranges = selections.read(reader);
            if (ranges.length === 0) {
                return;
            }
            codeEditorView.editor.setSelections(ranges.map(r => new selection_1.Selection(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn)));
        });
    }
    exports.createSelectionsAutorun = createSelectionsAutorun;
    let TitleMenu = class TitleMenu extends lifecycle_1.Disposable {
        constructor(menuId, targetHtmlElement, instantiationService) {
            super();
            const toolbar = instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, targetHtmlElement, menuId, {
                menuOptions: { renderShortTitle: true },
                toolbarOptions: { primaryGroup: (g) => g === 'primary' }
            });
            this._store.add(toolbar);
        }
    };
    exports.TitleMenu = TitleMenu;
    exports.TitleMenu = TitleMenu = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], TitleMenu);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUVkaXRvclZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvdmlldy9lZGl0b3JzL2NvZGVFZGl0b3JWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXNCaEcsTUFBc0IsY0FBZSxTQUFRLHNCQUFVO1FBbUQvQyxhQUFhLENBQUMsVUFBb0M7WUFDeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQW1CRCxZQUNrQixvQkFBMkMsRUFDNUMsU0FBd0QsRUFDdkQsb0JBQTJDO1lBRTVELEtBQUssRUFBRSxDQUFDO1lBSlMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM1QyxjQUFTLEdBQVQsU0FBUyxDQUErQztZQUN2RCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBMUVwRCxVQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFMUQsaUJBQVksR0FBRyxJQUFBLE9BQUMsRUFBQyxlQUFlLEVBQUU7Z0JBQ3BELElBQUEsT0FBQyxFQUFDLG1CQUFtQixFQUFFO29CQUN0QixJQUFBLE9BQUMsRUFBQyxrQkFBa0IsQ0FBQztvQkFDckIsSUFBQSxPQUFDLEVBQUMsOEJBQThCLENBQUM7b0JBQ2pDLElBQUEsT0FBQyxFQUFDLG9CQUFvQixDQUFDO29CQUN2QixJQUFBLE9BQUMsRUFBQyxzQkFBc0IsQ0FBQztpQkFDekIsQ0FBQztnQkFDRixJQUFBLE9BQUMsRUFBQyxlQUFlLEVBQUU7b0JBQ2xCLElBQUEsT0FBQyxFQUFDLHNCQUFzQixDQUFDO29CQUN6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
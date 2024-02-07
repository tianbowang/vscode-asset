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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/errors", "vs/base/common/observable", "vs/editor/common/model", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/colors", "vs/workbench/contrib/mergeEditor/browser/view/editorGutter", "./codeEditorView"], function (require, exports, dom_1, iconLabels_1, errors_1, observable_1, model_1, nls_1, actions_1, configuration_1, instantiation_1, utils_1, colors_1, editorGutter_1, codeEditorView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseCodeEditorView = void 0;
    let BaseCodeEditorView = class BaseCodeEditorView extends codeEditorView_1.CodeEditorView {
        constructor(viewModel, instantiationService, configurationService) {
            super(instantiationService, viewModel, configurationService);
            this.decorations = (0, observable_1.derived)(this, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const textModel = model.base;
                const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                const showDeletionMarkers = this.showDeletionMarkers.read(reader);
                const result = [];
                for (const modifiedBaseRange of model.modifiedBaseRanges.read(reader)) {
                    const range = modifiedBaseRange.baseRange;
                    if (!range) {
                        continue;
                    }
                    const isHandled = model.isHandled(modifiedBaseRange).read(reader);
                    if (!modifiedBaseRange.isConflicting && isHandled && !showNonConflictingChanges) {
                        continue;
                    }
                    const blockClassNames = ['merge-editor-block'];
                    let blockPadding = [0, 0, 0, 0];
                    if (isHandled) {
                        blockClassNames.push('handled');
                    }
                    if (modifiedBaseRange === activeModifiedBaseRange) {
                        blockClassNames.push('focused');
                        blockPadding = [0, 2, 0, 2];
                    }
                    blockClassNames.push('base');
                    const inputToDiffAgainst = viewModel.baseShowDiffAgainst.read(reader);
                    if (inputToDiffAgainst) {
                        for (const diff of modifiedBaseRange.getInputDiffs(inputToDiffAgainst)) {
                            const range = diff.inputRange.toInclusiveRange();
                            if (range) {
                                result.push({
                                    range,
                                    options: {
                                        className: `merge-editor-diff base`,
                                        description: 'Merge Editor',
                                        isWholeLine: true,
                                    }
                                });
                            }
                            for (const diff2 of diff.rangeMappings) {
                                if (showDeletionMarkers || !diff2.inputRange.isEmpty()) {
                                    result.push({
                                        range: diff2.inputRange,
                                        options: {
                                            className: diff2.inputRange.isEmpty() ? `merge-editor-diff-empty-word base` : `merge-editor-diff-word base`,
                                            description: 'Merge Editor',
                                            showIfCollapsed: true,
                                        },
                                    });
                                }
                            }
                        }
                    }
                    result.push({
                        range: range.toInclusiveRangeOrEmpty(),
                        options: {
                            showIfCollapsed: true,
                            blockClassName: blockClassNames.join(' '),
                            blockPadding,
                            blockIsAfterEnd: range.startLineNumber > textModel.getLineCount(),
                            description: 'Merge Editor',
                            minimap: {
                                position: model_1.MinimapPosition.Gutter,
                                color: { id: isHandled ? colors_1.handledConflictMinimapOverViewRulerColor : colors_1.unhandledConflictMinimapOverViewRulerColor },
                            },
                            overviewRuler: modifiedBaseRange.isConflicting ? {
                                position: model_1.OverviewRulerLane.Center,
                                color: { id: isHandled ? colors_1.handledConflictMinimapOverViewRulerColor : colors_1.unhandledConflictMinimapOverViewRulerColor },
                            } : undefined
                        }
                    });
                }
                return result;
            });
            this._register((0, codeEditorView_1.createSelectionsAutorun)(this, (baseRange, viewModel) => baseRange));
            this._register(instantiationService.createInstance(codeEditorView_1.TitleMenu, actions_1.MenuId.MergeBaseToolbar, this.htmlElements.title));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description update checkboxes */
                if (this.checkboxesVisible.read(reader)) {
                    store.add(new editorGutter_1.EditorGutter(this.editor, this.htmlElements.gutterDiv, {
                        getIntersectingGutterItems: (range, reader) => [],
                        createView: (item, target) => { throw new errors_1.BugIndicatingError(); },
                    }));
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update labels & text model */
                const vm = this.viewModel.read(reader);
                if (!vm) {
                    return;
                }
                this.editor.setModel(vm.model.base);
                (0, dom_1.reset)(this.htmlElements.title, ...(0, iconLabels_1.renderLabelWithIcons)((0, nls_1.localize)('base', 'Base')));
                const baseShowDiffAgainst = vm.baseShowDiffAgainst.read(reader);
                let node = undefined;
                if (baseShowDiffAgainst) {
                    const label = (0, nls_1.localize)('compareWith', 'Comparing with {0}', baseShowDiffAgainst === 1 ? vm.model.input1.title : vm.model.input2.title);
                    const tooltip = (0, nls_1.localize)('compareWithTooltip', 'Differences are highlighted with a background color.');
                    node = (0, dom_1.h)('span', { title: tooltip }, [label]).root;
                }
                (0, dom_1.reset)(this.htmlElements.description, ...(node ? [node] : []));
            }));
            this._register((0, utils_1.applyObservableDecorations)(this.editor, this.decorations));
        }
    };
    exports.BaseCodeEditorView = BaseCodeEditorView;
    exports.BaseCodeEditorView = BaseCodeEditorView = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService)
    ], BaseCodeEditorView);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUNvZGVFZGl0b3JWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9icm93c2VyL3ZpZXcvZWRpdG9ycy9iYXNlQ29kZUVkaXRvclZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUJ6RixJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLCtCQUFjO1FBQ3JELFlBQ0MsU0FBd0QsRUFDakMsb0JBQTJDLEVBQzNDLG9CQUEyQztZQUVsRSxLQUFLLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUErQzdDLGdCQUFXLEdBQUcsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDckQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDaEIsT0FBTyxFQUFFLENBQUM7Z0JBQ1gsQ0FBQztnQkFDRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO2dCQUM5QixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUU3QixNQUFNLHVCQUF1QixHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQy9FLE1BQU0seUJBQXlCLEdBQUcsU0FBUyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkYsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVsRSxNQUFNLE1BQU0sR0FBNEIsRUFB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
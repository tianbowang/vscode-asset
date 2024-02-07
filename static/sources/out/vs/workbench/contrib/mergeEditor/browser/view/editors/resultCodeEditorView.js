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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/model", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/colors", "vs/workbench/contrib/mergeEditor/browser/view/editorGutter", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "./codeEditorView"], function (require, exports, dom_1, actionbar_1, iconLabels_1, arrays_1, errors_1, lifecycle_1, observable_1, model_1, nls_1, actions_1, configuration_1, contextkey_1, instantiation_1, label_1, lineRange_1, utils_1, colors_1, editorGutter_1, mergeEditor_1, codeEditorView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResultCodeEditorView = void 0;
    let ResultCodeEditorView = class ResultCodeEditorView extends codeEditorView_1.CodeEditorView {
        constructor(viewModel, instantiationService, _labelService, configurationService) {
            super(instantiationService, viewModel, configurationService);
            this._labelService = _labelService;
            this.decorations = (0, observable_1.derived)(this, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const textModel = model.resultTextModel;
                const result = new Array();
                const baseRangeWithStoreAndTouchingDiffs = (0, utils_1.join)(model.modifiedBaseRanges.read(reader), model.baseResultDiffs.read(reader), (baseRange, diff) => baseRange.baseRange.touches(diff.inputRange)
                    ? arrays_1.CompareResult.neitherLessOrGreaterThan
                    : lineRange_1.LineRange.compareByStart(baseRange.baseRange, diff.inputRange));
                const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                for (const m of baseRangeWithStoreAndTouchingDiffs) {
                    const modifiedBaseRange = m.left;
                    if (modifiedBaseRange) {
                        const blockClassNames = ['merge-editor-block'];
                        let blockPadding = [0, 0, 0, 0];
                        const isHandled = model.isHandled(modifiedBaseRange).read(reader);
                        if (isHandled) {
                            blockClassNames.push('handled');
                        }
                        if (modifiedBaseRange === activeModifiedBaseRange) {
                            blockClassNames.push('focused');
                            blockPadding = [0, 2, 0, 2];
                        }
                        if (modifiedBaseRange.isConflicting) {
                            blockClassNames.push('conflicting');
                        }
                        blockClassNames.push('result');
                        if (!modifiedBaseRange.isConflicting && !showNonConflictingChanges && isHandled) {
                            continue;
                        }
                        const range = model.getLineRangeInResult(modifiedBaseRange.baseRange, reader);
                        result.push({
                            range: range.toInclusiveRangeOrEmpty(),
                            options: {
                                showIfCollapsed: true,
                                blockClassName: blockClassNames.join(' '),
                                blockPadding,
                                blockIsAfterEnd: range.startLineNumber > textModel.getLineCount(),
                                description: 'Result Diff',
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
                    if (!modifiedBaseRange || modifiedBaseRange.isConflicting) {
                        for (const diff of m.rights) {
                            const range = diff.outputRange.toInclusiveRange();
                            if (range) {
                                result.push({
                                    range,
                                    options: {
                                        className: `merge-editor-diff result`,
                                        description: 'Merge Editor',
                                        isWholeLine: true,
                                    }
                                });
                            }
                            if (diff.rangeMappings) {
                                for (const d of diff.rangeMappings) {
                                    result.push({
                                        range: d.outputRange,
                                        options: {
                                            className: `merge-editor-diff-word result`,
                                            description: 'Merge Editor'
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
                return result;
            });
            this.editor.invokeWithinContext(accessor => {
                const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
                const isMergeResultEditor = mergeEditor_1.ctxIsMergeResultEditor.bindTo(contextKeyService);
                isMergeResultEditor.set(true);
                this._register((0, lifecycle_1.toDisposable)(() => isMergeResultEditor.reset()));
            });
            this.htmlElements.gutterDiv.style.width = '5px';
            this.htmlElements.root.classList.add(`result`);
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
                this.editor.setModel(vm.model.resultTextModel);
                (0, dom_1.reset)(this.htmlElements.title, ...(0, iconLabels_1.renderLabelWithIcons)((0, nls_1.localize)('result', 'Result')));
                (0, dom_1.reset)(this.htmlElements.description, ...(0, iconLabels_1.renderLabelWithIcons)(this._labelService.getUriLabel(vm.model.resultTextModel.uri, { relative: true })));
            }));
            const remainingConflictsActionBar = this._register(new actionbar_1.ActionBar(this.htmlElements.detail));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update remainingConflicts label */
                const vm = this.viewModel.read(reader);
                if (!vm) {
                    return;
                }
                const model = vm.model;
                if (!model) {
                    return;
                }
                const count = model.unhandledConflictsCount.read(reader);
                const text = count === 1
                    ? (0, nls_1.localize)('mergeEditor.remainingConflicts', '{0} Conflict Remaining', count)
                    : (0, nls_1.localize)('mergeEditor.remainingConflict', '{0} Conflicts Remaining ', count);
                remainingConflictsActionBar.clear();
                remainingConflictsActionBar.push({
                    class: undefined,
                    enabled: count > 0,
                    id: 'nextConflict',
                    label: text,
                    run() {
                        vm.model.telemetry.reportConflictCounterClicked();
                        vm.goToNextModifiedBaseRange(m => !model.isHandled(m).get());
                    },
                    tooltip: count > 0
                        ? (0, nls_1.localize)('goToNextConflict', 'Go to next conflict')
                        : (0, nls_1.localize)('allConflictHandled', 'All conflicts handled, the merge can be completed now.'),
                });
            }));
            this._register((0, utils_1.applyObservableDecorations)(this.editor, this.decorations));
            this._register((0, codeEditorView_1.createSelectionsAutorun)(this, (baseRange, viewModel) => viewModel.model.translateBaseRangeToResult(baseRange)));
            this._register(instantiationService.createInstance(codeEditorView_1.TitleMenu, actions_1.MenuId.MergeInputResultToolbar, this.htmlElements.toolbar));
        }
    };
    exports.ResultCodeEditorView = ResultCodeEditorView;
    exports.ResultCodeEditorView = ResultCodeEditorView = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, label_1.ILabelService),
        __param(3, configuration_1.IConfigurationService)
    ], ResultCodeEditorView);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0Q29kZUVkaXRvclZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL2Jyb3dzZXIvdmlldy9lZGl0b3JzL3Jlc3VsdENvZGVFZGl0b3JWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXdCekYsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSwrQkFBYztRQUN2RCxZQUNDLFNBQXdELEVBQ2pDLG9CQUEyQyxFQUNuRCxhQUE2QyxFQUNyQyxvQkFBMkM7WUFFbEUsS0FBSyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBSDdCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBb0c1QyxnQkFBVyxHQUFHLElBQUEsb0JBQU8sRUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ3JELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2hCLE9BQU8sRUFBRSxDQUFDO2dCQUNYLENBQUM7Z0JBQ0QsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztnQkFDOUIsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztnQkFDeEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQXlCLENBQUM7Z0JBRWxELE1BQU0sa0NBQWtDLEdBQUcsSUFBQSxZQUFJLEVBQzlDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQ3JDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUNsQyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7b0JBQ2hFLENBQUMsQ0FBQyxzQkFBYSxDQUFDLHdCQUF3QjtvQkFDeEMsQ0FBQyxDQUFDLHFCQUFTLENBQUMsY0FBYyxDQUN6QixTQUFTLENBQUMsU0FBUyxFQUNuQixJQUFJLENBQUMsVUFBVSxDQUNmLENBQ0YsQ0FBQztnQkFFRixNQUFNLHVCQUF1QixHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRS9FLE1BQU0seUJBQXlCLEdBQUcsU0FBUyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFbkYsS0FBSyxNQUFNLENBQUMsSUFBSSxrQ0FBa0MsRUFBRSxDQUFDO29CQUNwRCxNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBRWpDLElBQUksaUJBQWlCLEVBQUUsQ0FBQzt3QkFDdkIsTUFBTSxlQUFlLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO3dCQUMvQyxJQUFJLFlBQVksR0FBK0QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDNUYsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDbEUsSUFBSSxTQUFTLEVBQUUsQ0FBQzs0QkFDZixlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNqQyxDQUFDO3dCQUNELElBQUksaUJBQWlCLEtBQUssdUJBQXVCLEVBQUUsQ0FBQzs0QkFDbkQsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDaEMsWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQzdCLENBQUM7d0JBQ0QsSUFBSSxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQzs0QkFDckMsZUFBZSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDckMsQ0FBQzt3QkFDRCxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUUvQixJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxJQUFJLENBQUMseUJBQXlCLElBQUksU0FBUyxFQUFFLENBQUM7NEJBQ2pGLFNBQVM7d0JBQ1YsQ0FBQzt3QkFFRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUM5RSxNQUFNLENBQUMsSUFBSSxDQUFDOzRCQUNYLEtBQUssRUFBRSxLQUFLLENBQUMsdUJBQXVCLEVBQUU7NEJBQ3RDLE9BQU8sRUFBRTtnQ0FDUixlQUFlLEVBQUUsSUFBSTtnQ0FDckIsY0FBYyxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dDQUN6QyxZQUFZO2dDQUNaLGVBQWUsRUFBRSxLQUFLLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUU7Z0NBQ2pFLFdBQVcsRUFBRSxhQUFhO2dDQUMxQixPQUFPLEVBQUU7b0NBQ1IsUUFBUSxFQUFFLHVCQUFlLENBQUMsTUFBTTtvQ0FDaEMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsaURBQXdDLENBQUMsQ0FBQyxDQUFDLG1EQUEwQyxFQUFFO2lDQUNoSDtnQ0FDRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztvQ0FDaEQsUUFBUSxFQUFFLHlCQUFpQixDQUFDLE1BQU07b0NBQ2xDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLGlEQUF3QyxDQUFDLENBQUMsQ0FBQyxtREFBMEMsRUFBRTtpQ0FDaEgsQ0FBQyxDQUFDLENBQUMsU0FBUzs2QkFDYjt5QkFDRCxDQUFDLENBQUM7b0JBQ0osQ0FBQztvQkFFRCxJQUFJLENBQUMsaUJBQWlCLElBQUksaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUM7d0JBQzNELEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDOzRCQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUM7NEJBQ2xELElBQUksS0FBSyxFQUFFLENBQUM7Z0NBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQztvQ0FDWCxLQUFLO29DQUNMLE9BQU8sRUFBRTt3Q0FDUixTQUFTLEVBQUUsMEJBQTBCO3dDQUNyQyxXQUFXLEVBQUUsY0FBYzt3Q0FDM0IsV0FBVyxFQUFFLElBQUk7cUNBQ2pCO2lDQUNELENBQUMsQ0FBQzs0QkFDSixDQUFDOzRCQUVELElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dDQUN4QixLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQ0FDcEMsTUFBTSxDQUFDLElBQUksQ0FBQzt3Q0FDWCxLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVc7d0NBQ3BCLE9BQU8sRUFBRTs0Q0FDUixTQUFTLEVBQUUsK0JBQStCOzRDQUMxQyxXQUFXLEVBQUUsY0FBYzt5Q0FDM0I7cUNBQ0QsQ0FBQyxDQUFDO2dDQUNKLENBQUM7NEJBQ0YsQ0FBQzt3QkFDRixDQUFDO29CQUNGLENBQUM7Z0JBQ0YsQ0FBQztnQkFDRCxPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBaE1GLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzFDLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLG1CQUFtQixHQUFHLG9DQUFzQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUM3RSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2hELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLFNBQVMsQ0FDYixJQUFBLDZCQUFnQixFQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNsQyxxQ0FBcUM7Z0JBQ3JDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO29CQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksMkJBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFO3dCQUNwRSwwQkFBMEIsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7d0JBQ2pELFVBQVUsRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLE1BQU0sSUFBSSwyQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDakUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUNGLENBQUM7WUFFRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsb0JBQU8sRUFBQyxNQUFNLENBQUMsRUFBRTtnQkFDL0IsOENBQThDO2dCQUM5QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNULE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMvQyxJQUFBLFdBQUssRUFBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUEsaUNBQW9CLEVBQUMsSUFBQSxjQUFRLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEYsSUFBQSxXQUFLLEVBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFBLGlDQUFvQixFQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBR0osTUFBTSwyQkFBMkIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFNUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLG9CQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQy9CLG1EQUFtRDtnQkFDbkQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDVCxPQUFPO2dCQUNSLENBQUM7Z0JBRUQsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztnQkFDdkIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNaLE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUV6RCxNQUFNLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQztvQkFDdkIsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUNULGdDQUFnQyxFQUNoQyx3QkFBd0IsRUFDeEIsS0FBSyxDQUNMO29CQUNELENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFDVCwrQkFBK0IsRUFDL0IsMEJBQTBCLEVBQzFCLEtBQUssQ0FDTCxDQUFDO2dCQUVILDJCQUEyQixDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNwQywyQkFBMkIsQ0FBQyxJQUFJLENBQUM7b0JBQ2hDLEtBQUssRUFBRSxTQUFTO29CQUNoQixPQUFPLEVBQUUsS0FBSyxHQUFHLENBQUM7b0JBQ2xCLEVBQUUsRUFBRSxjQUFjO29CQUNsQixLQUFLLEVBQUUsSUFBSTtvQkFDWCxHQUFHO3dCQUNGLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLDRCQUE0QixFQUFFLENBQUM7d0JBQ2xELEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO29CQUM5RCxDQUFDO29CQUNELE9BQU8sRUFBRSxLQUFLLEdBQUcsQ0FBQzt3QkFDakIsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLHFCQUFxQixDQUFDO3dCQUNyRCxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsd0RBQXdELENBQUM7aUJBQzNGLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFHSixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsa0NBQTBCLEVBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUUxRSxJQUFJLENBQUMsU0FBUyxDQUNiLElBQUEsd0NBQXVCLEVBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQ3RELFNBQVMsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsU0FBUyxDQUFDLENBQ3JELENBQ0QsQ0FBQztZQUVGLElBQUksQ0FBQyxTQUFTLENBQ2Isb0JBQW9CLENBQUMsY0FBYyxDQUNsQywwQkFBUyxFQUNULGdCQUFNLENBQUMsdUJBQXVCLEVBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUN6QixDQUNELENBQUM7UUFDSCxDQUFDO0tBb0dELENBQUE7SUExTVksb0RBQW9CO21DQUFwQixvQkFBb0I7UUFHOUIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLHFDQUFxQixDQUFBO09BTFgsb0JBQW9CLENBME1oQyJ9
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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/toggle/toggle", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/observable", "vs/base/common/strings", "vs/base/common/types", "vs/editor/common/model", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/mergeEditor/browser/utils", "vs/workbench/contrib/mergeEditor/browser/view/colors", "../editorGutter", "./codeEditorView"], function (require, exports, dom_1, iconLabels_1, toggle_1, actions_1, codicons_1, lifecycle_1, numbers_1, observable_1, strings_1, types_1, model_1, nls_1, actions_2, configuration_1, contextView_1, instantiation_1, defaultStyles_1, utils_1, colors_1, editorGutter_1, codeEditorView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeConflictGutterItemView = exports.ModifiedBaseRangeGutterItemModel = exports.InputCodeEditorView = void 0;
    let InputCodeEditorView = class InputCodeEditorView extends codeEditorView_1.CodeEditorView {
        constructor(inputNumber, viewModel, instantiationService, contextMenuService, configurationService) {
            super(instantiationService, viewModel, configurationService);
            this.inputNumber = inputNumber;
            this.otherInputNumber = this.inputNumber === 1 ? 2 : 1;
            this.modifiedBaseRangeGutterItemInfos = (0, observable_1.derivedOpts)({ debugName: `input${this.inputNumber}.modifiedBaseRangeGutterItemInfos` }, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const inputNumber = this.inputNumber;
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                return model.modifiedBaseRanges.read(reader)
                    .filter((r) => r.getInputDiffs(this.inputNumber).length > 0 && (showNonConflictingChanges || r.isConflicting || !model.isHandled(r).read(reader)))
                    .map((baseRange, idx) => new ModifiedBaseRangeGutterItemModel(idx.toString(), baseRange, inputNumber, viewModel));
            });
            this.decorations = (0, observable_1.derivedOpts)({ debugName: `input${this.inputNumber}.decorations` }, reader => {
                const viewModel = this.viewModel.read(reader);
                if (!viewModel) {
                    return [];
                }
                const model = viewModel.model;
                const textModel = (this.inputNumber === 1 ? model.input1 : model.input2).textModel;
                const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
                const result = new Array();
                const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
                const showDeletionMarkers = this.showDeletionMarkers.read(reader);
                const diffWithThis = viewModel.baseCodeEditorView.read(reader) !== undefined && viewModel.baseShowDiffAgainst.read(reader) === this.inputNumber;
                const useSimplifiedDecorations = !diffWithThis && this.useSimplifiedDecorations.read(reader);
                for (const modifiedBaseRange of model.modifiedBaseRanges.read(reader)) {
                    const range = modifiedBaseRange.getInputRange(this.inputNumber);
                    if (!range) {
                        continue;
                    }
                    const blockClassNames = ['merge-editor-block'];
                    let blockPadding = [0, 0, 0, 0];
                    const isHandled = model.isInputHandled(modifiedBaseRange, this.inputNumber).read(reader);
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
                    const inputClassName = this.inputNumber === 1 ? 'input i1' : 'input i2';
                    blockClassNames.push(inputClassName);
                    if (!modifiedBaseRange.isConflicting && !showNonConflictingChanges && isHandled) {
                        continue;
                    }
                    if (useSimplifiedDecorations && !isHandled) {
                        blockClassNames.push('use-simplified-decorations');
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
                    if (!useSimplifiedDecorations && (modifiedBaseRange.isConflicting || !model.isHandled(modifiedBaseRange).read(reader))) {
                        const inputDiffs = modifiedBaseRange.getInputDiffs(this.inputNumber);
                        for (const diff of inputDiffs) {
                            const range = diff.outputRange.toInclusiveRange();
                            if (range) {
                                result.push({
                                    range,
                                    options: {
                                        className: `merge-editor-diff ${inputClassName}`,
                                        description: 'Merge Editor',
                                        isWholeLine: true,
                                    }
                                });
                            }
                            if (diff.rangeMappings) {
                                for (const d of diff.rangeMappings) {
                                    if (showDeletionMarkers || !d.outputRange.isEmpty()) {
                                        result.push({
                                            range: d.outputRange,
                                            options: {
                                                className: d.outputRange.isEmpty() ? `merge-editor-diff-empty-word ${inputClassName}` : `merge-editor-diff-word ${inputClassName}`,
                                                description: 'Merge Editor',
                                                showIfCollapsed: true,
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                return result;
            });
            this.htmlElements.root.classList.add(`input`);
            this._register(new editorGutter_1.EditorGutter(this.editor, this.htmlElements.gutterDiv, {
                getIntersectingGutterItems: (range, reader) => {
                    if (this.checkboxesVisible.read(reader)) {
                        return this.modifiedBaseRangeGutterItemInfos.read(reader);
                    }
                    else {
                        return [];
                    }
                },
                createView: (item, target) => new MergeConflictGutterItemView(item, target, contextMenuService),
            }));
            this._register((0, codeEditorView_1.createSelectionsAutorun)(this, (baseRange, viewModel) => viewModel.model.translateBaseRangeToInput(this.inputNumber, baseRange)));
            this._register(instantiationService.createInstance(codeEditorView_1.TitleMenu, inputNumber === 1 ? actions_2.MenuId.MergeInput1Toolbar : actions_2.MenuId.MergeInput2Toolbar, this.htmlElements.toolbar));
            this._register((0, observable_1.autorunOpts)({ debugName: `input${this.inputNumber}: update labels & text model` }, reader => {
                const vm = this.viewModel.read(reader);
                if (!vm) {
                    return;
                }
                this.editor.setModel(this.inputNumber === 1 ? vm.model.input1.textModel : vm.model.input2.textModel);
                const title = this.inputNumber === 1
                    ? vm.model.input1.title || (0, nls_1.localize)('input1', 'Input 1')
                    : vm.model.input2.title || (0, nls_1.localize)('input2', 'Input 2');
                const description = this.inputNumber === 1
                    ? vm.model.input1.description
                    : vm.model.input2.description;
                const detail = this.inputNumber === 1
                    ? vm.model.input1.detail
                    : vm.model.input2.detail;
                (0, dom_1.reset)(this.htmlElements.title, ...(0, iconLabels_1.renderLabelWithIcons)(title));
                (0, dom_1.reset)(this.htmlElements.description, ...(description ? (0, iconLabels_1.renderLabelWithIcons)(description) : []));
                (0, dom_1.reset)(this.htmlElements.detail, ...(detail ? (0, iconLabels_1.renderLabelWithIcons)(detail) : []));
            }));
            this._register((0, utils_1.applyObservableDecorations)(this.editor, this.decorations));
        }
    };
    exports.InputCodeEditorView = InputCodeEditorView;
    exports.InputCodeEditorView = InputCodeEditorView = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, configuration_1.IConfigurationService)
    ], InputCodeEditorView);
    class ModifiedBaseRangeGutterItemModel {
        constructor(id, baseRange, inputNumber, viewModel) {
            this.id = id;
            this.baseRange = baseRange;
            this.inputNumber = inputNumber;
            this.viewModel = viewModel;
            this.model = this.viewModel.model;
            this.range = this.baseRange.getInputRange(this.inputNumber);
            this.enabled = this.model.isUpToDate;
            this.toggleState = (0, observable_1.derived)(this, reader => {
                const input = this.model
                    .getState(this.baseRange)
                    .read(reader)
                    .getInput(this.inputNumber);
                return input === 2 /* InputState.second */ && !this.baseRange.isOrderRelevant
                    ? 1 /* InputState.first */
                    : input;
            });
            this.state = (0, observable_1.derived)(this, reader => {
                const active = this.viewModel.activeModifiedBaseRange.read(reader);
                if (!this.model.hasBaseRange(this.baseRange)) {
                    return { handled: false, focused: false }; // Invalid state, should only be observed temporarily
                }
                return {
                    handled: this.model.isHandled(this.baseRange).read(reader),
                    focused: this.baseRange === active,
                };
            });
        }
        setState(value, tx) {
            this.viewModel.setState(this.baseRange, this.model
                .getState(this.baseRange)
                .get()
                .withInputValue(this.inputNumber, value), tx, this.inputNumber);
        }
        toggleBothSides() {
            (0, observable_1.transaction)(tx => {
                /** @description Context Menu: toggle both sides */
                const state = this.model
                    .getState(this.baseRange)
                    .get();
                this.model.setState(this.baseRange, state
                    .toggle(this.inputNumber)
                    .toggle(this.inputNumber === 1 ? 2 : 1), true, tx);
            });
        }
        getContextMenuActions() {
            const state = this.model.getState(this.baseRange).get();
            const handled = this.model.isHandled(this.baseRange).get();
            const update = (newState) => {
                (0, observable_1.transaction)(tx => {
                    /** @description Context Menu: Update Base Range State */
                    return this.viewModel.setState(this.baseRange, newState, tx, this.inputNumber);
                });
            };
            function action(id, label, targetState, checked) {
                const action = new actions_1.Action(id, label, undefined, true, () => {
                    update(targetState);
                });
                action.checked = checked;
                return action;
            }
            const both = state.includesInput1 && state.includesInput2;
            return [
                this.baseRange.input1Diffs.length > 0
                    ? action('mergeEditor.acceptInput1', (0, nls_1.localize)('mergeEditor.accept', 'Accept {0}', this.model.input1.title), state.toggle(1), state.includesInput1)
                    : undefined,
                this.baseRange.input2Diffs.length > 0
                    ? action('mergeEditor.acceptInput2', (0, nls_1.localize)('mergeEditor.accept', 'Accept {0}', this.model.input2.title), state.toggle(2), state.includesInput2)
                    : undefined,
                this.baseRange.isConflicting
                    ? (0, utils_1.setFields)(action('mergeEditor.acceptBoth', (0, nls_1.localize)('mergeEditor.acceptBoth', 'Accept Both'), state.withInputValue(1, !both).withInputValue(2, !both), both), { enabled: this.baseRange.canBeCombined })
                    : undefined,
                new actions_1.Separator(),
                this.baseRange.isConflicting
                    ? (0, utils_1.setFields)(action('mergeEditor.swap', (0, nls_1.localize)('mergeEditor.swap', 'Swap'), state.swap(), false), { enabled: !state.kind && (!both || this.baseRange.isOrderRelevant) })
                    : undefined,
                (0, utils_1.setFields)(new actions_1.Action('mergeEditor.markAsHandled', (0, nls_1.localize)('mergeEditor.markAsHandled', 'Mark as Handled'), undefined, true, () => {
                    (0, observable_1.transaction)((tx) => {
                        /** @description Context Menu: Mark as handled */
                        this.model.setHandled(this.baseRange, !handled, tx);
                    });
                }), { checked: handled }),
            ].filter(types_1.isDefined);
        }
    }
    exports.ModifiedBaseRangeGutterItemModel = ModifiedBaseRangeGutterItemModel;
    class MergeConflictGutterItemView extends lifecycle_1.Disposable {
        constructor(item, target, contextMenuService) {
            super();
            this.isMultiLine = (0, observable_1.observableValue)(this, false);
            this.item = (0, observable_1.observableValue)(this, item);
            const checkBox = new toggle_1.Toggle({
                isChecked: false,
                title: '',
                icon: codicons_1.Codicon.check,
                ...defaultStyles_1.defaultToggleStyles
            });
            checkBox.domNode.classList.add('accept-conflict-group');
            this._register((0, dom_1.addDisposableListener)(checkBox.domNode, dom_1.EventType.MOUSE_DOWN, (e) => {
                const item = this.item.get();
                if (!item) {
                    return;
                }
                if (e.button === /* Right */ 2) {
                    e.stopPropagation();
                    e.preventDefault();
                    contextMenuService.showContextMenu({
                        getAnchor: () => checkBox.domNode,
                        getActions: () => item.getContextMenuActions(),
                    });
                }
                else if (e.button === /* Middle */ 1) {
                    e.stopPropagation();
                    e.preventDefault();
                    item.toggleBothSides();
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description Update Checkbox */
                const item = this.item.read(reader);
                const value = item.toggleState.read(reader);
                const iconMap = {
                    [0 /* InputState.excluded */]: { icon: undefined, checked: false, title: (0, nls_1.localize)('accept.excluded', "Accept") },
                    [3 /* InputState.unrecognized */]: { icon: codicons_1.Codicon.circleFilled, checked: false, title: (0, nls_1.localize)('accept.conflicting', "Accept (result is dirty)") },
                    [1 /* InputState.first */]: { icon: codicons_1.Codicon.check, checked: true, title: (0, nls_1.localize)('accept.first', "Undo accept") },
                    [2 /* InputState.second */]: { icon: codicons_1.Codicon.checkAll, checked: true, title: (0, nls_1.localize)('accept.second', "Undo accept (currently second)") },
                };
                const state = iconMap[value];
                checkBox.setIcon(state.icon);
                checkBox.checked = state.checked;
                checkBox.setTitle(state.title);
                if (!item.enabled.read(reader)) {
                    checkBox.disable();
                }
                else {
                    checkBox.enable();
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description Update Checkbox CSS ClassNames */
                const state = this.item.read(reader).state.read(reader);
                const classNames = [
                    'merge-accept-gutter-marker',
                    state.handled && 'handled',
                    state.focused && 'focused',
                    this.isMultiLine.read(reader) ? 'multi-line' : 'single-line',
                ];
                target.className = classNames.filter(c => typeof c === 'string').join(' ');
            }));
            this._register(checkBox.onChange(() => {
                (0, observable_1.transaction)(tx => {
                    /** @description Handle Checkbox Change */
                    this.item.get().setState(checkBox.checked, tx);
                });
            }));
            target.appendChild((0, dom_1.h)('div.background', [strings_1.noBreakWhitespace]).root);
            target.appendChild(this.checkboxDiv = (0, dom_1.h)('div.checkbox', [(0, dom_1.h)('div.checkbox-background', [checkBox.domNode])]).root);
        }
        layout(top, height, viewTop, viewHeight) {
            const checkboxHeight = this.checkboxDiv.clientHeight;
            const middleHeight = height / 2 - checkboxHeight / 2;
            const margin = checkboxHeight;
            let effectiveCheckboxTop = top + middleHeight;
            const preferredViewPortRange = [
                margin,
                viewTop + viewHeight - margin - checkboxHeight
            ];
            const preferredParentRange = [
                top + margin,
                top + height - checkboxHeight - margin
            ];
            if (preferredParentRange[0] < preferredParentRange[1]) {
                effectiveCheckboxTop = (0, numbers_1.clamp)(effectiveCheckboxTop, preferredViewPortRange[0], preferredViewPortRange[1]);
                effectiveCheckboxTop = (0, numbers_1.clamp)(effectiveCheckboxTop, preferredParentRange[0], preferredParentRange[1]);
            }
            this.checkboxDiv.style.top = `${effectiveCheckboxTop - top}px`;
            (0, observable_1.transaction)((tx) => {
                /** @description MergeConflictGutterItemView: Update Is Multi Line */
                this.isMultiLine.set(height > 30, tx);
            });
        }
        update(baseRange) {
            (0, observable_1.transaction)(tx => {
                /** @description MergeConflictGutterItemView: Updating new base range */
                this.item.set(baseRange, tx);
            });
        }
    }
    exports.MergeConflictGutterItemView = MergeConflictGutterItemView;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRDb2RlRWRpdG9yVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci92aWV3L2VkaXRvcnMvaW5wdXRDb2RlRWRpdG9yVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEyQnpGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsK0JBQWM7UUFHdEQsWUFDaUIsV0FBa0IsRUFDbEMsU0FBd0QsRUFDakMsb0JBQTJDLEVBQzdDLGtCQUF1QyxFQUNyQyxvQkFBMkM7WUFFbEUsS0FBSyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBTjdDLGdCQUFXLEdBQVgsV0FBVyxDQUFPO1lBSG5CLHFCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQXFFakQscUNBQWdDLEdBQUcsSUFBQSx3QkFBVyxFQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsSUFBSSxDQUFDLFdBQVcsbUNBQW1DLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDcEosTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFBQyxPQUFPLEVBQUUsQ0FBQztnQkFBQyxDQUFDO2dCQUM5QixNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO2dCQUM5QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUVyQyxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENB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
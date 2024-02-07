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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/editor/browser/editorExtensions", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/contrib/smartSelect/browser/bracketSelections", "vs/editor/contrib/smartSelect/browser/wordSelections", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/base/common/types", "vs/base/common/uri"], function (require, exports, arrays, cancellation_1, errors_1, editorExtensions_1, position_1, range_1, selection_1, editorContextKeys_1, bracketSelections_1, wordSelections_1, nls, actions_1, commands_1, languageFeatures_1, resolverService_1, types_1, uri_1) {
    "use strict";
    var SmartSelectController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.provideSelectionRanges = exports.SmartSelectController = void 0;
    class SelectionRanges {
        constructor(index, ranges) {
            this.index = index;
            this.ranges = ranges;
        }
        mov(fwd) {
            const index = this.index + (fwd ? 1 : -1);
            if (index < 0 || index >= this.ranges.length) {
                return this;
            }
            const res = new SelectionRanges(index, this.ranges);
            if (res.ranges[index].equalsRange(this.ranges[this.index])) {
                // next range equals this range, retry with next-next
                return res.mov(fwd);
            }
            return res;
        }
    }
    let SmartSelectController = class SmartSelectController {
        static { SmartSelectController_1 = this; }
        static { this.ID = 'editor.contrib.smartSelectController'; }
        static get(editor) {
            return editor.getContribution(SmartSelectController_1.ID);
        }
        constructor(_editor, _languageFeaturesService) {
            this._editor = _editor;
            this._languageFeaturesService = _languageFeaturesService;
            this._ignoreSelection = false;
        }
        dispose() {
            this._selectionListener?.dispose();
        }
        async run(forward) {
            if (!this._editor.hasModel()) {
                return;
            }
            const selections = this._editor.getSelections();
            const model = this._editor.getModel();
            if (!this._state) {
                await provideSelectionRanges(this._languageFeaturesService.selectionRangeProvider, model, selections.map(s => s.getPosition()), this._editor.getOption(112 /* EditorOption.smartSelect */), cancellation_1.CancellationToken.None).then(ranges => {
                    if (!arrays.isNonEmptyArray(ranges) || ranges.length !== selections.length) {
                        // invalid result
                        return;
                    }
                    if (!this._editor.hasModel() || !arrays.equals(this._editor.getSelections(), selections, (a, b) => a.equalsSelection(b))) {
                        // invalid editor state
                        return;
                    }
                    for (let i = 0; i < ranges.length; i++) {
                        ranges[i] = ranges[i].filter(range => {
                            // filter ranges inside the selection
                            return range.containsPosition(selections[i].getStartPosition()) && range.containsPosition(selections[i].getEndPosition());
                        });
                        // prepend current selection
                        ranges[i].unshift(selections[i]);
                    }
                    this._state = ranges.map(ranges => new SelectionRanges(0, ranges));
                    // listen to caret move and forget about state
                    this._selectionListener?.dispose();
                    this._selectionListener = this._editor.onDidChangeCursorPosition(() => {
                        if (!this._ignoreSelection) {
                            this._selectionListener?.dispose();
                            this._state = undefined;
                        }
                    });
                });
            }
            if (!this._state) {
                // no state
                return;
            }
            this._state = this._state.map(state => state.mov(forward));
            const newSelections = this._state.map(state => selection_1.Selection.fromPositions(state.ranges[state.index].getStartPosition(), state.ranges[state.index].getEndPosition()));
            this._ignoreSelection = true;
            try {
                this._editor.setSelections(newSelections);
            }
            finally {
                this._ignoreSelection = false;
            }
        }
    };
    exports.SmartSelectController = SmartSelectController;
    exports.SmartSelectController = SmartSelectController = SmartSelectController_1 = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService)
    ], SmartSelectController);
    class AbstractSmartSelect extends editorExtensions_1.EditorAction {
        constructor(forward, opts) {
            super(opts);
            this._forward = forward;
        }
        async run(_accessor, editor) {
            const controller = SmartSelectController.get(editor);
            if (controller) {
                await controller.run(this._forward);
            }
        }
    }
    class GrowSelectionAction extends AbstractSmartSelect {
        constructor() {
            super(true, {
                id: 'editor.action.smartSelect.expand',
                label: nls.localize('smartSelect.expand', "Expand Selection"),
                alias: 'Expand Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */,
                        secondary: [256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */],
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '1_basic',
                    title: nls.localize({ key: 'miSmartSelectGrow', comment: ['&& denotes a mnemonic'] }, "&&Expand Selection"),
                    order: 2
                }
            });
        }
    }
    // renamed command id
    commands_1.CommandsRegistry.registerCommandAlias('editor.action.smartSelect.grow', 'editor.action.smartSelect.expand');
    class ShrinkSelectionAction extends AbstractSmartSelect {
        constructor() {
            super(false, {
                id: 'editor.action.smartSelect.shrink',
                label: nls.localize('smartSelect.shrink', "Shrink Selection"),
                alias: 'Shrink Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */,
                        secondary: [256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */],
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarSelectionMenu,
                    group: '1_basic',
                    title: nls.localize({ key: 'miSmartSelectShrink', comment: ['&& denotes a mnemonic'] }, "&&Shrink Selection"),
                    order: 3
                }
            });
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(SmartSelectController.ID, SmartSelectController, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.registerEditorAction)(GrowSelectionAction);
    (0, editorExtensions_1.registerEditorAction)(ShrinkSelectionAction);
    async function provideSelectionRanges(registry, model, positions, options, token) {
        const providers = registry.all(model)
            .concat(new wordSelections_1.WordSelectionRangeProvider(options.selectSubwords)); // ALWAYS have word based selection range
        if (providers.length === 1) {
            // add word selection and bracket selection when no provider exists
            providers.unshift(new bracketSelections_1.BracketSelectionRangeProvider());
        }
        const work = [];
        const allRawRanges = [];
        for (const provider of providers) {
            work.push(Promise.resolve(provider.provideSelectionRanges(model, positions, token)).then(allProviderRanges => {
                if (arrays.isNonEmptyArray(allProviderRanges) && allProviderRanges.length === positions.length) {
                    for (let i = 0; i < positions.length; i++) {
                        if (!allRawRanges[i]) {
                            allRawRanges[i] = [];
                        }
                        for (const oneProviderRanges of allProviderRanges[i]) {
                            if (range_1.Range.isIRange(oneProviderRanges.range) && range_1.Range.containsPosition(oneProviderRanges.range, positions[i])) {
                                allRawRanges[i].push(range_1.Range.lift(oneProviderRanges.range));
                            }
                        }
                    }
                }
            }, errors_1.onUnexpectedExternalError));
        }
        await Promise.all(work);
        return allRawRanges.map(oneRawRanges => {
            if (oneRawRanges.length === 0) {
                return [];
            }
            // sort all by start/end position
            oneRawRanges.sort((a, b) => {
                if (position_1.Position.isBefore(a.getStartPosition(), b.getStartPosition())) {
                    return 1;
                }
                else if (position_1.Position.isBefore(b.getStartPosition(), a.getStartPosition())) {
                    return -1;
                }
                else if (position_1.Position.isBefore(a.getEndPosition(), b.getEndPosition())) {
                    return -1;
                }
                else if (position_1.Position.isBefore(b.getEndPosition(), a.getEndPosition())) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            // remove ranges that don't contain the former range or that are equal to the
            // former range
            const oneRanges = [];
            let last;
            for (const range of oneRawRanges) {
                if (!last || (range_1.Range.containsRange(range, last) && !range_1.Range.equalsRange(range, last))) {
                    oneRanges.push(range);
                    last = range;
                }
            }
            if (!options.selectLeadingAndTrailingWhitespace) {
                return oneRanges;
            }
            // add ranges that expand trivia at line starts and ends whenever a range
            // wraps onto the a new line
            const oneRangesWithTrivia = [oneRanges[0]];
            for (let i = 1; i < oneRanges.length; i++) {
                const prev = oneRanges[i - 1];
                const cur = oneRanges[i];
                if (cur.startLineNumber !== prev.startLineNumber || cur.endLineNumber !== prev.endLineNumber) {
                    // add line/block range without leading/failing whitespace
                    const rangeNoWhitespace = new range_1.Range(prev.startLineNumber, model.getLineFirstNonWhitespaceColumn(prev.startLineNumber), prev.endLineNumber, model.getLineLastNonWhitespaceColumn(prev.endLineNumber));
                    if (rangeNoWhitespace.containsRange(prev) && !rangeNoWhitespace.equalsRange(prev) && cur.containsRange(rangeNoWhitespace) && !cur.equalsRange(rangeNoWhitespace)) {
                        oneRangesWithTrivia.push(rangeNoWhitespace);
                    }
                    // add line/block range
                    const rangeFull = new range_1.Range(prev.startLineNumber, 1, prev.endLineNumber, model.getLineMaxColumn(prev.endLineNumber));
                    if (rangeFull.containsRange(prev) && !rangeFull.equalsRange(rangeNoWhitespace) && cur.containsRange(rangeFull) && !cur.equalsRange(rangeFull)) {
                        oneRangesWithTrivia.push(rangeFull);
                    }
                }
                oneRangesWithTrivia.push(cur);
            }
            return oneRangesWithTrivia;
        });
    }
    exports.provideSelectionRanges = provideSelectionRanges;
    commands_1.CommandsRegistry.registerCommand('_executeSelectionRangeProvider', async function (accessor, ...args) {
        const [resource, positions] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(resource));
        const registry = accessor.get(languageFeatures_1.ILanguageFeaturesService).selectionRangeProvider;
        const reference = await accessor.get(resolverService_1.ITextModelService).createModelReference(resource);
        try {
            return provideSelectionRanges(registry, reference.object.textEditorModel, positions, { selectLeadingAndTrailingWhitespace: true, selectSubwords: true }, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic21hcnRTZWxlY3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NtYXJ0U2VsZWN0L2Jyb3dzZXIvc21hcnRTZWxlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTZCaEcsTUFBTSxlQUFlO1FBRXBCLFlBQ1UsS0FBYSxFQUNiLE1BQWU7WUFEZixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsV0FBTSxHQUFOLE1BQU0sQ0FBUztRQUNyQixDQUFDO1FBRUwsR0FBRyxDQUFDLEdBQVk7WUFDZixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUM5QyxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM1RCxxREFBcUQ7Z0JBQ3JELE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQixDQUFDO1lBQ0QsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO0tBQ0Q7SUFFTSxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFxQjs7aUJBRWpCLE9BQUUsR0FBRyxzQ0FBc0MsQUFB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
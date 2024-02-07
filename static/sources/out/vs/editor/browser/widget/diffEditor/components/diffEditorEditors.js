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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/widget/diffEditor/features/overviewRulerFeature", "vs/editor/common/config/editorOptions", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/editor/common/core/position"], function (require, exports, event_1, lifecycle_1, observable_1, overviewRulerFeature_1, editorOptions_1, nls_1, instantiation_1, keybinding_1, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorEditors = void 0;
    let DiffEditorEditors = class DiffEditorEditors extends lifecycle_1.Disposable {
        get onDidContentSizeChange() { return this._onDidContentSizeChange.event; }
        constructor(originalEditorElement, modifiedEditorElement, _options, codeEditorWidgetOptions, _createInnerEditor, _instantiationService, _keybindingService) {
            super();
            this.originalEditorElement = originalEditorElement;
            this.modifiedEditorElement = modifiedEditorElement;
            this._options = _options;
            this._createInnerEditor = _createInnerEditor;
            this._instantiationService = _instantiationService;
            this._keybindingService = _keybindingService;
            this._onDidContentSizeChange = this._register(new event_1.Emitter());
            this.original = this._register(this._createLeftHandSideEditor(_options.editorOptions.get(), codeEditorWidgetOptions.originalEditor || {}));
            this.modified = this._register(this._createRightHandSideEditor(_options.editorOptions.get(), codeEditorWidgetOptions.modifiedEditor || {}));
            this.modifiedModel = (0, observable_1.observableFromEvent)(this.modified.onDidChangeModel, () => /** @description modified.model */ this.modified.getModel());
            this.modifiedScrollTop = (0, observable_1.observableFromEvent)(this.modified.onDidScrollChange, () => /** @description modified.getScrollTop */ this.modified.getScrollTop());
            this.modifiedScrollHeight = (0, observable_1.observableFromEvent)(this.modified.onDidScrollChange, () => /** @description modified.getScrollHeight */ this.modified.getScrollHeight());
            this.modifiedSelections = (0, observable_1.observableFromEvent)(this.modified.onDidChangeCursorSelection, () => this.modified.getSelections() ?? []);
            this.modifiedCursor = (0, observable_1.observableFromEvent)(this.modified.onDidChangeCursorPosition, () => this.modified.getPosition() ?? new position_1.Position(1, 1));
            this._register((0, observable_1.autorunHandleChanges)({
                createEmptyChangeSummary: () => ({}),
                handleChange: (ctx, changeSummary) => {
                    if (ctx.didChange(_options.editorOptions)) {
                        Object.assign(changeSummary, ctx.change.changedOptions);
                    }
                    return true;
                }
            }, (reader, changeSummary) => {
                /** @description update editor options */
                _options.editorOptions.read(reader);
                this._options.renderSideBySide.read(reader);
                this.modified.updateOptions(this._adjustOptionsForRightHandSide(reader, changeSummary));
                this.original.updateOptions(this._adjustOptionsForLeftHandSide(reader, changeSummary));
            }));
        }
        _createLeftHandSideEditor(options, codeEditorWidgetOptions) {
            const leftHandSideOptions = this._adjustOptionsForLeftHandSide(undefined, options);
            const editor = this._constructInnerEditor(this._instantiationService, this.originalEditorElement, leftHandSideOptions, codeEditorWidgetOptions);
            editor.setContextValue('isInDiffLeftEditor', true);
            return editor;
        }
        _createRightHandSideEditor(options, codeEditorWidgetOptions) {
            const rightHandSideOptions = this._adjustOptionsForRightHandSide(undefined, options);
            const editor = this._constructInnerEditor(this._instantiationService, this.modifiedEditorElement, rightHandSideOptions, codeEditorWidgetOptions);
            editor.setContextValue('isInDiffRightEditor', true);
            return editor;
        }
        _constructInnerEditor(instantiationService, container, options, editorWidgetOptions) {
            const editor = this._createInnerEditor(instantiationService, container, options, editorWidgetOptions);
            this._register(editor.onDidContentSizeChange(e => {
                const width = this.original.getContentWidth() + this.modified.getContentWidth() + overviewRulerFeature_1.OverviewRulerFeature.ENTIRE_DIFF_OVERVIEW_WIDTH;
                const height = Math.max(this.modified.getContentHeight(), this.original.getContentHeight());
                this._onDidContentSizeChange.fire({
                    contentHeight: height,
                    contentWidth: width,
                    contentHeightChanged: e.contentHeightChanged,
                    contentWidthChanged: e.contentWidthChanged
                });
            }));
            return editor;
        }
        _adjustOptionsForLeftHandSide(_reader, changedOptions) {
            const result = this._adjustOptionsForSubEditor(changedOptions);
            if (!this._options.renderSideBySide.get()) {
                // never wrap hidden editor
                result.wordWrapOverride1 = 'off';
                result.wordWrapOverride2 = 'off';
                result.stickyScroll = { enabled: false };
                // Disable unicode highlighting for the original side in inline mode, as they are not shown anyway.
                result.unicodeHighlight = { nonBasicASCII: false, ambiguousCharacters: false, invisibleCharacters: false };
            }
            else {
                result.unicodeHighlight = this._options.editorOptions.get().unicodeHighlight || {};
                result.wordWrapOverride1 = this._options.diffWordWrap.get();
            }
            result.glyphMargin = this._options.renderSideBySide.get();
            if (changedOptions.originalAriaLabel) {
                result.ariaLabel = changedOptions.originalAriaLabel;
            }
            result.ariaLabel = this._updateAriaLabel(result.ariaLabel);
            result.readOnly = !this._options.originalEditable.get();
            result.dropIntoEditor = { enabled: !result.readOnly };
            result.extraEditorClassName = 'original-in-monaco-diff-editor';
            return result;
        }
        _adjustOptionsForRightHandSide(reader, changedOptions) {
            const result = this._adjustOptionsForSubEditor(changedOptions);
            if (changedOptions.modifiedAriaLabel) {
                result.ariaLabel = changedOptions.modifiedAriaLabel;
            }
            result.ariaLabel = this._updateAriaLabel(result.ariaLabel);
            result.wordWrapOverride1 = this._options.diffWordWrap.get();
            result.revealHorizontalRightPadding = editorOptions_1.EditorOptions.revealHorizontalRightPadding.defaultValue + overviewRulerFeature_1.OverviewRulerFeature.ENTIRE_DIFF_OVERVIEW_WIDTH;
            result.scrollbar.verticalHasArrows = false;
            result.extraEditorClassName = 'modified-in-monaco-diff-editor';
            return result;
        }
        _adjustOptionsForSubEditor(options) {
            const clonedOptions = {
                ...options,
                dimension: {
                    height: 0,
                    width: 0
                },
            };
            clonedOptions.inDiffEditor = true;
            clonedOptions.automaticLayout = false;
            // Clone scrollbar options before changing them
            clonedOptions.scrollbar = { ...(clonedOptions.scrollbar || {}) };
            clonedOptions.folding = false;
            clonedOptions.codeLens = this._options.diffCodeLens.get();
            clonedOptions.fixedOverflowWidgets = true;
            // Clone minimap options before changing them
            clonedOptions.minimap = { ...(clonedOptions.minimap || {}) };
            clonedOptions.minimap.enabled = false;
            if (this._options.hideUnchangedRegions.get()) {
                clonedOptions.stickyScroll = { enabled: false };
            }
            else {
                clonedOptions.stickyScroll = this._options.editorOptions.get().stickyScroll;
            }
            return clonedOptions;
        }
        _updateAriaLabel(ariaLabel) {
            if (!ariaLabel) {
                ariaLabel = '';
            }
            const ariaNavigationTip = (0, nls_1.localize)('diff-aria-navigation-tip', ' use {0} to open the accessibility help.', this._keybindingService.lookupKeybinding('editor.action.accessibilityHelp')?.getAriaLabel());
            if (this._options.accessibilityVerbose.get()) {
                return ariaLabel + ariaNavigationTip;
            }
            else if (ariaLabel) {
                return ariaLabel.replaceAll(ariaNavigationTip, '');
            }
            return '';
        }
    };
    exports.DiffEditorEditors = DiffEditorEditors;
    exports.DiffEditorEditors = DiffEditorEditors = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, keybinding_1.IKeybindingService)
    ], DiffEditorEditors);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvckVkaXRvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL2NvbXBvbmVudHMvZGlmZkVkaXRvckVkaXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0J6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHNCQUFVO1FBS2hELElBQVcsc0JBQXNCLEtBQUssT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQVVsRixZQUNrQixxQkFBa0MsRUFDbEMscUJBQWtDLEVBQ2xDLFFBQTJCLEVBQzVDLHVCQUFxRCxFQUNwQyxrQkFBK0wsRUFDekwscUJBQTZELEVBQ2hFLGtCQUF1RDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQVJTLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBYTtZQUNsQywwQkFBcUIsR0FBckIscUJBQXFCLENBQWE7WUFDbEMsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFFM0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE2SztZQUN4SywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQy9DLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFsQjNELDRCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTRCLENBQUMsQ0FBQztZQXNCbEcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxFQUFFLHVCQUF1QixDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNB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
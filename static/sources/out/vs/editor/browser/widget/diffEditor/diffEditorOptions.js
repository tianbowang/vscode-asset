/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observable", "vs/editor/common/config/diffEditor", "vs/editor/common/config/editorOptions"], function (require, exports, observable_1, diffEditor_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorOptions = void 0;
    class DiffEditorOptions {
        get editorOptions() { return this._options; }
        constructor(options) {
            this._diffEditorWidth = (0, observable_1.observableValue)(this, 0);
            this.couldShowInlineViewBecauseOfSize = (0, observable_1.derived)(this, reader => this._options.read(reader).renderSideBySide && this._diffEditorWidth.read(reader) <= this._options.read(reader).renderSideBySideInlineBreakpoint);
            this.renderOverviewRuler = (0, observable_1.derived)(this, reader => this._options.read(reader).renderOverviewRuler);
            this.renderSideBySide = (0, observable_1.derived)(this, reader => this._options.read(reader).renderSideBySide
                && !(this._options.read(reader).useInlineViewWhenSpaceIsLimited && this.couldShowInlineViewBecauseOfSize.read(reader)));
            this.readOnly = (0, observable_1.derived)(this, reader => this._options.read(reader).readOnly);
            this.shouldRenderRevertArrows = (0, observable_1.derived)(this, reader => {
                if (!this._options.read(reader).renderMarginRevertIcon) {
                    return false;
                }
                if (!this.renderSideBySide.read(reader)) {
                    return false;
                }
                if (this.readOnly.read(reader)) {
                    return false;
                }
                return true;
            });
            this.renderIndicators = (0, observable_1.derived)(this, reader => this._options.read(reader).renderIndicators);
            this.enableSplitViewResizing = (0, observable_1.derived)(this, reader => this._options.read(reader).enableSplitViewResizing);
            this.splitViewDefaultRatio = (0, observable_1.derived)(this, reader => this._options.read(reader).splitViewDefaultRatio);
            this.ignoreTrimWhitespace = (0, observable_1.derived)(this, reader => this._options.read(reader).ignoreTrimWhitespace);
            this.maxComputationTimeMs = (0, observable_1.derived)(this, reader => this._options.read(reader).maxComputationTime);
            this.showMoves = (0, observable_1.derived)(this, reader => this._options.read(reader).experimental.showMoves && this.renderSideBySide.read(reader));
            this.isInEmbeddedEditor = (0, observable_1.derived)(this, reader => this._options.read(reader).isInEmbeddedEditor);
            this.diffWordWrap = (0, observable_1.derived)(this, reader => this._options.read(reader).diffWordWrap);
            this.originalEditable = (0, observable_1.derived)(this, reader => this._options.read(reader).originalEditable);
            this.diffCodeLens = (0, observable_1.derived)(this, reader => this._options.read(reader).diffCodeLens);
            this.accessibilityVerbose = (0, observable_1.derived)(this, reader => this._options.read(reader).accessibilityVerbose);
            this.diffAlgorithm = (0, observable_1.derived)(this, reader => this._options.read(reader).diffAlgorithm);
            this.showEmptyDecorations = (0, observable_1.derived)(this, reader => this._options.read(reader).experimental.showEmptyDecorations);
            this.onlyShowAccessibleDiffViewer = (0, observable_1.derived)(this, reader => this._options.read(reader).onlyShowAccessibleDiffViewer);
            this.hideUnchangedRegions = (0, observable_1.derived)(this, reader => this._options.read(reader).hideUnchangedRegions.enabled);
            this.hideUnchangedRegionsRevealLineCount = (0, observable_1.derived)(this, reader => this._options.read(reader).hideUnchangedRegions.revealLineCount);
            this.hideUnchangedRegionsContextLineCount = (0, observable_1.derived)(this, reader => this._options.read(reader).hideUnchangedRegions.contextLineCount);
            this.hideUnchangedRegionsMinimumLineCount = (0, observable_1.derived)(this, reader => this._options.read(reader).hideUnchangedRegions.minimumLineCount);
            const optionsCopy = { ...options, ...validateDiffEditorOptions(options, diffEditor_1.diffEditorDefaultOptions) };
            this._options = (0, observable_1.observableValue)(this, optionsCopy);
        }
        updateOptions(changedOptions) {
            const newDiffEditorOptions = validateDiffEditorOptions(changedOptions, this._options.get());
            const newOptions = { ...this._options.get(), ...changedOptions, ...newDiffEditorOptions };
            this._options.set(newOptions, undefined, { changedOptions: changedOptions });
        }
        setWidth(width) {
            this._diffEditorWidth.set(width, undefined);
        }
    }
    exports.DiffEditorOptions = DiffEditorOptions;
    function validateDiffEditorOptions(options, defaults) {
        return {
            enableSplitViewResizing: (0, editorOptions_1.boolean)(options.enableSplitViewResizing, defaults.enableSplitViewResizing),
            splitViewDefaultRatio: (0, editorOptions_1.clampedFloat)(options.splitViewDefaultRatio, 0.5, 0.1, 0.9),
            renderSideBySide: (0, editorOptions_1.boolean)(options.renderSideBySide, defaults.renderSideBySide),
            renderMarginRevertIcon: (0, editorOptions_1.boolean)(options.renderMarginRevertIcon, defaults.renderMarginRevertIcon),
            maxComputationTime: (0, editorOptions_1.clampedInt)(options.maxComputationTime, defaults.maxComputationTime, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
            maxFileSize: (0, editorOptions_1.clampedInt)(options.maxFileSize, defaults.maxFileSize, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
            ignoreTrimWhitespace: (0, editorOptions_1.boolean)(options.ignoreTrimWhitespace, defaults.ignoreTrimWhitespace),
            renderIndicators: (0, editorOptions_1.boolean)(options.renderIndicators, defaults.renderIndicators),
            originalEditable: (0, editorOptions_1.boolean)(options.originalEditable, defaults.originalEditable),
            diffCodeLens: (0, editorOptions_1.boolean)(options.diffCodeLens, defaults.diffCodeLens),
            renderOverviewRuler: (0, editorOptions_1.boolean)(options.renderOverviewRuler, defaults.renderOverviewRuler),
            diffWordWrap: (0, editorOptions_1.stringSet)(options.diffWordWrap, defaults.diffWordWrap, ['off', 'on', 'inherit']),
            diffAlgorithm: (0, editorOptions_1.stringSet)(options.diffAlgorithm, defaults.diffAlgorithm, ['legacy', 'advanced'], { 'smart': 'legacy', 'experimental': 'advanced' }),
            accessibilityVerbose: (0, editorOptions_1.boolean)(options.accessibilityVerbose, defaults.accessibilityVerbose),
            experimental: {
                showMoves: (0, editorOptions_1.boolean)(options.experimental?.showMoves, defaults.experimental.showMoves),
                showEmptyDecorations: (0, editorOptions_1.boolean)(options.experimental?.showEmptyDecorations, defaults.experimental.showEmptyDecorations),
            },
            hideUnchangedRegions: {
                enabled: (0, editorOptions_1.boolean)(options.hideUnchangedRegions?.enabled ?? options.experimental?.collapseUnchangedRegions, defaults.hideUnchangedRegions.enabled),
                contextLineCount: (0, editorOptions_1.clampedInt)(options.hideUnchangedRegions?.contextLineCount, defaults.hideUnchangedRegions.contextLineCount, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
                minimumLineCount: (0, editorOptions_1.clampedInt)(options.hideUnchangedRegions?.minimumLineCount, defaults.hideUnchangedRegions.minimumLineCount, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
                revealLineCount: (0, editorOptions_1.clampedInt)(options.hideUnchangedRegions?.revealLineCount, defaults.hideUnchangedRegions.revealLineCount, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
            },
            isInEmbeddedEditor: (0, editorOptions_1.boolean)(options.isInEmbeddedEditor, defaults.isInEmbeddedEditor),
            onlyShowAccessibleDiffViewer: (0, editorOptions_1.boolean)(options.onlyShowAccessibleDiffViewer, defaults.onlyShowAccessibleDiffViewer),
            renderSideBySideInlineBreakpoint: (0, editorOptions_1.clampedInt)(options.renderSideBySideInlineBreakpoint, defaults.renderSideBySideInlineBreakpoint, 0, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
            useInlineViewWhenSpaceIsLimited: (0, editorOptions_1.boolean)(options.useInlineViewWhenSpaceIsLimited, defaults.useInlineViewWhenSpaceIsLimited),
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvck9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL2RpZmZFZGl0b3JPcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFhLGlCQUFpQjtRQUc3QixJQUFXLGFBQWEsS0FBc0UsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUlySCxZQUNDLE9BQXFDO1lBSHJCLHFCQUFnQixHQUFHLElBQUEsNEJBQWUsRUFBUyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFTckQscUNBQWdDLEdBQUcsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxDQUN6RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdDQUFnQyxDQUNoSixDQUFDO1lBRWMsd0JBQW1CLEdBQUcsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDOUYscUJBQWdCLEdBQUcsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQjttQkFDbEcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLCtC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
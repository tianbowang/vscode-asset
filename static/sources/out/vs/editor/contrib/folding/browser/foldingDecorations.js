/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables"], function (require, exports, codicons_1, model_1, textModel_1, nls_1, colorRegistry_1, iconRegistry_1, themeService_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FoldingDecorationProvider = exports.foldingManualExpandedIcon = exports.foldingManualCollapsedIcon = exports.foldingCollapsedIcon = exports.foldingExpandedIcon = void 0;
    const foldBackground = (0, colorRegistry_1.registerColor)('editor.foldBackground', { light: (0, colorRegistry_1.transparent)(colorRegistry_1.editorSelectionBackground, 0.3), dark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorSelectionBackground, 0.3), hcDark: null, hcLight: null }, (0, nls_1.localize)('foldBackgroundBackground', "Background color behind folded ranges. The color must not be opaque so as not to hide underlying decorations."), true);
    (0, colorRegistry_1.registerColor)('editorGutter.foldingControlForeground', { dark: colorRegistry_1.iconForeground, light: colorRegistry_1.iconForeground, hcDark: colorRegistry_1.iconForeground, hcLight: colorRegistry_1.iconForeground }, (0, nls_1.localize)('editorGutter.foldingControlForeground', 'Color of the folding control in the editor gutter.'));
    exports.foldingExpandedIcon = (0, iconRegistry_1.registerIcon)('folding-expanded', codicons_1.Codicon.chevronDown, (0, nls_1.localize)('foldingExpandedIcon', 'Icon for expanded ranges in the editor glyph margin.'));
    exports.foldingCollapsedIcon = (0, iconRegistry_1.registerIcon)('folding-collapsed', codicons_1.Codicon.chevronRight, (0, nls_1.localize)('foldingCollapsedIcon', 'Icon for collapsed ranges in the editor glyph margin.'));
    exports.foldingManualCollapsedIcon = (0, iconRegistry_1.registerIcon)('folding-manual-collapsed', exports.foldingCollapsedIcon, (0, nls_1.localize)('foldingManualCollapedIcon', 'Icon for manually collapsed ranges in the editor glyph margin.'));
    exports.foldingManualExpandedIcon = (0, iconRegistry_1.registerIcon)('folding-manual-expanded', exports.foldingExpandedIcon, (0, nls_1.localize)('foldingManualExpandedIcon', 'Icon for manually expanded ranges in the editor glyph margin.'));
    const foldedBackgroundMinimap = { color: (0, themeService_1.themeColorFromId)(foldBackground), position: model_1.MinimapPosition.Inline };
    const collapsed = (0, nls_1.localize)('linesCollapsed', "Click to expand the range.");
    const expanded = (0, nls_1.localize)('linesExpanded', "Click to collapse the range.");
    class FoldingDecorationProvider {
        static { this.COLLAPSED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-collapsed-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            isWholeLine: true,
            linesDecorationsTooltip: collapsed,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingCollapsedIcon),
        }); }
        static { this.COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-collapsed-highlighted-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            className: 'folded-background',
            minimap: foldedBackgroundMinimap,
            isWholeLine: true,
            linesDecorationsTooltip: collapsed,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingCollapsedIcon)
        }); }
        static { this.MANUALLY_COLLAPSED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-manually-collapsed-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            isWholeLine: true,
            linesDecorationsTooltip: collapsed,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingManualCollapsedIcon)
        }); }
        static { this.MANUALLY_COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-manually-collapsed-highlighted-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            className: 'folded-background',
            minimap: foldedBackgroundMinimap,
            isWholeLine: true,
            linesDecorationsTooltip: collapsed,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingManualCollapsedIcon)
        }); }
        static { this.NO_CONTROLS_COLLAPSED_RANGE_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-no-controls-range-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            isWholeLine: true,
            linesDecorationsTooltip: collapsed,
        }); }
        static { this.NO_CONTROLS_COLLAPSED_HIGHLIGHTED_RANGE_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-no-controls-range-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            afterContentClassName: 'inline-folded',
            className: 'folded-background',
            minimap: foldedBackgroundMinimap,
            isWholeLine: true,
            linesDecorationsTooltip: collapsed,
        }); }
        static { this.EXPANDED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-expanded-visual-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: 'alwaysShowFoldIcons ' + themables_1.ThemeIcon.asClassName(exports.foldingExpandedIcon),
            linesDecorationsTooltip: expanded,
        }); }
        static { this.EXPANDED_AUTO_HIDE_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-expanded-auto-hide-visual-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingExpandedIcon),
            linesDecorationsTooltip: expanded,
        }); }
        static { this.MANUALLY_EXPANDED_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-manually-expanded-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: 'alwaysShowFoldIcons ' + themables_1.ThemeIcon.asClassName(exports.foldingManualExpandedIcon),
            linesDecorationsTooltip: expanded,
        }); }
        static { this.MANUALLY_EXPANDED_AUTO_HIDE_VISUAL_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-manually-expanded-auto-hide-visual-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            isWholeLine: true,
            firstLineDecorationClassName: themables_1.ThemeIcon.asClassName(exports.foldingManualExpandedIcon),
            linesDecorationsTooltip: expanded,
        }); }
        static { this.NO_CONTROLS_EXPANDED_RANGE_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-no-controls-range-decoration',
            stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */,
            isWholeLine: true
        }); }
        static { this.HIDDEN_RANGE_DECORATION = textModel_1.ModelDecorationOptions.register({
            description: 'folding-hidden-range-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
        }); }
        constructor(editor) {
            this.editor = editor;
            this.showFoldingControls = 'mouseover';
            this.showFoldingHighlights = true;
        }
        getDecorationOption(isCollapsed, isHidden, isManual) {
            if (isHidden) { // is inside another collapsed region
                return FoldingDecorationProvider.HIDDEN_RANGE_DECORATION;
            }
            if (this.showFoldingControls === 'never') {
                if (isCollapsed) {
                    return this.showFoldingHighlights ? FoldingDecorationProvider.NO_CONTROLS_COLLAPSED_HIGHLIGHTED_RANGE_DECORATION : FoldingDecorationProvider.NO_CONTROLS_COLLAPSED_RANGE_DECORATION;
                }
                return FoldingDecorationProvider.NO_CONTROLS_EXPANDED_RANGE_DECORATION;
            }
            if (isCollapsed) {
                return isManual ?
                    (this.showFoldingHighlights ? FoldingDecorationProvider.MANUALLY_COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION : FoldingDecorationProvider.MANUALLY_COLLAPSED_VISUAL_DECORATION)
                    : (this.showFoldingHighlights ? FoldingDecorationProvider.COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION : FoldingDecorationProvider.COLLAPSED_VISUAL_DECORATION);
            }
            else if (this.showFoldingControls === 'mouseover') {
                return isManual ? FoldingDecorationProvider.MANUALLY_EXPANDED_AUTO_HIDE_VISUAL_DECORATION : FoldingDecorationProvider.EXPANDED_AUTO_HIDE_VISUAL_DECORATION;
            }
            else {
                return isManual ? FoldingDecorationProvider.MANUALLY_EXPANDED_VISUAL_DECORATION : FoldingDecorationProvider.EXPANDED_VISUAL_DECORATION;
            }
        }
        changeDecorations(callback) {
            return this.editor.changeDecorations(callback);
        }
        removeDecorations(decorationIds) {
            this.editor.removeDecorations(decorationIds);
        }
    }
    exports.FoldingDecorationProvider = FoldingDecorationProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZ0RlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9mb2xkaW5nL2Jyb3dzZXIvZm9sZGluZ0RlY29yYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxNQUFNLGNBQWMsR0FBRyxJQUFBLDZCQUFhLEVBQUMsdUJBQXVCLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSwyQkFBVyxFQUFDLHlDQUF5QixFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFBLDJCQUFXLEVBQUMseUNBQXlCLEVBQUUsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsK0dBQStHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuVyxJQUFBLDZCQUFhLEVBQUMsdUNBQXVDLEVBQUUsRUFBRSxJQUFJLEVBQUUsOEJBQWMsRUFBRSxLQUFLLEVBQUUsOEJBQWMsRUFBRSxNQUFNLEVBQUUsOEJBQWMsRUFBRSxPQUFPLEVBQUUsOEJBQWMsRUFBRSxFQUFFLElBQUEsY0FBUSxFQUFDLHVDQUF1QyxFQUFFLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztJQUVyUCxRQUFBLG1CQUFtQixHQUFHLElBQUEsMkJBQVksRUFBQyxrQkFBa0IsRUFBRSxrQkFBTyxDQUFDLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSxzREFBc0QsQ0FBQyxDQUFDLENBQUM7SUFDckssUUFBQSxvQkFBb0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsbUJBQW1CLEVBQUUsa0JBQU8sQ0FBQyxZQUFZLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsdURBQXVELENBQUMsQ0FBQyxDQUFDO0lBQzFL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
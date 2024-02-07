/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/languages", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./highlightDecorations"], function (require, exports, model_1, textModel_1, languages_1, nls, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSelectionHighlightDecorationOptions = exports.getHighlightDecorationOptions = void 0;
    const wordHighlightBackground = (0, colorRegistry_1.registerColor)('editor.wordHighlightBackground', { dark: '#575757B8', light: '#57575740', hcDark: null, hcLight: null }, nls.localize('wordHighlight', 'Background color of a symbol during read-access, like reading a variable. The color must not be opaque so as not to hide underlying decorations.'), true);
    (0, colorRegistry_1.registerColor)('editor.wordHighlightStrongBackground', { dark: '#004972B8', light: '#0e639c40', hcDark: null, hcLight: null }, nls.localize('wordHighlightStrong', 'Background color of a symbol during write-access, like writing to a variable. The color must not be opaque so as not to hide underlying decorations.'), true);
    (0, colorRegistry_1.registerColor)('editor.wordHighlightTextBackground', { light: wordHighlightBackground, dark: wordHighlightBackground, hcDark: wordHighlightBackground, hcLight: wordHighlightBackground }, nls.localize('wordHighlightText', 'Background color of a textual occurrence for a symbol. The color must not be opaque so as not to hide underlying decorations.'), true);
    const wordHighlightBorder = (0, colorRegistry_1.registerColor)('editor.wordHighlightBorder', { light: null, dark: null, hcDark: colorRegistry_1.activeContrastBorder, hcLight: colorRegistry_1.activeContrastBorder }, nls.localize('wordHighlightBorder', 'Border color of a symbol during read-access, like reading a variable.'));
    (0, colorRegistry_1.registerColor)('editor.wordHighlightStrongBorder', { light: null, dark: null, hcDark: colorRegistry_1.activeContrastBorder, hcLight: colorRegistry_1.activeContrastBorder }, nls.localize('wordHighlightStrongBorder', 'Border color of a symbol during write-access, like writing to a variable.'));
    (0, colorRegistry_1.registerColor)('editor.wordHighlightTextBorder', { light: wordHighlightBorder, dark: wordHighlightBorder, hcDark: wordHighlightBorder, hcLight: wordHighlightBorder }, nls.localize('wordHighlightTextBorder', "Border color of a textual occurrence for a symbol."));
    const overviewRulerWordHighlightForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.wordHighlightForeground', { dark: '#A0A0A0CC', light: '#A0A0A0CC', hcDark: '#A0A0A0CC', hcLight: '#A0A0A0CC' }, nls.localize('overviewRulerWordHighlightForeground', 'Overview ruler marker color for symbol highlights. The color must not be opaque so as not to hide underlying decorations.'), true);
    const overviewRulerWordHighlightStrongForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.wordHighlightStrongForeground', { dark: '#C0A0C0CC', light: '#C0A0C0CC', hcDark: '#C0A0C0CC', hcLight: '#C0A0C0CC' }, nls.localize('overviewRulerWordHighlightStrongForeground', 'Overview ruler marker color for write-access symbol highlights. The color must not be opaque so as not to hide underlying decorations.'), true);
    const overviewRulerWordHighlightTextForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.wordHighlightTextForeground', { dark: colorRegistry_1.overviewRulerSelectionHighlightForeground, light: colorRegistry_1.overviewRulerSelectionHighlightForeground, hcDark: colorRegistry_1.overviewRulerSelectionHighlightForeground, hcLight: colorRegistry_1.overviewRulerSelectionHighlightForeground }, nls.localize('overviewRulerWordHighlightTextForeground', 'Overview ruler marker color of a textual occurrence for a symbol. The color must not be opaque so as not to hide underlying decorations.'), true);
    const _WRITE_OPTIONS = textModel_1.ModelDecorationOptions.register({
        description: 'word-highlight-strong',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlightStrong',
        overviewRuler: {
            color: (0, themeService_1.themeColorFromId)(overviewRulerWordHighlightStrongForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapSelectionOccurrenceHighlight),
            position: model_1.MinimapPosition.Inline
        },
    });
    const _TEXT_OPTIONS = textModel_1.ModelDecorationOptions.register({
        description: 'word-highlight-text',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlightText',
        overviewRuler: {
            color: (0, themeService_1.themeColorFromId)(overviewRulerWordHighlightTextForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapSelectionOccurrenceHighlight),
            position: model_1.MinimapPosition.Inline
        },
    });
    const _SELECTION_HIGHLIGHT_OPTIONS = textModel_1.ModelDecorationOptions.register({
        description: 'selection-highlight-overview',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'selectionHighlight',
        overviewRuler: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.overviewRulerSelectionHighlightForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapSelectionOccurrenceHighlight),
            position: model_1.MinimapPosition.Inline
        },
    });
    const _SELECTION_HIGHLIGHT_OPTIONS_NO_OVERVIEW = textModel_1.ModelDecorationOptions.register({
        description: 'selection-highlight',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'selectionHighlight',
    });
    const _REGULAR_OPTIONS = textModel_1.ModelDecorationOptions.register({
        description: 'word-highlight',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        className: 'wordHighlight',
        overviewRuler: {
            color: (0, themeService_1.themeColorFromId)(overviewRulerWordHighlightForeground),
            position: model_1.OverviewRulerLane.Center
        },
        minimap: {
            color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapSelectionOccurrenceHighlight),
            position: model_1.MinimapPosition.Inline
        },
    });
    function getHighlightDecorationOptions(kind) {
        if (kind === languages_1.DocumentHighlightKind.Write) {
            return _WRITE_OPTIONS;
        }
        else if (kind === languages_1.DocumentHighlightKind.Text) {
            return _TEXT_OPTIONS;
        }
        else {
            return _REGULAR_OPTIONS;
        }
    }
    exports.getHighlightDecorationOptions = getHighlightDecorationOptions;
    function getSelectionHighlightDecorationOptions(hasSemanticHighlights) {
        // Show in overviewRuler only if model has no semantic highlighting
        return (hasSemanticHighlights ? _SELECTION_HIGHLIGHT_OPTIONS_NO_OVERVIEW : _SELECTION_HIGHLIGHT_OPTIONS);
    }
    exports.getSelectionHighlightDecorationOptions = getSelectionHighlightDecorationOptions;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const selectionHighlight = theme.getColor(colorRegistry_1.editorSelectionHighlight);
        if (selectionHighlight) {
            collector.addRule(`.monaco-editor .selectionHighlight { background-color: ${selectionHighlight.transparent(0.5)}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaGxpZ2h0RGVjb3JhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3dvcmRIaWdobGlnaHRlci9icm93c2VyL2hpZ2hsaWdodERlY29yYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFNLHVCQUF1QixHQUFHLElBQUEsNkJBQWEsRUFBQyxnQ0FBZ0MsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxrSkFBa0osQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pWLElBQUEsNkJBQWEsRUFBQyxzQ0FBc0MsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLHNKQUFzSixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDalUsSUFBQSw2QkFBYSxFQUFDLG9DQUFvQyxFQUFFLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSx1QkFBdUIsRUFBRSxNQUFNLEVBQUUsdUJBQXVCLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSwrSEFBK0gsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BXLE1BQU0sbUJBQW1CLEdBQUcsSUFBQSw2QkFBYSxFQUFDLDRCQUE0QixFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFB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
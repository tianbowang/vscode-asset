/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/trustedTypes", "vs/editor/browser/config/domFontInfo", "vs/editor/common/config/editorOptions", "vs/editor/common/core/stringBuilder", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/common/viewModel"], function (require, exports, trustedTypes_1, domFontInfo_1, editorOptions_1, stringBuilder_1, lineDecorations_1, viewLineRenderer_1, viewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenderOptions = exports.LineSource = exports.renderLines = void 0;
    const ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('diffEditorWidget', { createHTML: value => value });
    function renderLines(source, options, decorations, domNode) {
        (0, domFontInfo_1.applyFontInfo)(domNode, options.fontInfo);
        const hasCharChanges = (decorations.length > 0);
        const sb = new stringBuilder_1.StringBuilder(10000);
        let maxCharsPerLine = 0;
        let renderedLineCount = 0;
        const viewLineCounts = [];
        for (let lineIndex = 0; lineIndex < source.lineTokens.length; lineIndex++) {
            const lineNumber = lineIndex + 1;
            const lineTokens = source.lineTokens[lineIndex];
            const lineBreakData = source.lineBreakData[lineIndex];
            const actualDecorations = lineDecorations_1.LineDecoration.filter(decorations, lineNumber, 1, Number.MAX_SAFE_INTEGER);
            if (lineBreakData) {
                let lastBreakOffset = 0;
                for (const breakOffset of lineBreakData.breakOffsets) {
                    const viewLineTokens = lineTokens.sliceAndInflate(lastBreakOffset, breakOffset, 0);
                    maxCharsPerLine = Math.max(maxCharsPerLine, renderOriginalLine(renderedLineCount, viewLineTokens, lineDecorations_1.LineDecoration.extractWrapped(actualDecorations, lastBreakOffset, breakOffset), hasCharChanges, source.mightContainNonBasicASCII, source.mightContainRTL, options, sb));
                    renderedLineCount++;
                    lastBreakOffset = breakOffset;
                }
                viewLineCounts.push(lineBreakData.breakOffsets.length);
            }
            else {
                viewLineCounts.push(1);
                maxCharsPerLine = Math.max(maxCharsPerLine, renderOriginalLine(renderedLineCount, lineTokens, actualDecorations, hasCharChanges, source.mightContainNonBasicASCII, source.mightContainRTL, options, sb));
                renderedLineCount++;
            }
        }
        maxCharsPerLine += options.scrollBeyondLastColumn;
        const html = sb.build();
        const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
        domNode.innerHTML = trustedhtml;
        const minWidthInPx = (maxCharsPerLine * options.typicalHalfwidthCharacterWidth);
        return {
            heightInLines: renderedLineCount,
            minWidthInPx,
            viewLineCounts,
        };
    }
    exports.renderLines = renderLines;
    class LineSource {
        constructor(lineTokens, lineBreakData, mightContainNonBasicASCII, mightContainRTL) {
            this.lineTokens = lineTokens;
            this.lineBreakData = lineBreakData;
            this.mightContainNonBasicASCII = mightContainNonBasicASCII;
            this.mightContainRTL = mightContainRTL;
        }
    }
    exports.LineSource = LineSource;
    class RenderOptions {
        static fromEditor(editor) {
            const modifiedEditorOptions = editor.getOptions();
            const fontInfo = modifiedEditorOptions.get(50 /* EditorOption.fontInfo */);
            const layoutInfo = modifiedEditorOptions.get(143 /* EditorOption.layoutInfo */);
            return new RenderOptions(editor.getModel()?.getOptions().tabSize || 0, fontInfo, modifiedEditorOptions.get(33 /* EditorOption.disableMonospaceOptimizations */), fontInfo.typicalHalfwidthCharacterWidth, modifiedEditorOptions.get(103 /* EditorOption.scrollBeyondLastColumn */), modifiedEditorOptions.get(66 /* EditorOption.lineHeight */), layoutInfo.decorationsWidth, modifiedEditorOptions.get(116 /* EditorOption.stopRenderingLineAfter */), modifiedEditorOptions.get(98 /* EditorOption.renderWhitespace */), modifiedEditorOptions.get(93 /* EditorOption.renderControlCharacters */), modifiedEditorOptions.get(51 /* EditorOption.fontLigatures */));
        }
        constructor(tabSize, fontInfo, disableMonospaceOptimizations, typicalHalfwidthCharacterWidth, scrollBeyondLastColumn, lineHeight, lineDecorationsWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures) {
            this.tabSize = tabSize;
            this.fontInfo = fontInfo;
            this.disableMonospaceOptimizations = disableMonospaceOptimizations;
            this.typicalHalfwidthCharacterWidth = typicalHalfwidthCharacterWidth;
            this.scrollBeyondLastColumn = scrollBeyondLastColumn;
            this.lineHeight = lineHeight;
            this.lineDecorationsWidth = lineDecorationsWidth;
            this.stopRenderingLineAfter = stopRenderingLineAfter;
            this.renderWhitespace = renderWhitespace;
            this.renderControlCharacters = renderControlCharacters;
            this.fontLigatures = fontLigatures;
        }
    }
    exports.RenderOptions = RenderOptions;
    function renderOriginalLine(viewLineIdx, lineTokens, decorations, hasCharChanges, mightContainNonBasicASCII, mightContainRTL, options, sb) {
        sb.appendString('<div class="view-line');
        if (!hasCharChanges) {
            // No char changes
            sb.appendString(' char-delete');
        }
        sb.appendString('" style="top:');
        sb.appendString(String(viewLineIdx * options.lineHeight));
        sb.appendString('px;width:1000000px;">');
        const lineContent = lineTokens.getLineContent();
        const isBasicASCII = viewModel_1.ViewLineRenderingData.isBasicASCII(lineContent, mightContainNonBasicASCII);
        const containsRTL = viewModel_1.ViewLineRenderingData.containsRTL(lineContent, isBasicASCII, mightContainRTL);
        const output = (0, viewLineRenderer_1.renderViewLine)(new viewLineRenderer_1.RenderLineInput((options.fontInfo.isMonospace && !options.disableMonospaceOptimizations), options.fontInfo.canUseHalfwidthRightwardsArrow, lineContent, false, isBasicASCII, containsRTL, 0, lineTokens, decorations, options.tabSize, 0, options.fontInfo.spaceWidth, options.fontInfo.middotWidth, options.fontInfo.wsmiddotWidth, options.stopRenderingLineAfter, options.renderWhitespace, options.renderControlCharacters, options.fontLigatures !== editorOptions_1.EditorFontLigatures.OFF, null // Send no selections, original line cannot be selected
        ), sb);
        sb.appendString('</div>');
        return output.characterMapping.getHorizontalOffset(output.characterMapping.length);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyTGluZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL2NvbXBvbmVudHMvZGlmZkVkaXRvclZpZXdab25lcy9yZW5kZXJMaW5lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBTSxRQUFRLEdBQUcsSUFBQSx1Q0FBd0IsRUFBQyxrQkFBa0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFOUYsU0FBZ0IsV0FBVyxDQUFDLE1BQWtCLEVBQUUsT0FBc0IsRUFBRSxXQUErQixFQUFFLE9BQW9CO1FBQzVILElBQUEsMkJBQWEsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sY0FBYyxHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVoRCxNQUFNLEVBQUUsR0FBRyxJQUFJLDZCQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sY0FBYyxHQUFhLEVBQUUsQ0FBQztRQUNwQyxLQUFLLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztZQUMzRSxNQUFNLFVBQVUsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEQsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFT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
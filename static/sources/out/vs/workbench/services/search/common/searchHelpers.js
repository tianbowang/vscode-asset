/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/workbench/services/search/common/search"], function (require, exports, range_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTextSearchMatchWithModelContext = exports.editorMatchesToTextSearchResults = void 0;
    function editorMatchToTextSearchResult(matches, model, previewOptions) {
        const firstLine = matches[0].range.startLineNumber;
        const lastLine = matches[matches.length - 1].range.endLineNumber;
        const lineTexts = [];
        for (let i = firstLine; i <= lastLine; i++) {
            lineTexts.push(model.getLineContent(i));
        }
        return new search_1.TextSearchMatch(lineTexts.join('\n') + '\n', matches.map(m => new range_1.Range(m.range.startLineNumber - 1, m.range.startColumn - 1, m.range.endLineNumber - 1, m.range.endColumn - 1)), previewOptions);
    }
    /**
     * Combine a set of FindMatches into a set of TextSearchResults. They should be grouped by matches that start on the same line that the previous match ends on.
     */
    function editorMatchesToTextSearchResults(matches, model, previewOptions) {
        let previousEndLine = -1;
        const groupedMatches = [];
        let currentMatches = [];
        matches.forEach((match) => {
            if (match.range.startLineNumber !== previousEndLine) {
                currentMatches = [];
                groupedMatches.push(currentMatches);
            }
            currentMatches.push(match);
            previousEndLine = match.range.endLineNumber;
        });
        return groupedMatches.map(sameLineMatches => {
            return editorMatchToTextSearchResult(sameLineMatches, model, previewOptions);
        });
    }
    exports.editorMatchesToTextSearchResults = editorMatchesToTextSearchResults;
    function getTextSearchMatchWithModelContext(matches, model, query) {
        const results = [];
        let prevLine = -1;
        for (let i = 0; i < matches.length; i++) {
            const { start: matchStartLine, end: matchEndLine } = getMatchStartEnd(matches[i]);
            if (typeof query.beforeContext === 'number' && query.beforeContext > 0) {
                const beforeContextStartLine = Math.max(prevLine + 1, matchStartLine - query.beforeContext);
                for (let b = beforeContextStartLine; b < matchStartLine; b++) {
                    results.push({
                        text: model.getLineContent(b + 1),
                        lineNumber: b + 1
                    });
                }
            }
            results.push(matches[i]);
            const nextMatch = matches[i + 1];
            const nextMatchStartLine = nextMatch ? getMatchStartEnd(nextMatch).start : Number.MAX_VALUE;
            if (typeof query.afterContext === 'number' && query.afterContext > 0) {
                const afterContextToLine = Math.min(nextMatchStartLine - 1, matchEndLine + query.afterContext, model.getLineCount() - 1);
                for (let a = matchEndLine + 1; a <= afterContextToLine; a++) {
                    results.push({
                        text: model.getLineContent(a + 1),
                        lineNumber: a + 1
                    });
                }
            }
            prevLine = matchEndLine;
        }
        return results;
    }
    exports.getTextSearchMatchWithModelContext = getTextSearchMatchWithModelContext;
    function getMatchStartEnd(match) {
        const matchRanges = match.ranges;
        const matchStartLine = Array.isArray(matchRanges) ? matchRanges[0].startLineNumber : matchRanges.startLineNumber;
        const matchEndLine = Array.isArray(matchRanges) ? matchRanges[matchRanges.length - 1].endLineNumber : matchRanges.endLineNumber;
        return {
            start: matchStartLine,
            end: matchEndLine
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC9jb21tb24vc2VhcmNoSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsU0FBUyw2QkFBNkIsQ0FBQyxPQUFvQixFQUFFLEtBQWlCLEVBQUUsY0FBMEM7UUFDekgsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7UUFDbkQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUVqRSxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7UUFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFRCxPQUFPLElBQUksd0JBQWUsQ0FDekIsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNuSSxjQUFjLENBQUMs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
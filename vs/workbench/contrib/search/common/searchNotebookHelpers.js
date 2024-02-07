(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/search/common/search", "vs/editor/common/core/range"], function (require, exports, search_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.genericCellMatchesToTextSearchMatches = exports.rawCellPrefix = exports.isINotebookFileMatchNoModel = void 0;
    function isINotebookFileMatchNoModel(object) {
        return 'cellResults' in object;
    }
    exports.isINotebookFileMatchNoModel = isINotebookFileMatchNoModel;
    exports.rawCellPrefix = 'rawCell#';
    function genericCellMatchesToTextSearchMatches(contentMatches, buffer) {
        let previousEndLine = -1;
        const contextGroupings = [];
        let currentContextGrouping = [];
        contentMatches.forEach((match) => {
            if (match.range.startLineNumber !== previousEndLine) {
                if (currentContextGrouping.length > 0) {
                    contextGroupings.push([...currentContextGrouping]);
                    currentContextGrouping = [];
                }
            }
            currentContextGrouping.push(match);
            previousEndLine = match.range.endLineNumber;
        });
        if (currentContextGrouping.length > 0) {
            contextGroupings.push([...currentContextGrouping]);
        }
        const textSearchResults = contextGroupings.map((grouping) => {
            const lineTexts = [];
            const firstLine = grouping[0].range.startLineNumber;
            const lastLine = grouping[grouping.length - 1].range.endLineNumber;
            for (let i = firstLine; i <= lastLine; i++) {
                lineTexts.push(buffer.getLineContent(i));
            }
            return new search_1.TextSearchMatch(lineTexts.join('\n') + '\n', grouping.map(m => new range_1.Range(m.range.startLineNumber - 1, m.range.startColumn - 1, m.range.endLineNumber - 1, m.range.endColumn - 1)));
        });
        return textSearchResults;
    }
    exports.genericCellMatchesToTextSearchMatches = genericCellMatchesToTextSearchMatches;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoTm90ZWJvb2tIZWxwZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvY29tbW9uL3NlYXJjaE5vdGVib29rSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQmhHLFNBQWdCLDJCQUEyQixDQUFDLE1BQWtCO1FBQzdELE9BQU8sYUFBYSxJQUFJLE1BQU0sQ0FBQztJQUNoQyxDQUFDO0lBRkQsa0VBRUM7SUFFWSxRQUFBLGFBQWEsR0FBRyxVQUFVLENBQUM7SUFFeEMsU0FBZ0IscUNBQXFDLENBQUMsY0FBMkIsRUFBRSxNQUEyQjtRQUM3RyxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6QixNQUFNLGdCQUFnQixHQUFrQixFQUFFLENBQUM7UUFDM0MsSUFBSSxzQkFBc0IsR0FBZ0IsRUFBRSxDQUFDO1FBRTdDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNoQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxLQUFLLGVBQWUsRUFBRSxDQUFDO2dCQUNyRCxJQUFJLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDdkMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7b0JBQ25ELHNCQUFzQixHQUFHLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQztZQUNGLENBQUM7WUFFRCxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkMsZUFBZSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdkMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELE1BQU0saUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDM0QsTUFBTSxTQUFTLEdBQWEsRUFBRSxDQUFDO1lBQy9CLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO1lBQ3BELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7WUFDbkUsS0FBSyxJQUFJLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM1QyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsT0FBTyxJQUFJLHdCQUFlLENBQ3pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUMzQixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDcEksQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxpQkFBaUIsQ0FBQztJQUMxQixDQUFDO0lBbkNELHNGQW1DQyJ9
//# sourceURL=../../../vs/workbench/contrib/search/common/searchNotebookHelpers.js
})
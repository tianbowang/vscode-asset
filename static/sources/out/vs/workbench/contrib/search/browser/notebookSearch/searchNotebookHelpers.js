/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/search/common/search", "vs/editor/common/core/range", "vs/workbench/contrib/search/common/searchNotebookHelpers"], function (require, exports, search_1, range_1, searchNotebookHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.webviewMatchesToTextSearchMatches = exports.contentMatchesToTextSearchMatches = exports.isINotebookCellMatchWithModel = exports.isINotebookFileMatchWithModel = exports.getIDFromINotebookCellMatch = void 0;
    function getIDFromINotebookCellMatch(match) {
        if (isINotebookCellMatchWithModel(match)) {
            return match.cell.id;
        }
        else {
            return `${searchNotebookHelpers_1.rawCellPrefix}${match.index}`;
        }
    }
    exports.getIDFromINotebookCellMatch = getIDFromINotebookCellMatch;
    function isINotebookFileMatchWithModel(object) {
        return 'cellResults' in object && object.cellResults instanceof Array && object.cellResults.every(isINotebookCellMatchWithModel);
    }
    exports.isINotebookFileMatchWithModel = isINotebookFileMatchWithModel;
    function isINotebookCellMatchWithModel(object) {
        return 'cell' in object;
    }
    exports.isINotebookCellMatchWithModel = isINotebookCellMatchWithModel;
    function contentMatchesToTextSearchMatches(contentMatches, cell) {
        return (0, searchNotebookHelpers_1.genericCellMatchesToTextSearchMatches)(contentMatches, cell.textBuffer);
    }
    exports.contentMatchesToTextSearchMatches = contentMatchesToTextSearchMatches;
    function webviewMatchesToTextSearchMatches(webviewMatches) {
        return webviewMatches
            .map(rawMatch => (rawMatch.searchPreviewInfo) ?
            new search_1.TextSearchMatch(rawMatch.searchPreviewInfo.line, new range_1.Range(0, rawMatch.searchPreviewInfo.range.start, 0, rawMatch.searchPreviewInfo.range.end), undefined, rawMatch.index) : undefined).filter((e) => !!e);
    }
    exports.webviewMatchesToTextSearchMatches = webviewMatchesToTextSearchMatches;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoTm90ZWJvb2tIZWxwZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9ub3RlYm9va1NlYXJjaC9zZWFyY2hOb3RlYm9va0hlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLFNBQWdCLDJCQUEyQixDQUFDLEtBQXlCO1FBQ3BFLElBQUksNkJBQTZCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMxQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3RCLENBQUM7YUFBTSxDQUFDO1lBQ1AsT0FBTyxHQUFHLHFDQUFhLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3pDLENBQUM7SUFDRixDQUFDO0lBTkQsa0VBTUM7SUFTRCxTQUFnQiw2QkFBNkIsQ0FBQyxNQUFXO1FBQ3hELE9BQU8sYUFBYSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsV0FBVyxZQUFZLEtBQUssSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQ2xJLENBQUM7SUFGRCxzRUFFQztJQUVELFNBQWdCLDZCQUE2QixDQUFDLE1BQVc7UUFDeEQsT0FBTyxNQUFNLElBQUksTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFGRCxzRUFFQztJQUVELFNBQWdCLGlDQUFpQyxDQUFDLGNBQTJCLEVBQUUsSUFBb0I7UUFDbEcsT0FBTyxJQUFBLDZEQUFxQyxFQUMzQyxjQUFjLEVBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FDZixDQUFDO0lBQ0gsQ0FBQztJQUxELDhFQUtDO0lBRUQsU0FBZ0IsaUNBQWlDLENBQUMsY0FBc0M7UUFDdkYsT0FBTyxjQUFjO2FBQ25CLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUNmLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLHdCQUFlLENBQ2xCLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQy9CLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDN0YsU0FBUyxFQUNULFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUM3QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBVkQsOEVBVUMifQ==
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InTreeViewKey = exports.ViewHasSomeCollapsibleKey = exports.ViewHasFilePatternKey = exports.ViewHasReplacePatternKey = exports.ViewHasSearchPatternKey = exports.MatchFocusKey = exports.IsEditableItemKey = exports.ResourceFolderFocusKey = exports.FolderFocusKey = exports.FileFocusKey = exports.FileMatchOrFolderMatchWithResourceFocusKey = exports.FileMatchOrFolderMatchFocusKey = exports.FileMatchOrMatchFocusKey = exports.FirstMatchFocusKey = exports.HasSearchResults = exports.ReplaceActiveKey = exports.PatternExcludesFocusedKey = exports.PatternIncludesFocusedKey = exports.ReplaceInputBoxFocusedKey = exports.SearchInputBoxFocusedKey = exports.InputBoxFocusedKey = exports.SearchViewFocusedKey = exports.SearchViewVisibleKey = exports.FindInWorkspaceId = exports.FindInFolderId = exports.RestrictSearchToFolderId = exports.FocusPreviousInputActionId = exports.FocusNextInputActionId = exports.ExcludeFolderFromSearchId = exports.ToggleQueryDetailsActionId = exports.ViewAsListActionId = exports.ViewAsTreeActionId = exports.ClearSearchResultsActionId = exports.ExpandSearchResultsActionId = exports.CollapseSearchResultsActionId = exports.ToggleSearchOnTypeActionId = exports.FocusPreviousSearchResultActionId = exports.FocusNextSearchResultActionId = exports.RefreshSearchResultsActionId = exports.CancelSearchActionId = exports.QuickTextSearchActionId = exports.ShowAllSymbolsActionId = exports.ReplaceInFilesActionId = exports.RevealInSideBarForSearchResults = exports.AddCursorsAtSearchResults = exports.TogglePreserveCaseId = exports.ToggleRegexCommandId = exports.ToggleWholeWordCommandId = exports.ToggleCaseSensitiveCommandId = exports.CloseReplaceWidgetActionId = exports.ReplaceAllInFolderActionId = exports.ReplaceAllInFileActionId = exports.ReplaceActionId = exports.FocusSearchListCommandID = exports.ClearSearchHistoryCommandId = exports.OpenInEditorCommandId = exports.CopyAllCommandId = exports.CopyMatchCommandId = exports.CopyPathCommandId = exports.RemoveActionId = exports.OpenMatchToSide = exports.OpenMatch = exports.FocusSearchFromResults = exports.FocusActiveEditorCommandId = exports.FindInFilesActionId = void 0;
    exports.FindInFilesActionId = 'workbench.action.findInFiles';
    exports.FocusActiveEditorCommandId = 'search.action.focusActiveEditor';
    exports.FocusSearchFromResults = 'search.action.focusSearchFromResults';
    exports.OpenMatch = 'search.action.openResult';
    exports.OpenMatchToSide = 'search.action.openResultToSide';
    exports.RemoveActionId = 'search.action.remove';
    exports.CopyPathCommandId = 'search.action.copyPath';
    exports.CopyMatchCommandId = 'search.action.copyMatch';
    exports.CopyAllCommandId = 'search.action.copyAll';
    exports.OpenInEditorCommandId = 'search.action.openInEditor';
    exports.ClearSearchHistoryCommandId = 'search.action.clearHistory';
    exports.FocusSearchListCommandID = 'search.action.focusSearchList';
    exports.ReplaceActionId = 'search.action.replace';
    exports.ReplaceAllInFileActionId = 'search.action.replaceAllInFile';
    exports.ReplaceAllInFolderActionId = 'search.action.replaceAllInFolder';
    exports.CloseReplaceWidgetActionId = 'closeReplaceInFilesWidget';
    exports.ToggleCaseSensitiveCommandId = 'toggleSearchCaseSensitive';
    exports.ToggleWholeWordCommandId = 'toggleSearchWholeWord';
    exports.ToggleRegexCommandId = 'toggleSearchRegex';
    exports.TogglePreserveCaseId = 'toggleSearchPreserveCase';
    exports.AddCursorsAtSearchResults = 'addCursorsAtSearchResults';
    exports.RevealInSideBarForSearchResults = 'search.action.revealInSideBar';
    exports.ReplaceInFilesActionId = 'workbench.action.replaceInFiles';
    exports.ShowAllSymbolsActionId = 'workbench.action.showAllSymbols';
    exports.QuickTextSearchActionId = 'workbench.action.experimental.quickTextSearch';
    exports.CancelSearchActionId = 'search.action.cancel';
    exports.RefreshSearchResultsActionId = 'search.action.refreshSearchResults';
    exports.FocusNextSearchResultActionId = 'search.action.focusNextSearchResult';
    exports.FocusPreviousSearchResultActionId = 'search.action.focusPreviousSearchResult';
    exports.ToggleSearchOnTypeActionId = 'workbench.action.toggleSearchOnType';
    exports.CollapseSearchResultsActionId = 'search.action.collapseSearchResults';
    exports.ExpandSearchResultsActionId = 'search.action.expandSearchResults';
    exports.ClearSearchResultsActionId = 'search.action.clearSearchResults';
    exports.ViewAsTreeActionId = 'search.action.viewAsTree';
    exports.ViewAsListActionId = 'search.action.viewAsList';
    exports.ToggleQueryDetailsActionId = 'workbench.action.search.toggleQueryDetails';
    exports.ExcludeFolderFromSearchId = 'search.action.excludeFromSearch';
    exports.FocusNextInputActionId = 'search.focus.nextInputBox';
    exports.FocusPreviousInputActionId = 'search.focus.previousInputBox';
    exports.RestrictSearchToFolderId = 'search.action.restrictSearchToFolder';
    exports.FindInFolderId = 'filesExplorer.findInFolder';
    exports.FindInWorkspaceId = 'filesExplorer.findInWorkspace';
    exports.SearchViewVisibleKey = new contextkey_1.RawContextKey('searchViewletVisible', true);
    exports.SearchViewFocusedKey = new contextkey_1.RawContextKey('searchViewletFocus', false);
    exports.InputBoxFocusedKey = new contextkey_1.RawContextKey('inputBoxFocus', false);
    exports.SearchInputBoxFocusedKey = new contextkey_1.RawContextKey('searchInputBoxFocus', false);
    exports.ReplaceInputBoxFocusedKey = new contextkey_1.RawContextKey('replaceInputBoxFocus', false);
    exports.PatternIncludesFocusedKey = new contextkey_1.RawContextKey('patternIncludesInputBoxFocus', false);
    exports.PatternExcludesFocusedKey = new contextkey_1.RawContextKey('patternExcludesInputBoxFocus', false);
    exports.ReplaceActiveKey = new contextkey_1.RawContextKey('replaceActive', false);
    exports.HasSearchResults = new contextkey_1.RawContextKey('hasSearchResult', false);
    exports.FirstMatchFocusKey = new contextkey_1.RawContextKey('firstMatchFocus', false);
    exports.FileMatchOrMatchFocusKey = new contextkey_1.RawContextKey('fileMatchOrMatchFocus', false); // This is actually, Match or File or Folder
    exports.FileMatchOrFolderMatchFocusKey = new contextkey_1.RawContextKey('fileMatchOrFolderMatchFocus', false);
    exports.FileMatchOrFolderMatchWithResourceFocusKey = new contextkey_1.RawContextKey('fileMatchOrFolderMatchWithResourceFocus', false); // Excludes "Other files"
    exports.FileFocusKey = new contextkey_1.RawContextKey('fileMatchFocus', false);
    exports.FolderFocusKey = new contextkey_1.RawContextKey('folderMatchFocus', false);
    exports.ResourceFolderFocusKey = new contextkey_1.RawContextKey('folderMatchWithResourceFocus', false);
    exports.IsEditableItemKey = new contextkey_1.RawContextKey('isEditableItem', true);
    exports.MatchFocusKey = new contextkey_1.RawContextKey('matchFocus', false);
    exports.ViewHasSearchPatternKey = new contextkey_1.RawContextKey('viewHasSearchPattern', false);
    exports.ViewHasReplacePatternKey = new contextkey_1.RawContextKey('viewHasReplacePattern', false);
    exports.ViewHasFilePatternKey = new contextkey_1.RawContextKey('viewHasFilePattern', false);
    exports.ViewHasSomeCollapsibleKey = new contextkey_1.RawContextKey('viewHasSomeCollapsibleResult', false);
    exports.InTreeViewKey = new contextkey_1.RawContextKey('inTreeView', false);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvY29tbW9uL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJbkYsUUFBQSxtQkFBbUIsR0FBRyw4QkFBOEIsQ0FBQztJQUNyRCxRQUFBLDBCQUEwQixHQUFHLGlDQUFpQyxDQUFDO0lBRS9ELFFBQUEsc0JBQXNCLEdBQUcsc0NBQXNDLENBQUM7SUFDaEUsUUFBQSxTQUFTLEdBQUcsMEJBQTBCLENBQUM7SUFDdkMsUUFBQSxlQUFlLEdBQUcsZ0NBQWdDLENBQUM7SUFDbkQsUUFBQSxjQUFjLEdBQUcsc0JBQXNCLENBQUM7SUFDeEMsUUFBQSxpQkFBaUIsR0FBRyx3QkFBd0IsQ0FBQztJQUM3QyxRQUFBLGtCQUFrQixHQUFHLHlCQUF5QixDQUFDO0lBQy9DLFFBQUEsZ0JBQWdCLEdBQUcsdUJBQXVCLENBQUM7SUFDM0MsUUFBQSxxQkFBcUIsR0FBRyw0QkFBNEIsQ0FBQztJQUNyRCxRQUFBLDJCQUEyQixHQUFHLDRCQUE0QixDQUFDO0lBQzNELFFBQUEsd0JBQXdCLEdBQUcsK0JBQStCLENBQUM7SUFDM0QsUUFBQSxlQUFlLEdBQUcsdUJBQXVCLENBQUM7SUFDMUMsUUFBQSx3QkFBd0IsR0FBRyxnQ0FBZ0MsQ0FBQztJQUM1RCxRQUFBLDBCQUEwQixHQUFHLGtDQUFrQyxDQUFDO0lBQ2hFLFFBQUEsMEJBQTBCLEdBQUcsMkJBQTJCLENBQUM7SUFDekQsUUFBQSw0QkFBNEIsR0FBRywyQkFBMkIsQ0FBQztJQUMzRCxRQUFBLHdCQUF3QixHQUFHLHVCQUF1QixDQUFDO0lBQ25ELFFBQUEsb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7SUFDM0MsUUFBQSxvQkFBb0IsR0FBRywwQkFBMEIsQ0FBQztJQUNsRCxRQUFBLHlCQUF5QixHQUFHLDJCQUEyQixDQUFDO0lBQ3hELFFBQUEsK0JBQStCLEdBQUcsK0JBQStCLENBQUM7SUFDbEUsUUFBQSxzQkFBc0IsR0FBRyxpQ0FBaUMsQ0FBQztJQUMzRCxRQUFBLHNCQUFzQixHQUFHLGlDQUFpQyxDQUFDO0lBQzNELFFBQUEsdUJBQXVCLEdBQUcsK0NBQStDLENBQUM7SUFDMUUsUUFBQSxvQkFBb0IsR0FBRyxzQkFBc0IsQ0FBQztJQUM5QyxRQUFBLDRCQUE0QixHQUFHLG9DQUFvQyxDQUFDO0lBQ3BFLFFBQUEsNkJBQTZCLEdBQUcscUNBQXFDLENBQUM7SUFDdEUsUUFBQSxpQ0FBaUMsR0FBRyx5Q0FBeUMsQ0FBQztJQUM5RSxRQUFBLDBCQUEwQixHQUFHLHFDQUFxQyxDQUFDO0lBQ25FLFFBQUEsNkJBQTZCLEdBQUcscUNBQXFDLENBQUM7SUFDdEUsUUFBQSwyQkFBMkIsR0FBRyxtQ0FBbUMsQ0FBQztJQUNsRSxRQUFBLDBCQUEwQixHQUFHLGtDQUFrQyxDQUFDO0lBQ2hFLFFBQUEsa0JBQWtCLEdBQUcsMEJBQTBCLENBQUM7SUFDaEQsUUFBQSxrQkFBa0IsR0FBRywwQkFBMEIsQ0FBQztJQUNoRCxRQUFBLDBCQUEwQixHQUFHLDRDQUE0QyxDQUFDO0lBQzFFLFFBQUEseUJBQXlCLEdBQUcsaUNBQWlDLENBQUM7SUFDOUQsUUFBQSxzQkFBc0IsR0FBRywyQkFBMkIsQ0FBQztJQUNyRCxRQUFBLDBCQUEwQixHQUFHLCtCQUErQixDQUFDO0lBQzdELFFBQUEsd0JBQXdCLEdBQUcsc0NBQXNDLENBQUM7SUFDbEUsUUFBQSxjQUFjLEdBQUcsNEJBQTRCLENBQUM7SUFDOUMsUUFBQSxpQkFBaUIsR0FBRywrQkFBK0IsQ0FBQztJQUVwRCxRQUFBLG9CQUFvQixHQUFHLElBQUksMEJBQWEsQ0FBVSxzQkFBc0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRixRQUFBLG9CQUFvQixHQUFHLElBQUksMEJBQWEsQ0FBVSxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvRSxRQUFBLGtCQUFrQixHQUFHLElBQUksMEJBQWEsQ0FBVSxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDeEUsUUFBQSx3QkFBd0IsR0FBRyxJQUFJLDBCQUFhLENBQVUscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEYsUUFBQSx5QkFBeUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEYsUUFBQSx5QkFBeUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsOEJBQThCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDOUYsUUFBQSx5QkFBeUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsOEJBQThCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDOUYsUUFBQSxnQkFBZ0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RFLFFBQUEsZ0JBQWdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hFLFFBQUEsa0JBQWtCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFFLFFBQUEsd0JBQXdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsNENBQTRDO0lBQ25JLFFBQUEsOEJBQThCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xHLFFBQUEsMENBQTBDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHlDQUF5QyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMseUJBQXlCO0lBQ3BKLFFBQUEsWUFBWSxHQUFHLElBQUksMEJBQWEsQ0FBVSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuRSxRQUFBLGNBQWMsR0FBRyxJQUFJLDBCQUFhLENBQVUsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdkUsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsOEJBQThCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0YsUUFBQSxpQkFBaUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkUsUUFBQSxhQUFhLEdBQUcsSUFBSSwwQkFBYSxDQUFVLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRSxRQUFBLHVCQUF1QixHQUFHLElBQUksMEJBQWEsQ0FBVSxzQkFBc0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwRixRQUFBLHdCQUF3QixHQUFHLElBQUksMEJBQWEsQ0FBVSx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RixRQUFBLHFCQUFxQixHQUFHLElBQUksMEJBQWEsQ0FBVSxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRixRQUFBLHlCQUF5QixHQUFHLElBQUksMEJBQWEsQ0FBVSw4QkFBOEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5RixRQUFBLGFBQWEsR0FBRyxJQUFJLDBCQUFhLENBQVUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDIn0=
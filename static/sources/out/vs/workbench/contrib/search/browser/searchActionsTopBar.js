/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/list/browser/listService", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/common/searchHistoryService", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/search/common/search", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/browser/searchActionsBase"], function (require, exports, nls, listService_1, viewsService_1, searchIcons_1, Constants, searchHistoryService_1, searchModel_1, search_1, contextkey_1, actions_1, search_2, searchActionsBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Actions
    (0, actions_1.registerAction2)(class ClearSearchHistoryCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ClearSearchHistoryCommandId,
                title: {
                    value: nls.localize('clearSearchHistoryLabel', "Clear Search History"),
                    original: 'Clear Search History'
                },
                category: searchActionsBase_1.category,
                f1: true
            });
        }
        async run(accessor) {
            clearHistoryCommand(accessor);
        }
    });
    (0, actions_1.registerAction2)(class CancelSearchAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CancelSearchActionId,
                title: {
                    value: nls.localize('CancelSearchAction.label', "Cancel Search"),
                    original: 'Cancel Search'
                },
                icon: searchIcons_1.searchStopIcon,
                category: searchActionsBase_1.category,
                f1: true,
                precondition: search_2.SearchStateKey.isEqualTo(search_2.SearchUIState.Idle).negate(),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, listService_1.WorkbenchListFocusContextKey),
                    primary: 9 /* KeyCode.Escape */,
                },
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), search_2.SearchStateKey.isEqualTo(search_2.SearchUIState.SlowSearch)),
                    }]
            });
        }
        run(accessor) {
            return cancelSearch(accessor);
        }
    });
    (0, actions_1.registerAction2)(class RefreshAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.RefreshSearchResultsActionId,
                title: {
                    value: nls.localize('RefreshAction.label', "Refresh"),
                    original: 'Refresh'
                },
                icon: searchIcons_1.searchRefreshIcon,
                precondition: Constants.ViewHasSearchPatternKey,
                category: searchActionsBase_1.category,
                f1: true,
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), search_2.SearchStateKey.isEqualTo(search_2.SearchUIState.SlowSearch).negate()),
                    }]
            });
        }
        run(accessor, ...args) {
            return refreshSearch(accessor);
        }
    });
    (0, actions_1.registerAction2)(class CollapseDeepestExpandedLevelAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CollapseSearchResultsActionId,
                title: {
                    value: nls.localize('CollapseDeepestExpandedLevelAction.label', "Collapse All"),
                    original: 'Collapse All'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchCollapseAllIcon,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.ViewHasSomeCollapsibleKey),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults.negate(), Constants.ViewHasSomeCollapsibleKey)),
                    }]
            });
        }
        run(accessor, ...args) {
            return collapseDeepestExpandedLevel(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ExpandAllAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ExpandSearchResultsActionId,
                title: {
                    value: nls.localize('ExpandAllAction.label', "Expand All"),
                    original: 'Expand All'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchExpandAllIcon,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.ViewHasSomeCollapsibleKey.toNegated()),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), Constants.HasSearchResults, Constants.ViewHasSomeCollapsibleKey.toNegated()),
                    }]
            });
        }
        run(accessor, ...args) {
            return expandAll(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ClearSearchResultsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ClearSearchResultsActionId,
                title: {
                    value: nls.localize('ClearSearchResultsAction.label', "Clear Search Results"),
                    original: 'Clear Search Results'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchClearIcon,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults, Constants.ViewHasSearchPatternKey, Constants.ViewHasReplacePatternKey, Constants.ViewHasFilePatternKey),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 1,
                        when: contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID),
                    }]
            });
        }
        run(accessor, ...args) {
            return clearSearchResults(accessor);
        }
    });
    (0, actions_1.registerAction2)(class ViewAsTreeAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ViewAsTreeActionId,
                title: {
                    value: nls.localize('ViewAsTreeAction.label', "View as Tree"),
                    original: 'View as Tree'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchShowAsList,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.InTreeViewKey.toNegated()),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 2,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), Constants.InTreeViewKey.toNegated()),
                    }]
            });
        }
        run(accessor, ...args) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
            if (searchView) {
                searchView.setTreeView(true);
            }
        }
    });
    (0, actions_1.registerAction2)(class ViewAsListAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ViewAsListActionId,
                title: {
                    value: nls.localize('ViewAsListAction.label', "View as List"),
                    original: 'View as List'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchShowAsTree,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.InTreeViewKey),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 2,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', search_1.VIEW_ID), Constants.InTreeViewKey),
                    }]
            });
        }
        run(accessor, ...args) {
            const searchView = (0, searchActionsBase_1.getSearchView)(accessor.get(viewsService_1.IViewsService));
            if (searchView) {
                searchView.setTreeView(false);
            }
        }
    });
    //#endregion
    //#region Helpers
    const clearHistoryCommand = accessor => {
        const searchHistoryService = accessor.get(searchHistoryService_1.ISearchHistoryService);
        searchHistoryService.clearHistory();
    };
    function expandAll(accessor) {
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        if (searchView) {
            const viewer = searchView.getControl();
            viewer.expandAll();
        }
    }
    function clearSearchResults(accessor) {
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        searchView?.clearSearchResults();
    }
    function cancelSearch(accessor) {
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        searchView?.cancelSearch();
    }
    function refreshSearch(accessor) {
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        searchView?.triggerQueryChange({ preserveFocus: false });
    }
    function collapseDeepestExpandedLevel(accessor) {
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        if (searchView) {
            const viewer = searchView.getControl();
            /**
             * one level to collapse so collapse everything. If FolderMatch, check if there are visible grandchildren,
             * i.e. if Matches are returned by the navigator, and if so, collapse to them, otherwise collapse all levels.
             */
            const navigator = viewer.navigate();
            let node = navigator.first();
            let canCollapseFileMatchLevel = false;
            let canCollapseFirstLevel = false;
            if (node instanceof searchModel_1.FolderMatchWorkspaceRoot || searchView.isTreeLayoutViewVisible) {
                while (node = navigator.next()) {
                    if (node instanceof searchModel_1.Match) {
                        canCollapseFileMatchLevel = true;
                        break;
                    }
                    if (searchView.isTreeLayoutViewVisible && !canCollapseFirstLevel) {
                        let nodeToTest = node;
                        if (node instanceof searchModel_1.FolderMatch) {
                            const compressionStartNode = viewer.getCompressedTreeNode(node).element?.elements[0];
                            // Match elements should never be compressed, so !(compressionStartNode instanceof Match) should always be true here
                            nodeToTest = (compressionStartNode && !(compressionStartNode instanceof searchModel_1.Match)) ? compressionStartNode : node;
                        }
                        const immediateParent = nodeToTest.parent();
                        if (!(immediateParent instanceof searchModel_1.FolderMatchWorkspaceRoot || immediateParent instanceof searchModel_1.FolderMatchNoRoot || immediateParent instanceof searchModel_1.SearchResult)) {
                            canCollapseFirstLevel = true;
                        }
                    }
                }
            }
            if (canCollapseFileMatchLevel) {
                node = navigator.first();
                do {
                    if (node instanceof searchModel_1.FileMatch) {
                        viewer.collapse(node);
                    }
                } while (node = navigator.next());
            }
            else if (canCollapseFirstLevel) {
                node = navigator.first();
                if (node) {
                    do {
                        let nodeToTest = node;
                        if (node instanceof searchModel_1.FolderMatch) {
                            const compressionStartNode = viewer.getCompressedTreeNode(node).element?.elements[0];
                            // Match elements should never be compressed, so !(compressionStartNode instanceof Match) should always be true here
                            nodeToTest = (compressionStartNode && !(compressionStartNode instanceof searchModel_1.Match)) ? compressionStartNode : node;
                        }
                        const immediateParent = nodeToTest.parent();
                        if (immediateParent instanceof searchModel_1.FolderMatchWorkspaceRoot || immediateParent instanceof searchModel_1.FolderMatchNoRoot) {
                            if (viewer.hasElement(node)) {
                                viewer.collapse(node, true);
                            }
                            else {
                                viewer.collapseAll();
                            }
                        }
                    } while (node = navigator.next());
                }
            }
            else {
                viewer.collapseAll();
            }
            const firstFocusParent = viewer.getFocus()[0]?.parent();
            if (firstFocusParent && (firstFocusParent instanceof searchModel_1.FolderMatch || firstFocusParent instanceof searchModel_1.FileMatch) &&
                viewer.hasElement(firstFocusParent) && viewer.isCollapsed(firstFocusParent)) {
                viewer.domFocus();
                viewer.focusFirst();
                viewer.setSelection(viewer.getFocus());
            }
        }
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc1RvcEJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvc2VhcmNoQWN0aW9uc1RvcEJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQW1CaEcsaUJBQWlCO0lBQ2pCLElBQUEseUJBQWUsRUFBQyxNQUFNLCtCQUFnQyxTQUFRLGlCQUFPO1FBRXBFO1lBRUMsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsMkJBQTJCO2dCQUN6QyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsc0JBQXNCLENBQUM7b0JBQ3RFLFFBQVEsRUFBRSxzQkFBc0I7aUJBQ2hDO2dCQUNELFFBQVEsRUFBUiw0QkFBUTtnQkFDUixFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUVKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQzVDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxrQkFBbUIsU0FBUSxpQkFBTztRQUN2RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsU0FBUyxDQUFDLG9CQUFvQjtnQkFDbEMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLGVBQWUsQ0FBQztvQkFDaEUsUUFBUSxFQUFFLGVBQWU7aUJBQ3pCO2dCQUNELElBQUksRUFBRSw0QkFBYztnQkFDcEIsUUFBUSxFQUFSLDRCQUFRO2dCQUNSLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSx1QkFBYyxDQUFDLFNBQVMsQ0FBQyxz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
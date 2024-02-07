/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/list/browser/listService", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/editor/common/editorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/base/common/arrays"], function (require, exports, nls, configuration_1, listService_1, viewsService_1, searchIcons_1, Constants, replace_1, searchModel_1, editorService_1, uriIdentity_1, contextkey_1, actions_1, searchActionsBase_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLastNodeFromSameType = exports.getElementToFocusAfterRemoved = void 0;
    //#endregion
    //#region Actions
    (0, actions_1.registerAction2)(class RemoveAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.RemoveActionId,
                title: {
                    value: nls.localize('RemoveAction.label', "Dismiss"),
                    original: 'Dismiss'
                },
                category: searchActionsBase_1.category,
                icon: searchIcons_1.searchRemoveIcon,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
                    primary: 20 /* KeyCode.Delete */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                    },
                },
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        group: 'search',
                        order: 2,
                    },
                    {
                        id: actions_1.MenuId.SearchActionMenu,
                        group: 'inline',
                        order: 2,
                    },
                ]
            });
        }
        run(accessor, context) {
            const viewsService = accessor.get(viewsService_1.IViewsService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
            if (!searchView) {
                return;
            }
            let element = context?.element;
            let viewer = context?.viewer;
            if (!viewer) {
                viewer = searchView.getControl();
            }
            if (!element) {
                element = viewer.getFocus()[0] ?? undefined;
            }
            const elementsToRemove = (0, searchActionsBase_1.getElementsToOperateOn)(viewer, element, configurationService.getValue('search'));
            let focusElement = viewer.getFocus()[0] ?? undefined;
            if (elementsToRemove.length === 0) {
                return;
            }
            if (!focusElement || (focusElement instanceof searchModel_1.SearchResult)) {
                focusElement = element;
            }
            let nextFocusElement;
            const shouldRefocusMatch = (0, searchActionsBase_1.shouldRefocus)(elementsToRemove, focusElement);
            if (focusElement && shouldRefocusMatch) {
                nextFocusElement = getElementToFocusAfterRemoved(viewer, focusElement, elementsToRemove);
            }
            const searchResult = searchView.searchResult;
            if (searchResult) {
                searchResult.batchRemove(elementsToRemove);
            }
            if (focusElement && shouldRefocusMatch) {
                if (!nextFocusElement) {
                    nextFocusElement = getLastNodeFromSameType(viewer, focusElement);
                }
                if (nextFocusElement && !(0, searchModel_1.arrayContainsElementOrParent)(nextFocusElement, elementsToRemove)) {
                    viewer.reveal(nextFocusElement);
                    viewer.setFocus([nextFocusElement], (0, listService_1.getSelectionKeyboardEvent)());
                    viewer.setSelection([nextFocusElement], (0, listService_1.getSelectionKeyboardEvent)());
                }
            }
            else if (!(0, arrays_1.equals)(viewer.getFocus(), viewer.getSelection())) {
                viewer.setSelection(viewer.getFocus());
            }
            viewer.domFocus();
            return;
        }
    });
    (0, actions_1.registerAction2)(class ReplaceAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ReplaceActionId,
                title: {
                    value: nls.localize('match.replace.label', "Replace"),
                    original: 'Replace'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.MatchFocusKey, Constants.IsEditableItemKey),
                    primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                },
                icon: searchIcons_1.searchReplaceIcon,
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.MatchFocusKey, Constants.IsEditableItemKey),
                        group: 'search',
                        order: 1
                    },
                    {
                        id: actions_1.MenuId.SearchActionMenu,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.MatchFocusKey, Constants.IsEditableItemKey),
                        group: 'inline',
                        order: 1
                    }
                ]
            });
        }
        async run(accessor, context) {
            return performReplace(accessor, context);
        }
    });
    (0, actions_1.registerAction2)(class ReplaceAllAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ReplaceAllInFileActionId,
                title: {
                    value: nls.localize('file.replaceAll.label', "Replace All"),
                    original: 'Replace All'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.FileFocusKey, Constants.IsEditableItemKey),
                    primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */],
                },
                icon: searchIcons_1.searchReplaceIcon,
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FileFocusKey, Constants.IsEditableItemKey),
                        group: 'search',
                        order: 1
                    },
                    {
                        id: actions_1.MenuId.SearchActionMenu,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FileFocusKey, Constants.IsEditableItemKey),
                        group: 'inline',
                        order: 1
                    }
                ]
            });
        }
        async run(accessor, context) {
            return performReplace(accessor, context);
        }
    });
    (0, actions_1.registerAction2)(class ReplaceAllInFolderAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.ReplaceAllInFolderActionId,
                title: {
                    value: nls.localize('file.replaceAll.label', "Replace All"),
                    original: 'Replace All'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.FolderFocusKey, Constants.IsEditableItemKey),
                    primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */],
                },
                icon: searchIcons_1.searchReplaceIcon,
                menu: [
                    {
                        id: actions_1.MenuId.SearchContext,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FolderFocusKey, Constants.IsEditableItemKey),
                        group: 'search',
                        order: 1
                    },
                    {
                        id: actions_1.MenuId.SearchActionMenu,
                        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FolderFocusKey, Constants.IsEditableItemKey),
                        group: 'inline',
                        order: 1
                    }
                ]
            });
        }
        async run(accessor, context) {
            return performReplace(accessor, context);
        }
    });
    //#endregion
    //#region Helpers
    function performReplace(accessor, context) {
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const viewlet = (0, searchActionsBase_1.getSearchView)(viewsService);
        const viewer = context?.viewer ?? viewlet?.getControl();
        if (!viewer) {
            return;
        }
        const element = context?.element ?? viewer.getFocus()[0];
        // since multiple elements can be selected, we need to check the type of the FolderMatch/FileMatch/Match before we perform the replace.
        const elementsToReplace = (0, searchActionsBase_1.getElementsToOperateOn)(viewer, element ?? undefined, configurationService.getValue('search'));
        let focusElement = viewer.getFocus()[0];
        if (!focusElement || (focusElement && !(0, searchModel_1.arrayContainsElementOrParent)(focusElement, elementsToReplace)) || (focusElement instanceof searchModel_1.SearchResult)) {
            focusElement = element;
        }
        if (elementsToReplace.length === 0) {
            return;
        }
        let nextFocusElement;
        if (focusElement) {
            nextFocusElement = getElementToFocusAfterRemoved(viewer, focusElement, elementsToReplace);
        }
        const searchResult = viewlet?.searchResult;
        if (searchResult) {
            searchResult.batchReplace(elementsToReplace);
        }
        if (focusElement) {
            if (!nextFocusElement) {
                nextFocusElement = getLastNodeFromSameType(viewer, focusElement);
            }
            if (nextFocusElement) {
                viewer.reveal(nextFocusElement);
                viewer.setFocus([nextFocusElement], (0, listService_1.getSelectionKeyboardEvent)());
                viewer.setSelection([nextFocusElement], (0, listService_1.getSelectionKeyboardEvent)());
                if (nextFocusElement instanceof searchModel_1.Match) {
                    const useReplacePreview = configurationService.getValue().search.useReplacePreview;
                    if (!useReplacePreview || hasToOpenFile(accessor, nextFocusElement) || nextFocusElement instanceof searchModel_1.MatchInNotebook) {
                        viewlet?.open(nextFocusElement, true);
                    }
                    else {
                        accessor.get(replace_1.IReplaceService).openReplacePreview(nextFocusElement, true);
                    }
                }
                else if (nextFocusElement instanceof searchModel_1.FileMatch) {
                    viewlet?.open(nextFocusElement, true);
                }
            }
        }
        viewer.domFocus();
    }
    function hasToOpenFile(accessor, currBottomElem) {
        if (!(currBottomElem instanceof searchModel_1.Match)) {
            return false;
        }
        const activeEditor = accessor.get(editorService_1.IEditorService).activeEditor;
        const file = activeEditor?.resource;
        if (file) {
            return accessor.get(uriIdentity_1.IUriIdentityService).extUri.isEqual(file, currBottomElem.parent().resource);
        }
        return false;
    }
    function compareLevels(elem1, elem2) {
        if (elem1 instanceof searchModel_1.Match) {
            if (elem2 instanceof searchModel_1.Match) {
                return 0;
            }
            else {
                return -1;
            }
        }
        else if (elem1 instanceof searchModel_1.FileMatch) {
            if (elem2 instanceof searchModel_1.Match) {
                return 1;
            }
            else if (elem2 instanceof searchModel_1.FileMatch) {
                return 0;
            }
            else {
                return -1;
            }
        }
        else {
            // FolderMatch
            if (elem2 instanceof searchModel_1.FolderMatch) {
                return 0;
            }
            else {
                return 1;
            }
        }
    }
    /**
     * Returns element to focus after removing the given element
     */
    function getElementToFocusAfterRemoved(viewer, element, elementsToRemove) {
        const navigator = viewer.navigate(element);
        if (element instanceof searchModel_1.FolderMatch) {
            while (!!navigator.next() && (!(navigator.current() instanceof searchModel_1.FolderMatch) || (0, searchModel_1.arrayContainsElementOrParent)(navigator.current(), elementsToRemove))) { }
        }
        else if (element instanceof searchModel_1.FileMatch) {
            while (!!navigator.next() && (!(navigator.current() instanceof searchModel_1.FileMatch) || (0, searchModel_1.arrayContainsElementOrParent)(navigator.current(), elementsToRemove))) {
                viewer.expand(navigator.current());
            }
        }
        else {
            while (navigator.next() && (!(navigator.current() instanceof searchModel_1.Match) || (0, searchModel_1.arrayContainsElementOrParent)(navigator.current(), elementsToRemove))) {
                viewer.expand(navigator.current());
            }
        }
        return navigator.current();
    }
    exports.getElementToFocusAfterRemoved = getElementToFocusAfterRemoved;
    /***
     * Finds the last element in the tree with the same type as `element`
     */
    function getLastNodeFromSameType(viewer, element) {
        let lastElem = viewer.lastVisibleElement ?? null;
        while (lastElem) {
            const compareVal = compareLevels(element, lastElem);
            if (compareVal === -1) {
                viewer.expand(lastElem);
                lastElem = viewer.lastVisibleElement;
            }
            else if (compareVal === 1) {
                lastElem = viewer.getParentElement(lastElem);
            }
            else {
                return lastElem;
            }
        }
        return undefined;
    }
    exports.getLastNodeFromSameType = getLastNodeFromSameType;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc1JlbW92ZVJlcGxhY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaEFjdGlvbnNSZW1vdmVSZXBsYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTZDaEcsWUFBWTtJQUVaLGlCQUFpQjtJQUNqQixJQUFBLHlCQUFlLEVBQUMsTUFBTSxZQUFhLFNBQVEsaUJBQU87UUFFakQ7WUFFQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLFNBQVMsQ0FBQyxjQUFjO2dCQUM1QixLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDO29CQUNwRCxRQUFRLEVBQUUsU0FBUztpQkFDbkI7Z0JBQ0QsUUFBUSxFQUFSLDRCQUFRO2dCQUNSLElBQUksRUFBRSw4QkFBZ0I7Z0JBQ3RCLFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsd0JBQXdCLENBQUM7b0JBQzVGLE9BQU8seUJBQWdCO29CQUN2QixHQUFHLEVBQUU7d0JBQ0osT0FBTyxFQUFFLHFEQUFrQztxQkFDM0M7aUJBQ0Q7Z0JBQ0QsSUFBSSxFQUFFO29CQUNMO3dCQUNDLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGFBQWE7d0JBQ3hCLEtBQUssRUFBRSxRQUFRO3dCQUNmLEtBQUssRUFBRSxDQUFDO3FCQUNSO29CQUNEO3dCQUNDLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGdCQUFnQjt3QkFDM0IsS0FBSyxFQUFFLFFBQVE7d0JBQ2YsS0FBSyxFQUFFLENBQUM7cUJBQ1I7aUJBQ0Q7YUFDRCxDQUFDLENBQUM7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
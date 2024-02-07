/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/nls", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/search/common/search"], function (require, exports, DOM, nls, searchModel_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.openSearchView = exports.shouldRefocus = exports.getElementsToOperateOn = exports.getSearchView = exports.appendKeyBindingLabel = exports.isSearchViewFocused = exports.category = void 0;
    exports.category = { value: nls.localize('search', "Search"), original: 'Search' };
    function isSearchViewFocused(viewsService) {
        const searchView = getSearchView(viewsService);
        return !!(searchView && DOM.isAncestorOfActiveElement(searchView.getContainer()));
    }
    exports.isSearchViewFocused = isSearchViewFocused;
    function appendKeyBindingLabel(label, inputKeyBinding) {
        return doAppendKeyBindingLabel(label, inputKeyBinding);
    }
    exports.appendKeyBindingLabel = appendKeyBindingLabel;
    function getSearchView(viewsService) {
        return viewsService.getActiveViewWithId(search_1.VIEW_ID);
    }
    exports.getSearchView = getSearchView;
    function getElementsToOperateOn(viewer, currElement, sortConfig) {
        let elements = viewer.getSelection().filter((x) => x !== null).sort((a, b) => (0, searchModel_1.searchComparer)(a, b, sortConfig.sortOrder));
        // if selection doesn't include multiple elements, just return current focus element.
        if (currElement && !(elements.length > 1 && elements.includes(currElement))) {
            elements = [currElement];
        }
        return elements;
    }
    exports.getElementsToOperateOn = getElementsToOperateOn;
    /**
     * @param elements elements that are going to be removed
     * @param focusElement element that is focused
     * @returns whether we need to re-focus on a remove
     */
    function shouldRefocus(elements, focusElement) {
        if (!focusElement) {
            return false;
        }
        return !focusElement || elements.includes(focusElement) || hasDownstreamMatch(elements, focusElement);
    }
    exports.shouldRefocus = shouldRefocus;
    function hasDownstreamMatch(elements, focusElement) {
        for (const elem of elements) {
            if ((elem instanceof searchModel_1.FileMatch && focusElement instanceof searchModel_1.Match && elem.matches().includes(focusElement)) ||
                (elem instanceof searchModel_1.FolderMatch && ((focusElement instanceof searchModel_1.FileMatch && elem.getDownstreamFileMatch(focusElement.resource)) ||
                    (focusElement instanceof searchModel_1.Match && elem.getDownstreamFileMatch(focusElement.parent().resource))))) {
                return true;
            }
        }
        return false;
    }
    function openSearchView(viewsService, focus) {
        return viewsService.openView(search_1.VIEW_ID, focus).then(view => (view ?? undefined));
    }
    exports.openSearchView = openSearchView;
    function doAppendKeyBindingLabel(label, keyBinding) {
        return keyBinding ? label + ' (' + keyBinding.getLabel() + ')' : label;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc0Jhc2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaEFjdGlvbnNCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVduRixRQUFBLFFBQVEsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFFeEYsU0FBZ0IsbUJBQW1CLENBQUMsWUFBMkI7UUFDOUQsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFIRCxrREFHQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLEtBQWEsRUFBRSxlQUErQztRQUNuRyxPQUFPLHVCQUF1QixDQUFDLEtBQUssRUFBRSxlQUFlLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRkQsc0RBRUM7SUFFRCxTQUFnQixhQUFhLENBQUMsWUFBMkI7UUFDeEQsT0FBTyxZQUFZLENBQUMsbUJBQW1CLENBQUMsZ0JBQU8sQ0FBZSxDQUFDO0lBQ2hFLENBQUM7SUFGRCxzQ0FFQztJQUVELFNBQWdCLHNCQUFzQixDQUFDLE1BQThELEVBQUUsV0FBd0MsRUFBRSxVQUEwQztRQUMxTCxJQUFJLFFBQVEsR0FBc0IsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBd0IsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFBLDRCQUFjLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUVuSyxxRkFBcUY7UUFDckYsSUFBSSxXQUFXLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzdFLFFBQVEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBVEQsd0RBU0M7SUFFRDs7OztPQUlHO0lBQ0gsU0FBZ0IsYUFBYSxDQUFDLFFBQTJCLEVBQUUsWUFBeUM7UUFDbkcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25CLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUNELE9BQU8sQ0FBQyxZQUFZLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdkcsQ0FBQztJQUxELHNDQUtDO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxRQUEyQixFQUFFLFlBQTZCO1FBQ3JGLEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLElBQUksWUFBWSx1QkFBUyxJQUFJLFlBQVksWUFBWSxtQkFBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3hHLENBQUMsSUFBSSxZQUFZLHlCQUFXLElBQUksQ0FDL0IsQ0FBQyxZQUFZLFlBQVksdUJBQVMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN6RixDQUFDLFlBQVksWUFBWSxtQkFBSyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FDOUYsQ0FBQyxFQUFFLENBQUM7Z0JBQ0wsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1FBQ0YsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBRWQsQ0FBQztJQUVELFNBQWdCLGNBQWMsQ0FBQyxZQUEyQixFQUFFLEtBQWU7UUFDMUUsT0FBTyxZQUFZLENBQUMsUUFBUSxDQUFDLGdCQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFrQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUZELHdDQUVDO0lBRUQsU0FBUyx1QkFBdUIsQ0FBQyxLQUFhLEVBQUUsVUFBMEM7UUFDekYsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3hFLENBQUMifQ==
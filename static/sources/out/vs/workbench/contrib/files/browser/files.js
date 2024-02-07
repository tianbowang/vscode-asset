/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/contrib/files/common/files", "vs/workbench/common/editor", "vs/base/browser/ui/list/listWidget", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/arrays", "vs/base/browser/ui/tree/asyncDataTree", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dom"], function (require, exports, uri_1, files_1, editor_1, listWidget_1, explorerModel_1, arrays_1, asyncDataTree_1, instantiation_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOpenEditorsViewMultiSelection = exports.getMultiSelectedResources = exports.getResourceForCommand = exports.IExplorerService = void 0;
    exports.IExplorerService = (0, instantiation_1.createDecorator)('explorerService');
    function getFocus(listService) {
        const list = listService.lastFocusedList;
        const element = list?.getHTMLElement();
        if (element && (0, dom_1.isActiveElement)(element)) {
            let focus;
            if (list instanceof listWidget_1.List) {
                const focused = list.getFocusedElements();
                if (focused.length) {
                    focus = focused[0];
                }
            }
            else if (list instanceof asyncDataTree_1.AsyncDataTree) {
                const focused = list.getFocus();
                if (focused.length) {
                    focus = focused[0];
                }
            }
            return focus;
        }
        return undefined;
    }
    // Commands can get executed from a command palette, from a context menu or from some list using a keybinding
    // To cover all these cases we need to properly compute the resource on which the command is being executed
    function getResourceForCommand(resource, listService, editorService) {
        if (uri_1.URI.isUri(resource)) {
            return resource;
        }
        const focus = getFocus(listService);
        if (focus instanceof explorerModel_1.ExplorerItem) {
            return focus.resource;
        }
        else if (focus instanceof files_1.OpenEditor) {
            return focus.getResource();
        }
        return editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
    }
    exports.getResourceForCommand = getResourceForCommand;
    function getMultiSelectedResources(resource, listService, editorService, explorerService) {
        const list = listService.lastFocusedList;
        const element = list?.getHTMLElement();
        if (element && (0, dom_1.isActiveElement)(element)) {
            // Explorer
            if (list instanceof asyncDataTree_1.AsyncDataTree && list.getFocus().every(item => item instanceof explorerModel_1.ExplorerItem)) {
                // Explorer
                const context = explorerService.getContext(true, true);
                if (context.length) {
                    return context.map(c => c.resource);
                }
            }
            // Open editors view
            if (list instanceof listWidget_1.List) {
                const selection = (0, arrays_1.coalesce)(list.getSelectedElements().filter(s => s instanceof files_1.OpenEditor).map((oe) => oe.getResource()));
                const focusedElements = list.getFocusedElements();
                const focus = focusedElements.length ? focusedElements[0] : undefined;
                let mainUriStr = undefined;
                if (uri_1.URI.isUri(resource)) {
                    mainUriStr = resource.toString();
                }
                else if (focus instanceof files_1.OpenEditor) {
                    const focusedResource = focus.getResource();
                    mainUriStr = focusedResource ? focusedResource.toString() : undefined;
                }
                // We only respect the selection if it contains the main element.
                if (selection.some(s => s.toString() === mainUriStr)) {
                    return selection;
                }
            }
        }
        const result = getResourceForCommand(resource, listService, editorService);
        return !!result ? [result] : [];
    }
    exports.getMultiSelectedResources = getMultiSelectedResources;
    function getOpenEditorsViewMultiSelection(listService, editorGroupService) {
        const list = listService.lastFocusedList;
        const element = list?.getHTMLElement();
        if (element && (0, dom_1.isActiveElement)(element)) {
            // Open editors view
            if (list instanceof listWidget_1.List) {
                const selection = (0, arrays_1.coalesce)(list.getSelectedElements().filter(s => s instanceof files_1.OpenEditor));
                const focusedElements = list.getFocusedElements();
                const focus = focusedElements.length ? focusedElements[0] : undefined;
                let mainEditor = undefined;
                if (focus instanceof files_1.OpenEditor) {
                    mainEditor = focus;
                }
                // We only respect the selection if it contains the main element.
                if (selection.some(s => s === mainEditor)) {
                    return selection;
                }
                return mainEditor ? [mainEditor] : undefined;
            }
        }
        return undefined;
    }
    exports.getOpenEditorsViewMultiSelection = getOpenEditorsViewMultiSelection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL2Jyb3dzZXIvZmlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBOENuRixRQUFBLGdCQUFnQixHQUFHLElBQUEsK0JBQWUsRUFBbUIsaUJBQWlCLENBQUMsQ0FBQztJQWtCckYsU0FBUyxRQUFRLENBQUMsV0FBeUI7UUFDMUMsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQztRQUN6QyxNQUFNLE9BQU8sR0FBRyxJQUFJLEVBQUUsY0FBYyxFQUFFLENBQUM7UUFDdkMsSUFBSSxPQUFPLElBQUksSUFBQSxxQkFBZSxFQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDekMsSUFBSSxLQUFjLENBQUM7WUFDbkIsSUFBSSxJQUFJLFlBQVksaUJBQUksRUFBRSxDQUFDO2dCQUMxQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3BCLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7WUFDRixDQUFDO2lCQUFNLElBQUksSUFBSSxZQUFZLDZCQUFhLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDcEIsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsQ0FBQztZQUNGLENBQUM7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRUQsNkdBQTZHO0lBQzdHLDJHQUEyRztJQUMz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
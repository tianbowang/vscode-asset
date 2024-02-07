/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/platform/actions/common/actions", "vs/base/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/arrays", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/dom", "vs/base/common/resourceTree"], function (require, exports, path, actions_1, actions_2, menuEntryActionViewItem_1, arrays_1, actionViewItems_1, iconLabels_1, dom_1, resourceTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getActionViewItemProvider = exports.StatusBarAction = exports.collectContextMenuActions = exports.connectPrimaryMenuToInlineActionBar = exports.connectPrimaryMenu = exports.toDiffEditorArguments = exports.isSCMViewSeparator = exports.isSCMHistoryItemChangeNode = exports.isSCMHistoryItemChangeTreeElement = exports.isSCMHistoryItemTreeElement = exports.isSCMHistoryItemGroupTreeElement = exports.isSCMResourceNode = exports.isSCMResource = exports.isSCMResourceGroup = exports.isSCMActionButton = exports.isSCMInput = exports.isSCMRepository = exports.isSCMViewService = exports.isSCMRepositoryArray = void 0;
    function isSCMRepositoryArray(element) {
        return Array.isArray(element) && element.every(r => isSCMRepository(r));
    }
    exports.isSCMRepositoryArray = isSCMRepositoryArray;
    function isSCMViewService(element) {
        return Array.isArray(element.repositories) && Array.isArray(element.visibleRepositories);
    }
    exports.isSCMViewService = isSCMViewService;
    function isSCMRepository(element) {
        return !!element.provider && !!element.input;
    }
    exports.isSCMRepository = isSCMRepository;
    function isSCMInput(element) {
        return !!element.validateInput && typeof element.value === 'string';
    }
    exports.isSCMInput = isSCMInput;
    function isSCMActionButton(element) {
        return element.type === 'actionButton';
    }
    exports.isSCMActionButton = isSCMActionButton;
    function isSCMResourceGroup(element) {
        return !!element.provider && !!element.resources;
    }
    exports.isSCMResourceGroup = isSCMResourceGroup;
    function isSCMResource(element) {
        return !!element.sourceUri && isSCMResourceGroup(element.resourceGroup);
    }
    exports.isSCMResource = isSCMResource;
    function isSCMResourceNode(element) {
        return resourceTree_1.ResourceTree.isResourceNode(element) && isSCMResourceGroup(element.context);
    }
    exports.isSCMResourceNode = isSCMResourceNode;
    function isSCMHistoryItemGroupTreeElement(element) {
        return element.type === 'historyItemGroup';
    }
    exports.isSCMHistoryItemGroupTreeElement = isSCMHistoryItemGroupTreeElement;
    function isSCMHistoryItemTreeElement(element) {
        return element.type === 'allChanges' ||
            element.type === 'historyItem';
    }
    exports.isSCMHistoryItemTreeElement = isSCMHistoryItemTreeElement;
    function isSCMHistoryItemChangeTreeElement(element) {
        return element.type === 'historyItemChange';
    }
    exports.isSCMHistoryItemChangeTreeElement = isSCMHistoryItemChangeTreeElement;
    function isSCMHistoryItemChangeNode(element) {
        return resourceTree_1.ResourceTree.isResourceNode(element) && isSCMHistoryItemTreeElement(element.context);
    }
    exports.isSCMHistoryItemChangeNode = isSCMHistoryItemChangeNode;
    function isSCMViewSeparator(element) {
        return element.type === 'separator';
    }
    exports.isSCMViewSeparator = isSCMViewSeparator;
    function toDiffEditorArguments(uri, originalUri, modifiedUri) {
        const basename = path.basename(uri.fsPath);
        const originalQuery = JSON.parse(originalUri.query);
        const modifiedQuery = JSON.parse(modifiedUri.query);
        const originalShortRef = originalQuery.ref.substring(0, 8).concat(originalQuery.ref.endsWith('^') ? '^' : '');
        const modifiedShortRef = modifiedQuery.ref.substring(0, 8).concat(modifiedQuery.ref.endsWith('^') ? '^' : '');
        return [originalUri, modifiedUri, `${basename} (${originalShortRef}) ↔ ${basename} (${modifiedShortRef})`, null];
    }
    exports.toDiffEditorArguments = toDiffEditorArguments;
    const compareActions = (a, b) => {
        if (a instanceof actions_1.MenuItemAction && b instanceof actions_1.MenuItemAction) {
            return a.id === b.id && a.enabled === b.enabled && a.hideActions?.isHidden === b.hideActions?.isHidden;
        }
        return a.id === b.id && a.enabled === b.enabled;
    };
    function connectPrimaryMenu(menu, callback, primaryGroup) {
        let cachedPrimary = [];
        let cachedSecondary = [];
        const updateActions = () => {
            const primary = [];
            const secondary = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, { primary, secondary }, primaryGroup);
            if ((0, arrays_1.equals)(cachedPrimary, primary, compareActions) && (0, arrays_1.equals)(cachedSecondary, secondary, compareActions)) {
                return;
            }
            cachedPrimary = primary;
            cachedSecondary = secondary;
            callback(primary, secondary);
        };
        updateActions();
        return menu.onDidChange(updateActions);
    }
    exports.connectPrimaryMenu = connectPrimaryMenu;
    function connectPrimaryMenuToInlineActionBar(menu, actionBar) {
        return connectPrimaryMenu(menu, (primary) => {
            actionBar.clear();
            actionBar.push(primary, { icon: true, label: false });
        }, 'inline');
    }
    exports.connectPrimaryMenuToInlineActionBar = connectPrimaryMenuToInlineActionBar;
    function collectContextMenuActions(menu) {
        const primary = [];
        const actions = [];
        (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, { primary, secondary: actions }, 'inline');
        return actions;
    }
    exports.collectContextMenuActions = collectContextMenuActions;
    class StatusBarAction extends actions_2.Action {
        constructor(command, commandService) {
            super(`statusbaraction{${command.id}}`, command.title, '', true);
            this.command = command;
            this.commandService = commandService;
            this.tooltip = command.tooltip || '';
        }
        run() {
            return this.commandService.executeCommand(this.command.id, ...(this.command.arguments || []));
        }
    }
    exports.StatusBarAction = StatusBarAction;
    class StatusBarActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(action) {
            super(null, action, {});
        }
        updateLabel() {
            if (this.options.label && this.label) {
                (0, dom_1.reset)(this.label, ...(0, iconLabels_1.renderLabelWithIcons)(this.action.label));
            }
        }
    }
    function getActionViewItemProvider(instaService) {
        return action => {
            if (action instanceof StatusBarAction) {
                return new StatusBarActionViewItem(action);
            }
            return (0, menuEntryActionViewItem_1.createActionViewItem)(instaService, action);
        };
    }
    exports.getActionViewItemProvider = getActionViewItemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2NtL2Jyb3dzZXIvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQmhHLFNBQWdCLG9CQUFvQixDQUFDLE9BQVk7UUFDaEQsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRkQsb0RBRUM7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxPQUFZO1FBQzVDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBRSxPQUEyQixDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUUsT0FBMkIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3BJLENBQUM7SUFGRCw0Q0FFQztJQUVELFNBQWdCLGVBQWUsQ0FBQyxPQUFZO1FBQzNDLE9BQU8sQ0FBQyxDQUFFLE9BQTBCLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBRSxPQUEwQixDQUFDLEtBQUssQ0FBQztJQUN0RixDQUFDO0lBRkQsMENBRUM7SUFFRCxTQUFnQixVQUFVLENBQUMsT0FBWTtRQUN0QyxPQUFPLENBQUMsQ0FBRSxPQUFxQixDQUFDLGFBQWEsSUFBSSxPQUFRLE9BQXFCLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQztJQUNuRyxDQUFDO0lBRkQsZ0NBRUM7SUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxPQUFZO1FBQzdDLE9BQVEsT0FBNEIsQ0FBQyxJQUFJLEtBQUssY0FBYyxDQUFDO0lBQzlELENBQUM7SUFGRCw4Q0FFQztJQUVELFNBQWdCLGtCQUFrQixDQUFDLE9BQVk7UUFDOUMsT0FBTyxDQUFDLENBQUUsT0FBNkIsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFFLE9BQTZCLENBQUMsU0FBUyxDQUFDO0lBQ2hHLENBQUM7SUFGRCxnREFFQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxPQUFZO1FBQ3pDLE9BQU8sQ0FBQyxDQUFFLE9BQXdCLENBQUMsU0FBUyxJQUFJLGtCQUFrQixDQUFFLE9BQXdCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDN0csQ0FBQztJQUZELHNDQUVDO0lBRUQsU0FBZ0IsaUJBQWlCLENBQUMsT0FBWTtRQUM3QyxPQUFPLDJCQUFZLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBRkQsOENBRUM7SUFFRCxTQUFnQixnQ0FBZ0MsQ0FBQyxPQUFZO1FBQzVELE9BQVEsT0FBMEMsQ0FBQyxJQUFJLEtBQUssa0JBQWtCLENBQUM7SUFDaEYsQ0FBQztJQUZELDRFQUVDO0lBRUQsU0FBZ0IsMkJBQTJCLENBQUMsT0FBWTtRQUN2RCxPQUFRLE9BQXFDLENBQUMsSUFBSSxLQUFLLFlBQVk7WUFDakUsT0FBcUMsQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDO0lBQ2hFLENBQUM7SUFIRCxrRUFHQztJQUVELFNBQWdCLGlDQUFpQyxDQUFDLE9BQVk7UUFDN0QsT0FBUSxPQUEyQyxDQUFDLElBQUksS0FBSyxtQkFBbUIsQ0FBQztJQUNsRixDQUFDO0lBRkQsOEVBRUM7SUFFRCxTQUFnQiwwQkFBMEIsQ0FBQyxPQUFZO1FBQ3RELE9BQU8sMkJBQVksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksMkJBQTJCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFGRCxnRUFFQztJQUVELFNBQWdCLGtCQUFrQixDQUFDLE9BQVk7UUFDOUMsT0FBUSxPQUFtQyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUM7SUFDbEUsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBZ0IscUJBQXFCLENBQUMsR0FBUSxFQUFFLFdBQWdCLEVBQUUsV0FBZ0I7UUFDakYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFrQyxDQUFDO1FBQ3JGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBa0MsQ0FBQztRQUVyRixNQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUcsTUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTlHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLEdBQUcsUUFBUSxLQUFLLGdCQUFnQixPQUFPLFFBQVEsS0FBSyxnQkFBZ0IsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xILENBQUM7SUFURCxzREFTQztJQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBVSxFQUFFLENBQVUsRUFBRSxFQUFFO1FBQ2pELElBQUksQ0FBQyxZQUFZLHdCQUFjLElBQUksQ0FBQyxZQUFZLHdCQUFjLEVBQUUsQ0FBQztZQUNoRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxRQUFRLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7UUFDeEcsQ0FBQztRQUVELE9BQU8sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUNqRCxDQUFDLENBQUM7SUFFRixTQUFnQixrQkFBa0IsQ0FBQyxJQUFXLEVBQUUsUUFBNEQsRUFBRSxZQUFxQjtRQUNsSSxJQUFJLGFBQWEsR0FBYyxFQUFFLENBQUM7UUFDbEMsSUFBSSxlQUFlLEdBQWMsRUFBRSxDQUFDO1FBRXBDLE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtZQUMxQixNQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7WUFDOUIsTUFBTSxTQUFTLEdBQWMsRUFBRSxDQUFDO1lBRWhDLElBQUEseURBQStCLEVBQUMsSUFBSSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFekcsSUFBSSxJQUFBLGVBQU0sRUFBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQyxJQUFJLElBQUEsZUFBTSxFQUFDLGVBQWUsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLEVBQUUsQ0FBQztnQkFDMUcsT0FBTztZQUNSLENBQUM7WUFFRCxhQUFhLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLGVBQWUsR0FBRyxTQUFTLENBQUM7WUFFNUIsUUFBUSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUM7UUFFRixhQUFhLEVBQUUsQ0FBQztRQUVoQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQXZCRCxnREF1QkM7SUFFRCxTQUFnQixtQ0FBbUMsQ0FBQyxJQUFXLEVBQUUsU0FBb0I7UUFDcEYsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbEIsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNkLENBQUM7SUFMRCxrRkFLQztJQUVELFNBQWdCLHlCQUF5QixDQUFDLElBQVc7UUFDcEQsTUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sT0FBTyxHQUFjLEVBQUUsQ0FBQztRQUM5QixJQUFBLDJEQUFpQyxFQUFDLElBQUksRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNoSCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBTEQsOERBS0M7SUFFRCxNQUFhLGVBQWdCLFNBQVEsZ0JBQU07UUFFMUMsWUFDUyxPQUFnQixFQUNoQixjQUErQjtZQUV2QyxLQUFLLENBQUMsbUJBQW1CLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUh6RCxZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQ2hCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUd2QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFFUSxHQUFHO1lBQ1gsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvRixDQUFDO0tBQ0Q7SUFiRCwwQ0FhQztJQUVELE1BQU0sdUJBQXdCLFNBQVEsZ0NBQWM7UUFFbkQsWUFBWSxNQUF1QjtZQUNsQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRWtCLFdBQVc7WUFDN0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3RDLElBQUEsV0FBSyxFQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFBLGlDQUFvQixFQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMvRCxDQUFDO1FBQ0YsQ0FBQztLQUNEO0lBRUQsU0FBZ0IseUJBQXlCLENBQUMsWUFBbUM7UUFDNUUsT0FBTyxNQUFNLENBQUMsRUFBRTtZQUNmLElBQUksTUFBTSxZQUFZLGVBQWUsRUFBRSxDQUFDO2dCQUN2QyxPQUFPLElBQUksdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUVELE9BQU8sSUFBQSw4Q0FBb0IsRUFBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQVJELDhEQVFDIn0=
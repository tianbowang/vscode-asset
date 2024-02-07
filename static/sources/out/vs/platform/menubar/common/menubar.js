/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isMenubarMenuItemAction = exports.isMenubarMenuItemRecentAction = exports.isMenubarMenuItemSeparator = exports.isMenubarMenuItemSubmenu = void 0;
    function isMenubarMenuItemSubmenu(menuItem) {
        return menuItem.submenu !== undefined;
    }
    exports.isMenubarMenuItemSubmenu = isMenubarMenuItemSubmenu;
    function isMenubarMenuItemSeparator(menuItem) {
        return menuItem.id === 'vscode.menubar.separator';
    }
    exports.isMenubarMenuItemSeparator = isMenubarMenuItemSeparator;
    function isMenubarMenuItemRecentAction(menuItem) {
        return menuItem.uri !== undefined;
    }
    exports.isMenubarMenuItemRecentAction = isMenubarMenuItemRecentAction;
    function isMenubarMenuItemAction(menuItem) {
        return !isMenubarMenuItemSubmenu(menuItem) && !isMenubarMenuItemSeparator(menuItem) && !isMenubarMenuItemRecentAction(menuItem);
    }
    exports.isMenubarMenuItemAction = isMenubarMenuItemAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbWVudWJhci9jb21tb24vbWVudWJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrRGhHLFNBQWdCLHdCQUF3QixDQUFDLFFBQXlCO1FBQ2pFLE9BQWlDLFFBQVMsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDO0lBQ2xFLENBQUM7SUFGRCw0REFFQztJQUVELFNBQWdCLDBCQUEwQixDQUFDLFFBQXlCO1FBQ25FLE9BQW1DLFFBQVMsQ0FBQyxFQUFFLEtBQUssMEJBQTBCLENBQUM7SUFDaEYsQ0FBQztJQUZELGdFQUVDO0lBRUQsU0FBZ0IsNkJBQTZCLENBQUMsUUFBeUI7UUFDdEUsT0FBc0MsUUFBUyxDQUFDLEdBQUcsS0FBSyxTQUFTLENBQUM7SUFDbkUsQ0FBQztJQUZELHNFQUVDO0lBRUQsU0FBZ0IsdUJBQXVCLENBQUMsUUFBeUI7UUFDaEUsT0FBTyxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNqSSxDQUFDO0lBRkQsMERBRUMifQ==
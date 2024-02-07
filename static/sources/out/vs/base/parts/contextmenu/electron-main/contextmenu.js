/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/parts/contextmenu/common/contextmenu"], function (require, exports, electron_1, ipcMain_1, contextmenu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerContextMenuListener = void 0;
    function registerContextMenuListener() {
        ipcMain_1.validatedIpcMain.on(contextmenu_1.CONTEXT_MENU_CHANNEL, (event, contextMenuId, items, onClickChannel, options) => {
            const menu = createMenu(event, onClickChannel, items);
            menu.popup({
                x: options ? options.x : undefined,
                y: options ? options.y : undefined,
                positioningItem: options ? options.positioningItem : undefined,
                callback: () => {
                    // Workaround for https://github.com/microsoft/vscode/issues/72447
                    // It turns out that the menu gets GC'ed if not referenced anymore
                    // As such we drag it into this scope so that it is not being GC'ed
                    if (menu) {
                        event.sender.send(contextmenu_1.CONTEXT_MENU_CLOSE_CHANNEL, contextMenuId);
                    }
                }
            });
        });
    }
    exports.registerContextMenuListener = registerContextMenuListener;
    function createMenu(event, onClickChannel, items) {
        const menu = new electron_1.Menu();
        items.forEach(item => {
            let menuitem;
            // Separator
            if (item.type === 'separator') {
                menuitem = new electron_1.MenuItem({
                    type: item.type,
                });
            }
            // Sub Menu
            else if (Array.isArray(item.submenu)) {
                menuitem = new electron_1.MenuItem({
                    submenu: createMenu(event, onClickChannel, item.submenu),
                    label: item.label
                });
            }
            // Normal Menu Item
            else {
                menuitem = new electron_1.MenuItem({
                    label: item.label,
                    type: item.type,
                    accelerator: item.accelerator,
                    checked: item.checked,
                    enabled: item.enabled,
                    visible: item.visible,
                    click: (menuItem, win, contextmenuEvent) => event.sender.send(onClickChannel, item.id, contextmenuEvent)
                });
            }
            menu.append(menuitem);
        });
        return menu;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dG1lbnUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvcGFydHMvY29udGV4dG1lbnUvZWxlY3Ryb24tbWFpbi9jb250ZXh0bWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsU0FBZ0IsMkJBQTJCO1FBQzFDLDBCQUFnQixDQUFDLEVBQUUsQ0FBQyxrQ0FBb0IsRUFBRSxDQUFDLEtBQW1CLEVBQUUsYUFBcUIsRUFBRSxLQUFxQyxFQUFFLGNBQXNCLEVBQUUsT0FBdUIsRUFBRSxFQUFFO1lBQ2hMLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXRELElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDbEMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDbEMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDOUQsUUFBUSxFQUFFLEdBQUcsRUFBRTtvQkFDZCxrRUFBa0U7b0JBQ2xFLGtFQUFrRTtvQkFDbEUsbUVBQW1FO29CQUNuRSxJQUFJLElBQUksRUFBRSxDQUFDO3dCQUNWLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHdDQUEwQixFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUM5RCxDQUFDO2dCQUNGLENBQUM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFsQkQsa0VBa0JDO0lBRUQsU0FBUyxVQUFVLENBQUMsS0FBbUIsRUFBRSxjQUFzQixFQUFFLEtBQXFDO1FBQ3JHLE1BQU0sSUFBSSxHQUFHLElBQUksZUFBSSxFQUFFLENBQUM7UUFFeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNwQixJQUFJLFFBQWtCLENBQUM7WUFFdkIsWUFBWTtZQUNaLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFDL0IsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQztvQkFDdkIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2lCQUNmLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxXQUFXO2lCQUNOLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDdEMsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQztvQkFDdkIsT0FBTyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7b0JBQ3hELEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztpQkFDakIsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELG1CQUFtQjtpQkFDZCxDQUFDO2dCQUNMLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUM7b0JBQ3ZCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztvQkFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO29CQUNmLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztvQkFDN0IsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNyQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87b0JBQ3JCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztvQkFDckIsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLENBQUM7aUJBQ3hHLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDIn0=
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/contextmenu/common/contextmenu", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, contextmenu_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.popup = void 0;
    let contextMenuIdPool = 0;
    function popup(items, options, onHide) {
        const processedItems = [];
        const contextMenuId = contextMenuIdPool++;
        const onClickChannel = `vscode:onContextMenu${contextMenuId}`;
        const onClickChannelHandler = (event, itemId, context) => {
            const item = processedItems[itemId];
            item.click?.(context);
        };
        globals_1.ipcRenderer.once(onClickChannel, onClickChannelHandler);
        globals_1.ipcRenderer.once(contextmenu_1.CONTEXT_MENU_CLOSE_CHANNEL, (event, closedContextMenuId) => {
            if (closedContextMenuId !== contextMenuId) {
                return;
            }
            globals_1.ipcRenderer.removeListener(onClickChannel, onClickChannelHandler);
            onHide?.();
        });
        globals_1.ipcRenderer.send(contextmenu_1.CONTEXT_MENU_CHANNEL, contextMenuId, items.map(item => createItem(item, processedItems)), onClickChannel, options);
    }
    exports.popup = popup;
    function createItem(item, processedItems) {
        const serializableItem = {
            id: processedItems.length,
            label: item.label,
            type: item.type,
            accelerator: item.accelerator,
            checked: item.checked,
            enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
            visible: typeof item.visible === 'boolean' ? item.visible : true
        };
        processedItems.push(item);
        // Submenu
        if (Array.isArray(item.submenu)) {
            serializableItem.submenu = item.submenu.map(submenuItem => createItem(submenuItem, processedItems));
        }
        return serializableItem;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dG1lbnUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvcGFydHMvY29udGV4dG1lbnUvZWxlY3Ryb24tc2FuZGJveC9jb250ZXh0bWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7SUFFMUIsU0FBZ0IsS0FBSyxDQUFDLEtBQXlCLEVBQUUsT0FBdUIsRUFBRSxNQUFtQjtRQUM1RixNQUFNLGNBQWMsR0FBdUIsRUFBRSxDQUFDO1FBRTlDLE1BQU0sYUFBYSxHQUFHLGlCQUFpQixFQUFFLENBQUM7UUFDMUMsTUFBTSxjQUFjLEdBQUcsdUJBQXVCLGFBQWEsRUFBRSxDQUFDO1FBQzlELE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxLQUFjLEVBQUUsTUFBYyxFQUFFLE9BQTBCLEVBQUUsRUFBRTtZQUM1RixNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQztRQUVGLHFCQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3hELHFCQUFXLENBQUMsSUFBSSxDQUFDLHdDQUEwQixFQUFFLENBQUMsS0FBYyxFQUFFLG1CQUEyQixFQUFFLEVBQUU7WUFDNUYsSUFBSSxtQkFBbUIsS0FBSyxhQUFhLEVBQUUsQ0FBQztnQkFDM0MsT0FBTztZQUNSLENBQUM7WUFFRCxxQkFBVyxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUVsRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1FBQ1osQ0FBQyxDQUFDLENBQUM7UUFFSCxxQkFBVyxDQUFDLElBQUksQ0FBQyxrQ0FBb0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckksQ0FBQztJQXRCRCxzQkFzQkM7SUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFzQixFQUFFLGNBQWtDO1FBQzdFLE1BQU0sZ0JBQWdCLEdBQWlDO1lBQ3RELEVBQUUsRUFBRSxjQUFjLENBQUMsTUFBTTtZQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixPQUFPLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNoRSxPQUFPLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUNoRSxDQUFDO1FBRUYsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxQixVQUFVO1FBQ1YsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2pDLGdCQUFnQixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNyRyxDQUFDO1FBRUQsT0FBTyxnQkFBZ0IsQ0FBQztJQUN6QixDQUFDIn0=
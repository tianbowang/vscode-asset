/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/log/common/log"], function (require, exports, nls_1, actionCommonCategories_1, actions_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuHiddenStatesReset = void 0;
    class MenuHiddenStatesReset extends actions_1.Action2 {
        constructor() {
            super({
                id: 'menu.resetHiddenStates',
                title: {
                    value: (0, nls_1.localize)('title', 'Reset All Menus'),
                    original: 'Reset All Menus'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(actions_1.IMenuService).resetHiddenStates();
            accessor.get(log_1.ILogService).info('did RESET all menu hidden states');
        }
    }
    exports.MenuHiddenStatesReset = MenuHiddenStatesReset;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudVJlc2V0QWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hY3Rpb25zL2NvbW1vbi9tZW51UmVzZXRBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEscUJBQXNCLFNBQVEsaUJBQU87UUFFakQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHdCQUF3QjtnQkFDNUIsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUM7b0JBQzNDLFFBQVEsRUFBRSxpQkFBaUI7aUJBQzNCO2dCQUNELFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7Z0JBQ3pCLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQjtZQUM3QixRQUFRLENBQUMsR0FBRyxDQUFDLHNCQUFZLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQy9DLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7S0FDRDtJQWxCRCxzREFrQkMifQ==
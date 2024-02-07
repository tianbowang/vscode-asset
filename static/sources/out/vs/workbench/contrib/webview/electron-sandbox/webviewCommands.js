/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/native/common/native", "vs/platform/action/common/actionCommonCategories", "vs/base/browser/window"], function (require, exports, nls, actions_1, native_1, actionCommonCategories_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenWebviewDeveloperToolsAction = void 0;
    class OpenWebviewDeveloperToolsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.webview.openDeveloperTools',
                title: { value: nls.localize('openToolsLabel', "Open Webview Developer Tools"), original: 'Open Webview Developer Tools' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const iframeWebviewElements = window_1.$window.document.querySelectorAll('iframe.webview.ready');
            if (iframeWebviewElements.length) {
                console.info(nls.localize('iframeWebviewAlert', "Using standard dev tools to debug iframe based webview"));
                nativeHostService.openDevTools();
            }
        }
    }
    exports.OpenWebviewDeveloperToolsAction = OpenWebviewDeveloperToolsAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0NvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2VsZWN0cm9uLXNhbmRib3gvd2Vidmlld0NvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLCtCQUFnQyxTQUFRLGlCQUFPO1FBRTNEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw2Q0FBNkM7Z0JBQ2pELEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLDhCQUE4QixDQUFDLEVBQUUsUUFBUSxFQUFFLDhCQUE4QixFQUFFO2dCQUMxSCxRQUFRLEVBQUUsbUNBQVUsQ0FBQyxTQUFTO2dCQUM5QixFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBa0IsQ0FBQyxDQUFDO1lBRTNELE1BQU0scUJBQXFCLEdBQUcsZ0JBQU8sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUN4RixJQUFJLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNsQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsd0RBQXdELENBQUMsQ0FBQyxDQUFDO2dCQUMzRyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNsQyxDQUFDO1FBQ0YsQ0FBQztLQUNEO0lBcEJELDBFQW9CQyJ9
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, actions_1, configuration_1, contextkey_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToggleRenderWhitespaceAction extends actions_1.Action2 {
        static { this.ID = 'editor.action.toggleRenderWhitespace'; }
        constructor() {
            super({
                id: ToggleRenderWhitespaceAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleRenderWhitespace', "Toggle Render Whitespace"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miToggleRenderWhitespace', comment: ['&& denotes a mnemonic'] }, "&&Render Whitespace"),
                    original: 'Toggle Render Whitespace'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkey_1.ContextKeyExpr.notEquals('config.editor.renderWhitespace', 'none'),
                menu: {
                    id: actions_1.MenuId.MenubarAppearanceMenu,
                    group: '4_editor',
                    order: 4
                }
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const renderWhitespace = configurationService.getValue('editor.renderWhitespace');
            let newRenderWhitespace;
            if (renderWhitespace === 'none') {
                newRenderWhitespace = 'all';
            }
            else {
                newRenderWhitespace = 'none';
            }
            return configurationService.updateValue('editor.renderWhitespace', newRenderWhitespace);
        }
    }
    (0, actions_1.registerAction2)(ToggleRenderWhitespaceAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlUmVuZGVyV2hpdGVzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL3RvZ2dsZVJlbmRlcldoaXRlc3BhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsTUFBTSw0QkFBNkIsU0FBUSxpQkFBTztpQkFFakMsT0FBRSxHQUFHLHNDQUFzQyxDQUFDO1FBRTVEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw0QkFBNEIsQ0FBQyxFQUFFO2dCQUNuQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHdCQUF3QixFQUFFLDBCQUEwQixDQUFDO29CQUNyRSxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsMEJBQTBCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDO29CQUN2SCxRQUFRLEVBQUUsMEJBQTBCO2lCQUNwQztnQkFDRCxRQUFRLEVBQUUsbUNBQVUsQ0FBQyxJQUFJO2dCQUN6QixFQUFFLEVBQUUsSUFBSTtnQkFDUixPQUFPLEVBQUUsMkJBQWMsQ0FBQyxTQUFTLENBQUMsZ0NBQWdDLEVBQUUsTUFBTSxDQUFDO2dCQUMzRSxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMscUJBQXFCO29CQUNoQyxLQUFLLEVBQUUsVUFBVTtvQkFDakIsS0FBSyxFQUFFLENBQUM7aUJBQ1I7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVEsR0FBRyxDQUFDLFFBQTBCO1lBQ3RDLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1lBRWpFLE1BQU0sZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFTLHlCQUF5QixDQUFDLENBQUM7WUFFMUYsSUFBSSxtQkFBMkIsQ0FBQztZQUNoQyxJQUFJLGdCQUFnQixLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUNqQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7WUFDN0IsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLG1CQUFtQixHQUFHLE1BQU0sQ0FBQztZQUM5QixDQUFDO1lBRUQsT0FBTyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMseUJBQXlCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUN6RixDQUFDOztJQUdGLElBQUEseUJBQWUsRUFBQyw0QkFBNEIsQ0FBQyxDQUFDIn0=
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, actions_1, configuration_1, contextkey_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleRenderControlCharacterAction = void 0;
    class ToggleRenderControlCharacterAction extends actions_1.Action2 {
        static { this.ID = 'editor.action.toggleRenderControlCharacter'; }
        constructor() {
            super({
                id: ToggleRenderControlCharacterAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleRenderControlCharacters', "Toggle Control Characters"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miToggleRenderControlCharacters', comment: ['&& denotes a mnemonic'] }, "Render &&Control Characters"),
                    original: 'Toggle Control Characters'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkey_1.ContextKeyExpr.equals('config.editor.renderControlCharacters', true),
                menu: {
                    id: actions_1.MenuId.MenubarAppearanceMenu,
                    group: '4_editor',
                    order: 5
                }
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newRenderControlCharacters = !configurationService.getValue('editor.renderControlCharacters');
            return configurationService.updateValue('editor.renderControlCharacters', newRenderControlCharacters);
        }
    }
    exports.ToggleRenderControlCharacterAction = ToggleRenderControlCharacterAction;
    (0, actions_1.registerAction2)(ToggleRenderControlCharacterAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlUmVuZGVyQ29udHJvbENoYXJhY3Rlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9icm93c2VyL3RvZ2dsZVJlbmRlckNvbnRyb2xDaGFyYWN0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEsa0NBQW1DLFNBQVEsaUJBQU87aUJBRTlDLE9BQUUsR0FBRyw0Q0FBNEMsQ0FBQztRQUVsRTtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsa0NBQWtDLENBQUMsRUFBRTtnQkFDekMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQywrQkFBK0IsRUFBRSwyQkFBMkIsQ0FBQztvQkFDN0UsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLGlDQUFpQyxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSw2QkFBNkIsQ0FBQztvQkFDdEksUUFBUSxFQUFFLDJCQUEyQjtpQkFDckM7Z0JBQ0QsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsT0FBTyxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLHVDQUF1QyxFQUFFLElBQUksQ0FBQztnQkFDN0UsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLHFCQUFxQjtvQkFDaEMsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLEtBQUssRUFBRSxDQUFDO2lCQUNSO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEdBQUcsQ0FBQyxRQUEwQjtZQUN0QyxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQztZQUVqRSxNQUFNLDBCQUEwQixHQUFHLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFVLGdDQUFnQyxDQUFDLENBQUM7WUFDN0csT0FBTyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsZ0NBQWdDLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztRQUN2RyxDQUFDOztJQTVCRixnRkE2QkM7SUFFRCxJQUFBLHlCQUFlLEVBQUMsa0NBQWtDLENBQUMsQ0FBQyJ9
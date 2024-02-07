/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/contrib/search/common/constants", "vs/platform/actions/common/actions", "vs/platform/quickinput/common/quickInput"], function (require, exports, nls, Constants, actions_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Actions
    (0, actions_1.registerAction2)(class ShowAllSymbolsAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.showAllSymbols'; }
        static { this.LABEL = nls.localize('showTriggerActions', "Go to Symbol in Workspace..."); }
        static { this.ALL_SYMBOLS_PREFIX = '#'; }
        constructor() {
            super({
                id: Constants.ShowAllSymbolsActionId,
                title: {
                    value: nls.localize('showTriggerActions', "Go to Symbol in Workspace..."),
                    original: 'Go to Symbol in Workspace...',
                    mnemonicTitle: nls.localize({ key: 'miGotoSymbolInWorkspace', comment: ['&& denotes a mnemonic'] }, "Go to Symbol in &&Workspace...")
                },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 50 /* KeyCode.KeyT */
                },
                menu: {
                    id: actions_1.MenuId.MenubarGoMenu,
                    group: '3_global_nav',
                    order: 2
                }
            });
        }
        async run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX);
        }
    });
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc1N5bWJvbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvc2VhcmNoQWN0aW9uc1N5bWJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxpQkFBaUI7SUFDakIsSUFBQSx5QkFBZSxFQUFDLE1BQU0sb0JBQXFCLFNBQVEsaUJBQU87aUJBRXpDLE9BQUUsR0FBRyxpQ0FBaUMsQ0FBQztpQkFDdkMsVUFBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsOEJBQThCLENBQUMsQ0FBQztpQkFDM0UsdUJBQWtCLEdBQUcsR0FBRyxDQUFDO1FBRXpDO1lBRUMsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsc0JBQXNCO2dCQUNwQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsOEJBQThCLENBQUM7b0JBQ3pFLFFBQVEsRUFBRSw4QkFBOEI7b0JBQ3hDLGFBQWEsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLHlCQUF5QixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxnQ0FBZ0MsQ0FBQztpQkFDckk7Z0JBQ0QsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsVUFBVSxFQUFFO29CQUNYLE1BQU0sNkNBQW1DO29CQUN6QyxPQUFPLEVBQUUsaURBQTZCO2lCQUN0QztnQkFDRCxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsYUFBYTtvQkFDeEIsS0FBSyxFQUFFLGNBQWM7b0JBQ3JCLEtBQUssRUFBRSxDQUFDO2lCQUNSO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDNUMsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM1RixDQUFDO0tBQ0QsQ0FBQyxDQUFDOztBQUVILFlBQVkifQ==
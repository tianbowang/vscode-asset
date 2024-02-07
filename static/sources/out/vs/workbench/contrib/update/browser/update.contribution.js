/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/workbench/contrib/update/browser/update", "vs/platform/product/common/product", "vs/platform/update/common/update", "vs/platform/instantiation/common/instantiation", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/workbench/contrib/update/common/update", "vs/platform/contextkey/common/contextkeys", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/base/common/uri", "vs/platform/contextkey/common/contextkey", "vs/platform/update/common/update.config.contribution"], function (require, exports, nls_1, platform_1, contributions_1, actionCommonCategories_1, actions_1, update_1, product_1, update_2, instantiation_1, platform_2, dialogs_1, labels_1, update_3, contextkeys_1, opener_1, productService_1, uri_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckForUpdateAction = exports.ShowCurrentReleaseNotesAction = void 0;
    const workbench = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbench.registerWorkbenchContribution(update_1.ProductContribution, 3 /* LifecyclePhase.Restored */);
    workbench.registerWorkbenchContribution(update_1.UpdateContribution, 3 /* LifecyclePhase.Restored */);
    workbench.registerWorkbenchContribution(update_1.SwitchProductQualityContribution, 3 /* LifecyclePhase.Restored */);
    // Release notes
    class ShowCurrentReleaseNotesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: update_3.ShowCurrentReleaseNotesActionId,
                title: {
                    value: (0, nls_1.localize)('showReleaseNotes', "Show Release Notes"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'mshowReleaseNotes', comment: ['&& denotes a mnemonic'] }, "Show &&Release Notes"),
                    original: 'Show Release Notes'
                },
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.RELEASE_NOTES_URL,
                menu: [{
                        id: actions_1.MenuId.MenubarHelpMenu,
                        group: '1_welcome',
                        order: 5,
                        when: update_1.RELEASE_NOTES_URL,
                    }]
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            try {
                await (0, update_1.showReleaseNotesInEditor)(instantiationService, productService.version);
            }
            catch (err) {
                if (productService.releaseNotesUrl) {
                    await openerService.open(uri_1.URI.parse(productService.releaseNotesUrl));
                }
                else {
                    throw new Error((0, nls_1.localize)('update.noReleaseNotesOnline', "This version of {0} does not have release notes online", productService.nameLong));
                }
            }
        }
    }
    exports.ShowCurrentReleaseNotesAction = ShowCurrentReleaseNotesAction;
    (0, actions_1.registerAction2)(ShowCurrentReleaseNotesAction);
    // Update
    class CheckForUpdateAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'update.checkForUpdate',
                title: (0, nls_1.localize2)('checkForUpdates', 'Check for Updates...'),
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.CONTEXT_UPDATE_STATE.isEqualTo("idle" /* StateType.Idle */),
            });
        }
        async run(accessor) {
            const updateService = accessor.get(update_2.IUpdateService);
            return updateService.checkForUpdates(true);
        }
    }
    exports.CheckForUpdateAction = CheckForUpdateAction;
    class DownloadUpdateAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'update.downloadUpdate',
                title: (0, nls_1.localize2)('downloadUpdate', 'Download Update'),
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.CONTEXT_UPDATE_STATE.isEqualTo("available for download" /* StateType.AvailableForDownload */)
            });
        }
        async run(accessor) {
            await accessor.get(update_2.IUpdateService).downloadUpdate();
        }
    }
    class InstallUpdateAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'update.installUpdate',
                title: (0, nls_1.localize2)('installUpdate', 'Install Update'),
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.CONTEXT_UPDATE_STATE.isEqualTo("downloaded" /* StateType.Downloaded */)
            });
        }
        async run(accessor) {
            await accessor.get(update_2.IUpdateService).applyUpdate();
        }
    }
    class RestartToUpdateAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'update.restartToUpdate',
                title: (0, nls_1.localize2)('restartToUpdate', 'Restart to Update'),
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.CONTEXT_UPDATE_STATE.isEqualTo("ready" /* StateType.Ready */)
            });
        }
        async run(accessor) {
            await accessor.get(update_2.IUpdateService).quitAndInstall();
        }
    }
    class DownloadAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.download'; }
        constructor() {
            super({
                id: DownloadAction.ID,
                title: {
                    value: (0, nls_1.localize)('openDownloadPage', "Download {0}", product_1.default.nameLong),
                    original: `Download ${product_1.default.downloadUrl}`
                },
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsWebContext, update_1.DOWNLOAD_URL), // Only show when running in a web browser and a download url is available
                f1: true,
                menu: [{
                        id: actions_1.MenuId.StatusBarWindowIndicatorMenu,
                        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsWebContext, update_1.DOWNLOAD_URL)
                    }]
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.downloadUrl) {
                openerService.open(uri_1.URI.parse(productService.downloadUrl));
            }
        }
    }
    (0, actions_1.registerAction2)(DownloadAction);
    (0, actions_1.registerAction2)(CheckForUpdateAction);
    (0, actions_1.registerAction2)(DownloadUpdateAction);
    (0, actions_1.registerAction2)(InstallUpdateAction);
    (0, actions_1.registerAction2)(RestartToUpdateAction);
    if (platform_2.isWindows) {
        class DeveloperApplyUpdateAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: '_update.applyupdate',
                    title: (0, nls_1.localize2)('applyUpdate', 'Apply Update...'),
                    category: actionCommonCategories_1.Categories.Developer,
                    f1: true,
                    precondition: update_1.CONTEXT_UPDATE_STATE.isEqualTo("idle" /* StateType.Idle */)
                });
            }
            async run(accessor) {
                const updateService = accessor.get(update_2.IUpdateService);
                const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                const updatePath = await fileDialogService.showOpenDialog({
                    title: (0, nls_1.localize)('pickUpdate', "Apply Update"),
                    filters: [{ name: 'Setup', extensions: ['exe'] }],
                    canSelectFiles: true,
                    openLabel: (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)({ key: 'updateButton', comment: ['&& denotes a mnemonic'] }, "&&Update"))
                });
                if (!updatePath || !updatePath[0]) {
                    return;
                }
                await updateService._applySpecificUpdate(updatePath[0].fsPath);
            }
        }
        (0, actions_1.registerAction2)(DeveloperApplyUpdateAction);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdXBkYXRlL2Jyb3dzZXIvdXBkYXRlLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHLE1BQU0sU0FBUyxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUU5RixTQUFTLENBQUMsNkJBQTZCLENBQUMsNEJBQW1CLGtDQUEwQixDQUFDO0lBQ3RGLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQywyQkFBa0Isa0NBQTBCLENBQUM7SUFDckYsU0FBUyxDQUFDLDZCQUE2QixDQUFDLHlDQUFnQyxrQ0FBMEIsQ0FBQztJQUVuRyxnQkFBZ0I7SUFFaEIsTUFBYSw2QkFBOEIsU0FBUSxpQkFBTztRQUV6RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsd0NBQStCO2dCQUNuQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDO29CQUN6RCxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLHNCQUFzQixDQUFDO29CQUNqSCxRQUFRLEVBQUUsb0JBQW9CO2lCQUM5QjtnQkFDRCxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsaUJBQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLGlCQUFPLENBQUMsU0FBUyxFQUFFO2dCQUNuRSxFQUFFLEVBQUUsSUFBSTtnQkFDUixZQUFZLEVBQUUsMEJBQWlCO2dCQUMvQixJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO3dCQUMxQixLQUFLLEVBQUUsV0FBVzt3QkFDbEIsS0FBSyxFQUFFLENBQUM7d0JBQ1IsSUFBSSxFQUFFLDBCQUFpQjtxQkFDdkIsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0NBQWUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQWMsQ0FBQyxDQUFDO1lBRW5ELElBQUksQ0FBQztnQkFDSixNQUFNLElBQUEsaUNBQXdCLEVBQUMsb0JBQW9CLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlFLENBQUM7WUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2dCQUNkLElBQUksY0FBYyxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUNwQyxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDckUsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxjQUFRLEVBQUMsNkJBQTZCLEVBQUUsd0RBQXdELEVBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzdJLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztLQUNEO0lBckNELHNFQXFDQztJQUVELElBQUEseUJBQWUsRUFBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBRS9DLFNBQVM7SUFFVCxNQUFhLG9CQUFxQixTQUFRLGlCQUFPO1FBRWhEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSx1QkFBdUI7Z0JBQzNCLEtBQUssRUFBRSxJQUFBLGVBQVMsRUFBQyxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQztnQkFDM0QsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLGlCQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxpQkFBTyxDQUFDLFNBQVMsRUFBRTtnQkFDbkUsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsWUFBWSxFQUFFLDZCQUFvQixDQUFDLFNBQVMsNkJBQWdCO2FBQzVELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQWMsQ0FBQyxDQUFDO1lBQ25ELE9BQU8sYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQ0Q7SUFoQkQsb0RBZ0JDO0lBRUQsTUFBTSxvQkFBcUIsU0FBUSxpQkFBTztRQUN6QztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsdUJBQXVCO2dCQUMzQixLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUM7Z0JBQ3JELFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxpQkFBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsaUJBQU8sQ0FBQyxTQUFTLEVBQUU7Z0JBQ25FLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSw2QkFBb0IsQ0FBQyxTQUFTLCtEQUFnQzthQUM1RSxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQWMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JELENBQUM7S0FDRDtJQUVELE1BQU0sbUJBQW9CLFNBQVEsaUJBQU87UUFDeEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHNCQUFzQjtnQkFDMUIsS0FBSyxFQUFFLElBQUEsZUFBUyxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQztnQkFDbkQsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLGlCQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxpQkFBTyxDQUFDLFNBQVMsRUFBRTtnQkFDbkUsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsWUFBWSxFQUFFLDZCQUFvQixDQUFDLFNBQVMseUNBQXNCO2FBQ2xFLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEQsQ0FBQztLQUNEO0lBRUQsTUFBTSxxQkFBc0IsU0FBUSxpQkFBTztRQUMxQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsd0JBQXdCO2dCQUM1QixLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUM7Z0JBQ3hELFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxpQkFBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsaUJBQU8sQ0FBQyxTQUFTLEVBQUU7Z0JBQ25FLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSw2QkFBb0IsQ0FBQyxTQUFTLCtCQUFpQjthQUM3RCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQWMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JELENBQUM7S0FDRDtJQUVELE1BQU0sY0FBZSxTQUFRLGlCQUFPO2lCQUVuQixPQUFFLEdBQUcsMkJBQTJCLENBQUM7UUFFakQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGNBQWMsQ0FBQyxFQUFFO2dCQUNyQixLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxpQkFBTyxDQUFDLFFBQVEsQ0FBQztvQkFDckUsUUFBUSxFQUFFLFlBQVksaUJBQU8sQ0FBQyxXQUFXLEVBQUU7aUJBQzNDO2dCQUNELFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQywwQkFBWSxFQUFFLHFCQUFZLENBQUMsRUFBRSwwRUFBMEU7Z0JBQ3hJLEVBQUUsRUFBRSxJQUFJO2dCQUNSLElBQUksRUFBRSxDQUFDO3dCQUNOLEVBQUUsRUFBRSxnQkFBTSxDQUFDLDRCQUE0Qjt3QkFDdkMsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDBCQUFZLEVBQUUscUJBQVksQ0FBQztxQkFDcEQsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEI7WUFDN0IsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZSxDQUFDLENBQUM7WUFDckQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxDQUFDLENBQUM7WUFFbkQsSUFBSSxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2hDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDO1FBQ0YsQ0FBQzs7SUFHRixJQUFBLHlCQUFlLEVBQUMsY0FBYyxDQUFDLENBQUM7SUFDaEMsSUFBQSx5QkFBZSxFQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDdEMsSUFBQSx5QkFBZSxFQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDdEMsSUFBQSx5QkFBZSxFQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDckMsSUFBQSx5QkFBZSxFQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFdkMsSUFBSSxvQkFBUyxFQUFFLENBQUM7UUFDZixNQUFNLDBCQUEyQixTQUFRLGlCQUFPO1lBQy9DO2dCQUNDLEtBQUssQ0FBQztvQkFDTCxFQUFFLEVBQUUscUJBQXFCO29CQUN6QixLQUFLLEVBQUUsSUFBQSxlQUFTLEVBQUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDO29CQUNsRCxRQUFRLEVBQUUsbUNBQVUsQ0FBQyxTQUFTO29CQUM5QixFQUFFLEVBQUUsSUFBSTtvQkFDUixZQUFZLEVBQUUsNkJBQW9CLENBQUMsU0FBUyw2QkFBZ0I7aUJBQzVELENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO2dCQUNuQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHVCQUFjLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFrQixDQUFDLENBQUM7Z0JBRTNELE1BQU0sVUFBVSxHQUFHLE1BQU0saUJBQWlCLENBQUMsY0FBYyxDQUFDO29CQUN6RCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQztvQkFDN0MsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ2pELGNBQWMsRUFBRSxJQUFJO29CQUNwQixTQUFTLEVBQUUsSUFBQSw0QkFBbUIsRUFBQyxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUNqSCxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNuQyxPQUFPO2dCQUNSLENBQUM7Z0JBRUQsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hFLENBQUM7U0FDRDtRQUVELElBQUEseUJBQWUsRUFBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzdDLENBQUMifQ==
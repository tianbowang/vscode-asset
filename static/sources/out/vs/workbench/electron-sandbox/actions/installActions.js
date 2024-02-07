/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/product/common/product", "vs/platform/dialogs/common/dialogs", "vs/platform/native/common/native", "vs/base/common/errorMessage", "vs/platform/product/common/productService", "vs/base/common/errors"], function (require, exports, nls_1, actions_1, product_1, dialogs_1, native_1, errorMessage_1, productService_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UninstallShellScriptAction = exports.InstallShellScriptAction = void 0;
    const shellCommandCategory = (0, nls_1.localize2)('shellCommand', 'Shell Command');
    class InstallShellScriptAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.installCommandLine',
                title: {
                    value: (0, nls_1.localize)('install', "Install '{0}' command in PATH", product_1.default.applicationName),
                    original: `Install \'${product_1.default.applicationName}\' command in PATH`
                },
                category: shellCommandCategory,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const productService = accessor.get(productService_1.IProductService);
            try {
                await nativeHostService.installShellCommand();
                dialogService.info((0, nls_1.localize)('successIn', "Shell command '{0}' successfully installed in PATH.", productService.applicationName));
            }
            catch (error) {
                if ((0, errors_1.isCancellationError)(error)) {
                    return;
                }
                dialogService.error((0, errorMessage_1.toErrorMessage)(error));
            }
        }
    }
    exports.InstallShellScriptAction = InstallShellScriptAction;
    class UninstallShellScriptAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.uninstallCommandLine',
                title: {
                    value: (0, nls_1.localize)('uninstall', "Uninstall '{0}' command from PATH", product_1.default.applicationName),
                    original: `Uninstall \'${product_1.default.applicationName}\' command from PATH`
                },
                category: shellCommandCategory,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const productService = accessor.get(productService_1.IProductService);
            try {
                await nativeHostService.uninstallShellCommand();
                dialogService.info((0, nls_1.localize)('successFrom', "Shell command '{0}' successfully uninstalled from PATH.", productService.applicationName));
            }
            catch (error) {
                if ((0, errors_1.isCancellationError)(error)) {
                    return;
                }
                dialogService.error((0, errorMessage_1.toErrorMessage)(error));
            }
        }
    }
    exports.UninstallShellScriptAction = UninstallShellScriptAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9lbGVjdHJvbi1zYW5kYm94L2FjdGlvbnMvaW5zdGFsbEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQU0sb0JBQW9CLEdBQXFCLElBQUEsZUFBUyxFQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUUxRixNQUFhLHdCQUF5QixTQUFRLGlCQUFPO1FBRXBEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxxQ0FBcUM7Z0JBQ3pDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLCtCQUErQixFQUFFLGlCQUFPLENBQUMsZUFBZSxDQUFDO29CQUNwRixRQUFRLEVBQUUsYUFBYSxpQkFBTyxDQUFDLGVBQWUsb0JBQW9CO2lCQUNsRTtnQkFDRCxRQUFRLEVBQUUsb0JBQW9CO2dCQUM5QixFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0NBQWUsQ0FBQyxDQUFDO1lBRXJELElBQUksQ0FBQztnQkFDSixNQUFNLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBRTlDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLHFEQUFxRCxFQUFFLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ2xJLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNoQixJQUFJLElBQUEsNEJBQW1CLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDaEMsT0FBTztnQkFDUixDQUFDO2dCQUVELGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBQSw2QkFBYyxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUMsQ0FBQztRQUNGLENBQUM7S0FDRDtJQS9CRCw0REErQkM7SUFFRCxNQUFhLDBCQUEyQixTQUFRLGlCQUFPO1FBRXREO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSx1Q0FBdUM7Z0JBQzNDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLG1DQUFtQyxFQUFFLGlCQUFPLENBQUMsZUFBZSxDQUFDO29CQUMxRixRQUFRLEVBQUUsZUFBZSxpQkFBTyxDQUFDLGVBQWUsc0JBQXNCO2lCQUN0RTtnQkFDRCxRQUFRLEVBQUUsb0JBQW9CO2dCQUM5QixFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0NBQWUsQ0FBQyxDQUFDO1lBRXJELElBQUksQ0FBQztnQkFDSixNQUFNLGlCQUFpQixDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBRWhELGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLHlEQUF5RCxFQUFFLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3hJLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNoQixJQUFJLElBQUEsNEJBQW1CLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDaEMsT0FBTztnQkFDUixDQUFDO2dCQUVELGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBQSw2QkFBYyxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUMsQ0FBQztRQUNGLENBQUM7S0FDRDtJQS9CRCxnRUErQkMifQ==
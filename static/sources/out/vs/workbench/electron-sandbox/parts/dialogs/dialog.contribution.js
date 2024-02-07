/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/keybinding/common/keybinding", "vs/platform/layout/browser/layoutService", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/browser/parts/dialogs/dialogHandler", "vs/workbench/electron-sandbox/parts/dialogs/dialogHandler", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, clipboardService_1, configuration_1, dialogs_1, keybinding_1, layoutService_1, log_1, native_1, productService_1, platform_1, contributions_1, dialogHandler_1, dialogHandler_2, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DialogHandlerContribution = void 0;
    let DialogHandlerContribution = class DialogHandlerContribution extends lifecycle_1.Disposable {
        constructor(configurationService, dialogService, logService, layoutService, keybindingService, instantiationService, productService, clipboardService, nativeHostService) {
            super();
            this.configurationService = configurationService;
            this.dialogService = dialogService;
            this.browserImpl = new dialogHandler_1.BrowserDialogHandler(logService, layoutService, keybindingService, instantiationService, productService, clipboardService);
            this.nativeImpl = new dialogHandler_2.NativeDialogHandler(logService, nativeHostService, productService, clipboardService);
            this.model = this.dialogService.model;
            this._register(this.model.onWillShowDialog(() => {
                if (!this.currentDialog) {
                    this.processDialogs();
                }
            }));
            this.processDialogs();
        }
        async processDialogs() {
            while (this.model.dialogs.length) {
                this.currentDialog = this.model.dialogs[0];
                let result = undefined;
                try {
                    // Confirm
                    if (this.currentDialog.args.confirmArgs) {
                        const args = this.currentDialog.args.confirmArgs;
                        result = (this.useCustomDialog || args?.confirmation.custom) ?
                            await this.browserImpl.confirm(args.confirmation) :
                            await this.nativeImpl.confirm(args.confirmation);
                    }
                    // Input (custom only)
                    else if (this.currentDialog.args.inputArgs) {
                        const args = this.currentDialog.args.inputArgs;
                        result = await this.browserImpl.input(args.input);
                    }
                    // Prompt
                    else if (this.currentDialog.args.promptArgs) {
                        const args = this.currentDialog.args.promptArgs;
                        result = (this.useCustomDialog || args?.prompt.custom) ?
                            await this.browserImpl.prompt(args.prompt) :
                            await this.nativeImpl.prompt(args.prompt);
                    }
                    // About
                    else {
                        if (this.useCustomDialog) {
                            await this.browserImpl.about();
                        }
                        else {
                            await this.nativeImpl.about();
                        }
                    }
                }
                catch (error) {
                    result = error;
                }
                this.currentDialog.close(result);
                this.currentDialog = undefined;
            }
        }
        get useCustomDialog() {
            return this.configurationService.getValue('window.dialogStyle') === 'custom';
        }
    };
    exports.DialogHandlerContribution = DialogHandlerContribution;
    exports.DialogHandlerContribution = DialogHandlerContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, dialogs_1.IDialogService),
        __param(2, log_1.ILogService),
        __param(3, layoutService_1.ILayoutService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, productService_1.IProductService),
        __param(7, clipboardService_1.IClipboardService),
        __param(8, native_1.INativeHostService)
    ], DialogHandlerContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(DialogHandlerContribution, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2VsZWN0cm9uLXNhbmRib3gvcGFydHMvZGlhbG9ncy9kaWFsb2cuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CekYsSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBMEIsU0FBUSxzQkFBVTtRQU94RCxZQUNnQyxvQkFBMkMsRUFDbEQsYUFBNkIsRUFDeEMsVUFBdUIsRUFDcEIsYUFBNkIsRUFDekIsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUNqRCxjQUErQixFQUM3QixnQkFBbUMsRUFDbEMsaUJBQXFDO1lBRXpELEtBQUssRUFBRSxDQUFDO1lBVnVCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDbEQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBV3JELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxvQ0FBb0IsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xKLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxtQ0FBbUIsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFM0csSUFBSSxDQUFDLEtBQUssR0FBSSxJQUFJLENBQUMsYUFBK0IsQ0FBQyxLQUFLLENBQUM7WUFFekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtnQkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDekIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2QixDQUFDO1lB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
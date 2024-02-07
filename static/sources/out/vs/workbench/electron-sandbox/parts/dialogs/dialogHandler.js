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
define(["require", "exports", "vs/nls", "vs/base/common/date", "vs/base/common/platform", "vs/platform/clipboard/common/clipboardService", "vs/platform/dialogs/common/dialogs", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, nls_1, date_1, platform_1, clipboardService_1, dialogs_1, log_1, native_1, productService_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeDialogHandler = void 0;
    let NativeDialogHandler = class NativeDialogHandler extends dialogs_1.AbstractDialogHandler {
        constructor(logService, nativeHostService, productService, clipboardService) {
            super();
            this.logService = logService;
            this.nativeHostService = nativeHostService;
            this.productService = productService;
            this.clipboardService = clipboardService;
        }
        async prompt(prompt) {
            this.logService.trace('DialogService#prompt', prompt.message);
            const buttons = this.getPromptButtons(prompt);
            const { response, checkboxChecked } = await this.nativeHostService.showMessageBox({
                type: this.getDialogType(prompt.type),
                title: prompt.title,
                message: prompt.message,
                detail: prompt.detail,
                buttons,
                cancelId: prompt.cancelButton ? buttons.length - 1 : -1 /* Disabled */,
                checkboxLabel: prompt.checkbox?.label,
                checkboxChecked: prompt.checkbox?.checked
            });
            return this.getPromptResult(prompt, response, checkboxChecked);
        }
        async confirm(confirmation) {
            this.logService.trace('DialogService#confirm', confirmation.message);
            const buttons = this.getConfirmationButtons(confirmation);
            const { response, checkboxChecked } = await this.nativeHostService.showMessageBox({
                type: this.getDialogType(confirmation.type) ?? 'question',
                title: confirmation.title,
                message: confirmation.message,
                detail: confirmation.detail,
                buttons,
                cancelId: buttons.length - 1,
                checkboxLabel: confirmation.checkbox?.label,
                checkboxChecked: confirmation.checkbox?.checked
            });
            return { confirmed: response === 0, checkboxChecked };
        }
        input() {
            throw new Error('Unsupported'); // we have no native API for password dialogs in Electron
        }
        async about() {
            let version = this.productService.version;
            if (this.productService.target) {
                version = `${version} (${this.productService.target} setup)`;
            }
            else if (this.productService.darwinUniversalAssetId) {
                version = `${version} (Universal)`;
            }
            const osProps = await this.nativeHostService.getOSProperties();
            const detailString = (useAgo) => {
                return (0, nls_1.localize)({ key: 'aboutDetail', comment: ['Electron, Chromium, Node.js and V8 are product names that need no translation'] }, "Version: {0}\nCommit: {1}\nDate: {2}\nElectron: {3}\nElectronBuildId: {4}\nChromium: {5}\nNode.js: {6}\nV8: {7}\nOS: {8}", version, this.productService.commit || 'Unknown', this.productService.date ? `${this.productService.date}${useAgo ? ' (' + (0, date_1.fromNow)(new Date(this.productService.date), true) + ')' : ''}` : 'Unknown', globals_1.process.versions['electron'], globals_1.process.versions['microsoft-build'], globals_1.process.versions['chrome'], globals_1.process.versions['node'], globals_1.process.versions['v8'], `${osProps.type} ${osProps.arch} ${osProps.release}${platform_1.isLinuxSnap ? ' snap' : ''}`);
            };
            const detail = detailString(true);
            const detailToCopy = detailString(false);
            const { response } = await this.nativeHostService.showMessageBox({
                type: 'info',
                message: this.productService.nameLong,
                detail: `\n${detail}`,
                buttons: [
                    (0, nls_1.localize)({ key: 'copy', comment: ['&& denotes a mnemonic'] }, "&&Copy"),
                    (0, nls_1.localize)('okButton', "OK")
                ]
            });
            if (response === 0) {
                this.clipboardService.writeText(detailToCopy);
            }
        }
    };
    exports.NativeDialogHandler = NativeDialogHandler;
    exports.NativeDialogHandler = NativeDialogHandler = __decorate([
        __param(0, log_1.ILogService),
        __param(1, native_1.INativeHostService),
        __param(2, productService_1.IProductService),
        __param(3, clipboardService_1.IClipboardService)
    ], NativeDialogHandler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2VsZWN0cm9uLXNhbmRib3gvcGFydHMvZGlhbG9ncy9kaWFsb2dIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVl6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLCtCQUFxQjtRQUU3RCxZQUMrQixVQUF1QixFQUNoQixpQkFBcUMsRUFDeEMsY0FBK0IsRUFDN0IsZ0JBQW1DO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBTHNCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDaEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN4QyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtRQUd4RSxDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBSSxNQUFrQjtZQUNqQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFOUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTlDLE1BQU0sRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDO2dCQUNqRixJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNyQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7Z0JBQ25CLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztnQkFDdkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO2dCQUNyQixPQUFPO2dCQUNQLFFBQVEsRUFBRSxNQUFN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
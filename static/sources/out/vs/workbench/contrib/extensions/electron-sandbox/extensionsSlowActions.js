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
define(["require", "exports", "vs/platform/product/common/productService", "vs/base/common/actions", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/nls", "vs/base/common/cancellation", "vs/platform/request/common/request", "vs/base/common/resources", "vs/platform/dialogs/common/dialogs", "vs/platform/opener/common/opener", "vs/platform/native/common/native", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/profiling/common/profiling", "vs/platform/files/common/files", "vs/base/common/buffer"], function (require, exports, productService_1, actions_1, uri_1, instantiation_1, nls_1, cancellation_1, request_1, resources_1, dialogs_1, opener_1, native_1, environmentService_1, profiling_1, files_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSlowExtensionAction = exports.SlowExtensionAction = void 0;
    class RepoInfo {
        static fromExtension(desc) {
            let result;
            // scheme:auth/OWNER/REPO/issues/
            if (desc.bugs && typeof desc.bugs.url === 'string') {
                const base = uri_1.URI.parse(desc.bugs.url);
                const match = /\/([^/]+)\/([^/]+)\/issues\/?$/.exec(desc.bugs.url);
                if (match) {
                    result = {
                        base: base.with({ path: null, fragment: null, query: null }).toString(true),
                        owner: match[1],
                        repo: match[2]
                    };
                }
            }
            // scheme:auth/OWNER/REPO.git
            if (!result && desc.repository && typeof desc.repository.url === 'string') {
                const base = uri_1.URI.parse(desc.repository.url);
                const match = /\/([^/]+)\/([^/]+)(\.git)?$/.exec(desc.repository.url);
                if (match) {
                    result = {
                        base: base.with({ path: null, fragment: null, query: null }).toString(true),
                        owner: match[1],
                        repo: match[2]
                    };
                }
            }
            // for now only GH is supported
            if (result && result.base.indexOf('github') === -1) {
                result = undefined;
            }
            return result;
        }
    }
    let SlowExtensionAction = class SlowExtensionAction extends actions_1.Action {
        constructor(extension, profile, _instantiationService) {
            super('report.slow', (0, nls_1.localize)('cmd.reportOrShow', "Performance Issue"), 'extension-action report-issue');
            this.extension = extension;
            this.profile = profile;
            this._instantiationService = _instantiationService;
            this.enabled = Boolean(RepoInfo.fromExtension(extension));
        }
        async run() {
            const action = await this._instantiationService.invokeFunction(createSlowExtensionAction, this.extension, this.profile);
            if (action) {
                await action.run();
            }
        }
    };
    exports.SlowExtensionAction = SlowExtensionAction;
    exports.SlowExtensionAction = SlowExtensionAction = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], SlowExtensionAction);
    async function createSlowExtensionAction(accessor, extension, profile) {
        const info = RepoInfo.fromExtension(extension);
        if (!info) {
            return undefined;
        }
        const requestService = accessor.get(request_1.IRequestService);
        const instaService = accessor.get(instantiation_1.IInstantiationService);
        const url = `https://api.github.com/search/issues?q=is:issue+state:open+in:title+repo:${info.owner}/${info.repo}+%22Extension+causes+high+cpu+load%22`;
        let res;
        try {
            res = await requestService.request({ url }, cancellation_1.CancellationToken.None);
        }
        catch {
            return undefined;
        }
        const rawText = await (0, request_1.asText)(res);
        if (!rawText) {
            return undefined;
        }
        const data = JSON.parse(rawText);
        if (!data || typeof data.total_count !== 'number') {
            return undefined;
        }
        else if (data.total_count === 0) {
            return instaService.createInstance(ReportExtensionSlowAction, extension, info, profile);
        }
        else {
            return instaService.createInstance(ShowExtensionSlowAction, extension, info, profile);
        }
    }
    exports.createSlowExtensionAction = createSlowExtensionAction;
    let ReportExtensionSlowAction = class ReportExtensionSlowAction extends actions_1.Action {
        constructor(extension, repoInfo, profile, _dialogService, _openerService, _productService, _nativeHostService, _environmentService, _fileService) {
            super('report.slow', (0, nls_1.localize)('cmd.report', "Report Issue"));
            this.extension = extension;
            this.repoInfo = repoInfo;
            this.profile = profile;
            this._dialogService = _dialogService;
            this._openerService = _openerService;
            this._productService = _productService;
            this._nativeHostService = _nativeHostService;
            this._environmentService = _environmentService;
            this._fileService = _fileService;
        }
        async run() {
            // rewrite pii (paths) and store on disk
            const data = profiling_1.Utils.rewriteAbsolutePaths(this.profile.data, 'pii_removed');
            const path = (0, resources_1.joinPath)(this._environmentService.tmpDir, `${this.extension.identifier.value}-unresponsive.cpuprofile.txt`);
            await this._fileService.writeFile(path, buffer_1.VSBuffer.fromString(JSON.stringify(data, undefined, 4)));
            // build issue
            const os = await this._nativeHostService.getOSProperties();
            const title = encodeURIComponent('Extension causes high cpu load');
            const osVersion = `${os.type} ${os.arch} ${os.release}`;
            const message = `:warning: Make sure to **attach** this file from your *home*-directory:\n:warning:\`${path}\`\n\nFind more details here: https://github.com/microsoft/vscode/wiki/Explain-extension-causes-high-cpu-load`;
            const body = encodeURIComponent(`- Issue Type: \`Performance\`
- Extension Name: \`${this.extension.name}\`
- Extension Version: \`${this.extension.version}\`
- OS Version: \`${osVersion}\`
- VS Code version: \`${this._productService.version}\`\n\n${message}`);
            const url = `${this.repoInfo.base}/${this.repoInfo.owner}/${this.repoInfo.repo}/issues/new/?body=${body}&title=${title}`;
            this._openerService.open(uri_1.URI.parse(url));
            this._dialogService.info((0, nls_1.localize)('attach.title', "Did you attach the CPU-Profile?"), (0, nls_1.localize)('attach.msg', "This is a reminder to make sure that you have not forgotten to attach '{0}' to the issue you have just created.", path.fsPath));
        }
    };
    ReportExtensionSlowAction = __decorate([
        __param(3, dialogs_1.IDialogService),
        __param(4, opener_1.IOpenerService),
        __param(5, productService_1.IProductService),
        __param(6, native_1.INativeHostService),
        __param(7, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(8, files_1.IFileService)
    ], ReportExtensionSlowAction);
    let ShowExtensionSlowAction = class ShowExtensionSlowAction extends actions_1.Action {
        constructor(extension, repoInfo, profile, _dialogService, _openerService, _environmentService, _fileService) {
            super('show.slow', (0, nls_1.localize)('cmd.show', "Show Issues"));
            this.extension = extension;
            this.repoInfo = repoInfo;
            this.profile = profile;
            this._dialogService = _dialogService;
            this._openerService = _openerService;
            this._environmentService = _environmentService;
            this._fileService = _fileService;
        }
        async run() {
            // rewrite pii (paths) and store on disk
            const data = profiling_1.Utils.rewriteAbsolutePaths(this.profile.data, 'pii_removed');
            const path = (0, resources_1.joinPath)(this._environmentService.tmpDir, `${this.extension.identifier.value}-unresponsive.cpuprofile.txt`);
            await this._fileService.writeFile(path, buffer_1.VSBuffer.fromString(JSON.stringify(data, undefined, 4)));
            // show issues
            const url = `${this.repoInfo.base}/${this.repoInfo.owner}/${this.repoInfo.repo}/issues?utf8=✓&q=is%3Aissue+state%3Aopen+%22Extension+causes+high+cpu+load%22`;
            this._openerService.open(uri_1.URI.parse(url));
            this._dialogService.info((0, nls_1.localize)('attach.title', "Did you attach the CPU-Profile?"), (0, nls_1.localize)('attach.msg2', "This is a reminder to make sure that you have not forgotten to attach '{0}' to an existing performance issue.", path.fsPath));
        }
    };
    ShowExtensionSlowAction = __decorate([
        __param(3, dialogs_1.IDialogService),
        __param(4, opener_1.IOpenerService),
        __param(5, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(6, files_1.IFileService)
    ], ShowExtensionSlowAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1Nsb3dBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2VsZWN0cm9uLXNhbmRib3gvZXh0ZW5zaW9uc1Nsb3dBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFCaEcsTUFBZSxRQUFRO1FBS3RCLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBMkI7WUFFL0MsSUFBSSxNQUE0QixDQUFDO1lBRWpDLGlDQUFpQztZQUNqQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDcEQsTUFBTSxJQUFJLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLEtBQUssR0FBRyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDWCxNQUFNLEdBQUc7d0JBQ1IsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQzt3QkFDM0UsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ2YsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7cUJBQ2QsQ0FBQztnQkFDSCxDQUFDO1lBQ0YsQ0FBQztZQUNELDZCQUE2QjtZQUM3QixJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUks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
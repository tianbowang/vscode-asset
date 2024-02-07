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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/window", "vs/base/common/network", "vs/base/common/severity", "vs/base/common/uri", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/url/browser/trustedDomains", "vs/workbench/contrib/url/common/urlGlob", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom_1, window_1, network_1, severity_1, uri_1, nls_1, clipboardService_1, configuration_1, dialogs_1, instantiation_1, opener_1, productService_1, quickInput_1, storage_1, telemetry_1, workspace_1, workspaceTrust_1, trustedDomains_1, urlGlob_1, authentication_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isURLDomainTrusted = exports.OpenerValidatorContributions = void 0;
    let OpenerValidatorContributions = class OpenerValidatorContributions {
        constructor(_openerService, _storageService, _dialogService, _productService, _quickInputService, _editorService, _clipboardService, _telemetryService, _instantiationService, _authenticationService, _workspaceContextService, _configurationService, _workspaceTrustService) {
            this._openerService = _openerService;
            this._storageService = _storageService;
            this._dialogService = _dialogService;
            this._productService = _productService;
            this._quickInputService = _quickInputService;
            this._editorService = _editorService;
            this._clipboardService = _clipboardService;
            this._telemetryService = _telemetryService;
            this._instantiationService = _instantiationService;
            this._authenticationService = _authenticationService;
            this._workspaceContextService = _workspaceContextService;
            this._configurationService = _configurationService;
            this._workspaceTrustService = _workspaceTrustService;
            this._openerService.registerValidator({ shouldOpen: (uri, options) => this.validateLink(uri, options) });
            this._readAuthenticationTrustedDomainsResult = new dom_1.WindowIdleValue(window_1.mainWindow, () => this._instantiationService.invokeFunction(trustedDomains_1.readAuthenticationTrustedDomains));
            this._authenticationService.onDidRegisterAuthenticationProvider(() => {
                this._readAuthenticationTrustedDomainsResult?.dispose();
                this._readAuthenticationTrustedDomainsResult = new dom_1.WindowIdleValue(window_1.mainWindow, () => this._instantiationService.invokeFunction(trustedDomains_1.readAuthenticationTrustedDomains));
            });
            this._readWorkspaceTrustedDomainsResult = new dom_1.WindowIdleValue(window_1.mainWindow, () => this._instantiationService.invokeFunction(trustedDomains_1.readWorkspaceTrustedDomains));
            this._workspaceContextService.onDidChangeWorkspaceFolders(() => {
                this._readWorkspaceTrustedDomainsResult?.dispose();
                this._readWorkspaceTrustedDomainsResult = new dom_1.WindowIdleValue(window_1.mainWindow, () => this._instantiationService.invokeFunction(trustedDomains_1.readWorkspaceTrustedDomains));
            });
        }
        async validateLink(resource, openOptions) {
            if (!(0, network_1.matchesScheme)(resource, network_1.Schemas.http) && !(0, network_1.matchesScheme)(resource, network_1.Schemas.https)) {
                return true;
            }
            if (openOptions?.fromWorkspace && this._workspaceTrustService.isWorkspaceTrusted() && !this._configurationService.getValue('workbench.trustedDomains.promptInTrustedWorkspace')) {
                return true;
            }
            const originalResource = resource;
            let resourceUri;
            if (typeof resource === 'string') {
                resourceUri = uri_1.URI.parse(resource);
            }
            else {
                resourceUri = resource;
            }
            const { scheme, authority, path, query, fragment } = resourceUri;
            const domainToOpen = `${scheme}://${authority}`;
            const [workspaceDomains, userDomains] = await Promise.all([this._readWorkspaceTrustedDomainsResult.value, this._readAuthenticationTrustedDomainsResult.value]);
            const { defaultTrustedDomains, trustedDomains, } = this._instantiationService.invokeFunction(trustedDomains_1.readStaticTrustedDomains);
            const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains, ...userDomains, ...workspaceDomains];
            if (isURLDomainTrusted(resourceUri, allTrustedDomains)) {
                return true;
            }
            else {
                let formattedLink = `${scheme}://${authority}${path}`;
                const linkTail = `${query ? '?' + query : ''}${fragment ? '#' + fragment : ''}`;
                const remainingLength = Math.max(0, 60 - formattedLink.length);
                const linkTailLengthToKeep = Math.min(Math.max(5, remainingLength), linkTail.length);
                if (linkTailLengthToKeep === linkTail.length) {
                    formattedLink += linkTail;
                }
                else {
                    // keep the first char ? or #
                    // add ... and keep the tail end as much as possible
                    formattedLink += linkTail.charAt(0) + '...' + linkTail.substring(linkTail.length - linkTailLengthToKeep + 1);
                }
                const { result } = await this._dialogService.prompt({
                    type: severity_1.default.Info,
                    message: (0, nls_1.localize)('openExternalLinkAt', 'Do you want {0} to open the external website?', this._productService.nameShort),
                    detail: typeof originalResource === 'string' ? originalResource : formattedLink,
                    buttons: [
                        {
                            label: (0, nls_1.localize)({ key: 'open', comment: ['&& denotes a mnemonic'] }, '&&Open'),
                            run: () => true
                        },
                        {
                            label: (0, nls_1.localize)({ key: 'copy', comment: ['&& denotes a mnemonic'] }, '&&Copy'),
                            run: () => {
                                this._clipboardService.writeText(typeof originalResource === 'string' ? originalResource : resourceUri.toString(true));
                                return false;
                            }
                        },
                        {
                            label: (0, nls_1.localize)({ key: 'configureTrustedDomains', comment: ['&& denotes a mnemonic'] }, 'Configure &&Trusted Domains'),
                            run: async () => {
                                const pickedDomains = await (0, trustedDomains_1.configureOpenerTrustedDomainsHandler)(trustedDomains, domainToOpen, resourceUri, this._quickInputService, this._storageService, this._editorService, this._telemetryService);
                                // Trust all domains
                                if (pickedDomains.indexOf('*') !== -1) {
                                    return true;
                                }
                                // Trust current domain
                                if (isURLDomainTrusted(resourceUri, pickedDomains)) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    ],
                    cancelButton: {
                        run: () => false
                    }
                });
                return result;
            }
        }
    };
    exports.OpenerValidatorContributions = OpenerValidatorContributions;
    exports.OpenerValidatorContributions = OpenerValidatorContributions = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, storage_1.IStorageService),
        __param(2, dialogs_1.IDialogService),
        __param(3, productService_1.IProductService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, editorService_1.IEditorService),
        __param(6, clipboardService_1.IClipboardService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, authentication_1.IAuthenticationService),
        __param(10, workspace_1.IWorkspaceContextService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], OpenerValidatorContributions);
    const rLocalhost = /^localhost(:\d+)?$/i;
    const r127 = /^127.0.0.1(:\d+)?$/;
    function isLocalhostAuthority(authority) {
        return rLocalhost.test(authority) || r127.test(authority);
    }
    /**
     * Case-normalize some case-insensitive URLs, such as github.
     */
    function normalizeURL(url) {
        const caseInsensitiveAuthorities = ['github.com'];
        try {
            const parsed = typeof url === 'string' ? uri_1.URI.parse(url, true) : url;
            if (caseInsensitiveAuthorities.includes(parsed.authority)) {
                return parsed.with({ path: parsed.path.toLowerCase() }).toString(true);
            }
            else {
                return parsed.toString(true);
            }
        }
        catch {
            return url.toString();
        }
    }
    /**
     * Check whether a domain like https://www.microsoft.com matches
     * the list of trusted domains.
     *
     * - Schemes must match
     * - There's no subdomain matching. For example https://microsoft.com doesn't match https://www.microsoft.com
     * - Star matches all subdomains. For example https://*.microsoft.com matches https://www.microsoft.com and https://foo.bar.microsoft.com
     */
    function isURLDomainTrusted(url, trustedDomains) {
        url = uri_1.URI.parse(normalizeURL(url));
        trustedDomains = trustedDomains.map(normalizeURL);
        if (isLocalhostAuthority(url.authority)) {
            return true;
        }
        for (let i = 0; i < trustedDomains.length; i++) {
            if (trustedDomains[i] === '*') {
                return true;
            }
            if ((0, urlGlob_1.testUrlMatchesGlob)(url, trustedDomains[i])) {
                return true;
            }
        }
        return false;
    }
    exports.isURLDomainTrusted = isURLDomainTrusted;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZERvbWFpbnNWYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VybC9icm93c2VyL3RydXN0ZWREb21haW5zVmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCekYsSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNEI7UUFLeEMsWUFDa0MsY0FBOEIsRUFDN0IsZUFBZ0MsRUFDakMsY0FBOEIsRUFDN0IsZUFBZ0MsRUFDN0Isa0JBQXNDLEVBQzFDLGNBQThCLEVBQzNCLGlCQUFvQyxFQUNwQyxpQkFBb0MsRUFDaEMscUJBQTRDLEVBQzNDLHNCQUE4QyxFQUM1Qyx3QkFBa0QsRUFDckQscUJBQTRDLEVBQ2pDLHNCQUF3RDtZQVoxRSxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDN0Isb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ2pDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUM3QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDN0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUMxQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDM0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNwQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ2hDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDM0MsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtZQUM1Qyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3JELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDakMsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUFrQztZQUUzRyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXpHLElBQUksQ0FBQyx1Q0FBdUMsR0FBRyxJQUFJLHFCQUFlLENBQUMsbUJBQVUsRUFBRSxHQUFHLEVBQUUsQ0FDbkYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxpREFBZ0MsQ0FBQyxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLG1DQUFtQyxDQUFDLEdBQUcsRUFBRTtnQkFDcEUsSUFBSSxDQUFDLHVDQUF1QyxFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUN4RCxJQUFJLENBQUMsdUNBQXVDLEdBQUcsSUFBSSxxQkFBZSxDQUFDLG1CQUFVLEVBQUUsR0FBRyxFQUFFLENBQ25GLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsaURBQWdDLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGtDQUFrQyxHQUFHLElBQUkscUJBQWUsQ0FBQyxtQkFBVSxFQUFFLEdBQUcsRUFBRSxDQUM5RSxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLDRDQUEyQixDQUFDLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsd0JBQXdCLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFO2dCQUM5RCxJQUFJLENBQUMsa0NBQWtDLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxrQ0FBa0MsR0FBRyxJQUFJLHFCQUFlLENBQUMsbUJBQVUsRUFBRSxHQUFHLEVBQUUsQ0FDOUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyw0Q0FBMkIsQ0FBQyxDQUFDLENBQUM7WUFDMUUsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFzQixFQUFFLFdBQXlCO1lBQ25FLElBQUksQ0FBQyxJQUFBLHVCQUFhLEVBQUMsUUFBUSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFBLHVCQUFhLEVBQUMsUUFBUSxFQUFFLGlCQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdkYsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsSUFBSSxXQUFXLEVBQUUsYUFBYSxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxtREFBbUQsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pMLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztZQUVELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLElBQUksV0FBZ0IsQ0FBQztZQUNyQixJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNsQyxXQUFXLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsV0FBVyxHQUFHLFFBQVEsQ0FBQztZQUN4QixDQUFDO1lBQ0QsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxXQUFXLENBQUM7WUFFakUsTUFBTSxZQUFZLEdBQUcsR0FBRyxNQUFNLE1BQU0sU0FBUyxFQUFFLENBQUM7WUFDaEQsTUFBTSxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0osTUFBTSxFQUFFLHFCQUFxQixFQUFFLGNBQWMsR0FBRyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMseUNBQXdCLENBQUMsQ0FBQztZQUN2SCxNQUFNLGlCQUFpQixHQUFHLENBQUMsR0FBRyxxQkFBcUIsRUFBRSxHQUFHLGNBQWMsRUFBRSxHQUFHLFdBQVcsRUFBRSxHQUFHLGdCQUFnQixDQUFDLENBQUM7WUFFN0csSUFBSSxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxDQUFDO2dCQUN4RCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLGFBQWEsR0FBRyxHQUFHLE1BQU0sTUFBTSxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQUM7Z0JBRXRELE1BQU0sUUFBUSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFHaEYsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0QsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFckYsSUFBSSxvQkFBb0IsS0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzlDLGFBQWEsSUFBSSxRQUFRLENBQUM7Z0JBQzNCLENBQUM7cUJBQU0sQ0FBQztvQkFDUCw2QkFBNkI7b0JBQzdCLG9EQUFvRDtvQkFDcEQsYUFBYSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDOUcsQ0FBQztnQkFFRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBVTtvQkFDNUQsSUFBSSxFQUFFLGtCQUFRLENBQUMsSUFBSTtvQkFDbkIsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUNoQixvQkFBb0IsRUFDcEIsK0NBQStDLEVBQy9DLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUM5QjtvQkFDRCxNQUFNLEVBQUUsT0FBTyxnQkFBZ0IsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxhQUFhO29CQUMvRSxPQUFPLEVBQUU7d0JBQ1I7NEJBQ0MsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDOzRCQUM5RSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTt5QkFDZjt3QkFDRDs0QkFDQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUM7NEJBQzlFLEdBQUcsRUFBRSxHQUFHLEVBQUU7Z0NBQ1QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxPQUFPLGdCQUFnQixLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQ0FDdkgsT0FBTyxLQUFLLENBQUM7NEJBQ2QsQ0FBQzt5QkFDRDt3QkFDRDs0QkFDQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUseUJBQXlCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLDZCQUE2QixDQUFDOzRCQUN0SCxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0NBQ2YsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFBLHFEQUFvQyxFQUMvRCxjQUFjLEVBQ2QsWUFBWSxFQUNaLFdBQVcsRUFDWCxJQUFJLENBQUMsa0JBQWtCLEVBQ3ZCLElBQUksQ0FBQyxlQUFlLEVBQ3BCLElBQUksQ0FBQyxjQUFjLEVBQ25CLElBQUksQ0FBQyxpQkFBaUIsQ0FDdEIsQ0FBQztnQ0FDRixvQkFBb0I7Z0NBQ3BCLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO29DQUN2QyxPQUFPLElBQUksQ0FBQztnQ0FDYixDQUFDO2dDQUNELHVCQUF1QjtnQ0FDdkIsSUFBSSxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQztvQ0FDcEQsT0FBTyxJQUFJLENBQUM7Z0NBQ2IsQ0FBQztnQ0FDRCxPQUFPLEtBQUssQ0FBQzs0QkFDZCxDQUFDO3lCQUNEO3FCQUNEO29CQUNELFlBQVksRUFBRTt3QkFDYixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSztxQkFDaEI7aUJBQ0QsQ0FBQyxDQUFDO2dCQUVILE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQztRQUNGLENBQUM7S0FDRCxDQUFBO0lBcklZLG9FQUE0QjsyQ0FBNUIsNEJBQTRCO1FBTXRDLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsd0JBQWMsQ0FBQTtRQUNkLFdBQUEsZ0NBQWUsQ0FBQTtRQUNmLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSxvQ0FBaUIsQ0FBQTtRQUNqQixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSx1Q0FBc0IsQ0FBQTtRQUN0QixZQUFBLG9DQUF3QixDQUFBO1FBQ3hCLFlBQUEscUNBQXFCLENBQUE7UUFDckIsWUFBQSxpREFBZ0MsQ0FBQTtPQWxCdEIsNEJBQTRCLENBcUl4QztJQUVELE1BQU0sVUFBVSxHQUFHLHFCQUFxQixDQUFDO0lBQ3pDLE1BQU0sSUFBSSxHQUFHLG9CQUFvQixDQUFDO0lBRWxDLFNBQVMsb0JBQW9CLENBQUMsU0FBaUI7UUFDOUMsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxZQUFZLENBQUMsR0FBaUI7UUFDdEMsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQztZQUNKLE1BQU0sTUFBTSxHQUFHLE9BQU8sR0FBRyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUNwRSxJQUFJLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDM0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4RSxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUM7UUFDRixDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQUMsT0FBTyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7UUFBQyxDQUFDO0lBQ25DLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsR0FBUSxFQUFFLGNBQXdCO1FBQ3BFLEdBQUcsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ25DLGNBQWMsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRWxELElBQUksb0JBQW9CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDekMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNoRCxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDL0IsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsSUFBSSxJQUFBLDRCQUFrQixFQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNoRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBbkJELGdEQW1CQyJ9
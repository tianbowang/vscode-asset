/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/authentication/common/authentication", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, uri_1, nls_1, productService_1, storage_1, editorService_1, authentication_1, files_1, textfiles_1, workspace_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readStaticTrustedDomains = exports.readAuthenticationTrustedDomains = exports.readWorkspaceTrustedDomains = exports.readTrustedDomains = exports.extractGitHubRemotesFromGitConfig = exports.configureOpenerTrustedDomainsHandler = exports.manageTrustedDomainSettingsCommand = exports.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = exports.TRUSTED_DOMAINS_STORAGE_KEY = void 0;
    const TRUSTED_DOMAINS_URI = uri_1.URI.parse('trustedDomains:/Trusted Domains');
    exports.TRUSTED_DOMAINS_STORAGE_KEY = 'http.linkProtectionTrustedDomains';
    exports.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = 'http.linkProtectionTrustedDomainsContent';
    exports.manageTrustedDomainSettingsCommand = {
        id: 'workbench.action.manageTrustedDomain',
        description: {
            description: (0, nls_1.localize)('trustedDomain.manageTrustedDomain', 'Manage Trusted Domains'),
            args: []
        },
        handler: async (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            editorService.openEditor({ resource: TRUSTED_DOMAINS_URI, languageId: 'jsonc', options: { pinned: true } });
            return;
        }
    };
    async function configureOpenerTrustedDomainsHandler(trustedDomains, domainToConfigure, resource, quickInputService, storageService, editorService, telemetryService) {
        const parsedDomainToConfigure = uri_1.URI.parse(domainToConfigure);
        const toplevelDomainSegements = parsedDomainToConfigure.authority.split('.');
        const domainEnd = toplevelDomainSegements.slice(toplevelDomainSegements.length - 2).join('.');
        const topLevelDomain = '*.' + domainEnd;
        const options = [];
        options.push({
            type: 'item',
            label: (0, nls_1.localize)('trustedDomain.trustDomain', 'Trust {0}', domainToConfigure),
            id: 'trust',
            toTrust: domainToConfigure,
            picked: true
        });
        const isIP = toplevelDomainSegements.length === 4 &&
            toplevelDomainSegements.every(segment => Number.isInteger(+segment) || Number.isInteger(+segment.split(':')[0]));
        if (isIP) {
            if (parsedDomainToConfigure.authority.includes(':')) {
                const base = parsedDomainToConfigure.authority.split(':')[0];
                options.push({
                    type: 'item',
                    label: (0, nls_1.localize)('trustedDomain.trustAllPorts', 'Trust {0} on all ports', base),
                    toTrust: base + ':*',
                    id: 'trust'
                });
            }
        }
        else {
            options.push({
                type: 'item',
                label: (0, nls_1.localize)('trustedDomain.trustSubDomain', 'Trust {0} and all its subdomains', domainEnd),
                toTrust: topLevelDomain,
                id: 'trust'
            });
        }
        options.push({
            type: 'item',
            label: (0, nls_1.localize)('trustedDomain.trustAllDomains', 'Trust all domains (disables link protection)'),
            toTrust: '*',
            id: 'trust'
        });
        options.push({
            type: 'item',
            label: (0, nls_1.localize)('trustedDomain.manageTrustedDomains', 'Manage Trusted Domains'),
            id: 'manage'
        });
        const pickedResult = await quickInputService.pick(options, { activeItem: options[0] });
        if (pickedResult && pickedResult.id) {
            switch (pickedResult.id) {
                case 'manage':
                    await editorService.openEditor({
                        resource: TRUSTED_DOMAINS_URI.with({ fragment: resource.toString() }),
                        languageId: 'jsonc',
                        options: { pinned: true }
                    });
                    return trustedDomains;
                case 'trust': {
                    const itemToTrust = pickedResult.toTrust;
                    if (trustedDomains.indexOf(itemToTrust) === -1) {
                        storageService.remove(exports.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
                        storageService.store(exports.TRUSTED_DOMAINS_STORAGE_KEY, JSON.stringify([...trustedDomains, itemToTrust]), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                        return [...trustedDomains, itemToTrust];
                    }
                }
            }
        }
        return [];
    }
    exports.configureOpenerTrustedDomainsHandler = configureOpenerTrustedDomainsHandler;
    // Exported for testing.
    function extractGitHubRemotesFromGitConfig(gitConfig) {
        const domains = new Set();
        let match;
        const RemoteMatcher = /^\s*url\s*=\s*(?:git@|https:\/\/)github\.com(?::|\/)(\S*)\s*$/mg;
        while (match = RemoteMatcher.exec(gitConfig)) {
            const repo = match[1].replace(/\.git$/, '');
            if (repo) {
                domains.add(`https://github.com/${repo}/`);
            }
        }
        return [...domains];
    }
    exports.extractGitHubRemotesFromGitConfig = extractGitHubRemotesFromGitConfig;
    async function getRemotes(fileService, textFileService, contextService) {
        const workspaceUris = contextService.getWorkspace().folders.map(folder => folder.uri);
        const domains = await Promise.race([
            new Promise(resolve => setTimeout(() => resolve([]), 2000)),
            Promise.all(workspaceUris.map(async (workspaceUri) => {
                try {
                    const path = workspaceUri.path;
                    const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/.git/config` });
                    const exists = await fileService.exists(uri);
                    if (!exists) {
                        return [];
                    }
                    const gitConfig = (await (textFileService.read(uri, { acceptTextOnly: true }).catch(() => ({ value: '' })))).value;
                    return extractGitHubRemotesFromGitConfig(gitConfig);
                }
                catch {
                    return [];
                }
            }))
        ]);
        const set = domains.reduce((set, list) => list.reduce((set, item) => set.add(item), set), new Set());
        return [...set];
    }
    async function readTrustedDomains(accessor) {
        const { defaultTrustedDomains, trustedDomains } = readStaticTrustedDomains(accessor);
        const [workspaceDomains, userDomains] = await Promise.all([readWorkspaceTrustedDomains(accessor), readAuthenticationTrustedDomains(accessor)]);
        return {
            workspaceDomains,
            userDomains,
            defaultTrustedDomains,
            trustedDomains,
        };
    }
    exports.readTrustedDomains = readTrustedDomains;
    async function readWorkspaceTrustedDomains(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const textFileService = accessor.get(textfiles_1.ITextFileService);
        const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
        return getRemotes(fileService, textFileService, workspaceContextService);
    }
    exports.readWorkspaceTrustedDomains = readWorkspaceTrustedDomains;
    async function readAuthenticationTrustedDomains(accessor) {
        const authenticationService = accessor.get(authentication_1.IAuthenticationService);
        return authenticationService.isAuthenticationProviderRegistered('github') && ((await authenticationService.getSessions('github')) ?? []).length > 0
            ? [`https://github.com`]
            : [];
    }
    exports.readAuthenticationTrustedDomains = readAuthenticationTrustedDomains;
    function readStaticTrustedDomains(accessor) {
        const storageService = accessor.get(storage_1.IStorageService);
        const productService = accessor.get(productService_1.IProductService);
        const environmentService = accessor.get(environmentService_1.IBrowserWorkbenchEnvironmentService);
        const defaultTrustedDomains = [
            ...productService.linkProtectionTrustedDomains ?? [],
            ...environmentService.options?.additionalTrustedDomains ?? []
        ];
        let trustedDomains = [];
        try {
            const trustedDomainsSrc = storageService.get(exports.TRUSTED_DOMAINS_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
            if (trustedDomainsSrc) {
                trustedDomains = JSON.parse(trustedDomainsSrc);
            }
        }
        catch (err) { }
        return {
            defaultTrustedDomains,
            trustedDomains,
        };
    }
    exports.readStaticTrustedDomains = readStaticTrustedDomains;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZERvbWFpbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VybC9icm93c2VyL3RydXN0ZWREb21haW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdCaEcsTUFBTSxtQkFBbUIsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFFNUQsUUFBQSwyQkFBMkIsR0FBRyxtQ0FBbUMsQ0FBQztJQUNsRSxRQUFBLG1DQUFtQyxHQUFHLDBDQUEwQyxDQUFDO0lBRWpGLFFBQUEsa0NBQWtDLEdBQUc7UUFDakQsRUFBRSxFQUFFLHNDQUFzQztRQUMxQyxXQUFXLEVBQUU7WUFDWixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUNBQW1DLEVBQUUsd0JBQXdCLENBQUM7WUFDcEYsSUFBSSxFQUFFLEVBQUU7U0FDUjtRQUNELE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBMEIsRUFBRSxFQUFFO1lBQzdDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQ25ELGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVHLE9BQU87UUFDUixDQUFDO0tBQ0QsQ0FBQztJQUlLLEtBQUssVUFBVSxvQ0FBb0MsQ0FDekQsY0FBd0IsRUFDeEIsaUJBQXlCLEVBQ3pCLFFBQWEsRUFDYixpQkFBcUMsRUFDckMsY0FBK0IsRUFDL0IsYUFBNkIsRUFDN0IsZ0JBQW1DO1FBRW5DLE1BQU0sdUJBQXVCLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzdELE1BQU0sdUJBQXVCLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3RSxNQUFNLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5RixNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ3hDLE1BQU0sT0FBTyxHQUEyQyxFQUFFLENBQUM7UUFFM0QsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNaLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQztZQUM1RSxFQUFFLEVBQUUsT0FBTztZQUNYLE9BQU8sRUFBRSxpQkFBaUI7WUFDMUIsTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FDVCx1QkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUNwQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FDdkMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUxRSxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1YsSUFBSSx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JELE1BQU0sSUFBSSxHQUFHLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ1osSUFBSSxFQUFFLE1BQU07b0JBQ1osS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDZCQUE2QixFQUFFLHdCQUF3QixFQUFFLElBQUksQ0FBQztvQkFDOUUsT0FBTyxFQUFFLElBQUksR0FBRyxJQUFJO29CQUNwQixFQUFFLEVBQUUsT0FBTztpQkFDWCxDQUFDLENBQUM7WUFDSixDQUFDO1FBQ0YsQ0FBQzthQUFNLENBQUM7WUFDUCxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUNaLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyw4QkFBOEIsRUFBRSxrQ0FBa0MsRUFBRSxTQUFTLENBQUM7Z0JBQzlGLE9BQU8sRUFBRSxjQUFjO2dCQUN2QixFQUFFLEVBQUUsT0FBTzthQUNYLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ1osSUFBSSxFQUFFLE1BQU07WUFDWixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsK0JBQStCLEVBQUUsOENBQThDLENBQUM7WUFDaEcsT0FBTyxFQUFFLEdBQUc7WUFDWixFQUFFLEVBQUUsT0FBTztTQUNYLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDWixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxvQ0FBb0MsRUFBRSx3QkFBd0IsQ0FBQztZQUMvRSxFQUFFLEVBQUUsUUFBUTtTQUNaLENBQUMsQ0FBQztRQUVILE1BQU0sWUFBWSxHQUFHLE1BQU0saUJBQWlCLENBQUMsSUFBSSxDQUNoRCxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ25DLENBQUM7UUFFRixJQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckMsUUFBUSxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3pCLEtBQUssUUFBUTtvQkFDWixNQUFNLGFBQWEsQ0FBQyxVQUFVLENBQUM7d0JBQzlCLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7d0JBQ3JFLFVBQVUsRUFBRSxPQUFPO3dCQUNuQixPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO3FCQUN6QixDQUFDLENBQUM7b0JBQ0gsT0FBTyxjQUFjLENBQUM7Z0JBQ3ZCLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZCxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDO29CQUN6QyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDaEQsY0FBYyxDQUFDLE1BQU0sQ0FBQywyQ0FBbUMsb0NBQTJCLENBQUM7d0JBQ3JGLGNBQWMsQ0FBQyxLQUFLLENBQ25CLG1DQUEyQixFQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxjQUFjLEVBQUUsV0FBVyxDQUFDLENBQUMsZ0VBR2hELENBQUM7d0JBRUYsT0FBTyxDQUFDLEdBQUcsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUN6QyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQTFGRCxvRkEwRkM7SUFFRCx3QkFBd0I7SUFDeEIsU0FBZ0IsaUNBQWlDLENBQUMsU0FBaUI7UUFDbEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUNsQyxJQUFJLEtBQTZCLENBQUM7UUFFbEMsTUFBTSxhQUFhLEdBQUcsaUVBQWlFLENBQUM7UUFDeEYsT0FBTyxLQUFLLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQzlDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUM1QyxDQUFDO1FBQ0YsQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFaRCw4RUFZQztJQUVELEtBQUssVUFBVSxVQUFVLENBQUMsV0FBeUIsRUFBRSxlQUFpQyxFQUFFLGNBQXdDO1FBQy9ILE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQztZQUNsQyxJQUFJLE9BQU8sQ0FBYSxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBVyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxZQUFZLEVBQUMsRUFBRTtnQkFDNUQsSUFBSSxDQUFDO29CQUNKLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7b0JBQy9CLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztvQkFDbkYsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM3QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ2IsT0FBTyxFQUFFLENBQUM7b0JBQ1gsQ0FBQztvQkFDRCxNQUFNLFNBQVMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUNuSCxPQUFPLGlDQUFpQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDO2dCQUFDLE1BQU0sQ0FBQztvQkFDUixPQUFPLEVBQUUsQ0FBQztnQkFDWCxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7U0FBQyxDQUFDLENBQUM7UUFFUCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQVUsQ0FBQyxDQUFDO1FBQzdHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLENBQUM7SUFZTSxLQUFLLFVBQVUsa0JBQWtCLENBQUMsUUFBMEI7UUFDbEUsTUFBTSxFQUFFLHFCQUFxQixFQUFFLGNBQWMsRUFBRSxHQUFHLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLENBQUMsRUFBRSxnQ0FBZ0MsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0ksT0FBTztZQUNOLGdCQUFnQjtZQUNoQixXQUFXO1lBQ1gscUJBQXFCO1lBQ3JCLGNBQWM7U0FDZCxDQUFDO0lBQ0gsQ0FBQztJQVRELGdEQVNDO0lBRU0sS0FBSyxVQUFVLDJCQUEyQixDQUFDLFFBQTBCO1FBQzNFLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQVksQ0FBQyxDQUFDO1FBQy9DLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsNEJBQWdCLENBQUMsQ0FBQztRQUN2RCxNQUFNLHVCQUF1QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0NBQXdCLENBQUMsQ0FBQztRQUN2RSxPQUFPLFVBQVUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUxELGtFQUtDO0lBRU0sS0FBSyxVQUFVLGdDQUFnQyxDQUFDLFFBQTBCO1FBQ2hGLE1BQU0scUJBQXFCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1Q0FBc0IsQ0FBQyxDQUFDO1FBQ25FLE9BQU8scUJBQXFCLENBQUMsa0NBQWtDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0scUJBQXFCLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDbEosQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUM7WUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNQLENBQUM7SUFMRCw0RUFLQztJQUVELFNBQWdCLHdCQUF3QixDQUFDLFFBQTBCO1FBQ2xFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQWUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0NBQWUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3REFBbUMsQ0FBQyxDQUFDO1FBRTdFLE1BQU0scUJBQXFCLEdBQUc7WUFDN0IsR0FBRyxjQUFjLENBQUMsNEJBQTRCLElBQUksRUFBRTtZQUNwRCxHQUFHLGtCQUFrQixDQUFDLE9BQU8sRUFBRSx3QkFBd0IsSUFBSSxFQUFFO1NBQzdELENBQUM7UUFFRixJQUFJLGNBQWMsR0FBYSxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDO1lBQ0osTUFBTSxpQkFBaUIsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLG1DQUEyQixvQ0FBMkIsQ0FBQztZQUNwRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3ZCLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEQsQ0FBQztRQUNGLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVqQixPQUFPO1lBQ04scUJBQXFCO1lBQ3JCLGNBQWM7U0FDZCxDQUFDO0lBQ0gsQ0FBQztJQXRCRCw0REFzQkMifQ==
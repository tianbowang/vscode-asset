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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/authentication/common/authentication", "vs/platform/actions/common/actions", "vs/workbench/services/activity/common/activity", "vs/platform/product/common/productService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/request/common/request", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/base/common/platform"], function (require, exports, platform_1, contributions_1, lifecycle_1, contextkey_1, commands_1, telemetry_1, authentication_1, actions_1, activity_1, productService_1, extensionManagement_1, extensions_1, storage_1, extensions_2, configurationRegistry_1, configuration_1, nls_1, configuration_2, request_1, cancellation_1, dialogs_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const configurationKey = 'workbench.accounts.experimental.showEntitlements';
    let AccountsEntitlement = class AccountsEntitlement extends lifecycle_1.Disposable {
        constructor(contextService, commandService, telemetryService, authenticationService, productService, storageService, extensionManagementService, activityService, extensionService, configurationService, contextKeyService, requestService) {
            super();
            this.contextService = contextService;
            this.commandService = commandService;
            this.telemetryService = telemetryService;
            this.authenticationService = authenticationService;
            this.productService = productService;
            this.storageService = storageService;
            this.extensionManagementService = extensionManagementService;
            this.activityService = activityService;
            this.extensionService = extensionService;
            this.configurationService = configurationService;
            this.contextKeyService = contextKeyService;
            this.requestService = requestService;
            this.isInitialized = false;
            this.contextKey = new contextkey_1.RawContextKey(configurationKey, true).bindTo(this.contextService);
            if (!this.productService.gitHubEntitlement || platform_2.isWeb) {
                return;
            }
            // if previously shown, do not show again.
            const showEntitlements = this.storageService.getBoolean(configurationKey, -1 /* StorageScope.APPLICATION */, true);
            if (!showEntitlements) {
                return;
            }
            const setting = this.configurationService.inspect(configurationKey);
            if (!setting.value) {
                return;
            }
            this.extensionManagementService.getInstalled().then(exts => {
                const installed = exts.find(value => extensions_1.ExtensionIdentifier.equals(value.identifier.id, this.productService.gitHubEntitlement.extensionId));
                if (installed) {
                    this.storageService.store(configurationKey, false, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    this.contextKey.set(false);
                    return;
                }
                else {
                    this.registerListeners();
                }
            });
        }
        registerListeners() {
            this._register(this.extensionService.onDidChangeExtensions(async (result) => {
                for (const ext of result.added) {
                    if (extensions_1.ExtensionIdentifier.equals(this.productService.gitHubEntitlement.extensionId, ext.identifier)) {
                        this.storageService.store(configurationKey, false, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                        this.contextKey.set(false);
                        return;
                    }
                }
            }));
            this._register(this.authenticationService.onDidChangeSessions(async (e) => {
                if (e.providerId === this.productService.gitHubEntitlement.providerId && e.event.added?.length && !this.isInitialized) {
                    this.onSessionChange(e.event.added[0]);
                }
                else if (e.providerId === this.productService.gitHubEntitlement.providerId && e.event.removed?.length) {
                    this.contextKey.set(false);
                }
            }));
            this._register(this.authenticationService.onDidRegisterAuthenticationProvider(async (e) => {
                if (e.id === this.productService.gitHubEntitlement.providerId && !this.isInitialized) {
                    const session = await this.authenticationService.getSessions(e.id);
                    this.onSessionChange(session[0]);
                }
            }));
        }
        async onSessionChange(session) {
            this.isInitialized = true;
            const context = await this.requestService.request({
                type: 'GET',
                url: this.productService.gitHubEntitlement.entitlementUrl,
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`
                }
            }, cancellation_1.CancellationToken.None);
            if (context.res.statusCode && context.res.statusCode !== 200) {
                return;
            }
            const result = await (0, request_1.asText)(context);
            if (!result) {
                return;
            }
            let parsedResult;
            try {
                parsedResult = JSON.parse(result);
            }
            catch (err) {
                //ignore
                return;
            }
            if (!(this.productService.gitHubEntitlement.enablementKey in parsedResult) || !parsedResult[this.productService.gitHubEntitlement.enablementKey]) {
                return;
            }
            this.contextKey.set(true);
            this.telemetryService.publicLog2(configurationKey, { enabled: true });
            const orgs = parsedResult['organization_login_list'];
            const menuTitle = orgs ? this.productService.gitHubEntitlement.command.title.replace('{{org}}', orgs[orgs.length - 1]) : this.productService.gitHubEntitlement.command.titleWithoutPlaceHolder;
            const badge = new activity_1.NumberBadge(1, () => menuTitle);
            const accountsMenuBadgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            accountsMenuBadgeDisposable.value = this.activityService.showAccountsActivity({ badge, });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.entitlementAction',
                        title: menuTitle,
                        f1: false,
                        menu: {
                            id: actions_1.MenuId.AccountsContext,
                            group: '5_AccountsEntitlements',
                            when: contextkey_1.ContextKeyExpr.equals(configurationKey, true),
                        }
                    });
                }
                async run(accessor) {
                    const productService = accessor.get(productService_1.IProductService);
                    const commandService = accessor.get(commands_1.ICommandService);
                    const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
                    const storageService = accessor.get(storage_1.IStorageService);
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                    const confirmation = await dialogService.confirm({
                        type: 'question',
                        message: productService.gitHubEntitlement.confirmationMessage,
                        primaryButton: productService.gitHubEntitlement.confirmationAction,
                    });
                    if (confirmation.confirmed) {
                        commandService.executeCommand(productService.gitHubEntitlement.command.action, productService.gitHubEntitlement.extensionId);
                        telemetryService.publicLog2('accountsEntitlements.action', {
                            command: productService.gitHubEntitlement.command.action,
                        });
                    }
                    else {
                        telemetryService.publicLog2('accountsEntitlements.action', {
                            command: productService.gitHubEntitlement.command.action + '-dismissed',
                        });
                    }
                    accountsMenuBadgeDisposable.clear();
                    const contextKey = new contextkey_1.RawContextKey(configurationKey, true).bindTo(contextKeyService);
                    contextKey.set(false);
                    storageService.store(configurationKey, false, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
            });
        }
    };
    AccountsEntitlement = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, commands_1.ICommandService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, authentication_1.IAuthenticationService),
        __param(4, productService_1.IProductService),
        __param(5, storage_1.IStorageService),
        __param(6, extensionManagement_1.IExtensionManagementService),
        __param(7, activity_1.IActivityService),
        __param(8, extensions_2.IExtensionService),
        __param(9, configuration_2.IConfigurationService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, request_1.IRequestService)
    ], AccountsEntitlement);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(AccountsEntitlement, 4 /* LifecyclePhase.Eventually */);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        ...configuration_1.applicationConfigurationNodeBase,
        properties: {
            'workbench.accounts.experimental.showEntitlements': {
                scope: 2 /* ConfigurationScope.MACHINE */,
                type: 'boolean',
                default: false,
                tags: ['experimental'],
                description: (0, nls_1.localize)('workbench.accounts.showEntitlements', "When enabled, available entitlements for the account will be show in the accounts menu.")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudHNFbnRpdGxlbWVudHMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9hY2NvdW50RW50aXRsZW1lbnRzL2Jyb3dzZXIvYWNjb3VudHNFbnRpdGxlbWVudHMuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBMkJoRyxNQUFNLGdCQUFnQixHQUFHLGtEQUFrRCxDQUFDO0lBYzVFLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7UUFJM0MsWUFDcUIsY0FBMkMsRUFDOUMsY0FBd0MsRUFDdEMsZ0JBQTRDLEVBQ3ZDLHFCQUFzRCxFQUM3RCxjQUF3QyxFQUN4QyxjQUF3QyxFQUM1QiwwQkFBZ0UsRUFDM0UsZUFBMEMsRUFDekMsZ0JBQTRDLEVBQ3hDLG9CQUFvRCxFQUN2RCxpQkFBOEMsRUFDakQsY0FBd0M7WUFFekQsS0FBSyxFQUFFLENBQUM7WUFicUIsbUJBQWMsR0FBZCxjQUFjLENBQW9CO1lBQ3JDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUM3QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQzlCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDcEQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQy9CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNuQiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQ2xFLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNoQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDOUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN4QyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFmbEQsa0JBQWEsR0FB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
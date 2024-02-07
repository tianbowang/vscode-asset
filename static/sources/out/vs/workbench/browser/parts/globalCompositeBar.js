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
define(["require", "exports", "vs/nls", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/common/activity", "vs/workbench/services/activity/common/activity", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/workbench/browser/parts/compositeBarActions", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/theme/common/iconRegistry", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/touch", "vs/base/common/lazy", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/secrets/common/secrets", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/environment/common/environmentService", "vs/platform/hover/browser/hover", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfileIcons", "vs/base/common/types", "vs/workbench/common/theme"], function (require, exports, nls_1, actionbar_1, activity_1, activity_2, instantiation_1, lifecycle_1, themeService_1, storage_1, extensions_1, compositeBarActions_1, codicons_1, themables_1, iconRegistry_1, actions_1, actions_2, dom_1, keyboardEvent_1, mouseEvent_1, touch_1, lazy_1, menuEntryActionViewItem_1, configuration_1, contextkey_1, contextView_1, keybinding_1, log_1, productService_1, secrets_1, authenticationService_1, authentication_1, environmentService_1, hover_1, lifecycle_2, userDataProfile_1, userDataProfileIcons_1, types_1, theme_1) {
    "use strict";
    var GlobalCompositeBar_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleGlobalActivityActionViewItem = exports.SimpleAccountActivityActionViewItem = exports.GlobalActivityActionViewItem = exports.AccountsActivityActionViewItem = exports.GlobalCompositeBar = void 0;
    let GlobalCompositeBar = class GlobalCompositeBar extends lifecycle_1.Disposable {
        static { GlobalCompositeBar_1 = this; }
        static { this.ACCOUNTS_ACTION_INDEX = 0; }
        static { this.ACCOUNTS_ICON = (0, iconRegistry_1.registerIcon)('accounts-view-bar-icon', codicons_1.Codicon.account, (0, nls_1.localize)('accountsViewBarIcon', "Accounts icon in the view bar.")); }
        constructor(contextMenuActionsProvider, colors, activityHoverOptions, configurationService, instantiationService, storageService, extensionService) {
            super();
            this.contextMenuActionsProvider = contextMenuActionsProvider;
            this.colors = colors;
            this.activityHoverOptions = activityHoverOptions;
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.globalActivityAction = this._register(new actions_1.Action(activity_1.GLOBAL_ACTIVITY_ID));
            this.accountAction = this._register(new actions_1.Action(activity_1.ACCOUNTS_ACTIVITY_ID));
            this.element = document.createElement('div');
            const contextMenuAlignmentOptions = () => ({
                anchorAlignment: configurationService.getValue('workbench.sideBar.location') === 'left' ? 1 /* AnchorAlignment.RIGHT */ : 0 /* AnchorAlignment.LEFT */,
                anchorAxisAlignment: 1 /* AnchorAxisAlignment.HORIZONTAL */
            });
            this.globalActivityActionBar = this._register(new actionbar_1.ActionBar(this.element, {
                actionViewItemProvider: action => {
                    if (action.id === activity_1.GLOBAL_ACTIVITY_ID) {
                        return this.instantiationService.createInstance(GlobalActivityActionViewItem, this.contextMenuActionsProvider, { colors: this.colors, hoverOptions: this.activityHoverOptions }, contextMenuAlignmentOptions);
                    }
                    if (action.id === activity_1.ACCOUNTS_ACTIVITY_ID) {
                        return this.instantiationService.createInstance(AccountsActivityActionViewItem, this.contextMenuActionsProvider, {
                            colors: this.colors,
                            hoverOptions: this.activityHoverOptions
                        }, contextMenuAlignmentOptions, (actions) => {
                            actions.unshift(...[
                                (0, actions_1.toAction)({ id: 'hideAccounts', label: (0, nls_1.localize)('hideAccounts', "Hide Accounts"), run: () => this.storageService.store(AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, false, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */) }),
                                new actions_1.Separator()
                            ]);
                        });
                    }
                    throw new Error(`No view item for action '${action.id}'`);
                },
                orientation: 1 /* ActionsOrientation.VERTICAL */,
                ariaLabel: (0, nls_1.localize)('manage', "Manage"),
                animated: false,
                preventLoopNavigation: true
            }));
            if (this.accountsVisibilityPreference) {
                this.globalActivityActionBar.push(this.accountAction, { index: GlobalCompositeBar_1.ACCOUNTS_ACTION_INDEX });
            }
            this.globalActivityActionBar.push(this.globalActivityAction);
            this.registerListeners();
        }
        registerListeners() {
            this.extensionService.whenInstalledExtensionsRegistered().then(() => {
                if (!this._store.isDisposed) {
                    this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, this._store)(() => this.toggleAccountsActivity()));
                }
            });
        }
        create(parent) {
            parent.appendChild(this.element);
        }
        focus() {
            this.globalActivityActionBar.focus(true);
        }
        size() {
            return this.globalActivityActionBar.viewItems.length;
        }
        getContextMenuActions() {
            return [(0, actions_1.toAction)({ id: 'toggleAccountsVisibility', label: (0, nls_1.localize)('accounts', "Accounts"), checked: this.accountsVisibilityPreference, run: () => this.accountsVisibilityPreference = !this.accountsVisibilityPreference })];
        }
        toggleAccountsActivity() {
            if (this.globalActivityActionBar.length() === 2 && this.accountsVisibilityPreference) {
                return;
            }
            if (this.globalActivityActionBar.length() === 2) {
                this.globalActivityActionBar.pull(GlobalCompositeBar_1.ACCOUNTS_ACTION_INDEX);
            }
            else {
                this.globalActivityActionBar.push(this.accountAction, { index: GlobalCompositeBar_1.ACCOUNTS_ACTION_INDEX });
            }
        }
        get accountsVisibilityPreference() {
            return this.storageService.getBoolean(AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, 0 /* StorageScope.PROFILE */, true);
        }
        set accountsVisibilityPreference(value) {
            this.storageService.store(AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    exports.GlobalCompositeBar = GlobalCompositeBar;
    exports.GlobalCompositeBar = GlobalCompositeBar = GlobalCompositeBar_1 = __decorate([
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, storage_1.IStorageService),
        __param(6, extensions_1.IExtensionService)
    ], GlobalCompositeBar);
    let AbstractGlobalActivityActionViewItem = class AbstractGlobalActivityActionViewItem extends compositeBarActions_1.CompoisteBarActionViewItem {
        constructor(menuId, action, options, contextMenuActionsProvider, contextMenuAlignmentOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, keybindingService, activityService) {
            super(action, { draggable: false, icon: true, hasPopup: true, ...options }, () => true, themeService, hoverService, configurationService, keybindingService);
            this.menuId = menuId;
            this.contextMenuActionsProvider = contextMenuActionsProvider;
            this.contextMenuAlignmentOptions = contextMenuAlignmentOptions;
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.contextKeyService = contextKeyService;
            this.activityService = activityService;
            this.updateItemActivity();
            this._register(this.activityService.onDidChangeActivity(viewContainerOrAction => {
                if ((0, types_1.isString)(viewContainerOrAction) && viewContainerOrAction === this.compositeBarActionItem.id) {
                    this.updateItemActivity();
                }
            }));
        }
        updateItemActivity() {
            const activities = this.activityService.getActivity(this.compositeBarActionItem.id);
            let activity = activities[0];
            if (activity) {
                const { badge, priority } = activity;
                if (badge instanceof activity_2.NumberBadge && activities.length > 1) {
                    const cumulativeNumberBadge = this.getCumulativeNumberBadge(activities, priority ?? 0);
                    activity = { badge: cumulativeNumberBadge };
                }
            }
            this.action.activity = activity;
        }
        getCumulativeNumberBadge(activityCache, priority) {
            const numberActivities = activityCache.filter(activity => activity.badge instanceof activity_2.NumberBadge && (activity.priority ?? 0) === priority);
            const number = numberActivities.reduce((result, activity) => { return result + activity.badge.number; }, 0);
            const descriptorFn = () => {
                return numberActivities.reduce((result, activity, index) => {
                    result = result + activity.badge.getDescription();
                    if (index < numberActivities.length - 1) {
                        result = `${result}\n`;
                    }
                    return result;
                }, '');
            };
            return new activity_2.NumberBadge(number, descriptorFn);
        }
        render(container) {
            super.render(container);
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.MOUSE_DOWN, async (e) => {
                dom_1.EventHelper.stop(e, true);
                const isLeftClick = e?.button !== 2;
                // Left-click run
                if (isLeftClick) {
                    this.run();
                }
            }));
            // The rest of the activity bar uses context menu event for the context menu, so we match this
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.CONTEXT_MENU, async (e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const actions = await this.resolveContextMenuActions(disposables);
                const event = new mouseEvent_1.StandardMouseEvent((0, dom_1.getWindow)(this.container), e);
                this.contextMenuService.showContextMenu({
                    getAnchor: () => event,
                    getActions: () => actions,
                    onHide: () => disposables.dispose()
                });
            }));
            this._register((0, dom_1.addDisposableListener)(this.container, dom_1.EventType.KEY_UP, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    dom_1.EventHelper.stop(e, true);
                    this.run();
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this.container, touch_1.EventType.Tap, (e) => {
                dom_1.EventHelper.stop(e, true);
                this.run();
            }));
        }
        async resolveContextMenuActions(disposables) {
            return this.contextMenuActionsProvider();
        }
        async run() {
            const disposables = new lifecycle_1.DisposableStore();
            const menu = disposables.add(this.menuService.createMenu(this.menuId, this.contextKeyService));
            const actions = await this.resolveMainMenuActions(menu, disposables);
            const { anchorAlignment, anchorAxisAlignment } = this.contextMenuAlignmentOptions() ?? { anchorAlignment: undefined, anchorAxisAlignment: undefined };
            this.contextMenuService.showContextMenu({
                getAnchor: () => this.label,
                anchorAlignment,
                anchorAxisAlignment,
                getActions: () => actions,
                onHide: () => disposables.dispose(),
                menuActionOptions: { renderShortTitle: true },
            });
        }
        async resolveMainMenuActions(menu, _disposable) {
            const actions = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { renderShortTitle: true }, { primary: [], secondary: actions });
            return actions;
        }
    };
    AbstractGlobalActivityActionViewItem = __decorate([
        __param(5, themeService_1.IThemeService),
        __param(6, hover_1.IHoverService),
        __param(7, actions_2.IMenuService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, keybinding_1.IKeybindingService),
        __param(12, activity_2.IActivityService)
    ], AbstractGlobalActivityActionViewItem);
    let AccountsActivityActionViewItem = class AccountsActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
        static { this.ACCOUNTS_VISIBILITY_PREFERENCE_KEY = 'workbench.activity.showAccounts'; }
        constructor(contextMenuActionsProvider, options, contextMenuAlignmentOptions, fillContextMenuActions, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, keybindingService, secretStorageService, logService, activityService, instantiationService) {
            const action = instantiationService.createInstance(compositeBarActions_1.CompositeBarAction, {
                id: activity_1.ACCOUNTS_ACTIVITY_ID,
                name: (0, nls_1.localize)('accounts', "Accounts"),
                classNames: themables_1.ThemeIcon.asClassNameArray(GlobalCompositeBar.ACCOUNTS_ICON)
            });
            super(actions_2.MenuId.AccountsContext, action, options, contextMenuActionsProvider, contextMenuAlignmentOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, keybindingService, activityService);
            this.fillContextMenuActions = fillContextMenuActions;
            this.lifecycleService = lifecycleService;
            this.authenticationService = authenticationService;
            this.productService = productService;
            this.secretStorageService = secretStorageService;
            this.logService = logService;
            this.groupedAccounts = new Map();
            this.problematicProviders = new Set();
            this.initialized = false;
            this.sessionFromEmbedder = new lazy_1.Lazy(() => (0, authenticationService_1.getCurrentAuthenticationSessionInfo)(this.secretStorageService, this.productService));
            this._register(action);
            this.registerListeners();
            this.initialize();
        }
        registerListeners() {
            this._register(this.authenticationService.onDidRegisterAuthenticationProvider(async (e) => {
                await this.addAccountsFromProvider(e.id);
            }));
            this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e) => {
                this.groupedAccounts.delete(e.id);
                this.problematicProviders.delete(e.id);
            }));
            this._register(this.authenticationService.onDidChangeSessions(async (e) => {
                for (const changed of [...(e.event.changed ?? []), ...(e.event.added ?? [])]) {
                    try {
                        await this.addOrUpdateAccount(e.providerId, changed.account);
                    }
                    catch (e) {
                        this.logService.error(e);
                    }
                }
                if (e.event.removed) {
                    for (const removed of e.event.removed) {
                        this.removeAccount(e.providerId, removed.account);
                    }
                }
            }));
        }
        // This function exists to ensure that the accounts are added for auth providers that had already been registered
        // before the menu was created.
        async initialize() {
            // Resolving the menu doesn't need to happen immediately, so we can wait until after the workbench has been restored
            // and only run this when the system is idle.
            await this.lifecycleService.when(3 /* LifecyclePhase.Restored */);
            if (this._store.isDisposed) {
                return;
            }
            const disposable = this._register((0, dom_1.runWhenWindowIdle)((0, dom_1.getWindow)(this.element), async () => {
                await this.doInitialize();
                disposable.dispose();
            }));
        }
        async doInitialize() {
            const providerIds = this.authenticationService.getProviderIds();
            const results = await Promise.allSettled(providerIds.map(providerId => this.addAccountsFromProvider(providerId)));
            // Log any errors that occurred while initializing. We try to be best effort here to show the most amount of accounts
            for (const result of results) {
                if (result.status === 'rejected') {
                    this.logService.error(result.reason);
                }
            }
            this.initialized = true;
        }
        //#region overrides
        async resolveMainMenuActions(accountsMenu, disposables) {
            await super.resolveMainMenuActions(accountsMenu, disposables);
            const providers = this.authenticationService.getProviderIds();
            const otherCommands = accountsMenu.getActions();
            let menus = [];
            for (const providerId of providers) {
                if (!this.initialized) {
                    const noAccountsAvailableAction = disposables.add(new actions_1.Action('noAccountsAvailable', (0, nls_1.localize)('loading', "Loading..."), undefined, false));
                    menus.push(noAccountsAvailableAction);
                    break;
                }
                const providerLabel = this.authenticationService.getLabel(providerId);
                const accounts = this.groupedAccounts.get(providerId);
                if (!accounts) {
                    if (this.problematicProviders.has(providerId)) {
                        const providerUnavailableAction = disposables.add(new actions_1.Action('providerUnavailable', (0, nls_1.localize)('authProviderUnavailable', '{0} is currently unavailable', providerLabel), undefined, false));
                        menus.push(providerUnavailableAction);
                        // try again in the background so that if the failure was intermittent, we can resolve it on the next showing of the menu
                        try {
                            await this.addAccountsFromProvider(providerId);
                        }
                        catch (e) {
                            this.logService.error(e);
                        }
                    }
                    continue;
                }
                for (const account of accounts) {
                    const manageExtensionsAction = disposables.add(new actions_1.Action(`configureSessions${account.label}`, (0, nls_1.localize)('manageTrustedExtensions', "Manage Trusted Extensions"), undefined, true, () => {
                        return this.authenticationService.manageTrustedExtensionsForAccount(providerId, account.label);
                    }));
                    const providerSubMenuActions = [manageExtensionsAction];
                    if (account.canSignOut) {
                        const signOutAction = disposables.add(new actions_1.Action('signOut', (0, nls_1.localize)('signOut', "Sign Out"), undefined, true, async () => {
                            const allSessions = await this.authenticationService.getSessions(providerId);
                            const sessionsForAccount = allSessions.filter(s => s.account.label === account.label);
                            return await this.authenticationService.removeAccountSessions(providerId, account.label, sessionsForAccount);
                        }));
                        providerSubMenuActions.push(signOutAction);
                    }
                    const providerSubMenu = new actions_1.SubmenuAction('activitybar.submenu', `${account.label} (${providerLabel})`, providerSubMenuActions);
                    menus.push(providerSubMenu);
                }
            }
            if (providers.length && !menus.length) {
                const noAccountsAvailableAction = disposables.add(new actions_1.Action('noAccountsAvailable', (0, nls_1.localize)('noAccounts', "You are not signed in to any accounts"), undefined, false));
                menus.push(noAccountsAvailableAction);
            }
            if (menus.length && otherCommands.length) {
                menus.push(new actions_1.Separator());
            }
            otherCommands.forEach((group, i) => {
                const actions = group[1];
                menus = menus.concat(actions);
                if (i !== otherCommands.length - 1) {
                    menus.push(new actions_1.Separator());
                }
            });
            return menus;
        }
        async resolveContextMenuActions(disposables) {
            const actions = await super.resolveContextMenuActions(disposables);
            this.fillContextMenuActions(actions);
            return actions;
        }
        //#endregion
        //#region groupedAccounts helpers
        async addOrUpdateAccount(providerId, account) {
            let accounts = this.groupedAccounts.get(providerId);
            if (!accounts) {
                accounts = [];
                this.groupedAccounts.set(providerId, accounts);
            }
            const sessionFromEmbedder = await this.sessionFromEmbedder.value;
            let canSignOut = true;
            if (sessionFromEmbedder // if we have a session from the embedder
                && !sessionFromEmbedder.canSignOut // and that session says we can't sign out
                && (await this.authenticationService.getSessions(providerId)) // and that session is associated with the account we are adding/updating
                    .some(s => s.id === sessionFromEmbedder.id
                    && s.account.id === account.id)) {
                canSignOut = false;
            }
            const existingAccount = accounts.find(a => a.label === account.label);
            if (existingAccount) {
                // if we have an existing account and we discover that we
                // can't sign out of it, update the account to mark it as "can't sign out"
                if (!canSignOut) {
                    existingAccount.canSignOut = canSignOut;
                }
            }
            else {
                accounts.push({ ...account, canSignOut });
            }
        }
        removeAccount(providerId, account) {
            const accounts = this.groupedAccounts.get(providerId);
            if (!accounts) {
                return;
            }
            const index = accounts.findIndex(a => a.id === account.id);
            if (index === -1) {
                return;
            }
            accounts.splice(index, 1);
            if (accounts.length === 0) {
                this.groupedAccounts.delete(providerId);
            }
        }
        async addAccountsFromProvider(providerId) {
            try {
                const sessions = await this.authenticationService.getSessions(providerId);
                this.problematicProviders.delete(providerId);
                for (const session of sessions) {
                    try {
                        await this.addOrUpdateAccount(providerId, session.account);
                    }
                    catch (e) {
                        this.logService.error(e);
                    }
                }
            }
            catch (e) {
                this.logService.error(e);
                this.problematicProviders.add(providerId);
            }
        }
    };
    exports.AccountsActivityActionViewItem = AccountsActivityActionViewItem;
    exports.AccountsActivityActionViewItem = AccountsActivityActionViewItem = __decorate([
        __param(4, themeService_1.IThemeService),
        __param(5, lifecycle_2.ILifecycleService),
        __param(6, hover_1.IHoverService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, actions_2.IMenuService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, authentication_1.IAuthenticationService),
        __param(11, environmentService_1.IWorkbenchEnvironmentService),
        __param(12, productService_1.IProductService),
        __param(13, configuration_1.IConfigurationService),
        __param(14, keybinding_1.IKeybindingService),
        __param(15, secrets_1.ISecretStorageService),
        __param(16, log_1.ILogService),
        __param(17, activity_2.IActivityService),
        __param(18, instantiation_1.IInstantiationService)
    ], AccountsActivityActionViewItem);
    let GlobalActivityActionViewItem = class GlobalActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
        constructor(contextMenuActionsProvider, options, contextMenuAlignmentOptions, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService, instantiationService, activityService) {
            const action = instantiationService.createInstance(compositeBarActions_1.CompositeBarAction, {
                id: activity_1.GLOBAL_ACTIVITY_ID,
                name: (0, nls_1.localize)('manage', "Manage"),
                classNames: themables_1.ThemeIcon.asClassNameArray(userDataProfileService.currentProfile.icon ? themables_1.ThemeIcon.fromId(userDataProfileService.currentProfile.icon) : userDataProfileIcons_1.DEFAULT_ICON)
            });
            super(actions_2.MenuId.GlobalActivity, action, options, contextMenuActionsProvider, contextMenuAlignmentOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, keybindingService, activityService);
            this.userDataProfileService = userDataProfileService;
            this._register(action);
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(e => {
                action.compositeBarActionItem = {
                    ...action.compositeBarActionItem,
                    classNames: themables_1.ThemeIcon.asClassNameArray(userDataProfileService.currentProfile.icon ? themables_1.ThemeIcon.fromId(userDataProfileService.currentProfile.icon) : userDataProfileIcons_1.DEFAULT_ICON)
                };
            }));
        }
        render(container) {
            super.render(container);
            this.profileBadge = (0, dom_1.append)(container, (0, dom_1.$)('.profile-badge'));
            this.profileBadgeContent = (0, dom_1.append)(this.profileBadge, (0, dom_1.$)('.profile-badge-content'));
            this.updateProfileBadge();
        }
        updateProfileBadge() {
            if (!this.profileBadge || !this.profileBadgeContent) {
                return;
            }
            (0, dom_1.clearNode)(this.profileBadgeContent);
            (0, dom_1.hide)(this.profileBadge);
            if (this.userDataProfileService.currentProfile.isDefault) {
                return;
            }
            if (this.userDataProfileService.currentProfile.icon && this.userDataProfileService.currentProfile.icon !== userDataProfileIcons_1.DEFAULT_ICON.id) {
                return;
            }
            if (this.action.activity) {
                return;
            }
            (0, dom_1.show)(this.profileBadge);
            this.profileBadgeContent.classList.toggle('profile-text-overlay', true);
            this.profileBadgeContent.classList.toggle('profile-icon-overlay', false);
            this.profileBadgeContent.textContent = this.userDataProfileService.currentProfile.name.substring(0, 2).toUpperCase();
        }
        updateActivity() {
            super.updateActivity();
            this.updateProfileBadge();
        }
        computeTitle() {
            return this.userDataProfileService.currentProfile.isDefault ? super.computeTitle() : (0, nls_1.localize)('manage profile', "Manage {0} (Profile)", this.userDataProfileService.currentProfile.name);
        }
    };
    exports.GlobalActivityActionViewItem = GlobalActivityActionViewItem;
    exports.GlobalActivityActionViewItem = GlobalActivityActionViewItem = __decorate([
        __param(3, userDataProfile_1.IUserDataProfileService),
        __param(4, themeService_1.IThemeService),
        __param(5, hover_1.IHoverService),
        __param(6, actions_2.IMenuService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, keybinding_1.IKeybindingService),
        __param(12, instantiation_1.IInstantiationService),
        __param(13, activity_2.IActivityService)
    ], GlobalActivityActionViewItem);
    let SimpleAccountActivityActionViewItem = class SimpleAccountActivityActionViewItem extends AccountsActivityActionViewItem {
        constructor(hoverOptions, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, keybindingService, secretStorageService, logService, activityService, instantiationService) {
            super(() => [], {
                colors: theme => ({
                    badgeBackground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_BACKGROUND),
                    badgeForeground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_FOREGROUND),
                }),
                hoverOptions,
                compact: true,
            }, () => undefined, actions => actions, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, keybindingService, secretStorageService, logService, activityService, instantiationService);
        }
    };
    exports.SimpleAccountActivityActionViewItem = SimpleAccountActivityActionViewItem;
    exports.SimpleAccountActivityActionViewItem = SimpleAccountActivityActionViewItem = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, lifecycle_2.ILifecycleService),
        __param(3, hover_1.IHoverService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, actions_2.IMenuService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, authentication_1.IAuthenticationService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, productService_1.IProductService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, keybinding_1.IKeybindingService),
        __param(12, secrets_1.ISecretStorageService),
        __param(13, log_1.ILogService),
        __param(14, activity_2.IActivityService),
        __param(15, instantiation_1.IInstantiationService)
    ], SimpleAccountActivityActionViewItem);
    let SimpleGlobalActivityActionViewItem = class SimpleGlobalActivityActionViewItem extends GlobalActivityActionViewItem {
        constructor(hoverOptions, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService, instantiationService, activityService) {
            super(() => [], {
                colors: theme => ({
                    badgeBackground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_BACKGROUND),
                    badgeForeground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_FOREGROUND),
                }),
                hoverOptions,
                compact: true,
            }, () => undefined, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService, instantiationService, activityService);
        }
    };
    exports.SimpleGlobalActivityActionViewItem = SimpleGlobalActivityActionViewItem;
    exports.SimpleGlobalActivityActionViewItem = SimpleGlobalActivityActionViewItem = __decorate([
        __param(1, userDataProfile_1.IUserDataProfileService),
        __param(2, themeService_1.IThemeService),
        __param(3, hover_1.IHoverService),
        __param(4, actions_2.IMenuService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, activity_2.IActivityService)
    ], SimpleGlobalActivityActionViewItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsQ29tcG9zaXRlQmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9nbG9iYWxDb21wb3NpdGVCYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTBDekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTs7aUJBRXpCLDBCQUFxQixHQUFHLENBQUMsQUFBSixDQUFLO2lCQUNsQyxrQkFBYSxHQUFHLElBQUEsMkJBQVksRUFBQyx3QkFBd0IsRUFBRSxrQkFBTyxDQUFDLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxxQkFBcUIsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDLEFBQTdILENBQThIO1FBUTNKLFlBQ2tCLDBCQUEyQyxFQUMzQyxNQUFtRCxFQUNuRCxvQkFBMkMsRUFDckMsb0JBQTJDLEVBQzNDLG9CQUE0RCxFQUNsRSxjQUFnRCxFQUM5QyxnQkFBb0Q7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFSUywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQWlCO1lBQzNDLFdBQU0sR0FBTixNQUFNLENBQTZDO1lBQ25ELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFcEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDN0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQVh2RCx5QkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZ0JBQU0sQ0FBQyw2QkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDdEUsa0JBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZ0JBQU0sQ0FBQywrQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFjakYsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFR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
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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/contrib/scm/common/scm", "vs/css!./media/scm"], function (require, exports, arrays_1, event_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, actions_1, contextkey_1, instantiation_1, serviceCollection_1, scm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMMenus = exports.SCMHistoryProviderMenus = exports.SCMRepositoryMenus = exports.SCMTitleMenu = void 0;
    function actionEquals(a, b) {
        return a.id === b.id;
    }
    const repositoryMenuDisposables = new lifecycle_1.DisposableStore();
    actions_1.MenuRegistry.onDidChangeMenu(e => {
        if (e.has(actions_1.MenuId.SCMTitle)) {
            repositoryMenuDisposables.clear();
            for (const menuItem of actions_1.MenuRegistry.getMenuItems(actions_1.MenuId.SCMTitle)) {
                repositoryMenuDisposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.SCMSourceControlInline, menuItem));
            }
        }
    });
    let SCMTitleMenu = class SCMTitleMenu {
        get actions() { return this._actions; }
        get secondaryActions() { return this._secondaryActions; }
        constructor(menuService, contextKeyService) {
            this._actions = [];
            this._secondaryActions = [];
            this._onDidChangeTitle = new event_1.Emitter();
            this.onDidChangeTitle = this._onDidChangeTitle.event;
            this.disposables = new lifecycle_1.DisposableStore();
            this.menu = menuService.createMenu(actions_1.MenuId.SCMTitle, contextKeyService);
            this.disposables.add(this.menu);
            this.menu.onDidChange(this.updateTitleActions, this, this.disposables);
            this.updateTitleActions();
        }
        updateTitleActions() {
            const primary = [];
            const secondary = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { shouldForwardArgs: true }, { primary, secondary });
            if ((0, arrays_1.equals)(primary, this._actions, actionEquals) && (0, arrays_1.equals)(secondary, this._secondaryActions, actionEquals)) {
                return;
            }
            this._actions = primary;
            this._secondaryActions = secondary;
            this._onDidChangeTitle.fire();
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.SCMTitleMenu = SCMTitleMenu;
    exports.SCMTitleMenu = SCMTitleMenu = __decorate([
        __param(0, actions_1.IMenuService),
        __param(1, contextkey_1.IContextKeyService)
    ], SCMTitleMenu);
    class SCMMenusItem {
        get resourceGroupMenu() {
            if (!this._resourceGroupMenu) {
                this._resourceGroupMenu = this.menuService.createMenu(actions_1.MenuId.SCMResourceGroupContext, this.contextKeyService);
            }
            return this._resourceGroupMenu;
        }
        get resourceFolderMenu() {
            if (!this._resourceFolderMenu) {
                this._resourceFolderMenu = this.menuService.createMenu(actions_1.MenuId.SCMResourceFolderContext, this.contextKeyService);
            }
            return this._resourceFolderMenu;
        }
        constructor(contextKeyService, menuService) {
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
        }
        getResourceMenu(resource) {
            if (typeof resource.contextValue === 'undefined') {
                if (!this.genericResourceMenu) {
                    this.genericResourceMenu = this.menuService.createMenu(actions_1.MenuId.SCMResourceContext, this.contextKeyService);
                }
                return this.genericResourceMenu;
            }
            if (!this.contextualResourceMenus) {
                this.contextualResourceMenus = new Map();
            }
            let item = this.contextualResourceMenus.get(resource.contextValue);
            if (!item) {
                const contextKeyService = this.contextKeyService.createOverlay([['scmResourceState', resource.contextValue]]);
                const menu = this.menuService.createMenu(actions_1.MenuId.SCMResourceContext, contextKeyService);
                item = {
                    menu, dispose() {
                        menu.dispose();
                    }
                };
                this.contextualResourceMenus.set(resource.contextValue, item);
            }
            return item.menu;
        }
        dispose() {
            this._resourceGroupMenu?.dispose();
            this._resourceFolderMenu?.dispose();
            this.genericResourceMenu?.dispose();
            if (this.contextualResourceMenus) {
                (0, lifecycle_1.dispose)(this.contextualResourceMenus.values());
                this.contextualResourceMenus.clear();
                this.contextualResourceMenus = undefined;
            }
        }
    }
    let SCMRepositoryMenus = class SCMRepositoryMenus {
        get repositoryContextMenu() {
            if (!this._repositoryContextMenu) {
                this._repositoryContextMenu = this.menuService.createMenu(actions_1.MenuId.SCMSourceControl, this.contextKeyService);
                this.disposables.add(this._repositoryContextMenu);
            }
            return this._repositoryContextMenu;
        }
        get historyProviderMenu() {
            if (this.provider.historyProvider && !this._historyProviderMenu) {
                this._historyProviderMenu = new SCMHistoryProviderMenus(this.contextKeyService, this.menuService);
                this.disposables.add(this._historyProviderMenu);
            }
            return this._historyProviderMenu;
        }
        constructor(provider, contextKeyService, instantiationService, menuService) {
            this.provider = provider;
            this.menuService = menuService;
            this.resourceGroupMenusItems = new Map();
            this.disposables = new lifecycle_1.DisposableStore();
            this.contextKeyService = contextKeyService.createOverlay([
                ['scmProvider', provider.contextValue],
                ['scmProviderRootUri', provider.rootUri?.toString()],
                ['scmProviderHasRootUri', !!provider.rootUri],
            ]);
            const serviceCollection = new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.contextKeyService]);
            instantiationService = instantiationService.createChild(serviceCollection);
            this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
            this.disposables.add(this.titleMenu);
            this.repositoryMenu = menuService.createMenu(actions_1.MenuId.SCMSourceControlInline, this.contextKeyService);
            this.disposables.add(this.repositoryMenu);
            provider.onDidChangeResourceGroups(this.onDidChangeResourceGroups, this, this.disposables);
            this.onDidChangeResourceGroups();
        }
        getResourceGroupMenu(group) {
            return this.getOrCreateResourceGroupMenusItem(group).resourceGroupMenu;
        }
        getResourceMenu(resource) {
            return this.getOrCreateResourceGroupMenusItem(resource.resourceGroup).getResourceMenu(resource);
        }
        getResourceFolderMenu(group) {
            return this.getOrCreateResourceGroupMenusItem(group).resourceFolderMenu;
        }
        getOrCreateResourceGroupMenusItem(group) {
            let result = this.resourceGroupMenusItems.get(group);
            if (!result) {
                const contextKeyService = this.contextKeyService.createOverlay([
                    ['scmResourceGroup', group.id],
                    ['multiDiffEditorEnableViewChanges', group.multiDiffEditorEnableViewChanges],
                ]);
                result = new SCMMenusItem(contextKeyService, this.menuService);
                this.resourceGroupMenusItems.set(group, result);
            }
            return result;
        }
        onDidChangeResourceGroups() {
            for (const resourceGroup of this.resourceGroupMenusItems.keys()) {
                if (!this.provider.groups.includes(resourceGroup)) {
                    this.resourceGroupMenusItems.get(resourceGroup)?.dispose();
                    this.resourceGroupMenusItems.delete(resourceGroup);
                }
            }
        }
        dispose() {
            this.disposables.dispose();
            this.resourceGroupMenusItems.forEach(item => item.dispose());
        }
    };
    exports.SCMRepositoryMenus = SCMRepositoryMenus;
    exports.SCMRepositoryMenus = SCMRepositoryMenus = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, actions_1.IMenuService)
    ], SCMRepositoryMenus);
    let SCMHistoryProviderMenus = class SCMHistoryProviderMenus {
        get incomingHistoryItemGroupMenu() { return this._incomingHistoryItemGroupMenu; }
        get outgoingHistoryItemGroupMenu() { return this._outgoingHistoryItemGroupMenu; }
        constructor(contextKeyService, menuService) {
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.historyItemMenus = new Map();
            this.disposables = new lifecycle_1.DisposableStore();
            this._incomingHistoryItemGroupMenu = this.menuService.createMenu(actions_1.MenuId.SCMIncomingChanges, this.contextKeyService);
            this.disposables.add(this._incomingHistoryItemGroupMenu);
            this._outgoingHistoryItemGroupMenu = this.menuService.createMenu(actions_1.MenuId.SCMOutgoingChanges, this.contextKeyService);
            this.disposables.add(this._outgoingHistoryItemGroupMenu);
        }
        getHistoryItemMenu(historyItem) {
            return this.getOrCreateHistoryItemMenu(historyItem);
        }
        getOrCreateHistoryItemMenu(historyItem) {
            let result = this.historyItemMenus.get(historyItem);
            if (!result) {
                let menuId;
                if (historyItem.historyItemGroup.direction === 'incoming') {
                    menuId = historyItem.type === 'allChanges' ?
                        actions_1.MenuId.SCMIncomingChangesAllChangesContext :
                        actions_1.MenuId.SCMIncomingChangesHistoryItemContext;
                }
                else {
                    menuId = historyItem.type === 'allChanges' ?
                        actions_1.MenuId.SCMOutgoingChangesAllChangesContext :
                        actions_1.MenuId.SCMOutgoingChangesHistoryItemContext;
                }
                const contextKeyService = this.contextKeyService.createOverlay([
                    ['scmHistoryItemFileCount', historyItem.statistics?.files ?? 0],
                ]);
                result = this.menuService.createMenu(menuId, contextKeyService);
                this.historyItemMenus.set(historyItem, result);
            }
            return result;
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.SCMHistoryProviderMenus = SCMHistoryProviderMenus;
    exports.SCMHistoryProviderMenus = SCMHistoryProviderMenus = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, actions_1.IMenuService)
    ], SCMHistoryProviderMenus);
    let SCMMenus = class SCMMenus {
        constructor(scmService, instantiationService) {
            this.instantiationService = instantiationService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.menus = new Map();
            this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
            scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
        }
        onDidRemoveRepository(repository) {
            const menus = this.menus.get(repository.provider);
            menus?.dispose();
            this.menus.delete(repository.provider);
        }
        getRepositoryMenus(provider) {
            let result = this.menus.get(provider);
            if (!result) {
                const menus = this.instantiationService.createInstance(SCMRepositoryMenus, provider);
                const dispose = () => {
                    menus.dispose();
                    this.menus.delete(provider);
                };
                result = { menus, dispose };
                this.menus.set(provider, result);
            }
            return result.menus;
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.SCMMenus = SCMMenus;
    exports.SCMMenus = SCMMenus = __decorate([
        __param(0, scm_1.ISCMService),
        __param(1, instantiation_1.IInstantiationService)
    ], SCMMenus);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.SCMResourceContext, {
        title: (0, nls_1.localize)('miShare', "Share"),
        submenu: actions_1.MenuId.SCMResourceContextShare,
        group: '45_share',
        order: 3,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NjbS9icm93c2VyL21lbnVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCaEcsU0FBUyxZQUFZLENBQUMsQ0FBVSxFQUFFLENBQVU7UUFDM0MsT0FBTyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVELE1BQU0seUJBQXlCLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7SUFFeEQsc0JBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDaEMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUM1Qix5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVsQyxLQUFLLE1BQU0sUUFBUSxJQUFJLHNCQUFZLENBQUMsWUFBWSxDQUFDLGdCQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDbkUseUJBQXlCLENBQUMsR0FBRyxDQUFDLHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNyRyxDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUksSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBWTtRQUd4QixJQUFJLE9BQU8sS0FBZ0IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUdsRCxJQUFJLGdCQUFnQixLQUFnQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFRcEUsWUFDZSxXQUF5QixFQUNuQixpQkFBcUM7WUFkbEQsYUFBUSxHQUFjLEVBQUUsQ0FBQztZQUd6QixzQkFB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
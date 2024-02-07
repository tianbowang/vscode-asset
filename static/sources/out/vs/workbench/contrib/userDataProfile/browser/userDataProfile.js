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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/quickinput/common/quickInput", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/tags/common/workspaceTags", "vs/base/common/errors", "vs/platform/action/common/actionCommonCategories", "vs/platform/opener/common/opener"], function (require, exports, lifecycle_1, platform_1, nls_1, actions_1, contextkey_1, userDataProfile_1, lifecycle_2, userDataProfile_2, quickInput_1, notification_1, dialogs_1, uri_1, telemetry_1, workspace_1, workspaceTags_1, errors_1, actionCommonCategories_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfilesWorkbenchContribution = void 0;
    let UserDataProfilesWorkbenchContribution = class UserDataProfilesWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(userDataProfileService, userDataProfilesService, userDataProfileManagementService, userDataProfileImportExportService, telemetryService, workspaceContextService, workspaceTagsService, contextKeyService, lifecycleService) {
            super();
            this.userDataProfileService = userDataProfileService;
            this.userDataProfilesService = userDataProfilesService;
            this.userDataProfileManagementService = userDataProfileManagementService;
            this.userDataProfileImportExportService = userDataProfileImportExportService;
            this.telemetryService = telemetryService;
            this.workspaceContextService = workspaceContextService;
            this.workspaceTagsService = workspaceTagsService;
            this.lifecycleService = lifecycleService;
            this.profilesDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.currentprofileActionsDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.currentProfileContext = userDataProfile_2.CURRENT_PROFILE_CONTEXT.bindTo(contextKeyService);
            userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT.bindTo(contextKeyService).set(this.userDataProfilesService.isEnabled());
            this.isCurrentProfileTransientContext = userDataProfile_2.IS_CURRENT_PROFILE_TRANSIENT_CONTEXT.bindTo(contextKeyService);
            this.currentProfileContext.set(this.userDataProfileService.currentProfile.id);
            this.isCurrentProfileTransientContext.set(!!this.userDataProfileService.currentProfile.isTransient);
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(e => {
                this.currentProfileContext.set(this.userDataProfileService.currentProfile.id);
                this.isCurrentProfileTransientContext.set(!!this.userDataProfileService.currentProfile.isTransient);
            }));
            this.hasProfilesContext = userDataProfile_2.HAS_PROFILES_CONTEXT.bindTo(contextKeyService);
            this.hasProfilesContext.set(this.userDataProfilesService.profiles.length > 1);
            this._register(this.userDataProfilesService.onDidChangeProfiles(e => this.hasProfilesContext.set(this.userDataProfilesService.profiles.length > 1)));
            this.registerActions();
            if (platform_1.isWeb) {
                lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(() => userDataProfilesService.cleanUp());
            }
            this.reportWorkspaceProfileInfo();
        }
        registerActions() {
            this.registerProfileSubMenu();
            this._register(this.registerSwitchProfileAction());
            this.registerProfilesActions();
            this._register(this.userDataProfilesService.onDidChangeProfiles(() => this.registerProfilesActions()));
            this.registerCurrentProfilesActions();
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => this.registerCurrentProfilesActions()));
            this.registerCreateFromCurrentProfileAction();
            this.registerCreateProfileAction();
            this.registerDeleteProfileAction();
            this.registerHelpAction();
        }
        registerProfileSubMenu() {
            const getProfilesTitle = () => {
                return (0, nls_1.localize)('profiles', "Profiles ({0})", this.userDataProfileService.currentProfile.name);
            };
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                get title() {
                    return getProfilesTitle();
                },
                submenu: userDataProfile_2.ProfilesMenu,
                group: '2_configuration',
                order: 1,
            });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                get title() {
                    return getProfilesTitle();
                },
                submenu: userDataProfile_2.ProfilesMenu,
                group: '2_configuration',
                order: 1,
                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
            });
        }
        registerProfilesActions() {
            this.profilesDisposable.value = new lifecycle_1.DisposableStore();
            for (const profile of this.userDataProfilesService.profiles) {
                this.profilesDisposable.value.add(this.registerProfileEntryAction(profile));
            }
        }
        registerProfileEntryAction(profile) {
            const that = this;
            return (0, actions_1.registerAction2)(class ProfileEntryAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.profiles.actions.profileEntry.${profile.id}`,
                        title: profile.name,
                        toggled: contextkey_1.ContextKeyExpr.equals(userDataProfile_2.CURRENT_PROFILE_CONTEXT.key, profile.id),
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '0_profiles',
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                            }
                        ]
                    });
                }
                async run(accessor) {
                    if (that.userDataProfileService.currentProfile.id !== profile.id) {
                        return that.userDataProfileManagementService.switchProfile(profile);
                    }
                }
            });
        }
        registerSwitchProfileAction() {
            return (0, actions_1.registerAction2)(class SwitchProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.profiles.actions.switchProfile`,
                        title: (0, nls_1.localize2)('switchProfile', 'Switch Profile...'),
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        f1: true,
                        precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                    });
                }
                async run(accessor) {
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const menuService = accessor.get(actions_1.IMenuService);
                    const menu = menuService.createMenu(userDataProfile_2.ProfilesMenu, accessor.get(contextkey_1.IContextKeyService));
                    const actions = menu.getActions().find(([group]) => group === '0_profiles')?.[1] ?? [];
                    try {
                        const result = await quickInputService.pick(actions.map(action => ({
                            action,
                            label: action.checked ? `$(check) ${action.label}` : action.label,
                        })), {
                            placeHolder: (0, nls_1.localize)('selectProfile', "Select Profile")
                        });
                        await result?.action.run();
                    }
                    finally {
                        menu.dispose();
                    }
                }
            });
        }
        registerCurrentProfilesActions() {
            this.currentprofileActionsDisposable.value = new lifecycle_1.DisposableStore();
            this.currentprofileActionsDisposable.value.add(this.registerEditCurrentProfileAction());
            this.currentprofileActionsDisposable.value.add(this.registerShowCurrentProfileContentsAction());
            this.currentprofileActionsDisposable.value.add(this.registerExportCurrentProfileAction());
            this.currentprofileActionsDisposable.value.add(this.registerImportProfileAction());
        }
        registerEditCurrentProfileAction() {
            const that = this;
            return (0, actions_1.registerAction2)(class RenameCurrentProfileAction extends actions_1.Action2 {
                constructor() {
                    const when = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals(userDataProfile_2.CURRENT_PROFILE_CONTEXT.key, that.userDataProfilesService.defaultProfile.id), userDataProfile_2.IS_CURRENT_PROFILE_TRANSIENT_CONTEXT.toNegated());
                    super({
                        id: `workbench.profiles.actions.editCurrentProfile`,
                        title: {
                            value: (0, nls_1.localize)('edit profile', "Edit Profile..."),
                            original: `Edit Profile...`
                        },
                        precondition: when,
                        f1: true,
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '2_manage_current',
                                when,
                                order: 2
                            }
                        ]
                    });
                }
                run() {
                    return that.userDataProfileImportExportService.editProfile(that.userDataProfileService.currentProfile);
                }
            });
        }
        registerShowCurrentProfileContentsAction() {
            const id = 'workbench.profiles.actions.showProfileContents';
            return (0, actions_1.registerAction2)(class ShowProfileContentsAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id,
                        title: {
                            value: (0, nls_1.localize)('show profile contents', "Show Profile Contents"),
                            original: `Show Profile Contents`
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '2_manage_current',
                                order: 3
                            }, {
                                id: actions_1.MenuId.CommandPalette
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const userDataProfileImportExportService = accessor.get(userDataProfile_2.IUserDataProfileImportExportService);
                    return userDataProfileImportExportService.showProfileContents();
                }
            });
        }
        registerExportCurrentProfileAction() {
            const that = this;
            const disposables = new lifecycle_1.DisposableStore();
            const id = 'workbench.profiles.actions.exportProfile';
            disposables.add((0, actions_1.registerAction2)(class ExportProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id,
                        title: {
                            value: (0, nls_1.localize)('export profile', "Export Profile..."),
                            original: `Export Profile (${that.userDataProfileService.currentProfile.name})...`
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        precondition: userDataProfile_2.IS_PROFILE_EXPORT_IN_PROGRESS_CONTEXT.toNegated(),
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '4_import_export_profiles',
                                order: 1
                            }, {
                                id: actions_1.MenuId.CommandPalette
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const userDataProfileImportExportService = accessor.get(userDataProfile_2.IUserDataProfileImportExportService);
                    return userDataProfileImportExportService.exportProfile();
                }
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarShare, {
                command: {
                    id,
                    title: {
                        value: (0, nls_1.localize)('export profile in share', "Export Profile ({0})...", that.userDataProfileService.currentProfile.name),
                        original: `Export Profile (${that.userDataProfileService.currentProfile.name})...`
                    },
                    precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                },
            }));
            return disposables;
        }
        registerImportProfileAction() {
            const disposables = new lifecycle_1.DisposableStore();
            const id = 'workbench.profiles.actions.importProfile';
            const that = this;
            disposables.add((0, actions_1.registerAction2)(class ImportProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id,
                        title: {
                            value: (0, nls_1.localize)('import profile', "Import Profile..."),
                            original: 'Import Profile...'
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        precondition: userDataProfile_2.IS_PROFILE_IMPORT_IN_PROGRESS_CONTEXT.toNegated(),
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '4_import_export_profiles',
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                                order: 2
                            }, {
                                id: actions_1.MenuId.CommandPalette,
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const userDataProfileImportExportService = accessor.get(userDataProfile_2.IUserDataProfileImportExportService);
                    const notificationService = accessor.get(notification_1.INotificationService);
                    const disposables = new lifecycle_1.DisposableStore();
                    const quickPick = disposables.add(quickInputService.createQuickPick());
                    const profileTemplateQuickPickItems = await that.getProfileTemplatesQuickPickItems();
                    const updateQuickPickItems = (value) => {
                        const quickPickItems = [];
                        if (value) {
                            quickPickItems.push({ label: quickPick.value, description: (0, nls_1.localize)('import from url', "Import from URL") });
                        }
                        quickPickItems.push({ label: (0, nls_1.localize)('import from file', "Select File...") });
                        if (profileTemplateQuickPickItems.length) {
                            quickPickItems.push({
                                type: 'separator',
                                label: (0, nls_1.localize)('templates', "Profile Templates")
                            }, ...profileTemplateQuickPickItems);
                        }
                        quickPick.items = quickPickItems;
                    };
                    quickPick.title = (0, nls_1.localize)('import profile quick pick title', "Import from Profile Template...");
                    quickPick.placeholder = (0, nls_1.localize)('import profile placeholder', "Provide Profile Template URL");
                    quickPick.ignoreFocusOut = true;
                    disposables.add(quickPick.onDidChangeValue(updateQuickPickItems));
                    updateQuickPickItems();
                    quickPick.matchOnLabel = false;
                    quickPick.matchOnDescription = false;
                    disposables.add(quickPick.onDidAccept(async () => {
                        quickPick.hide();
                        const selectedItem = quickPick.selectedItems[0];
                        if (!selectedItem) {
                            return;
                        }
                        try {
                            if (selectedItem.url) {
                                return await that.userDataProfileImportExportService.createProfile(uri_1.URI.parse(selectedItem.url));
                            }
                            const profile = selectedItem.label === quickPick.value ? uri_1.URI.parse(quickPick.value) : await this.getProfileUriFromFileSystem(fileDialogService);
                            if (profile) {
                                await userDataProfileImportExportService.importProfile(profile);
                            }
                        }
                        catch (error) {
                            notificationService.error((0, nls_1.localize)('profile import error', "Error while creating profile: {0}", (0, errors_1.getErrorMessage)(error)));
                        }
                    }));
                    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
                    quickPick.show();
                }
                async getProfileUriFromFileSystem(fileDialogService) {
                    const profileLocation = await fileDialogService.showOpenDialog({
                        canSelectFolders: false,
                        canSelectFiles: true,
                        canSelectMany: false,
                        filters: userDataProfile_2.PROFILE_FILTER,
                        title: (0, nls_1.localize)('import profile dialog', "Select Profile Template File"),
                    });
                    if (!profileLocation) {
                        return null;
                    }
                    return profileLocation[0];
                }
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarShare, {
                command: {
                    id,
                    title: {
                        value: (0, nls_1.localize)('import profile share', "Import Profile..."),
                        original: 'Import Profile...'
                    },
                    precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                },
            }));
            return disposables;
        }
        registerCreateFromCurrentProfileAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class CreateFromCurrentProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.createFromCurrentProfile',
                        title: {
                            value: (0, nls_1.localize)('save profile as', "Save Current Profile As..."),
                            original: 'Save Current Profile As...'
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        f1: true,
                        precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT
                    });
                }
                run(accessor) {
                    return that.userDataProfileImportExportService.createProfile(that.userDataProfileService.currentProfile);
                }
            }));
        }
        registerCreateProfileAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class CreateProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.createProfile',
                        title: {
                            value: (0, nls_1.localize)('create profile', "Create Profile..."),
                            original: 'Create Profile...'
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                        f1: true,
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '3_manage_profiles',
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                                order: 1
                            }
                        ]
                    });
                }
                async run(accessor) {
                    return that.userDataProfileImportExportService.createProfile();
                }
            }));
        }
        registerDeleteProfileAction() {
            (0, actions_1.registerAction2)(class DeleteProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.deleteProfile',
                        title: {
                            value: (0, nls_1.localize)('delete profile', "Delete Profile..."),
                            original: 'Delete Profile...'
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        f1: true,
                        precondition: contextkey_1.ContextKeyExpr.and(userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT, userDataProfile_2.HAS_PROFILES_CONTEXT),
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '3_manage_profiles',
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                                order: 2
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const userDataProfileService = accessor.get(userDataProfile_2.IUserDataProfileService);
                    const userDataProfilesService = accessor.get(userDataProfile_1.IUserDataProfilesService);
                    const userDataProfileManagementService = accessor.get(userDataProfile_2.IUserDataProfileManagementService);
                    const notificationService = accessor.get(notification_1.INotificationService);
                    const profiles = userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient);
                    if (profiles.length) {
                        const picks = await quickInputService.pick(profiles.map(profile => ({
                            label: profile.name,
                            description: profile.id === userDataProfileService.currentProfile.id ? (0, nls_1.localize)('current', "Current") : undefined,
                            profile
                        })), {
                            title: (0, nls_1.localize)('delete specific profile', "Delete Profile..."),
                            placeHolder: (0, nls_1.localize)('pick profile to delete', "Select Profiles to Delete"),
                            canPickMany: true
                        });
                        if (picks) {
                            try {
                                await Promise.all(picks.map(pick => userDataProfileManagementService.removeProfile(pick.profile)));
                            }
                            catch (error) {
                                notificationService.error(error);
                            }
                        }
                    }
                }
            });
        }
        registerHelpAction() {
            this._register((0, actions_1.registerAction2)(class HelpAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.help',
                        title: userDataProfile_2.PROFILES_TITLE,
                        category: actionCommonCategories_1.Categories.Help,
                        menu: [{
                                id: actions_1.MenuId.CommandPalette,
                            }],
                    });
                }
                run(accessor) {
                    return accessor.get(opener_1.IOpenerService).open(uri_1.URI.parse('https://aka.ms/vscode-profiles-help'));
                }
            }));
        }
        async getProfileTemplatesQuickPickItems() {
            const quickPickItems = [];
            const profileTemplates = await this.userDataProfileManagementService.getBuiltinProfileTemplates();
            for (const template of profileTemplates) {
                quickPickItems.push({
                    label: template.name,
                    ...template
                });
            }
            return quickPickItems;
        }
        async reportWorkspaceProfileInfo() {
            await this.lifecycleService.when(4 /* LifecyclePhase.Eventually */);
            const workspaceId = await this.workspaceTagsService.getTelemetryWorkspaceId(this.workspaceContextService.getWorkspace(), this.workspaceContextService.getWorkbenchState());
            this.telemetryService.publicLog2('workspaceProfileInfo', {
                workspaceId,
                defaultProfile: this.userDataProfileService.currentProfile.isDefault
            });
        }
    };
    exports.UserDataProfilesWorkbenchContribution = UserDataProfilesWorkbenchContribution;
    exports.UserDataProfilesWorkbenchContribution = UserDataProfilesWorkbenchContribution = __decorate([
        __param(0, userDataProfile_2.IUserDataProfileService),
        __param(1, userDataProfile_1.IUserDataProfilesService),
        __param(2, userDataProfile_2.IUserDataProfileManagementService),
        __param(3, userDataProfile_2.IUserDataProfileImportExportService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, workspaceTags_1.IWorkspaceTagsService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, lifecycle_2.ILifecycleService)
    ], UserDataProfilesWorkbenchContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi91c2VyRGF0YVByb2ZpbGUvYnJvd3Nlci91c2VyRGF0YVByb2ZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJ6RixJQUFNLHFDQUFxQyxHQUEzQyxNQUFNLHFDQUFzQyxTQUFRLHNCQUFVO1FBTXBFLFlBQzBCLHNCQUFnRSxFQUMvRCx1QkFBa0UsRUFDekQsZ0NBQW9GLEVBQ2xGLGtDQUF3RixFQUMxRyxnQkFBb0QsRUFDN0MsdUJBQWtFLEVBQ3JFLG9CQUE0RCxFQUMvRCxpQkFBcUMsRUFDdEMsZ0JBQW9EO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBVmtDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDOUMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUN4QyxxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQW1DO1lBQ2pFLHVDQUFrQyxHQUFsQyxrQ0FBa0MsQ0FBcUM7WUFDekYscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUM1Qiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQ3BELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQW9FdkQsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFtQixDQUFDLENBQUM7WUFnRTlFLG9DQUErQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBbUIsQ0FBQyxDQUFDO1lBaEkzRyxJQUFJLENBQUMscUJBQXFCLEdBQUcseUNBQXVCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0UsNkNBQTJCLENBQUMsTUFBTSxD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
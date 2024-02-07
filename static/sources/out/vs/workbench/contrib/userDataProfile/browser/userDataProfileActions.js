/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/action/common/actionCommonCategories", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/base/common/codicons", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/actions"], function (require, exports, nls_1, actions_1, notification_1, quickInput_1, userDataProfile_1, userDataProfile_2, actionCommonCategories_1, contextkey_1, commands_1, codicons_1, menuEntryActionViewItem_1, actions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenameProfileAction = void 0;
    class CreateTransientProfileAction extends actions_1.Action2 {
        static { this.ID = 'workbench.profiles.actions.createTemporaryProfile'; }
        static { this.TITLE = {
            value: (0, nls_1.localize)('create temporary profile', "Create a Temporary Profile"),
            original: 'Create a Temporary Profile'
        }; }
        constructor() {
            super({
                id: CreateTransientProfileAction.ID,
                title: CreateTransientProfileAction.TITLE,
                category: userDataProfile_1.PROFILES_CATEGORY,
                f1: true,
                precondition: userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT,
            });
        }
        async run(accessor) {
            return accessor.get(userDataProfile_1.IUserDataProfileManagementService).createAndEnterTransientProfile();
        }
    }
    (0, actions_1.registerAction2)(CreateTransientProfileAction);
    class RenameProfileAction extends actions_1.Action2 {
        static { this.ID = 'workbench.profiles.actions.renameProfile'; }
        constructor() {
            super({
                id: RenameProfileAction.ID,
                title: {
                    value: (0, nls_1.localize)('rename profile', "Rename..."),
                    original: 'Rename...'
                },
                category: userDataProfile_1.PROFILES_CATEGORY,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT, userDataProfile_1.HAS_PROFILES_CONTEXT),
            });
        }
        async run(accessor, profile) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const userDataProfileService = accessor.get(userDataProfile_1.IUserDataProfileService);
            const userDataProfilesService = accessor.get(userDataProfile_2.IUserDataProfilesService);
            const userDataProfileManagementService = accessor.get(userDataProfile_1.IUserDataProfileManagementService);
            const notificationService = accessor.get(notification_1.INotificationService);
            if (!profile) {
                profile = await this.pickProfile(quickInputService, userDataProfileService, userDataProfilesService);
            }
            if (!profile || profile.isDefault) {
                return;
            }
            const name = await quickInputService.input({
                value: profile.name,
                title: (0, nls_1.localize)('select profile to rename', 'Rename {0}', profile.name),
                validateInput: async (value) => {
                    if (profile.name !== value && userDataProfilesService.profiles.some(p => p.name === value)) {
                        return (0, nls_1.localize)('profileExists', "Profile with name {0} already exists.", value);
                    }
                    return undefined;
                }
            });
            if (name && name !== profile.name) {
                try {
                    await userDataProfileManagementService.updateProfile(profile, { name });
                }
                catch (error) {
                    notificationService.error(error);
                }
            }
        }
        async pickProfile(quickInputService, userDataProfileService, userDataProfilesService) {
            const profiles = userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient);
            if (!profiles.length) {
                return undefined;
            }
            const pick = await quickInputService.pick(profiles.map(profile => ({
                label: profile.name,
                description: profile.id === userDataProfileService.currentProfile.id ? (0, nls_1.localize)('current', "Current") : undefined,
                profile
            })), {
                title: (0, nls_1.localize)('rename specific profile', "Rename Profile..."),
                placeHolder: (0, nls_1.localize)('pick profile to rename', "Select Profile to Rename"),
            });
            return pick?.profile;
        }
    }
    exports.RenameProfileAction = RenameProfileAction;
    (0, actions_1.registerAction2)(RenameProfileAction);
    (0, actions_1.registerAction2)(class ManageProfilesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: userDataProfile_1.MANAGE_PROFILES_ACTION_ID,
                title: {
                    value: (0, nls_1.localize)('mange', "Manage..."),
                    original: 'Manage...'
                },
                category: userDataProfile_1.PROFILES_CATEGORY,
                precondition: contextkey_1.ContextKeyExpr.and(userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT, userDataProfile_1.HAS_PROFILES_CONTEXT),
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const menuService = accessor.get(actions_1.IMenuService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const commandService = accessor.get(commands_1.ICommandService);
            const menu = menuService.createMenu(userDataProfile_1.ProfilesMenu, contextKeyService);
            const actions = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, undefined, actions);
            menu.dispose();
            if (actions.length) {
                const picks = actions.map(action => {
                    if (action instanceof actions_2.Separator) {
                        return { type: 'separator' };
                    }
                    return {
                        id: action.id,
                        label: `${action.label}${action.checked ? ` $(${codicons_1.Codicon.check.id})` : ''}`,
                    };
                });
                const pick = await quickInputService.pick(picks, { canPickMany: false, title: userDataProfile_1.PROFILES_CATEGORY.value });
                if (pick?.id) {
                    await commandService.executeCommand(pick.id);
                }
            }
        }
    });
    // Developer Actions
    (0, actions_1.registerAction2)(class CleanupProfilesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.profiles.actions.cleanupProfiles',
                title: {
                    value: (0, nls_1.localize)('cleanup profile', "Cleanup Profiles"),
                    original: 'Cleanup Profiles'
                },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                precondition: userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT,
            });
        }
        async run(accessor) {
            return accessor.get(userDataProfile_2.IUserDataProfilesService).cleanUp();
        }
    });
    (0, actions_1.registerAction2)(class ResetWorkspacesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.profiles.actions.resetWorkspaces',
                title: {
                    value: (0, nls_1.localize)('reset workspaces', "Reset Workspace Profiles Associations"),
                    original: 'Reset Workspace Profiles Associations'
                },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                precondition: userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT,
            });
        }
        async run(accessor) {
            const userDataProfilesService = accessor.get(userDataProfile_2.IUserDataProfilesService);
            return userDataProfilesService.resetWorkspaces();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdXNlckRhdGFQcm9maWxlL2Jyb3dzZXIvdXNlckRhdGFQcm9maWxlQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQU0sNEJBQTZCLFNBQVEsaUJBQU87aUJBQ2pDLE9BQUUsR0FBRyxtREFBbUQsQ0FBQztpQkFDekQsVUFBSyxHQUFHO1lBQ3ZCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSw0QkFBNEIsQ0FBQztZQUN6RSxRQUFRLEVBQUUsNEJBQTRCO1NBQ3RDLENBQUM7UUFDRjtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNEJBQTRCLENBQUMsRUFBRTtnQkFDbkMsS0FBSyxFQUFFLDRCQUE0QixDQUFDLEtBQUs7Z0JBQ3pDLFFBQVEsRUFBRSxtQ0FBaUI7Z0JBQzNCLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFlBQVksRUFBRSw2Q0FBMkI7YUFDekMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLG1EQUFpQyxDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FBQztRQUN6RixDQUFDOztJQUdGLElBQUEseUJBQWUsRUFBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBRTlDLE1BQWEsbUJBQW9CLFNBQVEsaUJBQU87aUJBQy9CLE9BQUUsR0FBRywwQ0FBMEMsQ0FBQztRQUNoRTtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtnQkFDMUIsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxXQUFX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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/nls", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/platform/action/common/actionCommonCategories"], function (require, exports, instantiation_1, contextkey_1, nls_1, codicons_1, iconRegistry_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR = exports.SYNC_CONFLICTS_VIEW_ID = exports.SYNC_VIEW_CONTAINER_ID = exports.SHOW_SYNC_LOG_COMMAND_ID = exports.CONFIGURE_SYNC_COMMAND_ID = exports.CONTEXT_HAS_CONFLICTS = exports.CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW = exports.CONTEXT_ENABLE_ACTIVITY_VIEWS = exports.CONTEXT_ACCOUNT_STATE = exports.CONTEXT_SYNC_ENABLEMENT = exports.CONTEXT_SYNC_STATE = exports.SYNC_VIEW_ICON = exports.SYNC_TITLE = exports.AccountStatus = exports.getSyncAreaLabel = exports.IUserDataSyncWorkbenchService = void 0;
    exports.IUserDataSyncWorkbenchService = (0, instantiation_1.createDecorator)('IUserDataSyncWorkbenchService');
    function getSyncAreaLabel(source) {
        switch (source) {
            case "settings" /* SyncResource.Settings */: return (0, nls_1.localize)('settings', "Settings");
            case "keybindings" /* SyncResource.Keybindings */: return (0, nls_1.localize)('keybindings', "Keyboard Shortcuts");
            case "snippets" /* SyncResource.Snippets */: return (0, nls_1.localize)('snippets', "User Snippets");
            case "tasks" /* SyncResource.Tasks */: return (0, nls_1.localize)('tasks', "User Tasks");
            case "extensions" /* SyncResource.Extensions */: return (0, nls_1.localize)('extensions', "Extensions");
            case "globalState" /* SyncResource.GlobalState */: return (0, nls_1.localize)('ui state label', "UI State");
            case "profiles" /* SyncResource.Profiles */: return (0, nls_1.localize)('profiles', "Profiles");
            case "workspaceState" /* SyncResource.WorkspaceState */: return (0, nls_1.localize)('workspace state label', "Workspace State");
        }
    }
    exports.getSyncAreaLabel = getSyncAreaLabel;
    var AccountStatus;
    (function (AccountStatus) {
        AccountStatus["Unavailable"] = "unavailable";
        AccountStatus["Available"] = "available";
    })(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
    exports.SYNC_TITLE = (0, nls_1.localize2)('sync category', "Settings Sync");
    exports.SYNC_VIEW_ICON = (0, iconRegistry_1.registerIcon)('settings-sync-view-icon', codicons_1.Codicon.sync, (0, nls_1.localize)('syncViewIcon', 'View icon of the Settings Sync view.'));
    // Contexts
    exports.CONTEXT_SYNC_STATE = new contextkey_1.RawContextKey('syncStatus', "uninitialized" /* SyncStatus.Uninitialized */);
    exports.CONTEXT_SYNC_ENABLEMENT = new contextkey_1.RawContextKey('syncEnabled', false);
    exports.CONTEXT_ACCOUNT_STATE = new contextkey_1.RawContextKey('userDataSyncAccountStatus', "unavailable" /* AccountStatus.Unavailable */);
    exports.CONTEXT_ENABLE_ACTIVITY_VIEWS = new contextkey_1.RawContextKey(`enableSyncActivityViews`, false);
    exports.CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW = new contextkey_1.RawContextKey(`enableSyncConflictsView`, false);
    exports.CONTEXT_HAS_CONFLICTS = new contextkey_1.RawContextKey('hasConflicts', false);
    // Commands
    exports.CONFIGURE_SYNC_COMMAND_ID = 'workbench.userDataSync.actions.configure';
    exports.SHOW_SYNC_LOG_COMMAND_ID = 'workbench.userDataSync.actions.showLog';
    // VIEWS
    exports.SYNC_VIEW_CONTAINER_ID = 'workbench.view.sync';
    exports.SYNC_CONFLICTS_VIEW_ID = 'workbench.views.sync.conflicts';
    exports.DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR = {
        id: 'workbench.userDataSync.actions.downloadSyncActivity',
        title: { original: 'Download Settings Sync Activity', value: (0, nls_1.localize)('download sync activity title', "Download Settings Sync Activity") },
        category: actionCommonCategories_1.Categories.Developer,
        f1: true,
        precondition: contextkey_1.ContextKeyExpr.and(exports.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* AccountStatus.Available */), exports.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */))
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdXNlckRhdGFTeW5jL2NvbW1vbi91c2VyRGF0YVN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJuRixRQUFBLDZCQUE2QixHQUFHLElBQUEsK0JBQWUsRUFBZ0MsK0JBQStCLENBQUMsQ0FBQztJQTZCN0gsU0FBZ0IsZ0JBQWdCLENBQUMsTUFBb0I7UUFDcEQsUUFBUSxNQUFNLEVBQUUsQ0FBQztZQUNoQiwyQ0FBMEIsQ0FBQyxDQUFDLE9BQU8sSUFBQSxjQUFRLEVBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3BFLGlEQUE2QixDQUFDLENBQUMsT0FBTyxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUNwRiwyQ0FBMEIsQ0FBQyxDQUFDLE9BQU8sSUFBQSxjQUFRLEVBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ3pFLHFDQUF1QixDQUFDLENBQUMsT0FBTyxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDaEUsK0NBQTRCLENBQUMsQ0FBQyxPQUFPLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxRSxpREFBNkIsQ0FBQyxDQUFDLE9BQU8sSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDN0UsMkNBQTBCLENBQUMsQ0FBQyxPQUFPLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNwRSx1REFBZ0MsQ0FBQyxDQUFDLE9BQU8sSUFBQSxjQUFRLEVBQUMsdUJBQXVCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUMvRixDQUFDO0lBQ0YsQ0FBQztJQVhELDRDQVdDO0lBRUQsSUFBa0IsYUFHakI7SUFIRCxXQUFrQixhQUFhO1FBQzlCLDRDQUEyQixDQUFBO1FBQzNCLHdDQUF1QixDQUFBO0lBQ3hCLENBQUMsRUFIaUIsYUFBYSw2QkFBYixhQUFhLFFBRzlCO0lBTVksUUFBQSxVQUFVLEdBQXFCLElBQUEsZUFBUyxFQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUUzRSxRQUFBLGNBQWMsR0FBRyxJQUFBLDJCQUFZLEVBQUMseUJBQXlCLEVBQUUsa0JBQU8sQ0FBQyxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLHNDQUFzQyxDQUFDLENBQUMsQ0FBQztJQUV0SixXQUFXO0lBQ0UsUUFBQSxrQkFBa0IsR0FBRyxJQUFJLDBCQUFhLENBQVMsWUFBWSxpREFBMkIsQ0FBQztJQUN2RixRQUFBLHVCQUF1QixHQUFHLElBQUksMEJBQWEsQ0FBVSxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0UsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLDBCQUFhLENBQVMsMkJBQTJCLGdEQUE0QixDQUFDO0lBQzFHLFFBQUEsNkJBQTZCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdGLFFBQUEsa0NBQWtDLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xHLFFBQUEscUJBQXFCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV2RixXQUFXO0lBQ0UsUUFBQSx5QkFBeUIsR0FBRywwQ0FBMEMsQ0FBQztJQUN2RSxRQUFBLHdCQUF3QixHQUFHLHdDQUF3QyxDQUFDO0lBRWpGLFFBQVE7SUFDSyxRQUFBLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDO0lBQy9DLFFBQUEsc0JBQXNCLEdBQUcsZ0NBQWdDLENBQUM7SUFFMUQsUUFBQSxtQ0FBbUMsR0FBOEI7UUFDN0UsRUFBRSxFQUFFLHFEQUFxRDtRQUN6RCxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsaUNBQWlDLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDhCQUE4QixFQUFFLGlDQUFpQyxDQUFDLEVBQUU7UUFDMUksUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztRQUM5QixFQUFFLEVBQUUsSUFBSTtRQUNSLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyw2QkFBcUIsQ0FBQyxTQUFTLDJDQUF5QixFQUFFLDBCQUFrQixDQUFDLFdBQVcsZ0RBQTBCLENBQUM7S0FDcEosQ0FBQyJ9
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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/treeView", "vs/workbench/common/views", "vs/workbench/contrib/editSessions/common/editSessions", "vs/base/common/uri", "vs/base/common/date", "vs/base/common/codicons", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/base/common/resources", "vs/platform/files/common/files", "vs/base/common/path"], function (require, exports, lifecycle_1, nls_1, descriptors_1, instantiation_1, platform_1, treeView_1, views_1, editSessions_1, uri_1, date_1, codicons_1, editorCommands_1, actions_1, contextkey_1, commands_1, dialogs_1, workspace_1, resources_1, files_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditSessionsDataViews = void 0;
    const EDIT_SESSIONS_COUNT_KEY = 'editSessionsCount';
    const EDIT_SESSIONS_COUNT_CONTEXT_KEY = new contextkey_1.RawContextKey(EDIT_SESSIONS_COUNT_KEY, 0);
    let EditSessionsDataViews = class EditSessionsDataViews extends lifecycle_1.Disposable {
        constructor(container, instantiationService) {
            super();
            this.instantiationService = instantiationService;
            this.registerViews(container);
        }
        registerViews(container) {
            const viewId = editSessions_1.EDIT_SESSIONS_DATA_VIEW_ID;
            const treeView = this.instantiationService.createInstance(treeView_1.TreeView, viewId, editSessions_1.EDIT_SESSIONS_TITLE.value);
            treeView.showCollapseAllAction = true;
            treeView.showRefreshAction = true;
            treeView.dataProvider = this.instantiationService.createInstance(EditSessionDataViewDataProvider);
            const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id: viewId,
                    name: editSessions_1.EDIT_SESSIONS_TITLE,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(treeView_1.TreeViewPane),
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    when: contextkey_1.ContextKeyExpr.and(editSessions_1.EDIT_SESSIONS_SHOW_VIEW),
                    order: 100,
                    hideByDefault: true,
                }], container);
            viewsRegistry.registerViewWelcomeContent(viewId, {
                content: (0, nls_1.localize)('noStoredChanges', 'You have no stored changes in the cloud to display.\n{0}', `[${(0, nls_1.localize)('storeWorkingChangesTitle', 'Store Working Changes')}](command:workbench.editSessions.actions.store)`),
                when: contextkey_1.ContextKeyExpr.equals(EDIT_SESSIONS_COUNT_KEY, 0),
                order: 1
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.resume',
                        title: (0, nls_1.localize)('workbench.editSessions.actions.resume.v2', "Resume Working Changes"),
                        icon: codicons_1.Codicon.desktopDownload,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewId), contextkey_1.ContextKeyExpr.regex('viewItem', /edit-session/i)),
                            group: 'inline'
                        }
                    });
                }
                async run(accessor, handle) {
                    const editSessionId = uri_1.URI.parse(handle.$treeItemHandle).path.substring(1);
                    const commandService = accessor.get(commands_1.ICommandService);
                    await commandService.executeCommand('workbench.editSessions.actions.resumeLatest', editSessionId, true);
                    await treeView.refresh();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.store',
                        title: (0, nls_1.localize)('workbench.editSessions.actions.store.v2', "Store Working Changes"),
                        icon: codicons_1.Codicon.cloudUpload,
                    });
                }
                async run(accessor, handle) {
                    const commandService = accessor.get(commands_1.ICommandService);
                    await commandService.executeCommand('workbench.editSessions.actions.storeCurrent');
                    await treeView.refresh();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.delete',
                        title: (0, nls_1.localize)('workbench.editSessions.actions.delete.v2', "Delete Working Changes"),
                        icon: codicons_1.Codicon.trash,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewId), contextkey_1.ContextKeyExpr.regex('viewItem', /edit-session/i)),
                            group: 'inline'
                        }
                    });
                }
                async run(accessor, handle) {
                    const editSessionId = uri_1.URI.parse(handle.$treeItemHandle).path.substring(1);
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const editSessionStorageService = accessor.get(editSessions_1.IEditSessionsStorageService);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)('confirm delete.v2', 'Are you sure you want to permanently delete your working changes with ref {0}?', editSessionId),
                        detail: (0, nls_1.localize)('confirm delete detail.v2', ' You cannot undo this action.'),
                        type: 'warning',
                        title: editSessions_1.EDIT_SESSIONS_TITLE.value
                    });
                    if (result.confirmed) {
                        await editSessionStorageService.delete('editSessions', editSessionId);
                        await treeView.refresh();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.editSessions.actions.deleteAll',
                        title: (0, nls_1.localize)('workbench.editSessions.actions.deleteAll', "Delete All Working Changes from Cloud"),
                        icon: codicons_1.Codicon.trash,
                        menu: {
                            id: actions_1.MenuId.ViewTitle,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewId), contextkey_1.ContextKeyExpr.greater(EDIT_SESSIONS_COUNT_KEY, 0)),
                        }
                    });
                }
                async run(accessor) {
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const editSessionStorageService = accessor.get(editSessions_1.IEditSessionsStorageService);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)('confirm delete all', 'Are you sure you want to permanently delete all stored changes from the cloud?'),
                        detail: (0, nls_1.localize)('confirm delete all detail', ' You cannot undo this action.'),
                        type: 'warning',
                        title: editSessions_1.EDIT_SESSIONS_TITLE.value
                    });
                    if (result.confirmed) {
                        await editSessionStorageService.delete('editSessions', null);
                        await treeView.refresh();
                    }
                }
            });
        }
    };
    exports.EditSessionsDataViews = EditSessionsDataViews;
    exports.EditSessionsDataViews = EditSessionsDataViews = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], EditSessionsDataViews);
    let EditSessionDataViewDataProvider = class EditSessionDataViewDataProvider {
        constructor(editSessionsStorageService, contextKeyService, workspaceContextService, fileService) {
            this.editSessionsStorageService = editSessionsStorageService;
            this.contextKeyService = contextKeyService;
            this.workspaceContextService = workspaceContextService;
            this.fileService = fileService;
            this.editSessionsCount = EDIT_SESSIONS_COUNT_CONTEXT_KEY.bindTo(this.contextKeyService);
        }
        async getChildren(element) {
            if (!element) {
                return this.getAllEditSessions();
            }
            const [ref, folderName, filePath] = uri_1.URI.parse(element.handle).path.substring(1).split('/');
            if (ref && !folderName) {
                return this.getEditSession(ref);
            }
            else if (ref && folderName && !filePath) {
                return this.getEditSessionFolderContents(ref, folderName);
            }
            return [];
        }
        async getAllEditSessions() {
            const allEditSessions = await this.editSessionsStorageService.list('editSessions');
            this.editSessionsCount.set(allEditSessions.length);
            const editSessions = [];
            for (const session of allEditSessions) {
                const resource = uri_1.URI.from({ scheme: editSessions_1.EDIT_SESSIONS_SCHEME, authority: 'remote-session-content', path: `/${session.ref}` });
                const sessionData = await this.editSessionsStorageService.read('editSessions', session.ref);
                if (!sessionData) {
                    continue;
                }
                const content = JSON.parse(sessionData.content);
                const label = content.folders.map((folder) => folder.name).join(', ') ?? session.ref;
                const machineId = content.machine;
                const machineName = machineId ? await this.editSessionsStorageService.getMachineById(machineId) : undefined;
                const description = machineName === undefined ? (0, date_1.fromNow)(session.created, true) : `${(0, date_1.fromNow)(session.created, true)}\u00a0\u00a0\u2022\u00a0\u00a0${machineName}`;
                editSessions.push({
                    handle: resource.toString(),
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                    label: { label },
                    description: description,
                    themeIcon: codicons_1.Codicon.repo,
                    contextValue: `edit-session`
                });
            }
            return editSessions;
        }
        async getEditSession(ref) {
            const data = await this.editSessionsStorageService.read('editSessions', ref);
            if (!data) {
                return [];
            }
            const content = JSON.parse(data.content);
            if (content.folders.length === 1) {
                const folder = content.folders[0];
                return this.getEditSessionFolderContents(ref, folder.name);
            }
            return content.folders.map((folder) => {
                const resource = uri_1.URI.from({ scheme: editSessions_1.EDIT_SESSIONS_SCHEME, authority: 'remote-session-content', path: `/${data.ref}/${folder.name}` });
                return {
                    handle: resource.toString(),
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                    label: { label: folder.name },
                    themeIcon: codicons_1.Codicon.folder
                };
            });
        }
        async getEditSessionFolderContents(ref, folderName) {
            const data = await this.editSessionsStorageService.read('editSessions', ref);
            if (!data) {
                return [];
            }
            const content = JSON.parse(data.content);
            const currentWorkspaceFolder = this.workspaceContextService.getWorkspace().folders.find((folder) => folder.name === folderName);
            const editSessionFolder = content.folders.find((folder) => folder.name === folderName);
            if (!editSessionFolder) {
                return [];
            }
            return Promise.all(editSessionFolder.workingChanges.map(async (change) => {
                const cloudChangeUri = uri_1.URI.from({ scheme: editSessions_1.EDIT_SESSIONS_SCHEME, authority: 'remote-session-content', path: `/${data.ref}/${folderName}/${change.relativeFilePath}` });
                if (currentWorkspaceFolder?.uri) {
                    // find the corresponding file in the workspace
                    const localCopy = (0, resources_1.joinPath)(currentWorkspaceFolder.uri, change.relativeFilePath);
                    if (change.type === editSessions_1.ChangeType.Addition && await this.fileService.exists(localCopy)) {
                        return {
                            handle: cloudChangeUri.toString(),
                            resourceUri: cloudChangeUri,
                            collapsibleState: views_1.TreeItemCollapsibleState.None,
                            label: { label: change.relativeFilePath },
                            themeIcon: codicons_1.Codicon.file,
                            command: {
                                id: 'vscode.diff',
                                title: (0, nls_1.localize)('compare changes', 'Compare Changes'),
                                arguments: [
                                    localCopy,
                                    cloudChangeUri,
                                    `${(0, path_1.basename)(change.relativeFilePath)} (${(0, nls_1.localize)('local copy', 'Local Copy')} \u2194 ${(0, nls_1.localize)('cloud changes', 'Cloud Changes')})`,
                                    undefined
                                ]
                            }
                        };
                    }
                }
                return {
                    handle: cloudChangeUri.toString(),
                    resourceUri: cloudChangeUri,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    label: { label: change.relativeFilePath },
                    themeIcon: codicons_1.Codicon.file,
                    command: {
                        id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID,
                        title: (0, nls_1.localize)('open file', 'Open File'),
                        arguments: [cloudChangeUri, undefined, undefined]
                    }
                };
            }));
        }
    };
    EditSessionDataViewDataProvider = __decorate([
        __param(0, editSessions_1.IEditSessionsStorageService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, files_1.IFileService)
    ], EditSessionDataViewDataProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNlc3Npb25zVmlld3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2VkaXRTZXNzaW9ucy9icm93c2VyL2VkaXRTZXNzaW9uc1ZpZXdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVCaEcsTUFBTSx1QkFBdUIsR0FBRyxtQkFBbUIsQ0FBQztJQUNwRCxNQUFNLCtCQUErQixHQUFHLElBQUksMEJBQWEsQ0FBUyx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV2RixJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHNCQUFVO1FBQ3BELFlBQ0MsU0FBd0IsRUFDZ0Isb0JBQTJDO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBRmdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFHbkYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRU8sYUFBYSxDQUFDLFNBQXdCO1lBQzdDLE1BQU0sTUFBTSxHQUFHLHlDQUEwQixDQUFDO1lBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsbUJBQVEsRUFBRSxNQUFNLEVBQUUsa0NBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkcsUUFBUSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztZQUN0QyxRQUFRLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1lBRWxHLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVFLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBc0I7b0JBQ2pELEVBQUUsRUFBRSxNQUFNO29CQUNWLElBQUksRUFBRSxrQ0FBbUI7b0JBQ3pCLGNBQWMsRUFBRSxJQUFJLDRCQUFjLENBQUMsdUJBQVksQ0FBQztvQkFDaEQsbUJBQW1CLEVBQUUsSUFBSTtvQkFDekIsV0FBVyxFQUFFLEtBQUs7b0JBQ2xCLFFBQVE7b0JBQ1IsU0FBUyxFQUFFLEtBQUs7b0JBQ2hCLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxzQ0FBdUIsQ0FBQztvQkFDakQsS0FBSyxFQUFFLEdBQUc7b0JBQ1YsYUFBYSxFQUFFLElBQUk7aUJBQ25CLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVmLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hELE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFDaEIsaUJBQWlCLEVBQ2pCLDBEQUEwRCxFQUMxRCxJQUFJLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLHVCQUF1QixDQUFDLGlEQUFpRCxDQUNsSDtnQkFDRCxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RCxLQUFLLEVBQUUsQ0FBQzthQUNSLENBQUMsQ0FBQztZQUVILElBQUEseUJBQWUsRUFBQyxLQUFNLFNBQVEsaUJBQU87Z0JBQ3BDO29CQUNDLEtBQUssQ0FBQzt3QkFDTCxFQUFFLEVBQUUsdUNBQXVDO3dCQUMzQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMENBQTBDLEVBQUUsd0JBQXdCLENBQUM7d0JBQ3JGLElBQUksRUFBRSxrQkFBTyxDQUFDLGVBQWU7d0JBQzdCLElBQUksRUFBRTs0QkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlOzRCQUMxQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLDJCQUFjLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQzs0QkFDbEgsS0FBSyxFQUFFLFFBQVE7eUJBQ2Y7cUJBQ0QsQ0FBQyxDQUFDO2dCQUNKLENBQUM7Z0JBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLE1BQTZCO29CQUNsRSxNQUFNLGFBQWEsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxRSxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFlLENBQUMsQ0FBQztvQkFDckQsTUFBTSxjQUFjLENBQUMsY0FBYyxDQUFDLDZDQUE2QyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDeEcsTUFBTSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFCLENBQUM7YUFDRCxDQUFDLENBQUM7WUFFSCxJQUFBLHlCQUFlLEVBQUMsS0FBTSxTQUFRLGlCQUFPO2dCQUNwQztvQkFDQyxLQUFLLENBQUM7d0JBQ0wsRUFBRSxFQUFFLHNDQUFzQzt3QkFDMUMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHlDQUF5QyxFQUFFLHVCQUF1QixDQUFDO3dCQUNuRixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxXQUFXO3FCQUN6QixDQUFDLENBQUM7Z0JBQ0osQ0FBQztnQkFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsTUFBNkI7b0JBQ2xFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQWUsQ0FBQyxDQUFDO29CQUNyRCxNQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUMsNkNBQTZDLENBQUMsQ0FBQztvQkFDbkYsTUFBTSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFCLENBQUM7YUFDRCxDQUFDLENBQUM7WUFFSCxJQUFBLHlCQUFlLEVBQUMsS0FBTSxTQUFRLGlCQUFPO2dCQUNwQztvQkFDQyxLQUFLLENBQUM7d0JBQ0wsRUFBRSxFQUFFLHVDQUF1Qzt3QkFDM0MsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDBDQUEwQyxFQUFFLHdCQUF3QixDQUFDO3dCQUNyRixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxLQUFLO3dCQUNuQixJQUFJLEVBQUU7NEJBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsZUFBZTs0QkFDMUIsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSwyQkFBYyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUM7NEJBQ2xILEtBQUssRUFBRSxRQUFRO3lCQUNmO3FCQUNELENBQUMsQ0FBQztnQkFDSixDQUFDO2dCQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxNQUE2QjtvQkFDbEUsTUFBTSxhQUFhLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUUsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBYyxDQUFDLENBQUM7b0JBQ25ELE1BQU0seUJBQXlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQ0FBMkIsQ0FBQyxDQUFDO29CQUM1RSxNQUFNLE1BQU0sR0FBRyxNQUFNLGFBQWEsQ0FBQyxPQUFPLENBQUM7d0JBQzFDLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxnRkFBZ0YsRUFBRSxhQUFhLENBQUM7d0JBQ3ZJLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSwrQkFBK0IsQ0FBQzt3QkFDN0UsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsS0FBSyxFQUFFLGtDQUFtQixDQUFDLEtBQUs7cUJBQ2hDLENBQUMsQ0FBQztvQkFDSCxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDdEIsTUFBTSx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO3dCQUN0RSxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDMUIsQ0FBQztnQkFDRixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztnQkFDcEM7b0JBQ0MsS0FBSyxDQUFDO3dCQUNMLEVBQUUsRUFBRSwwQ0FBMEM7d0JBQzlDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQywwQ0FBMEMsRUFBRSx1Q0FBdUMsQ0FBQzt3QkFDcEcsSUFBSSxFQUFFLGtCQUFPLENBQUMsS0FBSzt3QkFDbkIsSUFBSSxFQUFFOzRCQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLFNBQVM7NEJBQ3BCLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQywyQkFBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsMkJBQWMsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLENBQUM7eUJBQ25IO3FCQUNELENBQUMsQ0FBQztnQkFDSixDQUFDO2dCQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7b0JBQ25DLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWMsQ0FBQyxDQUFDO29CQUNuRCxNQUFNLHlCQUF5QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMENBQTJCLENBQUMsQ0FBQztvQkFDNUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsT0FBTyxDQUFDO3dCQUMxQyxPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsZ0ZBQWdGLENBQUM7d0JBQ3pILE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSwrQkFBK0IsQ0FBQzt3QkFDOUUsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsS0FBSyxFQUFFLGtDQUFtQixDQUFDLEtBQUs7cUJBQ2hDLENBQUMsQ0FBQztvQkFDSCxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDdEIsTUFBTSx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUM3RCxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDMUIsQ0FBQztnQkFDRixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUE7SUExSVksc0RBQXFCO29DQUFyQixxQkFBcUI7UUFHL0IsV0FBQSxxQ0FBcUIsQ0FBQTtPQUhYLHFCQUFxQixDQTBJakM7SUFFRCxJQUFNLCtCQUErQixHQUFyQyxNQUFNLCtCQUErQjtRQUlwQyxZQUMrQywwQkFBdUQsRUFDaEUsaUJBQXFDLEVBQy9CLHVCQUFpRCxFQUM3RCxXQUF5QjtZQUhWLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDaEUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUMvQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1lBQzdELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBRXhELElBQUksQ0FBQyxpQkFBaUIsR0FBRywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDekYsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBbUI7WUFDcEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNkLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDbEMsQ0FBQztZQUVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTNGLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxDQUFDO2lCQUFNLElBQUksR0FBRyxJQUFJLFVBQVUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMzQyxPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDM0QsQ0FBQztZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVPLEtBQUssQ0FBQyxrQkFBa0I7WUFDL0IsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25ELE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUV4QixLQUFLLE1BQU0sT0FBTyxJQUFJLGVBQWUsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLFFBQVEsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG1DQUFvQixFQUFFLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxSCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDNUYsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUNsQixTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsTUFBTSxPQUFPLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNyRixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUNsQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM1RyxNQUFNLFdBQVcsR0FBRyxXQUFXLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQU8sRUFBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUEsY0FBTyxFQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGlDQUFpQyxXQUFXLEVBQUUsQ0FBQztnQkFFakssWUFBWSxDQUFDLElBQUksQ0FBQztvQkFDakIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUU7b0JBQzNCLGdCQUFnQixFQUFFLGdDQUF3QixDQUFDLFNBQVM7b0JBQ3BELEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRTtvQkFDaEIsV0FBVyxFQUFFLFdBQVc7b0JBQ3hCLFNBQVMsRUFBRSxrQkFBTyxDQUFDLElBQUk7b0JBQ3ZCLFlBQVksRUFBRSxjQUFjO2lCQUM1QixDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQztRQUVPLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBVztZQUN2QyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRTdFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFDRCxNQUFNLE9BQU8sR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEQsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDbEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBRUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNyQyxNQUFNLFFBQVEsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLG1DQUFvQixFQUFFLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3RJLE9BQU87b0JBQ04sTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUU7b0JBQzNCLGdCQUFnQixFQUFFLGdDQUF3QixDQUFDLFNBQVM7b0JBQ3BELEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO29CQUM3QixTQUFTLEVBQUUsa0JBQU8sQ0FBQyxNQUFNO2lCQUN6QixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sS0FBSyxDQUFDLDRCQUE0QixDQUFDLEdBQVcsRUFBRSxVQUFrQjtZQUN6RSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRTdFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFDRCxNQUFNLE9BQU8sR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEQsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsQ0FBQztZQUNoSSxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1lBRXZGLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN4QixPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFFRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ3hFLE1BQU0sY0FBYyxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsbUNBQW9CLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksVUFBVSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFdEssSUFBSSxzQkFBc0IsRUFBRSxHQUFHLEVBQUUsQ0FBQztvQkFDakMsK0NBQStDO29CQUMvQyxNQUFNLFNBQVMsR0FBRyxJQUFBLG9CQUFRLEVBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNoRixJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUsseUJBQVUsQ0FBQyxRQUFRLElBQUksTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO3dCQUNyRixPQUFPOzRCQUNOLE1BQU0sRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFOzRCQUNqQyxXQUFXLEVBQUUsY0FBYzs0QkFDM0IsZ0JBQWdCLEVBQUUsZ0NBQXdCLENBQUMsSUFBSTs0QkFDL0MsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTs0QkFDekMsU0FBUyxFQUFFLGtCQUFPLENBQUMsSUFBSTs0QkFDdkIsT0FBTyxFQUFFO2dDQUNSLEVBQUUsRUFBRSxhQUFhO2dDQUNqQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUM7Z0NBQ3JELFNBQVMsRUFBRTtvQ0FDVixTQUFTO29DQUNULGNBQWM7b0NBQ2QsR0FBRyxJQUFBLGVBQVEsRUFBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLFdBQVcsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxHQUFHO29DQUNySSxTQUFTO2lDQUNUOzZCQUNEO3lCQUNELENBQUM7b0JBQ0gsQ0FBQztnQkFDRixDQUFDO2dCQUVELE9BQU87b0JBQ04sTUFBTSxFQUFFLGNBQWMsQ0FBQyxRQUFRLEVBQUU7b0JBQ2pDLFdBQVcsRUFBRSxjQUFjO29CQUMzQixnQkFBZ0IsRUFBRSxnQ0FBd0IsQ0FBQyxJQUFJO29CQUMvQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixFQUFFO29CQUN6QyxTQUFTLEVBQUUsa0JBQU8sQ0FBQyxJQUFJO29CQUN2QixPQUFPLEVBQUU7d0JBQ1IsRUFBRSxFQUFFLDJDQUEwQjt3QkFDOUIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7d0JBQ3pDLFNBQVMsRUFBRSxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDO3FCQUNqRDtpQkFDRCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FDRCxDQUFBO0lBM0lLLCtCQUErQjtRQUtsQyxXQUFBLDBDQUEyQixDQUFBO1FBQzNCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSxvQ0FBd0IsQ0FBQTtRQUN4QixXQUFBLG9CQUFZLENBQUE7T0FSVCwrQkFBK0IsQ0EySXBDIn0=
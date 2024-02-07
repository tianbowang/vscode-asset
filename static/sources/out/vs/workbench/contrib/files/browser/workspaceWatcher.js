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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/base/common/map", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/base/common/path", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/host/browser/host"], function (require, exports, nls_1, lifecycle_1, uri_1, configuration_1, files_1, workspace_1, map_1, notification_1, opener_1, path_1, uriIdentity_1, host_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceWatcher = void 0;
    let WorkspaceWatcher = class WorkspaceWatcher extends lifecycle_1.Disposable {
        constructor(fileService, configurationService, contextService, notificationService, openerService, uriIdentityService, hostService) {
            super();
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.uriIdentityService = uriIdentityService;
            this.hostService = hostService;
            this.watchedWorkspaces = new map_1.ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
            this.registerListeners();
            this.refresh();
        }
        registerListeners() {
            this._register(this.contextService.onDidChangeWorkspaceFolders(e => this.onDidChangeWorkspaceFolders(e)));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onDidChangeConfiguration(e)));
            this._register(this.fileService.onDidWatchError(error => this.onDidWatchError(error)));
        }
        onDidChangeWorkspaceFolders(e) {
            // Removed workspace: Unwatch
            for (const removed of e.removed) {
                this.unwatchWorkspace(removed);
            }
            // Added workspace: Watch
            for (const added of e.added) {
                this.watchWorkspace(added);
            }
        }
        onDidChangeWorkbenchState() {
            this.refresh();
        }
        onDidChangeConfiguration(e) {
            if (e.affectsConfiguration('files.watcherExclude') || e.affectsConfiguration('files.watcherInclude')) {
                this.refresh();
            }
        }
        onDidWatchError(error) {
            const msg = error.toString();
            // Detect if we run into ENOSPC issues
            if (msg.indexOf('ENOSPC') >= 0) {
                this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('enospcError', "Unable to watch for file changes. Please follow the instructions link to resolve this issue."), [{
                        label: (0, nls_1.localize)('learnMore', "Instructions"),
                        run: () => this.openerService.open(uri_1.URI.parse('https://go.microsoft.com/fwlink/?linkid=867693'))
                    }], {
                    sticky: true,
                    neverShowAgain: { id: 'ignoreEnospcError', isSecondary: true, scope: notification_1.NeverShowAgainScope.WORKSPACE }
                });
            }
            // Detect when the watcher throws an error unexpectedly
            else if (msg.indexOf('EUNKNOWN') >= 0) {
                this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('eshutdownError', "File changes watcher stopped unexpectedly. A reload of the window may enable the watcher again unless the workspace cannot be watched for file changes."), [{
                        label: (0, nls_1.localize)('reload', "Reload"),
                        run: () => this.hostService.reload()
                    }], {
                    sticky: true,
                    priority: notification_1.NotificationPriority.SILENT // reduce potential spam since we don't really know how often this fires
                });
            }
        }
        watchWorkspace(workspace) {
            // Compute the watcher exclude rules from configuration
            const excludes = [];
            const config = this.configurationService.getValue({ resource: workspace.uri });
            if (config.files?.watcherExclude) {
                for (const key in config.files.watcherExclude) {
                    if (config.files.watcherExclude[key] === true) {
                        excludes.push(key);
                    }
                }
            }
            const pathsToWatch = new map_1.ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
            // Add the workspace as path to watch
            pathsToWatch.set(workspace.uri, workspace.uri);
            // Compute additional includes from configuration
            if (config.files?.watcherInclude) {
                for (const includePath of config.files.watcherInclude) {
                    if (!includePath) {
                        continue;
                    }
                    // Absolute: verify a child of the workspace
                    if ((0, path_1.isAbsolute)(includePath)) {
                        const candidate = uri_1.URI.file(includePath).with({ scheme: workspace.uri.scheme });
                        if (this.uriIdentityService.extUri.isEqualOrParent(candidate, workspace.uri)) {
                            pathsToWatch.set(candidate, candidate);
                        }
                    }
                    // Relative: join against workspace folder
                    else {
                        const candidate = workspace.toResource(includePath);
                        pathsToWatch.set(candidate, candidate);
                    }
                }
            }
            // Watch all paths as instructed
            const disposables = new lifecycle_1.DisposableStore();
            for (const [, pathToWatch] of pathsToWatch) {
                disposables.add(this.fileService.watch(pathToWatch, { recursive: true, excludes }));
            }
            this.watchedWorkspaces.set(workspace.uri, disposables);
        }
        unwatchWorkspace(workspace) {
            if (this.watchedWorkspaces.has(workspace.uri)) {
                (0, lifecycle_1.dispose)(this.watchedWorkspaces.get(workspace.uri));
                this.watchedWorkspaces.delete(workspace.uri);
            }
        }
        refresh() {
            // Unwatch all first
            this.unwatchWorkspaces();
            // Watch each workspace folder
            for (const folder of this.contextService.getWorkspace().folders) {
                this.watchWorkspace(folder);
            }
        }
        unwatchWorkspaces() {
            for (const [, disposable] of this.watchedWorkspaces) {
                disposable.dispose();
            }
            this.watchedWorkspaces.clear();
        }
        dispose() {
            super.dispose();
            this.unwatchWorkspaces();
        }
    };
    exports.WorkspaceWatcher = WorkspaceWatcher;
    exports.WorkspaceWatcher = WorkspaceWatcher = __decorate([
        __param(0, files_1.IFileService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, notification_1.INotificationService),
        __param(4, opener_1.IOpenerService),
        __param(5, uriIdentity_1.IUriIdentityService),
        __param(6, host_1.IHostService)
    ], WorkspaceWatcher);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlV2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci93b3Jrc3BhY2VXYXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWV6RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLHNCQUFVO1FBSS9DLFlBQ2UsV0FBMEMsRUFDakMsb0JBQTRELEVBQ3pELGNBQXlELEVBQzdELG1CQUEwRCxFQUNoRSxhQUE4QyxFQUN6QyxrQkFBd0QsRUFDL0QsV0FBMEM7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFSdUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDaEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUN4QyxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDNUMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUMvQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDeEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUM5QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQVR4QyxzQkFBaUIsR0FBRyxJQUFJLGlCQUFXLENBQWMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFheEksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFekIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxD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
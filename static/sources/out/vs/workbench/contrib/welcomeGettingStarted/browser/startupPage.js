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
define(["require", "exports", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorService", "vs/base/common/errors", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput", "vs/workbench/services/environment/common/environmentService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/product/common/productService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/nls", "vs/workbench/services/editor/common/editorResolverService"], function (require, exports, commands_1, arrays, instantiation_1, editorService_1, errors_1, workspace_1, configuration_1, workingCopyBackup_1, lifecycle_1, files_1, resources_1, layoutService_1, gettingStartedInput_1, environmentService_1, storage_1, telemetryUtils_1, productService_1, log_1, notification_1, nls_1, editorResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StartupPageContribution = exports.restoreWalkthroughsConfigurationKey = void 0;
    exports.restoreWalkthroughsConfigurationKey = 'workbench.welcomePage.restorableWalkthroughs';
    const configurationKey = 'workbench.startupEditor';
    const oldConfigurationKey = 'workbench.welcome.enabled';
    const telemetryOptOutStorageKey = 'workbench.telemetryOptOutShown';
    let StartupPageContribution = class StartupPageContribution {
        constructor(instantiationService, configurationService, editorService, workingCopyBackupService, fileService, contextService, lifecycleService, layoutService, productService, commandService, environmentService, storageService, logService, notificationService, editorResolverService) {
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.fileService = fileService;
            this.contextService = contextService;
            this.lifecycleService = lifecycleService;
            this.layoutService = layoutService;
            this.productService = productService;
            this.commandService = commandService;
            this.environmentService = environmentService;
            this.storageService = storageService;
            this.logService = logService;
            this.notificationService = notificationService;
            editorResolverService.registerEditor(`${gettingStartedInput_1.GettingStartedInput.RESOURCE.scheme}:/**`, {
                id: gettingStartedInput_1.GettingStartedInput.ID,
                label: (0, nls_1.localize)('welcome.displayName', "Welcome Page"),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin,
            }, {
                singlePerResource: false,
                canSupportResource: uri => uri.scheme === gettingStartedInput_1.GettingStartedInput.RESOURCE.scheme,
            }, {
                createEditorInput: ({ resource, options }) => {
                    return {
                        editor: this.instantiationService.createInstance(gettingStartedInput_1.GettingStartedInput, options),
                        options: {
                            ...options,
                            pinned: false
                        }
                    };
                }
            });
            this.run().then(undefined, errors_1.onUnexpectedError);
        }
        async run() {
            // Always open Welcome page for first-launch, no matter what is open or which startupEditor is set.
            if (this.productService.enableTelemetry
                && this.productService.showTelemetryOptOut
                && (0, telemetryUtils_1.getTelemetryLevel)(this.configurationService) !== 0 /* TelemetryLevel.NONE */
                && !this.environmentService.skipWelcome
                && !this.storageService.get(telemetryOptOutStorageKey, 0 /* StorageScope.PROFILE */)) {
                this.storageService.store(telemetryOptOutStorageKey, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                await this.openGettingStarted(true);
                return;
            }
            if (this.tryOpenWalkthroughForFolder()) {
                return;
            }
            const enabled = isStartupPageEnabled(this.configurationService, this.contextService, this.environmentService);
            if (enabled && this.lifecycleService.startupKind !== 3 /* StartupKind.ReloadedWindow */) {
                const hasBackups = await this.workingCopyBackupService.hasBackups();
                if (hasBackups) {
                    return;
                }
                // Open the welcome even if we opened a set of default editors
                if (!this.editorService.activeEditor || this.layoutService.openedDefaultEditors) {
                    const startupEditorSetting = this.configurationService.inspect(configurationKey);
                    const isStartupEditorReadme = startupEditorSetting.value === 'readme';
                    const isStartupEditorUserReadme = startupEditorSetting.userValue === 'readme';
                    const isStartupEditorDefaultReadme = startupEditorSetting.defaultValue === 'readme';
                    // 'readme' should not be set in workspace settings to prevent tracking,
                    // but it can be set as a default (as in codespaces or from configurationDefaults) or a user setting
                    if (isStartupEditorReadme && (!isStartupEditorUserReadme || !isStartupEditorDefaultReadme)) {
                        this.logService.warn(`Warning: 'workbench.startupEditor: readme' setting ignored due to being set somewhere other than user or default settings (user=${startupEditorSetting.userValue}, default=${startupEditorSetting.defaultValue})`);
                    }
                    const openWithReadme = isStartupEditorReadme && (isStartupEditorUserReadme || isStartupEditorDefaultReadme);
                    if (openWithReadme) {
                        await this.openReadme();
                    }
                    else if (startupEditorSetting.value === 'welcomePage' || startupEditorSetting.value === 'welcomePageInEmptyWorkbench') {
                        await this.openGettingStarted();
                    }
                }
            }
        }
        tryOpenWalkthroughForFolder() {
            const toRestore = this.storageService.get(exports.restoreWalkthroughsConfigurationKey, 0 /* StorageScope.PROFILE */);
            if (!toRestore) {
                return false;
            }
            else {
                const restoreData = JSON.parse(toRestore);
                const currentWorkspace = this.contextService.getWorkspace();
                if (restoreData.folder === workspace_1.UNKNOWN_EMPTY_WINDOW_WORKSPACE.id || restoreData.folder === currentWorkspace.folders[0].uri.toString()) {
                    this.editorService.openEditor({
                        resource: gettingStartedInput_1.GettingStartedInput.RESOURCE,
                        options: { selectedCategory: restoreData.category, selectedStep: restoreData.step, pinned: false },
                    });
                    this.storageService.remove(exports.restoreWalkthroughsConfigurationKey, 0 /* StorageScope.PROFILE */);
                    return true;
                }
            }
            return false;
        }
        async openReadme() {
            const readmes = arrays.coalesce(await Promise.all(this.contextService.getWorkspace().folders.map(async (folder) => {
                const folderUri = folder.uri;
                const folderStat = await this.fileService.resolve(folderUri).catch(errors_1.onUnexpectedError);
                const files = folderStat?.children ? folderStat.children.map(child => child.name).sort() : [];
                const file = files.find(file => file.toLowerCase() === 'readme.md') || files.find(file => file.toLowerCase().startsWith('readme'));
                if (file) {
                    return (0, resources_1.joinPath)(folderUri, file);
                }
                else {
                    return undefined;
                }
            })));
            if (!this.editorService.activeEditor) {
                if (readmes.length) {
                    const isMarkDown = (readme) => readme.path.toLowerCase().endsWith('.md');
                    await Promise.all([
                        this.commandService.executeCommand('markdown.showPreview', null, readmes.filter(isMarkDown), { locked: true }).catch(error => {
                            this.notificationService.error((0, nls_1.localize)('startupPage.markdownPreviewError', 'Could not open markdown preview: {0}.\n\nPlease make sure the markdown extension is enabled.', error.message));
                        }),
                        this.editorService.openEditors(readmes.filter(readme => !isMarkDown(readme)).map(readme => ({ resource: readme }))),
                    ]);
                }
                else {
                    // If no readme is found, default to showing the welcome page.
                    await this.openGettingStarted();
                }
            }
        }
        async openGettingStarted(showTelemetryNotice) {
            const startupEditorTypeID = gettingStartedInput_1.gettingStartedInputTypeId;
            const editor = this.editorService.activeEditor;
            // Ensure that the welcome editor won't get opened more than once
            if (editor?.typeId === startupEditorTypeID || this.editorService.editors.some(e => e.typeId === startupEditorTypeID)) {
                return;
            }
            const options = editor ? { pinned: false, index: 0 } : { pinned: false };
            if (startupEditorTypeID === gettingStartedInput_1.gettingStartedInputTypeId) {
                this.editorService.openEditor({
                    resource: gettingStartedInput_1.GettingStartedInput.RESOURCE,
                    options: { showTelemetryNotice, ...options },
                });
            }
        }
    };
    exports.StartupPageContribution = StartupPageContribution;
    exports.StartupPageContribution = StartupPageContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, editorService_1.IEditorService),
        __param(3, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(4, files_1.IFileService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, lifecycle_1.ILifecycleService),
        __param(7, layoutService_1.IWorkbenchLayoutService),
        __param(8, productService_1.IProductService),
        __param(9, commands_1.ICommandService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, storage_1.IStorageService),
        __param(12, log_1.ILogService),
        __param(13, notification_1.INotificationService),
        __param(14, editorResolverService_1.IEditorResolverService)
    ], StartupPageContribution);
    function isStartupPageEnabled(configurationService, contextService, environmentService) {
        if (environmentService.skipWelcome) {
            return false;
        }
        const startupEditor = configurationService.inspect(configurationKey);
        if (!startupEditor.userValue && !startupEditor.workspaceValue) {
            const welcomeEnabled = configurationService.inspect(oldConfigurationKey);
            if (welcomeEnabled.value !== undefined && welcomeEnabled.value !== null) {
                return welcomeEnabled.value;
            }
        }
        return startupEditor.value === 'welcomePage'
            || startupEditor.value === 'readme' && (startupEditor.userValue === 'readme' || startupEditor.defaultValue === 'readme')
            || (contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && startupEditor.value === 'welcomePageInEmptyWorkbench');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cFBhZ2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3dlbGNvbWVHZXR0aW5nU3RhcnRlZC9icm93c2VyL3N0YXJ0dXBQYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTRCbkYsUUFBQSxtQ0FBbUMsR0FBRyw4Q0FBOEMsQ0FBQztJQUdsRyxNQUFNLGdCQUFnQixHQUFHLHlCQUF5QixDQUFDO0lBQ25ELE1BQU0sbUJBQW1CLEdBQUcsMkJBQTJCLENBQUM7SUFDeEQsTUFBTSx5QkFBeUIsR0FBRyxnQ0FBZ0MsQ0FBQztJQUU1RCxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1QjtRQUVuQyxZQUN5QyxvQkFBMkMsRUFDM0Msb0JBQTJDLEVBQ2xELGFBQTZCLEVBQ2xCLHdCQUFtRCxFQUNoRSxXQUF5QixFQUNiLGNBQXdDLEVBQy9DLGdCQUFtQyxFQUM3QixhQUFzQyxFQUM5QyxjQUErQixFQUMvQixjQUErQixFQUNsQixrQkFBZ0QsRUFDN0QsY0FBK0IsRUFDbkMsVUFBdUIsRUFDZCxtQkFBeUMsRUFDeEQscUJBQTZDO1lBZDdCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNsRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDbEIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEyQjtZQUNoRSxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNiLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUMvQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQzdCLGtCQUFhLEdBQWIsYUFBYSxDQUF5QjtZQUM5QyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDL0IsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2xCLHVCQUFrQixH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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/electron-sandbox/extensionsProfileScannerService", "vs/platform/instantiation/common/descriptors", "vs/workbench/electron-sandbox/desktop.main", "vs/workbench/workbench.common.main", "vs/workbench/electron-sandbox/desktop.main", "vs/workbench/electron-sandbox/desktop.contribution", "vs/workbench/electron-sandbox/parts/dialogs/dialog.contribution", "vs/workbench/services/textfile/electron-sandbox/nativeTextFileService", "vs/workbench/services/dialogs/electron-sandbox/fileDialogService", "vs/workbench/services/workspaces/electron-sandbox/workspacesService", "vs/workbench/services/menubar/electron-sandbox/menubarService", "vs/workbench/services/issue/electron-sandbox/issueMainService", "vs/workbench/services/issue/electron-sandbox/issueService", "vs/workbench/services/update/electron-sandbox/updateService", "vs/workbench/services/url/electron-sandbox/urlService", "vs/workbench/services/lifecycle/electron-sandbox/lifecycleService", "vs/workbench/services/title/electron-sandbox/titleService", "vs/workbench/services/host/electron-sandbox/nativeHostService", "vs/workbench/services/request/electron-sandbox/requestService", "vs/workbench/services/clipboard/electron-sandbox/clipboardService", "vs/workbench/services/contextmenu/electron-sandbox/contextmenuService", "vs/workbench/services/workspaces/electron-sandbox/workspaceEditingService", "vs/workbench/services/configurationResolver/electron-sandbox/configurationResolverService", "vs/workbench/services/accessibility/electron-sandbox/accessibilityService", "vs/workbench/services/keybinding/electron-sandbox/nativeKeyboardLayout", "vs/workbench/services/path/electron-sandbox/pathService", "vs/workbench/services/themes/electron-sandbox/nativeHostColorSchemeService", "vs/workbench/services/extensionManagement/electron-sandbox/extensionManagementService", "vs/workbench/services/encryption/electron-sandbox/encryptionService", "vs/workbench/services/secrets/electron-sandbox/secretStorageService", "vs/workbench/services/localization/electron-sandbox/languagePackService", "vs/workbench/services/telemetry/electron-sandbox/telemetryService", "vs/workbench/services/extensions/electron-sandbox/extensionHostStarter", "vs/platform/extensionResourceLoader/common/extensionResourceLoaderService", "vs/workbench/services/localization/electron-sandbox/localeService", "vs/workbench/services/extensions/electron-sandbox/extensionsScannerService", "vs/workbench/services/extensionManagement/electron-sandbox/extensionManagementServerService", "vs/workbench/services/extensionManagement/electron-sandbox/extensionTipsService", "vs/workbench/services/userDataSync/electron-sandbox/userDataSyncService", "vs/workbench/services/userDataSync/electron-sandbox/userDataAutoSyncService", "vs/workbench/services/timer/electron-sandbox/timerService", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService", "vs/workbench/services/integrity/electron-sandbox/integrityService", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupService", "vs/workbench/services/checksum/electron-sandbox/checksumService", "vs/platform/remote/electron-sandbox/sharedProcessTunnelService", "vs/workbench/services/tunnel/electron-sandbox/tunnelService", "vs/platform/diagnostics/electron-sandbox/diagnosticsService", "vs/platform/profiling/electron-sandbox/profilingService", "vs/platform/telemetry/electron-sandbox/customEndpointTelemetryService", "vs/platform/remoteTunnel/electron-sandbox/remoteTunnelService", "vs/workbench/services/files/electron-sandbox/elevatedFileService", "vs/workbench/services/search/electron-sandbox/searchService", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyHistoryService", "vs/workbench/services/userDataSync/browser/userDataSyncEnablementService", "vs/workbench/services/extensions/electron-sandbox/nativeExtensionService", "vs/platform/userDataProfile/electron-sandbox/userDataProfileStorageService", "vs/workbench/services/auxiliaryWindow/electron-sandbox/auxiliaryWindowService", "vs/workbench/contrib/logs/electron-sandbox/logs.contribution", "vs/workbench/contrib/localization/electron-sandbox/localization.contribution", "vs/workbench/contrib/files/electron-sandbox/fileActions.contribution", "vs/workbench/contrib/codeEditor/electron-sandbox/codeEditor.contribution", "vs/workbench/contrib/debug/electron-sandbox/extensionHostDebugService", "vs/workbench/contrib/extensions/electron-sandbox/extensions.contribution", "vs/workbench/contrib/issue/electron-sandbox/issue.contribution", "vs/workbench/contrib/remote/electron-sandbox/remote.contribution", "vs/workbench/contrib/configExporter/electron-sandbox/configurationExportHelper.contribution", "vs/workbench/contrib/terminal/electron-sandbox/terminal.contribution", "vs/workbench/contrib/themes/browser/themes.test.contribution", "vs/workbench/services/themes/electron-sandbox/themes.contribution", "vs/workbench/contrib/userDataSync/electron-sandbox/userDataSync.contribution", "vs/workbench/contrib/tags/electron-sandbox/workspaceTagsService", "vs/workbench/contrib/tags/electron-sandbox/tags.contribution", "vs/workbench/contrib/performance/electron-sandbox/performance.contribution", "vs/workbench/contrib/tasks/electron-sandbox/taskService", "vs/workbench/contrib/externalTerminal/electron-sandbox/externalTerminal.contribution", "vs/workbench/contrib/webview/electron-sandbox/webview.contribution", "vs/workbench/contrib/splash/electron-sandbox/splash.contribution", "vs/workbench/contrib/localHistory/electron-sandbox/localHistory.contribution", "vs/workbench/contrib/mergeEditor/electron-sandbox/mergeEditor.contribution", "vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditor.contribution", "vs/workbench/contrib/remoteTunnel/electron-sandbox/remoteTunnel.contribution", "vs/workbench/contrib/chat/electron-sandbox/chat.contribution", "vs/workbench/contrib/inlineChat/electron-sandbox/inlineChat.contribution"], function (require, exports, extensions_1, userDataInit_1, extensionsProfileScannerService_1, extensionsProfileScannerService_2, descriptors_1, desktop_main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    (0, extensions_1.registerSingleton)(userDataInit_1.IUserDataInitializationService, new descriptors_1.SyncDescriptor(userDataInit_1.UserDataInitializationService, [[]], true));
    (0, extensions_1.registerSingleton)(extensionsProfileScannerService_1.IExtensionsProfileScannerService, extensionsProfileScannerService_2.ExtensionsProfileScannerService, 1 /* InstantiationType.Delayed */);
    Object.defineProperty(exports, "main", { enumerable: true, get: function () { return desktop_main_1.main; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoLmRlc2t0b3AubWFpbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3dvcmtiZW5jaC5kZXNrdG9wLm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkZoRyxJQUFBLDhCQUFpQixFQUFDLDZDQUE4QixFQUFFLElBQUksNEJBQWMsQ0FBQyw0Q0FBNkIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakgsSUFBQSw4QkFBaUIsRUFBQyxrRUFBZ0MsRUFBRSxpRUFBK0Isb0NBQTRCLENBQUM7SUFvRnZHLG9HQUFBLElBQUksT0FBQSJ9
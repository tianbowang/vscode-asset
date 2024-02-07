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
define(["require", "exports", "vs/base/common/event", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/native/common/native", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/extensionManagement/common/extensionTipsService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/editor/common/services/model", "vs/platform/workspace/common/workspace", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/textfile/electron-sandbox/nativeTextFileService", "vs/base/common/arrays", "vs/base/common/network", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/log/common/log", "vs/platform/userData/common/fileUserDataProvider", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupService", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, event_1, workbenchTestServices_1, native_1, buffer_1, lifecycle_1, dialogs_1, environment_1, files_1, editorService_1, textfiles_1, extensionTipsService_1, extensionManagement_1, extensionRecommendations_1, productService_1, storage_1, telemetry_1, model_1, workspace_1, filesConfigurationService_1, lifecycle_2, workingCopyBackup_1, workingCopyService_1, nativeTextFileService_1, arrays_1, network_1, fileService_1, inMemoryFilesystemProvider_1, log_1, fileUserDataProvider_1, workingCopyBackupService_1, uriIdentityService_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestNativeWorkingCopyBackupService = exports.TestNativeTextFileServiceWithEncodingOverrides = exports.TestServiceAccessor = exports.workbenchInstantiationService = exports.TestExtensionTipsService = exports.TestNativeHostService = exports.TestSharedProcessService = void 0;
    class TestSharedProcessService {
        createRawConnection() { throw new Error('Not Implemented'); }
        getChannel(channelName) { return undefined; }
        registerChannel(channelName, channel) { }
        notifyRestored() { }
    }
    exports.TestSharedProcessService = TestSharedProcessService;
    class TestNativeHostService {
        constructor() {
            this.windowId = -1;
            this.onDidOpenMainWindow = event_1.Event.None;
            this.onDidMaximizeWindow = event_1.Event.None;
            this.onDidUnmaximizeWindow = event_1.Event.None;
            this.onDidFocusMainWindow = event_1.Event.None;
            this.onDidBlurMainWindow = event_1.Event.None;
            this.onDidFocusMainOrAuxiliaryWindow = event_1.Event.None;
            this.onDidBlurMainOrAuxiliaryWindow = event_1.Event.None;
            this.onDidResumeOS = event_1.Event.None;
            this.onDidChangeColorScheme = event_1.Event.None;
            this.onDidChangePassword = event_1.Event.None;
            this.onDidTriggerWindowSystemContextMenu = event_1.Event.None;
            this.onDidChangeWindowFullScreen = event_1.Event.None;
            this.onDidChangeDisplay = event_1.Event.None;
            this.windowCount = Promise.resolve(1);
        }
        getWindowCount() { return this.windowCount; }
        async getWindows() { return []; }
        async getActiveWindowId() { return undefined; }
        openWindow(arg1, arg2) {
            throw new Error('Method not implemented.');
        }
        async toggleFullScreen() { }
        async handleTitleDoubleClick() { }
        async isMaximized() { return true; }
        async maximizeWindow() { }
        async unmaximizeWindow() { }
        async minimizeWindow() { }
        async moveWindowTop(options) { }
        getCursorScreenPoint() { throw new Error('Method not implemented.'); }
        async positionWindow(position, options) { }
        async updateWindowControls(options) { }
        async setMinimumSize(width, height) { }
        async saveWindowSplash(value) { }
        async focusWindow(options) { }
        async showMessageBox(options) { throw new Error('Method not implemented.'); }
        async showSaveDialog(options) { throw new Error('Method not implemented.'); }
        async showOpenDialog(options) { throw new Error('Method not implemented.'); }
        async pickFileFolderAndOpen(options) { }
        async pickFileAndOpen(options) { }
        async pickFolderAndOpen(options) { }
        async pickWorkspaceAndOpen(options) { }
        async showItemInFolder(path) { }
        async setRepresentedFilename(path) { }
        async isAdmin() { return false; }
        async writeElevated(source, target) { }
        async isRunningUnderARM64Translation() { return false; }
        async getOSProperties() { return Object.create(null); }
        async getOSStatistics() { return Object.create(null); }
        async getOSVirtualMachineHint() { return 0; }
        async getOSColorScheme() { return { dark: true, highContrast: false }; }
        async hasWSLFeatureInstalled() { return false; }
        async killProcess() { }
        async setDocumentEdited(edited) { }
        async openExternal(url) { return false; }
        async updateTouchBar() { }
        async moveItemToTrash() { }
        async newWindowTab() { }
        async showPreviousWindowTab() { }
        async showNextWindowTab() { }
        async moveWindowTabToNewWindow() { }
        async mergeAllWindowTabs() { }
        async toggleWindowTabsBar() { }
        async installShellCommand() { }
        async uninstallShellCommand() { }
        async notifyReady() { }
        async relaunch(options) { }
        async reload() { }
        async closeWindow() { }
        async quit() { }
        async exit(code) { }
        async openDevTools(options) { }
        async toggleDevTools() { }
        async resolveProxy(url) { return undefined; }
        async loadCertificates() { return []; }
        async findFreePort(startPort, giveUpAfter, timeout, stride) { return -1; }
        async readClipboardText(type) { return ''; }
        async writeClipboardText(text, type) { }
        async readClipboardFindText() { return ''; }
        async writeClipboardFindText(text) { }
        async writeClipboardBuffer(format, buffer, type) { }
        async readClipboardBuffer(format) { return buffer_1.VSBuffer.wrap(Uint8Array.from([])); }
        async hasClipboard(format, type) { return false; }
        async windowsGetStringRegKey(hive, path, name) { return undefined; }
        async profileRenderer() { throw new Error(); }
    }
    exports.TestNativeHostService = TestNativeHostService;
    let TestExtensionTipsService = class TestExtensionTipsService extends extensionTipsService_1.AbstractNativeExtensionTipsService {
        constructor(environmentService, telemetryService, extensionManagementService, storageService, nativeHostService, extensionRecommendationNotificationService, fileService, productService) {
            super(environmentService.userHome, nativeHostService, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService);
        }
    };
    exports.TestExtensionTipsService = TestExtensionTipsService;
    exports.TestExtensionTipsService = TestExtensionTipsService = __decorate([
        __param(0, environment_1.INativeEnvironmentService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, extensionManagement_1.IExtensionManagementService),
        __param(3, storage_1.IStorageService),
        __param(4, native_1.INativeHostService),
        __param(5, extensionRecommendations_1.IExtensionRecommendationNotificationService),
        __param(6, files_1.IFileService),
        __param(7, productService_1.IProductService)
    ], TestExtensionTipsService);
    function workbenchInstantiationService(overrides, disposables = new lifecycle_1.DisposableStore()) {
        const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({
            workingCopyBackupService: () => disposables.add(new TestNativeWorkingCopyBackupService()),
            ...overrides
        }, disposables);
        instantiationService.stub(native_1.INativeHostService, new TestNativeHostService());
        return instantiationService;
    }
    exports.workbenchInstantiationService = workbenchInstantiationService;
    let TestServiceAccessor = class TestServiceAccessor {
        constructor(lifecycleService, textFileService, filesConfigurationService, contextService, modelService, fileService, nativeHostService, fileDialogService, workingCopyBackupService, workingCopyService, editorService) {
            this.lifecycleService = lifecycleService;
            this.textFileService = textFileService;
            this.filesConfigurationService = filesConfigurationService;
            this.contextService = contextService;
            this.modelService = modelService;
            this.fileService = fileService;
            this.nativeHostService = nativeHostService;
            this.fileDialogService = fileDialogService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.workingCopyService = workingCopyService;
            this.editorService = editorService;
        }
    };
    exports.TestServiceAccessor = TestServiceAccessor;
    exports.TestServiceAccessor = TestServiceAccessor = __decorate([
        __param(0, lifecycle_2.ILifecycleService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, filesConfigurationService_1.IFilesConfigurationService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, model_1.IModelService),
        __param(5, files_1.IFileService),
        __param(6, native_1.INativeHostService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(9, workingCopyService_1.IWorkingCopyService),
        __param(10, editorService_1.IEditorService)
    ], TestServiceAccessor);
    class TestNativeTextFileServiceWithEncodingOverrides extends nativeTextFileService_1.NativeTextFileService {
        get encoding() {
            if (!this._testEncoding) {
                this._testEncoding = this._register(this.instantiationService.createInstance(workbenchTestServices_1.TestEncodingOracle));
            }
            return this._testEncoding;
        }
    }
    exports.TestNativeTextFileServiceWithEncodingOverrides = TestNativeTextFileServiceWithEncodingOverrides;
    class TestNativeWorkingCopyBackupService extends workingCopyBackupService_1.NativeWorkingCopyBackupService {
        constructor() {
            const environmentService = workbenchTestServices_1.TestEnvironmentService;
            const logService = new log_1.NullLogService();
            const fileService = new fileService_1.FileService(logService);
            const lifecycleService = new workbenchTestServices_1.TestLifecycleService();
            super(environmentService, fileService, logService, lifecycleService);
            const inMemoryFileSystemProvider = this._register(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            this._register(fileService.registerProvider(network_1.Schemas.inMemory, inMemoryFileSystemProvider));
            const uriIdentityService = this._register(new uriIdentityService_1.UriIdentityService(fileService));
            const userDataProfilesService = this._register(new userDataProfile_1.UserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
            this._register(fileService.registerProvider(network_1.Schemas.vscodeUserData, this._register(new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, inMemoryFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService))));
            this.backupResourceJoiners = [];
            this.discardBackupJoiners = [];
            this.discardedBackups = [];
            this.pendingBackupsArr = [];
            this.discardedAllBackups = false;
            this._register(fileService);
            this._register(lifecycleService);
        }
        testGetFileService() {
            return this.fileService;
        }
        async waitForAllBackups() {
            await Promise.all(this.pendingBackupsArr);
        }
        joinBackupResource() {
            return new Promise(resolve => this.backupResourceJoiners.push(resolve));
        }
        async backup(identifier, content, versionId, meta, token) {
            const p = super.backup(identifier, content, versionId, meta, token);
            const removeFromPendingBackups = (0, arrays_1.insert)(this.pendingBackupsArr, p.then(undefined, undefined));
            try {
                await p;
            }
            finally {
                removeFromPendingBackups();
            }
            while (this.backupResourceJoiners.length) {
                this.backupResourceJoiners.pop()();
            }
        }
        joinDiscardBackup() {
            return new Promise(resolve => this.discardBackupJoiners.push(resolve));
        }
        async discardBackup(identifier) {
            await super.discardBackup(identifier);
            this.discardedBackups.push(identifier);
            while (this.discardBackupJoiners.length) {
                this.discardBackupJoiners.pop()();
            }
        }
        async discardBackups(filter) {
            this.discardedAllBackups = true;
            return super.discardBackups(filter);
        }
        async getBackupContents(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const fileContents = await this.fileService.readFile(backupResource);
            return fileContents.value.toString();
        }
    }
    exports.TestNativeWorkingCopyBackupService = TestNativeWorkingCopyBackupService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoVGVzdFNlcnZpY2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvdGVzdC9lbGVjdHJvbi1zYW5kYm94L3dvcmtiZW5jaFRlc3RTZXJ2aWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnRGhHLE1BQWEsd0JBQXdCO1FBSXBDLG1CQUFtQixLQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEUsVUFBVSxDQUFDLFdBQW1CLElBQVMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzFELGVBQWUsQ0FBQyxXQUFtQixFQUFFLE9BQVksSUFBVSxDQUFDO1FBQzVELGNBQWMsS0FBVyxDQUFDO0tBQzFCO0lBUkQsNERBUUM7SUFFRCxNQUFhLHFCQUFxQjtRQUFsQztZQUdVLGFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUV2Qix3QkFBbUIsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNoRCx3QkFBbUIsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNoRCwwQkFBcUIsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNsRCx5QkFBb0IsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNqRCx3QkFBbUIsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNoRCxvQ0FBK0IsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUM1RCxtQ0FBOEIsR0FBa0IsYUFBSyxDQUFDLElBQUksQ0FBQztZQUMzRCxrQkFBYSxHQUFtQixhQUFLLENBQUMsSUFBSSxDQUFDO1lBQzNDLDJCQUFzQixHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDcEMsd0JBQW1CLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUNqQyx3Q0FBbUMsR0FB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
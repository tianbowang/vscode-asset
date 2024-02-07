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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/workbench/services/extensions/common/extensions", "vs/platform/contextview/browser/contextView", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/label/common/label", "vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/contrib/extensions/common/reportExtensionIssueAction", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/base/common/buffer", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/native/common/native", "vs/platform/profiling/common/profiling", "vs/platform/clipboard/common/clipboardService"], function (require, exports, nls, actions_1, telemetry_1, instantiation_1, extensions_1, themeService_1, extensions_2, contextView_1, notification_1, contextkey_1, storage_1, label_1, extensionsSlowActions_1, environmentService_1, reportExtensionIssueAction_1, abstractRuntimeExtensionsEditor_1, buffer_1, uri_1, files_1, native_1, profiling_1, clipboardService_1) {
    "use strict";
    var StartExtensionHostProfileAction_1, SaveExtensionHostProfileAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SaveExtensionHostProfileAction = exports.StopExtensionHostProfileAction = exports.StartExtensionHostProfileAction = exports.RuntimeExtensionsEditor = exports.ProfileSessionState = exports.CONTEXT_EXTENSION_HOST_PROFILE_RECORDED = exports.CONTEXT_PROFILE_SESSION_STATE = exports.IExtensionHostProfileService = void 0;
    exports.IExtensionHostProfileService = (0, instantiation_1.createDecorator)('extensionHostProfileService');
    exports.CONTEXT_PROFILE_SESSION_STATE = new contextkey_1.RawContextKey('profileSessionState', 'none');
    exports.CONTEXT_EXTENSION_HOST_PROFILE_RECORDED = new contextkey_1.RawContextKey('extensionHostProfileRecorded', false);
    var ProfileSessionState;
    (function (ProfileSessionState) {
        ProfileSessionState[ProfileSessionState["None"] = 0] = "None";
        ProfileSessionState[ProfileSessionState["Starting"] = 1] = "Starting";
        ProfileSessionState[ProfileSessionState["Running"] = 2] = "Running";
        ProfileSessionState[ProfileSessionState["Stopping"] = 3] = "Stopping";
    })(ProfileSessionState || (exports.ProfileSessionState = ProfileSessionState = {}));
    let RuntimeExtensionsEditor = class RuntimeExtensionsEditor extends abstractRuntimeExtensionsEditor_1.AbstractRuntimeExtensionsEditor {
        constructor(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService, _extensionHostProfileService) {
            super(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService);
            this._extensionHostProfileService = _extensionHostProfileService;
            this._profileInfo = this._extensionHostProfileService.lastProfile;
            this._extensionsHostRecorded = exports.CONTEXT_EXTENSION_HOST_PROFILE_RECORDED.bindTo(contextKeyService);
            this._profileSessionState = exports.CONTEXT_PROFILE_SESSION_STATE.bindTo(contextKeyService);
            this._register(this._extensionHostProfileService.onDidChangeLastProfile(() => {
                this._profileInfo = this._extensionHostProfileService.lastProfile;
                this._extensionsHostRecorded.set(!!this._profileInfo);
                this._updateExtensions();
            }));
            this._register(this._extensionHostProfileService.onDidChangeState(() => {
                const state = this._extensionHostProfileService.state;
                this._profileSessionState.set(ProfileSessionState[state].toLowerCase());
            }));
        }
        _getProfileInfo() {
            return this._profileInfo;
        }
        _getUnresponsiveProfile(extensionId) {
            return this._extensionHostProfileService.getUnresponsiveProfile(extensionId);
        }
        _createSlowExtensionAction(element) {
            if (element.unresponsiveProfile) {
                return this._instantiationService.createInstance(extensionsSlowActions_1.SlowExtensionAction, element.description, element.unresponsiveProfile);
            }
            return null;
        }
        _createReportExtensionIssueAction(element) {
            if (element.marketplaceInfo) {
                return this._instantiationService.createInstance(reportExtensionIssueAction_1.ReportExtensionIssueAction, element.description);
            }
            return null;
        }
        _createSaveExtensionHostProfileAction() {
            return this._instantiationService.createInstance(SaveExtensionHostProfileAction, SaveExtensionHostProfileAction.ID, SaveExtensionHostProfileAction.LABEL);
        }
        _createProfileAction() {
            const state = this._extensionHostProfileService.state;
            const profileAction = (state === ProfileSessionState.Running
                ? this._instantiationService.createInstance(StopExtensionHostProfileAction, StopExtensionHostProfileAction.ID, StopExtensionHostProfileAction.LABEL)
                : this._instantiationService.createInstance(StartExtensionHostProfileAction, StartExtensionHostProfileAction.ID, StartExtensionHostProfileAction.LABEL));
            return profileAction;
        }
    };
    exports.RuntimeExtensionsEditor = RuntimeExtensionsEditor;
    exports.RuntimeExtensionsEditor = RuntimeExtensionsEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, extensions_2.IExtensionService),
        __param(5, notification_1.INotificationService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, storage_1.IStorageService),
        __param(9, label_1.ILabelService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, clipboardService_1.IClipboardService),
        __param(12, exports.IExtensionHostProfileService)
    ], RuntimeExtensionsEditor);
    let StartExtensionHostProfileAction = class StartExtensionHostProfileAction extends actions_1.Action {
        static { StartExtensionHostProfileAction_1 = this; }
        static { this.ID = 'workbench.extensions.action.extensionHostProfile'; }
        static { this.LABEL = nls.localize('extensionHostProfileStart', "Start Extension Host Profile"); }
        constructor(id = StartExtensionHostProfileAction_1.ID, label = StartExtensionHostProfileAction_1.LABEL, _extensionHostProfileService) {
            super(id, label);
            this._extensionHostProfileService = _extensionHostProfileService;
        }
        run() {
            this._extensionHostProfileService.startProfiling();
            return Promise.resolve();
        }
    };
    exports.StartExtensionHostProfileAction = StartExtensionHostProfileAction;
    exports.StartExtensionHostProfileAction = StartExtensionHostProfileAction = StartExtensionHostProfileAction_1 = __decorate([
        __param(2, exports.IExtensionHostProfileService)
    ], StartExtensionHostProfileAction);
    let StopExtensionHostProfileAction = class StopExtensionHostProfileAction extends actions_1.Action {
        static { this.ID = 'workbench.extensions.action.stopExtensionHostProfile'; }
        static { this.LABEL = nls.localize('stopExtensionHostProfileStart', "Stop Extension Host Profile"); }
        constructor(id = StartExtensionHostProfileAction.ID, label = StartExtensionHostProfileAction.LABEL, _extensionHostProfileService) {
            super(id, label);
            this._extensionHostProfileService = _extensionHostProfileService;
        }
        run() {
            this._extensionHostProfileService.stopProfiling();
            return Promise.resolve();
        }
    };
    exports.StopExtensionHostProfileAction = StopExtensionHostProfileAction;
    exports.StopExtensionHostProfileAction = StopExtensionHostProfileAction = __decorate([
        __param(2, exports.IExtensionHostProfileService)
    ], StopExtensionHostProfileAction);
    let SaveExtensionHostProfileAction = class SaveExtensionHostProfileAction extends actions_1.Action {
        static { SaveExtensionHostProfileAction_1 = this; }
        static { this.LABEL = nls.localize('saveExtensionHostProfile', "Save Extension Host Profile"); }
        static { this.ID = 'workbench.extensions.action.saveExtensionHostProfile'; }
        constructor(id = SaveExtensionHostProfileAction_1.ID, label = SaveExtensionHostProfileAction_1.LABEL, _nativeHostService, _environmentService, _extensionHostProfileService, _fileService) {
            super(id, label, undefined, false);
            this._nativeHostService = _nativeHostService;
            this._environmentService = _environmentService;
            this._extensionHostProfileService = _extensionHostProfileService;
            this._fileService = _fileService;
            this._extensionHostProfileService.onDidChangeLastProfile(() => {
                this.enabled = (this._extensionHostProfileService.lastProfile !== null);
            });
        }
        run() {
            return Promise.resolve(this._asyncRun());
        }
        async _asyncRun() {
            const picked = await this._nativeHostService.showSaveDialog({
                title: nls.localize('saveprofile.dialogTitle', "Save Extension Host Profile"),
                buttonLabel: nls.localize('saveprofile.saveButton', "Save"),
                defaultPath: `CPU-${new Date().toISOString().replace(/[\-:]/g, '')}.cpuprofile`,
                filters: [{
                        name: 'CPU Profiles',
                        extensions: ['cpuprofile', 'txt']
                    }]
            });
            if (!picked || !picked.filePath || picked.canceled) {
                return;
            }
            const profileInfo = this._extensionHostProfileService.lastProfile;
            let dataToWrite = profileInfo ? profileInfo.data : {};
            let savePath = picked.filePath;
            if (this._environmentService.isBuilt) {
                // when running from a not-development-build we remove
                // absolute filenames because we don't want to reveal anything
                // about users. We also append the `.txt` suffix to make it
                // easier to attach these files to GH issues
                dataToWrite = profiling_1.Utils.rewriteAbsolutePaths(dataToWrite, 'piiRemoved');
                savePath = savePath + '.txt';
            }
            return this._fileService.writeFile(uri_1.URI.file(savePath), buffer_1.VSBuffer.fromString(JSON.stringify(profileInfo ? profileInfo.data : {}, null, '\t')));
        }
    };
    exports.SaveExtensionHostProfileAction = SaveExtensionHostProfileAction;
    exports.SaveExtensionHostProfileAction = SaveExtensionHostProfileAction = SaveExtensionHostProfileAction_1 = __decorate([
        __param(2, native_1.INativeHostService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, exports.IExtensionHostProfileService),
        __param(5, files_1.IFileService)
    ], SaveExtensionHostProfileAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZUV4dGVuc2lvbnNFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvZWxlY3Ryb24tc2FuZGJveC9ydW50aW1lRXh0ZW5zaW9uc0VkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMkJuRixRQUFBLDRCQUE0QixHQUFHLElBQUEsK0JBQWUsRUFBK0IsNkJBQTZCLENBQUMsQ0FBQztJQUM1RyxRQUFBLDZCQUE2QixHQUFHLElBQUksMEJBQWEsQ0FBUyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RixRQUFBLHVDQUF1QyxHQUFHLElBQUksMEJBQWEsQ0FBVSw4QkFBOEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV6SCxJQUFZLG1CQUtYO0lBTEQsV0FBWSxtQkFBbUI7UUFDOUIsNkRBQVEsQ0FBQTtRQUNSLHFFQUFZLENBQUE7UUFDWixtRUFBVyxDQUFBO1FBQ1gscUVBQVksQ0FBQTtJQUNiLENBQUMsRUFMVyxtQkFBbUIsbUNBQW5CLG1CQUFtQixRQUs5QjtJQWtCTSxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLGlFQUErQjtRQU0zRSxZQUNvQixnQkFBbUMsRUFDdkMsWUFBMkIsRUFDdEIsaUJBQXFDLEVBQzVCLDBCQUF1RCxFQUNqRSxnQkFBbUMsRUFDaEMsbUJBQXlDLEVBQzFDLGtCQUF1QyxFQUNyQyxvQkFBMkMsRUFDakQsY0FBK0IsRUFDakMsWUFBMkIsRUFDWixrQkFBZ0QsRUFDM0QsZ0JBQW1DLEVBQ1AsNEJBQTBEO1lBRXpHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsMEJBQTBCLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9C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
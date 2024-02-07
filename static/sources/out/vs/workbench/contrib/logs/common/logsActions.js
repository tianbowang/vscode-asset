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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/platform/log/common/log", "vs/platform/quickinput/common/quickInput", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/output/common/output", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/contrib/logs/common/defaultLogLevels", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/lifecycle"], function (require, exports, nls, actions_1, log_1, quickInput_1, uri_1, files_1, environmentService_1, resources_1, editorService_1, output_1, telemetryUtils_1, defaultLogLevels_1, codicons_1, themables_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenWindowSessionLogFileAction = exports.SetLogLevelAction = void 0;
    let SetLogLevelAction = class SetLogLevelAction extends actions_1.Action {
        static { this.ID = 'workbench.action.setLogLevel'; }
        static { this.TITLE = { value: nls.localize('setLogLevel', "Set Log Level..."), original: 'Set Log Level...' }; }
        constructor(id, label, quickInputService, loggerService, outputService, defaultLogLevelsService) {
            super(id, label);
            this.quickInputService = quickInputService;
            this.loggerService = loggerService;
            this.outputService = outputService;
            this.defaultLogLevelsService = defaultLogLevelsService;
        }
        async run() {
            const logLevelOrChannel = await this.selectLogLevelOrChannel();
            if (logLevelOrChannel !== null) {
                if ((0, log_1.isLogLevel)(logLevelOrChannel)) {
                    this.loggerService.setLogLevel(logLevelOrChannel);
                }
                else {
                    await this.setLogLevelForChannel(logLevelOrChannel);
                }
            }
        }
        async selectLogLevelOrChannel() {
            const defaultLogLevels = await this.defaultLogLevelsService.getDefaultLogLevels();
            const extensionLogs = [], logs = [];
            const logLevel = this.loggerService.getLogLevel();
            for (const channel of this.outputService.getChannelDescriptors()) {
                if (!channel.log || !channel.file || channel.id === telemetryUtils_1.telemetryLogId || channel.id === telemetryUtils_1.extensionTelemetryLogChannelId) {
                    continue;
                }
                const channelLogLevel = this.loggerService.getLogLevel(channel.file) ?? logLevel;
                const item = { id: channel.id, resource: channel.file, label: channel.label, description: channelLogLevel !== logLevel ? this.getLabel(channelLogLevel) : undefined, extensionId: channel.extensionId };
                if (channel.extensionId) {
                    extensionLogs.push(item);
                }
                else {
                    logs.push(item);
                }
            }
            const entries = [];
            entries.push({ type: 'separator', label: nls.localize('all', "All") });
            entries.push(...this.getLogLevelEntries(defaultLogLevels.default, this.loggerService.getLogLevel(), true));
            if (extensionLogs.length) {
                entries.push({ type: 'separator', label: nls.localize('extensionLogs', "Extension Logs") });
                entries.push(...extensionLogs.sort((a, b) => a.label.localeCompare(b.label)));
            }
            entries.push({ type: 'separator', label: nls.localize('loggers', "Logs") });
            entries.push(...logs.sort((a, b) => a.label.localeCompare(b.label)));
            return new Promise((resolve, reject) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                quickPick.placeholder = nls.localize('selectlog', "Set Log Level");
                quickPick.items = entries;
                let selectedItem;
                disposables.add(quickPick.onDidTriggerItemButton(e => {
                    quickPick.hide();
                    this.defaultLogLevelsService.setDefaultLogLevel(e.item.level);
                }));
                disposables.add(quickPick.onDidAccept(e => {
                    selectedItem = quickPick.selectedItems[0];
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    const result = selectedItem ? selectedItem.level ?? selectedItem : null;
                    disposables.dispose();
                    resolve(result);
                }));
                quickPick.show();
            });
        }
        async setLogLevelForChannel(logChannel) {
            const defaultLogLevels = await this.defaultLogLevelsService.getDefaultLogLevels();
            const defaultLogLevel = defaultLogLevels.extensions.find(e => e[0] === logChannel.extensionId?.toLowerCase())?.[1] ?? defaultLogLevels.default;
            const currentLogLevel = this.loggerService.getLogLevel(logChannel.resource) ?? defaultLogLevel;
            const entries = this.getLogLevelEntries(defaultLogLevel, currentLogLevel, !!logChannel.extensionId);
            return new Promise((resolve, reject) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                quickPick.placeholder = logChannel ? nls.localize('selectLogLevelFor', " {0}: Select log level", logChannel?.label) : nls.localize('selectLogLevel', "Select log level");
                quickPick.items = entries;
                quickPick.activeItems = entries.filter((entry) => entry.level === this.loggerService.getLogLevel());
                let selectedItem;
                disposables.add(quickPick.onDidTriggerItemButton(e => {
                    quickPick.hide();
                    this.defaultLogLevelsService.setDefaultLogLevel(e.item.level, logChannel.extensionId);
                }));
                disposables.add(quickPick.onDidAccept(e => {
                    selectedItem = quickPick.selectedItems[0];
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    if (selectedItem) {
                        this.loggerService.setLogLevel(logChannel.resource, selectedItem.level);
                    }
                    disposables.dispose();
                    resolve();
                }));
                quickPick.show();
            });
        }
        getLogLevelEntries(defaultLogLevel, currentLogLevel, canSetDefaultLogLevel) {
            const button = canSetDefaultLogLevel ? { iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.checkAll), tooltip: nls.localize('resetLogLevel', "Set as Default Log Level") } : undefined;
            return [
                { label: this.getLabel(log_1.LogLevel.Trace, currentLogLevel), level: log_1.LogLevel.Trace, description: this.getDescription(log_1.LogLevel.Trace, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Trace ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Debug, currentLogLevel), level: log_1.LogLevel.Debug, description: this.getDescription(log_1.LogLevel.Debug, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Debug ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Info, currentLogLevel), level: log_1.LogLevel.Info, description: this.getDescription(log_1.LogLevel.Info, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Info ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Warning, currentLogLevel), level: log_1.LogLevel.Warning, description: this.getDescription(log_1.LogLevel.Warning, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Warning ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Error, currentLogLevel), level: log_1.LogLevel.Error, description: this.getDescription(log_1.LogLevel.Error, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Error ? [button] : undefined },
                { label: this.getLabel(log_1.LogLevel.Off, currentLogLevel), level: log_1.LogLevel.Off, description: this.getDescription(log_1.LogLevel.Off, defaultLogLevel), buttons: button && defaultLogLevel !== log_1.LogLevel.Off ? [button] : undefined },
            ];
        }
        getLabel(level, current) {
            let label;
            switch (level) {
                case log_1.LogLevel.Trace:
                    label = nls.localize('trace', "Trace");
                    break;
                case log_1.LogLevel.Debug:
                    label = nls.localize('debug', "Debug");
                    break;
                case log_1.LogLevel.Info:
                    label = nls.localize('info', "Info");
                    break;
                case log_1.LogLevel.Warning:
                    label = nls.localize('warn', "Warning");
                    break;
                case log_1.LogLevel.Error:
                    label = nls.localize('err', "Error");
                    break;
                case log_1.LogLevel.Off:
                    label = nls.localize('off', "Off");
                    break;
            }
            return level === current ? `$(check) ${label}` : label;
        }
        getDescription(level, defaultLogLevel) {
            return defaultLogLevel === level ? nls.localize('default', "Default") : undefined;
        }
    };
    exports.SetLogLevelAction = SetLogLevelAction;
    exports.SetLogLevelAction = SetLogLevelAction = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, log_1.ILoggerService),
        __param(4, output_1.IOutputService),
        __param(5, defaultLogLevels_1.IDefaultLogLevelsService)
    ], SetLogLevelAction);
    let OpenWindowSessionLogFileAction = class OpenWindowSessionLogFileAction extends actions_1.Action {
        static { this.ID = 'workbench.action.openSessionLogFile'; }
        static { this.TITLE = { value: nls.localize('openSessionLogFile', "Open Window Log File (Session)..."), original: 'Open Window Log File (Session)...' }; }
        constructor(id, label, environmentService, fileService, quickInputService, editorService) {
            super(id, label);
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.quickInputService = quickInputService;
            this.editorService = editorService;
        }
        async run() {
            const sessionResult = await this.quickInputService.pick(this.getSessions().then(sessions => sessions.map((s, index) => ({
                id: s.toString(),
                label: (0, resources_1.basename)(s),
                description: index === 0 ? nls.localize('current', "Current") : undefined
            }))), {
                canPickMany: false,
                placeHolder: nls.localize('sessions placeholder', "Select Session")
            });
            if (sessionResult) {
                const logFileResult = await this.quickInputService.pick(this.getLogFiles(uri_1.URI.parse(sessionResult.id)).then(logFiles => logFiles.map(s => ({
                    id: s.toString(),
                    label: (0, resources_1.basename)(s)
                }))), {
                    canPickMany: false,
                    placeHolder: nls.localize('log placeholder', "Select Log file")
                });
                if (logFileResult) {
                    return this.editorService.openEditor({ resource: uri_1.URI.parse(logFileResult.id), options: { pinned: true } }).then(() => undefined);
                }
            }
        }
        async getSessions() {
            const logsPath = this.environmentService.logsHome.with({ scheme: this.environmentService.logFile.scheme });
            const result = [logsPath];
            const stat = await this.fileService.resolve((0, resources_1.dirname)(logsPath));
            if (stat.children) {
                result.push(...stat.children
                    .filter(stat => !(0, resources_1.isEqual)(stat.resource, logsPath) && stat.isDirectory && /^\d{8}T\d{6}$/.test(stat.name))
                    .sort()
                    .reverse()
                    .map(d => d.resource));
            }
            return result;
        }
        async getLogFiles(session) {
            const stat = await this.fileService.resolve(session);
            if (stat.children) {
                return stat.children.filter(stat => !stat.isDirectory).map(stat => stat.resource);
            }
            return [];
        }
    };
    exports.OpenWindowSessionLogFileAction = OpenWindowSessionLogFileAction;
    exports.OpenWindowSessionLogFileAction = OpenWindowSessionLogFileAction = __decorate([
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, editorService_1.IEditorService)
    ], OpenWindowSessionLogFileAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nc0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2xvZ3MvY29tbW9uL2xvZ3NBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFCekYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxnQkFBTTtpQkFFNUIsT0FBRSxHQUFHLDhCQUE4QixBQUFqQyxDQUFrQztpQkFDcEMsVUFBSyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLEFBQTNGLENBQTRGO1FBRWpILFlBQVksRUFBVSxFQUFFLEtBQWEsRUFDQyxpQkFBcUMsRUFDekMsYUFBNkIsRUFDN0IsYUFBNkIsRUFDbkIsdUJBQWlEO1lBRTVGLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFMb0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN6QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDN0Isa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ25CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7UUFHN0YsQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHO1lBQ2pCLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUMvRCxJQUFJLGlCQUFpQixLQUFLLElBQUksRUFBRSxDQUFDO2dCQUNoQyxJQUFJLElBQUEsZ0JBQVUsRUFBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7b0JBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ25ELENBQUM7cUJBQU0sQ0FBQztvQkFDUCxNQUFN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
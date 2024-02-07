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
define(["require", "exports", "electron", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/update/electron-main/abstractUpdateService"], function (require, exports, electron, decorators_1, event_1, hash_1, lifecycle_1, configuration_1, environmentMainService_1, lifecycleMainService_1, log_1, productService_1, request_1, telemetry_1, update_1, abstractUpdateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DarwinUpdateService = void 0;
    let DarwinUpdateService = class DarwinUpdateService extends abstractUpdateService_1.AbstractUpdateService {
        get onRawError() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'error', (_, message) => message); }
        get onRawUpdateNotAvailable() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'update-not-available'); }
        get onRawUpdateAvailable() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'update-available', (_, url, version) => ({ url, version, productVersion: version })); }
        get onRawUpdateDownloaded() { return event_1.Event.fromNodeEventEmitter(electron.autoUpdater, 'update-downloaded', (_, releaseNotes, version, date) => ({ releaseNotes, version, productVersion: version, date })); }
        constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, productService) {
            super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
            this.telemetryService = telemetryService;
            this.disposables = new lifecycle_1.DisposableStore();
            lifecycleMainService.setRelaunchHandler(this);
        }
        handleRelaunch(options) {
            if (options?.addArgs || options?.removeArgs) {
                return false; // we cannot apply an update and restart with different args
            }
            if (this.state.type !== "ready" /* StateType.Ready */) {
                return false; // we only handle the relaunch when we have a pending update
            }
            this.logService.trace('update#handleRelaunch(): running raw#quitAndInstall()');
            this.doQuitAndInstall();
            return true;
        }
        async initialize() {
            await super.initialize();
            this.onRawError(this.onError, this, this.disposables);
            this.onRawUpdateAvailable(this.onUpdateAvailable, this, this.disposables);
            this.onRawUpdateDownloaded(this.onUpdateDownloaded, this, this.disposables);
            this.onRawUpdateNotAvailable(this.onUpdateNotAvailable, this, this.disposables);
        }
        onError(err) {
            this.telemetryService.publicLog2('update:error', { messageHash: String((0, hash_1.hash)(String(err))) });
            this.logService.error('UpdateService error:', err);
            // only show message when explicitly checking for updates
            const message = (this.state.type === "checking for updates" /* StateType.CheckingForUpdates */ && this.state.explicit) ? err : undefined;
            this.setState(update_1.State.Idle(1 /* UpdateType.Archive */, message));
        }
        buildUpdateFeedUrl(quality) {
            let assetID;
            if (!this.productService.darwinUniversalAssetId) {
                assetID = process.arch === 'x64' ? 'darwin' : 'darwin-arm64';
            }
            else {
                assetID = this.productService.darwinUniversalAssetId;
            }
            const url = (0, abstractUpdateService_1.createUpdateURL)(assetID, quality, this.productService);
            try {
                electron.autoUpdater.setFeedURL({ url });
            }
            catch (e) {
                // application is very likely not signed
                this.logService.error('Failed to set update feed URL', e);
                return undefined;
            }
            return url;
        }
        doCheckForUpdates(context) {
            this.setState(update_1.State.CheckingForUpdates(context));
            electron.autoUpdater.checkForUpdates();
        }
        onUpdateAvailable(update) {
            if (this.state.type !== "checking for updates" /* StateType.CheckingForUpdates */) {
                return;
            }
            this.setState(update_1.State.Downloading(update));
        }
        onUpdateDownloaded(update) {
            if (this.state.type !== "downloading" /* StateType.Downloading */) {
                return;
            }
            this.telemetryService.publicLog2('update:downloaded', { version: update.version });
            this.setState(update_1.State.Ready(update));
        }
        onUpdateNotAvailable() {
            if (this.state.type !== "checking for updates" /* StateType.CheckingForUpdates */) {
                return;
            }
            this.telemetryService.publicLog2('update:notAvailable', { explicit: this.state.explicit });
            this.setState(update_1.State.Idle(1 /* UpdateType.Archive */));
        }
        doQuitAndInstall() {
            this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            electron.autoUpdater.quitAndInstall();
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.DarwinUpdateService = DarwinUpdateService;
    __decorate([
        decorators_1.memoize
    ], DarwinUpdateService.prototype, "onRawError", null);
    __decorate([
        decorators_1.memoize
    ], DarwinUpdateService.prototype, "onRawUpdateNotAvailable", null);
    __decorate([
        decorators_1.memoize
    ], DarwinUpdateService.prototype, "onRawUpdateAvailable", null);
    __decorate([
        decorators_1.memoize
    ], DarwinUpdateService.prototype, "onRawUpdateDownloaded", null);
    exports.DarwinUpdateService = DarwinUpdateService = __decorate([
        __param(0, lifecycleMainService_1.ILifecycleMainService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, request_1.IRequestService),
        __param(5, log_1.ILogService),
        __param(6, productService_1.IProductService)
    ], DarwinUpdateService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlU2VydmljZS5kYXJ3aW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VwZGF0ZS9lbGVjdHJvbi1tYWluL3VwZGF0ZVNlcnZpY2UuZGFyd2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSw2Q0FBcUI7UUFJcEQsSUFBWSxVQUFVLEtBQW9CLE9BQU8sYUFBSyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RJLElBQVksdUJBQXVCLEtBQWtCLE9BQU8sYUFBSyxDQUFDLG9CQUFvQixDQUFPLFFBQVEsQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0ksSUFBWSxvQkFBb0IsS0FBcUIsT0FBTyxhQUFLLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyTSxJQUFZLHFCQUFxQixLQUFxQixPQUFPLGFBQUssQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFF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
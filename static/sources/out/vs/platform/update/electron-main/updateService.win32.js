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
define(["require", "exports", "child_process", "fs", "os", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/hash", "vs/base/common/path", "vs/base/common/uri", "vs/base/node/crypto", "vs/base/node/pfs", "vs/platform/configuration/common/configuration", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/files/common/files", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/update/electron-main/abstractUpdateService"], function (require, exports, child_process_1, fs, os_1, async_1, cancellation_1, decorators_1, hash_1, path, uri_1, crypto_1, pfs, configuration_1, environmentMainService_1, files_1, lifecycleMainService_1, log_1, nativeHostMainService_1, productService_1, request_1, telemetry_1, update_1, abstractUpdateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Win32UpdateService = void 0;
    async function pollUntil(fn, millis = 1000) {
        while (!fn()) {
            await (0, async_1.timeout)(millis);
        }
    }
    let _updateType = undefined;
    function getUpdateType() {
        if (typeof _updateType === 'undefined') {
            _updateType = fs.existsSync(path.join(path.dirname(process.execPath), 'unins000.exe'))
                ? 0 /* UpdateType.Setup */
                : 1 /* UpdateType.Archive */;
        }
        return _updateType;
    }
    let Win32UpdateService = class Win32UpdateService extends abstractUpdateService_1.AbstractUpdateService {
        get cachePath() {
            const result = path.join((0, os_1.tmpdir)(), `vscode-${this.productService.quality}-${this.productService.target}-${process.arch}`);
            return pfs.Promises.mkdir(result, { recursive: true }).then(() => result);
        }
        constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, fileService, nativeHostMainService, productService) {
            super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
            this.telemetryService = telemetryService;
            this.fileService = fileService;
            this.nativeHostMainService = nativeHostMainService;
            lifecycleMainService.setRelaunchHandler(this);
        }
        handleRelaunch(options) {
            if (options?.addArgs || options?.removeArgs) {
                return false; // we cannot apply an update and restart with different args
            }
            if (this.state.type !== "ready" /* StateType.Ready */ || !this.availableUpdate) {
                return false; // we only handle the relaunch when we have a pending update
            }
            this.logService.trace('update#handleRelaunch(): running raw#quitAndInstall()');
            this.doQuitAndInstall();
            return true;
        }
        async initialize() {
            if (this.productService.target === 'user' && await this.nativeHostMainService.isAdmin(undefined)) {
                this.setState(update_1.State.Disabled(5 /* DisablementReason.RunningAsAdmin */));
                this.logService.info('update#ctor - updates are disabled due to running as Admin in user setup');
                return;
            }
            await super.initialize();
        }
        buildUpdateFeedUrl(quality) {
            let platform = `win32-${process.arch}`;
            if (getUpdateType() === 1 /* UpdateType.Archive */) {
                platform += '-archive';
            }
            else if (this.productService.target === 'user') {
                platform += '-user';
            }
            return (0, abstractUpdateService_1.createUpdateURL)(platform, quality, this.productService);
        }
        doCheckForUpdates(context) {
            if (!this.url) {
                return;
            }
            this.setState(update_1.State.CheckingForUpdates(context));
            this.requestService.request({ url: this.url }, cancellation_1.CancellationToken.None)
                .then(request_1.asJson)
                .then(update => {
                const updateType = getUpdateType();
                if (!update || !update.url || !update.version || !update.productVersion) {
                    this.telemetryService.publicLog2('update:notAvailable', { explicit: !!context });
                    this.setState(update_1.State.Idle(updateType));
                    return Promise.resolve(null);
                }
                if (updateType === 1 /* UpdateType.Archive */) {
                    this.setState(update_1.State.AvailableForDownload(update));
                    return Promise.resolve(null);
                }
                this.setState(update_1.State.Downloading(update));
                return this.cleanup(update.version).then(() => {
                    return this.getUpdatePackagePath(update.version).then(updatePackagePath => {
                        return pfs.Promises.exists(updatePackagePath).then(exists => {
                            if (exists) {
                                return Promise.resolve(updatePackagePath);
                            }
                            const downloadPath = `${updatePackagePath}.tmp`;
                            return this.requestService.request({ url: update.url }, cancellation_1.CancellationToken.None)
                                .then(context => this.fileService.writeFile(uri_1.URI.file(downloadPath), context.stream))
                                .then(update.sha256hash ? () => (0, crypto_1.checksum)(downloadPath, update.sha256hash) : () => undefined)
                                .then(() => pfs.Promises.rename(downloadPath, updatePackagePath, false /* no retry */))
                                .then(() => updatePackagePath);
                        });
                    }).then(packagePath => {
                        const fastUpdatesEnabled = this.configurationService.getValue('update.enableWindowsBackgroundUpdates');
                        this.availableUpdate = { packagePath };
                        if (fastUpdatesEnabled) {
                            if (this.productService.target === 'user') {
                                this.doApplyUpdate();
                            }
                            else {
                                this.setState(update_1.State.Downloaded(update));
                            }
                        }
                        else {
                            this.setState(update_1.State.Ready(update));
                        }
                    });
                });
            })
                .then(undefined, err => {
                this.telemetryService.publicLog2('update:error', { messageHash: String((0, hash_1.hash)(String(err))) });
                this.logService.error(err);
                // only show message when explicitly checking for updates
                const message = !!context ? (err.message || err) : undefined;
                this.setState(update_1.State.Idle(getUpdateType(), message));
            });
        }
        async doDownloadUpdate(state) {
            if (state.update.url) {
                this.nativeHostMainService.openExternal(undefined, state.update.url);
            }
            this.setState(update_1.State.Idle(getUpdateType()));
        }
        async getUpdatePackagePath(version) {
            const cachePath = await this.cachePath;
            return path.join(cachePath, `CodeSetup-${this.productService.quality}-${version}.exe`);
        }
        async cleanup(exceptVersion = null) {
            const filter = exceptVersion ? (one) => !(new RegExp(`${this.productService.quality}-${exceptVersion}\\.exe$`).test(one)) : () => true;
            const cachePath = await this.cachePath;
            const versions = await pfs.Promises.readdir(cachePath);
            const promises = versions.filter(filter).map(async (one) => {
                try {
                    await pfs.Promises.unlink(path.join(cachePath, one));
                }
                catch (err) {
                    // ignore
                }
            });
            await Promise.all(promises);
        }
        async doApplyUpdate() {
            if (this.state.type !== "downloaded" /* StateType.Downloaded */ && this.state.type !== "downloading" /* StateType.Downloading */) {
                return Promise.resolve(undefined);
            }
            if (!this.availableUpdate) {
                return Promise.resolve(undefined);
            }
            const update = this.state.update;
            this.setState(update_1.State.Updating(update));
            const cachePath = await this.cachePath;
            this.availableUpdate.updateFilePath = path.join(cachePath, `CodeSetup-${this.productService.quality}-${update.version}.flag`);
            await pfs.Promises.writeFile(this.availableUpdate.updateFilePath, 'flag');
            const child = (0, child_process_1.spawn)(this.availableUpdate.packagePath, ['/verysilent', '/log', `/update="${this.availableUpdate.updateFilePath}"`, '/nocloseapplications', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
                detached: true,
                stdio: ['ignore', 'ignore', 'ignore'],
                windowsVerbatimArguments: true
            });
            child.once('exit', () => {
                this.availableUpdate = undefined;
                this.setState(update_1.State.Idle(getUpdateType()));
            });
            const readyMutexName = `${this.productService.win32MutexName}-ready`;
            const mutex = await new Promise((resolve_1, reject_1) => { require(['@vscode/windows-mutex'], resolve_1, reject_1); });
            // poll for mutex-ready
            pollUntil(() => mutex.isActive(readyMutexName))
                .then(() => this.setState(update_1.State.Ready(update)));
        }
        doQuitAndInstall() {
            if (this.state.type !== "ready" /* StateType.Ready */ || !this.availableUpdate) {
                return;
            }
            this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            if (this.availableUpdate.updateFilePath) {
                fs.unlinkSync(this.availableUpdate.updateFilePath);
            }
            else {
                (0, child_process_1.spawn)(this.availableUpdate.packagePath, ['/silent', '/log', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
                    detached: true,
                    stdio: ['ignore', 'ignore', 'ignore']
                });
            }
        }
        getUpdateType() {
            return getUpdateType();
        }
        async _applySpecificUpdate(packagePath) {
            if (this.state.type !== "idle" /* StateType.Idle */) {
                return;
            }
            const fastUpdatesEnabled = this.configurationService.getValue('update.enableWindowsBackgroundUpdates');
            const update = { version: 'unknown', productVersion: 'unknown' };
            this.setState(update_1.State.Downloading(update));
            this.availableUpdate = { packagePath };
            if (fastUpdatesEnabled) {
                if (this.productService.target === 'user') {
                    this.doApplyUpdate();
                }
                else {
                    this.setState(update_1.State.Downloaded(update));
                }
            }
            else {
                this.setState(update_1.State.Ready(update));
            }
        }
    };
    exports.Win32UpdateService = Win32UpdateService;
    __decorate([
        decorators_1.memoize
    ], Win32UpdateService.prototype, "cachePath", null);
    exports.Win32UpdateService = Win32UpdateService = __decorate([
        __param(0, lifecycleMainService_1.ILifecycleMainService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, request_1.IRequestService),
        __param(5, log_1.ILogService),
        __param(6, files_1.IFileService),
        __param(7, nativeHostMainService_1.INativeHostMainService),
        __param(8, productService_1.IProductService)
    ], Win32UpdateService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlU2VydmljZS53aW4zMi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXBkYXRlL2VsZWN0cm9uLW1haW4vdXBkYXRlU2VydmljZS53aW4zMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5QmhHLEtBQUssVUFBVSxTQUFTLENBQUMsRUFBaUIsRUFBRSxNQUFNLEdBQUcsSUFBSTtRQUN4RCxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNkLE1BQU0sSUFBQSxlQUFPLEVBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkIsQ0FBQztJQUNGLENBQUM7SUFPRCxJQUFJLFdBQVcsR0FBMkIsU0FBUyxDQUFDO0lBQ3BELFNBQVMsYUFBYTtRQUNyQixJQUFJLE9BQU8sV0FBVyxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ3hDLFdBQVcsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ3JGLENBQUM7Z0JBQ0QsQ0FBQywyQkFBbUIsQ0FBQztRQUN2QixDQUFDO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQUVNLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsNkNBQXFCO1FBSzVELElBQUksU0FBUztZQUNaLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBQSxXQUFNLEdBQUUsRUFBRSxVQUFVLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzFILE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FB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
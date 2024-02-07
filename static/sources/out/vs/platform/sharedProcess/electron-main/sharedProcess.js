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
define(["require", "exports", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/policy/common/policy", "vs/platform/log/electron-main/loggerService", "vs/platform/utilityProcess/electron-main/utilityProcess", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/environment/node/environmentService", "vs/base/common/types", "vs/platform/sharedProcess/common/sharedProcess"], function (require, exports, ipcMain_1, async_1, lifecycle_1, environmentMainService_1, lifecycleMainService_1, log_1, userDataProfile_1, policy_1, loggerService_1, utilityProcess_1, telemetryUtils_1, environmentService_1, types_1, sharedProcess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedProcess = void 0;
    let SharedProcess = class SharedProcess extends lifecycle_1.Disposable {
        constructor(machineId, sqmId, environmentMainService, userDataProfilesService, lifecycleMainService, logService, loggerMainService, policyService) {
            super();
            this.machineId = machineId;
            this.sqmId = sqmId;
            this.environmentMainService = environmentMainService;
            this.userDataProfilesService = userDataProfilesService;
            this.lifecycleMainService = lifecycleMainService;
            this.logService = logService;
            this.loggerMainService = loggerMainService;
            this.policyService = policyService;
            this.firstWindowConnectionBarrier = new async_1.Barrier();
            this.utilityProcess = undefined;
            this._whenReady = undefined;
            this._whenIpcReady = undefined;
            this.registerListeners();
        }
        registerListeners() {
            // Shared process channel connections from workbench windows
            ipcMain_1.validatedIpcMain.on(sharedProcess_1.SharedProcessChannelConnection.request, (e, nonce) => this.onWindowConnection(e, nonce, sharedProcess_1.SharedProcessChannelConnection.response));
            // Shared process raw connections from workbench windows
            ipcMain_1.validatedIpcMain.on(sharedProcess_1.SharedProcessRawConnection.request, (e, nonce) => this.onWindowConnection(e, nonce, sharedProcess_1.SharedProcessRawConnection.response));
            // Lifecycle
            this._register(this.lifecycleMainService.onWillShutdown(() => this.onWillShutdown()));
        }
        async onWindowConnection(e, nonce, responseChannel) {
            this.logService.trace(`[SharedProcess] onWindowConnection for: ${responseChannel}`);
            // release barrier if this is the first window connection
            if (!this.firstWindowConnectionBarrier.isOpen()) {
                this.firstWindowConnectionBarrier.open();
            }
            // await the shared process to be overall ready
            // we do not just wait for IPC ready because the
            // workbench window will communicate directly
            await this.whenReady();
            // connect to the shared process passing the responseChannel
            // as payload to give a hint what the connection is about
            const port = await this.connect(responseChannel);
            // Check back if the requesting window meanwhile closed
            // Since shared process is delayed on startup there is
            // a chance that the window close before the shared process
            // was ready for a connection.
            if (e.sender.isDestroyed()) {
                return port.close();
            }
            // send the port back to the requesting window
            e.sender.postMessage(responseChannel, nonce, [port]);
        }
        onWillShutdown() {
            this.logService.trace('[SharedProcess] onWillShutdown');
            this.utilityProcess?.postMessage(sharedProcess_1.SharedProcessLifecycle.exit);
            this.utilityProcess = undefined;
        }
        whenReady() {
            if (!this._whenReady) {
                this._whenReady = (async () => {
                    // Wait for shared process being ready to accept connection
                    await this.whenIpcReady;
                    // Overall signal that the shared process was loaded and
                    // all services within have been created.
                    const whenReady = new async_1.DeferredPromise();
                    if (this.utilityProcess) {
                        this.utilityProcess.once(sharedProcess_1.SharedProcessLifecycle.initDone, () => whenReady.complete());
                    }
                    else {
                        ipcMain_1.validatedIpcMain.once(sharedProcess_1.SharedProcessLifecycle.initDone, () => whenReady.complete());
                    }
                    await whenReady.p;
                    this.logService.trace('[SharedProcess] Overall ready');
                })();
            }
            return this._whenReady;
        }
        get whenIpcReady() {
            if (!this._whenIpcReady) {
                this._whenIpcReady = (async () => {
                    // Always wait for first window asking for connection
                    await this.firstWindowConnectionBarrier.wait();
                    // Spawn shared process
                    this.createUtilityProcess();
                    // Wait for shared process indicating that IPC connections are accepted
                    const sharedProcessIpcReady = new async_1.DeferredPromise();
                    if (this.utilityProcess) {
                        this.utilityProcess.once(sharedProcess_1.SharedProcessLifecycle.ipcReady, () => sharedProcessIpcReady.complete());
                    }
                    else {
                        ipcMain_1.validatedIpcMain.once(sharedProcess_1.SharedProcessLifecycle.ipcReady, () => sharedProcessIpcReady.complete());
                    }
                    await sharedProcessIpcReady.p;
                    this.logService.trace('[SharedProcess] IPC ready');
                })();
            }
            return this._whenIpcReady;
        }
        createUtilityProcess() {
            this.utilityProcess = this._register(new utilityProcess_1.UtilityProcess(this.logService, telemetryUtils_1.NullTelemetryService, this.lifecycleMainService));
            const inspectParams = (0, environmentService_1.parseSharedProcessDebugPort)(this.environmentMainService.args, this.environmentMainService.isBuilt);
            let execArgv = undefined;
            if (inspectParams.port) {
                execArgv = ['--nolazy'];
                if (inspectParams.break) {
                    execArgv.push(`--inspect-brk=${inspectParams.port}`);
                }
                else {
                    execArgv.push(`--inspect=${inspectParams.port}`);
                }
            }
            this.utilityProcess.start({
                type: 'shared-process',
                entryPoint: 'vs/code/node/sharedProcess/sharedProcessMain',
                payload: this.createSharedProcessConfiguration(),
                execArgv
            });
        }
        createSharedProcessConfiguration() {
            return {
                machineId: this.machineId,
                sqmId: this.sqmId,
                codeCachePath: this.environmentMainService.codeCachePath,
                profiles: {
                    home: this.userDataProfilesService.profilesHome,
                    all: this.userDataProfilesService.profiles,
                },
                args: this.environmentMainService.args,
                logLevel: this.loggerMainService.getLogLevel(),
                loggers: this.loggerMainService.getRegisteredLoggers(),
                policiesData: this.policyService.serialize()
            };
        }
        async connect(payload) {
            // Wait for shared process being ready to accept connection
            await this.whenIpcReady;
            // Connect and return message port
            const utilityProcess = (0, types_1.assertIsDefined)(this.utilityProcess);
            return utilityProcess.connect(payload);
        }
    };
    exports.SharedProcess = SharedProcess;
    exports.SharedProcess = SharedProcess = __decorate([
        __param(2, environmentMainService_1.IEnvironmentMainService),
        __param(3, userDataProfile_1.IUserDataProfilesService),
        __param(4, lifecycleMainService_1.ILifecycleMainService),
        __param(5, log_1.ILogService),
        __param(6, loggerService_1.ILoggerMainService),
        __param(7, policy_1.IPolicyService)
    ], SharedProcess);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkUHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vc2hhcmVkUHJvY2Vzcy9lbGVjdHJvbi1tYWluL3NoYXJlZFByb2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsc0JBQVU7UUFNNUMsWUFDa0IsU0FBaUIsRUFDakIsS0FBYSxFQUNMLHNCQUFnRSxFQUMvRCx1QkFBa0UsRUFDckUsb0JBQTRELEVBQ3RFLFVBQXdDLEVBQ2pDLGlCQUFzRCxFQUMxRCxhQUE4QztZQUU5RCxLQUFLLEVBQUUsQ0FBQztZQVRTLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFDakIsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNZLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDOUMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUNwRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3JELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDaEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN6QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFaOUMsaUNBQTRCLEdBQUcsSUFBSSxlQUFPLEVBQUUsQ0FBQztZQUV0RCxtQkFBYyxHQUErQixTQUFTLENBQUM7WUFvRXZELGVBQVUsR0FBOEIsU0FBUyxDQUFDO1lBMEJsRCxrQkFBYSxHQUE4QixTQUFTLENBQUM7WUFoRjVELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIsNERBQTREO1lBQzVELDBCQUFnQixDQUFDLEVBQUUsQ0FBQyw4Q0FBOEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJ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
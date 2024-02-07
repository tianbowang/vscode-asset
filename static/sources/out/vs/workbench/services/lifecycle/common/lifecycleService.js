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
define(["require", "exports", "vs/base/common/event", "vs/base/common/async", "vs/base/common/lifecycle", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/base/common/performance", "vs/platform/storage/common/storage"], function (require, exports, event_1, async_1, lifecycle_1, lifecycle_2, log_1, performance_1, storage_1) {
    "use strict";
    var AbstractLifecycleService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractLifecycleService = void 0;
    let AbstractLifecycleService = class AbstractLifecycleService extends lifecycle_1.Disposable {
        static { AbstractLifecycleService_1 = this; }
        static { this.LAST_SHUTDOWN_REASON_KEY = 'lifecyle.lastShutdownReason'; }
        get startupKind() { return this._startupKind; }
        get phase() { return this._phase; }
        constructor(logService, storageService) {
            super();
            this.logService = logService;
            this.storageService = storageService;
            this._onBeforeShutdown = this._register(new event_1.Emitter());
            this.onBeforeShutdown = this._onBeforeShutdown.event;
            this._onWillShutdown = this._register(new event_1.Emitter());
            this.onWillShutdown = this._onWillShutdown.event;
            this._onDidShutdown = this._register(new event_1.Emitter());
            this.onDidShutdown = this._onDidShutdown.event;
            this._onBeforeShutdownError = this._register(new event_1.Emitter());
            this.onBeforeShutdownError = this._onBeforeShutdownError.event;
            this._onShutdownVeto = this._register(new event_1.Emitter());
            this.onShutdownVeto = this._onShutdownVeto.event;
            this._phase = 1 /* LifecyclePhase.Starting */;
            this.phaseWhen = new Map();
            // Resolve startup kind
            this._startupKind = this.resolveStartupKind();
            // Save shutdown reason to retrieve on next startup
            this.storageService.onWillSaveState(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.storageService.store(AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY, this.shutdownReason, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
            });
        }
        resolveStartupKind() {
            // Retrieve and reset last shutdown reason
            const lastShutdownReason = this.storageService.getNumber(AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY, 1 /* StorageScope.WORKSPACE */);
            this.storageService.remove(AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY, 1 /* StorageScope.WORKSPACE */);
            // Convert into startup kind
            let startupKind;
            switch (lastShutdownReason) {
                case 3 /* ShutdownReason.RELOAD */:
                    startupKind = 3 /* StartupKind.ReloadedWindow */;
                    break;
                case 4 /* ShutdownReason.LOAD */:
                    startupKind = 4 /* StartupKind.ReopenedWindow */;
                    break;
                default:
                    startupKind = 1 /* StartupKind.NewWindow */;
            }
            this.logService.trace(`[lifecycle] starting up (startup kind: ${startupKind})`);
            return startupKind;
        }
        set phase(value) {
            if (value < this.phase) {
                throw new Error('Lifecycle cannot go backwards');
            }
            if (this._phase === value) {
                return;
            }
            this.logService.trace(`lifecycle: phase changed (value: ${value})`);
            this._phase = value;
            (0, performance_1.mark)(`code/LifecyclePhase/${(0, lifecycle_2.LifecyclePhaseToString)(value)}`);
            const barrier = this.phaseWhen.get(this._phase);
            if (barrier) {
                barrier.open();
                this.phaseWhen.delete(this._phase);
            }
        }
        async when(phase) {
            if (phase <= this._phase) {
                return;
            }
            let barrier = this.phaseWhen.get(phase);
            if (!barrier) {
                barrier = new async_1.Barrier();
                this.phaseWhen.set(phase, barrier);
            }
            await barrier.wait();
        }
    };
    exports.AbstractLifecycleService = AbstractLifecycleService;
    exports.AbstractLifecycleService = AbstractLifecycleService = AbstractLifecycleService_1 = __decorate([
        __param(0, log_1.ILogService),
        __param(1, storage_1.IStorageService)
    ], AbstractLifecycleService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2xpZmVjeWNsZS9jb21tb24vbGlmZWN5Y2xlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQWUsd0JBQXdCLEdBQXZDLE1BQWUsd0JBQXlCLFNBQVEsc0JBQVU7O2lCQUV4Qyw2QkFBd0IsR0FBRyw2QkFBNkIsQUFBaEMsQ0FBaUM7UUFvQmpGLElBQUksV0FBVyxLQUFrQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRzVELElBQUksS0FBSyxLQUFxQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBTW5ELFlBQ2MsVUFBMEMsRUFDdEMsY0FBa0Q7WUFFbkUsS0FBSyxFQUFFLENBQUM7WUFId0IsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNuQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUEzQmpELHNCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQStCLENBQUMsQ0FBQztZQUN6RixxQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBRXRDLG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBcUIsQ0FBQyxDQUFDO1lBQzdFLG1CQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7WUFFbEMsbUJBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMvRCxrQkFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO1lBRWhDLDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMs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
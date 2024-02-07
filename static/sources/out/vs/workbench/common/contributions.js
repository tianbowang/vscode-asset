/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/registry/common/platform", "vs/base/common/async", "vs/base/common/performance", "vs/platform/log/common/log", "vs/platform/environment/common/environment"], function (require, exports, instantiation_1, lifecycle_1, platform_1, async_1, performance_1, log_1, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Extensions = void 0;
    var Extensions;
    (function (Extensions) {
        Extensions.Workbench = 'workbench.contributions.kind';
    })(Extensions || (exports.Extensions = Extensions = {}));
    class WorkbenchContributionsRegistry {
        constructor() {
            this.contributions = new Map();
            this.pendingRestoredContributions = new async_1.DeferredPromise();
            this.whenRestored = this.pendingRestoredContributions.p;
        }
        registerWorkbenchContribution(contribution, phase = 1 /* LifecyclePhase.Starting */) {
            // Instantiate directly if we are already matching the provided phase
            if (this.instantiationService && this.lifecycleService && this.logService && this.environmentService && this.lifecycleService.phase >= phase) {
                this.safeCreateContribution(this.instantiationService, this.logService, this.environmentService, contribution, phase);
            }
            // Otherwise keep contributions by lifecycle phase
            else {
                let contributions = this.contributions.get(phase);
                if (!contributions) {
                    contributions = [];
                    this.contributions.set(phase, contributions);
                }
                contributions.push(contribution);
            }
        }
        start(accessor) {
            const instantiationService = this.instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const lifecycleService = this.lifecycleService = accessor.get(lifecycle_1.ILifecycleService);
            const logService = this.logService = accessor.get(log_1.ILogService);
            const environmentService = this.environmentService = accessor.get(environment_1.IEnvironmentService);
            for (const phase of [1 /* LifecyclePhase.Starting */, 2 /* LifecyclePhase.Ready */, 3 /* LifecyclePhase.Restored */, 4 /* LifecyclePhase.Eventually */]) {
                this.instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase);
            }
        }
        instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase) {
            // Instantiate contributions directly when phase is already reached
            if (lifecycleService.phase >= phase) {
                this.doInstantiateByPhase(instantiationService, logService, environmentService, phase);
            }
            // Otherwise wait for phase to be reached
            else {
                lifecycleService.when(phase).then(() => this.doInstantiateByPhase(instantiationService, logService, environmentService, phase));
            }
        }
        async doInstantiateByPhase(instantiationService, logService, environmentService, phase) {
            const contributions = this.contributions.get(phase);
            if (contributions) {
                this.contributions.delete(phase);
                switch (phase) {
                    case 1 /* LifecyclePhase.Starting */:
                    case 2 /* LifecyclePhase.Ready */: {
                        // instantiate everything synchronously and blocking
                        // measure the time it takes as perf marks for diagnosis
                        (0, performance_1.mark)(`code/willCreateWorkbenchContributions/${phase}`);
                        for (const contribution of contributions) {
                            this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
                        }
                        (0, performance_1.mark)(`code/didCreateWorkbenchContributions/${phase}`);
                        break;
                    }
                    case 3 /* LifecyclePhase.Restored */:
                    case 4 /* LifecyclePhase.Eventually */: {
                        // for the Restored/Eventually-phase we instantiate contributions
                        // only when idle. this might take a few idle-busy-cycles but will
                        // finish within the timeouts
                        // given that, we must ensure to await the contributions from the
                        // Restored-phase before we instantiate the Eventually-phase
                        if (phase === 4 /* LifecyclePhase.Eventually */) {
                            await this.pendingRestoredContributions.p;
                        }
                        this.doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase);
                        break;
                    }
                }
            }
        }
        doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase) {
            (0, performance_1.mark)(`code/willCreateWorkbenchContributions/${phase}`);
            let i = 0;
            const forcedTimeout = phase === 4 /* LifecyclePhase.Eventually */ ? 3000 : 500;
            const instantiateSome = (idle) => {
                while (i < contributions.length) {
                    const contribution = contributions[i++];
                    this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
                    if (idle.timeRemaining() < 1) {
                        // time is up -> reschedule
                        (0, async_1.runWhenGlobalIdle)(instantiateSome, forcedTimeout);
                        break;
                    }
                }
                if (i === contributions.length) {
                    (0, performance_1.mark)(`code/didCreateWorkbenchContributions/${phase}`);
                    if (phase === 3 /* LifecyclePhase.Restored */) {
                        this.pendingRestoredContributions.complete();
                    }
                }
            };
            (0, async_1.runWhenGlobalIdle)(instantiateSome, forcedTimeout);
        }
        safeCreateContribution(instantiationService, logService, environmentService, contribution, phase) {
            const now = phase < 3 /* LifecyclePhase.Restored */ ? Date.now() : undefined;
            try {
                instantiationService.createInstance(contribution);
            }
            catch (error) {
                logService.error(`Unable to create workbench contribution ${contribution.name}.`, error);
            }
            if (typeof now === 'number' && !environmentService.isBuilt /* only log out of sources where we have good ctor names */) {
                const time = Date.now() - now;
                if (time > 20) {
                    logService.warn(`Workbench contribution ${contribution.name} blocked restore phase by ${time}ms.`);
                }
            }
        }
    }
    platform_1.Registry.add(Extensions.Workbench, new WorkbenchContributionsRegistry());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJpYnV0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9jb250cmlidXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsSUFBaUIsVUFBVSxDQUUxQjtJQUZELFdBQWlCLFVBQVU7UUFDYixvQkFBUyxHQUFHLDhCQUE4QixDQUFDO0lBQ3pELENBQUMsRUFGZ0IsVUFBVSwwQkFBVixVQUFVLFFBRTFCO0lBZ0NELE1BQU0sOEJBQThCO1FBQXBDO1lBT2tCLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQW1FLENBQUM7WUFFM0YsaUNBQTRCLEdBQUcsSUFBSSx1QkFBZSxFQUFRLENBQUM7WUFDbkUsaUJBQVksR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1FBc0k3RCxDQUFDO1FBcElBLDZCQUE2QixDQUFDLFlBQTJELEVBQUUsdUNBQStDO1lBRXpJLHFFQUFxRTtZQUNyRSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDOUksSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkgsQ0FBQztZQUVELGtEQUFrRDtpQkFDN0MsQ0FBQztnQkFDTCxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFD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
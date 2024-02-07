/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/assignment/common/assignment", "vs/amdX"], function (require, exports, telemetryUtils_1, assignment_1, amdX_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseAssignmentService = void 0;
    class BaseAssignmentService {
        get experimentsEnabled() {
            return true;
        }
        constructor(machineId, configurationService, productService, telemetry, keyValueStorage) {
            this.machineId = machineId;
            this.configurationService = configurationService;
            this.productService = productService;
            this.telemetry = telemetry;
            this.keyValueStorage = keyValueStorage;
            this.networkInitialized = false;
            if (productService.tasConfig && this.experimentsEnabled && (0, telemetryUtils_1.getTelemetryLevel)(this.configurationService) === 3 /* TelemetryLevel.USAGE */) {
                this.tasClient = this.setupTASClient();
            }
            // For development purposes, configure the delay until tas local tas treatment ovverrides are available
            const overrideDelaySetting = this.configurationService.getValue('experiments.overrideDelay');
            const overrideDelay = typeof overrideDelaySetting === 'number' ? overrideDelaySetting : 0;
            this.overrideInitDelay = new Promise(resolve => setTimeout(resolve, overrideDelay));
        }
        async getTreatment(name) {
            // For development purposes, allow overriding tas assignments to test variants locally.
            await this.overrideInitDelay;
            const override = this.configurationService.getValue('experiments.override.' + name);
            if (override !== undefined) {
                return override;
            }
            if (!this.tasClient) {
                return undefined;
            }
            if (!this.experimentsEnabled) {
                return undefined;
            }
            let result;
            const client = await this.tasClient;
            // The TAS client is initialized but we need to check if the initial fetch has completed yet
            // If it is complete, return a cached value for the treatment
            // If not, use the async call with `checkCache: true`. This will allow the module to return a cached value if it is present.
            // Otherwise it will await the initial fetch to return the most up to date value.
            if (this.networkInitialized) {
                result = client.getTreatmentVariable('vscode', name);
            }
            else {
                result = await client.getTreatmentVariableAsync('vscode', name, true);
            }
            result = client.getTreatmentVariable('vscode', name);
            return result;
        }
        async setupTASClient() {
            const targetPopulation = this.productService.quality === 'stable' ?
                assignment_1.TargetPopulation.Public : (this.productService.quality === 'exploration' ?
                assignment_1.TargetPopulation.Exploration : assignment_1.TargetPopulation.Insiders);
            const filterProvider = new assignment_1.AssignmentFilterProvider(this.productService.version, this.productService.nameLong, this.machineId, targetPopulation);
            const tasConfig = this.productService.tasConfig;
            const tasClient = new (await (0, amdX_1.importAMDNodeModule)('tas-client-umd', 'lib/tas-client-umd.js')).ExperimentationService({
                filterProviders: [filterProvider],
                telemetry: this.telemetry,
                storageKey: assignment_1.ASSIGNMENT_STORAGE_KEY,
                keyValueStorage: this.keyValueStorage,
                assignmentContextTelemetryPropertyName: tasConfig.assignmentContextTelemetryPropertyName,
                telemetryEventName: tasConfig.telemetryEventName,
                endpoint: tasConfig.endpoint,
                refetchInterval: assignment_1.ASSIGNMENT_REFETCH_INTERVAL,
            });
            await tasClient.initializePromise;
            tasClient.initialFetch.then(() => this.networkInitialized = true);
            return tasClient;
        }
    }
    exports.BaseAssignmentService = BaseAssignmentService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWdubWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2Fzc2lnbm1lbnQvY29tbW9uL2Fzc2lnbm1lbnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFzQixxQkFBcUI7UUFNMUMsSUFBYyxrQkFBa0I7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsWUFDa0IsU0FBaUIsRUFDZixvQkFBMkMsRUFDM0MsY0FBK0IsRUFDeEMsU0FBb0MsRUFDdEMsZUFBa0M7WUFKekIsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNmLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDM0MsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ3hDLGNBQVMsR0FBVCxTQUFTLENBQTJCO1lBQ3RDLG9CQUFlLEdBQWYsZUFBZSxDQUFtQjtZQVpuQyx1QkFBa0IsR0FBRyxLQUFLLENBQUM7WUFlbEMsSUFBSSxjQUFjLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFBLGtDQUFpQixFQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQ0FBeUIsRUFBRSxDQUFDO2dCQUNsSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN4QyxDQUFDO1lBRUQsdUdBQXVHO1lBQ3ZHLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQzdGLE1BQU0sYUFBYSxHQUFHLE9BQU8sb0JBQW9CLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFP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
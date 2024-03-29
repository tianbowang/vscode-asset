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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/memento", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/platform/assignment/common/assignmentService", "vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, nls_1, instantiation_1, memento_1, telemetry_1, storage_1, extensions_1, configuration_1, productService_1, platform_1, assignmentService_1, configuration_2, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchAssignmentService = exports.IWorkbenchAssignmentService = void 0;
    exports.IWorkbenchAssignmentService = (0, instantiation_1.createDecorator)('WorkbenchAssignmentService');
    class MementoKeyValueStorage {
        constructor(memento) {
            this.memento = memento;
            this.mementoObj = memento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        async getValue(key, defaultValue) {
            const value = await this.mementoObj[key];
            return value || defaultValue;
        }
        setValue(key, value) {
            this.mementoObj[key] = value;
            this.memento.saveMemento();
        }
    }
    class WorkbenchAssignmentServiceTelemetry {
        constructor(telemetryService, productService) {
            this.telemetryService = telemetryService;
            this.productService = productService;
        }
        get assignmentContext() {
            return this._lastAssignmentContext?.split(';');
        }
        // __GDPR__COMMON__ "abexp.assignmentcontext" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        setSharedProperty(name, value) {
            if (name === this.productService.tasConfig?.assignmentContextTelemetryPropertyName) {
                this._lastAssignmentContext = value;
            }
            this.telemetryService.setExperimentProperty(name, value);
        }
        postEvent(eventName, props) {
            const data = {};
            for (const [key, value] of props.entries()) {
                data[key] = value;
            }
            /* __GDPR__
                "query-expfeature" : {
                    "owner": "sbatten",
                    "comment": "Logs queries to the experiment service by feature for metric calculations",
                    "ABExp.queriedFeature": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "comment": "The experimental feature being queried" }
                }
            */
            this.telemetryService.publicLog(eventName, data);
        }
    }
    let WorkbenchAssignmentService = class WorkbenchAssignmentService extends assignmentService_1.BaseAssignmentService {
        constructor(telemetryService, storageService, configurationService, productService) {
            super(telemetryService.machineId, configurationService, productService, new WorkbenchAssignmentServiceTelemetry(telemetryService, productService), new MementoKeyValueStorage(new memento_1.Memento('experiment.service.memento', storageService)));
            this.telemetryService = telemetryService;
        }
        get experimentsEnabled() {
            return this.configurationService.getValue('workbench.enableExperiments') === true;
        }
        async getTreatment(name) {
            const result = await super.getTreatment(name);
            this.telemetryService.publicLog2('tasClientReadTreatmentComplete', { treatmentName: name, treatmentValue: JSON.stringify(result) });
            return result;
        }
        async getCurrentExperiments() {
            if (!this.tasClient) {
                return undefined;
            }
            if (!this.experimentsEnabled) {
                return undefined;
            }
            await this.tasClient;
            return this.telemetry?.assignmentContext;
        }
    };
    exports.WorkbenchAssignmentService = WorkbenchAssignmentService;
    exports.WorkbenchAssignmentService = WorkbenchAssignmentService = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, storage_1.IStorageService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, productService_1.IProductService)
    ], WorkbenchAssignmentService);
    (0, extensions_1.registerSingleton)(exports.IWorkbenchAssignmentService, WorkbenchAssignmentService, 1 /* InstantiationType.Delayed */);
    const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    registry.registerConfiguration({
        ...configuration_2.workbenchConfigurationNodeBase,
        'properties': {
            'workbench.enableExperiments': {
                'type': 'boolean',
                'description': (0, nls_1.localize)('workbench.enableExperiments', "Fetches experiments to run from a Microsoft online service."),
                'default': true,
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                'restricted': true,
                'tags': ['usesOnlineServices']
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWdubWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9hc3NpZ25tZW50L2NvbW1vbi9hc3NpZ25tZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQm5GLFFBQUEsMkJBQTJCLEdBQUcsSUFBQSwrQkFBZSxFQUE4Qiw0QkFBNEIsQ0FBQyxDQUFDO0lBTXRILE1BQU0sc0JBQXNCO1FBRTNCLFlBQW9CLE9BQWdCO1lBQWhCLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxrRUFBaUQsQ0FBQztRQUN2RixDQUFDO1FBRUQsS0FBSyxDQUFDLFFBQVEsQ0FBSSxHQUFXLEVBQUUsWUFBNEI7WUFDMUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sS0FBSyxJQUFJLFlBQVksQ0FBQztRQUM5QixDQUFDO1FBRUQsUUFBUSxDQUFJLEdBQVcsRUFBRSxLQUFRO1lBQ2hDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUIsQ0FBQztLQUNEO0lBRUQsTUFBTSxtQ0FBbUM7UUFFeEMsWUFDUyxnQkFBbUMsRUFDbkMsY0FBK0I7WUFEL0IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNuQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7UUFDcEMsQ0FBQztRQUVMLElBQUksaUJBQWlCO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQs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
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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService", "vs/platform/externalServices/common/serviceMachineId", "vs/platform/storage/common/storage", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, event_1, lifecycle_1, platform_1, strings_1, nls_1, environment_1, files_1, instantiation_1, productService_1, serviceMachineId_1, storage_1, userDataSync_1) {
    "use strict";
    var UserDataSyncMachinesService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncMachinesService = exports.isWebPlatform = exports.IUserDataSyncMachinesService = void 0;
    exports.IUserDataSyncMachinesService = (0, instantiation_1.createDecorator)('IUserDataSyncMachinesService');
    const currentMachineNameKey = 'sync.currentMachineName';
    const Safari = 'Safari';
    const Chrome = 'Chrome';
    const Edge = 'Edge';
    const Firefox = 'Firefox';
    const Android = 'Android';
    function isWebPlatform(platform) {
        switch (platform) {
            case Safari:
            case Chrome:
            case Edge:
            case Firefox:
            case Android:
            case (0, platform_1.PlatformToString)(0 /* Platform.Web */):
                return true;
        }
        return false;
    }
    exports.isWebPlatform = isWebPlatform;
    function getPlatformName() {
        if (platform_1.isSafari) {
            return Safari;
        }
        if (platform_1.isChrome) {
            return Chrome;
        }
        if (platform_1.isEdge) {
            return Edge;
        }
        if (platform_1.isFirefox) {
            return Firefox;
        }
        if (platform_1.isAndroid) {
            return Android;
        }
        return (0, platform_1.PlatformToString)(platform_1.isWeb ? 0 /* Platform.Web */ : platform_1.platform);
    }
    let UserDataSyncMachinesService = class UserDataSyncMachinesService extends lifecycle_1.Disposable {
        static { UserDataSyncMachinesService_1 = this; }
        static { this.VERSION = 1; }
        static { this.RESOURCE = 'machines'; }
        constructor(environmentService, fileService, storageService, userDataSyncStoreService, logService, productService) {
            super();
            this.storageService = storageService;
            this.userDataSyncStoreService = userDataSyncStoreService;
            this.logService = logService;
            this.productService = productService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.userData = null;
            this.currentMachineIdPromise = (0, serviceMachineId_1.getServiceMachineId)(environmentService, fileService, storageService);
        }
        async getMachines(manifest) {
            const currentMachineId = await this.currentMachineIdPromise;
            const machineData = await this.readMachinesData(manifest);
            return machineData.machines.map(machine => ({ ...machine, ...{ isCurrent: machine.id === currentMachineId } }));
        }
        async addCurrentMachine(manifest) {
            const currentMachineId = await this.currentMachineIdPromise;
            const machineData = await this.readMachinesData(manifest);
            if (!machineData.machines.some(({ id }) => id === currentMachineId)) {
                machineData.machines.push({ id: currentMachineId, name: this.computeCurrentMachineName(machineData.machines), platform: getPlatformName() });
                await this.writeMachinesData(machineData);
            }
        }
        async removeCurrentMachine(manifest) {
            const currentMachineId = await this.currentMachineIdPromise;
            const machineData = await this.readMachinesData(manifest);
            const updatedMachines = machineData.machines.filter(({ id }) => id !== currentMachineId);
            if (updatedMachines.length !== machineData.machines.length) {
                machineData.machines = updatedMachines;
                await this.writeMachinesData(machineData);
            }
        }
        async renameMachine(machineId, name, manifest) {
            const machineData = await this.readMachinesData(manifest);
            const machine = machineData.machines.find(({ id }) => id === machineId);
            if (machine) {
                machine.name = name;
                await this.writeMachinesData(machineData);
                const currentMachineId = await this.currentMachineIdPromise;
                if (machineId === currentMachineId) {
                    this.storageService.store(currentMachineNameKey, name, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
            }
        }
        async setEnablements(enablements) {
            const machineData = await this.readMachinesData();
            for (const [machineId, enabled] of enablements) {
                const machine = machineData.machines.find(machine => machine.id === machineId);
                if (machine) {
                    machine.disabled = enabled ? undefined : true;
                }
            }
            await this.writeMachinesData(machineData);
        }
        computeCurrentMachineName(machines) {
            const previousName = this.storageService.get(currentMachineNameKey, -1 /* StorageScope.APPLICATION */);
            if (previousName) {
                return previousName;
            }
            const namePrefix = `${this.productService.embedderIdentifier ? `${this.productService.embedderIdentifier} - ` : ''}${getPlatformName()} (${this.productService.nameShort})`;
            const nameRegEx = new RegExp(`${(0, strings_1.escapeRegExpCharacters)(namePrefix)}\\s#(\\d+)`);
            let nameIndex = 0;
            for (const machine of machines) {
                const matches = nameRegEx.exec(machine.name);
                const index = matches ? parseInt(matches[1]) : 0;
                nameIndex = index > nameIndex ? index : nameIndex;
            }
            return `${namePrefix} #${nameIndex + 1}`;
        }
        async readMachinesData(manifest) {
            this.userData = await this.readUserData(manifest);
            const machinesData = this.parse(this.userData);
            if (machinesData.version !== UserDataSyncMachinesService_1.VERSION) {
                throw new Error((0, nls_1.localize)('error incompatible', "Cannot read machines data as the current version is incompatible. Please update {0} and try again.", this.productService.nameLong));
            }
            return machinesData;
        }
        async writeMachinesData(machinesData) {
            const content = JSON.stringify(machinesData);
            const ref = await this.userDataSyncStoreService.writeResource(UserDataSyncMachinesService_1.RESOURCE, content, this.userData?.ref || null);
            this.userData = { ref, content };
            this._onDidChange.fire();
        }
        async readUserData(manifest) {
            if (this.userData) {
                const latestRef = manifest && manifest.latest ? manifest.latest[UserDataSyncMachinesService_1.RESOURCE] : undefined;
                // Last time synced resource and latest resource on server are same
                if (this.userData.ref === latestRef) {
                    return this.userData;
                }
                // There is no resource on server and last time it was synced with no resource
                if (latestRef === undefined && this.userData.content === null) {
                    return this.userData;
                }
            }
            return this.userDataSyncStoreService.readResource(UserDataSyncMachinesService_1.RESOURCE, this.userData);
        }
        parse(userData) {
            if (userData.content !== null) {
                try {
                    return JSON.parse(userData.content);
                }
                catch (e) {
                    this.logService.error(e);
                }
            }
            return {
                version: UserDataSyncMachinesService_1.VERSION,
                machines: []
            };
        }
    };
    exports.UserDataSyncMachinesService = UserDataSyncMachinesService;
    exports.UserDataSyncMachinesService = UserDataSyncMachinesService = UserDataSyncMachinesService_1 = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, storage_1.IStorageService),
        __param(3, userDataSync_1.IUserDataSyncStoreService),
        __param(4, userDataSync_1.IUserDataSyncLogService),
        __param(5, productService_1.IProductService)
    ], UserDataSyncMachinesService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jTWFjaGluZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhU3luYy9jb21tb24vdXNlckRhdGFTeW5jTWFjaGluZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTZCbkYsUUFBQSw0QkFBNEIsR0FBRyxJQUFBLCtCQUFlLEVBQStCLDhCQUE4QixDQUFDLENBQUM7SUFjMUgsTUFBTSxxQkFBcUIsR0FBRyx5QkFBeUIsQ0FBQztJQUV4RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7SUFDeEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ3hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQztJQUNwQixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7SUFDMUIsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDO0lBRTFCLFNBQWdCLGFBQWEsQ0FBQyxRQUFnQjtRQUM3QyxRQUFRLFFBQVEsRUFBRSxDQUFDO1lBQ2xCLEtBQUssTUFBTSxDQUFDO1lBQ1osS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLElBQUksQ0FBQztZQUNWLEtBQUssT0FBTyxDQUFDO1lBQ2IsS0FBSyxPQUFPLENBQUM7WUFDYixLQUFLLElBQUEsMkJBQWdCLHVCQUFjO2dCQUNsQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFYRCxzQ0FXQztJQUVELFNBQVMsZUFBZTtRQUN2QixJQUFJLG1CQUFRLEVBQUUsQ0FBQztZQUFDLE9BQU8sTUFBTSxDQUFDO1FBQUMsQ0FBQztRQUNoQyxJQUFJLG1CQUFRLEVBQUUsQ0FBQztZQUFDLE9BQU8sTUFBTSxDQUFDO1FBQUMsQ0FBQztRQUNoQyxJQUFJLGlCQUFNLEVBQUUsQ0FBQztZQUFDLE9BQU8sSUFBSSxD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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/node/id", "vs/platform/telemetry/common/telemetry"], function (require, exports, platform_1, id_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveSqmId = exports.resolveMachineId = void 0;
    async function resolveMachineId(stateService, logService) {
        // We cache the machineId for faster lookups
        // and resolve it only once initially if not cached or we need to replace the macOS iBridge device
        let machineId = stateService.getItem(telemetry_1.machineIdKey);
        if (typeof machineId !== 'string' || (platform_1.isMacintosh && machineId === '6c9d2bc8f91b89624add29c0abeae7fb42bf539fa1cdb2e3e57cd668fa9bcead')) {
            machineId = await (0, id_1.getMachineId)(logService.error.bind(logService));
        }
        return machineId;
    }
    exports.resolveMachineId = resolveMachineId;
    async function resolveSqmId(stateService, logService) {
        let sqmId = stateService.getItem(telemetry_1.sqmIdKey);
        if (typeof sqmId !== 'string') {
            sqmId = await (0, id_1.getSqmMachineId)(logService.error.bind(logService));
        }
        return sqmId;
    }
    exports.resolveSqmId = resolveSqmId;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RlbGVtZXRyeS9ub2RlL3RlbGVtZXRyeVV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVN6RixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsWUFBK0IsRUFBRSxVQUF1QjtRQUM5Riw0Q0FBNEM7UUFDNUMsa0dBQWtHO1FBQ2xHLElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQVMsd0JBQVksQ0FBQyxDQUFDO1FBQzNELElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLENBQUMsc0JBQVcsSUFBSSxTQUFTLEtBQUssa0VBQWtFLENBQUMsRUFBRSxDQUFDO1lBQ3hJLFNBQVMsR0FBRyxNQUFNLElBQUEsaUJBQVksRUFBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBVEQsNENBU0M7SUFFTSxLQUFLLFVBQVUsWUFBWSxDQUFDLFlBQStCLEVBQUUsVUFBdUI7UUFDMUYsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBUyxvQkFBUSxDQUFDLENBQUM7UUFDbkQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMvQixLQUFLLEdBQUcsTUFBTSxJQUFBLG9CQUFlLEVBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBUEQsb0NBT0MifQ==
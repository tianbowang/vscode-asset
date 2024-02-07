/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/node/telemetryUtils"], function (require, exports, telemetry_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveSqmId = exports.resolveMachineId = void 0;
    async function resolveMachineId(stateService, logService) {
        // Call the node layers implementation to avoid code duplication
        const machineId = await (0, telemetryUtils_1.resolveMachineId)(stateService, logService);
        stateService.setItem(telemetry_1.machineIdKey, machineId);
        return machineId;
    }
    exports.resolveMachineId = resolveMachineId;
    async function resolveSqmId(stateService, logService) {
        const sqmId = await (0, telemetryUtils_1.resolveSqmId)(stateService, logService);
        stateService.setItem(telemetry_1.sqmIdKey, sqmId);
        return sqmId;
    }
    exports.resolveSqmId = resolveSqmId;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RlbGVtZXRyeS9lbGVjdHJvbi1tYWluL3RlbGVtZXRyeVV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU96RixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsWUFBMkIsRUFBRSxVQUF1QjtRQUMxRixnRUFBZ0U7UUFDaEUsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLGlDQUFvQixFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2RSxZQUFZLENBQUMsT0FBTyxDQUFDLHdCQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDOUMsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUxELDRDQUtDO0lBRU0sS0FBSyxVQUFVLFlBQVksQ0FBQyxZQUEyQixFQUFFLFVBQXVCO1FBQ3RGLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSw2QkFBZ0IsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDL0QsWUFBWSxDQUFDLE9BQU8sQ0FBQyxvQkFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUpELG9DQUlDIn0=
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/uuid", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/objects", "vs/platform/telemetry/common/telemetry", "vs/base/browser/touch"], function (require, exports, Platform, uuid, telemetryUtils_1, objects_1, telemetry_1, touch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveWorkbenchCommonProperties = void 0;
    /**
     * General function to help reduce the individuality of user agents
     * @param userAgent userAgent from browser window
     * @returns A simplified user agent with less detail
     */
    function cleanUserAgent(userAgent) {
        return userAgent.replace(/(\d+\.\d+)(\.\d+)+/g, '$1');
    }
    function resolveWorkbenchCommonProperties(storageService, commit, version, isInternalTelemetry, remoteAuthority, productIdentifier, removeMachineId, resolveAdditionalProperties) {
        const result = Object.create(null);
        const firstSessionDate = storageService.get(telemetry_1.firstSessionDateStorageKey, -1 /* StorageScope.APPLICATION */);
        const lastSessionDate = storageService.get(telemetry_1.lastSessionDateStorageKey, -1 /* StorageScope.APPLICATION */);
        let machineId;
        if (!removeMachineId) {
            machineId = storageService.get(telemetry_1.machineIdKey, -1 /* StorageScope.APPLICATION */);
            if (!machineId) {
                machineId = uuid.generateUuid();
                storageService.store(telemetry_1.machineIdKey, machineId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            }
        }
        else {
            machineId = `Redacted-${productIdentifier ?? 'web'}`;
        }
        /**
         * Note: In the web, session date information is fetched from browser storage, so these dates are tied to a specific
         * browser and not the machine overall.
         */
        // __GDPR__COMMON__ "common.firstSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.firstSessionDate'] = firstSessionDate;
        // __GDPR__COMMON__ "common.lastSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.lastSessionDate'] = lastSessionDate || '';
        // __GDPR__COMMON__ "common.isNewSession" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.isNewSession'] = !lastSessionDate ? '1' : '0';
        // __GDPR__COMMON__ "common.remoteAuthority" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.remoteAuthority'] = (0, telemetryUtils_1.cleanRemoteAuthority)(remoteAuthority);
        // __GDPR__COMMON__ "common.machineId" : { "endPoint": "MacAddressHash", "classification": "EndUserPseudonymizedInformation", "purpose": "FeatureInsight" }
        result['common.machineId'] = machineId;
        // __GDPR__COMMON__ "sessionID" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['sessionID'] = uuid.generateUuid() + Date.now();
        // __GDPR__COMMON__ "commitHash" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['commitHash'] = commit;
        // __GDPR__COMMON__ "version" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['version'] = version;
        // __GDPR__COMMON__ "common.platform" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.platform'] = Platform.PlatformToString(Platform.platform);
        // __GDPR__COMMON__ "common.product" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
        result['common.product'] = productIdentifier ?? 'web';
        // __GDPR__COMMON__ "common.userAgent" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.userAgent'] = Platform.userAgent ? cleanUserAgent(Platform.userAgent) : undefined;
        // __GDPR__COMMON__ "common.isTouchDevice" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        result['common.isTouchDevice'] = String(touch_1.Gesture.isTouchDevice());
        if (isInternalTelemetry) {
            // __GDPR__COMMON__ "common.msftInternal" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            result['common.msftInternal'] = isInternalTelemetry;
        }
        // dynamic properties which value differs on each call
        let seq = 0;
        const startTime = Date.now();
        Object.defineProperties(result, {
            // __GDPR__COMMON__ "timestamp" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            'timestamp': {
                get: () => new Date(),
                enumerable: true
            },
            // __GDPR__COMMON__ "common.timesincesessionstart" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            'common.timesincesessionstart': {
                get: () => Date.now() - startTime,
                enumerable: true
            },
            // __GDPR__COMMON__ "common.sequence" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
            'common.sequence': {
                get: () => seq++,
                enumerable: true
            }
        });
        if (resolveAdditionalProperties) {
            (0, objects_1.mixin)(result, resolveAdditionalProperties());
        }
        return result;
    }
    exports.resolveWorkbenchCommonProperties = resolveWorkbenchCommonProperties;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoQ29tbW9uUHJvcGVydGllcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RlbGVtZXRyeS9icm93c2VyL3dvcmtiZW5jaENvbW1vblByb3BlcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHOzs7O09BSUc7SUFDSCxTQUFTLGNBQWMsQ0FBQyxTQUFpQjtRQUN4QyxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELFNBQWdCLGdDQUFnQyxDQUMvQyxjQUErQixFQUMvQixNQUEwQixFQUMxQixPQUEyQixFQUMzQixtQkFBNEIsRUFDNUIsZUFBd0IsRUFDeEIsaUJBQTBCLEVBQzFCLGVBQXlCLEVBQ3pCLDJCQUEwRDtRQUUxRCxNQUFNLE1BQU0sR0FBc0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsc0NBQTBCLG9DQUE0QixDQUFDO1FBQ25HLE1BQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMscUNBQXlCLG9DQUE0QixDQUFDO1FBRWpHLElBQUksU0FBNkIsQ0FBQztRQUNsQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdEIsU0FBUyxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsd0JBQVksb0NBQTJCLENBQUM7WUFDdkUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNoQixTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNoQyxjQUFjLENBQUMsS0FBSyxDQUFDLHdCQUFZLEVBQUUsU0FBUyxtRUFBa0QsQ0FBQztZQUNoRyxDQUFDO1FBQ0YsQ0FBQzthQUFNLENB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
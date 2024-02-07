(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/base/common/types", "vs/platform/remote/common/remoteHosts", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry"], function (require, exports, objects_1, types_1, remoteHosts_1, commonProperties_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cleanData = exports.getPiiPathsFromEnvironment = exports.isInternalTelemetry = exports.cleanRemoteAuthority = exports.validateTelemetryData = exports.getTelemetryLevel = exports.isLoggingOnly = exports.supportsTelemetry = exports.NullAppender = exports.extensionTelemetryLogChannelId = exports.telemetryLogId = exports.NullEndpointTelemetryService = exports.NullTelemetryService = exports.NullTelemetryServiceShape = exports.TelemetryTrustedValue = void 0;
    /**
     * A special class used to denoting a telemetry value which should not be clean.
     * This is because that value is "Trusted" not to contain identifiable information such as paths.
     * NOTE: This is used as an API type as well, and should not be changed.
     */
    class TelemetryTrustedValue {
        constructor(value) {
            this.value = value;
            // This is merely used as an identifier as the instance will be lost during serialization over the exthost
            this.isTrustedTelemetryValue = true;
        }
    }
    exports.TelemetryTrustedValue = TelemetryTrustedValue;
    class NullTelemetryServiceShape {
        constructor() {
            this.telemetryLevel = 0 /* TelemetryLevel.NONE */;
            this.sessionId = 'someValue.sessionId';
            this.machineId = 'someValue.machineId';
            this.sqmId = 'someValue.sqmId';
            this.firstSessionDate = 'someValue.firstSessionDate';
            this.sendErrorTelemetry = false;
        }
        publicLog() { }
        publicLog2() { }
        publicLogError() { }
        publicLogError2() { }
        setExperimentProperty() { }
    }
    exports.NullTelemetryServiceShape = NullTelemetryServiceShape;
    exports.NullTelemetryService = new NullTelemetryServiceShape();
    class NullEndpointTelemetryService {
        async publicLog(_endpoint, _eventName, _data) {
            // noop
        }
        async publicLogError(_endpoint, _errorEventName, _data) {
            // noop
        }
    }
    exports.NullEndpointTelemetryService = NullEndpointTelemetryService;
    exports.telemetryLogId = 'telemetry';
    exports.extensionTelemetryLogChannelId = 'extensionTelemetryLog';
    exports.NullAppender = { log: () => null, flush: () => Promise.resolve(null) };
    /**
     * Determines whether or not we support logging telemetry.
     * This checks if the product is capable of collecting telemetry but not whether or not it can send it
     * For checking the user setting and what telemetry you can send please check `getTelemetryLevel`.
     * This returns true if `--disable-telemetry` wasn't used, the product.json allows for telemetry, and we're not testing an extension
     * If false telemetry is disabled throughout the product
     * @param productService
     * @param environmentService
     * @returns false - telemetry is completely disabled, true - telemetry is logged locally, but may not be sent
     */
    function supportsTelemetry(productService, environmentService) {
        // If it's OSS and telemetry isn't disabled via the CLI we will allow it for logging only purposes
        if (!environmentService.isBuilt && !environmentService.disableTelemetry) {
            return true;
        }
        return !(environmentService.disableTelemetry || !productService.enableTelemetry);
    }
    exports.supportsTelemetry = supportsTelemetry;
    /**
     * Checks to see if we're in logging only mode to debug telemetry.
     * This is if telemetry is enabled and we're in OSS, but no telemetry key is provided so it's not being sent just logged.
     * @param productService
     * @param environmentService
     * @returns True if telemetry is actually disabled and we're only logging for debug purposes
     */
    function isLoggingOnly(productService, environmentService) {
        // If we're testing an extension, log telemetry for debug purposes
        if (environmentService.extensionTestsLocationURI) {
            return true;
        }
        // Logging only mode is only for OSS
        if (environmentService.isBuilt) {
            return false;
        }
        if (environmentService.disableTelemetry) {
            return false;
        }
        if (productService.enableTelemetry && productService.aiConfig?.ariaKey) {
            return false;
        }
        return true;
    }
    exports.isLoggingOnly = isLoggingOnly;
    /**
     * Determines how telemetry is handled based on the user's configuration.
     *
     * @param configurationService
     * @returns OFF, ERROR, ON
     */
    function getTelemetryLevel(configurationService) {
        const newConfig = configurationService.getValue(telemetry_1.TELEMETRY_SETTING_ID);
        const crashReporterConfig = configurationService.getValue(telemetry_1.TELEMETRY_CRASH_REPORTER_SETTING_ID);
        const oldConfig = configurationService.getValue(telemetry_1.TELEMETRY_OLD_SETTING_ID);
        // If `telemetry.enableCrashReporter` is false or `telemetry.enableTelemetry' is false, disable telemetry
        if (oldConfig === false || crashReporterConfig === false) {
            return 0 /* TelemetryLevel.NONE */;
        }
        // Maps new telemetry setting to a telemetry level
        switch (newConfig ?? "all" /* TelemetryConfiguration.ON */) {
            case "all" /* TelemetryConfiguration.ON */:
                return 3 /* TelemetryLevel.USAGE */;
            case "error" /* TelemetryConfiguration.ERROR */:
                return 2 /* TelemetryLevel.ERROR */;
            case "crash" /* TelemetryConfiguration.CRASH */:
                return 1 /* TelemetryLevel.CRASH */;
            case "off" /* TelemetryConfiguration.OFF */:
                return 0 /* TelemetryLevel.NONE */;
        }
    }
    exports.getTelemetryLevel = getTelemetryLevel;
    function validateTelemetryData(data) {
        const properties = {};
        const measurements = {};
        const flat = {};
        flatten(data, flat);
        for (let prop in flat) {
            // enforce property names less than 150 char, take the last 150 char
            prop = prop.length > 150 ? prop.substr(prop.length - 149) : prop;
            const value = flat[prop];
            if (typeof value === 'number') {
                measurements[prop] = value;
            }
            else if (typeof value === 'boolean') {
                measurements[prop] = value ? 1 : 0;
            }
            else if (typeof value === 'string') {
                if (value.length > 8192) {
                    console.warn(`Telemetry property: ${prop} has been trimmed to 8192, the original length is ${value.length}`);
                }
                //enforce property value to be less than 8192 char, take the first 8192 char
                // https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics#limits
                properties[prop] = value.substring(0, 8191);
            }
            else if (typeof value !== 'undefined' && value !== null) {
                properties[prop] = value;
            }
        }
        return {
            properties,
            measurements
        };
    }
    exports.validateTelemetryData = validateTelemetryData;
    const telemetryAllowedAuthorities = new Set(['ssh-remote', 'dev-container', 'attached-container', 'wsl', 'tunnel', 'codespaces', 'amlext']);
    function cleanRemoteAuthority(remoteAuthority) {
        if (!remoteAuthority) {
            return 'none';
        }
        const remoteName = (0, remoteHosts_1.getRemoteName)(remoteAuthority);
        return telemetryAllowedAuthorities.has(remoteName) ? remoteName : 'other';
    }
    exports.cleanRemoteAuthority = cleanRemoteAuthority;
    function flatten(obj, result, order = 0, prefix) {
        if (!obj) {
            return;
        }
        for (const item of Object.getOwnPropertyNames(obj)) {
            const value = obj[item];
            const index = prefix ? prefix + item : item;
            if (Array.isArray(value)) {
                result[index] = (0, objects_1.safeStringify)(value);
            }
            else if (value instanceof Date) {
                // TODO unsure why this is here and not in _getData
                result[index] = value.toISOString();
            }
            else if ((0, types_1.isObject)(value)) {
                if (order < 2) {
                    flatten(value, result, order + 1, index + '.');
                }
                else {
                    result[index] = (0, objects_1.safeStringify)(value);
                }
            }
            else {
                result[index] = value;
            }
        }
    }
    /**
     * Whether or not this is an internal user
     * @param productService The product service
     * @param configService The config servivce
     * @returns true if internal, false otherwise
     */
    function isInternalTelemetry(productService, configService) {
        const msftInternalDomains = productService.msftInternalDomains || [];
        const internalTesting = configService.getValue('telemetry.internalTesting');
        return (0, commonProperties_1.verifyMicrosoftInternalDomain)(msftInternalDomains) || internalTesting;
    }
    exports.isInternalTelemetry = isInternalTelemetry;
    function getPiiPathsFromEnvironment(paths) {
        return [paths.appRoot, paths.extensionsPath, paths.userHome.fsPath, paths.tmpDir.fsPath, paths.userDataPath];
    }
    exports.getPiiPathsFromEnvironment = getPiiPathsFromEnvironment;
    //#region Telemetry Cleaning
    /**
     * Cleans a given stack of possible paths
     * @param stack The stack to sanitize
     * @param cleanupPatterns Cleanup patterns to remove from the stack
     * @returns The cleaned stack
     */
    function anonymizeFilePaths(stack, cleanupPatterns) {
        // Fast check to see if it is a file path to avoid doing unnecessary heavy regex work
        if (!stack || (!stack.includes('/') && !stack.includes('\\'))) {
            return stack;
        }
        let updatedStack = stack;
        const cleanUpIndexes = [];
        for (const regexp of cleanupPatterns) {
            while (true) {
                const result = regexp.exec(stack);
                if (!result) {
                    break;
                }
                cleanUpIndexes.push([result.index, regexp.lastIndex]);
            }
        }
        const nodeModulesRegex = /^[\\\/]?(node_modules|node_modules\.asar)[\\\/]/;
        const fileRegex = /(file:\/\/)?([a-zA-Z]:(\\\\|\\|\/)|(\\\\|\\|\/))?([\w-\._]+(\\\\|\\|\/))+[\w-\._]*/g;
        let lastIndex = 0;
        updatedStack = '';
        while (true) {
            const result = fileRegex.exec(stack);
            if (!result) {
                break;
            }
            // Check to see if the any cleanupIndexes partially overlap with this match
            const overlappingRange = cleanUpIndexes.some(([start, end]) => result.index < end && start < fileRegex.lastIndex);
            // anoynimize user file paths that do not need to be retained or cleaned up.
            if (!nodeModulesRegex.test(result[0]) && !overlappingRange) {
                updatedStack += stack.substring(lastIndex, result.index) + '<REDACTED: user-file-path>';
                lastIndex = fileRegex.lastIndex;
            }
        }
        if (lastIndex < stack.length) {
            updatedStack += stack.substr(lastIndex);
        }
        return updatedStack;
    }
    /**
     * Attempts to remove commonly leaked PII
     * @param property The property which will be removed if it contains user data
     * @returns The new value for the property
     */
    function removePropertiesWithPossibleUserInfo(property) {
        // If for some reason it is undefined we skip it (this shouldn't be possible);
        if (!property) {
            return property;
        }
        const userDataRegexes = [
            { label: 'Google API Key', regex: /AIza[A-Za-z0-9_\\\-]{35}/ },
            { label: 'Slack Token', regex: /xox[pbar]\-[A-Za-z0-9]/ },
            { label: 'GitHub Token', regex: /(gh[psuro]_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})/ },
            { label: 'Generic Secret', regex: /(key|token|sig|secret|signature|password|passwd|pwd|android:value)[^a-zA-Z0-9]/i },
            { label: 'Email', regex: /@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/ } // Regex which matches @*.site
        ];
        // Check for common user data in the telemetry events
        for (const secretRegex of userDataRegexes) {
            if (secretRegex.regex.test(property)) {
                return `<REDACTED: ${secretRegex.label}>`;
            }
        }
        return property;
    }
    /**
     * Does a best possible effort to clean a data object from any possible PII.
     * @param data The data object to clean
     * @param paths Any additional patterns that should be removed from the data set
     * @returns A new object with the PII removed
     */
    function cleanData(data, cleanUpPatterns) {
        return (0, objects_1.cloneAndChange)(data, value => {
            // If it's a trusted value it means it's okay to skip cleaning so we don't clean it
            if (value instanceof TelemetryTrustedValue || Object.hasOwnProperty.call(value, 'isTrustedTelemetryValue')) {
                return value.value;
            }
            // We only know how to clean strings
            if (typeof value === 'string') {
                let updatedProperty = value.replaceAll('%20', ' ');
                // First we anonymize any possible file paths
                updatedProperty = anonymizeFilePaths(updatedProperty, cleanUpPatterns);
                // Then we do a simple regex replace with the defined patterns
                for (const regexp of cleanUpPatterns) {
                    updatedProperty = updatedProperty.replace(regexp, '');
                }
                // Lastly, remove commonly leaked PII
                updatedProperty = removePropertiesWithPossibleUserInfo(updatedProperty);
                return updatedProperty;
            }
            return undefined;
        });
    }
    exports.cleanData = cleanData;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3RlbGVtZXRyeS9jb21tb24vdGVsZW1ldHJ5VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHOzs7O09BSUc7SUFDSCxNQUFhLHFCQUFxQjtRQUdqQyxZQUE0QixLQUFRO1lBQVIsVUFBSyxHQUFMLEtBQUssQ0FBRztZQUZwQywwR0FBMEc7WUFDMUYsNEJBQXVCLEdBQUcsSUFBSSxDQUFDO1FBQ1AsQ0FBQztLQUN6QztJQUpELHNEQUlDO0lBRUQsTUFBYSx5QkFBeUI7UUFBdEM7WUFFVSxtQkFBYywrQkFBdUI7WUFDckMsY0FBUyxHQUFHLHFCQUFxQixDQUFDO1lBQ2xDLGNBQVMsR0FBRyxxQkFBcUIsQ0FBQztZQUNsQyxVQUFLLEdBQUcsaUJBQWlCLENBQUM7WUFDMUIscUJBQWdCLEdBQUcsNEJBQTRCLENBQUM7WUFDaEQsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBTXJDLENBQUM7UUFMQSxTQUFTLEtBQUssQ0FBQztRQUNmLFVBQVUsS0FBSyxDQUFDO1FBQ2hCLGNBQWMsS0FBSyxDQUFDO1FBQ3BCLGVBQWUsS0FBSyxDQUFDO1FBQ3JCLHFCQUFxQixLQUFLLENBQUM7S0FDM0I7SUFiRCw4REFhQztJQUVZLFFBQUEsb0JBQW9CLEdBQUcsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO0lBRXBFLE1BQWEsNEJBQTRCO1FBR3hDLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBNkIsRUFBRSxVQUFrQixFQUFFLEtBQXNCO1lBQ3hGLE9BQU87UUFDUixDQUFDO1FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUE2QixFQUFFLGVBQXVCLEVBQUUsS0FBc0I7WUFDbEcsT0FBTztRQUNSLENBQUM7S0FDRDtJQVZELG9FQVVDO0lBRVksUUFBQSxjQUFjLEdB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
//# sourceURL=../../../vs/platform/telemetry/common/telemetryUtils.js
})
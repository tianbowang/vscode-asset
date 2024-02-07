/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation"], function (require, exports, types, uri_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLanguageTagSettingPlainKey = exports.merge = exports.getConfigurationValue = exports.removeFromValueTree = exports.addToValueTree = exports.toValuesTree = exports.isConfigured = exports.ConfigurationTargetToString = exports.ConfigurationTarget = exports.isConfigurationUpdateOverrides = exports.isConfigurationOverrides = exports.IConfigurationService = void 0;
    exports.IConfigurationService = (0, instantiation_1.createDecorator)('configurationService');
    function isConfigurationOverrides(thing) {
        return thing
            && typeof thing === 'object'
            && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === 'string')
            && (!thing.resource || thing.resource instanceof uri_1.URI);
    }
    exports.isConfigurationOverrides = isConfigurationOverrides;
    function isConfigurationUpdateOverrides(thing) {
        return thing
            && typeof thing === 'object'
            && (!thing.overrideIdentifiers || Array.isArray(thing.overrideIdentifiers))
            && !thing.overrideIdentifier
            && (!thing.resource || thing.resource instanceof uri_1.URI);
    }
    exports.isConfigurationUpdateOverrides = isConfigurationUpdateOverrides;
    var ConfigurationTarget;
    (function (ConfigurationTarget) {
        ConfigurationTarget[ConfigurationTarget["APPLICATION"] = 1] = "APPLICATION";
        ConfigurationTarget[ConfigurationTarget["USER"] = 2] = "USER";
        ConfigurationTarget[ConfigurationTarget["USER_LOCAL"] = 3] = "USER_LOCAL";
        ConfigurationTarget[ConfigurationTarget["USER_REMOTE"] = 4] = "USER_REMOTE";
        ConfigurationTarget[ConfigurationTarget["WORKSPACE"] = 5] = "WORKSPACE";
        ConfigurationTarget[ConfigurationTarget["WORKSPACE_FOLDER"] = 6] = "WORKSPACE_FOLDER";
        ConfigurationTarget[ConfigurationTarget["DEFAULT"] = 7] = "DEFAULT";
        ConfigurationTarget[ConfigurationTarget["MEMORY"] = 8] = "MEMORY";
    })(ConfigurationTarget || (exports.ConfigurationTarget = ConfigurationTarget = {}));
    function ConfigurationTargetToString(configurationTarget) {
        switch (configurationTarget) {
            case 1 /* ConfigurationTarget.APPLICATION */: return 'APPLICATION';
            case 2 /* ConfigurationTarget.USER */: return 'USER';
            case 3 /* ConfigurationTarget.USER_LOCAL */: return 'USER_LOCAL';
            case 4 /* ConfigurationTarget.USER_REMOTE */: return 'USER_REMOTE';
            case 5 /* ConfigurationTarget.WORKSPACE */: return 'WORKSPACE';
            case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */: return 'WORKSPACE_FOLDER';
            case 7 /* ConfigurationTarget.DEFAULT */: return 'DEFAULT';
            case 8 /* ConfigurationTarget.MEMORY */: return 'MEMORY';
        }
    }
    exports.ConfigurationTargetToString = ConfigurationTargetToString;
    function isConfigured(configValue) {
        return configValue.applicationValue !== undefined ||
            configValue.userValue !== undefined ||
            configValue.userLocalValue !== undefined ||
            configValue.userRemoteValue !== undefined ||
            configValue.workspaceValue !== undefined ||
            configValue.workspaceFolderValue !== undefined;
    }
    exports.isConfigured = isConfigured;
    function toValuesTree(properties, conflictReporter) {
        const root = Object.create(null);
        for (const key in properties) {
            addToValueTree(root, key, properties[key], conflictReporter);
        }
        return root;
    }
    exports.toValuesTree = toValuesTree;
    function addToValueTree(settingsTreeRoot, key, value, conflictReporter) {
        const segments = key.split('.');
        const last = segments.pop();
        let curr = settingsTreeRoot;
        for (let i = 0; i < segments.length; i++) {
            const s = segments[i];
            let obj = curr[s];
            switch (typeof obj) {
                case 'undefined':
                    obj = curr[s] = Object.create(null);
                    break;
                case 'object':
                    break;
                default:
                    conflictReporter(`Ignoring ${key} as ${segments.slice(0, i + 1).join('.')} is ${JSON.stringify(obj)}`);
                    return;
            }
            curr = obj;
        }
        if (typeof curr === 'object' && curr !== null) {
            try {
                curr[last] = value; // workaround https://github.com/microsoft/vscode/issues/13606
            }
            catch (e) {
                conflictReporter(`Ignoring ${key} as ${segments.join('.')} is ${JSON.stringify(curr)}`);
            }
        }
        else {
            conflictReporter(`Ignoring ${key} as ${segments.join('.')} is ${JSON.stringify(curr)}`);
        }
    }
    exports.addToValueTree = addToValueTree;
    function removeFromValueTree(valueTree, key) {
        const segments = key.split('.');
        doRemoveFromValueTree(valueTree, segments);
    }
    exports.removeFromValueTree = removeFromValueTree;
    function doRemoveFromValueTree(valueTree, segments) {
        const first = segments.shift();
        if (segments.length === 0) {
            // Reached last segment
            delete valueTree[first];
            return;
        }
        if (Object.keys(valueTree).indexOf(first) !== -1) {
            const value = valueTree[first];
            if (typeof value === 'object' && !Array.isArray(value)) {
                doRemoveFromValueTree(value, segments);
                if (Object.keys(value).length === 0) {
                    delete valueTree[first];
                }
            }
        }
    }
    /**
     * A helper function to get the configuration value with a specific settings path (e.g. config.some.setting)
     */
    function getConfigurationValue(config, settingPath, defaultValue) {
        function accessSetting(config, path) {
            let current = config;
            for (const component of path) {
                if (typeof current !== 'object' || current === null) {
                    return undefined;
                }
                current = current[component];
            }
            return current;
        }
        const path = settingPath.split('.');
        const result = accessSetting(config, path);
        return typeof result === 'undefined' ? defaultValue : result;
    }
    exports.getConfigurationValue = getConfigurationValue;
    function merge(base, add, overwrite) {
        Object.keys(add).forEach(key => {
            if (key !== '__proto__') {
                if (key in base) {
                    if (types.isObject(base[key]) && types.isObject(add[key])) {
                        merge(base[key], add[key], overwrite);
                    }
                    else if (overwrite) {
                        base[key] = add[key];
                    }
                }
                else {
                    base[key] = add[key];
                }
            }
        });
    }
    exports.merge = merge;
    function getLanguageTagSettingPlainKey(settingKey) {
        return settingKey.replace(/[\[\]]/g, '');
    }
    exports.getLanguageTagSettingPlainKey = getLanguageTagSettingPlainKey;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vY29uZmlndXJhdGlvbi9jb21tb24vY29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRbkYsUUFBQSxxQkFBcUIsR0FBRyxJQUFBLCtCQUFlLEVBQXdCLHNCQUFzQixDQUFDLENBQUM7SUFFcEcsU0FBZ0Isd0JBQXdCLENBQUMsS0FBVTtRQUNsRCxPQUFPLEtBQUs7ZUFDUixPQUFPLEtBQUssS0FBSyxRQUFRO2VBQ3pCLENBQUMsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLElBQUksT0FBTyxLQUFLLENBQUMsa0JBQWtCLEtBQUssUUFBUSxDQUFDO2VBQzNFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLFlBQVksU0FBRyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUxELDREQUtDO0lBT0QsU0FBZ0IsOEJBQThCLENBQUMsS0FBVTtRQUN4RCxPQUFPLEtBQUs7ZUFDUixPQUFPLEtBQUssS0FBSyxRQUFRO2VBQ3pCLENBQUMsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztlQUN4RSxDQUFDLEtBQUssQ0FBQyxrQkFBa0I7ZUFDekIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVEsWUFBWSxTQUFHLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBTkQsd0VBTUM7SUFJRCxJQUFrQixtQkFTakI7SUFURCxXQUFrQixtQkFBbUI7UUFDcEMsMkVBQWUsQ0FBQTtRQUNmLDZEQUFJLENBQUE7UUFDSix5RUFBVSxDQUFBO1FBQ1YsMkVBQVcsQ0FBQTtRQUNYLHVFQUFTLENBQUE7UUFDVCxxRkFBZ0Is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
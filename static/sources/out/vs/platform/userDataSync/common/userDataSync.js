/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/types", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/instantiation", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform"], function (require, exports, arrays_1, types_1, nls_1, configurationRegistry_1, extensionManagement_1, instantiation_1, jsonContributionRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PREVIEW_DIR_NAME = exports.USER_DATA_SYNC_SCHEME = exports.USER_DATA_SYNC_LOG_ID = exports.IUserDataSyncLogService = exports.IUserDataSyncUtilService = exports.IUserDataAutoSyncService = exports.IUserDataSyncResourceProviderService = exports.IUserDataSyncService = exports.IUserDataSyncEnablementService = exports.getEnablementKey = exports.SYNC_SERVICE_URL_TYPE = exports.MergeState = exports.Change = exports.SyncStatus = exports.UserDataAutoSyncError = exports.UserDataSyncStoreError = exports.UserDataSyncError = exports.UserDataSyncErrorCode = exports.createSyncHeaders = exports.HEADER_EXECUTION_ID = exports.HEADER_OPERATION_ID = exports.IUserDataSyncLocalStoreService = exports.IUserDataSyncStoreService = exports.IUserDataSyncStoreManagementService = exports.getLastSyncResourceUri = exports.getPathSegments = exports.ALL_SYNC_RESOURCES = exports.SyncResource = exports.isAuthenticationProvider = exports.registerConfiguration = exports.CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM = exports.USER_DATA_SYNC_CONFIGURATION_SCOPE = exports.getDefaultIgnoredSettings = exports.getDisallowedIgnoredSettings = void 0;
    function getDisallowedIgnoredSettings() {
        const allSettings = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
        return Object.keys(allSettings).filter(setting => !!allSettings[setting].disallowSyncIgnore);
    }
    exports.getDisallowedIgnoredSettings = getDisallowedIgnoredSettings;
    function getDefaultIgnoredSettings() {
        const allSettings = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
        const ignoreSyncSettings = Object.keys(allSettings).filter(setting => !!allSettings[setting].ignoreSync);
        const machineSettings = Object.keys(allSettings).filter(setting => allSettings[setting].scope === 2 /* ConfigurationScope.MACHINE */ || allSettings[setting].scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */);
        const disallowedSettings = getDisallowedIgnoredSettings();
        return (0, arrays_1.distinct)([...ignoreSyncSettings, ...machineSettings, ...disallowedSettings]);
    }
    exports.getDefaultIgnoredSettings = getDefaultIgnoredSettings;
    exports.USER_DATA_SYNC_CONFIGURATION_SCOPE = 'settingsSync';
    exports.CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM = 'settingsSync.keybindingsPerPlatform';
    function registerConfiguration() {
        const ignoredSettingsSchemaId = 'vscode://schemas/ignoredSettings';
        const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        configurationRegistry.registerConfiguration({
            id: 'settingsSync',
            order: 30,
            title: (0, nls_1.localize)('settings sync', "Settings Sync"),
            type: 'object',
            properties: {
                [exports.CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM]: {
                    type: 'boolean',
                    description: (0, nls_1.localize)('settingsSync.keybindingsPerPlatform', "Synchronize keybindings for each platform."),
                    default: true,
                    scope: 1 /* ConfigurationScope.APPLICATION */,
                    tags: ['sync', 'usesOnlineServices']
                },
                'settingsSync.ignoredExtensions': {
                    'type': 'array',
                    markdownDescription: (0, nls_1.localize)('settingsSync.ignoredExtensions', "List of extensions to be ignored while synchronizing. The identifier of an extension is always `${publisher}.${name}`. For example: `vscode.csharp`."),
                    items: [{
                            type: 'string',
                            pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN,
                            errorMessage: (0, nls_1.localize)('app.extension.identifier.errorMessage', "Expected format '${publisher}.${name}'. Example: 'vscode.csharp'.")
                        }],
                    'default': [],
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    uniqueItems: true,
                    disallowSyncIgnore: true,
                    tags: ['sync', 'usesOnlineServices']
                },
                'settingsSync.ignoredSettings': {
                    'type': 'array',
                    description: (0, nls_1.localize)('settingsSync.ignoredSettings', "Configure settings to be ignored while synchronizing."),
                    'default': [],
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    $ref: ignoredSettingsSchemaId,
                    additionalProperties: true,
                    uniqueItems: true,
                    disallowSyncIgnore: true,
                    tags: ['sync', 'usesOnlineServices']
                }
            }
        });
        const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        const registerIgnoredSettingsSchema = () => {
            const disallowedIgnoredSettings = getDisallowedIgnoredSettings();
            const defaultIgnoredSettings = getDefaultIgnoredSettings();
            const settings = Object.keys(configurationRegistry_1.allSettings.properties).filter(setting => !defaultIgnoredSettings.includes(setting));
            const ignoredSettings = defaultIgnoredSettings.filter(setting => !disallowedIgnoredSettings.includes(setting));
            const ignoredSettingsSchema = {
                items: {
                    type: 'string',
                    enum: [...settings, ...ignoredSettings.map(setting => `-${setting}`)]
                },
            };
            jsonRegistry.registerSchema(ignoredSettingsSchemaId, ignoredSettingsSchema);
        };
        return configurationRegistry.onDidUpdateConfiguration(() => registerIgnoredSettingsSchema());
    }
    exports.registerConfiguration = registerConfiguration;
    function isAuthenticationProvider(thing) {
        return thing
            && (0, types_1.isObject)(thing)
            && (0, types_1.isString)(thing.id)
            && Array.isArray(thing.scopes);
    }
    exports.isAuthenticationProvider = isAuthenticationProvider;
    var SyncResource;
    (function (SyncResource) {
        SyncResource["Settings"] = "settings";
        SyncResource["Keybindings"] = "keybindings";
        SyncResource["Snippets"] = "snippets";
        SyncResource["Tasks"] = "tasks";
        SyncResource["Extensions"] = "extensions";
        SyncResource["GlobalState"] = "globalState";
        SyncResource["Profiles"] = "profiles";
        SyncResource["WorkspaceState"] = "workspaceState";
    })(SyncResource || (exports.SyncResource = SyncResource = {}));
    exports.ALL_SYNC_RESOURCES = ["settings" /* SyncResource.Settings */, "keybindings" /* SyncResource.Keybindings */, "snippets" /* SyncResource.Snippets */, "tasks" /* SyncResource.Tasks */, "extensions" /* SyncResource.Extensions */, "globalState" /* SyncResource.GlobalState */, "profiles" /* SyncResource.Profiles */];
    function getPathSegments(collection, ...paths) {
        return collection ? [collection, ...paths] : paths;
    }
    exports.getPathSegments = getPathSegments;
    function getLastSyncResourceUri(collection, syncResource, environmentService, extUri) {
        return extUri.joinPath(environmentService.userDataSyncHome, ...getPathSegments(collection, syncResource, `lastSync${syncResource}.json`));
    }
    exports.getLastSyncResourceUri = getLastSyncResourceUri;
    exports.IUserDataSyncStoreManagementService = (0, instantiation_1.createDecorator)('IUserDataSyncStoreManagementService');
    exports.IUserDataSyncStoreService = (0, instantiation_1.createDecorator)('IUserDataSyncStoreService');
    exports.IUserDataSyncLocalStoreService = (0, instantiation_1.createDecorator)('IUserDataSyncLocalStoreService');
    //#endregion
    // #region User Data Sync Headers
    exports.HEADER_OPERATION_ID = 'x-operation-id';
    exports.HEADER_EXECUTION_ID = 'X-Execution-Id';
    function createSyncHeaders(executionId) {
        const headers = {};
        headers[exports.HEADER_EXECUTION_ID] = executionId;
        return headers;
    }
    exports.createSyncHeaders = createSyncHeaders;
    //#endregion
    // #region User Data Sync Error
    var UserDataSyncErrorCode;
    (function (UserDataSyncErrorCode) {
        // Client Errors (>= 400 )
        UserDataSyncErrorCode["Unauthorized"] = "Unauthorized";
        UserDataSyncErrorCode["Forbidden"] = "Forbidden";
        UserDataSyncErrorCode["NotFound"] = "NotFound";
        UserDataSyncErrorCode["MethodNotFound"] = "MethodNotFound";
        UserDataSyncErrorCode["Conflict"] = "Conflict";
        UserDataSyncErrorCode["Gone"] = "Gone";
        UserDataSyncErrorCode["PreconditionFailed"] = "PreconditionFailed";
        UserDataSyncErrorCode["TooLarge"] = "TooLarge";
        UserDataSyncErrorCode["UpgradeRequired"] = "UpgradeRequired";
        UserDataSyncErrorCode["PreconditionRequired"] = "PreconditionRequired";
        UserDataSyncErrorCode["TooManyRequests"] = "RemoteTooManyRequests";
        UserDataSyncErrorCode["TooManyRequestsAndRetryAfter"] = "TooManyRequestsAndRetryAfter";
        // Local Errors
        UserDataSyncErrorCode["RequestFailed"] = "RequestFailed";
        UserDataSyncErrorCode["RequestCanceled"] = "RequestCanceled";
        UserDataSyncErrorCode["RequestTimeout"] = "RequestTimeout";
        UserDataSyncErrorCode["RequestProtocolNotSupported"] = "RequestProtocolNotSupported";
        UserDataSyncErrorCode["RequestPathNotEscaped"] = "RequestPathNotEscaped";
        UserDataSyncErrorCode["RequestHeadersNotObject"] = "RequestHeadersNotObject";
        UserDataSyncErrorCode["NoCollection"] = "NoCollection";
        UserDataSyncErrorCode["NoRef"] = "NoRef";
        UserDataSyncErrorCode["EmptyResponse"] = "EmptyResponse";
        UserDataSyncErrorCode["TurnedOff"] = "TurnedOff";
        UserDataSyncErrorCode["SessionExpired"] = "SessionExpired";
        UserDataSyncErrorCode["ServiceChanged"] = "ServiceChanged";
        UserDataSyncErrorCode["DefaultServiceChanged"] = "DefaultServiceChanged";
        UserDataSyncErrorCode["LocalTooManyProfiles"] = "LocalTooManyProfiles";
        UserDataSyncErrorCode["LocalTooManyRequests"] = "LocalTooManyRequests";
        UserDataSyncErrorCode["LocalPreconditionFailed"] = "LocalPreconditionFailed";
        UserDataSyncErrorCode["LocalInvalidContent"] = "LocalInvalidContent";
        UserDataSyncErrorCode["LocalError"] = "LocalError";
        UserDataSyncErrorCode["IncompatibleLocalContent"] = "IncompatibleLocalContent";
        UserDataSyncErrorCode["IncompatibleRemoteContent"] = "IncompatibleRemoteContent";
        UserDataSyncErrorCode["Unknown"] = "Unknown";
    })(UserDataSyncErrorCode || (exports.UserDataSyncErrorCode = UserDataSyncErrorCode = {}));
    class UserDataSyncError extends Error {
        constructor(message, code, resource, operationId) {
            super(message);
            this.code = code;
            this.resource = resource;
            this.operationId = operationId;
            this.name = `${this.code} (UserDataSyncError) syncResource:${this.resource || 'unknown'} operationId:${this.operationId || 'unknown'}`;
        }
    }
    exports.UserDataSyncError = UserDataSyncError;
    class UserDataSyncStoreError extends UserDataSyncError {
        constructor(message, url, code, serverCode, operationId) {
            super(message, code, undefined, operationId);
            this.url = url;
            this.serverCode = serverCode;
        }
    }
    exports.UserDataSyncStoreError = UserDataSyncStoreError;
    class UserDataAutoSyncError extends UserDataSyncError {
        constructor(message, code) {
            super(message, code);
        }
    }
    exports.UserDataAutoSyncError = UserDataAutoSyncError;
    (function (UserDataSyncError) {
        function toUserDataSyncError(error) {
            if (error instanceof UserDataSyncError) {
                return error;
            }
            const match = /^(.+) \(UserDataSyncError\) syncResource:(.+) operationId:(.+)$/.exec(error.name);
            if (match && match[1]) {
                const syncResource = match[2] === 'unknown' ? undefined : match[2];
                const operationId = match[3] === 'unknown' ? undefined : match[3];
                return new UserDataSyncError(error.message, match[1], syncResource, operationId);
            }
            return new UserDataSyncError(error.message, "Unknown" /* UserDataSyncErrorCode.Unknown */);
        }
        UserDataSyncError.toUserDataSyncError = toUserDataSyncError;
    })(UserDataSyncError || (exports.UserDataSyncError = UserDataSyncError = {}));
    var SyncStatus;
    (function (SyncStatus) {
        SyncStatus["Uninitialized"] = "uninitialized";
        SyncStatus["Idle"] = "idle";
        SyncStatus["Syncing"] = "syncing";
        SyncStatus["HasConflicts"] = "hasConflicts";
    })(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
    var Change;
    (function (Change) {
        Change[Change["None"] = 0] = "None";
        Change[Change["Added"] = 1] = "Added";
        Change[Change["Modified"] = 2] = "Modified";
        Change[Change["Deleted"] = 3] = "Deleted";
    })(Change || (exports.Change = Change = {}));
    var MergeState;
    (function (MergeState) {
        MergeState["Preview"] = "preview";
        MergeState["Conflict"] = "conflict";
        MergeState["Accepted"] = "accepted";
    })(MergeState || (exports.MergeState = MergeState = {}));
    //#endregion
    // #region keys synced only in web
    exports.SYNC_SERVICE_URL_TYPE = 'sync.store.url.type';
    function getEnablementKey(resource) { return `sync.enable.${resource}`; }
    exports.getEnablementKey = getEnablementKey;
    // #endregion
    // #region User Data Sync Services
    exports.IUserDataSyncEnablementService = (0, instantiation_1.createDecorator)('IUserDataSyncEnablementService');
    exports.IUserDataSyncService = (0, instantiation_1.createDecorator)('IUserDataSyncService');
    exports.IUserDataSyncResourceProviderService = (0, instantiation_1.createDecorator)('IUserDataSyncResourceProviderService');
    exports.IUserDataAutoSyncService = (0, instantiation_1.createDecorator)('IUserDataAutoSyncService');
    exports.IUserDataSyncUtilService = (0, instantiation_1.createDecorator)('IUserDataSyncUtilService');
    exports.IUserDataSyncLogService = (0, instantiation_1.createDecorator)('IUserDataSyncLogService');
    //#endregion
    exports.USER_DATA_SYNC_LOG_ID = 'userDataSync';
    exports.USER_DATA_SYNC_SCHEME = 'vscode-userdata-sync';
    exports.PREVIEW_DIR_NAME = 'preview';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL3VzZXJEYXRhU3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3QmhHLFNBQWdCLDRCQUE0QjtRQUMzQyxNQUFNLFdBQVcsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQXVCLENBQUMsYUFBYSxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUM1SCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFIRCxvRUFHQztJQUVELFNBQWdCLHlCQUF5QjtRQUN4QyxNQUFNLFdBQVcsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQXVCLENBQUMsYUFBYSxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUM1SCxNQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RyxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLHVDQUErQixJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLG1EQUEyQyxDQUFDLENBQUM7UUFDdk0sTUFBTSxrQkFBa0IsR0FBRyw0QkFB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
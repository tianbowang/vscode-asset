(function anonymous() { /*---------------------------------------------------------------------------------------------
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
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/platform", "vs/base/common/objects"], function (require, exports, nls_1, configurationRegistry_1, platform_1, workspace_1, configuration_1, lifecycle_1, event_1, remoteAgentService_1, platform_2, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DynamicWorkbenchConfigurationWorkbenchContribution = exports.ConfigurationMigrationWorkbenchContribution = exports.Extensions = exports.problemsConfigurationNodeBase = exports.securityConfigurationNodeBase = exports.workbenchConfigurationNodeBase = exports.applicationConfigurationNodeBase = void 0;
    exports.applicationConfigurationNodeBase = Object.freeze({
        'id': 'application',
        'order': 100,
        'title': (0, nls_1.localize)('applicationConfigurationTitle', "Application"),
        'type': 'object'
    });
    exports.workbenchConfigurationNodeBase = Object.freeze({
        'id': 'workbench',
        'order': 7,
        'title': (0, nls_1.localize)('workbenchConfigurationTitle', "Workbench"),
        'type': 'object',
    });
    exports.securityConfigurationNodeBase = Object.freeze({
        'id': 'security',
        'scope': 1 /* ConfigurationScope.APPLICATION */,
        'title': (0, nls_1.localize)('securityConfigurationTitle', "Security"),
        'type': 'object',
        'order': 7
    });
    exports.problemsConfigurationNodeBase = Object.freeze({
        'id': 'problems',
        'title': (0, nls_1.localize)('problemsConfigurationTitle', "Problems"),
        'type': 'object',
        'order': 101
    });
    exports.Extensions = {
        ConfigurationMigration: 'base.contributions.configuration.migration'
    };
    class ConfigurationMigrationRegistry {
        constructor() {
            this.migrations = [];
            this._onDidRegisterConfigurationMigrations = new event_1.Emitter();
            this.onDidRegisterConfigurationMigration = this._onDidRegisterConfigurationMigrations.event;
        }
        registerConfigurationMigrations(configurationMigrations) {
            this.migrations.push(...configurationMigrations);
        }
    }
    const configurationMigrationRegistry = new ConfigurationMigrationRegistry();
    platform_1.Registry.add(exports.Extensions.ConfigurationMigration, configurationMigrationRegistry);
    let ConfigurationMigrationWorkbenchContribution = class ConfigurationMigrationWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(configurationService, workspaceService) {
            super();
            this.configurationService = configurationService;
            this.workspaceService = workspaceService;
            this._register(this.workspaceService.onDidChangeWorkspaceFolders(async (e) => {
                for (const folder of e.added) {
                    await this.migrateConfigurationsForFolder(folder, configurationMigrationRegistry.migrations);
                }
            }));
            this.migrateConfigurations(configurationMigrationRegistry.migrations);
            this._register(configurationMigrationRegistry.onDidRegisterConfigurationMigration(migration => this.migrateConfigurations(migration)));
        }
        async migrateConfigurations(migrations) {
            await this.migrateConfigurationsForFolder(undefined, migrations);
            for (const folder of this.workspaceService.getWorkspace().folders) {
                await this.migrateConfigurationsForFolder(folder, migrations);
            }
        }
        async migrateConfigurationsForFolder(folder, migrations) {
            await Promise.all([migrations.map(migration => this.migrateConfigurationsForFolderAndOverride(migration, folder?.uri))]);
        }
        async migrateConfigurationsForFolderAndOverride(migration, resource) {
            const inspectData = this.configurationService.inspect(migration.key, { resource });
            const targetPairs = this.workspaceService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ ? [
                ['user', 2 /* ConfigurationTarget.USER */],
                ['userLocal', 3 /* ConfigurationTarget.USER_LOCAL */],
                ['userRemote', 4 /* ConfigurationTarget.USER_REMOTE */],
                ['workspace', 5 /* ConfigurationTarget.WORKSPACE */],
                ['workspaceFolder', 6 /* ConfigurationTarget.WORKSPACE_FOLDER */],
            ] : [
                ['user', 2 /* ConfigurationTarget.USER */],
                ['userLocal', 3 /* ConfigurationTarget.USER_LOCAL */],
                ['userRemote', 4 /* ConfigurationTarget.USER_REMOTE */],
                ['workspace', 5 /* ConfigurationTarget.WORKSPACE */],
            ];
            for (const [dataKey, target] of targetPairs) {
                const migrationValues = [];
                // Collect migrations for language overrides
                for (const overrideIdentifier of inspectData.overrideIdentifiers ?? []) {
                    const keyValuePairs = await this.runMigration(migration, { resource, overrideIdentifier }, dataKey);
                    for (const keyValuePair of keyValuePairs ?? []) {
                        let keyValueAndOverridesPair = migrationValues.find(([[k, v]]) => k === keyValuePair[0] && (0, objects_1.equals)(v.value, keyValuePair[1].value));
                        if (!keyValueAndOverridesPair) {
                            migrationValues.push(keyValueAndOverridesPair = [keyValuePair, []]);
                        }
                        keyValueAndOverridesPair[1].push(overrideIdentifier);
                    }
                }
                // Collect migrations
                const keyValuePairs = await this.runMigration(migration, { resource }, dataKey, inspectData);
                for (const keyValuePair of keyValuePairs ?? []) {
                    migrationValues.push([keyValuePair, []]);
                }
                if (migrationValues.length) {
                    // apply migrations
                    await Promise.allSettled(migrationValues.map(async ([[key, value], overrideIdentifiers]) => this.configurationService.updateValue(key, value.value, { resource, overrideIdentifiers }, target)));
                }
            }
        }
        async runMigration(migration, overrides, dataKey, data) {
            const valueAccessor = (key) => getInspectValue(this.configurationService.inspect(key, overrides));
            const getInspectValue = (data) => {
                const inspectValue = data[dataKey];
                return overrides.overrideIdentifier ? inspectValue?.override : inspectValue?.value;
            };
            const value = data ? getInspectValue(data) : valueAccessor(migration.key);
            if (value === undefined) {
                return undefined;
            }
            const result = await migration.migrateFn(value, valueAccessor);
            return Array.isArray(result) ? result : [[migration.key, result]];
        }
    };
    exports.ConfigurationMigrationWorkbenchContribution = ConfigurationMigrationWorkbenchContribution;
    exports.ConfigurationMigrationWorkbenchContribution = ConfigurationMigrationWorkbenchContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], ConfigurationMigrationWorkbenchContribution);
    let DynamicWorkbenchConfigurationWorkbenchContribution = class DynamicWorkbenchConfigurationWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(remoteAgentService) {
            super();
            (async () => {
                if (!platform_2.isWindows) {
                    const remoteEnvironment = await remoteAgentService.getEnvironment();
                    if (remoteEnvironment?.os !== 1 /* OperatingSystem.Windows */) {
                        return;
                    }
                }
                // Windows: UNC allow list security configuration
                const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
                registry.registerConfiguration({
                    ...exports.securityConfigurationNodeBase,
                    'properties': {
                        'security.allowedUNCHosts': {
                            'type': 'array',
                            'items': {
                                'type': 'string',
                                'pattern': '^[^\\\\]+$',
                                'patternErrorMessage': (0, nls_1.localize)('security.allowedUNCHosts.patternErrorMessage', 'UNC host names must not contain backslashes.')
                            },
                            'default': [],
                            'markdownDescription': (0, nls_1.localize)('security.allowedUNCHosts', 'A set of UNC host names (without leading or trailing backslash, for example `192.168.0.1` or `my-server`) to allow without user confirmation. If a UNC host is being accessed that is not allowed via this setting or has not been acknowledged via user confirmation, an error will occur and the operation stopped. A restart is required when changing this setting. Find out more about this setting at https://aka.ms/vscode-windows-unc.'),
                            'scope': 2 /* ConfigurationScope.MACHINE */
                        },
                        'security.restrictUNCAccess': {
                            'type': 'boolean',
                            'default': true,
                            'markdownDescription': (0, nls_1.localize)('security.restrictUNCAccess', 'If enabled, only allows access to UNC host names that are allowed by the `#security.allowedUNCHosts#` setting or after user confirmation. Find out more about this setting at https://aka.ms/vscode-windows-unc.'),
                            'scope': 2 /* ConfigurationScope.MACHINE */
                        }
                    }
                });
            })();
        }
    };
    exports.DynamicWorkbenchConfigurationWorkbenchContribution = DynamicWorkbenchConfigurationWorkbenchContribution;
    exports.DynamicWorkbenchConfigurationWorkbenchContribution = DynamicWorkbenchConfigurationWorkbenchContribution = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService)
    ], DynamicWorkbenchConfigurationWorkbenchContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWVuRixRQUFBLGdDQUFnQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQXFCO1FBQ2pGLElBQUksRUFBRSxhQUFhO1FBQ25CLE9BQU8sRUFBRSxHQUFHO1FBQ1osT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLGFBQWEsQ0FBQztRQUNqRSxNQUFNLEVBQUUsUUFBUTtLQUNoQixDQUFDLENBQUM7SUFFVSxRQUFBLDhCQUE4QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQXFCO1FBQy9FLElBQUksRUFBRSxXQUFXO1FBQ2pCLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLDZCQUE2QixFQUFFLFdBQVcsQ0FBQztRQUM3RCxNQUFNLEVBQUUsUUFBUTtLQUNoQixDQUFDLENBQUM7SUFFVSxRQUFBLDZCQUE2QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQXFCO1FBQzlFLElBQUksRUFBRSxVQUFVO1FBQ2hCLE9BQU8sd0NBQWdDO1FBQ3ZDLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUM7UUFDM0QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsT0FBTyxFQUFFLENBQUM7S0FDVixDQUFDLENBQUM7SUFFVSxRQUFBLDZCQUE2QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQXFCO1FBQzlFLElBQUksRUFBRSxVQUFVO1FBQ2hCLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUM7UUFDM0QsTUFBTSxFQUFFLFFBQVE7UUFDaEIsT0FBTyxFQUFFLEdBQUc7S0FDWixDQUFDLENBQUM7SUFFVSxRQUFBLFVBQVUsR0FBRztRQUN6QixzQkFBc0IsRUFBRSw0Q0FBNEM7S0FDcEUsQ0FBQztJQVdGLE1BQU0sOEJBQThCO1FBQXBDO1lBRVUsZUFBVSxHQUE2QixFQUFFLENBQUM7WUFFbEMsMENBQXFDLEdBQUcsSUFBSSxlQUFPLEVBQTRCLENBQUM7WUFDeEYsd0NBQW1DLEdBQUcsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLEtBQUssQ0FBQztRQU1qRyxDQUFDO1FBSkEsK0JBQStCLENBQUMsdUJBQWlEO1lBQ2hGLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsdUJBQXVCLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBRUQ7SUFFRCxNQUFNLDhCQUE4QixHQUFHLElBQUksOEJBQThCLEVBQUUsQ0FBQztJQUM1RSxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBVSxDQUFDLHNCQUFzQixFQUFFLDhCQUE4QixDQUFDLENBQUM7SUFFekUsSUFBTSwyQ0FBMkMsR0FBakQsTUFBTSwyQ0FBNEMsU0FBUSxzQkFBVTtRQUUxRSxZQUN5QyxvQkFBMkMsRUFDeEMsZ0JBQTBDO1lBRXJGLEtBQUssRUFBRSxDQUFDO1lBSGdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDeEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUEwQjtZQUdyRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVFLEtBQUssTUFBTSxNQUFNLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUM5QixNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsOEJBQThCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzlGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLHFCQUFxQixDQUFDLDhCQUE4QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQUMsbUNBQW1DLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hJLENBQUM7UUFFTyxLQUFLLENBQUMscUJBQXFCLENBQUMsVUFBb0M7WUFDdkUsTUFBTSxJQUFJLENBQUMsOEJBQThCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2pFLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuRSxNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDL0QsQ0FBQztRQUNGLENBQUM7UUFFTyxLQUFLLENBQUMsOEJBQThCLENBQUMsTUFBb0MsRUFBRSxVQUFvQztZQUN0SCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUgsQ0FBQztRQUVPLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxTQUFpQyxFQUFFLFFBQWM7WUFDeEcsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUVuRixNQUFNLFdBQVcsR0FBNEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLHFDQUE2QixDQUFDLENBQUMsQ0FBQztnQkFDckosQ0FBQyxNQUFNLG1DQUEyQjtnQkFDbEMsQ0FBQyxXQUFXLHlDQUFpQztnQkFDN0MsQ0FBQyxZQUFZLDBDQUFrQztnQkFDL0MsQ0FBQyxXQUFXLHdDQUFnQztnQkFDNUMsQ0FBQyxpQkFBaUIsK0NBQXVDO2FBQ3pELENBQUMsQ0FBQyxDQUFDO2dCQUNILENBQUMsTUFBTSxtQ0FBMkI7Z0JBQ2xDLENBQUMsV0FBVyx5Q0FBaUM7Z0JBQzdDLENBQUMsWUFBWSwwQ0FBa0M7Z0JBQy9DLENBQUMsV0FBVyx3Q0FBZ0M7YUFDNUMsQ0FBQztZQUNGLEtBQUssTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDN0MsTUFBTSxlQUFlLEdBQStDLEVBQUUsQ0FBQztnQkFFdkUsNENBQTRDO2dCQUM1QyxLQUFLLE1BQU0sa0JBQWtCLElBQUksV0FBVyxDQUFDLG1CQUFtQixJQUFJLEVBQUUsRUFBRSxDQUFDO29CQUN4RSxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ3BHLEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxJQUFJLEVBQUUsRUFBRSxDQUFDO3dCQUNoRCxJQUFJLHdCQUF3QixHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBQSxnQkFBTSxFQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ25JLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDOzRCQUMvQixlQUFlLENBQUMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQ3JFLENBQUM7d0JBQ0Qsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ3RELENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxxQkFBcUI7Z0JBQ3JCLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQzdGLEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxJQUFJLEVBQUUsRUFBRSxDQUFDO29CQUNoRCxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLENBQUM7Z0JBRUQsSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzVCLG1CQUFtQjtvQkFDbkIsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsRUFBRSxFQUFFLENBQzFGLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZHLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBaUMsRUFBRSxTQUFrQyxFQUFFLE9BQXVDLEVBQUUsSUFBK0I7WUFDekssTUFBTSxhQUFhLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzFHLE1BQU0sZUFBZSxHQUFHLENBQUMsSUFBOEIsRUFBRSxFQUFFO2dCQUMxRCxNQUFNLFlBQVksR0FBZ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNoRixPQUFPLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQztZQUNwRixDQUFDLENBQUM7WUFDRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxRSxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDekIsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDL0QsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztLQUNELENBQUE7SUFwRlksa0dBQTJDOzBEQUEzQywyQ0FBMkM7UUFHckQsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLG9DQUF3QixDQUFBO09BSmQsMkNBQTJDLENBb0Z2RDtJQUVNLElBQU0sa0RBQWtELEdBQXhELE1BQU0sa0RBQW1ELFNBQVEsc0JBQVU7UUFFakYsWUFDc0Isa0JBQXVDO1lBRTVELEtBQUssRUFBRSxDQUFDO1lBRVIsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDWCxJQUFJLENBQUMsb0JBQVMsRUFBRSxDQUFDO29CQUNoQixNQUFNLGlCQUFpQixHQUFHLE1BQU0sa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3BFLElBQUksaUJBQWlCLEVBQUUsRUFBRSxvQ0FBNEIsRUFBRSxDQUFDO3dCQUN2RCxPQUFPO29CQUNSLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxpREFBaUQ7Z0JBQ2pELE1BQU0sUUFBUSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDNUYsUUFBUSxDQUFDLHFCQUFxQixDQUFDO29CQUM5QixHQUFHLHFDQUE2QjtvQkFDaEMsWUFBWSxFQUFFO3dCQUNiLDBCQUEwQixFQUFFOzRCQUMzQixNQUFNLEVBQUUsT0FBTzs0QkFDZixPQUFPLEVBQUU7Z0NBQ1IsTUFBTSxFQUFFLFFBQVE7Z0NBQ2hCLFNBQVMsRUFBRSxZQUFZO2dDQUN2QixxQkFBcUIsRUFBRSxJQUFBLGNBQVEsRUFBQyw4Q0FBOEMsRUFBRSw4Q0FBOEMsQ0FBQzs2QkFDL0g7NEJBQ0QsU0FBUyxFQUFFLEVBQUU7NEJBQ2IscUJBQXFCLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsZ2JBQWdiLENBQUM7NEJBQzdlLE9BQU8sb0NBQTRCO3lCQUNuQzt3QkFDRCw0QkFBNEIsRUFBRTs0QkFDN0IsTUFBTSxFQUFFLFNBQVM7NEJBQ2pCLFNBQVMsRUFBRSxJQUFJOzRCQUNmLHFCQUFxQixFQUFFLElBQUEsY0FBUSxFQUFDLDRCQUE0QixFQUFFLGtOQUFrTixDQUFDOzRCQUNqUixPQUFPLG9DQUE0Qjt5QkFDbkM7cUJBQ0Q7aUJBQ0QsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNOLENBQUM7S0FDRCxDQUFBO0lBekNZLGdIQUFrRDtpRUFBbEQsa0RBQWtEO1FBRzVELFdBQUEsd0NBQW1CLENBQUE7T0FIVCxrREFBa0QsQ0F5QzlEIn0=
//# sourceURL=../../../vs/workbench/common/configuration.js
})
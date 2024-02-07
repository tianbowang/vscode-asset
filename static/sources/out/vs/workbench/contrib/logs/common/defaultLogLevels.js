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
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files", "vs/workbench/services/configuration/common/jsonEditing", "vs/base/common/types", "vs/platform/environment/common/environmentService", "vs/platform/instantiation/common/extensions", "vs/base/common/json"], function (require, exports, log_1, instantiation_1, environmentService_1, files_1, jsonEditing_1, types_1, environmentService_2, extensions_1, json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IDefaultLogLevelsService = void 0;
    exports.IDefaultLogLevelsService = (0, instantiation_1.createDecorator)('IDefaultLogLevelsService');
    let DefaultLogLevelsService = class DefaultLogLevelsService {
        constructor(environmentService, fileService, jsonEditingService, logService, loggerService) {
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.jsonEditingService = jsonEditingService;
            this.logService = logService;
            this.loggerService = loggerService;
        }
        async getDefaultLogLevels() {
            const argvLogLevel = await this._parseLogLevelsFromArgv();
            return {
                default: argvLogLevel?.default ?? this._getDefaultLogLevelFromEnv(),
                extensions: argvLogLevel?.extensions ?? this._getExtensionsDefaultLogLevelsFromEnv()
            };
        }
        async setDefaultLogLevel(defaultLogLevel, extensionId) {
            const argvLogLevel = await this._parseLogLevelsFromArgv() ?? {};
            if (extensionId) {
                extensionId = extensionId.toLowerCase();
                const argvLogLevel = await this._parseLogLevelsFromArgv() ?? {};
                const currentDefaultLogLevel = this._getDefaultLogLevel(argvLogLevel, extensionId);
                argvLogLevel.extensions = argvLogLevel.extensions ?? [];
                const extension = argvLogLevel.extensions.find(([extension]) => extension === extensionId);
                if (extension) {
                    extension[1] = defaultLogLevel;
                }
                else {
                    argvLogLevel.extensions.push([extensionId, defaultLogLevel]);
                }
                await this._writeLogLevelsToArgv(argvLogLevel);
                const extensionLoggers = [...this.loggerService.getRegisteredLoggers()].filter(logger => logger.extensionId && logger.extensionId.toLowerCase() === extensionId);
                for (const { resource } of extensionLoggers) {
                    if (this.loggerService.getLogLevel(resource) === currentDefaultLogLevel) {
                        this.loggerService.setLogLevel(resource, defaultLogLevel);
                    }
                }
            }
            else {
                const currentLogLevel = this._getDefaultLogLevel(argvLogLevel);
                argvLogLevel.default = defaultLogLevel;
                await this._writeLogLevelsToArgv(argvLogLevel);
                if (this.loggerService.getLogLevel() === currentLogLevel) {
                    this.loggerService.setLogLevel(defaultLogLevel);
                }
            }
        }
        _getDefaultLogLevel(argvLogLevels, extension) {
            if (extension) {
                const extensionLogLevel = argvLogLevels.extensions?.find(([extensionId]) => extensionId === extension);
                if (extensionLogLevel) {
                    return extensionLogLevel[1];
                }
            }
            return argvLogLevels.default ?? (0, log_1.getLogLevel)(this.environmentService);
        }
        async _writeLogLevelsToArgv(logLevels) {
            const logLevelsValue = [];
            if (!(0, types_1.isUndefined)(logLevels.default)) {
                logLevelsValue.push((0, log_1.LogLevelToString)(logLevels.default));
            }
            for (const [extension, logLevel] of logLevels.extensions ?? []) {
                logLevelsValue.push(`${extension}=${(0, log_1.LogLevelToString)(logLevel)}`);
            }
            await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['log-level'], value: logLevelsValue.length ? logLevelsValue : undefined }], true);
        }
        async _parseLogLevelsFromArgv() {
            const result = { extensions: [] };
            const logLevels = await this._readLogLevelsFromArgv();
            for (const extensionLogLevel of logLevels) {
                const matches = environmentService_2.EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(extensionLogLevel);
                if (matches && matches[1] && matches[2]) {
                    const logLevel = (0, log_1.parseLogLevel)(matches[2]);
                    if (!(0, types_1.isUndefined)(logLevel)) {
                        result.extensions?.push([matches[1].toLowerCase(), logLevel]);
                    }
                }
                else {
                    const logLevel = (0, log_1.parseLogLevel)(extensionLogLevel);
                    if (!(0, types_1.isUndefined)(logLevel)) {
                        result.default = logLevel;
                    }
                }
            }
            return !(0, types_1.isUndefined)(result.default) || result.extensions?.length ? result : undefined;
        }
        async migrateLogLevels() {
            const logLevels = await this._readLogLevelsFromArgv();
            const regex = /^([^.]+\..+):(.+)$/;
            if (logLevels.some(extensionLogLevel => regex.test(extensionLogLevel))) {
                const argvLogLevel = await this._parseLogLevelsFromArgv();
                if (argvLogLevel) {
                    await this._writeLogLevelsToArgv(argvLogLevel);
                }
            }
        }
        async _readLogLevelsFromArgv() {
            try {
                const content = await this.fileService.readFile(this.environmentService.argvResource);
                const argv = (0, json_1.parse)(content.value.toString());
                return (0, types_1.isString)(argv['log-level']) ? [argv['log-level']] : Array.isArray(argv['log-level']) ? argv['log-level'] : [];
            }
            catch (error) {
                if ((0, files_1.toFileOperationResult)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
            }
            return [];
        }
        _getDefaultLogLevelFromEnv() {
            return (0, log_1.getLogLevel)(this.environmentService);
        }
        _getExtensionsDefaultLogLevelsFromEnv() {
            const result = [];
            for (const [extension, logLevelValue] of this.environmentService.extensionLogLevel ?? []) {
                const logLevel = (0, log_1.parseLogLevel)(logLevelValue);
                if (!(0, types_1.isUndefined)(logLevel)) {
                    result.push([extension, logLevel]);
                }
            }
            return result;
        }
    };
    DefaultLogLevelsService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, files_1.IFileService),
        __param(2, jsonEditing_1.IJSONEditingService),
        __param(3, log_1.ILogService),
        __param(4, log_1.ILoggerService)
    ], DefaultLogLevelsService);
    (0, extensions_1.registerSingleton)(exports.IDefaultLogLevelsService, DefaultLogLevelsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdExvZ0xldmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbG9ncy9jb21tb24vZGVmYXVsdExvZ0xldmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQm5GLFFBQUEsd0JBQXdCLEdBQUcsSUFBQSwrQkFBZSxFQUEyQiwwQkFBMEIsQ0FBQyxDQUFDO0lBYTlHLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCO1FBSTVCLFlBQ2dELGtCQUFnRCxFQUNoRSxXQUF5QixFQUNsQixrQkFBdUMsRUFDL0MsVUFBdUIsRUFDcEIsYUFBNkI7WUFKZix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQ2hFLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ2xCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDL0MsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNwQixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFFL0QsQ0FBQztRQUVELEtBQUssQ0FBQyxtQkFBbUI7WUFDeEIsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUMxRCxPQUFPO2dCQUNOLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQywwQkFBMEIsRUFBRTtnQkFDbkUsVUFBVSxFQUFFLFlBQVksRUFBRSxVQUFVLElBQUksSUFBSSxDQUFDLHFDQUFxQyxFQUFFO2FBQ3BGLENBQUM7UUFDSCxDQUFDO1FBRUQsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGVBQXlCLEVBQUUsV0FBb0I7WUFDdkUsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFDaEUsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDakIsV0FB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
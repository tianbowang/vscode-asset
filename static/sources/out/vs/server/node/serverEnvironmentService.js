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
define(["require", "exports", "vs/nls", "vs/platform/environment/node/environmentService", "vs/platform/environment/node/argv", "vs/platform/instantiation/common/instantiation", "vs/platform/environment/common/environment", "vs/base/common/decorators"], function (require, exports, nls, environmentService_1, argv_1, instantiation_1, environment_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServerEnvironmentService = exports.IServerEnvironmentService = exports.serverOptions = void 0;
    exports.serverOptions = {
        /* ----- server setup ----- */
        'host': { type: 'string', cat: 'o', args: 'ip-address', description: nls.localize('host', "The host name or IP address the server should listen to. If not set, defaults to 'localhost'.") },
        'port': { type: 'string', cat: 'o', args: 'port | port range', description: nls.localize('port', "The port the server should listen to. If 0 is passed a random free port is picked. If a range in the format num-num is passed, a free port from the range (end inclusive) is selected.") },
        'socket-path': { type: 'string', cat: 'o', args: 'path', description: nls.localize('socket-path', "The path to a socket file for the server to listen to.") },
        'connection-token': { type: 'string', cat: 'o', args: 'token', deprecates: ['connectionToken'], description: nls.localize('connection-token', "A secret that must be included with all requests.") },
        'connection-token-file': { type: 'string', cat: 'o', args: 'path', deprecates: ['connection-secret', 'connectionTokenFile'], description: nls.localize('connection-token-file', "Path to a file that contains the connection token.") },
        'without-connection-token': { type: 'boolean', cat: 'o', description: nls.localize('without-connection-token', "Run without a connection token. Only use this if the connection is secured by other means.") },
        'disable-websocket-compression': { type: 'boolean' },
        'print-startup-performance': { type: 'boolean' },
        'print-ip-address': { type: 'boolean' },
        'accept-server-license-terms': { type: 'boolean', cat: 'o', description: nls.localize('acceptLicenseTerms', "If set, the user accepts the server license terms and the server will be started without a user prompt.") },
        'server-data-dir': { type: 'string', cat: 'o', description: nls.localize('serverDataDir', "Specifies the directory that server data is kept in.") },
        'telemetry-level': { type: 'string', cat: 'o', args: 'level', description: nls.localize('telemetry-level', "Sets the initial telemetry level. Valid levels are: 'off', 'crash', 'error' and 'all'. If not specified, the server will send telemetry until a client connects, it will then use the clients telemetry setting. Setting this to 'off' is equivalent to --disable-telemetry") },
        /* ----- vs code options ---	-- */
        'user-data-dir': argv_1.OPTIONS['user-data-dir'],
        'enable-smoke-test-driver': argv_1.OPTIONS['enable-smoke-test-driver'],
        'disable-telemetry': argv_1.OPTIONS['disable-telemetry'],
        'disable-workspace-trust': argv_1.OPTIONS['disable-workspace-trust'],
        'file-watcher-polling': { type: 'string', deprecates: ['fileWatcherPolling'] },
        'log': argv_1.OPTIONS['log'],
        'logsPath': argv_1.OPTIONS['logsPath'],
        'force-disable-user-env': argv_1.OPTIONS['force-disable-user-env'],
        /* ----- vs code web options ----- */
        'folder': { type: 'string', deprecationMessage: 'No longer supported. Folder needs to be provided in the browser URL or with `default-folder`.' },
        'workspace': { type: 'string', deprecationMessage: 'No longer supported. Workspace needs to be provided in the browser URL or with `default-workspace`.' },
        'default-folder': { type: 'string', description: nls.localize('default-folder', 'The workspace folder to open when no input is specified in the browser URL. A relative or absolute path resolved against the current working directory.') },
        'default-workspace': { type: 'string', description: nls.localize('default-workspace', 'The workspace to open when no input is specified in the browser URL. A relative or absolute path resolved against the current working directory.') },
        'enable-sync': { type: 'boolean' },
        'github-auth': { type: 'string' },
        'use-test-resolver': { type: 'boolean' },
        /* ----- extension management ----- */
        'extensions-dir': argv_1.OPTIONS['extensions-dir'],
        'extensions-download-dir': argv_1.OPTIONS['extensions-download-dir'],
        'builtin-extensions-dir': argv_1.OPTIONS['builtin-extensions-dir'],
        'install-extension': argv_1.OPTIONS['install-extension'],
        'install-builtin-extension': argv_1.OPTIONS['install-builtin-extension'],
        'update-extensions': argv_1.OPTIONS['update-extensions'],
        'uninstall-extension': argv_1.OPTIONS['uninstall-extension'],
        'list-extensions': argv_1.OPTIONS['list-extensions'],
        'locate-extension': argv_1.OPTIONS['locate-extension'],
        'show-versions': argv_1.OPTIONS['show-versions'],
        'category': argv_1.OPTIONS['category'],
        'force': argv_1.OPTIONS['force'],
        'do-not-sync': argv_1.OPTIONS['do-not-sync'],
        'pre-release': argv_1.OPTIONS['pre-release'],
        'start-server': { type: 'boolean', cat: 'e', description: nls.localize('start-server', "Start the server when installing or uninstalling extensions. To be used in combination with 'install-extension', 'install-builtin-extension' and 'uninstall-extension'.") },
        /* ----- remote development options ----- */
        'enable-remote-auto-shutdown': { type: 'boolean' },
        'remote-auto-shutdown-without-delay': { type: 'boolean' },
        'use-host-proxy': { type: 'boolean' },
        'without-browser-env-var': { type: 'boolean' },
        /* ----- server cli ----- */
        'help': argv_1.OPTIONS['help'],
        'version': argv_1.OPTIONS['version'],
        'locate-shell-integration-path': argv_1.OPTIONS['locate-shell-integration-path'],
        'compatibility': { type: 'string' },
        _: argv_1.OPTIONS['_']
    };
    exports.IServerEnvironmentService = (0, instantiation_1.refineServiceDecorator)(environment_1.IEnvironmentService);
    class ServerEnvironmentService extends environmentService_1.NativeEnvironmentService {
        get userRoamingDataHome() { return this.appSettingsHome; }
        get args() { return super.args; }
    }
    exports.ServerEnvironmentService = ServerEnvironmentService;
    __decorate([
        decorators_1.memoize
    ], ServerEnvironmentService.prototype, "userRoamingDataHome", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyRW52aXJvbm1lbnRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvbm9kZS9zZXJ2ZXJFbnZpcm9ubWVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7O0lBV25GLFFBQUEsYUFBYSxHQUFtRDtRQUU1RSw4QkFBOEI7UUFFOUIsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLCtGQUErRixDQUFDLEVBQUU7UUFDNUwsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsd0xBQXdMLENBQUMsRUFBRTtRQUM1UixhQUFhLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsd0RBQXdELENBQUMsRUFBRTtRQUM3SixrQkFBa0IsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsbURBQW1ELENBQUMsRUFBRTtRQUNwTSx1QkFBdUIsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJ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
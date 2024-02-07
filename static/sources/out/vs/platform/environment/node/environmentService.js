/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/platform/environment/common/environmentService", "vs/platform/environment/node/userDataPath"], function (require, exports, os_1, environmentService_1, userDataPath_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseSharedProcessDebugPort = exports.parsePtyHostDebugPort = exports.NativeEnvironmentService = void 0;
    class NativeEnvironmentService extends environmentService_1.AbstractNativeEnvironmentService {
        constructor(args, productService) {
            super(args, {
                homeDir: (0, os_1.homedir)(),
                tmpDir: (0, os_1.tmpdir)(),
                userDataDir: (0, userDataPath_1.getUserDataPath)(args, productService.nameShort)
            }, productService);
        }
    }
    exports.NativeEnvironmentService = NativeEnvironmentService;
    function parsePtyHostDebugPort(args, isBuilt) {
        return (0, environmentService_1.parseDebugParams)(args['inspect-ptyhost'], args['inspect-brk-ptyhost'], 5877, isBuilt, args.extensionEnvironment);
    }
    exports.parsePtyHostDebugPort = parsePtyHostDebugPort;
    function parseSharedProcessDebugPort(args, isBuilt) {
        return (0, environmentService_1.parseDebugParams)(args['inspect-sharedprocess'], args['inspect-brk-sharedprocess'], 5879, isBuilt, args.extensionEnvironment);
    }
    exports.parseSharedProcessDebugPort = parseSharedProcessDebugPort;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9lbnZpcm9ubWVudC9ub2RlL2Vudmlyb25tZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSx3QkFBeUIsU0FBUSxxREFBZ0M7UUFFN0UsWUFBWSxJQUFzQixFQUFFLGNBQStCO1lBQ2xFLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ1gsT0FBTyxFQUFFLElBQUEsWUFBTyxHQUFFO2dCQUNsQixNQUFNLEVBQUUsSUFBQSxXQUFNLEdBQUU7Z0JBQ2hCLFdBQVcsRUFBRSxJQUFBLDhCQUFlLEVBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxTQUFTLENBQUM7YUFDNUQsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNwQixDQUFDO0tBQ0Q7SUFURCw0REFTQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLElBQXNCLEVBQUUsT0FBZ0I7UUFDN0UsT0FBTyxJQUFBLHFDQUFnQixFQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDekgsQ0FBQztJQUZELHNEQUVDO0lBRUQsU0FBZ0IsMkJBQTJCLENBQUMsSUFBc0IsRUFBRSxPQUFnQjtRQUNuRixPQUFPLElBQUEscUNBQWdCLEVBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNySSxDQUFDO0lBRkQsa0VBRUMifQ==
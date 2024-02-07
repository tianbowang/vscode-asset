/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, nls, platform_1, configurationRegistry_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readKeyboardConfig = exports.DispatchConfig = void 0;
    var DispatchConfig;
    (function (DispatchConfig) {
        DispatchConfig[DispatchConfig["Code"] = 0] = "Code";
        DispatchConfig[DispatchConfig["KeyCode"] = 1] = "KeyCode";
    })(DispatchConfig || (exports.DispatchConfig = DispatchConfig = {}));
    function readKeyboardConfig(configurationService) {
        const keyboard = configurationService.getValue('keyboard');
        const dispatch = (keyboard?.dispatch === 'keyCode' ? 1 /* DispatchConfig.KeyCode */ : 0 /* DispatchConfig.Code */);
        const mapAltGrToCtrlAlt = Boolean(keyboard?.mapAltGrToCtrlAlt);
        return { dispatch, mapAltGrToCtrlAlt };
    }
    exports.readKeyboardConfig = readKeyboardConfig;
    const configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const keyboardConfiguration = {
        'id': 'keyboard',
        'order': 15,
        'type': 'object',
        'title': nls.localize('keyboardConfigurationTitle', "Keyboard"),
        'properties': {
            'keyboard.dispatch': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'string',
                enum: ['code', 'keyCode'],
                default: 'code',
                markdownDescription: nls.localize('dispatch', "Controls the dispatching logic for key presses to use either `code` (recommended) or `keyCode`."),
                included: platform_1.OS === 2 /* OperatingSystem.Macintosh */ || platform_1.OS === 3 /* OperatingSystem.Linux */
            },
            'keyboard.mapAltGrToCtrlAlt': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize('mapAltGrToCtrlAlt', "Controls if the AltGraph+ modifier should be treated as Ctrl+Alt+."),
                included: platform_1.OS === 1 /* OperatingSystem.Windows */
            }
        }
    };
    configurationRegistry.registerConfiguration(keyboardConfiguration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRDb25maWcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2tleWJvYXJkTGF5b3V0L2NvbW1vbi9rZXlib2FyZENvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsSUFBa0IsY0FHakI7SUFIRCxXQUFrQixjQUFjO1FBQy9CLG1EQUFJLENBQUE7UUFDSix5REFBTyxDQUFBO0lBQ1IsQ0FBQyxFQUhpQixjQUFjLDhCQUFkLGNBQWMsUUFHL0I7SUFPRCxTQUFnQixrQkFBa0IsQ0FBQyxvQkFBMkM7UUFDN0UsTUFBTSxRQUFRLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUF3RCxVQUFVLENBQUMsQ0FBQztRQUNsSCxNQUFNLFFBQVEsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsZ0NBQXdCLENBQUMsNEJBQW9CLENBQUMsQ0FBQztRQUNuRyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUMvRCxPQUFPLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUxELGdEQUtDO0lBRUQsTUFBTSxxQkFBcUIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbEcsTUFBTSxxQkFBcUIsR0FBdUI7UUFDakQsSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLEVBQUU7UUFDWCxNQUFNLEVBQUUsUUFBUTtRQUNoQixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUM7UUFDL0QsWUFBWSxFQUFFO1lBQ2IsbUJBQW1CLEVBQUU7Z0JBQ3BCLEtBQUssd0NBQWdDO2dCQUNyQyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDO2dCQUN6QixPQUFPLEVBQUUsTUFBTTtnQkFDZixtQkFBbUIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxpR0FBaUcsQ0FBQztnQkFDaEosUUFBUSxFQUFFLGFBQUUsc0NBQThCLElBQUksYUFBRSxrQ0FBMEI7YUFDMUU7WUFDRCw0QkFBNEIsRUFBRTtnQkFDN0IsS0FBSyx3Q0FBZ0M7Z0JBQ3JDLElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxLQUFLO2dCQUNkLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsb0VBQW9FLENBQUM7Z0JBQzVILFFBQVEsRUFBRSxhQUFFLG9DQUE0QjthQUN4QztTQUNEO0tBQ0QsQ0FBQztJQUVGLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLENBQUMifQ==
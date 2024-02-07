/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, keybindingsRegistry_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setupTerminalCommands = void 0;
    function setupTerminalCommands() {
        registerOpenTerminalAtIndexCommands();
    }
    exports.setupTerminalCommands = setupTerminalCommands;
    function registerOpenTerminalAtIndexCommands() {
        for (let i = 0; i < 9; i++) {
            const terminalIndex = i;
            const visibleIndex = i + 1;
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: `workbench.action.terminal.focusAtIndex${visibleIndex}`,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: undefined,
                primary: 0,
                handler: accessor => {
                    accessor.get(terminal_1.ITerminalGroupService).setActiveInstanceByIndex(terminalIndex);
                    return accessor.get(terminal_1.ITerminalGroupService).showPanel(true);
                }
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb21tYW5kcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbENvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxTQUFnQixxQkFBcUI7UUFDcEMsbUNBQW1DLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRkQsc0RBRUM7SUFFRCxTQUFTLG1DQUFtQztRQUMzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDNUIsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFM0IseUNBQW1CLENBQUMsZ0NBQWdDLENBQUM7Z0JBQ3BELEVBQUUsRUFBRSx5Q0FBeUMsWUFBWSxFQUFFO2dCQUMzRCxNQUFNLDZDQUFtQztnQkFDekMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFO29CQUNuQixRQUFRLENBQUMsR0FBRyxDQUFDLGdDQUFxQixDQUFDLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzVFLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQ0FBcUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUQsQ0FBQzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7SUFDRixDQUFDIn0=
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/console"], function (require, exports, console_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logRemoteEntryIfError = exports.logRemoteEntry = void 0;
    function logRemoteEntry(logService, entry, label = null) {
        const args = (0, console_1.parse)(entry).args;
        let firstArg = args.shift();
        if (typeof firstArg !== 'string') {
            return;
        }
        if (!entry.severity) {
            entry.severity = 'info';
        }
        if (label) {
            if (!/^\[/.test(label)) {
                label = `[${label}]`;
            }
            if (!/ $/.test(label)) {
                label = `${label} `;
            }
            firstArg = label + firstArg;
        }
        switch (entry.severity) {
            case 'log':
            case 'info':
                logService.info(firstArg, ...args);
                break;
            case 'warn':
                logService.warn(firstArg, ...args);
                break;
            case 'error':
                logService.error(firstArg, ...args);
                break;
        }
    }
    exports.logRemoteEntry = logRemoteEntry;
    function logRemoteEntryIfError(logService, entry, label) {
        const args = (0, console_1.parse)(entry).args;
        const firstArg = args.shift();
        if (typeof firstArg !== 'string' || entry.severity !== 'error') {
            return;
        }
        if (!/^\[/.test(label)) {
            label = `[${label}]`;
        }
        if (!/ $/.test(label)) {
            label = `${label} `;
        }
        logService.error(label + firstArg, ...args);
    }
    exports.logRemoteEntryIfError = logRemoteEntryIfError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlQ29uc29sZVV0aWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9yZW1vdGVDb25zb2xlVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsU0FBZ0IsY0FBYyxDQUFDLFVBQXVCLEVBQUUsS0FBd0IsRUFBRSxRQUF1QixJQUFJO1FBQzVHLE1BQU0sSUFBSSxHQUFHLElBQUEsZUFBSyxFQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMvQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUIsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNsQyxPQUFPO1FBQ1IsQ0FBQztRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckIsS0FBSyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksS0FBSyxFQUFFLENBQUM7WUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN4QixLQUFLLEdBQUcsSUFBSSxLQUFLLEdBQUcsQ0FBQztZQUN0QixDQUFDO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsS0FBSyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUM7WUFDckIsQ0FBQztZQUNELFFBQVEsR0FBRyxLQUFLLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUM7UUFFRCxRQUFRLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QixLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssTUFBTTtnQkFDVixVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUNuQyxNQUFNO1lBQ1AsS0FBSyxNQUFNO2dCQUNWLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLE1BQU07WUFDUCxLQUFLLE9BQU87Z0JBQ1gsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDcEMsTUFBTTtRQUNSLENBQUM7SUFDRixDQUFDO0lBakNELHdDQWlDQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLFVBQXVCLEVBQUUsS0FBd0IsRUFBRSxLQUFhO1FBQ3JHLE1BQU0sSUFBSSxHQUFHLElBQUEsZUFBSyxFQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxPQUFPLEVBQUUsQ0FBQztZQUNoRSxPQUFPO1FBQ1IsQ0FBQztRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDeEIsS0FBSyxHQUFHLElBQUksS0FBSyxHQUFHLENBQUM7UUFDdEIsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkIsS0FBSyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUM7UUFDckIsQ0FBQztRQUVELFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFmRCxzREFlQyJ9
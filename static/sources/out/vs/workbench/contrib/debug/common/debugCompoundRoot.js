/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugCompoundRoot = void 0;
    class DebugCompoundRoot {
        constructor() {
            this.stopped = false;
            this.stopEmitter = new event_1.Emitter();
            this.onDidSessionStop = this.stopEmitter.event;
        }
        sessionStopped() {
            if (!this.stopped) { // avoid sending extranous terminate events
                this.stopped = true;
                this.stopEmitter.fire();
            }
        }
    }
    exports.DebugCompoundRoot = DebugCompoundRoot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdDb21wb3VuZFJvb3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2NvbW1vbi9kZWJ1Z0NvbXBvdW5kUm9vdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBYSxpQkFBaUI7UUFBOUI7WUFDUyxZQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ2hCLGdCQUFXLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUUxQyxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQVEzQyxDQUFDO1FBTkEsY0FBYztZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQywyQ0FBMkM7Z0JBQy9ELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLENBQUM7UUFDRixDQUFDO0tBQ0Q7SUFaRCw4Q0FZQyJ9
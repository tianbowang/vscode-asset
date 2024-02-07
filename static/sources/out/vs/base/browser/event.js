/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DomEmitter = void 0;
    class DomEmitter {
        get event() {
            return this.emitter.event;
        }
        constructor(element, type, useCapture) {
            const fn = (e) => this.emitter.fire(e);
            this.emitter = new event_1.Emitter({
                onWillAddFirstListener: () => element.addEventListener(type, fn, useCapture),
                onDidRemoveLastListener: () => element.removeEventListener(type, fn, useCapture)
            });
        }
        dispose() {
            this.emitter.dispose();
        }
    }
    exports.DomEmitter = DomEmitter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3QmhHLE1BQWEsVUFBVTtRQUl0QixJQUFJLEtBQUs7WUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzNCLENBQUM7UUFLRCxZQUFZLE9BQXFCLEVBQUUsSUFBTyxFQUFFLFVBQW9CO1lBQy9ELE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFtQixDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGVBQU8sQ0FBQztnQkFDMUIsc0JBQXNCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsVUFBVSxDQUFDO2dCQUM1RSx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUM7YUFDaEYsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLENBQUM7S0FDRDtJQXRCRCxnQ0FzQkMifQ==
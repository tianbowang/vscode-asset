/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async"], function (require, exports, dom_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerZIndex = exports.ZIndex = void 0;
    var ZIndex;
    (function (ZIndex) {
        ZIndex[ZIndex["Base"] = 0] = "Base";
        ZIndex[ZIndex["Sash"] = 35] = "Sash";
        ZIndex[ZIndex["SuggestWidget"] = 40] = "SuggestWidget";
        ZIndex[ZIndex["Hover"] = 50] = "Hover";
        ZIndex[ZIndex["DragImage"] = 1000] = "DragImage";
        ZIndex[ZIndex["MenubarMenuItemsHolder"] = 2000] = "MenubarMenuItemsHolder";
        ZIndex[ZIndex["ContextView"] = 2500] = "ContextView";
        ZIndex[ZIndex["ModalDialog"] = 2600] = "ModalDialog";
        ZIndex[ZIndex["PaneDropOverlay"] = 10000] = "PaneDropOverlay";
    })(ZIndex || (exports.ZIndex = ZIndex = {}));
    const ZIndexValues = Object.keys(ZIndex).filter(key => !isNaN(Number(key))).map(key => Number(key)).sort((a, b) => b - a);
    function findBase(z) {
        for (const zi of ZIndexValues) {
            if (z >= zi) {
                return zi;
            }
        }
        return -1;
    }
    class ZIndexRegistry {
        constructor() {
            this.styleSheet = (0, dom_1.createStyleSheet)();
            this.zIndexMap = new Map();
            this.scheduler = new async_1.RunOnceScheduler(() => this.updateStyleElement(), 200);
        }
        registerZIndex(relativeLayer, z, name) {
            if (this.zIndexMap.get(name)) {
                throw new Error(`z-index with name ${name} has already been registered.`);
            }
            const proposedZValue = relativeLayer + z;
            if (findBase(proposedZValue) !== relativeLayer) {
                throw new Error(`Relative layer: ${relativeLayer} + z-index: ${z} exceeds next layer ${proposedZValue}.`);
            }
            this.zIndexMap.set(name, proposedZValue);
            this.scheduler.schedule();
            return this.getVarName(name);
        }
        getVarName(name) {
            return `--z-index-${name}`;
        }
        updateStyleElement() {
            (0, dom_1.clearNode)(this.styleSheet);
            let ruleBuilder = '';
            this.zIndexMap.forEach((zIndex, name) => {
                ruleBuilder += `${this.getVarName(name)}: ${zIndex};\n`;
            });
            (0, dom_1.createCSSRule)(':root', ruleBuilder, this.styleSheet);
        }
    }
    const zIndexRegistry = new ZIndexRegistry();
    function registerZIndex(relativeLayer, z, name) {
        return zIndexRegistry.registerZIndex(relativeLayer, z, name);
    }
    exports.registerZIndex = registerZIndex;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiekluZGV4UmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2xheW91dC9icm93c2VyL3pJbmRleFJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxJQUFZLE1BVVg7SUFWRCxXQUFZLE1BQU07UUFDakIsbUNBQVEsQ0FBQTtRQUNSLG9DQUFTLENBQUE7UUFDVCxzREFBa0IsQ0FBQTtRQUNsQixzQ0FBVSxDQUFBO1FBQ1YsZ0RBQWdCLENBQUE7UUFDaEIsMEVBQTZCLENBQUE7UUFDN0Isb0RBQWtCLENBQUE7UUFDbEIsb0RBQWtCLENBQUE7UUFDbEIsNkRBQXVCLENBQUE7SUFDeEIsQ0FBQyxFQVZXLE1BQU0sc0JBQU4sTUFBTSxRQVVqQjtJQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUgsU0FBUyxRQUFRLENBQUMsQ0FBUztRQUMxQixLQUFLLE1BQU0sRUFBRSxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO2dCQUNiLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztRQUNGLENBQUM7UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELE1BQU0sY0FBYztRQUluQjtZQUNDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBQSxzQkFBZ0IsR0FBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFFRCxjQUFjLENBQUMsYUFBcUIsRUFBRSxDQUFTLEVBQUUsSUFBWTtZQUM1RCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzlCLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLElBQUksK0JBQStCLENBQUMsQ0FBQztZQUMzRSxDQUFDO1lBRUQsTUFBTSxjQUFjLEdBQUcsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUN6QyxJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxhQUFhLEVBQUUsQ0FBQztnQkFDaEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsYUFBYSxlQUFlLENBQUMsdUJBQXVCLGNBQWMsR0FBRyxDQUFDLENBQUM7WUFDM0csQ0FBQztZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRU8sVUFBVSxDQUFDLElBQVk7WUFDOUIsT0FBTyxhQUFhLElBQUksRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTyxrQkFBa0I7WUFDekIsSUFBQSxlQUFTLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNCLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDdkMsV0FBVyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQztZQUN6RCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUEsbUJBQWEsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0lBRTVDLFNBQWdCLGNBQWMsQ0FBQyxhQUFxQixFQUFFLENBQVMsRUFBRSxJQUFZO1FBQzVFLE9BQU8sY0FBYyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFGRCx3Q0FFQyJ9
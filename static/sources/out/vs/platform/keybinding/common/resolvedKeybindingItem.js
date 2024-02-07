/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toEmptyArrayIfContainsNull = exports.ResolvedKeybindingItem = void 0;
    class ResolvedKeybindingItem {
        constructor(resolvedKeybinding, command, commandArgs, when, isDefault, extensionId, isBuiltinExtension) {
            this._resolvedKeybindingItemBrand = undefined;
            this.resolvedKeybinding = resolvedKeybinding;
            this.chords = resolvedKeybinding ? toEmptyArrayIfContainsNull(resolvedKeybinding.getDispatchChords()) : [];
            if (resolvedKeybinding && this.chords.length === 0) {
                // handle possible single modifier chord keybindings
                this.chords = toEmptyArrayIfContainsNull(resolvedKeybinding.getSingleModifierDispatchChords());
            }
            this.bubble = (command ? command.charCodeAt(0) === 94 /* CharCode.Caret */ : false);
            this.command = this.bubble ? command.substr(1) : command;
            this.commandArgs = commandArgs;
            this.when = when;
            this.isDefault = isDefault;
            this.extensionId = extensionId;
            this.isBuiltinExtension = isBuiltinExtension;
        }
    }
    exports.ResolvedKeybindingItem = ResolvedKeybindingItem;
    function toEmptyArrayIfContainsNull(arr) {
        const result = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            const element = arr[i];
            if (!element) {
                return [];
            }
            result.push(element);
        }
        return result;
    }
    exports.toEmptyArrayIfContainsNull = toEmptyArrayIfContainsNull;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZWRLZXliaW5kaW5nSXRlbS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0va2V5YmluZGluZy9jb21tb24vcmVzb2x2ZWRLZXliaW5kaW5nSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsTUFBYSxzQkFBc0I7UUFhbEMsWUFBWSxrQkFBa0QsRUFBRSxPQUFzQixFQUFFLFdBQWdCLEVBQUUsSUFBc0MsRUFBRSxTQUFrQixFQUFFLFdBQTBCLEVBQUUsa0JBQTJCO1lBWjdOLGlDQUE0QixHQUFTLFNBQVMsQ0FBQztZQWE5QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7WUFDN0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDM0csSUFBSSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDcEQsb0RBQW9EO2dCQUNwRCxJQUFJLENBQUMsTUFBTSxHQUFHLDBCQUEwQixDQUFDLGtCQUFrQixDQUFDLCtCQUErQixFQUFFLENBQUMsQ0FBQztZQUNoRyxDQUFDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsNEJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQzFELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQy9CLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztRQUM5QyxDQUFDO0tBQ0Q7SUE1QkQsd0RBNEJDO0lBRUQsU0FBZ0IsMEJBQTBCLENBQUksR0FBaUI7UUFDOUQsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO1FBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNoRCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNkLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVZELGdFQVVDIn0=
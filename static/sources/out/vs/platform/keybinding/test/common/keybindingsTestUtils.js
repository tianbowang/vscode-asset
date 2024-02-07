/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keybindings", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, keybindings_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createUSLayoutResolvedKeybinding = void 0;
    function createUSLayoutResolvedKeybinding(encodedKeybinding, OS) {
        if (encodedKeybinding === 0) {
            return undefined;
        }
        const keybinding = (0, keybindings_1.decodeKeybinding)(encodedKeybinding, OS);
        if (!keybinding) {
            return undefined;
        }
        const result = usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.resolveKeybinding(keybinding, OS);
        if (result.length > 0) {
            return result[0];
        }
        return undefined;
    }
    exports.createUSLayoutResolvedKeybinding = createUSLayoutResolvedKeybinding;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3NUZXN0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2tleWJpbmRpbmcvdGVzdC9jb21tb24va2V5YmluZGluZ3NUZXN0VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLFNBQWdCLGdDQUFnQyxDQUFDLGlCQUFvQyxFQUFFLEVBQW1CO1FBQ3pHLElBQUksaUJBQWlCLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDN0IsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUNELE1BQU0sVUFBVSxHQUFHLElBQUEsOEJBQWdCLEVBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2pCLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyx1REFBMEIsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBYkQsNEVBYUMifQ==
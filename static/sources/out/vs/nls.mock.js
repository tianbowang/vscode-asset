/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getConfiguredDefaultLocale = exports.localize2 = exports.localize = void 0;
    function _format(message, args) {
        let result;
        if (args.length === 0) {
            result = message;
        }
        else {
            result = message.replace(/\{(\d+)\}/g, function (match, rest) {
                const index = rest[0];
                return typeof args[index] !== 'undefined' ? args[index] : match;
            });
        }
        return result;
    }
    function localize(data, message, ...args) {
        return _format(message, args);
    }
    exports.localize = localize;
    function localize2(data, message, ...args) {
        const res = _format(message, args);
        return {
            original: res,
            value: res
        };
    }
    exports.localize2 = localize2;
    function getConfiguredDefaultLocale(_) {
        return undefined;
    }
    exports.getConfiguredDefaultLocale = getConfiguredDefaultLocale;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmxzLm1vY2suanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL25scy5tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxTQUFTLE9BQU8sQ0FBQyxPQUFlLEVBQUUsSUFBVztRQUM1QyxJQUFJLE1BQWMsQ0FBQztRQUNuQixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkIsTUFBTSxHQUFHLE9BQU8sQ0FBQztRQUNsQixDQUFDO2FBQU0sQ0FBQztZQUNQLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxVQUFVLEtBQUssRUFBRSxJQUFJO2dCQUMzRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE9BQU8sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNqRSxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRCxTQUFnQixRQUFRLENBQUMsSUFBNEIsRUFBRSxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ3JGLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRkQsNEJBRUM7SUFFRCxTQUFnQixTQUFTLENBQUMsSUFBNEIsRUFBRSxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ3RGLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkMsT0FBTztZQUNOLFFBQVEsRUFBRSxHQUFHO1lBQ2IsS0FBSyxFQUFFLEdBQUc7U0FDVixDQUFDO0lBQ0gsQ0FBQztJQU5ELDhCQU1DO0lBRUQsU0FBZ0IsMEJBQTBCLENBQUMsQ0FBUztRQUNuRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRkQsZ0VBRUMifQ==
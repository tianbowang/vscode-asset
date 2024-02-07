(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/uri"], function (require, exports, buffer_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.revive = exports.parse = exports.stringify = void 0;
    function stringify(obj) {
        return JSON.stringify(obj, replacer);
    }
    exports.stringify = stringify;
    function parse(text) {
        let data = JSON.parse(text);
        data = revive(data);
        return data;
    }
    exports.parse = parse;
    function replacer(key, value) {
        // URI is done via toJSON-member
        if (value instanceof RegExp) {
            return {
                $mid: 2 /* MarshalledId.Regexp */,
                source: value.source,
                flags: value.flags,
            };
        }
        return value;
    }
    function revive(obj, depth = 0) {
        if (!obj || depth > 200) {
            return obj;
        }
        if (typeof obj === 'object') {
            switch (obj.$mid) {
                case 1 /* MarshalledId.Uri */: return uri_1.URI.revive(obj);
                case 2 /* MarshalledId.Regexp */: return new RegExp(obj.source, obj.flags);
                case 17 /* MarshalledId.Date */: return new Date(obj.source);
            }
            if (obj instanceof buffer_1.VSBuffer
                || obj instanceof Uint8Array) {
                return obj;
            }
            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; ++i) {
                    obj[i] = revive(obj[i], depth + 1);
                }
            }
            else {
                // walk object
                for (const key in obj) {
                    if (Object.hasOwnProperty.call(obj, key)) {
                        obj[key] = revive(obj[key], depth + 1);
                    }
                }
            }
        }
        return obj;
    }
    exports.revive = revive;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFyc2hhbGxpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL21hcnNoYWxsaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxTQUFnQixTQUFTLENBQUMsR0FBUTtRQUNqQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFGRCw4QkFFQztJQUVELFNBQWdCLEtBQUssQ0FBQyxJQUFZO1FBQ2pDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFKRCxzQkFJQztJQU1ELFNBQVMsUUFBUSxDQUFDLEdBQVcsRUFBRSxLQUFVO1FBQ3hDLGdDQUFnQztRQUNoQyxJQUFJLEtBQUssWUFBWSxNQUFNLEVBQUUsQ0FBQztZQUM3QixPQUFPO2dCQUNOLElBQUksNkJBQXFCO2dCQUN6QixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07Z0JBQ3BCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSzthQUNsQixDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQVdELFNBQWdCLE1BQU0sQ0FBVSxHQUFRLEVBQUUsS0FBSyxHQUFHLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDekIsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO1FBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUU3QixRQUEyQixHQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3RDLDZCQUFxQixDQUFDLENBQUMsT0FBWSxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuRCxnQ0FBd0IsQ0FBQyxDQUFDLE9BQVksSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hFLCtCQUFzQixDQUFDLENBQUMsT0FBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUQsQ0FBQztZQUVELElBQ0MsR0FBRyxZQUFZLGlCQUFRO21CQUNwQixHQUFHLFlBQVksVUFBVSxFQUMzQixDQUFDO2dCQUNGLE9BQVksR0FBRyxDQUFDO1lBQ2pCLENBQUM7WUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztvQkFDckMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO1lBQ0YsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLGNBQWM7Z0JBQ2QsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDdkIsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDMUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQW5DRCx3QkFtQ0MifQ==
//# sourceURL=../../../vs/base/common/marshalling.js
})
(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/types"], function (require, exports, Assert, Types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Registry = void 0;
    class RegistryImpl {
        constructor() {
            this.data = new Map();
        }
        add(id, data) {
            Assert.ok(Types.isString(id));
            Assert.ok(Types.isObject(data));
            Assert.ok(!this.data.has(id), 'There is already an extension with this id');
            this.data.set(id, data);
        }
        knows(id) {
            return this.data.has(id);
        }
        as(id) {
            return this.data.get(id) || null;
        }
    }
    exports.Registry = new RegistryImpl();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlZ2lzdHJ5L2NvbW1vbi9wbGF0Zm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE0QmhHLE1BQU0sWUFBWTtRQUFsQjtZQUVrQixTQUFJLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztRQWlCaEQsQ0FBQztRQWZPLEdBQUcsQ0FBQyxFQUFVLEVBQUUsSUFBUztZQUMvQixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsNENBQTRDLENBQUMsQ0FBQztZQUU1RSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVNLEtBQUssQ0FBQyxFQUFVO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVNLEVBQUUsQ0FBQyxFQUFVO1lBQ25CLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQ2xDLENBQUM7S0FDRDtJQUVZLFFBQUEsUUFBUSxHQUFjLElBQUksWUFBWSxFQUFFLENBQUMifQ==
//# sourceURL=../../../vs/platform/registry/common/platform.js
})
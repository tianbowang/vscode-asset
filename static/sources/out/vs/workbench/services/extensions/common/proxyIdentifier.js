/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SerializableObjectWithBuffers = exports.getStringIdentifierForProxy = exports.createProxyIdentifier = exports.ProxyIdentifier = void 0;
    class ProxyIdentifier {
        static { this.count = 0; }
        constructor(sid) {
            this._proxyIdentifierBrand = undefined;
            this.sid = sid;
            this.nid = (++ProxyIdentifier.count);
        }
    }
    exports.ProxyIdentifier = ProxyIdentifier;
    const identifiers = [];
    function createProxyIdentifier(identifier) {
        const result = new ProxyIdentifier(identifier);
        identifiers[result.nid] = result;
        return result;
    }
    exports.createProxyIdentifier = createProxyIdentifier;
    function getStringIdentifierForProxy(nid) {
        return identifiers[nid].sid;
    }
    exports.getStringIdentifierForProxy = getStringIdentifierForProxy;
    /**
     * Marks the object as containing buffers that should be serialized more efficiently.
     */
    class SerializableObjectWithBuffers {
        constructor(value) {
            this.value = value;
        }
    }
    exports.SerializableObjectWithBuffers = SerializableObjectWithBuffers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHlJZGVudGlmaWVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy9jb21tb24vcHJveHlJZGVudGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTZCaEcsTUFBYSxlQUFlO2lCQUNiLFVBQUssR0FBRyxDQUFDLEFBQUosQ0FBSztRQU14QixZQUFZLEdBQVc7WUFMdkIsMEJBQXFCLEdBQVMsU0FBUyxDQUFDO1lBTXZDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ2YsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUM7O0lBVkYsMENBV0M7SUFFRCxNQUFNLFdBQVcsR0FBMkIsRUFBRSxDQUFDO0lBRS9DLFNBQWdCLHFCQUFxQixDQUFJLFVBQWtCO1FBQzFELE1BQU0sTUFBTSxHQUFHLElBQUksZUFBZSxDQUFJLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ2pDLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUpELHNEQUlDO0lBc0JELFNBQWdCLDJCQUEyQixDQUFDLEdBQVc7UUFDdEQsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzdCLENBQUM7SUFGRCxrRUFFQztJQUVEOztPQUVHO0lBQ0gsTUFBYSw2QkFBNkI7UUFDekMsWUFDaUIsS0FBUTtZQUFSLFVBQUssR0FBTCxLQUFLLENBQUc7UUFDckIsQ0FBQztLQUNMO0lBSkQsc0VBSUMifQ==
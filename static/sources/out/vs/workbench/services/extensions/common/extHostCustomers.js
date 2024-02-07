/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostCustomersRegistry = exports.extHostCustomer = exports.extHostNamedCustomer = void 0;
    function extHostNamedCustomer(id) {
        return function (ctor) {
            ExtHostCustomersRegistryImpl.INSTANCE.registerNamedCustomer(id, ctor);
        };
    }
    exports.extHostNamedCustomer = extHostNamedCustomer;
    function extHostCustomer(ctor) {
        ExtHostCustomersRegistryImpl.INSTANCE.registerCustomer(ctor);
    }
    exports.extHostCustomer = extHostCustomer;
    var ExtHostCustomersRegistry;
    (function (ExtHostCustomersRegistry) {
        function getNamedCustomers() {
            return ExtHostCustomersRegistryImpl.INSTANCE.getNamedCustomers();
        }
        ExtHostCustomersRegistry.getNamedCustomers = getNamedCustomers;
        function getCustomers() {
            return ExtHostCustomersRegistryImpl.INSTANCE.getCustomers();
        }
        ExtHostCustomersRegistry.getCustomers = getCustomers;
    })(ExtHostCustomersRegistry || (exports.ExtHostCustomersRegistry = ExtHostCustomersRegistry = {}));
    class ExtHostCustomersRegistryImpl {
        static { this.INSTANCE = new ExtHostCustomersRegistryImpl(); }
        constructor() {
            this._namedCustomers = [];
            this._customers = [];
        }
        registerNamedCustomer(id, ctor) {
            const entry = [id, ctor];
            this._namedCustomers.push(entry);
        }
        getNamedCustomers() {
            return this._namedCustomers;
        }
        registerCustomer(ctor) {
            this._customers.push(ctor);
        }
        getCustomers() {
            return this._customers;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEN1c3RvbWVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvY29tbW9uL2V4dEhvc3RDdXN0b21lcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0JoRyxTQUFnQixvQkFBb0IsQ0FBd0IsRUFBc0I7UUFDakYsT0FBTyxVQUE2QyxJQUFpRTtZQUNwSCw0QkFBNEIsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsRUFBRSxFQUFFLElBQStCLENBQUMsQ0FBQztRQUNsRyxDQUFDLENBQUM7SUFDSCxDQUFDO0lBSkQsb0RBSUM7SUFFRCxTQUFnQixlQUFlLENBQTJELElBQWlFO1FBQzFKLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUErQixDQUFDLENBQUM7SUFDekYsQ0FBQztJQUZELDBDQUVDO0lBRUQsSUFBaUIsd0JBQXdCLENBU3hDO0lBVEQsV0FBaUIsd0JBQXdCO1FBRXhDLFNBQWdCLGlCQUFpQjtZQUNoQyxPQUFPLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2xFLENBQUM7UUFGZSwwQ0FBaUIsb0JBRWhDLENBQUE7UUFFRCxTQUFnQixZQUFZO1lBQzNCLE9BQU8sNEJBQTRCLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzdELENBQUM7UUFGZSxxQ0FBWSxlQUUzQixDQUFBO0lBQ0YsQ0FBQyxFQVRnQix3QkFBd0Isd0NBQXhCLHdCQUF3QixRQVN4QztJQUVELE1BQU0sNEJBQTRCO2lCQUVWLGFBQVEsR0FBRyxJQUFJLDRCQUE0QixFQUFFLENBQUM7UUFLckU7WUFDQyxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRU0scUJBQXFCLENBQXdCLEVBQXNCLEVBQUUsSUFBNkI7WUFDeEcsTUFBTSxLQUFLLEdBQTZCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDTSxpQkFBaUI7WUFDdkIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFFTSxnQkFBZ0IsQ0FBd0IsSUFBNkI7WUFDM0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUNNLFlBQVk7WUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3hCLENBQUMifQ==
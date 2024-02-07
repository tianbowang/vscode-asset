/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.refineServiceDecorator = exports.createDecorator = exports.IInstantiationService = exports._util = void 0;
    // ------ internal util
    var _util;
    (function (_util) {
        _util.serviceIds = new Map();
        _util.DI_TARGET = '$di$target';
        _util.DI_DEPENDENCIES = '$di$dependencies';
        function getServiceDependencies(ctor) {
            return ctor[_util.DI_DEPENDENCIES] || [];
        }
        _util.getServiceDependencies = getServiceDependencies;
    })(_util || (exports._util = _util = {}));
    exports.IInstantiationService = createDecorator('instantiationService');
    function storeServiceDependency(id, target, index) {
        if (target[_util.DI_TARGET] === target) {
            target[_util.DI_DEPENDENCIES].push({ id, index });
        }
        else {
            target[_util.DI_DEPENDENCIES] = [{ id, index }];
            target[_util.DI_TARGET] = target;
        }
    }
    /**
     * The *only* valid way to create a {{ServiceIdentifier}}.
     */
    function createDecorator(serviceId) {
        if (_util.serviceIds.has(serviceId)) {
            return _util.serviceIds.get(serviceId);
        }
        const id = function (target, key, index) {
            if (arguments.length !== 3) {
                throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
            }
            storeServiceDependency(id, target, index);
        };
        id.toString = () => serviceId;
        _util.serviceIds.set(serviceId, id);
        return id;
    }
    exports.createDecorator = createDecorator;
    function refineServiceDecorator(serviceIdentifier) {
        return serviceIdentifier;
    }
    exports.refineServiceDecorator = refineServiceDecorator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFudGlhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vaW5zdGFudGlhdGlvbi9jb21tb24vaW5zdGFudGlhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsdUJBQXVCO0lBRXZCLElBQWlCLEtBQUssQ0FVckI7SUFWRCxXQUFpQixLQUFLO1FBRVIsZ0JBQVUsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztRQUV2RCxlQUFTLEdBQUcsWUFBWSxDQUFDO1FBQ3pCLHFCQUFlLEdBQUcsa0JBQWtCLENBQUM7UUFFbEQsU0FBZ0Isc0JBQXNCLENBQUMsSUFBUztZQUMvQyxPQUFPLElBQUksQ0FBQyxNQUFBLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRmUsNEJBQXNCLHlCQUVyQyxDQUFBO0lBQ0YsQ0FBQyxFQVZnQixLQUFLLHFCQUFMLEtBQUssUUFVckI7SUFjWSxRQUFBLHFCQUFxQixHQUFHLGVBQWUsQ0FBd0Isc0JBQXNCLENBQUMsQ0FBQztJQTBDcEcsU0FBUyxzQkFBc0IsQ0FBQyxFQUFZLEVBQUUsTUFBZ0IsRUFBRSxLQUFhO1FBQzVFLElBQUssTUFBYyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUNoRCxNQUFjLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVELENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBYyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDeEQsTUFBYyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDM0MsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLGVBQWUsQ0FBSSxTQUFpQjtRQUVuRCxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDckMsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRUQsTUFBTSxFQUFFLEdBQVEsVUFBVSxNQUFnQixFQUFFLEdBQVcsRUFBRSxLQUFhO1lBQ3JFLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1lBQ3JGLENBQUM7WUFDRCxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQztRQUVGLEVBQUUsQ0FBQyxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO1FBRTlCLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwQyxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFqQkQsMENBaUJDO0lBRUQsU0FBZ0Isc0JBQXNCLENBQW1CLGlCQUF3QztRQUNoRyxPQUE2QixpQkFBaUIsQ0FBQztJQUNoRCxDQUFDO0lBRkQsd0RBRUMifQ==
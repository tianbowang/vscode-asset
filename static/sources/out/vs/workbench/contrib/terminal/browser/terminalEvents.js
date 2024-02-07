/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createInstanceCapabilityEventMultiplexer = void 0;
    function createInstanceCapabilityEventMultiplexer(currentInstances, onAddInstance, onRemoveInstance, capabilityId, getEvent) {
        const store = new lifecycle_1.DisposableStore();
        const multiplexer = store.add(new event_1.EventMultiplexer());
        const capabilityListeners = store.add(new lifecycle_1.DisposableMap());
        function addCapability(instance, capability) {
            const listener = multiplexer.add(event_1.Event.map(getEvent(capability), data => ({ instance, data })));
            capabilityListeners.set(capability, listener);
        }
        // Existing capabilities
        for (const instance of currentInstances) {
            const capability = instance.capabilities.get(capabilityId);
            if (capability) {
                addCapability(instance, capability);
            }
        }
        // Added capabilities
        const addCapabilityMultiplexer = new event_1.DynamicListEventMultiplexer(currentInstances, onAddInstance, onRemoveInstance, instance => event_1.Event.map(instance.capabilities.onDidAddCapability, changeEvent => ({ instance, changeEvent })));
        addCapabilityMultiplexer.event(e => {
            if (e.changeEvent.id === capabilityId) {
                addCapability(e.instance, e.changeEvent.capability);
            }
        });
        // Removed capabilities
        const removeCapabilityMultiplexer = new event_1.DynamicListEventMultiplexer(currentInstances, onAddInstance, onRemoveInstance, instance => instance.capabilities.onDidRemoveCapability);
        removeCapabilityMultiplexer.event(e => {
            if (e.id === capabilityId) {
                capabilityListeners.deleteAndDispose(e.capability);
            }
        });
        return {
            dispose: () => store.dispose(),
            event: multiplexer.event
        };
    }
    exports.createInstanceCapabilityEventMultiplexer = createInstanceCapabilityEventMultiplexer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFdmVudHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxFdmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLFNBQWdCLHdDQUF3QyxDQUN2RCxnQkFBcUMsRUFDckMsYUFBdUMsRUFDdkMsZ0JBQTBDLEVBQzFDLFlBQWUsRUFDZixRQUFpRTtRQUVqRSxNQUFNLEtBQUssR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUNwQyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksd0JBQWdCLEVBQTRDLENBQUMsQ0FBQztRQUNoRyxNQUFNLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSx5QkFBYSxFQUE4QyxDQUFDLENBQUM7UUFFdkcsU0FBUyxhQUFhLENBQUMsUUFBMkIsRUFBRSxVQUF5QztZQUM1RixNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRCx3QkFBd0I7UUFDeEIsS0FBSyxNQUFNLFFBQVEsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzNELElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2hCLGFBQWEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDckMsQ0FBQztRQUNGLENBQUM7UUFFRCxxQkFBcUI7UUFDckIsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLG1DQUEyQixDQUMvRCxnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixRQUFRLENBQUMsRUFBRSxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUMzRyxDQUFDO1FBQ0Ysd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssWUFBWSxFQUFFLENBQUM7Z0JBQ3ZDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDckQsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsdUJBQXVCO1FBQ3ZCLE1BQU0sMkJBQTJCLEdBQUcsSUFBSSxtQ0FBMkIsQ0FDbEUsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixnQkFBZ0IsRUFDaEIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUN2RCxDQUFDO1FBQ0YsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxZQUFZLEVBQUUsQ0FBQztnQkFDM0IsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU87WUFDTixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUM5QixLQUFLLEVBQUUsV0FBVyxDQUFDLEtBQUs7U0FDeEIsQ0FBQztJQUNILENBQUM7SUF0REQsNEZBc0RDIn0=
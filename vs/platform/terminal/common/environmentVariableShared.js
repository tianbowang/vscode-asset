(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deserializeEnvironmentVariableCollections = exports.serializeEnvironmentVariableCollections = exports.deserializeEnvironmentDescriptionMap = exports.deserializeEnvironmentVariableCollection = exports.serializeEnvironmentDescriptionMap = exports.serializeEnvironmentVariableCollection = void 0;
    // This file is shared between the renderer and extension host
    function serializeEnvironmentVariableCollection(collection) {
        return [...collection.entries()];
    }
    exports.serializeEnvironmentVariableCollection = serializeEnvironmentVariableCollection;
    function serializeEnvironmentDescriptionMap(descriptionMap) {
        return descriptionMap ? [...descriptionMap.entries()] : [];
    }
    exports.serializeEnvironmentDescriptionMap = serializeEnvironmentDescriptionMap;
    function deserializeEnvironmentVariableCollection(serializedCollection) {
        return new Map(serializedCollection);
    }
    exports.deserializeEnvironmentVariableCollection = deserializeEnvironmentVariableCollection;
    function deserializeEnvironmentDescriptionMap(serializableEnvironmentDescription) {
        return new Map(serializableEnvironmentDescription ?? []);
    }
    exports.deserializeEnvironmentDescriptionMap = deserializeEnvironmentDescriptionMap;
    function serializeEnvironmentVariableCollections(collections) {
        return Array.from(collections.entries()).map(e => {
            return [e[0], serializeEnvironmentVariableCollection(e[1].map), serializeEnvironmentDescriptionMap(e[1].descriptionMap)];
        });
    }
    exports.serializeEnvironmentVariableCollections = serializeEnvironmentVariableCollections;
    function deserializeEnvironmentVariableCollections(serializedCollection) {
        return new Map(serializedCollection.map(e => {
            return [e[0], { map: deserializeEnvironmentVariableCollection(e[1]), descriptionMap: deserializeEnvironmentDescriptionMap(e[2]) }];
        }));
    }
    exports.deserializeEnvironmentVariableCollections = deserializeEnvironmentVariableCollections;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRWYXJpYWJsZVNoYXJlZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL2Vudmlyb25tZW50VmFyaWFibGVTaGFyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLDhEQUE4RDtJQUU5RCxTQUFnQixzQ0FBc0MsQ0FBQyxVQUE0RDtRQUNsSCxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRkQsd0ZBRUM7SUFFRCxTQUFnQixrQ0FBa0MsQ0FBQyxjQUEwRjtRQUM1SSxPQUFPLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDNUQsQ0FBQztJQUZELGdGQUVDO0lBRUQsU0FBZ0Isd0NBQXdDLENBQ3ZELG9CQUFnRTtRQUVoRSxPQUFPLElBQUksR0FBRyxDQUFzQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFKRCw0RkFJQztJQUVELFNBQWdCLG9DQUFvQyxDQUNuRCxrQ0FBc0Y7UUFFdEYsT0FBTyxJQUFJLEdBQUcsQ0FBb0Qsa0NBQWtDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDN0csQ0FBQztJQUpELG9GQUlDO0lBRUQsU0FBZ0IsdUNBQXVDLENBQUMsV0FBZ0U7UUFDdkgsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNoRCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLHNDQUFzQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMxSCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFKRCwwRkFJQztJQUVELFNBQWdCLHlDQUF5QyxDQUN4RCxvQkFBaUU7UUFFakUsT0FBTyxJQUFJLEdBQUcsQ0FBeUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ25GLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsd0NBQXdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxFQUFFLG9DQUFvQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQU5ELDhGQU1DIn0=
//# sourceURL=../../../vs/platform/terminal/common/environmentVariableShared.js
})
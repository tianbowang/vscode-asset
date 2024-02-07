/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/map", "vs/base/common/network", "vs/base/common/uri", "./markers"], function (require, exports, arrays_1, event_1, iterator_1, map_1, network_1, uri_1, markers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkerService = exports.unsupportedSchemas = void 0;
    exports.unsupportedSchemas = new Set([network_1.Schemas.inMemory, network_1.Schemas.vscodeSourceControl, network_1.Schemas.walkThrough, network_1.Schemas.walkThroughSnippet]);
    class DoubleResourceMap {
        constructor() {
            this._byResource = new map_1.ResourceMap();
            this._byOwner = new Map();
        }
        set(resource, owner, value) {
            let ownerMap = this._byResource.get(resource);
            if (!ownerMap) {
                ownerMap = new Map();
                this._byResource.set(resource, ownerMap);
            }
            ownerMap.set(owner, value);
            let resourceMap = this._byOwner.get(owner);
            if (!resourceMap) {
                resourceMap = new map_1.ResourceMap();
                this._byOwner.set(owner, resourceMap);
            }
            resourceMap.set(resource, value);
        }
        get(resource, owner) {
            const ownerMap = this._byResource.get(resource);
            return ownerMap?.get(owner);
        }
        delete(resource, owner) {
            let removedA = false;
            let removedB = false;
            const ownerMap = this._byResource.get(resource);
            if (ownerMap) {
                removedA = ownerMap.delete(owner);
            }
            const resourceMap = this._byOwner.get(owner);
            if (resourceMap) {
                removedB = resourceMap.delete(resource);
            }
            if (removedA !== removedB) {
                throw new Error('illegal state');
            }
            return removedA && removedB;
        }
        values(key) {
            if (typeof key === 'string') {
                return this._byOwner.get(key)?.values() ?? iterator_1.Iterable.empty();
            }
            if (uri_1.URI.isUri(key)) {
                return this._byResource.get(key)?.values() ?? iterator_1.Iterable.empty();
            }
            return iterator_1.Iterable.map(iterator_1.Iterable.concat(...this._byOwner.values()), map => map[1]);
        }
    }
    class MarkerStats {
        constructor(service) {
            this.errors = 0;
            this.infos = 0;
            this.warnings = 0;
            this.unknowns = 0;
            this._data = new map_1.ResourceMap();
            this._service = service;
            this._subscription = service.onMarkerChanged(this._update, this);
        }
        dispose() {
            this._subscription.dispose();
        }
        _update(resources) {
            for (const resource of resources) {
                const oldStats = this._data.get(resource);
                if (oldStats) {
                    this._substract(oldStats);
                }
                const newStats = this._resourceStats(resource);
                this._add(newStats);
                this._data.set(resource, newStats);
            }
        }
        _resourceStats(resource) {
            const result = { errors: 0, warnings: 0, infos: 0, unknowns: 0 };
            // TODO this is a hack
            if (exports.unsupportedSchemas.has(resource.scheme)) {
                return result;
            }
            for (const { severity } of this._service.read({ resource })) {
                if (severity === markers_1.MarkerSeverity.Error) {
                    result.errors += 1;
                }
                else if (severity === markers_1.MarkerSeverity.Warning) {
                    result.warnings += 1;
                }
                else if (severity === markers_1.MarkerSeverity.Info) {
                    result.infos += 1;
                }
                else {
                    result.unknowns += 1;
                }
            }
            return result;
        }
        _substract(op) {
            this.errors -= op.errors;
            this.warnings -= op.warnings;
            this.infos -= op.infos;
            this.unknowns -= op.unknowns;
        }
        _add(op) {
            this.errors += op.errors;
            this.warnings += op.warnings;
            this.infos += op.infos;
            this.unknowns += op.unknowns;
        }
    }
    class MarkerService {
        constructor() {
            this._onMarkerChanged = new event_1.DebounceEmitter({
                delay: 0,
                merge: MarkerService._merge
            });
            this.onMarkerChanged = this._onMarkerChanged.event;
            this._data = new DoubleResourceMap();
            this._stats = new MarkerStats(this);
        }
        dispose() {
            this._stats.dispose();
            this._onMarkerChanged.dispose();
        }
        getStatistics() {
            return this._stats;
        }
        remove(owner, resources) {
            for (const resource of resources || []) {
                this.changeOne(owner, resource, []);
            }
        }
        changeOne(owner, resource, markerData) {
            if ((0, arrays_1.isFalsyOrEmpty)(markerData)) {
                // remove marker for this (owner,resource)-tuple
                const removed = this._data.delete(resource, owner);
                if (removed) {
                    this._onMarkerChanged.fire([resource]);
                }
            }
            else {
                // insert marker for this (owner,resource)-tuple
                const markers = [];
                for (const data of markerData) {
                    const marker = MarkerService._toMarker(owner, resource, data);
                    if (marker) {
                        markers.push(marker);
                    }
                }
                this._data.set(resource, owner, markers);
                this._onMarkerChanged.fire([resource]);
            }
        }
        static _toMarker(owner, resource, data) {
            let { code, severity, message, source, startLineNumber, startColumn, endLineNumber, endColumn, relatedInformation, tags, } = data;
            if (!message) {
                return undefined;
            }
            // santize data
            startLineNumber = startLineNumber > 0 ? startLineNumber : 1;
            startColumn = startColumn > 0 ? startColumn : 1;
            endLineNumber = endLineNumber >= startLineNumber ? endLineNumber : startLineNumber;
            endColumn = endColumn > 0 ? endColumn : startColumn;
            return {
                resource,
                owner,
                code,
                severity,
                message,
                source,
                startLineNumber,
                startColumn,
                endLineNumber,
                endColumn,
                relatedInformation,
                tags,
            };
        }
        changeAll(owner, data) {
            const changes = [];
            // remove old marker
            const existing = this._data.values(owner);
            if (existing) {
                for (const data of existing) {
                    const first = iterator_1.Iterable.first(data);
                    if (first) {
                        changes.push(first.resource);
                        this._data.delete(first.resource, owner);
                    }
                }
            }
            // add new markers
            if ((0, arrays_1.isNonEmptyArray)(data)) {
                // group by resource
                const groups = new map_1.ResourceMap();
                for (const { resource, marker: markerData } of data) {
                    const marker = MarkerService._toMarker(owner, resource, markerData);
                    if (!marker) {
                        // filter bad markers
                        continue;
                    }
                    const array = groups.get(resource);
                    if (!array) {
                        groups.set(resource, [marker]);
                        changes.push(resource);
                    }
                    else {
                        array.push(marker);
                    }
                }
                // insert all
                for (const [resource, value] of groups) {
                    this._data.set(resource, owner, value);
                }
            }
            if (changes.length > 0) {
                this._onMarkerChanged.fire(changes);
            }
        }
        read(filter = Object.create(null)) {
            let { owner, resource, severities, take } = filter;
            if (!take || take < 0) {
                take = -1;
            }
            if (owner && resource) {
                // exactly one owner AND resource
                const data = this._data.get(resource, owner);
                if (!data) {
                    return [];
                }
                else {
                    const result = [];
                    for (const marker of data) {
                        if (MarkerService._accept(marker, severities)) {
                            const newLen = result.push(marker);
                            if (take > 0 && newLen === take) {
                                break;
                            }
                        }
                    }
                    return result;
                }
            }
            else if (!owner && !resource) {
                // all
                const result = [];
                for (const markers of this._data.values()) {
                    for (const data of markers) {
                        if (MarkerService._accept(data, severities)) {
                            const newLen = result.push(data);
                            if (take > 0 && newLen === take) {
                                return result;
                            }
                        }
                    }
                }
                return result;
            }
            else {
                // of one resource OR owner
                const iterable = this._data.values(resource ?? owner);
                const result = [];
                for (const markers of iterable) {
                    for (const data of markers) {
                        if (MarkerService._accept(data, severities)) {
                            const newLen = result.push(data);
                            if (take > 0 && newLen === take) {
                                return result;
                            }
                        }
                    }
                }
                return result;
            }
        }
        static _accept(marker, severities) {
            return severities === undefined || (severities & marker.severity) === marker.severity;
        }
        // --- event debounce logic
        static _merge(all) {
            const set = new map_1.ResourceMap();
            for (const array of all) {
                for (const item of array) {
                    set.set(item, true);
                }
            }
            return Array.from(set.keys());
        }
    }
    exports.MarkerService = MarkerService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbWFya2Vycy9jb21tb24vbWFya2VyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXbkYsUUFBQSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGlCQUFPLENBQUMsUUFBUSxFQUFFLGlCQUFPLENBQUMsbUJBQW1CLEVBQUUsaUJBQU8sQ0FBQyxXQUFXLEVBQUUsaUJBQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7SUFFNUksTUFBTSxpQkFBaUI7UUFBdkI7WUFFUyxnQkFBVyxHQUFHLElBQUksaUJBQVcsRUFBa0IsQ0FBQztZQUNoRCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7UUFrRHRELENBQUM7UUFoREEsR0FBRyxDQUFDLFFBQWEsRUFBRSxLQUFhLEVBQUUsS0FBUTtZQUN6QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2YsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFM0IsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNsQixXQUFXLEdBQUcsSUFBSSxpQkFBVyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxRQUFR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
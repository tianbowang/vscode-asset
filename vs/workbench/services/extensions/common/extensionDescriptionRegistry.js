(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/base/common/event", "vs/base/common/path", "vs/base/common/lifecycle"], function (require, exports, extensions_1, event_1, path, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionDescriptionRegistryLock = exports.LockableExtensionDescriptionRegistry = exports.ExtensionDescriptionRegistrySnapshot = exports.ExtensionDescriptionRegistry = exports.DeltaExtensionsResult = void 0;
    class DeltaExtensionsResult {
        constructor(versionId, removedDueToLooping) {
            this.versionId = versionId;
            this.removedDueToLooping = removedDueToLooping;
        }
    }
    exports.DeltaExtensionsResult = DeltaExtensionsResult;
    class ExtensionDescriptionRegistry {
        static isHostExtension(extensionId, myRegistry, globalRegistry) {
            if (myRegistry.getExtensionDescription(extensionId)) {
                // I have this extension
                return false;
            }
            const extensionDescription = globalRegistry.getExtensionDescription(extensionId);
            if (!extensionDescription) {
                // unknown extension
                return false;
            }
            if ((extensionDescription.main || extensionDescription.browser) && extensionDescription.api === 'none') {
                return true;
            }
            return false;
        }
        constructor(_activationEventsReader, extensionDescriptions) {
            this._activationEventsReader = _activationEventsReader;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._versionId = 0;
            this._extensionDescriptions = extensionDescriptions;
            this._initialize();
        }
        _initialize() {
            // Ensure extensions are stored in the order: builtin, user, under development
            this._extensionDescriptions.sort(extensionCmp);
            this._extensionsMap = new extensions_1.ExtensionIdentifierMap();
            this._extensionsArr = [];
            this._activationMap = new Map();
            for (const extensionDescription of this._extensionDescriptions) {
                if (this._extensionsMap.has(extensionDescription.identifier)) {
                    // No overwriting allowed!
                    console.error('Extension `' + extensionDescription.identifier.value + '` is already registered');
                    continue;
                }
                this._extensionsMap.set(extensionDescription.identifier, extensionDescription);
                this._extensionsArr.push(extensionDescription);
                const activationEvents = this._activationEventsReader.readActivationEvents(extensionDescription);
                for (const activationEvent of activationEvents) {
                    if (!this._activationMap.has(activationEvent)) {
                        this._activationMap.set(activationEvent, []);
                    }
                    this._activationMap.get(activationEvent).push(extensionDescription);
                }
            }
        }
        set(extensionDescriptions) {
            this._extensionDescriptions = extensionDescriptions;
            this._initialize();
            this._versionId++;
            this._onDidChange.fire(undefined);
            return {
                versionId: this._versionId
            };
        }
        deltaExtensions(toAdd, toRemove) {
            // It is possible that an extension is removed, only to be added again at a different version
            // so we will first handle removals
            this._extensionDescriptions = removeExtensions(this._extensionDescriptions, toRemove);
            // Then, handle the extensions to add
            this._extensionDescriptions = this._extensionDescriptions.concat(toAdd);
            // Immediately remove looping extensions!
            const looping = ExtensionDescriptionRegistry._findLoopingExtensions(this._extensionDescriptions);
            this._extensionDescriptions = removeExtensions(this._extensionDescriptions, looping.map(ext => ext.identifier));
            this._initialize();
            this._versionId++;
            this._onDidChange.fire(undefined);
            return new DeltaExtensionsResult(this._versionId, looping);
        }
        static _findLoopingExtensions(extensionDescriptions) {
            const G = new class {
                constructor() {
                    this._arcs = new Map();
                    this._nodesSet = new Set();
                    this._nodesArr = [];
                }
                addNode(id) {
                    if (!this._nodesSet.has(id)) {
                        this._nodesSet.add(id);
                        this._nodesArr.push(id);
                    }
                }
                addArc(from, to) {
                    this.addNode(from);
                    this.addNode(to);
                    if (this._arcs.has(from)) {
                        this._arcs.get(from).push(to);
                    }
                    else {
                        this._arcs.set(from, [to]);
                    }
                }
                getArcs(id) {
                    if (this._arcs.has(id)) {
                        return this._arcs.get(id);
                    }
                    return [];
                }
                hasOnlyGoodArcs(id, good) {
                    const dependencies = G.getArcs(id);
                    for (let i = 0; i < dependencies.length; i++) {
                        if (!good.has(dependencies[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                getNodes() {
                    return this._nodesArr;
                }
            };
            const descs = new extensions_1.ExtensionIdentifierMap();
            for (const extensionDescription of extensionDescriptions) {
                descs.set(extensionDescription.identifier, extensionDescription);
                if (extensionDescription.extensionDependencies) {
                    for (const depId of extensionDescription.extensionDependencies) {
                        G.addArc(extensions_1.ExtensionIdentifier.toKey(extensionDescription.identifier), extensions_1.ExtensionIdentifier.toKey(depId));
                    }
                }
            }
            // initialize with all extensions with no dependencies.
            const good = new Set();
            G.getNodes().filter(id => G.getArcs(id).length === 0).forEach(id => good.add(id));
            // all other extensions will be processed below.
            const nodes = G.getNodes().filter(id => !good.has(id));
            let madeProgress;
            do {
                madeProgress = false;
                // find one extension which has only good deps
                for (let i = 0; i < nodes.length; i++) {
                    const id = nodes[i];
                    if (G.hasOnlyGoodArcs(id, good)) {
                        nodes.splice(i, 1);
                        i--;
                        good.add(id);
                        madeProgress = true;
                    }
                }
            } while (madeProgress);
            // The remaining nodes are bad and have loops
            return nodes.map(id => descs.get(id));
        }
        containsActivationEvent(activationEvent) {
            return this._activationMap.has(activationEvent);
        }
        containsExtension(extensionId) {
            return this._extensionsMap.has(extensionId);
        }
        getExtensionDescriptionsForActivationEvent(activationEvent) {
            const extensions = this._activationMap.get(activationEvent);
            return extensions ? extensions.slice(0) : [];
        }
        getAllExtensionDescriptions() {
            return this._extensionsArr.slice(0);
        }
        getSnapshot() {
            return new ExtensionDescriptionRegistrySnapshot(this._versionId, this.getAllExtensionDescriptions());
        }
        getExtensionDescription(extensionId) {
            const extension = this._extensionsMap.get(extensionId);
            return extension ? extension : undefined;
        }
        getExtensionDescriptionByUUID(uuid) {
            for (const extensionDescription of this._extensionsArr) {
                if (extensionDescription.uuid === uuid) {
                    return extensionDescription;
                }
            }
            return undefined;
        }
        getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
            return (this.getExtensionDescription(extensionId)
                ?? (uuid ? this.getExtensionDescriptionByUUID(uuid) : undefined));
        }
    }
    exports.ExtensionDescriptionRegistry = ExtensionDescriptionRegistry;
    class ExtensionDescriptionRegistrySnapshot {
        constructor(versionId, extensions) {
            this.versionId = versionId;
            this.extensions = extensions;
        }
    }
    exports.ExtensionDescriptionRegistrySnapshot = ExtensionDescriptionRegistrySnapshot;
    class LockableExtensionDescriptionRegistry {
        constructor(activationEventsReader) {
            this._lock = new Lock();
            this._actual = new ExtensionDescriptionRegistry(activationEventsReader, []);
        }
        async acquireLock(customerName) {
            const lock = await this._lock.acquire(customerName);
            return new ExtensionDescriptionRegistryLock(this, lock);
        }
        deltaExtensions(acquiredLock, toAdd, toRemove) {
            if (!acquiredLock.isAcquiredFor(this)) {
                throw new Error('Lock is not held');
            }
            return this._actual.deltaExtensions(toAdd, toRemove);
        }
        containsActivationEvent(activationEvent) {
            return this._actual.containsActivationEvent(activationEvent);
        }
        containsExtension(extensionId) {
            return this._actual.containsExtension(extensionId);
        }
        getExtensionDescriptionsForActivationEvent(activationEvent) {
            return this._actual.getExtensionDescriptionsForActivationEvent(activationEvent);
        }
        getAllExtensionDescriptions() {
            return this._actual.getAllExtensionDescriptions();
        }
        getSnapshot() {
            return this._actual.getSnapshot();
        }
        getExtensionDescription(extensionId) {
            return this._actual.getExtensionDescription(extensionId);
        }
        getExtensionDescriptionByUUID(uuid) {
            return this._actual.getExtensionDescriptionByUUID(uuid);
        }
        getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
            return this._actual.getExtensionDescriptionByIdOrUUID(extensionId, uuid);
        }
    }
    exports.LockableExtensionDescriptionRegistry = LockableExtensionDescriptionRegistry;
    class ExtensionDescriptionRegistryLock extends lifecycle_1.Disposable {
        constructor(_registry, lock) {
            super();
            this._registry = _registry;
            this._isDisposed = false;
            this._register(lock);
        }
        isAcquiredFor(registry) {
            return !this._isDisposed && this._registry === registry;
        }
    }
    exports.ExtensionDescriptionRegistryLock = ExtensionDescriptionRegistryLock;
    class LockCustomer {
        constructor(name) {
            this.name = name;
            this.promise = new Promise((resolve, reject) => {
                this._resolve = resolve;
            });
        }
        resolve(value) {
            this._resolve(value);
        }
    }
    class Lock {
        constructor() {
            this._pendingCustomers = [];
            this._isLocked = false;
        }
        async acquire(customerName) {
            const customer = new LockCustomer(customerName);
            this._pendingCustomers.push(customer);
            this._advance();
            return customer.promise;
        }
        _advance() {
            if (this._isLocked) {
                // cannot advance yet
                return;
            }
            if (this._pendingCustomers.length === 0) {
                // no more waiting customers
                return;
            }
            const customer = this._pendingCustomers.shift();
            this._isLocked = true;
            let customerHoldsLock = true;
            const logLongRunningCustomerTimeout = setTimeout(() => {
                if (customerHoldsLock) {
                    console.warn(`The customer named ${customer.name} has been holding on to the lock for 30s. This might be a problem.`);
                }
            }, 30 * 1000 /* 30 seconds */);
            const releaseLock = () => {
                if (!customerHoldsLock) {
                    return;
                }
                clearTimeout(logLongRunningCustomerTimeout);
                customerHoldsLock = false;
                this._isLocked = false;
                this._advance();
            };
            customer.resolve((0, lifecycle_1.toDisposable)(releaseLock));
        }
    }
    var SortBucket;
    (function (SortBucket) {
        SortBucket[SortBucket["Builtin"] = 0] = "Builtin";
        SortBucket[SortBucket["User"] = 1] = "User";
        SortBucket[SortBucket["Dev"] = 2] = "Dev";
    })(SortBucket || (SortBucket = {}));
    /**
     * Ensure that:
     * - first are builtin extensions
     * - second are user extensions
     * - third are extensions under development
     *
     * In each bucket, extensions must be sorted alphabetically by their folder name.
     */
    function extensionCmp(a, b) {
        const aSortBucket = (a.isBuiltin ? 0 /* SortBucket.Builtin */ : a.isUnderDevelopment ? 2 /* SortBucket.Dev */ : 1 /* SortBucket.User */);
        const bSortBucket = (b.isBuiltin ? 0 /* SortBucket.Builtin */ : b.isUnderDevelopment ? 2 /* SortBucket.Dev */ : 1 /* SortBucket.User */);
        if (aSortBucket !== bSortBucket) {
            return aSortBucket - bSortBucket;
        }
        const aLastSegment = path.posix.basename(a.extensionLocation.path);
        const bLastSegment = path.posix.basename(b.extensionLocation.path);
        if (aLastSegment < bLastSegment) {
            return -1;
        }
        if (aLastSegment > bLastSegment) {
            return 1;
        }
        return 0;
    }
    function removeExtensions(arr, toRemove) {
        const toRemoveSet = new extensions_1.ExtensionIdentifierSet(toRemove);
        return arr.filter(extension => !toRemoveSet.has(extension.identifier));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRGVzY3JpcHRpb25SZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvY29tbW9uL2V4dGVuc2lvbkRlc2NyaXB0aW9uUmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEscUJBQXFCO1FBQ2pDLFlBQ2lCLFNBQWlCLEVBQ2pCLG1CQUE0QztZQUQ1QyxjQUFTLEdBQVQsU0FBUyxDQUFRO1lBQ2pCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBeUI7UUFDekQsQ0FBQztLQUNMO0lBTEQsc0RBS0M7SUFZRCxNQUFhLDRCQUE0QjtRQUVqQyxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQXlDLEVBQUUsVUFBd0MsRUFBRSxjQUE0QztZQUM5SixJQUFJLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO2dCQUNyRCx3QkFBd0I7Z0JBQ3hCLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELE1BQU0sb0JBQW9CLEdBQUcsY0FBYyxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2pGLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUMzQixvQkFBb0I7Z0JBQ3BCLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLElBQUksb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksb0JBQW9CLENBQUMsR0FBRyxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUN4RyxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFXRCxZQUNrQix1QkFBZ0QsRUFDakUscUJBQThDO1lBRDdCLDRCQUF1QixHQUF2Qix1QkFBdUIs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
//# sourceURL=../../../vs/workbench/services/extensions/common/extensionDescriptionRegistry.js
})
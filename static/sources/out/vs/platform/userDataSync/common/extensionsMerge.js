/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/objects", "vs/base/common/semver/semver", "vs/base/common/types"], function (require, exports, objects_1, semver, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.merge = void 0;
    function merge(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, lastSyncBuiltinExtensions) {
        const added = [];
        const removed = [];
        const updated = [];
        if (!remoteExtensions) {
            const remote = localExtensions.filter(({ identifier }) => ignoredExtensions.every(id => id.toLowerCase() !== identifier.id.toLowerCase()));
            return {
                local: {
                    added,
                    removed,
                    updated,
                },
                remote: remote.length > 0 ? {
                    added: remote,
                    updated: [],
                    removed: [],
                    all: remote
                } : null
            };
        }
        localExtensions = localExtensions.map(massageIncomingExtension);
        remoteExtensions = remoteExtensions.map(massageIncomingExtension);
        lastSyncExtensions = lastSyncExtensions ? lastSyncExtensions.map(massageIncomingExtension) : null;
        const uuids = new Map();
        const addUUID = (identifier) => { if (identifier.uuid) {
            uuids.set(identifier.id.toLowerCase(), identifier.uuid);
        } };
        localExtensions.forEach(({ identifier }) => addUUID(identifier));
        remoteExtensions.forEach(({ identifier }) => addUUID(identifier));
        lastSyncExtensions?.forEach(({ identifier }) => addUUID(identifier));
        skippedExtensions?.forEach(({ identifier }) => addUUID(identifier));
        lastSyncBuiltinExtensions?.forEach(identifier => addUUID(identifier));
        const getKey = (extension) => {
            const uuid = extension.identifier.uuid || uuids.get(extension.identifier.id.toLowerCase());
            return uuid ? `uuid:${uuid}` : `id:${extension.identifier.id.toLowerCase()}`;
        };
        const addExtensionToMap = (map, extension) => {
            map.set(getKey(extension), extension);
            return map;
        };
        const localExtensionsMap = localExtensions.reduce(addExtensionToMap, new Map());
        const remoteExtensionsMap = remoteExtensions.reduce(addExtensionToMap, new Map());
        const newRemoteExtensionsMap = remoteExtensions.reduce((map, extension) => addExtensionToMap(map, (0, objects_1.deepClone)(extension)), new Map());
        const lastSyncExtensionsMap = lastSyncExtensions ? lastSyncExtensions.reduce(addExtensionToMap, new Map()) : null;
        const skippedExtensionsMap = skippedExtensions.reduce(addExtensionToMap, new Map());
        const ignoredExtensionsSet = ignoredExtensions.reduce((set, id) => {
            const uuid = uuids.get(id.toLowerCase());
            return set.add(uuid ? `uuid:${uuid}` : `id:${id.toLowerCase()}`);
        }, new Set());
        const lastSyncBuiltinExtensionsSet = lastSyncBuiltinExtensions ? lastSyncBuiltinExtensions.reduce((set, { id, uuid }) => {
            uuid = uuid ?? uuids.get(id.toLowerCase());
            return set.add(uuid ? `uuid:${uuid}` : `id:${id.toLowerCase()}`);
        }, new Set()) : null;
        const localToRemote = compare(localExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, false);
        if (localToRemote.added.size > 0 || localToRemote.removed.size > 0 || localToRemote.updated.size > 0) {
            const baseToLocal = compare(lastSyncExtensionsMap, localExtensionsMap, ignoredExtensionsSet, false);
            const baseToRemote = compare(lastSyncExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, true);
            const merge = (key, localExtension, remoteExtension, preferred) => {
                let pinned, version, preRelease;
                if (localExtension.installed) {
                    pinned = preferred.pinned;
                    preRelease = preferred.preRelease;
                    if (pinned) {
                        version = preferred.version;
                    }
                }
                else {
                    pinned = remoteExtension.pinned;
                    preRelease = remoteExtension.preRelease;
                    if (pinned) {
                        version = remoteExtension.version;
                    }
                }
                if (pinned === undefined /* from older client*/) {
                    pinned = localExtension.pinned;
                    if (pinned) {
                        version = localExtension.version;
                    }
                }
                if (preRelease === undefined /* from older client*/) {
                    preRelease = localExtension.preRelease;
                }
                return {
                    ...preferred,
                    installed: localExtension.installed || remoteExtension.installed,
                    pinned,
                    preRelease,
                    version: version ?? (remoteExtension.version && (!localExtension.installed || semver.gt(remoteExtension.version, localExtension.version)) ? remoteExtension.version : localExtension.version),
                    state: mergeExtensionState(localExtension, remoteExtension, lastSyncExtensionsMap?.get(key)),
                };
            };
            // Remotely removed extension => exist in base and does not in remote
            for (const key of baseToRemote.removed.values()) {
                const localExtension = localExtensionsMap.get(key);
                if (!localExtension) {
                    continue;
                }
                const baseExtension = (0, types_1.assertIsDefined)(lastSyncExtensionsMap?.get(key));
                const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
                if (localExtension.installed && wasAnInstalledExtensionDuringLastSync /* It is an installed extension now and during last sync */) {
                    // Installed extension is removed from remote. Remove it from local.
                    removed.push(localExtension.identifier);
                }
                else {
                    // Add to remote: It is a builtin extenision or got installed after last sync
                    newRemoteExtensionsMap.set(key, localExtension);
                }
            }
            // Remotely added extension => does not exist in base and exist in remote
            for (const key of baseToRemote.added.values()) {
                const remoteExtension = (0, types_1.assertIsDefined)(remoteExtensionsMap.get(key));
                const localExtension = localExtensionsMap.get(key);
                // Also exist in local
                if (localExtension) {
                    // Is different from local to remote
                    if (localToRemote.updated.has(key)) {
                        const mergedExtension = merge(key, localExtension, remoteExtension, remoteExtension);
                        // Update locally only when the extension has changes in properties other than installed poperty
                        if (!areSame(localExtension, remoteExtension, false, false)) {
                            updated.push(massageOutgoingExtension(mergedExtension, key));
                        }
                        newRemoteExtensionsMap.set(key, mergedExtension);
                    }
                }
                else {
                    // Add only if the extension is an installed extension
                    if (remoteExtension.installed) {
                        added.push(massageOutgoingExtension(remoteExtension, key));
                    }
                }
            }
            // Remotely updated extension => exist in base and remote
            for (const key of baseToRemote.updated.values()) {
                const remoteExtension = (0, types_1.assertIsDefined)(remoteExtensionsMap.get(key));
                const baseExtension = (0, types_1.assertIsDefined)(lastSyncExtensionsMap?.get(key));
                const localExtension = localExtensionsMap.get(key);
                // Also exist in local
                if (localExtension) {
                    const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
                    if (wasAnInstalledExtensionDuringLastSync && localExtension.installed && !remoteExtension.installed) {
                        // Remove it locally if it is installed locally and not remotely
                        removed.push(localExtension.identifier);
                    }
                    else {
                        // Update in local always
                        const mergedExtension = merge(key, localExtension, remoteExtension, remoteExtension);
                        updated.push(massageOutgoingExtension(mergedExtension, key));
                        newRemoteExtensionsMap.set(key, mergedExtension);
                    }
                }
                // Add it locally if does not exist locally and installed remotely
                else if (remoteExtension.installed) {
                    added.push(massageOutgoingExtension(remoteExtension, key));
                }
            }
            // Locally added extension => does not exist in base and exist in local
            for (const key of baseToLocal.added.values()) {
                // If added in remote (already handled)
                if (baseToRemote.added.has(key)) {
                    continue;
                }
                newRemoteExtensionsMap.set(key, (0, types_1.assertIsDefined)(localExtensionsMap.get(key)));
            }
            // Locally updated extension => exist in base and local
            for (const key of baseToLocal.updated.values()) {
                // If removed in remote (already handled)
                if (baseToRemote.removed.has(key)) {
                    continue;
                }
                // If updated in remote (already handled)
                if (baseToRemote.updated.has(key)) {
                    continue;
                }
                const localExtension = (0, types_1.assertIsDefined)(localExtensionsMap.get(key));
                const remoteExtension = (0, types_1.assertIsDefined)(remoteExtensionsMap.get(key));
                // Update remotely
                newRemoteExtensionsMap.set(key, merge(key, localExtension, remoteExtension, localExtension));
            }
            // Locally removed extensions => exist in base and does not exist in local
            for (const key of baseToLocal.removed.values()) {
                // If updated in remote (already handled)
                if (baseToRemote.updated.has(key)) {
                    continue;
                }
                // If removed in remote (already handled)
                if (baseToRemote.removed.has(key)) {
                    continue;
                }
                // Skipped
                if (skippedExtensionsMap.has(key)) {
                    continue;
                }
                // Skip if it is a builtin extension
                if (!(0, types_1.assertIsDefined)(remoteExtensionsMap.get(key)).installed) {
                    continue;
                }
                // Skip if last sync builtin extensions set is not available
                if (!lastSyncBuiltinExtensionsSet) {
                    continue;
                }
                // Skip if it was a builtin extension during last sync
                if (lastSyncBuiltinExtensionsSet.has(key) || !(0, types_1.assertIsDefined)(lastSyncExtensionsMap?.get(key)).installed) {
                    continue;
                }
                newRemoteExtensionsMap.delete(key);
            }
        }
        const remote = [];
        const remoteChanges = compare(remoteExtensionsMap, newRemoteExtensionsMap, new Set(), true);
        const hasRemoteChanges = remoteChanges.added.size > 0 || remoteChanges.updated.size > 0 || remoteChanges.removed.size > 0;
        if (hasRemoteChanges) {
            newRemoteExtensionsMap.forEach((value, key) => remote.push(massageOutgoingExtension(value, key)));
        }
        return {
            local: { added, removed, updated },
            remote: hasRemoteChanges ? {
                added: [...remoteChanges.added].map(id => newRemoteExtensionsMap.get(id)),
                updated: [...remoteChanges.updated].map(id => newRemoteExtensionsMap.get(id)),
                removed: [...remoteChanges.removed].map(id => remoteExtensionsMap.get(id)),
                all: remote
            } : null
        };
    }
    exports.merge = merge;
    function compare(from, to, ignoredExtensions, checkVersionProperty) {
        const fromKeys = from ? [...from.keys()].filter(key => !ignoredExtensions.has(key)) : [];
        const toKeys = [...to.keys()].filter(key => !ignoredExtensions.has(key));
        const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const updated = new Set();
        for (const key of fromKeys) {
            if (removed.has(key)) {
                continue;
            }
            const fromExtension = from.get(key);
            const toExtension = to.get(key);
            if (!toExtension || !areSame(fromExtension, toExtension, checkVersionProperty, true)) {
                updated.add(key);
            }
        }
        return { added, removed, updated };
    }
    function areSame(fromExtension, toExtension, checkVersionProperty, checkInstalledProperty) {
        if (fromExtension.disabled !== toExtension.disabled) {
            /* extension enablement changed */
            return false;
        }
        if (!!fromExtension.isApplicationScoped !== !!toExtension.isApplicationScoped) {
            /* extension application scope has changed */
            return false;
        }
        if (checkInstalledProperty && fromExtension.installed !== toExtension.installed) {
            /* extension installed property changed */
            return false;
        }
        if (fromExtension.installed && toExtension.installed) {
            if (fromExtension.preRelease !== toExtension.preRelease) {
                /* installed extension's pre-release version changed */
                return false;
            }
            if (fromExtension.pinned !== toExtension.pinned) {
                /* installed extension's pinning changed */
                return false;
            }
            if (toExtension.pinned && fromExtension.version !== toExtension.version) {
                /* installed extension's pinned version changed */
                return false;
            }
        }
        if (!isSameExtensionState(fromExtension.state, toExtension.state)) {
            /* extension state changed */
            return false;
        }
        if ((checkVersionProperty && fromExtension.version !== toExtension.version)) {
            /* extension version changed */
            return false;
        }
        return true;
    }
    function mergeExtensionState(localExtension, remoteExtension, lastSyncExtension) {
        const localState = localExtension.state;
        const remoteState = remoteExtension.state;
        const baseState = lastSyncExtension?.state;
        // If remote extension has no version, use local state
        if (!remoteExtension.version) {
            return localState;
        }
        // If local state exists and local extension is latest then use local state
        if (localState && semver.gt(localExtension.version, remoteExtension.version)) {
            return localState;
        }
        // If remote state exists and remote extension is latest, use remote state
        if (remoteState && semver.gt(remoteExtension.version, localExtension.version)) {
            return remoteState;
        }
        /* Remote and local are on same version */
        // If local state is not yet set, use remote state
        if (!localState) {
            return remoteState;
        }
        // If remote state is not yet set, use local state
        if (!remoteState) {
            return localState;
        }
        const mergedState = (0, objects_1.deepClone)(localState);
        const baseToRemote = baseState ? compareExtensionState(baseState, remoteState) : { added: Object.keys(remoteState).reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
        const baseToLocal = baseState ? compareExtensionState(baseState, localState) : { added: Object.keys(localState).reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
        // Added/Updated in remote
        for (const key of [...baseToRemote.added.values(), ...baseToRemote.updated.values()]) {
            mergedState[key] = remoteState[key];
        }
        // Removed in remote
        for (const key of baseToRemote.removed.values()) {
            // Not updated in local
            if (!baseToLocal.updated.has(key)) {
                delete mergedState[key];
            }
        }
        return mergedState;
    }
    function compareExtensionState(from, to) {
        const fromKeys = Object.keys(from);
        const toKeys = Object.keys(to);
        const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
        const updated = new Set();
        for (const key of fromKeys) {
            if (removed.has(key)) {
                continue;
            }
            const value1 = from[key];
            const value2 = to[key];
            if (!(0, objects_1.equals)(value1, value2)) {
                updated.add(key);
            }
        }
        return { added, removed, updated };
    }
    function isSameExtensionState(a = {}, b = {}) {
        const { added, removed, updated } = compareExtensionState(a, b);
        return added.size === 0 && removed.size === 0 && updated.size === 0;
    }
    // massage incoming extension - add optional properties
    function massageIncomingExtension(extension) {
        return { ...extension, ...{ disabled: !!extension.disabled, installed: !!extension.installed } };
    }
    // massage outgoing extension - remove optional properties
    function massageOutgoingExtension(extension, key) {
        const massagedExtension = {
            ...extension,
            identifier: {
                id: extension.identifier.id,
                uuid: key.startsWith('uuid:') ? key.substring('uuid:'.length) : undefined
            },
            /* set following always so that to differentiate with older clients */
            preRelease: !!extension.preRelease,
            pinned: !!extension.pinned,
        };
        if (!extension.disabled) {
            delete massagedExtension.disabled;
        }
        if (!extension.installed) {
            delete massagedExtension.installed;
        }
        if (!extension.state) {
            delete massagedExtension.state;
        }
        if (!extension.isApplicationScoped) {
            delete massagedExtension.isApplicationScoped;
        }
        return massagedExtension;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc01lcmdlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL2V4dGVuc2lvbnNNZXJnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsU0FBZ0IsS0FBSyxDQUFDLGVBQXNDLEVBQUUsZ0JBQStDLEVBQUUsa0JBQWlELEVBQUUsaUJBQW1DLEVBQUUsaUJBQTJCLEVBQUUseUJBQXdEO1FBQzNSLE1BQU0sS0FBSyxHQUFxQixFQUFFLENBQUM7UUFDbkMsTUFBTSxPQUFPLEdBQTJCLEVBQUUsQ0FBQztRQUMzQyxNQUFNLE9BQU8sR0FBcUIsRUFBRSxDQUFDO1FBRXJDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLEtBQUssVUFBVSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0ksT0FBTztnQkFDTixLQUFLLEVBQUU7b0JBQ04sS0FBSztvQkFDTCxPQUFPO29CQUNQLE9BQU87aUJBQ1A7Z0JBQ0QsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsS0FBSyxFQUFFLE1BQU07b0JBQ2IsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsR0FBRyxFQUFFLE1BQU07aUJBQ1gsQ0FBQyxDQUFDLENBQUMsSUFBSTthQUNSLENBQUM7UUFDSCxDQUFDO1FBRUQsZUFBZSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQTBCLENBQUM7UUFDekYsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDbEUsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFbEcsTUFBTSxLQUFLLEdBQXdCLElBQUksR0FBRyxFQUFrQixDQUFDO1FBQzdELE1BQU0sT0FBTyxHQUFHLENBQUMsVUFBZ0MsRUFBRSxFQUFFLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7WUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1SSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDakUsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbEUsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDckUsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDcEUseUJBQXlCLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFFdEUsTUFBTSxNQUFNLEdBQUcsQ0FBQyxTQUF5QixFQUFVLEVBQUU7WUFDcEQsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQzNGLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7UUFDOUUsQ0FBQyxDQUFDO1FBQ0YsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLEdBQWdDLEVBQUUsU0FBeUIsRUFBRSxFQUFFO1lBQ3pGLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQyxDQUFDO1FBQ0YsTUFBTSxrQkFBa0IsR0FBZ0MsZUFBZSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLEdBQUcsRUFBMEIsQ0FBQyxDQUFDO1FBQ3JJLE1BQU0sbUJBQW1CLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLElBQUksR0FBRyxFQUEwQixDQUFDLENBQUM7UUFDMUcsTUFBTSxzQkFBc0IsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFnQyxFQUFFLFNBQXlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxJQUFBLG1CQUFTLEVBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBMEIsQ0FBQyxDQUFDO1FBQ3pNLE1BQU0scUJBQXFCLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLEdBQUcsRUFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDMUksTUFBTSxvQkFBb0IsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxHQUFHLEVBQTBCLENBQUMsQ0FBQztRQUM1RyxNQUFNLG9CQUFvQixHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUNqRSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQVUsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sNEJBQTRCLEdBQUcseUJBQXlCLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1lBQ3ZILElBQUksR0FBRyxJQUFJLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUMzQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbEUsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRTdCLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFFdEcsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BHLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVyRyxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQVcsRUFBRSxjQUE4QixFQUFFLGVBQStCLEVBQUUsU0FBeUIsRUFBa0IsRUFBRTtnQkFDekksSUFBSSxNQUEyQixFQUFFLE9BQTJCLEVBQUUsVUFBK0IsQ0FBQztnQkFDOUYsSUFBSSxjQUFjLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQzlCLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO29CQUMxQixVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztvQkFDbEMsSUFBSSxNQUFNLEVBQUUsQ0FBQzt3QkFDWixPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztvQkFDN0IsQ0FBQztnQkFDRixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsTUFBTSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7b0JBQ2hDLFVBQVUsR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDO29CQUN4QyxJQUFJLE1BQU0sRUFBRSxDQUFDO3dCQUNaLE9BQU8sR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDO29CQUNuQyxDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsSUFBSSxNQUFNLEtBQUssU0FBUyxDQUFDLHNCQUFzQixFQUFFLENBQUM7b0JBQ2pELE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO29CQUMvQixJQUFJLE1BQU0sRUFBRSxDQUFDO3dCQUNaLE9BQU8sR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDO29CQUNsQyxDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsSUFBSSxVQUFVLEtBQUssU0FBUyxDQUFDLHNCQUFzQixFQUFFLENBQUM7b0JBQ3JELFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO2dCQUN4QyxDQUFDO2dCQUNELE9BQU87b0JBQ04sR0FBRyxTQUFTO29CQUNaLFNBQVMsRUFBRSxjQUFjLENBQUMsU0FBUyxJQUFJLGVBQWUsQ0FBQyxTQUFTO29CQUNoRSxNQUFNO29CQUNOLFVBQVU7b0JBQ1YsT0FBTyxFQUFFLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO29CQUM3TCxLQUFLLEVBQUUsbUJBQW1CLENBQUMsY0FBYyxFQUFFLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzVGLENBQUM7WUFDSCxDQUFDLENBQUM7WUFFRixxRUFBcUU7WUFDckUsS0FBSyxNQUFNLEdBQUcsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQ2pELE1BQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUNyQixTQUFTO2dCQUNWLENBQUM7Z0JBRUQsTUFBTSxhQUFhLEdBQUcsSUFBQSx1QkFBZSxFQUFDLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN2RSxNQUFNLHFDQUFxQyxHQUFHLDRCQUE0QixJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUM7Z0JBQ2hKLElBQUksY0FBYyxDQUFDLFNBQVMsSUFBSSxxQ0FBcUMsQ0FBQywyREFBMkQsRUFBRSxDQUFDO29CQUNuSSxvRUFBb0U7b0JBQ3BFLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsNkVBQTZFO29CQUM3RSxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDO1lBRUYsQ0FBQztZQUVELHlFQUF5RTtZQUN6RSxLQUFLLE1BQU0sR0FBRyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDL0MsTUFBTSxlQUFlLEdBQUcsSUFBQSx1QkFBZSxFQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRW5ELHNCQUFzQjtnQkFDdEIsSUFBSSxjQUFjLEVBQUUsQ0FBQztvQkFDcEIsb0NBQW9DO29CQUNwQyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ3BDLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQzt3QkFDckYsZ0dBQWdHO3dCQUNoRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7NEJBQzdELE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQzlELENBQUM7d0JBQ0Qsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQztvQkFDbEQsQ0FBQztnQkFDRixDQUFDO3FCQUFNLENBQUM7b0JBQ1Asc0RBQXNEO29CQUN0RCxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDL0IsS0FBSyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDNUQsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVELHlEQUF5RDtZQUN6RCxLQUFLLE1BQU0sR0FBRyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDakQsTUFBTSxlQUFlLEdBQUcsSUFBQSx1QkFBZSxFQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxNQUFNLGFBQWEsR0FBRyxJQUFBLHVCQUFlLEVBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZFLE1BQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFbkQsc0JBQXNCO2dCQUN0QixJQUFJLGNBQWMsRUFBRSxDQUFDO29CQUNwQixNQUFNLHFDQUFxQyxHQUFHLDRCQUE0QixJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUM7b0JBQ2hKLElBQUkscUNBQXFDLElBQUksY0FBYyxDQUFDLFNBQVMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDckcsZ0VBQWdFO3dCQUNoRSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDekMsQ0FBQzt5QkFBTSxDQUFDO3dCQUNQLHlCQUF5Qjt3QkFDekIsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO3dCQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUM3RCxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQyxDQUFDO29CQUNsRCxDQUFDO2dCQUNGLENBQUM7Z0JBQ0Qsa0VBQWtFO3FCQUM3RCxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDcEMsS0FBSyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsQ0FBQztZQUVGLENBQUM7WUFFRCx1RUFBdUU7WUFDdkUsS0FBSyxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQzlDLHVDQUF1QztnQkFDdkMsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNqQyxTQUFTO2dCQUNWLENBQUM7Z0JBQ0Qsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFBLHVCQUFlLEVBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRSxDQUFDO1lBRUQsdURBQXVEO1lBQ3ZELEtBQUssTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUNoRCx5Q0FBeUM7Z0JBQ3pDLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDbkMsU0FBUztnQkFDVixDQUFDO2dCQUNELHlDQUF5QztnQkFDekMsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNuQyxTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsTUFBTSxjQUFjLEdBQUcsSUFBQSx1QkFBZSxFQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwRSxNQUFNLGVBQWUsR0FBRyxJQUFBLHVCQUFlLEVBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RFLGtCQUFrQjtnQkFDbEIsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM5RixDQUFDO1lBRUQsMEVBQTBFO1lBQzFFLEtBQUssTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUNoRCx5Q0FBeUM7Z0JBQ3pDLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDbkMsU0FBUztnQkFDVixDQUFDO2dCQUNELHlDQUF5QztnQkFDekMsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNuQyxTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsVUFBVTtnQkFDVixJQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNuQyxTQUFTO2dCQUNWLENBQUM7Z0JBQ0Qsb0NBQW9DO2dCQUNwQyxJQUFJLENBQUMsSUFBQSx1QkFBZSxFQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUM5RCxTQUFTO2dCQUNWLENBQUM7Z0JBQ0QsNERBQTREO2dCQUM1RCxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztvQkFDbkMsU0FBUztnQkFDVixDQUFDO2dCQUNELHNEQUFzRDtnQkFDdEQsSUFBSSw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFBLHVCQUFlLEVBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQzFHLFNBQVM7Z0JBQ1YsQ0FBQztnQkFDRCxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEMsQ0FBQztRQUNGLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBcUIsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEdBQUcsRUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BHLE1BQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDMUgsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3RCLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRyxDQUFDO1FBRUQsT0FBTztZQUNOLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO1lBQ2xDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLEtBQUssRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQztnQkFDMUUsT0FBTyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDO2dCQUM5RSxPQUFPLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFFLENBQUM7Z0JBQzNFLEdBQUcsRUFBRSxNQUFNO2FBQ1gsQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUNSLENBQUM7SUFDSCxDQUFDO0lBNU9ELHNCQTRPQztJQUVELFNBQVMsT0FBTyxDQUFDLElBQXdDLEVBQUUsRUFBK0IsRUFBRSxpQkFBOEIsRUFBRSxvQkFBNkI7UUFDeEosTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3pGLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQVUsQ0FBQyxDQUFDO1FBQzdILE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQVUsQ0FBQyxDQUFDO1FBQy9ILE1BQU0sT0FBTyxHQUFnQixJQUFJLEdBQUcsRUFBVSxDQUFDO1FBRS9DLEtBQUssTUFBTSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7WUFDNUIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RCLFNBQVM7WUFDVixDQUFDO1lBQ0QsTUFBTSxhQUFhLEdBQUcsSUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQztZQUN0QyxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUN0RixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELFNBQVMsT0FBTyxDQUFDLGFBQTZCLEVBQUUsV0FBMkIsRUFBRSxvQkFBNkIsRUFBRSxzQkFBK0I7UUFDMUksSUFBSSxhQUFhLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyRCxrQ0FBa0M7WUFDbEMsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLG1CQUFtQixLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUMvRSw2Q0FBNkM7WUFDN0MsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxzQkFBc0IsSUFBSSxhQUFhLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNqRiwwQ0FBMEM7WUFDMUMsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxhQUFhLENBQUMsU0FBUyxJQUFJLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUV0RCxJQUFJLGFBQWEsQ0FBQyxVQUFVLEtBQUssV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN6RCx1REFBdUQ7Z0JBQ3ZELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2pELDJDQUEyQztnQkFDM0MsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBRUQsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN6RSxrREFBa0Q7Z0JBQ2xELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuRSw2QkFBNkI7WUFDN0IsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxDQUFDLG9CQUFvQixJQUFJLGFBQWEsQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDN0UsK0JBQStCO1lBQy9CLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUMsY0FBOEIsRUFBRSxlQUErQixFQUFFLGlCQUE2QztRQUMxSSxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDO1FBQ3hDLE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUM7UUFDMUMsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO1FBRTNDLHNEQUFzRDtRQUN0RCxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzlCLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFFRCwyRUFBMkU7UUFDM0UsSUFBSSxVQUFVLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzlFLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7UUFDRCwwRUFBMEU7UUFDMUUsSUFBSSxXQUFXLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQy9FLE9BQU8sV0FBVyxDQUFDO1FBQ3BCLENBQUM7UUFHRCwwQ0FBMEM7UUFFMUMsa0RBQWtEO1FBQ2xELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNqQixPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO1FBQ0Qsa0RBQWtEO1FBQ2xELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsQixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQTJCLElBQUEsbUJBQVMsRUFBQyxVQUFVLENBQUMsQ0FBQztRQUNsRSxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQVUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEdBQUcsRUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLEdBQUcsRUFBVSxFQUFFLENBQUM7UUFDMU8sTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFVLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQVUsRUFBRSxDQUFDO1FBQ3ZPLDBCQUEwQjtRQUMxQixLQUFLLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDdEYsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBQ0Qsb0JBQW9CO1FBQ3BCLEtBQUssTUFBTSxHQUFHLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ2pELHVCQUF1QjtZQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLFdBQVcsQ0FBQztJQUNwQixDQUFDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBQyxJQUE0QixFQUFFLEVBQTBCO1FBQ3RGLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFVLENBQUMsQ0FBQztRQUM3SCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFVLENBQUMsQ0FBQztRQUMvSCxNQUFNLE9BQU8sR0FBZ0IsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUUvQyxLQUFLLE1BQU0sR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQzVCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN0QixTQUFTO1lBQ1YsQ0FBQztZQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUEsZ0JBQU0sRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQTRCLEVBQUUsRUFBRSxJQUE0QixFQUFFO1FBQzNGLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoRSxPQUFPLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCx1REFBdUQ7SUFDdkQsU0FBUyx3QkFBd0IsQ0FBQyxTQUF5QjtRQUMxRCxPQUFPLEVBQUUsR0FBRyxTQUFTLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO0lBQ2xHLENBQUM7SUFFRCwwREFBMEQ7SUFDMUQsU0FBUyx3QkFBd0IsQ0FBQyxTQUF5QixFQUFFLEdBQVc7UUFDdkUsTUFBTSxpQkFBaUIsR0FBbUI7WUFDekMsR0FBRyxTQUFTO1lBQ1osVUFBVSxFQUFFO2dCQUNYLEVBQUUsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQzNCLElBQUksRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUzthQUN6RTtZQUNELHNFQUFzRTtZQUN0RSxVQUFVLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVO1lBQ2xDLE1BQU0sRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU07U0FDMUIsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDekIsT0FBTyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7UUFDbkMsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDMUIsT0FBTyxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7UUFDcEMsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdEIsT0FBTyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7UUFDaEMsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUNwQyxPQUFPLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDO1FBQzlDLENBQUM7UUFDRCxPQUFPLGlCQUFpQixDQUFDO0lBQzFCLENBQUMifQ==
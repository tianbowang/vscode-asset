/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/performance", "vs/base/common/types", "vs/base/parts/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, async_1, event_1, lifecycle_1, performance_1, types_1, storage_1, instantiation_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logStorage = exports.InMemoryStorageService = exports.isProfileUsingDefaultStorage = exports.AbstractStorageService = exports.loadKeyTargets = exports.StorageTarget = exports.StorageScope = exports.WillSaveStateReason = exports.IStorageService = exports.TARGET_KEY = exports.IS_NEW_KEY = void 0;
    exports.IS_NEW_KEY = '__$__isNewStorageMarker';
    exports.TARGET_KEY = '__$__targetStorageMarker';
    exports.IStorageService = (0, instantiation_1.createDecorator)('storageService');
    var WillSaveStateReason;
    (function (WillSaveStateReason) {
        /**
         * No specific reason to save state.
         */
        WillSaveStateReason[WillSaveStateReason["NONE"] = 0] = "NONE";
        /**
         * A hint that the workbench is about to shutdown.
         */
        WillSaveStateReason[WillSaveStateReason["SHUTDOWN"] = 1] = "SHUTDOWN";
    })(WillSaveStateReason || (exports.WillSaveStateReason = WillSaveStateReason = {}));
    var StorageScope;
    (function (StorageScope) {
        /**
         * The stored data will be scoped to all workspaces across all profiles.
         */
        StorageScope[StorageScope["APPLICATION"] = -1] = "APPLICATION";
        /**
         * The stored data will be scoped to all workspaces of the same profile.
         */
        StorageScope[StorageScope["PROFILE"] = 0] = "PROFILE";
        /**
         * The stored data will be scoped to the current workspace.
         */
        StorageScope[StorageScope["WORKSPACE"] = 1] = "WORKSPACE";
    })(StorageScope || (exports.StorageScope = StorageScope = {}));
    var StorageTarget;
    (function (StorageTarget) {
        /**
         * The stored data is user specific and applies across machines.
         */
        StorageTarget[StorageTarget["USER"] = 0] = "USER";
        /**
         * The stored data is machine specific.
         */
        StorageTarget[StorageTarget["MACHINE"] = 1] = "MACHINE";
    })(StorageTarget || (exports.StorageTarget = StorageTarget = {}));
    function loadKeyTargets(storage) {
        const keysRaw = storage.get(exports.TARGET_KEY);
        if (keysRaw) {
            try {
                return JSON.parse(keysRaw);
            }
            catch (error) {
                // Fail gracefully
            }
        }
        return Object.create(null);
    }
    exports.loadKeyTargets = loadKeyTargets;
    class AbstractStorageService extends lifecycle_1.Disposable {
        static { this.DEFAULT_FLUSH_INTERVAL = 60 * 1000; } // every minute
        constructor(options = { flushInterval: AbstractStorageService.DEFAULT_FLUSH_INTERVAL }) {
            super();
            this.options = options;
            this._onDidChangeValue = this._register(new event_1.PauseableEmitter());
            this._onDidChangeTarget = this._register(new event_1.PauseableEmitter());
            this.onDidChangeTarget = this._onDidChangeTarget.event;
            this._onWillSaveState = this._register(new event_1.Emitter());
            this.onWillSaveState = this._onWillSaveState.event;
            this.flushWhenIdleScheduler = this._register(new async_1.RunOnceScheduler(() => this.doFlushWhenIdle(), this.options.flushInterval));
            this.runFlushWhenIdle = this._register(new lifecycle_1.MutableDisposable());
            this._workspaceKeyTargets = undefined;
            this._profileKeyTargets = undefined;
            this._applicationKeyTargets = undefined;
        }
        onDidChangeValue(scope, key, disposable) {
            return event_1.Event.filter(this._onDidChangeValue.event, e => e.scope === scope && (key === undefined || e.key === key), disposable);
        }
        doFlushWhenIdle() {
            this.runFlushWhenIdle.value = (0, async_1.runWhenGlobalIdle)(() => {
                if (this.shouldFlushWhenIdle()) {
                    this.flush();
                }
                // repeat
                this.flushWhenIdleScheduler.schedule();
            });
        }
        shouldFlushWhenIdle() {
            return true;
        }
        stopFlushWhenIdle() {
            (0, lifecycle_1.dispose)([this.runFlushWhenIdle, this.flushWhenIdleScheduler]);
        }
        initialize() {
            if (!this.initializationPromise) {
                this.initializationPromise = (async () => {
                    // Init all storage locations
                    (0, performance_1.mark)('code/willInitStorage');
                    try {
                        await this.doInitialize(); // Ask subclasses to initialize storage
                    }
                    finally {
                        (0, performance_1.mark)('code/didInitStorage');
                    }
                    // On some OS we do not get enough time to persist state on shutdown (e.g. when
                    // Windows restarts after applying updates). In other cases, VSCode might crash,
                    // so we periodically save state to reduce the chance of loosing any state.
                    // In the browser we do not have support for long running unload sequences. As such,
                    // we cannot ask for saving state in that moment, because that would result in a
                    // long running operation.
                    // Instead, periodically ask customers to save save. The library will be clever enough
                    // to only save state that has actually changed.
                    this.flushWhenIdleScheduler.schedule();
                })();
            }
            return this.initializationPromise;
        }
        emitDidChangeValue(scope, event) {
            const { key, external } = event;
            // Specially handle `TARGET_KEY`
            if (key === exports.TARGET_KEY) {
                // Clear our cached version which is now out of date
                switch (scope) {
                    case -1 /* StorageScope.APPLICATION */:
                        this._applicationKeyTargets = undefined;
                        break;
                    case 0 /* StorageScope.PROFILE */:
                        this._profileKeyTargets = undefined;
                        break;
                    case 1 /* StorageScope.WORKSPACE */:
                        this._workspaceKeyTargets = undefined;
                        break;
                }
                // Emit as `didChangeTarget` event
                this._onDidChangeTarget.fire({ scope });
            }
            // Emit any other key to outside
            else {
                this._onDidChangeValue.fire({ scope, key, target: this.getKeyTargets(scope)[key], external });
            }
        }
        emitWillSaveState(reason) {
            this._onWillSaveState.fire({ reason });
        }
        get(key, scope, fallbackValue) {
            return this.getStorage(scope)?.get(key, fallbackValue);
        }
        getBoolean(key, scope, fallbackValue) {
            return this.getStorage(scope)?.getBoolean(key, fallbackValue);
        }
        getNumber(key, scope, fallbackValue) {
            return this.getStorage(scope)?.getNumber(key, fallbackValue);
        }
        getObject(key, scope, fallbackValue) {
            return this.getStorage(scope)?.getObject(key, fallbackValue);
        }
        storeAll(entries, external) {
            this.withPausedEmitters(() => {
                for (const entry of entries) {
                    this.store(entry.key, entry.value, entry.scope, entry.target, external);
                }
            });
        }
        store(key, value, scope, target, external = false) {
            // We remove the key for undefined/null values
            if ((0, types_1.isUndefinedOrNull)(value)) {
                this.remove(key, scope, external);
                return;
            }
            // Update our datastructures but send events only after
            this.withPausedEmitters(() => {
                // Update key-target map
                this.updateKeyTarget(key, scope, target);
                // Store actual value
                this.getStorage(scope)?.set(key, value, external);
            });
        }
        remove(key, scope, external = false) {
            // Update our datastructures but send events only after
            this.withPausedEmitters(() => {
                // Update key-target map
                this.updateKeyTarget(key, scope, undefined);
                // Remove actual key
                this.getStorage(scope)?.delete(key, external);
            });
        }
        withPausedEmitters(fn) {
            // Pause emitters
            this._onDidChangeValue.pause();
            this._onDidChangeTarget.pause();
            try {
                fn();
            }
            finally {
                // Resume emitters
                this._onDidChangeValue.resume();
                this._onDidChangeTarget.resume();
            }
        }
        keys(scope, target) {
            const keys = [];
            const keyTargets = this.getKeyTargets(scope);
            for (const key of Object.keys(keyTargets)) {
                const keyTarget = keyTargets[key];
                if (keyTarget === target) {
                    keys.push(key);
                }
            }
            return keys;
        }
        updateKeyTarget(key, scope, target, external = false) {
            // Add
            const keyTargets = this.getKeyTargets(scope);
            if (typeof target === 'number') {
                if (keyTargets[key] !== target) {
                    keyTargets[key] = target;
                    this.getStorage(scope)?.set(exports.TARGET_KEY, JSON.stringify(keyTargets), external);
                }
            }
            // Remove
            else {
                if (typeof keyTargets[key] === 'number') {
                    delete keyTargets[key];
                    this.getStorage(scope)?.set(exports.TARGET_KEY, JSON.stringify(keyTargets), external);
                }
            }
        }
        get workspaceKeyTargets() {
            if (!this._workspaceKeyTargets) {
                this._workspaceKeyTargets = this.loadKeyTargets(1 /* StorageScope.WORKSPACE */);
            }
            return this._workspaceKeyTargets;
        }
        get profileKeyTargets() {
            if (!this._profileKeyTargets) {
                this._profileKeyTargets = this.loadKeyTargets(0 /* StorageScope.PROFILE */);
            }
            return this._profileKeyTargets;
        }
        get applicationKeyTargets() {
            if (!this._applicationKeyTargets) {
                this._applicationKeyTargets = this.loadKeyTargets(-1 /* StorageScope.APPLICATION */);
            }
            return this._applicationKeyTargets;
        }
        getKeyTargets(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.applicationKeyTargets;
                case 0 /* StorageScope.PROFILE */:
                    return this.profileKeyTargets;
                default:
                    return this.workspaceKeyTargets;
            }
        }
        loadKeyTargets(scope) {
            const storage = this.getStorage(scope);
            return storage ? loadKeyTargets(storage) : Object.create(null);
        }
        isNew(scope) {
            return this.getBoolean(exports.IS_NEW_KEY, scope) === true;
        }
        async flush(reason = WillSaveStateReason.NONE) {
            // Signal event to collect changes
            this._onWillSaveState.fire({ reason });
            const applicationStorage = this.getStorage(-1 /* StorageScope.APPLICATION */);
            const profileStorage = this.getStorage(0 /* StorageScope.PROFILE */);
            const workspaceStorage = this.getStorage(1 /* StorageScope.WORKSPACE */);
            switch (reason) {
                // Unspecific reason: just wait when data is flushed
                case WillSaveStateReason.NONE:
                    await async_1.Promises.settled([
                        applicationStorage?.whenFlushed() ?? Promise.resolve(),
                        profileStorage?.whenFlushed() ?? Promise.resolve(),
                        workspaceStorage?.whenFlushed() ?? Promise.resolve()
                    ]);
                    break;
                // Shutdown: we want to flush as soon as possible
                // and not hit any delays that might be there
                case WillSaveStateReason.SHUTDOWN:
                    await async_1.Promises.settled([
                        applicationStorage?.flush(0) ?? Promise.resolve(),
                        profileStorage?.flush(0) ?? Promise.resolve(),
                        workspaceStorage?.flush(0) ?? Promise.resolve()
                    ]);
                    break;
            }
        }
        async log() {
            const applicationItems = this.getStorage(-1 /* StorageScope.APPLICATION */)?.items ?? new Map();
            const profileItems = this.getStorage(0 /* StorageScope.PROFILE */)?.items ?? new Map();
            const workspaceItems = this.getStorage(1 /* StorageScope.WORKSPACE */)?.items ?? new Map();
            return logStorage(applicationItems, profileItems, workspaceItems, this.getLogDetails(-1 /* StorageScope.APPLICATION */) ?? '', this.getLogDetails(0 /* StorageScope.PROFILE */) ?? '', this.getLogDetails(1 /* StorageScope.WORKSPACE */) ?? '');
        }
        async optimize(scope) {
            // Await pending data to be flushed to the DB
            // before attempting to optimize the DB
            await this.flush();
            return this.getStorage(scope)?.optimize();
        }
        async switch(to, preserveData) {
            // Signal as event so that clients can store data before we switch
            this.emitWillSaveState(WillSaveStateReason.NONE);
            if ((0, userDataProfile_1.isUserDataProfile)(to)) {
                return this.switchToProfile(to, preserveData);
            }
            return this.switchToWorkspace(to, preserveData);
        }
        canSwitchProfile(from, to) {
            if (from.id === to.id) {
                return false; // both profiles are same
            }
            if (isProfileUsingDefaultStorage(to) && isProfileUsingDefaultStorage(from)) {
                return false; // both profiles are using default
            }
            return true;
        }
        switchData(oldStorage, newStorage, scope) {
            this.withPausedEmitters(() => {
                // Signal storage keys that have changed
                const handledkeys = new Set();
                for (const [key, oldValue] of oldStorage) {
                    handledkeys.add(key);
                    const newValue = newStorage.get(key);
                    if (newValue !== oldValue) {
                        this.emitDidChangeValue(scope, { key, external: true });
                    }
                }
                for (const [key] of newStorage.items) {
                    if (!handledkeys.has(key)) {
                        this.emitDidChangeValue(scope, { key, external: true });
                    }
                }
            });
        }
    }
    exports.AbstractStorageService = AbstractStorageService;
    function isProfileUsingDefaultStorage(profile) {
        return profile.isDefault || !!profile.useDefaultFlags?.globalState;
    }
    exports.isProfileUsingDefaultStorage = isProfileUsingDefaultStorage;
    class InMemoryStorageService extends AbstractStorageService {
        constructor() {
            super();
            this.applicationStorage = this._register(new storage_1.Storage(new storage_1.InMemoryStorageDatabase(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY }));
            this.profileStorage = this._register(new storage_1.Storage(new storage_1.InMemoryStorageDatabase(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY }));
            this.workspaceStorage = this._register(new storage_1.Storage(new storage_1.InMemoryStorageDatabase(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY }));
            this._register(this.workspaceStorage.onDidChangeStorage(e => this.emitDidChangeValue(1 /* StorageScope.WORKSPACE */, e)));
            this._register(this.profileStorage.onDidChangeStorage(e => this.emitDidChangeValue(0 /* StorageScope.PROFILE */, e)));
            this._register(this.applicationStorage.onDidChangeStorage(e => this.emitDidChangeValue(-1 /* StorageScope.APPLICATION */, e)));
        }
        getStorage(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.applicationStorage;
                case 0 /* StorageScope.PROFILE */:
                    return this.profileStorage;
                default:
                    return this.workspaceStorage;
            }
        }
        getLogDetails(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return 'inMemory (application)';
                case 0 /* StorageScope.PROFILE */:
                    return 'inMemory (profile)';
                default:
                    return 'inMemory (workspace)';
            }
        }
        async doInitialize() { }
        async switchToProfile() {
            // no-op when in-memory
        }
        async switchToWorkspace() {
            // no-op when in-memory
        }
        shouldFlushWhenIdle() {
            return false;
        }
        hasScope(scope) {
            return false;
        }
    }
    exports.InMemoryStorageService = InMemoryStorageService;
    async function logStorage(application, profile, workspace, applicationPath, profilePath, workspacePath) {
        const safeParse = (value) => {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                return value;
            }
        };
        const applicationItems = new Map();
        const applicationItemsParsed = new Map();
        application.forEach((value, key) => {
            applicationItems.set(key, value);
            applicationItemsParsed.set(key, safeParse(value));
        });
        const profileItems = new Map();
        const profileItemsParsed = new Map();
        profile.forEach((value, key) => {
            profileItems.set(key, value);
            profileItemsParsed.set(key, safeParse(value));
        });
        const workspaceItems = new Map();
        const workspaceItemsParsed = new Map();
        workspace.forEach((value, key) => {
            workspaceItems.set(key, value);
            workspaceItemsParsed.set(key, safeParse(value));
        });
        if (applicationPath !== profilePath) {
            console.group(`Storage: Application (path: ${applicationPath})`);
        }
        else {
            console.group(`Storage: Application & Profile (path: ${applicationPath}, default profile)`);
        }
        const applicationValues = [];
        applicationItems.forEach((value, key) => {
            applicationValues.push({ key, value });
        });
        console.table(applicationValues);
        console.groupEnd();
        console.log(applicationItemsParsed);
        if (applicationPath !== profilePath) {
            console.group(`Storage: Profile (path: ${profilePath}, profile specific)`);
            const profileValues = [];
            profileItems.forEach((value, key) => {
                profileValues.push({ key, value });
            });
            console.table(profileValues);
            console.groupEnd();
            console.log(profileItemsParsed);
        }
        console.group(`Storage: Workspace (path: ${workspacePath})`);
        const workspaceValues = [];
        workspaceItems.forEach((value, key) => {
            workspaceValues.push({ key, value });
        });
        console.table(workspaceValues);
        console.groupEnd();
        console.log(workspaceItemsParsed);
    }
    exports.logStorage = logStorage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vc3RvcmFnZS9jb21tb24vc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZbkYsUUFBQSxVQUFVLEdBQUcseUJBQXlCLENBQUM7SUFDdkMsUUFBQSxVQUFVLEdBQUcsMEJBQTBCLENBQUM7SUFFeEMsUUFBQSxlQUFlLEdBQUcsSUFBQSwrQkFBZSxFQUFrQixnQkFBZ0IsQ0FBQyxDQUFDO0lBRWxGLElBQVksbUJBV1g7SUFYRCxXQUFZLG1CQUFtQjtRQUU5Qjs7V0FFRztRQUNILDZEQUFJLENBQUE7UUFFSjs7V0FFRztRQUNILHFFQUFRLENBQUE7SUFDVCxDQUFDLEVBWFcsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFXOUI7SUErTEQsSUFBa0IsWUFnQmpCO0lBaEJELFdBQWtCLFlBQVk7UUFFN0I7O1dBRUc7UUFDSCw4REFBZ0IsQ0FBQTtRQUVoQjs7V0FFRztRQUNILHFEQUFXLENBQUE7UUFFWDs7V0FFRztRQUNILHlEQUFhLENBQUE7SUFDZCxDQUFDLEVBaEJpQixZQUFZLDRCQUFaLFlBQVksUUFnQjdCO0lBRUQsSUFBa0IsYUFXakI7SUFYRCxXQUFrQixhQUFhO1FBRTlCOztXQUVHO1FBQ0gsaURBQUksQ0FBQTtRQUVKOztXQUVHO1FBQ0gsdURBQU8sQ0FBQTtJQUNSLENBQUMsRUFYaUIsYUFBYSw2QkFBYixhQUFhLFFBVzlCO0lBa0RELFNBQWdCLGNBQWMsQ0FBQyxPQUFpQjtRQUMvQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFVLENBQUMsQ0FBQztRQUN4QyxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDO2dCQUNKLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QixD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
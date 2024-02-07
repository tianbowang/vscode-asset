(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/collections", "./map", "vs/base/common/functional", "vs/base/common/iterator"], function (require, exports, arrays_1, collections_1, map_1, functional_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisposableMap = exports.disposeOnReturn = exports.ImmortalReference = exports.AsyncReferenceCollection = exports.ReferenceCollection = exports.SafeDisposable = exports.RefCountedDisposable = exports.MandatoryMutableDisposable = exports.MutableDisposable = exports.Disposable = exports.DisposableStore = exports.toDisposable = exports.combinedDisposable = exports.disposeIfDisposable = exports.dispose = exports.isDisposable = exports.markAsSingleton = exports.markAsDisposed = exports.trackDisposable = exports.setDisposableTracker = exports.DisposableTracker = void 0;
    // #region Disposable Tracking
    /**
     * Enables logging of potentially leaked disposables.
     *
     * A disposable is considered leaked if it is not disposed or not registered as the child of
     * another disposable. This tracking is very simple an only works for classes that either
     * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
     */
    const TRACK_DISPOSABLES = false;
    let disposableTracker = null;
    class DisposableTracker {
        constructor() {
            this.livingDisposables = new Map();
        }
        static { this.idx = 0; }
        getDisposableData(d) {
            let val = this.livingDisposables.get(d);
            if (!val) {
                val = { parent: null, source: null, isSingleton: false, value: d, idx: DisposableTracker.idx++ };
                this.livingDisposables.set(d, val);
            }
            return val;
        }
        trackDisposable(d) {
            const data = this.getDisposableData(d);
            if (!data.source) {
                data.source =
                    new Error().stack;
            }
        }
        setParent(child, parent) {
            const data = this.getDisposableData(child);
            data.parent = parent;
        }
        markAsDisposed(x) {
            this.livingDisposables.delete(x);
        }
        markAsSingleton(disposable) {
            this.getDisposableData(disposable).isSingleton = true;
        }
        getRootParent(data, cache) {
            const cacheValue = cache.get(data);
            if (cacheValue) {
                return cacheValue;
            }
            const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
            cache.set(data, result);
            return result;
        }
        getTrackedDisposables() {
            const rootParentCache = new Map();
            const leaking = [...this.livingDisposables.entries()]
                .filter(([, v]) => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton)
                .flatMap(([k]) => k);
            return leaking;
        }
        computeLeakingDisposables(maxReported = 10, preComputedLeaks) {
            let uncoveredLeakingObjs;
            if (preComputedLeaks) {
                uncoveredLeakingObjs = preComputedLeaks;
            }
            else {
                const rootParentCache = new Map();
                const leakingObjects = [...this.livingDisposables.values()]
                    .filter((info) => info.source !== null && !this.getRootParent(info, rootParentCache).isSingleton);
                if (leakingObjects.length === 0) {
                    return;
                }
                const leakingObjsSet = new Set(leakingObjects.map(o => o.value));
                // Remove all objects that are a child of other leaking objects. Assumes there are no cycles.
                uncoveredLeakingObjs = leakingObjects.filter(l => {
                    return !(l.parent && leakingObjsSet.has(l.parent));
                });
                if (uncoveredLeakingObjs.length === 0) {
                    throw new Error('There are cyclic diposable chains!');
                }
            }
            if (!uncoveredLeakingObjs) {
                return undefined;
            }
            function getStackTracePath(leaking) {
                function removePrefix(array, linesToRemove) {
                    while (array.length > 0 && linesToRemove.some(regexp => typeof regexp === 'string' ? regexp === array[0] : array[0].match(regexp))) {
                        array.shift();
                    }
                }
                const lines = leaking.source.split('\n').map(p => p.trim().replace('at ', '')).filter(l => l !== '');
                removePrefix(lines, ['Error', /^trackDisposable \(.*\)$/, /^DisposableTracker.trackDisposable \(.*\)$/]);
                return lines.reverse();
            }
            const stackTraceStarts = new map_1.SetMap();
            for (const leaking of uncoveredLeakingObjs) {
                const stackTracePath = getStackTracePath(leaking);
                for (let i = 0; i <= stackTracePath.length; i++) {
                    stackTraceStarts.add(stackTracePath.slice(0, i).join('\n'), leaking);
                }
            }
            // Put earlier leaks first
            uncoveredLeakingObjs.sort((0, arrays_1.compareBy)(l => l.idx, arrays_1.numberComparator));
            let message = '';
            let i = 0;
            for (const leaking of uncoveredLeakingObjs.slice(0, maxReported)) {
                i++;
                const stackTracePath = getStackTracePath(leaking);
                const stackTraceFormattedLines = [];
                for (let i = 0; i < stackTracePath.length; i++) {
                    let line = stackTracePath[i];
                    const starts = stackTraceStarts.get(stackTracePath.slice(0, i + 1).join('\n'));
                    line = `(shared with ${starts.size}/${uncoveredLeakingObjs.length} leaks) at ${line}`;
                    const prevStarts = stackTraceStarts.get(stackTracePath.slice(0, i).join('\n'));
                    const continuations = (0, collections_1.groupBy)([...prevStarts].map(d => getStackTracePath(d)[i]), v => v);
                    delete continuations[stackTracePath[i]];
                    for (const [cont, set] of Object.entries(continuations)) {
                        stackTraceFormattedLines.unshift(`    - stacktraces of ${set.length} other leaks continue with ${cont}`);
                    }
                    stackTraceFormattedLines.unshift(line);
                }
                message += `\n\n\n==================== Leaking disposable ${i}/${uncoveredLeakingObjs.length}: ${leaking.value.constructor.name} ====================\n${stackTraceFormattedLines.join('\n')}\n============================================================\n\n`;
            }
            if (uncoveredLeakingObjs.length > maxReported) {
                message += `\n\n\n... and ${uncoveredLeakingObjs.length - maxReported} more leaking disposables\n\n`;
            }
            return { leaks: uncoveredLeakingObjs, details: message };
        }
    }
    exports.DisposableTracker = DisposableTracker;
    function setDisposableTracker(tracker) {
        disposableTracker = tracker;
    }
    exports.setDisposableTracker = setDisposableTracker;
    if (TRACK_DISPOSABLES) {
        const __is_disposable_tracked__ = '__is_disposable_tracked__';
        setDisposableTracker(new class {
            trackDisposable(x) {
                const stack = new Error('Potentially leaked disposable').stack;
                setTimeout(() => {
                    if (!x[__is_disposable_tracked__]) {
                        console.log(stack);
                    }
                }, 3000);
            }
            setParent(child, parent) {
                if (child && child !== Disposable.None) {
                    try {
                        child[__is_disposable_tracked__] = true;
                    }
                    catch {
                        // noop
                    }
                }
            }
            markAsDisposed(disposable) {
                if (disposable && disposable !== Disposable.None) {
                    try {
                        disposable[__is_disposable_tracked__] = true;
                    }
                    catch {
                        // noop
                    }
                }
            }
            markAsSingleton(disposable) { }
        });
    }
    function trackDisposable(x) {
        disposableTracker?.trackDisposable(x);
        return x;
    }
    exports.trackDisposable = trackDisposable;
    function markAsDisposed(disposable) {
        disposableTracker?.markAsDisposed(disposable);
    }
    exports.markAsDisposed = markAsDisposed;
    function setParentOfDisposable(child, parent) {
        disposableTracker?.setParent(child, parent);
    }
    function setParentOfDisposables(children, parent) {
        if (!disposableTracker) {
            return;
        }
        for (const child of children) {
            disposableTracker.setParent(child, parent);
        }
    }
    /**
     * Indicates that the given object is a singleton which does not need to be disposed.
    */
    function markAsSingleton(singleton) {
        disposableTracker?.markAsSingleton(singleton);
        return singleton;
    }
    exports.markAsSingleton = markAsSingleton;
    /**
     * Check if `thing` is {@link IDisposable disposable}.
     */
    function isDisposable(thing) {
        return typeof thing.dispose === 'function' && thing.dispose.length === 0;
    }
    exports.isDisposable = isDisposable;
    function dispose(arg) {
        if (iterator_1.Iterable.is(arg)) {
            const errors = [];
            for (const d of arg) {
                if (d) {
                    try {
                        d.dispose();
                    }
                    catch (e) {
                        errors.push(e);
                    }
                }
            }
            if (errors.length === 1) {
                throw errors[0];
            }
            else if (errors.length > 1) {
                throw new AggregateError(errors, 'Encountered errors while disposing of store');
            }
            return Array.isArray(arg) ? [] : arg;
        }
        else if (arg) {
            arg.dispose();
            return arg;
        }
    }
    exports.dispose = dispose;
    function disposeIfDisposable(disposables) {
        for (const d of disposables) {
            if (isDisposable(d)) {
                d.dispose();
            }
        }
        return [];
    }
    exports.disposeIfDisposable = disposeIfDisposable;
    /**
     * Combine multiple disposable values into a single {@link IDisposable}.
     */
    function combinedDisposable(...disposables) {
        const parent = toDisposable(() => dispose(disposables));
        setParentOfDisposables(disposables, parent);
        return parent;
    }
    exports.combinedDisposable = combinedDisposable;
    /**
     * Turn a function that implements dispose into an {@link IDisposable}.
     *
     * @param fn Clean up function, guaranteed to be called only **once**.
     */
    function toDisposable(fn) {
        const self = trackDisposable({
            dispose: (0, functional_1.createSingleCallFunction)(() => {
                markAsDisposed(self);
                fn();
            })
        });
        return self;
    }
    exports.toDisposable = toDisposable;
    /**
     * Manages a collection of disposable values.
     *
     * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
     * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
     * store that has already been disposed of.
     */
    class DisposableStore {
        static { this.DISABLE_DISPOSED_WARNING = false; }
        constructor() {
            this._toDispose = new Set();
            this._isDisposed = false;
            trackDisposable(this);
        }
        /**
         * Dispose of all registered disposables and mark this object as disposed.
         *
         * Any future disposables added to this object will be disposed of on `add`.
         */
        dispose() {
            if (this._isDisposed) {
                return;
            }
            markAsDisposed(this);
            this._isDisposed = true;
            this.clear();
        }
        /**
         * @return `true` if this object has been disposed of.
         */
        get isDisposed() {
            return this._isDisposed;
        }
        /**
         * Dispose of all registered disposables but do not mark this object as disposed.
         */
        clear() {
            if (this._toDispose.size === 0) {
                return;
            }
            try {
                dispose(this._toDispose);
            }
            finally {
                this._toDispose.clear();
            }
        }
        /**
         * Add a new {@link IDisposable disposable} to the collection.
         */
        add(o) {
            if (!o) {
                return o;
            }
            if (o === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            setParentOfDisposable(o, this);
            if (this._isDisposed) {
                if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
                    console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
                }
            }
            else {
                this._toDispose.add(o);
            }
            return o;
        }
        /**
         * Deletes a disposable from store and disposes of it. This will not throw or warn and proceed to dispose the
         * disposable even when the disposable is not part in the store.
         */
        delete(o) {
            if (!o) {
                return;
            }
            if (o === this) {
                throw new Error('Cannot dispose a disposable on itself!');
            }
            this._toDispose.delete(o);
            o.dispose();
        }
        /**
         * Deletes the value from the store, but does not dispose it.
         */
        deleteAndLeak(o) {
            if (!o) {
                return;
            }
            if (this._toDispose.has(o)) {
                this._toDispose.delete(o);
                setParentOfDisposable(o, null);
            }
        }
    }
    exports.DisposableStore = DisposableStore;
    /**
     * Abstract base class for a {@link IDisposable disposable} object.
     *
     * Subclasses can {@linkcode _register} disposables that will be automatically cleaned up when this object is disposed of.
     */
    class Disposable {
        /**
         * A disposable that does nothing when it is disposed of.
         *
         * TODO: This should not be a static property.
         */
        static { this.None = Object.freeze({ dispose() { } }); }
        constructor() {
            this._store = new DisposableStore();
            trackDisposable(this);
            setParentOfDisposable(this._store, this);
        }
        dispose() {
            markAsDisposed(this);
            this._store.dispose();
        }
        /**
         * Adds `o` to the collection of disposables managed by this object.
         */
        _register(o) {
            if (o === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            return this._store.add(o);
        }
    }
    exports.Disposable = Disposable;
    /**
     * Manages the lifecycle of a disposable value that may be changed.
     *
     * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
     * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
     */
    class MutableDisposable {
        constructor() {
            this._isDisposed = false;
            trackDisposable(this);
        }
        get value() {
            return this._isDisposed ? undefined : this._value;
        }
        set value(value) {
            if (this._isDisposed || value === this._value) {
                return;
            }
            this._value?.dispose();
            if (value) {
                setParentOfDisposable(value, this);
            }
            this._value = value;
        }
        /**
         * Resets the stored value and disposed of the previously stored value.
         */
        clear() {
            this.value = undefined;
        }
        dispose() {
            this._isDisposed = true;
            markAsDisposed(this);
            this._value?.dispose();
            this._value = undefined;
        }
        /**
         * Clears the value, but does not dispose it.
         * The old value is returned.
        */
        clearAndLeak() {
            const oldValue = this._value;
            this._value = undefined;
            if (oldValue) {
                setParentOfDisposable(oldValue, null);
            }
            return oldValue;
        }
    }
    exports.MutableDisposable = MutableDisposable;
    /**
     * Manages the lifecycle of a disposable value that may be changed like {@link MutableDisposable}, but the value must
     * exist and cannot be undefined.
     */
    class MandatoryMutableDisposable {
        constructor(initialValue) {
            this._disposable = new MutableDisposable();
            this._isDisposed = false;
            this._disposable.value = initialValue;
        }
        get value() {
            return this._disposable.value;
        }
        set value(value) {
            if (this._isDisposed || value === this._disposable.value) {
                return;
            }
            this._disposable.value = value;
        }
        dispose() {
            this._isDisposed = true;
            this._disposable.dispose();
        }
    }
    exports.MandatoryMutableDisposable = MandatoryMutableDisposable;
    class RefCountedDisposable {
        constructor(_disposable) {
            this._disposable = _disposable;
            this._counter = 1;
        }
        acquire() {
            this._counter++;
            return this;
        }
        release() {
            if (--this._counter === 0) {
                this._disposable.dispose();
            }
            return this;
        }
    }
    exports.RefCountedDisposable = RefCountedDisposable;
    /**
     * A safe disposable can be `unset` so that a leaked reference (listener)
     * can be cut-off.
     */
    class SafeDisposable {
        constructor() {
            this.dispose = () => { };
            this.unset = () => { };
            this.isset = () => false;
            trackDisposable(this);
        }
        set(fn) {
            let callback = fn;
            this.unset = () => callback = undefined;
            this.isset = () => callback !== undefined;
            this.dispose = () => {
                if (callback) {
                    callback();
                    callback = undefined;
                    markAsDisposed(this);
                }
            };
            return this;
        }
    }
    exports.SafeDisposable = SafeDisposable;
    class ReferenceCollection {
        constructor() {
            this.references = new Map();
        }
        acquire(key, ...args) {
            let reference = this.references.get(key);
            if (!reference) {
                reference = { counter: 0, object: this.createReferencedObject(key, ...args) };
                this.references.set(key, reference);
            }
            const { object } = reference;
            const dispose = (0, functional_1.createSingleCallFunction)(() => {
                if (--reference.counter === 0) {
                    this.destroyReferencedObject(key, reference.object);
                    this.references.delete(key);
                }
            });
            reference.counter++;
            return { object, dispose };
        }
    }
    exports.ReferenceCollection = ReferenceCollection;
    /**
     * Unwraps a reference collection of promised values. Makes sure
     * references are disposed whenever promises get rejected.
     */
    class AsyncReferenceCollection {
        constructor(referenceCollection) {
            this.referenceCollection = referenceCollection;
        }
        async acquire(key, ...args) {
            const ref = this.referenceCollection.acquire(key, ...args);
            try {
                const object = await ref.object;
                return {
                    object,
                    dispose: () => ref.dispose()
                };
            }
            catch (error) {
                ref.dispose();
                throw error;
            }
        }
    }
    exports.AsyncReferenceCollection = AsyncReferenceCollection;
    class ImmortalReference {
        constructor(object) {
            this.object = object;
        }
        dispose() { }
    }
    exports.ImmortalReference = ImmortalReference;
    function disposeOnReturn(fn) {
        const store = new DisposableStore();
        try {
            fn(store);
        }
        finally {
            store.dispose();
        }
    }
    exports.disposeOnReturn = disposeOnReturn;
    /**
     * A map the manages the lifecycle of the values that it stores.
     */
    class DisposableMap {
        constructor() {
            this._store = new Map();
            this._isDisposed = false;
            trackDisposable(this);
        }
        /**
         * Disposes of all stored values and mark this object as disposed.
         *
         * Trying to use this object after it has been disposed of is an error.
         */
        dispose() {
            markAsDisposed(this);
            this._isDisposed = true;
            this.clearAndDisposeAll();
        }
        /**
         * Disposes of all stored values and clear the map, but DO NOT mark this object as disposed.
         */
        clearAndDisposeAll() {
            if (!this._store.size) {
                return;
            }
            try {
                dispose(this._store.values());
            }
            finally {
                this._store.clear();
            }
        }
        has(key) {
            return this._store.has(key);
        }
        get size() {
            return this._store.size;
        }
        get(key) {
            return this._store.get(key);
        }
        set(key, value, skipDisposeOnOverwrite = false) {
            if (this._isDisposed) {
                console.warn(new Error('Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!').stack);
            }
            if (!skipDisposeOnOverwrite) {
                this._store.get(key)?.dispose();
            }
            this._store.set(key, value);
        }
        /**
         * Delete the value stored for `key` from this map and also dispose of it.
         */
        deleteAndDispose(key) {
            this._store.get(key)?.dispose();
            this._store.delete(key);
        }
        keys() {
            return this._store.keys();
        }
        values() {
            return this._store.values();
        }
        [Symbol.iterator]() {
            return this._store[Symbol.iterator]();
        }
    }
    exports.DisposableMap = DisposableMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLDhCQUE4QjtJQUU5Qjs7Ozs7O09BTUc7SUFDSCxNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQztJQUNoQyxJQUFJLGlCQUFpQixHQUE4QixJQUFJLENBQUM7SUFpQ3hELE1BQWEsaUJBQWlCO1FBQTlCO1lBR2tCLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO1FBeUk3RSxDQUFDO2lCQTNJZSxRQUFHLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFJZixpQkFBaUIsQ0FBQyxDQUFjO1lBQ3ZDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNWLEdBQUcsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7Z0JBQ2pHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFRCxlQUFlLENBQUMsQ0FBYztZQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLE1BQU07b0JBQ1YsSUFBSSxL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
//# sourceURL=../../../vs/base/common/lifecycle.js
})
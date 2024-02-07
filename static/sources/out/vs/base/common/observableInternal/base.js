/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observableInternal/logging"], function (require, exports, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DisposableObservableValue = exports.disposableObservableValue = exports.ObservableValue = exports.observableValue = exports.getFunctionName = exports.getDebugName = exports.TransactionImpl = exports.subtransaction = exports.asyncTransaction = exports.globalTransaction = exports.transaction = exports.BaseObservable = exports.ConvenientObservable = exports._setDerivedOpts = exports._setKeepObserved = exports._setRecomputeInitiallyAndOnChange = void 0;
    let _recomputeInitiallyAndOnChange;
    function _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange) {
        _recomputeInitiallyAndOnChange = recomputeInitiallyAndOnChange;
    }
    exports._setRecomputeInitiallyAndOnChange = _setRecomputeInitiallyAndOnChange;
    let _keepObserved;
    function _setKeepObserved(keepObserved) {
        _keepObserved = keepObserved;
    }
    exports._setKeepObserved = _setKeepObserved;
    let _derived;
    /**
     * @internal
     * This is to allow splitting files.
    */
    function _setDerivedOpts(derived) {
        _derived = derived;
    }
    exports._setDerivedOpts = _setDerivedOpts;
    class ConvenientObservable {
        get TChange() { return null; }
        reportChanges() {
            this.get();
        }
        /** @sealed */
        read(reader) {
            if (reader) {
                return reader.readObservable(this);
            }
            else {
                return this.get();
            }
        }
        map(fnOrOwner, fnOrUndefined) {
            const owner = fnOrUndefined === undefined ? undefined : fnOrOwner;
            const fn = fnOrUndefined === undefined ? fnOrOwner : fnOrUndefined;
            return _derived({
                owner,
                debugName: () => {
                    const name = getFunctionName(fn);
                    if (name !== undefined) {
                        return name;
                    }
                    // regexp to match `x => x.y` or `x => x?.y` where x and y can be arbitrary identifiers (uses backref):
                    const regexp = /^\s*\(?\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\)?\s*=>\s*\1(?:\??)\.([a-zA-Z_$][a-zA-Z_$0-9]*)\s*$/;
                    const match = regexp.exec(fn.toString());
                    if (match) {
                        return `${this.debugName}.${match[2]}`;
                    }
                    if (!owner) {
                        return `${this.debugName} (mapped)`;
                    }
                    return undefined;
                },
            }, (reader) => fn(this.read(reader), reader));
        }
        recomputeInitiallyAndOnChange(store, handleValue) {
            store.add(_recomputeInitiallyAndOnChange(this, handleValue));
            return this;
        }
        /**
         * Ensures that this observable is observed. This keeps the cache alive.
         * However, in case of deriveds, it does not force eager evaluation (only when the value is read/get).
         * Use `recomputeInitiallyAndOnChange` for eager evaluation.
         */
        keepObserved(store) {
            store.add(_keepObserved(this));
            return this;
        }
    }
    exports.ConvenientObservable = ConvenientObservable;
    class BaseObservable extends ConvenientObservable {
        constructor() {
            super(...arguments);
            this.observers = new Set();
        }
        addObserver(observer) {
            const len = this.observers.size;
            this.observers.add(observer);
            if (len === 0) {
                this.onFirstObserverAdded();
            }
        }
        removeObserver(observer) {
            const deleted = this.observers.delete(observer);
            if (deleted && this.observers.size === 0) {
                this.onLastObserverRemoved();
            }
        }
        onFirstObserverAdded() { }
        onLastObserverRemoved() { }
    }
    exports.BaseObservable = BaseObservable;
    /**
     * Starts a transaction in which many observables can be changed at once.
     * {@link fn} should start with a JS Doc using `@description` to give the transaction a debug name.
     * Reaction run on demand or when the transaction ends.
     */
    function transaction(fn, getDebugName) {
        const tx = new TransactionImpl(fn, getDebugName);
        try {
            fn(tx);
        }
        finally {
            tx.finish();
        }
    }
    exports.transaction = transaction;
    let _globalTransaction = undefined;
    function globalTransaction(fn) {
        if (_globalTransaction) {
            fn(_globalTransaction);
        }
        else {
            const tx = new TransactionImpl(fn, undefined);
            _globalTransaction = tx;
            try {
                fn(tx);
            }
            finally {
                tx.finish(); // During finish, more actions might be added to the transaction.
                // Which is why we only clear the global transaction after finish.
                _globalTransaction = undefined;
            }
        }
    }
    exports.globalTransaction = globalTransaction;
    async function asyncTransaction(fn, getDebugName) {
        const tx = new TransactionImpl(fn, getDebugName);
        try {
            await fn(tx);
        }
        finally {
            tx.finish();
        }
    }
    exports.asyncTransaction = asyncTransaction;
    /**
     * Allows to chain transactions.
     */
    function subtransaction(tx, fn, getDebugName) {
        if (!tx) {
            transaction(fn, getDebugName);
        }
        else {
            fn(tx);
        }
    }
    exports.subtransaction = subtransaction;
    class TransactionImpl {
        constructor(_fn, _getDebugName) {
            this._fn = _fn;
            this._getDebugName = _getDebugName;
            this.updatingObservers = [];
            (0, logging_1.getLogger)()?.handleBeginTransaction(this);
        }
        getDebugName() {
            if (this._getDebugName) {
                return this._getDebugName();
            }
            return getFunctionName(this._fn);
        }
        updateObserver(observer, observable) {
            // When this gets called while finish is active, they will still get considered
            this.updatingObservers.push({ observer, observable });
            observer.beginUpdate(observable);
        }
        finish() {
            const updatingObservers = this.updatingObservers;
            for (let i = 0; i < updatingObservers.length; i++) {
                const { observer, observable } = updatingObservers[i];
                observer.endUpdate(observable);
            }
            // Prevent anyone from updating observers from now on.
            this.updatingObservers = null;
            (0, logging_1.getLogger)()?.handleEndTransaction();
        }
    }
    exports.TransactionImpl = TransactionImpl;
    const countPerName = new Map();
    const cachedDebugName = new WeakMap();
    function getDebugName(self, debugNameFn, fn, owner) {
        const cached = cachedDebugName.get(self);
        if (cached) {
            return cached;
        }
        const dbgName = computeDebugName(self, debugNameFn, fn, owner);
        if (dbgName) {
            let count = countPerName.get(dbgName) ?? 0;
            count++;
            countPerName.set(dbgName, count);
            const result = count === 1 ? dbgName : `${dbgName}#${count}`;
            cachedDebugName.set(self, result);
            return result;
        }
        return undefined;
    }
    exports.getDebugName = getDebugName;
    function computeDebugName(self, debugNameFn, fn, owner) {
        const cached = cachedDebugName.get(self);
        if (cached) {
            return cached;
        }
        const ownerStr = owner ? formatOwner(owner) + `.` : '';
        let result;
        if (debugNameFn !== undefined) {
            if (typeof debugNameFn === 'function') {
                result = debugNameFn();
                if (result !== undefined) {
                    return ownerStr + result;
                }
            }
            else {
                return ownerStr + debugNameFn;
            }
        }
        if (fn !== undefined) {
            result = getFunctionName(fn);
            if (result !== undefined) {
                return ownerStr + result;
            }
        }
        if (owner !== undefined) {
            for (const key in owner) {
                if (owner[key] === self) {
                    return ownerStr + key;
                }
            }
        }
        return undefined;
    }
    const countPerClassName = new Map();
    const ownerId = new WeakMap();
    function formatOwner(owner) {
        const id = ownerId.get(owner);
        if (id) {
            return id;
        }
        const className = getClassName(owner);
        let count = countPerClassName.get(className) ?? 0;
        count++;
        countPerClassName.set(className, count);
        const result = count === 1 ? className : `${className}#${count}`;
        ownerId.set(owner, result);
        return result;
    }
    function getClassName(obj) {
        const ctor = obj.constructor;
        if (ctor) {
            return ctor.name;
        }
        return 'Object';
    }
    function getFunctionName(fn) {
        const fnSrc = fn.toString();
        // Pattern: /** @description ... */
        const regexp = /\/\*\*\s*@description\s*([^*]*)\*\//;
        const match = regexp.exec(fnSrc);
        const result = match ? match[1] : undefined;
        return result?.trim();
    }
    exports.getFunctionName = getFunctionName;
    function observableValue(nameOrOwner, initialValue) {
        if (typeof nameOrOwner === 'string') {
            return new ObservableValue(undefined, nameOrOwner, initialValue);
        }
        else {
            return new ObservableValue(nameOrOwner, undefined, initialValue);
        }
    }
    exports.observableValue = observableValue;
    class ObservableValue extends BaseObservable {
        get debugName() {
            return getDebugName(this, this._debugName, undefined, this._owner) ?? 'ObservableValue';
        }
        constructor(_owner, _debugName, initialValue) {
            super();
            this._owner = _owner;
            this._debugName = _debugName;
            this._value = initialValue;
        }
        get() {
            return this._value;
        }
        set(value, tx, change) {
            if (this._value === value) {
                return;
            }
            let _tx;
            if (!tx) {
                tx = _tx = new TransactionImpl(() => { }, () => `Setting ${this.debugName}`);
            }
            try {
                const oldValue = this._value;
                this._setValue(value);
                (0, logging_1.getLogger)()?.handleObservableChanged(this, { oldValue, newValue: value, change, didChange: true, hadValue: true });
                for (const observer of this.observers) {
                    tx.updateObserver(observer, this);
                    observer.handleChange(this, change);
                }
            }
            finally {
                if (_tx) {
                    _tx.finish();
                }
            }
        }
        toString() {
            return `${this.debugName}: ${this._value}`;
        }
        _setValue(newValue) {
            this._value = newValue;
        }
    }
    exports.ObservableValue = ObservableValue;
    /**
     * A disposable observable. When disposed, its value is also disposed.
     * When a new value is set, the previous value is disposed.
     */
    function disposableObservableValue(nameOrOwner, initialValue) {
        if (typeof nameOrOwner === 'string') {
            return new DisposableObservableValue(undefined, nameOrOwner, initialValue);
        }
        else {
            return new DisposableObservableValue(nameOrOwner, undefined, initialValue);
        }
    }
    exports.disposableObservableValue = disposableObservableValue;
    class DisposableObservableValue extends ObservableValue {
        _setValue(newValue) {
            if (this._value === newValue) {
                return;
            }
            if (this._value) {
                this._value.dispose();
            }
            this._value = newValue;
        }
        dispose() {
            this._value?.dispose();
        }
    }
    exports.DisposableObservableValue = DisposableObservableValue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vb2JzZXJ2YWJsZUludGVybmFsL2Jhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkpoRyxJQUFJLDhCQUFvRSxDQUFDO0lBQ3pFLFNBQWdCLGlDQUFpQyxDQUFDLDZCQUFvRTtRQUNySCw4QkFBOEIsR0FBRyw2QkFBNkIsQ0FBQztJQUNoRSxDQUFDO0lBRkQsOEVBRUM7SUFFRCxJQUFJLGFBQWtDLENBQUM7SUFDdkMsU0FBZ0IsZ0JBQWdCLENBQUMsWUFBa0M7UUFDbEUsYUFBYSxHQUFHLFlBQVksQ0FBQztJQUM5QixDQUFDO0lBRkQsNENBRUM7SUFHRCxJQUFJLFFBQTRCLENBQUM7SUFDakM7OztNQUdFO0lBQ0YsU0FBZ0IsZUFBZSxDQUFDLE9BQXdCO1FBQ3ZELFFBQVEsR0FBRyxPQUFPLENBQUM7SUFDcEIsQ0FBQztJQUZELDBDQUVDO0lBRUQsTUFBc0Isb0JBQW9CO1FBQ3pDLElBQUksT0FBTyxLQUFjLE9BQU8sSUFBSyxDQUFDLENBQUMsQ0FBQztRQUlqQyxhQUFhO1lBQ25CLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFLRCxjQUFjO1FBQ1AsSUFBSSxDQUFDLE1BQTJCO1lBQ3RDLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1osT0FBTyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNuQixDQUFDO1FBQ0YsQ0FBQztRQUtNLEdBQUcsQ0FBTyxTQUF3RCxFQUFFLGFBQW1EO1lBQzdILE1BQU0sS0FBSyxHQUFHLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMs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
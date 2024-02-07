/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observableInternal/autorun", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/derived", "vs/base/common/observableInternal/logging"], function (require, exports, lifecycle_1, autorun_1, base_1, derived_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapObservableArrayCached = exports.derivedObservableWithWritableCache = exports.derivedObservableWithCache = exports.recomputeInitiallyAndOnChange = exports.keepObserved = exports.wasEventTriggeredRecently = exports.debouncedObservable = exports.observableSignal = exports.observableSignalFromEvent = exports.FromEventObservable = exports.observableFromEvent = exports.waitForState = exports.observableFromPromise = exports.constObservable = void 0;
    /**
     * Represents an efficient observable whose value never changes.
     */
    function constObservable(value) {
        return new ConstObservable(value);
    }
    exports.constObservable = constObservable;
    class ConstObservable extends base_1.ConvenientObservable {
        constructor(value) {
            super();
            this.value = value;
        }
        get debugName() {
            return this.toString();
        }
        get() {
            return this.value;
        }
        addObserver(observer) {
            // NO OP
        }
        removeObserver(observer) {
            // NO OP
        }
        toString() {
            return `Const: ${this.value}`;
        }
    }
    function observableFromPromise(promise) {
        const observable = (0, base_1.observableValue)('promiseValue', {});
        promise.then((value) => {
            observable.set({ value }, undefined);
        });
        return observable;
    }
    exports.observableFromPromise = observableFromPromise;
    function waitForState(observable, predicate) {
        return new Promise(resolve => {
            let didRun = false;
            let shouldDispose = false;
            const stateObs = observable.map(state => ({ isFinished: predicate(state), state }));
            const d = (0, autorun_1.autorun)(reader => {
                /** @description waitForState */
                const { isFinished, state } = stateObs.read(reader);
                if (isFinished) {
                    if (!didRun) {
                        shouldDispose = true;
                    }
                    else {
                        d.dispose();
                    }
                    resolve(state);
                }
            });
            didRun = true;
            if (shouldDispose) {
                d.dispose();
            }
        });
    }
    exports.waitForState = waitForState;
    function observableFromEvent(event, getValue) {
        return new FromEventObservable(event, getValue);
    }
    exports.observableFromEvent = observableFromEvent;
    class FromEventObservable extends base_1.BaseObservable {
        constructor(event, _getValue) {
            super();
            this.event = event;
            this._getValue = _getValue;
            this.hasValue = false;
            this.handleEvent = (args) => {
                const newValue = this._getValue(args);
                const oldValue = this.value;
                const didChange = !this.hasValue || oldValue !== newValue;
                let didRunTransaction = false;
                if (didChange) {
                    this.value = newValue;
                    if (this.hasValue) {
                        didRunTransaction = true;
                        (0, base_1.subtransaction)(FromEventObservable.globalTransaction, (tx) => {
                            (0, logging_1.getLogger)()?.handleFromEventObservableTriggered(this, { oldValue, newValue, change: undefined, didChange, hadValue: this.hasValue });
                            for (const o of this.observers) {
                                tx.updateObserver(o, this);
                                o.handleChange(this, undefined);
                            }
                        }, () => {
                            const name = this.getDebugName();
                            return 'Event fired' + (name ? `: ${name}` : '');
                        });
                    }
                    this.hasValue = true;
                }
                if (!didRunTransaction) {
                    (0, logging_1.getLogger)()?.handleFromEventObservableTriggered(this, { oldValue, newValue, change: undefined, didChange, hadValue: this.hasValue });
                }
            };
        }
        getDebugName() {
            return (0, base_1.getFunctionName)(this._getValue);
        }
        get debugName() {
            const name = this.getDebugName();
            return 'From Event' + (name ? `: ${name}` : '');
        }
        onFirstObserverAdded() {
            this.subscription = this.event(this.handleEvent);
        }
        onLastObserverRemoved() {
            this.subscription.dispose();
            this.subscription = undefined;
            this.hasValue = false;
            this.value = undefined;
        }
        get() {
            if (this.subscription) {
                if (!this.hasValue) {
                    this.handleEvent(undefined);
                }
                return this.value;
            }
            else {
                // no cache, as there are no subscribers to keep it updated
                return this._getValue(undefined);
            }
        }
    }
    exports.FromEventObservable = FromEventObservable;
    (function (observableFromEvent) {
        observableFromEvent.Observer = FromEventObservable;
        function batchEventsGlobally(tx, fn) {
            let didSet = false;
            if (FromEventObservable.globalTransaction === undefined) {
                FromEventObservable.globalTransaction = tx;
                didSet = true;
            }
            try {
                fn();
            }
            finally {
                if (didSet) {
                    FromEventObservable.globalTransaction = undefined;
                }
            }
        }
        observableFromEvent.batchEventsGlobally = batchEventsGlobally;
    })(observableFromEvent || (exports.observableFromEvent = observableFromEvent = {}));
    function observableSignalFromEvent(debugName, event) {
        return new FromEventObservableSignal(debugName, event);
    }
    exports.observableSignalFromEvent = observableSignalFromEvent;
    class FromEventObservableSignal extends base_1.BaseObservable {
        constructor(debugName, event) {
            super();
            this.debugName = debugName;
            this.event = event;
            this.handleEvent = () => {
                (0, base_1.transaction)((tx) => {
                    for (const o of this.observers) {
                        tx.updateObserver(o, this);
                        o.handleChange(this, undefined);
                    }
                }, () => this.debugName);
            };
        }
        onFirstObserverAdded() {
            this.subscription = this.event(this.handleEvent);
        }
        onLastObserverRemoved() {
            this.subscription.dispose();
            this.subscription = undefined;
        }
        get() {
            // NO OP
        }
    }
    function observableSignal(debugNameOrOwner) {
        if (typeof debugNameOrOwner === 'string') {
            return new ObservableSignal(debugNameOrOwner);
        }
        else {
            return new ObservableSignal(undefined, debugNameOrOwner);
        }
    }
    exports.observableSignal = observableSignal;
    class ObservableSignal extends base_1.BaseObservable {
        get debugName() {
            return (0, base_1.getDebugName)(this, this._debugName, undefined, this._owner) ?? 'Observable Signal';
        }
        constructor(_debugName, _owner) {
            super();
            this._debugName = _debugName;
            this._owner = _owner;
        }
        trigger(tx, change) {
            if (!tx) {
                (0, base_1.transaction)(tx => {
                    this.trigger(tx, change);
                }, () => `Trigger signal ${this.debugName}`);
                return;
            }
            for (const o of this.observers) {
                tx.updateObserver(o, this);
                o.handleChange(this, change);
            }
        }
        get() {
            // NO OP
        }
    }
    function debouncedObservable(observable, debounceMs, disposableStore) {
        const debouncedObservable = (0, base_1.observableValue)('debounced', undefined);
        let timeout = undefined;
        disposableStore.add((0, autorun_1.autorun)(reader => {
            /** @description debounce */
            const value = observable.read(reader);
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                (0, base_1.transaction)(tx => {
                    debouncedObservable.set(value, tx);
                });
            }, debounceMs);
        }));
        return debouncedObservable;
    }
    exports.debouncedObservable = debouncedObservable;
    function wasEventTriggeredRecently(event, timeoutMs, disposableStore) {
        const observable = (0, base_1.observableValue)('triggeredRecently', false);
        let timeout = undefined;
        disposableStore.add(event(() => {
            observable.set(true, undefined);
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                observable.set(false, undefined);
            }, timeoutMs);
        }));
        return observable;
    }
    exports.wasEventTriggeredRecently = wasEventTriggeredRecently;
    /**
     * This makes sure the observable is being observed and keeps its cache alive.
     */
    function keepObserved(observable) {
        const o = new KeepAliveObserver(false, undefined);
        observable.addObserver(o);
        return (0, lifecycle_1.toDisposable)(() => {
            observable.removeObserver(o);
        });
    }
    exports.keepObserved = keepObserved;
    (0, base_1._setKeepObserved)(keepObserved);
    /**
     * This converts the given observable into an autorun.
     */
    function recomputeInitiallyAndOnChange(observable, handleValue) {
        const o = new KeepAliveObserver(true, handleValue);
        observable.addObserver(o);
        if (handleValue) {
            handleValue(observable.get());
        }
        else {
            observable.reportChanges();
        }
        return (0, lifecycle_1.toDisposable)(() => {
            observable.removeObserver(o);
        });
    }
    exports.recomputeInitiallyAndOnChange = recomputeInitiallyAndOnChange;
    (0, base_1._setRecomputeInitiallyAndOnChange)(recomputeInitiallyAndOnChange);
    class KeepAliveObserver {
        constructor(_forceRecompute, _handleValue) {
            this._forceRecompute = _forceRecompute;
            this._handleValue = _handleValue;
            this._counter = 0;
        }
        beginUpdate(observable) {
            this._counter++;
        }
        endUpdate(observable) {
            this._counter--;
            if (this._counter === 0 && this._forceRecompute) {
                if (this._handleValue) {
                    this._handleValue(observable.get());
                }
                else {
                    observable.reportChanges();
                }
            }
        }
        handlePossibleChange(observable) {
            // NO OP
        }
        handleChange(observable, change) {
            // NO OP
        }
    }
    function derivedObservableWithCache(computeFn) {
        let lastValue = undefined;
        const observable = (0, derived_1.derived)(reader => {
            lastValue = computeFn(reader, lastValue);
            return lastValue;
        });
        return observable;
    }
    exports.derivedObservableWithCache = derivedObservableWithCache;
    function derivedObservableWithWritableCache(owner, computeFn) {
        let lastValue = undefined;
        const counter = (0, base_1.observableValue)('derivedObservableWithWritableCache.counter', 0);
        const observable = (0, derived_1.derived)(owner, reader => {
            counter.read(reader);
            lastValue = computeFn(reader, lastValue);
            return lastValue;
        });
        return Object.assign(observable, {
            clearCache: (transaction) => {
                lastValue = undefined;
                counter.set(counter.get() + 1, transaction);
            },
        });
    }
    exports.derivedObservableWithWritableCache = derivedObservableWithWritableCache;
    /**
     * When the items array changes, referential equal items are not mapped again.
     */
    function mapObservableArrayCached(owner, items, map, keySelector) {
        let m = new ArrayMap(map, keySelector);
        const self = (0, derived_1.derivedOpts)({
            debugName: () => (0, base_1.getDebugName)(m, undefined, map, owner),
            owner,
            onLastObserverRemoved: () => {
                m.dispose();
                m = new ArrayMap(map);
            }
        }, (reader) => {
            m.setItems(items.read(reader));
            return m.getItems();
        });
        return self;
    }
    exports.mapObservableArrayCached = mapObservableArrayCached;
    class ArrayMap {
        constructor(_map, _keySelector) {
            this._map = _map;
            this._keySelector = _keySelector;
            this._cache = new Map();
            this._items = [];
        }
        dispose() {
            this._cache.forEach(entry => entry.store.dispose());
            this._cache.clear();
        }
        setItems(items) {
            const newItems = [];
            const itemsToRemove = new Set(this._cache.keys());
            for (const item of items) {
                const key = this._keySelector ? this._keySelector(item) : item;
                let entry = this._cache.get(key);
                if (!entry) {
                    const store = new lifecycle_1.DisposableStore();
                    const out = this._map(item, store);
                    entry = { out, store };
                    this._cache.set(key, entry);
                }
                else {
                    itemsToRemove.delete(key);
                }
                newItems.push(entry.out);
            }
            for (const item of itemsToRemove) {
                const entry = this._cache.get(item);
                entry.store.dispose();
                this._cache.delete(item);
            }
            this._items = newItems;
        }
        getItems() {
            return this._items;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL29ic2VydmFibGVJbnRlcm5hbC91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEc7O09BRUc7SUFDSCxTQUFnQixlQUFlLENBQUksS0FBUTtRQUMxQyxPQUFPLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFGRCwwQ0FFQztJQUVELE1BQU0sZUFBbUIsU0FBUSwyQkFBNkI7UUFDN0QsWUFBNkIsS0FBUTtZQUNwQyxLQUFLLEVBQUUsQ0FBQztZQURvQixVQUFLLEdBQUwsS0FBSyxDQUFHO1FBRXJDLENBQUM7UUFFRCxJQUFvQixTQUFTO1lBQzVCLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFTSxHQUFHO1lBQ1QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFDTSxXQUFXLENBQUMsUUFBbUI7WUFDckMsUUFBUTtRQUNULENBQUM7UUFDTSxjQUFjLENBQUMsUUFBbUI7WUFDeEMsUUFBUTtRQUNULENBQUM7UUFFUSxRQUFRO1lBQ2hCLE9BQU8sVUFBVSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNEO0lBR0QsU0FBZ0IscUJBQXFCLENBQUksT0FBbUI7UUFDM0QsTUFBTSxVQUFVLEdBQUcsSUFBQSxzQkFBZSxFQUFnQixjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3RCLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sVUFBVSxDQUFDO0lBQ25C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